---
name: verdict
description: Jugement déterministe des résultats d'exécution (statuts d'étape, de scénario et de critère, causes présumées de la liste fermée avec leurs signaux, règles de classement ordonnées, empreintes SHA-256 des preuves, désaccords consignés à côté du verdict, session expirée sans échec imputé, défauts injectés en simulation). À implémenter au lot 4.
dimensions: [D8]
status: active
---

# Module `verdict` (D8)

Le `verdict` juge, nomme la cause présumée et scelle la preuve. Il est déterministe : il n'appelle pas le moteur.

## 1. Statuts (D8.INV-1)

| Niveau | Statuts |
|---|---|
| étape | réussie, échouée, bloquée, non jouée ; `INSTABILITE` pour un succès au réessai (D4.INV-6) |
| scénario | réussi, échoué, bloqué, non joué |
| critère | conforme, non conforme, non vérifié |

Règles du critère :

- **conforme** : chaque étape `verifier` qui le porte, dans les scénarios joués, est réussie, avec sa capture et son résultat d'étape scellés ;
- **non conforme** : au moins une étape `verifier` qui le porte a échoué avec la cause `DEFAUT_APPLICATIF` ;
- **non vérifié** : dans tous les autres cas, avec le motif : preuve manquante, cause autre qu'applicative, instabilité, scénario non jouable ou non sélectionné, trou de couverture.

Les statuts dérivent des étapes `verifier`, donc des critères d'acceptation ; ni le code de l'application ni une mesure de couverture n'entrent dans le calcul.

## 2. Causes présumées (D8.INV-3)

Règles appliquées dans cet ordre ; la première qui s'applique l'emporte.

| Ordre | Cause | Signal | Suite |
|---|---|---|---|
| 1 | `SESSION_EXPIREE` | redirection vers l'origine du fournisseur SSO pendant le scénario | CP-0, puis rejeu du scénario depuis son début ; aucun échec imputé |
| 2 | `ENVIRONNEMENT` | application injoignable, réponse 5xx hors mutation, délai réseau dépassé, origine bloquée que le parcours ne visait pas | campagne suspendue si la cause revient sur 3 scénarios de suite |
| 3 | `DEFAUT_PARCOURS` | cible introuvable ou ambiguë, donnée refusée par un message de validation du formulaire | réparation (module `preparateur`), puis CP-2 |
| 4 | `INSTABILITE` | échec puis succès au réessai, à l'identique | au-delà du seuil `instabilite.seuil`, quarantaine proposée en CP-4 |
| 5 | `DEFAUT_APPLICATIF` | cible résolue, action jouée, assertion contredite | vue développeur ; confirmation en CP-3 |
| 6 | `INDETERMINE` | aucun signal discriminant | CP-3 |

Chaque échec cite les signaux qui fondent sa cause. Les règles de classement sont modifiables sous gouvernance (règle `causes.regles`) ; les définitions de « réussi » et d'« échoué » ne le sont pas.

## 3. Sceau (D8.INV-4)

Chaque verdict porte l'empreinte SHA-256 de chacune de ses preuves (captures, trace, instantané ARIA) et celle de ses résultats d'étape sérialisés en JSON canonique. Un verdict dont une preuve est absente ou dont l'empreinte ne correspond plus fait passer le critère à « non vérifié : preuve manquante ».

## 4. Désaccords (D8.INV-2)

- En CP-3, le testeur confirme ou conteste. Une contestation crée un enregistrement `desaccord` : verdict visé, auteur, cause ou statut proposé, commentaire, date.
- Le verdict initial n'est jamais modifié ; le journal de tests présente les deux côte à côte.
- Un reclassement de cause par l'humain est un désaccord ; le `reflexif` s'en sert (D14.INV-3).

## 5. Session expirée (D8.INV-5)

Un scénario interrompu par `SESSION_EXPIREE` ne reçoit pas de verdict d'échec. L'orchestrateur ouvre CP-0, puis rejoue le scénario depuis son début ; seul le passage complet est jugé. Le journal garde le passage interrompu.

## 6. Simulation

Le monde simulé du `navigateur` injecte cinq défauts ; chacun doit recevoir sa cause : `cible-obsolete` → `DEFAUT_PARCOURS`, `session-expiree` → `SESSION_EXPIREE`, `defaut-applicatif` → `DEFAUT_APPLICATIF`, `instabilite` → `INSTABILITE`, `application-injoignable` → `ENVIRONNEMENT`.

## 7. Actions et événements

| Action | Rôle |
|---|---|
| `juger(resultats)` | statuts, causes, signaux, empreintes ; rend le verdict de chaque scénario et de chaque critère |
| `contester(verdict, desaccord)` | consigne un désaccord transmis par l'orchestrateur |

Événement : `verdict.rendu`.

## 8. Pièges connus

- **Défaut applicatif présumé d'office** : une cible introuvable est un défaut de parcours ; l'application n'est mise en cause que si l'action a eu lieu et que l'assertion est contredite.
- **« Conforme » sur un succès au réessai** : l'étape est `INSTABILITE`, et le critère « non vérifié ».
- **Verdict corrigé après contestation** : jamais ; le désaccord est consigné à côté.

## 9. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| VE1 | D8.INV-1 | un critère dont la capture de l'étape `verifier` manque est « non vérifié : preuve manquante » |
| VE2 | D8.INV-1 | un critère dont toutes les étapes `verifier` sont réussies et scellées est « conforme » |
| VE3 | D8.INV-1 | un critère porté par une étape `INSTABILITE` est « non vérifié : instabilité » |
| VE4 | D8.INV-2 | une contestation en CP-3 crée un désaccord ; le verdict initial reste identique, empreinte comprise |
| VE5 | D8.INV-3 | chacun des cinq défauts injectés en simulation reçoit la cause attendue, avec ses signaux |
| VE6 | D8.INV-3 | une cible introuvable donne `DEFAUT_PARCOURS`, jamais `DEFAUT_APPLICATIF` |
| VE7 | D8.INV-4 | chaque verdict porte l'empreinte de chacune de ses preuves ; une preuve altérée rend le critère « non vérifié » |
| VE8 | D8.INV-5 | un scénario interrompu par la session ne reçoit pas d'échec ; après CP-0, le passage complet est jugé |
| VE9 | D8.INV-3 | un échec sans signal discriminant est `INDETERMINE` et présenté en CP-3 |

## 10. Fichiers à produire

- `src/agents/verdict/agent.js`, `src/agents/verdict/statuts.js`, `src/agents/verdict/causes.js`, `src/agents/verdict/sceau.js`, `src/agents/verdict/desaccords.js`
- `schemas/verdict.json`
- `test/verdict/*.test.js`
