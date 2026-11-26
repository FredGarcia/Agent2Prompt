---
name: execution
description: Exécution du skill (installation par npm ci, Node 22 ou plus récent, navigateur du poste et canal Chrome, Edge ou Chromium, dépendance d'exécution unique playwright-core 1.65.1 à version exacte, @playwright/test 1.65.1 en dépendance de développement pour la recette, emplacements des profils, des résultats et des tests exportés, .gitignore du skill, réglages par variables SCENARIO_PLAYWRIGHT_*, lignes de commande de jouer, pour un scénario ou une campagne, verifier, traduire, importer, indexer, exporter et resultats et leurs codes de sortie, pièges connus dont le proxy des API, la préparation refusée par l'API, la page de test non lue et la session d'une campagne, commande d'extraction des fichiers exécutables à empreintes, sources de package.json, package-lock.json, .gitignore, scripts/jouer.mjs, scripts/verifier.mjs et scripts/traduire.mjs). À lire en premier, pour installer le skill.
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
| `node <skill>/scripts/verifier.mjs <fichier>... [--plan] [--param nom=valeur]...` | vérification sans navigateur d'un texte, d'un scénario ou d'un test exporté | `texte`, `scenario`, `export` |
| `node <skill>/scripts/jouer.mjs <scénario.toml \| dossier>... [options]` | exécution dans le navigateur du poste, préparation et nettoyage des données compris, rapport et verdict ; plusieurs scénarios, ou un dossier, en campagne | `actions`, `donnees`, `conformite` |
| `node <skill>/scripts/designer.mjs <adresse> [--profil nom] [--max n]` | désignation de cibles à la souris | `designer` |
| `node <skill>/scripts/importer.mjs <page.mhtml \| adresse> --adresse <url> [options]` | un texte de départ par scénario Gherkin d'une demande Jira ; `--comparer` compare sans écrire | `jira` |
| `node <skill>/scripts/importer.mjs <fichier.feature \| export.zip \| xray:CLÉ,… \| xray-dc:CLÉ,… \| zephyr:CLÉ,… \| zephyr-dc:CLÉ,…> --adresse <url> [options]` | un texte de départ par test d'un fichier, d'une archive, de Xray ou de Zephyr Scale ; jeton par variable d'environnement | `cas-de-test` |
| `node <skill>/scripts/importer.mjs <page.html \| dossier de pages> --adresse <url> [options]`, ou `--diagnostic` | un texte de départ par page de test de Xray enregistrée en HTML complet, sans jeton ; `--diagnostic` décrit les pages sans aucune de leurs valeurs | `cas-de-test` |
| `node <skill>/scripts/exporter.mjs <scénario.toml>... --dossier <tests du projet> [--langage ts\|js] [--comparer \| --remplacer]` | un test `@playwright/test` par scénario ratifié, écrit sans IA dans le dossier de tests du projet, avec les aides communes et la souche de connexion | `export` |
| `node <skill>/scripts/resultats.mjs <dossier de résultats \| dossier de campagne>... --format xray\|xray-dc\|zephyr\|jira [--cle CLÉ] [--execution CLÉ] [--preuves] [--sortie dossier]` | les résultats d'une exécution ou d'une campagne au format d'import de Xray ou de Zephyr Scale, ou le rapport de conformité à coller dans Jira ; rien n'est envoyé | `export`, `conformite` |
| `npm test`, depuis le dossier du skill | recette | `recette` |

`package.json` donne aussi `npm run jouer -- <scénario.toml>`, `npm run verifier -- <fichier>`, `npm run traduire -- <texte.scenario>`, `npm run designer -- <adresse>`, `npm run importer -- <page.mhtml> --adresse <url>`, `npm run indexer -- <dossier du projet>`, `npm run exporter -- <scénario.toml> --dossier <tests du projet>` et `npm run resultats -- <dossier de résultats> --format xray`, depuis le dossier du skill.

## 2. Installation

1. Node 22 ou plus récent : `node --version`. `playwright-core` 1.65 n'est plus essayé sous Node 20 (D1.INV-1).
2. Depuis le dossier du skill, `npm ci` installe la dépendance d'exécution, `playwright-core`, et celle de la recette, `@playwright/test`, aux versions du verrou ; `npm ci --omit=dev` n'installe que la première, qui suffit à tout sauf à la recette. Derrière un proxy d'entreprise, npm lit `HTTPS_PROXY` ou sa propre configuration.
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
| `resultats/<horodatage>-campagne/`, à côté du premier scénario | `campagne.json`, `campagne.md`, et le dossier de résultats de chaque test de la campagne (module `conformite`) | comme `resultats/` |
| `node_modules/`, dans le dossier du skill | `playwright-core` | oui |
| textes importés et `jira/<CLÉ>-<horodatage>.mhtml`, dans le dossier de `--dossier` de `importer.mjs` | textes de départ ; pages Jira enregistrées par l'import par l'adresse (module `jira`) | non : `jira/` s'ajoute au `.gitignore` du projet, une page de Jira ne se versionne pas |
| `index/code.json` et `index/code.md`, dans le dossier de `--dossier` de `indexer.mjs` | index du code du projet (module `code`) : noms, textes, chemins et contraintes du code, sans aucune valeur de configuration | au choix du développeur : l'index se régénère à tout moment |
| `<scénario>.spec.ts`, `scenario-playwright.aides.ts` et `scenario-playwright.connexion.ts` (ou `.mjs`), dans le dossier de `--dossier` de `exporter.mjs` | tests exportés, aides communes, connexion de l'équipe (module `export`) : rien d'autre que ce que dit le scénario, aucun identifiant | non : ce sont des tests du projet, que l'équipe versionne ; leurs résultats de Playwright, eux, s'écartent comme ceux de ses autres tests |
| `xray-<scénario>.json`, `xray-campagne.json`, `zephyr-<scénario>.json` et `.zip`, `conformite-jira.txt`, `conformite.html` et `captures-jira/`, à côté du rapport, dans le dossier de la campagne ou dans le dossier de `--sortie` de `resultats.mjs` | résultats au format d'import de Xray ou de Zephyr Scale (module `export`), rapport de conformité et copies d'écran à coller et à joindre dans Jira (module `conformite`) | oui dans `resultats/` ; ailleurs, comme le dossier choisi |
| pages de tests de Xray enregistrées, dans le dossier que le développeur choisit | pages et dossiers de ressources que Chrome écrit, lus par `importer.mjs` (module `cas-de-test`, § 7) ; le skill n'y écrit rien | à placer hors de tout dépôt : une page de Xray ne se versionne pas |

