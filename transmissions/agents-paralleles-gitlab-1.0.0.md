# Agents en parallèle sur GitLab : spécification 1.0.0, transmission texte

Ce texte contient à la fois la consigne de travail et la spécification complète. Il n'y a aucune pièce jointe. La spécification est découpée en fichiers, chacun délimité ainsi :

    <<<FICHIER chemin/relatif>>>
    ...contenu exact du fichier...
    <<<FIN chemin/relatif>>>

---

Tu vas mettre en place, pour le développeur, le kit décrit par cette spécification : un dépôt nu partagé, un worktree par demande Jira, des hooks communs, le script `agt`, la recette, et la fiche des garde-fous GitLab. La spécification fait foi. Si tu relèves un écart ou une ambiguïté, signale-le au développeur. Ne corrige pas la spécification toi-même.

## Étape 0 : matérialiser la spécification

1. Demande au développeur le dossier racine du kit (par exemple `~/dev/<projet>/`). Crée-y `.skills/agents-paralleles-gitlab/`, hors de tout worktree.
2. Pour chaque bloc `<<<FICHIER chemin>>>` … `<<<FIN chemin>>>`, crée le fichier `chemin` dans ce dossier, avec le contenu exact compris entre les deux lignes délimitrices. Ces deux lignes ne font pas partie du fichier. Ne reformule rien, ne traduis rien, ne complète rien.
3. Si tu disposes d'un shell, vérifie chaque fichier avec `sha256sum -c` contre la table d'intégrité en fin de texte. Signale tout écart avant de continuer.
4. Le dossier `archives/` cité par `manifest.json` n'est pas transmis. Ne le recrée pas.

## Étape 1 : lecture, sans rien installer

Lis `SKILL.md` en entier, puis `manifest.json`, puis les modules actifs dans l'ordre : `isolation`, `hooks`, `orchestration`, `gitlab`, `distribution`, `recette`. Ne lis `modules/controle-gitlab/SKILL.md` et `modules/tension-depot/SKILL.md` que pour comprendre les points d'extension E1 et E2 : ces dimensions sont réservées.

## Étape 2 : cadrage, sans rien installer

Obtiens du développeur, puis reformule dans une fiche de cadrage :

- l'URL SSH du dépôt GitLab, et s'il faut créer un dépôt nu neuf ou partir d'un clone existant (module `isolation`, section 2) ;
- le nom de la branche d'intégration (`develop` par défaut, sinon `AGT_BASE`) ;
- l'édition GitLab (Free, Premium ou Ultimate), qui fixe les garde-fous disponibles (module `gitlab`) ;
- les points chauds propres au projet, s'ils diffèrent de ceux par défaut (`AGT_POINTS_CHAUDS`, module `distribution`) ;
- la présence de Husky ou d'un outil qui réécrit `core.hooksPath` (module `hooks`, section 5).

Attends la confirmation du développeur avant toute écriture.

## Étape 3 : installation

1. Crée ou convertis la disposition du module `isolation`.
2. Écris les six fichiers du kit à l'identique depuis les modules `hooks`, `orchestration`, `gitlab` et `recette`, puis compare-les aux blocs des modules.
3. Lance `recette.sh` sur un dossier de test, avec `.bare/` comme dépôt source : il n'est que lu. Les 44 contrôles doivent réussir.
4. Lance `./agt ls` : « hooks : actifs », aucune ALERTE.
5. Remplis la fiche du module `gitlab` selon l'édition, pour le Maintainer. Tu ne configures pas GitLab toi-même.

## Règles qui ne se négocient pas

- Aucune écriture dans GitLab. Aucun jeton demandé, lu ou écrit. Si le développeur colle un jeton dans la conversation, signale-le et recommande de le révoquer.
- Aucun `--force`, aucun `--force-with-lease`, aucune réécriture d'un commit publié.
- Le code du kit est reproduit à l'identique ; une adaptation passe par les variables d'environnement.
- Aucune commande destructive sur le dépôt du développeur : `recette.sh` travaille sur des copies, dans un dossier de test.
- N'implémente aucune dimension au statut `reserved`.
- Ne modifie jamais les fichiers de la spécification.

## Compte rendu

- disposition créée ou convertie, avec ses chemins ;
- résultat de `recette.sh` : ligne finale et échecs éventuels ;
- sortie de `./agt ls` ;
- fiche GitLab remplie ;
- écarts avec la spécification, ou ambiguïtés rencontrées.

Commence par l'étape 0, puis l'étape 1.

---

# Spécification

<<<FICHIER manifest.json>>>
{
  "name": "agents-paralleles-gitlab",
  "version": "1.0.0",
  "specSchema": 1,
  "language": "fr",
  "description": "Plusieurs agents en parallèle sur un dépôt GitLab, une demande Jira par worktree : isolation, hooks communs, script agt, garde-fous GitLab, recette de 44 contrôles.",
  "entry": "SKILL.md",
  "targets": {
    "git": ">=2.38",
    "shell": "bash >=4",
    "forge": "GitLab (Free ; Premium ou Ultimate pour les push rules, les approbations obligatoires et les Code Owners)",
    "agent": "agent-tdd-jira >=1.1.0"
  },
  "modules": [
    { "id": "isolation", "path": "modules/isolation/SKILL.md", "dimensions": ["D1"], "status": "active" },
    { "id": "hooks", "path": "modules/hooks/SKILL.md", "dimensions": ["D2"], "status": "active" },
    { "id": "orchestration", "path": "modules/orchestration/SKILL.md", "dimensions": ["D3"], "status": "active" },
    { "id": "gitlab", "path": "modules/gitlab/SKILL.md", "dimensions": ["D4"], "status": "active" },
    { "id": "distribution", "path": "modules/distribution/SKILL.md", "dimensions": ["D5"], "status": "active" },
    { "id": "recette", "path": "modules/recette/SKILL.md", "dimensions": ["D1", "D2", "D3", "D4", "D5"], "status": "active" },
    { "id": "controle-gitlab", "path": "modules/controle-gitlab/SKILL.md", "dimensions": ["D6"], "status": "reserved" },
    { "id": "tension-depot", "path": "modules/tension-depot/SKILL.md", "dimensions": ["D7"], "status": "reserved" }
  ],
  "extensionPoints": ["E1", "E2"],
  "previousVersions": []
}
<<<FIN manifest.json>>>

<<<FICHIER SKILL.md>>>
---
name: agents-paralleles-gitlab
description: Faire travailler plusieurs agents de développement en parallèle sur un même dépôt GitLab, une demande Jira par worktree, sans qu'aucun ne puisse abîmer le code d'un autre ni la branche d'intégration (dépôt nu partagé, branche sans amont, hooks communs, script agt, garde-fous GitLab, recette de 44 contrôles). À utiliser pour installer, vérifier ou faire évoluer ce kit.
version: 1.0.0
---

# Agents en parallèle sur GitLab, spécification 1.0.0

Ce document est le point d'entrée de la spécification. Il fixe l'invariant d'organisation, le registre des dimensions, les règles communes et les invariants. Le code de référence, à reproduire à l'identique, et la recette sont dans `modules/`.

L'agent qui travaille dans chaque worktree est celui du skill `agent-tdd-jira`, à partir de la version 1.1.0 : sa dimension D9 décrit son comportement dans un worktree géré par ce kit, et elle inclut ce document comme référentiel. Les garde-fous Git reprennent ceux de l'effecteur de `tension-dashboard-gitlab-agent` 2.2.0.

## 1. Ordre de lecture

1. Ce document, en entier.
2. `manifest.json`.
3. Les modules actifs, dans l'ordre : `isolation`, `hooks`, `orchestration`, `gitlab`, `distribution`, `recette`.
4. `modules/controle-gitlab/SKILL.md` et `modules/tension-depot/SKILL.md` : seulement pour comprendre les points d'extension. Ne pas les implémenter en 1.x.

## 2. Invariant d'organisation

**Une demande Jira = une branche = un worktree = un agent.**

- Chaque agent n'écrit que dans le worktree de sa demande. Le skill de l'agent et les hooks sont posés une seule fois, hors des worktrees.
- Git interdit d'extraire une même branche dans deux worktrees : deux agents ne peuvent pas écrire sur la même branche.
- L'agent commite localement. Il ne pousse pas, ne fusionne pas et n'a aucun accès à GitLab.
- Aucun commit publié n'est réécrit, par personne : rebase tant que la branche est locale, fusion ensuite.
- Seule une merge request revue, puis fusionnée par un humain en merge commit, atteint la branche d'intégration.

## 3. Carte du système

```mermaid
flowchart LR
  subgraph POSTE["Poste du développeur : ~/dev/projet/"]
    BARE[(".bare/<br/>dépôt nu partagé")]
    HOOKS[".githooks/<br/>pre-commit, commit-msg, pre-push"]
    AGT["agt"]
    MAIN["main/<br/>base, référence"]
    W1["ECR-77/<br/>agent 1"]
    W2["ECR-78/<br/>agent 2"]
  end
  DEV(("Développeur"))
  GITLAB["GitLab<br/>branches protégées, push rules,<br/>merge requests, pipeline"]
  W1 --> BARE
  W2 --> BARE
  MAIN --> BARE
  HOOKS -.->|"core.hooksPath"| W1
  HOOKS -.->|"core.hooksPath"| W2
  DEV -->|"new, ls, collisions,<br/>sync, reset, done"| AGT
  AGT --> BARE
  BARE <-->|"fetch ; push par le développeur"| GITLAB
  DEV -->|"revue, fusion"| GITLAB
```

## 4. Cycle 7E

| Phase | Ce qu'elle désigne ici | Modules |
|---|---|---|
| Éléments | demandes Jira (clés), chemins impactés, commits de scénario | `distribution`, `hooks` |
| Espace | dépôt nu partagé, worktrees, branches de demande | `isolation` |
| Engendrent | chemins communs entre demandes, prévus puis constatés, fusions simulées | `distribution` |
| État | état de chaque demande (commits propres, retard, publication) et des hooks | `orchestration` |
| Expression | refus des garde-fous (« REFUS »), sortie d'`agt collisions`, merge request en brouillon | `hooks`, `distribution`, `gitlab` |
| Évolutif | point de retour, sauvegardes `backup/`, synchronisations, archives de `travail/` | `orchestration` |
| Environnement | développeur, GitLab, agents `agent-tdd-jira`, tension au niveau du dépôt (D7) | `gitlab`, `tension-depot` |

Clause de second ordre : les garde-fous façonnent le comportement des agents, et leurs refus sont des informations pour le développeur. Un refus n'est jamais contourné : l'agent s'arrête et le signale (`agent-tdd-jira:D9.INV-4`), le développeur décide. La charge de validation du développeur croît avec le nombre d'agents : c'est elle, et non la machine, qui fixe le nombre de demandes menées de front.

## 5. Registre des dimensions

