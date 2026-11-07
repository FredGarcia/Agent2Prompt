---
name: configuration
description: Configuration observée par la commande config (quatre couches de réglages et leurs emplacements par système, ordre de l'hôte, couche du workspace écartée et sa raison, lecture avec commentaires et fichier illisible, réglages observés et pourquoi chacun compte, surcharges par l'environnement et par les options, confiance du dossier dans l'ordre de l'hôte, fichier .env que l'hôte chargerait, variables observées en liste fermée, retrait de variables par l'hôte). À lire avant d'expliquer un réglage, la confiance ou l'environnement.
dimensions: [D3]
status: active
---

# Module `configuration` (D3)

Phase 7E couverte : Espace et Engendrent.

## 1. Couches de réglages (D3.INV-1)

Repère vérifié sur Gemini CLI 0.67.0 (`reference/configuration.md` et code) : quatre fichiers de réglages, en JSON avec commentaires, s'appliquent du plus faible au plus fort, puis les variables d'environnement, puis les options de lancement.

| Couche | Emplacement | Note |
|---|---|---|
| défauts système | `/etc/gemini-cli/system-defaults.json`, `C:\ProgramData\gemini-cli\system-defaults.json`, `/Library/Application Support/GeminiCli/system-defaults.json` ; variable `GEMINI_CLI_SYSTEM_DEFAULTS_PATH` | base commune, la plus faible |
| utilisateur | `~/.gemini/settings.json` (`~` vaut `GEMINI_CLI_HOME` si elle est posée) | |
| workspace | `<racine>/.gemini/settings.json` | ignorée si le dossier n'est pas fiable ; confondue avec l'utilisateur si la racine est l'accueil |
| système | `/etc/gemini-cli/settings.json`, `C:\ProgramData\gemini-cli\settings.json`, `/Library/Application Support/GeminiCli/settings.json` ; variable `GEMINI_CLI_SYSTEM_SETTINGS_PATH` | l'emporte sur les autres fichiers : réglages imposés par un administrateur |

Pour chaque couche, `config` rend son chemin, sa présence, sa lisibilité, si elle est prise en compte (et sinon pourquoi) et ses clés de premier niveau. Pour chaque réglage observé (§ 2), la valeur effective est celle de la couche la plus haute qui le définit, avec le nom de cette couche. C'est une règle simplifiée : l'hôte fusionne certaines listes ; `regle_de_fusion` le rappelle, et sa documentation fait foi pour un cas limite.

Un fichier illisible est signalé avec sa ligne, sans aucun extrait de son contenu, et n'est pas pris en compte ; les autres couches restent lues (D3.INV-2). Pour l'hôte, un fichier de réglages invalide est une erreur qui l'empêche de démarrer [repère : code de Gemini CLI 0.67.0].

## 2. Réglages observés

Une liste fermée : un réglage hors de la liste n'est jamais rendu, même présent (D3.INV-1, D8.INV-1).