Un dossier de résultats choisi par `--resultats` hors du skill n'est couvert par aucun `.gitignore` : il se choisit hors de tout dépôt, ou s'y ajoute à l'exclusion. Un profil contient des cookies de session : il ne se copie ni ne se partage.

## 4. Réglages (D1.INV-3)

| Variable | Défaut | Rôle |
|---|---|---|
| `SCENARIO_PLAYWRIGHT_CANAL` | `chrome` | navigateur : `chrome`, `msedge`, ou `chromium` pour celui de Playwright |
| `SCENARIO_PLAYWRIGHT_PROFILS` | `.profils` | dossier des profils, relatif au dossier du skill ou absolu |
| `SCENARIO_PLAYWRIGHT_DELAI` | aucun | délai d'une étape, en secondes, de 1 à 30, quand ni l'étape ni le scénario n'en donnent ; à défaut, 10 s |

Une variable vide vaut absente ; une valeur invalide est refusée, avec le code 2. Sous PowerShell : `$env:SCENARIO_PLAYWRIGHT_CANAL = "msedge"` ; sous bash : `export SCENARIO_PLAYWRIGHT_CANAL=msedge`.

## 5. Lignes de commande et codes de sortie (D1.INV-4)

`jouer.mjs <scénario.toml | dossier>...` : deux scénarios ou plus, ou un dossier, font une campagne (module `conformite`, § 2).

| Option | Effet |
|---|---|
| `--param nom=valeur` | valeur d'un paramètre ou d'une colonne des jeux, pour cette exécution (D3.INV-6) ; répétable |
| `--jeu n` | ne joue que le jeu `n`, à partir de 1 ; pour un seul scénario |
| `--resultats <dossier>` | dossier où créer le dossier de résultats, au lieu de `resultats/` à côté du scénario |
| `--sans-tete` | sans fenêtre ; refusé avec une étape à la main (D6.INV-3) |
| `--ralenti <ms>` | pause de 0 à 2 000 ms avant chaque geste de Playwright, pour suivre une démonstration |
| `--trace` | enregistre `trace.zip`, qui contient les cookies de la session (D7.INV-3) ; pour un seul scénario |
| `--autoriser-mutations` | autorise, pour cette exécution, les étapes de mutation hors du poste, et les appels et scénarios de préparation et de nettoyage qui modifient des données (D7.INV-2, D20.INV-3) |

Sortie : une ligne d'en-tête (titre, jeux, étapes, navigateur et version), `AVERTISSEMENT` de compatibilité s'il y a lieu (D6.INV-1), `Jeu n : …` pour chaque jeu quand il y en a plusieurs, `À VOUS : …` pour une étape à la main, une ligne par étape (`ok`, `KO` avec le message, `--` non jouée), une ligne par entrée de préparation, à sa place parmi les étapes (`p1.`), et de nettoyage, après elles (`n1.`), les étapes d'un scénario de préparation en retrait, `AVERTISSEMENT nettoyage …` pour un nettoyage en échec (module `donnees`, § 7), `origine bloquée : …` pour chaque origine interrompue, puis `Bilan : …`, qui compte les entrées de préparation et de nettoyage, `Verdict : …`, conforme, non conforme ou bloqué, avec sa cause (module `conformite`, § 4), et `Rapport : <chemin de rapport.md>`. Une campagne annonce chaque scénario, `[2/6] <titre> …`, puis rend le verdict de chaque test, le bilan des verdicts et `Rapport de campagne : <chemin de campagne.md>`.

| Code | `jouer.mjs` | `verifier.mjs`, `traduire.mjs`, `indexer.mjs`, `resultats.mjs` | `exporter.mjs` |
|---|---|---|---|
| 0 | toutes les étapes et toutes les préparations de tous les jeux, de chaque scénario d'une campagne, ont réussi ; un nettoyage en échec est signalé sans changer le code (D20.INV-4) | tout est conforme ; squelette écrit ; index écrit ; fichier de résultats écrit | chaque fichier est écrit ou à jour |
| 1 | au moins une étape ou une préparation a échoué ; le rapport est écrit, et dans une campagne celui de chaque test et de la campagne | | un fichier n'est pas écrit : conflit, test périmé ou retouché sans `--remplacer` ; avec `--comparer`, un changement |
| 2 | scénario, option, réglage ou navigateur refusé, avant toute action dans le navigateur, un seul scénario refusé refusant la campagne ; aucun rapport | un fichier refusé, un test exporté périmé ou retouché ; squelette non écrit ; option refusée ou projet introuvable, index non écrit ; option, rapport ou clé refusés, rien d'écrit | scénario, option ou dossier refusé, avant toute écriture |

Les options, la sortie et les codes de `importer.mjs` sont au module `jira`, § 7 (D16.INV-6) ; ses sources de cas de test et leurs jetons, au module `cas-de-test`, § 2 à § 4, et les pages de tests enregistrées, au § 7.

`verifier.mjs` écrit `ok` pour chaque fichier conforme, `ERREUR` pour chaque erreur, et `note` pour ce que le développeur doit savoir avant de jouer : ce qui modifie des données, étapes, appels et scénarios de préparation et de nettoyage, et les origines hors du poste, étapes à la main, nettoyage d'une donnée fixe (module `donnees`, § 7), cibles fragiles, et, avec un index du code dans le dossier du scénario, cibles et chemins absents de l'index, ou index périmé (module `code`, § 9) ; une note ne change pas le code de sortie. `--plan` ajoute le plan de la traduction (module `scenario`, § 4.4) ; `--param` y vérifie une valeur donnée en ligne de commande.

