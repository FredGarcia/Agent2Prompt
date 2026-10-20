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
