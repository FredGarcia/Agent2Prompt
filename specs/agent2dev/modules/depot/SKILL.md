---
name: depot
description: Seul écrivain d'Agent2Dev dans un arbre du projet (arbre de travail de la demande, copie de travail par défaut ou arbre de la demande sur autorisation, copie clonée depuis l'arbre de la demande et mise à jour sans le toucher, un patch par commit de la copie, présence des patchs vérifiée, fichiers exclus et protégés, modifications « avant / après » appliquées d'un tenant, détection de toute écriture étrangère, recherches en lecture seule, liste fermée des commandes git par arbre, commit au format du skill et règles des hooks du kit, jamais de poussée, validations explicites, changesets existants intouchables, garde statique, mode parallèle). À implémenter au lot 3.
dimensions: [D5]
status: active
---

# Module `depot` (D5)

Le `depot` est le seul agent qui écrit dans un arbre du projet : il y cherche, y écrit, y lit l'état git, y commite et en tire les patchs. Il reprend la vérification « avant / après » d'`agents-modif`, qui appliquait déjà ses modifications sur une copie.

## 1. Deux arbres (D5.INV-1, D5.INV-7)

| Arbre | Ce que c'est | Ce qu'Agent2Dev y fait |
|---|---|---|
| arbre de la demande | la branche de travail du développeur, ou, en mode parallèle, le worktree que le kit a créé pour la demande | lire ; écrire, seulement si la configuration humaine autorise l'écriture du code |
| copie de travail | un clone local de l'arbre de la demande, dans `<copies>/<CLÉ>/`, sur une branche `a2d/<CLÉ>` propre à la copie | écrire, compiler, tester, commiter, former les patchs |

L'arbre de travail est celui où le `depot` écrit et où l'`executant` lance les commandes du profil. La configuration humaine en décide (module `exploitation`) :

```json
{ "ecritureCode": { "autorisee": false, "reference": "", "par": "" } }
```

- `autorisee` vaut `false` par défaut : l'arbre de travail est la copie de travail, et Agent2Dev n'écrit rien dans l'arbre de la demande, hors des fichiers de travail que le kit exclut du dépôt (`travail/`, en mode parallèle).
- `autorisee` vaut `true`, avec la référence de l'autorisation et son auteur : l'arbre de travail est l'arbre de la demande. Sans référence ni auteur, Agent2Dev ne démarre pas.
- Le mode est fixé à l'entrée de la demande, et figure au livrable : un changement de la configuration humaine ne vaut que pour les demandes suivantes.

Dans l'un et l'autre :

- chaque chemin est résolu par `realpath` ; un chemin qui sort de la racine de l'arbre, y compris par lien symbolique, est refusé `DEPOT_HORS_RACINE` ;
- les fichiers exclus du profil (secrets) ne sont ni lus ni écrits ; les fichiers protégés (`.git/`, CI, hooks et règles du kit) ne sont jamais écrits : `DEPOT_FICHIER_PROTEGE` ;
- les fichiers de travail de la demande (`demande.json`, images, scripts du skill, `impact.txt`, patchs, rapport) vont dans son dossier de travail : `<sortie>/<CLÉ>/` hors mode parallèle ; en mode parallèle, `travail/` du worktree, selon la disposition du skill (`agent-tdd-jira:D9.INV-1`).

`<sortie>` et `<copies>` sont les dossiers de l'instance, `~/.agent2dev/sortie/` et `~/.agent2dev/copies/` par défaut (module `exploitation`, section 2).

## 2. Copie de travail (D5.INV-7)

**Création.** Après V1, avant la première écriture de la demande :

1. `git clone --local --no-hardlinks <arbre de la demande> <copies>/<CLÉ>`, puis, dans la copie, `git switch -c a2d/<CLÉ>` : la copie part du commit courant de l'arbre de la demande ;
2. les fichiers non suivis que le profil déclare nécessaires aux tests (`copie.fichiersLocaux`, module `profil`) sont recopiés, sauf s'ils sont exclus comme secrets ; ils ne sont jamais indexés (section 7) ;
3. l'`executant` lance `installer-front` dans la copie, si le profil la porte.

Les modifications non commitées de l'arbre de la demande ne sont pas dans la copie : la réalisation les signale au développeur avant le premier scénario.

