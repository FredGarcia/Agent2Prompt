---
name: acceptable
description: Confrontation de l'acceptable (refus, dérogations et faux refus du binôme comptés par règle, par système et par instance ; règle déclarée infondée par des faux refus dans au moins deux instances proposée, trop large, à la spécification qui la définit ; aucun refus ne fait de retour, de récurrence ni de candidat par invariant). À lire pour comprendre ce que l'observatoire tire des refus.
dimensions: [D8]
status: active
---

# Module `acceptable` (D8)

Le troisième couplage du troisième ordre lie les systèmes à leurs valeurs (`EVOLUTION.md`, section 10) : ce que chacun refuse vient du noyau du socle de l'acceptable, commun, et de sa constitution, propre, et chaque refus cite sa règle. Une règle trop large refuse ce qu'elle ne visait pas : celui qui la subit le déclare par un faux refus, mais seulement dans son instance, où l'action reste refusée. L'observatoire ferme cette boucle : il confronte les refus d'une instance à l'autre, par la règle qu'ils citent, et fait remonter jusqu'à la spécification qui la définit une règle que plusieurs instances déclarent infondée.

## 1. Enveloppes de l'acceptable

- Un refus est une enveloppe de type `refus`. Une réponse à un refus vise l'enveloppe de son refus (`decision.vise`) : une dérogation, de type `derogation`, ou un faux refus, de type `decision` et de valeur `refusee` (socle d'observation, section 6.5).
- Une décision vise une enveloppe du journal de son propre système, où les numéros recommencent à 1 ; une réponse compte sous la règle du refus qu'elle vise.
- Les enveloppes de l'acceptable n'ont pas de profondeur : elles ne font ni retour ni récurrence (module `confrontation`) ; une réponse à un refus n'est pas un écart, et ne compte pas parmi ceux d'un invariant (module `systemes`) (D8.INV-1).

## 2. Par règle

Pour chaque règle qu'un refus cite, `confronter` rend le nombre de refus, de dérogations et de faux refus, les systèmes qui les ont produits et le nombre d'instances où ils ont paru (D8.INV-1) : la fréquence de la règle, par système et par instance. Un refus sans faux refus, c'est la règle qui joue ; seule sa fréquence est rendue. Des dérogations répétées sur une règle propre déclarée dérogeable se lisent ici, sans faire de proposition.

## 3. Règle trop large

Une règle que le dépôt définit, déclarée infondée par des faux refus dans au moins deux instances distinctes, fait un candidat de sorte `faux-refus` : une règle trop large (D8.INV-2). Il va à la spécification qui définit la règle, celle de son préfixe, à sa version courante : le socle de l'acceptable pour une règle `SA`, Agent2Dev ou Agent2Test pour une règle de leur constitution. Il porte :

- `systeme` : la spécification qui définit la règle ; `versions` : sa version courante ;
- `motif` : `faux-refus-` suivi de la règle, en minuscules et tirets (`faux-refus-socle-acceptable-sa1-inv-1`) ; aucune profondeur ;
- `invariant` et `systemes` : la règle, et les systèmes dont les faux refus la citent ;
- le nombre d'instances et de faux refus, et les références tronquées des faux refus, `<8 caractères de l'instance>:<système>:<numéro>`.

Des faux refus d'une seule instance ne font que se compter : son référent les lit dans sa vue de gouvernance. `confronter` liste les candidats par faux refus après les autres ; `proposer` les écrit comme eux (module `propositions`).

La ratification décide de ce qui change, dans une version de la spécification visée et selon son contrat : une règle de sûreté ne s'affaiblit jamais, et aucune entrée du noyau ne se retire (`socle-acceptable:SA7.INV-2`). La réponse à une règle trop large est donc une précision de la règle, ou de l'entrée de constitution qui l'applique, un chemin par un kit, selon le contrat que le socle en décrit depuis sa version 1.1.0, ou le refus de la proposition. La révision du noyau suit `EVOLUTION.md`, section 10.7 : elle ne fait qu'y ajouter. Une proposition par faux refus ne se ratifie qu'avec son examen indépendant (module `examens`), et la version qui précise une entrée de constitution, si elle la relâche, cite le sien.

## 4. Effet

L'effet d'une proposition par faux refus ratifiée se mesure comme celui des autres (module `suivi`), sur les enveloppes de la spécification qui définit la règle : le motif y est celui des faux refus qui la citent. Le socle de l'acceptable n'exporte pas, et les enveloppes du binôme ne portent pas sa version : l'effet d'une proposition sur une règle du noyau reste indécidable, et se lit dans les faux refus du binôme, par règle.

## 5. Recette

| Invariant | Tests |
|---|---|
| D8.INV-1 | `tests/observatoire.test.mjs` : « D8 : les refus se confrontent par règle : refus, dérogations et faux refus comptés par système et par instance ; aucun ne fait de retour, de récurrence ni de candidat par invariant » ; « D2 : une décision vise une enveloppe du journal de son propre système : la décision d'un système ne retient pas la proposition d'un autre » ; « D8 : une règle déclarée infondée par des faux refus dans deux instances est proposée, trop large, à la spécification qui la définit ; des faux refus d'une seule instance ne font que se compter » |
| D8.INV-2 | `tests/observatoire.test.mjs` : « D8 : une règle déclarée infondée par des faux refus dans deux instances est proposée, trop large, à la spécification qui la définit ; des faux refus d'une seule instance ne font que se compter » ; « D8 : les refus se confrontent par règle : refus, dérogations et faux refus comptés par système et par instance ; aucun ne fait de retour, de récurrence ni de candidat par invariant » |
