---
name: branches
description: Branches git et fichiers par branche (git for-each-ref en un appel, sans shell et à séparateurs nuls, branches locales et distantes, références symboliques écartées, branche courante du worktree source, amont, avance et retard, worktree d'extraction, format last_commit d'origine, base de branch_files, ancêtre commun, statuts et lignes ajoutées ou retirées, requêtes utiles). À lire pour git-scan, et pour interpréter git_branches et branch_files.
dimensions: [D3]
status: active
---

# Module `branches` (D3)

Phases 7E couvertes : Éléments et Engendrent.

## 1. Lecture des références (D1.INV-1, D3.INV-1)

Un seul appel à git lit toutes les références, avec des champs séparés par l'octet nul et une liste d'arguments, sans shell :

```bash
git -C <source> for-each-ref --format='%(refname)%00%(symref)%00%(HEAD)%00%(objectname)%00%(objectname:short)%00%(committerdate:iso-strict)%00%(upstream:short)%00%(upstream:track,nobracket)%00%(worktreepath)%00%(subject)' refs/heads refs/remotes
```

Un nom de branche n'est jamais réécrit ni interprété : `x;touch${IFS}PWNED`, nom que git accepte, est stocké tel quel et n'exécute rien. Ni `git branch` ni sa mise en forme (`*`, `+`, couleurs) ne sont lus.

| Colonne de `git_branches` | Source |
|---|---|
| `branch_name` | `refname` sans `refs/heads/` ni `refs/remotes/` : `main`, `feature/ECR-77-export`, `origin/main` |
| `is_remote` | 1 pour `refs/remotes/` |
| `is_current` | `%(HEAD)`, relatif au worktree source : chaque worktree a sa branche courante |
| `last_commit` | `"<sha court> - <sujet>"`, format de la version d'origine |
| `commit_sha`, `commit_subject`, `committed_at` | `objectname`, `subject`, `committerdate:iso-strict` |
| `upstream`, `track`, `ahead`, `behind` | `upstream:short` et `upstream:track,nobracket` (`ahead 1, behind 2`, `gone`) ; avance et retard nuls sans amont ou amont disparu |
| `worktree_path` | `%(worktreepath)` : où la branche est extraite, dans n'importe quel worktree du dépôt ; chemin réel, au format de la plateforme qui exécute le skill (`C:\dev\projet\ECR-77` sous Windows, et non le `C:/dev/projet/ECR-77` de git), D12.INV-2 |
| `updated_at` | date de la lecture |

Les références symboliques (`origin/HEAD`) sont écartées. Le miroir du watcher, détaché, n'extrait aucune branche : il n'apparaît dans aucun `worktree_path`.

## 2. Fichiers par branche (D3.INV-2)

Base : `--base <ref>` si elle est donnée et existe (sinon code 1) ; à défaut, la cible de `origin/HEAD`, puis `main`, `master`, `develop`. Sans base trouvée, `branch_files` reste vide et `git-scan` le dit (`"base": null`).

Pour chaque branche locale :

```bash
git merge-base <sha de la base> <sha de la branche>
git diff --name-status -z --no-renames <ancêtre> <sha de la branche>
git diff --numstat -z --no-renames <ancêtre> <sha de la branche>
```

| Colonne de `branch_files` | Contenu |
|---|---|
| `branch_name`, `base`, `merge_base` | la branche, la base retenue, l'ancêtre commun |
| `path`, `status` | `A` ajouté, `M` modifié, `D` supprimé, `T` type changé ; un renommage compte comme `D` plus `A` |
| `added`, `deleted` | lignes ajoutées et retirées ; nulles pour un binaire |

Les commits arrivés sur la base après l'ancêtre commun n'y figurent pas : `branch_files` ne montre que le travail de la branche.

## 3. Requêtes utiles

```sql
-- branches en retard sur leur amont
SELECT branch_name, upstream, ahead, behind FROM git_branches WHERE behind > 0 ORDER BY behind DESC;
-- fichiers touchés par plusieurs branches locales : conflits possibles
SELECT path, group_concat(branch_name, ', ') AS branches, count(*) AS n
FROM branch_files GROUP BY path HAVING n > 1 ORDER BY n DESC;
-- où chaque branche est extraite
SELECT branch_name, worktree_path FROM git_branches WHERE worktree_path IS NOT NULL;
```

`branch_files` donne le côté local d'une tension ; le côté distant, les fichiers modifiés sur l'amont depuis l'ancêtre commun, relève d'une version suivante.

## 4. Quand la lecture a lieu

- `git-scan`, à la demande ; refusé tant qu'un watcher est actif (D6.INV-3), puisqu'il la fait lui-même.
- Le watcher, dans la transaction de chaque synchronisation, et dès qu'une référence change (fetch, nouvelle branche), repéré par une empreinte de `for-each-ref`.

## 5. Contrôle de sortie

- Nom piégé stocké tel quel, aucune commande exécutée (D1.INV-1) : T1.
- Branches locales et distantes, courante, amont, avance, retard, worktree ; pas de `+`, pas de `origin/HEAD` (D3.INV-1) : T12.
- Fichiers de la branche depuis l'ancêtre commun, statuts et lignes (D3.INV-2) : T13.
