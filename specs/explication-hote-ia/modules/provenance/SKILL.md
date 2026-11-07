---
name: provenance
description: Provenance des affirmations sur l'hôte (quatre sources, cinq étiquettes et leur forme de citation, ordre de foi entre sources contradictoires, ce que l'agent ne tire jamais de sa propre impression, angles morts et moyens de les observer, repères d'une autre version à revérifier). À lire avant toute explication.
dimensions: [D6]
status: active
---

# Module `provenance` (D6)

Phase 7E couverte : Expression.

## 1. Pourquoi des étiquettes

Un modèle qui parle de l'outil qui l'exécute est un témoin peu sûr. Ce qu'il en sait vient de trois endroits qu'il ne distingue pas de lui-même : ses données d'entraînement, qui décrivent d'autres versions, voire d'autres outils ; son propre contexte, qui ne contient que ce que l'hôte a choisi de lui donner ; et ce qu'il complète faute de savoir. Les modèles se trompent couramment sur leur propre nom, leur version ou leurs limites. Le skill rattache donc chaque affirmation sur l'hôte à une source, et nomme ce qu'aucune source ne donne (D6.INV-1, D6.INV-4).

## 2. Quatre sources

| Source | Ce qu'elle donne | Ce qu'elle ne donne pas | Étiquette |
|---|---|---|---|
| Le propre contexte de l'agent | les outils qu'il voit déclarés, avec leur description ; son prompt système : sections, skills listés avec l'emplacement de leur `SKILL.md`, sous-agents ; le premier message de la session (`<session_context>`) ; dans les résultats d'outils, les fichiers de contexte découverts à la demande ; les balises `<activated_skill>` et `<hook_context>` | les outils que la politique a retirés, le texte que la compression a remplacé par un résumé, les réglages, la version de l'hôte | `[déclaré]`, avec la section ou la balise |
| Le script `instantane-hote.mjs` | le disque : paquet et version, couches de réglages, confiance, fichiers de contexte, composants, trace de la dernière session, documentation embarquée | l'état en mémoire de l'hôte : ce qu'il a chargé au démarrage, les fichiers modifiés depuis, les options de lancement hors Linux, la confiance imposée par un IDE | `[observé]` ou `[déduit]`, selon la nature que donne le script |
| La documentation embarquée | le fonctionnement documenté de la version installée, par `doc <chemin>` | ce que le code fait quand il s'écarte de sa documentation (module `modele-hote`, § 10) | `[documenté]`, avec la version et le document |
| Les commandes de l'interface, lancées par le développeur | l'état en mémoire de l'hôte : `/about`, `/stats model`, `/memory list`, `/memory show`, `/tools desc`, `/skills list all`, `/agents list`, `/mcp list`, `/policies list`, `/hooks list`, `/extensions list`, `/permissions trust` ; le prompt système exporté (module `contexte`, § 6) | rien de ce qu'elles n'affichent pas | `[observé]`, avec la commande et « collé par le développeur » |

L'agent ne peut pas lancer les commandes de l'interface : elles s'adressent à l'hôte, pas au modèle. Quand l'une d'elles tranche une question, il demande au développeur de la lancer et de coller ce qu'elle affiche.

## 3. Étiquettes et forme de citation

Une étiquette par affirmation, entre crochets, avec sa source après deux-points. Une phrase qui mêle deux sources se coupe en deux.

| Étiquette | Exemple |
|---|---|
| `[observé]` | « Le modèle demandé est `gemini-3-pro-preview`, par la couche workspace [observé : config, `model.name`]. » |
| `[déclaré]` | « Je vois l'outil `run_shell_command` parmi mes déclarations [déclaré : déclarations d'outils de cette session]. » |
| `[documenté]` | « Seuls le nom et la description d'un skill sont donnés au modèle avant son activation [documenté : Gemini CLI 0.67.0, cli/skills.md]. » |
| `[déduit]` | « Ce `GEMINI.md` n'est pas chargé au démarrage : il est sous `src/api/`, sous la racine [déduit : contexte, `a_la_demande`]. » |
| `[inconnu]` | « Je ne sais pas quel modèle a produit cette réponse [inconnu : `/stats model` le montre]. » |

Les natures du script se traduisent telles quelles : `observé` en `[observé]`, `déduit` en `[déduit]`, `déclaré` en `[déclaré]`, `documenté` en `[documenté]`. Une valeur sans nature dans un objet observé hérite de celle de sa section ; les valeurs effectives de `config` sont `[observé]`, avec leur couche.

## 4. Ordre de foi (D6.INV-3)

1. L'observation de la session : sortie du script, commande de l'interface, fichier lu.
2. La documentation embarquée de la version installée.
3. Les repères du module `modele-hote`, datés et vérifiés sur une version précise.
4. La déduction tirée de ces sources.
5. La connaissance générale du modèle, qui ne suffit jamais seule : elle oriente une observation, elle ne la remplace pas.

