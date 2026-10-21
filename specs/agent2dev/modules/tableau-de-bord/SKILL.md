---
name: tableau-de-bord
description: Tableau de bord d'Agent2Dev (IHM HTTP et SSE sur 127.0.0.1, HTML et JavaScript natifs sans cadre, amorçage par code à usage unique et cookie de session, contrôle d'origine des requêtes qui modifient, vues développeur et gouvernance, droits de décision par rôle, CP-4 seulement ici, chaque point avec son objet et ses preuves côte à côte, vue des patchs et commande git am, arbre 7E, arrêt d'urgence, aucun rafraîchissement automatique du contenu à décider, conformité RGAA 4.1 A et AA, textes en français, notice et limites). À implémenter au lot 8.
dimensions: [D19]
status: active
---

# Module `tableau-de-bord` (D19)

L'IHM du développeur et du référent. Elle montre l'état des demandes et recueille les décisions humaines. Elle n'agit qu'en relayant ces décisions à l'`orchestrateur` et au `referentiel`.

## 1. Serveur et accès (D18.INV-1)

- HTTP sur `127.0.0.1:4600` seulement, ou le port de l'instance (module `exploitation`, section 3) ; flux SSE sur `/flux`.
- Au démarrage, le processus affiche une URL d'amorçage qui contient un code à usage unique. Ouverte dans le navigateur, elle échange ce code contre un cookie de session `HttpOnly`, `SameSite=Strict`, lié à un utilisateur de la configuration humaine. Toute autre route exige ce cookie, ou un jeton porteur pour un client local.
- Une requête qui modifie quelque chose (décision, soumission, arrêt) exige aussi un en-tête `Origin` égal à l'origine du tableau de bord.
- Le jeton porteur est lu dans un fichier hors dépôt, en mode 0600. Le code d'amorçage est tiré au démarrage, gardé en mémoire et jamais écrit.

## 2. Rôles et droits (D19.INV-1)

| Rôle | Décisions | Vues |
|---|---|---|
| développeur | V0 à V5, attentes, soumission d'une demande, journal de tests, synchronisation annoncée, reprise | demandes, points et attentes, patchs, journal en arbre 7E, livrable |
| référent | CP-4, depuis le tableau de bord seulement : ratifier, amender dans les bornes, refuser | gouvernance : leçons candidates, propositions, suspensions, grand livre, effets mesurés, échappements, dérives, alertes |

- La configuration humaine associe chaque utilisateur à un ou plusieurs rôles ; en local, une même personne peut tenir les deux.
- Une décision envoyée par un rôle qui n'y a pas droit est refusée `DROIT_INSUFFISANT`.
- L'arrêt d'urgence est accessible à tous les rôles, sur chaque page.

## 3. Écrans (D19.INV-2)

Chaque point présente ce qui est à décider, à gauche, et ses preuves, à droite :

| Point | Objet | Preuves |
|---|---|---|
| V0 | profil proposé, écarts de versions, marques « à renseigner » | fichiers et lignes cités par chaque valeur |
| V1 | résumé de l'extraction | `demande.json`, empreinte de la source, limites déclarées |
| V2 | `us.md`, tableau des exigences, questions | fichier Gherkin, sortie de `controler-criteres` et sa ligne « prêts pour la réalisation » |
| V3 | variantes par scénario, recommandation | fiche d'impact, résultats de recherche cités |
| V4 | présentation du scénario au format du skill | diff, sorties des commandes du rouge, du vert et des suites, avertissements de la garde statique |
| V5 | matrice et rapport | projet de commentaire Jira, sorties des scripts, patchs manquants |
| attente | ce qui est à trancher | preuves de l'agent qui l'a ouverte |

- Sous l'objet : les boutons de décision et le champ de commentaire, obligatoire quand la décision l'exige (module `orchestrateur`, section 4).
- **Patchs** : chaque patch remis, avec son scénario, son état (appliqué, en attente), son téléchargement, et la commande `git am -3` à copier (module `depot`, section 2).
- **Demande** : état, pas courant, arbre 7E dépliable jusqu'au pas, budgets consommés.
- **Gouvernance** : chaque proposition avec règle, échelle, phase, valeurs, preuves et effet attendu ; chaque leçon avec sa source ; ratifier, amender dans les bornes, refuser.
- **Notice** : mode d'emploi et limites du système. Agent2Dev ne démarre ni ne déploie l'application, ne lance aucun batch, n'écrit ni dans Jira ni en base, ne pousse rien, n'écrit pas dans l'arbre du développeur sans autorisation, et ne ratifie pas ses propres leçons.