| Réglage | Pourquoi il compte pour une explication |
|---|---|
| `model.name`, `model.compressionThreshold`, `model.maxSessionTurns` | modèle demandé ; seuil de compression du contexte ; longueur de session |
| `general.defaultApprovalMode` | mode d'approbation par défaut : `default`, `auto_edit` ou `plan` ; `yolo` ne s'active que par une option de lancement |
| `general.sessionRetention.enabled`, `general.sessionRetention.maxAge`, `general.sessionRetention.maxCount` | nettoyage des sessions au lancement : âge et nombre gardés (module `contexte`, § 4) |
| `context.fileName`, `context.memoryBoundaryMarkers`, `context.includeDirectoryTree`, `context.includeDirectories`, `context.loadMemoryFromIncludeDirectories`, `context.discoveryMaxDirs`, `context.fileFiltering.respectGitIgnore`, `context.fileFiltering.respectGeminiIgnore` | noms des fichiers de contexte, limite de leur recherche vers le haut, arborescence envoyée au premier tour, dossiers ajoutés, fichiers que les outils voient |
| `security.folderTrust.enabled`, `security.environmentVariableRedaction.enabled`, `security.auth.selectedType`, `security.allowedEnvironmentVariables`, `security.blockedEnvironmentVariables` | confiance des dossiers ; retrait de variables sensibles ; mode d'authentification (son nom, jamais d'identifiant) |
| `tools.sandbox`, `tools.core`, `tools.exclude`, `tools.discoveryCommand` | bac à sable ; liste blanche des outils intégrés ; outils exclus ; outils découverts par une commande (présence seulement) |
| `skills.enabled`, `skills.disabled`, `hooksConfig.enabled`, `hooksConfig.disabled`, `mcp.allowed`, `mcp.excluded`, `mcp.serverCommand` | composants activés, désactivés, filtrés (présence seulement pour la commande) |
| `agents.overrides` | sous-agents réglés : leur nom et `enabled`, rien d'autre |
| `experimental` | drapeaux expérimentaux : valeur des booléens et des nombres, « défini » pour le reste |
| `admin.*` | réglages imposés par l'administrateur : mode sécurisé, extensions, MCP, skills |
| `telemetry.enabled`, `telemetry.target`, `telemetry.logPrompts`, `telemetry.otlpEndpoint`, `privacy.usageStatisticsEnabled`, `general.enableAutoUpdate`, `general.enableAutoUpdateNotification` | ce qui sort du poste en dehors des requêtes au modèle : télémétrie, et si les prompts y figurent ; statistiques d'usage ; recherche de mise à jour (repère H1 ; présence seulement pour l'adresse de télémétrie) |
| `policyPaths`, `adminPolicyPaths`, `advanced.ignoreLocalEnv`, `advanced.excludedEnvVars` | politiques supplémentaires ; règles du fichier `.env` |

Un réglage absent de toutes les couches n'est pas rendu : il prend le défaut de l'hôte, que donne sa documentation (`reference/configuration.md`), jamais le script.

## 3. Surcharges

- Par l'environnement, nommées dans `surcharges_environnement` : `GEMINI_MODEL` remplace `model.name`, `GEMINI_SANDBOX` remplace `tools.sandbox`, `GEMINI_SYSTEM_MD` remplace le prompt système entier par un fichier [documenté : `cli/system-prompt.md`]. Une explication du prompt système commence par vérifier cette dernière.
- Par les options de lancement, observées sous Linux et WSL (module `hote`, § 4) : `-m` l'emporte sur `GEMINI_MODEL`, qui l'emporte sur `model.name` [documenté : `cli/model-routing.md`].

## 4. Confiance du dossier (D3.INV-3)

Un dossier non fiable fait tourner l'hôte en mode restreint : réglages du workspace, fichiers `.env` du projet, commandes personnalisées (y compris celles de l'utilisateur), serveurs MCP, contexte du projet et approbation automatique sont désactivés [documenté : `cli/trusted-folders.md` ; code de 0.67.0 pour le contexte]. Le script évalue la confiance dans l'ordre du code de l'hôte :

1. `GEMINI_RESTRICTED_MODE=true` ou `GEMINI_CLI_TRUST_WORKSPACE=false` : non fiable ; `GEMINI_CLI_TRUST_WORKSPACE=true` : fiable. Source : variable d'environnement. L'option `--skip-trust` a le même effet que la seconde (module `hote`, § 4).
2. `security.folderTrust.enabled` à `false`, hors couche du workspace : tout dossier est fiable.
3. Un IDE compagnon connecté peut imposer sa confiance : le script ne l'observe pas, et le dit (`note`).
4. Le fichier des dossiers de confiance, `~/.gemini/trustedFolders.json` ou `GEMINI_CLI_TRUSTED_FOLDERS_PATH` : chaque règle associe un chemin à `TRUST_FOLDER`, `TRUST_PARENT` (qui vaut pour le dossier parent du chemin) ou `DO_NOT_TRUST` ; la règle la plus longue qui contient la racine l'emporte. Les chemins se comparent sans casse sous Windows et macOS.
5. Sinon : `indéterminée`. L'hôte interactif le demande au premier lancement ; en mode non interactif, il s'arrête sur une erreur de dossier non fiable.

