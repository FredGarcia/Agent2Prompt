---
name: reflexif
description: Réflexivité de second ordre (accord entre contrôles automatiques et décisions humaines par fiche, version et moteur, précision des alertes du premier ordre, suspension autonome d'une leçon ou d'un recalibrage qui dégrade la mesure, garde anti-Goodhart sur les causes reclassées, propositions de recalibrage bornées et complètes, lecture seule du premier ordre, observation du reflexif lui-même). À implémenter au lot 6.
dimensions: [D14]
status: active
---

# Module `reflexif` (D14)

Le second ordre répond à la question : les manières de juger et d'apprendre du système sont-elles justes ? Le `reflexif` mesure, propose et peut revenir en arrière ; il n'adopte jamais rien seul.

## 1. Mesures (D14.INV-1)

| Objet observé | Mesure |
|---|---|
| chaque contrôle automatique : schémas, contrôles nommés, règles de cause, poids de sélection | accord avec la décision humaine au point de contrôle, par fiche, version et moteur |
| alertes du premier ordre | précision : part des alertes qualifiées « pertinentes » ; incidents signalés par un humain sans alerte préalable |
| leçons et recalibrages adoptés | effet mesuré sur le taux de validation, avant et après |
| sélection | précision, échappements, stabilité (module `stratege`, section 5) |
| le `reflexif` lui-même | part de ses propositions ratifiées, effets mesurés après adoption |

Méta-critères, fixés par la constitution : une mesure n'est produite qu'à partir de 3 expositions ; elle porte sur une fenêtre de 10 décisions ; la marge de retrait est de 15 points de taux de validation. Un contrôle souvent contredit est déclaré mal calibré.

## 2. Retour arrière autonome (D14.INV-2)

- Quand une leçon ou un recalibrage actif fait baisser le taux de validation de plus de la marge sur la fenêtre, le `reflexif` demande `referentiel.revenir(version)` : retour au dernier état ratifié, inscrit au grand livre avec son motif.
- C'est la seule évolution qu'il fasse seul. Il n'adopte aucune règle nouvelle, n'élargit aucune borne, n'assouplit ni ne supprime aucun point de contrôle.

## 3. Garde anti-Goodhart (D14.INV-3)

Deux dérives sont attendues d'un système qui apprend : classer un défaut applicatif en défaut de parcours pour gonfler la réussite, et sélectionner moins de scénarios pour finir plus vite. La sémantique de « réussi » et d'« échoué » (D8.INV-1) et les paliers obligatoires (D6.INV-1, D6.INV-2) les bornent déjà. En plus, le `reflexif` compare la répartition des causes présumées aux reclassements humains en CP-3 : un écart au-delà de la marge lève une alerte au référent qualité.

## 4. Propositions (D14.INV-4)

```json
{
  "id": "PR-7",
  "regle": "instabilite.seuil",
  "echelle": "Scenario",
  "phase": "E6",
  "valeurActuelle": 0.10,
  "valeurProposee": 0.15,
  "preuves": ["journal:48211", "journal:48377"],
  "effetAttendu": "moins de quarantaines proposées pour des écrans à rendu différé",
  "bornes": { "min": 0.05, "max": 0.30 }
}
```

- Une proposition nomme la règle, l'échelle et la phase touchées, la valeur actuelle, la valeur proposée, ses preuves et l'effet attendu.
- Elle ne vise qu'une règle de la liste fermée, dans ses bornes (D15.INV-5). Sinon, elle n'est pas émise.
- Elle part au tableau de bord, vue gouvernance, par l'événement `proposition.recalibrage`, et attend CP-4.

## 5. Lecture seule du premier ordre (D14.INV-5)

Le `reflexif` lit le journal, les mesures de l'`observateur` et les décisions ; il n'écrit ni dans le journal du premier ordre, hors de ses propres lignes, ni dans les séries de l'`observateur`, ni dans les verdicts. Ses contrats ne déclarent aucune action d'écriture vers ces agents.

## 6. Actions et événements

| Action | Rôle |
|---|---|
| `bilan(filtre)` | mesures d'accord, effets, précision des alertes, propositions |

Événements : `proposition.recalibrage`, `retour.arriere`, `alerte.goodhart`.

## 7. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| RX1 | D14.INV-1 | après 3 expositions, l'accord d'un contrôle nommé est mesuré par fiche, version et moteur ; avant, aucune mesure n'est produite |
| RX2 | D14.INV-1 | la précision des alertes suit les qualifications de l'opérateur |
| RX3 | D14.INV-2 | une leçon qui fait baisser le taux de validation de 20 points sur la fenêtre est suspendue seule, avec son motif au grand livre |
| RX4 | D14.INV-2 | aucune action du `reflexif` n'adopte une règle, ne change une borne ni ne modifie un point de contrôle (contrat et analyse des appels) |
| RX5 | D14.INV-3 | des causes `DEFAUT_PARCOURS` souvent reclassées en `DEFAUT_APPLICATIF` en CP-3 lèvent `alerte.goodhart` |
| RX6 | D14.INV-4 | une proposition hors bornes n'est pas émise ; une proposition émise porte tous ses champs |
| RX7 | D14.INV-5 | le contrat du `reflexif` ne déclare aucune écriture vers `journal`, `observateur` ou `verdict` |

## 8. Fichiers à produire

- `src/agents/reflexif/agent.js`, `src/agents/reflexif/accord.js`, `src/agents/reflexif/effets.js`, `src/agents/reflexif/goodhart.js`, `src/agents/reflexif/propositions.js`
- `test/reflexif/*.test.js`
