---
name: referentiel
description: Référentiel d'Agent2Dev (huit fiches versionnées, leçons ratifiées en surcouche par moteur, version composée fiche, skill et leçons, reconstitution du prompt à l'identique, liste fermée des règles modifiables et de leurs bornes, épinglage par demande, application des seules décisions CP-4 du référent, retour arrière, grand livre en ajout seul chaîné par empreintes). À implémenter au lot 2.
dimensions: [D17]
status: active
---

# Module `referentiel` (D17)

Le `referentiel` est la mémoire procédurale et réflexive d'Agent2Dev : ce qui règle le comportement des agents, et l'histoire de chaque changement. Il applique ; il ne propose ni ne décide. La méthode n'en fait pas partie : le skill est épinglé par la configuration humaine et lu par le module `methode`.

## 1. Fiches et versions composées (D17.INV-5)

- Huit fiches, une par usage du moteur : `fiches/analyse.json`, `impact.json`, `variantes.json`, `contrat.json`, `rouge.json`, `vert.json`, `remanie.json`, `rapport.json` (module `methode`, section 3). Elles vivent dans git et ne changent que par une version publiée, écrite par un humain ; leur publication s'inscrit au grand livre (`fiche.publiee`).
- Les leçons ratifiées sont des surcouches, rangées dans les données du `referentiel`, rattachées à une fiche et à un moteur (D15.INV-2).
- Version composée : `<fiche>@<version>+agent-tdd-jira@1.3.1+L<n>`, où `n` compte les leçons actives pour ce moteur, par exemple `rouge@1.0.0+agent-tdd-jira@1.3.1+L1`.
- `fiche(code, moteur)` rend la fiche composée : la fiche de base, puis les leçons actives du moteur, dans l'ordre de ratification.
- `reconstituer(production)` refait le prompt d'une production du moteur à partir du journal : version composée, sections du skill lues dans la transmission vérifiée, identifiants des leçons, entrées du pas. Son empreinte doit égaler celle que le journal a gardée (module `journal`, section 3).

## 2. Épinglage (D17.INV-1)

- À l'E2 de chaque demande, `epingler(demande)` fige un instantané : versions composées des fiches, valeurs des règles, empreinte de la constitution, skill et empreinte de sa transmission. L'instantané reçoit un identifiant, `R-<n>`, et s'inscrit au grand livre (`epinglage`).
- Tous les agents lisent fiches et règles à travers l'instantané de leur demande, jamais l'état courant.
- Une règle ou une leçon ratifiée pendant une demande prend effet à la demande suivante ; l'instantané en cours ne change pas.

## 3. Pouvoirs (D17.INV-4)

| Pouvoir | Qui | Comment |
|---|---|---|
| proposer | `apprenant`, `reflexif` | événements `lecon.candidate`, `proposition.recalibrage` |
| ratifier | un humain, au rôle référent | CP-4, depuis le tableau de bord seulement : ratifier, amender dans les bornes, refuser |
| appliquer | `referentiel` | `appliquer(decision)` |
| mesurer | `reflexif` | effets mesurés après adoption |

`appliquer(decision)` vérifie que la décision vient du point CP-4, du canal `tableau-de-bord` et d'un utilisateur au rôle référent ; sinon, il la refuse `DECISION_IRRECEVABLE`. Le canal MCP ne peut jamais porter une décision CP-4 (D18.INV-2).

## 4. Règles modifiables (D17.INV-3)

Liste fermée, recopiée dans la constitution. Une valeur hors de ses bornes est refusée, en CP-4 comme à l'application.

