---
name: execution
description: Exécution du skill (installation par npm ci, Node 22 ou plus récent, navigateur du poste et canal Chrome, Edge ou Chromium, dépendance unique playwright-core 1.65.1 à version exacte, emplacements des profils et des résultats, .gitignore du skill, réglages par variables SCENARIO_PLAYWRIGHT_*, lignes de commande de jouer, verifier, traduire, importer et indexer et leurs codes de sortie, pièges connus dont le proxy des API et la préparation refusée par l'API, commande d'extraction des fichiers exécutables à empreintes, sources de package.json, package-lock.json, .gitignore, scripts/jouer.mjs, scripts/verifier.mjs et scripts/traduire.mjs). À lire en premier, pour installer le skill.
dimensions: [D1]
status: active
---

# Module `execution` (D1)

Phase 7E couverte : Espace.

## 1. Commandes

Les scripts se lancent depuis n'importe quel dossier ; un scénario se désigne par son chemin, et ses résultats s'écrivent à côté de lui.

| Commande | Rôle | Module |
|---|---|---|
| `node <skill>/scripts/indexer.mjs <dossier du projet> [--dossier scenarios] [--langue fr]` | index du code du projet, sans IA et sans rien exécuter, écrit dans `index/` du dossier des scénarios | `code` |
| `node <skill>/scripts/traduire.mjs <texte.scenario> [--remplacer]` | squelette TOML de la traduction, écrit à côté du texte, avec les propositions de l'index du code | `scenario`, `code` |
| `node <skill>/scripts/verifier.mjs <fichier>... [--plan] [--param nom=valeur]...` | vérification sans navigateur d'un texte ou d'un scénario | `texte`, `scenario` |
| `node <skill>/scripts/jouer.mjs <scénario.toml> [options]` | exécution dans le navigateur du poste, préparation et nettoyage des données compris, rapport | `actions`, `donnees` |
| `node <skill>/scripts/designer.mjs <adresse> [--profil nom] [--max n]` | désignation de cibles à la souris | `designer` |
| `node <skill>/scripts/importer.mjs <page.mhtml \| adresse> --adresse <url> [options]` | un texte de départ par scénario Gherkin d'une demande Jira ; `--comparer` compare sans écrire | `jira` |
| `node <skill>/scripts/importer.mjs <fichier.feature \| export.zip \| xray:CLÉ,… \| xray-dc:CLÉ,… \| zephyr:CLÉ,… \| zephyr-dc:CLÉ,…> --adresse <url> [options]` | un texte de départ par test d'un fichier, d'une archive, de Xray ou de Zephyr Scale ; jeton par variable d'environnement | `cas-de-test` |
| `npm test`, depuis le dossier du skill | recette | `recette` |

`package.json` donne aussi `npm run jouer -- <scénario.toml>`, `npm run verifier -- <fichier>`, `npm run traduire -- <texte.scenario>`, `npm run designer -- <adresse>`, `npm run importer -- <page.mhtml> --adresse <url>` et `npm run indexer -- <dossier du projet>`, depuis le dossier du skill.

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
| `index/code.json` et `index/code.md`, dans le dossier de `--dossier` de `indexer.mjs` | index du code du projet (module `code`) : noms, textes, chemins et contraintes du code, sans aucune valeur de configuration | au choix du développeur : l'index se régénère à tout moment |

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
| `--autoriser-mutations` | autorise, pour cette exécution, les étapes de mutation hors du poste, et les appels et scénarios de préparation et de nettoyage qui modifient des données (D7.INV-2, D20.INV-3) |

Sortie : une ligne d'en-tête (titre, jeux, étapes, navigateur et version), `AVERTISSEMENT` de compatibilité s'il y a lieu (D6.INV-1), `Jeu n : …` pour chaque jeu quand il y en a plusieurs, `À VOUS : …` pour une étape à la main, une ligne par étape (`ok`, `KO` avec le message, `--` non jouée), une ligne par entrée de préparation, à sa place parmi les étapes (`p1.`), et de nettoyage, après elles (`n1.`), les étapes d'un scénario de préparation en retrait, `AVERTISSEMENT nettoyage …` pour un nettoyage en échec (module `donnees`, § 7), `origine bloquée : …` pour chaque origine interrompue, puis `Bilan : …`, qui compte les entrées de préparation et de nettoyage, et `Rapport : <chemin de rapport.md>`.

