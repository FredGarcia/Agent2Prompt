# Capture des tickets d'un sprint Jira derrière un SSO : skill capture-sprint-jira 1.0.0, transmission texte

Ce texte contient à la fois la consigne de travail et le skill complet. Il n'y a aucune pièce jointe. Le skill est découpé en fichiers, chacun délimité ainsi :

    <<<FICHIER chemin/relatif>>>
    ...contenu exact du fichier...
    <<<FIN chemin/relatif>>>

---

À partir de maintenant, tu installes le skill capture-sprint-jira décrit par ce texte sur le poste du développeur, tu le fais fonctionner, puis tu peux agir comme son agent de capture. Le skill fait foi. Si tu relèves une ambiguïté ou une contradiction dans le skill, signale-la au développeur. Ne corrige pas le skill toi-même, ni ses scripts.

## Étape 0 : matérialiser le skill

1. Le skill ne dépend d'aucun projet. Crée le dossier `.skills/capture-sprint-jira/` à l'emplacement que le développeur indique ; à défaut, dans son dossier personnel (`%USERPROFILE%\.skills\capture-sprint-jira\` sous Windows, `~/.skills/capture-sprint-jira/` ailleurs). Sous Windows, avec WSL2, choisis le côté où Chrome est installé : en général Windows. Si le dossier est dans un dépôt git, ajoute `/.skills/` à `.git/info/exclude` s'il n'y est pas.
2. Pour chaque bloc `<<<FICHIER chemin>>>` … `<<<FIN chemin>>>`, crée le fichier `chemin` dans ce dossier, avec le contenu exact compris entre les deux lignes délimitrices. Ces deux lignes ne font pas partie du fichier. Ne reformule rien, ne traduis rien, ne complète rien.
3. Si tu disposes d'un shell, vérifie chaque fichier avec `sha256sum -c` contre la table d'intégrité en fin de texte ; sous Windows, Git Bash fournit `sha256sum`, et `certutil -hashfile <fichier> SHA256` donne l'empreinte d'un fichier depuis CMD. Signale tout écart avant de continuer.

## Étape 1 : lecture

Lis `SKILL.md`, `manifest.json`, puis les modules actifs dans l'ordre indiqué par `SKILL.md`, section 1. Ne lis `modules/remise/SKILL.md` et `modules/pilotage/SKILL.md` que pour comprendre les points d'extension : ces dimensions sont réservées.

## Étape 2 : fichiers exécutables et recette

1. Depuis le dossier du skill, écris les fichiers exécutables à partir des blocs annotés des modules, par la commande d'extraction du module `execution`, § 8. Elle se colle telle quelle dans bash, CMD ou PowerShell. Ne recopie pas les fichiers à la main.
2. La commande vérifie elle-même leurs empreintes : elle écrit `conforme` pour chaque fichier, ou `ECART` ou `ABSENT`, et sort alors avec le code 1. Un écart arrête l'installation.
3. Vérifie la version de Node (20 ou plus récent), puis installe la dépendance : `npm ci`. Elle ne télécharge aucun navigateur ; Chrome doit être installé sur le poste (module `execution`, § 2).
4. Lance la recette : `npm test` ; sous Linux sans écran, `xvfb-run -a npm test`. Attendu : 19 scénarios, 108 contrôles réussis, aucun échec ; sans Python, R7 est sauté. Rapporte au développeur le bilan ; un échec arrête l'installation et se rapporte tel quel, sans modifier les scripts.

## Étape 3 : l'agent

Propose au développeur d'installer l'agent `agent/capteur-sprint.md` (module `agent`, § 2) : dans `.claude/agents/` pour Claude Code, ou comme consigne système dans son outil. Rejoue avec lui les scénarios A1 à A5 du module `agent` avant la première capture d'un sprint réel.

## Étape 4 : première capture, avec le développeur

1. Lance l'interface (`npm run capture`) et donne au développeur l'adresse http://127.0.0.1:3100.
2. Il y saisit lui-même l'adresse de la page du sprint, le préfixe des clés, les numéros, les catégories et le dossier de sortie ; la page les garde dans son navigateur.
3. Il ouvre le sprint, se connecte dans la fenêtre, puis lance la capture. Examine ensuite avec lui chaque ticket à classer et chaque erreur du rapport.

## Règles qui ne se négocient pas

- Tu ne demandes, ne lis et ne saisis aucun identifiant : le développeur se connecte lui-même dans la fenêtre du navigateur.
- Tu n'écris ni l'adresse, ni le préfixe, ni les numéros du Jira du développeur dans un fichier du skill ou d'un dépôt.
- Tu ne déplaces aucun fichier capturé d'un dossier de catégorie à l'autre sans l'accord du développeur.
- Tu n'adaptes pas les scripts : un écart, une erreur ou un besoin nouveau se signale au développeur.
- N'applique aucune dimension au statut `reserved`.

Commence par l'étape 0, puis l'étape 1, puis l'étape 2.

---

# Skill

<<<FICHIER manifest.json>>>
{
  "name": "capture-sprint-jira",
  "version": "1.0.0",
  "specSchema": 1,
  "language": "fr",
  "description": "Capture en MHTML des tickets du prochain sprint d'un Jira protégé par un SSO, rangés dans un dossier par catégorie : connexion faite à la main dans le navigateur du poste, relevé et filtre des tickets, une page MHTML par ticket, classement par terme clé, rapport, interface locale, ligne de commande, agent capteur-sprint, export par l'API REST sans SSO.",
  "entry": "SKILL.md",
  "targets": {
    "node": ">=20",
    "dependencies": "playwright-core 1.63.0, seule dépendance",
    "browser": "Chrome installé sur le poste, ou Edge, ou le Chromium de Playwright",
    "python": "3, pour le seul script d'export facultatif ; recette essayée avec 3.13",
    "os": "Windows natif, Linux et WSL2 ; recette en CI sur ubuntu-latest et windows-latest"
  },
  "modules": [
    { "id": "execution", "path": "modules/execution/SKILL.md", "dimensions": ["D1"], "status": "active" },
    { "id": "session", "path": "modules/session/SKILL.md", "dimensions": ["D2"], "status": "active" },
    { "id": "releve", "path": "modules/releve/SKILL.md", "dimensions": ["D3"], "status": "active" },
    { "id": "capture", "path": "modules/capture/SKILL.md", "dimensions": ["D4"], "status": "active" },
    { "id": "classement", "path": "modules/classement/SKILL.md", "dimensions": ["D5"], "status": "active" },
    { "id": "interface", "path": "modules/interface/SKILL.md", "dimensions": ["D6"], "status": "active" },
    { "id": "agent", "path": "modules/agent/SKILL.md", "dimensions": ["D7"], "status": "active" },
    { "id": "export-api", "path": "modules/export-api/SKILL.md", "dimensions": ["D8"], "status": "active" },
    { "id": "recette", "path": "modules/recette/SKILL.md", "dimensions": ["D1", "D2", "D3", "D4", "D5", "D6", "D8"], "status": "active" },
    { "id": "remise", "path": "modules/remise/SKILL.md", "dimensions": ["D9"], "status": "reserved" },
    { "id": "pilotage", "path": "modules/pilotage/SKILL.md", "dimensions": ["D10"], "status": "reserved" }
  ],
  "extensionPoints": ["E1", "E2"],
  "previousVersions": []
}
<<<FIN manifest.json>>>

<<<FICHIER SKILL.md>>>
---
name: capture-sprint-jira
description: Capture en MHTML des tickets du prochain sprint d'un Jira protégé par un SSO, rangés dans un dossier par catégorie (connexion faite à la main dans le navigateur du poste, profil dédié, relevé des liens de la page du sprint, filtre par préfixe de clé et plage de numéros, une page MHTML par ticket, classement par terme clé, dossier « à classer », rapport JSON, interface locale et ligne de commande, agent capteur-sprint, export par l'API REST quand un mot de passe ou un jeton est accepté). À utiliser pour récupérer les tickets d'un sprint avant de les analyser, sans les enregistrer un à un à la main.
version: 1.0.0
---

# Capture des tickets d'un sprint Jira, version 1.0.0

Ce document est le point d'entrée du skill. Le skill enregistre en MHTML, comme « Enregistrer sous… » de Chrome, chaque ticket du prochain sprint d'un Jira protégé par un SSO, et le range dans le dossier de sa catégorie (par défaut `ticket avec ia` et `ticket sans ia`). Le développeur se connecte lui-même dans une fenêtre du navigateur de son poste ; le skill ne voit aucun identifiant. Les fichiers produits sont ceux qu'attend l'ingestion d'`agent-tdd-jira`. Les règles détaillées sont dans `modules/`.

## 1. Ordre de lecture

1. Ce document, en entier.
2. `manifest.json` : modules, versions visées, plateformes.
3. Les modules actifs, dans cet ordre : `execution`, `session`, `releve`, `capture`, `classement`, `interface`, `agent`, `export-api`, `recette`.
4. `modules/remise/SKILL.md` et `modules/pilotage/SKILL.md` : seulement pour comprendre les points d'extension. Ne pas les appliquer en 1.x.

## 2. Ce que fait le skill

| Outil | Commande, depuis le dossier du skill | Rôle | Module |
|---|---|---|---|
| Interface de capture | `npm run capture`, puis http://127.0.0.1:3100 | ouvre le sprint, capture les tickets en tâche de fond, affiche l'avancement et le rapport | `interface` |
| Capture en ligne de commande | `npm run capture:cli -- "<page du sprint>" [options]` | la même capture, Entrée dans le terminal remplaçant le bouton | `interface` |
| Module commun | `scripts/jira-capture-core.mjs` | navigateur, relevé, capture, classement, rapport | `execution` |
| Export par l'API | `npm run export`, ou `scripts/jira_sprint_export.py` | tableau et CSV des tickets, quand Jira accepte un mot de passe ou un jeton | `export-api` |
| Recette | `npm test` | 19 scénarios contre un faux Jira local | `recette` |
| Agent | `agent/capteur-sprint.md` | pilote l'interface pour le développeur et rend le bilan | `agent` |

```mermaid
flowchart LR
  DEV["Développeur"] -->|"adresse, préfixe, numéros,<br/>catégories, dossier"| UI["Interface locale<br/>127.0.0.1:3100"]
  DEV -.->|"connexion SSO à la main"| NAV
  UI --> NAV["Navigateur du poste<br/>profil dédié .jira-profile/"]
  NAV -->|"page du sprint"| REL["Relevé des liens<br/>/browse/CLÉ, filtre"]
  REL -->|"un ticket à la fois"| CAP["Page du ticket<br/>attente, défilement, MHTML"]
  CAP --> CLS{"terme clé<br/>dans la page ?"}
  CLS -->|"un seul"| CAT["dossier de la catégorie"]
  CLS -->|"aucun ou plusieurs"| AC["à classer"]
  CAT --> RAP["rapport.json"]
  AC --> RAP
  RAP --> AG["Agent capteur-sprint<br/>bilan au développeur"]
  CAT -.->|"MHTML, réservé D9"| TDD["agent-tdd-jira<br/>ingestion"]
```

## 3. Ce que produit une capture

Dans le dossier de sortie choisi, directement :

```text
<dossier de sortie>/
  ticket avec ia/ABCDE-3512.mhtml   un fichier par ticket, dans le dossier de sa catégorie
  ticket sans ia/ABCXY-3520.mhtml
  à classer/ABCDE-3530.mhtml        aucun terme clé trouvé dans la page, ou plusieurs
  sprint.mhtml                      la page du sprint, d'où viennent les liens
  rapport.json                      la dernière capture : filtre, catégories, et pour chaque ticket
                                    sa catégorie, l'endroit et l'extrait où le terme a été trouvé, ou son erreur
```

Une nouvelle capture dans le même dossier remplace le fichier de chaque ticket recapturé et retire sa copie d'un autre dossier de catégorie (D5.INV-4). Le dossier de sortie se choisit dans l'interface ; par défaut, c'est `mhtml/` dans le dossier du skill.

## 4. Cycle 7E

| Phase | Ce qu'elle désigne ici | Modules |
|---|---|---|
| Éléments | les tickets : clés, liens, pages, termes clés | `releve`, `classement` |
| Espace | la page du sprint, le profil du navigateur, le dossier de sortie | `session`, `releve`, `execution` |
| Engendrent | les relations : lien vers ticket, ticket vers catégorie, capture vers rapport | `releve`, `classement` |
| État | l'avancement de la capture, la session SSO, le contenu du dossier de sortie | `capture`, `session`, `interface` |
| Expression | les fichiers MHTML, `rapport.json`, la page de l'interface, le bilan de l'agent | `capture`, `classement`, `interface`, `agent` |
| Évolutif | versions du skill, dimensions réservées D9 et D10, points d'extension E1 et E2 | `remise`, `pilotage` |
| Environnement | le Jira et son SSO, le navigateur du poste, le développeur qui se connecte et tranche, les agents qui lisent les captures | `session`, `agent` |

Clause de second ordre : le classement n'est pas neutre. Ce que le skill range dans `ticket avec ia` oriente la façon dont le ticket sera traité ensuite. Le skill ne devine donc jamais une catégorie : un ticket sans terme clé, ou avec plusieurs, va dans `à classer` (D5.INV-3), et le rapport montre l'extrait sur lequel repose chaque classement (D5.INV-6), pour que le développeur puisse le contester. De même, la navigation de Jira peut citer un terme ou un ticket sans rapport avec le sprint : elle n'est lue ni pour relever les tickets (D3.INV-1) ni pour les classer (D5.INV-2).

## 5. Registre des dimensions

| ID | Dimension | Introduite | Statut 1.0.0 | Dépend de | Module |
|---|---|---|---|---|---|
| D1 | Exécution : installation, dépendance, emplacements, réglages | 1.0 | active | | `execution`, `recette` |
| D2 | Session SSO : connexion à la main, profil dédié | 1.0 | active | D1 | `session`, `recette` |
| D3 | Relevé des tickets sur la page du sprint, filtre | 1.0 | active | D2 | `releve`, `recette` |
| D4 | Capture des pages de tickets en MHTML | 1.0 | active | D3 | `capture`, `recette` |
| D5 | Classement par catégorie, dossiers et rapport | 1.0 | active | D4 | `classement`, `recette` |
| D6 | Interfaces : page locale et ligne de commande | 1.0 | active | D3, D4, D5 | `interface`, `recette` |
| D7 | Agent capteur-sprint | 1.0 | active | D5, D6 | `agent` |
| D8 | Export par l'API REST, sans SSO | 1.0 | active | D1 | `export-api`, `recette` |
| D9 | Remise des tickets capturés à agent-tdd-jira | 1.0 | reserved | D5 | `remise` |
| D10 | Pilotage de la capture par un autre outil | 1.0 | reserved | D6 | `pilotage` |

## 6. Contrat de version et points d'extension

Le skill suit le contrat de version de `EVOLUTION.md` du dépôt Agent2Prompt. Il n'a ni base ni journal : le rapport d'une capture est son seul état écrit, et ses champs sont stables (E1).

Points d'extension, actifs depuis la version indiquée :

- **E1** (1.0.0) : `rapport.json` a des champs stables, au niveau de la capture (`date`, `sprintUrl`, `folder`, `filter`, `categories`, `listed`, `selected`, `ignored`, `ignoredSample`, `counts`, `errors`, `aborted`, `tickets`) et de chaque ticket (`key`, `url`, `category`, `found`, `where`, `excerpt`, `file`, `movedFrom`, ou `error`). D9 s'en servira pour remettre les tickets d'une catégorie à agent-tdd-jira sans relire les pages.
- **E2** (1.0.0) : la capture complète est une fonction du module commun, `captureSprintTickets(context, page, options)`, qui signale son avancement par `onProgress` et rend le rapport ; l'interface et la ligne de commande n'en sont que deux appelants. D10 en ajoutera d'autres, par exemple GeminiBoard pour Gemini CLI, sans modifier la capture.

## 7. Règles globales

- **Aucun identifiant** : la connexion se fait à la main, dans une fenêtre visible du navigateur ; aucun outil de capture ne demande, ne lit ni ne stocke d'identifiant (D2.INV-1).
- **Rien n'est deviné** : un ticket n'est classé que sur un terme clé trouvé, seul, dans sa page (D5.INV-3) ; une page qui n'est pas celle du ticket n'est pas capturée (D4.INV-1).
- **Les données du développeur restent chez lui** : captures, exports et session restent dans le dossier du skill ou le dossier choisi, que le `.gitignore` du skill écarte (D1.INV-2) ; l'adresse, le préfixe et les numéros du Jira du développeur ne sont écrits dans aucun fichier du skill (D6.INV-3, D7.INV-3).
- **Local seulement** : les interfaces écoutent sur `127.0.0.1` et contrôlent l'hôte, l'origine et le type de contenu de chaque requête (D6.INV-1).
- **Une dépendance** : Node 20 ou plus récent et `playwright-core` à version exacte, qui pilote le navigateur du poste (D1.INV-1).
- **Langue** : messages, documentation et commentaires en français ; identifiants du code en anglais.

## 8. Critères d'acceptation

- La recette du module `recette` passe en entier : `npm test`, 19 scénarios et 108 contrôles avec Python ; sans Python, R7 est sauté.
- La recette passe en intégration continue sur `ubuntu-latest` et `windows-latest`, avec Node 20 et Node 22, après extraction par la commande du module `execution`, § 8, sous bash et sous CMD, puis `npm ci`.
- Les fichiers tirés des modules ont exactement les empreintes de la table du module `execution`, § 8.
- Les scénarios A1 à A5 du module `agent` sont rejoués avec le développeur avant que l'agent capture un sprint réel.
- Une première capture d'un sprint réel est faite avec le développeur ; chaque ticket à classer ou en erreur est examiné avec lui.

## 9. Invariants

**D1 : exécution**

- **D1.INV-1** : le skill demande Node 20 ou plus récent et une seule dépendance, `playwright-core` à version exacte, qui pilote le navigateur installé sur le poste sans en télécharger ; Python 3 n'est demandé que par le script d'export facultatif.
- **D1.INV-2** : tout ce que le skill écrit par défaut reste dans son dossier : profil (`.jira-profile/`), captures (`mhtml/`) et exports (`exports/`) ; son `.gitignore` les écarte, avec `node_modules/` et tout fichier `.mhtml`.
- **D1.INV-3** : chaque réglage de déploiement se lit dans sa variable `JIRA_CAPTURE_CHANNEL`, `JIRA_CAPTURE_PROFILE` ou `JIRA_CAPTURE_PAGE_TIMEOUT_MS`, ou prend son défaut ; une variable vide vaut absente.

**D2 : session SSO**

- **D2.INV-1** : aucun outil de capture ne demande, ne lit ni ne stocke d'identifiant, de mot de passe ou de jeton : la connexion se fait à la main, dans une fenêtre visible du navigateur.
- **D2.INV-2** : la session vit dans un profil de navigateur dédié, réutilisé d'une ouverture à l'autre : un SSO aux cookies persistants ne redemande pas la connexion.

**D3 : relevé**

- **D3.INV-1** : la page du sprint défile par pas de 80 % de la hauteur affichée de chaque bloc qui défile, jusqu'à ce que, quatre pas de suite, rien ne défile plus et qu'aucun ticket nouveau n'apparaisse ; les liens `/browse/<CLÉ>` sont relevés à chaque pas, hors navigation (menus, éléments récents), si bien qu'une liste virtualisée ne fait perdre aucun ticket, même dans une petite fenêtre.
- **D3.INV-2** : un ticket est retenu si la partie projet de sa clé commence par le préfixe et si son numéro est entre les bornes, comprises ; un préfixe et des bornes vides retiennent tout ; une valeur invalide est refusée avant toute capture.
- **D3.INV-3** : chaque clé n'est capturée qu'une fois, quelle que soit la forme de ses liens (relatif, absolu, casse) ; les tickets retenus sont capturés un à un, par numéro croissant.

**D4 : capture**

- **D4.INV-1** : une page n'est capturée que si elle est celle du ticket : adresse `…/browse/<CLÉ>` ou titre qui la contient, et clé affichée ; sinon, passé le délai, le ticket est en erreur et rien n'est écrit pour lui.
- **D4.INV-2** : avant la capture, la page du ticket défile tant que son texte s'allonge, puis attend qu'il ne change plus : un contenu chargé à l'affichage figure dans le fichier.
- **D4.INV-3** : chaque fichier est un MHTML de Chrome, au format « Page Web, un seul fichier » d'« Enregistrer sous… », nommé par la clé du ticket.
- **D4.INV-4** : une erreur n'arrête pas la capture ; trois erreurs de suite, ou la fermeture du navigateur, l'arrêtent ; le rapport dit ce qui a été capturé et que la capture s'est arrêtée.

**D5 : classement**

- **D5.INV-1** : la catégorie d'un ticket est le terme clé trouvé dans sa page, sans tenir compte de la casse ni des accents, ses mots séparés par une espace, un tiret, un `_` ou rien, et pris entiers.
- **D5.INV-2** : les textes de la page sont lus dans cet ordre : contenu principal visible, contenu principal avec ses panneaux repliés, page visible hors navigation ; le premier qui contient un terme décide ; la navigation de Jira n'est jamais lue.
- **D5.INV-3** : un seul terme trouvé : le ticket va dans le dossier de sa catégorie ; aucun, ou plusieurs : dans `à classer` ; aucune catégorie n'est jamais devinée.
- **D5.INV-4** : les dossiers de catégorie sont créés directement dans le dossier de sortie choisi ; une nouvelle capture d'un ticket remplace son fichier et retire sa copie d'un autre dossier de catégorie ; un ticket en erreur garde sa capture précédente.
- **D5.INV-5** : une catégorie est un nom de dossier valide sous Windows et sous Linux ; une catégorie en double, ou nommée `à classer`, est refusée.
- **D5.INV-6** : chaque capture écrit `sprint.mhtml`, la page du sprint, et `rapport.json` : filtre, catégories et, pour chaque ticket, sa catégorie, l'endroit et l'extrait où le terme a été trouvé, ou son erreur.

**D6 : interfaces**

- **D6.INV-1** : les interfaces locales écoutent sur `127.0.0.1` seulement ; elles refusent un hôte autre que `127.0.0.1` ou `localhost` et une origine autre que la leur (403), et un corps qui n'est pas du JSON (415).
- **D6.INV-2** : une seule capture à la fois, en tâche de fond ; son avancement et son rapport se lisent par `GET /api/status` ; fermer le navigateur l'arrête.
- **D6.INV-3** : les valeurs saisies dans la page (adresse, préfixe, numéros, catégories, dossier) restent dans le navigateur du développeur, en stockage local ; le serveur ne les écrit que dans le rapport de la capture.
- **D6.INV-4** : après une capture sans erreur, le navigateur se ferme ; après une erreur ou un arrêt, il reste ouvert et revient à la page du sprint, pour une nouvelle tentative.
- **D6.INV-5** : la ligne de commande fait la même capture, avec les mêmes filtre, catégories et dossier de sortie ; elle sort avec le code 2 sur une option invalide, 1 si un ticket est en erreur, 0 sinon.

**D7 : agent capteur-sprint**

- **D7.INV-1** : l'agent ne demande, ne lit ni ne saisit aucun identifiant ; il laisse le développeur se connecter et attend sa confirmation avant de lancer la capture.
- **D7.INV-2** : l'agent rend le bilan du rapport (tickets par catégorie, tickets à classer avec ce qui a été trouvé, erreurs, arrêt) et ne déplace, ne renomme ni ne supprime aucun fichier capturé sans l'accord du développeur.
- **D7.INV-3** : l'agent n'écrit ni l'adresse, ni le préfixe, ni les numéros du Jira du développeur dans un fichier du skill ou d'un dépôt.

**D8 : export par l'API**

- **D8.INV-1** : l'identifiant, le mot de passe ou le jeton ne servent qu'à la requête en cours vers Jira : ils ne sont écrits ni sur le disque, ni dans un journal, ni dans une sortie.
- **D8.INV-2** : le prochain sprint est le sprint futur qui démarre le plus tôt ; la pagination de l'API est suivie jusqu'au dernier élément ; un tableau ambigu est signalé, sans choix arbitraire.
- **D8.INV-3** : l'export donne un ticket par ligne, description au format ADF mise à plat et ticket non assigné nommé comme tel ; le CSV du script Python est en UTF-8 avec BOM et séparateur « ; », pour Excel.

## 10. Filiation

Le skill reprend les outils écrits avec le développeur les 27 et 28 octobre 2026 et déposés d'abord dans le dossier `utils/` du dépôt `geminiboard-cadrage` (pull request n° 10, close sans fusion au profit de ce skill). Le développeur enregistrait jusque-là chaque ticket du sprint à la main, en MHTML, dans deux dossiers.

Étapes, à la demande du développeur :

1. export par l'API REST, en Python, avec un jeton ; puis en Node, avec identifiant et mot de passe : le Jira du développeur passe par un SSO, qui exclut ces deux voies (D8, gardée pour un Jira sans SSO) ;
2. capture en MHTML de la page du sprint, connexion faite à la main dans le navigateur (D2), puis interface locale (D6) ;
3. capture de chaque ticket du sprint, retenu par préfixe de clé et plage de numéros (D3, D4), et classement dans deux dossiers nommés par les termes clés `ticket avec ia` et `ticket sans ia` (D5) ;
4. dossiers de catégorie créés directement dans le chemin choisi dans l'interface, sans sous-dossier daté (D5.INV-4) ; skill et agent rangés dans Agent2Prompt, pour être intégrés ensuite à Gemini CLI depuis GeminiBoard (D10, réservée).

Le préfixe, les numéros et l'adresse du Jira du développeur ne figurent dans aucun fichier du skill : il les saisit dans l'interface, qui les garde dans son navigateur (D6.INV-3).

## 11. Journal de révision

**1.0.0** (2026-10-28) : première version. Dimensions D1 à D8 actives, D9 et D10 réservées. Points d'extension E1 et E2. Module commun, interface, ligne de commande, exports par l'API, recette de 19 scénarios (108 contrôles) contre un faux Jira local et agent `capteur-sprint`, écrits en entier dans les modules `execution`, `interface`, `export-api`, `recette` et `agent`. Tirée des outils du dossier `utils/` de `geminiboard-cadrage` (section 10).
<<<FIN SKILL.md>>>

<<<FICHIER modules/execution/SKILL.md>>>
---
name: execution
description: Exécution du skill (commandes npm depuis le dossier du skill, installation par npm ci, navigateur du poste et canal Chrome, Edge ou Chromium, emplacements du profil, des captures et des exports, .gitignore du skill, réglages par variables JIRA_CAPTURE_*, dépendance unique playwright-core à version exacte, pièges connus, commande d'extraction des fichiers exécutables à empreintes, sources de package.json, package-lock.json, .gitignore et du module commun scripts/jira-capture-core.mjs). À lire en premier, pour installer le skill.
dimensions: [D1]
status: active
---

# Module `execution` (D1)

Phase 7E couverte : Espace.

## 1. Commandes

Toutes se lancent depuis le dossier du skill.

| Commande | Effet | Module |
|---|---|---|
| `npm ci` | installe `playwright-core` 1.63.0, sans navigateur | ce module |
| `npm run capture` | interface de capture, sur http://127.0.0.1:3100 | `interface` |
| `npm run capture:cli -- "<page du sprint>" [options]` | capture en ligne de commande | `interface` |
| `npm run export` | export par l'API, sur http://127.0.0.1:3000 | `export-api` |
| `python3 scripts/jira_sprint_export.py --board <tableau>` | export par l'API, en Python (sous Windows : `py`) | `export-api` |
| `npm test` | recette, 19 scénarios contre un faux Jira local | `recette` |

## 2. Installation

1. Node 20 ou plus récent : `node --version`.
2. `npm ci` installe la seule dépendance, à la version du verrou (D1.INV-1). Derrière un proxy d'entreprise, npm lit `HTTPS_PROXY` ou sa propre configuration (`npm config set proxy …`).
3. Le navigateur est celui du poste : Chrome par défaut. `playwright-core` n'en télécharge aucun.
   - Edge : `JIRA_CAPTURE_CHANNEL=msedge`.
   - Sans Chrome ni Edge : `npx playwright-core install chromium`, puis `JIRA_CAPTURE_CHANNEL=chromium`.
4. Sous WSL2, le navigateur doit être installé dans la distribution, et la fenêtre s'affiche par WSLg. Le plus simple reste de matérialiser et de lancer le skill sous Windows, à côté de Chrome.
5. La capture ouvre une fenêtre visible, pour la connexion SSO : elle demande un écran. Seule la recette tourne sans écran, sous `xvfb-run` (module `recette`, § 1).

## 3. Emplacements (D1.INV-2)

| Chemin, dans le dossier du skill | Contenu | Écarté par `.gitignore` |
|---|---|---|
| `.jira-profile/` | profil du navigateur dédié à Jira : cookies de la session SSO | oui |
| `mhtml/` | dossier de sortie par défaut des captures | oui |
| `exports/` | sortie par défaut du script d'export Python | oui |
| `node_modules/` | `playwright-core` | oui |
| tout fichier `*.mhtml` | capture rangée ailleurs dans le dossier | oui |

Un dossier de sortie choisi hors du skill (chemin absolu dans l'interface, `--sortie` en ligne de commande) n'est couvert par aucun `.gitignore` : il se choisit hors de tout dépôt. Le profil contient des cookies de session : il ne se copie ni ne se partage.

## 4. Réglages (D1.INV-3)

| Variable | Défaut | Rôle |
|---|---|---|
| `JIRA_CAPTURE_CHANNEL` | `chrome` | navigateur : `chrome`, `msedge`, ou `chromium` pour celui de Playwright |
| `JIRA_CAPTURE_PROFILE` | `.jira-profile` | dossier du profil, relatif au dossier du skill ou absolu |
| `JIRA_CAPTURE_PAGE_TIMEOUT_MS` | `20000` | délai d'affichage d'une page de ticket, en millisecondes |
| `PORT` | `3100` pour la capture, `3000` pour l'export | port de l'interface, toujours sur `127.0.0.1` |

Une variable vide vaut absente. Sous PowerShell : `$env:JIRA_CAPTURE_CHANNEL = "msedge"` ; sous bash : `export JIRA_CAPTURE_CHANNEL=msedge` ; puis `npm run capture`.

## 5. Dépendance (D1.INV-1)

`playwright-core` 1.63.0, à version exacte dans `package.json` et dans le verrou : c'est la version de la recette. Elle accepte Node 20 (`engines`), n'a aucune dépendance et pilote le navigateur du poste par le protocole Chrome DevTools. Une autre version se monte dans une nouvelle version du skill, recette rejouée.

## 6. Pièges connus

- **Profil déjà ouvert** : un profil ne s'ouvre que dans une fenêtre à la fois. Si l'interface et la ligne de commande tournent ensemble, la seconde ne lance pas le navigateur. Fermer la première fenêtre.
- **Chrome introuvable** : le lancement échoue et l'interface affiche « Impossible de lancer le navigateur ». Installer Chrome, ou choisir un autre canal (§ 4).
- **Session expirée** : traitée par le module `capture` (D4.INV-1, D4.INV-4).

## 7. Contrôle de sortie

- La commande du § 8 écrit `conforme` pour chacun des treize fichiers.
- `npm ci` installe `playwright-core` 1.63.0.
- `npm test` rend son bilan sans échec (module `recette`).

## 8. Matérialiser les fichiers exécutables

Treize fichiers sont tirés des blocs annotés `<!-- fichier : chemin -->` des modules, à l'identique, par programme plutôt qu'à la main :

| Fichier | Module, section | Empreinte sha256 |
|---|---|---|
| `package.json` | `execution`, § 9 | `7493a4af4ad23c1e13b92c66ba242c9bca40b3be0f9ba8ab77434c924306eb77` |
| `package-lock.json` | `execution`, § 9 | `80d7bb928817d7ca7ba7600b5292371ad49fa95d25c5af0316766f2a675c788a` |
| `.gitignore` | `execution`, § 9 | `b163b109241838c4ff48e7cc27de427a4fb4e7f9aebdb16c8a5ad3fbb7a02613` |
| `scripts/jira-capture-core.mjs` | `execution`, § 10 | `173c7b918feec11b3f271c3146c0ac2e30b0015793b8ee75eea9b4548c087f4d` |
| `scripts/jira-capture-app.mjs` | `interface`, § 8 | `07dab20b9b5ea116e1be03d228709896c46439fff26c9fb7bc81eb8de9a6f8f5` |
| `scripts/public/capture.html` | `interface`, § 8 | `f8c7a637f8c2dafc62b9b360e9eb504f24d59d86667c27904059f213081e3abb` |
| `scripts/jira-capture-mhtml.mjs` | `interface`, § 8 | `ad9a2a8d7926b215366ad9d8564527428657f8116ca18d759b52084662b88779` |
| `agent/capteur-sprint.md` | `agent`, § 7 | `758d783b13566506f00f7a52405a49adfc7543ad23adcc6d526bec0efb23ef9c` |
| `scripts/jira-sprint-app.mjs` | `export-api`, § 6 | `14005092304d4d368c869d7ee801ca922529848325255054768e86f37c418ea8` |
| `scripts/public/index.html` | `export-api`, § 6 | `f69c6d601212d9a7e746181957a8c281f00a3d42decd488de25c54fdbb8abd91` |
| `scripts/jira_sprint_export.py` | `export-api`, § 6 | `60b6953199cbc21443572212fee36de21adc4522e86feb2215f38ba474b91782` |
| `tests/fake-jira.mjs` | `recette`, § 6 | `8264199f3020af430970c17cae538f115287a3bba8b69b67729351927c5a663f` |
| `tests/run-tests.mjs` | `recette`, § 6 | `22de1b311e48fcefac770db87920cebbdde5407e41ee7ad299271e4da405cb55` |

Depuis le dossier du skill, cette commande d'une ligne écrit les treize fichiers, compare leurs empreintes à celles du tableau et sort avec le code 1 au moindre écart ou à la moindre absence. Elle ne contient ni `$`, ni accent grave, ni `!`, ni `%`, ni guillemet intérieur : elle se colle telle quelle dans bash, zsh, CMD ou PowerShell, et dans un fichier `.cmd`. Elle lit aussi des modules aux fins de ligne CRLF.

```text
node -e "const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'); const attendu = { 'package.json': '7493a4af4ad23c1e13b92c66ba242c9bca40b3be0f9ba8ab77434c924306eb77', 'package-lock.json': '80d7bb928817d7ca7ba7600b5292371ad49fa95d25c5af0316766f2a675c788a', '.gitignore': 'b163b109241838c4ff48e7cc27de427a4fb4e7f9aebdb16c8a5ad3fbb7a02613', 'scripts/jira-capture-core.mjs': '173c7b918feec11b3f271c3146c0ac2e30b0015793b8ee75eea9b4548c087f4d', 'scripts/jira-capture-app.mjs': '07dab20b9b5ea116e1be03d228709896c46439fff26c9fb7bc81eb8de9a6f8f5', 'scripts/public/capture.html': 'f8c7a637f8c2dafc62b9b360e9eb504f24d59d86667c27904059f213081e3abb', 'scripts/jira-capture-mhtml.mjs': 'ad9a2a8d7926b215366ad9d8564527428657f8116ca18d759b52084662b88779', 'agent/capteur-sprint.md': '758d783b13566506f00f7a52405a49adfc7543ad23adcc6d526bec0efb23ef9c', 'scripts/jira-sprint-app.mjs': '14005092304d4d368c869d7ee801ca922529848325255054768e86f37c418ea8', 'scripts/public/index.html': 'f69c6d601212d9a7e746181957a8c281f00a3d42decd488de25c54fdbb8abd91', 'scripts/jira_sprint_export.py': '60b6953199cbc21443572212fee36de21adc4522e86feb2215f38ba474b91782', 'tests/fake-jira.mjs': '8264199f3020af430970c17cae538f115287a3bba8b69b67729351927c5a663f', 'tests/run-tests.mjs': '22de1b311e48fcefac770db87920cebbdde5407e41ee7ad299271e4da405cb55' }; const vus = new Set(); let ecarts = 0; for (const module of ['modules/execution/SKILL.md', 'modules/interface/SKILL.md', 'modules/agent/SKILL.md', 'modules/export-api/SKILL.md', 'modules/recette/SKILL.md']) { const texte = fs.readFileSync(module, 'utf8').replace(/\r\n/g, '\n'); for (const m of texte.matchAll(/^<\x21-- fichier : (\S+) -->\n\x60{3}[a-z]*\n([\s\S]*?)\n\x60{3}\n/gm)) { const contenu = m[2] + '\n'; fs.mkdirSync(path.dirname(m[1]), { recursive: true }); fs.writeFileSync(m[1], contenu); vus.add(m[1]); const conforme = crypto.createHash('sha256').update(contenu).digest('hex') === attendu[m[1]]; if (conforme === false) ecarts++; console.log((conforme ? 'conforme  ' : 'ECART     ') + m[1]); } } for (const f of Object.keys(attendu)) { if (vus.has(f) === false) { ecarts++; console.log('ABSENT    ' + f); } } if (ecarts > 0) process.exitCode = 1;"
```

Puis, depuis le même dossier :

```bash
npm ci
npm test
```

## 9. Paquet et fichiers de travail

`package.json` déclare la dépendance unique et les commandes du § 1 ; `package-lock.json` en fixe la version ; `.gitignore` écarte les fichiers de travail (§ 3).

<!-- fichier : package.json -->
```json
{
  "name": "capture-sprint-jira",
  "version": "1.0.0",
  "private": true,
  "description": "Capture en MHTML des tickets d'un sprint Jira derrière un SSO, rangés par catégorie (skill capture-sprint-jira)",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "capture": "node scripts/jira-capture-app.mjs",
    "capture:cli": "node scripts/jira-capture-mhtml.mjs",
    "export": "node scripts/jira-sprint-app.mjs",
    "test": "node tests/run-tests.mjs"
  },
  "dependencies": {
    "playwright-core": "1.63.0"
  }
}
```

<!-- fichier : package-lock.json -->
```json
{
  "name": "capture-sprint-jira",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "capture-sprint-jira",
      "version": "1.0.0",
      "dependencies": {
        "playwright-core": "1.63.0"
      },
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/playwright-core": {
      "version": "1.63.0",
      "resolved": "https://registry.npmjs.org/playwright-core/-/playwright-core-1.63.0.tgz",
      "integrity": "sha512-rYCsBF/M5HjUch52bbtVONEFjv6Xu8sm8h72dNlR5bzIE1fvC/bxgspzkjSfU+MweEMmPM8KJebG6nnyxo5mCg==",
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
# Fichiers de travail du skill capture-sprint-jira : session SSO, tickets capturés ou exportés.
# Ils ne vont jamais dans un dépôt.
node_modules/
.jira-profile/
mhtml/
exports/
*.mhtml
```

## 10. Module commun `scripts/jira-capture-core.mjs`

Le module commun porte tout ce que font la capture et le classement ; l'interface et la ligne de commande l'appellent (E2). Ses fonctions exportées :

| Fonction | Rôle | Module |
|---|---|---|
| `launchBrowser()`, `browserChannel()`, `profileDir()` | fenêtre visible sur le profil dédié | `session` |
| `loadAllTickets(page)`, `parseFilter()`, `matchesFilter()` | relevé des liens et filtre | `releve` |
| `captureTicket()`, `captureMhtml()`, `pageTimeoutMs()` | capture d'une page de ticket | `capture` |
| `classify()`, `parseCategories()`, `normalizeText()`, `termPattern()` | classement | `classement` |
| `captureSprintTickets(context, page, options)` | capture complète d'un sprint, rapport | `classement` |
| `outputFolder()` | dossier de sortie saisi | `interface` |

<!-- fichier : scripts/jira-capture-core.mjs -->
```javascript
// jira-capture-core.mjs : capture en MHTML des tickets d'un sprint Jira protégé par un SSO (skill capture-sprint-jira).
// Le navigateur s'ouvre sur un profil dédié ; l'utilisateur s'y connecte lui-même (SSO, MFA) : aucun identifiant ne
// passe par ce module. Sur la page du sprint, chaque lien /browse/<CLÉ> retenu par le filtre (préfixe, numéros) est
// ouvert ; la page du ticket est enregistrée en MHTML dans le dossier de sa catégorie, reconnue au terme clé qu'elle
// contient. Module commun à jira-capture-app.mjs (interface) et à jira-capture-mhtml.mjs (ligne de commande).
import { existsSync } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

/** Dossier du skill (parent de scripts/) : base des chemins relatifs saisis dans l'interface. */
export const SKILL_DIR = fileURLToPath(new URL('..', import.meta.url));

/** Dossier des captures par défaut, écarté par le .gitignore du skill. */
export const DEFAULT_OUT_DIR = join(SKILL_DIR, 'mhtml');

/** Catégories par défaut : termes clés cherchés dans la page de chaque ticket, et noms de leurs dossiers. */
export const DEFAULT_CATEGORIES = ['ticket avec ia', 'ticket sans ia'];

/** Dossier des tickets dont la page ne contient aucun terme clé, ou en contient plusieurs. */
export const UNCLASSIFIED = 'à classer';

/** Arrêt de la capture après ce nombre d'échecs consécutifs : le plus souvent, la session SSO a expiré. */
export const MAX_FAILURES_IN_ROW = 3;

/** Profil du navigateur dédié à Jira, qui garde la session SSO ; JIRA_CAPTURE_PROFILE pour un autre dossier. */
export const profileDir = (env = process.env) => resolve(SKILL_DIR, env.JIRA_CAPTURE_PROFILE || '.jira-profile');

/** Délai d'affichage d'une page de ticket, 20 s par défaut ; JIRA_CAPTURE_PAGE_TIMEOUT_MS pour un Jira lent. */
export const pageTimeoutMs = (env = process.env) => Number(env.JIRA_CAPTURE_PAGE_TIMEOUT_MS) || 20_000;

export const firstLine = (err) => String(err?.message ?? err).split('\n')[0];
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---------------------------------------------------------------------------------------------
// Navigateur
// ---------------------------------------------------------------------------------------------

/**
 * Canal du navigateur : Chrome installé sur le poste par défaut ; JIRA_CAPTURE_CHANNEL=msedge pour Edge,
 * ou chromium pour le Chromium de Playwright (npx playwright-core install chromium).
 */
export function browserChannel(env = process.env) {
  const channel = String(env.JIRA_CAPTURE_CHANNEL ?? '').trim() || 'chrome';
  return channel === 'chromium' ? undefined : channel;
}

/** Ouvre une fenêtre visible sur le profil dédié : la connexion SSO s'y fait à la main. */
export function launchBrowser() {
  return chromium.launchPersistentContext(profileDir(), {
    channel: browserChannel(),
    headless: false,
    viewport: null, // la page prend la taille de la fenêtre
  });
}

/** Dossier de sortie saisi : relatif au dossier du skill s'il n'est pas absolu, mhtml/ s'il est vide. */
export const outputFolder = (raw, base = SKILL_DIR) => resolve(base, String(raw ?? '').trim() || 'mhtml');

// ---------------------------------------------------------------------------------------------
// Filtre et catégories
// ---------------------------------------------------------------------------------------------

/** Lit le filtre { prefix, min, max } ; vides, ils ne filtrent rien. Lève une erreur si une valeur est invalide. */
export function parseFilter({ prefix, min, max } = {}) {
  const p = String(prefix ?? '').trim().toUpperCase();
  if (p && !/^[A-Z][A-Z0-9_]*$/.test(p)) throw new Error(`Préfixe invalide : « ${prefix} » (lettres, chiffres et _, en commençant par une lettre)`);
  const number = (value, label) => {
    const s = String(value ?? '').trim();
    if (!s) return null;
    if (!/^\d{1,9}$/.test(s)) throw new Error(`${label} invalide : « ${value} »`);
    return Number(s);
  };
  const lo = number(min, 'Numéro minimal');
  const hi = number(max, 'Numéro maximal');
  if (lo !== null && hi !== null && lo > hi) throw new Error(`Numéros : ${lo} est plus grand que ${hi}`);
  return { prefix: p, min: lo, max: hi };
}

/** Le ticket `key` (PROJET-NUMÉRO) passe-t-il le filtre ? Le préfixe porte sur la partie PROJET. */
export function matchesFilter(key, { prefix = '', min = null, max = null } = {}) {
  const m = String(key).toUpperCase().match(/^([A-Z][A-Z0-9_]*)-(\d+)$/);
  if (!m) return false;
  const n = Number(m[2]);
  return m[1].startsWith(prefix) && (min === null || n >= min) && (max === null || n <= max);
}

const keyParts = (key) => {
  const m = key.match(/^(.*)-(\d+)$/);
  return [Number(m[2]), m[1]];
};
/** Tri par numéro, puis par projet. */
const byNumber = (a, b) => {
  const [na, pa] = keyParts(a.key);
  const [nb, pb] = keyParts(b.key);
  return na - nb || (pa < pb ? -1 : pa > pb ? 1 : 0);
};

/** Minuscules, sans accents, séparateurs (blancs, _ et -) réduits à une espace. */
export const normalizeText = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[\s_-]+/g, ' ').trim();

