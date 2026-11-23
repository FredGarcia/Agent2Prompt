---
name: recette
description: Recette du skill (npm test, scénarios R1 à R43 contre une application de démonstration servie sur 127.0.0.1 sans réseau ni compte, deux origines, WebSocket d'écho, connexion simulée, export CSV, API de lecture, API d'écriture à session et jeton anti-CSRF, réponse lente et réponse volumineuse, secrets qu'aucun rapport ne doit contenir, projet de démonstration front et back pour l'index du code, Jira factice à connexion simulée avec des demandes de Jira Cloud et de Jira Data Center et leurs pages MHTML, Xray et Zephyr Scale factices, Cloud et Data Center, qui notent chaque requête, archives d'export, pages de tests de Xray enregistrées comme le fait Chrome ; projets de tests temporaires où @playwright/test 1.65.1 joue les tests exportés, comparés au skill étape par étape ; campagnes, verdicts, copies d'écran, rapports de conformité et résultats de campagne pour Xray ; profils et résultats temporaires ; navigateur de SCENARIO_PLAYWRIGHT_CANAL ; écran virtuel sous Linux ; bilan attendu ; défauts réintroduits qui font chacun échouer la recette ; recette en intégration continue sous Linux et Windows), sources de tests/application-demo.mjs, tests/projet-demo.mjs et tests/run-tests.mjs.
dimensions: [D1, D2, D3, D4, D5, D6, D7, D8, D9, D16, D17, D18, D19, D20, D21, D22]
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
- Durée : environ cinq minutes. Garde-fou : une recette bloquée s'arrête d'elle-même au bout de quinze minutes, en disant dans quel scénario, son dossier temporaire gardé ; ce dossier est dit dès la première ligne.
- Bilan attendu : `Bilan : 43 scénarios, 605 contrôles, 605 réussis, 0 en échec, 0 sautés`. Là où un serveur ne peut écouter sur 127.0.0.2, deux contrôles de R8, deux de R34 et deux de R37 sont sautés ; là où un lien symbolique, ou une jonction sous Windows, ne peut se créer, le contrôle de R26 qui le suit est sauté.

## 2. L'application de démonstration

`tests/application-demo.mjs` sert, sur `127.0.0.1` et un port libre, sans réseau ni compte, une application et une seconde origine, que les scénarios ne déclarent pas ; la même application est servie sur `127.0.0.2`, origine hors du poste au sens du skill, quand le système le permet. L'application a son propre JavaScript ; le skill n'en exécute aucun.

| Page | Contenu | Sert à |
|---|---|---|
| `/` | titre, liens vers les clients, l'export et la seconde origine | navigation bloquée, origine déclarée |
| `/clients` | tableau des clients avec un bouton « Supprimer » par ligne, menu au survol, liens « Nouveau client » et « Nouveau fournisseur », alerte « Client … créé » | cible ambiguë, `dans`, `survoler`, `nombre`, `contient` |
| `/clients/nouveau` | champs « Nom » (avec placeholder), « Ville » (liste), case « Client actif », pièce jointe, boutons « Enregistrer » et « Archiver » (inactif) ; l'envoi passe par l'API de l'application, `POST /api/clients?source=formulaire&jeton=…`, avec un en-tête `Authorization`, et lit sa réponse avant de changer de page | `saisir`, `choisir`, `cocher`, `televerser`, `touche`, `actif`, `valeur`, `requete` |
| `/differe` | texte « Chargement… » puis « Chargé », bouton activé et contenu affiché après 1,2 s | `attendre`, délais |
| `/connexion?auto=<ms>` | pose un cookie de session et passe à `/accueil-connecte` après le délai, comme un développeur qui se connecte ; avec `&ephemere=1`, un cookie de session sans durée, que seule la fenêtre ouverte garde ; avec `&poster=1`, envoie d'abord un identifiant et un mot de passe à `/api/connexion` | étape à la main, profil, connexion unique d'une campagne, corps jamais relevé à la main |
| `/session` | dit si le cookie de session est présent | profil retrouvé |
| `/export`, `/export.csv` | lien vers un CSV en pièce jointe | `telecharger` |
| `/erreurs` | erreur de console, requête en erreur 500, exception | erreurs relevées |
| `/externe` | image de la seconde origine | requête bloquée |
| `/ws` | WebSocket d'écho vers l'application et vers la seconde origine | WebSocket gardés |
| `/compteur` | bouton « Ajouter » qui incrémente un compteur par l'API, sans changer de page | mutation hors du poste, réponse JSON d'une requête |
| `/api/clients`, `/api/clients/<nom>` | la liste des clients, un client ou un 404, en JSON | `api` : champs, tableau, statut |
| `/api/session` | `{ ouverte }`, selon le cookie de session | `api` avec la session du profil |
| `/api/redirection` | renvoie (302) vers la seconde origine, un jeton dans l'adresse | redirection non suivie, adresse masquée |
| `/api/gros` | un tableau JSON de plus de 1 Mio | borne de taille de `api` |
| `/interrompue`, `/api/lent` | une page qui change de document pendant que `/api/lent` répond lentement | statut gardé, réponse interrompue |
| `/accueil-connecte` | après la connexion, pose le jeton anti-CSRF dans un cookie lisible, `XSRF-TOKEN` comme Spring, `csrftoken` comme Django avec `?csrf=django`, aucun avec `?csrf=aucun` | préparation par l'API, jeton recopié |
| `/api/donnees/clients`, `/api/donnees/clients/<id>` | API d'écriture : session exigée (401), jeton anti-CSRF du cookie exigé en en-tête pour une écriture (403), corps JSON annoncé par `Content-Type` (415) ; `POST` crée (201, `Location`, 400 sans nom, 409 si le nom existe), `GET`, `PUT` et `PATCH` (200), `DELETE` (204) ; chaque requête notée, avec la session, l'en-tête anti-CSRF reçu, un éventuel `Authorization`, le `Content-Type` et le corps | préparation et nettoyage par l'API |
| `/api/donnees/redirection`, `/api/donnees/jetons`, `/api/donnees/reponse` | une écriture qui renvoie (302) vers la seconde origine ; une réponse qui porte une valeur secrète ; une réponse de plus de 1 Mio, non JSON, sans la valeur attendue, ou dont la valeur n'est pas simple, selon `?forme=` | redirection non suivie, valeur gardée masquée, valeur à garder refusée |
| `/clients/<id>` | la fiche d'un client créé par l'API | étapes qui emploient une valeur gardée |
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

R39 écrit des pages de tests de Xray comme Chrome les enregistre en « Page Web, complète », chacune avec un script leurre, des menus de choix, des boutons et un pas masqué : une page de Xray Cloud dont les pas, en mode formulaire, sont dans un cadre de son dossier de ressources, avec un cadre distant et un cadre hors du dossier ; une page de Data Center aux pas en tableau, en anglais ; une grille de div aux rôles ARIA ; un test Cucumber ; une page sans pas ; des pas affichés deux fois ; une page dont le titre n'a pas de clé, notée dans l'adresse d'enregistrement ; une seconde page du même test.

Les tests exportés (R35 à R38) jouent dans des projets temporaires, comme ceux d'une équipe : `package.json`, `playwright.config.mjs` (rapport JSON, navigateur de `SCENARIO_PLAYWRIGHT_CANAL`, fenêtre visible, un seul worker), dossiers `scenarios/` et `e2e/`, et `node_modules` lié à celui du skill par une jonction ; R37 y ajoute un `tsconfig.json`. La connexion de l'équipe y est une fonction qui note son appel : la page `/connexion?auto=…` se connecte d'elle-même. `@playwright/test` y est lancé par la recette, avec les seules variables `SCENARIO_ORIGINES` et `SCENARIO_AUTORISER_MUTATIONS` que chaque contrôle donne, et son rapport JSON se lit test par test, étape par étape.

Le projet de démonstration, `tests/projet-demo.mjs`, s'écrit dans un dossier temporaire ; aucun de ses fichiers n'est exécuté, l'index les lit seulement :

| Partie | Contenu | Sert à |
|---|---|---|
| Angular | routes avec redirection, titre, garde, composant et module chargés à la demande, joker ; gabarit avec clés ngx-translate, lien, boutons avec icônes, colonnes, blocs `@if` et `@for`, identifiant de test calculé, clé absente, message de statut à paramètre ; composant à gabarit en ligne avec `mat-form-field`, `label for`, `label` englobant, `aria-label`, placeholder, et appels `HttpClient` ; traductions `fr.json` et `en.json` | routes, éléments, noms accessibles, traductions, appels |
| Vue | vue-router avec enfants ; composant avec `$t`, `v-t`, `router-link` et `data-cy`, icône de police, appel axios | routes, traductions, attribut de test |
| React | `<Route>` imbriqués, `t()`, `htmlFor`, composant `Button`, `fetch` dans un attribut, texte avec apostrophe, texte avec expression ; TSX avec fonction générique `<T,>` ; traduction i18next par espace de noms | JSX, routes, appels |
| Spring | contrôleur Java (constante, `@RequestParam`, `@RequestBody`, `@ResponseStatus`, commentaire trompeur), DTO avec contraintes et messages `{clé}`, client Feign à écarter, contrôleur et `data class` Kotlin reçue en corps, `ValidationMessages_fr.properties`, `application.properties` avec un mot de passe | endpoints, classes de corps, validations, configuration jamais recopiée |
| OpenAPI | contrat YAML, serveur, résumé sur plusieurs lignes, statuts, une opération à `requestBody` et son schéma, une propriété requise | endpoints du contrat, classes de corps |
| à écarter | `node_modules/`, `dist/`, `.angular/`, fichier `.spec.ts`, `src/test/`, `.env` | exclusions |

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
| R12 | Lignes de commande : dix appels refusés avec le code 2, dont un même scénario désigné deux fois, `verifier.mjs` sur un texte et un scénario, un fichier refusé suffit, note des mutations hors du poste | D1.INV-4 |
| R13 | Désignation : deux clics simulés, deux cibles, un lien et un bouton d'une ligne avec `dans`, page non actionnée, cible au format du scénario | D9.INV-1 |
| R14 | Compatibilité : `playwright-core` 1.65.1 et Chromium 159 lus dans le paquet ; écarts sans avertissement, ancien, plus récent, illisible ; avertissement du rapport | D6.INV-1 |
| R15 | Dépendance d'exécution unique à version exacte, `@playwright/test` à la même version en dépendance de développement, qu'aucun script du skill n'importe, Node 22, `.gitignore`, aucune exécution de code dans la page dans les sources | D1.INV-1, D1.INV-2, D5.INV-1 |
| R16 | Points d'extension : champs du rapport, `verdict` compris, de chaque jeu, `capture_fin`, `verdict` et `cause` compris, de ses étapes, `hors_ecran` compris, du navigateur, du scénario et des options (E1) ; format et vocabulaire communs avec Agent2Test, critères hors de l'écran compris (E2) ; fonctions exportées du moteur, de la session et du scénario (E3) | |
| R17 | Preuves : erreur de console, exception de la page et réponse 500 relevées, sans échec de l'étape ; trace avec `--trace` et son avertissement ; aucune trace sans l'option | D8.INV-2, D7.INV-3 |
| R18 | Page Jira enregistrée : MHTML en quoted-printable et UTF-8, en base64 et ISO-8859-1 ; fichier qui n'est pas un MHTML refusé ; Jira Cloud et Data Center : variante, clé, résumé, description et champs de texte, commentaires seulement sur demande, avec auteur et date ; lignes du HTML ; page qui n'est pas une demande refusée ; commentaires repliés signalés ; clé lue dans l'adresse | D16.INV-1, D16.INV-2 |
| R19 | Scénarios de la demande : ordre de la page et zones ; contexte reporté, ligne de description ignorée ; mots-clés recopiés en français et en anglais ; étiquettes de la fonctionnalité et de la règle ; étiquettes gardées ou attribuées ; ligne d'étape hors d'un scénario ; cinq refus motivés ; doublon ; texte importé valide, colonnes adaptées, provenance, relue, retouche détectée ; empreinte Jira stable ; texte invalide non écrit ; réglages contrôlés | D16.INV-2, D16.INV-3, D16.INV-4 |
| R20 | `importer.mjs` sur des pages enregistrées : quatre textes écrits, nommés par leur étiquette ; limite signalée ; textes vérifiés, traduits, et l'un joué jusqu'au bout ; réimport sans réécriture ; `--comparer` identique ; après changements dans Jira : nouveau, modifié, identique, conflit, refusé, disparu, sans rien écrire ; étiquette reprise par le titre ; import sans `--remplacer`, puis avec : retouche gardée à côté, texte écrit à la main jamais remplacé, traduction périmée ; commentaires sur demande ; Jira Data Center ; demande sans scénario ; huit refus avant toute écriture | D16.INV-3, D16.INV-4, D16.INV-5, D16.INV-6, D3.INV-2 |
| R21 | `importer.mjs` par l'adresse : message « À VOUS », connexion simulée, code 0 ; page enregistrée dans `jira/` et relisible ; textes et provenance ; requêtes GET seulement ; profil dédié ; session retrouvée sans message ; demande jamais affichée refusée au délai ; profil Jira invalide | D16.INV-1, D16.INV-6 |
| R22 | Fichier `.feature` et archive : sources reconnues, clés contrôlées ; archive lue en mémoire, bornée, CRC-32 contrôlé ; identité (`@TestCaseKey=`, clé de Xray, préfixe `TEST_`, clé portée par deux titres écartée) ; export de Xray en CRLF avec BOM : textes nommés par la clé, provenance, contexte reporté, colonnes adaptées ; export de Zephyr Scale ; fichier du dépôt sans clé : étiquettes attribuées ; textes vérifiés ; réimport sans réécriture ; `--comparer` après changement ; archive : même test d'un autre chemin d'import inchangé, doublon, fichiers ignorés signalés ; fichier chiffré ; fichier sans scénario ; six refus avant toute écriture | D17.INV-1, D17.INV-4, D17.INV-6, D16.INV-5 |
| R23 | Xray Cloud et Data Center : un état par test ; même clé d'un autre chemin d'import, modifiée, pas en conflit ; Generic refusé, test introuvable ; test manuel converti pas à pas, signalé en tête ; pas vide refusé ; test Cucumber qui porte son titre ; `--remplacer` : titre formé du résumé, étiquettes de Jira, préconditions signalées ; textes vérifiés ; `--comparer` ; Data Center : texte écrit à la main jamais remplacé, demande absente, demande qui n'est pas un test ; même texte et même empreinte qu'en Cloud | D17.INV-1, D17.INV-4, D17.INV-5, D17.INV-6, D16.INV-5 |
| R24 | Zephyr Scale Cloud et Data Center : un état par cas ; BDD sous un titre en anglais, précondition signalée ; pas à pas depuis le HTML, lignes jointes, pas sans résultat ; pas lus page après page ; texte libre et appel d'un autre cas refusés ; Data Center : même texte et même empreinte ; textes vérifiés | D17.INV-1, D17.INV-5, D17.INV-6 |
| R25 | Garde des jetons et de la lecture seule : neuf refus avant toute requête (variables absentes, valeur invalide, http hors du poste, identifiant dans l'adresse, `--api` manquant, clé invalide, option de Jira) ; redirection refusée, l'autre origine jamais jointe, rien d'écrit après une lecture réussie ; jeton et identifiants refusés (401) ; lectures seules, aucune mutation ; jetons dans l'en-tête seulement ; aucun jeton dans une sortie ni dans un texte | D17.INV-2, D17.INV-3, D16.INV-6 |
| R26 | Index du code : bilan et fichiers écrits ; format, projet relatif, empreinte ; projet seulement lu ; routes Angular (module chargé à la demande préfixé, garde, redirection), Vue Router, React Router en JSX ; éléments et noms accessibles (clés traduites, icônes écartées, `mat-label`, `label for`, `label` englobant, `aria-label`, placeholder, rôles des champs, composants) ; parties variables et clé absente ; JSX avec apostrophe, TSX générique ; endpoints Spring, Kotlin, OpenAPI et appels du front ; validations et messages ; sources ; exclusions, lien symbolique non suivi, configuration jamais recopiée ; même index octet pour octet ; anglais, langue sans traduction ; chemin de contexte ; bornes de taille et de nombre ; sept refus ; YAML, `.properties` et jetons JavaScript | D18.INV-1, D18.INV-2, D18.INV-3, D18.INV-5 |
| R27 | Index à la traduction et au contrôle : propositions annoncées ; lien, champ et alternatives ; libellé tout entier variable sans proposition ; `exact = true` ; requête connue ; rôle seul pour un texte variable ; libellé absent sans proposition ; étapes toujours à compléter ; cibles et chemins absents notés, testid calculé reconnu, `data-cy` qui n'est pas un testid, code 0 ; index périmé dit et non employé, par `traduire.mjs` et par `verifier.mjs` ; index illisible ; sans index, rien | D18.INV-2, D18.INV-4, D3.INV-5 |
| R28 | Requêtes de la page : dix-sept étapes et code 0 (document, corps JSON, requête de l'adresse en sous-ensemble, préfixe à étoile, adresse complète, segment `{nom}`, navigation qui suit, réponse JSON d'une page qui reste) ; relevé du rapport ; statut et corps différents, attendu et obtenu des seuls champs attendus ; aucune requête, avec les requêtes vues ; statut gardé et réponse interrompue d'une page qui change de document ; étape à la main : statut vérifié, corps jamais relevé ; ni en-tête, ni cookie, ni jeton, ni mot de passe dans les rapports ; dix refus à la validation | D19.INV-1, D19.INV-2, D19.INV-3 |
| R29 | API et fichier : API en GET avec la session du profil (champs, tableau, nombre, 404 attendu), fichier (texte, lignes, colonne CSV sans casse), code 0 ; relevés ; sans session dans le profil, l'API la voit fermée ; relevé et copie d'écran de la page à la réussite, capture et ARIA à l'échec ; redirection non suivie, l'autre origine jamais jointe ; réponse de plus de 1 Mio ; attendu et obtenu ; GET seulement ; colonne et valeur absentes, lignes et texte ; neuf refus à la validation | D19.INV-1, D19.INV-3, D8.INV-2, D22.INV-2 |
| R30 | Préparation et nettoyage dans le texte et le scénario : quatre marques, sans accents ni casse, `.toml` retiré ; libellés ; place (préparation après une étape ordinaire, étape après le nettoyage, rien hors d'elles) ; nom invalide, `unique` réservé ; squelette (blocs, appel à compléter, scénario et ses paramètres) refusé tant qu'un appel reste à compléter ; vingt refus à la validation ; valeur gardée dans une étape à la main, ou avant sa préparation ; traduction fidèle acceptée, sept écarts refusés ; sept refus d'un scénario de préparation, et le scénario qui se nomme lui-même ; `${unique}` et `<unique>`, sentinelles, résolution à l'exécution, `--param unique` refusé ; deux jeux ; `corps_fichier` lu, invalide ou absent ; plan ; ce qui modifie des données ; `verifier.mjs` et la note d'un nettoyage d'une donnée fixe, mais pas d'une variable dont chaque valeur contient `${unique}`, sauf valeur fixe donnée par `--param` ; refus hors du poste avant le navigateur, sans aucun appel ; `--sans-tete` refusé pour un scénario de préparation à la main | D20.INV-1, D20.INV-3, D20.INV-5, D20.INV-6, D3.INV-5 |
| R31 | Index : classes de corps Java, Kotlin et OpenAPI, seules celles des corps, avec leurs champs et le requis ; corps d'une opération OpenAPI et d'un endpoint Kotlin ; `code.md` ; propositions d'écriture par mot de la phrase et par chemin cité, avec le corps et ses contraintes ; aucune proposition sans correspondance ; squelette d'une ligne de préparation, l'appel à compléter ; chemin d'une préparation absent de l'index noté | D18.INV-2, D18.INV-4 |
| R32 | Préparation et nettoyage par l'API : après la connexion à la main, appel avec la session et le jeton recopié dans `X-XSRF-TOKEN`, sans `Authorization`, corps JSON annoncé par `Content-Type` ; valeur gardée dans les étapes et le nettoyage ; `${unique}` dans le nom créé, client créé puis supprimé ; champs de l'entrée et du bilan ; `rapport.md` et sortie ; jeton jamais dans le rapport ni la sortie ; jeton de Django dans `X-CSRFToken` ; sans session, 401 et sa conduite, étapes non jouées, nettoyage d'une valeur non obtenue non joué, aucune preuve avant la première adresse ; sans cookie anti-CSRF, 403, capture et instantané ARIA de la page ouverte ; `corps_fichier`, plusieurs valeurs gardées, statut parmi une liste ; valeur gardée secrète masquée, aussi réemployée par une étape et un appel, paramètre de requête secret masqué dans l'adresse et le résumé ; chaque entrée une fois ; redirection non suivie ; réponse de plus de 1 Mio, non JSON, sans la valeur ou dont la valeur n'est pas simple : rien de gardé | D20.INV-2, D20.INV-4, D20.INV-6, D8.INV-2 |
| R33 | Nettoyage après une étape en échec, une seule fois ; nettoyage en échec signalé, statut et code inchangés, entrée suivante jouée ; préparation en échec, un seul appel, préparation suivante et étapes non jouées, nettoyage de ce qui ne dépend d'aucune valeur gardée ; plusieurs jeux, chacun sa préparation, son `${unique}` et son nettoyage | D20.INV-4, D20.INV-6, D5.INV-3 |
| R34 | Hors du poste avec `--autoriser-mutations`, l'appel part et se rapporte ; garde à l'appel par le moteur (E3), aucun appel fait ; un scénario de préparation qui modifie des données compte pour la garde ; préparation par l'écran dans le même onglet, avec ses paramètres et le même `${unique}`, ses étapes au rapport et leurs captures préfixées, sortie en retrait, nettoyage par l'API ensuite ; scénario de préparation en échec, étapes non jouées, nettoyage joué | D20.INV-3, D20.INV-5, D7.INV-2 |
| R35 | Export : refus avant toute écriture (sans `--dossier`, dossier absent jamais créé, scénario invalide, texte changé depuis la traduction) ; test et aides écrits dans le seul dossier désigné, notes des origines et des mutations ; en-tête et empreinte du corps ; traduction (un test par jeu dans `test.describe`, tags, localisateurs, numéro et ligne, vérifications qui se poursuivent, mutation, téléversement, nettoyage dans `finally`) ; chaque stratégie de cible, `exact`, `dans` sur deux niveaux et `rang`, dans la notation du skill ; même scénario, même test, « à jour » ; TypeScript par `--langage` ou par le `tsconfig.json` du projet, chemins de la sortie écrits avec des « / » ; fichier qui n'est pas du skill jamais remplacé ; scénario changé : test périmé pour `verifier.mjs`, dit par `--comparer` sans écriture, remplacé par `--remplacer` ; test retouché gardé à côté ; souche de connexion posée une fois, connexion de l'équipe jamais remplacée | D21.INV-1, D21.INV-2, D1.INV-4 |
| R36 | Tests exportés joués par `@playwright/test` 1.65.1 : test DEMO-13 importé de Xray, traduit et exporté ; sept scénarios joués par le skill, puis exportés et joués, huit tests ; pour chaque jeu, le statut du skill à chaque étape et à chaque entrée de préparation et de nettoyage : dix-sept étapes de l'écran sur deux jeux, vérification en échec suivie d'une autre, action en échec, dernière vérification en échec, étape à la main par la connexion de l'équipe et préparation par l'API, scénario de préparation, téléchargement et fichier ; même message d'échec ; requêtes vues, adresse masquée, aucun jeton dans le rapport de Playwright ; préparation à sa place ; appels avec la session et le jeton anti-CSRF recopié ; étapes d'un scénario de préparation sous son entrée ; nettoyage en échec annoté sans changer le résultat ; `<unique>` propre à chaque jeu ; fichier téléchargé, capture et tags ; aucune donnée laissée | D21.INV-1, D21.INV-3, D21.INV-5, D5.INV-3, D5.INV-4, D20.INV-4, D20.INV-5, D20.INV-6 |
| R37 | Tests exportés en TypeScript, d'après le `tsconfig.json` du projet : souche de connexion qui échoue en disant ce qui manque, préparation et nettoyage non joués, aucun appel ; `SCENARIO_ORIGINES` : origine du scénario injoignable mise en correspondance, adresses, vérification d'adresse, API et WebSocket compris, l'autre origine bloquée, WebSocket compris ; correspondance mal formée ; test qui modifie des données hors du poste, déclaré ou par correspondance, sauté sans `SCENARIO_AUTORISER_MUTATIONS=1`, joué avec elle et nettoyé | D21.INV-2, D21.INV-3, D7.INV-1, D7.INV-2 |
| R38 | Résultats : Xray, clé retenue à l'import, statut de chaque pas du test manuel converti, fichier à côté du rapport ; pas en échec avec le message de son étape, commentaire avec le verdict de chaque jeu ; texte retouché depuis l'import : statut du test seul, avec une note ; plusieurs jeux en exemples, `--cle` ; copies d'écran seulement avec `--preuves`, chacune sous son nom stable, en PNG encodé en base64 ; sept refus ; Zephyr Scale au format « custom », JSON et archive .zip lisible, résultat en échec ; plusieurs rapports dans un fichier ; rien n'est envoyé | D21.INV-4, D21.INV-5, D22.INV-3 |
| R39 | Pages de tests de Xray enregistrées en HTML complet : dossier de huit pages, une par test ; Xray Cloud, pas en mode formulaire dans un cadre du dossier de la page, cadres distant et hors du dossier non lus ; Xray Data Center, pas en tableau, en anglais, résultat de deux paragraphes ; grille de div aux rôles ARIA ; test Cucumber recopié ; page sans pas et seconde page du même test refusées, code 1 ; numéros, menus, boutons, scripts et éléments masqués écartés ; provenance comme par l'API, page et son empreinte, préconditions signalées ; pas affichés deux fois gardés une fois ; clé de l'adresse notée par Chrome ; le test lu par l'API puis par sa page, en mode formulaire sans champ Statut, chaque numéro de pas écarté : même texte ; réimport et `--comparer` ; `--diagnostic` sans aucune valeur, rien d'écrit ; quatre refus ; `pages.mjs` sans réseau, processus ni évaluation de code | D17.INV-7, D17.INV-4, D17.INV-5 |
| R40 | Campagne : six scénarios d'un dossier, dans l'ordre de leur nom, code 1 ; avancement et verdict de chacun, bilan des verdicts ; une seule fenêtre, une seule connexion, la session éphémère gardée pour le test suivant ; `campagne.json` et `campagne.md` ; un test en échec n'arrête pas les suivants ; garde des origines de chaque scénario ; refus avant toute action, sans dossier de campagne : scénario invalide, profils mêlés, `--jeu`, `--trace`, dossier sans scénario | D22.INV-1, D7.INV-1, D1.INV-4 |
| R41 | Copies d'écran et verdict : chaque vérification, réussie ou non, chaque échec, l'écran à la fin des étapes ; verdict et cause de chaque jeu et du test ; `rapport.md` et sortie ; règle du verdict : préparation, attente ou étape à la main en échec, bloqué ; nettoyage en échec seul, conforme ; non conforme avant bloqué, bloqué avant conforme ; noms stables des copies d'écran | D22.INV-2, D22.INV-3, D20.INV-4 |
| R42 | Rapport de conformité de la campagne de R40 : balisage wiki et page HTML sans `--preuves`, aucune copie d'écran ; caractères du wiki et HTML échappés ; avec `--preuves`, chaque copie d'écran dans `captures-jira/`, sous son nom stable, identique à sa capture, citée dans le balisage et incluse dans la page ; même rapport, même texte ; un seul rapport, sous la clé de `--cle` ; trois refus ; ni réseau ni processus | D22.INV-4, D22.INV-2 |
| R43 | Résultats d'une campagne de quatre tests importés de Xray, par l'API ou par leur page : Xray Cloud, un fichier dans le dossier de la campagne, statut du verdict, exécution de test donnée ; statut et copies d'écran de chaque pas, écran final sur le test ; Xray Data Center, statuts et pièces jointes ; sans `--preuves`, aucune copie ; Zephyr Scale, `Blocked` ; trois refus de `--execution` ; rapport de conformité sous les clés des tests | D21.INV-4, D22.INV-2, D22.INV-3, D22.INV-4 |

## 4. Contrôle de la recette elle-même

Cent cinquante-huit défauts, réintroduits un à un dans le code, font chacun échouer la recette par le scénario attendu (essai du 22 novembre 2026, Node 26.13.0, Chromium 159 : les cent cinquante-huit rejoués en 1.5.0, sur le code publié) :

| ID | Défaut réintroduit | Scénarios en échec | Contrôles en échec |
|---|---|---|---|
| M1 | La garde des origines laisse passer toute requête | R7 | 2 |
| M2 | Les WebSocket ne sont pas gardés | R7 | 3 |
| M3 | Pas de refus avant le navigateur d'un scénario qui modifie des données hors du poste | R8, R30 | 2 |
| M4 | Pas de garde à l'étape de mutation | R8 | 1 |
| M5 | L'empreinte du texte n'est pas contrôlée | R3, R20, R35 | 4 |
| M6 | Une ligne du texte peut rester sans étape | R3 | 1 |
| M7 | Une marque de mutation du texte peut se perdre | R3 | 1 |
| M8 | Une vérification échouée arrête les vérifications suivantes | R6, R28, R29, R36 | 10 |
| M9 | Une étape échouée n'arrête pas la suite | R6, R7, R36 | 3 |
| M10 | Délai de 30 s pour toute étape, sans tenir compte des réglages | R6, R9, R11 | 4 |
| M11 | Une étape à la main est acceptée sans fenêtre | R9, R30 | 2 |
| M12 | Une variable non déclarée est acceptée | R2, R30 | 2 |
| M13 | --param ne l'emporte plus sur [parametres] ni sur le jeu | R2, R10, R30, R34 | 6 |
| M14 | Un fichier absolu ou hors du dossier du scénario est accepté | R2, R30 | 3 |
| M15 | Une cible ambiguë agit sur le premier élément | R5, R6, R29 | 13 |
| M16 | Pas de capture pour une vérification | R5, R10, R34 | 3 |
| M17 | Navigateur ancien de trois versions accepté sans avertissement | R14 | 1 |
| M18 | Champ origines_bloquees du rapport renommé | R5, R6, R7, R8, R9, R10, R11, R14, R16, R17, R20, R28, R29, R32, R33, R34, R36, R38 | 103 |
| M19 | Une étape main est acceptée sur une ligne non marquée | R3 | 1 |
| M20 | La désignation clique l'élément désigné | R13 | 3 |
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
| M36 | Le résultat attendu d'un pas manuel est perdu | R23, R24, R36, R38 | 21 |
| M37 | L'étiquette @TestCaseKey= de Zephyr Scale n'est pas reconnue | R22 | 2 |
| M38 | Une clé portée par des scénarios de titres différents devient leur identité | R22 | 5 |
| M39 | Le même test, lu d'un autre chemin d'import, est en conflit avec son texte | R22, R23 | 5 |
| M40 | Le CRC-32 d'un fichier de l'archive n'est pas contrôlé | R22 | 7 |
| M41 | Les textes d'un autre lot sont pris pour ceux du lot importé | R22, R23 | 6 |
| M42 | Seule la première page des pas de Zephyr Scale est lue | R24 | 3 |
| M43 | L'index suit les liens symboliques hors du projet | R26 | 2 |
| M44 | L'empreinte de l'index ne couvre pas le contenu des fichiers | R27 | 2 |
| M45 | Un index périmé est employé | R27 | 2 |
| M46 | Les clés de traduction ne sont pas résolues | R26, R27 | 13 |
| M47 | La configuration Spring entre entière dans l'index | R26, R27, R31 | 9 |
| M48 | Les dépendances et les sorties de construction ne sont pas écartées | R26 | 3 |
| M49 | Les routes d'un module chargé à la demande ne sont pas préfixées | R26 | 1 |
| M50 | Le texte d'une icône entre dans le nom accessible | R26 | 2 |
| M51 | Pas de borne de taille par fichier lu | R26 | 1 |
| M52 | Une proposition de l'index entre dans le squelette hors commentaire | R27 | 3 |
| M53 | Une cible absente de l'index fait échouer le contrôle | R27 | 2 |
| M54 | Le relevé d'une requête garde ses en-têtes | R28 | 2 |
| M55 | Un jeton de l'adresse d'une requête n'est pas masqué | R28, R29, R32, R36 | 9 |
| M56 | Le corps d'une requête faite pendant une étape à la main est relevé | R28 | 1 |
| M57 | Une vérification api suit les redirections | R29 | 2 |
| M58 | Une vérification api accepte une autre méthode que GET | R29 | 1 |
| M59 | Le chemin d'une vérification requete ou api peut viser une origine non déclarée | R28, R29 | 3 |
| M60 | La fenêtre des requêtes vérifiées ne part pas de la dernière action | R28, R36 | 2 |
| M61 | Les champs attendus du corps d'une requête ne sont pas comparés | R28 | 2 |
| M62 | Pas de borne de taille de la réponse d'une vérification api | R29 | 1 |
| M63 | La colonne CSV se cherche en tenant compte de la casse | R29 | 1 |
| M64 | Le statut reçu d'une réponse interrompue est perdu | R28 | 5 |
| M65 | Les réponses JSON des requêtes ne sont pas lues | R28 | 2 |
| M66 | Le séparateur d'un CSV n'est pas deviné | R29 | 2 |
| M67 | Le jeton anti-CSRF n'est pas recopié dans l'en-tête d'un appel | R32, R33, R36 | 20 |
| M68 | Le cookie csrftoken de Django n'est pas recopié | R32 | 1 |
| M69 | Le corps d'un appel part sans Content-Type JSON | R32, R33, R36 | 16 |
| M70 | Un appel de préparation suit une redirection | R32 | 1 |
| M71 | Pas de garde à l'appel de préparation hors du poste | R34 | 1 |
| M72 | Un appel en échec est rejoué | R33, R34 | 3 |
| M73 | Pas de borne de taille de la réponse d'un appel dont une valeur est gardée | R32 | 1 |
| M74 | Une valeur gardée peut être un objet de la réponse | R32 | 1 |
| M75 | Une valeur absente de la réponse est gardée | R32 | 1 |
| M76 | Une valeur gardée au nom de secret n'est pas masquée dans le rapport | R32 | 1 |
| M77 | Une préparation en échec n'arrête pas les étapes | R32, R33, R34, R36 | 10 |
| M78 | Toute la préparation se joue avant la première étape, même à la main | R32, R33, R36, R37 | 25 |
| M79 | Une entrée dont une valeur gardée manque est jouée | R32, R33 | 2 |
| M80 | Le nettoyage ne se joue pas après un échec | R32, R33, R34, R36 | 8 |
| M81 | Un nettoyage en échec arrête les nettoyages suivants | R33 | 1 |
| M82 | Un nettoyage en échec change le statut du jeu | R33, R36 | 3 |
| M83 | Un scénario de préparation en échec ne fait pas échouer son entrée | R34 | 1 |
| M84 | Un appel de préparation ou de nettoyage ne compte pas pour la garde des mutations | R30, R34 | 4 |
| M85 | Un scénario de préparation qui modifie des données ne compte pas pour la garde | R34 | 1 |
| M86 | La mutation d'un appel DELETE n'est pas une suppression | R30, R32, R35 | 5 |
| M87 | Une préparation accepte une lecture GET | R30 | 1 |
| M88 | Le chemin d'une préparation peut viser une origine non déclarée | R30 | 1 |
| M89 | Un corps_fichier hors du dossier du scénario est accepté | R30 | 1 |
| M90 | Garder est accepté dans un nettoyage | R30 | 1 |
| M91 | Une variable gardée sert avant la préparation qui la garde | R30 | 1 |
| M92 | Une variable gardée est acceptée dans une étape à la main | R30 | 1 |
| M93 | Une entrée est acceptée sur une ligne qui n'est pas marquée de son genre | R30 | 1 |
| M94 | Une ligne de préparation ou de nettoyage peut rester sans entrée | R30 | 1 |
| M95 | Une étape est acceptée sur une ligne de préparation ou de nettoyage | R30 | 1 |
| M96 | Un scénario de préparation peut déclarer d'autres origines | R30 | 1 |
| M97 | Un scénario de préparation peut avoir un autre profil | R30 | 1 |
| M98 | Un scénario de préparation peut avoir sa propre préparation ou son nettoyage | R30 | 1 |
| M99 | Un paramètre inconnu du scénario de préparation est accepté | R30 | 1 |
| M100 | Tous les jeux d'une exécution reçoivent le même ${unique} | R30, R33 | 2 |
| M101 | Le scénario de préparation ne reçoit pas le ${unique} du jeu | R30, R36 | 4 |
| M102 | `<unique>` d'un exemple n'est pas remplacé | R30, R36, R38 | 7 |
| M103 | Aucune valeur n'est gardée de la réponse d'une préparation | R32, R33, R36 | 17 |
| M104 | Un jeton du chemin d'un appel n'est pas masqué dans son résumé | R32 | 1 |
| M105 | Une préparation peut suivre les étapes ordinaires | R30 | 1 |
| M106 | La marque (nettoyage par l’API), à l'apostrophe typographique, n'est pas reconnue | R30 | 4 |
| M107 | `<unique>` est accepté comme paramètre du texte | R30 | 1 |
| M108 | L'index garde toutes les classes, pas seulement celles des corps | R26, R31 | 3 |
| M109 | Un endpoint proposé entre dans le squelette hors commentaire | R31 | 3 |
| M110 | Un endpoint de lecture est proposé pour une préparation | R31 | 2 |
| M111 | Le type du corps @RequestBody n'est pas lu | R26, R31 | 8 |
| M112 | Le corps d'une opération OpenAPI n'est pas lu | R26, R31 | 5 |
| M113 | Les propriétés du constructeur d'une data class Kotlin ne sont pas lues | R26, R31 | 3 |
| M114 | Le bilan ne compte pas les nettoyages en échec | R33 | 1 |
| M115 | Un nettoyage en échec n'est pas signalé dans la sortie | R33 | 1 |
| M116 | Un nettoyage d'une donnée fixe n'est pas noté | R30 | 2 |
| M117 | Une étape à la main d'un scénario de préparation est acceptée sans fenêtre | R30 | 1 |
| M118 | Un nettoyage par une variable dont chaque valeur contient ${unique} est noté comme fixe | R30 | 1 |
| M119 | Une valeur gardée secrète réemployée par une étape ou un appel n'est pas masquée | R32 | 2 |
| M120 | Un test exporté lit une valeur gardée parmi les valeurs du jeu | R36 | 5 |
| M121 | Un test exporté perd exact de ses cibles | R35 | 2 |
| M122 | Un test exporté perd le rang de ses cibles | R35 | 1 |
| M123 | Un test exporté perd dans de ses cibles | R35 | 1 |
| M124 | Un test exporté ne joue que le premier jeu | R35, R36 | 4 |
| M125 | Les étiquettes du scénario ne deviennent pas des tags | R35, R36 | 2 |
| M126 | Le nettoyage d'un test exporté ne se joue pas après un échec | R36, R37 | 4 |
| M127 | Une vérification exportée en échec arrête les vérifications suivantes | R35, R36 | 2 |
| M128 | Une étape exportée perd sa marque de mutation | R35 | 1 |
| M129 | Un test retouché à la main est tenu pour périmé | R35 | 1 |
| M130 | Un fichier qui n'est pas du skill est tenu pour un test périmé | R35 | 1 |
| M131 | Le tsconfig.json du projet ne fait pas reconnaître TypeScript | R35, R37 | 7 |
| M132 | Verifier.mjs ne dit pas périmé un test exporté dont le scénario a changé | R35 | 1 |
| M133 | Exporter.mjs écrit hors du dossier désigné | R35, R36, R37 | 32 |
| M134 | Un test périmé est remplacé sans --remplacer | R35 | 3 |
| M135 | Un test retouché est remplacé sans être gardé à côté | R35 | 1 |
| M136 | La connexion écrite par l'équipe est remplacée par la souche | R35, R36 | 6 |
| M137 | Verifier.mjs sort avec 0 pour un test exporté périmé ou retouché | R35 | 2 |
| M138 | Un test exporté qui modifie des données n'est pas sauté hors du poste | R37 | 1 |
| M139 | SCENARIO_ORIGINES n'est pas lu | R37 | 2 |
| M140 | Un test exporté laisse partir toute requête | R37 | 1 |
| M141 | L'action qui suit une vérification exportée en échec est jouée | R36 | 1 |
| M142 | Un test exporté dont la dernière vérification échoue réussit | R36 | 2 |
| M143 | Un nettoyage exporté en échec fait échouer le test | R36 | 3 |
| M144 | Un nettoyage exporté dont une valeur gardée manque est joué | R37 | 1 |
| M145 | Un appel exporté ne recopie pas le jeton anti-CSRF | R36 | 4 |
| M146 | ${unique} est le même pour tous les jeux d'un test exporté | R36 | 3 |
| M147 | `<unique>` d'un jeu n'est pas remplacé dans un test exporté | R36 | 3 |
| M148 | Les pas d'un texte retouché depuis l'import ont un statut | R38 | 1 |
| M149 | Les captures s'ajoutent sans --preuves | R38 | 1 |
| M150 | --cle ne l'emporte pas sur la clé retenue à l'import | R38 | 1 |
| M151 | La forme de la clé n'est pas contrôlée | R38 | 1 |
| M152 | Zephyr Scale reçoit Passed pour une exécution en échec | R38 | 1 |
| M153 | Le scénario joué n'est cherché que dans le dossier du rapport | R38 | 5 |
| M154 | Chaque ligne du texte devient un pas de Xray | R38 | 2 |
| M155 | Un test exporté ne masque pas un paramètre secret d'une adresse | R36 | 1 |
| M156 | Un test exporté laisse passer tout WebSocket | R37 | 1 |
| M157 | Deux scénarios qui donnent le même test sont exportés | R35 | 2 |
| M158 | `<unique>` des paramètres d'un scénario de préparation n'est pas remplacé dans un test exporté | R36 | 6 |

Chaque défaut a été retiré après son essai ; la recette du code publié passe en entier.

## 5. Recette en intégration continue

Le workflow `.github/workflows/recette-scenario-playwright.yml` du dépôt Agent2Prompt suit le chemin de l'IA du développeur : il matérialise la transmission courante, extrait les fichiers par la commande du module `execution`, § 8, sous bash et sous CMD, installe les dépendances par `npm ci`, celle de la recette, `@playwright/test`, comprise, puis lance la recette, sous `xvfb-run` sur `ubuntu-latest` et directement sur `windows-latest`, avec Node 22, 24 et 26.13.0 et le Chrome stable des images GitHub. La sortie de la recette s'y affiche au fil de l'eau, et un pas de recette bloqué s'arrête au bout de douze minutes. Une recette en échec y laisse son dossier temporaire en artefact, sans les profils du navigateur : sortie de la recette, rapports, captures et instantanés ARIA, gardés sept jours.

## 6. Sources

### `tests/application-demo.mjs`

<!-- fichier : tests/application-demo.mjs -->
```javascript
// scenario-playwright 1.6.1 : application de démonstration de la recette, servie sur 127.0.0.1 sans réseau.
//
// Deux origines : l'application, et une « autre » origine, que les scénarios ne déclarent pas, pour la
// garde des origines. Les pages couvrent chaque action du jeu fermé : liste et formulaire de clients,
// menu au survol, contenu différé, connexion simulée pour une étape à la main (cookie de session durable,
// ou éphémère, perdu à la fermeture du navigateur, avec ephemere=1), export CSV, erreurs de
// console et réponses en erreur, WebSocket d'écho. Un Jira factice, à connexion simulée, sert des
// demandes avec les marqueurs de Jira Cloud et de Jira Data Center. Un Xray et un Zephyr Scale factices
// servent les API de lecture des tests, en Cloud et en Data Center, et notent chaque requête. L'application
// a son propre JavaScript ; le skill, lui, n'en exécute aucun dans la page. Des API de lecture (client,
// session, redirection vers l'autre origine, réponse volumineuse) servent les vérifications hors de
// l'écran ; le formulaire envoie un en-tête Authorization et un jeton dans l'adresse, qu'aucun rapport ne
// doit contenir. Une API d'écriture, /api/donnees/clients, sert la préparation et le nettoyage des données :
// elle exige la session (cookie session=ok) et, pour une écriture, le jeton anti-CSRF de son cookie recopié
// dans l'en-tête, XSRF-TOKEN et X-XSRF-TOKEN, ou csrftoken et X-CSRFToken ; chaque requête y est notée.
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import http from 'node:http';
import { clearTimeout, setTimeout } from 'node:timers';
import { URL } from 'node:url';
import { crc32, deflateRawSync } from 'node:zlib';

/** Valeurs secrètes de la démonstration : aucune ne doit figurer dans un rapport (D19.INV-2). */
export const ENTETE_DEMO = 'secret-de-la-demo';
export const JETON_REQUETE_DEMO = 'secret-requete-demo';
export const MOT_DE_PASSE_MAIN_DEMO = 'secret-main-demo';
/** Jeton anti-CSRF du cookie de la démonstration, et valeur secrète d'une réponse : jamais dans un rapport (D20.INV-2). */
export const JETON_CSRF_DEMO = 'secret-csrf-demo';
export const JETON_GARDE_DEMO = 'secret-garde-demo';

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
    tests: testsOutils(), requetesOutils: [], requetesAutre: [], requetesApi: [], outils: '', autre: '',
    donnees: new Map(), suivant: 1, requetesDonnees: [],
  };
  const serveurs = [];
  let autre = '';

  const app = (req, res) => {
    const u = new URL(req.url, 'http://x');
    const html = (titre, corps, script, code = 200, entetes = {}) => { res.writeHead(code, { 'content-type': 'text/html; charset=utf-8', ...entetes }); res.end(page(titre, corps, script)); };
    const json = (obj, code = 200) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };
    const corps = () => new Promise((r) => { let d = ''; req.on('data', (c) => { d += c; }); req.on('end', () => r(d)); });
    if (u.pathname.startsWith('/api/')) etat.requetesApi.push(`${req.method} ${u.pathname}`);
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
           const reponse = await fetch('/api/clients?source=formulaire&jeton=${JETON_REQUETE_DEMO}', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ${ENTETE_DEMO}' }, body: JSON.stringify(client) });
           await reponse.json();
           location.href = '/clients?cree=' + encodeURIComponent(client.nom);
         });`);
      case '/api/clients':
        if (req.method === 'POST') return corps().then((d) => { const c = JSON.parse(d); etat.clients.push(c); etat.ajouts.push(c); json({ ok: true, nom: c.nom }, 201); });
        return json(etat.clients);
      case '/api/session':
        return json({ ouverte: /(?:^|;\s*)session=ok/.test(req.headers.cookie ?? '') });
      case '/api/redirection':
        res.writeHead(302, { location: `${autre}/api/clients?jeton=${JETON_REQUETE_DEMO}` });
        return res.end();
      case '/api/gros':
        return json(Array.from({ length: 45000 }, (_, i) => ({ numero: i, nom: `client-${i}` })));
      case '/api/connexion':
        return corps().then(() => json({ ok: true }));
      case '/interrompue':
        return html('Interruption', '<h1>Interruption</h1><p>La page change de document pendant une réponse.</p>', "fetch('/api/lent').then(() => { location.href = '/accueil-connecte'; });");
      case '/api/lent': {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.write('{"ok":');
        const minuterie = setTimeout(() => res.end('true}'), 3000);
        res.on('close', () => clearTimeout(minuterie));
        return undefined;
      }
      case '/differe':
        return html('Différé', `<h1>Contenu différé</h1><p id="etat">Chargement…</p><button type="button" id="b" disabled>Continuer</button><p id="tard" hidden>Données chargées</p>`,
          `setTimeout(() => { document.getElementById('etat').textContent = 'Chargé'; document.getElementById('b').disabled = false; document.getElementById('tard').hidden = false; }, 1200);`);
      case '/connexion':
        return html('Connexion', `<h1>Connexion</h1><p>Connectez-vous dans cette fenêtre.</p>`,
          u.searchParams.get('auto') ? `setTimeout(async () => {
            ${u.searchParams.get('poster') ? `await fetch('/api/connexion', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ identifiant: 'dupont', motdepasse: '${MOT_DE_PASSE_MAIN_DEMO}' }) });` : ''}
            document.cookie = '${u.searchParams.get('ephemere') ? 'session=ok; path=/' : 'session=ok; max-age=86400; path=/'}'; location.href = '/accueil-connecte${u.searchParams.get('csrf') ? `?csrf=${encodeURIComponent(u.searchParams.get('csrf'))}` : ''}'; }, ${Number(u.searchParams.get('auto'))});` : '');
      case '/accueil-connecte': {
        // Comme Spring (CookieCsrfTokenRepository) ou Django : le serveur pose le jeton anti-CSRF dans un cookie lisible.
        const csrf = u.searchParams.get('csrf');
        const cookie = csrf === 'aucun' ? null : `${csrf === 'django' ? 'csrftoken' : 'XSRF-TOKEN'}=${JETON_CSRF_DEMO}; Max-Age=86400; Path=/`;
        return html('Espace connecté', '<h1>Espace connecté</h1><p>Bienvenue</p>', '', 200, cookie ? { 'set-cookie': cookie } : {});
      }
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
        if (u.pathname.startsWith('/api/donnees/')) return apiDonnees(req, res, u, json, corps);
        if (/^\/clients\/\d+$/.test(u.pathname)) {
          const c = etat.donnees.get(Number(u.pathname.split('/')[2]));
          return c ? html(`Client ${c.nom}`, `<h1>Client ${c.nom}</h1><p id="ville">Ville : ${c.ville}</p>`) : html('Introuvable', '<h1>Client introuvable</h1>', '', 404);
        }
        if (u.pathname.startsWith('/api/clients/') && req.method === 'DELETE') {
          const nom = decodeURIComponent(u.pathname.slice('/api/clients/'.length));
          etat.clients = etat.clients.filter((c) => c.nom !== nom);
          return json({ ok: true });
        }
        if (u.pathname.startsWith('/api/clients/') && req.method === 'GET') {
          const client = etat.clients.find((c) => c.nom === decodeURIComponent(u.pathname.slice('/api/clients/'.length)));
          return client ? json(client) : json({ erreur: 'client introuvable' }, 404);
        }
        return html('Introuvable', '<h1>Page introuvable</h1>', '', 404);
    }
  };

  /**
   * API d'écriture de la préparation et du nettoyage : session exigée (401), jeton anti-CSRF exigé pour une
   * écriture (403), corps JSON annoncé comme tel (415), 201 avec Location à la création, 204 à la suppression,
   * 409 si le nom existe. /api/donnees/reponse?forme= rend une réponse trop grande, non JSON, sans la valeur
   * attendue, ou dont la valeur n'est pas simple.
   */
  function apiDonnees(req, res, u, json, corps) {
    const cookies = Object.fromEntries((req.headers.cookie ?? '').split(/;\s*/).filter(Boolean).map((c) => [c.slice(0, c.indexOf('=')), decodeURIComponent(c.slice(c.indexOf('=') + 1))]));
    const csrf = req.headers['x-xsrf-token'] !== undefined ? 'X-XSRF-TOKEN' : req.headers['x-csrftoken'] !== undefined ? 'X-CSRFToken' : null;
    const note = { methode: req.method, chemin: u.pathname, session: cookies.session === 'ok', csrf, autorisation: Boolean(req.headers.authorization), type: req.headers['content-type'] ?? null, corps: null };
    etat.requetesDonnees.push(note);
    if (cookies.session !== 'ok') return json({ erreur: 'session absente' }, 401);
    if (req.method !== 'GET') {
      const attendu = cookies['XSRF-TOKEN'] !== undefined ? ['XSRF-TOKEN', 'x-xsrf-token'] : cookies.csrftoken !== undefined ? ['csrftoken', 'x-csrftoken'] : null;
      if (!attendu || req.headers[attendu[1]] !== cookies[attendu[0]]) return json({ erreur: 'jeton anti-CSRF absent ou refusé' }, 403);
    }
    if (u.pathname === '/api/donnees/redirection') { res.writeHead(302, { location: `${autre}/api/clients?jeton=${JETON_REQUETE_DEMO}` }); return res.end(); }
    return corps().then((d) => {
      note.corps = d;
      if (d && !/^application\/json\b/i.test(req.headers['content-type'] ?? '')) return json({ erreur: 'corps JSON attendu' }, 415);
      let c = null;
      try { c = d ? JSON.parse(d) : null; } catch { return json({ erreur: 'corps non JSON' }, 400); }
      if (u.pathname === '/api/donnees/jetons' && req.method === 'POST') return json({ id: 'j1', jeton_acces: JETON_GARDE_DEMO }, 201);
      if (u.pathname === '/api/donnees/reponse' && req.method === 'POST') {
        const forme = u.searchParams.get('forme');
        if (forme === 'texte') { res.writeHead(201, { 'content-type': 'text/plain' }); return res.end('valeur'); }
        return json(forme === 'gros' ? { valeur: 'v', remplissage: 'x'.repeat(1_100_000) } : forme === 'objet' ? { valeur: { a: 1 } } : { id: 1 }, 201);
      }
      if (u.pathname === '/api/donnees/clients' && req.method === 'POST') {
        if (!c || typeof c.nom !== 'string' || c.nom.trim() === '') return json({ erreur: 'Le nom est obligatoire' }, 400);
        if ([...etat.donnees.values()].some((x) => x.nom === c.nom)) return json({ erreur: 'client existant' }, 409);
        const id = etat.suivant++;
        const client = { id, nom: c.nom, ville: c.ville ?? 'Paris' };
        etat.donnees.set(id, client);
        etat.clients.push({ nom: client.nom, ville: client.ville });
        res.writeHead(201, { 'content-type': 'application/json', location: `/api/donnees/clients/${id}` });
        return res.end(JSON.stringify(client));
      }
      const m = /^\/api\/donnees\/clients\/(\d+)$/.exec(u.pathname);
      const client = m ? etat.donnees.get(Number(m[1])) : null;
      if (!client) return json({ erreur: 'client introuvable' }, 404);
      if (req.method === 'GET') return json(client);
      if (req.method === 'PUT' || req.method === 'PATCH') {
        const avant = client.nom;
        Object.assign(client, req.method === 'PUT' ? { nom: c?.nom ?? client.nom, ville: c?.ville ?? client.ville } : c ?? {});
        etat.clients = etat.clients.map((x) => (x.nom === avant ? { nom: client.nom, ville: client.ville } : x));
        return json(client);
      }
      if (req.method === 'DELETE') {
        etat.donnees.delete(client.id);
        etat.clients = etat.clients.filter((x) => x.nom !== client.nom);
        res.writeHead(204);
        return res.end();
      }
      return json({ erreur: 'méthode non permise' }, 405);
    });
  }

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

