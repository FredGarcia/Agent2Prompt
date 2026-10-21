---
name: conception
description: Impact et variantes, point V3 (recherches proposées par le moteur et exécutées par le depot, fiche d'impact dont chaque élément cite un fichier et une ligne trouvés, impact sur le contrat qualifié, impact.txt en mode parallèle, fiche variantes avec invariants engagés, aucune variante non conforme recommandée, choix du développeur consigné dans suivi.md avant toute réalisation). À implémenter au lot 5.
dimensions: [D8]
status: active
---

# Module `conception` (D8)

La conception applique les modules `impact` et `variantes` du skill, pour chaque scénario dont les critères sont prêts pour la réalisation (sortie de `controler-criteres`, module `cadrage`).

## 1. Impact (D8.INV-1)

Le pas `impact` se fait en deux temps.

**Recherches.** La fiche `impact` propose les recherches utiles à chaque scénario, comme le skill les décrit (`impact`, section 2) : points d'API, services, routes, composants, tests existants.

```json
{ "recherches": [
  { "id": "R1", "scenario": "ECR-77-S01", "motif": "@(Get|Post)Mapping\\(.*feedbacks", "inclure": "back/src/main/java/**/*.java", "raison": "point d'API de la liste" },
  { "id": "R2", "scenario": "ECR-77-S01", "motif": "path: 'retours'", "inclure": "front/src/app/**/*.ts", "raison": "route de la liste" }
] }
```

Le `depot` les exécute dans l'arbre de travail (`depot.chercher`) : un motif est une expression régulière de 200 caractères au plus, exécutée avec un délai ; 20 recherches par scénario au plus, 50 résultats par recherche. Les résultats, fichier, ligne et texte, sont numérotés `R1.1`, `R1.2`…

**Fiche d'impact.** Avec ces résultats, la fiche rédige l'impact de chaque scénario, au format du skill (`impact`, section 3) :

```json
{ "scenarios": [
  { "scenario": "ECR-77-S01",
    "elements": [
      { "couche": "Back", "element": "FeedbackController", "reference": "R1.1", "nature": "à étendre" },
      { "couche": "Front", "element": "page liste", "reference": "R2.1", "nature": "à étendre (bouton)" },
      { "couche": "Contrat", "element": "export CSV", "reference": null, "nature": "à créer : exportFeedbacks, text/csv" }
    ],
    "contrat": "compatible", "migrations": "aucune",
    "risques": ["le filtrage est en mémoire au-delà de 1 000 lignes (R4.2)"] }
] }
```

- `impact.references-trouvees` : chaque élément existant cite un résultat de recherche ; seul un élément « à créer » peut ne rien citer. Un fichier cité qui n'est pas dans les résultats est un écart (`agent-tdd-jira:D3.INV-1`).
- `impact.contrat-qualifie` : `contrat` vaut `aucun`, `compatible` ou `cassant` pour chaque scénario (`agent-tdd-jira:D3.INV-2`).
- En mode parallèle, le `depot` écrit aussi `travail/<CLÉ>/impact.txt` dans le worktree, même en copie de travail, un chemin relatif par ligne, à partir des fichiers cités : c'est ce que lit `agt collisions`. La fiche signale ceux qui relèvent d'un point chaud (`agent-tdd-jira:D9.INV-5`).

## 2. Variantes et V3 (D8.INV-2, D8.INV-3)

La fiche `variantes` applique le module `variantes` du skill, avec les sections « Versions cibles » et « Invariants » des référentiels Java et Angular et le socle (module `methode`, section 2).

```json
{ "scenarios": [
  { "scenario": "ECR-77-S01",
    "back": [
      { "code": "B1", "resume": "endpoint dédié qui réutilise le filtrage", "invariants": ["java:D3.INV-1", "socle-back-front:SC1.INV-2"], "violations": [], "effort": "M" },
      { "code": "B2", "resume": "génération asynchrone et téléchargement différé", "invariants": ["java:D3.INV-1"], "violations": [], "effort": "L" }
    ],
    "front": [
      { "code": "F1", "resume": "bouton dans la barre d'outils, téléchargement par Blob", "invariants": ["angular:D3.INV-1"], "violations": [], "effort": "S" }
    ],
    "nonConcerne": [],
    "recommandation": { "back": "B1", "front": "F1", "motif": "le volume tient sous la limite de 10 000 lignes" } }
] }
```

Contrôles nommés :

- `variantes.au-moins-deux` : au moins deux variantes par couche concernée, ou une seule avec la justification de son unicité ; une couche absente figure dans `nonConcerne` avec sa raison (`agent-tdd-jira:D4.INV-1`) ;
- `variantes.invariants-connus` : chaque invariant cité existe dans les référentiels ou le socle inclus dans la transmission du skill, qu'il soit écrit comme dans le skill (`java:Dn.INV-k`, `SCn.INV-k`) ou préfixé du nom du socle (`socle-back-front:SCn.INV-k`) ;
- `variantes.recommandation-conforme` : la variante recommandée n'a aucune violation (`agent-tdd-jira:D4.INV-2`).

V3 présente, scénario par scénario, la fiche d'impact et les variantes. Le développeur choisit une variante back et une variante front, ou « non concerné », pour chaque scénario, ou corrige, avec un commentaire qui entre dans une nouvelle rédaction.

Après V3, le `depot` consigne le choix dans `docs/demandes/<CLÉ>/suivi.md`, dans l'arbre de travail, au format du skill (`variantes`, section 5) : un tableau daté, scénario, back, front, écart au référentiel, validé par. Le `realisation` ne démarre aucun scénario sans cette ligne (`agent-tdd-jira:D4.INV-3`).

## 3. Pièges connus

- **Recherche écartée parce qu'elle ne trouve rien** : un résultat vide est une information ; l'élément devient « à créer », ou la question va au développeur.
- **Variantes de façade** : deux variantes qui ne diffèrent que par un nom ne passent pas `variantes.au-moins-deux` ; le contrôle compare aussi leurs résumés.
- **Choix implicite** : la recommandation n'est jamais un choix ; seule la décision V3 en est un.

## 4. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| CO1 | D8.INV-1 | une fiche d'impact qui cite un fichier absent des résultats de recherche est refusée par `impact.references-trouvees` |
| CO2 | D8.INV-1 | un motif de plus de 200 caractères, ou une recherche au-delà du délai, est refusé sans bloquer les autres |
| CO3 | D8.INV-1 | en mode parallèle, `travail/ECR-77/impact.txt` liste les fichiers cités, un par ligne |
| CO4 | D8.INV-3 | une recommandation dont la variante porte une violation est refusée par `variantes.recommandation-conforme` |
| CO5 | D8.INV-3 | un invariant cité qui n'existe pas dans les référentiels du skill est refusé par `variantes.invariants-connus` |
| CO6 | D8.INV-2 | sans décision V3, aucun scénario ne démarre ; après la décision, `suivi.md` porte la ligne du choix au format du skill |
| CO7 | D8.INV-2 | un scénario d'un critère en attente de Q1 ne reçoit pas de variante à choisir |
| CO8 | D8.INV-1 | un scénario dont l'impact sur le contrat n'est pas qualifié est refusé par `impact.contrat-qualifie` |

## 5. Fichiers à produire

- `src/agents/conception/agent.js`, `src/agents/conception/impact.js`, `src/agents/conception/variantes.js`, `src/agents/conception/suivi.js`
- `schemas/fiche.impact.recherches.json`, `schemas/fiche.impact.sortie.json`, `schemas/fiche.variantes.sortie.json`
- `test/conception/*.test.js`, `test/fixtures/moteur/impact/`, `test/fixtures/moteur/variantes/`