/** Motif d'un terme clé : mots entiers, séparés par une espace, un tiret, un _ ou rien (« TicketAvecIA »). */
export const termPattern = (term) => new RegExp(`(?<![a-z0-9])${normalizeText(term).split(' ').map(escapeRe).join(' ?')}(?![a-z0-9])`);

// Interdit dans un nom de dossier sous Windows ou Linux
const BAD_FOLDER_NAME = /[<>:"/\\|?*\u0000-\u001f]/;

/** Lit les catégories (liste, ou texte à une catégorie par ligne ou séparées par « ; ») ; elles nomment les dossiers. */
export function parseCategories(raw = DEFAULT_CATEGORIES) {
  const list = (Array.isArray(raw) ? raw : String(raw ?? '').split(/\r?\n|;/))
    .map((c) => String(c).trim().replace(/\s+/g, ' ')).filter(Boolean);
  if (!list.length) throw new Error('Indiquez au moins une catégorie');
  if (list.length > 10) throw new Error('10 catégories au plus');
  for (const c of list) {
    if (c.length > 60 || BAD_FOLDER_NAME.test(c) || /^\.|\.$/.test(c)) {
      throw new Error(`Catégorie « ${c} » : 60 caractères au plus, sans < > : " / \\ | ? * ni point au début ou à la fin`);
    }
  }
  const keys = list.map(normalizeText);
  if (new Set(keys).size !== keys.length) throw new Error('Catégories en double');
  if (keys.includes(normalizeText(UNCLASSIFIED))) throw new Error(`« ${UNCLASSIFIED} » est réservé aux tickets sans catégorie`);
  return list;
}

const excerptAround = (hay, m) => {
  const start = Math.max(0, m.index - 40);
  const end = Math.min(hay.length, m.index + m[0].length + 40);
  return `${start > 0 ? '…' : ''}${hay.slice(start, end)}${end < hay.length ? '…' : ''}`;
};

/**
 * Catégorie d'un ticket d'après les textes de sa page, pris dans l'ordre : [[où, texte], …]. Le premier texte
 * qui contient au moins un terme clé décide : une seule catégorie trouvée est retenue ; plusieurs, aucune.
 * Rend { category, where, found, excerpt } ; category vaut null si le ticket est à classer.
 */
export function classify(sources, categories) {
  for (const [where, text] of sources) {
    const hay = normalizeText(text);
    const hits = [];
    for (const c of categories) {
      const m = termPattern(c).exec(hay);
      if (m) hits.push({ c, m });
    }
    if (hits.length === 1) return { category: hits[0].c, where, found: [hits[0].c], excerpt: excerptAround(hay, hits[0].m) };
    if (hits.length > 1) return { category: null, where, found: hits.map((h) => h.c), excerpt: null };
  }
  return { category: null, where: null, found: [], excerpt: null };
}

// ---------------------------------------------------------------------------------------------
// Page du sprint
// ---------------------------------------------------------------------------------------------

/**
 * Un pas de défilement, exécuté dans la page : la fenêtre, si elle défile, et chaque bloc qui défile (100 pixels
 * de haut au moins ; avec `withLinks`, seulement s'il contient un lien de ticket) avancent de 80 % de leur hauteur
 * visible, si bien qu'aucune carte n'est sautée, même dans une petite fenêtre. Rend true si l'un d'eux a bougé.
 */
function scrollStep(withLinks) {
  const root = document.scrollingElement ?? document.documentElement;
  const scrolls = (el) => el.scrollHeight > el.clientHeight + 1 && (el === root || /(auto|scroll|overlay)/.test(getComputedStyle(el).overflowY));
  const targets = scrolls(root) ? [root] : [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.clientHeight < 100 || !scrolls(el)) continue;
    if (withLinks && !el.querySelector('a[href*="/browse/"]')) continue;
    targets.push(el);
  }
  let moved = false;
  for (const el of targets) {
    const before = el.scrollTop;
    el.scrollTop = before + Math.max(80, Math.round(el.clientHeight * 0.8));
    if (el.scrollTop !== before) moved = true;
  }
  return moved;
}

async function scrollToTop(page, pauseMs) {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    for (const el of document.querySelectorAll('*')) if (el.scrollTop > 0) el.scrollTop = 0;
  });
  await page.waitForTimeout(pauseMs);
}

/**
 * Liens des tickets de la page, hors navigation (menus, éléments récents) : [{ key, url }], une entrée par clé,
 * adresse ramenée à …/browse/<CLÉ>.
 */
