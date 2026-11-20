---
name: remise
description: Dimension réservée D13 (remise d'un scénario ratifié et de ses rapports à Agent2Test, dont le navigateur partage le vocabulaire du scénario ; points d'extension E1 et E2). Ne pas appliquer en 1.x.
dimensions: [D13]
status: reserved
---

# Module `remise` (D13, réservé)

Phase 7E couverte : Évolutif.

## Intention

Agent2Test choisit, prépare, joue et journalise les tests essentiels d'une demande, avec son propre navigateur. D13 lui remettra un scénario ratifié, et les rapports de ses exécutions, pour qu'il en fasse un cas de sa campagne sans le réécrire.

## Ce qui existe déjà en 1.0.0

- Le scénario TOML reprend le vocabulaire du navigateur d'Agent2Test : actions communes, critères de vérification, stratégies de cibles, règle des origines (E2, `agent2test:D4.INV-2`, `agent2test:D4.INV-4`).
- Le rapport aux champs stables (E1).

## Ce qui reste à décider

- La traduction des actions propres à ce skill, `telecharger`, `capturer` et `main`, dans les étapes d'Agent2Test, dont `main` n'a pas d'équivalent en campagne.
- La règle de rejeu : ce skill ne rejoue aucune étape, Agent2Test retente les vérifications (`agent2test:D4.INV-6`).
- Le contrôle du développeur avant chaque remise.
