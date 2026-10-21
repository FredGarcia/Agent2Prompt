---
name: stratege
description: Sélection des tests essentiels d'une demande (impact déterministe par la carte, traçabilité des critères cités, score de risque explicable décomposé par facteur, revue par le moteur motivée, paliers P1 confirmation, P2 non-régression ciblée dans le budget, P3 socle, écartés motivés et trous de couverture, repli sans moteur, ratification en CP-1, mesures de précision et d'échappements). Agent cognitif, à implémenter au lot 5.
dimensions: [D6]
status: active
---

# Module `stratege` (D6)

Le `stratege` répond à la question centrale : quels scénarios jouer pour cette demande. Sa sélection est justifiable devant un développeur : chaque choix a un motif, chaque score se décompose.

## 1. Entrées

- la demande et ses critères cités (module `plan`) ;
- le plan figé de la campagne : scénarios jouables, criticité, socle ;
- la carte et l'impact des changements (module `scanner`) ;
- l'historique : derniers verdicts, instabilité, date de dernière exécution ;
- la mémoire : demandes semblables, échappements passés (module `memoire`).

## 2. Procédé en quatre temps

1. **Impact déterministe** : les fichiers modifiés mènent aux écrans par `scanner.impact` ; les scénarios qui traversent ces écrans sont candidats au palier P2.
2. **Traçabilité** : les critères cités mènent aux scénarios jouables qui les couvrent ; ils forment le palier P1 (D6.INV-1).
3. **Score de risque**, pour chaque candidat de P2 :

   score = Σ poids × facteur, pour les facteurs `impact` (écran touché directement), `voisinage` (composant ou service partagé), `criticite` (haute 1, moyenne 0,5, basse 0), `historique` (part d'échecs sur les dix derniers passages), `anciennete` (jours depuis le dernier passage, ramenés entre 0 et 1 sur 30 jours), moins `instabilite` (taux d'instabilité). Chaque facteur est entre 0 et 1 ; les poids sont des règles modifiables (module `referentiel`).
4. **Revue par le moteur** (fiche `stratege`) : elle relie la demande aux écrans quand le graphe ne suffit pas, motive chaque scénario retenu en une phrase et signale les trous de couverture. Elle peut ajouter ou retirer un scénario de P2, jamais sans motif. Après elle, P1 et P3 sont revérifiés (D6.INV-1, D6.INV-2).

## 3. Sortie

| Palier | Contenu | Règle |
|---|---|---|
| P1 Confirmation | scénarios jouables qui couvrent un critère cité | tous, obligatoirement |
| P2 Non-régression ciblée | scénarios des écrans impactés ou voisins | par score décroissant, tant que la durée estimée tient dans le budget de la configuration humaine (45 minutes par défaut) |
| P3 Socle | scénarios jouables étiquetés `@socle`, ou `Socle : oui` | toujours |
| Écartés | le reste | listés, avec leur motif |
| Trous | critères cités sans scénario jouable | listés ; jamais comblés |

La durée estimée d'un scénario est la médiane de ses trois derniers passages, ou 20 secondes par étape s'il n'a jamais été joué.

```json
{
  "campagne": "C-20261021-001",
  "revue": "gemini",
  "paliers": {
    "P1": [{ "scenario": "ECR-77-S01", "motif": "couvre ECR-77-CA01, cité par la demande" }],
    "P2": [{ "scenario": "contrats/S-12.1", "motif": "écran /retours impacté par FeedbackExportController",
             "score": 0.71, "facteurs": { "impact": 1, "voisinage": 0, "criticite": 0.5, "historique": 0.1, "anciennete": 0.4, "instabilite": 0 } }],
    "P3": [{ "scenario": "socle/S-1.1", "motif": "parcours critique du socle" }]
  },
  "ecartes": [{ "scenario": "ECR-77-S02", "motif": "non jouable : limité au back" }],
  "trous": []
}
```

Chaque élément de P1, P2, P3 et des écartés porte un motif d'une phrase ; chaque élément de P2 porte son score décomposé (D6.INV-3). Les motifs rédigés par le moteur sont marqués comme tels (D10.INV-3).

## 4. Ratification (D6.INV-4) et repli (D6.INV-5)

- La sélection ouvre CP-1. Aucune préparation ne démarre avant la décision ; une correction exige un commentaire.
- Si le moteur est indisponible ou si sa sortie reste non conforme après 3 renvois, la sélection déterministe des temps 1 à 3 est présentée seule, avec la marque « sans revue du moteur ».

## 5. Mesures

Le `reflexif` mesure, sur la durée : la précision (part des scénarios retenus qui traversent effectivement un écran impacté), les échappements (défauts trouvés plus tard par un scénario écarté, ou déclarés par un humain) et la stabilité de la sélection pour des demandes semblables. Ces mesures fondent ses propositions de recalibrage des poids.

## 6. Pièges connus

- **P1 amputé par la revue** : la revue ne peut retirer aucun scénario de P1 ni de P3 ; la revérification l'impose.
- **Budget appliqué à P1** : seul P2 est soumis au budget.
- **Score opaque** : un score sans ses facteurs est un écart.

## 7. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| ST1 | D6.INV-1 | une revue du moteur qui retire un scénario de P1 est corrigée : le scénario revient, et l'écart est journalisé |
| ST2 | D6.INV-1 | les scénarios non jouables d'un critère cité n'entrent pas en P1 ; le critère figure en trou si aucun n'est jouable |
| ST3 | D6.INV-2 | tous les scénarios `@socle` jouables sont en P3, même hors de l'impact |
| ST4 | D6.INV-3 | chaque scénario retenu ou écarté a un motif ; chaque score de P2 se décompose en six facteurs dont la somme pondérée redonne le score |
| ST5 | D6.INV-3 | P2 s'arrête quand la durée estimée dépasserait le budget ; les suivants sont écartés avec le motif « hors budget » |
| ST6 | D6.INV-4 | avant la décision en CP-1, aucune action `preparer` n'est appelée |
| ST7 | D6.INV-5 | moteur `simulation` configuré en panne : la sélection déterministe est présentée, marquée « sans revue du moteur » |
| ST8 | D6.INV-1 | pour l'exemple ECR-77, P1 contient S01 et S04 ; S02 (limité au back) et S03 (en attente) sont écartés avec leur motif |

## 8. Fichiers à produire

- `src/agents/stratege/agent.js`, `src/agents/stratege/impact.js`, `src/agents/stratege/score.js`, `src/agents/stratege/paliers.js`, `src/agents/stratege/revue.js`
- `schemas/selection.json`
- `test/stratege/*.test.js`