## 4. Accessibilité (D19.INV-3)

- HTML sémantique : repères (`header`, `nav`, `main`), titres hiérarchisés, tableaux avec en-têtes, formulaires avec libellés associés, langue `fr` déclarée, titre de page propre à chaque vue, lien d'évitement.
- Tout se fait au clavier, avec un focus visible ; aucune information n'est portée par la seule couleur : un diff marque ses lignes par `+` et `-`, avec leurs numéros ; contrastes d'au moins 4,5 pour 1 pour le texte.
- Aucun rafraîchissement automatique : une mise à jour reçue par le flux SSE est annoncée dans une région `aria-live="polite"`, une alerte critique dans une région `assertive`, mais le contenu affiché ne change que quand l'utilisateur active « actualiser ». Une décision prise sur un objet qui a changé entre-temps est refusée `OBJET_PERIME` (module `orchestrateur`, section 4).
- Les contrôles automatiques sont statiques, avec `node:test` : structure des vues, libellés, langue, titres, lien d'évitement, contrastes calculés depuis les jetons de couleur. Le parcours au clavier, le lecteur d'écran et l'audit RGAA 4.1 complet, aux niveaux A et AA, se font à la recette, avec sa grille.

## 5. Langue

Les textes de l'IHM, les messages et les livrables sont en français ; les identifiants techniques restent sans accents.

## 6. Pièges connus

- **Bibliothèque d'interface** : aucune ; HTML et JavaScript natifs, pour rester sans dépendance (D20.INV-1).
- **Décision CP-4 depuis une autre vue** : le bouton n'existe que dans la vue gouvernance, pour le rôle référent.
- **Contenu qui change sous les yeux** : le développeur déciderait d'autre chose que ce qu'il a lu ; on annonce, on n'actualise qu'à sa demande.
- **Diff en couleurs seules** : illisible sans la couleur ; les signes et les numéros de ligne portent l'information.

## 7. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| TB1 | D18.INV-1 | le serveur n'écoute que sur `127.0.0.1` ; une route sans cookie ni jeton est refusée ; un code d'amorçage ne sert qu'une fois ; une décision sans l'en-tête `Origin` du tableau de bord est refusée |
| TB2 | D19.INV-1 | une décision CP-4 envoyée par un utilisateur au seul rôle développeur est refusée `DROIT_INSUFFISANT` ; par le référent, elle est relayée au `referentiel` |
| TB3 | D19.INV-1 | une décision V4 envoyée par un utilisateur au seul rôle référent est refusée |
| TB4 | D19.INV-2 | la vue de V2 porte `us.md`, le fichier Gherkin et la sortie du script ; celle de V4, la présentation, le diff et les sorties des commandes |
| TB5 | D19.INV-3 | chaque vue a un titre, des repères, un `h1`, des libellés de formulaire, la langue `fr` et un lien d'évitement (analyse statique) |
| TB6 | D19.INV-3 | une mise à jour reçue par le flux SSE est annoncée dans la région `aria-live` et ne remplace pas le contenu à décider ; la vue change à « actualiser » |
| TB7 | D19.INV-3 | les contrastes calculés depuis les jetons de couleur atteignent 4,5 pour 1 ; le diff marque ajouts et suppressions par leurs signes |
| TB8 | D19.INV-1 | l'arrêt d'urgence est présent et opérant sur chaque vue, pour chaque rôle |
| TB9 | D5.INV-7 | la vue des patchs liste chaque patch avec son état et la commande `git am -3` ; le téléchargement rend le fichier octet pour octet |

## 8. Fichiers à produire

- `src/interfaces/tableau-de-bord/serveur.js`, `src/interfaces/tableau-de-bord/acces.js`, `src/interfaces/tableau-de-bord/flux.js`, `src/interfaces/tableau-de-bord/vues.js`
- `public/index.html`, `public/vues/{demande,point,patchs,gouvernance,notice}.html`, `public/app.js`, `public/styles.css`
- `test/tableau-de-bord/*.test.js`, `docs/grille-rgaa.md`