Les options, la sortie et les codes de `indexer.mjs` sont au module `code`, § 2 ; ceux de `exporter.mjs` et de `resultats.mjs`, au module `export`, § 2 et § 8, et le rapport de conformité, au module `conformite`, § 5.

## 6. Dépendance (D1.INV-1)

`playwright-core` 1.65.1, à version exacte dans `package.json` et dans le verrou : c'est la version de la recette. Elle n'a aucune dépendance, et pilote le navigateur du poste par le protocole Chrome DevTools. Elle porte le Chromium 159, qui suit le Chrome stable de sa publication et le suivant (module `session`, § 2). Une autre version se monte dans une nouvelle version du skill, recette rejouée.

`@playwright/test` 1.65.1, à la même version exacte, est une dépendance de développement : la recette y joue les tests exportés (module `recette`, R36 et R37). Aucun script du skill ne l'importe ; `scripts/aides-export.mjs` n'est qu'un gabarit, que `exporter.mjs` lit comme un texte et écrit dans le projet, où les aides importent le `@playwright/test` du projet.

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
- **Test exporté en échec à l'étape à la main** : la souche de connexion posée par `exporter.mjs` échoue tant que l'équipe n'y a pas écrit la connexion de son application (module `export`, § 6). Un test qui modifie des données est « sauté » hors du poste sans `SCENARIO_AUTORISER_MUTATIONS=1`, avec son motif.
- **Test exporté qui échoue où le skill réussit** : le test joue dans un contexte neuf, sans la session du profil du skill, et avec le `@playwright/test` du projet ; les aides sont essayées avec la version 1.65.1. Un écart se signale, avec le message du test et celui du rapport du skill.
- **Réponse interrompue** : une vérification `requete` ne lit pas la réponse d'une page qui change de document juste après (navigation complète) ; elle vérifie alors le statut, ou l'effet à l'écran (module `hors-ecran`, § 3).
- **Page de test de Xray non lue** : « aucun pas reconnu » dit une page dont les libellés ne sont pas ceux que le skill connaît, ou dont les pas sont dans un cadre que Chrome n'a pas enregistré dans le dossier de la page ; elle se réenregistre en « Page Web, complète », une fois les pas affichés. `importer.mjs <page> --diagnostic` décrit sa structure sans aucune de ses valeurs : c'est cette sortie qui se signale, jamais la page (module `cas-de-test`, § 7).
- **Session d'une campagne** : la campagne garde la session ouverte par l'étape à la main d'un scénario ; un scénario qui la suppose se place après lui, dans l'ordre des noms du dossier (`a-connexion.toml`, `b-…`). Une session expirée en cours de campagne fait échouer les scénarios suivants, bloqués : la campagne se rejoue à partir d'eux (module `conformite`, § 2).
- **Rapport collé dans Jira Cloud** : `conformite.html` se colle avec sa mise en forme ; une copie d'écran que l'éditeur de Jira ne reprend pas au collage se joint depuis `captures-jira/`, sous le nom que cite le rapport (module `conformite`, § 5).

## 8. Matérialiser les fichiers exécutables

