# Explication de l'hôte d'IA : skill explication-hote-ia {{VERSION}}, transmission texte

Ce texte contient à la fois la consigne de travail et le skill complet. Il n'y a aucune pièce jointe. Le skill est découpé en fichiers, chacun délimité ainsi :

    <<<FICHIER chemin/relatif>>>
    ...contenu exact du fichier...
    <<<FIN chemin/relatif>>>

---

À partir de maintenant, tu installes le skill explication-hote-ia décrit par ce texte, tu le fais fonctionner, puis tu peux expliquer au développeur comment fonctionne l'outil d'IA qui t'exécute. Le skill fait foi. Si tu relèves une ambiguïté ou une contradiction dans le skill, signale-la au développeur. Ne corrige pas le skill toi-même, ni son script.

## Étape 0 : matérialiser le skill

Dans Gemini CLI, avec un clone du dépôt Agent2Prompt, l'installateur fait cette étape sans IA et vérifie chaque fichier : `node <Agent2Prompt>/tools/installer.mjs explication-hote-ia --utilisateur` l'installe dans `~/.gemini/skills/explication-hote-ia/`, pour tous les projets. Passe alors directement à l'étape 1, dans ce dossier.

Sinon :

1. Crée le dossier `.skills/explication-hote-ia/` à la racine du projet, ou à l'emplacement que le développeur indique. Dans un dépôt git, ajoute `/.skills/` à `.git/info/exclude` s'il n'y est pas : le skill ne doit pas apparaître dans `git status`. Si ton hôte est Gemini CLI, ajoute aussi à `.geminiignore` les lignes `!/.skills/` et `!/.skills/explication-hote-ia/`, sans quoi ses outils de lecture refuseraient les modules du skill.
2. Pour chaque bloc `<<<FICHIER chemin>>>` … `<<<FIN chemin>>>`, crée le fichier `chemin` dans ce dossier, avec le contenu exact compris entre les deux lignes délimitrices. Ces deux lignes ne font pas partie du fichier. Ne reformule rien, ne traduis rien, ne complète rien.
3. Si tu disposes d'un shell, vérifie chaque fichier avec `sha256sum -c` contre la table d'intégrité en fin de texte ; sous Windows, Git Bash fournit `sha256sum`, et `certutil -hashfile <fichier> SHA256` donne l'empreinte d'un fichier depuis CMD. Signale tout écart avant de continuer.

## Étape 1 : lecture

Lis `SKILL.md`, `manifest.json`, puis les modules actifs dans l'ordre indiqué par `SKILL.md`, section 1. Ne lis `modules/autres-hotes/SKILL.md` et `modules/comparaison/SKILL.md` que pour comprendre les points d'extension : ces dimensions sont réservées.

## Étape 2 : fichiers exécutables et recette

1. Depuis le dossier du skill, écris `scripts/instantane-hote.mjs`, `tests/instantane-hote.test.mjs`, `agent/explicateur-hote.md` et les trois commandes de `commandes/hote/` à partir des blocs annotés des modules, par la commande d'extraction du module `execution`, § 8. Elle se colle telle quelle dans bash, CMD ou PowerShell. Ne recopie pas les fichiers à la main.
2. La commande vérifie elle-même leurs empreintes : elle écrit `conforme` pour chaque fichier, ou `ECART`, et sort alors avec le code 1. Un écart arrête l'installation.
3. Vérifie la version de Node (20 ou plus récent), puis lance la recette : `node --test tests/instantane-hote.test.mjs`. Attendu : 28 tests réussis sous Linux et WSL2 ; 27 réussis et 1 sauté sous Windows et macOS. Rapporte au développeur le bilan ; un échec arrête l'installation et se rapporte tel quel, sans modifier le script.

## Étape 3 : le sous-agent et les commandes

Propose au développeur d'installer le sous-agent `agent/explicateur-hote.md` et les commandes `/hote:explique`, `/hote:carte` et `/hote:pourquoi` (module `agent`, § 2). N'écris dans ses dossiers de configuration qu'avec son accord ; dans la copie installée du sous-agent, remplace `<DOSSIER_DU_SKILL>` par le chemin absolu du dossier du skill.

## Étape 4 : premier instantané

1. Lance `hote`, puis `tout --format texte`, depuis la racine du projet, et présente au développeur la carte de l'installation, chaque point avec son étiquette de provenance (module `provenance`). Relaie tout avertissement.
2. Rejoue avec lui les scénarios A1 à A12 du module `agent`.

## Règles qui ne se négocient pas

- Le script ne fait que lire, et tu ne modifies rien pendant que tu expliques : une modification se décrit et ne s'applique que sur demande explicite du développeur.
- Chaque affirmation sur l'hôte porte son étiquette et sa source ; rien sur toi-même d'après ta propre impression, ni ton modèle, ni ta version, ni tes limites.
- La documentation qui fait foi est celle de la version installée de l'hôte ; un repère d'une autre version se signale « à revérifier ».
- Aucune valeur secrète n'est recopiée, ni dans une réponse, ni dans un fichier.
- Gemini CLI est le seul hôte que tu nommes ; un autre se décrit par ce qui s'en observe.
- N'applique aucune dimension au statut `reserved`.

Commence par l'étape 0, puis l'étape 1, puis l'étape 2.

---

# Skill
