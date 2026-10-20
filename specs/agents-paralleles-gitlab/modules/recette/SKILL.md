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
