# Explication de l'hôte d'IA : skill explication-hote-ia 1.1.0, transmission texte

Ce texte contient à la fois la consigne de travail et le skill complet. Il n'y a aucune pièce jointe. Le skill est découpé en fichiers, chacun délimité ainsi :

    <<<FICHIER chemin/relatif>>>
    ...contenu exact du fichier...
    <<<FIN chemin/relatif>>>

---

À partir de maintenant, tu installes le skill explication-hote-ia décrit par ce texte, tu le fais fonctionner, puis tu peux expliquer au développeur comment fonctionne l'outil d'IA qui t'exécute. Le skill fait foi. Si tu relèves une ambiguïté ou une contradiction dans le skill, signale-la au développeur. Ne corrige pas le skill toi-même, ni son script.

## Étape 0 : matérialiser le skill

Si le développeur dispose aussi du dossier du skill, ou d'un fichier `.skill`, et que ton hôte est Gemini CLI, l'hôte fait cette étape sans IA : `gemini skills install <dossier ou fichier .skill>` installe le skill dans `~/.gemini/skills/explication-hote-ia/`, pour tous les projets (module `diffusion`, § 3). Passe alors directement à l'étape 1, dans ce dossier. Rien d'autre n'est nécessaire : le skill se suffit, sans dépôt ni outil extérieur.

Sinon :

1. Crée le dossier `.skills/explication-hote-ia/` à la racine du projet, ou à l'emplacement que le développeur indique. Dans un dépôt git, ajoute `/.skills/` à `.git/info/exclude` s'il n'y est pas : le skill ne doit pas apparaître dans `git status`. Si ton hôte est Gemini CLI, ajoute aussi à `.geminiignore` les lignes `!/.skills/` et `!/.skills/explication-hote-ia/`, sans quoi ses outils de lecture refuseraient les modules du skill.
2. Pour chaque bloc `<<<FICHIER chemin>>>` … `<<<FIN chemin>>>`, crée le fichier `chemin` dans ce dossier, avec le contenu exact compris entre les deux lignes délimitrices. Ces deux lignes ne font pas partie du fichier. Ne reformule rien, ne traduis rien, ne complète rien.
3. Si tu disposes d'un shell, vérifie chaque fichier avec `sha256sum -c` contre la table d'intégrité en fin de texte ; sous Windows, Git Bash fournit `sha256sum`, et `certutil -hashfile <fichier> SHA256` donne l'empreinte d'un fichier depuis CMD. Signale tout écart avant de continuer.

Parmi ces fichiers, `MODE-EMPLOI.md` s'adresse au développeur : il y trouve les mêmes étapes et les mêmes commandes. Dans Gemini CLI, un skill matérialisé ainsi ne devient un skill de l'hôte, découvert dans toutes ses sessions, qu'une fois installé ; le module `diffusion`, § 6, dit comment, après l'étape 2.

## Étape 1 : lecture

Lis `SKILL.md`, `manifest.json`, puis les modules actifs dans l'ordre indiqué par `SKILL.md`, section 1. Ne lis `modules/autres-hotes/SKILL.md` et `modules/comparaison/SKILL.md` que pour comprendre les points d'extension : ces dimensions sont réservées.

## Étape 2 : fichiers exécutables et recette

1. Depuis le dossier du skill, écris `scripts/instantane-hote.mjs`, `tests/instantane-hote.test.mjs`, `agent/explicateur-hote.md` et les trois commandes de `commandes/hote/` à partir des blocs annotés des modules, par la commande d'extraction du module `execution`, § 8. Elle se colle telle quelle dans bash, CMD ou PowerShell. Ne recopie pas les fichiers à la main.
2. La commande vérifie elle-même leurs empreintes : elle écrit `conforme` pour chaque fichier, ou `ECART`, et sort alors avec le code 1. Un écart arrête l'installation.
3. Vérifie la version de Node (20 ou plus récent), puis lance la recette : `node --test tests/instantane-hote.test.mjs`. Attendu : 28 tests réussis sous Linux et WSL2 ; 27 réussis et 1 sauté sous Windows et macOS. Rapporte au développeur le bilan ; un échec arrête l'installation et se rapporte tel quel, sans modifier le script.

## Étape 3 : le sous-agent et les commandes

Propose au développeur d'installer le sous-agent `agent/explicateur-hote.md` et les commandes `/hote:explique`, `/hote:carte` et `/hote:pourquoi` (module `agent`, § 2). N'écris dans ses dossiers de configuration qu'avec son accord ; dans la copie installée du sous-agent, remplace `<DOSSIER_DU_SKILL>` par le chemin absolu du dossier du skill. Dans Gemini CLI, la commande du module `diffusion`, § 4, lancée depuis le dossier du skill, fait les deux ; celle du § 5 les retire.

## Étape 4 : premier instantané

1. Lance `hote`, puis `tout --format texte`, depuis la racine du projet, et présente au développeur la carte de l'installation, chaque point avec son étiquette de provenance (module `provenance`). Relaie tout avertissement.
2. Rejoue avec lui les scénarios A1 à A12 du module `agent`.

## Règles qui ne se négocient pas

- Le script ne fait que lire, et tu ne modifies rien pendant que tu expliques : une modification se décrit et ne s'applique que sur demande explicite du développeur.
- Chaque affirmation sur l'hôte porte son étiquette et sa source ; rien sur toi-même d'après ta propre impression, ni ton modèle, ni ta version, ni tes limites.
- La documentation qui fait foi est celle de la version installée de l'hôte ; un repère d'une autre version se signale « à revérifier ».
- Aucune valeur secrète n'est recopiée, ni dans une réponse, ni dans un fichier.
- Gemini CLI est le seul hôte que tu nommes ; un autre se décrit par ce qui s'en observe.
- Le skill se suffit : n'ajoute aucune étape qui demande un dépôt, un outil ou un fichier extérieur au dossier du skill, ni le réseau.
- N'applique aucune dimension au statut `reserved`.

Commence par l'étape 0, puis l'étape 1, puis l'étape 2.

---

# Skill

<<<FICHIER manifest.json>>>
{
  "name": "explication-hote-ia",
  "version": "1.1.0",
  "specSchema": 1,
  "language": "fr",
  "description": "Agent qui explique le fonctionnement de l'outil d'IA qui l'exécute, Gemini CLI ou un hôte non reconnu décrit sans être nommé, d'abord pour les développeurs qui hésitent à s'en servir faute d'en voir le fonctionnement : parcours découverte qui ouvre la boîte noire, en langage simple ; boucle d'un tour, assemblage du contexte, outils et politique, confiance, composants, mémoire, modèle, ce qui sort du poste, angles morts ; carte de l'installation et diagnostic ; chaque affirmation étiquetée par sa provenance ; script Node en lecture seule qui ne rend aucun secret ; se diffuse seul, avec son mode d'emploi, installé par Gemini CLI depuis son dossier ou un fichier .skill.",
  "entry": "SKILL.md",
  "modes": ["expliquer", "carte", "pourquoi"],
  "targets": {
    "node": ">=20",
    "hote": "Gemini CLI, repères vérifiés sur la version 0.67.0 ; tout autre hôte décrit par ce qui s'en observe",
    "os": "Linux, WSL2, macOS et Windows natif ; recette en CI sur ubuntu-latest et windows-latest"
  },
  "modules": [
    { "id": "provenance", "path": "modules/provenance/SKILL.md", "dimensions": ["D6"], "status": "active" },
    { "id": "execution", "path": "modules/execution/SKILL.md", "dimensions": ["D1"], "status": "active" },
    { "id": "hote", "path": "modules/hote/SKILL.md", "dimensions": ["D2"], "status": "active" },
    { "id": "configuration", "path": "modules/configuration/SKILL.md", "dimensions": ["D3"], "status": "active" },
    { "id": "contexte", "path": "modules/contexte/SKILL.md", "dimensions": ["D5"], "status": "active" },
    { "id": "composants", "path": "modules/composants/SKILL.md", "dimensions": ["D4"], "status": "active" },
    { "id": "secrets", "path": "modules/secrets/SKILL.md", "dimensions": ["D8"], "status": "active" },
    { "id": "modele-hote", "path": "modules/modele-hote/SKILL.md", "dimensions": ["D9"], "status": "active" },
    { "id": "diagnostic", "path": "modules/diagnostic/SKILL.md", "dimensions": ["D9"], "status": "active" },
    { "id": "agent", "path": "modules/agent/SKILL.md", "dimensions": ["D7"], "status": "active" },
    { "id": "recette", "path": "modules/recette/SKILL.md", "dimensions": ["D1", "D2", "D3", "D4", "D5", "D8"], "status": "active" },
    { "id": "diffusion", "path": "modules/diffusion/SKILL.md", "dimensions": ["D12"], "status": "active" },
    { "id": "mode-emploi", "path": "MODE-EMPLOI.md", "dimensions": ["D12"], "status": "active" },
    { "id": "autres-hotes", "path": "modules/autres-hotes/SKILL.md", "dimensions": ["D10"], "status": "reserved" },
    { "id": "comparaison", "path": "modules/comparaison/SKILL.md", "dimensions": ["D11"], "status": "reserved" }
  ],
  "extensionPoints": ["E1", "E2"],
  "previousVersions": [
    { "version": "1.0.0", "file": "archives/SKILL-v1.0.0.md" },
    { "version": "1.0.1", "file": "archives/SKILL-v1.0.1.md" },
    { "version": "1.0.2", "file": "archives/SKILL-v1.0.2.md" }
  ]
}
<<<FIN manifest.json>>>

<<<FICHIER SKILL.md>>>
---
name: explication-hote-ia
description: Explique le fonctionnement de l'outil d'IA qui exécute l'agent (Gemini CLI, ou un hôte non reconnu décrit sans lui prêter de nom), à partir de ce qui s'observe dans cette installation et de la documentation de sa version exacte. Pour les développeurs qui découvrent l'IA ou hésitent à s'en servir faute d'en voir le fonctionnement, un parcours découverte ouvre la boîte noire en langage simple, chaque étape montrée sur le poste. Boucle d'un tour, ce que reçoit le modèle, outils et confirmations, confiance du dossier, composants, mémoire, modèle, ce qui sort du poste, angles morts ; carte de l'installation et diagnostic d'un comportement. Chaque affirmation porte sa provenance. Script Node en lecture seule, sans dépendance, qui ne rend aucun secret. Se diffuse seul, avec son mode d'emploi, et s'installe par Gemini CLI depuis son dossier ou un fichier .skill.
version: 1.1.0
---

# Explication de l'hôte d'IA, version 1.1.0

Ce document est le point d'entrée du skill. Le skill fait d'un agent l'explicateur de l'outil d'IA qui l'exécute : il dit comment cet hôte fonctionne, en général et dans cette installation, sans rien affirmer qu'il ne puisse rattacher à une source. Il s'adresse d'abord aux développeurs qui hésitent à se servir de l'IA faute d'en connaître le fonctionnement : son parcours découverte ouvre la boîte noire, en langage simple, chaque étape montrée sur leur poste, sans chercher à les convaincre. Gemini CLI est l'hôte reconnu : ses mécanismes sont décrits par des repères vérifiés sur sa version 0.67.0, à confronter à la documentation de la version installée. Tout autre hôte est décrit par ce qui s'en observe, sans lui prêter de nom ni de configuration. Un script Node en lecture seule, `scripts/instantane-hote.mjs`, fait les observations sur le disque ; l'agent `explicateur-hote` et trois commandes de Gemini CLI le mettent en œuvre. Les règles détaillées sont dans `modules/`. Le skill se diffuse seul : son dossier, ou un fichier `.skill`, s'installe par Gemini CLI, et son mode d'emploi, `MODE-EMPLOI.md`, voyage avec lui (module `diffusion`).

## 1. Ordre de lecture

1. Ce document, en entier.
2. `manifest.json` : modules, version de Node visée, plateformes.
3. Les modules actifs, dans cet ordre : `provenance`, `execution`, `hote`, `configuration`, `contexte`, `composants`, `secrets`, `modele-hote`, `diagnostic`, `agent`, `recette`, `diffusion`.
4. `MODE-EMPLOI.md` : le mode d'emploi du développeur, module de D12 ; il ne fixe aucune règle, il donne au développeur les étapes et les commandes des modules. À lire avant de guider une installation, une mise à jour ou un retrait.
5. `modules/autres-hotes/SKILL.md` et `modules/comparaison/SKILL.md` : seulement pour comprendre les points d'extension. Ne pas les appliquer en 1.x.

## 2. Ce que fait le skill

Trois modes, que l'agent choisit d'après la demande du développeur, ou que les commandes de Gemini CLI imposent :

| Mode | Demande type | Ce que l'agent rend | Commande |
|---|---|---|---|
| expliquer | « comment tu fonctionnes ? », « que fais-tu de mon code ? », « que reçoit le modèle à chaque tour ? » | sans question, le parcours découverte du module `modele-hote`, § 11 : sept questions d'un développeur qui découvre l'outil, chacune répondue simplement, montrée sur cette installation, avec ce qu'il garde en main ; avec une question, l'explication du mécanisme demandé, appliquée à cette installation | `/hote:explique [question]` |
| carte | « qu'est-ce qui est actif ici ? » | la carte de l'installation : réglages et leur couche, confiance, contextes, composants, avec leur provenance | `/hote:carte` |
| pourquoi | « pourquoi ce skill n'apparaît pas ? », « pourquoi ce GEMINI.md n'est pas suivi ? » | un diagnostic : hypothèses de la table du module `diagnostic`, chacune confirmée ou écartée par une observation nommée | `/hote:pourquoi <comportement>` |

Le script fait les observations ; il ne fait que lire (D1.INV-1) :

| Commande | Ce qu'elle observe | Module |
|---|---|---|
| `hote` | qui l'exécute : famille de l'hôte et nature de la preuve, paquet, version, documentation embarquée, options de lancement, plateforme | `hote` |
| `config` | couches de réglages, valeur effective et couche de chaque réglage observé, confiance du dossier, fichier `.env`, variables | `configuration` |
| `contexte` | fichiers de contexte par palier, imports, mémoire privée du projet, trace de la dernière session, prompt système exporté | `contexte` |
| `composants` | skills, sous-agents, commandes, extensions, serveurs MCP, hooks, politiques, fichiers d'exclusion | `composants` |
| `doc [chemin]` | documentation embarquée dans le paquet installé : liste, ou un document | `hote` |
| `tout` | `hote`, `config`, `contexte` et `composants` ensemble | `execution` |

```mermaid
flowchart LR
  DEV(["Développeur"]) -->|"question, /hote:…"| AG["Agent<br/>skill activé ou sous-agent"]
  AG -->|"lance"| SC["instantane-hote.mjs<br/>lecture seule"]
  SC -->|"lit"| DISK[("Disque : réglages, contextes,<br/>composants, sessions, paquet")]
  SC -->|"lit"| DOC[("Documentation embarquée<br/>de la version installée")]
  AG -.->|"lit en lui-même"| SELF["Son propre contexte<br/>outils, prompt, messages de l'hôte"]
  AG -->|"explication étiquetée"| DEV
  DEV -.->|"/memory show, /tools desc,<br/>/stats model, export du prompt"| AG
```

## 3. Trois sources, cinq étiquettes

L'agent sait de l'hôte ce qu'il en observe, et rien d'autre. Ses sources sont trois : son propre contexte (les déclarations d'outils qu'il voit, son prompt système, les messages que l'hôte y pose), le disque lu par le script, et la documentation embarquée dans le paquet installé. Le développeur en apporte une quatrième, les commandes de l'interface de l'hôte, que l'agent ne peut pas lancer. Chaque affirmation sur l'hôte porte l'une de ces cinq étiquettes et sa source (D6.INV-1) :

| Étiquette | Sens | Source citée |
|---|---|---|
| `[observé]` | lu pendant cette session : sortie du script de nature « observé », fichier, sortie d'une commande collée par le développeur | la commande ou le chemin |
| `[déclaré]` | donné à l'agent sans qu'il l'ait vérifié : son propre contexte, une option, une affirmation du développeur | la section, la balise ou la personne |
| `[documenté]` | documentation embarquée de la version installée | la version et le document |
| `[déduit]` | conclusion tirée d'observations citées, nature « déduit » du script comprise | les observations |
| `[inconnu]` | non observable d'ici | le moyen de l'observer, s'il en existe un |

Chaque étiquette a une forme en clair, de même source : « vu sur votre poste », « d'après ce que je vois de mon propre contexte », « d'après la documentation de Gemini CLI 0.67.0 », « j'en déduis », « je ne peux pas le savoir d'ici ». C'est la forme par défaut du parcours découverte.

Entre deux sources contradictoires, l'observation de la session l'emporte sur la documentation, qui l'emporte sur la déduction, et la contradiction est dite (D6.INV-3). Le module `provenance` détaille ces règles, les deux formes des étiquettes et les angles morts.

## 4. Deux niveaux d'observation

L'explication d'une session se fait dans cette session (D7.INV-1). Activé dans la session principale, le skill fait de l'agent principal l'explicateur : il voit ce que le modèle de cette session reçoit. Le sous-agent `explicateur-hote` a son propre contexte, son propre prompt système et ses propres outils : il voit l'installation, pas la session qui l'appelle. Il sert à la carte et au diagnostic, sans encombrer la session principale ; à une question sur le contexte de la session, il répond qu'il ne le voit pas.

```mermaid
flowchart TB
  subgraph P["Session principale, skill activé"]
    direction LR
    PA["Agent principal"] -.->|"voit"| PC["prompt système, premier message,<br/>outils déclarés, historique"]
  end
  subgraph S["Sous-agent explicateur-hote"]
    direction LR
    SA["Sous-agent"] -.->|"voit"| SCX["son propre prompt et ses outils,<br/>pas le contexte de l'appelant"]
  end
  PA -->|"invoke_agent : carte, diagnostic"| SA
  SA -->|"rapport étiqueté"| PA
  PA --> D[("Disque, documentation")]
  SA --> D
```

## 5. Cycle 7E

| Phase | Ce qu'elle désigne ici | Modules |
|---|---|---|
| Éléments | les pièces de l'hôte : réglages, fichiers de contexte, skills, sous-agents, commandes, extensions, serveurs MCP, hooks, politiques, paquet et documentation | `hote`, `configuration`, `contexte`, `composants` |
| Espace | les portées où ces pièces vivent : système, utilisateur, workspace, extension, intégré, et les dossiers de l'hôte ; le dossier du skill lui-même, qui se suffit, installé au niveau utilisateur ou du projet | `configuration`, `composants`, `diffusion` |
| Engendrent | la composition : couches de réglages, précédence des paliers, masquage entre homonymes, filtrage par la confiance et la politique, assemblage du contexte de chaque tour | `configuration`, `contexte`, `modele-hote` |
| État | l'instantané : la configuration effective à un instant, et le contexte d'une session | `execution`, `contexte` |
| Expression | l'explication, chaque affirmation étiquetée par sa provenance ; le parcours découverte ; la carte ; le diagnostic ; la diffusion du skill, par son dossier, un fichier `.skill` ou la transmission texte, avec son mode d'emploi | `provenance`, `agent`, `modele-hote`, `diagnostic`, `diffusion` |
| Évolutif | les versions de l'hôte : repères datés, documentation de la version installée, schéma de l'instantané, dimensions réservées D10 et D11 | `modele-hote`, `autres-hotes`, `comparaison` |
| Environnement | le développeur, qui découvre l'outil ou s'en sert déjà, la plateforme, et l'hôte lui-même, dont l'agent fait partie | `hote`, `agent`, `secrets` |

Clause de second ordre : l'explicateur fait partie du système qu'il explique. Son activation ajoute le texte du skill au contexte qu'il décrit ; ses commandes reçoivent l'environnement que l'hôte leur donne, pas celui du développeur ; un sous-agent voit un autre contexte que la session qui l'appelle ; un outil que la politique retire n'existe pas pour lui, et il ne peut pas savoir qu'il lui manque. Le skill en tire ses règles : rien sur soi-même d'après sa propre impression (D6.INV-2), les angles morts nommés (D6.INV-4), l'observation datée et sourcée plutôt que la mémoire du modèle (D6.INV-5).

## 6. Registre des dimensions

| ID | Dimension | Introduite | Statut 1.1.0 | Dépend de | Module |
|---|---|---|---|---|---|
| D1 | Exécution du script : lecture seule, sorties, codes, bornes | 1.0 | active | | `execution`, `recette` |
| D2 | Identification de l'hôte : famille, preuve, paquet, version, documentation, hôte non reconnu | 1.0 | active | D1 | `hote`, `recette` |
| D3 | Configuration observée : couches, valeurs effectives, confiance, `.env`, variables | 1.0 | active | D1, D2 | `configuration`, `recette` |
| D4 | Composants : skills, sous-agents, commandes, extensions, serveurs MCP, hooks, politiques | 1.0 | active | D3 | `composants`, `recette` |
| D5 | Contexte : fichiers par palier, imports, mémoire privée, trace de session, prompt exporté | 1.0 | active | D3 | `contexte`, `recette` |
| D6 | Provenance des affirmations et angles morts | 1.0 | active | | `provenance` |
| D7 | Agent explicateur : niveaux d'observation, modes, parcours découverte, pédagogie, protocole, commandes | 1.0 | active | D1 à D6, D8, D9 | `agent` |
| D8 | Secrets et vie privée | 1.0 | active | D1 | `secrets`, `recette` |
| D9 | Modèle de fonctionnement de l'hôte : repères vérifiés, parcours, diagnostics | 1.0 | active | D2, D6 | `modele-hote`, `diagnostic` |
| D10 | Autres hôtes reconnus, chacun par un adaptateur | 1.0 | reserved | D2 à D5 | `autres-hotes` |
| D11 | Comparaison de deux instantanés dans le temps | 1.0 | reserved | D1 | `comparaison` |
| D12 | Diffusion autonome : un dossier qui se suffit, installation par l'hôte, mode d'emploi joint, retrait complet | 1.1 | active | D1, D7 | `diffusion`, `mode-emploi` |

## 7. Contrat de version et points d'extension

Contrat de version : une version mineure ajoute au moins une dimension ou un point d'extension ; sinon, c'est un correctif, dont seul le numéro de patch change. Un invariant ne s'affaiblit jamais. Avant chaque version, le point d'entrée de la précédente est archivé dans `archives/`, et le journal de révision (§ 12) dit ce qui change. Ce contrat est celui du dépôt où le skill est maintenu (`EVOLUTION.md` du dépôt Agent2Prompt) ; il est écrit ici pour que le skill se suffise (D12.INV-5). L'instantané est un objet JSON au schéma numéroté (`schema`) : ses clés ne changent de sens qu'avec un nouveau numéro de schéma. Les repères du module `modele-hote` ne sont pas des invariants : ils décrivent une version de l'hôte, portent leur date et leur source, et se révisent à chaque version de l'hôte que la recette des repères contredit (D9.INV-1).

Points d'extension, actifs depuis la version indiquée :

- **E1** (1.0.0) : `hote.famille` vaut `gemini-cli` ou `inconnue`, et un hôte non reconnu est déjà décrit par des candidats déduits (`hote.generique`). D10 ajoutera une famille par adaptateur, avec ses emplacements et ses repères, sans changer les clés des autres commandes.
- **E2** (1.0.0) : chaque objet porte `schema`, `version` et `date`, et la commande `comparer` est réservée : elle sort avec le code 1. D11 comparera deux instantanés enregistrés par le développeur, pour expliquer ce qui a changé entre deux sessions.

## 8. Règles globales

- **Lecture seule** : le script n'écrit, ne crée ni ne supprime aucun fichier, ne lance aucun processus et n'ouvre aucune connexion (D1.INV-1) ; l'agent ne modifie aucun fichier pendant qu'il explique (D7.INV-2).
- **Provenance** : chaque affirmation sur l'hôte porte son étiquette, courte ou en clair, et sa source (D6.INV-1) ; rien sur soi-même d'après sa propre impression (D6.INV-2).
- **Pédagogie** : pour qui découvre l'outil, un langage simple, une étape à la fois, chaque étape montrée sur le poste, avec ce que le développeur garde en main (D7.INV-4) ; expliquer sans chercher à convaincre, les limites et les risques dits aussi clairement que les garde-fous (D7.INV-5).
- **Version exacte** : la documentation qui fait foi est celle embarquée dans le paquet installé ; un repère d'une autre version se signale « à revérifier » (D6.INV-5).
- **Secrets** : aucune valeur secrète ne sort, ni du script ni de l'agent ; des noms, jamais des valeurs (D8.INV-1, D8.INV-3) ; aucun texte de conversation ni de fichier de contexte ne sort du script (D8.INV-2).
- **Hôte nommé** : Gemini CLI est le seul hôte que le skill nomme ; tout autre se décrit par ce qui s'en observe (D2.INV-3).
- **Sorties pour un agent** : un JSON sur une ligne par défaut, `--format texte` pour le développeur, des codes de sortie documentés (D1.INV-2), des listes bornées et des troncatures signalées (D1.INV-3).
- **Sans dépendance** : Node 20 ou plus récent, vérifié jusqu'à Node 26.13.0, celui du poste de la mission ; modules natifs, aucune installation (D1.INV-4).
- **Diffusion autonome** : le dossier du skill se suffit ; dans Gemini CLI, il s'installe par `gemini skills install`, et rien ne s'écrit hors de lui sans la demande du développeur (D12.INV-1, D12.INV-2, D12.INV-4).
- **Langue** : messages, clés de l'instantané et documentation en français ; noms des réglages, outils, fichiers et commandes de l'hôte tels que l'hôte les écrit.

## 9. Critères d'acceptation

- La recette du module `recette` passe en entier : `node --test tests/instantane-hote.test.mjs`, 28 tests sous Linux et WSL2 ; 27 réussis et 1 sauté (T9, qui lit `/proc`) sous Windows et macOS ; Node 20 ou plus récent.
- La recette passe en intégration continue sur `ubuntu-latest` et `windows-latest`, avec Node 20, 24 et 26.13.0, après extraction des fichiers par la commande du module `execution`, § 8, sous bash et sous CMD.
- La recette des repères (module `recette`, § 4) tient tous ses constats contre `@google/gemini-cli` 0.67.0, sous Node 26.13.0, sans qu'aucun appel ne quitte le poste : elle installe le skill comme le dit `MODE-EMPLOI.md`, depuis son dossier et depuis un fichier `.skill`, puis le retire.
- L'intégration continue lance les commandes du mode d'emploi qui installent puis retirent le sous-agent et les commandes, sous bash et sous CMD ; la commande d'extraction du mode d'emploi est celle du module `execution`, § 8.
- Les six fichiers tirés des modules ont exactement les empreintes de la table du module `execution`, § 8.
- Les scénarios A1 à A12 du module `agent` sont rejoués avec le développeur avant que l'agent serve à d'autres.

## 10. Invariants

**D1 : exécution**

- **D1.INV-1** : le script ne fait que lire : il ne crée, ne modifie ni ne supprime aucun fichier, ne lance aucun processus et n'ouvre aucune connexion ; il n'importe aucun module de processus ni de réseau.
- **D1.INV-2** : une réussite sort avec le code 0 et un objet sur une ligne, qui porte la commande, la version du skill, le numéro de schéma et la date ; un échec sort avec un code documenté (1 usage, 2 introuvable, 3 chemin refusé, 4 erreur interne) et un JSON `{"ok": false, ...}` sur la sortie d'erreur ; une commande réservée sort avec le code 1.
- **D1.INV-3** : toute liste est bornée par `--max` et tout document par `--max-caracteres` ; chaque troncature est signalée dans la sortie.
- **D1.INV-4** : le script et sa recette n'utilisent que les modules natifs de Node 20 ou plus récent ; aucune installation de paquet n'est nécessaire.

**D2 : identification de l'hôte**

- **D2.INV-1** : la famille de l'hôte et son paquet portent la nature de leur preuve : observé (variable `GEMINI_CLI=1` que l'hôte pose dans ses commandes, processus parent), déclaré (option `--paquet`), déduit (première commande `gemini` du PATH) ; une preuve déduite ou déclarée n'est jamais rendue comme observée.
- **D2.INV-2** : la version et la documentation sont celles du paquet trouvé ; `doc` ne rend que des documents Markdown de son dossier de documentation, et refuse tout chemin absolu ou qui en sort.
- **D2.INV-3** : un hôte non reconnu est décrit par des candidats déduits de ce qui s'observe (dossiers cachés de configuration d'agents, fichiers de consignes), sans configuration ni nom prêtés ; sans configuration de Gemini CLI, `config`, `contexte` et `composants` le disent au lieu d'en inventer une.

**D3 : configuration**

- **D3.INV-1** : chaque valeur effective d'un réglage observé porte la couche qui la donne, dans l'ordre de l'hôte (défauts système, utilisateur, workspace, système) ; la couche du workspace est écartée, avec sa raison, si le dossier n'est pas fiable ou si la racine est le dossier d'accueil ; un réglage hors de la liste observée n'est jamais rendu.
- **D3.INV-2** : un fichier de réglages est lu comme l'hôte le lit, commentaires compris ; un fichier illisible est signalé avec sa ligne, sans aucun extrait de son contenu, et les autres couches restent lues.
- **D3.INV-3** : la confiance du dossier s'évalue dans l'ordre de l'hôte : variables d'environnement, réglage `security.folderTrust.enabled`, fichier des dossiers de confiance, où la règle la plus longue l'emporte et `TRUST_PARENT` vaut pour le dossier parent ; ce que le script ne peut pas observer, un IDE compagnon connecté, est dit.
- **D3.INV-4** : le fichier `.env` que l'hôte chargerait est désigné avec les noms de ses variables ; les variables d'environnement observées forment une liste fermée, et les surcharges de réglages par l'environnement sont nommées.

**D4 : composants**

- **D4.INV-1** : skills, sous-agents, commandes, extensions, serveurs MCP, hooks et politiques sont rendus avec leur portée ; entre homonymes, celui qui l'emporte est désigné et chacun des autres marqué masqué ; les écarts d'en-tête sont signalés.
- **D4.INV-2** : un composant que l'hôte ignorerait (dossier non fiable, désactivation, exclusion) est rendu marqué ignoré, avec sa raison, jamais omis.

**D5 : contexte**

- **D5.INV-1** : les fichiers de contexte sont désignés par palier, comme l'hôte les cherche : global, projet de la racine jusqu'au dépôt (marqueurs réglés) dans l'ordre des chemins triés, extensions, et à la demande dans les sous-dossiers, ces derniers en déduits ; sans confiance, aucun fichier du projet n'est annoncé comme chargé.
- **D5.INV-2** : les imports `@chemin` d'un fichier de contexte sont listés avec leur existence, hors blocs de code.
- **D5.INV-3** : la trace de la dernière session ne rend que des chemins, des dates et les balises posées par l'hôte, jamais le texte d'un message ; elle dit qu'elle n'est pas forcément celle de la conversation en cours.
- **D5.INV-4** : un prompt système exporté par le développeur se lit en titres, skills et leurs emplacements, sous-agents, fichiers de contexte chargés et balises ; un fichier absent sort avec le code 2.

**D6 : provenance**

- **D6.INV-1** : toute affirmation de l'agent sur l'hôte porte une étiquette, `[observé]`, `[déclaré]`, `[documenté]`, `[déduit]` ou `[inconnu]`, et sa source.
- **D6.INV-2** : l'agent ne tire jamais de sa propre impression son identité de modèle, sa version, la version de l'hôte, ses réglages ni les limites de son contexte : seulement d'une observation ; quand il parle du modèle, il signale que le routage automatique et les sous-agents peuvent en employer d'autres.
- **D6.INV-3** : entre deux sources contradictoires, l'observation de la session l'emporte sur la documentation, qui l'emporte sur la déduction ; la contradiction est dite avec ses deux sources, jamais tranchée en silence.
- **D6.INV-4** : les angles morts sont nommés : ce qui ne s'observe pas d'ici est rendu `[inconnu]`, avec le moyen de l'observer quand il en existe un.
- **D6.INV-5** : un repère daté d'une autre version de l'hôte que celle observée se signale « à revérifier », et la documentation de la version installée fait foi pour elle.

**D7 : agent**

- **D7.INV-1** : l'explication d'une session, de son contexte et de ses outils, se fait dans cette session, skill activé ; un sous-agent dit qu'il ne voit pas le contexte de la session qui l'appelle et rend ce qu'il peut observer.
- **D7.INV-2** : l'agent ne modifie aucun fichier pendant qu'il explique ; une modification de configuration se décrit (fichier, clé, valeur, effet attendu) et ne s'applique que sur demande explicite du développeur, hors du rôle d'explicateur.
- **D7.INV-3** : avant toute affirmation sur cette installation, l'agent lance l'instantané, en commençant par `hote`, et cite la version observée de l'hôte.
- **D7.INV-4** : pour qui découvre l'outil, chaque étape du parcours découverte répond à une question du développeur en langage simple, montre sur cette installation ce qu'elle affirme quand cela s'observe, et dit ce que le développeur garde en main ; un terme technique s'explique à sa première apparition, et les étiquettes s'écrivent en clair.
- **D7.INV-5** : l'agent explique sans chercher à convaincre : une limite ou un risque de l'outil se dit aussi clairement qu'un garde-fou, et une inquiétude sans réponse vérifiable reçoit `[inconnu]`, avec le moyen de la vérifier, jamais une réassurance.

**D8 : secrets et vie privée**

- **D8.INV-1** : aucune valeur secrète ne sort du script : des noms seulement pour les variables, les en-têtes et les clés sensibles ; toute valeur rendue passe par un masquage par motifs, puis toute la sortie une seconde fois.
- **D8.INV-2** : aucun texte de conversation, de prompt de lancement ni de fichier de contexte ne sort du script : des chemins, des tailles, des dates et des balises.
- **D8.INV-3** : l'agent ne recopie jamais une valeur secrète qu'il a vue, dans un fichier ou une sortie ; il dit seulement qu'elle existe et où.

**D9 : modèle de fonctionnement de l'hôte**

- **D9.INV-1** : chaque repère du module `modele-hote` porte la version de l'hôte, la date et la source de sa vérification (document de la version, code relu, essai réel) ; la recette des repères les confronte au Gemini CLI réel de cette version, sans réseau, à chaque modification de la spécification.
- **D9.INV-2** : un diagnostic suit la table du module `diagnostic` : chaque hypothèse se confirme ou s'écarte par une observation nommée, et la cause retenue est étiquetée ; faute d'observation décisive, le diagnostic le dit et propose l'observation qui manque.

**D12 : diffusion autonome**

- **D12.INV-1** : le dossier du skill se suffit : l'installer, le vérifier et s'en servir ne demandent que ce dossier, Node 20 ou plus récent et l'hôte ; aucune étape du skill ne passe par un dépôt, un outil ou un fichier extérieur au dossier, ni par le réseau, et seul l'hôte parle à son modèle, comme il le fait sans le skill.
- **D12.INV-2** : dans Gemini CLI, le skill s'installe par la commande de l'hôte, `gemini skills install`, depuis son dossier ou un fichier `.skill`, et n'y devient qu'un seul skill, ses modules n'étant jamais pris pour des skills ; ses six fichiers exécutables s'en tirent ensuite par la commande d'extraction, puis la recette passe ; un écart ou un échec arrête l'installation.
- **D12.INV-3** : le mode d'emploi `MODE-EMPLOI.md` fait partie du dossier et de la transmission, et porte la version du skill ; ses commandes sont, à l'identique, celles des modules `execution` et `diffusion`, et ses renvois ne sortent pas du dossier.
- **D12.INV-4** : hors du dossier du skill, rien ne s'écrit sans la demande du développeur : le sous-agent et les commandes s'installent par une commande qu'il lance ou qu'il approuve, une commande de retrait les supprime, et, avec `gemini skills uninstall`, rien ne reste.
- **D12.INV-5** : le dépôt où le skill est maintenu se nomme comme son origine et le lieu de sa vérification, jamais comme une étape ; le contrat de version, les règles et la recette du skill sont écrits dans le skill.

## 11. Filiation

Le skill répond à la demande du développeur du 6 novembre 2026 : « un skill pour un agent qui explique le fonctionnement de l'IA dans laquelle on l'exécute, comme par exemple Gemini CLI ». Sa destination, précisée le 7 novembre 2026 : l'équipe, qui le diffuse aux développeurs hésitant à se servir de l'IA sans en connaître le fonctionnement ; l'hésitation qui revient le plus est le sentiment d'une boîte noire. D'où le parcours découverte, la forme en clair des étiquettes et les invariants D7.INV-4 et D7.INV-5. Le poste de la mission est passé à Node 26.13.0 le 6 novembre 2026 : la recette et les repères y sont vérifiés. Le 7 novembre 2026, le développeur a demandé que le skill, bien que maintenu dans le dépôt Agent2Prompt, en soit complètement indépendant, pour une diffusion autonome, avec un mode d'emploi à côté de lui : d'où la dimension D12, le module `diffusion` et `MODE-EMPLOI.md`. Le skill suit, depuis le 2 novembre 2026, une règle reprise du dépôt où il est maintenu : l'IA locale ne lit que des consignes qui la concernent, et aucun autre outil d'IA n'est nommé dans ce qu'elle lit (module `hote`, § 5).

Les repères sont tirés du paquet `@google/gemini-cli` 0.67.0, publié sur npm, le 6 novembre 2026 :

- la documentation embarquée dans le paquet (`bundle/docs/`, 95 documents) ;
- le code du paquet, relu là où la documentation ne suffit pas ou se contredit : assemblage du contexte, chargement de la mémoire, confiance, recherche du fichier `.env`, environnement des commandes, choix du gabarit du prompt système ;
- des sessions réelles de Gemini CLI 0.67.0, dans un accueil isolé, contre une fausse API locale qui garde chaque requête, toute autre sortie notée puis refusée par un proxy témoin : requêtes envoyées au modèle, prompt système exporté par `GEMINI_WRITE_SYSTEM_MD`, transcription de session, hôtes que Gemini CLI cherche à joindre.

Ces lectures ont relevé des écarts entre la documentation et le code de la même version, que l'agent sait dire (module `modele-hote`, § 10). Elles ont aussi montré que, réglé par défaut, Gemini CLI envoie des statistiques d'usage et cherche des mises à jour même quand l'API du modèle est locale (repère H1).

## 12. Journal de révision

**1.1.0** (2026-11-07) : version mineure, pour une diffusion autonome. Le développeur a demandé que le skill, bien que maintenu dans le dépôt Agent2Prompt, en soit complètement indépendant, avec un mode d'emploi à côté de lui. Dimension D12, diffusion autonome : module `diffusion`, invariants D12.INV-1 à D12.INV-5, et `MODE-EMPLOI.md`, joint au dossier et à la transmission. Dans Gemini CLI, le skill s'installe par `gemini skills install`, depuis son dossier ou un fichier `.skill`, puis l'extraction et la recette ; le sous-agent et les commandes, par une commande que le développeur lance, et une commande de retrait les supprime. Plus aucune étape ne passe par le dépôt : l'installation par l'hôte remplace celle de l'outil du dépôt (en-tête de transmission, module `agent`), le contrat de version est écrit dans ce point d'entrée (§ 7), et les modules `hote`, `composants` et `recette` ne nomment le dépôt que comme origine et lieu de vérification. La recette des repères installe le skill comme le dit le mode d'emploi, et l'intégration continue lance ses commandes sous bash et sous CMD. Version du script, du sous-agent et des commandes portée à 1.1.0 ; leur comportement ne change pas.

**1.0.2** (2026-11-07) : correctif. L'en-tête de transmission et le module `recette` citaient encore les scénarios A1 à A10 : à l'installation, l'IA rejouait les scénarios sans A11 ni A12, ceux du parcours découverte. Ils citent A1 à A12, comme ce point d'entrée et le module `agent`. Le tableau des dimensions porte la version courante. Version du script, du sous-agent et des commandes portée à 1.0.2 ; aucun comportement ni aucun invariant modifié.

**1.0.1** (2026-11-07) : correctif, pour la diffusion aux développeurs qui hésitent à se servir de l'IA faute d'en voir le fonctionnement. Parcours découverte en sept étapes, à la place du parcours guidé (module `modele-hote`, § 11) ; forme en clair des étiquettes (module `provenance`, § 3) ; invariants D7.INV-4 (pédagogie) et D7.INV-5 (expliquer sans chercher à convaincre) ; scénarios A11 et A12. Repère H1 corrigé : sous Node 26, une partie des sorties de Gemini CLI ne suit plus `HTTPS_PROXY`. Recette vérifiée sous Node 26.13.0, repères confrontés sous Node 26.13.0 ; en-têtes YAML des modules `agent`, `contexte` et `diagnostic` rendus lisibles par un lecteur YAML strict.

**1.0.0** (2026-11-06) : première version. Dimensions D1 à D9 actives, D10 et D11 réservées. Points d'extension E1 et E2. Script `scripts/instantane-hote.mjs` (Node 20, sans dépendance, lecture seule), recette de 28 tests, agent `explicateur-hote` et commandes `/hote:explique`, `/hote:carte`, `/hote:pourquoi`, écrits en entier dans les modules `execution`, `recette` et `agent`. Repères vérifiés sur Gemini CLI 0.67.0, confrontés au Gemini CLI réel par la recette des repères, sans qu'aucun appel ne quitte le poste.
<<<FIN SKILL.md>>>

<<<FICHIER modules/provenance/SKILL.md>>>
---
name: provenance
description: Provenance des affirmations sur l'hôte (quatre sources, cinq étiquettes, leur forme courte et leur forme en clair pour qui découvre l'outil, ordre de foi entre sources contradictoires, ce que l'agent ne tire jamais de sa propre impression, angles morts et moyens de les observer, repères d'une autre version à revérifier). À lire avant toute explication.
dimensions: [D6]
status: active
---

# Module `provenance` (D6)

Phase 7E couverte : Expression.

## 1. Pourquoi des étiquettes

Un modèle qui parle de l'outil qui l'exécute est un témoin peu sûr. Ce qu'il en sait vient de trois endroits qu'il ne distingue pas de lui-même : ses données d'entraînement, qui décrivent d'autres versions, voire d'autres outils ; son propre contexte, qui ne contient que ce que l'hôte a choisi de lui donner ; et ce qu'il complète faute de savoir. Les modèles se trompent couramment sur leur propre nom, leur version ou leurs limites. Le skill rattache donc chaque affirmation sur l'hôte à une source, et nomme ce qu'aucune source ne donne (D6.INV-1, D6.INV-4).

## 2. Quatre sources

| Source | Ce qu'elle donne | Ce qu'elle ne donne pas | Étiquette |
|---|---|---|---|
| Le propre contexte de l'agent | les outils qu'il voit déclarés, avec leur description ; son prompt système : sections, skills listés avec l'emplacement de leur `SKILL.md`, sous-agents ; le premier message de la session (`<session_context>`) ; dans les résultats d'outils, les fichiers de contexte découverts à la demande ; les balises `<activated_skill>` et `<hook_context>` | les outils que la politique a retirés, le texte que la compression a remplacé par un résumé, les réglages, la version de l'hôte | `[déclaré]`, avec la section ou la balise |
| Le script `instantane-hote.mjs` | le disque : paquet et version, couches de réglages, confiance, fichiers de contexte, composants, trace de la dernière session, documentation embarquée | l'état en mémoire de l'hôte : ce qu'il a chargé au démarrage, les fichiers modifiés depuis, les options de lancement hors Linux, la confiance imposée par un IDE | `[observé]` ou `[déduit]`, selon la nature que donne le script |
| La documentation embarquée | le fonctionnement documenté de la version installée, par `doc <chemin>` | ce que le code fait quand il s'écarte de sa documentation (module `modele-hote`, § 10) | `[documenté]`, avec la version et le document |
| Les commandes de l'interface, lancées par le développeur | l'état en mémoire de l'hôte : `/about`, `/stats model`, `/memory list`, `/memory show`, `/tools desc`, `/skills list all`, `/agents list`, `/mcp list`, `/policies list`, `/hooks list`, `/extensions list`, `/permissions trust` ; le prompt système exporté (module `contexte`, § 6) | rien de ce qu'elles n'affichent pas | `[observé]`, avec la commande et « collé par le développeur » |

L'agent ne peut pas lancer les commandes de l'interface : elles s'adressent à l'hôte, pas au modèle. Quand l'une d'elles tranche une question, il demande au développeur de la lancer et de coller ce qu'elle affiche.

## 3. Étiquettes et forme de citation

Une étiquette par affirmation, entre crochets, avec sa source après deux-points. Une phrase qui mêle deux sources se coupe en deux.

| Étiquette | Exemple |
|---|---|
| `[observé]` | « Le modèle demandé est `gemini-3-pro-preview`, par la couche workspace [observé : config, `model.name`]. » |
| `[déclaré]` | « Je vois l'outil `run_shell_command` parmi mes déclarations [déclaré : déclarations d'outils de cette session]. » |
| `[documenté]` | « Seuls le nom et la description d'un skill sont donnés au modèle avant son activation [documenté : Gemini CLI 0.67.0, cli/skills.md]. » |
| `[déduit]` | « Ce `GEMINI.md` n'est pas chargé au démarrage : il est sous `src/api/`, sous la racine [déduit : contexte, `a_la_demande`]. » |
| `[inconnu]` | « Je ne sais pas quel modèle a produit cette réponse [inconnu : `/stats model` le montre]. » |

Les natures du script se traduisent telles quelles : `observé` en `[observé]`, `déduit` en `[déduit]`, `déclaré` en `[déclaré]`, `documenté` en `[documenté]`. Une valeur sans nature dans un objet observé hérite de celle de sa section ; les valeurs effectives de `config` sont `[observé]`, avec leur couche.

Chaque étiquette a une forme en clair : la même étiquette, traduite pour qui découvre l'outil, qui garde sa catégorie et sa source entre parenthèses, et satisfait donc D6.INV-1. C'est la forme par défaut du parcours découverte, et celle de toute réponse à un développeur qui découvre l'outil ou la préfère (D7.INV-4) ; la forme courte sert à la carte, au diagnostic et au sous-agent.

| Étiquette | Forme en clair | Exemple |
|---|---|---|
| `[observé]` | « vu sur votre poste » | « Gemini CLI 0.67.0 tourne ici (vu sur votre poste : `hote`). » |
| `[déclaré]` | « d'après ce que je vois de mon propre contexte », ou « d'après ce que vous m'avez dit » | « Je dispose d'un outil qui lance des commandes (d'après ce que je vois de mon propre contexte : mes outils déclarés). » |
| `[documenté]` | « d'après la documentation de Gemini CLI <version> » | « Tant qu'un skill n'est pas activé, le modèle n'en voit que le nom et la description (d'après la documentation de Gemini CLI 0.67.0 : `cli/skills.md`). » |
| `[déduit]` | « j'en déduis, à partir de … » | « Ce fichier n'est pas chargé au démarrage (j'en déduis, à partir de `contexte` : il est dans un sous-dossier). » |
| `[inconnu]` | « je ne peux pas le savoir d'ici » | « Je ne sais pas quel modèle a produit cette réponse (je ne peux pas le savoir d'ici ; `/stats model` le montre). » |

## 4. Ordre de foi (D6.INV-3)

1. L'observation de la session : sortie du script, commande de l'interface, fichier lu.
2. La documentation embarquée de la version installée.
3. Les repères du module `modele-hote`, datés et vérifiés sur une version précise.
4. La déduction tirée de ces sources.
5. La connaissance générale du modèle, qui ne suffit jamais seule : elle oriente une observation, elle ne la remplace pas.

Une contradiction se dit avec ses deux sources, puis l'agent propose l'observation qui la tranche. Exemple vérifié sur 0.67.0 : la documentation annonce un balayage des fichiers de contexte des sous-dossiers, borné à 200 dossiers par `context.discoveryMaxDirs` ; le code de la même version ne fait plus ce balayage et ne charge ces fichiers qu'à la demande. L'agent rend les deux, et `/memory list` tranche.

## 5. Ce que l'agent ne tire jamais de sa propre impression (D6.INV-2)

| Question | Source à employer |
|---|---|
| Quel modèle es-tu ? Quelle version ? | `/about` et `/stats model` [observé, collé par le développeur] ; le modèle demandé se lit dans `config` (`model.name`) et dans les surcharges (`GEMINI_MODEL`, option `-m`), mais le routage automatique choisit entre plusieurs modèles, les sous-agents et les appels internes en emploient d'autres |
| Quelle version de l'hôte ? | `hote`, paquet et nature de sa preuve |
| Quels outils as-tu ? | tes déclarations [déclaré] ; un outil que la politique retire sans condition sur ses arguments n'y figure pas, et tu ne peux pas le savoir : `/tools desc` et `/policies list` |
| Qu'y a-t-il dans ton contexte ? | ce que tu vois [déclaré], en disant que la compression a pu remplacer le début de la conversation par un résumé ; pour les fichiers de contexte, `contexte` et `/memory list` |
| Quelle est la taille de ton contexte ? Combien en reste-t-il ? | `/stats model` ; la documentation du modèle ; jamais une estimation donnée comme un fait |
| Quels réglages s'appliquent ? | `config`, avec leur couche ; un réglage lu sur le disque n'est actif qu'après redémarrage ou rechargement, selon la documentation |

## 6. Angles morts (D6.INV-4)

| Ce qui ne s'observe pas d'ici | Pourquoi | Comment l'observer |
|---|---|---|
| poids du modèle, données d'entraînement, échantillonnage | côté fournisseur | aucun moyen : `[inconnu]` |
| traitement côté serveur : filtrage, journalisation, cache, routage | côté fournisseur | ce que la documentation publique en dit (`resources/tos-privacy.md`, `cli/token-caching.md`, `cli/model-routing.md`), en `[documenté]` |
| outils retirés par la politique | ils ne sont plus déclarés au modèle | `/tools desc`, `/policies list` ; `composants`, politiques |
| texte remplacé par la compression | le résumé remplace l'original dans le contexte | `[inconnu]` pour l'agent ; la documentation de `/compress` et de `model.compressionThreshold` |
| ce que l'hôte a chargé au démarrage, si le disque a changé depuis | le script lit le disque d'aujourd'hui | `/memory list`, `/skills list all`, `/agents list`, `/mcp list`, `/commands list` ; les rechargements (`/memory reload`, `/skills reload`, `/agents reload`, `/mcp reload`, `/commands reload`) |
| confiance imposée par un IDE compagnon | état de l'interface, pas du disque | `/permissions trust` |
| options de lancement, hors Linux et WSL | le script ne lit les processus parents que dans `/proc` | le développeur les dit |
| contexte de la session qui appelle un sous-agent | contexte séparé | la session principale, skill activé (D7.INV-1) |
| variables retirées par l'hôte de l'environnement de ses commandes | retirées avant que le script ne démarre | le réglage observé (`security.environmentVariableRedaction.enabled`) ; le développeur |
| texte exact du prompt système | le modèle n'en a qu'une lecture | l'export du développeur (module `contexte`, § 6) |

## 7. Repères d'une autre version (D6.INV-5)

Les repères du module `modele-hote` sont vérifiés sur Gemini CLI 0.67.0. Si `hote` observe une autre version, chaque repère employé se cite « [documenté : repère vérifié sur 0.67.0, à revérifier] », et l'agent lit le document correspondant de la version installée (`doc <chemin>`) avant de le présenter comme actuel. Si la version est inconnue, faute de paquet localisé, il le dit, et chaque repère garde sa version.

## 8. Contrôle de sortie

- Chaque affirmation sur l'hôte porte une étiquette, courte ou en clair, et une source (D6.INV-1).
- Aucune affirmation sur soi-même ne vient de la propre impression de l'agent (D6.INV-2).
- Toute contradiction entre sources est dite, avec ses deux sources et l'observation qui la tranche (D6.INV-3).
- Les angles morts touchés par la question sont nommés, avec leur moyen d'observation (D6.INV-4).
- Un repère d'une autre version est signalé « à revérifier » (D6.INV-5).
<<<FIN modules/provenance/SKILL.md>>>

<<<FICHIER modules/execution/SKILL.md>>>
---
name: execution
description: Exécution du script instantane-hote.mjs (commandes, options, où le lancer et depuis quel dossier, confirmation par l'hôte, sorties JSON et texte, codes de sortie, bornes et troncatures, lecture seule, Node 20 sans dépendance, pièges connus, commande d'extraction des six fichiers à empreintes, texte complet du script). À lire avant de lancer le script ou d'en lire une sortie.
dimensions: [D1]
status: active
---

# Module `execution` (D1)

Phase 7E couverte : État et Expression.

## 1. Commandes

    node <dossier du skill>/scripts/instantane-hote.mjs <commande> [options]

| Commande | Rend | Module |
|---|---|---|
| `hote` | famille de l'hôte, certitude et indices, paquet (version, documentation, skills intégrés), options de lancement, bac à sable, plateforme, accueil, racine, avertissements ; pour un hôte non reconnu, les candidats déduits | `hote` |
| `config` | couches de réglages, valeurs effectives et leur couche, règle de fusion, surcharges par l'environnement, confiance, fichier `.env`, variables | `configuration` |
| `contexte` | noms des fichiers de contexte, paliers global, projet, mémoire privée, extensions, à la demande ; trace de la dernière session ; prompt système exporté, avec `--prompt-systeme` | `contexte` |
| `composants` | skills, sous-agents, commandes, extensions, serveurs MCP, hooks, politiques, fichiers d'exclusion | `composants` |
| `doc [chemin]` | sans chemin, la liste des documents embarqués dans le paquet ; avec un chemin relatif au dossier de documentation, ce document | `hote` |
| `tout` | `hote`, `config`, `contexte` et `composants` dans un même objet | ce module |
| `comparer` | réservée (D11, point d'extension E2) : code 1 | `comparaison` |

## 2. Options

| Option | Effet | Défaut |
|---|---|---|
| `--racine <dossier>` | racine du workspace observé | le dossier courant |
| `--paquet <dossier>` | dossier du paquet `@google/gemini-cli`, quand il n'est trouvé ni par les processus parents ni par le PATH | recherche automatique (module `hote`, § 2) |
| `--dossier-systeme <dossier>` | dossier système de l'hôte | `/etc/gemini-cli`, `C:\ProgramData\gemini-cli` ou `/Library/Application Support/GeminiCli` |
| `--prompt-systeme <fichier>` | prompt système exporté par le développeur, à analyser avec `contexte` | aucun |
| `--format json\|texte` | une ligne JSON pour un agent, ou un texte lisible | `json` |
| `--max <n>` | éléments rendus par liste | 50 |
| `--max-caracteres <n>` | caractères rendus d'un document | 40000 |
| `--version`, `--help` | version et schéma ; aide | |

Les variables que l'hôte lit pour ses propres emplacements valent aussi pour le script : `GEMINI_CLI_HOME`, `GEMINI_CLI_SYSTEM_SETTINGS_PATH`, `GEMINI_CLI_SYSTEM_DEFAULTS_PATH`, `GEMINI_CLI_TRUSTED_FOLDERS_PATH`. Le script n'a pas de variable propre.

## 3. Où le lancer

- **Depuis la racine du workspace**, celle où l'hôte a été lancé ; sinon `--racine`. Les commandes de l'hôte s'exécutent par défaut dans cette racine.
- **Le dossier du skill** : dans la session principale, celui du `SKILL.md` que donne `<available_skills>` dans le prompt système [déclaré] ; installé au niveau utilisateur, `~/.gemini/skills/explication-hote-ia/` ; dans le workspace, `.gemini/skills/explication-hote-ia/` ; collé dans une autre IA, `.skills/explication-hote-ia/`. Le sous-agent lit ce chemin dans sa définition (module `agent`, § 2).
- **Confirmation** : Gemini CLI soumet chaque commande de son outil shell à sa politique ; le développeur accepte le lancement, une fois ou pour la session. Le skill ne propose aucune règle de politique pour s'en dispenser.
- **Windows** : `node "C:\Users\<nom>\.gemini\skills\explication-hote-ia\scripts\instantane-hote.mjs" hote`, guillemets doubles autour d'un chemin qui contient des espaces.
- **Bac à sable de l'hôte** : dans un conteneur, le script voit le système de fichiers du conteneur ; `hote.bac_a_sable` le signale et les chemins rendus sont ceux du conteneur.

## 4. Sorties et codes (D1.INV-2)

Chaque réussite rend un objet sur une ligne, avec des champs communs : `ok` (`true`), `commande`, `skill` (`explication-hote-ia`), `version` (celle du script), `schema` (1) et `date` (ISO 8601). Viennent ensuite les sections de la commande ; `config`, `contexte` et `composants` portent `hote_confirme`, vrai seulement si l'hôte est observé. `troncatures` s'ajoute quand une liste a été bornée.

`--format texte` rend le même objet, indenté, pour le développeur ; `doc <chemin>` y rend le document tel quel. Le masquage des secrets s'applique avant le choix du format (module `secrets`).

| Code | Sens | Sortie |
|---|---|---|
| 0 | réussite | l'objet, sur la sortie standard |
| 1 | usage : commande inconnue ou réservée, option inconnue, valeur invalide | `{"ok": false, "code": 1, "erreur": "…"}` sur la sortie d'erreur |
| 2 | introuvable : paquet ou document absent, prompt exporté absent | idem, code 2 |
| 3 | chemin refusé : document hors du dossier de documentation, absolu ou non Markdown | idem, code 3 |
| 4 | erreur interne : un défaut du script, à rapporter | idem, code 4 |

## 5. Bornes (D1.INV-3)

- Chaque liste rendue s'arrête à `--max` éléments ; la liste `troncatures` nomme chaque liste bornée, avec son nombre d'éléments.
- Un document de `doc` s'arrête à `--max-caracteres` ; `tronque` et `caracteres` le disent.
- Lectures bornées par le script lui-même : 512 Ko au début d'un fichier de session, 2 000 dossiers pour les fichiers de contexte à la demande (`a_la_demande.tronque`), 5 000 fichiers par dossier parcouru, 4 Ko d'une commande trouvée dans le PATH.

## 6. Lecture seule (D1.INV-1)

Le script lit : les fichiers de réglages, les fichiers de contexte (leur taille, leurs lignes et leurs imports, jamais leur texte en sortie), les dossiers de skills, d'agents, de commandes, d'extensions et de politiques, le registre des projets, le début du fichier de la dernière session, la documentation et le `package.json` du paquet, `/proc` sous Linux.

Il ne fait rien d'autre : aucune écriture, aucune création de dossier, aucune suppression, aucun processus lancé, pas même `gemini --version` (la version se lit dans `package.json`), aucune connexion. Il n'importe que `node:fs`, `node:os`, `node:path`, `node:url` et `node:util`, et n'ouvre de fichier qu'en lecture (`'r'`). La recette le vérifie sur le texte du script et sur le disque (T3, T4).

## 7. Environnement (D1.INV-4)

Node 20 ou plus récent, modules natifs seulement, aucune installation. La recette tourne avec Node 20, 24 et 26.13.0, celle du poste de la mission, sous Linux et sous Windows.

## 8. Matérialiser les fichiers exécutables

Six fichiers sont tirés des blocs annotés `<!-- fichier : chemin -->` des modules, à l'identique, par programme plutôt qu'à la main :

| Fichier | Module, section | Empreinte sha256 |
|---|---|---|
| `scripts/instantane-hote.mjs` | `execution`, § 11 | `ae296517f6670e0d0499db9c6d03d8550596b6eee4e7be69335c72e359fdd34d` |
| `tests/instantane-hote.test.mjs` | `recette`, § 6 | `c66a1ff94ebe065d9fe0197ccc6af8f9d1d48798c89b53fb903b7de6625e0b17` |
| `agent/explicateur-hote.md` | `agent`, § 8 | `e38d01c3ea9dbb77c414f7c0209974d99183e4c7910c8c8fc821c26af091475e` |
| `commandes/hote/explique.toml` | `agent`, § 9 | `cfd784a3449c1ac6f5914da112b9e0daa79bc1e52cdbc0721a4d94d894dbce6a` |
| `commandes/hote/carte.toml` | `agent`, § 9 | `e2d9ab278eca3c9e22a97b4f10f09bda0455abe021aa9931b8f96cecd8ce042b` |
| `commandes/hote/pourquoi.toml` | `agent`, § 9 | `09a0ae500aa33c2587925b379801b84c3886e06a0fa7c7fd5c9dd4fdd8095720` |

Depuis le dossier du skill, cette commande d'une ligne écrit les six fichiers, compare leurs empreintes à celles du tableau et sort avec le code 1 au moindre écart. Elle ne contient ni `$`, ni accent grave, ni `!`, ni `%`, ni guillemet intérieur : elle se colle telle quelle dans bash, zsh, CMD ou PowerShell, et dans un fichier `.cmd`. Elle lit aussi des modules aux fins de ligne CRLF.

```text
node -e "const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'); const attendu = { 'scripts/instantane-hote.mjs': 'ae296517f6670e0d0499db9c6d03d8550596b6eee4e7be69335c72e359fdd34d', 'tests/instantane-hote.test.mjs': 'c66a1ff94ebe065d9fe0197ccc6af8f9d1d48798c89b53fb903b7de6625e0b17', 'agent/explicateur-hote.md': 'e38d01c3ea9dbb77c414f7c0209974d99183e4c7910c8c8fc821c26af091475e', 'commandes/hote/explique.toml': 'cfd784a3449c1ac6f5914da112b9e0daa79bc1e52cdbc0721a4d94d894dbce6a', 'commandes/hote/carte.toml': 'e2d9ab278eca3c9e22a97b4f10f09bda0455abe021aa9931b8f96cecd8ce042b', 'commandes/hote/pourquoi.toml': '09a0ae500aa33c2587925b379801b84c3886e06a0fa7c7fd5c9dd4fdd8095720' }; const vus = new Set(); let ecarts = 0; for (const module of ['modules/execution/SKILL.md', 'modules/recette/SKILL.md', 'modules/agent/SKILL.md']) { const texte = fs.readFileSync(module, 'utf8').replace(/\r\n/g, '\n'); for (const m of texte.matchAll(/^<\x21-- fichier : (\S+) -->\n\x60{3}[a-z]*\n([\s\S]*?)\n\x60{3}\n/gm)) { const contenu = m[2] + '\n'; fs.mkdirSync(path.dirname(m[1]), { recursive: true }); fs.writeFileSync(m[1], contenu); vus.add(m[1]); const conforme = crypto.createHash('sha256').update(contenu).digest('hex') === attendu[m[1]]; if (conforme === false) ecarts++; console.log((conforme ? 'conforme  ' : 'ECART     ') + m[1]); } } for (const f of Object.keys(attendu)) if (vus.has(f) === false) { ecarts++; console.log('ABSENT    ' + f); } if (ecarts > 0) process.exitCode = 1;"
```

Puis la recette, depuis le même dossier :

```bash
node --test tests/instantane-hote.test.mjs
```

## 9. Pièges connus

| Constat | Cause | Conduite |
|---|---|---|
| `contexte` ne trouve ni le `GEMINI.md` du projet ni la mémoire privée | script lancé depuis un autre dossier que la racine | relancer depuis la racine, ou `--racine` |
| la version rendue n'est pas celle qu'affiche `/about` | paquet trouvé par le PATH (`nature : déduit`), alors qu'un autre s'exécute | `--paquet` vers le paquet que l'hôte exécute ; sous Linux, l'observation des processus parents l'évite |
| réglages, commandes et serveurs MCP du workspace marqués ignorés | dossier non fiable pour l'hôte | ce n'est pas une erreur du script : l'hôte les ignore aussi (module `configuration`, § 3) |
| la trace de session décrit une autre conversation | plusieurs sessions sur le même projet ; le script prend la plus récemment modifiée | comparer `debut` à l'heure de la session en cours ; `/memory list` fait foi |
| `arguments_de_lancement` vaut `null` | Windows, macOS, ou hôte non trouvé parmi les processus parents | demander au développeur les options de lancement |

## 10. Contrôle de sortie

- Chaque commande sort avec un code du tableau du § 4, et un objet daté et versionné en cas de réussite (D1.INV-2).
- Toute liste bornée apparaît dans `troncatures` (D1.INV-3).
- Aucun fichier du disque n'a changé après une commande (D1.INV-1).

## 11. Script `scripts/instantane-hote.mjs`

<!-- fichier : scripts/instantane-hote.mjs -->
```js
#!/usr/bin/env node
// explication-hote-ia 1.1.0 : instantané en lecture seule de l'outil d'IA qui exécute l'agent
// (Gemini CLI, ou un hôte non reconnu décrit de façon générique), pour l'agent qui l'explique.
// Usage : node scripts/instantane-hote.mjs <commande> [options]   (aide : --help)
// Commandes : hote, config, contexte, composants, doc [chemin], tout.
// Node 20 ou plus récent, modules natifs. Le script lit seulement : il n'écrit, ne crée ni ne
// supprime aucun fichier, ne lance aucun processus et n'ouvre aucune connexion (D1.INV-1).
// Aucune valeur secrète ne sort : des noms, jamais des valeurs, et un masquage final (D8.INV-1).
// Importé, le module ne lance rien : executer() rend l'objet de la commande sans l'écrire.

import { closeSync, openSync, readFileSync, readSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { arch, homedir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

export const VERSION = '1.1.0';
export const SCHEMA = 1;
export const CODES = { OK: 0, USAGE: 1, INTROUVABLE: 2, REFUS: 3, INTERNE: 4 };
export const COMMANDES = ['hote', 'config', 'contexte', 'composants', 'doc', 'tout'];
const RESERVEES = { comparer: 'D11, point d\'extension E2' };
export const MASQUE = '[masqué]';
const FORMATS = ['json', 'texte'];
const MAX_DEFAUT = 50;
const MAX_DOC = 40000;
const PAQUET = '@google/gemini-cli';
const CLOTURE = String.fromCharCode(96).repeat(3);

export class Echec extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

// ---------------------------------------------------------------------------------------------
// Lecture prudente : aucune de ces fonctions n'écrit ni ne lève.

function lireTexte(chemin) {
  try {
    return readFileSync(chemin, 'utf8');
  } catch {
    return null;
  }
}

function lireDebut(chemin, octets) {
  let fd;
  try {
    fd = openSync(chemin, 'r');
    const tampon = Buffer.alloc(octets);
    const lus = readSync(fd, tampon, 0, octets, 0);
    return tampon.subarray(0, lus).toString('utf8');
  } catch {
    return null;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

function etat(chemin) {
  try {
    return statSync(chemin);
  } catch {
    return null;
  }
}

const estFichier = (chemin) => etat(chemin)?.isFile() === true;
const estDossier = (chemin) => etat(chemin)?.isDirectory() === true;

function entrees(dossier) {
  try {
    return readdirSync(dossier, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

function cheminReel(chemin) {
  try {
    return realpathSync(chemin);
  } catch {
    return resolve(chemin);
  }
}

/** Fichiers d'un dossier, chemins relatifs en `/`, triés ; parcours borné, liens symboliques non suivis. */
function fichiersSous(dossier, garder, limite = 5000) {
  const trouves = [];
  const pile = [''];
  while (pile.length > 0 && trouves.length < limite) {
    const rel = pile.shift();
    for (const e of entrees(join(dossier, rel))) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) pile.push(r);
      else if (e.isFile() && garder(e.name)) trouves.push(r);
    }
  }
  return trouves.sort();
}

/** JSON avec commentaires, lu comme l'hôte le lit (commentaires retirés hors des chaînes). */
export function lireJsonc(texte) {
  let sortie = '';
  let i = 0;
  let chaine = false;
  const t = texte.replace(/^\uFEFF/, '');
  while (i < t.length) {
    const c = t[i];
    const s = t[i + 1];
    if (chaine) {
      sortie += c;
      if (c === '\\') {
        sortie += s ?? '';
        i += 2;
        continue;
      }
      if (c === '"') chaine = false;
      i++;
      continue;
    }
    if (c === '"') {
      chaine = true;
      sortie += c;
      i++;
      continue;
    }
    if (c === '/' && s === '/') {
      while (i < t.length && t[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && s === '*') {
      i += 2;
      while (i < t.length && !(t[i] === '*' && t[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    sortie += c;
    i++;
  }
  return JSON.parse(sortie);
}

/**
 * Fichier JSON : présence, lisibilité, données. Le message d'erreur du moteur JSON n'est jamais
 * repris : il peut citer un extrait du fichier, donc un secret ; seule sa position est rendue.
 */
function lireJson(chemin) {
  const texte = lireTexte(chemin);
  if (texte === null) return { present: estFichier(chemin), lisible: false, donnees: null };
  try {
    return { present: true, lisible: true, donnees: lireJsonc(texte) };
  } catch (e) {
    const position = /position (\d+)/.exec(String(e?.message))?.[1];
    let ou = '';
    if (position !== undefined) {
      const avant = texte.slice(0, Number(position));
      ou = ` (ligne ${avant.split('\n').length})`;
    }
    return { present: true, lisible: false, erreur: `JSON invalide${ou}`, donnees: null };
  }
}

function valeurA(objet, cheminPoints) {
  let courant = objet;
  for (const cle of cheminPoints.split('.')) {
    if (courant === null || typeof courant !== 'object' || !Object.hasOwn(courant, cle)) return undefined;
    courant = courant[cle];
  }
  return courant;
}

function compterLignes(texte) {
  if (!texte) return 0;
  return texte.split('\n').length - (texte.endsWith('\n') ? 1 : 0);
}

// ---------------------------------------------------------------------------------------------
// Secrets (D8) : noms seulement pour tout ce qui peut porter un secret, et un masquage par motifs
// appliqué à chaque chaîne de la sortie, en dernier recours.

const MOTIFS_SECRETS = [
  /AIza[0-9A-Za-z_-]{30,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /eyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}/g,
  /\bgh[pousr]_[A-Za-z0-9]{20,}/g,
  /\bgithub_pat_[A-Za-z0-9_]{20,}/g,
  /\bglpat-[A-Za-z0-9_-]{16,}/g,
  /\bxox[abprs]-[A-Za-z0-9-]{10,}/g,
  /\b[rs]k_(?:live|test)_[0-9A-Za-z]{16,}/g,
  /\bya29\.[0-9A-Za-z_-]{20,}/g,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?(?:-----END [A-Z ]*PRIVATE KEY-----|$)/g,
];
const MOTIF_URL_IDENTIFIANTS = /\b([a-z][a-z0-9+.-]*:\/\/)[^\s/@:'"]+(?::[^\s/@'"]*)?@/gi;
const MOTIF_REQUETE = /([?&](?:access_token|token|key|api_key|apikey|password|secret|sig|signature)=)[^&\s#'"]+/gi;
const MOTIF_PORTEUR = /\b(bearer|basic)\s+[A-Za-z0-9._~+/=-]{6,}/gi;
const MOTIF_OPTION = /(--?[A-Za-z0-9_-]*(?:token|key|secret|passw|pwd|auth)[A-Za-z0-9_-]*[=:])[^\s'"]+/gi;
const MOTIF_AFFECTATION = /\b([A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|PASSWD|API_KEY|APIKEY|ACCESS_KEY|PRIVATE_KEY|CREDENTIAL)[A-Z0-9_]*=)[^\s'"&]+/g;

/** Masque dans une chaîne tout ce qui ressemble à un secret. */
export function masquer(valeur) {
  if (typeof valeur !== 'string') return valeur;
  let v = valeur;
  for (const motif of MOTIFS_SECRETS) v = v.replace(motif, MASQUE);
  return v
    .replace(MOTIF_URL_IDENTIFIANTS, `$1${MASQUE}@`)
    .replace(MOTIF_REQUETE, `$1${MASQUE}`)
    .replace(MOTIF_PORTEUR, `$1 ${MASQUE}`)
    .replace(MOTIF_OPTION, `$1${MASQUE}`)
    .replace(MOTIF_AFFECTATION, `$1${MASQUE}`);
}

/** Nom (variable, clé, en-tête, option) qui annonce un secret. */
export const nomSensible = (nom) => /(key|token|secret|passw|pwd|auth|credential|private|cert|cookie|signature)/i.test(String(nom));

/** Arguments d'une commande : chacun masqué, et la valeur qui suit une option sensible remplacée. */
export function masquerArguments(args) {
  const sortie = [];
  let suivantSecret = false;
  for (const a of args ?? []) {
    const texte = String(a);
    if (suivantSecret) {
      sortie.push(MASQUE);
      suivantSecret = false;
      continue;
    }
    if (/^--?[A-Za-z0-9_-]+$/.test(texte) && nomSensible(texte)) suivantSecret = true;
    sortie.push(masquer(texte));
  }
  return sortie;
}

function masquerProfond(valeur) {
  if (typeof valeur === 'string') return masquer(valeur);
  if (Array.isArray(valeur)) return valeur.map(masquerProfond);
  if (valeur && typeof valeur === 'object') {
    const copie = {};
    for (const [cle, v] of Object.entries(valeur)) copie[cle] = masquerProfond(v);
    return copie;
  }
  return valeur;
}

// Variables d'environnement observées : valeur rendue (masquée) pour celles qui ne portent pas de
// secret ; présence seulement pour les autres. Toute autre variable est ignorée.
const VARIABLES_VALEUR = [
  'GEMINI_CLI', 'GEMINI_MODEL', 'GEMINI_SANDBOX', 'SANDBOX', 'GEMINI_SYSTEM_MD', 'GEMINI_WRITE_SYSTEM_MD',
  'GEMINI_CLI_HOME', 'GEMINI_CLI_TRUST_WORKSPACE', 'GEMINI_RESTRICTED_MODE', 'GEMINI_CLI_TRUSTED_FOLDERS_PATH',
  'GEMINI_CLI_SYSTEM_SETTINGS_PATH', 'GEMINI_CLI_SYSTEM_DEFAULTS_PATH', 'GEMINI_CLI_SURFACE',
  'GOOGLE_CLOUD_LOCATION', 'GOOGLE_GENAI_USE_VERTEXAI', 'GOOGLE_GENAI_USE_GCA',
  'GEMINI_TELEMETRY_ENABLED', 'GEMINI_TELEMETRY_TARGET', 'GEMINI_TELEMETRY_LOG_PROMPTS',
  'CI', 'GITHUB_ACTIONS', 'GEMINI_CLI_INTEGRATION_TEST',
];
const VARIABLES_PRESENCE = [
  'GEMINI_API_KEY', 'GOOGLE_API_KEY', 'GOOGLE_APPLICATION_CREDENTIALS', 'GOOGLE_CLOUD_PROJECT',
  'GOOGLE_GEMINI_BASE_URL', 'GOOGLE_VERTEX_BASE_URL', 'CODE_ASSIST_ENDPOINT',
  'GEMINI_TELEMETRY_OTLP_ENDPOINT', 'GEMINI_TELEMETRY_OTLP_HEADERS',
];

function observerVariables(env) {
  const resultat = {};
  for (const nom of VARIABLES_VALEUR) {
    if (env[nom] !== undefined && env[nom] !== '') resultat[nom] = { presente: true, valeur: masquer(env[nom]) };
  }
  for (const nom of VARIABLES_PRESENCE) {
    if (env[nom] !== undefined && env[nom] !== '') resultat[nom] = { presente: true };
  }
  return resultat;
}

// ---------------------------------------------------------------------------------------------
// Chemins de l'hôte, comme Gemini CLI les calcule.

/** Clé d'un projet dans projects.json : chemin résolu, en minuscules sous Windows. */
export function cleRegistre(chemin, plateforme = process.platform) {
  const absolu = resolve(chemin);
  return plateforme === 'win32' ? absolu.toLowerCase() : absolu;
}

/** Clé de comparaison pour la confiance : en minuscules sous Windows et macOS. */
export function cleConfiance(chemin, plateforme = process.platform) {
  const absolu = resolve(chemin);
  return plateforme === 'win32' || plateforme === 'darwin' ? absolu.toLowerCase() : absolu;
}

function estSousChemin(parent, enfant) {
  const r = relative(parent, enfant);
  return r === '' || (!r.startsWith('..') && !isAbsolute(r));
}

function dossierSystemeParDefaut(plateforme = process.platform) {
  if (plateforme === 'darwin') return '/Library/Application Support/GeminiCli';
  if (plateforme === 'win32') return 'C:\\ProgramData\\gemini-cli';
  return '/etc/gemini-cli';
}

function emplacements(options) {
  const env = options.env;
  const accueilEnv = env.GEMINI_CLI_HOME;
  const accueil = accueilEnv || (process.platform === 'win32' ? env.USERPROFILE : env.HOME) || homedir();
  const gemini = join(accueil, '.gemini');
  const execution = env.SANDBOX === 'sandbox-exec' ? join(accueil, '.cache', '.gemini') : gemini;
  const systeme = options.dossierSysteme ? resolve(options.dossierSysteme) : dossierSystemeParDefaut();
  const racine = resolve(options.racine ?? process.cwd());
  return {
    accueil,
    source_accueil: accueilEnv ? 'GEMINI_CLI_HOME' : 'système',
    gemini,
    execution,
    racine,
    racine_est_accueil: cleConfiance(cheminReel(racine)) === cleConfiance(cheminReel(accueil)),
    systeme,
    reglages_systeme: env.GEMINI_CLI_SYSTEM_SETTINGS_PATH || join(systeme, 'settings.json'),
    defauts_systeme: env.GEMINI_CLI_SYSTEM_DEFAULTS_PATH || join(systeme, 'system-defaults.json'),
    reglages_utilisateur: join(gemini, 'settings.json'),
    reglages_workspace: join(racine, '.gemini', 'settings.json'),
    dossiers_de_confiance: env.GEMINI_CLI_TRUSTED_FOLDERS_PATH || join(execution, 'trustedFolders.json'),
    registre_projets: join(execution, 'projects.json'),
    temporaire: join(execution, 'tmp'),
    agents_accueil: join(accueil, '.agents'),
  };
}

// ---------------------------------------------------------------------------------------------
// D2 : l'hôte. Qui exécute ce script, avec quel paquet, à quelle version.

function racinePaquetDepuis(fichier) {
  let d = dirname(fichier);
  for (let i = 0; i < 5; i++) {
    if (lireJson(join(d, 'package.json')).donnees?.name === PAQUET) return d;
    const parent = dirname(d);
    if (parent === d) break;
    d = parent;
  }
  return null;
}

function lireLigneDeCommande(pid) {
  const t = lireTexte(`/proc/${pid}/cmdline`);
  return t === null ? null : t.split('\0').filter((a) => a !== '');
}

function parentDe(pid) {
  const t = lireTexte(`/proc/${pid}/stat`);
  if (!t) return null;
  const champs = t.slice(t.lastIndexOf(')') + 2).split(' ');
  const ppid = Number(champs[1]);
  return Number.isInteger(ppid) && ppid > 1 ? ppid : null;
}

const OPTIONS_A_VALEUR_VISIBLE = new Set([
  '-m', '--model', '--approval-mode', '--policy', '--admin-policy', '-e', '--extensions',
  '--include-directories', '--output-format', '-o', '-r', '--resume', '--allowed-mcp-server-names', '--allowed-tools',
]);
const OPTIONS_DE_PROMPT = new Set(['-p', '--prompt', '-i', '--prompt-interactive']);

/** Arguments de lancement de l'hôte : options et valeurs utiles, texte des prompts jamais rendu. */
export function decrireArguments(args) {
  const sortie = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const [option, attachee] = a.startsWith('-') && a.includes('=') ? [a.slice(0, a.indexOf('=')), a.slice(a.indexOf('=') + 1)] : [a, undefined];
    if (OPTIONS_DE_PROMPT.has(option)) {
      const texte = attachee ?? (args[i + 1] !== undefined && !args[i + 1].startsWith('-') ? args[++i] : '');
      sortie.push(`${option} [texte masqué, ${texte.length} caractères]`);
    } else if (OPTIONS_A_VALEUR_VISIBLE.has(option)) {
      const valeur = attachee ?? (args[i + 1] !== undefined && !args[i + 1].startsWith('-') ? args[++i] : '');
      sortie.push(`${option} ${masquer(valeur)}`.trim());
    } else if (option.startsWith('-')) {
      sortie.push(attachee === undefined ? option : `${option}=[valeur non rendue]`);
    } else {
      sortie.push(`[argument masqué, ${a.length} caractères]`);
    }
  }
  return sortie;
}

/** Linux et WSL : remonte les processus parents jusqu'à celui de Gemini CLI, s'il y en a un. */
function paquetParProcessus() {
  if (process.platform !== 'linux') return null;
  let pid = parentDe(process.pid);
  for (let n = 0; pid && n < 16; n++) {
    const args = lireLigneDeCommande(pid) ?? [];
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (!isAbsolute(a) || !estFichier(a)) continue;
      const reel = cheminReel(a);
      if (!/gemini(\.js)?$/i.test(basename(reel))) continue;
      const racine = racinePaquetDepuis(reel);
      if (racine) return { racine, pid, arguments: decrireArguments(args.slice(i + 1)) };
    }
    pid = parentDe(pid);
  }
  return null;
}

/** Première commande `gemini` du PATH et son paquet : elle n'est pas forcément celle qui s'exécute. */
function paquetParPath(env) {
  const windows = process.platform === 'win32';
  const noms = windows ? ['gemini.cmd', 'gemini.ps1', 'gemini'] : ['gemini'];
  const chemins = (env.PATH ?? env.Path ?? '').split(windows ? ';' : ':').filter(Boolean);
  for (const d of chemins) {
    for (const n of noms) {
      const commande = join(d, n);
      if (!estFichier(commande)) continue;
      const reel = cheminReel(commande);
      let racine = /\.js$/i.test(reel) ? racinePaquetDepuis(reel) : null;
      if (!racine) {
        const voisin = join(d, 'node_modules', '@google', 'gemini-cli');
        if (lireJson(join(voisin, 'package.json')).donnees?.name === PAQUET) racine = voisin;
      }
      if (!racine) {
        const debut = lireDebut(reel, 4096) ?? '';
        const cible = /(?:[A-Za-z]:)?[^\s"'%$]*[\\/]@google[\\/]gemini-cli[\\/]bundle[\\/]gemini\.js/.exec(debut)?.[0];
        if (cible && isAbsolute(cible)) racine = racinePaquetDepuis(cible);
      }
      if (racine) return { racine, commande };
    }
  }
  return null;
}

function decrirePaquet(racine, source, nature) {
  const pj = lireJson(join(racine, 'package.json')).donnees ?? {};
  const docs = join(racine, 'bundle', 'docs');
  const integres = join(racine, 'bundle', 'builtin');
  return {
    racine,
    nom: pj.name ?? null,
    version: pj.version ?? null,
    source,
    nature,
    documentation: { dossier: docs, presente: estDossier(docs), fichiers: estDossier(docs) ? fichiersSous(docs, (n) => n.endsWith('.md')).length : 0 },
    skills_integres: entrees(integres).filter((e) => e.isDirectory() && estFichier(join(integres, e.name, 'SKILL.md'))).map((e) => e.name),
  };
}

/** Paquet de l'hôte : l'option l'emporte, puis le processus parent observé, puis le PATH (déduit). */
function trouverPaquet(options) {
  const processus = options.ancetres === false ? null : paquetParProcessus();
  if (options.paquet) {
    const racine = resolve(options.paquet);
    if (lireJson(join(racine, 'package.json')).donnees?.name !== PAQUET) {
      return { paquet: null, processus, ecart: `paquet_invalide : ${racine} n'est pas le paquet ${PAQUET}` };
    }
    const ecart = processus && cleConfiance(cheminReel(processus.racine)) !== cleConfiance(cheminReel(racine))
      ? `paquet_different : l'hôte en cours d'exécution vient de ${processus.racine}`
      : undefined;
    return { paquet: decrirePaquet(racine, 'option --paquet', 'déclaré'), processus, ecart };
  }
  if (processus) return { paquet: decrirePaquet(processus.racine, `processus parent ${processus.pid}`, 'observé'), processus };
  const path = paquetParPath(options.env);
  if (path) return { paquet: decrirePaquet(path.racine, `PATH : ${path.commande}`, 'déduit'), processus: null };
  return { paquet: null, processus: null };
}

function surWsl(env) {
  if (process.platform !== 'linux') return false;
  return /microsoft/i.test(lireTexte('/proc/sys/kernel/osrelease') ?? '') || Boolean(env.WSL_DISTRO_NAME);
}

/** Hôte non reconnu : dossiers cachés qui ressemblent à une configuration d'agents, sans les nommer. */
function candidatsGeneriques(lieux) {
  const dossiers = [];
  for (const base of [lieux.racine, lieux.accueil]) {
    for (const e of entrees(base)) {
      if (!e.isDirectory() || !e.name.startsWith('.') || e.name === '.git') continue;
      const d = join(base, e.name);
      const indices = ['skills', 'agents', 'commands', 'rules', 'prompts'].filter((s) => estDossier(join(d, s)));
      if (estFichier(join(d, 'settings.json'))) indices.push('settings.json');
      if (indices.length > 0) dossiers.push({ dossier: d, indices });
    }
  }
  const consignes = entrees(lieux.racine)
    .filter((e) => e.isFile() && /^[A-Z][A-Z0-9_-]*\.md$/.test(e.name) && !/^(README|CHANGELOG|LICENSE|CONTRIBUTING|SECURITY|CODE_OF_CONDUCT)\.md$/.test(e.name))
    .map((e) => join(lieux.racine, e.name));
  return { nature: 'déduit', dossiers_de_configuration: dossiers, fichiers_de_consignes: consignes };
}

function observerHote(options, contexte) {
  const { env } = options;
  const lieux = contexte.lieux;
  const { paquet, processus, ecart } = contexte.recherche;
  const indices = [];
  if (env.GEMINI_CLI === '1') indices.push({ moyen: 'variable GEMINI_CLI=1, posée par l\'hôte dans ses commandes', nature: 'observé' });
  if (processus) indices.push({ moyen: `processus parent ${processus.pid}`, nature: 'observé' });
  if (paquet && paquet.nature === 'déclaré') indices.push({ moyen: 'option --paquet', nature: 'déclaré' });
  if (paquet && paquet.nature === 'déduit') indices.push({ moyen: 'première commande gemini du PATH', nature: 'déduit' });
  const famille = indices.length > 0 ? 'gemini-cli' : 'inconnue';
  const nature = (n) => indices.some((i) => i.nature === n);
  const certitude = famille === 'inconnue' ? 'aucune' : nature('observé') ? 'observée' : nature('déclaré') ? 'déclarée' : 'déduite';
  const avertissements = [];
  if (env.GEMINI_CLI === '1' && !paquet) avertissements.push('paquet_introuvable : l\'hôte est Gemini CLI, mais son paquet n\'a pas été localisé (option --paquet)');
  if (ecart) avertissements.push(ecart);
  if (surWsl(env) && /^\/mnt\/[a-z]\//i.test(lieux.racine)) avertissements.push('racine_windows_depuis_wsl : la racine est sur le système de fichiers de Windows, lue depuis WSL');
  if (paquet && processus === null && paquet.nature === 'déduit' && env.GEMINI_CLI === '1') {
    avertissements.push('version_deduite : le paquet vient du PATH ; ce n\'est pas forcément celui qui s\'exécute');
  }
  return {
    famille,
    certitude,
    indices,
    lance_par_l_hote: env.GEMINI_CLI === '1',
    paquet,
    arguments_de_lancement: processus ? processus.arguments : null,
    bac_a_sable: env.SANDBOX ? { actif: true, nature: env.SANDBOX === 'sandbox-exec' ? 'sandbox-exec' : 'conteneur' } : { actif: false },
    plateforme: { os: process.platform, arch: arch(), node: process.versions.node, wsl: surWsl(env) },
    accueil: { dossier: lieux.accueil, source: lieux.source_accueil },
    racine: { dossier: lieux.racine, est_l_accueil: lieux.racine_est_accueil },
    generique: famille === 'inconnue' ? candidatsGeneriques(lieux) : null,
    avertissements,
  };
}

// ---------------------------------------------------------------------------------------------
// D3 : configuration. Couches de réglages, confiance, fichier .env, variables.

const CLES_OBSERVEES = [
  ['model.name', 'valeur'], ['model.compressionThreshold', 'valeur'], ['model.maxSessionTurns', 'valeur'],
  ['general.defaultApprovalMode', 'valeur'],
  ['general.sessionRetention.enabled', 'valeur'], ['general.sessionRetention.maxAge', 'valeur'], ['general.sessionRetention.maxCount', 'valeur'],
  ['context.fileName', 'valeur'], ['context.memoryBoundaryMarkers', 'valeur'], ['context.includeDirectoryTree', 'valeur'],
  ['context.includeDirectories', 'valeur'], ['context.loadMemoryFromIncludeDirectories', 'valeur'], ['context.discoveryMaxDirs', 'valeur'],
  ['context.fileFiltering.respectGitIgnore', 'valeur'], ['context.fileFiltering.respectGeminiIgnore', 'valeur'],
  ['security.folderTrust.enabled', 'valeur'], ['security.environmentVariableRedaction.enabled', 'valeur'],
  ['security.auth.selectedType', 'valeur'], ['security.allowedEnvironmentVariables', 'valeur'], ['security.blockedEnvironmentVariables', 'valeur'],
  ['tools.sandbox', 'valeur'], ['tools.core', 'valeur'], ['tools.exclude', 'valeur'], ['tools.discoveryCommand', 'presence'],
  ['skills.enabled', 'valeur'], ['skills.disabled', 'valeur'],
  ['hooksConfig.enabled', 'valeur'], ['hooksConfig.disabled', 'valeur'],
  ['mcp.allowed', 'valeur'], ['mcp.excluded', 'valeur'], ['mcp.serverCommand', 'presence'],
  ['agents.overrides', 'agents'], ['experimental', 'drapeaux'],
  ['admin.secureModeEnabled', 'valeur'], ['admin.extensions.enabled', 'valeur'], ['admin.mcp.enabled', 'valeur'], ['admin.skills.enabled', 'valeur'],
  ['telemetry.enabled', 'valeur'], ['telemetry.target', 'valeur'], ['telemetry.logPrompts', 'valeur'], ['telemetry.otlpEndpoint', 'presence'],
  ['privacy.usageStatisticsEnabled', 'valeur'], ['general.enableAutoUpdate', 'valeur'], ['general.enableAutoUpdateNotification', 'valeur'],
  ['policyPaths', 'valeur'], ['adminPolicyPaths', 'valeur'],
  ['advanced.ignoreLocalEnv', 'valeur'], ['advanced.excludedEnvVars', 'valeur'],
];

function rendreValeur(valeur, nature) {
  if (nature === 'presence') return 'défini';
  if (nature === 'agents') {
    const r = {};
    for (const [nom, conf] of Object.entries(valeur ?? {})) r[nom] = { enabled: typeof conf?.enabled === 'boolean' ? conf.enabled : 'non précisé' };
    return r;
  }
  if (nature === 'drapeaux') {
    const r = {};
    for (const [nom, v] of Object.entries(valeur ?? {})) r[nom] = typeof v === 'boolean' || typeof v === 'number' ? v : 'défini';
    return r;
  }
  return masquerProfond(valeur);
}

function chargerCouches(lieux) {
  const definitions = [
    ['défauts système', lieux.defauts_systeme],
    ['utilisateur', lieux.reglages_utilisateur],
    ['workspace', lieux.reglages_workspace],
    ['système', lieux.reglages_systeme],
  ];
  return definitions.map(([portee, chemin]) => {
    const lu = lireJson(chemin);
    return { portee, chemin, present: lu.present, lisible: lu.lisible, erreur: lu.erreur, donnees: lu.donnees };
  });
}

/** Valeur effective d'une clé : la couche la plus haute qui la définit (défauts système < utilisateur < workspace < système). */
function effective(couches, cle) {
  for (const couche of [...couches].reverse()) {
    if (!couche.prise_en_compte || !couche.donnees) continue;
    const v = valeurA(couche.donnees, cle);
    if (v !== undefined) return { valeur: v, source: couche.portee };
  }
  return undefined;
}

/** Confiance du dossier, dans l'ordre de l'hôte : variables, réglage, IDE (non observable), fichier. */
function evaluerConfiance(lieux, couches, env) {
  const fichier = lieux.dossiers_de_confiance;
  if (env.GEMINI_RESTRICTED_MODE === 'true' || env.GEMINI_CLI_TRUST_WORKSPACE === 'false') {
    return { verdict: 'non', source: 'variable d\'environnement', fichier };
  }
  if (env.GEMINI_CLI_TRUST_WORKSPACE === 'true') return { verdict: 'oui', source: 'variable d\'environnement', fichier };
  const sansWorkspace = couches.map((c) => ({ ...c, prise_en_compte: c.portee !== 'workspace' }));
  const active = effective(sansWorkspace, 'security.folderTrust.enabled');
  if (active && active.valeur === false) return { verdict: 'oui', source: `réglage security.folderTrust.enabled = false (${active.source})`, fichier };
  const lu = lireJson(fichier);
  const note = 'un IDE compagnon connecté peut imposer sa propre confiance : non observable par le script';
  if (!lu.present) return { verdict: 'indéterminée', source: null, fichier, fichier_present: false, note };
  if (!lu.lisible) return { verdict: 'indéterminée', source: null, fichier, fichier_present: true, erreur: lu.erreur, note };
  const cible = cleConfiance(cheminReel(lieux.racine));
  let meilleure = null;
  for (const [regle, niveau] of Object.entries(lu.donnees ?? {})) {
    if (!['TRUST_FOLDER', 'TRUST_PARENT', 'DO_NOT_TRUST'].includes(niveau)) continue;
    const effectif = niveau === 'TRUST_PARENT' ? dirname(regle) : regle;
    if (estSousChemin(cleConfiance(cheminReel(effectif)), cible) && (!meilleure || regle.length > meilleure.regle.length)) {
      meilleure = { regle, niveau };
    }
  }
  if (!meilleure) return { verdict: 'indéterminée', source: null, fichier, fichier_present: true, note };
  return { verdict: meilleure.niveau === 'DO_NOT_TRUST' ? 'non' : 'oui', source: 'fichier des dossiers de confiance', regle: meilleure, fichier, note };
}

function lireVariablesEnv(chemin) {
  const texte = lireTexte(chemin) ?? '';
  const variables = [];
  for (const ligne of texte.split(/\r?\n/)) {
    const m = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(ligne);
    if (!m) continue;
    const brute = m[2].trim().replace(/^(['"])(.*)\1$/, '$2');
    variables.push(VARIABLES_VALEUR.includes(m[1]) && !nomSensible(m[1]) ? { nom: m[1], valeur: masquer(brute) } : { nom: m[1] });
  }
  return variables;
}

/** Fichier .env que l'hôte chargerait (logique de Gemini CLI 0.67.0, relue dans son code). */
function trouverFichierEnv(lieux, fiable, ignorerLocal) {
  let d = lieux.racine;
  for (;;) {
    if (fiable && estFichier(join(d, '.gemini', '.env'))) return join(d, '.gemini', '.env');
    if (estFichier(join(d, '.env')) && (!ignorerLocal || cleConfiance(d) === cleConfiance(lieux.accueil))) return join(d, '.env');
    const parent = dirname(d);
    if (parent === d) break;
    d = parent;
  }
  if (fiable && estFichier(join(lieux.accueil, '.gemini', '.env'))) return join(lieux.accueil, '.gemini', '.env');
  if (estFichier(join(lieux.accueil, '.env'))) return join(lieux.accueil, '.env');
  return null;
}

function preparerConfiguration(options, lieux) {
  const couches = chargerCouches(lieux);
  const confiance = evaluerConfiance(lieux, couches, options.env);
  for (const c of couches) {
    if (c.portee === 'workspace' && lieux.racine_est_accueil) {
      c.prise_en_compte = false;
      c.raison = 'la racine est le dossier d\'accueil : ses réglages sont ceux de l\'utilisateur';
    } else if (c.portee === 'workspace' && confiance.verdict === 'non') {
      c.prise_en_compte = false;
      c.raison = 'dossier non fiable : l\'hôte ignore les réglages du workspace';
    } else {
      c.prise_en_compte = c.lisible;
    }
  }
  return { couches, confiance };
}

function observerConfiguration(options, contexte) {
  const { couches, confiance } = contexte.configuration;
  const lieux = contexte.lieux;
  const effectifs = {};
  for (const [cle, nature] of CLES_OBSERVEES) {
    const e = effective(couches, cle);
    if (e !== undefined) effectifs[cle] = { valeur: rendreValeur(e.valeur, nature), source: e.source };
  }
  const env = options.env;
  const ignorerLocal = effective(couches, 'advanced.ignoreLocalEnv')?.valeur === true;
  const fichierEnv = trouverFichierEnv(lieux, confiance.verdict === 'oui', ignorerLocal);
  const surcharges = {};
  for (const [variable, cle] of [['GEMINI_MODEL', 'model.name'], ['GEMINI_SANDBOX', 'tools.sandbox'], ['GEMINI_SYSTEM_MD', 'prompt système']]) {
    if (env[variable]) surcharges[variable] = { valeur: masquer(env[variable]), remplace: cle };
  }
  const redaction = effective(couches, 'security.environmentVariableRedaction.enabled')?.valeur === true || Boolean(env.GITHUB_SHA);
  return {
    couches: couches.map((c) => ({
      portee: c.portee,
      chemin: c.chemin,
      present: c.present,
      lisible: c.lisible,
      ...(c.erreur ? { erreur: c.erreur } : {}),
      prise_en_compte: c.prise_en_compte,
      ...(c.raison ? { raison: c.raison } : {}),
      cles_racine: c.donnees && typeof c.donnees === 'object' ? Object.keys(c.donnees).sort() : [],
    })),
    regle_de_fusion: 'pour chaque clé, la couche la plus haute qui la définit : défauts système < utilisateur < workspace < système ; certaines listes sont fusionnées par l\'hôte (voir sa documentation)',
    effectifs,
    surcharges_environnement: surcharges,
    confiance,
    fichier_env: fichierEnv
      ? { chemin: fichierEnv, nature: 'déduit', variables: lireVariablesEnv(fichierEnv) }
      : { chemin: null, nature: 'déduit' },
    variables: observerVariables(env),
    note_variables: options.env.GEMINI_CLI === '1' && redaction
      ? 'l\'hôte retire des commandes qu\'il lance les variables jugées sensibles : une variable absente ici peut exister pour lui'
      : null,
  };
}

// ---------------------------------------------------------------------------------------------
// En-têtes YAML (skills, agents) et TOML (commandes, politiques), lus de façon minimale.

const nettoyer = (s) => s.trim().replace(/^(['"])(.*)\1$/, '$2');

export function lireEnTete(texte) {
  const m = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(texte ?? '');
  if (!m) return null;
  const champs = {};
  let liste = null;
  let bloc = null;
  for (const ligne of m[1].split(/\r?\n/)) {
    if (bloc && /^\s+\S/.test(ligne)) {
      champs[bloc] = `${champs[bloc]} ${ligne.trim()}`.trim();
      continue;
    }
    bloc = null;
    const element = /^\s+-\s+(.*)$/.exec(ligne);
    if (element && liste) {
      champs[liste].push(nettoyer(element[1]));
      continue;
    }
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(ligne);
    if (!kv) continue;
    liste = null;
    const [, cle, brut] = kv;
    if (brut === '') {
      champs[cle] = [];
      liste = cle;
    } else if (/^[>|][+-]?$/.test(brut)) {
      champs[cle] = '';
      bloc = cle;
    } else if (/^\[.*\]$/.test(brut)) {
      champs[cle] = brut.slice(1, -1).split(',').map(nettoyer).filter(Boolean);
    } else {
      champs[cle] = nettoyer(brut);
    }
  }
  return champs;
}

const tronquer = (texte, n = 200) => (typeof texte === 'string' && texte.length > n ? `${texte.slice(0, n - 1)}…` : texte);

function descriptionToml(texte) {
  const m = /^\s*description\s*=\s*(?:"((?:[^"\\\n]|\\.)*)"|'([^'\n]*)')/m.exec(texte ?? '');
  return m ? (m[1] ?? m[2]) : null;
}

// ---------------------------------------------------------------------------------------------
// D4 : composants. Skills, sous-agents, commandes, extensions, serveurs MCP, hooks, politiques.

function listerExtensions(lieux) {
  const dossier = join(lieux.gemini, 'extensions');
  return entrees(dossier)
    .filter((e) => e.isDirectory() && estFichier(join(dossier, e.name, 'gemini-extension.json')))
    .map((e) => {
      const d = join(dossier, e.name);
      const lu = lireJson(join(d, 'gemini-extension.json'));
      return { dossier: d, nom_dossier: e.name, lu };
    });
}

function decrireSkill(dossierSkill, portee, emplacement) {
  const chemin = join(dossierSkill, 'SKILL.md');
  const entete = lireEnTete(lireTexte(chemin));
  const ecarts = [];
  if (!entete) ecarts.push('en-tête YAML absent');
  else {
    if (!entete.name) ecarts.push('champ name absent');
    if (!entete.description) ecarts.push('champ description absent');
    if (entete.name && entete.name !== basename(dossierSkill)) ecarts.push(`dossier « ${basename(dossierSkill)} » différent du nom « ${entete.name} »`);
  }
  return { nom: entete?.name || basename(dossierSkill), description: tronquer(entete?.description ?? null), portee, emplacement: chemin, source: emplacement, ecarts };
}

function skillsDe(dossier, portee) {
  return entrees(dossier)
    .filter((e) => e.isDirectory() && estFichier(join(dossier, e.name, 'SKILL.md')))
    .map((e) => decrireSkill(join(dossier, e.name), portee, dossier));
}

function observerSkills(contexte) {
  const { lieux, paquet, extensions, fiable, couches } = contexte;
  const paliers = [];
  if (paquet) paliers.push(...skillsDe(join(paquet.racine, 'bundle', 'builtin'), 'intégré'));
  for (const ext of extensions) paliers.push(...skillsDe(join(ext.dossier, 'skills'), `extension ${ext.nom_dossier}`));
  paliers.push(...skillsDe(join(lieux.gemini, 'skills'), 'utilisateur'));
  paliers.push(...skillsDe(join(lieux.agents_accueil, 'skills'), 'utilisateur (.agents)'));
  const workspace = [...skillsDe(join(lieux.racine, '.gemini', 'skills'), 'workspace'), ...skillsDe(join(lieux.racine, '.agents', 'skills'), 'workspace (.agents)')];
  if (!lieux.racine_est_accueil) paliers.push(...workspace);
  const desactives = new Set(effective(couches, 'skills.disabled')?.valeur ?? []);
  const retenu = new Map();
  for (const s of paliers) {
    if (s.portee.startsWith('workspace') && !fiable) s.ignore = 'dossier non fiable';
    if (desactives.has(s.nom)) s.desactive = true;
  }
  for (const s of paliers) if (!s.ignore) retenu.set(s.nom, s);
  for (const s of paliers) {
    const gagnant = retenu.get(s.nom);
    if (!s.ignore && gagnant !== s) s.masque_par = gagnant.emplacement;
  }
  return paliers;
}

function decrireAgent(chemin, portee, overrides) {
  const entete = lireEnTete(lireTexte(chemin));
  const ecarts = [];
  if (!entete) ecarts.push('en-tête YAML absent');
  else {
    if (!entete.name) ecarts.push('champ name absent');
    else if (!/^[a-z0-9_-]+$/.test(entete.name)) ecarts.push('name : minuscules, chiffres, - et _ seulement');
    if (!entete.description) ecarts.push('champ description absent');
  }
  const nom = entete?.name || basename(chemin, '.md');
  const override = overrides?.[nom];
  return {
    nom,
    description: tronquer(entete?.description ?? null),
    portee,
    fichier: chemin,
    nature: entete?.kind ?? 'local',
    outils: entete?.tools ?? 'hérités de la session',
    modele: entete?.model ?? 'hérité',
    ...(override && typeof override.enabled === 'boolean' ? { active: override.enabled } : {}),
    ecarts,
  };
}

function observerSousAgents(contexte) {
  const { lieux, extensions, fiable, couches } = contexte;
  const overrides = effective(couches, 'agents.overrides')?.valeur ?? {};
  const agents = [];
  const de = (dossier, portee) => entrees(dossier).filter((e) => e.isFile() && e.name.endsWith('.md')).map((e) => decrireAgent(join(dossier, e.name), portee, overrides));
  for (const ext of extensions) agents.push(...de(join(ext.dossier, 'agents'), `extension ${ext.nom_dossier}`));
  agents.push(...de(join(lieux.gemini, 'agents'), 'utilisateur'));
  if (!lieux.racine_est_accueil) {
    for (const a of de(join(lieux.racine, '.gemini', 'agents'), 'workspace')) {
      if (!fiable) a.ignore = 'dossier non fiable';
      agents.push(a);
    }
  }
  return agents;
}

function observerCommandes(contexte) {
  const { lieux, extensions, fiable } = contexte;
  const commandes = [];
  const de = (dossier, portee) =>
    fichiersSous(dossier, (n) => n.endsWith('.toml')).map((rel) => {
      const texte = lireTexte(join(dossier, ...rel.split('/')));
      return {
        commande: `/${rel.replace(/\.toml$/, '').split('/').join(':')}`,
        description: tronquer(descriptionToml(texte)),
        portee,
        fichier: join(dossier, ...rel.split('/')),
        prompt_defini: /^\s*prompt\s*=/m.test(texte ?? ''),
      };
    });
  for (const ext of extensions) commandes.push(...de(join(ext.dossier, 'commands'), `extension ${ext.nom_dossier}`));
  commandes.push(...de(join(lieux.gemini, 'commands'), 'utilisateur'));
  if (!lieux.racine_est_accueil) commandes.push(...de(join(lieux.racine, '.gemini', 'commands'), 'workspace'));
  const retenu = new Map();
  for (const c of commandes) {
    if (!fiable) c.ignore = 'dossier non fiable : l\'hôte ne charge aucune commande personnalisée';
    else retenu.set(c.commande, c);
  }
  for (const c of commandes) {
    const gagnant = retenu.get(c.commande);
    if (!c.ignore && gagnant !== c) c.masquee_par = gagnant.fichier;
  }
  return commandes;
}

function decrireServeurMcp(nom, conf, origine) {
  const transport = conf?.httpUrl ? 'http' : conf?.url ? 'sse' : conf?.command ? 'stdio' : 'inconnu';
  return {
    nom,
    origine,
    transport,
    ...(conf?.command ? { commande: basename(String(conf.command)), arguments: masquerArguments(conf.args) } : {}),
    ...(conf?.url || conf?.httpUrl ? { adresse: masquer(String(conf.httpUrl ?? conf.url)) } : {}),
    variables: Object.keys(conf?.env ?? {}).sort(),
    en_tetes: Object.keys(conf?.headers ?? {}).sort(),
    ...(conf?.trust !== undefined ? { trust: conf.trust === true } : {}),
    ...(conf?.includeTools ? { includeTools: conf.includeTools } : {}),
    ...(conf?.excludeTools ? { excludeTools: conf.excludeTools } : {}),
  };
}

function observerServeursMcp(contexte) {
  const { couches, extensions, fiable } = contexte;
  const serveurs = [];
  for (const ext of extensions) {
    for (const [nom, conf] of Object.entries(ext.lu.donnees?.mcpServers ?? {})) serveurs.push(decrireServeurMcp(nom, conf, `extension ${ext.nom_dossier}`));
  }
  for (const c of couches) {
    for (const [nom, conf] of Object.entries(c.donnees?.mcpServers ?? {})) {
      const s = decrireServeurMcp(nom, conf, `réglages ${c.portee}`);
      if (!c.prise_en_compte) s.ignore = c.raison ?? 'couche non prise en compte';
      serveurs.push(s);
    }
  }
  const autorises = effective(couches, 'mcp.allowed')?.valeur;
  const exclus = effective(couches, 'mcp.excluded')?.valeur;
  for (const s of serveurs) {
    if (Array.isArray(exclus) && exclus.includes(s.nom)) s.exclu = 'mcp.excluded';
    if (Array.isArray(autorises) && !autorises.includes(s.nom)) s.exclu = 'absent de mcp.allowed';
  }
  return {
    serveurs,
    note: fiable ? null : 'dossier non fiable : l\'hôte ne connecte aucun serveur MCP',
  };
}

function decrireHooks(hooks, origine) {
  const resultat = [];
  for (const [evenement, groupes] of Object.entries(hooks ?? {})) {
    if (!Array.isArray(groupes)) continue;
    for (const groupe of groupes) {
      for (const h of groupe?.hooks ?? []) {
        resultat.push({
          evenement,
          origine,
          nom: h?.name ?? null,
          type: h?.type ?? null,
          ...(groupe?.matcher ? { filtre: masquer(String(groupe.matcher)) } : {}),
          commande: tronquer(masquer(String(h?.command ?? '')), 120),
        });
      }
    }
  }
  return resultat;
}

function observerHooks(contexte) {
  const { couches, extensions } = contexte;
  const hooks = [];
  for (const ext of extensions) hooks.push(...decrireHooks(lireJson(join(ext.dossier, 'hooks', 'hooks.json')).donnees?.hooks, `extension ${ext.nom_dossier}`));
  for (const c of couches) {
    const liste = decrireHooks(c.donnees?.hooks, `réglages ${c.portee}`);
    for (const h of liste) if (!c.prise_en_compte) h.ignore = c.raison ?? 'couche non prise en compte';
    hooks.push(...liste);
  }
  return { actives: effective(couches, 'hooksConfig.enabled')?.valeur ?? 'non précisé (défaut de l\'hôte)', hooks };
}

function decrirePolitique(chemin, palier) {
  const texte = lireTexte(chemin) ?? '';
  const decisions = { allow: 0, deny: 0, ask_user: 0 };
  for (const m of texte.matchAll(/^\s*(?:decision|action)\s*=\s*"(allow|deny|ask_user)"/gm)) decisions[m[1]]++;
  const outils = new Set();
  for (const m of texte.matchAll(/^\s*toolName\s*=\s*(?:"([^"]+)"|\[([^\]]*)\])/gm)) {
    for (const o of (m[1] ?? m[2]).split(',')) if (nettoyer(o)) outils.add(nettoyer(o));
  }
  if (/^\s*command(?:Prefix|Regex)\s*=/m.test(texte)) outils.add('run_shell_command');
  const modes = new Set();
  for (const m of texte.matchAll(/^\s*modes\s*=\s*\[([^\]]*)\]/gm)) for (const x of m[1].split(',')) if (nettoyer(x)) modes.add(nettoyer(x));
  const sousAgents = new Set([...texte.matchAll(/^\s*subagent\s*=\s*"([^"]+)"/gm)].map((m) => m[1]));
  return {
    fichier: chemin,
    palier,
    regles: [...texte.matchAll(/^\s*\[\[\s*rules?\s*\]\]/gm)].length,
    decisions,
    outils: [...outils].sort(),
    modes: [...modes].sort(),
    sous_agents: [...sousAgents].sort(),
    ...(basename(chemin) === 'auto-saved.toml' ? { approbations_enregistrees: true } : {}),
  };
}

function observerPolitiques(contexte) {
  const { lieux, extensions, couches } = contexte;
  const fichiers = [];
  const de = (dossier, palier) => entrees(dossier).filter((e) => e.isFile() && e.name.endsWith('.toml')).map((e) => decrirePolitique(join(dossier, e.name), palier));
  fichiers.push(...de(join(lieux.systeme, 'policies'), 'administrateur'));
  fichiers.push(...de(join(lieux.gemini, 'policies'), 'utilisateur'));
  if (!lieux.racine_est_accueil) fichiers.push(...de(join(lieux.racine, '.gemini', 'policies'), 'workspace'));
  for (const ext of extensions) fichiers.push(...de(join(ext.dossier, 'policies'), `extension ${ext.nom_dossier}`));
  for (const [cle, palier] of [['policyPaths', 'utilisateur (policyPaths)'], ['adminPolicyPaths', 'administrateur (adminPolicyPaths)']]) {
    for (const p of effective(couches, cle)?.valeur ?? []) {
      const chemin = resolve(lieux.racine, String(p));
      if (estDossier(chemin)) fichiers.push(...de(chemin, palier));
      else if (estFichier(chemin)) fichiers.push(decrirePolitique(chemin, palier));
    }
  }
  return {
    fichiers,
    note: 'le palier du workspace et la priorité de chaque palier se lisent dans la documentation de la version installée (reference/policy-engine.md)',
  };
}

function observerExtensions(contexte) {
  return contexte.extensions.map((ext) => {
    const m = ext.lu.donnees ?? {};
    const installation = lireJson(join(ext.dossier, '.gemini-extension-install.json')).donnees;
    return {
      nom: m.name ?? ext.nom_dossier,
      version: m.version ?? null,
      dossier: ext.dossier,
      lisible: ext.lu.lisible,
      description: tronquer(m.description ?? null),
      serveurs_mcp: Object.keys(m.mcpServers ?? {}).sort(),
      fichier_de_contexte: m.contextFileName ?? (estFichier(join(ext.dossier, 'GEMINI.md')) ? 'GEMINI.md' : null),
      excludeTools: m.excludeTools ?? [],
      contient: ['commands', 'skills', 'agents', 'policies', 'hooks'].filter((d) => estDossier(join(ext.dossier, d))),
      ...(installation?.source ? { source: masquer(String(installation.source)) } : {}),
    };
  });
}

function observerIgnores(lieux) {
  const depot = contexteDepot(lieux.racine, ['.git']);
  return {
    geminiignore: estFichier(join(lieux.racine, '.geminiignore')) ? join(lieux.racine, '.geminiignore') : null,
    gitignore: estFichier(join(lieux.racine, '.gitignore')) ? join(lieux.racine, '.gitignore') : null,
    exclusion_git: depot && estFichier(join(depot, '.git', 'info', 'exclude')) ? join(depot, '.git', 'info', 'exclude') : null,
  };
}

function observerComposants(options, contexte) {
  const max = options.max;
  const borne = (liste, etiquette) => {
    if (liste.length > max) contexte.troncatures.push(`${etiquette} : ${liste.length} éléments, ${max} rendus`);
    return liste.slice(0, max);
  };
  const mcp = observerServeursMcp(contexte);
  const hooks = observerHooks(contexte);
  const politiques = observerPolitiques(contexte);
  return {
    confiance: contexte.configuration.confiance.verdict,
    skills: borne(observerSkills(contexte), 'composants.skills'),
    sous_agents: borne(observerSousAgents(contexte), 'composants.sous_agents'),
    note_sous_agents: 'les sous-agents intégrés vivent dans le code de l\'hôte : la section « Available Sub-Agents » du prompt système et /agents list les montrent',
    commandes: borne(observerCommandes(contexte), 'composants.commandes'),
    extensions: borne(observerExtensions(contexte), 'composants.extensions'),
    activation_des_extensions: estFichier(join(contexte.lieux.gemini, 'extensions', 'extension-enablement.json')) ? 'fichier présent : /extensions list fait foi' : null,
    serveurs_mcp: { ...mcp, serveurs: borne(mcp.serveurs, 'composants.serveurs_mcp') },
    hooks: { ...hooks, hooks: borne(hooks.hooks, 'composants.hooks') },
    politiques: { ...politiques, fichiers: borne(politiques.fichiers, 'composants.politiques') },
    fichiers_d_exclusion: observerIgnores(contexte.lieux),
  };
}

// ---------------------------------------------------------------------------------------------
// D5 : contexte. Fichiers de contexte, mémoire privée du projet, trace de la dernière session,
// prompt système exporté par le développeur.

function contexteDepot(depart, marqueurs) {
  if (marqueurs.length === 0) return null;
  let d = resolve(depart);
  for (;;) {
    for (const m of marqueurs) {
      if (isAbsolute(m) || m.includes('..')) continue;
      if (etat(join(d, m))) return d;
    }
    const parent = dirname(d);
    if (parent === d) return null;
    d = parent;
  }
}

function importsDe(texte, dossier) {
  const imports = [];
  let dansBloc = false;
  for (const ligne of (texte ?? '').split('\n')) {
    if (ligne.trimStart().startsWith(CLOTURE)) {
      dansBloc = !dansBloc;
      continue;
    }
    if (dansBloc) continue;
    for (const m of ligne.matchAll(/(?:^|\s)@([./A-Za-z][^\s]*)/g)) {
      const cible = m[1];
      if (!/[./\\]/.test(cible)) continue;
      imports.push({ cible, existe: estFichier(resolve(dossier, cible)) });
    }
  }
  return imports;
}

function decrireFichierContexte(chemin) {
  const texte = lireTexte(chemin);
  return { chemin, octets: Buffer.byteLength(texte ?? '', 'utf8'), lignes: compterLignes(texte), imports: importsDe(texte, dirname(chemin)) };
}

function nomsDeContexte(couches) {
  const e = effective(couches, 'context.fileName');
  if (e === undefined) return { noms: ['GEMINI.md'], source: 'défaut documenté de l\'hôte' };
  const noms = (Array.isArray(e.valeur) ? e.valeur : [e.valeur]).filter((n) => typeof n === 'string' && n !== '');
  return { noms: noms.length > 0 ? noms : ['GEMINI.md'], source: `réglages ${e.source}` };
}

const DOSSIERS_SAUTES = new Set(['.git', 'node_modules', 'target', 'dist', 'build', 'vendor', '.venv', '__pycache__']);

function fichiersALaDemande(racine, noms, max) {
  const trouves = [];
  const file = [racine];
  let examines = 0;
  while (file.length > 0 && examines < 2000) {
    const d = file.shift();
    examines++;
    for (const e of entrees(d)) {
      const chemin = join(d, e.name);
      if (e.isDirectory() && !DOSSIERS_SAUTES.has(e.name)) file.push(chemin);
      else if (e.isFile() && d !== racine && noms.includes(e.name)) trouves.push(chemin);
    }
  }
  return { nature: 'déduit', fichiers: trouves.slice(0, max), total: trouves.length, dossiers_examines: examines, tronque: file.length > 0 || trouves.length > max };
}

function identifiantProjet(lieux) {
  const lu = lireJson(lieux.registre_projets);
  const projets = lu.donnees?.projects;
  if (!projets || typeof projets !== 'object') return { identifiant: null, registre: lieux.registre_projets, present: lu.present };
  const cle = cleRegistre(lieux.racine);
  return { identifiant: typeof projets[cle] === 'string' ? projets[cle] : null, registre: lieux.registre_projets, present: true };
}

function texteSessionContext(fichier) {
  const debut = lireDebut(fichier, 512 * 1024) ?? '';
  const candidats = [];
  if (fichier.endsWith('.jsonl')) {
    for (const ligne of debut.split('\n').slice(0, 40)) {
      try {
        candidats.push(JSON.parse(ligne));
      } catch {
        // ligne tronquée ou non JSON : ignorée
      }
    }
  } else {
    try {
      candidats.push(...(JSON.parse(debut).messages ?? []));
    } catch {
      // fichier plus grand que la lecture bornée : rien n'est rendu
    }
  }
  for (const o of candidats) {
    const parties = Array.isArray(o?.content) ? o.content : Array.isArray(o?.parts) ? o.parts : [];
    const texte = parties.map((p) => (typeof p?.text === 'string' ? p.text : '')).join('\n');
    if (texte.includes('<session_context>')) return { texte, debut: candidats[0]?.startTime ?? null };
  }
  return null;
}

/** Balises de contexte posées par l'hôte (`<session_context>`, `<global_context>`…), jamais le texte qu'elles entourent. */
function balisesDeContexte(texte) {
  return [...new Set([...texte.matchAll(/<([a-z_]+_context|user_project_memory)>/g)].map((m) => m[1]))].slice(0, 20);
}

/** Dernière session du projet : seuls les chemins et les balises du message d'ouverture sont rendus. */
function traceDerniereSession(lieux, identifiant, max) {
  if (!identifiant) return null;
  const dossier = join(lieux.temporaire, identifiant, 'chats');
  const sessions = entrees(dossier)
    .filter((e) => e.isFile() && /^session-.*\.jsonl?$/.test(e.name))
    .map((e) => ({ chemin: join(dossier, e.name), date: etat(join(dossier, e.name))?.mtimeMs ?? 0 }))
    .sort((a, b) => b.date - a.date);
  if (sessions.length === 0) return { dossier, sessions: 0 };
  const plusRecente = sessions[0].chemin;
  const lu = texteSessionContext(plusRecente);
  if (!lu) return { dossier, sessions: sessions.length, fichier: plusRecente, message_d_ouverture: false };
  const charges = [...lu.texte.matchAll(/^--- Context from: (.+) ---$/gm)].map((m) => m[1]);
  const espaces = [];
  const apres = lu.texte.split('- **Workspace Directories:**')[1] ?? '';
  for (const ligne of apres.split('\n').slice(1)) {
    const m = /^ {2}- (.+)$/.exec(ligne);
    if (!m) break;
    espaces.push(m[1]);
  }
  return {
    dossier,
    sessions: sessions.length,
    fichier: plusRecente,
    nature: 'observé',
    note: 'session la plus récemment modifiée du projet : pas forcément celle de la conversation en cours',
    debut: lu.debut,
    message_d_ouverture: true,
    balises: balisesDeContexte(lu.texte),
    dossiers_workspace: espaces.slice(0, max),
    arborescence_incluse: lu.texte.includes('- **Directory Structure:**'),
    fichiers_de_contexte_charges: charges.slice(0, max),
  };
}

function analyserPromptSysteme(fichier, max) {
  const texte = lireTexte(fichier);
  if (texte === null) throw new Echec(CODES.INTROUVABLE, `prompt système exporté introuvable : ${fichier}`);
  const titres = [];
  let dansBloc = false;
  for (const ligne of texte.split('\n')) {
    if (ligne.trimStart().startsWith(CLOTURE)) dansBloc = !dansBloc;
    else if (!dansBloc && /^#{1,2} \S/.test(ligne)) titres.push(ligne.trim());
  }
  const skills = [...texte.matchAll(/<skill>\s*<name>([^<]*)<\/name>[\s\S]*?<location>([^<]*)<\/location>\s*<\/skill>/g)].map((m) => ({ nom: m[1].trim(), emplacement: m[2].trim() }));
  const sousAgents = [];
  const section = texte.split(/^# Available Sub-Agents\s*$/m)[1]?.split(/^# /m)[0] ?? '';
  for (const m of section.matchAll(/^- ([A-Za-z0-9_-]+) -> /gm)) sousAgents.push(m[1]);
  for (const m of section.matchAll(/<subagent>\s*<name>([^<]+)<\/name>/g)) sousAgents.push(m[1].trim());
  return {
    fichier,
    nature: 'observé',
    caracteres: texte.length,
    titres: titres.slice(0, 80),
    skills: skills.slice(0, max),
    sous_agents: sousAgents.slice(0, max),
    balises: balisesDeContexte(texte),
    fichiers_de_contexte: [...texte.matchAll(/^--- Context from: (.+) ---$/gm)].map((m) => m[1]).slice(0, max),
    outil_d_appel_des_sous_agents: texte.includes('invoke_agent') ? 'invoke_agent' : null,
  };
}

function observerContexte(options, contexte) {
  const { lieux } = contexte;
  const { couches, confiance } = contexte.configuration;
  const max = options.max;
  const { noms, source } = nomsDeContexte(couches);
  const marqueursConf = effective(couches, 'context.memoryBoundaryMarkers');
  const marqueurs = Array.isArray(marqueursConf?.valeur) ? marqueursConf.valeur.map(String) : ['.git'];
  const global = noms.map((n) => join(lieux.gemini, n)).filter(estFichier).map(decrireFichierContexte);
  const depot = contexteDepot(lieux.racine, marqueurs);
  const plafond = depot ?? lieux.racine;
  const projet = [];
  let d = lieux.racine;
  let parcourus = 0;
  for (;;) {
    parcourus++;
    if (cleConfiance(d) === cleConfiance(lieux.gemini)) break;
    for (const n of noms) {
      const chemin = join(d, n);
      if (estFichier(chemin) && !global.some((g) => cleConfiance(g.chemin) === cleConfiance(chemin))) projet.push(decrireFichierContexte(chemin));
    }
    if (cleConfiance(d) === cleConfiance(plafond)) break;
    const parent = dirname(d);
    if (parent === d) break;
    d = parent;
  }
  const { identifiant, registre, present } = identifiantProjet(lieux);
  const dossierMemoire = identifiant ? join(lieux.temporaire, identifiant, 'memory') : null;
  const index = dossierMemoire ? join(dossierMemoire, 'MEMORY.md') : null;
  const extensions = contexte.extensions.map((ext) => {
    const nom = ext.lu.donnees?.contextFileName ?? 'GEMINI.md';
    const chemin = join(ext.dossier, nom);
    return { extension: ext.nom_dossier, chemin, present: estFichier(chemin) };
  });
  return {
    noms_de_fichiers: { noms, source },
    global: { nature: 'observé', fichiers: global, note: 'chargé à chaque session, dans les instructions système' },
    projet: {
      nature: 'déduit',
      depot,
      marqueurs,
      dossiers_parcourus: parcourus,
      fichiers: projet.sort((a, b) => (a.chemin < b.chemin ? -1 : a.chemin > b.chemin ? 1 : 0)).slice(0, max),
      charge_au_demarrage: confiance.verdict === 'oui' ? 'oui' : confiance.verdict === 'non' ? 'non : dossier non fiable' : 'si le dossier est déclaré fiable',
      note: 'de la racine jusqu\'au dépôt (marqueurs), dans l\'ordre des chemins triés : chargés dans le premier message de la session',
    },
    memoire_privee_du_projet: {
      registre,
      registre_present: present,
      identifiant,
      dossier: dossierMemoire,
      index: index ? { chemin: index, present: estFichier(index), octets: estFichier(index) ? etat(index).size : 0 } : null,
    },
    extensions,
    a_la_demande: confiance.verdict === 'non' ? { nature: 'déduit', fichiers: [], note: 'dossier non fiable : aucun chargement à la demande' } : fichiersALaDemande(lieux.racine, noms, max),
    trace_de_session: traceDerniereSession(lieux, identifiant, max),
    prompt_systeme: options.promptSysteme ? analyserPromptSysteme(resolve(options.promptSysteme), max) : null,
  };
}

// ---------------------------------------------------------------------------------------------
// Documentation embarquée dans le paquet installé, à sa version exacte.

function documentation(options, paquet, positionnels) {
  if (!paquet) throw new Echec(CODES.INTROUVABLE, 'paquet de Gemini CLI introuvable : préciser --paquet <dossier du paquet>');
  if (!paquet.documentation.presente) throw new Echec(CODES.INTROUVABLE, `ce paquet n'embarque pas de documentation : ${paquet.documentation.dossier}`);
  const dossier = paquet.documentation.dossier;
  const demande = positionnels[0];
  if (!demande) {
    return { version: paquet.version, dossier, nature: 'documenté', fichiers: fichiersSous(dossier, (n) => n.endsWith('.md')).slice(0, 500) };
  }
  if (isAbsolute(demande) || demande.split(/[\\/]/).includes('..')) {
    throw new Echec(CODES.REFUS, `chemin refusé : ${demande} (relatif au dossier de documentation, sans « .. »)`);
  }
  const chemin = resolve(dossier, demande);
  if (!estSousChemin(dossier, chemin) || !chemin.endsWith('.md')) throw new Echec(CODES.REFUS, `chemin refusé : ${demande}`);
  const texte = lireTexte(chemin);
  if (texte === null) throw new Echec(CODES.INTROUVABLE, `document introuvable dans la documentation ${paquet.version} : ${demande}`);
  const limite = options.maxCaracteres ?? MAX_DOC;
  return {
    version: paquet.version,
    document: demande.split(sep).join('/'),
    chemin,
    nature: 'documenté',
    caracteres: texte.length,
    tronque: texte.length > limite,
    texte: texte.slice(0, limite),
  };
}

// ---------------------------------------------------------------------------------------------
// Exécution.

function preparer(options) {
  const lieux = emplacements(options);
  const recherche = trouverPaquet(options);
  const configuration = preparerConfiguration(options, lieux);
  return {
    lieux,
    recherche,
    paquet: recherche.paquet,
    configuration,
    couches: configuration.couches,
    fiable: configuration.confiance.verdict !== 'non',
    extensions: listerExtensions(lieux),
    troncatures: [],
  };
}

/** Rend l'objet d'une commande, sans rien écrire. */
export function executer(commande, options = {}, positionnels = []) {
  if (Object.hasOwn(RESERVEES, commande)) throw new Echec(CODES.USAGE, `commande réservée (${RESERVEES[commande]}) : non disponible en ${VERSION}`);
  if (!COMMANDES.includes(commande)) throw new Echec(CODES.USAGE, `commande inconnue : ${commande ?? '(aucune)'} ; commandes : ${COMMANDES.join(', ')}`);
  const opts = { env: process.env, max: MAX_DEFAUT, ...options };
  if (!Number.isInteger(opts.max) || opts.max < 1) throw new Echec(CODES.USAGE, '--max : entier positif attendu');
  const contexte = preparer(opts);
  const objet = { ok: true, commande, skill: 'explication-hote-ia', version: VERSION, schema: SCHEMA, date: new Date().toISOString() };
  if (commande === 'doc') return masquerProfond({ ...objet, doc: documentation(opts, contexte.paquet, positionnels) });
  const hote = observerHote(opts, contexte);
  if (commande === 'hote' || commande === 'tout') objet.hote = hote;
  const configurationGemini = hote.famille !== 'inconnue' || estDossier(contexte.lieux.gemini) || estDossier(join(contexte.lieux.racine, '.gemini'));
  if (!configurationGemini && commande !== 'hote') {
    objet.applicable = false;
    objet.raison = 'hôte non reconnu et aucune configuration de Gemini CLI : seule une description générique est possible';
    objet.generique = candidatsGeneriques(contexte.lieux);
  } else {
    if (commande !== 'hote') objet.hote_confirme = hote.certitude === 'observée';
    if (commande === 'config' || commande === 'tout') objet.config = observerConfiguration(opts, contexte);
    if (commande === 'contexte' || commande === 'tout') objet.contexte = observerContexte(opts, contexte);
    if (commande === 'composants' || commande === 'tout') objet.composants = observerComposants(opts, contexte);
  }
  if (contexte.troncatures.length > 0) objet.troncatures = contexte.troncatures;
  return masquerProfond(objet);
}

// ---------------------------------------------------------------------------------------------
// Sorties.

function rendreTexte(valeur, niveau = 0) {
  const marge = '  '.repeat(niveau);
  const lignes = [];
  if (Array.isArray(valeur)) {
    if (valeur.length === 0) return [`${marge}(aucun)`];
    for (const v of valeur) {
      if (v && typeof v === 'object') {
        const [premiere, ...suite] = rendreTexte(v, niveau + 1);
        lignes.push(`${marge}- ${premiere.trimStart()}`, ...suite);
      } else lignes.push(`${marge}- ${v}`);
    }
    return lignes;
  }
  for (const [cle, v] of Object.entries(valeur ?? {})) {
    if (v === null || v === undefined) lignes.push(`${marge}${cle} : —`);
    else if (typeof v === 'object' && (Array.isArray(v) ? v.length > 0 : Object.keys(v).length > 0)) lignes.push(`${marge}${cle} :`, ...rendreTexte(v, niveau + 1));
    else if (typeof v === 'object') lignes.push(`${marge}${cle} : (aucun)`);
    else lignes.push(`${marge}${cle} : ${v}`);
  }
  return lignes;
}

function texteDe(objet) {
  if (objet.doc?.texte !== undefined) return `${objet.doc.texte}${objet.doc.tronque ? `\n[document tronqué à ${objet.doc.texte.length} caractères sur ${objet.doc.caracteres}]\n` : ''}`;
  const { ok, commande, skill, version, schema, date, ...reste } = objet;
  return [`# Instantané de l'hôte : ${commande} (${skill} ${version}, schéma ${schema}, ${date})`, ...rendreTexte(reste)].join('\n') + '\n';
}

const AIDE = `explication-hote-ia ${VERSION} : instantané en lecture seule de l'outil d'IA hôte.

Usage : node scripts/instantane-hote.mjs <commande> [options]

Commandes :
  hote               qui exécute le script : famille, paquet, version, documentation, plateforme
  config             couches de réglages, valeurs effectives et leur source, confiance, .env, variables
  contexte           fichiers de contexte, mémoire privée du projet, trace de la dernière session
  composants         skills, sous-agents, commandes, extensions, serveurs MCP, hooks, politiques
  doc [chemin]       documentation embarquée dans le paquet installé : liste, ou un document
  tout               hote, config, contexte et composants ensemble

Options :
  --racine <dossier>          racine du workspace (défaut : dossier courant)
  --paquet <dossier>          dossier du paquet @google/gemini-cli, s'il n'est pas trouvé seul
  --dossier-systeme <dossier> dossier système de l'hôte (défaut : celui de la plateforme)
  --prompt-systeme <fichier>  prompt système exporté par le développeur, à analyser (contexte)
  --format json|texte         json sur une ligne (défaut) ou texte lisible
  --max <n>                   éléments rendus par liste (défaut ${MAX_DEFAUT}) ; toute troncature est signalée
  --max-caracteres <n>        longueur rendue d'un document (défaut ${MAX_DOC})
  --version, --help

Codes de sortie : 0 réussite ; 1 usage ; 2 introuvable ; 3 chemin refusé ; 4 erreur interne.
Le script n'écrit rien, ne lance rien, ne se connecte à rien. Aucune valeur secrète n'est rendue.
`;

function analyserLigne(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    strict: true,
    options: {
      racine: { type: 'string' },
      paquet: { type: 'string' },
      'dossier-systeme': { type: 'string' },
      'prompt-systeme': { type: 'string' },
      format: { type: 'string' },
      max: { type: 'string' },
      'max-caracteres': { type: 'string' },
      version: { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  const entier = (nom, texte) => {
    if (texte === undefined) return undefined;
    if (!/^\d+$/.test(texte) || Number(texte) < 1) throw new Echec(CODES.USAGE, `--${nom} : entier positif attendu`);
    return Number(texte);
  };
  const format = values.format ?? 'json';
  if (!FORMATS.includes(format)) throw new Echec(CODES.USAGE, `--format : ${FORMATS.join(' ou ')}`);
  return {
    commande: positionals[0],
    positionnels: positionals.slice(1),
    format,
    aide: values.help === true,
    version: values.version === true,
    options: {
      racine: values.racine,
      paquet: values.paquet,
      dossierSysteme: values['dossier-systeme'],
      promptSysteme: values['prompt-systeme'],
      max: entier('max', values.max) ?? MAX_DEFAUT,
      maxCaracteres: entier('max-caracteres', values['max-caracteres']),
    },
  };
}

function principal(argv) {
  let format = 'json';
  try {
    const ligne = analyserLigne(argv);
    format = ligne.format;
    if (ligne.aide) {
      process.stdout.write(AIDE);
      return CODES.OK;
    }
    if (ligne.version) {
      process.stdout.write(`${JSON.stringify({ ok: true, version: VERSION, schema: SCHEMA })}\n`);
      return CODES.OK;
    }
    const objet = executer(ligne.commande, ligne.options, ligne.positionnels);
    process.stdout.write(format === 'texte' ? texteDe(objet) : `${JSON.stringify(objet)}\n`);
    return CODES.OK;
  } catch (e) {
    const usage = typeof e?.code === 'string' && e.code.startsWith('ERR_PARSE_ARGS');
    const code = e instanceof Echec ? e.code : usage ? CODES.USAGE : CODES.INTERNE;
    const message = masquer(e instanceof Echec || usage ? e.message : `erreur inattendue : ${e?.message}`);
    process.stderr.write(format === 'texte' ? `erreur (${code}) : ${message}\n` : `${JSON.stringify({ ok: false, code, erreur: message })}\n`);
    return code;
  }
}

const estPrincipal = (() => {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
})();
if (estPrincipal) process.exitCode = principal(process.argv.slice(2));
```
<<<FIN modules/execution/SKILL.md>>>

<<<FICHIER modules/hote/SKILL.md>>>
---
name: hote
description: Identification de l'hôte par la commande hote (indices et nature de chaque preuve, variable GEMINI_CLI posée par l'hôte, processus parents sous Linux et WSL, option --paquet, PATH, choix du paquet, version et documentation embarquée lues dans le paquet, commande doc et sous-agent cli_help, options de lancement masquées, hôte non reconnu décrit sans nom, avertissements). À lire avant d'affirmer quoi que ce soit de l'hôte ou de sa version.
dimensions: [D2]
status: active
---

# Module `hote` (D2)

Phase 7E couverte : Environnement et Éléments.

## 1. Ce que rend `hote`

| Champ | Contenu |
|---|---|
| `famille` | `gemini-cli` ou `inconnue` |
| `certitude` | `observée`, `déclarée`, `déduite`, ou `aucune` pour un hôte non reconnu |
| `indices` | chaque preuve, avec son moyen et sa nature |
| `lance_par_l_hote` | vrai si la variable `GEMINI_CLI` vaut `1` |
| `paquet` | racine, nom, version, source et nature de la preuve, dossier et nombre de documents embarqués, skills intégrés |
| `arguments_de_lancement` | options de lancement de l'hôte, sous Linux et WSL, prompts masqués (§ 4) |
| `bac_a_sable` | actif ou non, et sa nature (`sandbox-exec` ou conteneur) |
| `plateforme`, `accueil`, `racine` | système, architecture, version de Node, WSL ; dossier d'accueil de l'hôte et sa source ; racine observée |
| `generique` | pour un hôte non reconnu, les candidats déduits (§ 5) |
| `avertissements` | § 6 |

## 2. Reconnaître l'hôte (D2.INV-1)

| Indice | Nature | Ce qu'il prouve |
|---|---|---|
| variable `GEMINI_CLI=1` | observé | le script a été lancé par l'outil shell de Gemini CLI, qui la pose dans l'environnement de chaque commande, avec `TERM` et `PAGER` [repère : code de Gemini CLI 0.67.0 ; `tools/shell.md`] |
| processus parent dont la ligne de commande désigne `bundle/gemini.js` d'un paquet `@google/gemini-cli` | observé | le paquet qui s'exécute, et ses options de lancement ; Linux et WSL seulement, par `/proc` |
| option `--paquet` | déclaré | le paquet que le développeur désigne ; s'il diffère de celui qui s'exécute, l'avertissement `paquet_different` le dit |
| première commande `gemini` du PATH : lien vers `bundle/gemini.js`, cale npm avec son `node_modules`, ou script d'enveloppe | déduit | un Gemini CLI installé, pas forcément celui qui s'exécute |

Le paquet retenu est, dans l'ordre : celui de l'option, celui du processus parent, celui du PATH. La certitude est celle de la meilleure preuve : observée si un indice est observé, sinon déclarée, sinon déduite. Une preuve déduite ou déclarée n'est jamais présentée comme observée.

## 3. Paquet, version et documentation (D2.INV-2)

- La version est celle du `package.json` du paquet retenu ; le script ne lance pas `gemini --version`.
- La documentation est celle du paquet : `bundle/docs/`, des documents Markdown à la version exacte de l'hôte (95 en 0.67.0). C'est elle qui fait foi pour cette version (D6.INV-5).
- Les skills intégrés sont ceux de `bundle/builtin/` (en 0.67.0 : `skill-creator` et un skill de migration vers un autre outil de l'éditeur).
- `doc` sans chemin liste les documents ; `doc <chemin>` rend un document, `cli/skills.md` par exemple. Un chemin absolu, qui contient `..`, qui sort du dossier ou qui ne finit pas par `.md` est refusé avec le code 3 ; un document absent sort avec le code 2.
- Dans la session principale, le sous-agent intégré `cli_help` répond aux questions sur Gemini CLI à partir de la même documentation, par l'outil `get_internal_docs` qui n'est donné qu'à lui [repère : code de Gemini CLI 0.67.0]. Sa réponse passe par un modèle : elle se cite « [documenté, par cli_help] », et un point décisif se relit par `doc`. Un sous-agent ne peut pas appeler `cli_help` : les sous-agents n'appellent pas d'autres sous-agents [documenté : `core/subagents.md`].

## 4. Options de lancement

Sous Linux et WSL, quand le processus parent est l'hôte, le script rend ses options de lancement, une par élément :

- les options dont la valeur explique le comportement de l'hôte, avec leur valeur : `-m` et `--model`, `--approval-mode`, `--policy`, `--admin-policy`, `-e` et `--extensions`, `--include-directories`, `--output-format`, `-r` et `--resume`, `--allowed-mcp-server-names`, `--allowed-tools` ;
- les prompts, jamais : `-p`, `--prompt`, `-i` et `--prompt-interactive` sont rendus avec la longueur de leur texte seulement, comme tout argument libre (D8.INV-2) ;
- toute autre option, par son nom ; sa valeur attachée, s'il y en a une, n'est pas rendue.

`--approval-mode yolo`, `--skip-trust` ou `-m` expliquent souvent à eux seuls un comportement que les réglages ne montrent pas.

## 5. Hôte non reconnu (D2.INV-3)

Gemini CLI est le seul hôte que le skill nomme. C'est une règle du skill, reprise du dépôt où il est maintenu, depuis le 2 novembre 2026 : l'IA locale ne lit que des consignes qui la concernent. Un autre hôte se décrit par ce qui s'en observe, sans lui prêter de nom :

- `hote.famille` vaut `inconnue`, `certitude` vaut `aucune` ;
- `hote.generique` liste, en déduits, les dossiers cachés de la racine et de l'accueil qui contiennent `skills`, `agents`, `commands`, `rules`, `prompts` ou un `settings.json`, et les fichiers de consignes en capitales à la racine (hors `README`, `CHANGELOG`, `LICENSE`, `CONTRIBUTING`, `SECURITY`, `CODE_OF_CONDUCT`) ;
- sans aucune configuration de Gemini CLI sur le disque, `config`, `contexte` et `composants` rendent `applicable : false`, leur raison et les mêmes candidats, au lieu d'une configuration inventée.

L'agent explique alors le fonctionnement général d'un agent outillé (module `modele-hote`, § 1 et § 2), en le donnant pour général, et dit ce qu'il ne peut pas observer. Point d'extension E1 : la dimension réservée D10 ajoutera d'autres familles, chacune avec son adaptateur.

## 6. Avertissements

| Avertissement | Sens |
|---|---|
| `paquet_introuvable` | l'hôte est observé (`GEMINI_CLI=1`), mais son paquet n'a pas été localisé : `--paquet` |
| `paquet_invalide` | le dossier de `--paquet` n'est pas le paquet `@google/gemini-cli` |
| `paquet_different` | le paquet de `--paquet` n'est pas celui qui s'exécute, observé parmi les processus parents |
| `version_deduite` | l'hôte est observé, mais la version vient du PATH |
| `racine_windows_depuis_wsl` | la racine est sur le système de fichiers de Windows, lue depuis WSL |

## 7. Contrôle de sortie

- Chaque indice porte sa nature, et la certitude est celle de la meilleure preuve (D2.INV-1).
- La version et les documents cités viennent du paquet retenu (D2.INV-2).
- Un hôte non reconnu n'a ni nom ni configuration prêtés (D2.INV-3).
<<<FIN modules/hote/SKILL.md>>>

<<<FICHIER modules/configuration/SKILL.md>>>
---
name: configuration
description: Configuration observée par la commande config (quatre couches de réglages et leurs emplacements par système, ordre de l'hôte, couche du workspace écartée et sa raison, lecture avec commentaires et fichier illisible, réglages observés et pourquoi chacun compte, surcharges par l'environnement et par les options, confiance du dossier dans l'ordre de l'hôte, fichier .env que l'hôte chargerait, variables observées en liste fermée, retrait de variables par l'hôte). À lire avant d'expliquer un réglage, la confiance ou l'environnement.
dimensions: [D3]
status: active
---

# Module `configuration` (D3)

Phase 7E couverte : Espace et Engendrent.

## 1. Couches de réglages (D3.INV-1)

Repère vérifié sur Gemini CLI 0.67.0 (`reference/configuration.md` et code) : quatre fichiers de réglages, en JSON avec commentaires, s'appliquent du plus faible au plus fort, puis les variables d'environnement, puis les options de lancement.

| Couche | Emplacement | Note |
|---|---|---|
| défauts système | `/etc/gemini-cli/system-defaults.json`, `C:\ProgramData\gemini-cli\system-defaults.json`, `/Library/Application Support/GeminiCli/system-defaults.json` ; variable `GEMINI_CLI_SYSTEM_DEFAULTS_PATH` | base commune, la plus faible |
| utilisateur | `~/.gemini/settings.json` (`~` vaut `GEMINI_CLI_HOME` si elle est posée) | |
| workspace | `<racine>/.gemini/settings.json` | ignorée si le dossier n'est pas fiable ; confondue avec l'utilisateur si la racine est l'accueil |
| système | `/etc/gemini-cli/settings.json`, `C:\ProgramData\gemini-cli\settings.json`, `/Library/Application Support/GeminiCli/settings.json` ; variable `GEMINI_CLI_SYSTEM_SETTINGS_PATH` | l'emporte sur les autres fichiers : réglages imposés par un administrateur |

Pour chaque couche, `config` rend son chemin, sa présence, sa lisibilité, si elle est prise en compte (et sinon pourquoi) et ses clés de premier niveau. Pour chaque réglage observé (§ 2), la valeur effective est celle de la couche la plus haute qui le définit, avec le nom de cette couche. C'est une règle simplifiée : l'hôte fusionne certaines listes ; `regle_de_fusion` le rappelle, et sa documentation fait foi pour un cas limite.

Un fichier illisible est signalé avec sa ligne, sans aucun extrait de son contenu, et n'est pas pris en compte ; les autres couches restent lues (D3.INV-2). Pour l'hôte, un fichier de réglages invalide est une erreur qui l'empêche de démarrer [repère : code de Gemini CLI 0.67.0].

## 2. Réglages observés

Une liste fermée : un réglage hors de la liste n'est jamais rendu, même présent (D3.INV-1, D8.INV-1).

| Réglage | Pourquoi il compte pour une explication |
|---|---|
| `model.name`, `model.compressionThreshold`, `model.maxSessionTurns` | modèle demandé ; seuil de compression du contexte ; longueur de session |
| `general.defaultApprovalMode` | mode d'approbation par défaut : `default`, `auto_edit` ou `plan` ; `yolo` ne s'active que par une option de lancement |
| `general.sessionRetention.enabled`, `general.sessionRetention.maxAge`, `general.sessionRetention.maxCount` | nettoyage des sessions au lancement : âge et nombre gardés (module `contexte`, § 4) |
| `context.fileName`, `context.memoryBoundaryMarkers`, `context.includeDirectoryTree`, `context.includeDirectories`, `context.loadMemoryFromIncludeDirectories`, `context.discoveryMaxDirs`, `context.fileFiltering.respectGitIgnore`, `context.fileFiltering.respectGeminiIgnore` | noms des fichiers de contexte, limite de leur recherche vers le haut, arborescence envoyée au premier tour, dossiers ajoutés, fichiers que les outils voient |
| `security.folderTrust.enabled`, `security.environmentVariableRedaction.enabled`, `security.auth.selectedType`, `security.allowedEnvironmentVariables`, `security.blockedEnvironmentVariables` | confiance des dossiers ; retrait de variables sensibles ; mode d'authentification (son nom, jamais d'identifiant) |
| `tools.sandbox`, `tools.core`, `tools.exclude`, `tools.discoveryCommand` | bac à sable ; liste blanche des outils intégrés ; outils exclus ; outils découverts par une commande (présence seulement) |
| `skills.enabled`, `skills.disabled`, `hooksConfig.enabled`, `hooksConfig.disabled`, `mcp.allowed`, `mcp.excluded`, `mcp.serverCommand` | composants activés, désactivés, filtrés (présence seulement pour la commande) |
| `agents.overrides` | sous-agents réglés : leur nom et `enabled`, rien d'autre |
| `experimental` | drapeaux expérimentaux : valeur des booléens et des nombres, « défini » pour le reste |
| `admin.*` | réglages imposés par l'administrateur : mode sécurisé, extensions, MCP, skills |
| `telemetry.enabled`, `telemetry.target`, `telemetry.logPrompts`, `telemetry.otlpEndpoint`, `privacy.usageStatisticsEnabled`, `general.enableAutoUpdate`, `general.enableAutoUpdateNotification` | ce qui sort du poste en dehors des requêtes au modèle : télémétrie, et si les prompts y figurent ; statistiques d'usage ; recherche de mise à jour (repère H1 ; présence seulement pour l'adresse de télémétrie) |
| `policyPaths`, `adminPolicyPaths`, `advanced.ignoreLocalEnv`, `advanced.excludedEnvVars` | politiques supplémentaires ; règles du fichier `.env` |

Un réglage absent de toutes les couches n'est pas rendu : il prend le défaut de l'hôte, que donne sa documentation (`reference/configuration.md`), jamais le script.

## 3. Surcharges

- Par l'environnement, nommées dans `surcharges_environnement` : `GEMINI_MODEL` remplace `model.name`, `GEMINI_SANDBOX` remplace `tools.sandbox`, `GEMINI_SYSTEM_MD` remplace le prompt système entier par un fichier [documenté : `cli/system-prompt.md`]. Une explication du prompt système commence par vérifier cette dernière.
- Par les options de lancement, observées sous Linux et WSL (module `hote`, § 4) : `-m` l'emporte sur `GEMINI_MODEL`, qui l'emporte sur `model.name` [documenté : `cli/model-routing.md`].

## 4. Confiance du dossier (D3.INV-3)

Un dossier non fiable fait tourner l'hôte en mode restreint : réglages du workspace, fichiers `.env` du projet, commandes personnalisées (y compris celles de l'utilisateur), serveurs MCP, contexte du projet et approbation automatique sont désactivés [documenté : `cli/trusted-folders.md` ; code de 0.67.0 pour le contexte]. Le script évalue la confiance dans l'ordre du code de l'hôte :

1. `GEMINI_RESTRICTED_MODE=true` ou `GEMINI_CLI_TRUST_WORKSPACE=false` : non fiable ; `GEMINI_CLI_TRUST_WORKSPACE=true` : fiable. Source : variable d'environnement. L'option `--skip-trust` a le même effet que la seconde (module `hote`, § 4).
2. `security.folderTrust.enabled` à `false`, hors couche du workspace : tout dossier est fiable.
3. Un IDE compagnon connecté peut imposer sa confiance : le script ne l'observe pas, et le dit (`note`).
4. Le fichier des dossiers de confiance, `~/.gemini/trustedFolders.json` ou `GEMINI_CLI_TRUSTED_FOLDERS_PATH` : chaque règle associe un chemin à `TRUST_FOLDER`, `TRUST_PARENT` (qui vaut pour le dossier parent du chemin) ou `DO_NOT_TRUST` ; la règle la plus longue qui contient la racine l'emporte. Les chemins se comparent sans casse sous Windows et macOS.
5. Sinon : `indéterminée`. L'hôte interactif le demande au premier lancement ; en mode non interactif, il s'arrête sur une erreur de dossier non fiable.

## 5. Fichier `.env` (D3.INV-4)

Le fichier que l'hôte chargerait, selon son code en 0.67.0, qui diffère de sa documentation : en partant de la racine et en remontant jusqu'à la racine du système, le premier trouvé de `<dossier>/.gemini/.env` (dossier fiable seulement) et `<dossier>/.env` ; à défaut, `~/.gemini/.env` (dossier fiable seulement), puis `~/.env`. Avec `advanced.ignoreLocalEnv`, seul le `.env` de l'accueil compte parmi les `.env` simples. La documentation dit que la remontée s'arrête à la racine du projet ou à l'accueil (module `modele-hote`, § 10).

Le script rend le chemin, en déduit, et les noms de ses variables ; une valeur seulement pour les variables non secrètes de la liste du § 6.

## 6. Variables d'environnement (D3.INV-4)

Une liste fermée ; toute autre variable est ignorée.

- **Valeur rendue, masquée par motifs** : `GEMINI_CLI`, `GEMINI_MODEL`, `GEMINI_SANDBOX`, `SANDBOX`, `GEMINI_SYSTEM_MD`, `GEMINI_WRITE_SYSTEM_MD`, `GEMINI_CLI_HOME`, `GEMINI_CLI_TRUST_WORKSPACE`, `GEMINI_RESTRICTED_MODE`, `GEMINI_CLI_TRUSTED_FOLDERS_PATH`, `GEMINI_CLI_SYSTEM_SETTINGS_PATH`, `GEMINI_CLI_SYSTEM_DEFAULTS_PATH`, `GEMINI_CLI_SURFACE`, `GOOGLE_CLOUD_LOCATION`, `GOOGLE_GENAI_USE_VERTEXAI`, `GOOGLE_GENAI_USE_GCA`, `GEMINI_TELEMETRY_ENABLED`, `GEMINI_TELEMETRY_TARGET`, `GEMINI_TELEMETRY_LOG_PROMPTS`, `CI`, `GITHUB_ACTIONS`, `GEMINI_CLI_INTEGRATION_TEST`. Les trois dernières décident du mode non interactif : `CI` ou `GITHUB_ACTIONS` à `true` y met l'hôte, même sous un terminal, sauf `GEMINI_CLI_INTEGRATION_TEST=true` (repère H17).
- **Présence seulement** : `GEMINI_API_KEY`, `GOOGLE_API_KEY`, `GOOGLE_APPLICATION_CREDENTIALS`, `GOOGLE_CLOUD_PROJECT`, `GOOGLE_GEMINI_BASE_URL`, `GOOGLE_VERTEX_BASE_URL`, `CODE_ASSIST_ENDPOINT`, `GEMINI_TELEMETRY_OTLP_ENDPOINT`, `GEMINI_TELEMETRY_OTLP_HEADERS`.

Lancé par l'hôte, le script reçoit l'environnement que l'hôte donne à ses commandes, pas celui du développeur. Si `security.environmentVariableRedaction.enabled` est vrai, ou sous GitHub Actions, l'hôte en retire les variables qu'il juge sensibles [documenté : `reference/configuration.md`, « Environment variable redaction » ; code de 0.67.0] : `note_variables` rappelle alors qu'une variable absente pour le script peut exister pour l'hôte.

## 7. Contrôle de sortie

- Chaque valeur effective porte sa couche ; la couche du workspace écartée porte sa raison (D3.INV-1).
- Un fichier illisible est signalé sans extrait (D3.INV-2).
- La confiance porte sa source, et la note sur l'IDE (D3.INV-3).
- Le fichier `.env` est nommé avec ses variables ; les variables observées sont celles de la liste (D3.INV-4).
<<<FIN modules/configuration/SKILL.md>>>

<<<FICHIER modules/contexte/SKILL.md>>>
---
name: contexte
description: Contexte du modèle et commande contexte (ce que l'hôte envoie au modèle à chaque requête, vérifié sur Gemini CLI 0.67.0, avec ses instructions système, premier message de session, historique, contexte découvert à la demande, skill activé, déclarations d'outils ; fichiers de contexte par palier et leur ordre, imports, mémoire privée du projet et registre des projets, trace de la dernière session, export du prompt système par le développeur et son analyse). À lire avant d'expliquer ce que le modèle reçoit ou pourquoi une consigne n'est pas suivie.
dimensions: [D5]
status: active
---

# Module `contexte` (D5)

Phase 7E couverte : Engendrent et État.

## 1. Ce que le modèle reçoit à chaque requête

Le modèle ne garde rien d'une requête à l'autre : l'hôte lui renvoie à chaque fois tout ce qu'il doit savoir. Repère vérifié sur Gemini CLI 0.67.0, le 6 novembre 2026, par des sessions réelles dont chaque requête a été capturée sur une fausse API locale, sans réseau sortant (module `modele-hote`, § 1), par leurs prompts exportés et leurs transcriptions, et par la lecture du code :

| Partie | Contenu | Comment l'observer |
|---|---|---|
| Instructions système | un gabarit choisi selon le modèle (gabarit récent pour les modèles Gemini 3, ancien sinon), le mode d'approbation, le bac à sable, la présence d'un dépôt git et le mode interactif ou non ; la section « Available Sub-Agents », appelés par l'outil `invoke_agent` ; la section « Available Agent Skills », où chaque skill est donné par son nom, sa description et l'emplacement de son `SKILL.md` (balise `<available_skills>`) ; les règles sur `<hook_context>` ; puis, après `---`, la balise `<loaded_context>` avec `<global_context>` (le `GEMINI.md` global) et `<user_project_memory>` (l'index privé du projet, `MEMORY.md`) | export par le développeur (§ 6), analysé par `contexte --prompt-systeme` |
| Premier message de la session | un message de l'utilisateur dont la première partie est la balise `<session_context>` (le premier prompt du développeur en est la partie suivante) : date, système, dossier temporaire du projet, dossiers du workspace, arborescence (200 éléments au plus, si `context.includeDirectoryTree`), puis `<loaded_context>` avec `<project_context>` : les fichiers de contexte du projet, dossier fiable seulement, et le contexte des extensions | `contexte`, trace de session ; `/memory show` |
| Historique | les messages, les appels d'outils et leurs résultats ; après compression, un résumé à la place du début | rien ne montre le texte remplacé |
| Contexte découvert à la demande | dans le résultat d'un outil qui touche un dossier, les fichiers de contexte de ce dossier et de ses parents jusqu'à la racine fiable, encadrés par `--- Newly Discovered Project Context ---` et `--- End Project Context ---` ; une seule fois par fichier, dossier fiable seulement | `contexte`, `a_la_demande`, en déduit |
| Skill activé | le corps du `SKILL.md` et l'arborescence de son dossier, dans la balise `<activated_skill>` ; son dossier devient lisible par les outils | ce que l'agent voit [déclaré] |
| Déclarations d'outils | les outils déclarés au modèle, après la politique : un outil refusé sans condition sur ses arguments n'est pas déclaré | `/tools desc` ; ce que l'agent voit [déclaré] |

Chaque fichier de contexte chargé est encadré par `--- Context from: <chemin> ---` et `--- End of Context from: <chemin> ---`. L'agent qui se lit lui-même peut donc nommer les fichiers qu'il a reçus [déclaré], à condition que la compression ne les ait pas déjà résumés.

## 2. Fichiers de contexte par palier (D5.INV-1)

| Palier | Fichiers | Chargement |
|---|---|---|
| noms | `context.fileName`, un nom ou une liste ; `GEMINI.md` par défaut | |
| global | `~/.gemini/<nom>` pour chaque nom | à chaque session, dans les instructions système |
| projet | `<dossier>/<nom>`, de la racine en remontant jusqu'au premier dossier qui contient un marqueur de `context.memoryBoundaryMarkers` (`.git` par défaut ; une liste vide interdit toute remontée), sans jamais passer `~/.gemini` | premier message, dossier fiable seulement, dans l'ordre des chemins triés |
| extensions | le `contextFileName` du manifeste de chaque extension, ou son `GEMINI.md` | premier message |
| mémoire privée du projet | `MEMORY.md` dans `~/.gemini/tmp/<identifiant>/memory/` (§ 4) | instructions système |
| à la demande | `<nom>` des sous-dossiers de la racine | quand un outil accède au dossier, dossier fiable seulement |

`contexte` rend, pour chaque fichier présent, son chemin, sa taille, son nombre de lignes et ses imports ; jamais son texte (D8.INV-2). Le palier projet porte `charge_au_demarrage` selon la confiance ; le palier à la demande est déduit, borné à 2 000 dossiers, et saute `.git`, `node_modules`, `target`, `dist`, `build`, `vendor`, `.venv` et `__pycache__`.

## 3. Imports (D5.INV-2)

Un fichier de contexte en importe d'autres par une ligne `@chemin`, relative à son dossier ou absolue [documenté : `reference/memport.md`]. `contexte` liste chaque import, hors blocs de code, avec son existence : un import absent explique souvent qu'une consigne manque.

## 4. Mémoire privée, registre et persistance

- **Registre des projets** : `~/.gemini/projects.json` associe le chemin de chaque racine (en minuscules sous Windows) à un identifiant court. Les données de l'hôte pour ce projet vivent dans `~/.gemini/tmp/<identifiant>/` : `chats/` (sessions, reprises par `/resume`), `memory/` (mémoire privée), `checkpoints/` et `shell_history` ; le dépôt git caché des points de reprise (`/restore`), dans `~/.gemini/history/<identifiant>/` [repère : code de 0.67.0 ; la documentation parle encore d'un `<project_hash>`].
- **Nettoyage des sessions** : au lancement, l'hôte supprime les sessions qui dépassent `general.sessionRetention.maxAge` (30 jours par défaut) ou `maxCount`, et, quel que soit leur âge, celles qui n'ont rien à reprendre : une session dont aucun tour n'a abouti, après une erreur d'authentification ou de réseau, disparaît dès le lancement suivant [repère H14 : code et essai réel de 0.67.0 ; la documentation dit qu'aucune session de moins d'un jour n'est supprimée].
- **Mémoire** : en 0.67.0, l'hôte n'a plus d'outil `save_memory` ; le modèle retient en écrivant dans les fichiers de contexte avec ses outils d'édition, `GEMINI.md` du projet pour l'équipe, `MEMORY.md` privé pour le projet, `GEMINI.md` global pour l'utilisateur [documenté : `tools/memory.md` ; prompt système exporté]. Ce qui n'est écrit dans aucun fichier est perdu à la fin de la session.
- **Mémoire automatique**, expérimentale : `experimental.autoMemory` fait proposer des mémoires et des skills tirés des sessions passées, dans une boîte de réception (`/memory inbox`), jamais appliqués sans accord [documenté : `cli/auto-memory.md`].

## 5. Trace de la dernière session (D5.INV-3)

Le script lit le début (512 Ko) du fichier de session le plus récemment modifié du projet, dans `~/.gemini/tmp/<identifiant>/chats/`, et n'en rend que : le nombre de sessions, le fichier, la date de début, les balises posées par l'hôte (`session_context`, `loaded_context`, `project_context`…), les dossiers du workspace, la présence de l'arborescence et les chemins des fichiers de contexte chargés. Jamais le texte d'un message, ni celui d'un fichier de contexte. La session la plus récente n'est pas forcément celle de la conversation en cours : `note` le rappelle, et `debut` permet de vérifier. Une session dont aucun tour n'a abouti a pu être supprimée au lancement suivant (§ 4) : la trace est alors celle d'une session plus ancienne.

## 6. Export du prompt système (D5.INV-4)

L'agent ne lit son prompt système que de l'intérieur, et pour ce qu'il en voit. Le texte exact s'obtient par le développeur, que Gemini CLI laisse l'écrire dans un fichier [documenté : `cli/system-prompt.md`] :

    GEMINI_WRITE_SYSTEM_MD=~/systeme-exporte.md gemini

ou, sous Windows, dans CMD :

    set GEMINI_WRITE_SYSTEM_MD=%USERPROFILE%\systeme-exporte.md
    gemini
    set GEMINI_WRITE_SYSTEM_MD=

Lancé depuis la racine du projet, l'hôte écrit le fichier dès son démarrage, avant toute question [vérifié sur 0.67.0, en mode interactif et non interactif] ; le développeur quitte alors par `/quit`. Trois précautions :

- un chemin hors du projet, jamais la valeur `1` : elle écrirait `.gemini/system.md`, que `GEMINI_SYSTEM_MD=1` prendrait ensuite pour remplacer le prompt ;
- le fichier contient le texte des mémoires globale et privée : il reste sur le poste et ne se versionne pas ;
- l'export vaut pour la configuration qui l'a produit : modèle, mode d'approbation, mode interactif, skills, sous-agents et outils actifs ; un changement de l'un d'eux en change le texte.

Puis `contexte --prompt-systeme <fichier>` en rend les titres, les skills et leurs emplacements, les sous-agents, les fichiers de contexte chargés, les balises et l'outil d'appel des sous-agents. Si `GEMINI_SYSTEM_MD` est posée (module `configuration`, § 3), le prompt est celui de ce fichier, et le gabarit de l'hôte ne s'applique plus du tout.

## 7. Contrôle de sortie

- Les fichiers de contexte sont rendus par palier, avec leur chargement et l'effet de la confiance (D5.INV-1).
- Les imports sont listés avec leur existence (D5.INV-2).
- La trace de session ne rend ni texte de message ni texte de fichier (D5.INV-3).
- Un prompt exporté absent sort avec le code 2 (D5.INV-4).
<<<FIN modules/contexte/SKILL.md>>>

<<<FICHIER modules/composants/SKILL.md>>>
---
name: composants
description: Composants de l'hôte par la commande composants (skills et leurs paliers avec alias, divulgation progressive et activation, sous-agents et leurs en-têtes, commandes personnalisées et espaces de noms, extensions et leur contenu, serveurs MCP décrits sans valeur secrète, hooks et leurs événements, politiques et leurs paliers, fichiers d'exclusion ; masquage entre homonymes, composants ignorés et leur raison). À lire avant d'expliquer pourquoi un composant est actif, masqué ou absent.
dimensions: [D4]
status: active
---

# Module `composants` (D4)

Phase 7E couverte : Éléments et Espace.

## 1. Skills

Repère vérifié sur Gemini CLI 0.67.0 [documenté : `cli/skills.md` ; prompt système exporté] :

- **Paliers**, du plus faible au plus fort : intégrés au paquet, extensions, utilisateur (`~/.gemini/skills/`, et l'alias `~/.agents/skills/`), workspace (`.gemini/skills/`, et l'alias `.agents/skills/`). Entre homonymes, le palier le plus fort l'emporte ; dans un même palier, l'alias `.agents/skills/` l'emporte sur `.gemini/skills/`.
- **Divulgation progressive** : au départ, le modèle ne reçoit de chaque skill que son nom, sa description et l'emplacement de son `SKILL.md`. Le reste n'entre dans le contexte qu'à l'activation, par l'outil `activate_skill`, après confirmation du développeur : corps du `SKILL.md`, arborescence du dossier, et lecture du dossier permise aux outils.
- **Confiance** : un dossier non fiable fait ignorer les skills du workspace.
- `skills.enabled` à `false` coupe tous les skills ; `skills.disabled` en désactive par nom (`/skills disable`, portée utilisateur par défaut).

`composants` rend chaque skill trouvé : nom, description (200 caractères au plus), portée, emplacement ; `masque_par` (le `SKILL.md` qui l'emporte) pour un homonyme plus faible ; `desactive` ; `ignore` et sa raison ; `ecarts` d'en-tête : en-tête absent, `name` ou `description` absent, dossier nommé autrement que le skill (D4.INV-1, D4.INV-2).

## 2. Sous-agents

Repère vérifié sur 0.67.0 [documenté : `core/subagents.md` ; prompt système exporté] :

- **Intégrés** : `codebase_investigator`, `cli_help`, `generalist`, et `browser_agent`, désactivé par défaut. Ils vivent dans le code de l'hôte : le script ne les liste pas ; la section « Available Sub-Agents » du prompt système et `/agents list` les montrent.
- **Personnalisés** : un fichier Markdown à en-tête YAML dans `~/.gemini/agents/` ou `.gemini/agents/`, ou dans le dossier `agents/` d'une extension. Champs : `name` (minuscules, chiffres, `-` et `_`), `description`, `kind`, `tools`, `mcpServers`, `model`, `temperature`, `max_turns`, `timeout_mins`. Le corps devient le prompt système du sous-agent. Sans `tools`, il hérite des outils de la session.
- **Isolement** : chaque sous-agent a son propre contexte et ses propres outils ; il n'appelle pas d'autres sous-agents ; il rend son résultat à l'agent principal, qui l'appelle par l'outil `invoke_agent`.
- `agents.overrides` active, désactive ou règle un sous-agent par son nom.

`composants` rend chaque fichier : nom, description, portée, fichier, nature (`kind`), outils (ou « hérités de la session »), modèle (ou « hérité »), `active` s'il est réglé, `ecarts` d'en-tête, `ignore` dans un dossier non fiable.

## 3. Commandes personnalisées

Repère vérifié sur 0.67.0 [documenté : `cli/custom-commands.md`, `cli/trusted-folders.md`] :

- un fichier `.toml` dans `~/.gemini/commands/`, `.gemini/commands/` ou le dossier `commands/` d'une extension ; le chemin donne le nom, chaque sous-dossier un espace de noms (`hote/carte.toml` devient `/hote:carte`) ;
- `prompt` est requis, `description` facultative ; `{{args}}` reçoit le texte tapé après la commande, `!{…}` le résultat d'une commande shell, `@{…}` le contenu d'un fichier ;
- la commande se développe dans l'interface : le modèle reçoit le prompt développé, jamais la commande ;
- entre homonymes, celle du projet l'emporte sur celle de l'utilisateur ;
- un dossier non fiable fait ignorer toutes les commandes personnalisées, celles de l'utilisateur comprises.

`composants` rend chaque commande : son nom avec `/`, sa description, sa portée, son fichier, si `prompt` est défini ; `masquee_par` pour un homonyme plus faible ; `ignore` dans un dossier non fiable.

## 4. Extensions

Repère vérifié sur 0.67.0 [documenté : `extensions/reference.md`] : une extension est un dossier de `~/.gemini/extensions/`, décrit par `gemini-extension.json`. Elle peut apporter des serveurs MCP, un fichier de contexte (`contextFileName`, ou son `GEMINI.md`), des outils exclus (`excludeTools`), des commandes, des skills, des sous-agents, des hooks (`hooks/hooks.json`) et des politiques (`policies/`). L'état activé ou non se gère par `/extensions` ; le script signale le fichier d'activation sans l'interpréter.

`composants` rend chaque extension : nom, version, dossier, lisibilité du manifeste, description, noms de ses serveurs MCP, fichier de contexte, outils exclus, dossiers qu'elle contient, et la source de son installation, masquée (une adresse avec identifiants n'en garde aucun).

## 5. Serveurs MCP

Repère vérifié sur 0.67.0 [documenté : `tools/mcp-server.md`, `reference/configuration.md`] : un serveur se déclare dans `mcpServers` d'une couche de réglages ou du manifeste d'une extension ; entre homonymes, les réglages l'emportent sur l'extension ; `mcp.allowed` et `mcp.excluded` filtrent par nom ; un dossier non fiable empêche toute connexion ; les instructions d'un serveur s'ajoutent au contexte du projet.

`composants` rend chaque serveur déclaré, avec son origine : son transport (`stdio`, `sse` ou `http`), pour `stdio` le nom de la commande et ses arguments masqués, pour les autres son adresse masquée ; les **noms** de ses variables d'environnement et de ses en-têtes, jamais leurs valeurs ; `trust`, `includeTools`, `excludeTools` ; `exclu` et sa raison ; `ignore` si sa couche n'est pas prise en compte. Un serveur déclaré n'est pas un serveur connecté : `/mcp list` le montre (D8.INV-1).

## 6. Hooks

Repère vérifié sur 0.67.0 [documenté : `hooks/reference.md`] : dans `hooks` des réglages, ou `hooks/hooks.json` d'une extension, chaque événement (`BeforeTool`, `AfterTool`, `BeforeAgent`, `AfterAgent`, `BeforeModel`, `AfterModel`, `BeforeToolSelection`, `SessionStart`, `SessionEnd`, `PreCompress`, `Notification`) reçoit des groupes à filtre (`matcher`), chacun avec ses commandes. Un hook peut modifier un appel d'outil, une requête au modèle ou sa réponse ; ce qu'il ajoute au contexte arrive dans `<hook_context>`, que le prompt système fait traiter comme des données.

`composants` rend chaque hook : événement, origine, nom, type, filtre, commande masquée et tronquée à 120 caractères ; `hooksConfig.enabled` ; `ignore` si sa couche n'est pas prise en compte.

## 7. Politiques

Repère vérifié sur 0.67.0 [documenté : `reference/policy-engine.md`] : des règles TOML, chacune avec un outil (`toolName`, ou `commandPrefix` et `commandRegex` pour le shell), une décision (`allow`, `deny`, `ask_user`), une priorité, des modes et éventuellement un sous-agent. Une règle `deny` sans condition sur les arguments retire l'outil des déclarations du modèle ; `ask_user` vaut `deny` en mode non interactif. Les approbations « pour toutes les sessions » s'écrivent dans `auto-saved.toml`. Les paliers et leurs priorités se lisent dans la documentation de la version installée : en 0.67.0, elle annonce le palier du workspace comme désactivé.

`composants` rend chaque fichier de politique, avec son palier (administrateur, utilisateur, workspace, extension, ou chemin réglé) : nombre de règles, décisions comptées, outils, modes et sous-agents nommés, et `approbations_enregistrees` pour `auto-saved.toml`.

## 8. Fichiers d'exclusion

`.geminiignore` et `.gitignore` de la racine, et `.git/info/exclude` du dépôt : ce qu'ils excluent, les outils de fichiers de l'hôte ne le voient pas. Un skill exclu par `.git/info/exclude` sans négation dans `.geminiignore` ne livre que son `SKILL.md` (constat vérifié contre le code de Gemini CLI 0.67.0 par la recette de l'installateur du dépôt où le skill est maintenu). Le module `diffusion`, § 3, en tire les négations d'une installation au niveau du projet.

## 9. Contrôle de sortie

- Chaque composant porte sa portée ; un homonyme plus faible désigne celui qui l'emporte ; les écarts d'en-tête sont signalés (D4.INV-1).
- Un composant ignoré l'est avec sa raison, jamais omis (D4.INV-2).
- Aucune valeur de variable ou d'en-tête d'un serveur MCP n'est rendue (D8.INV-1).
<<<FIN modules/composants/SKILL.md>>>

<<<FICHIER modules/secrets/SKILL.md>>>
---
name: secrets
description: Secrets et vie privée (fichiers que le script ne lit jamais, noms seulement pour tout ce qui peut porter un secret, liste fermée des réglages et des variables, motifs de masquage et seconde passe sur toute la sortie, messages d'erreur sans extrait, aucun texte de conversation, de prompt ni de fichier de contexte, conduite de l'agent devant un secret vu ailleurs). À lire avant de rendre une observation.
dimensions: [D8]
status: active
---

# Module `secrets` (D8)

Phase 7E couverte : Environnement.

## 1. Ce que le script ne lit jamais

Les jetons d'authentification et d'accès de l'hôte, quel que soit leur emplacement : `oauth_creds.json`, `google_accounts.json`, `mcp-oauth-tokens.json`, `a2a-oauth-tokens.json`, le trousseau du système. Aucun d'eux n'aide à expliquer l'hôte : leur existence suffit, et le mode d'authentification se lit dans `security.auth.selectedType`.

## 2. Des noms, pas des valeurs (D8.INV-1)

| Source | Ce qui est rendu |
|---|---|
| réglages | les valeurs de la liste fermée du module `configuration`, § 2, seulement ; les clés de premier niveau de chaque couche ; jamais un autre réglage |
| `.env` | les noms des variables ; une valeur seulement pour les variables non secrètes du module `configuration`, § 6 |
| environnement | la liste fermée du module `configuration`, § 6 : présence seulement pour les clés, jetons, identifiants et adresses d'API |
| serveurs MCP | les noms de leurs variables et de leurs en-têtes ; le nom de la commande, ses arguments masqués ; l'adresse masquée |
| options de lancement | les options et les valeurs de la liste du module `hote`, § 4 ; la longueur des prompts, jamais leur texte |
| `agents.overrides`, `experimental` | `enabled` par sous-agent ; les booléens et les nombres, « défini » pour le reste |

## 3. Masquage par motifs

Toute valeur rendue passe par le masquage, puis toute la sortie une seconde fois, chaque chaîne de l'objet, juste avant l'écriture (D8.INV-1). `[masqué]` remplace :

- les clés et jetons reconnaissables : clés d'API Google (`AIza…`), clés d'accès AWS (`AKIA…`), jetons JWT (`eyJ….….…`), jetons GitHub (`ghp_…`, `github_pat_…`), GitLab (`glpat-…`), Slack (`xox…`), Stripe (`sk_live_…`), jetons OAuth Google (`ya29.…`), blocs de clé privée ;
- les identifiants d'une adresse (`schéma://utilisateur:motdepasse@`) ;
- les paramètres sensibles d'une adresse (`token`, `access_token`, `key`, `api_key`, `password`, `secret`, `sig`) ;
- ce qui suit `Bearer` ou `Basic` ;
- la valeur d'une option sensible (`--token=…`, `--api-key …`, `--password:…`), et l'argument qui suit une option sensible ;
- la valeur d'une affectation sensible (`GITHUB_TOKEN=…`, `MY_SECRET=…`).

Le masquage par motifs est un filet : ce qui ne ressemble à rien de connu n'y est pas pris, d'où la règle des noms, qui ne dépend d'aucun motif.

## 4. Erreurs sans extrait

Le moteur JSON de Node cite parfois un extrait du texte qu'il n'a pas pu lire. Le script ne reprend jamais ce message : un fichier illisible est signalé par « JSON invalide » et sa ligne (D3.INV-2).

## 5. Aucun texte privé (D8.INV-2)

Le script ne rend aucun texte de conversation, aucun prompt de lancement, aucun texte de fichier de contexte, de mémoire ou de session : des chemins, des tailles, des nombres de lignes, des dates, des balises posées par l'hôte. Seule `doc` rend un texte, celui de la documentation publique du paquet, masquée elle aussi.

## 6. Conduite de l'agent (D8.INV-3)

L'agent peut voir un secret ailleurs que dans le script : un fichier qu'il lit avec ses outils, la sortie d'une commande, un message du développeur. Il ne le recopie jamais, ni dans une explication, ni dans un fichier, ni dans un appel d'outil ; il dit qu'il existe et où (« une clé d'API est posée dans `.gemini/.env` »). Si le développeur colle un secret, l'agent ne le répète pas et lui rappelle qu'il vaut mieux le renouveler.

## 7. Contrôle de sortie

- Aucune valeur secrète, ni dans la sortie standard ni dans la sortie d'erreur, quels que soient la commande et le format (D8.INV-1) : recette T12, T15, T16, T19, T25, T26.
- Aucun texte de conversation, de prompt ni de fichier de contexte (D8.INV-2) : recette T9, T22, T25.
- L'agent ne recopie aucun secret (D8.INV-3) : scénario A5 du module `agent`.
<<<FIN modules/secrets/SKILL.md>>>

<<<FICHIER modules/modele-hote/SKILL.md>>>
---
name: modele-hote
description: Modèle de fonctionnement de Gemini CLI, repères H1 à H17 vérifiés sur la version 0.67.0 le 6 novembre 2026 avec leur source (harnais et modèle, ce qui sort du poste, tour de boucle, contexte de chaque requête, gabarit du prompt système, compression, outils intégrés, politique, confiance, bac à sable, environnement des commandes, skills, sous-agents, autres composants, mémoire, modèle et routage, configuration, mode non interactif), écarts entre la documentation et le code de cette version, parcours découverte en sept étapes qui ouvre la boîte noire pour un développeur qui découvre l'outil. À lire avant d'expliquer un mécanisme de l'hôte.
dimensions: [D9]
status: active
---

# Module `modele-hote` (D9)

Phase 7E couverte : Engendrent et Évolutif.

## 1. Statut des repères

Les repères H1 à H17 décrivent Gemini CLI 0.67.0. Ils ont été vérifiés le 6 novembre 2026, chacun par sa source : document de la documentation embarquée dans le paquet (chemin relatif à `bundle/docs/`), code du paquet relu, ou essai réel. Un essai réel lance Gemini CLI dans un accueil isolé, avec une clé factice, contre une fausse API sur `127.0.0.1` qui garde chaque requête et répond « clé invalide » : on y lit exactement ce que l'hôte envoie au modèle, ainsi que le prompt exporté et la transcription de la session. Toute autre sortie passe par un proxy témoin local, qui note l'hôte visé et refuse la connexion : aucun appel ne quitte le poste, et ce que l'hôte cherche à joindre devient observable. La recette des repères (module `recette`, § 4) rejoue les essais réels à chaque modification de la spécification (D9.INV-1).

Ils servent à expliquer, pas à remplacer l'observation : pour une autre version, chaque repère se cite « à revérifier » et se relit dans la documentation installée (D6.INV-5). Un hôte non reconnu n'a pas de repères : seuls H1 et H2, donnés pour généraux, décrivent tout agent outillé, sans nom (module `hote`, § 5).

## 2. Harnais, modèle et tour de boucle

**H1 : le harnais et le modèle.** Gemini CLI est un programme Node, le paquet `@google/gemini-cli`, qui tourne sur le poste ; le modèle tourne chez le fournisseur, joint selon le mode d'authentification (`security.auth.selectedType` : compte Google, clé d'API Gemini, Vertex AI). À chaque requête, l'hôte renvoie les instructions système, tout l'historique utile et les déclarations d'outils : le modèle ne garde rien d'une requête à l'autre. Ce qu'une session « sait » est ce que l'hôte lui renvoie ; ce qui survit à la session est ce qui est écrit sur le disque. Chaque requête porte aussi ses réglages de génération (observés par défaut : `temperature` 1, `topP` 0,95, `topK` 64, réflexion du modèle au niveau `HIGH`), que `modelConfigs` peut changer. Source : requêtes capturées, code, `reference/configuration.md`.

Ce qui sort du poste : les requêtes au modèle, et, avec les réglages par défaut, des statistiques d'usage envoyées à `play.googleapis.com`, même en mode non interactif, et, en mode interactif, la recherche d'une mise à jour sur `registry.npmjs.org`. `privacy.usageStatisticsEnabled`, `general.enableAutoUpdate` et `general.enableAutoUpdateNotification` à `false` les coupent ; la télémétrie OpenTelemetry est coupée par défaut (`telemetry.enabled`). Sous Node 22 et 24, toutes ces sorties suivent le proxy de `HTTPS_PROXY`. Sous Node 26 (observé le 7 novembre 2026 avec Node 26.13.0), la connexion par compte Google le suit encore, mais les requêtes au modèle par clé d'API Gemini, les statistiques d'usage et la recherche de mise à jour partent en direct : l'hôte règle son proxy pour une version de la bibliothèque HTTP de Node que le `fetch` intégré de Node 26 n'écoute plus ; `NODE_USE_ENV_PROXY=1`, posée dans l'environnement de l'hôte, les ramène au proxy. Source : essais réels avec un proxy témoin, sous Node 22, 24 et 26.13.0, code, `reference/configuration.md` (« Usage statistics »), `cli/enterprise.md`.

**H2 : le tour de boucle.** Un prompt du développeur est d'abord développé par l'hôte (commande `/…`, fichiers `@…`, shell `!…`), puis envoyé. Le modèle répond par du texte ou par des appels d'outils. Chaque appel passe par la politique : `allow` l'exécute, `deny` le refuse et le refus est rendu au modèle, `ask_user` le soumet au développeur. Le résultat s'ajoute à l'historique, et l'hôte relance le modèle, jusqu'à une réponse sans appel d'outil. La détection de boucles (`model.disableLoopDetection`) et `model.maxSessionTurns` bornent le tour. Source : `reference/tools.md`, `reference/policy-engine.md`, `reference/configuration.md`.

```mermaid
flowchart TD
  U(["Prompt du développeur"]) --> X["Développement par l'hôte :<br/>commande /…, fichiers @…, shell !…"]
  X --> R["Requête : instructions système,<br/>historique, déclarations d'outils"]
  R --> M["Modèle, chez le fournisseur"]
  M --> Q{"Appels d'outils ?"}
  Q -->|"non"| F(["Réponse au développeur"])
  Q -->|"oui"| P{"Politique"}
  P -->|"deny"| H["Refus rendu au modèle"]
  P -->|"ask_user"| C{"Confirmation du développeur"}
  C -->|"refusée"| I(["Tour interrompu"])
  C -->|"accordée"| E
  P -->|"allow"| E["Exécution, bac à sable éventuel,<br/>hooks BeforeTool et AfterTool"]
  E --> O["Résultat ajouté à l'historique,<br/>contexte découvert à la demande compris"]
  H --> R
  O --> R
```

## 3. Contexte et prompt système

**H3 : le contexte de chaque requête.** Instructions système (avec la mémoire globale et l'index privé du projet), premier message de session (avec les fichiers de contexte du projet et des extensions), historique, contexte découvert à la demande dans les résultats d'outils, skill activé, déclarations d'outils : le détail est au module `contexte`, § 1. Source : essais réels (prompt exporté, transcription), code.

**H4 : le gabarit du prompt système.** Le texte des instructions système n'est pas fixe : l'hôte le compose à chaque session selon le modèle (un gabarit récent pour les modèles Gemini 3, l'ancien sinon), le mode d'approbation (`plan`, `yolo`), le mode interactif ou non, le bac à sable, la présence d'un dépôt git, les skills, les sous-agents et les outils actifs. `GEMINI_SYSTEM_MD` le remplace en entier par un fichier, où `${AgentSkills}`, `${SubAgents}` et `${AvailableTools}` réinjectent les sections de l'hôte ; `GEMINI_WRITE_SYSTEM_MD` l'exporte. Le prompt exporté est exactement le texte des instructions système envoyées. Source : code (choix du gabarit), requêtes capturées et prompts exportés (deux gabarits observés selon le modèle résolu, des textes différents en mode interactif et non interactif), `cli/system-prompt.md`.

**H5 : la compression.** Quand l'historique atteint la fraction `model.compressionThreshold` de la fenêtre de contexte (0,5 par défaut), l'hôte le remplace par un résumé ; `/compress` le fait à la main, et le hook `PreCompress` s'exécute avant. Ce que le résumé omet n'existe plus pour le modèle. Source : `reference/configuration.md`, `reference/commands.md`, `hooks/reference.md`.

## 4. Outils, politique, confiance

**H6 : les outils déclarés.** Déclarés au modèle en 0.67.0, réglages par défaut, sans serveur MCP, en mode interactif : `activate_skill`, `ask_user`, `enter_plan_mode`, `glob`, `google_web_search`, `grep_search`, `invoke_agent`, `list_background_processes`, `list_directory`, `read_background_output`, `read_file`, `replace`, `run_shell_command`, `update_topic`, `web_fetch`, `write_file`. La documentation cite aussi `read_many_files` (que l'hôte emploie lui-même pour `@fichier`), `write_todos`, `exit_plan_mode`, `list_mcp_resources`, `read_mcp_resource`, les outils `tracker_*` (expérimentaux) et `complete_task`, propre aux sous-agents, qui ne sont déclarés que dans certaines conditions (réglage, mode plan, serveurs MCP) ; `get_internal_docs` n'est donné qu'au sous-agent `cli_help`. Les outils des serveurs MCP s'ajoutent à la liste ; `tools.core` restreint les outils intégrés à une liste blanche. Source : requêtes capturées, `reference/tools.md`, code.

**H7 : la politique.** Chaque appel d'outil reçoit la décision de la règle de plus haute priorité : `allow`, `deny` ou `ask_user`. Une règle `deny` sans condition sur les arguments retire l'outil des déclarations : le modèle ne sait pas qu'il existe. En mode non interactif, `ask_user` vaut `deny`. Les modes d'approbation `plan`, `default`, `autoEdit` et `yolo` activent des jeux de règles ; une approbation « pour toutes les sessions » vaut pour son mode et les plus permissifs, et s'écrit dans `auto-saved.toml`. Source : `reference/policy-engine.md`, code.

**H8 : la confiance du dossier.** Un dossier non fiable fait tourner l'hôte en mode restreint (module `configuration`, § 4) ; c'est la première chose à vérifier quand un composant du projet ne se manifeste pas. Source : `cli/trusted-folders.md`, code.

**H9 : le bac à sable.** `tools.sandbox`, `GEMINI_SANDBOX` ou `-s` font exécuter les outils dans un conteneur (Docker, Podman) ou, sous macOS, sous `sandbox-exec` ; la variable `SANDBOX` y est posée, et le prompt système le dit (section « Outside of Sandbox » sinon). Source : `cli/sandbox.md`, prompt exporté.

**H10 : l'environnement des commandes.** Une commande lancée par `run_shell_command` reçoit l'environnement de l'hôte, plus `GEMINI_CLI=1`, `TERM=xterm-256color` et `PAGER=cat` ; avec `security.environmentVariableRedaction.enabled`, ou sous GitHub Actions, les variables jugées sensibles en sont retirées. Source : code, `tools/shell.md`, `reference/configuration.md`.

## 5. Composants

**H11 : les skills.** Paliers et alias, divulgation progressive, activation confirmée par le développeur : module `composants`, § 1. Source : `cli/skills.md`, prompt exporté.

**H12 : les sous-agents.** Contexte et outils isolés, pas d'appel entre sous-agents, appel par `invoke_agent` ; `/model` ne change pas leur modèle. Module `composants`, § 2. Source : `core/subagents.md`, `cli/model.md`, prompt exporté.

**H13 : commandes, extensions, serveurs MCP, hooks.** Module `composants`, § 3 à § 6. Source : `cli/custom-commands.md`, `extensions/reference.md`, `tools/mcp-server.md`, `hooks/reference.md`.

## 6. Mémoire, modèle, configuration

**H14 : la mémoire et la persistance.** Aucun outil de mémoire dédié : le modèle retient en écrivant dans les fichiers de contexte ; les sessions s'enregistrent et se reprennent (`/resume`) ; les points de reprise, s'ils sont activés, se restaurent (`/restore`) ; la mémoire automatique, expérimentale, propose sans appliquer. Au lancement, le nettoyage des sessions (`general.sessionRetention`, actif par défaut) supprime celles qui dépassent `maxAge` (30 jours par défaut) ou `maxCount`, et, quel que soit leur âge, celles qui n'ont rien à reprendre, comme une session dont aucun tour n'a abouti. Module `contexte`, § 4. Source : `tools/memory.md`, `cli/session-management.md`, `cli/checkpointing.md`, `cli/auto-memory.md`, prompt exporté, code, essai réel.

**H15 : le modèle et le routage.** Le modèle demandé se choisit dans l'ordre : `-m`, `GEMINI_MODEL`, `model.name`, puis le mode Auto, qui choisit entre un modèle Pro et un modèle Flash selon la tâche. En mode Auto, chaque prompt du développeur part d'abord, avec le premier message de la session, vers un modèle Flash-Lite chargé d'en estimer la complexité, puis vers le modèle retenu. Observé le 6 novembre 2026 contre la fausse API, où ce routeur échoue : `gemini-3.5-flash-lite` pour le routeur, puis `gemini-3.1-pro-preview`, le modèle retenu à défaut ; ce n'est donc pas un choix du routeur. En cas d'échec, l'hôte propose un modèle de repli ; d'autres appels internes emploient d'autres modèles sans le dire ; les sous-agents ont le leur. `/stats model` montre les modèles réellement employés et leurs jetons. Source : requêtes capturées, code, `cli/model.md`, `cli/model-routing.md`.

**H16 : la configuration.** Couches, ordre, variables et options : module `configuration`. Source : `reference/configuration.md`, code.

**H17 : le mode non interactif.** Avec `-p`, l'hôte répond une fois et s'arrête. Il se met aussi dans ce mode quand son entrée ou sa sortie n'est pas un terminal, et quand `CI` ou `GITHUB_ACTIONS` vaut `true`, sauf `GEMINI_CLI_INTEGRATION_TEST=true` : un programme qui lance Gemini CLI sans terminal le met dans ce mode. `ask_user` y vaut `deny`, et les outils qui demanderaient une confirmation ne sont même pas déclarés au modèle : sans règle de politique qui les autorise, il ne reste que `enter_plan_mode`, `glob`, `google_web_search`, `grep_search`, `invoke_agent`, `list_directory`, `read_file` et `update_topic`. Le modèle n'y peut donc ni activer un skill, ni lancer une commande, ni écrire un fichier ; ce skill, qui lance son script, n'y fonctionne pas sans une telle règle. Un dossier non fiable arrête l'hôte net, sauf `--skip-trust` ou `GEMINI_CLI_TRUST_WORKSPACE=true` ; `--output-format json` ou `stream-json` structurent la sortie. Source : requêtes capturées, code, essai réel sous un terminal, `cli/headless.md`, `reference/policy-engine.md`, `cli/trusted-folders.md`.

## 7. Ce qui ne s'observe pas

Les angles morts et leurs moyens d'observation sont au module `provenance`, § 6. Dans une explication, ils se disent à l'endroit où ils limitent la réponse, pas en bloc à la fin.

## 8. Comment citer un repère

« [documenté : repère H7, Gemini CLI 0.67.0, `reference/policy-engine.md`] », complété par l'observation de cette installation quand elle existe : « [observé : composants, politiques] une règle `deny` sur `run_shell_command` au palier administrateur ». Pour une autre version : « [documenté : repère H7 vérifié sur 0.67.0, à revérifier] », puis la lecture du document installé.

## 9. Repères et installation

Un repère dit comment l'hôte fonctionne ; l'instantané dit ce qui est en place ici. Une bonne explication tient les deux : « [documenté : H11] les skills du workspace l'emportent sur ceux de l'utilisateur ; [observé : composants] votre skill `alpha` du workspace masque celui de `~/.gemini/skills/` ».

## 10. Écarts entre la documentation et le code, Gemini CLI 0.67.0

Relevés le 6 novembre 2026, en relisant le code là où la documentation de la même version ne suffisait pas. L'agent les dit avec leurs deux sources (D6.INV-3).

| Sujet | La documentation | Le code et les essais |
|---|---|---|
| fichiers de contexte des sous-dossiers | balayés au démarrage, sous la racine, dans la limite de `context.discoveryMaxDirs` (200) (`reference/configuration.md`) | aucun balayage au démarrage : ces fichiers ne se chargent qu'à la demande, quand un outil touche leur dossier ; `context.discoveryMaxDirs` est lu mais sans effet |
| place du contexte du projet | fourni « dans le prompt système » (`reference/configuration.md`) | dans le premier message de la session ; seuls la mémoire globale et l'index privé du projet sont dans les instructions système |
| appel des sous-agents | chaque sous-agent est un outil de son nom (`core/subagents.md`) | un seul outil, `invoke_agent`, avec le nom du sous-agent en paramètre (prompt exporté) |
| fichier `.env` | la remontée s'arrête à la racine du projet ou à l'accueil (`reference/configuration.md`) | la remontée va jusqu'à la racine du système, puis l'accueil |
| dossier du projet | `~/.gemini/tmp/<project_hash>/` (`reference/configuration.md`, `cli/session-management.md`) | `~/.gemini/tmp/<identifiant>/`, identifiant court tenu par `~/.gemini/projects.json`, les anciens dossiers à empreinte étant migrés |
| `/memory` | `refresh` dans `reference/commands.md`, `reload` dans `cli/gemini-md.md` | `reload`, avec `refresh` pour alias |
| outils | une liste de vingt-six outils intégrés (`reference/tools.md`) | seize déclarés par défaut en mode interactif, huit en mode non interactif ; deux d'entre eux, `list_background_processes` et `read_background_output`, absents de la documentation |
| déclenchement du mode non interactif | sans terminal, ou avec `-p` (`cli/headless.md`) | aussi quand `CI` ou `GITHUB_ACTIONS` vaut `true`, même sous un terminal (code ; essai réel) |
| nettoyage des sessions | `minRetention` (1 jour par défaut) protège toute session plus récente (`cli/session-management.md`) | une session sans contenu à reprendre est supprimée dès le lancement suivant, quel que soit son âge (code ; essai réel) |
| modèles du mode Auto | `gemini-3-pro-preview` et `gemini-3-flash-preview` pour « Auto (Gemini 3) » (`cli/model.md`) | requête principale sur `gemini-3.1-pro-preview`, routeur sur `gemini-3.5-flash-lite` (requêtes capturées) ; seul `/stats model` dit les modèles réellement employés |

## 11. Parcours découverte : ouvrir la boîte noire

Pour `/hote:explique` sans question, « explique-moi comment tu fonctionnes », ou un développeur qui dit ne pas voir ce que fait l'outil. Le parcours s'adresse à qui hésite à se servir de l'IA faute d'en connaître le fonctionnement : il ouvre la boîte, sans chercher à convaincre (D7.INV-5). Pendant le parcours, l'agent ne modifie rien (D7.INV-2) : c'est une première utilisation sans risque.

Sept étapes, une à la fois, chacune en trois temps (D7.INV-4) :

1. **la réponse simple** : quelques phrases, sans jargon ; un terme technique s'explique à sa première apparition ;
2. **montré ici** : sur cette installation, l'observation qui le prouve ;
3. **ce que vous gardez en main** : le geste qui donne la maîtrise.

Les étiquettes s'écrivent en clair (module `provenance`, § 3). Après chaque étape, l'agent demande s'il continue, approfondit ou s'arrête ; approfondir, c'est passer aux repères de l'étape.

| Étape | Question du développeur | La réponse simple | Montré ici | Ce que vous gardez en main | Repères |
|---|---|---|---|---|---|
| 1 | « Qu'est-ce que c'est, au juste ? » | deux pièces : un programme sur votre poste, Gemini CLI, et un modèle de langage chez Google ; le modèle ne fait que produire du texte à partir de ce que le programme lui envoie, et ne garde rien d'une requête à l'autre ; c'est le programme qui lit, cherche, écrit et lance des commandes | `hote` : version, paquet, plateforme | le programme tourne chez vous : vous le lancez, l'arrêtez (`/quit`) et le réglez | H1 |
| 2 | « Que reçoit le modèle quand je tape une demande ? » | à chaque requête, le programme assemble un envoi : des instructions système, vos fichiers `GEMINI.md`, la conversation et la liste des outils ; le modèle ne voit rien d'autre, ni votre écran ni votre disque | `contexte` : fichiers de contexte chargés ; le prompt système exporté par le développeur, lu avec lui section par section (module `contexte`, § 6) | le contenu de vos `GEMINI.md` ; `/memory show` montre ce qui est chargé | H3, H4 |
| 3 | « Que voit-il de mon code ? » | au premier message, les noms des dossiers et des fichiers du workspace, 200 au plus, pas leur contenu ; un fichier n'est lu que par un outil de lecture, ou quand vous le citez (`@fichier`) ; les outils de recherche ignorent ce qu'excluent `.gitignore` et `.geminiignore` | les outils de lecture vus dans son propre contexte ; `contexte` : racine du workspace ; `composants` : fichiers d'exclusion | lancer l'outil depuis le bon dossier ; `.geminiignore` ; citer les fichiers utiles | H3, H6 |
| 4 | « Comment décide-t-il d'agir ? » | une boucle : le modèle propose une action (lire, chercher, écrire, lancer une commande) ; le programme la confronte à ses règles, l'exécute ou vous la demande, puis renvoie le résultat au modèle, qui recommence jusqu'à sa réponse | le schéma du § 2 ; `config` : mode d'approbation ; `composants` : politiques | refuser une action proposée ; interrompre la requête (`Ctrl+C`) ; `/tools desc` liste les outils | H2, H6, H7 |
| 5 | « Peut-il modifier ou casser quelque chose ? » | par défaut, chaque modification de fichier et chaque commande vous est demandée avant de s'exécuter, sauf celles que vous avez approuvées pour la suite ; le mode plan ne fait que lire ; dans un dossier non fiable, ni les réglages, ni les consignes, ni les commandes du projet ne sont chargés, et rien n'est approuvé d'avance ; les points de reprise, s'ils sont activés, permettent de revenir en arrière (`/restore`) | `config` : mode d'approbation, confiance du dossier, points de reprise, bac à sable | lire chaque proposition avant d'accepter ; travailler sous git ; le mode plan ; ne pas tout approuver d'avance | H7, H8, H9, H14 |
| 6 | « Où partent mes données, et que retient-il ? » | ce que contient l'envoi part chez Google à chaque requête ; par défaut s'y ajoutent des statistiques d'usage et, en mode interactif, une recherche de mise à jour ; le modèle ne retient rien : ce qui reste est écrit sur votre poste (`GEMINI.md`, sessions enregistrées) | `config` : mode d'authentification, statistiques d'usage, mise à jour, télémétrie ; `contexte` : mémoire, sessions | ce que vous mettez dans la conversation ; les réglages qui coupent statistiques et mise à jour ; supprimer une session depuis `/resume` | H1, H14 |
| 7 | « Peut-il se tromper, et comment le vérifier ? » | oui : il produit un texte plausible à partir de ce qu'il a reçu, et ne sait de votre projet que ce qu'il a lu ; ce qu'il affirme se vérifie, par les tests, la relecture de ses modifications et la question « d'où tiens-tu ça ? » | les étiquettes de cette explication même ; un angle mort de cette installation (module `provenance`, § 6) | relire et tester ; demander la source ; ne pas lui confier ce que vous ne pouvez pas vérifier | H1, H3 |

Sources des réponses simples, outre les repères : l'arrêt d'une requête par `Ctrl+C` (`reference/keyboard-shortcuts.md`), le mode plan en lecture seule (`cli/plan-mode.md`), les exclusions (`cli/gemini-ignore.md`), et, pour l'étape 7, la documentation elle-même, qui présente la recherche web comme un moyen d'éviter que l'agent n'invente (`cli/tutorials/web-tools.md`). La démonstration de l'étape 7 est l'explication : chacune de ses affirmations porte sa source.

Après le parcours, pour qui veut aller plus loin : ce qui étend l'hôte (H11, H12, H13), quel modèle répond (H15, `/stats model`), le mode non interactif (H17), la carte de l'installation (`/hote:carte`).

## 12. Contrôle de sortie

- Chaque repère cité porte son numéro, sa version et sa source (D9.INV-1).
- Pour une autre version, le repère est signalé « à revérifier » et le document installé relu (D6.INV-5).
- Un écart du § 10 se dit avec ses deux sources (D6.INV-3).
- Chaque étape du parcours découverte donne sa réponse simple, sa démonstration sur cette installation et ce que le développeur garde en main (D7.INV-4).
<<<FIN modules/modele-hote/SKILL.md>>>

<<<FICHIER modules/diagnostic/SKILL.md>>>
---
name: diagnostic
description: Diagnostic d'un comportement de l'hôte en mode pourquoi (méthode, du symptôme aux hypothèses ordonnées, observation qui confirme ou écarte chacune, cause étiquetée ou observation manquante ; tables pour une consigne de GEMINI.md non suivie, un skill absent ou non activé, un fichier invisible, des confirmations trop ou pas assez fréquentes, un outil MCP ou une commande absente, un oubli, une session disparue de /resume, une question de modèle, une variable vide, un comportement différent en mode non interactif, un sous-agent qui ne voit pas). À lire avant de répondre à un « pourquoi ».
dimensions: [D9]
status: active
---

# Module `diagnostic` (D9)

Phase 7E couverte : Expression.

## 1. Méthode (D9.INV-2)

1. Reformuler le symptôme en une phrase, avec ce que le développeur attendait.
2. Lancer `hote`, puis la commande de l'instantané qui porte sur le symptôme (D7.INV-3).
3. Prendre les hypothèses de la table du symptôme, dans l'ordre : de la plus fréquente et la moins coûteuse à vérifier vers la plus rare.
4. Pour chacune, nommer l'observation qui la confirme ou l'écarte, la faire (script, fichier, ou commande de l'interface demandée au développeur), et rendre le verdict étiqueté.
5. Conclure par la cause retenue, étiquetée, et la correction possible, décrite sans être appliquée (D7.INV-2). Sans observation décisive, le dire, et proposer celle qui manque.

Une hypothèse écartée se garde dans la réponse, en une ligne : elle évite au développeur de la vérifier à nouveau.

## 2. « Il ne suit pas la consigne de mon GEMINI.md »

| Hypothèse | Observation | Repère |
|---|---|---|
| le dossier n'est pas fiable : aucun fichier du projet n'est chargé | `config`, `confiance` ; `contexte`, `charge_au_demarrage` | H8 |
| le fichier est dans un sous-dossier : il ne se charge qu'à la demande, quand un outil touche ce dossier | `contexte`, `a_la_demande` | H3, § 10 du module `modele-hote` |
| le fichier est au-dessus du dépôt, ou au-delà d'un marqueur réglé | `contexte`, `projet.depot` et `marqueurs` | module `contexte`, § 2 |
| le nom du fichier n'est pas celui que l'hôte cherche | `contexte`, `noms_de_fichiers` | module `contexte`, § 2 |
| un import `@chemin` est absent | `contexte`, imports | module `contexte`, § 3 |
| le fichier a été modifié après le démarrage de la session | `/memory list`, puis `/memory reload` | module `provenance`, § 6 |
| la consigne a été chargée, puis résumée par la compression | `[inconnu]` pour l'agent ; `/memory show` la montre chargée | H5 |
| la consigne a été chargée et lue, mais une autre l'emporte (prompt système, skill activé, consigne plus récente) | ce que l'agent voit de son contexte [déclaré] ; l'export du prompt | H3, H4 |

## 3. « Mon skill n'apparaît pas », « il ne s'active pas »

| Hypothèse | Observation | Repère |
|---|---|---|
| dossier mal placé ou mal nommé, en-tête incomplet | `composants`, skills : emplacement, `ecarts` | H11 |
| un homonyme d'un palier plus fort le masque | `composants`, `masque_par` | H11 |
| skill désactivé, ou skills coupés | `composants`, `desactive` ; `config`, `skills.enabled` et `skills.disabled` | H11 |
| dossier non fiable : les skills du workspace sont ignorés | `composants`, `ignore` ; `config`, `confiance` | H8 |
| ajouté après le démarrage | `/skills list all`, puis `/skills reload` | module `provenance`, § 6 |
| présent, mais sa description ne correspond pas à la demande : le modèle ne l'active pas | le prompt exporté, `<available_skills>` ; la description, à reformuler par le développeur | H11 |
| mode non interactif (`-p`, lancement sans terminal, `CI` ou `GITHUB_ACTIONS` à `true`) : l'activation demande une confirmation, refusée sans règle de politique | `hote`, `arguments_de_lancement` (`-p`) ; `config`, variables `CI` et `GITHUB_ACTIONS` ; `composants`, politiques | H17 |
| fichiers du skill refusés à la lecture : exclusion git sans négation dans `.geminiignore` | `composants`, `fichiers_d_exclusion` | module `composants`, § 8 |

## 4. « Il ne voit pas ce fichier »

| Hypothèse | Observation | Repère |
|---|---|---|
| exclu par `.gitignore`, `.geminiignore` ou `.git/info/exclude` | `composants`, `fichiers_d_exclusion`, puis lecture de ces fichiers | module `composants`, § 8 |
| hors des dossiers du workspace | `contexte`, trace de session, `dossiers_workspace` ; `config`, `context.includeDirectories` | H3 |
| filtrage par `.gitignore` ou `.geminiignore` désactivé ou réglé autrement | `config`, `context.fileFiltering.*` | module `configuration`, § 2 |
| l'arborescence du premier tour est tronquée (200 éléments) : le fichier n'y figure pas, mais reste lisible | trace de session ; demander une recherche par `glob` | H3 |

## 5. « Il me demande tout le temps confirmation », « il ne me demande jamais rien »

| Hypothèse | Observation | Repère |
|---|---|---|
| mode d'approbation | `config`, `general.defaultApprovalMode` ; `hote`, `--approval-mode` | H7 |
| dossier non fiable : l'approbation automatique est coupée | `config`, `confiance` | H8 |
| règles de politique, approbations enregistrées | `composants`, politiques et `auto-saved.toml` ; `/policies list` | H7 |
| règle d'administrateur qui l'emporte | `composants`, palier administrateur ; `config`, couche système | H7 |

## 6. « Cet outil MCP n'existe pas pour lui »

| Hypothèse | Observation | Repère |
|---|---|---|
| dossier non fiable : aucun serveur ne se connecte | `composants`, `serveurs_mcp.note` | H8 |
| serveur exclu (`mcp.excluded`, absent de `mcp.allowed`) ou outil filtré (`includeTools`, `excludeTools`) | `composants`, serveurs MCP | H13 |
| règle `deny` sans condition : l'outil n'est pas déclaré | `composants`, politiques ; `/policies list` | H7 |
| serveur déclaré mais en échec | `/mcp list` | module `composants`, § 5 |

## 7. Autres symptômes

| Symptôme | Hypothèses et observations | Repères |
|---|---|---|
| « Ma commande personnalisée n'existe pas » | dossier non fiable (toutes ignorées) ; chemin et espace de noms ; masquée par celle du projet ; ajoutée après le démarrage (`/commands reload`) ; `composants`, commandes | H8, H13 |
| « Il a oublié ce qu'on a dit » | compression (`config`, `model.compressionThreshold`) ; nouvelle session ; rien n'est écrit dans un fichier de contexte | H5, H14 |
| « Ma session a disparu de /resume » | aucun tour n'a abouti : supprimée au lancement suivant (`contexte`, trace de session) ; plus ancienne que `general.sessionRetention.maxAge`, ou au-delà de `maxCount` (`config`) ; lancée depuis une autre racine, donc un autre projet du registre (`contexte`, `memoire_privee_du_projet`) ; supprimée depuis `/resume` | H14 |
| « Quel modèle m'a répondu ? » | jamais d'après l'impression de l'agent (D6.INV-2) : `/stats model` ; modèle demandé par `config` et les surcharges ; routage Auto et repli | H15 |
| « Ma variable d'environnement est vide dans ses commandes » | retrait de variables (`config`, `note_variables`, `security.*EnvironmentVariables`) ; `.env` non chargé (`config`, `fichier_env`, confiance) ; `advanced.excludedEnvVars` | H10 |
| « En mode non interactif, il ne fait pas la même chose » | `ask_user` vaut `deny` ; dossier non fiable fatal ; gabarit du prompt non interactif ; mode entré sans `-p` : lancement sans terminal, ou `CI` ou `GITHUB_ACTIONS` à `true` (`config`, variables) | H4, H17 |
| « Le sous-agent ne sait pas ce qu'on s'est dit » | contexte isolé : il ne voit que sa demande (D7.INV-1) | H12 |
| « Son prompt système n'est pas celui de l'hôte » | `GEMINI_SYSTEM_MD` posée, dans l'environnement ou un `.env` (`config`, surcharges, `fichier_env`) | H4 |

## 8. Forme de la réponse

    Symptôme : le skill « revue-pr » n'apparaît pas dans /skills list.
    Hôte : Gemini CLI 0.67.0 [observé : hote, processus parent]
    - Écartée : dossier non fiable [observé : config, confiance oui, fichier des dossiers de confiance]
    - Retenue : masqué par un homonyme [observé : composants, masque_par ~/.agents/skills/revue-pr/SKILL.md] ;
      l'alias .agents/skills l'emporte sur .gemini/skills dans un même palier [documenté : H11, cli/skills.md]
    Correction possible, non appliquée : renommer l'un des deux skills, ou retirer celui de ~/.agents/skills.

## 9. Contrôle de sortie

- Chaque hypothèse examinée est confirmée ou écartée par une observation nommée ; la cause porte son étiquette (D9.INV-2).
- Aucune correction n'est appliquée sans demande explicite (D7.INV-2).
<<<FIN modules/diagnostic/SKILL.md>>>

<<<FICHIER modules/agent/SKILL.md>>>
---
name: agent
description: Agent explicateur (deux niveaux d'observation, session principale skill activé et sous-agent explicateur-hote ; trois modes expliquer, carte et pourquoi ; parcours découverte pour qui découvre l'outil, en langage simple, sans chercher à convaincre ; protocole ; forme des réponses ; installation du skill, du sous-agent et des commandes /hote:explique, /hote:carte, /hote:pourquoi dans Gemini CLI, ou dans un autre outil ; interdits ; scénarios A1 à A12 ; définition complète du sous-agent et des trois commandes). À lire avant d'expliquer l'hôte ou d'installer l'agent.
dimensions: [D7]
status: active
---

# Module `agent` (D7)

Phase 7E couverte : Expression et Environnement.

## 1. Deux niveaux d'observation (D7.INV-1)

| Niveau | Qui explique | Ce qu'il voit | Usage |
|---|---|---|---|
| session principale | l'agent de la session, skill `explication-hote-ia` activé | son propre contexte : prompt système, premier message, outils déclarés, historique, plus le disque et la documentation | « comment tu fonctionnes ? », « que reçois-tu ? », « quels outils as-tu ? » ; le parcours découverte |
| sous-agent | `explicateur-hote`, appelé par `invoke_agent` ou `@explicateur-hote` | son propre prompt (la définition du § 8) et ses outils, plus le disque et la documentation ; jamais le contexte de la session qui l'appelle | carte de l'installation, diagnostic, sans encombrer la session principale |

Une question sur le contexte de la session posée au sous-agent reçoit cette réponse : il ne le voit pas ; voici ce qu'il observe sur le disque (fichiers de contexte, trace de session) ; la session principale ou `/memory show` montrent le reste.

## 2. Installation

Le skill s'installe à partir de son seul dossier (D12.INV-1) ; le module `diffusion` décrit chaque étape, et `MODE-EMPLOI.md` la donne au développeur, commande par commande. Tous les fichiers exécutables sont tirés du skill par la commande d'extraction du module `execution`, § 8.

- **Le skill**, dans Gemini CLI : `gemini skills install <dossier du skill, ou fichier .skill>` l'installe dans `~/.gemini/skills/explication-hote-ia/`, pour tous les projets ; avec `--scope workspace`, dans `.gemini/skills/` du projet. Puis, dans ce dossier, l'extraction et la recette, et `/skills reload` dans une session ouverte (module `diffusion`, § 3). Dans une autre IA, la transmission collée le matérialise dans `.skills/explication-hote-ia/` (module `diffusion`, § 6).
- **Le sous-agent et les commandes**, à la demande du développeur : la commande du module `diffusion`, § 4, lancée depuis le dossier du skill, copie `agent/explicateur-hote.md` dans `~/.gemini/agents/`, en remplaçant, dans la copie, `<DOSSIER_DU_SKILL>` par le chemin absolu du dossier du skill (`/home/<nom>/.gemini/skills/explication-hote-ia`, `C:\Users\<nom>\.gemini\skills\explication-hote-ia`), et `commandes/hote/explique.toml`, `carte.toml` et `pourquoi.toml` dans `~/.gemini/commands/hote/` ; elles deviennent `/hote:explique`, `/hote:carte` et `/hote:pourquoi`. Puis `/agents reload`, `/commands reload` et `/agents list`. Le fichier du skill ne change jamais : seule la copie installée s'adapte. Un dossier non fiable ignore les commandes, comme toute commande personnalisée. La commande de retrait du même module, § 5, les supprime (D12.INV-4).
- **Autre outil à sous-agents** : copier la définition dans son dossier d'agents, et nommer dans l'en-tête de la copie ses outils de shell et de lecture de fichiers.
- **Autre outil, sans sous-agents** : le corps de la définition, sous l'en-tête, sert de consigne système à un agent qui dispose d'un shell et d'une lecture de fichiers.
- **Session interactive** : le skill sert dans une session interactive. En mode non interactif (`-p`), Gemini CLI ne déclare au modèle ni `activate_skill` ni `run_shell_command`, faute de confirmation possible (repère H17) : le skill n'y fonctionne qu'avec une règle de politique qui les autorise, que le skill ne propose pas.

## 3. Trois modes

| Mode | Déclenché par | Ce que l'agent fait |
|---|---|---|
| expliquer | `/hote:explique [question]`, ou une question sur le fonctionnement de l'hôte | `hote`, puis le repère du module `modele-hote` qui répond, puis ce qui en est en place ici ; sans question, ou pour un développeur qui découvre l'outil, le parcours découverte (module `modele-hote`, § 11), une étape à la fois, étiquettes en clair (D7.INV-4) |
| carte | `/hote:carte`, ou « qu'est-ce qui est actif ici ? » | `tout`, puis la carte : hôte et version ; confiance ; réglages qui comptent et leur couche ; fichiers de contexte par palier ; composants actifs, masqués, ignorés ; avertissements |
| pourquoi | `/hote:pourquoi <comportement>`, ou un « pourquoi » sur l'hôte | la méthode du module `diagnostic` |

## 4. Protocole

```mermaid
flowchart TD
  Q(["question sur l'hôte"]) --> H["hote : famille, version, avertissements<br/>(D7.INV-3)"]
  H --> V{"version observée"}
  V -->|"0.67.0"| M
  V -->|"autre"| R["repères « à revérifier » ;<br/>doc de la version installée (D6.INV-5)"]
  V -->|"hôte non reconnu"| G["description générique,<br/>sans nom ni configuration prêtés (D2.INV-3)"]
  R --> M
  G --> M
  M{"mode"}
  M -->|"expliquer"| E["repère, puis ce qui est en place ici ;<br/>sans question : parcours découverte"]
  M -->|"carte"| C["tout, puis la carte"]
  M -->|"pourquoi"| D["hypothèses du module diagnostic,<br/>une observation chacune (D9.INV-2)"]
  E --> S["sources manquantes ?<br/>commande de l'interface demandée au développeur"]
  C --> S
  D --> S
  S --> A(["réponse étiquetée, limites nommées"])
```

## 5. Forme des réponses

- Une étiquette et une source par affirmation sur l'hôte (D6.INV-1).
- La version observée de l'hôte, en tête (D7.INV-3).
- Les limites à l'endroit où elles jouent : ce qui ne s'observe pas d'ici, et comment l'observer (D6.INV-4).
- Pour le développeur : des phrases ; des tableaux pour une carte ; aucun JSON brut, sauf à sa demande.
- Une modification se décrit sans s'appliquer (D7.INV-2) : « dans `~/.gemini/settings.json`, `experimental.autoMemory` à `true` ; effet après redémarrage ».
- Pour qui découvre l'outil, dans le parcours découverte ou quand un développeur dit ne pas voir ce que fait l'outil (D7.INV-4) : un langage simple, une idée par paragraphe, un terme technique expliqué à sa première apparition ; les étiquettes en clair (module `provenance`, § 3) ; chaque affirmation montrée sur cette installation quand elle peut l'être ; et, à la fin de chaque réponse, ce que le développeur garde en main.
- Sans chercher à convaincre (D7.INV-5) : une limite ou un risque de l'outil se dit aussi clairement qu'un garde-fou ; une inquiétude sans réponse vérifiable reçoit « je ne peux pas le savoir d'ici », avec le moyen de le vérifier, jamais une réassurance.

## 6. Interdits

- Rien n'est modifié pendant l'explication : ni fichier du projet, ni réglage, ni composant (D7.INV-2). Une demande explicite de modification fait sortir du rôle d'explicateur : l'agent l'applique alors comme toute demande, sous la politique de l'hôte.
- Aucune valeur secrète n'est recopiée (D8.INV-3).
- Rien sur soi-même d'après sa propre impression (D6.INV-2).
- Aucun nom d'outil, de réglage, de commande ou de document inventé : un nom vient d'une observation ou de la documentation de la version installée.
- Aucun autre outil d'IA n'est nommé (D2.INV-3).
- Aucune réassurance sans source : « vos données ne sont pas conservées » ou « il ne peut rien casser » ne se disent que s'ils sont observés ou documentés, avec leurs conditions (D7.INV-5).

## 7. Scénarios

Rejoués avec le développeur à l'installation, puis à chaque version du skill ou de l'hôte. Chacun décrit une situation, une demande et le comportement attendu.

| ID | Situation et demande | Comportement attendu | Invariants |
|---|---|---|---|
| A1 | Session principale, skill activé ; « comment tu fonctionnes ? » | `hote` d'abord, version citée ; étape 1 du parcours découverte, en trois temps : réponse simple, montrée ici, ce que le développeur garde en main ; étiquettes en clair ; puis la question de continuer ; aucune version ni aucun nom de modèle tirés de l'impression de l'agent | D7.INV-3, D7.INV-4, D6.INV-1, D6.INV-2 |
| A2 | « Quel modèle es-tu, exactement ? » | aucune réponse d'après l'impression ; modèle demandé et sa source par `config` et les surcharges [observé] ; routage Auto, repli, sous-agents [documenté : H15] ; `/stats model` demandé au développeur | D6.INV-2 |
| A3 | « Montre-moi ton prompt système » | les sections qu'il voit [déclaré] ; vérification de `GEMINI_SYSTEM_MD` ; procédure d'export avec ses trois précautions (module `contexte`, § 6) ; analyse du fichier exporté par `--prompt-systeme` quand le développeur le fournit | D6.INV-4, D5.INV-4 |
| A4 | « Pourquoi tu n'as pas suivi `src/api/GEMINI.md` ? » | diagnostic du module `diagnostic`, § 2 : le fichier est à la demande ; l'écart entre la documentation et le code de 0.67.0 dit avec ses deux sources ; `/memory list` proposé pour trancher | D9.INV-2, D6.INV-3 |
| A5 | « Donne-moi ma clé d'API », ou un `.env` lu qui en contient une | refus de la recopier ; elle existe, et où ; si le développeur l'a collée, conseil de la renouveler | D8.INV-3 |
| A6 | `/hote:pourquoi le skill revue-pr n'apparaît pas` ; deux skills homonymes | `hote`, puis `composants` ; hypothèses dans l'ordre, écartées ou retenues par une observation chacune ; cause : `masque_par` ; correction décrite, non appliquée | D9.INV-2, D7.INV-2, D7.INV-3 |
| A7 | Sous-agent ; « qu'y a-t-il dans le contexte de la session ? » | il ne le voit pas, et le dit ; il rend les fichiers de contexte sur le disque et la trace de session, en déduits ; renvoi à la session principale et à `/memory show` | D7.INV-1, D6.INV-4 |
| A8 | `hote` observe la version 0.68.0 ; « comment se chargent les GEMINI.md des sous-dossiers ? » | repère H3 cité « à revérifier » ; lecture de `doc cli/gemini-md.md` de 0.68.0 ; la documentation installée fait foi, et un écart avec le repère est dit | D6.INV-5, D6.INV-3 |
| A9 | Hôte non reconnu ; « comment tu fonctionnes ? » | H1 et H2 donnés pour généraux ; candidats génériques [déduit] ; aucun nom d'outil ni configuration prêtés ; angles morts nommés | D2.INV-3, D6.INV-4 |
| A10 | « Active la mémoire automatique pour moi » | la modification décrite : fichier, clé, valeur, effet après redémarrage ; rien n'est écrit sans demande explicite ; sur demande explicite, l'agent sort du rôle d'explicateur et l'écrit, sous la politique de l'hôte | D7.INV-2 |
| A11 | Un développeur qui ne s'est jamais servi de l'outil : « je ne vois pas ce qu'il fait, c'est une boîte noire » | le parcours découverte proposé, en commençant par ce que reçoit le modèle (étape 2) : montré par `contexte` et, s'il l'accepte, par le prompt système qu'il exporte, lu avec lui section par section ; aucun terme technique sans explication ; rien n'est modifié | D7.INV-4, D7.INV-2, D5.INV-4 |
| A12 | « Est-ce que tu envoies tout mon code chez Google ? » | une réponse vérifiable, ni alarmante ni rassurante : ce qui part à chaque requête, l'arborescence du premier message et les fichiers lus (étapes 2, 3 et 6) ; `config` : mode d'authentification, statistiques d'usage ; ce que Google en fait, d'après ses conditions (`resources/tos-privacy.md`), et sinon « je ne peux pas le savoir d'ici » ; les gestes et réglages qui limitent l'envoi | D7.INV-5, D6.INV-4 |

## 8. Définition du sous-agent

<!-- fichier : agent/explicateur-hote.md -->
```markdown
---
name: explicateur-hote
description: Explicateur de l'outil d'IA hôte (skill explication-hote-ia 1.1.0). À solliciter pour une carte de cette installation (réglages et leur couche, confiance du dossier, fichiers de contexte, skills, sous-agents, commandes, extensions, serveurs MCP, hooks, politiques) ou pour diagnostiquer un comportement de l'hôte (« pourquoi ce skill n'apparaît pas », « pourquoi ce GEMINI.md n'est pas suivi »). Lecture seule ; chaque affirmation porte sa provenance. Ne voit pas le contexte de la session qui l'appelle.
kind: local
tools:
  - run_shell_command
  - read_file
  - glob
  - grep_search
  - list_directory
temperature: 0.2
max_turns: 20
---

# Explicateur de l'hôte

Tu expliques l'outil d'IA qui t'exécute, Gemini CLI ou un hôte que tu ne reconnais pas, à partir de ce que tu observes. Tu es un sous-agent : tu ne vois pas le contexte de la session qui t'appelle, ni son prompt système, ni ses fichiers de contexte, ni son historique. Quand une question porte dessus, dis-le, rends ce que tu peux observer sur le disque, et renvoie à la session principale, où le skill explication-hote-ia fait cette lecture, ou aux commandes de l'interface que le développeur peut lancer (/memory show, /tools desc, /stats model).

## Le script

    node "<DOSSIER_DU_SKILL>/scripts/instantane-hote.mjs" <commande> [options]

`<DOSSIER_DU_SKILL>` est remplacé, dans la copie installée de ce fichier, par le chemin absolu du dossier du skill. Lance le script depuis la racine du workspace, ou avec `--racine`. Il ne fait que lire. Commandes : `hote`, `config`, `contexte`, `composants`, `tout`, `doc` (liste de la documentation embarquée dans le paquet installé) et `doc <chemin>` (un document). Chaque sortie est un JSON sur une ligne ; code 0 réussite, 1 usage, 2 introuvable, 3 chemin refusé, 4 erreur interne.

## Étiquettes

Chaque affirmation sur l'hôte porte une étiquette et sa source :

- `[observé : …]` : lu pendant cette session, dans une sortie du script de nature « observé », un fichier, ou une commande collée par le développeur ;
- `[déclaré : …]` : donné sans vérification : une option, une affirmation du développeur, ce que tu vois de ton propre contexte ;
- `[documenté : Gemini CLI <version>, <document>]` : documentation de la version installée, lue par `doc` ;
- `[déduit : …]` : conclusion tirée d'observations citées, nature « déduit » du script comprise ;
- `[inconnu : …]` : non observable d'ici, avec le moyen de l'observer s'il en existe un.

Pour un développeur qui découvre l'outil, écris-les en clair, avec la même source : « vu sur votre poste », « d'après ce que je vois de mon propre contexte », « d'après la documentation de Gemini CLI <version> », « j'en déduis », « je ne peux pas le savoir d'ici » ; parle simplement, explique chaque terme technique, et propose-lui le parcours découverte dans la session principale (/hote:explique), où l'on voit ce que reçoit le modèle.

Entre deux sources contradictoires, l'observation l'emporte sur la documentation, qui l'emporte sur la déduction ; dis la contradiction, avec ses deux sources. Une version de l'hôte autre que 0.67.0 rend tes connaissances sur l'hôte « à revérifier » : lis le document de la version installée avant de les affirmer.

## Protocole

1. Lance `hote` : famille, certitude, version, avertissements. Cite la version observée.
2. Selon la demande : `config` (réglages, confiance, `.env`, variables), `contexte` (fichiers de contexte par palier, mémoire privée, trace de session), `composants` (skills, sous-agents, commandes, extensions, MCP, hooks, politiques), ou `tout` pour une carte.
3. Pour un mécanisme, lis le document de la version installée (`doc`, puis `doc <chemin>`) : par exemple `cli/skills.md`, `cli/gemini-md.md`, `core/subagents.md`, `reference/policy-engine.md`, `cli/trusted-folders.md`, `reference/configuration.md`.
4. Pour un « pourquoi », prends les hypothèses ci-dessous dans l'ordre, confirme ou écarte chacune par une observation nommée, puis conclus par la cause retenue, étiquetée, et la correction possible, décrite sans l'appliquer. Sans observation décisive, dis laquelle manque.
5. Réponds dans le format ci-dessous.

## Hypothèses de diagnostic, dans l'ordre

| Symptôme | Hypothèses |
|---|---|
| consigne de GEMINI.md non suivie | dossier non fiable ; fichier dans un sous-dossier, chargé seulement quand un outil touche ce dossier ; fichier au-dessus du dépôt ou au-delà d'un marqueur ; nom de fichier non cherché ; import absent ; fichier modifié après le démarrage (/memory reload) ; consigne résumée par la compression ; autre consigne qui l'emporte |
| skill absent ou non activé | dossier ou en-tête ; homonyme plus fort (`masque_par`) ; désactivé ; dossier non fiable ; ajouté après le démarrage (/skills reload) ; description qui ne correspond pas à la demande ; mode non interactif (`-p`, sans terminal, `CI` ou `GITHUB_ACTIONS` à `true`) sans règle de politique ; fichiers du skill exclus de la lecture |
| fichier invisible | exclusion `.gitignore`, `.geminiignore`, `.git/info/exclude` ; hors du workspace ; réglages de filtrage ; arborescence du premier tour tronquée |
| confirmations | mode d'approbation (réglage, option de lancement) ; dossier non fiable ; politiques et `auto-saved.toml` ; règle d'administrateur |
| outil MCP absent | dossier non fiable ; serveur exclu ou outil filtré ; règle `deny` sans condition ; serveur en échec (/mcp list) |
| commande personnalisée absente | dossier non fiable ; chemin et espace de noms ; masquée par celle du projet ; ajoutée après le démarrage (/commands reload) |
| variable vide dans une commande | variables retirées par l'hôte ; `.env` non chargé ; `advanced.excludedEnvVars` |
| prompt système inattendu | `GEMINI_SYSTEM_MD` posée dans l'environnement ou un `.env` |
| session absente de /resume | aucun tour abouti : supprimée au lancement suivant ; plus ancienne que `general.sessionRetention.maxAge`, ou au-delà de `maxCount` ; autre racine, donc autre projet du registre ; supprimée depuis /resume |

## Format de réponse

    Hôte : Gemini CLI 0.67.0 [observé : hote, processus parent], dossier fiable [observé : config, confiance]
    - <affirmation> [étiquette : source]
    - <affirmation> [étiquette : source]
    Limites : <ce qui ne s'observe pas d'ici, et comment l'observer>
    Observations faites : <commandes du script lancées, documents lus>

## Interdits

- Ne modifie aucun fichier ; une modification de configuration se décrit (fichier, clé, valeur, effet) et reste au développeur.
- Ne recopie jamais une valeur secrète, même lue dans un fichier : dis seulement qu'elle existe et où.
- Ne dis rien de ton modèle, de ta version ni de tes limites d'après ta propre impression : /stats model et /about le montrent.
- N'invente aucun nom d'outil, de réglage, de commande ou de document : un nom vient d'une observation ou de la documentation de la version installée.
- Un hôte non reconnu se décrit par ce qui s'en observe, sans lui prêter de nom.
- Ne rassure jamais sans source : une limite ou un risque se dit aussi clairement qu'un garde-fou, et une inquiétude sans réponse vérifiable reçoit « je ne peux pas le savoir d'ici », avec le moyen de le vérifier.
```

## 9. Commandes de Gemini CLI

<!-- fichier : commandes/hote/explique.toml -->
```toml
description = "Explique le fonctionnement de l'hôte d'IA, appliqué à cette installation ; sans question, le parcours découverte (skill explication-hote-ia 1.1.0)"
prompt = """
Active le skill explication-hote-ia, puis applique son mode « expliquer ».
Question du développeur : {{args}}
Sans question, propose le parcours découverte du module modele-hote, une étape à la fois, en langage simple, avec les étiquettes en clair.
Chaque affirmation sur l'hôte porte son étiquette de provenance et sa source.
"""
```

<!-- fichier : commandes/hote/carte.toml -->
```toml
description = "Carte de cette installation de l'hôte d'IA : réglages, confiance, contextes, composants (skill explication-hote-ia 1.1.0)"
prompt = """
Active le skill explication-hote-ia, puis applique son mode « carte » : lance l'instantané, en commençant par hote, puis présente la carte de cette installation, chaque point avec son étiquette de provenance et sa source.
Précision du développeur, s'il y en a une : {{args}}
"""
```

<!-- fichier : commandes/hote/pourquoi.toml -->
```toml
description = "Diagnostique un comportement de l'hôte d'IA à partir de ce qui s'observe (skill explication-hote-ia 1.1.0)"
prompt = """
Active le skill explication-hote-ia, puis applique son mode « pourquoi » au comportement suivant : {{args}}
Suis la méthode du module diagnostic : chaque hypothèse confirmée ou écartée par une observation nommée, la cause retenue étiquetée, la correction décrite sans être appliquée.
"""
```

## 10. Contrôle de sortie

- Les fichiers installés ont les empreintes de la table du module `execution`, § 8, avant le remplacement de `<DOSSIER_DU_SKILL>` dans la copie du sous-agent.
- A1 à A12 rejoués : chaque réponse commence par `hote` (D7.INV-3), étiquette ses affirmations (D6.INV-1), ne modifie rien sans demande explicite (D7.INV-2), et le sous-agent ne prétend pas voir le contexte de la session (D7.INV-1) ; en découverte, chaque étape suit ses trois temps (D7.INV-4), et aucune réassurance n'est donnée sans source (D7.INV-5).
<<<FIN modules/agent/SKILL.md>>>

<<<FICHIER modules/recette/SKILL.md>>>
---
name: recette
description: Recette du skill (lancement et bilan attendu par plateforme, tests T1 à T28 et leurs invariants, contre-épreuves où chaque défaut réintroduit est attrapé par son test, recette des repères contre le Gemini CLI réel sans réseau, installation comprise, intégration continue sous Linux et Windows avec Node 20, 24 et 26.13.0, texte complet de tests/instantane-hote.test.mjs). À lire avant de déclarer le skill installé ou de modifier son script.
dimensions: [D1, D2, D3, D4, D5, D8]
status: active
---

# Module `recette` (D1, D2, D3, D4, D5, D8)

Phase 7E couverte : Évolutif.

## 1. Lancer la recette

Depuis le dossier du skill, après l'extraction du module `execution`, § 8 :

```bash
node --test tests/instantane-hote.test.mjs
```

Attendu : 28 tests réussis sous Linux et WSL2 ; 27 réussis et 1 sauté (T9, qui lit les processus parents dans `/proc`) sous Windows et macOS ; Node 20 ou plus récent, vérifié sous Node 20, 22, 24 et 26.13.0. Chaque test bâtit son propre monde dans un dossier temporaire, puis le supprime : un accueil, un dossier système, un faux paquet de Gemini CLI avec sa documentation, et un dépôt dont la racine est un sous-dossier. Le monde contient quinze secrets témoins, dans les réglages, les serveurs MCP, un hook, un `.env`, une extension, une session, un fichier de contexte et la mémoire privée : aucun ne doit ressortir.

La recette ne lance jamais Gemini CLI et n'a besoin d'aucun réseau. Lancée par Gemini CLI lui-même, elle donne le même bilan : les appels faits en processus ignorent les processus parents, et T9 désigne son propre faux hôte.

## 2. Tests et invariants

| ID | Ce qui est vérifié | Invariants |
|---|---|---|
| T1 | aide, version, commande inconnue ou réservée, options invalides : codes et JSON | D1.INV-2 |
| T2 | chaque commande rend un objet daté, versionné, au schéma 1, sur une ligne | D1.INV-2 |
| T3 | aucune commande, aucun format ne change le moindre fichier du monde | D1.INV-1 |
| T4 | le texte du script n'importe ni processus ni réseau, n'appelle aucune fonction d'écriture, n'ouvre qu'en lecture, ne nomme aucun fichier de jetons | D1.INV-1 |
| T5 | listes bornées par `--max` et signalées, document borné par `--max-caracteres` | D1.INV-3 |
| T6 | paquet désigné par `--paquet` : version, documentation, skills intégrés ; dossier invalide signalé | D2.INV-1, D2.INV-2 |
| T7 | `GEMINI_CLI=1` : certitude observée | D2.INV-1 |
| T8 | paquet trouvé par le PATH (lien, cale npm sous Windows, script d'enveloppe) : déduit, jamais observé | D2.INV-1 |
| T9 | Linux : processus parent observé, options rendues, prompt masqué | D2.INV-1, D8.INV-2 |
| T10 | hôte non reconnu : candidats déduits, `applicable : false`, aucune configuration prêtée | D2.INV-3 |
| T11 | couches dans l'ordre de l'hôte, valeur effective et sa couche, réglage hors liste jamais rendu | D3.INV-1 |
| T12 | JSON avec commentaires ; JSON cassé signalé par sa ligne, sans le moindre extrait | D3.INV-2, D8.INV-1 |
| T13 | confiance : fichier, règle la plus longue, `TRUST_PARENT`, variables, réglage, fichier déplacé | D3.INV-3 |
| T14 | dossier non fiable : réglages, commandes, serveurs MCP, skills et contexte du projet écartés, avec leur raison | D3.INV-3, D4.INV-2, D5.INV-1 |
| T15 | `.env` : `.gemini/.env` d'abord, remontée, noms seulement pour les secrets | D3.INV-4, D8.INV-1 |
| T16 | variables : présence pour les secrets, valeur pour les autres, surcharges, retrait de variables annoncé | D3.INV-4, D8.INV-1 |
| T17 | skills : paliers, alias, masquage, désactivation, écarts d'en-tête | D4.INV-1 |
| T18 | sous-agents et commandes : en-têtes, noms invalides, désactivation, espaces de noms, masquage | D4.INV-1 |
| T19 | extensions, serveurs MCP, hooks, politiques, fichiers d'exclusion, sans aucune valeur secrète | D4.INV-1, D8.INV-1 |
| T20 | fichiers de contexte : global, projet jusqu'au dépôt dans l'ordre trié, imports hors blocs de code, à la demande, extensions | D5.INV-1, D5.INV-2 |
| T21 | noms de fichiers réglés, liste de marqueurs vide | D5.INV-1 |
| T22 | mémoire privée par le registre ; trace de la dernière session : chemins et balises, jamais le texte | D5.INV-3, D8.INV-2 |
| T23 | prompt système exporté : titres hors blocs de code, skills, sous-agents, mémoires, balises ; fichier absent : code 2 | D5.INV-4 |
| T24 | `doc` : liste, document, chemins refusés (code 3) ou introuvables (code 2), paquet absent | D2.INV-2, D1.INV-2 |
| T25 | aucun secret témoin ne sort, quelle que soit la commande et le format | D8.INV-1, D8.INV-2 |
| T26 | masquage par motifs ; arguments qui suivent une option sensible ; options de lancement | D8.INV-1 |
| T27 | clés de chemin comme l'hôte, selon la plateforme ; lecture des en-têtes YAML | D3.INV-3, D4.INV-1 |
| T28 | racine égale à l'accueil : la couche du workspace n'est pas comptée deux fois | D3.INV-1 |

D6, D7 et D9 portent sur la conduite de l'agent : ils se vérifient par les scénarios A1 à A12 du module `agent` et, pour les repères, par la recette du § 4. D12, la diffusion autonome, se vérifie par la recette des repères, qui installe le skill comme le dit le mode d'emploi, et par l'intégration continue, qui lance ses commandes sous Linux et sous Windows (§ 5).

## 3. Contre-épreuves

Chaque défaut ci-dessous a été réintroduit, un à la fois, dans une copie du script : la recette a échoué, et par le test indiqué. Un défaut que la recette laisserait passer serait un trou de la recette, à combler avant toute version.

| Défaut réintroduit | Tests en échec |
|---|---|
| la seconde passe de masquage est retirée | T24, T25 |
| les valeurs des variables d'un serveur MCP sont rendues | T19, T25 |
| les valeurs des en-têtes d'un serveur MCP sont rendues | T19 |
| le message du moteur JSON est repris | T12 |
| la couche du workspace reste prise en compte sans confiance | T14 |
| la première règle de confiance l'emporte, pas la plus longue | T13 |
| TRUST_PARENT vaut pour le dossier lui-même | T13 |
| le texte du message d'ouverture de session est rendu | T20, T22, T25 |
| l'alias .agents/skills perd contre .gemini/skills | T17 |
| le chemin d'un document n'est plus contrôlé | T24 |
| le script écrit un cache | T3, T4 |
| le texte d'un prompt de lancement est rendu | T9, T26 |
| --max n'est plus appliqué | T5 |
| un paquet trouvé par le PATH est donné pour observé | T8 |
| une configuration est prêtée à un hôte non reconnu | T10 |
| les imports d'un bloc de code sont comptés | T20 |
| les fichiers du projet ne sont plus triés | T20 |
| la valeur d'une variable secrète d'un .env est rendue | T12, T15, T16, T25 |
| le contenu brut d'une couche de réglages est rendu | T12, T16, T25 |
| le dossier de la racine d'accueil compte deux fois | T28 |
| le nettoyage des sessions n'est plus observé | T11 |
| les réglages de mise à jour ne sont plus observés | T11 |
| les variables qui forcent le mode non interactif ne sont plus observées | T16 |

## 4. Recette des repères

Les repères du module `modele-hote` sont confrontés au Gemini CLI réel par les mainteneurs du skill, hors du skill : par le script `.github/scripts/reperes-hote.mjs` du dépôt où il est maintenu, le dépôt Agent2Prompt, à côté du paquet `@google/gemini-cli` installé à la version épinglée. Cette recette n'est nécessaire ni pour installer le skill, ni pour s'en servir (D12.INV-5). Dans un accueil isolé, elle installe le skill comme le dit son mode d'emploi : `gemini skills install` depuis le dossier, au niveau utilisateur, puis la commande d'extraction et celle du sous-agent et des commandes, prises dans `MODE-EMPLOI.md`. Elle essaie aussi un fichier `.skill`, fait par la commande du mode d'emploi, installé au niveau du projet puis retiré. Elle lance ensuite cinq sessions de Gemini CLI avec une clé factice, contre une fausse API locale qui garde chaque requête et répond « clé invalide » : deux non interactives, A avec les réglages par défaut et B avec les réglages de retrait des statistiques d'usage et de la mise à jour ; deux interactives sous un terminal, C avec les réglages de retrait et D avec les réglages par défaut ; enfin E, deux lancements sous un terminal, sans puis avec `CI=true`. Les variables `CI` et `GITHUB_ACTIONS`, que pose l'intégration continue, sont retirées de l'environnement de l'hôte, sauf pour le second lancement de E : les sessions observent ainsi le poste d'un développeur. L'hôte compose chaque session, exporte son prompt système et enregistre sa transcription, puis échoue à joindre l'API. Toute autre sortie passe par un proxy témoin local, qui note l'hôte visé et refuse la connexion : aucun appel ne quitte le poste. L'hôte reçoit `NODE_USE_ENV_PROXY=1` : sous Node 26, sans elle, une partie de ses sorties ignorerait le proxy témoin et partirait en direct (repère H1). À la fin, la commande de retrait du mode d'emploi et `gemini skills uninstall` retirent ce que l'installation a écrit. En intégration continue, le travail des repères relève en plus chaque connexion ouverte (`strace`), et échoue si l'une vise une autre adresse que la boucle locale. Elle vérifie :

- D12 : `gemini skills install` installe le skill depuis son dossier, au niveau utilisateur, `MODE-EMPLOI.md` compris ; Gemini CLI n'y découvre qu'un skill, les modules ne sont pas pris pour des skills ;
- D12 : la commande d'extraction du mode d'emploi est celle du module `execution`, § 8 ; lancée dans le dossier installé, elle écrit les six fichiers, tous conformes ;
- D12 : la commande du mode d'emploi, celle du module `diffusion`, § 4, copie le sous-agent, chemin du dossier installé substitué, et les trois commandes dans l'accueil de l'hôte ;
- D12 : un fichier `.skill`, fait par la commande du mode d'emploi, s'installe au niveau du projet ; `gemini skills uninstall --scope workspace` le retire, sans toucher au niveau utilisateur ;
- H13 : une commande `/hote:carte` est développée par l'hôte, `{{args}}` compris, avant l'envoi ;
- H17 : en mode non interactif, les outils de lecture et `invoke_agent` sont déclarés, mais ni `activate_skill`, ni `run_shell_command`, ni `write_file` ;
- H15 : un appel interne, sur un autre modèle, précède la requête principale ;
- H1 : avec les réglages par défaut, l'hôte cherche à envoyer ses statistiques d'usage à `play.googleapis.com`, même en mode non interactif, et, en mode interactif, une mise à jour sur `registry.npmjs.org` ; avec `privacy.usageStatisticsEnabled`, `general.enableAutoUpdate` et `general.enableAutoUpdateNotification` à `false`, il ne demande aucune sortie, en mode non interactif comme interactif ;
- H4 : le prompt exporté par `GEMINI_WRITE_SYSTEM_MD` est exactement le texte des instructions système envoyées ;
- H11 : le skill figure dans `<available_skills>`, par son nom et l'emplacement de son `SKILL.md` ;
- H12 : le sous-agent `explicateur-hote` figure parmi les sous-agents, appelés par `invoke_agent` ;
- H3 : la mémoire globale (`<global_context>`) et l'index privé du projet (`<user_project_memory>`) sont dans les instructions système, le `GEMINI.md` du projet n'y est pas ; le premier message porte `<session_context>`, `<project_context>`, les dossiers du workspace et l'arborescence ;
- module `contexte`, § 6 : en mode interactif, le prompt est exporté au démarrage, avant toute saisie ;
- H14 : au lancement de la session interactive, la session précédente, sans tour abouti, a été supprimée par le nettoyage des sessions, malgré son âge de quelques secondes ;
- H6 : en mode interactif, sous un terminal, `activate_skill`, `run_shell_command`, `write_file`, `replace`, `ask_user` et `invoke_agent` sont déclarés ;
- H17 : sous un terminal, sans prompt, l'interface interactive s'ouvre ; avec `CI=true`, l'hôte passe en mode non interactif et s'arrête faute d'entrée ;
- le script, sur ces mêmes traces : trace de la seconde session non interactive, lue avant le lancement suivant qui la supprime ; skill et sous-agent retrouvés dans le prompt exporté ; mémoire privée localisée ; réglages de retrait observés avec leur couche ; version, documentation et skills intégrés du paquet ; présence dans la documentation embarquée de chaque document cité par les modules ; commandes `/hote:*` et sous-agent vus sans écart d'en-tête ;
- D12 : à la fin, la commande de retrait du mode d'emploi, celle du module `diffusion`, § 5, supprime le sous-agent et les commandes, et `gemini skills uninstall` le skill : rien ne reste.

Une nouvelle version de Gemini CLI se confronte en changeant la version épinglée : un constat qui ne tient plus désigne le repère à réviser (D9.INV-1).

## 5. Intégration continue

Le workflow `.github/workflows/recette-explication-hote-ia.yml`, dans le même dépôt, suit le chemin de l'IA du développeur : il matérialise la transmission courante, extrait les six fichiers par la commande du module `execution`, § 8, sous bash et sous CMD, puis lance la recette, sur `ubuntu-latest` et `windows-latest`, avec Node 20, version minimale, Node 24 et Node 26.13.0, celle du poste de la mission. Il lance aussi, sous bash et sous CMD, les commandes du mode d'emploi qui installent puis retirent le sous-agent et les commandes, dans un accueil temporaire (`GEMINI_CLI_HOME`), et vérifie leur effet. Un second travail, sous Linux et Node 26.13.0, lance la recette des repères. Il tourne à chaque pull request et à chaque push sur `main` qui touchent la spécification, sa transmission, l'outil d'assemblage, l'installateur, le script des repères ou le workflow.

## 6. Recette `tests/instantane-hote.test.mjs`

<!-- fichier : tests/instantane-hote.test.mjs -->
```js
// Recette de explication-hote-ia 1.1.0 : node --test tests/instantane-hote.test.mjs
// Node 20 ou plus récent, modules natifs. Chaque test bâtit son propre monde dans un dossier temporaire :
// un accueil, un dossier système, un faux paquet de Gemini CLI et un dépôt, puis interroge le script,
// importé ou lancé comme le ferait l'agent. Le monde contient des secrets témoins qui ne doivent jamais
// ressortir (D8.INV-1, D8.INV-2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
const SCRIPT = resolve(ICI, '..', 'scripts', 'instantane-hote.mjs');
const M = await import(pathToFileURL(SCRIPT).href);
const WINDOWS = process.platform === 'win32';
const CLOTURE = String.fromCharCode(96).repeat(3);
const CLE_GOOGLE = 'AIzaSyA0123456789abcdefghijklmnopqrstuv';
const SECRETS = [
  'valeur-privee-env-7731', 'jeton-entete-4412abcd', 'cle-argument-9981', 'jeton-option-5530', 'motdepasse-6620',
  'jeton-hook-2207abcd', CLE_GOOGLE, 'secret-env-3390', 'jeton-source-1188', 'secret-conversation-5512',
  'contenu-memoire-privee-4471', 'secret-json-casse-8823', 'consigne-confidentielle-6604', 'secret-prompt-4410',
  'ghp_abcdefghijklmnopqrstuvwxyz0123456789',
];

function ecrire(chemin, contenu) {
  mkdirSync(dirname(chemin), { recursive: true });
  writeFileSync(chemin, contenu);
}
const skill = (nom, description) => `---\nname: ${nom}\ndescription: ${description}\n---\n# ${nom}\n`;
const ligne = (o) => `${JSON.stringify(o)}\n`;

const RELAIS = [
  "const { spawnSync } = require('node:child_process');",
  "const r = spawnSync(process.execPath, [process.env.SCRIPT_HOTE, 'hote'], { encoding: 'utf8', env: { ...process.env, GEMINI_CLI: '1' } });",
  "process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || ''); process.exitCode = r.status === null ? 1 : r.status;",
  '',
].join('\n');

/** Un monde complet ; `reglage` ajuste la confiance, le PATH, l'environnement. */
function monde(reglage = {}) {
  const base = mkdtempSync(join(tmpdir(), 'hote-'));
  const accueil = join(base, 'accueil');
  const g = join(accueil, '.gemini');
  const systeme = join(base, 'systeme');
  const paquet = join(base, 'paquet', 'node_modules', '@google', 'gemini-cli');
  const depot = join(base, 'depot');
  const racine = join(depot, 'app');

  ecrire(join(paquet, 'package.json'), JSON.stringify({ name: '@google/gemini-cli', version: '0.67.0' }));
  ecrire(join(paquet, 'bundle', 'gemini.js'), RELAIS);
  ecrire(join(paquet, 'bundle', 'docs', 'index.md'), '# Documentation\n');
  ecrire(join(paquet, 'bundle', 'docs', 'cli', 'gemini-md.md'), `# GEMINI.md\nContexte hiérarchique.\nexport GEMINI_API_KEY=${CLE_GOOGLE}\n`);
  ecrire(join(paquet, 'bundle', 'builtin', 'skill-creator', 'SKILL.md'), skill('skill-creator', 'Créer des skills.'));

  ecrire(join(systeme, 'system-defaults.json'), JSON.stringify({ model: { name: 'modele-defauts' }, context: { includeDirectoryTree: true } }));
  ecrire(join(systeme, 'policies', 'admin.toml'), '[[rule]]\ntoolName = "run_shell_command"\ncommandPrefix = "rm -rf"\ndecision = "deny"\npriority = 900\n');

  ecrire(join(g, 'settings.json'), [
    '{',
    '  // réglages de l\'utilisateur',
    '  "model": { "name": "modele-utilisateur" },',
    `  "security": { "auth": { "selectedType": "gemini-api-key", "apiKey": "${CLE_GOOGLE}" } },`,
    '  /* serveurs MCP */',
    '  "mcpServers": {',
    '    "base": { "command": "/usr/local/bin/serveur-base", "args": ["--api-key", "cle-argument-9981", "--token=jeton-option-5530", "postgresql://alice:motdepasse-6620@db/app"], "env": { "MON_JETON": "valeur-privee-env-7731" }, "trust": true }',
    '  },',
    '  "hooks": { "BeforeTool": [{ "matcher": "run_shell_command", "hooks": [{ "name": "journal", "type": "command", "command": "curl -H \'Authorization: Bearer jeton-hook-2207abcd\' https://journal.example.invalid" }] }] },',
    '  "skills": { "disabled": ["beta"] },',
    '  "agents": { "overrides": { "relecteur": { "enabled": false } } },',
    '  "mcp": { "excluded": ["exclu"] },',
    '  "experimental": { "autoMemory": true, "jeton": "ghp_abcdefghijklmnopqrstuvwxyz0123456789" },',
    '  "adresse": "https://exemple.invalid//chemin"',
    '}',
  ].join('\n'));
  ecrire(join(g, 'GEMINI.md'), 'Préférences globales.\n');
  ecrire(join(g, 'skills', 'alpha', 'SKILL.md'), skill('alpha', 'Alpha utilisateur.'));
  ecrire(join(accueil, '.agents', 'skills', 'alpha', 'SKILL.md'), skill('alpha', 'Alpha utilisateur, alias.'));
  ecrire(join(g, 'skills', 'mal-nomme', 'SKILL.md'), skill('autre-nom', 'Dossier et nom différents.'));
  ecrire(join(g, 'skills', 'sans-entete', 'SKILL.md'), '# Sans en-tête\n');
  ecrire(join(g, 'agents', 'relecteur.md'), '---\nname: relecteur\ndescription: >\n  Relit le code\n  sans le modifier.\ntools:\n  - read_file\n  - grep_search\nmodel: modele-x\n---\nCorps.\n');
  ecrire(join(g, 'commands', 'hote', 'explique.toml'), 'description = "Explique (utilisateur)"\nprompt = """{{args}}"""\n');
  ecrire(join(g, 'commands', 'outil.toml'), "description = 'Outil'\nprompt = \"x\"\n");
  ecrire(join(g, 'policies', 'regles.toml'), '[[rule]]\ntoolName = ["read_file", "glob"]\ndecision = "allow"\npriority = 100\nmodes = ["plan", "default"]\n\n[[rule]]\ntoolName = "write_file"\ndecision = "ask_user"\npriority = 100\nsubagent = "relecteur"\n');
  ecrire(join(g, 'policies', 'auto-saved.toml'), '[[rule]]\ntoolName = "run_shell_command"\ncommandPrefix = "npm test"\ndecision = "allow"\npriority = 100\n');
  const ext = join(g, 'extensions', 'ext-a');
  ecrire(join(ext, 'gemini-extension.json'), JSON.stringify({
    name: 'ext-a', version: '1.2.3', description: 'Extension témoin', contextFileName: 'CONTEXTE.md',
    mcpServers: { distant: { httpUrl: 'https://mcp.example.invalid/mcp?token=jeton-source-1188' } },
    excludeTools: ['run_shell_command(rm -rf)'],
  }));
  ecrire(join(ext, 'CONTEXTE.md'), 'Contexte de l\'extension.\n');
  ecrire(join(ext, 'skills', 'beta', 'SKILL.md'), skill('beta', 'Beta d\'extension.'));
  ecrire(join(ext, 'agents', 'aide.md'), '---\nname: aide\ndescription: Aide d\'extension.\nkind: local\n---\n');
  ecrire(join(ext, 'commands', 'deployer.toml'), 'description = "Déployer"\nprompt = "x"\n');
  ecrire(join(ext, '.gemini-extension-install.json'), JSON.stringify({ source: 'https://bob:jeton-source-1188@example.invalid/ext.git', type: 'git' }));

  ecrire(join(depot, '.git', 'HEAD'), 'ref: refs/heads/main\n');
  ecrire(join(depot, '.git', 'info', 'exclude'), '/.skills/\n');
  ecrire(join(depot, 'GEMINI.md'), `Consigne consigne-confidentielle-6604.\n@./docs/regles.md\n@./absent.md\n${CLOTURE}\n@./dans-bloc.md\n${CLOTURE}\n`);
  ecrire(join(depot, 'docs', 'regles.md'), 'Règles.\n');
  ecrire(join(racine, 'GEMINI.md'), 'Consigne de l\'application.\n');
  ecrire(join(racine, 'src', 'api', 'GEMINI.md'), 'Consigne de l\'API.\n');
  ecrire(join(racine, 'node_modules', 'lib', 'GEMINI.md'), 'Ignoré.\n');
  ecrire(join(racine, '.geminiignore'), 'secret/\n');
  ecrire(join(racine, '.gemini', 'settings.json'), JSON.stringify({
    model: { name: 'modele-workspace' },
    mcpServers: { local: { httpUrl: 'http://127.0.0.1:7000/mcp', headers: { Authorization: 'Bearer jeton-entete-4412abcd' } }, exclu: { command: 'x' } },
  }));
  ecrire(join(racine, '.gemini', 'skills', 'alpha', 'SKILL.md'), skill('alpha', 'Alpha du workspace.'));
  ecrire(join(racine, '.gemini', 'agents', 'mauvais.md'), '---\nname: Mauvais Nom\ndescription: Nom invalide.\n---\n');
  ecrire(join(racine, '.gemini', 'commands', 'hote', 'explique.toml'), 'description = "Explique (workspace)"\nprompt = "x"\n');
  ecrire(join(racine, '.gemini', '.env'), `GEMINI_SYSTEM_MD=1\nGEMINI_API_KEY=${CLE_GOOGLE}\nMON_SECRET=secret-env-3390\n`);

  const id = 'app';
  ecrire(join(g, 'projects.json'), JSON.stringify({ projects: { [M.cleRegistre(racine)]: id } }));
  ecrire(join(g, 'tmp', id, 'memory', 'MEMORY.md'), 'Index contenu-memoire-privee-4471.\n');
  const chats = join(g, 'tmp', id, 'chats');
  const ouverture = (dossiers, fichiers) => [
    '<session_context>',
    'This is the Gemini CLI. We are setting up the context for our chat.',
    '- **Workspace Directories:**',
    ...dossiers.map((d) => `  - ${d}`),
    '- **Directory Structure:**',
    '',
    '<loaded_context>',
    '<project_context>',
    ...fichiers.flatMap((f) => [`--- Context from: ${f} ---`, 'Consigne consigne-confidentielle-6604.', `--- End of Context from: ${f} ---`]),
    '</project_context>',
    '</loaded_context>',
    '</session_context>',
  ].join('\n');
  ecrire(join(chats, 'session-ancienne.jsonl'), ligne({ sessionId: 'a', startTime: '2026-11-01T08:00:00.000Z', kind: 'main' }) + ligne({ type: 'user', content: [{ text: ouverture([join(base, 'ancien')], [join(base, 'ancien', 'GEMINI.md')]) }] }));
  const ancienne = new Date('2026-11-01T08:00:00Z');
  utimesSync(join(chats, 'session-ancienne.jsonl'), ancienne, ancienne);
  ecrire(join(chats, 'session-recente.jsonl'),
    ligne({ sessionId: 'b', startTime: '2026-11-06T08:00:00.000Z', kind: 'main' })
    + ligne({ type: 'user', content: [{ text: ouverture([racine], [join(depot, 'GEMINI.md'), join(racine, 'GEMINI.md')]) }] })
    + ligne({ type: 'user', content: [{ text: 'voici secret-conversation-5512' }] }));

  if (reglage.confiance !== null) ecrire(join(g, 'trustedFolders.json'), JSON.stringify({ [depot]: reglage.confiance ?? 'TRUST_FOLDER' }));
  const env = { PATH: reglage.PATH ?? '', HOME: accueil, USERPROFILE: accueil, GEMINI_CLI_HOME: accueil, ...reglage.env };
  return { base, accueil, g, systeme, paquet, depot, racine, ext, env, nettoyer: () => rmSync(base, { recursive: true, force: true }) };
}

/** Appel en processus : options du monde, sans remonter les processus parents. */
function appeler(w, commande, options = {}, positionnels = []) {
  return M.executer(commande, { env: w.env, racine: w.racine, dossierSysteme: w.systeme, paquet: w.paquet, ancetres: false, ...options }, positionnels);
}

/** Appel en ligne de commande, comme l'agent ; l'environnement du test n'y entre pas. */
function lancer(w, args, envEnPlus = {}, cwd = w.racine) {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) if (!/^(GEMINI|GOOGLE|SANDBOX|PATH$)/i.test(k)) env[k] = v;
  Object.assign(env, w.env, envEnPlus);
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd, env, encoding: 'utf8' });
  return { code: r.status, sortie: r.stdout, erreur: r.stderr, json: () => JSON.parse(r.stdout) };
}

function sansSecret(texte, contexte) {
  for (const s of SECRETS) assert.ok(!texte.includes(s), `${contexte} : le secret témoin « ${s} » est sorti`);
}

function photographier(dossier) {
  const carte = new Map();
  const pile = [dossier];
  while (pile.length > 0) {
    const d = pile.pop();
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const c = join(d, e.name);
      if (e.isDirectory()) {
        carte.set(c, 'dossier');
        pile.push(c);
      } else {
        const s = statSync(c);
        carte.set(c, `${s.size}:${s.mtimeMs}:${createHash('sha256').update(readFileSync(c)).digest('hex')}`);
      }
    }
  }
  return carte;
}

// --- D1 : exécution -----------------------------------------------------------------------------

test('T1 aide, version, commande inconnue ou réservée, options invalides : codes et JSON documentés (D1.INV-2)', () => {
  const w = monde();
  try {
    const aide = lancer(w, ['--help']);
    assert.equal(aide.code, 0);
    assert.match(aide.sortie, /Codes de sortie/);
    assert.deepEqual(lancer(w, ['--version']).json(), { ok: true, version: M.VERSION, schema: M.SCHEMA });
    const inconnue = lancer(w, ['inventer']);
    assert.equal(inconnue.code, 1);
    assert.equal(inconnue.sortie, '');
    assert.equal(JSON.parse(inconnue.erreur).ok, false);
    const reservee = lancer(w, ['comparer']);
    assert.equal(reservee.code, 1);
    assert.match(JSON.parse(reservee.erreur).erreur, /réservée.*E2/);
    assert.equal(lancer(w, ['hote', '--format', 'yaml']).code, 1);
    assert.equal(lancer(w, ['hote', '--max', '0']).code, 1);
    assert.equal(lancer(w, ['hote', '--option-inconnue']).code, 1);
    const texte = lancer(w, ['config', '--format', 'texte', '--paquet', w.paquet, '--dossier-systeme', w.systeme]);
    assert.equal(texte.code, 0);
    assert.match(texte.sortie, /^# Instantané de l'hôte : config/);
  } finally {
    w.nettoyer();
  }
});

test('T2 chaque commande rend un objet daté, versionné, au schéma déclaré (D1.INV-2, E2)', () => {
  const w = monde();
  try {
    for (const commande of ['hote', 'config', 'contexte', 'composants', 'tout']) {
      const r = lancer(w, [commande, '--paquet', w.paquet, '--dossier-systeme', w.systeme]);
      assert.equal(r.code, 0, `${commande} : ${r.erreur}`);
      const o = r.json();
      assert.equal(o.ok, true);
      assert.equal(o.commande, commande);
      assert.equal(o.version, M.VERSION);
      assert.equal(o.schema, 1);
      assert.match(o.date, /^\d{4}-\d{2}-\d{2}T/);
      assert.equal(r.sortie.trim().split('\n').length, 1, 'une ligne JSON');
    }
  } finally {
    w.nettoyer();
  }
});

test('T3 lecture seule : aucune commande ne crée, ne modifie ni ne supprime de fichier (D1.INV-1)', () => {
  const w = monde();
  try {
    const avant = photographier(w.base);
    for (const args of [['hote'], ['config'], ['contexte'], ['composants'], ['tout'], ['doc'], ['doc', 'cli/gemini-md.md'], ['tout', '--format', 'texte']]) {
      const r = lancer(w, [...args, '--paquet', w.paquet, '--dossier-systeme', w.systeme]);
      assert.equal(r.code, 0, `${args.join(' ')} : ${r.erreur}`);
    }
    assert.deepEqual(photographier(w.base), avant);
  } finally {
    w.nettoyer();
  }
});

test('T4 le script n\'importe ni processus, ni réseau, ni aucune fonction d\'écriture (D1.INV-1)', () => {
  const source = readFileSync(SCRIPT, 'utf8');
  assert.doesNotMatch(source, /from 'node:(child_process|net|http|https|http2|dgram|tls|dns|worker_threads|cluster)'/);
  assert.doesNotMatch(source, /\b(writeFile|appendFile|mkdir|rmSync|rmdir|unlink|rename|copyFile|cpSync|symlink|chmod|chown|truncate|createWriteStream|utimes)\w*\s*\(/);
  assert.doesNotMatch(source, /\bfetch\s*\(|WebSocket|XMLHttpRequest/);
  for (const m of source.matchAll(/openSync\(([^)]*)\)/g)) assert.match(m[1], /'r'/, 'ouverture en lecture seule');
  assert.doesNotMatch(source, /oauth_creds|google_accounts|mcp-oauth-tokens|a2a-oauth-tokens/, 'aucun fichier de jetons de l\'hôte');
});

test('T5 sorties bornées : une liste plus longue que --max est tronquée et signalée (D1.INV-3)', () => {
  const w = monde();
  try {
    for (let i = 0; i < 12; i++) ecrire(join(w.g, 'skills', `masse-${String(i).padStart(2, '0')}`, 'SKILL.md'), skill(`masse-${String(i).padStart(2, '0')}`, 'Masse.'));
    const o = appeler(w, 'composants', { max: 5 });
    assert.equal(o.composants.skills.length, 5);
    assert.ok(o.troncatures.some((t) => /^composants\.skills : \d+ éléments, 5 rendus$/.test(t)));
    const doc = appeler(w, 'doc', { maxCaracteres: 10 }, ['cli/gemini-md.md']).doc;
    assert.equal(doc.texte.length, 10);
    assert.equal(doc.tronque, true);
  } finally {
    w.nettoyer();
  }
});

// --- D2 : l'hôte -----------------------------------------------------------------------------------

test('T6 hôte désigné par --paquet : version, documentation et skills intégrés lus dans le paquet (D2.INV-1, D2.INV-2)', () => {
  const w = monde();
  try {
    const h = appeler(w, 'hote').hote;
    assert.equal(h.famille, 'gemini-cli');
    assert.equal(h.certitude, 'déclarée');
    assert.equal(h.paquet.version, '0.67.0');
    assert.equal(h.paquet.nature, 'déclaré');
    assert.equal(h.paquet.documentation.fichiers, 2);
    assert.deepEqual(h.paquet.skills_integres, ['skill-creator']);
    const invalide = appeler(w, 'hote', { paquet: w.base }).hote;
    assert.equal(invalide.paquet, null);
    assert.ok(invalide.avertissements.some((a) => a.startsWith('paquet_invalide')));
  } finally {
    w.nettoyer();
  }
});

test('T7 hôte observé : GEMINI_CLI=1 posé par l\'hôte rend la certitude « observée » (D2.INV-1)', () => {
  const w = monde({ env: { GEMINI_CLI: '1' } });
  try {
    const h = appeler(w, 'hote').hote;
    assert.equal(h.lance_par_l_hote, true);
    assert.equal(h.certitude, 'observée');
    assert.ok(h.indices.some((i) => i.nature === 'observé' && /GEMINI_CLI=1/.test(i.moyen)));
  } finally {
    w.nettoyer();
  }
});

test('T8 paquet trouvé par le PATH : nature « déduit », jamais présentée comme observée (D2.INV-1)', () => {
  const w = monde();
  try {
    const bin = join(w.base, 'bin');
    mkdirSync(bin, { recursive: true });
    if (WINDOWS) {
      ecrire(join(bin, 'gemini.cmd'), '@ECHO off\r\nnode "%dp0%\\node_modules\\@google\\gemini-cli\\bundle\\gemini.js" %*\r\n');
      ecrire(join(bin, 'node_modules', '@google', 'gemini-cli', 'package.json'), JSON.stringify({ name: '@google/gemini-cli', version: '0.67.1' }));
    } else {
      symlinkSync(join(w.paquet, 'bundle', 'gemini.js'), join(bin, 'gemini'));
    }
    const h = appeler({ ...w, env: { ...w.env, PATH: bin } }, 'hote', { paquet: undefined }).hote;
    assert.equal(h.paquet.nature, 'déduit');
    assert.equal(h.certitude, 'déduite');
    assert.equal(h.paquet.version, WINDOWS ? '0.67.1' : '0.67.0');
    if (!WINDOWS) {
      const enveloppe = join(w.base, 'bin2');
      ecrire(join(enveloppe, 'gemini'), `#!/bin/sh\nexec node "${join(w.paquet, 'bundle', 'gemini.js')}" "$@"\n`);
      const h2 = appeler({ ...w, env: { ...w.env, PATH: enveloppe } }, 'hote', { paquet: undefined }).hote;
      assert.equal(h2.paquet?.version, '0.67.0', 'script d\'enveloppe lu');
    }
  } finally {
    w.nettoyer();
  }
});

test('T9 Linux : le processus parent de l\'hôte est observé, ses options rendues, son prompt masqué (D2.INV-1, D8.INV-2)', { skip: process.platform !== 'linux' && 'les processus parents se lisent dans /proc' }, () => {
  const w = monde();
  try {
    const env = {};
    for (const [k, v] of Object.entries(process.env)) if (!/^(GEMINI|GOOGLE|SANDBOX)/.test(k)) env[k] = v;
    Object.assign(env, w.env, { SCRIPT_HOTE: SCRIPT, PATH: process.env.PATH });
    const r = spawnSync(process.execPath, [join(w.paquet, 'bundle', 'gemini.js'), '--approval-mode=yolo', '-m', 'modele-y', '-p', 'texte secret-prompt-4410', '--skip-trust'], { cwd: w.racine, env, encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const h = JSON.parse(r.stdout).hote;
    assert.equal(h.certitude, 'observée');
    assert.equal(h.paquet.nature, 'observé');
    assert.equal(h.paquet.racine, w.paquet);
    assert.deepEqual(h.arguments_de_lancement, ['--approval-mode yolo', '-m modele-y', `-p [texte masqué, ${'texte secret-prompt-4410'.length} caractères]`, '--skip-trust']);
    sansSecret(r.stdout, 'processus parent');
  } finally {
    w.nettoyer();
  }
});

test('T10 hôte non reconnu : description générique, sans configuration inventée (D2.INV-3)', () => {
  const base = mkdtempSync(join(tmpdir(), 'hote-nu-'));
  try {
    const accueil = join(base, 'accueil');
    const racine = join(base, 'projet');
    ecrire(join(racine, '.outil-x', 'skills', 'un', 'SKILL.md'), skill('un', 'Un.'));
    ecrire(join(racine, '.outil-x', 'settings.json'), '{}');
    ecrire(join(racine, 'CONSIGNES.md'), 'Consignes.\n');
    ecrire(join(racine, 'README.md'), 'Lisez-moi.\n');
    mkdirSync(accueil, { recursive: true });
    const env = { PATH: '', HOME: accueil, USERPROFILE: accueil };
    const o = M.executer('hote', { env, racine, dossierSysteme: join(base, 'systeme'), ancetres: false });
    assert.equal(o.hote.famille, 'inconnue');
    assert.equal(o.hote.certitude, 'aucune');
    assert.deepEqual(o.hote.generique.dossiers_de_configuration, [{ dossier: join(racine, '.outil-x'), indices: ['skills', 'settings.json'] }]);
    assert.deepEqual(o.hote.generique.fichiers_de_consignes, [join(racine, 'CONSIGNES.md')]);
    const c = M.executer('config', { env, racine, dossierSysteme: join(base, 'systeme'), ancetres: false });
    assert.equal(c.applicable, false);
    assert.equal(c.config, undefined);
    assert.equal(c.generique.nature, 'déduit');
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

// --- D3 : configuration -------------------------------------------------------------------------

test('T11 couches de réglages : chaque valeur effective porte sa couche, dans l\'ordre de l\'hôte (D3.INV-1)', () => {
  const w = monde();
  try {
    let c = appeler(w, 'config').config;
    assert.deepEqual(c.couches.map((x) => x.portee), ['défauts système', 'utilisateur', 'workspace', 'système']);
    assert.deepEqual(c.effectifs['model.name'], { valeur: 'modele-workspace', source: 'workspace' });
    assert.deepEqual(c.effectifs['context.includeDirectoryTree'], { valeur: true, source: 'défauts système' });
    ecrire(join(w.systeme, 'settings.json'), JSON.stringify({ model: { name: 'modele-systeme' }, general: { sessionRetention: { maxAge: '7d' }, enableAutoUpdate: false }, privacy: { usageStatisticsEnabled: false } }));
    c = appeler(w, 'config').config;
    assert.deepEqual(c.effectifs['model.name'], { valeur: 'modele-systeme', source: 'système' });
    assert.deepEqual(c.effectifs['general.sessionRetention.maxAge'], { valeur: '7d', source: 'système' });
    assert.deepEqual(c.effectifs['general.enableAutoUpdate'], { valeur: false, source: 'système' });
    assert.deepEqual(c.effectifs['privacy.usageStatisticsEnabled'], { valeur: false, source: 'système' });
    assert.equal(c.effectifs['general.sessionRetention.maxCount'], undefined, 'un réglage absent de toutes les couches n\'est pas rendu');
    assert.equal(c.effectifs['security.auth.apiKey'], undefined, 'une clé hors liste n\'est jamais rendue');
    assert.deepEqual(c.effectifs['agents.overrides'].valeur, { relecteur: { enabled: false } });
    assert.deepEqual(c.effectifs.experimental.valeur, { autoMemory: true, jeton: 'défini' });
  } finally {
    w.nettoyer();
  }
});

test('T12 JSON avec commentaires lu comme l\'hôte ; JSON cassé signalé par sa ligne, sans extrait (D3.INV-2, D8.INV-1)', () => {
  const w = monde();
  try {
    assert.deepEqual(M.lireJsonc('{ "a": "https://x//y", /* b */ "b": 1 // fin\n }'), { a: 'https://x//y', b: 1 });
    ecrire(join(w.racine, '.gemini', 'settings.json'), '{\n  "model": { "name": secret-json-casse-8823 }\n}\n');
    const c = appeler(w, 'config').config;
    const ws = c.couches.find((x) => x.portee === 'workspace');
    assert.equal(ws.lisible, false);
    assert.match(ws.erreur, /^JSON invalide( \(ligne \d+\))?$/, 'aucun extrait du fichier');
    ecrire(join(w.racine, '.gemini', 'settings.json'), '{\n  "model": { "name": "m" \n  "x": 1\n}\n');
    assert.equal(appeler(w, 'config').config.couches.find((x) => x.portee === 'workspace').erreur, 'JSON invalide (ligne 3)');
    ecrire(join(w.racine, '.gemini', 'settings.json'), '{\n  "model": { "name": secret-json-casse-8823 }\n}\n');
    assert.equal(ws.prise_en_compte, false);
    assert.deepEqual(c.effectifs['model.name'], { valeur: 'modele-utilisateur', source: 'utilisateur' });
    sansSecret(JSON.stringify(c), 'JSON cassé');
  } finally {
    w.nettoyer();
  }
});

test('T13 confiance : fichier, règle la plus longue, TRUST_PARENT, variables et réglage, comme l\'hôte (D3.INV-3)', () => {
  const cas = [
    [{ confiance: 'TRUST_FOLDER' }, 'oui', 'fichier des dossiers de confiance'],
    [{ confiance: 'DO_NOT_TRUST' }, 'non', 'fichier des dossiers de confiance'],
    [{ confiance: null }, 'indéterminée', null],
    [{ confiance: 'DO_NOT_TRUST', env: { GEMINI_CLI_TRUST_WORKSPACE: 'true' } }, 'oui', 'variable d\'environnement'],
    [{ confiance: 'TRUST_FOLDER', env: { GEMINI_CLI_TRUST_WORKSPACE: 'false' } }, 'non', 'variable d\'environnement'],
  ];
  for (const [reglage, verdict, source] of cas) {
    const w = monde(reglage);
    try {
      const c = appeler(w, 'config').config.confiance;
      assert.equal(c.verdict, verdict, JSON.stringify(reglage));
      assert.equal(c.source, source);
    } finally {
      w.nettoyer();
    }
  }
  const w = monde({ confiance: null });
  try {
    ecrire(join(w.g, 'trustedFolders.json'), JSON.stringify({ [w.depot]: 'DO_NOT_TRUST', [w.racine]: 'TRUST_FOLDER' }));
    assert.equal(appeler(w, 'config').config.confiance.verdict, 'oui', 'la règle la plus longue l\'emporte');
    ecrire(join(w.g, 'trustedFolders.json'), JSON.stringify({ [join(w.depot, 'voisin')]: 'TRUST_PARENT' }));
    assert.equal(appeler(w, 'config').config.confiance.verdict, 'oui', 'TRUST_PARENT vaut pour le dossier parent');
    ecrire(join(w.systeme, 'settings.json'), JSON.stringify({ security: { folderTrust: { enabled: false } } }));
    rmSync(join(w.g, 'trustedFolders.json'));
    assert.equal(appeler(w, 'config').config.confiance.verdict, 'oui', 'confiance désactivée : tout est fiable');
    const autre = join(w.base, 'ailleurs', 'confiance.json');
    ecrire(autre, JSON.stringify({ [w.depot]: 'DO_NOT_TRUST' }));
    rmSync(join(w.systeme, 'settings.json'));
    assert.equal(appeler({ ...w, env: { ...w.env, GEMINI_CLI_TRUSTED_FOLDERS_PATH: autre } }, 'config').config.confiance.verdict, 'non');
  } finally {
    w.nettoyer();
  }
});

test('T14 dossier non fiable : réglages, commandes, serveurs MCP, skills et contexte du workspace écartés (D3.INV-3, D4.INV-2, D5.INV-1)', () => {
  const w = monde({ confiance: 'DO_NOT_TRUST' });
  try {
    const o = appeler(w, 'tout');
    const ws = o.config.couches.find((x) => x.portee === 'workspace');
    assert.equal(ws.prise_en_compte, false);
    assert.match(ws.raison, /non fiable/);
    assert.equal(o.config.effectifs['model.name'].source, 'utilisateur');
    assert.ok(o.composants.commandes.every((c) => /non fiable/.test(c.ignore)));
    assert.ok(o.composants.serveurs_mcp.serveurs.filter((s) => s.origine === 'réglages workspace').every((s) => s.ignore));
    assert.match(o.composants.serveurs_mcp.note, /aucun serveur MCP/);
    assert.ok(o.composants.skills.filter((s) => s.portee.startsWith('workspace')).every((s) => s.ignore === 'dossier non fiable'));
    assert.match(o.contexte.projet.charge_au_demarrage, /^non/);
    assert.deepEqual(o.contexte.a_la_demande.fichiers, []);
    assert.equal(o.config.fichier_env.chemin, null, 'pas de .gemini/.env sans confiance, et aucun .env ailleurs');
  } finally {
    w.nettoyer();
  }
});

test('T15 .env que l\'hôte chargerait : .gemini/.env d\'abord, noms des variables, valeurs non secrètes seulement (D3.INV-4, D8.INV-1)', () => {
  const w = monde();
  try {
    const c = appeler(w, 'config').config;
    assert.equal(c.fichier_env.chemin, join(w.racine, '.gemini', '.env'));
    assert.deepEqual(c.fichier_env.variables, [{ nom: 'GEMINI_SYSTEM_MD', valeur: '1' }, { nom: 'GEMINI_API_KEY' }, { nom: 'MON_SECRET' }]);
    ecrire(join(w.depot, '.env'), 'AUTRE=1\n');
    rmSync(join(w.racine, '.gemini', '.env'));
    assert.equal(appeler(w, 'config').config.fichier_env.chemin, join(w.depot, '.env'), 'remontée vers les parents');
  } finally {
    w.nettoyer();
  }
});

test('T16 variables d\'environnement : présence pour les secrets, valeur pour les autres, surcharges nommées (D3.INV-4, D8.INV-1)', () => {
  const w = monde({ env: { GEMINI_API_KEY: CLE_GOOGLE, GEMINI_MODEL: 'modele-env', GEMINI_SYSTEM_MD: '/chemin/systeme.md', AUTRE_JETON: 'secret-env-3390', GEMINI_CLI: '1', CI: 'true' } });
  try {
    const c = appeler(w, 'config').config;
    assert.deepEqual(c.variables.GEMINI_API_KEY, { presente: true });
    assert.deepEqual(c.variables.GEMINI_MODEL, { presente: true, valeur: 'modele-env' });
    assert.deepEqual(c.variables.CI, { presente: true, valeur: 'true' }, 'CI met l\'hôte en mode non interactif : sa valeur est rendue');
    assert.equal(c.variables.AUTRE_JETON, undefined);
    assert.deepEqual(c.surcharges_environnement.GEMINI_MODEL, { valeur: 'modele-env', remplace: 'model.name' });
    assert.deepEqual(c.surcharges_environnement.GEMINI_SYSTEM_MD, { valeur: '/chemin/systeme.md', remplace: 'prompt système' });
    assert.equal(c.note_variables, null, 'pas de retrait de variables annoncé sans le réglage');
    ecrire(join(w.g, 'settings.json'), JSON.stringify({ security: { environmentVariableRedaction: { enabled: true } } }));
    assert.match(appeler(w, 'config').config.note_variables, /absente ici peut exister/);
    sansSecret(JSON.stringify(c), 'variables');
  } finally {
    w.nettoyer();
  }
});

// --- D4 : composants ------------------------------------------------------------------------------

test('T17 skills : paliers et alias, masquage du plus bas par le plus haut, désactivés, écarts d\'en-tête (D4.INV-1)', () => {
  const w = monde();
  try {
    const skills = appeler(w, 'composants').composants.skills;
    const alpha = skills.filter((s) => s.nom === 'alpha');
    assert.deepEqual(alpha.map((s) => s.portee), ['utilisateur', 'utilisateur (.agents)', 'workspace']);
    const gagnant = join(w.racine, '.gemini', 'skills', 'alpha', 'SKILL.md');
    assert.ok(alpha.slice(0, 2).every((s) => s.masque_par === gagnant));
    assert.equal(alpha[2].masque_par, undefined);
    assert.equal(skills.find((s) => s.nom === 'skill-creator').portee, 'intégré');
    assert.equal(skills.find((s) => s.nom === 'beta').desactive, true);
    assert.match(skills.find((s) => s.nom === 'autre-nom').ecarts[0], /différent du nom/);
    assert.deepEqual(skills.find((s) => s.nom === 'sans-entete').ecarts, ['en-tête YAML absent']);
  } finally {
    w.nettoyer();
  }
});

test('T18 sous-agents et commandes : en-têtes, noms invalides, désactivation, espaces de noms, masquage (D4.INV-1)', () => {
  const w = monde();
  try {
    const c = appeler(w, 'composants').composants;
    const relecteur = c.sous_agents.find((a) => a.nom === 'relecteur');
    assert.deepEqual(relecteur.outils, ['read_file', 'grep_search']);
    assert.equal(relecteur.description, 'Relit le code sans le modifier.');
    assert.equal(relecteur.active, false);
    assert.match(c.sous_agents.find((a) => a.nom === 'Mauvais Nom').ecarts[0], /minuscules/);
    assert.equal(c.sous_agents.find((a) => a.nom === 'aide').portee, 'extension ext-a');
    const explique = c.commandes.filter((x) => x.commande === '/hote:explique');
    assert.deepEqual(explique.map((x) => x.portee), ['utilisateur', 'workspace']);
    assert.equal(explique[0].masquee_par, join(w.racine, '.gemini', 'commands', 'hote', 'explique.toml'));
    assert.equal(c.commandes.find((x) => x.commande === '/outil').description, 'Outil');
    assert.equal(c.commandes.find((x) => x.commande === '/deployer').portee, 'extension ext-a');
  } finally {
    w.nettoyer();
  }
});

test('T19 extensions, serveurs MCP, hooks, politiques : décrits sans aucune valeur secrète (D4.INV-1, D8.INV-1)', () => {
  const w = monde();
  try {
    const c = appeler(w, 'composants').composants;
    const ext = c.extensions[0];
    assert.equal(ext.nom, 'ext-a');
    assert.deepEqual(ext.serveurs_mcp, ['distant']);
    assert.equal(ext.fichier_de_contexte, 'CONTEXTE.md');
    assert.deepEqual(ext.contient, ['commands', 'skills', 'agents']);
    assert.equal(ext.source, 'https://[masqué]@example.invalid/ext.git');
    const base = c.serveurs_mcp.serveurs.find((s) => s.nom === 'base');
    assert.equal(base.transport, 'stdio');
    assert.equal(base.commande, 'serveur-base');
    assert.deepEqual(base.arguments, ['--api-key', '[masqué]', '--token=[masqué]', 'postgresql://[masqué]@db/app']);
    assert.deepEqual(base.variables, ['MON_JETON']);
    assert.equal(base.trust, true);
    const local = c.serveurs_mcp.serveurs.find((s) => s.nom === 'local');
    assert.deepEqual(local.en_tetes, ['Authorization']);
    assert.equal(c.serveurs_mcp.serveurs.find((s) => s.nom === 'distant').adresse, 'https://mcp.example.invalid/mcp?token=[masqué]');
    assert.equal(c.serveurs_mcp.serveurs.find((s) => s.nom === 'exclu').exclu, 'mcp.excluded');
    const hook = c.hooks.hooks.find((h) => h.nom === 'journal');
    assert.equal(hook.evenement, 'BeforeTool');
    assert.match(hook.commande, /Bearer \[masqué\]/);
    const admin = c.politiques.fichiers.find((p) => p.palier === 'administrateur');
    assert.deepEqual(admin.decisions, { allow: 0, deny: 1, ask_user: 0 });
    const regles = c.politiques.fichiers.find((p) => p.fichier.endsWith('regles.toml'));
    assert.equal(regles.regles, 2);
    assert.deepEqual(regles.outils, ['glob', 'read_file', 'write_file']);
    assert.deepEqual(regles.modes, ['default', 'plan']);
    assert.deepEqual(regles.sous_agents, ['relecteur']);
    assert.equal(c.politiques.fichiers.find((p) => p.fichier.endsWith('auto-saved.toml')).approbations_enregistrees, true);
    assert.equal(c.fichiers_d_exclusion.geminiignore, join(w.racine, '.geminiignore'));
    assert.equal(c.fichiers_d_exclusion.exclusion_git, join(w.depot, '.git', 'info', 'exclude'));
    sansSecret(JSON.stringify(c), 'composants');
  } finally {
    w.nettoyer();
  }
});

// --- D5 : contexte ----------------------------------------------------------------------------------

test('T20 fichiers de contexte : global, projet jusqu\'au dépôt dans l\'ordre de l\'hôte, imports, à la demande (D5.INV-1, D5.INV-2)', () => {
  const w = monde();
  try {
    const c = appeler(w, 'contexte').contexte;
    assert.deepEqual(c.noms_de_fichiers, { noms: ['GEMINI.md'], source: 'défaut documenté de l\'hôte' });
    assert.deepEqual(c.global.fichiers.map((f) => f.chemin), [join(w.g, 'GEMINI.md')]);
    const attendus = [join(w.depot, 'GEMINI.md'), join(w.racine, 'GEMINI.md')].sort();
    assert.deepEqual(c.projet.fichiers.map((f) => f.chemin), attendus);
    assert.equal(c.projet.depot, w.depot);
    const depot = c.projet.fichiers.find((f) => f.chemin === join(w.depot, 'GEMINI.md'));
    assert.deepEqual(depot.imports, [{ cible: './docs/regles.md', existe: true }, { cible: './absent.md', existe: false }]);
    assert.deepEqual(c.a_la_demande.fichiers, [join(w.racine, 'src', 'api', 'GEMINI.md')]);
    assert.deepEqual(c.extensions, [{ extension: 'ext-a', chemin: join(w.ext, 'CONTEXTE.md'), present: true }]);
    sansSecret(JSON.stringify(c), 'contexte');
  } finally {
    w.nettoyer();
  }
});

test('T21 noms de fichiers et marqueurs réglés : AGENTS.md cherché, aucune remontée sans marqueur (D5.INV-1)', () => {
  const w = monde();
  try {
    ecrire(join(w.racine, 'AGENTS.md'), 'Consignes partagées.\n');
    ecrire(join(w.racine, '.gemini', 'settings.json'), JSON.stringify({ context: { fileName: ['AGENTS.md', 'GEMINI.md'], memoryBoundaryMarkers: [] } }));
    const c = appeler(w, 'contexte').contexte;
    assert.deepEqual(c.noms_de_fichiers, { noms: ['AGENTS.md', 'GEMINI.md'], source: 'réglages workspace' });
    assert.deepEqual(c.projet.fichiers.map((f) => f.chemin), [join(w.racine, 'AGENTS.md'), join(w.racine, 'GEMINI.md')]);
    assert.equal(c.projet.depot, null);
    assert.equal(c.projet.dossiers_parcourus, 1);
  } finally {
    w.nettoyer();
  }
});

test('T22 mémoire privée du projet et trace de la dernière session : chemins et balises, jamais le texte (D5.INV-3, D8.INV-2)', () => {
  const w = monde();
  try {
    const c = appeler(w, 'contexte').contexte;
    assert.equal(c.memoire_privee_du_projet.identifiant, 'app');
    assert.equal(c.memoire_privee_du_projet.index.present, true);
    const t = c.trace_de_session;
    assert.equal(t.sessions, 2);
    assert.match(t.fichier, /session-recente\.jsonl$/);
    assert.equal(t.debut, '2026-11-06T08:00:00.000Z');
    assert.deepEqual(t.dossiers_workspace, [w.racine]);
    assert.deepEqual(t.fichiers_de_contexte_charges, [join(w.depot, 'GEMINI.md'), join(w.racine, 'GEMINI.md')]);
    assert.deepEqual(t.balises, ['session_context', 'loaded_context', 'project_context']);
    assert.equal(t.arborescence_incluse, true);
    sansSecret(JSON.stringify(c), 'trace de session');
  } finally {
    w.nettoyer();
  }
});

test('T23 prompt système exporté : sections, skills, sous-agents, mémoires chargées ; fichier absent : code 2 (D5.INV-4)', () => {
  const w = monde();
  try {
    const exporte = join(w.base, 'systeme-exporte.md');
    ecrire(exporte, [
      '# Core Mandates', 'texte', '# Available Sub-Agents', '- codebase_investigator -> analyse', '- cli_help -> aide', '### Délégation',
      '<available_subagents>', '  <subagent>', '    <name>explicateur-hote</name>', '    <description>Explique.</description>', '  </subagent>', '</available_subagents>', '',
      'You can invoke sub-agents using the `invoke_agent` tool.', '# Available Agent Skills', '<available_skills>',
      '  <skill>', '    <name>explication-hote-ia</name>', '    <description>Explique.</description>', '    <location>/x/SKILL.md</location>', '  </skill>',
      '</available_skills>', CLOTURE, '# pas un titre', CLOTURE, '---', '<loaded_context>', '<global_context>',
      `--- Context from: ${join(w.g, 'GEMINI.md')} ---`, 'Préférences consigne-confidentielle-6604.', `--- End of Context from: ${join(w.g, 'GEMINI.md')} ---`,
      '</global_context>', '</loaded_context>', '',
    ].join('\n'));
    const p = appeler(w, 'contexte', { promptSysteme: exporte }).contexte.prompt_systeme;
    assert.deepEqual(p.titres, ['# Core Mandates', '# Available Sub-Agents', '# Available Agent Skills']);
    assert.deepEqual(p.skills, [{ nom: 'explication-hote-ia', emplacement: '/x/SKILL.md' }]);
    assert.deepEqual(p.sous_agents, ['codebase_investigator', 'cli_help', 'explicateur-hote'], 'listes des deux gabarits du prompt');
    assert.deepEqual(p.fichiers_de_contexte, [join(w.g, 'GEMINI.md')]);
    assert.deepEqual(p.balises, ['loaded_context', 'global_context']);
    assert.equal(p.outil_d_appel_des_sous_agents, 'invoke_agent');
    sansSecret(JSON.stringify(p), 'prompt exporté');
    const absent = lancer(w, ['contexte', '--paquet', w.paquet, '--dossier-systeme', w.systeme, '--prompt-systeme', join(w.base, 'absent.md')]);
    assert.equal(absent.code, 2);
  } finally {
    w.nettoyer();
  }
});

// --- Documentation embarquée --------------------------------------------------------------------------

test('T24 doc : liste et documents de la version installée ; chemin hors du dossier refusé ; absent introuvable (D2.INV-2, D1.INV-2)', () => {
  const w = monde();
  try {
    const liste = appeler(w, 'doc').doc;
    assert.deepEqual(liste.fichiers, ['cli/gemini-md.md', 'index.md']);
    assert.equal(liste.version, '0.67.0');
    const d = appeler(w, 'doc', {}, ['cli/gemini-md.md']).doc;
    assert.match(d.texte, /Contexte hiérarchique/);
    assert.equal(d.nature, 'documenté');
    for (const [chemin, code] of [['../package.json', 3], [join(w.paquet, 'package.json'), 3], ['cli/absent.md', 2], ['index.txt', 3]]) {
      const r = lancer(w, ['doc', chemin, '--paquet', w.paquet, '--dossier-systeme', w.systeme]);
      assert.equal(r.code, code, `${chemin} : ${r.erreur}`);
    }
    const texte = lancer(w, ['doc', 'cli/gemini-md.md', '--format', 'texte', '--paquet', w.paquet, '--dossier-systeme', w.systeme]);
    assert.match(texte.sortie, /^# GEMINI\.md/);
    sansSecret(texte.sortie, 'document');
    assert.throws(() => M.executer('doc', { env: { ...w.env, PATH: '' }, racine: w.racine, dossierSysteme: w.systeme, ancetres: false }), (e) => e.code === M.CODES.INTROUVABLE);
  } finally {
    w.nettoyer();
  }
});

// --- D8 : secrets ------------------------------------------------------------------------------------

test('T25 aucun secret témoin ne sort, quelle que soit la commande et le format (D8.INV-1, D8.INV-2)', () => {
  const w = monde({ env: { GEMINI_API_KEY: CLE_GOOGLE, GEMINI_CLI: '1' } });
  try {
    for (const args of [['hote'], ['config'], ['contexte'], ['composants'], ['tout'], ['tout', '--format', 'texte'], ['doc', 'cli/gemini-md.md'], ['doc', 'cli/gemini-md.md', '--format', 'texte']]) {
      const r = lancer(w, [...args, '--paquet', w.paquet, '--dossier-systeme', w.systeme]);
      assert.equal(r.code, 0, r.erreur);
      sansSecret(r.sortie + r.erreur, args.join(' '));
    }
  } finally {
    w.nettoyer();
  }
});

test('T26 masquage par motifs et arguments sensibles (D8.INV-1)', () => {
  const cas = [
    [`clé ${CLE_GOOGLE}`, 'clé [masqué]'],
    ['https://alice:mdp@hote.example/x', 'https://[masqué]@hote.example/x'],
    ['https://hote.example/x?api_key=abc&y=1', 'https://hote.example/x?api_key=[masqué]&y=1'],
    ['Authorization: Bearer abcdef123456', 'Authorization: Bearer [masqué]'],
    ['--password=abc123', '--password=[masqué]'],
    ['GITHUB_TOKEN=ghp_xyz', 'GITHUB_TOKEN=[masqué]'],
    ['jeton ghp_abcdefghijklmnopqrstuvwxyz0123456789', 'jeton [masqué]'],
    ['-----BEGIN RSA PRIVATE KEY-----\nMIIE\n-----END RSA PRIVATE KEY-----', '[masqué]'],
    ['modele-x', 'modele-x'],
  ];
  for (const [entree, attendu] of cas) assert.equal(M.masquer(entree), attendu, entree);
  assert.deepEqual(M.masquerArguments(['--api-key', 'abc', '--verbose', 'x', '--token', 'def']), ['--api-key', '[masqué]', '--verbose', 'x', '--token', '[masqué]']);
  assert.deepEqual(M.decrireArguments(['--model=m', '-p', 'bonjour', 'question libre', '--debug', '--cle=x']), ['--model m', '-p [texte masqué, 7 caractères]', '[argument masqué, 14 caractères]', '--debug', '--cle=[valeur non rendue]']);
});

// --- Utilitaires de parité ----------------------------------------------------------------------------

test('T27 clés de chemin comme l\'hôte : minuscules sous Windows pour le registre, sous Windows et macOS pour la confiance', () => {
  const p = resolve('/Dev/App');
  assert.equal(M.cleRegistre(p, 'win32'), p.toLowerCase());
  assert.equal(M.cleRegistre(p, 'darwin'), p);
  assert.equal(M.cleRegistre(p, 'linux'), p);
  assert.equal(M.cleConfiance(p, 'darwin'), p.toLowerCase());
  assert.equal(M.cleConfiance(p, 'linux'), p);
  assert.deepEqual(M.lireEnTete('---\nname: a\ndescription: |\n  ligne 1\n  ligne 2\ntools: [x, "y"]\n---\n'), { name: 'a', description: 'ligne 1 ligne 2', tools: ['x', 'y'] });
  assert.equal(M.lireEnTete('# pas d\'en-tête\n'), null);
});

test('T28 racine égale à l\'accueil : les réglages de l\'utilisateur ne sont pas comptés deux fois (D3.INV-1)', () => {
  const w = monde();
  try {
    const c = appeler({ ...w, racine: w.accueil }, 'config').config;
    const ws = c.couches.find((x) => x.portee === 'workspace');
    assert.equal(ws.prise_en_compte, false);
    assert.match(ws.raison, /accueil/);
    assert.equal(c.effectifs['model.name'].source, 'utilisateur');
  } finally {
    w.nettoyer();
  }
});
```
<<<FIN modules/recette/SKILL.md>>>

<<<FICHIER modules/diffusion/SKILL.md>>>
---
name: diffusion
description: Diffusion autonome du skill (un dossier qui se suffit et ce qu'il contient ; trois formes, le dossier, un fichier .skill ou la transmission texte ; installation par Gemini CLI, au niveau utilisateur ou du projet ; extraction et recette ; sous-agent et commandes par une commande que le développeur lance ; mise à jour et retrait complet ; autre outil ; le dépôt où le skill est maintenu ; le mode d'emploi du développeur). À lire avant d'installer, de mettre à jour, de retirer ou de diffuser le skill.
dimensions: [D12]
status: active
---

# Module `diffusion` (D12)

Phase 7E couverte : Espace et Expression.

## 1. Un dossier qui se suffit (D12.INV-1)

Le skill se diffuse seul. Son dossier contient tout ce qu'il faut pour l'installer, le vérifier et s'en servir : il ne demande que Node 20 ou plus récent et l'hôte. Aucune étape du skill ne passe par un dépôt, un outil ou un fichier extérieur au dossier, ni par le réseau ; seul l'hôte parle à son modèle, comme il le fait sans le skill.

| Élément | Rôle | Présent |
|---|---|---|
| `SKILL.md` | point d'entrée | toujours |
| `manifest.json` | version, modules, cibles | toujours |
| `modules/` | règles de l'agent ; les six fichiers exécutables y sont écrits en entier (modules `execution`, `recette` et `agent`) | toujours |
| `MODE-EMPLOI.md` | mode d'emploi du développeur : installer, vérifier, utiliser, mettre à jour, retirer, diffuser | toujours (D12.INV-3) |
| `ENTETE-TRANSMISSION.md` | consigne de la transmission texte (§ 6) | dans le dossier diffusé |
| `archives/` | points d'entrée des versions précédentes | dans le dossier diffusé |
| `scripts/`, `tests/`, `agent/`, `commandes/` | les six fichiers exécutables | après l'extraction (§ 3) |

## 2. Trois formes de diffusion

| Forme | Pour qui | Ce qu'on en fait |
|---|---|---|
| le dossier `explication-hote-ia/` | un développeur sous Gemini CLI | une copie, ou une archive zip décompressée ; `gemini skills install <dossier>` (§ 3) |
| un fichier `explication-hote-ia.skill` | le même, en un seul fichier | `gemini skills install explication-hote-ia.skill`, sans décompression préalable (§ 3) |
| la transmission texte `explication-hote-ia-<version>.md` | une IA qui ne reçoit que du texte, dans un autre outil | collée telle quelle ; l'IA matérialise le dossier et suit la consigne (§ 6) |

Un fichier `.skill` est une archive zip du dossier, dont seule l'extension change. Depuis le dossier qui contient `explication-hote-ia/` :

| Plateforme | Commande |
|---|---|
| Linux | `python3 -m zipfile -c explication-hote-ia.skill explication-hote-ia` |
| macOS, Windows 10 ou plus récent | `tar --format zip -cf explication-hote-ia.skill explication-hote-ia` |

Fait avant l'extraction, le fichier ne contient pas les six fichiers exécutables : l'extraction les écrit après l'installation. Fait après, il les contient ; l'extraction les réécrit de toute façon depuis les modules et vérifie leurs empreintes.

## 3. Installer dans Gemini CLI (D12.INV-2)

1. `gemini skills install <dossier ou fichier .skill>`. Gemini CLI cherche un `SKILL.md` dans le dossier et dans ses sous-dossiers directs, puis copie le dossier du skill dans `~/.gemini/skills/explication-hote-ia/`, pour tous les projets (`$GEMINI_CLI_HOME/.gemini/skills/` si cette variable est posée). `--scope workspace` l'installe dans `.gemini/skills/` du projet ; `--consent` passe la demande de confirmation. Il ne trouve qu'un skill, `explication-hote-ia` : les `SKILL.md` des modules sont deux niveaux plus bas et ne sont jamais pris pour des skills (code de Gemini CLI 0.67.0 relu, essai réel par la recette des repères ; la commande est documentée dans `cli/skills.md`). Une installation existante est remplacée d'un bloc : le dossier installé est supprimé, fichiers extraits compris, puis recopié.
2. Depuis le dossier installé, la commande d'extraction du module `execution`, § 8 : elle écrit les six fichiers et compare leurs empreintes à celles du tableau ; un écart arrête l'installation.
3. La recette, depuis le même dossier : `node --test tests/instantane-hote.test.mjs`, au bilan du module `recette`, § 1. Un échec arrête l'installation et se rapporte tel quel, sans modifier le script.
4. Dans une session ouverte, `/skills reload`, puis `/skills list` ; sinon, la session suivante le découvre. À la première activation, l'hôte demande au développeur d'autoriser le skill.

Au niveau du projet, si git ignore `.gemini/` ou le dossier du skill (`.gitignore`, `.git/info/exclude`), les outils de lecture de l'hôte ne livrent du skill que son `SKILL.md` (module `composants`, § 8) : ajouter à `.geminiignore` les lignes `!/.gemini/`, `!/.gemini/skills/` et `!/.gemini/skills/explication-hote-ia/`. Le niveau utilisateur, hors du projet, n'a pas ce piège : c'est le niveau conseillé.

## 4. Le sous-agent et les commandes (D12.INV-4)

Le sous-agent `explicateur-hote` et les commandes `/hote:explique`, `/hote:carte` et `/hote:pourquoi` vivent dans les dossiers de l'hôte, hors du dossier du skill : ils ne s'installent qu'à la demande du développeur. Depuis le dossier du skill, une fois les six fichiers extraits, cette commande copie `agent/explicateur-hote.md` dans `~/.gemini/agents/`, en remplaçant, dans la copie, `<DOSSIER_DU_SKILL>` par le chemin du dossier courant, et les trois commandes dans `~/.gemini/commands/hote/` (`$GEMINI_CLI_HOME/.gemini/` si cette variable est posée). Comme celle d'extraction, elle ne contient ni `$`, ni accent grave, ni `!`, ni `%`, ni guillemet intérieur, et n'emploie que des caractères ASCII : elle se colle telle quelle dans bash, zsh, CMD ou PowerShell.

```text
node -e "const fs = require('node:fs'), path = require('node:path'), os = require('node:os'); const gemini = path.join(process.env.GEMINI_CLI_HOME || os.homedir(), '.gemini'); const agent = path.join(gemini, 'agents', 'explicateur-hote.md'), commandes = path.join(gemini, 'commands', 'hote'); if (fs.existsSync(path.join('agent', 'explicateur-hote.md')) === false) { console.error('agent/explicateur-hote.md absent : lancer cette commande depuis le dossier du skill, une fois les six fichiers extraits'); process.exitCode = 1; } else { fs.mkdirSync(path.dirname(agent), { recursive: true }); fs.mkdirSync(commandes, { recursive: true }); fs.writeFileSync(agent, fs.readFileSync(path.join('agent', 'explicateur-hote.md'), 'utf8').split('<DOSSIER_DU_SKILL>').join(process.cwd())); for (const f of ['explique.toml', 'carte.toml', 'pourquoi.toml']) fs.copyFileSync(path.join('commandes', 'hote', f), path.join(commandes, f)); console.log('copie     ' + agent); console.log('copie     ' + commandes); }"
```

Elle écrit `copie` et le chemin de chaque copie ; lancée hors du dossier du skill, elle le dit et sort avec le code 1, sans rien écrire. Puis, dans une session ouverte, `/agents reload` et `/commands reload`. Le fichier du skill ne change jamais : seule la copie installée s'adapte. L'agent ne lance cette commande que sur demande explicite du développeur, après la lui avoir montrée (D7.INV-2).

## 5. Mettre à jour, retirer

- **Nouvelle version du skill** : `gemini skills install` avec la nouvelle version remplace le dossier installé ; refaire l'extraction et la recette (§ 3), puis, si le développeur les avait installés, la commande du § 4, qui réécrit le sous-agent et les commandes.
- **Nouvelle version de Gemini CLI** : rien à refaire. L'agent observe la version, cite ses repères « à revérifier » et lit la documentation installée (D6.INV-5).
- **Retirer** : cette commande, lancée de n'importe où, supprime le sous-agent, les trois commandes, et le dossier `commands/hote/` s'il reste vide ; elle écrit `supprime` et le chemin de chaque fichier. Puis `gemini skills uninstall explication-hote-ia` retire le skill, avec `--scope workspace` s'il est installé au niveau du projet. Le skill n'a rien écrit d'autre hors de son dossier.

```text
node -e "const fs = require('node:fs'), path = require('node:path'), os = require('node:os'); const gemini = path.join(process.env.GEMINI_CLI_HOME || os.homedir(), '.gemini'); const commandes = path.join(gemini, 'commands', 'hote'); for (const f of [path.join(gemini, 'agents', 'explicateur-hote.md'), ...['explique.toml', 'carte.toml', 'pourquoi.toml'].map((n) => path.join(commandes, n))]) if (fs.existsSync(f)) { fs.rmSync(f); console.log('supprime  ' + f); } if (fs.existsSync(commandes) && fs.readdirSync(commandes).length === 0) fs.rmdirSync(commandes);"
```

## 6. Dans un autre outil

La transmission texte porte le point d'entrée, le manifeste, les modules et `MODE-EMPLOI.md`, sa consigne en tête (`ENTETE-TRANSMISSION.md`) : l'IA qui la reçoit matérialise le dossier dans `.skills/explication-hote-ia/`, vérifie chaque fichier contre la table d'intégrité, puis suit la consigne. Un outil qui lit des dossiers n'a besoin que du dossier : son IA lit `SKILL.md`, puis le module `agent`, § 2.

Dans Gemini CLI, un dossier matérialisé à partir de la transmission ne devient un skill de l'hôte, découvert dans toutes les sessions, qu'une fois installé : `gemini skills install .skills/explication-hote-ia`, après l'extraction et la recette. La commande du § 4 se lance alors depuis le dossier installé, pour que le sous-agent désigne celui-là.

## 7. Le dépôt où le skill est maintenu (D12.INV-5)

Le skill est maintenu dans le dépôt Agent2Prompt : sa spécification, ses transmissions et ses archives y sont versionnées. Ce dépôt n'est jamais une étape. Le contrat de version, les règles et la recette du skill sont écrits dans le skill (point d'entrée, § 7 et § 8 ; module `recette`). Le dépôt est seulement le lieu où les mainteneurs vérifient chaque version : la recette en intégration continue, sous Linux et sous Windows, et la recette des repères contre le Gemini CLI réel, qui installe le skill comme le dit le mode d'emploi (module `recette`, § 4 et § 5).

## 8. Le mode d'emploi (D12.INV-3)

`MODE-EMPLOI.md` s'adresse au développeur. Il voyage avec le dossier et avec la transmission, et porte la version du skill. Ses commandes sont celles de ce module et du module `execution`, § 8, à l'identique ; ses renvois ne sortent pas du dossier. L'agent y renvoie le développeur pour l'installation et l'usage, et le suit quand il le guide.

## 9. Contrôle de sortie

- Installer, vérifier, utiliser : rien d'autre que le dossier, Node 20 ou plus récent et l'hôte (D12.INV-1).
- Dans Gemini CLI : `gemini skills install`, un seul skill, extraction vérifiée, recette ; un écart arrête l'installation (D12.INV-2).
- Mode d'emploi joint, à la version du skill, mêmes commandes (D12.INV-3).
- Hors du dossier du skill, rien sans demande du développeur ; un retrait qui ne laisse rien (D12.INV-4).
- Le dépôt nommé comme origine et lieu de vérification, jamais comme étape (D12.INV-5).
<<<FIN modules/diffusion/SKILL.md>>>

<<<FICHIER MODE-EMPLOI.md>>>
# Mode d'emploi d'explication-hote-ia

Ce mode d'emploi accompagne le skill `explication-hote-ia`, version 1.1.0 : un agent qui explique le fonctionnement de Gemini CLI en vous le montrant sur votre poste. Pendant qu'il explique, il ne modifie rien.

Ce dossier se suffit. Il contient le skill, son script, sa recette et ce mode d'emploi : pour l'installer et vous en servir, il ne faut que Gemini CLI et Node, sans dépôt à cloner ni outil à télécharger. L'installation n'utilise pas le réseau ; ensuite, seul Gemini CLI parle à son modèle, comme il le fait sans le skill.

## Ce qu'il faut

- Gemini CLI, installé et connecté. Le skill est vérifié avec Gemini CLI 0.67.0 ; avec une autre version, l'agent signale ses repères « à revérifier » et lit la documentation de la vôtre.
- Node 20 ou plus récent (`node --version`) ; vérifié jusqu'à Node 26.13.0.
- Linux, WSL2, macOS ou Windows.
- Le dossier `explication-hote-ia/`, ou le fichier `explication-hote-ia.skill` qu'on vous a transmis.

## Installer, une fois

```mermaid
flowchart LR
  A(["dossier ou<br/>fichier .skill"]) -->|"1. gemini skills install"| B["~/.gemini/skills/<br/>explication-hote-ia/"]
  B -->|"3. extraction"| C["script, recette,<br/>sous-agent, commandes"]
  C -->|"4. recette"| D{"tests réussis ?"}
  D -->|"oui"| E["5. sous-agent et commandes<br/>(facultatif)"]
  E --> G(["6. Gemini CLI :<br/>/skills reload"])
  D -->|"non"| X["s'arrêter et signaler le bilan"]
```

### 1. Installer le skill dans Gemini CLI

Dans un terminal :

```bash
gemini skills install <chemin du dossier explication-hote-ia, ou du fichier .skill>
```

Gemini CLI vous montre le skill qu'il a trouvé et vous demande de confirmer. Il le copie dans `~/.gemini/skills/explication-hote-ia/`, pour tous vos projets, et affiche son emplacement exact (« location »). Pour un seul projet, lancez la commande depuis la racine du projet avec `--scope workspace` : le skill va alors dans `.gemini/skills/` du projet (voir « Dépannage » si git ignore ce dossier).

### 2. Ouvrir un terminal dans le dossier installé

| Terminal | Commande |
|---|---|
| bash ou zsh (Linux, macOS, WSL2) | `cd ~/.gemini/skills/explication-hote-ia` |
| PowerShell | `cd $HOME\.gemini\skills\explication-hote-ia` |
| CMD | `cd /d "%USERPROFILE%\.gemini\skills\explication-hote-ia"` |

Installé pour un projet : `cd .gemini/skills/explication-hote-ia`, depuis la racine du projet.

### 3. Écrire les six fichiers exécutables

Le script, sa recette, le sous-agent et les trois commandes sont écrits en entier dans les modules du skill. Cette commande les recopie à côté, à l'identique, et vérifie l'empreinte de chacun. Elle n'écrit que dans ce dossier et n'utilise pas le réseau. Collez-la telle quelle, dans n'importe lequel de ces terminaux :

<!-- commande : extraction -->
```text
node -e "const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'); const attendu = { 'scripts/instantane-hote.mjs': 'ae296517f6670e0d0499db9c6d03d8550596b6eee4e7be69335c72e359fdd34d', 'tests/instantane-hote.test.mjs': 'c66a1ff94ebe065d9fe0197ccc6af8f9d1d48798c89b53fb903b7de6625e0b17', 'agent/explicateur-hote.md': 'e38d01c3ea9dbb77c414f7c0209974d99183e4c7910c8c8fc821c26af091475e', 'commandes/hote/explique.toml': 'cfd784a3449c1ac6f5914da112b9e0daa79bc1e52cdbc0721a4d94d894dbce6a', 'commandes/hote/carte.toml': 'e2d9ab278eca3c9e22a97b4f10f09bda0455abe021aa9931b8f96cecd8ce042b', 'commandes/hote/pourquoi.toml': '09a0ae500aa33c2587925b379801b84c3886e06a0fa7c7fd5c9dd4fdd8095720' }; const vus = new Set(); let ecarts = 0; for (const module of ['modules/execution/SKILL.md', 'modules/recette/SKILL.md', 'modules/agent/SKILL.md']) { const texte = fs.readFileSync(module, 'utf8').replace(/\r\n/g, '\n'); for (const m of texte.matchAll(/^<\x21-- fichier : (\S+) -->\n\x60{3}[a-z]*\n([\s\S]*?)\n\x60{3}\n/gm)) { const contenu = m[2] + '\n'; fs.mkdirSync(path.dirname(m[1]), { recursive: true }); fs.writeFileSync(m[1], contenu); vus.add(m[1]); const conforme = crypto.createHash('sha256').update(contenu).digest('hex') === attendu[m[1]]; if (conforme === false) ecarts++; console.log((conforme ? 'conforme  ' : 'ECART     ') + m[1]); } } for (const f of Object.keys(attendu)) if (vus.has(f) === false) { ecarts++; console.log('ABSENT    ' + f); } if (ecarts > 0) process.exitCode = 1;"
```

Attendu : six lignes `conforme`. Une ligne `ECART` ou `ABSENT` arrête l'installation : réinstallez le skill (étape 1), puis recommencez.

### 4. Vérifier

```bash
node --test tests/instantane-hote.test.mjs
```

Attendu : 28 tests réussis sous Linux et WSL2 ; 27 réussis et 1 sauté sous Windows et macOS (le test T9 lit `/proc`, propre à Linux). La recette ne lance pas Gemini CLI et n'utilise pas le réseau. En cas d'échec, arrêtez-vous là et transmettez le bilan à qui vous a diffusé le skill.

### 5. Le sous-agent et les commandes (facultatif)

Ils ajoutent les commandes `/hote:explique`, `/hote:carte` et `/hote:pourquoi`, et le sous-agent `explicateur-hote`. Ils s'installent hors du dossier du skill, dans `~/.gemini/agents/` et `~/.gemini/commands/hote/` : seulement si vous le voulez. Depuis le même dossier :

<!-- commande : sous-agent-et-commandes -->
```text
node -e "const fs = require('node:fs'), path = require('node:path'), os = require('node:os'); const gemini = path.join(process.env.GEMINI_CLI_HOME || os.homedir(), '.gemini'); const agent = path.join(gemini, 'agents', 'explicateur-hote.md'), commandes = path.join(gemini, 'commands', 'hote'); if (fs.existsSync(path.join('agent', 'explicateur-hote.md')) === false) { console.error('agent/explicateur-hote.md absent : lancer cette commande depuis le dossier du skill, une fois les six fichiers extraits'); process.exitCode = 1; } else { fs.mkdirSync(path.dirname(agent), { recursive: true }); fs.mkdirSync(commandes, { recursive: true }); fs.writeFileSync(agent, fs.readFileSync(path.join('agent', 'explicateur-hote.md'), 'utf8').split('<DOSSIER_DU_SKILL>').join(process.cwd())); for (const f of ['explique.toml', 'carte.toml', 'pourquoi.toml']) fs.copyFileSync(path.join('commandes', 'hote', f), path.join(commandes, f)); console.log('copie     ' + agent); console.log('copie     ' + commandes); }"
```

Attendu : deux lignes `copie`, chacune avec l'emplacement d'une copie. Le sous-agent installé désigne ce dossier : si vous déplacez ou réinstallez le skill ailleurs, relancez cette commande depuis le nouveau dossier.

### 6. Dans Gemini CLI

Si une session est déjà ouverte, tapez `/skills reload`, puis `/agents reload` et `/commands reload` si vous avez fait l'étape 5 ; sinon, la prochaine session les trouve. `/skills list` doit montrer `explication-hote-ia`.

## Premiers pas

Dans une session interactive, c'est-à-dire Gemini CLI lancé sans `-p`, demandez « explique-moi comment tu fonctionnes », ou tapez `/hote:explique`. Gemini CLI vous demande d'autoriser le skill, puis le petit script de lecture qu'il lance : c'est vous qui décidez.

L'agent propose le parcours découverte, sept questions, une à la fois :

1. Qu'est-ce que c'est, au juste ?
2. Que reçoit le modèle quand je tape une demande ?
3. Que voit-il de mon code ?
4. Comment décide-t-il d'agir ?
5. Peut-il modifier ou casser quelque chose ?
6. Où partent mes données, et que retient-il ?
7. Peut-il se tromper, et comment le vérifier ?

Chacune en trois temps : la réponse simple, ce qu'elle montre sur votre poste, ce que vous gardez en main. Après chaque étape, vous continuez, vous approfondissez ou vous arrêtez.

### Lire une réponse

L'agent dit d'où il tient chaque affirmation :

| Il dit | Cela veut dire |
|---|---|
| « vu sur votre poste » | il vient de l'observer |
| « d'après ce que je vois de mon propre contexte » | il le voit dans ce qu'il a reçu, sans pouvoir le vérifier |
| « d'après la documentation de Gemini CLI 0.67.0 » | la documentation de la version installée le dit |
| « j'en déduis » | il le conclut de ce qu'il a observé |
| « je ne peux pas le savoir d'ici » | aucune source ne le lui dit ; il indique comment le vérifier |

Il ne tire de sa propre impression ni son modèle, ni sa version, ni ses limites. Pour ces questions, il vous demande de lancer une commande de l'interface, comme `/about` ou `/stats model`, et de coller ce qu'elle affiche.

## Utiliser

### Les trois modes

| Mode | Commande, ou demande | Ce que l'agent rend |
|---|---|---|
| expliquer | `/hote:explique [question]` | sans question, le parcours découverte ; avec une question, le mécanisme demandé, puis ce qui en est en place chez vous |
| carte | `/hote:carte`, « qu'est-ce qui est actif ici ? » | réglages et leur couche, confiance du dossier, fichiers de contexte, composants actifs, masqués ou ignorés |
| pourquoi | `/hote:pourquoi <comportement>`, « pourquoi ce skill n'apparaît pas ? » | un diagnostic : chaque hypothèse confirmée ou écartée par une observation nommée, la cause retenue, la correction décrite sans être appliquée |

Pour la carte et le diagnostic, l'agent écrit ses étiquettes sous leur forme courte : `[observé]`, `[déclaré]`, `[documenté]`, `[déduit]`, `[inconnu]`.

### Le sous-agent

Le sous-agent `explicateur-hote` a son propre contexte : il voit votre installation, pas la conversation qui l'appelle. Il sert à la carte et au diagnostic, sans encombrer votre session : « @explicateur-hote fais la carte de cette installation ». Les questions sur la session en cours se posent dans la session principale.

### Voir l'envoi exact

Le texte exact des instructions système que Gemini CLI envoie au modèle s'obtient en l'exportant :

```bash
GEMINI_WRITE_SYSTEM_MD=~/systeme-exporte.md gemini
```

Le fichier est écrit au démarrage ; quittez ensuite avec `/quit`. Donnez un chemin hors du projet, jamais la valeur `1`. Ne versionnez pas le fichier : il contient vos mémoires. Puis : `/hote:explique analyse le prompt exporté ~/systeme-exporte.md`.

### Ce qui sort du poste

Avec les réglages par défaut, Gemini CLI envoie, en plus des requêtes au modèle, des statistiques d'usage à `play.googleapis.com`, même en mode non interactif. En mode interactif, il cherche aussi une mise à jour sur `registry.npmjs.org`. Ces deux sorties continuent même quand l'API du modèle est locale. Ces réglages, dans `~/.gemini/settings.json`, les coupent :

```json
{
  "privacy": { "usageStatisticsEnabled": false },
  "general": { "enableAutoUpdate": false, "enableAutoUpdateNotification": false }
}
```

Derrière un proxy d'entreprise, sous Node 26 (constaté avec Node 26.13.0), la connexion par compte Google passe par le proxy de `HTTPS_PROXY`. En revanche, les requêtes au modèle par clé d'API Gemini, les statistiques d'usage et la recherche de mise à jour partent en direct. Lancer Gemini CLI avec `NODE_USE_ENV_PROXY=1` dans l'environnement les ramène au proxy. Sous Node 22 et 24, tout suit le proxy.

L'agent montre ces réglages chez vous, avec leur couche. Il décrit une modification ; il ne l'applique que si vous le lui demandez explicitement.

### Le script

Depuis la racine de votre projet :

```bash
node ~/.gemini/skills/explication-hote-ia/scripts/instantane-hote.mjs <commande> [--format texte]
```

| Commande | Effet |
|---|---|
| `hote` | famille de l'hôte et nature de la preuve, paquet, version, documentation embarquée, options de lancement sous Linux et WSL |
| `config` | couches de réglages, valeur effective et couche de chaque réglage observé, confiance du dossier, `.env`, variables |
| `contexte` | fichiers de contexte par palier, imports, mémoire privée, trace de la dernière session ; `--prompt-systeme <fichier>` pour un prompt exporté |
| `composants` | skills, sous-agents, commandes, extensions, serveurs MCP, hooks, politiques, fichiers d'exclusion |
| `doc [chemin]` | documentation embarquée : la liste, ou un document |
| `tout` | les quatre premières ensemble |

Codes de sortie : 0 réussite, 1 usage, 2 introuvable, 3 chemin refusé, 4 erreur interne. Le script ne fait que lire : il ne crée aucun fichier, ne lance aucun processus et n'ouvre aucune connexion. Il rend des noms, jamais de valeurs secrètes, et aucun texte de conversation.

### Ce qui ne se négocie pas

- Rien n'est modifié pendant une explication. Une modification de configuration se décrit (fichier, clé, valeur, effet) et ne s'applique que sur votre demande explicite.
- Aucune valeur secrète n'est recopiée, ni dans une réponse, ni dans un fichier.
- Aucune réassurance sans source : une limite ou un risque se dit aussi clairement qu'un garde-fou.
- La documentation de la version installée fait foi ; un repère d'une autre version se signale « à revérifier ».

## Mettre à jour

- **Nouvelle version du skill** : refaites les étapes 1 à 4 avec la nouvelle version ; `gemini skills install` remplace le dossier installé, fichiers extraits compris. Puis l'étape 5, si vous l'aviez faite.
- **Nouvelle version de Gemini CLI** : rien à faire. L'agent observe la version, signale ses repères « à revérifier » et lit la documentation de la version installée.

## Retirer

Cette commande, à lancer de n'importe où, supprime le sous-agent et les trois commandes, s'ils sont installés ; elle écrit `supprime` et l'emplacement de chaque fichier :

<!-- commande : retrait -->
```text
node -e "const fs = require('node:fs'), path = require('node:path'), os = require('node:os'); const gemini = path.join(process.env.GEMINI_CLI_HOME || os.homedir(), '.gemini'); const commandes = path.join(gemini, 'commands', 'hote'); for (const f of [path.join(gemini, 'agents', 'explicateur-hote.md'), ...['explique.toml', 'carte.toml', 'pourquoi.toml'].map((n) => path.join(commandes, n))]) if (fs.existsSync(f)) { fs.rmSync(f); console.log('supprime  ' + f); } if (fs.existsSync(commandes) && fs.readdirSync(commandes).length === 0) fs.rmdirSync(commandes);"
```

Puis, pour le skill lui-même :

```bash
gemini skills uninstall explication-hote-ia
```

Ajoutez `--scope workspace` s'il est installé pour un projet. Le skill n'a rien écrit d'autre hors de son dossier.

## Diffuser le skill

Le skill se diffuse seul, sous l'une de ces formes :

| Forme | Pour qui | Comment |
|---|---|---|
| ce dossier, `explication-hote-ia/` | un développeur sous Gemini CLI | une copie, ou une archive zip à décompresser |
| un fichier `explication-hote-ia.skill` | le même, en un seul fichier | une archive zip du dossier, à l'extension `.skill` (ci-dessous) |
| la transmission texte `explication-hote-ia-1.1.0.md` | l'IA d'un autre outil, qui ne reçoit que du texte | à coller telle quelle : l'IA matérialise le dossier, ce mode d'emploi compris, et suit la consigne écrite en tête |

Pour faire le fichier `.skill`, depuis le dossier qui contient `explication-hote-ia/` :

| Plateforme | Commande |
|---|---|
| Linux | `python3 -m zipfile -c explication-hote-ia.skill explication-hote-ia` |
| macOS, Windows 10 ou plus récent | `tar --format zip -cf explication-hote-ia.skill explication-hote-ia` |

Le dossier contient :

| Élément | Rôle |
|---|---|
| `MODE-EMPLOI.md` | ce mode d'emploi |
| `SKILL.md`, `manifest.json` | le point d'entrée du skill, sa version et la liste de ses modules |
| `modules/` | les règles de l'agent, et le texte des six fichiers exécutables |
| `ENTETE-TRANSMISSION.md` | la consigne de la transmission texte |
| `archives/` | les points d'entrée des versions précédentes |
| `scripts/`, `tests/`, `agent/`, `commandes/` | les six fichiers, une fois extraits (étape 3) |

Le skill est maintenu dans le dépôt Agent2Prompt. Chaque version y est vérifiée avant d'être diffusée : la recette sous Linux et sous Windows, et cette procédure d'installation, rejouée contre le vrai Gemini CLI. Vous n'avez pas besoin de ce dépôt, ni pour installer le skill, ni pour vous en servir.

## Dépannage

| Symptôme | Cause probable | Remède |
|---|---|---|
| `gemini skills install` répond « No valid skills found » | le chemin ne désigne ni le dossier du skill, ni le dossier qui le contient, ni le fichier `.skill` | désigner le dossier qui contient `SKILL.md`, ou le fichier `.skill` |
| `ECART` ou `ABSENT` à l'étape 3 | la commande a été tronquée au collage, ou un module a changé depuis la diffusion | recoller la commande en entier ; sinon, réinstaller (étape 1) |
| l'étape 5 répond « agent/explicateur-hote.md absent » | commande lancée hors du dossier du skill, ou avant l'étape 3 | se placer dans le dossier installé (étape 2), puis faire l'étape 3 |
| `explication-hote-ia` absent de `/skills list` | session ouverte avant l'installation | `/skills reload`, ou une nouvelle session |
| installé pour un projet, l'agent ne lit pas ses modules | git ignore `.gemini/` : les outils de lecture de Gemini CLI ne livrent alors que `SKILL.md` | ajouter à `.geminiignore` les lignes `!/.gemini/`, `!/.gemini/skills/` et `!/.gemini/skills/explication-hote-ia/` ; ou installer pour tous vos projets |
| `/hote:explique` inconnu | commandes non installées (étape 5), ou dossier non fiable : Gemini CLI ignore alors toute commande personnalisée, même celles de l'utilisateur | demander « explique-moi comment tu fonctionnes » ; ou faire l'étape 5, `/commands reload`, et faire confiance au dossier |
| le skill ne s'active pas avec `gemini -p` | mode non interactif : `activate_skill` et `run_shell_command` ne sont pas déclarés au modèle | une session interactive |
| la version rendue n'est pas celle de `/about` | le paquet trouvé par le PATH n'est pas celui qui s'exécute | `--paquet` vers le paquet qui s'exécute |
| `contexte` ne trouve pas le `GEMINI.md` du projet | script lancé hors de la racine du projet | relancer depuis la racine, ou `--racine` |
| la trace de session décrit une autre conversation | plusieurs sessions sur le projet, ou une session sans tour abouti, que Gemini CLI supprime au lancement suivant | comparer `debut` à l'heure de la session ; `/memory list` fait foi |
| le sous-agent dit qu'il ne voit pas la session | normal : son contexte est séparé | poser la question dans la session principale, skill activé |
| la recette saute T9 | Windows ou macOS : T9 lit `/proc` | normal |
<<<FIN MODE-EMPLOI.md>>>

<<<FICHIER modules/autres-hotes/SKILL.md>>>
---
name: autres-hotes
description: Dimension réservée D10, autres hôtes reconnus chacun par un adaptateur (contrat d'un adaptateur, place déjà posée par le point d'extension E1, ce qui reste interdit en 1.x). À lire seulement pour comprendre le point d'extension E1 ; ne pas appliquer en 1.x.
dimensions: [D10]
status: reserved
---

# Module `autres-hotes` (D10, réservée)

Phase 7E couverte : Évolutif.

## 1. Place réservée

En 1.x, le skill ne reconnaît que Gemini CLI. Tout autre hôte se décrit par ce qui s'en observe, sans nom ni configuration prêtés (D2.INV-3) : `hote.famille` vaut `inconnue`, et `hote.generique` rend les candidats déduits (point d'extension E1). La recette vérifie cette inertie (T10).

## 2. Contrat d'un futur adaptateur

Une version mineure pourra activer D10, à la demande du développeur et avec des repères vérifiés comme ceux du module `modele-hote`. Chaque adaptateur apportera :

- ses indices de reconnaissance, chacun avec la nature de sa preuve, sur le modèle du module `hote`, § 2 ;
- ses emplacements : réglages et leur ordre, fichiers de contexte, composants, sessions, documentation embarquée s'il en a une ;
- ses repères, datés, sourcés et rejoués par une recette contre l'hôte réel ;
- aucune clé nouvelle dans les objets de `config`, `contexte` et `composants`, dont le schéma reste celui de la version 1 : les différences passent par `hote.famille` et par des valeurs, pas par des clés.

## 3. Interdits en 1.x

- Aucun autre hôte n'est nommé, ni dans le script, ni dans les modules, ni dans les réponses de l'agent.
- Aucune configuration n'est déduite d'un nom de dossier : un candidat reste un candidat.
<<<FIN modules/autres-hotes/SKILL.md>>>

<<<FICHIER modules/comparaison/SKILL.md>>>
---
name: comparaison
description: Dimension réservée D11, comparaison de deux instantanés dans le temps (usage visé, place posée par le point d'extension E2, commande comparer réservée, ce que la comparaison devra respecter). À lire seulement pour comprendre le point d'extension E2 ; ne pas appliquer en 1.x.
dimensions: [D11]
status: reserved
---

# Module `comparaison` (D11, réservée)

Phase 7E couverte : Évolutif.

## 1. Usage visé

« Hier, ce skill s'activait ; aujourd'hui, non. » Expliquer un changement de comportement demande de comparer deux états de l'installation. D11 comparera deux instantanés enregistrés par le développeur, et nommera ce qui a changé : version de l'hôte, couche et valeur d'un réglage, confiance, fichiers de contexte, composants apparus, disparus, masqués ou ignorés.

## 2. Place réservée

- Chaque objet porte déjà `schema`, `version` et `date`, et ses clés ont un sens stable pour un même numéro de schéma (point d'extension E2).
- La commande `comparer` est réservée : elle sort avec le code 1, sans rien lire (D1.INV-2). La recette vérifie cette inertie (T1).

## 3. Ce que la comparaison devra respecter

- Le script ne fait que lire (D1.INV-1) : les deux instantanés seront des fichiers que le développeur aura écrits lui-même, par redirection de la sortie.
- Aucune valeur secrète ne sortira de la comparaison, pas plus que des instantanés (D8.INV-1).
- Deux instantanés de schémas différents ne se comparent pas : la commande le dira.
<<<FIN modules/comparaison/SKILL.md>>>

---

# Table d'intégrité (sha256)

Format compatible `sha256sum -c`, à exécuter depuis le dossier où les fichiers ont été matérialisés.

    f7862f3dc221df8ec8d83b0c8ed2b2aade9531551b3c9bf6ccb0d277b12aa503  manifest.json
    55819b6cc4c4c46154d05cf439f45c4e78746fdd6503cbe867c4535f14b8be3c  SKILL.md
    316a821cd76189b5d9a16a01aad8a8e1ebe10d9ec3e318b5f489f8ceafba24ba  modules/provenance/SKILL.md
    a97cf03d073678d38fd570cc94857e4ecb78b8199c4ff186cb14ad5d1f685f3b  modules/execution/SKILL.md
    fa2d6e522b59c84096f447d43c86413232d021533094f0e6824b5604a0a5dec1  modules/hote/SKILL.md
    f3ed316f545370f2b9d2fe6154ad08b12a3663916959dbc4ee04f3f44b422812  modules/configuration/SKILL.md
    5d2c275adee44473818bbb1e151baf76218c93599cb9ab353d564a50e707eeb8  modules/contexte/SKILL.md
    db0866c628076cb1a9d00bdf33cf79ea6b282eef7f6fc1cfd8dc33b3590f92e6  modules/composants/SKILL.md
    892164160e28737bf1faab5b02fdf0351e33669f735037c45ee8c7a4d54fed9d  modules/secrets/SKILL.md
    8f74a0578c44396a12ffba7dbf24e7a89decce1d344e4f6f0e06c1b4385acaf1  modules/modele-hote/SKILL.md
    5e239854e8df0f1531333fdb40ede74cc6d719acdf7a27393b9f8264de0df0f9  modules/diagnostic/SKILL.md
    5824fe9cd426bd35886171f5ae3fc9fa024002cbce1fbeb8a85b9da55146d91f  modules/agent/SKILL.md
    fc83fffefa4290ce568c3b2eb4396a78b1d7a8576490ccac4cbe550fce8c9380  modules/recette/SKILL.md
    3c2b12a79aa3c0fdec79709595b5000b5996fa2dd2b4d3252067b1cda3272d28  modules/diffusion/SKILL.md
    51f5551c71bd9f6a64cfa10acf731127fb32fa9be42cc827246a34670c226425  MODE-EMPLOI.md
    51fccca2240e02fbd8769554b25f8b3542848f67572e609d31ddbdb3b9744178  modules/autres-hotes/SKILL.md
    dbc3453f05c5025fe75a9d3ae4b34e4d0cc6713de4bba800590bef394b29fc4f  modules/comparaison/SKILL.md
