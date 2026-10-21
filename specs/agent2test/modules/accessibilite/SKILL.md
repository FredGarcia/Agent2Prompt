---
name: accessibilite
description: Dimension réservée D19, accessibilité des parcours joués (contrôle axe des écrans traversés, action auditer du jeu fermé, verdict d'accessibilité par écran, lien avec la règle D6.INV-2 du skill angular). Ne pas implémenter en 1.x ; lire seulement pour comprendre le point d'extension E2.
dimensions: [D19]
status: reserved
---

# Module `accessibilite` (D19, réservé)

Statut : `reserved`. En 1.x, Agent2Test ne contrôle pas l'accessibilité des écrans qu'il traverse.

## 1. Pourquoi cette dimension existe

Le skill `angular` exige qu'aucune violation axe des niveaux WCAG A et AA ne subsiste sur les parcours couverts par les tests de bout en bout (`angular:D6.INV-2`). Ces parcours sont désormais ceux d'Agent2Test, projet séparé de l'application. Sans cette dimension, la règle n'a pas d'exécuteur.

## 2. Principe prévu

- Une action `auditer` du jeu fermé, placée par le `preparateur` après chaque `naviguer` et chaque mutation d'un parcours.
- L'audit s'exécute dans la page avec axe-core, au niveau WCAG 2.2 A et AA ; ses violations deviennent un verdict d'accessibilité par écran, distinct des verdicts des critères d'acceptation.
- axe-core serait une troisième dépendance d'exécution : l'activation passe donc par une version qui le décide explicitement (D18.INV-2 ne s'affaiblit pas : elle serait remplacée par une règle plus précise, signalée au journal de révision).

## 3. Ce que prépare le point d'extension

| Point | Règle active en 1.x |
|---|---|
| E2 | `auditer` est un nom réservé du jeu d'actions ; un parcours qui l'emploie est rejeté avec le motif « action réservée » |

## 4. Test d'inertie en 1.x

Un parcours qui contient une étape `auditer` est rejeté par le validateur et n'est pas joué (scénarios PR13 du module `preparateur` et NA13 du module `navigateur`).