| Fichier | Module, section | Empreinte sha256 |
|---|---|---|
| `package.json` | `execution`, § 10 | `b4dd4cb2bacbad92dd868954a43e7c9f2df81d22474eefaf829759853f3e8090` |
| `package-lock.json` | `execution`, § 10 | `6b4725e3e9e2c17617c91742424fce375afb1375c4ed4c0a324ff4d207d94b98` |
| `.gitignore` | `execution`, § 10 | `03bf7f97f17a0d1abb005b6480ec3b0f06a0b9c29c1d1f83131209b52b888a7e` |
| `scripts/jouer.mjs` | `execution`, § 11 | `4c842e3ca9a865a009f3d9f6b5b43c410bf0b3e70e2e2d9442149a794ed0e71c` |
| `scripts/verifier.mjs` | `execution`, § 12 | `af65b5cfd21e77e771305c87d04d66dc36fa4f686db2356c6d376f93007d94a1` |
| `scripts/traduire.mjs` | `execution`, § 13 | `6c3e14fe3fc29effb8c41e7f0de650cf57cda8b99ea8c84451abaede2066b978` |
| `scripts/texte.mjs` | `texte`, § 12 | `c94fd0057ab0d7281d8b8778eb5e213c095a447fb458c3e614cdb12e1c3fadc9` |
| `scripts/jira.mjs` | `jira`, § 9 | `132570e861de56192390385a3b1beeeb71b44cb955637ed9f4450a1a676f3c43` |
| `scripts/importer.mjs` | `jira`, § 10 | `ca47872f79bf887b995d70cd3ab11d1ab30c1eb2c60ea0bfada01c3fe9406802` |
| `scripts/cas.mjs` | `cas-de-test`, § 11 | `c1b7b1101f00edb8ebcac3b8a325bbc70c0af89beaee23565285f10f7523e391` |
| `scripts/pages.mjs` | `cas-de-test`, § 12 | `8b91be4f8b59526c1b0ed49035ed419b031eb5e2ede63c1846b92451a7dde8cb` |
| `scripts/lecteurs.mjs` | `code`, § 11 | `ac0ff252c60a888f27369706cffe05968e141f52bce35940440d12dcf5bb7070` |
| `scripts/code.mjs` | `code`, § 12 | `ae4e6016094837547282889d90be453447420ce23a3217d3aa2e46915c9919f2` |
| `scripts/indexer.mjs` | `code`, § 13 | `54114afe3092bb572e8f5d0ce1a520064bc3c39ee11af798544f0eb8b565130d` |
| `scripts/toml.mjs` | `scenario`, § 6 | `dab9fb6f3782d0a3a1c23f7474845566fb7156f12b43f914a020eae883726be3` |
| `scripts/scenario.mjs` | `scenario`, § 7 | `5d50626c7f92690d6ccb2325756976775b86373ac541d3d9c0c60b575b610cfb` |
| `scripts/cibles.mjs` | `cibles`, § 6 | `c943baa678876ef61e6da7b6f63523d1e89edaa7a5936458d2d96f4a8297bfe1` |
| `scripts/moteur.mjs` | `actions`, § 9 | `030b6fc63c41246ce5057755b78390a41a9a0373de94ec66d9621f9698e7067c` |
| `scripts/session.mjs` | `session`, § 7 | `9605bde6933704b56b7131eb47b1c3517aabb69c167f051f3fb1f25148cbd155` |
| `scripts/rapport.mjs` | `preuves`, § 7 | `fabb0fadadb41d2c0ec7f7c6a54ca47026040af3991a6daa578e8d93d08b77de` |
| `scripts/designer.mjs` | `designer`, § 5 | `a56b79de4edca7d310abc1afd2a5578b52c533a23e0660ea104e653f995c62ef` |
| `scripts/export.mjs` | `export`, § 10 | `14093844db7d073230b21c6075dce61854cae0d66435687868cb654c80ea988e` |
| `scripts/aides-export.mjs` | `export`, § 11 | `8d7a510767fb1cc519d8ebed1e31f35fd5ce58970978b41386b8924e2d8744fc` |
| `scripts/exporter.mjs` | `export`, § 12 | `d910edd447775f265c3f2c378794fc07605dc5086aac35576d0802034abeb732` |
| `scripts/resultats.mjs` | `export`, § 13 | `f6af9e4f6c23f009d80f1fb3737c4a2f31e9da52d8ad143ee7c03a93a00b3d34` |
| `scripts/conformite.mjs` | `conformite`, § 9 | `a5e71de0873932d3d6d0fbd8a32e58b79036322f8e2ed0c55f8d8798b73bc061` |
| `agent/pilote-scenario.md` | `agent`, § 6 | `5405930bca5a7f9066135bb27d97a94a83cae69ca5dad96c7e1b5bc333cc4ff6` |
| `commandes/scenario/importer.toml` | `agent`, § 7 | `acdfb77a1b9a97dfd055145fe6ceb3ab1bedf650d44e17b23420ff2123601c92` |
| `commandes/scenario/indexer.toml` | `agent`, § 7 | `116f47636a63c2f68a5ced2025f091820ff04f20683bc20a8fcf21dd14819af7` |
| `commandes/scenario/traduire.toml` | `agent`, § 7 | `0d4257efb26701d9dbf2b59b13209b9c8674e5ed2f446b5e43e135bbf26eef9a` |
| `commandes/scenario/jouer.toml` | `agent`, § 7 | `6b6ff87a327dd1778aafbf5decb404d8b66d9c7cdb92270382a55058aba8cffe` |
| `commandes/scenario/designer.toml` | `agent`, § 7 | `c8562c5ab4defa957d8800e50d3451a4598ef0ddab5e8ff52104b3ea1cf7237e` |
| `commandes/scenario/exporter.toml` | `agent`, § 7 | `d9d87c40fe20701a235e3b9f15e58e4d8bb9242ccaf2bd508f7e41857e38919c` |
| `commandes/scenario/resultats.toml` | `agent`, § 7 | `33896be979d6151b835c877a29b6bd7856124887be9254838733f9977fb0e295` |
| `tests/application-demo.mjs` | `recette`, § 6 | `454d35734060d58e806b14facf12c7ae617fd1867a73e0529b68e4b0a7940f63` |
| `tests/projet-demo.mjs` | `recette`, § 6 | `806a706825aca57ccabab46f02ecd438ae08a0308af26bbd1aab87347bf8e407` |
| `tests/run-tests.mjs` | `recette`, § 6 | `43b9bb5ae8e618793957956ae1b3974e92a6ef26e6f0d8ed732a4c7ce1d6c59e` |

Depuis le dossier du skill, cette commande d'une ligne écrit les trente-sept fichiers, compare leurs empreintes à celles du tableau et sort avec le code 1 au moindre écart. Elle ne contient ni `$`, ni accent grave, ni `!`, ni `%`, ni guillemet intérieur : elle se colle telle quelle dans bash, zsh, CMD ou PowerShell, et dans un fichier `.cmd`. Elle lit aussi des modules aux fins de ligne CRLF.

