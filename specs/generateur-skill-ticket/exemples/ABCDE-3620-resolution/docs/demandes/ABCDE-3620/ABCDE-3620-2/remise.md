# Remise de ABCDE-3620-2 : lignes et date-heure du résumé tenues à jour, annoncées sans déplacer le focus

- **Sous-ticket** : ABCDE-3620-2, feuille de ABCDE-3620 ; méso-contrat M03 ; ratifié le 2026-11-05, après la clôture de ABCDE-3620-1.2.
- **Branche** : feature/ABCDE-3620-commande-resume-temps-reel.

## Modifications par slot

| Slot | Commit | Scénario | Fichiers |
|---|---|---|---|
| É5 | `80dd900` | S05 | lignes-commande.store.ts, lignes-commande.component.ts, lignes-commande.component.html, lignes-commande.temps-reel.spec.ts |
| É5 | `cf690be` | S06 | lignes-commande.annonce.spec.ts |
| É2 | `3743b46` | S07 | lignes-commande.reprise.spec.ts |

## Dossier de preuves

| Critère | Critère d'acceptation | Scénario | Test | Résultat |
|---|---|---|---|---|
| ABCDE-3620-2:C1 | ABCDE-3620-CA05 | S05, S07 | `lignes-commande.temps-reel.spec.ts` › ABCDE-3620-S05, `lignes-commande.reprise.spec.ts` › ABCDE-3620-S07 | verts |
| ABCDE-3620-2:C2 | ABCDE-3620-CA05 | S06 | `lignes-commande.annonce.spec.ts` › ABCDE-3620-S06 | vert |

Gates : `ng lint`, `ng test` sans navigateur interactif et `ng build` passent.

## Revue et qualité

- Relecteur, angular 1.0.1 en mode revue : aucun constat bloquant ; région `aria-live` polie et focus conservé conformes.
- Agent qualité, sonarqube 1.1.0, examen local : moteurs SonarLint et relecture par les règles ; aucun constat sur le diff.

## Écarts, boucle et capitalisation

- Écarts : aucun. Pas d'image de l'objectif pour ce ticket.
- Boucle de second ordre : aucune observation qui appelle une rétroaction.
- Capitalisation : l'ordre abonnement, instantané, événements suffit à la reprise après une coupure.

## Contributions aux kits

- Commits :
- `80dd900fc250fe4394892da632dd9f8d7dfd0169` : ABCDE-3620 S05 : [É5-UI] feat(angular): lignes et date-heure tenues à jour par le canal des lignes
- `cf690bed686a533ef351b325c6e18f739c19cef7` : ABCDE-3620 S06 : [É5-UI] test(angular): annonce polie des mises à jour, sans déplacer le focus
- `3743b46b62b33440edec14c84575e6dab05e6b16` : ABCDE-3620 S07 : [É2-UI] test(angular): reprise par l'instantané et son ETag après une coupure
- Tests : `front/src/app/commande/lignes-commande.temps-reel.spec.ts` (ABCDE-3620-S05) ; `front/src/app/commande/lignes-commande.annonce.spec.ts` (ABCDE-3620-S06) ; `front/src/app/commande/lignes-commande.reprise.spec.ts` (ABCDE-3620-S07).
- Captures de l'écran livré : `docs/demandes/ABCDE-3620/ABCDE-3620-2/captures/ABCDE-3620-S05.png` (S05), `docs/demandes/ABCDE-3620/ABCDE-3620-2/captures/ABCDE-3620-S06.png` (S06) ; aucune image de l'objectif à comparer. S07 n'a pas de capture : la coupure se simule.
- Démonstration : données `docs/demandes/ABCDE-3620/ABCDE-3620-2/demo/donnees.sql` ; commande de lancement du front, `npm --prefix front start`.
