---
name: reflexif
description: Réflexivité de second ordre (effet mesuré de chaque leçon et de chaque règle adoptée sur le taux d'acceptation de son point, suspension autonome de ce qui le dégrade au-delà de la marge, jamais d'adoption ni d'élargissement, échappements mesurés par fiche et par moteur à partir des défauts confirmés par Agent2Test, dérives qui contourneraient la méthode, accord entre contrôles nommés et décisions humaines, propositions de recalibrage bornées et complètes, lecture seule du premier ordre, observation du reflexif lui-même). À implémenter au lot 7.
dimensions: [D16]
status: active
---

# Module `reflexif` (D16)

Le second ordre répond à la question : les manières de rédiger et d'apprendre d'Agent2Dev sont-elles justes ? Le `reflexif` mesure, propose et peut suspendre ; il n'adopte jamais rien seul. Agent2Test, extérieur au système, lui fournit sa mesure la plus sûre : les défauts qu'il confirme après une acceptation V4.

## 1. Mesures

| Objet observé | Mesure |
|---|---|
| chaque leçon et chaque règle adoptée | effet sur le taux d'acceptation de son point, avant et après adoption |
| chaque fiche, par version et par moteur | taux d'acceptation au premier passage (V2, V3, V4, V5) ; taux d'échappements (section 3) |
| contrôles nommés | accord avec la décision humaine : un contrôle qui passe quand le développeur corrige, ou qui refuse ce que le développeur aurait accepté, est déclaré mal calibré |
| dérives de méthode | rouges non valables, tentatives refusées par `vert.sans-test` et `realisation.tests-non-affaiblis`, lignes par pas et fichiers par scénario (section 4) |
| le `reflexif` lui-même | part de ses suspensions confirmées ou levées par le référent ; part de ses propositions ratifiées ; effets mesurés après adoption |

Le taux d'acceptation d'un point, pour une fiche et un moteur, est la part des décisions qui valident sans correction ni ajustement. Méta-critères, fixés par la constitution : une mesure n'est produite qu'à partir de 3 expositions, sur une fenêtre de 10 décisions ; la marge est de 15 points de taux.

## 2. Suspension autonome (D16.INV-1)

- Quand une leçon ou une règle active fait baisser le taux d'acceptation de son point de plus de la marge, sur la fenêtre et après l'exposition minimale, le `reflexif` demande `referentiel.revenir(element)` : la leçon est suspendue, ou la règle revient à sa dernière valeur ratifiée. Le grand livre l'inscrit avec son motif et ses mesures, et l'effet vaut à partir de la demande suivante (D17.INV-1).
- C'est la seule évolution que le système fasse seul, parce qu'elle va dans le sens sûr. Il n'adopte aucune règle nouvelle, n'élargit aucune borne, n'active aucune leçon et ne touche à aucun point de validation.
- Le référent voit chaque suspension dans la vue gouvernance ; la lever est une ratification, en CP-4.

## 3. Échappements (D16.INV-2)

- Un échappement est un défaut applicatif qu'Agent2Test confirme, d'après la sortie de `lire-acceptation.mjs`, sur un scénario déjà accepté à V4.
- Il est imputé aux fiches qui ont produit les tests et le code du scénario (`rouge`, `vert`, `remanie`, et `contrat` s'il y a lieu), à leur version et à leur moteur.
- Le taux d'échappements se mesure par fiche et par moteur, sur la fenêtre ; une hausse au-delà de la marge lève `alerte.echappements` au référent, avec les scénarios et les campagnes en cause.

## 4. Dérives de méthode (D16.INV-3)

Un système qui apprend à passer ses points peut apprendre à contourner la méthode. Les invariants D9.INV-2 et D9.INV-4 et les contrôles nommés les bloquent déjà ; le `reflexif` en mesure les tentatives, par fiche et par moteur :

| Dérive | Mesure |
|---|---|
| rouge pour une mauvaise raison | part des rouges de nature `compilation` ou `erreur`, contre-épreuves |
| tests retouchés au vert | refus de `vert.sans-test` |
| tests affaiblis | refus de `realisation.tests-non-affaiblis` |
| pas qui grossissent | lignes par pas et fichiers par scénario, p50 et p95 |

Une hausse au-delà de la marge lève `alerte.derive` au référent, avec la mesure et ses preuves (références au journal).

## 5. Propositions

```json
{
  "id": "PR-3",
  "regle": "taille.lignesParPas",
  "echelle": "Pas",
  "phase": "E3",
  "valeurActuelle": 200,
  "valeurProposee": 150,
  "preuves": ["journal:20411", "journal:20877"],
  "effetAttendu": "des pas plus petits, là où les échappements suivent des verts de plus de 150 lignes",
  "bornes": { "min": 20, "max": 1000 }
}
```

- Une proposition nomme la règle, l'échelle et la phase touchées, la valeur actuelle, la valeur proposée, ses preuves et l'effet attendu.
- Elle ne vise qu'une règle de la liste fermée, dans ses bornes (D17.INV-3). Sinon, elle n'est pas émise.
- Elle part au tableau de bord, vue gouvernance, par l'événement `proposition.recalibrage`, et attend CP-4 (D17.INV-4).

## 6. Lecture seule du premier ordre

Le `reflexif` lit le journal, les mesures de l'`observateur` et les décisions ; il n'écrit que ses propres données. Son contrat ne déclare aucune action d'écriture vers le `journal`, hors ses événements, ni vers l'`observateur`, l'`orchestrateur` ou un agent d'étape.

## 7. Actions et événements

| Action | Rôle |
|---|---|
| `bilan(filtre)` | effets, taux, échappements, dérives, accord des contrôles, propositions |

Événements : `proposition.recalibrage`, `suspension`, `alerte.echappements`, `alerte.derive`.

## 8. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| RX1 | D16.INV-1 | après 3 expositions, une leçon qui fait baisser l'acceptation à V4 de 20 points sur la fenêtre est suspendue seule, avec son motif au grand livre ; avant 3 expositions, rien n'est mesuré |
| RX2 | D16.INV-1 | une leçon suspendue sort de la fiche composée à la demande suivante ; la demande en cours garde son instantané |
| RX3 | D16.INV-1 | aucune action du `reflexif` n'adopte une règle, n'élargit une borne, n'active une leçon ni ne modifie un point (contrat et analyse des appels) |
| RX4 | D16.INV-2 | un défaut confirmé sur un scénario accepté à V4 compte comme échappement pour `rouge`, `vert` et `remanie` et leur moteur ; leur hausse lève `alerte.echappements` |
| RX5 | D16.INV-3 | des lignes par pas en hausse et des refus répétés de `vert.sans-test` lèvent `alerte.derive`, avec leurs preuves |
| RX6 | D16.INV-3 | le contrat du `reflexif` ne déclare aucune écriture vers le `journal`, l'`observateur` ou l'`orchestrateur` |
| RX7 | D17.INV-3 | une proposition hors bornes n'est pas émise ; une proposition émise porte tous ses champs |

## 9. Fichiers à produire

- `src/agents/reflexif/agent.js`, `src/agents/reflexif/effets.js`, `src/agents/reflexif/echappements.js`
- `src/agents/reflexif/derives.js`, `src/agents/reflexif/accord.js`, `src/agents/reflexif/propositions.js`
- `test/reflexif/*.test.js`
