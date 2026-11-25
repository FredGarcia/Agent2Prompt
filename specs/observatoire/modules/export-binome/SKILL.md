---
name: export-binome
description: Export des refus et des kits du binôme Agent2Dev et Agent2Test vers le socle d'observation (outil export-binome.mjs, lancé depuis le clone ; rubriques acceptable et kits d'un livrable ou d'un journal de tests traduites selon les correspondances du socle, une enveloppe par refus, par réponse et par étape d'un kit, datée par la rubrique ; un journal par système dans le projet de l'application, chaîné, sous le sel de l'instance ; rubrique réécrite refusée ; rien dans le magasin). À lire pour exporter les refus d'une demande ou d'une campagne.
dimensions: [D7]
status: active
---

# Module `export-binome` (D7)

Agent2Dev et Agent2Test se construisent hors du dépôt, qui tient leurs spécifications et leurs formats, pas leur code : sans outil de référence, leurs refus et leurs kits ne sortiraient pas de leurs instances. L'observatoire porte cet outil. Il agit à la source, pour le binôme, comme l'export du générateur ou de l'orchestrateur pour le leur, et reste à part du magasin. Cette dimension régule, au premier ordre, ce qui sort d'une instance pour le binôme : rien que des enveloppes minimisées.

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
- Chaque étape d'un kit de la rubrique `kits` devient une enveloppe, selon la correspondance du socle d'observation, section 6.6 : la remise, une observation de nature `remis`, au nom du système ; la validation, une décision de nature `validation` et de valeur `retenue`, qui vise l'enveloppe de la remise ; l'application, une observation de nature `applique` ou `echec` ; le retour arrière, une observation de nature `retour-arriere`. Le motif est `kit-dev` ou `kit-test`, l'ancre le kit, par l'empreinte salée de l'empreinte de son patch ; ni invariant, ni cible de spécification (D7.INV-1).
- Un échec, déclaré avec son retour arrière, ne remplit que l'application : il fait une seule enveloppe. Un kit ne s'applique qu'après sa validation, et seul un kit appliqué se défait ensuite : une rubrique qui dit autre chose est refusée, comme une étape antérieure à la précédente, par son numéro ou par sa date, un environnement qui n'est pas celui du système, `dev` pour Agent2Dev et `test` pour Agent2Test, ou un rôle hors de ceux qui valident ou déclarent : `developpeur` pour Agent2Dev, `testeur` ou `developpeur` pour Agent2Test.
- Les refus, les réponses et les étapes des kits d'une même source s'exportent ensemble, dans l'ordre de leur numéro, chacun celui de sa ligne de journal, qu'aucun n'en partage.
- Les fichiers désignés ne sont que lus. Une source sans rubrique, qu'aucun refus ni aucun kit n'a touchée, n'exporte rien.

## 3. Journaux et sel

- Un journal par système, dans le projet de l'application : `docs/c7e/observations-agent2dev.jsonl` et `docs/c7e/observations-agent2test.jsonl`, chacun avec sa tête, en ajout seul, chaque ligne chaînée à la précédente (D7.INV-2). Les refus d'Agent2Test relèvent de l'instance de l'application testée, non du projet Agent2Test.
- Le sel est celui de l'instance, que partagent les systèmes du projet, dans `<git-common-dir>/agent2prompt/sel`. L'outil le tire, en mode 0600, quand aucun journal d'enveloppes n'existe encore dans le projet ; s'il en existe un, il refuse de tirer un nouveau sel, qui changerait l'identité de l'instance, et un sel étranger à l'un des journaux arrête l'export.
- Un enregistrement déjà exporté ne l'est pas deux fois. Une réponse qui paraît dans la rubrique après l'export de son refus s'ajoute, et vise l'enveloppe de son refus ; une étape d'un kit qui paraît après l'export des précédentes s'ajoute, et une validation vise l'enveloppe de sa remise.
- Les sources d'un système se fusionnent par date, chacune dans l'ordre de ses numéros ; à date égale, la clé de demande ou de campagne qui vient la première passe d'abord. Une date antérieure à la dernière ligne prend la date de celle-ci.
- Tout ou rien : un journal altéré, une source illisible ou mal formée, deux sources de même demande ou de même campagne, une rubrique qui change ou retire un enregistrement exporté, un sel absent alors qu'un journal existe, une enveloppe mal formée arrêtent l'export, et rien n'est écrit.

## 4. Ce qui ne sort pas

L'objet refusé, le motif d'une réponse, le commentaire d'un échec, le scénario d'un kit et le nom de qui a répondu ou déclaré restent dans le journal du système ; la demande, la campagne et l'empreinte du patch d'un kit ne sortent que par leur empreinte salée, la règle préfixée par la spécification qui la définit, le rôle par son nom dans le socle : `developpeur`, `referent` ou `testeur` (D7.INV-3). L'outil n'écrit rien dans le magasin de l'observatoire, et ne lit, outre les fichiers désignés, que le sel et les journaux d'enveloppes du projet ; le sel ne s'affiche jamais.

## 5. Recette

| Invariant | Tests |
|---|---|
| D7.INV-1 | `tests/export-binome.test.mjs` : « D7 : la rubrique acceptable d'un livrable et d'un journal de tests devient des enveloppes conformes au socle, datées par la rubrique, au nom et à la version du système, sans rien modifier des sources » ; « D7 : la rubrique kits devient des enveloppes : remise, validation qui vise la remise, application ou échec, retour arrière, reliées par l'ancre du kit ; un échec, une seule enveloppe ; refus et étapes d'une même source dans l'ordre de leur numéro » ; « D7 : l'export écrit un journal par système, en ajout seul et chaîné, sous le sel de l'instance ; une réponse venue plus tard s'ajoute et vise son refus ; une rubrique réécrite, un journal altéré ou un sel étranger arrêtent l'export sans rien écrire » |
| D7.INV-2 | `tests/export-binome.test.mjs` : « D7 : la rubrique kits devient des enveloppes : remise, validation qui vise la remise, application ou échec, retour arrière, reliées par l'ancre du kit ; un échec, une seule enveloppe ; refus et étapes d'une même source dans l'ordre de leur numéro » ; « D7 : l'export écrit un journal par système, en ajout seul et chaîné, sous le sel de l'instance ; une réponse venue plus tard s'ajoute et vise son refus ; une rubrique réécrite, un journal altéré ou un sel étranger arrêtent l'export sans rien écrire » ; « D7 : aucune enveloppe ne porte l'objet refusé, le motif d'une réponse, la clé d'une demande ni le nom d'une personne ; l'outil n'écrit rien dans le magasin de l'observatoire, et le sel ne s'affiche pas » |
| D7.INV-3 | `tests/export-binome.test.mjs` : « D7 : aucune enveloppe ne porte l'objet refusé, le motif d'une réponse, la clé d'une demande ni le nom d'une personne ; l'outil n'écrit rien dans le magasin de l'observatoire, et le sel ne s'affiche pas » ; « D7 : la rubrique acceptable d'un livrable et d'un journal de tests devient des enveloppes conformes au socle, datées par la rubrique, au nom et à la version du système, sans rien modifier des sources » |