| Code | `jouer.mjs` | `verifier.mjs`, `traduire.mjs`, `indexer.mjs` |
|---|---|---|
| 0 | toutes les étapes et toutes les préparations de tous les jeux ont réussi ; un nettoyage en échec est signalé sans changer le code (D20.INV-4) | tout est conforme ; squelette écrit ; index écrit |
| 1 | au moins une étape ou une préparation a échoué ; le rapport est écrit | |
| 2 | scénario, option, réglage ou navigateur refusé, avant toute action dans le navigateur ; aucun rapport | un fichier refusé ; squelette non écrit ; option refusée ou projet introuvable, index non écrit |

Les options, la sortie et les codes de `importer.mjs` sont au module `jira`, § 7 (D16.INV-6) ; ses sources de cas de test et leurs jetons, au module `cas-de-test`, § 2 à § 4.

`verifier.mjs` écrit `ok` pour chaque fichier conforme, `ERREUR` pour chaque erreur, et `note` pour ce que le développeur doit savoir avant de jouer : ce qui modifie des données, étapes, appels et scénarios de préparation et de nettoyage, et les origines hors du poste, étapes à la main, nettoyage d'une donnée fixe (module `donnees`, § 7), cibles fragiles, et, avec un index du code dans le dossier du scénario, cibles et chemins absents de l'index, ou index périmé (module `code`, § 9) ; une note ne change pas le code de sortie. `--plan` ajoute le plan de la traduction (module `scenario`, § 4.4) ; `--param` y vérifie une valeur donnée en ligne de commande.

Les options, la sortie et les codes de `indexer.mjs` sont au module `code`, § 2.

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
- **Index du code périmé** : après chaque modification du code, `traduire.mjs` et `verifier.mjs` le disent périmé et ne l'emploient plus ; `indexer.mjs` se relance. Sur un très grand dépôt, l'index s'arrête à ses bornes (module `code`, § 8) : il se lance alors sur le dossier du front ou du back seulement.
- **Préparation refusée par l'API** : 401 dit que l'API ne reconnaît pas la session du navigateur ; la connexion se fait à la main avant la préparation, par une ligne « (à la main) » qui la précède, ou dans le profil avant l'exécution. Une API qui attend un jeton dans l'en-tête `Authorization` répond toujours 401 : elle se prépare par un scénario, par l'écran. 403 dit des droits insuffisants, ou un jeton anti-CSRF refusé : le skill recopie `XSRF-TOKEN` et `csrftoken`, pas un autre nom de cookie. 415 dit une API qui n'accepte pas de corps JSON : elle se prépare aussi par un scénario (module `donnees`, § 5 et § 6).
- **Réponse interrompue** : une vérification `requete` ne lit pas la réponse d'une page qui change de document juste après (navigation complète) ; elle vérifie alors le statut, ou l'effet à l'écran (module `hors-ecran`, § 3).

## 8. Matérialiser les fichiers exécutables

