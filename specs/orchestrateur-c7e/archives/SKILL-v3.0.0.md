---
skill_id: c7e_fractal_orchestrator
version: 3.0.0
name: Orchestrateur Fractal C7E
description: >
  Pilote la résolution de tickets full-stack par déclinaison récursive imbriquée (CRI)
  dans le cycle 7E, avec concepts paramétrables, traçabilité Git et cybernétique
  de second ordre. Langage-agnostique : les opérateurs sont déclinés par stack
  via des adapters (Java/Angular/PostgreSQL par défaut).
default_modulation: hybride   # utilisateur fixe les invariants ; l'IA règle les paramètres opérationnels
language_agnostic: true
---

# SKILL C7E — Orchestrateur Fractal

## 0. Principe fondateur

> Ne pas traiter un ticket comme une modification de code, mais comme la
> **transformation maîtrisée d'un système vivant** : comprendre → modéliser →
> méthodiser → transformer → observer → adapter.

Pipeline fondamental (remplace "Ticket → Prompt → Code → Tests") :

```
Objectif → Modélisation → Méthode → Transformation → Observation → Adaptation
```

Deux ordres cybernétiques, à ne jamais confondre :
- **Ordre 1** : l'IA observe et corrige le logiciel.
- **Ordre 2** : l'IA observe sa propre manière d'analyser/concevoir et adapte
  ses concepts et paramètres. L'observateur (humain ou IA) fait partie de la boucle.

---

## 1. Ontologie unifiée

### 1.1 Le cycle 7E

Mnémonique fondateur : *« Les Éléments, dans l'Espace, Engendrent un État
d'Expression Évolutif de l'environnement »* — précédé de l'Outillage (É0)
et suivi de l'Évaluation (É6) qui ferme la boucle.

| Slot | Nom canonique | Fonction | Exemple stack par défaut |
|------|---------------|----------|--------------------------|
| É0 | **Environnement** (hors-axiome) | Initialisation de l'écosystème de travail. *Statut : méta-cycle — précondition, pas étape de livraison.* | Docker, PostgreSQL, CLI de migration |
| É1 | **Éléments** | Stockage & schéma : structures de données persistantes | Changeset Liquibase, colonne PostgreSQL |
| É2 | **Espace** | Contexte, cache, flux de transit, état local | State management front, gestion de session |
| É3 | **Engendrement** | Passerelles & contrats d'interface | Endpoint REST `@GetMapping`, DTO, contrat OpenAPI |
| É4 | **État** | Logique métier, traitement déclenché | Service Java exécuté à réception du signal |
| É5 | **Expression** | Interface utilisateur, rendu, interaction | Binding `(click)` Angular, états du bouton |
| É6 | **Évaluation** | Contrôle, qualité, mesure — *porte d'entrée du second ordre* | Tests, contrats Swagger/Postman, métriques SLA |
| É7 | **Évolution** | Valeur livrée, capitalisation, feedback métier | Validation PO, release, KPIs, clôture |

### 1.2 La récursivité fractale (CRI) — 4 niveaux justifiés

| Profondeur | Niveau | Contenu | Slots dominants |
|------------|--------|---------|-----------------|
| d=0 | **Macro** | Objectif métier, invariants SLA, critères d'acceptation | É7 (ancrage) |
| d=1 | **Meso-contrats** | Interfaces entre couches : contrats API, schéma BDD exposé | É1, É3 |
| d=2 | **Meso-composants** | Implémentation des couches : services, repositories, composants UI | É2, É4, É5 |
| d=3 | **Micro** | Atomes : changeset, annotation `@Column`, event-binding, ligne de code | É1, É2 (atomes) |

**Règle d'isomorphisme** : toute contrainte descend de d=0 vers d=3 sans perte ;
toute observation remonte de d=3 vers d=0 avec preuve. La structure de
raisonnement est la même à chaque niveau (auto-similarité).

### 1.3 Les concepts paramétrables (brique fondatrice)

Un concept est un **objet méthodologique**, pas une instruction. Structure obligatoire :

```json
{
  "id": "C_<DOMAINE>_<NNN>",
  "name": "...",
  "version": "semver",
  "status": "validated | experimental | proposed",
  "invariants": [],
  "inputs": {},
  "parameters": {},
  "activation_rules": [],
  "operations": [],
  "outputs": {},
  "evaluation": {},
  "feedback": { "enabled": true, "adaptation": true }
}
```

Le CRI sélectionne et compose les concepts selon le ticket, l'environnement
et les contraintes. La bibliothèque est portable d'un framework à l'autre :
les stacks (Java, Angular, PostgreSQL...) sont des **adapters**, jamais des
concepts.

