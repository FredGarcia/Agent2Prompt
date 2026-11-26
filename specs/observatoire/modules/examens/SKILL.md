---
name: examens
description: Examens indépendants de l'observatoire (format observatoire.examen/1, fichier dans observatoire/examens/, l'avis d'un observateur sur un autre modèle que celui qui a préparé le changement, avant la ratification d'une proposition ou le relâchement d'une forme propre du dépôt, et, dans une instance du binôme, avant le relâchement de sa constitution, sous constitution/examens/ ; un avis ne décide jamais, et le développeur ratifie seul). À lire pour examiner une proposition ou une version, ou pour ratifier ce qu'un examen précède.
dimensions: [D11]
status: active
---

# Module `examens` (D11)

Un examen est l'avis d'un examinateur indépendant sur un changement que le développeur décide seul : la ratification d'une proposition de l'observatoire, ou le relâchement d'une forme propre du dépôt, une constitution d'exemple avec ses méta-critères (`EVOLUTION.md`, section 10.7). Il apporte un regard extérieur au modèle qui a préparé le changement ; il ne décide jamais (D11.INV-1). Depuis la version 1.6.0, le même format sert dans les instances du binôme, où il précède le relâchement de leur constitution (Agent2Dev et Agent2Test, module `revision`).

## 1. L'examinateur

- Un observateur sur un autre modèle que celui qui a préparé le changement : dans Gemini CLI, par exemple, un sous-agent qui déclare son modèle (champ `model` de sa définition), autre que celui de la session qui a préparé la proposition ou la version.
- Il n'a pas pris part au changement. Il lit la proposition, ou le journal et le diff de la version, et les spécifications qu'ils visent ; il n'écrit que son examen, et aucun autre fichier.
- Il juge : les preuves portent-elles le changement ? Une règle de sûreté s'affaiblit-elle ? La migration dit-elle ce que les constitutions et les instances ont à faire ? Que coûterait le refus ? Il conclut par un avis, `favorable`, `reserve` ou `defavorable`.

## 2. Fichier

Un examen par objet, dans `observatoire/examens/`, à la racine du clone :

- l'examen d'une proposition porte le nom de son fichier : `observatoire/examens/2026-12-01-agent2dev-faux-refus-agent2dev-d1-inv-5.md` examine `observatoire/propositions/2026-12-01-agent2dev-faux-refus-agent2dev-d1-inv-5.md` ;
- l'examen d'une version qui relâche une forme propre s'appelle `<spécification>-<version>.md`, comme `observatoire/examens/agent2dev-1.6.0.md` ;
- dans une instance du binôme, l'examen d'une constitution vit dans le projet d'Agent2Dev ou d'Agent2Test, `constitution/examens/<version>.md`, comme `constitution/examens/2.3.0.md`, jamais dans le dépôt.

L'en-tête, entre deux lignes `---`, suit le format `observatoire.examen/1` :

| Clé | Valeur |
|---|---|
| `format` | `observatoire.examen/1` |
| `date` | le jour de l'examen, AAAA-MM-JJ |
| `objet` | `proposition`, `specification` ou `constitution` |
| `systeme`, `version` | pour l'examen d'une spécification : son nom, et la version qui porte le relâchement ; pour celui d'une constitution : son système, `agent2dev` ou `agent2test`, et la version de la constitution ; absents pour une proposition |
| `examinateur` | `observateur-externe`, un rôle |
| `modele` | le modèle de l'examinateur, en minuscules, chiffres, points et tirets ; déclaré |
| `avis` | `favorable`, `reserve` ou `defavorable` |

Toute autre clé, toute valeur hors de ces formes, refusent l'examen. Le corps commence par `## Avis`, suivi des points de l'examinateur ; comme le corps d'une proposition, il ne porte ni texte d'une instance, ni chemin, ni clé de ticket, ni nom (D11.INV-2).

```markdown
---
format: observatoire.examen/1
date: 2026-12-01
objet: proposition
examinateur: observateur-externe
modele: gemini-3-flash-preview
avis: reserve
---

## Avis

- Les faux refus viennent de deux instances, sur le même motif : la règle est trop large pour les commandes de lecture.
- Préciser l'entrée de la constitution plutôt que la retirer : la règle du noyau qu'elle applique reste entière.
```

## 3. Ce que l'examen précède

- **Ratifier une proposition** : la pull request qui inscrit `statut: ratifiee` apporte aussi son examen, du même nom. Refuser une proposition n'en demande pas : c'est le sens sûr (D11.INV-1).
- **Relâcher une forme propre** : la version qui relâche une constitution d'exemple cite à son journal son examen, `observatoire/examens/<spécification>-<version>.md`, avec ses preuves et sa migration. Le noyau du socle de l'acceptable ne se relâche jamais (`socle-acceptable:SA7.INV-2`).
- **Relâcher la constitution d'une instance** : la publication d'Agent2Dev ou d'Agent2Test exige l'examen de la version candidate, contrôle son en-tête, et l'inscrit au grand livre avec la publication qu'il permet ; l'observatoire n'en voit que l'avis, par l'export du binôme (D12).
- **Avis défavorable** : le développeur peut ratifier contre lui. Il lui répond alors, sous un titre `## Réponse à l'examen` dans le corps de la proposition, ou par « Réponse à l'examen » au journal de la version ; dans une instance, par la réponse que la publication exige, `--reponse`.

## 4. Contrôle

`observatoire.mjs verifier` et `tools/verifier.mjs` contrôlent le format de chaque examen, que l'examen d'une proposition a sa proposition, qu'une proposition ratifiée a son examen, qui la vise, et qu'un avis défavorable a sa réponse ; le vérificateur, en outre, qu'une version qui relâche une forme propre cite le sien. Un examen d'objet `constitution` est refusé dans `observatoire/examens/` : il vit dans son instance. L'observatoire n'écrit aucun examen : il ne lit que ceux qu'écrivent les examinateurs, et n'écrit dans le dépôt que des propositions (D4.INV-2).

## 5. Recette

| Invariant | Tests |
|---|---|
| D11.INV-1 | `tests/observatoire.test.mjs` : « D11 : une proposition ne se ratifie qu'avec son examen, du même nom, qui la vise ; contre un avis défavorable, elle lui répond ; un refus n'en demande pas » ; « Ligne de commande : codes de sortie ; le magasin d'épreuve seul est écrit » |
| D11.INV-2 | `tests/observatoire.test.mjs` : « D11 : un examen suit le format observatoire.examen/1 : en-tête fermé, objet et cible, examinateur, modèle et avis, corps sous ## Avis » ; « D11 : une proposition ne se ratifie qu'avec son examen, du même nom, qui la vise ; contre un avis défavorable, elle lui répond ; un refus n'en demande pas » |

Le relâchement d'une forme propre se recette dans `tools/verifier.test.mjs` : « formes propres : une constitution d'exemple relâchée cite son examen, ses preuves et sa migration ; un autre changement, sa migration ».