| ID | Dimension | Introduite | Statut 1.0.0 | Dépend de | Module |
|---|---|---|---|---|---|
| D1 | Isolation : une demande par worktree | 1.0 | active | | `isolation`, `recette` |
| D2 | Garde-fous locaux : hooks communs | 1.0 | active | D1 | `hooks`, `recette` |
| D3 | Orchestration : script `agt` | 1.0 | active | D1, D2 | `orchestration`, `recette` |
| D4 | Garde-fous GitLab | 1.0 | active | D2 | `gitlab`, `recette` |
| D5 | Distribution et synchronisation des demandes | 1.0 | active | D3 | `distribution`, `recette` |
| D6 | Contrôle de la configuration GitLab par l'API, en lecture seule | 1.0 | reserved | D4 | `controle-gitlab` |
| D7 | Tension entre demandes au niveau du dépôt | 1.0 | reserved | D5 | `tension-depot` |

## 6. Contrat de version et points d'extension

La spécification suit le contrat de version de `EVOLUTION.md` du dépôt Agent2Prompt : une version mineure ajoute au moins une dimension ou un point d'extension, un invariant ne s'affaiblit jamais, la version précédente est archivée avant toute publication.

Points d'extension, actifs dès 1.0.0 :

- **E1** : `regles-gitlab.txt` porte les noms d'attributs de l'API GitLab (`branch_name_regex`, `commit_message_regex`, `file_name_regex`, `prevent_secrets`, `deny_delete_tag`). Le contrôle D6 le comparera à `GET /projects/:id/push_rule` sans conversion. Aucune commande d'`agt` n'appelle GitLab en 1.x (D3.INV-5, contrôle W32).
- **E2** : la sortie d'`agt collisions` a un format stable : une ligne `== <CLÉ> × <CLÉ> : <ÉTAT>`, puis un chemin par ligne, précédé de trois espaces et suivi de ` [point chaud]` le cas échéant. D7 la lira sans changer `agt` (contrôle W37).

## 7. Règles globales

- **Code de référence** : les six fichiers du kit (`.githooks/pre-commit`, `.githooks/commit-msg`, `.githooks/pre-push`, `agt`, `regles-gitlab.txt`, `recette.sh`) sont reproduits à l'identique depuis les modules. Une adaptation passe par l'environnement (`AGT_BASE`, `AGT_REMOTE`, `AGT_POINTS_CHAUDS`), jamais par une modification du code.
- **Aucune écriture dans GitLab** : ni le kit, ni l'IA qui l'installe, ni les agents n'écrivent dans GitLab. La configuration de GitLab est faite par un Maintainer, à partir de la fiche du module `gitlab`.
- **Aucun jeton** : aucun jeton GitLab dans un worktree, dans le kit, dans une URL de distant ou dans un journal.
- **Aucune réécriture** : ni `--force`, ni `--force-with-lease`, ni réécriture d'un commit publié.
- **Commandes humaines** : `agt reset`, `agt done --abandon`, `git reset --hard` et la résolution des conflits sont réservés au développeur.
- **Recette avant service** : `recette.sh` passe sans échec avant la mise en service du kit, et après toute modification de l'un de ses fichiers.
- **Langue** : messages, commentaires et documents en français ; commandes et variables telles que définies.

## 8. Cibles techniques

| Élément | Exigence | Vérifié sur |
|---|---|---|
| Git | 2.38 ou plus récent (`merge-tree --write-tree`) | 2.43 |
| Shell | bash 4 ou plus récent (`mapfile`) | bash 5.2 |
| GitLab | toutes éditions pour la protection des branches et la pipeline ; Premium ou Ultimate pour les push rules, les approbations obligatoires et les Code Owners | documentation GitLab |
| Outils facultatifs | `gitleaks` (secrets à l'indexation), `glab` (merge requests), `shellcheck` | |

## 9. Critères d'acceptation

- `recette.sh` : 44 contrôles réussis, aucun échec, sans accès au réseau.
- `shellcheck -S warning` sans avertissement sur les hooks, `agt` et `recette.sh`, si `shellcheck` est disponible.
- Les six fichiers du kit sont identiques aux blocs des modules, octet pour octet.
- `./agt ls` affiche « hooks : actifs » et aucune ALERTE.
- La fiche du module `gitlab` est remplie, édition comprise, et remise au Maintainer.

## 10. Invariants

**D1 : isolation**

- **D1.INV-1** : une demande a un worktree nommé par sa clé Jira, sur une branche `<type>/<CLÉ>-<slug>` conforme aux conventions ; une même branche n'est jamais extraite dans deux worktrees.
- **D1.INV-2** : la branche d'une demande est créée sans branche amont ; son premier push crée la branche distante du même nom.
- **D1.INV-3** : le point de retour `agent/<CLÉ>/start` est posé et le worktree verrouillé avant que l'agent commence.
- **D1.INV-4** : `travail/`, `.skills/`, `*.mht` et `*.mhtml` sont exclus de tous les worktrees par l'exclusion commune (`.bare/info/exclude`), sans modifier le `.gitignore` du projet.

**D2 : hooks**

- **D2.INV-1** : aucun commit sur `main`, `master`, `develop`, `release/*`, en HEAD détachée, ni sur une branche dont la clé n'est pas celle du worktree.
- **D2.INV-2** : tout commit, hors commit de fusion, commence par `<CLÉ> Snn : ` ou `<CLÉ> : `, de sorte que `git log --grep='^<CLÉ> '` retrouve tous les commits de la demande.
- **D2.INV-3** : aucun fichier interdit n'est commité, même forcé dans l'index : `.env`, clés et certificats, `*.mht`, `*.mhtml`, `.skills/`, `travail/`.
- **D2.INV-4** : un worktree ne pousse que vers la branche de sa demande ou une branche `fix/tension-*`, et ne supprime aucune branche distante.
- **D2.INV-5** : aucun push ne réécrit une branche distante, avec ou sans `--force` ou `--force-with-lease`.

**D3 : orchestration**

- **D3.INV-1** : `agt reset` ne réécrit aucun commit publié et crée une sauvegarde `backup/<CLÉ>-<horodatage>` avant toute écriture.
- **D3.INV-2** : `agt sync` refuse un worktree non propre, rebase une branche jamais publiée et fusionne la base dans une branche publiée.
- **D3.INV-3** : `agt done` ne supprime une branche que si elle est contenue dans la base distante, sauf `--abandon` explicite, et archive `travail/` avant de supprimer le worktree.
- **D3.INV-4** : `agt ls` signale des hooks inactifs et toute URL de distant qui contient un identifiant ou un jeton.
- **D3.INV-5** : `agt` n'appelle pas GitLab et ne pousse rien.

**D4 : GitLab**

- **D4.INV-1** : les push rules de `regles-gitlab.txt` acceptent tout ce que les hooks et `agt new` acceptent, refusent les sauvegardes `backup/` et les messages hors format, et reprennent l'expression des fichiers interdits du hook `pre-commit`.
- **D4.INV-2** : une merge request est fusionnée par merge commit, sans squash : les commits de la demande entrent dans la base avec leur SHA.
- **D4.INV-3** : les agents n'ont aucun accès à GitLab : aucun jeton dans le kit, dans un worktree ou dans une URL de distant.

**D5 : distribution**

- **D5.INV-1** : avant le code, `agt collisions` signale les chemins communs aux fiches d'impact (`travail/<CLÉ>/impact.txt`) de deux demandes actives, en marquant les points chauds.
- **D5.INV-2** : pendant la réalisation, `agt collisions` signale les fichiers modifiés en commun par deux demandes, avec le résultat de la fusion simulée, dans le format stable du point E2.
- **D5.INV-3** : une demande empilée part de la branche parente déclarée ; une fois la parente fusionnée par merge commit, elle n'apporte à la base que ses propres commits.

## 11. Journal de révision

**1.0.0** (2026-10-20) : première version. Dimensions D1 à D5 actives, D6 et D7 réservées. Points d'extension E1 et E2. Issue du tutoriel « Agents de code en parallèle » v2, testé sur une copie du dépôt Agent2Prompt. Ajouts par rapport au tutoriel : commit à clé seule hors scénario, prévision des collisions par les fiches d'impact, points chauds, alerte sur un identifiant dans une URL de distant, fichier `regles-gitlab.txt`, recette de 44 contrôles rattachés aux invariants.
<<<FIN SKILL.md>>>

<<<FICHIER modules/isolation/SKILL.md>>>
---
name: isolation
description: Disposition du kit (dépôt nu partagé, worktree de référence, un worktree par demande nommé par sa clé Jira), réglages et exclusions communs, skill de l'agent posé une seule fois hors des worktrees, conventions de nommage, création d'une demande sans branche amont, point de retour et verrou. À lire avant toute installation.
dimensions: [D1]
status: active
---

# Module `isolation` (D1)

Phase 7E couverte : Espace.

## 1. Disposition

```
~/dev/<projet>/
├── .bare/                    dépôt nu partagé : objets, refs, remotes, config, info/exclude
├── .git                      fichier : "gitdir: ./.bare"
├── .githooks/                hooks communs (module hooks)
├── .skills/                  skills des agents, matérialisés une seule fois
├── agt                       script d'orchestration (module orchestration)
├── regles-gitlab.txt         push rules (module gitlab)
├── recette.sh                recette du kit (module recette)
├── archives-travail/         dossiers travail/ des demandes terminées
├── main/                     worktree de référence sur la base : jamais d'agent, jamais de commit
├── ECR-77/                   une demande → feature/ECR-77-export-csv
│   ├── travail/              non versionné : demande enregistrée, demande.json, impact.txt, rapport.md
│   └── docs/demandes/ECR-77/ versionné : ECR-77.feature, suivi.md
└── ECR-78/                   une autre demande
```

Un worktree est une copie complète des fichiers suivis, extraits sur sa branche. Seul l'historique est partagé : objets, branches, tags, remotes, configuration et cache `rerere` restent dans `.bare/`. Le `.git` d'un worktree est un fichier d'une ligne qui pointe vers `.bare/worktrees/<CLÉ>`. Les dossiers de construction (`node_modules/`, `target/`, `dist/`) se recréent dans chaque worktree où l'on construit.

Mesure sur le dépôt Agent2Prompt (86 fichiers suivis) : 0,55 Mo pour `.bare/`, une seule fois, et 1,32 Mo de fichiers par worktree. Le worktree évite de recopier l'historique, pas les fichiers. Pour mesurer un projet : `du -sh .bare */` et `git count-objects -vH`.

## 2. Mise en place

Dépôt nu neuf :

```bash
mkdir -p ~/dev/<projet> && cd ~/dev/<projet>
git clone --bare git@gitlab.example.com:equipe/<projet>.git .bare
echo "gitdir: ./.bare" > .git
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"   # un clone nu ne suit pas les branches distantes
git fetch origin
git worktree add main develop                                          # référence humaine
```

À partir d'un clone existant, ses branches locales sont reprises et l'ancien clone n'est pas modifié. Ce qui n'y est pas commité (modifications, stashes) n'est pas repris : le commiter ou le garder dans l'ancien clone.

```bash
mkdir -p ~/dev/<projet> && cd ~/dev/<projet>
git clone --bare ~/dev/<ancien-clone> .bare
git -C .bare remote set-url origin git@gitlab.example.com:equipe/<projet>.git
echo "gitdir: ./.bare" > .git
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
git fetch origin
git worktree add main develop
```

Réglages et exclusions communs à tous les worktrees :

```bash
git config rerere.enabled true                 # une résolution de conflit sert à tous les worktrees
git config fetch.prune true
git config push.autoSetupRemote true           # le premier push crée la branche distante du même nom (D1.INV-2)
git config core.hooksPath "$PWD/.githooks"     # module hooks
printf '%s\n' '/.skills/' '/travail/' '*.mht' '*.mhtml' >> .bare/info/exclude   # D1.INV-4
```

`.bare/info/exclude` vaut pour tous les worktrees et n'est jamais versionné : le `.gitignore` du projet ne change pas.

## 3. Skill de l'agent, posé une seule fois

1. Coller la transmission `agent-tdd-jira-1.1.0.md` (ou suivante) dans une première session, en indiquant l'emplacement `~/dev/<projet>/.skills/agent-tdd-jira/`. L'en-tête de transmission le prévoit : « ou l'emplacement que le développeur indique ».
2. Vérifier la table d'intégrité (`sha256sum -c`), puis passer le skill et les hooks en lecture seule : `chmod -R a-w .skills .githooks`.

Les fichiers exclus d'un worktree disparaissent avec lui quand il est supprimé : c'est une raison de plus pour poser le skill hors des worktrees.

## 4. Conventions

| Élément | Convention | Exemple |
|---|---|---|
| Répertoire du worktree | la clé Jira, seule | `ECR-77/` |
| Clé | `[A-Z][A-Z0-9_]+-[0-9]+` | `ECR-77`, `ABC2-9` |
| Branche | `<type>/<CLÉ>-<slug>` ; type `feature`, `fix`, `chore` ou `refactor` ; slug en minuscules, chiffres et tirets | `feature/ECR-77-export-csv` |
| Commit | `<CLÉ> Snn : …` pour un scénario, `<CLÉ> : …` hors scénario | `ECR-77 S02 : BOM UTF-8`, `ECR-77 : fichiers de la demande` |
| Dossier de travail | `travail/`, non versionné | `travail/ECR-77.mhtml`, `travail/ECR-77/impact.txt` |
| Point de retour | tag local `agent/<CLÉ>/start` | `agent/ECR-77/start` |
| Sauvegarde avant `reset` | branche locale `backup/<CLÉ>-<horodatage>` | `backup/ECR-77-20261020T063700` |

Les conventions de commit et de dossier de travail sont celles de `agent-tdd-jira` 1.1.0 (module `cycle-tdd`, section 7, et dimension D9).

## 5. Créer une demande (D1.INV-1 à D1.INV-3)

```bash
./agt new ECR-77 export-csv                                  # depuis origin/<base>
./agt new ECR-90 rapport feature feature/ECR-77-export-csv   # demande empilée (module distribution)
```

`agt new` vérifie la clé, le slug et le type, puis :

1. crée le worktree `ECR-77/` sur `feature/ECR-77-export-csv`, **sans branche amont** (`--no-track`). Sans cette option, une branche créée depuis `origin/develop` aurait `origin/develop` pour amont : le premier `git push` échouerait, et avec `push.default=upstream` il viserait `develop` (D1.INV-2) ;
2. pose le tag `agent/ECR-77/start`, point de retour d'`agt reset` ;
3. crée `travail/ECR-77/` ;
4. verrouille le worktree (`git worktree lock`) : il ne peut plus être déplacé ni supprimé par erreur pendant le travail de l'agent (D1.INV-3).

Git refuse d'extraire une branche déjà extraite dans un autre worktree (D1.INV-1).

## 6. Contrôle de sortie

- Worktree nommé par la clé, branche conforme, jamais extraite deux fois (D1.INV-1) : W1 à W4.
- Branche sans amont, premier push vers la branche du même nom (D1.INV-2) : W5, W17.
- Point de retour et verrou posés (D1.INV-3) : W6.
- Exclusions communes (D1.INV-4) : W7.
<<<FIN modules/isolation/SKILL.md>>>

<<<FICHIER modules/hooks/SKILL.md>>>
---
name: hooks
description: Hooks Git communs à tous les worktrees, à reproduire à l'identique (pre-commit pour la branche de la demande et les fichiers interdits, commit-msg pour le format traçable, pre-push contre l'envoi ailleurs, la suppression et la réécriture), ce qu'ils ne couvrent pas (contournement, Husky) et leurs contrôles. À lire avant d'écrire .githooks/.
dimensions: [D2]
status: active
---

