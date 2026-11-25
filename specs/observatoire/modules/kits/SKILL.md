---
name: kits
description: Confrontation des kits du binôme (D9) : les étapes d'un kit, remise, validation, application ou échec, retour arrière, reconnues à l'ancre de leur kit ; comptées par système et par environnement, kits en attente d'application et kits test sans nettoyage déclaré compris, avec leurs instances ; aucun retour, aucune récurrence, aucun candidat. À lire pour lire les comptes des kits que rend confronter.
dimensions: [D9]
status: active
---

# Module `kits` (D9)

Le binôme remet des kits, qu'une fabrication de l'hôte applique après la validation d'un humain (socle de l'acceptable, section 11) : Agent2Dev le kit dev d'un scénario, Agent2Test le kit test d'une campagne. L'export du binôme en traduit chaque étape (module `export-binome` ; socle d'observation, section 6.6). Ce module dit ce que l'observatoire en fait : des comptes, sans proposition.

## 1. Enveloppes des kits

- Une enveloppe de kit porte l'ancre de nature `kit`, l'empreinte salée de l'empreinte de son patch, et le motif `kit-` suivi de l'environnement, `kit-dev` ou `kit-test`. Les étapes d'un même kit, d'un même système et d'une même instance, partagent cette ancre : la remise, de nature `remis` ; la validation, une décision de nature `validation` et de valeur `retenue`, qui vise la remise ; l'application, de nature `applique` ou `echec` ; le retour arrière, de nature `retour-arriere`.
- Sans profondeur ni invariant, et de cible `instance`, une enveloppe de kit ne fait ni retour ni récurrence (module `confrontation`), ni écart (module `systemes`), ni refus (module `acceptable`) ; une validation, qui vise une remise et non une proposition, ne retient rien (D9.INV-1).

## 2. Comptes

Pour chaque système et chaque environnement, `confronter` rend, dans sa rubrique `kits` :

| Compte | Ce qu'il compte |
|---|---|
| `remis` | les kits dont la remise a paru |
| `valides` | les kits validés |
| `appliques` | les kits appliqués, déclarés réussis |
| `echecs` | les kits en échec ; un échec comprend le retour arrière que la fabrication a fait |
| `retoursArriere` | les kits appliqués, puis défaits |
| `enAttente` | les kits validés, ni appliqués ni en échec |
| `nonNettoyes` | les kits test appliqués dont le nettoyage n'a pas été déclaré |
| `instances` | le nombre d'instances où ces kits ont paru |

Un kit se compte une fois, par son ancre, quel que soit le nombre de ses étapes (D9.INV-1). Un kit en attente, ou un kit test non nettoyé, peut n'être qu'en cours : les comptes disent où en est chaque instance, ils ne jugent pas.

## 3. Aucune proposition

Un kit ne cite aucune règle, et un échec n'a pas d'objet à proposer à une spécification : la confrontation des kits ne fait aucun candidat, et `proposer` n'écrit rien pour eux (plan du jalon J3e, décision Y2). Le référent lit les comptes, instance après instance. Une proposition sur les kits attendra des données réelles, quand le binôme sera construit, et une version de cette spécification.

## 4. Recette

| Invariant | Tests |
|---|---|
| D9.INV-1 | `tests/observatoire.test.mjs` : « D9 : les kits se comptent par système et par environnement, remis, validés, appliqués, en échec, défaits, en attente, sans nettoyage, avec leurs instances ; aucun ne fait de retour, de récurrence ni de candidat » ; `tests/export-binome.test.mjs` : « D7 : la rubrique kits devient des enveloppes : remise, validation qui vise la remise, application ou échec, retour arrière, reliées par l'ancre du kit ; un échec, une seule enveloppe ; refus et étapes d'une même source dans l'ordre de leur numéro » |
