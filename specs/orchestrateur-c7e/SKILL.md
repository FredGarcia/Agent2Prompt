---
name: orchestrateur-c7e
description: Orchestrateur fractal C7E, qui pilote la résolution d'un ticket full-stack comme la transformation maîtrisée d'un système vivant (cycle de l'Axiome 7E, déclinaison récursive imbriquée sur quatre profondeurs, concepts paramétrables, référentiel des méso-contrats qui classe chaque ticket et en fixe les options par couche, analyse des images PNG de l'objectif, fiche de transformation validée avant toute modification, tests déduits des risques, traçabilité Git compatible avec le kit des agents parallèles, boucle de second ordre bornée par un registre, valeur annoncée comme une hypothèse tant qu'elle n'est pas mesurée), avec le fichier des invariants du projet, meso-contrats. Adaptateur par défaut Java, Spring Boot, PostgreSQL, Liquibase et Angular. À activer au démarrage de l'IA locale, sur choix du développeur, pour les tickets qu'il lui confie.
version: 3.2.1
---

# Orchestrateur fractal C7E, version 3.2.1

Ce document est le point d'entrée du skill et contient la méthode. Il s'active au démarrage de l'IA locale, sur choix du développeur (§ 11.4), avec le fichier des invariants du projet, copie remplie du modèle `meso-contrats.md`. Ces deux fichiers suffisent au démarrage ; le référentiel des méso-contrats se lit à l'analyse de chaque ticket, et les autres fichiers quand un ticket touche leur domaine.

Fichiers du skill :

- `SKILL.md` : la méthode, ce document ;
- `meso-contrats.md` : modèle des invariants du projet (dimension D8), pré-rempli pour l'adaptateur par défaut, à copier dans le projet et à remplir par le développeur ;
- `socle/SKILL.md` : socle commun back-front (contrat OpenAPI, erreurs RFC 9457, formats, pagination, sécurité, traçabilité, accessibilité), inclus à une version épinglée ;
- `references/java.md` et `references/angular.md` : points d'entrée des experts Java et Angular. Ce sont des **référentiels** : l'IA y lit les versions cibles et les invariants que tout code produit doit respecter, sans adopter leur mode de travail ;
- `modules/referentiel/SKILL.md` : dimension D10, le référentiel des méso-contrats : catégories de tickets, options au choix par couche, analyse des images de l'objectif, modèle à installer dans le projet ;
- `modules/mesure/SKILL.md` : dimension réservée D9, à lire seulement pour comprendre le point d'extension E1.

Ordre de lecture au premier lancement : ce document en entier ; la copie du projet du fichier d'invariants ; `modules/referentiel/SKILL.md` ; `socle/SKILL.md` ; les sections « Versions cibles » et « Invariants » des deux référentiels. Aux lancements suivants, ce document et la copie du projet suffisent ; le module `referentiel` et le référentiel du projet se lisent à l'analyse de chaque ticket, le socle et les référentiels quand un ticket touche leur domaine.

---

## 0. Principe fondateur

> Ne pas traiter un ticket comme une modification de code, mais comme la
> **transformation maîtrisée d'un système vivant** : comprendre → modéliser →
> méthodiser → transformer → observer → adapter.

Pipeline fondamental (il remplace « Ticket → Prompt → Code → Tests ») :

```
Objectif → Modélisation → Méthode → Transformation → Observation → Adaptation
```

Ce pipeline se joue à chaque profondeur du CRI (§ 1.2). Son étape « Transformation » se décline par slot (§ 3) ; ses étapes « Observation » et « Adaptation » forment la boucle du § 6.

Deux ordres cybernétiques, à ne jamais confondre :

- **Ordre 1** (premier ordre) : l'IA observe le logiciel et le corrige.
- **Ordre 2** (second ordre) : l'IA observe sa propre manière d'analyser et de concevoir, et en propose l'adaptation. L'observateur, humain ou IA, fait partie de la boucle.

---

## 1. Ontologie unifiée

### 1.1 Le cycle 7E

L'Axiome 7E : *« Les Éléments dans l'Espace Engendrent un État d'Expression Évolutif de l'Environnement »*. Ses sept termes, dans leur ordre, nomment les slots É1 à É7. L'Outillage, É0, les précède comme précondition, hors axiome. La boucle se ferme en É7 : ce que l'Environnement renvoie (validation, mesures, retours) devient les Éléments du cycle suivant.

| Slot | Terme | Fonction dans un ticket | Adaptateur par défaut |
|------|-------|-------------------------|-----------------------|
| É0 | **Outillage** (hors axiome) | Préparer l'écosystème de travail. *Précondition : ne livre rien.* | Docker, PostgreSQL dans son conteneur, outils de build et de migration |
| É1 | **Éléments** | Stockage et schéma : structures de données persistantes | Changeset Liquibase, colonne PostgreSQL |
| É2 | **Espace** | Contexte, cache, flux de transit, état local | État du front, session, cache |
| É3 | **Engendrent** | Passerelles et contrats d'interface entre couches | Contrat OpenAPI, endpoint REST, DTO |
| É4 | **État** | Logique métier, traitement déclenché | Service Java exécuté à réception du signal |
| É5 | **Expression** | Interface utilisateur, rendu, interaction | Composant Angular, liaison `(click)`, états du bouton |
| É6 | **Évolutif** | Contrôle de l'évolution : tests déduits, mesures, dossier de preuves. *Entrée de la boucle de rétroaction* | Tests unitaires, d'intégration, de contrat et d'accessibilité ; métriques |
| É7 | **Environnement** | Livraison dans l'environnement, validation métier, mesures en usage, capitalisation. *Retour au cycle suivant* | Validation par le PO, livraison, indicateurs, rétrospective |

Les numéros É0 à É7 et leurs fonctions sont ceux de la version 3.0.0 ; seuls les noms de É0, É6 et É7 sont rendus à l'axiome (section 16).

### 1.2 La récursivité fractale (CRI) : quatre profondeurs

| Profondeur | Niveau | Contenu | Slots dominants | Preuve exigée (É6) |
|------------|--------|---------|-----------------|--------------------|
| d=0 | **Macro** | Objectif métier, invariants SLA, critères d'acceptation numérotés | É7 (ancrage) | Acceptation : chaque critère prouvé |
| d=1 | **Méso-contrats** | Interfaces entre couches : contrat d'API, schéma de base exposé | É1, É3 | Conformité du contrat ; migration jouée, annulée, rejouée |
| d=2 | **Méso-composants** | Implémentation des couches : services, dépôts, composants d'interface | É2, É4, É5 | Tests d'intégration et de composant |
| d=3 | **Micro** | Atomes : changeset, annotation `@Column`, liaison d'événement, ligne de code | tous les slots, à l'échelle de l'atome | Tests unitaires ciblés, lint, build |

**Règle d'isomorphisme** : toute contrainte descend de d=0 vers d=3 sans perte ; toute observation remonte de d=3 vers d=0 avec sa preuve, celle du niveau où elle a été faite. La structure du raisonnement est la même à chaque niveau (auto-similarité).

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