Une contradiction se dit avec ses deux sources, puis l'agent propose l'observation qui la tranche. Exemple vérifié sur 0.67.0 : la documentation annonce un balayage des fichiers de contexte des sous-dossiers, borné à 200 dossiers par `context.discoveryMaxDirs` ; le code de la même version ne fait plus ce balayage et ne charge ces fichiers qu'à la demande. L'agent rend les deux, et `/memory list` tranche.

## 5. Ce que l'agent ne tire jamais de sa propre impression (D6.INV-2)

| Question | Source à employer |
|---|---|
| Quel modèle es-tu ? Quelle version ? | `/about` et `/stats model` [observé, collé par le développeur] ; le modèle demandé se lit dans `config` (`model.name`) et dans les surcharges (`GEMINI_MODEL`, option `-m`), mais le routage automatique choisit entre plusieurs modèles, les sous-agents et les appels internes en emploient d'autres |
| Quelle version de l'hôte ? | `hote`, paquet et nature de sa preuve |
| Quels outils as-tu ? | tes déclarations [déclaré] ; un outil que la politique retire sans condition sur ses arguments n'y figure pas, et tu ne peux pas le savoir : `/tools desc` et `/policies list` |
| Qu'y a-t-il dans ton contexte ? | ce que tu vois [déclaré], en disant que la compression a pu remplacer le début de la conversation par un résumé ; pour les fichiers de contexte, `contexte` et `/memory list` |
| Quelle est la taille de ton contexte ? Combien en reste-t-il ? | `/stats model` ; la documentation du modèle ; jamais une estimation donnée comme un fait |
| Quels réglages s'appliquent ? | `config`, avec leur couche ; un réglage lu sur le disque n'est actif qu'après redémarrage ou rechargement, selon la documentation |

## 6. Angles morts (D6.INV-4)

| Ce qui ne s'observe pas d'ici | Pourquoi | Comment l'observer |
|---|---|---|
| poids du modèle, données d'entraînement, échantillonnage | côté fournisseur | aucun moyen : `[inconnu]` |
| traitement côté serveur : filtrage, journalisation, cache, routage | côté fournisseur | ce que la documentation publique en dit (`resources/tos-privacy.md`, `cli/token-caching.md`, `cli/model-routing.md`), en `[documenté]` |
| outils retirés par la politique | ils ne sont plus déclarés au modèle | `/tools desc`, `/policies list` ; `composants`, politiques |
| texte remplacé par la compression | le résumé remplace l'original dans le contexte | `[inconnu]` pour l'agent ; la documentation de `/compress` et de `model.compressionThreshold` |
| ce que l'hôte a chargé au démarrage, si le disque a changé depuis | le script lit le disque d'aujourd'hui | `/memory list`, `/skills list all`, `/agents list`, `/mcp list`, `/commands list` ; les rechargements (`/memory reload`, `/skills reload`, `/agents reload`, `/mcp reload`, `/commands reload`) |
| confiance imposée par un IDE compagnon | état de l'interface, pas du disque | `/permissions trust` |
| options de lancement, hors Linux et WSL | le script ne lit les processus parents que dans `/proc` | le développeur les dit |
| contexte de la session qui appelle un sous-agent | contexte séparé | la session principale, skill activé (D7.INV-1) |
| variables retirées par l'hôte de l'environnement de ses commandes | retirées avant que le script ne démarre | le réglage observé (`security.environmentVariableRedaction.enabled`) ; le développeur |
| texte exact du prompt système | le modèle n'en a qu'une lecture | l'export du développeur (module `contexte`, § 6) |

## 7. Repères d'une autre version (D6.INV-5)

Les repères du module `modele-hote` sont vérifiés sur Gemini CLI 0.67.0. Si `hote` observe une autre version, chaque repère employé se cite « [documenté : repère vérifié sur 0.67.0, à revérifier] », et l'agent lit le document correspondant de la version installée (`doc <chemin>`) avant de le présenter comme actuel. Si la version est inconnue, faute de paquet localisé, il le dit, et chaque repère garde sa version.

## 8. Contrôle de sortie

- Chaque affirmation sur l'hôte porte une étiquette et une source (D6.INV-1).
- Aucune affirmation sur soi-même ne vient de la propre impression de l'agent (D6.INV-2).
- Toute contradiction entre sources est dite, avec ses deux sources et l'observation qui la tranche (D6.INV-3).
- Les angles morts touchés par la question sont nommés, avec leur moyen d'observation (D6.INV-4).
- Un repère d'une autre version est signalé « à revérifier » (D6.INV-5).
