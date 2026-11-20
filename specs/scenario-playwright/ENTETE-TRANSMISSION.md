# Scénarios côté utilisateur avec Playwright : skill scenario-playwright {{VERSION}}, transmission texte

Ce texte contient à la fois la consigne de travail et le skill complet. Il n'y a aucune pièce jointe. Le skill est découpé en fichiers, chacun délimité ainsi :

    <<<FICHIER chemin/relatif>>>
    ...contenu exact du fichier...
    <<<FIN chemin/relatif>>>

---

À partir de maintenant, tu installes le skill scenario-playwright décrit par ce texte sur le poste du développeur, tu le fais fonctionner, puis tu peux importer de Jira, traduire, faire ratifier et jouer ses scénarios comme son agent. Le skill fait foi. Si tu relèves une ambiguïté ou une contradiction dans le skill, signale-la au développeur. Ne corrige pas le skill toi-même, ni ses scripts.

## Étape 0 : matérialiser le skill

Si le développeur dispose d'un clone du dépôt Agent2Prompt et que ton hôte est Gemini CLI, `node installer.mjs`, à la racine du clone, fait cette étape et la suivante sans IA : il installe le skill dans `~/.gemini/skills/scenario-playwright/`, avec ses fichiers exécutables vérifiés, son agent et ses commandes. Passe alors à l'étape 2, point 3, dans ce dossier.

Sinon :

1. Le skill ne dépend d'aucun projet. Crée le dossier `.skills/scenario-playwright/` à l'emplacement que le développeur indique ; à défaut, dans son dossier personnel (`%USERPROFILE%\.skills\scenario-playwright\` sous Windows, `~/.skills/scenario-playwright/` ailleurs). Sous Windows, avec WSL2, choisis le côté où Chrome est installé : en général Windows. Si le dossier est dans un dépôt git, ajoute `/.skills/` à `.git/info/exclude` s'il n'y est pas ; si ton hôte est Gemini CLI, ajoute aussi à `.geminiignore` les lignes `!/.skills/` et `!/.skills/scenario-playwright/`.
2. Pour chaque bloc `<<<FICHIER chemin>>>` … `<<<FIN chemin>>>`, crée le fichier `chemin` dans ce dossier, avec le contenu exact compris entre les deux lignes délimitrices. Ces deux lignes ne font pas partie du fichier. Ne reformule rien, ne traduis rien, ne complète rien.
3. Si tu disposes d'un shell, vérifie chaque fichier avec `sha256sum -c` contre la table d'intégrité en fin de texte ; sous Windows, Git Bash fournit `sha256sum`, et `certutil -hashfile <fichier> SHA256` donne l'empreinte d'un fichier depuis CMD. Signale tout écart avant de continuer.

## Étape 1 : lecture

Lis `SKILL.md`, `manifest.json`, puis les modules actifs dans l'ordre indiqué par `SKILL.md`, section 1. Ne lis `modules/traduction-auto/SKILL.md`, `modules/demo/SKILL.md`, `modules/remise/SKILL.md`, `modules/accessibilite/SKILL.md` et `modules/enregistrement/SKILL.md` que pour comprendre les points d'extension : ces dimensions sont réservées.

## Étape 2 : fichiers exécutables et recette

1. Depuis le dossier du skill, écris les fichiers exécutables à partir des blocs annotés des modules, par la commande d'extraction du module `execution`, § 8. Elle se colle telle quelle dans bash, CMD ou PowerShell. Ne recopie pas les fichiers à la main.
2. La commande vérifie elle-même leurs empreintes : elle écrit `conforme` pour chaque fichier, ou `ECART` ou `ABSENT`, et sort alors avec le code 1. Un écart arrête l'installation.
3. Vérifie la version de Node (22 ou plus récent), puis installe la dépendance : `npm ci`. Elle ne télécharge aucun navigateur ; Chrome doit être installé sur le poste (module `execution`, § 2).
4. Lance la recette : `npm test` ; sous Linux sans écran, `xvfb-run -a npm test`. Attendu : 21 scénarios, 279 contrôles réussis, aucun échec ; là où l'adresse 127.0.0.2 n'est pas disponible, deux contrôles sont sautés. Rapporte au développeur le bilan ; un échec arrête l'installation et se rapporte tel quel, sans modifier les scripts.

## Étape 3 : l'agent et les commandes

Propose au développeur d'installer le sous-agent `agent/pilote-scenario.md` et les commandes `/scenario:importer`, `/scenario:traduire`, `/scenario:jouer` et `/scenario:designer` (module `agent`, § 2). N'écris dans ses dossiers de configuration qu'avec son accord ; dans la copie installée du sous-agent, remplace `<DOSSIER_DU_SKILL>` par le chemin absolu du dossier du skill. Rejoue avec lui les scénarios A1 à A8 du module `agent`.

## Étape 4 : premier scénario, avec le développeur

1. Il écrit un texte de départ (module `texte`) pour une application de son poste ; vérifie-le. Si ses scénarios sont dans une demande Jira, importe-les plutôt (module `jira`) : depuis la page qu'il a enregistrée, ou par l'adresse de la demande, où il se connecte lui-même ; rends-lui le bilan de l'import, puis vérifie chaque texte écrit.
2. Traduis-le sur le squelette de `traduire.mjs` (module `scenario`, § 4), puis présente-lui le plan de `verifier.mjs --plan`, ligne du texte par ligne du texte, et attends sa ratification.
3. Joue-le dans une fenêtre visible ; il fait lui-même chaque étape à la main. Examine ensuite avec lui le rapport, chaque étape en échec et chaque origine bloquée.

## Règles qui ne se négocient pas

- Tu ne demandes, ne lis et ne saisis aucun identifiant : le développeur se connecte lui-même dans la fenêtre du navigateur.
- Rien ne se joue avant que le développeur ait ratifié la traduction ; tu ne modifies ni son texte ni un scénario ratifié sans son accord.
- Tu ne passes `--autoriser-mutations` qu'avec l'accord explicite du développeur, pour une exécution.
- Tu n'écris jamais dans Jira ; tu ne lis les commentaires d'une demande qu'à sa demande ; tu compares avant de remplacer un texte importé, et tu ne passes `--remplacer` qu'avec son accord.
- Les résultats, les captures, les téléchargements, les traces, les pages Jira enregistrées et les profils restent sur le poste : tu ne les déplaces, ne les partages ni ne les versionnes.
- Tu n'adaptes pas les scripts : un écart, une erreur ou un besoin nouveau se signale au développeur.
- N'applique aucune dimension au statut `reserved`.

Commence par l'étape 0, puis l'étape 1, puis l'étape 2.

---

# Skill
