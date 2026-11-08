# Remise de ABCDE-3620-1.2 : vue résumée à la même URI, ETag de la liste des lignes, canal des lignes

- **Sous-ticket** : ABCDE-3620-1.2, feuille de ABCDE-3620-1 ; méso-contrat M04 ; ratifié le 2026-11-04, après la clôture de ABCDE-3620-1.1.
- **Branche** : feature/ABCDE-3620-commande-resume-temps-reel.

## Modifications par slot

| Slot | Commit | Scénario | Fichiers |
|---|---|---|---|
| É3 | `4f6c659` | S01 | CommandeControllerSansVueTest.java |
| É3 | `b72c45c` | S02 | CommandeResumeDto.java, CommandeController.java, CommandeControllerVueResumeTest.java |
| É3 | `d2c9897` | S03 | CommandeControllerSansLigneTest.java |
| É3 | `78afeb1` | S05 | LignesCommandePublieur.java, LignesCommandePublieurTest.java |
| É3 | `3b14ac1` | S07 | LignesCommandeEtag.java, LignesCommandeEtagTest.java |

Gate contrats : le contrat de l'opération, paramètre `vue` et champ `lignesDernierEnregistrement`, validé par le développeur avant S02.

## Dossier de preuves

| Critère | Critère d'acceptation | Scénario | Test | Résultat |
|---|---|---|---|---|
| ABCDE-3620-1.2:C1 | ABCDE-3620-CA01 | S01 | `CommandeControllerSansVueTest#reponseInchangeeSansParametre` | vert, réponse comparée à la référence d'avant le ticket |
| ABCDE-3620-1.2:C2 | ABCDE-3620-CA02 | S02 | `CommandeControllerVueResumeTest#varianteResumee` | vert ; rouge d'abord, « No value at JSON path $.lignesDernierEnregistrement » |
| ABCDE-3620-1.2:C3 | ABCDE-3620-CA03 | S03 | `CommandeControllerSansLigneTest#dateHeureNullePourUneCommandeSansLigne` | vert |
| ABCDE-3620-1.2:C4 | ABCDE-3620-CA05 | S05, S07 | `LignesCommandePublieurTest#ligneAjouteePublieUnEvenement`, `LignesCommandeEtagTest#instantaneAvecEtag` | verts |

Gates : `./mvnw verify` vert ; conformité du contrat vérifiée.

## Revue et qualité

- Relecteur, java 1.1.1 en mode revue : un constat mineur, `Object` en type de retour du contrôleur ; décision du développeur : garder, la variante étant choisie par paramètre.
- Agent qualité, sonarqube 1.1.0, examen local : moteurs SonarLint et relecture par les règles ; aucun constat sur le diff.

## Écarts, boucle et capitalisation

- Écarts : aucun.
- Boucle de second ordre : aucune observation qui appelle une rétroaction.
- Capitalisation : l'ETag de la liste est la dernière séquence du canal, ce qui permet au front de reprendre après une coupure.

## Contributions aux kits

- Commits :
- `4f6c65900fe55df3ebe2a55a522068ec8e14e899` : ABCDE-3620 S01 : [É3-API] test(spring): réponse inchangée sans paramètre vue
- `b72c45cbbd651c258e1137ce3dd00794663ec4e7` : ABCDE-3620 S02 : [É3-API] feat(spring): variante résumée à la même URI, paramètre vue=resume
- `d2c98977e1bcfafef9679201f3ee81ac29f0a567` : ABCDE-3620 S03 : [É3-API] test(spring): lignesDernierEnregistrement à null pour une commande sans ligne
- `78afeb1d6f45522dce4860438a31693dde8075bc` : ABCDE-3620 S05 : [É3-API] feat(stomp): événement des lignes après commit, avec la date-heure recalculée
- `3b14ac1027e4ffa481cb5722a393d91d38bd6a84` : ABCDE-3620 S07 : [É3-API] feat(spring): en-tête ETag de la liste des lignes, égal à la dernière séquence
- Tests : `back/src/test/java/fr/exemple/commande/CommandeControllerSansVueTest.java` (ABCDE-3620-S01) ; `back/src/test/java/fr/exemple/commande/CommandeControllerVueResumeTest.java` (ABCDE-3620-S02) ; `back/src/test/java/fr/exemple/commande/CommandeControllerSansLigneTest.java` (ABCDE-3620-S03) ; `back/src/test/java/fr/exemple/commande/LignesCommandePublieurTest.java` (ABCDE-3620-S05) ; `back/src/test/java/fr/exemple/commande/LignesCommandeEtagTest.java` (ABCDE-3620-S07).
- Démonstration : commande de lancement du back, `./mvnw -f back/pom.xml spring-boot:run -Dspring-boot.run.profiles=demo`.
