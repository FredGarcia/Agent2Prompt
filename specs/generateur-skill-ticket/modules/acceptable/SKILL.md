---
name: acceptable
description: Dimension réservée D10, acceptable partagé (kits dev, test et démo du skill racine et actions des skills de ticket confrontés, avant leur exécution, au noyau du socle socle-acceptable épinglé, refus qui citent leur règle, écriture par les kits, avec retour arrière). Ne pas implémenter en 1.x ; lire seulement pour comprendre le point d'extension E5.
dimensions: [D10]
status: reserved
---

# Module `acceptable` (D10, réservé)

Statut : `reserved`. En 1.4, l'acceptable des skills de ticket est celui de la méthode de l'orchestrateur, qu'ils recopient : aucune modification avant la fiche validée (`orchestrateur-c7e:D3.INV-1`), aucune opération Git distante (`orchestrateur-c7e:D4.INV-3`). Le socle de l'acceptable est référencé par le manifeste ; aucun outil du générateur ne le lit, et aucun skill de ticket ne le porte.

## 1. Pourquoi cette dimension existe

À la clôture d'un arbre, le skill racine écrit trois manifestes de kits, dev, test et démo (D4.INV-2) : ils recensent ce que l'arbre a produit, sans retour arrière ni confrontation à une règle commune. Le socle de l'acceptable (`socle-acceptable` 1.2.0) tire des systèmes du dépôt le noyau commun de ce qu'ils refusent, chaque règle un invariant que cite le refus, et fait des kits le chemin de l'écriture, avec retour arrière, selon un contrat qu'il décrit depuis sa version 1.1.0 : le troisième couplage du troisième ordre, celui des valeurs (`EVOLUTION.md`, section 10). Cette dimension garde la place de son application dans le générateur et dans les skills de ticket.

## 2. Principe prévu

- Le socle passe de la référence à l'inclusion, à la version qu'épingle l'orchestrateur, et les skills de ticket le recopient avec la méthode, comme ses invariants.
- Les actions des skills de ticket et les kits du skill racine se confrontent, avant leur exécution, au noyau épinglé ; un refus cite sa règle (`socle-acceptable:SA6.INV-1`), et chaque action d'un kit porte son retour arrière (`socle-acceptable:SA2.INV-3`), selon le contrat des kits du socle : confrontés par le système qui les produit, avec leur manifeste `socle-acceptable.kit/1`, validés par un humain à leur empreinte, appliqués par la fabrication de l'hôte (`socle-acceptable:SA8.INV-1`, `socle-acceptable:SA8.INV-2`).
- Le kit démo est celui du skill racine, qui en écrit déjà le manifeste : il rejoindra ce contrat avec l'activation de cette dimension, et scenario-playwright jouera son parcours (sa dimension D12).
- Refus, dérogations et faux refus remontent dans le champ d'observation, puis dans l'export vers le socle d'observation, quand ce socle-là leur aura donné une correspondance (`socle-acceptable:SA6.INV-2`).
- Rien ne change avant le passage à `active` : les kits gardent leur format `skill-ticket.kit/1`, et les skills de ticket les refus de la méthode qu'ils recopient.

## 3. Ce que prépare le point d'extension

| Point | Règle active en 1.4 |
|---|---|
| E5 | aucun outil du générateur ne lit le socle de l'acceptable ; aucun skill de ticket ne porte ce module ni le socle ; une demande qui toucherait l'acceptable partagé reçoit la réponse « dimension D10 réservée » |

## 4. Test d'inertie en 1.x

`tests/specification.test.mjs` : « 1.4.0 : D10 réservée, inerte : aucun outil ne lit le socle de l'acceptable, et aucun skill de ticket ne porte ni le module acceptable ni le socle ».
