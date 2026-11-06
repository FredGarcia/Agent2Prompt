---
name: navigateur
description: Seul propriétaire de Playwright, piloté comme une bibliothèque depuis Node (session SSO réglée automatiquement par authentification intégrée, CP-0 en repli, aucun identifiant détenu, origines autorisées bloquées avant chargement, jeu d'actions fermé sans évaluation de code, attentes par état, réessais bornés sans rejeu des mutations, preuves masquées et expurgées, instantanés ARIA, désignation interactive, sonde, monde simulé pour les tests). Depuis 1.3.0, constat perceptif : il regarde comme une personne, par la vue, le lecteur d'écran et le clavier, ne constate une absence que dans une portée vue, ne conclut jamais « chaque » sur un ensemble vide, compare les textes selon une règle déclarée, reconnaît un pictogramme par une référence ratifiée, confirme par un second regard, et rend compte de ce qu'il a vu et de ce qu'il n'a pas vu. À implémenter au lot 4.
dimensions: [D4, D25]
status: active
---

# Module `navigateur` (D4, D25)

Le `navigateur` est le seul module qui ouvre un navigateur (D4.INV-1). Il importe `chromium` du paquet `playwright` et pilote la bibliothèque directement : ni fichier `.spec.ts`, ni exécuteur `@playwright/test`. Il instancie le cycle de l'échelle Étape (module `noyau`).

Depuis 1.3.0, il joue le rôle d'une personne devant l'écran : il va sur une page, attend qu'elle soit prête, la regarde, et rend compte de ce qu'il voit et de ce qu'il ne voit pas (section 6, dimension D25).

## 1. Session (D4.INV-3, D4.INV-7)

| Stratégie | Principe | Statut 1.3.0 |
|---|---|---|
| `integree` (défaut) | contexte persistant dans un profil dédié ; Chromium lancé avec `--auth-server-allowlist` et `--auth-negotiate-delegate-allowlist` sur les domaines SSO de la configuration humaine : l'authentification intégrée du poste, ou la session déjà ouverte chez le fournisseur, connecte sans action humaine | active |
| `profil` | contexte persistant ; l'opérateur se connecte une fois en CP-0, puis le cookie du fournisseur rend les reconnexions silencieuses | active |
| `cdp` | rattachement à un Chrome déjà ouvert et connecté (`chromium.connectOverCDP` sur `127.0.0.1`) | active |
| `etat` | session importée pour un navigateur sans tête | réservée à D20 (point E4) : refusée au démarrage |

- `session.verifier()` ouvre l'URL protégée du profil. Une redirection vers l'origine du fournisseur SSO signifie une session absente ou expirée.
- `session.etablir()` applique la stratégie configurée. Si la page protégée n'est pas atteinte sans action humaine, CP-0 s'ouvre : fenêtre visible, le système n'y saisit rien. Il ne ferme CP-0 qu'après avoir atteint seul la page protégée.
- Avec la stratégie `integree`, le processus Node et Chromium tournent sur le système où l'authentification intégrée du poste fonctionne, sous Windows en général (module `exploitation`).
- Les rôles de l'application que porte la session sont déclarés par un humain dans la configuration (`session.roles`) : le système ne les déduit pas de la session. Le `plan` s'en sert pour la jouabilité des scénarios `@role-<nom>` (D3.INV-5).
- Le profil de session vit hors du projet et du dépôt, dans le dossier que fixe la configuration humaine, en mode 0700 pour le dossier et 0600 pour les fichiers. Son contenu n'est jamais lu par un autre module, jamais journalisé, jamais transmis au moteur.

## 2. Origines (D4.INV-2)

- Le profil d'environnement déclare les origines autorisées : celle de l'application, celle de son API, celle du fournisseur SSO.
- `context.route('**/*', …)` laisse passer une requête vers une origine autorisée et interrompt toute autre requête avant chargement (`route.abort('blockedbyclient')`).
- Une navigation bloquée fait échouer l'étape ; le journal porte l'événement `origine.bloquee` avec l'origine visée.

## 3. Jeu d'actions fermé (D4.INV-4, D4.INV-5)

| Action | Effet | Champs |
|---|---|---|
| `naviguer` | aller à une URL relative à l'URL de base | `url` |
| `cliquer` | cliquer la cible | `cible`, `mutation` facultatif |
| `saisir` | remplir un champ | `cible`, `valeur` |
| `choisir` | choisir une option | `cible`, `valeur` |
| `cocher` | cocher ou décocher | `cible`, `valeur` booléenne |
| `survoler` | survoler la cible | `cible` |
| `touche` | presser une touche | `touche` |
| `televerser` | téléverser un fichier de `test/donnees/` | `cible`, `fichier` |
| `attendre` | attendre un état : `visible`, `masque`, `actif`, `inactif`, `url`, `texte` | `cible` ou `url`, `etat` |
| `verifier` | constater un attendu : `contient`, `visible`, `valeur`, `nombre`, `url`, `actif` ; depuis 1.3.0, les attendus perceptifs `position`, `absence`, `chaqueCellule`, `titre` (section 6.3) | `critere`, `cible`, `attendu`, `canaux` pour un attendu perceptif |
| `auditer` | réservée à l'accessibilité (D19, point E2) | rejetée en 1.x |

Résolution d'une cible, dans l'ordre des stratégies du profil : `getByRole(role, { name })`, `getByLabel`, `getByTestId` (attribut d'identifiant de test du profil), `getByText`, `getByPlaceholder`, puis `locator(css)` en dernier recours. Les localisateurs de Playwright sont stricts : une cible ambiguë échoue au lieu de cliquer au hasard. Pour la zone d'un attendu perceptif, le nom d'un rôle se compare exactement (`exact: true`).

- Le module n'emploie ni `page.evaluate`, ni `addScriptTag`, ni `addInitScript`, ni `waitForTimeout` ; un test le vérifie sur les sources.
- `attendre` et `verifier` interrogent l'état jusqu'à son obtention, dans un délai borné : 10 secondes par défaut, 30 au plus (configuration humaine). Entre deux interrogations, l'intervalle suit ceux de Playwright (100, 250, 500, puis 1 000 ms) ; ce n'est pas une attente de durée : l'étape s'arrête dès que l'état est obtenu.

## 4. Étapes et réessais (D4.INV-6, D25.INV-7)

- Une étape de mutation porte `mutation` : `creation`, `modification` ou `suppression`. Une fois l'action exécutée, elle n'est jamais rejouée, même en cas d'échec de l'étape suivante.
- Une étape `verifier`, ou une étape dont l'action n'a pas eu lieu (cible non encore présente), est retentée deux fois au plus (règle `budget.reessaiEtape`).
- Un succès obtenu au réessai classe l'étape `INSTABILITE`, jamais « réussie ».
- Avant de jouer une étape `suppression`, le navigateur lit le texte de l'élément résolu : s'il ne contient pas le préfixe `A2T-<campagne>-`, l'étape n'est pas jouée et le scénario est bloqué (D7.INV-3).
- Une étape `verifier` échouée n'arrête pas les étapes `verifier` qui la suivent : aucune ne change la page, et chaque critère reçoit son témoignage. Toute autre étape échouée arrête le scénario ; les étapes suivantes sont « non jouées », avec le motif.

## 5. Preuves

- Une capture par étape `verifier` et par échec, avec les zones sensibles de l'écran masquées (option `mask`, localisateurs du profil). Pour un attendu perceptif, la capture est celle de la zone regardée ; si la zone n'est pas vue, celle de la page.
- Pour chaque étape `verifier` à attendu perceptif, la perception en JSON (`agent2test.perception/1`) : l'étape, l'arbre de la zone avec les boîtes, l'arbre de la page s'il a servi, les arrêts du parcours clavier, la capture et son empreinte, les références et le seuil employés, et le constat rendu (D25.INV-2).
- Une trace par scénario : `context.tracing.start({ screenshots: true, snapshots: true })`, puis `trace.zip`.
- Un instantané ARIA à chaque échec (`page.ariaSnapshotJSON()`).
- Les erreurs de console (`page.on('console')`, type `error`) et les réponses de statut 400 ou plus (`page.on('response')`) sont relevées et versées au résultat d'étape.
- Avant d'écrire une trace dans le dossier des preuves, le navigateur réécrit son archive : la valeur des en-têtes `Authorization`, `Cookie` et `Set-Cookie` est remplacée par `[expurgé]`. L'enregistrement HAR est désactivé par défaut ; activé, il subit la même expurgation.
- Chemins : `preuves/<campagne>/<scénario>/<n>.png`, `<n>-perception.json`, `trace.zip`, `aria-<n>.json` ; chaque fichier a son empreinte SHA-256, enregistrée dans les tables de l'espace `execution`.

## 6. Constat perceptif (D25)

### 6.1 Principe

Le navigateur répond à une question qu'une personne se poserait devant l'écran : « est-ce que je vois ceci, là ? ». Il ne lit de la page que ce qu'une personne perçoit, et il dit ce qu'il a regardé, ce qu'il a vu, ce qu'il n'a pas vu, et avec quelle règle il a comparé.

Trois erreurs qu'une personne ne fait pas, et que des contrôles sur le DOM font :

| Erreur | Exemple | Garde |
|---|---|---|
| prendre l'ordre du DOM pour l'ordre vu | `th:last-child` n'est pas la colonne de droite quand le tableau est en `dir="rtl"` | la vue lit les boîtes (D25.INV-1) |
| conclure à l'absence sans avoir vu la zone | sur une page sans tableau, « pas de colonne checklist à droite » est vrai | absence ancrée (D25.INV-3) |
| prendre une sous-chaîne pour le texte | `getByText('REE')` trouve « REE 2026 » et les cellules « REE-2026-014 » | comparaison déclarée (D25.INV-5) |

### 6.2 Les trois canaux (D25.INV-1)

| Canal | Ce qu'il perçoit | Source |
|---|---|---|
| `vue` | ce qui est affiché : présence, position, ordre à l'écran, texte des légendes et des titres, dessin d'un pictogramme | boîtes de l'arbre d'accessibilité (`locator.ariaSnapshotJSON({ boxes: true })`), capture de la zone (`locator.screenshot({ scale: 'css' })`) |
| `lecteur` | ce qu'entend une personne qui utilise un lecteur d'écran : rôles, noms accessibles, ordre de lecture | rôles et noms du même arbre |
| `clavier` | ce qu'atteint une personne qui navigue à la touche Tab | arrêts successifs de `page.keyboard.press('Tab')`, élément `:focus` décrit par son arbre et sa boîte |

- Rien d'autre n'établit un constat : ni sélecteur CSS sur la structure, ni attribut, ni `textContent`, ni code exécuté dans la page. Un élément sans surface (boîte de largeur ou de hauteur nulle) n'est pas vu.
- Un attendu déclare ses canaux (`canaux`) ; à défaut, ceux de la section 6.3. Seuls les canaux déclarés décident du constat ; un canal non déclaré qui voit autre chose est rapporté en remarque (D25.INV-7). Exemple : la colonne affichée à droite mais lue en premier par un lecteur d'écran.
- Ordre de lecture et ordre à l'écran peuvent diverger : le constat le dit, il ne choisit pas en silence.

### 6.3 Attendus perceptifs

Chaque attendu porte sur une zone, la `cible` de l'étape (un tableau, par exemple), qui sert d'ancre.

| Attendu | Champs | Question | Canaux possibles, défaut en gras |
|---|---|---|---|
| `position` | `role`, `nom`, `bord` (`gauche`, `droite`, `haut`, `bas`), `comparaison` | l'élément de ce rôle qui se trouve à ce bord de la zone porte-t-il ce nom ? | **`vue`** (boîtes), `lecteur` (premier ou dernier lu) |
| `absence` | `role`, `nom`, `bord` facultatif, `comparaison` | l'élément à ce bord, ou aucun élément de la zone sans `bord`, ne porte pas ce nom | **`vue`**, `lecteur` |
| `chaqueCellule` | `colonne`, `comparaison`, `auMoins` (1 par défaut), `contient.lien.icone` facultatif | chaque cellule de la colonne contient-elle un lien, nommé, atteint au clavier, et dont le dessin est le pictogramme ? | **`vue`**, **`lecteur`**, **`clavier`** |
| `titre` | `texte`, `comparaison` | le titre du tableau est-il ce texte ? | **`vue`** (légende, sinon titre juste au-dessus), **`lecteur`** (nom accessible du tableau) |

- La cellule d'une colonne est celle dont le centre horizontal tombe dans la boîte de l'en-tête : c'est ce qu'une personne lit sous l'en-tête. Plusieurs colonnes du même nom sont toutes examinées.
- Pour le canal `lecteur`, `chaqueCellule` exige dans chaque cellule un seul lien, avec un nom accessible non vide et une adresse ; pour `clavier`, que chacun de ces liens soit un arrêt de la touche Tab, reconnu par son rôle, son nom, son adresse et sa position dans la zone.
- Un attendu perceptif d'un autre type est un ajout au jeu fermé : il passe par une version de la spécification.

### 6.4 Ancre et portée (D25.INV-3, D25.INV-4)

- L'ancre est vue quand la zone est visible ; pour `position` et `absence`, elle contient en outre au moins un élément visible du rôle observé, et pour `chaqueCellule`, l'en-tête de la colonne. Sans ancre, le constat est `NON_CONSTATABLE`, et le témoignage dit ce qui est vu à la place sur la page : titres, liens, textes, au plus six.
- Une absence ne se dit que dans une portée vue, et le témoignage la nomme : « les 5 en-têtes de colonne du tableau « REE » ».
- `chaqueCellule` exige au moins `auMoins` cellules sous l'en-tête. Un tableau sans ligne de données rend le constat `NON_CONSTATABLE`, motif `ensemble-vide` : « chaque » sur un ensemble vide ne prouve rien.

### 6.5 Comparaison déclarée (D25.INV-5)

`comparaison` est obligatoire : `{ "mode": "exacte" | "contient", "casse": "exacte" | "ignoree" }`. Les espaces sont toujours normalisés (espaces multiples, insécables, bords). « Seulement », « exactement », « le seul mot » s'écrivent `exacte`. Le témoignage cite la règle employée.

### 6.6 Pictogrammes (D25.INV-6)

- Un pictogramme se reconnaît par ressemblance à une image de référence, comme une personne reconnaît un œil après l'avoir vu une fois. Aucune classe d'icône, aucun nom de fichier, aucune ligature n'entre en jeu.
- Les références font partie du profil d'environnement (`references.pictogrammes` : nom, fichier, empreinte, origine) et sont ratifiées en CP-2 avec lui. `capturerReference(cible, nom)` les propose, à partir d'un élément désigné par l'opérateur (`designer()`) ou d'une page du système de design. Une référence se capture sur le poste qui joue les campagnes.
- Ressemblance, sans dépendance, sur les octets PNG : fond pris comme la couleur la plus fréquente ; encre mesurée comme l'écart au fond au-delà d'un plancher qui ignore les filets clairs ; dessin recadré sur l'encre, centré dans un carré, réduit à une grille de 16 × 16 ; similarité de Ruzicka des deux grilles adoucies d'un flou 3 × 3, pondérée par la silhouette (rapport des proportions, sans pénalité sous 20 % d'écart). Insensible à la couleur, à la taille et à la position du dessin.
- Le pictogramme est reconnu si la ressemblance atteint `vision.seuil` (0,80 par défaut, entre 0,70 et 0,95, module `referentiel`). Mesures de l'exemple TAB-1, référence de 48 px : œil de 16 à 64 px, bleu, noir ou rouge, de 0,88 à 0,95 ; œil barré, de 0,46 à 0,54 ; crayon, loupe, coche, cercle, sous 0,30.
- Une référence non ratifiée, ou dont l'empreinte a changé, n'est pas chargée : le parcours qui la demande est rejeté (contrôle `parcours.reference-ratifiee`) et, à l'exécution, le constat est `NON_CONSTATABLE`, motif `reference-absente`, sans réessai.

### 6.7 Regarder (D25.INV-8)

Un regard sur une zone :

1. arbre de la zone avec les boîtes ;
2. capture de la zone ;
3. arbre de la zone de nouveau : si ses rôles ou ses boîtes diffèrent du premier, boîtes ramenées à l'origine de la zone pour que le défilement ne compte pas, la zone a bougé pendant le regard, qui ne vaut rien ; les textes n'entrent pas dans cette comparaison, et une horloge qui tourne dans une cellule ne rend pas la zone instable ;
4. selon l'attendu, arbre de la page avec les boîtes (titre juste au-dessus du tableau) et parcours clavier : touche Tab jusqu'à revenir au premier arrêt, au plus deux fois le nombre d'éléments interactifs plus quatre, puis le focus est rendu.

L'étape `verifier` regarde, constate, et recommence à l'intervalle suivant tant que le constat n'est pas obtenu, dans le délai borné. Un constat `CONSTATE` n'est retenu qu'après un second regard, à 100 ms, qui rend le même constat. Des regards discordants donnent le signal « regards discordants ».

### 6.8 Constat (D25.INV-2)

Le constat est une fonction pure de la perception et des références ratifiées : sans navigateur, sans horloge. `reconstater(preuves)` le recalcule depuis les fichiers scellés.

| État | Sens | Statut de l'étape | Signaux, cause présumée (module `verdict`) |
|---|---|---|---|
| `CONSTATE` | l'attendu est vu, par chaque canal déclaré, et confirmé | réussie | aucun |
| `CONTREDIT` | l'ancre est vue, l'attendu ne l'est pas par au moins un canal déclaré | échouée | « ancre vue », « regard porté », « attendu contredit » : `DEFAUT_APPLICATIF` |
| `NON_CONSTATABLE`, ancre non vue, colonne non vue, référence absente | rien ne permet de juger | échouée | « cible introuvable » : `DEFAUT_PARCOURS` |
| `NON_CONSTATABLE`, ensemble vide | il n'y a rien à examiner | échouée | « ensemble vide » : `INDETERMINE` |
| `NON_CONSTATABLE`, canal non perçu, capture absente | une preuve manque | échouée | « preuve manquante » : `INDETERMINE`, critère « non vérifié » |
| regards discordants, ou zone instable à chaque regard | la page bouge | échouée | `INSTABILITE` |

### 6.9 Témoignage (D25.INV-7)

Chaque étape `verifier` rend, réussie ou non, un témoignage versé au résultat d'étape, puis au journal de tests (module `journal`) :

```json
{
  "etat": "CONTREDIT",
  "motif": null,
  "portee": "les 5 en-têtes de colonne du tableau « REE »",
  "canaux": ["vue"],
  "comparaison": "texte exact, espaces normalisés, casse ignorée",
  "vu": ["[vue] au bord gauche : « Statut »", "[vue] « Checklist » en position 5 sur 5 en partant de la gauche"],
  "nonVu": ["[vue] « checklist » au bord gauche"],
  "remarques": ["canal lecteur, non demandé (constaté) : vu, lu en premier : « Checklist », sur 5 en-têtes de colonne"],
  "regards": 5
}
```

Le témoignage décrit, il n'interprète pas : il ne nomme ni classe, ni composant, ni cause dans le code. La cause présumée reste au module `verdict`.

### 6.10 Cycle de l'échelle Étape, pour un attendu perceptif

| Phase | Opération |
|---|---|
| E1 Éléments | attendu, canaux, comparaison, références ratifiées |
| E2 Espace | zone résolue ; ancre vue ou non |
| E3 Engendrent | regarder : arbres, capture, parcours clavier ; aucune mutation |
| E4 État | constater, fonction pure de la perception |
| E5 Expression | témoignage, perception et capture scellées |
| E6 Évolutif | second regard, interrogation suivante, réessai borné |
| E7 Environnement | résultat d'étape remonté au scénario |

### 6.11 Frontière avec l'accessibilité (D19)

Constater le rôle, le nom accessible d'un élément ou l'atteinte au clavier, c'est rendre compte de ce que perçoit une personne : cela relève de D25. Juger la conformité d'un écran à un référentiel (RGAA, WCAG) reste l'action `auditer`, réservée (point E2) : D25 n'emploie pas axe-core et ne rend aucun verdict d'accessibilité.

## 7. Autres actions

| Action | Rôle |
|---|---|
| `sonder()` | requête HTTP vers l'URL de base et, si le profil la déclare, vers l'URL de santé de l'API ; rend `{ repond, statut, dureeMs }` |
| `instantane(url)` | pour le `scanner` : navigation seule, instantané ARIA en JSON, capture masquée |
| `resoudre(cibles)` | pour le `preparateur` : résout des cibles dans la page courante ou un instantané |
| `jouer(parcours, mode)` | joue un parcours ; `mode` : `probatoire` ou `campagne` ; rend les résultats d'étape, les témoignages et les preuves |
| `designer()` | ouvre la fenêtre et laisse l'opérateur désigner un élément (`page.pickLocator()`, Playwright 1.59 ou plus récent) ; rend la cible correspondante |
| `capturerReference(cible, nom)` | capture un élément visible pour proposer une référence de pictogramme, à ratifier en CP-2 avec le profil |
| `reconstater(preuves)` | recalcule le constat d'une étape depuis ses preuves scellées, sans navigateur ; rend `{ identique, constat }` |

Événements : `session.expiree`, `etape.jouee`, `origine.bloquee`.

## 8. Simulation

- Tests unitaires : un monde simulé remplace Playwright. Il décrit des pages par leur arbre ARIA et accepte des défauts injectés : `cible-obsolete`, `session-expiree`, `defaut-applicatif`, `instabilite`, `application-injoignable`. Depuis 1.3.0, il décrit aussi des perceptions : arbre avec les boîtes, capture, arrêts du clavier ; le constat se teste sur elles, sans navigateur.
- Tests d'intégration : Playwright pilote l'application de démonstration servie sur `127.0.0.1` par les tests, avec un fournisseur SSO simulé sur une autre origine. Aucun accès réseau. L'application de démonstration comprend la page de l'exemple TAB-1 et ses contre-épreuves (section 11).

## 9. Pièges connus

- **Attente d'une durée** : jamais ; un rendu Angular différé s'attend par un état.
- **Rejeu d'un clic « Enregistrer »** : une mutation exécutée ne se rejoue pas, même si la capture qui suit échoue.
- **Trace non expurgée** : l'archive de trace contient les en-têtes réseau ; elle passe par l'expurgation avant d'être gardée.
- **Identifiant saisi dans la page du fournisseur** : jamais, même en simulation.
- **Absence prise sur une page pas encore prête** : « l'élément n'est pas visible » est vrai sur une page vide ou en cours de chargement ; le parcours attend la fin du chargement (`attendre`), et l'absence exige son ancre.
- **Ordre du DOM pris pour l'ordre vu** : `th:first-child` est à droite en `dir="rtl"`, et l'ordre `order` d'une grille CSS ne change pas le DOM ; seules les boîtes disent la gauche et la droite.
- **Sous-chaîne prise pour le texte** : `getByText('REE')` et `getByRole(…, { name: 'REE' })` sans `exact` trouvent « REE 2026 » ; un attendu perceptif déclare toujours sa comparaison.
- **Pictogramme reconnu par sa classe** : `pi-eye` ou `<mat-icon>visibility</mat-icon>` disent ce que le code voulait, pas ce qui s'affiche ; la ressemblance à une référence ratifiée le dit.
- **Liens homonymes au clavier** : deux liens de même nom et de même adresse dans une ligne sont deux arrêts ; le repère porte aussi la position dans la zone.
- **Focus resté sur la page** : le parcours clavier rend le focus, pour que le contour de focus ne change pas la capture suivante.

## 10. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| NA1 | D4.INV-1 | seul `src/agents/navigateur/` importe `playwright` (analyse des sources) |
| NA2 | D4.INV-2 | une navigation vers une origine non déclarée est bloquée avant chargement ; le journal porte l'origine visée |
| NA3 | D4.INV-3 | après une campagne, aucun cookie ni jeton n'apparaît dans le journal, les preuves, la configuration ou les contextes du moteur |
| NA4 | D4.INV-3 | une trace conservée ne contient aucune valeur d'en-tête `Authorization`, `Cookie` ou `Set-Cookie` |
| NA5 | D4.INV-3 | le profil de session est créé hors du projet, en mode 0700, ses fichiers en 0600 |
| NA6 | D4.INV-4 | les sources du module n'emploient ni `page.evaluate`, ni `addScriptTag`, ni `addInitScript` |
| NA7 | D4.INV-5 | les sources n'emploient pas `waitForTimeout` ; un `attendre` sur un élément qui apparaît après 2 secondes réussit sans durée fixe |
| NA8 | D4.INV-6 | une étape `cliquer` de mutation exécutée n'est pas rejouée quand l'étape suivante échoue |
| NA9 | D4.INV-6 | une étape `verifier` qui échoue puis réussit au premier réessai est classée `INSTABILITE` |
| NA10 | D4.INV-7 | avec la stratégie `integree` et un fournisseur simulé qui connecte sans saisie, CP-0 ne s'ouvre pas |
| NA11 | D4.INV-7 | quand le fournisseur simulé exige une saisie, CP-0 s'ouvre ; il ne se ferme qu'après l'accès à la page protégée |
| NA12 | point E4 | la stratégie `etat` est refusée au démarrage |
| NA13 | point E2 | un parcours qui contient `auditer` n'est pas joué : « action réservée » |
| NA14 | D7.INV-3 | une étape `suppression` sur un élément sans préfixe n'est pas jouée et bloque le scénario |
| NA15 | D25.INV-1 | en perception simulée, une colonne lue en premier mais dont la boîte est la plus à droite est vue au bord droit ; la remarque cite l'ordre de lecture ; les sources du constat n'emploient ni `getAttribute`, ni `textContent`, ni évaluation |
| NA16 | D25.INV-2 | chaque constat de la recette TAB-1 se recalcule à l'identique depuis ses preuves ; une capture altérée rend « capture altérée » |
| NA17 | D25.INV-3 | sur une page sans tableau, l'absence au bord droit est `NON_CONSTATABLE`, et le témoignage cite ce qui est vu à la place ; un en-tête de boîte nulle ne compte pas comme ancre |
| NA18 | D25.INV-4 | `chaqueCellule` sur un tableau sans ligne est `NON_CONSTATABLE`, motif `ensemble-vide` ; le critère est « non vérifié », jamais « conforme » |
| NA19 | D25.INV-5 | un attendu sans `comparaison` est refusé ; « REE 2026 » ne vaut pas « REE » en comparaison `exacte` ; « Checklist » vaut « checklist » en casse `ignoree` |
| NA20 | D25.INV-6 | l'œil barré n'est pas reconnu comme l'œil (ressemblance sous 0,80) ; une référence dont l'empreinte a changé n'est pas employée, le constat est `NON_CONSTATABLE` sans réessai |
| NA21 | D25.INV-7 | une étape `verifier` réussie porte son témoignage ; un canal déclaré non perçu rend le constat `NON_CONSTATABLE` ; une `verifier` échouée n'empêche pas la suivante d'être jouée |
| NA22 | D25.INV-8 | une zone dont la géométrie change entre les deux arbres d'un regard ne donne aucun constat, un texte qui change sans rien déplacer non ; un constat vu puis contredit au second regard ne rend pas l'étape réussie |
| NA23 | D25.INV-1 à D25.INV-8 | recette TAB-1 : la page conforme et treize contre-épreuves reçoivent chacune leurs verdicts attendus et les fragments attendus de leur témoignage (section 11) |

## 11. Exemple TAB-1 : une personne regarde un tableau

La demande : la colonne « checklist » est à gauche du tableau et pas à sa droite (CA01) ; ses données sont des liens, accessibles par une icône « œil » (CA02) ; le titre du tableau est le seul mot « REE » (CA03).

```json
{
  "id": "P/TAB-1-S01", "version": 1, "scenario": "TAB-1-S01", "criteres": ["TAB-1-CA01", "TAB-1-CA02", "TAB-1-CA03"],
  "etapes": [
    { "n": 1, "action": "naviguer", "url": "/montableau.html" },
    { "n": 2, "action": "attendre", "cible": { "texte": "Chargement en cours" }, "etat": "masque" },
    { "n": 3, "action": "verifier", "critere": "TAB-1-CA01", "cible": { "role": "table" }, "canaux": ["vue"],
      "attendu": { "position": { "role": "columnheader", "nom": "checklist", "bord": "gauche", "comparaison": { "mode": "exacte", "casse": "ignoree" } } } },
    { "n": 4, "action": "verifier", "critere": "TAB-1-CA01", "cible": { "role": "table" }, "canaux": ["vue"],
      "attendu": { "absence": { "role": "columnheader", "nom": "checklist", "bord": "droite", "comparaison": { "mode": "exacte", "casse": "ignoree" } } } },
    { "n": 5, "action": "verifier", "critere": "TAB-1-CA02", "cible": { "role": "table" }, "canaux": ["vue", "lecteur", "clavier"],
      "attendu": { "chaqueCellule": { "colonne": "checklist", "comparaison": { "mode": "exacte", "casse": "ignoree" }, "auMoins": 1, "contient": { "lien": { "icone": "oeil" } } } } },
    { "n": 6, "action": "verifier", "critere": "TAB-1-CA03", "cible": { "role": "table" }, "canaux": ["vue", "lecteur"],
      "attendu": { "titre": { "texte": "REE", "comparaison": { "mode": "exacte", "casse": "exacte" } } } }
  ]
}
```

Le champ `origine` du parcours est omis ici pour la lecture.

Contre-épreuves de l'application de démonstration, chacune ne change qu'un aspect de la page conforme, et verdicts attendus :

| Page | CA01 | CA02 | CA03 | Ce que le témoignage doit dire |
|---|---|---|---|---|
| conforme | conforme | conforme | conforme | « Checklist » au bord gauche, « Statut » au bord droit ; l'œil dans 3 cellules sur 3 ; 3 liens nommés, 3 atteints à la touche Tab ; légende et nom accessible « REE » |
| colonne à droite | non conforme | conforme | conforme | au bord gauche, « Référence » ; « Checklist » au bord droit |
| colonne doublée | non conforme | conforme | conforme | « Checklist » aux deux bords ; 6 cellules examinées |
| `dir="rtl"` | non conforme | conforme | conforme | au bord gauche, « Statut » ; remarque : « Checklist » lue en premier |
| œil barré | conforme | non conforme | conforme | le dessin ne ressemble pas à l'œil ; les liens sont nommés |
| lien sans nom | conforme | non conforme | conforme | l'œil est vu ; un lecteur d'écran annonce seulement « lien » |
| icône sans lien | conforme | non conforme | conforme | l'œil est vu ; aucun lien, rien à atteindre au clavier |
| lien hors clavier (`tabindex="-1"`) | conforme | non conforme | conforme | l'œil est vu, le lien est nommé, il n'est pas atteint à la touche Tab |
| titre « REE 2026 » | conforme | conforme | non conforme | légende « REE 2026 » ; non vu, « REE » seul |
| titre au-dessus, non associé | conforme | conforme | non conforme | vu au-dessus du tableau, « REE » ; le tableau n'a pas de nom accessible |
| tableau sans ligne | conforme | non vérifié | conforme | l'en-tête est vu ; aucune ligne de données sous l'en-tête |
| service indisponible, sans tableau | non vérifié | non vérifié | non vérifié | le tableau, nulle part ; vu à la place, « Le service est indisponible. » |
| chargement en 1,5 s | conforme | conforme | conforme | comme la page conforme, sans attente de durée |
| chronomètre dans la colonne Date, à chaque image | conforme | conforme | conforme | comme la page conforme : un texte qui change ne rend pas la zone instable |

## 12. Fichiers à produire

- `src/agents/navigateur/agent.js`, `src/agents/navigateur/session.js`, `src/agents/navigateur/origines.js`
- `src/agents/navigateur/actions.js`, `src/agents/navigateur/cibles.js`, `src/agents/navigateur/etape.js` (cycle Étape)
- `src/agents/navigateur/regard.js` (regard, parcours clavier, capture de référence), `src/agents/navigateur/constats.js` et `src/agents/navigateur/vision.js` (fonctions pures, D25)
- `src/agents/navigateur/preuves.js`, `src/agents/navigateur/expurgation.js`, `src/agents/navigateur/sonde.js`
- `src/agents/navigateur/monde-simule.js`
- `schemas/perception.json`
- `test/navigateur/*.test.js`, `test/fixtures/appli-web/` (application de démonstration, page de l'exemple TAB-1 et ses contre-épreuves, fournisseur SSO simulé)