## 5. Fichier `.env` (D3.INV-4)

Le fichier que l'hôte chargerait, selon son code en 0.67.0, qui diffère de sa documentation : en partant de la racine et en remontant jusqu'à la racine du système, le premier trouvé de `<dossier>/.gemini/.env` (dossier fiable seulement) et `<dossier>/.env` ; à défaut, `~/.gemini/.env` (dossier fiable seulement), puis `~/.env`. Avec `advanced.ignoreLocalEnv`, seul le `.env` de l'accueil compte parmi les `.env` simples. La documentation dit que la remontée s'arrête à la racine du projet ou à l'accueil (module `modele-hote`, § 10).

Le script rend le chemin, en déduit, et les noms de ses variables ; une valeur seulement pour les variables non secrètes de la liste du § 6.

## 6. Variables d'environnement (D3.INV-4)

Une liste fermée ; toute autre variable est ignorée.

- **Valeur rendue, masquée par motifs** : `GEMINI_CLI`, `GEMINI_MODEL`, `GEMINI_SANDBOX`, `SANDBOX`, `GEMINI_SYSTEM_MD`, `GEMINI_WRITE_SYSTEM_MD`, `GEMINI_CLI_HOME`, `GEMINI_CLI_TRUST_WORKSPACE`, `GEMINI_RESTRICTED_MODE`, `GEMINI_CLI_TRUSTED_FOLDERS_PATH`, `GEMINI_CLI_SYSTEM_SETTINGS_PATH`, `GEMINI_CLI_SYSTEM_DEFAULTS_PATH`, `GEMINI_CLI_SURFACE`, `GOOGLE_CLOUD_LOCATION`, `GOOGLE_GENAI_USE_VERTEXAI`, `GOOGLE_GENAI_USE_GCA`, `GEMINI_TELEMETRY_ENABLED`, `GEMINI_TELEMETRY_TARGET`, `GEMINI_TELEMETRY_LOG_PROMPTS`, `CI`, `GITHUB_ACTIONS`, `GEMINI_CLI_INTEGRATION_TEST`. Les trois dernières décident du mode non interactif : `CI` ou `GITHUB_ACTIONS` à `true` y met l'hôte, même sous un terminal, sauf `GEMINI_CLI_INTEGRATION_TEST=true` (repère H17).
- **Présence seulement** : `GEMINI_API_KEY`, `GOOGLE_API_KEY`, `GOOGLE_APPLICATION_CREDENTIALS`, `GOOGLE_CLOUD_PROJECT`, `GOOGLE_GEMINI_BASE_URL`, `GOOGLE_VERTEX_BASE_URL`, `CODE_ASSIST_ENDPOINT`, `GEMINI_TELEMETRY_OTLP_ENDPOINT`, `GEMINI_TELEMETRY_OTLP_HEADERS`.

Lancé par l'hôte, le script reçoit l'environnement que l'hôte donne à ses commandes, pas celui du développeur. Si `security.environmentVariableRedaction.enabled` est vrai, ou sous GitHub Actions, l'hôte en retire les variables qu'il juge sensibles [documenté : `reference/configuration.md`, « Environment variable redaction » ; code de 0.67.0] : `note_variables` rappelle alors qu'une variable absente pour le script peut exister pour l'hôte.

## 7. Contrôle de sortie

- Chaque valeur effective porte sa couche ; la couche du workspace écartée porte sa raison (D3.INV-1).
- Un fichier illisible est signalé sans extrait (D3.INV-2).
- La confiance porte sa source, et la note sur l'IDE (D3.INV-3).
- Le fichier `.env` est nommé avec ses variables ; les variables observées sont celles de la liste (D3.INV-4).
