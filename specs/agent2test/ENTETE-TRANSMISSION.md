# Agent2Test : spécification {{VERSION}}, transmission texte

Ce texte contient à la fois la consigne de travail et la spécification complète. Il n'y a aucune pièce jointe. La spécification est découpée en fichiers, chacun délimité ainsi :

    <<<FICHIER chemin/relatif>>>
    ...contenu exact du fichier...
    <<<FIN chemin/relatif>>>

---

Tu vas construire Agent2Test, le système de tests décrit par cette spécification, dans un projet séparé de l'application qu'il teste. La spécification fait foi. Si tu relèves un écart ou une ambiguïté, signale-le au développeur. Ne corrige pas la spécification toi-même.

## Étape 0 : matérialiser la spécification

1. Crée un projet vide `agent2test/`, hors du dépôt de l'application (ou à l'emplacement que le développeur indique). À sa racine, crée le dossier `spec/`.
2. Pour chaque bloc `<<<FICHIER chemin>>>` … `<<<FIN chemin>>>`, crée le fichier `spec/chemin` avec le contenu exact compris entre les deux lignes délimitrices. Ces deux lignes ne font pas partie du fichier. Ne reformule rien, ne traduis rien, ne complète rien.
3. Si tu disposes d'un shell, vérifie chaque fichier avec `sha256sum -c` contre la table d'intégrité en fin de texte, depuis `spec/`. Signale tout écart avant de continuer.
4. Le dossier `archives/` n'est pas transmis. Ne le recrée pas.

Les chemins internes à la spécification (`modules/...`, `SKILL.md`) sont relatifs à `spec/`. Les fichiers de code (`src/...`, `test/...`, `fiches/...`, `configuration/...`) se placent à la racine du projet, à côté de `spec/`.

## Étape 1 : lecture, sans écrire de code

1. Lis `spec/SKILL.md` en entier, puis `spec/manifest.json`.
2. Lis les modules actifs dans l'ordre de `SKILL.md`, section 1.
3. Ne lis `spec/modules/accessibilite/SKILL.md` et `spec/modules/profil-recette/SKILL.md` que pour comprendre les points d'extension E2 à E4. Ne les implémente pas : leur statut est `reserved`.

## Étape 2 : plan, sans code

Soumets au développeur :

- l'arborescence des fichiers à créer, en reprenant la section « Fichiers à produire » de chaque module ;
- les choix techniques que la spécification ne couvre pas ;
- tes questions.

Attends la validation du développeur avant d'écrire la moindre ligne de code.

## Étape 3 : implémentation par lots

Après validation, implémente dans cet ordre. Chaque lot passe ses tests, en simulation et sans réseau, avant le suivant, et se termine par un point de validation du développeur. Un lot qui a besoin d'un module d'un lot suivant s'appuie sur sa simulation, déclarée par le même contrat de bus.

1. Noyau : `noyau` (D1).
2. Données, journal et référentiel : `donnees`, `journal`, `referentiel` (D21, D10, D15).
3. Plan, mémoire et cartographie : `plan`, `memoire`, `scanner` (D3, D12, D5).
4. Exécution : `navigateur`, `preparateur`, `verdict`, `orchestrateur` (D4, D7, D8, D9).
5. Sélection : `stratege` (D6).
6. Premier et second ordre : `observateur`, `apprenant`, `reflexif` (D11, D13, D14).
7. Interfaces : `mcp`, `tableau-de-bord`, `relais` (D16, D17, D22).
8. Exploitation : `exploitation` (D18) et le guide de démarrage.

## Étape 4 : recette

Vérifie les critères d'acceptation globaux de `SKILL.md`, section 9, puis rends compte au développeur : invariants couverts, scénarios passés, écarts, questions ouvertes.

## Règles qui ne se négocient pas

- L'application testée n'est jamais modifiée : ses sources sont lues, jamais écrites. Agent2Test ne la démarre, ne l'arrête ni ne la déploie, et ne lance aucun batch.
- Agent2Test ne rédige ni ne corrige aucune US, aucun critère, aucun scénario.
- Aucun identifiant SSO n'est détenu, saisi ni journalisé.
- Le moteur ne produit que des données validées ; aucun code produit par le moteur n'est exécuté ni injecté dans une page.
- Aucun point de contrôle n'est sauté, supprimé ou validé par le système.
- Aucun verdict sans preuve ; aucun verdict réécrit.
- Le journal et le grand livre sont en ajout seul.
- Les données d'Agent2Test sont des fichiers SQLite, un par agent, par `node:sqlite` : aucun serveur de base de données. La dimension D2 est remplacée par D21 : n'implémente pas ses invariants.
- Tout s'exécute en local ; les interfaces n'écoutent que sur `127.0.0.1`.
- n8n est facultatif : rien ne doit en dépendre. Il ne fait que déposer une remise et relever un journal de tests, par le serveur MCP ; il ne décide rien et n'ouvre aucune campagne.
- N'implémente aucun module au statut `reserved`.

Commence par l'étape 0, puis l'étape 1, puis l'étape 2.

---

# Spécification
