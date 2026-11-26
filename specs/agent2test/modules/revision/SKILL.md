---
name: revision
description: La révision de la constitution d'Agent2Test dans l'instance (D28) : la publication, commande humaine npm run constitution:publier, compare la constitution à la dernière publiée, que le grand livre porte entière, et la classe, première, neutre, renforcement ou relâchement ; ce qui ne relâche rien se publie seul ; un relâchement exige l'examen d'un observateur sur un autre modèle, constitution/examens/<version>.md au format observatoire.examen/1, une réponse s'il est défavorable, et ses preuves, faux refus vérifiés ou incident déclaré ; entrées constitution.examinee et constitution.publiee au grand livre ; rubrique revisions du journal de tests. À lire pour implémenter la publication de la constitution.
dimensions: [D28]
status: active
---

# Module `revision` (D28)

La constitution est le point fixe d'Agent2Test (module `noyau`, section 5) : au démarrage, son empreinte doit être celle inscrite au grand livre. Ce module porte dans l'instance la révision des formes propres d'`EVOLUTION.md`, section 10.7, comme le module `revision` d'Agent2Dev : la constitution de l'instance, sa forme propre, dérivée de la constitution d'exemple, ne change que par sa publication, commande humaine, qui en connaît désormais le sens. Ce qui la renforce, ou ne change rien de ce qu'elle refuse, se publie seul ; ce qui la relâche ne se publie qu'avec l'avis consigné d'un examinateur indépendant et ses preuves. Le module n'ajoute aucun agent : la commande reste hors du bus, et aucun agent ne l'appelle (D1.INV-4).

## 1. Classer (D28.INV-1)

`npm run constitution:publier` lit `constitution/constitution.json`, applique d'abord le contrôle de l'acceptable du démarrage (module `acceptable`, section 1) : une constitution qui ne démarrerait pas ne se publie pas, et une entrée du noyau du socle de l'acceptable ne se relâche jamais, même examinée. Puis la commande compare la candidate à la dernière constitution publiée, que l'entrée `constitution.publiee` la plus récente du grand livre porte entière, en JSON canonique, depuis la version 1.7.0 :

- sans aucune entrée `constitution.publiee`, la candidate fonde l'instance : elle se publie seule, de sens `premiere` ;
- si les entrées `constitution.publiee` sont toutes antérieures à 1.7.0, sans constitution entière, la candidate doit être la constitution en vigueur, à la même empreinte : elle se republie telle quelle, de sens `premiere`, et le grand livre la porte désormais entière ; une candidate changée est refusée, « republier d'abord la constitution en vigueur, telle quelle » ;
- une candidate identique à la dernière publiée ne se republie pas : la commande le dit, et n'écrit rien ;
- une candidate changée porte une version plus grande que celle de la dernière publiée, son examen se nommant par elle ; sinon elle est refusée.

La candidate changée se classe selon la table d'`EVOLUTION.md`, section 10.7, pour les constitutions du binôme. Une entrée d'une liste, `intentionsRefusees`, `programmesInterdits`, `argumentsInterdits`, `ecrituresInterdites`, `secrets` ou `leconsInterdites`, se reconnaît à sa valeur, l'intention, le programme, l'argument, le lieu ou le motif, et à sa règle : une entrée dont la règle change est retirée, puis ajoutée.

| Ce qui relâche | Ce qui renforce |
|---|---|
| une entrée d'une liste retirée ou modifiée | une entrée ajoutée à une liste |
| une entrée rendue permise dans un kit, `horsKit` ajouté, ou rendue dérogeable, `derogeable` ajouté | une entrée qui perd `horsKit` ou `derogeable` |
| un point de contrôle retiré de `pointsDeControle`, un invariant retiré d'`invariants` | un point de contrôle ou un invariant ajouté |
| une règle modifiable ajoutée, ou ses bornes élargies | une règle modifiable retirée, ou ses bornes resserrées |
| un méta-critère changé | |

Chaque changement de la table compte pour un relâchement ou pour un renforcement, nommé. La candidate est de sens `relachement` dès un relâchement ; sinon `renforcement` dès un renforcement ; sinon `neutre` : sa version ou l'épinglage du socle de l'acceptable seulement. Ce qui ne relâche rien se publie seul, sans examen ni preuve.

## 2. Un relâchement : examen et preuves (D28.INV-2)

Un relâchement ne se publie qu'avec son examen, une réponse si l'examen est défavorable, et ses preuves. Sans l'un d'eux, la publication est refusée : la commande dit ce qui manque, relâchement par relâchement, et n'écrit rien ; la constitution reste non publiée, et le démarrage la refuse.

