# Projet d'exemple : gestion des commandes

Projet réduit, résolu par l'arbre de skills de ticket ABCDE-3620 du prototype « skill de ticket » (lot 4) : il porte, dans `docs/demandes/ABCDE-3620/`, les documents de la clé rédigés selon agent-tdd-jira, la remise de chaque nœud de l'arbre, les kits dev, test et démo et la remise à Agent2Test, tels que le skill racine les assemble à la clôture.

Les fichiers de code et de test sont réduits à ce qu'il faut pour les contrôles : chaque fichier entre une seule fois dans l'historique, à son état final. L'historique illustre le format des commits de l'arbre, pas le déroulé du cycle TDD. Les tests du prototype reconstruisent cet historique dans un dépôt Git temporaire, aux dates fixées par `tests/fixtures/historique-ABCDE-3620.json`, et retrouvent les commits du kit dev.
