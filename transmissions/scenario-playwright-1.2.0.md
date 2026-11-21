# Scénarios côté utilisateur avec Playwright : skill scenario-playwright 1.2.0, transmission texte

Ce texte contient à la fois la consigne de travail et le skill complet. Il n'y a aucune pièce jointe. Le skill est découpé en fichiers, chacun délimité ainsi :

    <<<FICHIER chemin/relatif>>>
    ...contenu exact du fichier...
    <<<FIN chemin/relatif>>>

---

À partir de maintenant, tu installes le skill scenario-playwright décrit par ce texte sur le poste du développeur, tu le fais fonctionner, puis tu peux importer de Jira, de Xray, de Zephyr Scale ou de fichiers .feature, traduire, faire ratifier et jouer ses scénarios comme son agent. Le skill fait foi. Si tu relèves une ambiguïté ou une contradiction dans le skill, signale-la au développeur. Ne corrige pas le skill toi-même, ni ses scripts.

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
4. Lance la recette : `npm test` ; sous Linux sans écran, `xvfb-run -a npm test`. Attendu : 25 scénarios, 339 contrôles réussis, aucun échec ; là où l'adresse 127.0.0.2 n'est pas disponible, deux contrôles sont sautés. Rapporte au développeur le bilan ; un échec arrête l'installation et se rapporte tel quel, sans modifier les scripts.

## Étape 3 : l'agent et les commandes

Propose au développeur d'installer le sous-agent `agent/pilote-scenario.md` et les commandes `/scenario:importer`, `/scenario:traduire`, `/scenario:jouer` et `/scenario:designer` (module `agent`, § 2). N'écris dans ses dossiers de configuration qu'avec son accord ; dans la copie installée du sous-agent, remplace `<DOSSIER_DU_SKILL>` par le chemin absolu du dossier du skill. Rejoue avec lui les scénarios A1 à A10 du module `agent`.

## Étape 4 : premier scénario, avec le développeur

1. Il écrit un texte de départ (module `texte`) pour une application de son poste ; vérifie-le. Si ses scénarios sont dans une demande Jira, importe-les plutôt (module `jira`) : depuis la page qu'il a enregistrée, ou par l'adresse de la demande, où il se connecte lui-même. S'ils sont des tests de Xray ou de Zephyr Scale, ou des fichiers `.feature`, importe-les depuis un export, ou par l'API avec le jeton qu'il définit lui-même dans une variable d'environnement (module `cas-de-test`). Rends-lui le bilan de l'import, relis avec lui chaque test manuel converti, puis vérifie chaque texte écrit.
2. Traduis-le sur le squelette de `traduire.mjs` (module `scenario`, § 4), puis présente-lui le plan de `verifier.mjs --plan`, ligne du texte par ligne du texte, et attends sa ratification.
3. Joue-le dans une fenêtre visible ; il fait lui-même chaque étape à la main. Examine ensuite avec lui le rapport, chaque étape en échec et chaque origine bloquée.

## Règles qui ne se négocient pas

- Tu ne demandes, ne lis et ne saisis aucun identifiant : le développeur se connecte lui-même dans la fenêtre du navigateur.
- Tu ne demandes, n'affiches, n'écris ni ne passes en argument aucun jeton : un jeton d'API passe par la variable d'environnement que le développeur définit lui-même ; s'il en colle un dans la conversation, signale-le et recommande-lui de le révoquer.
- Rien ne se joue avant que le développeur ait ratifié la traduction ; tu ne modifies ni son texte ni un scénario ratifié sans son accord.
- Tu ne passes `--autoriser-mutations` qu'avec l'accord explicite du développeur, pour une exécution.
- Tu n'écris jamais dans Jira, Xray ni Zephyr Scale ; tu ne lis les commentaires d'une demande qu'à sa demande ; tu compares avant de remplacer un texte importé, et tu ne passes `--remplacer` qu'avec son accord.
- Les résultats, les captures, les téléchargements, les traces, les pages Jira enregistrées et les profils restent sur le poste : tu ne les déplaces, ne les partages ni ne les versionnes.
- Tu n'adaptes pas les scripts : un écart, une erreur ou un besoin nouveau se signale au développeur.
- N'applique aucune dimension au statut `reserved`.

Commence par l'étape 0, puis l'étape 1, puis l'étape 2.

---

# Skill

<<<FICHIER manifest.json>>>
{
  "name": "scenario-playwright",
  "version": "1.2.0",
  "specSchema": 1,
  "language": "fr",
  "description": "Scénarios côté utilisateur joués dans le Chrome du poste par Playwright : texte de départ inspiré de Gherkin, en français ou en anglais, écrit par le développeur ou importé sans IA d'une demande Jira (page enregistrée en MHTML ou adresse ouverte dans le navigateur du poste, connexion à la main ; Jira Cloud et Data Center ; description et champs de texte, commentaires sur demande), d'un fichier .feature ou d'une archive .zip d'un export, ou des tests de Xray et de Zephyr Scale lus par leur API REST, Cloud et Data Center, en lecture seule, jeton par variable d'environnement seulement (test Cucumber ou BDD recopié, test manuel converti pas à pas en Quand puis Alors, clé du test pour identité ; provenance, étiquettes, comparaison et remplacement sur demande au réimport) ; traduction en scénario TOML exécutable par l'IA, sur un squelette produit sans IA, ratifiée par le développeur et contrôlée sans IA (empreinte, structure, lignes, marques, variables) ; jeu fermé de treize actions commun avec le navigateur d'Agent2Test, cibles par rôle et nom accessible, aucun code exécuté dans la page, attentes bornées, aucune étape rejouée ; origines gardées, mutations hors du poste sur autorisation explicite, connexion à la main dans un profil dédié ; rapport JSON et Markdown avec captures, instantanés ARIA et erreurs relevées ; désignation d'une cible à la souris ; agent pilote-scenario et commandes /scenario:importer, /scenario:traduire, /scenario:jouer et /scenario:designer.",
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
    { "id": "cas-de-test", "path": "modules/cas-de-test/SKILL.md", "dimensions": ["D17"], "status": "active" },
    { "id": "scenario", "path": "modules/scenario/SKILL.md", "dimensions": ["D3"], "status": "active" },
    { "id": "cibles", "path": "modules/cibles/SKILL.md", "dimensions": ["D4"], "status": "active" },
    { "id": "actions", "path": "modules/actions/SKILL.md", "dimensions": ["D5"], "status": "active" },
    { "id": "session", "path": "modules/session/SKILL.md", "dimensions": ["D6"], "status": "active" },
    { "id": "garde", "path": "modules/garde/SKILL.md", "dimensions": ["D7"], "status": "active" },
    { "id": "preuves", "path": "modules/preuves/SKILL.md", "dimensions": ["D8"], "status": "active" },
    { "id": "designer", "path": "modules/designer/SKILL.md", "dimensions": ["D9"], "status": "active" },
    { "id": "agent", "path": "modules/agent/SKILL.md", "dimensions": ["D10"], "status": "active" },
    { "id": "recette", "path": "modules/recette/SKILL.md", "dimensions": ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D16", "D17"], "status": "active" },
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
    { "version": "1.1.0", "file": "archives/SKILL-v1.1.0.md" },
    { "version": "1.1.1", "file": "archives/SKILL-v1.1.1.md" }
  ]
}
<<<FIN manifest.json>>>

