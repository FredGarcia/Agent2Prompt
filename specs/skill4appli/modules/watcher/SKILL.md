---
name: watcher
description: Watcher de la branche courante chargée dans un worktree dédié (miroir créé détaché et verrouillé dans le dossier commun git, scrutation de HEAD sans événement du système de fichiers, synchronisation incrémentale par diff entre commits, changement de branche, références, événements JSON, verrou d'écrivain unique et reprise d'un verrou orphelin, arrêt propre par watch-stop sur toutes les plateformes, miroir modifié à la main jamais forcé, retrait du seul miroir, lancement en arrière-plan sous Linux et sous Windows, disposition du kit). À lire avant de lancer watch, watch-stop ou mirror-remove.
dimensions: [D6]
status: active
---

# Module `watcher` (D6)

Phases 7E couvertes : Espace, Engendrent, Évolutif.

## 1. Principe

Le watcher suit la branche courante du worktree source, celui où travaillent le développeur ou un agent. Il la charge dans un worktree dédié, le miroir, et tient la base à jour commit après commit. La base reflète ainsi un état commité cohérent, que le travail en cours ne trouble pas, et le watcher n'écrit jamais dans le worktree source.

Le miroir est en HEAD détachée : git refuse d'extraire une même branche dans deux worktrees, règle que le kit `agents-paralleles-gitlab` érige en invariant (`agents-paralleles-gitlab:D1.INV-1`). Le miroir n'extrait aucune branche ; il se place sur le commit de la branche courante.

## 2. Miroir (D6.INV-1)

```bash
git -C <source> worktree add --detach --lock --reason "skill4appli : miroir de <source>" <commun>/skill4appli/<id>/miroir <commit>
```

- **Verrouillé** : `git worktree prune` ne l'élague pas, et il ne peut être ni déplacé ni retiré par erreur.
- **Dossier disparu, entrée encore enregistrée** : seule cette entrée est recréée (`git worktree add -f -f` sur ce chemin). Le watcher ne lance jamais `git worktree prune`, qui toucherait d'autres worktrees.
- **Dossier présent qui n'est pas un worktree** : code 3 ; le développeur le retire à la main.
- **Lecture seule de la source** : le watcher lit HEAD, la branche courante et les références du worktree source ; il ne le modifie pas, ne réécrit pas son index (`GIT_OPTIONAL_LOCKS=0`) et ne touche à aucune branche.
- **Pas un lieu de travail** : personne ne modifie, ne construit ni ne commite dans le miroir (§ 6).

## 3. Cycle de scrutation (D6.INV-2)

À chaque intervalle (`--interval`, 2 000 ms par défaut, 500 au minimum), le watcher lance `git rev-parse HEAD --abbrev-ref HEAD` sur la source, puis :

| Constat | Action | Événement |
|---|---|---|
| base jamais indexée, d'un autre mode ou d'un autre miroir | miroir amené sur le commit, inventaire du miroir, réindexation complète | `indexation_complete` |
| nouveau commit (HEAD différent du commit indexé) | miroir amené sur le commit ; `git diff --name-status -z --no-renames <ancien> <nouveau>` ; seuls ces fichiers sont relus | `synchro` |
| ancien commit introuvable (historique réécrit) | réindexation complète | `indexation_complete` |
| même commit, autre branche courante | instantané et branches mis à jour, aucun fichier relu | `branche` |
| références changées (fetch, branche créée), repérées par une empreinte de `for-each-ref` | `git_branches` et `branch_files` relus | `refs` |
| rien de changé | rien | aucun ; `a_jour` avec `--once` |

- Fichiers, instantané et branches s'écrivent dans une seule transaction. Le miroir est amené sur le commit avant la transaction ; si elle échoue, le cycle suivant refait le même diff : la synchronisation est rejouable.
- La scrutation n'attend aucun événement du système de fichiers : elle fonctionne de même sous WSL2 sur `/mnt/c` et sur un partage réseau.
- Source en HEAD détachée : le miroir suit le commit ; la branche indexée vaut `(détachée)`.
- `--once` : une seule synchronisation, puis sortie ; utile en recette, en CI, ou pour rattraper une base en retard sans watcher continu.

## 4. Événements (E3)

Une ligne JSON par événement sur la sortie standard, avec `t` (date ISO) et `evenement` :

| `evenement` | Champs |
|---|---|
| `demarrage` | `source`, `miroir`, `miroir_cree`, `intervalle_ms`, `pid` |
| `indexation_complete` | `branche`, `commit`, `fichiers`, `ajoutes`, `modifies`, `inchanges`, `supprimes`, `duree_ms` |
| `synchro` | `branche`, `de`, `a`, `ajoutes`, `modifies`, `supprimes`, `duree_ms` |
| `branche` | `de`, `a`, `commit` |
| `refs` | `branches`, `locales`, `distantes`, `courante`, `base`, `fichiers_de_branches` |
| `erreur` | `message` ; le cycle suivant réessaie |
| `arret` | `raison` : `watch-stop`, ou le signal reçu (`SIGINT`, `SIGTERM`, `SIGHUP`, `SIGBREAK`) |
| `a_jour` | `branche`, `commit` ; seulement avec `--once` |

```text
{"t":"2026-10-23T19:32:00.987Z","evenement":"synchro","branche":"feature/ECR-77-export","de":"730c08fb…","a":"110e5ed4…","ajoutes":1,"modifies":0,"supprimes":0,"duree_ms":128}
```

Mesure, sur 3 000 fichiers : indexation complète du miroir en 0,96 s, synchronisation d'un commit d'un fichier en 0,13 s.

## 5. Un seul écrivain (D6.INV-3)

