# Comprendre l'IA avant de s'en servir

Vous hésitez à vous servir de l'IA parce que vous ne voyez pas ce qu'elle fait ? Cette page ouvre la boîte. Elle a trois parties :

1. **Comprendre avant de s'en servir** : sept questions et leurs réponses, à lire sans rien installer.
2. **Essayer sans risque** : un agent qui explique Gemini CLI en vous le montrant sur votre poste, sans rien modifier.
3. **Aller plus loin** : le détail, pour qui veut regarder sous le capot.

Le but n'est pas de vous convaincre, mais de vous donner de quoi décider : les limites et les risques sont dits aussi clairement que les garde-fous. Les réponses décrivent Gemini CLI 0.67.0. Elles ont été vérifiées le 6 novembre 2026 dans sa documentation, dans son code et par des essais réels.

## Partie 1. Comprendre avant de s'en servir

Le chemin d'une demande, de votre clavier jusqu'à la réponse :

```mermaid
flowchart LR
  V(["Vous"]) -->|"votre demande"| G["Gemini CLI<br/>programme sur votre poste"]
  G -->|"l'envoi : instructions, vos GEMINI.md,<br/>la conversation, la liste des outils"| M["Le modèle<br/>chez Google"]
  M -->|"une réponse, ou une action proposée"| G
  G -.->|"« Autoriser ? »<br/>pour une écriture ou une commande"| V
  G -->|"l'action, une fois autorisée"| P[("Votre projet")]
  P -->|"le résultat, renvoyé au modèle"| G
  G -->|"la réponse"| V
```

### 1. Qu'est-ce que c'est, au juste ?

Deux pièces. Gemini CLI est un programme qui tourne sur votre poste ; le modèle de langage, lui, tourne chez Google. Le modèle ne fait que produire du texte à partir de ce que le programme lui envoie, et il ne garde rien d'une requête à l'autre : à chaque fois, le programme lui renvoie tout ce qu'il faut. C'est le programme qui agit sur votre poste : il lit, cherche, écrit et lance des commandes, quand le modèle le propose.

**Vous gardez la main** : le programme est chez vous. Vous le lancez, vous l'arrêtez (`/quit`), vous le réglez.

### 2. Que reçoit le modèle quand je tape une demande ?

À chaque requête, Gemini CLI assemble un envoi :

- des instructions système, le mode d'emploi que Gemini CLI donne au modèle ;
- vos fichiers `GEMINI.md`, les consignes du projet et les vôtres ;
- la conversation ;
- la liste des outils que le modèle peut demander d'utiliser.

Le modèle ne voit rien d'autre : ni votre écran, ni le reste de votre disque, sauf ce qu'un outil lit pour lui (question 3).

**Vous gardez la main** : ce que vous écrivez dans vos `GEMINI.md` part à chaque requête. `/memory show` affiche ce qui est chargé. L'agent de la partie 2 peut vous montrer l'envoi lui-même.

### 3. Que voit-il de mon code ?

Au premier message, Gemini CLI joint les noms des dossiers et des fichiers du projet, 200 au plus, mais pas leur contenu. Le modèle ne lit un fichier que par un outil de lecture, ou quand vous le citez avec `@chemin`. Les outils de recherche ignorent ce qu'excluent `.gitignore` et `.geminiignore`. Une commande shell, elle, peut lire un fichier exclu : elle vous est demandée avant de s'exécuter (question 5).

**Vous gardez la main** : lancez Gemini CLI depuis le dossier du projet, pas depuis votre dossier personnel. Listez dans `.geminiignore` ce qu'il ne doit pas parcourir. Citez les fichiers utiles.

### 4. Comment décide-t-il d'agir ?

Par une boucle. Le modèle propose une action : lire un fichier, chercher, écrire, lancer une commande. Gemini CLI la confronte à ses règles : il l'exécute, la refuse ou vous la demande. Puis il renvoie le résultat au modèle, qui propose la suite, et ainsi de suite jusqu'à sa réponse.