<<<FICHIER SKILL.md>>>
---
name: scenario-playwright
description: Scénarios côté utilisateur joués dans le Chrome du poste par Playwright. Le développeur écrit son scénario dans un texte de départ inspiré de Gherkin, en français ou en anglais (fichier .scenario, avec étiquettes, titre, adresse, étapes Étant donné, Quand, Alors, marques (création), (modification), (suppression) et (à la main), tableau d'exemples) ; l'IA le traduit en scénario TOML exécutable sur un squelette produit sans IA, le développeur ratifie, et un contrôle sans IA garde la traduction fidèle au texte (empreinte, lignes, marques, variables). Le moteur joue un jeu d'actions fermé, commun avec le navigateur d'Agent2Test (naviguer, cliquer, saisir, choisir, cocher, survoler, touche, téléverser, télécharger, attendre, vérifier, capturer, et la main au développeur), sur des cibles désignées comme les voit une personne (rôle et nom accessible, libellé, texte), sans exécuter aucun code dans la page ; il ne laisse partir aucune requête vers une origine non déclarée, refuse de modifier des données hors du poste sans autorisation explicite, ne voit aucun identifiant, et rend un rapport JSON et Markdown avec captures, instantanés ARIA et erreurs relevées. Les scénarios peuvent aussi venir d'une demande Jira, enregistrée en MHTML ou ouverte à son adresse dans le navigateur du poste avec connexion à la main, d'un fichier .feature ou d'une archive d'export, ou des tests de Xray et de Zephyr Scale, lus par leur API en lecture seule avec un jeton pris dans une variable d'environnement ; chaque scénario Gherkin, en français ou en anglais, y est recopié sans IA en texte de départ avec sa provenance, chaque test manuel converti pas à pas en « Quand » puis « Alors », et un réimport dit ce qui a changé dans la source. Désignation d'une cible à la souris, paramètres et jeux de valeurs, profil dédié, agent pilote-scenario et commandes /scenario:* pour Gemini CLI.
version: 1.2.0
---

# Scénarios côté utilisateur avec Playwright, version 1.2.0

Ce document est le point d'entrée du skill. Le skill fait les manipulations d'un utilisateur dans le navigateur du poste, Chrome par défaut, à partir d'un scénario : aller sur une page, cliquer, saisir, choisir, cocher, survoler, presser une touche, joindre un fichier, télécharger, attendre, vérifier ce qui s'affiche, capturer l'écran, et rendre la main au développeur quand une étape lui revient, comme une connexion. Le scénario part d'un texte inspiré de Gherkin, que le développeur écrit en français ou en anglais, ou qu'il importe sans IA d'une demande Jira, d'un fichier `.feature`, ou d'un cas de test de Xray ou de Zephyr Scale ; l'IA le traduit en scénario TOML exécutable, le développeur ratifie la traduction, et un contrôle sans IA la garde fidèle au texte. Le moteur, écrit en Node avec `playwright-core`, joue ensuite le scénario sans IA, de façon répétable, et rend un rapport avec ses preuves. Les règles détaillées sont dans `modules/`.

## 1. Ordre de lecture

1. Ce document, en entier.
2. `manifest.json` : modules, versions visées, plateformes.
3. Les modules actifs, dans cet ordre : `execution`, `texte`, `jira`, `cas-de-test`, `scenario`, `cibles`, `actions`, `session`, `garde`, `preuves`, `designer`, `agent`, `recette`.
4. `modules/traduction-auto/SKILL.md`, `modules/demo/SKILL.md`, `modules/remise/SKILL.md`, `modules/accessibilite/SKILL.md` et `modules/enregistrement/SKILL.md` : seulement pour comprendre les points d'extension. Ne pas les appliquer en 1.x.

## 2. Ce que fait le skill

| Outil | Commande, depuis n'importe quel dossier | Rôle | Module |
|---|---|---|---|
| Import de Jira | `node <skill>/scripts/importer.mjs <page.mhtml \| adresse> --adresse <url>` | écrit un texte de départ par scénario Gherkin de la demande, avec sa provenance ; `--comparer` dit ce qui a changé dans Jira depuis l'import | `jira` |
| Import de cas de test | `node <skill>/scripts/importer.mjs <fichier.feature \| export.zip \| xray:CLÉ,… \| zephyr:CLÉ,…> --adresse <url>` | écrit un texte de départ par test, nommé par sa clé : Gherkin recopié, test manuel converti pas à pas ; Xray et Zephyr Scale, Cloud et Data Center, lus par leur API sans rien y écrire | `cas-de-test` |
| Squelette de traduction | `node <skill>/scripts/traduire.mjs <texte.scenario>` | écrit `<texte>.toml` : structure du texte, empreinte, un bloc par étape à compléter | `scenario` |
| Vérification | `node <skill>/scripts/verifier.mjs <fichier>... [--plan]` | contrôle un texte ou un scénario sans navigateur ; `--plan` montre la traduction ligne par ligne, pour la ratification | `texte`, `scenario` |
| Exécution | `node <skill>/scripts/jouer.mjs <scénario.toml> [options]` | joue le scénario dans le navigateur du poste et écrit le rapport | `actions`, `session`, `garde`, `preuves` |
| Désignation | `node <skill>/scripts/designer.mjs <adresse>` | rend la cible de chaque élément que le développeur clique | `designer` |
| Recette | `npm test`, depuis le dossier du skill | 25 scénarios contre une application de démonstration, un Jira, un Xray et un Zephyr Scale factices, locaux | `recette` |
| Agent | `agent/pilote-scenario.md`, commandes `/scenario:importer`, `/scenario:traduire`, `/scenario:jouer`, `/scenario:designer` | importe, traduit, fait ratifier, joue et rend le bilan pour le développeur | `agent` |

```mermaid
flowchart LR
  DEV["Développeur"] -->|"écrit"| TXT["texte de départ<br/>creer-client.scenario"]
  JIRA["Demande Jira<br/>page MHTML ou adresse"] -->|"importer.mjs, sans IA"| TXT
  CAS["Xray, Zephyr Scale<br/>.feature, .zip, API"] -->|"importer.mjs, sans IA"| TXT
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

Le même texte peut venir de Jira, où le scénario est écrit dans la description ou un champ de texte de la demande (module `jira`) : `importer.mjs` le recopie sans IA dans `ECR-77-S01.scenario`, sous un en-tête de provenance, avec l'adresse donnée par `--adresse`. Il peut aussi venir d'un test de Xray ou de Zephyr Scale, exporté en `.feature` ou lu par l'API (module `cas-de-test`) : le texte se nomme alors par la clé du test, `ECR-80.scenario`, et un test manuel y devient, pas à pas, « Quand <action> » puis « Alors <résultat attendu> ».

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
| Évolutif | versions du skill, dimensions réservées D11 à D15, points d'extension E1 à E3, réimport et comparaison, d'une source à l'autre par la clé du test | `traduction-auto`, `demo`, `remise`, `accessibilite`, `enregistrement`, `jira`, `cas-de-test` |
| Environnement | le développeur qui écrit, ratifie et se connecte, l'IA qui traduit, Jira où s'écrivent les scénarios des US, Xray et Zephyr Scale où vivent les cas de test, Chrome et ses versions, les autres skills qui liront les scénarios et les rapports | `agent`, `session`, `jira`, `cas-de-test` |

Clause de second ordre : la traduction n'est pas neutre. Une phrase en français se traduit en actions de plusieurs façons, et l'IA qui la traduit pourrait déplacer le sens. Le skill ne laisse donc à l'IA que ce qu'elle seule sait faire, le sens des phrases : la structure est recopiée sans IA (D3.INV-5), un contrôle sans IA vérifie que chaque ligne du texte est traduite, dans l'ordre, avec ses marques et ses variables (D3.INV-3, D3.INV-4), et rien ne se joue avant la ratification du développeur, à qui le plan est présenté ligne du texte par ligne du texte (D10.INV-1). Une étape qui revient au développeur, comme une connexion, n'est jamais ajoutée par la traduction : elle vient d'une ligne qu'il a marquée « (à la main) ». De même, le moteur ne devine aucune cible : une cible qui désigne plusieurs éléments fait échouer l'étape sans agir (D4.INV-2), et le rapport cite les éléments trouvés, pour que le développeur tranche. L'import de Jira suit la même règle : il recopie ce que Jira dit, sans IA et sans rien réécrire que ce qu'il signale (D16.INV-3) ; un scénario que le format texte n'exprime pas est refusé avec son motif, et se corrige dans Jira ; un texte que le développeur a retouché n'est jamais remplacé sans son accord, ni sans être gardé (D16.INV-5). Un test manuel n'a pas de Gherkin à recopier : sa conversion est mécanique, chaque pas en « Quand » puis « Alors », signalée dès la première ligne du texte, qui se relit avec le développeur avant la traduction (D17.INV-5) ; un test sans étapes, générique ou en texte libre, est refusé plutôt qu'interprété.

## 5. Registre des dimensions

| ID | Dimension | Introduite | Statut 1.2.0 | Dépend de | Module |
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
| D17 | Cas de test de Xray et de Zephyr Scale, fichiers .feature | 1.2 | active | D2, D16 | `cas-de-test`, `recette` |

Statuts : `active` (implémentée et testée), `reserved` (points d'extension posés, fonctionnalité absente), `superseded` (remplacée ; la version de remplacement est indiquée).

## 6. Contrat de version et points d'extension

Le skill suit le contrat de version de `EVOLUTION.md` du dépôt Agent2Prompt. Il n'a ni base ni journal : chaque exécution écrit son rapport, seul état durable, et le profil du navigateur garde la session.

Points d'extension, actifs depuis la version indiquée :

- **E1** (1.0.0) : `rapport.json` (format `scenario-playwright.rapport/1`) a des champs stables, au niveau de l'exécution (`format`, `skill`, `version`, `scenario`, `debut`, `fin`, `duree_ms`, `navigateur`, `options`, `jeux`, `origines_bloquees`, `cibles_fragiles`, `bilan`, `statut`), de chaque jeu (`numero`, `valeurs`, `statut`, `etapes`) et de chaque étape (`numero`, `ligne`, `action`, `resume`, `cible`, `fragile`, `mutation`, `statut`, `duree_ms`, `message`, `capture`, `aria`, `telechargement`, `console`, `erreurs_page`, `reponses`). D12 et D13 s'en serviront sans rejouer le scénario.
- **E2** (1.0.0) : le scénario TOML (format `scenario-playwright.scenario/1`) reprend le vocabulaire du navigateur d'Agent2Test : mêmes actions pour les gestes communs, mêmes critères de vérification, mêmes stratégies de cibles, même règle des origines (`agent2test:D4.INV-2`, `agent2test:D4.INV-4`). D13 remettra un scénario ratifié à Agent2Test sans le réécrire.
- **E3** (1.0.0) : le moteur est une fonction, `jouerScenario(contexte, options)` du module `actions`, qui joue des jeux préparés dans un contexte de navigateur ouvert et rend leurs résultats ; `jouer.mjs` n'en est qu'un appelant. D12 en ajoutera un autre, sans modifier le moteur.

## 7. Règles globales

- **Aucun identifiant** : le skill ne demande, ne lit, ne stocke ni ne saisit aucun identifiant ; une connexion se fait à la main, dans la fenêtre visible, lors d'une étape « (à la main) » (D6.INV-2).
- **Un jeton ne vient que de l'environnement** : le jeton d'une API, Xray ou Zephyr Scale, se lit dans une variable d'environnement que le développeur définit lui-même ; il n'est jamais demandé, affiché, journalisé, écrit, mis dans une adresse ni passé en argument, et ne sort que dans l'en-tête des requêtes vers l'API désignée, en https hors du poste, sans suivre de redirection (D17.INV-3, D10.INV-5).
- **La traduction se ratifie** : rien ne se joue avant que le développeur ait ratifié la traduction, ligne du texte par ligne du texte ; un texte modifié rend sa traduction périmée (D3.INV-2, D10.INV-1).
- **Aucun code dans la page** : le moteur ne joue que les actions du jeu fermé, et aucune n'exécute de code dans la page (D5.INV-1).
- **Rien n'est deviné** : une cible ambiguë fait échouer l'étape, sans agir (D4.INV-2) ; aucune étape n'est rejouée (D5.INV-3).
- **Jira et les outils de test en lecture seule** : le skill n'écrit jamais dans Jira, Xray ni Zephyr Scale ; d'une demande, il ne lit que la description, les champs de texte et, sur demande, les commentaires ; par l'adresse, il n'y fait que naviguer, et le développeur se connecte lui-même ; par une API, il ne fait que des lectures, jamais une mutation (D16.INV-1, D16.INV-2, D17.INV-2).
- **Rien ne sort sans être déclaré** : aucune requête ne part vers une origine que le scénario ne déclare pas (D7.INV-1) ; hors du poste, une modification de données demande l'autorisation explicite du développeur pour l'exécution (D7.INV-2).
- **Les données du développeur restent chez lui** : profils, résultats, captures, téléchargements et pages Jira enregistrées restent sur le poste, dans le dossier du skill ou à côté des scénarios, écartés de Git (D1.INV-2) ; la trace n'est enregistrée que sur demande (D7.INV-3).
- **Une dépendance** : Node 22 ou plus récent et `playwright-core` à version exacte, qui pilote le navigateur du poste sans en télécharger (D1.INV-1).
- **Langue** : messages, documentation, commentaires et identifiants du code en français, sauf l'interface de Playwright.

## 8. Critères d'acceptation

- La recette du module `recette` passe en entier : `npm test`, 25 scénarios et 339 contrôles ; là où l'adresse 127.0.0.2 n'est pas disponible, deux contrôles de R8 sont sautés.
- La recette passe en intégration continue sur `ubuntu-latest` et `windows-latest`, avec Node 22, 24 et 26, après extraction par la commande du module `execution`, § 8, sous bash et sous CMD, puis `npm ci`, avec le Chrome stable des images GitHub.
- Les fichiers tirés des modules ont exactement les empreintes de la table du module `execution`, § 8.
- Les scénarios A1 à A10 du module `agent` sont rejoués avec le développeur avant que l'agent joue un scénario sur une application réelle.
- Un premier scénario réel est écrit, traduit, ratifié et joué avec le développeur ; chaque étape en échec est examinée avec lui.
- Une première demande réelle est importée avec le développeur, depuis sa page enregistrée puis par son adresse ; chaque limite, chaque refus et chaque écart de lecture est examiné avec lui, et signalé s'il tient au skill.
- De premiers tests réels de Xray ou de Zephyr Scale, un test Cucumber ou BDD et un test manuel, sont importés avec le développeur, depuis un export puis par l'API, le jeton défini par lui dans son terminal ; chaque réponse inattendue de l'API, chaque refus et chaque conversion d'un test manuel sont examinés avec lui, et signalés s'ils tiennent au skill.

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
- **D10.INV-4** : l'agent ne lit les commentaires d'une demande Jira qu'à la demande du développeur, compare avant de remplacer, ne passe `--remplacer` qu'avec son accord, ne supprime aucun texte dont le scénario a disparu de sa source et ne corrige pas lui-même un scénario refusé.
- **D10.INV-5** : l'agent ne demande, ne lit, n'affiche, n'écrit ni ne passe en argument aucun jeton d'API ; il dit au développeur quelle variable d'environnement définir, sans la définir lui-même ; un jeton collé dans la conversation est signalé, avec la recommandation de le révoquer, et n'est pas utilisé.

**D16 : scénarios importés de Jira**

- **D16.INV-1** : une demande se lit depuis sa page enregistrée en MHTML, jamais modifiée, dont l'empreinte sha256 est notée dans chaque texte importé, ou depuis son adresse, ouverte dans le navigateur du poste, dans une fenêtre visible, sur un profil dédié à Jira : le skill y navigue vers l'adresse donnée et rien d'autre, sans cliquer, saisir ni envoyer de formulaire ; la connexion se fait à la main, dans le délai réglé ; la page est enregistrée en MHTML dans le sous-dossier `jira/` du dossier des textes, puis lue comme une page enregistrée.
- **D16.INV-2** : seules les pages de Jira Cloud et de Jira Data Center, reconnues à leurs marqueurs, sont lues, et seulement leur description, leurs champs de texte et, avec `--commentaires`, leurs commentaires ; scripts, styles et boutons ne sont jamais lus comme du texte ; une autre page est refusée.
- **D16.INV-3** : chaque scénario est recopié sans IA, tel qu'écrit dans Jira, en français ou en anglais : mots-clés, titre, étapes et exemples ; ne s'y ajoutent que les réglages donnés à l'import, le contexte de sa fonctionnalité et de sa règle en tête de ses étapes, et ses colonnes d'exemples adaptées au format texte avec leurs variables, chaque ajout signalé en tête du texte ; un scénario que le format texte n'exprime pas n'est pas écrit, et son refus est motivé.
- **D16.INV-4** : chaque texte importé se nomme `<ÉTIQUETTE>.scenario` et commence par sa provenance : demande, étiquette et zone, source, page enregistrée et son empreinte, date, empreinte Jira du scénario, empreinte du texte importé ; l'étiquette est celle que Jira donne au scénario, sinon celle qu'un import précédent a attribuée au scénario de même titre, sinon le plus petit numéro libre dans l'ordre de la page ; le second scénario d'une même étiquette n'est pas écrit.
- **D16.INV-5** : un texte dont le scénario n'a pas changé dans sa source n'est jamais réécrit ; un texte dont le scénario a changé n'est remplacé qu'avec `--remplacer`, et un texte retouché depuis l'import est d'abord gardé à côté ; un texte qui ne vient pas d'un import de ce scénario, de la demande ou d'une autre source qui lui donne la même étiquette, n'est jamais remplacé ; un texte dont le scénario a disparu de sa source est signalé, jamais supprimé ; `--comparer` n'écrit aucun texte et dit, pour chaque scénario, s'il est identique, modifié, nouveau ou disparu.
- **D16.INV-6** : `importer.mjs` sort avec le code 0 quand chaque scénario est écrit, remplacé ou inchangé (avec `--comparer` : identique), 1 quand un scénario n'est pas écrit, qu'un test est introuvable ou qu'il n'y a aucun scénario (avec `--comparer` : une différence), 2 quand une option, un réglage, la page, le fichier, l'archive, une variable d'environnement, une requête à une API ou le navigateur sont refusés, ou que la demande ne s'affiche pas dans le délai, avant toute écriture de texte.

**D17 : cas de test de Xray et de Zephyr Scale, fichiers .feature**

- **D17.INV-1** : une source se lit sans IA : fichier `.feature` ; archive `.zip`, lue en mémoire sans rien extraire sur le disque, ses seuls fichiers `.feature`, stockés ou compressés par deflate, chacun contrôlé par son CRC-32, en nombre et en taille bornés ; tests de Xray Cloud ou Data Center, cas de test de Zephyr Scale Cloud ou Data Center, désignés par leurs clés, 200 au plus ; chaque scénario Gherkin suit le lecteur et les règles de recopie de D16.INV-3.
- **D17.INV-2** : les API ne sont que lues : des requêtes GET, et pour Xray Cloud l'authentification et des requêtes GraphQL `query`, jamais `mutation` ; le skill n'écrit rien dans Jira, Xray ni Zephyr Scale ; toutes les lectures précèdent toute écriture de texte.
- **D17.INV-3** : un jeton se lit dans sa variable d'environnement seulement, `XRAY_CLIENT_ID` et `XRAY_CLIENT_SECRET`, `ZEPHYR_TOKEN` ou `JIRA_TOKEN` ; il ne sort que dans l'en-tête `Authorization` des requêtes vers l'origine de l'API désignée, l'identifiant et le secret de Xray Cloud dans le corps de son authentification, jamais dans une adresse, un message ou un fichier ; l'adresse de l'API est en https, hors du poste même, sans identifiant, paramètre ni fragment ; aucune redirection n'est suivie ; une variable absente ou une adresse refusée arrêtent l'import avant toute requête.
- **D17.INV-4** : la clé du test est l'identité de son scénario : clé demandée à l'API ; dans un fichier, étiquette `@TestCaseKey=` de Zephyr Scale, sinon première étiquette propre au scénario qui est une clé de Jira, préfixe `TEST_` retiré, sauf si un scénario d'un autre titre la porte aussi, sinon étiquette `<CLÉ>-Snn` ; à défaut, une étiquette `<fichier>-Snn` est reprise par le titre ou attribuée comme en D16.INV-4. Un texte importé d'une autre source sous la même identité est celui du même scénario : il se compare et se remplace selon D16.INV-5, jamais en conflit.
- **D17.INV-5** : un test Cucumber ou BDD est recopié tel qu'écrit, sous un titre formé de son résumé quand ses étapes n'en ont pas ; un test manuel devient, pas à pas, « Quand <action> », avec ses données, puis « Alors <résultat attendu> », une partie de plusieurs lignes jointe par « ; », une partie vide omise, la conversion dite dès la première ligne du texte ; un test générique, en texte libre, qui appelle un autre cas, sans résumé, sans pas ou avec un pas vide est refusé avec son motif ; les préconditions sont signalées en tête du texte, non reprises.
- **D17.INV-6** : un texte importé hors de Jira commence par sa provenance : l'outil ou le fichier dont il vient et ce que l'import en a fait, recopie ou conversion d'un test manuel ; son lot (fichier, archive ou test) ; l'étiquette et la provenance du scénario ; l'adresse de l'API qui l'a rendu, ou le chemin du fichier ou de l'archive et son empreinte sha256 ; la date ; l'empreinte de la source et celle du texte importé ; puis ses notes ; un même test donne le même texte et la même empreinte par Xray Cloud ou Data Center, par Zephyr Scale Cloud ou Data Center.

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

La version 1.2.0 ouvre la feuille de route qui répond à la demande du développeur du 20 novembre 2026 : qu'à partir d'un scénario, et de l'accès au code du front et du back et au navigateur, toute l'action d'un testeur humain soit émulée pour réaliser des tests automatisés, quel que soit l'outil, Playwright, Xray, Zephyr ou un autre. Feuille de route ratifiée : étendre ce skill par versions mineures ; sources Xray et Zephyr d'abord ; ensuite un index sans IA du code du front et du back, lu par l'IA à la traduction, des vérifications hors de l'écran par le réseau et l'API en lecture, puis la préparation des données par l'API sous la garde des mutations ; enfin l'export du scénario ratifié en test Playwright du projet et ses résultats au format d'import de Xray ou de Zephyr, sans écrire dans Jira ; une version par étape, chacune en une pull request. Choix de la 1.2.0, ratifiés le même jour :

1. les tests se lisent de leurs fichiers exportés, `.feature` et `.zip`, et des API REST de Xray et de Zephyr Scale, en lecture seule ; le jeton passe par une variable d'environnement seulement, et rien n'est écrit dans Jira (D17.INV-1 à D17.INV-3) ;
2. un test manuel devient, pas à pas, « Quand <action> », avec ses données, puis « Alors <résultat attendu> », sans IA, et l'en-tête le signale (D17.INV-5).

## 12. Journal de révision

**1.2.0** (2026-11-21) : cas de test de Xray et de Zephyr Scale, et fichiers .feature. Dimension D17 active, module `cas-de-test` : `scripts/cas.mjs` ; `importer.mjs` lit aussi un fichier `.feature`, une archive `.zip` d'un export, lue en mémoire, et les tests de Xray Cloud et Data Center et de Zephyr Scale Cloud et Data Center par leur API, en lecture seule, le jeton pris dans une variable d'environnement, en https, sans redirection suivie ; test Cucumber ou BDD recopié, test manuel converti pas à pas en « Quand » puis « Alors », test générique ou en texte libre refusé, préconditions signalées ; la clé du test pour identité, d'un chemin d'import à l'autre ; provenance par lot (D17.INV-1 à D17.INV-6). D16.INV-5 et D16.INV-6 étendus aux nouvelles sources ; agent : protocole d'import des cas de test, D10.INV-5, scénarios A9 et A10, commande `/scenario:importer`. Recette de 25 scénarios (339 contrôles), avec un Xray et un Zephyr Scale factices : R22 à R25 ; 42 défauts réintroduits, tous rejoués. Archive : `archives/SKILL-v1.1.1.md`.

**1.1.1** (2026-11-20) : correctif. La recette passait par intermittence dans la CI, toujours sous Node 24 : un premier lancement du navigateur lent dépassait les délais courts de R5, R6, R8 et R11, ou ceux des preuves d'un échec, et une fois sous Windows la recette s'est bloquée jusqu'au délai du job. Les preuves d'un échec, capture et instantané ARIA, attendent 10 s au plus, au lieu de 5 et 3 ; la durée d'une étape en échec s'arrête à l'échec, sans le temps de ses preuves. Dans la recette, les délais courts ne portent plus que sur les étapes dont ils sont l'objet, et R5 prend le délai par défaut, 10 s ; la recette dit son dossier temporaire dès le début, ferme ses propres navigateurs sans les attendre plus de 15 s, lit la sortie d'un script 2 s au plus après sa fin, et s'arrête d'elle-même au bout de dix minutes en disant dans quel scénario. Le workflow affiche la sortie au fil de l'eau, arrête une recette bloquée au bout de douze minutes et garde en artefact le dossier temporaire d'une recette en échec, sans les profils du navigateur. Aucune dimension ni aucun invariant modifié ; recette de 21 scénarios (279 contrôles), 29 défauts réintroduits, tous rejoués. Archive : `archives/SKILL-v1.1.0.md`.

**1.1.0** (2026-11-20) : scénarios importés d'une demande Jira. Dimension D16 active, module `jira` : `scripts/jira.mjs` et `scripts/importer.mjs`, page enregistrée en MHTML ou adresse de la demande, Jira Cloud et Jira Data Center, description et champs de texte, commentaires sur demande, scénarios recopiés sans IA avec leur provenance, étiquettes gardées, reprises ou attribuées, réimport, `--comparer` et `--remplacer`, textes retouchés gardés (D16.INV-1 à D16.INV-6). Mots-clés de Gherkin en anglais ou en français dans les textes (D2.INV-4) ; agent : protocole d'import, D10.INV-4, scénarios A7 et A8, commande `/scenario:importer`. Recette de 21 scénarios (279 contrôles), avec un Jira factice : R1 étendu, R18 à R21 ; 29 défauts réintroduits. Références : capture-sprint-jira 1.2.2 ajouté. Archive : `archives/SKILL-v1.0.0.md`.

**1.0.0** (2026-11-20) : première version. Dimensions D1 à D10 actives, D11 à D15 réservées. Points d'extension E1 à E3. Texte de départ inspiré de Gherkin, scénario TOML, squelette et contrôle de la traduction sans IA, cibles côté utilisateur, jeu de treize actions, garde des origines et des mutations, étape à la main, profil dédié, rapport et preuves, désignation à la souris, agent `pilote-scenario` et commandes `/scenario:traduire`, `/scenario:jouer` et `/scenario:designer`, écrits en entier dans les modules ; recette de 17 scénarios (213 contrôles) contre une application de démonstration locale ; 20 défauts réintroduits.
<<<FIN SKILL.md>>>

<<<FICHIER modules/execution/SKILL.md>>>
---
name: execution
description: Exécution du skill (installation par npm ci, Node 22 ou plus récent, navigateur du poste et canal Chrome, Edge ou Chromium, dépendance unique playwright-core 1.65.1 à version exacte, emplacements des profils et des résultats, .gitignore du skill, réglages par variables SCENARIO_PLAYWRIGHT_*, lignes de commande de jouer, verifier, traduire et importer et leurs codes de sortie, pièges connus dont le proxy des API, commande d'extraction des fichiers exécutables à empreintes, sources de package.json, package-lock.json, .gitignore, scripts/jouer.mjs, scripts/verifier.mjs et scripts/traduire.mjs). À lire en premier, pour installer le skill.
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
| `node <skill>/scripts/importer.mjs <fichier.feature \| export.zip \| xray:CLÉ,… \| xray-dc:CLÉ,… \| zephyr:CLÉ,… \| zephyr-dc:CLÉ,…> --adresse <url> [options]` | un texte de départ par test d'un fichier, d'une archive, de Xray ou de Zephyr Scale ; jeton par variable d'environnement | `cas-de-test` |
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

Les options, la sortie et les codes de `importer.mjs` sont au module `jira`, § 7 (D16.INV-6) ; ses sources de cas de test et leurs jetons, au module `cas-de-test`, § 2 à § 4.

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
- **API de Xray ou de Zephyr Scale derrière un proxy d'entreprise** : Node ne lit pas `HTTPS_PROXY` de lui-même ; avec Node 24 ou plus récent, `NODE_USE_ENV_PROXY=1` l'y fait passer. Un certificat d'entreprise s'ajoute par `NODE_EXTRA_CA_CERTS`. Une API injoignable arrête l'import avant toute écriture, avec le code 2.
- **Jeton refusé** : « accès refusé (401) » ou « (403) » dit un jeton absent, expiré ou sans droit de lecture du projet ; le développeur en crée un autre, et redéfinit lui-même sa variable d'environnement.

## 8. Matérialiser les fichiers exécutables

| Fichier | Module, section | Empreinte sha256 |
|---|---|---|
| `package.json` | `execution`, § 10 | `74f2c41aa5e79b01fdcd5cd9ced7c6c3547d24a8f2faee8774e9ed0330fa28f3` |
| `package-lock.json` | `execution`, § 10 | `f27ac2c42e7850c9894e1416bc5cd459676e4d02df190de1396275d3d3db2506` |
| `.gitignore` | `execution`, § 10 | `03bf7f97f17a0d1abb005b6480ec3b0f06a0b9c29c1d1f83131209b52b888a7e` |
| `scripts/jouer.mjs` | `execution`, § 11 | `88f507ede8d578dd8d31181466f83cc08ef9e1ce54764db35d60ff24277250d0` |
| `scripts/verifier.mjs` | `execution`, § 12 | `e569372af62ff4c95a5042279114892d3bd85e8759e14f57f09b5cc6de3489e3` |
| `scripts/traduire.mjs` | `execution`, § 13 | `0a537b3d057ffba85162c20d6013a9766e92764c473258a52d98c42194ad06e5` |
| `scripts/texte.mjs` | `texte`, § 12 | `142538a9ec908d180211120d458de8a01d7cfe14b3802920c02ceb5fb97fda28` |
| `scripts/jira.mjs` | `jira`, § 9 | `51cf7985eff34690cd3cb2d74081c5a957b8572bfe4335ba9f49308d10d1b928` |
| `scripts/importer.mjs` | `jira`, § 10 | `6e80f46fe68cf5de006e358dc1ad711950d64d4fa68c5e2e69e7cf2fd64f878b` |
| `scripts/cas.mjs` | `cas-de-test`, § 10 | `6ac3bc9b69028f625b0cb3621370ef227c0af0ab8b0ada9d086dfdd976553739` |
| `scripts/toml.mjs` | `scenario`, § 6 | `3f1667795f0043a854d27de88da605af6ce0d7647bd0be7cae734a90434ec888` |
| `scripts/scenario.mjs` | `scenario`, § 7 | `a8584772b8f8f3b9882cfc223ec60724517c9ea689eec53509946570dd489f29` |
| `scripts/cibles.mjs` | `cibles`, § 6 | `a2d27f8f345099f8e1299e8ad88d3091aeb8c889eca709cb2d25aa9073a1a8f4` |
| `scripts/moteur.mjs` | `actions`, § 9 | `aa4fb1aaeea973c759f33465d382e47c654bfd90060c9603c807f915de6e5cdb` |
| `scripts/session.mjs` | `session`, § 7 | `15ccd88f483d2a798fa798d93f87ba47b1625ca6be7767c36b3d93abebb1849b` |
| `scripts/rapport.mjs` | `preuves`, § 7 | `c409f50d3a00fc52d14a75a58c8b8226b317bfbe943af5026a069e812010b826` |
| `scripts/designer.mjs` | `designer`, § 5 | `b5ad94fc58ee043fddf043ff97a1f46b980a99843a5323d88f188b64ff0477ab` |
| `agent/pilote-scenario.md` | `agent`, § 6 | `959de5dbd10544180b1c0bfd70662bcc2e164670b51101203639258877bd0496` |
| `commandes/scenario/importer.toml` | `agent`, § 7 | `995a6c535e7225018a8c45321e3d205963622e22bb79b7d2d2c221d21d002b65` |
| `commandes/scenario/traduire.toml` | `agent`, § 7 | `bb423488c3544fd22e2ae0837c10772786e43c8de6c62b8dfda72b9f34f06986` |
| `commandes/scenario/jouer.toml` | `agent`, § 7 | `2be21d89882011e10bf71c5a538de219a88ad69cf00b00d4d4ce2df3f6097758` |
| `commandes/scenario/designer.toml` | `agent`, § 7 | `7b3c86484ddceb95158969a385bdb0859f010513b2705736c70498791471569e` |
| `tests/application-demo.mjs` | `recette`, § 6 | `17bdd397df13987f63cfca996dbab9a26a5e6bad6fd2b4eee62e060efde55185` |
| `tests/run-tests.mjs` | `recette`, § 6 | `948948ab723b14aaacccb530be8384869833a7c805a01ff1a55b5ea85f0d28e1` |

Depuis le dossier du skill, cette commande d'une ligne écrit les vingt-quatre fichiers, compare leurs empreintes à celles du tableau et sort avec le code 1 au moindre écart. Elle ne contient ni `$`, ni accent grave, ni `!`, ni `%`, ni guillemet intérieur : elle se colle telle quelle dans bash, zsh, CMD ou PowerShell, et dans un fichier `.cmd`. Elle lit aussi des modules aux fins de ligne CRLF.

```text
node -e "const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'); const attendu = { 'package.json': '74f2c41aa5e79b01fdcd5cd9ced7c6c3547d24a8f2faee8774e9ed0330fa28f3', 'package-lock.json': 'f27ac2c42e7850c9894e1416bc5cd459676e4d02df190de1396275d3d3db2506', '.gitignore': '03bf7f97f17a0d1abb005b6480ec3b0f06a0b9c29c1d1f83131209b52b888a7e', 'scripts/jouer.mjs': '88f507ede8d578dd8d31181466f83cc08ef9e1ce54764db35d60ff24277250d0', 'scripts/verifier.mjs': 'e569372af62ff4c95a5042279114892d3bd85e8759e14f57f09b5cc6de3489e3', 'scripts/traduire.mjs': '0a537b3d057ffba85162c20d6013a9766e92764c473258a52d98c42194ad06e5', 'scripts/texte.mjs': '142538a9ec908d180211120d458de8a01d7cfe14b3802920c02ceb5fb97fda28', 'scripts/jira.mjs': '51cf7985eff34690cd3cb2d74081c5a957b8572bfe4335ba9f49308d10d1b928', 'scripts/importer.mjs': '6e80f46fe68cf5de006e358dc1ad711950d64d4fa68c5e2e69e7cf2fd64f878b', 'scripts/cas.mjs': '6ac3bc9b69028f625b0cb3621370ef227c0af0ab8b0ada9d086dfdd976553739', 'scripts/toml.mjs': '3f1667795f0043a854d27de88da605af6ce0d7647bd0be7cae734a90434ec888', 'scripts/scenario.mjs': 'a8584772b8f8f3b9882cfc223ec60724517c9ea689eec53509946570dd489f29', 'scripts/cibles.mjs': 'a2d27f8f345099f8e1299e8ad88d3091aeb8c889eca709cb2d25aa9073a1a8f4', 'scripts/moteur.mjs': 'aa4fb1aaeea973c759f33465d382e47c654bfd90060c9603c807f915de6e5cdb', 'scripts/session.mjs': '15ccd88f483d2a798fa798d93f87ba47b1625ca6be7767c36b3d93abebb1849b', 'scripts/rapport.mjs': 'c409f50d3a00fc52d14a75a58c8b8226b317bfbe943af5026a069e812010b826', 'scripts/designer.mjs': 'b5ad94fc58ee043fddf043ff97a1f46b980a99843a5323d88f188b64ff0477ab', 'agent/pilote-scenario.md': '959de5dbd10544180b1c0bfd70662bcc2e164670b51101203639258877bd0496', 'commandes/scenario/importer.toml': '995a6c535e7225018a8c45321e3d205963622e22bb79b7d2d2c221d21d002b65', 'commandes/scenario/traduire.toml': 'bb423488c3544fd22e2ae0837c10772786e43c8de6c62b8dfda72b9f34f06986', 'commandes/scenario/jouer.toml': '2be21d89882011e10bf71c5a538de219a88ad69cf00b00d4d4ce2df3f6097758', 'commandes/scenario/designer.toml': '7b3c86484ddceb95158969a385bdb0859f010513b2705736c70498791471569e', 'tests/application-demo.mjs': '17bdd397df13987f63cfca996dbab9a26a5e6bad6fd2b4eee62e060efde55185', 'tests/run-tests.mjs': '948948ab723b14aaacccb530be8384869833a7c805a01ff1a55b5ea85f0d28e1' }; const vus = new Set(); let ecarts = 0; for (const module of ['modules/execution/SKILL.md', 'modules/texte/SKILL.md', 'modules/jira/SKILL.md', 'modules/cas-de-test/SKILL.md', 'modules/scenario/SKILL.md', 'modules/cibles/SKILL.md', 'modules/actions/SKILL.md', 'modules/session/SKILL.md', 'modules/preuves/SKILL.md', 'modules/designer/SKILL.md', 'modules/agent/SKILL.md', 'modules/recette/SKILL.md']) { const texte = fs.readFileSync(module, 'utf8').replace(/\r\n/g, '\n'); for (const m of texte.matchAll(/^<\x21-- fichier : (\S+) -->\n\x60{3}[a-z]*\n([\s\S]*?)\n\x60{3}\n/gm)) { const contenu = m[2] + '\n'; fs.mkdirSync(path.dirname(m[1]), { recursive: true }); fs.writeFileSync(m[1], contenu); vus.add(m[1]); const conforme = crypto.createHash('sha256').update(contenu).digest('hex') === attendu[m[1]]; if (conforme === false) ecarts++; console.log((conforme ? 'conforme  ' : 'ECART     ') + m[1]); } } for (const f of Object.keys(attendu)) if (vus.has(f) === false) { ecarts++; console.log('ABSENT    ' + f); } if (ecarts > 0) process.exitCode = 1;"
```

Puis, depuis le même dossier : `npm ci`, et la recette, `npm test` (sous Linux sans écran, `xvfb-run -a npm test`).

## 9. Contrôle de sortie

- La commande du § 8 écrit `conforme` pour chacun des vingt-quatre fichiers.
- `npm ci` installe `playwright-core` 1.65.1.
- `npm test` rend son bilan sans échec (module `recette`).

## 10. Paquet et fichiers de travail

`package.json` déclare la dépendance unique, la version de Node et les commandes du § 1 ; `package-lock.json` fixe la version de la dépendance ; `.gitignore` écarte les fichiers de travail (§ 3).

<!-- fichier : package.json -->
```json
{
  "name": "scenario-playwright",
  "version": "1.2.0",
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
  "version": "1.2.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "scenario-playwright",
      "version": "1.2.0",
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
// scenario-playwright 1.2.0 : joue un scénario TOML dans le navigateur du poste, comme un utilisateur.
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
// scenario-playwright 1.2.0 : vérifie des textes de départ et des scénarios TOML, sans ouvrir de navigateur.
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
// scenario-playwright 1.2.0 : squelette TOML de la traduction d'un texte de départ, produit sans IA.
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

Le texte de départ appartient au développeur : il y dit, en français ou en anglais, ce qu'une personne fait et voit, dans l'ordre. Il l'écrit, ou l'importe d'une demande Jira (module `jira`), d'un fichier `.feature` ou d'un cas de test de Xray ou de Zephyr Scale (module `cas-de-test`). Le skill en lit la structure sans IA (`scripts/texte.mjs`) : titre, étiquettes, réglages, étapes avec leur ligne, marques, variables et exemples. La phrase d'une étape n'est pas interprétée ici : c'est la traduction en TOML qui lui donne ses actions (module `scenario`). Le texte reste la référence : sa traduction cite son empreinte, et un texte modifié rend sa traduction périmée (D3.INV-2).

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
// scenario-playwright 1.2.0 : lecteur du texte de départ d'un scénario (fichier .scenario), sans dépendance.
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
description: Scénarios importés d'une demande Jira (page enregistrée en MHTML par le développeur, par capture-sprint-jira ou remise à agent-tdd-jira, ou adresse de la demande ouverte dans le navigateur du poste, sur un profil dédié, connexion à la main, page enregistrée en MHTML ; Jira Cloud et Jira Data Center reconnus à leurs marqueurs ; description et champs de texte lus, commentaires sur demande ; scénarios Gherkin en français ou en anglais recopiés sans IA en textes de départ, contexte reporté, colonnes d'exemples adaptées, refus motivés ; étiquette @<CLÉ>-Snn de Jira, reprise ou attribuée ; provenance et empreintes en tête de chaque texte ; réimport, --comparer et --remplacer, textes retouchés gardés, communs à toutes les sources ; ligne de commande et codes de sortie de importer.mjs, qui lit aussi les sources du module cas-de-test), sources de scripts/jira.mjs et scripts/importer.mjs. À lire pour importer les scénarios d'une demande, et pour les règles communes à tout import.
dimensions: [D16]
status: active
---

# Module `jira` (D16)

Phases 7E couvertes : Environnement et Éléments.

## 1. Principe

Les scénarios d'une US s'écrivent souvent dans Jira, par le PO ou par agent-tdd-jira. `scripts/importer.mjs` les recopie, sans IA, en textes de départ : un fichier `.scenario` par scénario, que le développeur vérifie, fait traduire, ratifie et joue comme un texte écrit à la main (modules `texte` et `scenario`). Le texte reste la référence de sa traduction (D3.INV-2) ; Jira reste la référence du texte importé : un réimport, ou `--comparer`, dit ce qui a changé dans Jira depuis l'import.

`importer.mjs` lit aussi des fichiers `.feature`, des archives d'export et les tests de Xray et de Zephyr Scale (module `cas-de-test`, D17). Le lecteur de Gherkin (§ 4), le texte importé (§ 5), le réimport (§ 6) et la ligne de commande (§ 7) de ce module valent pour toutes les sources ; ce qui leur est propre est dans `cas-de-test`.

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
# Importé de Jira par importer.mjs (scenario-playwright 1.2.0), sans IA : le scénario est recopié tel qu'écrit dans Jira.
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
- **Lot** : la demande est le lot de ses textes ; la première ligne de l'en-tête dit la source, `de Jira` ici, et la ligne « Demande : » le lot. Les textes des autres sources ont une ligne « Lot : » à la place (module `cas-de-test`, § 7).

## 6. Réimport et comparaison (D16.INV-5)

Les textes du dossier dont la provenance désigne la même demande sont comparés aux scénarios de la page, par leur étiquette ; un scénario dont Jira donne l'étiquette retrouve aussi le texte qu'une autre source a importé sous la même étiquette (module `cas-de-test`, D17.INV-4). Les mêmes états valent pour toute source, « changé dans » et « disparu de » la nommant :

| État | `--comparer` | import | import avec `--remplacer` |
|---|---|---|---|
| identique | `identique` | `inchangé` : le texte n'est pas réécrit | idem |
| modifié dans Jira | `modifié` | non remplacé ; code 1 | `remplacé` ; un texte retouché depuis l'import est d'abord gardé dans `<texte>.avant-<horodatage>` |
| nouveau | `nouveau` | `écrit` | `écrit` |
| disparu de Jira | `disparu` | signalé ; le texte reste | idem |
| conflit : un texte du même nom ne vient pas d'un import de ce scénario, écrit à la main par exemple | `conflit` | jamais remplacé ; code 1 | idem |
| refusé, doublon | `refusé`, `doublon`, avec le motif | non écrit ; code 1 | idem |

`--comparer` n'écrit aucun texte. Un texte remplacé rend sa traduction périmée, par l'empreinte (D3.INV-2) : elle se refait et se ratifie. Les marques `(création)`, `(modification)`, `(suppression)` et `(à la main)` manquent souvent aux scénarios de Jira : elles s'ajoutent de préférence dans Jira, où un réimport les retrouve ; ajoutées dans le texte, elles font un texte retouché, gardé à côté avant tout remplacement.

## 7. Ligne de commande et codes de sortie (D16.INV-6)

`importer.mjs <page.mhtml | adresse de la demande | fichier.feature | export.zip | xray:CLÉ,… | xray-dc:CLÉ,… | zephyr:CLÉ,… | zephyr-dc:CLÉ,…>` ; une source dont le nom ne finit ni par `.feature` ni par `.zip`, et qui n'est ni une adresse ni une désignation d'outil, se lit comme une page enregistrée :

| Option | Effet |
|---|---|
| `--adresse <url>` | adresse de l'application, ligne « Adresse : » des textes ; obligatoire, sauf avec `--comparer` |
| `--origines o1,o2` | ligne « Origines : » ; doit contenir l'origine de `--adresse` |
| `--profil <nom>` | ligne « Profil : » |
| `--dossier <dossier>` | dossier des textes, `scenarios` par défaut ; la page enregistrée par l'adresse va dans son sous-dossier `jira/` |
| `--commentaires` | lit aussi les commentaires (D16.INV-2) ; pour une demande Jira seulement |
| `--remplacer` | remplace les textes des scénarios modifiés dans Jira (§ 6) |
| `--comparer` | compare sans rien écrire ; exclut `--remplacer` |
| `--profil-jira <nom>` | profil du navigateur pour Jira, `jira` par défaut ; pour une demande Jira seulement |
| `--delai-connexion <s>` | attente de la demande par l'adresse, de 1 à 900 s, 300 par défaut ; pour une demande Jira seulement |
| `--api <url>` | adresse de l'API de Xray ou de Zephyr Scale (module `cas-de-test`, § 3) ; pour `xray:`, `xray-dc:`, `zephyr:` et `zephyr-dc:` seulement |

Sortie : `page enregistrée : …` par l'adresse, une ligne `Demande <CLÉ> (Jira Cloud ou Data Center), « résumé » : n scénarios (par zone)`, les `LIMITE …`, une ligne par scénario (état, étiquette, titre, fichier ou motif), puis `Bilan : …`. Les autres sources ont leur propre première ligne, et une ligne `introuvable` par test absent (module `cas-de-test`, § 8).

| Code | import | `--comparer` |
|---|---|---|
| 0 | chaque scénario est écrit, remplacé ou inchangé | chaque scénario est identique, aucun n'a disparu |
| 1 | un scénario n'est pas écrit : modifié sans `--remplacer`, conflit, refus, doublon, test introuvable ; ou aucun scénario | une différence, un refus, un test introuvable, ou aucun scénario |
| 2 | option, réglage, page, fichier, archive, variable d'environnement, requête à une API ou navigateur refusé, demande non affichée dans le délai, avant toute écriture de texte | idem |

## 8. Contrôle de sortie

- Une page enregistrée de Jira Cloud ou de Jira Data Center se lit, quoted-printable ou base64 ; une autre page est refusée (D16.INV-2).
- Les commentaires ne sont lus qu'avec `--commentaires` (D16.INV-2).
- Chaque scénario importable donne un texte que `verifier.mjs` accepte, mots-clés recopiés tels qu'écrits ; un scénario non importable est refusé avec son motif (D16.INV-3).
- Chaque texte porte sa provenance et son étiquette (D16.INV-4).
- Un réimport sans changement ne réécrit rien ; `--comparer` n'écrit rien ; un texte retouché est gardé avant d'être remplacé ; un texte écrit à la main n'est jamais remplacé (D16.INV-5).
- Par l'adresse, le skill ne fait que naviguer ; la connexion se fait à la main ; la page enregistrée est relisible (D16.INV-1).

## 9. Source `scripts/jira.mjs`

Le lecteur, sans navigateur : MHTML, demande, lignes du HTML, scénarios, étiquettes, texte importé et sources de son en-tête, provenance et lots, comparaison, identité d'une source à l'autre.

<!-- fichier : scripts/jira.mjs -->
```javascript
// scenario-playwright 1.2.0 : scénarios Gherkin d'une demande Jira enregistrée en MHTML, lus sans IA.
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
          courant.etiquettesPropres = [...new Set([...courant.etiquettesPropres, ...enAttente])];
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
            etiquettesJira: [...new Set([...tagsFonctionnalite, ...tagsRegle, ...enAttente])], etiquettesPropres: [...new Set(enAttente)],
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
 * `identite(sc)` rend l'étiquette qu'une source donne d'elle-même à un scénario, la clé d'un test (D17.INV-4).
 */
export function attribuerEtiquettes(scenarios, cle, importes = [], identite = () => null) {
  const re = new RegExp(`^${cle}-S(\\d+)$`);
  const deJira = new Set(scenarios.flatMap((sc) => sc.etiquettesJira.filter((e) => re.test(e))));
  const pris = new Set([...deJira, ...importes.map((t) => t.etiquette)].filter((e) => re.test(e)).map((e) => Number(re.exec(e)[1])));
  const parTitre = new Map();
  for (const t of importes) if (t.attribuee && t.titre !== null && !deJira.has(t.etiquette)) parTitre.set(t.titre, [...(parTitre.get(t.titre) ?? []), t.etiquette]);
  const vues = new Map();
  let n = 1;
  for (const sc of scenarios) {
    const propre = identite(sc) ?? sc.etiquettesJira.find((e) => re.test(e));
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
/** Première ligne de tout texte importé : de Jira, de Xray, de Zephyr Scale, d'un fichier .feature ou d'une archive .zip. */
const RE_ENTETE_IMPORT = /^# Importé (?:de |d')(.+?) par importer\.mjs\b/;
/** Sources des textes importés, et ce que l'en-tête et les messages en disent. */
export const ORIGINES = {
  jira: { nom: 'Jira', de: 'de Jira', dans: 'dans Jira', fixer: 'dans Jira' },
  xray: { nom: 'Xray', de: 'de Xray', dans: 'dans Xray', fixer: 'dans Xray' },
  zephyr: { nom: 'Zephyr Scale', de: 'de Zephyr Scale', dans: 'dans Zephyr Scale', fixer: 'dans Zephyr Scale' },
  feature: { nom: 'fichier .feature', de: 'd\'un fichier .feature', dans: 'dans le fichier', fixer: 'dans le fichier' },
  zip: { nom: 'archive .zip', de: 'd\'une archive .zip', dans: 'dans l\'archive', fixer: 'dans le fichier .feature' },
};

/** En-tête de provenance et corps d'un texte : l'en-tête est la suite de commentaires qui l'ouvre. */
function separerProvenance(texte) {
  const lignes = normaliser(texte).split('\n');
  let i = 0;
  while (i < lignes.length && lignes[i].startsWith('#')) i++;
  return { entete: lignes.slice(0, i), corps: lignes.slice(i).join('\n') };
}

/**
 * Texte de départ d'un scénario importé (D16.INV-3, D16.INV-4, D17.INV-5) : en-tête de provenance en
 * commentaires, puis le scénario tel qu'écrit dans sa source, avec les réglages donnés à l'import. Rend
 * { texte, erreurs } ; chaque erreur du lecteur de textes est rendue avec la ligne qu'elle concerne.
 * `origine` dit la source, Jira par défaut ; `lot` regroupe les textes d'une même importation hors de Jira ;
 * `notes` s'ajoutent à l'en-tête.
 */
export function texteImporte(sc, { cle, resume, source, page = null, date, adresse, origines = [], profil = null, origine = ORIGINES.jira, lot = null, notes = [] }) {
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
  const jira = origine.nom === 'Jira';
  const facon = sc.manuel ? 'chaque pas du test manuel devient « Quand <action> », avec ses données, puis « Alors <résultat attendu> »' : `le scénario est recopié tel qu'écrit ${origine.dans}`;
  const entete = [
    `# Importé ${origine.de} par importer.mjs (scenario-playwright 1.2.0), sans IA : ${facon}.`,
    jira ? `# Demande : ${cle}${resume ? `, « ${resume} »` : ''}` : `# Lot : ${lot}`,
    `# Scénario : @${sc.etiquette}, ${sc.provenance}`,
    `# Source : ${source}`,
  ];
  if (page) entete.push(`# Page enregistrée : ${page.chemin} (sha256 ${page.sha256})`);
  entete.push(`# Importé le : ${date}`, `# Empreinte ${jira ? 'Jira' : 'de la source'} : ${sc.empreinte}`, `# Empreinte du texte importé : ${sha256(normaliser(corpsTexte))}`);
  if (sc.attribuee) entete.push(`# Étiquette @${sc.etiquette} attribuée par l'import, ${jira ? 'Jira' : 'la source'} n'en donnant pas : l'écrire ${origine.fixer}, avant le titre du scénario, la fixe.`);
  if (sc.contexte > 0) entete.push(`# Contexte ${jira ? 'de Jira ' : ''}reporté en tête des étapes : ${sc.contexte} étape${sc.contexte > 1 ? 's' : ''}.`);
  for (const n of notes) entete.push(`# ${n}`);
  if (adapte.renommees.length) entete.push(`# Colonnes d'exemples adaptées au format texte : ${adapte.renommees.map(([a, b]) => `« ${a} » en <${b}>`).join(', ')}.`);
  const texte = `${entete.join('\n')}\n${corpsTexte}`;
  const lignes = texte.split('\n');
  const erreurs = analyserTexte(texte).erreurs.map((e) => (e.ligne > 0 ? `« ${lignes[e.ligne - 1].trim()} » : ${e.message}` : e.message));
  return { texte: erreurs.length ? null : texte, erreurs };
}

