---
name: cadrage-acces
description: Cadrage d'une intervention SonarQube et accès à l'instance (choix des missions et du périmètre, détection de la version, de l'édition et du mode, jeton du compte Sonar en variable d'environnement, appels de lecture libres, appels d'écriture validés, catalogue des appels d'API, analyse sous une branche de travail et outil MCP admis pour l'examen local). À lire avant tout appel à SonarQube.
dimensions: [D1]
status: active
---

# Module `cadrage-acces` (D1)

Ce module fixe ce que l'expert va faire, sur quoi, et comment il touche SonarQube. Le jeton du compte Sonar porte toutes les permissions de ce compte, y compris d'administration : il est traité comme un secret de production.

## 1. Déroulé

```mermaid
flowchart TD
  D(["Demande"]) --> M["Missions et périmètre<br/>projets, branche ou MR"]
  M --> OK{"Explicites ?"}
  OK -->|non| M
  OK -->|oui| J{"SONAR_TOKEN et<br/>SONAR_HOST_URL présents ?"}
  J -->|non| DEM["Demander au développeur<br/>de les définir dans son environnement"]
  J -->|oui| V["Valider le jeton<br/>/api/authentication/validate"]
  V --> I["Relever l'instance<br/>version, édition, mode"]
  I --> P["Relever les permissions<br/>/api/users/current"]
  P --> F["Fiche de cadrage<br/>confirmée par le développeur"]
```

## 2. Fiche de cadrage

```markdown
## Cadrage SonarQube confirmé

- **Missions** : trier, corriger ou planifier
- **Projets** : `acme-api` (back), `acme-web` (front)
- **Branche ou MR** : MR !412 sur `acme-api`
- **Instance** : SonarQube Server 2026.1 LTA, édition Developer, mode MQR
- **Permissions du compte** : Browse, Administer Issues sur les deux projets ; pas d'administration globale
- **Écritures envisagées** : transitions d'issues et commentaires, après validation
```

Les permissions relevées bornent ce que l'expert peut proposer : il ne propose pas une modification de quality gate si le compte n'a pas le droit de l'appliquer, mais il peut la préparer pour un administrateur.

## 3. Le jeton (D1.INV-2)

- Le développeur définit `SONAR_HOST_URL` et `SONAR_TOKEN` dans son environnement. L'expert ne lui demande jamais de coller le jeton dans la conversation ; si le jeton y apparaît, l'expert le signale et recommande de le révoquer.
- Le jeton ne figure jamais dans un fichier versionné, un journal, un rapport, une URL ni un argument de ligne de commande, car la liste des processus et l'historique du shell exposent les arguments.
- Recommandation, à faire valider : un compte dédié aux automatisations, avec les seules permissions nécessaires, plutôt que le jeton d'un compte personnel administrateur.

Fonctions d'appel : l'en-tête d'authentification est transmis à `curl` par son entrée standard, jamais en argument.

```bash
# Lecture : libre
sonar_get() {   # usage : sonar_get "/api/issues/search?components=acme-api&ps=1"
  curl -fsS --config - "${SONAR_HOST_URL%/}$1" <<EOF
header = "Authorization: Bearer ${SONAR_TOKEN}"
EOF
}

# Écriture : uniquement après validation explicite (D1.INV-3)
sonar_post() {  # usage : sonar_post "/api/issues/add_comment" "issue=AYx..." "text=..."
  local chemin="$1"; shift
  local args=()
  for kv in "$@"; do args+=(--data-urlencode "$kv"); done
  curl -fsS -X POST --config - "${args[@]}" "${SONAR_HOST_URL%/}${chemin}" <<EOF
header = "Authorization: Bearer ${SONAR_TOKEN}"
EOF
}
```

L'authentification par en-tête `Bearer` est celle des versions récentes de SonarQube Server. Si l'instance la refuse, l'expert le signale et propose l'authentification par jeton en nom d'utilisateur (`-u "${SONAR_TOKEN}:"`) passée de la même façon par `--config -` (`user = "…:"`).

## 4. Catalogue des appels (point E1)

Tout accès à SonarQube passe par ce catalogue. Avant un appel d'écriture, l'expert vérifie ses paramètres dans la documentation de l'API web intégrée à l'instance (page `/web_api`), car certains paramètres changent d'une version à l'autre.

### 4.1 Lecture

| Besoin | Appel |
|---|---|
| Instance joignable | `GET /api/system/status` |
| Version | `GET /api/server/version` |
| Édition et informations globales | `GET /api/navigation/global` |
| Jeton valide | `GET /api/authentication/validate` |
| Compte et permissions globales | `GET /api/users/current` |
| Projets visibles | `GET /api/components/search?qualifiers=TRK&q=<texte>` |
| Branches, merge requests | `GET /api/project_branches/list?project=<clé>`, `GET /api/project_pull_requests/list?project=<clé>` |
| État du quality gate | `GET /api/qualitygates/project_status?projectKey=<clé>&branch=<b>` ou `&pullRequest=<id>` |
| Mesures | `GET /api/measures/component?component=<clé>&metricKeys=<liste>&branch=<b>` |
| Issues | `GET /api/issues/search?components=<clé>&branch=<b>&inNewCodePeriod=true&ps=500&p=<n>` |
| Revues de sécurité (Security Hotspots, si exposés) | `GET /api/hotspots/search?project=<clé>&branch=<b>&status=TO_REVIEW` |
| Règle | `GET /api/rules/show?key=<langage:Snnnn>` |
| Quality gate du projet | `GET /api/qualitygates/get_by_project?project=<clé>`, puis `GET /api/qualitygates/show?name=<nom>` |
| Profils du projet | `GET /api/qualityprofiles/search?project=<clé>` |
| Définition du nouveau code | `GET /api/new_code_periods/show?project=<clé>&branch=<b>` |
| Règles actives d'un profil (examen local) | `GET /api/rules/search?qprofile=<clé du profil>&activation=true&ps=500&p=<n>` |

`/api/issues/search` renvoie au plus 500 éléments par page et ne permet pas de parcourir au-delà de 10 000 résultats. Au-delà, l'expert découpe la requête (par qualité logicielle, par gravité, par date de création) au lieu de conclure sur un échantillon tronqué.

### 4.2 Écriture (après validation)

| Action | Appel | Permission requise |
|---|---|---|
| Commenter une issue | `POST /api/issues/add_comment` (`issue`, `text`) | Browse |
| Changer le statut d'une issue | `POST /api/issues/do_transition` (`issue`, `transition` = `accept`, `falsepositive`, `reopen`) | Administer Issues |
| Statuer sur un Security Hotspot | `POST /api/hotspots/change_status` (`hotspot`, `status`, `resolution`, `comment`) | Administer Security Hotspots |
| Créer ou modifier un quality gate | `POST /api/qualitygates/create`, `/create_condition`, `/update_condition`, `/select` | Administer Quality Gates |
| Créer ou modifier un profil | `POST /api/qualityprofiles/copy`, `/change_parent`, `/activate_rule`, `/add_project` | Administer Quality Profiles |
| Définir le nouveau code | `POST /api/new_code_periods/set` | Administer sur le projet |
| Analyser le code local sous une branche de travail (examen local) | scanner Maven ou npm avec `sonar.branch.name=local-…` (module `examen-local`, § 5) | Execute Analysis sur le projet |
| Supprimer la branche de travail (examen local) | `POST /api/project_branches/delete` (`project`, `branch`) | Administer sur le projet |

### 4.3 Proposition d'écriture (D1.INV-3)

Chaque écriture est présentée ainsi, et attend un « oui » explicite :

```markdown
**Écriture proposée** (1 appel)
- `POST /api/issues/do_transition` : issue `AZ3k…` (java:S2077, `OrderSearch.java`), transition `falsepositive`
- précédée de `POST /api/issues/add_comment` : « Faux positif : la requête n'utilise que des
  identifiants de colonnes issus d'une énumération fermée (SortField), jamais une entrée utilisateur. »
- **Réversible** : oui, par la transition `reopen`
- **Permission** : Administer Issues (présente sur le compte)

Valider ?
```

Un lot de transitions est présenté sous forme de tableau, avec une validation pour le lot entier, et l'expert rejoue la lecture après application pour vérifier le résultat.

### 4.4 Outil MCP admis (examen local)

Un seul outil du serveur MCP de Sonar entre au catalogue en 1.1 : l'analyse locale par SonarQube for IDE, pour le moteur SonarLint de l'examen local (module `examen-local`, § 6). Le reste de la dimension D7 demeure réservé.

| Besoin | Outil | Condition |
|---|---|---|
| Analyser des fichiers locaux avec les règles du profil, sans envoi | `analyze_file_list` (toolset `ide`) | SonarQube for IDE ouvert, en mode connecté à l'instance ; jeton utilisateur |
| Repli, si `analyze_file_list` est indisponible | `analyze_code_snippet` (toolset `analysis`), avec `projectKey` | outil déprécié, à signaler à chaque usage |

Le jeton est transmis au serveur MCP par la variable `SONARQUBE_TOKEN`, reprise de `SONAR_TOKEN` dans l'environnement, jamais en argument (D1.INV-2). L'expert lit les paramètres de ces outils dans la liste exposée par le serveur MCP, à sa version installée.

## 5. Détection de l'instance (D1.INV-4)

| Élément | Comment | Effet |
|---|---|---|
| Version | `/api/server/version` | sections du skill applicables (revues de sécurité, paramètres d'API) |
| Édition | `/api/navigation/global` (champ d'édition) | analyse des branches et des MR disponibles ou non |
| Mode MQR ou expérience standard | `/api/settings/values?keys=sonar.multi-quality-mode.enabled` (clé à vérifier sur l'instance) ; à défaut, forme des issues renvoyées | champs utilisés pour le triage : qualités logicielles et gravités d'impact (MQR), ou type et sévérité (standard) |

Si un élément ne peut pas être relevé (permission insuffisante), l'expert le note comme limite et le demande au développeur.

## 6. Pièges connus

- **Jeton dans l'historique du shell** : `export SONAR_TOKEN=...` tapé en clair s'y retrouve. Suggérer une lecture masquée (`read -rs SONAR_TOKEN && export SONAR_TOKEN`).
- **Jeton d'analyse confondu avec un jeton utilisateur** : un jeton d'analyse de projet ou global sert au scanner, pas aux appels de l'API de triage. Le jeton du compte Sonar sert ici aux deux, ce qui en élargit l'usage : raison de plus pour le protéger.
- **Résultats tronqués** : voir la limite de 10 000 au § 4.1.
- **Branche implicite** : sans paramètre `branch`, l'API répond pour la branche principale. Toujours préciser la branche ou la MR du périmètre.
- **Scanner local sans branche** : la même règle vaut pour le scanner ; lancé en local sans `sonar.branch.name`, il écrit sur la branche principale (module `examen-local`, D9.INV-2).

## 7. Contrôle de sortie

- La fiche de cadrage est confirmée (D1.INV-1).
- Le jeton n'apparaît dans aucune sortie, aucun fichier, aucun argument (D1.INV-2).
- Aucune écriture n'a été faite sans validation (D1.INV-3).
- Version, édition et mode sont relevés ou déclarés inconnus (D1.INV-4).