- Au démarrage, le watcher crée `memoire.db.watch.lock` en mode exclusif, avec son PID, sa date de démarrage, la source et son intervalle.
- Tant que ce processus vit, `ingest`, `git-scan`, `mirror-remove` et un second `watch` sortent avec le code 4. Les lecteurs ne sont pas gênés : la base est en mode WAL.
- Un verrou dont le processus n'existe plus (arrêt brutal, redémarrage de la machine) est repris par le `watch` suivant.

**Arrêt propre** (D12.INV-3) : le watcher finit son cycle, écrit `arret` avec sa raison, ferme la base, libère le verrou et sort avec le code 0.

- **`watch-stop`**, sur toutes les plateformes : la commande écrit `memoire.db.watch.stop` avec le PID du watcher actif, puis attend que le verrou soit libéré, au plus trois intervalles et 5 s ; au-delà, code 4. Le watcher regarde cette demande toutes les 250 ms. Une demande qui vise un autre PID est ignorée, et une demande antérieure au démarrage du watcher est effacée. Sans watcher actif, `watch-stop` rend `"arrete": false`.
- **Signaux** : `SIGINT` (Ctrl+C), `SIGTERM` et `SIGHUP` sous Linux et WSL2 ; Ctrl+C, Ctrl+Pause (`SIGBREAK`) et la fermeture de la console sous Windows. Un second signal du même type arrête aussitôt le processus ; le verrou laissé est repris ensuite.
- Sous Windows, terminer un processus (`taskkill /F`, gestionnaire des tâches, `kill` de Node) ne lui transmet aucun signal : c'est un arrêt brutal. `watch-stop` est l'arrêt propre commun.

## 6. Miroir modifié à la main (D6.INV-4)

Avant chaque déplacement, le watcher lance `git -C <miroir> status --porcelain --untracked-files=no`. Une modification arrête le watcher avec le code 7 ; `details.fichiers` nomme les fichiers en cause et le miroir reste tel quel. Il en va de même si une branche y a été extraite. Au démarrage, la même vérification a lieu.

Résolution, par le développeur : examiner le miroir, récupérer ce qui doit l'être, puis `mirror-remove --force`. Le `watch` suivant recrée le miroir et réindexe.

## 7. Retirer le miroir (D6.INV-5)

`mirror-remove` refuse tant qu'un watcher est actif (code 4), et refuse un miroir modifié à la main sans `--force` (code 7). Sinon : `git worktree unlock`, puis `git worktree remove` de ce seul chemin, situé sous `<commun>/skill4appli/`. La base est gardée et `mirror_path` vidé ; le `watch` suivant réindexe tout. Aucun autre worktree n'est touché.

## 8. Lancer le watcher

Linux et WSL2, depuis le worktree source :

```bash
# au premier plan, dans un terminal dédié
node .skills/skill4appli/scripts/app_db.mjs watch
# en arrière-plan, événements dans un journal, à côté de la base
nohup node .skills/skill4appli/scripts/app_db.mjs watch >> "$(git rev-parse --git-common-dir)/skill4appli/watch.log" 2>&1 &
# arrêt propre
node .skills/skill4appli/scripts/app_db.mjs watch-stop
```

Windows, dans CMD ou un fichier `.bat`, depuis le worktree source. Le bloc est en ASCII pur, commentaires compris, pour se coller tel quel dans un `.bat` :

```bat
REM au premier plan, dans une console dediee
node .skills\skill4appli\scripts\app_db.mjs watch
REM en arriere-plan, console reduite, evenements dans un journal a cote de la base
start "skill4appli watch" /min cmd /c "node .skills\skill4appli\scripts\app_db.mjs watch >> .git\skill4appli\watch.log 2>&1"
REM arret propre
node .skills\skill4appli\scripts\app_db.mjs watch-stop
```

Dans la disposition du kit, le dossier commun est `..\.bare` et le skill `..\.skills\skill4appli`. Les événements sont en UTF-8 : `chcp 65001` les affiche correctement dans la console.

Un agent qui sait suivre une commande longue peut consommer les événements ligne par ligne. Dans la disposition du kit `agents-paralleles-gitlab`, chaque worktree de demande a son watcher et son miroir ; avant `agt done`, lancer `mirror-remove` depuis le worktree de la demande, faute de quoi le miroir, verrouillé, reste dans `.bare/skill4appli/`.

## 9. Pièges connus

- **Construire dans le miroir** : des fichiers non suivis peuvent bloquer le déplacement (« would be overwritten ») ; le watcher écrit alors `erreur` à chaque cycle. Retirer le miroir par `mirror-remove --force`.
- **Disque** : un miroir est une copie complète des fichiers suivis ; un worktree évite de recopier l'historique, pas les fichiers.
- **Nettoyage de git** : le commit indexé reste joignable par le HEAD du miroir ; `git gc` ne le supprime pas.
- **Intervalle** : 2 s suffisent à suivre un développeur ; 500 ms coûtent deux processus git par demi-seconde.

## 10. Contrôle de sortie

- Miroir dédié, détaché, verrouillé ; source, index et branches intacts (D6.INV-1) : T18.
- Seuls les fichiers changés relus ; branche suivie ; en continu, arrêt propre (D6.INV-2) : T19, T20.
- Un seul écrivain, verrou orphelin repris (D6.INV-3) : T21.
- Arrêt propre par `watch-stop` sur toutes les plateformes, demandes périmées ou étrangères ignorées (D12.INV-3) : T30.
- Miroir modifié jamais écrasé, au démarrage comme en continu (D6.INV-4) : T22, T22b.
- Seul le miroir retiré, sur commande (D6.INV-5) : T22, T23.