En mode parallèle, la copie est clonée depuis le worktree de la demande. C'est un dépôt à part, dans les données d'Agent2Dev, et non un worktree du projet : `git worktree` reste interdit (`agent-tdd-jira:D9.INV-2`), et, dans le dépôt du projet, Agent2Dev n'écrit que dans le worktree de sa demande, sous `travail/` (`agent-tdd-jira:D9.INV-1`).

**Patchs.** Chaque commit de la copie (section 7) devient un patch : `git format-patch -1 --stdout <commit>`, rangé dans `<dossier de travail>/patchs/<nnn>-<objet>.patch`, où `nnn` est son rang de remise (`001`, `002`…) et `objet` vaut `Snn`, `Snn-correction` ou `demande` pour un commit hors scénario. Le développeur les applique lui-même, dans l'ordre, dans l'arbre de la demande :

```bash
git am -3 ~/.agent2dev/sortie/ECR-77/patchs/*.patch
```

`git am` garde le message `<CLÉ> Snn : …` et passe un patch déjà appliqué (« No changes -- Patch already applied. ») : la commande se relance sans risque. Le développeur peut appliquer les patchs au fil des acceptations, ou en une fois avant la remise : la mise à jour de la copie s'accommode des deux.

**Mise à jour.** Avant chaque scénario, avant la remise à Agent2Test et avant V5, dans la copie seulement :

1. `git fetch origin HEAD`, qui rapporte le commit courant de l'arbre de la demande, même sur une tête détachée ; le `depot` vérifie que `FETCH_HEAD` égale le commit que `rev-parse HEAD` relève dans l'arbre de la demande, puis lance `git rebase <ce commit>` : les patchs que le développeur a appliqués sortent de la branche `a2d/<CLÉ>`, les autres sont rejoués par-dessus ;
2. un conflit annule le rebase (`git rebase --abort`) et se présente au développeur, avec les commits en cause ;
3. si l'arbre de la copie diffère, après la mise à jour, de ce qu'il était avant, l'arbre de la demande a apporté autre chose que les patchs : les suites sont relancées avant la suite du travail, et toute régression est signalée (`agent-tdd-jira:D9.INV-7`).

**Présence des patchs** (D10.INV-1). Après une mise à jour, les commits qui restent sur `a2d/<CLÉ>` au-delà du commit de l'arbre de la demande sont les patchs non appliqués : `depot.patchsManquants()` les nomme. Quand des patchs manquent à la remise, ou après un conflit, le développeur choisit :

