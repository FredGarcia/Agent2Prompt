# Champ d'observation d'essai : ABCDE-3620

Retours simulés au milieu de la vie de l'arbre ABCDE-3620, déposés un à un par `outils/champ.mjs` (prototype « skill de ticket », lot 5, critère P5) depuis `tests/fixtures/champs-ABCDE-3620.json` :

- deux corrections du développeur au même motif, `requete-native`, sur les actions de l'agent de persistance de ABCDE-3620-1.1, font attendre une observation d'ordre 2 ; sa proposition est examinée par l'ordre 3, puis retenue par le développeur ;
- un écart sur le critère ABCDE-3620-1.2:C3 menace ABCDE-3620-1:C3 et le critère d'acceptation ABCDE-3620-CA03, jusqu'à sa correction à l'ordre 1 ;
- ABCDE-3620-1.2 et ABCDE-3620-2 rendent des verdicts contraires sur le canal des lignes : le désaccord s'inscrit d'office au registre des écarts du projet, décision laissée au développeur.

`docs/demandes/ABCDE-3620/champ.jsonl` et `champ.tete` forment le champ ; `docs/c7e/registre-ecarts.md` est le registre des écarts du projet ; `etat.txt` est la sortie de `champ.mjs etat` à la fin du scénario. La recette rejoue le scénario et retrouve ces fichiers à l'identique.

Depuis le lot 6 (critère P6), le projet porte aussi les documents de la clé, `docs/demandes/ABCDE-3620/us.md` et `ABCDE-3620.feature` (ceux du projet résolu, ratifiés avec l'arbre au n° 1), et la vue augmentée que `outils/vue.mjs` tire du champ et de ces documents : `docs/demandes/ABCDE-3620/vue.html` et `vue.md` à la fin du scénario, et, dans `vues/`, la vue en Markdown à trois moments du scénario :

- `champ-n06.md` : deux corrections au motif `requete-native` ; l'observation d'ordre 2 attendue se pose sur les scénarios S03 et S04, que les corrections atteignent ;
- `champ-n15.md` : l'écart sur ABCDE-3620-1.2:C3 menace ABCDE-3620-1:C3 et CA03, en tête de « À traiter » ;
- `champ-n21.md` : le contrat du canal des lignes, ancre née du champ, en désaccord, avec son écart au registre.

`node tests/vue-scenarios.mjs --ecrire` réécrit ces vues après un changement voulu du rendu ; la recette les retrouve à l'identique.