```text
node -e "const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'); const attendu = { 'package.json': 'b4dd4cb2bacbad92dd868954a43e7c9f2df81d22474eefaf829759853f3e8090', 'package-lock.json': '6b4725e3e9e2c17617c91742424fce375afb1375c4ed4c0a324ff4d207d94b98', '.gitignore': '03bf7f97f17a0d1abb005b6480ec3b0f06a0b9c29c1d1f83131209b52b888a7e', 'scripts/jouer.mjs': '4c842e3ca9a865a009f3d9f6b5b43c410bf0b3e70e2e2d9442149a794ed0e71c', 'scripts/verifier.mjs': 'af65b5cfd21e77e771305c87d04d66dc36fa4f686db2356c6d376f93007d94a1', 'scripts/traduire.mjs': '6c3e14fe3fc29effb8c41e7f0de650cf57cda8b99ea8c84451abaede2066b978', 'scripts/texte.mjs': 'c94fd0057ab0d7281d8b8778eb5e213c095a447fb458c3e614cdb12e1c3fadc9', 'scripts/jira.mjs': '132570e861de56192390385a3b1beeeb71b44cb955637ed9f4450a1a676f3c43', 'scripts/importer.mjs': 'ca47872f79bf887b995d70cd3ab11d1ab30c1eb2c60ea0bfada01c3fe9406802', 'scripts/cas.mjs': 'c1b7b1101f00edb8ebcac3b8a325bbc70c0af89beaee23565285f10f7523e391', 'scripts/pages.mjs': '8b91be4f8b59526c1b0ed49035ed419b031eb5e2ede63c1846b92451a7dde8cb', 'scripts/lecteurs.mjs': 'ac0ff252c60a888f27369706cffe05968e141f52bce35940440d12dcf5bb7070', 'scripts/code.mjs': 'ae4e6016094837547282889d90be453447420ce23a3217d3aa2e46915c9919f2', 'scripts/indexer.mjs': '54114afe3092bb572e8f5d0ce1a520064bc3c39ee11af798544f0eb8b565130d', 'scripts/toml.mjs': 'dab9fb6f3782d0a3a1c23f7474845566fb7156f12b43f914a020eae883726be3', 'scripts/scenario.mjs': '5d50626c7f92690d6ccb2325756976775b86373ac541d3d9c0c60b575b610cfb', 'scripts/cibles.mjs': 'c943baa678876ef61e6da7b6f63523d1e89edaa7a5936458d2d96f4a8297bfe1', 'scripts/moteur.mjs': '030b6fc63c41246ce5057755b78390a41a9a0373de94ec66d9621f9698e7067c', 'scripts/session.mjs': '9605bde6933704b56b7131eb47b1c3517aabb69c167f051f3fb1f25148cbd155', 'scripts/rapport.mjs': 'fabb0fadadb41d2c0ec7f7c6a54ca47026040af3991a6daa578e8d93d08b77de', 'scripts/designer.mjs': 'a56b79de4edca7d310abc1afd2a5578b52c533a23e0660ea104e653f995c62ef', 'scripts/export.mjs': '14093844db7d073230b21c6075dce61854cae0d66435687868cb654c80ea988e', 'scripts/aides-export.mjs': '8d7a510767fb1cc519d8ebed1e31f35fd5ce58970978b41386b8924e2d8744fc', 'scripts/exporter.mjs': 'd910edd447775f265c3f2c378794fc07605dc5086aac35576d0802034abeb732', 'scripts/resultats.mjs': 'f6af9e4f6c23f009d80f1fb3737c4a2f31e9da52d8ad143ee7c03a93a00b3d34', 'scripts/conformite.mjs': 'a5e71de0873932d3d6d0fbd8a32e58b79036322f8e2ed0c55f8d8798b73bc061', 'agent/pilote-scenario.md': '5405930bca5a7f9066135bb27d97a94a83cae69ca5dad96c7e1b5bc333cc4ff6', 'commandes/scenario/importer.toml': 'acdfb77a1b9a97dfd055145fe6ceb3ab1bedf650d44e17b23420ff2123601c92', 'commandes/scenario/indexer.toml': '116f47636a63c2f68a5ced2025f091820ff04f20683bc20a8fcf21dd14819af7', 'commandes/scenario/traduire.toml': '0d4257efb26701d9dbf2b59b13209b9c8674e5ed2f446b5e43e135bbf26eef9a', 'commandes/scenario/jouer.toml': '6b6ff87a327dd1778aafbf5decb404d8b66d9c7cdb92270382a55058aba8cffe', 'commandes/scenario/designer.toml': 'c8562c5ab4defa957d8800e50d3451a4598ef0ddab5e8ff52104b3ea1cf7237e', 'commandes/scenario/exporter.toml': 'd9d87c40fe20701a235e3b9f15e58e4d8bb9242ccaf2bd508f7e41857e38919c', 'commandes/scenario/resultats.toml': '33896be979d6151b835c877a29b6bd7856124887be9254838733f9977fb0e295', 'tests/application-demo.mjs': '454d35734060d58e806b14facf12c7ae617fd1867a73e0529b68e4b0a7940f63', 'tests/projet-demo.mjs': '806a706825aca57ccabab46f02ecd438ae08a0308af26bbd1aab87347bf8e407', 'tests/run-tests.mjs': '43b9bb5ae8e618793957956ae1b3974e92a6ef26e6f0d8ed732a4c7ce1d6c59e' }; const vus = new Set(); let ecarts = 0; for (const module of ['modules/execution/SKILL.md', 'modules/texte/SKILL.md', 'modules/jira/SKILL.md', 'modules/cas-de-test/SKILL.md', 'modules/code/SKILL.md', 'modules/scenario/SKILL.md', 'modules/cibles/SKILL.md', 'modules/actions/SKILL.md', 'modules/session/SKILL.md', 'modules/preuves/SKILL.md', 'modules/designer/SKILL.md', 'modules/export/SKILL.md', 'modules/conformite/SKILL.md', 'modules/agent/SKILL.md', 'modules/recette/SKILL.md']) { const texte = fs.readFileSync(module, 'utf8').replace(/\r\n/g, '\n'); for (const m of texte.matchAll(/^<\x21-- fichier : (\S+) -->\n\x60{3}[a-z]*\n([\s\S]*?)\n\x60{3}\n/gm)) { const contenu = m[2] + '\n'; fs.mkdirSync(path.dirname(m[1]), { recursive: true }); fs.writeFileSync(m[1], contenu); vus.add(m[1]); const conforme = crypto.createHash('sha256').update(contenu).digest('hex') === attendu[m[1]]; if (conforme === false) ecarts++; console.log((conforme ? 'conforme  ' : 'ECART     ') + m[1]); } } for (const f of Object.keys(attendu)) if (vus.has(f) === false) { ecarts++; console.log('ABSENT    ' + f); } if (ecarts > 0) process.exitCode = 1;"
```

Puis, depuis le même dossier : `npm ci`, et la recette, `npm test` (sous Linux sans écran, `xvfb-run -a npm test`).

## 9. Contrôle de sortie

- La commande du § 8 écrit `conforme` pour chacun des trente-sept fichiers.
- `npm ci` installe `playwright-core` 1.65.1 et `@playwright/test` 1.65.1.
- `npm test` rend son bilan sans échec (module `recette`).

## 10. Paquet et fichiers de travail

`package.json` déclare la dépendance d'exécution, celle de la recette, la version de Node et les commandes du § 1 ; `package-lock.json` fixe leurs versions ; `.gitignore` écarte les fichiers de travail (§ 3).

<!-- fichier : package.json -->
```json
{
  "name": "scenario-playwright",
  "version": "1.6.8",
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
    "exporter": "node scripts/exporter.mjs",
    "resultats": "node scripts/resultats.mjs",
    "test": "node tests/run-tests.mjs"
  },
  "dependencies": {
    "playwright-core": "1.65.1"
  },
  "devDependencies": {
    "@playwright/test": "1.65.1"
  }
}
```