| Fichier | Module, section | Empreinte sha256 |
|---|---|---|
| `package.json` | `execution`, § 10 | `dd88ebaec8e256e47718e7e06db858988c22fe395e9a29dbf0cadf8cc9cd647e` |
| `package-lock.json` | `execution`, § 10 | `cbb8330ecbc733493ff86ebaa85ff7879e26faff92306a73134a7c02a2a2b01a` |
| `.gitignore` | `execution`, § 10 | `03bf7f97f17a0d1abb005b6480ec3b0f06a0b9c29c1d1f83131209b52b888a7e` |
| `scripts/jouer.mjs` | `execution`, § 11 | `ad8837a53da336ae8e7b22d1007075618381a87b66151fd2acb6a48fa8e10db6` |
| `scripts/verifier.mjs` | `execution`, § 12 | `3b4235e38b2b97fd22a4644f30d0c365d7804c3e00287ccb290d89cbbc403e35` |
| `scripts/traduire.mjs` | `execution`, § 13 | `bd141ee155f89e6212e9068f00a45de5600054cf3698531711c83dab77475ca6` |
| `scripts/texte.mjs` | `texte`, § 12 | `8166c574df00c99df2c418d2e431d3101a4a700d8dd250739eafbf1bdf54d693` |
| `scripts/jira.mjs` | `jira`, § 9 | `86ef113cc4824581e4c8f9df8291ad2254ab08ea8dab1b5b4d5567dd80f2be78` |
| `scripts/importer.mjs` | `jira`, § 10 | `1cf3e8f5b51386558e1c5b8a9659a8e11a7c57b1c869f2e6ac1f8ffe64cf3607` |
| `scripts/cas.mjs` | `cas-de-test`, § 10 | `8f30a83c378a526676a2ea6c1879d306df128cb8897ec4d02c0c3d71bea04019` |
| `scripts/lecteurs.mjs` | `code`, § 11 | `00ba500a0c9bcc7db6d2b00a2185c87197d6379685cd442f8c0cfb65668150c4` |
| `scripts/code.mjs` | `code`, § 12 | `2d2f24ad34a66e31bf32c2235da8549816cf1e9e0d50483454cdb8ba7a20ece3` |
| `scripts/indexer.mjs` | `code`, § 13 | `e16db5372ec74b052dcfc61ff32d2f531397dd31c607ae458f8f4931c63388e2` |
| `scripts/toml.mjs` | `scenario`, § 6 | `6310e3eaea0a0887d99e3ead6697c429909ff4e0d65d7bc82bc6f6ba0e2eef44` |
| `scripts/scenario.mjs` | `scenario`, § 7 | `1101fb7cc4031f0f56434db35667649a5768ce886b2ce2150766c22adcced857` |
| `scripts/cibles.mjs` | `cibles`, § 6 | `e1b4576c02337e0f14962fe9e070ffcff86f65e2275a354d46e30439789e0a80` |
| `scripts/moteur.mjs` | `actions`, § 9 | `598eb60b074d05c5e4242eab13be6b3fd38588c55ae3bf293d74f7ccc3d07067` |
| `scripts/session.mjs` | `session`, § 7 | `716ab5aba57c7fa2e9155e812cd95cef072f0347a9bd0e090d21d1100f13b600` |
| `scripts/rapport.mjs` | `preuves`, § 7 | `77b4b4b8fc3e829fd1c776de2e2571ceb94ac740b12a1853b31c65456fa997e5` |
| `scripts/designer.mjs` | `designer`, § 5 | `931678611f04ab6991981abaf374730d35346c40d60e3c98200c27c2bbf51cfe` |
| `agent/pilote-scenario.md` | `agent`, § 6 | `07595c96799cf719a69ae28034c95842b16598ed330b143f6ca60b49af822a8d` |
| `commandes/scenario/importer.toml` | `agent`, § 7 | `a9bb446d8350fc03dbd2a486c0cc61730cebfba049f38f2f9c98d447b487b3c7` |
| `commandes/scenario/indexer.toml` | `agent`, § 7 | `50cca3628af8772440c609d1282042ffac9db5c4ea06e171609f25a0a0d7802a` |
| `commandes/scenario/traduire.toml` | `agent`, § 7 | `03f4ec736e434349e6978335828020fad538c16ccda100df946e0a11c0ace32c` |
| `commandes/scenario/jouer.toml` | `agent`, § 7 | `de037b1e2bcaed27ee403dfc899dffbac8538e6f169744750c38b944a0dada92` |
| `commandes/scenario/designer.toml` | `agent`, § 7 | `c98bf6b1db170a2e7804b368dfa5b6a5ed5087d95aa431ada98dcdf12d0df46e` |
| `tests/application-demo.mjs` | `recette`, § 6 | `b16026fad5ef8881183895b6937a59e4c6f97ceccd7364ad09072c75ed239da5` |
| `tests/projet-demo.mjs` | `recette`, § 6 | `783a9177117db34d69304a59c02d4cad398a7b3759c36fc0d0d4e7b50792d8f3` |
| `tests/run-tests.mjs` | `recette`, § 6 | `8c553f8010a0ab500ac72287c0b88345e5a330aaa294c99df9919fbf41a4d3cc` |

