# Vue augmentée de ABCDE-3620

Tirée du champ d'observation de l'arbre au n° 6 (dernier enregistrement du 2026-11-03 10:45 UTC, empreinte de tête 0691ad2185d87115), chaîne intacte. Le ticket n'est pas réécrit : ses ancres portent les calques de ce que le champ en dit.

Ratifications :

- arbre ABCDE-3620 : ratifié (n° 1, 2026-11-03, Développeur d'exemple)
- ABCDE-3620-1.1 : ratifié (n° 2, 2026-11-03, Développeur d'exemple)

Calques : ordre 1 (actions, verdicts et écarts des agents et des skills) ; ordre 2 (propositions de l'observateur d'ordre 2 de l'arbre) ; ordre 3 (examens, veilles et bilan de l'observateur d'ordre 3) ; humain (retours du développeur : choix, corrections, ratifications).

## À traiter

- **attente** : ABCDE-3620-S03 · Une commande sans ligne donne une date-heure nulle — observation d'ordre 2 attendue sur le motif requete-native (corrections n° 4, 6) ; invoquer ticket-abcde-3620-observateur-2
- **attente** : ABCDE-3620-S04 · La date-heure se lit en une seule requête — observation d'ordre 2 attendue sur le motif requete-native (corrections n° 4, 6) ; invoquer ticket-abcde-3620-observateur-2

## Critères d'acceptation

### ABCDE-3620-CA01 · ABCDE-3620:C1 — à prouver

> Sans paramètre, GET /api/v1/commandes/{id} renvoie CommandeDto, inchangée.

Statut dans us.md : validé.

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

#### ABCDE-3620-1:C1 — à prouver

> Sans paramètre, la réponse de GET /api/v1/commandes/{id} est identique à celle d'avant le ticket.

Soutient ABCDE-3620:C1 (à prouver) ; critère d'acceptation ABCDE-3620-CA01 (à prouver).

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

##### ABCDE-3620-1.2:C1 — à prouver

> Sans paramètre vue, la réponse de GET /api/v1/commandes/{id} reste CommandeDto, identique.

Soutient ABCDE-3620-1:C1 (à prouver) ; critère d'acceptation ABCDE-3620-CA01 (à prouver).

Rien n'est encore déposé sur cette ancre.

#### Scénarios qui prouvent ABCDE-3620-CA01

##### ABCDE-3620-S01 · Sans paramètre, la réponse reste celle d'avant le ticket — à réaliser

Étiquettes : `@role-GESTIONNAIRE` `@ABCDE-3620-S01` `@ABCDE-3620-CA01` `@back`.

Rien n'est encore déposé sur cette ancre.

### ABCDE-3620-CA02 · ABCDE-3620:C2 — à prouver

> Avec vue=resume, la réponse ne contient pas lignes, et contient lignesDernierEnregistrement au format ISO 8601 avec fuseau.

Statut dans us.md : validé.

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

#### ABCDE-3620-1:C2 — à prouver

> Avec vue=resume, la réponse est un CommandeResumeDto sans lignes, avec lignesDernierEnregistrement.

Soutient ABCDE-3620:C2 (à prouver) ; critère d'acceptation ABCDE-3620-CA02 (à prouver).

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

##### ABCDE-3620-1.2:C2 — à prouver

> Avec vue=resume, la réponse est un CommandeResumeDto sans lignes, avec lignesDernierEnregistrement en ISO 8601 avec fuseau.

Soutient ABCDE-3620-1:C2 (à prouver) ; critère d'acceptation ABCDE-3620-CA02 (à prouver).

Rien n'est encore déposé sur cette ancre.

#### Scénarios qui prouvent ABCDE-3620-CA02

##### ABCDE-3620-S02 · La variante résumée remplace les lignes par la date-heure de la dernière — à réaliser

Étiquettes : `@role-GESTIONNAIRE` `@ABCDE-3620-S02` `@ABCDE-3620-CA02` `@back`.

Rien n'est encore déposé sur cette ancre.

### ABCDE-3620-CA03 · ABCDE-3620:C3 — à prouver

> Pour une commande sans ligne, lignesDernierEnregistrement vaut null.

Statut dans us.md : validé.

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

#### ABCDE-3620-1:C3 — à prouver

> Pour une commande sans ligne, lignesDernierEnregistrement vaut null, documenté au contrat.

Soutient ABCDE-3620:C3 (à prouver) ; critère d'acceptation ABCDE-3620-CA03 (à prouver).

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

##### ABCDE-3620-1.1:C2 — à prouver

> Pour une commande sans ligne, l'agrégat renvoie null.

Soutient ABCDE-3620-1:C3 (à prouver) ; critère d'acceptation ABCDE-3620-CA03 (à prouver).

Rien n'est encore déposé sur cette ancre.

##### ABCDE-3620-1.2:C3 — à prouver

> Avec vue=resume, une commande sans ligne donne lignesDernierEnregistrement à null, documenté au contrat.

Soutient ABCDE-3620-1:C3 (à prouver) ; critère d'acceptation ABCDE-3620-CA03 (à prouver).

Rien n'est encore déposé sur cette ancre.

#### Scénarios qui prouvent ABCDE-3620-CA03

##### ABCDE-3620-S03 · Une commande sans ligne donne une date-heure nulle — à reprendre

Étiquettes : `@role-GESTIONNAIRE` `@ABCDE-3620-S03` `@ABCDE-3620-CA03` `@back`.

- Attente : observation d'ordre 2 attendue sur le motif requete-native (corrections n° 4, 6) ; invoquer ticket-abcde-3620-observateur-2

- Ordre 1
  - n° 5 · 2026-11-03 10:40 UTC · ABCDE-3620-1.1 · ticket-abcde-3620-1-1-persistance : réalisation : Scénario S03 présenté en V4 : jeu de données nettoyé par une requête SQL native
- Humain
  - n° 6 · 2026-11-03 10:45 UTC · ABCDE-3620-1.1 · ticket-abcde-3620-1-1 : correction de n° 5, motif requete-native, par Développeur d'exemple : « Nettoyer par le dépôt JPA, comme les autres tests »

### ABCDE-3620-CA04 · ABCDE-3620:C4 — à prouver

> La date-heure se calcule en une seule requête, sans charger les lignes.

Statut dans us.md : validé.

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

#### ABCDE-3620-1:C4 — à prouver

> La date-heure du résumé se calcule en une seule requête, sans charger les lignes.

Soutient ABCDE-3620:C4 (à prouver) ; critère d'acceptation ABCDE-3620-CA04 (à prouver).

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

##### ABCDE-3620-1.1:C1 — à prouver

> La date-heure maximale des lignes d'une commande se lit en une seule requête, sans charger les lignes.

Soutient ABCDE-3620-1:C4 (à prouver) ; critère d'acceptation ABCDE-3620-CA04 (à prouver).

Rien n'est encore déposé sur cette ancre.

#### Scénarios qui prouvent ABCDE-3620-CA04

##### ABCDE-3620-S04 · La date-heure se lit en une seule requête — à reprendre

Étiquettes : `@role-GESTIONNAIRE` `@ABCDE-3620-S04` `@ABCDE-3620-CA04` `@back`.

- Attente : observation d'ordre 2 attendue sur le motif requete-native (corrections n° 4, 6) ; invoquer ticket-abcde-3620-observateur-2

- Ordre 1
  - n° 3 · 2026-11-03 10:00 UTC · ABCDE-3620-1.1 · ticket-abcde-3620-1-1-persistance : réalisation : Scénario S04 présenté en V4 : agrégat de la date-heure par une requête SQL native
- Humain
  - n° 4 · 2026-11-03 10:05 UTC · ABCDE-3620-1.1 · ticket-abcde-3620-1-1 : correction de n° 3, motif requete-native, par Développeur d'exemple : « Le projet écrit ses requêtes en JPQL : pas de SQL natif »

### ABCDE-3620-CA05 · ABCDE-3620:C5 — à prouver

> La liste des lignes et la date-heure du résumé se mettent à jour en temps réel à l'écran, annoncées sans déplacer le focus.

Statut dans us.md : validé.

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

#### ABCDE-3620-1:C5 — à prouver

> Chaque changement des lignes publie, après commit, un événement qui porte la date-heure recalculée.

Soutient ABCDE-3620:C5 (à prouver) ; critère d'acceptation ABCDE-3620-CA05 (à prouver).

Rien n'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.

##### ABCDE-3620-1.2:C4 — à prouver

> Chaque changement des lignes publie, après commit, un événement CloudEvents qui porte la date-heure recalculée.

Soutient ABCDE-3620-1:C5 (à prouver) ; critère d'acceptation ABCDE-3620-CA05 (à prouver).

Rien n'est encore déposé sur cette ancre.

#### ABCDE-3620-2:C1 — à prouver

> La liste des lignes et la date-heure du résumé se mettent à jour à l'écran sans rechargement ; après une coupure, l'écran reprend par l'instantané et son ETag.

Soutient ABCDE-3620:C5 (à prouver) ; critère d'acceptation ABCDE-3620-CA05 (à prouver).

Rien n'est encore déposé sur cette ancre.

#### ABCDE-3620-2:C2 — à prouver

> Chaque mise à jour est annoncée par une région aria-live polite, sans déplacer le focus.

Soutient ABCDE-3620:C5 (à prouver) ; critère d'acceptation ABCDE-3620-CA05 (à prouver).

Rien n'est encore déposé sur cette ancre.

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

### ABCDE-3620-1.2 (feuille) — à ratifier

Rien n'est encore déposé sur cette ancre.

### ABCDE-3620-2 (feuille) — à ratifier

Rien n'est encore déposé sur cette ancre.