<!-- fichier : package-lock.json -->
```json
{
  "name": "scenario-playwright",
  "version": "1.6.8",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "scenario-playwright",
      "version": "1.6.8",
      "dependencies": {
        "playwright-core": "1.65.1"
      },
      "devDependencies": {
        "@playwright/test": "1.65.1"
      },
      "engines": {
        "node": ">=22"
      }
    },
    "node_modules/@playwright/test": {
      "version": "1.65.1",
      "resolved": "https://registry.npmjs.org/@playwright/test/-/test-1.65.1.tgz",
      "integrity": "sha512-y+NCIRm2LvY4slUVWvGh1nujJ8RF/hEisIsq2mtUPgdQC4L701bq5hZGMhrpeXjACvwvO9tj5dJqhvM6TP9lbw==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "playwright": "1.65.1"
      },
      "bin": {
        "playwright": "cli.js"
      },
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/playwright": {
      "version": "1.65.1",
      "resolved": "https://registry.npmjs.org/playwright/-/playwright-1.65.1.tgz",
      "integrity": "sha512-vJ1FuoOrNwOKHUIVEvSt3jT1L+wjjDpwhwIstKtfvTh8XIG4FG4bIFuvNdMxi81LGfAhUgUZleVFaOLY4RIUUw==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "playwright-core": "1.65.1"
      },
      "bin": {
        "playwright": "cli.js"
      },
      "engines": {
        "node": ">=20"
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

L'exécution : lecture de la ligne de commande et des réglages, scénarios désignés, un fichier ou un dossier, lecture et contrôle de chaque scénario et de ses scénarios de préparation (modules `scenario` et `donnees`), préparation des jeux, refus avant le navigateur (D6.INV-3, D7.INV-2, D20.INV-3, D22.INV-1), ouverture du navigateur et garde des origines de chaque scénario (module `session`), moteur (modules `actions` et `donnees`), rapport et verdict (module `preuves`), campagne et son rapport (module `conformite`).

<!-- fichier : scripts/jouer.mjs -->
```javascript
#!/usr/bin/env node
// scenario-playwright 1.6.8 : joue un scénario TOML dans le navigateur du poste, comme un utilisateur, ou une
// campagne de plusieurs scénarios, l'un après l'autre, dans la même fenêtre.
//
// Usage, depuis n'importe quel dossier :
//   node <dossier du skill>/scripts/jouer.mjs <scénario.toml | dossier>... [--param nom=valeur]... [--jeu n]
//     [--resultats dossier] [--sans-tete] [--ralenti ms] [--trace] [--autoriser-mutations]
// Un dossier donne ses scénarios .toml, dans l'ordre de leur nom. Deux scénarios ou plus font une campagne
// (D22.INV-1) : tous sont lus et contrôlés avant la première action ; ils partagent leur profil ; ils se
// jouent dans un seul contexte du navigateur, une étape à la main n'y demandant la connexion qu'une fois ;
// la garde des origines suit les origines de chaque scénario ; un test en échec n'arrête pas les suivants.
// Chaque test a son dossier de résultats dans celui de la campagne, qui porte campagne.json et campagne.md.
// --jeu et --trace valent pour un seul scénario.
// Codes de sortie (D1.INV-4) : 0 tout a réussi, 1 une étape a échoué, 2 scénario, option ou environnement
// refusé avant toute action dans le navigateur.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { jouerScenario } from './moteur.mjs';
import { causeLisible, construireCampagne, construireRapport, dossierResultats, ecrireCampagne, ecrireRapport, LIBELLES_VERDICT } from './rapport.mjs';
import { DELAI_DEFAUT, lireScenario, mutationsDe, preparerJeux } from './scenario.mjs';
import { compatibilite, dossierProfil, estLocale, garderOrigines, lireReglages, ouvrirNavigateur, reference } from './session.mjs';

const USAGE = 'Usage : node scripts/jouer.mjs <scénario.toml | dossier>... [--param nom=valeur]... [--jeu n] [--resultats dossier] [--sans-tete] [--ralenti ms] [--trace] [--autoriser-mutations]';

/** Lit la ligne de commande ; rend { options } ou { erreur }. */
export function lireArguments(args) {
  const o = { fichiers: [], params: {}, jeu: null, resultats: null, sansTete: false, ralenti: 0, trace: false, autoriserMutations: false };
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
      else o.fichiers.push(a);
    } catch (e) {
      return { erreur: e.message };
    }
  }
  if (!o.fichiers.length) return { erreur: 'scénario manquant' };
  return { options: o };
}

const refus = (lignes) => {
  for (const l of [].concat(lignes)) console.error(`ERREUR ${l}`);
  return 2;
};

/** Scénarios désignés : un fichier, ou les .toml d'un dossier dans l'ordre de leur nom ; { fichiers } ou { erreur }. */
function scenariosDesignes(args) {
  const fichiers = [];
  for (const a of args) {
    const p = resolve(a);
    if (existsSync(p) && statSync(p).isDirectory()) {
      const toml = readdirSync(p, { withFileTypes: true }).filter((f) => f.isFile() && /\.toml$/i.test(f.name)).map((f) => f.name).sort();
      if (!toml.length) return { erreur: `${a} : aucun scénario .toml dans le dossier` };
      fichiers.push(...toml.map((n) => join(p, n)));
    } else fichiers.push(p);
  }
  const vus = new Set();
  for (const f of fichiers) {
    if (vus.has(f)) return { erreur: `${basename(f)} : scénario désigné deux fois` };
    vus.add(f);
  }
  return { fichiers };
}

/**
 * Lit et contrôle un scénario avant toute action (D1.INV-4) : lecture, jeux, étape à la main sans fenêtre,
 * garde des mutations hors du poste. Rend { scenario, jeux, dossier, fichier } ou { erreurs }.
 */
