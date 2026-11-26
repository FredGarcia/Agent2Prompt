---
name: propositions
description: Propositions de l'observatoire au dépôt (format observatoire.proposition/1, en-tête minimisé, corps rédigé par le développeur, fichier dans observatoire/propositions/, pull request et ratification humaines, statut inscrit par la ratification, propositions jamais répétées). À lire pour écrire, relire ou ratifier une proposition.
dimensions: [D4]
status: active
---

# Module `propositions` (D4)

Une proposition est ce qui remonte d'un candidat jusqu'au dépôt : un fichier, apporté par une pull request que le développeur ouvre, et que la ratification décide. L'observatoire l'écrit ; il ne l'applique jamais (`EVOLUTION.md`, section 10.5, règle 4).

## 1. Fichier

`proposer` écrit une proposition par candidat nouveau dans `observatoire/propositions/`, à la racine du clone, sous le nom `AAAA-MM-JJ-<système>-<motif>-<profondeur>.md`, sans profondeur pour un candidat qui n'en a pas, comme un candidat par invariant ou par faux refus. Le développeur la relit, rédige sous « Ce qui change » la règle à changer et pourquoi, la commite et ouvre la pull request ; l'observatoire ne commite, ne pousse ni ne publie rien, et n'écrit dans le dépôt que ces fichiers (D4.INV-2).

## 2. En-tête

L'en-tête, entre deux lignes `---`, suit le format `observatoire.proposition/1`. Il ne porte que des valeurs minimisées (D4.INV-1) :

| Clé | Valeur |
|---|---|
| `format` | `observatoire.proposition/1` |
| `date` | le jour de la proposition, AAAA-MM-JJ |
| `systeme` | le nom de la spécification visée |
| `versions` | les versions du système vues dans les enveloppes, entre crochets ; pour une proposition par invariant ou par faux refus, la version courante de la spécification qui le définit |
| `sorte` | `retour`, `recurrence`, `invariant` ou `faux-refus` |
| `motif` | le motif, en minuscules et tirets ; pour une proposition par invariant, `ecart-` suivi de l'invariant ; par faux refus, `faux-refus-` suivi de la règle |
| `invariant` | pour une proposition par invariant ou par faux refus seulement : l'invariant du dépôt, préfixé par la spécification visée |
| `systemes` | pour une proposition par invariant ou par faux refus seulement : les systèmes dont les écarts, ou les faux refus, citent l'invariant, entre crochets |
| `profondeur` | `macro`, `meso-contrats`, `meso-composants` ou `micro` ; facultative, absente d'une proposition par invariant ou par faux refus |
| `instances`, `enveloppes` | des nombres |
| `references` | les références tronquées des enveloppes, `<8 caractères de l'instance>:<numéro>`, entre crochets ; pour une proposition par invariant ou par faux refus, `<8 caractères de l'instance>:<système>:<numéro>`, d'un système de `systemes` |
| `statut` | `ouverte`, `ratifiee` ou `refusee` |
| `version` | pour une proposition ratifiée seulement : la version du système qui la porte |
| `pr` | pour une proposition décidée : le numéro de la pull request qui l'a décidée |

Toute autre clé, toute valeur hors de ces formes, refusent la proposition. L'invariant et les systèmes sont des identifiants du dépôt, comme le système et le motif. Aucun texte, chemin, clé de ticket ni nom d'une instance n'entre dans l'en-tête ; le corps, rédigé par le développeur, n'en contient pas davantage.

## 3. Statut et répétition

- La pull request de ratification inscrit le statut dans l'en-tête : `statut: ratifiee`, avec `version` et `pr`, ou `statut: refusee`, avec `pr`. C'est ce statut que suit le module `suivi`.
- Une ratification apporte l'examen de la proposition, du même nom dans `observatoire/examens/`, l'avis d'un examinateur indépendant sur un autre modèle ; un refus n'en demande pas (module `examens`, D11.INV-1). Le format des propositions ne change pas pour autant : l'examen est un fichier à part, que l'observatoire n'écrit pas.
- Une proposition ouverte ou ratifiée ne se répète pas ; une proposition refusée ne revient qu'avec une instance nouvelle, absente de ses références (D4.INV-2). Une proposition se reconnaît à son système, son motif et sa profondeur ; une proposition par invariant ou par faux refus, à sa sorte, son système et son motif, et ne se confond avec aucune autre sorte. Le corps d'une proposition par faux refus rappelle qu'une règle de sûreté ne s'affaiblit jamais (module `acceptable`).

## 4. Recette

| Invariant | Tests |
|---|---|
| D4.INV-1 | `tests/observatoire.test.mjs` : « D4 : une proposition ne porte que des valeurs minimisées, et aucun texte, chemin ni nom d'une instance n'entre dans le dépôt » ; « D6 : un candidat par invariant se propose à la spécification qui le définit, avec les systèmes qui l'ont relevé, et ses références nomment le système de chaque enveloppe » ; « D8 : une règle déclarée infondée par des faux refus dans deux instances est proposée, trop large, à la spécification qui la définit ; des faux refus d'une seule instance ne font que se compter » ; `tests/specification.test.mjs` : « spécification : chaque proposition du dépôt suit le format observatoire.proposition/1, et leur dossier a son README » |
| D4.INV-2 | `tests/observatoire.test.mjs` : « D4 : l'observatoire n'écrit dans le dépôt que des propositions, sans toucher aux projets ; une ouverte ou une ratifiée ne se répète pas, une refusée ne revient qu'avec une instance nouvelle » ; « Ligne de commande : codes de sortie ; le magasin d'épreuve seul est écrit » |
