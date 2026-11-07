---
name: composants
description: Composants de l'hôte par la commande composants (skills et leurs paliers avec alias, divulgation progressive et activation, sous-agents et leurs en-têtes, commandes personnalisées et espaces de noms, extensions et leur contenu, serveurs MCP décrits sans valeur secrète, hooks et leurs événements, politiques et leurs paliers, fichiers d'exclusion ; masquage entre homonymes, composants ignorés et leur raison). À lire avant d'expliquer pourquoi un composant est actif, masqué ou absent.
dimensions: [D4]
status: active
---

# Module `composants` (D4)

Phase 7E couverte : Éléments et Espace.

## 1. Skills

Repère vérifié sur Gemini CLI 0.67.0 [documenté : `cli/skills.md` ; prompt système exporté] :

- **Paliers**, du plus faible au plus fort : intégrés au paquet, extensions, utilisateur (`~/.gemini/skills/`, et l'alias `~/.agents/skills/`), workspace (`.gemini/skills/`, et l'alias `.agents/skills/`). Entre homonymes, le palier le plus fort l'emporte ; dans un même palier, l'alias `.agents/skills/` l'emporte sur `.gemini/skills/`.
- **Divulgation progressive** : au départ, le modèle ne reçoit de chaque skill que son nom, sa description et l'emplacement de son `SKILL.md`. Le reste n'entre dans le contexte qu'à l'activation, par l'outil `activate_skill`, après confirmation du développeur : corps du `SKILL.md`, arborescence du dossier, et lecture du dossier permise aux outils.
- **Confiance** : un dossier non fiable fait ignorer les skills du workspace.
- `skills.enabled` à `false` coupe tous les skills ; `skills.disabled` en désactive par nom (`/skills disable`, portée utilisateur par défaut).

`composants` rend chaque skill trouvé : nom, description (200 caractères au plus), portée, emplacement ; `masque_par` (le `SKILL.md` qui l'emporte) pour un homonyme plus faible ; `desactive` ; `ignore` et sa raison ; `ecarts` d'en-tête : en-tête absent, `name` ou `description` absent, dossier nommé autrement que le skill (D4.INV-1, D4.INV-2).

## 2. Sous-agents

Repère vérifié sur 0.67.0 [documenté : `core/subagents.md` ; prompt système exporté] :

- **Intégrés** : `codebase_investigator`, `cli_help`, `generalist`, et `browser_agent`, désactivé par défaut. Ils vivent dans le code de l'hôte : le script ne les liste pas ; la section « Available Sub-Agents » du prompt système et `/agents list` les montrent.
- **Personnalisés** : un fichier Markdown à en-tête YAML dans `~/.gemini/agents/` ou `.gemini/agents/`, ou dans le dossier `agents/` d'une extension. Champs : `name` (minuscules, chiffres, `-` et `_`), `description`, `kind`, `tools`, `mcpServers`, `model`, `temperature`, `max_turns`, `timeout_mins`. Le corps devient le prompt système du sous-agent. Sans `tools`, il hérite des outils de la session.
- **Isolement** : chaque sous-agent a son propre contexte et ses propres outils ; il n'appelle pas d'autres sous-agents ; il rend son résultat à l'agent principal, qui l'appelle par l'outil `invoke_agent`.
- `agents.overrides` active, désactive ou règle un sous-agent par son nom.

`composants` rend chaque fichier : nom, description, portée, fichier, nature (`kind`), outils (ou « hérités de la session »), modèle (ou « hérité »), `active` s'il est réglé, `ecarts` d'en-tête, `ignore` dans un dossier non fiable.

## 3. Commandes personnalisées

Repère vérifié sur 0.67.0 [documenté : `cli/custom-commands.md`, `cli/trusted-folders.md`] :

- un fichier `.toml` dans `~/.gemini/commands/`, `.gemini/commands/` ou le dossier `commands/` d'une extension ; le chemin donne le nom, chaque sous-dossier un espace de noms (`hote/carte.toml` devient `/hote:carte`) ;
- `prompt` est requis, `description` facultative ; `{{args}}` reçoit le texte tapé après la commande, `!{…}` le résultat d'une commande shell, `@{…}` le contenu d'un fichier ;
- la commande se développe dans l'interface : le modèle reçoit le prompt développé, jamais la commande ;
- entre homonymes, celle du projet l'emporte sur celle de l'utilisateur ;
- un dossier non fiable fait ignorer toutes les commandes personnalisées, celles de l'utilisateur comprises.

`composants` rend chaque commande : son nom avec `/`, sa description, sa portée, son fichier, si `prompt` est défini ; `masquee_par` pour un homonyme plus faible ; `ignore` dans un dossier non fiable.

## 4. Extensions

Repère vérifié sur 0.67.0 [documenté : `extensions/reference.md`] : une extension est un dossier de `~/.gemini/extensions/`, décrit par `gemini-extension.json`. Elle peut apporter des serveurs MCP, un fichier de contexte (`contextFileName`, ou son `GEMINI.md`), des outils exclus (`excludeTools`), des commandes, des skills, des sous-agents, des hooks (`hooks/hooks.json`) et des politiques (`policies/`). L'état activé ou non se gère par `/extensions` ; le script signale le fichier d'activation sans l'interpréter.

`composants` rend chaque extension : nom, version, dossier, lisibilité du manifeste, description, noms de ses serveurs MCP, fichier de contexte, outils exclus, dossiers qu'elle contient, et la source de son installation, masquée (une adresse avec identifiants n'en garde aucun).

