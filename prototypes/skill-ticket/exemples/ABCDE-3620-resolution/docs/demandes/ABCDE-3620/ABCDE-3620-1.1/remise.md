# Remise de ABCDE-3620-1.1 : date-heure de la dernière ligne par une requête d'agrégat

- **Sous-ticket** : ABCDE-3620-1.1, feuille de ABCDE-3620-1 ; méso-contrat M02 ; ratifié le 2026-11-03.
- **Branche** : feature/ABCDE-3620-commande-resume-temps-reel.

## Modifications par slot

| Slot | Commit | Scénario | Fichiers |
|---|---|---|---|
| É1 | `d7e25cc` | S04 | LigneCommandeRepository.java, LigneCommandeRepositoryAgregatTest.java |
| É1 | `9a77ef8` | S03 | LigneCommandeRepositorySansLigneTest.java |

## Dossier de preuves

| Critère | Critère d'acceptation | Scénario | Test | Résultat |
|---|---|---|---|---|
| ABCDE-3620-1.1:C1 | ABCDE-3620-CA04 | S04 | `LigneCommandeRepositoryAgregatTest#dateHeureLueEnUneSeuleRequete` | vert ; rouge d'abord, « expected: 1 but was: 4 » |
| ABCDE-3620-1.1:C2 | ABCDE-3620-CA03 | S03 | `LigneCommandeRepositorySansLigneTest#agregatVidePourUneCommandeSansLigne` | vert du premier coup : le comportement découle de l'agrégat ; contrôle par cassure volontaire, cité dans le rapport de l'agent |

Gates : `./mvnw verify` vert. Aucune migration : la colonne `ligne_commande.enregistree_le` existe.

## Revue et qualité

- Relecteur, java 1.1.1 en mode revue : aucun constat bloquant ni majeur.
- Agent qualité, sonarqube 1.1.0, examen local : moteurs SonarLint et relecture par les règles ; aucune analyse éphémère, faute de lot d'écritures validé ; aucun constat sur le diff.

## Écarts, boucle et capitalisation

- Écarts : aucun.
- Boucle de second ordre : aucune observation qui appelle une rétroaction.
- Capitalisation : la lecture par agrégat sert aussi la variante résumée de ABCDE-3620-1.2.

## Contributions aux kits

- Commits :
- `d7e25cc2d75a3d3d97adbe24a9f403b01b68a6c5` : ABCDE-3620 S04 : [É1-DB] feat(jpa): date-heure maximale des lignes par une requête d'agrégat
- `9a77ef847b3446f034aafe656067940d65556c45` : ABCDE-3620 S03 : [É1-DB] test(jpa): agrégat vide pour une commande sans ligne
- Tests : `back/src/test/java/fr/exemple/commande/LigneCommandeRepositoryAgregatTest.java` (ABCDE-3620-S04) ; `back/src/test/java/fr/exemple/commande/LigneCommandeRepositorySansLigneTest.java` (ABCDE-3620-S03).
- Démonstration : ni données ni commande propres.