L'orchestrateur sélectionne et compose les concepts selon le ticket, l'environnement et les contraintes ; le registre (§ 7.2) dit lesquels sont utilisables. La bibliothèque est portable d'un framework à l'autre : les stacks (Java, Angular, PostgreSQL…) sont des **adaptateurs**, jamais des concepts. Un adaptateur, c'est la colonne « Adaptateur par défaut » du § 1.1, le fichier d'invariants du projet et les référentiels de la stack (point d'extension E2).

---

## 2. Matrice d'activation (mixage paramétrique par défaut)

| Concept | Poids | Paramètres d'entrée | Rôle |
|---|---|---|---|
| `C_METHODE_001` Composition récursive imbriquée | 0.35 | `max_depth=3`, `self_similarity=true` | Descente fractale Macro → Micro, propagation isomorphe |
| `C_CYBERNETIQUE_001` Cybernétique de second ordre | 0.25 | `observer_included=true`, `resonance_loop=true` | Rétroaction, adaptation de la méthode |
| `C_AGILE_001` Ingénierie agile (domaine) | 0.25 | `framework` (Scrum ou Kanban), `granularity` (ticket ou US), `stack_adapters=[postgres, liquibase, spring, angular]` | Contexte d'application concret |
| `C_PEDAGOGIE_001` Modélisation pédagogique | 0.15 | `rigor=0.95`, `format` (synoptique, puis code) | Restitution structurée et auditable |

**Les poids sont des priorités déclarées, pas des mesures.** Ils ordonnent l'attention et la place de chaque concept dans la fiche ; un concept de poids nul n'est pas activé. Ils ne se calculent pas et ne s'additionnent à aucun indicateur. L'IA inscrit dans la fiche les poids retenus et leur justification (D2.INV-1).

Paramètres sans unité, définis pour être vérifiables :

- `rigor=0.95` : au moins 95 % des décisions de la fiche citent leur preuve (`fichier:ligne`, commande et sortie, réponse du développeur) ; c'est l'indicateur T du § 8 ;
- `format` : la fiche commence par une synthèse d'une page au plus ; le détail, puis le code, viennent ensuite.

**Sélection adaptative** : pour un ticket, l'IA règle les poids et les paramètres selon sa complexité, sa criticité et la profondeur de son impact (§ 7.1, mode hybride), et l'inscrit dans sa fiche. Les valeurs par défaut de ce tableau ne changent que par le registre (§ 7.2).

---

## 3. Pipeline d'exécution par slot

Pour chaque ticket, l'orchestrateur produit une **fiche de transformation** (§ 10), en deux temps séparés par la validation du développeur.

**Analyse (d=0), avant toute modification**

1. Lire le ticket (§ 11.1) et ses critères d'acceptation ; les numéroter `<CLÉ>-CAnn` s'ils ne le sont pas déjà, au format d'`agent-tdd-jira` (agent-tdd-jira:D10.INV-1).
2. Lire l'architecture réelle : code, contrat, migrations, tests existants, conventions du projet. Si le skill `skill4appli` est installé, ses emplacements `chemin:ligne` accélèrent la lecture ; le disque fait foi.
3. Cartographier l'impact : dépendances explicites et détectées, autres consommateurs (écrans, batchs, autres services).
4. Classer le ticket dans le référentiel des méso-contrats du projet, choisir ses options par couche et analyser les images de l'objectif demandées ; le tout s'écrit dans `ticket.toml` et `analyse-image.md` (module `referentiel`, D10.INV-1, D10.INV-2, D10.INV-4).
5. Choisir la configuration (§ 2, § 7.1).
6. Déduire les tests des critères et des risques, y compris les preuves des options retenues (§ 5.2, D10.INV-3).
7. Présenter la fiche au développeur : objectif, critères, méso-contrat et options, invariants, configuration, cartographie, stratégie et tests déduits, avec `ticket.toml` et l'analyse d'image s'il y en a une. **Point de validation** : rien n'est modifié avant sa réponse (D3.INV-1).

**Transformation, après la validation**

1. **É0, préparer** : vérifier l'environnement, les droits et l'outillage. *Gate : environnement reproductible.*
2. **É1, schéma** : concevoir le changeset, versionné, réversible, idempotent ; vérifier la nullabilité, les données historiques et le risque de verrouillage (fichier d'invariants, § 1).
3. **É3, contrat** : endpoint et contrat d'interface alignés sur les conventions existantes et sur le socle (verbes HTTP, statuts, OpenAPI). *Gate contrats, fin de d=1 : le schéma exposé (É1) et le contrat (É3), conçus ensemble, sont validés avant toute implémentation de niveau d=2 ou d=3, changeset compris (D3.INV-2).*
4. **É1, écriture du changeset**, puis **É2, espace** : où vit l'état (cache, store), comment circulent les flux.
5. **É4, logique** : service métier déclenché par le seul signal d'appel.
6. **É5, expression** : interface qui consomme le contrat ; un comportement obsolète (par exemple le chargement automatique dans `ngOnInit`) se retire après l'analyse d'impact de ses consommateurs.
7. **É6, évolutif** : exécuter tous les tests déduits et les gates (§ 5.1), mesurer, produire le **dossier de preuves**. Les tests ont été déduits à l'analyse ; dans un projet en TDD (méthode d'`agent-tdd-jira`), chacun s'écrit avant le code qu'il prouve et échoue d'abord pour la raison attendue.
8. **É7, environnement** : remettre la fiche complète au développeur (D3.INV-3). La validation métier, la livraison et la mesure en usage appartiennent à l'équipe : l'IA ne publie rien (D4.INV-3). Capitaliser (§ 6) et clore par une rétrospective de second ordre.

---

## 4. Traçabilité Git (isomorphisme CRI ⟷ Git)

| Niveau | Profondeur | Objet Git | Convention par défaut |
|---|---|---|---|
| Macro | d=0 | Livraison | Tag posé par le développeur, selon la convention du projet (par défaut `vX.Y.Z`) ; jamais par l'IA |
| Méso | d=1, d=2 | La branche du ticket | **Une seule branche par ticket**, au format du projet ; par défaut celui du kit `agents-paralleles-gitlab` : `<type>/<CLÉ>-<slug>` (agents-paralleles-gitlab:D1.INV-1) |
| Micro | d=3 | Commits atomiques, un slot par commit | Format ci-dessous |

**Format de commit** :

```
<CLÉ> : [É<n>-<DOMAINE>] <type>(<portée>): <description>

<corps facultatif : impact récursif, observation qui a déclenché une rétroaction>
```

- `<CLÉ> : ` en tête, ou `<CLÉ> Snn : ` pour un commit de scénario d'`agent-tdd-jira` : c'est ce qu'exige le hook `commit-msg` du kit, et ce que cherche la matrice de traçabilité d'`agent-tdd-jira` (agents-paralleles-gitlab:D2.INV-2) ;
- `[É<n>-<DOMAINE>]` : le slot et son domaine (`DB`, `API`, `SVC`, `UI`, `TEST`, `C7E`…) ;
- `<type>` : `feat`, `fix`, `refactor`, `test`, `chore` ou `docs` ; la description est dans la langue du projet.

Exemples, ticket fil rouge « chargement à la demande » :

- `ABCDE-3512 : [É1-DB] feat(liquibase): ajouter la colonne mode_chargement`
- `ABCDE-3512 : [É3-API] feat(spring): exposer GET /api/v1/donnees`
- `ABCDE-3512 : [É5-UI] feat(angular): charger au clic au lieu de ngOnInit`
- `ABCDE-3512 : [É6-TEST] test(integration): couvrir l'endpoint et les états de l'écran`

**Commit de rétroaction (premier ordre)** : le logiciel est corrigé d'après l'observation de ses propres résultats, et le commit cite cette observation (D6.INV-1).

```
ABCDE-3512 : [É1-DB] fix(liquibase): indexer mode_chargement après la latence mesurée en É6

Observation : p95 de GET /api/v1/donnees à 840 ms pour un seuil de 300 ms (dossier de preuves).
```

**Second ordre** : la question « pourquoi l'analyse n'a-t-elle pas prévu cet index ? » ne se règle pas par un commit de code. Elle produit une entrée `proposed` du registre des concepts (§ 6, § 7.2), commitée à part : `ABCDE-3512 : [É7-C7E] docs(c7e): proposer l'évaluation d'un index pour toute colonne filtrée`.

L'historique Git est le **journal du premier ordre** ; le registre des concepts est celui du second.

**Publication** : l'IA commite localement, après la validation de la fiche. Elle ne pousse pas, ne fusionne pas, ne rebase pas, ne réécrit pas l'historique et ne pose aucun tag (D4.INV-3). Dans un worktree du kit, un refus « REFUS : » d'un hook l'arrête : elle le cite au développeur, sans le contourner.

---

## 5. Gates d'activation et déduction des tests

### 5.1 Gates

- **Gate Micro → Méso**, à chaque commit, avant de le proposer : build, lint et tests ciblés, lancés par l'IA. L'alignement des types se vérifie par construction :
  - SQL ↔ JPA : `spring.jpa.hibernate.ddl-auto=validate` sur le schéma migré par Liquibase, dans un PostgreSQL de test (java:D4.INV-1, java:D4.INV-5) ;
  - JPA et DTO ↔ TypeScript : client généré depuis le contrat (SC1.INV-3) et test de conformité du contrat (SC1.INV-1).
- **Gate contrats**, fin de d=1 : schéma exposé et contrat OpenAPI validés par le développeur, ou par le relecteur que nomme le fichier d'invariants, avant toute implémentation de niveau d=2 (D3.INV-2).
- **Gate Méso → Macro**, avant la remise, puis en CI sur la branche d'intégration du projet (par défaut `develop`) :
  - conformité du contrat (SC1.INV-1) et absence de changement cassant (SC1.INV-2) ;
  - migrations jouées, annulées et rejouées sur une copie de la base de référence (commande Liquibase `update-testing-rollback`) ;
  - tests d'intégration ;
  - contrôles de sécurité : accès anonyme refusé sur chaque endpoint protégé (SC4.INV-2), recherche de secrets.

Le niveau de preuve exigé suit la criticité du ticket (grille du fichier d'invariants, § 5) ; la remise n'a lieu qu'après les gates de ce niveau (D5.INV-3).

### 5.2 Déduction des tests depuis les risques (jamais par habitude)

| Situation identifiée | Test attendu |
|---|---|
| Migration sur un schéma existant | Migration jouée sur une base préexistante, annulée, puis rejouée |
| Nouvelle colonne | Nullabilité, valeur par défaut, données historiques |
| Nouvel endpoint | Réponse conforme au contrat ; Problem Details sur chaque erreur (SC2.INV-1) |
| Nouvel endpoint de collection | Pagination et taille maximale (SC3.INV-3) |
| Utilisateur non authentifié | 401 |
| Utilisateur authentifié sans le droit | 403 |
| Chargement à la demande | Aucun appel au chargement initial |
| Clic sur le bouton | Exactement un appel |
| Erreur de l'API | État d'erreur affiché, message tiré de `code`, `traceId` copiable, annonce aux technologies d'assistance |
| Double clic | Un seul appel tant que le premier n'a pas répondu |
| Suppression d'un comportement ancien | Non-régression des écrans consommateurs |
| Batch ou autre consommateur | Absence d'impact, vérifiée par ses tests ou par la cartographie |

Chaque test **proposé pour le ticket** prouve un critère d'acceptation `<CLÉ>-CAnn` ou un risque de la cartographie ; un test qui ne prouve ni l'un ni l'autre n'est pas écrit (D5.INV-1). Les tests déduits le sont à l'analyse, avant toute modification, pour que le code ne les façonne pas ; les tests existants du projet ne sont jamais supprimés ni affaiblis sans l'accord du développeur (D5.INV-2).

Les options retenues dans `ticket.toml` apportent les preuves que le référentiel leur associe, et les méso-contrats transverses des couches touchées leurs exigences : elles entrent dans les tests déduits, comme preuves des risques que portent ces options (D10.INV-2, D10.INV-3).

---

## 6. Boucle cybernétique de second ordre

1. **Capturer** : en É6 et É7, mesurer l'écart entre l'objectif (d=0) et le résultat (d=3).
2. **Corriger, au premier ordre** : traduire l'écart en correction du logiciel, au niveau de sa cause (par exemple une latence méso corrigée par un index au niveau micro, en É1) ; commit de rétroaction qui cite son observation (§ 4).
3. **Questionner, au second ordre** : chercher ce que la méthode n'a pas vu : concept absent, paramètre mal réglé, risque non déduit.
4. **Proposer** : inscrire l'adaptation comme entrée `proposed` du registre des concepts (§ 7.2), avec l'observation qui la fonde (D6.INV-1).
5. **Capitaliser** : inscrire l'observation dans la base de connaissances (§ 11.2) : conventions, dépendances, échecs récurrents, stratégies efficaces.
6. **Configurer le ticket suivant** : pour un ticket, l'IA règle les poids et les paramètres de sa configuration (mode hybride) et les inscrit dans sa fiche ; les valeurs par défaut et la bibliothèque ne changent que par le registre (D6.INV-2).

**Principe de résonance** : *« L'état des sources infinies se transmet à qui entre en résonance avec elles »* ; chaque état émergent peut devenir la source du niveau suivant, et qui le reçoit devient source à son tour. Au premier ordre, une dégradation mesurée au niveau Macro (SLA) se trace jusqu'à sa cause Micro et s'y corrige, sans casser les niveaux intermédiaires. Au second ordre, l'observation capitalisée d'un ticket devient la source des tickets suivants, et le retour de l'Environnement (É7) devient les Éléments (É1) du cycle suivant.

---

## 7. Modes de modulation et gouvernance

### 7.1 Modes

- **A, externe** : le développeur fournit tous les paramètres.
- **B, autonome** : l'IA détermine les paramètres et la méthode.
- **C, hybride (défaut)** : le développeur fixe les invariants (SLA, normes, périmètre de preuve) ; l'IA règle les paramètres opérationnels et se réajuste.

Dans tous les modes, les invariants du projet, du socle et des référentiels s'appliquent, et la fiche est validée avant toute modification : un mode ne règle que des paramètres opérationnels (D2.INV-2).

La configuration se choisit selon la complexité × la criticité × la profondeur d'impact × le niveau de preuve attendu, d'après la grille de criticité du fichier d'invariants (§ 5) :

- ticket trivial : configuration légère, peu de concepts, faible profondeur ;
- ticket multi-couches critique : configuration profonde, tous les concepts, `max_depth=3`, preuves exigées.

### 7.2 Registre des concepts et second ordre borné

| Statut | Signification | Droits |
|---|---|---|
| `validated` | promu par une revue humaine documentée | utilisable sur tout ticket |
| `experimental` | en cours de mesure | utilisable avec mention dans la fiche, hors chemin critique (criticité « critique » du fichier d'invariants) |
| `proposed` | soumis par l'IA ou par un humain | inutilisable avant sa promotion |

Promotion `proposed → experimental → validated` par revue humaine documentée : nom du relecteur, date et motif, inscrits dans l'entrée. L'IA ajoute des entrées `proposed` ; elle ne promeut, ne modifie ni ne retire aucune entrée (D6.INV-2). **La capacité de second ordre est bornée par ce registre.**

Registre de départ, `docs/c7e/concepts.json` (§ 11.2). Les quatre concepts du § 2 y sont `validated` par la ratification de cette version de la spécification, revue documentée dans le journal des modifications du dépôt Agent2Prompt :

```json
{
  "schemaVersion": 1,
  "concepts": [
    {
      "id": "C_METHODE_001",
      "name": "Composition récursive imbriquée (CRI)",
      "version": "1.0.0",
      "status": "validated",
      "invariants": ["toute contrainte descend de d=0 à d=3 sans perte", "toute observation remonte de d=3 à d=0 avec sa preuve"],
      "inputs": { "ticket": "objectif et critères d'acceptation", "architecture": "code réel du projet" },
      "parameters": { "max_depth": 3, "self_similarity": true },
      "activation_rules": ["toujours actif"],
      "operations": ["décliner l'objectif en contrats (d=1)", "décliner les contrats en composants (d=2)", "décliner les composants en atomes (d=3)"],
      "outputs": { "fiche": "cartographie d'impact par profondeur et par slot" },
      "evaluation": { "indicateur": "R", "mesure": "dépendances couvertes / dépendances identifiées" },
      "feedback": { "enabled": true, "adaptation": true }
    },
    {
      "id": "C_CYBERNETIQUE_001",
      "name": "Cybernétique de second ordre",
      "version": "1.0.0",
      "status": "validated",
      "invariants": ["l'observateur fait partie de la boucle", "aucune adaptation de la méthode sans entrée proposed promue par un humain"],
      "inputs": { "observations": "écarts mesurés en É6 et É7" },
      "parameters": { "observer_included": true, "resonance_loop": true },
      "activation_rules": ["toujours actif"],
      "operations": ["capturer l'écart", "corriger au premier ordre", "questionner la méthode", "proposer une entrée du registre", "capitaliser"],
      "outputs": { "fiche": "boucle de second ordre", "registre": "entrées proposed" },
      "evaluation": { "indicateur": "A", "mesure": "jugement du développeur sur la pertinence de la configuration" },
      "feedback": { "enabled": true, "adaptation": true }
    },
    {
      "id": "C_AGILE_001",
      "name": "Ingénierie agile (domaine)",
      "version": "1.0.0",
      "status": "validated",
      "invariants": ["chaque test proposé prouve un critère d'acceptation ou un risque"],
      "inputs": { "ticket": "US et critères d'acceptation numérotés" },
      "parameters": { "framework": "Scrum ou Kanban, celui de l'équipe", "granularity": "ticket ou US", "stack_adapters": ["postgres", "liquibase", "spring", "angular"] },
      "activation_rules": ["toujours actif"],
      "operations": ["numéroter les critères", "déduire les tests des critères et des risques"],
      "outputs": { "fiche": "critères, tests déduits, dossier de preuves" },
      "evaluation": { "indicateur": "Q", "mesure": "conventions respectées et cas limites couverts" },
      "feedback": { "enabled": true, "adaptation": true }
    },
    {
      "id": "C_PEDAGOGIE_001",
      "name": "Modélisation pédagogique",
      "version": "1.0.0",
      "status": "validated",
      "invariants": ["chaque décision de la fiche cite sa preuve"],
      "inputs": { "fiche": "décisions et preuves" },
      "parameters": { "rigor": 0.95, "format": "synoptique, puis code" },
      "activation_rules": ["toujours actif"],
      "operations": ["synthèse d'une page au plus avant le détail", "relier chaque décision à sa preuve"],
      "outputs": { "fiche": "restitution structurée et auditable" },
      "evaluation": { "indicateur": "T", "mesure": "décisions prouvées / décisions" },
      "feedback": { "enabled": true, "adaptation": true }
    }
  ]
}
```

---

## 8. Mesure de la valeur (à instancier avant tout usage commercial)

Indice de valeur d'un ticket :

```
V = ωq·Q + ωr·R + ωt·T + ωc·C + ωa·A ,  avec Σω = 1 et chaque indicateur entre 0 et 1
```

| Symbole | Indicateur | Calcul | ω par défaut |
|---|---|---|---|
| Q | Qualité | moyenne de deux parts : conventions respectées / conventions applicables, et cas limites couverts / cas limites identifiés | 0.25 |
| R | Maîtrise des risques | dépendances couvertes / dépendances identifiées, explicites et détectées | 0.25 |
| T | Traçabilité | décisions de la fiche justifiées par une preuve / décisions de la fiche | 0.15 |
| C | Capitalisation | connaissances réutilisées / connaissances applicables au ticket | 0.20 |
| A | Adaptabilité méthodologique | jugement du développeur sur la pertinence de la configuration retenue, noté de 0 à 1 | 0.15 |

Chaque fiche consigne ces indicateurs et leur calcul (point d'extension E1, D7.INV-2).

Protocole minimal de mesure : au moins dix tickets comparables, traités avec la méthode C7E et sans elle (base de comparaison), un évaluateur indépendant, sans double comptage des bénéfices. Tant que cette mesure n'existe pas, toute valeur annoncée reste une **hypothèse**, et se dit telle au commanditaire (D7.INV-1). La campagne elle-même est la dimension réservée D9.

---

## 9. Anti-patterns

- ❌ Traiter un ticket comme un prompt isolé (ordre 0).
- ❌ Produire du code conforme mais sans analyse d'impact (ordre 1 sans CRI).
- ❌ Imposer une architecture théorique au lieu de lire l'architecture réelle.
- ❌ Écrire des tests par habitude, non déduits des risques, ou supprimer un test existant parce qu'il ne prouve rien du ticket.
- ❌ Appeler « second ordre » une correction du logiciel : c'est du premier ordre.
- ❌ Laisser l'IA promouvoir ses propres concepts, ou modifier le fichier d'invariants du projet (second ordre non borné).
- ❌ Contourner un garde-fou du projet (hook, gate, invariant) au lieu de le signaler.
- ❌ Affirmer la valeur sans mesure empirique.

---

## 10. Fiche de transformation (modèle de sortie)

Rangée à `docs/demandes/<CLÉ>/fiche-transformation.md` (§ 11.2). La première partie se présente avant toute modification ; la seconde se remplit pendant la transformation.

```markdown
## Fiche de transformation : <CLÉ>

**Synthèse** : une page au plus
**Objectif Macro (d=0, É7)** : ...
**Critères d'acceptation** : <CLÉ>-CA01, <CLÉ>-CA02 ... (provenance de chacun)
**Méso-contrat** : identifiant, code, version du référentiel ; options retenues par couche (`ticket.toml`) ; méso-contrats transverses appliqués
**Analyse d'image** : `analyse-image.md`, s'il y a lieu ; questions posées au développeur
**Invariants** : SLA, normes, sécurité ; version lue du fichier d'invariants du projet
**Configuration retenue** : mode ; concepts × poids × paramètres ; profondeur ; niveau de preuve ; justification par la criticité
**Cartographie d'impact** : dépendances explicites et détectées, consommateurs
**Stratégie** : séquence des slots É0 → É7, gate contrats, points de retour arrière
**Tests déduits** : test ↔ critère ou risque

— validation du développeur : nom, date —

**Modifications** : par slot, avec les commits
**Dossier de preuves** : test ↔ critère ou risque ↔ résultat ; gates passées
**Écarts** : lignes ajoutées au registre des écarts
**Boucle de second ordre** : observations É6 et É7, commits de rétroaction, entrées proposed
**Capitalisation** : entrées ajoutées à la base de connaissances
**Indicateurs** : Q, R, T, C, A et leur calcul
```

---

## 11. Entrées, emplacements et démarrage

### 11.1 Entrées

Un ticket : sa capture MHTML, par défaut celle du dossier `IA/` que produit le skill `capture-sprint-jira`, lue sans être modifiée ; ou son texte, collé par le développeur. L'IA en tire le titre, la description, les critères d'acceptation et les commentaires, et signale ce qu'elle n'a pas pu lire. La clé du ticket (`ABCDE-3512`) nomme sa branche, ses commits et sa fiche.

### 11.2 Emplacements dans le projet

| Fichier | Rôle | Qui l'écrit | Emplacement par défaut |
|---|---|---|---|
| le skill | méthode, modèles, socle, référentiels | personne après l'installation : il reste identique à la transmission | `.skills/orchestrateur-c7e/`, ou `.gemini/skills/orchestrateur-c7e/` pour un chargement au choix (§ 11.4) ; hors de l'arbre suivi, masqué à Git et lisible par l'IA locale (§ 11.3) |
| invariants du projet | copie remplie de `meso-contrats.md` | le développeur seul | `docs/c7e/meso-contrats.md` |
| registre des écarts | un écart par ligne, avec sa décision | l'IA ajoute des lignes ; le développeur décide | `docs/c7e/registre-ecarts.md` |
| registre des concepts | bibliothèque de concepts (§ 7.2) | l'IA ajoute des entrées `proposed` ; le développeur promeut | `docs/c7e/concepts.json` |
| base de connaissances | conventions, dépendances, échecs récurrents, stratégies efficaces | l'IA ajoute ; le développeur relit | `docs/c7e/connaissances.md` |
| fiche de transformation | une par ticket (§ 10) | l'IA | `docs/demandes/<CLÉ>/fiche-transformation.md` |
| référentiel des méso-contrats | catégories de tickets, options par couche, transverses (D10) | le développeur, à partir du modèle du module `referentiel` | `docs/c7e/referentiel-meso-contrats.toml` |
| instance du ticket | méso-contrat et options retenues | l'IA propose ; le développeur valide avec la fiche | `docs/demandes/<CLÉ>/ticket.toml` |
| analyse d'image | une par ticket qui la demande | l'IA ; validée avec la fiche | `docs/demandes/<CLÉ>/analyse-image.md` |
| images de l'objectif | maquettes ou captures PNG | le développeur ou le PO | `docs/demandes/<CLÉ>/maquettes/` |

Les fichiers de `docs/` sont versionnés avec le projet : ce qu'un ticket capitalise devient commun à la fusion de sa branche, après revue. Si l'équipe ne les versionne pas, le fichier d'invariants du projet en fixe d'autres emplacements (`meso-contrats.md`, § 6).

### 11.3 Installation, une fois par projet

1. Matérialiser le skill à l'identique de la transmission, hors de l'arbre suivi : dans `.skills/orchestrateur-c7e/` pour un chargement permanent, dans `.gemini/skills/orchestrateur-c7e/` pour un chargement au choix, ou au niveau utilisateur avec le kit `agents-paralleles-gitlab` (§ 11.4). L'installateur du dépôt Agent2Prompt, `tools/installer.mjs`, fait cette étape et la suivante sans IA, et vérifie chaque fichier par son empreinte.
2. Masquer le skill à Git sans le rendre illisible pour l'IA locale. Dans un clone ordinaire, l'outil de lecture de fichiers de Gemini CLI refuse ce qu'exclut `.git/info/exclude` : un skill exclu ainsi ne livre que ce document à l'activation, et ses autres fichiers sont refusés. Ajouter donc à `.git/info/exclude` le dossier du skill et `/.geminiignore`, et à `.geminiignore` une négation par niveau de dossier : `!/.gemini/`, `!/.gemini/skills/` et `!/.gemini/skills/orchestrateur-c7e/` en chargement au choix ; `!/.skills/` et `!/.skills/orchestrateur-c7e/` en chargement permanent. Au niveau utilisateur, hors de tout dépôt, rien n'est à masquer.
3. Copier `meso-contrats.md` à `docs/c7e/meso-contrats.md` ; le développeur remplit les valeurs `ADAPTER`, et l'IA lui liste celles qui restent (D8.INV-1).
4. Écrire le modèle du référentiel des méso-contrats dans `docs/c7e/referentiel-meso-contrats.toml`, à l'identique, et en vérifier l'empreinte (module `referentiel`, § 6) ; le développeur y adapte les catégories et les options permises.
5. Créer `docs/c7e/registre-ecarts.md` (modèle à la fin de `meso-contrats.md`), `docs/c7e/concepts.json` (registre de départ, § 7.2) et `docs/c7e/connaissances.md`, vide.
6. Proposer le fichier de démarrage et, pour un chargement au choix, la commande `/c7e` (§ 11.4) ; ne les créer qu'avec l'accord du développeur.

### 11.4 Démarrage de l'IA locale

Le skill ne s'applique qu'au choix du développeur (D2.INV-3), selon l'un de deux chargements :

| Chargement | Le choix se fait | Au démarrage, le contexte contient |
|---|---|---|
| permanent | une fois, par l'import du fichier de démarrage | ce document et le fichier d'invariants |
| au choix | à chaque session, au menu ou par la commande `/c7e` | le nom et la description du skill, et le menu |

Le chargement au choix convient dès que toutes les sessions ne traitent pas leurs tickets par la méthode. Ces deux chargements ne sont pas les modes de modulation A, B et C du § 7.1, qui règlent la méthode une fois le skill choisi.

**Chargement permanent.** Le fichier de démarrage importe les deux fichiers :

```markdown
# IA locale du projet

@./.skills/orchestrateur-c7e/SKILL.md
@./docs/c7e/meso-contrats.md

Pour chaque ticket confié, applique l'orchestrateur C7E : fiche de transformation,
validation par le développeur, puis transformation par slot.
```

**Chargement au choix.** Le skill est installé comme skill de Gemini CLI, dans `.gemini/skills/orchestrateur-c7e/` : seuls son nom et sa description se chargent au démarrage, le reste à son activation, que Gemini CLI fait confirmer. Le fichier de démarrage propose le choix, sans rien importer du skill :

```markdown
# IA locale du projet

À ton premier message, avant tout autre travail, propose ce choix et attends la réponse :

0. Sans orchestrateur.
1. Avec l'orchestrateur C7E.

- N'active jamais le skill orchestrateur-c7e sans ce choix.
- Avec l'orchestrateur : active le skill et lis docs/c7e/meso-contrats.md ; pour chaque ticket
  confié, classe-le dans docs/c7e/referentiel-meso-contrats.toml et présente ticket.toml
  avec la fiche.
- Sans orchestrateur : n'applique aucune règle du skill.
```

La commande `/c7e` fait le même choix sans passer par le menu, et confie le ticket d'un même geste : `/c7e ABCDE-3512`, ou `/c7e ABCDE-3512 M01` pour imposer le méso-contrat. Fichier `.gemini/commands/c7e.toml` :

```toml
description = "Orchestrateur C7E : activer le skill et traiter le ticket donné"
prompt = """
Active le skill orchestrateur-c7e pour la suite de la session.
Fichier d'invariants du projet :
@{docs/c7e/meso-contrats.md}
Référentiel des méso-contrats du projet :
@{docs/c7e/referentiel-meso-contrats.toml}
Ticket, et méso-contrat imposé s'il est précisé : {{args}}
"""
```

- **Gemini CLI** lit `GEMINI.md` au démarrage : le fichier global, celui du projet et ceux de ses dossiers parents ; il y développe les imports `@chemin`. Un autre nom se déclare dans `context.fileName` de `.gemini/settings.json`, qui accepte une liste, avec la casse exacte du fichier : `{ "context": { "fileName": ["GEMINI.md", "README.md"] } }`. Gemini CLI cherche aussi les fichiers de ce nom dans les dossiers que ses outils lisent : nommé `README.md`, le contexte s'enrichirait des autres `README.md` du projet ; un nom propre à l'IA locale l'évite.
- **Commandes de Gemini CLI** : elles injectent les `@{…}` en respectant les exclusions de Git et `.geminiignore`. Le skill passe par son activation, jamais par une injection : Gemini CLI livre alors ce document et la liste des fichiers du skill, que l'IA lit ensuite, d'où les négations du § 11.3 ; les fichiers de `docs/c7e/` et les images de l'objectif, versionnés, s'injectent.
- **Confiance des dossiers** : quand elle est activée dans Gemini CLI, les skills du workspace ne se chargent que dans un dossier de confiance ; ceux du niveau utilisateur, toujours.
- **Vérifications** : `/memory show` affiche le fichier de démarrage, `/skills list` le skill, `/commands list` la commande ; après une modification, `/memory reload`, `/skills reload` ou `/commands reload`.
- **Claude Code** lit `CLAUDE.md` et y importe de même les fichiers désignés par `@chemin`.
- **Kit `agents-paralleles-gitlab`** : en chargement permanent, le fichier de démarrage se pose à la racine du kit, dossier parent des worktrees, que Gemini CLI lit aussi ; il importe `@./.skills/orchestrateur-c7e/SKILL.md` et `@./main/docs/c7e/meso-contrats.md`, la copie du worktree de référence, jamais celle d'une demande en cours. En chargement au choix, le skill et la commande vont au niveau utilisateur, `~/.gemini/skills/` et `~/.gemini/commands/` : une installation sert tous les worktrees, et les chemins `docs/c7e/…` se lisent dans le worktree où Gemini CLI est lancé.
- **Lancement sans interface**, par un outil qui relance Gemini CLI à chaque message : l'outil retient le choix et le rejoue à chaque appel, la confirmation d'activation supposant une interface.

Le mode d'emploi du dépôt Agent2Prompt, `docs/orchestrateur-c7e/mode-emploi.md`, détaille ces étapes.

### 11.5 Précédence des règles

1. Le socle, pour tout ce qui traverse la frontière back-front.
2. Les invariants des référentiels Java et Angular, pour tout code produit.
3. Le fichier d'invariants du projet, qui les précise sans les contredire (D8.INV-2).
4. La méthode de ce skill.
5. Les paramètres opérationnels que règle l'IA.

Une contradiction entre deux niveaux se signale et s'inscrit au registre des écarts ; elle ne se tranche pas en silence (D6.INV-3).

---

## 12. Registre des dimensions

| ID | Dimension | Introduite | Statut 3.2.1 | Dépend de | Où |
|---|---|---|---|---|---|
| D1 | Ontologie : cycle 7E, profondeurs du CRI, concepts paramétrables | 3.1 | active | | `SKILL.md`, § 1 |
| D2 | Configuration : matrice d'activation, modes de modulation, choix du démarrage | 3.1 | active | D1 | § 2, § 7.1, § 11.4 |
| D3 | Pipeline par slot et fiche de transformation | 3.1 | active | D1, D2 | § 3, § 10 |
| D4 | Traçabilité Git | 3.1 | active | D3 | § 4 |
| D5 | Gates et tests déduits des risques | 3.1 | active | D3, socle | § 5 |
| D6 | Boucle de second ordre et registre des concepts | 3.1 | active | D3, D5 | § 6, § 7.2 |
| D7 | Valeur annoncée et indicateurs | 3.1 | active | D3 | § 8 |
| D8 | Invariants du projet | 3.1 | active | D1 à D7, socle | `meso-contrats.md` |
| D9 | Campagne de mesure de la valeur | 3.1 | reserved | D7 | `modules/mesure/SKILL.md` |
| D10 | Référentiel des méso-contrats : catégories de tickets, options par couche, analyse des images de l'objectif | 3.2 | active | D3, D5, D8 | `modules/referentiel/SKILL.md` |

La méthode tient en un seul fichier pour se charger au démarrage : D1 à D7 sont décrites dans ce document plutôt que dans des modules séparés ; D8 est le modèle du fichier d'invariants du projet ; D10, qui se lit à l'analyse de chaque ticket, est un module.

## 13. Contrat de version et points d'extension

Le skill suit le contrat de version de `EVOLUTION.md` du dépôt Agent2Prompt. La version 3.0.0, remise par le développeur, est archivée telle quelle avec son fichier d'invariants (`archives/`), comme les versions 3.1.0 et 3.2.0 et le modèle de référentiel remis en 2.0.0. Le socle et les deux référentiels sont épinglés dans `manifest.json`.

Points d'extension, actifs dès 3.1.0 :

- **E1** : chaque fiche consigne la configuration retenue et les indicateurs Q, R, T, C, A avec leur calcul ; la campagne de mesure (D9) les agrégera sans réécrire de fiche.
- **E2** : un adaptateur de stack est la colonne « Adaptateur par défaut » du § 1.1, le fichier d'invariants du projet, les référentiels de la stack, et les technologies et options du référentiel des méso-contrats ; une autre stack s'ajoute par d'autres fichiers de ce type, sans changer D1 à D7.
- **E3** : le registre des concepts porte `schemaVersion` ; un registre partagé entre projets pourra le lire sans conversion.

## 14. Invariants

**D1 : ontologie**

- **D1.INV-1** : chaque modification du ticket est rattachée à un slot (É1 à É7) et à une profondeur (d=0 à d=3), dans la fiche et dans le message de son commit.
- **D1.INV-2** : les slots É1 à É7 portent les sept termes de l'Axiome 7E, dans leur ordre ; É0, l'Outillage, est une précondition hors axiome, qui ne livre rien.

**D2 : configuration**

- **D2.INV-1** : la fiche déclare le mode, les concepts activés avec leurs poids et leurs paramètres, la profondeur et le niveau de preuve, et justifie cette configuration par la criticité du ticket, selon la grille du fichier d'invariants du projet.
- **D2.INV-2** : dans tous les modes, les invariants du projet, du socle et des référentiels s'appliquent ; un mode ne règle que des paramètres opérationnels.
- **D2.INV-3** : le skill ne s'applique qu'au choix du développeur : en chargement permanent, par l'import de son fichier de démarrage ; en chargement au choix, par sa réponse au menu ou par la commande `/c7e`. Sans ce choix, l'IA n'applique aucune règle du skill et ne l'active pas d'elle-même.

**D3 : pipeline et fiche**

- **D3.INV-1** : aucune modification du code, du schéma ni de la configuration du projet avant que le développeur ait validé la fiche : objectif, critères, invariants, configuration, cartographie d'impact, stratégie et tests déduits.
- **D3.INV-2** : les contrats de niveau d=1, schéma exposé (É1) et contrat OpenAPI (É3), sont validés avant toute implémentation de niveau d=2 ou d=3.
- **D3.INV-3** : à la remise, la fiche est complète (modifications, dossier de preuves, écarts, boucle, capitalisation, indicateurs) et rangée à son emplacement.

**D4 : Git**

- **D4.INV-1** : un ticket a une seule branche, au format du projet, par défaut `<type>/<CLÉ>-<slug>` (agents-paralleles-gitlab:D1.INV-1) ; aucune branche par slot.
- **D4.INV-2** : chaque commit commence par `<CLÉ> : ` ou `<CLÉ> Snn : ` (agents-paralleles-gitlab:D2.INV-2), suivi de l'étiquette `[É<n>-<DOMAINE>]` de son unique slot.
- **D4.INV-3** : l'IA ne pousse pas, ne fusionne pas, ne rebase pas, ne réécrit pas l'historique et ne pose aucun tag ; un refus d'un hook l'arrête et se cite au développeur, sans contournement.

**D5 : gates et tests**

- **D5.INV-1** : chaque test proposé pour le ticket prouve un critère d'acceptation numéroté (agent-tdd-jira:D10.INV-1) ou un risque de la cartographie ; le dossier de preuves relie chaque test à son critère ou à son risque, et à son résultat.
- **D5.INV-2** : les tests sont déduits des risques avant toute modification ; aucun test existant n'est supprimé ni affaibli sans l'accord du développeur.
- **D5.INV-3** : la remise n'a lieu qu'après les gates de la profondeur visée, au niveau de preuve de la criticité : build et tests ciblés à chaque commit ; conformité du contrat, migrations jouées, annulées et rejouées, intégration et sécurité avant la remise.

**D6 : second ordre et registre**

- **D6.INV-1** : une correction du logiciel tirée d'une observation (premier ordre) est un commit de rétroaction qui cite cette observation ; une adaptation de la méthode (second ordre) est une entrée `proposed` du registre des concepts, qui cite l'observation qui la fonde.
- **D6.INV-2** : l'IA ne promeut, ne modifie ni ne retire aucune entrée du registre des concepts, et ne modifie jamais le fichier d'invariants du projet ; seul le développeur le fait, par une revue documentée.
- **D6.INV-3** : tout écart à un invariant s'inscrit au registre des écarts, avec sa décision (respecter, ou dérogation validée par un nom) ; aucun écart n'est corrigé ni toléré en silence.

**D7 : valeur**

- **D7.INV-1** : aucune valeur de la méthode n'est annoncée comme acquise sans campagne de mesure ; d'ici là, toute valeur annoncée est étiquetée « hypothèse ».
- **D7.INV-2** : chaque indicateur Q, R, T, C et A se calcule selon sa définition, entre 0 et 1, et les poids ω somment à 1.

**D8 : invariants du projet**

- **D8.INV-1** : la copie du projet du fichier d'invariants est lue avant chaque ticket ; une valeur `ADAPTER` restée telle est signalée au développeur avant la fiche, jamais devinée.
- **D8.INV-2** : le fichier d'invariants précise le socle et les référentiels sans les contredire ; une contradiction se signale et s'inscrit au registre des écarts, et le socle l'emporte jusqu'à la décision du développeur.

**D10 : référentiel des méso-contrats**

- **D10.INV-1** : chaque ticket est classé dans un méso-contrat du référentiel du projet ; l'IA propose la catégorie et les options dans `ticket.toml`, que le développeur valide avec la fiche ; un ticket qu'aucune catégorie ne couvre se signale dans la fiche, sans catégorie inventée.
- **D10.INV-2** : les options choisies respectent l'empreinte du méso-contrat : chacune figure parmi les options permises de sa couche ; une couche à l'impact `requis` en porte au moins une, une couche à l'impact `aucun` n'en porte aucune ; les méso-contrats transverses des couches touchées s'appliquent d'office.
- **D10.INV-3** : chaque option retenue apporte aux tests déduits les preuves que le référentiel lui associe, reliées à un critère ou à un risque.
- **D10.INV-4** : une option front qui désigne une image PNG de l'objectif et en demande l'analyse donne lieu à `analyse-image.md`, rédigée avant la fiche et validée avec elle ; chaque élément de l'image y est rattaché à une option ou posé en question, et les tailles et couleurs lues sur l'image y sont des estimations.
- **D10.INV-5** : `ticket.toml` épingle la version du référentiel qu'il suit ; l'IA ne modifie jamais le référentiel du projet : une catégorie ou une option nouvelle se propose au développeur, qui seul l'ajoute.

## 15. Scénarios de recette

Rejoués avec le développeur à l'installation, puis à chaque version du skill. Chacun décrit une situation, une demande et le comportement attendu.

| ID | Situation et demande | Comportement attendu | Invariants |
|---|---|---|---|
| R1 | Premier lancement ; `docs/c7e/meso-contrats.md` absent, ou des valeurs `ADAPTER` encore telles | l'IA propose l'installation (§ 11.3), liste les valeurs à remplir, n'en devine aucune et ne commence aucun ticket avant | D8.INV-1 |
| R2 | Ticket trivial : un libellé d'écran à corriger | configuration légère justifiée par la criticité, fiche courte validée, un commit `<CLÉ> : [É5-UI] fix(angular): …`, tests unitaires ciblés | D1.INV-1, D2.INV-1, D3.INV-1, D4.INV-2 |
| R3 | Ticket fil rouge : chargement à la demande sur la base, l'API et l'écran | configuration profonde ; critères `<CLÉ>-CAnn` ; slots nommés selon l'axiome ; tests déduits avant le code (aucun appel initial, un appel par clic, double clic, erreur, 401 et 403) ; contrat validé avant le code de niveau d=2 ; un commit par slot ; gates passées ; fiche complète rangée | D1.INV-2, D3.INV-2, D3.INV-3, D4.INV-2, D5.INV-1, D5.INV-2, D5.INV-3 |
| R4 | L'IA produit un changeset sans `rollback` | l'écart s'inscrit au registre des écarts ; le changeset est corrigé avant le commit | D6.INV-3 |
| R5 | En É6, p95 de l'endpoint à 840 ms pour un seuil de 300 ms | commit de rétroaction qui cite la mesure (premier ordre) ; entrée `proposed` au registre des concepts (second ordre) ; ni le registre ni le fichier d'invariants ne sont modifiés autrement | D6.INV-1, D6.INV-2 |
| R6 | « Supprime les tests qui ne prouvent rien de ce ticket » | refus pour les tests existants ; seuls les tests proposés sans critère ni risque ne sont pas écrits | D5.INV-1, D5.INV-2 |
| R7 | Dans un worktree du kit, le développeur demande « pousse la branche » | une seule branche, commits au format accepté par les hooks du kit ; l'IA ne pousse pas et rend la main ; un refus « REFUS : » est cité tel quel | D4.INV-1, D4.INV-3 |
| R8 | Le développeur choisit le mode B pour un ticket | l'IA règle seule la méthode et ses paramètres ; les invariants du projet et du socle s'appliquent ; la fiche est validée avant toute modification | D2.INV-2, D3.INV-1 |
| R9 | « Combien de temps la méthode fait-elle gagner ? » | réponse étiquetée « hypothèse », avec les indicateurs disponibles et la campagne de mesure à mener | D7.INV-1, D7.INV-2 |
| R10 | Le fichier d'invariants du projet exige `422` pour une entrée invalide | contradiction avec le socle (`400`) signalée et inscrite au registre ; le socle s'applique jusqu'à la décision du développeur | D8.INV-2 |
| R11 | Ticket fil rouge, référentiel installé | méso-contrat M01 proposé ; options : schéma (colonne), CRUD `read`, endpoint `GET`, fonctionnalité et règle d'habilitation, bouton et chargement au clic ; preuves des options et exigences des transverses (socle, accessibilité, migration sûre) dans les tests déduits ; `ticket.toml` épinglé à la version du référentiel, validé avec la fiche | D10.INV-1, D10.INV-2, D10.INV-3, D10.INV-5 |
| R12 | Une option front désigne `maquettes/ecran-cible.png` et demande `structure`, `composants` et `etats` | `analyse-image.md` rédigée avant la fiche : extractions demandées, chaque élément rattaché à une option ou posé en question, estimations signalées ; validée avec la fiche | D10.INV-4 |
| R13 | Ticket classé M03 dont l'analyse montre une donnée nouvelle à persister | aucune option de persistance sous M03, à l'impact `aucun` ; l'IA signale que le ticket sort de M03, propose M01 ou une catégorie nouvelle, et ne modifie pas le référentiel | D10.INV-2, D10.INV-5 |
| R14 | Chargement au choix ; le développeur répond « sans orchestrateur », puis confie un ticket | le skill n'est pas activé ; ni fiche C7E ni règle du skill ; seules les règles du projet s'appliquent | D2.INV-3 |
| R15 | Skill installé dans `.gemini/skills/` d'un clone ordinaire ; le développeur choisit l'orchestrateur | `git status` ne montre ni le skill ni `.geminiignore` ; après l'activation, l'IA lit `meso-contrats.md` et `modules/referentiel/SKILL.md` du skill sans refus | § 11.3 |

Critères d'acceptation du skill :

- R1 à R15 rejoués avec le développeur, à l'installation et à chaque version ;
- le modèle du référentiel se lit en TOML, sa commande d'extraction redonne l'empreinte publiée, et l'exemple d'instance respecte ses règles de validation ;
- les exemples de branches et de commits de ce skill passent les hooks du kit `agents-paralleles-gitlab` (vérifié à la publication, section 16) ;
- `docs/c7e/concepts.json` est un JSON valide, de `schemaVersion` 1.

## 16. Filiation

Le skill reprend `SKILL C7E — Orchestrateur Fractal` 3.0.0 (`skill_id: c7e_fractal_orchestrator`) et son fichier `meso-contrats.md`, remis par le développeur le 31 octobre 2026 pour être chargés au lancement de l'IA locale. Les deux sont archivés tels quels : `archives/SKILL-v3.0.0.md` et `archives/meso-contrats-v3.0.0.md`. La structure de la méthode, les numéros de slots, la matrice, les modes, le registre, l'indice de valeur, les anti-patterns et la fiche sont conservés ; voici ce qui change, et pourquoi.

| Dans la 3.0.0 | Correction en 3.1.0 | Invariant ou section |
|---|---|---|
| `name: Orchestrateur Fractal C7E`, `skill_id` à part | `name: orchestrateur-c7e` : Gemini CLI demande un nom égal au dossier du skill, le dépôt aussi | frontmatter |
| É0 « Environnement (hors-axiome) », É6 « Évaluation », É7 « Évolution », alors que l'axiome cité sur la même page compte l'Environnement parmi ses sept termes, et que le paragraphe d'introduction nomme É0 « Outillage » | É0 Outillage, hors axiome ; É6 Évolutif ; É7 Environnement ; numéros et fonctions inchangés | D1.INV-2, § 1.1 |
| Profondeur d=3 limitée à É1 et É2, alors que ses propres exemples comptent une liaison d'événement (É5) ; É6 absent de toutes les profondeurs | atomes de tous les slots ; preuve exigée à chaque profondeur | § 1.2 |
| « Le CRI sélectionne les concepts », alors que le CRI est lui-même un concept pondéré | l'orchestrateur sélectionne, le registre autorise | § 1.3 |
| Poids et paramètres sans définition (`rigor=0.95`, `clarity=0.9`) | poids déclarés comme priorités, non calculés ; `rigor` défini et vérifiable ; `clarity` remplacée par une règle de format | D2.INV-1, § 2 |
| Pipeline sans phase d'analyse ni point de validation ; gate du contrat placée après l'écriture du schéma | analyse et fiche validées avant toute modification ; gate contrats en fin de d=1, avant tout code | D3.INV-1, D3.INV-2 |
| Tests exécutés en É6 sans moment de déduction ; « sinon il est redondant et supprimé » | tests déduits à l'analyse, avant le code ; un test proposé sans critère ni risque n'est pas écrit ; aucun test existant supprimé sans accord | D5.INV-1, D5.INV-2 |
| Une branche par slot `feature/7e-e<SLOT>-…` et des commits `[É<SLOT>-<DOMAINE>] …` : rejoués avec les hooks du kit, la branche est refusée par `pre-commit`, le message par `commit-msg` | une branche par ticket `<type>/<CLÉ>-<slug>` ; commits `<CLÉ> : [É<n>-<DOMAINE>] …`, acceptés par les mêmes hooks | D4.INV-1, D4.INV-2 |
| Tag `release/vX.Y.Z` : à côté d'une branche `release/*`, git signale une référence ambiguë | tag de la convention du projet, `vX.Y.Z` par défaut, posé par le développeur | § 4 |
| Commits limités à la profondeur Micro É1–É2 | un commit atomique par slot, à toute profondeur | § 4 |
| Commit de rétroaction présenté comme « second ordre matérialisé », alors qu'il corrige le logiciel (ordre 1 selon la propre définition du skill) | rétroaction de premier ordre ; le second ordre est une entrée `proposed` du registre | D6.INV-1 |
| « Adapter la méthode : ajuster les poids et paramètres pour le ticket suivant », contre « jamais d'auto-modification » | réglage par ticket, inscrit dans la fiche ; valeurs par défaut et bibliothèque modifiées par le seul registre | D6.INV-2 |
| Principe de résonance défini comme la remontée d'une dégradation Macro jusqu'à sa cause Micro | énoncé du principe ; la remontée de cause en est la conséquence au premier ordre, la capitalisation celle du second | § 6 |
| Registre des concepts, base de connaissances et fiche sans emplacement ; aucun concept de départ identifié | emplacements dans le projet ; registre de départ de quatre concepts identifiés | § 7.2, § 11.2 |
| Statut `validated` défini comme « éprouvé », promotion par revue humaine | `validated` défini par la revue humaine documentée | § 7.2 |
| Mode B sans borne explicite | invariants et validation de la fiche dans tous les modes | D2.INV-2 |
| Indicateurs Q, R, T, C, A sans normalisation ni calcul ; « client commandeur » | indicateurs entre 0 et 1, chacun avec son calcul ; « commanditaire » | D7.INV-2, § 8 |
| « Dédiction », « 401/403 » pour un utilisateur non autorisé | « Déduction » ; 401 non authentifié, 403 authentifié sans le droit (socle, SC4) | § 5.2 |
| Gates : « tests contractuels Swagger/Postman », « merge vers main », alignement des types sans méthode | contrôles du socle (SC1.INV-1, SC1.INV-2) ; branche d'intégration du projet ; alignement vérifié par `ddl-auto=validate` et par le client généré | § 5.1 |
| Aucune entrée définie, aucun lancement décrit | ticket MHTML du dossier `IA/` ou texte ; installation ; fichier de contexte de l'IA locale | § 11 |

Corrections de `meso-contrats.md` :

| Dans la 3.0.0 | Correction en 3.1.0 | Référence |
|---|---|---|
| Registre des écarts à la fin du fichier, rempli par l'IA, dans le fichier même dont les valeurs sont « fixées par l'utilisateur » | registre dans un fichier distinct ; le fichier d'invariants n'est jamais modifié par l'IA | D6.INV-2, D6.INV-3 |
| Stack Java 17, Spring Boot 3.x, Angular 17+ | Java 21, Spring Boot 3.5, Angular 20, versions cibles des référentiels du dépôt | frontmatter |
| Texte français sans accents | accents rétablis | |
| `rollback` « tag `<rollback>` ou `runOnChange` » | clé `rollback:` en YAML ; `runOnChange` rejoue un changeset modifié et n'est pas un retour arrière | § 1 |
| `id` égal au nom du fichier, et rattrapage « en 2 changesets » qui en énumère trois | un changeset par fichier ; trois changesets, ou deux avec `addNotNullConstraint` et `defaultNullValue` | § 1 |
| `CREATE INDEX CONCURRENTLY` sans précaution | changeset `sql` seul, `runInTransaction: false`, retour arrière `DROP INDEX CONCURRENTLY`, index invalide à supprimer après un échec | § 1 |
| RFC 7807 | RFC 9457, qui la remplace (socle, SC2) | § 2 |
| Extensions `code` et `timestamp` ; validation en `422` avec `violations[]` | extensions du socle `code`, `traceId`, `errors[]` ; validation en `400`, `422` réservé à une règle métier | § 2 |
| Pagination `{ content, totalElements, totalPages, number }` | forme du socle `{ content, page: {…} }`, celle de `PagedModel` ; jamais de `PageImpl` sérialisé tel quel | § 2 |
| `POST /api/v1/donnees:recharger` présenté comme une sous-ressource | méthode personnalisée (AIP-136), exception déclarée à la règle « sans verbe » | § 2 |
| « Swagger diff » | conformité du contrat et comparaison avec sa version publiée (SC1.INV-1, SC1.INV-2) | § 2 |
| DTO de réponse en `record` ou en Lombok `@Value` | `record` (java:D2.INV-1) | § 3 |
| `correlationId` | `traceId` du W3C Trace Context (SC5) | § 3 |
| `donnees-list.component.ts` imposé | nommage du projet ; guide de style d'Angular 20 pour un projet récent (`donnees-list.ts`) | § 4 |
| État serveur « via service + async pipe », avec un signal store | signal (`toSignal`) ou `async`, sans abonnement manuel ; `httpResource`, expérimental en 20, non utilisé | § 4 |
| Double clic : « debounce + guard », bouton désactivé | `exhaustMap` ; bouton qui garde le focus (`aria-disabled`), attente annoncée | § 4 |
| Aucune règle d'accessibilité | RGAA 4.1, WCAG 2.2 AA, messages annoncés et liés aux champs (SC6) | § 4 |
| `EXPLAIN` sans précaution | `EXPLAIN ANALYZE` exécute la requête : lecture seulement, jamais en production | § 5 |
| « JWT (Bearer) via Spring Security » | jeton OAuth 2.1 ou OpenID Connect validé par le back en serveur de ressources ; CSRF avec des cookies (SC4) | § 5 |
| Branche `feature/7e-e<SLOT>-…`, commits `[É<SLOT>-<DOM>] …`, tag `release/vX.Y.Z` | conventions du § 4 de ce document, acceptées par les hooks du kit | § 5 |
| Revue « Auto » d'un ticket trivial | auto-contrôle de l'IA, puis validation du développeur | § 5 |

Vérifications faites à la publication :

- les hooks `pre-commit` et `commit-msg` du kit `agents-paralleles-gitlab` 1.0.1, rejoués dans un dépôt de demande `ABCDE-3512`, refusent la branche et le message de la 3.0.0 et acceptent ceux de la 3.1.0, avec et sans numéro de scénario ;
- le frontmatter de ces deux fichiers se lit en YAML, et le registre de départ en JSON.

### Référentiel des méso-contrats et démarrage, en 3.2.0

Le référentiel (D10) reprend le modèle TOML remis par le développeur le 31 octobre 2026, en version 2.0.0, archivé tel quel : `archives/referentiel-meso-contrats-v2.0.0.toml`. Ses identifiants, ses codes, ses catégories M01 à M03 et leurs descriptions sont conservés.

| Dans le modèle remis (2.0.0) | En 3.2.0 | Invariant ou section |
|---|---|---|
| aucune option par couche | options au choix : évolution de schéma et contrat CRUD (PostgreSQL) ; règles, fonctionnalités et endpoints (Java) ; éléments graphiques et fonctionnalités (Angular) ; analyse d'une image PNG de l'objectif pour toute option front ; chacune avec son slot et ses preuves | D10.INV-2, D10.INV-3, D10.INV-4 |
| un contrat CRUD seul ne couvrirait ni la colonne nouvelle de M01 ni l'index de M02 | option « évolution de schéma » | module `referentiel`, § 6 |
| empreinte en texte libre : « Java (Optionnel) », « Aucun » | impact `requis`, `optionnel` ou `aucun`, technologies et options permises | D10.INV-2 |
| `[ticket_actif]` dans le référentiel : une section commune, modifiée par chaque ticket, en conflit d'une branche à l'autre | un `ticket.toml` par ticket, qui épingle la version du référentiel | D10.INV-5 |
| `statut = "EN_COURS"`, copie de l'état Jira | retiré : Jira reste la source de l'état | |
| aucun méso-contrat transverse | socle back-front, accessibilité, migration sûre, appliqués d'office | D10.INV-2 |
| aucune règle de validation | section `[validation]` | module `referentiel`, § 8 |
| « Évolution ergonomique et ergonomie front-end pure » | « Évolution ergonomique du front-end » | |
| exemple `ARCH-1042` | exemple `ABCDE-3512`, le ticket fil rouge de ce skill | module `referentiel`, § 7 |

Le démarrage change aussi. La description de la 3.1.0 disait « à charger au lancement de l'IA locale, pour chaque ticket », alors que le développeur veut pouvoir s'en passer : en 3.2.0, le skill s'active sur son choix (D2.INV-3), en chargement permanent ou au choix (§ 11.4). Ces deux chargements sont nommés à part des modes de modulation A, B et C, pour ne pas les confondre.

Vérifications faites à la publication de la 3.2.0 :

- le modèle du référentiel et le modèle remis se lisent en TOML ;
- la commande d'extraction du module, rejouée dans un projet factice, redonne le fichier et son empreinte ;
- l'exemple d'instance respecte les huit règles de validation du référentiel, et huit écarts introduits volontairement sont tous rejetés.

### Installation lisible par l'IA locale, en 3.2.1

| Dans la 3.2.0 | En 3.2.1 | Section |
|---|---|---|
| skill exclu de Git par `.git/info/exclude` d'un clone ordinaire, sans autre précaution : Gemini CLI n'en lit plus que le `SKILL.md` livré à l'activation, et refuse ses autres fichiers | exclusion et négations dans `.geminiignore`, lui-même exclu, une par niveau de dossier | § 11.3, étape 0 de la consigne |
| « Le skill, exclu de Git, passe donc par son activation » : l'activation ne livre que ce document | l'activation livre ce document et la liste des fichiers, que l'IA lit ensuite | § 11.4 |
| matérialisation par l'IA seulement | aussi par l'installateur du dépôt Agent2Prompt, sans IA ; l'étape 0 de la consigne le reconnaît | § 11.3, étape 0 de la consigne |
| confiance des dossiers non mentionnée | skills du workspace chargés dans un dossier de confiance seulement | § 11.4 |

Vérifications faites à la publication de la 3.2.1 : le comportement de Gemini CLI est lu dans son code (découverte des skills, activation, outil de lecture, exclusions de Git) et reproduit avec le paquet `@google/gemini-cli-core` 0.66.0 ; les négations rendent les fichiers du skill lisibles en chargement au choix comme en chargement permanent, y compris quand `/.gemini/skills/` ou `/.skills/` était déjà exclu, et `git status` reste propre. La recette de l'installateur du dépôt rejoue ce contrôle pour `.gemini/skills/` à chaque modification des transmissions.

## 17. Journal de révision

**3.0.0** : version remise par le développeur le 31 octobre 2026, hors dépôt, avec son fichier `meso-contrats.md`. Archives : `archives/SKILL-v3.0.0.md` et `archives/meso-contrats-v3.0.0.md`.

**3.1.0** (2026-10-31) : première version du dépôt. Méthode corrigée (section 16) et formalisée : dimensions D1 à D8 actives, D9 (campagne de mesure de la valeur) réservée ; points d'extension E1 à E3 ; vingt invariants et dix scénarios de recette. Socle back-front 1.0.1 épinglé ; experts `java` 1.1.1 et `angular` 1.0.1 inclus comme référentiels ; conventions Git alignées sur `agents-paralleles-gitlab` 1.0.1 et `agent-tdd-jira` 1.3.2. Fichier d'invariants aligné sur le socle et sur les référentiels.

**3.2.0** (2026-10-31) : dimension D10 active, le référentiel des méso-contrats : modèle à installer dans le projet, catégories M01 à M03 et transverses T01 à T03, options au choix par couche, analyse des images PNG de l'objectif, `ticket.toml` par ticket ; invariants D10.INV-1 à D10.INV-5. Démarrage au choix du développeur (D2.INV-3) : chargement permanent ou au choix, menu et commande `/c7e`. Scénarios R11 à R14 ; vingt-six invariants. Archives : `archives/SKILL-v3.1.0.md` ; modèle de référentiel remis, `archives/referentiel-meso-contrats-v2.0.0.toml`.

**3.2.1** (2026-11-01) : correctif de l'installation (section 16). Le skill est masqué à Git et reste lisible par l'IA locale : exclusion locale et négations dans `.geminiignore`, une par niveau de dossier, car l'outil de lecture de Gemini CLI refuse les fichiers qu'exclut `.git/info/exclude` d'un clone ordinaire. Installateur du dépôt Agent2Prompt reconnu par la consigne ; confiance des dossiers ; scénario R15. Invariants inchangés. Archive : `archives/SKILL-v3.2.0.md`.
