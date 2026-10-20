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