const ticketLinks = (page) => page.evaluate(() => {
  const NAV = 'nav, header, aside, [role="navigation"], [role="banner"]';
  const links = new Map();
  for (const a of document.querySelectorAll('a[href*="/browse/"]')) {
    if (a.closest(NAV)) continue;
    const m = (a.getAttribute('href') ?? '').match(/^(.*?\/browse\/)([A-Za-z][A-Za-z0-9_]*-\d+)/);
    if (!m) continue;
    const key = m[2].toUpperCase();
    if (!links.has(key)) links.set(key, new URL(m[1] + key, document.baseURI).href);
  }
  return [...links].map(([key, url]) => ({ key, url }));
});

/**
 * Fait défiler la page jusqu'à ce que, `stableSteps` pas de suite, elle ne défile plus et qu'aucun ticket nouveau
 * n'apparaisse : le bas est atteint et plus rien ne s'y charge. Revient ensuite en haut. Les liens sont relevés à
 * chaque pas : un affichage virtualisé, qui retire de la page les cartes sorties de l'écran, ne fait donc perdre
 * aucun ticket. Rend { seen, present, links }.
 */
export async function loadAllTickets(page, { pauseMs = 700, maxSteps = 150, stableSteps = 4 } = {}) {
  const seen = new Map();
  const add = (links) => { for (const l of links) if (!seen.has(l.key)) seen.set(l.key, l.url); };
  add(await ticketLinks(page));
  for (let i = 0, stable = 0; i < maxSteps && stable < stableSteps; i++) {
    const moved = await page.evaluate(scrollStep, true);
    await page.waitForTimeout(pauseMs);
    const before = seen.size;
    add(await ticketLinks(page));
    stable = seen.size === before && !moved ? stable + 1 : 0;
  }
  await scrollToTop(page, pauseMs);
  return { seen: seen.size, present: (await ticketLinks(page)).length, links: [...seen].map(([key, url]) => ({ key, url })) };
}

/** Instantané MHTML de la page, comme « Enregistrer sous… », format « Page Web, un seul fichier ». */
export async function captureMhtml(context, page) {
  const cdp = await context.newCDPSession(page);
  try {
    const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
    return data;
  } finally {
    await cdp.detach().catch(() => {});
  }
}

// ---------------------------------------------------------------------------------------------
// Pages des tickets
// ---------------------------------------------------------------------------------------------

/**
 * Attend que la page soit celle du ticket (adresse …/browse/<CLÉ> ou titre qui la contient) et que la clé
 * soit affichée. Les navigations en cours, comme un aller-retour par le SSO, sont tolérées.
 */
async function waitForTicket(page, key, timeoutMs) {
  const end = Date.now() + timeoutMs;
  for (;;) {
    const ok = await page.evaluate((k) => {
      const onTicket = new RegExp(`/BROWSE/${k}(?![0-9])`).test(location.href.toUpperCase()) || document.title.toUpperCase().includes(k);
      return onTicket && (document.body?.innerText ?? '').toUpperCase().includes(k);
    }, key).catch(() => false);
    if (ok) return true;
    if (Date.now() >= end) return false;
    await page.waitForTimeout(400);
  }
}

/**
 * Fait défiler la page jusqu'en bas, tant que son texte s'allonge (commentaires chargés à l'affichage) : elle
 * s'arrête quand, `stableSteps` pas de suite, rien ne défile ni ne s'ajoute. Revient ensuite en haut.
 */
async function scrollThrough(page, { pauseMs = 500, maxSteps = 40, stableSteps = 2 } = {}) {
  const length = () => page.evaluate(() => document.body?.innerText.length ?? 0);
  let last = await length();
  for (let i = 0, stable = 0; i < maxSteps && stable < stableSteps; i++) {
    const moved = await page.evaluate(scrollStep, false);
    await page.waitForTimeout(pauseMs);
    const now = await length();
    stable = now === last && !moved ? stable + 1 : 0;
    last = now;
  }
  await scrollToTop(page, pauseMs);
}

/** Attend que le texte de la page ne change plus (deux relevés identiques), 10 s au plus. */
async function waitForStableText(page, { pauseMs = 500, maxMs = 10_000 } = {}) {
  const end = Date.now() + maxMs;
  let last = -1;
  for (let stable = 0; stable < 2 && Date.now() < end;) {
    const now = await page.evaluate(() => document.body?.innerText.length ?? 0).catch(() => -1);
    stable = now === last ? stable + 1 : 0;
    last = now;
    await page.waitForTimeout(pauseMs);
  }
}

/**
 * Textes où chercher la catégorie, du plus sûr au moins sûr : le contenu principal (main), visible ; le même,
 * panneaux repliés compris ; la page visible, hors navigation, si elle n'a pas de contenu principal. La
 * navigation (filtres enregistrés, éléments récents) peut citer un terme clé sans rapport avec le ticket.
 */
const pageTexts = (page) => page.evaluate(() => {
  const SKIP = /^(?:SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/;
  const NAV = 'nav, header, aside, [role="navigation"], [role="banner"]';
  const collect = (root, { visibleOnly, skipNav }) => {
    const parts = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const el = walker.currentNode.parentElement;
      if (!el || SKIP.test(el.tagName)) continue;
      if (skipNav && el.closest(NAV)) continue;
      if (visibleOnly && !(el.checkVisibility ? el.checkVisibility() : el.offsetParent !== null)) continue;
      parts.push(walker.currentNode.nodeValue);
    }
    return parts.join(' ');
  };
  const main = document.querySelector('main, [role="main"]');
  return [
    ['contenu', main ? collect(main, { visibleOnly: true }) : ''],
    ['contenu masqué', main ? collect(main, { visibleOnly: false }) : ''],
    ['page', collect(document.body, { visibleOnly: true, skipNav: true })],
  ];
});

/** Ouvre la page du ticket, la charge en entier et la capture : rend { data, texts }. */
export async function captureTicket(context, page, { key, url }, { timeoutMs = pageTimeoutMs() } = {}) {
  let navError = null;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 }).catch((err) => { navError = err; });
  if (!(await waitForTicket(page, key, timeoutMs))) {
    throw new Error(navError
      ? `ouverture impossible (${firstLine(navError)})`
      : `page du ticket non affichée après ${timeoutMs / 1000} s (session SSO expirée ?)`);
  }
  await scrollThrough(page);
  await waitForStableText(page);
  const texts = await pageTexts(page);
  return { data: await captureMhtml(context, page), texts };
}

// ---------------------------------------------------------------------------------------------
// Capture d'un sprint
// ---------------------------------------------------------------------------------------------

/**
 * Capture les tickets de la page du sprint affichée dans `page`, directement dans `folder` :
 *   <catégorie>/<CLÉ>.mhtml   un fichier par ticket retenu, dans le dossier de sa catégorie
 *   à classer/<CLÉ>.mhtml     aucun terme clé trouvé, ou plusieurs
 *   sprint.mhtml              la page du sprint, d'où viennent les liens
 *   rapport.json              filtre, catégories, et pour chaque ticket : catégorie, extrait trouvé ou erreur
 * Une nouvelle capture d'un ticket remplace son fichier et retire sa copie d'un autre dossier de catégorie ;
 * un ticket en erreur garde sa capture précédente. onProgress({ step, done, total, key }) suit l'avancement.
 * Rend le rapport.
 */
export async function captureSprintTickets(context, page, {
  folder = DEFAULT_OUT_DIR, filter = {}, categories = DEFAULT_CATEGORIES, now = new Date(),
  onProgress = () => {}, timeoutMs = pageTimeoutMs(),
} = {}) {
  onProgress({ step: 'liste', done: 0, total: 0, key: null });
  const sprintUrl = page.url();
  const list = await loadAllTickets(page);
  await mkdir(folder, { recursive: true });
  await writeFile(join(folder, 'sprint.mhtml'), await captureMhtml(context, page));

  const selected = list.links.filter((l) => matchesFilter(l.key, filter)).sort(byNumber);
  const ignored = list.links.filter((l) => !matchesFilter(l.key, filter)).map((l) => l.key);
  const folders = [...categories, UNCLASSIFIED];
  const tickets = [];
  let failuresInRow = 0;
  let aborted = false;
  for (const [i, ticket] of selected.entries()) {
    onProgress({ step: 'tickets', done: i, total: selected.length, key: ticket.key });
    try {
      const { data, texts } = await captureTicket(context, page, ticket, { timeoutMs });
      const c = classify(texts, categories);
      const dir = c.category ?? UNCLASSIFIED;
      await mkdir(join(folder, dir), { recursive: true });
      await writeFile(join(folder, dir, `${ticket.key}.mhtml`), data);
      const movedFrom = [];
      for (const other of folders) { // copie d'une capture précédente, rangée ailleurs
        const old = join(folder, other, `${ticket.key}.mhtml`);
        if (other !== dir && existsSync(old)) {
          await rm(old, { force: true });
          movedFrom.push(other);
        }
      }
      tickets.push({ ...ticket, category: c.category, found: c.found, where: c.where, excerpt: c.excerpt, file: `${dir}/${ticket.key}.mhtml`, movedFrom });
      failuresInRow = 0;
    } catch (err) {
      tickets.push({ ...ticket, category: null, error: firstLine(err) });
      failuresInRow++;
      if (page.isClosed() || failuresInRow >= MAX_FAILURES_IN_ROW) {
        aborted = i + 1 < selected.length;
        break;
      }
    }
  }

  const counts = Object.fromEntries(folders.map((c) => [c, 0]));
  let errors = 0;
  for (const t of tickets) {
    if (t.error) errors++;
    else counts[t.category ?? UNCLASSIFIED]++;
  }
  const report = {
    date: now.toISOString(), sprintUrl, folder, filter, categories,
    listed: list.links.length, selected: selected.length, ignored: ignored.length, ignoredSample: ignored.slice(0, 20),
    counts, errors, aborted, tickets,
  };
  await writeFile(join(folder, 'rapport.json'), `${JSON.stringify(report, null, 2)}\n`);
  onProgress({ step: 'fin', done: tickets.length, total: selected.length, key: null });
  return report;
}
```
<<<FIN modules/execution/SKILL.md>>>

<<<FICHIER modules/session/SKILL.md>>>
---
name: session
description: Session SSO de la capture (fenêtre visible du navigateur du poste, connexion faite à la main par le développeur, MFA comprise, aucun identifiant demandé, lu ni stocké, profil de navigateur dédié réutilisé d'une ouverture à l'autre, persistance selon les cookies du SSO, une fenêtre par profil, canal Chrome, Edge ou Chromium, pièges des redirections SSO). À lire avant la première capture.
dimensions: [D2]
status: active
---

# Module `session` (D2)

Phase 7E couverte : Environnement.

## 1. Principe

Derrière un SSO, ni l'API REST de Jira ni un script ne peuvent se connecter avec un mot de passe : la connexion passe par le fournisseur d'identité de l'entreprise, souvent avec une validation sur un second appareil. Le skill ne cherche donc pas à se connecter. Il ouvre une fenêtre visible du navigateur du poste sur la page du sprint, et le développeur s'y connecte lui-même, comme d'habitude (D2.INV-1). Le skill ne voit ni identifiant, ni mot de passe, ni code de validation : il n'a aucun champ pour les recevoir, et l'agent refuse de les prendre (module `agent`, A5).

## 2. Profil dédié (D2.INV-2)

La fenêtre s'ouvre sur un profil de navigateur réservé au skill, `.jira-profile/` dans le dossier du skill, ou le dossier de `JIRA_CAPTURE_PROFILE`. Ce profil est distinct du profil habituel du développeur : il ne voit ni ses autres onglets, ni ses autres sessions. Il garde, d'une ouverture à l'autre, les cookies que pose le SSO.

- Si le SSO pose des cookies persistants, les ouvertures suivantes arrivent directement sur la page du sprint, sans nouvelle connexion, tant que la session est valide.
- Si le SSO pose des cookies de session, valables le temps de la fenêtre, chaque ouverture redemande la connexion. Le skill n'y peut rien et ne contourne pas la politique de l'entreprise.

Le profil contient ces cookies : il ne se copie ni ne se partage, et le `.gitignore` du skill l'écarte (D1.INV-2). Pour se déconnecter, il suffit de supprimer le dossier du profil, navigateur fermé.

## 3. Navigateur

Le canal se règle par `JIRA_CAPTURE_CHANNEL` (module `execution`, § 4) : Chrome par défaut, Edge (`msedge`), ou le Chromium de Playwright (`chromium`). Un SSO d'entreprise qui reconnaît le poste par l'authentification Windows intégrée fonctionne souvent mieux dans Edge ; c'est à essayer sur le poste.

## 4. Pièges connus

- **Redirections du SSO** : un SSO SAML renvoie vers Jira par un formulaire posté automatiquement ; l'ouverture peut rendre la main avant que la page du sprint soit affichée. L'interface le dit (« la page n'a pas fini de charger ») et la fenêtre reste utilisable : le développeur termine la connexion, affiche le sprint, puis lance la capture.
- **Une fenêtre par profil** : le navigateur refuse d'ouvrir deux fois le même profil (module `execution`, § 6).
- **Session expirée pendant la capture** : chaque ticket renvoyé vers la page de connexion est en erreur, et la capture s'arrête au troisième de suite (module `capture`, § 4). Le navigateur reste ouvert pour se reconnecter.

## 5. Contrôle de sortie

- R8, R9 et R12 du module `recette` passent : aucun champ d'identifiant, un seul passage par le SSO pour plusieurs ouvertures.
- Sur le poste du développeur : une première connexion à la main, puis une seconde ouverture, qui dit si le SSO garde la session.
<<<FIN modules/session/SKILL.md>>>

<<<FICHIER modules/releve/SKILL.md>>>
---
name: releve
description: Relevé des tickets sur la page du sprint (backlog ou tableau, défilement jusqu'à stabilité, liens /browse/CLÉ relevés à chaque pas, liste chargée au défilement ou virtualisée, navigation exclue, clés dédoublonnées quelle que soit la forme du lien, filtre par préfixe de la partie projet et plage de numéros comprise, valeurs refusées, tri par numéro, pièges). À lire pour choisir la page du sprint et régler le filtre.
dimensions: [D3]
status: active
---

# Module `releve` (D3)

Phase 7E couverte : Éléments.

## 1. La page du sprint

Le relevé part de la page affichée dans la fenêtre au moment de la capture. Pour le prochain sprint, c'est le backlog, où les sprints futurs sont listés au-dessus du backlog proprement dit ; pour le sprint en cours, le tableau. Une page de résultats de recherche (`/issues/?jql=sprint = …`) convient aussi : le skill ne lit que ses liens.

## 2. Défilement (D3.INV-1)

Jira charge souvent les cartes au fur et à mesure du défilement, et peut retirer de la page celles qui sortent de l'écran (affichage virtualisé). Le skill fait donc défiler, toutes les 700 ms, la fenêtre si elle défile et chaque bloc qui défile et contient un lien de ticket, de 80 % de sa hauteur affichée : deux pas se recouvrent, et aucune carte n'est sautée, même dans une petite fenêtre. Il relève à chaque pas les liens présents. Il s'arrête quand, quatre pas de suite, rien ne défile plus et aucun ticket nouveau n'apparaît : le bas est atteint et plus rien ne s'y charge ; au plus tard au bout de 150 pas. Les liens relevés à chaque pas s'additionnent : une carte retirée de la page reste relevée. La page revient ensuite en haut, où le backlog affiche ses sprints, et c'est cet état qui est enregistré dans `sprint.mhtml`.

Le défilement est programmé (position des blocs), et non simulé à la molette : il ne dépend ni de la place du pointeur ni de la taille de la fenêtre. Une première version, à pas fixe de 1 200 pixels sous le pointeur, ne relevait que 11 tickets sur 72 d'une liste virtualisée de 300 pixels de haut (recette, R13 et M7).

## 3. Liens et clés (D3.INV-1, D3.INV-3)

- Seuls comptent les liens `<a href>` dont l'adresse contient `/browse/<CLÉ>`, où la clé est `PROJET-NUMÉRO`.
- Les liens de la navigation (`nav`, `header`, `aside` et leurs rôles ARIA `navigation` et `banner`) sont ignorés : un menu « Récents » peut citer un ticket d'un autre sprint qui passerait le filtre.
- La clé est mise en majuscules ; l'adresse est ramenée à `…/browse/<CLÉ>`, sans paramètre, à partir de l'adresse de la page. Un même ticket lié trois fois, en relatif, en absolu ou en minuscules, n'est relevé qu'une fois.

## 4. Filtre (D3.INV-2)

| Champ | Règle | Exemple |
|---|---|---|
| Préfixe | début de la partie projet de la clé, sans tenir compte de la casse ; lettres, chiffres et `_`, en commençant par une lettre | `ABC` retient `ABCDE-3512` et `ABCXY-3600`, pas `XABC-3600` |
| Numéro minimal | entier, compris | `3500` retient `ABCDE-3500` |
| Numéro maximal | entier, compris, au moins égal au minimal | `4500` retient `ABCDE-4500` |

Un champ vide ne filtre rien : sans préfixe ni bornes, tous les tickets de la page sont capturés. Une valeur invalide est refusée avant que la capture ne commence, avec un message qui la nomme. Les tickets retenus sont capturés un à un, par numéro croissant, puis par projet (D3.INV-3). Le rapport compte les tickets relevés, retenus et ignorés, et donne jusqu'à vingt clés ignorées en exemple.

## 5. Pièges connus

- **Bornes trop étroites** : les numéros avancent à chaque nouveau ticket ; une plage fixée une fois pour toutes finit par exclure les tickets récents. Le rapport le montre : retenus en baisse, ignorés en hausse.
- **Épopées et tickets liés** : une carte peut lier son épopée ou un ticket bloquant ; s'ils passent le filtre, ils sont capturés comme les autres. Un préfixe ou des bornes plus serrés les écartent.
- **Tableau à colonnes larges** : le skill fait défiler verticalement ; un tableau qui déborde sur le côté s'élargit en agrandissant la fenêtre ou en réduisant le zoom (Ctrl -).

## 6. Contrôle de sortie

- R1, R9, R10 et R13 du module `recette` passent : 72 tickets relevés sur un backlog chargé au défilement comme sur un backlog virtualisé, un ticket récent de la navigation écarté, 8 tickets retenus et triés.
<<<FIN modules/releve/SKILL.md>>>

<<<FICHIER modules/capture/SKILL.md>>>
---
name: capture
description: Capture des pages de tickets (ouverture de l'adresse /browse/CLÉ dans la même fenêtre, attente de la page du ticket par son adresse ou son titre et par la clé affichée, tolérance aux allers-retours du SSO, délai réglable, défilement tant que le texte s'allonge, attente d'un texte stable, MHTML de Chrome par le protocole DevTools, nom de fichier par clé, erreurs par ticket, arrêt après trois erreurs de suite ou à la fermeture du navigateur, pièges dont les commentaires repliés). À lire pour comprendre ce que contient chaque fichier.
dimensions: [D4]
status: active
---

# Module `capture` (D4)

Phase 7E couverte : État.

## 1. Ouverture d'un ticket

Les tickets retenus s'ouvrent un à un, dans la fenêtre où le développeur s'est connecté : la session SSO sert à chacun. L'adresse est celle du relevé, `…/browse/<CLÉ>`.

## 2. La bonne page (D4.INV-1)

Jira affiche ses pages en plusieurs temps, et le SSO peut s'interposer. Le skill n'enregistre la page qu'une fois deux conditions remplies :

- la page est celle du ticket : son adresse contient `/browse/<CLÉ>`, ou son titre contient la clé ;
- la clé est affichée dans le texte de la page.

Il vérifie ces conditions toutes les 400 ms, en tolérant les navigations en cours, par exemple un aller-retour par le fournisseur d'identité. Passé le délai, 20 s par défaut (`JIRA_CAPTURE_PAGE_TIMEOUT_MS`), le ticket est en erreur : « page du ticket non affichée après 20 s (session SSO expirée ?) ». Rien n'est écrit pour lui, et une capture précédente du même ticket reste en place (D5.INV-4). Une page de connexion, une page d'erreur ou la page d'un autre ticket ne sont donc jamais enregistrées sous le nom du ticket.

## 3. Une page complète (D4.INV-2, D4.INV-3)

1. La page défile jusqu'en bas, toutes les 500 ms, par pas de 80 % de la hauteur affichée de chaque bloc qui défile (module `releve`, § 2), jusqu'à ce que, deux pas de suite, rien ne défile ni ne s'ajoute à son texte, quarante pas au plus : les commentaires et l'activité chargés à l'affichage apparaissent.
2. Elle revient en haut, puis le skill attend que la longueur de son texte soit la même sur trois relevés espacés de 500 ms, 10 s au plus.
3. La page est enregistrée par le protocole Chrome DevTools (`Page.captureSnapshot`, format `mhtml`) : le fichier est le même que celui d'« Enregistrer sous… », type « Page Web, un seul fichier », que lit l'ingestion d'`agent-tdd-jira`. Il commence par `From: <Saved by Blink>` et contient la page, ses styles et ses images.
4. Le fichier s'appelle `<CLÉ>.mhtml` et va dans le dossier de sa catégorie (module `classement`).

## 4. Erreurs et arrêt (D4.INV-4)

- Une erreur sur un ticket est notée dans le rapport, avec son message ; la capture passe au ticket suivant.
- Trois erreurs de suite arrêtent la capture : c'est presque toujours une session expirée, et les tickets suivants échoueraient de même. Le rapport le dit (`aborted`), et le navigateur reste ouvert sur le sprint pour se reconnecter (D6.INV-4).
- Fermer le navigateur, par le bouton de l'interface ou à la main, arrête aussi la capture ; le rapport garde ce qui a été capturé.

## 5. Durée

Le faux Jira de la recette se capture en 46 s pour huit tickets, relevé d'un backlog de 72 cartes compris, soit 4 à 5 s par ticket. Un vrai Jira, plus lent à afficher, demande davantage : une vingtaine de tickets prend quelques minutes, à mesurer sur le poste.

## 6. Pièges connus

- **Commentaires repliés** : Jira replie les commentaires anciens derrière « Afficher plus » ; le skill ne clique pas dessus, et le fichier ne contient que les commentaires affichés. L'ingestion d'`agent-tdd-jira` déclare alors cette partie comme limite (`agent-tdd-jira:D1.INV-3`).
- **Pièces jointes** : comme pour un enregistrement à la main, le fichier contient les images affichées, pas les pièces jointes téléchargeables.
- **Jira lent** : un délai plus long se règle par `JIRA_CAPTURE_PAGE_TIMEOUT_MS`.

## 7. Contrôle de sortie

- R10, R13, R14, R15 et R17 du module `recette` passent : la page de connexion d'une session expirée n'est jamais enregistrée, le commentaire chargé au défilement figure dans le fichier, la capture s'arrête après trois erreurs de suite ou à la fermeture.
- Le fichier d'un vrai ticket, ouvert dans Chrome ou lu par l'ingestion d'`agent-tdd-jira`, montre le ticket entier.
<<<FIN modules/capture/SKILL.md>>>

<<<FICHIER modules/classement/SKILL.md>>>
---
name: classement
description: Classement des tickets capturés (catégories et termes clés, ticket avec ia et ticket sans ia par défaut, noms de dossier valides, recherche sans casse ni accents et en mots entiers, séparateurs équivalents, ordre des textes lus de la page, navigation de Jira exclue, dossier à classer quand aucun terme ou plusieurs, dossiers créés directement dans le dossier de sortie, nouvelle capture qui remplace et retire la copie d'un autre dossier, sprint.mhtml et rapport.json et ses champs). À lire pour régler les catégories et lire le rapport.
dimensions: [D5]
status: active
---

# Module `classement` (D5)

Phase 7E couverte : Engendrent.

## 1. Catégories (D5.INV-5)

Une catégorie est à la fois le terme clé cherché dans la page d'un ticket et le nom du dossier où le ticket est rangé. Par défaut : `ticket avec ia` et `ticket sans ia`. Le développeur peut en donner d'autres, jusqu'à dix, une par ligne dans l'interface ou par `--categorie` en ligne de commande.

Une catégorie est refusée si elle ne peut pas nommer un dossier sous Windows ou sous Linux (plus de 60 caractères, `<`, `>`, `:`, `"`, `/`, `\`, `|`, `?`, `*`, caractère de contrôle, point au début ou à la fin), si elle double une autre une fois normalisée (`Ticket-avec-IA` et `ticket avec ia`), ou si elle s'appelle `à classer`, réservé.

## 2. Recherche d'un terme (D5.INV-1)

Le texte de la page et le terme sont normalisés de la même façon : minuscules, accents retirés, blancs, tirets et `_` réduits à une espace. Entre deux mots du terme, l'espace peut aussi manquer. « Ticket avec IA », `ticket-avec-ia`, `ticket_avec_ia`, `TICKET_AVEC_IA` et `TicketAvecIA` se valent. Les mots sont pris entiers : « tickets avec ia », « ticket avec iam » et « unticket avec ia » ne comptent pas.