**Vous gardez la main** : vous pouvez refuser une action proposée, ou interrompre la requête avec `Ctrl+C`. `/tools desc` liste les outils disponibles.

### 5. Peut-il modifier ou casser quelque chose ?

Par défaut, chaque modification de fichier et chaque commande vous est demandée avant de s'exécuter, sauf celles que vous avez approuvées pour la suite. Les autres garde-fous :

- le mode plan ne fait que lire ;
- dans un dossier que vous n'avez pas déclaré fiable, ni les réglages, ni les consignes, ni les commandes du projet ne sont chargés ;
- les points de reprise, si vous les activez, permettent de revenir en arrière (`/restore`).

À l'inverse, l'option `--yolo` fait tout accepter sans rien demander : elle supprime le premier garde-fou.

**Vous gardez la main** : lisez chaque proposition avant de l'accepter. Travaillez sous git, pour voir et annuler chaque changement. N'approuvez pas tout d'avance.

### 6. Où partent mes données, et que retient-il ?

Le contenu de chaque envoi (question 2) part chez Google, à chaque requête. Avec les réglages par défaut, Gemini CLI envoie aussi des statistiques d'usage et, en mode interactif, cherche une mise à jour.

Le modèle ne retient rien. Ce qui reste est écrit sur votre poste : dans vos `GEMINI.md`, et dans les sessions enregistrées, que `/resume` permet de reprendre ou de supprimer.

Ce que Google fait des données dépend de votre mode de connexion. Les conditions applicables sont décrites dans la documentation de Gemini CLI (`resources/tos-privacy.md`).

**Vous gardez la main** : ne mettez dans la conversation que ce que vous accepteriez d'envoyer chez Google. Deux réglages coupent les statistiques et la mise à jour (partie 3, « Ce qui sort du poste »).

### 7. Peut-il se tromper, et comment le vérifier ?

Oui. Le modèle produit le texte le plus plausible à partir de ce qu'il a reçu. Il ne sait de votre projet que ce qu'il a lu, et il peut se tromper avec assurance : sur un nom de fonction, une option, un résultat. La documentation de Gemini CLI le reconnaît : elle présente la recherche web comme un moyen d'éviter que l'agent n'invente.

**Vous gardez la main** : relisez chaque modification, lancez les tests, et demandez « d'où tiens-tu ça ? ». Ne lui confiez pas ce que vous ne pouvez pas vérifier. L'agent de la partie 2 donne l'exemple : chacune de ses affirmations dit d'où elle vient.

## Partie 2. Essayer sans risque

L'agent [`explication-hote-ia`](../../specs/explication-hote-ia/SKILL.md) 1.0.1 explique Gemini CLI en vous le montrant sur votre poste. Pendant qu'il explique, il ne modifie rien : c'est une première utilisation sans risque.

### Ce qu'il faut

- Gemini CLI ou équivalent, installé et connecté.
- Node 20 ou plus récent ; le skill est vérifié avec Node 26.13.0, celui du poste de la mission.
- Linux, WSL2, macOS ou Windows.
- Une session interactive : Gemini CLI lancé sans `-p`. Le parcours lance un petit script de lecture, que Gemini CLI vous demande d'autoriser.

### Installer, une fois

```bash
node <Agent2Prompt>/tools/installer.mjs explication-hote-ia --utilisateur
```

L'installateur vérifie chaque fichier et écrit le skill dans `~/.gemini/skills/explication-hote-ia/`, pour tous vos projets. Dans Gemini CLI, tapez `/skills reload`, puis demandez : « Active le skill explication-hote-ia et suis sa consigne à partir de l'étape 1 ». L'IA tire du skill son script et ses tests, et lance les tests. Elle vous demande d'autoriser chaque commande : vous voyez ainsi les confirmations à l'œuvre (question 5).

### Le parcours découverte

Demandez « explique-moi comment tu fonctionnes ». Si vous avez installé les commandes (partie 3), tapez simplement `/hote:explique`. Gemini CLI vous demande d'activer le skill : acceptez.

Le parcours reprend les sept questions de la partie 1, une à la fois, chacune en trois temps :