### `tests/projet-demo.mjs`

<!-- fichier : tests/projet-demo.mjs -->
```javascript
// scenario-playwright 1.6.1 : projet de démonstration pour la recette de l'index du code (R26, R27).
//
// Un petit projet front et back, écrit dans un dossier temporaire : Angular (routes, gabarits, gabarit en
// ligne, ngx-translate), Vue (vue-router, vue-i18n), React (React Router, i18next, JSX), Spring en Java et
// en Kotlin (contrôleurs, validations, messages), contrat OpenAPI, et des fichiers que l'index doit écarter.
// Aucun de ces fichiers n'est exécuté : l'index les lit seulement.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const MOT_DE_PASSE_DEMO = 'motdepasse-secret-de-la-demo';

export const FICHIERS_PROJET = {
  'front/src/index.html': `<!doctype html>
<html lang="fr">
<head><title>Démo</title><meta charset="utf-8"></head>
<body><app-root></app-root><noscript>Activer JavaScript</noscript></body>
</html>
`,
  'front/src/app/app.routes.ts': `import { Routes } from '@angular/router';
import { ClientsComponent } from './clients/clients.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'clients', pathMatch: 'full' },
  { path: 'clients', component: ClientsComponent, title: 'Clients' },
  {
    path: 'clients/nouveau',
    loadComponent: () => import('./clients/client-form.component').then((m) => m.ClientFormComponent),
    canActivate: [authGuard],
  },
  { path: 'admin', loadChildren: () => import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES) },
  { path: '**', component: PageIntrouvableComponent },
];
`,
  'front/src/app/admin/admin.routes.ts': `import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: AdminComponent, children: [{ path: 'utilisateurs', component: UtilisateursComponent }] },
];
`,
  'front/src/app/clients/clients.component.html': `<h1>{{ 'clients.titre' | translate }}</h1>
<a routerLink="/clients/nouveau" data-testid="nouveau-client">{{ 'clients.nouveau' | translate }}</a>
<button mat-raised-button (click)="exporter()" aria-label="Exporter les clients"><mat-icon>download</mat-icon></button>
<button type="button" (click)="imprimer()"><mat-icon>print</mat-icon> Imprimer</button>
@if (clients.length > 0) {
  <table>
    <tr><th>{{ 'clients.colonne.nom' | translate }}</th><th>Ville</th></tr>
    @for (c of clients; track c.nom) {
      <tr>
        <td>{{ c.nom }}</td><td>{{ c.ville }}</td>
        <td><button type="button" [attr.data-testid]="'supprimer-' + c.nom" (click)="supprimer(c)">Supprimer {{ c.nom }}</button></td>
      </tr>
    }
  </table>
} @else {
  <p>{{ 'clients.vide' | translate }}</p>
}
<button type="button" (click)="aide()">{{ 'clients.aide.inconnue' | translate }}</button>
<p role="status">{{ 'clients.cree' | translate: { nom: dernier } }}</p>
`,
  'front/src/app/clients/client-form.component.ts': `import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-client-form',
  standalone: true,
  template: \`
    <form (ngSubmit)="enregistrer()">
      <mat-form-field>
        <mat-label>{{ 'client.nom' | translate }}</mat-label>
        <input matInput formControlName="nom" data-testid="champ-nom">
        <mat-error>{{ 'client.nomObligatoire' | translate }}</mat-error>
      </mat-form-field>
      <label for="ville">Ville</label>
      <select id="ville" formControlName="ville"><option>Lyon</option><option>Paris</option></select>
      <label><input type="checkbox" formControlName="actif"> Client actif</label>
      <input type="password" aria-label="Mot de passe">
      <input type="search" placeholder="Rechercher un client">
      <button type="submit" mat-flat-button>Enregistrer</button>
      <button type="button" (click)="enregistrerEtFermer()">Enregistrer et fermer</button>
    </form>
  \`,
})
export class ClientFormComponent {
  constructor(private http: HttpClient) {}

  enregistrer() {
    return this.http.post<void>('/api/clients', this.form.value);
  }

  charger(nom: string) {
    return this.http.get<Client>(\`\${environment.api}/clients/\${nom}\`);
  }
}
`,
  'front/src/app/clients/clients.component.spec.ts': `it('affiche', () => { document.body.innerHTML = '<button>Bouton de spec</button>'; });
`,
  'front/src/assets/i18n/fr.json': `{
  "clients": {
    "titre": "Clients",
    "nouveau": "Nouveau client",
    "colonne": { "nom": "Nom" },
    "vide": "Aucun client",
    "cree": "Client {{nom}} créé"
  },
  "client": { "nom": "Nom", "nomObligatoire": "Le nom est obligatoire" }
}
`,
  'front/src/assets/i18n/en.json': `{
  "clients": { "titre": "Customers", "nouveau": "New customer", "colonne": { "nom": "Name" }, "vide": "No customer", "cree": "Customer {{nom}} created" },
  "client": { "nom": "Name", "nomObligatoire": "Name is required" }
}
`,
  'front/node_modules/bibliotheque/index.html': '<button>Ne pas indexer</button>\n',
  'front/dist/main.js': "fetch('/api/compilee');\n",
  'front/.angular/cache/x.html': '<button>Cache caché</button>\n',
  'vue/src/router/index.js': `import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', name: 'accueil', component: () => import('../views/Accueil.vue') },
  {
    path: '/commandes',
    name: 'commandes',
    component: () => import('../views/Commandes.vue'),
    children: [{ path: ':id', name: 'commande', component: () => import('../views/Commande.vue') }],
  },
];

export default createRouter({ history: createWebHistory(), routes });
`,
  'vue/src/views/Commandes.vue': `<template>
  <section>
    <h2>{{ $t('commandes.titre') }}</h2>
    <router-link to="/commandes/nouvelle" data-cy="nouvelle-commande">Nouvelle commande</router-link>
    <button :aria-label="$t('commandes.rafraichir')" @click="charger"><i class="fa fa-refresh"></i></button>
    <template v-if="vide"><p v-t="'commandes.vide'"></p></template>
  </section>
</template>

<script>
import axios from 'axios';

export default {
  methods: {
    charger() {
      return axios.get('/api/commandes');
    },
  },
};
</script>
`,
  'vue/src/locales/fr.json': '{ "commandes": { "titre": "Commandes", "rafraichir": "Rafraîchir la liste", "vide": "Aucune commande" } }\n',
  'react/src/App.jsx': `import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Accueil />}>
        <Route path="factures" element={<Factures />} />
        <Route path="factures/:id" element={<Facture />} />
      </Route>
    </Routes>
  );
}

function Factures() {
  const { t } = useTranslation();
  const total = 3;
  return (
    <div>
      <h3>{t('factures.titre')}</h3>
      <label htmlFor="recherche">Rechercher</label>
      <input id="recherche" type="text" data-testid="recherche-facture" />
      <Button variant="contained" onClick={() => fetch('/api/factures', { method: 'POST' })}>Créer une facture</Button>
      <p>Total : {total} factures</p>
      {total > 0 && <span className="badge">Factures en attente</span>}
      <img src="logo.png" alt="Logo de la société" />
      <p>L'adresse n'est pas renseignée</p>
    </div>
  );
}
`,
  'react/src/util.tsx': `export const identite = <T,>(x: T): T => x;

export function Badge({ n }: { n: number }) {
  const liste: Array<number> = [n];
  return <span data-testid="badge">{liste.length} nouveaux</span>;
}
`,
  'react/public/locales/fr/translation.json': '{ "factures": { "titre": "Factures" } }\n',
  'back/src/main/java/demo/ClientController.java': `package demo;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/* Contrôleur des clients : @GetMapping("/commentaire") n'est pas un endpoint. */
@RestController
@RequestMapping("/api/clients")
public class ClientController {
    private static final String PAR_NOM = "/{nom}";

    @GetMapping
    public List<ClientDto> lister(@RequestParam(value = "ville", required = false) String ville) {
        return List.of();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void creer(@Valid @RequestBody ClientDto client) {
    }

    @GetMapping(PAR_NOM)
    public ClientDto lire(@PathVariable String nom) {
        return null;
    }

    @DeleteMapping(value = PAR_NOM)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable("nom") String nom) {
        return ResponseEntity.noContent().build();
    }
}
`,
  'back/src/main/java/demo/ClientDto.java': `package demo;

public class ClientDto {
    @NotBlank(message = "{client.nom.obligatoire}")
    @Size(max = 40, message = "Le nom fait au plus {max} caractères")
    private String nom;

    @NotNull
    private String ville;

    @Email(message = "{client.courriel.invalide}")
    private String courriel;
}

class AdresseDto {
    private String rue;
}
`,
  'back/src/main/java/demo/AutreServiceClient.java': `package demo;

@FeignClient(name = "autre")
public interface AutreServiceClient {
    @GetMapping("/api/autre")
    String lire();
}
`,
  'back/src/main/kotlin/demo/ExportController.kt': `package demo

@RestController
@RequestMapping(["/api/export"])
class ExportController {
    @GetMapping(produces = ["text/csv"])
    fun exporter(): String = ""

    @PostMapping("/filtres")
    fun filtrer(@RequestBody filtre: FiltreDto): String = ""
}

data class FiltreDto(
    @field:NotBlank(message = "Le filtre est obligatoire") val filtre: String,
    @field:Size(min = 2) val ville: String?,
)
`,
  'back/src/main/resources/ValidationMessages_fr.properties': 'client.nom.obligatoire=Le nom est obligatoire\nclient.courriel.invalide=Adresse \\u00e9lectronique invalide\n',
  'back/src/main/resources/application.properties': `spring.application.name=demo
spring.datasource.password=${MOT_DE_PASSE_DEMO}
`,
  'back/src/test/java/demo/ClientControllerTest.java': `@RestController
class FauxControleur { @GetMapping("/api/test") void t() {} }
`,
  'back/openapi.yaml': `openapi: 3.0.3
info:
  title: Démo
  version: "1"
servers:
  - url: http://localhost:8080
paths:
  /api/clients:
    get:
      operationId: listerClients
      summary: Liste des clients
      responses:
        "200":
          description: liste
  /api/export.csv:
    get:
      operationId: exporterClients
      summary: >
        Exporte les clients
        en CSV
      responses:
        '200': { description: CSV }
  /api/fournisseurs:
    post:
      operationId: creerFournisseur
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Fournisseur'
      responses:
        "201":
          description: créé
components:
  schemas:
    Fournisseur:
      type: object
      required: [raison]
      properties:
        raison:
          type: string
        siret:
          type: string
        creation:
          type: string
          format: date
`,
  '.env': `MOT_DE_PASSE=${MOT_DE_PASSE_DEMO}\n`,
};

/** Écrit le projet de démonstration dans `dossier` ; rend la liste des chemins écrits. */
export function ecrireProjetDemo(dossier) {
  for (const [rel, contenu] of Object.entries(FICHIERS_PROJET)) {
    const chemin = join(dossier, ...rel.split('/'));
    mkdirSync(dirname(chemin), { recursive: true });
    writeFileSync(chemin, contenu);
  }
  return Object.keys(FICHIERS_PROJET);
}
```

### `tests/run-tests.mjs`

<!-- fichier : tests/run-tests.mjs -->
```javascript
#!/usr/bin/env node
// scenario-playwright 1.6.1 : recette du skill, scénarios R1 à R43, contre l'application de démonstration
// locale (tests/application-demo.mjs) et le projet de démonstration (tests/projet-demo.mjs), sans réseau ni compte. Le navigateur s'ouvre, visible, sur des
// profils temporaires : les profils et les résultats du dossier du skill ne sont pas touchés. Les tests exportés
// (R35 à R38) sont joués par @playwright/test 1.65.1, dépendance de développement, dans des projets temporaires.
//   Navigateur : celui de SCENARIO_PLAYWRIGHT_CANAL (chrome par défaut ; chromium après
//   npx playwright-core install chromium). Linux sans écran : xvfb-run -a npm test.
// Usage, depuis le dossier du skill : npm test ; sortie 0 si tout passe, 1 sinon (dossier temporaire gardé,
// comme avec GARDER_TMP=1).
import { spawn } from 'node:child_process';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { clearTimeout, setTimeout } from 'node:timers';
import { fileURLToPath, URL, URLSearchParams } from 'node:url';
import * as cas from '../scripts/cas.mjs';
import * as cibles from '../scripts/cibles.mjs';
import * as code from '../scripts/code.mjs';
import * as conformite from '../scripts/conformite.mjs';
import * as exportation from '../scripts/export.mjs';
import * as lecteurs from '../scripts/lecteurs.mjs';
import * as jira from '../scripts/jira.mjs';
import * as moteur from '../scripts/moteur.mjs';
import * as rapport from '../scripts/rapport.mjs';
import * as scenario from '../scripts/scenario.mjs';
import * as session from '../scripts/session.mjs';
import * as texte from '../scripts/texte.mjs';
import { lireToml } from '../scripts/toml.mjs';
import { designer } from '../scripts/designer.mjs';
import { demarrerApplication, demandesJira, descriptionCloud, enMhtml, enZip, ENTETE_DEMO, JETON_CSRF_DEMO, JETON_GARDE_DEMO, JETON_REQUETE_DEMO, JETONS_FACTICES, MOT_DE_PASSE_MAIN_DEMO, pageJira, SESSION_XRAY } from './application-demo.mjs';
import { ecrireProjetDemo, FICHIERS_PROJET, MOT_DE_PASSE_DEMO } from './projet-demo.mjs';

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

/** Empreinte d'une arborescence (chemins et contenus), sans le dossier de premier niveau `sauf`. */
function arbre(racine, sauf = null) {
  const lignes = [];
  const visiter = (d, rel) => {
    for (const f of readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const r = rel ? `${rel}/${f.name}` : f.name;
      if (!rel && f.name === sauf) continue;
      if (f.isSymbolicLink()) lignes.push(`${r} lien`);
      else if (f.isDirectory()) visiter(join(d, f.name), r);
      else lignes.push(`${r} ${sha(join(d, f.name))}`);
    }
  };
  visiter(racine, '');
  return createHash('sha256').update(lignes.join('\n')).digest('hex');
}

/** Écrit un fichier de scénario dans un dossier de la recette ; rend son chemin. */
function ecrire(dossier, nom, contenu) {
  const d = join(TMP, dossier);
  mkdirSync(d, { recursive: true });
  const chemin = join(d, nom);
  writeFileSync(chemin, contenu);
  return chemin;
}