---

## 2. Matrice d'activation (mixage paramétrique par défaut)

| Concept | Poids | Paramètres d'entrée | Rôle |
|---|---|---|---|
| Composition Récursive Imbriquée | 0.35 | max_depth=3, self_similarity=true | Descente/fractale Macro→Micro, propagation isomorphe |
| Cybernétique de second ordre | 0.25 | observer_included=true, resonance_loop=true | Feedback, adaptation de la méthode |
| Ingénierie agile (domaine) | 0.25 | framework=Scrum/Kanban, granularity=Ticket/UserStory, stack_adapters=[postgres, liquibase, spring, angular] | Fournit le contexte d'application concret |
| Modélisation pédagogique | 0.15 | rigor=0.95, clarity=0.9, format=synoptic+code | Restitution structurée, auditable |

**Sélection adaptative** : les poids ne sont pas figés. L'IA les réajuste selon
la complexité, la criticité et la profondeur d'impact du ticket
(cf. §7, mode hybride).

---

## 3. Pipeline d'exécution par slot

Pour chaque ticket, l'orchestrateur produit une **fiche de transformation** :

1. **É0 — Préparer** : vérifier environnement, droits, outillage. *Gate : environnement reproductible.*
2. **É1 — Schéma** : changeset versionné, réversible, idempotent. Vérifier nullabilité, données historiques, risque de verrouillage.
3. **É2 — Espace** : définir où vit l'état (cache, store), gestion des flux.
4. **É3 — Contrat** : endpoint/contrat d'interface aligné sur les conventions existantes (verbes HTTP, statuts, OpenAPI). *Gate : contrat validé avant implémentation.*
5. **É4 — Logique** : service métier déclenché par le signal d'appel uniquement.
6. **É5 — Expression** : UI consommant le contrat ; supprimer le comportement obsolète (ex. auto-load dans `ngOnInit`).
7. **É6 — Évaluer** : exécuter les tests déduits (§5), mesurer, produire le **dossier de preuves**.
8. **É7 — Évoluer** : validation métier, release, mesure des KPIs, capitalisation
   dans la base de connaissances, clôture avec rétrospective de second ordre.

---

## 4. Traçabilité Git (isomorphisme CRI ⟷ Git)

| Niveau | Profondeur | Slots | Objet Git | Convention |
|---|---|---|---|---|
| Macro | d=0 | É7 | Repo / tag de release | `release/vX.Y.Z` |
| Meso | d=1,2 | É3–É5 | Branches de fonctionnalité | `feature/7e-e<SLOT>-<domaine>-<slug>` |
| Micro | d=3 | É1–É2 | Commits atomiques | format sémantique ci-dessous |

**Format de commit obligatoire** :

```
[É<SLOT>-<DOMAINE>] <type>(<portée>): <description concise>

<body optionnel : impact récursif / boucle de feedback déclenchée>
```

Exemples (ticket fil rouge) :
- `[É1-DB] feat(liquibase): add column for on-demand loading`
- `[É3-API] feat(spring): expose GET /donnees endpoint`
- `[É5-UI] feat(angular): replace ngOnInit auto-load with click binding`
- `[É6-TEST] test(integration): cover on-demand endpoint and UI states`

**Commit de rétroaction (second ordre matérialisé)** :

```
[É1-DB] fix(liquibase): add index on new column after É6 latency observation
```

L'historique Git est un **journal cybernétique** : chaque commit de
rétroaction documente physiquement l'adaptation du système induite par
l'observation de ses propres résultats.

---

## 5. Gates d'activation et déduction des tests

### 5.1 Gates CI/CD

- **Gate Micro→Meso** (sur commit) : non-régression syntaxique, alignement
  des types `SQL ↔ JPA ↔ TypeScript`, lint, tests unitaires ciblés.
- **Gate Meso→Macro** (sur merge vers `main`) : tests contractuels
  (Swagger/Postman), exécution des migrations sur base de référence,
  tests d'intégration, contrôles de sécurité.

### 5.2 Dédiction des tests depuis les risques (jamais par habitude)

| Situation identifiée | Test attendu |
|---|---|
| Migration sur schéma existant | Migration jouée sur base pré-existante + rollback |
| Nouvelle colonne | Nullabilité, valeur par défaut, données historiques |
| Nouvel endpoint | Réponse HTTP conforme au contrat |
| Utilisateur non autorisé | 401/403 |
| Chargement à la demande | Aucun appel au chargement initial |
| Clic sur bouton | Exactement un appel API |
| Erreur API | État d'erreur affiché |
| Double clic | Pas de requêtes concurrentes indésirables |
| Suppression d'un comportement legacy | Non-régression des écrans consommateurs |
| Batch / autres consommateurs | Absence d'impact détecté |

