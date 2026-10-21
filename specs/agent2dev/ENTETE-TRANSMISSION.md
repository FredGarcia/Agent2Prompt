# Agent2Dev : spécification {{VERSION}}, transmission texte

Ce texte contient à la fois la consigne de travail et la spécification complète. Il n'y a aucune pièce jointe. La spécification est découpée en fichiers, chacun délimité ainsi :

    <<<FICHIER chemin/relatif>>>
    ...contenu exact du fichier...
    <<<FIN chemin/relatif>>>

---

Tu vas construire Agent2Dev, le système de développement décrit par cette spécification. La spécification fait foi. Si tu relèves un écart ou une ambiguïté, signale-le au développeur. Ne corrige pas la spécification toi-même.

## Étape 0 : matérialiser la spécification

1. Crée le dossier `agent2dev/` à la racine du dépôt Agent2Dev (ou à l'emplacement que le développeur indique). À sa racine, crée le dossier `spec/`.
2. Pour chaque bloc `<<<FICHIER chemin>>>` … `<<<FIN chemin>>>`, crée le fichier `spec/chemin` avec le contenu exact compris entre les deux lignes délimitrices. Ces deux lignes ne font pas partie du fichier. Ne reformule rien, ne traduis rien, ne complète rien.
3. Si tu disposes d'un shell, vérifie chaque fichier avec `sha256sum -c` contre la table d'intégrité en fin de texte, depuis `spec/`. Signale tout écart avant de continuer.
4. Le dossier `archives/` n'est pas transmis. Ne le recrée pas.
5. Demande au développeur la transmission du skill agent-tdd-jira 1.3.1 (`transmissions/agent-tdd-jira-1.3.1.md` du dépôt Agent2Prompt). Place-la telle quelle dans `test/fixtures/methode/`. C'est la méthode qu'Agent2Dev charge, et le jeu d'essai du module `methode`. Ne la recopie nulle part ailleurs.

Les chemins internes à la spécification (`modules/...`, `SKILL.md`) sont relatifs à `spec/`. Les fichiers de code (`src/...`, `test/...`, `fiches/...`, `schemas/...`, `constitution/...`, `configuration/...`) se placent à la racine d'`agent2dev/`, à côté de `spec/`.

Le dossier `agents-modif/` du même dépôt est la lignée d'Agent2Dev. Tu peux le lire pour ses idées (bus, agent générique, vérification « avant / après », observant, apprenant) ; tu ne le modifies pas.

## Étape 1 : lecture, sans écrire de code

1. Lis `spec/SKILL.md` en entier, puis `spec/manifest.json`.
2. Lis les modules actifs dans l'ordre de `SKILL.md`, section 1.
3. Ne lis `spec/modules/memoire/SKILL.md` et `spec/modules/autonomie/SKILL.md` que pour comprendre les points d'extension E3 et E4. Ne les implémente pas : leur statut est `reserved`.

## Étape 2 : plan, sans code

Soumets au développeur :

- l'arborescence des fichiers à créer, en reprenant la section « Fichiers à produire » de chaque module ;
- les choix techniques que la spécification ne couvre pas ;
- tes questions.

Attends la validation du développeur avant d'écrire la moindre ligne de code.

## Étape 3 : implémentation par lots

Après validation, implémente dans cet ordre. Chaque lot passe ses tests, en simulation et sans réseau, avant le suivant, et se termine par un point de validation du développeur. Un lot qui a besoin d'un module d'un lot suivant s'appuie sur sa simulation, déclarée par le même contrat de bus.

1. Noyau : `noyau` (D1).
2. Données, journal, référentiel et méthode : `donnees`, `journal`, `referentiel`, `methode` (D2, D13, D17, D3).
3. Substrat : `profil`, `depot`, `executant` (D4, D5, D6).
4. Cadrage et orchestration : `cadrage`, `orchestrateur` (D7, D12).
5. Conception et réalisation : `conception`, `realisation` (D8, D9).
6. Binôme et traçabilité : `binome`, `tracabilite` (D10, D11).
7. Premier et second ordre : `observateur`, `apprenant`, `reflexif` (D14, D15, D16).
8. Interfaces : `mcp`, `tableau-de-bord`, `relais` (D18, D19, D23).
9. Exploitation : `exploitation` (D20) et le guide de démarrage.

## Étape 4 : recette

Vérifie les critères d'acceptation globaux de `SKILL.md`, section 9, puis rends compte au développeur : invariants couverts, scénarios passés, écarts, questions ouvertes.

## Règles qui ne se négocient pas

- La méthode est le skill agent-tdd-jira 1.3.1, lu depuis sa transmission vérifiée : Agent2Dev n'en réécrit rien, et n'en recopie rien dans son code.
- Sans l'autorisation d'écrire le code, qui n'est pas donnée par défaut, Agent2Dev n'écrit rien dans l'arbre du développeur, hors des fichiers de travail que le kit exclut du dépôt : il travaille dans une copie de travail et remet un patch par scénario accepté, que le développeur applique lui-même.
- Seul le `depot` écrit dans un arbre du projet ; il ne pousse jamais et, dans l'arbre du développeur, ne fusionne pas, ne rebase pas et ne change pas de branche.
- Seules s'exécutent les commandes du profil ratifié et les scripts du skill, sans shell. Agent2Dev ne démarre, n'arrête ni ne déploie l'application, et ne lance aucun batch.
- Le moteur ne produit que des données validées ; aucun code, aucune commande ni aucun chemin qu'il produit n'est exécuté tel quel.
- Aucun code de production avant un test étiqueté qui échoue pour la raison attendue.
- Aucun point de validation n'est sauté, supprimé ou décidé par le système.
- Le journal et le grand livre sont en ajout seul.
- Tout s'exécute en local ; les interfaces n'écoutent que sur `127.0.0.1`.
- n8n est facultatif : rien ne doit en dépendre. Il ne porte que la remise et le journal de tests, et ne décide rien.
- N'implémente aucun module au statut `reserved`.

Commence par l'étape 0, puis l'étape 1, puis l'étape 2.

---

# Spécification
