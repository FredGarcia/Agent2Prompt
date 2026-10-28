---
name: session
description: Session SSO de la capture (fenêtre visible du navigateur du poste, connexion faite à la main par le développeur, MFA comprise, aucun identifiant demandé, lu ni stocké, profil de navigateur dédié réutilisé d'une ouverture à l'autre, persistance selon les cookies du SSO, une fenêtre par profil, canal Chrome, Edge ou Chromium, pièges des redirections SSO). À lire avant la première capture.
dimensions: [D2]
status: active
---

# Module `session` (D2)

Phase 7E couverte : Environnement.

## 1. Principe

Derrière un SSO, ni l'API REST de Jira ni un script ne peuvent se connecter avec un mot de passe : la connexion passe par le fournisseur d'identité de l'entreprise, souvent avec une validation sur un second appareil. Le skill ne cherche donc pas à se connecter. Il ouvre une fenêtre visible du navigateur du poste sur la page du sprint, et le développeur s'y connecte lui-même, comme d'habitude (D2.INV-1). La fenêtre s'ouvre en 1 280 × 900 pixels, quelle que soit la taille qu'elle avait gardée : sans écran réel, elle pouvait s'ouvrir à une taille imprévue. Le développeur peut ensuite l'agrandir. Au moment de la capture, elle passe au premier plan, et une fenêtre restée presque sans hauteur est remise à 1 280 × 900 (module `releve`). Le skill ne voit ni identifiant, ni mot de passe, ni code de validation : il n'a aucun champ pour les recevoir, et l'agent refuse de les prendre (module `agent`, A5).

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