Chaque test doit **prouver un critère d'acceptation ou un risque identifié** —
sinon il est redondant et supprimé.

---

## 6. Boucle cybernétique de second ordre

1. **Capturer** : en É6/É7, mesurer l'écart entre objectif (d=0) et résultat (d=3).
2. **Remonter** : traduire l'écart en ajustement de paramètres (ex. latence
   Meso → ajout d'index au niveau Micro É1).
3. **Matérialiser** : commit de rétroaction + mise à jour de la fiche de transformation.
4. **Capitaliser** : enregistrer l'observation dans la base de connaissances
   (conventions, dépendances, échecs récurrents, stratégies efficaces).
5. **Adapter la méthode** : ajuster les poids de la matrice (§2) et les
   paramètres des concepts pour le ticket suivant.

**Principe de résonance** : une dégradation mesurée au niveau Macro (SLA)
doit pouvoir être tracée jusqu'à une cause Micro et y être corrigée, sans
casse des niveaux intermédiaires.

---

## 7. Modes de modulation et gouvernance

### 7.1 Modes

- **A — Externe** : l'utilisateur fournit tous les paramètres.
- **B — Autonome** : l'IA détermine paramètres et méthode.
- **C — Hybride (défaut)** : l'utilisateur fixe les invariants (SLA, normes,
  périmètre de preuve) ; l'IA règle les paramètres opérationnels et se réajuste.

Sélection de la configuration méthodologique selon :
complexité × criticité × profondeur d'impact × niveau de preuve attendu.
- Ticket trivial → configuration légère (peu de concepts, faible profondeur).
- Ticket multi-couches critique → configuration profonde (tous concepts,
  depth=3, evidence requis).

### 7.2 Registre de concepts et niveau 2

| Statut | Signification | Droits |
|---|---|---|
| `validated` | éprouvé sur tickets comparables | utilisable en production |
| `experimental` | en cours de mesure | utilisable avec mention, hors chemin critique |
| `proposed` | soumis par l'IA ou un humain | exige validation avant usage |

Promotion `proposed → experimental → validated` par revue humaine documentée.
**Jamais d'auto-modification de la bibliothèque sans validation explicite** :
la capacité de second ordre est bornée par ce registre.

---

## 8. Mesure de la valeur (à instancier avant usage commercial)

Indice de valeur cumulée sur un ticket :

```
V = ωq·Q + ωr·R + ωt·T + ωc·C + ωa·A ,  avec Σω = 1
```

| Symbole | Indicateur | Défaut ω |
|---|---|---|
| Q | Qualité (conformité conventions + robustesse cas limites) | 0.25 |
| R | Maîtrise des risques (dépendances couvertes / dépendances totales) | 0.25 |
| T | Traçabilité (décisions justifiées par preuves) | 0.15 |
| C | Capitalisation (réutilisation des connaissances) | 0.20 |
| A | Adaptabilité méthodologique (pertinence de la config choisie) | 0.15 |

Protocole minimal : mesurer sur ≥ 10 tickets comparables, méthode C7E vs.
baseline, évaluateur indépendant, sans double comptage des bénéfices.
Tant que cette mesure n'existe pas, la valeur annoncée reste une **hypothèse**
— à dire au client commandeur.

---

## 9. Anti-patterns

- ❌ Traiter un ticket comme un prompt isolé (ordre 0).
- ❌ Produire du code conforme mais sans analyse d'impact (ordre 1 sans CRI).
- ❌ Imposer une architecture théorique au lieu de lire l'architecture réelle.
- ❌ Écrire des tests par habitude, non déduits des risques.
- ❌ Laisser l'IA promouvoir ses propres concepts sans validation (second ordre non borné).
- ❌ Affirmer la valeur sans mesure empirique.

---

## 10. Fiche de transformation (template de sortie)

```markdown
## Fiche de transformation — <TICKET-ID>
**Objectif Macro (d=0, É7)** : ...
**Invariants** : SLA / normes / sécurité ...
**Configuration retenue** : concepts × paramètres (justification par la criticité)
**Cartographie d'impact** : graphe de dépendances (explicites + détectées)
**Stratégie** : séquence de slots É1→É7, points de rollback
**Modifications** : par slot, avec liens commits
**Dossier de preuves** : tests déduits ↔ risques ↔ résultats
**Boucle de second ordre** : observations É6, adaptations, retro-commits
**Capitalisation** : entrées ajoutées à la base de connaissances
```