function preparer(fichier, o) {
  const nom = basename(fichier);
  const { scenario, erreurs, dossier } = lireScenario(fichier);
  if (!scenario) return { erreurs: erreurs.map((e) => `${nom} : ${e}`) };
  const { jeux, erreurs: erreursJeux } = preparerJeux(scenario, dossier, o.params, o.jeu);
  if (erreursJeux.length) return { erreurs: erreursJeux.map((e) => `${nom} : ${e}`) };
  const sous = [...scenario.preparation, ...scenario.nettoyage].filter((e) => e.charge).map((e) => e.charge.scenario);
  if (o.sansTete && [scenario, ...sous].some((s) => s.etapes.some((e) => e.action === 'main'))) return { erreurs: [`${nom} : le scénario, ou un scénario de préparation, a une étape à la main : il se joue dans une fenêtre visible, sans --sans-tete (D6.INV-3)`] };
  const distantes = scenario.origines.filter((x) => !estLocale(x));
  const mutantes = mutationsDe(scenario);
  if (mutantes.length && distantes.length && !o.autoriserMutations) {
    return { erreurs: [`${nom} : le scénario modifie des données (${mutantes.join(', ')}) et déclare des origines hors du poste (${distantes.join(', ')}) : --autoriser-mutations, avec l'accord du développeur pour cette exécution (D7.INV-2, D20.INV-3)`] };
  }
  return { scenario, jeux, dossier, fichier };
}

/** Affiche l'avancement d'une exécution, comme le développeur le suit dans la console. */
function afficher(ev) {
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
}

/** Ouvre le navigateur sur le profil ; { contexte } ou { code } si le lancement est refusé. */
async function ouvrir(reglages, profil, o) {
  try {
    return { contexte: await ouvrirNavigateur({ canal: reglages.canal, profil: dossierProfil(reglages, profil), sansTete: o.sansTete, ralenti: o.ralenti }) };
  } catch (e) {
    const texte = String(e.message);
    if (/ProcessSingleton|profile.*in use|SingletonLock/i.test(texte)) return { code: refus(`le profil ${profil ?? 'defaut'} est déjà ouvert dans une autre fenêtre : la fermer, puis relancer`) };
    return { code: refus(`navigateur ${reglages.canal} introuvable ou impossible à lancer : ${texte.split('\n')[0]} ; installer Chrome, ou choisir SCENARIO_PLAYWRIGHT_CANAL=msedge ou chromium (module execution)`) };
  }
}

/**
 * Joue un scénario préparé dans le contexte ouvert et écrit son rapport ; rend le rapport. La garde des
 * origines du contexte doit déjà suivre celles du scénario.
 */
async function jouerUn(contexte, p, { o, reglages, ref, version, journal, resultats }) {
  const { scenario, jeux, fichier } = p;
  const debut = new Date();
  const joues = await jouerScenario(contexte, {
    scenario, jeux, resultats, journal, delai: scenario.delai ?? reglages.delai ?? DELAI_DEFAUT, autoriserMutations: o.autoriserMutations, surEvenement: afficher,
  });
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
  // Un nettoyage en échec est dit, sans changer le code de sortie ni le verdict (D20.INV-4).
  for (const j of rapport.jeux) for (const e of j.nettoyage.filter((x) => x.statut === 'echec')) console.log(`AVERTISSEMENT nettoyage ${e.numero}${rapport.jeux.length > 1 ? ` du jeu ${j.numero}` : ''} en échec : ${e.message} ; des données de l'exécution peuvent rester (D20.INV-4)`);
  console.log(`Bilan : ${rapport.statut === 'reussi' ? 'réussi' : 'échec'}, ${b.etapes} étapes, ${b.reussies} réussies, ${b.echecs} en échec, ${b.non_jouees} non jouées${b.preparations || b.nettoyages ? ` ; préparation : ${b.preparations}, nettoyage : ${b.nettoyages}${b.nettoyages_en_echec ? `, dont ${b.nettoyages_en_echec} en échec` : ''}` : ''}`);
  const cause = premiereCause(rapport);
  console.log(`Verdict : ${LIBELLES_VERDICT[rapport.verdict]}${cause ? ` (${cause.jeu ? `jeu ${cause.jeu}, ` : ''}${causeLisible(cause.cause)})` : ''}`);
  return rapport;
}

/** Cause du verdict d'un rapport : celle du premier jeu de ce verdict ; { jeu, cause } ou null. */
function premiereCause(rapport) {
  const j = rapport.jeux.find((x) => x.verdict === rapport.verdict && x.cause);
  return j ? { jeu: rapport.jeux.length > 1 ? j.numero : null, cause: j.cause } : null;
}