# Module `hooks` (D2)

Phase 7E couverte : Expression, par les refus.

Les hooks sont dans `.githooks/`, à la racine du kit, en lecture seule ; `core.hooksPath` les applique à tous les worktrees. Chacun tire la clé Jira du nom du répertoire du worktree, et chaque refus commence par « REFUS : ». Ils évitent les erreurs ; GitLab empêche les abus (module `gitlab`), car un hook se contourne.

```mermaid
sequenceDiagram
  participant A as Agent ou développeur
  participant H as Hooks communs
  participant G as GitLab
  A->>H: git commit
  H-->>A: REFUS si branche, message ou fichier hors règle
  A->>H: git push, par le développeur
  H-->>A: REFUS si autre branche, suppression ou réécriture
  H->>G: envoi accepté
  G-->>A: refus serveur si une push rule ou une protection est violée
```

## 1. `.githooks/pre-commit` (D2.INV-1, D2.INV-3)

```bash
#!/usr/bin/env bash
# pre-commit : branche de la demande (D2.INV-1), fichiers interdits (D2.INV-3), secrets
set -euo pipefail
branch=$(git branch --show-current)
cle=$(basename "$(git rev-parse --show-toplevel)")        # le dossier du worktree porte la clé Jira

case "$branch" in
  ''|main|master|develop|release/*) echo "REFUS : commit interdit sur « ${branch:-HEAD détachée} »"; exit 1 ;;
esac
[[ "$branch" == */"$cle"-* ]] || { echo "REFUS : la branche $branch n'appartient pas à $cle"; exit 1; }

# Jamais commités : secrets, demande Jira enregistrée (données personnelles), skill matérialisé, dossier de travail.
# Même expression que file_name_regex dans regles-gitlab.txt.
interdits=$(git diff --cached --name-only --diff-filter=ACMR \
  | grep -E '(^|/)(\.env|id_rsa[^/]*|[^/]*\.(pem|key|p12|jks|mht|mhtml))$|^(\.skills|travail)/' || true)
[[ -z "$interdits" ]] || { echo "REFUS : fichiers interdits indexés :"; echo "$interdits" | sed 's/^/  /'; exit 1; }

# Détection de secrets si gitleaks est installé (detect et protect sont dépréciés depuis la 8.19.0)
if command -v gitleaks >/dev/null; then
  if gitleaks git --help >/dev/null 2>&1; then
    gitleaks git --pre-commit --staged --redact --no-banner
  else
    gitleaks protect --staged --redact --no-banner
  fi
fi
exit 0
```

## 2. `.githooks/commit-msg` (D2.INV-2)

Le format est celui de `agent-tdd-jira` 1.1.0. La matrice de traçabilité de l'agent cherche `^<CLÉ> ` : un commit hors format disparaîtrait de la matrice. Le message de fusion produit par Git (`agt sync` d'une branche publiée) est accepté.

```bash
#!/usr/bin/env bash
# commit-msg (D2.INV-2) : « <CLÉ> Snn : … » pour un scénario, « <CLÉ> : … » hors scénario.
# La matrice de traçabilité du skill agent-tdd-jira retrouve ainsi tous les commits de la demande.
cle=$(basename "$(git rev-parse --show-toplevel)")
git rev-parse -q --verify MERGE_HEAD >/dev/null && exit 0     # fusion de develop : message de Git accepté
head -n1 "$1" | grep -Eq "^${cle}( S[0-9]{2})? : " && exit 0
echo "REFUS : le message doit commencer par « ${cle} Snn : » ou « ${cle} : » (exemple : ${cle} S02 : …)"
exit 1
```

## 3. `.githooks/pre-push` (D2.INV-4, D2.INV-5)

Le hook compare l'ancienne et la nouvelle tête de chaque branche visée : si l'ancienne n'est pas un ancêtre de la nouvelle, l'envoi réécrirait l'historique publié, avec ou sans `--force-with-lease`. Les branches `fix/tension-*` de l'effecteur de `tension-dashboard-gitlab-agent` sont acceptées : cet effecteur a ses propres garde-fous (`tension-dashboard-gitlab-agent:D4.INV-1`, `tension-dashboard-gitlab-agent:D4.INV-3`).

```bash
#!/usr/bin/env bash
# pre-push : branche de la demande ou fix/tension-*, aucune suppression (D2.INV-4), aucune réécriture (D2.INV-5)
set -euo pipefail
cle=$(basename "$(git rev-parse --show-toplevel)")
while read -r _ local_sha remote_ref remote_sha; do
  target=${remote_ref#refs/heads/}
  [[ "$target" == */"$cle"-* || "$target" == fix/tension-* ]] \
    || { echo "REFUS : push vers $target depuis $cle"; exit 1; }
  [[ ! "$local_sha" =~ ^0+$ ]] || { echo "REFUS : suppression de $target"; exit 1; }
  if [[ ! "$remote_sha" =~ ^0+$ ]]; then
    git merge-base --is-ancestor "$remote_sha" "$local_sha" 2>/dev/null \
      || { echo "REFUS : $target serait réécrite, des commits publiés seraient perdus (aucun --force)"; exit 1; }
  fi
done
```

Après écriture : `chmod +x .githooks/*`, puis `chmod -R a-w .githooks`.

## 4. Ce que les hooks ne couvrent pas

- **Contournement.** `--no-verify`, `git -c core.hooksPath=…` ou un `git config` lancé depuis n'importe quel worktree, puisque la configuration est commune. Si l'outil de l'agent accepte des règles de refus de commandes, y interdire : `git push`, `git merge`, `git rebase`, `git switch`, `git config`, `git -c`, `--no-verify`, `--force`, `--force-with-lease`, `reset --hard`, `stash drop`, `stash clear`, `branch -D`, `git worktree`. C'est la liste fermée de l'effecteur de `tension-dashboard-gitlab-agent` (module `effecteur-gitlab`, section 3.1), étendue aux commandes de configuration et de branche ; `agent-tdd-jira` 1.1.0 l'impose à l'agent (`agent-tdd-jira:D9.INV-2`).
- **Désactivation.** `./agt ls` signale par une ALERTE un `core.hooksPath` qui ne pointe plus vers `.githooks/` (D3.INV-4).

## 5. Husky et outils semblables

Un `npm ci` qui lance Husky réécrit `core.hooksPath` dans la configuration commune, donc pour tous les worktrees. Remèdes, au choix : `HUSKY=0` dans l'environnement des agents, ou appeler les hooks de `.githooks/` depuis ceux de Husky. Dans les deux cas, vérifier ensuite avec `./agt ls`.

## 6. Contrôle de sortie

