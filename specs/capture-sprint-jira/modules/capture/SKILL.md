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

Il vérifie ces conditions toutes les 400 ms, en tolérant les navigations en cours, par exemple un aller-retour par le fournisseur d'identité. Passé le délai, 20 s par défaut (`JIRA_CAPTURE_PAGE_TIMEOUT_MS`), le ticket est en erreur : « page du ticket non affichée après 20 s (session SSO expirée ?) ». Rien n'est écrit pour lui, et une capture précédente du même ticket reste en place (D11.INV-3). Une page de connexion, une page d'erreur ou la page d'un autre ticket ne sont donc jamais enregistrées sous le nom du ticket.

## 3. Une page complète (D4.INV-2, D4.INV-3)

1. La page défile jusqu'en bas, toutes les 500 ms, par pas de 80 % de la hauteur affichée de chaque bloc qui défile (module `releve`, § 2), jusqu'à ce que, deux pas de suite, rien ne défile ni ne s'ajoute à son texte, quarante pas au plus : les commentaires et l'activité chargés à l'affichage apparaissent.
2. Elle revient en haut, puis le skill attend que la longueur de son texte soit la même sur trois relevés espacés de 500 ms, 10 s au plus.
3. La page est enregistrée par le protocole Chrome DevTools (`Page.captureSnapshot`, format `mhtml`) : le fichier est le même que celui d'« Enregistrer sous… », type « Page Web, un seul fichier », que lit l'ingestion d'`agent-tdd-jira`. Il commence par `From: <Saved by Blink>` et contient la page, ses styles et ses images.
4. Le fichier s'appelle `<CLÉ>.mhtml` et va dans le dossier de sa catégorie (module `classement`).

## 4. Erreurs et arrêt (D4.INV-4)

- Une erreur sur un ticket est notée dans le rapport, avec son message ; la capture passe au ticket suivant.
- Trois erreurs de suite arrêtent la capture : c'est presque toujours une session expirée, et les tickets suivants échoueraient de même. Le rapport le dit (`aborted`), et le navigateur reste ouvert sur le sprint pour se reconnecter (D6.INV-4).
- Fermer le navigateur, par le bouton de l'interface ou à la main, arrête aussi la capture ; le rapport garde ce qui a été capturé. Fermé pendant le relevé, avant le premier ticket, il n'y a rien à rapporter : l'interface affiche « Capture arrêtée : le navigateur a été fermé pendant le relevé des tickets, avant toute capture ».

## 5. Durée

Le faux Jira de la recette se capture en 51 s pour huit tickets, relevé d'un backlog de 72 cartes compris, soit 5 à 6 s par ticket ; en 77 s quand le backlog est une liste virtualisée de 80 pixels de haut, que le relevé parcourt à petits pas. Un vrai Jira, plus lent à afficher, demande davantage : une vingtaine de tickets prend quelques minutes, à mesurer sur le poste.

## 6. Pièges connus

- **Commentaires repliés** : Jira replie les commentaires anciens derrière « Afficher plus » ; le skill ne clique pas dessus, et le fichier ne contient que les commentaires affichés. L'ingestion d'`agent-tdd-jira` déclare alors cette partie comme limite (`agent-tdd-jira:D1.INV-3`).
- **Pièces jointes** : comme pour un enregistrement à la main, le fichier contient les images affichées, pas les pièces jointes téléchargeables.
- **Jira lent** : un délai plus long se règle par `JIRA_CAPTURE_PAGE_TIMEOUT_MS`.

## 7. Contrôle de sortie

- R10, R13, R14, R15 et R17 du module `recette` passent : la page de connexion d'une session expirée n'est jamais enregistrée, le commentaire chargé au défilement figure dans le fichier, la capture s'arrête après trois erreurs de suite ou à la fermeture.
- Le fichier d'un vrai ticket, ouvert dans Chrome ou lu par l'ingestion d'`agent-tdd-jira`, montre le ticket entier.
