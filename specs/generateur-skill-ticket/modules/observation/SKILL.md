---
name: observation
description: Dimension réservée D9, export vers le socle d'observation (champ d'observation, relevé et registre d'apprentissage traduits dans l'enveloppe commune du socle socle-observation, selon ses correspondances, sans changer leurs formats). Ne pas implémenter en 1.x ; lire seulement pour comprendre le point d'extension E4.
dimensions: [D9]
status: reserved
---

# Module `observation` (D9, réservé)

Statut : `reserved`. En 1.2, le générateur n'exporte rien : le champ d'observation de chaque arbre, le relevé de chaque ticket et le registre d'apprentissage du projet restent les seules traces de ce que les skills de ticket et le générateur observent.

## 1. Pourquoi cette dimension existe

Le champ et l'apprentissage font du générateur un système de second ordre, borné dans chaque projet : les niveaux d'observation N1 à N3 du champ, le développeur au-dessus, et les récurrences que le registre propose. Le troisième ordre du dépôt (`EVOLUTION.md`, section 10) demande que chaque système de second ordre se rende observable aux autres dans un milieu commun, pour qu'un même motif relevé dans plusieurs projets, ou par plusieurs systèmes, puisse se confronter. Cette dimension garde la place de cet export, avec le socle `socle-observation` comme milieu.

## 2. Principe prévu

- Les enregistrements du champ, sauf les actions, et ceux du registre d'apprentissage deviennent des enveloppes `socle-observation.enveloppe/1`, selon les correspondances du socle (`socle-observation:SO4.INV-1`), dans un journal d'enveloppes en ajout seul, propre au projet.
- Les formats du générateur ne changent pas, et aucun outil n'écrit dans le champ, le relevé ou le registre pour exporter : l'export les lit.
- Rien ne sort sans minimisation : ni résumé, ni commentaire, ni contenu de retour, ni clé de ticket en clair (`socle-observation:SO3.INV-1`, `socle-observation:SO3.INV-2`).
- Un écart aux consignes du générateur, relevé avec la cible `generateur`, sort avec la cible `specification` : c'est ce qui doit remonter jusqu'au dépôt.
- Le socle passe alors de la référence à l'inclusion, épinglé dans `manifest.json`.

## 3. Ce que prépare le point d'extension

| Point | Règle active en 1.2 |
|---|---|
| E4 | aucun outil du générateur n'exporte vers le socle d'observation ; aucun skill de ticket ne porte ce module |

## 4. Test d'inertie en 1.x

`tests/specification.test.mjs` : « 1.2.0 : D9 réservée, inerte ».