- Aucun commit sur une branche d'intégration ni sur celle d'une autre clé (D2.INV-1) : W15, W16.
- Format traçable, traçabilité complète (D2.INV-2) : W8 à W11.
- Fichiers interdits refusés, `.env.example` accepté (D2.INV-3) : W12 à W14.
- Aucun push vers une autre branche, aucune suppression, `fix/tension-*` accepté (D2.INV-4) : W18 à W20.
- Aucune réécriture d'une branche distante, push sans force après fusion (D2.INV-5) : W21, W22, W26.
<<<FIN modules/hooks/SKILL.md>>>

<<<FICHIER modules/orchestration/SKILL.md>>>
---
name: orchestration
description: Script agt, à reproduire à l'identique (new, ls, diff, collisions, sync, reset, done), cycle de vie d'une demande avec les points de validation de l'agent, consigne de lancement, publication par le développeur, annulation sans réécriture. À lire avant d'écrire agt.
dimensions: [D3]
status: active
---

# Module `orchestration` (D3)

Phases 7E couvertes : État, Évolutif.

## 1. Cycle de vie d'une demande

```mermaid
stateDiagram-v2
  state "préparée" as preparee
  state "analysée" as analysee
  state "distribuée" as distribuee
  state "en réalisation" as realisation
  state "rapport remis" as rapport
  state "publiée" as publiee
  state "fusionnée" as fusionnee
  [*] --> preparee : agt new
  preparee --> analysee : V1, V2
  analysee --> distribuee : impact.txt, agt collisions
  distribuee --> realisation : V3
  realisation --> realisation : V4, commit local, agt sync
  realisation --> rapport : V5
  rapport --> publiee : push, merge request en brouillon
  publiee --> fusionnee : revue, pipeline, merge commit
  fusionnee --> [*] : agt done
  realisation --> preparee : agt reset, rien de publié
  preparee --> [*] : agt done avec abandon
```

| Étape | Qui | Commande ou action |
|---|---|---|
| Préparer | développeur | `./agt new ECR-77 export-csv`, puis dépôt de `ECR-77/travail/ECR-77.mhtml` |
| Lancer l'agent | développeur | consigne de la section 3, suivie de la transmission `agent-tdd-jira` |
| V1, V2 | agent et développeur | extraction confirmée, scénarios validés |
| Impact | agent | fiche d'impact et `travail/ECR-77/impact.txt` (`agent-tdd-jira:D9.INV-5`) |
| Distribution | développeur | `./agt collisions` : mener de front ou séquencer (module `distribution`) |
| V3, V4 | agent et développeur | variantes, puis un scénario à la fois avec commit local ; `./agt sync ECR-77` entre deux scénarios |
| V5 | agent et développeur | matrice, rapport, projet de commentaire Jira publié par le développeur |
| Publier | développeur | `./agt diff ECR-77`, `git -C ECR-77 push`, merge request en brouillon (section 4) |
| Fusionner | humain | revue, pipeline vert, merge commit (module `gitlab`) |
| Nettoyer | développeur | `./agt done ECR-77` |

## 2. `agt`

À placer à la racine du kit, exécutable (`chmod +x agt`), et à lancer depuis elle.

```bash
#!/usr/bin/env bash
# agt : un worktree par demande Jira, pour les agents agent-tdd-jira. À lancer depuis la racine, à côté de .bare/.
# Réglages par l'environnement uniquement : AGT_BASE, AGT_REMOTE, AGT_POINTS_CHAUDS.
set -euo pipefail
BASE="${AGT_BASE:-develop}"
REMOTE="${AGT_REMOTE:-origin}"
POINTS_CHAUDS="${AGT_POINTS_CHAUDS:-(^|/)api/openapi\.ya?ml$|(^|/)db/(migration|changelog)/|(^|/)(pom\.xml|package\.json|build\.gradle(\.kts)?)$|[Ss]ecurity}"

branche()  { git -C "$1" branch --show-current; }
publiee()  { git rev-parse -q --verify "refs/remotes/$REMOTE/$1" >/dev/null; }
tickets()  { for d in */; do d=${d%/}; [[ -e "$d/.git" && "$d" != main ]] && echo "$d"; done; return 0; }
propre()   { [[ -z "$(git -C "$1" status --porcelain)" ]] || { echo "REFUS : $1 a des modifications non commitées, à traiter d'abord"; exit 1; }; }
chemins()  { grep -vE '^[[:space:]]*(#|$)' "$1" | sed -e 's/[[:space:]]*$//' -e 's#^\./##' | sort -u; }
marquer()  { while IFS= read -r f; do if [[ "$f" =~ $POINTS_CHAUDS ]]; then echo "   $f [point chaud]"; else echo "   $f"; fi; done; }

case "${1:-}" in
  new)      # agt new ECR-77 export-csv [feature|fix|chore|refactor] [base, pour une demande empilée]   (D1.INV-1 à D1.INV-3)
    cle=${2:?clé Jira}; slug=${3:?slug}; type=${4:-feature}; b="$type/$cle-$slug"; from=${5:-$REMOTE/$BASE}
    [[ "$cle" =~ ^[A-Z][A-Z0-9_]+-[0-9]+$ ]] || { echo "REFUS : clé Jira invalide : $cle"; exit 1; }
    [[ "$slug" =~ ^[a-z0-9-]+$ ]] || { echo "REFUS : slug invalide (minuscules, chiffres, tirets) : $slug"; exit 1; }
    [[ "$type" =~ ^(feature|fix|chore|refactor)$ ]] || { echo "REFUS : type invalide (feature, fix, chore, refactor) : $type"; exit 1; }
    git fetch -q "$REMOTE"
    git worktree add -q --no-track -b "$b" "$cle" "$from"   # sans amont : le premier envoi crée la branche du même nom
    git tag "agent/$cle/start" "$b"
    mkdir -p "$cle/travail/$cle"
    git worktree lock "$cle" --reason "agent en cours"
    echo "Prêt : $PWD/$cle (branche $b)."
    echo "Déposer $cle.mhtml dans $cle/travail/, puis lancer l'agent avec ce dossier comme seule zone d'écriture." ;;

  ls)       # hooks, URL des distants, puis état de chaque demande   (D3.INV-4)
    hp=$(git config core.hooksPath || true)
    if [[ "$hp" == "$PWD/.githooks" ]]; then echo "hooks : actifs ($hp)"
    else echo "ALERTE : core.hooksPath = « ${hp:-non défini} », hooks de sécurité inactifs"; fi
    while read -r nom url _; do
      if [[ "$url" =~ ^https?://[^/]*@ ]]; then
        echo "ALERTE : l'URL du distant $nom contient un identifiant ou un jeton ; passer par SSH ou un gestionnaire d'identifiants"
      fi
    done < <(git remote -v | sort -u)
    git fetch -q "$REMOTE" || echo "ALERTE : récupération impossible depuis $REMOTE, état non actualisé"
    for d in $(tickets); do
      b=$(branche "$d")
      printf '%-10s %-36s commits:%-3s retard:%-3s non-commités:%-3s publiée:%s\n' "$d" "$b" \
        "$(git rev-list --count --no-merges "$REMOTE/$BASE..$b")" \
        "$(git rev-list --count "$b..$REMOTE/$BASE")" \
        "$(git -C "$d" status --porcelain | wc -l)" \
        "$(publiee "$b" && echo oui || echo non)"
    done ;;

  diff)     # agt diff ECR-77 : ce que la demande ajoute à la base, hors fusions de la base
    cle=${2:?clé}
    git -C "$cle" diff --stat "$REMOTE/$BASE...HEAD"
    git -C "$cle" log --oneline --no-merges "$REMOTE/$BASE..HEAD" ;;

  collisions)  # avant le code : fiches d'impact (D5.INV-1) ; pendant : branches (D5.INV-2). Format stable (E2)
    git fetch -q "$REMOTE"
    mapfile -t ds < <(tickets)
    trouve=0
    for ((i=0; i<${#ds[@]}; i++)); do for ((j=i+1; j<${#ds[@]}; j++)); do
      a=${ds[i]}; b=${ds[j]}
      fa="$a/travail/$a/impact.txt"; fb="$b/travail/$b/impact.txt"
      if [[ -f "$fa" && -f "$fb" ]]; then
        communs=$(comm -12 <(chemins "$fa") <(chemins "$fb"))
        if [[ -n "$communs" ]]; then trouve=1; echo "== $a × $b : PRÉVISION"; marquer <<<"$communs"; fi
      fi
      ba=$(branche "$a"); bb=$(branche "$b")
      communs=$(comm -12 <(git diff --name-only "$REMOTE/$BASE...$ba" | sort) \
                         <(git diff --name-only "$REMOTE/$BASE...$bb" | sort))
      [[ -n "$communs" ]] || continue
      trouve=1
      rc=0; git merge-tree --write-tree "$ba" "$bb" >/dev/null 2>&1 || rc=$?
      case $rc in
        0) etat="fusion propre" ;;
        1) etat="CONFLIT" ;;
        *) etat="simulation impossible (git 2.38 ou plus récent requis)" ;;
      esac
      echo "== $a × $b : $etat"; marquer <<<"$communs"
    done; done
    [[ $trouve -eq 1 ]] || echo "Aucun fichier en commun entre les demandes actives." ;;

  sync)     # agt sync ECR-77 : entre deux scénarios, jamais pendant que l'agent écrit   (D3.INV-2)
    cle=${2:?clé}; b=$(branche "$cle"); propre "$cle"; git fetch -q "$REMOTE"
    if publiee "$b"; then
      git -C "$cle" merge --no-edit "$REMOTE/$BASE" \
        || { git -C "$cle" merge --abort; echo "ARRÊT : conflit, résolution humaine requise"; exit 1; }
    else
      git -C "$cle" rebase "$REMOTE/$BASE" \
        || { git -C "$cle" rebase --abort; echo "ARRÊT : conflit, résolution humaine requise"; exit 1; }
    fi ;;

  reset)    # commande humaine : abandonner le travail local de l'agent   (D3.INV-1)
    cle=${2:?clé}; b=$(branche "$cle"); propre "$cle"
    for c in $(git rev-list "$REMOTE/$BASE..$b"); do       # commits propres à la demande
      if [[ -n "$(git branch -r --contains "$c")" ]]; then
        echo "REFUS : $c est déjà publié, il ne sera pas réécrit."
        echo "Fermer la MR, puis : agt done $cle --abandon && agt new $cle <slug>-v2"; exit 1
      fi
    done
    git -C "$cle" branch "backup/$cle-$(date +%Y%m%dT%H%M%S)"     # sauvegarde avant toute écriture
    git -C "$cle" reset -q --hard "agent/$cle/start"
    echo "$cle revenu au point de départ ; sauvegarde : $(git -C "$cle" branch --list "backup/$cle-*" | tail -1 | tr -d ' ')" ;;

  done)     # agt done ECR-77 [--abandon] : après fusion de la MR, ou abandon décidé par le développeur   (D3.INV-3)
    cle=${2:?clé}; b=$(branche "$cle"); git fetch -q "$REMOTE"
    if [[ "${3:-}" != --abandon ]] && ! git merge-base --is-ancestor "$b" "$REMOTE/$BASE"; then
      echo "REFUS : $b n'est pas fusionnée dans $REMOTE/$BASE. Abandon volontaire : agt done $cle --abandon"; exit 1
    fi
    if [[ -d "$cle/travail" ]]; then                  # conserver demande.json, impact.txt et l'empreinte de la source
      mkdir -p archives-travail && mv "$cle/travail" "archives-travail/$cle-$(date +%Y%m%dT%H%M%S)"
    fi
    git worktree unlock "$cle" 2>/dev/null || true
    git worktree remove "$cle"
    git branch -q -D "$b"                             # fusion vérifiée ci-dessus, ou abandon explicite
    git tag -d "agent/$cle/start" >/dev/null
    git fetch -q --prune "$REMOTE"
    echo "$cle nettoyé." ;;

  *) echo "usage : agt new <CLÉ> <slug> [feature|fix|chore|refactor] [base] | ls | diff <CLÉ> | collisions | sync <CLÉ> | reset <CLÉ> | done <CLÉ> [--abandon]"; exit 1 ;;
esac
```