Depuis le dossier du skill, cette commande d'une ligne écrit les vingt-neuf fichiers, compare leurs empreintes à celles du tableau et sort avec le code 1 au moindre écart. Elle ne contient ni `$`, ni accent grave, ni `!`, ni `%`, ni guillemet intérieur : elle se colle telle quelle dans bash, zsh, CMD ou PowerShell, et dans un fichier `.cmd`. Elle lit aussi des modules aux fins de ligne CRLF.

```text
node -e "const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'); const attendu = { 'package.json': 'dd88ebaec8e256e47718e7e06db858988c22fe395e9a29dbf0cadf8cc9cd647e', 'package-lock.json': 'cbb8330ecbc733493ff86ebaa85ff7879e26faff92306a73134a7c02a2a2b01a', '.gitignore': '03bf7f97f17a0d1abb005b6480ec3b0f06a0b9c29c1d1f83131209b52b888a7e', 'scripts/jouer.mjs': 'ad8837a53da336ae8e7b22d1007075618381a87b66151fd2acb6a48fa8e10db6', 'scripts/verifier.mjs': '3b4235e38b2b97fd22a4644f30d0c365d7804c3e00287ccb290d89cbbc403e35', 'scripts/traduire.mjs': 'bd141ee155f89e6212e9068f00a45de5600054cf3698531711c83dab77475ca6', 'scripts/texte.mjs': '8166c574df00c99df2c418d2e431d3101a4a700d8dd250739eafbf1bdf54d693', 'scripts/jira.mjs': '86ef113cc4824581e4c8f9df8291ad2254ab08ea8dab1b5b4d5567dd80f2be78', 'scripts/importer.mjs': '1cf3e8f5b51386558e1c5b8a9659a8e11a7c57b1c869f2e6ac1f8ffe64cf3607', 'scripts/cas.mjs': '8f30a83c378a526676a2ea6c1879d306df128cb8897ec4d02c0c3d71bea04019', 'scripts/lecteurs.mjs': '00ba500a0c9bcc7db6d2b00a2185c87197d6379685cd442f8c0cfb65668150c4', 'scripts/code.mjs': '2d2f24ad34a66e31bf32c2235da8549816cf1e9e0d50483454cdb8ba7a20ece3', 'scripts/indexer.mjs': 'e16db5372ec74b052dcfc61ff32d2f531397dd31c607ae458f8f4931c63388e2', 'scripts/toml.mjs': '6310e3eaea0a0887d99e3ead6697c429909ff4e0d65d7bc82bc6f6ba0e2eef44', 'scripts/scenario.mjs': '1101fb7cc4031f0f56434db35667649a5768ce886b2ce2150766c22adcced857', 'scripts/cibles.mjs': 'e1b4576c02337e0f14962fe9e070ffcff86f65e2275a354d46e30439789e0a80', 'scripts/moteur.mjs': '598eb60b074d05c5e4242eab13be6b3fd38588c55ae3bf293d74f7ccc3d07067', 'scripts/session.mjs': '716ab5aba57c7fa2e9155e812cd95cef072f0347a9bd0e090d21d1100f13b600', 'scripts/rapport.mjs': '77b4b4b8fc3e829fd1c776de2e2571ceb94ac740b12a1853b31c65456fa997e5', 'scripts/designer.mjs': '931678611f04ab6991981abaf374730d35346c40d60e3c98200c27c2bbf51cfe', 'agent/pilote-scenario.md': '07595c96799cf719a69ae28034c95842b16598ed330b143f6ca60b49af822a8d', 'commandes/scenario/importer.toml': 'a9bb446d8350fc03dbd2a486c0cc61730cebfba049f38f2f9c98d447b487b3c7', 'commandes/scenario/indexer.toml': '50cca3628af8772440c609d1282042ffac9db5c4ea06e171609f25a0a0d7802a', 'commandes/scenario/traduire.toml': '03f4ec736e434349e6978335828020fad538c16ccda100df946e0a11c0ace32c', 'commandes/scenario/jouer.toml': 'de037b1e2bcaed27ee403dfc899dffbac8538e6f169744750c38b944a0dada92', 'commandes/scenario/designer.toml': 'c98bf6b1db170a2e7804b368dfa5b6a5ed5087d95aa431ada98dcdf12d0df46e', 'tests/application-demo.mjs': 'b16026fad5ef8881183895b6937a59e4c6f97ceccd7364ad09072c75ed239da5', 'tests/projet-demo.mjs': '783a9177117db34d69304a59c02d4cad398a7b3759c36fc0d0d4e7b50792d8f3', 'tests/run-tests.mjs': '8c553f8010a0ab500ac72287c0b88345e5a330aaa294c99df9919fbf41a4d3cc' }; const vus = new Set(); let ecarts = 0; for (const module of ['modules/execution/SKILL.md', 'modules/texte/SKILL.md', 'modules/jira/SKILL.md', 'modules/cas-de-test/SKILL.md', 'modules/code/SKILL.md', 'modules/scenario/SKILL.md', 'modules/cibles/SKILL.md', 'modules/actions/SKILL.md', 'modules/session/SKILL.md', 'modules/preuves/SKILL.md', 'modules/designer/SKILL.md', 'modules/agent/SKILL.md', 'modules/recette/SKILL.md']) { const texte = fs.readFileSync(module, 'utf8').replace(/\r\n/g, '\n'); for (const m of texte.matchAll(/^<\x21-- fichier : (\S+) -->\n\x60{3}[a-z]*\n([\s\S]*?)\n\x60{3}\n/gm)) { const contenu = m[2] + '\n'; fs.mkdirSync(path.dirname(m[1]), { recursive: true }); fs.writeFileSync(m[1], contenu); vus.add(m[1]); const conforme = crypto.createHash('sha256').update(contenu).digest('hex') === attendu[m[1]]; if (conforme === false) ecarts++; console.log((conforme ? 'conforme  ' : 'ECART     ') + m[1]); } } for (const f of Object.keys(attendu)) if (vus.has(f) === false) { ecarts++; console.log('ABSENT    ' + f); } if (ecarts > 0) process.exitCode = 1;"
```