**Examen.** Le fichier `constitution/examens/<version>.md`, de la version candidate, au format fermé des examens de l'observatoire, `observatoire.examen/1` (spécification `observatoire`, module `examens`), d'objet `constitution` :

```text
---
format: observatoire.examen/1
date: 2026-11-26
objet: constitution
systeme: agent2test
version: 2.3.0
examinateur: observateur-externe
modele: gemini-3-flash-preview
avis: favorable
---

## Avis

Le retrait de l'intention hors-test s'appuie sur deux faux refus de vérifications d'écran légitimes ; la garde de périmètre garde l'intention modifier-du-code.
```

- L'examinateur est un observateur sur un autre modèle que celui qui a préparé la constitution, qui n'y a pas pris part ; il n'écrit que ce fichier, son avis sous `## Avis`. Agent2Test n'en écrit aucun : `constitution/` est interdit en écriture à ses agents, et son moteur n'examine jamais. Le modèle se déclare, sans se prouver.
- La commande contrôle l'en-tête, fermé : rien d'autre que ces clés, l'objet `constitution`, le système `agent2test`, la version candidate, l'examinateur `observateur-externe`, un modèle, un avis de la liste, `favorable`, `reserve` ou `defavorable` ; et un corps sous `## Avis`. Un examen absent, mal formé, ou d'une autre version, est refusé.
- Un avis ne décide jamais. Contre un avis `defavorable`, la publication exige une réponse, `--reponse <texte>`, que l'entrée `constitution.publiee` inscrit.
- Un examen n'est demandé, et n'est inscrit, que pour un relâchement ; celui d'un renforcement ou d'un changement neutre est ignoré.

**Preuves.** Pour chaque entrée relâchée d'une liste, au moins deux faux refus, lignes `acceptable.faux-refus` distinctes du journal de l'instance, dont chacune répond à un refus que cette entrée, même valeur, même règle, a arrêté (module `acceptable`, section 4), cités par leur numéro, `--preuves 815,948` ; la commande vérifie chaque ligne citée, et qu'elle couvre chaque entrée relâchée. Pour un point de contrôle ou un invariant retiré, une règle modifiable ajoutée, des bornes élargies ou un méta-critère changé, qu'aucun refus ne cite, un incident déclaré, `--incident <texte>`, que l'entrée inscrit tel quel ; un incident vaut aussi pour une entrée de liste, à défaut de faux refus.

## 3. Grand livre (D28.INV-2)

La commande inscrit au grand livre du `referentiel` (module `referentiel`, section 5), en ajout seul et chaîné :

- `constitution.examinee`, pour un relâchement : la version et l'empreinte de la constitution examinée, le chemin et l'empreinte du fichier d'examen, l'examinateur, son modèle et son avis ;
- `constitution.publiee` : la version, l'empreinte et la constitution entière, en JSON canonique, son sens, ses relâchements et ses renforcements, chacun nommé, et, pour un relâchement, la réponse à un avis défavorable et ses preuves, numéros des faux refus ou incident.

L'examen et la publication s'inscrivent ensemble, l'examen d'abord, dans une seule transaction, ou rien. Au démarrage, le noyau compare toujours l'empreinte de la constitution à la dernière entrée `constitution.publiee` (D1.INV-4).

## 4. Journal de tests (D28.INV-3)

Le journal de tests `agent2test.journal-de-tests/1` porte une rubrique facultative `revisions`, présente dès que le grand livre porte une publication classée, depuis 1.7.0 : toutes les entrées `constitution.examinee` et `constitution.publiee` du grand livre de l'instance, de la première à la dernière inscrite quand le journal de tests est projeté, dans leur ordre. Les publications antérieures à 1.7.0, sans sens, n'y paraissent pas.

```json
{ "revisions": [
    { "n": 31, "date": "2026-11-26T09:00:00Z", "type": "constitution.publiee", "version": "2.1.1", "empreinte": "<sha256>", "sens": "premiere", "relachements": 0, "renforcements": 0 },
    { "n": 32, "date": "2026-11-26T09:30:00Z", "type": "constitution.publiee", "version": "2.2.0", "empreinte": "<sha256>", "sens": "renforcement", "relachements": 0, "renforcements": 1 },
    { "n": 35, "date": "2026-11-26T10:00:00Z", "type": "constitution.examinee", "version": "2.3.0", "empreinte": "<sha256>", "avis": "favorable" },
    { "n": 36, "date": "2026-11-26T10:00:00Z", "type": "constitution.publiee", "version": "2.3.0", "empreinte": "<sha256>", "sens": "relachement", "relachements": 1, "renforcements": 0 }
] }
```

