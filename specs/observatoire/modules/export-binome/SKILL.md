---
name: export-binome
description: Export des refus du binôme Agent2Dev et Agent2Test vers le socle d'observation (outil export-binome.mjs, lancé depuis le clone ; rubrique acceptable d'un livrable ou d'un journal de tests traduite selon la correspondance du socle, une enveloppe par refus et par réponse, datée par la rubrique ; un journal par système dans le projet de l'application, chaîné, sous le sel de l'instance ; rubrique réécrite refusée ; rien dans le magasin). À lire pour exporter les refus d'une demande ou d'une campagne.
dimensions: [D7]
status: active
---

# Module `export-binome` (D7)

Agent2Dev et Agent2Test se construisent hors du dépôt, qui tient leurs spécifications et leurs formats, pas leur code : sans outil de référence, leurs refus ne sortiraient pas de leurs instances. L'observatoire porte cet outil. Il agit à la source, pour le binôme, comme l'export du générateur ou de l'orchestrateur pour le leur, et reste à part du magasin. Cette dimension régule, au premier ordre, ce qui sort d'une instance pour le binôme : rien que des enveloppes minimisées.

## 1. Commandes

Depuis le clone, avec Node 20 ou plus récent :

```text
node specs/observatoire/outils/export-binome.mjs exporter --projet <application> <fichier>...
node specs/observatoire/outils/export-binome.mjs verifier --projet <application>
node specs/observatoire/outils/export-binome.mjs etat --projet <application> [--json]
```

- `<application>` : la racine du projet de l'application, dépôt Git ; sans `--projet`, le dossier courant.
- `<fichier>` : le livrable d'une demande d'Agent2Dev, `<sortie>/<CLÉ>/livrable.json`, ou le journal de tests d'une campagne d'Agent2Test, `rapports/<campagne>/journal-de-tests.json` dans le projet Agent2Test ; son format dit son système.
- L'IA de l'observatoire ne lance pas l'outil : elle en donne la commande au développeur.

## 2. Traduction

- Chaque refus de la rubrique `acceptable`, et chaque réponse à un refus, devient une enveloppe, selon la correspondance du socle d'observation, section 6.5 : `refus` pour un refus, `derogation` pour une dérogation, `decision` de valeur `refusee` pour un faux refus ; une réponse vise l'enveloppe de son refus, avec la valeur `amendee` pour une dérogation (D7.INV-1).
- L'enveloppe porte le nom et la version du système qui a produit l'enregistrement, lus dans la source, et sa date, lue dans la rubrique : l'outil n'y met rien de lui.
- La règle citée en premier, celle du noyau quand le refus en cite une, devient l'invariant, préfixé par la spécification qui la définit : `socle-acceptable:SA2.INV-1`, `agent2dev:D1.INV-5`.
- Les fichiers désignés ne sont que lus. Une source sans rubrique, qu'aucun refus n'a touchée, n'exporte rien.

## 3. Journaux et sel

- Un journal par système, dans le projet de l'application : `docs/c7e/observations-agent2dev.jsonl` et `docs/c7e/observations-agent2test.jsonl`, chacun avec sa tête, en ajout seul, chaque ligne chaînée à la précédente (D7.INV-2). Les refus d'Agent2Test relèvent de l'instance de l'application testée, non du projet Agent2Test.
- Le sel est celui de l'instance, que partagent les systèmes du projet, dans `<git-common-dir>/agent2prompt/sel`. L'outil le tire, en mode 0600, quand aucun journal d'enveloppes n'existe encore dans le projet ; s'il en existe un, il refuse de tirer un nouveau sel, qui changerait l'identité de l'instance, et un sel étranger à l'un des journaux arrête l'export.
- Un enregistrement déjà exporté ne l'est pas deux fois. Une réponse qui paraît dans la rubrique après l'export de son refus s'ajoute, et vise l'enveloppe de son refus.
- Les sources d'un système se fusionnent par date, chacune dans l'ordre de ses numéros ; à date égale, la clé de demande ou de campagne qui vient la première passe d'abord. Une date antérieure à la dernière ligne prend la date de celle-ci.
- Tout ou rien : un journal altéré, une source illisible ou mal formée, deux sources de même demande ou de même campagne, une rubrique qui change ou retire un enregistrement exporté, un sel absent alors qu'un journal existe, une enveloppe mal formée arrêtent l'export, et rien n'est écrit.

## 4. Ce qui ne sort pas

L'objet refusé, le motif d'une réponse et le nom de qui l'a donnée restent dans le journal du système ; la demande et la campagne ne sortent que par leur empreinte salée, la règle préfixée par la spécification qui la définit, le rôle par son nom dans le socle : `developpeur`, `referent` ou `testeur` (D7.INV-3). L'outil n'écrit rien dans le magasin de l'observatoire, et ne lit, outre les fichiers désignés, que le sel et les journaux d'enveloppes du projet ; le sel ne s'affiche jamais.

## 5. Recette

| Invariant | Tests |
|---|---|
| D7.INV-1 | `tests/export-binome.test.mjs` : « D7 : la rubrique acceptable d'un livrable et d'un journal de tests devient des enveloppes conformes au socle, datées par la rubrique, au nom et à la version du système, sans rien modifier des sources » ; « D7 : l'export écrit un journal par système, en ajout seul et chaîné, sous le sel de l'instance ; une réponse venue plus tard s'ajoute et vise son refus ; une rubrique réécrite, un journal altéré ou un sel étranger arrêtent l'export sans rien écrire » |
| D7.INV-2 | `tests/export-binome.test.mjs` : « D7 : l'export écrit un journal par système, en ajout seul et chaîné, sous le sel de l'instance ; une réponse venue plus tard s'ajoute et vise son refus ; une rubrique réécrite, un journal altéré ou un sel étranger arrêtent l'export sans rien écrire » ; « D7 : aucune enveloppe ne porte l'objet refusé, le motif d'une réponse, la clé d'une demande ni le nom d'une personne ; l'outil n'écrit rien dans le magasin de l'observatoire, et le sel ne s'affiche pas » |
| D7.INV-3 | `tests/export-binome.test.mjs` : « D7 : aucune enveloppe ne porte l'objet refusé, le motif d'une réponse, la clé d'une demande ni le nom d'une personne ; l'outil n'écrit rien dans le magasin de l'observatoire, et le sel ne s'affiche pas » ; « D7 : la rubrique acceptable d'un livrable et d'un journal de tests devient des enveloppes conformes au socle, datées par la rubrique, au nom et à la version du système, sans rien modifier des sources » |
