---
name: suivi
description: Suivi des propositions de l'observatoire (statut de chaque proposition du dépôt ; pour une ratifiée, part de son motif dans les enveloppes du système avant et après la version qui la porte : effet observé, non observé, ou indécidable sous vingt enveloppes). À lire pour lire l'effet d'une proposition ratifiée.
dimensions: [D5]
status: active
---

# Module `suivi` (D5)

Une proposition ratifiée entre dans une version, qui descend vers les projets par sa transmission ; les instances qui l'appliquent exportent ensuite des enveloppes à cette version. Le suivi ferme la boucle : il regarde si le motif que la proposition traitait recule dans ces enveloppes. C'est la preuve que la règle 3 d'`EVOLUTION.md`, section 10.5, demande à une boucle du troisième ordre.

## 1. Mesure

- Pour une proposition ratifiée en version V du système S : les enveloppes de S, toutes instances confondues, se partagent entre les versions antérieures à V et les versions V et suivantes.
- De chaque côté, la part du motif est le nombre de signaux de ce motif, à la profondeur de la proposition, rapporté au nombre d'enveloppes de S (module `confrontation`, pour les signaux).
- L'effet est observé si la part recule après V, non observé sinon ; il ne se déclare qu'avec au moins vingt enveloppes de S de part et d'autre, sinon il est indécidable (D5.INV-1).
- Une proposition ouverte ou refusée n'a pas d'effet à mesurer : `suivre` dit son statut.

Un effet non observé n'invalide pas la ratification : il la rouvre à la conversation, avec ses nombres, dans une proposition nouvelle si le motif persiste.

## 2. Recette

| Invariant | Tests |
|---|---|
| D5.INV-1 | `tests/observatoire.test.mjs` : « D5 : l'effet d'une proposition ratifiée se mesure avant et après sa version : observé, non observé, ou indécidable sous vingt enveloppes » ; « Ligne de commande : codes de sortie ; le magasin d'épreuve seul est écrit » |