| Règle | Défaut | Bornes |
|---|---|---|
| `budget.tentativesSortie` | 2 | de 1 à 3 |
| `budget.tentativesPas` | 3 | de 1 à 5 |
| `budget.correctionsParScenario` | 3 | de 1 à 5 |
| `taille.lignesParPas` | 200 | de 20 à 1 000 |
| `taille.fichiersParScenario` | 25 | de 1 à 50 |
| `contexte.plafond` | 60 000 caractères | de 8 000 au plafond que la configuration déclare pour le moteur |
| `duree.demande` | 4 heures | de 30 minutes à 24 heures |
| `fiches.lecons` | aucune | une leçon passe le contrôle `apprenant.lecon-compatible` et vaut pour un moteur |

Hors de cette liste, rien n'est modifiable par le système : code, constitution, skill et transmission, schémas, points de validation et leur régime, contrôles nommés, listes fermées des commandes, profils, configuration humaine, méta-critères du second ordre (D1.INV-6).

Valeurs fixées par la configuration humaine, que le système lit sans les modifier : seuils d'alerte, ports, autorisations, activation du relais n8n. Méta-critères, fixés par la constitution : fenêtre de 10 décisions, exposition minimale de 3, marge de 15 points.

## 5. Grand livre (D17.INV-2)

- Collection en ajout seul du `referentiel`, chaînée comme le journal (module `journal`, section 1).
- Types d'entrée : `constitution.publiee`, `fiche.publiee`, `lecon.ratifiee`, `lecon.refusee`, `lecon.suspendue`, `regle.ratifiee`, `regle.refusee`, `retour.arriere`, `epinglage`.
- Chaque entrée porte sa cause, ses preuves (références au journal), l'auteur de la ratification et, plus tard, l'effet mesuré, ajouté par une entrée nouvelle, jamais par modification.

`revenir(element)` suspend une leçon ou rend à une règle sa dernière valeur ratifiée, à la demande du `reflexif` (D16.INV-1), et inscrit `lecon.suspendue` ou `retour.arriere`. C'est la seule évolution que le système fasse seul.

## 6. Pièges connus

- **Lecture de l'état courant en cours de demande** : toute lecture passe par l'instantané épinglé.
- **Version composée sans moteur** : une leçon apprise sur Gemini ne figure pas dans la fiche composée pour un modèle local.
- **Effet noté en modifiant une entrée** : l'effet est une entrée nouvelle.
- **Plafond relevé au-delà du moteur** : `contexte.plafond` ne dépasse jamais le plafond que la configuration déclare pour le moteur.

## 7. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| RF1 | D17.INV-1 | une règle ratifiée pendant une demande ne change pas ses valeurs ; la demande suivante l'applique |
| RF2 | D17.INV-2 | ratification, refus, suspension et retour arrière s'inscrivent au grand livre ; la chaîne reste intacte |
| RF3 | D17.INV-2 | une entrée modifiée à la main rompt la chaîne du grand livre, et la vérification nomme la première entrée rompue |
| RF4 | D17.INV-3 | `taille.lignesParPas` à 2 000 est refusé ; `contexte.plafond` au-delà du plafond du moteur est refusé |
| RF5 | D17.INV-3 | une proposition qui touche une règle absente de la liste fermée est refusée |
| RF6 | D17.INV-4 | une décision CP-4 venue du canal MCP, ou d'un utilisateur sans le rôle référent, est refusée `DECISION_IRRECEVABLE` |
| RF7 | D17.INV-5 | pour une production journalisée, `reconstituer` redonne un prompt de même empreinte |
| RF8 | D17.INV-5 | une leçon ratifiée crée une version composée nouvelle, `+L<n+1>`, pour son seul moteur |
| RF9 | D1.INV-4 | `npm run constitution:publier` inscrit `constitution.publiee` ; aucun agent ne l'appelle (analyse des sources) |

## 8. Fichiers à produire

- `src/agents/referentiel/agent.js`, `src/agents/referentiel/fiches.js`, `src/agents/referentiel/regles.js`
- `src/agents/referentiel/epinglage.js`, `src/agents/referentiel/grand-livre.js`, `src/agents/referentiel/reconstitution.js`
- `test/referentiel/*.test.js`