1. la réponse simple ;
2. ce qu'elle montre sur votre poste ;
3. ce que vous gardez en main.

Après chaque étape, vous continuez, vous approfondissez ou vous arrêtez. À l'étape 2, l'agent peut lire avec vous l'envoi exact au modèle, si vous l'exportez (partie 3, « Voir l'envoi exact »).

### Lire une réponse

L'agent dit d'où il tient chaque affirmation :

| Il dit | Cela veut dire |
|---|---|
| « vu sur votre poste » | il vient de l'observer |
| « d'après ce que je vois de mon propre contexte » | il le voit dans ce qu'il a reçu, sans pouvoir le vérifier |
| « d'après la documentation de Gemini CLI 0.67.0 » | la documentation de la version installée le dit |
| « j'en déduis » | il le conclut de ce qu'il a observé |
| « je ne peux pas le savoir d'ici » | aucune source ne le lui dit ; il indique comment le vérifier |

Il ne tire de sa propre impression ni son modèle, ni sa version, ni ses limites. Pour ces questions, il vous demande de lancer une commande de l'interface, comme `/about` ou `/stats model`, et de coller ce qu'elle affiche.

## Partie 3. Aller plus loin

### Les trois modes

| Mode | Commande, ou demande | Ce que l'agent rend |
|---|---|---|
| expliquer | `/hote:explique [question]` | sans question, le parcours découverte ; avec une question, le mécanisme demandé, puis ce qui en est en place chez vous |
| carte | `/hote:carte`, « qu'est-ce qui est actif ici ? » | réglages et leur couche, confiance du dossier, fichiers de contexte, composants actifs, masqués ou ignorés |
| pourquoi | `/hote:pourquoi <comportement>`, « pourquoi ce skill n'apparaît pas ? » | un diagnostic : chaque hypothèse confirmée ou écartée par une observation nommée, la cause retenue, la correction décrite sans être appliquée |

Pour la carte et le diagnostic, l'agent écrit ses étiquettes sous leur forme courte : `[observé]`, `[déclaré]`, `[documenté]`, `[déduit]`, `[inconnu]`.

### Le sous-agent et les commandes

Avec votre accord :

- copier `agent/explicateur-hote.md` dans `~/.gemini/agents/`, en remplaçant, dans la copie seulement, `<DOSSIER_DU_SKILL>` par le chemin absolu du dossier du skill ;
- copier les trois fichiers de `commandes/hote/` dans `~/.gemini/commands/hote/` ;
- puis `/agents reload` et `/commands reload`.

Le sous-agent a son propre contexte : il voit votre installation, pas la conversation qui l'appelle. Il sert à la carte et au diagnostic. Les questions sur la session en cours se posent dans la session principale.

Dans un autre outil, collez la transmission [`transmissions/explication-hote-ia-1.0.1.md`](../../transmissions/explication-hote-ia-1.0.1.md) : l'IA matérialise le skill dans `.skills/explication-hote-ia/`.

### Voir l'envoi exact

Le texte exact des instructions système s'obtient en l'exportant :

```bash
GEMINI_WRITE_SYSTEM_MD=~/systeme-exporte.md gemini
```

Le fichier est écrit au démarrage ; quittez ensuite avec `/quit`. Donnez un chemin hors du projet, jamais la valeur `1`. Ne versionnez pas le fichier : il contient vos mémoires. Puis : `/hote:explique analyse le prompt exporté ~/systeme-exporte.md`.

### Ce qui sort du poste

Avec les réglages par défaut, Gemini CLI envoie, en plus des requêtes au modèle, des statistiques d'usage à `play.googleapis.com`, même en mode non interactif. En mode interactif, il cherche aussi une mise à jour sur `registry.npmjs.org`. Ces deux sorties continuent même quand l'API du modèle est locale. Ces réglages, dans `~/.gemini/settings.json`, les coupent :

```json
{
  "privacy": { "usageStatisticsEnabled": false },
  "general": { "enableAutoUpdate": false, "enableAutoUpdateNotification": false }
}
```

Derrière un proxy d'entreprise, sous Node 26 (constaté avec Node 26.13.0), la connexion par compte Google passe par le proxy de `HTTPS_PROXY`. En revanche, les requêtes au modèle par clé d'API Gemini, les statistiques d'usage et la recherche de mise à jour partent en direct. Lancer Gemini CLI avec `NODE_USE_ENV_PROXY=1` dans l'environnement les ramène au proxy. Sous Node 22 et 24, tout suit le proxy.

L'agent montre ces réglages chez vous, avec leur couche. Il décrit une modification ; il ne l'applique que si vous le lui demandez explicitement.

### Le script

```bash
node <dossier du skill>/scripts/instantane-hote.mjs <commande> [--format texte]
```

| Commande | Effet |
|---|---|
| `hote` | famille de l'hôte et nature de la preuve, paquet, version, documentation embarquée, options de lancement sous Linux et WSL |
| `config` | couches de réglages, valeur effective et couche de chaque réglage observé, confiance du dossier, `.env`, variables |
| `contexte` | fichiers de contexte par palier, imports, mémoire privée, trace de la dernière session ; `--prompt-systeme <fichier>` pour un prompt exporté |
| `composants` | skills, sous-agents, commandes, extensions, serveurs MCP, hooks, politiques, fichiers d'exclusion |
| `doc [chemin]` | documentation embarquée : la liste, ou un document |
| `tout` | les quatre premières ensemble |

Codes de sortie : 0 réussite, 1 usage, 2 introuvable, 3 chemin refusé, 4 erreur interne. Le script ne fait que lire : il ne crée aucun fichier, ne lance aucun processus et n'ouvre aucune connexion. Il rend des noms, jamais de valeurs secrètes, et aucun texte de conversation.

### Ce qui ne se négocie pas

- Rien n'est modifié pendant une explication. Une modification de configuration se décrit (fichier, clé, valeur, effet) et ne s'applique que sur votre demande explicite.
- Aucune valeur secrète n'est recopiée, ni dans une réponse, ni dans un fichier.
- Aucune réassurance sans source : une limite ou un risque se dit aussi clairement qu'un garde-fou.
- La documentation de la version installée fait foi ; un repère d'une autre version se signale « à revérifier ».

### Mettre à jour, retirer

- **Nouvelle version de Gemini CLI** : rien à faire pour que l'agent reste juste. Il observe la version, cite ses repères « à revérifier » et lit la documentation installée.
- **Nouvelle version du skill** : relancer l'installateur, puis demander de nouveau à l'IA de suivre la consigne à partir de l'étape 1.
- **Retirer** : `node <Agent2Prompt>/tools/installer.mjs --retirer explication-hote-ia --utilisateur`, puis supprimer les copies du sous-agent et des commandes.

### Dépannage

| Symptôme | Cause probable | Remède |
|---|---|---|
| `/hote:explique` inconnu | commandes non copiées, ou dossier non fiable : Gemini CLI ignore alors toute commande personnalisée, même celles de l'utilisateur | demander « explique-moi comment tu fonctionnes » ; ou copier les commandes, `/commands reload`, et faire confiance au dossier |
| le skill ne s'active pas avec `gemini -p` | mode non interactif : `activate_skill` et `run_shell_command` ne sont pas déclarés au modèle | une session interactive |
| la version rendue n'est pas celle de `/about` | le paquet trouvé par le PATH n'est pas celui qui s'exécute | `--paquet` vers le paquet qui s'exécute |
| `contexte` ne trouve pas le `GEMINI.md` du projet | script lancé hors de la racine du projet | relancer depuis la racine, ou `--racine` |
| la trace de session décrit une autre conversation | plusieurs sessions sur le projet, ou une session sans tour abouti, que Gemini CLI supprime au lancement suivant | comparer `debut` à l'heure de la session ; `/memory list` fait foi |
| le sous-agent dit qu'il ne voit pas la session | normal : son contexte est séparé | poser la question dans la session principale, skill activé |
| la recette saute T9 | Windows ou macOS : T9 lit `/proc` | normal |
