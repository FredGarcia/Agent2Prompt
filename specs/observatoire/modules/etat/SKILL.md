---
name: etat
description: État de l'écosystème vu par l'observatoire (pour chaque instance, chaque système qui exporte et sa dernière version, comparée à la version que le dépôt publie : à jour, en retard ou inconnue ; enveloppes écartées ; propositions par statut). À lire pour lire l'état de l'écosystème.
dimensions: [D3]
status: active
---

# Module `etat` (D3)

Le premier couplage du troisième ordre observe aussi l'état de l'écosystème lui-même : quelles versions des spécifications sont en usage, dans quelles instances (`EVOLUTION.md`, section 10.3). Les transmissions descendent du dépôt vers les projets ; l'état dit où elles sont arrivées.

## 1. Ce que dit `etat`

- Pour chaque instance : ses projets inscrits, le nombre de ses enveloppes et la date de la dernière.
- Pour chaque système qu'elle exporte, le générateur, l'orchestrateur, Agent2Dev et Agent2Test, chacun par son journal : les versions vues, la dernière, la version publiée par le dépôt, et l'écart : à jour, en retard, ou inconnue quand le dépôt n'a pas publié cette version (D3.INV-1).
- Le nombre d'enveloppes écartées, d'un système ou d'une version inconnus (module `releve`).
- Les propositions du dépôt, par statut : ouvertes, ratifiées, refusées.

Une instance en retard n'est pas une faute : c'est un fait de l'écosystème, que le développeur lit avant de confronter, car une récurrence vue sur une version ancienne peut être déjà traitée par une version publiée depuis.

## 2. Recette

| Invariant | Tests |
|---|---|
| D3.INV-1 | `tests/observatoire.test.mjs` : « D3 : chaque instance est comparée aux versions publiées des systèmes qu'elle exporte : à jour, en retard, ou inconnue » ; « D1 : une enveloppe d'un système ou d'une version inconnus du dépôt est écartée de toute confrontation et signalée » ; « Ligne de commande : codes de sortie ; le magasin d'épreuve seul est écrit » ; « D8 : les refus se confrontent par règle : refus, dérogations et faux refus comptés par système et par instance ; aucun ne fait de retour, de récurrence ni de candidat par invariant » |
