# Champ d'observation d'essai : ABCDE-3620

Retours simulés au milieu de la vie de l'arbre ABCDE-3620, déposés un à un par `outils/champ.mjs` (prototype « skill de ticket », lot 5, critère P5) depuis `tests/fixtures/champs-ABCDE-3620.json` :

- deux corrections du développeur au même motif, `requete-native`, sur les actions de l'agent de persistance de ABCDE-3620-1.1, font attendre une observation d'ordre 2 ; sa proposition est examinée par l'ordre 3, puis retenue par le développeur ;
- un écart sur le critère ABCDE-3620-1.2:C3 menace ABCDE-3620-1:C3 et le critère d'acceptation ABCDE-3620-CA03, jusqu'à sa correction à l'ordre 1 ;
- ABCDE-3620-1.2 et ABCDE-3620-2 rendent des verdicts contraires sur le canal des lignes : le désaccord s'inscrit d'office au registre des écarts du projet, décision laissée au développeur.

`docs/demandes/ABCDE-3620/champ.jsonl` et `champ.tete` forment le champ ; `docs/c7e/registre-ecarts.md` est le registre des écarts du projet ; `etat.txt` est la sortie de `champ.mjs etat` à la fin du scénario. La recette rejoue le scénario et retrouve ces fichiers à l'identique.
