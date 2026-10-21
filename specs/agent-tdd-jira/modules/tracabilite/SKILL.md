---
name: tracabilite
description: Traçabilité d'une demande Jira jusqu'au code (matrice US, critères d'acceptation, exigences, scénarios, tests, commits, statuts, construction par recherche des étiquettes, rapport final par critère, écarts, questions ouvertes, projet de commentaire Jira à publier par le développeur, V5). À lire à la fin de chaque scénario et en fin de demande.
dimensions: [D6]
status: active
---

# Module `tracabilite` (D6)

La traçabilité répond à une question : chaque élément de la demande est-il réalisé, testé et livré, et où ? Elle se construit au fil des scénarios et se remet en fin de demande.

## 1. Chaîne tracée

```mermaid
flowchart LR
  J["Demande Jira<br/>ECR-77"] --> US["US<br/>ECR-77-USnn"]
  US --> CA["Critères d'acceptation<br/>ECR-77-CAnn"]
  J --> EX["Exigences<br/>EX-01…"]
  EX --> CA
  CA --> S["Scénarios Gherkin<br/>@ECR-77-Snn"]
  S --> V["Variantes choisies<br/>B1, F1"]
  S --> TB["Tests back<br/>@Tag ECR-77-Snn"]
  S --> TF["Tests front<br/>describe ECR-77-Snn"]
  TB --> C["Commits<br/>ECR-77 Snn : …"]
  TF --> C
```

## 2. Construire la matrice par recherche (point E3)

```bash
# critères d'acceptation de chaque scénario (étiquettes du fichier Gherkin)
grep -n '@ECR-77-S' docs/demandes/ECR-77/ECR-77.feature
# tests back étiquetés
grep -rn '@Tag("ECR-77-S' src/test/java
# tests front étiquetés
grep -rn "describe('ECR-77-S" src/app --include=*.spec.ts
# commits de la demande
git log --oneline --grep='^ECR-77 '
```

## 3. Matrice (D6.INV-1, D6.INV-2, D10.INV-7)

| US | CA | Exigences | Scénario | Variante | Tests back | Tests front | Commit | Statut |
|---|---|---|---|---|---|---|---|---|
| ECR-77-US01 | ECR-77-CA01 | EX-01 | @ECR-77-S01 | B1 + F1 | `FeedbackExportControllerTest#exporteLaListeFiltree` | `feedback.store.spec.ts` › ECR-77-S01 | `a1b2c3d` | réalisé |
| ECR-77-US01 | ECR-77-CA02 | EX-02, EX-03 | @ECR-77-S02 | B1 | `FeedbackCsvTest#exportCommenceParLeBomEtUtiliseLePointVirgule` | non concerné | `d4e5f6a` | réalisé |
| ECR-77-US01 | ECR-77-CA03 | EX-04 | @ECR-77-S03 | — | — | — | — | non réalisé : en attente de Q1 |
| ECR-77-US01 | ECR-77-CA04 (proposé, validé) | — | @ECR-77-S04 | B1 + F1 | `…` | `feedback-list.spec.ts` › ECR-77-S04 | `b7c8d9e` | réalisé |

Une exigence sans CA ni scénario, un CA sans scénario, ou un scénario validé sans test ni statut, rend la matrice incomplète : l'agent ne remet pas le rapport dans cet état. Un CA est réalisé quand tous ses scénarios le sont.

## 4. Rapport final (D6.INV-4)

```markdown
# ECR-77 : rapport de réalisation

- **Demande** : ECR-77, extraite le 2026-10-16 (sha256 …), 1 commentaire
- **Critères d'acceptation** : 4 pour 1 US, dont 1 proposé et validé ; 3 réalisés (CA01, CA02, CA04), 1 en attente (CA03, Q1)
- **Scénarios** : 4 dont 1 proposé et validé ; 3 réalisés, 1 en attente
- **Suites** : back `./mvnw verify` vert (415 tests) ; front `ng test` vert (238 tests), `ng lint` sans erreur
- **Écarts à la demande** : aucun
- **Écarts aux référentiels** : aucun
- **Questions ouvertes** : Q1 (au-delà de 10 000 lignes) — S03 non réalisé
- **Matrice** : voir ci-dessus
```

## 5. Projet de commentaire Jira (D6.INV-3)

L'agent n'écrit jamais dans Jira. Il rédige un texte que le développeur publie lui-même :

```text
Réalisation ECR-77 (branche feature/ECR-77-export-csv)

Critères d'acceptation remplis :
- CA01 Exporter la liste filtrée : bouton d'export, fichier retours-experience.csv
- CA02 Encodage : UTF-8 avec BOM, séparateur point-virgule
- CA04 (ajouté et validé) Liste vide : bouton désactivé, motif annoncé

En attente :
- CA03 Au-delà de 10 000 lignes : quel comportement attendu ?
  A. exporter les 10 000 premières lignes et prévenir l'utilisateur
  B. refuser l'export et demander d'affiner le filtre

Tests : back et front verts. Commits : a1b2c3d, d4e5f6a, b7c8d9e.
```

## 6. Pièges connus

- **Matrice reconstruite de mémoire** : elle se construit par recherche (§ 2), sinon un test non étiqueté disparaît de la traçabilité.
- **Commentaire Jira trop technique** : le destinataire est l'auteur de la demande. Parler en critères d'acceptation et en comportements, pas en classes.
- **Données sensibles** : le projet de commentaire ne contient ni secret, ni donnée personnelle autre que celles déjà présentes dans la demande.

## 7. Contrôle de sortie

- Matrice complète : chaque exigence a un scénario, chaque scénario validé a un test et un commit, ou un statut « non réalisé » motivé (D6.INV-1).
- Chaque US reliée à ses CA, chaque CA à ses scénarios, tests et commits, ou à un statut « non réalisé » motivé ; état de chaque CA dans le rapport (D10.INV-7).
- Chaque test de la matrice porte l'étiquette de son scénario (D6.INV-2).
- Aucune écriture dans Jira ; projet de commentaire fourni (D6.INV-3).
- Rapport final avec écarts, questions ouvertes et résultats des suites (D6.INV-4).
