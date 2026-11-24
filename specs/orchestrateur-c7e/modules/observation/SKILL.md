---
name: observation
description: Dimension réservée D12, observation partagée (événements du registre des concepts et lignes du registre des écarts exportés dans l'enveloppe commune du socle socle-observation, selon ses correspondances, sans changer ces registres ni leurs droits). Ne pas appliquer en 3.x ; lire seulement pour comprendre le point d'extension E6.
dimensions: [D12]
status: reserved
---

# Module `observation` (D12, réservé)

Statut : `reserved`. En 3.6, l'orchestrateur n'exporte rien : le registre des concepts, `docs/c7e/concepts.json`, et le registre des écarts, `docs/c7e/registre-ecarts.md`, restent les seules traces de sa boucle de second ordre.

## 1. Pourquoi cette dimension existe

Le registre des concepts borne le second ordre de l'orchestrateur dans chaque projet ; ce qu'il apprend y reste. Le troisième ordre du dépôt (`EVOLUTION.md`, section 10) demande que chaque système de second ordre se rende observable aux autres dans un milieu commun, pour que les propositions, les décisions et les écarts de plusieurs projets et de plusieurs systèmes puissent se confronter. Cette dimension garde la place de cet export, avec le socle `socle-observation` comme milieu ; elle prolonge le point d'extension E3, qui prépare un registre partagé entre projets.

## 2. Principe prévu

- Les événements du registre des concepts, constatés entre deux versions commitées du fichier, et les lignes du registre des écarts deviennent des enveloppes `socle-observation.enveloppe/1`, selon les correspondances du socle (`socle-observation:SO4.INV-1`), dans un journal d'enveloppes en ajout seul, propre au projet.
- L'export lit ces registres sans les modifier : les droits du registre des concepts ne changent pas, l'IA n'y promeut, n'y modifie ni n'y retire rien (D6.INV-2).
- Rien ne sort sans minimisation : ni nom de relecteur, ni texte d'écart, ni clé de ticket en clair (`socle-observation:SO3.INV-1`, `socle-observation:SO3.INV-2`).
- Le socle passe alors de la référence à l'inclusion, épinglé dans `manifest.json` comme le socle back-front.

## 3. Ce que prépare le point d'extension

| Point | Règle active en 3.6 |
|---|---|
| E6 | aucune enveloppe n'est produite ; une demande d'export reçoit la réponse « dimension D12 réservée », et aucun fichier n'est écrit |

## 4. Test d'inertie en 3.x

Le scénario R23 du point d'entrée.
