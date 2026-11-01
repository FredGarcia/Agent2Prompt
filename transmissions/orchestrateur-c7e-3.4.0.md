# Orchestrateur fractal C7E : skill orchestrateur-c7e 3.4.0, transmission texte

Ce texte contient à la fois la consigne de travail et le skill complet. Il n'y a aucune pièce jointe. Le skill est découpé en fichiers, chacun délimité ainsi :

    <<<FICHIER chemin/relatif>>>
    ...contenu exact du fichier...
    <<<FIN chemin/relatif>>>

---

À partir de maintenant, tu installes l'orchestrateur C7E décrit par ce texte dans le projet du développeur, puis tu l'appliques à chaque ticket qu'il te confie. Le skill fait foi. Si tu relèves une ambiguïté ou une contradiction dans le skill, signale-la au développeur. Ne corrige pas le skill toi-même.

## Étape 0 : matérialiser le skill

Si le développeur a installé le skill avec l'installateur du dépôt Agent2Prompt (`tools/installer.mjs`), cette étape est faite : vérifie seulement les fichiers avec `sha256sum -c integrite.sha256`, depuis le dossier du skill, puis passe à l'étape 1.

1. Crée le dossier du skill à l'emplacement que le développeur choisit (section 11.3 de `SKILL.md`) : `.skills/orchestrateur-c7e/` à la racine du dépôt du projet pour un chargement permanent, `.gemini/skills/orchestrateur-c7e/` pour un chargement au choix. Dans la disposition du kit `agents-paralleles-gitlab`, c'est `~/dev/<projet>/.skills/orchestrateur-c7e/`, hors des worktrees, ou `~/.gemini/skills/orchestrateur-c7e/`. Dans un clone ordinaire, le skill ne doit pas apparaître dans `git status`, mais doit rester lisible : l'outil de lecture de Gemini CLI refuse les fichiers qu'exclut `.git/info/exclude`. Ajoute donc à `.git/info/exclude` le dossier du skill et `/.geminiignore`, et à `.geminiignore` une négation par niveau de dossier : `!/.gemini/`, `!/.gemini/skills/` et `!/.gemini/skills/orchestrateur-c7e/`, ou `!/.skills/` et `!/.skills/orchestrateur-c7e/` (section 11.3).
2. Pour chaque bloc `<<<FICHIER chemin>>>` … `<<<FIN chemin>>>`, crée le fichier `chemin` dans ce dossier, avec le contenu exact compris entre les deux lignes délimitrices. Ces deux lignes ne font pas partie du fichier. Ne reformule rien, ne traduis rien, ne complète rien.
3. Si tu disposes d'un shell, vérifie chaque fichier avec `sha256sum -c` contre la table d'intégrité en fin de texte ; sous Windows, Git Bash fournit `sha256sum`. Signale tout écart avant de continuer.

## Étape 1 : lecture

Lis `SKILL.md` en entier, puis `manifest.json`, `meso-contrats.md`, `modules/qualification/SKILL.md`, `modules/referentiel/SKILL.md`, `socle/SKILL.md`, et les sections « Versions cibles » et « Invariants » de `references/java.md` et `references/angular.md`. Ces deux derniers fichiers sont des **référentiels** : tu y lis les versions cibles et les invariants que tout code produit doit respecter, sans adopter leur rôle, leur mode de travail ni leurs consignes de démarrage. Ne lis `modules/mesure/SKILL.md` que pour comprendre le point d'extension E1 : cette dimension est réservée.

## Étape 2 : installation dans le projet

Suis la section 11.3 de `SKILL.md`, avec le développeur :

1. Copie `meso-contrats.md` à `docs/c7e/meso-contrats.md`, ou à l'emplacement qu'il indique. Liste-lui les valeurs `ADAPTER` à remplir ; ne les remplis pas toi-même.
2. Écris le modèle du référentiel des méso-contrats dans `docs/c7e/referentiel-meso-contrats.toml`, à l'identique, et vérifie son empreinte (`modules/referentiel/SKILL.md`, § 6). Liste au développeur les catégories et les options permises à adapter ; ne les change pas toi-même.
3. Confronte le modèle générique de la demande du référentiel à l'analyse de l'application (module `qualification`, § 2) : propose au développeur les possibilités de modification à retenir, avec leurs repères, à retirer et à ajouter. Il les écrit lui-même.
4. Crée `docs/c7e/registre-ecarts.md`, `docs/c7e/concepts.json` (registre de départ, § 7.2) et `docs/c7e/connaissances.md`.
5. Propose-lui le fichier de démarrage de l'IA locale et, pour un chargement au choix, la commande `/c7e` (§ 11.4). Ne les crée qu'avec son accord.
6. Rejoue avec lui les scénarios R1 à R18 (§ 15) quand il le demande.

## Étape 3 : chaque ticket

Applique la section 3 de `SKILL.md`. D'abord la qualification, à l'ouverture du ticket (module `qualification`) : la demande du ticket rangée dans le modèle générique de la demande, combinaison des possibilités de modification de l'application, les questions que le ticket laisse ouvertes, le méso-contrat proposé, puis confirmé par le développeur. Ensuite l'analyse, le choix des options (`ticket.toml`), l'analyse des images de l'objectif demandées, la fiche de transformation et sa validation par le développeur, puis la transformation par slot, les preuves et la remise.

## Règles qui ne se négocient pas

- À l'ouverture d'un ticket, rien avant la qualification : ni lecture du code, ni analyse, ni fiche avant que le développeur ait confirmé le méso-contrat.
- Aucune modification du projet avant la validation de la fiche ; aucun code de niveau d=2 avant la gate contrats.
- Sans choix du développeur au démarrage, aucune règle du skill ne s'applique, et tu ne l'actives pas de toi-même.
- Tu ne modifies jamais le fichier d'invariants ni le référentiel des méso-contrats du projet : une catégorie ou une option nouvelle se propose au développeur. Dans le registre des concepts, tu ne fais qu'ajouter des entrées `proposed`. Tout écart à un invariant s'inscrit au registre des écarts.
- Une branche par ticket ; chaque commit commence par la clé du ticket. Tu ne pousses pas, ne fusionnes pas, ne rebases pas et ne poses aucun tag. Un refus « REFUS : » d'un hook t'arrête : tu le cites au développeur, sans le contourner.
- Aucun test existant n'est supprimé ni affaibli sans l'accord du développeur.
- Le socle et les invariants des référentiels s'appliquent à tout code produit ; en cas de contradiction, le socle l'emporte et tu le signales.
- Toute valeur annoncée de la méthode est une hypothèse tant qu'elle n'est pas mesurée.
- N'applique aucune dimension au statut `reserved`.

Commence par l'étape 0, puis l'étape 1, puis l'étape 2.

---

# Skill

<<<FICHIER manifest.json>>>
{
  "name": "orchestrateur-c7e",
  "version": "3.4.0",
  "specSchema": 1,
  "language": "fr",
  "description": "Orchestrateur fractal C7E : résolution d'un ticket full-stack comme transformation maîtrisée d'un système vivant, avec le cycle de l'Axiome 7E, quatre profondeurs de déclinaison, des concepts paramétrables, la qualification de chaque ticket à son ouverture par un modèle générique de la demande et des questions complémentaires, un méso-contrat confirmé avant tout le reste, des options par couche avec leurs paramètres au choix par ticket, des variantes de représentation d'une ressource, l'analyse des images PNG de l'objectif, une fiche validée avant toute modification, des tests déduits des risques, des conventions Git compatibles avec le kit des agents parallèles, une boucle de second ordre bornée par un registre et un fichier d'invariants du projet ; activé au démarrage de l'IA locale, sur choix du développeur.",
  "entry": "SKILL.md",
  "modes": ["externe", "autonome", "hybride"],
  "targets": {
    "ia": "IA locale qui charge un fichier de contexte à son lancement (Gemini CLI, Claude Code)",
    "entree": "ticket Jira en MHTML (dossier IA de capture-sprint-jira) ou texte",
    "adaptateur": "Java 21, Spring Boot 3.5, PostgreSQL, Liquibase, Angular 20",
    "git": "une branche par ticket, commits préfixés par la clé, compatibles avec les hooks d'agents-paralleles-gitlab",
    "referentiel": "modèle générique de la demande et catégories de tickets du projet (M01 à M04), en TOML, options au choix par couche et leurs paramètres, une instance ticket.toml par ticket"
  },
  "shared": [
    { "path": "socle/SKILL.md", "from": "specs/socle-back-front/SKILL.md", "version": "1.0.1" },
    { "path": "references/java.md", "from": "specs/java/SKILL.md", "version": "1.1.1" },
    { "path": "references/angular.md", "from": "specs/angular/SKILL.md", "version": "1.0.1" }
  ],
  "references": [
    { "name": "java", "version": "1.1.1" },
    { "name": "angular", "version": "1.0.1" },
    { "name": "agents-paralleles-gitlab", "version": "1.0.1" },
    { "name": "agent-tdd-jira", "version": "1.3.2" }
  ],
  "modules": [
    { "id": "meso-contrats", "path": "meso-contrats.md", "dimensions": ["D8"], "status": "active" },
    { "id": "mesure", "path": "modules/mesure/SKILL.md", "dimensions": ["D9"], "status": "reserved" },
    { "id": "referentiel", "path": "modules/referentiel/SKILL.md", "dimensions": ["D10"], "status": "active" },
    { "id": "qualification", "path": "modules/qualification/SKILL.md", "dimensions": ["D11"], "status": "active" }
  ],
  "extensionPoints": ["E1", "E2", "E3", "E4"],
  "previousVersions": [
    { "version": "3.0.0", "file": "archives/SKILL-v3.0.0.md" },
    { "version": "3.0.0", "file": "archives/meso-contrats-v3.0.0.md" },
    { "version": "3.1.0", "file": "archives/SKILL-v3.1.0.md" },
    { "version": "3.2.0", "file": "archives/SKILL-v3.2.0.md" },
    { "version": "3.2.1", "file": "archives/SKILL-v3.2.1.md" },
    { "version": "3.3.0", "file": "archives/SKILL-v3.3.0.md" },
    { "version": "2.0.0", "file": "archives/referentiel-meso-contrats-v2.0.0.toml" }
  ]
}
<<<FIN manifest.json>>>