Chaque entrée porte le numéro `n` et la date de son entrée au grand livre, à la seconde, en UTC, son type, la version et l'empreinte de la constitution ; une publication, son sens et ses relâchements et renforcements comptés, un examen, son avis. Un examen précède toujours, de la même empreinte, la publication en relâchement qu'il a permise. Ni la constitution, ni le fichier d'examen, ni la réponse, ni les preuves n'y paraissent. Le format garde son nom : la rubrique est facultative, et `lire-acceptation.mjs` d'agent-tdd-jira ne la lit pas. Elle est la source de l'export des révisions, que porte l'observatoire (socle d'observation, section 6.8) : chaque entrée y fait une enveloppe, une seule fois, quel que soit le nombre de journaux de tests qui la portent.

## 5. Pièges connus

- **Relâcher sous la même version** : non ; une candidate changée porte une version nouvelle, que son examen nomme.
- **Laisser le moteur examiner** : non ; l'examinateur est extérieur à Agent2Test et au modèle qui a préparé la constitution, et n'écrit que son avis.
- **Prouver par une autre entrée de même règle** : non ; chaque faux refus répond à un refus de l'entrée relâchée elle-même : `hors-test` ne se prouve pas par des refus de `modifier-du-code`.
- **Inscrire l'examen sans la publication** : non ; tout ou rien, dans une seule transaction.
- **Classer contre la constitution d'exemple** : non ; la référence est la dernière constitution publiée de l'instance.

## 6. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| RV1 | D28.INV-1 | une instance 1.6.2 republie sa constitution en vigueur, telle quelle : `constitution.publiee` de sens `premiere`, la constitution entière en JSON canonique ; une candidate changée, avant cette republication, est refusée ; le démarrage accepte la constitution republiée |
| RV2 | D28.INV-1 | republiée telle quelle, « rien à publier », aucune entrée ; la version 2.1.2, sans autre changement, se publie seule, de sens `neutre` |
| RV3 | D28.INV-1 | le programme `psql` ajouté aux programmes interdits, version 2.2.0 : sens `renforcement`, un renforcement, publié sans examen ni preuve ; la même constitution, sous la version 2.1.2, est refusée, version non nouvelle |
| RV4 | D28.INV-2 | l'intention `hors-test` retirée, version 2.3.0, sans examen ni preuve : refus, qui nomme l'examen attendu, `constitution/examens/2.3.0.md`, et les preuves de l'entrée `hors-test (D1.INV-5)` ; rien n'est inscrit, et le démarrage refuse la constitution non publiée |
| RV5 | D28.INV-2 | le même retrait, avec un examen `favorable` et deux faux refus de demandes refusées par l'entrée `hors-test`, déclarés par le testeur ou le référent qualité : `constitution.examinee`, puis `constitution.publiee`, de sens `relachement`, un relâchement, les deux numéros cités ; le démarrage accepte la nouvelle empreinte |
| RV6 | D28.INV-2 | un examen `defavorable` sans `--reponse` est refusé, puis accepté avec la réponse, inscrite ; un examen du système `agent2dev`, d'une autre version, ou sans corps sous `## Avis`, est refusé |
| RV7 | D28.INV-2 | des faux refus de l'entrée `modifier-du-code`, ou un seul faux refus de `hors-test`, ne prouvent pas le retrait de `hors-test` ; les bornes de `budget.reessaiEtape` élargies à 3 exigent un incident, et passent avec lui ; le point de contrôle `CP-5` retiré exige un incident ; l'entrée du noyau `docker` retirée est refusée, même examinée et prouvée |
| RV8 | D28.INV-3 | le journal de tests porte la rubrique `revisions`, les entrées inscrites de RV1 à RV5, dans l'ordre du grand livre, sans la constitution, l'examen, la réponse ni les preuves ; `lire-acceptation.mjs` lit le journal de tests comme avant ; l'outil d'export de l'observatoire le traduit sans erreur, une enveloppe par entrée |

## 7. Fichiers à produire

- `src/noyau/revision.js` : comparaison, classement, contrôle de l'examen et des preuves
- `scripts/publier-constitution.js`, qui classe et inscrit l'examen et la publication
- la rubrique `revisions` dans `schemas/journal-de-tests.json`
- `test/revision/*.test.js`, avec des constitutions, des examens et des journaux d'essai dans `test/fixtures/revision/`
