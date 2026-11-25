---
name: signaux
description: Confrontation des signaux du deuxième couplage (D10) : décisions d'Agent2Dev aux points de validation et délais de décision, reconnus à la présentation qu'elles visent ; comptés par système et par point, retenues, amendées, refusées, en attente, délais médian et maximal lus dans la mesure de chaque décision, avec leurs instances ; aucun retour, aucune récurrence, aucun candidat, aucun classement de personnes. À lire pour lire les signaux que rend confronter.
dimensions: [D10]
status: active
---

# Module `signaux` (D10)

Le deuxième couplage du troisième ordre relie la description à la pratique : le dépôt observe ce que ses spécifications font aux personnes qui s'en servent (`EVOLUTION.md`, section 10.3). Son catalogue nomme, pour chaque clause de second ordre qui décrit un effet sur des personnes, le signal qui l'observe (`EVOLUTION.md`, section 10.6). Deux de ces signaux sortent de leur instance depuis la version 1.4.0, par l'export du binôme (module `export-binome` ; socle d'observation, section 6.7) : les décisions d'Agent2Dev au point V2, qui observent la clause d'agent-tdd-jira, ses critères et ses scénarios devenus la définition de « terminé », et les délais de décision avec les décisions en attente, qui observent celle d'agents-paralleles-gitlab, la charge de validation du développeur. Ce module dit ce que l'observatoire en fait : des comptes.

## 1. Enveloppes des points

- Une présentation est une observation de nature `presente`, de motif `point-` suivi du point, `point-v0` à `point-v5`, au nom d'Agent2Dev.
- Une décision est une décision de même motif, qui vise sa présentation dans le journal de son système, avec la valeur `retenue`, `amendee` ou `refusee` ; sa nature est la valeur prise au point, `valider`, `corriger` ou une autre ; son champ `mesure`, `delai-decision`, porte le délai en secondes, calculé à la source.
- Sans profondeur ni invariant, et de cible `instance`, une enveloppe de point ne fait ni retour, ni récurrence (module `confrontation`), ni écart (module `systemes`), ni refus (module `acceptable`) ; une décision retenue vise une présentation, pas une proposition : elle ne fait remonter aucun retour (D10.INV-1).

## 2. Comptes

Pour chaque système et chaque point, `confronter` rend, dans sa rubrique `signaux` :

| Compte | Ce qu'il compte |
|---|---|
| `presentes` | les présentations du point |
| `retenues`, `amendees`, `refusees` | les décisions, selon leur valeur sur la présentation |
| `enAttente` | les présentations qu'aucune décision ne vise encore |
| `delaiMedian`, `delaiMax` | les délais médian et maximal des décisions, en secondes, lus dans leur mesure ; `null` sans décision |
| `instances` | le nombre d'instances où le point a paru |

Le délai se lit dans la mesure de la décision, jamais dans les dates des enveloppes, que l'export peut avancer pour garder un journal dans l'ordre du temps (D10.INV-1). La ligne de commande l'écrit en secondes, en minutes ou en heures.

## 3. Lecture et limites

- Un signal se lit avec un autre, comme le dit le catalogue : les décisions amendées ou refusées au point V2 avec les présentations de V2 ; le délai de décision avec les présentations en attente et les demandes menées de front.
- Un signal ne classe jamais des personnes : le sujet d'une décision est un rôle, `developpeur`, et les comptes vont par système et par point, jamais par personne.
- Aucune proposition : un signal ne cite aucune règle, et la confrontation des signaux ne fait aucun candidat (plan du jalon J4 réduit). Une proposition par signal, avec ses seuils, et la campagne de mesure de l'orchestrateur, avec un évaluateur indépendant, attendent J4 complet (point d'extension E4).

## 4. Recette

| Invariant | Tests |
|---|---|
| D10.INV-1 | `tests/observatoire.test.mjs` : « D10 : les décisions aux points de validation se comptent par système et par point, retenues, amendées, refusées, en attente, avec leurs délais médian et maximal et leurs instances ; aucun candidat » ; `tests/export-binome.test.mjs` : « D7 : la rubrique points d'Agent2Dev devient des enveloppes : la présentation, puis sa décision, qui la vise avec sa valeur et porte le délai de décision calculé à la source, juste même quand la date est avancée ; rien en clair » |
