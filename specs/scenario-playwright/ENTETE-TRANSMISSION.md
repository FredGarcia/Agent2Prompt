# Scénarios côté utilisateur avec Playwright : skill scenario-playwright {{VERSION}}, transmission texte

Ce texte contient à la fois la consigne de travail et le skill complet. Il n'y a aucune pièce jointe. Le skill est découpé en fichiers, chacun délimité ainsi :

    <<<FICHIER chemin/relatif>>>
    ...contenu exact du fichier...
    <<<FIN chemin/relatif>>>

---

À partir de maintenant, tu installes le skill scenario-playwright décrit par ce texte sur le poste du développeur, tu le fais fonctionner, puis tu peux importer de Jira, de Xray, de Zephyr Scale ou de fichiers .feature, indexer le code de son projet, traduire, faire ratifier et jouer ses scénarios, avec la préparation et le nettoyage de leurs données, les exporter en tests de son projet et en écrire les résultats pour Xray ou Zephyr Scale, comme son agent. Le skill fait foi. Si tu relèves une ambiguïté ou une contradiction dans le skill, signale-la au développeur. Ne corrige pas le skill toi-même, ni ses scripts.

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
3. Vérifie la version de Node (22 ou plus récent), puis installe les dépendances : `npm ci`, `playwright-core` et, pour la recette, `@playwright/test`. Elles ne téléchargent aucun navigateur ; Chrome doit être installé sur le poste (module `execution`, § 2).
4. Lance la recette : `npm test` ; sous Linux sans écran, `xvfb-run -a npm test`. Attendu : 38 scénarios, 570 contrôles réussis, aucun échec ; là où l'adresse 127.0.0.2 n'est pas disponible, six contrôles sont sautés, et un septième là où un lien symbolique ne peut se créer. Rapporte au développeur le bilan ; un échec arrête l'installation et se rapporte tel quel, sans modifier les scripts.

## Étape 3 : l'agent et les commandes

Propose au développeur d'installer le sous-agent `agent/pilote-scenario.md` et les commandes `/scenario:importer`, `/scenario:indexer`, `/scenario:traduire`, `/scenario:jouer`, `/scenario:designer`, `/scenario:exporter` et `/scenario:resultats` (module `agent`, § 2). N'écris dans ses dossiers de configuration qu'avec son accord ; dans la copie installée du sous-agent, remplace `<DOSSIER_DU_SKILL>` par le chemin absolu du dossier du skill. Rejoue avec lui les scénarios A1 à A16 du module `agent`.

## Étape 4 : premier scénario, avec le développeur

1. Il écrit un texte de départ (module `texte`) pour une application de son poste ; vérifie-le. Si ses scénarios sont dans une demande Jira, importe-les plutôt (module `jira`) : depuis la page qu'il a enregistrée, ou par l'adresse de la demande, où il se connecte lui-même. S'ils sont des tests de Xray ou de Zephyr Scale, ou des fichiers `.feature`, importe-les depuis un export, ou par l'API avec le jeton qu'il définit lui-même dans une variable d'environnement (module `cas-de-test`). Rends-lui le bilan de l'import, relis avec lui chaque test manuel converti, puis vérifie chaque texte écrit.
2. Si le code de son projet est sur le poste, indexe-le d'abord, avec son accord : `indexer.mjs` le lit sans rien exécuter et n'écrit que dans `index/` du dossier des scénarios (module `code`) ; rends-lui le bilan et chaque limite.
3. Traduis le texte sur le squelette de `traduire.mjs` (module `scenario`, § 4) ; contrôle chaque proposition de l'index avant de la reprendre, et ne vérifie hors de l'écran (module `hors-ecran`) que ce qu'une phrase demande, et ne prépare ou ne nettoie les données (module `donnees`) que pour une ligne marquée. Présente-lui ensuite le plan de `verifier.mjs --plan`, ligne du texte par ligne du texte, examine avec lui chaque cible notée absente de l'index, et attends sa ratification.
4. Joue-le dans une fenêtre visible ; il fait lui-même chaque étape à la main. Examine ensuite avec lui le rapport, chaque étape en échec, chaque relevé hors de l'écran et chaque origine bloquée.
5. S'il veut le rejouer dans sa CI, exporte le scénario ratifié, avec son accord, dans le dossier de tests qu'il désigne (module `export`) : rends-lui le bilan, dis-lui que la connexion de son équipe reste à écrire s'il y a une étape à la main, sans l'écrire, et comment jouer ailleurs. Pour un texte importé d'un test de Xray ou de Zephyr Scale, écris les résultats de l'exécution par `resultats.mjs` : il les importe lui-même.

## Règles qui ne se négocient pas

- Tu ne demandes, ne lis et ne saisis aucun identifiant : le développeur se connecte lui-même dans la fenêtre du navigateur.
- Tu ne demandes, n'affiches, n'écris ni ne passes en argument aucun jeton : un jeton d'API passe par la variable d'environnement que le développeur définit lui-même ; s'il en colle un dans la conversation, signale-le et recommande-lui de le révoquer.
- Rien ne se joue avant que le développeur ait ratifié la traduction ; tu ne modifies ni son texte ni un scénario ratifié sans son accord.
- Tu ne passes `--autoriser-mutations` qu'avec l'accord explicite du développeur, pour une exécution.
- Tu n'écris jamais dans Jira, Xray ni Zephyr Scale ; tu ne lis les commentaires d'une demande qu'à sa demande ; tu compares avant de remplacer un texte importé, et tu ne passes `--remplacer` qu'avec son accord.
- Tu n'exécutes, ne construis ni ne modifies le code du projet : l'index le lit seulement ; une vérification `api` ne fait que des GET, vers une origine que le scénario déclare.
- Tu ne crées, ne modifies ni ne supprimes aucune donnée hors d'une entrée de préparation ou de nettoyage ratifiée ; ses appels partent avec la session du développeur, sans en-tête ni jeton ajouté, et hors du poste avec son accord seulement.
- Tu n'écris dans son projet que par `exporter.mjs`, dans le dossier de tests qu'il désigne ; tu ne retouches ni un test exporté ni les aides, n'écris jamais la connexion de son équipe et ne passes `--remplacer` qu'avec son accord.
- Tu n'envoies aucun résultat à Xray ni à Zephyr Scale : `resultats.mjs` écrit un fichier, qu'il importe ; tu n'y joins les captures qu'à sa demande.
- Les résultats, les captures, les téléchargements, les traces, les pages Jira enregistrées et les profils restent sur le poste : tu ne les déplaces, ne les partages ni ne les versionnes.
- Tu n'adaptes pas les scripts : un écart, une erreur ou un besoin nouveau se signale au développeur.
- N'applique aucune dimension au statut `reserved`.

Commence par l'étape 0, puis l'étape 1, puis l'étape 2.

---

# Skill