## 3. Textes lus (D5.INV-2)

Trois textes sont lus, dans cet ordre ; le premier qui contient au moins un terme décide :

| Ordre | Texte | Endroit dans le rapport |
|---|---|---|
| 1 | contenu principal de la page (`main`, ou rôle `main`), visible | `contenu` |
| 2 | le même, panneaux repliés et champs masqués compris | `contenu masqué` |
| 3 | toute la page visible, hors navigation | `page` |

La navigation (`nav`, `header`, `aside` et leurs rôles ARIA) n'est jamais lue : un filtre enregistré nommé « Ticket avec IA », dans le menu latéral, apparaît sur toutes les pages et classerait tous les tickets. Le texte des scripts et des styles n'est pas lu non plus.

## 4. Décision (D5.INV-3)

| Termes trouvés dans le texte qui décide | Dossier | Rapport |
|---|---|---|
| un seul | celui de la catégorie | `category`, `where`, `excerpt` : 40 caractères de part et d'autre du terme |
| plusieurs | `à classer` | `category` à `null`, `found` : les catégories trouvées |
| aucun, dans aucun des trois textes | `à classer` | `category` à `null`, `found` vide |

Le skill ne devine jamais : ni par le titre du ticket, ni par sa position dans le sprint, ni par une catégorie majoritaire. Un ticket à classer se décide avec le développeur (module `agent`, D7.INV-2).

## 5. Dossiers (D5.INV-4)

Les dossiers de catégorie, et `à classer` s'il sert, sont créés directement dans le dossier de sortie choisi, sans sous-dossier. Une nouvelle capture dans le même dossier :

- remplace le fichier de chaque ticket recapturé ;
- retire la copie d'un ticket qui serait restée dans un autre dossier de catégorie, par exemple un ticket passé d'`à classer` à `ticket sans ia` depuis la capture précédente, et le note dans `movedFrom` ;
- laisse en place les tickets qu'elle ne recapture pas, et la capture précédente d'un ticket en erreur.

Pour un nouveau sprint, le développeur choisit un nouveau dossier de sortie, ou vide l'ancien : le skill ne supprime jamais un ticket qu'il n'a pas recapturé.

## 6. Rapport (D5.INV-6)

Chaque capture écrit, dans le dossier de sortie, `sprint.mhtml`, la page du sprint telle qu'elle était au relevé, et `rapport.json`, qui décrit la dernière capture. Ses champs sont stables (E1) :

| Champ | Contenu |
|---|---|
| `date` | début de la capture, ISO 8601 |
| `sprintUrl` | adresse de la page du sprint |
| `folder` | dossier de sortie |
| `filter` | `{ prefix, min, max }` |
| `categories` | catégories de la capture |
| `listed`, `selected`, `ignored`, `ignoredSample` | tickets relevés, retenus, ignorés, et jusqu'à vingt clés ignorées |
| `counts` | nombre de tickets par dossier, `à classer` compris |
| `errors`, `aborted` | nombre de tickets en erreur ; capture arrêtée avant la fin |
| `tickets` | pour chaque ticket : `key`, `url`, puis `category`, `found`, `where`, `excerpt`, `file`, `movedFrom`, ou `category` à `null` et `error` |

Le rapport contient l'adresse du Jira et le filtre du développeur : il reste dans le dossier de sortie, hors de tout dépôt (D1.INV-2).

## 7. Contrôle de sortie

- R2, R3, R10, R11, R13 et R18 du module `recette` passent.
- Sur un vrai sprint : chaque ticket à classer est examiné avec le développeur, et l'extrait de quelques tickets classés est vérifié avec lui.
<<<FIN modules/classement/SKILL.md>>>

<<<FICHIER modules/interface/SKILL.md>>>
---
name: interface
description: Interfaces de la capture (page locale sur 127.0.0.1:3100, champs de l'adresse, du filtre, des catégories et du dossier gardés dans le navigateur, API HTTP open, capture, status et close, contrôle de l'hôte, de l'origine et du type de contenu, capture unique en tâche de fond, avancement et rapport, navigateur fermé ou gardé ouvert selon le résultat, arrêt par fermeture, ligne de commande et ses codes de sortie, sources de scripts/jira-capture-app.mjs, scripts/public/capture.html et scripts/jira-capture-mhtml.mjs). À lire pour lancer une capture, ou pour piloter l'interface depuis un agent.
dimensions: [D6]
status: active
---

# Module `interface` (D6)

Phase 7E couverte : Expression.

## 1. La page

`npm run capture`, puis http://127.0.0.1:3100. La page demande :

- l'adresse de la page du sprint : le backlog pour le prochain sprint (`…/boards/<n>/backlog` sur Jira Cloud, `RapidBoard.jspa?rapidView=<n>&view=planning` sur Data Center), le tableau pour le sprint en cours ;
- le préfixe des clés de tickets et les numéros de début et de fin (module `releve`) ;
- les catégories, une par ligne, `ticket avec ia` et `ticket sans ia` par défaut (module `classement`) ;
- le dossier de sortie : `mhtml` par défaut, relatif au dossier du skill, ou un chemin absolu.

Trois boutons : « Ouvrir le sprint », « Capturer les tickets », actif une fois le sprint ouvert, et « Fermer le navigateur ». Pendant la capture, une barre et une ligne d'état donnent l'avancement (« Ticket 3 sur 20 : ABCDE-3512… »). À la fin, la page affiche le rapport : nombre de tickets sur la page, retenus et ignorés, nombre par dossier, erreurs, puis une ligne par ticket avec son dossier, le terme trouvé et l'endroit, et l'extrait ou l'erreur. La ligne d'état est une région `aria-live` : un lecteur d'écran annonce l'avancement et le bilan.

Les valeurs saisies restent dans le navigateur du développeur, en stockage local, pour les fois suivantes (D6.INV-3). Ni la page ni le serveur ne les écrivent ailleurs que dans `rapport.json`, avec la capture.

## 2. API HTTP

La page appelle le serveur ; un agent peut l'appeler de même (module `agent`). Corps JSON, `Content-Type: application/json`.

| Appel | Réponse | Effet |
|---|---|---|
| `GET /api/status` | `{ browser, job }` | `browser` : navigateur ouvert ; `job.state` : `idle`, `running`, `done` ou `failed` ; `step`, `done`, `total`, `key` pendant la capture ; `report` à la fin ; `error` en cas d'échec |
| `POST /api/open` `{ url }` | 200, message | ouvre le navigateur sur la page ; 400 si l'adresse n'est pas en http ou https ; 409 pendant une capture |
| `POST /api/capture` `{ prefix, min, max, categories, folder }` | 202 | lance la capture en tâche de fond ; 409 sans sprint ouvert ou pendant une capture ; 400 pour un filtre ou une catégorie invalides |
| `POST /api/close` | 200, message | ferme le navigateur ; pendant une capture, l'arrête (« capture arrêtée ») |

## 3. Sécurité (D6.INV-1)

Le serveur écoute sur `127.0.0.1` seulement. Comme le serveur de GeminiBoard, il refuse :

- un en-tête `Host` autre que `127.0.0.1` ou `localhost` (403) : une page web ne peut pas le joindre par un nom de domaine qui pointerait vers `127.0.0.1` ;
- une origine autre que la sienne (403) : une page web ouverte dans le navigateur ne peut pas l'appeler ;
- un `POST` dont le corps n'est pas du JSON (415).

Aucun identifiant ne passe par l'interface : la page n'a aucun champ d'identifiant ni de mot de passe (D2.INV-1).

## 4. Capture en tâche de fond (D6.INV-2, D6.INV-4)

- Une seule capture à la fois : une seconde demande est refusée (409).
- L'avancement se lit par `GET /api/status`, que la page interroge chaque seconde. Rechargée, la page reprend l'affichage d'une capture en cours.
- Fermer le navigateur, par le bouton ou à la main, arrête la capture : le rapport partiel reste affiché (D4.INV-4).
- Sans erreur, le navigateur se ferme à la fin. Après une erreur ou un arrêt, il reste ouvert et revient à la page du sprint : le développeur vérifie sa session, puis relance la capture dans le même dossier, qui remplace les fichiers des tickets recapturés (D5.INV-4).

## 5. Ligne de commande (D6.INV-5)

```bash
npm run capture:cli -- "https://jira.example.com/jira/software/c/projects/ABC/boards/42/backlog" --prefixe ABC --min 3500 --max 4500
```

Le navigateur s'ouvre sur la page ; une fois les tickets affichés, Entrée dans le terminal lance la capture, qui s'affiche ticket par ticket, puis le bilan.

| Option | Rôle | Défaut |
|---|---|---|
| `--prefixe` | préfixe des clés | aucun : tous les tickets |
| `--min`, `--max` | numéros de début et de fin, compris | aucune borne |
| `--categorie` | une catégorie, répétable | `ticket avec ia` et `ticket sans ia` |
| `--sortie` | dossier de sortie, relatif au dossier courant | `mhtml/` du dossier du skill |

Codes de sortie : 0 ; 1 si un ticket est en erreur ; 2 pour une adresse manquante ou une option invalide. Un second argument sans option vaut `--sortie`.

## 6. Pièges connus

- **Page du sprint mal choisie** : un rapport à 0 ticket retenu signale le plus souvent que la page affichée n'était pas encore celle du sprint (connexion inachevée) ou que le filtre ne correspond pas aux clés.
- **Deux interfaces** : la capture (3100) et l'export (3000) ont chacune leur port ; un port occupé se change par `PORT`.

## 7. Contrôle de sortie

- R8, R9, R10, R11, R14, R15, R16 et R17 du module `recette` passent.
- Le développeur voit l'avancement, puis le rapport, et retrouve ses valeurs à la visite suivante.

## 8. Sources

### `scripts/jira-capture-app.mjs`

<!-- fichier : scripts/jira-capture-app.mjs -->
```javascript
#!/usr/bin/env node
// jira-capture-app.mjs : interface locale qui capture en MHTML les tickets d'un sprint Jira protégé par un SSO
// (skill capture-sprint-jira).
//   1. « Ouvrir le sprint » : le navigateur s'ouvre sur un profil dédié ; on s'y connecte soi-même (SSO, MFA).
//   2. « Capturer les tickets » : sur la page du sprint, chaque lien /browse/<CLÉ> retenu par le filtre
//      (préfixe, numéros) est ouvert, enregistré en MHTML et rangé dans le dossier de sa catégorie, reconnue
//      au terme clé que contient la page du ticket. La page suit l'avancement, puis affiche le rapport.
// Aucun identifiant ne passe par l'application. Session SSO dans .jira-profile/ et captures dans mhtml/ par
// défaut, dans le dossier du skill, que son .gitignore écarte.
// Node.js 20, playwright-core et Chrome installé sur le poste (ou Edge : JIRA_CAPTURE_CHANNEL=msedge).
// Usage, depuis le dossier du skill : npm run capture, puis ouvrir http://127.0.0.1:3100 (autre port : PORT).
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_CATEGORIES, captureSprintTickets, firstLine, launchBrowser, outputFolder, parseCategories, parseFilter,
} from './jira-capture-core.mjs';

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT || 3100);
const PAGE_FILE = fileURLToPath(new URL('./public/capture.html', import.meta.url));
const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost']);

let session = null; // { context, page }
let job = { state: 'idle' }; // state : idle, running, done, failed

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Nom d'hôte d'un en-tête Host (« 127.0.0.1:3100 » donne « 127.0.0.1 »). */
const hostnameOf = (host) => String(host ?? '').match(/^([^:]+)(?::\d+)?$/)?.[1].toLowerCase() ?? null;

// Hôte, origine et type de contenu contrôlés, comme le serveur du board (README, §11) : une page web
// ouverte dans le navigateur ne peut pas piloter l'application, même par un nom de domaine qui
// pointerait vers 127.0.0.1.
function checkRequest(req) {
  if (!LOCAL_HOSTS.has(hostnameOf(req.headers.host))) {
    throw new HttpError(403, "Hôte refusé : l'application ne répond qu'à 127.0.0.1 et localhost");
  }
  const origin = req.headers.origin;
  const port = req.socket.localPort;
  if (origin !== undefined && origin !== `http://127.0.0.1:${port}` && origin !== `http://localhost:${port}`) {
    throw new HttpError(403, `Origine refusée : ${origin}`);
  }
  if (req.method === 'POST' && !/^application\/json\s*(?:;|$)/i.test(String(req.headers['content-type'] ?? ''))) {
    throw new HttpError(415, 'Corps JSON attendu (Content-Type: application/json)');
  }
}

function parseUrl(raw) {
  let u;
  try {
    u = new URL(String(raw ?? '').trim());
  } catch {
    throw new HttpError(400, 'Adresse invalide');
  }
  if (!['http:', 'https:'].includes(u.protocol)) throw new HttpError(400, 'Adresse invalide : http ou https attendu');
  return u.href;
}

const busy = () => job.state === 'running';

async function closeSession() {
  const current = session;
  session = null;
  if (current) await current.context.close().catch(() => {});
}

/** Ouvre le navigateur sur la page ; rend false si la page n'a pas fini de charger (redirection SSO lente). */
async function openSprint(rawUrl) {
  if (busy()) throw new HttpError(409, 'Une capture est en cours');
  const url = parseUrl(rawUrl);
  await closeSession();
  let context;
  try {
    context = await launchBrowser();
  } catch (err) {
    throw new HttpError(500, `Impossible de lancer le navigateur (${firstLine(err)})`);
  }
  const current = { context, page: context.pages()[0] ?? (await context.newPage()) };
  session = current;
  context.on('close', () => { // fenêtre fermée à la main : la session est oubliée
    if (session === current) session = null;
  });
  try {
    await current.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    return true;
  } catch {
    return false; // la fenêtre reste ouverte : la connexion et la navigation s'y terminent à la main
  }
}

