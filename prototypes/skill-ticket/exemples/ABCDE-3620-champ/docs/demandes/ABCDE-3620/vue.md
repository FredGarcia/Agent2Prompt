# Vue augmentée de ABCDE-3620

Tirée du champ d'observation de l'arbre au n° 22 (dernier enregistrement du 2026-11-05 10:45 UTC, empreinte de tête f43733befdfa7541), chaîne intacte. Le ticket n'est pas réécrit : ses ancres portent les calques de ce que le champ en dit.

Ratifications :

- arbre ABCDE-3620 : ratifié (n° 1, 2026-11-03, Développeur d'exemple)
- ABCDE-3620-1.1 : ratifié (n° 2, 2026-11-03, Développeur d'exemple)
- ABCDE-3620-1.2 : ratifié (n° 12, 2026-11-04, Développeur d'exemple)
- ABCDE-3620-2 : ratifié (n° 19, 2026-11-05, Développeur d'exemple)

Calques : ordre 1 (actions, verdicts et écarts des agents et des skills) ; ordre 2 (propositions de l'observateur d'ordre 2 de l'arbre) ; ordre 3 (examens, veilles et bilan de l'observateur d'ordre 3) ; humain (retours du développeur : choix, corrections, ratifications).

## À traiter

- **en désaccord** : contrat « canal /topic/v1/commandes/{id}/lignes, lignesDernierEnregistrement en ISO 8601 avec fuseau » — ABCDE-3620-1.2 conforme (n° 18) ; ABCDE-3620-2 en écart (n° 20) ; écart n° 21 au registre des écarts, décision au développeur

## Critères d'acceptation

### ABCDE-3620-CA01 · ABCDE-3620:C1 — prouvé

> Sans paramètre, GET /api/v1/commandes/{id} renvoie CommandeDto, inchangée.

Statut dans us.md : validé.

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

#### ABCDE-3620-1:C1 — prouvé

> Sans paramètre, la réponse de GET /api/v1/commandes/{id} est identique à celle d'avant le ticket.

Soutient ABCDE-3620:C1 (prouvé) ; critère d'acceptation ABCDE-3620-CA01 (prouvé).

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

##### ABCDE-3620-1.2:C1 — prouvé

> Sans paramètre vue, la réponse de GET /api/v1/commandes/{id} reste CommandeDto, identique.

Soutient ABCDE-3620-1:C1 (prouvé) ; critère d'acceptation ABCDE-3620-CA01 (prouvé).

- Ordre 1
  - n° 13 · 2026-11-04 09:30 UTC · ABCDE-3620-1.2 · ticket-abcde-3620-1-2-back : conforme ; preuve test : back/src/test/java/fr/exemple/commande/CommandeControllerSansVueTest.java

#### Scénarios qui prouvent ABCDE-3620-CA01

##### ABCDE-3620-S01 · Sans paramètre, la réponse reste celle d'avant le ticket — à réaliser

Étiquettes : `@role-GESTIONNAIRE` `@ABCDE-3620-S01` `@ABCDE-3620-CA01` `@back`.

Rien n'est encore déposé sur cette ancre.

### ABCDE-3620-CA02 · ABCDE-3620:C2 — prouvé

> Avec vue=resume, la réponse ne contient pas lignes, et contient lignesDernierEnregistrement au format ISO 8601 avec fuseau.

Statut dans us.md : validé.

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

#### ABCDE-3620-1:C2 — prouvé

> Avec vue=resume, la réponse est un CommandeResumeDto sans lignes, avec lignesDernierEnregistrement.

Soutient ABCDE-3620:C2 (prouvé) ; critère d'acceptation ABCDE-3620-CA02 (prouvé).

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

##### ABCDE-3620-1.2:C2 — prouvé

> Avec vue=resume, la réponse est un CommandeResumeDto sans lignes, avec lignesDernierEnregistrement en ISO 8601 avec fuseau.

Soutient ABCDE-3620-1:C2 (prouvé) ; critère d'acceptation ABCDE-3620-CA02 (prouvé).

- Ordre 1
  - n° 14 · 2026-11-04 10:15 UTC · ABCDE-3620-1.2 · ticket-abcde-3620-1-2-back : conforme ; preuve test : back/src/test/java/fr/exemple/commande/CommandeControllerVueResumeTest.java

#### Scénarios qui prouvent ABCDE-3620-CA02

##### ABCDE-3620-S02 · La variante résumée remplace les lignes par la date-heure de la dernière — à réaliser

Étiquettes : `@role-GESTIONNAIRE` `@ABCDE-3620-S02` `@ABCDE-3620-CA02` `@back`.

Rien n'est encore déposé sur cette ancre.

### ABCDE-3620-CA03 · ABCDE-3620:C3 — prouvé

> Pour une commande sans ligne, lignesDernierEnregistrement vaut null.

Statut dans us.md : validé.

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

#### ABCDE-3620-1:C3 — prouvé

> Pour une commande sans ligne, lignesDernierEnregistrement vaut null, documenté au contrat.

Soutient ABCDE-3620:C3 (prouvé) ; critère d'acceptation ABCDE-3620-CA03 (prouvé).

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

##### ABCDE-3620-1.1:C2 — prouvé

> Pour une commande sans ligne, l'agrégat renvoie null.

Soutient ABCDE-3620-1:C3 (prouvé) ; critère d'acceptation ABCDE-3620-CA03 (prouvé).

- Ordre 1
  - n° 11 · 2026-11-03 11:35 UTC · ABCDE-3620-1.1 · ticket-abcde-3620-1-1-persistance : conforme ; preuve test : back/src/test/java/fr/exemple/commande/LigneCommandeRepositorySansLigneTest.java

##### ABCDE-3620-1.2:C3 — prouvé

> Avec vue=resume, une commande sans ligne donne lignesDernierEnregistrement à null, documenté au contrat.

Soutient ABCDE-3620-1:C3 (prouvé) ; critère d'acceptation ABCDE-3620-CA03 (prouvé).

- Ordre 1
  - n° 15 · 2026-11-04 11:00 UTC · ABCDE-3620-1.2 · ticket-abcde-3620-1-2-back : écart : avec la configuration Jackson du projet, non_null, lignesDernierEnregistrement est absent au lieu de valoir null ; preuve test : back/src/test/java/fr/exemple/commande/CommandeControllerSansLigneTest.java (« No value at JSON path $.lignesDernierEnregistrement »)
  - n° 16 · 2026-11-04 11:40 UTC · ABCDE-3620-1.2 · ticket-abcde-3620-1-2-back : conforme ; preuve test : back/src/test/java/fr/exemple/commande/CommandeControllerSansLigneTest.java

#### Scénarios qui prouvent ABCDE-3620-CA03

##### ABCDE-3620-S03 · Une commande sans ligne donne une date-heure nulle — à reprendre

Étiquettes : `@role-GESTIONNAIRE` `@ABCDE-3620-S03` `@ABCDE-3620-CA03` `@back`.

- Ordre 1
  - n° 5 · 2026-11-03 10:40 UTC · ABCDE-3620-1.1 · ticket-abcde-3620-1-1-persistance : réalisation : Scénario S03 présenté en V4 : jeu de données nettoyé par une requête SQL native
- Ordre 2
  - n° 7 · 2026-11-03 11:00 UTC · ABCDE-3620-1.1 · ticket-abcde-3620-observateur-2 : proposition sur le motif requete-native : « Avant d'écrire une requête ou un nettoyage de test, relever la convention du projet dans les dépôts existants (JPQL, dépôts JPA) et la proposer d'abord ; une requête native ne se propose qu'avec sa justification dans l'analyse. », observe n° 3, 4, 5, 6 ; preuve enregistrements : 3, 4, 5, 6
- Ordre 3
  - n° 8 · 2026-11-03 11:05 UTC · ABCDE-3620-1.1 · ticket-abcde-3620-observateur-3 : examen de la proposition n° 7 : fondée ; preuve enregistrements : 7
- Humain
  - n° 6 · 2026-11-03 10:45 UTC · ABCDE-3620-1.1 · ticket-abcde-3620-1-1 : correction de n° 5, motif requete-native, par Développeur d'exemple : « Nettoyer par le dépôt JPA, comme les autres tests »
  - n° 9 · 2026-11-03 11:10 UTC · ABCDE-3620-1.1 · ticket-abcde-3620-1-1 : choix sur n° 7 : retenue, par Développeur d'exemple : « Retenue, à inscrire au registre des concepts comme entrée proposed »

### ABCDE-3620-CA04 · ABCDE-3620:C4 — prouvé

> La date-heure se calcule en une seule requête, sans charger les lignes.

Statut dans us.md : validé.

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

#### ABCDE-3620-1:C4 — prouvé

> La date-heure du résumé se calcule en une seule requête, sans charger les lignes.

Soutient ABCDE-3620:C4 (prouvé) ; critère d'acceptation ABCDE-3620-CA04 (prouvé).

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

##### ABCDE-3620-1.1:C1 — prouvé

> La date-heure maximale des lignes d'une commande se lit en une seule requête, sans charger les lignes.

Soutient ABCDE-3620-1:C4 (prouvé) ; critère d'acceptation ABCDE-3620-CA04 (prouvé).

- Ordre 1
  - n° 10 · 2026-11-03 11:30 UTC · ABCDE-3620-1.1 · ticket-abcde-3620-1-1-persistance : conforme ; preuve test : back/src/test/java/fr/exemple/commande/LigneCommandeRepositoryAgregatTest.java

#### Scénarios qui prouvent ABCDE-3620-CA04

##### ABCDE-3620-S04 · La date-heure se lit en une seule requête — à reprendre

Étiquettes : `@role-GESTIONNAIRE` `@ABCDE-3620-S04` `@ABCDE-3620-CA04` `@back`.

- Ordre 1
  - n° 3 · 2026-11-03 10:00 UTC · ABCDE-3620-1.1 · ticket-abcde-3620-1-1-persistance : réalisation : Scénario S04 présenté en V4 : agrégat de la date-heure par une requête SQL native
- Ordre 2
  - n° 7 · 2026-11-03 11:00 UTC · ABCDE-3620-1.1 · ticket-abcde-3620-observateur-2 : proposition sur le motif requete-native : « Avant d'écrire une requête ou un nettoyage de test, relever la convention du projet dans les dépôts existants (JPQL, dépôts JPA) et la proposer d'abord ; une requête native ne se propose qu'avec sa justification dans l'analyse. », observe n° 3, 4, 5, 6 ; preuve enregistrements : 3, 4, 5, 6
- Ordre 3
  - n° 8 · 2026-11-03 11:05 UTC · ABCDE-3620-1.1 · ticket-abcde-3620-observateur-3 : examen de la proposition n° 7 : fondée ; preuve enregistrements : 7
- Humain
  - n° 4 · 2026-11-03 10:05 UTC · ABCDE-3620-1.1 · ticket-abcde-3620-1-1 : correction de n° 3, motif requete-native, par Développeur d'exemple : « Le projet écrit ses requêtes en JPQL : pas de SQL natif »
  - n° 9 · 2026-11-03 11:10 UTC · ABCDE-3620-1.1 · ticket-abcde-3620-1-1 : choix sur n° 7 : retenue, par Développeur d'exemple : « Retenue, à inscrire au registre des concepts comme entrée proposed »

### ABCDE-3620-CA05 · ABCDE-3620:C5 — à prouver

> La liste des lignes et la date-heure du résumé se mettent à jour en temps réel à l'écran, annoncées sans déplacer le focus.

Statut dans us.md : validé.

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

#### ABCDE-3620-1:C5 — prouvé

> Chaque changement des lignes publie, après commit, un événement qui porte la date-heure recalculée.

Soutient ABCDE-3620:C5 (à prouver) ; critère d'acceptation ABCDE-3620-CA05 (à prouver).

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

##### ABCDE-3620-1.2:C4 — prouvé

> Chaque changement des lignes publie, après commit, un événement CloudEvents qui porte la date-heure recalculée.

Soutient ABCDE-3620-1:C5 (prouvé) ; critère d'acceptation ABCDE-3620-CA05 (à prouver).

- Ordre 1
  - n° 17 · 2026-11-04 15:00 UTC · ABCDE-3620-1.2 · ticket-abcde-3620-1-2-back : conforme ; preuve test : back/src/test/java/fr/exemple/commande/LignesCommandePublieurTest.java

#### ABCDE-3620-2:C1 — à prouver

> La liste des lignes et la date-heure du résumé se mettent à jour à l'écran sans rechargement ; après une coupure, l'écran reprend par l'instantané et son ETag.

Soutient ABCDE-3620:C5 (à prouver) ; critère d'acceptation ABCDE-3620-CA05 (à prouver).

Rien n'est encore déposé sur cette ancre.

#### ABCDE-3620-2:C2 — prouvé

> Chaque mise à jour est annoncée par une région aria-live polite, sans déplacer le focus.

Soutient ABCDE-3620:C5 (à prouver) ; critère d'acceptation ABCDE-3620-CA05 (à prouver).

- Ordre 1
  - n° 22 · 2026-11-05 10:45 UTC · ABCDE-3620-2 · ticket-abcde-3620-2-front : conforme ; preuve test : front/src/app/commande/lignes-commande.annonce.spec.ts

#### Scénarios qui prouvent ABCDE-3620-CA05

##### ABCDE-3620-S05 · Une ligne ajoutée apparaît à l'écran et met à jour la date-heure — à réaliser

Étiquettes : `@role-GESTIONNAIRE` `@ABCDE-3620-S05` `@ABCDE-3620-CA05` `@back` `@front`.

Rien n'est encore déposé sur cette ancre.

##### ABCDE-3620-S06 · Une mise à jour est annoncée sans déplacer le focus — à réaliser

Étiquettes : `@role-GESTIONNAIRE` `@ABCDE-3620-S06` `@ABCDE-3620-CA05` `@front`.

Rien n'est encore déposé sur cette ancre.

##### ABCDE-3620-S07 · Après une coupure, l'écran reprend par l'instantané — à réaliser

Étiquettes : `@role-GESTIONNAIRE` `@ABCDE-3620-S07` `@ABCDE-3620-CA05` `@back` `@front`.

Rien n'est encore déposé sur cette ancre.

## Nœuds

### ABCDE-3620 (racine) — ratifié

- Humain
  - n° 1 · 2026-11-03 09:00 UTC · ABCDE-3620 · ticket-abcde-3620 : ratification de « arbre ABCDE-3620 » : ratifié, par Développeur d'exemple : « Arbre et documents de la clé ratifiés »

### ABCDE-3620-1 (composé) — sans ratification propre

Rien n'est encore déposé sur cette ancre.

### ABCDE-3620-1.1 (feuille) — ratifié

- Humain
  - n° 2 · 2026-11-03 09:30 UTC · ABCDE-3620-1.1 · ticket-abcde-3620-1-1 : ratification de « ABCDE-3620-1.1 » : ratifié, par Développeur d'exemple : « Skill et analyse ratifiés »

### ABCDE-3620-1.2 (feuille) — ratifié

- Humain
  - n° 12 · 2026-11-04 08:30 UTC · ABCDE-3620-1.2 · ticket-abcde-3620-1-2 : ratification de « ABCDE-3620-1.2 » : ratifié, par Développeur d'exemple : « Skill et analyse ratifiés »

### ABCDE-3620-2 (feuille) — ratifié

- Humain
  - n° 19 · 2026-11-05 09:00 UTC · ABCDE-3620-2 · ticket-abcde-3620-2 : ratification de « ABCDE-3620-2 » : ratifié, par Développeur d'exemple : « Skill et analyse ratifiés »

## Ancres nées du champ

### contrat « canal /topic/v1/commandes/{id}/lignes, lignesDernierEnregistrement en ISO 8601 avec fuseau » — en désaccord

Ancre née du champ.

- Ordre 1
  - n° 18 · 2026-11-04 15:50 UTC · ABCDE-3620-1.2 · ticket-abcde-3620-1-2-back : conforme ; preuve test : back/src/test/java/fr/exemple/commande/LignesCommandePublieurTest.java
  - n° 20 · 2026-11-05 10:30 UTC · ABCDE-3620-2 · ticket-abcde-3620-2-front : écart : la date-heure reçue par le canal des lignes arrive sans fuseau ; preuve test : front/src/app/commande/lignes-commande.temps-reel.spec.ts
  - n° 21 · 2026-11-05 10:30 UTC · ABCDE-3620 · champ.mjs : écart inscrit au registre (désaccord entre nœuds (D6.INV-3)) : ABCDE-3620-1.2 conforme (n° 18) ; ABCDE-3620-2 en écart (n° 20), la date-heure reçue par le canal des lignes arrive sans fuseau ; décision au développeur
