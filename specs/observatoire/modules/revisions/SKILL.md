---
name: revisions
description: Confrontation des révisions (D12) : examens et publications de la constitution d'Agent2Dev et d'Agent2Test, entrées de leur grand livre exportées par la rubrique revisions, reliées par l'ancre de la constitution ; comptés par système, publications par sens, entrées relâchées lues dans la mesure de chaque publication, examens par avis, avec leurs instances ; aucun retour, aucune récurrence, aucun candidat. À lire pour lire les révisions que rend confronter.
dimensions: [D12]
status: active
---

# Module `revisions` (D12)

La constitution d'une instance du binôme est sa forme propre : elle ne change que par sa publication, commande humaine, qui la classe, et un relâchement n'y passe qu'avec l'examen d'un observateur sur un autre modèle et ses preuves (`EVOLUTION.md`, section 10.7 ; Agent2Dev et Agent2Test, module `revision`, D28). Chaque examen et chaque publication s'inscrivent au grand livre de l'instance, et sortent, depuis la version 1.6.0, par l'export du binôme (module `export-binome` ; socle d'observation, section 6.8). Ce module dit ce que l'observatoire en fait : des comptes, qui rendent observable, d'une instance à l'autre, la dérive de la forme propre que la révision gouverne.

## 1. Enveloppes des révisions

- Une publication est une observation du référent, sujet `referent`, au niveau `humain`, de motif `revision-constitution`, de nature son sens, `premiere`, `neutre`, `renforcement` ou `relachement`, avec la mesure `relachements`, le nombre de ses relâchements.
- Un examen est une observation de l'observateur extérieur, sujet `observateur-externe`, au niveau `N3`, de même motif, de nature son avis, `favorable`, `reserve` ou `defavorable` ; il précède, de la même ancre, la publication en relâchement qu'il a permise.
- L'ancre est la constitution, par l'empreinte salée de son empreinte ; la source, le grand livre de l'instance, par sa référence salée, et le numéro de l'entrée : une révision que portent plusieurs livrables ou journaux de tests ne s'exporte qu'une fois.
- Sans profondeur ni invariant, et de cible `instance`, une enveloppe de révision ne fait ni retour, ni récurrence (module `confrontation`), ni écart (module `systemes`), ni refus (module `acceptable`) ; un relâchement examiné est une décision du développeur, que l'observatoire compte sans la juger (D12.INV-1).

## 2. Comptes

Pour chaque système, `confronter` rend, dans sa rubrique `revisions` :

| Compte | Ce qu'il compte |
|---|---|
| `publications` | les publications de la constitution |
| `premieres`, `neutres`, `renforcements`, `relachements` | les publications, selon leur sens |
| `entreesRelachees` | les relâchements des publications, lus dans leur mesure |
| `examens` | les examens |
| `favorables`, `reserves`, `defavorables` | les examens, selon leur avis |
| `instances` | le nombre d'instances où une révision a paru |

La ligne de commande les écrit sous le titre « révisions des constitutions : des comptes, sans candidat », une ligne par système ; `--json` rend la rubrique telle quelle.

## 3. Lecture et limites

- Les comptes se lisent ensemble : des relâchements sans renforcement, d'une instance à l'autre, disent une constitution d'exemple trop stricte, ou une gouvernance trop lâche ; des examens défavorables suivis de publications, des réponses que le développeur a données.
- L'examen et ses preuves restent dans l'instance : l'observatoire n'en voit que l'avis, ni la version de la constitution, ni le fichier d'examen, ni la réponse, ni les faux refus cités, ni l'incident.
- Le modèle de l'examinateur se déclare sans se prouver, dans l'instance comme dans le dépôt (point d'extension E2).
- Aucune proposition : une révision ne cite aucune règle, et la confrontation des révisions ne fait aucun candidat. Une proposition sur les révisions, par exemple une constitution d'exemple que plusieurs instances relâchent de la même façon, attendra des données réelles (point d'extension E5).

## 4. Recette

| Invariant | Tests |
|---|---|
| D12.INV-1 | `tests/observatoire.test.mjs` : « D12 : les révisions des constitutions se comptent par système : publications par sens, entrées relâchées, examens par avis, et instances ; aucun candidat » ; `tests/export-binome.test.mjs` : « D7 : la rubrique revisions du binôme devient des enveloppes : l'examen, de l'observateur extérieur, puis la publication, du référent, avec ses relâchements comptés, reliés par l'ancre de la constitution ; une fois chacune, quelles que soient les sources ; rien en clair » |
