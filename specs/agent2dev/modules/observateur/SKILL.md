---
name: observateur
description: Observabilité de premier ordre d'Agent2Dev (traces de chaque appel du bus avec corrélation, parent, demande, échelle, phase et vecteur des sept durées, contrôle de l'ordre E1 à E7 à chaque échelle, mesures par agent, pas, scénario, demande, fiche, moteur, point et copie de travail, toutes recalculables depuis le journal, alertes sur les seuils de la configuration humaine, qualification humaine des alertes, aucune action sur les cycles). À implémenter au lot 7.
dimensions: [D14]
status: active
---

# Module `observateur` (D14)

Le premier ordre répond à la question : le système fait-il ce qu'il doit ? L'`observateur` mesure le fonctionnement d'Agent2Dev et alerte. Il n'agit sur aucun cycle, et ignore l'existence du second ordre.

## 1. Traces

Le bus remet chaque appel terminé, succès ou échec, par `bus.tracer`. Chaque trace porte :

```json
{ "correlation": "5d1e…", "parent": "9b07…", "demande": "ECR-77", "echelle": "Pas", "phase": "E3",
  "appelant": "realisation", "cible": "executant", "action": "lancer", "statut": "succes",
  "durees": { "E1": 1, "E2": 4, "E3": 48210, "E4": 2, "E5": 1, "E6": 0, "E7": 1 } }
```

L'arbre des traces d'une demande se reconstruit par `parent`, de la demande jusqu'au pas, et se déplie au tableau de bord.

## 2. Ordre des phases

À la clôture de chaque cycle, l'`observateur` vérifie au journal que les sept phases de son échelle figurent dans l'ordre E1 à E7. Une phase manquante ou déplacée lève l'alerte `violation.cycle7e`, qui cite D1.INV-1, l'échelle et le cycle.

## 3. Mesures (D14.INV-2)

| Portée | Indicateurs |
|---|---|
| agent, phase, échelle | volume, durée p50 et p95, taux d'erreur |
| pas | essais consommés, sorties renvoyées pour non-conformité, lignes modifiées |
| scénario | rouges non valables et leur nature, contre-épreuves, ajustements à V4, fichiers touchés |
| demande | scénarios acceptés au premier passage à V4, défauts confirmés par Agent2Test, régressions, budgets consommés, temps de travail du système et temps d'attente des décisions |
| appel au moteur | jetons, durée, renvois, par fiche et par moteur |
| point de validation | part des décisions qui valident, corrigent ou ajustent ; délai de décision |
| copie de travail | patchs remis, appliqués, en attente ; conflits de mise à jour |

Chaque mesure est une fonction du journal seul : `mesures(filtre)` la calcule depuis ses lignes. Les séries que l'`observateur` garde ne sont qu'un cache : recalculées depuis le journal, elles sont identiques.

## 4. Alertes (D14.INV-3)

Les seuils sont dans la configuration humaine, que l'`observateur` lit sans la modifier :

```json
{ "alertes": { "seuils": { "pas.essais.p95": 3, "scenario.rougesNonValables.taux": 0.2, "demande.defautsConfirmes": 1, "point.delaiDecision.heures": 24, "copie.patchsEnAttente": 5 } } }
```

- Une mesure qui franchit son seuil lève l'événement `alerte` : il est journalisé, et atteint le tableau de bord en direct (flux SSE).
- L'alerte reste visible jusqu'à sa qualification par un humain, « pertinente » ou « non pertinente » ; la qualification est journalisée, l'alerte n'est jamais effacée.
- Une alerte n'arrête rien : seul un humain suspend une demande.

## 5. Aucune action sur les cycles (D14.INV-1)

- Le contrat de l'`observateur` ne déclare qu'un appel, `journal.consulter`, et deux événements, `alerte` et `mesure.calculee`. Il n'appelle ni l'`orchestrateur`, ni un agent d'étape, ni le second ordre.
- Le second ordre lit les mesures par l'action `mesures(filtre)` ; jamais l'inverse.
- Un test lit le graphe des appels effectifs du bus après une demande complète et vérifie qu'aucune arête ne part de l'`observateur` vers un autre agent que le `journal`.

## 6. Actions et événements

| Action | Rôle |
|---|---|
| `mesures(filtre)` | séries et agrégats, par portée |
| `arbre(demande)` | arbre des traces |
| `qualifier(alerte, avis)` | qualification humaine d'une alerte, relayée par le tableau de bord |

Événements : `alerte`, `mesure.calculee`.

## 7. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| OB1 | D14.INV-1 | après une demande simulée complète, le graphe des appels ne contient aucune arête de l'`observateur` vers un autre agent que le `journal` |
| OB2 | D14.INV-1 | une alerte levée pendant une demande ne la suspend pas ; la demande continue jusqu'à la décision d'un humain |
| OB3 | D1.INV-1 | un cycle simulé qui saute E5 lève `violation.cycle7e` en citant D1.INV-1 |
| OB4 | D14.INV-2 | chaque mesure d'une demande simulée, recalculée depuis le seul journal, est identique à la série gardée |
| OB5 | D14.INV-2 | l'arbre d'une demande se déplie de la demande jusqu'au pas |
| OB6 | D14.INV-3 | un taux de rouges non valables au-delà de son seuil lève une alerte, journalisée et reçue par le flux SSE du tableau de bord |
| OB7 | D14.INV-3 | une alerte qualifiée « non pertinente » reste au journal avec sa qualification |

## 8. Fichiers à produire

- `src/agents/observateur/agent.js`, `src/agents/observateur/traces.js`, `src/agents/observateur/mesures.js`, `src/agents/observateur/alertes.js`
- `test/observateur/*.test.js`
