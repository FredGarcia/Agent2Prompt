---
name: acceptable
description: Dimension réservée D13, acceptable partagé (actions à effet extérieur d'un ticket confrontées, avant leur exécution, au noyau du socle socle-acceptable épinglé et aux invariants du projet, refus qui citent leur règle, dérogations validées par un nom au registre des écarts, écriture par les kits dev, test et démo, avec retour arrière). Ne pas appliquer en 3.x ; lire seulement pour comprendre le point d'extension E7.
dimensions: [D13]
status: reserved
---

# Module `acceptable` (D13, réservé)

Statut : `reserved`. En 3.8, l'acceptable de l'orchestrateur est celui de sa méthode : aucune modification avant la fiche validée (D3.INV-1), aucune opération Git distante (D4.INV-3), les invariants du projet, du socle et des référentiels dans tous les modes (D2.INV-2), et tout écart inscrit au registre des écarts avec sa décision (D6.INV-3). Le socle de l'acceptable est référencé par le manifeste ; il n'est ni inclus ni appliqué.

## 1. Pourquoi cette dimension existe

Ce que l'orchestrateur refuse est écrit dans sa méthode et dans le fichier d'invariants de chaque projet, sans lien avec ce que refusent les autres systèmes du dépôt. Le socle de l'acceptable (`socle-acceptable` 1.0.1) en tire le noyau commun, chaque règle un invariant que cite le refus : le troisième couplage du troisième ordre, celui des valeurs (`EVOLUTION.md`, section 10). Cette dimension garde la place de son application dans l'orchestrateur.

## 2. Principe prévu

- Le socle passe de la référence à l'inclusion, épinglé dans `manifest.json` ; le fichier d'invariants du projet le précise sans le contredire, comme il précise le socle back-front (D8.INV-2), et n'en retire ni n'en affaiblit aucune règle (`socle-acceptable:SA7.INV-1`).
- Avant d'exécuter une action à effet extérieur, l'IA la confronte au noyau épinglé et aux invariants du projet ; un refus cite sa règle, et une dérogation, validée par un nom, sur une règle du projet qui l'admet, jamais sur une règle du noyau, s'inscrit au registre des écarts, comme tout écart (D6.INV-3, `socle-acceptable:SA6.INV-1`, `socle-acceptable:SA6.INV-2`).
- Sans garde ni kit, l'IA refuse par sa consigne : l'orchestrateur le déclare dans ses limites, comme le socle le demande à tout système qui ne refuse que par sa consigne.
- L'écriture passera par les kits dev, test et démo, avec retour arrière, appliqués par l'hôte d'IA sur l'environnement de leur nom, jamais en production (`socle-acceptable:SA2.INV-3`, point d'extension E1 du socle) ; le push, la fusion et le tag restent au développeur (D4.INV-3, `socle-acceptable:SA2.INV-2`).

## 3. Ce que prépare le point d'extension

| Point | Règle active en 3.8 |
|---|---|
| E7 | le socle de l'acceptable n'est ni installé ni appliqué ; une demande qui toucherait l'acceptable partagé reçoit la réponse « dimension D13 réservée », et aucun fichier n'est écrit |

## 4. Test d'inertie en 3.x

Le scénario R24 du point d'entrée.