| Commande | Effet | Invariants |
|---|---|---|
| `agt new <CLÉ> <slug> [type] [base]` | vérifie clé, slug et type ; worktree, branche sans amont, tag de départ, `travail/`, verrou | D1.INV-1 à D1.INV-3 |
| `agt ls` | hooks, URL des distants, puis par demande : commits propres, retard sur la base, fichiers non commités, publication | D3.INV-4 |
| `agt diff <CLÉ>` | ce que la demande ajoute à la base, hors fusions de la base | |
| `agt collisions` | chemins communs des fiches d'impact, puis fichiers communs des branches avec fusion simulée | D5.INV-1, D5.INV-2 |
| `agt sync <CLÉ>` | refuse un worktree non propre ; rebase si la branche n'est pas publiée, fusion sinon | D3.INV-2 |
| `agt reset <CLÉ>` | refuse si un commit est publié ; sinon sauvegarde, puis retour au point de départ | D3.INV-1 |
| `agt done <CLÉ> [--abandon]` | refuse si la branche n'est pas fusionnée, sauf abandon ; archive `travail/`, supprime worktree, branche et tag | D3.INV-3 |

Exemple de sortie d'`agt ls` :

```text
hooks : actifs (/home/fred/dev/projet/.githooks)
ECR-77     feature/ECR-77-export-csv            commits:2   retard:0   non-commités:0   publiée:oui
ECR-90     feature/ECR-90-rapport               commits:1   retard:1   non-commités:0   publiée:non
```

## 3. Consigne de lancement de l'agent

Elle précède la transmission du skill `agent-tdd-jira` dans la session de l'agent :

```text
Demande ECR-77. Ton dossier de travail est ~/dev/<projet>/ECR-77 : tu n'écris nulle part ailleurs.
Mode parallèle : applique le module parallele (dimension D9) du skill agent-tdd-jira.
Le skill est déjà matérialisé dans ~/dev/<projet>/.skills/agent-tdd-jira/ : vérifie-le avec
sha256sum -c contre la table de la transmission ci-dessous, et ne le réécris pas.
La demande enregistrée est travail/ECR-77.mhtml.
```

## 4. Publier

Le développeur publie, jamais en force. La description de la merge request reprend le rapport V5, que l'agent écrit dans `travail/<CLÉ>/rapport.md`.

```bash
./agt diff ECR-77                            # périmètre conforme à la fiche d'impact ?
git -C ECR-77 push                           # crée origin/feature/ECR-77-export-csv
(cd ECR-77 && glab mr create --draft \
  --target-branch develop \
  --title "ECR-77 : export CSV des retours d'expérience" \
  --description "$(cat travail/ECR-77/rapport.md)" \
  --remove-source-branch)
```

Sans `glab`, la merge request se crée dans l'interface de GitLab, en brouillon, vers la base.

## 5. Annuler sans réécrire

Ces commandes sont réservées au développeur : `reset --hard` est interdit à un agent (module `effecteur-gitlab` de `tension-dashboard-gitlab-agent`, section 3.1).

```bash
# Rien n'est publié : retour au point de départ, après sauvegarde backup/ECR-77-<horodatage>
./agt reset ECR-77

# Seuls les derniers commits ne sont pas publiés : retour à l'état publié
git -C ECR-77 branch "backup/ECR-77-$(date +%Y%m%dT%H%M%S)" && git -C ECR-77 reset --hard "@{u}"

# Des commits sont publiés : aucune réécriture. Fermer la merge request, puis repartir d'une nouvelle branche
./agt done ECR-77 --abandon && ./agt new ECR-77 export-csv-v2
```

## 6. Contrôle de sortie

- `agt reset` refusé si un commit est publié, sauvegarde faite sinon (D3.INV-1) : W23, W28.
- `agt sync` : refus d'un worktree non propre, fusion si publiée, rebase sinon (D3.INV-2) : W24, W25, W27.
- `agt done` : refus avant fusion, archive et suppression après (D3.INV-3) : W33, W42.
- `agt ls` : alertes hooks et jeton, aucune alerte en situation saine (D3.INV-4) : W29 à W31.
- `agt` n'appelle pas GitLab et ne pousse rien (D3.INV-5) : W32.
<<<FIN modules/orchestration/SKILL.md>>>

<<<FICHIER modules/gitlab/SKILL.md>>>
---
name: gitlab
description: Garde-fous côté serveur GitLab, à faire configurer par un Maintainer (branches protégées, force push, pipeline obligatoire, merge commit sans squash, approbations, Code Owners, push rules de regles-gitlab.txt, détection de secrets, éditions), et absence d'accès GitLab des agents. À lire avant de remplir la fiche GitLab.
dimensions: [D4]
status: active
---

# Module `gitlab` (D4)

Phase 7E couverte : Environnement.

Ces réglages rendent la sécurité effective : un hook se contourne, pas une branche protégée. Ils sont faits par un Maintainer du projet ; ni le kit, ni l'IA qui l'installe ne les appliquent.

## 1. Fiche de configuration

| Réglage | Valeur | Effet | Édition |
|---|---|---|---|
| Branches protégées : la base et `main` | « Allowed to merge » : Maintainers ; « Allowed to push and merge » : No one | aucun push direct | toutes |
| « Allowed to force push » | désactivé | historique de la base intouchable | toutes |
| « Pipelines must succeed » | activé | pas de fusion sans pipeline vert | toutes |
| Méthode de fusion | « Merge commit » | les commits de la demande entrent dans la base avec leur SHA (D4.INV-2) | toutes |
| « Squash commits when merging » | « Do not allow » | la matrice de traçabilité de l'agent reste valide sur la base | toutes |
| Approbations | au moins une ; « Prevent approval by merge request creator » | revue obligatoire | Premium, Ultimate ; facultatives en Free |
| Code Owners | contrat, migrations, sécurité, CI (section 3) | revue par le bon responsable | Premium, Ultimate |
| Push rules | `regles-gitlab.txt` (section 2) | les règles des hooks deviennent incontournables | Premium, Ultimate |
| Détection de secrets | template `Jobs/Secret-Detection.gitlab-ci.yml` (section 4) | second filet, côté serveur | toutes |

En Free, l'approbation reste facultative : la garantie repose sur la protection des branches, la fusion réservée aux Maintainers et l'absence d'accès GitLab des agents (D4.INV-3).

## 2. `regles-gitlab.txt` (D4.INV-1, point E1)

Une ligne par attribut, sous le nom qu'il porte dans l'API (`/projects/:id/push_rule`) ; chaque valeur se recopie dans le champ correspondant de « Settings > Repository > Push rules ». Syntaxe RE2. GitLab évalue le message de commit en mode multiligne : `(?-m)` ancre l'expression au début du message, sans quoi n'importe quelle ligne suffirait. L'expression des fichiers porte sur le chemin complet, comme celle du hook `pre-commit`, qu'elle reprend à l'identique.

```text
# Push rules GitLab (Premium ou Ultimate), syntaxe RE2, noms d'attributs de l'API (/projects/:id/push_rule).
# À recopier champ par champ dans Settings > Repository > Push rules. Source unique, vérifiée par recette.sh.
branch_name_regex=^((feature|fix|chore|refactor)/[A-Z][A-Z0-9_]+-[0-9]+-[a-z0-9-]+|fix/tension-[a-z0-9._-]+)$
commit_message_regex=(?-m)^([A-Z][A-Z0-9_]+-[0-9]+( S[0-9]{2})? : |Merge )
file_name_regex=(^|/)(\.env|id_rsa[^/]*|[^/]*\.(pem|key|p12|jks|mht|mhtml))$|^(\.skills|travail)/
prevent_secrets=true
deny_delete_tag=true
```

La recette vérifie la cohérence avec les hooks : toute branche créée par `agt new` et toute branche `fix/tension-*` passent, une sauvegarde `backup/` est refusée ; tout message accepté par `commit-msg` passe, un message hors format est refusé, y compris quand le format n'apparaît qu'en deuxième ligne.

## 3. Code Owners

```
[Contrat et données][1]
/api/openapi.yaml                    @lead-tech
/src/main/resources/db/migration/    @lead-tech
/src/main/resources/db/changelog/    @lead-tech

[Sécurité][1]
/src/**/security/                    @equipe-securite
/.gitlab-ci.yml                      @lead-tech
```

## 4. Pipeline

Une seule pipeline par push : celle de la merge request quand elle existe.

```yaml
# .gitlab-ci.yml
include:
  - template: Jobs/Secret-Detection.gitlab-ci.yml

workflow:
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH && $CI_OPEN_MERGE_REQUESTS
      when: never
    - if: $CI_COMMIT_BRANCH

stages: [test]

test:
  stage: test
  script:
    - ./scripts/ci.sh      # back : ./mvnw verify ; front : npx ng test --no-watch, puis npx ng lint
```

## 5. Accès des agents (D4.INV-3)

- Les agents n'ont pas de jeton GitLab : ils ne poussent pas, la publication est faite par le développeur avec ses propres identifiants, par SSH de préférence.
- Aucune URL de distant ne contient d'identifiant ni de jeton ; `agt ls` le vérifie (D3.INV-4).
- Si l'effecteur de `tension-dashboard-gitlab-agent` est utilisé, il garde ses jetons séparés : lecture pour le tracker, écriture pour l'effecteur, expiration à 30 jours. Aucun ne va dans un worktree d'agent.

## 6. Contrôle de sortie

- Push rules cohérentes avec les hooks et `agt new` (D4.INV-1) : W38 à W40.
- Merge commit, SHA conservés (D4.INV-2) : W41.
- Aucun jeton dans le kit ni dans une URL de distant (D4.INV-3) : W44.
- Fiche de la section 1 remplie, édition comprise, et remise au Maintainer.
<<<FIN modules/gitlab/SKILL.md>>>