Puis, depuis le même dossier : `npm ci`, et la recette, `npm test` (sous Linux sans écran, `xvfb-run -a npm test`).

## 9. Contrôle de sortie

- La commande du § 8 écrit `conforme` pour chacun des vingt-neuf fichiers.
- `npm ci` installe `playwright-core` 1.65.1.
- `npm test` rend son bilan sans échec (module `recette`).

## 10. Paquet et fichiers de travail

`package.json` déclare la dépendance unique, la version de Node et les commandes du § 1 ; `package-lock.json` fixe la version de la dépendance ; `.gitignore` écarte les fichiers de travail (§ 3).

<!-- fichier : package.json -->
```json
{
  "name": "scenario-playwright",
  "version": "1.4.0",
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
    "indexer": "node scripts/indexer.mjs",
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
  "version": "1.4.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "scenario-playwright",
      "version": "1.4.0",
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

L'exécution : lecture de la ligne de commande et des réglages, lecture et contrôle du scénario et de ses scénarios de préparation (modules `scenario` et `donnees`), préparation des jeux, refus avant le navigateur (D6.INV-3, D7.INV-2, D20.INV-3), ouverture du navigateur et garde des origines (module `session`), moteur (modules `actions` et `donnees`), rapport (module `preuves`).

<!-- fichier : scripts/jouer.mjs -->
```javascript
#!/usr/bin/env node
// scenario-playwright 1.4.0 : joue un scénario TOML dans le navigateur du poste, comme un utilisateur.
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
import { DELAI_DEFAUT, lireScenario, mutationsDe, preparerJeux } from './scenario.mjs';
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
  const sous = [...scenario.preparation, ...scenario.nettoyage].filter((e) => e.charge).map((e) => e.charge.scenario);
  if (o.sansTete && [scenario, ...sous].some((s) => s.etapes.some((e) => e.action === 'main'))) return refus('le scénario, ou un scénario de préparation, a une étape à la main : il se joue dans une fenêtre visible, sans --sans-tete (D6.INV-3)');
  const distantes = scenario.origines.filter((x) => !estLocale(x));
  const mutantes = mutationsDe(scenario);
  if (mutantes.length && distantes.length && !o.autoriserMutations) {
    return refus(`le scénario modifie des données (${mutantes.join(', ')}) et déclare des origines hors du poste (${distantes.join(', ')}) : --autoriser-mutations, avec l'accord du développeur pour cette exécution (D7.INV-2, D20.INV-3)`);
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
          console.log(`  ${ev.sous ? '      ' : ''}${marque}${String(e.numero).padStart(2)}. ${e.resume}${e.statut === 'echec' ? ` : ${e.message}` : ''}`);
        }
        if (ev.type === 'fin-entree') {
          const e = ev.entree;
          const marque = { reussie: 'ok  ', echec: 'KO  ', non_jouee: '--  ' }[e.statut];
          console.log(`  ${marque}${e.genre === 'preparation' ? 'p' : 'n'}${e.numero}. ${e.genre === 'preparation' ? 'préparation' : 'nettoyage'} : ${e.resume}${e.appel ? ` → ${e.appel.statut}` : ''}${e.statut === 'echec' ? ` : ${e.message}` : ''}`);
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
  // Un nettoyage en échec est dit, sans changer le code de sortie (D20.INV-4).
  for (const j of joues) for (const e of j.nettoyage.filter((x) => x.statut === 'echec')) console.log(`AVERTISSEMENT nettoyage ${e.numero}${joues.length > 1 ? ` du jeu ${j.numero}` : ''} en échec : ${e.message} ; des données de l'exécution peuvent rester (D20.INV-4)`);
  console.log(`Bilan : ${rapport.statut === 'reussi' ? 'réussi' : 'échec'}, ${b.etapes} étapes, ${b.reussies} réussies, ${b.echecs} en échec, ${b.non_jouees} non jouées${b.preparations || b.nettoyages ? ` ; préparation : ${b.preparations}, nettoyage : ${b.nettoyages}${b.nettoyages_en_echec ? `, dont ${b.nettoyages_en_echec} en échec` : ''}` : ''}`);
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
// scenario-playwright 1.4.0 : vérifie des textes de départ et des scénarios TOML, sans ouvrir de navigateur.
//
// Usage : node <dossier du skill>/scripts/verifier.mjs <fichier.scenario | fichier.toml>... [--plan] [--param nom=valeur]...
// Un texte : sa structure (D2). Un scénario : sa validité, le contrôle de sa traduction s'il cite un texte,
// ses variables et ses fichiers (D3) ; --plan montre la traduction ligne du texte par ligne du texte, pour
// la ratification. Avec un index du code à jour dans le dossier du scénario, une cible ou un chemin absent
// de l'index est noté, sans changer le code de sortie (D18.INV-4). La préparation et le nettoyage des
// données sont notés avec la garde qui s'y applique, et un nettoyage qui vise une donnée fixe, sans valeur
// gardée ni ${unique}, est signalé avant la ratification (D20). Code 0 si tout est conforme, 2 sinon.
import { basename, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { decrireCible, estFragile } from './cibles.mjs';
import { cheminDansIndex, cibleDansIndex, lireIndex } from './code.mjs';
import { cheminMasque, lireScenario, mutationsDe, planTraduction, preparerJeux, textesEntree, variablesDe } from './scenario.mjs';
import { estLocale } from './session.mjs';
import { analyserTexte, libelleMarque } from './texte.mjs';

const USAGE = 'Usage : node scripts/verifier.mjs <fichier.scenario | fichier.toml>... [--plan] [--param nom=valeur]...';

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
  const index = new Map();
  for (const f of fichiers) {
    const nom = basename(f);
    if (/\.scenario$/i.test(f)) {
      let source;
      try { source = readFileSync(f, 'utf8'); } catch { console.log(`ERREUR ${nom} : fichier introuvable`); code = 2; continue; }
      const { scenario: t, erreurs } = analyserTexte(source);
      if (erreurs.length) { for (const e of erreurs) console.log(`ERREUR ${nom}, ligne ${e.ligne} : ${e.message}`); code = 2; continue; }
      const marques = t.etapes.filter((e) => e.marque).map((e) => `l.${e.ligne} ${libelleMarque(e)}`);
      console.log(`ok  ${nom} : « ${t.titre} », ${t.etapes.length} étape${t.etapes.length > 1 ? 's' : ''}${marques.length ? ` (${marques.join(', ')})` : ''}${t.jeux ? `, ${t.jeux.length} exemple${t.jeux.length > 1 ? 's' : ''}` : ''} ; empreinte ${t.empreinte}`);
      continue;
    }
    const { scenario, texte, erreurs, dossier } = lireScenario(resolve(f));
    if (!scenario) { for (const e of erreurs) console.log(`ERREUR ${nom} : ${e}`); code = 2; continue; }
    const { erreurs: erreursJeux } = preparerJeux(scenario, dossier, params);
    if (erreursJeux.length) { for (const e of erreursJeux) console.log(`ERREUR ${nom} : ${e}`); code = 2; continue; }
    const entrees = [scenario.preparation.length ? `${scenario.preparation.length} en préparation` : null, scenario.nettoyage.length ? `${scenario.nettoyage.length} en nettoyage` : null].filter(Boolean);
    console.log(`ok  ${nom} : « ${scenario.titre} », ${scenario.etapes.length} étapes${entrees.length ? ` (et ${entrees.join(', ')})` : ''}${scenario.jeux ? `, ${scenario.jeux.length} jeux` : ''}${texte ? `, traduit de ${scenario.source}, empreinte conforme, traduction contrôlée` : ''}`);
    const mutations = mutationsDe(scenario);
    const distantes = scenario.origines.filter((o) => !estLocale(o));
    if (mutations.length) console.log(`note ${nom} : modifient des données : ${mutations.join(', ')}${distantes.length ? ` ; origines hors du poste (${distantes.join(', ')}) : se joue avec --autoriser-mutations, après accord du développeur` : ''}`);
    const sous = [...scenario.preparation, ...scenario.nettoyage].filter((e) => e.charge).map((e) => e.charge.scenario);
    if ([scenario, ...sous].some((s) => s.etapes.some((e) => e.action === 'main'))) console.log(`note ${nom} : étapes à la main : fenêtre visible nécessaire`);
    // Un nettoyage qui ne vise ni une valeur gardée ni ${unique}, même par une variable dont chaque valeur le
    // contient, peut supprimer une donnée d'avant l'exécution (D20.INV-4).
    const gardees = new Set(scenario.preparation.flatMap((e) => Object.keys(e.garder ?? {})));
    const valeursDe = (v) => (Object.hasOwn(params, v) ? [params[v]] : (scenario.jeux ?? []).some((j) => Object.hasOwn(j, v)) ? scenario.jeux.map((j) => j[v]) : Object.hasOwn(scenario.parametres, v) ? [scenario.parametres[v]] : []);
    const unique = (v) => { const l = valeursDe(v); return l.length > 0 && l.every((x) => /\$\{unique\}|<unique>/.test(String(x))); };
    const fixes = scenario.nettoyage.flatMap((e, i) => (e.scenario === undefined && !textesEntree(e).flatMap(variablesDe).some((v) => v === 'unique' || gardees.has(v) || unique(v)) ? [`nettoyage ${i + 1} (${e.methode} ${cheminMasque(e.chemin)})`] : []));
    if (fixes.length) console.log(`note ${nom} : nettoyage d'une donnée fixe, sans valeur gardée ni \${unique} : ${fixes.join(' ; ')} ; il peut supprimer une donnée qui existait avant l'exécution, à examiner avant la ratification`);
    const fragiles = [...new Set(scenario.etapes.filter((e) => estFragile(e.cible)).map((e) => decrireCible(e.cible)))];
    if (fragiles.length) console.log(`note ${nom} : cibles fragiles : ${fragiles.join(' ; ')}`);
    if (!index.has(dossier)) index.set(dossier, lireIndex(dossier));
    const ix = index.get(dossier);
    if (ix.etat === 'frais') {
      const cibles = [];
      const chemins = [];
      scenario.etapes.forEach((e, i) => {
        const ou = `étape ${i + 1}${e.ligne ? ` (l.${e.ligne})` : ''}`;
        for (const c of [e.cible, e.jusqua?.cible]) if (c && !cibleDansIndex(ix.index, c)) cibles.push(`${ou} ${decrireCible(c)}`);
        if (e.action === 'verifier' && (e.critere === 'requete' || e.critere === 'api') && typeof e.chemin === 'string' && !cheminDansIndex(ix.index, e.critere === 'api' ? 'GET' : e.methode ?? null, e.chemin)) chemins.push(`${ou} ${e.critere === 'api' ? 'GET' : e.methode ?? ''} ${e.chemin}`.replace(/\s+/g, ' '));
      });
      for (const genre of ['preparation', 'nettoyage']) scenario[genre].forEach((e, i) => {
        if (e.scenario === undefined && typeof e.chemin === 'string' && !cheminDansIndex(ix.index, e.methode, e.chemin)) chemins.push(`${genre === 'preparation' ? 'préparation' : 'nettoyage'} ${i + 1}${e.ligne ? ` (l.${e.ligne})` : ''} ${e.methode} ${cheminMasque(e.chemin)}`);
      });
      if (cibles.length) console.log(`note ${nom} : cibles absentes de l'index du code (texte variable, composant hors du projet, ou cible à revoir) : ${cibles.join(' ; ')}`);
      if (chemins.length) console.log(`note ${nom} : chemins absents de l'index du code : ${chemins.join(' ; ')}`);
    } else if (ix.etat !== 'absent') console.log(`note ${nom} : ${ix.raison} ; cibles non comparées à l'index`);
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
// scenario-playwright 1.4.0 : squelette TOML de la traduction d'un texte de départ, produit sans IA.
//
// Usage : node <dossier du skill>/scripts/traduire.mjs <fichier.scenario> [--remplacer]
// Écrit <fichier>.toml à côté du texte : structure recopiée du texte, empreinte du texte, et un bloc
// [[etapes]] par étape du texte, à compléter (D3.INV-5). Si le dossier du texte a un index du code à
// jour (indexer.mjs), chaque étape reçoit en commentaire les cibles de l'index dont le nom correspond aux
// libellés entre guillemets de sa phrase (D18.INV-4) ; un index périmé n'est pas employé (D18.INV-2).
// Une ligne de préparation ou de nettoyage a son bloc [[preparation]] ou [[nettoyage]] : par l'API, avec
// les endpoints d'écriture de l'index et les champs de leur corps en commentaire ; par un scénario, avec ses
// paramètres s'il existe déjà (D20).
// Refuse d'écraser un scénario existant sans --remplacer. Code 0 si le squelette est écrit, 2 sinon.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { candidats, candidatsAppel, lireIndex } from './code.mjs';
import { squeletteToml } from './scenario.mjs';
import { analyserTexte } from './texte.mjs';
import { lireToml } from './toml.mjs';

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
  const ix = lireIndex(dirname(resolve(fichier)));
  const proposer = ix.etat === 'frais' ? (phrase) => candidats(ix.index, phrase) : null;
  const proposerAppel = ix.etat === 'frais' ? (phrase) => candidatsAppel(ix.index, phrase) : null;
  // Paramètres d'un scénario de préparation déjà écrit, lus sans le valider : une aide au squelette.
  const parametresDe = (nom) => {
    try {
      const objet = lireToml(readFileSync(join(dirname(fichier), `${nom}.toml`), 'utf8'), nom);
      return Object.keys(objet.parametres ?? {});
    } catch { return null; }
  };
  const squelette = squeletteToml(texte, basename(fichier), { proposer, proposerAppel, parametresDe, empreinteIndex: ix.index?.empreinte });
  writeFileSync(cible, squelette);
  const entrees = texte.etapes.filter((e) => e.marque === 'preparation' || e.marque === 'nettoyage');
  const aCompleter = texte.etapes.length - entrees.length;
  console.log(`écrit : ${cible}`);
  if (proposer) {
    const avec = texte.etapes.filter((e) => (e.marque === 'preparation' || e.marque === 'nettoyage' ? !e.scenario && proposerAppel(e.phrase).length > 0 : e.marque !== 'main' && proposer(e.phrase).length > 0)).length;
    console.log(`index du code : ${avec} étape${avec > 1 ? 's' : ''} avec des propositions, en commentaire, à vérifier`);
  } else if (ix.etat !== 'absent') console.log(`note : ${ix.raison} ; squelette sans propositions de l'index`);
  console.log(`${aCompleter} étape${aCompleter > 1 ? 's' : ''} à compléter, une par ligne d'étape du texte${entrees.length ? `, et ${entrees.length} entrée${entrees.length > 1 ? 's' : ''} de préparation ou de nettoyage` : ''} ; puis node scripts/verifier.mjs ${basename(cible)} --plan, et la ratification.`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main(process.argv.slice(2));
```