/**
 * Provenance d'un texte importé : { source, cle, lot, etiquette, attribuee, empreinte, retouche }, ou null
 * pour un texte écrit à la main. Le lot d'un texte de Jira est sa demande. `retouche` dit si le corps du
 * texte a changé depuis l'import.
 */
export function lireProvenance(texte) {
  const { entete, corps } = separerProvenance(texte);
  const source = RE_ENTETE_IMPORT.exec(entete[0] ?? '')?.[1];
  if (!source) return null;
  const champ = (re) => entete.map((l) => re.exec(l)?.[1]).find(Boolean) ?? null;
  const importe = champ(/^# Empreinte du texte importé : ([0-9a-f]{64})$/);
  const cle = champ(/^# Demande : ([A-Z][A-Z0-9_]+-\d+)\b/);
  return {
    source,
    cle,
    lot: cle ?? champ(/^# Lot : (.+)$/),
    etiquette: champ(/^# Scénario : @([^\s,]+)/),
    attribuee: entete.some((l) => /^# Étiquette @\S+ attribuée par l'import/.test(l)),
    empreinte: champ(/^# Empreinte (?:Jira|de la source) : ([0-9a-f]{64})$/),
    retouche: importe === null ? null : importe !== sha256(corps),
  };
}

/**
 * Textes du dossier importés d'un lot, la demande pour Jira : [{ fichier, etiquette, attribuee, titre,
 * empreinte, retouche }], le premier texte d'une étiquette seulement. `lots` : un lot, un ensemble de lots,
 * ou null pour tous les textes importés. `existants` : [{ fichier, texte }].
 */
export function textesImportes(existants, lots) {
  const garde = lots === null ? () => true : typeof lots === 'string' ? (l) => l === lots : (l) => lots.has(l);
  const vus = new Set();
  const importes = [];
  for (const f of existants) {
    const p = lireProvenance(f.texte);
    if (!p?.lot || !garde(p.lot) || !p.etiquette || vus.has(p.etiquette)) continue;
    vus.add(p.etiquette);
    importes.push({ fichier: f.fichier, ...p, titre: analyserTexte(f.texte).scenario.titre });
  }
  return importes;
}

/**
 * État de chaque scénario lu face aux textes du dossier (D16.INV-5, D17.INV-4) : nouveau, identique,
 * modifie, conflit (un autre texte porte déjà son nom), refuse, doublon ; et disparu pour un texte
 * importé du lot dont l'étiquette n'est plus dans la source. Un scénario dont la source donne l'étiquette
 * retrouve son texte importé d'un autre lot, `ailleurs` (la même clé de test, d'un autre chemin d'import).
 * `importes` : textes du lot ; `fichiers` : noms des textes du dossier.
 */
export function comparer(scenarios, importes, fichiers, ailleurs = []) {
  const parEtiquette = new Map(importes.map((t) => [t.etiquette, t]));
  const autres = new Map();
  for (const t of ailleurs) if (!autres.has(t.etiquette)) autres.set(t.etiquette, t);
  const etats = [];
  for (const sc of scenarios) {
    if (sc.refus) { etats.push({ etat: 'refuse', sc, motif: sc.refus }); continue; }
    if (sc.doublonDe !== null) { etats.push({ etat: 'doublon', sc, motif: `même étiquette que « ${sc.doublonDe} »` }); continue; }
    const t = parEtiquette.get(sc.etiquette) ?? (sc.attribuee ? undefined : autres.get(sc.etiquette));
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

La ligne de commande : options, genre de la source, page par l'adresse (capture) ou par le fichier, fichier `.feature`, archive, API (module `cas-de-test`), lecture, comparaison aux textes du dossier, écriture.

<!-- fichier : scripts/importer.mjs -->
```javascript
#!/usr/bin/env node
// scenario-playwright 1.2.0 : importe en textes de départ, sans IA, les scénarios Gherkin d'une demande Jira,
// d'un fichier .feature ou d'une archive .zip d'un export, et les tests de Xray et de Zephyr Scale lus par
// leur API.
//
// Usage, depuis n'importe quel dossier :
//   node <dossier du skill>/scripts/importer.mjs <source> --adresse <url> [--origines o1,o2] [--profil nom]
//     [--dossier dossier] [--remplacer] [options de la source]
//   node <dossier du skill>/scripts/importer.mjs <source> --comparer [--dossier dossier] [options de la source]
// Sources :
//   page.mhtml | adresse de la demande  demande Jira (D16) ; options --commentaires, --profil-jira nom, --delai-connexion s
//   fichier.feature | export.zip        scénarios d'un fichier .feature, ou des fichiers .feature d'une archive (D17)
//   xray:CLÉ[,CLÉ…]                     tests de Xray Cloud, avec XRAY_CLIENT_ID et XRAY_CLIENT_SECRET ; --api pour une autre région
//   xray-dc:CLÉ[,CLÉ…]                  tests de Xray Data Center, avec JIRA_TOKEN ; --api <adresse de Jira>
//   zephyr:CLÉ[,CLÉ…]                   cas de test de Zephyr Scale Cloud, avec ZEPHYR_TOKEN ; --api pour une autre région
//   zephyr-dc:CLÉ[,CLÉ…]                cas de test de Zephyr Scale Data Center, avec JIRA_TOKEN ; --api <adresse de Jira>
// Un jeton ne passe que par sa variable d'environnement, que le développeur définit lui-même ; les API ne
// sont que lues (D17.INV-2, D17.INV-3). Avec l'adresse d'une demande, la demande s'ouvre dans le navigateur
// du poste, sur le profil dédié à Jira : la connexion se fait par le développeur, dans la fenêtre ; le skill
// n'y clique ni n'y saisit rien, et enregistre la page en MHTML dans <dossier>/jira/ (D16.INV-1). Chaque
// scénario devient <ÉTIQUETTE>.scenario dans le dossier. Codes de sortie : 0 tout est écrit ou inchangé
// (avec --comparer : aucune différence), 1 un scénario n'est pas écrit (avec --comparer : une différence),
// 2 refus avant toute écriture de texte.
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { setTimeout as attendre } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
import { adresseApi, ErreurCas, identitesGherkin, lignesDe, lireJetons, lireSource, lireTests, lireZip, OUTILS, prefixeDe, scenariosDesTests } from './cas.mjs';
import { attribuerEtiquettes, comparer, ErreurJira, extraireScenarios, lireDemande, lireMhtml, ORIGINES, texteImporte, textesImportes, verifierReglages } from './jira.mjs';
import { dossierProfil, lireReglages, ouvrirNavigateur } from './session.mjs';
import { origineDe, RE_PROFIL } from './texte.mjs';

const USAGE = 'Usage : node scripts/importer.mjs <page.mhtml | adresse de la demande | fichier.feature | export.zip | xray:CLÉ,… | xray-dc:CLÉ,… | zephyr:CLÉ,… | zephyr-dc:CLÉ,…> --adresse <url> [--origines o1,o2] [--profil nom] [--dossier dossier] [--remplacer | --comparer] [--api url] [--commentaires] [--profil-jira nom] [--delai-connexion s]';
export const PROFIL_JIRA = 'jira';
export const DELAI_CONNEXION = 300;
const MARQUEURS = '[data-testid^="issue.views."], #summary-val, #description-val';

/** Lit la ligne de commande ; rend { options } ou { erreur }. */
export function lireArguments(args) {
  const o = { source: null, adresse: null, origines: [], profil: null, dossier: 'scenarios', commentaires: false, remplacer: false, comparer: false, profilJira: PROFIL_JIRA, delaiConnexion: DELAI_CONNEXION, api: null, optionsJira: [] };
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
      else if (a === '--api') o.api = suivant();
      else if (a === '--profil-jira') {
        o.optionsJira.push(a);
        o.profilJira = suivant();
        if (!RE_PROFIL.test(o.profilJira)) throw new Error(`--profil-jira invalide : « ${o.profilJira} » (minuscules, chiffres, - et _)`);
      } else if (a === '--delai-connexion') {
        o.optionsJira.push(a);
        const v = Number(suivant());
        if (!Number.isInteger(v) || v < 1 || v > 900) throw new Error('--delai-connexion attend un nombre de secondes, de 1 à 900');
        o.delaiConnexion = v;
      } else if (a === '--commentaires') {
        o.optionsJira.push(a);
        o.commentaires = true;
      } else if (a === '--remplacer') o.remplacer = true;
      else if (a === '--comparer') o.comparer = true;
      else if (a.startsWith('-')) throw new Error(`option inconnue : ${a}`);
      else if (o.source !== null) throw new Error('une seule source à la fois');
      else o.source = a;
    } catch (e) {
      return { erreur: e.message };
    }
  }
  if (o.source === null) return { erreur: 'source manquante : page MHTML ou adresse d\'une demande Jira, fichier .feature, archive .zip, ou xray:, xray-dc:, zephyr:, zephyr-dc: suivi des clés des tests' };
  if (o.remplacer && o.comparer) return { erreur: '--comparer n\'écrit rien : sans --remplacer' };
  return { options: o };
}

const deux = (n) => String(n).padStart(2, '0');
const horodatage = (d = new Date()) => `${d.getFullYear()}${deux(d.getMonth() + 1)}${deux(d.getDate())}-${deux(d.getHours())}${deux(d.getMinutes())}${deux(d.getSeconds())}`;
const compte = (n, un, plusieurs) => `${n} ${n > 1 ? plusieurs : un}`;
const chemin = (de, vers) => relative(de, vers).split('\\').join('/');
const sha256 = (octets) => createHash('sha256').update(octets).digest('hex');
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

const lignesHors = (horsScenario) => {
  for (const h of horsScenario) console.log(`LIMITE ${compte(h.lignes, 'ligne d\'étape', 'lignes d\'étape')} hors d'un titre « Scénario: » ignorée${h.lignes > 1 ? 's' : ''} (${h.zone})`);
};
const parZone = (scenarios) => [...new Set(scenarios.map((s) => s.provenance))].map((z) => `${z} : ${scenarios.filter((s) => s.provenance === z).length}`);

/**
 * Demande Jira, par sa page enregistrée ou par son adresse (D16) : { scenarios, lots, prefixe, origine,
 * nomLot, contexte }, ou { code } quand l'import s'arrête.
 */
async function lireJira(o, source, { reglages, dossier }) {
  let octets;
  if (source.adresse) {
    if (origineDe(o.source) === null) return { code: refus(`adresse de la demande invalide : ${o.source}`) };
    const capture = await capturer(o.source, { reglages, profilJira: o.profilJira, delaiConnexion: o.delaiConnexion });
    if (capture.erreur) return { code: refus(capture.erreur) };
    octets = capture.octets;
  } else {
    try {
      octets = readFileSync(o.source);
    } catch {
      return { code: refus(`${o.source} : fichier introuvable`) };
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
  let fichierPage = source.adresse ? null : resolve(o.source);
  if (source.adresse) {
    fichierPage = join(dossier, 'jira', `${demande?.cle ?? 'page'}-${horodatage()}.mhtml`);
    mkdirSync(join(dossier, 'jira'), { recursive: true });
    writeFileSync(fichierPage, octets);
    console.log(`page enregistrée : ${fichierPage} (elle reste sur le poste : l'écarter du dépôt du projet)`);
  }
  if (erreurPage) return { code: refus(`${o.source} : ${erreurPage}`) };
  const { scenarios, horsScenario } = extraireScenarios(demande.zones);
  const zones = parZone(scenarios);
  console.log(`Demande ${demande.cle} (Jira ${demande.variante === 'cloud' ? 'Cloud' : 'Data Center'})${demande.resume ? `, « ${demande.resume} »` : ''} : ${compte(scenarios.length, 'scénario', 'scénarios')}${zones.length ? ` (${zones.join(', ')})` : ''}${o.commentaires ? ', commentaires lus' : ''}`);
  for (const l of demande.limites) console.log(`LIMITE ${l}`);
  lignesHors(horsScenario);
  if (scenarios.length === 0) {
    console.log(`Bilan : aucun scénario Gherkin trouvé dans la description ni dans les champs de texte${o.commentaires ? ', ni dans les commentaires' : ' (les commentaires se lisent avec --commentaires)'}`);
    return { code: 1 };
  }
  return {
    scenarios, lots: demande.cle, prefixe: demande.cle, origine: ORIGINES.jira, nomLot: demande.cle,
    contexte: { cle: demande.cle, resume: demande.resume, source: demande.url ?? (source.adresse ? o.source : 'page enregistrée'), page: { chemin: chemin(dossier, fichierPage), sha256: page.sha256 } },
  };
}

/** Fichier .feature, ou fichiers .feature d'une archive .zip (D17.INV-1), lus sans IA. */
function lireFichier(o, source, dossier) {
  const fichier = resolve(o.source);
  let octets;
  try {
    octets = readFileSync(fichier);
  } catch {
    return { code: refus(`${o.source} : fichier introuvable`) };
  }
  const nom = basename(fichier);
  const archive = source.genre === 'zip';
  let fichiers;
  const limites = [];
  if (archive) {
    let zip;
    try {
      zip = lireZip(octets);
    } catch (e) {
      if (!(e instanceof ErreurCas)) throw e;
      return { code: refus(`${o.source} : ${e.message}`) };
    }
    fichiers = zip.entrees.map((e) => ({ nom: e.nom, texte: e.octets.toString('utf8') }));
    if (zip.ignorees.length) limites.push(`${compte(zip.ignorees.length, 'fichier de l\'archive ignoré', 'fichiers de l\'archive ignorés')} : ${zip.ignorees.slice(0, 3).join(', ')}${zip.ignorees.length > 3 ? ', …' : ''} (seuls les .feature sont lus)`);
    for (const r of zip.refusees) limites.push(`${r.nom} : ${r.motif}`);
  } else {
    fichiers = [{ nom, texte: octets.toString('utf8') }];
  }
  const { scenarios, horsScenario } = extraireScenarios(fichiers.map((f) => ({ zone: 'fichier', libelle: f.nom, lignes: lignesDe(f.texte) })));
  const zones = parZone(scenarios);
  if (archive) console.log(`Archive ${nom} : ${compte(fichiers.length, 'fichier .feature', 'fichiers .feature')}, ${compte(scenarios.length, 'scénario', 'scénarios')}${zones.length ? ` (${zones.join(', ')})` : ''}`);
  else console.log(`Fichier ${nom} : ${compte(scenarios.length, 'scénario', 'scénarios')}`);
  for (const l of limites) console.log(`LIMITE ${l}`);
  lignesHors(horsScenario);
  if (scenarios.length === 0) {
    console.log(`Bilan : aucun scénario Gherkin trouvé ${archive ? 'dans l\'archive' : 'dans le fichier'}`);
    return { code: 1 };
  }
  const lot = `${archive ? 'archive' : 'fichier'} ${chemin(dossier, fichier)}`;
  return {
    scenarios, lots: lot, prefixe: prefixeDe(fichier), identite: identitesGherkin(scenarios), origine: archive ? ORIGINES.zip : ORIGINES.feature, nomLot: 'ce scénario',
    contexte: { lot, source: `${lot} (sha256 ${sha256(octets)})` },
  };
}

/** Tests de Xray ou de Zephyr Scale, lus par leur API, en lecture seule, avec le jeton de l'environnement (D17). */
async function lireApi(o, source, env) {
  const outil = OUTILS[source.outil];
  let base;
  try {
    base = adresseApi(source.outil, o.api);
  } catch (e) {
    if (!(e instanceof ErreurCas)) throw e;
    return { code: refus(e.message) };
  }
  const jetons = lireJetons(source.outil, env);
  if (jetons.erreur) return { code: refus(jetons.erreur) };
  let lu;
  try {
    lu = await lireTests(source.outil, source.cles, { base, jetons: jetons.valeurs });
  } catch (e) {
    if (!(e instanceof ErreurCas)) throw e;
    return { code: refus(e.message) };
  }
  const scenarios = scenariosDesTests(lu.tests, source.outil);
  const sortes = [...new Set(lu.tests.map((t) => t.sorte))].map((s) => `${lu.tests.filter((t) => t.sorte === s).length} ${s}`);
  console.log(`${outil.nom} ${outil.variante} (${base}) : ${compte(source.cles.length, `${outil.test} demandé`, `${outil.tests} demandés`)}, ${compte(lu.tests.length, 'lu', 'lus')}${sortes.length ? ` (${sortes.join(', ')})` : ''}`);
  return {
    scenarios, lots: new Set(source.cles.map((c) => `${outil.lot} ${c}`)), prefixe: outil.lot, identite: (sc) => sc.cleTest ?? null,
    origine: ORIGINES[outil.lot], nomLot: 'ce scénario', contexte: {}, introuvables: lu.introuvables,
  };
}

const LIBELLES = { ecrit: 'écrit', inchange: 'inchangé', remplace: 'remplacé', modifie: 'modifié', refuse: 'refusé', doublon: 'doublon', conflit: 'conflit', disparu: 'disparu', identique: 'identique', nouveau: 'nouveau', introuvable: 'introuvable' };
const ligne = (etat, etiquette, reste) => console.log(`  ${LIBELLES[etat].padEnd(10)} ${etiquette ? `@${etiquette}` : ''}  ${reste}`);

/**
 * Compare les scénarios lus aux textes du dossier, puis écrit ceux qui sont nouveaux, et ceux qui ont
 * changé avec --remplacer (D16.INV-5) ; avec --comparer, n'écrit rien. Rend le code de sortie.
 */
function ecrireTextes(o, lecture, dossier) {
  const existants = existsSync(dossier)
    ? readdirSync(dossier, { withFileTypes: true }).filter((f) => f.isFile() && /\.scenario$/i.test(f.name)).map((f) => ({ fichier: f.name, texte: readFileSync(join(dossier, f.name), 'utf8') }))
    : [];
  const importes = textesImportes(existants, lecture.lots);
  attribuerEtiquettes(lecture.scenarios, lecture.prefixe, importes, lecture.identite);
  const etats = comparer(lecture.scenarios, importes, existants.map((f) => f.fichier), textesImportes(existants, null));
  const introuvables = lecture.introuvables ?? [];
  const { dans } = lecture.origine;
  const titre = (e) => (e.sc ? e.sc.titre : '');

  if (o.comparer) {
    const n = { identique: 0, modifie: 0, nouveau: 0, disparu: 0, autre: 0 };
    for (const e of etats) {
      if (e.etat === 'identique') ligne('identique', e.sc.etiquette, `${titre(e)} (${e.fichier})${e.retouche ? ' ; texte retouché depuis l\'import' : ''}`);
      else if (e.etat === 'modifie') ligne('modifie', e.sc.etiquette, `${titre(e)} (${e.fichier}) : changé ${dans} depuis l'import${e.retouche ? ' ; texte retouché depuis l\'import' : ''}`);
      else if (e.etat === 'nouveau') ligne('nouveau', e.sc.etiquette, `${titre(e)} : pas encore importé`);
      else if (e.etat === 'disparu') ligne('disparu', e.etiquette, `${e.fichier} : le scénario n'est plus ${dans}`);
      else ligne(e.etat, e.sc.etiquette, `${titre(e)} : ${e.etat === 'conflit' ? `${e.fichier} existe et ne vient pas d'un import de ${lecture.nomLot}` : e.motif}`);
      if (e.etat in n) n[e.etat]++; else n.autre++;
    }
    for (const i of introuvables) ligne('introuvable', i.cle, i.motif);
    n.autre += introuvables.length;
    console.log(`Bilan : ${compte(n.identique, 'identique', 'identiques')}, ${compte(n.modifie, 'modifié', 'modifiés')}, ${compte(n.nouveau, 'nouveau', 'nouveaux')}, ${compte(n.disparu, 'disparu', 'disparus')}, ${compte(n.autre, 'non importable', 'non importables')}`);
    return n.modifie + n.nouveau + n.disparu + n.autre === 0 ? 0 : 1;
  }

  const contexte = { ...lecture.contexte, date: `${new Date().toISOString().slice(0, 19)}Z`, adresse: o.adresse, origines: o.origines.map((x) => x.replace(/\/$/, '')), profil: o.profil, origine: lecture.origine };
  const n = { ecrit: 0, remplace: 0, inchange: 0, nonEcrit: 0, disparu: 0 };
  const quand = horodatage();
  for (const e of etats) {
    if (e.etat === 'identique') {
      ligne('inchange', e.sc.etiquette, `${titre(e)} (${e.fichier})`);
      n.inchange++;
    } else if (e.etat === 'disparu') {
      ligne('disparu', e.etiquette, `${e.fichier} : le scénario n'est plus ${dans} ; le texte reste, à supprimer par vous s'il le faut`);
      n.disparu++;
    } else if (e.etat === 'refuse' || e.etat === 'doublon') {
      ligne(e.etat, e.sc.etiquette, `${titre(e)} : ${e.motif}`);
      n.nonEcrit++;
    } else if (e.etat === 'conflit') {
      ligne('conflit', e.sc.etiquette, `${titre(e)} : ${e.fichier} existe et ne vient pas d'un import de ${lecture.nomLot} ; jamais remplacé`);
      n.nonEcrit++;
    } else if (e.etat === 'modifie' && !o.remplacer) {
      ligne('modifie', e.sc.etiquette, `${titre(e)} (${e.fichier}) : changé ${dans} depuis l'import ; --remplacer pour remplacer le texte${e.retouche ? ', retouché depuis l\'import' : ''}`);
      n.nonEcrit++;
    } else {
      const { texte, erreurs } = texteImporte(e.sc, { ...contexte, lot: e.sc.lot ?? contexte.lot ?? null, source: e.sc.source ?? contexte.source, notes: e.sc.notes ?? [] });
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
  for (const i of introuvables) ligne('introuvable', i.cle, i.motif);
  n.nonEcrit += introuvables.length;
  console.log(`Bilan : ${compte(n.ecrit, 'écrit', 'écrits')}, ${compte(n.remplace, 'remplacé', 'remplacés')}, ${compte(n.inchange, 'inchangé', 'inchangés')}, ${compte(n.nonEcrit, 'non écrit', 'non écrits')}, ${compte(n.disparu, 'disparu', 'disparus')}`);
  if (n.ecrit + n.remplace > 0) console.log(`Dossier : ${dossier} ; ensuite, pour chaque texte écrit : verifier.mjs, puis la traduction et sa ratification.`);
  return n.nonEcrit === 0 ? 0 : 1;
}

export async function main(args, env = process.env) {
  const lu = lireArguments(args);
  if (lu.erreur) return refus([lu.erreur, USAGE]);
  const o = lu.options;
  const source = lireSource(o.source);
  if (source.erreur) return refus([source.erreur, USAGE]);
  if (source.genre !== 'jira' && o.optionsJira.length) return refus(`${[...new Set(o.optionsJira)].join(', ')} : pour une demande Jira seulement`);
  if (source.genre !== 'api' && o.api !== null) return refus('--api : pour xray:, xray-dc:, zephyr: et zephyr-dc: seulement');
  if (!o.comparer) {
    const erreurs = verifierReglages(o);
    if (erreurs.length) return refus(erreurs);
  }
  const { reglages, erreurs: erreursEnv } = lireReglages(env);
  if (erreursEnv.length) return refus(erreursEnv);
  const dossier = resolve(o.dossier);
  let lecture;
  if (source.genre === 'jira') lecture = await lireJira(o, source, { reglages, dossier });
  else if (source.genre === 'api') lecture = await lireApi(o, source, env);
  else lecture = lireFichier(o, source, dossier);
  if (lecture.code !== undefined) return lecture.code;
  return ecrireTextes(o, lecture, dossier);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (e) => { console.error(`ERREUR interne : ${e.stack ?? e}`); process.exitCode = 2; });
}
```
<<<FIN modules/jira/SKILL.md>>>

<<<FICHIER modules/cas-de-test/SKILL.md>>>
---
name: cas-de-test
description: Cas de test de Xray et de Zephyr Scale, et fichiers .feature, importés en textes de départ sans IA (fichier .feature exporté de Xray ou de Zephyr Scale, ou pris dans le dépôt ; archive .zip d'un export, lue en mémoire, CRC-32 contrôlé, tailles bornées ; API REST de Xray Cloud et Data Center et de Zephyr Scale Cloud et Data Center, en lecture seule, jeton pris dans une variable d'environnement seulement, https, aucune redirection suivie ; clé du test pour identité, d'un chemin d'import à l'autre ; test Cucumber ou BDD recopié, test manuel converti pas à pas en « Quand » puis « Alors », test générique ou en texte libre refusé ; préconditions signalées ; provenance par lot), source de scripts/cas.mjs. À lire pour importer des tests de Xray, de Zephyr Scale ou d'un fichier .feature.
dimensions: [D17]
status: active
---

# Module `cas-de-test` (D17)

Phases 7E couvertes : Environnement et Éléments.

## 1. Principe

Un testeur part du cas de test. Dans Xray et dans Zephyr Scale, un test a une clé, un résumé, des étiquettes et des étapes : écrites en Gherkin pour un test Cucumber (Xray) ou BDD (Zephyr Scale), en pas « action, données, résultat attendu » pour un test manuel. `importer.mjs` en fait des textes de départ, sans IA, comme d'une demande Jira (module `jira`) : le développeur les vérifie, les fait traduire, ratifie et joue. Le texte reste la référence de sa traduction (D3.INV-2) ; l'outil de test reste la référence du texte importé.

```mermaid
flowchart LR
  FEAT["fichier .feature<br/>export ou dépôt"] --> LEC
  ZIP["archive .zip<br/>d'un export"] -->|"lue en mémoire"| LEC
  API["Xray, Zephyr Scale<br/>API REST, en lecture"] -->|"jeton : variable<br/>d'environnement"| LEC["importer.mjs, sans IA"]
  LEC --> TXT["DEMO-12.scenario …<br/>provenance, lot"]
  TXT -->|"verifier, traduire,<br/>ratifier, jouer"| DEV["Développeur"]
```

Le skill n'écrit jamais dans Jira, Xray ni Zephyr Scale (D17.INV-2).

## 2. Sources (D17.INV-1)

| Source | Exemple | Ce qui est lu |
|---|---|---|
| fichier `.feature` | `importer.mjs features/clients.feature --adresse http://127.0.0.1:4200` | ses scénarios, par le lecteur de Gherkin du module `jira` (§ 4) |
| archive `.zip` | `importer.mjs FeatureBundle.zip --adresse …` | ses fichiers `.feature`, lus en mémoire, sans rien extraire sur le disque ; les autres fichiers sont signalés en limite |
| Xray Cloud | `importer.mjs xray:DEMO-12,DEMO-13 --adresse …` | chaque test, par l'API GraphQL de Xray Cloud |
| Xray Data Center | `importer.mjs xray-dc:DEMO-12 --api https://jira.exemple.fr --adresse …` | la demande par l'API de Jira (résumé, étiquettes), le test par l'API de Xray |
| Zephyr Scale Cloud | `importer.mjs zephyr:DEMO-T1 --adresse …` | le cas de test et son script, par l'API v2 |
| Zephyr Scale Data Center | `importer.mjs zephyr-dc:DEMO-T1 --api https://jira.exemple.fr --adresse …` | le cas de test et son script, par l'API de Zephyr Scale (`atm/1.0`) |

- **Fichier** : en UTF-8 ; BOM, fins de ligne CRLF et tabulations sont ramenés ; `# language:` et les autres commentaires sont ignorés.
- **Archive** : méthodes « stockée » et « deflate » ; chaque fichier contrôlé par son CRC-32, une archive abîmée est refusée ; 5 000 fichiers, 5 Mo par fichier `.feature` et 50 Mo de fichiers `.feature` en tout au plus ; un fichier chiffré ou trop gros est signalé et non lu ; une archive ZIP64 est refusée ; les fichiers `__MACOSX/` sont ignorés.
- **Clés** : forme `ABC-123` pour Xray, `ABC-T123` pour Zephyr Scale, séparées par des virgules, sans doublon, 200 au plus par import.

## 3. API, en lecture seule (D17.INV-2)

| Outil | Adresse de l'API | Requêtes |
|---|---|---|
| Xray Cloud | `https://xray.cloud.getxray.app` ; `--api` pour une région, par exemple `https://eu.xray.cloud.getxray.app` | `POST /api/v2/authenticate`, avec l'identifiant et le secret du client, qui rend un jeton de session ; puis, par test, `POST /api/v2/graphql` : `getTests(jql: "key = \"<CLÉ>\"", limit: 1)`, une lecture (`query`), jamais une mutation |
| Xray Data Center | aucune par défaut : `--api <adresse de Jira>` | `GET /rest/api/2/issue/<CLÉ>?fields=summary,labels`, puis `GET /rest/raven/1.0/api/test?keys=<CLÉ>` |
| Zephyr Scale Cloud | `https://api.zephyrscale.smartbear.com/v2` ; `--api` pour une région, par exemple `https://eu.api.zephyrscale.smartbear.com/v2` | `GET /testcases/<CLÉ>`, puis le script par le lien qu'il donne : `…/teststeps`, page après page, ou `…/testscript` |
| Zephyr Scale Data Center | aucune par défaut : `--api <adresse de Jira>` | `GET /rest/atm/1.0/testcase/<CLÉ>` |

Toutes les lectures précèdent toute écriture : une requête qui échoue arrête l'import, avec le code 2, sans rien écrire, même après des lectures réussies. Un test absent, ou que le jeton ne permet pas de lire, est `introuvable` : non écrit, code 1, avec la réponse de l'API quand elle en donne une. Chaque requête attend 30 s au plus.

## 4. Jetons (D17.INV-3)

| Outil | Variables d'environnement |
|---|---|
| Xray Cloud | `XRAY_CLIENT_ID` et `XRAY_CLIENT_SECRET`, d'une clé d'API de Xray |
| Zephyr Scale Cloud | `ZEPHYR_TOKEN`, jeton d'API de Zephyr Scale |
| Xray Data Center, Zephyr Scale Data Center | `JIRA_TOKEN`, jeton d'accès personnel de Jira |

- Le développeur définit la variable lui-même, dans son terminal, pour sa session : sous bash, `read -rs ZEPHYR_TOKEN && export ZEPHYR_TOKEN`, la saisie restant masquée ; sous PowerShell 7, `$env:ZEPHYR_TOKEN = Read-Host -MaskInput 'Jeton'` ; jamais dans la commande d'import, ni dans un fichier du dépôt. Une variable absente arrête l'import avant toute requête, en la nommant.
- Le jeton ne passe ni en argument, ni dans une adresse, ni dans un message, ni dans un fichier : il ne sort que dans l'en-tête `Authorization: Bearer` des requêtes vers l'origine de l'API ; l'identifiant et le secret de Xray Cloud, dans le corps de la seule requête d'authentification.
- `--api` est en https, sauf sur le poste même (127.0.0.1, `localhost`, `[::1]`) ; une adresse avec identifiant, paramètre ou fragment est refusée, sans que le message la reprenne.
- Aucune redirection n'est suivie : une réponse 3xx arrête l'import avant que le jeton ne parte ailleurs ; aucune requête ne va vers une autre origine que celle de l'API, même par un lien qu'elle rend.
- Une réponse 401 ou 403 dit « accès refusé : jeton absent, expiré ou sans droit de lecture ».

## 5. Identité : la clé du test (D17.INV-4)

| Source | Identité du scénario |
|---|---|
| API | la clé demandée |
| fichier, archive | l'étiquette `@TestCaseKey=<CLÉ>` de Zephyr Scale ; sinon la première étiquette propre au scénario qui est une clé de Jira, `@DEMO-12` ou `@TEST_DEMO-12`, celle du test dans un export de Xray, sauf si un scénario d'un autre titre la porte aussi : c'est alors la clé d'une demande ; sinon une étiquette `@<CLÉ>-Snn` d'un import de Jira ; à défaut, l'étiquette `<fichier>-Snn`, du nom du fichier ou de l'archive, reprise par le titre ou attribuée comme pour Jira (module `jira`, § 5) |

L'identité nomme le texte, `<CLÉ>.scenario`. Le même test, lu d'un autre chemin d'import — un export, puis l'API ; Xray Cloud, puis Data Center — retrouve son texte importé : `identique`, ou `modifié`, remplacé avec `--remplacer`, jamais en `conflit`. Un texte écrit à la main du même nom n'est jamais remplacé. Un test présent dans deux fichiers d'une archive (Xray exporte un test dans le fichier de chacune de ses exigences) est un `doublon` la seconde fois.

Chaque texte importé appartient à un lot : sa demande pour Jira ; ici le fichier (`fichier <chemin>`) ou l'archive (`archive <chemin>`), chemin relatif au dossier des textes, ou le test (`xray <CLÉ>`, `zephyr <CLÉ>`). Les textes d'un lot servent au réimport : numéros attribués, reprises par le titre, textes `disparu`.

## 6. Tests convertis (D17.INV-5)

| Test | Texte importé |
|---|---|
| Cucumber (Xray), BDD (Zephyr Scale) | ses étapes, recopiées par le lecteur de Gherkin (module `jira`, § 4), sous un titre formé de son résumé quand elles n'en ont pas : `Scénario:`, ou `Plan du scénario:` avec un tableau d'exemples ; `Scenario:` et `Scenario Outline:` quand ses mots-clés sont anglais ; étiquettes : la clé, puis les étiquettes de Jira |
| manuel (Xray), pas à pas (Zephyr Scale) | chaque pas devient `Quand <action>`, avec ses données, `, avec « <données> »`, puis `Alors <résultat attendu>` ; une partie de plusieurs lignes tient sur une, ses lignes séparées par « ; » ; le HTML de Zephyr Scale est ramené au texte ; une partie vide est omise ; l'en-tête le dit dès sa première ligne |
| Generic (Xray), texte libre (Zephyr Scale) | refusé : pas d'étapes à recopier ; le test s'écrit en Cucumber, BDD ou pas à pas dans l'outil |
| pas qui appelle un autre cas (Zephyr Scale) | refusé : l'import ne le déplie pas |
| pas vide, sans action, données ni résultat attendu (dans Xray, l'appel d'un autre test) | refusé : rien n'est deviné |
| sans résumé, manuel sans pas | refusé |

La phrase d'un pas reste telle qu'écrite : « Quand » et « Alors » ne disent pas la langue du test. Un test manuel converti se relit avec le développeur avant sa traduction (module `agent`). Les préconditions sont signalées en tête du texte, non reprises : celles de Xray par leurs clés, celle de Zephyr Scale par son texte ; elles se jouent avant le scénario, ou le développeur les reporte dans le texte. Un export `.feature` de Xray, lui, reprend les préconditions Cucumber en `Background`, reporté en tête des étapes (module `jira`, § 4).

## 7. Le texte importé (D17.INV-6)

```text
# Importé de Xray par importer.mjs (scenario-playwright 1.2.0), sans IA : chaque pas du test manuel devient « Quand <action> », avec ses données, puis « Alors <résultat attendu> ».
# Lot : xray DEMO-13
# Scénario : @DEMO-13, test manuel DEMO-13
# Source : https://xray.cloud.getxray.app/api/v2/graphql, test DEMO-13
# Importé le : 2026-11-21T09:30:00Z
# Empreinte de la source : 5d2502…
# Empreinte du texte importé : 2ec024…
# Préconditions dans Xray, non reprises : DEMO-11 ; à jouer avant le scénario, ou à reporter dans le texte.

@DEMO-13
Scénario: Exporter les clients
  Adresse : http://127.0.0.1:4200

  Quand Ouvrir la page « Export »
  Alors La page « Export » s'affiche
  Quand Cliquer sur le lien « Exporter en CSV », avec « format CSV ; séparateur ; »
  Alors Le fichier « clients.csv » est téléchargé
```

- **Première ligne** : la source (`de Xray`, `de Zephyr Scale`, `d'un fichier .feature`, `d'une archive .zip`) et ce que l'import en fait : recopie telle qu'écrite, ou conversion d'un test manuel.
- **Lot**, puis **Scénario** : l'étiquette, et la provenance : le test et sa sorte (`test Cucumber DEMO-12`, `cas de test pas à pas DEMO-T2`), ou le fichier `.feature`, dans l'archive s'il y a lieu.
- **Source** : l'adresse de l'API qui a rendu le test, ou le chemin du fichier ou de l'archive, relatif au dossier des textes, et son empreinte sha256.
- **Empreinte de la source** : comme l'empreinte Jira, le SHA-256 de ce que la source dit du scénario, fonctionnalité, étiquettes, titre, étapes, exemples ; un même test donne la même empreinte, et le même texte, par Xray Cloud ou Data Center, par Zephyr Scale Cloud ou Data Center.
- **Notes** : préconditions, étiquette attribuée, contexte reporté, colonnes d'exemples adaptées.

## 8. Sortie et codes

Sortie : `Fichier <nom> : n scénarios`, `Archive <nom> : n fichiers .feature, n scénarios (par fichier)`, ou `<Outil> <variante> (<adresse de l'API>) : n tests demandés, n lus (par sorte)` ; les `LIMITE …` ; une ligne par scénario ; une ligne `introuvable` par test absent ; `Bilan : …`. Les états, le réimport et les codes sont ceux du module `jira`, § 6 et § 7 : `introuvable` compte comme un scénario non écrit, code 1 ; une archive abîmée, une variable absente, une adresse d'API refusée, une redirection, un accès refusé ou une API injoignable arrêtent l'import avant toute écriture, code 2.

## 9. Contrôle de sortie

- Un fichier `.feature` et une archive d'export se lisent ; une archive abîmée est refusée (D17.INV-1).
- Seules des lectures partent vers les API ; aucune mutation ; rien n'est écrit dans Jira, Xray ni Zephyr Scale (D17.INV-2).
- Un jeton ne se lit que dans sa variable d'environnement ; il n'apparaît ni dans une adresse, ni dans une sortie, ni dans un texte ; aucune redirection n'est suivie ; une adresse en http hors du poste est refusée (D17.INV-3).
- Chaque texte se nomme par la clé de son test ; le même test, d'un autre chemin d'import, retrouve son texte (D17.INV-4).
- Un test manuel donne, pas à pas, « Quand » puis « Alors », et un texte que `verifier.mjs` accepte ; un test sans étapes est refusé avec son motif (D17.INV-5).
- Chaque texte porte sa provenance et son lot (D17.INV-6).

## 10. Source `scripts/cas.mjs`

Désignation de la source, lecteur d'archive, lignes d'un fichier, identité des scénarios, requêtes aux API en lecture seule, lecteurs de Xray et de Zephyr Scale, conversion des tests en scénarios.

<!-- fichier : scripts/cas.mjs -->
```javascript
// scenario-playwright 1.2.0 : cas de test de Xray et de Zephyr Scale, et fichiers .feature, lus sans IA.
//
// Sources (D17.INV-1) : fichier .feature, exporté de Xray ou de Zephyr Scale ou pris dans le dépôt ; archive
// .zip d'un export ; API REST de Xray (Cloud, Data Center) et de Zephyr Scale (Cloud, Data Center), en
// lecture seule : des GET, et pour Xray Cloud l'authentification et des requêtes GraphQL « query », jamais
// « mutation » (D17.INV-2). Un jeton ne vient que d'une variable d'environnement et ne sort que dans
// l'en-tête d'une requête vers l'API désignée, en https hors du poste, sans suivre de redirection
// (D17.INV-3). La clé d'un test est l'identité de son scénario (D17.INV-4). Un test Cucumber ou BDD est
// recopié tel qu'écrit ; un test manuel devient, pas à pas, « Quand <action> » puis « Alors <résultat
// attendu> » ; un test générique ou en texte libre est refusé avec son motif (D17.INV-5).
import { Buffer } from 'node:buffer';
import { URL } from 'node:url';
import { crc32, inflateRawSync } from 'node:zlib';
import { empreinteJira, extraireScenarios, htmlEnLignes } from './jira.mjs';
import { lireMotCle, lireTitre, normaliser, plat } from './texte.mjs';

const { fetch, AbortSignal } = globalThis;

export class ErreurCas extends Error {}

/** Texte sur une seule ligne, en NFC : caractères de contrôle et blancs regroupés en une espace. */
export const uneLigne = (s) => String(s ?? '').normalize('NFC').replace(/[\p{Cc}\s]+/gu, ' ').trim();
/** Texte de plusieurs lignes ramené à une seule : ses lignes non vides, séparées par « ; ». */
export const lignesJointes = (lignes) => lignes.map(uneLigne).filter(Boolean).join(' ; ');
const court = (s, n = 200) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

// --- Désignation de la source --------------------------------------------------------------------

const RE_CLE = /^[A-Z][A-Z0-9_]+-\d+$/;
const RE_CLE_ZEPHYR = /^[A-Z][A-Z0-9_]+-T\d+$/;
export const MAX_TESTS = 200;

/**
 * Outils lus par leur API : nom, variante, variables d'environnement des jetons, adresse par défaut de
 * l'API (Cloud), forme des clés, nom des lots de textes importés.
 */
export const OUTILS = {
  xray: { nom: 'Xray', variante: 'Cloud', variables: ['XRAY_CLIENT_ID', 'XRAY_CLIENT_SECRET'], base: 'https://xray.cloud.getxray.app', cle: RE_CLE, forme: 'ABC-123', lot: 'xray', test: 'test', tests: 'tests' },
  'xray-dc': { nom: 'Xray', variante: 'Data Center', variables: ['JIRA_TOKEN'], base: null, cle: RE_CLE, forme: 'ABC-123', lot: 'xray', test: 'test', tests: 'tests' },
  zephyr: { nom: 'Zephyr Scale', variante: 'Cloud', variables: ['ZEPHYR_TOKEN'], base: 'https://api.zephyrscale.smartbear.com/v2', cle: RE_CLE_ZEPHYR, forme: 'ABC-T123', lot: 'zephyr', test: 'cas de test', tests: 'cas de test' },
  'zephyr-dc': { nom: 'Zephyr Scale', variante: 'Data Center', variables: ['JIRA_TOKEN'], base: null, cle: RE_CLE_ZEPHYR, forme: 'ABC-T123', lot: 'zephyr', test: 'cas de test', tests: 'cas de test' },
};

/**
 * Genre de la source donnée à importer.mjs (D17.INV-1) : api (outil:CLÉ,CLÉ…), feature, zip, ou jira
 * (adresse d'une demande, ou page enregistrée en MHTML). Rend { genre, outil, cles, adresse } ou { erreur }.
 */
export function lireSource(source) {
  const m = /^(xray|xray-dc|zephyr|zephyr-dc):(.*)$/s.exec(source);
  if (m) {
    const outil = OUTILS[m[1]];
    const cles = [...new Set(m[2].split(',').map((x) => x.trim()).filter(Boolean))];
    if (cles.length === 0) return { erreur: `${m[1]}: attend les clés des tests, séparées par des virgules (forme ${outil.forme})` };
    const invalides = cles.filter((c) => !outil.cle.test(c));
    if (invalides.length) return { erreur: `clé de test invalide pour ${m[1]}: ${invalides.map((c) => `« ${court(c, 24)} »`).join(', ')} (forme ${outil.forme})` };
    if (cles.length > MAX_TESTS) return { erreur: `${cles.length} tests demandés : ${MAX_TESTS} au plus par import` };
    return { genre: 'api', outil: m[1], cles };
  }
  if (/^https?:\/\//i.test(source)) return { genre: 'jira', adresse: true };
  if (/\.feature$/i.test(source)) return { genre: 'feature' };
  if (/\.zip$/i.test(source)) return { genre: 'zip' };
  return { genre: 'jira', adresse: false };
}

// --- Fichiers .feature et archives .zip ----------------------------------------------------------

/** Lignes d'un texte Gherkin : sans BOM, en NFC, tabulations en espaces, blancs de bord retirés. */
export function lignesDe(texte) {
  return normaliser(String(texte ?? '')).split('\n').map((l) => l.replace(/\t/g, ' ').trim());
}

/** Préfixe des étiquettes attribuées aux scénarios d'un fichier : son nom sans extension, en lettres, chiffres, - et _. */
export function prefixeDe(chemin) {
  const nom = String(chemin).split(/[\\/]/).pop().replace(/\.[^.]*$/, '');
  return nom.normalize('NFD').replace(/\p{M}/gu, '').replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'scenarios';
}

export const LIMITES_ZIP = { entrees: 5000, fichier: 5 * 1024 * 1024, total: 50 * 1024 * 1024 };

/**
 * Fichiers .feature d'une archive .zip, lus en mémoire, sans rien écrire sur le disque :
 * { entrees: [{ nom, octets }], ignorees: [noms], refusees: [{ nom, motif }] }. Méthodes « stockée » et
 * « deflate » ; contenu contrôlé par son CRC-32 ; tailles bornées. Lève ErreurCas pour une archive illisible.
 */
export function lireZip(octets, limites = LIMITES_ZIP) {
  const b = Buffer.from(octets);
  let fin = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 22 - 0xffff); i--) {
    if (b.readUInt32LE(i) === 0x06054b50) { fin = i; break; }
  }
  if (fin < 0) throw new ErreurCas('fin du répertoire ZIP introuvable : le fichier n\'est pas une archive .zip');
  const nombre = b.readUInt16LE(fin + 10);
  const taille = b.readUInt32LE(fin + 12);
  const debut = b.readUInt32LE(fin + 16);
  if (nombre === 0xffff || taille === 0xffffffff || debut === 0xffffffff) throw new ErreurCas('archive ZIP64, non prise en charge : exporter moins de tests à la fois');
  if (debut + taille > fin) throw new ErreurCas('répertoire ZIP hors du fichier : archive abîmée');
  if (nombre > limites.entrees) throw new ErreurCas(`${nombre} fichiers dans l'archive : ${limites.entrees} au plus`);
  const abimee = (detail) => new ErreurCas(`${detail} : archive abîmée`);
  const entrees = [];
  const ignorees = [];
  const refusees = [];
  let total = 0;
  let p = debut;
  for (let n = 0; n < nombre; n++) {
    if (p + 46 > fin || b.readUInt32LE(p) !== 0x02014b50) throw abimee('répertoire ZIP illisible');
    const drapeaux = b.readUInt16LE(p + 8);
    const methode = b.readUInt16LE(p + 10);
    const crc = b.readUInt32LE(p + 16);
    const comprime = b.readUInt32LE(p + 20);
    const longueur = b.readUInt32LE(p + 24);
    const lNom = b.readUInt16LE(p + 28);
    const lExtra = b.readUInt16LE(p + 30);
    const lCommentaire = b.readUInt16LE(p + 32);
    const local = b.readUInt32LE(p + 42);
    const nom = uneLigne(b.subarray(p + 46, p + 46 + lNom).toString(drapeaux & 0x800 ? 'utf8' : 'latin1'));
    p += 46 + lNom + lExtra + lCommentaire;
    if (nom.endsWith('/')) continue;
    const dernier = nom.split('/').pop();
    if (!/\.feature$/i.test(nom) || nom.startsWith('__MACOSX/') || dernier.startsWith('._')) { ignorees.push(nom); continue; }
    if (drapeaux & 0x1) { refusees.push({ nom, motif: 'chiffré, non lu' }); continue; }
    if (methode !== 0 && methode !== 8) { refusees.push({ nom, motif: `méthode de compression ${methode} non prise en charge (stockée ou deflate)` }); continue; }
    if (longueur > limites.fichier) { refusees.push({ nom, motif: `${longueur} octets : ${limites.fichier} au plus par fichier` }); continue; }
    total += longueur;
    if (total > limites.total) throw new ErreurCas(`plus de ${limites.total} octets de fichiers .feature dans l'archive`);
    if (local + 30 > b.length || b.readUInt32LE(local) !== 0x04034b50) throw abimee(`${nom} : en-tête local introuvable`);
    const donnees = local + 30 + b.readUInt16LE(local + 26) + b.readUInt16LE(local + 28);
    if (donnees + comprime > b.length) throw abimee(`${nom} : données hors du fichier`);
    const brut = b.subarray(donnees, donnees + comprime);
    let contenu;
    try {
      contenu = methode === 0 ? brut : inflateRawSync(brut, { maxOutputLength: Math.max(1, limites.fichier) });
    } catch {
      throw abimee(`${nom} : données compressées illisibles`);
    }
    if (contenu.length !== longueur || (crc32(contenu) >>> 0) !== crc) throw abimee(`${nom} : contenu altéré (CRC-32)`);
    entrees.push({ nom, octets: Buffer.from(contenu) });
  }
  return { entrees, ignorees, refusees };
}

// Étiquettes d'identité d'un scénario de fichier .feature (D17.INV-4).
const RE_TEST_ZEPHYR = /^TestCaseKey=([A-Z][A-Z0-9_]+-T\d+)$/;
const RE_TEST_XRAY = /^(?:TEST_)?([A-Z][A-Z0-9_]+-\d+)$/;
const RE_ETIQUETTE_JIRA = /^[A-Z][A-Z0-9_]+-\d+-S\d+$/;

/**
 * Identité des scénarios d'un fichier .feature (D17.INV-4) : la clé de l'étiquette @TestCaseKey=… de
 * Zephyr Scale ; sinon la première étiquette propre au scénario qui est une clé de Jira, préfixe TEST_
 * retiré, celle d'un test de Xray, sauf si un scénario d'un autre titre la porte aussi (c'est alors la
 * clé d'une demande) ; sinon une étiquette <CLÉ>-Snn d'un import de Jira. Rend la fonction sc → clé ou null.
 */
export function identitesGherkin(scenarios) {
  const candidats = (sc) => {
    const propres = sc.etiquettesPropres ?? [];
    return {
      zephyr: propres.map((e) => RE_TEST_ZEPHYR.exec(e)?.[1]).find(Boolean) ?? null,
      xray: propres.map((e) => RE_TEST_XRAY.exec(e)?.[1]).find(Boolean) ?? null,
      jira: propres.find((e) => RE_ETIQUETTE_JIRA.test(e)) ?? null,
    };
  };
  const titres = new Map();
  for (const sc of scenarios) {
    const { xray } = candidats(sc);
    if (xray) titres.set(xray, (titres.get(xray) ?? new Set()).add(sc.titre));
  }
  return (sc) => {
    const c = candidats(sc);
    return c.zephyr ?? (c.xray && titres.get(c.xray).size === 1 ? c.xray : null) ?? c.jira;
  };
}

// --- Requêtes aux API, en lecture seule ----------------------------------------------------------

/**
 * Adresse de l'API d'un outil : --api, sinon celle de l'outil en Cloud. En https, sauf sur le poste même,
 * sans identifiant, paramètre ni fragment (D17.INV-3). Lève ErreurCas ; le message ne reprend pas la valeur.
 */
export function adresseApi(cleOutil, api = null) {
  const outil = OUTILS[cleOutil];
  const brute = api ?? outil.base;
  if (!brute) throw new ErreurCas(`${cleOutil}: attend --api <adresse de votre Jira ${outil.variante}>, en https`);
  let u;
  try {
    u = new URL(brute);
  } catch {
    throw new ErreurCas('--api invalide : adresse http ou https attendue');
  }
  if (u.username || u.password || u.search || u.hash) throw new ErreurCas('--api : l\'adresse seule, sans identifiant, paramètre ni fragment ; le jeton passe par une variable d\'environnement');
  const poste = ['127.0.0.1', 'localhost', '[::1]'].includes(u.hostname);
  if (u.protocol !== 'https:' && !(u.protocol === 'http:' && poste)) throw new ErreurCas(`--api ${u.origin} : https attendu, un jeton ne passe jamais en clair hors du poste (D17.INV-3)`);
  return `${u.origin}${u.pathname.replace(/\/+$/, '')}`;
}

/**
 * Jetons d'un outil, lus dans les variables d'environnement seulement (D17.INV-3) : { valeurs } ou { erreur }.
 * Une valeur qui n'est pas faite de caractères ASCII visibles est refusée, sans que le message la reprenne.
 */
export function lireJetons(cleOutil, env) {
  const { variables } = OUTILS[cleOutil];
  const manquantes = variables.filter((v) => typeof env[v] !== 'string' || env[v].trim() === '');
  if (manquantes.length) {
    const s = manquantes.length > 1 ? 's' : '';
    return { erreur: `variable${s} d'environnement ${manquantes.join(' et ')} absente${s} : ${s ? 'les' : 'la'} définir vous-même dans votre terminal, pour cette session, jamais dans la commande ni dans un fichier du dépôt, puis relancer` };
  }
  const invalides = variables.filter((v) => !/^[\x21-\x7e]+$/.test(env[v].trim()));
  if (invalides.length) return { erreur: `variable d'environnement ${invalides.join(' et ')} : valeur invalide, espace ou caractère non imprimable ; la redéfinir vous-même, puis relancer` };
  return { valeurs: variables.map((v) => env[v].trim()) };
}

const DELAI_REQUETE = 30_000;
const TAILLE_REPONSE = 20 * 1024 * 1024;

/**
 * Requête à l'API désignée (D17.INV-2, D17.INV-3) : GET, ou POST pour l'authentification et les requêtes
 * GraphQL de Xray Cloud ; même origine que l'API ; aucune redirection suivie ; 30 s au plus. Le jeton ne va
 * que dans l'en-tête Authorization, et aucun message ne le reprend. Rend { statut, json } ; un statut 404
 * est rendu tel quel, les autres erreurs lèvent ErreurCas.
 */
export async function demander(base, adresse, { methode = 'GET', jeton = null, corps } = {}) {
  const secrets = [jeton, corps?.client_id, corps?.client_secret].filter((x) => typeof x === 'string' && x !== '');
  const sansSecret = (texte) => secrets.reduce((t, x) => t.split(x).join('***'), String(texte));
  const cible = new URL(adresse, `${base}/`);
  if (cible.origin !== new URL(base).origin) throw new ErreurCas(`adresse hors de l'API désignée, non demandée : ${cible.origin}`);
  if (methode !== 'GET' && methode !== 'POST') throw new ErreurCas(`méthode ${methode} refusée : lecture seule (D17.INV-2)`);
  const lieu = `${methode} ${cible.origin}${cible.pathname}`;
  const entetes = { accept: 'application/json' };
  if (jeton) entetes.authorization = `Bearer ${jeton}`;
  if (corps !== undefined) entetes['content-type'] = 'application/json';
  let r;
  try {
    r = await fetch(cible, { method: methode, headers: entetes, body: corps === undefined ? undefined : JSON.stringify(corps), redirect: 'manual', signal: AbortSignal.timeout(DELAI_REQUETE) });
  } catch (e) {
    if (e?.name === 'TimeoutError' || e?.name === 'AbortError') throw new ErreurCas(`${lieu} : pas de réponse en ${DELAI_REQUETE / 1000} s`);
    throw new ErreurCas(`${lieu} : injoignable (${court(sansSecret(uneLigne(e?.cause?.code ?? e?.cause?.message ?? e?.message)), 120)})`);
  }
  if ((r.status >= 300 && r.status < 400) || r.type === 'opaqueredirect') {
    let vers = '';
    try {
      vers = r.headers.get('location') ? ` vers ${new URL(r.headers.get('location'), cible).origin}` : '';
    } catch {
      vers = '';
    }
    throw new ErreurCas(`${lieu} : redirection${vers} refusée, le jeton ne suit pas une redirection (D17.INV-3)`);
  }
  if (r.status === 401 || r.status === 403) throw new ErreurCas(`${lieu} : accès refusé (${r.status}) : jeton absent, expiré ou sans droit de lecture`);
  if (r.status === 404) return { statut: 404, json: null };
  const texte = await r.text();
  if (texte.length > TAILLE_REPONSE) throw new ErreurCas(`${lieu} : réponse de plus de ${TAILLE_REPONSE} octets`);
  let json = null;
  try {
    json = texte === '' ? null : JSON.parse(texte);
  } catch {
    if (r.ok) throw new ErreurCas(`${lieu} : réponse qui n'est pas du JSON`);
  }
  if (!r.ok) {
    const detail = [json?.errorMessages?.[0], json?.message, json?.errors?.[0]?.message, json?.error].find((x) => typeof x === 'string');
    throw new ErreurCas(`${lieu} : réponse ${r.status}${r.status === 429 ? ', trop de requêtes : attendre, puis relancer' : ''}${detail ? ` (${court(sansSecret(uneLigne(detail)))})` : ''}`);
  }
  return { statut: r.status, json };
}

// Requête GraphQL de Xray Cloud : une lecture, jamais une mutation (D17.INV-2).
export const REQUETE_XRAY = `query Tests($jql: String!, $limit: Int!) {
  getTests(jql: $jql, limit: $limit) {
    total
    results {
      issueId
      testType { name kind }
      steps { action data result }
      gherkin
      preconditions(limit: 20) { total results { jira(fields: ["key"]) } }
      jira(fields: ["key", "summary", "labels"])
    }
  }
}`;

const texteHtml = (h) => lignesJointes(htmlEnLignes(String(h ?? '')));
const brutDe = (v) => (typeof v === 'string' ? v : typeof v?.raw === 'string' ? v.raw : '');
const etiquettesDe = (liste) => (Array.isArray(liste) ? liste.map(uneLigne).filter((e) => e && !/\s/.test(e)) : []);
const refusDe = (motif) => ({ genre: 'refus', motif });

/** Test de Xray Cloud lu par GraphQL, vers le modèle commun des cas de test. */
function testXrayCloud(t, cle, source) {
  const commun = { cle, titre: uneLigne(t.jira?.summary), etiquettes: etiquettesDe(t.jira?.labels), source, notes: [] };
  const preconditions = (t.preconditions?.results ?? []).map((p) => p?.jira?.key).filter((k) => RE_CLE.test(k ?? ''));
  if (preconditions.length) commun.notes.push(`Préconditions dans Xray, non reprises : ${preconditions.join(', ')} ; à jouer avant le scénario, ou à reporter dans le texte.`);
  const genre = t.testType?.kind;
  const nom = uneLigne(t.testType?.name) || genre || 'inconnu';
  if (genre === 'Gherkin') return { ...commun, genre: 'gherkin', sorte: nom, gherkin: String(t.gherkin ?? '') };
  if (genre === 'Steps') return { ...commun, genre: 'pas', sorte: 'manuel', pas: (t.steps ?? []).map((s) => ({ action: s?.action, donnees: s?.data, attendu: s?.result })) };
  if (genre === 'Unstructured') return { ...commun, sorte: nom, ...refusDe(`test ${nom} : définition en texte libre, sans étapes ; à écrire en Cucumber ou en pas à pas dans Xray`) };
  return { ...commun, sorte: nom, ...refusDe(`type de test « ${nom} » non pris en charge (Cucumber ou manuel)`) };
}

/** Xray Cloud : authentification par XRAY_CLIENT_ID et XRAY_CLIENT_SECRET, puis une requête GraphQL par test. */
async function lireXrayCloud(cles, { base, jetons: [identifiant, secret] }) {
  if (!/^query\b/.test(REQUETE_XRAY) || /\bmutation\b/i.test(REQUETE_XRAY)) throw new ErreurCas('requête GraphQL refusée : lecture seule (D17.INV-2)');
  const auth = await demander(base, `${base}/api/v2/authenticate`, { methode: 'POST', corps: { client_id: identifiant, client_secret: secret } });
  if (auth.statut === 404 || typeof auth.json !== 'string' || auth.json === '') throw new ErreurCas(`POST ${base}/api/v2/authenticate : aucun jeton rendu ; adresse de Xray Cloud à vérifier (--api)`);
  const jeton = auth.json;
  const tests = [];
  const introuvables = [];
  for (const cle of cles) {
    const r = await demander(base, `${base}/api/v2/graphql`, { methode: 'POST', jeton, corps: { query: REQUETE_XRAY, variables: { jql: `key = "${cle}"`, limit: 1 } } });
    if (r.statut === 404) throw new ErreurCas(`POST ${base}/api/v2/graphql : introuvable ; adresse de Xray Cloud à vérifier (--api)`);
    const t = (r.json?.data?.getTests?.results ?? []).find((x) => x?.jira?.key === cle);
    if (!t) {
      const erreur = r.json?.errors?.[0]?.message;
      introuvables.push({ cle, motif: typeof erreur === 'string' ? court(uneLigne(erreur)) : 'aucun test de cette clé dans Xray, ou pas de droit de lecture' });
      continue;
    }
    tests.push(testXrayCloud(t, cle, `${base}/api/v2/graphql, test ${cle}`));
  }
  return { tests, introuvables };
}

/** Xray Data Center : la demande par l'API de Jira (résumé, étiquettes), puis le test par l'API de Xray, avec JIRA_TOKEN. */
async function lireXrayDc(cles, { base, jetons: [jeton] }) {
  const tests = [];
  const introuvables = [];
  for (const cle of cles) {
    const demande = await demander(base, `${base}/rest/api/2/issue/${cle}?fields=summary,labels`, { jeton });
    if (demande.statut === 404) { introuvables.push({ cle, motif: 'demande absente de Jira, ou pas de droit de lecture' }); continue; }
    const source = `${base}/rest/raven/1.0/api/test?keys=${cle}`;
    const r = await demander(base, source, { jeton });
    const t = Array.isArray(r.json) ? r.json.find((x) => x?.key === cle) : null;
    if (!t) { introuvables.push({ cle, motif: 'la demande n\'est pas un test de Xray' }); continue; }
    const commun = { cle, titre: uneLigne(demande.json?.fields?.summary), etiquettes: etiquettesDe(demande.json?.fields?.labels), source, notes: [] };
    const preconditions = (Array.isArray(t.precondition) ? t.precondition : []).map((p) => (typeof p === 'string' ? p : p?.key)).filter((k) => RE_CLE.test(k ?? ''));
    if (preconditions.length) commun.notes.push(`Préconditions dans Xray, non reprises : ${preconditions.join(', ')} ; à jouer avant le scénario, ou à reporter dans le texte.`);
    const type = uneLigne(t.type);
    if (/cucumber/i.test(type)) tests.push({ ...commun, genre: 'gherkin', sorte: 'Cucumber', gherkin: typeof t.definition === 'string' ? t.definition : '' });
    else if (/manual/i.test(type)) {
      const pas = (Array.isArray(t.definition?.steps) ? t.definition.steps : []).slice().sort((a, b) => (a?.index ?? 0) - (b?.index ?? 0));
      tests.push({ ...commun, genre: 'pas', sorte: 'manuel', pas: pas.map((s) => ({ action: brutDe(s?.step), donnees: brutDe(s?.data), attendu: brutDe(s?.result) })) });
    } else if (/generic/i.test(type)) tests.push({ ...commun, sorte: 'Generic', ...refusDe('test Generic : définition en texte libre, sans étapes ; à écrire en Cucumber ou en pas à pas dans Xray') });
    else tests.push({ ...commun, sorte: type || 'inconnu', ...refusDe(`type de test « ${type || 'inconnu'} » non pris en charge (Cucumber ou manuel)`) });
  }
  return { tests, introuvables };
}

/** Précondition d'un cas de test de Zephyr Scale, signalée dans l'en-tête, non reprise. */
const noteZephyr = (precondition) => {
  const t = texteHtml(precondition);
  return t ? [`Précondition dans Zephyr Scale, non reprise : « ${court(t)} » ; à jouer avant le scénario, ou à reporter dans le texte.`] : [];
};

/** Script BDD de Zephyr Scale : texte Gherkin, ou HTML ramené à ses lignes. */
const lignesBdd = (texte) => (/<(p|br|div|pre)\b/i.test(String(texte ?? '')) ? htmlEnLignes(String(texte)) : String(texte ?? '').split(/\r?\n/)).join('\n');

/** Zephyr Scale Cloud : le cas de test, puis son script, par le lien qu'il donne, avec ZEPHYR_TOKEN. */
async function lireZephyrCloud(cles, { base, jetons: [jeton] }) {
  const tests = [];
  const introuvables = [];
  for (const cle of cles) {
    const source = `${base}/testcases/${cle}`;
    const r = await demander(base, source, { jeton });
    if (r.statut === 404) { introuvables.push({ cle, motif: 'aucun cas de test de cette clé dans Zephyr Scale, ou pas de droit de lecture' }); continue; }
    const tc = r.json ?? {};
    const commun = { cle, titre: uneLigne(tc.name), etiquettes: etiquettesDe(tc.labels), source, notes: noteZephyr(tc.precondition) };
    const lien = typeof tc.testScript?.self === 'string' ? new URL(tc.testScript.self, `${base}/`) : null;
    if (!lien) { tests.push({ ...commun, sorte: 'sans script', ...refusDe('cas de test sans script') }); continue; }
    if (/\/teststeps\/?$/.test(lien.pathname)) {
      const valeurs = [];
      for (let debut = 0, page = 0; page < 50; page++) {
        const u = new URL(lien);
        u.searchParams.set('maxResults', '100');
        u.searchParams.set('startAt', String(debut));
        const p = await demander(base, u.href, { jeton });
        const vals = Array.isArray(p.json?.values) ? p.json.values : [];
        valeurs.push(...vals);
        if (p.json?.isLast !== false || vals.length === 0) break;
        debut += vals.length;
      }
      const appel = valeurs.find((v) => v?.testCase);
      if (appel) { tests.push({ ...commun, sorte: 'pas à pas', ...refusDe(`pas qui appelle le cas de test ${uneLigne(appel.testCase.testCaseKey) || 'inconnu'}, que l'import ne déplie pas`) }); continue; }
      tests.push({ ...commun, genre: 'pas', sorte: 'pas à pas', pas: valeurs.map((v) => ({ action: texteHtml(v?.inline?.description), donnees: texteHtml(v?.inline?.testData), attendu: texteHtml(v?.inline?.expectedResult) })) });
      continue;
    }
    const s = await demander(base, lien.href, { jeton });
    const type = uneLigne(s.json?.type).toLowerCase();
    if (type === 'bdd') tests.push({ ...commun, genre: 'gherkin', sorte: 'BDD', gherkin: lignesBdd(s.json?.text) });
    else tests.push({ ...commun, sorte: 'texte libre', ...refusDe('script en texte libre, sans étapes ; à écrire en pas à pas ou en BDD dans Zephyr Scale') });
  }
  return { tests, introuvables };
}

/** Zephyr Scale Data Center : le cas de test et son script par l'API de Zephyr Scale, avec JIRA_TOKEN. */
async function lireZephyrDc(cles, { base, jetons: [jeton] }) {
  const tests = [];
  const introuvables = [];
  for (const cle of cles) {
    const source = `${base}/rest/atm/1.0/testcase/${cle}`;
    const r = await demander(base, source, { jeton });
    if (r.statut === 404) { introuvables.push({ cle, motif: 'aucun cas de test de cette clé dans Zephyr Scale, ou pas de droit de lecture' }); continue; }
    const tc = r.json ?? {};
    const commun = { cle, titre: uneLigne(tc.name), etiquettes: etiquettesDe(tc.labels), source, notes: noteZephyr(tc.precondition) };
    const script = tc.testScript ?? {};
    const type = uneLigne(script.type).toUpperCase();
    if (type === 'STEP_BY_STEP') {
      const pas = (Array.isArray(script.steps) ? script.steps : []).slice().sort((a, b) => (a?.index ?? 0) - (b?.index ?? 0));
      const appel = pas.find((s) => s?.testCaseKey);
      if (appel) tests.push({ ...commun, sorte: 'pas à pas', ...refusDe(`pas qui appelle le cas de test ${uneLigne(appel.testCaseKey)}, que l'import ne déplie pas`) });
      else tests.push({ ...commun, genre: 'pas', sorte: 'pas à pas', pas: pas.map((s) => ({ action: texteHtml(s?.description), donnees: texteHtml(s?.testData), attendu: texteHtml(s?.expectedResult) })) });
    } else if (type === 'BDD') tests.push({ ...commun, genre: 'gherkin', sorte: 'BDD', gherkin: lignesBdd(script.text) });
    else if (type === 'PLAIN_TEXT') tests.push({ ...commun, sorte: 'texte libre', ...refusDe('script en texte libre, sans étapes ; à écrire en pas à pas ou en BDD dans Zephyr Scale') });
    else tests.push({ ...commun, sorte: 'sans script', ...refusDe('cas de test sans script') });
  }
  return { tests, introuvables };
}

const LECTEURS = { xray: lireXrayCloud, 'xray-dc': lireXrayDc, zephyr: lireZephyrCloud, 'zephyr-dc': lireZephyrDc };

/**
 * Tests d'un outil lus par son API, en lecture seule : { tests, introuvables }. Chaque test suit le modèle
 * commun : { cle, titre, etiquettes, genre (gherkin, pas, refus), sorte, gherkin, pas, motif, source, notes }.
 * Lève ErreurCas avant tout résultat si une requête échoue.
 */
export function lireTests(cleOutil, cles, { base, jetons }) {
  return LECTEURS[cleOutil](cles, { base, jetons });
}

// --- Tests en scénarios --------------------------------------------------------------------------

/**
 * Étapes d'un test manuel (D17.INV-5) : chaque pas devient « Quand <action> », avec ses données, puis
 * « Alors <résultat attendu> » ; une partie de plusieurs lignes tient sur une, ses lignes séparées par « ; » ;
 * une partie vide est omise.
 */
export function pasEnEtapes(pas) {
  const etapes = [];
  for (const p of pas) {
    const action = lignesJointes(String(p.action ?? '').split(/\r?\n/));
    const donnees = lignesJointes(String(p.donnees ?? '').split(/\r?\n/));
    const attendu = lignesJointes(String(p.attendu ?? '').split(/\r?\n/));
    const quand = [action, donnees ? `avec « ${donnees} »` : ''].filter(Boolean).join(', ');
    if (quand) etapes.push({ motCle: 'Quand', phrase: quand });
    if (attendu) etapes.push({ motCle: 'Alors', phrase: attendu });
  }
  return etapes;
}

const MOTS_ANGLAIS = /^(given|when|then|and|but)$/;

/** Scénario d'un test Cucumber ou BDD : ses étapes, sous un titre formé de son résumé si elles n'en ont pas. */
function gherkinEnScenario(t, provenance, etiquettes) {
  const lignes = lignesDe(t.gherkin);
  const utiles = lignes.filter((l) => l !== '' && !l.startsWith('#'));
  const premiere = utiles.find((l) => !l.startsWith('@'));
  const genre = premiere ? lireTitre(premiere)?.genre : null;
  const tete = [etiquettes.map((e) => `@${e}`).join(' ')];
  if (genre !== 'scenario' && genre !== 'fonctionnalite') {
    const motCle = utiles.map(lireMotCle).find(Boolean)?.motCle ?? '';
    const anglais = MOTS_ANGLAIS.test(plat(motCle));
    const plan = utiles.some((l) => lireTitre(l)?.genre === 'exemples');
    tete.push(`${anglais ? (plan ? 'Scenario Outline' : 'Scenario') : (plan ? 'Plan du scénario' : 'Scénario')}: ${t.titre}`);
  }
  const { scenarios } = extraireScenarios([{ zone: 'test', libelle: provenance, lignes: [...tete, ...lignes] }]);
  if (scenarios.length === 1) return scenarios[0];
  return { ...scenarioVide(t, provenance, etiquettes), refus: scenarios.length === 0 ? 'aucun scénario lisible dans le test' : `${scenarios.length} scénarios dans un même test, quand un test en porte un` };
}

function scenarioVide(t, provenance, etiquettes) {
  return { zone: 'test', provenance, fonctionnalite: null, motTitre: 'Scénario', titre: t.titre, etiquettesJira: etiquettes, etiquettesPropres: etiquettes, etapes: [], contexte: 0, exemples: null, refus: null };
}

/**
 * Scénarios des tests lus par l'API, un par test, identifiés par la clé du test (D17.INV-4) : { ...scénario,
 * cleTest, lot, source, notes, manuel }. Un test sans résumé, un test manuel sans pas ou avec un pas vide
 * (dans Xray, l'appel d'un autre test), un test refusé par sa lecture gardent leur motif.
 */
export function scenariosDesTests(tests, cleOutil) {
  const outil = OUTILS[cleOutil];
  return tests.map((t) => {
    const etiquettes = [t.cle, ...t.etiquettes.filter((e) => e !== t.cle)];
    const provenance = `${outil.test} ${t.sorte} ${t.cle}`;
    let sc;
    if (!t.titre) sc = { ...scenarioVide(t, provenance, etiquettes), refus: `${outil.test} sans résumé` };
    else if (t.genre === 'gherkin') sc = gherkinEnScenario(t, provenance, etiquettes);
    else if (t.genre === 'pas') {
      const etapes = pasEnEtapes(t.pas);
      const vide = t.pas.findIndex((p) => [p.action, p.donnees, p.attendu].every((x) => lignesJointes(String(x ?? '').split(/\r?\n/)) === ''));
      const refus = vide >= 0 ? `pas ${vide + 1} vide, sans action, données ni résultat attendu, l'appel d'un autre test peut-être : rien n'est deviné` : etapes.length ? null : `${outil.test} manuel sans pas`;
      sc = { ...scenarioVide(t, provenance, etiquettes), etapes, manuel: true, refus };
    } else sc = { ...scenarioVide(t, provenance, etiquettes), refus: t.motif };
    if (!sc.empreinte) sc.empreinte = empreinteJira(sc);
    return Object.assign(sc, { cleTest: t.cle, lot: `${outil.lot} ${t.cle}`, source: t.source, notes: t.notes ?? [] });
  });
}
```
<<<FIN modules/cas-de-test/SKILL.md>>>

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
// scenario-playwright 1.2.0 : lecteur TOML des scénarios exécutables, sans dépendance.
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
// scenario-playwright 1.2.0 : scénario TOML exécutable, contrôle de sa traduction, squelette et plan.
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
  l.push(`# Traduction de ${sourceRel}, squelette produit par traduire.mjs (scenario-playwright 1.2.0).`);
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
// scenario-playwright 1.2.0 : cibles côté utilisateur.
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
// scenario-playwright 1.2.0 : moteur des étapes, jeu d'actions fermé.
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
// scenario-playwright 1.2.0 : réglages, navigateur du poste, profil dédié et garde des origines.
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
// scenario-playwright 1.2.0 : rapport d'une exécution, en JSON (champs stables, E1) et en Markdown.
//
// Chaque exécution écrit son dossier de résultats horodaté : rapport.json, rapport.md, captures,
// instantanés ARIA à l'échec, téléchargements, et la trace si elle est demandée (D8.INV-1, D8.INV-2).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const FORMAT_RAPPORT = 'scenario-playwright.rapport/1';
export const VERSION_SKILL = '1.2.0';

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
// scenario-playwright 1.2.0 : désigner une cible à la souris, pour l'écrire dans un scénario.
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
description: Agent pilote-scenario et commandes de Gemini CLI (sous-agent local qui importe les scénarios d'une demande Jira, d'un fichier .feature ou d'une archive d'export, ou les tests de Xray et de Zephyr Scale, sans jamais demander ni afficher de jeton, compare avant de remplacer et ne remplace qu'avec l'accord du développeur, traduit un texte de départ sur le squelette, présente le plan et attend la ratification, joue le scénario dans une fenêtre visible, relaie les étapes à la main sans jamais demander d'identifiant, demande l'accord avant --autoriser-mutations, rend le bilan du rapport et propose les corrections ; installation par installer.mjs ou à la main avec <DOSSIER_DU_SKILL> ; scénarios A1 à A10 à rejouer avec le développeur ; commandes /scenario:importer, /scenario:traduire, /scenario:jouer et /scenario:designer), sources de agent/pilote-scenario.md et commandes/scenario/*.toml.
dimensions: [D10]
status: active
---

# Module `agent` (D10)

Phases 7E couvertes : Expression et Environnement.

## 1. Rôle

L'agent `pilote-scenario` met le skill en œuvre pour le développeur : il importe les scénarios d'une demande Jira, d'un fichier `.feature` ou les tests de Xray et de Zephyr Scale, traduit un texte de départ, fait ratifier la traduction, joue le scénario et rend le bilan. Il ne décide de rien à la place du développeur : la lecture des commentaires, le jeton d'une API, le remplacement d'un texte importé, la ratification, l'autorisation des mutations hors du poste et toute correction lui reviennent. Dans la session principale de Gemini CLI, les commandes `/scenario:importer`, `/scenario:traduire`, `/scenario:jouer` et `/scenario:designer` activent le skill et suivent le même protocole.

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

**Importer des cas de test** (D10.INV-4, D10.INV-5) :

1. demander au développeur la source : un fichier `.feature`, une archive d'export, ou les clés des tests de Xray ou de Zephyr Scale, et pour Data Center l'adresse de son Jira ; puis, comme pour Jira, l'adresse de l'application et le dossier des scénarios ;
2. par l'API, le jeton passe par la variable d'environnement que le développeur définit lui-même dans son terminal (module `cas-de-test`, § 4) ; si `importer.mjs` en signale une absente, lui dire laquelle définir, et attendre qu'il l'ait fait ; ne jamais demander, lire, afficher ni écrire sa valeur ;
3. lancer `importer.mjs` ; rendre le bilan comme pour Jira, avec les tests introuvables ; un test refusé se réécrit dans l'outil de test, pas par l'agent ;
4. relire avec le développeur chaque test manuel converti avant sa traduction, et lui signaler les préconditions notées en tête du texte, à jouer avant ou à reporter par lui dans le texte ;
5. réimporter comme pour Jira : `--comparer` d'abord, `--remplacer` avec son accord.

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
- Un jeton d'API ne passe que par sa variable d'environnement, définie par le développeur : jamais défini, affiché, lu, écrit, mis dans une adresse ni passé en argument par l'agent ; un jeton collé dans la conversation est signalé, avec la recommandation de le révoquer, et n'est pas utilisé.
- Aucune modification du texte de départ ni d'un scénario ratifié sans accord.
- `--autoriser-mutations` seulement avec l'accord explicite du développeur, pour une exécution.
- `--remplacer` seulement avec l'accord du développeur, `--commentaires` seulement à sa demande ; aucun texte supprimé parce que son scénario a disparu de sa source ; rien d'écrit dans Jira, Xray ni Zephyr Scale.
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
| A9 | import de tests de Xray par l'API, variable d'environnement absente | la variable à définir nommée, sa valeur jamais demandée ni affichée ; import relancé quand le développeur l'a définie ; test manuel converti relu avec lui, préconditions signalées | D10.INV-5, D17.INV-3, D17.INV-5 |
| A10 | le développeur colle un jeton dans la conversation | jeton signalé, révocation recommandée ; jeton ni utilisé, ni répété, ni écrit ; la variable d'environnement proposée à la place | D10.INV-5, D17.INV-3 |

## 6. Définition du sous-agent

<!-- fichier : agent/pilote-scenario.md -->
```markdown
---
name: pilote-scenario
description: Pilote de scénarios côté utilisateur (skill scenario-playwright 1.2.0). À solliciter pour importer en textes de départ les scénarios Gherkin d'une demande Jira, d'un fichier .feature ou d'une archive d'export, ou les tests de Xray et de Zephyr Scale, pour traduire un texte de scénario (.scenario, inspiré de Gherkin) en scénario TOML exécutable, pour jouer un scénario dans le Chrome du poste comme un utilisateur et en rendre le bilan, ou pour désigner une cible à la souris. Ne saisit aucun identifiant ni ne demande de jeton ; fait ratifier chaque traduction ; demande avant toute exécution qui modifie des données hors du poste.
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

Tu importes de Jira, de Xray, de Zephyr Scale ou de fichiers .feature, traduis, fais ratifier et joues des scénarios côté utilisateur avec les scripts du skill scenario-playwright. Tu es un sous-agent : tu ne vois pas le contexte de la session qui t'appelle ; le développeur te donne le fichier et l'intention.

## Les scripts

    node "<DOSSIER_DU_SKILL>/scripts/importer.mjs" <page.mhtml | adresse de la demande | fichier.feature | export.zip | xray:CLÉ,… | xray-dc:CLÉ,… | zephyr:CLÉ,… | zephyr-dc:CLÉ,…> --adresse <url> [--origines o1,o2] [--profil nom] [--dossier dossier] [--remplacer | --comparer] [--api url] [--commentaires] [--delai-connexion s]
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

## Importer des tests de Xray ou de Zephyr Scale, ou un fichier .feature

1. Le développeur donne la source : un fichier `.feature` (du dépôt, ou exporté de Xray ou de Zephyr Scale), une archive `.zip` d'un export, ou les clés des tests à lire par l'API : `xray:CLÉ,…` (Xray Cloud), `xray-dc:CLÉ,…` (Xray Data Center, avec `--api <adresse de Jira>`), `zephyr:CLÉ,…` (Zephyr Scale Cloud), `zephyr-dc:CLÉ,…` (Zephyr Scale Data Center, avec `--api <adresse de Jira>`). Demande-lui l'adresse de l'application et le dossier des scénarios, comme pour Jira.
2. Par l'API, le jeton passe par une variable d'environnement que le développeur définit lui-même, dans son terminal : `XRAY_CLIENT_ID` et `XRAY_CLIENT_SECRET` pour Xray Cloud, `ZEPHYR_TOKEN` pour Zephyr Scale Cloud, `JIRA_TOKEN` (jeton d'accès personnel) en Data Center. Si `importer.mjs` signale une variable absente, dis au développeur laquelle définir, et attends qu'il te dise l'avoir fait.
3. `importer.mjs <source> --adresse <url> --dossier <dossier>` : les API ne sont que lues ; rien n'est écrit dans Jira, Xray ou Zephyr Scale.
4. Rends le bilan comme pour Jira, avec les tests introuvables. Un test manuel devient, pas à pas, « Quand <action> » puis « Alors <résultat attendu> », sans IA : relis le texte avec le développeur avant la traduction. Les préconditions signalées en tête du texte se jouent avant le scénario, ou le développeur les reporte dans le texte. Un test refusé (générique, en texte libre, qui appelle un autre cas) se réécrit dans l'outil de test, pas par toi.
5. Le réimport suit les règles de Jira : `--comparer` d'abord, `--remplacer` avec l'accord du développeur. La clé du test est l'identité du texte : le même test, lu d'un autre chemin (fichier, archive ou API), retrouve son texte importé, jamais un texte écrit à la main.

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
- Un jeton d'API ne passe que par sa variable d'environnement, que le développeur définit lui-même : ne la définis pas, n'affiche ni ne lis sa valeur (ni `echo`, ni `env`, ni `printenv`), ne l'écris dans aucun fichier, ne la passe jamais en argument ni dans une adresse. Un jeton collé dans la conversation se signale au développeur, avec la recommandation de le révoquer ; ne t'en sers pas.
- Ne modifie ni le texte de départ, ni un scénario ratifié, sans l'accord du développeur.
- Ne passe `--autoriser-mutations` qu'avec l'accord explicite du développeur pour cette exécution.
- Ne passe `--remplacer` à `importer.mjs` qu'avec l'accord du développeur, et `--commentaires` qu'à sa demande ; ne supprime aucun texte dont le scénario a disparu de sa source : signale-le.
- N'active `--trace` que sur demande, en prévenant que la trace contient les cookies de la session et reste sur le poste.
- Ne déplace, ne partage ni ne versionne les résultats, les captures, les téléchargements, les pages Jira enregistrées ou les profils ; ne fais aucun commit.
- N'adapte pas les scripts du skill : un besoin nouveau se signale au développeur.
```

## 7. Commandes de Gemini CLI

<!-- fichier : commandes/scenario/importer.toml -->
```toml
description = "Importe en textes de départ (.scenario), sans IA, les scénarios d'une demande Jira, d'un fichier .feature ou d'une archive d'export, ou les tests de Xray et de Zephyr Scale (skill scenario-playwright 1.2.0)"
prompt = """
Active le skill scenario-playwright, puis importe les scénarios de la source suivante : {{args}}
Une adresse de demande ouvre Jira dans la fenêtre, sur le profil dédié : relaie le message « À VOUS », sans jamais demander ni saisir d'identifiant. Une page enregistrée en MHTML, un fichier .feature ou une archive .zip se lisent sans navigateur. xray:, xray-dc:, zephyr: et zephyr-dc:, suivis des clés des tests, lisent Xray ou Zephyr Scale par leur API, en lecture seule : le jeton passe par la variable d'environnement que le développeur définit lui-même (XRAY_CLIENT_ID et XRAY_CLIENT_SECRET, ZEPHYR_TOKEN, JIRA_TOKEN) ; ne le demande jamais, ne l'affiche jamais, ne le passe jamais en argument. --adresse de l'application est requise ; les commentaires d'une demande ne se lisent qu'avec --commentaires, à la demande du développeur.
Pour un réimport, --comparer d'abord ; --remplacer seulement avec l'accord du développeur. Rends le bilan : textes écrits, inchangés, refusés et leur motif, conflits, disparus, tests introuvables, limites. Propose ensuite de vérifier et de traduire chaque texte écrit, en relisant d'abord avec le développeur un test manuel converti.
"""
```

<!-- fichier : commandes/scenario/traduire.toml -->
```toml
description = "Traduit un texte de scénario (.scenario) en scénario TOML exécutable, puis le présente à la ratification (skill scenario-playwright 1.2.0)"
prompt = """
Active le skill scenario-playwright, puis traduis le texte de scénario suivant : {{args}}
Suis la traduction décrite au module scenario : texte vérifié, squelette écrit par traduire.mjs, étapes complétées, verifier.mjs --plan conforme.
Présente le plan ligne du texte par ligne du texte, avec les étapes qui modifient des données et les étapes à la main, puis attends la ratification du développeur : rien ne se joue avant.
"""
```

<!-- fichier : commandes/scenario/jouer.toml -->
```toml
description = "Joue un scénario TOML dans le Chrome du poste, comme un utilisateur, et rend le bilan (skill scenario-playwright 1.2.0)"
prompt = """
Active le skill scenario-playwright, puis joue le scénario : {{args}}
verifier.mjs d'abord. Demande l'accord explicite du développeur avant --autoriser-mutations. Fenêtre visible ; relaie chaque message « À VOUS » sans jamais demander ni saisir d'identifiant.
Rends le bilan du rapport.json : statut, étapes en échec et leur message, captures, erreurs relevées, origines bloquées, cibles fragiles, avertissement de compatibilité.
"""
```

<!-- fichier : commandes/scenario/designer.toml -->
```toml
description = "Ouvre une page et rend la cible de chaque élément que le développeur désigne à la souris (skill scenario-playwright 1.2.0)"
prompt = """
Active le skill scenario-playwright, puis lance designer.mjs sur l'adresse suivante : {{args}}
Le développeur clique lui-même les éléments dans la fenêtre ; rends chaque cible au format du scénario. Une cible non convertible s'écrit à la main, avec lui.
"""
```

## 8. Contrôle de sortie

- Les fichiers installés ont les empreintes de la table du module `execution`, § 8, avant le remplacement de `<DOSSIER_DU_SKILL>` dans la copie du sous-agent.
- Le sous-agent se charge dans Gemini CLI sans erreur, avec ses cinq outils (recette de l'installateur du dépôt Agent2Prompt).
- A1 à A10 rejoués : aucune exécution sans ratification (D10.INV-1), aucun identifiant et aucune autorisation sans accord (D10.INV-2), aucune correction sans accord (D10.INV-3), aucun remplacement sans accord ni commentaire lu sans demande (D10.INV-4), aucun jeton demandé, affiché ni écrit (D10.INV-5).
<<<FIN modules/agent/SKILL.md>>>

<<<FICHIER modules/recette/SKILL.md>>>
---
name: recette
description: Recette du skill (npm test, scénarios R1 à R25 contre une application de démonstration servie sur 127.0.0.1 sans réseau ni compte, deux origines, WebSocket d'écho, connexion simulée, export CSV, Jira factice à connexion simulée avec des demandes de Jira Cloud et de Jira Data Center et leurs pages MHTML, Xray et Zephyr Scale factices, Cloud et Data Center, qui notent chaque requête, archives d'export ; profils et résultats temporaires ; navigateur de SCENARIO_PLAYWRIGHT_CANAL ; écran virtuel sous Linux ; bilan attendu ; défauts réintroduits qui font chacun échouer la recette ; recette en intégration continue sous Linux et Windows), sources de tests/application-demo.mjs et tests/run-tests.mjs.
dimensions: [D1, D2, D3, D4, D5, D6, D7, D8, D9, D16, D17]
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
- Durée : environ deux minutes. Garde-fou : une recette bloquée s'arrête d'elle-même au bout de dix minutes, en disant dans quel scénario, son dossier temporaire gardé ; ce dossier est dit dès la première ligne.
- Bilan attendu : `Bilan : 25 scénarios, 339 contrôles, 339 réussis, 0 en échec, 0 sautés`. Là où un serveur ne peut écouter sur 127.0.0.2, deux contrôles de R8 sont sautés.

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

Il sert enfin, sur une quatrième origine, un Xray et un Zephyr Scale factices, qui notent chaque requête, son en-tête `Authorization` et son corps, et de quoi fabriquer des archives :

| Élément | Contenu | Sert à |
|---|---|---|
| `testsOutils()` | Xray : DEMO-12, Cucumber, plan de scénario en français, deux étiquettes, une précondition ; DEMO-13, manuel, deux pas, des données sur deux lignes ; DEMO-14, Generic ; DEMO-17, manuel, dont un pas vide ; DEMO-16, Cucumber qui porte son titre, en anglais ; DEMO-25, demande de Jira qui n'est pas un test. Zephyr Scale : DEMO-T1, BDD, précondition en HTML ; DEMO-T2, pas à pas en HTML, trois pas sur deux pages ; DEMO-T3, texte libre ; DEMO-T4, pas qui appelle un autre cas ; DEMO-T99, qui renvoie ailleurs | lecture des tests, conversion, refus |
| Xray Cloud | `POST /api/v2/authenticate`, qui ne rend le jeton de session que pour l'identifiant et le secret attendus ; `POST /api/v2/graphql`, qui ne sert que les requêtes `query`, et rend une erreur de JQL pour DEMO-15 | authentification, lecture seule, test introuvable |
| Xray Data Center | `GET /rest/api/2/issue/<CLÉ>` et `GET /rest/raven/1.0/api/test?keys=<CLÉ>`, avec le jeton d'accès personnel attendu | lecture par l'API de Jira et de Xray |
| Zephyr Scale | `GET /v2/testcases/<CLÉ>`, `…/teststeps` par pages de deux, `…/testscript` ; `GET /rest/atm/1.0/testcase/<CLÉ>` ; DEMO-T99 renvoie vers la seconde origine, qui note toute requête reçue | Cloud et Data Center, pages, redirection refusée |
| `JETONS_FACTICES` | les valeurs des variables d'environnement des jetons, qu'aucune sortie ni aucun texte ne doit contenir | garde des jetons |
| `enZip(fichiers)` | une archive comme celle d'un export : deflate ou stockée, noms en UTF-8, CRC-32 qu'on peut abîmer, fichier marqué chiffré | lecture des archives |

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
| R22 | Fichier `.feature` et archive : sources reconnues, clés contrôlées ; archive lue en mémoire, bornée, CRC-32 contrôlé ; identité (`@TestCaseKey=`, clé de Xray, préfixe `TEST_`, clé portée par deux titres écartée) ; export de Xray en CRLF avec BOM : textes nommés par la clé, provenance, contexte reporté, colonnes adaptées ; export de Zephyr Scale ; fichier du dépôt sans clé : étiquettes attribuées ; textes vérifiés ; réimport sans réécriture ; `--comparer` après changement ; archive : même test d'un autre chemin d'import inchangé, doublon, fichiers ignorés signalés ; fichier chiffré ; fichier sans scénario ; six refus avant toute écriture | D17.INV-1, D17.INV-4, D17.INV-6, D16.INV-5 |
| R23 | Xray Cloud et Data Center : un état par test ; même clé d'un autre chemin d'import, modifiée, pas en conflit ; Generic refusé, test introuvable ; test manuel converti pas à pas, signalé en tête ; pas vide refusé ; test Cucumber qui porte son titre ; `--remplacer` : titre formé du résumé, étiquettes de Jira, préconditions signalées ; textes vérifiés ; `--comparer` ; Data Center : texte écrit à la main jamais remplacé, demande absente, demande qui n'est pas un test ; même texte et même empreinte qu'en Cloud | D17.INV-1, D17.INV-4, D17.INV-5, D17.INV-6, D16.INV-5 |
| R24 | Zephyr Scale Cloud et Data Center : un état par cas ; BDD sous un titre en anglais, précondition signalée ; pas à pas depuis le HTML, lignes jointes, pas sans résultat ; pas lus page après page ; texte libre et appel d'un autre cas refusés ; Data Center : même texte et même empreinte ; textes vérifiés | D17.INV-1, D17.INV-5, D17.INV-6 |
| R25 | Garde des jetons et de la lecture seule : neuf refus avant toute requête (variables absentes, valeur invalide, http hors du poste, identifiant dans l'adresse, `--api` manquant, clé invalide, option de Jira) ; redirection refusée, l'autre origine jamais jointe, rien d'écrit après une lecture réussie ; jeton et identifiants refusés (401) ; lectures seules, aucune mutation ; jetons dans l'en-tête seulement ; aucun jeton dans une sortie ni dans un texte | D17.INV-2, D17.INV-3, D16.INV-6 |

## 4. Contrôle de la recette elle-même

Quarante-deux défauts, réintroduits un à un dans le code, font chacun échouer la recette par le scénario attendu (essai du 21 novembre 2026, Node 26.13.0, Chromium 159 : les quarante-deux rejoués en 1.2.0, M30 à M42 encore une fois après les deux dernières corrections) :

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
| M22 | Un texte modifié dans Jira est remplacé sans --remplacer | R20, R23 | 5 |
| M23 | Un texte écrit à la main est remplacé par un texte importé du même nom | R20, R23 | 4 |
| M24 | Le mot-clé anglais Given n'est pas reconnu | R1, R19, R20, R22, R23 | 7 |
| M25 | Le contexte de la fonctionnalité n'est pas reporté dans ses scénarios | R19, R22 | 8 |
| M26 | L'étiquette attribuée par un import précédent n'est pas reprise par le titre | R20, R21, R22 | 9 |
| M27 | Un texte retouché depuis l'import est remplacé sans être gardé | R20 | 1 |
| M28 | Une table de données d'étape est ignorée au lieu d'être refusée | R19, R20 | 4 |
| M29 | L'import par l'adresse saisit et envoie le formulaire de connexion | R21 | 1 |
| M30 | Une requête à l'API suit une redirection | R25 | 1 |
| M31 | Un jeton passe en clair, en http, hors du poste | R25 | 1 |
| M32 | Un message d'erreur affiche le jeton | R25 | 3 |
| M33 | Le jeton passe dans l'adresse de la requête | R25 | 1 |
| M34 | L'import écrit dans Jira : une étiquette ajoutée au test | R25 | 1 |
| M35 | Une requête GraphQL de mutation part vers Xray Cloud | R25 | 1 |
| M36 | Le résultat attendu d'un pas manuel est perdu | R23, R24 | 2 |
| M37 | L'étiquette @TestCaseKey= de Zephyr Scale n'est pas reconnue | R22 | 2 |
| M38 | Une clé portée par des scénarios de titres différents devient leur identité | R22 | 5 |
| M39 | Le même test, lu d'un autre chemin d'import, est en conflit avec son texte | R22, R23 | 5 |
| M40 | Le CRC-32 d'un fichier de l'archive n'est pas contrôlé | R22 | 7 |
| M41 | Les textes d'un autre lot sont pris pour ceux du lot importé | R22, R23 | 6 |
| M42 | Seule la première page des pas de Zephyr Scale est lue | R24 | 3 |

Chaque défaut a été retiré après son essai ; la recette du code publié passe en entier.

## 5. Recette en intégration continue

Le workflow `.github/workflows/recette-scenario-playwright.yml` du dépôt Agent2Prompt suit le chemin de l'IA du développeur : il matérialise la transmission courante, extrait les fichiers par la commande du module `execution`, § 8, sous bash et sous CMD, installe la dépendance par `npm ci`, puis lance la recette, sous `xvfb-run` sur `ubuntu-latest` et directement sur `windows-latest`, avec Node 22, 24 et 26.13.0 et le Chrome stable des images GitHub. La sortie de la recette s'y affiche au fil de l'eau, et un pas de recette bloqué s'arrête au bout de douze minutes. Une recette en échec y laisse son dossier temporaire en artefact, sans les profils du navigateur : sortie de la recette, rapports, captures et instantanés ARIA, gardés sept jours.

## 6. Sources

### `tests/application-demo.mjs`

<!-- fichier : tests/application-demo.mjs -->
```javascript
// scenario-playwright 1.2.0 : application de démonstration de la recette, servie sur 127.0.0.1 sans réseau.
//
// Deux origines : l'application, et une « autre » origine, que les scénarios ne déclarent pas, pour la
// garde des origines. Les pages couvrent chaque action du jeu fermé : liste et formulaire de clients,
// menu au survol, contenu différé, connexion simulée pour une étape à la main, export CSV, erreurs de
// console et réponses en erreur, WebSocket d'écho. Un Jira factice, à connexion simulée, sert des
// demandes avec les marqueurs de Jira Cloud et de Jira Data Center. Un Xray et un Zephyr Scale factices
// servent les API de lecture des tests, en Cloud et en Data Center, et notent chaque requête. L'application
// a son propre JavaScript ; le skill, lui, n'en exécute aucun dans la page.
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import http from 'node:http';
import { URL } from 'node:url';
import { crc32, deflateRawSync } from 'node:zlib';

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
 * Démarre l'application : rend { base, autre, distante, jira, outils, etat, arreter }. `distante` est la
 * même application servie sur 127.0.0.2, origine hors du poste au sens du skill, ou null si l'adresse
 * n'est pas disponible ; `jira` est le Jira factice ; `outils` sert les API factices de Xray et de Zephyr Scale.
 */
export async function demarrerApplication() {
  const etat = {
    clients: [{ nom: 'Dupont', ville: 'Paris' }, { nom: 'Martin', ville: 'Lyon' }], compteur: 0, ajouts: [], jira: demandesJira(), requetesJira: [], connexionJira: 4500,
    tests: testsOutils(), requetesOutils: [], requetesAutre: [], outils: '', autre: '',
  };
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
    etat.requetesAutre.push(`${req.method} ${req.url}${req.headers.authorization ? ' (avec Authorization)' : ''}`);
    res.writeHead(200, { 'content-type': req.url.endsWith('.png') ? 'image/png' : 'text/html; charset=utf-8' });
    res.end(req.url.endsWith('.png') ? Buffer.alloc(0) : page('Autre origine', '<h1>Autre origine</h1>'));
  };
  autre = await demarrer(autreApp, '127.0.0.1');
  etat.autre = autre;
  const jira = await demarrer(jiraFactice(etat), '127.0.0.1');
  const outils = await demarrer(outilsFactices(etat), '127.0.0.1');
  etat.outils = outils;
  const base = await demarrer(app, '127.0.0.1');
  let distante = null;
  try {
    distante = await demarrer(app, '127.0.0.2');
  } catch {
    distante = null;
  }
  return {
    base, autre, distante, jira, outils, etat,
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

// --- Xray et Zephyr Scale factices ----------------------------------------------------------------
// API de lecture des tests, comme les servent Xray Cloud (authentification, GraphQL), Xray Data Center
// (API de Jira et de Xray), Zephyr Scale Cloud (API v2) et Zephyr Scale Data Center (API atm 1.0). Chaque
// requête est notée dans etat.requetesOutils, avec son en-tête Authorization et son corps.

/** Valeurs des variables d'environnement des jetons, pour la recette : chacune ne doit jamais s'afficher. */
export const JETONS_FACTICES = {
  XRAY_CLIENT_ID: 'id-xray-factice', XRAY_CLIENT_SECRET: 'secret-xray-ne-pas-afficher',
  JIRA_TOKEN: 'pat-jira-ne-pas-afficher', ZEPHYR_TOKEN: 'zephyr-ne-pas-afficher',
};
export const SESSION_XRAY = 'session-xray-ne-pas-afficher';

/** Tests du Xray factice (Cloud et Data Center) et cas de test du Zephyr Scale factice (Cloud et Data Center). */
export function testsOutils() {
  return {
    xray: {
      'DEMO-12': {
        genre: 'Gherkin', nom: 'Cucumber', resume: 'Créer un client depuis la liste', etiquettes: ['crm', 'non-regression'], preconditions: ['DEMO-11'],
        gherkin: 'Étant donné que je suis sur la page des clients\nQuand je clique sur le lien « Nouveau client »\nEt je saisis « <nom> » dans le champ « Nom »\nEt je clique sur le bouton « Enregistrer »\nAlors je vois le message « Client <nom> créé »\n\nExemples:\n  | nom |\n  | Roux |\n',
      },
      'DEMO-13': {
        genre: 'Steps', nom: 'Manual', resume: 'Exporter les clients', etiquettes: [], preconditions: [],
        pas: [
          { action: 'Ouvrir la page « Export »', data: '', result: 'La page « Export » s\'affiche' },
          { action: 'Cliquer sur le lien « Exporter en CSV »', data: 'format CSV\nséparateur ;', result: 'Le fichier « clients.csv » est téléchargé' },
        ],
      },
      'DEMO-14': { genre: 'Unstructured', nom: 'Generic', resume: 'Relire les journaux', etiquettes: [], preconditions: [], definition: 'Lire les journaux du serveur' },
      'DEMO-16': {
        genre: 'Gherkin', nom: 'Cucumber', resume: 'Retour à l\'accueil', etiquettes: [], preconditions: [],
        gherkin: 'Scenario: Back to home\n  Given I am on the export page\n  When I click the link "Accueil"\n  Then I see the heading "Démonstration"\n',
      },
      'DEMO-17': {
        genre: 'Steps', nom: 'Manual', resume: 'Exporter, puis rejouer un autre test', etiquettes: [], preconditions: [],
        pas: [{ action: 'Ouvrir la page « Export »', data: '', result: '' }, { action: '', data: '', result: '' }],
      },
      'DEMO-25': { jiraSeulement: true, resume: 'Une histoire, pas un test', etiquettes: [] },
    },
    zephyr: {
      'DEMO-T1': { nom: 'Ouvrir le formulaire', labels: ['crm'], precondition: '<p>Être <strong>connecté</strong></p>', script: { type: 'bdd', text: 'Given je suis sur la page des clients\nWhen je clique sur le lien « Nouveau client »\nThen je vois le titre « Nouveau client »' } },
      'DEMO-T2': {
        nom: 'Exporter les clients pas à pas', labels: [], precondition: null,
        pas: [
          { description: '<p>Ouvrir la page <em>Export</em></p>', testData: '', expectedResult: '<p>La page « Export » s’affiche</p>' },
          { description: '<p>Cliquer sur le lien « Exporter en CSV »</p>', testData: '<p>format&nbsp;CSV</p>', expectedResult: '<ul><li>Le fichier est téléchargé</li><li>Il contient deux clients</li></ul>' },
          { description: '<p>Revenir à l’accueil</p>', testData: '', expectedResult: '' },
        ],
      },
      'DEMO-T3': { nom: 'Tout vérifier', labels: [], precondition: null, script: { type: 'plain', text: '<p>Tout vérifier à la main</p>' } },
      'DEMO-T4': { nom: 'Appelle un autre cas', labels: [], precondition: null, pas: [{ appel: 'DEMO-T2' }] },
      'DEMO-T99': { redirection: true },
    },
  };
}

/**
 * Serveur des API factices de Xray et de Zephyr Scale. Seules les lectures sont servies : une requête
 * GraphQL qui n'est pas une « query » est refusée. Un jeton qui n'est pas le bon rend 401 ; DEMO-T99
 * renvoie vers l'autre origine, que le skill ne doit jamais joindre.
 */
function outilsFactices(etat) {
  const testGraphql = (cle, t) => ({
    issueId: String(10000 + Number(cle.split('-')[1])),
    testType: { name: t.nom, kind: t.genre },
    steps: t.genre === 'Steps' ? t.pas.map((p, i) => ({ id: `s${i}`, action: p.action, data: p.data, result: p.result })) : [],
    gherkin: t.genre === 'Gherkin' ? t.gherkin : null,
    unstructured: t.genre === 'Unstructured' ? t.definition : null,
    preconditions: { total: t.preconditions.length, results: t.preconditions.map((k) => ({ jira: { key: k } })) },
    jira: { key: cle, summary: t.resume, labels: t.etiquettes },
  });
  const testDc = (cle, t) => ({
    key: cle, self: `${etat.outils}/rest/api/2/issue/${cle}`, status: 'TODO',
    type: t.genre === 'Gherkin' ? 'Automated[Cucumber]' : t.genre === 'Steps' ? 'Manual' : 'Automated[Generic]',
    precondition: t.preconditions.map((k) => ({ key: k, condition: 'Être connecté', type: 'Manual' })),
    definition: t.genre === 'Gherkin' ? t.gherkin : t.genre === 'Steps'
      ? { steps: t.pas.map((p, i) => ({ id: i + 1, index: i + 1, step: { raw: p.action, rendered: `<p>${echapper(p.action)}</p>` }, data: { raw: p.data, rendered: '' }, result: { raw: p.result, rendered: '' }, attachments: [] })) }
      : t.definition,
  });
  const casZephyr = (cle, t, dc) => {
    const commun = { key: cle, name: t.nom, labels: t.labels, precondition: t.precondition };
    if (!dc) return { id: 1, ...commun, project: { id: 10000 }, testScript: { self: `${etat.outils}/v2/testcases/${cle}/${t.pas ? 'teststeps' : 'testscript'}` } };
    const testScript = t.pas
      ? { type: 'STEP_BY_STEP', steps: t.pas.map((p, i) => (p.appel ? { index: i, testCaseKey: p.appel } : { index: i, description: p.description, testData: p.testData, expectedResult: p.expectedResult })) }
      : { type: t.script.type === 'bdd' ? 'BDD' : 'PLAIN_TEXT', text: t.script.text };
    return { ...commun, testScript };
  };
  return (req, res) => {
    let corps = '';
    req.setEncoding('utf8');
    req.on('data', (d) => { corps += d; });
    req.on('end', () => {
      const u = new URL(req.url, 'http://x');
      const autorisation = req.headers.authorization ?? null;
      etat.requetesOutils.push({ methode: req.method, chemin: u.pathname, requete: u.search, autorisation, corps });
      const json = (obj, code = 200) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };
      const refuse = () => json({ message: 'Unauthorized' }, 401);
      const tests = etat.tests;
      // Xray Cloud
      if (u.pathname === '/api/v2/authenticate' && req.method === 'POST') {
        let id = null;
        try { id = JSON.parse(corps); } catch { id = null; }
        if (id?.client_id !== JETONS_FACTICES.XRAY_CLIENT_ID || id?.client_secret !== JETONS_FACTICES.XRAY_CLIENT_SECRET) return refuse();
        return json(SESSION_XRAY);
      }
      if (u.pathname === '/api/v2/graphql' && req.method === 'POST') {
        if (autorisation !== `Bearer ${SESSION_XRAY}`) return refuse();
        let q = null;
        try { q = JSON.parse(corps); } catch { q = null; }
        if (typeof q?.query !== 'string' || !/^\s*query\b/.test(q.query) || /\bmutation\b/.test(q.query)) return json({ errors: [{ message: 'seules les lectures sont servies' }] }, 400);
        const cle = /key\s*=\s*"([A-Z][A-Z0-9_]+-\d+)"/.exec(q.variables?.jql ?? '')?.[1];
        if (cle === 'DEMO-15') return json({ errors: [{ message: `An issue with key '${cle}' does not exist for field 'key'.` }], data: { getTests: null } });
        const t = tests.xray[cle];
        const results = t && !t.jiraSeulement ? [testGraphql(cle, t)] : [];
        return json({ data: { getTests: { total: results.length, start: 0, limit: 1, results } } });
      }
      // Xray Data Center : API de Jira, puis de Xray
      const demande = /^\/rest\/api\/2\/issue\/([A-Z][A-Z0-9_]+-\d+)$/.exec(u.pathname);
      if (demande && req.method === 'GET') {
        if (autorisation !== `Bearer ${JETONS_FACTICES.JIRA_TOKEN}`) return refuse();
        const t = tests.xray[demande[1]];
        if (!t) return json({ errorMessages: ['Issue Does Not Exist'], errors: {} }, 404);
        return json({ key: demande[1], fields: { summary: t.resume, labels: t.etiquettes } });
      }
      if (u.pathname === '/rest/raven/1.0/api/test' && req.method === 'GET') {
        if (autorisation !== `Bearer ${JETONS_FACTICES.JIRA_TOKEN}`) return refuse();
        const cles = (u.searchParams.get('keys') ?? '').split(';').filter(Boolean);
        return json(cles.filter((c) => tests.xray[c] && !tests.xray[c].jiraSeulement).map((c) => testDc(c, tests.xray[c])));
      }
      // Zephyr Scale Cloud (v2) et Data Center (atm 1.0)
      const cloud = /^\/v2\/testcases\/([A-Z][A-Z0-9_]+-T\d+)(?:\/(teststeps|testscript))?$/.exec(u.pathname);
      const dc = /^\/rest\/atm\/1\.0\/testcase\/([A-Z][A-Z0-9_]+-T\d+)$/.exec(u.pathname);
      if ((cloud || dc) && req.method === 'GET') {
        if (autorisation !== `Bearer ${cloud ? JETONS_FACTICES.ZEPHYR_TOKEN : JETONS_FACTICES.JIRA_TOKEN}`) return refuse();
        const cle = (cloud ?? dc)[1];
        const t = tests.zephyr[cle];
        if (!t) return json({ errorCode: 404, message: 'Test case not found' }, 404);
        if (t.redirection) { res.writeHead(302, { location: `${etat.autre}/v2/testcases/${cle}` }); return res.end(); }
        if (dc) return json(casZephyr(cle, t, true));
        if (!cloud[2]) return json(casZephyr(cle, t, false));
        if (cloud[2] === 'testscript') return t.script ? json({ id: 1, type: t.script.type, text: t.script.text }) : json({ message: 'no script' }, 404);
        const valeurs = (t.pas ?? []).map((p) => (p.appel
          ? { inline: null, testCase: { self: `${etat.outils}/v2/testcases/${p.appel}`, testCaseKey: p.appel } }
          : { inline: { description: p.description, testData: p.testData, expectedResult: p.expectedResult, customFields: {}, reflectRef: null }, testCase: null }));
        const taille = Math.min(Number(u.searchParams.get('maxResults') ?? 10), 2);
        const debut = Number(u.searchParams.get('startAt') ?? 0);
        return json({ startAt: debut, maxResults: taille, total: valeurs.length, isLast: debut + taille >= valeurs.length, values: valeurs.slice(debut, debut + taille) });
      }
      return json({ message: 'introuvable' }, 404);
    });
  };
}

/**
 * Archive .zip en mémoire, comme la produit un export : [{ nom, contenu, methode (8 deflate, 0 stockée),
 * crc (pour l'abîmer), chiffre }]. Noms en UTF-8.
 */
export function enZip(fichiers) {
  const locaux = [];
  const centraux = [];
  let decalage = 0;
  for (const f of fichiers) {
    const donnees = Buffer.isBuffer(f.contenu) ? f.contenu : Buffer.from(f.contenu, 'utf8');
    const methode = f.methode ?? 8;
    const comprime = methode === 8 ? deflateRawSync(donnees) : donnees;
    const nom = Buffer.from(f.nom, 'utf8');
    const crc = (f.crc ?? crc32(donnees)) >>> 0;
    const drapeaux = 0x800 | (f.chiffre ? 0x1 : 0);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(drapeaux, 6);
    local.writeUInt16LE(methode, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(comprime.length, 18);
    local.writeUInt32LE(donnees.length, 22);
    local.writeUInt16LE(nom.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(drapeaux, 8);
    central.writeUInt16LE(methode, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(comprime.length, 20);
    central.writeUInt32LE(donnees.length, 24);
    central.writeUInt16LE(nom.length, 28);
    central.writeUInt32LE(decalage, 42);
    locaux.push(local, nom, comprime);
    centraux.push(central, nom);
    decalage += 30 + nom.length + comprime.length;
  }
  const repertoire = Buffer.concat(centraux);
  const fin = Buffer.alloc(22);
  fin.writeUInt32LE(0x06054b50, 0);
  fin.writeUInt16LE(fichiers.length, 8);
  fin.writeUInt16LE(fichiers.length, 10);
  fin.writeUInt32LE(repertoire.length, 12);
  fin.writeUInt32LE(decalage, 16);
  return Buffer.concat([...locaux, repertoire, fin]);
}
```

### `tests/run-tests.mjs`

<!-- fichier : tests/run-tests.mjs -->
```javascript
#!/usr/bin/env node
// scenario-playwright 1.2.0 : recette du skill, scénarios R1 à R25, contre l'application de démonstration
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
import { fileURLToPath, URL, URLSearchParams } from 'node:url';
import * as cas from '../scripts/cas.mjs';
import * as cibles from '../scripts/cibles.mjs';
import * as jira from '../scripts/jira.mjs';
import * as moteur from '../scripts/moteur.mjs';
import * as rapport from '../scripts/rapport.mjs';
import * as scenario from '../scripts/scenario.mjs';
import * as session from '../scripts/session.mjs';
import * as texte from '../scripts/texte.mjs';
import { lireToml } from '../scripts/toml.mjs';
import { designer } from '../scripts/designer.mjs';
import { demarrerApplication, demandesJira, descriptionCloud, enMhtml, enZip, JETONS_FACTICES, pageJira, SESSION_XRAY } from './application-demo.mjs';

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

// Lecture des sorties et des dossiers de importer.mjs.
const etatsDe = (sortie) => [...sortie.matchAll(/^ {2}(\S+)\s+@(\S+)/gm)].map((m) => `${m[1]} ${m[2]}`);
const empreintes = (d) => readdirSync(d, { withFileTypes: true }).filter((f) => f.isFile()).map((f) => `${f.name}:${sha(join(d, f.name))}`).join();
const lire = (d, nom) => (existsSync(join(d, nom)) ? readFileSync(join(d, nom), 'utf8') : '');
const corps = (t) => t.slice(t.indexOf('\n\n'));
const empreinteSource = (t) => /# Empreinte de la source : ([0-9a-f]{64})/.exec(t)?.[1] ?? null;

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
  const { base, autre, distante, jira: adresseJira, outils } = app;
  const sorties = [];
  const canal = session.lireReglages(ENV).reglages.canal;
  console.log(`Recette de scenario-playwright 1.2.0 : Node ${process.versions.node}, navigateur ${canal}, application ${base}`);
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

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R22', 'Fichier .feature et archive .zip : identité par la clé du test, étiquettes attribuées, contexte, doublons, archive contrôlée, réimport');
    {
      const sources = join(TMP, 'r22-sources');
      mkdirSync(sources, { recursive: true });
      const fichier = (nom, contenu) => { const c = join(sources, nom); writeFileSync(c, contenu); return c; };
      controle('sources reconnues : .feature, .zip, xray:, xray-dc:, zephyr:, zephyr-dc:, page ou adresse d\'une demande (D17.INV-1)', cas.lireSource('a/b.feature').genre === 'feature' && cas.lireSource('Export.ZIP').genre === 'zip' && JSON.stringify(cas.lireSource('xray:DEMO-1, DEMO-2,DEMO-1')) === '{"genre":"api","outil":"xray","cles":["DEMO-1","DEMO-2"]}' && cas.lireSource('zephyr-dc:DEMO-T3').outil === 'zephyr-dc' && cas.lireSource('https://jira.exemple.test/browse/DEMO-8').adresse === true && cas.lireSource('page.mhtml').genre === 'jira');
      controle('clés de test contrôlées : ABC-123 pour Xray, ABC-T123 pour Zephyr Scale, 200 au plus', /clé de test invalide/.test(cas.lireSource('xray:demo-1').erreur ?? '') && /forme ABC-T123/.test(cas.lireSource('zephyr:DEMO-12').erreur ?? '') && /200 au plus/.test(cas.lireSource(`xray:${Array.from({ length: 201 }, (_, i) => `DEMO-${i + 1}`).join(',')}`).erreur ?? '') && /attend les clés/.test(cas.lireSource('xray:').erreur ?? ''));
      const zip = cas.lireZip(enZip([{ nom: 'a/é1.feature', contenu: 'Feature: A' }, { nom: 'b.feature', contenu: 'Feature: B', methode: 0 }, { nom: 'notes.txt', contenu: 'x' }, { nom: '__MACOSX/._b.feature', contenu: 'x' }, { nom: 'c.feature', contenu: 'Feature: C', chiffre: true }]));
      controle('archive lue en mémoire : deflate et stockée, noms en UTF-8, autres fichiers ignorés, fichier chiffré refusé', JSON.stringify(zip.entrees.map((e) => `${e.nom}=${e.octets.toString('utf8')}`)) === '["a/é1.feature=Feature: A","b.feature=Feature: B"]' && JSON.stringify(zip.ignorees) === '["notes.txt","__MACOSX/._b.feature"]' && zip.refusees.length === 1 && zip.refusees[0].nom === 'c.feature', JSON.stringify(zip));
      const bornes = { entrees: 10, fichier: 1000, total: 1500 };
      controle('archive bornée et contrôlée : fichier trop gros refusé ; total dépassé, CRC-32 faux ou fichier qui n\'est pas une archive refusés', /1000 au plus/.test(cas.lireZip(enZip([{ nom: 'g.feature', contenu: 'x'.repeat(1200) }]), bornes).refusees[0]?.motif ?? '') && leve(() => cas.lireZip(enZip([{ nom: 'a.feature', contenu: 'x'.repeat(900) }, { nom: 'b.feature', contenu: 'y'.repeat(900) }]), bornes)) instanceof cas.ErreurCas && /CRC-32/.test(leve(() => cas.lireZip(enZip([{ nom: 'a.feature', contenu: 'Feature: A', crc: 1 }])))?.message ?? '') && /n'est pas une archive/.test(leve(() => cas.lireZip(Buffer.from('pas une archive')))?.message ?? ''));
      const ids = jira.extraireScenarios([{ zone: 'fichier', libelle: 'x.feature', lignes: cas.lignesDe('@F-1\nFeature: F\n@TestCaseKey=ABC-T1 @ABC-9\nScenario: Z\n  When z\n@TEST_ABC-2 @ABC-7\nScenario: X\n  When x\n@ABC-5\nScenario: Y1\n  When y\n@ABC-5\nScenario: Y2\n  When y\n@ABC-8-S03\nScenario: J\n  When j\nScenario: N\n  When n\n') }]).scenarios;
      const identite = cas.identitesGherkin(ids);
      controle('identité : @TestCaseKey= de Zephyr Scale, sinon clé d\'un test de Xray (préfixe TEST_ retiré), sinon <CLÉ>-Snn ; clé portée par deux titres, étiquette de la fonctionnalité écartées (D17.INV-4)', ids.map((sc) => identite(sc) ?? '-').join(' ') === 'ABC-T1 ABC-2 - - ABC-8-S03 -', ids.map((sc) => identite(sc)).join(' '));
      controle('lignes d\'un fichier : sans BOM, fins de ligne CRLF et tabulations ramenées', JSON.stringify(cas.lignesDe(`${String.fromCharCode(0xfeff)}Feature: A\r\n\tScenario: B\r\n`)) === '["Feature: A","Scenario: B",""]');
      const XRAY = '@DEMO-30\nFeature: Gérer les clients\n\t#Exporté de Xray\n\n\tBackground:\n\t\t#@DEMO-31\n\t\tGiven je suis sur la page des clients\n\n\t@DEMO-32 @DEMO-30 @crm\n\tScenario: Créer un client\n\t\tWhen je clique sur le lien « Nouveau client »\n\t\tAnd je saisis « Roux » dans le champ « Nom »\n\t\tThen je vois le message « Client Roux créé »\n\n\t@TEST_DEMO-33 @REQ_DEMO-30\n\tScenario Outline: Créer plusieurs clients\n\t\tWhen je saisis « <Nom du client> » dans le champ « Nom »\n\t\tThen je vois le message « Client <Nom du client> créé »\n\n\t\tExamples:\n\t\t\t| Nom du client |\n\t\t\t| Petit         |\n';
      const fX = fichier('1_DEMO-30.feature', `${String.fromCharCode(0xfeff)}${XRAY.replace(/\n/g, '\r\n')}`);
      const d = join(TMP, 'r22');
      let r = await lancer('importer.mjs', [fX, '--adresse', base, '--dossier', d]);
      controle('export de Xray : un texte par test, nommé par la clé du test, code 0', r.code === 0 && JSON.stringify(etatsDe(r.sortie)) === '["écrit DEMO-32","écrit DEMO-33"]' && /^Fichier 1_DEMO-30\.feature : 2 scénarios$/m.test(r.sortie), r.sortie + r.erreurs);
      const t33 = lire(d, 'DEMO-33.scenario');
      controle('provenance d\'un fichier : lot, scénario, source et son empreinte, contexte reporté (D17.INV-4)', t33.startsWith('# Importé d\'un fichier .feature par importer.mjs (scenario-playwright 1.2.0), sans IA : le scénario est recopié tel qu\'écrit dans le fichier.\n# Lot : fichier ../r22-sources/1_DEMO-30.feature\n# Scénario : @DEMO-33, 1_DEMO-30.feature\n') && t33.includes(`# Source : fichier ../r22-sources/1_DEMO-30.feature (sha256 ${sha(fX)})`) && /# Empreinte de la source : [0-9a-f]{64}\n/.test(t33) && t33.includes('# Contexte reporté en tête des étapes : 1 étape.'), t33);
      const lu33 = texte.analyserTexte(t33);
      controle('scénario recopié : fonctionnalité, étiquettes, contexte en tête des étapes, colonnes d\'exemples adaptées', lu33.erreurs.length === 0 && lu33.scenario.fonctionnalite === 'Gérer les clients' && JSON.stringify(lu33.scenario.etiquettes) === '["DEMO-33","DEMO-30","TEST_DEMO-33","REQ_DEMO-30"]' && lu33.scenario.etapes[0].phrase === 'je suis sur la page des clients' && JSON.stringify(Object.keys(lu33.scenario.jeux?.[0] ?? {})) === '["nom_du_client"]', JSON.stringify(lu33.erreurs));
      const fZ = fichier('zephyr-export.feature', 'Feature: Export\n  @TestCaseKey=DEMO-T7 @export\n  Scenario: Exporter les clients\n    Given I am on the export page\n    When I click the link "Export as CSV"\n    Then the file "clients.csv" is downloaded\n');
      r = await lancer('importer.mjs', [fZ, '--adresse', base, '--dossier', d]);
      controle('export de Zephyr Scale : texte nommé par la clé du cas de test, @TestCaseKey= gardé', r.code === 0 && JSON.stringify(etatsDe(r.sortie)) === '["écrit DEMO-T7"]' && lire(d, 'DEMO-T7.scenario').includes('\n@DEMO-T7 @TestCaseKey=DEMO-T7 @export\nScenario: Exporter les clients\n'), r.sortie + r.erreurs);
      const PARCOURS = (fin) => `# language: fr\n@DEMO-8\nFonctionnalité: Parcours\n  @DEMO-40\n  Scénario: Ouvrir la liste\n    Quand je clique sur le lien « Clients »\n    Alors je vois le titre « Clients »\n\n  @DEMO-40\n  Scénario: Revenir à l'accueil\n    Quand je clique sur le lien « Accueil »\n    Alors je vois le titre « Démonstration »\n${fin}`;
      const fP = fichier('parcours.feature', PARCOURS('\n  Scénario: Sans étiquette\n    Quand je regarde la page\n'));
      r = await lancer('importer.mjs', [fP, '--adresse', base, '--dossier', d]);
      controle('fichier du dépôt sans clé de test : étiquettes <fichier>-Snn attribuées, clé portée par deux titres écartée', r.code === 0 && JSON.stringify(etatsDe(r.sortie)) === '["écrit parcours-S01","écrit parcours-S02","écrit parcours-S03"]' && lire(d, 'parcours-S01.scenario').includes('# Étiquette @parcours-S01 attribuée par l\'import, la source n\'en donnant pas : l\'écrire dans le fichier, avant le titre du scénario, la fixe.'), r.sortie + r.erreurs);
      const v = await lancer('verifier.mjs', readdirSync(d).filter((f) => f.endsWith('.scenario')).map((f) => join(d, f)));
      controle('les textes importés de fichiers passent verifier.mjs', v.code === 0 && (v.sortie.match(/^ok /gm) ?? []).length === 6, v.sortie + v.erreurs);
      const avant = empreintes(d);
      r = await lancer('importer.mjs', [fP, '--adresse', base, '--dossier', d]);
      controle('réimport sans changement : textes inchangés, non réécrits, code 0', r.code === 0 && etatsDe(r.sortie).length === 3 && etatsDe(r.sortie).every((x) => x.startsWith('inchangé')) && empreintes(d) === avant, r.sortie);
      writeFileSync(fP, PARCOURS('\n  Scénario: Nouveau parcours\n    Quand je clique sur le lien « Export »\n').replace('Alors je vois le titre « Clients »', 'Alors je vois le tableau « Liste des clients »'));
      r = await lancer('importer.mjs', [fP, '--comparer', '--dossier', d]);
      controle('--comparer après changement du fichier : modifié, identique, nouveau sur un numéro libre, disparu, code 1', r.code === 1 && JSON.stringify(etatsDe(r.sortie)) === '["modifié parcours-S01","identique parcours-S02","nouveau parcours-S04","disparu parcours-S03"]' && /changé dans le fichier depuis l'import/.test(r.sortie) && /le scénario n'est plus dans le fichier/.test(r.sortie) && empreintes(d) === avant, r.sortie);
      const fB = fichier('FeatureBundle.zip', enZip([
        { nom: '1_DEMO-30.feature', contenu: XRAY },
        { nom: '2_DEMO-35.feature', contenu: '@DEMO-35\nFeature: Clients actifs\n  @DEMO-32 @DEMO-35\n  Scenario: Créer un client\n    When je clique sur le lien « Nouveau client »\n  @DEMO-36\n  Scenario: Voir la liste\n    Then je vois le tableau « Liste des clients »\n', methode: 0 },
        { nom: 'notes.txt', contenu: 'export du 20 novembre' },
        { nom: '__MACOSX/._1_DEMO-30.feature', contenu: 'x' },
      ]));
      r = await lancer('importer.mjs', [fB, '--adresse', base, '--dossier', d]);
      controle('archive d\'un export : même test retrouvé d\'un autre chemin d\'import, inchangé ; test présent dans deux fichiers, doublon ; code 1 (D17.INV-4)', r.code === 1 && JSON.stringify(etatsDe(r.sortie)) === '["inchangé DEMO-32","inchangé DEMO-33","doublon DEMO-32","écrit DEMO-36"]' && /^Archive FeatureBundle\.zip : 2 fichiers \.feature, 4 scénarios \(1_DEMO-30\.feature : 2, 2_DEMO-35\.feature : 2\)$/m.test(r.sortie), r.sortie + r.erreurs);
      controle('fichiers de l\'archive qui ne sont pas des .feature signalés en limite', /LIMITE 2 fichiers de l'archive ignorés : notes\.txt, __MACOSX\/\._1_DEMO-30\.feature \(seuls les \.feature sont lus\)/.test(r.sortie), r.sortie);
      const t36 = lire(d, 'DEMO-36.scenario');
      controle('texte d\'une archive : lot et source de l\'archive, scénario désigné par son fichier', t36.includes('# Lot : archive ../r22-sources/FeatureBundle.zip\n# Scénario : @DEMO-36, 2_DEMO-35.feature\n') && t36.includes(`# Source : archive ../r22-sources/FeatureBundle.zip (sha256 ${sha(fB)})`), t36);
      r = await lancer('importer.mjs', [fichier('chiffre.zip', enZip([{ nom: 'a.feature', contenu: 'x', chiffre: true }, { nom: 'b.feature', contenu: 'Feature: B\n  @DEMO-37\n  Scenario: C\n    When je regarde\n' }])), '--adresse', base, '--dossier', join(TMP, 'r22-chiffre')]);
      controle('fichier chiffré de l\'archive signalé, les autres importés', r.code === 0 && /LIMITE a\.feature : chiffré, non lu/.test(r.sortie) && JSON.stringify(etatsDe(r.sortie)) === '["écrit DEMO-37"]', r.sortie + r.erreurs);
      r = await lancer('importer.mjs', [fichier('vide.feature', 'Feature: Rien\n  Une description seulement.\n'), '--adresse', base, '--dossier', join(TMP, 'r22-vide')]);
      controle('fichier sans scénario : rien d\'écrit, code 1', r.code === 1 && /Bilan : aucun scénario Gherkin trouvé dans le fichier/.test(r.sortie) && !existsSync(join(TMP, 'r22-vide')), r.sortie);
      const refuse = join(TMP, 'r22-refus');
      const casRefus = [
        [[fichier('abime.zip', enZip([{ nom: 'a.feature', contenu: 'Feature: A\n  Scenario: B\n    When c\n', crc: 7 }])), '--adresse', base, '--dossier', refuse], 'contenu altéré (CRC-32)'],
        [[fichier('faux.zip', 'pas une archive'), '--adresse', base, '--dossier', refuse], 'n\'est pas une archive .zip'],
        [[join(sources, 'absent.feature'), '--adresse', base, '--dossier', refuse], 'fichier introuvable'],
        [[fP, '--adresse', base, '--commentaires', '--dossier', refuse], 'pour une demande Jira seulement'],
        [[fP, '--adresse', base, '--api', 'https://jira.exemple.test', '--dossier', refuse], '--api : pour xray:'],
        [[fP, '--dossier', refuse], '--adresse attend'],
      ];
      for (const [args, motif] of casRefus) {
        const x = await lancer('importer.mjs', args);
        controle(`refus avant toute écriture, code 2 : ${motif}`, x.code === 2 && x.erreurs.includes(motif) && !existsSync(refuse), x.sortie + x.erreurs);
      }
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R23', 'Xray Cloud et Data Center par l\'API, en lecture seule : Cucumber recopié, test manuel converti pas à pas, Generic refusé, test introuvable, clé du test pour identité');
    {
      const env = { ...ENV, ...JETONS_FACTICES };
      const d = join(TMP, 'r23');
      const fE = join(TMP, 'r23-export.feature');
      writeFileSync(fE, 'Feature: Clients\n  @DEMO-12\n  Scenario: Créer un client depuis la liste\n    Given je suis sur la page des clients\n    When je clique sur le lien « Nouveau client »\n');
      let r = await lancer('importer.mjs', [fE, '--adresse', base, '--dossier', d]);
      controle('test DEMO-12 importé d\'abord d\'un fichier .feature', r.code === 0 && JSON.stringify(etatsDe(r.sortie)) === '["écrit DEMO-12"]', r.sortie + r.erreurs);
      app.etat.requetesOutils.length = 0;
      r = await lancer('importer.mjs', ['xray:DEMO-12,DEMO-13,DEMO-14,DEMO-15,DEMO-16', '--api', outils, '--adresse', base, '--dossier', d], { env });
      sorties.push(r.sortie + r.erreurs);
      controle('Xray Cloud : tests lus par l\'API GraphQL, un état par test, code 1 (D17.INV-1)', r.code === 1 && r.sortie.includes(`Xray Cloud (${outils}) : 5 tests demandés, 4 lus (2 Cucumber, 1 manuel, 1 Generic)`) && JSON.stringify(etatsDe(r.sortie)) === '["modifié DEMO-12","écrit DEMO-13","refusé DEMO-14","écrit DEMO-16","introuvable DEMO-15"]', r.sortie + r.erreurs);
      controle('même clé de test, d\'un autre chemin d\'import : modifié, pas en conflit (D17.INV-4)', /modifié\s+@DEMO-12 .*changé dans Xray depuis l'import ; --remplacer/.test(r.sortie), r.sortie);
      controle('test Generic refusé avec son motif ; test introuvable avec la réponse de Xray (D17.INV-5)', /refusé\s+@DEMO-14\s+Relire les journaux : test Generic : définition en texte libre/.test(r.sortie) && /introuvable @DEMO-15\s+An issue with key 'DEMO-15' does not exist/.test(r.sortie), r.sortie);
      const t13 = lire(d, 'DEMO-13.scenario');
      controle('test manuel : chaque pas en « Quand <action> », avec ses données, puis « Alors <résultat attendu> », signalé en tête (D17.INV-5)', t13.startsWith('# Importé de Xray par importer.mjs (scenario-playwright 1.2.0), sans IA : chaque pas du test manuel devient « Quand <action> », avec ses données, puis « Alors <résultat attendu> ».\n# Lot : xray DEMO-13\n# Scénario : @DEMO-13, test manuel DEMO-13\n') && t13.includes('\n@DEMO-13\nScénario: Exporter les clients\n') && t13.includes('  Quand Ouvrir la page « Export »\n  Alors La page « Export » s\'affiche\n  Quand Cliquer sur le lien « Exporter en CSV », avec « format CSV ; séparateur ; »\n  Alors Le fichier « clients.csv » est téléchargé\n'), t13);
      const appel = await lancer('importer.mjs', ['xray:DEMO-17', '--api', outils, '--adresse', base, '--dossier', join(TMP, 'r23-appel')], { env });
      sorties.push(appel.sortie + appel.erreurs);
      controle('pas vide, l\'appel d\'un autre test peut-être : test refusé, rien n\'est deviné (D17.INV-5)', appel.code === 1 && JSON.stringify(etatsDe(appel.sortie)) === '["refusé DEMO-17"]' && /refusé\s+@DEMO-17\s+Exporter, puis rejouer un autre test : pas 2 vide/.test(appel.sortie) && !existsSync(join(TMP, 'r23-appel')), appel.sortie + appel.erreurs);
      const t16 = lire(d, 'DEMO-16.scenario');
      controle('test Cucumber qui porte son titre : recopié tel quel', t16.includes('\n@DEMO-16\nScenario: Back to home\n') && t16.includes('  Given I am on the export page\n'), t16);
      r = await lancer('importer.mjs', ['xray:DEMO-12,DEMO-13,DEMO-16', '--api', outils, '--adresse', base, '--dossier', d, '--remplacer'], { env });
      sorties.push(r.sortie + r.erreurs);
      const t12 = lire(d, 'DEMO-12.scenario');
      controle('--remplacer : texte remplacé par celui de Xray, titre formé du résumé, plan du scénario, étiquettes de Jira, préconditions signalées', r.code === 0 && JSON.stringify(etatsDe(r.sortie)) === '["remplacé DEMO-12","inchangé DEMO-13","inchangé DEMO-16"]' && t12.includes('# Lot : xray DEMO-12\n') && t12.includes('# Préconditions dans Xray, non reprises : DEMO-11 ;') && t12.includes('\n@DEMO-12 @crm @non-regression\nPlan du scénario: Créer un client depuis la liste\n') && !readdirSync(d).some((f) => f.includes('.avant-')), r.sortie + t12);
      const v = await lancer('verifier.mjs', ['DEMO-12', 'DEMO-13', 'DEMO-16'].map((n) => join(d, `${n}.scenario`)));
      controle('les textes importés de Xray passent verifier.mjs', v.code === 0 && (v.sortie.match(/^ok /gm) ?? []).length === 3, v.sortie + v.erreurs);
      r = await lancer('importer.mjs', ['xray:DEMO-12,DEMO-13,DEMO-14', '--api', outils, '--comparer', '--dossier', d], { env });
      sorties.push(r.sortie + r.erreurs);
      controle('--comparer : identiques, test refusé compté non importable, code 1', r.code === 1 && /Bilan : 2 identiques, 0 modifié, 0 nouveau, 0 disparu, 1 non importable/.test(r.sortie), r.sortie);
      const dc = join(TMP, 'r23-dc');
      mkdirSync(dc, { recursive: true });
      writeFileSync(join(dc, 'DEMO-16.scenario'), `Scénario: Écrit à la main\n  Adresse : ${base}\n  Quand je regarde\n`);
      r = await lancer('importer.mjs', ['xray-dc:DEMO-12,DEMO-13,DEMO-16,DEMO-24,DEMO-25', '--api', outils, '--adresse', base, '--dossier', dc], { env });
      sorties.push(r.sortie + r.erreurs);
      controle('Xray Data Center : résumé par l\'API de Jira, test par l\'API de Xray ; texte écrit à la main jamais remplacé ; demande absente, demande qui n\'est pas un test', r.code === 1 && r.sortie.includes(`Xray Data Center (${outils}) : 5 tests demandés, 3 lus (2 Cucumber, 1 manuel)`) && JSON.stringify(etatsDe(r.sortie)) === '["écrit DEMO-12","écrit DEMO-13","conflit DEMO-16","introuvable DEMO-24","introuvable DEMO-25"]' && lire(dc, 'DEMO-16.scenario').startsWith('Scénario: Écrit à la main'), r.sortie + r.erreurs);
      controle('même test, même texte et même empreinte, par Xray Cloud ou par Xray Data Center', corps(lire(dc, 'DEMO-13.scenario')) === corps(t13) && empreinteSource(lire(dc, 'DEMO-13.scenario')) === empreinteSource(t13) && lire(dc, 'DEMO-12.scenario').includes(`# Source : ${outils}/rest/raven/1.0/api/test?keys=DEMO-12`) && lire(dc, 'DEMO-12.scenario').includes('# Préconditions dans Xray, non reprises : DEMO-11'));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R24', 'Zephyr Scale Cloud et Data Center par l\'API, en lecture seule : BDD recopié, pas à pas converti depuis le HTML, pages suivies, texte libre et appel d\'un autre cas refusés');
    {
      const env = { ...ENV, ...JETONS_FACTICES };
      const d = join(TMP, 'r24');
      let r = await lancer('importer.mjs', ['zephyr:DEMO-T1,DEMO-T2,DEMO-T3,DEMO-T4,DEMO-T9', '--api', `${outils}/v2`, '--adresse', base, '--dossier', d], { env });
      sorties.push(r.sortie + r.erreurs);
      controle('Zephyr Scale Cloud : cas de test et scripts lus, un état par cas, code 1 (D17.INV-1)', r.code === 1 && r.sortie.includes(`Zephyr Scale Cloud (${outils}/v2) : 5 cas de test demandés, 4 lus (1 BDD, 2 pas à pas, 1 texte libre)`) && JSON.stringify(etatsDe(r.sortie)) === '["écrit DEMO-T1","écrit DEMO-T2","refusé DEMO-T3","refusé DEMO-T4","introuvable DEMO-T9"]', r.sortie + r.erreurs);
      const t1 = lire(d, 'DEMO-T1.scenario');
      controle('BDD recopié sous un titre formé du nom du cas, en anglais comme ses mots-clés ; précondition signalée', t1.includes('\n@DEMO-T1 @crm\nScenario: Ouvrir le formulaire\n') && t1.includes('# Précondition dans Zephyr Scale, non reprise : « Être connecté » ;') && t1.includes('  When je clique sur le lien « Nouveau client »\n'), t1);
      const t2 = lire(d, 'DEMO-T2.scenario');
      controle('pas à pas : HTML ramené au texte, lignes jointes par « ; », pas sans résultat sans « Alors » (D17.INV-5)', t2.includes('  Quand Ouvrir la page Export\n  Alors La page « Export » s’affiche\n  Quand Cliquer sur le lien « Exporter en CSV », avec « format CSV »\n  Alors Le fichier est téléchargé ; Il contient deux clients\n  Quand Revenir à l’accueil\n'), t2);
      const pages = app.etat.requetesOutils.filter((q) => q.chemin === '/v2/testcases/DEMO-T2/teststeps').map((q) => new URLSearchParams(q.requete).get('startAt'));
      controle('pas lus page après page, jusqu\'à la dernière', JSON.stringify(pages) === '["0","2"]', JSON.stringify(pages));
      controle('texte libre et appel d\'un autre cas refusés avec leur motif', /refusé\s+@DEMO-T3\s+Tout vérifier : script en texte libre/.test(r.sortie) && /refusé\s+@DEMO-T4\s+Appelle un autre cas : pas qui appelle le cas de test DEMO-T2/.test(r.sortie), r.sortie);
      const dc = join(TMP, 'r24-dc');
      r = await lancer('importer.mjs', ['zephyr-dc:DEMO-T1,DEMO-T2,DEMO-T3,DEMO-T4', '--api', outils, '--adresse', base, '--dossier', dc], { env });
      sorties.push(r.sortie + r.erreurs);
      controle('Zephyr Scale Data Center : mêmes états, même texte et même empreinte qu\'en Cloud', r.code === 1 && JSON.stringify(etatsDe(r.sortie)) === '["écrit DEMO-T1","écrit DEMO-T2","refusé DEMO-T3","refusé DEMO-T4"]' && corps(lire(dc, 'DEMO-T2.scenario')) === corps(t2) && empreinteSource(lire(dc, 'DEMO-T2.scenario')) === empreinteSource(t2) && lire(dc, 'DEMO-T1.scenario').includes(`# Source : ${outils}/rest/atm/1.0/testcase/DEMO-T1`), r.sortie + r.erreurs);
      const v = await lancer('verifier.mjs', [join(d, 'DEMO-T1.scenario'), join(d, 'DEMO-T2.scenario'), join(dc, 'DEMO-T1.scenario'), join(dc, 'DEMO-T2.scenario')]);
      controle('les textes importés de Zephyr Scale passent verifier.mjs', v.code === 0 && (v.sortie.match(/^ok /gm) ?? []).length === 4, v.sortie + v.erreurs);
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R25', 'Garde des jetons et de la lecture seule : variables d\'environnement seulement, https hors du poste, aucune redirection suivie, accès refusé, lectures seules, jetons jamais affichés');
    {
      const env = { ...ENV, ...JETONS_FACTICES };
      const sans = { ...ENV };
      for (const k of Object.keys(JETONS_FACTICES)) delete sans[k];
      const refuse = join(TMP, 'r25');
      const avant = app.etat.requetesOutils.length;
      const casRefus = [
        [['xray:DEMO-12', '--api', outils, '--adresse', base, '--dossier', refuse], sans, 'variables d\'environnement XRAY_CLIENT_ID et XRAY_CLIENT_SECRET absentes'],
        [['zephyr:DEMO-T1', '--api', `${outils}/v2`, '--adresse', base, '--dossier', refuse], sans, 'variable d\'environnement ZEPHYR_TOKEN absente'],
        [['xray-dc:DEMO-12', '--api', outils, '--adresse', base, '--dossier', refuse], sans, 'variable d\'environnement JIRA_TOKEN absente'],
        [['zephyr:DEMO-T1', '--api', 'http://zephyr.exemple.test/v2', '--adresse', base, '--dossier', refuse], env, 'https attendu'],
        [['xray-dc:DEMO-12', '--api', 'https://moi:motdepasse@jira.exemple.test', '--adresse', base, '--dossier', refuse], env, 'sans identifiant'],
        [['zephyr-dc:DEMO-T1', '--adresse', base, '--dossier', refuse], env, 'attend --api'],
        [['xray:demo-12', '--adresse', base, '--dossier', refuse], env, 'clé de test invalide'],
        [['xray:DEMO-12', '--api', outils, '--commentaires', '--adresse', base, '--dossier', refuse], env, 'pour une demande Jira seulement'],
        [['zephyr:DEMO-T1', '--api', `${outils}/v2`, '--adresse', base, '--dossier', refuse], { ...env, ZEPHYR_TOKEN: 'jeton colle\tavec une tabulation' }, 'variable d\'environnement ZEPHYR_TOKEN : valeur invalide'],
      ];
      for (const [args, e, motif] of casRefus) {
        const x = await lancer('importer.mjs', args, { env: e });
        sorties.push(x.sortie + x.erreurs);
        controle(`refus avant toute requête et toute écriture, code 2 : ${motif}`, x.code === 2 && x.erreurs.includes(motif) && !existsSync(refuse) && !x.erreurs.includes('motdepasse') && !x.erreurs.includes('jeton colle'), x.sortie + x.erreurs);
      }
      controle('aucune requête aux API avant ces refus (D17.INV-3)', app.etat.requetesOutils.length === avant, JSON.stringify(app.etat.requetesOutils.slice(avant)));
      app.etat.requetesAutre.length = 0;
      let r = await lancer('importer.mjs', ['zephyr:DEMO-T1,DEMO-T99', '--api', `${outils}/v2`, '--adresse', base, '--dossier', refuse], { env });
      sorties.push(r.sortie + r.erreurs);
      controle('redirection refusée : le jeton ne joint jamais l\'autre origine ; rien d\'écrit, même après une lecture réussie ; code 2 (D17.INV-3)', r.code === 2 && r.erreurs.includes(`redirection vers ${autre} refusée`) && app.etat.requetesAutre.length === 0 && !existsSync(refuse), r.sortie + r.erreurs + JSON.stringify(app.etat.requetesAutre));
      r = await lancer('importer.mjs', ['xray-dc:DEMO-12', '--api', outils, '--adresse', base, '--dossier', refuse], { env: { ...env, JIRA_TOKEN: 'jeton-perime' } });
      sorties.push(r.sortie + r.erreurs);
      controle('jeton refusé par l\'API : accès refusé (401), code 2', r.code === 2 && /accès refusé \(401\) : jeton absent, expiré ou sans droit de lecture/.test(r.erreurs) && !r.erreurs.includes('jeton-perime'), r.erreurs);
      r = await lancer('importer.mjs', ['xray:DEMO-12', '--api', outils, '--adresse', base, '--dossier', refuse], { env: { ...env, XRAY_CLIENT_SECRET: 'secret-revoque' } });
      sorties.push(r.sortie + r.erreurs);
      controle('identifiants de Xray Cloud refusés : accès refusé (401), code 2', r.code === 2 && /authenticate : accès refusé \(401\)/.test(r.erreurs) && !r.erreurs.includes('secret-revoque'), r.erreurs);
      const requetes = app.etat.requetesOutils;
      const ecritures = requetes.filter((q) => q.methode !== 'GET' && !(q.methode === 'POST' && ['/api/v2/authenticate', '/api/v2/graphql'].includes(q.chemin)));
      const graphql = requetes.filter((q) => q.chemin === '/api/v2/graphql');
      const lecture = (q) => { try { const b = JSON.parse(q.corps); return /^query\b/.test(b.query) && !/mutation/i.test(b.query); } catch { return false; } };
      controle('lecture seule : des GET, et pour Xray Cloud l\'authentification et des requêtes GraphQL « query », jamais « mutation » (D17.INV-2)', requetes.length > 30 && ecritures.length === 0 && graphql.length > 0 && graphql.every(lecture), JSON.stringify(ecritures));
      const valeurs = [...Object.values(JETONS_FACTICES), SESSION_XRAY];
      controle('jetons dans l\'en-tête Authorization seulement, jamais dans une adresse ; secret de Xray Cloud dans l\'authentification seulement (D17.INV-3)', requetes.every((q) => !valeurs.some((j) => `${q.chemin}${q.requete}`.includes(j))) && requetes.filter((q) => q.corps.includes(JETONS_FACTICES.XRAY_CLIENT_SECRET)).every((q) => q.chemin === '/api/v2/authenticate') && requetes.filter((q) => q.autorisation).every((q) => /^Bearer \S+$/.test(q.autorisation)));
      const ecrits = ['r23', 'r23-dc', 'r24', 'r24-dc'].flatMap((x) => (existsSync(join(TMP, x)) ? readdirSync(join(TMP, x), { withFileTypes: true }).filter((f) => f.isFile()).map((f) => readFileSync(join(TMP, x, f.name), 'utf8')) : []));
      controle('aucun jeton affiché, ni écrit dans un texte importé (D17.INV-3)', sorties.length > 15 && !sorties.some((s) => valeurs.some((j) => s.includes(j))) && ecrits.length > 6 && !ecrits.some((t) => valeurs.some((j) => t.includes(j))));
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

    f6996c2380877840bf9742597e6eb658caff97026081ecf185a327c7a2dc09f4  manifest.json
    bd5afbf15b56158ed4c48c75818c36f238bb4df4ed5476548dfcc84754079b84  SKILL.md
    e237c256edf7b817760598cef23c3d74ca32fda738ebd6cafd1a8193842c67ac  modules/execution/SKILL.md
    fc9bb43dab8252a41f4e455de48aee80ea22b186be7a5099365529f184eefa4e  modules/texte/SKILL.md
    966d211160dd5ca3044e9a085a3a84e23f1a59c24bca7de5fbc69a0914d1190c  modules/jira/SKILL.md
    69a8e54e96d84d3457054b1a4e49d186042757348b13a4ae49219226f9e497dd  modules/cas-de-test/SKILL.md
    21518ec85562fdefa9dd2b31d40a744d4a1643defcef68f50b32a0bdececb349  modules/scenario/SKILL.md
    8cee7712656889faf26dfee89eb2346f6ac0971a798b5f4ad8c9fb75784f5f43  modules/cibles/SKILL.md
    d9325724a7c08c369724fe7b2ea0629b6e37127a0b65de16eba4b48cc4f41495  modules/actions/SKILL.md
    4a1283d60c16f0bd624ee59044e8bc53d0776375d51d46595599bcc45bd3fedc  modules/session/SKILL.md
    18b6e5a67ad2b51e1ec74b1ecacd714b9139e0f9ae64f40fd0ae7abb8fe9a96e  modules/garde/SKILL.md
    817eb2f3c456e192a8f6218942cb2ed180027de6ca915d2a8e52edf908c5453f  modules/preuves/SKILL.md
    4d8cb363549f37f2c85e6e75516742228acb3111e03ce315463e9027f0d0b4af  modules/designer/SKILL.md
    caf3963653a038c3b03afb25cd615398de6ba8bfbaed3bfbbd5567f4035454b9  modules/agent/SKILL.md
    cfda053e7da1d40997255a1780ca0f5b2cd855ec74a4ca767fdb3753e6a76439  modules/recette/SKILL.md
    4966e366878732544faa9f20e65580a7348426d4e4c2a2b5f789dee4d59ce079  modules/traduction-auto/SKILL.md
    9dd5d57ca1b658cb15c7c1999ccfd94cb41491e0af15bbe151812f07d45929fc  modules/demo/SKILL.md
    4a202c9718112813a20437b56e250422013bebdfceee7f971922d246a4d2d606  modules/remise/SKILL.md
    57eacdcf16ab38f69372bdce72f691f5ec0873bf6fd6261649bdec1fdc579ade  modules/accessibilite/SKILL.md
    2b2318986a68ec6e2f95279068640cf96e605d777f9f4341d47909f3e74bbcf0  modules/enregistrement/SKILL.md