export async function main(args, env = process.env) {
  const lu = lireArguments(args);
  if (lu.erreur) return refus([lu.erreur, USAGE]);
  const o = lu.options;
  const { reglages, erreurs: erreursReglages } = lireReglages(env);
  if (erreursReglages.length) return refus(erreursReglages);
  const designes = scenariosDesignes(o.fichiers);
  if (designes.erreur) return refus(designes.erreur);
  const { fichiers } = designes;
  const campagne = fichiers.length > 1;
  if (campagne && o.jeu !== null) return refus('--jeu vaut pour un seul scénario, pas pour une campagne');
  if (campagne && o.trace) return refus('--trace vaut pour un seul scénario, pas pour une campagne');
  const prepares = fichiers.map((f) => preparer(f, o));
  const erreurs = prepares.flatMap((p) => p.erreurs ?? []);
  if (erreurs.length) return refus(campagne ? [...erreurs, 'Campagne refusée : aucun scénario n\'est joué (D22.INV-1).'] : erreurs);
  const profils = [...new Set(prepares.map((p) => p.scenario.profil ?? 'defaut'))];
  if (profils.length > 1) return refus(`les scénarios d'une campagne partagent leur profil, où se fait la connexion : ${profils.join(', ')} ; les jouer en campagnes distinctes (D22.INV-1)`);

  const ref = reference();
  const ouvert = await ouvrir(reglages, prepares[0].scenario.profil, o);
  if (ouvert.code !== undefined) return ouvert.code;
  const { contexte } = ouvert;
  const debut = new Date();
  const base = o.resultats ? resolve(o.resultats) : join(prepares[0].dossier, 'resultats');
  const dossierCampagne = campagne ? dossierResultats(base, 'campagne', debut) : null;
  const tests = [];
  let version = 'inconnue';
  let rapportSeul = null;
  try {
    version = contexte.browser()?.version() ?? 'inconnue';
    const journal = await garderOrigines(contexte, prepares[0].scenario.origines);
    const compat = compatibilite(version, ref);
    if (campagne) console.log(`Campagne : ${fichiers.length} scénarios, profil ${profils[0]} ; ${reglages.canal} ${version}`);
    if (campagne && compat.avertissement) console.log(`AVERTISSEMENT ${compat.avertissement}`);
    for (const [k, p] of prepares.entries()) {
      const { scenario, jeux, fichier } = p;
      journal.permettre(scenario.origines);
      const titre = `${scenario.titre} : ${jeux.length} jeu${jeux.length > 1 ? 'x' : ''}, ${scenario.etapes.length} étapes`;
      console.log(campagne ? `[${k + 1}/${fichiers.length}] ${titre} (${basename(fichier)})` : `${titre} ; ${reglages.canal} ${version}`);
      if (!campagne && compat.avertissement) console.log(`AVERTISSEMENT ${compat.avertissement}`);
      const resultats = dossierResultats(campagne ? dossierCampagne : (o.resultats ? resolve(o.resultats) : join(p.dossier, 'resultats')), basename(fichier), new Date());
      if (o.trace) await contexte.tracing.start({ screenshots: true, snapshots: true });
      const rapport = await jouerUn(contexte, p, { o, reglages, ref, version, journal, resultats });
      if (o.trace) await contexte.tracing.stop({ path: join(resultats, 'trace.zip') });
      if (!campagne) {
        rapportSeul = { rapport, resultats };
        continue;
      }
      const cause = premiereCause(rapport);
      tests.push({
        scenario: relative(dossierCampagne, fichier).split('\\').join('/'), fichier: basename(fichier), titre: scenario.titre, etiquettes: scenario.etiquettes,
        dossier: basename(resultats), statut: rapport.statut, verdict: rapport.verdict, cause: cause?.cause ?? null, jeu: cause?.jeu ?? null, duree_ms: rapport.duree_ms, bilan: rapport.bilan,
      });
    }
  } finally {
    await contexte.close().catch(() => {});
  }
  if (!campagne) {
    console.log(`Rapport : ${join(rapportSeul.resultats, 'rapport.md')}`);
    return rapportSeul.rapport.statut === 'reussi' ? 0 : 1;
  }
  const c = construireCampagne({ debut, fin: new Date(), profil: profils[0], navigateur: { canal: reglages.canal, version }, tests });
  ecrireCampagne(dossierCampagne, c);
  for (const t of tests) console.log(`  ${{ conforme: 'conforme    ', non_conforme: 'NON CONFORME', bloque: 'BLOQUÉ      ' }[t.verdict]}  ${t.titre} (${t.fichier})${t.cause ? ` : ${t.jeu ? `jeu ${t.jeu}, ` : ''}${causeLisible(t.cause)}` : ''}`);
  console.log(`Campagne : ${c.bilan.tests} tests, ${c.bilan.conformes} conforme${c.bilan.conformes > 1 ? 's' : ''}, ${c.bilan.non_conformes} non conforme${c.bilan.non_conformes > 1 ? 's' : ''}, ${c.bilan.bloques} bloqué${c.bilan.bloques > 1 ? 's' : ''}`);
  console.log(`Rapport de campagne : ${join(dossierCampagne, 'campagne.md')}`);
  return c.tests.every((t) => t.statut === 'reussi') ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (e) => { console.error(`ERREUR interne : ${e.stack ?? e}`); process.exitCode = 2; });
}
```

## 12. `scripts/verifier.mjs`

<!-- fichier : scripts/verifier.mjs -->
```javascript
#!/usr/bin/env node
// scenario-playwright 1.6.8 : vérifie des textes de départ et des scénarios TOML, sans ouvrir de navigateur.
//
// Usage : node <dossier du skill>/scripts/verifier.mjs <fichier.scenario | fichier.toml | test.spec.ts>... [--plan] [--param nom=valeur]...
// Un texte : sa structure (D2). Un scénario : sa validité, le contrôle de sa traduction s'il cite un texte,
// ses variables et ses fichiers (D3) ; --plan montre la traduction ligne du texte par ligne du texte, pour
// la ratification. Avec un index du code à jour dans le dossier du scénario, une cible ou un chemin absent
// de l'index est noté, sans changer le code de sortie (D18.INV-4). La préparation et le nettoyage des
// données sont notés avec la garde qui s'y applique, et un nettoyage qui vise une donnée fixe, sans valeur
// gardée ni ${unique}, est signalé avant la ratification (D20). Un test exporté se compare à son scénario : périmé
// ou retouché à la main, il est refusé (D21.INV-1). Code 0 si tout est conforme, 2 sinon.
import { basename, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { decrireCible, estFragile } from './cibles.mjs';
import { cheminDansIndex, cibleDansIndex, lireIndex } from './code.mjs';
import { verifierExport } from './export.mjs';
import { cheminMasque, lireScenario, mutationsDe, planTraduction, preparerJeux, textesEntree, variablesDe } from './scenario.mjs';
import { estLocale } from './session.mjs';
import { analyserTexte, libelleMarque } from './texte.mjs';

const USAGE = 'Usage : node scripts/verifier.mjs <fichier.scenario | fichier.toml | test.spec.ts>... [--plan] [--param nom=valeur]...';

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
    if (/\.spec\.(ts|mjs)$/i.test(f)) {
      let v;
      try { v = verifierExport(resolve(f)); } catch (e) { v = { etat: 'source', message: e.code === 'ENOENT' ? 'fichier introuvable' : e.message }; }
      if (v.etat === 'a-jour') console.log(`ok  ${nom} : ${v.message}`);
      else { console.log(`ERREUR ${nom} : ${v.message}`); code = 2; }
      continue;
    }
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
// scenario-playwright 1.6.8 : squelette TOML de la traduction d'un texte de départ, produit sans IA.
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
