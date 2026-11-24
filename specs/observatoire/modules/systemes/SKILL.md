---
name: systemes
description: Confrontation entre systèmes (un même invariant du dépôt, cité par des écarts ou des dérogations de deux systèmes ou de deux instances, proposé à la spécification qui le définit ; un même écart compté une fois, désigné par son instance et son ticket ; références qui nomment le système de chaque enveloppe). À lire pour comprendre ce que l'observatoire confronte d'un système à l'autre.
dimensions: [D6]
status: active
---

# Module `systemes` (D6)

Deux systèmes ne parlent pas la même langue : le générateur de skills de ticket relève ses motifs dans le champ de ses arbres, l'orchestrateur C7E dans ses registres, et un motif de l'un n'a pas d'équivalent chez l'autre. Mais leurs écarts citent les mêmes invariants : un désaccord entre nœuds du générateur porte l'invariant `orchestrateur-c7e:D6.INV-3`, et une ligne du registre des écarts de l'orchestrateur porte l'invariant qu'elle concerne, quand le dépôt le définit. C'est par eux que l'observatoire confronte les systèmes : ce qui fait de lui un milieu entre systèmes, et non seulement entre instances d'un même système (`EVOLUTION.md`, section 10.3).

## 1. Écarts

- Une enveloppe compte quand elle est un écart ou une dérogation, de type `ecart` ou `derogation`, et qu'elle porte un invariant que le dépôt définit : un invariant `**Dn.INV-k**`, `**SCn.INV-k**` ou `**SOn.INV-k**` du point d'entrée d'une de ses spécifications, préfixé par le nom de celle-ci, d'un système ou d'une version que le dépôt connaît (module `releve`). Un invariant que le dépôt ne définit pas, venu d'un système plus récent que le clone, ne fait pas de candidat (D6.INV-1).
- Un écart se désigne par son instance et son ticket : l'ancre de l'enveloppe quand c'est un ticket, comme pour une ligne du registre des écarts de l'orchestrateur ; sinon son journal source, qui pour le champ d'observation du générateur est le ticket, par l'empreinte salée de sa clé. Les deux systèmes d'une instance partagent son sel : le même ticket a la même empreinte dans leurs deux journaux.
- Le même écart peut donc venir de deux systèmes : le générateur le constate dans le champ, l'orchestrateur exporte la ligne où le développeur l'a décidé. Il ne compte qu'une fois. Une enveloppe sans ticket désigne son propre écart, par sa source.

## 2. Candidat par invariant

Un invariant fait un candidat, de sorte `invariant`, quand ses écarts distincts sont au moins deux et viennent de deux instances, ou de deux systèmes (D6.INV-1). Un système seul, dans une seule instance, n'en fait pas, même sur plusieurs tickets : c'est l'affaire de son propre registre.

Le candidat va à la spécification qui définit l'invariant, celle de son préfixe, à sa version courante dans le dépôt : c'est sa règle qui est en cause, quel que soit le système qui l'a vue manquer (D6.INV-2). Il porte :

- `systeme` : la spécification qui définit l'invariant ; `versions` : sa version courante ;
- `motif` : `ecart-` suivi de l'invariant, en minuscules et tirets (`ecart-orchestrateur-c7e-d6-inv-3`) ; aucune profondeur ;
- `invariant` et `systemes` : l'invariant, et les systèmes dont les écarts le citent ;
- le nombre d'instances, d'écarts distincts et d'enveloppes ;
- les références tronquées de ses enveloppes, `<8 caractères de l'instance>:<système>:<numéro>` : chaque système tient son journal, où les numéros recommencent à 1, et le système dit dans quel miroir chercher.

`confronter` liste ces candidats après les retours et les récurrences ; `proposer` les écrit comme les autres (module `propositions`). Un candidat par invariant ne se confond avec aucun retour ni aucune récurrence, même de même système et de même motif.

## 3. Effet

L'effet d'une proposition par invariant ratifiée se mesure comme celui des autres (module `suivi`), sur les enveloppes de la spécification qui définit l'invariant, quand elle exporte : le motif y est celui des écarts et des dérogations qui citent l'invariant. Une spécification qui n'exporte pas, comme un référentiel de la pile, laisse l'effet indécidable : il faut alors lire les écarts des systèmes qui l'appliquent.

## 4. Recette

| Invariant | Tests |
|---|---|
| D6.INV-1 | `tests/observatoire.test.mjs` : « D6 : un même invariant du dépôt, relevé par des écarts distincts de deux systèmes, ou dans deux instances, est un candidat ; un même écart ne compte qu'une fois » ; « D1 : les journaux de chaque système d'une instance se relèvent, chacun dans son miroir ; une instance aux journaux de sels différents n'est pas inscrite » |
| D6.INV-2 | `tests/observatoire.test.mjs` : « D6 : un candidat par invariant se propose à la spécification qui le définit, avec les systèmes qui l'ont relevé, et ses références nomment le système de chaque enveloppe » ; « D6 : un même invariant du dépôt, relevé par des écarts distincts de deux systèmes, ou dans deux instances, est un candidat ; un même écart ne compte qu'une fois » |