/** Lance un module Node sans bloquer ce processus, qui sert l'application ; rend { code, sortie, erreurs }. */
function lancerModule(module, args, { env = ENV, delai = 120_000, cwd = undefined } = {}) {
  return new Promise((resolve) => {
    const enfant = spawn(process.execPath, [module, ...args], { env, cwd, stdio: ['ignore', 'pipe', 'pipe'] });
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

/** Lance un script du skill ; `cwd`, le dossier courant du script, pour ses chemins relatifs. */
const lancer = (script, args, options = {}) => lancerModule(join(SKILL, 'scripts', script), args, options);

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

// Tests exportés (R35 à R38) : projet d'une équipe, tests joués par @playwright/test, comparaison avec le skill.
const sansCouleur = (s) => String(s).replace(/\u001b\[[0-9;]*m/g, '');

/**
 * Projet de tests d'une équipe : package.json, dossiers des scénarios et des tests, configuration de
 * @playwright/test (rapport JSON, navigateur de la recette, fenêtre visible) ; ses dépendances sont celles du
 * skill, liées par une jonction, qui sous Windows ne demande aucun droit particulier.
 */
function projetExport(nom, canal) {
  const d = join(TMP, nom);
  mkdirSync(join(d, 'e2e'), { recursive: true });
  mkdirSync(join(d, 'scenarios'), { recursive: true });
  writeFileSync(join(d, 'package.json'), `{ "name": "projet-${nom}", "private": true }\n`);
  const navigateur = canal === 'chromium' ? '' : `, channel: '${canal}'`;
  writeFileSync(join(d, 'playwright.config.mjs'), `export default { testDir: './e2e', outputDir: './test-results', workers: 1, retries: 0, timeout: 120000, reporter: [['line'], ['json', { outputFile: 'resultats.json' }]], use: { headless: false${navigateur} } };\n`);
  symlinkSync(join(SKILL, 'node_modules'), join(d, 'node_modules'), 'junction');
  return d;
}

/**
 * Joue des tests exportés par @playwright/test, avec les seules variables données parmi celles des tests exportés ;
 * rend { code, sortie, erreurs, rapport, tests }, chaque test à plat, dans l'ordre :
 * { fichier, titre, tags, statut, annotations, etapes, erreurs, stdout, stderr }.
 */
async function jouerTests(projet, fichiers = [], variables = {}) {
  const env = { ...ENV };
  delete env.SCENARIO_ORIGINES;
  delete env.SCENARIO_AUTORISER_MUTATIONS;
  Object.assign(env, variables);
  rmSync(join(projet, 'resultats.json'), { force: true });
  const r = await lancerModule(join(SKILL, 'node_modules', '@playwright', 'test', 'cli.js'), ['test', '-c', 'playwright.config.mjs', ...fichiers], { env, cwd: projet, delai: 300_000 });
  let lu = null;
  try { lu = JSON.parse(readFileSync(join(projet, 'resultats.json'), 'utf8')); } catch { /* aucun rapport */ }
  const tests = [];
  const parcourir = (suite, fichier) => {
    for (const sp of suite.specs ?? []) {
      for (const t of sp.tests ?? []) {
        const res = t.results?.at(-1) ?? {};
        tests.push({
          fichier, titre: sp.title, tags: sp.tags ?? [], statut: res.status ?? 'absent',
          annotations: [...(t.annotations ?? []), ...(res.annotations ?? [])], etapes: res.steps ?? [],
          erreurs: (res.errors ?? []).map((e) => sansCouleur(e.message ?? '')), stdout: (res.stdout ?? []).map((x) => x.text ?? '').join(''),
          stderr: (res.stderr ?? []).map((x) => x.text ?? '').join(''),
        });
      }
    }
    for (const s of suite.suites ?? []) parcourir(s, fichier);
  };
  for (const s of lu?.suites ?? []) parcourir(s, s.file);
  return { ...r, rapport: lu, tests };
}

/** Statut de chaque entrée d'un jeu du rapport du skill : { 1: 'reussie', …, p1: …, n1: … }. */
const statutsSkill = (j) => Object.fromEntries([...(j.preparation ?? []).map((e) => [`p${e.numero}`, e.statut]), ...j.etapes.map((e) => [String(e.numero), e.statut]), ...(j.nettoyage ?? []).map((e) => [`n${e.numero}`, e.statut])]);

/** Mêmes statuts, lus des étapes d'un test exporté : étape en échec, réussie, ou absente, donc non jouée. */
function statutsExport(t, cles) {
  const vus = new Map();
  for (const s of t.etapes) {
    const m = /^([pn]?\d+)\. /.exec(s.title);
    if (m) vus.set(m[1], s.error ? 'echec' : 'reussie');
  }
  return Object.fromEntries(cles.map((k) => [k, vus.get(k) ?? 'non_jouee']));
}
const enLigne = (o) => Object.entries(o).map(([k, v]) => `${k} ${v}`).join(', ');

/** Premier fichier de ce nom sous un dossier, ou null. */
function trouver(dossier, nom) {
  if (!existsSync(dossier)) return null;
  for (const f of readdirSync(dossier, { withFileTypes: true })) {
    const c = join(dossier, f.name);
    if (f.isDirectory()) {
      const t = trouver(c, nom);
      if (t) return t;
    } else if (f.name === nom) return c;
  }
  return null;
}

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
  console.log(`Recette de scenario-playwright 1.6.1 : Node ${process.versions.node}, navigateur ${canal}, application ${base}`);
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
      controle('chaque étape a sa durée, son résumé et sa cible', e.every((x) => Number.isInteger(x.duree_ms) && x.resume) && e[1]?.cible === "getByRole('button', { name: 'Menu' })");
      controle('cible CSS signalée fragile dans le rapport (D4.INV-1)', r.rapport?.cibles_fragiles?.includes("locator('#etat')") && e[18]?.fragile === true);
      controle('navigateur, version et playwright-core notés (D6.INV-1)', r.rapport?.navigateur?.canal === canal && /^\d+\./.test(r.rapport?.navigateur?.version ?? '') && r.rapport?.navigateur?.playwright_core === '1.65.1');
      controle('attente bornée qui s\'arrête dès l\'état obtenu (D5.INV-2)', e[17]?.duree_ms >= 500 && e[17]?.duree_ms < 4000, `${e[17]?.duree_ms} ms`);
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
      controle('bilan : 2 réussies, 2 en échec, 1 non jouée', JSON.stringify(r2.rapport?.bilan) === '{"jeux":1,"etapes":5,"reussies":2,"echecs":2,"non_jouees":1,"preparations":0,"nettoyages":0,"nettoyages_en_echec":0}', JSON.stringify(r2.rapport?.bilan));
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
          controle('garde à l\'étape par l\'API : mutation sur une page hors du poste refusée, sans action', e[1]?.statut === 'echec' && /hors du poste, sans --autoriser-mutations : aucune action faite/.test(e[1].message) && app.etat.compteur === avant + 1, JSON.stringify(e[1]));
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
      controle('--jeu 2 : le seul jeu 2', r3.code === 0 && r3.rapport?.jeux.length === 1 && r3.rapport?.jeux[0]?.numero === 2);
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
        ['même scénario désigné deux fois', 'jouer.mjs', [ok, ok], 2, /scénario désigné deux fois/],
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
        // Un élément absent (la page a changé) ne fait pas tomber la recette : les contrôles le diront.
        const cliquer = async (loc) => {
          const b = await loc.boundingBox({ timeout: 5_000 }).catch(() => null);
          if (!b) return;
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
      const developpement = Object.entries(verrou.packages).filter(([k]) => k !== '' && k !== 'node_modules/playwright-core');
      const importeurs = readdirSync(join(SKILL, 'scripts')).filter((f) => f.endsWith('.mjs') && f !== 'aides-export.mjs' && /^\s*import\b[^\n]*['"]@playwright\/test['"]/m.test(readFileSync(join(SKILL, 'scripts', f), 'utf8')));
      controle('une seule dépendance d\'exécution, playwright-core à version exacte ; @playwright/test, à la même version, en dépendance de développement, qu\'aucun script du skill n\'importe (D1.INV-1)', JSON.stringify(paquet.dependencies) === '{"playwright-core":"1.65.1"}' && JSON.stringify(paquet.devDependencies) === '{"@playwright/test":"1.65.1"}' && verrou.packages['node_modules/playwright-core'].version === '1.65.1' && !verrou.packages['node_modules/playwright-core'].dev && verrou.packages['node_modules/@playwright/test']?.version === '1.65.1' && developpement.length === 2 && developpement.every(([, x]) => x.dev === true && x.version === '1.65.1') && importeurs.length === 0, JSON.stringify(importeurs));
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
      const champs = ['format', 'skill', 'version', 'scenario', 'debut', 'fin', 'duree_ms', 'navigateur', 'options', 'jeux', 'origines_bloquees', 'cibles_fragiles', 'bilan', 'statut', 'verdict'];
      controle('E1 : champs du rapport', r && JSON.stringify(Object.keys(r)) === JSON.stringify(champs) && r.format === rapport.FORMAT_RAPPORT, JSON.stringify(r && Object.keys(r)));
      const champsEtape = ['numero', 'ligne', 'action', 'resume', 'cible', 'fragile', 'mutation', 'statut', 'duree_ms', 'message', 'capture', 'aria', 'telechargement', 'hors_ecran', 'console', 'erreurs_page', 'reponses'];
      controle('E1 : champs de chaque étape', r && r.jeux[0].etapes.every((e) => JSON.stringify(Object.keys(e)) === JSON.stringify(champsEtape)));
      controle('E1 : champs de chaque jeu et du bilan, préparation et nettoyage compris (1.4.0), écran final, verdict et cause (1.6.0)', r && r.jeux.every((j) => JSON.stringify(Object.keys(j)) === '["numero","valeurs","statut","preparation","etapes","nettoyage","gardees","nettoyage_en_echec","capture_fin","verdict","cause"]') && JSON.stringify(Object.keys(r.bilan)) === '["jeux","etapes","reussies","echecs","non_jouees","preparations","nettoyages","nettoyages_en_echec"]', JSON.stringify(r && [Object.keys(r.jeux[0]), Object.keys(r.bilan)]));
      controle('E1 : champs du navigateur, du scénario et des options', r && JSON.stringify(Object.keys(r.navigateur)) === '["canal","version","playwright_core","chromium_reference","avertissement"]' && JSON.stringify(Object.keys(r.scenario)) === '["fichier","titre","etiquettes","source","empreinte","url_base","origines"]' && JSON.stringify(Object.keys(r.options)) === '["sans_tete","ralenti","trace","mutations_autorisees","params","jeu"]');
      controle('E2 : format et vocabulaire communs avec le navigateur d\'Agent2Test ; jeu fermé de treize actions, inchangé par la préparation (D20.INV-1)', scenario.FORMAT_SCENARIO === 'scenario-playwright.scenario/1' && Object.keys(scenario.ACTIONS).length === 13 && ['naviguer', 'cliquer', 'saisir', 'choisir', 'cocher', 'survoler', 'touche', 'televerser', 'attendre', 'verifier'].every((a) => a in scenario.ACTIONS) && JSON.stringify(scenario.CRITERES) === '["contient","visible","valeur","nombre","url","actif","requete","api","fichier"]');
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
      controle('provenance d\'un fichier : lot, scénario, source et son empreinte, contexte reporté (D17.INV-4)', t33.startsWith('# Importé d\'un fichier .feature par importer.mjs (scenario-playwright 1.6.1), sans IA : le scénario est recopié tel qu\'écrit dans le fichier.\n# Lot : fichier ../r22-sources/1_DEMO-30.feature\n# Scénario : @DEMO-33, 1_DEMO-30.feature\n') && t33.includes(`# Source : fichier ../r22-sources/1_DEMO-30.feature (sha256 ${sha(fX)})`) && /# Empreinte de la source : [0-9a-f]{64}\n/.test(t33) && t33.includes('# Contexte reporté en tête des étapes : 1 étape.'), t33);
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
      controle('test manuel : chaque pas en « Quand <action> », avec ses données, puis « Alors <résultat attendu> », signalé en tête (D17.INV-5)', t13.startsWith('# Importé de Xray par importer.mjs (scenario-playwright 1.6.1), sans IA : chaque pas du test manuel devient « Quand <action> », avec ses données, puis « Alors <résultat attendu> ».\n# Lot : xray DEMO-13\n# Scénario : @DEMO-13, test manuel DEMO-13\n') && t13.includes('\n@DEMO-13\nScénario: Exporter les clients\n') && t13.includes('  Quand Ouvrir la page « Export »\n  Alors La page « Export » s\'affiche\n  Quand Cliquer sur le lien « Exporter en CSV », avec « format CSV ; séparateur ; »\n  Alors Le fichier « clients.csv » est téléchargé\n'), t13);
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
    // ------------------------------------------------------------------------------------------
    scenarioRecette('R26', 'Index du code sans IA : lecture seule, routes, éléments et noms accessibles, traductions, endpoints, validations, sources, exclusions, bornes');
    {
      const projet = join(TMP, 'r26', 'projet');
      ecrireProjetDemo(projet);
      ecrire(join('r26', 'ailleurs'), 'page.html', '<button>Hors du projet</button>\n');
      let lien = true;
      try { symlinkSync(join(TMP, 'r26', 'ailleurs'), join(projet, 'front', 'lien'), 'junction'); } catch { lien = false; }
      const dossier = join(projet, 'scenarios');
      const avant = arbre(projet, 'scenarios');
      let x = await lancer('indexer.mjs', [projet, '--dossier', dossier]);
      const fichierIndex = join(dossier, 'index', 'code.json');
      controle('index écrit, code 0 : bilan sur une ligne, code.json et code.md', x.code === 0 && /^index du code : 20 fichiers lus ; 13 routes, 27 éléments d'interface, 25 textes, 13 endpoints et appels, 3 classes de corps, 6 contraintes de validation ; 3 fichiers de traduction \(fr\)$/m.test(x.sortie) && existsSync(fichierIndex) && existsSync(join(dossier, 'index', 'code.md')), x.sortie + x.erreurs);
      const ix = existsSync(fichierIndex) ? JSON.parse(readFileSync(fichierIndex, 'utf8')) : { routes: [], elements: [], textes: [], endpoints: [], validations: [], modeles: [], limites: [] };
      controle('format, version, projet noté relativement au dossier des scénarios, langue, empreinte', ix.format === code.FORMAT_INDEX && ix.version === '1.6.1' && ix.projet === '..' && ix.langue === 'fr' && /^[0-9a-f]{64}$/.test(ix.empreinte) && ix.partiel === false && ix.limites.length === 0, JSON.stringify(ix.limites));
      controle('projet seulement lu : rien de créé ni de modifié hors du dossier des scénarios, qui ne reçoit que index/ (D18.INV-1)', arbre(projet, 'scenarios') === avant && JSON.stringify(readdirSync(dossier)) === '["index"]' && JSON.stringify(readdirSync(join(dossier, 'index')).sort()) === '["code.json","code.md"]');
      const routes = ix.routes.map((r) => [r.chemin, r.composant, r.redirection && `→ ${r.redirection}`, r.garde && 'garde'].filter(Boolean).join(' ')).sort();
      const routesAttendues = ['/ Accueil', '/ Accueil', '/ → /clients', '/** PageIntrouvableComponent', '/admin', '/admin AdminComponent', '/admin/utilisateurs UtilisateursComponent', '/clients ClientsComponent', '/clients/nouveau ClientFormComponent garde', '/commandes Commandes', '/commandes/:id Commande', '/factures Factures', '/factures/:id Facture'].sort();
      controle('routes : Angular (module chargé à la demande préfixé, garde, redirection), Vue Router (enfants), React Router en JSX', JSON.stringify(routes) === JSON.stringify(routesAttendues), JSON.stringify(routes));
      const el = (role, nom) => ix.elements.find((e) => e.role === role && e.nom === nom);
      controle('Angular : clés ngx-translate résolues en français, niveau du titre, testid, lien, aria-label, icône écartée du nom', el('heading', 'Clients')?.cle === 'clients.titre' && el('heading', 'Clients').niveau === 1 && el('link', 'Nouveau client')?.testid === 'nouveau-client' && el('link', 'Nouveau client').vers === '/clients/nouveau' && Boolean(el('button', 'Exporter les clients')) && Boolean(el('button', 'Imprimer')) && !ix.elements.some((e) => /download|print/.test(e.nom ?? '')) && !ix.textes.some((t) => /download|print/.test(t.texte)) && Boolean(el('columnheader', 'Nom')), JSON.stringify(ix.elements.slice(10, 18)));
      controle('parties variables notées … : nom, identifiant de test calculé, message de statut ; blocs @if et @for retirés', el('button', 'Supprimer …')?.dynamique === true && el('button', 'Supprimer …').testid === 'supprimer-…' && ix.elements.find((e) => e.role === 'status')?.texte === 'Client … créé' && !ix.textes.some((t) => /@if|@for|track/.test(t.texte)));
      controle('clé de traduction absente des fichiers : le nom affiché est la clé, signalée', el('button', 'clients.aide.inconnue')?.cleNonResolue === true);
      controle('gabarit en ligne : mat-label, label for, label englobant, aria-label, placeholder ; rôles des champs ; message d\'erreur', el('textbox', 'Nom')?.libelle === 'Nom' && el('textbox', 'Nom').testid === 'champ-nom' && el('combobox', 'Ville')?.libelle === 'Ville' && Boolean(el('option', 'Lyon')) && Boolean(el('checkbox', 'Client actif')) && ix.elements.find((e) => e.type === 'password')?.nom === 'Mot de passe' && el('searchbox', 'Rechercher un client')?.placeholder === 'Rechercher un client' && Boolean(el('button', 'Enregistrer')) && Boolean(el('button', 'Enregistrer et fermer')) && ix.elements.some((e) => e.texte === 'Le nom est obligatoire'));
      controle('Vue : $t et v-t résolus, data-cy noté comme attribut de test, icône écartée', el('heading', 'Commandes')?.niveau === 2 && el('link', 'Nouvelle commande')?.attributTest === 'data-cy' && Boolean(el('button', 'Rafraîchir la liste')) && ix.textes.some((t) => t.texte === 'Aucune commande'));
      controle('React : apostrophe dans le texte JSX, t() résolu, htmlFor, composant Button, texte avec expression', el('heading', 'Factures')?.niveau === 3 && el('textbox', 'Rechercher')?.testid === 'recherche-facture' && el('button', 'Créer une facture')?.composant === true && Boolean(el('img', 'Logo de la société')) && ix.textes.some((t) => t.texte === "L'adresse n'est pas renseignée") && ix.textes.some((t) => t.texte === 'Total : … factures' && t.dynamique));
      controle('TSX : la fonction générique <T,> se lit comme du code, pas comme du JSX', ix.elements.some((e) => e.testid === 'badge') && ix.textes.some((t) => t.texte === '… nouveaux'));
      const eps = ix.endpoints.map((e) => `${e.methode} ${e.chemin} ${e.origine}`).sort();
      const epsAttendus = ['GET /api/clients openapi', 'GET /api/clients spring', 'POST /api/clients spring', 'POST /api/clients js', 'DELETE /api/clients/{nom} spring', 'GET /api/clients/{nom} spring', 'GET /api/commandes js', 'GET /api/export spring', 'GET /api/export.csv openapi', 'GET …/clients/… js', 'POST /api/factures js', 'POST /api/export/filtres spring', 'POST /api/fournisseurs openapi'].sort();
      controle('endpoints : Spring en Java et en Kotlin (constante, @RequestParam, @RequestBody, @ResponseStatus), contrat OpenAPI, appels HttpClient, axios et fetch', JSON.stringify(eps) === JSON.stringify(epsAttendus) && ix.endpoints.find((e) => e.methode === 'POST' && e.origine === 'spring')?.statut === 201 && ix.endpoints.find((e) => e.methode === 'POST' && e.origine === 'spring').corps === 'ClientDto' && JSON.stringify(ix.endpoints.find((e) => e.operation === 'lister')?.parametres) === '["ville"]' && ix.endpoints.find((e) => e.operation === 'exporterClients')?.resume === 'Exporte les clients en CSV', JSON.stringify(eps));
      const vals = ix.validations.map((v) => `${v.classe}.${v.champ} ${v.contrainte}${v.message ? ` « ${v.message} »` : ''}`);
      controle('validations : messages résolus dans ValidationMessages_fr, paramètres substitués, Kotlin @field', JSON.stringify(vals) === JSON.stringify(['ClientDto.nom NotBlank « Le nom est obligatoire »', 'ClientDto.nom Size « Le nom fait au plus 40 caractères »', 'ClientDto.ville NotNull', 'ClientDto.courriel Email « Adresse électronique invalide »', 'FiltreDto.filtre NotBlank « Le filtre est obligatoire »', 'FiltreDto.ville Size']) && ix.validations[0].cle === 'client.nom.obligatoire' && ix.validations[5].parametres?.min === 2, JSON.stringify(vals));
      controle('chaque entrée cite sa source, fichier:ligne (D18.INV-2)', [...ix.routes, ...ix.elements, ...ix.textes, ...ix.endpoints, ...ix.validations, ...ix.modeles].every((e) => /^[\w./-]+:\d+$/.test(e.source)) && el('button', 'Enregistrer')?.source === 'front/src/app/clients/client-form.component.ts:19' && el('heading', 'Clients')?.source === 'front/src/app/clients/clients.component.html:1' && ix.routes.find((r) => r.chemin === '/commandes/:id')?.source === 'vue/src/router/index.js:9' && ix.validations[4]?.source === 'back/src/main/kotlin/demo/ExportController.kt:14');
      const tout = (existsSync(fichierIndex) ? readFileSync(fichierIndex, 'utf8') : '') + lire(join(dossier, 'index'), 'code.md');
      controle('écartés : dépendances, construction, cache caché, fichiers de test, client Feign, commentaire (D18.INV-1)', tout.length > 1000 && !/Ne pas indexer|Cache caché|Bouton de spec|\/api\/compilee|\/api\/autre|\/api\/test|\/commentaire/.test(tout));
      controle('configuration : rien d\'autre que le chemin de contexte ; ni mot de passe, ni .env (D18.INV-5)', !tout.includes(MOT_DE_PASSE_DEMO) && !tout.includes('spring.datasource'));
      if (lien) controle('lien symbolique non suivi : rien de ce qu\'il désigne hors du projet n\'est lu (D18.INV-1)', tout.length > 1000 && !tout.includes('Hors du projet'));
      else saut('lien symbolique non suivi (D18.INV-1)', 'lien symbolique impossible à créer sur ce poste');
      const empreinteIndex = existsSync(fichierIndex) ? sha(fichierIndex) : null;
      x = await lancer('indexer.mjs', [projet, '--dossier', dossier]);
      controle('même projet, même index, octet pour octet', x.code === 0 && sha(fichierIndex) === empreinteIndex);
      controle('le code.md cite les entrées et leurs sources', /^- `\/clients\/nouveau` → ClientFormComponent, garde — front\/src\/app\/app\.routes\.ts:8$/m.test(tout) && /^- l\.19 button « Enregistrer »$/m.test(tout) && /^- `POST \/api\/clients` ClientController\.creer, corps ClientDto, statut 201 — back\/src\/main\/java\/demo\/ClientController\.java:17$/m.test(tout));
      x = await lancer('indexer.mjs', [projet, '--dossier', join(TMP, 'r26', 'en'), '--langue', 'en']);
      const en = existsSync(join(TMP, 'r26', 'en', 'index', 'code.json')) ? JSON.parse(readFileSync(join(TMP, 'r26', 'en', 'index', 'code.json'), 'utf8')) : { elements: [] };
      controle('--langue en : libellés anglais ; projet hors du dossier des scénarios noté relativement', x.code === 0 && en.elements.some((e) => e.role === 'heading' && e.nom === 'Customers') && en.elements.some((e) => e.role === 'textbox' && e.nom === 'Name') && en.projet === '../projet', x.sortie + x.erreurs);
      x = await lancer('indexer.mjs', [projet, '--dossier', join(TMP, 'r26', 'de'), '--langue', 'de']);
      controle('langue sans fichier de traduction : dit, clés laissées telles quelles', x.code === 0 && /^LIMITE aucun fichier de traduction pour la langue de \(langues trouvées : en, fr\) : clés non résolues$/m.test(x.sortie), x.sortie);
      const contexte = join(TMP, 'r26', 'contexte');
      ecrire(join('r26', 'contexte', 'src', 'main', 'resources'), 'application.yml', `server:\n  port: 8081\n  servlet:\n    context-path: /boutique\nspring:\n  datasource:\n    password: ${MOT_DE_PASSE_DEMO}\n`);
      ecrire(join('r26', 'contexte', 'src', 'main', 'java'), 'Articles.java', '@RestController\n@RequestMapping("/api/articles")\nclass Articles {\n  @GetMapping("/{id:\\\\d+}")\n  String lire() { return ""; }\n}\n');
      x = await lancer('indexer.mjs', [contexte, '--dossier', join(contexte, 'scenarios')]);
      const ixc = lire(join(contexte, 'scenarios', 'index'), 'code.json');
      controle('chemin de contexte Spring (YAML) appliqué aux endpoints ; {id:regex} réduit à {id}', x.code === 0 && ixc.includes('"methode":"GET","chemin":"/boutique/api/articles/{id}"') && ixc.includes('"contexte": "/boutique"') && !ixc.includes(MOT_DE_PASSE_DEMO), ixc.slice(0, 600));
      const bornes = join(TMP, 'r26', 'bornes');
      ecrire(join('r26', 'bornes'), 'a.html', `<button>Gros</button>${' '.repeat(code.LIMITES_INDEX.octets)}`);
      ecrire(join('r26', 'bornes'), 'b.html', '<button>Petit</button>');
      ecrire(join('r26', 'bornes'), 'c.html', '<button>Autre</button>');
      x = await lancer('indexer.mjs', [bornes, '--dossier', join(bornes, 'scenarios')]);
      controle('fichier de plus de 1 Mio : non lu, dit (D18.INV-3)', x.code === 0 && /^LIMITE fichier de plus de 1048576 octets, non lu : a\.html \(\d+ octets\)$/m.test(x.sortie) && !lire(join(bornes, 'scenarios', 'index'), 'code.json').includes('Gros') && lire(join(bornes, 'scenarios', 'index'), 'code.json').includes('Petit'), x.sortie);
      const max = code.LIMITES_INDEX.fichiers;
      code.LIMITES_INDEX.fichiers = 1;
      const partiel = code.indexerProjet(bornes, { dossierScenarios: join(bornes, 'scenarios') });
      code.LIMITES_INDEX.fichiers = max;
      controle('au-delà du nombre de fichiers : index partiel, dit (D18.INV-3)', partiel.partiel === true && partiel.limites.some((l) => /^plus de 1 fichiers à lire : index partiel, arrêté à b\.html$/.test(l)), JSON.stringify(partiel.limites));
      for (const [args, motif] of [[[], 'dossier du projet manquant'], [[projet, '--inconnue'], 'option inconnue : --inconnue'], [[projet, '--langue', 'français'], '--langue français'], [[join(TMP, 'r26', 'absent')], 'dossier introuvable'], [[projet, '--dossier', projet], 'le dossier des scénarios est le projet lui-même'], [[projet, projet], 'un seul dossier de projet'], [[projet, '--dossier'], '--dossier attend une valeur']]) {
        const r = await lancer('indexer.mjs', args);
        controle(`refus, code 2 : ${motif}`, r.code === 2 && r.erreurs.includes(motif), r.erreurs);
      }
      const y = lecteurs.lireYaml('---\na: 1\nb:\n  - x\n  - { c: "d", e: [1, 2] }\nf: |\n  ligne 1\n  ligne 2\ng: >\n  plié\n  ici\n"h i": \'j\'\'k\' # commentaire\nl:\n- m\n...\nn: hors du document\n').valeur;
      controle('YAML minimal : cartes, listes, collections en ligne, blocs | et >, guillemets, commentaires, un seul document', y.a === '1' && y.b[0] === 'x' && y.b[1].c === 'd' && y.b[1].e[1] === '2' && y.f === 'ligne 1\nligne 2' && y.g === 'plié ici' && y['h i'] === "j'k" && y.l[0] === 'm' && !('n' in y), JSON.stringify(y));
      const p = lecteurs.lireProprietes('# commentaire\na = b\\\n  c\nd:\\u00e9t\\u00e9\ne f\n');
      controle('.properties : lignes continuées, \\uXXXX, séparateurs =, : et espace', p.get('a')?.valeur === 'bc' && p.get('d')?.valeur === 'été' && p.get('e')?.valeur === 'f');
      const js = lecteurs.jetonsJs("const r = /'[\"]/g; const s = 'a'; const t = `x${1}y`; const u = a < b && c > d;", { jsx: true });
      controle('jetons JavaScript : expression régulière, gabarit, comparaisons qui ne sont pas du JSX', js.some((j) => j.t === 'regex') && js.find((j) => j.t === 'gabarit')?.v === 'x…y' && !js.some((j) => j.t === 'jsx') && js.filter((j) => j.t === 'chaine').length === 1);
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R27', 'Index à la traduction et au contrôle : propositions en commentaire, index périmé, notes qui ne changent pas le code de sortie');
    {
      const projet = join(TMP, 'r27', 'projet');
      ecrireProjetDemo(projet);
      const dossier = join(projet, 'scenarios');
      await lancer('indexer.mjs', [projet, '--dossier', dossier]);
      const texteR27 = `Scénario: Créer un client\n  Adresse : ${base}\n  Paramètre : nom = Dupont\n\n  Quand je clique sur le lien « Nouveau client »\n  Et je saisis « <nom> » dans le champ « Nom »\n  Et je clique sur le bouton « Enregistrer »\n  Alors la requête POST /api/clients répond 201\n  Et je vois « Client <nom> créé »\n  Et je clique sur « Inexistant »\n`;
      const texteChemin = ecrire(join('r27', 'projet', 'scenarios'), 'creer.scenario', texteR27);
      let x = await lancer('traduire.mjs', [texteChemin]);
      const sq = lire(dossier, 'creer.toml');
      controle('traduire.mjs annonce les propositions de l\'index du code', x.code === 0 && /^index du code : 5 étapes avec des propositions, en commentaire, à vérifier$/m.test(x.sortie) && sq.includes("# Propositions de l'index du code (index/code.md, empreinte"), x.sortie);
      controle('lien : rôle et nom, testid en alternative, source', sq.includes('#   cible = { role = "link", nom = "Nouveau client" }  # front/src/app/clients/clients.component.html:2 ; aussi { testid = "nouveau-client" }'), sq);
      controle('champ : rôle et nom, libellé et testid en alternatives ; un libellé tout entier variable ne propose rien', sq.includes('#   cible = { role = "textbox", nom = "Nom" }  # front/src/app/clients/client-form.component.ts:11 ; aussi { libelle = "Nom" }, { testid = "champ-nom" }') && !sq.includes('pour « ${nom} »'));
      controle('nom contenu dans celui d\'un autre bouton : exact = true proposé', sq.includes('#   cible = { role = "button", nom = "Enregistrer", exact = true }'));
      controle('requête citée par la phrase : endpoint connu, avec son statut', sq.includes('#   methode = "POST", chemin = "/api/clients"  # back/src/main/java/demo/ClientController.java:17, statut 201'));
      controle('texte variable : rôle seul proposé, texte noté', sq.includes('#   cible = { role = "status" }  # front/src/app/clients/clients.component.html:19'));
      const blocInexistant = sq.slice(sq.indexOf('# ligne 10 :'));
      controle('libellé absent de l\'index : aucune proposition', blocInexistant.length > 0 && !blocInexistant.includes('index du code'));
      x = await lancer('verifier.mjs', [join(dossier, 'creer.toml')]);
      controle('propositions en commentaire seulement : chaque étape reste à compléter, le squelette ne se joue pas (D18.INV-4)', (sq.match(/^action = "à compléter"$/gm) ?? []).length === 6 && x.code === 2 && /étape à compléter/.test(x.sortie), x.sortie);
      const complet = `format = "scenario-playwright.scenario/1"\ntitre = "Créer un client"\nurl_base = "${base}"\n\n[parametres]\nnom = "Dupont"\n\n[[etapes]]\naction = "cliquer"\ncible = { role = "link", nom = "Nouveau client" }\n\n[[etapes]]\naction = "saisir"\ncible = { libelle = "Nom" }\nvaleur = "\${nom}"\n\n[[etapes]]\naction = "cliquer"\ncible = { role = "button", nom = "Enregistrer", exact = true }\n\n[[etapes]]\naction = "verifier"\ncritere = "requete"\nmethode = "POST"\nchemin = "/api/clients"\nattendu = { statut = 201 }\n\n[[etapes]]\naction = "verifier"\ncritere = "contient"\ncible = { role = "status" }\nattendu = "Client \${nom} créé"\n\n[[etapes]]\naction = "cliquer"\ncible = { role = "button", nom = "Inexistant" }\n\n[[etapes]]\naction = "verifier"\ncritere = "api"\nchemin = "/api/absent"\n\n[[etapes]]\naction = "cliquer"\ncible = { testid = "supprimer-\${nom}" }\n\n[[etapes]]\naction = "cliquer"\ncible = { testid = "nouvelle-commande" }\n`;
      const completChemin = ecrire(join('r27', 'projet', 'scenarios'), 'complet.toml', complet);
      x = await lancer('verifier.mjs', [completChemin]);
      controle('cible absente de l\'index : notée, avec son étape ; un testid calculé correspond ; data-cy n\'est pas un testid', x.code === 0 && /^note complet\.toml : cibles absentes de l'index du code \(texte variable, composant hors du projet, ou cible à revoir\) : étape 6 getByRole\('button', \{ name: 'Inexistant' \}\) ; étape 9 getByTestId\('nouvelle-commande'\)$/m.test(x.sortie), x.sortie);
      controle('chemin absent de l\'index : noté ; le code de sortie n\'en dépend pas (D18.INV-4)', x.code === 0 && /^note complet\.toml : chemins absents de l'index du code : étape 7 GET \/api\/absent$/m.test(x.sortie) && /^ok {2}complet\.toml/m.test(x.sortie), x.sortie);
      writeFileSync(join(projet, 'front', 'src', 'app', 'clients', 'clients.component.html'), `${FICHIERS_PROJET['front/src/app/clients/clients.component.html']}<p>modifié</p>\n`);
      x = await lancer('traduire.mjs', [texteChemin, '--remplacer']);
      controle('code modifié depuis l\'indexation : index périmé, dit, squelette sans propositions (D18.INV-2)', x.code === 0 && /^note : index du code périmé, le code a changé depuis l'indexation : relancer indexer\.mjs ; squelette sans propositions de l'index$/m.test(x.sortie) && !lire(dossier, 'creer.toml').includes('# index du code'), x.sortie);
      x = await lancer('verifier.mjs', [completChemin]);
      controle('verifier.mjs avec un index périmé : dit, cibles non comparées, code 0', x.code === 0 && /^note complet\.toml : index du code périmé.*cibles non comparées à l'index$/m.test(x.sortie) && !/cibles absentes/.test(x.sortie), x.sortie);
      writeFileSync(join(dossier, 'index', 'code.json'), '{ pas du JSON');
      x = await lancer('verifier.mjs', [completChemin]);
      controle('index illisible : dit, sans erreur', x.code === 0 && /index\/code\.json illisible : relancer indexer\.mjs/.test(x.sortie), x.sortie);
      x = await lancer('verifier.mjs', [ecrire('r27-sans-index', 'complet.toml', complet)]);
      controle('sans index : rien sur l\'index', x.code === 0 && !/index du code/.test(x.sortie), x.sortie);
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R28', 'Requêtes de la page : méthode, chemin, statut, champs du corps et de la réponse ; ni en-tête, ni cookie, ni jeton, ni corps d\'une étape à la main');
    {
      const tete = (titre, profil = null) => `format = "scenario-playwright.scenario/1"\ntitre = "${titre}"\nurl_base = "${base}"\n${profil ? `profil = "${profil}"\n` : ''}`;
      const etape = (champs) => `\n[[etapes]]\n${champs}\n`;
      const verifierRequete = (champs) => etape(`action = "verifier"\ncritere = "requete"\n${champs}`);
      const compteur = app.etat.compteur + 1;
      const r1 = await jouer(ecrire('r28', 'requetes.toml', `${tete('Requêtes')}\n[parametres]\nnom = "Requete"\n${etape('action = "naviguer"\nurl = "/clients/nouveau"')}${verifierRequete('methode = "GET"\nchemin = "/clients/nouveau"\nattendu = { statut = 200 }')}${etape('action = "saisir"\ncible = { libelle = "Nom" }\nvaleur = "${nom}"')}${etape('action = "choisir"\ncible = { libelle = "Ville" }\nvaleur = "Lyon"')}${etape('action = "cliquer"\ncible = { role = "button", nom = "Enregistrer" }\nmutation = "creation"')}${verifierRequete('methode = "POST"\nchemin = "/api/clients"\nattendu = { statut = 201, corps = { nom = "${nom}", ville = "Lyon", actif = false } }')}${verifierRequete('chemin = "/api/clients?source=formulaire"')}${verifierRequete('methode = "POST"\nchemin = "/api/cli*"')}${verifierRequete(`chemin = "${base}/api/clients"`)}${verifierRequete('methode = "GET"\nchemin = "/clients"')}${etape('action = "naviguer"\nurl = "/clients"')}${etape('action = "cliquer"\ncible = { role = "button", nom = "Supprimer", dans = { role = "row", nom = "${nom}" } }\nmutation = "suppression"')}${verifierRequete('methode = "DELETE"\nchemin = "/api/clients/{nom}"\nattendu = { statut = 200 }')}${verifierRequete('methode = "DELETE"\nchemin = "/api/clients/${nom}"')}${etape('action = "naviguer"\nurl = "/compteur"')}${etape('action = "cliquer"\ncible = { role = "button", nom = "Ajouter" }\nmutation = "modification"')}${verifierRequete(`methode = "POST"\nchemin = "/api/compteur"\nattendu = { statut = 200, reponse = { compteur = ${compteur} } }`)}`));
      const e1 = etapes(r1);
      controle('requête de la page : méthode, chemin, statut, champs du corps JSON ; les étapes réussissent, code 0 (D19)', r1.code === 0 && e1.length === 17 && e1.every((e) => e.statut === 'reussie'), r1.sortie + JSON.stringify(e1.filter((e) => e.statut !== 'reussie').map((e) => e.message)));
      controle('relevé dans le rapport : méthode, adresse, statut', JSON.stringify(e1[1]?.hors_ecran) === JSON.stringify({ critere: 'requete', methode: 'GET', adresse: `${base}/clients/nouveau`, statut: 200 }) && e1[5]?.hors_ecran?.adresse === `${base}/api/clients?source=formulaire&jeton=***` && e1[5].hors_ecran.statut === 201, JSON.stringify(e1[5]?.hors_ecran));
      controle('chemin : requête de l\'adresse en sous-ensemble, préfixe à étoile, adresse complète d\'une origine déclarée, segment {nom}', [6, 7, 8, 12, 13].every((i) => e1[i]?.statut === 'reussie' && e1[i].hors_ecran) && e1[12].hors_ecran.adresse === `${base}/api/clients/Requete`);
      controle('la fenêtre d\'une vérification part de la dernière action : la navigation qui suit l\'enregistrement est vue', e1[9]?.hors_ecran?.adresse === `${base}/clients?cree=Requete`);
      controle('réponse JSON lue quand la page garde son document', e1[16]?.statut === 'reussie' && e1[16].hors_ecran?.statut === 200);
      const rapportsR28 = [];
      const lireRapport = (r) => (r.dossier ? lire(r.dossier, 'rapport.json') + lire(r.dossier, 'rapport.md') : '');
      rapportsR28.push(lireRapport(r1));
      const r2 = await jouer(ecrire('r28', 'echecs.toml', `${tete('Requêtes en échec')}${etape('action = "naviguer"\nurl = "/clients/nouveau"')}${etape('action = "saisir"\ncible = { libelle = "Nom" }\nvaleur = "Echec"')}${etape('action = "cliquer"\ncible = { role = "button", nom = "Enregistrer" }\nmutation = "creation"')}${verifierRequete('methode = "POST"\nchemin = "/api/clients"\nattendu = { statut = 200 }\ndelai = 2')}${verifierRequete('methode = "POST"\nchemin = "/api/clients"\nattendu = { corps = { ville = "Marseille" } }\ndelai = 2')}${verifierRequete('chemin = "/api/inexistant"\ndelai = 1')}`));
      const e2 = etapes(r2);
      rapportsR28.push(lireRapport(r2));
      controle('statut différent : attendu et obtenu, adresse masquée, code 1', r2.code === 1 && e2[3]?.statut === 'echec' && e2[3].message === `requête POST ${base}/api/clients?source=formulaire&jeton=*** : attendu : statut 200 ; obtenu : statut 201`, e2[3]?.message);
      controle('champ du corps différent : seuls les champs attendus sont cités', e2[4]?.message === `requête POST ${base}/api/clients?source=formulaire&jeton=*** : attendu : un statut inférieur à 400, corps { ville = "Marseille" } ; obtenu : statut 201, corps { ville = "Paris" }`, e2[4]?.message);
      controle('aucune requête du chemin : dit, avec les requêtes vues depuis la dernière action', e2[5]?.message === `aucune requête /api/inexistant depuis l'étape 3 ; requêtes vues : POST ${base}/api/clients?source=formulaire&jeton=*** 201, GET ${base}/clients?cree=Echec 200`, e2[5]?.message);
      const r4 = await jouer(ecrire('r28', 'interrompue.toml', `${tete('Réponse interrompue')}${etape('action = "naviguer"\nurl = "/interrompue"')}${etape('action = "attendre"\netat = "url"\nurl = "/accueil-connecte"')}${verifierRequete('methode = "GET"\nchemin = "/api/lent"\nattendu = { statut = 200 }')}${verifierRequete('methode = "GET"\nchemin = "/api/lent"\nattendu = { reponse = { ok = true } }\ndelai = 1')}`));
      const e4 = etapes(r4);
      controle('page qui change de document pendant une réponse : son statut reste relevé, sa réponse est dite interrompue', e4[2]?.statut === 'reussie' && e4[2].hors_ecran?.statut === 200 && e4[3]?.message === `requête GET ${base}/api/lent : attendu : un statut inférieur à 400, réponse { ok = true } ; obtenu : statut 200, réponse interrompue avant la fin de sa lecture (la page a changé d'adresse)`, JSON.stringify(e4.map((e) => e.message)));
      const r3 = await jouer(ecrire('r28', 'main.toml', `${tete('Connexion', 'r28')}${etape('action = "naviguer"\nurl = "/connexion?auto=600&poster=1"')}${etape('action = "main"\nmessage = "Connectez-vous"\njusqua = { url = "/accueil-connecte" }')}${verifierRequete('methode = "POST"\nchemin = "/api/connexion"\nattendu = { statut = 200 }')}${verifierRequete('methode = "POST"\nchemin = "/api/connexion"\nattendu = { corps = { identifiant = "dupont" } }\ndelai = 1')}`));
      const e3 = etapes(r3);
      rapportsR28.push(lireRapport(r3));
      controle('étape à la main : sa requête se vérifie par son statut, son corps n\'est jamais relevé (D19.INV-2)', e3[2]?.statut === 'reussie' && e3[3]?.statut === 'echec' && /obtenu : statut 200, corps non relevé pendant une étape à la main$/.test(e3[3].message ?? ''), JSON.stringify(e3.map((e) => e.message)));
      controle('aucun en-tête, aucun cookie, aucun jeton, aucun mot de passe dans les rapports (D19.INV-2)', rapportsR28.every((t) => t.length > 500) && !rapportsR28.some((t) => t.includes(ENTETE_DEMO) || t.includes(JETON_REQUETE_DEMO) || t.includes(MOT_DE_PASSE_MAIN_DEMO) || /authorization|bearer|cookie|session=ok/i.test(t)));
      const erreurs = (etapes) => scenario.validerScenario(lireToml(`format = "scenario-playwright.scenario/1"\ntitre = "T"\nurl_base = "${base}"\n${etapes}`)).erreurs;
      const v = (champs) => `[[etapes]]\naction = "verifier"\n${champs}\n`;
      for (const [etapes, motif] of [
        [v('critere = "requete"'), 'chemin manquant pour le critère requete'],
        [v('critere = "requete"\nchemin = "/api"\ncible = { role = "button" }'), 'le critère requete ne prend ni cible ni exact'],
        [v('critere = "requete"\nchemin = "/api"\nmethode = "FETCH"'), 'methode vaut GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS'],
        [v('critere = "requete"\nchemin = "/api"\nattendu = "201"'), 'attendu est une table non vide pour le critère requete'],
        [v('critere = "requete"\nchemin = "/api"\nattendu = { code = 201 }'), 'clé inconnue dans attendu pour le critère requete : « code » (statut, corps, reponse)'],
        [v('critere = "requete"\nchemin = "/api"\nattendu = { statut = 999 }'), 'attendu.statut est un code HTTP, de 100 à 599'],
        [v('critere = "requete"\nchemin = "/api"\nattendu = { corps = "x" }'), 'attendu.corps est une table ou un tableau de champs JSON'],
        [v(`critere = "requete"\nchemin = "${autre}/api"`), `${autre} n'est pas parmi les origines (D19.INV-1)`],
        [v('critere = "requete"\nchemin = "api/clients"'), 'chemin est un chemin qui commence par / ou une adresse http(s)'],
        [v('critere = "contient"\ncible = { role = "heading" }\nattendu = "x"\nchemin = "/api"'), 'chemin ne s\'emploie qu\'avec les critères requete, api ou fichier'],
      ]) controle(`refus à la validation : ${motif}`, contient(erreurs(etapes), motif), JSON.stringify(erreurs(etapes)));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R29', 'API en lecture avec la session du navigateur, fichier téléchargé : GET seulement, origines déclarées, aucune redirection suivie, bornes');
    {
      const tete = (titre, profil = null) => `format = "scenario-playwright.scenario/1"\ntitre = "${titre}"\nurl_base = "${base}"\n${profil ? `profil = "${profil}"\n` : ''}`;
      const etape = (champs) => `\n[[etapes]]\n${champs}\n`;
      const api = (champs) => etape(`action = "verifier"\ncritere = "api"\n${champs}`);
      const fichier = (champs) => etape(`action = "verifier"\ncritere = "fichier"\nfichier = "export"\n${champs}`);
      const exporter = `${etape('action = "naviguer"\nurl = "/export"')}${etape('action = "telecharger"\ncible = { role = "link", nom = "Exporter en CSV" }\nnom = "export"')}`;
      const n = app.etat.clients.length;
      const r1 = await jouer(ecrire('r29', 'api.toml', `${tete('API et fichier', 'r29')}${etape('action = "naviguer"\nurl = "/connexion?auto=300"')}${etape('action = "main"\nmessage = "Connectez-vous"\njusqua = { url = "/accueil-connecte" }')}${api('chemin = "/api/session"\nattendu = { contient = { ouverte = true } }')}${api(`chemin = "/api/clients"\nattendu = { statut = 200, contient = [{ nom = "Dupont", ville = "Paris" }], nombre = ${n} }`)}${api(`chemin = "${base}/api/clients/Dupont"\nattendu = { contient = { ville = "Paris" } }`)}${api('chemin = "/api/clients/Inconnu"\nattendu = { statut = 404, contient = "introuvable" }')}${exporter}${fichier('attendu = { contient = "Dupont;Paris" }')}${fichier(`attendu = { lignes = ${n + 1} }`)}${fichier('attendu = { csv = { colonne = "Ville", valeur = "Paris" } }')}`));
      const e1 = etapes(r1);
      controle('API en GET avec la session du navigateur : champs JSON, tableau, statut 404 attendu ; fichier : texte, lignes, colonne CSV ; code 0', r1.code === 0 && e1.length === 11 && e1.every((e) => e.statut === 'reussie'), r1.sortie + JSON.stringify(e1.filter((e) => e.statut !== 'reussie').map((e) => e.message)));
      controle('relevés dans le rapport : API (adresse, statut, octets), fichier (lignes)', e1[2]?.hors_ecran?.critere === 'api' && e1[2].hors_ecran.adresse === `${base}/api/session` && e1[2].hors_ecran.statut === 200 && e1[2].hors_ecran.octets > 0 && JSON.stringify(e1[8]?.hors_ecran) === JSON.stringify({ critere: 'fichier', fichier: 'telechargements/export.csv', lignes: n + 1, octets: e1[7]?.telechargement?.octets }), JSON.stringify([e1[2]?.hors_ecran, e1[8]?.hors_ecran]));
      const sans = await jouer(ecrire('r29', 'sans-session.toml', `${tete('Sans session', 'r29-sans')}${api('chemin = "/api/session"\nattendu = { contient = { ouverte = false } }')}`));
      controle('sans session dans le profil : l\'API la voit fermée, aucun identifiant ajouté', sans.code === 0, sans.sortie);
      app.etat.requetesAutre.length = 0;
      const avantApi = app.etat.requetesApi.length;
      const r2 = await jouer(ecrire('r29', 'echecs.toml', `${tete('API et fichier en échec')}${exporter}${api('chemin = "/api/redirection"\ndelai = 2')}${api('chemin = "/api/gros"\ndelai = 2')}${api('chemin = "/api/clients"\nattendu = { contient = "Inexistant" }\ndelai = 1')}${api('chemin = "/api/clients"\nattendu = { nombre = 999 }\ndelai = 1')}${fichier('attendu = { csv = { colonne = "pays", valeur = "France" } }')}${fichier('attendu = { csv = { colonne = "ville", valeur = "Nantes" } }')}${fichier('attendu = { lignes = 99, contient = "Zorro" }')}`));
      const e2 = etapes(r2);
      controle('vérification hors de l\'écran : son relevé et la copie d\'écran de la page quand elle réussit (D22.INV-2) ; capture et instantané ARIA quand elle échoue (D8.INV-2)', e1[2]?.capture === 'captures/03-verifier.png' && existsSync(join(r1.dossier ?? TMP, e1[2].capture)) && Boolean(e1[8]?.capture) && e1[2].aria === null && Boolean(e2[2]?.capture) && Boolean(e2[2]?.aria) && Boolean(e2[6]?.capture), JSON.stringify([e1[2]?.capture, e1[8]?.capture, e2[2]?.capture, e2[2]?.aria]));
      controle('redirection : non suivie, l\'autre origine jamais jointe, adresse masquée (D19.INV-1)', r2.code === 1 && e2[2]?.message === `l'API répond 302, redirection vers ${autre}/api/clients?jeton=*** non suivie (D19.INV-1)` && app.etat.requetesAutre.length === 0, `${e2[2]?.message} ${JSON.stringify(app.etat.requetesAutre)}`);
      controle('réponse de plus de 1 Mio : non lue, dit (D19.INV-3)', e2[3]?.message === `API GET ${base}/api/gros : réponse de plus de 1048576 octets, non lue`, e2[3]?.message);
      controle('texte et tableau attendus : attendu et obtenu', /^API GET .+\/api\/clients : attendu : un statut 2xx, un corps qui contient « Inexistant » ; obtenu : statut 200, corps « \[\{/.test(e2[4]?.message ?? '') && e2[5]?.message === `API GET ${base}/api/clients : attendu : un statut 2xx, un tableau de 999 éléments ; obtenu : statut 200, ${n} éléments`, `${e2[4]?.message} | ${e2[5]?.message}`);
      controle('l\'API n\'émet que des GET (D19.INV-1)', app.etat.requetesApi.length > avantApi && app.etat.requetesApi.slice(avantApi).every((q) => q.startsWith('GET ')), JSON.stringify(app.etat.requetesApi.slice(avantApi)));
      controle('fichier : colonne absente, valeur absente, lignes et texte : attendu et obtenu', e2[6]?.message === 'fichier telechargements/export.csv : attendu : une colonne « pays » ; obtenu : colonnes nom, ville' && /^fichier telechargements\/export\.csv : attendu : la valeur « Nantes » dans la colonne ville ; obtenu : valeurs Dupont|^fichier telechargements\/export\.csv : attendu : la valeur « Nantes » dans la colonne ville ; obtenu : valeurs Paris/.test(e2[7]?.message ?? '') && /^fichier telechargements\/export\.csv : attendu : un texte qui contient « Zorro », 99 lignes ; obtenu : début « nom;ville Dupont;Paris .*», \d+ lignes$/.test(e2[8]?.message ?? ''), JSON.stringify(e2.slice(6).map((e) => e.message)));
      const erreurs = (etapes) => scenario.validerScenario(lireToml(`format = "scenario-playwright.scenario/1"\ntitre = "T"\nurl_base = "${base}"\n${etapes}`)).erreurs;
      const v = (champs) => `[[etapes]]\naction = "verifier"\n${champs}\n`;
      const tel = '[[etapes]]\naction = "telecharger"\ncible = { role = "link" }\nnom = "export"\n';
      for (const [etapes, motif] of [
        [v('critere = "api"\nchemin = "/api"\nmethode = "POST"'), 'le critère api ne fait que des GET, en lecture (D19.INV-1)'],
        [v(`critere = "api"\nchemin = "${autre}/api/clients"`), `${autre} n'est pas parmi les origines (D19.INV-1)`],
        [v('critere = "api"\nchemin = "/api"\nattendu = { nombre = -1 }'), 'attendu.nombre est un entier positif ou nul'],
        [v('critere = "api"\nchemin = "/api"\nattendu = { contient = 3 }'), 'attendu.contient est un texte, ou une table ou un tableau de champs JSON'],
        [v('critere = "fichier"\nfichier = "export"\nattendu = { lignes = 2 }') + tel, 'aucune étape telecharger précédente avec nom = "export"'],
        [tel + v('critere = "fichier"\nfichier = "Export.csv"\nattendu = { lignes = 2 }'), 'fichier est le nom d\'une étape telecharger précédente (nom = "…")'],
        [tel + v('critere = "fichier"\nfichier = "export"'), 'attendu manquant pour le critère fichier'],
        [tel + v('critere = "fichier"\nfichier = "export"\nattendu = { csv = { colonne = "ville" } }'), 'attendu.csv est { colonne = "…", valeur = "…" }'],
        [tel + v('critere = "fichier"\nfichier = "export"\nchemin = "/x"\nattendu = { lignes = 1 }'), 'chemin ne s\'emploie pas avec le critère fichier'],
      ]) controle(`refus à la validation : ${motif}`, contient(erreurs(etapes), motif), JSON.stringify(erreurs(etapes)));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R30', 'Préparation et nettoyage dans le texte et le scénario : marques, place, squelette, contrôle sans IA, scénarios de préparation, refus');
    {
      const T = (etapes, reglages = '') => `Scénario: Préparer\n  Adresse : ${base}\n${reglages}${etapes}`;
      const a = texte.analyserTexte(`${T("  Étant donné que je me connecte (à la main)\n  Et que le client « <nom> » existe (par l'API)\n  Et que sa fiche est prête (Préparation : prep/ouvrir-fiche)\n  Quand je clique sur « Ouvrir »\n  Alors je vois « <nom> »\n  Et le client est supprimé (nettoyage par l’API)\n  Et la fiche est fermée (nettoyage : fermer.toml)\n")}Exemples:\n  | nom |\n  | Zoé <unique> |\n`);
      const m = a.scenario.etapes.map((e) => `${e.ligne}:${e.marque ?? '-'}:${e.scenario ?? '-'}`);
      controle('marques : (par l\'API), (nettoyage par l\'API), (préparation : nom), (nettoyage : nom), sans accents ni casse, .toml retiré (D20.INV-1)', a.erreurs.length === 0 && JSON.stringify(m) === JSON.stringify(['3:main:-', '4:preparation:-', '5:preparation:prep/ouvrir-fiche', '6:-:-', '7:-:-', '8:nettoyage:-', '9:nettoyage:fermer']) && a.scenario.etapes[1].phrase === 'le client « <nom> » existe', JSON.stringify([m, a.erreurs]));
      controle('libellés des marques, pour le plan et le squelette', JSON.stringify(a.scenario.etapes.map(texte.libelleMarque)) === JSON.stringify(['à la main', "par l'API", 'préparation : prep/ouvrir-fiche', '', '', "nettoyage par l'API", 'nettoyage : fermer']));
      const err = (src) => texte.analyserTexte(src).erreurs.map((e) => `${e.ligne} ${e.message}`);
      const e1 = err(T("  Quand je clique sur « A »\n  Et que le client existe (par l'API)\n  Et il est supprimé (nettoyage par l'API)\n  Alors je vois « B »\n"));
      controle('place : la préparation précède les étapes ordinaires, le nettoyage suit toutes les autres (D20.INV-1)', contient(e1, "4 préparation après l'étape de la ligne 3") && contient(e1, '6 étape après le nettoyage de la ligne 5'), JSON.stringify(e1));
      const e2 = err(T("  Étant donné que le client existe (par l'API)\n  Et il est supprimé (nettoyage par l'API)\n"));
      controle('au moins une étape hors de la préparation et du nettoyage', contient(e2, '1 aucune étape hors de la préparation et du nettoyage'), JSON.stringify(e2));
      const e3 = err(T('  Étant donné que la fiche est prête (préparation : ../autre)\n  Quand je clique sur « A »\n', '  Paramètre : unique = 1\n'));
      const e4 = err(`${T('  Quand je clique sur « A <unique> »\n')}Exemples:\n  | unique |\n  | 1 |\n`);
      controle('nom de scénario invalide ; unique réservé en paramètre et en colonne d\'exemples, <unique> sans déclaration (D20.INV-6)', contient(e3, 'scénario de préparation invalide : « ../autre »') && contient(e3, 'paramètre réservé : <unique>') && contient(e4, "colonne d'exemples réservée") && err(T('  Quand je clique sur « A <unique> »\n')).length === 0, JSON.stringify([e3, e4]));
      const sq = scenario.squeletteToml(a.scenario, 'prep.scenario', { parametresDe: (n) => (n === 'prep/ouvrir-fiche' ? ['id'] : null) });
      controle('squelette : un bloc [[preparation]] ou [[nettoyage]] par ligne marquée, appel à compléter ou scénario nommé, paramètres en commentaire (D3.INV-5)', sq.includes('[[preparation]]\nligne = 4\nmethode = "à compléter"\nchemin = "/…"') && sq.includes('[[preparation]]\nligne = 5\nscenario = "prep/ouvrir-fiche.toml"\n# parametres = { … } : paramètres de prep/ouvrir-fiche.toml : id') && sq.includes('[[nettoyage]]\nligne = 8\nmethode = "à compléter"') && sq.includes('[[nettoyage]]\nligne = 9\nscenario = "fermer.toml"\n# parametres = { nom = "${nom}" } : valeurs des paramètres de fermer.toml') && !sq.includes('[[etapes]]\nligne = 4') && sq.includes("# ligne 4 : Et que le client « <nom> » existe (par l'API)\n[[preparation]]") && sq.includes('# variables à reprendre : ${nom}'), sq);
      const sqv = scenario.validerScenario(lireToml(sq)).erreurs;
      controle('squelette refusé tant qu\'un appel reste à compléter (D3.INV-5)', contient(sqv, 'préparation 1 (ligne 4 du texte) : appel à compléter') && contient(sqv, 'nettoyage 1 (ligne 8 du texte) : appel à compléter'), JSON.stringify(sqv));
      const tete = `format = "scenario-playwright.scenario/1"\ntitre = "T"\nurl_base = "${base}"\n`;
      const naviguer = '\n[[etapes]]\naction = "naviguer"\nurl = "/"\n';
      const erreursDe = (corps) => scenario.validerScenario(lireToml(`${tete}${corps}${naviguer}`)).erreurs;
      const p = (champs) => `\n[[preparation]]\n${champs}\n`;
      const n = (champs) => `\n[[nettoyage]]\n${champs}\n`;
      for (const [corps, motif] of [
        [p('methode = "GET"\nchemin = "/api/x"'), 'methode vaut POST, PUT, PATCH, DELETE ; une lecture se vérifie par une étape verifier, critere = "api"'],
        [p('methode = "POST"'), 'chemin manquant : un chemin qui commence par /'],
        [p(`methode = "POST"\nchemin = "${autre}/api/x"`), `${autre} n'est pas parmi les origines (D20.INV-2)`],
        [p('methode = "POST"\nchemin = "/x"\ncorps = { a = 1 }\ncorps_fichier = "c.json"'), 'corps ou corps_fichier, pas les deux'],
        [p('methode = "POST"\nchemin = "/x"\ncorps = "texte"'), 'corps est une table ou un tableau, envoyé en JSON'],
        [p('methode = "POST"\nchemin = "/x"\ncorps_fichier = "../c.json"'), 'corps_fichier est le chemin relatif d\'un fichier .json du dossier du scénario'],
        [p('methode = "POST"\nchemin = "/x"\nstatut = 99'), 'statut est un code HTTP, de 100 à 599, ou une liste de codes'],
        [p('methode = "POST"\nchemin = "/x"\nstatut = []'), 'statut est un code HTTP, de 100 à 599, ou une liste de codes'],
        [p('methode = "POST"\nchemin = "/x"\ngarder = { id = "a..b" }'), 'garder.id est un chemin dans la réponse JSON'],
        [n('methode = "DELETE"\nchemin = "/x"\ngarder = { id = "id" }'), 'garder ne s\'emploie qu\'en préparation : rien ne suit le nettoyage'],
        [p('methode = "POST"\nchemin = "/x"\nentete = "a"'), 'champ inconnu pour un appel d\'API : « entete »'],
        [p('methode = "POST"\nchemin = "/x"\ndelai = 31'), 'delai est un nombre entier de secondes, de 1 à 30'],
        [p('scenario = "prep.txt"'), 'scenario est le chemin relatif d\'un scénario TOML, sans « .. »'],
        [p('scenario = "prep.toml"\nparametres = { a = { b = 1 } }'), 'parametres est une table de valeurs simples'],
        [p('scenario = "prep.toml"\nmethode = "POST"'), 'champ inconnu pour un scénario de préparation : « methode »'],
        [p('methode = "POST"\nchemin = "/x/${id}"') + p('methode = "POST"\nchemin = "/y"\ngarder = { id = "id" }'), 'variable ${id} gardée par une préparation qui ne la précède pas'],
        [p('methode = "POST"\nchemin = "/y"\ngarder = { unique = "id" }'), 'garder.unique : nom réservé (D20.INV-6)'],
        [p('methode = "POST"\nchemin = "/y"\ngarder = { id = "id" }') + p('methode = "POST"\nchemin = "/z"\ngarder = { id = "id" }'), 'garder.id : variable déjà gardée par une préparation précédente'],
        ['[parametres]\nunique = "1"\n', 'paramètre réservé : ${unique} vaut un suffixe propre à chaque exécution'],
        [n('methode = "DELETE"\nchemin = "/x/${inconnue}"'), 'variable ${inconnue} non déclarée dans [parametres] ni dans [[jeux]], ni gardée par une préparation'],
      ]) controle(`refus à la validation : ${motif}`, contient(erreursDe(corps), motif), JSON.stringify(erreursDe(corps)));
      const dansMain = scenario.validerScenario(lireToml(`${tete}${p('methode = "POST"\nchemin = "/y"\ngarder = { id = "id" }')}\n[[etapes]]\naction = "main"\nmessage = "fiche \${id}"\njusqua = { url = "/" }\n${naviguer}`)).erreurs;
      controle('une variable gardée ne sert pas dans une étape à la main, qui peut précéder la préparation (D20.INV-6)', contient(dansMain, 'variable ${id} gardée par une préparation qui ne la précède pas, ou employée dans une étape à la main'), JSON.stringify(dansMain));
      const permis = scenario.validerScenario(lireToml(`${tete}${p('methode = "POST"\nchemin = "/y"\ngarder = { id = "id" }')}\n[[etapes]]\naction = "naviguer"\nurl = "/clients/\${id}"\n${n('methode = "DELETE"\nchemin = "/y/${id}"\nstatut = [204, 404]')}\n[[etapes]]\naction = "naviguer"\nurl = "/c/\${unique}"\n`)).erreurs;
      controle('une variable gardée sert aux étapes et au nettoyage ; ${unique} sans déclaration', permis.length === 0, JSON.stringify(permis));

      // Traduction contrôlée sans IA, scénarios de préparation.
      const TEXTE = `Scénario: Préparer\n  Adresse : ${base}\n  Profil : r30\n  Étant donné que je me connecte (à la main)\n  Et que le client « <nom> » existe (par l'API)\n  Et que sa fiche est prête (préparation : ouvrir-fiche)\n  Quand je clique sur « Ouvrir »\n  Alors je vois « <nom> »\n  Et le client est supprimé (nettoyage par l'API)\nExemples:\n  | nom |\n  | Zoé <unique> |\n`;
      const cheminTexte = ecrire('r30', 'prep.scenario', TEXTE);
      const SOUS = `format = "scenario-playwright.scenario/1"\ntitre = "Ouvrir la fiche"\nurl_base = "${base}"\nprofil = "r30"\n\n[parametres]\nid = "0"\n\n[[etapes]]\naction = "naviguer"\nurl = "/clients/\${id}"\n`;
      ecrire('r30', 'ouvrir-fiche.toml', SOUS);
      const BON = `format = "scenario-playwright.scenario/1"\ntitre = "Préparer"\nurl_base = "${base}"\nprofil = "r30"\nsource = "prep.scenario"\nempreinte_source = "${texte.empreinteTexte(TEXTE)}"\n\n[[jeux]]\nnom = "Zoé <unique>"\n\n[[etapes]]\nligne = 4\naction = "main"\nmessage = "je me connecte"\njusqua = { url = "/accueil-connecte" }\n\n[[preparation]]\nligne = 5\nmethode = "POST"\nchemin = "/api/donnees/clients"\ncorps = { nom = "\${nom}" }\nstatut = 201\ngarder = { id_client = "id" }\n\n[[preparation]]\nligne = 6\nscenario = "ouvrir-fiche.toml"\nparametres = { id = "\${id_client}" }\n\n[[etapes]]\nligne = 7\naction = "cliquer"\ncible = { role = "link", nom = "Ouvrir" }\n\n[[etapes]]\nligne = 8\naction = "verifier"\ncritere = "contient"\ncible = { role = "heading" }\nattendu = "\${nom}"\n\n[[nettoyage]]\nligne = 9\nmethode = "DELETE"\nchemin = "/api/donnees/clients/\${id_client}"\nstatut = [204, 404]\n`;
      const cheminBon = ecrire('r30', 'prep.toml', BON);
      const lu = scenario.lireScenario(cheminBon);
      controle('traduction fidèle avec préparation, scénario de préparation et nettoyage : acceptée, scénario de préparation chargé (D20.INV-1, D20.INV-5)', lu.scenario !== null && lu.scenario.preparation[1].charge?.scenario.titre === 'Ouvrir la fiche' && !Object.keys(lu.scenario.preparation[1]).includes('charge'), JSON.stringify(lu.erreurs));
      const variante = (f) => { const c = ecrire('r30', 'variante.toml', f(BON)); return scenario.lireScenario(c).erreurs; };
      for (const [f, motif] of [
        [(s) => s.replace('ligne = 5\nmethode', 'ligne = 7\nmethode'), "la ligne 7 n'est pas marquée (par l'API) ni (préparation : …) (D20.INV-1)"],
        [(s) => s.replace('ligne = 6\nscenario = "ouvrir-fiche.toml"\nparametres = { id = "${id_client}" }', 'ligne = 6\nmethode = "POST"\nchemin = "/api/x/${id_client}"'), 'la ligne 6 nomme le scénario ouvrir-fiche : scenario = "ouvrir-fiche.toml" est attendu'],
        [(s) => s.replace('scenario = "ouvrir-fiche.toml"', 'scenario = "autre.toml"'), 'scénario autre.toml, la ligne 6 nomme ouvrir-fiche'],
        [(s) => s.slice(0, s.indexOf('\n[[nettoyage]]')), "marquée (nettoyage par l'API), aucune entrée [[nettoyage]] ne la traduit (D20.INV-1)"],
        [(s) => `${s}\n[[etapes]]\nligne = 5\naction = "naviguer"\nurl = "/"\n`, 'la ligne 5 est une ligne de préparation : elle se traduit dans [[preparation]], pas en étape (D20.INV-1)'],
        [(s) => s.replace('corps = { nom = "${nom}" }', 'corps = { nom = "Zoé" }'), 'la variable <nom> ne se retrouve en ${nom} dans aucune de ses entrées'],
        [(s) => `${s}\n[[preparation]]\nligne = 5\nmethode = "POST"\nchemin = "/api/donnees/clients"\ncorps = { nom = "\${nom} bis" }\n`, "ligne 5 après la ligne 6, l'ordre du texte n'est pas suivi"],
      ]) controle(`traduction refusée : ${motif}`, contient(variante(f), motif), JSON.stringify(variante(f)));
      for (const [sous, motif] of [
        [null, 'scénario introuvable : ouvrir-fiche.toml'],
        [`${SOUS}\n[[jeux]]\nid = "1"\n`, 'ouvrir-fiche.toml a des jeux de valeurs : un scénario de préparation reçoit ses valeurs par parametres (D20.INV-5)'],
        [`${SOUS}\n[[nettoyage]]\nmethode = "DELETE"\nchemin = "/x"\n`, 'ouvrir-fiche.toml a sa propre préparation ou son nettoyage : un scénario de préparation n\'en a pas (D20.INV-5)'],
        [SOUS.replace('profil = "r30"', `profil = "r30"\norigines = ["${base}", "${autre}"]`), `ouvrir-fiche.toml déclare des origines absentes de ce scénario : ${autre} (D20.INV-5)`],
        [SOUS.replace('profil = "r30"', 'profil = "autre"'), 'ouvrir-fiche.toml a le profil autre, ce scénario le profil r30 : un même onglet, un même profil (D20.INV-5)'],
        [SOUS.replace('[parametres]\nid = "0"', '[parametres]\nidentifiant = "0"').replace('${id}', '${identifiant}'), 'parametres.id n\'est pas un paramètre de ouvrir-fiche.toml (identifiant)'],
        [SOUS.replace('action = "naviguer"', 'action = "naviguez"'), 'ouvrir-fiche.toml : étape 1 (ligne 9 du TOML) : action inconnue « naviguez »'],
      ]) {
        const chemin = join(TMP, 'r30', 'ouvrir-fiche.toml');
        if (sous === null) rmSync(chemin, { force: true }); else writeFileSync(chemin, sous);
        const e = scenario.lireScenario(cheminBon).erreurs;
        controle(`scénario de préparation refusé : ${motif}`, contient(e, motif), JSON.stringify(e));
      }
      writeFileSync(join(TMP, 'r30', 'ouvrir-fiche.toml'), SOUS);
      const soi = scenario.lireScenario(ecrire('r30', 'soi.toml', `${tete}\n[[preparation]]\nscenario = "soi.toml"\n${naviguer}`)).erreurs;
      controle('un scénario ne se prépare pas par lui-même', contient(soi, 'un scénario ne se prépare pas par lui-même'), JSON.stringify(soi));
      const lu2 = scenario.lireScenario(cheminBon);
      const { jeux: j1, erreurs: ej } = scenario.preparerJeux(lu2.scenario, lu2.dossier);
      const u1 = j1[0]?.valeurs.unique;
      controle('${unique} : sept caractères propres au jeu, <unique> d\'un exemple remplacé, jusque dans le corps (D20.INV-6)', ej.length === 0 && /^[a-z0-9]{7}$/.test(u1 ?? '') && j1[0].valeurs.nom === `Zoé ${u1}` && j1[0].preparation[0].corps.nom === `Zoé ${u1}`, JSON.stringify([ej, j1[0]?.valeurs]));
      controle('variable gardée : une sentinelle jusqu\'à l\'exécution, lisible en ${…}, jusque dans le scénario de préparation ; la mutation suit la méthode (D20.INV-3)', j1[0]?.nettoyage[0].chemin === '/api/donnees/clients/\u0000id_client\u0000' && scenario.afficherGardees(j1[0].nettoyage[0].chemin) === '/api/donnees/clients/${id_client}' && j1[0].preparation[0].mutation === 'creation' && j1[0].nettoyage[0].mutation === 'suppression' && j1[0].preparation[1].sous.jeu.etapes[0].url === '/clients/\u0000id_client\u0000' && j1[0].preparation[1].sous.jeu.valeurs.unique === u1, JSON.stringify(j1[0]?.nettoyage[0]));
      const r = scenario.resoudreGardees({ a: 'x/\u0000id\u0000', b: ['\u0000autre\u0000'] }, new Map([['id', '42']]));
      controle('valeurs gardées substituées à l\'exécution ; une valeur non obtenue est dite', r.valeur.a === 'x/42' && JSON.stringify(r.manquantes) === '["autre"]', JSON.stringify(r));
      controle('--param unique refusé (D20.INV-6)', contient(scenario.preparerJeux(lu2.scenario, lu2.dossier, { unique: 'x' }).erreurs, '--param unique : variable réservée, propre à chaque exécution (D20.INV-6)'));
      ecrire('r30/donnees', 'client.json', '{ "nom": "Fichier ${unique}", "liste": ["${unique}"] }');
      ecrire('r30/donnees', 'casse.json', '{ "nom": ');
      const deux = scenario.validerScenario(lireToml(`${tete}\n[[jeux]]\nv = "a"\n\n[[jeux]]\nv = "b"\n${p('methode = "POST"\nchemin = "/x"\ncorps_fichier = "donnees/client.json"')}${naviguer}`)).scenario;
      const { jeux: j2 } = scenario.preparerJeux(deux, join(TMP, 'r30'));
      controle('deux jeux, deux ${unique} ; corps_fichier lu, JSON, substitué', j2.length === 2 && j2[0].valeurs.unique !== j2[1].valeurs.unique && j2[0].valeurs.unique.slice(0, 6) === j2[1].valeurs.unique.slice(0, 6) && JSON.stringify(j2[1].preparation[0].corps) === JSON.stringify({ nom: `Fichier ${j2[1].valeurs.unique}`, liste: [j2[1].valeurs.unique] }), JSON.stringify(j2.map((j) => j.preparation[0].corps)));
      const casse = scenario.validerScenario(lireToml(`${tete}${p('methode = "POST"\nchemin = "/x"\ncorps_fichier = "donnees/casse.json"')}${p('methode = "POST"\nchemin = "/x"\ncorps_fichier = "donnees/absent.json"')}${naviguer}`)).scenario;
      const ec = scenario.preparerJeux(casse, join(TMP, 'r30')).erreurs;
      controle('corps_fichier invalide ou absent : refusé avant le navigateur', contient(ec, 'donnees/casse.json n\'est pas un JSON valide') && contient(ec, 'fichier introuvable : donnees/absent.json'), JSON.stringify(ec));
      const plan = scenario.planTraduction(lu2.scenario, lu2.texte);
      controle('plan : chaque entrée sous sa ligne, mutation de l\'appel, total des entrées (D10.INV-1)', plan.includes("l.5  Et que le client « <nom> » existe (par l'API)\n        → préparation : POST /api/donnees/clients { nom = \"${nom}\" } → 201 ; garder id_client = id  [création]") && plan.includes('→ préparation : scénario ouvrir-fiche.toml { id = "${id_client}" }') && plan.includes('→ nettoyage : DELETE /api/donnees/clients/${id_client} → 204 ou 404  [suppression]') && plan.includes('préparation : 2, nettoyage : 1, qui modifient des données'), plan);
      controle('ce qui modifie des données : appels, et scénario de préparation qui en a (D7.INV-2, D20.INV-3)', JSON.stringify(scenario.mutationsDe(lu2.scenario)) === '["préparation 1","nettoyage 1"]', JSON.stringify(scenario.mutationsDe(lu2.scenario)));
      const v = await lancer('verifier.mjs', [cheminTexte, cheminBon, '--plan']);
      controle('verifier.mjs : texte et marques, scénario et ses entrées, ce qui modifie des données, plan ; code 0', v.code === 0 && v.sortie.includes("(l.4 à la main, l.5 par l'API, l.6 préparation : ouvrir-fiche, l.9 nettoyage par l'API)") && v.sortie.includes('ok  prep.toml : « Préparer », 3 étapes (et 2 en préparation, 1 en nettoyage), 1 jeux, traduit de prep.scenario') && v.sortie.includes('note prep.toml : modifient des données : préparation 1, nettoyage 1') && !v.sortie.includes('donnée fixe'), v.sortie + v.erreurs);
      const fixe = ecrire('r30', 'fixe.toml', `${tete}${naviguer}${n('methode = "DELETE"\nchemin = "/api/donnees/clients/7"')}`);
      const vf = await lancer('verifier.mjs', [fixe]);
      controle('nettoyage d\'une donnée fixe, sans valeur gardée ni ${unique} : noté avant la ratification, code 0 (D20.INV-4)', vf.code === 0 && vf.sortie.includes('note fixe.toml : nettoyage d\'une donnée fixe, sans valeur gardée ni ${unique} : nettoyage 1 (DELETE /api/donnees/clients/7)'), vf.sortie);
      const parJeux = ecrire('r30', 'fixe-jeux.toml', `${tete}\n[parametres]\nville = "Lyon"\n\n[[jeux]]\nnom = "A <unique>"\n\n[[jeux]]\nnom = "B \${unique}"\n${naviguer}${n('methode = "DELETE"\nchemin = "/api/donnees/clients/${nom}"')}${n('methode = "DELETE"\nchemin = "/api/donnees/clients/${ville}"')}`);
      const vj = await lancer('verifier.mjs', [parJeux]);
      const vj2 = await lancer('verifier.mjs', [parJeux, '--param', 'nom=Fixe']);
      controle('nettoyage par une variable dont chaque valeur contient ${unique} : non noté ; une valeur fixe donnée par --param : notée (D20.INV-4)', vj.code === 0 && vj.sortie.includes('note fixe-jeux.toml : nettoyage d\'une donnée fixe, sans valeur gardée ni ${unique} : nettoyage 2 (DELETE /api/donnees/clients/${ville})') && !vj.sortie.includes('nettoyage 1 (') && vj2.sortie.includes(': nettoyage 1 (DELETE /api/donnees/clients/${nom}) ; nettoyage 2 ('), vj.sortie + vj2.sortie);
      const loin = distante ?? 'http://127.0.0.2:9';
      const avantDonnees = app.etat.requetesDonnees.length;
      const rd = await jouer(ecrire('r30', 'distant.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Distant"\nurl_base = "${loin}"\n${p('methode = "POST"\nchemin = "/api/donnees/clients"\ncorps = { nom = "D" }')}${naviguer}`));
      controle('préparation par l\'API hors du poste : refus avant le navigateur sans --autoriser-mutations, code 2, aucun appel (D7.INV-2, D20.INV-3)', rd.code === 2 && rd.erreurs.includes(`le scénario modifie des données (préparation 1) et déclare des origines hors du poste (${loin})`) && rd.erreurs.includes('(D7.INV-2, D20.INV-3)') && rd.dossier === null && app.etat.requetesDonnees.length === avantDonnees, rd.erreurs);
      ecrire('r30', 'avec-main.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Avec main"\nurl_base = "${base}"\n\n[[etapes]]\naction = "main"\nmessage = "agir"\njusqua = { url = "/" }\ndelai = 5\n`);
      const rs = await jouer(ecrire('r30', 'sans-tete.toml', `${tete}${p('scenario = "avec-main.toml"')}${naviguer}`), ['--sans-tete']);
      controle('--sans-tete refusé quand un scénario de préparation a une étape à la main (D6.INV-3)', rs.code === 2 && rs.erreurs.includes('le scénario, ou un scénario de préparation, a une étape à la main'), rs.erreurs);
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R31', 'Index : classes de corps des endpoints, propositions d\'écriture pour une ligne de préparation');
    {
      const d = join(TMP, 'r31');
      const projet = join(d, 'projet');
      const sc = join(d, 'scenarios');
      mkdirSync(sc, { recursive: true });
      ecrireProjetDemo(projet);
      const x = await lancer('indexer.mjs', [projet, '--dossier', sc]);
      const ix = existsSync(join(sc, 'index', 'code.json')) ? JSON.parse(readFileSync(join(sc, 'index', 'code.json'), 'utf8')) : { modeles: [], endpoints: [], validations: [] };
      const md = (c) => ix.modeles.find((m) => m.classe === c);
      controle('classes de corps : classe Java à champs, data class Kotlin, schéma OpenAPI ; seules celles des corps des endpoints', x.code === 0 && JSON.stringify(ix.modeles.map((m) => `${m.classe} ${m.origine}`)) === JSON.stringify(['ClientDto java', 'FiltreDto kotlin', 'Fournisseur openapi']) && JSON.stringify(md('ClientDto')?.champs) === JSON.stringify([{ nom: 'nom', type: 'String' }, { nom: 'ville', type: 'String' }, { nom: 'courriel', type: 'String' }]) && JSON.stringify(md('FiltreDto')?.champs) === JSON.stringify([{ nom: 'filtre', type: 'String' }, { nom: 'ville', type: 'String?' }]) && JSON.stringify(md('Fournisseur')?.champs) === JSON.stringify([{ nom: 'raison', type: 'string', requis: true }, { nom: 'siret', type: 'string' }, { nom: 'creation', type: 'string(date)' }]), JSON.stringify(ix.modeles));
      controle('corps d\'une opération OpenAPI (requestBody) et d\'un endpoint Kotlin ; sources', ix.endpoints.find((e) => e.chemin === '/api/fournisseurs')?.corps === 'Fournisseur' && ix.endpoints.find((e) => e.chemin === '/api/export/filtres')?.corps === 'FiltreDto' && md('ClientDto')?.source === 'back/src/main/java/demo/ClientDto.java:3' && /^back\/openapi\.yaml:\d+$/.test(md('Fournisseur')?.source ?? ''), JSON.stringify(ix.modeles.map((m) => m.source)));
      const mdtexte = existsSync(join(sc, 'index', 'code.md')) ? readFileSync(join(sc, 'index', 'code.md'), 'utf8') : '';
      controle('code.md : classes de corps, l\'endpoint qui les reçoit, leurs champs', mdtexte.includes('## Classes de corps (3)') && mdtexte.includes('- ClientDto (corps de POST /api/clients) : nom String, ville String, courriel String — back/src/main/java/demo/ClientDto.java:3') && mdtexte.includes('- Fournisseur (corps de POST /api/fournisseurs) : raison string (requis), siret string, creation string(date)'), mdtexte.slice(mdtexte.indexOf('## Classes'), mdtexte.indexOf('## Classes') + 600));
      const c1 = code.candidatsAppel(ix, 'le client « <nom> » existe');
      controle('propositions d\'écriture : endpoints dont un segment du chemin ou la classe correspond à un mot de la phrase, corps et contraintes (D18.INV-4)', c1[0] === "# index du code, endpoints d'écriture pour cette ligne (propositions à vérifier) :" && c1[1]?.startsWith('#   methode = "POST", chemin = "/api/clients"  # back/src/main/java/demo/ClientController.java:') && c1[1].endsWith(', corps ClientDto, statut 201') && c1[2]?.startsWith('#   methode = "DELETE", chemin = "/api/clients/{nom}"') && c1.at(-1)?.startsWith('#   corps ClientDto : nom String (NotBlank, Size max 40), ville String (NotNull), courriel String (Email)') && !c1.some((l) => l.includes('"GET"')), JSON.stringify(c1));
      const c2 = code.candidatsAppel(ix, 'le fournisseur existe, créé par /api/fournisseurs');
      controle('chemin cité : son endpoint, et les champs requis du schéma', c2.length === 3 && c2[1].startsWith('#   methode = "POST", chemin = "/api/fournisseurs"  # back/openapi.yaml:') && c2[2].startsWith('#   corps Fournisseur : raison string requis, siret string, creation string(date)'), JSON.stringify(c2));
      controle('aucun endpoint pour la phrase : aucune proposition', code.candidatsAppel(ix, 'la météo est clémente').length === 0 && JSON.stringify(code.motsDe('Les « Zoé » clients existent <nom>')) === '["client"]');
      ecrire('r31/scenarios', 'creer.scenario', `Scénario: Créer\n  Adresse : ${base}\n  Étant donné que le client « Zoé » existe (par l'API)\n  Quand je clique sur « Clients »\n`);
      const t = await lancer('traduire.mjs', [join(sc, 'creer.scenario')]);
      const sq = existsSync(join(sc, 'creer.toml')) ? readFileSync(join(sc, 'creer.toml'), 'utf8') : '';
      controle('squelette : endpoints et corps proposés en commentaire sous le bloc de préparation, l\'appel reste à compléter (D18.INV-4)', t.code === 0 && /\[\[preparation\]\]\nligne = 3\nmethode = "à compléter"\nchemin = "\/…"\n# corps = .*\n# index du code, endpoints d'écriture pour cette ligne \(propositions à vérifier\) :\n# {3}methode = "POST", chemin = "\/api\/clients"/.test(sq) && sq.includes('#   corps ClientDto : nom String (NotBlank, Size max 40)') && /index du code : (?:1 étape|2 étapes) avec des propositions/.test(t.sortie) && t.sortie.includes('1 étape à compléter, une par ligne d\'étape du texte, et 1 entrée de préparation ou de nettoyage'), sq + t.sortie);
      const inconnu = ecrire('r31/scenarios', 'inconnu.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Inconnu"\nurl_base = "${base}"\n\n[[preparation]]\nmethode = "POST"\nchemin = "/api/inconnu"\n\n[[etapes]]\naction = "naviguer"\nurl = "/"\n`);
      const vi = await lancer('verifier.mjs', [inconnu]);
      controle('chemin d\'une préparation absent de l\'index : noté, sans changer le code (D18.INV-4)', vi.code === 0 && vi.sortie.includes('chemins absents de l\'index du code : préparation 1 POST /api/inconnu'), vi.sortie);
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R32', 'Préparation et nettoyage par l\'API, avec la session du navigateur et le jeton anti-CSRF recopié : valeur gardée, ${unique}, rapport, secrets masqués');
    // Délai long : la première adresse d'un profil neuf peut dépasser 10 s sur une machine d'intégration chargée.
    const tete32 = (titre, profil) => `format = "scenario-playwright.scenario/1"\ntitre = "${titre}"\nurl_base = "${base}"\nprofil = "${profil}"\ndelai = 30\n`;
    const etape32 = (champs) => `\n[[etapes]]\n${champs}\n`;
    const prep32 = (champs) => `\n[[preparation]]\n${champs}\n`;
    const nett32 = (champs) => `\n[[nettoyage]]\n${champs}\n`;
    {
      const connexion = (csrf = '') => `${etape32(`ligne = 1\naction = "naviguer"\nurl = "/connexion?auto=300${csrf ? `&csrf=${csrf}` : ''}"`)}${etape32('ligne = 2\naction = "main"\nmessage = "Connectez-vous"\njusqua = { url = "/accueil-connecte" }')}`;
      const creer = prep32('ligne = 3\nmethode = "POST"\nchemin = "/api/donnees/clients"\ncorps = { nom = "Client ${unique}", ville = "Lyon" }\nstatut = 201\ngarder = { id_client = "id" }');
      const supprimer = nett32('ligne = 7\nmethode = "DELETE"\nchemin = "/api/donnees/clients/${id_client}"\nstatut = 204');
      const avant = app.etat.requetesDonnees.length;
      const r1 = await jouer(ecrire('r32', 'api.toml', `${tete32('Préparation par l\'API', 'r32')}${connexion()}${creer}${etape32('ligne = 4\naction = "naviguer"\nurl = "/clients/${id_client}"')}${etape32('ligne = 5\naction = "verifier"\ncritere = "contient"\ncible = { role = "heading" }\nattendu = "Client ${unique}"')}${etape32('ligne = 6\naction = "verifier"\ncritere = "api"\nchemin = "/api/donnees/clients/${id_client}"\nattendu = { contient = { ville = "Lyon" } }')}${supprimer}`));
      const j1 = r1.rapport?.jeux[0];
      const u = j1?.valeurs.unique;
      const p1 = j1?.preparation[0];
      const n1 = j1?.nettoyage[0];
      const notes = app.etat.requetesDonnees.slice(avant);
      const ecritures = notes.filter((x) => x.methode !== 'GET');
      controle('préparation après la connexion, étapes, nettoyage : joués, code 0 ; la valeur gardée sert aux étapes et au nettoyage (D20.INV-6)', r1.code === 0 && j1?.statut === 'reussi' && p1?.statut === 'reussie' && n1?.statut === 'reussie' && j1.etapes.length === 5 && j1.etapes.every((e) => e.statut === 'reussie') && /^\d+$/.test(j1.gardees.id_client ?? ''), r1.sortie + JSON.stringify(j1));
      controle('appels : session du navigateur, jeton anti-CSRF recopié dans X-XSRF-TOKEN, aucun en-tête Authorization, corps JSON (D20.INV-2)', ecritures.length === 2 && ecritures.every((x) => x.session && x.csrf === 'X-XSRF-TOKEN' && !x.autorisation) && ecritures[0].corps === JSON.stringify({ nom: `Client ${u}`, ville: 'Lyon' }) && ecritures[0].type === 'application/json' && ecritures[1].methode === 'DELETE', JSON.stringify(notes));
      controle('${unique} : sept caractères, dans le nom créé ; le client créé, vu à l\'écran, puis supprimé', /^[a-z0-9]{7}$/.test(u ?? '') && app.etat.donnees.size === 0 && !app.etat.clients.some((c) => c.nom === `Client ${u}`) && j1.etapes[3]?.resume === `vérifier getByRole('heading') contient « Client ${u} »` && j1.etapes[2]?.resume === `naviguer /clients/${j1.gardees.id_client}`, JSON.stringify([u, [...app.etat.donnees.values()], j1?.etapes.map((e) => e.resume)]));
      controle('rapport : entrée de préparation (appel, statut, valeur gardée, mutation), nettoyage, bilan (E1)', JSON.stringify(Object.keys(p1 ?? {})) === JSON.stringify(['numero', 'ligne', 'genre', 'type', 'resume', 'mutation', 'statut', 'duree_ms', 'message', 'appel', 'gardees', 'scenario', 'etapes', 'capture', 'aria']) && p1.appel.methode === 'POST' && p1.appel.adresse === `${base}/api/donnees/clients` && p1.appel.statut === 201 && p1.appel.octets > 0 && JSON.stringify(p1.gardees) === '["id_client"]' && p1.mutation === 'creation' && p1.ligne === 3 && n1.appel.statut === 204 && n1.mutation === 'suppression' && n1.resume === `DELETE /api/donnees/clients/${j1.gardees.id_client} → 204  [suppression]` && r1.rapport.bilan.preparations === 1 && r1.rapport.bilan.nettoyages === 1 && r1.rapport.bilan.nettoyages_en_echec === 0, JSON.stringify([p1, n1, r1.rapport?.bilan]));
      const md = lire(r1.dossier ?? TMP, 'rapport.md');
      controle('rapport.md : sections Préparation et Nettoyage, valeurs gardées ; sortie : p1 et n1 avec leur statut', md.includes('## Préparation') && md.includes('## Nettoyage') && md.includes(`Valeurs gardées : id_client = ${j1?.gardees.id_client}`) && /^ {2}ok {2}p1\. préparation : POST \/api\/donnees\/clients .* → 201$/m.test(r1.sortie) && /^ {2}ok {2}n1\. nettoyage : DELETE .* → 204$/m.test(r1.sortie) && /préparation : 1, nettoyage : 1$/m.test(r1.sortie), md.slice(0, 1200) + r1.sortie);
      controle('jeton anti-CSRF ni dans le rapport ni dans la sortie (D20.INV-2)', !lire(r1.dossier ?? TMP, 'rapport.json').includes(JETON_CSRF_DEMO) && !md.includes(JETON_CSRF_DEMO) && !r1.sortie.includes(JETON_CSRF_DEMO));
      const avantD = app.etat.requetesDonnees.length;
      const r2 = await jouer(ecrire('r32', 'django.toml', `${tete32('Jeton de Django', 'r32-django')}${connexion('django')}${creer}${etape32('ligne = 4\naction = "verifier"\ncritere = "api"\nchemin = "/api/donnees/clients/${id_client}"')}${supprimer}`));
      const nd = app.etat.requetesDonnees.slice(avantD).filter((x) => x.methode !== 'GET');
      controle('jeton de Django : cookie csrftoken recopié dans X-CSRFToken', r2.code === 0 && nd.length === 2 && nd.every((x) => x.csrf === 'X-CSRFToken'), r2.sortie + JSON.stringify(nd));
      const r3 = await jouer(ecrire('r32', 'sans-session.toml', `${tete32('Sans session', 'r32-sans')}${prep32('methode = "POST"\nchemin = "/api/donnees/clients"\ncorps = { nom = "X" }\ngarder = { id_client = "id" }')}${etape32('action = "naviguer"\nurl = "/"')}${nett32('methode = "DELETE"\nchemin = "/api/donnees/clients/${id_client}"')}`));
      const j3 = r3.rapport?.jeux[0];
      controle('sans session : 401 avec la conduite à tenir ; étapes non jouées, code 1 (D20.INV-2)', r3.code === 1 && j3?.preparation[0]?.statut === 'echec' && j3.preparation[0].message === `POST ${base}/api/donnees/clients : attendu : un statut 2xx ; obtenu : statut 401 (l'API ne reconnaît pas la session du navigateur : se connecter à la main avant la préparation, ou, pour une API à jeton, préparer par un scénario (module donnees))` && j3.etapes[0].statut === 'non_jouee' && j3.etapes[0].message === 'non jouée : la préparation 1 a échoué', JSON.stringify(j3));
      controle('nettoyage d\'une valeur non obtenue : non joué (D20.INV-4) ; avant la première adresse, aucune page à montrer en preuve (D8.INV-2)', j3?.nettoyage[0]?.statut === 'non_jouee' && j3.nettoyage[0].message === "non jouée : ${id_client} non obtenue, sa préparation n'a pas abouti (D20.INV-4)" && j3.preparation[0].capture === null && j3.preparation[0].aria === null, JSON.stringify([j3?.preparation[0], j3?.nettoyage[0]]));
      const r4 = await jouer(ecrire('r32', 'sans-csrf.toml', `${tete32('Sans jeton anti-CSRF', 'r32-csrf')}${connexion('aucun')}${prep32('ligne = 3\nmethode = "POST"\nchemin = "/api/donnees/clients"\ncorps = { nom = "Y" }')}${etape32('ligne = 4\naction = "naviguer"\nurl = "/"')}`));
      controle('session sans cookie anti-CSRF : 403 avec la conduite à tenir', r4.code === 1 && /obtenu : statut 403 \(accès refusé : droits de l'utilisateur, ou jeton anti-CSRF absent ou refusé\)$/.test(r4.rapport?.jeux[0]?.preparation[0].message ?? ''), r4.sortie);
      const p4 = r4.rapport?.jeux[0]?.preparation[0];
      controle('preuves de l\'échec d\'une préparation, sur la page ouverte : capture et instantané ARIA (D8.INV-2)', p4?.capture === 'captures/p1-preparation-echec.png' && existsSync(join(r4.dossier ?? TMP, 'captures', 'p1-preparation-echec.png')) && p4.aria === 'aria/p1-preparation.yml' && existsSync(join(r4.dossier ?? TMP, 'aria', 'p1-preparation.yml')), JSON.stringify(p4));
      ecrire('r32/donnees', 'client.json', '{ "nom": "Fichier ${unique}", "ville": "Nantes" }');
      const r5 = await jouer(ecrire('r32', 'divers.toml', `${tete32('Divers', 'r32')}${prep32('methode = "POST"\nchemin = "/api/donnees/clients"\ncorps_fichier = "donnees/client.json"\nstatut = [200, 201]\ngarder = { id_fichier = "id", nom_fichier = "nom" }')}${prep32('methode = "POST"\nchemin = "/api/donnees/jetons"\ngarder = { jeton_acces = "jeton_acces", id_jeton = "id" }')}${prep32(`methode = "POST"\nchemin = "/api/donnees/jetons?source=essai&jeton=${JETON_REQUETE_DEMO}"`)}${etape32('action = "verifier"\ncritere = "api"\nchemin = "/api/donnees/clients/${id_fichier}"\nattendu = { contient = { ville = "Nantes" } }')}${etape32('action = "naviguer"\nurl = "/?ref=${jeton_acces}"')}${nett32('methode = "DELETE"\nchemin = "/api/donnees/clients/${id_fichier}"\nstatut = [204, 404]')}${nett32('methode = "DELETE"\nchemin = "/api/donnees/clients/${id_fichier}"\nstatut = [204, 404]')}${nett32('methode = "DELETE"\nchemin = "/api/donnees/clients/${jeton_acces}"\nstatut = [204, 404]')}`));
      const j5 = r5.rapport?.jeux[0];
      controle('profil où la session est ouverte : corps_fichier lu et substitué, plusieurs valeurs gardées, statut parmi une liste', r5.code === 0 && j5?.preparation[0]?.statut === 'reussie' && j5.gardees.nom_fichier === `Fichier ${j5.valeurs.unique}` && j5.etapes[0].statut === 'reussie', r5.sortie + JSON.stringify(j5));
      controle('valeur gardée au nom de secret : masquée dans le rapport, même courte, absente de ses fichiers et de la sortie (D20.INV-2)', j5?.gardees.jeton_acces === '***' && j5.gardees.id_jeton === '***' && !lire(r5.dossier ?? TMP, 'rapport.json').includes(JETON_GARDE_DEMO) && !lire(r5.dossier ?? TMP, 'rapport.md').includes(JETON_GARDE_DEMO) && !r5.sortie.includes(JETON_GARDE_DEMO), JSON.stringify(j5?.gardees));
      controle('paramètre de requête au nom de secret : masqué dans l\'appel relevé et le résumé, absent du rapport et de la sortie (D20.INV-2)', j5?.preparation[2]?.appel?.adresse === `${base}/api/donnees/jetons?source=essai&jeton=***` && j5.preparation[2].resume === 'POST /api/donnees/jetons?source=essai&jeton=***  [création]' && !lire(r5.dossier ?? TMP, 'rapport.json').includes(JETON_REQUETE_DEMO) && !lire(r5.dossier ?? TMP, 'rapport.md').includes(JETON_REQUETE_DEMO) && !r5.sortie.includes(JETON_REQUETE_DEMO), JSON.stringify(j5?.preparation[2]));
      controle('valeur gardée au nom de secret, réemployée par une étape et un appel : masquée par sa valeur dans le résumé, l\'adresse et la sortie (D20.INV-2)', j5?.etapes[1]?.statut === 'reussie' && j5.etapes[1].resume.includes('ref=***') && j5.nettoyage[2]?.appel?.adresse === `${base}/api/donnees/clients/***` && j5.nettoyage[2].resume === 'DELETE /api/donnees/clients/*** → 204 ou 404  [suppression]' && r5.sortie.includes('ref=***') && !r5.sortie.includes(JETON_GARDE_DEMO), JSON.stringify([j5?.etapes[1], j5?.nettoyage[2]]));
      controle('chaque entrée jouée une fois : le second nettoyage reçoit 404, accepté (D5.INV-3)', j5?.nettoyage.map((x) => x.appel?.statut).join() === '204,404,404' && j5.nettoyage.every((x) => x.statut === 'reussie'), JSON.stringify(j5?.nettoyage));
      app.etat.requetesAutre.length = 0;
      const r6 = await jouer(ecrire('r32', 'redirection.toml', `${tete32('Redirection', 'r32')}${prep32('methode = "POST"\nchemin = "/api/donnees/redirection"')}${etape32('action = "naviguer"\nurl = "/"')}`));
      controle('redirection : non suivie, l\'autre origine jamais jointe, adresse masquée (D20.INV-2)', r6.code === 1 && r6.rapport?.jeux[0]?.preparation[0].message === `POST ${base}/api/donnees/redirection : l'API répond 302, redirection vers ${autre}/api/clients?jeton=*** non suivie (D20.INV-2)` && app.etat.requetesAutre.length === 0, r6.sortie);
      const r7 = await jouer(ecrire('r32', 'reponses.toml', `${tete32('Réponses', 'r32')}\n[[jeux]]\nforme = "gros"\n\n[[jeux]]\nforme = "texte"\n\n[[jeux]]\nforme = "vide"\n\n[[jeux]]\nforme = "objet"\n${prep32('methode = "POST"\nchemin = "/api/donnees/reponse?forme=${forme}"\ngarder = { v = "valeur" }')}${etape32('action = "naviguer"\nurl = "/"')}`));
      const m7 = (r7.rapport?.jeux ?? []).map((j) => j.preparation[0].message);
      const appel7 = `POST ${base}/api/donnees/reponse?forme=`;
      controle('valeur à garder : réponse de plus de 1 Mio non lue, réponse non JSON, valeur absente ou qui n\'est pas simple ; aucune valeur gardée, étapes non jouées (D20.INV-2)', r7.code === 1 && JSON.stringify(m7) === JSON.stringify([`${appel7}gros : réponse de plus de 1048576 octets, non lue : aucune valeur gardée`, `${appel7}texte : réponse non JSON : aucune valeur gardée`, `${appel7}vide : valeur « valeur » absente de la réponse : v non gardée`, `${appel7}objet : « valeur » n'est pas une valeur simple de la réponse : v non gardée`]) && r7.rapport.jeux[0].preparation[0].appel.octets > 1048576 && r7.rapport.jeux.every((j) => Object.keys(j.gardees).length === 0 && j.etapes[0].statut === 'non_jouee'), JSON.stringify(m7));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R33', 'Nettoyage après un échec, une fois par entrée ; nettoyage en échec signalé sans changer le statut ; préparation en échec ; plusieurs jeux');
    {
      const avant = app.etat.requetesDonnees.length;
      const r1 = await jouer(ecrire('r33', 'echec.toml', `${tete32('Échec puis nettoyage', 'r32')}${prep32('methode = "POST"\nchemin = "/api/donnees/clients"\ncorps = { nom = "Echec ${unique}" }\ngarder = { id = "id" }')}${etape32('action = "naviguer"\nurl = "/clients/${id}"')}${etape32('action = "verifier"\ncritere = "contient"\ncible = { role = "heading" }\nattendu = "Inexistant"\ndelai = 1')}${etape32('action = "naviguer"\nurl = "/"')}${nett32('methode = "DELETE"\nchemin = "/api/donnees/clients/${id}"\nstatut = 204')}`));
      const j1 = r1.rapport?.jeux[0];
      const suppressions = app.etat.requetesDonnees.slice(avant).filter((x) => x.methode === 'DELETE');
      controle('après une étape en échec : le nettoyage se joue, une seule fois ; code 1 (D20.INV-4, D5.INV-3)', r1.code === 1 && j1?.etapes[1]?.statut === 'echec' && j1.etapes[2].statut === 'non_jouee' && j1.nettoyage[0].statut === 'reussie' && suppressions.length === 1 && !app.etat.clients.some((c) => c.nom.startsWith('Echec ')), JSON.stringify(j1?.nettoyage) + JSON.stringify(suppressions));
      const r2 = await jouer(ecrire('r33', 'nettoyage-ko.toml', `${tete32('Nettoyage en échec', 'r32')}${etape32('action = "naviguer"\nurl = "/"')}${nett32('methode = "DELETE"\nchemin = "/api/donnees/clients/999999"\nstatut = 204')}${nett32('methode = "DELETE"\nchemin = "/api/donnees/clients/999998"\nstatut = 404')}`));
      controle('nettoyage en échec : signalé, le statut et le code restent ceux des étapes, les entrées suivantes jouées (D20.INV-4)', r2.code === 0 && r2.rapport?.statut === 'reussi' && r2.rapport.jeux[0].nettoyage_en_echec === 1 && r2.rapport.bilan.nettoyages_en_echec === 1 && r2.rapport.jeux[0].nettoyage[1]?.statut === 'reussie' && r2.sortie.includes(`AVERTISSEMENT nettoyage 1 en échec : DELETE ${base}/api/donnees/clients/999999 : attendu : statut 204 ; obtenu : statut 404 ; des données de l'exécution peuvent rester (D20.INV-4)`) && /dont 1 en échec$/m.test(r2.sortie) && lire(r2.dossier ?? TMP, 'rapport.md').includes('**Nettoyage en échec** (1)'), r2.sortie);
      const avant3 = app.etat.requetesDonnees.length;
      const r3 = await jouer(ecrire('r33', 'preparation-ko.toml', `${tete32('Préparation en échec', 'r32')}${prep32('methode = "POST"\nchemin = "/api/donnees/clients"\ncorps = { ville = "Lyon" }\nstatut = 201\ngarder = { id = "id" }')}${prep32('methode = "POST"\nchemin = "/api/donnees/clients"\ncorps = { nom = "Jamais" }')}${etape32('action = "naviguer"\nurl = "/"')}${nett32('methode = "DELETE"\nchemin = "/api/donnees/clients/${id}"')}${nett32('methode = "DELETE"\nchemin = "/api/donnees/clients/0"\nstatut = 404')}`));
      const j3 = r3.rapport?.jeux[0];
      controle('préparation en échec : attendu et obtenu, un seul appel, rien de rejoué ; préparation suivante et étapes non jouées ; code 1 (D5.INV-3)', r3.code === 1 && j3?.preparation[0]?.message === `POST ${base}/api/donnees/clients : attendu : statut 201 ; obtenu : statut 400` && app.etat.requetesDonnees.slice(avant3).filter((x) => x.methode === 'POST').length === 1 && j3.preparation[1].statut === 'non_jouee' && j3.preparation[1].message === 'non jouée : la préparation 1 a échoué' && j3.etapes[0].message === 'non jouée : la préparation 1 a échoué' && !app.etat.clients.some((c) => c.nom === 'Jamais'), JSON.stringify(j3));
      controle('nettoyage après une préparation en échec : l\'entrée qui ne dépend d\'aucune valeur gardée jouée, l\'autre non (D20.INV-4)', j3?.nettoyage[0]?.statut === 'non_jouee' && j3.nettoyage[1].statut === 'reussie' && j3.nettoyage[1].appel.statut === 404, JSON.stringify(j3?.nettoyage));
      const r4 = await jouer(ecrire('r33', 'jeux.toml', `${tete32('Plusieurs jeux', 'r32')}\n[[jeux]]\nville = "Lyon"\n\n[[jeux]]\nville = "Nice"\n${prep32('methode = "POST"\nchemin = "/api/donnees/clients"\ncorps = { nom = "Jeu ${unique}", ville = "${ville}" }\ngarder = { id = "id" }')}${etape32('action = "verifier"\ncritere = "api"\nchemin = "/api/donnees/clients/${id}"\nattendu = { contient = { ville = "${ville}" } }')}${nett32('methode = "DELETE"\nchemin = "/api/donnees/clients/${id}"')}`));
      const jx = r4.rapport?.jeux ?? [];
      controle('plusieurs jeux : chacun sa préparation, son ${unique}, sa valeur gardée et son nettoyage (D20.INV-6)', r4.code === 0 && jx.length === 2 && jx[0].valeurs.unique !== jx[1].valeurs.unique && jx[0].gardees.id !== jx[1].gardees.id && jx.every((j) => j.preparation[0].statut === 'reussie' && j.nettoyage[0].statut === 'reussie') && !app.etat.clients.some((c) => c.nom.startsWith('Jeu ')), r4.sortie + JSON.stringify(jx.map((j) => [j.valeurs, j.gardees])));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R34', 'Garde des mutations pour la préparation, et préparation par l\'écran : scénario ratifié joué dans le même onglet');
    {
      if (!distante) {
        saut('préparation autorisée hors du poste', '127.0.0.2 indisponible sur ce système');
        saut('garde à l\'appel par le moteur', '127.0.0.2 indisponible sur ce système');
      } else {
        const avant = app.etat.requetesDonnees.length;
        const distant = ecrire('r34', 'distant.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Distant"\nurl_base = "${distante}"\n\n[[preparation]]\nmethode = "POST"\nchemin = "/api/donnees/clients"\ncorps = { nom = "D" }\n\n[[etapes]]\naction = "naviguer"\nurl = "/"\n`);
        const r1 = await jouer(distant, ['--autoriser-mutations']);
        controle('avec --autoriser-mutations : l\'appel part hors du poste (401, sans session sur cette origine), noté au rapport', r1.code === 1 && app.etat.requetesDonnees.length === avant + 1 && r1.rapport?.options.mutations_autorisees === true && /obtenu : statut 401/.test(r1.rapport.jeux[0].preparation[0].message), r1.sortie);
        const sc = scenario.validerScenario(lireToml(readFileSync(distant, 'utf8'))).scenario;
        const { jeux } = scenario.preparerJeux(sc, join(TMP, 'r34'));
        const ctx = await session.ouvrirNavigateur({ canal, profil: join(TMP, 'profils', 'r34-api') });
        try {
          const dossier = rapport.dossierResultats(join(TMP, 'r34', 'api'), 'distant');
          const journal = await session.garderOrigines(ctx, sc.origines);
          const joues = await moteur.jouerScenario(ctx, { scenario: sc, jeux, resultats: dossier, journal, delai: 10, autoriserMutations: false });
          const p = joues[0].preparation[0];
          controle('garde à l\'appel par le moteur (E3) : hors du poste sans autorisation, aucun appel fait (D7.INV-2)', p.statut === 'echec' && p.message === `appel POST sur ${distante}, hors du poste, sans --autoriser-mutations : aucun appel fait (D7.INV-2)` && app.etat.requetesDonnees.length === avant + 1 && joues[0].etapes[0].statut === 'non_jouee', JSON.stringify(p));
        } finally {
          await fermer(ctx);
        }
      }
      const CREER = (attendu) => `format = "scenario-playwright.scenario/1"\ntitre = "Créer un client par l'écran"\nurl_base = "${base}"\nprofil = "r34"\ndelai = 30\n\n[parametres]\nnom = "Personne"\n\n[[etapes]]\naction = "naviguer"\nurl = "/clients/nouveau"\n\n[[etapes]]\naction = "saisir"\ncible = { libelle = "Nom" }\nvaleur = "\${nom}"\n\n[[etapes]]\naction = "cliquer"\ncible = { role = "button", nom = "Enregistrer" }\nmutation = "creation"\n\n[[etapes]]\naction = "verifier"\ncritere = "contient"\ncible = { role = "alert" }\nattendu = "${attendu}"\ndelai = 3\n`;
      ecrire('r34', 'creer-client.toml', CREER('Client ${nom} créé'));
      const PRINCIPAL = (sous, prefixe) => `format = "scenario-playwright.scenario/1"\ntitre = "Préparé par l'écran"\nurl_base = "${base}"\nprofil = "r34"\ndelai = 30\n\n[[preparation]]\nscenario = "${sous}"\nparametres = { nom = "${prefixe}-\${unique}" }\n\n[[etapes]]\naction = "naviguer"\nurl = "/clients"\n\n[[etapes]]\naction = "verifier"\ncritere = "contient"\ncible = { role = "table" }\nattendu = "${prefixe}-\${unique}"\n\n[[nettoyage]]\nmethode = "DELETE"\nchemin = "/api/clients/${prefixe}-\${unique}"\n`;
      const principal = ecrire('r34', 'ecran.toml', PRINCIPAL('creer-client.toml', 'Ecran'));
      const lu = scenario.lireScenario(principal);
      controle('un scénario de préparation qui modifie des données compte pour la garde (D20.INV-3)', JSON.stringify(scenario.mutationsDe(lu.scenario)) === '["préparation 1 (creer-client.toml)","nettoyage 1"]', JSON.stringify(lu.erreurs));
      const r3 = await jouer(principal);
      const j = r3.rapport?.jeux[0];
      const p = j?.preparation[0];
      const nom = `Ecran-${j?.valeurs.unique}`;
      controle('préparation par l\'écran : le scénario ratifié joué dans le même onglet avec ses paramètres et le même ${unique}, ses étapes au rapport sous l\'entrée (D20.INV-5)', r3.code === 0 && p?.type === 'scenario' && p.scenario === 'creer-client.toml' && p.appel === null && p.etapes?.length === 4 && p.etapes.every((e) => e.statut === 'reussie') && p.etapes[1].resume === `saisir « ${nom} » dans getByLabel('Nom')` && p.resume === `scénario creer-client.toml { nom = "${nom}" }` && app.etat.ajouts.some((c) => c.nom === nom) && j.etapes.every((e) => e.statut === 'reussie'), r3.sortie + JSON.stringify(j));
      controle('captures du scénario de préparation préfixées par son entrée ; sortie en retrait ; nettoyage par l\'API ensuite', p?.etapes[3]?.capture === 'captures/p1-04-verifier.png' && existsSync(join(r3.dossier ?? TMP, 'captures', 'p1-04-verifier.png')) && j.nettoyage[0].statut === 'reussie' && !app.etat.clients.some((c) => c.nom === nom) && /^ {8}ok {3}1\. naviguer \/clients\/nouveau$/m.test(r3.sortie) && lire(r3.dossier ?? TMP, 'rapport.md').includes('| p1.4 |'), r3.sortie);
      ecrire('r34', 'creer-ko.toml', CREER('Client ${nom} inexistant'));
      const r4 = await jouer(ecrire('r34', 'ecran-ko.toml', PRINCIPAL('creer-ko.toml', 'Ko')));
      const j4 = r4.rapport?.jeux[0];
      controle('scénario de préparation en échec : l\'entrée échoue avec son étape, les étapes ne sont pas jouées, le nettoyage si', r4.code === 1 && /^scénario creer-ko\.toml, étape 4 : attendu : un texte qui contient « Client Ko-[a-z0-9]{7} inexistant » ; obtenu : texte « Client Ko-[a-z0-9]{7} créé »$/.test(j4?.preparation[0]?.message ?? '') && j4.preparation[0].etapes[3].statut === 'echec' && j4.etapes[0].statut === 'non_jouee' && j4.nettoyage[0].statut === 'reussie' && !app.etat.clients.some((c) => c.nom.startsWith('Ko-')), r4.sortie + JSON.stringify(j4?.preparation[0]));
    }

    // ------------------------------------------------------------------------------------------
    // Scénarios des tests exportés (R35 à R38) : un même scénario, joué par le skill puis par @playwright/test.
    const ECRAN = (profil) => `format = "scenario-playwright.scenario/1"
titre = "Créer un client"
etiquettes = ["DEMO-8-S02"]
url_base = "${base}"
profil = "${profil}"
delai = 30

[[jeux]]
nom = "Ecran <unique>"
ville = "Lyon"

[[jeux]]
nom = "Autre <unique>"
ville = "Marseille"

[[etapes]]
action = "naviguer"
url = "/clients/nouveau"

[[etapes]]
action = "saisir"
cible = { libelle = "Nom" }
valeur = "\${nom}"

[[etapes]]
action = "touche"
cible = { libelle = "Nom" }
touche = "End"

[[etapes]]
action = "choisir"
cible = { libelle = "Ville" }
valeur = "\${ville}"

[[etapes]]
action = "cocher"
cible = { libelle = "Client actif" }
valeur = true

[[etapes]]
action = "televerser"
cible = { libelle = "Pièce jointe" }
fichier = "piece.txt"

[[etapes]]
action = "verifier"
critere = "valeur"
cible = { placeholder = "Nom du client" }
attendu = "\${nom}"

[[etapes]]
action = "verifier"
critere = "actif"
cible = { role = "button", nom = "Archiver" }
attendu = false

[[etapes]]
action = "cliquer"
cible = { role = "button", nom = "Enregistrer" }
mutation = "creation"

[[etapes]]
action = "verifier"
critere = "contient"
cible = { role = "alert" }
attendu = "Client \${nom} créé"

[[etapes]]
action = "verifier"
critere = "url"
attendu = "/clients*"

[[etapes]]
action = "verifier"
critere = "requete"
methode = "POST"
chemin = "/api/clients"
attendu = { statut = 201, corps = { nom = "\${nom}", ville = "\${ville}", actif = true, piece = "piece.txt" } }

[[etapes]]
action = "verifier"
critere = "nombre"
cible = { role = "cell", nom = "\${nom}", exact = true }
attendu = 1

[[etapes]]
action = "verifier"
critere = "api"
chemin = "/api/clients/\${nom}"
attendu = { contient = { ville = "\${ville}" } }

[[etapes]]
action = "survoler"
cible = { role = "button", nom = "Menu" }

[[etapes]]
action = "attendre"
etat = "visible"
cible = { role = "link", nom = "Paramètres" }

[[etapes]]
action = "capturer"
nom = "liste"

[[nettoyage]]
methode = "DELETE"
chemin = "/api/clients/\${nom}"
`;
    const ECHECS = (profil) => `format = "scenario-playwright.scenario/1"
titre = "Vérifications en échec"
url_base = "${base}"
profil = "${profil}"
delai = 30

[[etapes]]
action = "naviguer"
url = "/clients"

[[etapes]]
action = "verifier"
critere = "contient"
cible = { role = "heading" }
attendu = "Inexistant"
delai = 1

[[etapes]]
action = "verifier"
critere = "visible"
cible = { role = "table" }
attendu = true

[[etapes]]
action = "cliquer"
cible = { role = "link", nom = "Nouveau client" }

[[etapes]]
action = "verifier"
critere = "contient"
cible = { role = "heading" }
attendu = "Nouveau client"

[[nettoyage]]
methode = "DELETE"
chemin = "/api/clients/Echec-\${unique}"
`;
    const ACTION_KO = (profil) => `format = "scenario-playwright.scenario/1"
titre = "Action en échec"
url_base = "${base}"
profil = "${profil}"
delai = 30

[[etapes]]
action = "naviguer"
url = "/"

[[etapes]]
action = "cliquer"
cible = { role = "link", nom = "Inexistant" }
delai = 2

[[etapes]]
action = "verifier"
critere = "contient"
cible = { role = "heading" }
attendu = "Démonstration"
`;
    const FIN_KO = (profil) => `format = "scenario-playwright.scenario/1"
titre = "Vérification finale en échec"
url_base = "${base}"
profil = "${profil}"
delai = 30

[[etapes]]
action = "naviguer"
url = "/clients/nouveau"

[[etapes]]
action = "saisir"
cible = { libelle = "Nom" }
valeur = "Masque-\${unique}"

[[etapes]]
action = "cliquer"
cible = { role = "button", nom = "Enregistrer" }
mutation = "creation"

[[etapes]]
action = "verifier"
critere = "contient"
cible = { role = "alert" }
attendu = "Client Masque-\${unique} créé"

[[etapes]]
action = "verifier"
critere = "requete"
methode = "POST"
chemin = "/api/absent"
delai = 2

[[nettoyage]]
methode = "DELETE"
chemin = "/api/clients/Masque-\${unique}"
`;
    const DONNEES = (profil) => `format = "scenario-playwright.scenario/1"
titre = "Préparation par l'API"
url_base = "${base}"
profil = "${profil}"
delai = 30

[[etapes]]
ligne = 1
action = "naviguer"
url = "/connexion?auto=300"

[[etapes]]
ligne = 2
action = "main"
message = "Connectez-vous"
jusqua = { url = "/accueil-connecte" }

[[preparation]]
ligne = 3
methode = "POST"
chemin = "/api/donnees/clients"
corps = { nom = "Client \${unique}", ville = "Lyon" }
statut = 201
garder = { id_client = "id" }

[[etapes]]
ligne = 4
action = "naviguer"
url = "/clients/\${id_client}"

[[etapes]]
ligne = 5
action = "verifier"
critere = "contient"
cible = { role = "heading" }
attendu = "Client \${unique}"

[[etapes]]
ligne = 6
action = "verifier"
critere = "api"
chemin = "/api/donnees/clients/\${id_client}"
attendu = { contient = { ville = "Lyon" } }

[[nettoyage]]
ligne = 7
methode = "DELETE"
chemin = "/api/donnees/clients/\${id_client}"
statut = 204
`;
    const CREER_SOUS = (profil) => `format = "scenario-playwright.scenario/1"
titre = "Créer un client par l'écran"
url_base = "${base}"
profil = "${profil}"
delai = 30

[parametres]
nom = "Sous-<unique>"

[[etapes]]
action = "naviguer"
url = "/clients/nouveau"

[[etapes]]
action = "saisir"
cible = { libelle = "Nom" }
valeur = "\${nom}"

[[etapes]]
action = "cliquer"
cible = { role = "button", nom = "Enregistrer" }
mutation = "creation"

[[etapes]]
action = "verifier"
critere = "contient"
cible = { role = "alert" }
attendu = "Client \${nom} créé"
`;
    const SOUS = (profil) => `format = "scenario-playwright.scenario/1"
titre = "Préparé par l'écran"
url_base = "${base}"
profil = "${profil}"
delai = 30

[[preparation]]
scenario = "creer-client.toml"

[[etapes]]
action = "naviguer"
url = "/clients"

[[etapes]]
action = "verifier"
critere = "contient"
cible = { role = "table" }
attendu = "Sous-\${unique}"

[[nettoyage]]
methode = "DELETE"
chemin = "/api/clients/Sous-\${unique}"

[[nettoyage]]
methode = "DELETE"
chemin = "/api/clients/Sous-\${unique}"
statut = 204
`;
    // Traduction du test manuel DEMO-13 importé de Xray : chaque étape garde la ligne de son pas.
    const EXPORTER_CLIENTS = (t) => {
      const [l1, l2, l3, l4] = t.etapes.map((e) => e.ligne);
      return `format = "scenario-playwright.scenario/1"
titre = "${t.titre}"
etiquettes = ["DEMO-13"]
url_base = "${base}"
source = "DEMO-13.scenario"
empreinte_source = "${t.empreinte}"
delai = 30

[[etapes]]
ligne = ${l1}
action = "naviguer"
url = "/export"

[[etapes]]
ligne = ${l2}
action = "verifier"
critere = "contient"
cible = { role = "heading" }
attendu = "Export"

[[etapes]]
ligne = ${l3}
action = "telecharger"
cible = { role = "link", nom = "Exporter en CSV" }
nom = "clients"

[[etapes]]
ligne = ${l4}
action = "verifier"
critere = "fichier"
fichier = "clients"
attendu = { contient = "nom;ville" }

[[etapes]]
ligne = ${l4}
action = "capturer"
nom = "export"
`;
    };
    // Connexion écrite par l'équipe : la page de démonstration se connecte d'elle-même, comme le ferait le compte de
    // test de la CI, sans rien écrire en clair.
    const CONNEXION_EQUIPE = `export async function seConnecter(page, { message, jusqua }) {
  console.log(\`connexion de l'équipe : « \${message} », jusqu'à \${jusqua.url}\`);
}
`;
    let r36 = null;

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R35', 'Export des scénarios ratifiés en tests @playwright/test, sans IA : traduction contrôlée, fichiers du skill seulement, en-tête et empreinte, test périmé ou retouché');
    {
      const P = join(TMP, 'r35');
      const E = join(P, 'e2e');
      const empreinteDe = (f) => (existsSync(join(E, f)) ? sha(join(E, f)) : null);
      mkdirSync(E, { recursive: true });
      writeFileSync(join(P, 'package.json'), '{ "name": "projet-r35", "private": true }\n');
      const creer = ecrire('r35/scenarios', 'creer.toml', ECRAN('r35'));
      ecrire('r35/scenarios', 'piece.txt', 'pièce jointe de démonstration\n');
      const exp = (args) => lancer('exporter.mjs', args, { cwd: P });
      const r1 = await exp([creer]);
      const r2 = await exp([creer, '--dossier', 'absent']);
      const invalide = ecrire('r35/scenarios', 'invalide.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Invalide"\nurl_base = "${base}"\n\n[[etapes]]\naction = "cliquer"\n`);
      const r3 = await exp([creer, invalide, '--dossier', 'e2e']);
      ecrire('r35/scenarios', 'texte.scenario', `Scénario: Accueil\n  Adresse : ${base}\n  Quand j'ouvre l'accueil\n`);
      const traduit = ecrire('r35/scenarios', 'traduit.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Accueil"\nurl_base = "${base}"\nsource = "texte.scenario"\nempreinte_source = "${'0'.repeat(64)}"\n\n[[etapes]]\nligne = 3\naction = "naviguer"\nurl = "/"\n`);
      const r4 = await exp([traduit, '--dossier', 'e2e']);
      const homonyme = ecrire('r35/scenarios/autres', 'creer.toml', ECRAN('r35'));
      ecrire('r35/scenarios/autres', 'piece.txt', 'pièce jointe de démonstration\n');
      const r6 = await exp([creer, homonyme, '--dossier', 'e2e']);
      controle('refus avant toute écriture : sans --dossier, dossier absent jamais créé, scénario invalide, texte changé depuis la traduction, deux scénarios pour un même test ; code 2 (D21.INV-1, D21.INV-2)', r1.code === 2 && r1.erreurs.includes('--dossier manquant') && r2.code === 2 && r2.erreurs.includes('dossier introuvable : absent') && !existsSync(join(P, 'absent')) && r3.code === 2 && /^ERREUR invalide\.toml : /m.test(r3.sortie) && r4.code === 2 && r4.sortie.includes('ERREUR traduit.toml : texte.scenario a changé depuis la traduction') && r6.code === 2 && r6.sortie.includes('ERREUR deux scénarios donneraient le même test : creer.spec.mjs') && readdirSync(E).length === 0, [r1, r2, r3, r4, r6].map((x) => x.sortie + x.erreurs).join(' | '));
      const avant = arbre(P, 'e2e');
      let r = await exp([creer, '--dossier', 'e2e']);
      const contenu = lire(E, 'creer.spec.mjs');
      controle('export : un test et les aides, dans le dossier désigné seulement ; rien d\'autre n\'est écrit dans le projet (D21.INV-2)', r.code === 0 && JSON.stringify(readdirSync(E).sort()) === '["creer.spec.mjs","scenario-playwright.aides.mjs"]' && arbre(P, 'e2e') === avant && r.sortie.includes('écrit    e2e/creer.spec.mjs : « Créer un client », 17 étapes, 2 jeux, nettoyage 1') && r.sortie.includes('écrit    e2e/scenario-playwright.aides.mjs : aides communes') && r.sortie.includes('Exporté : 1 test en JavaScript dans e2e ; npx playwright test e2e'), r.sortie + r.erreurs);
      controle('notes : origines à faire correspondre pour jouer ailleurs ; test qui modifie des données sauté hors du poste sans autorisation (D21.INV-3)', r.sortie.includes(`note : origines du scénario : ${base} ; pour jouer ailleurs, SCENARIO_ORIGINES="${base}=<origine jouée>,…"`) && r.sortie.includes('note : 1 test modifie des données : hors du poste, il est sauté sans SCENARIO_AUTORISER_MUTATIONS=1 (D21.INV-3)'), r.sortie);
      const lignes = contenu.split('\n');
      controle('en-tête : test écrit sans IA depuis le scénario ratifié, à ne pas modifier, empreinte de son corps (D21.INV-1)', lignes[0] === '// Test écrit par scenario-playwright 1.6.1 (exporter.mjs), sans IA, depuis le scénario ratifié ../scenarios/creer.toml.' && lignes[1] === '// Ne pas le modifier à la main : exporter.mjs le régénère, et garde à côté un test retouché avant de le remplacer.' && lignes[2] === `// Empreinte : ${createHash('sha256').update(lignes.slice(3).join('\n')).digest('hex')}`, lignes.slice(0, 3).join(' | '));
      controle('traduction : un test par jeu dans test.describe, étiquettes en tags, cibles en localisateurs de Playwright, numéro et ligne de chaque étape (D21.INV-1)', [
        "test.describe('Créer un client', () => {",
        '  for (const [indice, jeu] of JEUX.entries()) {',
        "tag: ['@DEMO-8-S02']",
        "const s = await ouvrir(page, DEFINITION, { parametres: PARAMETRES, jeu, indice });",
        "await s.etape(2, 'saisir « ${nom} » dans getByLabel(\\'Nom\\')', () => page.getByLabel('Nom').fill(`${s.v.nom}`, { timeout: 30000 }));",
        "await s.etape(4, 'choisir « ${ville} » dans getByLabel(\\'Ville\\')', () => page.getByLabel('Ville').selectOption({ label: `${s.v.ville}` }, { timeout: 30000 }));",
        "() => page.getByRole('button', { name: 'Enregistrer' }).click({ timeout: 30000 }), { mutation: true });",
        "() => s.contient(page.getByRole('alert'), `Client ${s.v.nom} créé`, { exact: false, delai: 30000 }), { verifier: true, action: false });",
        "() => expect(page.getByRole('cell', { name: `${s.v.nom}`, exact: true })).toHaveCount(1, { timeout: 30000 }), { verifier: true, action: false });",
        "page.getByLabel('Pièce jointe').setInputFiles([s.fichier('../scenarios/piece.txt')], { timeout: 30000 })",
        '} finally {',
        "await s.nettoyage(1, 'DELETE /api/clients/${nom}  [suppression]', () => s.appeler({ methode: 'DELETE', chemin: `/api/clients/${s.v.nom}`, delai: 30000 }));",
      ].every((x) => contenu.includes(x)), contenu.slice(0, 3000));
      const listeCibles = [
        { role: 'button', nom: 'Enregistrer', exact: true }, { role: 'navigation' }, { libelle: 'Nom', exact: true }, { texte: 'Bienvenue' },
        { placeholder: 'Nom du client' }, { testid: 'liste' }, { alt: 'Logo' }, { titre: 'Aide', exact: false }, { css: '#compte' },
        { role: 'button', nom: 'Supprimer', dans: { role: 'row', nom: 'Martin', dans: { role: 'table' } } }, { role: 'link', rang: 2 },
      ];
      const tCibles = ecrire('r35/scenarios', 'cibles.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Cibles"\nurl_base = "${base}"\n${listeCibles.map((c) => `\n[[etapes]]\naction = "survoler"\ncible = ${cibles.cibleToml(c)}\n`).join('')}`);
      const gCibles = exportation.genererTest(tCibles, { dossierExport: E, langage: 'js' });
      const lignesCibles = (gCibles.contenu ?? '').split('\n');
      const manquees = listeCibles.filter((c, i) => !lignesCibles.some((l) => l.includes(`await s.etape(${i + 1}, `) && l.includes(`() => page.${cibles.decrireCible(c)}.hover({ timeout: 10000 })`)));
      controle('chaque cible devient le localisateur de Playwright du skill, même notation : stratégies, exact, dans sur plusieurs niveaux, rang (D21.INV-1, D4.INV-1)', gCibles.erreurs.length === 0 && manquees.length === 0, JSON.stringify(gCibles.erreurs) + JSON.stringify(manquees));
      const empreinte = empreinteDe('creer.spec.mjs');
      r = await exp([creer, '--dossier', 'e2e']);
      const g1 = exportation.genererTest(creer, { dossierExport: E, langage: 'js' });
      const g2 = exportation.genererTest(creer, { dossierExport: E, langage: 'js' });
      controle('même scénario, même test : un nouvel export dit « à jour » et ne change rien (D21.INV-1)', r.code === 0 && /^à jour {3}e2e\/creer\.spec\.mjs : /m.test(r.sortie) && /^à jour {3}e2e\/scenario-playwright\.aides\.mjs : /m.test(r.sortie) && empreinte !== null && empreinteDe('creer.spec.mjs') === empreinte && g1.contenu === g2.contenu && g1.contenu === contenu, r.sortie);
      mkdirSync(join(P, 'e2e-ts'));
      r = await exp([creer, '--dossier', 'e2e-ts', '--langage', 'ts']);
      const ts = lire(join(P, 'e2e-ts'), 'creer.spec.ts');
      const Q = join(TMP, 'r35-ts');
      mkdirSync(join(Q, 'tests', 'e2e'), { recursive: true });
      writeFileSync(join(Q, 'tsconfig.json'), '{}\n');
      const rq = await lancer('exporter.mjs', [creer, '--dossier', join('tests', 'e2e')], { cwd: Q });
      controle('TypeScript, par --langage ts ou d\'après le tsconfig.json du projet : // @ts-nocheck, imports sans extension ; en JavaScript, modules .mjs ; chemins de la sortie écrits avec des « / » (D21)', r.code === 0 && ts.startsWith('// @ts-nocheck\n// Test écrit par scenario-playwright 1.6.1') && ts.includes("import { ouvrir } from './scenario-playwright.aides';") && existsSync(join(P, 'e2e-ts', 'scenario-playwright.aides.ts')) && contenu.includes("import { ouvrir } from './scenario-playwright.aides.mjs';") && rq.code === 0 && existsSync(join(Q, 'tests', 'e2e', 'creer.spec.ts')) && rq.sortie.includes('écrit    tests/e2e/creer.spec.ts : ') && rq.sortie.includes('Exporté : 1 test en TypeScript dans tests/e2e ; npx playwright test tests/e2e'), r.sortie + rq.sortie);
      const autre = ecrire('r35/scenarios', 'autre.toml', ECRAN('r35').replace('titre = "Créer un client"', 'titre = "Autre client"'));
      writeFileSync(join(E, 'autre.spec.mjs'), '// test écrit par l\'équipe\n');
      r = await exp([autre, '--dossier', 'e2e', '--remplacer']);
      controle('fichier qui n\'est pas du skill : jamais remplacé, même avec --remplacer ; code 1 (D21.INV-2)', r.code === 1 && r.sortie.includes('conflit  e2e/autre.spec.mjs : ce fichier n\'a pas été écrit par le skill ; rien n\'est remplacé (D21.INV-2)') && lire(E, 'autre.spec.mjs') === '// test écrit par l\'équipe\n', r.sortie);
      writeFileSync(creer, ECRAN('r35').replace('attendu = "Client ${nom} créé"', 'attendu = "Client ${nom} enregistré"'));
      let v = await lancer('verifier.mjs', [join(E, 'creer.spec.mjs')]);
      const rc = await exp([creer, '--dossier', 'e2e', '--comparer']);
      r = await exp([creer, '--dossier', 'e2e']);
      const rcr = await exp([creer, '--dossier', 'e2e', '--comparer', '--remplacer']);
      controle('scénario changé : test périmé, refusé par verifier.mjs, dit par --comparer qui n\'écrit rien, non remplacé sans --remplacer ; code 1 (D21.INV-1)', v.code === 2 && v.sortie.includes('ERREUR creer.spec.mjs : périmé : le scénario ../scenarios/creer.toml, ou la version du skill, a changé depuis l\'export ; exporter.mjs --remplacer le régénère (D21.INV-1)') && rc.code === 1 && /^périmé {3}e2e\/creer\.spec\.mjs : /m.test(rc.sortie) && r.code === 1 && r.sortie.includes('périmé   e2e/creer.spec.mjs : le scénario ou le skill a changé ; --remplacer pour le remplacer') && empreinte !== null && empreinteDe('creer.spec.mjs') === empreinte && rcr.code === 2, [v, rc, r, rcr].map((x) => x.sortie + x.erreurs).join(' | '));
      r = await exp([creer, '--dossier', 'e2e', '--remplacer']);
      v = await lancer('verifier.mjs', [join(E, 'creer.spec.mjs')]);
      controle('--remplacer : test périmé régénéré, à jour pour verifier.mjs', r.code === 0 && r.sortie.includes('remplacé e2e/creer.spec.mjs : ') && lire(E, 'creer.spec.mjs') === exportation.genererTest(creer, { dossierExport: E, langage: 'js' }).contenu && v.code === 0 && v.sortie.includes('ok  creer.spec.mjs : à jour, exporté de ../scenarios/creer.toml'), r.sortie + v.sortie);
      const retouche = `${lire(E, 'creer.spec.mjs')}// retouche de l'équipe\n`;
      writeFileSync(join(E, 'creer.spec.mjs'), retouche);
      v = await lancer('verifier.mjs', [join(E, 'creer.spec.mjs')]);
      r = await exp([creer, '--dossier', 'e2e']);
      const r5 = await exp([creer, '--dossier', 'e2e', '--remplacer']);
      const garde = readdirSync(E).find((f) => /^creer\.spec\.mjs\.avant-\d{8}T\d{6}Z$/.test(f));
      controle('test retouché à la main : refusé par verifier.mjs, non remplacé sans --remplacer ; avec, gardé à côté puis remplacé (D21.INV-2)', v.code === 2 && v.sortie.includes('ERREUR creer.spec.mjs : retouché à la main depuis l\'export') && r.code === 1 && r.sortie.includes('retouché e2e/creer.spec.mjs : retouché à la main depuis l\'export ; --remplacer pour le remplacer, la version retouchée gardée à côté') && r5.code === 0 && garde && lire(E, garde) === retouche && r5.sortie.includes(`gardé    e2e/${garde} : la version retouchée`) && lire(E, 'creer.spec.mjs') === exportation.genererTest(creer, { dossierExport: E, langage: 'js' }).contenu, v.sortie + r.sortie + r5.sortie);
      const cx = ecrire('r35/scenarios', 'donnees.toml', DONNEES('r35'));
      r = await exp([cx, '--dossier', 'e2e']);
      const souche = lire(E, 'scenario-playwright.connexion.mjs');
      const tcx = lire(E, 'donnees.spec.mjs');
      controle('étape à la main : souche de connexion posée une fois pour l\'équipe, qui échoue en disant ce qui manque ; aucun identifiant écrit (D21.INV-2, D6.INV-2)', r.code === 0 && r.sortie.includes('écrit    e2e/scenario-playwright.connexion.mjs : souche de connexion, à compléter par l\'équipe') && r.sortie.includes('note : la connexion reste à écrire dans e2e/scenario-playwright.connexion.mjs') && exportation.estSouche(souche) && souche.includes('throw new Error(') && !souche.includes('fill(') && tcx.includes("import { seConnecter } from './scenario-playwright.connexion.mjs';") && tcx.includes("() => seConnecter(page, { message: 'Connectez-vous', jusqua: { url: '/accueil-connecte' } }))") && tcx.includes("await s.preparation(1, 'l.3 POST /api/donnees/clients"), r.sortie + tcx.slice(0, 2500));
      writeFileSync(join(E, 'scenario-playwright.connexion.mjs'), CONNEXION_EQUIPE);
      r = await exp([cx, '--dossier', 'e2e']);
      controle('connexion écrite par l\'équipe : jamais remplacée, plus de note (D21.INV-2)', r.code === 0 && lire(E, 'scenario-playwright.connexion.mjs') === CONNEXION_EQUIPE && !/souche|connexion reste/.test(r.sortie), r.sortie);
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R36', 'Tests exportés joués par @playwright/test 1.65.1 contre l\'application de démonstration : mêmes résultats que le skill, étape par étape');
    {
      const P = projetExport('r36', canal);
      const S36 = join(P, 'scenarios');
      // Le test manuel DEMO-13 de Xray, importé puis traduit : la chaîne entière, de l'import à l'export.
      const imp = await lancer('importer.mjs', ['xray:DEMO-13', '--api', outils, '--adresse', base, '--dossier', S36], { env: { ...ENV, ...JETONS_FACTICES } });
      const t13 = texte.analyserTexte(lire(S36, 'DEMO-13.scenario')).scenario;
      if (t13) writeFileSync(join(S36, 'exporter-clients.toml'), EXPORTER_CLIENTS(t13));
      writeFileSync(join(S36, 'piece.txt'), 'pièce jointe de démonstration\n');
      const sources = { ecran: ECRAN('r36'), echecs: ECHECS('r36'), 'action-ko': ACTION_KO('r36'), 'fin-ko': FIN_KO('r36'), donnees: DONNEES('r36-donnees'), 'creer-client': CREER_SOUS('r36-sous'), sous: SOUS('r36-sous') };
      for (const [nom, contenu] of Object.entries(sources)) writeFileSync(join(S36, `${nom}.toml`), contenu);
      const joues = ['ecran', 'echecs', 'action-ko', 'fin-ko', 'donnees', 'sous', 'exporter-clients'];
      writeFileSync(join(P, 'e2e', 'scenario-playwright.connexion.mjs'), CONNEXION_EQUIPE);
      const ex = await lancer('exporter.mjs', [...joues.map((n) => join(S36, `${n}.toml`)), '--dossier', 'e2e'], { cwd: P });
      controle('test DEMO-13 importé de Xray et traduit ; sept scénarios exportés, la connexion de l\'équipe gardée, sans note (D21.INV-2)', imp.code === 0 && Boolean(t13) && ex.code === 0 && (ex.sortie.match(/^écrit {4}e2e\/[a-z-]+\.spec\.mjs : /gm) ?? []).length === 7 && !/souche|connexion reste/.test(ex.sortie) && lire(join(P, 'e2e'), 'scenario-playwright.connexion.mjs') === CONNEXION_EQUIPE, imp.sortie + imp.erreurs + ex.sortie + ex.erreurs);
      const skill = {};
      for (const n of joues) skill[n] = await jouer(join(S36, `${n}.toml`));
      r36 = { dossier: S36, skill };
      controle('les sept scénarios joués par le skill : quatre réussis, les trois scénarios d\'échec en échec', ['ecran', 'donnees', 'sous', 'exporter-clients'].every((n) => skill[n].code === 0) && ['echecs', 'action-ko', 'fin-ko'].every((n) => skill[n].code === 1 && skill[n].rapport), joues.map((n) => `${n} : code ${skill[n].code} ${skill[n].erreurs}`).join(' ; '));
      const avantDonnees = app.etat.requetesDonnees.length;
      const avantAjouts = app.etat.ajouts.length;
      const pw = await jouerTests(P);
      const testsDe = (n) => pw.tests.filter((t) => t.fichier === `${n}.spec.mjs`);
      controle('@playwright/test 1.65.1 : un test par jeu, huit tests, cinq réussis et trois en échec ; code 1', pw.code === 1 && pw.tests.length === 8 && pw.tests.filter((t) => t.statut === 'passed').length === 5 && pw.tests.filter((t) => t.statut === 'failed').length === 3 && pw.rapport?.config?.version === '1.65.1', pw.sortie + pw.erreurs);
      const comparer = (n) => {
        const r = skill[n].rapport;
        const ts = testsDe(n);
        if (!r || ts.length !== r.jeux.length) return { ok: false, detail: `${n} : ${r ? `${r.jeux.length} jeux` : 'aucun rapport'}, ${ts.length} tests` };
        const jeux = r.jeux.map((j, i) => {
          const attendu = statutsSkill(j);
          const obtenu = statutsExport(ts[i], Object.keys(attendu));
          return { ok: enLigne(attendu) === enLigne(obtenu) && (j.statut === 'reussi') === (ts[i].statut === 'passed'), detail: `jeu ${i + 1} : skill ${j.statut} ${enLigne(attendu)} ; export ${ts[i].statut} ${enLigne(obtenu)} ${ts[i].erreurs.join(' / ')}` };
        });
        return { ok: jeux.every((x) => x.ok), detail: jeux.map((x) => x.detail).join(' | ') };
      };
      for (const [n, quoi] of [
        ['ecran', 'deux jeux, dix-sept étapes de l\'écran (saisie, touche, choix, case, téléversement, vérifications de valeur, d\'état, de texte, d\'adresse, de requête, de nombre et d\'API, survol, attente, capture), nettoyage'],
        ['echecs', 'vérification en échec, la suivante jouée, l\'action d\'après non jouée, nettoyage après l\'échec (D5.INV-4)'],
        ['action-ko', 'action en échec, la suite non jouée'],
        ['fin-ko', 'dernière étape, une vérification hors de l\'écran en échec : le test échoue à la fin (D5.INV-4)'],
        ['donnees', 'étape à la main par la connexion de l\'équipe, préparation et nettoyage par l\'API avec la valeur gardée'],
        ['sous', 'préparation par un scénario ratifié, joué dans le même onglet, <unique> de ses paramètres remplacé ; nettoyage en échec, qui ne change pas le résultat'],
        ['exporter-clients', 'test DEMO-13 importé : téléchargement, fichier téléchargé, capture'],
      ]) {
        const c = comparer(n);
        controle(`même résultat que le skill, étape par étape : ${quoi}`, c.ok, c.detail);
      }
      const ec = testsDe('echecs')[0];
      const messageSkill = skill.echecs.rapport?.jeux[0]?.etapes[1]?.message ?? null;
      const e2 = ec?.etapes.find((s) => s.title.startsWith('2. '));
      controle('vérification en échec : le même message que le skill ; le test échoue par elle, à la fin (D5.INV-4)', Boolean(messageSkill) && sansCouleur(e2?.error?.message ?? '').includes(messageSkill) && ec.erreurs.some((m) => m.includes(messageSkill)), `${messageSkill} | ${JSON.stringify(e2)} | ${ec?.erreurs}`);
      const tf = testsDe('fin-ko')[0];
      const mf = skill['fin-ko'].rapport?.jeux[0]?.etapes[4]?.message ?? '';
      const ef = sansCouleur(tf?.etapes.find((s) => s.title.startsWith('5. '))?.error?.message ?? '');
      const fuites = [JETON_REQUETE_DEMO, JETON_CSRF_DEMO, ENTETE_DEMO].filter((j) => JSON.stringify(pw.rapport ?? {}).includes(j) || mf.includes(j));
      controle('requête introuvable : les requêtes vues, l\'adresse masquée comme par le skill ; aucun jeton dans le rapport de @playwright/test (D19.INV-2)', /^aucune requête POST \/api\/absent depuis l'étape 3 ; requêtes vues : .*POST http:\/\/127\.0\.0\.1:\d+\/api\/clients\?source=formulaire&jeton=\*\*\* 201/.test(mf) && ef.includes('aucune requête POST /api/absent depuis l\'étape 3 ; requêtes vues : ') && ef.includes('/api/clients?source=formulaire&jeton=*** 201') && fuites.length === 0, `${mf} | ${ef} | ${fuites.length}`);
      const td = testsDe('donnees')[0];
      const ecritures = app.etat.requetesDonnees.slice(avantDonnees).filter((x) => x.methode !== 'GET');
      controle('préparation à sa place, après l\'étape à la main ; la connexion de l\'équipe appelée avec le message et l\'état de fin de l\'étape (D21.INV-2)', td?.etapes.map((s) => /^([pn]?\d+)\. /.exec(s.title)?.[1]).join() === '1,2,p1,3,4,5,n1' && td.stdout.includes('connexion de l\'équipe : « Connectez-vous », jusqu\'à /accueil-connecte'), JSON.stringify(td?.etapes.map((s) => s.title)) + td?.stdout);
      controle('appels du test exporté : session du navigateur, jeton anti-CSRF recopié de son cookie, aucun en-tête Authorization, corps JSON ; données supprimées (D20.INV-2)', ecritures.length === 2 && ecritures.every((x) => x.session && x.csrf === 'X-XSRF-TOKEN' && !x.autorisation) && ecritures[0].methode === 'POST' && ecritures[0].type === 'application/json' && /^\{"nom":"Client [a-z0-9]{7}","ville":"Lyon"\}$/.test(ecritures[0].corps ?? '') && ecritures[1].methode === 'DELETE' && app.etat.donnees.size === 0, JSON.stringify(ecritures));
      const ts = testsDe('sous')[0];
      controle('nettoyage en échec : annoté et signalé, le test reste réussi, l\'entrée suivante jouée (D20.INV-4)', ts?.statut === 'passed' && ts.annotations.some((a) => a.type === 'nettoyage en échec' && /^nettoyage 2 : DELETE http:\/\/127\.0\.0\.1:\d+\/api\/clients\/Sous-[a-z0-9]{7} : attendu : statut 204 ; obtenu : statut 200 ; des données de l'exécution peuvent rester \(D20\.INV-4\)$/.test(a.description)) && ts.stderr.includes('AVERTISSEMENT nettoyage 2 en échec : DELETE '), JSON.stringify(ts?.annotations) + ts?.stderr);
      const ajouts = app.etat.ajouts.slice(avantAjouts).map((c) => c.nom);
      const suffixe = (n) => n.slice(-7);
      controle('valeurs des jeux : <unique> remplacé, sept caractères propres à chaque jeu, la même exécution (D20.INV-6)', ajouts.length === 4 && /^Ecran [a-z0-9]{7}$/.test(ajouts[0]) && /^Autre [a-z0-9]{7}$/.test(ajouts[1]) && /^Masque-[a-z0-9]{7}$/.test(ajouts[2]) && /^Sous-[a-z0-9]{7}$/.test(ajouts[3]) && suffixe(ajouts[0]) !== suffixe(ajouts[1]) && suffixe(ajouts[0]).slice(0, 6) === suffixe(ajouts[1]).slice(0, 6), JSON.stringify(ajouts));
      const p1 = ts?.etapes.find((s) => s.title.startsWith('p1. '));
      const sousSkill = skill.sous.rapport?.jeux[0]?.preparation[0];
      controle('scénario de préparation : ses étapes sous l\'entrée, avec les statuts du skill (D20.INV-5)', Boolean(p1 && sousSkill) && (p1.steps ?? []).map((s) => `${/^(\d+)\. /.exec(s.title)?.[1]} ${s.error ? 'echec' : 'reussie'}`).join() === sousSkill.etapes.map((e) => `${e.numero} ${e.statut}`).join(), JSON.stringify(p1) + JSON.stringify(sousSkill?.etapes));
      const tx = testsDe('exporter-clients')[0];
      const csv = trouver(join(P, 'test-results'), 'clients.csv');
      controle('fichier téléchargé et capture gardés dans les résultats du test ; étiquettes en tags : la clé du test importé, @DEMO-13 (D21.INV-4)', tx?.statut === 'passed' && Boolean(csv) && readFileSync(csv, 'utf8').startsWith('nom;ville\n') && Boolean(trouver(join(P, 'test-results'), 'export.png')) && JSON.stringify(tx.tags) === '["DEMO-13"]' && testsDe('ecran').every((t) => JSON.stringify(t.tags) === '["DEMO-8-S02"]'), JSON.stringify(tx) + csv);
      controle('aucune donnée laissée par le skill ni par les tests exportés', !app.etat.clients.some((c) => /^(Ecran |Autre |Sous-|Client |Masque-)/.test(c.nom)) && app.etat.donnees.size === 0, JSON.stringify(app.etat.clients));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R37', 'Tests exportés en TypeScript, joués ailleurs : correspondance des origines, garde des origines, garde des mutations, souche de connexion qui échoue');
    {
      const P = projetExport('r37', canal);
      const E = join(P, 'e2e');
      const S37 = join(P, 'scenarios');
      writeFileSync(join(P, 'tsconfig.json'), '{}\n');
      writeFileSync(join(S37, 'donnees.toml'), DONNEES('r37'));
      writeFileSync(join(S37, 'ailleurs.toml'), `format = "scenario-playwright.scenario/1"\ntitre = "Recette ailleurs"\nurl_base = "http://127.0.0.1:9"\ndelai = 10\n\n[[etapes]]\naction = "naviguer"\nurl = "/externe"\n\n[[etapes]]\naction = "verifier"\ncritere = "contient"\ncible = { texte = "Contenu local" }\nattendu = "Contenu local"\n\n[[etapes]]\naction = "verifier"\ncritere = "url"\nattendu = "/externe"\n\n[[etapes]]\naction = "verifier"\ncritere = "api"\nchemin = "/api/clients"\nattendu = { statut = 200 }\n\n[[etapes]]\naction = "naviguer"\nurl = "/ws"\n\n[[etapes]]\naction = "verifier"\ncritere = "contient"\ncible = { css = "#principal" }\nattendu = "principal : écho bonjour"\n\n[[etapes]]\naction = "verifier"\ncritere = "contient"\ncible = { css = "#autre" }\nattendu = "autre : fermé"\n`);
      let ex = await lancer('exporter.mjs', [join(S37, 'donnees.toml'), join(S37, 'ailleurs.toml'), '--dossier', 'e2e'], { cwd: P });
      controle('projet TypeScript reconnu à son tsconfig.json : tests .spec.ts ; souche de connexion posée, note de la connexion à écrire (D21.INV-2)', ex.code === 0 && ex.sortie.includes('écrit    e2e/donnees.spec.ts : ') && ex.sortie.includes('écrit    e2e/scenario-playwright.connexion.ts : souche de connexion, à compléter par l\'équipe') && ex.sortie.includes('note : la connexion reste à écrire dans e2e/scenario-playwright.connexion.ts') && lire(E, 'donnees.spec.ts').startsWith('// @ts-nocheck\n'), ex.sortie + ex.erreurs);
      const avant = app.etat.requetesDonnees.length;
      let pw = await jouerTests(P, ['donnees.spec.ts']);
      let t = pw.tests[0];
      const e2 = t?.etapes.find((s) => s.title.startsWith('2. '));
      controle('souche de connexion : le test échoue à l\'étape à la main en disant ce qui manque ; préparation non jouée, nettoyage non joué faute de valeur, aucun appel (D21.INV-2, D20.INV-4)', t?.statut === 'failed' && sansCouleur(e2?.error?.message ?? '').includes('connexion à écrire par l\'équipe dans scenario-playwright.connexion : « Connectez-vous », jusqu\'à l\'adresse /accueil-connecte (D21.INV-2)') && !t.etapes.some((s) => s.title.startsWith('p1. ')) && t.annotations.some((a) => a.type === 'nettoyage non joué' && a.description === 'nettoyage 1 : ${id_client} non obtenue, sa préparation n\'a pas abouti (D20.INV-4)') && app.etat.requetesDonnees.length === avant, pw.sortie + JSON.stringify(t));
      const autres = app.etat.requetesAutre.length;
      pw = await jouerTests(P, ['ailleurs.spec.ts'], { SCENARIO_ORIGINES: `http://127.0.0.1:9=${base}` });
      t = pw.tests[0];
      controle('SCENARIO_ORIGINES : le test joué contre l\'origine correspondante, adresses relatives, vérification d\'adresse, API et WebSocket compris ; l\'autre origine bloquée par la garde, WebSocket compris (D21.INV-3)', t?.statut === 'passed' && t.etapes.length === 7 && app.etat.requetesAutre.length === autres, pw.sortie + JSON.stringify(t));
      pw = await jouerTests(P, ['ailleurs.spec.ts'], { SCENARIO_ORIGINES: 'recette' });
      t = pw.tests[0];
      controle('SCENARIO_ORIGINES mal formé : le test échoue en le disant, sans rien jouer', t?.statut === 'failed' && t.etapes.length === 0 && t.erreurs.some((m) => m.includes('SCENARIO_ORIGINES : « recette » n\'est pas « origine du scénario=origine jouée »')), pw.sortie + JSON.stringify(t));
      if (!distante) {
        saut('test qui modifie des données, hors du poste : sauté sans SCENARIO_AUTORISER_MUTATIONS=1', '127.0.0.2 indisponible sur ce système');
        saut('test qui modifie des données, hors du poste : joué avec SCENARIO_AUTORISER_MUTATIONS=1', '127.0.0.2 indisponible sur ce système');
      } else {
        const DISTANT = (url) => `format = "scenario-playwright.scenario/1"\ntitre = "Créer un client ailleurs"\nurl_base = "${url}"\ndelai = 30\n\n[[etapes]]\naction = "naviguer"\nurl = "/clients/nouveau"\n\n[[etapes]]\naction = "saisir"\ncible = { libelle = "Nom" }\nvaleur = "Distant \${unique}"\n\n[[etapes]]\naction = "cliquer"\ncible = { role = "button", nom = "Enregistrer" }\nmutation = "creation"\n\n[[etapes]]\naction = "verifier"\ncritere = "contient"\ncible = { role = "alert" }\nattendu = "Client Distant \${unique} créé"\n\n[[nettoyage]]\nmethode = "DELETE"\nchemin = "/api/clients/Distant \${unique}"\n`;
        writeFileSync(join(S37, 'distant.toml'), DISTANT(distante));
        writeFileSync(join(S37, 'local.toml'), DISTANT(base));
        ex = await lancer('exporter.mjs', [join(S37, 'distant.toml'), join(S37, 'local.toml'), '--dossier', 'e2e'], { cwd: P });
        const n0 = app.etat.requetesApi.length;
        pw = await jouerTests(P, ['distant.spec.ts', 'local.spec.ts'], { SCENARIO_ORIGINES: `${base}=${distante}` });
        const sautes = pw.tests.filter((x) => x.statut === 'skipped' && x.annotations.some((a) => a.type === 'skip' && (a.description ?? '').includes(`hors du poste (${distante}) : SCENARIO_AUTORISER_MUTATIONS=1 pour l'autoriser, avec l'accord de l'équipe (D21.INV-3)`)));
        controle('test qui modifie des données, hors du poste, déclaré ou par correspondance : sauté sans SCENARIO_AUTORISER_MUTATIONS=1, rien n\'est joué (D21.INV-3)', ex.code === 0 && ex.sortie.includes('(le scénario déclare déjà des origines hors du poste)') && pw.tests.length === 2 && sautes.length === 2 && app.etat.requetesApi.length === n0, ex.sortie + pw.sortie + JSON.stringify(pw.tests));
        pw = await jouerTests(P, ['distant.spec.ts'], { SCENARIO_AUTORISER_MUTATIONS: '1' });
        const faits = app.etat.requetesApi.slice(n0);
        controle('avec SCENARIO_AUTORISER_MUTATIONS=1 : joué hors du poste, le client créé puis supprimé par le nettoyage', pw.tests[0]?.statut === 'passed' && faits.includes('POST /api/clients') && faits.some((x) => x.startsWith('DELETE /api/clients/Distant')) && !app.etat.clients.some((c) => c.nom.startsWith('Distant ')), pw.sortie + JSON.stringify(faits));
      }
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R38', 'Résultats aux formats d\'import de Xray et de Zephyr Scale : clé retenue à l\'import, statut par pas du test manuel converti, exemples, preuves sur demande ; rien n\'est envoyé');
    {
      const res = (args) => lancer('resultats.mjs', args);
      const outilsAvant = app.etat.requetesOutils.length;
      const dX = r36?.skill['exporter-clients']?.dossier;
      const dE = r36?.skill.ecran?.dossier;
      const dK = r36?.skill.echecs?.dossier;
      if (!dX || !dE || !dK) controle('rapports du skill de R36 disponibles', false, JSON.stringify({ dX, dE, dK }));
      else {
        const rX = JSON.parse(lire(dX, 'rapport.json'));
        let r = await res([dX, '--format', 'xray']);
        let x = JSON.parse(lire(dX, 'xray-exporter-clients.json') || 'null');
        controle('Xray : clé du test retenue à l\'import ; test manuel converti, texte inchangé : statut de chacun de ses pas ; fichier à côté du rapport (D21.INV-4)', r.code === 0 && x?.info.summary === 'scenario-playwright : Exporter les clients' && x.info.startDate === rX.debut && x.info.finishDate === rX.fin && x.tests.length === 1 && x.tests[0].testKey === 'DEMO-13' && x.tests[0].status === 'PASSED' && JSON.stringify(x.tests[0].steps) === '[{"status":"PASSED"},{"status":"PASSED"}]' && x.tests[0].comment === 'scénario : conforme' && !('evidence' in x.tests[0]) && !('examples' in x.tests[0]) && r.sortie.includes('ok  DEMO-13 : PASSED, 2 pas'), r.sortie + r.erreurs + JSON.stringify(x));
        // Le même rapport, l'étape du fichier téléchargé mise en échec : le second pas échoue avec son message.
        const dKo = `${dX.replace(/[\\/]+$/, '')}-echec`;
        cpSync(dX, dKo, { recursive: true });
        const ko = JSON.parse(lire(dKo, 'rapport.json'));
        const message = 'fichier clients : attendu : un texte qui contient « nom;prenom » ; obtenu : début « nom;ville »';
        Object.assign(ko, { statut: 'echec' });
        Object.assign(ko.jeux[0], { statut: 'echec' });
        Object.assign(ko.jeux[0].etapes[3], { statut: 'echec', message });
        Object.assign(ko.jeux[0].etapes[4], { statut: 'non_jouee', message: null });
        writeFileSync(join(dKo, 'rapport.json'), JSON.stringify(ko));
        r = await res([dKo, '--format', 'xray']);
        x = JSON.parse(lire(dKo, 'xray-exporter-clients.json') || 'null');
        const l4 = ko.jeux[0].etapes[3].ligne;
        controle('pas en échec : FAILED avec le message de son étape, les autres pas avec les leurs ; commentaire : étape, ligne et message', r.code === 0 && x?.tests[0]?.status === 'FAILED' && JSON.stringify(x.tests[0].steps) === JSON.stringify([{ status: 'PASSED' }, { status: 'FAILED', actualResult: message }]) && x.tests[0].comment === `scénario : non conforme ; étape 4 (ligne ${l4}) en échec : ${message}`, r.sortie + JSON.stringify(x));
        // Texte retouché depuis l'import, traduction refaite : les pas ne correspondent plus sûrement à ceux de Xray.
        const d38 = join(TMP, 'r38');
        mkdirSync(join(d38, 'resultats', 'retouche'), { recursive: true });
        const tRetouche = lire(r36.dossier, 'DEMO-13.scenario').replace('Alors La page « Export » s\'affiche', 'Alors La page « Export » est affichée');
        writeFileSync(join(d38, 'DEMO-13.scenario'), tRetouche);
        writeFileSync(join(d38, 'exporter-clients.toml'), lire(r36.dossier, 'exporter-clients.toml').replace(/empreinte_source = "[0-9a-f]{64}"/, `empreinte_source = "${texte.empreinteTexte(tRetouche)}"`));
        writeFileSync(join(d38, 'resultats', 'retouche', 'rapport.json'), JSON.stringify({ ...rX, scenario: { ...rX.scenario, empreinte: sha(join(d38, 'exporter-clients.toml')) } }));
        r = await res([join(d38, 'resultats', 'retouche'), '--format', 'xray']);
        x = JSON.parse(lire(join(d38, 'resultats', 'retouche'), 'xray-exporter-clients.json') || 'null');
        controle('texte retouché depuis l\'import : la clé gardée, le statut du test seulement, avec une note', r.code === 0 && x?.tests[0]?.testKey === 'DEMO-13' && x.tests[0].status === 'PASSED' && !('steps' in x.tests[0]) && r.sortie.includes('note : DEMO-13 : texte retouché depuis l\'import, les pas ne correspondent plus sûrement à ceux de Xray : statut du test seulement'), r.sortie + JSON.stringify(x));
        r = await res([dE, '--format', 'xray', '--cle', 'DEMO-8']);
        x = JSON.parse(lire(dE, 'xray-ecran.json') || 'null');
        const jeuxE = r36.skill.ecran.rapport.jeux;
        controle('plusieurs jeux : un exemple par jeu ; --cle donne la clé d\'un scénario écrit à la main ; valeurs de chaque jeu dans le commentaire, sans ${unique}', r.code === 0 && x?.tests[0]?.testKey === 'DEMO-8' && JSON.stringify(x.tests[0].examples) === '["PASSED","PASSED"]' && x.tests[0].comment === `jeu 1 (nom = ${jeuxE[0].valeurs.nom}, ville = Lyon) : conforme\njeu 2 (nom = ${jeuxE[1].valeurs.nom}, ville = Marseille) : conforme` && !x.tests[0].comment.includes('unique') && r.sortie.includes('ok  DEMO-8 : PASSED, 2 exemples'), r.sortie + JSON.stringify(x));
        r = await res([dK, '--format', 'xray', '--cle', 'DEMO-9']);
        x = JSON.parse(lire(dK, 'xray-echecs.json') || 'null');
        const sansPreuves = r.code === 0 && x?.tests[0]?.status === 'FAILED' && !('evidence' in x.tests[0]);
        r = await res([dK, '--format', 'xray', '--cle', 'DEMO-9', '--preuves']);
        x = JSON.parse(lire(dK, 'xray-echecs.json') || 'null');
        const jeuK = r36.skill.echecs.rapport.jeux[0];
        const capture = jeuK.etapes[1].capture;
        // Toutes les copies d'écran du rapport, sous leur nom stable : chaque étape qui en a une, puis l'écran final (D22.INV-2).
        const noms = [...jeuK.etapes.filter((e) => e.capture).map((e) => `DEMO-9-${String(e.numero).padStart(2, '0')}.png`), ...(jeuK.capture_fin ? ['DEMO-9-fin.png'] : [])];
        const ev = x?.tests[0]?.evidence ?? [];
        const png = (e) => e.contentType === 'image/png' && Buffer.from(e.data, 'base64').subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
        controle('aucune capture sans --preuves ; avec, chaque copie d\'écran du rapport, celle de l\'étape en échec comprise, sous son nom stable, en PNG encodé en base64 (D21.INV-4, D22.INV-2)', sansPreuves && Boolean(capture) && noms.length >= 3 && JSON.stringify(ev.map((e) => e.filename)) === JSON.stringify(noms) && ev.every(png) && ev.find((e) => e.filename === 'DEMO-9-02.png')?.data === readFileSync(join(dK, capture)).toString('base64') && x.tests[0].comment.startsWith('scénario : non conforme ; étape 2 en échec : attendu : un texte qui contient « Inexistant »'), r.sortie + JSON.stringify(ev.map((e) => e.filename)) + JSON.stringify(noms) + capture);
        const refus = await Promise.all([
          res([dE, '--format', 'xray']),
          res([dE, '--format', 'xray', '--cle', 'demo-8']),
          res([dE, dK, '--format', 'xray', '--cle', 'DEMO-8']),
          res([dE, '--format', 'zephyr', '--cle', 'DEMO-T8', '--preuves']),
          res([dE, '--format', 'csv']),
          res([join(r36.dossier, 'ecran.toml'), '--format', 'xray']),
          res([dX, '--format', 'zephyr']),
        ]);
        controle('refus, code 2, rien d\'écrit : sans clé, clé mal formée, --cle pour plusieurs rapports, --preuves pour Zephyr Scale, format inconnu, fichier qui n\'est pas un rapport, clé de Xray pour Zephyr Scale', refus.every((x2) => x2.code === 2) && refus[0].sortie.includes('aucune clé de test, le scénario ne cite pas de texte de départ lisible ; --cle la donne (D21.INV-4)') && refus[1].sortie.includes('« demo-8 » n\'est pas une clé de test Xray (PROJET-123)') && refus[2].erreurs.includes('--cle ne vaut que pour un seul dossier de résultats') && refus[3].erreurs.includes('--preuves ne vaut que pour Xray') && refus[4].erreurs.includes('--format vaut xray, xray-dc, zephyr ou jira') && refus[5].sortie.includes('rapport.json illisible') && refus[6].sortie.includes('« DEMO-13 » n\'est pas une clé de cas de test Zephyr Scale (PROJET-T123)') && !existsSync(join(dX, 'zephyr-exporter-clients.json')), refus.map((x2) => x2.sortie + x2.erreurs).join(' | '));
        const rz = await res([dKo, '--format', 'zephyr', '--cle', 'DEMO-T14']);
        const zko = JSON.parse(lire(dKo, 'zephyr-exporter-clients.json') || 'null');
        r = await res([dX, '--format', 'zephyr', '--cle', 'DEMO-T13']);
        const zj = lire(dX, 'zephyr-exporter-clients.json');
        const zip = existsSync(join(dX, 'zephyr-exporter-clients.zip')) ? readFileSync(join(dX, 'zephyr-exporter-clients.zip')) : Buffer.alloc(0);
        const lu = leve(() => cas.lireZip(zip)) ?? cas.lireZip(zip);
        const n = zip.length > 30 ? zip.readUInt16LE(26) : 0;
        const stocke = zip.length > 30 ? zip.subarray(30 + n, 30 + n + zip.readUInt32LE(18)).toString('utf8') : '';
        controle('Zephyr Scale : format « custom », résultat et clé du cas de test ; même JSON dans l\'archive .zip à envoyer, lisible, contrôlée par son CRC-32 (D21.INV-4)', r.code === 0 && zj === `${JSON.stringify({ version: 1, executions: [{ source: 'exporter-clients.toml', result: 'Passed', testCase: { key: 'DEMO-T13' } }] }, null, 2)}\n` && !(lu instanceof Error) && JSON.stringify(lu.ignorees) === '["zephyr-exporter-clients.json"]' && stocke === zj && r.sortie.includes('ok  DEMO-T13 : Passed') && rz.code === 0 && zko?.executions[0]?.result === 'Failed' && zko.executions[0].testCase.key === 'DEMO-T14', r.sortie + rz.sortie + zj + String(lu?.message ?? ''));
        r = await res([dX, dKo, '--format', 'xray', '--sortie', d38]);
        x = JSON.parse(lire(d38, 'xray-resultats.json') || 'null');
        controle('plusieurs rapports : un fichier, un test chacun, début et fin de l\'ensemble', r.code === 0 && x?.info.summary === 'scenario-playwright : 2 scénarios' && x.tests.map((y) => `${y.testKey} ${y.status}`).join() === 'DEMO-13 PASSED,DEMO-13 FAILED' && x.info.startDate === [rX.debut, ko.debut].sort()[0], r.sortie + JSON.stringify(x?.info));
        const source = readFileSync(join(SKILL, 'scripts', 'resultats.mjs'), 'utf8');
        controle('rien n\'est envoyé : aucun appel aux outils de test, aucun accès au réseau dans resultats.mjs (D21.INV-4)', app.etat.requetesOutils.length === outilsAvant && !/fetch\(|node:https?|node:net|request\(/.test(source));
      }
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R39', 'Pages de tests de Xray enregistrées en HTML complet : pas en mode formulaire ou en tableau, cadres du dossier de la page, test Cucumber, diagnostic sans aucune valeur ; rien n\'est exécuté');
    const d39 = join(TMP, 'r39');
    const S39 = join(d39, 'scenarios');
    {
      const pages = join(d39, 'pages');
      const res21 = '[DEMO-21] Créer un client - Jira_files';
      mkdirSync(join(pages, res21), { recursive: true });
      const page = (titre, corps, enregistree = null) => `<!DOCTYPE html>\n${enregistree ? `<!-- saved from url=(${String(enregistree.length).padStart(4, '0')})${enregistree} -->\n` : ''}<html lang="fr"><head><meta charset="utf-8"><title>${titre}</title><script>var leurre = "<label>Action</label><div>leurre du script</div>";</script></head><body>${corps}</body></html>`;
      const pas = (n, action, donnees, attendu) => `<div class="step"><span class="num">${n}</span><label class="lbl">Action</label><div class="v">${action}</div><label class="lbl">Données</label><div class="v">${donnees}</div><label class="lbl">Résultat attendu</label><div class="v">${attendu}</div><label>Statut</label><select><option>TODO</option><option>PASSED</option></select><button>Modifier</button></div>`;
      // Sans champ Statut : le numéro du pas suivant vient juste après la valeur du résultat attendu.
      const pasNu = (n, action, donnees, attendu) => `<div class="step"><span class="num">${n}</span><label class="lbl">Action</label><div class="v">${action}</div><label class="lbl">Données</label><div class="v">${donnees}</div><label class="lbl">Résultat attendu</label><div class="v">${attendu}</div></div>`;
      // Xray Cloud : la page de Jira, les pas dans un cadre que Chrome range dans le dossier de la page ; un cadre distant et un cadre hors du dossier.
      writeFileSync(join(pages, '[DEMO-21] Créer un client - Jira.html'), page('[DEMO-21] Créer un client - Jira', `<div data-testid="issue.views.issue-base.foundation.summary.heading"><h1>Créer un client</h1></div><p>Préconditions</p><iframe src="./${encodeURIComponent(res21)}/xray-test.html"></iframe><iframe src="https://xray.cloud.getxray.app/view/page"></iframe><iframe src="../hors.html"></iframe>`, 'https://exemple.atlassian.net/browse/DEMO-21'));
      writeFileSync(join(d39, 'hors.html'), '<html><body><label>Action</label><div>Hors du dossier</div><label>Résultat attendu</label><div>Jamais lu</div></body></html>');
      writeFileSync(join(pages, res21, 'xray-test.html'), `<html><body><div class="steps-form">${pas(1, '<p>Ouvrir la liste des clients</p>', '', '<p>La liste affiche &laquo; Dupont &raquo;</p>')}${pas(2, 'Cliquer sur « Nouveau client »', 'Nom : Durand', 'Le formulaire « Nouveau client » s\'ouvre')}<div style="display:none"><label>Action</label><div>Pas caché</div></div></div></body></html>`);
      // Xray Data Center : les pas en tableau, libellés en anglais, un résultat attendu de deux paragraphes.
      writeFileSync(join(pages, 'DEMO-22.html'), page('[DEMO-22] Rechercher un client - JIRA Démo', '<h2 id="summary-val">Rechercher un client</h2><table class="aui steps"><thead><tr><th>#</th><th>Action</th><th>Data</th><th>Expected Result</th></tr></thead><tbody><tr><td>1</td><td>Open the customers page</td><td></td><td>The list is shown</td></tr><tr><td>2</td><td>Point at the name</td><td>Martin</td><td><p>Martin is listed</p><p>Dupont is hidden</p></td></tr></tbody></table>'));
      writeFileSync(join(pages, 'DEMO-23.html'), page('[DEMO-23] Exporter la liste - Jira', '<div class="gherkin"><div>Scénario: Exporter la liste</div><div>Étant donné que je suis sur la page des clients</div><div>Quand je clique sur « Exporter »</div><div>Alors le fichier clients.csv est téléchargé</div></div>'));
      writeFileSync(join(pages, 'DEMO-24.html'), page('[DEMO-24] Sans pas - Jira', '<p>Rien à jouer ici.</p><p>Action</p>'));
      writeFileSync(join(pages, 'DEMO-25.html'), page('[DEMO-25] Deux fois - Jira', `<div>${pas(1, 'Ouvrir la liste', '', 'La liste s\'affiche')}</div><div>${pas(1, 'Ouvrir la liste', '', 'La liste s\'affiche')}</div>`));
      writeFileSync(join(pages, 'DEMO-26.html'), page('Ouvrir l\'accueil - Jira', `<h1>Ouvrir l'accueil</h1>${pas(1, 'Ouvrir l\'accueil', '', 'Le titre « Démonstration » s\'affiche')}`, 'https://exemple.atlassian.net/browse/DEMO-26'));
      // Une grille de div aux rôles ARIA, comme en dessine une application : en-têtes, puis une ligne par pas.
      writeFileSync(join(pages, 'DEMO-27.html'), page('[DEMO-27] Supprimer un client - Jira', '<div data-testid="issue.views.issue-base.foundation.summary.heading"><h1>Supprimer un client</h1></div><div role="grid" class="steps"><div role="row"><div role="columnheader">Action</div><div role="columnheader">Données</div><div role="columnheader">Résultat attendu</div></div><div role="row"><div role="gridcell">Ouvrir la liste des clients</div><div role="gridcell"></div><div role="gridcell">La liste s\'affiche</div></div><div role="row"><div role="gridcell">Cliquer sur « Supprimer »</div><div role="gridcell">Dupont</div><div role="gridcell">Dupont disparaît de la liste</div></div></div>'));
      writeFileSync(join(pages, 'zz-copie-DEMO-22.html'), page('[DEMO-22] Rechercher un client - JIRA Démo', '<p>Copie</p>'));
      const imp = await lancer('importer.mjs', [pages, '--adresse', base, '--dossier', S39]);
      controle('dossier de pages : une page par test, le cadre de Xray Cloud lu dans le dossier de la page, tableau de Xray Data Center, test Cucumber ; page sans pas et doublon refusés, code 1 (D17.INV-7)', imp.code === 1
        && imp.sortie.includes('Page [DEMO-21] Créer un client - Jira.html : DEMO-21 (Xray Cloud), 2 pas, mode formulaire, dans le cadre 1')
        && imp.sortie.includes('Page DEMO-22.html : DEMO-22 (Xray Data Center), 2 pas, mode tableau') && imp.sortie.includes('Page DEMO-23.html : DEMO-23, scénario Gherkin') && imp.sortie.includes('Page DEMO-27.html : DEMO-27 (Xray Cloud), 2 pas, mode tableau')
        && imp.sortie.includes('aucun pas reconnu (libellés Action, Données, Résultat attendu) ni scénario Gherkin dans la page ni dans ses cadres ; --diagnostic décrit sa structure, sans ses valeurs')
        && imp.sortie.includes('zz-copie-DEMO-22.html : même test, DEMO-22, que la page DEMO-22.html : une page par test') && /Bilan : 6 écrits, 0 remplacé, 0 inchangé, 2 non écrits, 0 disparu/.test(imp.sortie), imp.sortie + imp.erreurs);
      const t21 = lire(S39, 'DEMO-21.scenario');
      const corps21 = t21.split('\n').filter((l) => /^ {2}(Quand|Alors) /.test(l)).join('\n');
      controle('test manuel en mode formulaire : chaque pas en « Quand <action> », avec ses données, puis « Alors <résultat attendu> » ; numéros, menus, boutons, scripts et éléments masqués écartés (D17.INV-5, D17.INV-7)', corps21 === '  Quand Ouvrir la liste des clients\n  Alors La liste affiche « Dupont »\n  Quand Cliquer sur « Nouveau client », avec « Nom : Durand »\n  Alors Le formulaire « Nouveau client » s\'ouvre'
        && !/leurre|caché|TODO|PASSED|Modifier|Hors du dossier|Jamais lu/.test(t21), t21);
      controle('provenance : lot et clé du test comme par l\'API, page enregistrée et son empreinte ; préconditions signalées ; cadres distant et hors du dossier non lus (D17.INV-4)', t21.startsWith('# Importé de Xray par importer.mjs (scenario-playwright 1.6.1), sans IA : chaque pas du test manuel devient')
        && t21.includes('# Lot : xray DEMO-21\n# Scénario : @DEMO-21, test manuel DEMO-21\n') && new RegExp(`# Source : page enregistrée \\.\\./pages/\\[DEMO-21\\] Créer un client - Jira\\.html \\(sha256 ${sha(join(pages, '[DEMO-21] Créer un client - Jira.html'))}\\)`).test(t21)
        && t21.includes('# Préconditions affichées dans la page, non reprises') && imp.sortie.includes('LIMITE [DEMO-21] Créer un client - Jira.html : 2 cadres non lus : adresse distante, hors du dossier de la page, absent ou trop gros'), t21 + imp.sortie);
      const t22 = lire(S39, 'DEMO-22.scenario');
      const t27 = lire(S39, 'DEMO-27.scenario');
      controle('tableau, en anglais : colonnes Action, Data, Expected Result ; un résultat de deux paragraphes sur une ligne, séparés par « ; » ; grille de div aux rôles grid, row, columnheader et gridcell (D17.INV-7)', t22.includes('\n  Quand Open the customers page\n  Alors The list is shown\n  Quand Point at the name, avec « Martin »\n  Alors Martin is listed ; Dupont is hidden\n') && t22.includes('# Scénario : @DEMO-22, test manuel DEMO-22')
        && t27.includes('\n  Quand Ouvrir la liste des clients\n  Alors La liste s\'affiche\n  Quand Cliquer sur « Supprimer », avec « Dupont »\n  Alors Dupont disparaît de la liste\n'), t22 + t27);
      const t23 = lire(S39, 'DEMO-23.scenario');
      const t25 = lire(S39, 'DEMO-25.scenario');
      const t26 = lire(S39, 'DEMO-26.scenario');
      controle('test Cucumber recopié ; pas affichés deux fois gardés une fois, signalé ; clé prise à l\'adresse notée par Chrome quand le titre n\'en a pas', t23.includes('# Scénario : @DEMO-23, test Cucumber DEMO-23') && t23.includes('\n  Étant donné que je suis sur la page des clients\n  Quand je clique sur « Exporter »\n  Alors le fichier clients.csv est téléchargé\n')
        && (t25.match(/^ {2}Quand /gm) ?? []).length === 1 && imp.sortie.includes('LIMITE DEMO-25.html : pas affichés deux fois dans la page : gardés une fois')
        && t26.includes('# Scénario : @DEMO-26, test manuel DEMO-26') && t26.includes('Scénario: Ouvrir l\'accueil'), imp.sortie + t23 + t25 + t26);
      // Le même test, lu par l'API (R36) puis par sa page enregistrée : même identité, même texte.
      const pages13 = join(d39, 'pages13');
      mkdirSync(pages13, { recursive: true });
      writeFileSync(join(pages13, '[DEMO-13] Exporter les clients - Jira.html'), page('[DEMO-13] Exporter les clients - Jira', `<h1>Exporter les clients</h1>${pasNu(1, 'Ouvrir la page « Export »', '', 'La page « Export » s\'affiche')}${pasNu(2, 'Cliquer sur le lien « Exporter en CSV »', '<p>format CSV</p><p>séparateur ;</p>', 'Le fichier « clients.csv » est téléchargé')}`));
      const dIdentite = join(d39, 'identite');
      mkdirSync(dIdentite, { recursive: true });
      if (r36) writeFileSync(join(dIdentite, 'DEMO-13.scenario'), lire(r36.dossier, 'DEMO-13.scenario'));
      const id13 = await lancer('importer.mjs', [pages13, '--comparer', '--dossier', dIdentite]);
      controle('le test DEMO-13 lu par l\'API, puis par sa page enregistrée, en mode formulaire sans champ Statut, chaque numéro de pas écarté : même identité, même texte (D17.INV-4, D17.INV-7)', Boolean(r36) && id13.code === 0 && id13.sortie.includes('identique  @DEMO-13  Exporter les clients (DEMO-13.scenario)'), id13.sortie + id13.erreurs);
      const avant = arbre(S39);
      const cmp = await lancer('importer.mjs', [pages, '--comparer', '--dossier', S39]);
      writeFileSync(join(pages, 'DEMO-22.html'), lire(pages, 'DEMO-22.html').replace('The list is shown', 'The whole list is shown'));
      const cmp2 = await lancer('importer.mjs', [pages, '--comparer', '--dossier', S39]);
      controle('réimport : --comparer dit les textes identiques, puis le test changé dans sa page ; rien n\'est écrit', /Bilan : 6 identiques, 0 modifié, 0 nouveau, 0 disparu, 2 non importables/.test(cmp.sortie) && cmp2.code === 1 && cmp2.sortie.includes('modifié    @DEMO-22  Rechercher un client (DEMO-22.scenario) : changé dans Xray depuis l\'import') && arbre(S39) === avant, cmp.sortie + cmp2.sortie);
      const diag = await lancer('importer.mjs', [pages, '--diagnostic']);
      const valeurs = ['DEMO-2', 'Créer un client', 'Ouvrir la liste', 'Dupont', 'Durand', 'Rechercher', 'Open the', 'Martin', 'exemple.atlassian.net', 'Jira_files', 'Exporter la liste', 'accueil', 'leurre', 'Jira.html', 'copie', 'Supprimer'];
      controle('--diagnostic : structure de chaque page, libellés trouvés et éléments qui les portent, cadres, ce qui est reconnu ; aucune valeur de la page, ni clé, ni adresse, ni nom de fichier ; rien n\'est écrit (D17.INV-7)', diag.code === 0 && diag.sortie.startsWith('Diagnostic de 8 pages, sans aucune de leurs valeurs')
        && diag.sortie.includes('page 7 : titre présent, clé reconnue, résumé présent, adresse d\'enregistrement présente ; variante Cloud ; extension .html') && diag.sortie.includes('  cadres : 1 lu, 2 non lus (adresse distante, hors du dossier, absent ou trop gros)')
        && diag.sortie.includes('    libellé « Action » dans div.steps-form > div.step > label.lbl : 2') && diag.sortie.includes('    reconnu : 2 pas, mode formulaire ; champs remplis : action 2, données 1, résultat attendu 2 ; scénarios Gherkin : 0')
        && diag.sortie.includes('    libellé « Résultat attendu » en en-tête de cellule dans thead > tr > th : 1') && diag.sortie.includes('    libellé « Action » en en-tête de cellule dans div.steps > div > div : 1') && diag.sortie.includes('    reconnu : aucun pas ; scénarios Gherkin : 1')
        && valeurs.every((v) => !diag.sortie.includes(v)) && arbre(S39) === avant, diag.sortie);
      const refus = await Promise.all([
        lancer('importer.mjs', [join(d39, 'absente.html'), '--adresse', base, '--dossier', S39]),
        lancer('importer.mjs', [pages, '--diagnostic', '--comparer']),
        lancer('importer.mjs', [join(r36?.dossier ?? d39, 'DEMO-13.scenario'), '--diagnostic']),
        lancer('importer.mjs', [join(d39, 'identite'), '--adresse', base, '--dossier', S39]),
      ]);
      controle('refus, code 2 : page absente, --diagnostic avec --comparer, --diagnostic pour une autre source, dossier sans page', refus.every((x) => x.code === 2) && refus[0].erreurs.includes('absente.html : fichier introuvable') && refus[1].erreurs.includes('--diagnostic n\'écrit rien : sans --remplacer ni --comparer')
        && refus[2].erreurs.includes('--diagnostic : pour une page .html de Xray ou un dossier de pages seulement') && refus[3].erreurs.includes('aucune page .html ni .htm dans le dossier'), refus.map((x) => x.sortie + x.erreurs).join(' | '));
      const source = readFileSync(join(SKILL, 'scripts', 'pages.mjs'), 'utf8');
      controle('pages.mjs ne fait que lire : ni réseau, ni processus, ni évaluation de code (D17.INV-7)', !/fetch\(|node:https?|node:net|node:child_process|\beval\(|new Function|import\(/.test(source));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R40', 'Campagne : scénarios contrôlés avant la première action, une seule fenêtre et une seule connexion, garde des origines de chaque scénario, un test en échec n\'arrête pas les suivants');
    const d40 = join(TMP, 'r40', 'scenarios');
    let campagne40 = null;
    {
      const tete = (titre, extra = '') => `format = "scenario-playwright.scenario/1"\ntitre = "${titre}"\nurl_base = "${base}"\n${extra}`;
      const et = (c) => `\n[[etapes]]\n${c}\n`;
      mkdirSync(d40, { recursive: true });
      writeFileSync(join(d40, 'a-connexion.toml'), tete('Connexion') + et('action = "naviguer"\nurl = "/connexion?auto=700&ephemere=1"') + et('action = "main"\nmessage = "Connectez-vous"\njusqua = { url = "/accueil-connecte" }\ndelai = 20') + et('action = "verifier"\ncritere = "visible"\ncible = { role = "heading", nom = "Espace connecté" }'));
      writeFileSync(join(d40, 'b-session.toml'), tete('Session | *gardée* {x} <x>') + et('action = "naviguer"\nurl = "/session"') + et('action = "verifier"\ncritere = "contient"\ncible = { texte = "Session :" }\nattendu = "ouverte"'));
      writeFileSync(join(d40, 'c-liste.toml'), tete('Liste') + et('action = "naviguer"\nurl = "/clients"') + et('action = "verifier"\ncritere = "nombre"\ncible = { role = "heading", nom = "Clients" }\nattendu = 2') + et('action = "verifier"\ncritere = "visible"\ncible = { role = "heading", nom = "Clients" }'));
      writeFileSync(join(d40, 'd-bloque.toml'), tete('Bloqué') + et('action = "naviguer"\nurl = "/clients"') + et('action = "cliquer"\ncible = { role = "button", nom = "Inexistant" }\ndelai = 2') + et('action = "verifier"\ncritere = "visible"\ncible = { role = "heading", nom = "Clients" }'));
      writeFileSync(join(d40, 'e-externe.toml'), tete('Externe déclaré', `origines = ["${base}", "${autre}"]\n`) + et('action = "naviguer"\nurl = "/externe"') + et('action = "verifier"\ncritere = "visible"\ncible = { texte = "Contenu local" }'));
      writeFileSync(join(d40, 'f-externe.toml'), tete('Externe non déclaré') + et('action = "naviguer"\nurl = "/externe"') + et('action = "verifier"\ncritere = "visible"\ncible = { texte = "Contenu local" }'));
      const rc = await lancer('jouer.mjs', [d40], { delai: 300_000 });
      const m = /^Rapport de campagne : (.+)campagne\.md$/m.exec(rc.sortie);
      const dc = m ? m[1].trim() : null;
      const c = dc && existsSync(join(dc, 'campagne.json')) ? JSON.parse(readFileSync(join(dc, 'campagne.json'), 'utf8')) : null;
      const rapportDe = (k) => (c && existsSync(join(dc, c.tests[k]?.dossier ?? '-', 'rapport.json')) ? JSON.parse(readFileSync(join(dc, c.tests[k].dossier, 'rapport.json'), 'utf8')) : null);
      const rs = c ? c.tests.map((_, k) => rapportDe(k)) : [];
      campagne40 = { dossier: dc, campagne: c, rapports: rs, sortie: rc.sortie };
      controle('six scénarios d\'un dossier, dans l\'ordre de leur nom ; avancement et verdict de chacun ; bilan de la campagne ; code 1 (D22.INV-1)', rc.code === 1 && rc.sortie.includes('Campagne : 6 scénarios, profil defaut ;') && rc.sortie.includes('[1/6] Connexion : 1 jeu, 3 étapes (a-connexion.toml)') && rc.sortie.includes('[6/6] Externe non déclaré : 1 jeu, 2 étapes (f-externe.toml)')
        && rc.sortie.includes('Campagne : 6 tests, 4 conformes, 1 non conforme, 1 bloqué') && /^ {2}NON CONFORME {2}Liste \(c-liste\.toml\) : étape 2 : attendu : 2 éléments ; obtenu : 1 élément$/m.test(rc.sortie) && /^ {2}BLOQUÉ {8}Bloqué \(d-bloque\.toml\) : étape 2 : délai de 2 s dépassé/m.test(rc.sortie), rc.sortie + rc.erreurs);
      controle('une seule fenêtre, une seule connexion : le message « À VOUS » une fois, la session éphémère gardée pour le test suivant (D22.INV-1)', (rc.sortie.match(/À VOUS/g) ?? []).length === 1 && rs[1]?.statut === 'reussi' && rs[1]?.jeux[0]?.etapes[1]?.statut === 'reussie', rc.sortie);
      controle('campagne.json : chaque test, son scénario et son dossier relatifs à la campagne, son statut, son verdict et sa cause ; décompte des verdicts', c?.format === rapport.FORMAT_CAMPAGNE && c.version === '1.6.1' && c.tests.map((t) => `${t.fichier}:${t.verdict}`).join() === 'a-connexion.toml:conforme,b-session.toml:conforme,c-liste.toml:non_conforme,d-bloque.toml:bloque,e-externe.toml:conforme,f-externe.toml:conforme'
        && c.tests[0].scenario === '../../a-connexion.toml' && c.tests.every((t) => existsSync(join(dc, t.dossier, 'rapport.json'))) && c.tests[2].cause?.genre === 'verification' && c.tests[2].cause.numero === 2 && c.tests[3].cause?.genre === 'action'
        && JSON.stringify(c.bilan) === '{"tests":6,"conformes":4,"non_conformes":1,"bloques":1}' && c.verdict === 'non_conforme', JSON.stringify(c));
      const md = dc ? lire(dc, 'campagne.md') : '';
      controle('campagne.md : une ligne par test, son verdict, sa cause et son rapport', md.startsWith('# Campagne : 6 tests, 4 conformes, 1 non conforme, 1 bloqué') && md.includes(`| 3 | Liste | \`../../c-liste.toml\` | **non conforme** | étape 2 : attendu : 2 éléments ; obtenu : 1 élément | \`${c?.tests[2]?.dossier}/rapport.md\` |`), md);
      controle('un test en échec n\'arrête pas les suivants ; la garde suit les origines de chaque scénario : l\'origine que l\'un déclare reste bloquée pour l\'autre (D7.INV-1, D22.INV-1)', rs.length === 6 && rs[3]?.statut === 'echec' && rs[4]?.statut === 'reussi' && rs[4].origines_bloquees.length === 0 && JSON.stringify(rs[5]?.origines_bloquees.map((x) => x.origine)) === JSON.stringify([autre]), JSON.stringify(rs.map((r) => r?.origines_bloquees)));
      // Refus avant toute action : rien n'est joué, aucun dossier de campagne n'est créé.
      const dRefus = join(TMP, 'r40', 'refus');
      mkdirSync(dRefus, { recursive: true });
      writeFileSync(join(dRefus, 'a.toml'), lire(d40, 'b-session.toml'));
      writeFileSync(join(dRefus, 'b.toml'), tete('Invalide') + et('action = "voler"'));
      const dProfils = join(TMP, 'r40', 'profils-mixtes');
      mkdirSync(dProfils, { recursive: true });
      writeFileSync(join(dProfils, 'a.toml'), lire(d40, 'b-session.toml'));
      writeFileSync(join(dProfils, 'b.toml'), tete('Autre profil', 'profil = "autre"\n') + et('action = "naviguer"\nurl = "/session"'));
      const dVide = join(TMP, 'r40', 'vide');
      mkdirSync(dVide, { recursive: true });
      const refus = await Promise.all([
        lancer('jouer.mjs', [dRefus]),
        lancer('jouer.mjs', [dProfils]),
        lancer('jouer.mjs', [d40, '--jeu', '1']),
        lancer('jouer.mjs', [d40, '--trace']),
        lancer('jouer.mjs', [dVide]),
      ]);
      controle('refus avant toute action, code 2, aucun dossier de campagne : scénario invalide, profils mêlés, --jeu ou --trace pour une campagne, dossier sans scénario (D22.INV-1)', refus.every((x) => x.code === 2) && refus[0].erreurs.includes('ERREUR b.toml : ') && refus[0].erreurs.includes('Campagne refusée : aucun scénario n\'est joué (D22.INV-1).')
        && refus[1].erreurs.includes('les scénarios d\'une campagne partagent leur profil, où se fait la connexion : defaut, autre') && refus[2].erreurs.includes('--jeu vaut pour un seul scénario, pas pour une campagne') && refus[3].erreurs.includes('--trace vaut pour un seul scénario, pas pour une campagne')
        && refus[4].erreurs.includes('aucun scénario .toml dans le dossier') && !existsSync(join(dRefus, 'resultats')) && !existsSync(join(dProfils, 'resultats')), refus.map((x) => x.erreurs).join(' | '));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R41', 'Copies d\'écran à chaque vérification, à chaque échec et à la fin de chaque test ; verdict de chaque test, conforme, non conforme ou bloqué');
    {
      const { dossier: dc, campagne: c, rapports: rs, sortie } = campagne40 ?? { rapports: [] };
      const cap = (k) => rs[k]?.jeux[0]?.etapes.map((e) => e.capture) ?? [];
      const fichiers = (k) => (dc && c?.tests[k] && existsSync(join(dc, c.tests[k].dossier, 'captures')) ? readdirSync(join(dc, c.tests[k].dossier, 'captures')).sort() : []);
      controle('copies d\'écran : chaque vérification, réussie ou non, chaque échec, et l\'écran à la fin des étapes, avant le nettoyage (D22.INV-2)', JSON.stringify(cap(0)) === '[null,null,"captures/03-verifier.png"]' && rs[0]?.jeux[0]?.capture_fin === 'captures/fin.png'
        && JSON.stringify(fichiers(2)) === '["02-verifier.png","03-verifier.png","fin.png"]' && JSON.stringify(fichiers(3)) === '["02-cliquer-echec.png","fin.png"]' && rs.every((r) => r?.jeux.every((j) => j.capture_fin && existsSync(join(dc, c.tests[rs.indexOf(r)].dossier, j.capture_fin)))), JSON.stringify([cap(0), fichiers(2), fichiers(3)]));
      controle('verdict de chaque jeu et du test, avec sa cause : vérification en échec la première, non conforme ; action en échec, bloqué (D22.INV-3)', rs[0]?.verdict === 'conforme' && rs[0].jeux[0].cause === null && rs[2]?.verdict === 'non_conforme' && JSON.stringify(rs[2].jeux[0].cause) === JSON.stringify({ genre: 'verification', numero: 2, ligne: null, message: 'attendu : 2 éléments ; obtenu : 1 élément' })
        && rs[3]?.verdict === 'bloque' && rs[3].jeux[0].cause?.genre === 'action' && rs[3].jeux[0].cause.numero === 2, JSON.stringify(rs.map((r) => r && [r.verdict, r.jeux[0].cause])));
      const md2 = dc && c?.tests[2] ? lire(join(dc, c.tests[2].dossier), 'rapport.md') : '';
      const md0 = dc && c?.tests[0] ? lire(join(dc, c.tests[0].dossier), 'rapport.md') : '';
      controle('rapport.md : verdict et cause, écran final ; sortie : le verdict après le bilan', md2.includes('- Verdict : **non conforme** (étape 2 : attendu : 2 éléments ; obtenu : 1 élément)') && md0.includes('- Verdict : conforme\n') && md0.includes('Écran à la fin des étapes : capture `captures/fin.png`')
        && /Bilan : échec, 3 étapes, 1 réussies, 1 en échec, 1 non jouées\nVerdict : bloqué \(étape 2 : délai de 2 s dépassé/.test(sortie ?? ''), md2 + md0);
      const jeu = (etapes, preparation = [], nettoyage = []) => ({ etapes, preparation, nettoyage });
      const e = (numero, action, statut, message = null) => ({ numero, action, statut, ligne: null, message });
      const v = (j) => rapport.verdictDuJeu(j);
      controle('règle du verdict : préparation en échec, bloqué ; attente ou étape à la main en échec, bloqué ; nettoyage en échec seul, conforme ; non conforme l\'emporte sur bloqué, bloqué sur conforme (D22.INV-3, D20.INV-4)', v(jeu([e(1, 'naviguer', 'non_jouee')], [{ numero: 1, statut: 'echec', message: '401' }])).verdict === 'bloque' && v(jeu([e(1, 'naviguer', 'non_jouee')], [{ numero: 1, statut: 'echec', message: '401' }])).cause.genre === 'preparation'
        && v(jeu([e(1, 'attendre', 'echec', 'x')])).verdict === 'bloque' && v(jeu([e(1, 'main', 'echec', 'x')])).verdict === 'bloque' && v(jeu([e(1, 'verifier', 'reussie')], [], [{ numero: 1, statut: 'echec' }])).verdict === 'conforme'
        && v(jeu([e(1, 'verifier', 'echec', 'x'), e(2, 'verifier', 'reussie')])).verdict === 'non_conforme' && rapport.verdictDe(['conforme', 'bloque']) === 'bloque' && rapport.verdictDe(['bloque', 'non_conforme', 'conforme']) === 'non_conforme' && rapport.verdictDe(['conforme']) === 'conforme');
      const synthese = { jeux: [
        { numero: 1, preparation: [{ numero: 1, capture: null, etapes: [{ numero: 2, capture: 'captures/j1-p1-02-verifier.png' }] }], etapes: [{ numero: 3, capture: 'captures/j1-03-verifier.png' }], nettoyage: [{ numero: 1, capture: 'captures/j1-n1-nettoyage-echec.png' }], capture_fin: 'captures/j1-fin.png' },
        { numero: 2, preparation: [], etapes: [{ numero: 3, capture: 'captures/j2-03-verifier.png' }], nettoyage: [], capture_fin: 'captures/j2-fin.png' },
      ] };
      controle('noms stables des copies d\'écran : <clé>-<n° d\'étape>, -fin, -p1 et -n1 pour la préparation et le nettoyage, préfixe de jeu s\'il y en a plusieurs (D22.INV-4)', conformite.capturesDuRapport(synthese, 'DEMO-7').map((x) => x.nom).join() === 'DEMO-7-j1-p1-02.png,DEMO-7-j1-03.png,DEMO-7-j1-n1.png,DEMO-7-j1-fin.png,DEMO-7-j2-03.png,DEMO-7-j2-fin.png');
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R42', 'Rapport de conformité à coller dans Jira : balisage wiki de Data Center et page HTML pour Cloud, copies d\'écran sous leur nom stable sur demande ; même rapport, même texte ; rien n\'est envoyé');
    {
      const dc = campagne40?.dossier;
      if (!dc) controle('campagne de R40 disponible', false);
      else {
        const res = (args) => lancer('resultats.mjs', args);
        let r = await res([dc, '--format', 'jira']);
        const wiki = lire(dc, 'conformite-jira.txt');
        const html = lire(dc, 'conformite.html');
        controle('sans --preuves : le bilan, une ligne par test, chaque test et ses étapes, en balisage wiki ; page HTML autonome ; aucune copie d\'écran (D22.INV-4)', r.code === 0 && wiki.startsWith('h2. Conformité : 6 tests, 4 conformes, 1 non conforme, 1 bloqué\n') && wiki.includes('\n|3|c-liste|Liste|(x) Non conforme|étape 2 : attendu : 2 éléments ; obtenu : 1 élément|\n')
          && wiki.includes('\n|4|d-bloque|Bloqué|(!) Bloqué|') && wiki.includes('\nh3. Liste (x) Non conforme\n') && wiki.includes('\n|2| |vérifier 2 éléments getByRole(\'heading\', \\{ name: \'Clients\' \\})|(x) en échec|attendu : 2 éléments ; obtenu : 1 élément|\n') && !/thumbnail/.test(wiki)
          && html.startsWith('<!doctype html>\n<html lang="fr"><head><meta charset="utf-8"><title>Conformité : 6 tests, 4 conformes, 1 non conforme, 1 bloqué</title>') && !html.includes('<img') && !existsSync(join(dc, 'captures-jira')) && r.sortie.includes('sans copie d\'écran : --preuves les ajoute'), r.sortie + wiki.slice(0, 1500));
        controle('balisage wiki : caractères de mise en forme d\'un titre échappés ; HTML échappé', wiki.includes('|2|b-session|Session \\| \\*gardée\\* \\{x\\} <x>|(/) Conforme| |') && html.includes('Session | *gardée* {x} &lt;x&gt;') && !html.includes('<x>'), wiki.split('\n').find((l) => l.startsWith('|2|')));
        r = await res([dc, '--format', 'jira', '--preuves']);
        const wiki2 = lire(dc, 'conformite-jira.txt');
        const html2 = lire(dc, 'conformite.html');
        const attendues = campagne40.rapports.flatMap((x, k) => (!x || !campagne40.campagne?.tests[k] ? [] : conformite.capturesDuRapport(x, campagne40.campagne.tests[k].fichier.replace(/\.toml$/, ''))).map((y) => ({ ...y, dossier: join(dc, campagne40.campagne.tests[k].dossier) })));
        const copiees = existsSync(join(dc, 'captures-jira')) ? readdirSync(join(dc, 'captures-jira')).sort() : [];
        controle('--preuves : chaque copie d\'écran dans captures-jira, sous son nom stable, identique à sa capture ; citée dans le balisage (!nom|thumbnail!), incluse dans la page HTML (D22.INV-2, D22.INV-4)', r.code === 0 && JSON.stringify(copiees) === JSON.stringify(attendues.map((x) => x.nom).sort()) && attendues.length >= 12
          && attendues.every((x) => { try { return readFileSync(join(dc, 'captures-jira', x.nom)).equals(readFileSync(join(x.dossier, x.chemin))); } catch { return false; } }) && wiki2.includes('|vérifier 2 éléments getByRole(\'heading\', \\{ name: \'Clients\' \\})|(x) en échec|attendu : 2 éléments ; obtenu : 1 élément|!c-liste-02.png|thumbnail!|')
          && wiki2.includes('Écran à la fin des étapes : !c-liste-fin.png|thumbnail!') && html2.includes(`src="data:image/png;base64,${existsSync(join(dc, 'captures-jira', 'c-liste-02.png')) ? readFileSync(join(dc, 'captures-jira', 'c-liste-02.png')).toString('base64') : 'absente'}"`) && r.sortie.includes(`${attendues.length} copies d'écran dans`), r.sortie + JSON.stringify(copiees));
        await res([dc, '--format', 'jira', '--preuves']);
        controle('même rapport, même texte : le balisage et la page réécrits à l\'identique (D22.INV-4)', lire(dc, 'conformite-jira.txt') === wiki2 && lire(dc, 'conformite.html') === html2);
        // Un test absent de la campagne, sous un défaut, laisse les contrôles échouer sans arrêter la recette.
        const d2 = join(dc, campagne40.campagne?.tests[2]?.dossier ?? 'test-absent');
        r = await res([d2, '--format', 'jira', '--cle', 'DEMO-40', '--preuves']);
        controle('un seul rapport : fichiers à côté de lui, sous la clé donnée par --cle', r.code === 0 && lire(d2, 'conformite-jira.txt').includes('\nh3. DEMO-40 : Liste (x) Non conforme\n') && existsSync(join(d2, 'captures-jira', 'DEMO-40-02.png')) && existsSync(join(d2, 'captures-jira', 'DEMO-40-fin.png')), r.sortie);
        const dDouble = join(TMP, 'r42', 'double');
        if (existsSync(d2)) {
          cpSync(d2, join(dDouble, 'a'), { recursive: true });
          cpSync(d2, join(dDouble, 'b'), { recursive: true });
        }
        const refus = await Promise.all([res([dc, '--format', 'jira', '--cle', 'DEMO-40']), res([d2, '--format', 'jira', '--cle', 'demo-40']), res([join(dDouble, 'a'), join(dDouble, 'b'), '--format', 'jira'])]);
        controle('refus, code 2 : --cle pour une campagne, clé mal formée, deux tests aux mêmes noms de copies d\'écran', refus.every((x) => x.code === 2) && refus[0].erreurs.includes('--cle ne vaut que pour un seul dossier de résultats') && refus[1].sortie.includes('« demo-40 » n\'est pas une clé de test (PROJET-123 ou PROJET-T123)') && refus[2].sortie.includes('deux tests donneraient les mêmes noms de copies d\'écran : c-liste'), refus.map((x) => x.sortie + x.erreurs).join(' | '));
        const sources = ['resultats.mjs', 'conformite.mjs'].map((f) => readFileSync(join(SKILL, 'scripts', f), 'utf8')).join('\n');
        controle('rien n\'est envoyé : ni réseau ni processus dans resultats.mjs et conformite.mjs (D22.INV-4)', !/fetch\(|node:https?|node:net|node:child_process|request\(/.test(sources));
      }
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R43', 'Résultats d\'une campagne pour Xray Cloud et Data Center : statut du verdict, statut et copies d\'écran de chaque pas, exécution de test existante ; Zephyr Scale bloqué');
    {
      const d43 = join(TMP, 'r43', 'scenarios');
      mkdirSync(d43, { recursive: true });
      const tests = { 21: lire(S39, 'DEMO-21.scenario'), 22: lire(S39, 'DEMO-22.scenario'), 26: lire(S39, 'DEMO-26.scenario') };
      for (const [k, t] of Object.entries(tests)) writeFileSync(join(d43, `DEMO-${k}.scenario`), t);
      if (r36) {
        writeFileSync(join(d43, 'DEMO-13.scenario'), lire(r36.dossier, 'DEMO-13.scenario'));
        writeFileSync(join(d43, 'exporter-clients.toml'), lire(r36.dossier, 'exporter-clients.toml'));
      }
      const traduction = (cle, etapesToml) => {
        const t = texte.analyserTexte(tests[cle]).scenario;
        const lignes = t ? t.etapes.map((x) => x.ligne) : [];
        return `format = "scenario-playwright.scenario/1"\ntitre = "${t?.titre}"\netiquettes = ["DEMO-${cle}"]\nurl_base = "${base}"\nsource = "DEMO-${cle}.scenario"\nempreinte_source = "${t?.empreinte}"\n${etapesToml.map(([i, c]) => `\n[[etapes]]\nligne = ${lignes[i]}\n${c}\n`).join('')}`;
      };
      writeFileSync(join(d43, 'DEMO-21.toml'), traduction(21, [[0, 'action = "naviguer"\nurl = "/clients"'], [1, 'action = "verifier"\ncritere = "visible"\ncible = { role = "cell", nom = "Dupont", exact = true }'], [2, 'action = "cliquer"\ncible = { role = "link", nom = "Nouveau client" }'], [2, 'action = "saisir"\ncible = { libelle = "Nom" }\nvaleur = "Durand"'], [3, 'action = "verifier"\ncritere = "visible"\ncible = { role = "heading", nom = "Nouveau client" }']]));
      writeFileSync(join(d43, 'DEMO-22.toml'), traduction(22, [[0, 'action = "naviguer"\nurl = "/clients"'], [1, 'action = "verifier"\ncritere = "visible"\ncible = { role = "table", nom = "Liste des clients" }'], [2, 'action = "survoler"\ncible = { role = "cell", nom = "Martin", exact = true }'], [3, 'action = "verifier"\ncritere = "nombre"\ncible = { role = "cell", nom = "Dupont", exact = true }\nattendu = 0']]));
      writeFileSync(join(d43, 'DEMO-26.toml'), traduction(26, [[0, 'action = "naviguer"\nurl = "/"'], [0, 'action = "cliquer"\ncible = { role = "button", nom = "Inexistant" }\ndelai = 2'], [1, 'action = "verifier"\ncritere = "visible"\ncible = { role = "heading", nom = "Démonstration" }']]));
      const rc = await lancer('jouer.mjs', [d43], { delai: 300_000 });
      const m = /^Rapport de campagne : (.+)campagne\.md$/m.exec(rc.sortie);
      const dc = m ? m[1].trim() : null;
      controle('campagne de quatre tests importés de Xray, par l\'API ou par leur page : conformes, non conforme, bloqué', Boolean(r36) && rc.code === 1 && rc.sortie.includes('Campagne : 4 tests, 2 conformes, 1 non conforme, 1 bloqué'), rc.sortie + rc.erreurs);
      if (dc) {
        const res = (args) => lancer('resultats.mjs', args);
        let r = await res([dc, '--format', 'xray', '--preuves', '--execution', 'DEMO-100']);
        const x = JSON.parse(lire(dc, 'xray-campagne.json') || 'null');
        const t = (k) => x?.tests.find((y) => y.testKey === k);
        const noms = (l) => (l ?? []).map((y) => y.filename).join();
        controle('Xray Cloud : un fichier pour la campagne, dans son dossier ; clé de chaque test retenue à l\'import ; statut de son verdict, PASSED, FAILED ou ABORTED ; exécution de test donnée (D21.INV-4, D22.INV-3)', r.code === 0 && x?.testExecutionKey === 'DEMO-100' && x.info.summary === 'scenario-playwright : campagne, 4 tests'
          && x.tests.map((y) => `${y.testKey}:${y.status}`).join() === 'DEMO-21:PASSED,DEMO-22:FAILED,DEMO-26:ABORTED,DEMO-13:PASSED' && r.sortie.includes('pour l\'exécution DEMO-100'), r.sortie + JSON.stringify(x?.tests.map((y) => [y.testKey, y.status])));
        controle('statut de chaque pas du test manuel converti, et ses copies d\'écran sur ce pas ; l\'écran final sur le test (D22.INV-2)', JSON.stringify(t('DEMO-21')?.steps?.map((y) => [y.status, noms(y.evidence)])) === '[["PASSED","DEMO-21-02.png"],["PASSED","DEMO-21-05.png"]]' && noms(t('DEMO-21')?.evidence) === 'DEMO-21-fin.png'
          && JSON.stringify(t('DEMO-22')?.steps?.map((y) => [y.status, y.actualResult ?? null, noms(y.evidence)])) === '[["PASSED",null,"DEMO-22-02.png"],["FAILED","attendu : 0 élément ; obtenu : 1 élément","DEMO-22-04.png"]]'
          && JSON.stringify(t('DEMO-26')?.steps?.map((y) => [y.status, noms(y.evidence)])) === '[["FAILED","DEMO-26-02.png"]]' && t('DEMO-26')?.comment?.startsWith('scénario : bloqué ; étape 2 (ligne '), JSON.stringify(x?.tests.map((y) => [y.testKey, y.steps?.map((s) => [s.status, s.actualResult, noms(s.evidence)]), noms(y.evidence)])));
        r = await res([dc, '--format', 'xray-dc', '--preuves']);
        const xdc = JSON.parse(lire(dc, 'xray-campagne.json') || 'null');
        controle('Xray Data Center : PASS, FAIL, ABORTED, et les pièces jointes en « evidences » (D21.INV-4)', r.code === 0 && !('testExecutionKey' in (xdc ?? {})) && xdc?.tests.map((y) => `${y.testKey}:${y.status}`).join() === 'DEMO-21:PASS,DEMO-22:FAIL,DEMO-26:ABORTED,DEMO-13:PASS'
          && JSON.stringify(xdc.tests[1]?.steps?.map((y) => y.status)) === '["PASS","FAIL"]' && xdc.tests.every((y) => !('evidence' in y) && (y.steps ?? []).every((s) => !('evidence' in s))) && noms(xdc.tests[0].evidences) === 'DEMO-21-fin.png' && r.sortie.includes('au format JSON de Xray Data Center'), r.sortie + JSON.stringify(xdc?.tests.map((y) => y.status)));
        r = await res([dc, '--format', 'xray']);
        const sans = JSON.parse(lire(dc, 'xray-campagne.json') || 'null');
        controle('sans --preuves : aucune copie d\'écran, ni sur le test ni sur ses pas (D21.INV-4)', r.code === 0 && sans?.tests.every((y) => !('evidence' in y) && (y.steps ?? []).every((s) => !('evidence' in s))));
        const dBloque = join(dc, readdirSync(dc).find((f) => f.endsWith('-DEMO-26')) ?? '-');
        const rz = await res([dBloque, '--format', 'zephyr', '--cle', 'DEMO-T26']);
        const z = JSON.parse(lire(dBloque, 'zephyr-DEMO-26.json') || 'null');
        const refus = await Promise.all([res([dc, '--format', 'xray', '--execution', 'demo-100']), res([dc, '--format', 'zephyr', '--execution', 'DEMO-100']), res([dc, '--format', 'jira', '--execution', 'DEMO-100'])]);
        controle('Zephyr Scale : un test bloqué devient Blocked ; refus, code 2 : exécution mal formée, --execution hors de Xray', rz.code === 0 && z?.executions[0]?.result === 'Blocked' && refus.every((y) => y.code === 2) && refus[0].erreurs.includes('« demo-100 » n\'est pas une clé d\'exécution de test Xray (PROJET-123)') && refus[1].erreurs.includes('--execution ne vaut que pour xray et xray-dc') && refus[2].erreurs.includes('--execution ne vaut que pour xray et xray-dc'), rz.sortie + refus.map((y) => y.erreurs).join(' | '));
        r = await res([dc, '--format', 'jira', '--preuves']);
        const w = lire(dc, 'conformite-jira.txt');
        controle('rapport de conformité de la campagne : clés des tests en titre et dans les noms des copies d\'écran', r.code === 0 && w.includes('\nh3. DEMO-22 : Rechercher un client (x) Non conforme\n') && w.includes('!DEMO-22-04.png|thumbnail!') && existsSync(join(dc, 'captures-jira', 'DEMO-26-fin.png')), r.sortie);
      }
    }
  } finally {
    await app.arreter();
  }
}

let codeSortie = 0;
// Garde-fou : une recette bloquée s'arrête d'elle-même au bout de quinze minutes, en disant dans quel scénario, son
// dossier temporaire gardé ; elle dure d'ordinaire moins de cinq minutes.
const DUREE_MAX = 900_000;
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