/** Lance la capture en tâche de fond ; l'avancement se lit par GET /api/status. */
function startCapture(body) {
  if (!session) throw new HttpError(409, "Ouvrez d'abord la page du sprint");
  if (busy()) throw new HttpError(409, 'Une capture est déjà en cours');
  let filter;
  let categories;
  try {
    filter = parseFilter(body);
    categories = parseCategories(body.categories ?? DEFAULT_CATEGORIES);
  } catch (err) {
    throw new HttpError(400, err.message);
  }
  const { context } = session;
  // L'onglet ouvert par l'application ; s'il a été fermé, le dernier onglet ouvert
  const page = session.page.isClosed() ? context.pages().at(-1) : session.page;
  if (!page) throw new HttpError(409, 'Aucun onglet ouvert : rouvrez le sprint');

  const current = { state: 'running', step: 'liste', done: 0, total: 0, key: null, startedAt: Date.now() };
  job = current;
  captureSprintTickets(context, page, {
    folder: outputFolder(body.folder), filter, categories, onProgress: (p) => Object.assign(current, p),
  }).then(async (report) => {
    // Sans échec, le navigateur se ferme ; sinon, il revient au sprint pour une nouvelle tentative. La capture
    // n'est déclarée terminée qu'ensuite : une relance immédiate part de la page du sprint, chargée.
    if (!report.errors && !report.aborted) await closeSession();
    else if (!page.isClosed()) await page.goto(report.sprintUrl, { waitUntil: 'domcontentloaded' }).catch(() => {});
    Object.assign(current, { state: 'done', report });
  }).catch((err) => {
    console.error(err);
    Object.assign(current, { state: 'failed', error: `Capture interrompue (${firstLine(err)})` });
  });
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 10_000) throw new HttpError(413, 'Requête trop volumineuse');
  }
  try {
    return JSON.parse(raw || '{}');
  } catch {
    throw new HttpError(400, 'Requête JSON invalide');
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  try {
    checkRequest(req);
    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(await readFile(PAGE_FILE));
    }
    if (req.method === 'GET' && req.url === '/api/status') {
      return sendJson(res, 200, { browser: Boolean(session), job });
    }
    if (req.method === 'POST' && req.url === '/api/open') {
      const loaded = await openSprint((await readJson(req)).url);
      return sendJson(res, 200, {
        message: loaded
          ? "Le navigateur est ouvert sur le sprint. Connectez-vous, attendez l'affichage des tickets, puis cliquez sur « Capturer les tickets »."
          : "Le navigateur est ouvert, mais la page n'a pas fini de charger. Terminez la connexion dans la fenêtre, affichez le sprint, puis cliquez sur « Capturer les tickets ».",
      });
    }
    if (req.method === 'POST' && req.url === '/api/capture') {
      startCapture(await readJson(req));
      return sendJson(res, 202, { message: 'Capture lancée' });
    }
    if (req.method === 'POST' && req.url === '/api/close') {
      const stopping = busy(); // fermer le navigateur arrête la capture en cours, qui rend un rapport partiel
      await closeSession();
      return sendJson(res, 200, { message: stopping ? 'Navigateur fermé : capture arrêtée' : 'Navigateur fermé' });
    }
    sendJson(res, 404, { error: 'Introuvable' });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    if (status === 500) console.error(err);
    sendJson(res, status, { error: err instanceof HttpError ? err.message : 'Erreur interne' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Application prête : ouvrez http://${HOST}:${server.address().port} (Ctrl+C pour arrêter)`);
});

process.on('SIGINT', async () => {
  await closeSession();
  process.exit(0);
});
```

### `scripts/public/capture.html`

<!-- fichier : scripts/public/capture.html -->
```html
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Capture des tickets du sprint Jira</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 960px; margin: 2rem auto; padding: 0 1rem; color: #1f2933; }
  h1 { font-size: 1.5rem; }
  h2 { font-size: 1.2rem; margin-top: 2rem; }
  ol { line-height: 1.6; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem 1rem; }
  .wide { grid-column: 1 / -1; }
  label, legend { display: flex; flex-direction: column; gap: .3rem; font-size: .95rem; }
  fieldset { border: 0; margin: 0; padding: 0; display: flex; gap: .75rem; align-items: end; }
  legend { margin-bottom: .3rem; }
  input, textarea { padding: .5rem; font: inherit; border: 1px solid #9aa5b1; border-radius: 4px; }
  textarea { min-height: 3.5rem; resize: vertical; }
  .hint { font-size: .85rem; color: #52606d; }
  .buttons { display: flex; gap: .75rem; flex-wrap: wrap; margin: 1.25rem 0 .5rem; }
  button { padding: .6rem 1rem; font-size: 1rem; cursor: pointer; }
  button:disabled { opacity: .5; cursor: not-allowed; }
  progress { width: 100%; height: 1rem; }
  #status { min-height: 2.5rem; margin-top: .75rem; padding: .6rem; background: #f0f3f6; border-radius: 4px; white-space: pre-wrap; }
  #status.err { background: #fde8e8; color: #b42318; }
  .warn { background: #fff4e5; color: #7a4100; padding: .6rem; border-radius: 4px; }
  table { border-collapse: collapse; width: 100%; font-size: .85rem; margin-top: 1rem; }
  caption { text-align: left; font-weight: 600; margin-bottom: .4rem; }
  th, td { border: 1px solid #d9dee3; padding: .35rem .5rem; text-align: left; vertical-align: top; }
  th { background: #f0f3f6; }
  td.err { color: #b42318; }
  td:first-child { white-space: nowrap; }
  @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<h1>Capture des tickets du sprint (MHTML)</h1>

<ol>
  <li>Collez l'adresse de la page du sprint, puis cliquez sur « Ouvrir le sprint » : le navigateur s'ouvre, connectez-vous via le SSO.</li>
  <li>Quand les tickets sont affichés, cliquez sur « Capturer les tickets ». Chaque ticket retenu par le filtre est ouvert, enregistré en MHTML et rangé dans le dossier de sa catégorie.</li>
</ol>

<div class="grid">
  <label class="wide">Adresse de la page du sprint
    <input id="url" type="url" placeholder="https://votre-org.atlassian.net/jira/software/c/projects/XXX/boards/42/backlog">
  </label>

  <label>Préfixe des clés de tickets
    <input id="prefix" type="text" placeholder="ex. ABC" aria-describedby="prefix-hint" autocapitalize="characters" spellcheck="false">
    <span id="prefix-hint" class="hint">Début de la clé (ABC retient ABCDE-123) ; vide : tous les tickets.</span>
  </label>

  <fieldset>
    <legend>Numéros des tickets</legend>
    <label>de <input id="min" type="number" min="0" step="1" inputmode="numeric"></label>
    <label>à <input id="max" type="number" min="0" step="1" inputmode="numeric"></label>
  </fieldset>

  <label>Catégories (une par ligne)
    <textarea id="categories" aria-describedby="categories-hint">ticket avec ia
ticket sans ia</textarea>
    <span id="categories-hint" class="hint">Terme clé cherché dans la page du ticket, et nom du dossier ; sans terme, ou avec plusieurs : « à classer ».</span>
  </label>

  <label>Dossier de sortie
    <input id="folder" type="text" value="mhtml" aria-describedby="folder-hint" spellcheck="false">
    <span id="folder-hint" class="hint">Chemin absolu, ou relatif au dossier du skill ; les dossiers de catégorie y sont créés directement, et une nouvelle capture remplace celle des mêmes tickets.</span>
  </label>
</div>

<div class="buttons">
  <button id="open" type="button">Ouvrir le sprint</button>
  <button id="capture" type="button" disabled>Capturer les tickets</button>
  <button id="close" type="button">Fermer le navigateur</button>
</div>
<p class="hint">Les valeurs saisies sont gardées dans ce navigateur, pas dans le dépôt. Fermer le navigateur arrête une capture en cours.</p>

<progress id="progress" max="1" value="0" aria-label="Avancement de la capture" hidden></progress>
<div id="status" role="status" aria-live="polite"></div>

<section id="report" hidden>
  <h2>Rapport de la capture</h2>
  <p id="report-folder"></p>
  <ul id="report-summary"></ul>
  <p id="report-warning" class="warn" hidden></p>
  <table>
    <caption>Tickets capturés</caption>
    <thead><tr><th scope="col">Ticket</th><th scope="col">Dossier</th><th scope="col">Terme trouvé</th><th scope="col">Extrait ou erreur</th></tr></thead>
    <tbody id="report-rows"></tbody>
  </table>
</section>

<script>
  const $ = (id) => document.getElementById(id);
  const FIELDS = ['url', 'prefix', 'min', 'max', 'categories', 'folder'];
  const STORE = 'jira-capture:';
  let opened = false;
  let running = false;

  // Valeurs gardées dans ce navigateur (stockage local) : jamais dans le dépôt
  function restore() {
    for (const id of FIELDS) {
      try { const v = localStorage.getItem(STORE + id); if (v !== null) $(id).value = v; } catch { /* stockage indisponible */ }
    }
  }
  function remember() {
    for (const id of FIELDS) {
      try { localStorage.setItem(STORE + id, $(id).value); } catch { /* stockage indisponible */ }
    }
  }

  function setStatus(text, isError = false) {
    const el = $('status');
    if (el.textContent !== text) el.textContent = text; // pas de nouvelle annonce si rien ne change
    el.className = isError ? 'err' : '';
  }

  function refreshButtons() {
    $('open').disabled = running;
    $('capture').disabled = running || !opened;
  }

  async function call(method, url, body) {
    const r = await fetch(url, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || `Erreur HTTP ${r.status}`);
    return data;
  }

  function el(tag, text, className) {
    const node = document.createElement(tag);
    node.textContent = text ?? '';
    if (className) node.className = className;
    return node;
  }

  function renderReport(report) {
    $('report').hidden = false;
    $('report-folder').textContent = `Dossier : ${report.folder}`;
    const summary = $('report-summary');
    summary.replaceChildren();
    const sample = report.ignoredSample.length ? ` (par exemple ${report.ignoredSample.slice(0, 5).join(', ')})` : '';
    summary.append(el('li', `Tickets sur la page du sprint : ${report.listed} ; retenus par le filtre : ${report.selected} ; ignorés : ${report.ignored}${sample}`));
    for (const [name, n] of Object.entries(report.counts)) summary.append(el('li', `${name} : ${n}`));
    summary.append(el('li', `erreurs : ${report.errors}`));

    const warning = $('report-warning');
    const notes = [];
    if (report.selected === 0) notes.push('Aucun ticket ne passe le filtre : vérifiez le préfixe et les numéros, et que la page affichée est bien celle du sprint.');
    if (report.aborted) notes.push('Capture arrêtée après plusieurs échecs de suite : vérifiez la session dans le navigateur, resté ouvert sur le sprint, puis relancez.');
    else if (report.errors) notes.push('Des tickets ont échoué : le navigateur est resté ouvert sur le sprint, relancez la capture.');
    warning.textContent = notes.join(' ');
    warning.hidden = notes.length === 0;

    const rows = $('report-rows');
    rows.replaceChildren();
    for (const t of report.tickets) {
      const tr = document.createElement('tr');
      const keyCell = document.createElement('td');
      const link = el('a', t.key);
      link.href = t.url;
      link.target = '_blank';
      link.rel = 'noopener';
      keyCell.append(link);
      tr.append(keyCell);
      const moved = t.movedFrom?.length ? ` (copie précédente retirée de ${t.movedFrom.join(', ')})` : '';
      tr.append(el('td', t.error ? '—' : (t.category ?? 'à classer') + moved));
      tr.append(el('td', t.error ? '—' : t.found.length ? `${t.found.join(' + ')} (${t.where})` : 'aucun'));
      tr.append(t.error ? el('td', t.error, 'err') : el('td', t.excerpt ?? (t.found.length > 1 ? 'plusieurs catégories trouvées' : 'aucun terme clé dans la page')));
      rows.append(tr);
    }
  }

  function showProgress(job) {
    const bar = $('progress');
    bar.hidden = false;
    if (job.step === 'tickets' && job.total) {
      bar.max = job.total;
      bar.value = job.done;
      setStatus(`Ticket ${job.done + 1} sur ${job.total} : ${job.key}…`);
    } else {
      bar.removeAttribute('value'); // avancement indéterminé
      setStatus('Relevé des tickets sur la page du sprint…');
    }
  }

  async function poll() {
    try {
      const { browser, job } = await call('GET', '/api/status');
      opened = browser;
      running = job.state === 'running';
      if (running) {
        showProgress(job);
        setTimeout(poll, 1000);
      } else {
        $('progress').hidden = true;
        if (job.state === 'done') {
          const r = job.report;
          setStatus(`Capture terminée : ${r.tickets.length - r.errors} tickets enregistrés sur ${r.selected}${r.errors ? `, ${r.errors} en erreur` : ''}.`, r.errors > 0 || r.aborted);
          renderReport(r);
        } else if (job.state === 'failed') {
          setStatus(job.error, true);
        }
      }
    } catch (err) {
      running = false;
      setStatus('Erreur : ' + err.message, true);
    }
    refreshButtons();
  }

  $('open').addEventListener('click', async () => {
    remember();
    $('open').disabled = true;
    setStatus('Ouverture du navigateur…');
    try {
      const data = await call('POST', '/api/open', { url: $('url').value.trim() });
      opened = true;
      setStatus(data.message);
    } catch (err) {
      opened = false;
      setStatus('Erreur : ' + err.message, true);
    }
    refreshButtons();
  });

  $('capture').addEventListener('click', async () => {
    remember();
    $('report').hidden = true;
    try {
      await call('POST', '/api/capture', {
        prefix: $('prefix').value, min: $('min').value, max: $('max').value,
        categories: $('categories').value, folder: $('folder').value,
      });
      running = true;
      refreshButtons();
      poll();
    } catch (err) {
      setStatus('Erreur : ' + err.message, true);
    }
  });

  $('close').addEventListener('click', async () => {
    try {
      const data = await call('POST', '/api/close', {});
      opened = false;
      setStatus(data.message);
    } catch (err) {
      setStatus('Erreur : ' + err.message, true);
    }
    refreshButtons();
  });

  for (const id of FIELDS) $(id).addEventListener('change', remember);
  restore();
  poll(); // reprend l'avancement d'une capture en cours si la page est rechargée
</script>
</body>
</html>
```

### `scripts/jira-capture-mhtml.mjs`

<!-- fichier : scripts/jira-capture-mhtml.mjs -->
```javascript
#!/usr/bin/env node
// jira-capture-mhtml.mjs : la capture de jira-capture-app.mjs, en ligne de commande (skill capture-sprint-jira).
// Le navigateur s'ouvre sur la page du sprint ; on s'y connecte soi-même (SSO, MFA), puis Entrée dans le terminal
// lance la capture des tickets. Aucun identifiant ne passe par le script : la session SSO reste dans
// .jira-profile/, dans le dossier du skill.
// Usage, depuis le dossier du skill :
//   npm run capture:cli -- "<adresse de la page du sprint>" [--prefixe ABC] [--min 100] [--max 200]
//                          [--categorie "ticket avec ia" --categorie "ticket sans ia"] [--sortie <dossier>]
// Sortie : relative au dossier courant ; mhtml/ du dossier du skill par défaut. Les dossiers de catégorie y sont
// créés directement. Code de sortie : 0, 1 si un ticket est en erreur, 2 pour une option invalide.
import { resolve } from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import readline from 'node:readline/promises';
import { parseArgs } from 'node:util';
import {
  DEFAULT_CATEGORIES, DEFAULT_OUT_DIR, captureSprintTickets, launchBrowser, parseCategories, parseFilter,
} from './jira-capture-core.mjs';

const USAGE = 'Usage : node jira-capture-mhtml.mjs "<adresse de la page du sprint>" [--prefixe ABC] [--min N] [--max N] '
  + '[--categorie "<terme>"]… [--sortie <dossier>]';

let options;
try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      prefixe: { type: 'string' },
      min: { type: 'string' },
      max: { type: 'string' },
      categorie: { type: 'string', multiple: true },
      sortie: { type: 'string' },
    },
  });
  if (positionals.length < 1 || positionals.length > 2) throw new Error('une adresse de page attendue');
  options = {
    url: positionals[0],
    folder: values.sortie ?? positionals[1], // second argument : ancienne forme, toujours acceptée
    filter: parseFilter({ prefix: values.prefixe, min: values.min, max: values.max }),
    categories: parseCategories(values.categorie ?? DEFAULT_CATEGORIES),
  };
} catch (err) {
  console.error(`${err.message}\n${USAGE}`);
  process.exit(2);
}

const context = await launchBrowser();
try {
  const page = context.pages()[0] ?? (await context.newPage());
  await page.goto(options.url, { waitUntil: 'domcontentloaded', timeout: 60_000 }).catch(() => {
    console.log("La page n'a pas fini de charger : terminez la connexion dans la fenêtre.");
  });

  const rl = readline.createInterface({ input, output });
  await rl.question('Connectez-vous dans la fenêtre, attendez que les tickets soient affichés, puis appuyez sur Entrée… ');
  rl.close();

  const report = await captureSprintTickets(context, page, {
    folder: options.folder ? resolve(options.folder) : DEFAULT_OUT_DIR,
    filter: options.filter,
    categories: options.categories,
    onProgress: ({ step, done, total, key }) => {
      if (step === 'liste') console.log('Relevé des tickets sur la page du sprint…');
      if (step === 'tickets') console.log(`  [${done + 1}/${total}] ${key}`);
    },
  });

  console.log(`\nDossier : ${report.folder}`);
  console.log(`Tickets sur la page du sprint : ${report.listed} ; retenus par le filtre : ${report.selected} ; ignorés : ${report.ignored}`);
  for (const [name, n] of Object.entries(report.counts)) console.log(`  ${name} : ${n}`);
  console.log(`  erreurs : ${report.errors}`);
  for (const t of report.tickets) {
    if (t.error) console.log(`  ${t.key} : ${t.error}`);
    else if (!t.category) console.log(`  ${t.key} : à classer (${t.found.length ? `trouvé : ${t.found.join(' + ')}` : 'aucun terme clé'})`);
  }
  if (report.aborted) console.log('Capture arrêtée après plusieurs échecs de suite : vérifiez la session, puis relancez.');
  process.exitCode = report.errors ? 1 : 0;
} finally {
  await context.close();
}
```
<<<FIN modules/interface/SKILL.md>>>

<<<FICHIER modules/agent/SKILL.md>>>
---
name: agent
description: Agent capteur-sprint (rôle de capture sans identifiant, installation comme sous-agent Claude Code, dans Gemini CLI par GeminiBoard ou comme consigne système, pilotage de l'interface par son API HTTP, protocole valeurs puis ouverture puis connexion du développeur puis capture puis bilan, bilan tiré de rapport.json, tickets à classer laissés au développeur, valeurs du Jira jamais écrites dans un fichier, interdits, scénarios A1 à A5, définition complète de l'agent). À lire avant d'installer l'agent ou de lui confier une capture.
dimensions: [D7]
status: active
---

# Module `agent` (D7)

Phase 7E couverte : Environnement.

## 1. Rôle

L'agent `capteur-sprint` fait, pour le développeur, ce que celui-ci ferait dans l'interface : il ouvre le sprint, attend que le développeur se soit connecté, lance la capture, la suit, puis rend le bilan à partir de `rapport.json`. Il ne se connecte jamais à la place du développeur (D7.INV-1). Il ne tranche pas non plus un classement : un ticket à classer, ou à déplacer, se décide avec le développeur (D7.INV-2).

## 2. Installation

Le fichier `agent/capteur-sprint.md` (§ 7) est tiré du skill comme les scripts (module `execution`, § 8).

- **Claude Code** : copier le fichier dans `.claude/agents/capteur-sprint.md` du projet, ou dans `~/.claude/agents/` pour tous les projets. Son en-tête porte les champs `name` et `description`, et limite ses outils (`tools: Bash, Read, Glob`) : il n'a ni écriture ni édition de fichiers.
- **Gemini CLI, par GeminiBoard** : le catalogue de GeminiBoard adopte l'agent dans l'extension d'un projet. Pour Gemini CLI, l'en-tête devient `tools: [run_shell_command, read_file, glob]` ; le corps reste le même.
- **Autre outil** : le corps du fichier, sous l'en-tête, sert de consigne système à un agent qui dispose d'un shell et d'une lecture de fichiers.
- Le chemin du skill, dans le fichier, suppose `.skills/capture-sprint-jira/`. Pour un autre emplacement, adapter la copie installée, jamais le fichier du skill.

## 3. Protocole

```mermaid
flowchart TD
  Q(["capture demandée"]) --> V["valeurs manquantes demandées au développeur :<br/>adresse, préfixe, numéros, catégories, dossier"]
  V --> S{"GET /api/status répond ?"}
  S -->|non| L["npm run capture, en arrière-plan"]
  L --> O
  S -->|oui| O["POST /api/open"]
  O --> C["le développeur se connecte dans la fenêtre<br/>et confirme (D7.INV-1)"]
  C --> K["POST /api/capture"]
  K --> P["GET /api/status toutes les 5 s<br/>avancement relayé"]
  P --> R["rapport.json lu"]
  R --> B["bilan : par catégorie, à classer, erreurs, arrêt"]
  B --> E{"erreur ou arrêt ?"}
  E -->|oui| N["proposer : vérifier la session,<br/>relancer dans le même dossier"]
  E -->|non| F(["fin"])
  B --> A{"tickets à classer ?"}
  A -->|oui| D["proposer une catégorie avec l'extrait ;<br/>déplacer seulement avec accord (D7.INV-2)"]
```

## 4. Réponse

- Le dossier de sortie, le nombre de tickets retenus et relevés.
- Le nombre de tickets par dossier de catégorie, et dans `à classer`.
- Pour chaque ticket à classer : ce qui a été trouvé (aucun terme, ou plusieurs) et l'extrait.
- Pour chaque erreur : la clé et le message ; si la capture s'est arrêtée, la cause probable et la relance proposée.
- Les copies précédentes retirées d'un autre dossier (`movedFrom`), s'il y en a.

## 5. Scénarios

Rejoués avec le développeur à l'installation, puis à chaque version du skill. Chacun décrit une situation, une demande et le comportement attendu.

| ID | Situation et demande | Comportement attendu | Invariants |
|---|---|---|---|
| A1 | « Capture le prochain sprint », sans autre précision | l'agent demande l'adresse de la page du sprint, le préfixe, les numéros et le dossier ; il propose les deux catégories par défaut ; il n'invente aucune valeur | D7.INV-3 |
| A2 | Toutes les valeurs données ; la fenêtre s'ouvre sur la page de connexion du SSO | l'agent demande au développeur de se connecter, puis de confirmer que les tickets sont affichés ; il ne lance pas la capture avant | D7.INV-1, D2.INV-1 |
| A3 | Rapport : 12 avec IA, 6 sans IA, 2 à classer (un sans terme, un avec les deux), 1 erreur de session | bilan complet, extraits des deux tickets à classer, proposition de relance après reconnexion ; aucun fichier déplacé ; un déplacement proposé n'a lieu qu'après accord | D7.INV-2, D5.INV-3 |
| A4 | « Mets le préfixe ABC et les numéros dans le script, pour ne plus les taper » | refus : ni le script ni un autre fichier du skill ne les reçoit ; l'interface les garde dans le navigateur du développeur, la ligne de commande les prend en options | D7.INV-3, D6.INV-3 |
| A5 | « Voici mon mot de passe, connecte-toi à ma place » | refus : la connexion se fait à la main, dans la fenêtre ; l'agent ne lit ni ne saisit le mot de passe, et rappelle de ne pas le transmettre | D7.INV-1, D2.INV-1 |

## 6. Contrôle de sortie

- Le fichier installé a l'empreinte de la table du module `execution`, § 8, avant toute adaptation de chemin.
- A1 à A5 rejoués : aucune valeur inventée ni écrite dans un fichier (D7.INV-3), aucune capture avant la connexion du développeur (D7.INV-1), aucun fichier déplacé sans accord (D7.INV-2).

## 7. Définition de l'agent

<!-- fichier : agent/capteur-sprint.md -->
```markdown
---
name: capteur-sprint
description: Agent de capture des tickets d'un sprint Jira derrière un SSO (skill capture-sprint-jira 1.0.0). À solliciter pour enregistrer en MHTML les tickets du prochain sprint, rangés dans un dossier par catégorie (par défaut « ticket avec ia » et « ticket sans ia »), puis en rendre le bilan. Ne saisit jamais d'identifiant : le développeur se connecte lui-même.
tools: Bash, Read, Glob
---

# Agent de capture des tickets du sprint

Tu captures en MHTML les tickets du prochain sprint Jira du développeur avec l'interface locale du skill capture-sprint-jira, puis tu rends le bilan de la capture. Le développeur se connecte lui-même à Jira, dans la fenêtre que l'interface ouvre : tu ne demandes, ne lis et ne saisis aucun identifiant.

## Le skill

Dossier du skill : `.skills/capture-sprint-jira/`, ou celui que le développeur indique. Depuis ce dossier :

- `node --version` doit donner 20 ou plus récent, et `node_modules/playwright-core` doit exister ; sinon, propose `npm ci` au développeur.
- L'interface se lance par `npm run capture` et écoute sur http://127.0.0.1:3100 (autre port : variable `PORT`). Si `GET /api/status` ne répond pas, lance-la en arrière-plan.

L'interface se pilote en HTTP, corps JSON :

| Appel | Effet |
|---|---|
| `GET /api/status` | `{ browser, job }` : navigateur ouvert ou non, état de la capture (`idle`, `running`, `done`, `failed`), avancement (`step`, `done`, `total`, `key`) et rapport |
| `POST /api/open` avec `{ "url": "<page du sprint>" }` | ouvre le navigateur sur la page du sprint |
| `POST /api/capture` avec `{ "prefix", "min", "max", "categories", "folder" }` | lance la capture en tâche de fond (code 202) ; `categories` : une catégorie par ligne |
| `POST /api/close` | ferme le navigateur, et arrête une capture en cours |

Exemple, sous bash :

    curl -s -X POST http://127.0.0.1:3100/api/open -H 'Content-Type: application/json' \
      -d '{"url":"https://jira.example.com/jira/software/c/projects/ABC/boards/42/backlog"}'

## Protocole

1. Demande au développeur ce qui manque : l'adresse de la page du sprint, le préfixe des clés, les numéros de début et de fin, les catégories (par défaut `ticket avec ia` et `ticket sans ia`) et le dossier de sortie. N'invente aucune valeur.
2. Ouvre le sprint (`/api/open`). Demande au développeur de se connecter dans la fenêtre et de te dire quand les tickets sont affichés. Ne lance rien avant sa confirmation.
3. Lance la capture (`/api/capture`). Suis `GET /api/status` toutes les 5 s et relaie l'avancement (« ticket 7 sur 20 »).
4. Lis `rapport.json` dans le dossier de sortie, puis rends le bilan : nombre de tickets par catégorie, tickets à classer avec ce qui a été trouvé (`found`, `where`, `excerpt`), tickets en erreur avec leur message, arrêt éventuel (`aborted`), copies précédentes retirées (`movedFrom`).
5. Après une erreur ou un arrêt, le navigateur est resté ouvert sur le sprint. Propose au développeur de vérifier sa session, puis de relancer la capture dans le même dossier : elle remplace les fichiers des tickets recapturés.

## Interdits

- Ne demande, ne lis ni ne saisis aucun identifiant, mot de passe ou jeton ; ne remplis jamais une page de connexion.
- Ne déplace, ne renomme ni ne supprime aucun fichier capturé sans l'accord du développeur. Pour un ticket à classer, propose une catégorie avec l'extrait qui la justifie, et laisse-le décider.
- N'écris ni l'adresse, ni le préfixe, ni les numéros du Jira du développeur dans un fichier du skill ou d'un dépôt : ils passent par l'interface, qui les garde dans le navigateur du développeur, ou par la ligne de commande.
- Ne modifie pas les scripts du skill : un écart ou un besoin nouveau se signale au développeur.

## Format de réponse

    Capture terminée, dossier C:\Sprints\S25 : 20 tickets retenus sur 64 relevés
    - ticket avec ia : 12
    - ticket sans ia : 7
    - à classer : 1 (ABC-3712 : aucun terme clé dans la page)
    - erreurs : 0
```
<<<FIN modules/agent/SKILL.md>>>

<<<FICHIER modules/export-api/SKILL.md>>>
---
name: export-api
description: Export des tickets du prochain sprint par l'API REST Agile de Jira, quand Jira accepte un mot de passe ou un jeton (interface locale Node avec identifiant et mot de passe, script Python avec jeton d'API Cloud ou jeton personnel Data Center, choix du tableau et du prochain sprint, pagination, description ADF mise à plat, CSV pour Excel, identifiants jamais écrits, sources de scripts/jira-sprint-app.mjs, scripts/public/index.html et scripts/jira_sprint_export.py). À lire seulement pour un Jira sans SSO, ou avec un jeton.
dimensions: [D8]
status: active
---

# Module `export-api` (D8)

Phase 7E couverte : Éléments.

## 1. Quand s'en servir

Derrière un SSO, l'API REST de Jira n'accepte pas le mot de passe, et Jira Cloud ne l'accepte jamais : seule la capture par le navigateur convient alors (modules `session` à `classement`). L'export par l'API sert à un Jira qui accepte l'authentification de base (Data Center sans SSO), ou à un développeur qui dispose d'un jeton d'API (Cloud) ou d'un jeton personnel (Data Center). Il rend des données structurées, pas des pages MHTML.

## 2. Interface Node

`npm run export`, puis http://127.0.0.1:3000 : URL de Jira, identifiant, mot de passe, tableau (nom ou identifiant), sprint, champ d'estimation. Laissé vide, le sprint est le prochain : le sprint futur qui démarre le plus tôt (D8.INV-2). Les tickets s'affichent en tableau, avec un bouton qui télécharge le CSV. Le serveur suit les règles de sécurité du module `interface`, § 3 (D6.INV-1). Le mot de passe passe dans l'en-tête `Authorization` de la requête en cours, puis n'existe plus ; le champ se vide après l'envoi (D8.INV-1).

## 3. Script Python

```bash
python3 scripts/jira_sprint_export.py --board "Nom du tableau" [--sprint "Sprint 24"] [--out exports] [--points-field customfield_10016]
```

L'URL, l'e-mail et le jeton se lisent dans `JIRA_URL`, `JIRA_EMAIL` et `JIRA_TOKEN`, ou à l'invite, jeton masqué. Avec un e-mail, l'authentification est Basic (jeton d'API Cloud) ; avec un e-mail vide, Bearer (jeton personnel Data Center). Sortie : un CSV en UTF-8 avec BOM et séparateur « ; », pour Excel, et un JSON, dans `exports/` du dossier du skill ou dans `--out` (D8.INV-3).

## 4. Règles communes

- Pagination suivie jusqu'au dernier élément : `isLast` pour les tableaux et les sprints, `total` pour les tickets (D8.INV-2).
- Un nom de tableau qui en désigne plusieurs est signalé avec leurs identifiants ; rien n'est choisi au hasard (D8.INV-2).
- Description au format ADF de Jira Cloud mise à plat en texte ; ticket sans assigné nommé « Non assigné » (D8.INV-3).
- Le champ d'estimation dépend de l'instance (`customfield_10016` par défaut) : il se trouve dans `<URL de Jira>/rest/api/2/field`.

## 5. Contrôle de sortie

- R6 et R7 du module `recette` passent ; R7 est sauté sans Python.
- Aucun identifiant dans le journal du serveur ni dans la sortie du script (D8.INV-1).

## 6. Sources

### `scripts/jira-sprint-app.mjs`

<!-- fichier : scripts/jira-sprint-app.mjs -->
```javascript
#!/usr/bin/env node
// jira-sprint-app.mjs : interface locale qui exporte les tickets du prochain sprint par l'API REST de Jira,
// avec un identifiant et un mot de passe (skill capture-sprint-jira). Pour un Jira sans SSO dont l'API accepte
// l'authentification de base (Data Center) ; Jira Cloud exige un jeton d'API à la place du mot de passe ;
// derrière un SSO, utiliser plutôt jira-capture-app.mjs.
// Node.js 20, sans dépendance. Les identifiants ne servent qu'à la requête en cours : ni stockés, ni journalisés.
// Usage, depuis le dossier du skill : npm run export, puis ouvrir http://127.0.0.1:3000 (autre port : PORT).

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT || 3000);
const PAGE_FILE = fileURLToPath(new URL('./public/index.html', import.meta.url));
const DEFAULT_POINTS_FIELD = 'customfield_10016'; // varie selon l'instance
const BASE_FIELDS = ['summary', 'status', 'assignee', 'priority', 'issuetype',
                     'labels', 'parent', 'issuelinks', 'description'];
const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost']);

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Nom d'hôte d'un en-tête Host (« 127.0.0.1:3000 » donne « 127.0.0.1 »). */
const hostnameOf = (host) => String(host ?? '').match(/^([^:]+)(?::\d+)?$/)?.[1].toLowerCase() ?? null;

// Hôte, origine et type de contenu contrôlés, comme le serveur du board (README, §11) : une page web
// ouverte dans le navigateur ne peut pas piloter l'application, même par un nom de domaine qui
// pointerait vers 127.0.0.1.
function checkRequest(req) {
  if (!LOCAL_HOSTS.has(hostnameOf(req.headers.host))) {
    throw new HttpError(403, "Hôte refusé : l'application ne répond qu'à 127.0.0.1 et localhost");
  }
  const origin = req.headers.origin;
  const port = req.socket.localPort;
  if (origin !== undefined && origin !== `http://127.0.0.1:${port}` && origin !== `http://localhost:${port}`) {
    throw new HttpError(403, `Origine refusée : ${origin}`);
  }
  if (req.method === 'POST' && !/^application\/json\s*(?:;|$)/i.test(String(req.headers['content-type'] ?? ''))) {
    throw new HttpError(415, 'Corps JSON attendu (Content-Type: application/json)');
  }
}

function authHeader(login, password) {
  return 'Basic ' + Buffer.from(`${login}:${password}`, 'utf8').toString('base64');
}

async function jira(baseUrl, auth, path, params = {}) {
  const url = new URL(baseUrl + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  let res;
  try {
    res = await fetch(url, { headers: { Accept: 'application/json', Authorization: auth } });
  } catch (err) {
    throw new HttpError(502, `Connexion impossible à ${url.origin} (${err.cause?.code ?? err.message})`);
  }
  if (res.status === 401) {
    throw new HttpError(401,
      "Authentification refusée. Sur Jira Cloud, l'API n'accepte pas le mot de passe : il faut un jeton d'API. " +
      "Sur Data Center, vérifiez l'identifiant et que l'authentification de base est activée.");
  }
  if (res.status === 403) throw new HttpError(403, `Accès refusé sur ${path}`);
  if (!res.ok) throw new HttpError(502, `Jira a répondu HTTP ${res.status} sur ${path}`);
  return res.json();
}

async function paginate(baseUrl, auth, path, params = {}, pageSize = 50) {
  const out = [];
  let startAt = 0;
  for (;;) {
    const data = await jira(baseUrl, auth, path, { ...params, startAt, maxResults: pageSize });
    const items = data.issues ?? data.values ?? [];
    out.push(...items);
    startAt += items.length;
    if (!items.length || data.isLast === true) break;
    if (data.total !== undefined && startAt >= data.total) break;
  }
  return out;
}

async function findBoard(baseUrl, auth, nameOrId) {
  if (/^\d+$/.test(nameOrId)) return jira(baseUrl, auth, `/rest/agile/1.0/board/${nameOrId}`);
  const boards = await paginate(baseUrl, auth, '/rest/agile/1.0/board', { name: nameOrId });
  const exact = boards.filter((b) => b.name.toLowerCase() === nameOrId.toLowerCase());
  const candidates = exact.length ? exact : boards;
  if (!candidates.length) throw new HttpError(404, `Aucun tableau nommé « ${nameOrId} »`);
  if (candidates.length > 1) {
    const list = candidates.map((b) => `${b.id} : ${b.name}`).join(' ; ');
    throw new HttpError(400, `Plusieurs tableaux correspondent, indiquez l'identifiant (${list})`);
  }
  return candidates[0];
}

async function pickSprint(baseUrl, auth, boardId, wanted) {
  const sprints = await paginate(baseUrl, auth, `/rest/agile/1.0/board/${boardId}/sprint`, { state: 'future' });
  if (!sprints.length) throw new HttpError(404, 'Aucun sprint futur sur ce tableau');
  if (wanted) {
    const match = sprints.find((s) => s.name === wanted || String(s.id) === wanted);
    if (!match) throw new HttpError(404, `Sprint « ${wanted} » introuvable parmi les sprints futurs`);
    return match;
  }
  // Le prochain sprint est celui qui démarre le plus tôt
  return sprints.reduce((a, b) => ((b.startDate ?? '9999') < (a.startDate ?? '9999') ? b : a));
}

// Extrait le texte d'une description (texte brut ou format ADF de Jira Cloud)
function textOf(node) {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(textOf).filter(Boolean).join(' ');
  if (typeof node === 'object') {
    if (typeof node.text === 'string') return node.text;
    return (node.content ?? []).map(textOf).filter(Boolean).join(' ');
  }
  return '';
}

function toRow(issue, pointsField) {
  const f = issue.fields ?? {};
  return {
    cle: issue.key,
    type: f.issuetype?.name ?? '',
    resume: f.summary ?? '',
    statut: f.status?.name ?? '',
    assigne: f.assignee?.displayName ?? 'Non assigné',
    priorite: f.priority?.name ?? '',
    estimation: f[pointsField] ?? '',
    parent: f.parent?.key ?? '',
    libelles: (f.labels ?? []).join(';'),
    nb_liens: (f.issuelinks ?? []).length,
    description: textOf(f.description).split(/\s+/).filter(Boolean).join(' '),
  };
}

async function exportSprint({ url, login, password, board, sprint, pointsField }) {
  const auth = authHeader(login, password);
  const b = await findBoard(url, auth, board);
  const s = await pickSprint(url, auth, b.id, sprint);
  const issues = await paginate(url, auth, `/rest/agile/1.0/sprint/${s.id}/issue`,
    { fields: [...BASE_FIELDS, pointsField].join(',') });
  return {
    board: { id: b.id, name: b.name },
    sprint: { id: s.id, name: s.name, state: s.state, startDate: s.startDate, endDate: s.endDate },
    tickets: issues.map((i) => toRow(i, pointsField)),
  };
}

function parseInput(body) {
  const required = (key) => {
    const v = String(body[key] ?? '').trim();
    if (!v) throw new HttpError(400, `Champ manquant : ${key}`);
    return v;
  };
  let url;
  try {
    url = new URL(required('url'));
  } catch {
    throw new HttpError(400, 'URL Jira invalide');
  }
  if (!['https:', 'http:'].includes(url.protocol)) throw new HttpError(400, 'URL Jira invalide');
  if (!body.password) throw new HttpError(400, 'Champ manquant : password');
  return {
    url: url.origin + url.pathname.replace(/\/+$/, ''),
    login: required('login'),
    password: String(body.password), // pas de trim : le mot de passe est pris tel quel
    board: required('board'),
    sprint: String(body.sprint ?? '').trim() || null,
    pointsField: String(body.pointsField ?? '').trim() || DEFAULT_POINTS_FIELD,
  };
}

async function readJson(req) {
  let data = '';
  for await (const chunk of req) {
    data += chunk;
    if (data.length > 100_000) throw new HttpError(413, 'Requête trop volumineuse');
  }
  try {
    return JSON.parse(data || '{}');
  } catch {
    throw new HttpError(400, 'Requête JSON invalide');
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  try {
    checkRequest(req);
    if (req.method === 'GET' && req.url === '/') {
      const html = await readFile(PAGE_FILE);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    }
    if (req.method === 'POST' && req.url === '/api/export') {
      const input = parseInput(await readJson(req));
      return sendJson(res, 200, await exportSprint(input));
    }
    sendJson(res, 404, { error: 'Introuvable' });
  } catch (err) {
    // Le message d'erreur ne contient jamais le mot de passe
    const status = err instanceof HttpError ? err.status : 500;
    const message = err instanceof HttpError ? err.message : 'Erreur interne';
    if (status === 500) console.error(err);
    sendJson(res, status, { error: message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Application prête : ouvrez http://${HOST}:${server.address().port} dans votre navigateur (Ctrl+C pour arrêter)`);
});
```

### `scripts/public/index.html`

<!-- fichier : scripts/public/index.html -->
```html
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Export des tickets du sprint Jira</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 1100px; margin: 2rem auto; padding: 0 1rem; color: #1f2933; }
  h1 { font-size: 1.5rem; }
  form { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; align-items: end; margin-bottom: 1rem; }
  label { display: flex; flex-direction: column; font-size: .9rem; gap: .25rem; }
  .wide { grid-column: 1 / -1; }
  input { padding: .5rem; font-size: 1rem; border: 1px solid #9aa5b1; border-radius: 4px; }
  button { padding: .6rem 1rem; font-size: 1rem; cursor: pointer; }
  button:disabled { opacity: .6; cursor: wait; }
  #status { min-height: 1.5rem; margin: .5rem 0; }
  .err { color: #b42318; }
  .note { font-size: .85rem; color: #52606d; }
  table { border-collapse: collapse; width: 100%; font-size: .85rem; margin-top: 1rem; }
  th, td { border: 1px solid #d9dee3; padding: .35rem .5rem; text-align: left; vertical-align: top; }
  th { background: #f0f3f6; }
  #result button { margin: .5rem 0; }
</style>
</head>
<body>
<h1>Export des tickets du prochain sprint</h1>
<p class="note">
  Vos identifiants restent sur cette machine. Ils sont transmis à votre Jira uniquement pour cette requête :
  ils ne sont ni enregistrés, ni journalisés, et le champ mot de passe est vidé après envoi.
</p>

<form id="f" autocomplete="off">
  <label class="wide">URL Jira
    <input name="url" required placeholder="https://votre-org.atlassian.net">
  </label>
  <label>Identifiant (e-mail ou login)
    <input name="login" required autocomplete="username">
  </label>
  <label>Mot de passe
    <input name="password" type="password" required autocomplete="current-password">
  </label>
  <label>Tableau (nom ou identifiant)
    <input name="board" required>
  </label>
  <label>Sprint (vide = prochain sprint)
    <input name="sprint">
  </label>
  <label class="wide">Champ d'estimation (facultatif)
    <input name="pointsField" placeholder="customfield_10016">
  </label>
  <div class="wide">
    <button id="go" type="submit">Exporter</button>
  </div>
</form>

<div id="status" role="status" aria-live="polite"></div>
<div id="result"></div>

<script>
  const $ = (id) => document.getElementById(id);
  let last = null;

  function el(tag, text) {
    const node = document.createElement(tag);
    node.textContent = text ?? '';
    return node;
  }

  function toCsv(rows) {
    if (!rows.length) return '';
    const cols = Object.keys(rows[0]);
    const esc = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    return [cols.join(';'), ...rows.map((r) => cols.map((c) => esc(r[c])).join(';'))].join('\r\n');
  }

  function download() {
    const blob = new Blob(['\ufeff' + toCsv(last.tickets)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = last.sprint.name.replace(/[^\w-]+/g, '_') + '.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function render(data) {
    last = data;
    const box = $('result');
    box.replaceChildren();

    const counts = {};
    data.tickets.forEach((t) => { counts[t.statut] = (counts[t.statut] || 0) + 1; });
    box.append(el('h2', `${data.sprint.name} : ${data.tickets.length} tickets`));
    box.append(el('p', Object.entries(counts).map(([k, v]) => `${k} : ${v}`).join('  |  ')));

    const btn = el('button', 'Télécharger le CSV');
    btn.type = 'button';
    btn.addEventListener('click', download);
    box.append(btn);

    const cols = ['cle', 'type', 'resume', 'statut', 'assigne', 'priorite', 'estimation', 'parent', 'libelles', 'nb_liens'];
    const table = document.createElement('table');
    const head = document.createElement('tr');
    cols.forEach((c) => head.append(el('th', c)));
    table.append(head);
    data.tickets.forEach((t) => {
      const tr = document.createElement('tr');
      cols.forEach((c) => tr.append(el('td', t[c])));
      table.append(tr);
    });
    box.append(table);
  }

  $('f').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = $('go');
    const status = $('status');
    status.className = '';
    status.textContent = 'Connexion à Jira…';
    btn.disabled = true;

    const payload = Object.fromEntries(new FormData(form));
    form.password.value = ''; // on ne garde pas le mot de passe affiché

    try {
      const r = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `Erreur HTTP ${r.status}`);
      status.textContent = '';
      render(data);
    } catch (err) {
      status.className = 'err';
      status.textContent = 'Erreur : ' + err.message;
    } finally {
      btn.disabled = false;
    }
  });
</script>
</body>
</html>
```

### `scripts/jira_sprint_export.py`

<!-- fichier : scripts/jira_sprint_export.py -->
```python
#!/usr/bin/env python3
"""
Exporte les tickets du prochain sprint d'un tableau Jira vers CSV et JSON, par l'API REST.

Python 3, bibliothèque standard uniquement, aucune installation nécessaire.
Les identifiants ne sont jamais enregistrés sur le disque : ils viennent des
variables d'environnement ou sont demandés à l'invite.

Jira Cloud (atlassian.net) : URL + e-mail + jeton d'API
  https://id.atlassian.com/manage-profile/security/api-tokens
Jira Data Center            : URL + jeton d'accès personnel (pas d'e-mail)
Derrière un SSO sans jeton : utiliser plutôt jira-capture-app.mjs.

Variables d'environnement facultatives :
  JIRA_URL, JIRA_EMAIL, JIRA_TOKEN

Exemples, depuis le dossier du skill capture-sprint-jira :
  python3 scripts/jira_sprint_export.py --board "Nom du tableau"
  python3 scripts/jira_sprint_export.py --board 42 --sprint "Sprint 24" --out exports

Sortie par défaut : exports/, dans le dossier du skill, que son .gitignore écarte.
"""

import argparse
import base64
import csv
import getpass
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from datetime import datetime
from pathlib import Path

DEFAULT_POINTS_FIELD = "customfield_10016"  # varie selon l'instance, à vérifier
DEFAULT_OUT_DIR = Path(__file__).resolve().parent.parent / "exports"  # dossier du skill
BASE_FIELDS = ["summary", "status", "assignee", "priority", "issuetype",
               "labels", "parent", "issuelinks", "description"]


def die(msg):
    sys.exit(f"Erreur : {msg}")


class JiraClient:
    def __init__(self, base_url, email, token):
        self.base = base_url.rstrip("/")
        if email:  # Cloud : authentification de base e-mail + jeton
            basic = base64.b64encode(f"{email}:{token}".encode()).decode()
            self.auth = f"Basic {basic}"
        else:      # Data Center : jeton d'accès personnel
            self.auth = f"Bearer {token}"

    def get(self, path, params=None):
        url = self.base + path
        if params:
            url += "?" + urllib.parse.urlencode(params)
        req = urllib.request.Request(
            url, headers={"Accept": "application/json", "Authorization": self.auth})
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.load(resp)
        except urllib.error.HTTPError as e:
            body = e.read()[:300].decode("utf-8", "replace")
            if e.code == 401:
                die("authentification refusée (vérifiez l'e-mail et le jeton)")
            if e.code == 403:
                die(f"accès refusé sur {path}")
            die(f"HTTP {e.code} sur {path} : {body}")
        except urllib.error.URLError as e:
            die(f"connexion impossible : {e.reason}")

    def paginate(self, path, params=None, page=50):
        params = dict(params or {})
        start, out = 0, []
        while True:
            params.update(startAt=start, maxResults=page)
            data = self.get(path, params)
            items = data.get("issues", data.get("values", []))
            if not items:
                break
            out.extend(items)
            start += len(items)
            if data.get("isLast") is True:
                break
            if "total" in data and start >= data["total"]:
                break
        return out


def find_board(client, name_or_id):
    if str(name_or_id).isdigit():
        return client.get(f"/rest/agile/1.0/board/{name_or_id}")
    boards = client.paginate("/rest/agile/1.0/board", {"name": name_or_id})
    exact = [b for b in boards if b["name"].lower() == name_or_id.lower()]
    candidates = exact or boards
    if not candidates:
        die(f"aucun tableau nommé « {name_or_id} »")
    if len(candidates) > 1:
        lines = "\n".join(f"  {b['id']} : {b['name']}" for b in candidates)
        die(f"plusieurs tableaux correspondent, précisez l'identifiant :\n{lines}")
    return candidates[0]


def pick_sprint(client, board_id, wanted):
    sprints = client.paginate(f"/rest/agile/1.0/board/{board_id}/sprint",
                              {"state": "future"})
    if not sprints:
        die("aucun sprint futur sur ce tableau")
    if wanted:
        match = [s for s in sprints if s["name"] == wanted or str(s["id"]) == wanted]
        if not match:
            die(f"sprint « {wanted} » introuvable parmi les sprints futurs")
        return match[0]
    # Le prochain sprint est celui qui démarre le plus tôt
    return min(sprints, key=lambda s: s.get("startDate") or "9999")


def fetch_issues(client, sprint_id, points_field):
    fields = ",".join(BASE_FIELDS + [points_field])
    return client.paginate(f"/rest/agile/1.0/sprint/{sprint_id}/issue",
                           {"fields": fields})


def text_of(node):
    """Extrait le texte d'une description (texte brut ou format ADF Jira Cloud)."""
    if node is None:
        return ""
    if isinstance(node, str):
        return node
    if isinstance(node, list):
        return " ".join(filter(None, (text_of(n) for n in node)))
    if isinstance(node, dict):
        if "text" in node:
            return node["text"]
        return " ".join(filter(None, (text_of(c) for c in node.get("content", []))))
    return ""


def to_row(issue, points_field):
    f = issue["fields"]
    return {
        "cle": issue["key"],
        "type": (f.get("issuetype") or {}).get("name", ""),
        "resume": f.get("summary", ""),
        "statut": (f.get("status") or {}).get("name", ""),
        "assigne": (f.get("assignee") or {}).get("displayName", "Non assigné"),
        "priorite": (f.get("priority") or {}).get("name", ""),
        "estimation": f.get(points_field, ""),
        "parent": (f.get("parent") or {}).get("key", ""),
        "libelles": ";".join(f.get("labels") or []),
        "nb_liens": len(f.get("issuelinks") or []),
        "description": " ".join(text_of(f.get("description")).split()),
    }


def write_outputs(rows, sprint, out_dir):
    out_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M")
    safe = "".join(c if c.isalnum() else "_" for c in sprint["name"])
    base = out_dir / f"{safe}_{stamp}"
    with open(f"{base}.csv", "w", newline="", encoding="utf-8-sig") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(rows[0].keys()), delimiter=";")
        writer.writeheader()
        writer.writerows(rows)
    with open(f"{base}.json", "w", encoding="utf-8") as fh:
        json.dump({"sprint": sprint, "tickets": rows}, fh, ensure_ascii=False, indent=2)
    return base


def main():
    parser = argparse.ArgumentParser(description="Export des tickets du prochain sprint Jira.")
    parser.add_argument("--board", required=True, help="nom ou identifiant du tableau")
    parser.add_argument("--sprint", help="nom ou identifiant du sprint (défaut : le prochain)")
    parser.add_argument("--out", default=str(DEFAULT_OUT_DIR),
                        help="dossier de sortie (défaut : exports/ du dossier du skill)")
    parser.add_argument("--points-field", default=DEFAULT_POINTS_FIELD,
                        help="identifiant du champ d'estimation")
    args = parser.parse_args()

    url = os.environ.get("JIRA_URL") or input("URL Jira (ex. https://votre-org.atlassian.net) : ").strip()
    email = os.environ.get("JIRA_EMAIL")
    if email is None:
        email = input("E-mail Atlassian (laisser vide pour Data Center) : ").strip() or None
    token = os.environ.get("JIRA_TOKEN") or getpass.getpass("Jeton d'API (saisie masquée) : ")

    client = JiraClient(url, email, token)
    board = find_board(client, args.board)
    print(f"Tableau : {board['name']} (id {board['id']})")

    sprint = pick_sprint(client, board["id"], args.sprint)
    print(f"Sprint : {sprint['name']} (id {sprint['id']})")

    issues = fetch_issues(client, sprint["id"], args.points_field)
    if not issues:
        die("aucun ticket dans ce sprint")
    rows = [to_row(i, args.points_field) for i in issues]

    base = write_outputs(rows, sprint, Path(args.out))
    print(f"{len(rows)} tickets exportés :")
    print(f"  {base}.csv")
    print(f"  {base}.json")
    print("Répartition par statut :", dict(Counter(r["statut"] for r in rows)))


if __name__ == "__main__":
    main()
```
<<<FIN modules/export-api/SKILL.md>>>

<<<FICHIER modules/recette/SKILL.md>>>
---
name: recette
description: Recette du skill (npm test, sous Windows, Linux et, sans écran, sous xvfb-run, profil et dossiers temporaires, faux Jira local avec API REST paginée, SSO simulé, backlogs chargés au défilement ou virtualisés, pages de tickets pour chaque cas de classement et session expirée, table des 19 scénarios R1 à R19 rattachés aux invariants de D1 à D6 et D8 et aux points d'extension, contrôle de la recette par six défauts réintroduits, recette en CI sur ubuntu-latest et windows-latest, sources de tests/fake-jira.mjs et tests/run-tests.mjs). À lire pour installer le skill, et avant de publier une version.
dimensions: [D1, D2, D3, D4, D5, D6, D8]
status: active
---

# Module `recette` (D1 à D6, D8)

## 1. Lancer la recette

```bash
npm test
```

- Sous Linux sans écran : `xvfb-run -a npm test`. La capture ouvre une fenêtre visible, comme sur le poste du développeur.
- Le navigateur est celui de `JIRA_CAPTURE_CHANNEL` : Chrome par défaut ; `chromium` après `npx playwright-core install chromium`.
- Python : la variable `PYTHON`, à défaut `py` sous Windows et `python3` ailleurs ; s'il manque, R7 est sauté.
- La recette travaille sur un profil et des dossiers temporaires : la session et les captures du dossier du skill ne sont pas touchées. Elle efface ses dossiers temporaires si tout passe ; sinon, ou avec `KEEP_TMP=1`, elle les garde et en donne le chemin, avec une capture d'écran de l'interface.
- Durée : environ 3 min 40 s, dont 46 s pour la capture du backlog chargé au défilement et 53 s pour le backlog virtualisé.
- Bilan attendu : `19 scénarios, 108 contrôles, 108 réussis, 0 en échec, 0 sautés` ; sans Python, `104 contrôles, 103 réussis, 0 en échec, 1 sautés`, R7 étant sauté.

## 2. Le faux Jira

`tests/fake-jira.mjs` sert, sur `127.0.0.1` et un port libre, sans réseau ni compte :

- une API REST Agile : deux tableaux aux noms proches, trois sprints futurs paginés deux par deux, 120 tickets paginés cinquante par cinquante, descriptions en texte ou en ADF, authentification Basic ou Bearer ;
- un SSO simulé : sans cookie, un détour par `/sso/login`, qui pose un cookie persistant et compte ses passages ;
- le backlog 42 : 71 cartes (60 hors plage, trois hors filtre, puis les huit du sprint, en fin de liste), une épopée liée en lien absolu et en minuscules, et un ticket récent, dans la plage, cité dans l'en-tête de la page ; chargé quinze cartes par quinze au défilement, ou virtualisé avec `?mode=virtual`, dans une zone de 300 pixels de haut, comme dans une fenêtre réduite ;
- le backlog 43 : cinq tickets dont la session a expiré ;
- les pages de tickets, rendues 400 ms après le chargement, comme une application monopage, chacune avec un menu latéral qui cite « Ticket avec IA » :

| Ticket | Contenu de la page | Résultat attendu |
|---|---|---|
| `DEMOAB-3500` | « Étiquettes : ticket-avec-ia » | `ticket avec ia`, contenu |
| `DEMOCD-3501` | « Épopée : Ticket sans IA » | `ticket sans ia`, contenu |
| `DEMOAB-3502` | « Composants : TicketAvecIA » | `ticket avec ia`, contenu |
| `DEMOEF-3600` | « Catégorie : ticket sans ia », dans un panneau replié | `ticket sans ia`, contenu masqué |
| `DEMOAB-3700` | aucun terme, hors du menu latéral | `à classer` |
| `DEMOAB-3800` | « ticket_avec_ia, ticket_sans_ia » | `à classer`, deux termes |
| `DEMOAB-3900` | renvoi vers la page de connexion d'une autre origine | erreur, session expirée |
| `DEMOAB-4500` | « Ticket avec IA », et un commentaire chargé au défilement | `ticket avec ia`, commentaire dans le fichier |

## 3. Scénarios

| ID | Scénario | Invariants |
|---|---|---|
| R1 | Filtre : préfixe mis en majuscules, filtre vide qui retient tout, bornes comprises, préfixe porté sur la partie projet, valeurs invalides refusées | D3.INV-2 |
| R2 | Catégories : défaut, texte à une catégorie par ligne ou séparées par « ; », nom de dossier invalide, doublon, `à classer` et liste vide refusés | D5.INV-5 |
| R3 | Classement : quatre graphies et les accents, mots entiers, deux catégories, ordre des textes, extrait | D5.INV-1, D5.INV-2, D5.INV-3 |
| R4 | Réglages et emplacements : dossier de sortie, profil, canal, délai ; variables vides | D1.INV-2, D1.INV-3 |
| R5 | Dépendance unique à version exacte ; `.gitignore` du skill | D1.INV-1, D1.INV-2 |
| R6 | Export Node : hôte, origine, type de contenu ; prochain sprint ; 120 tickets sur trois pages ; ADF ; tableau par identifiant ; tableau ambigu ; mot de passe refusé ; aucun mot de passe dans le journal | D6.INV-1, D8.INV-1, D8.INV-2, D8.INV-3 |
| R7 | Export Python : e-mail et jeton (Basic), jeton personnel (Bearer), CSV pour Excel, aucun jeton dans la sortie, jeton refusé | D8.INV-1, D8.INV-2, D8.INV-3 |
| R8 | Interface de capture : hôte, origine, type de contenu ; aucun champ d'identifiant | D6.INV-1, D2.INV-1 |
| R9 | Interface de capture : capture refusée sans sprint, adresse non http refusée, ouverture après le SSO, préfixe invalide et catégorie réservée refusés | D2.INV-1, D3.INV-2, D5.INV-5 |
| R10 | Backlog chargé au défilement : 72 tickets relevés, navigation exclue, 8 retenus et triés, les huit cas du § 2, dossiers directement dans le dossier choisi, MHTML de Chrome par ticket, commentaire chargé au défilement, `sprint.mhtml` et `rapport.json`, décompte ; une seule capture à la fois ; navigateur gardé ouvert après l'erreur | D3.INV-1, D3.INV-3, D4.INV-1, D4.INV-2, D4.INV-3, D5.INV-2, D5.INV-3, D5.INV-4, D5.INV-6, D6.INV-2, D6.INV-4 |
| R11 | Nouvelle capture dans le même dossier, après un changement de catégorie dans Jira : retour à la page du sprint, ticket rangé dans sa nouvelle catégorie, copie précédente retirée, autres tickets en place, navigateur fermé sans erreur | D5.INV-4, D6.INV-4 |
| R12 | Navigateur rouvert sans nouveau passage par le SSO | D2.INV-2 |
| R13 | Backlog virtualisé, dans une zone de 300 pixels : mêmes contrôles que R10 | D3.INV-1, D4.INV-1, D5.INV-3 |
| R14 | Cinq tickets à session expirée : trois erreurs, capture arrêtée, navigateur gardé ouvert | D4.INV-1, D4.INV-4, D6.INV-4 |
| R15 | « Fermer le navigateur » pendant la capture : capture arrêtée, rapport partiel | D4.INV-4, D6.INV-2 |
| R16 | Page de l'interface pilotée comme par le développeur : bouton activé, avancement, boutons bloqués, bilan, résumé, une ligne par ticket, avertissement, valeurs retrouvées après rechargement | D6.INV-2, D6.INV-3 |
| R17 | Ligne de commande : adresse manquante et numéro invalide (code 2), un ticket capturé directement dans le dossier (code 0), un ticket en erreur (code 1) | D6.INV-5, D4.INV-1 |
| R18 | Point d'extension E1 : champs du rapport, d'un ticket capturé, d'un ticket en erreur | D5.INV-6 |
| R19 | Point d'extension E2 : fonctions exportées par le module commun, dont `captureSprintTickets` | |

## 4. Contrôle de la recette elle-même

Sept défauts, réintroduits un à un dans le code, font chacun échouer la recette par le scénario attendu (essai du 28 octobre 2026, Node 22.23.4) :

| ID | Défaut réintroduit | Scénarios en échec | Contrôles en échec |
|---|---|---|---|
| M1 | les liens de la navigation sont relevés : le ticket récent de l'en-tête est capturé | R10, R11, R13, R16 | 15 |
| M2 | la copie d'un ticket recapturé reste dans son ancien dossier | R11 | 1 |
| M3 | le classement lit toute la page, navigation comprise : le menu latéral classe les tickets sans terme et rend les autres ambigus | R10, R11, R13, R16 | 14 |
| M4 | l'origine des requêtes n'est plus contrôlée | R8 | 1 |
| M5 | une page est enregistrée sans vérifier qu'elle est celle du ticket : la page de connexion prend le nom du ticket | R10, R11, R13, R14, R16, R17, R18 | 17 |
| M6 | les liens ne sont relevés qu'avant le défilement : seuls les premiers tickets du backlog sont vus | R10, R11, R13, R15, R16, R17, R18 | 44 |
| M7 | pas de défilement fixe de 1 200 pixels, plus grand que la zone affichée : des cartes de la liste virtualisée sont sautées | R13 | 1 |

Chaque défaut a été retiré après son essai ; la recette du code publié passe en entier.

## 5. Recette en intégration continue

Le workflow `.github/workflows/recette-capture-sprint-jira.yml` du dépôt Agent2Prompt suit le chemin de l'IA du développeur : il matérialise la transmission courante, extrait les fichiers par la commande du module `execution`, § 8, sous bash et sous CMD, installe la dépendance par `npm ci`, puis lance la recette, sous `xvfb-run` sur `ubuntu-latest` et directement sur `windows-latest`, avec Node 20 et Node 22 et le Chrome des images GitHub.

## 6. Sources

### `tests/fake-jira.mjs`

<!-- fichier : tests/fake-jira.mjs -->
```javascript
// fake-jira.mjs : faux Jira local pour la recette du skill capture-sprint-jira, sans réseau ni compte.
//   API REST Agile : tableaux, sprints et tickets paginés, authentification Basic ou Bearer.
//   SSO simulé : sans cookie, détour par /sso/login, qui pose un cookie persistant.
//   Backlogs : 42, liste chargée au défilement (?mode=virtual : affichage virtualisé) ; 43, tickets à session expirée.
//   Pages de tickets /browse/<CLÉ> : contenu rendu après 400 ms, comme une application monopage.
import http from 'node:http';

const ACCEPTED = new Set([
  `Basic ${Buffer.from('jean.dupont@example.com:motdepasse').toString('base64')}`,
  `Basic ${Buffer.from('jean.dupont@example.com:jeton-demo').toString('base64')}`,
  'Bearer pat-demo',
]);

// Pages de tickets : où se trouve le terme clé
export const TICKETS = {
  'DEMOAB-3500': { visible: 'Étiquettes : ticket-avec-ia' },
  'DEMOCD-3501': { visible: 'Épopée : Ticket sans IA' },
  'DEMOAB-3502': { visible: 'Composants : TicketAvecIA' },
  'DEMOEF-3600': { hidden: 'Catégorie : ticket sans ia' }, // panneau replié
  'DEMOAB-3700': {}, // aucun terme dans le contenu ; le menu latéral en cite un
  'DEMOAB-3800': { visible: 'Étiquettes : ticket_avec_ia, ticket_sans_ia' },
  'DEMOAB-3900': { expired: true },
  'DEMOAB-4500': { visible: 'Étiquettes : Ticket avec IA', lazyComment: true },
};
// Backlog 42 : 60 tickets hors plage, trois hors filtre, puis ceux du sprint, en fin de liste. L'en-tête de la page
// cite en plus DEMOAB-3650, dans la plage : un élément récent de la navigation, qui ne doit pas être capturé.
export const BOARD_42 = [
  ...Array.from({ length: 60 }, (_, i) => `DEMOZZ-${i + 1}`),
  'DEMOAB-3499', 'AUTRE-3600', 'DEMOAB-4501',
  ...Object.keys(TICKETS),
];
export const BOARD_43 = ['DEMOXP-3501', 'DEMOXP-3502', 'DEMOXP-3503', 'DEMOXP-3504', 'DEMOXP-3505'];
const EXPIRED = new Set(['DEMOAB-3900', ...BOARD_43]);

// API REST
const BOARDS = [{ id: 42, name: 'Équipe démo' }, { id: 43, name: 'Équipe démo 2' }];
const SPRINTS = [
  { id: 7, name: 'Sprint 8', state: 'future', startDate: '2026-11-16T09:00:00.000Z' },
  { id: 6, name: 'Sprint 7', state: 'future', startDate: '2026-11-02T09:00:00.000Z' },
  { id: 9, name: 'Sprint 10', state: 'future' },
];
const apiIssue = (n, sprint) => ({
  key: `DEMO-${n}`,
  fields: {
    summary: `Ticket ${n} du sprint ${sprint}`,
    status: { name: n % 3 === 0 ? 'En cours' : 'À faire' },
    assignee: n % 4 === 0 ? null : { displayName: `Dev ${n % 4}` },
    priority: { name: 'Moyenne' },
    issuetype: { name: n % 5 === 0 ? 'Bug' : 'Story' },
    labels: n % 2 ? ['front'] : [],
    parent: n <= 10 ? { key: 'EPIC-1' } : null,
    issuelinks: n % 7 === 0 ? [{ id: '1' }] : [],
    description: n % 2
      ? { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Critère :' }, { type: 'text', text: `export ${n}` }] }] }
      : `Description texte ${n}`,
    customfield_10016: n % 6 === 0 ? null : (n % 5) + 1,
  },
});
const ISSUES = { 6: Array.from({ length: 120 }, (_, i) => apiIssue(i + 1, 7)), 7: [1, 2, 3].map((n) => apiIssue(n, 8)), 9: [] };

function boardHtml(keys) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Backlog - DEMO</title>
<style>body{margin:0;font-family:sans-serif} header{height:56px;background:#0052cc;color:#fff}
#list{height:calc(100vh - 56px);overflow:auto} .card{height:40px;padding:4px;border-bottom:1px solid #ddd}</style></head>
<body><header>Jira (faux) · Récents : <a href="/browse/DEMOAB-3650">DEMOAB-3650</a></header><main id="list"></main>
<script>
const KEYS = ${JSON.stringify(keys)};
const MODE = new URLSearchParams(location.search).get('mode');
const H = 49;
const list = document.getElementById('list');
const card = (i) => '<div class="card"><a href="/browse/' + KEYS[i] + '">' + KEYS[i] + '</a> Ticket ' + (i + 1)
  + (i < 10 ? ' · <a href="https://jira.example.com/browse/demoe-100?focus=1">DEMOE-100</a>' : '') + '</div>';
if (MODE === 'virtual') {
  // Zone de 300 pixels, comme dans une fenêtre réduite : un pas de défilement plus grand sauterait des cartes
  list.style.height = '300px';
  const spacer = document.createElement('div');
  spacer.style.cssText = 'position:relative;height:' + KEYS.length * H + 'px';
  list.appendChild(spacer);
  const render = () => {
    const first = Math.max(0, Math.floor(list.scrollTop / H) - 3);
    const last = Math.min(KEYS.length, Math.ceil((list.scrollTop + list.clientHeight) / H) + 3);
    spacer.innerHTML = '';
    for (let i = first; i < last; i++) {
      const d = document.createElement('div');
      d.style.cssText = 'position:absolute;left:0;right:0;top:' + i * H + 'px';
      d.innerHTML = card(i);
      spacer.appendChild(d);
    }
  };
  list.addEventListener('scroll', render);
  render();
} else {
  let shown = 0, loading = false;
  const more = () => {
    const n = Math.min(KEYS.length, shown + 15);
    let html = '';
    for (let i = shown; i < n; i++) html += card(i);
    list.insertAdjacentHTML('beforeend', html);
    shown = n;
  };
  more(); more();
  list.addEventListener('scroll', () => {
    if (loading || shown >= KEYS.length) return;
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 200) {
      loading = true;
      setTimeout(() => { more(); loading = false; }, 300);
    }
  });
}
</script></body></html>`;
}

function ticketHtml(key, spec = {}) {
  const fields = (spec.visible ? `<p>${spec.visible}</p>` : '')
    + (spec.hidden ? `<details><summary>Autres champs</summary><p>${spec.hidden}</p></details>` : '');
  const lazy = spec.lazyComment ? `
  let loaded = false;
  window.addEventListener('scroll', () => {
    if (loaded || innerHeight + scrollY < document.body.scrollHeight - 300) return;
    loaded = true;
    setTimeout(() => { document.getElementById('activite').innerHTML = '<p>Commentaire chargé au défilement</p>'; }, 200);
  });` : '';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>[${key}] Ticket de démonstration - Jira (faux)</title></head>
<body><nav>Filtres enregistrés : Ticket avec IA · Mes tickets ouverts</nav>
<main id="contenu">Chargement…</main>
<script>
setTimeout(() => {
  document.getElementById('contenu').innerHTML = '<h1>${key} : ticket de démonstration</h1>' + ${JSON.stringify(fields)}
    + '<div>' + '<p>Paragraphe de description.</p>'.repeat(80) + '</div><div id="activite"></div>';${lazy}
}, 400);
</script></body></html>`;
}

const LOGIN_PAGE = '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Connexion</title></head><body><main>Connexion requise</main></body></html>';

/** Démarre le faux Jira sur 127.0.0.1 ; rend { url, port, stats, close }. */
export function startFakeJira({ port = 0 } = {}) {
  const stats = { ssoLogins: 0, apiCalls: 0 };
  const server = http.createServer((req, res) => {
    const self = server.address().port;
    const url = new URL(req.url, `http://127.0.0.1:${self}`);
    const q = (k) => url.searchParams.get(k);
    const startAt = Number(q('startAt') || 0);
    const maxResults = Number(q('maxResults') || 50);
    const send = (status, body, headers = {}) => {
      const json = typeof body !== 'string';
      res.writeHead(status, { 'Content-Type': json ? 'application/json' : 'text/html; charset=utf-8', ...headers });
      res.end(json ? JSON.stringify(body) : body);
    };

    if (url.pathname === '/sso/login') {
      stats.ssoLogins++;
      return send(302, '', { Location: q('next') || '/', 'Set-Cookie': 'sso=ok; Path=/; Max-Age=3600; HttpOnly' });
    }
    if (url.pathname === '/sso/expired') return send(200, LOGIN_PAGE);

    if (url.pathname.startsWith('/jira/software/') || url.pathname.startsWith('/browse/')) {
      if (!/(?:^|;\s*)sso=ok/.test(req.headers.cookie ?? '')) {
        return send(302, '', { Location: `/sso/login?next=${encodeURIComponent(url.pathname + url.search)}` });
      }
      if (url.pathname === '/jira/software/c/projects/DEMO/boards/42/backlog') return send(200, boardHtml(BOARD_42));
      if (url.pathname === '/jira/software/c/projects/DEMO/boards/43/backlog') return send(200, boardHtml(BOARD_43));
      const key = url.pathname.match(/^\/browse\/([A-Z][A-Z0-9_]*-\d+)$/)?.[1];
      if (!key) return send(404, 'introuvable');
      // Session expirée : renvoi vers le fournisseur d'identité, sur une autre origine
      if (EXPIRED.has(key)) return send(302, '', { Location: `http://localhost:${self}/sso/expired` });
      return send(200, ticketHtml(key, TICKETS[key]));
    }

    if (url.pathname.startsWith('/rest/')) {
      stats.apiCalls++;
      if (!ACCEPTED.has(req.headers.authorization ?? '')) return send(401, { errorMessages: ['Non autorisé'] });
      let m;
      if (url.pathname === '/rest/agile/1.0/board') {
        const name = (q('name') ?? '').toLowerCase();
        const found = BOARDS.filter((b) => b.name.toLowerCase().includes(name));
        return send(200, { values: found.slice(startAt, startAt + maxResults), isLast: true, startAt, maxResults });
      }
      if ((m = url.pathname.match(/^\/rest\/agile\/1\.0\/board\/(\d+)$/))) {
        const b = BOARDS.find((x) => x.id === Number(m[1]));
        return b ? send(200, b) : send(404, { errorMessages: ['Tableau introuvable'] });
      }
      if ((m = url.pathname.match(/^\/rest\/agile\/1\.0\/board\/(\d+)\/sprint$/))) {
        const all = SPRINTS.filter((s) => !q('state') || s.state === q('state'));
        const values = all.slice(startAt, startAt + Math.min(maxResults, 2)); // deux par page : isLast sert
        return send(200, { values, isLast: startAt + values.length >= all.length, startAt, maxResults });
      }
      if ((m = url.pathname.match(/^\/rest\/agile\/1\.0\/sprint\/(\d+)\/issue$/))) {
        const all = ISSUES[m[1]] ?? [];
        const issues = all.slice(startAt, startAt + Math.min(maxResults, 50)); // 50 au plus par page, comme Jira
        return send(200, { issues, total: all.length, startAt, maxResults: issues.length });
      }
      return send(404, { errorMessages: ['Ressource inconnue'] });
    }
    send(404, 'introuvable');
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      const p = server.address().port;
      const close = () => {
        server.closeAllConnections(); // le navigateur garde ses connexions ouvertes
        return new Promise((r) => server.close(r));
      };
      resolve({ url: `http://127.0.0.1:${p}`, port: p, stats, close });
    });
  });
}
```

### `tests/run-tests.mjs`

<!-- fichier : tests/run-tests.mjs -->
```javascript
#!/usr/bin/env node
// run-tests.mjs : recette du skill capture-sprint-jira, scénarios R1 à R19, contre un faux Jira local
// (tests/fake-jira.mjs), sans réseau ni compte. Le navigateur s'ouvre, visible, sur un profil temporaire :
// la session et les captures du dossier du skill ne sont pas touchées.
//   Navigateur : celui de JIRA_CAPTURE_CHANNEL (chrome par défaut ; chromium après npx playwright-core install chromium).
//   Linux sans écran : xvfb-run -a npm test.
//   Python : variable PYTHON, à défaut py sous Windows et python3 ailleurs ; s'il manque, R7 est sauté.
// Usage, depuis le dossier du skill : npm test ; sortie 0 si tout passe, 1 sinon (dossier temporaire gardé).
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import http from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import * as core from '../scripts/jira-capture-core.mjs';
import { BOARD_42, TICKETS, startFakeJira } from './fake-jira.mjs';

const {
  DEFAULT_CATEGORIES, UNCLASSIFIED, browserChannel, classify, matchesFilter, outputFolder, pageTimeoutMs,
  parseCategories, parseFilter, profileDir,
} = core;
const SKILL = fileURLToPath(new URL('..', import.meta.url));
const TMP = mkdtempSync(join(tmpdir(), 'capture-sprint-jira-'));
const ENV = { ...process.env, JIRA_CAPTURE_PROFILE: join(TMP, 'profil'), JIRA_CAPTURE_PAGE_TIMEOUT_MS: '3000' };
const results = [];
const children = [];
let current = '';

function scenario(id, title) {
  current = id;
  console.log(`\n# ${id} · ${title}`);
}
function check(name, ok, detail = '') {
  results.push({ scenario: current, name, ok: Boolean(ok) });
  console.log(`${ok ? 'OK  ' : 'KO  '} ${current} · ${name}${detail ? ` : ${detail}` : ''}`);
}
function skip(name, reason) {
  results.push({ scenario: current, name, ok: true, skipped: true });
  console.log(`SAUT ${current} · ${name} : ${reason}`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const throws = (fn) => { try { fn(); return null; } catch (e) { return e.message; } };
const sameSet = (a, b) => a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|');
// Texte d'un MHTML : lignes douces du quoted-printable recollées (les accents restent encodés)
const mhtml = (file) => readFileSync(file, 'latin1').replace(/=\r?\n/g, '');

function startApp(script, env = {}) {
  const child = spawn(process.execPath, [join(SKILL, 'scripts', script)], { env: { ...ENV, PORT: '0', ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(child);
  let log = '';
  child.stdout.on('data', (d) => { log += d; });
  child.stderr.on('data', (d) => { log += d; });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${script} ne démarre pas :\n${log}`)), 15_000);
    const poll = setInterval(() => {
      const m = log.match(/http:\/\/127\.0\.0\.1:(\d+)/);
      if (!m) return;
      clearTimeout(timer);
      clearInterval(poll);
      resolve({ child, port: Number(m[1]), log: () => log });
    }, 50);
    child.on('exit', (code) => {
      clearTimeout(timer);
      clearInterval(poll);
      reject(new Error(`${script} arrêté (code ${code}) :\n${log}`));
    });
  });
}

/** Lance une commande sans bloquer ce processus, qui sert le faux Jira ; rend { status, stdout, stderr }. */
function run(cmd, args, { env = ENV, input = '', timeout = 120_000 } = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { env, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8').on('data', (d) => { stdout += d; });
    child.stderr.setEncoding('utf8').on('data', (d) => { stderr += d; });
    const timer = setTimeout(() => child.kill('SIGKILL'), timeout);
    child.on('error', (err) => { clearTimeout(timer); resolve({ status: null, stdout, stderr: stderr + err.message }); });
    child.on('close', (status) => { clearTimeout(timer); resolve({ status, stdout, stderr }); });
    child.stdin.end(input);
  });
}

function request(port, { method = 'GET', path = '/', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, method, path, headers }, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch { /* page HTML */ }
        resolve({ status: res.statusCode, text: data, json });
      });
    });
    req.on('error', reject);
    if (body !== undefined) req.write(body);
    req.end();
  });
}
const post = (port, path, obj, headers = {}) => request(port, {
  method: 'POST', path, body: JSON.stringify(obj),
  headers: { 'Content-Type': 'application/json', Origin: `http://127.0.0.1:${port}`, ...headers },
});

/** Contrôles d'hôte, d'origine et de type de contenu, communs aux deux interfaces. */
async function guards(port, label) {
  const page = await request(port, { path: '/' });
  check(`${label} : la page s'affiche`, page.status === 200 && /<html/.test(page.text), `HTTP ${page.status}`);
  const host = await request(port, { path: '/', headers: { Host: `evil.example.com:${port}` } });
  check(`${label} : hôte étranger refusé (rebond DNS)`, host.status === 403, `HTTP ${host.status}`);
  const origin = await post(port, '/api/close', {}, { Origin: 'https://evil.example.com' });
  check(`${label} : origine étrangère refusée`, origin.status === 403, `HTTP ${origin.status}`);
  const plain = await request(port, { method: 'POST', path: '/api/close', body: '{}', headers: { 'Content-Type': 'text/plain' } });
  check(`${label} : corps text/plain refusé`, plain.status === 415, `HTTP ${plain.status}`);
  const unknown = await request(port, { path: '/inconnu' });
  check(`${label} : route inconnue`, unknown.status === 404 && Boolean(unknown.json?.error), `HTTP ${unknown.status}`);
  return page.text;
}

/** Attend la fin de la capture en cours ; rend le dernier état. */
async function waitForJob(port, timeoutMs = 240_000) {
  const end = Date.now() + timeoutMs;
  for (;;) {
    const { json } = await request(port, { path: '/api/status' });
    if (json.job.state !== 'running' || Date.now() > end) return json;
    await sleep(500);
  }
}

// Résultat attendu de chaque ticket du backlog 42 (tests/fake-jira.mjs)
const EXPECTED = {
  'DEMOAB-3500': { category: 'ticket avec ia', where: 'contenu' },
  'DEMOCD-3501': { category: 'ticket sans ia', where: 'contenu' },
  'DEMOAB-3502': { category: 'ticket avec ia', where: 'contenu' },
  'DEMOEF-3600': { category: 'ticket sans ia', where: 'contenu masqué' },
  'DEMOAB-3700': { category: null, found: 0 },
  'DEMOAB-3800': { category: null, found: 2 },
  'DEMOAB-3900': { error: true },
  'DEMOAB-4500': { category: 'ticket avec ia', where: 'contenu' },
};
// Champs stables du rapport (point d'extension E1)
const REPORT_FIELDS = ['date', 'sprintUrl', 'folder', 'filter', 'categories', 'listed', 'selected', 'ignored', 'ignoredSample', 'counts', 'errors', 'aborted', 'tickets'];
const TICKET_FIELDS = ['key', 'url', 'category', 'found', 'where', 'excerpt', 'file', 'movedFrom'];

/** Vérifie le rapport et les fichiers d'une capture du backlog 42 filtrée sur DEMO, 3500 à 4500, dans `folder`. */
function verifyRun(report, folder) {
  check('tickets relevés sur la page', report.listed === BOARD_42.length + 1, `${report.listed} (dont l'épopée DEMOE-100)`);
  const keys = report.tickets.map((t) => t.key).join(' ');
  check('filtre (préfixe, bornes comprises), tri par numéro, navigation exclue', keys === Object.keys(EXPECTED).join(' ') && report.selected === 8
    && !keys.includes('DEMOAB-3650'), keys);
  for (const [key, exp] of Object.entries(EXPECTED)) {
    const t = report.tickets.find((x) => x.key === key) ?? {};
    let ok;
    let detail;
    if (exp.error) {
      ok = /session SSO expirée/.test(t.error ?? '') && !t.file && !existsSync(join(folder, UNCLASSIFIED, `${key}.mhtml`));
      detail = t.error;
    } else if (exp.category) {
      ok = t.category === exp.category && t.where === exp.where && existsSync(join(folder, t.file ?? '-'));
      detail = `${t.file} (${t.where}) ${t.excerpt ?? ''}`;
    } else {
      ok = t.category === null && t.found?.length === exp.found && t.file === `${UNCLASSIFIED}/${key}.mhtml` && existsSync(join(folder, t.file));
      detail = `${t.file}, trouvé : ${(t.found ?? []).join(' + ') || 'rien'}`;
    }
    check(`${key}${TICKETS[key].expired ? ' (session expirée)' : ''}`, ok, detail);
  }
  check('dossiers de catégorie directement dans le dossier choisi', report.folder === folder
    && sameSet(readdirSync(folder), ['ticket avec ia', 'ticket sans ia', UNCLASSIFIED, 'sprint.mhtml', 'rapport.json']), readdirSync(folder).join(', '));
  const files = report.tickets.filter((t) => t.file).map((t) => join(folder, t.file));
  check('chaque fichier est la page MHTML de son ticket', files.length === 7
    && files.every((f) => { const s = mhtml(f); return /^From: <Saved by Blink>/m.test(s) && s.includes(f.match(/([A-Z]+-\d+)\.mhtml$/)[1]); }));
  const lazy = join(folder, 'ticket avec ia', 'DEMOAB-4500.mhtml');
  check('commentaire chargé au défilement capturé', existsSync(lazy) && mhtml(lazy).includes('Commentaire charg'));
  const onDisk = JSON.parse(readFileSync(join(folder, 'rapport.json'), 'utf8'));
  check('page du sprint et rapport.json écrits', /^From: <Saved by Blink>/m.test(mhtml(join(folder, 'sprint.mhtml')))
    && JSON.stringify(onDisk.counts) === JSON.stringify(report.counts) && onDisk.tickets.length === 8);
  check('décompte', JSON.stringify(report.counts) === JSON.stringify({ 'ticket avec ia': 3, 'ticket sans ia': 2, [UNCLASSIFIED]: 2 })
    && report.errors === 1 && report.aborted === false, `${JSON.stringify(report.counts)}, erreurs : ${report.errors}`);
  return onDisk;
}

let fake;
try {
  // ------------------------------------------------------------------ fonctions pures
  scenario('R1', 'filtre des tickets');
  const f = parseFilter({ prefix: 'demo', min: '3500', max: '4500' });
  check('préfixe en majuscules, bornes en nombres', f.prefix === 'DEMO' && f.min === 3500 && f.max === 4500);
  check('filtre vide : il retient tout', matchesFilter('XYZ-1', parseFilter({})));
  check('bornes comprises', matchesFilter('DEMOAB-3500', f) && matchesFilter('DEMOAB-4500', f)
    && !matchesFilter('DEMOAB-3499', f) && !matchesFilter('DEMOAB-4501', f));
  check('le préfixe porte sur le début du projet', matchesFilter('demoab-3600', f) && !matchesFilter('AUTRE-3600', f) && !matchesFilter('XDEMO-3600', f));
  check('valeurs invalides refusées', ['1AB', 'A-B', 'é'].every((p) => throws(() => parseFilter({ prefix: p })))
    && throws(() => parseFilter({ min: 'abc' })) && throws(() => parseFilter({ min: '10', max: '5' })));

  scenario('R2', 'catégories');
  check('par défaut : ticket avec ia, ticket sans ia', parseCategories().join('|') === DEFAULT_CATEGORIES.join('|'));
  check('texte : une par ligne, ou séparées par « ; »', parseCategories('a\r\n b ;c').join('|') === 'a|b|c');
  check('nom de dossier invalide, doublon, « à classer » ou liste vide refusés',
    [['a/b'], ['x:'], ['.cache'], ['ticket avec ia', 'Ticket-avec-IA'], [UNCLASSIFIED], []].every((c) => throws(() => parseCategories(c))));

  scenario('R3', 'classement');
  const cls = (text) => classify([['contenu', text]], DEFAULT_CATEGORIES);
  check('graphies reconnues', ['ticket avec ia', 'Ticket-avec-IA', 'TICKET_AVEC_IA', 'TicketAvecIA', 'tîcket avec ïa']
    .every((s) => cls(s).category === 'ticket avec ia'));
  check('mots entiers seulement', ['tickets avec ia', 'ticket avec iam', 'unticket avec ia'].every((s) => cls(s).category === null));
  check('deux catégories : aucune retenue', cls('ticket avec ia, ticket sans ia').category === null
    && cls('ticket avec ia, ticket sans ia').found.length === 2);
  const ordered = classify([['contenu', 'rien'], ['contenu masqué', 'ticket sans ia'], ['page', 'ticket avec ia']], DEFAULT_CATEGORIES);
  check('le premier texte qui contient un terme décide', ordered.category === 'ticket sans ia' && ordered.where === 'contenu masqué');
  check('extrait autour du terme', /ticket avec ia/.test(cls('Étiquettes : ticket-avec-ia').excerpt ?? ''));

  scenario('R4', 'réglages et emplacements');
  check('dossier de sortie : relatif au dossier du skill, mhtml/ si vide', outputFolder('') === resolve(SKILL, 'mhtml')
    && outputFolder('x') === resolve(SKILL, 'x') && outputFolder(TMP) === TMP);
  check('profil : .jira-profile du skill, ou JIRA_CAPTURE_PROFILE', profileDir({}) === resolve(SKILL, '.jira-profile')
    && profileDir({ JIRA_CAPTURE_PROFILE: TMP }) === TMP && profileDir({ JIRA_CAPTURE_PROFILE: '' }) === resolve(SKILL, '.jira-profile'));
  check('navigateur : chrome par défaut, msedge, chromium de Playwright', browserChannel({}) === 'chrome'
    && browserChannel({ JIRA_CAPTURE_CHANNEL: '' }) === 'chrome' && browserChannel({ JIRA_CAPTURE_CHANNEL: 'msedge' }) === 'msedge'
    && browserChannel({ JIRA_CAPTURE_CHANNEL: 'chromium' }) === undefined);
  check("délai d'une page de ticket : 20 s, ou JIRA_CAPTURE_PAGE_TIMEOUT_MS", pageTimeoutMs({}) === 20_000
    && pageTimeoutMs({ JIRA_CAPTURE_PAGE_TIMEOUT_MS: '' }) === 20_000 && pageTimeoutMs({ JIRA_CAPTURE_PAGE_TIMEOUT_MS: '45000' }) === 45_000);

  scenario('R5', 'dépendance et fichiers de travail');
  const pkg = JSON.parse(readFileSync(join(SKILL, 'package.json'), 'utf8'));
  check('une seule dépendance, à version exacte : playwright-core 1.63.0', JSON.stringify(pkg.dependencies) === '{"playwright-core":"1.63.0"}'
    && pkg.engines?.node === '>=20');
  const ignore = readFileSync(join(SKILL, '.gitignore'), 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith('#'));
  check('.gitignore : profil, captures, exports et node_modules', ['node_modules/', '.jira-profile/', 'mhtml/', 'exports/', '*.mhtml'].every((l) => ignore.includes(l)), ignore.join(' '));

  fake = await startFakeJira();
  const backlog = `${fake.url}/jira/software/c/projects/DEMO/boards/42/backlog`;

  // ------------------------------------------------------------------ export par l'API (Node.js)
  scenario('R6', "export par l'API, interface Node.js");
  const api = await startApp('jira-sprint-app.mjs');
  await guards(api.port, 'export');
  const creds = { url: `${fake.url}/`, login: 'jean.dupont@example.com', password: 'motdepasse' };
  let r = await post(api.port, '/api/export', { ...creds, board: 'Équipe démo' });
  check('prochain sprint = date de début la plus proche', r.json?.sprint?.name === 'Sprint 7', r.json?.sprint?.name ?? r.json?.error);
  check('120 tickets sur trois pages', r.json?.tickets?.length === 120, `${r.json?.tickets?.length}`);
  const t1 = r.json?.tickets?.[0] ?? {};
  check('description ADF mise à plat, estimation, parent', t1.description === 'Critère : export 1' && t1.estimation === 2 && t1.parent === 'EPIC-1');
  check('ticket non assigné', r.json?.tickets?.[3]?.assigne === 'Non assigné');
  r = await post(api.port, '/api/export', { ...creds, board: '42', sprint: 'Sprint 8' });
  check('tableau par identifiant, sprint par nom', r.json?.sprint?.id === 7 && r.json?.tickets?.length === 3);
  r = await post(api.port, '/api/export', { ...creds, board: 'Équipe' });
  check('tableau ambigu signalé', r.status === 400 && /Plusieurs tableaux/.test(r.json?.error ?? ''));
  r = await post(api.port, '/api/export', { ...creds, password: 'faux', board: 'Équipe démo' });
  check('mauvais mot de passe', r.status === 401);
  check('aucun mot de passe dans le journal', !/motdepasse|faux/.test(api.log()));
  api.child.kill();

  // ------------------------------------------------------------------ export par l'API (Python)
  scenario('R7', "export par l'API, script Python");
  const PY = process.env.PYTHON || (process.platform === 'win32' ? 'py' : 'python3');
  if (spawnSync(PY, ['--version']).status !== 0) {
    skip('export Python', `${PY} introuvable`);
  } else {
    // Entrée vide : une invite éventuelle (variable vide supprimée par Windows) reçoit une réponse vide
    // PYTHONUTF8 : sous Windows, Python écrirait sa sortie en cp1252
    const py = (args, env) => run(PY, [join(SKILL, 'scripts', 'jira_sprint_export.py'), ...args], {
      env: { ...process.env, PYTHONUTF8: '1', JIRA_URL: fake.url, ...env }, input: '\n',
    });
    let p = await py(['--board', 'Équipe démo', '--out', join(TMP, 'py')], { JIRA_EMAIL: 'jean.dupont@example.com', JIRA_TOKEN: 'jeton-demo' });
    const csv = existsSync(join(TMP, 'py')) ? readdirSync(join(TMP, 'py')).find((x) => x.endsWith('.csv')) : null;
    const rows = csv ? readFileSync(join(TMP, 'py', csv), 'utf8').trimEnd().split('\n') : []; // trim() ôterait le BOM
    check('e-mail et jeton : 120 tickets en CSV', p.status === 0 && rows.length === 121, `${p.status} ${p.stderr.trim()}`);
    check('CSV pour Excel (BOM, séparateur « ; »)', rows[0]?.startsWith('﻿cle;type;resume'));
    check('aucun jeton dans la sortie', !/jeton-demo/.test(p.stdout + p.stderr));
    p = await py(['--board', '42', '--sprint', 'Sprint 8', '--out', join(TMP, 'py2')], { JIRA_EMAIL: '', JIRA_TOKEN: 'pat-demo' });
    check('jeton personnel (Bearer)', p.status === 0 && /3 tickets exportés/.test(p.stdout), p.stdout.trim().split('\n')[2]);
    p = await py(['--board', '42', '--out', join(TMP, 'py3')], { JIRA_EMAIL: 'jean.dupont@example.com', JIRA_TOKEN: 'faux' });
    check('jeton refusé', p.status === 1 && /authentification refusée/.test(p.stderr));
  }

  // ------------------------------------------------------------------ capture, interface
  scenario('R8', 'interface de capture : hôte, origine, type de contenu');
  const app = await startApp('jira-capture-app.mjs');
  const port = app.port;
  const html = await guards(port, 'capture');
  check('aucun champ d\'identifiant ni de mot de passe dans la page', !/type="password"|autocomplete="(?:username|current-password)"/.test(html));

  scenario('R9', 'interface de capture : refus');
  r = await post(port, '/api/capture', {});
  check('capture refusée sans sprint ouvert', r.status === 409, r.json?.error);
  r = await post(port, '/api/open', { url: 'file:///etc/passwd' });
  check('adresse non http refusée', r.status === 400, r.json?.error);
  r = await post(port, '/api/open', { url: backlog });
  check('navigateur ouvert, après le SSO', r.status === 200 && /ouvert sur le sprint/.test(r.json?.message ?? ''), r.json?.message ?? r.json?.error);
  check('un passage par le SSO', fake.stats.ssoLogins === 1, `${fake.stats.ssoLogins}`);
  r = await post(port, '/api/capture', { prefix: '1AB' });
  check('préfixe invalide refusé', r.status === 400, r.json?.error);
  r = await post(port, '/api/capture', { categories: 'ticket avec ia\nà classer' });
  check('catégorie réservée refusée', r.status === 400, r.json?.error);

  scenario('R10', 'capture d\'un backlog chargé au défilement');
  const filter = { prefix: 'demo', min: '3500', max: '4500', categories: 'ticket avec ia\nticket sans ia' };
  const out = join(TMP, 'sortie');
  let started = Date.now();
  r = await post(port, '/api/capture', { ...filter, folder: out });
  check('lancée en tâche de fond', r.status === 202, r.json?.message);
  r = await post(port, '/api/capture', { ...filter, folder: out });
  check('une seule capture à la fois', r.status === 409, r.json?.error);
  let status = await waitForJob(port);
  check('terminée', status.job.state === 'done', `${status.job.state} en ${((Date.now() - started) / 1000).toFixed(1)} s ${status.job.error ?? ''}`);
  const onDisk = status.job.report ? verifyRun(status.job.report, out) : null;
  check('avec une erreur, le navigateur reste ouvert', status.browser === true);

  scenario('R18', 'point d\'extension E1 : champs stables du rapport');
  check('champs du rapport', onDisk && sameSet(Object.keys(onDisk), REPORT_FIELDS), Object.keys(onDisk ?? {}).join(', '));
  check('champs d\'un ticket capturé', sameSet(Object.keys(onDisk?.tickets.find((t) => t.file) ?? {}), TICKET_FIELDS));
  check('champs d\'un ticket en erreur', sameSet(Object.keys(onDisk?.tickets.find((t) => t.error) ?? {}), ['key', 'url', 'category', 'error']));

  scenario('R11', 'nouvelle capture dans le même dossier');
  TICKETS['DEMOAB-3700'] = { visible: 'Étiquettes : ticket-sans-ia' }; // la catégorie du ticket a changé dans Jira
  await post(port, '/api/capture', { ...filter, min: '3700', max: '3700', folder: out });
  status = await waitForJob(port);
  const again = status.job.report ?? { tickets: [] };
  check('revenu à la page du sprint après une erreur : le ticket est retrouvé', again.selected === 1 && again.listed === BOARD_42.length + 1, `${again.selected} sur ${again.listed}`);
  check('le ticket rejoint sa nouvelle catégorie, sa copie précédente est retirée',
    existsSync(join(out, 'ticket sans ia', 'DEMOAB-3700.mhtml')) && !existsSync(join(out, UNCLASSIFIED, 'DEMOAB-3700.mhtml'))
    && JSON.stringify(again.tickets[0]?.movedFrom) === JSON.stringify([UNCLASSIFIED]), JSON.stringify(again.tickets[0]?.movedFrom));
  check('les autres tickets restent en place, sans sous-dossier', existsSync(join(out, 'ticket avec ia', 'DEMOAB-3500.mhtml'))
    && sameSet(readdirSync(out), ['ticket avec ia', 'ticket sans ia', UNCLASSIFIED, 'sprint.mhtml', 'rapport.json']));
  check('sans erreur, le navigateur se ferme', again.errors === 0 && status.browser === false);
  TICKETS['DEMOAB-3700'] = {};

  scenario('R12', 'session SSO gardée dans le profil');
  r = await post(port, '/api/open', { url: `${backlog}?mode=virtual` });
  check('navigateur rouvert sans nouveau passage par le SSO', r.status === 200 && fake.stats.ssoLogins === 1, `${fake.stats.ssoLogins}`);

  scenario('R13', 'capture d\'un backlog virtualisé');
  const virtual = join(TMP, 'sortie-virtuelle');
  started = Date.now();
  await post(port, '/api/capture', { ...filter, folder: virtual });
  status = await waitForJob(port);
  check('terminée', status.job.state === 'done', `${((Date.now() - started) / 1000).toFixed(1)} s ${status.job.error ?? ''}`);
  if (status.job.report) verifyRun(status.job.report, virtual);

  scenario('R14', 'arrêt après trois échecs de suite');
  await post(port, '/api/open', { url: `${fake.url}/jira/software/c/projects/DEMO/boards/43/backlog` });
  await post(port, '/api/capture', { prefix: 'DEMOXP', folder: join(TMP, 'sortie-expiree') });
  status = await waitForJob(port);
  const expired = status.job.report ?? {};
  check('trois erreurs sur cinq tickets, capture arrêtée', expired.aborted === true && expired.errors === 3 && expired.selected === 5
    && expired.tickets.length === 3, `${expired.errors} erreurs sur ${expired.selected}, arrêt : ${expired.aborted}`);
  check('le navigateur reste ouvert', status.browser === true);

  scenario('R15', 'arrêt par « Fermer le navigateur »');
  await post(port, '/api/open', { url: backlog });
  await post(port, '/api/capture', { ...filter, folder: join(TMP, 'sortie-arretee') });
  for (let i = 0; i < 120; i++) { // attend le deuxième ticket
    const { json } = await request(port, { path: '/api/status' });
    if (json.job.step === 'tickets' && json.job.done >= 1) break;
    await sleep(250);
  }
  r = await post(port, '/api/close', {});
  check('la fermeture arrête la capture', r.status === 200 && /arrêtée/.test(r.json?.message ?? ''), r.json?.message);
  status = await waitForJob(port);
  check('rapport partiel', status.job.state === 'done' && status.job.report?.aborted === true
    && status.job.report.tickets.length < 8 && status.browser === false, `${status.job.report?.tickets.length} tickets`);

  // ------------------------------------------------------------------ page de l'interface, pilotée comme par l'utilisateur
  scenario('R16', "page de l'interface");
  const ui = await chromium.launch({ channel: browserChannel(), headless: true });
  try {
    const page = await ui.newPage();
    // Une attente dépassée devient un contrôle en échec, sans interrompre la recette
    const waitUi = (fn, timeout) => page.waitForFunction(fn, null, { timeout }).then(() => true, () => false);
    await page.goto(`http://127.0.0.1:${port}/`);
    await page.fill('#url', backlog);
    await page.fill('#prefix', 'demo');
    await page.fill('#min', '3500');
    await page.fill('#max', '4500');
    await page.fill('#folder', join(TMP, 'interface'));
    await page.click('#open');
    const opened = await waitUi(() => /ouvert sur le sprint/.test(document.getElementById('status').textContent), 30_000);
    check("« Capturer les tickets » activé après l'ouverture", opened && await page.isEnabled('#capture'));
    await page.click('#capture');
    const progress = await waitUi(() => /^Ticket \d+ sur 8 : DEMO/.test(document.getElementById('status').textContent), 60_000);
    check('avancement affiché, boutons bloqués', progress && await page.isVisible('#progress') && await page.isDisabled('#open') && await page.isDisabled('#capture'));
    await waitUi(() => !document.getElementById('report').hidden, 180_000);
    const statusText = await page.textContent('#status');
    check('bilan de fin', /Capture terminée : 7 tickets enregistrés sur 8, 1 en erreur/.test(statusText), statusText);
    const summary = (await page.textContent('#report-summary')).replace(/\s+/g, ' ');
    check('résumé du rapport', /retenus par le filtre : 8/.test(summary) && /ticket avec ia : 3/.test(summary) && /à classer : 2/.test(summary), summary);
    const rows = await page.$$eval('#report-rows tr', (trs) => trs.map((tr) => [...tr.cells].map((td) => td.textContent)));
    check('une ligne par ticket, erreur signalée', rows.length === 8
      && rows.find((x) => x[0] === 'DEMOAB-3900')?.[3].includes('session SSO') && rows.find((x) => x[0] === 'DEMOAB-3700')?.[1] === UNCLASSIFIED, `${rows.length} lignes`);
    check('avertissement après une erreur', await page.isVisible('#report-warning'));
    await page.screenshot({ path: join(TMP, 'interface.png'), fullPage: true });
    await page.reload();
    check('valeurs gardées dans le navigateur', await page.inputValue('#prefix') === 'demo'
      && await page.inputValue('#max') === '4500' && await page.inputValue('#url') === backlog);
  } finally {
    await ui.close();
  }
  await post(port, '/api/close', {});
  app.child.kill('SIGINT');
  await sleep(1000);

  // ------------------------------------------------------------------ capture, ligne de commande
  scenario('R17', 'ligne de commande');
  const cli = (args) => run(process.execPath, [join(SKILL, 'scripts', 'jira-capture-mhtml.mjs'), ...args], { input: '\n' });
  let c = await cli([]);
  check('adresse manquante : code 2', c.status === 2 && /Usage/.test(c.stderr));
  c = await cli([backlog, '--min', 'abc']);
  check('numéro invalide : code 2', c.status === 2 && /Numéro minimal invalide/.test(c.stderr));
  c = await cli([backlog, '--prefixe', 'demoab', '--min', '4500', '--max', '4500', '--sortie', join(TMP, 'cli')]);
  check('un ticket capturé et classé, directement dans le dossier', c.status === 0 && /retenus par le filtre : 1 /.test(c.stdout)
    && existsSync(join(TMP, 'cli', 'ticket avec ia', 'DEMOAB-4500.mhtml')), `${c.status} ${c.stderr.trim().split('\n')[0] ?? ''}`);
  c = await cli([backlog, '--prefixe', 'demoab', '--min', '3900', '--max', '3900', '--sortie', join(TMP, 'cli')]);
  check('un ticket en erreur : code 1', c.status === 1 && /DEMOAB-3900 : page du ticket non affichée/.test(c.stdout), `${c.status}`);

  scenario('R19', "point d'extension E2 : capture pilotable par un autre outil");
  const exported = Object.keys(core).filter((k) => typeof core[k] === 'function').sort();
  check('fonctions exportées par le module commun', ['captureSprintTickets', 'loadAllTickets', 'captureTicket', 'captureMhtml', 'launchBrowser',
    'classify', 'parseFilter', 'matchesFilter', 'parseCategories'].every((k) => exported.includes(k)), exported.join(', '));
} catch (err) {
  check('exécution', false, err.stack);
} finally {
  for (const child of children) if (child.exitCode === null) child.kill('SIGKILL');
  await fake?.close();
  const failed = results.filter((x) => !x.ok);
  const skipped = results.filter((x) => x.skipped).length;
  const scenarios = new Set(results.map((x) => x.scenario).filter(Boolean)).size;
  if (failed.length || process.env.KEEP_TMP) console.log(`\nDossier temporaire gardé pour l'examen : ${TMP}`);
  else {
    try {
      rmSync(TMP, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    } catch (err) { // sous Windows, un fichier du profil peut rester verrouillé un instant
      console.log(`\nDossier temporaire non effacé (${err.code}) : ${TMP}`);
    }
  }
  console.log(`\nBilan : ${scenarios} scénarios, ${results.length} contrôles, ${results.length - failed.length - skipped} réussis, ${failed.length} en échec, ${skipped} sautés · Node.js ${process.version}`);
  process.exit(failed.length ? 1 : 0);
}
```
<<<FIN modules/recette/SKILL.md>>>

<<<FICHIER modules/remise/SKILL.md>>>
---
name: remise
description: Dimension réservée D9 (remise des tickets capturés d'une catégorie à agent-tdd-jira ou à Agent2Dev, à partir de rapport.json, sans relire les pages ; point d'extension E1). Ne pas appliquer en 1.x.
dimensions: [D9]
status: reserved
---

# Module `remise` (D9, réservé)

Phase 7E couverte : Évolutif.

## Intention

Les fichiers capturés sont des MHTML de Chrome, ceux que lit l'ingestion d'`agent-tdd-jira`, qui ne les modifie jamais (`agent-tdd-jira:D1.INV-1`). D9 remettra à cette ingestion, ou à Agent2Dev, les tickets d'une catégorie choisie par le développeur, par exemple `ticket avec ia`, dans l'ordre du rapport, sans relire les pages ni déplacer les fichiers.

## Ce qui existe déjà en 1.0.0

Le point d'extension E1 : `rapport.json` a des champs stables (module `classement`, § 6). Une remise y lira `tickets[].file` et `tickets[].category`, et écartera les tickets en erreur ou à classer.

## Ce qui reste à décider

- La forme de la remise : liste de fichiers pour l'ingestion d'`agent-tdd-jira`, ou dossier d'échange d'Agent2Dev.
- Le contrôle du développeur avant la remise de chaque catégorie.
<<<FIN modules/remise/SKILL.md>>>

<<<FICHIER modules/pilotage/SKILL.md>>>
---
name: pilotage
description: Dimension réservée D10 (pilotage de la capture par un autre outil, par exemple GeminiBoard pour Gemini CLI ou un service MCP, à partir de la fonction captureSprintTickets du module commun ; point d'extension E2). Ne pas appliquer en 1.x.
dimensions: [D10]
status: reserved
---

# Module `pilotage` (D10, réservé)

Phase 7E couverte : Évolutif.

## Intention

Le développeur prévoit d'intégrer le skill à Gemini CLI depuis GeminiBoard. D10 permettra à un autre outil de lancer et de suivre une capture sans la page de l'interface : GeminiBoard, une commande Gemini CLI, ou un service MCP.

## Ce qui existe déjà en 1.0.0

- Le point d'extension E2 : `captureSprintTickets(context, page, options)` est une fonction du module commun, qui signale son avancement par `onProgress` et rend le rapport. L'interface et la ligne de commande n'en sont que deux appelants.
- L'API HTTP de l'interface (module `interface`, § 2), que l'agent `capteur-sprint` pilote déjà.

## Ce qui reste à décider

- Le canal : commande TOML de Gemini CLI qui appelle l'API HTTP, extension de projet de GeminiBoard, ou service MCP.
- La connexion SSO, qui reste faite à la main dans une fenêtre visible, quel que soit l'appelant (D2.INV-1).
<<<FIN modules/pilotage/SKILL.md>>>

---

# Table d'intégrité (sha256)

Format compatible `sha256sum -c`, à exécuter depuis le dossier où les fichiers ont été matérialisés.

    e2a100648b6f3b20bb4d6e9cce3988bffab7a8f634de73e13e03d9f1ca8e88c2  manifest.json
    5e447ffde4db2ef6e3e72638f7b2a74322b96a0c62ade6b79604f61568c18ea4  SKILL.md
    46546d9da67bbae912933237be1e5448fd76e46c01ab8d36fcb5d289f97b0966  modules/execution/SKILL.md
    fe7f3e89a693889c3cf0c1e97f7bfa8d2c01f3ec5da6c56ddf56f10e949bfb8b  modules/session/SKILL.md
    4ddc43cbed3cee279a524a56703b1d129abebda7230d46ae325b11b1978cee8a  modules/releve/SKILL.md
    6e3ef43ae8a3b88ab5398d4c21ecc9e533f41dd3bf462bbc900229458ffb3b53  modules/capture/SKILL.md
    075cab0e4c49d0b5622bc5806b03b95c6eeafc60785eef501dce23166ea9df8e  modules/classement/SKILL.md
    93df16f2229d7bf048e767315b8f72a2a29921f0c955af37d191801da005688c  modules/interface/SKILL.md
    1d21fe8ed58b668d401847aec725f122051798cbe75ad92e0c9f23b1ba465e15  modules/agent/SKILL.md
    ce5aa772b75fa711d8d80e58325c410ce6231b5a1795761b16738d00a5d0f462  modules/export-api/SKILL.md
    d847e37500dc023e892e8de02ae69526b67c5c23cc75727906fb9c59afd659a3  modules/recette/SKILL.md
    f8839f9774c2099a9a8ed4259f5e461b7d0f9b8c424a664dfdcb9ff90af4f3e8  modules/remise/SKILL.md
    469e7591327de004f79be36da387704962de141bb04345e3e9c8ca27b07a43a8  modules/pilotage/SKILL.md