<<<FICHIER modules/distribution/SKILL.md>>>
---
name: distribution
description: Décider quelles demandes mener de front (fiches d'impact impact.txt, points chauds contrat, migrations, sécurité, dépendances), constater les chevauchements entre branches avec agt collisions, synchroniser sans réécrire, demandes empilées. À lire avant de distribuer des demandes à plusieurs agents.
dimensions: [D5]
status: active
---

# Module `distribution` (D5)

Phases 7E couvertes : Éléments, Engendrent.

Le parallélisme se décide avant le code. À l'étape d'impact, chaque agent écrit la liste des chemins qu'il va toucher (`agent-tdd-jira:D9.INV-5`). Deux demandes dont les listes partagent un point chaud ne sont pas menées de front.

```mermaid
flowchart LR
  I1["ECR-77<br/>impact.txt"] --> P{"agt collisions<br/>avant V3"}
  I2["ECR-78<br/>impact.txt"] --> P
  P -->|"aucun chemin commun"| F["mener de front"]
  P -->|"chemin commun ordinaire"| S["mener de front,<br/>surveiller"]
  P -->|"point chaud commun"| Q["séquencer"]
  F --> C{"agt collisions<br/>pendant la réalisation"}
  S --> C
  C -->|"CONFLIT"| D["décision du développeur"]
```

## 1. Format de `travail/<CLÉ>/impact.txt`

- un chemin relatif à la racine du worktree par ligne, pour chaque fichier cité dans la fiche d'impact, existant ou à créer ;
- lignes vides et lignes commençant par `#` ignorées ; `./` en tête et espaces en fin de ligne retirés ;
- fichier non versionné : `travail/` est exclu (D1.INV-4).

```text
# ECR-77 : chemins impactés, fiche d'impact du 2026-10-20
api/openapi.yaml
src/main/java/fr/exemple/rex/feedback/api/FeedbackController.java
src/app/features/feedback/data-access/feedback.store.ts
```

## 2. Points chauds

| Chemin commun à deux demandes | Risque | Règle |
|---|---|---|
| `api/openapi.yaml` | contrat modifié des deux côtés, clients régénérés en conflit | séquencer. Le contrat passe avant le back et le front (`agent-tdd-jira:D5.INV-5`). Un fichier généré se régénère, il ne se fusionne jamais à la main |
| migrations Flyway (`db/migration/`) | même numéro `V5__` pris deux fois : la numérotation est séquentielle (`expert-java`, module `persistance`) | réserver les numéros à la distribution, fusionner dans leur ordre : Flyway refuse par défaut une migration plus ancienne que la dernière appliquée |
| changelog Liquibase (`db/changelog/`) | lignes `include` ajoutées au même endroit | séquencer, ou fusion manuelle relue |
| configuration de sécurité | classe `sensitive` de `tension-dashboard-gitlab-agent` : toute tension y est critique (`tension-dashboard-gitlab-agent:D1.INV-3`) | séquencer |
| `pom.xml`, `package.json`, `build.gradle` | ajout de dépendance, soumis à validation (`agent-tdd-jira:D5.INV-6`) | séquencer les ajouts ; un lock file se régénère |
| `docs/demandes/<CLÉ>/` | aucun : un dossier par clé | — |

`agt` marque un chemin comme point chaud s'il correspond à l'expression étendue `AGT_POINTS_CHAUDS`. Valeur par défaut :

```text
(^|/)api/openapi\.ya?ml$|(^|/)db/(migration|changelog)/|(^|/)(pom\.xml|package\.json|build\.gradle(\.kts)?)$|[Ss]ecurity
```

## 3. Prévoir, puis constater (D5.INV-1, D5.INV-2)

`./agt collisions` compare les demandes actives deux à deux. Avant le code, il lit leurs fiches d'impact (`PRÉVISION`) ; pendant la réalisation, il compare les fichiers modifiés par leurs branches et simule la fusion. Sortie réelle de la recette, à l'état final :

```text
== ECR-78 × ECR-90 : PRÉVISION
   api/openapi.yaml [point chaud]
== ECR-78 × ECR-90 : CONFLIT
   COLLISION.md
```

| État | Sens |
|---|---|
| `PRÉVISION` | chemins communs aux deux fiches d'impact |
| `fusion propre` | fichiers communs aux deux branches, fusion simulée sans conflit |
| `CONFLIT` | fichiers communs, fusion simulée en conflit |
| `simulation impossible (git 2.38 ou plus récent requis)` | `git merge-tree --write-tree` indisponible |

Ce format est stable (point E2). `tension-dashboard-gitlab-agent` 2.2.0 mesure la tension entre un arbre de travail et sa branche distante, fichier par fichier : il s'applique à chaque worktree séparément. La tension entre deux demandes locales relève du niveau du dépôt, que ce skill réserve à sa version 3.0 ; `agt collisions` en tient lieu, à la demande (dimension réservée D7).

## 4. Synchroniser

- Par le développeur, entre deux scénarios acceptés (V4), worktree propre, jamais pendant que l'agent écrit : `./agt sync <CLÉ>`.
- Branche jamais poussée : rebase sur la base. Branche publiée : fusion de la base, sans réécriture (D3.INV-2).
- L'agent relance ensuite ses suites avant le scénario suivant (`agent-tdd-jira:D9.INV-7`).
- Un conflit est résolu par le développeur ; `agt sync` s'arrête sans rien laisser en cours.

## 5. Demandes empilées (D5.INV-3)

```bash
./agt new ECR-90 rapport feature feature/ECR-77-export-csv   # part de la branche d'ECR-77
# La merge request d'ECR-90 cible feature/ECR-77-export-csv tant qu'ECR-77 n'est pas fusionnée.
# Après la fusion d'ECR-77 par merge commit, un changement de cible suffit, sans rebase :
glab mr update <iid> --target-branch develop
```

Avec le merge commit, les commits d'ECR-77 entrent tels quels dans la base : la merge request d'ECR-90 n'a rien à rebaser. Limiter la pile à deux niveaux. Tant que la branche parente n'est pas fusionnée, `agt ls` et `agt diff` comptent aussi ses commits.

## 6. Contrôle de sortie

- Prévision par les fiches d'impact, points chauds marqués (D5.INV-1) : W35.
- Constat sur les branches, fusion simulée, format stable (D5.INV-2) : W36, W37.
- Demande empilée, puis n'apportant que ses commits après fusion de la parente (D5.INV-3) : W34, W43.
<<<FIN modules/distribution/SKILL.md>>>

<<<FICHIER modules/recette/SKILL.md>>>
---
name: recette
description: Recette du kit, recette.sh à reproduire à l'identique ; 44 contrôles W1 à W44 sans réseau ni GitLab, chacun rattaché à un invariant ; garde du dossier de test ; contre-épreuve ; résultat de référence. À lire avant de mettre le kit en service et après toute modification.
dimensions: [D1, D2, D3, D4, D5]
status: active
---

# Module `recette` (D1 à D5)

La recette rejoue 44 contrôles sur une copie locale d'un dépôt, sans réseau ni GitLab : un dépôt nu local tient lieu de distant, un second clone tient lieu d'un autre développeur. Chaque refus attendu doit venir du garde-fou visé, qui affiche « REFUS ».

```bash
./recette.sh /tmp/recette-agt ~/dev/<projet> ~/dev/<projet>/.bare
```

Arguments : le dossier de test ; le dossier du kit, qui contient `.githooks/`, `agt` et `regles-gitlab.txt` ; un dépôt source quelconque, seulement lu. Le dossier de test est recréé à chaque lancement ; le script refuse de vider un dossier qui ne vient pas d'un de ses lancements.

## 1. Contrôles

| # | Invariant | Nature | Contrôle |
|---|---|---|---|
| W1 | D1.INV-1 | refus attendu | slug hors convention refusé |
| W2 | D1.INV-1 | refus attendu | type hors convention refusé |
| W3 | D1.INV-1 | refus attendu | clé hors convention refusée |
| W4 | D1.INV-1 | contrôle | une branche ne s'extrait pas dans un second worktree |
| W5 | D1.INV-2 | contrôle | branche créée sans amont |
| W6 | D1.INV-3 | contrôle | point de retour posé et worktree verrouillé |
| W7 | D1.INV-4 | contrôle | travail/, .skills/ et .mhtml exclus partout |
| W8 | D2.INV-2 | contrôle | commit de scénario accepté |
| W9 | D2.INV-2 | contrôle | commit à clé seule accepté |
| W10 | D2.INV-2 | refus attendu | message sans le format refusé |
| W11 | D2.INV-2 | contrôle | la traçabilité retrouve tous les commits |
| W12 | D2.INV-3 | refus attendu | .mhtml forcé dans l'index refusé |
| W13 | D2.INV-3 | refus attendu | .env refusé |
| W14 | D2.INV-3 | contrôle | .env.example accepté |
| W15 | D2.INV-1 | refus attendu | commit sur develop refusé |
| W16 | D2.INV-1 | refus attendu | commit sur la branche d'une autre clé refusé |
| W17 | D1.INV-2 | contrôle | le premier push crée la branche du même nom |
| W18 | D2.INV-4 | refus attendu | push vers une autre branche refusé |
| W19 | D2.INV-4 | contrôle | branche fix/tension- acceptée |
| W20 | D2.INV-4 | refus attendu | suppression distante refusée |
| W21 | D2.INV-5 | refus attendu | réécriture + --force-with-lease refusée |
| W22 | D2.INV-5 | refus attendu | réécriture + --force refusée |
| W23 | D3.INV-1 | refus attendu | agt reset refusé si un commit est publié |
| W24 | D3.INV-2 | refus attendu | agt sync refusé sur un worktree non propre |
| W25 | D3.INV-2 | contrôle | sync d'une branche publiée : fusion |
| W26 | D2.INV-5 | contrôle | push après fusion, sans force |
| W27 | D3.INV-2 | contrôle | sync d'une branche non publiée : rebase |
| W28 | D3.INV-1 | contrôle | agt reset si rien n'est publié, sauvegarde faite |
| W29 | D3.INV-4 | contrôle | agt ls signale des hooks désactivés |
| W30 | D3.INV-4 | contrôle | agt ls signale un jeton dans une URL |
| W31 | D3.INV-4 | contrôle | agt ls sans alerte quand tout est en place |
| W32 | D3.INV-5 | contrôle | agt n'appelle pas GitLab et ne pousse rien |
| W33 | D3.INV-3 | refus attendu | agt done refusé avant fusion |
| W34 | D5.INV-3 | contrôle | demande empilée sur la branche parente |
| W35 | D5.INV-1 | contrôle | prévision : chemins communs des fiches, point chaud marqué |
| W36 | D5.INV-2 | contrôle | constat : fichiers communs aux branches, fusion simulée |
| W37 | D5.INV-2 | contrôle | format stable de la sortie (point E2) |
| W38 | D4.INV-1 | contrôle | branch_name_regex : branches d'agt et fix/tension- acceptées, backup/ refusée |
| W39 | D4.INV-1 | contrôle | commit_message_regex : accepte ce que commit-msg accepte, refuse le reste |
| W40 | D4.INV-1 | contrôle | file_name_regex est l'expression du hook pre-commit |
| W41 | D4.INV-2 | contrôle | merge commit : les commits de la demande gardent leur SHA |
| W42 | D3.INV-3 | contrôle | agt done après fusion : travail/ archivé, worktree supprimé |
| W43 | D5.INV-3 | contrôle | parente fusionnée : la demande empilée n'apporte que ses commits |
| W44 | D4.INV-3 | contrôle | aucun jeton dans le kit ni dans les URL des distants |

## 2. `recette.sh`

```bash
#!/usr/bin/env bash
# shellcheck disable=SC2034  # des variables ne sont lues que dans les chaînes évaluées par check et refus
# recette.sh : contrôles W1 à W44 du kit agents-paralleles-gitlab, sans réseau ni GitLab.
# Usage : recette.sh <dossier-de-test> <dossier-du-kit> <dépôt-source>
#   <dossier-de-test> est recréé à chaque lancement ; il doit être absent ou venir d'un lancement précédent.
#   <dossier-du-kit> contient .githooks/, agt et regles-gitlab.txt. <dépôt-source> est un dépôt git quelconque,
#   seulement lu (cloné en local).
set -u
S=${1:?dossier de test}; K=$(cd "${2:?dossier du kit}" && pwd); SRC=$(cd "${3:?dépôt source}" && pwd)
if [[ -e "$S" && ! -e "$S/.recette-agt" ]]; then
  echo "REFUS : $S existe et n'est pas un dossier de recette"; exit 2
fi
rm -rf "$S"; mkdir -p "$S" && touch "$S/.recette-agt"; cd "$S" || exit 2
export GIT_AUTHOR_NAME=recette GIT_AUTHOR_EMAIL=recette@example.org GIT_COMMITTER_NAME=recette GIT_COMMITTER_EMAIL=recette@example.org
pass=0; fail=0
ok()    { printf 'OK     %-4s %-9s %s\n' "$1" "$2" "$3"; pass=$((pass+1)); }
ko()    { printf 'ÉCHEC  %-4s %-9s %s\n' "$1" "$2" "$3"; fail=$((fail+1)); }
check() { if (eval "$4") >/dev/null 2>&1; then ok "$1" "$2" "$3"; else ko "$1" "$2" "$3"; fi; }
refus() {   # échec attendu, avec le message REFUS du garde-fou visé
  local out; if out=$( (eval "$4") 2>&1 ); then ko "$1" "$2" "$3 (accepté)"
  elif grep -q REFUS <<<"$out"; then ok "$1" "$2" "$3"; else ko "$1" "$2" "$3 (échec sans REFUS)"; fi
}
regle() { sed -n "s/^$1=//p" "$K/regles-gitlab.txt"; }

# Distant simulé : dépôt nu local, avec une branche develop ; poste d'un autre développeur
git clone --bare -q "$SRC" remote.git
git -C remote.git rev-parse -q --verify refs/heads/develop >/dev/null \
  || git -C remote.git branch develop "$(git -C remote.git symbolic-ref --short HEAD)"
git clone -q remote.git autre && git -C autre switch -q develop
pousser_develop() { (cd "$S/autre" && git pull -q && "$@" && git push -q origin develop); }

# Disposition du module isolation
mkdir monprojet && cd monprojet || exit 2
git clone --bare -q ../remote.git .bare && echo "gitdir: ./.bare" > .git
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*" && git fetch -q origin
git config rerere.enabled true; git config fetch.prune true; git config push.autoSetupRemote true
cp -r "$K/.githooks" . && git config core.hooksPath "$PWD/.githooks"
printf '%s\n' '/.skills/' '/travail/' '*.mht' '*.mhtml' >> .bare/info/exclude
git worktree add -q main develop && cp "$K/agt" ./agt

# D1 : isolation
refus W1 D1.INV-1 "slug hors convention refusé"                 './agt new ECR-81 exportCSV'
refus W2 D1.INV-1 "type hors convention refusé"                 './agt new ECR-82 export hotfix'
refus W3 D1.INV-1 "clé hors convention refusée"                 './agt new ecr-83 export'
./agt new ECR-77 export-csv >/dev/null && ./agt new ECR-78 filtres >/dev/null
check W4 D1.INV-1 "une branche ne s'extrait pas dans un second worktree" '! git -C ECR-78 switch -q feature/ECR-77-export-csv'
check W5 D1.INV-2 "branche créée sans amont"                    '! git -C ECR-77 rev-parse --abbrev-ref "@{u}"'
check W6 D1.INV-3 "point de retour posé et worktree verrouillé" 'git rev-parse -q --verify refs/tags/agent/ECR-77/start && git worktree list --porcelain | grep -A4 "/ECR-77$" | grep -q "^locked"'
check W7 D1.INV-4 "travail/, .skills/ et .mhtml exclus partout" 'mkdir -p ECR-78/.skills/x && echo s > ECR-78/.skills/x/SKILL.md && echo m > ECR-78/travail/ECR-78.mhtml && [ -z "$(git -C ECR-78 status --porcelain)" ]'

# D2 : hooks
check W8  D2.INV-2 "commit de scénario accepté"                 'cd ECR-77 && echo a > a.txt && git add a.txt && git commit -q -m "ECR-77 S01 : a"'
check W9  D2.INV-2 "commit à clé seule accepté"                 'cd ECR-77 && echo f > f.txt && git add f.txt && git commit -q -m "ECR-77 : fichiers de la demande"'
refus W10 D2.INV-2 "message sans le format refusé"              'cd ECR-77 && echo b > b.txt && git add b.txt && git commit -q -m "ECR-77: b"'
git -C ECR-77 reset -q; rm -f ECR-77/b.txt
check W11 D2.INV-2 "la traçabilité retrouve tous les commits"   '[ "$(git -C ECR-77 log --oneline --grep="^ECR-77 " | wc -l)" -eq 2 ]'
refus W12 D2.INV-3 ".mhtml forcé dans l'index refusé"           'cd ECR-77 && echo m > x.mhtml && git add -f x.mhtml && git commit -q -m "ECR-77 S02 : x"'
git -C ECR-77 rm -q --cached x.mhtml; rm -f ECR-77/x.mhtml
refus W13 D2.INV-3 ".env refusé"                                'cd ECR-77 && echo k=v > .env && git add -f .env && git commit -q -m "ECR-77 S02 : env"'
git -C ECR-77 rm -q --cached .env; rm -f ECR-77/.env
check W14 D2.INV-3 ".env.example accepté"                       'cd ECR-77 && echo k= > .env.example && git add .env.example && git commit -q -m "ECR-77 : exemple de configuration"'
refus W15 D2.INV-1 "commit sur develop refusé"                  'cd main && echo z > HOOK.md && git add HOOK.md && git commit -q -m "ECR-77 S09 : z"'
git -C main reset -q; rm -f main/HOOK.md
refus W16 D2.INV-1 "commit sur la branche d'une autre clé refusé" 'cd ECR-78 && git switch -q -c feature/ECR-77-autre && echo z > z.txt && git add z.txt && git commit -q -m "ECR-78 S01 : z"'
git -C ECR-78 reset -q; rm -f ECR-78/z.txt; git -C ECR-78 switch -q feature/ECR-78-filtres; git branch -q -D feature/ECR-77-autre
check W17 D1.INV-2 "le premier push crée la branche du même nom" 'git -C ECR-77 push -q && [ "$(git -C ECR-77 rev-parse --abbrev-ref "@{u}")" = origin/feature/ECR-77-export-csv ]'
refus W18 D2.INV-4 "push vers une autre branche refusé"         'git -C ECR-77 push -q origin HEAD:refs/heads/feature/ECR-78-filtres'
check W19 D2.INV-4 "branche fix/tension- acceptée"              'git -C ECR-77 push -q origin HEAD:refs/heads/fix/tension-demo'
refus W20 D2.INV-4 "suppression distante refusée"               'git -C ECR-77 push -q origin --delete fix/tension-demo'
git -C ECR-77 commit -q --amend -m "ECR-77 : fichiers de la demande, réécrit"
refus W21 D2.INV-5 "réécriture + --force-with-lease refusée"    'git -C ECR-77 push -q --force-with-lease'
refus W22 D2.INV-5 "réécriture + --force refusée"               'git -C ECR-77 push -q --force'
git -C ECR-77 reset -q --hard "@{u}"

# D3 : orchestration
refus W23 D3.INV-1 "agt reset refusé si un commit est publié"   './agt reset ECR-77'
refus W24 D3.INV-2 "agt sync refusé sur un worktree non propre" 'echo w > ECR-77/a.txt && ./agt sync ECR-77'
git -C ECR-77 checkout -q -- a.txt
pousser_develop sh -c 'echo n > N.md && git add N.md && git commit -q -m "chore: develop avance"'
check W25 D3.INV-2 "sync d'une branche publiée : fusion"        './agt sync ECR-77 && git -C ECR-77 rev-parse -q --verify HEAD^2'
check W26 D2.INV-5 "push après fusion, sans force"              'git -C ECR-77 push -q'
check W27 D3.INV-2 "sync d'une branche non publiée : rebase"    '(cd ECR-78 && echo y > y.txt && git add y.txt && git commit -q -m "ECR-78 S01 : y") && ./agt sync ECR-78 && ! git -C ECR-78 rev-parse -q --verify HEAD^2'
check W28 D3.INV-1 "agt reset si rien n'est publié, sauvegarde faite" './agt reset ECR-78 && [ "$(git rev-list --count origin/develop..feature/ECR-78-filtres)" -eq 0 ] && git branch --list "backup/ECR-78-*" | grep -q backup'
check W29 D3.INV-4 "agt ls signale des hooks désactivés"        'git config core.hooksPath .husky/_ && ./agt ls | grep -q "ALERTE : core.hooksPath"'
git config core.hooksPath "$PWD/.githooks"
check W30 D3.INV-4 "agt ls signale un jeton dans une URL"       'git remote add piege https://oauth2:jeton-de-test@gitlab.example.org/x.git && ./agt ls | grep -q "ALERTE : l.URL du distant piege"'
git remote remove piege
check W31 D3.INV-4 "agt ls sans alerte quand tout est en place" './agt ls | grep -q "hooks : actifs" && ! ./agt ls | grep -q ALERTE'
check W32 D3.INV-5 "agt n'appelle pas GitLab et ne pousse rien" '! grep -nE "(^|[^[:alnum:]_-])(glab|curl|wget)([^[:alnum:]_-]|$)|git push|api/v4" agt'
refus W33 D3.INV-3 "agt done refusé avant fusion"               './agt done ECR-77'

# D5 : distribution
check W34 D5.INV-3 "demande empilée sur la branche parente"     './agt new ECR-90 rapport feature feature/ECR-77-export-csv && git merge-base --is-ancestor feature/ECR-77-export-csv feature/ECR-90-rapport'
printf '%s\n' '# fiche d impact ECR-78' 'api/openapi.yaml' 'src/app/Liste.java' > ECR-78/travail/ECR-78/impact.txt
printf '%s\n' './api/openapi.yaml' 'src/app/Rapport.java' '' > ECR-90/travail/ECR-90/impact.txt
check W35 D5.INV-1 "prévision : chemins communs des fiches, point chaud marqué" './agt collisions | grep -q "^== ECR-78 × ECR-90 : PRÉVISION$" && ./agt collisions | grep -q "^   api/openapi.yaml \[point chaud\]$"'
check W36 D5.INV-2 "constat : fichiers communs aux branches, fusion simulée" '(cd ECR-78 && echo "# 78" > COLLISION.md && git add COLLISION.md && git commit -q -m "ECR-78 S02 : t") && (cd ECR-90 && echo "# 90" > COLLISION.md && git add COLLISION.md && git commit -q -m "ECR-90 S01 : t") && ./agt collisions | grep -q "^== ECR-78 × ECR-90 : CONFLIT$"'
check W37 D5.INV-2 "format stable de la sortie (point E2)"      'out=$(./agt collisions) && [ -n "$out" ] && ! grep -vqE "^(== [A-Z][A-Z0-9_]+-[0-9]+ × [A-Z][A-Z0-9_]+-[0-9]+ : .+|   .+|Aucun fichier en commun entre les demandes actives\.)$" <<<"$out"'

# D4 : GitLab (expressions de regles-gitlab.txt)
rb=$(regle branch_name_regex); rm_=$(regle commit_message_regex); rm_=${rm_#'(?-m)'}; rf=$(regle file_name_regex)
br_ok=(feature/ECR-77-export-csv fix/ECR-145-npe-login chore/ABC2-9-lint fix/tension-orchestrator-delta)
br_ko=(backup/ECR-77-20261020T063700 develop feature/ECR-77 feature/ecr-77-x feature/ECR-77-exportCSV)
msg_ok=("ECR-77 S01 : a" "ECR-77 : b")
msg_ko=("ECR-77: c" "wip" $'wip\nECR-77 S01 : caché en deuxième ligne')
msg_fusion="Merge remote-tracking branch 'origin/develop' into feature/ECR-77-export-csv"
check W38 D4.INV-1 "branch_name_regex : branches d'agt et fix/tension- acceptées, backup/ refusée" \
  'for b in "${br_ok[@]}"; do [[ $b =~ $rb ]] || exit 1; done; for b in "${br_ko[@]}"; do ! [[ $b =~ $rb ]] || exit 1; done'
check W39 D4.INV-1 "commit_message_regex : accepte ce que commit-msg accepte, refuse le reste" \
  'for m in "${msg_ok[@]}"; do printf "%s\n" "$m" > ECR-77/.msg && (cd ECR-77 && ../.githooks/commit-msg .msg) && [[ $m =~ $rm_ ]] || exit 1; done; rm -f ECR-77/.msg; [[ $msg_fusion =~ $rm_ ]] || exit 1; for m in "${msg_ko[@]}"; do ! [[ $m =~ $rm_ ]] || exit 1; done'
check W40 D4.INV-1 "file_name_regex est l'expression du hook pre-commit" 'grep -qF -- "$rf" .githooks/pre-commit'
sha_s01=$(git log -1 --format=%H --grep="^ECR-77 S01 " feature/ECR-77-export-csv)
pousser_develop git merge -q --no-ff origin/feature/ECR-77-export-csv -m "Merge branch 'feature/ECR-77-export-csv' into 'develop'"
check W41 D4.INV-2 "merge commit : les commits de la demande gardent leur SHA" 'git fetch -q origin && git merge-base --is-ancestor "$sha_s01" origin/develop'
check W42 D3.INV-3 "agt done après fusion : travail/ archivé, worktree supprimé" 'echo "{}" > ECR-77/travail/ECR-77/demande.json && ./agt done ECR-77 && ls archives-travail/ECR-77-*/ECR-77/demande.json && [ ! -d ECR-77 ] && ! git rev-parse -q --verify refs/tags/agent/ECR-77/start'
check W43 D5.INV-3 "parente fusionnée : la demande empilée n'apporte que ses commits" '[ -z "$(git log --no-merges --format=%s origin/develop..feature/ECR-90-rapport | grep -v "^ECR-90 ")" ]'

check W44 D4.INV-3 "aucun jeton dans le kit ni dans les URL des distants" '! git remote -v | grep -qE "https?://[^/]*@" && ! grep -rqE "glpat-|PRIVATE-TOKEN|oauth2:" .githooks agt'

echo "--- $pass réussis, $fail en échec"
[[ $fail -eq 0 ]]
```

## 3. Contre-épreuve

Une recette qui ne voit pas un garde-fou cassé ne prouve rien. Contre-épreuve faite pour la 1.0.0 : avec un `commit-msg` qui accepte tout et un `pre-push` qui ne compare plus les têtes, W10, W21 et W22 échouent et les autres contrôles réussissent. Après toute modification d'un garde-fou, refaire une contre-épreuve sur ce garde-fou.

## 4. Résultat de référence

Sur une copie du dépôt Agent2Prompt, git 2.43, bash 5.2 : `--- 44 réussis, 0 en échec`.

## 5. Contrôle de sortie

- Dernière ligne `--- 44 réussis, 0 en échec`, et code de sortie 0.
- Chaque invariant de D1 à D5 est vérifié par au moins un contrôle du tableau : D1.INV-1 à D1.INV-4, D2.INV-1 à D2.INV-5, D3.INV-1 à D3.INV-5, D4.INV-1 à D4.INV-3, D5.INV-1 à D5.INV-3.
<<<FIN modules/recette/SKILL.md>>>

<<<FICHIER modules/controle-gitlab/SKILL.md>>>
---
name: controle-gitlab
description: Dimension réservée D6, contrôle de la configuration GitLab par l'API en lecture seule (push rules comparées à regles-gitlab.txt, branches protégées, méthode de fusion, squash, pipeline obligatoire). Ne pas implémenter en 1.x ; lire uniquement pour comprendre le point d'extension E1.
dimensions: [D6]
status: reserved
---

# Module `controle-gitlab` (D6, réservé)

Statut : `reserved`. En 1.x, la configuration GitLab est vérifiée à la main par le Maintainer, à partir de la fiche du module `gitlab`.

## 1. Pourquoi cette dimension existe

La sécurité effective repose sur la configuration de GitLab, qui peut dériver : une push rule supprimée, la méthode de fusion changée, le squash autorisé de nouveau. Un contrôle en lecture seule, rejouable, détecterait ces dérives avant qu'un agent n'en profite.

## 2. Principe prévu

```mermaid
flowchart LR
  R["regles-gitlab.txt"] --> C["contrôle D6<br/>lecture seule"]
  A["API GitLab<br/>push rule, branches protégées,<br/>réglages du projet"] --> C
  C --> E["écarts, réglage par réglage"]
```

- une commande distincte d'`agt`, avec un jeton en lecture seule fourni par l'environnement, jamais par un fichier du kit ;
- comparaison champ par champ, sans conversion, grâce aux noms d'attributs de l'API (E1) ;
- tests sur des réponses d'API enregistrées, sans réseau ;
- les champs exacts des réglages du projet et des branches protégées seront vérifiés dans la documentation de l'API à l'activation.

## 3. Ce que prépare le point d'extension

| Point | Règle active en 1.x | Rôle à l'activation |
|---|---|---|
| E1 | `regles-gitlab.txt` porte les noms d'attributs de l'API ; aucune commande d'`agt` n'appelle GitLab | comparaison directe avec `GET /projects/:id/push_rule` ; le contrôle reste hors d'`agt` |

## 4. Test d'inertie en 1.x

Contrôle W32 : `agt` ne contient aucun appel à GitLab (`glab`, `curl`, `wget`, `api/v4`) ni aucun `git push`.
<<<FIN modules/controle-gitlab/SKILL.md>>>

<<<FICHIER modules/tension-depot/SKILL.md>>>
---
name: tension-depot
description: Dimension réservée D7, tension entre demandes au niveau du dépôt, suivie en continu avec tension-dashboard-gitlab-agent 3.0 à la place d'agt collisions lancé à la demande. Ne pas implémenter en 1.x ; lire uniquement pour comprendre le point d'extension E2.
dimensions: [D7]
status: reserved
---

# Module `tension-depot` (D7, réservé)

Statut : `reserved`. En 1.x, le développeur lance `agt collisions` à la demande.

## 1. Pourquoi cette dimension existe

`tension-dashboard-gitlab-agent` 2.2.0 mesure, fichier par fichier, la tension entre un arbre de travail et sa branche distante. Avec plusieurs worktrees, une tension naît aussi entre deux demandes locales, avant toute publication. Ce skill réserve à sa version 3.0 les niveaux du dépôt et de la chaîne d'agents : communication entre agents, régulation de second niveau, rapport de couplage.

## 2. Principe prévu

- une surveillance continue des chevauchements entre demandes, lue dans le format stable d'`agt collisions` (E2) ou recalculée de la même façon ;
- les métriques de couplage du méta-niveau de `tension-dashboard-gitlab-agent`, dont la charge de validation du développeur (`arbitration_load`) ;
- aucun arbitrage de contenu automatique : le développeur décide.

## 3. Ce que prépare le point d'extension

| Point | Règle active en 1.x | Rôle à l'activation |
|---|---|---|
| E2 | sortie d'`agt collisions` au format stable : `== <CLÉ> × <CLÉ> : <ÉTAT>`, puis un chemin par ligne | lecture par D7 sans changer `agt` |

## 4. Test d'inertie en 1.x

Contrôle W37 : chaque ligne de la sortie d'`agt collisions` respecte le format du point E2.
<<<FIN modules/tension-depot/SKILL.md>>>

---

# Table d'intégrité (sha256)

Format compatible `sha256sum -c`, à exécuter depuis `spec/`.

    254465cbf0f85339bfed803fab0478c341ee7a754315a7bf1e143d9b639c218e  manifest.json
    65c4ee3bc31bcc6120eeecf4e4d9ed1ddfabda02c53c1ce53274e725f66dad52  SKILL.md
    5fd4d5fbe5c01a29bc588e7867a73c8afb24f93e8e91e37921cc6dfd5c579e83  modules/isolation/SKILL.md
    27dd2129edada96a5719fcb0863ed35071db89e869509f1276cabe2bf6888370  modules/hooks/SKILL.md
    4435cf1058f9fcb80482d7a7306e1a88d423deff46292bcd4de68ac8196504ee  modules/orchestration/SKILL.md
    de3fcb5d8563a377c5fcce4e7c2b730d7cb544b120ef835dd182700c013a5e82  modules/gitlab/SKILL.md
    4eef90d653e468796cf5fa7adc199067766addb5c5349cc5f30f2ad66ac60158  modules/distribution/SKILL.md
    8ad0c5af336dc5e649151fe4e81e3173e6fe0993ee7d6935e693edfa40e56ca5  modules/recette/SKILL.md
    ccff567036a44f0d4e192642492d3958ad9ffd4909fb634bfeb8cabbbc70b602  modules/controle-gitlab/SKILL.md
    e1e70bec1b1753c51ca1b54121e6d5f92848b8a62cd7cdb605926e966862f315  modules/tension-depot/SKILL.md