<<<FICHIER SKILL.md>>>
---
name: orchestrateur-c7e
description: Orchestrateur fractal C7E, qui pilote la résolution d'un ticket full-stack comme la transformation maîtrisée d'un système vivant (cycle de l'Axiome 7E, déclinaison récursive imbriquée sur quatre profondeurs, concepts paramétrables, qualification de chaque ticket à son ouverture par un modèle générique de la demande et des questions, méso-contrat confirmé avant tout le reste, options par couche avec leurs paramètres au choix par ticket, variantes de représentation d'une ressource, analyse des images PNG de l'objectif, fiche de transformation validée avant toute modification, tests déduits des risques, traçabilité Git compatible avec le kit des agents parallèles, boucle de second ordre bornée par un registre, valeur annoncée comme une hypothèse tant qu'elle n'est pas mesurée), avec le fichier des invariants du projet, meso-contrats. Adaptateur par défaut Java, Spring Boot, PostgreSQL, Liquibase et Angular. À activer au démarrage de l'IA locale, sur choix du développeur, pour les tickets qu'il lui confie.
version: 3.4.0
---

# Orchestrateur fractal C7E, version 3.4.0

Ce document est le point d'entrée du skill et contient la méthode. Il s'active au démarrage de l'IA locale, sur choix du développeur (§ 11.4), avec le fichier des invariants du projet, copie remplie du modèle `meso-contrats.md`. Ces deux fichiers suffisent au démarrage ; le référentiel des méso-contrats se lit à l'ouverture de chaque ticket, pour le qualifier, puis à son analyse, et les autres fichiers quand un ticket touche leur domaine.

Fichiers du skill :

- `SKILL.md` : la méthode, ce document ;
- `meso-contrats.md` : modèle des invariants du projet (dimension D8), pré-rempli pour l'adaptateur par défaut, à copier dans le projet et à remplir par le développeur ;
- `socle/SKILL.md` : socle commun back-front (contrat OpenAPI, erreurs RFC 9457, formats, pagination, sécurité, traçabilité, accessibilité), inclus à une version épinglée ;
- `references/java.md` et `references/angular.md` : points d'entrée des experts Java et Angular. Ce sont des **référentiels** : l'IA y lit les versions cibles et les invariants que tout code produit doit respecter, sans adopter leur mode de travail ;
- `modules/qualification/SKILL.md` : dimension D11, la qualification de chaque ticket à son ouverture : modèle générique de la demande, questions complémentaires, méso-contrat confirmé avant tout le reste ;
- `modules/referentiel/SKILL.md` : dimension D10, le référentiel des méso-contrats : modèle générique de la demande, catégories de tickets (dont M04, variante de représentation d'une ressource), options au choix par couche et leurs paramètres, analyse des images de l'objectif, modèle à installer dans le projet ;
- `modules/mesure/SKILL.md` : dimension réservée D9, à lire seulement pour comprendre le point d'extension E1.

Ordre de lecture au premier lancement : ce document en entier ; la copie du projet du fichier d'invariants ; `modules/qualification/SKILL.md` ; `modules/referentiel/SKILL.md` ; `socle/SKILL.md` ; les sections « Versions cibles » et « Invariants » des deux référentiels. Aux lancements suivants, ce document et la copie du projet suffisent ; les modules `qualification` et `referentiel`, et le référentiel du projet, se lisent à l'ouverture et à l'analyse de chaque ticket, le socle et les référentiels quand un ticket touche leur domaine.

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

Pour chaque ticket, l'orchestrateur qualifie d'abord la demande, puis produit une **fiche de transformation** (§ 10). Trois temps, séparés par deux réponses du développeur : la confirmation du méso-contrat, puis la validation de la fiche.

**Qualification, à l'ouverture du ticket, avant tout le reste** (module `qualification`)

1. Lire le ticket (§ 11.1).
2. Ranger sa demande dans le modèle générique de la demande du référentiel du projet, la combinaison des possibilités de modification de l'application, couche par couche : chaque possibilité à `oui`, `non` ou `inconnu`, avec sa source dans le ticket ; rien n'est rempli par supposition (D11.INV-2).
3. Proposer le méso-contrat dont l'empreinte couvre la demande, par la règle de choix du modèle, avec sa justification ; poser ensemble les questions que le ticket laisse ouvertes et dont la réponse changerait le méso-contrat ou ses options (D11.INV-1, D11.INV-2).
4. **Point de confirmation** : rien d'autre n'est fait, ni lecture du code ni fiche, avant que le développeur ait répondu et confirmé le méso-contrat ; ses réponses complètent `ticket.toml` (D11.INV-3, D11.INV-4).

**Analyse (d=0), avant toute modification**

1. Numéroter les critères d'acceptation du ticket `<CLÉ>-CAnn` s'ils ne le sont pas déjà, au format d'`agent-tdd-jira` (agent-tdd-jira:D10.INV-1).
2. Lire l'architecture réelle : code, contrat, migrations, tests existants, conventions du projet. Si le skill `skill4appli` est installé, ses emplacements `chemin:ligne` accélèrent la lecture ; le disque fait foi.
3. Cartographier l'impact : dépendances explicites et détectées, autres consommateurs (écrans, batchs, autres services).
4. Choisir les options par couche dans le méso-contrat confirmé, en partant de celles que signale la demande, et analyser les images de l'objectif demandées ; le tout s'écrit dans `ticket.toml` et `analyse-image.md` (module `referentiel`, D10.INV-2, D10.INV-4). Si la demande sort de l'empreinte du méso-contrat, revenir à la qualification (D11.INV-4).
5. Choisir la configuration (§ 2, § 7.1).
6. Déduire les tests des critères et des risques, y compris les preuves des options retenues (§ 5.2, D10.INV-3).
7. Présenter la fiche au développeur : objectif, critères, méso-contrat confirmé et options, invariants, configuration, cartographie, stratégie et tests déduits, avec `ticket.toml` et l'analyse d'image s'il y en a une. **Point de validation** : rien n'est modifié avant sa réponse (D3.INV-1).

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
**Qualification** : demande remplie et sources (`ticket.toml`, `[ticket.demande]`) ; questions posées et réponses ; confirmation du méso-contrat : nom, date
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
| référentiel des méso-contrats | modèle générique de la demande (D11), catégories de tickets, options par couche, transverses (D10) | le développeur, à partir du modèle du module `referentiel` | `docs/c7e/referentiel-meso-contrats.toml` |
| instance du ticket | demande remplie, méso-contrat confirmé, options retenues | l'IA propose ; le développeur confirme le méso-contrat à la qualification, puis valide les options avec la fiche | `docs/demandes/<CLÉ>/ticket.toml` |
| analyse d'image | une par ticket qui la demande | l'IA ; validée avec la fiche | `docs/demandes/<CLÉ>/analyse-image.md` |
| images de l'objectif | maquettes ou captures PNG | le développeur ou le PO | `docs/demandes/<CLÉ>/maquettes/` |

Les fichiers de `docs/` sont versionnés avec le projet : ce qu'un ticket capitalise devient commun à la fusion de sa branche, après revue. Si l'équipe ne les versionne pas, le fichier d'invariants du projet en fixe d'autres emplacements (`meso-contrats.md`, § 6).

### 11.3 Installation, une fois par projet

1. Matérialiser le skill à l'identique de la transmission, hors de l'arbre suivi : dans `.skills/orchestrateur-c7e/` pour un chargement permanent, dans `.gemini/skills/orchestrateur-c7e/` pour un chargement au choix, ou au niveau utilisateur avec le kit `agents-paralleles-gitlab` (§ 11.4). L'installateur du dépôt Agent2Prompt, `tools/installer.mjs`, fait cette étape et la suivante sans IA, et vérifie chaque fichier par son empreinte.
2. Masquer le skill à Git sans le rendre illisible pour l'IA locale. Dans un clone ordinaire, l'outil de lecture de fichiers de Gemini CLI refuse ce qu'exclut `.git/info/exclude` : un skill exclu ainsi ne livre que ce document à l'activation, et ses autres fichiers sont refusés. Ajouter donc à `.git/info/exclude` le dossier du skill et `/.geminiignore`, et à `.geminiignore` une négation par niveau de dossier : `!/.gemini/`, `!/.gemini/skills/` et `!/.gemini/skills/orchestrateur-c7e/` en chargement au choix ; `!/.skills/` et `!/.skills/orchestrateur-c7e/` en chargement permanent. Au niveau utilisateur, hors de tout dépôt, rien n'est à masquer.
3. Copier `meso-contrats.md` à `docs/c7e/meso-contrats.md` ; le développeur remplit les valeurs `ADAPTER`, et l'IA lui liste celles qui restent (D8.INV-1).
4. Écrire le modèle du référentiel des méso-contrats dans `docs/c7e/referentiel-meso-contrats.toml`, à l'identique, et en vérifier l'empreinte (module `referentiel`, § 6) ; le développeur y adapte le modèle générique de la demande, les catégories et les options permises.
5. Confronter le modèle générique de la demande à l'analyse de l'application : proposer au développeur les possibilités de modification à retenir, avec leurs repères dans l'application, à retirer et à ajouter ; il les écrit dans le référentiel (module `qualification`, § 2, D11.INV-5).
6. Créer `docs/c7e/registre-ecarts.md` (modèle à la fin de `meso-contrats.md`), `docs/c7e/concepts.json` (registre de départ, § 7.2) et `docs/c7e/connaissances.md`, vide.
7. Proposer le fichier de démarrage et, pour un chargement au choix, la commande `/c7e` (§ 11.4) ; ne les créer qu'avec l'accord du développeur.

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

Pour chaque ticket confié, applique l'orchestrateur C7E : qualification et confirmation
du méso-contrat, fiche de transformation, validation par le développeur, puis
transformation par slot.
```

**Chargement au choix.** Le skill est installé comme skill de Gemini CLI, dans `.gemini/skills/orchestrateur-c7e/` : seuls son nom et sa description se chargent au démarrage, le reste à son activation, que Gemini CLI fait confirmer. Le fichier de démarrage propose le choix, sans rien importer du skill :

```markdown
# IA locale du projet

À ton premier message, avant tout autre travail, propose ce choix et attends la réponse :

0. Sans orchestrateur.
1. Avec l'orchestrateur C7E.

- N'active jamais le skill orchestrateur-c7e sans ce choix.
- Avec l'orchestrateur : active le skill et lis docs/c7e/meso-contrats.md ; pour chaque ticket
  confié, commence par le qualifier avec le modèle générique de la demande de
  docs/c7e/referentiel-meso-contrats.toml : pose tes questions et fais confirmer le
  méso-contrat avant tout le reste.
- Sans orchestrateur : n'applique aucune règle du skill.
```

La commande `/c7e` fait le même choix sans passer par le menu, et confie le ticket d'un même geste : `/c7e ABCDE-3512`, ou `/c7e ABCDE-3512 M01` pour imposer le méso-contrat, ce qui vaut confirmation s'il couvre la demande (module `qualification`, § 5). Fichier `.gemini/commands/c7e.toml` :

```toml
description = "Orchestrateur C7E : activer le skill et traiter le ticket donné"
prompt = """
Active le skill orchestrateur-c7e pour la suite de la session.
Fichier d'invariants du projet :
@{docs/c7e/meso-contrats.md}
Référentiel des méso-contrats du projet :
@{docs/c7e/referentiel-meso-contrats.toml}
Commence par qualifier le ticket : modèle générique de la demande, questions,
méso-contrat à confirmer avant tout le reste.
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

| ID | Dimension | Introduite | Statut 3.4.0 | Dépend de | Où |
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
| D11 | Qualification de la demande : modèle générique, questions complémentaires, méso-contrat confirmé à l'ouverture du ticket | 3.3 | active | D3, D10 | `modules/qualification/SKILL.md` |

La méthode tient en un seul fichier pour se charger au démarrage : D1 à D7 sont décrites dans ce document plutôt que dans des modules séparés ; D8 est le modèle du fichier d'invariants du projet ; D10 et D11, qui se lisent à l'ouverture et à l'analyse de chaque ticket, sont des modules.

## 13. Contrat de version et points d'extension

Le skill suit le contrat de version de `EVOLUTION.md` du dépôt Agent2Prompt. La version 3.0.0, remise par le développeur, est archivée telle quelle avec son fichier d'invariants (`archives/`), comme les versions 3.1.0, 3.2.0, 3.2.1 et 3.3.0 et le modèle de référentiel remis en 2.0.0. Le socle et les deux référentiels sont épinglés dans `manifest.json`.

Points d'extension, actifs dès 3.1.0 :

- **E1** : chaque fiche consigne la configuration retenue et les indicateurs Q, R, T, C, A avec leur calcul ; la campagne de mesure (D9) les agrégera sans réécrire de fiche.
- **E2** : un adaptateur de stack est la colonne « Adaptateur par défaut » du § 1.1, le fichier d'invariants du projet, les référentiels de la stack, et les technologies et options du référentiel des méso-contrats ; une autre stack s'ajoute par d'autres fichiers de ce type, sans changer D1 à D7.
- **E3** : le registre des concepts porte `schemaVersion` ; un registre partagé entre projets pourra le lire sans conversion.

Point d'extension, actif dès 3.4.0 :

- **E4** : une option du référentiel peut déclarer des paramètres au choix par ticket (`parametres`), chacun avec ses valeurs, et un méso-contrat les possibilités sans lesquelles il ne convient pas (`possibilites_requises`). Un mécanisme de plus, comme un en-tête de version pour la sélection d'une variante, s'ajoute en valeur d'un paramètre, sans toucher aux autres options ni aux tickets déjà instanciés.

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

- **D10.INV-1** : chaque ticket est classé dans un méso-contrat du référentiel du projet, que le développeur confirme à la qualification (D11) ; l'IA propose ensuite les options dans `ticket.toml`, que le développeur valide avec la fiche ; un ticket qu'aucune catégorie ne couvre se signale, sans catégorie inventée.
- **D10.INV-2** : les options choisies respectent l'empreinte du méso-contrat : chacune figure parmi les options permises de sa couche ; une couche à l'impact `requis` en porte au moins une, une couche à l'impact `aucun` n'en porte aucune ; les méso-contrats transverses des couches touchées s'appliquent d'office.
- **D10.INV-3** : chaque option retenue apporte aux tests déduits les preuves que le référentiel lui associe, reliées à un critère ou à un risque.
- **D10.INV-4** : une option front qui désigne une image PNG de l'objectif et en demande l'analyse donne lieu à `analyse-image.md`, rédigée avant la fiche et validée avec elle ; chaque élément de l'image y est rattaché à une option ou posé en question, et les tailles et couleurs lues sur l'image y sont des estimations.
- **D10.INV-5** : `ticket.toml` épingle la version du référentiel qu'il suit ; l'IA ne modifie jamais le référentiel du projet : une catégorie ou une option nouvelle se propose au développeur, qui seul l'ajoute.
- **D10.INV-6** : une variante de représentation laisse la réponse actuelle de l'opération inchangée pour toute requête qui ne la sélectionne pas ; le champ retiré est absent de la variante, et non pas `null` ; la date-heure qui le résume suit le format Instant du socle et se calcule en base sans charger les éléments ; le remplacement de la réponse actuelle n'est retenu que pour une opération dont la version d'API n'est pas publiée, sinon il est refusé avec la règle du socle (SC1.INV-2).

**D11 : qualification de la demande**

- **D11.INV-1** : à l'ouverture d'un ticket, la qualification précède toute autre étape : l'IA range la demande du ticket dans le modèle générique de la demande du référentiel, combinaison de possibilités de modification de l'application, et en déduit le méso-contrat par la règle de choix, avant de lire le code, de cartographier l'impact ou de rédiger la fiche.
- **D11.INV-2** : l'intention et chaque possibilité de la demande remplie portent leur réponse, `oui`, `non` ou `inconnu` pour une possibilité, et la source de toute réponse autre qu'`inconnu`, dans le ticket ou dans une réponse du développeur ; rien n'est rempli par supposition ; une possibilité `inconnu` dont la réponse changerait le méso-contrat ou ses options, ou un choix entre plusieurs méso-contrats, devient une question au développeur, posée avec les autres.
- **D11.INV-3** : le méso-contrat proposé, justifié par l'empreinte, est confirmé par le développeur avant toute autre étape ; un méso-contrat imposé par le développeur vaut confirmation s'il couvre la demande remplie.
- **D11.INV-4** : `ticket.toml` garde la demande remplie, avec ses sources, et le méso-contrat confirmé ; si l'analyse montre ensuite que la demande sort de l'empreinte, l'IA revient à la qualification et fait confirmer un autre méso-contrat, sans en changer d'elle-même.
- **D11.INV-5** : les possibilités du modèle se fondent sur l'analyse de l'application : à l'installation, l'IA propose celles qui s'appliquent, avec leurs repères, celles à retirer et celles qui manquent, rattachées à une couche et à une option ; le développeur seul les écrit dans le référentiel.

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
| R11 | Ticket fil rouge, référentiel installé, M01 confirmé à la qualification (R16) | options : schéma (colonne), CRUD `read`, endpoint `GET`, fonctionnalité et règle d'habilitation, bouton et chargement au clic ; preuves des options et exigences des transverses (socle, accessibilité, migration sûre) dans les tests déduits ; `ticket.toml` épinglé à la version du référentiel, validé avec la fiche | D10.INV-1, D10.INV-2, D10.INV-3, D10.INV-5 |
| R12 | Une option front désigne `maquettes/ecran-cible.png` et demande `structure`, `composants` et `etats` | `analyse-image.md` rédigée avant la fiche : extractions demandées, chaque élément rattaché à une option ou posé en question, estimations signalées ; validée avec la fiche | D10.INV-4 |
| R13 | Ticket confirmé M03 dont l'analyse montre une donnée nouvelle à persister | aucune option de persistance sous M03, à l'impact `aucun` ; l'IA revient à la qualification : elle complète la demande, propose M01 ou une catégorie nouvelle, fait confirmer, et ne modifie pas le référentiel | D10.INV-2, D10.INV-5, D11.INV-4 |
| R14 | Chargement au choix ; le développeur répond « sans orchestrateur », puis confie un ticket | le skill n'est pas activé ; ni fiche C7E ni règle du skill ; seules les règles du projet s'appliquent | D2.INV-3 |
| R15 | Skill installé dans `.gemini/skills/` d'un clone ordinaire ; le développeur choisit l'orchestrateur | `git status` ne montre ni le skill ni `.geminiignore` ; après l'activation, l'IA lit `meso-contrats.md` et `modules/referentiel/SKILL.md` du skill sans refus | § 11.3 |
| R16 | Ouverture du ticket fil rouge ; le ticket ne dit pas s'il faut ajouter un endpoint | avant de lire le code, l'IA remplit la demande depuis le ticket, chaque réponse sourcée ; elle propose M01, seul à couvrir persistance, backend et frontend, M02 et M03 écartés par l'empreinte ; une question, sur l'endpoint ; rien d'autre avant la confirmation ; `ticket.toml` reçoit la demande, la réponse du développeur et M01 confirmé | D11.INV-1, D11.INV-2, D11.INV-3, D11.INV-4 |
| R17 | « Afficher la date de dernière mise à jour sur l'écran de détail », sans dire si la date est stockée et exposée | `ecran_modifie` à `oui` ; `colonne`, `lecture` et `endpoint_modifie` à `inconnu` ; M01 ou M03 selon la réponse ; l'IA pose la question et ne propose de méso-contrat qu'après la réponse | D11.INV-2, D11.INV-3 |
| R18 | Installation dans une application qui a des traitements par lots et des exports de fichiers | d'après l'analyse de l'application, l'IA propose les possibilités du modèle qui s'appliquent, avec leurs repères, et deux possibilités nouvelles, un traitement par lots et un export, chacune rattachée à une couche et à une option ; elle n'écrit pas le référentiel, le développeur les ajoute | D11.INV-5, D10.INV-5 |
| R19 | Ticket `ABCDE-3620` : depuis l'URI `/api/v1/commandes/{id}`, une variante de `CommandeDto` sans le champ `lignes`, et à la même URI une variante où `lignes` est remplacé par la date-heure de la dernière ligne enregistrée | qualification : `variante_representation`, `endpoint_modifie` et `lecture` à `oui` ; M04 proposé, M01, M02 et M03 écartés par l'empreinte et les possibilités requises ; quatre questions posées ensemble (sélection, exposition de la variante sans champ, date-heure stockée, front) ; après confirmation, repérage depuis l'URI dans `ticket.toml` ; tests déduits : champ absent, réponse actuelle inchangée sans `vue`, date-heure ISO 8601 avec fuseau, `null` pour une commande sans ligne, une seule requête d'agrégat | D11.INV-2, D11.INV-3, D10.INV-2, D10.INV-3, D10.INV-6 |
| R20 | Même ticket ; le développeur choisit le remplacement de la réponse actuelle, alors que `/api/v1` est publiée | refus, avec la règle du socle (SC1.INV-2) : retirer un champ d'une version publiée est cassant ; l'IA propose le paramètre de vue ou la négociation de contenu, ou une version `v2` qui n'est plus la même URI, et attend la décision ; rien n'est écrit dans `ticket.toml` avant | D10.INV-6, D8.INV-2 |

Critères d'acceptation du skill :

- R1 à R20 rejoués avec le développeur, à l'installation et à chaque version ;
- le modèle du référentiel se lit en TOML, sa commande d'extraction redonne l'empreinte publiée, et les exemples d'instance respectent ses règles de validation ;
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

### Qualification de la demande, en 3.3.0

Demande du développeur, le 1er novembre 2026 : à l'ouverture d'un ticket, trouver d'abord le bon méso-contrat avec un modèle générique de la demande, à partir du contenu du ticket, en posant des questions complémentaires si besoin. Le modèle est une combinaison de possibilités, fondées sur les modifications de l'application construite sur la pile PostgreSQL, Java et Angular, établies à son analyse.

| En 3.2.1 | En 3.3.0 | Invariant ou section |
|---|---|---|
| classement à la quatrième étape de l'analyse, après la lecture du code et la cartographie d'impact | qualification à l'ouverture du ticket, avant tout le reste, à partir du seul contenu du ticket | D11.INV-1, § 3 |
| méso-contrat validé avec la fiche, au point de validation unique | méso-contrat confirmé à part, avant l'analyse ; la fiche reste validée avant toute modification | D11.INV-3, D10.INV-1 |
| aucun modèle de la demande ; dans l'exemple d'instance, `[ticket.specifications_metier]` (élément persisté, exposition d'API, interaction d'IHM), repris du modèle remis en 2.0.0 | modèle générique de la demande, section 0 du référentiel : quinze possibilités de modification de l'application, couche par couche, chacune avec son option et ses repères, confrontées à l'analyse de l'application à l'installation, et la règle de choix ; `[ticket.demande]` garde chaque réponse et sa source | D11.INV-2, D11.INV-4, D11.INV-5 ; module `referentiel`, § 6 et § 7 |
| aucune question prévue avant la fiche | questions sur les seules possibilités inconnues qui changeraient le méso-contrat ou ses options, posées ensemble | D11.INV-2 |
| sortie de catégorie en cours d'analyse signalée dans la fiche | retour à la qualification et nouvelle confirmation | D11.INV-4, R13 |

D10.INV-1 est renforcé : le méso-contrat est confirmé dès la qualification, et plus seulement avec la fiche. Le modèle du référentiel passe en 3.1.0. Un référentiel installé avant reçoit la section 0 de la main du développeur ; en attendant, la qualification prend celle du modèle du skill et le signale.

Vérifications faites à la publication de la 3.3.0 :

- le modèle du référentiel se lit en TOML, et ses quinze possibilités n'engagent que des couches et des options du catalogue ;
- la commande d'extraction redonne le fichier et sa nouvelle empreinte ;
- l'exemple d'instance respecte les douze règles de validation, et quatorze écarts introduits volontairement sont tous rejetés, dont six sur la qualification ;
- la règle de choix, appliquée à six demandes types, retient M01 pour le ticket fil rouge et pour un écran de saisie nouveau avec sa table et son API, M02 pour un index seul, M03 pour un libellé d'écran, et M03 ou M01 pour la date de dernière mise à jour, selon qu'elle est déjà exposée ou non.

### Variante de représentation d'une ressource, en 3.4.0

Demande du développeur, le 1er novembre 2026, un deuxième exemple de méso-contrat après le CRUD en base, son endpoint Java et sa lecture depuis le front : « Trouver le endpoint d'une URI avec le type de donnée ; sa composition contient un champ avec une liste ou un record. Réaliser une variante de ce type avec ce champ en moins. Réaliser une variante avec la même URI où ce champ ne sera pas intégré ; les informations le concernant seront uniquement la date et l'heure du dernier enregistrement. » Le mécanisme de sélection à la même URI et l'exposition de la variante sans champ sont, à sa demande, au choix par ticket.

| En 3.3.0 | En 3.4.0 | Invariant ou section |
|---|---|---|
| aucune catégorie ne convient : la demande touche Java à coup sûr, PostgreSQL et Angular seulement selon le ticket, alors que M01 exige les trois couches, M02 exclut le front et M03 le back | M04, `VARIANTE_REPRESENTATION` : backend requis, persistance et frontend optionnels | module `referentiel`, § 6 |
| aucune possibilité pour une variante de la réponse | `variante_representation`, couche backend, option `representations` ; `lecture` étendue aux projections et agrégats ; seize possibilités | module `qualification`, § 2 |
| la règle de choix ne regarde que l'empreinte : un ticket qui modifie un endpoint et un écran conviendrait aussi à M04 | possibilités requises d'un méso-contrat ; M04 requiert `variante_representation`, et R17 donne toujours M01 ou M03 | E4, module `qualification`, § 2 |
| aucune valeur d'option au choix par ticket, hors les opérations CRUD | paramètres d'option : mécanisme de sélection (`parametre_vue`, `negociation_contenu`, `remplacement`) et exposition de la variante sans champ (`base`, `meme_uri`, `uri_propre`), demandés à la qualification si le ticket ne les dit pas | E4, D10.INV-6 |
| rien n'empêchait de retirer un champ d'une réponse publiée | réponse actuelle inchangée sans sélection ; remplacement refusé pour une version publiée, avec la règle du socle | D10.INV-6, R20 |

Le modèle du référentiel passe en 3.2.0, avec deux règles de validation de plus. Un référentiel installé avant reçoit M04, l'option, la possibilité et la règle de choix de la main du développeur ; d'ici là, un ticket de ce type se signale sans catégorie.

Vérifications faites à la publication de la 3.4.0 :

- le modèle du référentiel se lit en TOML ; ses seize possibilités et les options de ses quatre méso-contrats n'engagent que des couches et des options du catalogue ;
- la commande d'extraction redonne le fichier et sa nouvelle empreinte ;
- les deux exemples d'instance respectent les quatorze règles de validation, et sept écarts introduits volontairement dans l'exemple M04 sont tous rejetés : sélection hors catalogue, exposition absente, remplacement sur une version publiée, `variante_representation` à `non`, M01 à la place de M04, aucune option backend, réponse sans source ; le remplacement sur une version non publiée est accepté ;
- la règle de choix, appliquée à onze demandes types, retient toujours les mêmes catégories pour les six demandes de la 3.3.0 (M01, M02, M03, et M01 ou M03 pour R17) et M04 pour les cinq variantes de représentation : seule, avec un agrégat, avec un front consommateur, avec une colonne de date à créer, avec une URI propre.

## 17. Journal de révision

**3.0.0** : version remise par le développeur le 31 octobre 2026, hors dépôt, avec son fichier `meso-contrats.md`. Archives : `archives/SKILL-v3.0.0.md` et `archives/meso-contrats-v3.0.0.md`.

**3.1.0** (2026-10-31) : première version du dépôt. Méthode corrigée (section 16) et formalisée : dimensions D1 à D8 actives, D9 (campagne de mesure de la valeur) réservée ; points d'extension E1 à E3 ; vingt invariants et dix scénarios de recette. Socle back-front 1.0.1 épinglé ; experts `java` 1.1.1 et `angular` 1.0.1 inclus comme référentiels ; conventions Git alignées sur `agents-paralleles-gitlab` 1.0.1 et `agent-tdd-jira` 1.3.2. Fichier d'invariants aligné sur le socle et sur les référentiels.

**3.2.0** (2026-10-31) : dimension D10 active, le référentiel des méso-contrats : modèle à installer dans le projet, catégories M01 à M03 et transverses T01 à T03, options au choix par couche, analyse des images PNG de l'objectif, `ticket.toml` par ticket ; invariants D10.INV-1 à D10.INV-5. Démarrage au choix du développeur (D2.INV-3) : chargement permanent ou au choix, menu et commande `/c7e`. Scénarios R11 à R14 ; vingt-six invariants. Archives : `archives/SKILL-v3.1.0.md` ; modèle de référentiel remis, `archives/referentiel-meso-contrats-v2.0.0.toml`.

**3.2.1** (2026-11-01) : correctif de l'installation (section 16). Le skill est masqué à Git et reste lisible par l'IA locale : exclusion locale et négations dans `.geminiignore`, une par niveau de dossier, car l'outil de lecture de Gemini CLI refuse les fichiers qu'exclut `.git/info/exclude` d'un clone ordinaire. Installateur du dépôt Agent2Prompt reconnu par la consigne ; confiance des dossiers ; scénario R15. Invariants inchangés. Archive : `archives/SKILL-v3.2.0.md`.

**3.3.0** (2026-11-01) : dimension D11 active, la qualification de la demande (section 16). À l'ouverture de chaque ticket, avant tout le reste, la demande du ticket est rangée dans le modèle générique de la demande du référentiel, une combinaison de possibilités de modification de l'application établies à son analyse ; les questions que le ticket laisse ouvertes sont posées au développeur ; le méso-contrat que retient la règle de choix est confirmé avant l'analyse. Module `qualification` ; modèle du référentiel 3.1.0, avec la section 0, quinze possibilités pour la pile PostgreSQL, Java et Angular, `[ticket.demande]` et quatre règles de validation de plus. Invariants D11.INV-1 à D11.INV-5 ; D10.INV-1 renforcé ; trente et un invariants. Scénarios R16 à R18, R13 revu. Archive : `archives/SKILL-v3.2.1.md`.

**3.4.0** (2026-11-01) : point d'extension E4, les paramètres d'option au choix par ticket et les possibilités requises d'un méso-contrat (section 16). Catégorie M04, variante de représentation d'une ressource : depuis l'URI d'une opération, une variante de son type de réponse sans un champ liste ou record, et une variante à la même URI où ce champ est remplacé par la date-heure de son dernier enregistrement. Option `representations` avec ses paramètres (mécanisme de sélection, exposition de la variante sans champ) et ses preuves ; possibilité `variante_representation` ; modèle du référentiel 3.2.0, seize possibilités, quatorze règles de validation ; second exemple d'instance. Invariant D10.INV-6 ; trente-deux invariants. Scénarios R19 et R20. Archive : `archives/SKILL-v3.3.0.md`.
<<<FIN SKILL.md>>>

<<<FICHIER socle/SKILL.md>>>
---
name: socle-back-front
description: Socle commun aux experts Java, Angular et analyse de projet. Il fixe le contrat entre back et front (OpenAPI, erreurs RFC 9457, formats de données, pagination, sécurité, traçabilité, accessibilité). À lire avant de produire, relire ou analyser du code qui traverse la frontière back-front.
version: 1.0.1
---

# Socle commun back-front, version 1.0.1

Ce socle définit ce que le back et le front doivent respecter **ensemble**. Il est inclus à l'identique dans chaque skill qui en dépend (`java`, `angular`, `analyse-projet`, `sonarqube`, `agent-tdd-jira`), à une version épinglée. Un skill ne redéfinit jamais une règle du socle : il peut seulement la préciser pour sa technologie.

Les identifiants du socle commencent par `SC` (`SC2.INV-1`), pour ne jamais se confondre avec ceux d'un skill, qui commencent par `D` suivi du numéro de dimension.

## 1. Vue d'ensemble

```mermaid
flowchart LR
  subgraph CONTRAT["Contrat versionné dans le dépôt"]
    OAS["openapi.yaml<br/>OpenAPI 3.1<br/>source de vérité"]
  end
  subgraph BACK["Back : Java, Spring Boot, PostgreSQL"]
    CTRL["Contrôleurs REST"]
    PD["Erreurs<br/>application/problem+json"]
    DB[(PostgreSQL)]
  end
  subgraph FRONT["Front : Angular"]
    CLI["Client HTTP généré<br/>depuis le contrat"]
    ERR["Gestion d'erreurs<br/>par code stable"]
    UI["Interface accessible<br/>RGAA 4.1, WCAG 2.2 AA"]
  end
  OAS -->|"implémenté et vérifié par"| CTRL
  OAS -->|"généré vers"| CLI
  CLI <-->|"HTTPS, JSON, Bearer"| CTRL
  CTRL --> DB
  CTRL --> PD
  PD -->|"code, traceId, errors[]"| ERR
  ERR --> UI
```

## 2. Registre des dimensions du socle

| ID | Dimension | Statut 1.0.0 |
|---|---|---|
| SC1 | Contrat d'API OpenAPI | active |
| SC2 | Erreurs RFC 9457 | active |
| SC3 | Formats de données et pagination | active |
| SC4 | Sécurité de la frontière | active |
| SC5 | Traçabilité | active |
| SC6 | Accessibilité et messages | active |
| SC7 | Événements asynchrones (WebSocket, SSE, messages) | reserved |

## 3. SC1 : contrat d'API

### 3.1 Règles

- Le contrat est un fichier **OpenAPI 3.1** versionné dans le dépôt (par défaut `api/openapi.yaml`). Il est la source de vérité de la frontière.
- Le back l'implémente. Un test du back compare le contrat exposé par l'application (par exemple via springdoc) au fichier du dépôt, et échoue en cas d'écart.
- Le front ne code jamais un appel HTTP à la main pour un endpoint du contrat. Il utilise le client généré depuis le contrat, et la génération fait partie du build.
- Préfixe de version dans l'URL : `/api/v1/...`. Ressources au pluriel, en kebab-case : `/api/v1/purchase-orders/{id}`.
- Propriétés JSON en camelCase. Valeurs d'énumération en MAJUSCULES_SOULIGNÉES (`IN_PROGRESS`).
- Chaque opération a un `operationId` unique et stable : il devient le nom de méthode du client généré.

### 3.2 Compatibilité

| Changement | Autorisé dans `v1` publiée ? |
|---|---|
| Ajouter un endpoint | oui |
| Ajouter un champ optionnel en réponse | oui |
| Ajouter un paramètre optionnel en entrée | oui |
| Ajouter une valeur d'énumération en réponse | non, sauf si le contrat déclare l'énumération extensible et que le front gère une valeur inconnue |
| Renommer ou supprimer un champ, un endpoint, une valeur | non : nouvelle version `v2` |
| Rendre obligatoire un champ d'entrée | non : nouvelle version `v2` |
| Changer le type ou le format d'un champ | non : nouvelle version `v2` |

Un endpoint retiré passe d'abord par l'état déprécié (`deprecated: true` dans le contrat, en-tête `Deprecation` en réponse) pendant au moins une version de livraison.

### 3.3 Invariants

- **SC1.INV-1** : tout endpoint exposé par le back figure dans le contrat, et tout endpoint du contrat est implémenté. Contrôle : test de conformité du contrat côté back.
- **SC1.INV-2** : aucun changement cassant n'est introduit dans une version d'API publiée. Contrôle : comparaison du contrat avec sa version précédente (outil de diff OpenAPI en CI, ou revue).
- **SC1.INV-3** : le front n'appelle les endpoints du contrat qu'au travers du client généré. Contrôle : recherche d'URL `/api/` codées en dur dans le front, hors client généré.

## 4. SC2 : erreurs

### 4.1 Format

Toute réponse d'erreur 4xx ou 5xx a le type `application/problem+json` (RFC 9457), avec les membres standard et trois extensions :

```json
{
  "type": "https://errors.example.org/validation",
  "title": "Requête invalide",
  "status": 400,
  "detail": "La commande contient 2 erreurs.",
  "instance": "/api/v1/purchase-orders",
  "code": "VALIDATION_FAILED",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "errors": [
    { "field": "lines[0].quantity", "code": "MIN", "message": "doit être supérieur ou égal à 1" },
    { "field": "deliveryDate", "code": "FUTURE", "message": "doit être une date future" }
  ]
}
```

| Membre | Rôle | Stabilité |
|---|---|---|
| `type` | URI qui identifie la catégorie d'erreur | stable |
| `title`, `detail` | texte lisible, destiné à un humain | **non stable** : ne jamais s'en servir dans la logique |
| `status` | code HTTP | stable |
| `code` | code machine de l'erreur, en MAJUSCULES | stable, fait partie du contrat |
| `traceId` | identifiant de trace (SC5) | présent sur toute erreur |
| `errors[]` | erreurs de validation champ par champ | présent pour les erreurs de validation |

### 4.2 Codes HTTP

| Situation | Statut | `code` (exemples) |
|---|---|---|
| Corps ou paramètres invalides | 400 | `VALIDATION_FAILED`, `MALFORMED_REQUEST` |
| Non authentifié | 401 | `UNAUTHENTICATED` |
| Authentifié mais non autorisé | 403 | `FORBIDDEN` |
| Ressource absente | 404 | `NOT_FOUND` |
| Conflit de version (verrou optimiste) | 409 | `CONCURRENT_MODIFICATION` |
| Règle métier violée | 422 | code métier propre, par exemple `ORDER_ALREADY_SHIPPED` |
| Erreur inattendue | 500 | `INTERNAL_ERROR`, sans détail technique |

### 4.3 Invariants

- **SC2.INV-1** : toute réponse 4xx ou 5xx du back est en `application/problem+json`, avec `code` et `traceId`. Contrôle : tests d'API sur un cas de chaque statut.
- **SC2.INV-2** : le front ne fonde aucune décision sur `title` ou `detail`. Il décide sur `status` et `code`. Contrôle : revue et tests du gestionnaire d'erreurs.
- **SC2.INV-3** : une erreur 500 ne révèle ni trace de pile, ni requête SQL, ni nom de classe. Contrôle : test d'API provoquant une exception non gérée.

## 5. SC3 : formats de données et pagination

| Donnée | Format JSON | Côté Java | Côté TypeScript |
|---|---|---|---|
| Instant | chaîne ISO 8601 avec fuseau, `2026-10-16T10:15:30Z` | `Instant` ou `OffsetDateTime` | `string`, converti en `Date` au plus près de l'affichage |
| Date calendaire | `2026-10-16` | `LocalDate` | `string` |
| Montant | chaîne décimale `"1234.50"` ou entier en unités mineures, au choix du contrat, jamais flottant | `BigDecimal` ou `long` | `string` ou `number` entier |
| Identifiant | chaîne opaque (UUID recommandé) | `UUID` | `string` |
| Énumération | chaîne en MAJUSCULES | `enum` | union de littéraux générée |
| Absence de valeur | champ absent ou `null`, défini par le contrat pour chaque champ | `Optional` en retour de méthode seulement | `T \| null` ou `T \| undefined`, selon le contrat |

Pagination :

- requête : `?page=0&size=20&sort=createdAt,desc` (pages numérotées à partir de 0, `size` borné côté back, 100 au maximum par défaut) ;
- réponse :

```json
{
  "content": [ { "id": "..." } ],
  "page": { "size": 20, "number": 0, "totalElements": 134, "totalPages": 7 }
}
```

Invariants :

- **SC3.INV-1** : aucune date-heure ne circule sans fuseau. Contrôle : schéma du contrat (`format: date-time`) et tests de sérialisation.
- **SC3.INV-2** : aucun montant n'est représenté en virgule flottante, ni en JSON, ni en Java, ni en base. Contrôle : revue du contrat et recherche de `double`, `float` sur les champs monétaires.
- **SC3.INV-3** : toute liste potentiellement non bornée est paginée, avec une taille maximale imposée par le back. Contrôle : revue des endpoints de collection.

## 6. SC4 : sécurité de la frontière

- Authentification par jeton porteur (`Authorization: Bearer ...`) émis par un fournisseur d'identité OAuth 2.1 / OpenID Connect ; le back est un serveur de ressources qui valide le jeton. Si le projet utilise des cookies de session, la protection CSRF est obligatoire des deux côtés.
- Le front ne contient aucun secret : ni clé d'API privée, ni secret client. Toute configuration du front est publique par nature.
- Aucun jeton ni donnée personnelle dans une URL (paramètre de requête ou chemin), car les URL finissent dans les journaux.
- CORS : liste explicite d'origines par environnement. Jamais `*` quand les identifiants sont autorisés.
- 401 signifie « pas ou plus authentifié » : le front relance l'authentification. 403 signifie « authentifié mais refusé » : le front informe, sans relancer.
- L'autorisation est toujours vérifiée par le back. Masquer un bouton dans le front n'est pas une mesure de sécurité.

Invariants :

- **SC4.INV-1** : aucun secret ni jeton dans le code du front, dans une URL ou dans un journal. Contrôle : recherche de motifs de secrets et revue de la configuration de journalisation.
- **SC4.INV-2** : chaque endpoint non public est protégé par une règle d'autorisation côté back. Contrôle : test d'accès anonyme refusé sur chaque endpoint protégé.
- **SC4.INV-3** : CORS n'autorise jamais `*` avec identifiants. Contrôle : revue de la configuration CORS par environnement.

## 7. SC5 : traçabilité

- Le back propage le contexte W3C Trace Context (`traceparent`) et attache l'identifiant de trace à chaque ligne de journal.
- Chaque Problem Details porte `traceId` (SC2). Le front l'affiche dans le message d'erreur, sous une forme copiable, pour que l'utilisateur puisse le transmettre au support.
- Les journaux ne contiennent ni jeton, ni mot de passe, ni donnée personnelle non nécessaire.

Invariant :

- **SC5.INV-1** : toute erreur 5xx est journalisée côté back avec son `traceId`, et le même `traceId` est renvoyé au front. Contrôle : test d'API et vérification du journal capturé.

## 8. SC6 : accessibilité et messages

- Le front respecte le RGAA 4.1 et le WCAG 2.2 niveau AA.
- Les messages affichés à l'utilisateur sont localisés côté front à partir de `code` et, pour la validation, de `errors[].code`. Le `detail` du back sert de repli seulement.
- Une erreur de validation est associée au champ concerné (programmatiquement, pas seulement visuellement) et annoncée aux technologies d'assistance.
- Le back accepte l'en-tête `Accept-Language` et rédige `title` et `detail` en français par défaut.

Invariants :

- **SC6.INV-1** : chaque erreur de validation renvoyée par le back est rattachée au champ correspondant dans le formulaire du front. Contrôle : test de composant avec une réponse 400 simulée.
- **SC6.INV-2** : aucune information n'est transmise par la couleur seule. Contrôle : revue RGAA (critère 3.1) et tests automatisés d'accessibilité.

## 9. SC7 : événements asynchrones (réservé)

Réservé à une version ultérieure du socle : contrat AsyncAPI, format d'enveloppe d'événement, reprise après déconnexion. En 1.0.0, aucun skill ne doit introduire de canal asynchrone sans le signaler comme écart au socle.

## 10. Règles d'évolution du socle

- Le socle suit le contrat de version de `EVOLUTION.md` à la racine du dépôt.
- Un skill épingle une version du socle dans son `manifest.json` (champ `shared`). L'outil d'assemblage refuse une transmission si la version épinglée ne correspond pas au socle du dépôt.
- Un changement cassant du socle (invariant renforcé, format modifié) passe en version majeure. Chaque skill dépendant décide alors explicitement de monter de version.

## 11. Journal de révision

**1.0.0** (2026-10-16) : première version. Dimensions SC1 à SC6 actives, SC7 réservée. Archive : `archives/SKILL-v1.0.0.md`.

**1.0.1** (2026-10-21) : correctif. Les skills qui incluent le socle sont désignés sans le préfixe `expert-`, retiré de tous les skills du dépôt : `java`, `angular`, `analyse-projet`, auxquels s'ajoutent `sonarqube` et `agent-tdd-jira`, qui l'incluent aussi et manquaient à la liste. Aucune dimension ni aucun invariant modifié. Motif : une nouvelle notion d'expertise sera définie ensuite.
<<<FIN socle/SKILL.md>>>

<<<FICHIER references/java.md>>>
---
name: java
description: Expert Java 21, Spring Boot 3.5 et PostgreSQL qui produit du code conforme à des invariants vérifiables et relit du code existant avec une grille de revue. À utiliser pour écrire, compléter, corriger ou relire un back Spring Boot (architecture, API REST, persistance JPA et Flyway, sécurité, tests), dans le respect du socle commun back-front.
version: 1.1.1
---

# Expert Java, Spring Boot et PostgreSQL, version 1.1.1

Ce document est le point d'entrée du skill. Il fixe le rôle de l'expert, ses versions cibles, ses deux modes de travail, le registre des dimensions et la liste des invariants. Les règles détaillées sont dans `modules/`. Le socle commun back-front est dans `socle/SKILL.md` et fait foi pour tout ce qui traverse la frontière avec le front.

## 1. Ordre de lecture

1. Ce document, en entier.
2. `manifest.json` : modules actifs et réservés, version du socle épinglée.
3. `socle/SKILL.md` : contrat d'API, erreurs, formats, sécurité, traçabilité.
4. Les modules actifs, dans cet ordre : `architecture`, `langage`, `api-rest`, `persistance`, `securite`, `tests`, `revue`.
5. `modules/migration-boot4/SKILL.md` : seulement pour comprendre les points d'extension. Ne pas l'appliquer en 1.x.

## 2. Rôle et modes de travail

L'expert travaille toujours dans l'un de deux modes. Le mode est demandé au développeur s'il n'est pas explicite.

```mermaid
flowchart TD
  REQ(["Demande du développeur"]) --> MODE{"Mode explicite ?"}
  MODE -->|non| ASK["Demander : produire ou relire ?"]
  ASK --> MODE
  MODE -->|produire| P1["Lire le code existant concerné<br/>et vérifier les versions du projet"]
  P1 --> P2["Proposer le plan : fichiers, invariants visés,<br/>tests prévus. Attendre la validation"]
  P2 --> P3["Écrire code et tests ensemble"]
  P3 --> P4["Exécuter le build et les tests"]
  P4 --> P5["Compte rendu : fichiers, invariants couverts,<br/>résultat du build, écarts"]
  MODE -->|relire| R1["Délimiter le périmètre relu"]
  R1 --> R2["Appliquer la grille du module revue"]
  R2 --> R3["Rapport de revue classé par gravité"]
  R3 --> R4{"Corrections demandées ?"}
  R4 -->|oui| P2
  R4 -->|non| FIN(["Fin"])
  P5 --> FIN
```

**Produire** : écrire ou modifier du code. Le code et ses tests sont écrits ensemble. Un invariant visé sans contrôle automatisé n'est pas considéré comme respecté.

**Relire** : examiner du code sans le modifier. Le livrable est un rapport de revue (module `revue`). Une correction n'est apportée que si le développeur la demande, et elle repasse alors par le mode produire.

## 3. Versions cibles

| Composant | Version cible | Remarque |
|---|---|---|
| Java | 21 (LTS) | records, sealed, pattern matching pour `switch`, threads virtuels |
| Spring Boot | 3.5.x, dernier correctif disponible | le support open source de la branche 3.5 a pris fin le 30 juin 2026 ; un support commercial existe. La migration vers 4.x est la dimension réservée D8 |
| Spring Framework | 6.2.x | géré par Spring Boot |
| Spring Security | 6.5.x | géré par Spring Boot |
| Hibernate ORM | 6.6.x | géré par Spring Boot |
| Migrations | Flyway ou Liquibase, versions gérées par Spring Boot 3.5 | l'outil du projet est conservé ; avec Flyway, module `flyway-database-postgresql` requis |
| PostgreSQL | version du projet, 14 ou plus récente | à confirmer avec le développeur |
| Tests | JUnit 5, AssertJ, Mockito, Testcontainers, ArchUnit | versions gérées par Spring Boot, sauf ArchUnit |
| Build | Maven ou Gradle, avec le wrapper du projet | exemples donnés en Maven |

Règle : avant de produire, l'expert vérifie les versions réelles du projet (`pom.xml` ou `build.gradle`, `java -version`). Si elles diffèrent de ce tableau, il le signale et demande comment procéder. Il n'adapte jamais silencieusement le code à une autre version.

## 4. Carte du skill

```mermaid
flowchart LR
  subgraph SOCLE["socle (épinglé 1.0.1)"]
    SC["SC1 à SC6"]
  end
  A["architecture<br/>D1"] --> L["langage<br/>D2"]
  A --> API["api-rest<br/>D3"]
  A --> PER["persistance<br/>D4"]
  API --> SEC["securite<br/>D5"]
  PER --> T["tests<br/>D6"]
  API --> T
  SEC --> T
  T --> REV["revue<br/>D7"]
  SC --> API
  SC --> SEC
  MIG["migration-boot4<br/>D8, réservée"]:::res
  classDef res stroke-dasharray: 5 5
```

## 5. Cycle 7E

| Phase | Ce qu'elle désigne ici | Modules |
|---|---|---|
| Éléments | classes, records, entités, tables, endpoints | `langage`, `persistance` |
| Espace | les couches et les fonctionnalités, le schéma PostgreSQL | `architecture`, `persistance` |
| Engendrent | les dépendances autorisées entre couches, les relations entre entités | `architecture` |
| État | transactions, verrous optimistes, état de sécurité de chaque requête | `persistance`, `securite` |
| Expression | le contrat d'API, les Problem Details, les journaux | `api-rest`, socle |
| Évolutif | migrations Flyway ou Liquibase, versions d'API, journal de révision du skill | `persistance`, `api-rest`, section 11 |
| Environnement | le front, PostgreSQL, le fournisseur d'identité, la CI | socle, `tests` |

Clause de second ordre : en mode relire, l'expert fait partie du système qu'il observe. Sa revue oriente les choix du développeur. Il distingue donc toujours un constat (vérifiable, avec preuve) d'une préférence (étiquetée comme telle), et ne présente jamais une préférence comme une règle.

## 6. Registre des dimensions

| ID | Dimension | Introduite | Statut 1.0.0 | Dépend de | Module |
|---|---|---|---|---|---|
| D1 | Architecture en couches par fonctionnalité | 1.0 | active | | `architecture` |
| D2 | Langage Java 21 | 1.0 | active | | `langage` |
| D3 | API REST conforme au socle | 1.0 | active | D1, SC1 à SC3 | `api-rest` |
| D4 | Persistance JPA, migrations Flyway ou Liquibase, PostgreSQL | 1.0 | active | D1 | `persistance` |
| D5 | Sécurité Spring Security | 1.0 | active | D3, SC4 | `securite` |
| D6 | Tests et contrôles automatisés | 1.0 | active | D1 à D5 | `tests` |
| D7 | Revue de code | 1.0 | active | D1 à D6 | `revue` |
| D8 | Migration vers Spring Boot 4.x et Java 25 | 1.0 | reserved | D1 à D7 | `migration-boot4` |

## 7. Contrat de version et points d'extension

Le skill suit le contrat de version de `EVOLUTION.md` du dépôt Agent2Prompt : une version mineure ajoute une dimension ou un point d'extension, un invariant ne s'affaiblit jamais, la version précédente est archivée, et la version du socle est épinglée dans `manifest.json`.

Points d'extension posés en 1.0.0. Ce sont des règles actives dès maintenant ; elles rendent D8 activable sans réécriture du code :

- **E1** : aucune API dépréciée n'est introduite. Le compilateur signale les dépréciations (`-Xlint:deprecation`) et la revue les traite. En développement, `spring-boot-properties-migrator` signale les propriétés renommées.
- **E2** : toute personnalisation de Jackson est isolée dans une seule classe de configuration, au moyen d'un `Jackson2ObjectMapperBuilderCustomizer`. Aucun `new ObjectMapper()` dans le code applicatif.
- **E3** : les tests utilisent `@MockitoBean` et `@MockitoSpyBean`, jamais `@MockBean` ni `@SpyBean`, dépréciés depuis Spring Boot 3.4.
- **E4** : les versions des dépendances non gérées par Spring Boot sont centralisées dans les propriétés du build, à un seul endroit.
- **E5** : les règles de migration portent sur des garanties (versionnement, immuabilité, ordre déterministe, schéma validé), pas sur un outil. Flyway et Liquibase sont pris en charge ; un autre outil s'ajouterait par une section du module `persistance`, sans changer D4.INV-1.

## 8. Règles globales

- **Socle** : toute règle du socle s'applique. En cas de contradiction apparente entre un module et le socle, le socle l'emporte et l'expert signale la contradiction.
- **Pas d'invention** : l'expert n'invente ni dépendance, ni propriété de configuration, ni API. En cas de doute sur l'existence d'une API dans la version cible, il le dit et propose de vérifier.
- **Dépendances** : aucune nouvelle dépendance sans validation du développeur.
- **Secrets** : jamais dans le dépôt, dans `application.yml`, dans un test ou dans un journal. Variables d'environnement ou gestionnaire de secrets.
- **Langue** : identifiants en anglais ; commentaires, messages destinés aux utilisateurs et rapports en français, sauf convention contraire du projet.
- **Cohérence locale** : dans un projet existant, la convention déjà en place l'emporte sur une préférence du skill, sauf si elle viole un invariant. Dans ce cas, l'expert le signale.

## 9. Critères d'acceptation

En mode produire :

- le build complet passe (`./mvnw verify` ou `./gradlew check`) sur une machine disposant de Docker, pour Testcontainers ;
- chaque invariant touché par la modification a un contrôle automatisé qui passe, ou figure dans le compte rendu comme « contrôle manuel » avec sa justification ;
- aucune régression des règles ArchUnit ;
- le compte rendu liste les fichiers, les invariants couverts, le résultat du build et les écarts.

En mode relire :

- le périmètre relu est explicite ;
- chaque constat respecte D7.INV-1 ;
- le rapport commence par les constats bloquants.

## 10. Invariants

Chaque invariant a un contrôle : test, règle ArchUnit, propriété vérifiée au démarrage, ou point de grille de revue quand aucun contrôle automatique n'est possible.

**D1 : architecture**

- **D1.INV-1** : aucune classe des couches `domain` et `application` ne dépend de la couche `api` ni de `org.springframework.web`.
- **D1.INV-2** : aucune entité JPA n'est exposée par un contrôleur, ni en paramètre ni en retour.
- **D1.INV-3** : l'injection se fait par constructeur ; aucun champ n'est annoté `@Autowired`.
- **D1.INV-4** : les fonctionnalités n'ont pas de dépendances cycliques entre elles.

**D2 : langage**

- **D2.INV-1** : les DTO d'API sont des `record` immuables.
- **D2.INV-2** : `Optional` n'est jamais un type de champ ni de paramètre ; il sert uniquement de type de retour.
- **D2.INV-3** : quand les threads virtuels sont activés, aucun bloc `synchronized` n'englobe une entrée-sortie bloquante.
- **D2.INV-4** : aucune exception n'est avalée : un `catch` traite, relance ou traduit, jamais ne se contente d'ignorer.

**D3 : API REST**

- **D3.INV-1** : l'API implémentée correspond exactement au contrat OpenAPI (application de SC1.INV-1).
- **D3.INV-2** : toute entrée est validée par Bean Validation avant d'atteindre la couche `application`.
- **D3.INV-3** : un seul `@RestControllerAdvice` produit les Problem Details, avec `code` et `traceId` (application de SC2.INV-1).
- **D3.INV-4** : toute collection est paginée, avec une taille maximale imposée (application de SC3.INV-3).

**D4 : persistance**

- **D4.INV-1** : le schéma n'évolue que par migrations versionnées (Flyway ou Liquibase) ; `spring.jpa.hibernate.ddl-auto=validate` ; une migration appliquée n'est jamais modifiée.
- **D4.INV-2** : `spring.jpa.open-in-view=false`.
- **D4.INV-3** : les frontières transactionnelles sont déclarées dans la couche `application`, et les lectures sont en `readOnly = true`.
- **D4.INV-4** : aucune requête SQL ou JPQL n'est construite par concaténation avec une donnée d'entrée.
- **D4.INV-5** : les tests de persistance s'exécutent sur PostgreSQL (Testcontainers), jamais sur une base en mémoire.
- **D4.INV-6** : toute entité modifiable de façon concurrente porte un attribut `@Version`.

**D5 : sécurité**

- **D5.INV-1** : la chaîne de sécurité refuse par défaut (`anyRequest().authenticated()` ou plus strict) ; chaque exception publique est explicite.
- **D5.INV-2** : les réponses 401 et 403 émises par la chaîne de sécurité sont des Problem Details conformes au socle.
- **D5.INV-3** : seuls `health` et `info` d'Actuator sont exposés sans authentification.
- **D5.INV-4** : aucun jeton, mot de passe ni donnée personnelle non nécessaire n'est journalisé (application de SC4.INV-1 et SC5).

**D6 : tests**

- **D6.INV-1** : chaque invariant actif du skill a au moins un contrôle automatisé, ou une entrée de grille de revue justifiée.
- **D6.INV-2** : les tests unitaires du domaine et de la couche application ne démarrent pas de contexte Spring.
- **D6.INV-3** : aucun test n'utilise `@MockBean` ni `@SpyBean` (point E3).
- **D6.INV-4** : aucun test ne dépend de l'ordre d'exécution, de l'heure réelle ni du réseau public.

**D7 : revue**

- **D7.INV-1** : chaque constat cite un emplacement (`fichier:ligne`), l'invariant concerné ou la mention « hors invariant » avec sa justification, une gravité et une correction proposée.
- **D7.INV-2** : en mode relire, l'expert ne modifie aucun fichier sans demande explicite.
- **D7.INV-3** : les constats sont classés par gravité décroissante, et un constat sans preuve est présenté comme une question, pas comme un défaut.

## 11. Journal de révision

**1.0.0** (2026-10-16) : première version. Dimensions D1 à D7 actives, D8 réservée. Points d'extension E1 à E4. Socle back-front 1.0.0 épinglé. Archive : `archives/SKILL-v1.0.0.md`.

**1.1.0** (2026-10-16) : point d'extension E5, migrations Flyway ou Liquibase. D4.INV-1 est reformulé sur les garanties communes aux deux outils, sans être affaibli (versionnement, immuabilité vérifiée par somme de contrôle, `ddl-auto=validate`). Module `persistance` : garanties communes et section Liquibase. Motif : projets existants sous Liquibase. Archive : `archives/SKILL-v1.1.0.md`.

**1.1.1** (2026-10-21) : correctif. Le skill s'appelle désormais `java` (auparavant `expert-java`) : le préfixe `expert-` est retiré de tous les skills du dépôt. Les autres skills citent ses invariants sous la forme `java:Dn.INV-k` ; il se matérialise dans `.skills/java/`. Socle back-front épinglé en 1.0.1. Aucune dimension ni aucun invariant modifié. Motif : une nouvelle notion d'expertise sera définie ensuite.
<<<FIN references/java.md>>>

<<<FICHIER references/angular.md>>>
---
name: angular
description: Expert Angular 20 qui produit du code conforme à des invariants vérifiables et relit du code existant avec une grille de revue. À utiliser pour écrire, compléter, corriger ou relire un front Angular (architecture standalone, composants à signaux, données HTTP, formulaires typés, routage, sécurité, accessibilité RGAA et WCAG, tests), dans le respect du socle commun back-front.
version: 1.0.1
---

# Expert Angular, version 1.0.1

Ce document est le point d'entrée du skill. Il fixe le rôle de l'expert, ses versions cibles, ses deux modes de travail, le registre des dimensions et la liste des invariants. Les règles détaillées sont dans `modules/`. Le socle commun back-front est dans `socle/SKILL.md` et fait foi pour tout ce qui traverse la frontière avec le back.

## 1. Ordre de lecture

1. Ce document, en entier.
2. `manifest.json` : modules actifs et réservés, version du socle épinglée.
3. `socle/SKILL.md` : contrat d'API, erreurs, formats, sécurité, accessibilité.
4. Les modules actifs, dans cet ordre : `architecture`, `composants`, `donnees-http`, `formulaires`, `routage-securite`, `accessibilite`, `tests`, `revue`.
5. `modules/migration-angular22/SKILL.md` et `modules/bff-node/SKILL.md` : seulement pour comprendre les points d'extension. Ne pas les appliquer en 1.x.

## 2. Rôle et modes de travail

```mermaid
flowchart TD
  REQ(["Demande du développeur"]) --> MODE{"Mode explicite ?"}
  MODE -->|non| ASK["Demander : produire ou relire ?"]
  ASK --> MODE
  MODE -->|produire| P1["Lire le code concerné, angular.json,<br/>package.json, tsconfig, eslint"]
  P1 --> P2["Proposer le plan : fichiers, invariants visés,<br/>tests prévus. Attendre la validation"]
  P2 --> P3["Écrire composants, services et tests ensemble"]
  P3 --> P4["ng lint, ng test, ng build"]
  P4 --> P5["Compte rendu : fichiers, invariants couverts,<br/>résultats, écarts"]
  MODE -->|relire| R1["Délimiter le périmètre relu"]
  R1 --> R2["Appliquer la grille du module revue"]
  R2 --> R3["Rapport de revue classé par gravité"]
  R3 --> R4{"Corrections demandées ?"}
  R4 -->|oui| P2
  R4 -->|non| FIN(["Fin"])
  P5 --> FIN
```

**Produire** : écrire ou modifier du code. Composant, template, styles et test sont écrits ensemble. Un invariant visé sans contrôle automatisé n'est pas considéré comme respecté.

**Relire** : examiner du code sans le modifier. Le livrable est un rapport de revue (module `revue`).

## 3. Versions cibles

| Composant | Version cible | Remarque |
|---|---|---|
| Angular | 20.x, dernier correctif disponible | branche en support long terme ; sa fin de support est prévue vers la fin novembre 2026, à vérifier sur la page officielle des versions. La montée vers 22 est la dimension réservée D9 |
| TypeScript | version exigée par Angular 20 (5.8) | `strict` activé |
| Node.js | version prise en charge par Angular 20 (20.19 ou plus, 22.12 ou plus, ou 24) | à vérifier avec `ng version` |
| RxJS | 7.x | |
| Build | constructeur `application` (esbuild) | `@angular/build` |
| Lint | `angular-eslint` avec configuration plate | règles d'accessibilité des templates activées |
| Tests unitaires | Jasmine et Karma, ou Jest si le projet l'utilise déjà | Vitest relève de D9 |
| Tests de bout en bout | Playwright et `@axe-core/playwright` | à valider s'ils ne sont pas déjà dans le projet |

Règle : avant de produire, l'expert vérifie les versions réelles (`ng version`, `package.json`). Si elles diffèrent de ce tableau, il le signale et demande comment procéder.

API d'Angular 20 à utiliser selon leur statut :

| API | Statut en 20 | Usage dans ce skill |
|---|---|---|
| `signal`, `computed`, `effect`, `linkedSignal`, `toSignal` | stables | oui |
| `input()`, `output()`, `model()`, `viewChild()` | stables | oui, pour tout nouveau composant |
| `@if`, `@for`, `@switch`, `@let` | stables | oui ; `*ngIf`, `*ngFor`, `*ngSwitch` sont dépréciés en 20 |
| `resource`, `rxResource`, `httpResource` | expérimentales | non en 1.x (D9) |
| Détection de changement sans zone | non retenue comme mode par défaut du skill en 1.x | code compatible exigé (point E2), activation en D9 |

## 4. Carte du skill

```mermaid
flowchart LR
  subgraph SOCLE["socle (épinglé 1.0.1)"]
    SC["SC1 à SC6"]
  end
  ARCH["architecture<br/>D1"] --> COMP["composants<br/>D2"]
  ARCH --> DATA["donnees-http<br/>D3"]
  COMP --> FORM["formulaires<br/>D4"]
  DATA --> FORM
  ARCH --> ROUT["routage-securite<br/>D5"]
  COMP --> A11Y["accessibilite<br/>D6"]
  FORM --> A11Y
  DATA --> T["tests<br/>D7"]
  A11Y --> T
  ROUT --> T
  T --> REV["revue<br/>D8"]
  SC --> DATA
  SC --> FORM
  SC --> ROUT
  SC --> A11Y
  MIG["migration-angular22<br/>D9, réservée"]:::res
  BFF["bff-node<br/>D10, réservée"]:::res
  classDef res stroke-dasharray: 5 5
```

## 5. Cycle 7E

| Phase | Ce qu'elle désigne ici | Modules |
|---|---|---|
| Éléments | composants, services, signaux, routes, contrôles de formulaire | `composants`, `formulaires` |
| Espace | fonctionnalités et couches (`feature`, `ui`, `data-access`), arbre des routes | `architecture`, `routage-securite` |
| Engendrent | dépendances autorisées, dérivations de signaux (`computed`) | `architecture`, `composants` |
| État | état des signaux, état des formulaires, état d'authentification | `composants`, `formulaires`, `routage-securite` |
| Expression | le rendu, son accessibilité, les messages à l'utilisateur | `accessibilite`, socle SC6 |
| Évolutif | versions d'Angular, points d'extension, journal de révision | section 7, D9 |
| Environnement | le back et son contrat, le navigateur, les technologies d'assistance | socle, `donnees-http`, `accessibilite` |

Clause de second ordre : en mode relire, l'expert distingue toujours un constat (vérifiable, avec preuve) d'une préférence (étiquetée comme telle).

## 6. Registre des dimensions

| ID | Dimension | Introduite | Statut 1.0.0 | Dépend de | Module |
|---|---|---|---|---|---|
| D1 | Architecture standalone par fonctionnalité | 1.0 | active | | `architecture` |
| D2 | Composants à signaux | 1.0 | active | D1 | `composants` |
| D3 | Données HTTP conformes au socle | 1.0 | active | D1, SC1 à SC3 | `donnees-http` |
| D4 | Formulaires réactifs typés | 1.0 | active | D2, D3, SC6 | `formulaires` |
| D5 | Routage et sécurité | 1.0 | active | D1, SC4 | `routage-securite` |
| D6 | Accessibilité RGAA 4.1, WCAG 2.2 AA | 1.0 | active | D2, D4, SC6 | `accessibilite` |
| D7 | Tests et contrôles automatisés | 1.0 | active | D1 à D6 | `tests` |
| D8 | Revue de code | 1.0 | active | D1 à D7 | `revue` |
| D9 | Migration vers Angular 22 | 1.0 | reserved | D1 à D8 | `migration-angular22` |
| D10 | BFF Node entre Angular et les API | 1.0 | reserved | D3, D5, SC4 | `bff-node` |

## 7. Contrat de version et points d'extension

Le skill suit le contrat de version de `EVOLUTION.md` du dépôt Agent2Prompt. La version du socle est épinglée dans `manifest.json`.

Points d'extension, actifs dès 1.0.0 :

- **E1** : aucune API dépréciée en Angular 20 n'est introduite (`*ngIf`, `*ngFor`, `*ngSwitch`, décorateurs `@Input` et `@Output` dans un nouveau composant, `NgModule` pour un nouveau composant).
- **E2** : le code ne dépend pas de zone.js pour se rafraîchir. Tout état affiché est un signal, ou passe par `async`, ou appelle `markForCheck`. Aucune mise à jour d'état qui ne serait visible que grâce au correctif de zone d'un `setTimeout` ou d'un écouteur.
- **E3** : chaque formulaire a un type de modèle explicite et une fonction de construction isolée, pour faciliter le passage aux formulaires à signaux.
- **E4** : les tests n'utilisent que `TestBed`, les harnais du CDK et `HttpTestingController`, sans API propre à Karma, pour faciliter le passage à Vitest.
- **E5** : le front n'appelle aucun service tiers directement ; tout passe par l'API décrite dans le contrat, ce qui permettra d'introduire un BFF (D10) sans toucher aux composants.

## 8. Règles globales

- **Socle** : toute règle du socle s'applique. En cas de contradiction apparente, le socle l'emporte et l'expert la signale.
- **Pas d'invention** : ni API Angular, ni option de configuration, ni bibliothèque. En cas de doute sur l'existence ou le statut d'une API en 20, l'expert le dit.
- **Dépendances** : aucune nouvelle dépendance npm sans validation.
- **Secrets** : aucun dans le front, qui est public par nature (SC4.INV-1).
- **Langue** : identifiants en anglais ; textes de l'interface, commentaires et rapports en français, sauf convention contraire du projet.
- **Cohérence locale** : dans un projet existant, la convention en place (nommage des fichiers, Jest ou Karma, bibliothèque de composants) l'emporte, sauf si elle viole un invariant.

## 9. Critères d'acceptation

En mode produire :

- `ng lint`, `ng test` (sans navigateur interactif) et `ng build` passent ;
- chaque invariant touché a un contrôle automatisé qui passe, ou un contrôle manuel justifié dans le compte rendu ;
- les parcours modifiés passent le contrôle axe des tests de bout en bout, si ceux-ci existent dans le projet ;
- le compte rendu liste les fichiers, les invariants couverts, les résultats et les écarts.

En mode relire : périmètre explicite, constats conformes à D8.INV-1, bloquants en tête.

## 10. Invariants

**D1 : architecture**

- **D1.INV-1** : tout nouveau composant, directive ou pipe est autonome (standalone) ; aucun nouveau `NgModule`.
- **D1.INV-2** : les dépendances respectent les couches : une fonctionnalité n'importe pas une autre fonctionnalité ; `ui` n'injecte aucun service de données ; `data-access` ne contient aucun composant.
- **D1.INV-3** : TypeScript en mode `strict` et templates en `strictTemplates`.

**D2 : composants**

- **D2.INV-1** : chaque composant est en `ChangeDetectionStrategy.OnPush`.
- **D2.INV-2** : les templates utilisent le flux de contrôle intégré (`@if`, `@for`, `@switch`) ; chaque `@for` a un `track` sur un identifiant stable.
- **D2.INV-3** : un nouveau composant déclare ses entrées et sorties avec `input()`, `output()` ou `model()`.
- **D2.INV-4** : aucun abonnement manuel dans un composant sans `takeUntilDestroyed` ; la forme préférée est `toSignal` ou le pipe `async`.
- **D2.INV-5** : `effect()` ne sert jamais à écrire dans un autre signal pour en dériver la valeur ; on utilise `computed` ou `linkedSignal`.

**D3 : données HTTP**

- **D3.INV-1** : les endpoints du contrat ne sont appelés qu'au travers du client généré (application de SC1.INV-3).
- **D3.INV-2** : les erreurs HTTP sont converties en un seul point en `ApiProblem` ; les décisions se fondent sur `status` et `code`, jamais sur `title` ou `detail` (application de SC2.INV-2).
- **D3.INV-3** : aucun composant de la couche `ui` ne déclenche de requête HTTP.
- **D3.INV-4** : aucun calcul monétaire en virgule flottante côté front (application de SC3.INV-2).

**D4 : formulaires**

- **D4.INV-1** : tout nouveau formulaire est réactif et typé ; aucun `UntypedFormGroup` ni `any` dans son modèle.
- **D4.INV-2** : chaque erreur de validation renvoyée par le back est rattachée au contrôle correspondant (application de SC6.INV-1) ; une erreur sans contrôle correspondant est affichée dans le résumé d'erreurs.
- **D4.INV-3** : chaque champ a un libellé associé, et son message d'erreur lui est lié par `aria-describedby`.

**D5 : routage et sécurité**

- **D5.INV-1** : chaque fonctionnalité est chargée à la demande (`loadComponent` ou `loadChildren`).
- **D5.INV-2** : aucun `bypassSecurityTrust*` ni `innerHTML` alimenté par une donnée non maîtrisée, sauf justification écrite et revue.
- **D5.INV-3** : le jeton d'accès n'est jamais dans une URL, dans `localStorage` ni dans un journal, et l'intercepteur ne l'envoie qu'à l'origine de l'API.
- **D5.INV-4** : les gardes de route améliorent l'expérience mais ne sont jamais la seule protection d'une donnée ; le back décide (application de SC4).

**D6 : accessibilité**

- **D6.INV-1** : aucune erreur des règles d'accessibilité des templates d'`angular-eslint`.
- **D6.INV-2** : aucune violation axe des niveaux WCAG A et AA sur les parcours couverts par les tests de bout en bout.
- **D6.INV-3** : à chaque navigation, le titre du document change et le focus est placé sur le titre principal de la page.
- **D6.INV-4** : tout message qui apparaît sans action de l'utilisateur sur l'élément concerné (chargement terminé, erreur, confirmation) est annoncé aux technologies d'assistance.

**D7 : tests**

- **D7.INV-1** : chaque invariant actif a au moins un contrôle automatisé, ou une entrée de grille de revue justifiée.
- **D7.INV-2** : les tests unitaires n'émettent aucune requête réseau réelle ; les appels HTTP sont vérifiés avec `HttpTestingController`.
- **D7.INV-3** : les tests ciblent les éléments par rôle, libellé ou harnais, jamais par une classe CSS de présentation.
- **D7.INV-4** : aucun test ne dépend de l'heure réelle ni d'un délai réel.

**D8 : revue**

- **D8.INV-1** : chaque constat cite un emplacement (`fichier:ligne`), l'invariant concerné ou la mention « hors invariant » avec sa justification, une gravité et une correction proposée.
- **D8.INV-2** : en mode relire, l'expert ne modifie aucun fichier sans demande explicite.
- **D8.INV-3** : les constats sont classés par gravité décroissante, et un constat sans preuve est présenté comme une question.

## 11. Journal de révision

**1.0.0** (2026-10-16) : première version. Dimensions D1 à D8 actives, D9 et D10 réservées. Points d'extension E1 à E5. Socle back-front 1.0.0 épinglé. Archive : `archives/SKILL-v1.0.0.md`.

**1.0.1** (2026-10-21) : correctif. Le skill s'appelle désormais `angular` (auparavant `expert-angular`) : le préfixe `expert-` est retiré de tous les skills du dépôt. Les autres skills citent ses invariants sous la forme `angular:Dn.INV-k` ; il se matérialise dans `.skills/angular/`. Socle back-front épinglé en 1.0.1. Aucune dimension ni aucun invariant modifié. Motif : une nouvelle notion d'expertise sera définie ensuite.
<<<FIN references/angular.md>>>

<<<FICHIER meso-contrats.md>>>
---
name: meso-contrats
description: Modèle des invariants du projet pour l'orchestrateur C7E (persistance PostgreSQL et Liquibase, contrats d'interface REST conformes au socle, back Spring Boot, front Angular, performance, sécurité, Git, niveau de preuve par criticité, exclusions, modèle du registre des écarts), pré-rempli pour l'adaptateur par défaut. À copier dans le projet et à remplir par le développeur ; l'IA le lit avant chaque ticket et ne le modifie jamais.
dimensions: [D8]
status: active
role: invariants du projet, fixés par le développeur ; l'IA règle les paramètres opérationnels, jamais ces invariants
stack: [PostgreSQL 15+, Liquibase 4.x, Java 21, Spring Boot 3.5, Angular 20]
---

# Invariants du projet (meso-contrats)

> Copie du projet : `docs/c7e/meso-contrats.md` ⚠️ ADAPTER (emplacement). Le développeur la remplit et la tient à jour ; l'IA la lit avant chaque ticket et ne la modifie jamais (D6.INV-2, D8.INV-1).
> ⚠️ ADAPTER : valeur à remplacer par la norme exacte du projet. Une valeur ADAPTER restée telle est signalée avant la fiche, jamais devinée (D8.INV-1).
> Tout écart constaté par l'IA s'inscrit au registre des écarts, fichier distinct (section 7) ; il n'est jamais corrigé ni toléré en silence (D6.INV-3).
> Ces invariants valent dans tous les modes de modulation (D2.INV-2). Ils précisent le socle back-front et les référentiels Java et Angular, sans les contredire : en cas de contradiction, le socle l'emporte et l'écart s'inscrit au registre (D8.INV-2).
> Chaque section porte le slot de l'Axiome 7E qu'elle contraint (D1.INV-1, D1.INV-2) ; aucune modification du projet n'a lieu avant la validation de la fiche (D3.INV-1).

## 1. Contrats de persistance (É1) : PostgreSQL et Liquibase

### Changesets

- Fichier : `db/changelog/<aaaa><mm><jj>-<hh><mm>-<slug>.yaml`, sous `src/main/resources`, inclus par le changelog maître (`db/changelog/db.changelog-master.yaml`, chemin par défaut de Spring Boot) ⚠️ ADAPTER.
  Ex. : `db/changelog/20261030-1430-add-colonne-mode-chargement.yaml`
- Un changeset par fichier, dont l'`id` est le nom du fichier sans extension. Une migration en plusieurs étapes prend un fichier par étape.
- `author` : trigramme du développeur qui valide (ex. `jdu`) ⚠️ ADAPTER.
- Un changeset appliqué n'est jamais modifié : on en ajoute un autre (java:D4.INV-1).

### Colonnes

- snake_case : `date_creation`, `mode_chargement` ; jamais de camelCase en base.
- Types :
  - `timestamptz`, jamais `timestamp` ; `Instant` ou `OffsetDateTime` côté Java, chaîne ISO 8601 avec fuseau en JSON (SC3.INV-1) ;
  - `numeric(p,s)` pour les montants, jamais `float` ni `double` (SC3.INV-2) ;
  - `varchar(n)`, avec n justifié.
- NULL interdit par défaut ; une colonne nullable se justifie dans le `comment` du changeset.
- Contraintes nommées : `pk_<table>`, `fk_<table>_<colonne>`, `uq_<table>_<colonne>`, `idx_<table>_<colonne>`, en 63 octets au plus : PostgreSQL tronque un nom plus long, au risque de collision.

### Règles de migration

- Bloc `rollback` explicite sur tout changeset (clé `rollback:` en YAML), même quand Liquibase sait le déduire. `runOnChange` n'est pas un retour arrière : il rejoue un changeset dont le contenu a changé, ce qu'interdit la règle « jamais modifié ».
- Idempotence : `preConditions` avec `onFail: MARK_RAN` quand l'objet peut déjà exister.
- Retour arrière vérifié avant la remise : `update-testing-rollback` (déployer, annuler, redéployer) sur une copie de la base de référence.
- Données historiques : une colonne NOT NULL ajoutée à une table non vide exige :
  - soit un DEFAULT constant, qui ne réécrit pas la table depuis PostgreSQL 11 ;
  - soit un rattrapage en trois changesets : colonne nullable, rattrapage, contrainte NOT NULL. Avec une valeur de rattrapage constante, deux suffisent : `addNotNullConstraint` avec `defaultNullValue` remplit les NULL avant de poser la contrainte.
- ⚠️ ADAPTER (seuil) : tables de plus d'un million de lignes.
  - Migration en heures creuses, après confirmation du développeur.
  - Index par `CREATE INDEX CONCURRENTLY`, que PostgreSQL refuse dans une transaction : un changeset `sql` qui ne contient que cette instruction, avec `runInTransaction: false`, et `DROP INDEX CONCURRENTLY` en retour arrière. Une construction interrompue laisse un index invalide, à supprimer avant de rejouer.
  - `SET NOT NULL` relit toute la table sous verrou exclusif : poser d'abord `CHECK (<colonne> IS NOT NULL) NOT VALID`, la valider (`VALIDATE CONSTRAINT`), puis `SET NOT NULL`, que PostgreSQL 12 et plus récents appliquent alors sans relire la table.

```yaml
databaseChangeLog:
  - changeSet:
      id: 20261030-1500-idx-donnee-mode-chargement
      author: jdu
      runInTransaction: false
      comment: index construit sans bloquer les écritures (table de plus d'un million de lignes)
      changes:
        - sql:
            sql: CREATE INDEX CONCURRENTLY idx_donnee_mode_chargement ON donnee (mode_chargement)
      rollback:
        - sql:
            sql: DROP INDEX CONCURRENTLY IF EXISTS idx_donnee_mode_chargement
```

## 2. Contrats d'interface (É3) : REST conformes au socle

Le socle (`socle/SKILL.md`, SC1 à SC6) fait foi pour la frontière ; cette section n'en retient que les valeurs du projet.

### Endpoints

- Contrat : `api/openapi.yaml`, OpenAPI 3.1, source de vérité ⚠️ ADAPTER (chemin).
- Ressources au pluriel, en kebab-case, sans verbe : `GET /api/v1/donnees`. Préfixe de version `/api/v1/` ⚠️ ADAPTER (en-tête de version si la norme du projet diffère).
- Action métier sans ressource naturelle : méthode personnalisée `POST /api/v1/donnees:recharger` (convention AIP-136), seule exception au nom sans verbe ⚠️ ADAPTER (sinon, sous-ressource nommée : `POST /api/v1/donnees/rechargements`).
- Pagination de toute collection (SC3.INV-3) :
  - requête `?page=0&size=20&sort=dateCreation,desc`, taille bornée par le back ;
  - réponse `{ "content": [...], "page": { "size": 20, "number": 0, "totalElements": 134, "totalPages": 7 } }`, la forme de `PagedModel` de Spring Data (`@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)`) ;
  - jamais un `Page` ou un `PageImpl` sérialisé tel quel : Spring Data n'en garantit pas la forme.
- Filtres : paramètres de requête, dates ISO 8601 : `?statut=ACTIF&dateDebut=2026-01-01`.

### Erreurs : RFC 9457 (`application/problem+json`)

La RFC 9457 remplace la RFC 7807. Format du socle (SC2), avec ses trois extensions `code`, `traceId` et, pour la validation, `errors[]` :

```json
{
  "type": "https://errors.example.org/ressource-introuvable",
  "title": "Ressource introuvable",
  "status": 404,
  "detail": "Aucune donnée avec l'identifiant 42",
  "instance": "/api/v1/donnees/42",
  "code": "DONNEE_NOT_FOUND",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736"
}
```

- `code` : constante en MAJUSCULES_SOULIGNÉES, stable, partie du contrat ; le front décide sur `status` et `code`, jamais sur `title` ni `detail` (SC2.INV-2).
- Statuts du socle (SC2) :
  - 400 entrée invalide, `VALIDATION_FAILED`, avec `errors[]` : `field`, `code`, `message` ;
  - 401 non authentifié ; 403 authentifié sans le droit ; 404 ressource absente ;
  - 409 conflit de version ; 422 règle métier violée ;
  - 500 sans détail technique (SC2.INV-3).
- ⚠️ ADAPTER : `type`, l'URI de la documentation des erreurs du projet. Une extension propre au projet (par exemple `timestamp`) s'ajoute aux trois du socle, sans en retirer aucune.

### Gate É3 (bloquante)

- Contrat écrit et validé avant toute implémentation de niveau d=2 (D3.INV-2).
- ⚠️ ADAPTER : relecteur du contrat, le tech lead, avant le code de niveau d=2.
- Le code ne contredit pas le contrat : test de conformité côté back (SC1.INV-1) et comparaison avec la version publiée du contrat (SC1.INV-2), en gate Méso → Macro.

## 3. Contrats back (É2, É4) : Spring Boot

### Couches

```
Controller (@RestController) → Service (@Service) → Repository (Spring Data JPA)
```

Ce sont les couches `api`, `application` et `infrastructure` du référentiel Java, autour du `domain` ; dans un projet organisé en `controller/`, `service/`, `repository/`, la convention en place est gardée.

- Controller : aucune logique métier, aucun accès direct au Repository, aucune entité JPA en paramètre ni en retour (java:D1.INV-2).
- Service : frontières transactionnelles dans la couche application, `@Transactional` sur méthode publique, `readOnly = true` pour les lectures (java:D4.INV-3) ; `spring.jpa.open-in-view=false` (java:D4.INV-2).
- Repository : interface Spring Data JPA ; requêtes dérivées de préférence, `@Query` documentée sinon ; jamais de concaténation avec une donnée d'entrée (java:D4.INV-4).
- Injection par constructeur (java:D1.INV-3).

### DTO : jamais d'entité exposée

- Requête `XxxRequest`, validée par Bean Validation (`@NotBlank`, `@Size(max = …)`, `@Pattern`) avant la couche application, avec des messages explicites (java:D3.INV-2).
- Réponse `XxxResponse` : `record` immuable (java:D2.INV-1).
- Mapping : MapStruct ⚠️ ADAPTER (dépendance à valider), ou mapping explicite.

### Erreurs

- Exceptions métier typées, `DonneeNotFoundException`, `AccesRefuseException`…, qui étendent une `BusinessException` portant un `ErrorCode`.
- Un seul `@RestControllerAdvice` les traduit en Problem Details, avec `code` et `traceId` (java:D3.INV-3).
- Aucun `catch` muet (java:D2.INV-4) ; toute exception non gérée est journalisée avec le `traceId` du contexte W3C Trace Context (SC5.INV-1).

## 4. Contrats front (É5) : Angular

### Structure

- Composants autonomes, aucun nouveau `NgModule` (angular:D1.INV-1).
- `ChangeDetectionStrategy.OnPush` (angular:D2.INV-1) ; flux de contrôle `@if`, `@for` avec `track`, `@switch` (angular:D2.INV-2) ; entrées et sorties par `input()` et `output()` (angular:D2.INV-3).
- Nommage des fichiers : celui du projet, un fichier par classe. Un projet créé en Angular 20 suit son guide de style : `donnees-list.ts` pour la classe `DonneesList`, `donnees-list.spec.ts` pour son test. Un projet plus ancien garde `donnees-list.component.ts`.

### État ⚠️ ADAPTER (si NgRx est imposé)

- État local du composant en `signal()`.
- État serveur détenu par le service de données, exposé au composant en signal (`toSignal`) ou en observable lu par `async` ; jamais d'abonnement manuel sans `takeUntilDestroyed` (angular:D2.INV-4). `resource` et `httpResource`, expérimentales en Angular 20, ne sont pas utilisées.
- États d'interface OBLIGATOIRES sur toute donnée asynchrone : `loading`, `success`, `error`, `empty`, en union discriminée lue par `@switch` ; jamais de booléens `isLoading` et `isError` entremêlés.

### Interactions

- Appels à l'API par le client généré depuis le contrat (SC1.INV-3, angular:D3.INV-1), enveloppé dans un service de données ; aucun composant de présentation ne déclenche de requête (angular:D3.INV-3) ; jamais d'`HttpClient` dans un composant.
- Recherche : `switchMap`, anti-rebond de 300 ms.
- Envoi : `exhaustMap`, qui ignore les clics tant que la requête est en cours. Le bouton reste focalisable (`aria-disabled="true"`) et l'attente est annoncée (angular:D6.INV-4), plutôt qu'un `disabled` qui ferait perdre le focus.
- Erreur de l'API : état d'erreur, message localisé depuis `code` (SC6), `traceId` affiché sous une forme copiable (SC5), annonce aux technologies d'assistance (angular:D6.INV-4) ; jamais `error.message` brut.

### Accessibilité

- RGAA 4.1 et WCAG 2.2 niveau AA (SC6).
- Chaque champ a son libellé, et son message d'erreur lui est lié (angular:D4.INV-3) ; aucune information par la couleur seule (SC6.INV-2).

## 5. Invariants transverses (d=0 → d=3)

### Performance et SLA ⚠️ ADAPTER (valeurs)

- Endpoints de lecture : p95 < 300 ms ; d'écriture : p95 < 500 ms.
- Requête SQL à plus de trois jointures, ou sans index : plan analysé par `EXPLAIN`. `EXPLAIN ANALYZE` exécute la requête : seulement pour une lecture, jamais en production.
- N+1 constaté : `@EntityGraph` ou `JOIN FETCH` obligatoire.

### Sécurité (SC4)

- Jeton porteur émis par le fournisseur d'identité OAuth 2.1 ou OpenID Connect, validé par le back en serveur de ressources ⚠️ ADAPTER (SSO du projet). Avec des cookies de session, protection CSRF des deux côtés.
- Autorisation vérifiée par le back : chaîne de sécurité qui refuse par défaut (java:D5.INV-1), `@PreAuthorize("hasRole('…')")` sur les endpoints, avec `@EnableMethodSecurity`. Le front n'est jamais une barrière de sécurité.
- Aucun jeton, mot de passe ni donnée personnelle dans un journal, une URL ou un DTO de réponse sans masquage (SC4.INV-1, java:D5.INV-4).
- Requêtes paramétrées (JPA, Criteria), jamais de concaténation SQL (java:D4.INV-4).

### Git (SKILL, § 4)

- Une branche par ticket, au format du projet ; par défaut celui du kit : `<type>/<CLÉ>-<slug>`, par exemple `feature/ABCDE-3512-chargement-a-la-demande` (D4.INV-1) ⚠️ ADAPTER.
- Commit : `<CLÉ> : [É<n>-<DOM>] <type>(<portée>): <description>`, types `feat|fix|refactor|test|chore|docs` (D4.INV-2).
- Rétroaction : `<CLÉ> : [É<n>-<DOM>] fix(<portée>): … après l'observation É6 …`, l'observation citée dans le corps (D6.INV-1).
- Tag de livraison : posé par le développeur, `vX.Y.Z` par défaut ⚠️ ADAPTER. L'IA ne pousse, ne fusionne ni ne pose de tag (D4.INV-3).

### Niveau de preuve par criticité ⚠️ ADAPTER (grille)

| Criticité | Tests requis | Revue |
|---|---|---|
| Triviale (une couche, pas de base) | Unitaires ciblés | Auto-contrôle de l'IA, puis validation du développeur |
| Standard (plusieurs couches) | Unitaires, intégration, contrat | Pair |
| Critique (authentification, paiement, batch) | En plus : bout en bout, scénario de retour arrière de la base | Tech lead obligatoire |

La criticité retenue fixe la configuration du ticket (D2.INV-1) et le niveau de preuve de son dossier (D5.INV-3). Chaque test requis prouve un critère d'acceptation ou un risque (D5.INV-1) ; aucun test existant n'est supprimé ni affaibli sans accord (D5.INV-2).

## 6. Exclusions et périmètre ⚠️ ADAPTER (à remplir par projet)

- Zones hors périmètre, à ne pas modifier sans accord : …
- Dépendances interdites ou à valider : … Toute nouvelle dépendance se valide avec le développeur.
- Environnements : dev → recette → prod, promotion par merge request uniquement. L'IA ne déploie dans aucun environnement.
- Emplacements des fichiers C7E, si l'équipe ne versionne pas `docs/c7e/` : … La fiche d'un ticket se range à `docs/demandes/<CLÉ>/fiche-transformation.md` par défaut (D3.INV-3).

## 7. Registre des écarts : modèle

Fichier `docs/c7e/registre-ecarts.md` ⚠️ ADAPTER (emplacement), créé à l'installation à partir de ce modèle. L'IA y ajoute une ligne par écart ; le développeur en remplit la décision (D6.INV-3).

```markdown
# Registre des écarts

| Date | Ticket | Invariant concerné | Écart constaté | Décision (respecter, ou dérogation validée par) |
|---|---|---|---|---|
| 2026-10-30 | EX-001 | meso-contrats, § 1, rollback | changeset généré sans rollback | respecter : corrigé avant commit |
```
<<<FIN meso-contrats.md>>>

<<<FICHIER modules/mesure/SKILL.md>>>
---
name: mesure
description: Dimension réservée D9, campagne de mesure de la valeur de la méthode C7E (au moins dix tickets comparables traités avec et sans la méthode, évaluateur indépendant, indice V calculé à partir des indicateurs consignés dans les fiches, sans double comptage). Ne pas appliquer en 3.x ; lire seulement pour comprendre le point d'extension E1.
dimensions: [D9]
status: reserved
---

# Module `mesure` (D9, réservé)

Statut : `reserved`. En 3.x, aucune campagne n'est menée : toute valeur annoncée de la méthode est une hypothèse (D7.INV-1).

## 1. Pourquoi cette dimension existe

La méthode promet une meilleure qualité, une meilleure maîtrise des risques et une capitalisation. Ce sont des hypothèses tant qu'elles ne sont pas mesurées contre une base de comparaison. La campagne de mesure ferme la boucle au niveau de la méthode elle-même : l'Environnement (les équipes, les commanditaires) juge sur preuve, et son jugement redevient Élément de la version suivante du skill.

## 2. Principe prévu

- Au moins dix tickets comparables, en complexité et en criticité, traités avec la méthode et sans elle.
- Un évaluateur indépendant de l'équipe et de l'IA.
- L'indice V calculé à partir des indicateurs Q, R, T, C et A consignés dans les fiches, chacun selon sa définition, entre 0 et 1 (D7.INV-2), sans compter deux fois un même bénéfice.
- Un résultat publié avec sa méthode, ses limites et ses données ; le registre des concepts en tire ses promotions et ses retraits, par revue humaine.

## 3. Ce que prépare le point d'extension

| Point | Règle active en 3.x |
|---|---|
| E1 | chaque fiche consigne la configuration retenue et les indicateurs Q, R, T, C, A avec leur calcul |

## 4. Test d'inertie en 3.x

Le scénario R9 du point d'entrée : une question sur la valeur de la méthode reçoit une réponse étiquetée « hypothèse ».
<<<FIN modules/mesure/SKILL.md>>>

<<<FICHIER modules/referentiel/SKILL.md>>>
---
name: referentiel
description: Dimension D10, le référentiel des méso-contrats du projet. Catégories de tickets avec leur empreinte technique par couche, options au choix (évolution de schéma et contrat CRUD pour PostgreSQL, règles, fonctionnalités et endpoints pour Java, éléments graphiques et fonctionnalités pour Angular, analyse d'une image PNG de l'objectif pour toute option front), méso-contrats transverses, modèle générique de la demande dont part la qualification de chaque ticket (D11), et instance de chaque ticket dans ticket.toml. À lire à l'installation, à l'ouverture et à l'analyse de chaque ticket.
dimensions: [D10]
status: active
---

# Module `referentiel` (D10)

Statut : `active`, depuis la version 3.2.0. Modèle du référentiel en 3.1.0 depuis la version 3.3.0 du skill : modèle générique de la demande ajouté. Modèle en 3.2.0 depuis la version 3.4.0 : catégorie M04, variante de représentation d'une ressource, avec l'option `representations` et ses paramètres au choix par ticket.

## 1. Rôle

Deux fichiers du projet encadrent un ticket :

- le **fichier d'invariants**, `docs/c7e/meso-contrats.md` (D8), dit les règles que tout contrat respecte ;
- le **référentiel des méso-contrats**, `docs/c7e/referentiel-meso-contrats.toml` (D10), dit quels contrats un ticket engage : sa catégorie, les couches qu'elle touche et les options choisies sur chaque couche.

Un méso-contrat est une catégorie de tickets, définie par son empreinte technique : pour chaque couche (persistance, backend, frontend), un impact `requis`, `optionnel` ou `aucun`, et les options permises. Le ticket choisit ses options parmi celles-ci ; chaque option engage un slot et des preuves. Les méso-contrats transverses (socle back-front, accessibilité, migration sûre) ne se choisissent pas : ils s'appliquent d'office aux couches touchées.

Le référentiel porte aussi le **modèle générique de la demande** (section 0) : une combinaison de possibilités de modification de l'application, couche par couche, chacune avec son option et ses repères, établies à l'analyse de l'application, et la règle de choix du méso-contrat. La qualification de chaque ticket, à son ouverture, part de ce modèle (module `qualification`, D11).

## 2. Emplacements

| Fichier | Rôle | Qui l'écrit | Emplacement |
|---|---|---|---|
| référentiel du projet | modèle générique de la demande, catégories, options, transverses, règles de validation | le développeur, à partir du modèle du § 6 ; jamais l'IA (D10.INV-5) | `docs/c7e/referentiel-meso-contrats.toml` |
| instance du ticket | demande remplie, méso-contrat confirmé, options choisies, version du référentiel | l'IA propose ; le développeur confirme le méso-contrat à la qualification (D11.INV-3), puis valide les options avec la fiche (D10.INV-1) | `docs/demandes/<CLÉ>/ticket.toml` |
| analyse d'image | extractions, correspondances, questions, écarts | l'IA ; validée avec la fiche (D10.INV-4) | `docs/demandes/<CLÉ>/analyse-image.md` |
| images de l'objectif | maquettes ou captures au format PNG | le développeur ou le PO | `docs/demandes/<CLÉ>/maquettes/` |

Les images sont versionnées avec la demande : les commandes de Gemini CLI n'injectent pas un fichier exclu de Git.

## 3. À l'analyse de chaque ticket (d=0)

Ces étapes prennent place dans l'analyse du § 3 du point d'entrée, après la cartographie d'impact et avant la fiche. Le ticket a déjà été qualifié à son ouverture : son méso-contrat est confirmé, et `ticket.toml` porte la demande remplie et la version du référentiel (module `qualification`).

1. Partir du méso-contrat confirmé. Si la cartographie d'impact montre que la demande sort de son empreinte, revenir à la qualification : compléter la demande, proposer un autre méso-contrat et le faire confirmer, sans en changer de soi-même ni écrire de catégorie nouvelle (D11.INV-4, D10.INV-5).
2. Prendre pour point de départ les options que signale la demande remplie.
3. Choisir les options, couche par couche, parmi les options permises du méso-contrat (D10.INV-2) :
   - persistance : évolution de schéma (tables, colonnes, index, contraintes) ; contrat CRUD, avec ses opérations et, si `delete` est retenu, le mode de suppression ;
   - backend : endpoints, règles métier, fonctionnalités ; variantes de représentation, avec le repérage depuis l'URI et une valeur pour chaque paramètre (mécanisme de sélection, exposition de la variante sans champ) ; la réponse actuelle reste inchangée sans sélection, et le remplacement d'une réponse publiée se refuse (D10.INV-6) ;
   - frontend : éléments graphiques, fonctionnalités ; pour chacun, s'il y a lieu, l'image de l'objectif (`image_objectif`) et les extractions demandées (`analyse_image`).
4. Analyser les images demandées dans `analyse-image.md` (D10.INV-4) :
   - les extractions demandées : structure, composants, textes, états, couleurs, accessibilité ;
   - la correspondance de chaque élément de l'image avec une option du ticket ;
   - les éléments sans option correspondante, posés en questions au développeur ;
   - les écarts avec l'écran actuel, si sa capture est fournie (`image_actuelle`) ;
   - les tailles et les couleurs, données comme estimations à confirmer avec le système de design ; ce qu'une image ne montre pas (focus, annonces aux technologies d'assistance, comportement) reste à prouver par les tests.
5. Ajouter aux tests déduits les preuves de chaque option retenue et les exigences des méso-contrats transverses des couches touchées (D10.INV-2, D10.INV-3). Chaque preuve garde son lien à un critère ou à un risque (D5.INV-1).
6. Compléter `ticket.toml` des options choisies, et le présenter avec la fiche et l'analyse : un point de validation, avant toute modification (D3.INV-1).

## 4. Des options aux slots

| Couche | Option | Slot | Étiquette des commits |
|---|---|---|---|
| persistance | `schema`, `crud` | É1 | `[É1-DB]` |
| backend | `endpoints`, `representations` | É3 | `[É3-API]` |
| backend | `regles`, `fonctionnalites` | É4 | `[É4-SVC]` |
| frontend | `fonctionnalites` | É2, puis É5 | `[É2-UI]`, `[É5-UI]` |
| frontend | `elements_graphiques` | É5 | `[É5-UI]` |
| frontend | `analyse_image` | analyse (d=0), preuve en É6 | aucun commit propre |

## 5. Au démarrage

Le référentiel ne sert que si le développeur a choisi l'orchestrateur (D2.INV-3, § 11.4 du point d'entrée). Il se lit à l'ouverture et à l'analyse de chaque ticket, pas au démarrage : dans un chargement permanent, seul le fichier d'invariants accompagne le point d'entrée.

## 6. Modèle du référentiel

À l'installation (§ 11.3 du point d'entrée), le bloc annoté ci-dessous s'écrit à l'identique dans le projet, depuis sa racine ; le fichier est le contenu du bloc, terminé par un saut de ligne. Son empreinte se vérifie ensuite :

| Fichier | Empreinte sha256 |
|---|---|
| `docs/c7e/referentiel-meso-contrats.toml` | `28d030f8f3a88e86a3532ab70520ba9281d2ff7ffcd10718b59f9187ad11443d` |

Commande d'extraction et de vérification, depuis la racine du projet (Node 20 ou plus récent, sans dépendance). Elle suppose le skill dans `.skills/orchestrateur-c7e/` ; pour un autre emplacement, comme `.gemini/skills/orchestrateur-c7e/` en chargement au choix, remplacer ce chemin :

```bash
node -e "const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'); const texte = fs.readFileSync('.skills/orchestrateur-c7e/modules/referentiel/SKILL.md', 'utf8').replace(/\r\n/g, '\n'); const m = /^<\x21-- fichier : (\S+) -->\n\x60{3}[a-z]*\n([\s\S]*?)\n\x60{3}\n/m.exec(texte); const contenu = m[2] + '\n'; fs.mkdirSync(path.dirname(m[1]), { recursive: true }); fs.writeFileSync(m[1], contenu); const conforme = crypto.createHash('sha256').update(contenu).digest('hex') === '28d030f8f3a88e86a3532ab70520ba9281d2ff7ffcd10718b59f9187ad11443d'; console.log((conforme ? 'conforme  ' : 'ECART     ') + m[1]); if (!conforme) process.exitCode = 1;"
```

Le développeur adapte ensuite sa copie : possibilités du modèle générique de la demande, confrontées à l'analyse de l'application (module `qualification`, § 2), catégories `M05` et suivantes, technologies, options permises, transverses. Il change `meta.version` à chaque modification ; les tickets déjà instanciés gardent la version qu'ils ont épinglée.

Un référentiel installé avant la version 3.3.0 du skill n'a pas de section `[modele_demande]` : le développeur l'y ajoute, copiée de ce modèle. D'ici là, la qualification prend celle du modèle et le signale (module `qualification`, § 2).

Un référentiel installé avant la version 3.4.0 n'a ni M04, ni l'option `representations`, ni la possibilité `variante_representation`, ni la règle de choix sur les possibilités requises. Le développeur les copie de ce modèle s'il veut cette catégorie, et change `meta.version`. D'ici là, un ticket de variante de représentation ne trouve pas de catégorie : il se signale, sans catégorie inventée (D10.INV-1).

<!-- fichier : docs/c7e/referentiel-meso-contrats.toml -->
```toml
# ==============================================================================
# RÉFÉRENTIEL DES MÉSO-CONTRATS ET CATÉGORIES DE TICKETS
# ==============================================================================
#
# 3.2.0 (1er novembre 2026)
#   - Catégorie M04, variante de représentation d'une ressource : depuis l'URI
#     d'une opération, son type de réponse et un champ liste ou record, une
#     variante sans ce champ, et une variante à la même URI où ce champ est
#     remplacé par la date-heure de son dernier enregistrement.
#   - Possibilité variante_representation (backend) ; lecture étendue aux
#     projections et agrégats.
#   - Option backend « representations », avec des paramètres au choix par
#     ticket : mécanisme de sélection et exposition de la variante sans champ.
#   - Possibilités requises d'un méso-contrat (possibilites_requises), prises en
#     compte par la règle de choix.
#   - Deux règles de validation de plus (section 4).
#
# 3.1.0 (1er novembre 2026)
#   - Modèle générique de la demande (section 0) : une combinaison de
#     possibilités, les modifications qu'un ticket peut demander à l'application,
#     couche par couche (PostgreSQL, Java, Angular), établies à l'analyse de
#     l'application. À l'ouverture de chaque ticket, sa demande est la
#     combinaison des possibilités qu'il implique ; elle désigne le méso-contrat
#     par la règle de choix, et le développeur le confirme avant tout le reste.
#   - Le ticket garde sa demande dans [ticket.demande] ; règles de validation
#     correspondantes (section 4).
#
# 3.0.0 (31 octobre 2026)
#   - Options au choix par couche (section 1) :
#       PostgreSQL : évolution de schéma, contrat CRUD au choix ;
#       Java       : règles, fonctionnalités, endpoints ;
#       Angular    : éléments graphiques, fonctionnalités ;
#       toute option front accompagnée d'une image PNG de l'objectif peut en
#       demander l'analyse.
#   - Empreinte technique typée : impact requis, optionnel ou aucun, et options
#     permises par couche.
#   - Méso-contrats transverses, appliqués d'office selon les couches touchées.
#   - Le ticket concret sort du référentiel : un fichier par ticket
#     (docs/demandes/<référence>/ticket.toml), qui épingle la version utilisée.
# ==============================================================================

[meta]
version = "3.2.0"
domaine = "Software Factory & Architecture"
description = "Taxonomie des méso-contrats structurant les évolutions logicielles de la stack (PostgreSQL, Java, Angular), avec les options au choix de chaque couche."

[meta.valeurs]
impact = ["requis", "optionnel", "aucun"]
complexite = ["Faible", "Moyenne", "Élevée"]
couches = ["persistance", "backend", "frontend"]

# ------------------------------------------------------------------------------
# 0. MODÈLE GÉNÉRIQUE DE LA DEMANDE
#    Une combinaison de possibilités : les modifications qu'un ticket peut
#    demander à l'application, couche par couche. La liste ci-dessous vaut pour
#    une application PostgreSQL, Java et Angular ; à l'installation, l'IA la
#    confronte à l'analyse de l'application et propose au développeur les
#    possibilités à retenir, à préciser (repères) ou à ajouter (batch, message,
#    export…). Le développeur seul les écrit ici.
#    À l'ouverture de chaque ticket, chaque possibilité vaut oui, non ou
#    inconnu d'après le contenu du ticket, avec sa source ; la combinaison des
#    possibilités à oui désigne le méso-contrat par la règle de choix. Une
#    possibilité inconnue dont la réponse changerait le méso-contrat ou ses
#    options devient une question au développeur, qui confirme ensuite le
#    méso-contrat avant toute autre étape.
# ------------------------------------------------------------------------------

[modele_demande]
valeurs = ["oui", "non", "inconnu"]
choix = [
  "toute couche d'une possibilité à oui a, dans l'empreinte du méso-contrat, l'impact requis ou optionnel",
  "toute couche à l'impact requis dans l'empreinte porte au moins une possibilité à oui",
  "toute possibilité requise par le méso-contrat (possibilites_requises) est à oui",
  "l'option de chaque possibilité à oui figure parmi les options permises de sa couche",
  "un seul méso-contrat convient : il est proposé ; plusieurs : une question les départage ; aucun : le ticket est signalé, sans catégorie inventée",
]

[modele_demande.intention]
question = "Quel changement le demandeur attend-il, en une phrase ?"

[modele_demande.maquette]
question = "Une maquette ou une capture PNG montre-t-elle l'objectif ?"
couche = "frontend"
note = "L'image s'analyse avec l'option front qu'elle illustre (analyse_image)."

# Persistance : PostgreSQL et Liquibase

[[modele_demande.possibilites]]
id = "table"
couche = "persistance"
modification = "Créer une table"
option = "schema"
reperes = ["changelog Liquibase"]

[[modele_demande.possibilites]]
id = "colonne"
couche = "persistance"
modification = "Ajouter ou modifier une colonne"
option = "schema"
reperes = ["changelog Liquibase", "entité JPA"]

[[modele_demande.possibilites]]
id = "index"
couche = "persistance"
modification = "Ajouter ou modifier un index, pour la performance d'une requête"
option = "schema"
reperes = ["changelog Liquibase", "plan d'exécution"]

[[modele_demande.possibilites]]
id = "contrainte"
couche = "persistance"
modification = "Ajouter ou modifier une contrainte : clé, unicité, NOT NULL"
option = "schema"
reperes = ["changelog Liquibase"]

[[modele_demande.possibilites]]
id = "lecture"
couche = "persistance"
modification = "Lire les données d'une entité : filtre, tri, pagination, projection ou agrégat"
option = "crud"
reperes = ["repository Spring Data", "requête", "projection ou requête d'agrégat"]

[[modele_demande.possibilites]]
id = "ecriture"
couche = "persistance"
modification = "Créer, modifier ou supprimer les données d'une entité"
option = "crud"
reperes = ["repository Spring Data", "transaction"]

# Backend : Java et Spring Boot

[[modele_demande.possibilites]]
id = "endpoint_nouveau"
couche = "backend"
modification = "Ajouter un endpoint"
option = "endpoints"
reperes = ["contrat OpenAPI", "contrôleur REST"]

[[modele_demande.possibilites]]
id = "endpoint_modifie"
couche = "backend"
modification = "Modifier le contrat d'un endpoint : paramètres, réponse, erreurs"
option = "endpoints"
reperes = ["contrat OpenAPI", "contrôleur REST", "DTO"]

[[modele_demande.possibilites]]
id = "variante_representation"
couche = "backend"
modification = "Ajouter une variante de représentation d'une opération existante : un champ liste ou record retiré, ou remplacé par la date-heure de son dernier enregistrement"
option = "representations"
reperes = ["contrat OpenAPI", "contrôleur REST", "DTO ou record de réponse"]

[[modele_demande.possibilites]]
id = "regle"
couche = "backend"
modification = "Ajouter ou modifier une règle métier ou une habilitation"
option = "regles"
reperes = ["service du domaine", "sécurité des méthodes"]

[[modele_demande.possibilites]]
id = "service"
couche = "backend"
modification = "Ajouter ou modifier un cas d'usage côté serveur"
option = "fonctionnalites"
reperes = ["service applicatif"]

# Frontend : Angular

[[modele_demande.possibilites]]
id = "ecran_nouveau"
couche = "frontend"
modification = "Créer un écran ou un composant"
option = "elements_graphiques"
reperes = ["composant Angular", "routes"]

[[modele_demande.possibilites]]
id = "ecran_modifie"
couche = "frontend"
modification = "Modifier un composant : mise en page, libellés, états visuels"
option = "elements_graphiques"
reperes = ["gabarit et styles du composant"]

[[modele_demande.possibilites]]
id = "formulaire"
couche = "frontend"
modification = "Ajouter ou modifier un formulaire ou ses validations"
option = "fonctionnalites"
reperes = ["formulaire réactif", "validateurs"]

[[modele_demande.possibilites]]
id = "comportement"
couche = "frontend"
modification = "Modifier un comportement : déclencheur, état local, appel d'API"
option = "fonctionnalites"
reperes = ["signals", "service HTTP"]

[[modele_demande.possibilites]]
id = "navigation"
couche = "frontend"
modification = "Ajouter ou modifier une navigation ou une route"
option = "fonctionnalites"
reperes = ["routes", "gardes"]

# ------------------------------------------------------------------------------
# 1. OPTIONS AU CHOIX, PAR COUCHE
#    Chaque option nomme le slot 7E qu'elle engage et les preuves qu'elle exige.
#    Un méso-contrat permet un sous-ensemble de ces options ; un ticket y choisit.
# ------------------------------------------------------------------------------

[options.persistance.schema]
nom = "Évolution de schéma"
slot = "É1"
description = "Tables, colonnes, index et contraintes, par changesets Liquibase."
changements = ["table", "colonne", "index", "contrainte"]
preuves = [
  "migration jouée, annulée, rejouée (update-testing-rollback)",
  "un changeset par fichier, avec son rollback",
]

[options.persistance.crud]
nom = "Contrat CRUD"
slot = "É1"
description = "Opérations retenues, par entité, parmi create, read, update et delete."
operations = ["create", "read", "update", "delete"]
suppression = ["logique", "physique"]  # à choisir dès que delete est retenu
preuves = [
  "un test d'intégration du dépôt par opération retenue",
  "create : contraintes NOT NULL et valeurs par défaut vérifiées",
  "read : index pour chaque filtre ou tri, pagination { content, page }",
  "update : règle de concurrence explicite (verrouillage optimiste ou dernier écrivain)",
  "delete : mode de suppression et effet sur les clés étrangères vérifiés",
]

[options.backend.regles]
nom = "Règles métier"
slot = "É4"
description = "Règles de gestion et invariants du domaine, appliqués par un service."
preuves = [
  "un test unitaire par règle : cas nominal, cas limite, violation",
  "violation rendue en 422, avec un code métier (RFC 9457)",
]

[options.backend.fonctionnalites]
nom = "Fonctionnalités"
slot = "É4"
description = "Cas d'usage orchestrés par la couche application."
preuves = ["un test d'intégration par cas d'usage"]

[options.backend.endpoints]
nom = "Endpoints"
slot = "É3"
description = "Opérations REST, décrites dans le contrat OpenAPI avant tout code."
methodes = ["GET", "POST", "PUT", "PATCH", "DELETE"]
preuves = [
  "contrat OpenAPI 3.1 validé avant le code",
  "un test de contrat par opération",
  "erreurs RFC 9457 : 400, 401, 403, 404, 409 ou 422 selon le cas",
]

[options.backend.representations]
nom = "Variantes de représentation"
slot = "É3"
description = """
Variantes du type de réponse d'une opération existante. À l'analyse (d=0),
l'IA repère depuis l'URI l'opération du contrat OpenAPI et son contrôleur, le
type de réponse, le champ liste ou record visé, l'entité qui le porte et la
colonne de date-heure de son enregistrement ; elle l'écrit dans ticket.toml.
Variante sans champ : le type de réponse sans ce champ. Variante résumée : à
la même URI, le champ remplacé par la date-heure de son dernier enregistrement,
le maximum des dates des éléments pour une liste, la date du record pour un
record, calculée en base sans charger les éléments.
"""
variantes = ["sans_champ", "resume"]
preuves = [
  "repérage depuis l'URI écrit dans ticket.toml : opération, contrôleur, type de réponse, champ, entité et colonne de date-heure",
  "contrat OpenAPI : un schéma par variante et le mécanisme de sélection décrit, validés avant le code",
  "un test de contrat par variante : le champ retiré est absent de la réponse, et non pas null",
  "sans sélection, la réponse actuelle reste identique, vérifiée par un test de non-régression (sauf remplacement)",
  "date-heure du dernier enregistrement au format Instant du socle, ISO 8601 avec fuseau ; null documenté au contrat et testé pour une liste vide",
  "date-heure calculée en base par une seule requête, sans charger les éléments, vérifiée par un compteur de requêtes dans le test",
  "negociation_contenu : 406 pour un type de média non servi",
  "remplacement : version d'API non publiée, vérifiée par la comparaison du contrat avec sa version précédente",
]

[options.backend.representations.parametres]
# Au choix par ticket, gardés dans ticket.toml.
selection = ["parametre_vue", "negociation_contenu", "remplacement"]
exposition_sans_champ = ["base", "meme_uri", "uri_propre"]

[options.backend.representations.notes]
parametre_vue = "Paramètre de requête facultatif (par exemple ?vue=resume) ; sans lui, la réponse actuelle est inchangée."
negociation_contenu = "Type de média dédié dans l'en-tête Accept ; sans lui, la réponse actuelle est inchangée ; 406 pour un type non servi."
remplacement = "La réponse actuelle devient la variante résumée : retrait d'un champ, donc changement cassant (socle, SC1.INV-2), seulement pour une opération dont la version d'API n'est pas publiée."
base = "La variante sans champ n'a pas d'opération à elle : elle sert de base à la variante résumée."
meme_uri = "La variante sans champ se sélectionne aussi à la même URI, par le même mécanisme, avec une valeur de plus."
uri_propre = "La variante sans champ a sa propre opération, ajoutée au contrat (option endpoints)."

[options.frontend.elements_graphiques]
nom = "Éléments graphiques"
slot = "É5"
description = "Composants, mise en page et états visuels (repos, chargement, vide, erreur)."
preuves = [
  "un test de composant par état visuel",
  "contrôle d'accessibilité WCAG 2.2 AA",
]

[options.frontend.fonctionnalites]
nom = "Fonctionnalités"
slot = "É2"
description = "Comportements : déclencheurs, état local en signals, appels d'API, navigation."
preuves = [
  "un test de composant ou de service par comportement",
  "un test de bout en bout du parcours",
]

[options.frontend.analyse_image]
nom = "Analyse d'une image de l'objectif"
applicable_a = ["elements_graphiques", "fonctionnalites"]
formats = ["png"]
extractions = ["structure", "composants", "textes", "etats", "couleurs", "accessibilite"]
sortie = "docs/demandes/{reference}/analyse-image.md"
description = """
Pour toute option front qui désigne une image PNG de l'objectif, l'IA l'analyse
avant la fiche de transformation : inventaire des extractions demandées,
correspondance de chaque élément avec une option du ticket, éléments sans
correspondance posés en questions, écarts avec l'écran actuel si sa capture est
fournie. L'analyse se valide avec la fiche. Tailles et couleurs lues sur une
image sont des estimations, à confirmer avec le système de design.
"""
preuves = [
  "analyse validée par le développeur avec la fiche",
  "capture de l'écran livré comparée à l'image de l'objectif",
]

# ------------------------------------------------------------------------------
# 2. CATALOGUE DES MÉSO-CONTRATS (LES DIFFÉRENTES CATÉGORIES)
#    Pour ajouter une catégorie : un bloc [[meso_contrats]] d'identifiant M05,
#    M06…, dont chaque couche déclare son impact et ses options permises,
#    choisies dans la section 1, et, s'il y a lieu, les possibilités de la
#    section 0 sans lesquelles il ne convient pas (possibilites_requises).
# ------------------------------------------------------------------------------

[[meso_contrats]]
id = "M01"
code = "EVOL_PARADIGME_PULL"
nom = "Transition eager vers lazy (pilotée par l'intention)"
description = "Tickets impliquant une modification verticale complète : schéma (Liquibase, PostgreSQL), puis API (Java), puis IHM (Angular, à la demande)."
complexite_moyenne = "Élevée"

[meso_contrats.empreinte_technique]
persistance = { impact = "requis", technologies = ["Liquibase", "PostgreSQL"], options = ["schema", "crud"] }
backend = { impact = "requis", technologies = ["Java", "API REST"], options = ["endpoints", "fonctionnalites", "regles"] }
frontend = { impact = "requis", technologies = ["Angular"], style = "État et événements", options = ["elements_graphiques", "fonctionnalites"] }


[[meso_contrats]]
id = "M02"
code = "OPTIMISATION_DONNEES"
nom = "Optimisation de requêtage et indexation de la base de données"
description = "Tickets axés sur les performances de stockage, la création d'index ou la restructuration de tables, sans rupture d'API."
complexite_moyenne = "Moyenne"

[meso_contrats.empreinte_technique]
persistance = { impact = "requis", technologies = ["Liquibase", "PostgreSQL"], options = ["schema", "crud"] }
backend = { impact = "optionnel", technologies = ["Java"], options = ["fonctionnalites"] }
frontend = { impact = "aucun", technologies = [], options = [] }


[[meso_contrats]]
id = "M03"
code = "REFONTE_UI_COMPOSANT"
nom = "Évolution ergonomique du front-end"
description = "Tickets modifiant l'expérience utilisateur ou l'état local de l'IHM, sans impact sur le schéma de persistance."
complexite_moyenne = "Faible"

[meso_contrats.empreinte_technique]
persistance = { impact = "aucun", technologies = [], options = [] }
backend = { impact = "aucun", technologies = [], options = [] }
frontend = { impact = "requis", technologies = ["Angular"], style = "Composants et signals", options = ["elements_graphiques", "fonctionnalites"] }



[[meso_contrats]]
id = "M04"
code = "VARIANTE_REPRESENTATION"
nom = "Variante de représentation d'une ressource"
description = "Tickets qui, depuis l'URI d'une opération existante, dérivent de son type de réponse une variante sans un champ liste ou record, et, à la même URI, une variante où ce champ est remplacé par la date-heure de son dernier enregistrement. Le front et la base ne sont touchés que si la demande l'exige."
complexite_moyenne = "Moyenne"
possibilites_requises = ["variante_representation"]

[meso_contrats.empreinte_technique]
persistance = { impact = "optionnel", technologies = ["PostgreSQL", "Liquibase"], options = ["crud", "schema"] }
backend = { impact = "requis", technologies = ["Java", "API REST"], options = ["representations", "endpoints"] }
frontend = { impact = "optionnel", technologies = ["Angular"], style = "Types et appels d'API", options = ["fonctionnalites", "elements_graphiques"] }

# ------------------------------------------------------------------------------
# 3. MÉSO-CONTRATS TRANSVERSES DE LA PLATEFORME
#    Ils ne se choisissent pas : ils s'appliquent d'office à tout ticket qui
#    touche l'une des couches citées.
# ------------------------------------------------------------------------------

[[meso_contrats_transverses]]
id = "T01"
code = "SOCLE_BACK_FRONT"
nom = "Socle back-front"
s_applique_si = ["backend", "frontend"]
exigences = "Contrat OpenAPI, erreurs RFC 9457, formats, pagination, sécurité OAuth 2.1 et OIDC, traçabilité W3C."

[[meso_contrats_transverses]]
id = "T02"
code = "ACCESSIBILITE"
nom = "Accessibilité"
s_applique_si = ["frontend"]
exigences = "RGAA 4.1 et WCAG 2.2 niveau AA."

[[meso_contrats_transverses]]
id = "T03"
code = "MIGRATION_SURE"
nom = "Migration de base sûre"
s_applique_si = ["persistance"]
exigences = "Un changeset par fichier, un rollback par changeset, migration jouée, annulée et rejouée avant livraison."

# ------------------------------------------------------------------------------
# 4. RÈGLES DE VALIDATION D'UN TICKET (docs/demandes/<référence>/ticket.toml)
# ------------------------------------------------------------------------------

[validation]
regles = [
  "le ticket nomme un méso-contrat du catalogue et la version du référentiel qu'il suit",
  "la section demande répond à l'intention et à chaque possibilité du modèle générique, et cite la source de chaque réponse autre qu'inconnu",
  "le méso-contrat respecte la règle de choix du modèle générique, appliquée aux possibilités à oui",
  "aucune possibilité ne reste inconnue si sa réponse pouvait changer le méso-contrat",
  "aucune option n'est choisie tant que le méso-contrat n'est pas confirmé (meso_contrat_confirme)",
  "chaque couche à l'impact requis porte au moins une option choisie",
  "aucune option n'est choisie sur une couche à l'impact aucun",
  "chaque option choisie figure parmi les options permises de sa couche",
  "les opérations CRUD sont prises parmi create, read, update et delete ; delete impose un mode de suppression",
  "la méthode d'un endpoint est prise parmi les méthodes du catalogue",
  "chaque paramètre d'une option choisie prend une valeur de son catalogue (parametres)",
  "le mécanisme de sélection remplacement n'est choisi que pour une opération dont la version d'API n'est pas publiée (version_publiee = false)",
  "analyse_image n'apparaît qu'avec image_objectif, en PNG, et ses extractions sont prises dans le catalogue",
  "les méso-contrats transverses des couches touchées s'appliquent d'office",
]
```

## 7. Exemple d'instance

### 7.1 Ticket fil rouge, M01

`docs/demandes/ABCDE-3512/ticket.toml`, pour le ticket fil rouge du point d'entrée (§ 15, R3, R11 et R16). La section `[ticket.demande]` vient de la qualification, à l'ouverture du ticket ; les options, de l'analyse :

```toml
[ticket]
reference = "ABCDE-3512"
referentiel = "3.2.0"
meso_contrat = "M01"
meso_contrat_confirme = true
titre = "Charger les données au clic plutôt qu'à l'ouverture de l'écran"

# Demande : la combinaison des possibilités de modification que le ticket implique,
# établie à son ouverture (qualification, D11). Les possibilités que le ticket
# n'évoque pas restent inconnues : aucune ne changerait le méso-contrat ni ses options.
[ticket.demande]
intention = { reponse = "Charger les données au clic plutôt qu'à l'ouverture de l'écran", source = "ticket : titre" }
maquette = { reponse = "oui", precision = "maquettes/ecran-cible.png et maquettes/parcours-cible.png", source = "ticket : pièces jointes" }
table = { reponse = "inconnu" }
colonne = { reponse = "oui", precision = "mode_chargement, AUTO ou CLIC, dans la table donnee", source = "ticket : description" }
index = { reponse = "inconnu" }
contrainte = { reponse = "inconnu" }
lecture = { reponse = "oui", precision = "données paginées", source = "ticket : critères d'acceptation" }
ecriture = { reponse = "inconnu" }
endpoint_nouveau = { reponse = "non", source = "développeur : question 1" }
endpoint_modifie = { reponse = "oui", precision = "GET /api/v1/donnees, paginé", source = "développeur : question 1" }
variante_representation = { reponse = "non", precision = "réponse paginée, sans variante", source = "développeur : question 1" }
regle = { reponse = "oui", precision = "seul un utilisateur habilité obtient les données", source = "ticket : critères d'acceptation" }
service = { reponse = "oui", precision = "fournir les données à la demande", source = "ticket : description" }
ecran_nouveau = { reponse = "inconnu" }
ecran_modifie = { reponse = "oui", precision = "bouton « Charger les données »", source = "ticket : critères d'acceptation" }
formulaire = { reponse = "inconnu" }
comportement = { reponse = "oui", precision = "chargement au clic, et non dans ngOnInit", source = "ticket : titre" }
navigation = { reponse = "inconnu" }

[[ticket.persistance.schema]]
changement = "colonne"
table = "donnee"
description = "Colonne mode_chargement, AUTO ou CLIC, avec une valeur par défaut pour les lignes existantes."

[[ticket.persistance.crud]]
entite = "Donnee"
table = "donnee"
operations = ["read"]

[[ticket.backend.endpoints]]
methode = "GET"
chemin = "/api/v1/donnees"
reponse = "page de DonneeDto"
erreurs = [400, 401, 403]

[[ticket.backend.fonctionnalites]]
nom = "Fournir les données à la demande, paginées"

[[ticket.backend.regles]]
id = "ABCDE-3512-R1"
enonce = "Seul un utilisateur habilité obtient les données ; sinon 403."

[[ticket.frontend.elements_graphiques]]
nom = "Bouton « Charger les données »"
etats = ["repos", "chargement", "erreur", "chargé"]
image_objectif = "docs/demandes/ABCDE-3512/maquettes/ecran-cible.png"
analyse_image = ["structure", "composants", "textes", "etats", "accessibilite"]

[[ticket.frontend.fonctionnalites]]
nom = "Charger au clic, et non dans ngOnInit"
declencheur = "click"
image_objectif = "docs/demandes/ABCDE-3512/maquettes/parcours-cible.png"
image_actuelle = "docs/demandes/ABCDE-3512/maquettes/ecran-actuel.png"
analyse_image = ["structure", "etats"]
```

### 7.2 Variante de représentation, M04

`docs/demandes/ABCDE-3620/ticket.toml`, pour le scénario R19. Le ticket : « Trouver l'endpoint de l'URI `/api/v1/commandes/{id}` avec son type de donnée ; sa composition contient le champ `lignes`, une liste. Réaliser une variante de ce type sans ce champ. Réaliser une variante à la même URI où ce champ ne sera pas intégré : les informations le concernant seront uniquement la date et l'heure du dernier enregistrement. » Le développeur a répondu aux quatre questions de la qualification : sélection par paramètre de vue, variante sans champ sans opération à elle, date-heure déjà stockée sur les lignes, front non concerné. Le repérage depuis l'URI vient de l'analyse :

```toml
[ticket]
reference = "ABCDE-3620"
referentiel = "3.2.0"
meso_contrat = "M04"
meso_contrat_confirme = true
titre = "Commande : variante sans les lignes, et résumé à la même URI avec la date-heure de la dernière ligne enregistrée"

[ticket.demande]
intention = { reponse = "Dériver de la réponse de GET /api/v1/commandes/{id} une variante sans les lignes, et, à la même URI, une variante où les lignes sont remplacées par la date-heure de la dernière ligne enregistrée", source = "ticket : description" }
maquette = { reponse = "non", source = "ticket : pièces jointes" }
table = { reponse = "inconnu" }
colonne = { reponse = "non", precision = "ligne_commande.enregistree_le existe déjà", source = "développeur : question 3" }
index = { reponse = "inconnu" }
contrainte = { reponse = "inconnu" }
lecture = { reponse = "oui", precision = "date-heure maximale des lignes d'une commande, sans charger les lignes", source = "ticket : description" }
ecriture = { reponse = "inconnu" }
endpoint_nouveau = { reponse = "non", source = "développeur : question 2" }
endpoint_modifie = { reponse = "oui", precision = "GET /api/v1/commandes/{id}, paramètre vue facultatif", source = "développeur : question 1" }
variante_representation = { reponse = "oui", precision = "champ lignes, une liste", source = "ticket : description" }
regle = { reponse = "inconnu" }
service = { reponse = "inconnu" }
ecran_nouveau = { reponse = "non", source = "développeur : question 4" }
ecran_modifie = { reponse = "non", source = "développeur : question 4" }
formulaire = { reponse = "inconnu" }
comportement = { reponse = "non", source = "développeur : question 4" }
navigation = { reponse = "inconnu" }

[[ticket.persistance.crud]]
entite = "LigneCommande"
table = "ligne_commande"
operations = ["read"]
lecture = "max(enregistree_le) des lignes d'une commande, par une requête d'agrégat"

[[ticket.backend.representations]]
operation = "GET /api/v1/commandes/{id}"
version_publiee = true
controleur = "CommandeController#lire"
type_reponse = "CommandeDto"
champ = { nom = "lignes", nature = "liste", type = "List<LigneCommandeDto>" }
entite = "LigneCommande"
colonne_date = "ligne_commande.enregistree_le"
selection = "parametre_vue"
exposition_sans_champ = "base"
variante_sans_champ = { type = "CommandeSansLignesDto" }
variante_resume = { type = "CommandeResumeDto", vue = "resume", champ_date = "lignesDernierEnregistrement", vide = "null" }

[[ticket.backend.endpoints]]
methode = "GET"
chemin = "/api/v1/commandes/{id}"
parametres = ["vue, facultatif : resume"]
reponse = "CommandeDto sans paramètre, inchangée ; CommandeResumeDto avec vue=resume"
erreurs = [400, 401, 403, 404]
```

## 8. Contrôles

- La section `[validation]` du référentiel énumère les règles d'un ticket, celles de la demande remplie comprises ; l'IA les vérifie avant de présenter `ticket.toml` (D10.INV-2).
- Scénarios R11 à R14 du point d'entrée ; R16 à R18 pour le modèle générique de la demande ; R19 et R20 pour M04 et l'option `representations`.
- À la publication : le modèle se lit en TOML, et les deux exemples d'instance respectent toutes ses règles de validation (point d'entrée, section 16).
<<<FIN modules/referentiel/SKILL.md>>>

<<<FICHIER modules/qualification/SKILL.md>>>
---
name: qualification
description: Dimension D11, la qualification de chaque ticket à son ouverture, avant tout le reste. La demande du ticket est rangée dans le modèle générique de la demande du référentiel, une combinaison de possibilités de modification de l'application, couche par couche (PostgreSQL, Java, Angular), établies à l'analyse de l'application ; les questions que le ticket laisse ouvertes sont posées au développeur ; le méso-contrat que désigne la combinaison est proposé, puis confirmé par le développeur avant toute analyse du code et toute fiche. À lire à l'installation et à l'ouverture de chaque ticket.
dimensions: [D11]
status: active
---

# Module `qualification` (D11)

Statut : `active`, depuis la version 3.3.0.

## 1. Rôle

À l'ouverture d'un ticket, la première chose à faire est de trouver son méso-contrat. L'IA part du seul contenu du ticket, sans lire encore le code ni l'architecture :

1. elle range la demande du ticket dans le modèle générique de la demande ;
2. elle pose au développeur les questions que le ticket laisse ouvertes ;
3. elle propose le méso-contrat que désigne la demande.

Le développeur confirme ce méso-contrat. L'analyse et la fiche de transformation viennent ensuite (§ 3 du point d'entrée) : un ticket mal classé à l'ouverture fausserait les options, les preuves et les tests déduits.

## 2. Le modèle générique de la demande

Le modèle est une **combinaison de possibilités** : les modifications qu'un ticket peut demander à l'application, couche par couche. Il se trouve dans la section 0 du référentiel du projet, `[modele_demande]` (module `referentiel`, § 6). Chaque possibilité nomme sa couche, la modification, l'option du référentiel qu'elle engage, et ses repères dans l'application. Pour une application PostgreSQL, Java et Angular, le modèle en propose seize :

| Couche | Possibilité | Modification | Option |
|---|---|---|---|
| persistance, PostgreSQL | `table` | créer une table | `schema` |
| persistance, PostgreSQL | `colonne` | ajouter ou modifier une colonne | `schema` |
| persistance, PostgreSQL | `index` | ajouter ou modifier un index, pour la performance d'une requête | `schema` |
| persistance, PostgreSQL | `contrainte` | ajouter ou modifier une contrainte : clé, unicité, NOT NULL | `schema` |
| persistance, PostgreSQL | `lecture` | lire les données d'une entité : filtre, tri, pagination, projection ou agrégat | `crud` |
| persistance, PostgreSQL | `ecriture` | créer, modifier ou supprimer les données d'une entité | `crud` |
| backend, Java | `endpoint_nouveau` | ajouter un endpoint | `endpoints` |
| backend, Java | `endpoint_modifie` | modifier le contrat d'un endpoint : paramètres, réponse, erreurs | `endpoints` |
| backend, Java | `variante_representation` | ajouter une variante de représentation d'une opération existante : un champ liste ou record retiré, ou remplacé par la date-heure de son dernier enregistrement | `representations` |
| backend, Java | `regle` | ajouter ou modifier une règle métier ou une habilitation | `regles` |
| backend, Java | `service` | ajouter ou modifier un cas d'usage côté serveur | `fonctionnalites` |
| frontend, Angular | `ecran_nouveau` | créer un écran ou un composant | `elements_graphiques` |
| frontend, Angular | `ecran_modifie` | modifier un composant : mise en page, libellés, états visuels | `elements_graphiques` |
| frontend, Angular | `formulaire` | ajouter ou modifier un formulaire ou ses validations | `fonctionnalites` |
| frontend, Angular | `comportement` | modifier un comportement : déclencheur, état local, appel d'API | `fonctionnalites` |
| frontend, Angular | `navigation` | ajouter ou modifier une navigation ou une route | `fonctionnalites` |

Deux entrées complètent la demande : l'`intention`, le changement attendu en une phrase, et la `maquette`, une image PNG de l'objectif, qui signale le frontend et s'analyse avec l'option qu'elle illustre.

La demande d'un ticket est la combinaison de ses possibilités à `oui`. La **règle de choix** retient les méso-contrats dont l'empreinte convient à cette combinaison :

- toute couche d'une possibilité à `oui` y a l'impact `requis` ou `optionnel` ;
- toute couche à l'impact `requis` porte au moins une possibilité à `oui` ;
- l'option de chaque possibilité à `oui` figure parmi les options permises de sa couche ;
- toute possibilité que le méso-contrat déclare requise (`possibilites_requises`) est à `oui`. M04 requiert `variante_representation` : sans elle, un ticket qui modifie un endpoint ne lui est pas rattaché, même si son empreinte le permettrait.

Si un seul méso-contrat convient, il est proposé. Si plusieurs conviennent, une question les départage. Si aucun ne convient, le ticket est signalé, sans catégorie inventée (D10.INV-1).

**Des possibilités établies à l'analyse de l'application.** Les seize possibilités valent pour la pile ; celles du projet se fondent sur l'analyse de son application. À l'installation (§ 11.3 du point d'entrée), l'IA confronte le modèle à cette analyse : la cartographie produite par le skill `analyse-projet`, s'il a été appliqué, ou la lecture de la structure du projet (changelogs Liquibase, entités, contrôleurs, services, composants, routes). Elle propose au développeur :

- les possibilités qui s'appliquent, avec leurs repères dans l'application (dossiers, conventions de nommage) ;
- celles qui ne s'appliquent pas, à retirer ;
- celles qui manquent, propres à l'application : un batch, un message, un export, un rapport. Chacune est rattachée à une couche et à une option du référentiel, ou à une option nouvelle à créer.

Le développeur les écrit dans son référentiel ; l'IA ne le modifie pas (D11.INV-5, D10.INV-5). Si le référentiel du projet n'a pas encore de section `[modele_demande]`, parce qu'il a été installé avant la version 3.3.0, l'IA prend celle du modèle du skill et le signale au développeur dans la qualification. S'il n'a pas M04, parce qu'il a été installé avant la version 3.4.0, un ticket de variante de représentation se signale sans catégorie, et l'IA indique au développeur les blocs à copier du modèle (module `referentiel`, § 6).

**Paramètres d'option au choix par ticket.** Certaines options déclarent des paramètres, chacun avec ses valeurs (`parametres` dans le référentiel). Quand le ticket ne dit pas la valeur d'un paramètre, et qu'elle changerait les possibilités à `oui` ou les preuves, la question se pose à la qualification avec les autres. C'est le cas de l'option `representations` : le mécanisme de sélection à la même URI (`parametre_vue`, `negociation_contenu`, `remplacement`) et l'exposition de la variante sans champ (`base`, `meme_uri`, `uri_propre`, qui fait passer `endpoint_nouveau` à `oui`).

## 3. À l'ouverture de chaque ticket

1. Lire le ticket (§ 11.1 du point d'entrée) : titre, description, critères d'acceptation, commentaires, pièces jointes.
2. Lire le référentiel du projet et noter sa version (`meta.version`).
3. Répondre, pour l'intention, la maquette et chaque possibilité, à partir du contenu du ticket : `oui`, `non` ou `inconnu`, une précision au besoin, et la source (titre, description, critère, commentaire, pièce jointe). Ce que le ticket ne dit pas reste `inconnu` ; rien ne se remplit par supposition (D11.INV-2).
4. Appliquer la règle de choix à la combinaison des possibilités à `oui`. Une possibilité `inconnu` dont la réponse changerait le méso-contrat ou ses options devient une question, de même qu'un choix entre plusieurs méso-contrats (D11.INV-2). Les autres restent `inconnu`, sans question.
5. Présenter la qualification au développeur, en un seul message (§ 4), puis attendre sa réponse : l'IA ne lit pas le code, ne cartographie pas l'impact et ne rédige pas la fiche avant la confirmation (D11.INV-1, D11.INV-3).
6. À la réponse, reporter chaque réponse dans la demande, avec pour source « développeur » et le numéro de la question ; réappliquer la règle de choix ; si le méso-contrat change, le présenter de nouveau pour confirmation.
7. Écrire `docs/demandes/<CLÉ>/ticket.toml` : la version du référentiel, la section `[ticket.demande]` avec chaque réponse et sa source, le méso-contrat et `meso_contrat_confirme = true` (D11.INV-4). Les options s'y ajoutent à l'analyse (module `referentiel`, § 3).

Si l'analyse montre ensuite que la demande sort de l'empreinte du méso-contrat confirmé, l'IA revient à cette étape : elle complète la demande, propose un autre méso-contrat et le fait confirmer, sans en changer d'elle-même (D11.INV-4).

## 4. Présenter la qualification

Un seul message, qui se lit sans le ticket. Les possibilités à `non`, et celles à `inconnu` sans effet sur le choix, n'y figurent pas :

```markdown
## Qualification de ABCDE-3512, référentiel 3.1.0

**Intention** : charger les données au clic plutôt qu'à l'ouverture de l'écran (titre)

**Demande**, d'après le ticket :
- PostgreSQL : colonne mode_chargement (description) ; lecture paginée (critères)
- Java : règle d'habilitation (critères) ; cas d'usage, fournir les données à la demande (description)
- Angular : bouton « Charger les données » (critères) ; chargement au clic, plus dans ngOnInit (titre) ; maquettes jointes
- endpoint : inconnu

**Méso-contrat proposé** : M01, EVOL_PARADIGME_PULL
- la demande touche PostgreSQL, Java et Angular ; M01 les exige toutes les trois
- M02 écarté : son frontend est à l'impact aucun ; M03 écarté : sa persistance est à l'impact aucun

**Question**
1. Faut-il ajouter un endpoint, ou modifier le contrat d'un endpoint existant ? (endpoint_nouveau, endpoint_modifie : décide de l'option endpoints)

Confirmez-vous M01 ? Je ne fais rien d'autre avant votre réponse.
```

Les questions sont numérotées, chacune avec les possibilités qu'elle règle et ce qu'elle décide. S'il n'y a aucune question, le message demande seulement la confirmation.

## 5. Méso-contrat imposé

Avec la commande `/c7e ABCDE-3512 M01` (§ 11.4 du point d'entrée), le développeur impose le méso-contrat. La qualification a lieu quand même : si la combinaison demandée s'accorde avec M01 par la règle de choix, l'imposition vaut confirmation, et les questions qui restent ne portent que sur les options. Sinon, l'IA montre l'écart et attend la décision du développeur.

## 6. Exemples

**Ticket fil rouge, `ABCDE-3512` (scénario R16).** Le ticket demande de charger les données au clic plutôt qu'à l'ouverture de l'écran. Il implique `colonne`, `lecture`, `regle`, `service`, `ecran_modifie`, `comportement` et une maquette : la combinaison touche les trois couches, et seul M01 convient. Le ticket ne dit pas si l'endpoint est ajouté ou modifié ; c'est la seule question, parce qu'elle décide de l'option `endpoints`. Les possibilités qu'il n'évoque pas, comme `table` ou `navigation`, restent `inconnu` sans question : aucune ne changerait le méso-contrat ni ses options. Le développeur répond « modifier `GET /api/v1/donnees`, pour la pagination », et confirme M01. `ticket.toml` reçoit la demande : module `referentiel`, § 7.

**Ticket ambigu (scénario R17).** « Afficher la date de dernière mise à jour sur l'écran de détail. » `ecran_modifie` est à `oui` ; `colonne`, `lecture` et `endpoint_modifie` restent `inconnu`. Si la date est déjà stockée et renvoyée par l'API, la combinaison ne touche qu'Angular, et M03 convient. Sinon, elle touche aussi PostgreSQL et Java, et M01 convient. L'IA pose donc une question : « La date de dernière mise à jour est-elle déjà stockée et renvoyée par l'API de détail ? » Elle ne propose de méso-contrat qu'après la réponse. M04 n'est pas en jeu : la demande n'a pas `variante_representation`, qu'il requiert.

**Variante de représentation, `ABCDE-3620` (scénarios R19 et R20).** « Trouver l'endpoint de l'URI `/api/v1/commandes/{id}` avec son type de donnée ; sa composition contient le champ `lignes`, une liste. Réaliser une variante de ce type sans ce champ. Réaliser une variante à la même URI où ce champ ne sera pas intégré : les informations le concernant seront uniquement la date et l'heure du dernier enregistrement. » `variante_representation`, `endpoint_modifie` et `lecture` (un agrégat, la date-heure maximale des lignes) sont à `oui`. Seul M04 convient : M01 ne permet pas l'option `representations` et exige le frontend, M02 et M03 n'ont pas cette option. Le message de qualification pose quatre questions :

```markdown
**Méso-contrat proposé** : M04, VARIANTE_REPRESENTATION
- la demande dérive une variante du type de réponse de GET /api/v1/commandes/{id} ; M04 la requiert
- M01 écarté : il ne permet pas l'option representations et exige le frontend ; M02 et M03 écartés : ni l'un ni l'autre ne la permet

**Questions**
1. À la même URI, comment le client choisit-il la variante résumée : paramètre de vue (?vue=resume), négociation de contenu (Accept), ou remplacement de la réponse actuelle ? (paramètre selection ; le remplacement retire un champ, il n'est possible que si la version d'API n'est pas publiée)
2. La variante sans les lignes a-t-elle une opération à elle : non, elle sert de base au résumé ; oui, à la même URI ; oui, à sa propre URI ? (paramètre exposition_sans_champ ; endpoint_nouveau)
3. Les lignes portent-elles déjà leur date-heure d'enregistrement ? (colonne : décide de l'option schema)
4. Le front Angular consomme-t-il la variante résumée ? (ecran_modifie, comportement : décide des options frontend)

Confirmez-vous M04 ? Je ne fais rien d'autre avant votre réponse.
```

Le développeur répond : paramètre de vue, variante sans champ en base du résumé, date-heure déjà stockée, front non concerné ; il confirme M04. À l'analyse, l'IA repère depuis l'URI l'opération, son contrôleur, `CommandeDto`, le champ `lignes` et la colonne `ligne_commande.enregistree_le`. `ticket.toml` : module `referentiel`, § 7.2. Si le développeur avait choisi le remplacement alors que `/api/v1` est publiée, l'IA l'aurait refusé en citant le socle (SC1.INV-2) et proposé le paramètre de vue ou la négociation de contenu (R20).

## 7. Contrôles

- Scénarios R16 à R18 du point d'entrée, R19 et R20 pour M04, et R13 pour le retour à la qualification.
- Les règles de validation du référentiel vérifient la demande remplie : intention et possibilités répondues et sourcées, méso-contrat conforme à la règle de choix, aucune possibilité `inconnu` qui changerait le méso-contrat, aucune option avant la confirmation.
- À l'installation, la liste des possibilités du projet est validée par le développeur, à partir de l'analyse de l'application.
<<<FIN modules/qualification/SKILL.md>>>

---

# Table d'intégrité (sha256)

Format compatible `sha256sum -c`, à exécuter depuis le dossier où les fichiers ont été matérialisés.

    c39959a852458173758a83444f316b2944e3a5a7b65e1f82531bc054733f7951  manifest.json
    81ea6bc93916962fdaeea2380591249e6a5ff575f0bb6e87f4307d33905d2bd1  SKILL.md
    5ac479aa32da55649f258d9f571fe87c157b86d107ffa80babf731ae3f7ed52c  socle/SKILL.md
    4bb52253c4504f4a804460442b1711a9caab8e364528171f2afb9ba7d5acfccf  references/java.md
    28e0a697773aaf205f024e3fa0a0d99c43bbaf86fb7a56c954c9964e67d22d16  references/angular.md
    a878fc5c4181781e440bfc4de0e8c9f03cd346a37e6e0cd289dc4660c9f022a0  meso-contrats.md
    1c8197828deac91e92d64391d86598938210add220f1e025e9ad6a5539dac441  modules/mesure/SKILL.md
    55a2c86f9ae7523e4673b94d4a0684cc43f8c3ff3a385742f3d5cc085eaa7142  modules/referentiel/SKILL.md
    b0bb401113b2abbbee92c048748afa2f7da5567963f82f80fb8ec9d81b3d7eb9  modules/qualification/SKILL.md
