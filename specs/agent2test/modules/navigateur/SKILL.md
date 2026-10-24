---
name: navigateur
description: Seul propriétaire de Playwright, piloté comme une bibliothèque depuis Node (session SSO réglée automatiquement par authentification intégrée, CP-0 en repli, aucun identifiant détenu, origines autorisées bloquées avant chargement, jeu d'actions fermé sans évaluation de code, attentes par état, réessais bornés sans rejeu des mutations, preuves masquées et expurgées, instantanés ARIA, désignation interactive, sonde, monde simulé pour les tests). À implémenter au lot 4.
dimensions: [D4]
status: active
---

# Module `navigateur` (D4)

Le `navigateur` est le seul module qui ouvre un navigateur (D4.INV-1). Il importe `chromium` du paquet `playwright` et pilote la bibliothèque directement : ni fichier `.spec.ts`, ni exécuteur `@playwright/test`. Il instancie le cycle de l'échelle Étape (module `noyau`).

## 1. Session (D4.INV-3, D4.INV-7)

| Stratégie | Principe | Statut 1.2.0 |
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
| `verifier` | constater un attendu : `contient`, `visible`, `valeur`, `nombre`, `url`, `actif` | `critere`, `cible`, `attendu` |
| `auditer` | réservée à l'accessibilité (D19, point E2) | rejetée en 1.x |

Résolution d'une cible, dans l'ordre des stratégies du profil : `getByRole(role, { name })`, `getByLabel`, `getByTestId` (attribut d'identifiant de test du profil), `getByText`, `getByPlaceholder`, puis `locator(css)` en dernier recours. Les localisateurs de Playwright sont stricts : une cible ambiguë échoue au lieu de cliquer au hasard.

- Le module n'emploie ni `page.evaluate`, ni `addScriptTag`, ni `addInitScript`, ni `waitForTimeout` ; un test le vérifie sur les sources.
- `attendre` et `verifier` interrogent l'état jusqu'à son obtention, dans un délai borné : 10 secondes par défaut, 30 au plus (configuration humaine).

## 4. Étapes et réessais (D4.INV-6)

- Une étape de mutation porte `mutation` : `creation`, `modification` ou `suppression`. Une fois l'action exécutée, elle n'est jamais rejouée, même en cas d'échec de l'étape suivante.
- Une étape `verifier`, ou une étape dont l'action n'a pas eu lieu (cible non encore présente), est retentée deux fois au plus (règle `budget.reessaiEtape`).
- Un succès obtenu au réessai classe l'étape `INSTABILITE`, jamais « réussie ».
- Avant de jouer une étape `suppression`, le navigateur lit le texte de l'élément résolu : s'il ne contient pas le préfixe `A2T-<campagne>-`, l'étape n'est pas jouée et le scénario est bloqué (D7.INV-3).

## 5. Preuves

- Une capture par étape `verifier` et par échec, avec les zones sensibles de l'écran masquées (option `mask`, localisateurs du profil).
- Une trace par scénario : `context.tracing.start({ screenshots: true, snapshots: true })`, puis `trace.zip`.
- Un instantané ARIA à chaque échec (`page.ariaSnapshotJSON()`).
- Les erreurs de console (`page.on('console')`, type `error`) et les réponses de statut 400 ou plus (`page.on('response')`) sont relevées et versées au résultat d'étape.
- Avant d'écrire une trace dans le dossier des preuves, le navigateur réécrit son archive : la valeur des en-têtes `Authorization`, `Cookie` et `Set-Cookie` est remplacée par `[expurgé]`. L'enregistrement HAR est désactivé par défaut ; activé, il subit la même expurgation.
- Chemins : `preuves/<campagne>/<scénario>/<n>.png`, `trace.zip`, `aria-<n>.json` ; chaque fichier a son empreinte SHA-256, enregistrée dans les tables de l'espace `execution`.

## 6. Autres actions

| Action | Rôle |
|---|---|
| `sonder()` | requête HTTP vers l'URL de base et, si le profil la déclare, vers l'URL de santé de l'API ; rend `{ repond, statut, dureeMs }` |
| `instantane(url)` | pour le `scanner` : navigation seule, instantané ARIA en JSON, capture masquée |
| `resoudre(cibles)` | pour le `preparateur` : résout des cibles dans la page courante ou un instantané |
| `jouer(parcours, mode)` | joue un parcours ; `mode` : `probatoire` ou `campagne` ; rend les résultats d'étape et les preuves |
| `designer()` | ouvre la fenêtre et laisse l'opérateur désigner un élément (`page.pickLocator()`, Playwright 1.59 ou plus récent) ; rend la cible correspondante |

Événements : `session.expiree`, `etape.jouee`, `origine.bloquee`.

## 7. Simulation

- Tests unitaires : un monde simulé remplace Playwright. Il décrit des pages par leur arbre ARIA et accepte des défauts injectés : `cible-obsolete`, `session-expiree`, `defaut-applicatif`, `instabilite`, `application-injoignable`.
- Tests d'intégration : Playwright pilote l'application de démonstration servie sur `127.0.0.1` par les tests, avec un fournisseur SSO simulé sur une autre origine. Aucun accès réseau.

## 8. Pièges connus

- **Attente d'une durée** : jamais ; un rendu Angular différé s'attend par un état.
- **Rejeu d'un clic « Enregistrer »** : une mutation exécutée ne se rejoue pas, même si la capture qui suit échoue.
- **Trace non expurgée** : l'archive de trace contient les en-têtes réseau ; elle passe par l'expurgation avant d'être gardée.
- **Identifiant saisi dans la page du fournisseur** : jamais, même en simulation.

## 9. Tests (scénarios)

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

## 10. Fichiers à produire

- `src/agents/navigateur/agent.js`, `src/agents/navigateur/session.js`, `src/agents/navigateur/origines.js`
- `src/agents/navigateur/actions.js`, `src/agents/navigateur/cibles.js`, `src/agents/navigateur/etape.js` (cycle Étape)
- `src/agents/navigateur/preuves.js`, `src/agents/navigateur/expurgation.js`, `src/agents/navigateur/sonde.js`
- `src/agents/navigateur/monde-simule.js`
- `test/navigateur/*.test.js`, `test/fixtures/appli-web/` (application de démonstration et fournisseur SSO simulé)
