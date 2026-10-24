---
name: memoire
description: Dimension réservée D21, mémoire et recherche sur le code et les demandes passées (fragments du projet, des demandes closes, des fiches d'impact et des variantes retenues, recherche lexicale sans dépendance et vecteurs en option par un modèle local, filtrage par épinglage, masquage avant injection). Ne pas implémenter en 1.x ; lire seulement pour comprendre le point d'extension E3.
dimensions: [D21]
status: reserved
---

# Module `memoire` (D21, réservé)

Statut : `reserved`. En 1.x, les fiches ne reçoivent que les entrées de leur pas : la demande, le contenu courant des fichiers visés, les décisions du développeur et les résultats des recherches du `depot`.

## 1. Pourquoi cette dimension existe

La conception de l'étape 1 prévoyait une mémoire et une recherche hybride sur le code. Deux usages l'appellent : retrouver, pour l'impact d'une demande, ce que des demandes passées ont touché dans les mêmes fichiers ; et rappeler aux variantes les choix déjà retenus pour un problème voisin. Le skill ne la demande pas : ses recherches sont des `grep` en lecture seule, que le `depot` rend déjà.

## 2. Principe prévu

- Fragments tirés du projet (code, contrat, migrations), des demandes closes (livrables, fiches d'impact, variantes retenues, défauts confirmés) et de leurs décisions.
- Recherche plein texte par FTS5, dans les tables de la mémoire, au fichier de données unique (`unicode61 remove_diacritics 2`, classement `bm25`) ; vecteurs en option, par un modèle de plongement local (adaptateur `compatible-openai`), rangés avec leurs fragments et comparés en JavaScript, jamais calculés par un moteur externe sans autorisation.
- Seuls les fragments des versions de l'instantané épinglé de la demande sont rendus ; ils sont masqués comme le contexte transmis au moteur (D18.INV-4), et leurs identifiants sont journalisés avec l'appel.
- Un fragment n'est jamais une preuve : un élément d'impact cite toujours un résultat de recherche du `depot` (D8.INV-1).

## 3. Ce que prépare le point d'extension

| Point | Règle active en 1.x |
|---|---|
| E3 | l'action `memoire.rechercher` existe et rend une liste vide ; l'emplacement `fragments` de chaque fiche est vide |

## 4. Test d'inertie en 1.x

Le scénario ME10 du module `methode`.
