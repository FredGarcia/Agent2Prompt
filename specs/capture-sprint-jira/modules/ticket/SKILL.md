---
name: ticket
description: Capture d'un ticket seul par son adresse …/browse/CLÉ (session du navigateur ouvert, mêmes attentes et même MHTML que la capture du sprint, adresse sans clé refusée, dossier choisi par le développeur parmi les catégories et à classer, proposé d'après le dernier rapport.json du dossier de sortie, copie d'un autre dossier retirée, entrée du rapport remplacée ou ajoutée, rapport créé s'il manque, aucune écriture en cas d'erreur, retour à la page d'avant ; interface, API, ligne de commande et agent). À lire pour recapturer ou ajouter un ticket sans relancer le sprint.
dimensions: [D12]
status: active
---

# Module `ticket` (D12)

Phase 7E couverte : État.

## 1. Usage

Un ticket du sprint a changé, un ticket a été ajouté après la capture, ou une capture a échoué : le développeur le capture seul, par son adresse, sans relancer le relevé du sprint. Le navigateur doit être ouvert et connecté, sur le sprint ou sur n'importe quelle page du Jira : la capture se fait dans sa session (D2.INV-1).

| Outil | Comment |
|---|---|
| Interface | section « Un ticket seul » : adresse du ticket, liste « Dossier », bouton « Capturer ce ticket » |
| API | `POST /api/ticket` `{ url, category, categories, folder }`, suivi par `GET /api/status` ; `GET /api/section?url=…&folder=…&categories=…` pour le dossier proposé |
| Ligne de commande | `npm run capture:cli -- --ticket "<adresse du ticket>" [--dossier IA] [--sortie <dossier>]` |
| Agent | `capteur-sprint`, protocole § 5 de sa définition |

## 2. Adresse (D12.INV-1)

L'adresse doit contenir `…/browse/<CLÉ>`, en http ou https. Les paramètres (`?focusedCommentId=…`) et la casse de la clé sont sans effet : l'adresse est ramenée à `…/browse/<CLÉ>`, clé en majuscules. Une adresse sans clé est refusée avant toute capture, avec le message « Adresse de ticket invalide : …/browse/<CLÉ> attendu » (code 400 de l'API, code 2 de la ligne de commande).

La page est attendue et enregistrée exactement comme dans la capture d'un sprint (module `capture`) : page du ticket reconnue par son adresse ou son titre et par la clé affichée (D4.INV-1), défilement tant que le texte s'allonge (D4.INV-2), MHTML de Chrome nommé par la clé (D4.INV-3).

## 3. Dossier (D12.INV-2)

Sans la page du sprint, la section du ticket n'est pas visible : le skill ne la devine pas, le développeur choisit le dossier parmi les catégories de la capture et `à classer`. Un autre nom est refusé.

Le choix est proposé : si le dernier `rapport.json` du dossier de sortie contient le ticket, sans erreur, le skill propose le dossier où il l'a rangé ; sinon, `à classer`. L'interface pré-remplit la liste et dit d'où vient la proposition (« DEMOAB-3500 figure dans le dernier rapport : dossier « IA » proposé. ») ; la ligne de commande l'applique quand `--dossier` manque, et l'annonce avant la capture ; l'agent la soumet au développeur.

## 4. Fichiers et rapport (D12.INV-3)

- Le fichier `<CLÉ>.mhtml` va dans le dossier choisi ; une copie du ticket dans un autre dossier de catégorie est retirée et notée dans `movedFrom`, comme pour le sprint (D11.INV-3).
- Dans `rapport.json`, l'entrée du ticket est remplacée, ou ajoutée, et `counts` et `errors` sont recalculés ; les autres champs ne changent pas. L'entrée garde les champs stables d'un ticket capturé (E1) : `category` est le dossier choisi, ou `null` pour `à classer` ; `where` vaut `choisi par le développeur` ; `excerpt` vaut `null`.
- Sans `rapport.json` dans le dossier, un rapport à ce seul ticket est créé, avec tous les champs stables : `sprintUrl` à `null`, filtre vide, `markers` à zéro.
- En cas d'erreur (page de connexion, délai dépassé), rien n'est écrit : ni fichier, ni rapport. L'erreur s'affiche avec la clé.

## 5. Navigateur (D12.INV-4)

Après la capture, réussie ou non, le navigateur revient à la page où il était, par exemple le sprint : une capture du sprint peut suivre sans le rouvrir. Il reste ouvert dans l'interface ; la ligne de commande, qui l'a ouvert pour ce seul ticket, le ferme. Une seule capture à la fois, de sprint ou de ticket (D6.INV-2).

## 6. Contrôle de sortie

- R16, R17 et R20 du module `recette` passent, et R13 relève le sprint après les captures de R20.
- Sur un vrai Jira : un ticket recapturé seul, dans le dossier de sa section, garde le même nom de fichier et sa ligne du rapport indique `choisi par le développeur`.
