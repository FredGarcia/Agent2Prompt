# Scénarios côté utilisateur avec Playwright : skill scenario-playwright 1.1.1, transmission texte

Ce texte contient à la fois la consigne de travail et le skill complet. Il n'y a aucune pièce jointe. Le skill est découpé en fichiers, chacun délimité ainsi :

    <<<FICHIER chemin/relatif>>>
    ...contenu exact du fichier...
    <<<FIN chemin/relatif>>>

---

À partir de maintenant, tu installes le skill scenario-playwright décrit par ce texte sur le poste du développeur, tu le fais fonctionner, puis tu peux importer de Jira, traduire, faire ratifier et jouer ses scénarios comme son agent. Le skill fait foi. Si tu relèves une ambiguïté ou une contradiction dans le skill, signale-la au développeur. Ne corrige pas le skill toi-même, ni ses scripts.

## Étape 0 : matérialiser le skill

Si le développeur dispose d'un clone du dépôt Agent2Prompt et que ton hôte est Gemini CLI, `node installer.mjs`, à la racine du clone, fait cette étape et la suivante sans IA : il installe le skill dans `~/.gemini/skills/scenario-playwright/`, avec ses fichiers exécutables vérifiés, son agent et ses commandes. Passe alors à l'étape 2, point 3, dans ce dossier.

Sinon :

1. Le skill ne dépend d'aucun projet. Crée le dossier `.skills/scenario-playwright/` à l'emplacement que le développeur indique ; à défaut, dans son dossier personnel (`%USERPROFILE%\.skills\scenario-playwright\` sous Windows, `~/.skills/scenario-playwright/` ailleurs). Sous Windows, avec WSL2, choisis le côté où Chrome est installé : en général Windows. Si le dossier est dans un dépôt git, ajoute `/.skills/` à `.git/info/exclude` s'il n'y est pas ; si ton hôte est Gemini CLI, ajoute aussi à `.geminiignore` les lignes `!/.skills/` et `!/.skills/scenario-playwright/`.
2. Pour chaque bloc `<<<FICHIER chemin>>>` … `<<<FIN chemin>>>`, crée le fichier `chemin` dans ce dossier, avec le contenu exact compris entre les deux lignes délimitrices. Ces deux lignes ne font pas partie du fichier. Ne reformule rien, ne traduis rien, ne complète rien.
3. Si tu disposes d'un shell, vérifie chaque fichier avec `sha256sum -c` contre la table d'intégrité en fin de texte ; sous Windows, Git Bash fournit `sha256sum`, et `certutil -hashfile <fichier> SHA256` donne l'empreinte d'un fichier depuis CMD. Signale tout écart avant de continuer.

## Étape 1 : lecture

Lis `SKILL.md`, `manifest.json`, puis les modules actifs dans l'ordre indiqué par `SKILL.md`, section 1. Ne lis `modules/traduction-auto/SKILL.md`, `modules/demo/SKILL.md`, `modules/remise/SKILL.md`, `modules/accessibilite/SKILL.md` et `modules/enregistrement/SKILL.md` que pour comprendre les points d'extension : ces dimensions sont réservées.

## Étape 2 : fichiers exécutables et recette

1. Depuis le dossier du skill, écris les fichiers exécutables à partir des blocs annotés des modules, par la commande d'extraction du module `execution`, § 8. Elle se colle telle quelle dans bash, CMD ou PowerShell. Ne recopie pas les fichiers à la main.
2. La commande vérifie elle-même leurs empreintes : elle écrit `conforme` pour chaque fichier, ou `ECART` ou `ABSENT`, et sort alors avec le code 1. Un écart arrête l'installation.
3. Vérifie la version de Node (22 ou plus récent), puis installe la dépendance : `npm ci`. Elle ne télécharge aucun navigateur ; Chrome doit être installé sur le poste (module `execution`, § 2).
4. Lance la recette : `npm test` ; sous Linux sans écran, `xvfb-run -a npm test`. Attendu : 21 scénarios, 279 contrôles réussis, aucun échec ; là où l'adresse 127.0.0.2 n'est pas disponible, deux contrôles sont sautés. Rapporte au développeur le bilan ; un échec arrête l'installation et se rapporte tel quel, sans modifier les scripts.

## Étape 3 : l'agent et les commandes

Propose au développeur d'installer le sous-agent `agent/pilote-scenario.md` et les commandes `/scenario:importer`, `/scenario:traduire`, `/scenario:jouer` et `/scenario:designer` (module `agent`, § 2). N'écris dans ses dossiers de configuration qu'avec son accord ; dans la copie installée du sous-agent, remplace `<DOSSIER_DU_SKILL>` par le chemin absolu du dossier du skill. Rejoue avec lui les scénarios A1 à A8 du module `agent`.

## Étape 4 : premier scénario, avec le développeur

1. Il écrit un texte de départ (module `texte`) pour une application de son poste ; vérifie-le. Si ses scénarios sont dans une demande Jira, importe-les plutôt (module `jira`) : depuis la page qu'il a enregistrée, ou par l'adresse de la demande, où il se connecte lui-même ; rends-lui le bilan de l'import, puis vérifie chaque texte écrit.
2. Traduis-le sur le squelette de `traduire.mjs` (module `scenario`, § 4), puis présente-lui le plan de `verifier.mjs --plan`, ligne du texte par ligne du texte, et attends sa ratification.
3. Joue-le dans une fenêtre visible ; il fait lui-même chaque étape à la main. Examine ensuite avec lui le rapport, chaque étape en échec et chaque origine bloquée.

## Règles qui ne se négocient pas

- Tu ne demandes, ne lis et ne saisis aucun identifiant : le développeur se connecte lui-même dans la fenêtre du navigateur.
- Rien ne se joue avant que le développeur ait ratifié la traduction ; tu ne modifies ni son texte ni un scénario ratifié sans son accord.
- Tu ne passes `--autoriser-mutations` qu'avec l'accord explicite du développeur, pour une exécution.
- Tu n'écris jamais dans Jira ; tu ne lis les commentaires d'une demande qu'à sa demande ; tu compares avant de remplacer un texte importé, et tu ne passes `--remplacer` qu'avec son accord.
- Les résultats, les captures, les téléchargements, les traces, les pages Jira enregistrées et les profils restent sur le poste : tu ne les déplaces, ne les partages ni ne les versionnes.
- Tu n'adaptes pas les scripts : un écart, une erreur ou un besoin nouveau se signale au développeur.
- N'applique aucune dimension au statut `reserved`.

Commence par l'étape 0, puis l'étape 1, puis l'étape 2.

---

# Skill

<<<FICHIER manifest.json>>>
{
  "name": "scenario-playwright",
  "version": "1.1.1",
  "specSchema": 1,
  "language": "fr",
  "description": "Scénarios côté utilisateur joués dans le Chrome du poste par Playwright : texte de départ inspiré de Gherkin, en français ou en anglais, écrit par le développeur ou importé sans IA d'une demande Jira (page enregistrée en MHTML ou adresse ouverte dans le navigateur du poste, connexion à la main ; Jira Cloud et Data Center ; description et champs de texte, commentaires sur demande ; provenance, étiquettes, comparaison et remplacement sur demande au réimport) ; traduction en scénario TOML exécutable par l'IA, sur un squelette produit sans IA, ratifiée par le développeur et contrôlée sans IA (empreinte, structure, lignes, marques, variables) ; jeu fermé de treize actions commun avec le navigateur d'Agent2Test, cibles par rôle et nom accessible, aucun code exécuté dans la page, attentes bornées, aucune étape rejouée ; origines gardées, mutations hors du poste sur autorisation explicite, connexion à la main dans un profil dédié ; rapport JSON et Markdown avec captures, instantanés ARIA et erreurs relevées ; désignation d'une cible à la souris ; agent pilote-scenario et commandes /scenario:importer, /scenario:traduire, /scenario:jouer et /scenario:designer.",
  "entry": "SKILL.md",
  "targets": {
    "node": ">=22",
    "dependencies": "playwright-core 1.65.1, seule dépendance",
    "browser": "Chrome installé sur le poste (stable 158 à la publication), ou Edge, ou le Chromium de Playwright",
    "hote": "Gemini CLI 0.67.0 pour le sous-agent et les commandes",
    "os": "Windows natif, Linux et WSL2 ; recette en CI sur ubuntu-latest et windows-latest"
  },
  "references": [
    { "name": "agent2test", "version": "1.3.1" },
    { "name": "agent-tdd-jira", "version": "1.3.4" },
    { "name": "capture-sprint-jira", "version": "1.2.2" }
  ],
  "modules": [
    { "id": "execution", "path": "modules/execution/SKILL.md", "dimensions": ["D1"], "status": "active" },
    { "id": "texte", "path": "modules/texte/SKILL.md", "dimensions": ["D2"], "status": "active" },
    { "id": "jira", "path": "modules/jira/SKILL.md", "dimensions": ["D16"], "status": "active" },
    { "id": "scenario", "path": "modules/scenario/SKILL.md", "dimensions": ["D3"], "status": "active" },
    { "id": "cibles", "path": "modules/cibles/SKILL.md", "dimensions": ["D4"], "status": "active" },
    { "id": "actions", "path": "modules/actions/SKILL.md", "dimensions": ["D5"], "status": "active" },
    { "id": "session", "path": "modules/session/SKILL.md", "dimensions": ["D6"], "status": "active" },
    { "id": "garde", "path": "modules/garde/SKILL.md", "dimensions": ["D7"], "status": "active" },
    { "id": "preuves", "path": "modules/preuves/SKILL.md", "dimensions": ["D8"], "status": "active" },
    { "id": "designer", "path": "modules/designer/SKILL.md", "dimensions": ["D9"], "status": "active" },
    { "id": "agent", "path": "modules/agent/SKILL.md", "dimensions": ["D10"], "status": "active" },
    { "id": "recette", "path": "modules/recette/SKILL.md", "dimensions": ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D16"], "status": "active" },
    { "id": "traduction-auto", "path": "modules/traduction-auto/SKILL.md", "dimensions": ["D11"], "status": "reserved" },
    { "id": "demo", "path": "modules/demo/SKILL.md", "dimensions": ["D12"], "status": "reserved" },
    { "id": "remise", "path": "modules/remise/SKILL.md", "dimensions": ["D13"], "status": "reserved" },
    { "id": "accessibilite", "path": "modules/accessibilite/SKILL.md", "dimensions": ["D14"], "status": "reserved" },
    { "id": "enregistrement", "path": "modules/enregistrement/SKILL.md", "dimensions": ["D15"], "status": "reserved" }
  ],
  "extensionPoints": [
    "E1",
    "E2",
    "E3"
  ],
  "previousVersions": [
    { "version": "1.0.0", "file": "archives/SKILL-v1.0.0.md" },
    { "version": "1.1.0", "file": "archives/SKILL-v1.1.0.md" }
  ]
}
<<<FIN manifest.json>>>

<<<FICHIER SKILL.md>>>
---
name: scenario-playwright
description: Scénarios côté utilisateur joués dans le Chrome du poste par Playwright. Le développeur écrit son scénario dans un texte de départ inspiré de Gherkin, en français ou en anglais (fichier .scenario, avec étiquettes, titre, adresse, étapes Étant donné, Quand, Alors, marques (création), (modification), (suppression) et (à la main), tableau d'exemples) ; l'IA le traduit en scénario TOML exécutable sur un squelette produit sans IA, le développeur ratifie, et un contrôle sans IA garde la traduction fidèle au texte (empreinte, lignes, marques, variables). Le moteur joue un jeu d'actions fermé, commun avec le navigateur d'Agent2Test (naviguer, cliquer, saisir, choisir, cocher, survoler, touche, téléverser, télécharger, attendre, vérifier, capturer, et la main au développeur), sur des cibles désignées comme les voit une personne (rôle et nom accessible, libellé, texte), sans exécuter aucun code dans la page ; il ne laisse partir aucune requête vers une origine non déclarée, refuse de modifier des données hors du poste sans autorisation explicite, ne voit aucun identifiant, et rend un rapport JSON et Markdown avec captures, instantanés ARIA et erreurs relevées. Les scénarios peuvent aussi venir d'une demande Jira, enregistrée en MHTML ou ouverte à son adresse dans le navigateur du poste avec connexion à la main ; chaque scénario Gherkin, en français ou en anglais, y est recopié sans IA en texte de départ avec sa provenance, et un réimport dit ce qui a changé dans Jira. Désignation d'une cible à la souris, paramètres et jeux de valeurs, profil dédié, agent pilote-scenario et commandes /scenario:* pour Gemini CLI.
version: 1.1.1
---

# Scénarios côté utilisateur avec Playwright, version 1.1.1

Ce document est le point d'entrée du skill. Le skill fait les manipulations d'un utilisateur dans le navigateur du poste, Chrome par défaut, à partir d'un scénario : aller sur une page, cliquer, saisir, choisir, cocher, survoler, presser une touche, joindre un fichier, télécharger, attendre, vérifier ce qui s'affiche, capturer l'écran, et rendre la main au développeur quand une étape lui revient, comme une connexion. Le scénario part d'un texte inspiré de Gherkin, que le développeur écrit en français ou en anglais, ou qu'il importe d'une demande Jira, sans IA ; l'IA le traduit en scénario TOML exécutable, le développeur ratifie la traduction, et un contrôle sans IA la garde fidèle au texte. Le moteur, écrit en Node avec `playwright-core`, joue ensuite le scénario sans IA, de façon répétable, et rend un rapport avec ses preuves. Les règles détaillées sont dans `modules/`.

## 1. Ordre de lecture

1. Ce document, en entier.
2. `manifest.json` : modules, versions visées, plateformes.
3. Les modules actifs, dans cet ordre : `execution`, `texte`, `jira`, `scenario`, `cibles`, `actions`, `session`, `garde`, `preuves`, `designer`, `agent`, `recette`.
4. `modules/traduction-auto/SKILL.md`, `modules/demo/SKILL.md`, `modules/remise/SKILL.md`, `modules/accessibilite/SKILL.md` et `modules/enregistrement/SKILL.md` : seulement pour comprendre les points d'extension. Ne pas les appliquer en 1.x.

## 2. Ce que fait le skill

| Outil | Commande, depuis n'importe quel dossier | Rôle | Module |
|---|---|---|---|
| Import de Jira | `node <skill>/scripts/importer.mjs <page.mhtml \| adresse> --adresse <url>` | écrit un texte de départ par scénario Gherkin de la demande, avec sa provenance ; `--comparer` dit ce qui a changé dans Jira depuis l'import | `jira` |
| Squelette de traduction | `node <skill>/scripts/traduire.mjs <texte.scenario>` | écrit `<texte>.toml` : structure du texte, empreinte, un bloc par étape à compléter | `scenario` |
| Vérification | `node <skill>/scripts/verifier.mjs <fichier>... [--plan]` | contrôle un texte ou un scénario sans navigateur ; `--plan` montre la traduction ligne par ligne, pour la ratification | `texte`, `scenario` |
| Exécution | `node <skill>/scripts/jouer.mjs <scénario.toml> [options]` | joue le scénario dans le navigateur du poste et écrit le rapport | `actions`, `session`, `garde`, `preuves` |
| Désignation | `node <skill>/scripts/designer.mjs <adresse>` | rend la cible de chaque élément que le développeur clique | `designer` |
| Recette | `npm test`, depuis le dossier du skill | 21 scénarios contre une application de démonstration et un Jira factice, locaux | `recette` |
| Agent | `agent/pilote-scenario.md`, commandes `/scenario:importer`, `/scenario:traduire`, `/scenario:jouer`, `/scenario:designer` | importe, traduit, fait ratifier, joue et rend le bilan pour le développeur | `agent` |

```mermaid
flowchart LR
  DEV["Développeur"] -->|"écrit"| TXT["texte de départ<br/>creer-client.scenario"]
  JIRA["Demande Jira<br/>page MHTML ou adresse"] -->|"importer.mjs, sans IA"| TXT
  TXT -->|"traduire.mjs, sans IA"| SQ["squelette TOML<br/>structure, empreinte"]
  SQ -->|"étapes complétées par l'IA"| TOML["scénario TOML<br/>creer-client.toml"]
  TOML -->|"verifier.mjs --plan"| PLAN["plan ligne par ligne"]
  PLAN -->|"ratification"| DEV
  TOML -->|"jouer.mjs"| MOT["moteur : jeu fermé<br/>cibles côté utilisateur"]
  MOT --> NAV["Chrome du poste<br/>profil dédié, origines gardées"]
  DEV -.->|"étape à la main :<br/>connexion"| NAV
  MOT --> RAP["resultats/…/<br/>rapport.json, rapport.md,<br/>captures, ARIA"]
  RAP -->|"bilan"| DEV
```

## 3. Un scénario, du texte à l'exécution

Le texte de départ, écrit par le développeur (module `texte`) :

```text
# language: fr
@ECR-77-S01 @ECR-77-CA01
Scénario: Créer un client
  Adresse : http://127.0.0.1:4200
  Origines : http://127.0.0.1:4200, http://127.0.0.1:8080
  Paramètre : ville = Lyon

  Étant donné que je me connecte (à la main)
  Quand je clique sur le lien « Nouveau client »
  Et je saisis « <nom> » dans le champ « Nom »
  Et je choisis « <ville> » dans la liste « Ville »
  Et je clique sur le bouton « Enregistrer » (création)
  Alors je vois le message « Client <nom> créé »

  Exemples:
    | nom    |
    | Dupuis |
    | Leroy  |
```

Sa traduction, dont `traduire.mjs` écrit sans IA tout ce qui précède les étapes, et un bloc par étape à compléter (module `scenario`) :

```toml
format = "scenario-playwright.scenario/1"
titre = "Créer un client"
etiquettes = ["ECR-77-S01", "ECR-77-CA01"]
url_base = "http://127.0.0.1:4200"
origines = ["http://127.0.0.1:4200", "http://127.0.0.1:8080"]
source = "creer-client.scenario"
empreinte_source = "…"

[parametres]
ville = "Lyon"

[[jeux]]
nom = "Dupuis"

[[jeux]]
nom = "Leroy"

[[etapes]]
ligne = 8
action = "main"
message = "je me connecte"
jusqua = { url = "/accueil" }

[[etapes]]
ligne = 9
action = "cliquer"
cible = { role = "link", nom = "Nouveau client" }

[[etapes]]
ligne = 10
action = "saisir"
cible = { libelle = "Nom" }
valeur = "${nom}"

[[etapes]]
ligne = 11
action = "choisir"
cible = { libelle = "Ville" }
valeur = "${ville}"

[[etapes]]
ligne = 12
action = "cliquer"
cible = { role = "button", nom = "Enregistrer" }
mutation = "creation"

[[etapes]]
ligne = 13
action = "verifier"
critere = "contient"
cible = { role = "alert" }
attendu = "Client ${nom} créé"
```

Le même texte peut venir de Jira, où le scénario est écrit dans la description ou un champ de texte de la demande (module `jira`) : `importer.mjs` le recopie sans IA dans `ECR-77-S01.scenario`, sous un en-tête de provenance, avec l'adresse donnée par `--adresse`.

Ce que produit une exécution, dans le dossier `resultats/` à côté du scénario (module `preuves`) :

```text
resultats/20261120-141503-creer-client/
  rapport.json                 champs stables (E1) : scénario, navigateur, options, chaque jeu et chaque étape
  rapport.md                   le même rapport, lisible
  captures/j1-06-verifier.png  une capture par vérification, par capture demandée et par échec
  aria/j2-05-cliquer.yml       l'instantané ARIA de la page, à chaque échec
  telechargements/…            les fichiers téléchargés, avec leur empreinte dans le rapport
  trace.zip                    seulement avec --trace
```

## 4. Cycle 7E

| Phase | Ce qu'elle désigne ici | Modules |
|---|---|---|
| Éléments | les étapes du texte, les actions du jeu fermé, les cibles, les variables | `texte`, `scenario`, `actions`, `cibles` |
| Espace | l'application et ses origines, le navigateur du poste, le profil dédié, le dossier de résultats | `session`, `garde`, `preuves` |
| Engendrent | les relations : ligne du texte vers étapes TOML, cible vers élément, étape vers preuve | `scenario`, `cibles`, `preuves` |
| État | la page à chaque étape, la session du profil, le statut de chaque étape et de chaque jeu | `actions`, `session` |
| Expression | le plan de ratification, les messages « À VOUS », le rapport, les captures, le bilan de l'agent | `scenario`, `preuves`, `agent` |
| Évolutif | versions du skill, dimensions réservées D11 à D15, points d'extension E1 à E3, réimport de Jira et comparaison | `traduction-auto`, `demo`, `remise`, `accessibilite`, `enregistrement`, `jira` |
| Environnement | le développeur qui écrit, ratifie et se connecte, l'IA qui traduit, Jira où s'écrivent les scénarios des US, Chrome et ses versions, les autres skills qui liront les scénarios et les rapports | `agent`, `session`, `jira` |

Clause de second ordre : la traduction n'est pas neutre. Une phrase en français se traduit en actions de plusieurs façons, et l'IA qui la traduit pourrait déplacer le sens. Le skill ne laisse donc à l'IA que ce qu'elle seule sait faire, le sens des phrases : la structure est recopiée sans IA (D3.INV-5), un contrôle sans IA vérifie que chaque ligne du texte est traduite, dans l'ordre, avec ses marques et ses variables (D3.INV-3, D3.INV-4), et rien ne se joue avant la ratification du développeur, à qui le plan est présenté ligne du texte par ligne du texte (D10.INV-1). Une étape qui revient au développeur, comme une connexion, n'est jamais ajoutée par la traduction : elle vient d'une ligne qu'il a marquée « (à la main) ». De même, le moteur ne devine aucune cible : une cible qui désigne plusieurs éléments fait échouer l'étape sans agir (D4.INV-2), et le rapport cite les éléments trouvés, pour que le développeur tranche. L'import de Jira suit la même règle : il recopie ce que Jira dit, sans IA et sans rien réécrire que ce qu'il signale (D16.INV-3) ; un scénario que le format texte n'exprime pas est refusé avec son motif, et se corrige dans Jira ; un texte que le développeur a retouché n'est jamais remplacé sans son accord, ni sans être gardé (D16.INV-5).

## 5. Registre des dimensions

| ID | Dimension | Introduite | Statut 1.1.0 | Dépend de | Module |
|---|---|---|---|---|---|
| D1 | Exécution : installation, dépendance, emplacements, réglages, lignes de commande | 1.0 | active | | `execution`, `recette` |
| D2 | Texte de départ inspiré de Gherkin, en français ou en anglais | 1.0 | active | | `texte`, `recette` |
| D3 | Scénario TOML et contrôle de sa traduction | 1.0 | active | D2 | `scenario`, `recette` |
| D4 | Cibles côté utilisateur | 1.0 | active | D3 | `cibles`, `recette` |
| D5 | Actions et étapes : jeu fermé, attentes, vérifications | 1.0 | active | D3, D4 | `actions`, `recette` |
| D6 | Session et navigateur du poste, étape à la main | 1.0 | active | D1 | `session`, `recette` |
| D7 | Garde : origines, mutations hors du poste, trace | 1.0 | active | D5, D6 | `garde`, `recette` |
| D8 | Preuves et rapport | 1.0 | active | D5 | `preuves`, `recette` |
| D9 | Désignation d'une cible à la souris | 1.0 | active | D4, D6 | `designer`, `recette` |
| D10 | Agent pilote-scenario et commandes de Gemini CLI | 1.0 | active | D3, D7, D8 | `agent` |
| D11 | Traduction sans IA du texte de départ, par un catalogue de phrases | 1.0 | reserved | D2, D3 | `traduction-auto` |
| D12 | Parcours du kit démo de generateur-skill-ticket, captures comparées aux images de l'objectif | 1.0 | reserved | D8 | `demo` |
| D13 | Remise des scénarios et des rapports à Agent2Test | 1.0 | reserved | D3, D8 | `remise` |
| D14 | Audit d'accessibilité des pages parcourues | 1.0 | reserved | D5 | `accessibilite` |
| D15 | Enregistrement des gestes du développeur en scénario | 1.0 | reserved | D3, D9 | `enregistrement` |
| D16 | Scénarios importés d'une demande Jira | 1.1 | active | D2, D6 | `jira`, `recette` |

Statuts : `active` (implémentée et testée), `reserved` (points d'extension posés, fonctionnalité absente), `superseded` (remplacée ; la version de remplacement est indiquée).

## 6. Contrat de version et points d'extension

Le skill suit le contrat de version de `EVOLUTION.md` du dépôt Agent2Prompt. Il n'a ni base ni journal : chaque exécution écrit son rapport, seul état durable, et le profil du navigateur garde la session.

Points d'extension, actifs depuis la version indiquée :

- **E1** (1.0.0) : `rapport.json` (format `scenario-playwright.rapport/1`) a des champs stables, au niveau de l'exécution (`format`, `skill`, `version`, `scenario`, `debut`, `fin`, `duree_ms`, `navigateur`, `options`, `jeux`, `origines_bloquees`, `cibles_fragiles`, `bilan`, `statut`), de chaque jeu (`numero`, `valeurs`, `statut`, `etapes`) et de chaque étape (`numero`, `ligne`, `action`, `resume`, `cible`, `fragile`, `mutation`, `statut`, `duree_ms`, `message`, `capture`, `aria`, `telechargement`, `console`, `erreurs_page`, `reponses`). D12 et D13 s'en serviront sans rejouer le scénario.
- **E2** (1.0.0) : le scénario TOML (format `scenario-playwright.scenario/1`) reprend le vocabulaire du navigateur d'Agent2Test : mêmes actions pour les gestes communs, mêmes critères de vérification, mêmes stratégies de cibles, même règle des origines (`agent2test:D4.INV-2`, `agent2test:D4.INV-4`). D13 remettra un scénario ratifié à Agent2Test sans le réécrire.
- **E3** (1.0.0) : le moteur est une fonction, `jouerScenario(contexte, options)` du module `actions`, qui joue des jeux préparés dans un contexte de navigateur ouvert et rend leurs résultats ; `jouer.mjs` n'en est qu'un appelant. D12 en ajoutera un autre, sans modifier le moteur.

## 7. Règles globales

- **Aucun identifiant** : le skill ne demande, ne lit, ne stocke ni ne saisit aucun identifiant ; une connexion se fait à la main, dans la fenêtre visible, lors d'une étape « (à la main) » (D6.INV-2).
- **La traduction se ratifie** : rien ne se joue avant que le développeur ait ratifié la traduction, ligne du texte par ligne du texte ; un texte modifié rend sa traduction périmée (D3.INV-2, D10.INV-1).
- **Aucun code dans la page** : le moteur ne joue que les actions du jeu fermé, et aucune n'exécute de code dans la page (D5.INV-1).
- **Rien n'est deviné** : une cible ambiguë fait échouer l'étape, sans agir (D4.INV-2) ; aucune étape n'est rejouée (D5.INV-3).
- **Jira en lecture seule** : le skill n'écrit jamais dans Jira ; d'une demande, il ne lit que la description, les champs de texte et, sur demande, les commentaires ; par l'adresse, il n'y fait que naviguer, et le développeur se connecte lui-même (D16.INV-1, D16.INV-2).
- **Rien ne sort sans être déclaré** : aucune requête ne part vers une origine que le scénario ne déclare pas (D7.INV-1) ; hors du poste, une modification de données demande l'autorisation explicite du développeur pour l'exécution (D7.INV-2).
- **Les données du développeur restent chez lui** : profils, résultats, captures, téléchargements et pages Jira enregistrées restent sur le poste, dans le dossier du skill ou à côté des scénarios, écartés de Git (D1.INV-2) ; la trace n'est enregistrée que sur demande (D7.INV-3).
- **Une dépendance** : Node 22 ou plus récent et `playwright-core` à version exacte, qui pilote le navigateur du poste sans en télécharger (D1.INV-1).
- **Langue** : messages, documentation, commentaires et identifiants du code en français, sauf l'interface de Playwright.

## 8. Critères d'acceptation

- La recette du module `recette` passe en entier : `npm test`, 21 scénarios et 279 contrôles ; là où l'adresse 127.0.0.2 n'est pas disponible, deux contrôles de R8 sont sautés.
- La recette passe en intégration continue sur `ubuntu-latest` et `windows-latest`, avec Node 22, 24 et 26, après extraction par la commande du module `execution`, § 8, sous bash et sous CMD, puis `npm ci`, avec le Chrome stable des images GitHub.
- Les fichiers tirés des modules ont exactement les empreintes de la table du module `execution`, § 8.
- Les scénarios A1 à A8 du module `agent` sont rejoués avec le développeur avant que l'agent joue un scénario sur une application réelle.
- Un premier scénario réel est écrit, traduit, ratifié et joué avec le développeur ; chaque étape en échec est examinée avec lui.
- Une première demande réelle est importée avec le développeur, depuis sa page enregistrée puis par son adresse ; chaque limite, chaque refus et chaque écart de lecture est examiné avec lui, et signalé s'il tient au skill.

## 9. Invariants

**D1 : exécution**

- **D1.INV-1** : le skill demande Node 22 ou plus récent et une seule dépendance, `playwright-core` à version exacte, qui pilote le navigateur installé sur le poste sans en télécharger.
- **D1.INV-2** : ce que le skill écrit reste sur le poste : profils dans son dossier (`.profils/`), résultats à côté du scénario (`resultats/`) ou dans le dossier choisi ; son `.gitignore` écarte `node_modules/`, `.profils/` et `resultats/`.
- **D1.INV-3** : chaque réglage se lit dans sa variable `SCENARIO_PLAYWRIGHT_CANAL`, `SCENARIO_PLAYWRIGHT_PROFILS` ou `SCENARIO_PLAYWRIGHT_DELAI`, ou prend son défaut ; une variable vide vaut absente ; une valeur invalide est refusée.
- **D1.INV-4** : `jouer.mjs` sort avec le code 0 quand tout a réussi, 1 quand une étape a échoué, 2 quand le scénario, une option ou l'environnement sont refusés, avant toute action dans le navigateur ; `verifier.mjs` et `traduire.mjs` sortent avec 0 ou 2.

**D2 : texte de départ**

- **D2.INV-1** : un texte décrit un seul scénario : étiquettes facultatives, un titre, une adresse et des réglages, au moins une étape introduite par un mot-clé, et au plus un tableau d'exemples ; toute autre ligne est refusée, et chaque erreur donne sa ligne.
- **D2.INV-2** : chaque étape garde son numéro de ligne, son mot-clé, sa phrase, sa marque `(création)`, `(modification)`, `(suppression)` ou `(à la main)`, et ses variables `<nom>` ; une variable qui n'est ni un paramètre ni une colonne des exemples est refusée.
- **D2.INV-3** : l'empreinte d'un texte est le SHA-256 de son contenu en fins de ligne LF, sans BOM, en caractères composés : une extraction en CRLF donne la même.
- **D2.INV-4** : les mots-clés de Gherkin se lisent en français ou en anglais, sans tenir compte de la casse ni des accents, et chaque mot-clé se garde tel qu'écrit ; `Contexte:` et `Règle:` (`Background:`, `Rule:`) sont refusés dans un texte, avec leur ligne ; les réglages et les marques s'écrivent en français.

**D3 : scénario TOML et traduction**

- **D3.INV-1** : un scénario n'est joué que s'il est valide : format, champs requis, actions du jeu fermé, champs connus de chaque action, valeurs bornées ; chaque erreur cite l'étape, sa ligne du TOML et sa ligne du texte, et le refus a lieu avant d'ouvrir le navigateur.
- **D3.INV-2** : un scénario traduit d'un texte cite le fichier du texte et son empreinte ; il est refusé si le texte manque ou a changé depuis la traduction.
- **D3.INV-3** : la traduction recopie exactement la structure du texte : titre, étiquettes, adresse, origines, profil, paramètres et exemples ; chaque étape cite une ligne d'étape du texte, dans l'ordre du texte, et chaque étape du texte a au moins une étape.
- **D3.INV-4** : une marque de mutation du texte se retrouve sur une étape de sa ligne ; une ligne marquée « (à la main) » donne une seule étape `main`, et une étape `main` vient toujours d'une telle ligne ; chaque variable `<nom>` d'une ligne se retrouve en `${nom}` dans une étape de cette ligne.
- **D3.INV-5** : le squelette d'une traduction est produit sans IA à partir du texte ; ses étapes restent à compléter, et un scénario qui en garde une est refusé.
- **D3.INV-6** : une variable `${nom}` prend la valeur de `--param`, sinon du jeu joué, sinon de `[parametres]` ; une variable non déclarée, ou un `--param` qui ne désigne ni un paramètre ni une colonne des jeux, est refusé.

**D4 : cibles**

- **D4.INV-1** : une cible se désigne par une seule stratégie côté utilisateur : rôle et nom accessible, libellé, texte, placeholder, identifiant de test, texte alternatif ou titre ; un sélecteur CSS et un rang ne servent qu'en dernier recours, et le rapport les signale fragiles.
- **D4.INV-2** : une cible qui désigne plusieurs éléments fait échouer l'étape sans agir, et le message cite les éléments trouvés ; une cible absente fait échouer l'étape à son délai, sans agir.
- **D4.INV-3** : `dans` restreint une cible à l'intérieur d'une autre, sur trois niveaux au plus.

**D5 : actions et étapes**

- **D5.INV-1** : le jeu d'actions est fermé : `naviguer`, `cliquer`, `saisir`, `choisir`, `cocher`, `survoler`, `touche`, `televerser`, `telecharger`, `attendre`, `verifier`, `capturer` et `main` ; aucune étape n'exécute de code dans la page, et les sources du skill n'emploient ni évaluation dans la page, ni script injecté, ni fonction exposée, ni attente d'une durée fixe.
- **D5.INV-2** : une étape attend un état, dans son délai : celui de l'étape, sinon du scénario, sinon du réglage, sinon 10 s ; jamais plus de 30 s, ni plus de 900 s pour une étape `main` ; elle s'arrête dès que l'état est obtenu.
- **D5.INV-3** : aucune étape n'est rejouée ; une étape échouée arrête le jeu et les suivantes sont « non jouées », sauf après une étape `verifier`, dont les étapes `verifier` qui suivent sont jouées.
- **D5.INV-4** : `verifier` compare selon son critère, `contient`, `visible`, `valeur`, `nombre`, `url` ou `actif`, en interrogeant l'état jusqu'à son délai ; un échec donne l'attendu et l'obtenu.
- **D5.INV-5** : `televerser` ne prend que des fichiers du dossier du scénario et de ses sous-dossiers ; `telecharger` enregistre le fichier dans les résultats, avec son empreinte.

**D6 : session et navigateur**

- **D6.INV-1** : le navigateur est celui du poste, Chrome par défaut, Edge ou le Chromium de Playwright sur réglage ; le rapport note sa version, et avertit quand son numéro majeur dépasse celui du Chromium de `playwright-core`, ou reste plus de deux versions en arrière.
- **D6.INV-2** : le skill ne demande, ne lit, ne stocke ni ne saisit aucun identifiant ; une connexion se fait à la main, dans la fenêtre visible, et la session vit dans un profil dédié, réutilisé d'une exécution à l'autre.
- **D6.INV-3** : une étape `main` attend que le développeur atteigne l'état que décrit `jusqua`, dans son délai ; un scénario qui en a une est refusé sans fenêtre (`--sans-tete`), avant d'ouvrir le navigateur.

**D7 : garde**

- **D7.INV-1** : aucune requête ne part vers une origine que le scénario ne déclare pas, WebSocket compris : elle est interrompue avant chargement et comptée dans le rapport ; une navigation de la page vers une telle origine fait échouer l'étape.
- **D7.INV-2** : un scénario qui a une étape de mutation et une origine hors du poste (autre que 127.0.0.1, `localhost` ou `[::1]`) n'est joué qu'avec `--autoriser-mutations` ; sans cette option, il est refusé avant d'ouvrir le navigateur, et une étape de mutation sur une page hors du poste échoue sans agir.
- **D7.INV-3** : la trace n'est enregistrée que sur demande (`--trace`), et le rapport rappelle qu'elle contient les cookies et les en-têtes de la session ; les résultats ne quittent pas le poste.

**D8 : preuves**

- **D8.INV-1** : chaque exécution écrit, dans son dossier de résultats horodaté, `rapport.json`, aux champs stables, et `rapport.md` ; chaque étape y a son statut, sa durée, sa ligne du texte, sa cible et son message.
- **D8.INV-2** : chaque étape `verifier`, chaque étape `capturer` et chaque échec ont leur capture ; un échec a aussi l'instantané ARIA de la page ; les erreurs de console, les erreurs de la page et les réponses de statut 400 ou plus sont relevées étape par étape.

**D9 : désignation**

- **D9.INV-1** : la désignation n'agit pas sur la page : chaque clic du développeur rend la cible de l'élément au format du scénario, par la meilleure stratégie que propose Playwright, ou la signale non convertible.

**D10 : agent**

- **D10.INV-1** : l'agent ne joue un scénario traduit qu'après la ratification explicite du développeur, à qui le plan est présenté ligne du texte par ligne du texte.
- **D10.INV-2** : l'agent ne passe `--autoriser-mutations` qu'avec l'accord explicite du développeur pour cette exécution, et ne demande ni ne saisit aucun identifiant.
- **D10.INV-3** : l'agent ne modifie ni le texte de départ ni un scénario ratifié sans l'accord du développeur ; une correction se propose, puis se ratifie.
- **D10.INV-4** : l'agent ne lit les commentaires d'une demande Jira qu'à la demande du développeur, compare avant de remplacer, ne passe `--remplacer` qu'avec son accord, ne supprime aucun texte dont le scénario a disparu de Jira et ne corrige pas lui-même un scénario refusé.

**D16 : scénarios importés de Jira**

- **D16.INV-1** : une demande se lit depuis sa page enregistrée en MHTML, jamais modifiée, dont l'empreinte sha256 est notée dans chaque texte importé, ou depuis son adresse, ouverte dans le navigateur du poste, dans une fenêtre visible, sur un profil dédié à Jira : le skill y navigue vers l'adresse donnée et rien d'autre, sans cliquer, saisir ni envoyer de formulaire ; la connexion se fait à la main, dans le délai réglé ; la page est enregistrée en MHTML dans le sous-dossier `jira/` du dossier des textes, puis lue comme une page enregistrée.
- **D16.INV-2** : seules les pages de Jira Cloud et de Jira Data Center, reconnues à leurs marqueurs, sont lues, et seulement leur description, leurs champs de texte et, avec `--commentaires`, leurs commentaires ; scripts, styles et boutons ne sont jamais lus comme du texte ; une autre page est refusée.
- **D16.INV-3** : chaque scénario est recopié sans IA, tel qu'écrit dans Jira, en français ou en anglais : mots-clés, titre, étapes et exemples ; ne s'y ajoutent que les réglages donnés à l'import, le contexte de sa fonctionnalité et de sa règle en tête de ses étapes, et ses colonnes d'exemples adaptées au format texte avec leurs variables, chaque ajout signalé en tête du texte ; un scénario que le format texte n'exprime pas n'est pas écrit, et son refus est motivé.
- **D16.INV-4** : chaque texte importé se nomme `<ÉTIQUETTE>.scenario` et commence par sa provenance : demande, étiquette et zone, source, page enregistrée et son empreinte, date, empreinte Jira du scénario, empreinte du texte importé ; l'étiquette est celle que Jira donne au scénario, sinon celle qu'un import précédent a attribuée au scénario de même titre, sinon le plus petit numéro libre dans l'ordre de la page ; le second scénario d'une même étiquette n'est pas écrit.
- **D16.INV-5** : un texte dont le scénario n'a pas changé dans Jira n'est jamais réécrit ; un texte dont le scénario a changé n'est remplacé qu'avec `--remplacer`, et un texte retouché depuis l'import est d'abord gardé à côté ; un texte qui ne vient pas d'un import de la demande n'est jamais remplacé ; un texte dont le scénario a disparu de Jira est signalé, jamais supprimé ; `--comparer` n'écrit aucun texte et dit, pour chaque scénario, s'il est identique, modifié, nouveau ou disparu.
- **D16.INV-6** : `importer.mjs` sort avec le code 0 quand chaque scénario est écrit, remplacé ou inchangé (avec `--comparer` : identique), 1 quand un scénario n'est pas écrit ou qu'il n'y en a aucun (avec `--comparer` : une différence), 2 quand une option, un réglage, la page ou le navigateur sont refusés, ou que la demande ne s'affiche pas dans le délai, avant toute écriture de texte.

## 10. Références

Le skill est autonome : il n'inclut aucun autre skill. Il en référence trois, sans les inclure :

- **agent2test** 1.3.1 : son module `navigateur` est le modèle du moteur. Le scénario reprend son jeu d'actions pour les gestes communs, ses critères de vérification et ses stratégies de cibles (E2), et les mêmes règles : origines déclarées (`agent2test:D4.INV-2`), jeu fermé sans code dans la page (`agent2test:D4.INV-4`), attentes par état bornées (`agent2test:D4.INV-5`). Une différence : Agent2Test retente deux fois une vérification et classe le succès au réessai en instabilité (`agent2test:D4.INV-6`) ; ce skill ne rejoue aucune étape (D5.INV-3), car il joue le scénario du développeur, non une campagne.
- **agent-tdd-jira** 1.3.4 : ses scénarios Gherkin portent l'étiquette `@<CLÉ>-Snn` et les critères `@<CLÉ>-CAnn` (`agent-tdd-jira:D2.INV-3`). Un texte de départ reprend ces étiquettes, et sa traduction les recopie (D3.INV-3) : un rapport se rattache ainsi au scénario de l'US et à ses critères. Son module `ingestion-jira` est le modèle du lecteur de pages Jira : même décodage du MHTML, mêmes marqueurs de Jira Cloud et de Jira Data Center, même lecture seule de la page, dont l'empreinte est notée (`agent-tdd-jira:D1.INV-1`) ; l'import garde l'étiquette `@<CLÉ>-Snn` d'un scénario, et n'en attribue une qu'à défaut (D16.INV-4).
- **capture-sprint-jira** 1.2.2 : ses captures sont des pages de demandes enregistrées en MHTML, au format « Page Web, un seul fichier » de Chrome (`capture-sprint-jira:D4.INV-3`) : l'import les lit telles quelles. Comme lui, l'import par l'adresse laisse le développeur se connecter dans une fenêtre visible, sur un profil dédié (`capture-sprint-jira:D2.INV-1`, `capture-sprint-jira:D2.INV-2`) ; il ne fait pas défiler la page, et lit donc des commentaires chargés au défilement sur une capture de capture-sprint-jira plutôt que par l'adresse.

## 11. Filiation

Le skill répond à la demande du développeur du 20 novembre 2026 : un skill Playwright programmable par un scénario, qui fasse les manipulations côté utilisateur. Ses choix, ratifiés par le développeur le même jour :

1. nom `scenario-playwright` ;
2. un format de départ en texte, inspiré de Gherkin, traduit en TOML : le texte appartient au développeur, le TOML est la forme exécutable (D2, D3) ;
3. la traduction est faite par l'IA et ratifiée par le développeur ; une traduction sans IA, par un catalogue de phrases, est réservée (D11) ;
4. la connexion se fait à la main seulement, dans la fenêtre visible, avec un profil dédié : le skill ne voit aucun identifiant (D6.INV-2) ;
5. le navigateur est choisi pour la meilleure compatibilité avec Chrome : celui du poste, piloté par `playwright-core` 1.65.1, dont le Chromium 159 suit le Chrome stable du moment, 158 (ChromeOS 158.0.8127.65 le 18 novembre 2026), et le suivant ; `playwright-core` 1.64.1 corrigeait l'abandon des redirections cross-origin avec préflight par Chromium 155 et suivants dès qu'une route est posée, ce que fait la garde des origines. `playwright-core` 1.65 n'est plus essayé sous Node 20 : le skill demande Node 22 (D1.INV-1, D6.INV-1) ;
6. les étapes qui modifient des données sont refusées hors du poste sans `--autoriser-mutations`, et l'agent demande avant (D7.INV-2, D10.INV-2).

La version 1.1.0 répond à la demande du même jour : récupérer aussi les scénarios depuis une page Jira. Ses choix, ratifiés par le développeur :

1. deux sources, un lecteur : l'adresse de la demande, ouverte dans le navigateur du skill sur un profil dédié à Jira, connexion à la main, puis la page enregistrée en MHTML ; ou une page déjà enregistrée, à la main, par capture-sprint-jira, ou remise à agent-tdd-jira (D16.INV-1) ;
2. seuls la description et les champs de texte se lisent, les commentaires avec `--commentaires` ; chaque scénario garde sa provenance (D16.INV-2, D16.INV-4) ;
3. les mots-clés de Gherkin se lisent en anglais ou en français, dans les textes comme dans Jira (D2.INV-4, D16.INV-3) ;
4. `--comparer` dit ce qui a changé dans Jira depuis l'import ; un réimport ne remplace un texte qu'avec `--remplacer`, et sa traduction devient périmée par l'empreinte (D16.INV-5, D3.INV-2) ;
5. livraison en version 1.1.0, dimension D16 active, recette étendue de pages factices de Jira Cloud et de Jira Data Center, en une seule pull request.

## 12. Journal de révision

**1.1.1** (2026-11-20) : correctif. La recette passait par intermittence dans la CI, toujours sous Node 24 : un premier lancement du navigateur lent dépassait les délais courts de R5, R6, R8 et R11, ou ceux des preuves d'un échec, et une fois sous Windows la recette s'est bloquée jusqu'au délai du job. Les preuves d'un échec, capture et instantané ARIA, attendent 10 s au plus, au lieu de 5 et 3 ; la durée d'une étape en échec s'arrête à l'échec, sans le temps de ses preuves. Dans la recette, les délais courts ne portent plus que sur les étapes dont ils sont l'objet, et R5 prend le délai par défaut, 10 s ; la recette dit son dossier temporaire dès le début, ferme ses propres navigateurs sans les attendre plus de 15 s, lit la sortie d'un script 2 s au plus après sa fin, et s'arrête d'elle-même au bout de dix minutes en disant dans quel scénario. Le workflow affiche la sortie au fil de l'eau, arrête une recette bloquée au bout de douze minutes et garde en artefact le dossier temporaire d'une recette en échec, sans les profils du navigateur. Aucune dimension ni aucun invariant modifié ; recette de 21 scénarios (279 contrôles), 29 défauts réintroduits, tous rejoués. Archive : `archives/SKILL-v1.1.0.md`.

**1.1.0** (2026-11-20) : scénarios importés d'une demande Jira. Dimension D16 active, module `jira` : `scripts/jira.mjs` et `scripts/importer.mjs`, page enregistrée en MHTML ou adresse de la demande, Jira Cloud et Jira Data Center, description et champs de texte, commentaires sur demande, scénarios recopiés sans IA avec leur provenance, étiquettes gardées, reprises ou attribuées, réimport, `--comparer` et `--remplacer`, textes retouchés gardés (D16.INV-1 à D16.INV-6). Mots-clés de Gherkin en anglais ou en français dans les textes (D2.INV-4) ; agent : protocole d'import, D10.INV-4, scénarios A7 et A8, commande `/scenario:importer`. Recette de 21 scénarios (279 contrôles), avec un Jira factice : R1 étendu, R18 à R21 ; 29 défauts réintroduits. Références : capture-sprint-jira 1.2.2 ajouté. Archive : `archives/SKILL-v1.0.0.md`.

**1.0.0** (2026-11-20) : première version. Dimensions D1 à D10 actives, D11 à D15 réservées. Points d'extension E1 à E3. Texte de départ inspiré de Gherkin, scénario TOML, squelette et contrôle de la traduction sans IA, cibles côté utilisateur, jeu de treize actions, garde des origines et des mutations, étape à la main, profil dédié, rapport et preuves, désignation à la souris, agent `pilote-scenario` et commandes `/scenario:traduire`, `/scenario:jouer` et `/scenario:designer`, écrits en entier dans les modules ; recette de 17 scénarios (213 contrôles) contre une application de démonstration locale ; 20 défauts réintroduits.
<<<FIN SKILL.md>>>

<<<FICHIER modules/execution/SKILL.md>>>
---
name: execution
description: Exécution du skill (installation par npm ci, Node 22 ou plus récent, navigateur du poste et canal Chrome, Edge ou Chromium, dépendance unique playwright-core 1.65.1 à version exacte, emplacements des profils et des résultats, .gitignore du skill, réglages par variables SCENARIO_PLAYWRIGHT_*, lignes de commande de jouer, verifier, traduire et importer et leurs codes de sortie, pièges connus, commande d'extraction des fichiers exécutables à empreintes, sources de package.json, package-lock.json, .gitignore, scripts/jouer.mjs, scripts/verifier.mjs et scripts/traduire.mjs). À lire en premier, pour installer le skill.
dimensions: [D1]
status: active
---

# Module `execution` (D1)

Phase 7E couverte : Espace.

## 1. Commandes

Les scripts se lancent depuis n'importe quel dossier ; un scénario se désigne par son chemin, et ses résultats s'écrivent à côté de lui.

| Commande | Rôle | Module |
|---|---|---|
| `node <skill>/scripts/traduire.mjs <texte.scenario> [--remplacer]` | squelette TOML de la traduction, écrit à côté du texte | `scenario` |
| `node <skill>/scripts/verifier.mjs <fichier>... [--plan] [--param nom=valeur]...` | vérification sans navigateur d'un texte ou d'un scénario | `texte`, `scenario` |
| `node <skill>/scripts/jouer.mjs <scénario.toml> [options]` | exécution dans le navigateur du poste, rapport | `actions` |
| `node <skill>/scripts/designer.mjs <adresse> [--profil nom] [--max n]` | désignation de cibles à la souris | `designer` |
| `node <skill>/scripts/importer.mjs <page.mhtml \| adresse> --adresse <url> [options]` | un texte de départ par scénario Gherkin d'une demande Jira ; `--comparer` compare sans écrire | `jira` |
| `npm test`, depuis le dossier du skill | recette | `recette` |

`package.json` donne aussi `npm run jouer -- <scénario.toml>`, `npm run verifier -- <fichier>`, `npm run traduire -- <texte.scenario>`, `npm run designer -- <adresse>` et `npm run importer -- <page.mhtml> --adresse <url>`, depuis le dossier du skill.

## 2. Installation

1. Node 22 ou plus récent : `node --version`. `playwright-core` 1.65 n'est plus essayé sous Node 20 (D1.INV-1).
2. Depuis le dossier du skill, `npm ci` installe la seule dépendance, à la version du verrou. Derrière un proxy d'entreprise, npm lit `HTTPS_PROXY` ou sa propre configuration.
3. Le navigateur est celui du poste : Chrome par défaut. `playwright-core` n'en télécharge aucun.
   - Edge : `SCENARIO_PLAYWRIGHT_CANAL=msedge`.
   - Sans Chrome ni Edge : `npx playwright-core install chromium`, puis `SCENARIO_PLAYWRIGHT_CANAL=chromium`.
4. Sous WSL2, le navigateur doit être installé dans la distribution, et la fenêtre s'affiche par WSLg. Le plus simple reste d'installer et de lancer le skill sous Windows, à côté de Chrome.
5. Le scénario se joue dans une fenêtre visible : le développeur voit ce que fait le skill, et agit lui-même lors d'une étape à la main. `--sans-tete` joue sans fenêtre un scénario qui n'a aucune étape à la main (D6.INV-3). Sous Linux sans écran, la recette tourne sous `xvfb-run` (module `recette`, § 1).

Dans Gemini CLI, depuis un clone du dépôt Agent2Prompt, `node installer.mjs` installe le skill dans `~/.gemini/skills/scenario-playwright/`, avec son agent et ses commandes (module `agent`, § 2), et rappelle le `npm ci` à faire une fois.

## 3. Emplacements (D1.INV-2)

| Chemin | Contenu | Écarté par Git |
|---|---|---|
| `.profils/<profil>/`, dans le dossier du skill | profil du navigateur : cookies et session de chaque application ; `defaut` sans profil nommé ; `jira` pour l'import par l'adresse | oui, `.gitignore` du skill |
| `resultats/<horodatage>-<scénario>/`, à côté du scénario | rapport, captures, instantanés ARIA, téléchargements, trace | oui dans le dossier du skill ; ailleurs, `resultats/` s'ajoute au `.gitignore` du projet |
| `node_modules/`, dans le dossier du skill | `playwright-core` | oui |
| textes importés et `jira/<CLÉ>-<horodatage>.mhtml`, dans le dossier de `--dossier` de `importer.mjs` | textes de départ ; pages Jira enregistrées par l'import par l'adresse (module `jira`) | non : `jira/` s'ajoute au `.gitignore` du projet, une page de Jira ne se versionne pas |

Un dossier de résultats choisi par `--resultats` hors du skill n'est couvert par aucun `.gitignore` : il se choisit hors de tout dépôt, ou s'y ajoute à l'exclusion. Un profil contient des cookies de session : il ne se copie ni ne se partage.

## 4. Réglages (D1.INV-3)

| Variable | Défaut | Rôle |
|---|---|---|
| `SCENARIO_PLAYWRIGHT_CANAL` | `chrome` | navigateur : `chrome`, `msedge`, ou `chromium` pour celui de Playwright |
| `SCENARIO_PLAYWRIGHT_PROFILS` | `.profils` | dossier des profils, relatif au dossier du skill ou absolu |
| `SCENARIO_PLAYWRIGHT_DELAI` | aucun | délai d'une étape, en secondes, de 1 à 30, quand ni l'étape ni le scénario n'en donnent ; à défaut, 10 s |

Une variable vide vaut absente ; une valeur invalide est refusée, avec le code 2. Sous PowerShell : `$env:SCENARIO_PLAYWRIGHT_CANAL = "msedge"` ; sous bash : `export SCENARIO_PLAYWRIGHT_CANAL=msedge`.

## 5. Lignes de commande et codes de sortie (D1.INV-4)

`jouer.mjs <scénario.toml>` :

| Option | Effet |
|---|---|
| `--param nom=valeur` | valeur d'un paramètre ou d'une colonne des jeux, pour cette exécution (D3.INV-6) ; répétable |
| `--jeu n` | ne joue que le jeu `n`, à partir de 1 |
| `--resultats <dossier>` | dossier où créer le dossier de résultats, au lieu de `resultats/` à côté du scénario |
| `--sans-tete` | sans fenêtre ; refusé avec une étape à la main (D6.INV-3) |
| `--ralenti <ms>` | pause de 0 à 2 000 ms avant chaque geste de Playwright, pour suivre une démonstration |
| `--trace` | enregistre `trace.zip`, qui contient les cookies de la session (D7.INV-3) |
| `--autoriser-mutations` | autorise, pour cette exécution, les étapes de mutation hors du poste (D7.INV-2) |

Sortie : une ligne d'en-tête (titre, jeux, étapes, navigateur et version), `AVERTISSEMENT` de compatibilité s'il y a lieu (D6.INV-1), `Jeu n : …` pour chaque jeu quand il y en a plusieurs, `À VOUS : …` pour une étape à la main, une ligne par étape (`ok`, `KO` avec le message, `--` non jouée), `origine bloquée : …` pour chaque origine interrompue, puis `Bilan : …` et `Rapport : <chemin de rapport.md>`.

| Code | `jouer.mjs` | `verifier.mjs`, `traduire.mjs` |
|---|---|---|
| 0 | toutes les étapes de tous les jeux ont réussi | tout est conforme ; squelette écrit |
| 1 | au moins une étape a échoué ; le rapport est écrit | |
| 2 | scénario, option, réglage ou navigateur refusé, avant toute action dans le navigateur ; aucun rapport | un fichier refusé ; squelette non écrit |

Les options, la sortie et les codes de `importer.mjs` sont au module `jira`, § 7 (D16.INV-6).

`verifier.mjs` écrit `ok` pour chaque fichier conforme, `ERREUR` pour chaque erreur, et `note` pour ce que le développeur doit savoir avant de jouer : étapes de mutation et origines hors du poste, étapes à la main, cibles fragiles. `--plan` ajoute le plan de la traduction (module `scenario`, § 4.4) ; `--param` y vérifie une valeur donnée en ligne de commande.

## 6. Dépendance (D1.INV-1)

`playwright-core` 1.65.1, à version exacte dans `package.json` et dans le verrou : c'est la version de la recette. Elle n'a aucune dépendance, et pilote le navigateur du poste par le protocole Chrome DevTools. Elle porte le Chromium 159, qui suit le Chrome stable de sa publication et le suivant (module `session`, § 2). Une autre version se monte dans une nouvelle version du skill, recette rejouée.

## 7. Pièges connus

- **Profil déjà ouvert** : un profil ne s'ouvre que dans une fenêtre à la fois. Si deux exécutions, ou une exécution et une désignation, prennent le même profil, la seconde est refusée avec un message qui le dit. Fermer la première fenêtre.
- **Chrome introuvable** : le lancement est refusé, avec le code 2. Installer Chrome, ou choisir un autre canal (§ 4).
- **Avertissement de compatibilité** : Chrome plus récent que le Chromium de `playwright-core`. Un échec inattendu se signale : une nouvelle version du skill monte `playwright-core` (module `session`, § 2).
- **Origine bloquée** : une police ou un script d'un CDN, que le scénario ne déclare pas, est interrompu ; la page peut s'afficher autrement. L'origine s'ajoute au texte de départ si elle est légitime (module `garde`, § 1).
- **Étape à la main dans Gemini CLI** : la commande lancée par l'agent attend, le temps que le développeur agisse dans la fenêtre ; elle reprend seule dès l'état atteint. Il en va de même de la connexion à Jira, lors d'un import par l'adresse.
- **Node 24** : en intégration continue, des lenteurs du navigateur et un blocage ont été vus sous Node 24, jamais sous Node 22 ni 26, sans pouvoir les reproduire sur un poste. Un blocage sous Node 24 se signale, et le scénario se rejoue sous Node 22 ou 26.
- **Jira qui ne ramène pas à la demande** : après la connexion, certains SSO mènent à l'accueil de Jira ; le développeur rouvre la demande dans la même fenêtre, et l'import reprend dès qu'elle s'affiche.

## 8. Matérialiser les fichiers exécutables

| Fichier | Module, section | Empreinte sha256 |
|---|---|---|
| `package.json` | `execution`, § 10 | `d813ebbc91937c81baaead56ee0aec56914d5ef1c8f0ca384fb3c7c9aa6d06cb` |
| `package-lock.json` | `execution`, § 10 | `a9f540f15297163644362f45eca9e99e4a5a7e898e96cd0f44e65da55b29bad3` |
| `.gitignore` | `execution`, § 10 | `03bf7f97f17a0d1abb005b6480ec3b0f06a0b9c29c1d1f83131209b52b888a7e` |
| `scripts/jouer.mjs` | `execution`, § 11 | `5b231b8e4086e0629fbfe82ae269781a2f92c199cfa765b3fdeb23fc54001f6a` |
| `scripts/verifier.mjs` | `execution`, § 12 | `d1ae67913a4c71a1344815599311eaa5333cf29241377eecb7d9f9768eece8a6` |
| `scripts/traduire.mjs` | `execution`, § 13 | `28f19e04a84e636c07f9a0659ab25379d8a96a0443d4bf0a3134399de3ef30b4` |
| `scripts/texte.mjs` | `texte`, § 12 | `6eb8365cb9dd6739390d94498132a8c9f01b78dbaa7c8566635189e817fcf80a` |
| `scripts/jira.mjs` | `jira`, § 9 | `c2c51288473a21c47637fa5221c299bdc5b5c47565324c78ec167f0cc86c2162` |
| `scripts/importer.mjs` | `jira`, § 10 | `fd14695ce30d39796fb988bfa38d469d0fbefa40e47d89a7b8fa59f8d4f285b3` |
| `scripts/toml.mjs` | `scenario`, § 6 | `418216cdf3e3eff891da54756a4487e854d77ab1c0b28bf1f3b66719ba1123fa` |
| `scripts/scenario.mjs` | `scenario`, § 7 | `fc3b7e455866a072fd57e7d40cae848557677557940c618ecd76dab298f2ef7d` |
| `scripts/cibles.mjs` | `cibles`, § 6 | `90b0b585a0ac24f20b76f5932eeb7811b9004004385b6981180023418ca24d33` |
| `scripts/moteur.mjs` | `actions`, § 9 | `dbee3ecabba8f718a7d255d3b6e9e1a196931b703ab54eda71b12503d4180129` |
| `scripts/session.mjs` | `session`, § 7 | `b155eca5bf83f524c4deb59b7557947749a24ef9fbcf62753ee74f40ecfdb1a0` |
| `scripts/rapport.mjs` | `preuves`, § 7 | `c348427864ff5fa87ee327b9674c9cffd52126f957af7948a9dd943af5534a88` |
| `scripts/designer.mjs` | `designer`, § 5 | `0ad485dfe65d797ec8dbae45e42d4ef3c8ab9ed57471197a1f3df7b7955b5fe9` |
| `agent/pilote-scenario.md` | `agent`, § 6 | `519c079a299014dcf04b7a85ef8c193cd354213d526db5a79d719edba2a68da3` |
| `commandes/scenario/importer.toml` | `agent`, § 7 | `b5d758c637b82b8e7f460b28061e1855994bc5e1594232d0f787914c200c0e7f` |
| `commandes/scenario/traduire.toml` | `agent`, § 7 | `32539c71038909d185aa2d6973413c737337e31573dc2dde867e45fb4f0a7c52` |
| `commandes/scenario/jouer.toml` | `agent`, § 7 | `a846bc5f9286660f34b668038c19cc753bd2f9e3e18b4a9d590a44b9516b8b10` |
| `commandes/scenario/designer.toml` | `agent`, § 7 | `d8685f8e5c58519b2383f35bf05580f24cdbb374f52bbb25118c74a681e917e7` |
| `tests/application-demo.mjs` | `recette`, § 6 | `e5b655e5d69b4baeaac6232f2e758be4a9ea9ab6e4e726a3a2a775bc82067bd1` |
| `tests/run-tests.mjs` | `recette`, § 6 | `5674ab8a17f280f650869c9caf877b1b80f6ab273e880fafe75e76d3681107b5` |

Depuis le dossier du skill, cette commande d'une ligne écrit les vingt-trois fichiers, compare leurs empreintes à celles du tableau et sort avec le code 1 au moindre écart. Elle ne contient ni `$`, ni accent grave, ni `!`, ni `%`, ni guillemet intérieur : elle se colle telle quelle dans bash, zsh, CMD ou PowerShell, et dans un fichier `.cmd`. Elle lit aussi des modules aux fins de ligne CRLF.

```text
node -e "const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'); const attendu = { 'package.json': 'd813ebbc91937c81baaead56ee0aec56914d5ef1c8f0ca384fb3c7c9aa6d06cb', 'package-lock.json': 'a9f540f15297163644362f45eca9e99e4a5a7e898e96cd0f44e65da55b29bad3', '.gitignore': '03bf7f97f17a0d1abb005b6480ec3b0f06a0b9c29c1d1f83131209b52b888a7e', 'scripts/jouer.mjs': '5b231b8e4086e0629fbfe82ae269781a2f92c199cfa765b3fdeb23fc54001f6a', 'scripts/verifier.mjs': 'd1ae67913a4c71a1344815599311eaa5333cf29241377eecb7d9f9768eece8a6', 'scripts/traduire.mjs': '28f19e04a84e636c07f9a0659ab25379d8a96a0443d4bf0a3134399de3ef30b4', 'scripts/texte.mjs': '6eb8365cb9dd6739390d94498132a8c9f01b78dbaa7c8566635189e817fcf80a', 'scripts/jira.mjs': 'c2c51288473a21c47637fa5221c299bdc5b5c47565324c78ec167f0cc86c2162', 'scripts/importer.mjs': 'fd14695ce30d39796fb988bfa38d469d0fbefa40e47d89a7b8fa59f8d4f285b3', 'scripts/toml.mjs': '418216cdf3e3eff891da54756a4487e854d77ab1c0b28bf1f3b66719ba1123fa', 'scripts/scenario.mjs': 'fc3b7e455866a072fd57e7d40cae848557677557940c618ecd76dab298f2ef7d', 'scripts/cibles.mjs': '90b0b585a0ac24f20b76f5932eeb7811b9004004385b6981180023418ca24d33', 'scripts/moteur.mjs': 'dbee3ecabba8f718a7d255d3b6e9e1a196931b703ab54eda71b12503d4180129', 'scripts/session.mjs': 'b155eca5bf83f524c4deb59b7557947749a24ef9fbcf62753ee74f40ecfdb1a0', 'scripts/rapport.mjs': 'c348427864ff5fa87ee327b9674c9cffd52126f957af7948a9dd943af5534a88', 'scripts/designer.mjs': '0ad485dfe65d797ec8dbae45e42d4ef3c8ab9ed57471197a1f3df7b7955b5fe9', 'agent/pilote-scenario.md': '519c079a299014dcf04b7a85ef8c193cd354213d526db5a79d719edba2a68da3', 'commandes/scenario/importer.toml': 'b5d758c637b82b8e7f460b28061e1855994bc5e1594232d0f787914c200c0e7f', 'commandes/scenario/traduire.toml': '32539c71038909d185aa2d6973413c737337e31573dc2dde867e45fb4f0a7c52', 'commandes/scenario/jouer.toml': 'a846bc5f9286660f34b668038c19cc753bd2f9e3e18b4a9d590a44b9516b8b10', 'commandes/scenario/designer.toml': 'd8685f8e5c58519b2383f35bf05580f24cdbb374f52bbb25118c74a681e917e7', 'tests/application-demo.mjs': 'e5b655e5d69b4baeaac6232f2e758be4a9ea9ab6e4e726a3a2a775bc82067bd1', 'tests/run-tests.mjs': '5674ab8a17f280f650869c9caf877b1b80f6ab273e880fafe75e76d3681107b5' }; const vus = new Set(); let ecarts = 0; for (const module of ['modules/execution/SKILL.md', 'modules/texte/SKILL.md', 'modules/jira/SKILL.md', 'modules/scenario/SKILL.md', 'modules/cibles/SKILL.md', 'modules/actions/SKILL.md', 'modules/session/SKILL.md', 'modules/preuves/SKILL.md', 'modules/designer/SKILL.md', 'modules/agent/SKILL.md', 'modules/recette/SKILL.md']) { const texte = fs.readFileSync(module, 'utf8').replace(/\r\n/g, '\n'); for (const m of texte.matchAll(/^<\x21-- fichier : (\S+) -->\n\x60{3}[a-z]*\n([\s\S]*?)\n\x60{3}\n/gm)) { const contenu = m[2] + '\n'; fs.mkdirSync(path.dirname(m[1]), { recursive: true }); fs.writeFileSync(m[1], contenu); vus.add(m[1]); const conforme = crypto.createHash('sha256').update(contenu).digest('hex') === attendu[m[1]]; if (conforme === false) ecarts++; console.log((conforme ? 'conforme  ' : 'ECART     ') + m[1]); } } for (const f of Object.keys(attendu)) if (vus.has(f) === false) { ecarts++; console.log('ABSENT    ' + f); } if (ecarts > 0) process.exitCode = 1;"
```

Puis, depuis le même dossier : `npm ci`, et la recette, `npm test` (sous Linux sans écran, `xvfb-run -a npm test`).

## 9. Contrôle de sortie

- La commande du § 8 écrit `conforme` pour chacun des vingt-trois fichiers.
- `npm ci` installe `playwright-core` 1.65.1.
- `npm test` rend son bilan sans échec (module `recette`).

## 10. Paquet et fichiers de travail

`package.json` déclare la dépendance unique, la version de Node et les commandes du § 1 ; `package-lock.json` fixe la version de la dépendance ; `.gitignore` écarte les fichiers de travail (§ 3).

<!-- fichier : package.json -->
```json
{
  "name": "scenario-playwright",
  "version": "1.1.1",
  "private": true,
  "description": "Scénarios côté utilisateur, joués dans le Chrome du poste par Playwright (skill scenario-playwright)",
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "jouer": "node scripts/jouer.mjs",
    "verifier": "node scripts/verifier.mjs",
    "traduire": "node scripts/traduire.mjs",
    "designer": "node scripts/designer.mjs",
    "importer": "node scripts/importer.mjs",
    "test": "node tests/run-tests.mjs"
  },
  "dependencies": {
    "playwright-core": "1.65.1"
  }
}
```

<!-- fichier : package-lock.json -->
```json
{
  "name": "scenario-playwright",
  "version": "1.1.1",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "scenario-playwright",
      "version": "1.1.1",
      "dependencies": {
        "playwright-core": "1.65.1"
      },
      "engines": {
        "node": ">=22"
      }
    },
    "node_modules/playwright-core": {
      "version": "1.65.1",
      "resolved": "https://registry.npmjs.org/playwright-core/-/playwright-core-1.65.1.tgz",
      "integrity": "sha512-hqPpz7blSMPxWVdoeE1yiBSzXsKiVOd2k+kjCvmUywD2GPO2Dd9HfcWnq9NN0GHbNZDFgZ9JfBFr+X5/BLo0qw==",
      "license": "Apache-2.0",
      "bin": {
        "playwright-core": "cli.js"
      },
      "engines": {
        "node": ">=20"
      }
    }
  }
}
```

<!-- fichier : .gitignore -->
```gitignore
# Fichiers de travail du skill scenario-playwright : dépendance, profils du navigateur (sessions),
# résultats des exécutions. Ils ne vont jamais dans un dépôt.
node_modules/
.profils/
resultats/
```

## 11. `scripts/jouer.mjs`

L'exécution : lecture de la ligne de commande et des réglages, lecture et contrôle du scénario (module `scenario`), préparation des jeux, refus avant le navigateur (D6.INV-3, D7.INV-2), ouverture du navigateur et garde des origines (module `session`), moteur (module `actions`), rapport (module `preuves`).

<!-- fichier : scripts/jouer.mjs -->
```javascript
#!/usr/bin/env node
// scenario-playwright 1.1.1 : joue un scénario TOML dans le navigateur du poste, comme un utilisateur.
//
// Usage, depuis n'importe quel dossier :
//   node <dossier du skill>/scripts/jouer.mjs <scénario.toml> [--param nom=valeur]... [--jeu n]
//     [--resultats dossier] [--sans-tete] [--ralenti ms] [--trace] [--autoriser-mutations]
// Codes de sortie (D1.INV-4) : 0 tout a réussi, 1 une étape a échoué, 2 scénario, option ou environnement
// refusé avant toute action dans le navigateur.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { jouerScenario } from './moteur.mjs';
import { construireRapport, dossierResultats, ecrireRapport } from './rapport.mjs';
import { DELAI_DEFAUT, lireScenario, preparerJeux } from './scenario.mjs';
import { compatibilite, dossierProfil, estLocale, garderOrigines, lireReglages, ouvrirNavigateur, reference } from './session.mjs';

const USAGE = 'Usage : node scripts/jouer.mjs <scénario.toml> [--param nom=valeur]... [--jeu n] [--resultats dossier] [--sans-tete] [--ralenti ms] [--trace] [--autoriser-mutations]';

/** Lit la ligne de commande ; rend { options } ou { erreur }. */
export function lireArguments(args) {
  const o = { fichier: null, params: {}, jeu: null, resultats: null, sansTete: false, ralenti: 0, trace: false, autoriserMutations: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const suivant = () => {
      if (i + 1 >= args.length) throw new Error(`${a} attend une valeur`);
      return args[++i];
    };
    try {
      if (a === '--param') {
        const v = suivant();
        const m = /^([a-z][a-z0-9_]*)=(.*)$/s.exec(v);
        if (!m) throw new Error(`--param attend nom=valeur, nom en minuscules (« ${v} »)`);
        if (Object.hasOwn(o.params, m[1])) throw new Error(`--param ${m[1]} donné deux fois`);
        o.params[m[1]] = m[2];
      } else if (a === '--jeu') {
        const v = Number(suivant());
        if (!Number.isInteger(v) || v < 1) throw new Error('--jeu attend un numéro à partir de 1');
        o.jeu = v;
      } else if (a === '--resultats') o.resultats = suivant();
      else if (a === '--ralenti') {
        const v = Number(suivant());
        if (!Number.isInteger(v) || v < 0 || v > 2000) throw new Error('--ralenti attend un nombre de millisecondes, de 0 à 2000');
        o.ralenti = v;
      } else if (a === '--sans-tete') o.sansTete = true;
      else if (a === '--trace') o.trace = true;
      else if (a === '--autoriser-mutations') o.autoriserMutations = true;
      else if (a.startsWith('-')) throw new Error(`option inconnue : ${a}`);
      else if (o.fichier !== null) throw new Error(`un seul scénario à la fois (« ${a} » en plus)`);
      else o.fichier = a;
    } catch (e) {
      return { erreur: e.message };
    }
  }
  if (o.fichier === null) return { erreur: 'scénario manquant' };
  return { options: o };
}

const refus = (lignes) => {
  for (const l of [].concat(lignes)) console.error(`ERREUR ${l}`);
  return 2;
};

export async function main(args, env = process.env) {
  const lu = lireArguments(args);
  if (lu.erreur) return refus([lu.erreur, USAGE]);
  const o = lu.options;
  const { reglages, erreurs: erreursReglages } = lireReglages(env);
  if (erreursReglages.length) return refus(erreursReglages);
  const fichier = resolve(o.fichier);
  const { scenario, erreurs, dossier } = lireScenario(fichier);
  if (!scenario) return refus(erreurs.map((e) => `${basename(fichier)} : ${e}`));
  const { jeux, erreurs: erreursJeux } = preparerJeux(scenario, dossier, o.params, o.jeu);
  if (erreursJeux.length) return refus(erreursJeux.map((e) => `${basename(fichier)} : ${e}`));
  if (o.sansTete && scenario.etapes.some((e) => e.action === 'main')) return refus('le scénario a une étape à la main : il se joue dans une fenêtre visible, sans --sans-tete (D6.INV-3)');
  const distantes = scenario.origines.filter((x) => !estLocale(x));
  if (scenario.etapes.some((e) => e.mutation) && distantes.length && !o.autoriserMutations) {
    return refus(`le scénario modifie des données (étapes ${scenario.etapes.flatMap((e, i) => (e.mutation ? [i + 1] : [])).join(', ')}) et déclare des origines hors du poste (${distantes.join(', ')}) : --autoriser-mutations, avec l'accord du développeur pour cette exécution (D7.INV-2)`);
  }

  const ref = reference();
  let contexte;
  try {
    contexte = await ouvrirNavigateur({ canal: reglages.canal, profil: dossierProfil(reglages, scenario.profil), sansTete: o.sansTete, ralenti: o.ralenti });
  } catch (e) {
    const texte = String(e.message);
    if (/ProcessSingleton|profile.*in use|SingletonLock/i.test(texte)) return refus(`le profil ${scenario.profil ?? 'defaut'} est déjà ouvert dans une autre fenêtre : la fermer, puis relancer`);
    return refus(`navigateur ${reglages.canal} introuvable ou impossible à lancer : ${texte.split('\n')[0]} ; installer Chrome, ou choisir SCENARIO_PLAYWRIGHT_CANAL=msedge ou chromium (module execution)`);
  }
  const debut = new Date();
  const resultats = dossierResultats(o.resultats ? resolve(o.resultats) : join(dossier, 'resultats'), basename(fichier), debut);
  let joues = [];
  let journal = null;
  let version = 'inconnue';
  try {
    version = contexte.browser()?.version() ?? 'inconnue';
    journal = await garderOrigines(contexte, scenario.origines);
    if (o.trace) await contexte.tracing.start({ screenshots: true, snapshots: true });
    const compat = compatibilite(version, ref);
    console.log(`${scenario.titre} : ${jeux.length} jeu${jeux.length > 1 ? 'x' : ''}, ${scenario.etapes.length} étapes ; ${reglages.canal} ${version}`);
    if (compat.avertissement) console.log(`AVERTISSEMENT ${compat.avertissement}`);
    joues = await jouerScenario(contexte, {
      scenario, jeux, resultats, journal, delai: scenario.delai ?? reglages.delai ?? DELAI_DEFAUT, autoriserMutations: o.autoriserMutations,
      surEvenement: (ev) => {
        if (ev.type === 'jeu' && ev.plusieurs) console.log(`Jeu ${ev.jeu} : ${Object.entries(ev.valeurs).map(([k, v]) => `${k} = ${v}`).join(', ')}`);
        if (ev.type === 'main') console.log(`À VOUS : ${ev.message} — la suite reprend dès que ${ev.jusqua.url ? `l'adresse ${ev.jusqua.url} est atteinte` : 'l\'écran attendu apparaît'} (${ev.delai} s au plus).`);
        if (ev.type === 'fin-etape') {
          const e = ev.etape;
          const marque = { reussie: 'ok  ', echec: 'KO  ', non_jouee: '--  ' }[e.statut];
          console.log(`  ${marque}${String(e.numero).padStart(2)}. ${e.resume}${e.statut === 'echec' ? ` : ${e.message}` : ''}`);
        }
      },
    });
    if (o.trace) await contexte.tracing.stop({ path: join(resultats, 'trace.zip') });
  } finally {
    await contexte.close().catch(() => {});
  }
  const fin = new Date();
  const rapport = construireRapport({
    fichier: basename(fichier), scenario, empreinte: createHash('sha256').update(readFileSync(fichier)).digest('hex'), debut, fin,
    navigateur: { canal: reglages.canal, version, playwright_core: ref.playwrightCore, chromium_reference: ref.chromium, avertissement: compatibilite(version, ref).avertissement },
    options: { sans_tete: o.sansTete, ralenti: o.ralenti, trace: o.trace, mutations_autorisees: o.autoriserMutations, params: o.params, jeu: o.jeu },
    jeux: joues, journal,
  });
  ecrireRapport(resultats, rapport);
  const b = rapport.bilan;
  for (const x of rapport.origines_bloquees) console.log(`origine bloquée : ${x.origine} (${x.requetes} requête${x.requetes > 1 ? 's' : ''})`);
  console.log(`Bilan : ${rapport.statut === 'reussi' ? 'réussi' : 'échec'}, ${b.etapes} étapes, ${b.reussies} réussies, ${b.echecs} en échec, ${b.non_jouees} non jouées`);
  console.log(`Rapport : ${join(resultats, 'rapport.md')}`);
  return rapport.statut === 'reussi' ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (e) => { console.error(`ERREUR interne : ${e.stack ?? e}`); process.exitCode = 2; });
}
```

## 12. `scripts/verifier.mjs`

<!-- fichier : scripts/verifier.mjs -->
```javascript
#!/usr/bin/env node
// scenario-playwright 1.1.1 : vérifie des textes de départ et des scénarios TOML, sans ouvrir de navigateur.
//
// Usage : node <dossier du skill>/scripts/verifier.mjs <fichier.scenario | fichier.toml>... [--plan] [--param nom=valeur]...
// Un texte : sa structure (D2). Un scénario : sa validité, le contrôle de sa traduction s'il cite un texte,
// ses variables et ses fichiers (D3) ; --plan montre la traduction ligne du texte par ligne du texte, pour
// la ratification. Code 0 si tout est conforme, 2 sinon.
import { basename, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { decrireCible, estFragile } from './cibles.mjs';
import { lireScenario, planTraduction, preparerJeux } from './scenario.mjs';
import { estLocale } from './session.mjs';
import { analyserTexte } from './texte.mjs';

const USAGE = 'Usage : node scripts/verifier.mjs <fichier.scenario | fichier.toml>... [--plan] [--param nom=valeur]...';
const MARQUES = { creation: 'création', modification: 'modification', suppression: 'suppression', main: 'à la main' };

export function main(args) {
  const fichiers = [];
  const params = {};
  let plan = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--plan') plan = true;
    else if (a === '--param') {
      const m = /^([a-z][a-z0-9_]*)=(.*)$/s.exec(args[i + 1] ?? '');
      if (!m) { console.error(`ERREUR --param attend nom=valeur\n${USAGE}`); return 2; }
      params[m[1]] = m[2];
      i++;
    } else if (a.startsWith('-')) { console.error(`ERREUR option inconnue : ${a}\n${USAGE}`); return 2; }
    else fichiers.push(a);
  }
  if (fichiers.length === 0) { console.error(`ERREUR aucun fichier\n${USAGE}`); return 2; }
  let code = 0;
  for (const f of fichiers) {
    const nom = basename(f);
    if (/\.scenario$/i.test(f)) {
      let source;
      try { source = readFileSync(f, 'utf8'); } catch { console.log(`ERREUR ${nom} : fichier introuvable`); code = 2; continue; }
      const { scenario: t, erreurs } = analyserTexte(source);
      if (erreurs.length) { for (const e of erreurs) console.log(`ERREUR ${nom}, ligne ${e.ligne} : ${e.message}`); code = 2; continue; }
      const marques = t.etapes.filter((e) => e.marque).map((e) => `l.${e.ligne} ${MARQUES[e.marque]}`);
      console.log(`ok  ${nom} : « ${t.titre} », ${t.etapes.length} étape${t.etapes.length > 1 ? 's' : ''}${marques.length ? ` (${marques.join(', ')})` : ''}${t.jeux ? `, ${t.jeux.length} exemple${t.jeux.length > 1 ? 's' : ''}` : ''} ; empreinte ${t.empreinte}`);
      continue;
    }
    const { scenario, texte, erreurs, dossier } = lireScenario(resolve(f));
    if (!scenario) { for (const e of erreurs) console.log(`ERREUR ${nom} : ${e}`); code = 2; continue; }
    const { erreurs: erreursJeux } = preparerJeux(scenario, dossier, params);
    if (erreursJeux.length) { for (const e of erreursJeux) console.log(`ERREUR ${nom} : ${e}`); code = 2; continue; }
    console.log(`ok  ${nom} : « ${scenario.titre} », ${scenario.etapes.length} étapes${scenario.jeux ? `, ${scenario.jeux.length} jeux` : ''}${texte ? `, traduit de ${scenario.source}, empreinte conforme, traduction contrôlée` : ''}`);
    const mutations = scenario.etapes.flatMap((e, i) => (e.mutation ? [i + 1] : []));
    const distantes = scenario.origines.filter((o) => !estLocale(o));
    if (mutations.length) console.log(`note ${nom} : étapes qui modifient des données : ${mutations.join(', ')}${distantes.length ? ` ; origines hors du poste (${distantes.join(', ')}) : se joue avec --autoriser-mutations, après accord du développeur` : ''}`);
    if (scenario.etapes.some((e) => e.action === 'main')) console.log(`note ${nom} : étapes à la main : fenêtre visible nécessaire`);
    const fragiles = [...new Set(scenario.etapes.filter((e) => estFragile(e.cible)).map((e) => decrireCible(e.cible)))];
    if (fragiles.length) console.log(`note ${nom} : cibles fragiles : ${fragiles.join(' ; ')}`);
    if (plan) console.log(planTraduction(scenario, texte));
  }
  return code;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main(process.argv.slice(2));
```

## 13. `scripts/traduire.mjs`

<!-- fichier : scripts/traduire.mjs -->
```javascript
#!/usr/bin/env node
// scenario-playwright 1.1.1 : squelette TOML de la traduction d'un texte de départ, produit sans IA.
//
// Usage : node <dossier du skill>/scripts/traduire.mjs <fichier.scenario> [--remplacer]
// Écrit <fichier>.toml à côté du texte : structure recopiée du texte, empreinte du texte, et un bloc
// [[etapes]] par étape du texte, à compléter (D3.INV-5). Refuse d'écraser un scénario existant sans
// --remplacer. Code 0 si le squelette est écrit, 2 sinon.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { squeletteToml } from './scenario.mjs';
import { analyserTexte } from './texte.mjs';

const USAGE = 'Usage : node scripts/traduire.mjs <fichier.scenario> [--remplacer]';

export function main(args) {
  const remplacer = args.includes('--remplacer');
  const autres = args.filter((a) => a !== '--remplacer');
  if (autres.length !== 1 || autres[0].startsWith('-') || !/\.scenario$/i.test(autres[0])) { console.error(`ERREUR un fichier .scenario attendu\n${USAGE}`); return 2; }
  const fichier = autres[0];
  let source;
  try { source = readFileSync(fichier, 'utf8'); } catch { console.error(`ERREUR ${fichier} : fichier introuvable`); return 2; }
  const { scenario: texte, erreurs } = analyserTexte(source);
  if (erreurs.length) { for (const e of erreurs) console.error(`ERREUR ${basename(fichier)}, ligne ${e.ligne} : ${e.message}`); return 2; }
  const cible = join(dirname(fichier), basename(fichier).replace(/\.scenario$/i, '.toml'));
  if (existsSync(cible) && !remplacer) { console.error(`ERREUR ${cible} existe déjà : --remplacer pour l'écraser, après accord du développeur`); return 2; }
  writeFileSync(cible, squeletteToml(texte, basename(fichier)));
  const aCompleter = texte.etapes.length;
  console.log(`écrit : ${cible}`);
  console.log(`${aCompleter} étape${aCompleter > 1 ? 's' : ''} à compléter, une par ligne d'étape du texte ; puis node scripts/verifier.mjs ${basename(cible)} --plan, et la ratification.`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main(process.argv.slice(2));
```
<<<FIN modules/execution/SKILL.md>>>

<<<FICHIER modules/texte/SKILL.md>>>
---
name: texte
description: Texte de départ d'un scénario, fichier .scenario inspiré de Gherkin en français ou en anglais, écrit par le développeur ou importé de Jira (un seul scénario par texte, étiquettes, Fonctionnalité ou Feature facultative, titre Scénario ou Scenario, réglages Adresse, Origines, Profil et Paramètre, étapes introduites par Étant donné, Soit, Sachant que, Quand, Lorsque, Alors, Donc, Et, Mais, ou Given, When, Then, And, But, marques (création), (modification), (suppression) et (à la main), variables <nom>, tableau Exemples ou Examples, Contexte et Règle refusés, commentaires, erreurs données ligne par ligne, empreinte identique en LF et en CRLF, phrases conseillées et leur traduction, source de scripts/texte.mjs). À lire pour écrire un texte ou le traduire.
dimensions: [D2]
status: active
---

# Module `texte` (D2)

Phase 7E couverte : Éléments.

## 1. Principe

Le texte de départ appartient au développeur : il y dit, en français ou en anglais, ce qu'une personne fait et voit, dans l'ordre. Il l'écrit, ou l'importe d'une demande Jira (module `jira`). Le skill en lit la structure sans IA (`scripts/texte.mjs`) : titre, étiquettes, réglages, étapes avec leur ligne, marques, variables et exemples. La phrase d'une étape n'est pas interprétée ici : c'est la traduction en TOML qui lui donne ses actions (module `scenario`). Le texte reste la référence : sa traduction cite son empreinte, et un texte modifié rend sa traduction périmée (D3.INV-2).

## 2. Forme d'un texte (D2.INV-1)

Un fichier `.scenario`, en UTF-8, décrit un seul scénario. Ses lignes, dans cet ordre :

| Ligne | Forme | Obligatoire |
|---|---|---|
| commentaire | commence par `#`, partout ; `# language: fr` en tête, comme en Gherkin | non |
| étiquettes | `@ECR-77-S01 @ECR-77-CA01`, une ou plusieurs lignes, avant le titre | non |
| fonctionnalité | `Fonctionnalité: Clients`, une fois, avant le titre ; ses étiquettes rejoignent celles du scénario | non |
| titre | `Scénario: Créer un client`, ou un autre titre de scénario (§ 3) ; une seule fois | oui |
| réglages | `Adresse :`, `Origines :`, `Profil :`, `Paramètre :` (§ 4), entre le titre et la première étape | `Adresse` |
| étapes | une par ligne, introduite par un mot-clé (§ 3) | au moins une |
| exemples | `Exemples:`, puis un tableau (§ 6), après les étapes | non |

Les lignes vides sont libres ; l'indentation est libre. Un texte décrivant un seul scénario, `Contexte:` et `Règle:` (`Background:`, `Rule:`) y sont refusés : les étapes d'un contexte s'écrivent dans le scénario, ce que fait l'import de Jira (module `jira`, § 4). Les deux-points s'écrivent collés ou précédés d'une espace (`Scénario :`). Toute autre ligne est refusée, et chaque erreur donne sa ligne : un texte se corrige en une fois (§ 7). Les fins de ligne CRLF et un BOM sont admis.

## 3. Mots-clés, en français ou en anglais (D2.INV-4)

| Ligne | Français | Anglais |
|---|---|---|
| fonctionnalité | `Fonctionnalité:` | `Feature:`, `Business Need:`, `Ability:` |
| titre | `Scénario:`, `Exemple:`, `Plan du scénario:` | `Scenario:`, `Example:`, `Scenario Outline:`, `Scenario Template:` |
| exemples | `Exemples:`, `Scénarios:` | `Examples:`, `Scenarios:` |
| refusé dans un texte | `Contexte:`, `Règle:` | `Background:`, `Rule:` |

| Étape | Français | Anglais |
|---|---|---|
| la situation de départ | `Étant donné que`, `Étant donné qu'`, `Étant donné`, `Étant donnée`, `Étant donnés`, `Étant données`, `Soit`, `Sachant que`, `Sachant qu'`, `Sachant` | `Given` |
| le geste de l'utilisateur | `Quand`, `Lorsque`, `Lorsqu'` | `When` |
| ce qu'il voit ensuite | `Alors`, `Donc` | `Then` |
| la suite de l'étape précédente | `Et que`, `Et qu'`, `Et`, `Mais que`, `Mais qu'`, `Mais` | `And`, `But` |

Les mots-clés se reconnaissent sans tenir compte des accents ni de la casse (`Etant donne que`, `QUAND`, `given`) ; les deux langues peuvent se mêler. Ils n'ont pas d'effet sur l'exécution, seulement sur la lecture. Chaque étape garde son numéro de ligne, son mot-clé tel qu'écrit et sa phrase (D2.INV-2). Les réglages (§ 4) et les marques (§ 5) s'écrivent en français, quelle que soit la langue des mots-clés.

## 4. Réglages

| Réglage | Forme | Effet |
|---|---|---|
| `Adresse :` | `http://…` ou `https://…` | adresse de base de l'application : les chemins des étapes s'y rapportent |
| `Origines :` | origines séparées par des virgules : schéma, hôte et port, sans chemin | seules origines vers lesquelles une requête peut partir (module `garde`) ; à défaut, l'origine de l'adresse, qui doit sinon en faire partie |
| `Profil :` | minuscules, chiffres, `-` et `_` | profil du navigateur où vit la session de l'application (module `session`) ; à défaut, `defaut` |
| `Paramètre :` | `nom = valeur`, une ligne par paramètre | valeur par défaut de la variable `<nom>` ; `--param` la remplace pour une exécution |

## 5. Marques

Une marque, entre parenthèses à la fin de la phrase, dit ce que l'étape engage :

| Marque | Sens | Dans la traduction (D3.INV-4) |
|---|---|---|
| `(création)` | l'étape crée des données | une étape de sa ligne porte `mutation = "creation"` |
| `(modification)` | l'étape modifie des données | `mutation = "modification"` |
| `(suppression)` | l'étape supprime des données | `mutation = "suppression"` |
| `(à la main)` | le développeur fait l'étape lui-même, dans la fenêtre : se connecter, résoudre un défi, valider un paiement de test | une seule étape `main` |

Les marques se reconnaissent sans accents ni casse (`(creation)`, `(A la main)`) ; elles sont retirées de la phrase. Les marques de mutation déclenchent la garde du module `garde` : hors du poste, une modification de données demande l'autorisation explicite du développeur (D7.INV-2). Une étape qui modifie des données sans marque le reste : la traduction lui ajoute `mutation` et le signale au développeur (module `agent`, § 3).

## 6. Variables et exemples

Une variable s'écrit `<nom>` dans une phrase : minuscules, chiffres et `_`, commençant par une lettre. Elle doit être déclarée, par une ligne `Paramètre :` ou par une colonne du tableau d'exemples (D2.INV-2) ; la traduction l'écrit `${nom}`.

Le tableau d'exemples suit `Exemples:` : une ligne d'en-têtes, les noms des variables, puis une ligne par jeu de valeurs. Le scénario est joué une fois par ligne. Les cellules sont séparées par `|` ; `\|` écrit une barre dans une cellule ; chaque ligne a autant de cellules que l'en-tête.

```text
  Exemples:
    | nom    | ville |
    | Dupuis | Lyon  |
    | Leroy  | Nice  |
```

## 7. Erreurs

`node <skill>/scripts/verifier.mjs <texte.scenario>` rend toutes les erreurs, chacune avec sa ligne (0 pour une absence) :

```text
ERREUR creer.scenario, ligne 0 : titre absent : une ligne « Scénario: » est attendue
ERREUR creer.scenario, ligne 3 : ligne non reconnue : « Adress : http://127.0.0.1:4200 »
ERREUR creer.scenario, ligne 9 : variable <nom> non déclarée : ni paramètre, ni colonne d'exemples
```

Sont refusés, entre autres : une ligne `Contexte:` ou `Règle:`, un second titre, un réglage après la première étape ou avant le titre, une étape avant le titre, une adresse absente ou qui n'est pas en http ou https, une origine avec un chemin, une adresse dont l'origine n'est pas parmi les origines déclarées, une variable non déclarée ou mal nommée, une ligne d'exemples irrégulière, un tableau vide, une ligne après le tableau, des étiquettes après le titre, un profil mal nommé, un paramètre en double.

## 8. Empreinte (D2.INV-3)

L'empreinte d'un texte est le SHA-256 de son contenu en fins de ligne LF, sans BOM, en caractères composés (NFC). Un texte extrait en CRLF, comme par Git sous Windows avec `core.autocrlf`, a la même empreinte que dans le dépôt ; tout autre changement, même un commentaire, en donne une autre, et la traduction est alors à refaire et à ratifier (D3.INV-2).

## 9. Phrases conseillées

Une phrase libre se traduit ; une phrase de cette table se traduit sans hésitation, et le sera sans IA par la dimension réservée D11. Les guillemets français entourent ce que la personne lit à l'écran.

| Phrase | Étape TOML |
|---|---|
| je suis sur la page « /clients » ; je vais sur la page « /clients » | `naviguer`, `url = "/clients"` |
| je clique sur le bouton « Enregistrer » | `cliquer`, `cible = { role = "button", nom = "Enregistrer" }` |
| je clique sur le lien « Nouveau client » | `cliquer`, `cible = { role = "link", nom = "Nouveau client" }` |
| je saisis « Dupuis » dans le champ « Nom » | `saisir`, `cible = { libelle = "Nom" }`, `valeur = "Dupuis"` |
| je choisis « Lyon » dans la liste « Ville » | `choisir`, `cible = { libelle = "Ville" }`, `valeur = "Lyon"` |
| je coche la case « Client actif » ; je décoche… | `cocher`, `cible = { libelle = "Client actif" }`, `valeur = true` ou `false` |
| je survole le menu « Menu » | `survoler`, `cible = { role = "button", nom = "Menu" }` |
| j'appuie sur la touche « Entrée » (« Tab », « Échap ») | `touche`, `touche = "Enter"` (`"Tab"`, `"Escape"`) |
| je joins le fichier « donnees/piece.pdf » au champ « Pièce jointe » | `televerser`, `cible = { libelle = "Pièce jointe" }`, `fichier = "donnees/piece.pdf"` |
| je télécharge l'export « Exporter en CSV » | `telecharger`, `cible = { role = "link", nom = "Exporter en CSV" }` |
| j'attends que le bouton « Continuer » soit actif | `attendre`, `etat = "actif"`, `cible = { role = "button", nom = "Continuer" }` |
| je vois « Client Dupuis créé » ; je vois le message « … » | `verifier`, `critere = "contient"`, `cible = { role = "alert" }` ou la zone où il s'affiche, `attendu = "Client Dupuis créé"` |
| je ne vois pas le bouton « Supprimer » | `verifier`, `critere = "visible"`, `cible = { role = "button", nom = "Supprimer" }`, `attendu = false` |
| le champ « Nom » contient « Dupuis » | `verifier`, `critere = "valeur"`, `cible = { libelle = "Nom" }`, `attendu = "Dupuis"` |
| je vois 3 boutons « Supprimer » | `verifier`, `critere = "nombre"`, `cible = { role = "button", nom = "Supprimer" }`, `attendu = 3` |
| l'adresse est « /clients » | `verifier`, `critere = "url"`, `attendu = "/clients"` |
| le bouton « Archiver » est inactif | `verifier`, `critere = "actif"`, `cible = { role = "button", nom = "Archiver" }`, `attendu = false` |
| je capture l'écran « liste » | `capturer`, `nom = "liste"` |
| je me connecte (à la main) | `main`, `message = "je me connecte"`, `jusqua = { url = "/accueil" }` |

## 10. Exemple complet

```text
# language: fr
@ECR-77-S01 @ECR-77-CA01
Scénario: Créer un client
  Adresse : http://127.0.0.1:4200
  Origines : http://127.0.0.1:4200, http://127.0.0.1:8080
  Paramètre : ville = Lyon

  Étant donné que je me connecte (à la main)
  Quand je clique sur le lien « Nouveau client »
  Et je saisis « <nom> » dans le champ « Nom »
  Et je choisis « <ville> » dans la liste « Ville »
  Et je clique sur le bouton « Enregistrer » (création)
  Alors je vois le message « Client <nom> créé »

  Exemples:
    | nom    |
    | Dupuis |
    | Leroy  |
```

`verifier.mjs` le lit ainsi : « Créer un client », 6 étapes (l.8 à la main, l.12 création), 2 exemples, et son empreinte.

Le même scénario, mots-clés en anglais :

```text
# language: en
@ECR-77-S01 @ECR-77-CA01
Scenario Outline: Create a client
  Adresse : http://127.0.0.1:4200

  Given I log in (à la main)
  When I click the link "New client"
  And I type "<nom>" in the field "Name"
  And I click the button "Save" (création)
  Then I see the message "Client <nom> created"

  Examples:
    | nom    |
    | Dupuis |
```

## 11. Contrôle de sortie

- Un texte conforme est lu sans erreur, chaque étape avec sa ligne, son mot-clé, sa phrase, sa marque et ses variables (D2.INV-1, D2.INV-2).
- Un texte aux mots-clés anglais, ou aux synonymes français, se lit de même, mots-clés gardés tels qu'écrits (D2.INV-4).
- Un texte non conforme rend toutes ses erreurs, chacune avec sa ligne.
- Le même texte en CRLF, avec un BOM, ou en caractères décomposés, a la même empreinte (D2.INV-3).

## 12. Source `scripts/texte.mjs`

<!-- fichier : scripts/texte.mjs -->
```javascript
// scenario-playwright 1.1.1 : lecteur du texte de départ d'un scénario (fichier .scenario), sans dépendance.
//
// Le texte, inspiré de Gherkin, décrit un seul scénario : étiquettes, titre, réglages (adresse, origines,
// profil, paramètres), étapes introduites par un mot-clé de Gherkin, en français ou en anglais, et au plus
// un tableau d'exemples. Ce lecteur en tire la structure sans IA, avec le numéro de ligne de chaque étape ;
// la phrase d'une étape n'est pas interprétée : c'est la traduction en TOML qui lui donne ses actions. Les
// mots-clés servent aussi au lecteur des pages Jira (scripts/jira.mjs).
import { createHash } from 'node:crypto';
import { URL } from 'node:url';

export const FORMAT_TEXTE = 'scenario-playwright.texte/1';
export const MARQUES = ['creation', 'modification', 'suppression', 'main'];
export const RE_VARIABLE = /^[a-z][a-z0-9_]*$/;
export const RE_PROFIL = /^[a-z0-9][a-z0-9_-]{0,39}$/;

export class ErreurTexte extends Error {
  constructor(nom, erreurs) {
    super(erreurs.map((e) => `${nom}, ligne ${e.ligne} : ${e.message}`).join('\n'));
    this.erreurs = erreurs;
  }
}

/** Texte en fins de ligne LF, sans BOM, caractères composés (NFC) : la forme dont on prend l'empreinte. */
export function normaliser(source) {
  return source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').normalize('NFC');
}

/** Empreinte SHA-256 d'un texte de scénario, la même pour une extraction LF ou CRLF (D2.INV-3). */
export function empreinteTexte(source) {
  return createHash('sha256').update(normaliser(source), 'utf8').digest('hex');
}

/** Comparaison sans accents ni casse, pour les mots-clés et les marques. */
export const plat = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Mots-clés des étapes de Gherkin, en français et en anglais (D2.INV-4).
const MOTS_CLES = [
  /^(etant donne(?:e|s|es)? (?:que |qu'))/,
  /^(etant donne(?:e|s|es)? )/,
  /^(sachant (?:que |qu'))/,
  /^(sachant )/,
  /^(soit )/,
  /^(quand )/,
  /^(lorsque |lorsqu')/,
  /^(alors )/,
  /^(donc )/,
  /^(et (?:que |qu'))/,
  /^(et )/,
  /^(mais (?:que |qu'))/,
  /^(mais )/,
  /^(given )/,
  /^(when )/,
  /^(then )/,
  /^(and )/,
  /^(but )/,
];
// Mots-clés des titres de Gherkin, en français et en anglais, et le genre de ligne qu'ils ouvrent.
const TITRES = {
  fonctionnalite: 'fonctionnalite', feature: 'fonctionnalite', 'business need': 'fonctionnalite', ability: 'fonctionnalite',
  scenario: 'scenario', 'plan du scenario': 'scenario', 'scenario outline': 'scenario', 'scenario template': 'scenario', exemple: 'scenario', example: 'scenario',
  exemples: 'exemples', examples: 'exemples', scenarios: 'exemples',
  contexte: 'contexte', background: 'contexte',
  regle: 'regle', rule: 'regle',
};
const RE_TITRE = new RegExp(`^(${Object.keys(TITRES).sort((a, b) => b.length - a.length).join('|')})\\s*:\\s*(.*)$`);
const RE_MARQUE = /\s*\((creation|modification|suppression|a la main)\)\s*$/;
const RE_REGLAGE = /^(adresse|origines|profil|parametre)\s*:\s*(.*)$/;

/** Mot-clé d'étape au début d'une ligne : { motCle tel qu'écrit, phrase }, ou null. */
export function lireMotCle(ligne) {
  const m = MOTS_CLES.map((re) => re.exec(plat(ligne))).find(Boolean);
  if (!m) return null;
  return { motCle: ligne.slice(0, m[1].length).trim(), phrase: ligne.slice(m[1].length).trim() };
}

/** Ligne de titre : { genre, motCle tel qu'écrit, valeur }, ou null. Genres : fonctionnalite, scenario, exemples, contexte, regle. */
export function lireTitre(ligne) {
  const m = RE_TITRE.exec(plat(ligne));
  if (!m) return null;
  const deuxPoints = ligne.indexOf(':');
  return { genre: TITRES[m[1]], motCle: ligne.slice(0, deuxPoints).trim(), valeur: ligne.slice(deuxPoints + 1).trim() };
}

/** Origine d'une adresse http ou https, ou null. */
export function origineDe(adresse) {
  try {
    const u = new URL(adresse);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.origin : null;
  } catch {
    return null;
  }
}

/** Une origine écrite seule : schéma, hôte et port éventuel, sans chemin. */
export function estOrigine(texte) {
  const o = origineDe(texte);
  return o !== null && o === texte.replace(/\/$/, '');
}

function cellules(ligne) {
  const interieur = ligne.trim().replace(/^\|/, '').replace(/\|$/, '');
  return interieur.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
}

/**
 * Analyse un texte de scénario. Rend { scenario, erreurs } : toutes les erreurs trouvées, chacune avec
 * son numéro de ligne (0 pour une absence), plutôt que la première seulement.
 */
export function analyserTexte(source) {
  const lignes = normaliser(source).split('\n');
  const erreurs = [];
  const err = (ligne, message) => erreurs.push({ ligne, message });
  const s = {
    format: FORMAT_TEXTE,
    fonctionnalite: null,
    titre: null,
    motCleTitre: null,
    etiquettes: [],
    adresse: null,
    origines: [],
    originesDeclarees: false,
    profil: null,
    parametres: {},
    etapes: [],
    jeux: null,
    empreinte: empreinteTexte(source),
  };
  let ligneTitre = 0;
  let ligneAdresse = 0;
  let ligneOrigines = 0;
  let zone = 'entete'; // entete, reglages, etapes, exemples, fin
  let tableau = null;

  for (let n = 1; n <= lignes.length; n++) {
    const brute = lignes[n - 1];
    const ligne = brute.trim();
    if (ligne === '' || ligne.startsWith('#')) continue;
    const p = plat(ligne);

    if (zone === 'exemples' || zone === 'fin') {
      if (ligne.startsWith('|') && zone === 'exemples') {
        const c = cellules(ligne);
        if (tableau.entetes === null) {
          tableau.entetes = c;
          const vues = new Set();
          for (const nom of c) {
            if (!RE_VARIABLE.test(nom)) err(n, `colonne d'exemples invalide : « ${nom} » (lettres minuscules, chiffres et _)`);
            else if (vues.has(nom)) err(n, `colonne d'exemples en double : ${nom}`);
            vues.add(nom);
          }
        } else if (c.length !== tableau.entetes.length) {
          err(n, `ligne d'exemples de ${c.length} cellules, ${tableau.entetes.length} attendues`);
        } else {
          tableau.lignes.push(Object.fromEntries(tableau.entetes.map((k, i) => [k, c[i]])));
        }
        continue;
      }
      zone = 'fin';
      err(n, 'ligne non reconnue après le tableau d\'exemples');
      continue;
    }

    if (ligne.startsWith('@')) {
      if (zone !== 'entete') {
        err(n, 'étiquettes après le titre : elles se placent avant « Scénario: »');
        continue;
      }
      for (const jeton of ligne.split(/\s+/)) {
        if (!/^@\S+$/.test(jeton)) err(n, `étiquette invalide : « ${jeton} »`);
        else if (!s.etiquettes.includes(jeton.slice(1))) s.etiquettes.push(jeton.slice(1));
      }
      continue;
    }

    const titre = lireTitre(ligne);
    if (titre) {
      const valeur = titre.valeur;
      if (titre.genre === 'fonctionnalite') {
        if (zone !== 'entete' || s.fonctionnalite !== null || s.titre !== null) err(n, `« ${titre.motCle}: » se place une fois, avant le titre`);
        else s.fonctionnalite = valeur;
        continue;
      }
      if (titre.genre === 'exemples') {
        if (zone !== 'etapes') err(n, `« ${titre.motCle}: » vient après les étapes`);
        zone = 'exemples';
        tableau = { ligne: n, entetes: null, lignes: [] };
        continue;
      }
      if (titre.genre === 'contexte' || titre.genre === 'regle') {
        err(n, `« ${titre.motCle}: » n'a pas sa place dans un texte d'un seul scénario : ses étapes s'écrivent dans le scénario`);
        continue;
      }
      if (s.titre !== null) {
        err(n, `second titre : un texte décrit un seul scénario (le premier est ligne ${ligneTitre})`);
        continue;
      }
      if (valeur === '') err(n, 'titre vide');
      s.titre = valeur;
      s.motCleTitre = titre.motCle;
      ligneTitre = n;
      zone = 'reglages';
      continue;
    }

    const reglage = RE_REGLAGE.exec(p);
    if (reglage) {
      const valeur = ligne.slice(ligne.indexOf(':') + 1).trim();
      if (zone === 'entete') {
        err(n, 'réglage avant le titre « Scénario: »');
        continue;
      }
      if (zone !== 'reglages') {
        err(n, 'réglage après la première étape : les réglages suivent le titre');
        continue;
      }
      if (reglage[1] === 'adresse') {
        if (ligneAdresse) err(n, `adresse déjà donnée ligne ${ligneAdresse}`);
        else if (origineDe(valeur) === null) err(n, `adresse invalide : « ${valeur} » (http ou https)`);
        else s.adresse = valeur;
        ligneAdresse = n;
      } else if (reglage[1] === 'origines') {
        if (ligneOrigines) err(n, `origines déjà données ligne ${ligneOrigines}`);
        ligneOrigines = n;
        s.originesDeclarees = true;
        for (const o of valeur.split(',').map((x) => x.trim()).filter(Boolean)) {
          if (!estOrigine(o)) err(n, `origine invalide : « ${o} » (schéma, hôte et port, sans chemin)`);
          else if (!s.origines.includes(o.replace(/\/$/, ''))) s.origines.push(o.replace(/\/$/, ''));
        }
        if (s.origines.length === 0) err(n, 'aucune origine');
      } else if (reglage[1] === 'profil') {
        if (s.profil !== null) err(n, 'profil déjà donné');
        else if (!RE_PROFIL.test(valeur)) err(n, `profil invalide : « ${valeur} » (minuscules, chiffres, - et _)`);
        else s.profil = valeur;
      } else {
        const m = /^([^=]+)=(.*)$/.exec(valeur);
        const nom = m ? m[1].trim() : '';
        if (!m || !RE_VARIABLE.test(nom)) err(n, `paramètre invalide : « ${valeur} » (nom = valeur, nom en minuscules)`);
        else if (Object.hasOwn(s.parametres, nom)) err(n, `paramètre en double : ${nom}`);
        else s.parametres[nom] = m[2].trim();
      }
      continue;
    }

    const motCle = lireMotCle(ligne);
    if (motCle) {
      if (zone === 'entete') {
        err(n, 'étape avant le titre « Scénario: »');
        continue;
      }
      zone = 'etapes';
      let phrase = motCle.phrase;
      let marque = null;
      const m = RE_MARQUE.exec(plat(phrase));
      if (m) {
        marque = m[1] === 'a la main' ? 'main' : m[1];
        phrase = phrase.slice(0, phrase.length - m[0].length).trim();
      }
      if (phrase === '') err(n, 'étape sans phrase');
      const variables = [...new Set([...phrase.matchAll(/<([^<>\s]+)>/g)].map((v) => v[1]))];
      for (const v of variables) if (!RE_VARIABLE.test(v)) err(n, `variable invalide : <${v}> (minuscules, chiffres et _)`);
      s.etapes.push({ ligne: n, motCle: motCle.motCle, phrase, marque, variables });
      continue;
    }

    err(n, `ligne non reconnue : « ${ligne.length > 60 ? `${ligne.slice(0, 57)}...` : ligne} »`);
  }

  if (s.titre === null) err(0, 'titre absent : une ligne « Scénario: » est attendue');
  if (s.titre !== null && s.adresse === null && !ligneAdresse) err(ligneTitre, 'adresse absente : une ligne « Adresse : http://… » suit le titre');
  if (s.titre !== null && s.etapes.length === 0) err(ligneTitre, 'aucune étape');
  if (s.adresse !== null) {
    const o = origineDe(s.adresse);
    if (!s.originesDeclarees) s.origines = [o];
    else if (!s.origines.includes(o)) err(ligneOrigines, `l'origine de l'adresse, ${o}, n'est pas parmi les origines`);
  }
  if (tableau) {
    if (tableau.entetes === null || tableau.lignes.length === 0) err(tableau.ligne, 'tableau d\'exemples vide : une ligne d\'en-têtes et au moins une ligne de valeurs');
    else s.jeux = tableau.lignes;
  }
  const declarees = new Set([...Object.keys(s.parametres), ...(tableau?.entetes ?? [])]);
  for (const e of s.etapes) {
    for (const v of e.variables) {
      if (RE_VARIABLE.test(v) && !declarees.has(v)) err(e.ligne, `variable <${v}> non déclarée : ni paramètre, ni colonne d'exemples`);
    }
  }
  erreurs.sort((a, b) => a.ligne - b.ligne);
  return { scenario: s, erreurs };
}

/** Lit un texte de scénario ; lève ErreurTexte avec toutes ses erreurs. */
export function lireTexte(source, nom = 'texte') {
  const { scenario, erreurs } = analyserTexte(source);
  if (erreurs.length > 0) throw new ErreurTexte(nom, erreurs);
  return scenario;
}
```
<<<FIN modules/texte/SKILL.md>>>

<<<FICHIER modules/jira/SKILL.md>>>
---
name: jira
description: Scénarios importés d'une demande Jira (page enregistrée en MHTML par le développeur, par capture-sprint-jira ou remise à agent-tdd-jira, ou adresse de la demande ouverte dans le navigateur du poste, sur un profil dédié, connexion à la main, page enregistrée en MHTML ; Jira Cloud et Jira Data Center reconnus à leurs marqueurs ; description et champs de texte lus, commentaires sur demande ; scénarios Gherkin en français ou en anglais recopiés sans IA en textes de départ, contexte reporté, colonnes d'exemples adaptées, refus motivés ; étiquette @<CLÉ>-Snn de Jira, reprise ou attribuée ; provenance et empreintes en tête de chaque texte ; réimport, --comparer et --remplacer, textes retouchés gardés ; ligne de commande et codes de sortie), sources de scripts/jira.mjs et scripts/importer.mjs. À lire pour importer les scénarios d'une demande.
dimensions: [D16]
status: active
---

# Module `jira` (D16)

Phases 7E couvertes : Environnement et Éléments.

## 1. Principe

Les scénarios d'une US s'écrivent souvent dans Jira, par le PO ou par agent-tdd-jira. `scripts/importer.mjs` les recopie, sans IA, en textes de départ : un fichier `.scenario` par scénario, que le développeur vérifie, fait traduire, ratifie et joue comme un texte écrit à la main (modules `texte` et `scenario`). Le texte reste la référence de sa traduction (D3.INV-2) ; Jira reste la référence du texte importé : un réimport, ou `--comparer`, dit ce qui a changé dans Jira depuis l'import.

```mermaid
flowchart LR
  JIRA["Demande Jira"] -->|"adresse : fenêtre visible,<br/>connexion à la main"| CAP["page MHTML<br/>scenarios/jira/"]
  FIC["page enregistrée<br/>DEMO-8.mhtml"] --> LEC
  CAP --> LEC["importer.mjs, sans IA :<br/>description, champs de texte,<br/>commentaires sur demande"]
  LEC --> TXT["DEMO-8-S01.scenario …<br/>provenance, empreintes"]
  TXT -->|"verifier, traduire,<br/>ratifier, jouer"| DEV["Développeur"]
  JIRA -.->|"--comparer"| TXT
```

Le skill n'écrit jamais dans Jira. Une page enregistrée n'est jamais modifiée.

## 2. Deux sources, un lecteur (D16.INV-1)

| Source | Commande | Ce qui se passe |
|---|---|---|
| page enregistrée | `node <skill>/scripts/importer.mjs DEMO-8.mhtml --adresse http://127.0.0.1:4200` | lue sans navigateur ; son empreinte sha256 est notée dans chaque texte importé |
| adresse de la demande | `node <skill>/scripts/importer.mjs https://jira.exemple.fr/browse/DEMO-8 --adresse http://127.0.0.1:4200` | la demande s'ouvre dans le navigateur du poste, fenêtre visible, sur le profil `jira` ; la page est enregistrée en MHTML dans `<dossier>/jira/DEMO-8-<horodatage>.mhtml`, puis lue comme une page enregistrée |

Une page enregistrée vient de « Enregistrer sous… », « Page Web, un seul fichier », dans Chrome ou Edge, de capture-sprint-jira (`capture-sprint-jira:D4.INV-3`), ou c'est la page remise à agent-tdd-jira, lue elle aussi en lecture seule (`agent-tdd-jira:D1.INV-1`). Le MHTML se décode comme Chrome l'écrit : quoted-printable ou base64, jeu de caractères de la partie HTML.

Par l'adresse :

1. Le skill navigue vers l'adresse donnée, et rien d'autre : il ne clique, ne saisit, ne fait défiler et n'envoie rien dans la page.
2. Si la demande ne s'affiche pas en 3 s, il écrit `À VOUS : connectez-vous à Jira dans la fenêtre…` et attend qu'elle s'affiche, `--delai-connexion` secondes au plus (300 par défaut, de 1 à 900). Le développeur se connecte lui-même, et revient sur la demande si Jira ne l'y ramène pas. Passé le délai, l'import est refusé, avec le code 2, sans rien écrire.
3. La page est enregistrée quand elle ne change plus : deux relevés identiques, à 500 ms d'intervalle, 10 s au plus.
4. Le profil dédié, `jira` par défaut (`--profil-jira`), garde la session : un SSO aux cookies persistants ne redemande pas la connexion. Il vit dans le dossier des profils (module `execution`, § 3) et ne sert à aucune application : `jira` ne se donne pas comme `Profil :` d'un texte.

La garde des origines (module `garde`) protège l'exécution d'un scénario ; la fenêtre de Jira n'en joue aucun, et la connexion peut passer par le fournisseur d'identité de l'entreprise : elle n'est pas gardée, d'où la règle du point 1.

## 3. Ce qui est lu (D16.INV-2)

| | Jira Cloud | Jira Data Center |
|---|---|---|
| reconnu à | `data-testid="issue.views.…"` | `id="summary-val"` ou `id="description-val"` |
| clé | titre de la page (`[DEMO-8] …`), sinon adresse (`…/browse/DEMO-8`, `…?selectedIssue=DEMO-8`) | idem |
| résumé | `issue.views.issue-base.foundation.summary.heading` | `summary-val` |
| description | `issue.views.field.rich-text.description` | `description-val` |
| champs de texte | `issue.views.field.rich-text.customfield_<n>`, nommés « champ customfield_<n> » | `customfield_<n>-val`, nommés par leur libellé |
| commentaires, avec `--commentaires` | `issue-comment-base.ui.comment.ak-comment.<n>`, avec auteur et date | `comment-<n>` et son `action-body`, avec auteur et date |

Une page qui n'est ni de l'une ni de l'autre est refusée, comme un fichier qui n'est pas un MHTML. Le HTML de chaque zone devient des lignes, comme la page les affiche : un saut de ligne par bloc et par `<br>`, ceux des blocs de code gardés, chaque ligne de tableau réécrite `| a | b |` ; scripts, styles et boutons sont écartés. Le reste de la page (navigation, historique, liens) n'est pas lu.

Chaque limite s'écrit `LIMITE …` : description introuvable par les marqueurs, lien « afficher plus » parmi les commentaires (les déplier avant d'enregistrer la page), lignes d'étape hors d'un titre de scénario, par exemple sous un titre « Scénario 1 : » que Gherkin ne reconnaît pas. Les scénarios se relisent le plus fidèlement écrits dans un bloc de code (`{code:gherkin}` en Data Center, bloc de code en Cloud).

## 4. Scénarios recopiés (D16.INV-3)

Les mots-clés de Gherkin se lisent en français ou en anglais, sans tenir compte de la casse ni des accents (module `texte`, § 3, D2.INV-4), et se recopient tels qu'écrits. Dans chaque zone :

| Ligne de Jira | Effet dans les textes importés |
|---|---|
| `Fonctionnalité:` (`Feature:`) et ses étiquettes | recopiée, avec ses étiquettes, dans chaque scénario qui la suit dans la zone |
| `Règle:` (`Rule:`) et ses étiquettes | ses étiquettes rejoignent ses scénarios |
| `Contexte:` (`Background:`) | ses étapes se placent en tête des étapes de chaque scénario de sa fonctionnalité, ou de sa règle ; l'en-tête le signale |
| titre de scénario | `Scénario:`, `Exemple:`, `Plan du scénario:`, `Scenario:`, `Example:`, `Scenario Outline:`… ; les lignes de description qui le suivent, avant la première étape, sont ignorées |
| étape | recopiée telle quelle, mot-clé compris ; une ligne de prose après les étapes clôt le scénario |
| `Exemples:` (`Examples:`, `Scénarios:`) | un seul tableau ; ses étiquettes rejoignent le scénario |

Les colonnes d'exemples que le format texte refuse s'adaptent, sans accents, en minuscules, `_` entre les mots : « Nom du client » devient `nom_du_client`, et `<Nom du client>` devient `<nom_du_client>` dans les étapes ; l'en-tête le signale. Rien d'autre n'est réécrit.

Un scénario que le format texte n'exprime pas n'est pas écrit, et l'import dit pourquoi : table de données ou texte multiligne (`"""`) d'étape, ou dans le contexte ; plusieurs tableaux d'exemples ; étape après le tableau ; scénario sans étape ; tableau sans ligne de valeurs ; deux colonnes confondues une fois adaptées ; texte que refuse le lecteur du module `texte`, par exemple une variable non déclarée, l'erreur citant la ligne. Il se corrige dans Jira, puis se réimporte.

## 5. Le texte importé (D16.INV-4)

```text
# Importé de Jira par importer.mjs (scenario-playwright 1.1.0), sans IA : le scénario est recopié tel qu'écrit dans Jira.
# Demande : DEMO-8, « Créer un client depuis Jira »
# Scénario : @DEMO-8-S03, description
# Source : https://jira.exemple.fr/browse/DEMO-8
# Page enregistrée : jira/DEMO-8-20261120-181500.mhtml (sha256 82112e…)
# Importé le : 2026-11-20T17:15:00Z
# Empreinte Jira : 4dc9c9…
# Empreinte du texte importé : 066f18…
# Étiquette @DEMO-8-S03 attribuée par l'import, Jira n'en donnant pas : l'écrire dans Jira, avant le titre du scénario, la fixe.
# Contexte de Jira reporté en tête des étapes : 1 étape.
# Colonnes d'exemples adaptées au format texte : « Nom du client » en <nom_du_client>.

Fonctionnalité: Clients
@DEMO-8-S03 @DEMO-8
Plan du scénario: Créer plusieurs clients
  Adresse : http://127.0.0.1:4200
  Profil : crm

  Étant donné que je suis sur la page des clients
  Quand je clique sur le lien « Nouveau client »
  Et je saisis « <nom_du_client> » dans le champ « Nom »
  Et je choisis « <ville> » dans la liste « Ville »
  Et je clique sur le bouton « Enregistrer »
  Alors je vois le message « Client <nom_du_client> créé »

  Exemples:
    | nom_du_client | ville |
    | Leroy | Lyon |
    | Morel | Paris |
```

- **Nom** : `<ÉTIQUETTE>.scenario`, dans le dossier de `--dossier` (`scenarios` par défaut, relatif au dossier courant).
- **Étiquette** : celle que Jira donne au scénario, `@<CLÉ>-Snn` (`agent-tdd-jira:D2.INV-3`) ; sinon celle qu'un import précédent a attribuée au scénario de même titre ; sinon le plus petit numéro libre, dans l'ordre de la page, hors des numéros déjà portés par un texte importé de la demande. Le second scénario d'une même étiquette est un doublon : il n'est pas écrit.
- **Provenance** : les commentaires de tête, toujours dans cet ordre ; le lecteur de textes les ignore. L'empreinte Jira est le SHA-256 de ce que Jira dit du scénario : fonctionnalité, étiquettes, titre, étapes, exemples ; la prose autour n'y entre pas. L'empreinte du texte importé est celle du corps du texte, tel que l'import l'a écrit : elle dit si le texte a été retouché depuis.
- **Réglages** : `--adresse`, et s'il y a lieu `--origines` et `--profil`, donnés à l'import, s'écrivent sous le titre ; la ligne « Adresse : » est obligatoire (D2.INV-1).

## 6. Réimport et comparaison (D16.INV-5)

Les textes du dossier dont la provenance désigne la même demande sont comparés aux scénarios de la page, par leur étiquette :

| État | `--comparer` | import | import avec `--remplacer` |
|---|---|---|---|
| identique | `identique` | `inchangé` : le texte n'est pas réécrit | idem |
| modifié dans Jira | `modifié` | non remplacé ; code 1 | `remplacé` ; un texte retouché depuis l'import est d'abord gardé dans `<texte>.avant-<horodatage>` |
| nouveau | `nouveau` | `écrit` | `écrit` |
| disparu de Jira | `disparu` | signalé ; le texte reste | idem |
| conflit : un texte du même nom ne vient pas d'un import de la demande | `conflit` | jamais remplacé ; code 1 | idem |
| refusé, doublon | `refusé`, `doublon`, avec le motif | non écrit ; code 1 | idem |

`--comparer` n'écrit aucun texte. Un texte remplacé rend sa traduction périmée, par l'empreinte (D3.INV-2) : elle se refait et se ratifie. Les marques `(création)`, `(modification)`, `(suppression)` et `(à la main)` manquent souvent aux scénarios de Jira : elles s'ajoutent de préférence dans Jira, où un réimport les retrouve ; ajoutées dans le texte, elles font un texte retouché, gardé à côté avant tout remplacement.

## 7. Ligne de commande et codes de sortie (D16.INV-6)

`importer.mjs <page.mhtml | adresse de la demande>` :

| Option | Effet |
|---|---|
| `--adresse <url>` | adresse de l'application, ligne « Adresse : » des textes ; obligatoire, sauf avec `--comparer` |
| `--origines o1,o2` | ligne « Origines : » ; doit contenir l'origine de `--adresse` |
| `--profil <nom>` | ligne « Profil : » |
| `--dossier <dossier>` | dossier des textes, `scenarios` par défaut ; la page enregistrée par l'adresse va dans son sous-dossier `jira/` |
| `--commentaires` | lit aussi les commentaires (D16.INV-2) |
| `--remplacer` | remplace les textes des scénarios modifiés dans Jira (§ 6) |
| `--comparer` | compare sans rien écrire ; exclut `--remplacer` |
| `--profil-jira <nom>` | profil du navigateur pour Jira, `jira` par défaut |
| `--delai-connexion <s>` | attente de la demande par l'adresse, de 1 à 900 s, 300 par défaut |

Sortie : `page enregistrée : …` par l'adresse, une ligne `Demande <CLÉ> (Jira Cloud ou Data Center), « résumé » : n scénarios (par zone)`, les `LIMITE …`, une ligne par scénario (état, étiquette, titre, fichier ou motif), puis `Bilan : …`.

| Code | import | `--comparer` |
|---|---|---|
| 0 | chaque scénario est écrit, remplacé ou inchangé | chaque scénario est identique, aucun n'a disparu |
| 1 | un scénario n'est pas écrit : modifié sans `--remplacer`, conflit, refus, doublon ; ou aucun scénario | une différence, un refus, ou aucun scénario |
| 2 | option, réglage, page ou navigateur refusé, demande non affichée dans le délai, avant toute écriture de texte | idem |

## 8. Contrôle de sortie

- Une page enregistrée de Jira Cloud ou de Jira Data Center se lit, quoted-printable ou base64 ; une autre page est refusée (D16.INV-2).
- Les commentaires ne sont lus qu'avec `--commentaires` (D16.INV-2).
- Chaque scénario importable donne un texte que `verifier.mjs` accepte, mots-clés recopiés tels qu'écrits ; un scénario non importable est refusé avec son motif (D16.INV-3).
- Chaque texte porte sa provenance et son étiquette (D16.INV-4).
- Un réimport sans changement ne réécrit rien ; `--comparer` n'écrit rien ; un texte retouché est gardé avant d'être remplacé ; un texte écrit à la main n'est jamais remplacé (D16.INV-5).
- Par l'adresse, le skill ne fait que naviguer ; la connexion se fait à la main ; la page enregistrée est relisible (D16.INV-1).

## 9. Source `scripts/jira.mjs`

Le lecteur, sans navigateur : MHTML, demande, lignes du HTML, scénarios, étiquettes, texte importé, provenance, comparaison.

<!-- fichier : scripts/jira.mjs -->
```javascript
// scenario-playwright 1.1.1 : scénarios Gherkin d'une demande Jira enregistrée en MHTML, lus sans IA.
//
// Le décodage du MHTML (en-têtes, frontière, quoted-printable, base64, jeu de caractères) et les
// marqueurs de Jira Cloud et de Jira Data Center sont repris d'agent-tdd-jira 1.3.4 (module
// ingestion-jira). Seuls la description et les champs de texte de la demande sont lus, les commentaires
// sur demande (D16.INV-2). Chaque scénario est recopié tel qu'écrit dans Jira, en français ou en
// anglais, dans un texte de départ qui porte sa provenance (D16.INV-3, D16.INV-4).
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { analyserTexte, estOrigine, lireMotCle, lireTitre, normaliser, origineDe, plat, RE_PROFIL } from './texte.mjs';

export class ErreurJira extends Error {}

const sha256 = (donnees) => createHash('sha256').update(donnees).digest('hex');

// --- MHTML ---------------------------------------------------------------------------------------

function lireEntetes(bloc) {
  const entetes = {};
  for (const ligne of bloc.replace(/\r?\n[ \t]+/g, ' ').split(/\r?\n/)) {
    const m = /^([\w-]+):\s*(.*)$/.exec(ligne);
    if (m) entetes[m[1].toLowerCase()] = m[2].trim();
  }
  return entetes;
}

function separerEntetes(texte) {
  const m = /\r?\n\r?\n/.exec(texte);
  return m ? [texte.slice(0, m.index), texte.slice(m.index + m[0].length)] : [texte, ''];
}

function decoderQuotedPrintable(texte) {
  const brut = texte.replace(/=\r?\n/g, '');
  const octets = [];
  for (let i = 0; i < brut.length; i++) {
    if (brut[i] === '=' && /^[0-9A-Fa-f]{2}$/.test(brut.slice(i + 1, i + 3))) {
      octets.push(parseInt(brut.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      octets.push(brut.charCodeAt(i) & 0xff);
    }
  }
  return Buffer.from(octets);
}

function decoderCorps(corps, encodage) {
  switch ((encodage ?? '').toLowerCase()) {
    case 'quoted-printable': return decoderQuotedPrintable(corps);
    case 'base64': return Buffer.from(corps.replace(/\s+/g, ''), 'base64');
    default: return Buffer.from(corps, 'latin1');
  }
}

/**
 * Page HTML d'un fichier MHTML : { html, emplacement, sha256 }. La première partie text/html est la
 * page ; son jeu de caractères vient de ses en-têtes. Lève ErreurJira si le fichier n'est pas un MHTML.
 */
export function lireMhtml(octets) {
  const brut = Buffer.from(octets).toString('latin1');
  const [blocEntetes] = separerEntetes(brut);
  const frontiere = /boundary="?([^";\r\n]+)"?/i.exec(lireEntetes(blocEntetes)['content-type'] ?? '')?.[1];
  if (!frontiere) throw new ErreurJira('frontière MIME introuvable : le fichier n\'est pas une page enregistrée en MHTML');
  const parties = brut.split(`--${frontiere}`).slice(1).filter((p) => !p.startsWith('--')).map((p) => {
    const [bloc, corps] = separerEntetes(p.replace(/^\r?\n/, ''));
    const entetes = lireEntetes(bloc);
    return {
      type: (entetes['content-type'] ?? '').split(';')[0].trim().toLowerCase(),
      charset: /charset="?([^";]+)"?/i.exec(entetes['content-type'] ?? '')?.[1]?.toLowerCase() ?? 'utf-8',
      emplacement: entetes['content-location'] ?? '',
      octets: decoderCorps(corps.replace(/\r?\n$/, ''), entetes['content-transfer-encoding']),
    };
  });
  const page = parties.find((p) => p.type === 'text/html');
  if (!page) throw new ErreurJira('aucune page HTML dans le fichier MHTML');
  const html = page.octets.toString(/8859|latin|windows-1252/.test(page.charset) ? 'latin1' : 'utf8');
  return { html, emplacement: page.emplacement, sha256: sha256(Buffer.from(octets)) };
}

// --- HTML ----------------------------------------------------------------------------------------

/** Bloc équilibré qui commence à la balise ouvrante contenant la position `index`. */
function blocDepuis(html, index) {
  const debut = html.lastIndexOf('<', index);
  const nom = /^<([a-zA-Z0-9]+)/.exec(html.slice(debut))?.[1]?.toLowerCase();
  if (!nom) return '';
  const motif = new RegExp(`<(/?)${nom}\\b[^>]*?(/?)>`, 'gi');
  motif.lastIndex = debut;
  let profondeur = 0;
  let m;
  while ((m = motif.exec(html))) {
    if (m[2] === '/') continue;
    profondeur += m[1] === '/' ? -1 : 1;
    if (profondeur === 0) return html.slice(debut, m.index + m[0].length);
  }
  return html.slice(debut);
}

/** Blocs portant un attribut, dans l'ordre de la page, sans les blocs imbriqués dans un bloc déjà pris. */
function blocsParAttribut(html, motifAttribut) {
  const blocs = [];
  const re = new RegExp(motifAttribut, 'g');
  let fin = -1;
  let m;
  while ((m = re.exec(html))) {
    if (m.index < fin) continue;
    const bloc = blocDepuis(html, m.index);
    blocs.push({ bloc, correspondance: m, index: m.index });
    fin = html.lastIndexOf('<', m.index) + bloc.length;
  }
  return blocs;
}

const ENTITES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', eacute: 'é', egrave: 'è', ecirc: 'ê', euml: 'ë', agrave: 'à',
  acirc: 'â', ccedil: 'ç', ocirc: 'ô', ucirc: 'û', ugrave: 'ù', icirc: 'î', iuml: 'ï', Eacute: 'É', Egrave: 'È', Agrave: 'À',
  Ccedil: 'Ç', rsquo: '’', lsquo: '‘', laquo: '«', raquo: '»', ldquo: '“', rdquo: '”', hellip: '…', ndash: '–', mdash: '—',
};
const decoderEntites = (s) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-zA-Z]+);/g, (e, n) => ENTITES[n] ?? e);

const ESPACES = /[\s\u00a0\u202f]+/g;
const sansBalises = (s) => decoderEntites(s.replace(/<[^>]+>/g, ' ')).replace(ESPACES, ' ').trim();

/**
 * Lignes de texte d'un fragment HTML, comme la page les affiche : un saut de ligne par bloc et par
 * <br>, les sauts de ligne gardés dans <pre>, chaque ligne de tableau réécrite « | a | b | ». Les
 * lignes sont en NFC, espaces regroupés ; les lignes vides restent.
 */
export function htmlEnLignes(fragment) {
  let html = fragment
    .replace(/<(script|style|svg|noscript|button)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<span\b[^>]*class="[^"]*linenumber[^"]*"[^>]*>\s*\d*\s*<\/span>/gi, '');
  // Lignes de tableau : cellules aplaties, barres verticales des cellules protégées.
  html = html.replace(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi, (_, ligne) => {
    const cellules = [...ligne.matchAll(/<t([dh])\b[^>]*>([\s\S]*?)<\/t\1>/gi)].map((c) => sansBalises(c[2]).replace(/\|/g, '\\|'));
    return `<br>| ${cellules.join(' | ')} |<br>`;
  });
  // Texte préformaté (<pre>, <code>) : ses sauts de ligne deviennent des <br>, les autres blancs du HTML des espaces.
  const morceaux = html.split(/(<pre\b[^>]*>[\s\S]*?<\/pre>|<code\b[^>]*>[\s\S]*?<\/code>)/i);
  html = morceaux.map((m, i) => (i % 2 === 1 ? m.replace(/\r?\n/g, '<br>') : m.replace(/\s+/g, ' '))).join('');
  const texte = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|div|h[1-6]|li|pre|blockquote|table|thead|tbody|ul|ol|dt|dd|section|article|header|footer)\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  return decoderEntites(texte).split('\n').map((l) => l.replace(ESPACES, ' ').trim().normalize('NFC'));
}

// --- Demande Jira --------------------------------------------------------------------------------

/**
 * Demande lue dans la page : { variante, cle, resume, url, zones, limites }. Chaque zone a son genre
 * (description, champ, commentaire), son libellé de provenance et ses lignes. Une page qui n'est ni de
 * Jira Cloud ni de Jira Data Center est refusée (D16.INV-2).
 */
export function lireDemande(html, emplacement = '', { commentaires = false } = {}) {
  const titrePage = sansBalises(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '');
  const cloud = /data-testid="issue\.views\./.test(html);
  const datacenter = /id="(summary-val|description-val)"/.test(html);
  if (!cloud && !datacenter) throw new ErreurJira('page non reconnue comme une demande de Jira Cloud ou de Jira Data Center (D16.INV-2)');
  const cle = /\b([A-Z][A-Z0-9_]+-\d+)\b/.exec(titrePage)?.[1] ?? /(?:\/browse\/|[?&]selectedIssue=)([A-Z][A-Z0-9_]+-\d+)/.exec(emplacement)?.[1] ?? null;
  if (!cle) throw new ErreurJira('clé de la demande introuvable, ni dans le titre de la page, ni dans son adresse');
  const premier = (motif) => blocsParAttribut(html, motif)[0]?.bloc ?? null;
  const zones = [];
  const limites = [];
  let resume;
  const commentaire = (bloc, auteur, corps) => {
    const date = /<time[^>]*datetime="([^"]+)"/.exec(bloc)?.[1] ?? '';
    zones.push({ zone: 'commentaire', libelle: `commentaire de ${auteur || 'auteur inconnu'}${date ? ` du ${date.slice(0, 10)}` : ''}`, lignes: htmlEnLignes(corps) });
  };
  if (cloud) {
    resume = premier('data-testid="issue\\.views\\.issue-base\\.foundation\\.summary\\.heading"');
    const description = premier('data-testid="issue\\.views\\.field\\.rich-text\\.description"');
    if (description) zones.push({ zone: 'description', libelle: 'description', lignes: htmlEnLignes(description) });
    for (const { bloc, correspondance } of blocsParAttribut(html, 'data-testid="issue\\.views\\.field\\.rich-text\\.(customfield_\\d+)"')) {
      zones.push({ zone: 'champ', libelle: `champ ${correspondance[1]}`, lignes: htmlEnLignes(bloc) });
    }
    if (commentaires) {
      for (const { bloc } of blocsParAttribut(html, 'data-testid="issue-comment-base\\.ui\\.comment\\.ak-comment\\.(\\d+)"')) {
        const auteur = sansBalises(/data-testid="[^"]*author[^"]*"[^>]*>([\s\S]*?)<\//.exec(bloc)?.[1] ?? '');
        commentaire(bloc, auteur, bloc.replace(/<([a-z0-9]+)\b[^>]*data-testid="[^"]*author[^"]*"[^>]*>[\s\S]*?<\/\1>/i, '').replace(/<time\b[\s\S]*?<\/time>/gi, ''));
      }
    }
  } else {
    resume = premier('id="summary-val"');
    const description = premier('id="description-val"');
    if (description) zones.push({ zone: 'description', libelle: 'description', lignes: htmlEnLignes(description) });
    for (const { bloc, correspondance, index } of blocsParAttribut(html, 'id="(customfield_\\d+)-val"')) {
      const nom = [...html.slice(Math.max(0, index - 800), index).matchAll(/<strong[^>]*title="([^"]+)"/g)].pop()?.[1];
      zones.push({ zone: 'champ', libelle: nom ? `champ « ${decoderEntites(nom)} »` : `champ ${correspondance[1]}`, lignes: htmlEnLignes(bloc) });
    }
    if (commentaires) {
      for (const { bloc } of blocsParAttribut(html, 'id="comment-(\\d+)"')) {
        const auteur = sansBalises(/class="[^"]*user-hover[^"]*"[^>]*>([\s\S]*?)<\/a>/.exec(bloc)?.[1] ?? '');
        const i = bloc.search(/class="[^"]*action-body/);
        commentaire(bloc, auteur, i >= 0 ? blocDepuis(bloc, i) : bloc);
      }
    }
  }
  if (!zones.some((z) => z.zone === 'description')) limites.push('description non trouvée par les marqueurs connus de Jira');
  if (commentaires && /(Show more|Afficher plus|more comments|autres commentaires|commentaires plus anciens)/i.test(sansBalises(html))) {
    limites.push('la page contient un lien « afficher plus » : des commentaires repliés peuvent manquer ; les déplier avant d\'enregistrer la page');
  }
  return { variante: cloud ? 'cloud' : 'datacenter', cle, resume: resume ? sansBalises(resume) : null, url: emplacement || null, zones, limites };
}

// --- Scénarios Gherkin ---------------------------------------------------------------------------

const estEtiquettes = (l) => /^@\S+(\s+@\S+)*$/.test(l);
const estBlocTexte = (l) => /^("""|```)/.test(l);

/** Empreinte Jira d'un scénario : ce que Jira en dit, fonctionnalité, étiquettes, titre, étapes, exemples. */
export function empreinteJira(sc) {
  return sha256(JSON.stringify({
    f: sc.fonctionnalite, e: sc.etiquettesJira, t: `${sc.motTitre}: ${sc.titre}`,
    s: sc.etapes.map((x) => `${x.motCle} ${x.phrase}`), x: sc.exemples ? [sc.exemples.motCle, ...sc.exemples.lignes] : null,
  }));
}

/**
 * Scénarios de chaque zone, dans l'ordre de la page : { scenarios, horsScenario }. Un scénario reprend
 * les étiquettes de sa fonctionnalité, de sa règle et de son tableau d'exemples, et le contexte de sa
 * fonctionnalité et de sa règle en tête de ses étapes. Un scénario que le format texte n'exprime pas
 * garde le motif de son refus. `horsScenario` compte, par zone, les lignes d'étape hors d'un scénario.
 */
export function extraireScenarios(zones) {
  const scenarios = [];
  const horsScenario = [];
  for (const z of zones) {
    let fonctionnalite = null;
    let tagsFonctionnalite = [];
    let tagsRegle = [];
    let dansRegle = false;
    let ctxFonctionnalite = { etapes: [], refus: null };
    let ctxRegle = { etapes: [], refus: null };
    let ctx = null;
    let enAttente = [];
    let courant = null;
    let mode = 'hors'; // hors, contexte, scenario, exemples
    let blocTexte = false;
    let perdues = 0;
    const fermer = () => {
      if (courant) scenarios.push(courant);
      courant = null;
      mode = 'hors';
    };
    for (const ligne of z.lignes) {
      if (blocTexte) {
        if (estBlocTexte(ligne)) blocTexte = false;
        continue;
      }
      if (ligne === '' || ligne.startsWith('#')) continue;
      if (estEtiquettes(ligne)) {
        enAttente.push(...ligne.split(/\s+/).map((t) => t.slice(1)));
        continue;
      }
      const titre = lireTitre(ligne);
      if (titre) {
        if (titre.genre === 'exemples' && courant) {
          if (courant.exemples) courant.refus ??= 'plusieurs tableaux d\'exemples, quand le format texte n\'en prend qu\'un';
          else courant.exemples = { motCle: titre.motCle, lignes: [] };
          courant.etiquettesJira = [...new Set([...courant.etiquettesJira, ...enAttente])];
          enAttente = [];
          mode = 'exemples';
          continue;
        }
        fermer();
        if (titre.genre === 'fonctionnalite') {
          fonctionnalite = `${titre.motCle}: ${titre.valeur}`;
          tagsFonctionnalite = enAttente;
          tagsRegle = [];
          dansRegle = false;
          ctxFonctionnalite = { etapes: [], refus: null };
          ctxRegle = { etapes: [], refus: null };
        } else if (titre.genre === 'regle') {
          tagsRegle = enAttente;
          dansRegle = true;
          ctxRegle = { etapes: [], refus: null };
        } else if (titre.genre === 'contexte') {
          ctx = { etapes: [], refus: null };
          if (dansRegle) ctxRegle = ctx; else ctxFonctionnalite = ctx;
          mode = 'contexte';
        } else if (titre.genre === 'scenario') {
          const contexte = [...ctxFonctionnalite.etapes, ...ctxRegle.etapes];
          courant = {
            zone: z.zone, provenance: z.libelle, fonctionnalite, motTitre: titre.motCle, titre: titre.valeur,
            etiquettesJira: [...new Set([...tagsFonctionnalite, ...tagsRegle, ...enAttente])],
            etapes: contexte.map((e) => ({ ...e })), contexte: contexte.length, exemples: null,
            refus: ctxFonctionnalite.refus ?? ctxRegle.refus ?? null,
          };
          mode = 'scenario';
        }
        enAttente = [];
        continue;
      }
      const etape = lireMotCle(ligne);
      if (etape) {
        enAttente = [];
        if (mode === 'contexte') ctx.etapes.push(etape);
        else if (mode === 'scenario') courant.etapes.push(etape);
        else if (mode === 'exemples') courant.refus ??= 'étape après le tableau d\'exemples';
        else perdues++;
        continue;
      }
      if (ligne.startsWith('|')) {
        if (mode === 'exemples') courant.exemples.lignes.push(ligne);
        else if (mode === 'scenario') courant.refus ??= 'table de données d\'étape, que le format texte ne prend pas';
        else if (mode === 'contexte') ctx.refus ??= 'table de données dans le contexte, que le format texte ne prend pas';
        continue;
      }
      if (estBlocTexte(ligne) && (mode === 'scenario' || mode === 'contexte')) {
        const motif = 'texte multiligne d\'étape, que le format texte ne prend pas';
        if (mode === 'scenario') courant.refus ??= motif; else ctx.refus ??= motif;
        blocTexte = true;
        continue;
      }
      // Ligne de prose : description d'un titre tant qu'aucune étape ne l'a suivi, sinon fin du bloc.
      enAttente = [];
      if (mode === 'scenario' && courant.etapes.length === courant.contexte) continue;
      if (mode === 'contexte' && ctx.etapes.length === 0) continue;
      fermer();
    }
    fermer();
    if (perdues > 0) horsScenario.push({ zone: z.libelle, lignes: perdues });
  }
  for (const sc of scenarios) {
    if (!sc.refus && sc.etapes.length === 0) sc.refus = 'scénario sans étape';
    if (!sc.refus && sc.exemples && sc.exemples.lignes.length < 2) sc.refus = 'tableau d\'exemples sans ligne de valeurs';
    sc.empreinte = empreinteJira(sc);
  }
  return { scenarios, horsScenario };
}

/**
 * Étiquette @<CLÉ>-Snn de chaque scénario (D16.INV-4) : celle que Jira lui donne ; sinon celle qu'un
 * import précédent a attribuée au scénario de même titre ; sinon le plus petit numéro libre, dans
 * l'ordre de la page, hors des numéros déjà portés par un texte importé de la demande. Le second
 * scénario d'une même étiquette est un doublon. `importes` : textes importés de la demande (textesImportes).
 */
export function attribuerEtiquettes(scenarios, cle, importes = []) {
  const re = new RegExp(`^${cle}-S(\\d+)$`);
  const deJira = new Set(scenarios.flatMap((sc) => sc.etiquettesJira.filter((e) => re.test(e))));
  const pris = new Set([...deJira, ...importes.map((t) => t.etiquette)].filter((e) => re.test(e)).map((e) => Number(re.exec(e)[1])));
  const parTitre = new Map();
  for (const t of importes) if (t.attribuee && t.titre !== null && !deJira.has(t.etiquette)) parTitre.set(t.titre, [...(parTitre.get(t.titre) ?? []), t.etiquette]);
  const vues = new Map();
  let n = 1;
  for (const sc of scenarios) {
    const propre = sc.etiquettesJira.find((e) => re.test(e));
    if (propre) {
      sc.etiquette = propre;
      sc.attribuee = false;
    } else {
      const reprise = (parTitre.get(sc.titre) ?? []).shift();
      if (reprise) sc.etiquette = reprise;
      else {
        while (pris.has(n)) n++;
        pris.add(n);
        sc.etiquette = `${cle}-S${String(n).padStart(2, '0')}`;
      }
      sc.attribuee = true;
    }
    sc.doublonDe = vues.get(sc.etiquette) ?? null;
    if (!vues.has(sc.etiquette)) vues.set(sc.etiquette, sc.titre);
  }
  return scenarios;
}

/** Nom de variable du format texte tiré d'un nom de colonne : sans accents, minuscules, _ entre les mots. */
export function nomDeVariable(brut) {
  const n = plat(brut).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (n === '') return null;
  return /^[0-9]/.test(n) ? `v_${n}` : n;
}

const cellulesDe = (ligne) => ligne.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map((c) => c.trim());

/**
 * Colonnes d'exemples adaptées au format texte, et chaque <colonne> des étapes avec elles : rend
 * { etapes, exemples, renommees, erreur }. Le reste du scénario n'est pas touché.
 */
export function adapterVariables(sc) {
  if (!sc.exemples) return { etapes: sc.etapes, exemples: null, renommees: [], erreur: null };
  const [entetes, ...valeurs] = sc.exemples.lignes.map(cellulesDe);
  const noms = entetes.map(nomDeVariable);
  const renommees = [];
  for (let i = 0; i < entetes.length; i++) {
    if (noms[i] === null) return { erreur: `colonne d'exemples « ${entetes[i]} » sans lettre ni chiffre` };
    const j = noms.indexOf(noms[i]);
    if (j !== i) return { erreur: `colonnes d'exemples « ${entetes[j]} » et « ${entetes[i]} » confondues une fois adaptées en <${noms[i]}>` };
    if (noms[i] !== entetes[i]) renommees.push([entetes[i], noms[i]]);
  }
  const parNom = new Map(entetes.map((e, i) => [e, noms[i]]));
  const etapes = sc.etapes.map((e) => ({ ...e, phrase: e.phrase.replace(/<([^<>]+)>/g, (tout, v) => (parNom.has(v.trim()) ? `<${parNom.get(v.trim())}>` : tout)) }));
  const ligne = (c) => `| ${c.join(' | ')} |`;
  return { etapes, exemples: { motCle: sc.exemples.motCle, lignes: [ligne(noms), ...valeurs.map(ligne)] }, renommees, erreur: null };
}

export const ENTETE_IMPORT = '# Importé de Jira par importer.mjs';

/** En-tête de provenance et corps d'un texte : l'en-tête est la suite de commentaires qui l'ouvre. */
function separerProvenance(texte) {
  const lignes = normaliser(texte).split('\n');
  let i = 0;
  while (i < lignes.length && lignes[i].startsWith('#')) i++;
  return { entete: lignes.slice(0, i), corps: lignes.slice(i).join('\n') };
}

/**
 * Texte de départ d'un scénario importé (D16.INV-3, D16.INV-4) : en-tête de provenance en commentaires,
 * puis le scénario tel qu'écrit dans Jira, avec les réglages donnés à l'import. Rend { texte, erreurs } ;
 * chaque erreur du lecteur de textes est rendue avec la ligne qu'elle concerne.
 */
export function texteImporte(sc, { cle, resume, source, page = null, date, adresse, origines = [], profil = null }) {
  const adapte = adapterVariables(sc);
  if (adapte.erreur) return { texte: null, erreurs: [adapte.erreur] };
  const corps = [''];
  if (sc.fonctionnalite) corps.push(sc.fonctionnalite);
  corps.push([sc.etiquette, ...sc.etiquettesJira.filter((e) => e !== sc.etiquette)].map((e) => `@${e}`).join(' '));
  corps.push(`${sc.motTitre}: ${sc.titre}`);
  corps.push(`  Adresse : ${adresse}`);
  if (origines.length) corps.push(`  Origines : ${origines.join(', ')}`);
  if (profil) corps.push(`  Profil : ${profil}`);
  corps.push('');
  for (const e of adapte.etapes) corps.push(`  ${e.motCle} ${e.phrase}`);
  if (adapte.exemples) {
    corps.push('', `  ${adapte.exemples.motCle}:`);
    for (const r of adapte.exemples.lignes) corps.push(`    ${r}`);
  }
  const corpsTexte = `${corps.join('\n')}\n`;
  const entete = [
    `${ENTETE_IMPORT} (scenario-playwright 1.1.1), sans IA : le scénario est recopié tel qu'écrit dans Jira.`,
    `# Demande : ${cle}${resume ? `, « ${resume} »` : ''}`,
    `# Scénario : @${sc.etiquette}, ${sc.provenance}`,
    `# Source : ${source}`,
  ];
  if (page) entete.push(`# Page enregistrée : ${page.chemin} (sha256 ${page.sha256})`);
  entete.push(`# Importé le : ${date}`, `# Empreinte Jira : ${sc.empreinte}`, `# Empreinte du texte importé : ${sha256(normaliser(corpsTexte))}`);
  if (sc.attribuee) entete.push(`# Étiquette @${sc.etiquette} attribuée par l'import, Jira n'en donnant pas : l'écrire dans Jira, avant le titre du scénario, la fixe.`);
  if (sc.contexte > 0) entete.push(`# Contexte de Jira reporté en tête des étapes : ${sc.contexte} étape${sc.contexte > 1 ? 's' : ''}.`);
  if (adapte.renommees.length) entete.push(`# Colonnes d'exemples adaptées au format texte : ${adapte.renommees.map(([a, b]) => `« ${a} » en <${b}>`).join(', ')}.`);
  const texte = `${entete.join('\n')}\n${corpsTexte}`;
  const lignes = texte.split('\n');
  const erreurs = analyserTexte(texte).erreurs.map((e) => (e.ligne > 0 ? `« ${lignes[e.ligne - 1].trim()} » : ${e.message}` : e.message));
  return { texte: erreurs.length ? null : texte, erreurs };
}

/**
 * Provenance d'un texte importé : { cle, etiquette, attribuee, empreinte, retouche }, ou null pour un
 * texte écrit à la main. `retouche` dit si le corps du texte a changé depuis l'import.
 */
export function lireProvenance(texte) {
  const { entete, corps } = separerProvenance(texte);
  if (!entete[0]?.startsWith(ENTETE_IMPORT)) return null;
  const champ = (re) => entete.map((l) => re.exec(l)?.[1]).find(Boolean) ?? null;
  const importe = champ(/^# Empreinte du texte importé : ([0-9a-f]{64})$/);
  return {
    cle: champ(/^# Demande : ([A-Z][A-Z0-9_]+-\d+)\b/),
    etiquette: champ(/^# Scénario : @([^\s,]+)/),
    attribuee: entete.some((l) => /^# Étiquette @\S+ attribuée par l'import/.test(l)),
    empreinte: champ(/^# Empreinte Jira : ([0-9a-f]{64})$/),
    retouche: importe === null ? null : importe !== sha256(corps),
  };
}

/**
 * Textes du dossier importés de la demande `cle` : [{ fichier, etiquette, attribuee, titre, empreinte,
 * retouche }], le premier texte d'une étiquette seulement. `existants` : [{ fichier, texte }].
 */
export function textesImportes(existants, cle) {
  const vus = new Set();
  const importes = [];
  for (const f of existants) {
    const p = lireProvenance(f.texte);
    if (p?.cle !== cle || !p.etiquette || vus.has(p.etiquette)) continue;
    vus.add(p.etiquette);
    importes.push({ fichier: f.fichier, ...p, titre: analyserTexte(f.texte).scenario.titre });
  }
  return importes;
}

/**
 * État de chaque scénario de la page face aux textes du dossier (D16.INV-5) : nouveau, identique,
 * modifie, conflit (un autre texte porte déjà son nom), refuse, doublon ; et disparu pour un texte
 * importé de la demande dont l'étiquette n'est plus dans la page. `fichiers` : noms des textes du dossier.
 */
export function comparer(scenarios, importes, fichiers) {
  const parEtiquette = new Map(importes.map((t) => [t.etiquette, t]));
  const etats = [];
  for (const sc of scenarios) {
    if (sc.refus) { etats.push({ etat: 'refuse', sc, motif: sc.refus }); continue; }
    if (sc.doublonDe !== null) { etats.push({ etat: 'doublon', sc, motif: `même étiquette que « ${sc.doublonDe} »` }); continue; }
    const t = parEtiquette.get(sc.etiquette);
    if (t) {
      etats.push({ etat: t.empreinte === sc.empreinte ? 'identique' : 'modifie', sc, fichier: t.fichier, retouche: t.retouche });
      continue;
    }
    const fichier = `${sc.etiquette}.scenario`;
    const homonyme = fichiers.find((x) => x.toLowerCase() === fichier.toLowerCase());
    if (homonyme) etats.push({ etat: 'conflit', sc, fichier: homonyme });
    else etats.push({ etat: 'nouveau', sc, fichier });
  }
  const presentes = new Set(scenarios.map((sc) => sc.etiquette));
  for (const t of importes) if (!presentes.has(t.etiquette)) etats.push({ etat: 'disparu', etiquette: t.etiquette, fichier: t.fichier, retouche: t.retouche });
  return etats;
}

/** Réglages donnés à l'import, contrôlés avant toute écriture : rend la liste des erreurs. */
export function verifierReglages({ adresse, origines = [], profil = null }) {
  const erreurs = [];
  if (!adresse || origineDe(adresse) === null) erreurs.push('--adresse attend l\'adresse http ou https de l\'application, celle de la ligne « Adresse : » des textes');
  for (const o of origines) if (!estOrigine(o)) erreurs.push(`--origines : origine invalide « ${o} » (schéma, hôte et port, sans chemin)`);
  if (adresse && origineDe(adresse) && origines.length && !origines.map((o) => o.replace(/\/$/, '')).includes(origineDe(adresse))) erreurs.push(`--origines doit contenir l'origine de --adresse, ${origineDe(adresse)}`);
  if (profil !== null && !RE_PROFIL.test(profil)) erreurs.push(`--profil invalide : « ${profil} » (minuscules, chiffres, - et _)`);
  return erreurs;
}
```

## 10. Source `scripts/importer.mjs`

La ligne de commande : options, page par l'adresse (capture) ou par le fichier, lecture, comparaison aux textes du dossier, écriture.

<!-- fichier : scripts/importer.mjs -->
```javascript
#!/usr/bin/env node
// scenario-playwright 1.1.1 : importe les scénarios Gherkin d'une demande Jira en textes de départ, sans IA.
//
// Usage, depuis n'importe quel dossier :
//   node <dossier du skill>/scripts/importer.mjs <page.mhtml | adresse de la demande> --adresse <url>
//     [--origines o1,o2] [--profil nom] [--dossier dossier] [--commentaires] [--remplacer]
//     [--profil-jira nom] [--delai-connexion s]
//   node <dossier du skill>/scripts/importer.mjs <page.mhtml | adresse de la demande> --comparer [--dossier dossier] [--commentaires]
// Avec une adresse, la demande s'ouvre dans le navigateur du poste, sur le profil dédié à Jira : la
// connexion se fait par le développeur, dans la fenêtre ; le skill n'y clique ni n'y saisit rien, et
// enregistre la page en MHTML dans <dossier>/jira/ (D16.INV-1). Chaque scénario devient <ÉTIQUETTE>.scenario
// dans le dossier. Codes de sortie : 0 tout est écrit ou inchangé (avec --comparer : aucune différence),
// 1 un scénario n'est pas écrit (avec --comparer : une différence), 2 refus avant toute écriture de texte.
import { Buffer } from 'node:buffer';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { setTimeout as attendre } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
import { attribuerEtiquettes, comparer, ErreurJira, extraireScenarios, lireDemande, lireMhtml, texteImporte, textesImportes, verifierReglages } from './jira.mjs';
import { dossierProfil, lireReglages, ouvrirNavigateur } from './session.mjs';
import { origineDe, RE_PROFIL } from './texte.mjs';

const USAGE = 'Usage : node scripts/importer.mjs <page.mhtml | adresse de la demande> --adresse <url> [--origines o1,o2] [--profil nom] [--dossier dossier] [--commentaires] [--remplacer | --comparer] [--profil-jira nom] [--delai-connexion s]';
export const PROFIL_JIRA = 'jira';
export const DELAI_CONNEXION = 300;
const MARQUEURS = '[data-testid^="issue.views."], #summary-val, #description-val';

/** Lit la ligne de commande ; rend { options } ou { erreur }. */
export function lireArguments(args) {
  const o = { source: null, adresse: null, origines: [], profil: null, dossier: 'scenarios', commentaires: false, remplacer: false, comparer: false, profilJira: PROFIL_JIRA, delaiConnexion: DELAI_CONNEXION };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const suivant = () => {
      if (i + 1 >= args.length) throw new Error(`${a} attend une valeur`);
      return args[++i];
    };
    try {
      if (a === '--adresse') o.adresse = suivant();
      else if (a === '--origines') o.origines = suivant().split(',').map((x) => x.trim()).filter(Boolean);
      else if (a === '--profil') o.profil = suivant();
      else if (a === '--dossier') o.dossier = suivant();
      else if (a === '--profil-jira') {
        o.profilJira = suivant();
        if (!RE_PROFIL.test(o.profilJira)) throw new Error(`--profil-jira invalide : « ${o.profilJira} » (minuscules, chiffres, - et _)`);
      } else if (a === '--delai-connexion') {
        const v = Number(suivant());
        if (!Number.isInteger(v) || v < 1 || v > 900) throw new Error('--delai-connexion attend un nombre de secondes, de 1 à 900');
        o.delaiConnexion = v;
      } else if (a === '--commentaires') o.commentaires = true;
      else if (a === '--remplacer') o.remplacer = true;
      else if (a === '--comparer') o.comparer = true;
      else if (a.startsWith('-')) throw new Error(`option inconnue : ${a}`);
      else if (o.source !== null) throw new Error(`une seule demande à la fois (« ${a} » en plus)`);
      else o.source = a;
    } catch (e) {
      return { erreur: e.message };
    }
  }
  if (o.source === null) return { erreur: 'page MHTML ou adresse de la demande manquante' };
  if (o.remplacer && o.comparer) return { erreur: '--comparer n\'écrit rien : sans --remplacer' };
  return { options: o };
}

const deux = (n) => String(n).padStart(2, '0');
const horodatage = (d = new Date()) => `${d.getFullYear()}${deux(d.getMonth() + 1)}${deux(d.getDate())}-${deux(d.getHours())}${deux(d.getMinutes())}${deux(d.getSeconds())}`;
const compte = (n, un, plusieurs) => `${n} ${n > 1 ? plusieurs : un}`;
const chemin = (de, vers) => relative(de, vers).split('\\').join('/');
const refus = (lignes) => {
  for (const l of [].concat(lignes)) console.error(`ERREUR ${l}`);
  return 2;
};

/** Attend que la page ne change plus : deux relevés identiques de suite, 10 s au plus. */
async function stabiliser(page) {
  const fin = Date.now() + 10_000;
  let avant = -1;
  let stables = 0;
  while (Date.now() < fin && stables < 2) {
    await attendre(500);
    const n = (await page.content().catch(() => '')).length;
    stables = n === avant ? stables + 1 : 0;
    avant = n;
  }
}

/**
 * Ouvre la demande dans le navigateur du poste, sur le profil dédié à Jira, et rend la page en MHTML
 * (D16.INV-1) : { octets } ou { erreur }. Le skill navigue vers l'adresse donnée, et rien d'autre ; la
 * connexion, s'il en faut une, se fait par le développeur dans la fenêtre.
 */
export async function capturer(adresse, { reglages, profilJira, delaiConnexion }) {
  let contexte;
  try {
    contexte = await ouvrirNavigateur({ canal: reglages.canal, profil: dossierProfil(reglages, profilJira) });
  } catch (e) {
    const texte = String(e.message);
    if (/ProcessSingleton|profile.*in use|SingletonLock/i.test(texte)) return { erreur: `le profil ${profilJira} est déjà ouvert dans une autre fenêtre : la fermer, puis relancer` };
    return { erreur: `navigateur ${reglages.canal} introuvable ou impossible à lancer : ${texte.split('\n')[0]}` };
  }
  try {
    const page = contexte.pages()[0] ?? await contexte.newPage();
    await page.goto(adresse, { waitUntil: 'domcontentloaded', timeout: 60_000 }).catch(() => {});
    const marqueurs = page.locator(MARQUEURS).first();
    const affichee = (delai) => marqueurs.waitFor({ state: 'attached', timeout: delai }).then(() => true, () => false);
    if (!(await affichee(3000))) {
      console.log(`À VOUS : connectez-vous à Jira dans la fenêtre, et revenez sur la demande si Jira ne l'affiche pas — l'import reprend dès qu'elle s'affiche (${delaiConnexion} s au plus).`);
      if (!(await affichee(delaiConnexion * 1000))) return { erreur: `la demande ne s'est pas affichée en ${delaiConnexion} s : connexion non faite, ou adresse qui n'est pas celle d'une demande Jira` };
    }
    await stabiliser(page);
    const cdp = await contexte.newCDPSession(page);
    const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
    return { octets: Buffer.from(data, 'utf8') };
  } finally {
    await contexte.close().catch(() => {});
  }
}

const LIBELLES = { ecrit: 'écrit', inchange: 'inchangé', remplace: 'remplacé', modifie: 'modifié', refuse: 'refusé', doublon: 'doublon', conflit: 'conflit', disparu: 'disparu', identique: 'identique', nouveau: 'nouveau' };
const ligne = (etat, etiquette, reste) => console.log(`  ${LIBELLES[etat].padEnd(10)} ${etiquette ? `@${etiquette}` : ''}  ${reste}`);

export async function main(args, env = process.env) {
  const lu = lireArguments(args);
  if (lu.erreur) return refus([lu.erreur, USAGE]);
  const o = lu.options;
  if (!o.comparer) {
    const erreurs = verifierReglages(o);
    if (erreurs.length) return refus(erreurs);
  }
  const { reglages, erreurs: erreursEnv } = lireReglages(env);
  if (erreursEnv.length) return refus(erreursEnv);
  const dossier = resolve(o.dossier);
  const parAdresse = /^https?:\/\//i.test(o.source);

  let octets;
  if (parAdresse) {
    if (origineDe(o.source) === null) return refus(`adresse de la demande invalide : ${o.source}`);
    const capture = await capturer(o.source, { reglages, profilJira: o.profilJira, delaiConnexion: o.delaiConnexion });
    if (capture.erreur) return refus(capture.erreur);
    octets = capture.octets;
  } else {
    try {
      octets = readFileSync(o.source);
    } catch {
      return refus(`${o.source} : fichier introuvable`);
    }
  }

  let page;
  let demande;
  let erreurPage = null;
  try {
    page = lireMhtml(octets);
    demande = lireDemande(page.html, page.emplacement, { commentaires: o.commentaires });
  } catch (e) {
    if (!(e instanceof ErreurJira)) throw e;
    erreurPage = e.message;
  }
  let fichierPage = parAdresse ? null : resolve(o.source);
  if (parAdresse) {
    fichierPage = join(dossier, 'jira', `${demande?.cle ?? 'page'}-${horodatage()}.mhtml`);
    mkdirSync(join(dossier, 'jira'), { recursive: true });
    writeFileSync(fichierPage, octets);
    console.log(`page enregistrée : ${fichierPage} (elle reste sur le poste : l'écarter du dépôt du projet)`);
  }
  if (erreurPage) return refus(`${o.source} : ${erreurPage}`);

  const existants = existsSync(dossier)
    ? readdirSync(dossier, { withFileTypes: true }).filter((f) => f.isFile() && /\.scenario$/i.test(f.name)).map((f) => ({ fichier: f.name, texte: readFileSync(join(dossier, f.name), 'utf8') }))
    : [];
  const importes = textesImportes(existants, demande.cle);
  const { scenarios, horsScenario } = extraireScenarios(demande.zones);
  attribuerEtiquettes(scenarios, demande.cle, importes);
  const parZone = [...new Set(scenarios.map((s) => s.provenance))].map((z) => `${z} : ${scenarios.filter((s) => s.provenance === z).length}`);
  console.log(`Demande ${demande.cle} (Jira ${demande.variante === 'cloud' ? 'Cloud' : 'Data Center'})${demande.resume ? `, « ${demande.resume} »` : ''} : ${compte(scenarios.length, 'scénario', 'scénarios')}${parZone.length ? ` (${parZone.join(', ')})` : ''}${o.commentaires ? ', commentaires lus' : ''}`);
  for (const l of demande.limites) console.log(`LIMITE ${l}`);
  for (const h of horsScenario) console.log(`LIMITE ${compte(h.lignes, 'ligne d\'étape', 'lignes d\'étape')} hors d'un titre « Scénario: » ignorée${h.lignes > 1 ? 's' : ''} (${h.zone})`);
  if (scenarios.length === 0) {
    console.log(`Bilan : aucun scénario Gherkin trouvé dans la description ni dans les champs de texte${o.commentaires ? ', ni dans les commentaires' : ' (les commentaires se lisent avec --commentaires)'}`);
    return 1;
  }

  const etats = comparer(scenarios, importes, existants.map((f) => f.fichier));
  const titre = (e) => (e.sc ? e.sc.titre : '');

  if (o.comparer) {
    const n = { identique: 0, modifie: 0, nouveau: 0, disparu: 0, autre: 0 };
    for (const e of etats) {
      if (e.etat === 'identique') ligne('identique', e.sc.etiquette, `${titre(e)} (${e.fichier})${e.retouche ? ' ; texte retouché depuis l\'import' : ''}`);
      else if (e.etat === 'modifie') ligne('modifie', e.sc.etiquette, `${titre(e)} (${e.fichier}) : changé dans Jira depuis l'import${e.retouche ? ' ; texte retouché depuis l\'import' : ''}`);
      else if (e.etat === 'nouveau') ligne('nouveau', e.sc.etiquette, `${titre(e)} : pas encore importé`);
      else if (e.etat === 'disparu') ligne('disparu', e.etiquette, `${e.fichier} : le scénario n'est plus dans Jira`);
      else ligne(e.etat, e.sc.etiquette, `${titre(e)} : ${e.etat === 'conflit' ? `${e.fichier} existe et ne vient pas d'un import de ${demande.cle}` : e.motif}`);
      if (e.etat in n) n[e.etat]++; else n.autre++;
    }
    console.log(`Bilan : ${compte(n.identique, 'identique', 'identiques')}, ${compte(n.modifie, 'modifié', 'modifiés')}, ${compte(n.nouveau, 'nouveau', 'nouveaux')}, ${compte(n.disparu, 'disparu', 'disparus')}, ${compte(n.autre, 'non importable', 'non importables')}`);
    return n.modifie + n.nouveau + n.disparu + n.autre === 0 ? 0 : 1;
  }

  const contexte = {
    cle: demande.cle, resume: demande.resume, source: demande.url ?? (parAdresse ? o.source : 'page enregistrée'),
    page: { chemin: chemin(dossier, fichierPage), sha256: page.sha256 }, date: `${new Date().toISOString().slice(0, 19)}Z`,
    adresse: o.adresse, origines: o.origines.map((x) => x.replace(/\/$/, '')), profil: o.profil,
  };
  const n = { ecrit: 0, remplace: 0, inchange: 0, nonEcrit: 0, disparu: 0 };
  const quand = horodatage();
  for (const e of etats) {
    if (e.etat === 'identique') {
      ligne('inchange', e.sc.etiquette, `${titre(e)} (${e.fichier})`);
      n.inchange++;
    } else if (e.etat === 'disparu') {
      ligne('disparu', e.etiquette, `${e.fichier} : le scénario n'est plus dans Jira ; le texte reste, à supprimer par vous s'il le faut`);
      n.disparu++;
    } else if (e.etat === 'refuse' || e.etat === 'doublon') {
      ligne(e.etat, e.sc.etiquette, `${titre(e)} : ${e.motif}`);
      n.nonEcrit++;
    } else if (e.etat === 'conflit') {
      ligne('conflit', e.sc.etiquette, `${titre(e)} : ${e.fichier} existe et ne vient pas d'un import de ${demande.cle} ; jamais remplacé`);
      n.nonEcrit++;
    } else if (e.etat === 'modifie' && !o.remplacer) {
      ligne('modifie', e.sc.etiquette, `${titre(e)} (${e.fichier}) : changé dans Jira depuis l'import ; --remplacer pour remplacer le texte${e.retouche ? ', retouché depuis l\'import' : ''}`);
      n.nonEcrit++;
    } else {
      const { texte, erreurs } = texteImporte(e.sc, contexte);
      if (!texte) {
        ligne('refuse', e.sc.etiquette, `${titre(e)} : ${erreurs.join(' ; ')}`);
        n.nonEcrit++;
        continue;
      }
      mkdirSync(dossier, { recursive: true });
      const cible = join(dossier, e.fichier);
      let garde = '';
      if (e.etat === 'modifie' && e.retouche !== false) {
        const copie = `${cible}.avant-${quand}`;
        copyFileSync(cible, copie);
        garde = ` ; texte retouché depuis l'import, gardé dans ${chemin(dossier, copie)}`;
      }
      writeFileSync(cible, texte);
      if (e.etat === 'modifie') {
        ligne('remplace', e.sc.etiquette, `${titre(e)} → ${e.fichier}${garde}`);
        n.remplace++;
      } else {
        ligne('ecrit', e.sc.etiquette, `${titre(e)} → ${e.fichier}`);
        n.ecrit++;
      }
    }
  }
  console.log(`Bilan : ${compte(n.ecrit, 'écrit', 'écrits')}, ${compte(n.remplace, 'remplacé', 'remplacés')}, ${compte(n.inchange, 'inchangé', 'inchangés')}, ${compte(n.nonEcrit, 'non écrit', 'non écrits')}, ${compte(n.disparu, 'disparu', 'disparus')}`);
  if (n.ecrit + n.remplace > 0) console.log(`Dossier : ${dossier} ; ensuite, pour chaque texte écrit : verifier.mjs, puis la traduction et sa ratification.`);
  return n.nonEcrit === 0 ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (e) => { console.error(`ERREUR interne : ${e.stack ?? e}`); process.exitCode = 2; });
}
```
<<<FIN modules/jira/SKILL.md>>>

<<<FICHIER modules/scenario/SKILL.md>>>
---
name: scenario
description: Scénario TOML exécutable, format scenario-playwright.scenario/1 (clés de la racine, étapes et champs communs, valeurs par défaut, validation avant le navigateur avec l'étape et ses lignes, variables ${nom}, paramètres, jeux de valeurs et --param), traduction d'un texte de départ (squelette écrit sans IA par traduire.mjs, étapes complétées par l'IA, contrôle sans IA de la structure, des lignes, de l'ordre, des marques et des variables, empreinte du texte, plan présenté ligne par ligne pour la ratification), sources de scripts/toml.mjs et scripts/scenario.mjs. À lire pour traduire, vérifier ou corriger un scénario.
dimensions: [D3]
status: active
---

# Module `scenario` (D3)

Phases 7E couvertes : Éléments et Engendrent.

## 1. Format

Un scénario est un fichier TOML, `format = "scenario-playwright.scenario/1"`, lu par un lecteur sans dépendance (`scripts/toml.mjs`, repris de generateur-skill-ticket). Clés de la racine :

| Clé | Type | Défaut | Rôle |
|---|---|---|---|
| `format` | texte | | `"scenario-playwright.scenario/1"`, obligatoire |
| `titre` | texte | | titre du scénario, obligatoire |
| `etiquettes` | liste de textes sans espace | `[]` | étiquettes du texte, sans `@` : scénario et critères de l'US |
| `url_base` | adresse http ou https | | adresse de base, obligatoire ; `naviguer` et les adresses attendues s'y rapportent |
| `origines` | liste d'origines | origine de `url_base` | seules origines permises (module `garde`) ; contient celle de `url_base` |
| `profil` | minuscules, chiffres, `-`, `_` | `defaut` | profil du navigateur (module `session`) |
| `delai` | entier, de 1 à 30 | réglage, sinon 10 | délai d'une étape, en secondes (D5.INV-2) |
| `source` | chemin relatif, sans `..` | | texte de départ traduit, relatif au dossier du scénario (D3.INV-2) |
| `empreinte_source` | SHA-256 | | empreinte du texte à la traduction ; va avec `source` |
| `[parametres]` | table de valeurs | `{}` | valeurs par défaut des variables |
| `[[jeux]]` | tableau de tables | un jeu vide | une exécution par jeu ; chaque jeu a les mêmes variables |
| `[[etapes]]` | tableau de tables | | au moins une étape |

Champs communs à toutes les étapes :

| Champ | Rôle |
|---|---|
| `action` | une action du jeu fermé (module `actions`, § 1) |
| `ligne` | ligne de l'étape du texte qu'elle traduit ; obligatoire dans un scénario traduit |
| `delai` | délai de cette étape, en secondes, de 1 à 30 ; de 1 à 900 pour `main` |
| `mutation` | `creation`, `modification` ou `suppression`, pour une action qui agit : `cliquer`, `saisir`, `choisir`, `cocher`, `touche`, `televerser`, `telecharger` |

Les autres champs dépendent de l'action (module `actions`, § 1). Une clé inconnue, à la racine ou dans une étape, est refusée : une faute de frappe ne passe pas en silence.

## 2. Validation (D3.INV-1)

Un scénario n'est joué que s'il est valide. `verifier.mjs` et `jouer.mjs` font le même contrôle, avant d'ouvrir le navigateur : format, champs requis, action du jeu fermé, champs connus de l'action, cibles (module `cibles`), délais bornés, chemins de fichiers, origines des adresses, variables déclarées. Chaque erreur cite l'étape, sa ligne du TOML et sa ligne du texte :

```text
ERREUR creer.toml : étape 3 (ligne 26 du TOML, ligne 10 du texte) : action inconnue « clicker » ; actions : naviguer, cliquer, …
```

Les fichiers à téléverser, les jeux demandés et les valeurs de `--param` se contrôlent avec les variables substituées, toujours avant le navigateur (§ 3, D5.INV-5).

## 3. Variables, paramètres et jeux (D3.INV-6)

`${nom}` s'écrit dans tout texte d'une étape : adresse, valeur, texte attendu, message, chemin de fichier, textes d'une cible. Sa valeur vient, dans cet ordre :

1. de `--param nom=valeur`, en ligne de commande ;
2. du jeu joué, `[[jeux]]` ;
3. de `[parametres]`.

Une variable doit être déclarée dans `[parametres]` ou dans les jeux ; un `--param` qui ne désigne ni l'un ni l'autre est refusé. `$${` écrit un `${` littéral. Le scénario est joué une fois par jeu, chaque jeu dans un onglet neuf du même profil ; `--jeu n` n'en joue qu'un.

## 4. Traduction d'un texte de départ

La traduction donne à chaque phrase du texte ses actions. Elle se fait en quatre temps : le squelette et le contrôle sont sans IA ; compléter les étapes demande de comprendre les phrases ; la ratification revient au développeur.

### 4.1 Squelette (D3.INV-5)

`node <skill>/scripts/traduire.mjs <texte.scenario>` écrit `<texte>.toml` à côté du texte, sans IA : format, titre, étiquettes, adresse, origines et profil s'ils sont déclarés, `source`, `empreinte_source`, paramètres et jeux, puis, pour chaque étape du texte, un bloc :

```toml
# ligne 12 : Et je clique sur le bouton « Enregistrer » (création)
[[etapes]]
ligne = 12
action = "à compléter"
mutation = "creation"
```

Une ligne marquée « (à la main) » reçoit déjà `action = "main"` et son `message` ; il reste à écrire `jusqua`. Une marque de mutation reçoit déjà sa `mutation`. Les variables à reprendre sont rappelées en commentaire. `traduire.mjs` refuse d'écraser un scénario existant sans `--remplacer`. Tant qu'une étape garde `action = "à compléter"`, le scénario est refusé.

### 4.2 Compléter les étapes

L'IA, ou le développeur, complète chaque bloc : une action du jeu fermé et ses champs. Une phrase peut donner plusieurs étapes : le bloc se recopie, avec la même ligne, dans l'ordre du texte. Rien de ce qui précède le premier bloc ne se modifie à la main : la structure vient du texte. Les phrases conseillées du module `texte`, § 9, ont leur traduction.

### 4.3 Contrôle sans IA (D3.INV-2, D3.INV-3, D3.INV-4)

À chaque lecture d'un scénario qui cite `source`, `verifier.mjs` et `jouer.mjs` confrontent la traduction au texte :

| Contrôle | Refus |
|---|---|
| le texte existe, se lit sans erreur, et a l'empreinte notée | texte absent, non conforme, ou changé depuis la traduction : retraduire, puis faire ratifier |
| titre, étiquettes, adresse, origines, profil, paramètres et exemples sont ceux du texte | toute différence |
| chaque étape a une `ligne`, qui est une ligne d'étape du texte | ligne manquante, ou ligne qui n'est pas une étape |
| les lignes suivent l'ordre du texte | une étape avant celle d'une ligne précédente |
| chaque étape du texte a au moins une étape | une ligne non traduite |
| une marque `(création)`, `(modification)` ou `(suppression)` se retrouve en `mutation` sur une étape de sa ligne | marque perdue |
| une ligne « (à la main) » donne une seule étape `main` ; une étape `main` vient d'une telle ligne | `main` absente, en plusieurs étapes, ou ajoutée par la traduction |
| chaque variable `<nom>` d'une ligne se retrouve en `${nom}` dans une étape de cette ligne | variable perdue |

Ce contrôle ne juge pas le sens : il ne dit pas qu'un « Enregistrer » est bien traduit par un clic sur ce bouton. C'est le rôle de la ratification.

### 4.4 Plan et ratification

`node <skill>/scripts/verifier.mjs <texte>.toml --plan` montre la traduction ligne du texte par ligne du texte :

```text
Scénario : Créer un client  (@ECR-77-S01 @ECR-77-CA01)
Adresse : http://127.0.0.1:4200 ; origines : http://127.0.0.1:4200, http://127.0.0.1:8080
Jeux : 2 (nom)
l.8  Étant donné que je me connecte (à la main)
        → à la main : « je me connecte », jusqu'à l'adresse /accueil
l.9  Quand je clique sur le lien « Nouveau client »
        → cliquer getByRole('link', { name: 'Nouveau client' })
…
l.12  Et je clique sur le bouton « Enregistrer » (création)
        → cliquer getByRole('button', { name: 'Enregistrer' })  [création]
6 étapes, dont 1 qui modifie des données, et des étapes à la main.
```

Le développeur ratifie ce plan, ou le corrige ; rien ne se joue avant (D10.INV-1). Une correction ultérieure d'une étape se ratifie de même ; une modification du texte rend la traduction périmée, par l'empreinte.

Un scénario s'écrit aussi directement en TOML, sans texte de départ : il n'a alors ni `source` ni `ligne`, et seul le contrôle du § 2 s'applique.

## 5. Contrôle de sortie

- Un scénario valide passe ; chaque cas refusé du § 2 cite l'étape et ses lignes (D3.INV-1).
- Le squelette recopie la structure du texte et n'est pas jouable tant qu'une étape reste à compléter (D3.INV-5).
- Chaque écart du § 4.3 est relevé ; une traduction fidèle passe, en LF comme en CRLF (D3.INV-2 à D3.INV-4).
- `--param`, jeu et `[parametres]` se combinent dans cet ordre (D3.INV-6).

## 6. Source `scripts/toml.mjs`

<!-- fichier : scripts/toml.mjs -->
```javascript
// scenario-playwright 1.1.1 : lecteur TOML des scénarios exécutables, sans dépendance.
//
// Repris tel quel du lecteur de generateur-skill-ticket 1.1.1 (outils/toml.mjs). Il lit le sous-ensemble
// de TOML 1.0 dont un scénario a besoin : tables, tableaux de tables, clés nues, entre guillemets ou
// pointées, chaînes simples, littérales et multilignes, entiers, flottants, booléens, tableaux et tables
// en ligne. Les dates et les heures, les entiers hexadécimaux, octaux ou binaires ne sont pas pris en
// charge : ils lèvent une erreur qui donne la ligne, comme toute syntaxe inconnue. Les fins de ligne CRLF
// sont admises.

export class ErreurToml extends Error {}

const RE_CLE = /[A-Za-z0-9_-]+/y;
const RE_NOMBRE = /[+-]?\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d[\d_]*)?/y;
const ECHAPPEMENTS = { b: '\b', t: '\t', n: '\n', f: '\f', r: '\r', '"': '"', '\\': '\\' };

/** Lit un texte TOML et renvoie l'objet qu'il décrit. `nom` sert aux messages d'erreur. */
export function lireToml(source, nom = 'TOML') {
  const t = source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  let i = 0;
  const racine = {};
  const explicites = new WeakSet(); // tables ouvertes par un en-tête [table]
  let courante = racine;

  const erreur = (message) => {
    const ligne = t.slice(0, i).split('\n').length;
    throw new ErreurToml(`${nom}, ligne ${ligne} : ${message}`);
  };

  const espaces = () => {
    while (t[i] === ' ' || t[i] === '\t') i++;
  };
  const commentaire = () => {
    if (t[i] === '#') while (i < t.length && t[i] !== '\n') i++;
  };
  const blancs = () => {
    for (;;) {
      if (t[i] === ' ' || t[i] === '\t' || t[i] === '\n') i++;
      else if (t[i] === '#') commentaire();
      else return;
    }
  };
  const finDeLigne = () => {
    espaces();
    commentaire();
    if (i < t.length && t[i] !== '\n') erreur(`fin de ligne attendue, « ${t[i]} » trouvé`);
    i++;
  };

  const echappement = () => {
    const c = t[i + 1];
    if (c !== undefined && Object.hasOwn(ECHAPPEMENTS, c)) {
      i += 2;
      return ECHAPPEMENTS[c];
    }
    if (c === 'u' || c === 'U') {
      const n = c === 'u' ? 4 : 8;
      const hex = t.slice(i + 2, i + 2 + n);
      if (hex.length !== n || !/^[0-9A-Fa-f]+$/.test(hex)) erreur('échappement unicode invalide');
      i += 2 + n;
      return String.fromCodePoint(parseInt(hex, 16));
    }
    return erreur(`échappement inconnu : \\${c ?? ''}`);
  };

  const chaineBasique = () => {
    i++;
    let s = '';
    for (;;) {
      if (i >= t.length) erreur('chaîne non terminée');
      const c = t[i];
      if (c === '"') {
        i++;
        return s;
      }
      if (c === '\n') erreur('retour à la ligne dans une chaîne');
      if (c === '\\') s += echappement();
      else {
        s += c;
        i++;
      }
    }
  };

  const chaineLitterale = () => {
    i++;
    const fin = t.indexOf("'", i);
    const nl = t.indexOf('\n', i);
    if (fin < 0 || (nl >= 0 && nl < fin)) erreur('chaîne littérale non terminée');
    const s = t.slice(i, fin);
    i = fin + 1;
    return s;
  };

  const chaineMultiligne = (delimiteur, avecEchappements) => {
    i += 3;
    if (t[i] === '\n') i++;
    let s = '';
    for (;;) {
      if (i >= t.length) erreur('chaîne multiligne non terminée');
      if (t.startsWith(delimiteur, i)) {
        // Jusqu'à deux guillemets peuvent précéder le délimiteur de fin.
        let n = 3;
        while (t[i + n] === delimiteur[0] && n < 5) n++;
        s += delimiteur[0].repeat(n - 3);
        i += n;
        return s;
      }
      const c = t[i];
      if (avecEchappements && c === '\\') {
        let j = i + 1;
        while (t[j] === ' ' || t[j] === '\t') j++;
        if (t[j] === '\n') {
          // Barre oblique en fin de ligne : le retour et les blancs qui suivent disparaissent.
          i = j;
          while (t[i] === ' ' || t[i] === '\t' || t[i] === '\n') i++;
        } else s += echappement();
      } else {
        s += c;
        i++;
      }
    }
  };

  const cleSimple = () => {
    if (t[i] === '"') return chaineBasique();
    if (t[i] === "'") return chaineLitterale();
    RE_CLE.lastIndex = i;
    const m = RE_CLE.exec(t);
    if (!m) erreur('clé attendue');
    i = RE_CLE.lastIndex;
    return m[0];
  };

  const chemin = () => {
    const parties = [cleSimple()];
    for (;;) {
      espaces();
      if (t[i] !== '.') return parties;
      i++;
      espaces();
      parties.push(cleSimple());
    }
  };

  const affecter = (table, ch, v) => {
    let o = table;
    for (const k of ch.slice(0, -1)) {
      if (k === '__proto__') erreur('clé interdite : __proto__');
      if (o[k] === undefined) o[k] = {};
      else if (typeof o[k] !== 'object' || Array.isArray(o[k])) erreur(`clé déjà définie : ${k}`);
      o = o[k];
    }
    const k = ch[ch.length - 1];
    if (k === '__proto__') erreur('clé interdite : __proto__');
    if (Object.hasOwn(o, k)) erreur(`clé définie deux fois : ${ch.join('.')}`);
    o[k] = v;
  };

  const tableau = () => {
    i++;
    const res = [];
    for (;;) {
      blancs();
      if (t[i] === ']') {
        i++;
        return res;
      }
      res.push(valeur());
      blancs();
      if (t[i] === ',') i++;
      else if (t[i] === ']') {
        i++;
        return res;
      } else erreur('« , » ou « ] » attendu dans un tableau');
    }
  };

  const tableEnLigne = () => {
    i++;
    const res = {};
    espaces();
    if (t[i] === '}') {
      i++;
      return res;
    }
    for (;;) {
      espaces();
      const ch = chemin();
      espaces();
      if (t[i] !== '=') erreur('« = » attendu dans une table en ligne');
      i++;
      espaces();
      affecter(res, ch, valeur());
      espaces();
      if (t[i] === ',') i++;
      else if (t[i] === '}') {
        i++;
        return res;
      } else erreur('« , » ou « } » attendu dans une table en ligne');
    }
  };

  const motCle = (mot) => t.startsWith(mot, i) && !/[A-Za-z0-9_-]/.test(t[i + mot.length] ?? '');

  function valeur() {
    if (t.startsWith('"""', i)) return chaineMultiligne('"""', true);
    if (t.startsWith("'''", i)) return chaineMultiligne("'''", false);
    const c = t[i];
    if (c === '"') return chaineBasique();
    if (c === "'") return chaineLitterale();
    if (c === '[') return tableau();
    if (c === '{') return tableEnLigne();
    if (motCle('true')) {
      i += 4;
      return true;
    }
    if (motCle('false')) {
      i += 5;
      return false;
    }
    if (/^0[xob]/.test(t.slice(i, i + 2))) erreur('entiers hexadécimaux, octaux ou binaires non pris en charge');
    RE_NOMBRE.lastIndex = i;
    const m = RE_NOMBRE.exec(t);
    if (m) {
      const apres = t[RE_NOMBRE.lastIndex];
      if (apres === '-' || apres === ':') erreur('dates et heures non prises en charge');
      if (/^[+-]?0[\d_]/.test(m[0])) erreur('nombre avec un zéro de tête');
      i = RE_NOMBRE.lastIndex;
      return Number(m[0].replace(/_/g, ''));
    }
    return erreur('valeur attendue');
  }

  const enTete = () => {
    const double = t[i + 1] === '[';
    i += double ? 2 : 1;
    espaces();
    const ch = chemin();
    espaces();
    if (double) {
      if (!t.startsWith(']]', i)) erreur('« ]] » attendu');
      i += 2;
    } else {
      if (t[i] !== ']') erreur('« ] » attendu');
      i++;
    }
    finDeLigne();
    let o = racine;
    for (const k of ch.slice(0, -1)) {
      if (k === '__proto__') erreur('clé interdite : __proto__');
      if (o[k] === undefined) o[k] = {};
      let v = o[k];
      if (Array.isArray(v)) v = v[v.length - 1];
      if (typeof v !== 'object' || v === null || Array.isArray(v)) erreur(`${k} n'est pas une table`);
      o = v;
    }
    const k = ch[ch.length - 1];
    if (k === '__proto__') erreur('clé interdite : __proto__');
    if (double) {
      if (o[k] === undefined) o[k] = [];
      if (!Array.isArray(o[k])) erreur(`${ch.join('.')} n'est pas un tableau de tables`);
      const nouvelle = {};
      o[k].push(nouvelle);
      explicites.add(nouvelle);
      courante = nouvelle;
    } else {
      if (o[k] === undefined) o[k] = {};
      const cible = o[k];
      if (typeof cible !== 'object' || cible === null || Array.isArray(cible)) erreur(`${ch.join('.')} est déjà défini autrement`);
      if (explicites.has(cible)) erreur(`table définie deux fois : [${ch.join('.')}]`);
      explicites.add(cible);
      courante = cible;
    }
  };

  for (;;) {
    blancs();
    if (i >= t.length) return racine;
    if (t[i] === '[') {
      enTete();
      continue;
    }
    const ch = chemin();
    espaces();
    if (t[i] !== '=') erreur('« = » attendu après la clé');
    i++;
    espaces();
    affecter(courante, ch, valeur());
    finDeLigne();
  }
}
```

## 7. Source `scripts/scenario.mjs`

<!-- fichier : scripts/scenario.mjs -->
```javascript
// scenario-playwright 1.1.1 : scénario TOML exécutable, contrôle de sa traduction, squelette et plan.
//
// Un scénario TOML (format scenario-playwright.scenario/1) n'est joué que s'il est valide (D3.INV-1).
// Traduit d'un texte de départ, il en cite le fichier et l'empreinte (D3.INV-2) ; sa structure et ses
// étapes se contrôlent alors contre le texte, sans IA (D3.INV-3, D3.INV-4). Le squelette d'une
// traduction se produit sans IA (D3.INV-5), et les variables se résolvent avant d'ouvrir le navigateur
// (D3.INV-6).
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { decrireCible, textesDe, transformerCible, validerCible } from './cibles.mjs';
import { analyserTexte, estOrigine, origineDe, RE_PROFIL, RE_VARIABLE } from './texte.mjs';
import { ErreurToml, lireToml } from './toml.mjs';

export const FORMAT_SCENARIO = 'scenario-playwright.scenario/1';
export const A_COMPLETER = 'à compléter';
export const DELAI_DEFAUT = 10;
export const DELAI_MAX = 30;
export const DELAI_MAIN_DEFAUT = 300;
export const DELAI_MAIN_MAX = 900;
export const MUTATIONS = ['creation', 'modification', 'suppression'];
export const ETATS = ['visible', 'masque', 'actif', 'inactif', 'texte', 'url'];
export const CRITERES = ['contient', 'visible', 'valeur', 'nombre', 'url', 'actif'];
const RE_NOM_FICHIER = /^[a-z0-9][a-z0-9_-]{0,59}$/;
const RE_TOUCHE = /^(?:(?:Control|Shift|Alt|Meta|ControlOrMeta)\+)*(?:[!-~]|F(?:[1-9]|1[0-2])|Enter|Tab|Escape|Backspace|Delete|Insert|Home|End|PageUp|PageDown|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Space)$/;

/** Jeu d'actions fermé (D5.INV-1) : champs requis et facultatifs de chaque action. */
export const ACTIONS = {
  naviguer: { requis: ['url'], facultatifs: [] },
  cliquer: { requis: ['cible'], facultatifs: ['mutation'] },
  saisir: { requis: ['cible', 'valeur'], facultatifs: ['mutation'] },
  choisir: { requis: ['cible', 'valeur'], facultatifs: ['mutation'] },
  cocher: { requis: ['cible', 'valeur'], facultatifs: ['mutation'] },
  survoler: { requis: ['cible'], facultatifs: [] },
  touche: { requis: ['touche'], facultatifs: ['cible', 'mutation'] },
  televerser: { requis: ['cible', 'fichier'], facultatifs: ['mutation'] },
  telecharger: { requis: ['cible'], facultatifs: ['nom', 'mutation'] },
  attendre: { requis: ['etat'], facultatifs: ['cible', 'url', 'texte'] },
  verifier: { requis: ['critere'], facultatifs: ['cible', 'attendu', 'exact'] },
  capturer: { requis: ['nom'], facultatifs: ['cible', 'pleine_page'] },
  main: { requis: ['message', 'jusqua'], facultatifs: [] },
};
const COMMUNS = ['action', 'ligne', 'delai'];
const RACINE = ['format', 'titre', 'etiquettes', 'url_base', 'origines', 'profil', 'delai', 'source', 'empreinte_source', 'parametres', 'jeux', 'etapes'];
const estTable = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const estTexte = (v) => typeof v === 'string' && v !== '';

export class ErreurScenario extends Error {
  constructor(nom, erreurs) {
    super(erreurs.map((e) => `${nom} : ${e}`).join('\n'));
    this.erreurs = erreurs;
  }
}

/** Chaîne TOML entre guillemets. */
export function chaineToml(s) {
  return `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t')}"`;
}

/** Variables ${nom} d'un texte ; $${ s'écrit pour un ${ littéral. */
export function variablesDe(texte) {
  return [...String(texte).matchAll(/\$\$\{|\$\{([^}]*)\}/g)].filter((m) => m[1] !== undefined).map((m) => m[1]);
}

/** Texte dont chaque ${nom} est remplacé par sa valeur. */
export function substituer(texte, valeurs) {
  return String(texte).replace(/\$\$\{|\$\{([^}]*)\}/g, (m, nom) => (nom === undefined ? '${' : String(valeurs[nom])));
}

/** Tous les textes d'une étape où une variable peut figurer. */
export function textesEtape(e) {
  const t = [];
  for (const k of ['url', 'valeur', 'texte', 'attendu', 'message', 'nom']) if (typeof e[k] === 'string') t.push(e[k]);
  if (Array.isArray(e.fichier)) t.push(...e.fichier.filter((f) => typeof f === 'string'));
  else if (typeof e.fichier === 'string') t.push(e.fichier);
  if (e.cible) t.push(...textesDe(e.cible));
  if (e.jusqua) {
    if (typeof e.jusqua.url === 'string') t.push(e.jusqua.url);
    if (e.jusqua.cible) t.push(...textesDe(e.jusqua.cible));
  }
  return t;
}

/** Lignes du fichier TOML où commence chaque bloc [[etapes]], dans l'ordre. */
export function lignesDesEtapes(sourceToml) {
  return sourceToml.replace(/\r\n/g, '\n').split('\n').flatMap((l, i) => (/^\s*\[\[\s*etapes\s*\]\]\s*(#.*)?$/.test(l) ? [i + 1] : []));
}

function chemin(rel) {
  return typeof rel === 'string' && rel !== '' && !isAbsolute(rel) && !/^[A-Za-z]:/.test(rel) && !rel.split(/[\\/]/).includes('..');
}

function validerEtape(e, ou, erreurs, contexte) {
  if (!estTable(e)) return erreurs.push(`${ou} : une table est attendue`);
  const spec = ACTIONS[e.action];
  if (e.action === A_COMPLETER) return erreurs.push(`${ou} : étape à compléter, action à choisir dans le jeu fermé (D3.INV-5)`);
  if (!spec) return erreurs.push(`${ou} : action ${e.action === undefined ? 'absente' : `inconnue « ${e.action} »`} ; actions : ${Object.keys(ACTIONS).join(', ')}`);
  const permis = new Set([...COMMUNS, ...spec.requis, ...spec.facultatifs]);
  for (const k of Object.keys(e)) if (!permis.has(k)) erreurs.push(`${ou} : champ inconnu pour ${e.action} : « ${k} »`);
  for (const k of spec.requis) if (e[k] === undefined) erreurs.push(`${ou} : ${k} manquant pour ${e.action}`);
  if (e.ligne !== undefined && !(Number.isInteger(e.ligne) && e.ligne >= 1)) erreurs.push(`${ou} : ligne est un entier à partir de 1`);
  const max = e.action === 'main' ? DELAI_MAIN_MAX : DELAI_MAX;
  if (e.delai !== undefined && !(Number.isInteger(e.delai) && e.delai >= 1 && e.delai <= max)) erreurs.push(`${ou} : delai est un nombre entier de secondes, de 1 à ${max}`);
  if (e.mutation !== undefined && !MUTATIONS.includes(e.mutation)) erreurs.push(`${ou} : mutation vaut ${MUTATIONS.join(', ')}`);
  if (e.cible !== undefined) erreurs.push(...validerCible(e.cible, `${ou}, cible`));
  const texte = (k) => { if (e[k] !== undefined && !estTexte(e[k])) erreurs.push(`${ou} : ${k} doit être un texte non vide`); };
  switch (e.action) {
    case 'naviguer':
      texte('url');
      if (estTexte(e.url) && variablesDe(e.url).length === 0) contexte.urls.push({ ou, url: e.url });
      break;
    case 'saisir': if (typeof e.valeur !== 'string') erreurs.push(`${ou} : valeur doit être un texte`); break;
    case 'choisir': texte('valeur'); break;
    case 'cocher': if (e.valeur !== undefined && typeof e.valeur !== 'boolean') erreurs.push(`${ou} : valeur vaut true ou false`); break;
    case 'touche': if (e.touche !== undefined && !(typeof e.touche === 'string' && RE_TOUCHE.test(e.touche))) erreurs.push(`${ou} : touche invalide « ${e.touche} » (Enter, Tab, Escape, ArrowDown, Control+A…)`); break;
    case 'televerser': {
      const fichiers = Array.isArray(e.fichier) ? e.fichier : [e.fichier];
      if (e.fichier !== undefined && (fichiers.length === 0 || fichiers.some((f) => !chemin(f)))) erreurs.push(`${ou} : fichier est un chemin relatif au dossier du scénario, sans « .. » (D5.INV-5)`);
      break;
    }
    case 'telecharger':
    case 'capturer':
      if (e.nom !== undefined && !(typeof e.nom === 'string' && RE_NOM_FICHIER.test(e.nom))) erreurs.push(`${ou} : nom invalide « ${e.nom} » (minuscules, chiffres, - et _)`);
      if (e.action === 'capturer' && e.pleine_page !== undefined && typeof e.pleine_page !== 'boolean') erreurs.push(`${ou} : pleine_page vaut true ou false`);
      break;
    case 'attendre':
      if (e.etat !== undefined && !ETATS.includes(e.etat)) erreurs.push(`${ou} : etat vaut ${ETATS.join(', ')}`);
      else if (e.etat === 'url') {
        texte('url');
        if (e.url === undefined) erreurs.push(`${ou} : url manquant pour l'état url`);
        if (e.cible !== undefined || e.texte !== undefined) erreurs.push(`${ou} : l'état url ne prend ni cible ni texte`);
      } else if (e.etat !== undefined) {
        if (e.cible === undefined) erreurs.push(`${ou} : cible manquante pour l'état ${e.etat}`);
        if (e.url !== undefined) erreurs.push(`${ou} : url ne s'emploie qu'avec l'état url`);
        if (e.etat === 'texte') { texte('texte'); if (e.texte === undefined) erreurs.push(`${ou} : texte manquant pour l'état texte`); }
        else if (e.texte !== undefined) erreurs.push(`${ou} : texte ne s'emploie qu'avec l'état texte`);
      }
      break;
    case 'verifier': {
      const c = e.critere;
      if (c !== undefined && !CRITERES.includes(c)) { erreurs.push(`${ou} : critere vaut ${CRITERES.join(', ')}`); break; }
      if (c === 'url') { if (e.cible !== undefined) erreurs.push(`${ou} : le critère url ne prend pas de cible`); }
      else if (c !== undefined && e.cible === undefined) erreurs.push(`${ou} : cible manquante pour le critère ${c}`);
      if (e.exact !== undefined && c !== 'contient') erreurs.push(`${ou} : exact ne s'emploie qu'avec le critère contient`);
      if (e.exact !== undefined && typeof e.exact !== 'boolean') erreurs.push(`${ou} : exact vaut true ou false`);
      if (c === 'contient' || c === 'valeur' || c === 'url') {
        if (typeof e.attendu !== 'string' || (c !== 'valeur' && e.attendu === '')) erreurs.push(`${ou} : attendu doit être un texte${c === 'valeur' ? '' : ' non vide'} pour le critère ${c}`);
      } else if (c === 'nombre') {
        if (!(Number.isInteger(e.attendu) && e.attendu >= 0)) erreurs.push(`${ou} : attendu est un entier positif ou nul pour le critère nombre`);
      } else if ((c === 'visible' || c === 'actif') && e.attendu !== undefined && typeof e.attendu !== 'boolean') {
        erreurs.push(`${ou} : attendu vaut true ou false pour le critère ${c}`);
      }
      break;
    }
    case 'main':
      texte('message');
      if (e.jusqua !== undefined) {
        const j = e.jusqua;
        if (!estTable(j) || (j.url === undefined) === (j.cible === undefined)) erreurs.push(`${ou} : jusqua est { url = "…" } ou { cible = { … }, etat = "visible" }`);
        else {
          for (const k of Object.keys(j)) if (!['url', 'cible', 'etat'].includes(k)) erreurs.push(`${ou} : clé inconnue dans jusqua : « ${k} »`);
          if (j.url !== undefined && !estTexte(j.url)) erreurs.push(`${ou} : jusqua.url doit être un texte non vide`);
          if (j.url !== undefined && j.etat !== undefined) erreurs.push(`${ou} : jusqua.etat ne s'emploie qu'avec une cible`);
          if (j.cible !== undefined) erreurs.push(...validerCible(j.cible, `${ou}, jusqua.cible`));
          if (j.etat !== undefined && !['visible', 'masque'].includes(j.etat)) erreurs.push(`${ou} : jusqua.etat vaut visible ou masque`);
        }
      }
      break;
    default:
  }
  return undefined;
}

/**
 * Valide un scénario lu du TOML (D3.INV-1). `lignes` donne la ligne du TOML de chaque étape. Rend
 * { scenario, erreurs } ; le scénario est complété de ses valeurs par défaut (origines, délai).
 */
export function validerScenario(objet, lignes = []) {
  const erreurs = [];
  if (!estTable(objet)) return { scenario: null, erreurs: ['le fichier ne décrit pas une table TOML'] };
  for (const k of Object.keys(objet)) if (!RACINE.includes(k)) erreurs.push(`clé inconnue : « ${k} »`);
  if (objet.format !== FORMAT_SCENARIO) erreurs.push(`format attendu : format = "${FORMAT_SCENARIO}"`);
  if (!estTexte(objet.titre)) erreurs.push('titre manquant');
  if (objet.etiquettes !== undefined && !(Array.isArray(objet.etiquettes) && objet.etiquettes.every((x) => estTexte(x) && !/\s/.test(x)))) erreurs.push('etiquettes est une liste de textes sans espace');
  const origineBase = typeof objet.url_base === 'string' ? origineDe(objet.url_base) : null;
  if (origineBase === null) erreurs.push('url_base manquante ou invalide (http ou https)');
  let origines = origineBase ? [origineBase] : [];
  if (objet.origines !== undefined) {
    if (!Array.isArray(objet.origines) || objet.origines.length === 0 || !objet.origines.every((o) => typeof o === 'string' && estOrigine(o))) {
      erreurs.push('origines est une liste d\'origines : schéma, hôte et port, sans chemin');
    } else {
      origines = objet.origines.map((o) => o.replace(/\/$/, ''));
      if (origineBase && !origines.includes(origineBase)) erreurs.push(`l'origine de url_base, ${origineBase}, n'est pas parmi les origines`);
    }
  }
  if (objet.profil !== undefined && !(typeof objet.profil === 'string' && RE_PROFIL.test(objet.profil))) erreurs.push('profil invalide (minuscules, chiffres, - et _)');
  if (objet.delai !== undefined && !(Number.isInteger(objet.delai) && objet.delai >= 1 && objet.delai <= DELAI_MAX)) erreurs.push(`delai est un nombre entier de secondes, de 1 à ${DELAI_MAX}`);
  if (objet.source !== undefined && !chemin(objet.source)) erreurs.push('source est le chemin relatif du texte de départ, sans « .. »');
  if ((objet.source === undefined) !== (objet.empreinte_source === undefined)) erreurs.push('source et empreinte_source vont ensemble (D3.INV-2)');
  if (objet.empreinte_source !== undefined && !(typeof objet.empreinte_source === 'string' && /^[0-9a-f]{64}$/.test(objet.empreinte_source))) erreurs.push('empreinte_source est un SHA-256 en hexadécimal');
  const valeurSimple = (v) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
  if (objet.parametres !== undefined) {
    if (!estTable(objet.parametres)) erreurs.push('parametres est une table');
    else for (const [k, v] of Object.entries(objet.parametres)) {
      if (!RE_VARIABLE.test(k)) erreurs.push(`paramètre au nom invalide : ${k} (minuscules, chiffres et _)`);
      if (!valeurSimple(v)) erreurs.push(`paramètre ${k} : un texte, un nombre ou un booléen`);
    }
  }
  if (objet.jeux !== undefined) {
    if (!Array.isArray(objet.jeux) || objet.jeux.length === 0 || !objet.jeux.every(estTable)) erreurs.push('jeux est un tableau de tables [[jeux]]');
    else {
      const cles = Object.keys(objet.jeux[0]).sort().join(',');
      objet.jeux.forEach((j, i) => {
        if (Object.keys(j).sort().join(',') !== cles) erreurs.push(`jeu ${i + 1} : mêmes variables attendues que le jeu 1`);
        for (const [k, v] of Object.entries(j)) {
          if (!RE_VARIABLE.test(k)) erreurs.push(`jeu ${i + 1} : variable au nom invalide : ${k}`);
          if (!valeurSimple(v)) erreurs.push(`jeu ${i + 1}, ${k} : un texte, un nombre ou un booléen`);
        }
      });
    }
  }
  const contexte = { urls: [] };
  if (!Array.isArray(objet.etapes) || objet.etapes.length === 0) erreurs.push('aucune étape [[etapes]]');
  else objet.etapes.forEach((e, i) => validerEtape(e, ouEtape(i, e, lignes), erreurs, contexte));
  for (const { ou, url } of contexte.urls) {
    if (!url.startsWith('/')) {
      const o = origineDe(url);
      if (o === null) erreurs.push(`${ou} : url est un chemin qui commence par / ou une adresse http(s)`);
      else if (!origines.includes(o)) erreurs.push(`${ou} : ${o} n'est pas parmi les origines`);
    }
  }
  const declarees = new Set([...Object.keys(estTable(objet.parametres) ? objet.parametres : {}), ...Object.keys(Array.isArray(objet.jeux) && estTable(objet.jeux[0]) ? objet.jeux[0] : {})]);
  if (Array.isArray(objet.etapes)) objet.etapes.forEach((e, i) => {
    if (!estTable(e)) return;
    for (const v of textesEtape(e).flatMap(variablesDe)) {
      if (!declarees.has(v)) erreurs.push(`${ouEtape(i, e, lignes)} : variable \${${v}} non déclarée dans [parametres] ni dans [[jeux]] (D3.INV-6)`);
    }
  });
  if (erreurs.length > 0) return { scenario: null, erreurs };
  return { scenario: { ...objet, origines, delai: objet.delai ?? null, etiquettes: objet.etiquettes ?? [], parametres: objet.parametres ?? {}, jeux: objet.jeux ?? null }, erreurs };
}

/** Désignation d'une étape dans un message : son numéro, sa ligne du TOML et sa ligne du texte. */
export function ouEtape(i, e, lignes = []) {
  const precisions = [];
  if (lignes[i]) precisions.push(`ligne ${lignes[i]} du TOML`);
  if (estTable(e) && Number.isInteger(e.ligne)) precisions.push(`ligne ${e.ligne} du texte`);
  return `étape ${i + 1}${precisions.length ? ` (${precisions.join(', ')})` : ''}`;
}

const memes = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const enTextes = (o) => Object.fromEntries(Object.entries(o ?? {}).map(([k, v]) => [k, String(v)]).sort(([a], [b]) => a.localeCompare(b)));

/**
 * Contrôle sans IA de la traduction d'un texte en scénario (D3.INV-3, D3.INV-4). `texte` est le texte
 * de départ analysé, `objet` le scénario validé. Rend la liste des écarts.
 */
export function controlerTraduction(objet, texte, lignes = []) {
  const ecarts = [];
  if (objet.titre !== texte.titre) ecarts.push(`titre « ${objet.titre} » différent de celui du texte, « ${texte.titre} »`);
  if (!memes(objet.etiquettes ?? [], texte.etiquettes)) ecarts.push(`étiquettes ${JSON.stringify(objet.etiquettes ?? [])} différentes de celles du texte, ${JSON.stringify(texte.etiquettes)}`);
  if (objet.url_base !== texte.adresse) ecarts.push(`url_base ${objet.url_base} différente de l'adresse du texte, ${texte.adresse}`);
  if (!memes(objet.origines, texte.origines)) ecarts.push(`origines ${JSON.stringify(objet.origines)} différentes de celles du texte, ${JSON.stringify(texte.origines)}`);
  if ((objet.profil ?? null) !== texte.profil) ecarts.push(`profil ${objet.profil ?? '(aucun)'} différent de celui du texte, ${texte.profil ?? '(aucun)'}`);
  if (!memes(enTextes(objet.parametres), enTextes(texte.parametres))) ecarts.push('paramètres différents de ceux du texte');
  if (!memes((objet.jeux ?? []).map(enTextes), (texte.jeux ?? []).map(enTextes))) ecarts.push('jeux différents des exemples du texte');
  const parLigne = new Map(texte.etapes.map((e) => [e.ligne, e]));
  const couvertes = new Map();
  let precedente = 0;
  objet.etapes.forEach((e, i) => {
    const ou = ouEtape(i, e, lignes);
    if (e.ligne === undefined) return ecarts.push(`${ou} : ligne du texte manquante`);
    if (!parLigne.has(e.ligne)) return ecarts.push(`${ou} : la ligne ${e.ligne} n'est pas une étape du texte`);
    if (e.ligne < precedente) ecarts.push(`${ou} : ligne ${e.ligne} après la ligne ${precedente}, l'ordre du texte n'est pas suivi`);
    precedente = Math.max(precedente, e.ligne);
    if (!couvertes.has(e.ligne)) couvertes.set(e.ligne, []);
    couvertes.get(e.ligne).push(e);
    if (e.action === 'main' && parLigne.get(e.ligne).marque !== 'main') ecarts.push(`${ou} : étape main sur une ligne que le texte ne marque pas « (à la main) »`);
    return undefined;
  });
  for (const t of texte.etapes) {
    const etapes = couvertes.get(t.ligne) ?? [];
    const ou = `ligne ${t.ligne} du texte (« ${t.motCle} ${t.phrase} »)`;
    if (etapes.length === 0) { ecarts.push(`${ou} : aucune étape ne la traduit`); continue; }
    if (MUTATIONS.includes(t.marque) && !etapes.some((e) => e.mutation === t.marque)) ecarts.push(`${ou} : marquée (${t.marque === 'creation' ? 'création' : t.marque}), aucune étape avec mutation = "${t.marque}"`);
    if (t.marque === 'main' && (etapes.length !== 1 || etapes[0].action !== 'main')) ecarts.push(`${ou} : marquée (à la main), une seule étape main attendue`);
    const vues = new Set(etapes.flatMap((e) => textesEtape(e).flatMap(variablesDe)));
    for (const v of t.variables) if (!vues.has(v)) ecarts.push(`${ou} : la variable <${v}> ne se retrouve en \${${v}} dans aucune de ses étapes`);
  }
  return ecarts;
}

/**
 * Lit et valide un scénario TOML, et contrôle sa traduction s'il cite un texte. Rend
 * { scenario, texte, erreurs, lignes, dossier } ; aucune erreur ne lève d'exception.
 */
export function lireScenario(cheminToml) {
  const dossier = dirname(resolve(cheminToml));
  let source;
  try {
    source = readFileSync(cheminToml, 'utf8');
  } catch (e) {
    return { scenario: null, erreurs: [`lecture impossible : ${e.code === 'ENOENT' ? 'fichier introuvable' : e.message}`], dossier };
  }
  let objet;
  try {
    objet = lireToml(source, 'TOML');
  } catch (e) {
    if (e instanceof ErreurToml) return { scenario: null, erreurs: [e.message], dossier };
    throw e;
  }
  const lignes = lignesDesEtapes(source);
  const { scenario, erreurs } = validerScenario(objet, lignes);
  if (!scenario) return { scenario: null, erreurs, lignes, dossier };
  let texte = null;
  if (scenario.source) {
    const cheminTexte = join(dossier, ...scenario.source.split(/[\\/]/));
    if (!existsSync(cheminTexte)) return { scenario: null, erreurs: [`texte de départ introuvable : ${scenario.source} (D3.INV-2)`], lignes, dossier };
    const analyse = analyserTexte(readFileSync(cheminTexte, 'utf8'));
    if (analyse.erreurs.length > 0) return { scenario: null, erreurs: analyse.erreurs.map((e) => `${scenario.source}, ligne ${e.ligne} : ${e.message}`), lignes, dossier };
    texte = analyse.scenario;
    if (texte.empreinte !== scenario.empreinte_source) {
      return { scenario: null, texte, erreurs: [`${scenario.source} a changé depuis la traduction (empreinte ${texte.empreinte.slice(0, 12)}…, ${scenario.empreinte_source.slice(0, 12)}… notée) : retraduire, puis faire ratifier (D3.INV-2)`], lignes, dossier };
    }
    const ecarts = controlerTraduction(scenario, texte, lignes);
    if (ecarts.length > 0) return { scenario: null, texte, erreurs: ecarts, lignes, dossier };
  }
  return { scenario, texte, erreurs: [], lignes, dossier };
}

/**
 * Jeux à jouer : valeurs de chaque jeu (--param, puis jeu, puis [parametres] ; D3.INV-6) et étapes
 * substituées, contrôlées avant d'ouvrir le navigateur. `params` : { nom: valeur } de la ligne de
 * commande ; `numeroJeu` : un seul jeu, à partir de 1. Rend { jeux, erreurs }.
 */
export function preparerJeux(scenario, dossier, params = {}, numeroJeu = null) {
  const erreurs = [];
  const declarees = new Set([...Object.keys(scenario.parametres), ...Object.keys(scenario.jeux?.[0] ?? {})]);
  for (const k of Object.keys(params)) if (!declarees.has(k)) erreurs.push(`--param ${k} : ni paramètre ni colonne des jeux du scénario (D3.INV-6)`);
  const jeux = scenario.jeux ?? [{}];
  if (numeroJeu !== null && !(numeroJeu >= 1 && numeroJeu <= jeux.length)) erreurs.push(`--jeu ${numeroJeu} : le scénario a ${jeux.length} jeu${jeux.length > 1 ? 'x' : ''}`);
  if (erreurs.length > 0) return { jeux: [], erreurs };
  const prepares = [];
  jeux.forEach((jeu, i) => {
    if (numeroJeu !== null && i + 1 !== numeroJeu) return;
    const valeurs = { ...scenario.parametres, ...jeu, ...params };
    const etapes = scenario.etapes.map((e, k) => {
      const s = { ...e };
      for (const c of ['url', 'valeur', 'texte', 'attendu', 'message', 'nom']) if (typeof s[c] === 'string') s[c] = substituer(s[c], valeurs);
      if (s.fichier !== undefined) s.fichier = (Array.isArray(s.fichier) ? s.fichier : [s.fichier]).map((f) => substituer(f, valeurs));
      if (s.cible) s.cible = transformerCible(s.cible, (t) => substituer(t, valeurs));
      if (s.jusqua) s.jusqua = { ...s.jusqua, ...(s.jusqua.url ? { url: substituer(s.jusqua.url, valeurs) } : {}), ...(s.jusqua.cible ? { cible: transformerCible(s.jusqua.cible, (t) => substituer(t, valeurs)) } : {}) };
      const ou = `jeu ${i + 1}, ${ouEtape(k, e)}`;
      if (s.action === 'naviguer' && !s.url.startsWith('/')) {
        const o = origineDe(s.url);
        if (o === null || !scenario.origines.includes(o)) erreurs.push(`${ou} : ${s.url} hors des origines du scénario`);
      }
      if (s.action === 'televerser') {
        s.fichiers = s.fichier.map((f) => {
          const absolu = resolve(dossier, ...f.split(/[\\/]/));
          const rel = relative(dossier, absolu);
          if (!chemin(f) || rel.startsWith('..') || isAbsolute(rel)) erreurs.push(`${ou} : ${f} hors du dossier du scénario (D5.INV-5)`);
          else if (!existsSync(absolu) || !statSync(absolu).isFile()) erreurs.push(`${ou} : fichier introuvable : ${f}`);
          return absolu;
        });
      }
      return s;
    });
    prepares.push({ numero: i + 1, valeurs, etapes });
  });
  return { jeux: prepares, erreurs };
}

/** Squelette d'une traduction, produit sans IA à partir du texte analysé (D3.INV-5). */
export function squeletteToml(texte, sourceRel) {
  const l = [];
  l.push(`# Traduction de ${sourceRel}, squelette produit par traduire.mjs (scenario-playwright 1.1.1).`);
  l.push('# La structure vient du texte, sans IA. Chaque étape du texte a son bloc [[etapes]] : choisir son action');
  l.push('# et ses champs (module actions). Une ligne du texte peut donner plusieurs étapes : recopier le bloc,');
  l.push('# avec la même ligne. Le scénario ne se joue qu\'une fois chaque étape complétée et la traduction ratifiée.');
  l.push(`format = ${chaineToml(FORMAT_SCENARIO)}`);
  l.push(`titre = ${chaineToml(texte.titre)}`);
  if (texte.etiquettes.length) l.push(`etiquettes = [${texte.etiquettes.map(chaineToml).join(', ')}]`);
  l.push(`url_base = ${chaineToml(texte.adresse)}`);
  if (texte.originesDeclarees) l.push(`origines = [${texte.origines.map(chaineToml).join(', ')}]`);
  if (texte.profil) l.push(`profil = ${chaineToml(texte.profil)}`);
  l.push(`source = ${chaineToml(sourceRel)}`);
  l.push(`empreinte_source = ${chaineToml(texte.empreinte)}`);
  if (Object.keys(texte.parametres).length) {
    l.push('', '[parametres]');
    for (const [k, v] of Object.entries(texte.parametres)) l.push(`${k} = ${chaineToml(v)}`);
  }
  for (const jeu of texte.jeux ?? []) {
    l.push('', '[[jeux]]');
    for (const [k, v] of Object.entries(jeu)) l.push(`${k} = ${chaineToml(v)}`);
  }
  for (const e of texte.etapes) {
    l.push('', `# ligne ${e.ligne} : ${e.motCle} ${e.phrase}${e.marque ? ` (${({ creation: 'création', main: 'à la main' })[e.marque] ?? e.marque})` : ''}`);
    l.push('[[etapes]]', `ligne = ${e.ligne}`);
    if (e.marque === 'main') {
      l.push('action = "main"', `message = ${chaineToml(e.phrase)}`, '# jusqua = { url = "/…" }  ou  { cible = { … }, etat = "visible" } : à compléter');
    } else {
      l.push(`action = ${chaineToml(A_COMPLETER)}`);
      if (MUTATIONS.includes(e.marque)) l.push(`mutation = ${chaineToml(e.marque)}`);
    }
    if (e.variables.length) l.push(`# variables à reprendre : ${e.variables.map((v) => `\${${v}}`).join(', ')}`);
  }
  return `${l.join('\n')}\n`;
}

const oui = (b) => (b === false ? 'non' : 'oui');

/** Résumé lisible d'une étape, pour le plan et le rapport. */
export function resumeEtape(e) {
  const c = e.cible ? decrireCible(e.cible) : '';
  const m = e.mutation ? `  [${e.mutation === 'creation' ? 'création' : e.mutation}]` : '';
  switch (e.action) {
    case 'naviguer': return `naviguer ${e.url}`;
    case 'cliquer': return `cliquer ${c}${m}`;
    case 'saisir': return `saisir « ${e.valeur} » dans ${c}${m}`;
    case 'choisir': return `choisir « ${e.valeur} » dans ${c}${m}`;
    case 'cocher': return `${e.valeur === false ? 'décocher' : 'cocher'} ${c}${m}`;
    case 'survoler': return `survoler ${c}`;
    case 'touche': return `touche ${e.touche}${c ? ` sur ${c}` : ''}${m}`;
    case 'televerser': return `téléverser ${(Array.isArray(e.fichier) ? e.fichier : [e.fichier]).join(', ')} dans ${c}${m}`;
    case 'telecharger': return `télécharger par ${c}${m}`;
    case 'attendre': return e.etat === 'url' ? `attendre l'adresse ${e.url}` : `attendre ${c} ${e.etat === 'texte' ? `avec le texte « ${e.texte} »` : e.etat}`;
    case 'verifier':
      if (e.critere === 'url') return `vérifier l'adresse ${e.attendu}`;
      if (e.critere === 'visible' || e.critere === 'actif') return `vérifier ${c} ${e.critere} : ${oui(e.attendu)}`;
      if (e.critere === 'nombre') return `vérifier ${e.attendu} élément${e.attendu > 1 ? 's' : ''} ${c}`;
      return `vérifier ${c} ${e.critere === 'valeur' ? 'a la valeur' : (e.exact ? 'a le texte' : 'contient')} « ${e.attendu} »`;
    case 'capturer': return `capturer ${e.nom}${c ? ` (${c})` : ''}`;
    case 'main': return `à la main : « ${e.message} », jusqu'à ${e.jusqua?.url ? `l'adresse ${e.jusqua.url}` : `${e.jusqua?.cible ? decrireCible(e.jusqua.cible) : '?'} ${e.jusqua?.etat ?? 'visible'}`}`;
    default: return e.action;
  }
}

/** Plan de la traduction, ligne du texte par ligne du texte, pour la ratification (D10.INV-1). */
export function planTraduction(scenario, texte) {
  const l = [`Scénario : ${scenario.titre}${scenario.etiquettes.length ? `  (${scenario.etiquettes.map((x) => `@${x}`).join(' ')})` : ''}`];
  l.push(`Adresse : ${scenario.url_base} ; origines : ${scenario.origines.join(', ')}${scenario.profil ? ` ; profil : ${scenario.profil}` : ''}`);
  if (scenario.jeux) l.push(`Jeux : ${scenario.jeux.length} (${Object.keys(scenario.jeux[0]).join(', ')})`);
  if (texte) {
    for (const t of texte.etapes) {
      l.push(`l.${t.ligne}  ${t.motCle} ${t.phrase}${t.marque ? ` (${({ creation: 'création', main: 'à la main' })[t.marque] ?? t.marque})` : ''}`);
      for (const e of scenario.etapes.filter((x) => x.ligne === t.ligne)) l.push(`        → ${resumeEtape(e)}`);
    }
  } else {
    scenario.etapes.forEach((e, i) => l.push(`${String(i + 1).padStart(2)}. ${resumeEtape(e)}`));
  }
  const mutations = scenario.etapes.filter((e) => e.mutation).length;
  l.push(`${scenario.etapes.length} étapes, dont ${mutations} qui modifie${mutations > 1 ? 'nt' : ''} des données${scenario.etapes.some((e) => e.action === 'main') ? ', et des étapes à la main' : ''}.`);
  return l.join('\n');
}
```
<<<FIN modules/scenario/SKILL.md>>>

<<<FICHIER modules/cibles/SKILL.md>>>
---
name: cibles
description: Cibles côté utilisateur (une seule stratégie par cible, rôle et nom accessible, libellé, texte, placeholder, identifiant de test, texte alternatif, titre ; css et rang en dernier recours, signalés fragiles ; exact ; dans, sur trois niveaux ; localisateurs stricts de Playwright, cible ambiguë qui échoue sans agir et cite les éléments trouvés ; notation des localisateurs dans le plan et le rapport ; écriture en table TOML et lecture d'un localisateur pour la désignation), source de scripts/cibles.mjs. À lire pour écrire ou corriger une cible.
dimensions: [D4]
status: active
---

# Module `cibles` (D4)

Phase 7E couverte : Engendrent.

## 1. Stratégies (D4.INV-1)

Une cible désigne un élément comme le voit une personne. Elle s'écrit en table TOML en ligne, avec une seule stratégie :

| Stratégie | Exemple | Playwright | Quand |
|---|---|---|---|
| `role`, avec `nom` | `{ role = "button", nom = "Enregistrer" }` | `getByRole('button', { name: 'Enregistrer' })` | d'abord : boutons, liens, cases, onglets, titres, lignes, cellules, alertes |
| `libelle` | `{ libelle = "Nom" }` | `getByLabel('Nom')` | champs de formulaire |
| `texte` | `{ texte = "Données chargées" }` | `getByText('Données chargées')` | texte sans rôle propre |
| `placeholder` | `{ placeholder = "Rechercher" }` | `getByPlaceholder('Rechercher')` | champ sans libellé |
| `testid` | `{ testid = "valider" }` | `getByTestId('valider')` | élément sans nom visible, avec l'attribut `data-testid` |
| `alt` | `{ alt = "Logo" }` | `getByAltText('Logo')` | image |
| `titre` | `{ titre = "Aide" }` | `getByTitle('Aide')` | élément nommé par son attribut `title` |
| `css` | `{ css = "#etat" }` | `locator('#etat')` | dernier recours : suit la structure de la page, non ce qu'on voit ; signalé fragile |

`role` prend un rôle ARIA de la liste de Playwright (`button`, `link`, `textbox`, `checkbox`, `combobox`, `heading`, `row`, `cell`, `alert`, `dialog`, `tab`, …) ; un rôle inconnu est refusé. Un nom de rôle se compare par défaut comme Playwright : sans casse, et contenu dans le nom accessible. Désigner par le rôle et le nom vérifie au passage que l'élément est nommé pour les lecteurs d'écran.

## 2. Précisions

| Clé | Effet | Exemple |
|---|---|---|
| `exact = true` | le nom, le libellé ou le texte se comparent en entier, casse comprise | `{ role = "cell", nom = "Lyon", exact = true }` |
| `dans` | la cible se cherche à l'intérieur d'une autre ; trois niveaux au plus (D4.INV-3) | `{ role = "button", nom = "Supprimer", dans = { role = "row", nom = "Martin" } }` |
| `rang` | le n-ième élément trouvé, à partir de 1 ; dernier recours, signalé fragile | `{ role = "listitem", rang = 2 }` |

`exact` ne s'emploie pas avec `testid`, `css`, ni un rôle sans nom ; `nom` ne s'emploie qu'avec `role`. Les textes d'une cible acceptent les variables `${nom}` (module `scenario`, § 3).

## 3. Une cible, un élément (D4.INV-2)

Les localisateurs de Playwright sont stricts : une cible qui désigne plusieurs éléments fait échouer l'étape, sans agir. Le message cite les éléments trouvés, chacun avec son propre localisateur :

```text
cible ambiguë, 3 éléments trouvés, aucune action faite : 1) <button type="button" data-nom="Dupont">Supprimer</button> aka getByRole('row', { name: 'Dupont Paris Supprimer' }).getByRole('button') ; 2) …
```

La correction précise la cible, par `exact` ou `dans`, plutôt que par `rang`. Une cible absente fait échouer l'étape à son délai, sans agir (D5.INV-2).

## 4. Notation

Le plan de ratification, la sortie de `jouer.mjs` et le rapport écrivent une cible dans la notation des localisateurs de Playwright, celle de ses messages d'erreur : `getByRole('button', { name: 'Enregistrer' })`, `getByRole('row', { name: 'Martin' }).getByRole('button', { name: 'Supprimer' })`, `getByRole('listitem').nth(1)`. La même notation se relit en cible : c'est ce que fait la désignation (module `designer`), qui écrit ensuite la cible en table TOML.

## 5. Contrôle de sortie

- Chaque stratégie, `exact`, `dans` et `rang` se décrivent dans la notation de Playwright, et la notation se relit en la même cible (D4.INV-1, D4.INV-3).
- Une cible à deux stratégies, un rôle inconnu, un nom sans rôle, `exact` mal employé, un rang nul ou quatre niveaux de `dans` sont refusés.
- `css` et `rang`, jusque dans `dans`, sont signalés fragiles.
- Une cible ambiguë fait échouer l'étape sans agir, avec les éléments trouvés (D4.INV-2, module `recette`, R6).

## 6. Source `scripts/cibles.mjs`

<!-- fichier : scripts/cibles.mjs -->
```javascript
// scenario-playwright 1.1.1 : cibles côté utilisateur.
//
// Une cible désigne un élément comme le voit une personne : par son rôle et son nom accessible, son
// libellé, son texte, son placeholder, son identifiant de test, son texte alternatif ou son titre. Le
// sélecteur CSS et le rang ne servent qu'en dernier recours, et le rapport les signale fragiles. Les
// localisateurs de Playwright sont stricts : une cible qui désigne plusieurs éléments fait échouer
// l'étape au lieu d'agir au hasard.

export const ROLES = [
  'alert', 'alertdialog', 'application', 'article', 'banner', 'blockquote', 'button', 'caption', 'cell', 'checkbox',
  'code', 'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition', 'deletion', 'dialog', 'directory',
  'document', 'emphasis', 'feed', 'figure', 'form', 'generic', 'grid', 'gridcell', 'group', 'heading', 'img',
  'insertion', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee', 'math', 'meter', 'menu', 'menubar',
  'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation', 'none', 'note', 'option', 'paragraph',
  'presentation', 'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup', 'rowheader', 'scrollbar',
  'search', 'searchbox', 'separator', 'slider', 'spinbutton', 'status', 'strong', 'subscript', 'superscript',
  'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox', 'time', 'timer', 'toolbar', 'tooltip', 'tree',
  'treegrid', 'treeitem',
];
export const STRATEGIES = ['role', 'libelle', 'texte', 'placeholder', 'testid', 'alt', 'titre', 'css'];
export const PROFONDEUR_MAX = 3;
const CLES = new Set([...STRATEGIES, 'nom', 'exact', 'dans', 'rang']);
const AVEC_EXACT = new Set(['role', 'libelle', 'texte', 'placeholder', 'alt', 'titre']);
const estTable = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Stratégie d'une cible valide : la seule de ses clés qui en est une. */
export const strategie = (cible) => STRATEGIES.find((s) => Object.hasOwn(cible, s));

/** Erreurs d'une cible, chacune préfixée par `ou` ; une liste vide si elle est valide (D4.INV-1, D4.INV-3). */
export function validerCible(cible, ou = 'cible', profondeur = 1) {
  if (!estTable(cible)) return [`${ou} : une table est attendue, comme { role = "button", nom = "Enregistrer" }`];
  const erreurs = [];
  for (const k of Object.keys(cible)) if (!CLES.has(k)) erreurs.push(`${ou} : clé inconnue « ${k} »`);
  const presentes = STRATEGIES.filter((s) => Object.hasOwn(cible, s));
  if (presentes.length !== 1) {
    erreurs.push(`${ou} : une seule stratégie parmi ${STRATEGIES.join(', ')}${presentes.length ? ` (trouvées : ${presentes.join(', ')})` : ''}`);
    return erreurs;
  }
  const s = presentes[0];
  if (typeof cible[s] !== 'string' || cible[s].trim() === '') erreurs.push(`${ou} : ${s} doit être un texte non vide`);
  if (s === 'role' && typeof cible.role === 'string' && !ROLES.includes(cible.role)) erreurs.push(`${ou} : rôle inconnu « ${cible.role} »`);
  if (Object.hasOwn(cible, 'nom')) {
    if (s !== 'role') erreurs.push(`${ou} : nom ne s'emploie qu'avec role`);
    else if (typeof cible.nom !== 'string' || cible.nom === '') erreurs.push(`${ou} : nom doit être un texte non vide`);
  }
  if (Object.hasOwn(cible, 'exact')) {
    if (typeof cible.exact !== 'boolean') erreurs.push(`${ou} : exact vaut true ou false`);
    else if (!AVEC_EXACT.has(s) || (s === 'role' && !Object.hasOwn(cible, 'nom'))) erreurs.push(`${ou} : exact ne s'emploie pas avec ${s === 'role' ? 'un rôle sans nom' : s}`);
  }
  if (Object.hasOwn(cible, 'rang') && !(Number.isInteger(cible.rang) && cible.rang >= 1)) erreurs.push(`${ou} : rang est un entier à partir de 1`);
  if (Object.hasOwn(cible, 'dans')) {
    if (profondeur >= PROFONDEUR_MAX) erreurs.push(`${ou} : plus de ${PROFONDEUR_MAX} niveaux de « dans »`);
    else erreurs.push(...validerCible(cible.dans, `${ou}, dans`, profondeur + 1));
  }
  return erreurs;
}

/** Vrai si la cible, ou une cible qui la contient, emploie css ou rang (D4.INV-1). */
export function estFragile(cible) {
  return Boolean(cible) && (Object.hasOwn(cible, 'css') || Object.hasOwn(cible, 'rang') || estFragile(cible.dans));
}

/** Textes de la cible où une variable ${nom} peut figurer. */
export function textesDe(cible) {
  if (!cible) return [];
  return [...STRATEGIES, 'nom'].filter((k) => typeof cible[k] === 'string').map((k) => cible[k]).concat(textesDe(cible.dans));
}

/** Copie de la cible dont chaque texte passe par `f` (substitution des variables). */
export function transformerCible(cible, f) {
  const copie = { ...cible };
  for (const k of [...STRATEGIES, 'nom']) if (typeof copie[k] === 'string') copie[k] = f(copie[k]);
  if (copie.dans) copie.dans = transformerCible(copie.dans, f);
  return copie;
}

/** Localisateur Playwright d'une cible, depuis une page ou un localisateur parent. */
export function localisateur(racine, cible) {
  const base = cible.dans ? localisateur(racine, cible.dans) : racine;
  const options = Object.hasOwn(cible, 'exact') ? { exact: cible.exact } : {};
  let l;
  switch (strategie(cible)) {
    case 'role': l = base.getByRole(cible.role, cible.nom === undefined ? {} : { name: cible.nom, ...options }); break;
    case 'libelle': l = base.getByLabel(cible.libelle, options); break;
    case 'texte': l = base.getByText(cible.texte, options); break;
    case 'placeholder': l = base.getByPlaceholder(cible.placeholder, options); break;
    case 'testid': l = base.getByTestId(cible.testid); break;
    case 'alt': l = base.getByAltText(cible.alt, options); break;
    case 'titre': l = base.getByTitle(cible.titre, options); break;
    default: l = base.locator(cible.css);
  }
  return cible.rang ? l.nth(cible.rang - 1) : l;
}

const js = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

/** Description d'une cible dans la notation des localisateurs de Playwright, celle de ses messages d'erreur. */
export function decrireCible(cible) {
  const avant = cible.dans ? `${decrireCible(cible.dans)}.` : '';
  const exact = Object.hasOwn(cible, 'exact') ? `, exact: ${cible.exact}` : '';
  const avecExact = (f, v) => `${f}(${js(v)}${exact ? `, { ${exact.slice(2)} }` : ''})`;
  let d;
  switch (strategie(cible)) {
    case 'role': d = cible.nom === undefined ? `getByRole(${js(cible.role)})` : `getByRole(${js(cible.role)}, { name: ${js(cible.nom)}${exact} })`; break;
    case 'libelle': d = avecExact('getByLabel', cible.libelle); break;
    case 'texte': d = avecExact('getByText', cible.texte); break;
    case 'placeholder': d = avecExact('getByPlaceholder', cible.placeholder); break;
    case 'testid': d = `getByTestId(${js(cible.testid)})`; break;
    case 'alt': d = avecExact('getByAltText', cible.alt); break;
    case 'titre': d = avecExact('getByTitle', cible.titre); break;
    default: d = `locator(${js(cible.css)})`;
  }
  return `${avant}${d}${cible.rang ? `.nth(${cible.rang - 1})` : ''}`;
}

const toml = (s) => `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t')}"`;

/** Cible écrite en table TOML en ligne, pour un scénario : { role = "button", nom = "Enregistrer" }. */
export function cibleToml(cible) {
  const s = strategie(cible);
  const parties = [`${s} = ${toml(cible[s])}`];
  if (cible.nom !== undefined) parties.push(`nom = ${toml(cible.nom)}`);
  if (Object.hasOwn(cible, 'exact')) parties.push(`exact = ${cible.exact}`);
  if (cible.rang) parties.push(`rang = ${cible.rang}`);
  if (cible.dans) parties.push(`dans = ${cibleToml(cible.dans)}`);
  return `{ ${parties.join(', ')} }`;
}

// --- Lecture d'un localisateur de Playwright écrit en texte, comme le rend pickLocator() (D9.INV-1) ---

function lexer(texte) {
  const jetons = [];
  let i = 0;
  while (i < texte.length) {
    const c = texte[i];
    if (/\s/.test(c)) { i++; continue; }
    if ('(){},.:'.includes(c)) { jetons.push({ t: c }); i++; continue; }
    if (c === "'" || c === '"') {
      let v = '';
      i++;
      while (i < texte.length && texte[i] !== c) {
        if (texte[i] === '\\') { v += texte[i + 1]; i += 2; } else { v += texte[i]; i++; }
      }
      if (texte[i] !== c) return null;
      i++;
      jetons.push({ t: 'chaine', v });
      continue;
    }
    if (c === '/') {
      const m = /^\/((?:\\.|[^/\\])+)\/([a-z]*)/.exec(texte.slice(i));
      if (!m) return null;
      jetons.push({ t: 'regex', v: m[1], drapeaux: m[2] });
      i += m[0].length;
      continue;
    }
    const m = /^[A-Za-z_][A-Za-z0-9_]*|^-?\d+/.exec(texte.slice(i));
    if (!m) return null;
    jetons.push(/^-?\d/.test(m[0]) ? { t: 'nombre', v: Number(m[0]) } : { t: 'mot', v: m[0] });
    i += m[0].length;
  }
  return jetons;
}

/** Appels chaînés d'un localisateur écrit : [{ nom, args }], ou null s'il ne se lit pas. */
function appels(texte) {
  const j = lexer(texte);
  if (!j) return null;
  let i = 0;
  const valeur = () => {
    const x = j[i++];
    if (!x) return undefined;
    if (x.t === 'chaine' || x.t === 'nombre') return x.v;
    if (x.t === 'regex') return { regex: x.v, drapeaux: x.drapeaux };
    if (x.t === 'mot' && (x.v === 'true' || x.v === 'false')) return x.v === 'true';
    if (x.t === '{') {
      const o = {};
      while (j[i] && j[i].t !== '}') {
        const cle = j[i++];
        if (!cle || cle.t !== 'mot' || j[i++]?.t !== ':') return undefined;
        o[cle.v] = valeur();
        if (j[i]?.t === ',') i++;
      }
      return j[i++]?.t === '}' ? o : undefined;
    }
    return undefined;
  };
  const liste = [];
  while (i < j.length) {
    const nom = j[i++];
    if (nom?.t !== 'mot' || j[i++]?.t !== '(') return null;
    const args = [];
    while (j[i] && j[i].t !== ')') {
      const v = valeur();
      if (v === undefined) return null;
      args.push(v);
      if (j[i]?.t === ',') i++;
    }
    if (j[i++]?.t !== ')') return null;
    liste.push({ nom: nom.v, args });
    if (i < j.length && j[i++]?.t !== '.') return null;
  }
  return liste;
}

const SIMPLES = { getByLabel: 'libelle', getByText: 'texte', getByPlaceholder: 'placeholder', getByAltText: 'alt', getByTitle: 'titre' };

/** Texte d'un nom ou d'un libellé : chaîne, ou expression régulière sans métacaractère. */
function texteSimple(v) {
  if (typeof v === 'string') return v;
  if (v && typeof v.regex === 'string' && !/[\\^$.*+?()[\]{}|]/.test(v.regex)) return v.regex;
  return undefined;
}

/**
 * Cible du skill tirée d'un localisateur de Playwright écrit en texte (`String(locator)`), ou null s'il
 * emploie une forme que le scénario n'exprime pas (filtre, dernier élément, expression régulière).
 */
export function cibleDepuisLocator(texte) {
  const liste = appels(String(texte).trim());
  if (!liste || liste.length === 0) return null;
  let cible = null;
  for (const { nom, args } of liste) {
    let nouvelle;
    if (nom === 'nth' || nom === 'first') {
      if (!cible || cible.rang) return null;
      const n = nom === 'first' ? 0 : args[0];
      if (!Number.isInteger(n) || n < 0) return null;
      cible.rang = n + 1;
      continue;
    }
    const options = args[1] && typeof args[1] === 'object' && !args[1].regex ? args[1] : {};
    if (nom === 'getByRole') {
      if (typeof args[0] !== 'string' || !ROLES.includes(args[0])) return null;
      nouvelle = { role: args[0] };
      if (options.name !== undefined) {
        const n = texteSimple(options.name);
        if (n === undefined) return null;
        nouvelle.nom = n;
        if (typeof options.exact === 'boolean' && typeof options.name === 'string') nouvelle.exact = options.exact;
      }
    } else if (SIMPLES[nom]) {
      const v = texteSimple(args[0]);
      if (v === undefined) return null;
      nouvelle = { [SIMPLES[nom]]: v };
      if (typeof options.exact === 'boolean' && typeof args[0] === 'string') nouvelle.exact = options.exact;
    } else if (nom === 'getByTestId' && typeof args[0] === 'string') {
      nouvelle = { testid: args[0] };
    } else if (nom === 'locator' && typeof args[0] === 'string' && args.length === 1) {
      nouvelle = { css: args[0] };
    } else {
      return null;
    }
    if (cible) nouvelle.dans = cible;
    cible = nouvelle;
  }
  let profondeur = 0;
  for (let c = cible; c; c = c.dans) profondeur++;
  return profondeur <= PROFONDEUR_MAX && validerCible(cible).length === 0 ? cible : null;
}
```
<<<FIN modules/cibles/SKILL.md>>>

<<<FICHIER modules/actions/SKILL.md>>>
---
name: actions
description: Actions et étapes du moteur (jeu fermé de treize actions et leurs champs, naviguer, cliquer, saisir, choisir, cocher, survoler, touche, televerser, telecharger, attendre, verifier, capturer, main ; aucune exécution de code dans la page ; attentes par état dans un délai borné ; critères de vérification contient, visible, valeur, nombre, url, actif, attendu et obtenu ; adresses comparées par chemin, requête et étoile finale ; déroulé d'un jeu, aucune étape rejouée, vérifications qui se poursuivent ; mutations ; fichiers téléversés et téléchargés ; point d'extension E3, jouerScenario), source de scripts/moteur.mjs. À lire pour traduire une phrase en étape, ou comprendre un résultat.
dimensions: [D5]
status: active
---

# Module `actions` (D5)

Phases 7E couvertes : Éléments et État.

## 1. Jeu fermé (D5.INV-1)

| Action | Champs requis | Facultatifs | Geste |
|---|---|---|---|
| `naviguer` | `url` : chemin commençant par `/`, ou adresse d'une origine déclarée | | va à l'adresse, attend le chargement ; une réponse de statut 400 ou plus fait échouer l'étape |
| `cliquer` | `cible` | `mutation` | clique la cible |
| `saisir` | `cible`, `valeur` (texte) | `mutation` | vide le champ, puis y écrit la valeur |
| `choisir` | `cible`, `valeur` | `mutation` | choisit dans une liste l'option de ce libellé visible |
| `cocher` | `cible`, `valeur` (`true` ou `false`) | `mutation` | coche ou décoche |
| `survoler` | `cible` | | place le pointeur sur la cible |
| `touche` | `touche` : `Enter`, `Tab`, `Escape`, `ArrowDown`, `Control+A`, un caractère… | `cible`, `mutation` | presse la touche, sur la cible si elle est donnée |
| `televerser` | `cible`, `fichier` : chemin ou liste de chemins relatifs au dossier du scénario | `mutation` | joint les fichiers au champ (D5.INV-5) |
| `telecharger` | `cible` | `nom`, `mutation` | clique la cible et enregistre le fichier téléchargé dans les résultats (D5.INV-5) |
| `attendre` | `etat` : `visible`, `masque`, `actif`, `inactif`, `texte`, `url` | `cible`, `texte`, `url` | attend que la cible ait l'état, contienne le texte, ou que la page ait l'adresse |
| `verifier` | `critere` : `contient`, `visible`, `valeur`, `nombre`, `url`, `actif` | `cible`, `attendu`, `exact` | constate un attendu (§ 3) |
| `capturer` | `nom` : minuscules, chiffres, `-`, `_` | `cible`, `pleine_page` | capture la zone de la cible, ou la page, entière avec `pleine_page = true` |
| `main` | `message`, `jusqua` : `{ url = "…" }` ou `{ cible = { … }, etat = "visible" }` | | rend la main au développeur, jusqu'à l'état décrit (module `session`, § 4) |

Les champs communs, `ligne`, `delai` et `mutation`, sont décrits au module `scenario`, § 1. Aucune action n'exécute de code dans la page : ni évaluation, ni script injecté, ni fonction exposée ; le moteur ne voit la page que par les localisateurs de Playwright. Les sources du skill n'emploient ni `evaluate`, ni `addInitScript`, ni `exposeFunction`, ni `waitForTimeout`, et la recette le vérifie (R15). Le JavaScript de l'application, lui, s'exécute normalement.

## 2. Attentes et délais (D5.INV-2)

Chaque étape attend un état, jamais une durée : un élément actionnable pour un geste, la condition pour `attendre` et `verifier`, l'état de `jusqua` pour `main`. L'état s'interroge à intervalles croissants, 100, 250, 500 puis 1 000 ms, et l'étape s'arrête dès qu'il est obtenu. Le délai est celui de l'étape (`delai`), sinon du scénario, sinon du réglage `SCENARIO_PLAYWRIGHT_DELAI`, sinon 10 s ; il ne dépasse jamais 30 s, et 900 s pour une étape `main`, dont le délai par défaut est de 300 s.

## 3. Vérifications (D5.INV-4)

| Critère | Champs | Réussit quand |
|---|---|---|
| `contient` | `cible`, `attendu` (texte), `exact` facultatif | le texte affiché de la cible, espaces regroupés, contient l'attendu ; lui est égal avec `exact = true` |
| `visible` | `cible`, `attendu` (`true` par défaut, ou `false`) | la cible est visible, ou ne l'est pas (absente ou masquée) |
| `valeur` | `cible`, `attendu` (texte) | le champ a cette valeur |
| `nombre` | `cible`, `attendu` (entier) | la cible désigne ce nombre d'éléments ; seul critère où une cible peut en désigner plusieurs |
| `url` | `attendu` | la page a cette adresse (ci-dessous) |
| `actif` | `cible`, `attendu` (`true` par défaut, ou `false`) | la cible est active, ou inactive |

Une vérification interroge l'état jusqu'à son délai. Son échec donne l'attendu et l'obtenu : `attendu : un texte qui contient « Fournisseurs » ; obtenu : texte « Clients »`, `attendu : 99 éléments ; obtenu : 3 éléments`. Chaque vérification a sa capture, de la zone de la cible si elle est visible, sinon de la page (D8.INV-2).

Une adresse attendue (`verifier` et `url`, `attendre` et `url`, `jusqua.url`) se compare ainsi :

- un chemin qui commence par `/` se compare au chemin de la page, sur l'origine de `url_base` ; la requête (`?…`) compte s'il en porte une ;
- une étoile finale accepte la suite : `/clients/*`, `/clients?cree=*` ;
- une adresse complète se compare entière, sans l'ancre ;
- l'attendu et l'adresse se comparent décodés : `/clients?cree=Zoé` correspond à `/clients?cree=Zo%C3%A9`.

## 4. Déroulé d'un jeu (D5.INV-3)

Les étapes se jouent dans l'ordre, une fois chacune : aucune étape n'est rejouée, ni après un échec, ni en cas d'instabilité. Une étape échouée arrête le jeu ; les étapes suivantes sont « non jouées », avec le motif. Une exception : après une étape `verifier` échouée, les étapes `verifier` qui suivent sont jouées, car aucune ne change la page et chaque attendu reçoit son constat ; la première étape d'une autre action est alors non jouée, et le jeu s'arrête. Le jeu suivant, s'il y en a, est joué dans un onglet neuf du même profil.

## 5. Mutations

Une étape qui crée, modifie ou supprime des données porte `mutation` : sa ligne du texte est marquée, ou la traduction la signale (module `texte`, § 5). Hors du poste, ces étapes demandent l'autorisation explicite du développeur pour l'exécution, et une étape de mutation sur une page hors du poste échoue sans agir quand elle manque (D7.INV-2, module `garde`, § 2). Une mutation n'est jamais rejouée, comme toute étape (§ 4).

## 6. Fichiers (D5.INV-5)

- `televerser` ne prend que des fichiers du dossier du scénario et de ses sous-dossiers : un chemin absolu, un `..`, ou un fichier absent sont refusés avant le navigateur. Un fichier de données de test se range donc à côté du scénario, par exemple dans `donnees/`.
- `telecharger` attend le téléchargement que déclenche le clic, et l'enregistre dans `telechargements/` du dossier de résultats, sous le nom proposé par l'application, ou sous `nom` suivi de son extension. Le rapport donne le fichier, le nom proposé, la taille et l'empreinte SHA-256.

## 7. Point d'extension E3

`jouerScenario(contexte, options)` joue des jeux préparés dans un contexte de navigateur ouvert, et rend la liste des jeux joués, chacun avec ses étapes au format du rapport (module `preuves`, § 2). Options : `scenario` (validé), `jeux` (préparés par `preparerJeux` du module `scenario`), `resultats` (dossier), `journal` (rendu par `garderOrigines` du module `session`), `delai` (s), `autoriserMutations`, `surEvenement` (avancement : début d'un jeu, début et fin d'une étape, étape à la main). `jouer.mjs` en est le premier appelant ; la recette en est un second (R8).

## 8. Contrôle de sortie

- Chaque action du jeu fermé est jouée sur l'application de démonstration, et l'application reçoit ce que l'utilisateur aurait fait (module `recette`, R5).
- Une attente s'arrête dès l'état obtenu, et échoue à son délai (D5.INV-2).
- Les vérifications échouées se poursuivent, les autres échecs arrêtent le jeu, rien n'est rejoué (D5.INV-3).
- Chaque critère donne l'attendu et l'obtenu (D5.INV-4).
- Aucune source n'exécute de code dans la page (D5.INV-1).

## 9. Source `scripts/moteur.mjs`

<!-- fichier : scripts/moteur.mjs -->
```javascript
// scenario-playwright 1.1.1 : moteur des étapes, jeu d'actions fermé.
//
// Chaque étape agit comme une personne devant l'écran, sur une cible résolue côté utilisateur (D4).
// Aucune étape n'exécute de code dans la page (D5.INV-1) ; les attentes portent sur un état, dans un
// délai borné (D5.INV-2) ; aucune étape n'est rejouée (D5.INV-3) ; une étape de mutation hors du poste
// n'agit qu'avec l'autorisation explicite du développeur (D7.INV-2).
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { setTimeout as pause } from 'node:timers/promises';
import { URL } from 'node:url';
import { decrireCible, estFragile, localisateur } from './cibles.mjs';
import { DELAI_MAIN_DEFAUT, resumeEtape } from './scenario.mjs';
import { estLocale } from './session.mjs';

export const INTERVALLES = [100, 250, 500, 1000];

/** Texte comparé : espaces regroupés, bords retirés. */
export const normaliserTexte = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

/**
 * Une adresse correspond-elle à l'attendu ? Un attendu qui commence par / se compare au chemin de la
 * page, sur l'origine de url_base, requête comprise s'il en porte une ; une étoile finale accepte la
 * suite. Une adresse complète se compare entière, sans l'ancre. Les deux se comparent décodées.
 */
export function adresseCorrespond(courante, attendu, urlBase) {
  let u;
  try {
    u = new URL(courante);
  } catch {
    return false;
  }
  const prefixe = attendu.endsWith('*');
  const motif = prefixe ? attendu.slice(0, -1) : attendu;
  let obtenu;
  if (motif.startsWith('/')) {
    if (u.origin !== new URL(urlBase).origin) return false;
    obtenu = u.pathname + (motif.includes('?') || prefixe ? u.search : '');
  } else {
    obtenu = u.href.replace(/#.*$/, '');
  }
  const decode = (s) => { try { return decodeURIComponent(s.replace(/\+/g, ' ')); } catch { return s; } };
  obtenu = decode(obtenu);
  const voulu = decode(motif);
  return prefixe ? obtenu.startsWith(voulu) : obtenu === voulu;
}

/** Message d'une erreur de Playwright, court et lisible ; une cible ambiguë garde ses candidats (D4.INV-2). */
export function messageErreur(e, delaiMs) {
  const brut = String(e?.message ?? e).replace(/\u001b\[[0-9;]*m/g, '');
  const lignes = brut.split('\n');
  if (/strict mode violation/.test(brut)) {
    const n = /resolved to (\d+) elements/.exec(brut)?.[1] ?? 'plusieurs';
    const candidats = lignes.filter((l) => /^\s*\d+\) /.test(l)).slice(0, 5).map((l) => l.trim());
    return `cible ambiguë, ${n} éléments trouvés, aucune action faite : ${candidats.join(' ; ')}`;
  }
  if (/ERR_BLOCKED_BY_CLIENT/.test(brut)) return 'navigation vers une origine non déclarée, interrompue (D7.INV-1)';
  if (e?.name === 'TimeoutError' || /Timeout \d+ms exceeded/.test(brut)) {
    const attente = lignes.find((l) => /waiting for/.test(l))?.replace(/^\s*-\s*/, '').trim();
    return `délai de ${Math.round(delaiMs / 1000)} s dépassé${attente ? ` (${attente})` : ''}`;
  }
  return lignes[0].replace(/^[a-zA-Z.]+: (Error: )?/, '').slice(0, 500);
}

/** Interroge un état jusqu'à son obtention ou la fin du délai ; rend { ok, valeur, erreur }. */
export async function sonder(lire, test, delaiMs) {
  const fin = Date.now() + delaiMs;
  let i = 0;
  let derniere = { ok: false };
  for (;;) {
    try {
      const valeur = await lire();
      if (test(valeur)) return { ok: true, valeur };
      derniere = { ok: false, valeur };
    } catch (e) {
      derniere = { ok: false, erreur: e };
      if (/strict mode violation/.test(String(e?.message))) return derniere;
    }
    const reste = fin - Date.now();
    if (reste <= 0) return derniere;
    await pause(Math.min(INTERVALLES[Math.min(i++, INTERVALLES.length - 1)], reste));
  }
}

const sha256 = (tampon) => createHash('sha256').update(tampon).digest('hex');
const nomSur = (s) => basename(String(s)).replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').slice(0, 120) || 'telechargement';

class Echec extends Error {}

/** Vérification d'un critère (D5.INV-4) ; lève Echec avec l'attendu et l'obtenu. */
async function verifier(page, e, delaiMs, urlBase) {
  const loc = e.cible ? localisateur(page, e.cible) : null;
  const attendu = e.attendu;
  let r;
  let decrire;
  switch (e.critere) {
    case 'contient': {
      const voulu = normaliserTexte(attendu);
      r = await sonder(() => loc.innerText({ timeout: Math.min(delaiMs, 1000) }), (t) => (e.exact ? normaliserTexte(t) === voulu : normaliserTexte(t).includes(voulu)), delaiMs);
      decrire = (v) => `texte « ${normaliserTexte(v).slice(0, 200)} »`;
      break;
    }
    case 'visible': {
      const voulu = attendu !== false;
      r = await sonder(() => loc.isVisible(), (v) => v === voulu, delaiMs);
      decrire = (v) => (v ? 'visible' : 'non visible');
      break;
    }
    case 'valeur':
      r = await sonder(() => loc.inputValue({ timeout: Math.min(delaiMs, 1000) }), (v) => v === attendu, delaiMs);
      decrire = (v) => `valeur « ${v} »`;
      break;
    case 'nombre':
      r = await sonder(() => loc.count(), (v) => v === attendu, delaiMs);
      decrire = (v) => `${v} élément${v > 1 ? 's' : ''}`;
      break;
    case 'actif': {
      const voulu = attendu !== false;
      r = await sonder(() => loc.isEnabled({ timeout: Math.min(delaiMs, 1000) }), (v) => v === voulu, delaiMs);
      decrire = (v) => (v ? 'actif' : 'inactif');
      break;
    }
    default:
      r = await sonder(() => page.url(), (u) => adresseCorrespond(u, attendu, urlBase), delaiMs);
      decrire = (v) => `adresse ${v}`;
  }
  if (r.ok) return;
  if (r.erreur && /strict mode violation/.test(String(r.erreur.message))) throw new Echec(messageErreur(r.erreur, delaiMs));
  const obtenu = r.valeur !== undefined ? decrire(r.valeur) : `rien (${messageErreur(r.erreur, delaiMs)})`;
  const voulu = ({ contient: e.exact ? `le texte « ${attendu} »` : `un texte qui contient « ${attendu} »`, visible: attendu === false ? 'non visible' : 'visible', valeur: `la valeur « ${attendu} »`, nombre: `${attendu} élément${attendu > 1 ? 's' : ''}`, actif: attendu === false ? 'inactif' : 'actif', url: `l'adresse ${attendu}` })[e.critere];
  throw new Echec(`attendu : ${voulu} ; obtenu : ${obtenu}`);
}

async function attendre(page, e, delaiMs, urlBase) {
  if (e.etat === 'url') {
    const r = await sonder(() => page.url(), (u) => adresseCorrespond(u, e.url, urlBase), delaiMs);
    if (!r.ok) throw new Echec(`l'adresse ${e.url} n'est pas atteinte en ${Math.round(delaiMs / 1000)} s ; adresse : ${page.url()}`);
    return;
  }
  const loc = localisateur(page, e.cible);
  const lectures = {
    visible: [() => loc.isVisible(), (v) => v === true, 'visible'],
    masque: [() => loc.isVisible(), (v) => v === false, 'masqué'],
    actif: [() => loc.isEnabled({ timeout: Math.min(delaiMs, 1000) }), (v) => v === true, 'actif'],
    inactif: [() => loc.isEnabled({ timeout: Math.min(delaiMs, 1000) }), (v) => v === false, 'inactif'],
    texte: [() => loc.innerText({ timeout: Math.min(delaiMs, 1000) }), (t) => normaliserTexte(t).includes(normaliserTexte(e.texte)), `avec le texte « ${e.texte} »`],
  };
  const [lire, test, libelle] = lectures[e.etat];
  const r = await sonder(lire, test, delaiMs);
  if (r.ok) return;
  if (r.erreur && /strict mode violation/.test(String(r.erreur.message))) throw new Echec(messageErreur(r.erreur, delaiMs));
  throw new Echec(`${decrireCible(e.cible)} n'est pas ${libelle} en ${Math.round(delaiMs / 1000)} s`);
}

/**
 * Joue les jeux préparés dans le contexte du navigateur (point d'extension E3). Options :
 * { scenario, jeux, resultats (dossier), journal (garde des origines), delai (s), autoriserMutations,
 *   surEvenement }. Rend la liste des jeux joués, avec le résultat de chaque étape.
 */
export async function jouerScenario(contexte, { scenario, jeux, resultats, journal, delai, autoriserMutations = false, surEvenement = () => {} }) {
  const joues = [];
  const plusieurs = jeux.length > 1;
  let precedente = null;
  for (const jeu of jeux) {
    // Chaque jeu dans un onglet neuf, ouvert avant de fermer le précédent : fermer le dernier onglet fermerait la fenêtre.
    const page = precedente === null && contexte.pages().length > 0 ? contexte.pages()[0] : await contexte.newPage();
    if (precedente) await precedente.close().catch(() => {});
    precedente = page;
    let seau = null;
    page.on('console', (m) => { if (seau && m.type() === 'error') seau.console.push(m.text().slice(0, 500)); });
    page.on('pageerror', (err) => { if (seau) seau.erreurs_page.push(String(err.message).slice(0, 500)); });
    page.on('response', (rep) => { if (seau && rep.status() >= 400) seau.reponses.push(`${rep.status()} ${rep.url()}`); });
    const resultat = { numero: jeu.numero, valeurs: jeu.valeurs, statut: 'reussi', etapes: [] };
    surEvenement({ type: 'jeu', jeu: jeu.numero, valeurs: jeu.valeurs, plusieurs });
    let arret = null; // motif d'arrêt : les étapes suivantes ne sont pas jouées
    let echecVerifier = false;
    for (let i = 0; i < jeu.etapes.length; i++) {
      const e = jeu.etapes[i];
      const prefixe = `${plusieurs ? `j${jeu.numero}-` : ''}${String(i + 1).padStart(2, '0')}`;
      const r = {
        numero: i + 1, ligne: e.ligne ?? null, action: e.action, resume: resumeEtape(e), cible: e.cible ? decrireCible(e.cible) : null,
        fragile: estFragile(e.cible) || estFragile(e.jusqua?.cible), mutation: e.mutation ?? null, statut: 'reussie', duree_ms: 0, message: null,
        capture: null, aria: null, telechargement: null, console: [], erreurs_page: [], reponses: [],
      };
      resultat.etapes.push(r);
      if (arret || (echecVerifier && e.action !== 'verifier')) {
        if (!arret) arret = 'une vérification a échoué';
        r.statut = 'non_jouee';
        r.message = `non jouée : ${arret}`;
        continue;
      }
      seau = r;
      const delaiMs = (e.delai ?? (e.action === 'main' ? DELAI_MAIN_DEFAUT : delai)) * 1000;
      const debut = Date.now();
      let fin = null;
      surEvenement({ type: 'etape', jeu: jeu.numero, etape: r });
      try {
        if (e.mutation) {
          const origine = new URL(page.url()).origin;
          if (!/^https?:/.test(page.url()) || (!estLocale(origine) && !autoriserMutations)) {
            throw new Echec(`étape de mutation sur ${/^https?:/.test(page.url()) ? origine : page.url()}, hors du poste, sans --autoriser-mutations : aucune action faite (D7.INV-2)`);
          }
        }
        await jouerEtape(page, e, { delaiMs, scenario, resultats, prefixe, r, surEvenement });
        const bloquee = journal?.navigations.find((n) => n.page === page && n.quand >= debut);
        if (bloquee) throw new Echec(`navigation vers ${bloquee.url}, origine non déclarée par le scénario, interrompue (D7.INV-1)`);
      } catch (err) {
        r.statut = 'echec';
        r.message = err instanceof Echec ? err.message : messageErreur(err, delaiMs);
        resultat.statut = 'echec';
        if (e.action === 'verifier') echecVerifier = true;
        else arret = `l'étape ${i + 1} a échoué`;
        // La durée de l'étape s'arrête à l'échec : les preuves de l'échec n'y entrent pas.
        fin = Date.now();
        await preuvesEchec(page, resultats, prefixe, r);
      }
      r.duree_ms = (fin ?? Date.now()) - debut;
      // Le seau reste celui de cette étape jusqu'au début de la suivante : un message tardif lui revient.
      surEvenement({ type: 'fin-etape', jeu: jeu.numero, etape: r });
    }
    joues.push(resultat);
  }
  return joues;
}

async function preuvesEchec(page, resultats, prefixe, r) {
  if (page.isClosed()) return;
  try {
    if (!r.capture) {
      const rel = `captures/${prefixe}-${r.action}-echec.png`;
      mkdirSync(join(resultats, 'captures'), { recursive: true });
      await page.screenshot({ path: join(resultats, rel), timeout: 10_000 });
      r.capture = rel;
    }
  } catch { /* page fermée ou figée : pas de capture */ }
  try {
    const arbre = await page.locator('body').ariaSnapshot({ timeout: 10_000 });
    const rel = `aria/${prefixe}-${r.action}.yml`;
    mkdirSync(join(resultats, 'aria'), { recursive: true });
    writeFileSync(join(resultats, rel), `${arbre}\n`);
    r.aria = rel;
  } catch { /* pas d'instantané */ }
}

async function capture(cible, page, resultats, rel, options = {}) {
  mkdirSync(join(resultats, 'captures'), { recursive: true });
  const chemin = join(resultats, rel);
  if (cible) await cible.screenshot({ path: chemin, ...options });
  else await page.screenshot({ path: chemin, ...options });
  return rel;
}

async function jouerEtape(page, e, { delaiMs, scenario, resultats, prefixe, r, surEvenement }) {
  const options = { timeout: delaiMs };
  const loc = e.cible ? localisateur(page, e.cible) : null;
  switch (e.action) {
    case 'naviguer': {
      const adresse = new URL(e.url, scenario.url_base).href;
      const reponse = await page.goto(adresse, { timeout: delaiMs, waitUntil: 'load' });
      if (reponse && reponse.status() >= 400) throw new Echec(`la page ${adresse} répond ${reponse.status()}`);
      return;
    }
    case 'cliquer': return void await loc.click(options);
    case 'saisir': return void await loc.fill(e.valeur, options);
    case 'choisir': return void await loc.selectOption({ label: e.valeur }, options);
    case 'cocher': return void await loc.setChecked(e.valeur, options);
    case 'survoler': return void await loc.hover(options);
    case 'touche': return void await (loc ? loc.press(e.touche, options) : page.keyboard.press(e.touche));
    case 'televerser': return void await loc.setInputFiles(e.fichiers, options);
    case 'telecharger': {
      const [telechargement] = await Promise.all([page.waitForEvent('download', { timeout: delaiMs }), loc.click(options)]);
      const propose = nomSur(telechargement.suggestedFilename());
      const nom = e.nom ? `${e.nom}${extname(propose)}` : propose;
      mkdirSync(join(resultats, 'telechargements'), { recursive: true });
      const chemin = join(resultats, 'telechargements', nom);
      await telechargement.saveAs(chemin);
      const contenu = readFileSync(chemin);
      r.telechargement = { fichier: `telechargements/${nom}`, propose, octets: contenu.length, sha256: sha256(contenu) };
      return;
    }
    case 'attendre': return attendre(page, e, delaiMs, scenario.url_base);
    case 'verifier':
      try {
        await verifier(page, e, delaiMs, scenario.url_base);
      } finally {
        try {
          const zone = loc && (await loc.count()) === 1 && (await loc.isVisible()) ? loc : null;
          r.capture = await capture(zone, page, resultats, `captures/${prefixe}-verifier.png`, { timeout: 5000 });
        } catch { /* capture impossible : l'échec reste rapporté */ }
      }
      return;
    case 'capturer':
      r.capture = await capture(loc, page, resultats, `captures/${prefixe}-${e.nom}.png`, loc ? options : { fullPage: e.pleine_page === true, timeout: delaiMs });
      return;
    case 'main': {
      surEvenement({ type: 'main', message: e.message, jusqua: e.jusqua, delai: delaiMs / 1000 });
      await page.bringToFront().catch(() => {});
      if (e.jusqua.url) {
        const s = await sonder(() => page.url(), (u) => adresseCorrespond(u, e.jusqua.url, scenario.url_base), delaiMs);
        if (!s.ok) throw new Echec(`étape à la main non terminée en ${delaiMs / 1000} s : l'adresse ${e.jusqua.url} n'est pas atteinte`);
      } else {
        const l = localisateur(page, e.jusqua.cible);
        const etat = e.jusqua.etat ?? 'visible';
        const s = await sonder(() => l.isVisible(), (v) => v === (etat === 'visible'), delaiMs);
        if (!s.ok) throw new Echec(`étape à la main non terminée en ${delaiMs / 1000} s : ${decrireCible(e.jusqua.cible)} n'est pas ${etat === 'visible' ? 'visible' : 'masqué'}`);
      }
      return;
    }
    default:
      throw new Echec(`action inconnue : ${e.action}`);
  }
}
```
<<<FIN modules/actions/SKILL.md>>>

<<<FICHIER modules/session/SKILL.md>>>
---
name: session
description: Session et navigateur du poste (Chrome par défaut, Edge ou Chromium de Playwright par SCENARIO_PLAYWRIGHT_CANAL, lancé par playwright-core sans téléchargement ; compatibilité avec le Chromium de playwright-core et avertissement au-delà ; profil dédié réutilisé, un par application et un pour Jira, aucun identifiant vu ni saisi ; étape à la main, message, état attendu jusqua, délai, refus sans fenêtre ; fenêtre de 1 280 × 900, ralenti ; garde des origines posée sur le contexte), source de scripts/session.mjs. À lire pour choisir le navigateur, comprendre la session ou une étape à la main.
dimensions: [D6]
status: active
---

# Module `session` (D6)

Phases 7E couvertes : Espace et Environnement.

## 1. Navigateur du poste

Le navigateur est celui du poste, lancé par `playwright-core` sans en télécharger aucun : Chrome par défaut, Edge avec `SCENARIO_PLAYWRIGHT_CANAL=msedge`, ou le Chromium de Playwright avec `chromium`, après `npx playwright-core install chromium` (module `execution`, § 2). Le scénario se joue dans une fenêtre visible de 1 280 × 900 pixels ; `--ralenti <ms>` ralentit chaque geste pour une démonstration, `--sans-tete` joue sans fenêtre un scénario qui n'a pas d'étape à la main.

## 2. Compatibilité (D6.INV-1)

Chaque version de `playwright-core` porte un Chromium de référence, et suit le Chrome stable de sa publication. Le skill épingle `playwright-core` 1.65.1, dont le Chromium est le 159 : à sa publication, le 20 novembre 2026, le Chrome stable est le 158, et le 159 lui succède. Le rapport note le canal et la version du navigateur, et l'écart avec le Chromium de référence, lu dans le paquet installé :

| Numéro majeur du navigateur | Avertissement |
|---|---|
| celui du Chromium de référence, ou une ou deux versions avant | aucun |
| plus de deux versions avant | navigateur ancien : le mettre à jour |
| plus récent que le Chromium de référence | en cas d'échec inattendu, une nouvelle version du skill monte `playwright-core` |

L'avertissement s'affiche en début d'exécution et figure dans le rapport ; il n'arrête rien.

## 3. Profil dédié (D6.INV-2)

Le navigateur s'ouvre sur un profil dédié, réutilisé d'une exécution à l'autre : `.profils/<profil>/` dans le dossier du skill, ou dans `SCENARIO_PLAYWRIGHT_PROFILS`. Le profil se nomme dans le texte (`Profil :`) et le scénario (`profil`), un par application de préférence ; à défaut, `defaut`. Une session ouverte une fois, dont les cookies persistent, sert aux exécutions suivantes sans nouvelle connexion. L'import de Jira par l'adresse a son propre profil, `jira` par défaut (module `jira`, § 2) : la session de Jira ne se mêle à celle d'aucune application.

Le skill ne demande, ne lit, ne stocke ni ne saisit aucun identifiant, mot de passe ou jeton : une connexion se fait à la main, dans la fenêtre, lors d'une étape `main`. Le profil contient des cookies de session : il ne se copie, ne se partage ni ne se versionne (D1.INV-2). Un profil ne s'ouvre que dans une fenêtre à la fois.

## 4. Étape à la main (D6.INV-3)

Une ligne du texte marquée « (à la main) » donne une étape `main`. Le moteur affiche son message et ce qu'il attend, met la fenêtre au premier plan, puis interroge l'état décrit par `jusqua` :

```text
À VOUS : je me connecte — la suite reprend dès que l'adresse /accueil est atteinte (300 s au plus).
```

| `jusqua` | État attendu |
|---|---|
| `{ url = "/accueil" }` | la page a cette adresse (règles du module `actions`, § 3) |
| `{ cible = { role = "heading", nom = "Espace connecté" } }` | la cible est visible |
| `{ cible = { … }, etat = "masque" }` | la cible n'est plus visible |

La suite reprend seule, dès l'état atteint ; au-delà du délai de l'étape, 300 s par défaut et 900 s au plus, l'étape échoue. Un scénario qui a une étape à la main est refusé sans fenêtre, avant d'ouvrir le navigateur.

## 5. Garde des origines

`garderOrigines(contexte, origines)` pose sur le contexte du navigateur la garde du module `garde`, § 1 : une route pour toute requête, une route pour tout WebSocket, et le journal des origines bloquées et des navigations interrompues, que lisent le moteur et le rapport.

## 6. Contrôle de sortie

- Réglages par défaut, variable vide, canal et délai invalides refusés (D1.INV-3, module `recette`, R11).
- Une session ouverte dans un profil est retrouvée à l'exécution suivante ; un autre profil ne la voit pas (D6.INV-2).
- Une étape à la main reprend à l'état atteint, échoue à son délai, et est refusée sans fenêtre (D6.INV-3).
- La version du navigateur, le Chromium de référence et l'avertissement figurent au rapport (D6.INV-1).

## 7. Source `scripts/session.mjs`

<!-- fichier : scripts/session.mjs -->
```javascript
// scenario-playwright 1.1.1 : réglages, navigateur du poste, profil dédié et garde des origines.
//
// Le navigateur est celui du poste, Chrome par défaut, piloté par playwright-core sans en télécharger
// aucun (D1.INV-1, D6.INV-1). La session vit dans un profil dédié ; le skill ne voit aucun identifiant
// (D6.INV-2). Aucune requête ne part vers une origine que le scénario ne déclare pas (D7.INV-1).
import { mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { chromium } from 'playwright-core';
import { RE_PROFIL } from './texte.mjs';

export const DOSSIER_SKILL = dirname(dirname(fileURLToPath(import.meta.url)));
export const CANAUX = ['chrome', 'msedge', 'chromium'];
export const PROFIL_DEFAUT = 'defaut';
export const FENETRE = { width: 1280, height: 900 };
const require = createRequire(import.meta.url);

/**
 * Réglages lus dans l'environnement (D1.INV-3) : une variable vide vaut absente, une valeur invalide est
 * refusée. Rend { reglages, erreurs }.
 */
export function lireReglages(env = process.env) {
  const val = (k) => (env[k] === undefined || env[k] === '' ? undefined : env[k]);
  const erreurs = [];
  const canal = val('SCENARIO_PLAYWRIGHT_CANAL') ?? 'chrome';
  if (!CANAUX.includes(canal)) erreurs.push(`SCENARIO_PLAYWRIGHT_CANAL vaut ${CANAUX.join(', ')} (« ${canal} » refusé)`);
  const profils = val('SCENARIO_PLAYWRIGHT_PROFILS') ?? '.profils';
  const brut = val('SCENARIO_PLAYWRIGHT_DELAI');
  const delai = brut === undefined ? undefined : Number(brut);
  if (brut !== undefined && !(Number.isInteger(delai) && delai >= 1 && delai <= 30)) erreurs.push(`SCENARIO_PLAYWRIGHT_DELAI est un nombre entier de secondes, de 1 à 30 (« ${brut} » refusé)`);
  return { reglages: { canal, profils: isAbsolute(profils) ? profils : join(DOSSIER_SKILL, profils), delai }, erreurs };
}

/** Dossier du profil nommé, dans le dossier des profils (D6.INV-2). */
export function dossierProfil(reglages, nom = PROFIL_DEFAUT) {
  if (!RE_PROFIL.test(nom)) throw new Error(`profil invalide : ${nom}`);
  return join(reglages.profils, nom);
}

/** Version de playwright-core et numéro majeur du Chromium qu'il porte, lus dans son paquet. */
export function reference() {
  const paquet = dirname(require.resolve('playwright-core/package.json'));
  const version = JSON.parse(readFileSync(join(paquet, 'package.json'), 'utf8')).version;
  const navigateurs = JSON.parse(readFileSync(join(paquet, 'browsers.json'), 'utf8')).browsers;
  const chromiumRef = navigateurs.find((b) => b.name === 'chromium');
  return { playwrightCore: version, chromium: chromiumRef.browserVersion, majeur: Number(chromiumRef.browserVersion.split('.')[0]) };
}

/**
 * Compatibilité d'un navigateur avec playwright-core (D6.INV-1) : avertissement quand son numéro majeur
 * dépasse celui du Chromium de playwright-core, ou reste plus de deux versions en arrière.
 */
export function compatibilite(version, ref) {
  const majeur = Number(String(version).split('.')[0]);
  if (!Number.isInteger(majeur)) return { ecart: null, avertissement: `version du navigateur illisible : ${version}` };
  const ecart = ref.majeur - majeur;
  if (ecart < 0) return { ecart, avertissement: `navigateur ${majeur} plus récent que le Chromium ${ref.majeur} de playwright-core ${ref.playwrightCore} : en cas d'échec inattendu, une nouvelle version du skill monte playwright-core` };
  if (ecart > 2) return { ecart, avertissement: `navigateur ${majeur} ancien, ${ecart} versions avant le Chromium ${ref.majeur} de playwright-core ${ref.playwrightCore} : le mettre à jour` };
  return { ecart, avertissement: null };
}

/** Ouvre le navigateur du poste sur le profil dédié : fenêtre visible, sauf `sansTete`. */
export async function ouvrirNavigateur({ canal, profil, sansTete = false, ralenti = 0 }) {
  mkdirSync(profil, { recursive: true });
  const options = { headless: sansTete, viewport: FENETRE, serviceWorkers: 'block', acceptDownloads: true, slowMo: ralenti || undefined, args: [`--window-size=${FENETRE.width},${FENETRE.height + 120}`] };
  if (canal !== 'chromium') options.channel = canal;
  const contexte = await chromium.launchPersistentContext(resolve(profil), options);
  return contexte;
}

const HOTES_LOCAUX = new Set(['127.0.0.1', 'localhost', '[::1]', '::1']);

/** Vrai si l'origine est sur le poste : 127.0.0.1, localhost ou [::1] (D7.INV-2). */
export function estLocale(origine) {
  try {
    return HOTES_LOCAUX.has(new URL(origine).hostname);
  } catch {
    return false;
  }
}

/** Origine http(s) correspondant à une adresse, WebSocket compris (ws vers http, wss vers https). */
export function origineHttp(adresse) {
  try {
    const u = new URL(adresse);
    const schema = { 'ws:': 'http:', 'wss:': 'https:', 'http:': 'http:', 'https:': 'https:' }[u.protocol];
    return schema ? `${schema}//${u.host}` : null;
  } catch {
    return null;
  }
}

/**
 * Garde des origines (D7.INV-1) : toute requête, WebSocket compris, vers une origine non déclarée est
 * interrompue avant chargement et comptée. Les adresses data:, blob: et about: restent dans la page.
 * Rend le journal { bloquees: Map(origine → nombre), navigations: [{ url, quand }] }.
 */
export async function garderOrigines(contexte, origines) {
  const permises = new Set(origines);
  const journal = { bloquees: new Map(), navigations: [] };
  const noter = (adresse, navigation, page) => {
    const o = origineHttp(adresse) ?? adresse.split(':')[0];
    journal.bloquees.set(o, (journal.bloquees.get(o) ?? 0) + 1);
    if (navigation) journal.navigations.push({ url: adresse, page, quand: Date.now() });
  };
  await contexte.route('**/*', (route) => {
    const requete = route.request();
    const adresse = requete.url();
    const o = origineHttp(adresse);
    if (o === null || permises.has(o)) return route.continue();
    let page = null;
    try {
      const cadre = requete.frame();
      if (requete.isNavigationRequest() && cadre === cadre.page().mainFrame()) page = cadre.page();
    } catch {
      // requête sans cadre (travailleur) : comptée, sans navigation
    }
    noter(adresse, page !== null, page);
    return route.abort('blockedbyclient');
  });
  await contexte.routeWebSocket(/.*/, (ws) => {
    const o = origineHttp(ws.url());
    if (o !== null && permises.has(o)) return ws.connectToServer();
    noter(ws.url(), false, null);
    return ws.close({ code: 1008, reason: 'origine non déclarée par le scénario' });
  });
  return journal;
}
```
<<<FIN modules/session/SKILL.md>>>

<<<FICHIER modules/garde/SKILL.md>>>
---
name: garde
description: Garde du skill (origines déclarées seules permises, requêtes et WebSocket vers une autre origine interrompus avant chargement et comptés, navigation vers elle en échec, origine légitime ajoutée au texte puis retraduite ; mutations hors du poste, soit hors de 127.0.0.1, localhost et [::1], refusées sans --autoriser-mutations avant le navigateur et à l'étape ; aucun identifiant ; trace seulement sur demande, résultats sur le poste ; ce que la garde ne couvre pas). Le code est dans scripts/session.mjs, scripts/moteur.mjs et scripts/jouer.mjs. À lire avant de jouer un scénario sur une application réelle.
dimensions: [D7]
status: active
---

# Module `garde` (D7)

Phases 7E couvertes : Espace et Environnement.

Le skill agit dans un vrai navigateur, au nom du développeur. La garde borne ce qu'une exécution peut toucher : où partent les requêtes, ce qui peut être modifié, ce qui sort du poste.

## 1. Origines (D7.INV-1)

Le scénario déclare ses origines : `origines`, sinon celle de `url_base`. Une origine est un schéma, un hôte et un port : `http://127.0.0.1:4200`, `https://recette.exemple.fr`. Pendant l'exécution :

- toute requête vers une origine non déclarée est interrompue avant chargement, et comptée par origine dans le rapport (`origines_bloquees`) et en fin de sortie ;
- un WebSocket suit la même règle : `ws` se compare à `http`, `wss` à `https`, sur le même hôte et le même port ; un WebSocket permis est relayé tel quel, un autre est fermé ;
- une navigation de la page vers une origine non déclarée fait échouer l'étape, et la page ne la charge pas ;
- les adresses `data:`, `blob:` et `about:` restent dans la page ;
- `naviguer` n'accepte qu'un chemin, ou une adresse d'une origine déclarée : le reste est refusé avant le navigateur.

La fenêtre de Jira qu'ouvre l'import par l'adresse (module `jira`, § 2) ne joue aucun scénario : elle n'est pas gardée, et le skill n'y fait que naviguer vers l'adresse donnée (D16.INV-1).

Une origine bloquée qui manque à l'application, une API, un fournisseur d'identité, un CDN de polices, s'ajoute au texte de départ par le développeur (`Origines :`). La traduction est alors périmée par l'empreinte : elle se refait, et se ratifie (D3.INV-2). La règle est celle du navigateur d'Agent2Test (`agent2test:D4.INV-2`).

## 2. Mutations hors du poste (D7.INV-2)

Sont sur le poste les origines d'hôte `127.0.0.1`, `localhost` et `[::1]` ; toute autre est hors du poste, y compris une autre adresse en `127.x.x.x` et un serveur de recette. Une étape de mutation (module `actions`, § 5) y modifie des données qui ne sont pas celles du développeur seul. Donc :

- un scénario qui a une étape de mutation et déclare une origine hors du poste n'est joué qu'avec `--autoriser-mutations` ; sans cette option, `jouer.mjs` le refuse avec le code 2, avant d'ouvrir le navigateur, et cite les étapes et les origines en cause ;
- à l'étape, une mutation sur une page hors du poste échoue sans agir quand l'autorisation manque : la garde tient aussi pour un autre appelant du moteur (E3) ;
- l'autorisation vaut pour une exécution : l'agent la demande au développeur à chaque fois, et ne la donne jamais lui-même (D10.INV-2) ;
- `verifier.mjs` signale ces scénarios avant toute exécution.

Une origine du poste qui relaie une API distante, comme un serveur de développement avec proxy, se déclare aussi : l'origine distante, déclarée, déclenche la garde.

## 3. Aucun identifiant

Le skill ne demande, ne lit, ne stocke ni ne saisit aucun identifiant (D6.INV-2). Aucun scénario n'en contient : le texte et le TOML n'ont aucun moyen de lire une variable d'environnement ou un secret, et une connexion se fait à la main, dans la fenêtre (module `session`, § 4).

## 4. Trace et résultats (D7.INV-3)

- La trace de Playwright (`trace.zip`) n'est enregistrée qu'avec `--trace` : elle contient les cookies, les en-têtes et le contenu des pages. Le rapport le rappelle ; elle reste sur le poste et ne se partage pas.
- Captures, instantanés, téléchargements et rapports restent dans le dossier de résultats, sur le poste, écarté de Git (D1.INV-2). Le skill n'envoie rien nulle part.

## 5. Ce que la garde ne couvre pas

- Une étape qui modifie des données sans `mutation` n'est pas gardée : les marques du texte et leur relecture à la ratification en sont la défense. La traduction ajoute `mutation` à une phrase qui modifie manifestement des données, et le signale.
- Sur le poste, les mutations ne demandent aucune autorisation : la base de développement du développeur est à lui.
- Le JavaScript de l'application s'exécute normalement, avec ses propres requêtes, toutes soumises à la garde des origines.
- Captures et rapports montrent ce que la page affiche : des données personnelles d'une base de recette y figurent ; ils se traitent comme ces données.

## 6. Contrôle de sortie

- Une ressource, un WebSocket et une navigation vers une origine non déclarée sont interrompus et comptés ; une origine déclarée passe (module `recette`, R7).
- Un scénario qui modifie des données hors du poste est refusé sans `--autoriser-mutations`, sans rien écrire ; il se joue avec ; la garde à l'étape refuse sans agir (R8).
- `--sans-tete` est refusé avec une étape à la main (R9) ; la trace n'existe qu'avec `--trace`, avec son avertissement (R17).
<<<FIN modules/garde/SKILL.md>>>

<<<FICHIER modules/preuves/SKILL.md>>>
---
name: preuves
description: Preuves et rapport d'une exécution (dossier de résultats horodaté à côté du scénario, rapport.json aux champs stables, point d'extension E1, rapport.md lisible, captures par vérification, par capture demandée et par échec, instantané ARIA à l'échec, erreurs de console, erreurs de la page et réponses de statut 400 ou plus relevées par étape, téléchargements et leur empreinte, origines bloquées, cibles fragiles, trace sur demande), source de scripts/rapport.mjs. À lire pour exploiter un rapport.
dimensions: [D8]
status: active
---

# Module `preuves` (D8)

Phase 7E couverte : Expression.

## 1. Dossier de résultats (D8.INV-1)

Chaque exécution écrit son dossier, `resultats/<AAAAMMJJ-HHMMSS>-<scénario>/` à côté du scénario, ou dans le dossier de `--resultats` ; deux exécutions dans la même seconde ont deux dossiers. Il est créé une fois le navigateur ouvert : une exécution refusée (code 2) n'en écrit pas.

```text
rapport.json            champs stables (§ 2)
rapport.md              le même rapport, lisible
captures/<n>-<action>.png        vérification, capture demandée (nom donné), échec (…-echec.png)
aria/<n>-<action>.yml            instantané ARIA de la page, à chaque échec
telechargements/<fichier>        fichiers téléchargés
trace.zip               seulement avec --trace
```

`<n>` est le numéro de l'étape sur deux chiffres, précédé de `j<jeu>-` quand le scénario a plusieurs jeux : `captures/j2-05-verifier.png`.

## 2. `rapport.json` (point d'extension E1)

Format `scenario-playwright.rapport/1`. Champs de l'exécution :

| Champ | Contenu |
|---|---|
| `format`, `skill`, `version` | `scenario-playwright.rapport/1`, `scenario-playwright`, version du skill |
| `scenario` | `fichier`, `titre`, `etiquettes`, `source`, `empreinte` (SHA-256 du TOML joué), `url_base`, `origines` |
| `debut`, `fin`, `duree_ms` | horodatages ISO et durée |
| `navigateur` | `canal`, `version`, `playwright_core`, `chromium_reference`, `avertissement` (D6.INV-1) |
| `options` | `sans_tete`, `ralenti`, `trace`, `mutations_autorisees`, `params`, `jeu` |
| `jeux` | pour chaque jeu : `numero`, `valeurs` (variables résolues), `statut` (`reussi`, `echec`), `etapes` |
| `origines_bloquees` | `[{ origine, requetes }]` (D7.INV-1) |
| `cibles_fragiles` | cibles en `css` ou `rang` employées (D4.INV-1) |
| `bilan` | `jeux`, `etapes`, `reussies`, `echecs`, `non_jouees` |
| `statut` | `reussi` si chaque jeu a réussi, sinon `echec` |

Champs de chaque étape :

| Champ | Contenu |
|---|---|
| `numero`, `ligne`, `action`, `resume` | numéro dans le jeu, ligne du texte (ou `null`), action, résumé lisible |
| `cible`, `fragile` | cible dans la notation de Playwright, et si elle est fragile |
| `mutation` | `creation`, `modification`, `suppression` ou `null` |
| `statut`, `duree_ms`, `message` | `reussie`, `echec` ou `non_jouee` ; durée de l'étape, arrêtée à son échec, sans le temps de ses preuves ; message d'échec ou motif de non-exécution |
| `capture`, `aria` | chemins relatifs au dossier de résultats, ou `null` |
| `telechargement` | `{ fichier, propose, octets, sha256 }`, ou `null` |
| `console`, `erreurs_page`, `reponses` | erreurs de console, exceptions de la page, réponses de statut 400 ou plus (`500 http://…`) relevées pendant l'étape (D8.INV-2) |

Ces champs sont stables : un nouveau champ peut s'ajouter dans une version mineure, aucun ne change de sens. D12 et D13 liront le rapport sans rejouer le scénario.

## 3. `rapport.md`

Le même rapport, en français : statut et titre, scénario et texte d'origine, étiquettes, durée et bilan, navigateur et avertissement, rappel sur la trace, un tableau des étapes par jeu (numéro, ligne du texte, résumé, statut, durée, message, capture, instantané, téléchargement, erreurs relevées), puis les origines bloquées et les cibles fragiles, avec la conduite à tenir.

## 4. Captures et instantanés (D8.INV-2)

- Chaque étape `verifier` a sa capture, réussie ou non : la zone de la cible si elle est unique et visible, sinon la page.
- Chaque étape `capturer` a la sienne, nommée par `nom` : la zone de la cible, ou la page, entière avec `pleine_page = true`.
- Chaque échec a la capture de la page et l'instantané ARIA de la page entière : l'arbre que voit un lecteur d'écran, où se lisent les rôles et les noms des éléments présents, pour corriger une cible. Chacun attend 10 s au plus : une page figée ne retient pas l'exécution.

## 5. Erreurs relevées

Les erreurs de console, les exceptions de la page et les réponses HTTP de statut 400 ou plus sont rattachées à l'étape en cours, ou à la dernière étape jouée si elles arrivent juste après. Elles ne font pas échouer l'étape : l'application peut se plaindre sans que le geste échoue ; c'est au développeur, ou à une étape `verifier`, de juger.

## 6. Contrôle de sortie

- Chaque exécution jouée écrit `rapport.json` et `rapport.md` dans son dossier horodaté ; une exécution refusée n'en écrit pas (D8.INV-1).
- Captures par vérification, par capture demandée et par échec, instantané ARIA à l'échec, erreurs relevées par étape (D8.INV-2).
- Les champs du rapport sont ceux du § 2, dans cet ordre (E1, module `recette`, R16).

## 7. Source `scripts/rapport.mjs`

<!-- fichier : scripts/rapport.mjs -->
```javascript
// scenario-playwright 1.1.1 : rapport d'une exécution, en JSON (champs stables, E1) et en Markdown.
//
// Chaque exécution écrit son dossier de résultats horodaté : rapport.json, rapport.md, captures,
// instantanés ARIA à l'échec, téléchargements, et la trace si elle est demandée (D8.INV-1, D8.INV-2).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const FORMAT_RAPPORT = 'scenario-playwright.rapport/1';
export const VERSION_SKILL = '1.1.1';

const deux = (n) => String(n).padStart(2, '0');

/** Dossier de résultats d'une exécution : <base>/<AAAAMMJJ-HHMMSS>-<nom du scénario>. */
export function dossierResultats(base, nomScenario, date = new Date()) {
  const horodatage = `${date.getFullYear()}${deux(date.getMonth() + 1)}${deux(date.getDate())}-${deux(date.getHours())}${deux(date.getMinutes())}${deux(date.getSeconds())}`;
  const nom = String(nomScenario).replace(/\.toml$/i, '').replace(/[^A-Za-z0-9_-]+/g, '-').slice(0, 60) || 'scenario';
  let dossier = join(base, `${horodatage}-${nom}`);
  for (let i = 2; ; i++) {
    try {
      mkdirSync(dossier, { recursive: false });
      return dossier;
    } catch (e) {
      if (e.code === 'ENOENT') mkdirSync(base, { recursive: true });
      else if (e.code === 'EEXIST') dossier = join(base, `${horodatage}-${nom}-${i}`);
      else throw e;
    }
  }
}

/** Rapport d'une exécution (E1) : champs stables, décomptes recalculés depuis les étapes. */
export function construireRapport({ fichier, scenario, empreinte, debut, fin, navigateur, options, jeux, journal }) {
  const etapes = jeux.flatMap((j) => j.etapes);
  const compte = (s) => etapes.filter((e) => e.statut === s).length;
  const statut = jeux.every((j) => j.statut === 'reussi') ? 'reussi' : 'echec';
  return {
    format: FORMAT_RAPPORT,
    skill: 'scenario-playwright',
    version: VERSION_SKILL,
    scenario: { fichier, titre: scenario.titre, etiquettes: scenario.etiquettes, source: scenario.source ?? null, empreinte, url_base: scenario.url_base, origines: scenario.origines },
    debut: debut.toISOString(),
    fin: fin.toISOString(),
    duree_ms: fin - debut,
    navigateur,
    options,
    jeux,
    origines_bloquees: [...(journal?.bloquees ?? new Map())].map(([origine, requetes]) => ({ origine, requetes })),
    cibles_fragiles: [...new Set(etapes.filter((e) => e.fragile).map((e) => e.cible))],
    bilan: { jeux: jeux.length, etapes: etapes.length, reussies: compte('reussie'), echecs: compte('echec'), non_jouees: compte('non_jouee') },
    statut,
  };
}

const STATUT = { reussie: 'réussie', echec: 'ÉCHEC', non_jouee: 'non jouée' };
const echapper = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** Rapport lisible, en Markdown. */
export function rapportMarkdown(r) {
  const l = [];
  l.push(`# ${r.statut === 'reussi' ? 'Réussi' : 'Échec'} : ${r.scenario.titre}`, '');
  l.push(`- Scénario : \`${r.scenario.fichier}\`${r.scenario.source ? `, traduit de \`${r.scenario.source}\`` : ''}${r.scenario.etiquettes.length ? ` ; étiquettes ${r.scenario.etiquettes.map((x) => `@${x}`).join(' ')}` : ''}`);
  l.push(`- Exécution : ${r.debut}, ${Math.round(r.duree_ms / 100) / 10} s ; ${r.bilan.etapes} étapes, ${r.bilan.reussies} réussies, ${r.bilan.echecs} en échec, ${r.bilan.non_jouees} non jouées`);
  l.push(`- Navigateur : ${r.navigateur.canal} ${r.navigateur.version}, playwright-core ${r.navigateur.playwright_core}${r.options.sans_tete ? ', sans fenêtre' : ''}${r.options.mutations_autorisees ? ' ; mutations autorisées hors du poste' : ''}`);
  if (r.navigateur.avertissement) l.push(`- **Compatibilité** : ${r.navigateur.avertissement}`);
  if (r.options.trace) l.push('- **Trace** : `trace.zip` contient les cookies et les en-têtes de la session ; elle reste sur le poste et ne se partage pas.');
  for (const j of r.jeux) {
    l.push('', r.jeux.length > 1 ? `## Jeu ${j.numero} : ${Object.entries(j.valeurs).map(([k, v]) => `${k} = ${v}`).join(', ')}` : '## Étapes', '');
    l.push('| # | Ligne | Étape | Statut | Durée | Détail |', '|---|---|---|---|---|---|');
    for (const e of j.etapes) {
      const details = [e.message, e.capture ? `capture \`${e.capture}\`` : null, e.aria ? `ARIA \`${e.aria}\`` : null, e.telechargement ? `fichier \`${e.telechargement.fichier}\`, ${e.telechargement.octets} octets` : null, e.fragile ? 'cible fragile' : null, ...e.console.map((c) => `console : ${c}`), ...e.erreurs_page.map((c) => `erreur de la page : ${c}`), ...e.reponses.map((c) => `réponse ${c}`)].filter(Boolean);
      l.push(`| ${e.numero} | ${e.ligne ?? ''} | ${echapper(e.resume)} | ${STATUT[e.statut]} | ${e.statut === 'non_jouee' ? '' : `${e.duree_ms} ms`} | ${echapper(details.join(' ; '))} |`);
    }
  }
  if (r.origines_bloquees.length) {
    l.push('', '## Origines bloquées', '', 'Requêtes interrompues avant chargement : ces origines ne sont pas déclarées par le scénario. Une origine légitime s\'ajoute au texte de départ, puis à la traduction ratifiée.', '');
    for (const o of r.origines_bloquees) l.push(`- ${o.origine} : ${o.requetes} requête${o.requetes > 1 ? 's' : ''}`);
  }
  if (r.cibles_fragiles.length) {
    l.push('', '## Cibles fragiles', '', 'Désignées par un sélecteur CSS ou un rang : une cible par rôle et nom, libellé ou texte suit mieux l\'écran.', '');
    for (const c of r.cibles_fragiles) l.push(`- \`${c}\``);
  }
  return `${l.join('\n')}\n`;
}

/** Écrit rapport.json et rapport.md dans le dossier de résultats. */
export function ecrireRapport(dossier, rapport) {
  writeFileSync(join(dossier, 'rapport.json'), `${JSON.stringify(rapport, null, 2)}\n`);
  writeFileSync(join(dossier, 'rapport.md'), rapportMarkdown(rapport));
}
```
<<<FIN modules/preuves/SKILL.md>>>

<<<FICHIER modules/designer/SKILL.md>>>
---
name: designer
description: Désignation d'une cible à la souris (designer.mjs ouvre la page dans le navigateur du poste sur le profil dédié, chaque clic du développeur rend la cible de l'élément au format du scénario par la meilleure stratégie que propose Playwright avec pickLocator, sans actionner la page ; conversion de la notation de Playwright en cible, formes non convertibles ; fin à la fermeture de la fenêtre ou au nombre maximal), source de scripts/designer.mjs. À lire pour écrire une cible qu'on ne sait pas nommer.
dimensions: [D9]
status: active
---

# Module `designer` (D9)

Phase 7E couverte : Engendrent.

## 1. Usage

```bash
node <skill>/scripts/designer.mjs http://127.0.0.1:4200/clients --profil demo
```

La page s'ouvre dans la fenêtre du navigateur du poste, sur le profil donné (`defaut` sinon) : une page protégée s'affiche avec la session du profil. Le développeur survole les éléments, que Playwright surligne, et clique celui qu'il veut ; la cible s'affiche aussitôt :

```text
cible = { role = "link", nom = "Nouveau client" }
cible = { role = "button", dans = { role = "row", nom = "Martin Lyon Supprimer" } }
```

Il recommence pour un autre élément, et ferme la fenêtre pour terminer ; `--max` borne le nombre de cibles, 10 par défaut, 50 au plus.

## 2. Aucune action sur la page (D9.INV-1)

La désignation passe par `page.pickLocator()` de Playwright : pendant la désignation, le clic du développeur sélectionne l'élément et n'atteint pas la page. Un lien désigné ne s'ouvre pas, un bouton désigné ne déclenche rien. Le skill ne fait aucun geste dans la page. Pour atteindre un écran plus loin, le développeur y navigue lui-même entre deux désignations.

## 3. Conversion

Playwright rend l'élément dans la notation de ses localisateurs, avec la meilleure stratégie qu'il trouve. Le skill la convertit en cible (module `cibles`) :

| Notation de Playwright | Cible |
|---|---|
| `getByRole('button', { name: 'Enregistrer' })` | `{ role = "button", nom = "Enregistrer" }` |
| `getByLabel('Nom')`, `getByText(…)`, `getByPlaceholder(…)`, `getByAltText(…)`, `getByTitle(…)` | `libelle`, `texte`, `placeholder`, `alt`, `titre` |
| `getByTestId('valider')` | `{ testid = "valider" }` |
| `locator('#principal')` | `{ css = "#principal" }`, fragile |
| un localisateur suivi d'un autre | le second `dans` le premier |
| `.nth(1)`, `.first()` | `rang = 2`, `rang = 1`, fragile |
| `{ exact: true }` | `exact = true` |
| nom en expression régulière sans métacaractère | son texte |

Une forme que le scénario n'exprime pas, filtre, dernier élément, expression régulière, plus de trois niveaux, est signalée non convertible, avec la notation de Playwright, et s'écrit à la main :

```text
# non convertible : getByRole('row').filter({ hasText: 'Martin' }) (à écrire à la main)
```

## 4. Contrôle de sortie

- Deux clics simulés sur l'application de démonstration rendent deux cibles, un lien par son rôle et son nom, un bouton d'une ligne avec `dans` ; la page n'a pas changé d'adresse et rien n'a été supprimé (module `recette`, R13).
- Chaque notation de Playwright du § 3 se convertit, et chaque forme non convertible est signalée (R4).

## 5. Source `scripts/designer.mjs`

<!-- fichier : scripts/designer.mjs -->
```javascript
#!/usr/bin/env node
// scenario-playwright 1.1.1 : désigner une cible à la souris, pour l'écrire dans un scénario.
//
// Usage : node <dossier du skill>/scripts/designer.mjs <adresse> [--profil nom] [--max n]
// Ouvre la page dans la fenêtre du navigateur du poste, sur le profil dédié : chaque clic du
// développeur sur un élément rend sa cible au format du scénario, par la meilleure stratégie que
// propose Playwright, ou la signale non convertible. Le skill n'agit pas sur la page (D9.INV-1) :
// le clic de désignation ne la déclenche pas. Fermer la fenêtre termine ; --max borne le nombre de
// cibles (10 par défaut). Code 0, ou 2 si l'adresse ou le navigateur sont refusés.
import { pathToFileURL } from 'node:url';
import { cibleDepuisLocator, cibleToml } from './cibles.mjs';
import { dossierProfil, lireReglages, ouvrirNavigateur } from './session.mjs';
import { origineDe, RE_PROFIL } from './texte.mjs';

const USAGE = 'Usage : node scripts/designer.mjs <adresse> [--profil nom] [--max n]';

/**
 * Désignation sur une page ouverte : jusqu'à `max` clics, chacun rendu à `surCible` sous la forme
 * { locator: texte de Playwright, cible: cible du skill ou null }. S'arrête à la fermeture de la page.
 */
export async function designer(page, { max = 10, surCible = () => {} } = {}) {
  const rendues = [];
  while (rendues.length < max && !page.isClosed()) {
    let locator;
    try {
      locator = await page.pickLocator();
    } catch {
      break;
    }
    const texte = String(locator);
    const r = { locator: texte, cible: cibleDepuisLocator(texte) };
    rendues.push(r);
    surCible(r);
  }
  return rendues;
}

export async function main(args, env = process.env) {
  let adresse = null;
  let profil = 'defaut';
  let max = 10;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--profil') profil = args[++i];
    else if (a === '--max') max = Number(args[++i]);
    else if (a.startsWith('-')) { console.error(`ERREUR option inconnue : ${a}\n${USAGE}`); return 2; }
    else adresse = a;
  }
  if (!adresse || origineDe(adresse) === null) { console.error(`ERREUR adresse http ou https attendue\n${USAGE}`); return 2; }
  if (!RE_PROFIL.test(profil ?? '')) { console.error('ERREUR profil invalide (minuscules, chiffres, - et _)'); return 2; }
  if (!Number.isInteger(max) || max < 1 || max > 50) { console.error('ERREUR --max attend un nombre de 1 à 50'); return 2; }
  const { reglages, erreurs } = lireReglages(env);
  if (erreurs.length) { for (const e of erreurs) console.error(`ERREUR ${e}`); return 2; }
  let contexte;
  try {
    contexte = await ouvrirNavigateur({ canal: reglages.canal, profil: dossierProfil(reglages, profil) });
  } catch (e) {
    console.error(`ERREUR navigateur ${reglages.canal} impossible à lancer : ${String(e.message).split('\n')[0]}`);
    return 2;
  }
  try {
    const page = contexte.pages()[0] ?? await contexte.newPage();
    await page.goto(adresse, { waitUntil: 'load' });
    console.log(`Cliquez sur un élément de la fenêtre pour obtenir sa cible ; fermez la fenêtre pour terminer (${max} au plus).`);
    await designer(page, {
      max,
      surCible: ({ locator, cible }) => console.log(cible ? `cible = ${cibleToml(cible)}` : `# non convertible : ${locator} (à écrire à la main)`),
    });
  } finally {
    await contexte.close().catch(() => {});
  }
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (e) => { console.error(`ERREUR interne : ${e.stack ?? e}`); process.exitCode = 2; });
}
```
<<<FIN modules/designer/SKILL.md>>>

<<<FICHIER modules/agent/SKILL.md>>>
---
name: agent
description: Agent pilote-scenario et commandes de Gemini CLI (sous-agent local qui importe les scénarios d'une demande Jira, compare avant de remplacer et ne remplace qu'avec l'accord du développeur, traduit un texte de départ sur le squelette, présente le plan et attend la ratification, joue le scénario dans une fenêtre visible, relaie les étapes à la main sans jamais demander d'identifiant, demande l'accord avant --autoriser-mutations, rend le bilan du rapport et propose les corrections ; installation par installer.mjs ou à la main avec <DOSSIER_DU_SKILL> ; scénarios A1 à A8 à rejouer avec le développeur ; commandes /scenario:importer, /scenario:traduire, /scenario:jouer et /scenario:designer), sources de agent/pilote-scenario.md et commandes/scenario/*.toml.
dimensions: [D10]
status: active
---

# Module `agent` (D10)

Phases 7E couvertes : Expression et Environnement.

## 1. Rôle

L'agent `pilote-scenario` met le skill en œuvre pour le développeur : il importe les scénarios d'une demande Jira, traduit un texte de départ, fait ratifier la traduction, joue le scénario et rend le bilan. Il ne décide de rien à la place du développeur : la lecture des commentaires, le remplacement d'un texte importé, la ratification, l'autorisation des mutations hors du poste et toute correction lui reviennent. Dans la session principale de Gemini CLI, les commandes `/scenario:importer`, `/scenario:traduire`, `/scenario:jouer` et `/scenario:designer` activent le skill et suivent le même protocole.

## 2. Installation

Dans Gemini CLI, depuis un clone du dépôt Agent2Prompt, `node installer.mjs` installe le skill, copie l'agent dans `~/.gemini/agents/pilote-scenario.md`, avec le chemin du skill installé à la place de `<DOSSIER_DU_SKILL>`, et les quatre commandes dans `~/.gemini/commands/scenario/`. Une session ouverte les recharge par `/agents reload` et `/commands reload`.

À la main, avec l'accord du développeur : copier `agent/pilote-scenario.md` dans le dossier des sous-agents de l'hôte, en remplaçant `<DOSSIER_DU_SKILL>` par le chemin absolu du dossier du skill, et `commandes/scenario/*.toml` dans `commands/scenario/` de sa configuration.

## 3. Protocole

**Importer** (D10.INV-4) :

1. demander au développeur l'adresse de la demande, ou sa page enregistrée, l'adresse de l'application, et s'il y a lieu ses origines, son profil et le dossier des scénarios ;
2. lancer `importer.mjs` ; par l'adresse, relayer le message « À VOUS » : le développeur se connecte à Jira lui-même ; ne lire les commentaires (`--commentaires`) qu'à sa demande ;
3. rendre le bilan : textes écrits, inchangés, refusés avec leur motif, doublons, conflits, disparus, limites ; un scénario refusé se corrige dans Jira, pas par l'agent dans un texte ;
4. pour un réimport, lancer `--comparer` d'abord, présenter les différences, et n'ajouter `--remplacer` qu'avec l'accord du développeur ; signaler ensuite les textes retouchés gardés à côté et les traductions périmées ;
5. chaque texte écrit suit ensuite le protocole « Traduire » ; les marques qui manquent se proposent au développeur, qui les ajoute de préférence dans Jira.

**Traduire** (D10.INV-1) :

1. vérifier le texte ; un texte non conforme se rend au développeur, erreurs ligne par ligne, sans être corrigé par l'agent ;
2. écrire le squelette par `traduire.mjs`, et ne rien changer de ce qui précède les étapes ;
3. compléter chaque étape (modules `actions` et `cibles`, phrases conseillées du module `texte`, § 9) ; ajouter `mutation` à une phrase qui modifie des données sans marque, et le dire ;
4. obtenir `ok` de `verifier.mjs --plan`, présenter le plan, ligne du texte par ligne du texte, avec les étapes de mutation et les étapes à la main, et attendre la ratification explicite.

**Jouer** (D10.INV-2) :

1. vérifier le scénario ;
2. devant une étape de mutation et une origine hors du poste, demander l'accord du développeur pour cette exécution ; sans accord, ne pas jouer ;
3. jouer dans une fenêtre visible ; relayer chaque « À VOUS », sans demander ni saisir d'identifiant ;
4. rendre le bilan de `rapport.json` : statut, échecs et messages, captures, erreurs relevées, origines bloquées, cibles fragiles, avertissement de compatibilité.

**Après un échec** (D10.INV-3) : proposer une correction rattachée à sa ligne du texte, une cible plus précise d'après les éléments cités, ou une désignation à la souris ; ne l'écrire qu'avec l'accord du développeur, puis faire ratifier l'étape changée. Une origine bloquée légitime s'ajoute au texte par le développeur, et la traduction se refait.

## 4. Interdits

- Aucun identifiant, mot de passe ou jeton demandé, lu ou saisi.
- Aucune modification du texte de départ ni d'un scénario ratifié sans accord.
- `--autoriser-mutations` seulement avec l'accord explicite du développeur, pour une exécution.
- `--remplacer` seulement avec l'accord du développeur, `--commentaires` seulement à sa demande ; aucun texte supprimé parce que son scénario a disparu de Jira ; rien d'écrit dans Jira.
- `--trace` seulement sur demande, avec l'avertissement.
- Aucun résultat, capture, téléchargement, page Jira enregistrée ni profil déplacé, partagé ou versionné ; aucun commit.
- Aucune adaptation des scripts.

## 5. Scénarios

À rejouer avec le développeur avant que l'agent joue un scénario sur une application réelle, sur l'application de démonstration de la recette ou sur une application du poste :

| ID | Situation | Conduite attendue | Invariants |
|---|---|---|---|
| A1 | texte conforme à traduire | squelette, étapes complétées, plan présenté ligne par ligne, attente de la ratification ; rien n'est joué avant | D10.INV-1, D3.INV-5 |
| A2 | texte non conforme | erreurs rendues avec leur ligne ; le texte n'est pas corrigé par l'agent | D10.INV-3, D2.INV-1 |
| A3 | étape à la main pour une connexion | message relayé ; le développeur se connecte dans la fenêtre ; aucun identifiant demandé | D10.INV-2, D6.INV-2 |
| A4 | mutation sur une origine hors du poste | accord demandé avant `--autoriser-mutations` ; sur un refus, rien n'est joué | D10.INV-2, D7.INV-2 |
| A5 | cible ambiguë | bilan avec les éléments trouvés ; correction proposée, écrite après accord, étape ratifiée | D10.INV-3, D4.INV-2 |
| A6 | origine bloquée nécessaire à l'application | origine signalée ; ajoutée au texte par le développeur ; traduction refaite et ratifiée | D7.INV-1, D3.INV-2 |
| A7 | import par l'adresse d'une demande, session Jira absente | message « À VOUS » relayé ; le développeur se connecte ; textes écrits et bilan rendu ; commentaires non lus sans sa demande ; un refus renvoyé à Jira | D10.INV-4, D16.INV-1, D16.INV-2, D16.INV-3 |
| A8 | réimport après un changement dans Jira, texte retouché depuis l'import | `--comparer` d'abord, différences présentées ; `--remplacer` après accord seulement ; texte retouché gardé à côté, traduction périmée refaite et ratifiée | D10.INV-4, D16.INV-5, D3.INV-2 |

## 6. Définition du sous-agent

<!-- fichier : agent/pilote-scenario.md -->
```markdown
---
name: pilote-scenario
description: Pilote de scénarios côté utilisateur (skill scenario-playwright 1.1.1). À solliciter pour importer les scénarios Gherkin d'une demande Jira en textes de départ, pour traduire un texte de scénario (.scenario, inspiré de Gherkin) en scénario TOML exécutable, pour jouer un scénario dans le Chrome du poste comme un utilisateur et en rendre le bilan, ou pour désigner une cible à la souris. Ne saisit aucun identifiant ; fait ratifier chaque traduction ; demande avant toute exécution qui modifie des données hors du poste.
kind: local
tools:
  - run_shell_command
  - read_file
  - write_file
  - replace
  - glob
temperature: 0.2
max_turns: 30
---

# Pilote de scénarios

Tu importes de Jira, traduis, fais ratifier et joues des scénarios côté utilisateur avec les scripts du skill scenario-playwright. Tu es un sous-agent : tu ne vois pas le contexte de la session qui t'appelle ; le développeur te donne le fichier et l'intention.

## Les scripts

    node "<DOSSIER_DU_SKILL>/scripts/importer.mjs" <page.mhtml | adresse de la demande> --adresse <url> [--origines o1,o2] [--profil nom] [--dossier dossier] [--commentaires] [--remplacer | --comparer] [--delai-connexion s]
    node "<DOSSIER_DU_SKILL>/scripts/traduire.mjs" <texte.scenario> [--remplacer]
    node "<DOSSIER_DU_SKILL>/scripts/verifier.mjs" <fichier.scenario | fichier.toml>... [--plan] [--param nom=valeur]
    node "<DOSSIER_DU_SKILL>/scripts/jouer.mjs" <scénario.toml> [--param nom=valeur] [--jeu n] [--resultats dossier] [--sans-tete] [--ralenti ms] [--trace] [--autoriser-mutations]
    node "<DOSSIER_DU_SKILL>/scripts/designer.mjs" <adresse> [--profil nom] [--max n]

`<DOSSIER_DU_SKILL>` est remplacé, dans la copie installée de ce fichier, par le chemin absolu du dossier du skill. Codes de sortie : 0 réussi, 1 une étape a échoué, 2 refusé avant toute action dans le navigateur. Pour `importer.mjs` : 0 tout est écrit ou inchangé (avec `--comparer` : aucune différence), 1 un scénario n'est pas écrit (avec `--comparer` : une différence), 2 refusé avant toute écriture.

## Importer les scénarios d'une demande Jira

1. Le développeur donne l'adresse de la demande, ou sa page enregistrée en MHTML (par lui, par capture-sprint-jira, ou celle remise à agent-tdd-jira), et l'adresse de l'application, celle de la ligne « Adresse : » des textes ; demande-lui les origines et le profil quand l'application en a besoin, et le dossier des scénarios.
2. `importer.mjs <page.mhtml | adresse> --adresse <url> --dossier <dossier>`. Avec une adresse, la demande s'ouvre dans une fenêtre, sur le profil dédié à Jira : relaie le message « À VOUS » ; le développeur se connecte lui-même. La page est enregistrée dans `<dossier>/jira/` : elle reste sur le poste.
3. Seuls la description et les champs de texte sont lus. Les commentaires ne se lisent qu'à la demande du développeur : `--commentaires`.
4. Rends le bilan : textes écrits, inchangés, refusés avec leur motif, doublons, conflits, disparus, limites. Un scénario refusé se corrige dans Jira : ne l'écris pas toi-même dans un texte.
5. Pour un réimport, lance `--comparer` d'abord et présente les différences. N'ajoute `--remplacer` qu'avec l'accord du développeur ; signale ensuite les textes retouchés depuis l'import, gardés à côté (`.avant-<horodatage>`), et les traductions devenues périmées, à refaire et à faire ratifier.
6. Chaque texte écrit suit ensuite le chemin d'un texte écrit à la main : `verifier.mjs`, puis la traduction et sa ratification. Les marques (création), (modification), (suppression) et (à la main) manquent souvent aux scénarios de Jira : propose-les au développeur, qui les ajoute de préférence dans Jira (un réimport garde alors le texte à jour), sinon dans le texte.

## Traduire un texte

1. `verifier.mjs <texte.scenario>` : le texte doit être conforme. Sinon, rends au développeur ses erreurs, ligne par ligne, sans corriger le texte toi-même.
2. `traduire.mjs <texte.scenario>` écrit le squelette `<texte>.toml` à côté du texte : structure recopiée du texte, empreinte, un bloc [[etapes]] par étape du texte. Ne change aucun champ placé avant le premier bloc [[etapes]].
3. Complète chaque bloc : une action du jeu fermé et ses champs, selon le module actions du skill. Une phrase peut donner plusieurs étapes : recopie le bloc avec la même ligne, dans l'ordre du texte. Chaque variable `<nom>` de la phrase se retrouve en `${nom}`. Désigne les éléments comme un utilisateur : rôle et nom accessible d'abord, puis libellé, texte, placeholder, identifiant de test ; `css` et `rang` en dernier recours.
4. Une étape `main` ne vient que d'une ligne marquée « (à la main) ». Garde `mutation` sur chaque étape qui crée, modifie ou supprime des données ; ajoute-la quand une phrase non marquée le fait, et dis-le au développeur.
5. `verifier.mjs <texte>.toml --plan` doit répondre `ok`. Présente alors le plan au développeur, ligne du texte par ligne du texte, avec les étapes qui modifient des données et les étapes à la main, et attends sa ratification explicite. Sans ratification, rien ne se joue.

## Jouer un scénario

1. `verifier.mjs <scénario.toml>` d'abord.
2. Si la vérification signale des étapes qui modifient des données et des origines hors du poste, demande au développeur s'il autorise, pour cette exécution, ces modifications sur ces origines. Avec son accord explicite seulement, ajoute `--autoriser-mutations`.
3. Lance `jouer.mjs` dans une fenêtre visible : jamais `--sans-tete` avec une étape à la main. Pour une étape à la main, relaie le message « À VOUS » : le développeur agit lui-même dans la fenêtre, par exemple pour se connecter. Tu ne lui demandes jamais ses identifiants et ne les saisis jamais.
4. Lis `rapport.json` dans le dossier de résultats cité en fin de sortie. Rends le bilan : statut, chaque étape en échec avec son message, les captures (chemins), les erreurs de console, les erreurs de la page et les réponses en erreur, les origines bloquées, les cibles fragiles, et l'avertissement de compatibilité s'il y en a un.

## Après un échec

- Cible ambiguë : le message cite les éléments trouvés et leur localisateur ; propose une cible plus précise (nom exact, `dans`). Cible absente : propose au développeur `designer.mjs`, pour la désigner à la souris.
- Une correction du scénario se propose avec la ligne du texte qu'elle traduit. Ne l'écris qu'avec l'accord du développeur, puis repasse `verifier.mjs --plan` et fais ratifier l'étape changée.
- Une origine bloquée légitime s'ajoute au texte de départ, par le développeur. La traduction est alors périmée par l'empreinte : retraduis, et fais ratifier.

## Interdits

- Ne demande, ne lis et ne saisis aucun identifiant, mot de passe ou jeton.
- Ne modifie ni le texte de départ, ni un scénario ratifié, sans l'accord du développeur.
- Ne passe `--autoriser-mutations` qu'avec l'accord explicite du développeur pour cette exécution.
- Ne passe `--remplacer` à `importer.mjs` qu'avec l'accord du développeur, et `--commentaires` qu'à sa demande ; ne supprime aucun texte dont le scénario a disparu de Jira : signale-le.
- N'active `--trace` que sur demande, en prévenant que la trace contient les cookies de la session et reste sur le poste.
- Ne déplace, ne partage ni ne versionne les résultats, les captures, les téléchargements, les pages Jira enregistrées ou les profils ; ne fais aucun commit.
- N'adapte pas les scripts du skill : un besoin nouveau se signale au développeur.
```

## 7. Commandes de Gemini CLI

<!-- fichier : commandes/scenario/importer.toml -->
```toml
description = "Importe les scénarios Gherkin d'une demande Jira en textes de départ (.scenario), sans IA (skill scenario-playwright 1.1.1)"
prompt = """
Active le skill scenario-playwright, puis importe les scénarios de la demande Jira suivante : {{args}}
Une adresse de demande ouvre Jira dans la fenêtre, sur le profil dédié : relaie le message « À VOUS », sans jamais demander ni saisir d'identifiant. Une page enregistrée en MHTML se lit sans navigateur. --adresse de l'application est requise ; les commentaires ne se lisent qu'avec --commentaires, à la demande du développeur.
Pour un réimport, --comparer d'abord ; --remplacer seulement avec l'accord du développeur. Rends le bilan : textes écrits, inchangés, refusés et leur motif, conflits, disparus, limites. Propose ensuite de vérifier et de traduire chaque texte écrit.
"""
```

<!-- fichier : commandes/scenario/traduire.toml -->
```toml
description = "Traduit un texte de scénario (.scenario) en scénario TOML exécutable, puis le présente à la ratification (skill scenario-playwright 1.1.1)"
prompt = """
Active le skill scenario-playwright, puis traduis le texte de scénario suivant : {{args}}
Suis la traduction décrite au module scenario : texte vérifié, squelette écrit par traduire.mjs, étapes complétées, verifier.mjs --plan conforme.
Présente le plan ligne du texte par ligne du texte, avec les étapes qui modifient des données et les étapes à la main, puis attends la ratification du développeur : rien ne se joue avant.
"""
```

<!-- fichier : commandes/scenario/jouer.toml -->
```toml
description = "Joue un scénario TOML dans le Chrome du poste, comme un utilisateur, et rend le bilan (skill scenario-playwright 1.1.1)"
prompt = """
Active le skill scenario-playwright, puis joue le scénario : {{args}}
verifier.mjs d'abord. Demande l'accord explicite du développeur avant --autoriser-mutations. Fenêtre visible ; relaie chaque message « À VOUS » sans jamais demander ni saisir d'identifiant.
Rends le bilan du rapport.json : statut, étapes en échec et leur message, captures, erreurs relevées, origines bloquées, cibles fragiles, avertissement de compatibilité.
"""
```

<!-- fichier : commandes/scenario/designer.toml -->
```toml
description = "Ouvre une page et rend la cible de chaque élément que le développeur désigne à la souris (skill scenario-playwright 1.1.1)"
prompt = """
Active le skill scenario-playwright, puis lance designer.mjs sur l'adresse suivante : {{args}}
Le développeur clique lui-même les éléments dans la fenêtre ; rends chaque cible au format du scénario. Une cible non convertible s'écrit à la main, avec lui.
"""
```

## 8. Contrôle de sortie

- Les fichiers installés ont les empreintes de la table du module `execution`, § 8, avant le remplacement de `<DOSSIER_DU_SKILL>` dans la copie du sous-agent.
- Le sous-agent se charge dans Gemini CLI sans erreur, avec ses cinq outils (recette de l'installateur du dépôt Agent2Prompt).
- A1 à A8 rejoués : aucune exécution sans ratification (D10.INV-1), aucun identifiant et aucune autorisation sans accord (D10.INV-2), aucune correction sans accord (D10.INV-3), aucun remplacement sans accord ni commentaire lu sans demande (D10.INV-4).
<<<FIN modules/agent/SKILL.md>>>

<<<FICHIER modules/recette/SKILL.md>>>
---
name: recette
description: Recette du skill (npm test, scénarios R1 à R21 contre une application de démonstration servie sur 127.0.0.1 sans réseau ni compte, deux origines, WebSocket d'écho, connexion simulée, export CSV, Jira factice à connexion simulée avec des demandes de Jira Cloud et de Jira Data Center et leurs pages MHTML ; profils et résultats temporaires ; navigateur de SCENARIO_PLAYWRIGHT_CANAL ; écran virtuel sous Linux ; bilan attendu ; défauts réintroduits qui font chacun échouer la recette ; recette en intégration continue sous Linux et Windows), sources de tests/application-demo.mjs et tests/run-tests.mjs.
dimensions: [D1, D2, D3, D4, D5, D6, D7, D8, D9, D16]
status: active
---

# Module `recette`

Phase 7E couverte : Évolutif.

## 1. Lancer la recette

```bash
npm test
```

- Depuis le dossier du skill, après `npm ci`. Sous Linux sans écran : `xvfb-run -a npm test` ; le scénario s'y joue dans une fenêtre, comme sur le poste.
- Le navigateur est celui de `SCENARIO_PLAYWRIGHT_CANAL` : Chrome par défaut ; `chromium` après `npx playwright-core install chromium`.
- La recette travaille sur des profils et des dossiers temporaires : les profils et les résultats du dossier du skill ne sont pas touchés. Elle efface son dossier temporaire si tout passe ; sinon, ou avec `GARDER_TMP=1`, elle le garde et en donne le chemin.
- Durée : environ une minute et demie. Garde-fou : une recette bloquée s'arrête d'elle-même au bout de dix minutes, en disant dans quel scénario, son dossier temporaire gardé ; ce dossier est dit dès la première ligne.
- Bilan attendu : `Bilan : 21 scénarios, 279 contrôles, 279 réussis, 0 en échec, 0 sautés`. Là où un serveur ne peut écouter sur 127.0.0.2, deux contrôles de R8 sont sautés.

## 2. L'application de démonstration

`tests/application-demo.mjs` sert, sur `127.0.0.1` et un port libre, sans réseau ni compte, une application et une seconde origine, que les scénarios ne déclarent pas ; la même application est servie sur `127.0.0.2`, origine hors du poste au sens du skill, quand le système le permet. L'application a son propre JavaScript ; le skill n'en exécute aucun.

| Page | Contenu | Sert à |
|---|---|---|
| `/` | titre, liens vers les clients, l'export et la seconde origine | navigation bloquée, origine déclarée |
| `/clients` | tableau des clients avec un bouton « Supprimer » par ligne, menu au survol, liens « Nouveau client » et « Nouveau fournisseur », alerte « Client … créé » | cible ambiguë, `dans`, `survoler`, `nombre`, `contient` |
| `/clients/nouveau` | champs « Nom » (avec placeholder), « Ville » (liste), case « Client actif », pièce jointe, boutons « Enregistrer » et « Archiver » (inactif) ; l'envoi passe par l'API de l'application | `saisir`, `choisir`, `cocher`, `televerser`, `touche`, `actif`, `valeur` |
| `/differe` | texte « Chargement… » puis « Chargé », bouton activé et contenu affiché après 1,2 s | `attendre`, délais |
| `/connexion?auto=<ms>` | pose un cookie de session et passe à `/accueil-connecte` après le délai, comme un développeur qui se connecte | étape à la main, profil |
| `/session` | dit si le cookie de session est présent | profil retrouvé |
| `/export`, `/export.csv` | lien vers un CSV en pièce jointe | `telecharger` |
| `/erreurs` | erreur de console, requête en erreur 500, exception | erreurs relevées |
| `/externe` | image de la seconde origine | requête bloquée |
| `/ws` | WebSocket d'écho vers l'application et vers la seconde origine | WebSocket gardés |
| `/compteur` | bouton « Ajouter » qui incrémente un compteur par l'API | mutation hors du poste |
| autre chemin | page de statut 404 | navigation en échec |

Le même fichier sert un Jira factice, sur une troisième origine, et donne de quoi fabriquer des pages enregistrées :

| Élément | Contenu | Sert à |
|---|---|---|
| `demandesJira()` | DEMO-8, de Jira Cloud : description avec prose, bloc de code Gherkin en français (fonctionnalité étiquetée, contexte, scénario étiqueté, scénario avec une ligne de description, plan de scénario aux colonnes à adapter), ligne d'étape hors d'un scénario ; champ de texte avec un scénario en anglais ; commentaire avec un scénario. DEMO-9, de Jira Data Center : plan de scénario en anglais en paragraphes et tableau HTML, champ « Critères d'acceptation » en français, commentaire | lecture, extraction, import |
| `pageJira(demande)` | la page de la demande, avec les marqueurs de sa variante ; un script de la page contient un faux titre de scénario | marqueurs, zones, scripts écartés |
| `enMhtml(html, …)` | la page enregistrée comme le fait Chrome : en-têtes, frontière, quoted-printable ou base64, jeu de caractères, image | lecture du MHTML |
| `/browse/<CLÉ>` | sans cookie de session, renvoie vers `/login`, dont la page pose le cookie après le délai réglé et revient à la demande, comme un développeur qui se connecte ; formulaire en POST, que le skill ne doit jamais envoyer ; clé inconnue : page sans marqueurs | import par l'adresse, profil dédié, navigation seule |

## 3. Scénarios

| ID | Scénario | Invariants |
|---|---|---|
| R1 | Texte de départ : titre, fonctionnalité et étiquettes, réglages, neuf mots-clés, marques retirées de la phrase, variables, exemples ; même empreinte en CRLF avec BOM et en NFD ; origine de l'adresse par défaut ; dix-neuf textes refusés, chacun à sa ligne, dont `Contexte:` et `Rule:` ; toutes les erreurs levées ensemble ; mots-clés anglais et synonymes français | D2.INV-1, D2.INV-2, D2.INV-3, D2.INV-4 |
| R2 | Scénario TOML : scénario valide et valeurs par défaut ; jeu fermé de treize actions ; trente et un scénarios refusés (format, clés, actions, champs, mutation, délais, cibles, touche, fichiers, critères, `jusqua`, variables, jeux, origines) ; erreur de syntaxe à sa ligne ; erreur qui cite l'étape et ses deux lignes ; ordre `--param`, jeu, `[parametres]`, `$${` littéral ; `--param` et `--jeu` refusés ; fichier à téléverser absent | D3.INV-1, D3.INV-6, D4.INV-1, D4.INV-3, D5.INV-1, D5.INV-5 |
| R3 | Traduction : squelette écrit, écrasement refusé sans `--remplacer` ; structure recopiée, un bloc par étape, marques reportées ; squelette refusé tant qu'une étape reste à compléter ; traduction complétée acceptée ; plan ligne par ligne ; dix-sept écarts relevés (empreinte, texte absent, titre, étiquettes, adresse, origines, profil, paramètres, jeux, ligne manquante, ligne qui n'est pas une étape, ordre, ligne non traduite, mutation perdue, `main` absente ou ajoutée, variable perdue) ; texte et traduction en CRLF | D3.INV-2, D3.INV-3, D3.INV-4, D3.INV-5, D10.INV-1 |
| R4 | Cibles : notation de Playwright de chaque stratégie, de `exact`, `dans` et `rang`, relue en la même cible et réécrite en TOML ; `first()` ; nom en expression régulière simple ; six formes non convertibles ; cibles fragiles | D4.INV-1, D4.INV-3, D9.INV-1 |
| R5 | Exécution complète, vingt-quatre étapes, code 0 : chaque action du jeu fermé, ce que l'application reçoit (nom, ville, case, pièce jointe), rapport à côté du scénario, une capture par vérification et par capture demandée, téléchargement et son empreinte, durées et cibles, cible CSS fragile, navigateur et version, attente arrêtée dès l'état obtenu | D1.INV-2, D1.INV-4, D4.INV-1, D5.INV-1, D5.INV-2, D5.INV-4, D5.INV-5, D6.INV-1, D8.INV-1, D8.INV-2 |
| R6 | Échecs : cible ambiguë sans action et éléments cités, code 1 ; étape suivante non jouée ; capture et instantané ARIA ; vérifications qui se poursuivent après une vérification échouée, attendu et obtenu, bilan ; cible absente au délai de l'étape ; page en 404 | D4.INV-2, D5.INV-2, D5.INV-3, D5.INV-4, D8.INV-2, D1.INV-4 |
| R7 | Origines : image d'une origine non déclarée bloquée, page servie ; WebSocket déclaré relayé, WebSocket non déclaré fermé ; navigation vers une origine non déclarée en échec ; origine comptée dans le rapport et citée en fin de sortie ; origine déclarée qui passe | D7.INV-1 |
| R8 | Mutations hors du poste : origines du poste ; refus avant le navigateur sans `--autoriser-mutations`, sans rien écrire ; exécution avec l'option, notée au rapport ; garde à l'étape par le moteur appelé directement (E3) | D7.INV-2 |
| R9 | Étape à la main : reprise à l'adresse atteinte, message affiché ; `jusqua` par une cible ; délai dépassé ; refus sans fenêtre | D6.INV-3 |
| R10 | Paramètres et jeux : deux jeux, chacun avec ses valeurs ; `--param` qui l'emporte ; captures préfixées par le jeu ; `--param` inconnu ; `--jeu 2` ; `--jeu 3` refusé | D3.INV-6 |
| R11 | Profil et réglages : connexion à la main dans un profil, session retrouvée, profil séparé ; défauts, variable vide, valeurs invalides, chemins des profils ; canal invalide refusé avant le navigateur ; délai du réglage | D6.INV-2, D1.INV-3 |
| R12 | Lignes de commande : dix appels refusés avec le code 2, `verifier.mjs` sur un texte et un scénario, un fichier refusé suffit, note des mutations hors du poste | D1.INV-4 |
| R13 | Désignation : deux clics simulés, deux cibles, un lien et un bouton d'une ligne avec `dans`, page non actionnée, cible au format du scénario | D9.INV-1 |
| R14 | Compatibilité : `playwright-core` 1.65.1 et Chromium 159 lus dans le paquet ; écarts sans avertissement, ancien, plus récent, illisible ; avertissement du rapport | D6.INV-1 |
| R15 | Dépendance unique à version exacte, Node 22, `.gitignore`, aucune exécution de code dans la page dans les sources | D1.INV-1, D1.INV-2, D5.INV-1 |
| R16 | Points d'extension : champs du rapport, de ses étapes, du navigateur, du scénario et des options (E1) ; format et vocabulaire communs avec Agent2Test (E2) ; fonctions exportées du moteur, de la session et du scénario (E3) | |
| R17 | Preuves : erreur de console, exception de la page et réponse 500 relevées, sans échec de l'étape ; trace avec `--trace` et son avertissement ; aucune trace sans l'option | D8.INV-2, D7.INV-3 |
| R18 | Page Jira enregistrée : MHTML en quoted-printable et UTF-8, en base64 et ISO-8859-1 ; fichier qui n'est pas un MHTML refusé ; Jira Cloud et Data Center : variante, clé, résumé, description et champs de texte, commentaires seulement sur demande, avec auteur et date ; lignes du HTML ; page qui n'est pas une demande refusée ; commentaires repliés signalés ; clé lue dans l'adresse | D16.INV-1, D16.INV-2 |
| R19 | Scénarios de la demande : ordre de la page et zones ; contexte reporté, ligne de description ignorée ; mots-clés recopiés en français et en anglais ; étiquettes de la fonctionnalité et de la règle ; étiquettes gardées ou attribuées ; ligne d'étape hors d'un scénario ; cinq refus motivés ; doublon ; texte importé valide, colonnes adaptées, provenance, relue, retouche détectée ; empreinte Jira stable ; texte invalide non écrit ; réglages contrôlés | D16.INV-2, D16.INV-3, D16.INV-4 |
| R20 | `importer.mjs` sur des pages enregistrées : quatre textes écrits, nommés par leur étiquette ; limite signalée ; textes vérifiés, traduits, et l'un joué jusqu'au bout ; réimport sans réécriture ; `--comparer` identique ; après changements dans Jira : nouveau, modifié, identique, conflit, refusé, disparu, sans rien écrire ; étiquette reprise par le titre ; import sans `--remplacer`, puis avec : retouche gardée à côté, texte écrit à la main jamais remplacé, traduction périmée ; commentaires sur demande ; Jira Data Center ; demande sans scénario ; huit refus avant toute écriture | D16.INV-3, D16.INV-4, D16.INV-5, D16.INV-6, D3.INV-2 |
| R21 | `importer.mjs` par l'adresse : message « À VOUS », connexion simulée, code 0 ; page enregistrée dans `jira/` et relisible ; textes et provenance ; requêtes GET seulement ; profil dédié ; session retrouvée sans message ; demande jamais affichée refusée au délai ; profil Jira invalide | D16.INV-1, D16.INV-6 |

## 4. Contrôle de la recette elle-même

Vingt-neuf défauts, réintroduits un à un dans le code, font chacun échouer la recette par le scénario attendu (essai du 20 novembre 2026, Node 22.23.4, Chromium 159, rejoué en entier en 1.1.1) :

| ID | Défaut réintroduit | Scénarios en échec | Contrôles en échec |
|---|---|---|---|
| M1 | La garde des origines laisse passer toute requête | R7 | 2 |
| M2 | Les WebSocket ne sont pas gardés | R7 | 3 |
| M3 | Pas de refus avant le navigateur d'un scénario qui modifie des données hors du poste | R8 | 1 |
| M4 | Pas de garde à l'étape de mutation | R8 | 1 |
| M5 | L'empreinte du texte n'est pas contrôlée | R3, R20 | 2 |
| M6 | Une ligne du texte peut rester sans étape | R3 | 1 |
| M7 | Une marque de mutation du texte peut se perdre | R3 | 1 |
| M8 | Une vérification échouée arrête les vérifications suivantes | R6 | 3 |
| M9 | Une étape échouée n'arrête pas la suite | R6, R7 | 2 |
| M10 | Délai de 30 s pour toute étape, sans tenir compte des réglages | R6, R9, R11 | 4 |
| M11 | Une étape à la main est acceptée sans fenêtre | R9 | 1 |
| M12 | Une variable non déclarée est acceptée | R2 | 1 |
| M13 | --param ne l'emporte plus sur [parametres] ni sur le jeu | R2, R10 | 3 |
| M14 | Un fichier absolu ou hors du dossier du scénario est accepté | R2 | 2 |
| M15 | Une cible ambiguë agit sur le premier élément | R5, R6 | 10 |
| M16 | Pas de capture pour une vérification | R5, R10 | 2 |
| M17 | Navigateur ancien de trois versions accepté sans avertissement | R14 | 1 |
| M18 | Champ origines_bloquees du rapport renommé | R5 | 5 |
| M19 | Une étape main est acceptée sur une ligne non marquée | R3 | 1 |
| M20 | La désignation clique l'élément désigné | R13 | 1 |
| M21 | Les commentaires de Jira Cloud sont lus sans --commentaires | R18, R20 | 8 |
| M22 | Un texte modifié dans Jira est remplacé sans --remplacer | R20 | 2 |
| M23 | Un texte écrit à la main est remplacé par un texte importé du même nom | R20 | 3 |
| M24 | Le mot-clé anglais Given n'est pas reconnu | R1, R19, R20 | 4 |
| M25 | Le contexte de la fonctionnalité n'est pas reporté dans ses scénarios | R19 | 6 |
| M26 | L'étiquette attribuée par un import précédent n'est pas reprise par le titre | R20, R21 | 7 |
| M27 | Un texte retouché depuis l'import est remplacé sans être gardé | R20 | 1 |
| M28 | Une table de données d'étape est ignorée au lieu d'être refusée | R19, R20 | 4 |
| M29 | L'import par l'adresse saisit et envoie le formulaire de connexion | R21 | 1 |

Chaque défaut a été retiré après son essai ; la recette du code publié passe en entier.

## 5. Recette en intégration continue

Le workflow `.github/workflows/recette-scenario-playwright.yml` du dépôt Agent2Prompt suit le chemin de l'IA du développeur : il matérialise la transmission courante, extrait les fichiers par la commande du module `execution`, § 8, sous bash et sous CMD, installe la dépendance par `npm ci`, puis lance la recette, sous `xvfb-run` sur `ubuntu-latest` et directement sur `windows-latest`, avec Node 22, 24 et 26.13.0 et le Chrome stable des images GitHub. La sortie de la recette s'y affiche au fil de l'eau, et un pas de recette bloqué s'arrête au bout de douze minutes. Une recette en échec y laisse son dossier temporaire en artefact, sans les profils du navigateur : sortie de la recette, rapports, captures et instantanés ARIA, gardés sept jours.

## 6. Sources

### `tests/application-demo.mjs`

<!-- fichier : tests/application-demo.mjs -->
```javascript
// scenario-playwright 1.1.1 : application de démonstration de la recette, servie sur 127.0.0.1 sans réseau.
//
// Deux origines : l'application, et une « autre » origine, que les scénarios ne déclarent pas, pour la
// garde des origines. Les pages couvrent chaque action du jeu fermé : liste et formulaire de clients,
// menu au survol, contenu différé, connexion simulée pour une étape à la main, export CSV, erreurs de
// console et réponses en erreur, WebSocket d'écho. Un Jira factice, à connexion simulée, sert des
// demandes avec les marqueurs de Jira Cloud et de Jira Data Center. L'application a son propre
// JavaScript ; le skill, lui, n'en exécute aucun dans la page.
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import http from 'node:http';
import { URL } from 'node:url';

const page = (titre, corps, script = '') => `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>${titre}</title>
<style>body{font-family:sans-serif;margin:2rem} .menu ul{display:none} .menu:hover ul{display:block} [hidden]{display:none!important}</style>
</head><body>${corps}${script ? `<script>${script}</script>` : ''}</body></html>`;

/** Serveur WebSocket d'écho minimal : poignée de main, puis chaque message texte renvoyé tel quel. */
function accepterWebSocket(req, socket) {
  const cle = req.headers['sec-websocket-key'];
  const accept = createHash('sha1').update(`${cle}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest('base64');
  socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
  socket.on('data', (trame) => {
    const opcode = trame[0] & 0x0f;
    if (opcode === 0x8) { socket.end(Buffer.from([0x88, 0x00])); return; }
    let longueur = trame[1] & 0x7f;
    let decalage = 2;
    if (longueur === 126) { longueur = trame.readUInt16BE(2); decalage = 4; }
    const masque = trame.subarray(decalage, decalage + 4);
    const donnees = Buffer.from(trame.subarray(decalage + 4, decalage + 4 + longueur).map((o, i) => o ^ masque[i % 4]));
    const entete = donnees.length < 126 ? Buffer.from([0x81, donnees.length]) : Buffer.from([0x81, 126, donnees.length >> 8, donnees.length & 0xff]);
    socket.write(Buffer.concat([entete, donnees]));
  });
  socket.on('error', () => {});
}

/**
 * Démarre l'application : rend { base, autre, distante, jira, etat, arreter }. `distante` est la même
 * application servie sur 127.0.0.2, origine hors du poste au sens du skill, ou null si l'adresse
 * n'est pas disponible ; `jira` est le Jira factice.
 */
export async function demarrerApplication() {
  const etat = { clients: [{ nom: 'Dupont', ville: 'Paris' }, { nom: 'Martin', ville: 'Lyon' }], compteur: 0, ajouts: [], jira: demandesJira(), requetesJira: [], connexionJira: 4500 };
  const serveurs = [];
  let autre = '';

  const app = (req, res) => {
    const u = new URL(req.url, 'http://x');
    const html = (titre, corps, script, code = 200, entetes = {}) => { res.writeHead(code, { 'content-type': 'text/html; charset=utf-8', ...entetes }); res.end(page(titre, corps, script)); };
    const json = (obj, code = 200) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };
    const corps = () => new Promise((r) => { let d = ''; req.on('data', (c) => { d += c; }); req.on('end', () => r(d)); });
    switch (u.pathname) {
      case '/':
        return html('Accueil', `<h1>Démonstration</h1><nav><ul><li><a href="/clients">Clients</a></li><li><a href="/export">Export</a></li><li><a href="${autre}/autre">Lien externe</a></li></ul></nav>`);
      case '/clients': {
        const lignes = etat.clients.map((c) => `<tr><td>${c.nom}</td><td>${c.ville}</td><td><button type="button" data-nom="${c.nom}">Supprimer</button></td></tr>`).join('');
        const cree = u.searchParams.get('cree');
        return html('Clients', `<h1>Clients</h1>${cree ? `<p role="alert">Client ${cree} créé</p>` : ''}
          <div class="menu"><button type="button">Menu</button><ul><li><a href="/clients?vue=parametres">Paramètres</a></li></ul></div>
          <p><a href="/clients/nouveau">Nouveau client</a> <a href="/fournisseurs/nouveau">Nouveau fournisseur</a></p>
          <table><caption>Liste des clients</caption><thead><tr><th>Nom</th><th>Ville</th><th>Action</th></tr></thead><tbody>${lignes}</tbody></table>
          <p id="compte">${etat.clients.length} clients</p>`,
        `document.querySelectorAll('button[data-nom]').forEach((b) => b.addEventListener('click', async () => {
           await fetch('/api/clients/' + encodeURIComponent(b.dataset.nom), { method: 'DELETE' });
           location.href = '/clients';
         }));`);
      }
      case '/clients/nouveau':
        return html('Nouveau client', `<h1>Nouveau client</h1><form id="f">
          <p><label for="nom">Nom</label> <input id="nom" name="nom" placeholder="Nom du client"></p>
          <p><label for="ville">Ville</label> <select id="ville"><option>Paris</option><option>Lyon</option><option>Marseille</option></select></p>
          <p><input type="checkbox" id="actif"> <label for="actif">Client actif</label></p>
          <p><label for="piece">Pièce jointe</label> <input type="file" id="piece"></p>
          <p><button type="submit">Enregistrer</button> <button type="button" disabled>Archiver</button></p></form>`,
        `document.getElementById('f').addEventListener('submit', async (ev) => {
           ev.preventDefault();
           const piece = document.getElementById('piece').files[0];
           const client = { nom: document.getElementById('nom').value, ville: document.getElementById('ville').value, actif: document.getElementById('actif').checked, piece: piece ? piece.name : null };
           await fetch('/api/clients', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(client) });
           location.href = '/clients?cree=' + encodeURIComponent(client.nom);
         });`);
      case '/api/clients':
        if (req.method === 'POST') return corps().then((d) => { const c = JSON.parse(d); etat.clients.push(c); etat.ajouts.push(c); json({ ok: true }, 201); });
        return json(etat.clients);
      case '/differe':
        return html('Différé', `<h1>Contenu différé</h1><p id="etat">Chargement…</p><button type="button" id="b" disabled>Continuer</button><p id="tard" hidden>Données chargées</p>`,
          `setTimeout(() => { document.getElementById('etat').textContent = 'Chargé'; document.getElementById('b').disabled = false; document.getElementById('tard').hidden = false; }, 1200);`);
      case '/connexion':
        return html('Connexion', `<h1>Connexion</h1><p>Connectez-vous dans cette fenêtre.</p>`,
          u.searchParams.get('auto') ? `setTimeout(() => { document.cookie = 'session=ok; max-age=86400; path=/'; location.href = '/accueil-connecte'; }, ${Number(u.searchParams.get('auto'))});` : '');
      case '/accueil-connecte':
        return html('Espace connecté', '<h1>Espace connecté</h1><p>Bienvenue</p>');
      case '/session':
        return html('Session', `<h1>Session</h1><p id="s">Session : ${/(?:^|;\s*)session=ok/.test(req.headers.cookie ?? '') ? 'ouverte' : 'absente'}</p>`);
      case '/export':
        return html('Export', '<h1>Export</h1><p><a href="/export.csv">Exporter en CSV</a></p>');
      case '/export.csv':
        res.writeHead(200, { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="clients.csv"' });
        return res.end(`nom;ville\n${etat.clients.map((c) => `${c.nom};${c.ville}`).join('\n')}\n`);
      case '/erreurs':
        return html('Erreurs', '<h1>Erreurs</h1><p>Page qui se plaint</p>', `console.error('erreur de démonstration'); fetch('/manquant'); setTimeout(() => { throw new Error('exception de démonstration'); }, 10);`);
      case '/manquant':
        res.writeHead(500, { 'content-type': 'text/plain' });
        return res.end('erreur');
      case '/externe':
        return html('Externe', `<h1>Ressources externes</h1><img alt="Logo externe" src="${autre}/logo.png"><p>Contenu local</p>`);
      case '/ws':
        return html('WebSocket', `<h1>WebSocket</h1><p id="principal">principal : en attente</p><p id="autre">autre : en attente</p>`,
          `const essayer = (id, adresse) => { const w = new WebSocket(adresse); const p = document.getElementById(id);
             w.onopen = () => w.send('bonjour'); w.onmessage = (m) => { p.textContent = id + ' : écho ' + m.data; };
             w.onclose = () => { if (!p.textContent.includes('écho')) p.textContent = id + ' : fermé'; }; w.onerror = () => { p.textContent = id + ' : fermé'; }; };
           essayer('principal', 'ws://' + location.host + '/echo'); essayer('autre', '${autre.replace('http', 'ws')}/echo');`);
      case '/compteur':
        return html('Compteur', `<h1>Compteur</h1><p id="v">${etat.compteur}</p><button type="button" id="plus">Ajouter</button>`,
          `document.getElementById('plus').addEventListener('click', async () => { const r = await fetch('/api/compteur', { method: 'POST' }); document.getElementById('v').textContent = (await r.json()).compteur; });`);
      case '/api/compteur':
        if (req.method === 'POST') etat.compteur++;
        return json({ compteur: etat.compteur });
      default:
        if (u.pathname.startsWith('/api/clients/') && req.method === 'DELETE') {
          const nom = decodeURIComponent(u.pathname.slice('/api/clients/'.length));
          etat.clients = etat.clients.filter((c) => c.nom !== nom);
          return json({ ok: true });
        }
        return html('Introuvable', '<h1>Page introuvable</h1>', '', 404);
    }
  };

  const demarrer = (gestion, hote) => new Promise((resolve, reject) => {
    const s = http.createServer(gestion);
    s.on('upgrade', (req, socket) => { if (req.url === '/echo') accepterWebSocket(req, socket); else socket.destroy(); });
    s.on('error', reject);
    s.listen(0, hote, () => { serveurs.push(s); resolve(`http://${hote}:${s.address().port}`); });
  });
  const autreApp = (req, res) => {
    res.writeHead(200, { 'content-type': req.url.endsWith('.png') ? 'image/png' : 'text/html; charset=utf-8' });
    res.end(req.url.endsWith('.png') ? Buffer.alloc(0) : page('Autre origine', '<h1>Autre origine</h1>'));
  };
  autre = await demarrer(autreApp, '127.0.0.1');
  const jira = await demarrer(jiraFactice(etat), '127.0.0.1');
  const base = await demarrer(app, '127.0.0.1');
  let distante = null;
  try {
    distante = await demarrer(app, '127.0.0.2');
  } catch {
    distante = null;
  }
  return {
    base, autre, distante, jira, etat,
    arreter: () => Promise.all(serveurs.map((s) => new Promise((r) => { s.closeAllConnections?.(); s.close(() => r()); }))),
  };
}

// --- Jira factice ---------------------------------------------------------------------------------
// Pages de demandes avec les marqueurs de Jira Cloud et de Jira Data Center que lit scripts/jira.mjs,
// leur enregistrement MHTML comme le fait Chrome, et un serveur Jira à connexion simulée.

const echapper = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const GHERKIN_DEMO_8 = `# language: fr
@DEMO-8
Fonctionnalité: Clients
  En tant que commercial, je crée mes clients depuis la liste.

  Contexte:
    Étant donné que je suis sur la page des clients

  @DEMO-8-S02 @DEMO-8-CA01
  Scénario: Créer un client
    Quand je clique sur le lien « Nouveau client »
    Et je saisis « Durand » dans le champ « Nom »
    Et je clique sur le bouton « Enregistrer »
    Alors je vois le message « Client Durand créé »

  Scénario: Ouvrir le formulaire
    Ce scénario vérifie l'accès au formulaire.
    Quand je clique sur le lien « Nouveau client »
    Alors je vois le titre « Nouveau client »

  Plan du scénario: Créer plusieurs clients
    Quand je clique sur le lien « Nouveau client »
    Et je saisis « <Nom du client> » dans le champ « Nom »
    Et je choisis « <ville> » dans la liste « Ville »
    Et je clique sur le bouton « Enregistrer »
    Alors je vois le message « Client <Nom du client> créé »

    Exemples:
      | Nom du client | ville |
      | Leroy         | Lyon  |
      | Morel         | Paris |
`;

/** Description Cloud de DEMO-8 : prose, scénarios dans un bloc de code, prose. */
export const descriptionCloud = (gherkin = GHERKIN_DEMO_8) => `<div class="ak-renderer-document">
<p>En tant que commercial, je veux créer un client depuis la liste, afin de le suivre.</p>
<h2>Critères d’acceptation</h2>
<div class="code-block"><button type="button">Copier</button><pre><code data-language="gherkin">${echapper(gherkin)}</code></pre></div>
<p>Hors périmètre : la suppression d’un client.</p>
<p>Quand le client existe déjà, un message l’indique.</p>
</div>`;

/** Demandes du Jira factice : DEMO-8 sur Jira Cloud, DEMO-9 sur Jira Data Center (texte latin-1). */
export function demandesJira() {
  return {
    'DEMO-8': {
      variante: 'cloud', cle: 'DEMO-8', resume: 'Créer un client depuis Jira', description: descriptionCloud(),
      champs: [{ id: 'customfield_10042', nom: 'Acceptance criteria', html: '<div class="ak-renderer-document"><p>@DEMO-8-S04</p><p>Scenario: Export the clients</p><p>Given I am on the export page</p><p>When I click the link “Export as CSV”</p><p>Then the file “clients.csv” is downloaded</p></div>' }],
      commentaires: [{ id: '10001', auteur: 'Zoé Martin', date: '2026-11-18T10:00:00.000Z', html: '<div class="ak-renderer-document"><p>Proposition de scénario :</p><p>Scénario: Annuler la création<br>Quand je clique sur le lien « Nouveau client »<br>Et je clique sur le lien « Clients »<br>Alors je vois le titre « Clients »</p></div>' }],
      plus: false,
    },
    'DEMO-9': {
      variante: 'datacenter', cle: 'DEMO-9', resume: 'Exporter les clients',
      description: `<div class="user-content-block"><p>As a sales rep, I export the client list.</p>
<p><b>Scenario Outline:</b> Export the clients of a city<br/>
<b>Given</b> I am on the export page<br/>
<b>When</b> I click the link &quot;Export as CSV&quot;<br/>
<b>Then</b> the file &quot;&lt;fichier&gt;&quot; is downloaded</p>
<p><b>Examples:</b></p>
<div class="table-wrap"><table class="confluenceTable"><tbody>
<tr><th class="confluenceTh"><p>fichier</p></th></tr>
<tr><td class="confluenceTd"><p>clients.csv</p></td></tr>
</tbody></table></div></div>`,
      champs: [{ id: 'customfield_10200', nom: 'Critères d\'acceptation', html: '<div class="user-content-block"><p>@DEMO-9-S01<br/>Scénario : Ouvrir l\'export<br/>Étant donné que je suis sur la page d\'accueil<br/>Quand je clique sur le lien « Export »<br/>Alors je vois le titre « Export »</p></div>' }],
      commentaires: [{ id: '20001', auteur: 'Paul Durand', date: '2026-11-19T09:00:00+0100', html: '<p>Scenario: Back to home<br/>Given I am on the export page<br/>When I click the link &quot;Accueil&quot;<br/>Then I see the heading &quot;Démonstration&quot;</p>' }],
      plus: false,
    },
  };
}

/** Page HTML d'une demande, avec les marqueurs de sa variante. */
export function pageJira(d) {
  const tete = `<!doctype html><html lang="fr"><head><title>[${d.cle}] ${echapper(d.resume)} - Jira</title><script>window.__etat = "Scénario: dans un script";</script></head><body>`;
  if (d.variante === 'cloud') {
    return `${tete}<div id="jira-frontend"><nav><a href="/browse/${d.cle}">${d.cle}</a></nav>
<h1 data-testid="issue.views.issue-base.foundation.summary.heading">${echapper(d.resume)}</h1>
<div data-testid="issue.views.field.rich-text.description">${d.description}</div>
${d.champs.map((c) => `<h2>${echapper(c.nom)}</h2><div data-testid="issue.views.field.rich-text.${c.id}">${c.html}</div>`).join('\n')}
<div data-testid="issue.activity.comments-list">${d.commentaires.map((c) => `<div data-testid="issue-comment-base.ui.comment.ak-comment.${c.id}"><span data-testid="issue-comment-base.ui.comment.ak-comment.${c.id}.author">${echapper(c.auteur)}</span> <time datetime="${c.date}">il y a 2 jours</time>${c.html}</div>`).join('\n')}${d.plus ? '<button type="button">Afficher plus</button>' : ''}</div>
</div></body></html>`;
  }
  return `${tete}<div id="page"><header><a href="/browse/${d.cle}" id="key-val">${d.cle}</a><h1 id="summary-val">${echapper(d.resume)}</h1></header>
<div id="descriptionmodule"><div id="description-val" class="field-ignore-highlight">${d.description}</div></div>
<ul id="customfieldmodule">${d.champs.map((c) => `<li id="rowFor${c.id}" class="item"><div class="wrap"><strong title="${echapper(c.nom)}" class="name"><label for="${c.id}">${echapper(c.nom)}:</label></strong><div id="${c.id}-val" class="value type-textarea">${c.html}</div></div></li>`).join('')}</ul>
<div id="issue_actions_container">${d.commentaires.map((c) => `<div id="comment-${c.id}" class="issue-data-block activity-comment"><div class="action-head"><a class="user-hover" href="#">${echapper(c.auteur)}</a> <time datetime="${c.date}">19/nov./26</time></div><div class="action-body flooded">${c.html}</div></div>`).join('')}${d.plus ? '<a href="#">Afficher plus</a>' : ''}</div>
</div></body></html>`;
}

/** Quoted-printable d'octets, lignes de 76 caractères au plus, fins de ligne en CRLF. */
function versQuotedPrintable(octets) {
  const lignes = [];
  let ligne = '';
  for (let i = 0; i < octets.length; i++) {
    const o = octets[i];
    if (o === 0x0a) { lignes.push(ligne); ligne = ''; continue; }
    if (o === 0x0d && octets[i + 1] === 0x0a) continue;
    const c = (o >= 33 && o <= 126 && o !== 61) || o === 32 ? String.fromCharCode(o) : `=${o.toString(16).toUpperCase().padStart(2, '0')}`;
    if (ligne.length + c.length > 75) { lignes.push(`${ligne}=`); ligne = ''; }
    ligne += c;
  }
  lignes.push(ligne);
  return lignes.join('\r\n');
}

/**
 * Enregistrement MHTML d'une page, comme Chrome le produit : en-têtes, frontière, partie HTML en
 * quoted-printable ou en base64, dans le jeu de caractères donné, puis une image.
 */
export function enMhtml(html, { emplacement, encodage = 'quoted-printable', charset = null }) {
  const frontiere = '----MultipartBoundary--DemoJira0123456789----';
  const octets = Buffer.from(html, charset && /8859|latin/i.test(charset) ? 'latin1' : 'utf8');
  const corps = encodage === 'base64' ? octets.toString('base64').replace(/.{76}/g, '$&\r\n') : versQuotedPrintable(octets);
  return Buffer.from([
    'From: <Saved by Blink>', `Snapshot-Content-Location: ${emplacement}`, 'Subject: Demande', 'Date: Fri, 20 Nov 2026 18:00:00 +0100',
    'MIME-Version: 1.0', 'Content-Type: multipart/related;', '\ttype="text/html";', `\tboundary="${frontiere}"`, '', '',
    `--${frontiere}`, `Content-Type: text/html${charset ? `; charset=${charset}` : ''}`, 'Content-ID: <frame-0@mhtml.blink>',
    `Content-Transfer-Encoding: ${encodage}`, `Content-Location: ${emplacement}`, '', corps,
    `--${frontiere}`, 'Content-Type: image/png', 'Content-Transfer-Encoding: base64', `Content-Location: ${new URL('/logo.png', emplacement).href}`, '', 'iVBORw0KGgo=',
    `--${frontiere}--`, '',
  ].join('\r\n'), 'latin1');
}

/**
 * Serveur du Jira factice : /browse/<CLÉ> sans session renvoie vers /login, dont la page simule la
 * connexion du développeur après `etat.connexionJira` ms (jamais si null). Chaque requête est notée
 * dans etat.requetesJira.
 */
function jiraFactice(etat) {
  return (req, res) => {
    const u = new URL(req.url, 'http://x');
    etat.requetesJira.push(`${req.method} ${u.pathname}`);
    const html = (code, corps) => { res.writeHead(code, { 'content-type': 'text/html; charset=utf-8' }); res.end(corps); };
    const connecte = /(?:^|;\s*)jira=ok/.test(req.headers.cookie ?? '');
    if (u.pathname.startsWith('/browse/')) {
      const cle = u.pathname.slice('/browse/'.length);
      if (!connecte) { res.writeHead(302, { location: `/login?dest=${encodeURIComponent(u.pathname)}` }); return res.end(); }
      const d = etat.jira[cle];
      if (!d) return html(404, '<!doctype html><html><head><title>Jira</title></head><body><h1>Demande introuvable</h1></body></html>');
      return html(200, pageJira(d));
    }
    if (u.pathname === '/login') {
      const dest = u.searchParams.get('dest') ?? '/';
      const auto = etat.connexionJira === null ? '' : `<script>setTimeout(() => { document.cookie = 'jira=ok; max-age=86400; path=/'; location.href = ${JSON.stringify(dest)}; }, ${etat.connexionJira});</script>`;
      return html(200, `<!doctype html><html><head><title>Connexion - Jira</title></head><body><h1>Connexion à Jira</h1><form method="post" action="/login?dest=${encodeURIComponent(dest)}"><label>Identifiant <input name="u"></label></form>${auto}</body></html>`);
    }
    return html(404, '<!doctype html><html><body><h1>Introuvable</h1></body></html>');
  };
}
```

### `tests/run-tests.mjs`

<!-- fichier : tests/run-tests.mjs -->
```javascript
#!/usr/bin/env node
// scenario-playwright 1.1.1 : recette du skill, scénarios R1 à R21, contre l'application de démonstration
// locale (tests/application-demo.mjs), sans réseau ni compte. Le navigateur s'ouvre, visible, sur des
// profils temporaires : les profils et les résultats du dossier du skill ne sont pas touchés.
//   Navigateur : celui de SCENARIO_PLAYWRIGHT_CANAL (chrome par défaut ; chromium après
//   npx playwright-core install chromium). Linux sans écran : xvfb-run -a npm test.
// Usage, depuis le dossier du skill : npm test ; sortie 0 si tout passe, 1 sinon (dossier temporaire gardé,
// comme avec GARDER_TMP=1).
import { spawn } from 'node:child_process';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { clearTimeout, setTimeout } from 'node:timers';
import { fileURLToPath, URL } from 'node:url';
import * as cibles from '../scripts/cibles.mjs';
import * as jira from '../scripts/jira.mjs';
import * as moteur from '../scripts/moteur.mjs';
import * as rapport from '../scripts/rapport.mjs';
import * as scenario from '../scripts/scenario.mjs';
import * as session from '../scripts/session.mjs';
import * as texte from '../scripts/texte.mjs';
import { lireToml } from '../scripts/toml.mjs';
import { designer } from '../scripts/designer.mjs';
import { demarrerApplication, demandesJira, descriptionCloud, enMhtml, pageJira } from './application-demo.mjs';

const SKILL = fileURLToPath(new URL('..', import.meta.url));
const TMP = mkdtempSync(join(tmpdir(), 'scenario-playwright-'));
const ENV = { ...process.env, SCENARIO_PLAYWRIGHT_PROFILS: join(TMP, 'profils') };
const resultats = [];
let courant = '';

function scenarioRecette(id, titre) {
  courant = id;
  console.log(`\n# ${id} · ${titre}`);
}
function controle(nom, ok, detail = '') {
  resultats.push({ scenario: courant, nom, ok: Boolean(ok) });
  // Le détail d'un échec tient sur une ligne : la sortie d'un script lancé ne se mêle pas au bilan de la recette.
  const d = String(detail).replace(/\s*\n\s*/g, ' | ').slice(0, 1500);
  console.log(`${ok ? 'OK  ' : 'KO  '} ${courant} · ${nom}${d && !ok ? ` : ${d}` : ''}`);
}
function saut(nom, raison) {
  resultats.push({ scenario: courant, nom, ok: true, saute: true });
  console.log(`SAUT ${courant} · ${nom} : ${raison}`);
}
const leve = (f) => { try { f(); return null; } catch (e) { return e; } };
const contient = (liste, motif) => liste.some((x) => (motif instanceof RegExp ? motif.test(x) : String(x).includes(motif)));
const sha = (chemin) => createHash('sha256').update(readFileSync(chemin)).digest('hex');

/** Écrit un fichier de scénario dans un dossier de la recette ; rend son chemin. */
function ecrire(dossier, nom, contenu) {
  const d = join(TMP, dossier);
  mkdirSync(d, { recursive: true });
  const chemin = join(d, nom);
  writeFileSync(chemin, contenu);
  return chemin;
}

/** Lance un script du skill sans bloquer ce processus, qui sert l'application ; rend { code, sortie, erreurs }. */
function lancer(script, args, { env = ENV, delai = 120_000 } = {}) {
  return new Promise((resolve) => {
    const enfant = spawn(process.execPath, [join(SKILL, 'scripts', script), ...args], { env, stdio: ['ignore', 'pipe', 'pipe'] });
    let sortie = '';
    let erreurs = '';
    enfant.stdout.setEncoding('utf8').on('data', (d) => { sortie += d; });
    enfant.stderr.setEncoding('utf8').on('data', (d) => { erreurs += d; });
    const minuterie = setTimeout(() => enfant.kill('SIGKILL'), delai);
    // Fin du script : la sortie se lit jusqu'à la fermeture de ses flux, 2 s au plus après la fin du processus,
    // pour qu'un processus du navigateur resté ouvert ne retienne pas la recette.
    let grace = null;
    let fini = false;
    const finir = (code) => {
      if (fini) return;
      fini = true;
      clearTimeout(minuterie);
      clearTimeout(grace);
      resolve({ code, sortie, erreurs });
    };
    enfant.on('exit', (code) => { grace = setTimeout(() => finir(code), 2000); });
    enfant.on('close', (code) => finir(code));
  });
}

/** Ferme un contexte de navigateur ouvert par la recette elle-même, sans l'attendre plus de 15 s. */
const fermer = (ctx) => Promise.race([ctx.close().catch(() => {}), new Promise((r) => { setTimeout(r, 15_000).unref(); })]);

/** Joue un scénario et lit son rapport ; rend { code, sortie, erreurs, rapport, dossier }. */
async function jouer(chemin, args = [], options = {}) {
  const r = await lancer('jouer.mjs', [chemin, ...args], options);
  const m = /^Rapport : (.+)rapport\.md$/m.exec(r.sortie);
  const dossier = m ? m[1].trim() : null;
  const lu = dossier && existsSync(join(dossier, 'rapport.json')) ? JSON.parse(readFileSync(join(dossier, 'rapport.json'), 'utf8')) : null;
  return { ...r, rapport: lu, dossier };
}

const etapes = (r) => (r.rapport ? r.rapport.jeux.flatMap((j) => j.etapes) : []);

// --------------------------------------------------------------------------------------------------
// Textes et scénarios de la recette
// --------------------------------------------------------------------------------------------------

const TEXTE_COMPLET = (base) => `# language: fr
@DEMO-7
Fonctionnalité: Clients
@DEMO-7-S01 @DEMO-7-CA01
Scénario : Créer des clients
  Adresse : ${base}
  Origines : ${base}
  Profil : essai
  Paramètre : ville = Lyon

  Étant donné que je me connecte (à la main)
  Soit la page des clients
  Quand je clique sur le lien « Nouveau client »
  Lorsqu'il saisit « <nom> » dans le champ « Nom »
  Et je choisis « <ville> » dans la liste « Ville »
  Et je clique sur « Enregistrer » (création)
  Mais je renomme le client (modification)
  Et je supprime le client (suppression)
  Alors je vois « Client <nom> créé »

  Exemples:
    | nom    |
    | Dupuis |
    | Leroy  |
`;

// --------------------------------------------------------------------------------------------------

async function principal() {
  const app = await demarrerApplication();
  const { base, autre, distante, jira: adresseJira } = app;
  const canal = session.lireReglages(ENV).reglages.canal;
  console.log(`Recette de scenario-playwright 1.1.1 : Node ${process.versions.node}, navigateur ${canal}, application ${base}`);
  console.log(`Dossier temporaire : ${TMP}`);
  try {
    // ------------------------------------------------------------------------------------------
    scenarioRecette('R1', 'Texte de départ : structure, marques, variables, exemples, erreurs ligne par ligne');
    {
      const source = TEXTE_COMPLET(base);
      const { scenario: t, erreurs } = texte.analyserTexte(source);
      controle('un texte complet se lit sans erreur', erreurs.length === 0, JSON.stringify(erreurs));
      controle('titre, fonctionnalité, étiquettes des deux lignes', t.titre === 'Créer des clients' && t.fonctionnalite === 'Clients' && JSON.stringify(t.etiquettes) === '["DEMO-7","DEMO-7-S01","DEMO-7-CA01"]');
      controle('adresse, origines déclarées, profil, paramètre', t.adresse === base && t.originesDeclarees && t.origines[0] === base && t.profil === 'essai' && t.parametres.ville === 'Lyon');
      controle('neuf étapes, chacune avec sa ligne et son mot-clé', t.etapes.length === 9 && t.etapes[0].ligne === 11 && t.etapes.map((e) => e.motCle).join('|') === "Étant donné que|Soit|Quand|Lorsqu'|Et|Et|Mais|Et|Alors", t.etapes.map((e) => e.motCle).join('|'));
      controle('marques (à la main), (création), (modification), (suppression) retirées de la phrase', t.etapes[0].marque === 'main' && t.etapes[0].phrase === 'je me connecte' && t.etapes[5].marque === 'creation' && t.etapes[6].marque === 'modification' && t.etapes[7].marque === 'suppression');
      controle('variables <nom> et <ville> relevées par étape', JSON.stringify(t.etapes[3].variables) === '["nom"]' && JSON.stringify(t.etapes[4].variables) === '["ville"]' && JSON.stringify(t.etapes[8].variables) === '["nom"]');
      controle('tableau d\'exemples : deux jeux', JSON.stringify(t.jeux) === '[{"nom":"Dupuis"},{"nom":"Leroy"}]');
      const crlf = `\uFEFF${source.replace(/\n/g, '\r\n')}`;
      controle('même empreinte en CRLF avec BOM, et en NFD (D2.INV-3)', texte.empreinteTexte(crlf) === t.empreinte && texte.empreinteTexte(source.normalize('NFD')) === t.empreinte && texte.analyserTexte(crlf).erreurs.length === 0);
      const sansOrigines = texte.analyserTexte(`Scénario: X\n  Adresse : ${base}/clients\n  Quand je regarde\n`).scenario;
      controle('sans ligne Origines, l\'origine de l\'adresse', !sansOrigines.originesDeclarees && JSON.stringify(sansOrigines.origines) === JSON.stringify([base]));
      const cas = [
        ['Scénario: A\n  Adresse : http://a.test\n  Quand x\nScénario: B\n', 4, 'second titre'],
        ['Scénario: A\n  Adresse : http://a.test\n  bonjour\n', 3, 'ligne non reconnue'],
        ['Scénario: A\n  Adresse : http://a.test\n  Quand x\n  Profil : p\n', 4, 'réglage après la première étape'],
        ['Quand x\nScénario: A\n  Adresse : http://a.test\n  Alors y\n', 1, 'étape avant le titre'],
        ['Scénario: A\n  Quand x\n', 1, 'adresse absente'],
        ['Scénario: A\n  Adresse : ftp://a.test\n  Quand x\n', 2, 'adresse invalide'],
        ['Scénario: A\n  Adresse : http://a.test\n  Origines : http://a.test/chemin\n  Quand x\n', 3, 'origine invalide'],
        ['Scénario: A\n  Adresse : http://a.test\n  Origines : http://b.test\n  Quand x\n', 3, 'n\'est pas parmi les origines'],
        ['Scénario: A\n  Adresse : http://a.test\n  Quand je saisis <inconnu>\n', 3, 'variable <inconnu> non déclarée'],
        ['Scénario: A\n  Adresse : http://a.test\n  Quand je saisis <Nom>\n', 3, 'variable invalide'],
        ['Scénario: A\n  Adresse : http://a.test\n  Quand <a>\n  Exemples:\n  | a | b |\n  | 1 |\n', 6, 'ligne d\'exemples de 1 cellules'],
        ['Scénario: A\n  Adresse : http://a.test\n  Quand x\n  Exemples:\n', 4, 'tableau d\'exemples vide'],
        ['Scénario: A\n  Adresse : http://a.test\n  Quand <a>\n  Exemples:\n  | a |\n  | 1 |\n  Alors y\n', 7, 'après le tableau'],
        ['Scénario: A\n  @t\n  Adresse : http://a.test\n  Quand x\n', 2, 'étiquettes après le titre'],
        ['Scénario: A\n  Adresse : http://a.test\n  Profil : Mon Profil\n  Quand x\n', 3, 'profil invalide'],
        ['Scénario: A\n  Adresse : http://a.test\n  Paramètre : a = 1\n  Paramètre : a = 2\n  Quand x\n', 4, 'paramètre en double'],
        ['# rien\n', 0, 'titre absent'],
        ['Contexte:\n  Étant donné que x\nScénario: A\n  Adresse : http://a.test\n  Quand y\n', 1, 'n\'a pas sa place dans un texte d\'un seul scénario'],
        ['Scénario: A\n  Adresse : http://a.test\n  Quand x\nRule: R\n', 4, '« Rule: » n\'a pas sa place'],
      ];
      for (const [source2, ligne, motif] of cas) {
        const { erreurs: e2 } = texte.analyserTexte(source2);
        controle(`refus, ligne ${ligne} : ${motif}`, e2.some((e) => e.ligne === ligne && e.message.includes(motif)), JSON.stringify(e2));
      }
      const err = leve(() => texte.lireTexte('Scénario: A\n  Quand x\n  bonjour\n', 'a.scenario'));
      controle('lireTexte lève toutes les erreurs, chacune avec sa ligne', err instanceof texte.ErreurTexte && err.erreurs.length === 2 && /a\.scenario, ligne 1 : adresse absente/.test(err.message) && /ligne 3 : ligne non reconnue/.test(err.message), err?.message);
      const anglais = texte.analyserTexte(`# language: en\nFeature: Clients\n@DEMO-7-S02\nScenario Outline: Create clients\n  Adresse : ${base}\n\n  Given I am on the clients page\n  When I click the link "New client"\n  And I type "<nom>" in the field "Name" (création)\n  But I do not save\n  Then I see "<nom>"\n\n  Examples:\n    | nom |\n    | Lee |\n`);
      controle('mots-clés anglais : Feature, Scenario Outline, Given, When, And, But, Then, Examples (D2.INV-4)', anglais.erreurs.length === 0 && anglais.scenario.fonctionnalite === 'Clients' && anglais.scenario.motCleTitre === 'Scenario Outline' && anglais.scenario.etapes.map((e) => e.motCle).join('|') === 'Given|When|And|But|Then' && anglais.scenario.etapes[2].marque === 'creation' && JSON.stringify(anglais.scenario.jeux) === '[{"nom":"Lee"}]', JSON.stringify(anglais.erreurs));
      const synonymes = texte.analyserTexte(`Exemple: Ouvrir\n  Adresse : ${base}\n  Sachant que je suis connecté\n  Lorsque j'ouvre la page\n  Donc je vois « Clients »\n\n  Scénarios:\n    | a |\n    | 1 |\n`);
      controle('synonymes français : Exemple, Sachant que, Lorsque, Donc, Scénarios', synonymes.erreurs.length === 0 && synonymes.scenario.motCleTitre === 'Exemple' && synonymes.scenario.etapes.map((e) => e.motCle).join('|') === 'Sachant que|Lorsque|Donc' && synonymes.scenario.jeux.length === 1, JSON.stringify(synonymes.erreurs));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R2', 'Scénario TOML : jeu fermé, champs, cibles, bornes, variables, fichiers');
    {
      const valide = `format = "scenario-playwright.scenario/1"
titre = "Valide"
url_base = "${base}/"

[parametres]
nom = "Zoé"

[[etapes]]
action = "naviguer"
url = "/clients"

[[etapes]]
action = "saisir"
cible = { libelle = "Nom" }
valeur = "\${nom}"
`;
      const lu = scenario.validerScenario(lireToml(valide));
      controle('un scénario valide passe, avec ses valeurs par défaut', lu.erreurs.length === 0 && JSON.stringify(lu.scenario.origines) === JSON.stringify([base]) && lu.scenario.jeux === null && lu.scenario.delai === null, JSON.stringify(lu.erreurs));
      controle('jeu fermé de treize actions (D5.INV-1)', Object.keys(scenario.ACTIONS).join(',') === 'naviguer,cliquer,saisir,choisir,cocher,survoler,touche,televerser,telecharger,attendre,verifier,capturer,main');
      const avec = (etape, entete = '') => `format = "scenario-playwright.scenario/1"\ntitre = "T"\nurl_base = "${base}"\n${entete}\n[[etapes]]\n${etape}\n`;
      const cas = [
        ['format absent', valide.replace(/^format.*\n/, ''), 'format attendu'],
        ['titre absent', valide.replace(/^titre.*\n/m, ''), 'titre manquant'],
        ['adresse invalide', valide.replace(`url_base = "${base}/"`, 'url_base = "ftp://x"'), 'url_base manquante ou invalide'],
        ['clé racine inconnue', `bonus = 1\n${valide}`, 'clé inconnue : « bonus »'],
        ['origines invalides', avec('action = "naviguer"\nurl = "/"', 'origines = ["http://a.test/x"]'), 'origines est une liste d\'origines'],
        ['url_base hors des origines', avec('action = "naviguer"\nurl = "/"', 'origines = ["http://a.test"]'), 'n\'est pas parmi les origines'],
        ['action inconnue', avec('action = "clicker"'), 'action inconnue « clicker »'],
        ['étape à compléter', avec('action = "à compléter"'), 'étape à compléter'],
        ['champ inconnu', avec('action = "naviguer"\nurl = "/"\ncible = { role = "button" }'), 'champ inconnu pour naviguer : « cible »'],
        ['champ requis manquant', avec('action = "saisir"\ncible = { libelle = "Nom" }'), 'valeur manquant pour saisir'],
        ['mutation invalide', avec('action = "cliquer"\ncible = { texte = "x" }\nmutation = "effacement"'), 'mutation vaut'],
        ['mutation sur une action qui n\'agit pas', avec('action = "survoler"\ncible = { texte = "x" }\nmutation = "creation"'), 'champ inconnu pour survoler : « mutation »'],
        ['délai au-delà de 30 s', avec('action = "naviguer"\nurl = "/"\ndelai = 31'), 'de 1 à 30'],
        ['délai de main au-delà de 900 s', avec('action = "main"\nmessage = "m"\njusqua = { url = "/" }\ndelai = 901'), 'de 1 à 900'],
        ['cible à deux stratégies', avec('action = "cliquer"\ncible = { role = "button", texte = "x" }'), 'une seule stratégie'],
        ['rôle inconnu', avec('action = "cliquer"\ncible = { role = "buton" }'), 'rôle inconnu « buton »'],
        ['nom sans rôle', avec('action = "cliquer"\ncible = { texte = "x", nom = "y" }'), 'nom ne s\'emploie qu\'avec role'],
        ['exact avec testid', avec('action = "cliquer"\ncible = { testid = "x", exact = true }'), 'exact ne s\'emploie pas avec testid'],
        ['rang nul', avec('action = "cliquer"\ncible = { texte = "x", rang = 0 }'), 'rang est un entier à partir de 1'],
        ['quatre niveaux de dans', avec('action = "cliquer"\ncible = { texte = "a", dans = { texte = "b", dans = { texte = "c", dans = { texte = "d" } } } }'), 'plus de 3 niveaux'],
        ['touche invalide', avec('action = "touche"\ntouche = "Entrée"'), 'touche invalide'],
        ['fichier absolu', avec('action = "televerser"\ncible = { libelle = "P" }\nfichier = "/etc/passwd"'), 'chemin relatif au dossier du scénario'],
        ['fichier avec ..', avec('action = "televerser"\ncible = { libelle = "P" }\nfichier = ["a.txt", "../b.txt"]'), 'sans « .. »'],
        ['attendre url avec une cible', avec('action = "attendre"\netat = "url"\nurl = "/"\ncible = { texte = "x" }'), 'ne prend ni cible ni texte'],
        ['critère inconnu', avec('action = "verifier"\ncritere = "egal"\ncible = { texte = "x" }'), 'critere vaut'],
        ['nombre négatif', avec('action = "verifier"\ncritere = "nombre"\ncible = { texte = "x" }\nattendu = -1'), 'entier positif ou nul'],
        ['nom de capture invalide', avec('action = "capturer"\nnom = "Écran 1"'), 'nom invalide'],
        ['jusqua invalide', avec('action = "main"\nmessage = "m"\njusqua = { url = "/", cible = { texte = "x" } }'), 'jusqua est'],
        ['variable non déclarée', avec('action = "naviguer"\nurl = "/\${page}"'), 'variable ${page} non déclarée'],
        ['jeux incohérents', avec('action = "naviguer"\nurl = "/"', '[[jeux]]\na = "1"\n[[jeux]]\nb = "2"\n'), 'mêmes variables attendues'],
        ['adresse absolue hors des origines', avec(`action = "naviguer"\nurl = "${autre}/autre"`), 'n\'est pas parmi les origines'],
      ];
      for (const [nom, source, motif] of cas) {
        let erreurs;
        try { erreurs = scenario.validerScenario(lireToml(source), scenario.lignesDesEtapes(source)).erreurs; } catch (e) { erreurs = [e.message]; }
        controle(`refus : ${nom}`, contient(erreurs, motif), JSON.stringify(erreurs));
      }
      const syntaxe = ecrire('r2', 'syntaxe.toml', 'format = "x"\ntitre = \n');
      controle('erreur de syntaxe TOML avec sa ligne', contient(scenario.lireScenario(syntaxe).erreurs, /ligne 2/));
      const lignes = avec('action = "clicker"').replace('[[etapes]]', '\n\n[[etapes]]\nligne = 4');
      controle('l\'erreur cite l\'étape, sa ligne du TOML et sa ligne du texte', contient(scenario.validerScenario(lireToml(lignes), scenario.lignesDesEtapes(lignes)).erreurs, /étape 1 \(ligne 7 du TOML, ligne 4 du texte\)/));
      const jeux = scenario.validerScenario(lireToml(avec('action = "saisir"\ncible = { libelle = "Nom" }\nvaleur = "${nom} ${ville} $${brut}"', '[parametres]\nville = "Paris"\nnom = "défaut"\n[[jeux]]\nnom = "A"\n[[jeux]]\nnom = "B"\n'))).scenario;
      const p1 = scenario.preparerJeux(jeux, TMP, { ville: 'Lyon' });
      controle('--param, puis jeu, puis [parametres] ; $${ reste littéral (D3.INV-6)', p1.erreurs.length === 0 && p1.jeux.map((j) => j.etapes[0].valeur).join('|') === 'A Lyon ${brut}|B Lyon ${brut}', JSON.stringify(p1));
      controle('--param inconnu refusé', contient(scenario.preparerJeux(jeux, TMP, { pays: 'FR' }).erreurs, '--param pays'));
      controle('--jeu hors des jeux refusé, --jeu 2 seul', contient(scenario.preparerJeux(jeux, TMP, {}, 3).erreurs, '--jeu 3') && scenario.preparerJeux(jeux, TMP, {}, 2).jeux.map((j) => j.numero).join() === '2');
      const tel = scenario.validerScenario(lireToml(avec('action = "televerser"\ncible = { libelle = "P" }\nfichier = "donnees/absent.txt"'))).scenario;
      controle('fichier à téléverser introuvable refusé avant le navigateur (D5.INV-5)', contient(scenario.preparerJeux(tel, TMP).erreurs, 'fichier introuvable : donnees/absent.txt'));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R3', 'Traduction : squelette sans IA, contrôle contre le texte, plan de ratification');
    {
      const cheminTexte = ecrire('r3', 'creer.scenario', TEXTE_COMPLET(base));
      const t1 = await lancer('traduire.mjs', [cheminTexte]);
      const cheminToml = join(TMP, 'r3', 'creer.toml');
      controle('traduire.mjs écrit le squelette (code 0)', t1.code === 0 && existsSync(cheminToml), t1.erreurs);
      const t2 = await lancer('traduire.mjs', [cheminTexte]);
      controle('traduire.mjs refuse d\'écraser sans --remplacer (code 2)', t2.code === 2 && /existe déjà/.test(t2.erreurs));
      const t3 = await lancer('traduire.mjs', [cheminTexte, '--remplacer']);
      controle('--remplacer réécrit le squelette', t3.code === 0);
      const sq = lireToml(readFileSync(cheminToml, 'utf8'));
      const tx = texte.lireTexte(TEXTE_COMPLET(base));
      controle('le squelette recopie la structure du texte (D3.INV-5)', sq.titre === tx.titre && JSON.stringify(sq.etiquettes) === JSON.stringify(tx.etiquettes) && sq.url_base === base && sq.profil === 'essai' && sq.parametres.ville === 'Lyon' && sq.jeux.length === 2 && sq.empreinte_source === tx.empreinte && sq.source === 'creer.scenario');
      controle('un bloc par étape du texte, marques reportées', sq.etapes.length === 9 && sq.etapes.every((e, i) => e.ligne === tx.etapes[i].ligne) && sq.etapes[0].action === 'main' && sq.etapes[0].message === 'je me connecte' && sq.etapes[5].mutation === 'creation' && sq.etapes[1].action === scenario.A_COMPLETER);
      const v1 = await lancer('verifier.mjs', [cheminToml]);
      controle('le squelette est refusé tant qu\'une étape reste à compléter', v1.code === 2 && /étape à compléter/.test(v1.sortie) && /jusqua manquant/.test(v1.sortie));
      const etapesTraduites = `
[[etapes]]
ligne = 11
action = "main"
message = "je me connecte"
jusqua = { url = "/accueil-connecte" }

[[etapes]]
ligne = 12
action = "naviguer"
url = "/clients"

[[etapes]]
ligne = 13
action = "cliquer"
cible = { role = "link", nom = "Nouveau client" }

[[etapes]]
ligne = 14
action = "saisir"
cible = { libelle = "Nom" }
valeur = "\${nom}"

[[etapes]]
ligne = 15
action = "choisir"
cible = { libelle = "Ville" }
valeur = "\${ville}"

[[etapes]]
ligne = 16
action = "cliquer"
cible = { role = "button", nom = "Enregistrer" }
mutation = "creation"

[[etapes]]
ligne = 17
action = "cliquer"
cible = { role = "button", nom = "Renommer" }
mutation = "modification"

[[etapes]]
ligne = 18
action = "cliquer"
cible = { role = "button", nom = "Supprimer", dans = { role = "row", nom = "\${nom}" } }
mutation = "suppression"

[[etapes]]
ligne = 19
action = "verifier"
critere = "contient"
cible = { role = "alert" }
attendu = "Client \${nom} créé"
`;
      const entete = readFileSync(cheminToml, 'utf8').split('\n# ligne 11')[0];
      const traduit = `${entete}\n${etapesTraduites}`;
      writeFileSync(cheminToml, traduit);
      const v2 = await lancer('verifier.mjs', [cheminToml, '--plan']);
      controle('la traduction complétée passe le contrôle (code 0)', v2.code === 0 && /traduction contrôlée/.test(v2.sortie), v2.sortie);
      controle('le plan montre chaque ligne du texte et ses étapes (D10.INV-1)', /l\.13 {2}Quand je clique sur le lien « Nouveau client »\n {8}→ cliquer getByRole\('link', \{ name: 'Nouveau client' \}\)/.test(v2.sortie) && /9 étapes, dont 3 qui modifient des données, et des étapes à la main\./.test(v2.sortie), v2.sortie);
      const ecarts = [
        ['texte modifié depuis la traduction (D3.INV-2)', (s) => s, 'a changé depuis la traduction', (src) => `${src}# ajout\n`],
        ['texte de départ absent', (s) => s.replace('source = "creer.scenario"', 'source = "absent.scenario"'), 'texte de départ introuvable'],
        ['titre différent', (s) => s.replace('titre = "Créer des clients"', 'titre = "Créer un client"'), 'titre « Créer un client » différent'],
        ['étiquettes différentes', (s) => s.replace('"DEMO-7-CA01"]', '"DEMO-7-CA02"]'), 'étiquettes'],
        ['adresse différente', (s) => s.replace(`url_base = "${base}"`, `url_base = "${base}/clients"`), 'url_base'],
        ['origines différentes', (s) => s.replace(`origines = ["${base}"]`, `origines = ["${base}", "${autre}"]`), 'origines'],
        ['profil différent', (s) => s.replace('profil = "essai"', 'profil = "autre"'), 'profil autre différent'],
        ['paramètres différents', (s) => s.replace('ville = "Lyon"', 'ville = "Nice"'), 'paramètres différents'],
        ['jeux différents', (s) => s.replace('nom = "Leroy"', 'nom = "Leroi"'), 'jeux différents'],
        ['étape sans ligne', (s) => s.replace('ligne = 12\n', ''), 'ligne du texte manquante'],
        ['ligne qui n\'est pas une étape', (s) => s.replace('ligne = 12\n', 'ligne = 9\n'), 'la ligne 9 n\'est pas une étape du texte'],
        ['ordre du texte non suivi', (s) => s.replace('ligne = 13\n', 'ligne = 11\n'), 'l\'ordre du texte n\'est pas suivi'],
        ['ligne du texte sans étape', (s) => s.replace(/\n\[\[etapes\]\]\nligne = 17\n[^[]*/, '\n'), 'ligne 17 du texte (« Mais je renomme le client ») : aucune étape ne la traduit'],
        ['marque de mutation perdue', (s) => s.replace('mutation = "suppression"\n', ''), 'marquée (suppression)'],
        ['(à la main) sans étape main', (s) => s.replace('action = "main"\nmessage = "je me connecte"\njusqua = { url = "/accueil-connecte" }', 'action = "naviguer"\nurl = "/connexion"'), 'une seule étape main attendue'],
        ['étape main sur une ligne non marquée', (s) => s.replace('action = "naviguer"\nurl = "/clients"', 'action = "main"\nmessage = "m"\njusqua = { url = "/clients" }'), 'ne marque pas « (à la main) »'],
        ['variable perdue', (s) => s.replace('valeur = "${nom}"', 'valeur = "Dupuis"'), 'la variable <nom> ne se retrouve'],
      ];
      for (const [nom, changer, motif, changerTexte] of ecarts) {
        const d = join(TMP, `r3-${resultats.length}`);
        mkdirSync(d, { recursive: true });
        writeFileSync(join(d, 'creer.scenario'), changerTexte ? changerTexte(TEXTE_COMPLET(base)) : TEXTE_COMPLET(base));
        writeFileSync(join(d, 'creer.toml'), changer(traduit));
        const r = scenario.lireScenario(join(d, 'creer.toml'));
        controle(`écart relevé : ${nom}`, r.scenario === null && contient(r.erreurs, motif), JSON.stringify(r.erreurs));
      }
      const dCrlf = join(TMP, 'r3-crlf');
      mkdirSync(dCrlf, { recursive: true });
      writeFileSync(join(dCrlf, 'creer.scenario'), TEXTE_COMPLET(base).replace(/\n/g, '\r\n'));
      writeFileSync(join(dCrlf, 'creer.toml'), traduit.replace(/\n/g, '\r\n'));
      controle('texte et traduction en CRLF : contrôle identique (D2.INV-3)', scenario.lireScenario(join(dCrlf, 'creer.toml')).erreurs.length === 0);
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R4', 'Cibles : stratégies côté utilisateur, notation de Playwright, lecture d\'un localisateur');
    {
      const exemples = [
        [{ role: 'button', nom: 'Enregistrer' }, "getByRole('button', { name: 'Enregistrer' })"],
        [{ role: 'heading' }, "getByRole('heading')"],
        [{ role: 'link', nom: "L'accueil", exact: true }, "getByRole('link', { name: 'L\\'accueil', exact: true })"],
        [{ libelle: 'Nom' }, "getByLabel('Nom')"],
        [{ texte: 'Bonjour', exact: true }, "getByText('Bonjour', { exact: true })"],
        [{ placeholder: 'Rechercher' }, "getByPlaceholder('Rechercher')"],
        [{ testid: 'valider' }, "getByTestId('valider')"],
        [{ alt: 'Logo' }, "getByAltText('Logo')"],
        [{ titre: 'Aide' }, "getByTitle('Aide')"],
        [{ css: '#principal > p' }, "locator('#principal > p')"],
        [{ role: 'button', nom: 'Supprimer', dans: { role: 'row', nom: 'Martin' } }, "getByRole('row', { name: 'Martin' }).getByRole('button', { name: 'Supprimer' })"],
        [{ role: 'listitem', rang: 2 }, "getByRole('listitem').nth(1)"],
      ];
      for (const [c, attendu] of exemples) {
        const d = cibles.decrireCible(c);
        controle(`notation : ${attendu}`, d === attendu, d);
        const relue = cibles.cibleDepuisLocator(d);
        controle(`relue depuis la notation et réécrite en TOML : ${attendu}`, JSON.stringify(relue) === JSON.stringify(c) && JSON.stringify(lireToml(`cible = ${cibles.cibleToml(c)}`).cible) === JSON.stringify(c), JSON.stringify(relue));
      }
      controle('first() devient rang = 1', JSON.stringify(cibles.cibleDepuisLocator("getByRole('row').first()")) === '{"role":"row","rang":1}');
      controle('nom en expression régulière simple : texte', cibles.cibleDepuisLocator("getByRole('button', { name: /Enregistrer/ })")?.nom === 'Enregistrer');
      for (const x of ["getByRole('button', { name: /^Envoy(er|é)$/i })", "getByRole('row').filter({ hasText: 'x' })", "getByRole('row').last()", 'n\'importe quoi', "getByText('a').getByText('b').getByText('c').getByText('d')", "getByRole('buton')"]) {
        controle(`non convertible : ${x}`, cibles.cibleDepuisLocator(x) === null);
      }
      controle('css et rang sont fragiles, jusque dans « dans » (D4.INV-1)', cibles.estFragile({ css: 'p' }) && cibles.estFragile({ texte: 'x', rang: 1 }) && cibles.estFragile({ role: 'button', dans: { css: 'div' } }) && !cibles.estFragile({ role: 'button', nom: 'x', dans: { role: 'row' } }));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R5', 'Exécution complète dans le navigateur : chaque action, preuves, téléchargement, code 0');
    let rapportComplet = null;
    {
      const d = join(TMP, 'r5');
      mkdirSync(join(d, 'donnees'), { recursive: true });
      writeFileSync(join(d, 'donnees', 'piece.txt'), 'pièce jointe\n');
      const chemin = ecrire('r5', 'complet.toml', `format = "scenario-playwright.scenario/1"
titre = "Parcours complet"
etiquettes = ["DEMO-8-S01"]
url_base = "${base}"
delai = 10

[parametres]
nom = "Zoé Martin"

[[etapes]]
action = "naviguer"
url = "/clients"

[[etapes]]
action = "survoler"
cible = { role = "button", nom = "Menu" }

[[etapes]]
action = "verifier"
critere = "visible"
cible = { role = "link", nom = "Paramètres" }

[[etapes]]
action = "cliquer"
cible = { role = "link", nom = "Nouveau client" }

[[etapes]]
action = "saisir"
cible = { libelle = "Nom" }
valeur = "\${nom}"

[[etapes]]
action = "verifier"
critere = "valeur"
cible = { placeholder = "Nom du client" }
attendu = "\${nom}"

[[etapes]]
action = "choisir"
cible = { libelle = "Ville" }
valeur = "Marseille"

[[etapes]]
action = "cocher"
cible = { libelle = "Client actif" }
valeur = true

[[etapes]]
action = "televerser"
cible = { libelle = "Pièce jointe" }
fichier = "donnees/piece.txt"

[[etapes]]
action = "verifier"
critere = "actif"
cible = { role = "button", nom = "Archiver" }
attendu = false

[[etapes]]
action = "touche"
cible = { libelle = "Nom" }
touche = "Enter"
mutation = "creation"

[[etapes]]
action = "attendre"
etat = "url"
url = "/clients?cree=*"

[[etapes]]
action = "verifier"
critere = "contient"
cible = { role = "alert" }
attendu = "Client \${nom} créé"

[[etapes]]
action = "verifier"
critere = "url"
attendu = "/clients?cree=\${nom}"

[[etapes]]
action = "verifier"
critere = "nombre"
cible = { role = "button", nom = "Supprimer" }
attendu = 3

[[etapes]]
action = "verifier"
critere = "contient"
cible = { role = "cell", nom = "Marseille", exact = true }
attendu = "Marseille"
exact = true

[[etapes]]
action = "naviguer"
url = "/differe"

[[etapes]]
action = "attendre"
etat = "actif"
cible = { role = "button", nom = "Continuer" }

[[etapes]]
action = "attendre"
etat = "texte"
cible = { css = "#etat" }
texte = "Chargé"

[[etapes]]
action = "verifier"
critere = "visible"
cible = { texte = "Données chargées" }
attendu = true

[[etapes]]
action = "capturer"
nom = "titre"
cible = { role = "heading" }

[[etapes]]
action = "capturer"
nom = "page-entiere"
pleine_page = true

[[etapes]]
action = "naviguer"
url = "/export"

[[etapes]]
action = "telecharger"
cible = { role = "link", nom = "Exporter en CSV" }
nom = "export"
`);
      const r = await jouer(chemin);
      rapportComplet = r.rapport;
      const e = etapes(r);
      controle('vingt-quatre étapes réussies, code 0 (D1.INV-4)', r.code === 0 && r.rapport?.statut === 'reussi' && e.length === 24 && e.every((x) => x.statut === 'reussie'), `${r.code} ${r.sortie} ${r.erreurs}`);
      const cree = app.etat.ajouts.find((c) => c.nom === 'Zoé Martin');
      controle('saisie, liste, case et téléversement reçus par l\'application', cree && cree.ville === 'Marseille' && cree.actif === true && cree.piece === 'piece.txt', JSON.stringify(app.etat.ajouts));
      controle('rapport.json et rapport.md dans resultats/ à côté du scénario (D8.INV-1, D1.INV-2)', r.dossier && r.dossier.startsWith(join(d, 'resultats')) && existsSync(join(r.dossier, 'rapport.md')) && /# Réussi : Parcours complet/.test(readFileSync(join(r.dossier, 'rapport.md'), 'utf8')));
      const captures = e.filter((x) => x.action === 'verifier' || x.action === 'capturer');
      controle('une capture par vérification et par capture demandée (D8.INV-2)', captures.length === 10 && captures.every((x) => x.capture && existsSync(join(r.dossier, x.capture))), JSON.stringify(captures.map((x) => x.capture)));
      const tel = e.find((x) => x.action === 'telecharger')?.telechargement;
      controle('téléchargement enregistré avec son empreinte (D5.INV-5)', tel && tel.fichier === 'telechargements/export.csv' && tel.propose === 'clients.csv' && sha(join(r.dossier, tel.fichier)) === tel.sha256 && /Zoé Martin;Marseille/.test(readFileSync(join(r.dossier, tel.fichier), 'utf8')), JSON.stringify(tel));
      controle('chaque étape a sa durée, son résumé et sa cible', e.every((x) => Number.isInteger(x.duree_ms) && x.resume) && e[1].cible === "getByRole('button', { name: 'Menu' })");
      controle('cible CSS signalée fragile dans le rapport (D4.INV-1)', r.rapport?.cibles_fragiles.includes("locator('#etat')") && e[18].fragile === true);
      controle('navigateur, version et playwright-core notés (D6.INV-1)', r.rapport?.navigateur.canal === canal && /^\d+\./.test(r.rapport?.navigateur.version ?? '') && r.rapport?.navigateur.playwright_core === '1.65.1');
      controle('attente bornée qui s\'arrête dès l\'état obtenu (D5.INV-2)', e[17].duree_ms >= 500 && e[17].duree_ms < 4000, `${e[17].duree_ms} ms`);
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R6', 'Échecs : cible ambiguë sans action, vérifications qui se poursuivent, arrêt, preuves, code 1');
    {
      const avant = app.etat.clients.length;
      const ambigu = ecrire('r6', 'ambigu.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Ambigu"\nurl_base = "${base}"\n\n[[etapes]]\naction = "naviguer"\nurl = "/clients"\n\n[[etapes]]\naction = "cliquer"\ncible = { role = "button", nom = "Supprimer" }\nmutation = "suppression"\n\n[[etapes]]\naction = "verifier"\ncritere = "visible"\ncible = { role = "table" }\n`);
      const r1 = await jouer(ambigu);
      const e1 = etapes(r1);
      controle('cible ambiguë : échec, candidats cités, code 1 (D4.INV-2)', r1.code === 1 && e1[1]?.statut === 'echec' && /cible ambiguë, \d+ éléments trouvés, aucune action faite/.test(e1[1]?.message) && /aka getByRole\('row'|aka getByRole\('button'/.test(e1[1]?.message), JSON.stringify(e1[1]));
      controle('aucune suppression faite', app.etat.clients.length === avant);
      controle('étape suivante non jouée (D5.INV-3)', e1[2]?.statut === 'non_jouee' && /non jouée : l'étape 2 a échoué/.test(e1[2]?.message));
      controle('capture et instantané ARIA de l\'échec (D8.INV-2)', e1[1]?.capture && existsSync(join(r1.dossier, e1[1].capture)) && e1[1]?.aria && /Liste des clients|table/.test(readFileSync(join(r1.dossier, e1[1].aria), 'utf8')), JSON.stringify(e1[1]));
      const suite = ecrire('r6', 'verifications.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Vérifications"\nurl_base = "${base}"\n\n[[etapes]]\naction = "naviguer"\nurl = "/clients"\n\n[[etapes]]\naction = "verifier"\ncritere = "contient"\ncible = { role = "heading" }\nattendu = "Fournisseurs"\ndelai = 2\n\n[[etapes]]\naction = "verifier"\ncritere = "visible"\ncible = { role = "table" }\n\n[[etapes]]\naction = "verifier"\ncritere = "nombre"\ncible = { role = "button", nom = "Supprimer" }\nattendu = 99\ndelai = 2\n\n[[etapes]]\naction = "cliquer"\ncible = { role = "link", nom = "Clients" }\n`);
      const r2 = await jouer(suite);
      const e2 = etapes(r2);
      controle('une vérification échouée n\'arrête pas les vérifications suivantes (D5.INV-3)', e2.map((x) => x.statut).join() === 'reussie,echec,reussie,echec,non_jouee', e2.map((x) => x.statut).join());
      controle('message : attendu et obtenu (D5.INV-4)', /attendu : un texte qui contient « Fournisseurs » ; obtenu : texte « Clients »/.test(e2[1]?.message) && /attendu : 99 éléments ; obtenu : \d+ éléments/.test(e2[3]?.message), `${e2[1]?.message} | ${e2[3]?.message}`);
      controle('bilan : 2 réussies, 2 en échec, 1 non jouée', JSON.stringify(r2.rapport?.bilan) === '{"jeux":1,"etapes":5,"reussies":2,"echecs":2,"non_jouees":1}', JSON.stringify(r2.rapport?.bilan));
      const absente = ecrire('r6', 'absente.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Absente"\nurl_base = "${base}"\n\n[[etapes]]\naction = "naviguer"\nurl = "/clients"\n\n[[etapes]]\naction = "cliquer"\ncible = { role = "button", nom = "Inexistant" }\ndelai = 1\n`);
      const r3 = await jouer(absente);
      const e3 = etapes(r3);
      controle('cible absente : échec au délai de l\'étape, borné (D5.INV-2)', e3[1]?.statut === 'echec' && /délai de 1 s dépassé/.test(e3[1]?.message) && e3[1]?.duree_ms < 3000, JSON.stringify(e3[1]));
      const p404 = ecrire('r6', 'introuvable.toml', `format = "scenario-playwright.scenario/1"\ntitre = "404"\nurl_base = "${base}"\n\n[[etapes]]\naction = "naviguer"\nurl = "/inexistant"\n`);
      const r4 = await jouer(p404);
      controle('page qui répond 404 : échec de la navigation', r4.code === 1 && /répond 404/.test(etapes(r4)[0]?.message ?? ''));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R7', 'Garde des origines : requêtes, WebSocket et navigation vers une origine non déclarée');
    {
      const chemin = ecrire('r7', 'origines.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Origines"\nurl_base = "${base}"\n\n[[etapes]]\naction = "naviguer"\nurl = "/externe"\n\n[[etapes]]\naction = "verifier"\ncritere = "contient"\ncible = { texte = "Contenu local" }\nattendu = "Contenu local"\n\n[[etapes]]\naction = "naviguer"\nurl = "/ws"\n\n[[etapes]]\naction = "attendre"\netat = "texte"\ncible = { css = "#principal" }\ntexte = "écho bonjour"\n\n[[etapes]]\naction = "attendre"\netat = "texte"\ncible = { css = "#autre" }\ntexte = "fermé"\n\n[[etapes]]\naction = "naviguer"\nurl = "/"\n\n[[etapes]]\naction = "cliquer"\ncible = { role = "link", nom = "Lien externe" }\n\n[[etapes]]\naction = "verifier"\ncritere = "visible"\ncible = { role = "heading", nom = "Autre origine" }\n`);
      const r = await jouer(chemin);
      const e = etapes(r);
      controle('ressource d\'une autre origine bloquée, page locale servie', e[0]?.statut === 'reussie' && e[1]?.statut === 'reussie');
      controle('WebSocket de l\'origine déclarée : écho reçu', e[3]?.statut === 'reussie', JSON.stringify(e[3]));
      controle('WebSocket d\'une origine non déclarée : fermé (D7.INV-1)', e[4]?.statut === 'reussie', JSON.stringify(e[4]));
      controle('navigation vers une origine non déclarée : échec, page non chargée', e[6]?.statut === 'echec' && /origine non déclarée/.test(e[6]?.message) && e[7]?.statut === 'non_jouee', JSON.stringify(e[6]));
      const bloquee = r.rapport?.origines_bloquees.find((o) => o.origine === autre);
      controle('origine bloquée comptée dans le rapport', bloquee && bloquee.requetes >= 3, JSON.stringify(r.rapport?.origines_bloquees));
      controle('origine bloquée citée en fin d\'exécution', r.sortie.includes(`origine bloquée : ${autre}`));
      const permise = ecrire('r7', 'permise.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Permise"\nurl_base = "${base}"\norigines = ["${base}", "${autre}"]\n\n[[etapes]]\naction = "naviguer"\nurl = "/"\n\n[[etapes]]\naction = "cliquer"\ncible = { role = "link", nom = "Lien externe" }\n\n[[etapes]]\naction = "verifier"\ncritere = "visible"\ncible = { role = "heading", nom = "Autre origine" }\n`);
      const r2 = await jouer(permise);
      controle('origine déclarée : la navigation passe', r2.code === 0, r2.sortie);
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R8', 'Mutations hors du poste : refus sans --autoriser-mutations, garde à l\'étape');
    {
      controle('127.0.0.1, localhost et [::1] sont sur le poste ; 127.0.0.2 et un domaine non', session.estLocale('http://127.0.0.1:3000') && session.estLocale('http://localhost') && session.estLocale('http://[::1]:8080') && !session.estLocale('http://127.0.0.2:3000') && !session.estLocale('https://recette.exemple.fr'));
      const cible = distante ?? 'http://127.0.0.2:9';
      const chemin = ecrire('r8', 'distant.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Distant"\nurl_base = "${cible}"\n\n[[etapes]]\naction = "naviguer"\nurl = "/compteur"\n\n[[etapes]]\naction = "cliquer"\ncible = { role = "button", nom = "Ajouter" }\nmutation = "creation"\n\n[[etapes]]\naction = "verifier"\ncritere = "contient"\ncible = { css = "#v" }\nattendu = "1"\n`);
      const avant = app.etat.compteur;
      const r1 = await jouer(chemin);
      controle('refus avant le navigateur, code 2, rien d\'écrit (D7.INV-2)', r1.code === 2 && /--autoriser-mutations/.test(r1.erreurs) && r1.dossier === null && !existsSync(join(TMP, 'r8', 'resultats')) && app.etat.compteur === avant, r1.erreurs);
      if (!distante) {
        saut('mutation autorisée hors du poste', '127.0.0.2 indisponible sur ce système');
        saut('garde à l\'étape', '127.0.0.2 indisponible sur ce système');
      } else {
        const r2 = await jouer(chemin, ['--autoriser-mutations']);
        controle('avec --autoriser-mutations : jouée, notée dans le rapport', r2.code === 0 && app.etat.compteur === avant + 1 && r2.rapport?.options.mutations_autorisees === true, r2.sortie + r2.erreurs);
        const sc = scenario.validerScenario(lireToml(readFileSync(chemin, 'utf8'))).scenario;
        const { jeux } = scenario.preparerJeux(sc, join(TMP, 'r8'));
        const ctx = await session.ouvrirNavigateur({ canal, profil: join(TMP, 'profils', 'api') });
        try {
          const dossier = rapport.dossierResultats(join(TMP, 'r8', 'api'), 'distant');
          const journal = await session.garderOrigines(ctx, sc.origines);
          const joues = await moteur.jouerScenario(ctx, { scenario: sc, jeux, resultats: dossier, journal, delai: 10, autoriserMutations: false });
          const e = joues[0].etapes;
          controle('garde à l\'étape par l\'API : mutation sur une page hors du poste refusée, sans action', e[1].statut === 'echec' && /hors du poste, sans --autoriser-mutations : aucune action faite/.test(e[1].message) && app.etat.compteur === avant + 1, JSON.stringify(e[1]));
        } finally {
          await fermer(ctx);
        }
      }
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R9', 'Étape à la main : attente de l\'état, délai, refus sans fenêtre');
    {
      const corps = (auto, delai, jusqua) => `format = "scenario-playwright.scenario/1"\ntitre = "Main"\nurl_base = "${base}"\n\n[[etapes]]\naction = "naviguer"\nurl = "/connexion?auto=${auto}"\n\n[[etapes]]\naction = "main"\nmessage = "Connectez-vous"\njusqua = ${jusqua}\ndelai = ${delai}\n\n[[etapes]]\naction = "verifier"\ncritere = "contient"\ncible = { role = "heading" }\nattendu = "Espace connecté"\n`;
      const r1 = await jouer(ecrire('r9', 'main.toml', corps(800, 10, '{ url = "/accueil-connecte" }')));
      controle('le développeur atteint l\'état : la suite reprend (D6.INV-3)', r1.code === 0 && etapes(r1)[1]?.duree_ms >= 500, r1.sortie);
      controle('message à la main affiché', /À VOUS : Connectez-vous — la suite reprend dès que l'adresse \/accueil-connecte est atteinte \(10 s au plus\)/.test(r1.sortie), r1.sortie);
      const r2 = await jouer(ecrire('r9', 'main-cible.toml', corps(600, 10, '{ cible = { role = "heading", nom = "Espace connecté" } }')));
      controle('jusqua par une cible visible', r2.code === 0, r2.sortie);
      const r3 = await jouer(ecrire('r9', 'main-delai.toml', corps(5000, 1, '{ url = "/accueil-connecte" }')));
      controle('délai dépassé : échec de l\'étape à la main', r3.code === 1 && /non terminée en 1 s/.test(etapes(r3)[1]?.message ?? ''), JSON.stringify(etapes(r3)[1]));
      const r4 = await jouer(join(TMP, 'r9', 'main.toml'), ['--sans-tete']);
      controle('--sans-tete refusé avec une étape à la main, code 2', r4.code === 2 && /D6\.INV-3/.test(r4.erreurs));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R10', 'Paramètres et jeux de valeurs : priorité, un rapport par jeu, --jeu');
    {
      const chemin = ecrire('r10', 'jeux.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Jeux"\nurl_base = "${base}"\n\n[parametres]\nville = "Paris"\n\n[[jeux]]\nnom = "Alpha"\n\n[[jeux]]\nnom = "Bêta"\n\n[[etapes]]\naction = "naviguer"\nurl = "/clients/nouveau"\n\n[[etapes]]\naction = "saisir"\ncible = { libelle = "Nom" }\nvaleur = "\${nom}"\n\n[[etapes]]\naction = "choisir"\ncible = { libelle = "Ville" }\nvaleur = "\${ville}"\n\n[[etapes]]\naction = "cliquer"\ncible = { role = "button", nom = "Enregistrer" }\nmutation = "creation"\n\n[[etapes]]\naction = "verifier"\ncritere = "contient"\ncible = { role = "alert" }\nattendu = "\${nom}"\n`);
      const r1 = await jouer(chemin, ['--param', 'ville=Lyon']);
      controle('deux jeux joués, chacun avec ses valeurs', r1.code === 0 && r1.rapport?.jeux.length === 2 && r1.rapport?.jeux.map((j) => `${j.valeurs.nom}/${j.valeurs.ville}`).join() === 'Alpha/Lyon,Bêta/Lyon', JSON.stringify(r1.rapport?.jeux.map((j) => j.valeurs)));
      controle('--param l\'emporte sur [parametres] (D3.INV-6)', ['Alpha', 'Bêta'].every((n) => app.etat.ajouts.find((c) => c.nom === n)?.ville === 'Lyon'));
      controle('captures préfixées par le jeu', etapes(r1).filter((x) => x.capture).map((x) => x.capture).join() === 'captures/j1-05-verifier.png,captures/j2-05-verifier.png');
      const r2 = await jouer(chemin, ['--param', 'pays=FR']);
      controle('--param inconnu : code 2', r2.code === 2 && /--param pays/.test(r2.erreurs));
      const r3 = await jouer(chemin, ['--jeu', '2']);
      controle('--jeu 2 : le seul jeu 2', r3.code === 0 && r3.rapport?.jeux.length === 1 && r3.rapport?.jeux[0].numero === 2);
      const r4 = await jouer(chemin, ['--jeu', '3']);
      controle('--jeu 3 : code 2', r4.code === 2);
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R11', 'Profil dédié et réglages : session retrouvée, profils séparés, variables');
    {
      const connexion = ecrire('r11', 'connexion.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Connexion"\nurl_base = "${base}"\nprofil = "essai"\n\n[[etapes]]\naction = "naviguer"\nurl = "/connexion?auto=200"\n\n[[etapes]]\naction = "main"\nmessage = "Connectez-vous"\njusqua = { url = "/accueil-connecte" }\ndelai = 10\n`);
      const r1 = await jouer(connexion);
      controle('connexion faite dans la fenêtre, profil créé', r1.code === 0 && existsSync(join(TMP, 'profils', 'essai')));
      const session2 = (profil, attendu) => `format = "scenario-playwright.scenario/1"\ntitre = "Session"\nurl_base = "${base}"\nprofil = "${profil}"\n\n[[etapes]]\naction = "naviguer"\nurl = "/session"\n\n[[etapes]]\naction = "verifier"\ncritere = "contient"\ncible = { css = "#s" }\nattendu = "${attendu}"\n`;
      const r2 = await jouer(ecrire('r11', 'meme.toml', session2('essai', 'Session : ouverte')));
      controle('même profil : session retrouvée sans se reconnecter (D6.INV-2)', r2.code === 0, JSON.stringify(etapes(r2)[1]));
      const r3 = await jouer(ecrire('r11', 'autre.toml', session2('autre', 'Session : absente')));
      controle('autre profil : session absente', r3.code === 0);
      const def = session.lireReglages({});
      controle('défauts : chrome, .profils dans le dossier du skill, délai du scénario (D1.INV-3)', def.erreurs.length === 0 && def.reglages.canal === 'chrome' && def.reglages.profils === join(session.DOSSIER_SKILL, '.profils') && def.reglages.delai === undefined);
      const vides = session.lireReglages({ SCENARIO_PLAYWRIGHT_CANAL: '', SCENARIO_PLAYWRIGHT_PROFILS: '', SCENARIO_PLAYWRIGHT_DELAI: '' });
      controle('variable vide vaut absente', vides.erreurs.length === 0 && vides.reglages.canal === 'chrome');
      const faux = session.lireReglages({ SCENARIO_PLAYWRIGHT_CANAL: 'firefox', SCENARIO_PLAYWRIGHT_DELAI: '45' });
      controle('canal et délai invalides refusés', faux.erreurs.length === 2);
      controle('dossier des profils relatif au skill, ou absolu', session.lireReglages({ SCENARIO_PLAYWRIGHT_PROFILS: 'p' }).reglages.profils === join(session.DOSSIER_SKILL, 'p') && session.lireReglages({ SCENARIO_PLAYWRIGHT_PROFILS: TMP }).reglages.profils === TMP);
      const r4 = await jouer(join(TMP, 'r11', 'meme.toml'), [], { env: { ...ENV, SCENARIO_PLAYWRIGHT_CANAL: 'firefox' } });
      controle('canal invalide : code 2 avant le navigateur', r4.code === 2 && /SCENARIO_PLAYWRIGHT_CANAL/.test(r4.erreurs));
      const lent = ecrire('r11', 'delai.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Délai"\nurl_base = "${base}"\n\n[[etapes]]\naction = "naviguer"\nurl = "/clients"\ndelai = 10\n\n[[etapes]]\naction = "cliquer"\ncible = { role = "button", nom = "Inexistant" }\n`);
      const r5 = await jouer(lent, [], { env: { ...ENV, SCENARIO_PLAYWRIGHT_DELAI: '1' } });
      controle('SCENARIO_PLAYWRIGHT_DELAI s\'applique sans délai dans le scénario', /délai de 1 s dépassé/.test(etapes(r5)[1]?.message ?? ''), JSON.stringify(etapes(r5)[1]));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R12', 'Lignes de commande et codes de sortie');
    {
      const ok = join(TMP, 'r11', 'meme.toml');
      const cas = [
        ['jouer sans argument', 'jouer.mjs', [], 2, /scénario manquant/],
        ['option inconnue', 'jouer.mjs', [ok, '--vite'], 2, /option inconnue/],
        ['deux scénarios', 'jouer.mjs', [ok, ok], 2, /un seul scénario/],
        ['--param mal formé', 'jouer.mjs', [ok, '--param', 'ville'], 2, /nom=valeur/],
        ['--ralenti hors bornes', 'jouer.mjs', [ok, '--ralenti', '5000'], 2, /de 0 à 2000/],
        ['scénario introuvable', 'jouer.mjs', [join(TMP, 'absent.toml')], 2, /fichier introuvable/],
        ['verifier sans fichier', 'verifier.mjs', [], 2, /aucun fichier/],
        ['traduire autre chose qu\'un .scenario', 'traduire.mjs', [ok], 2, /fichier \.scenario attendu/],
        ['designer sans adresse http', 'designer.mjs', ['ftp://x'], 2, /adresse http ou https/],
        ['designer --max hors bornes', 'designer.mjs', [base, '--max', '0'], 2, /--max/],
      ];
      for (const [nom, script, args, code, motif] of cas) {
        const r = await lancer(script, args);
        controle(`${nom} : code ${code}`, r.code === code && motif.test(r.erreurs + r.sortie), `${r.code} ${r.erreurs}`);
      }
      const v = await lancer('verifier.mjs', [ok, join(TMP, 'r3', 'creer.scenario')]);
      controle('verifier : un texte et un scénario conformes, code 0', v.code === 0 && (v.sortie.match(/^ok {2}/gm) ?? []).length === 2, v.sortie);
      const v2 = await lancer('verifier.mjs', [ok, join(TMP, 'r2', 'syntaxe.toml')]);
      controle('verifier : un fichier refusé suffit pour le code 2', v2.code === 2);
      const v3 = await lancer('verifier.mjs', [join(TMP, 'r8', 'distant.toml')]);
      controle('verifier signale les mutations hors du poste', v3.code === 0 && /se joue avec --autoriser-mutations/.test(v3.sortie));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R13', 'Désignation : clic du développeur, cible rendue, page non actionnée');
    {
      const ctx = await session.ouvrirNavigateur({ canal, profil: join(TMP, 'profils', 'designer') });
      try {
        const page = ctx.pages()[0] ?? await ctx.newPage();
        await page.goto(`${base}/clients`);
        const avant = app.etat.clients.length;
        const rendues = [];
        const cliquer = async (loc) => {
          const b = await loc.boundingBox();
          await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
          await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
        };
        const promesse = designer(page, { max: 2, surCible: (r) => rendues.push(r) });
        await new Promise((r) => { setTimeout(r, 400); });
        await cliquer(page.getByRole('link', { name: 'Nouveau client' }));
        await new Promise((r) => { setTimeout(r, 400); });
        await cliquer(page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'Martin', exact: true }) }).getByRole('button'));
        const fin = await Promise.race([promesse, new Promise((r) => { setTimeout(() => r(null), 10_000); })]);
        controle('deux clics, deux cibles rendues', fin && rendues.length === 2, JSON.stringify(rendues));
        controle('lien rendu par son rôle et son nom', JSON.stringify(rendues[0]?.cible) === '{"role":"link","nom":"Nouveau client"}', JSON.stringify(rendues[0]));
        controle('bouton d\'une ligne rendu avec « dans »', rendues[1]?.cible?.role === 'button' && rendues[1]?.cible?.dans?.role === 'row', JSON.stringify(rendues[1]));
        controle('le clic de désignation n\'actionne pas la page (D9.INV-1)', page.url() === `${base}/clients` && app.etat.clients.length === avant);
        controle('cible rendue au format du scénario', /^\{ role = "link", nom = "Nouveau client" \}$/.test(cibles.cibleToml(rendues[0]?.cible ?? { texte: '?' })));
      } finally {
        await fermer(ctx);
      }
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R14', 'Compatibilité avec le navigateur du poste');
    {
      const ref = session.reference();
      controle('playwright-core 1.65.1, Chromium 159 de référence', ref.playwrightCore === '1.65.1' && ref.majeur === 159, JSON.stringify(ref));
      const c = (v) => session.compatibilite(v, ref);
      controle('même version majeure, ou une ou deux avant : sans avertissement', c('159.0.8154.6').avertissement === null && c('158.0.8127.65').avertissement === null && c('157.0.1').avertissement === null);
      controle('trois versions avant : avertissement « ancien » (D6.INV-1)', /ancien, 3 versions avant/.test(c('156.0.1').avertissement ?? ''));
      controle('plus récent que le Chromium de référence : avertissement', /plus récent que le Chromium 159/.test(c('160.0.1').avertissement ?? ''));
      controle('version illisible : avertissement', /illisible/.test(c('inconnue').avertissement ?? ''));
      controle('le rapport porte l\'avertissement de sa version', rapportComplet && rapportComplet.navigateur.avertissement === c(rapportComplet.navigateur.version).avertissement);
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R15', 'Dépendance unique, fichiers de travail écartés, aucun code exécuté dans la page');
    {
      const paquet = JSON.parse(readFileSync(join(SKILL, 'package.json'), 'utf8'));
      const verrou = JSON.parse(readFileSync(join(SKILL, 'package-lock.json'), 'utf8'));
      controle('une seule dépendance, playwright-core à version exacte (D1.INV-1)', JSON.stringify(paquet.dependencies) === '{"playwright-core":"1.65.1"}' && verrou.packages['node_modules/playwright-core'].version === '1.65.1' && Object.keys(verrou.packages).length === 2);
      controle('Node 22 ou plus récent', paquet.engines.node === '>=22' && Number(process.versions.node.split('.')[0]) >= 22);
      const ignores = readFileSync(join(SKILL, '.gitignore'), 'utf8');
      controle('.gitignore écarte node_modules/, .profils/ et resultats/ (D1.INV-2)', ['node_modules/', '.profils/', 'resultats/'].every((x) => ignores.split('\n').includes(x)));
      const sources = readdirSync(join(SKILL, 'scripts')).filter((f) => f.endsWith('.mjs')).map((f) => [f, readFileSync(join(SKILL, 'scripts', f), 'utf8')]);
      const interdits = ['.evaluate(', 'evaluateHandle', 'addInitScript', 'exposeFunction', 'exposeBinding', 'waitForTimeout', 'addScriptTag', '$eval', '$$eval', 'new Function', 'eval('];
      const trouves = sources.flatMap(([f, s]) => interdits.filter((x) => s.includes(x)).map((x) => `${f} : ${x}`));
      controle('aucune exécution de code dans la page dans les sources (D5.INV-1)', trouves.length === 0, trouves.join(', '));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R16', 'Points d\'extension : rapport (E1), format du scénario (E2), moteur (E3)');
    {
      const r = rapportComplet;
      const champs = ['format', 'skill', 'version', 'scenario', 'debut', 'fin', 'duree_ms', 'navigateur', 'options', 'jeux', 'origines_bloquees', 'cibles_fragiles', 'bilan', 'statut'];
      controle('E1 : champs du rapport', r && JSON.stringify(Object.keys(r)) === JSON.stringify(champs) && r.format === rapport.FORMAT_RAPPORT, JSON.stringify(r && Object.keys(r)));
      const champsEtape = ['numero', 'ligne', 'action', 'resume', 'cible', 'fragile', 'mutation', 'statut', 'duree_ms', 'message', 'capture', 'aria', 'telechargement', 'console', 'erreurs_page', 'reponses'];
      controle('E1 : champs de chaque étape', r && r.jeux[0].etapes.every((e) => JSON.stringify(Object.keys(e)) === JSON.stringify(champsEtape)));
      controle('E1 : champs du navigateur, du scénario et des options', r && JSON.stringify(Object.keys(r.navigateur)) === '["canal","version","playwright_core","chromium_reference","avertissement"]' && JSON.stringify(Object.keys(r.scenario)) === '["fichier","titre","etiquettes","source","empreinte","url_base","origines"]' && JSON.stringify(Object.keys(r.options)) === '["sans_tete","ralenti","trace","mutations_autorisees","params","jeu"]');
      controle('E2 : format et vocabulaire communs avec le navigateur d\'Agent2Test', scenario.FORMAT_SCENARIO === 'scenario-playwright.scenario/1' && ['naviguer', 'cliquer', 'saisir', 'choisir', 'cocher', 'survoler', 'touche', 'televerser', 'attendre', 'verifier'].every((a) => a in scenario.ACTIONS) && JSON.stringify(scenario.CRITERES) === '["contient","visible","valeur","nombre","url","actif"]');
      controle('E3 : fonctions exportées du moteur et de la session', ['jouerScenario', 'messageErreur', 'adresseCorrespond'].every((f) => typeof moteur[f] === 'function') && ['ouvrirNavigateur', 'garderOrigines', 'lireReglages', 'compatibilite'].every((f) => typeof session[f] === 'function') && ['lireScenario', 'preparerJeux', 'controlerTraduction', 'squeletteToml', 'planTraduction'].every((f) => typeof scenario[f] === 'function'));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R17', 'Preuves : console, erreurs de la page, réponses en erreur, trace sur demande');
    {
      const chemin = ecrire('r17', 'erreurs.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Erreurs"\nurl_base = "${base}"\n\n[[etapes]]\naction = "naviguer"\nurl = "/erreurs"\n\n[[etapes]]\naction = "verifier"\ncritere = "contient"\ncible = { role = "paragraph" }\nattendu = "Page qui se plaint"\n`);
      const r = await jouer(chemin, ['--trace']);
      const e = etapes(r);
      const consoles = e.flatMap((x) => x.console);
      const pages = e.flatMap((x) => x.erreurs_page);
      const reponses = e.flatMap((x) => x.reponses);
      controle('erreur de console relevée (D8.INV-2)', contient(consoles, 'erreur de démonstration'), JSON.stringify(consoles));
      controle('exception de la page relevée', contient(pages, 'exception de démonstration'), JSON.stringify(pages));
      controle('réponse 500 relevée', contient(reponses, /^500 .*\/manquant$/), JSON.stringify(reponses));
      controle('les erreurs de l\'application ne font pas échouer les étapes', r.code === 0);
      controle('trace enregistrée sur demande, avec l\'avertissement (D7.INV-3)', existsSync(join(r.dossier ?? TMP, 'trace.zip')) && r.rapport?.options.trace === true && /contient les cookies et les en-têtes de la session/.test(readFileSync(join(r.dossier, 'rapport.md'), 'utf8')));
      const sans = await jouer(chemin);
      controle('sans --trace, aucune trace', sans.code === 0 && !existsSync(join(sans.dossier ?? TMP, 'trace.zip')));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R18', 'Page Jira enregistrée : MHTML décodé, Jira Cloud et Data Center, zones lues, commentaires sur demande');
    {
      const demandes = demandesJira();
      const html8 = pageJira(demandes['DEMO-8']);
      const html9 = pageJira(demandes['DEMO-9']);
      const qp = jira.lireMhtml(enMhtml(html8, { emplacement: 'https://jira.exemple.test/browse/DEMO-8' }));
      controle('MHTML en quoted-printable, UTF-8 : page restituée', qp.html.replace(/\r\n/g, '\n') === html8 && qp.emplacement === 'https://jira.exemple.test/browse/DEMO-8' && /^[0-9a-f]{64}$/.test(qp.sha256));
      const b64 = jira.lireMhtml(enMhtml(html9, { emplacement: 'https://jira.exemple.test/browse/DEMO-9', encodage: 'base64', charset: 'iso-8859-1' }));
      controle('MHTML en base64, ISO-8859-1 : accents restitués', b64.html === html9 && b64.html.includes('Critères d\'acceptation'));
      controle('fichier qui n\'est pas un MHTML : refusé', leve(() => jira.lireMhtml(Buffer.from('<html><body>page</body></html>'))) instanceof jira.ErreurJira);
      const cloud = jira.lireDemande(qp.html, qp.emplacement);
      controle('Jira Cloud : variante, clé, résumé, adresse', cloud.variante === 'cloud' && cloud.cle === 'DEMO-8' && cloud.resume === 'Créer un client depuis Jira' && cloud.url === qp.emplacement);
      controle('Jira Cloud : description et champ de texte lus, sans les commentaires (D16.INV-2)', JSON.stringify(cloud.zones.map((z) => z.libelle)) === '["description","champ customfield_10042"]', JSON.stringify(cloud.zones.map((z) => z.libelle)));
      const avec = jira.lireDemande(qp.html, qp.emplacement, { commentaires: true });
      controle('Jira Cloud, commentaires demandés : lus avec leur auteur et leur date', avec.zones.length === 3 && avec.zones[2].libelle === 'commentaire de Zoé Martin du 2026-11-18' && avec.zones[2].lignes.includes('Scénario: Annuler la création'), JSON.stringify(avec.zones[2]));
      const dc = jira.lireDemande(b64.html, b64.emplacement, { commentaires: true });
      controle('Jira Data Center : variante, clé, champ nommé par son libellé, commentaire', dc.variante === 'datacenter' && dc.cle === 'DEMO-9' && dc.resume === 'Exporter les clients' && JSON.stringify(dc.zones.map((z) => z.libelle)) === '["description","champ « Critères d\'acceptation »","commentaire de Paul Durand du 2026-11-19"]', JSON.stringify(dc.zones.map((z) => z.libelle)));
      const lignes = jira.htmlEnLignes('<p>Un&nbsp;deux<br/>trois</p><pre>a\n  b</pre><table><tr><th><p>nom</p></th><th>ville</th></tr><tr><td>A | B</td><td>Lyon</td></tr></table><script>Scénario: caché</script>').filter(Boolean);
      controle('lignes du HTML : blocs, <br>, <pre>, tableaux en | a | b |, scripts écartés', JSON.stringify(lignes) === JSON.stringify(['Un deux', 'trois', 'a', 'b', '| nom | ville |', '| A \\| B | Lyon |']), JSON.stringify(lignes));
      controle('page qui n\'est pas une demande Jira : refusée (D16.INV-2)', /non reconnue comme une demande/.test(leve(() => jira.lireDemande('<html><title>[DEMO-1] X</title><body><p>Scénario: A</p></body></html>'))?.message ?? ''));
      const plus = jira.lireDemande(pageJira({ ...demandes['DEMO-8'], plus: true }), '', { commentaires: true });
      controle('commentaires repliés signalés en limite', plus.limites.some((l) => /afficher plus/.test(l)), JSON.stringify(plus.limites));
      controle('clé lue dans l\'adresse quand le titre n\'en a pas', jira.lireDemande(html8.replace('[DEMO-8] ', ''), 'https://jira.exemple.test/browse/DEMO-8').cle === 'DEMO-8');
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R19', 'Scénarios de la demande : Gherkin en français ou en anglais, contexte, étiquettes, refus, texte importé et provenance');
    {
      const demandes = demandesJira();
      const page8 = jira.lireDemande(pageJira(demandes['DEMO-8']), '', { commentaires: true });
      const { scenarios: sc8, horsScenario } = jira.extraireScenarios(page8.zones);
      jira.attribuerEtiquettes(sc8, 'DEMO-8');
      controle('cinq scénarios, dans l\'ordre de la page, chacun avec sa zone', sc8.map((s) => `${s.titre}/${s.zone}`).join('|') === 'Créer un client/description|Ouvrir le formulaire/description|Créer plusieurs clients/description|Export the clients/champ|Annuler la création/commentaire', sc8.map((s) => s.titre).join('|'));
      controle('contexte de la fonctionnalité en tête des étapes ; ligne de description ignorée', sc8[0].contexte === 1 && sc8[0].etapes[0].phrase === 'je suis sur la page des clients' && sc8[1].etapes.length === 3);
      controle('mots-clés recopiés tels qu\'écrits, en français et en anglais (D16.INV-3)', sc8[2].motTitre === 'Plan du scénario' && sc8[0].etapes.map((e) => e.motCle).join('|') === 'Étant donné que|Quand|Et|Et|Alors' && sc8[3].etapes.map((e) => e.motCle).join('|') === 'Given|When|Then');
      controle('étiquettes de la fonctionnalité reprises par ses scénarios', JSON.stringify(sc8[0].etiquettesJira) === '["DEMO-8","DEMO-8-S02","DEMO-8-CA01"]' && sc8[1].etiquettesJira.includes('DEMO-8'));
      controle('étiquette de Jira gardée, sinon le plus petit numéro libre, dans l\'ordre de la page (D16.INV-4)', sc8.map((s) => `${s.etiquette}${s.attribuee ? '*' : ''}`).join(' ') === 'DEMO-8-S02 DEMO-8-S01* DEMO-8-S03* DEMO-8-S04 DEMO-8-S05*', sc8.map((s) => s.etiquette).join(' '));
      controle('ligne d\'étape hors d\'un scénario comptée, non importée', horsScenario.length === 1 && horsScenario[0].lignes === 1 && horsScenario[0].zone === 'description', JSON.stringify(horsScenario));
      const zone = (t) => [{ zone: 'description', libelle: 'description', lignes: t.split('\n').map((l) => l.trim()) }];
      const refus = jira.extraireScenarios(zone('Scénario: Table\n  Quand je saisis :\n  | a | b |\nScénario: Doc\n  Quand j\'écris :\n  """\n  texte\n  """\nScenario Outline: Deux\n  When <a>\n  Examples:\n  | a |\n  | 1 |\n  Examples:\n  | a |\n  | 2 |\nScénario: Vide\nRègle: R\n  Contexte:\n    Soit une table\n    | x |\n  Scénario: Hérite\n    Quand x\n')).scenarios;
      controle('refus motivés : table d\'étape, texte multiligne, deux tableaux d\'exemples, scénario sans étape, contexte avec table', refus.map((s) => (s.refus ? s.refus.split(' ')[0] : 'ok')).join('|') === 'table|texte|plusieurs|scénario|table', refus.map((s) => s.refus).join(' | '));
      const regle = jira.extraireScenarios(zone('@F\nFeature: F\n  Background:\n    Given a\n  @R\n  Rule: R1\n    Background:\n      Given b\n    @S\n    Scenario: S1\n      When c\n      Then d\n')).scenarios[0];
      controle('règle : étiquettes et contexte de la fonctionnalité, puis de la règle', JSON.stringify(regle.etiquettesJira) === '["F","R","S"]' && regle.etapes.map((e) => e.phrase).join('') === 'abcd' && regle.contexte === 2, JSON.stringify(regle));
      const doublons = jira.attribuerEtiquettes(jira.extraireScenarios(zone('@X-1-S01\nScénario: A\n  Quand a\n@X-1-S01\nScénario: B\n  Quand b\n')).scenarios, 'X-1');
      controle('même étiquette sur deux scénarios : le second est un doublon', doublons[0].doublonDe === null && doublons[1].doublonDe === 'A');
      const reglages = { cle: 'DEMO-8', resume: page8.resume, source: 'https://jira.exemple.test/browse/DEMO-8', page: { chemin: 'jira/DEMO-8.mhtml', sha256: 'a'.repeat(64) }, date: '2026-11-20T18:00:00Z', adresse: base, origines: [base], profil: 'crm' };
      const plan = jira.texteImporte(sc8[2], reglages);
      const lu = plan.texte ? texte.analyserTexte(plan.texte) : null;
      controle('texte importé valide : réglages donnés, étapes et exemples de Jira', plan.erreurs.length === 0 && lu.erreurs.length === 0 && lu.scenario.adresse === base && lu.scenario.profil === 'crm' && lu.scenario.etapes.length === 6 && lu.scenario.jeux.length === 2, JSON.stringify(plan.erreurs));
      controle('colonnes d\'exemples adaptées au format texte, avec leurs variables', lu !== null && JSON.stringify(Object.keys(lu.scenario.jeux[0])) === '["nom_du_client","ville"]' && lu.scenario.etapes[2].phrase === 'je saisis « <nom_du_client> » dans le champ « Nom »' && /« Nom du client » en <nom_du_client>/.test(plan.texte));
      controle('provenance en tête : demande, scénario et zone, source, page, empreintes (D16.INV-4)', /^# Importé de Jira par importer\.mjs/.test(plan.texte) && plan.texte.includes('# Demande : DEMO-8, « Créer un client depuis Jira »') && plan.texte.includes('# Scénario : @DEMO-8-S03, description') && plan.texte.includes('# Source : https://jira.exemple.test/browse/DEMO-8') && plan.texte.includes('# Page enregistrée : jira/DEMO-8.mhtml') && plan.texte.includes(`# Empreinte Jira : ${sc8[2].empreinte}`) && /# Étiquette @DEMO-8-S03 attribuée par l'import/.test(plan.texte) && /# Contexte de Jira reporté en tête des étapes : 1 étape\./.test(plan.texte));
      const p = jira.lireProvenance(plan.texte);
      controle('provenance relue : clé, étiquette attribuée, empreinte, texte non retouché', p.cle === 'DEMO-8' && p.etiquette === 'DEMO-8-S03' && p.attribuee === true && p.empreinte === sc8[2].empreinte && p.retouche === false, JSON.stringify(p));
      controle('retouche du corps détectée, même texte en CRLF non retouché ; texte écrit à la main sans provenance', jira.lireProvenance(plan.texte.replace('Et je clique', 'Et je clique vite')).retouche === true && jira.lireProvenance(plan.texte.replace(/\n/g, '\r\n')).retouche === false && jira.lireProvenance(TEXTE_COMPLET(base)) === null);
      const empreinte = (d) => jira.extraireScenarios(jira.lireDemande(pageJira(d), '').zones).scenarios[0].empreinte;
      controle('empreinte Jira stable, insensible à la prose, changée par une étape', empreinte(demandes['DEMO-8']) === sc8[0].empreinte && empreinte({ ...demandes['DEMO-8'], description: demandes['DEMO-8'].description.replace('Hors périmètre', 'Plus tard') }) === sc8[0].empreinte && empreinte({ ...demandes['DEMO-8'], description: descriptionCloud().replace('« Durand »', '« Dubois »') }) !== sc8[0].empreinte);
      const invalide = jira.texteImporte({ ...sc8[1], etapes: [...sc8[1].etapes, { motCle: 'Quand', phrase: 'je saisis <inconnu>' }] }, reglages);
      controle('texte importé invalide : non écrit, erreur avec la ligne qu\'elle concerne', invalide.texte === null && invalide.erreurs.some((e) => e.includes('« Quand je saisis <inconnu> »') && e.includes('non déclarée')), JSON.stringify(invalide.erreurs));
      controle('réglages de l\'import contrôlés avant toute écriture', jira.verifierReglages({ adresse: 'ftp://x' }).length === 1 && jira.verifierReglages({ adresse: base, origines: ['http://b.test'] }).some((e) => /doit contenir/.test(e)) && jira.verifierReglages({ adresse: base, profil: 'Mon profil' }).length === 1 && jira.verifierReglages({ adresse: base, origines: [base], profil: 'crm' }).length === 0);
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R20', 'importer.mjs sur une page enregistrée : textes écrits, réimport, comparaison, remplacement, conflits, codes de sortie');
    {
      const demandes = demandesJira();
      const dossierPages = join(TMP, 'r20-pages');
      mkdirSync(dossierPages, { recursive: true });
      const pageMhtml = (nom, d, options = {}) => {
        const chemin = join(dossierPages, nom);
        writeFileSync(chemin, enMhtml(pageJira(d), { emplacement: `https://jira.exemple.test/browse/${d.cle}`, ...options }));
        return chemin;
      };
      const etatsDe = (sortie) => [...sortie.matchAll(/^ {2}(\S+)\s+@(\S+)/gm)].map((m) => `${m[1]} ${m[2]}`);
      const empreintes = (d) => readdirSync(d, { withFileTypes: true }).filter((f) => f.isFile()).map((f) => `${f.name}:${sha(join(d, f.name))}`).join();
      const p8 = pageMhtml('DEMO-8.mhtml', demandes['DEMO-8']);
      const d = join(TMP, 'r20');
      let r = await lancer('importer.mjs', [p8, '--adresse', base, '--origines', base, '--profil', 'crm', '--dossier', d]);
      controle('import : quatre textes écrits, code 0', r.code === 0 && JSON.stringify(etatsDe(r.sortie)) === JSON.stringify(['écrit DEMO-8-S02', 'écrit DEMO-8-S01', 'écrit DEMO-8-S03', 'écrit DEMO-8-S04']), r.sortie + r.erreurs);
      controle('un texte par scénario, nommé par son étiquette', ['DEMO-8-S01', 'DEMO-8-S02', 'DEMO-8-S03', 'DEMO-8-S04'].every((n) => existsSync(join(d, `${n}.scenario`))));
      controle('limite signalée : ligne d\'étape hors d\'un scénario', /LIMITE 1 ligne d'étape hors d'un titre « Scénario: » ignorée \(description\)/.test(r.sortie));
      const v = await lancer('verifier.mjs', ['DEMO-8-S01', 'DEMO-8-S02', 'DEMO-8-S03', 'DEMO-8-S04'].map((n) => join(d, `${n}.scenario`)));
      controle('les textes importés passent verifier.mjs', v.code === 0 && (v.sortie.match(/^ok /gm) ?? []).length === 4, v.sortie + v.erreurs);
      const s04 = join(d, 'DEMO-8-S04.scenario');
      const tr = await lancer('traduire.mjs', [s04]);
      const toml04 = join(d, 'DEMO-8-S04.toml');
      controle('traduire.mjs écrit le squelette d\'un texte importé, écrit en anglais', tr.code === 0 && existsSync(toml04) && /3 étapes à compléter/.test(tr.sortie), tr.sortie + tr.erreurs);
      const blocs = ['action = "naviguer"\nurl = "/export"', 'action = "telecharger"\ncible = { role = "link", nom = "Exporter en CSV" }', 'action = "verifier"\ncritere = "contient"\ncible = { role = "heading" }\nattendu = "Export"'];
      writeFileSync(toml04, blocs.reduce((t, b) => t.replace('action = "à compléter"', b), readFileSync(toml04, 'utf8')));
      const joue = await jouer(toml04);
      controle('chaîne complète : texte importé, traduit, joué dans le navigateur, code 0', joue.code === 0 && joue.rapport?.statut === 'reussi' && JSON.stringify(joue.rapport.scenario.etiquettes) === '["DEMO-8-S04"]', joue.sortie + joue.erreurs);
      const avant = empreintes(d);
      r = await lancer('importer.mjs', [p8, '--adresse', base, '--dossier', d]);
      controle('réimport sans changement : textes inchangés, non réécrits, code 0 (D16.INV-5)', r.code === 0 && etatsDe(r.sortie).length === 4 && etatsDe(r.sortie).every((x) => x.startsWith('inchangé')) && empreintes(d) === avant, r.sortie);
      r = await lancer('importer.mjs', [p8, '--comparer', '--dossier', d]);
      controle('--comparer sans différence : tout identique, code 0', r.code === 0 && etatsDe(r.sortie).length === 4 && etatsDe(r.sortie).every((x) => x.startsWith('identique')), r.sortie);
      const gherkin = `@DEMO-8
Fonctionnalité: Clients
  Contexte:
    Étant donné que je suis sur la page des clients

  Scénario: Voir la liste
    Alors je vois le tableau « Liste des clients »

  @DEMO-8-S02 @DEMO-8-CA01
  Scénario: Créer un client
    Quand je clique sur le lien « Nouveau client »
    Et je saisis « Dubois » dans le champ « Nom »
    Et je clique sur le bouton « Enregistrer »
    Alors je vois le message « Client Dubois créé »

  Plan du scénario: Créer plusieurs clients
    Quand je clique sur le lien « Nouveau client »
    Et je saisis « <Nom du client> » dans le champ « Nom »
    Et je choisis « <ville> » dans la liste « Ville »
    Et je clique sur le bouton « Enregistrer »
    Alors je vois le message « Client <Nom du client> créé »

    Exemples:
      | Nom du client | ville |
      | Leroy         | Lyon  |
      | Morel         | Paris |

  @DEMO-8-S06
  Scénario: Déjà écrit
    Quand je regarde

  Scénario: Avec table
    Quand je saisis :
      | nom | Durand |
`;
      const champ = demandes['DEMO-8'].champs[0];
      const p8b = pageMhtml('DEMO-8-b.mhtml', { ...demandes['DEMO-8'], description: descriptionCloud(gherkin), champs: [{ ...champ, html: champ.html.replace('is downloaded', 'is saved') }] });
      writeFileSync(join(d, 'DEMO-8-S06.scenario'), `Scénario: Écrit à la main\n  Adresse : ${base}\n  Quand je regarde\n`);
      const s02 = join(d, 'DEMO-8-S02.scenario');
      writeFileSync(s02, readFileSync(s02, 'utf8').replace('Et je clique sur le bouton « Enregistrer »', 'Et je clique sur le bouton « Enregistrer » (création)'));
      const avantComparer = empreintes(d);
      r = await lancer('importer.mjs', [p8b, '--comparer', '--dossier', d]);
      controle('--comparer après changements dans Jira : nouveau, modifié, identique, conflit, refusé, disparu, code 1 (D16.INV-5)', r.code === 1 && JSON.stringify(etatsDe(r.sortie)) === JSON.stringify(['nouveau DEMO-8-S05', 'modifié DEMO-8-S02', 'identique DEMO-8-S03', 'conflit DEMO-8-S06', 'refusé DEMO-8-S07', 'modifié DEMO-8-S04', 'disparu DEMO-8-S01']), r.sortie);
      controle('--comparer signale la retouche d\'un texte, et n\'écrit rien', /modifié\s+@DEMO-8-S02 .*texte retouché depuis l'import/.test(r.sortie) && empreintes(d) === avantComparer, r.sortie);
      controle('étiquette attribuée reprise par le titre ; nouveau scénario sur un numéro jamais porté', /identique\s+@DEMO-8-S03\s+Créer plusieurs clients/.test(r.sortie) && /nouveau\s+@DEMO-8-S05\s+Voir la liste/.test(r.sortie));
      r = await lancer('importer.mjs', [p8b, '--adresse', base, '--dossier', d]);
      controle('import sans --remplacer : nouveau écrit, modifiés non remplacés, conflit et refus non écrits, disparu gardé, code 1', r.code === 1 && JSON.stringify(etatsDe(r.sortie)) === JSON.stringify(['écrit DEMO-8-S05', 'modifié DEMO-8-S02', 'inchangé DEMO-8-S03', 'conflit DEMO-8-S06', 'refusé DEMO-8-S07', 'modifié DEMO-8-S04', 'disparu DEMO-8-S01']) && readFileSync(s02, 'utf8').includes('(création)') && readFileSync(join(d, 'DEMO-8-S06.scenario'), 'utf8').startsWith('Scénario: Écrit à la main') && existsSync(join(d, 'DEMO-8-S01.scenario')) && !existsSync(join(d, 'DEMO-8-S07.scenario')), r.sortie);
      r = await lancer('importer.mjs', [p8b, '--adresse', base, '--dossier', d, '--remplacer']);
      const copies = readdirSync(d).filter((f) => f.includes('.scenario.avant-'));
      controle('--remplacer : textes modifiés remplacés, le texte écrit à la main jamais (D16.INV-5)', r.code === 1 && JSON.stringify(etatsDe(r.sortie)) === JSON.stringify(['inchangé DEMO-8-S05', 'remplacé DEMO-8-S02', 'inchangé DEMO-8-S03', 'conflit DEMO-8-S06', 'refusé DEMO-8-S07', 'remplacé DEMO-8-S04', 'disparu DEMO-8-S01']) && readFileSync(s02, 'utf8').includes('« Dubois »') && readFileSync(join(d, 'DEMO-8-S06.scenario'), 'utf8').startsWith('Scénario: Écrit à la main'), r.sortie);
      controle('texte retouché depuis l\'import gardé à côté avant d\'être remplacé, seul', copies.length === 1 && copies[0].startsWith('DEMO-8-S02.scenario.avant-') && readFileSync(join(d, copies[0]), 'utf8').includes('(création)') && !readFileSync(s02, 'utf8').includes('(création)'), JSON.stringify(copies));
      const v2 = await lancer('verifier.mjs', [toml04]);
      controle('traduction d\'un texte remplacé périmée par l\'empreinte', v2.code === 2 && /DEMO-8-S04\.scenario a changé depuis la traduction/.test(v2.sortie + v2.erreurs), v2.sortie + v2.erreurs);
      const d2 = join(TMP, 'r20-commentaires');
      r = await lancer('importer.mjs', [p8, '--adresse', base, '--dossier', d2, '--commentaires']);
      controle('--commentaires : le scénario du commentaire importé, avec sa provenance (D16.INV-2)', r.code === 0 && etatsDe(r.sortie).length === 5 && readFileSync(join(d2, 'DEMO-8-S05.scenario'), 'utf8').includes('# Scénario : @DEMO-8-S05, commentaire de Zoé Martin du 2026-11-18'), r.sortie);
      const d3 = join(TMP, 'r20-dc');
      r = await lancer('importer.mjs', [pageMhtml('DEMO-9.mhtml', demandes['DEMO-9'], { encodage: 'base64', charset: 'iso-8859-1' }), '--adresse', base, '--dossier', d3]);
      const v3 = await lancer('verifier.mjs', [join(d3, 'DEMO-9-S01.scenario'), join(d3, 'DEMO-9-S02.scenario')]);
      controle('Jira Data Center : plan de scénario en anglais et scénario en français importés, valides', r.code === 0 && JSON.stringify(etatsDe(r.sortie)) === JSON.stringify(['écrit DEMO-9-S02', 'écrit DEMO-9-S01']) && v3.code === 0, r.sortie + v3.sortie + v3.erreurs);
      r = await lancer('importer.mjs', [pageMhtml('DEMO-10.mhtml', { ...demandes['DEMO-8'], cle: 'DEMO-10', description: '<p>Rien à jouer.</p>', champs: [], commentaires: [] }), '--adresse', base, '--dossier', join(TMP, 'r20-vide')]);
      controle('demande sans scénario : rien d\'écrit, code 1', r.code === 1 && /aucun scénario Gherkin trouvé/.test(r.sortie) && !existsSync(join(TMP, 'r20-vide')), r.sortie);
      const refuse = join(TMP, 'r20-refus');
      const pageQuelconque = join(dossierPages, 'quelconque.mhtml');
      writeFileSync(pageQuelconque, enMhtml('<html><head><title>[DEMO-1] Page</title></head><body><p>Scénario: A</p></body></html>', { emplacement: 'https://exemple.test/' }));
      const texteSimple = join(dossierPages, 'texte.txt');
      writeFileSync(texteSimple, 'pas un MHTML');
      const cas = [
        [[p8, '--dossier', refuse], '--adresse attend'],
        [[p8, '--adresse', base, '--origines', 'http://b.test', '--dossier', refuse], '--origines doit contenir'],
        [[p8, '--adresse', base, '--remplacer', '--comparer', '--dossier', refuse], '--comparer n\'écrit rien'],
        [[p8, '--adresse', base, '--inconnue', '--dossier', refuse], 'option inconnue'],
        [[join(dossierPages, 'absente.mhtml'), '--adresse', base, '--dossier', refuse], 'fichier introuvable'],
        [[texteSimple, '--adresse', base, '--dossier', refuse], 'frontière MIME introuvable'],
        [[pageQuelconque, '--adresse', base, '--dossier', refuse], 'non reconnue comme une demande'],
        [[p8, '--adresse', base, '--delai-connexion', '0', '--dossier', refuse], '--delai-connexion attend'],
      ];
      for (const [args, motif] of cas) {
        const x = await lancer('importer.mjs', args);
        controle(`refus avant toute écriture, code 2 : ${motif}`, x.code === 2 && x.erreurs.includes(motif) && !existsSync(refuse), x.sortie + x.erreurs);
      }
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R21', 'importer.mjs sur l\'adresse d\'une demande : connexion à la main, page enregistrée, profil dédié, navigation seule');
    {
      const d = join(TMP, 'r21');
      app.etat.requetesJira.length = 0;
      app.etat.connexionJira = 4500;
      let r = await lancer('importer.mjs', [`${adresseJira}/browse/DEMO-9`, '--adresse', base, '--dossier', d], { delai: 240_000 });
      controle('demande ouverte, connexion faite dans la fenêtre après le message À VOUS, code 0 (D16.INV-1)', r.code === 0 && /À VOUS : connectez-vous à Jira dans la fenêtre/.test(r.sortie), r.sortie + r.erreurs);
      const pages = existsSync(join(d, 'jira')) ? readdirSync(join(d, 'jira')) : [];
      let relue = null;
      try {
        relue = jira.lireDemande(jira.lireMhtml(readFileSync(join(d, 'jira', pages[0]))).html);
      } catch {
        relue = null;
      }
      controle('page enregistrée par le navigateur en MHTML dans <dossier>/jira/, relisible', pages.length === 1 && /^DEMO-9-\d{8}-\d{6}\.mhtml$/.test(pages[0]) && relue?.cle === 'DEMO-9' && relue.zones.length === 2, JSON.stringify(pages));
      const s01 = existsSync(join(d, 'DEMO-9-S01.scenario')) ? readFileSync(join(d, 'DEMO-9-S01.scenario'), 'utf8') : '';
      controle('textes écrits depuis la page enregistrée, avec sa provenance', existsSync(join(d, 'DEMO-9-S02.scenario')) && s01.includes(`# Source : ${adresseJira}/browse/DEMO-9`) && s01.includes(`# Page enregistrée : jira/${pages[0]}`));
      controle('le skill n\'a fait que naviguer : que des requêtes GET, aucun formulaire envoyé', app.etat.requetesJira[0] === 'GET /browse/DEMO-9' && app.etat.requetesJira.every((x) => x.startsWith('GET ')), JSON.stringify(app.etat.requetesJira));
      controle('session gardée dans le profil dédié à Jira (D16.INV-1)', existsSync(join(TMP, 'profils', 'jira')));
      r = await lancer('importer.mjs', [`${adresseJira}/browse/DEMO-9`, '--comparer', '--dossier', d], { delai: 240_000 });
      controle('session retrouvée sans message À VOUS ; --comparer : identiques, code 0', r.code === 0 && !/À VOUS/.test(r.sortie) && /Bilan : 2 identiques/.test(r.sortie), r.sortie + r.erreurs);
      r = await lancer('importer.mjs', [`${adresseJira}/browse/DEMO-404`, '--adresse', base, '--dossier', join(TMP, 'r21-absente'), '--delai-connexion', '2'], { delai: 240_000 });
      controle('demande jamais affichée : refus après le délai, code 2, rien d\'écrit', r.code === 2 && /ne s'est pas affichée en 2 s/.test(r.erreurs) && !existsSync(join(TMP, 'r21-absente')), r.sortie + r.erreurs);
      r = await lancer('importer.mjs', [`${adresseJira}/browse/DEMO-9`, '--adresse', base, '--profil-jira', 'Jira Pro', '--dossier', d]);
      controle('--profil-jira invalide : refus, code 2', r.code === 2 && /--profil-jira invalide/.test(r.erreurs), r.erreurs);
    }
  } finally {
    await app.arreter();
  }
}

let codeSortie = 0;
// Garde-fou : une recette bloquée s'arrête d'elle-même au bout de dix minutes, en disant dans quel scénario, son
// dossier temporaire gardé ; elle dure d'ordinaire moins de deux minutes.
const DUREE_MAX = 600_000;
setTimeout(() => {
  console.log(`KO   ${courant} · recette bloquée, arrêtée au bout de ${DUREE_MAX / 60_000} min`);
  console.log(`\nBilan : recette arrêtée dans ${courant}, après ${resultats.length} contrôles`);
  console.log(`Dossier temporaire gardé : ${TMP}`);
  process.exit(1);
}, DUREE_MAX).unref();
try {
  await principal();
} catch (e) {
  resultats.push({ scenario: courant, nom: 'exception', ok: false });
  console.log(`KO   ${courant} · exception : ${e.stack ?? e}`);
}
const echecs = resultats.filter((r) => !r.ok);
const sautes = resultats.filter((r) => r.saute);
const scenariosVus = new Set(resultats.map((r) => r.scenario));
console.log(`\nBilan : ${scenariosVus.size} scénarios, ${resultats.length} contrôles, ${resultats.length - echecs.length - sautes.length} réussis, ${echecs.length} en échec, ${sautes.length} sautés`);
if (echecs.length > 0 || process.env.GARDER_TMP === '1') {
  console.log(`Dossier temporaire gardé : ${TMP}`);
  codeSortie = echecs.length > 0 ? 1 : 0;
} else {
  rmSync(TMP, { recursive: true, force: true });
}
process.exit(codeSortie);
```
<<<FIN modules/recette/SKILL.md>>>

<<<FICHIER modules/traduction-auto/SKILL.md>>>
---
name: traduction-auto
description: Dimension réservée D11 (traduction sans IA du texte de départ en scénario TOML, par un catalogue de phrases fermé, celui des phrases conseillées du module texte ; les phrases hors du catalogue restent à l'IA et à la ratification). Ne pas appliquer en 1.x.
dimensions: [D11]
status: reserved
---

# Module `traduction-auto` (D11, réservé)

Phase 7E couverte : Évolutif.

## Intention

En 1.0, l'IA traduit les phrases du texte, sur un squelette produit sans IA, et le développeur ratifie (module `scenario`, § 4). D11 traduira sans IA les phrases d'un catalogue fermé, celui des phrases conseillées du module `texte`, § 9 : « je clique sur le bouton « X » » donnera toujours `cliquer` sur `{ role = "button", nom = "X" }`. Une phrase hors du catalogue restera à compléter, par l'IA ou le développeur, et la ratification restera nécessaire pour l'ensemble.

## Ce qui existe déjà en 1.0.0

- Le squelette sans IA et le contrôle sans IA de la traduction (D3.INV-3 à D3.INV-5).
- La table des phrases conseillées, qui fixe déjà la traduction attendue de chaque forme.

## Ce qui reste à décider

- La grammaire du catalogue : formes exactes, variantes admises, guillemets français ou droits.
- La place des phrases traduites sans IA dans le plan de ratification : marquées comme telles, ou ratifiées comme les autres.
<<<FIN modules/traduction-auto/SKILL.md>>>

<<<FICHIER modules/demo/SKILL.md>>>
---
name: demo
description: Dimension réservée D12 (parcours du kit démo de generateur-skill-ticket joué par le moteur, captures de l'écran livré comparées aux images de l'objectif, à partir du rapport et du moteur ; points d'extension E1 et E3). Ne pas appliquer en 1.x.
dimensions: [D12]
status: reserved
---

# Module `demo` (D12, réservé)

Phase 7E couverte : Évolutif.

## Intention

Le kit démo d'un skill de ticket, produit par generateur-skill-ticket, décrit un parcours de démonstration tiré des scénarios de l'US, et compare les captures de l'écran livré aux images de l'objectif. D12 jouera ce parcours avec le moteur, et rapprochera chaque capture de l'image de l'objectif qu'elle doit montrer.

## Ce qui existe déjà en 1.0.0

- Le moteur, appelable sans `jouer.mjs` (E3), et les captures nommées de l'action `capturer`.
- Le rapport aux champs stables (E1), qui donne chaque capture et son étape.
- Les étiquettes du texte, recopiées par la traduction : un parcours se rattache au scénario de l'US et à ses critères.

## Ce qui reste à décider

- La comparaison d'une capture à une image de l'objectif : par l'œil du développeur, par l'IA, ou par une mesure, et avec quel seuil.
- La forme du parcours dans le kit démo : un texte de départ par scénario de l'US, ou un seul parcours.
<<<FIN modules/demo/SKILL.md>>>

<<<FICHIER modules/remise/SKILL.md>>>
---
name: remise
description: Dimension réservée D13 (remise d'un scénario ratifié et de ses rapports à Agent2Test, dont le navigateur partage le vocabulaire du scénario ; points d'extension E1 et E2). Ne pas appliquer en 1.x.
dimensions: [D13]
status: reserved
---

# Module `remise` (D13, réservé)

Phase 7E couverte : Évolutif.

## Intention

Agent2Test choisit, prépare, joue et journalise les tests essentiels d'une demande, avec son propre navigateur. D13 lui remettra un scénario ratifié, et les rapports de ses exécutions, pour qu'il en fasse un cas de sa campagne sans le réécrire.

## Ce qui existe déjà en 1.0.0

- Le scénario TOML reprend le vocabulaire du navigateur d'Agent2Test : actions communes, critères de vérification, stratégies de cibles, règle des origines (E2, `agent2test:D4.INV-2`, `agent2test:D4.INV-4`).
- Le rapport aux champs stables (E1).

## Ce qui reste à décider

- La traduction des actions propres à ce skill, `telecharger`, `capturer` et `main`, dans les étapes d'Agent2Test, dont `main` n'a pas d'équivalent en campagne.
- La règle de rejeu : ce skill ne rejoue aucune étape, Agent2Test retente les vérifications (`agent2test:D4.INV-6`).
- Le contrôle du développeur avant chaque remise.
<<<FIN modules/remise/SKILL.md>>>

<<<FICHIER modules/accessibilite/SKILL.md>>>
---
name: accessibilite
description: Dimension réservée D14 (audit d'accessibilité des pages parcourues par un scénario, constats rattachés aux étapes, sans exécuter de code de l'audit dans la page tant qu'une règle ne l'autorise pas). Ne pas appliquer en 1.x.
dimensions: [D14]
status: reserved
---

# Module `accessibilite` (D14, réservé)

Phase 7E couverte : Évolutif.

## Intention

Un scénario parcourt les pages comme un utilisateur ; D14 y ajoutera un audit d'accessibilité, page par page ou à la demande d'une étape, avec des constats rattachés aux étapes du rapport.

## Ce qui existe déjà en 1.0.0

- Des cibles désignées par rôle et nom accessible, qui échouent quand un élément n'est pas nommé pour les lecteurs d'écran (module `cibles`).
- L'instantané ARIA de la page à chaque échec (module `preuves`).

## Ce qui reste à décider

- L'outil de l'audit : un audit qui s'exécute dans la page contredit D5.INV-1 ; il faudra une règle propre, ou un audit fondé sur l'arbre d'accessibilité seul.
- Le référentiel : RGAA, WCAG, ou les règles d'accessibilité du socle back-front.
<<<FIN modules/accessibilite/SKILL.md>>>

<<<FICHIER modules/enregistrement/SKILL.md>>>
---
name: enregistrement
description: Dimension réservée D15 (enregistrement des gestes du développeur dans la fenêtre en texte de départ et en scénario, à ratifier, à partir de la désignation et des cibles). Ne pas appliquer en 1.x.
dimensions: [D15]
status: reserved
---

# Module `enregistrement` (D15, réservé)

Phase 7E couverte : Évolutif.

## Intention

Le développeur fera une fois, dans la fenêtre, les gestes d'un parcours ; D15 les enregistrera en texte de départ et en scénario, à relire et à ratifier comme une traduction.

## Ce qui existe déjà en 1.0.0

- La désignation à la souris, qui rend la cible d'un élément sans actionner la page (module `designer`).
- La notation des cibles, relue et écrite en TOML (module `cibles`).

## Ce qui reste à décider

- La captation des gestes sans exécuter de code dans la page (D5.INV-1).
- La phrase écrite pour chaque geste : celle du catalogue de D11.
<<<FIN modules/enregistrement/SKILL.md>>>

---

# Table d'intégrité (sha256)

Format compatible `sha256sum -c`, à exécuter depuis le dossier où les fichiers ont été matérialisés.

    26e6ce12c8f407883595b60ba1009e815389ab7e5f7c57dc2710333780fb8536  manifest.json
    8775a23c8c2ba091eb1f492e3e590d1090e5a3a6cefcefe9fc957652f71a7360  SKILL.md
    cd0697acb8fc03c324c438b428843a83a65d1d3776479733926102424567084a  modules/execution/SKILL.md
    d49df49769bd9fafb2428bd85dcb70db7abf93e422b213ae42a78b451964c01f  modules/texte/SKILL.md
    085536d21447e742331a304ee4e9c564ba8af08aca8ca64c9fa35a491e2c20c9  modules/jira/SKILL.md
    957bff89c34184e4b2bb62e28930a94fbbe85459318c9684ac9c119b5a5ea4f6  modules/scenario/SKILL.md
    3cee7a6e32f5462e59c2351cf99dc981dc441778fe27b5f3f8594430b4b033db  modules/cibles/SKILL.md
    91e2ef0fda9d47e7a6d43a1e04f04cf4809e28af0af9884f0d23e294bdc10c03  modules/actions/SKILL.md
    8b6357ac90bd835492117d2b7ba6a1bf172822fd3cd868b7b4d791d52cb9b377  modules/session/SKILL.md
    18b6e5a67ad2b51e1ec74b1ecacd714b9139e0f9ae64f40fd0ae7abb8fe9a96e  modules/garde/SKILL.md
    2110da1f6176bfe1a7d4f7025f182e75dac70906d2f72fca801c5e9be3af8734  modules/preuves/SKILL.md
    ec111f31d553e64b3ef229f1a28a0083f6324783e6cf2e2b426479159391cf0c  modules/designer/SKILL.md
    4a64c0f1c1570ea689e63c5601c08d302c66984d9e0d8832c50d7daf28f301f6  modules/agent/SKILL.md
    22d88e33d70d36058a1ec07345907ee243340b31d5c8743e5205b64faa8b27eb  modules/recette/SKILL.md
    4966e366878732544faa9f20e65580a7348426d4e4c2a2b5f789dee4d59ce079  modules/traduction-auto/SKILL.md
    9dd5d57ca1b658cb15c7c1999ccfd94cb41491e0af15bbe151812f07d45929fc  modules/demo/SKILL.md
    4a202c9718112813a20437b56e250422013bebdfceee7f971922d246a4d2d606  modules/remise/SKILL.md
    57eacdcf16ab38f69372bdce72f691f5ec0873bf6fd6261649bdec1fdc579ade  modules/accessibilite/SKILL.md
    2b2318986a68ec6e2f95279068640cf96e605d777f9f4341d47909f3e74bbcf0  modules/enregistrement/SKILL.md