- **appliquer** les patchs manquants lui-même, puis relancer la vérification ;
- **mon arbre fait foi**, commentaire obligatoire : la copie est recréée depuis son commit, comme à sa création (le `depot` supprime `<copies>/<CLÉ>/`, clone de nouveau, et l'`executant` relance `installer-front`) ; les patchs remis restent dans le dossier de travail, le choix est journalisé avec les patchs qu'il écarte, et les suites sont relancées.

La copie reste jusqu'à la purge de la demande (module `donnees`, section 3).

## 3. Modifications (D5.INV-2)

Toute écriture vient d'une sortie validée d'une fiche, ou d'un rendu déterministe d'Agent2Dev (le choix de variantes dans `suivi.md`, par exemple) :

```json
{
  "modifications": [
    { "fichier": "back/src/main/java/fr/exemple/feedback/FeedbackCsv.java", "avant": "    return lignes;\n", "apres": "    return BOM + String.join(\";\", lignes);\n" },
    { "creer": "back/src/test/java/fr/exemple/feedback/FeedbackCsvTest.java", "contenu": "…" },
    { "supprimer": "front/src/app/features/feedback/ancien-export.ts", "motif": "remplacé par feedback-export.ts" }
  ]
}
```

- Chaque bloc `avant` doit apparaître exactement une fois dans le contenu courant du fichier ; un fichier à créer ne doit pas exister ; un fichier à supprimer doit exister.
- Les documents de la demande, sous `docs/demandes/<CLÉ>/` seulement (`us.md`, le fichier Gherkin, `suivi.md`), se réécrivent en entier : `{ "remplacer": "docs/demandes/ECR-77/us.md", "contenu": "…" }`. Ailleurs, `remplacer` est refusé.
- Après V2, `us.md` et le fichier Gherkin ne s'écrivent plus que dans une nouvelle analyse, qui repasse par V2 (D7.INV-4).
- Toutes les vérifications passent d'abord, puis toutes les écritures : un pas s'applique d'un tenant ou pas du tout. Une écriture qui échoue en cours de route restaure les fichiers déjà touchés.
- Avant d'écrire, le `depot` garde dans ses données le contenu antérieur de chaque fichier du pas. Si le processus s'arrête au milieu d'un pas, il les restaure à la reprise, et le pas repart de son début (D12.INV-4).
- Un écart (bloc absent ou ambigu, fichier présent ou absent) n'applique rien et revient au moteur avec le contenu courant, dans le budget du pas (`budget.tentativesSortie`).
- Le `depot` publie `depot.ecrit` avec l'arbre, la liste des fichiers et l'empreinte de chacun après écriture.

## 4. Écriture étrangère (D5.INV-3)

Avant et après chacun de ses pas, le `depot` relève l'état de l'arbre de travail : `git --no-optional-locks status --porcelain=v1 -z --untracked-files=all` et l'empreinte de chaque fichier modifié ou nouveau. L'option `--no-optional-locks` empêche git de réécrire son index au passage.

Entre deux pas, l'état attendu est l'état précédent, plus les écritures du `depot`. Toute autre différence (un fichier modifié par l'IDE, par l'agent de l'IDE, par le développeur ou par un autre outil) publie `depot.ecriture_etrangere` avec les fichiers en cause. L'`orchestrateur` arrête la demande et présente l'écart ; le développeur décide :

- **intégrer** : la modification devient la sienne, elle figure au livrable comme telle, et la demande reprend ;
- **retirer** : il la retire lui-même, puis la demande reprend après un nouveau relevé.

Le `depot` ne défait jamais lui-même une modification qu'il n'a pas faite. Quand l'arbre de travail est la copie, ce que le développeur fait dans son arbre ne relève pas de cette détection : il le retrouve à la mise à jour (section 2). Quand l'écriture est autorisée, un arbre de la demande propre dont le commit a changé entre deux scénarios est une synchronisation ou un commit du développeur, pas une écriture étrangère : les suites sont relancées avant le scénario suivant, et toute régression est signalée (`agent-tdd-jira:D9.INV-7`). Pendant un scénario, le même changement est une écriture étrangère.

## 5. Recherches et git

```js
depot.chercher({ arbre, motif, inclure, exclure, max })   // → [{ fichier, ligne, texte }]
depot.etat({ arbre })                                      // fichiers modifiés, nouveaux, supprimés ; commit HEAD ; branche
depot.journal({ arbre, grep })                             // commits dont le message correspond
depot.diff({ arbre, depuis, jusqua })                      // diff entre deux commits
depot.patchsManquants()                                    // commits de la copie absents de l'arbre de la demande
```

- `chercher` parcourt les fichiers sous la racine de l'arbre, hors exclusions, hors `.git/` et hors sorties de construction (`target/`, `node_modules/`, `dist/`, `.angular/`). C'est l'équivalent, sans shell, des recherches du skill (`grep -rn …`, modules `impact` et `tracabilite`). Les recherches de la conception se font dans l'arbre de travail.
- Commandes git de la liste fermée (D6.INV-1), en vecteur d'arguments, sans shell :

| Arbre | Commandes permises |
|---|---|
| arbre de la demande | `status`, `log`, `diff` entre deux commits, `show`, `rev-parse`, toutes précédées de `--no-optional-locks` ; si l'écriture est autorisée, aussi `add -- <fichiers>` et `commit -m <message>` |
| copie de travail | les mêmes, plus `clone --local --no-hardlinks` depuis l'arbre de la demande, `switch -c a2d/<CLÉ>`, `fetch origin HEAD`, `rebase <commit>`, `rebase --abort`, `format-patch -1 --stdout <commit>` |

- Dans l'arbre de la demande, `diff` ne compare que deux commits : comparée à l'index ou aux fichiers, la commande peut réécrire l'index, même avec `--no-optional-locks`.
- Jamais, dans aucun arbre : `push`, `merge`, `reset --hard`, `stash drop`, `stash clear`, `branch -D`, `worktree`, `config`, `-c`, `--no-verify`, `--force`, `--force-with-lease`. Dans l'arbre de la demande, jamais non plus `rebase`, `switch` ni `checkout <branche>` : la synchronisation et la branche appartiennent au développeur (`agent-tdd-jira:D9.INV-2`).

## 6. Validations explicites (D5.INV-5, D5.INV-6)

Avant d'appliquer, le `depot` passe les contrôles nommés suivants sur les modifications du pas :

| Contrôle | Ce qu'il détecte | Suite |
|---|---|---|
| `depot.dependance-nouvelle` | dépendance ajoutée ou montée dans `pom.xml` ou `package.json` | question au développeur ; rien n'est appliqué avant sa réponse |
| `depot.chaine-de-construction` | extension Maven, script de `package.json`, `angular.json`, enveloppe `mvnw`, configuration de tests | question au développeur |
| `depot.test-existant` | modification d'un test qui existait avant la demande | question au développeur |
| `depot.suppression` | toute suppression de fichier | question au développeur |
| `depot.changeset-existant` | modification ou suppression d'un changeset de migration existant | refus, sans question (D5.INV-6) |
| `depot.garde-statique` | `Runtime.exec`, `ProcessBuilder`, `child_process`, `eval`, `new Function`, origine réseau non déclarée | avertissement `attention`, présenté à V4 |

Une question de validation n'est pas un point du skill : c'est une attente du pas, que le développeur tranche (« autoriser » ou « refuser », commentaire obligatoire pour refuser), et que le journal consigne comme une décision (D12.INV-5). Le refus revient au moteur comme écart. Les contrôles valent dans la copie comme dans l'arbre de la demande : un patch ne porte que ce que le développeur a déjà autorisé.

## 7. Commits (D5.INV-4)

- Le `depot` indexe les seuls fichiers écrits pour le commit (`git add -- <fichiers>`, jamais `-A`), puis commite avec le message proposé, vérifié par le motif du kit : `^<CLÉ> S\d{2} : .+` pour un scénario, `^<CLÉ> : .+` hors scénario (`agent-tdd-jira:D9.INV-3`).
- Dans la copie de travail, chaque scénario accepté à V4 est commité, pour former son patch. Dans l'arbre de la demande, quand l'écriture est autorisée, le commit n'a lieu qu'après V4, et seulement si le développeur a coché « commiter ».
- Le premier commit de la demande porte aussi `docs/demandes/<CLÉ>/us.md`, le fichier Gherkin et `suivi.md` (skill, module `cycle-tdd`, section 7).
- Hors scénario, par exemple pour la correction d'une régression d'une autre demande (module `binome`, section 5), le message porte la clé seule : `<CLÉ> : …`.
- Les hooks du kit ne s'appliquent pas dans la copie, et `git am` ne lance ni `pre-commit` ni `commit-msg`. Le `depot` vérifie donc lui-même, sur chaque commit de la copie, ce que ces hooks vérifieraient : le motif du message, et qu'aucun fichier indexé ne correspond à l'expression des fichiers interdits du kit, `(^|/)(\.env|id_rsa[^/]*|[^/]*\.(pem|key|p12|jks|mht|mhtml))$|^(\.skills|travail)/` (`agents-paralleles-gitlab:D2.INV-2`, `agents-paralleles-gitlab:D2.INV-3`). La branche sur laquelle le patch s'applique reste celle que le développeur a extraite.
- Un refus d'un hook du kit (« REFUS : … ») arrête l'action : le `depot` le cite au développeur et ne le contourne jamais (`agent-tdd-jira:D9.INV-4`).
- Le `depot` ne pousse jamais, en aucun mode, depuis aucun arbre : la publication appartient au développeur.

## 8. Pièges connus

- **`git add -A`** : il indexerait les fichiers du développeur et les fichiers de travail ; on indexe la liste exacte du commit.
- **Construire dans l'arbre de la demande sans autorisation** : `./mvnw verify` y écrirait `target/` ; sans autorisation, toute commande du profil tourne dans la copie.
- **Copie sans les fichiers locaux** : une configuration non suivie, nécessaire aux tests, manque au clone ; le profil la déclare, et la ratification en V0 la valide.
- **Husky au `npm ci`** : il écrirait `core.hooksPath` ; l'environnement de l'`executant` porte `HUSKY=0` (module `executant`).
- **Patch réécrit par le développeur** : le rebase de la copie bute sur lui ; le conflit se présente, et le développeur tranche.
- **Bloc « avant » trop court** : une ligne `}` apparaît partout ; la vérification d'unicité le refuse, le moteur doit citer un bloc plus large.
- **Défaire une écriture étrangère** : jamais par le système ; c'est peut-être le travail du développeur.
- **Fins de ligne** : un fichier en CRLF reste en CRLF ; la comparaison des blocs se fait sur le contenu tel qu'il est lu, sans conversion.

## 9. Tests (scénarios)

Les essais de la copie de travail portent sur un vrai dépôt git du projet de démonstration, créé par le test, avec un worktree pour le mode parallèle.

| Scénario | Vérifie | Cas |
|---|---|---|
| DP1 | D5.INV-1 | `../secret.txt` et un lien symbolique vers l'extérieur sont refusés `DEPOT_HORS_RACINE` ; `.gitlab-ci.yml` est refusé `DEPOT_FICHIER_PROTEGE` |
| DP2 | D5.INV-1 | un fichier exclu du profil (`.env`) n'est ni lu par `chercher`, ni écrit, ni recopié dans la copie |
| DP3 | D5.INV-2 | un bloc « avant » présent deux fois n'applique rien ; l'écart revient au moteur avec le contenu courant |
| DP4 | D5.INV-2 | un pas à trois modifications dont la troisième échoue laisse les trois fichiers inchangés |
| DP5 | D5.INV-3 | un fichier de l'arbre de travail modifié par un autre processus entre deux pas publie `depot.ecriture_etrangere` et arrête la demande |
| DP6 | D5.INV-3 | après « intégrer », la demande reprend et le livrable mentionne la modification du développeur |
| DP7 | D5.INV-4 | écriture autorisée : sans la case « commiter » à V4, aucun commit ; avec elle, un commit `ECR-77 S01 : …` qui ne contient que les fichiers du scénario |
| DP8 | D5.INV-4 | `push` et `worktree` sont refusés dans les deux arbres ; `rebase`, `switch` et un `diff` comparé aux fichiers sont refusés dans l'arbre de la demande |
| DP9 | D5.INV-4 | écriture autorisée, en mode parallèle : un refus « REFUS : » du hook `commit-msg` arrête l'action, et le message est présenté tel quel |
| DP10 | D5.INV-5 | une dépendance ajoutée au `pom.xml` attend l'autorisation ; refusée, elle revient au moteur comme écart |
| DP11 | D5.INV-5 | la modification d'un test existant et une suppression attendent l'autorisation |
| DP12 | D5.INV-6 | la modification d'un changeset Liquibase existant est refusée sans question ; un changeset nouveau passe |
| DP13 | D5.INV-1 | en mode parallèle, `demande.json`, les scripts et les patchs vont dans `travail/`, et rien d'autre n'est écrit dans le worktree |
| DP14 | D5.INV-7 | sans autorisation, une demande simulée de deux scénarios laisse l'arbre de la demande identique octet pour octet, `.git` compris, même avec une modification non commitée du développeur, et remet deux patchs |
| DP15 | D5.INV-7 | les deux patchs s'appliquent par `git am -3`, dans l'ordre, avec leurs messages `ECR-77 S01 : …` et `ECR-77 S02 : …` ; relancée, la commande ne change rien |
| DP16 | D5.INV-7 | après l'application de S01 seul et un commit du développeur, la mise à jour retire S01 de la copie, rejoue S02, relance les suites, et `patchsManquants` nomme S02 |
| DP17 | D5.INV-7 | un patch réécrit par le développeur fait échouer le rebase : la copie reste intacte, le conflit se présente ; « mon arbre fait foi » recrée la copie et journalise le patch écarté |
| DP18 | D5.INV-4 | un commit de la copie dont le message est hors motif, ou qui indexe `travail/ECR-77/demande.json` ou `.env`, est refusé avant de former un patch |
| DP19 | D5.INV-7 | `ecritureCode.autorisee` à `true` sans référence ni auteur empêche le démarrage |
| DP20 | D5.INV-2 | un processus arrêté entre deux écritures d'un pas retrouve, à la reprise, les fichiers dans leur état d'avant le pas |
| DP21 | D5.INV-7 | une demande ouverte sans autorisation, reprise après un redémarrage avec `autorisee` à `true`, reste en copie de travail ; la demande suivante écrit dans l'arbre de la demande |

## 10. Fichiers à produire

- `src/agents/depot/agent.js`, `src/agents/depot/arbres.js`, `src/agents/depot/copie.js`, `src/agents/depot/patchs.js`
- `src/agents/depot/confinement.js`, `src/agents/depot/modifications.js`, `src/agents/depot/etat.js`
- `src/agents/depot/recherche.js`, `src/agents/depot/git.js`, `src/agents/depot/controles.js`
- `schemas/modifications.json`
- `test/depot/*.test.js`, `test/fixtures/projet/` (dépôt git créé par les tests)
