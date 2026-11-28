---
name: depot
description: Le dépôt observé (D13) : la gouvernance du dépôt Agent2Prompt lue dans son historique Git et son CHANGELOG, hors ligne, sans jeton ; par pull request fusionnée, le délai de son premier commit à sa fusion, ses reprises, les points hors plan que sa consignation dit ratifiés et le délai de cette consignation ; des comptes, médiane et maximum, recalculés à chaque appel et lus avant chaque plan de jalon ; rien n'est écrit ni proposé. À lire pour lancer et lire la commande depot.
dimensions: [D13]
status: active
---

# Module `depot` (D13)

Le dépôt donne le troisième ordre à ses systèmes ; il se l'applique ici à lui-même (`EVOLUTION.md`, section 10.8). Sa gouvernance a une forme fixe : un plan, sa ratification par le développeur, une pull request par jalon, sa fusion, puis sa consignation, une pull request qui inscrit au CHANGELOG les points au-delà du plan que le développeur a ratifiés, sur une ligne « Décisions ratifiées (pull request n° N) ». Le développeur ratifie seul : sa charge, que l'analyse du passage au troisième ordre nommait déjà comme le goulet, devient observable. Ce module dit ce que l'observatoire en lit, et ce qu'il n'en lit pas.

## 1. Ce que la commande lit

```
node specs/observatoire/outils/observatoire.mjs depot [--depuis AAAA-MM-JJ] [--json]
```

- L'historique Git de la branche courante du clone, en premier parent : les fusions de pull request par merge commit, de sujet « Merge pull request #N from <propriétaire>/<branche> ». Une autre fusion, un commit direct, ou une fusion sans commit propre ne se comptent pas.
- Pour chaque fusion, les commits de la pull request, du premier parent de la fusion à son second, avec leur date de commit.
- Le `CHANGELOG.md` du clone : ses lignes « - Décisions ratifiées (pull request n° N) : … » ; la première d'une pull request compte, le journal allant du plus récent au plus ancien.

Rien d'autre : ni l'API de la forge, ni jeton, ni réseau, ni le magasin ; la commande n'écrit rien, ni journal, ni enveloppe, ni proposition, et se recalcule à chaque appel (D13.INV-1). `--depuis` ne garde que les pull requests fusionnées ce jour-là ou après. Un clone superficiel tronque l'historique : la commande le signale, et compte ce qu'il garde.

## 2. Comptes

Une pull request de branche `docs/ratification-<n>` est la consignation de la n° n : elle compte pour elle, jamais comme une de plus (D13.INV-2). Pour chaque autre pull request, `--json` rend, dans `pullRequests`, dans l'ordre des fusions :

| Champ | Ce qu'il dit |
|---|---|
| `pr`, `branche`, `fusion` | son numéro, sa branche, la date de sa fusion |
| `commits`, `reprises` | ses commits ; ses reprises, les commits au-delà du premier |
| `delai` | en secondes, de la date du plus ancien de ses commits à celle de sa fusion |
| `consignation` | la pull request qui la consigne, sa fusion et son délai, de la fusion consignée à la sienne ; `null` sans consignation |
| `horsPlan` | le nombre de points hors plan que sa ligne « Décisions ratifiées » dit ratifiés ; `null` si elle n'en a pas, ou ne dit pas leur nombre |
| `ratifiee` | si le CHANGELOG a sa ligne « Décisions ratifiées » |

Et, dans `resume` : le nombre de pull requests ; leur délai médian et maximal ; les pull requests reprises et les commits de plus ; les points hors plan, leur médiane, les lignes lisibles et les lignes en tout ; les consignations, leur délai médian et maximal, et celles qui sont en attente, fusionnées après la dernière pull request consignée, sans consignation ; enfin `refusCi`, toujours `non mesurés` (D13.INV-3). La ligne de commande écrit ces comptes en six lignes, les durées en secondes, minutes ou heures.

Les points hors plan se lisent dans la ligne, en lettres ou en chiffres : « les huit points au-delà du plan », « les quatre précisions apparues à la réalisation », « le point … », « aucun point … ». Une ligne qui ne dit pas son nombre, comme « la rédaction de la section 10 », reste hors des comptes : un nombre ne se devine pas.

## 3. Lecture et limites

- Les comptes se lisent avant chaque plan de jalon, ensemble : un délai médian qui monte dit un développeur seul qui ne suit plus ; des reprises, des pull requests rendues avant d'être prêtes ; des points hors plan nombreux, des plans sous-spécifiés ; une consignation en attente, une boucle de gouvernance qui ne s'est pas refermée.
- Le délai part du plus ancien commit d'une pull request, pas de son ouverture, que l'historique ne garde pas : un proxy, qui compte aussi le temps de la rédaction.
- Les refus de la CI, ses relances et les poussées forcées ne laissent pas de trace dans l'historique : ils se déclarent non mesurés, et non nuls.
- Seules les fusions par merge commit se lisent : une pull request fusionnée par squash ou par rebase reste hors de vue.
- Un seul sujet ratifie : ces comptes sont ceux d'une gouvernance à un sujet, et ne classent personne.
- Aucune proposition, aucun journal versionné, aucune enveloppe : la gouvernance du dépôt n'est pas un système qui exporte, et l'observatoire ne propose rien sur elle.

## 4. Recette

| Invariant | Tests |
|---|---|
| D13.INV-1 | `tests/observatoire.test.mjs` : « D13 : le dépôt s'observe dans son historique Git et son CHANGELOG, hors ligne : délais, reprises, consignations et points hors plan par pull request, sans rien écrire » ; « D13 : la commande depot rend ses comptes en six lignes, ou en JSON, sur l'historique seul ; une date mal formée est refusée, un clone superficiel signalé » |
| D13.INV-2 | `tests/observatoire.test.mjs` : « D13 : le dépôt s'observe dans son historique Git et son CHANGELOG, hors ligne : délais, reprises, consignations et points hors plan par pull request, sans rien écrire » ; « D13 : depuis une date, seules comptent les pull requests fusionnées ce jour-là ou après ; une consignation compte pour celle qu'elle consigne, et la dernière sans consignation est en attente » |
| D13.INV-3 | `tests/observatoire.test.mjs` : « D13 : un nombre de points hors plan que sa ligne ne dit pas reste inconnu, hors des comptes ; les refus de la CI sont non mesurés » ; « D13 : le dépôt s'observe dans son historique Git et son CHANGELOG, hors ligne : délais, reprises, consignations et points hors plan par pull request, sans rien écrire » |
