---
name: autonomie
description: Dimension réservée D22, autonomie par point de validation (régimes autres que presenter, fixés par l'humain point par point, présentation des seuls écarts, garde-fous et retour au régime presenter). Ne pas implémenter en 1.x ; lire seulement pour comprendre le point d'extension E4.
dimensions: [D22]
status: reserved
---

# Module `autonomie` (D22, réservé)

Statut : `reserved`. En 1.0.0, chaque point V0 à V5 est présenté au développeur et attend sa décision explicite, comme le skill l'exige (`agent-tdd-jira:D2.INV-5`, `agent-tdd-jira:D5.INV-4`).

## 1. Pourquoi cette dimension existe

La conception de l'étape 1 donnait à chaque point de contrôle un niveau d'autonomie, avec `differe` par défaut. Les décisions du 21 octobre 2026 l'ont écarté : le skill agent-tdd-jira fait de chaque point une validation explicite. La dimension garde la place d'une autonomie future, si une version du skill la permet un jour pour certains points.

## 2. Principe prévu

- Le régime de chaque point se fixe dans la configuration humaine, point par point ; le système ne le change jamais.
- Un régime `ecarts` ne présenterait que ce qui diffère d'un objet déjà validé ; un point sans rien de nouveau ne s'ouvrirait pas, sans être sauté pour autant.
- Toute alerte du premier ordre, tout échappement confirmé par Agent2Test et toute dérive de méthode ramèneraient le point au régime `presenter`.
- CP-4 resterait hors de portée : la gouvernance du système n'est jamais autonome (D17.INV-4).

## 3. Ce que prépare le point d'extension

| Point | Règle active en 1.x |
|---|---|
| E4 | chaque point V0 à V5 porte `regime: "presenter"` ; toute autre valeur est refusée au démarrage |

## 4. Tests d'inertie en 1.x

Les scénarios OR2 et OR3 du module `orchestrateur`.
