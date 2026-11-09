# Vue augmentée de ABCDE-3620

Tirée du champ d'observation de l'arbre au n° 12 (dernier enregistrement du 2026-11-05 11:05 UTC, empreinte de tête 12939fa6fe5b211b), chaîne intacte. Le ticket n'est pas réécrit : ses ancres portent les calques de ce que le champ en dit.

Ratifications :

- arbre ABCDE-3620 : ratifié (n° 1, 2026-11-03, Développeur d'exemple)
- ABCDE-3620-1.1 : ratifié (n° 2, 2026-11-03, Développeur d'exemple)
- ABCDE-3620-1.2 : ratifié (n° 5, 2026-11-04, Développeur d'exemple)
- ABCDE-3620-2 : ratifié (n° 10, 2026-11-05, Développeur d'exemple)

Calques : ordre 1 (actions, verdicts et écarts des agents et des skills) ; ordre 2 (propositions de l'observateur d'ordre 2 de l'arbre) ; ordre 3 (examens, veilles et bilan de l'observateur d'ordre 3) ; humain (retours du développeur : choix, corrections, ratifications).

## À traiter

Rien à traiter.

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
  - n° 6 · 2026-11-04 08:25 UTC · ABCDE-3620-1.2 · ticket-abcde-3620-1-2-back : conforme ; preuve test : back/src/test/java/fr/exemple/commande/CommandeControllerSansVueTest.java

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
  - n° 7 · 2026-11-04 09:10 UTC · ABCDE-3620-1.2 · ticket-abcde-3620-1-2-back : conforme ; preuve test : back/src/test/java/fr/exemple/commande/CommandeControllerVueResumeTest.java

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
  - n° 4 · 2026-11-03 13:45 UTC · ABCDE-3620-1.1 · ticket-abcde-3620-1-1-persistance : conforme ; preuve test : back/src/test/java/fr/exemple/commande/LigneCommandeRepositorySansLigneTest.java

##### ABCDE-3620-1.2:C3 — prouvé

> Avec vue=resume, une commande sans ligne donne lignesDernierEnregistrement à null, documenté au contrat.

Soutient ABCDE-3620-1:C3 (prouvé) ; critère d'acceptation ABCDE-3620-CA03 (prouvé).

- Ordre 1
  - n° 8 · 2026-11-04 09:55 UTC · ABCDE-3620-1.2 · ticket-abcde-3620-1-2-back : conforme ; preuve test : back/src/test/java/fr/exemple/commande/CommandeControllerSansLigneTest.java

#### Scénarios qui prouvent ABCDE-3620-CA03

##### ABCDE-3620-S03 · Une commande sans ligne donne une date-heure nulle — à réaliser

Étiquettes : `@role-GESTIONNAIRE` `@ABCDE-3620-S03` `@ABCDE-3620-CA03` `@back`.

Rien n'est encore déposé sur cette ancre.

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
  - n° 3 · 2026-11-03 13:15 UTC · ABCDE-3620-1.1 · ticket-abcde-3620-1-1-persistance : conforme ; preuve test : back/src/test/java/fr/exemple/commande/LigneCommandeRepositoryAgregatTest.java

#### Scénarios qui prouvent ABCDE-3620-CA04

##### ABCDE-3620-S04 · La date-heure se lit en une seule requête — à réaliser

Étiquettes : `@role-GESTIONNAIRE` `@ABCDE-3620-S04` `@ABCDE-3620-CA04` `@back`.

Rien n'est encore déposé sur cette ancre.

### ABCDE-3620-CA05 · ABCDE-3620:C5 — prouvé

> La liste des lignes et la date-heure du résumé se mettent à jour en temps réel à l'écran, annoncées sans déplacer le focus.

Statut dans us.md : validé.

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

#### ABCDE-3620-1:C5 — prouvé

> Chaque changement des lignes publie, après commit, un événement qui porte la date-heure recalculée.

Soutient ABCDE-3620:C5 (prouvé) ; critère d'acceptation ABCDE-3620-CA05 (prouvé).

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

##### ABCDE-3620-1.2:C4 — prouvé

> Chaque changement des lignes publie, après commit, un événement CloudEvents qui porte la date-heure recalculée.

Soutient ABCDE-3620-1:C5 (prouvé) ; critère d'acceptation ABCDE-3620-CA05 (prouvé).

- Ordre 1
  - n° 9 · 2026-11-04 14:50 UTC · ABCDE-3620-1.2 · ticket-abcde-3620-1-2-back : conforme ; preuve test : back/src/test/java/fr/exemple/commande/LignesCommandePublieurTest.java

#### ABCDE-3620-2:C1 — prouvé

> La liste des lignes et la date-heure du résumé se mettent à jour à l'écran sans rechargement ; après une coupure, l'écran reprend par l'instantané et son ETag.

Soutient ABCDE-3620:C5 (prouvé) ; critère d'acceptation ABCDE-3620-CA05 (prouvé).

- Ordre 1
  - n° 11 · 2026-11-05 11:00 UTC · ABCDE-3620-2 · ticket-abcde-3620-2-front : conforme ; preuve test : front/src/app/commande/lignes-commande.temps-reel.spec.ts

#### ABCDE-3620-2:C2 — prouvé

> Chaque mise à jour est annoncée par une région aria-live polite, sans déplacer le focus.

Soutient ABCDE-3620:C5 (prouvé) ; critère d'acceptation ABCDE-3620-CA05 (prouvé).

- Ordre 1
  - n° 12 · 2026-11-05 11:05 UTC · ABCDE-3620-2 · ticket-abcde-3620-2-front : conforme ; preuve test : front/src/app/commande/lignes-commande.annonce.spec.ts

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
  - n° 1 · 2026-11-03 08:55 UTC · ABCDE-3620 · ticket-abcde-3620 : ratification de « arbre ABCDE-3620 » : ratifié, par Développeur d'exemple : « Arbre et documents de la clé ratifiés »

### ABCDE-3620-1 (composé) — sans ratification propre

Rien n'est encore déposé sur cette ancre.

### ABCDE-3620-1.1 (feuille) — ratifié

- Humain
  - n° 2 · 2026-11-03 12:30 UTC · ABCDE-3620-1.1 · ticket-abcde-3620-1-1 : ratification de « ABCDE-3620-1.1 » : ratifié, par Développeur d'exemple : « Skill et analyse ratifiés »

### ABCDE-3620-1.2 (feuille) — ratifié

- Humain
  - n° 5 · 2026-11-04 07:50 UTC · ABCDE-3620-1.2 · ticket-abcde-3620-1-2 : ratification de « ABCDE-3620-1.2 » : ratifié, par Développeur d'exemple : « Skill et analyse ratifiés »

### ABCDE-3620-2 (feuille) — ratifié

- Humain
  - n° 10 · 2026-11-05 08:00 UTC · ABCDE-3620-2 · ticket-abcde-3620-2 : ratification de « ABCDE-3620-2 » : ratifié, par Développeur d'exemple : « Skill et analyse ratifiés »
