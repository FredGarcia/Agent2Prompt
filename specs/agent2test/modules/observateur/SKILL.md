---
name: observateur
description: Observabilité de premier ordre d'Agent2Test (traces de chaque appel du bus avec corrélation, parent, échelle, phase et vecteur des sept durées, contrôle de l'ordre E1 à E7 à chaque échelle, métriques par agent, phase, échelle, scénario, campagne, moteur et point de contrôle, alertes de dérive, arbre des traces, export OTLP facultatif sans dépendance, sens des dépendances O1 vers O2 vérifié). À implémenter au lot 6.
dimensions: [D11]
status: active
---

# Module `observateur` (D11)

Le premier ordre répond à la question : le système fait-il ce qu'il doit ? L'`observateur` mesure son fonctionnement et alerte. Il ignore l'existence du second ordre.

## 1. Traces (D11.INV-1)

Le bus remet chaque appel terminé, succès ou échec, par `bus.tracer`. Chaque trace porte :

```json
{ "correlation": "8f2c…", "parent": "77a1…", "campagne": "C-20261021-001", "echelle": "Scenario", "phase": "E3",
  "appelant": "orchestrateur", "cible": "navigateur", "action": "jouer", "statut": "succes",
  "durees": { "E1": 2, "E2": 15, "E3": 4210, "E4": 3, "E5": 1, "E6": 0, "E7": 1 } }
```

L'arbre des traces d'une campagne se reconstruit par `parent`, de la campagne jusqu'à l'étape, et se déplie au tableau de bord.

## 2. Ordre des phases (D11.INV-2)

À la clôture de chaque cycle, l'`observateur` vérifie au journal que les sept phases de son échelle figurent dans l'ordre E1 à E7. Une phase manquante ou déplacée lève l'alerte `violation.cycle7e`, qui cite D1.INV-1, l'échelle et le cycle.

## 3. Métriques

| Portée | Indicateurs |
|---|---|
| agent, phase, échelle | volume, durée p50 et p95, taux d'erreur |
| scénario | taux de réussite, taux d'instabilité |
| campagne | couverture des critères, répartition des verdicts et des causes |
| appel au moteur | jetons, renvois pour non-conformité |
| point de contrôle | taux de validation, de correction, de rejet ; délai de décision |

Les indicateurs se consultent par agent, phase et échelle, et se filtrent par campagne.

## 4. Alertes (D11.INV-4)

- Chaque indicateur peut porter un seuil, déclaré dans la configuration humaine.
- Une dérive au-delà du seuil lève une alerte : l'événement `alerte` atteint le tableau de bord en direct (flux SSE), et l'alerte reste visible jusqu'à sa qualification par l'opérateur, « pertinente » ou « non pertinente ».
- Les qualifications nourrissent la mesure de précision des alertes, faite par le second ordre (D14.INV-1).

## 5. Sens des dépendances (D11.INV-3)

- Le contrat de l'`observateur` et celui du `journal` ne déclarent aucun appel vers `apprenant`, `reflexif` ou `referentiel`.
- Le second ordre lit les mesures par l'action `mesures(filtre)` ; jamais l'inverse.
- Un test lit le graphe des appels effectifs du bus après une campagne complète et vérifie qu'aucune arête ne va du premier ordre vers le second.

## 6. Export OTLP, en option

Quand la configuration l'active, les traces d'une campagne partent vers un collecteur OpenTelemetry local, au format OTLP en JSON sur HTTP, par `fetch` : aucune dépendance ajoutée. Désactivé par défaut.

## 7. Actions et événements

| Action | Rôle |
|---|---|
| `mesures(filtre)` | séries et agrégats, par portée |
| `arbre(campagne)` | arbre des traces |
| `qualifier(alerte, avis)` | qualification humaine d'une alerte, relayée par le tableau de bord |

Événement : `alerte`.

## 8. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| OB1 | D11.INV-1 | chaque appel d'une campagne simulée a sa trace, avec ses sept durées, sa corrélation et son parent |
| OB2 | D11.INV-2 | un cycle simulé qui saute E5 lève `violation.cycle7e` en citant D1.INV-1 |
| OB3 | D11.INV-3 | après une campagne complète, le graphe des appels ne contient aucune arête du premier ordre vers le second |
| OB4 | D11.INV-4 | un taux d'erreur au-delà de son seuil lève une alerte reçue par le flux SSE du tableau de bord |
| OB5 | D11.INV-1 | l'arbre d'une campagne se déplie de la campagne jusqu'à l'étape |
| OB6 | D11.INV-4 | une alerte qualifiée « non pertinente » est conservée avec sa qualification |

## 9. Fichiers à produire

- `src/agents/observateur/agent.js`, `src/agents/observateur/metriques.js`, `src/agents/observateur/alertes.js`, `src/agents/observateur/arbre.js`, `src/agents/observateur/otlp.js`
- `test/observateur/*.test.js`
