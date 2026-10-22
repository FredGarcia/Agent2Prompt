---
name: tableau-de-bord
description: Tableau de bord d'Agent2Test (IHM HTTP et SSE sur 127.0.0.1, HTML et JavaScript natifs sans cadre, amorçage par code à usage unique et cookie de session, vues testeur, développeur et gouvernance, remises reçues du relais et leur ouverture par un humain, droits de décision par rôle, CP-4 seulement ici, points de contrôle avec preuves côte à côte, arbre 7E, arrêt d'urgence, conformité RGAA 4.1 A et AA, textes en français, notice et limites). À implémenter au lot 7.
dimensions: [D17]
status: active
---

# Module `tableau-de-bord` (D17)

L'IHM de l'opérateur. Elle montre l'état des campagnes et recueille les décisions humaines. Elle n'agit qu'en relayant ces décisions à l'`orchestrateur` et au `referentiel`.

## 1. Serveur et accès (D17.INV-1)

- HTTP sur `127.0.0.1:4700` seulement ; flux SSE sur `/flux` pour les mises à jour en direct, sans rechargement de page.
- Au démarrage, le processus affiche une URL d'amorçage qui contient un code à usage unique. Ouverte dans le navigateur, elle échange ce code contre un cookie de session `HttpOnly`, `SameSite=Strict`, lié à un utilisateur de la configuration humaine. Toute autre route exige ce cookie, ou un jeton porteur pour un client local.
- Le jeton et les codes sont lus dans des fichiers hors dépôt, en mode 0600.

## 2. Rôles et droits (D17.INV-2)

| Rôle | Décisions | Vues |
|---|---|---|
| testeur | CP-0, CP-1, CP-2, CP-3 | campagnes ; points de contrôle ; journal en arbre 7E ; remises reçues |
| développeur | CP-2, CP-5 | défauts applicatifs présumés : étapes de reproduction, captures, trace, erreurs de console et réponses en échec ; remises reçues |
| référent qualité | CP-4, depuis le tableau de bord seulement | gouvernance : propositions, leçons candidates, grand livre, effets mesurés, accord entre contrôles et humains, indicateurs du premier ordre |
| relais | aucune | aucune vue : trois outils MCP, pour n8n (module `relais`) |

- La configuration humaine associe chaque utilisateur à un ou plusieurs rôles ; en local, une même personne peut les tenir tous.
- Une décision envoyée par un rôle qui n'y a pas droit est refusée `DROIT_INSUFFISANT`.
- L'arrêt d'urgence est accessible à tous les rôles humains, sur chaque page. Le rôle `relais` n'a accès à aucune route du tableau de bord.

## 3. Écrans

- **Point de contrôle** : ce qui est à décider, à gauche ; les preuves, à droite (parcours et résultat probatoire en CP-2, captures et trace en CP-3) ; boutons de décision et champ de commentaire, obligatoire pour une correction en CP-1.
- **Campagne** : roue 7E de la campagne, dépliable jusqu'à l'étape ; matrice critères × verdicts ; liens vers les quatre formats du journal de tests.
- **CP-5** : nom du batch à lancer, scénario concerné, boutons « batch lancé et terminé » et « scénario non joué » avec motif.
- **Remises reçues** : chaque remise déposée par le relais, avec sa demande, sa racine, son commit, ses sources et leurs empreintes, les jouables et les préalables qu'elle prévoit, et son état (reçue, ouverte, périmée). Le bouton « ouvrir la campagne », pour le testeur et le développeur, suit le rappel : « Redémarrez l'application sur le Tomcat local depuis le commit remis ; Agent2Test ne la démarre pas. » Une remise périmée nomme le commit, le fichier suivi ou la source qui diffère (module `relais`, section 4).
- **Gouvernance** : chaque proposition avec règle, échelle, phase, valeurs, preuves et effet attendu ; ratifier, amender dans les bornes, refuser.
- **Notice** : mode d'emploi, limites du système (ce qu'il ne fait pas : modifier l'application, la démarrer, lancer un batch, ratifier ses propres leçons).

## 4. Accessibilité (D17.INV-3)

- HTML sémantique : repères (`header`, `nav`, `main`), titres hiérarchisés, tableaux avec en-têtes, formulaires avec libellés associés, langue `fr` déclarée, titre de page propre à chaque vue, lien d'évitement.
- Tout se fait au clavier, avec un focus visible ; aucune information n'est portée par la seule couleur ; contrastes d'au moins 4,5 pour 1 pour le texte.
- Les mises à jour du flux SSE sont annoncées dans une région `aria-live="polite"` ; une alerte critique dans une région `assertive`.
- Les captures ont une alternative textuelle : scénario, étape, attendu, résultat.
- Les contrôles automatiques passent par Playwright (instantané ARIA, parcours au clavier, contrastes calculés depuis les jetons de couleur) ; l'audit RGAA 4.1 complet, aux niveaux A et AA, se fait à la recette, avec sa grille.

## 5. Langue (D17.INV-4)

Les textes de l'IHM, les messages et le journal de tests sont en français ; les identifiants techniques restent sans accents.

## 6. Pièges connus

- **Bibliothèque d'interface** : aucune ; HTML et JavaScript natifs, pour rester dans les deux dépendances d'exécution.
- **Décision CP-4 depuis une autre vue** : le bouton n'existe que dans la vue gouvernance, pour le rôle référent.
- **Flux SSE silencieux pour un lecteur d'écran** : sans région `aria-live`, une alerte en direct n'est pas perçue.

## 7. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| TB1 | D17.INV-1 | le serveur n'écoute que sur `127.0.0.1` ; une route sans cookie ni jeton est refusée ; un code d'amorçage ne sert qu'une fois |
| TB2 | D17.INV-2 | une décision CP-4 envoyée par un testeur est refusée `DROIT_INSUFFISANT` ; par le référent, elle est relayée au `referentiel` |
| TB3 | D17.INV-2 | le développeur confirme un CP-5 ; un testeur ne le peut pas |
| TB4 | D17.INV-3 | chaque vue a un titre, des repères, un `h1`, des libellés de formulaire (instantané ARIA par Playwright) |
| TB5 | D17.INV-3 | un parcours complet de CP-1 se fait au clavier seul, focus visible à chaque étape |
| TB6 | D17.INV-3 | une alerte reçue par le flux SSE est annoncée dans la région `aria-live` |
| TB7 | D17.INV-4 | les textes des vues, des messages et du journal de tests sont en français (liste des chaînes de l'IHM) |
| TB8 | D17.INV-2 | l'arrêt d'urgence est présent et opérant sur chaque vue, pour chaque rôle humain ; un jeton au seul rôle `relais` est refusé sur chaque route |

## 8. Fichiers à produire

- `src/interfaces/tableau-de-bord/serveur.js`, `src/interfaces/tableau-de-bord/acces.js`, `src/interfaces/tableau-de-bord/flux.js`
- `public/index.html`, `public/vues/{campagne,point,gouvernance,developpeur,remises,notice}.html`, `public/app.js`, `public/styles.css`
- `test/tableau-de-bord/*.test.js`, `docs/grille-rgaa.md`