## 5. Serveurs MCP

Repère vérifié sur 0.67.0 [documenté : `tools/mcp-server.md`, `reference/configuration.md`] : un serveur se déclare dans `mcpServers` d'une couche de réglages ou du manifeste d'une extension ; entre homonymes, les réglages l'emportent sur l'extension ; `mcp.allowed` et `mcp.excluded` filtrent par nom ; un dossier non fiable empêche toute connexion ; les instructions d'un serveur s'ajoutent au contexte du projet.

`composants` rend chaque serveur déclaré, avec son origine : son transport (`stdio`, `sse` ou `http`), pour `stdio` le nom de la commande et ses arguments masqués, pour les autres son adresse masquée ; les **noms** de ses variables d'environnement et de ses en-têtes, jamais leurs valeurs ; `trust`, `includeTools`, `excludeTools` ; `exclu` et sa raison ; `ignore` si sa couche n'est pas prise en compte. Un serveur déclaré n'est pas un serveur connecté : `/mcp list` le montre (D8.INV-1).

## 6. Hooks

Repère vérifié sur 0.67.0 [documenté : `hooks/reference.md`] : dans `hooks` des réglages, ou `hooks/hooks.json` d'une extension, chaque événement (`BeforeTool`, `AfterTool`, `BeforeAgent`, `AfterAgent`, `BeforeModel`, `AfterModel`, `BeforeToolSelection`, `SessionStart`, `SessionEnd`, `PreCompress`, `Notification`) reçoit des groupes à filtre (`matcher`), chacun avec ses commandes. Un hook peut modifier un appel d'outil, une requête au modèle ou sa réponse ; ce qu'il ajoute au contexte arrive dans `<hook_context>`, que le prompt système fait traiter comme des données.

`composants` rend chaque hook : événement, origine, nom, type, filtre, commande masquée et tronquée à 120 caractères ; `hooksConfig.enabled` ; `ignore` si sa couche n'est pas prise en compte.

## 7. Politiques

Repère vérifié sur 0.67.0 [documenté : `reference/policy-engine.md`] : des règles TOML, chacune avec un outil (`toolName`, ou `commandPrefix` et `commandRegex` pour le shell), une décision (`allow`, `deny`, `ask_user`), une priorité, des modes et éventuellement un sous-agent. Une règle `deny` sans condition sur les arguments retire l'outil des déclarations du modèle ; `ask_user` vaut `deny` en mode non interactif. Les approbations « pour toutes les sessions » s'écrivent dans `auto-saved.toml`. Les paliers et leurs priorités se lisent dans la documentation de la version installée : en 0.67.0, elle annonce le palier du workspace comme désactivé.

`composants` rend chaque fichier de politique, avec son palier (administrateur, utilisateur, workspace, extension, ou chemin réglé) : nombre de règles, décisions comptées, outils, modes et sous-agents nommés, et `approbations_enregistrees` pour `auto-saved.toml`.

## 8. Fichiers d'exclusion

`.geminiignore` et `.gitignore` de la racine, et `.git/info/exclude` du dépôt : ce qu'ils excluent, les outils de fichiers de l'hôte ne le voient pas. Un skill exclu par `.git/info/exclude` sans négation dans `.geminiignore` ne livre que son `SKILL.md` (constat du dépôt Agent2Prompt, vérifié contre le code de Gemini CLI par sa recette de l'installateur).

## 9. Contrôle de sortie

- Chaque composant porte sa portée ; un homonyme plus faible désigne celui qui l'emporte ; les écarts d'en-tête sont signalés (D4.INV-1).
- Un composant ignoré l'est avec sa raison, jamais omis (D4.INV-2).
- Aucune valeur de variable ou d'en-tête d'un serveur MCP n'est rendue (D8.INV-1).
