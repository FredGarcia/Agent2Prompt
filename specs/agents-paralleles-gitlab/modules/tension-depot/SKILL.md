---
name: tension-depot
description: Dimension réservée D7, tension entre demandes au niveau du dépôt, suivie en continu avec tension-dashboard-gitlab-agent 3.0 à la place d'agt collisions lancé à la demande. Ne pas implémenter en 1.x ; lire uniquement pour comprendre le point d'extension E2.
dimensions: [D7]
status: reserved
---

# Module `tension-depot` (D7, réservé)

Statut : `reserved`. En 1.x, le développeur lance `agt collisions` à la demande.

## 1. Pourquoi cette dimension existe

`tension-dashboard-gitlab-agent` 2.2.0 mesure, fichier par fichier, la tension entre un arbre de travail et sa branche distante. Avec plusieurs worktrees, une tension naît aussi entre deux demandes locales, avant toute publication. Ce skill réserve à sa version 3.0 les niveaux du dépôt et de la chaîne d'agents : communication entre agents, régulation de second niveau, rapport de couplage.

## 2. Principe prévu

- une surveillance continue des chevauchements entre demandes, lue dans le format stable d'`agt collisions` (E2) ou recalculée de la même façon ;
- les métriques de couplage du méta-niveau de `tension-dashboard-gitlab-agent`, dont la charge de validation du développeur (`arbitration_load`) ;
- aucun arbitrage de contenu automatique : le développeur décide.

## 3. Ce que prépare le point d'extension

| Point | Règle active en 1.x | Rôle à l'activation |
|---|---|---|
| E2 | sortie d'`agt collisions` au format stable : `== <CLÉ> × <CLÉ> : <ÉTAT>`, puis un chemin par ligne | lecture par D7 sans changer `agt` |

## 4. Test d'inertie en 1.x

Contrôle W37 : chaque ligne de la sortie d'`agt collisions` respecte le format du point E2.
