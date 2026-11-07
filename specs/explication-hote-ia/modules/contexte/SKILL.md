---
name: contexte
description: Contexte du modèle et commande contexte (ce que l'hôte envoie au modèle à chaque requête, vérifié sur Gemini CLI 0.67.0 : instructions système, premier message de session, historique, contexte découvert à la demande, skill activé, déclarations d'outils ; fichiers de contexte par palier et leur ordre, imports, mémoire privée du projet et registre des projets, trace de la dernière session, export du prompt système par le développeur et son analyse). À lire avant d'expliquer ce que le modèle reçoit ou pourquoi une consigne n'est pas suivie.
dimensions: [D5]
status: active
---

# Module `contexte` (D5)

Phase 7E couverte : Engendrent et État.

## 1. Ce que le modèle reçoit à chaque requête

Le modèle ne garde rien d'une requête à l'autre : l'hôte lui renvoie à chaque fois tout ce qu'il doit savoir. Repère vérifié sur Gemini CLI 0.67.0, le 6 novembre 2026, par des sessions réelles dont chaque requête a été capturée sur une fausse API locale, sans réseau sortant (module `modele-hote`, § 1), par leurs prompts exportés et leurs transcriptions, et par la lecture du code :

| Partie | Contenu | Comment l'observer |
|---|---|---|
| Instructions système | un gabarit choisi selon le modèle (gabarit récent pour les modèles Gemini 3, ancien sinon), le mode d'approbation, le bac à sable, la présence d'un dépôt git et le mode interactif ou non ; la section « Available Sub-Agents », appelés par l'outil `invoke_agent` ; la section « Available Agent Skills », où chaque skill est donné par son nom, sa description et l'emplacement de son `SKILL.md` (balise `<available_skills>`) ; les règles sur `<hook_context>` ; puis, après `---`, la balise `<loaded_context>` avec `<global_context>` (le `GEMINI.md` global) et `<user_project_memory>` (l'index privé du projet, `MEMORY.md`) | export par le développeur (§ 6), analysé par `contexte --prompt-systeme` |
| Premier message de la session | un message de l'utilisateur dont la première partie est la balise `<session_context>` (le premier prompt du développeur en est la partie suivante) : date, système, dossier temporaire du projet, dossiers du workspace, arborescence (200 éléments au plus, si `context.includeDirectoryTree`), puis `<loaded_context>` avec `<project_context>` : les fichiers de contexte du projet, dossier fiable seulement, et le contexte des extensions | `contexte`, trace de session ; `/memory show` |
| Historique | les messages, les appels d'outils et leurs résultats ; après compression, un résumé à la place du début | rien ne montre le texte remplacé |
| Contexte découvert à la demande | dans le résultat d'un outil qui touche un dossier, les fichiers de contexte de ce dossier et de ses parents jusqu'à la racine fiable, encadrés par `--- Newly Discovered Project Context ---` et `--- End Project Context ---` ; une seule fois par fichier, dossier fiable seulement | `contexte`, `a_la_demande`, en déduit |
| Skill activé | le corps du `SKILL.md` et l'arborescence de son dossier, dans la balise `<activated_skill>` ; son dossier devient lisible par les outils | ce que l'agent voit [déclaré] |
| Déclarations d'outils | les outils déclarés au modèle, après la politique : un outil refusé sans condition sur ses arguments n'est pas déclaré | `/tools desc` ; ce que l'agent voit [déclaré] |

Chaque fichier de contexte chargé est encadré par `--- Context from: <chemin> ---` et `--- End of Context from: <chemin> ---`. L'agent qui se lit lui-même peut donc nommer les fichiers qu'il a reçus [déclaré], à condition que la compression ne les ait pas déjà résumés.

## 2. Fichiers de contexte par palier (D5.INV-1)

| Palier | Fichiers | Chargement |
|---|---|---|
| noms | `context.fileName`, un nom ou une liste ; `GEMINI.md` par défaut | |
| global | `~/.gemini/<nom>` pour chaque nom | à chaque session, dans les instructions système |
| projet | `<dossier>/<nom>`, de la racine en remontant jusqu'au premier dossier qui contient un marqueur de `context.memoryBoundaryMarkers` (`.git` par défaut ; une liste vide interdit toute remontée), sans jamais passer `~/.gemini` | premier message, dossier fiable seulement, dans l'ordre des chemins triés |
| extensions | le `contextFileName` du manifeste de chaque extension, ou son `GEMINI.md` | premier message |
| mémoire privée du projet | `MEMORY.md` dans `~/.gemini/tmp/<identifiant>/memory/` (§ 4) | instructions système |
| à la demande | `<nom>` des sous-dossiers de la racine | quand un outil accède au dossier, dossier fiable seulement |

`contexte` rend, pour chaque fichier présent, son chemin, sa taille, son nombre de lignes et ses imports ; jamais son texte (D8.INV-2). Le palier projet porte `charge_au_demarrage` selon la confiance ; le palier à la demande est déduit, borné à 2 000 dossiers, et saute `.git`, `node_modules`, `target`, `dist`, `build`, `vendor`, `.venv` et `__pycache__`.

## 3. Imports (D5.INV-2)

Un fichier de contexte en importe d'autres par une ligne `@chemin`, relative à son dossier ou absolue [documenté : `reference/memport.md`]. `contexte` liste chaque import, hors blocs de code, avec son existence : un import absent explique souvent qu'une consigne manque.

## 4. Mémoire privée, registre et persistance

- **Registre des projets** : `~/.gemini/projects.json` associe le chemin de chaque racine (en minuscules sous Windows) à un identifiant court. Les données de l'hôte pour ce projet vivent dans `~/.gemini/tmp/<identifiant>/` : `chats/` (sessions, reprises par `/resume`), `memory/` (mémoire privée), `checkpoints/` et `shell_history` ; le dépôt git caché des points de reprise (`/restore`), dans `~/.gemini/history/<identifiant>/` [repère : code de 0.67.0 ; la documentation parle encore d'un `<project_hash>`].
- **Nettoyage des sessions** : au lancement, l'hôte supprime les sessions qui dépassent `general.sessionRetention.maxAge` (30 jours par défaut) ou `maxCount`, et, quel que soit leur âge, celles qui n'ont rien à reprendre : une session dont aucun tour n'a abouti, après une erreur d'authentification ou de réseau, disparaît dès le lancement suivant [repère H14 : code et essai réel de 0.67.0 ; la documentation dit qu'aucune session de moins d'un jour n'est supprimée].
- **Mémoire** : en 0.67.0, l'hôte n'a plus d'outil `save_memory` ; le modèle retient en écrivant dans les fichiers de contexte avec ses outils d'édition, `GEMINI.md` du projet pour l'équipe, `MEMORY.md` privé pour le projet, `GEMINI.md` global pour l'utilisateur [documenté : `tools/memory.md` ; prompt système exporté]. Ce qui n'est écrit dans aucun fichier est perdu à la fin de la session.
- **Mémoire automatique**, expérimentale : `experimental.autoMemory` fait proposer des mémoires et des skills tirés des sessions passées, dans une boîte de réception (`/memory inbox`), jamais appliqués sans accord [documenté : `cli/auto-memory.md`].

## 5. Trace de la dernière session (D5.INV-3)

Le script lit le début (512 Ko) du fichier de session le plus récemment modifié du projet, dans `~/.gemini/tmp/<identifiant>/chats/`, et n'en rend que : le nombre de sessions, le fichier, la date de début, les balises posées par l'hôte (`session_context`, `loaded_context`, `project_context`…), les dossiers du workspace, la présence de l'arborescence et les chemins des fichiers de contexte chargés. Jamais le texte d'un message, ni celui d'un fichier de contexte. La session la plus récente n'est pas forcément celle de la conversation en cours : `note` le rappelle, et `debut` permet de vérifier. Une session dont aucun tour n'a abouti a pu être supprimée au lancement suivant (§ 4) : la trace est alors celle d'une session plus ancienne.

## 6. Export du prompt système (D5.INV-4)

L'agent ne lit son prompt système que de l'intérieur, et pour ce qu'il en voit. Le texte exact s'obtient par le développeur, que Gemini CLI laisse l'écrire dans un fichier [documenté : `cli/system-prompt.md`] :

    GEMINI_WRITE_SYSTEM_MD=~/systeme-exporte.md gemini

ou, sous Windows, dans CMD :

    set GEMINI_WRITE_SYSTEM_MD=%USERPROFILE%\systeme-exporte.md
    gemini
    set GEMINI_WRITE_SYSTEM_MD=

Lancé depuis la racine du projet, l'hôte écrit le fichier dès son démarrage, avant toute question [vérifié sur 0.67.0, en mode interactif et non interactif] ; le développeur quitte alors par `/quit`. Trois précautions :

- un chemin hors du projet, jamais la valeur `1` : elle écrirait `.gemini/system.md`, que `GEMINI_SYSTEM_MD=1` prendrait ensuite pour remplacer le prompt ;
- le fichier contient le texte des mémoires globale et privée : il reste sur le poste et ne se versionne pas ;
- l'export vaut pour la configuration qui l'a produit : modèle, mode d'approbation, mode interactif, skills, sous-agents et outils actifs ; un changement de l'un d'eux en change le texte.

Puis `contexte --prompt-systeme <fichier>` en rend les titres, les skills et leurs emplacements, les sous-agents, les fichiers de contexte chargés, les balises et l'outil d'appel des sous-agents. Si `GEMINI_SYSTEM_MD` est posée (module `configuration`, § 3), le prompt est celui de ce fichier, et le gabarit de l'hôte ne s'applique plus du tout.

## 7. Contrôle de sortie

- Les fichiers de contexte sont rendus par palier, avec leur chargement et l'effet de la confiance (D5.INV-1).
- Les imports sont listés avec leur existence (D5.INV-2).
- La trace de session ne rend ni texte de message ni texte de fichier (D5.INV-3).
- Un prompt exporté absent sort avec le code 2 (D5.INV-4).
