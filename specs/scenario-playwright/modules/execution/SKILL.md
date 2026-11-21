---
name: execution
description: Exécution du skill (installation par npm ci, Node 22 ou plus récent, navigateur du poste et canal Chrome, Edge ou Chromium, dépendance unique playwright-core 1.65.1 à version exacte, emplacements des profils et des résultats, .gitignore du skill, réglages par variables SCENARIO_PLAYWRIGHT_*, lignes de commande de jouer, verifier, traduire, importer et indexer et leurs codes de sortie, pièges connus dont le proxy des API, commande d'extraction des fichiers exécutables à empreintes, sources de package.json, package-lock.json, .gitignore, scripts/jouer.mjs, scripts/verifier.mjs et scripts/traduire.mjs). À lire en premier, pour installer le skill.
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
| `node <skill>/scripts/jouer.mjs <scénario.toml> [options]` | exécution dans le navigateur du poste, rapport | `actions` |
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
| `--autoriser-mutations` | autorise, pour cette exécution, les étapes de mutation hors du poste (D7.INV-2) |

Sortie : une ligne d'en-tête (titre, jeux, étapes, navigateur et version), `AVERTISSEMENT` de compatibilité s'il y a lieu (D6.INV-1), `Jeu n : …` pour chaque jeu quand il y en a plusieurs, `À VOUS : …` pour une étape à la main, une ligne par étape (`ok`, `KO` avec le message, `--` non jouée), `origine bloquée : …` pour chaque origine interrompue, puis `Bilan : …` et `Rapport : <chemin de rapport.md>`.

| Code | `jouer.mjs` | `verifier.mjs`, `traduire.mjs`, `indexer.mjs` |
|---|---|---|
| 0 | toutes les étapes de tous les jeux ont réussi | tout est conforme ; squelette écrit ; index écrit |
| 1 | au moins une étape a échoué ; le rapport est écrit | |
| 2 | scénario, option, réglage ou navigateur refusé, avant toute action dans le navigateur ; aucun rapport | un fichier refusé ; squelette non écrit ; option refusée ou projet introuvable, index non écrit |

Les options, la sortie et les codes de `importer.mjs` sont au module `jira`, § 7 (D16.INV-6) ; ses sources de cas de test et leurs jetons, au module `cas-de-test`, § 2 à § 4.

`verifier.mjs` écrit `ok` pour chaque fichier conforme, `ERREUR` pour chaque erreur, et `note` pour ce que le développeur doit savoir avant de jouer : étapes de mutation et origines hors du poste, étapes à la main, cibles fragiles, et, avec un index du code dans le dossier du scénario, cibles et chemins absents de l'index, ou index périmé (module `code`, § 9) ; une note ne change pas le code de sortie. `--plan` ajoute le plan de la traduction (module `scenario`, § 4.4) ; `--param` y vérifie une valeur donnée en ligne de commande.

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
- **Réponse interrompue** : une vérification `requete` ne lit pas la réponse d'une page qui change de document juste après (navigation complète) ; elle vérifie alors le statut, ou l'effet à l'écran (module `hors-ecran`, § 3).

## 8. Matérialiser les fichiers exécutables

| Fichier | Module, section | Empreinte sha256 |
|---|---|---|
| `package.json` | `execution`, § 10 | `c8e7829e37f09c5087de2558dcbbc64ca52df846eca5f9ee54b4659c4d097f4b` |
| `package-lock.json` | `execution`, § 10 | `759d1400c4441b80bdd4344ee8451d074a368797acc4459886a3c819e969e83c` |
| `.gitignore` | `execution`, § 10 | `03bf7f97f17a0d1abb005b6480ec3b0f06a0b9c29c1d1f83131209b52b888a7e` |
| `scripts/jouer.mjs` | `execution`, § 11 | `73c6f0fa0e81e2639691b5a18da077ed27106f0b4a7552aa9f683aab8db7a62a` |
| `scripts/verifier.mjs` | `execution`, § 12 | `366393bebaddda71c8439a9f2135ddc8a75bf3ef557e66a8de89ad999eb9c821` |
| `scripts/traduire.mjs` | `execution`, § 13 | `b925d5fd70eff587ab76adf2e73e9c550063a5b952c7ee5591060e9711f0687a` |
| `scripts/texte.mjs` | `texte`, § 12 | `cb9b43e8ae4fd4d7fc3d1b00179fbfba76d1d4822b2e4ce0a10e3db379068f00` |
| `scripts/jira.mjs` | `jira`, § 9 | `d2e7b1187543ff59bc028ff7bf9ac7d211c6c457fea73728b5ca26e390d7ec0f` |
| `scripts/importer.mjs` | `jira`, § 10 | `4509057c5a3880d3a8da2e6a3a14ac1766783ecfce221a7cd43813301f0075ef` |
| `scripts/cas.mjs` | `cas-de-test`, § 10 | `bbe16a4bc07890c7a18a31120db98242e8c33629a7282c9811ec4f9d6a112c07` |
| `scripts/lecteurs.mjs` | `code`, § 11 | `7fdf23bdf24adcc9095a91e5c003154d945741ab89e46086c6eb08ee8179b726` |
| `scripts/code.mjs` | `code`, § 12 | `cadfff08e78346b1b25ba1454f98de358863e0911e2717bb0e623fcb5be7cbe7` |
| `scripts/indexer.mjs` | `code`, § 13 | `7e22c1efec5caa6a4076fea8bf3a685d23d50820efcc6f38eb64fcc01fc96a98` |
| `scripts/toml.mjs` | `scenario`, § 6 | `3f3d485ca220be4ad2911e72cfd6857ac30518cf4c9d8df2a4850c99a9e5a552` |
| `scripts/scenario.mjs` | `scenario`, § 7 | `4ce2736900fa18c0e023da664cf457c17bac755f9be9613e44f6f71aab11a70d` |
| `scripts/cibles.mjs` | `cibles`, § 6 | `88164e96e034f375dc98679111bac1d3e4c9dbb3a4f00c97c09c05b148bd2801` |
| `scripts/moteur.mjs` | `actions`, § 9 | `92378640332838861d958475d637e4a16ad2dfd1091a33988389b491b3fcfcbf` |
| `scripts/session.mjs` | `session`, § 7 | `9947efbe1bdb09564104496f6c47c8eeb732a47f4ac4adf0d392b8e4298e4017` |
| `scripts/rapport.mjs` | `preuves`, § 7 | `3f7884f20c488f38c11cf076b9cd023c0816bbe6ca19b01e32cda9196ea6175a` |
| `scripts/designer.mjs` | `designer`, § 5 | `9dd8af109c930ff6eac54b904bfd34f17ff595c62c6a687f271431005a72869a` |
| `agent/pilote-scenario.md` | `agent`, § 6 | `38d737cb0a864c93f3e143aac6b6f801e19aed6410b3e1983dc277703d5cbc4a` |
| `commandes/scenario/importer.toml` | `agent`, § 7 | `9f98971165d1ac1c27dfd07736ef861071fb3a07d31d784e62eb09cbbac85cbb` |
| `commandes/scenario/indexer.toml` | `agent`, § 7 | `cf8aec4bcb12f183132923a4b264f24983e6070e5dc40178e724ad5d5570ff6f` |
| `commandes/scenario/traduire.toml` | `agent`, § 7 | `5d3ad75a85e9b779c1f208ab1614c1fda554c8aeb9006a39071a6038309c4df5` |
| `commandes/scenario/jouer.toml` | `agent`, § 7 | `f7e0d54a37343e67925bd7e2b81c9533f40b8dddb1809206e66efe29f11be134` |
| `commandes/scenario/designer.toml` | `agent`, § 7 | `24937398ace037f59135e78997e362ae99e980341a08d19494ec593421c39631` |
| `tests/application-demo.mjs` | `recette`, § 6 | `0d9fce4cd94e9852360c9d97999edd507bae7fd25a6caf0ab73a501ea0472135` |
| `tests/projet-demo.mjs` | `recette`, § 6 | `581276f66f2138898758318e86534d4d2f82f722bf472f49a24da5e02e303ce3` |
| `tests/run-tests.mjs` | `recette`, § 6 | `5772adfca1f7b36d77a0ed3343f65c6be4e2bd1d0138a9a5b434cac6accb61c8` |

Depuis le dossier du skill, cette commande d'une ligne écrit les vingt-neuf fichiers, compare leurs empreintes à celles du tableau et sort avec le code 1 au moindre écart. Elle ne contient ni `$`, ni accent grave, ni `!`, ni `%`, ni guillemet intérieur : elle se colle telle quelle dans bash, zsh, CMD ou PowerShell, et dans un fichier `.cmd`. Elle lit aussi des modules aux fins de ligne CRLF.

```text
node -e "const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'); const attendu = { 'package.json': 'c8e7829e37f09c5087de2558dcbbc64ca52df846eca5f9ee54b4659c4d097f4b', 'package-lock.json': '759d1400c4441b80bdd4344ee8451d074a368797acc4459886a3c819e969e83c', '.gitignore': '03bf7f97f17a0d1abb005b6480ec3b0f06a0b9c29c1d1f83131209b52b888a7e', 'scripts/jouer.mjs': '73c6f0fa0e81e2639691b5a18da077ed27106f0b4a7552aa9f683aab8db7a62a', 'scripts/verifier.mjs': '366393bebaddda71c8439a9f2135ddc8a75bf3ef557e66a8de89ad999eb9c821', 'scripts/traduire.mjs': 'b925d5fd70eff587ab76adf2e73e9c550063a5b952c7ee5591060e9711f0687a', 'scripts/texte.mjs': 'cb9b43e8ae4fd4d7fc3d1b00179fbfba76d1d4822b2e4ce0a10e3db379068f00', 'scripts/jira.mjs': 'd2e7b1187543ff59bc028ff7bf9ac7d211c6c457fea73728b5ca26e390d7ec0f', 'scripts/importer.mjs': '4509057c5a3880d3a8da2e6a3a14ac1766783ecfce221a7cd43813301f0075ef', 'scripts/cas.mjs': 'bbe16a4bc07890c7a18a31120db98242e8c33629a7282c9811ec4f9d6a112c07', 'scripts/lecteurs.mjs': '7fdf23bdf24adcc9095a91e5c003154d945741ab89e46086c6eb08ee8179b726', 'scripts/code.mjs': 'cadfff08e78346b1b25ba1454f98de358863e0911e2717bb0e623fcb5be7cbe7', 'scripts/indexer.mjs': '7e22c1efec5caa6a4076fea8bf3a685d23d50820efcc6f38eb64fcc01fc96a98', 'scripts/toml.mjs': '3f3d485ca220be4ad2911e72cfd6857ac30518cf4c9d8df2a4850c99a9e5a552', 'scripts/scenario.mjs': '4ce2736900fa18c0e023da664cf457c17bac755f9be9613e44f6f71aab11a70d', 'scripts/cibles.mjs': '88164e96e034f375dc98679111bac1d3e4c9dbb3a4f00c97c09c05b148bd2801', 'scripts/moteur.mjs': '92378640332838861d958475d637e4a16ad2dfd1091a33988389b491b3fcfcbf', 'scripts/session.mjs': '9947efbe1bdb09564104496f6c47c8eeb732a47f4ac4adf0d392b8e4298e4017', 'scripts/rapport.mjs': '3f7884f20c488f38c11cf076b9cd023c0816bbe6ca19b01e32cda9196ea6175a', 'scripts/designer.mjs': '9dd8af109c930ff6eac54b904bfd34f17ff595c62c6a687f271431005a72869a', 'agent/pilote-scenario.md': '38d737cb0a864c93f3e143aac6b6f801e19aed6410b3e1983dc277703d5cbc4a', 'commandes/scenario/importer.toml': '9f98971165d1ac1c27dfd07736ef861071fb3a07d31d784e62eb09cbbac85cbb', 'commandes/scenario/indexer.toml': 'cf8aec4bcb12f183132923a4b264f24983e6070e5dc40178e724ad5d5570ff6f', 'commandes/scenario/traduire.toml': '5d3ad75a85e9b779c1f208ab1614c1fda554c8aeb9006a39071a6038309c4df5', 'commandes/scenario/jouer.toml': 'f7e0d54a37343e67925bd7e2b81c9533f40b8dddb1809206e66efe29f11be134', 'commandes/scenario/designer.toml': '24937398ace037f59135e78997e362ae99e980341a08d19494ec593421c39631', 'tests/application-demo.mjs': '0d9fce4cd94e9852360c9d97999edd507bae7fd25a6caf0ab73a501ea0472135', 'tests/projet-demo.mjs': '581276f66f2138898758318e86534d4d2f82f722bf472f49a24da5e02e303ce3', 'tests/run-tests.mjs': '5772adfca1f7b36d77a0ed3343f65c6be4e2bd1d0138a9a5b434cac6accb61c8' }; const vus = new Set(); let ecarts = 0; for (const module of ['modules/execution/SKILL.md', 'modules/texte/SKILL.md', 'modules/jira/SKILL.md', 'modules/cas-de-test/SKILL.md', 'modules/code/SKILL.md', 'modules/scenario/SKILL.md', 'modules/cibles/SKILL.md', 'modules/actions/SKILL.md', 'modules/session/SKILL.md', 'modules/preuves/SKILL.md', 'modules/designer/SKILL.md', 'modules/agent/SKILL.md', 'modules/recette/SKILL.md']) { const texte = fs.readFileSync(module, 'utf8').replace(/\r\n/g, '\n'); for (const m of texte.matchAll(/^<\x21-- fichier : (\S+) -->\n\x60{3}[a-z]*\n([\s\S]*?)\n\x60{3}\n/gm)) { const contenu = m[2] + '\n'; fs.mkdirSync(path.dirname(m[1]), { recursive: true }); fs.writeFileSync(m[1], contenu); vus.add(m[1]); const conforme = crypto.createHash('sha256').update(contenu).digest('hex') === attendu[m[1]]; if (conforme === false) ecarts++; console.log((conforme ? 'conforme  ' : 'ECART     ') + m[1]); } } for (const f of Object.keys(attendu)) if (vus.has(f) === false) { ecarts++; console.log('ABSENT    ' + f); } if (ecarts > 0) process.exitCode = 1;"
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
  "version": "1.3.0",
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
  "version": "1.3.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "scenario-playwright",
      "version": "1.3.0",
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
// scenario-playwright 1.3.0 : joue un scénario TOML dans le navigateur du poste, comme un utilisateur.
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
// scenario-playwright 1.3.0 : vérifie des textes de départ et des scénarios TOML, sans ouvrir de navigateur.
//
// Usage : node <dossier du skill>/scripts/verifier.mjs <fichier.scenario | fichier.toml>... [--plan] [--param nom=valeur]...
// Un texte : sa structure (D2). Un scénario : sa validité, le contrôle de sa traduction s'il cite un texte,
// ses variables et ses fichiers (D3) ; --plan montre la traduction ligne du texte par ligne du texte, pour
// la ratification. Avec un index du code à jour dans le dossier du scénario, une cible ou un chemin absent
// de l'index est noté, sans changer le code de sortie (D18.INV-4). Code 0 si tout est conforme, 2 sinon.
import { basename, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { decrireCible, estFragile } from './cibles.mjs';
import { cheminDansIndex, cibleDansIndex, lireIndex } from './code.mjs';
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
  const index = new Map();
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
// scenario-playwright 1.3.0 : squelette TOML de la traduction d'un texte de départ, produit sans IA.
//
// Usage : node <dossier du skill>/scripts/traduire.mjs <fichier.scenario> [--remplacer]
// Écrit <fichier>.toml à côté du texte : structure recopiée du texte, empreinte du texte, et un bloc
// [[etapes]] par étape du texte, à compléter (D3.INV-5). Si le dossier du texte a un index du code à
// jour (indexer.mjs), chaque étape reçoit en commentaire les cibles de l'index dont le nom correspond aux
// libellés entre guillemets de sa phrase (D18.INV-4) ; un index périmé n'est pas employé (D18.INV-2).
// Refuse d'écraser un scénario existant sans --remplacer. Code 0 si le squelette est écrit, 2 sinon.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { candidats, lireIndex } from './code.mjs';
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
  const ix = lireIndex(dirname(resolve(fichier)));
  const proposer = ix.etat === 'frais' ? (phrase) => candidats(ix.index, phrase) : null;
  const squelette = squeletteToml(texte, basename(fichier), { proposer, empreinteIndex: ix.index?.empreinte });
  writeFileSync(cible, squelette);
  const aCompleter = texte.etapes.length;
  console.log(`écrit : ${cible}`);
  if (proposer) {
    const avec = texte.etapes.filter((e) => e.marque !== 'main' && proposer(e.phrase).length > 0).length;
    console.log(`index du code : ${avec} étape${avec > 1 ? 's' : ''} avec des propositions, en commentaire, à vérifier`);
  } else if (ix.etat !== 'absent') console.log(`note : ${ix.raison} ; squelette sans propositions de l'index`);
  console.log(`${aCompleter} étape${aCompleter > 1 ? 's' : ''} à compléter, une par ligne d'étape du texte ; puis node scripts/verifier.mjs ${basename(cible)} --plan, et la ratification.`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main(process.argv.slice(2));
```
