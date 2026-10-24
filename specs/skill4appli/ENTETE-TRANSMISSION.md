# Mémoire d'application SQLite et watcher de branche : skill skill4appli {{VERSION}}, transmission texte

Ce texte contient à la fois la consigne de travail et le skill complet. Il n'y a aucune pièce jointe. Le skill est découpé en fichiers, chacun délimité ainsi :

    <<<FICHIER chemin/relatif>>>
    ...contenu exact du fichier...
    <<<FIN chemin/relatif>>>

---

À partir de maintenant, tu installes le skill skill4appli décrit par ce texte sur le projet du développeur, tu le fais fonctionner, puis tu peux agir comme son agent mémoire. Le skill fait foi. Si tu relèves une ambiguïté ou une contradiction dans le skill, signale-la au développeur. Ne corrige pas le skill toi-même, ni son script.

## Étape 0 : matérialiser le skill

1. Le skill tourne du côté du git qui possède le dépôt (module `parite`) : sous Windows si le code et son git y sont, même si tu travailles dans WSL ; dans WSL si le dépôt est dans son système de fichiers. Crée le dossier `.skills/skill4appli/` à la racine de ce dépôt (`C:\dev\<projet>\.skills\skill4appli\` sous Windows), ou à l'emplacement que le développeur indique. Dans la disposition du kit `agents-paralleles-gitlab`, c'est `~/dev/<projet>/.skills/skill4appli/`, hors des worktrees. Dans un clone ordinaire, ajoute `/.skills/` à `.git/info/exclude` s'il n'y est pas : le skill ne doit pas apparaître dans `git status`.
2. Pour chaque bloc `<<<FICHIER chemin>>>` … `<<<FIN chemin>>>`, crée le fichier `chemin` dans ce dossier, avec le contenu exact compris entre les deux lignes délimitrices. Ces deux lignes ne font pas partie du fichier. Ne reformule rien, ne traduis rien, ne complète rien.
3. Si tu disposes d'un shell, vérifie chaque fichier avec `sha256sum -c` contre la table d'intégrité en fin de texte ; sous Windows, Git Bash fournit `sha256sum`, et `certutil -hashfile <fichier> SHA256` donne l'empreinte d'un fichier depuis CMD. Signale tout écart avant de continuer.

## Étape 1 : lecture

Lis `SKILL.md`, `manifest.json`, puis les modules actifs dans l'ordre indiqué par `SKILL.md`, section 1. Ne lis `modules/local/SKILL.md`, `modules/symboles/SKILL.md` et `modules/service-mcp/SKILL.md` que pour comprendre les points d'extension : ces dimensions sont réservées.

## Étape 2 : fichiers exécutables

1. Depuis le dossier du skill, écris `scripts/app_db.mjs`, `tests/app_db.test.mjs` et `agent/memoire-appli.md` à partir des blocs annotés des modules, par la commande d'extraction du module `execution`, § 9. Elle se colle telle quelle dans bash, CMD ou PowerShell. Ne recopie pas les fichiers à la main.
2. La commande vérifie elle-même leurs empreintes : elle écrit `conforme` pour chaque fichier, ou `ECART`, et sort alors avec le code 1. Un écart arrête l'installation.
3. Vérifie les versions de Node (22.13 ou plus récent) et de git (2.38 ou plus récent), puis lance la recette : `node --test tests/app_db.test.mjs`. Attendu : 34 tests passés sous Linux et WSL2 ; 33 passés et 1 sauté sous Windows. Rapporte au développeur le bilan ; un échec arrête l'installation et se rapporte tel quel, sans modifier le script.

## Étape 3 : l'agent

Propose au développeur d'installer l'agent `agent/memoire-appli.md` (module `agent`, § 2) : dans `.claude/agents/` pour Claude Code, ou comme consigne système dans son outil. Rejoue avec lui les scénarios A1 à A6 du module `agent` avant que l'agent serve d'autres agents.

## Étape 4 : réglages et première indexation

1. Lance `config` et montre au développeur les réglages effectifs, leur source et les emplacements ; s'il veut les fixer pour ses agents, ce sont les variables `SKILL4APPLI_*` (module `configuration`). Relaie tout avertissement.
2. Demande-lui le mode : `ingest` (instantané du disque, mode `travail`) ou `watch` (branche courante chargée dans un worktree dédié et suivie, mode `miroir`). `watch` crée un worktree : ne le lance qu'avec son accord. Ensuite, `status` doit rendre `a_jour`, ou `modifs_locales` en mode `miroir` si des modifications ne sont pas commitées.

## Règles qui ne se négocient pas

- Tu n'adaptes pas le script : un écart, une erreur ou un besoin nouveau se signale au développeur.
- La base localise, le disque fait foi : avant d'affirmer le contenu d'un fichier ou de citer une ligne, relis ce fichier dans le worktree source.
- `query` est en lecture seule ; tu n'écris dans la base que par `ingest` et `watch`.
- Tu ne modifies jamais le miroir et tu ne contournes jamais un refus du script (code 4 ou 7) : tu le rapportes.
- Aucun watcher, même `--once`, ni `watch-stop`, ni `mirror-remove`, sans l'accord du développeur.
- Le skill tourne du côté du git qui possède le dépôt ; depuis WSL, pour un dépôt sous Windows, tu l'appelles par `node.exe` avec des chemins Windows.
- N'applique aucune dimension au statut `reserved`.

Commence par l'étape 0, puis l'étape 1, puis l'étape 2.

---

# Skill
