---
name: classement
description: Classement des tickets capturés par section de la page du sprint (catégories IA et DEV par défaut, texte de l'en-tête et nom du dossier, en-tête visible hors navigation, couloir ou sprint qui contient ses tickets, liste plate où la section va jusqu'à l'en-tête suivant, section gardée dans une liste virtualisée, dossier à classer, avertissements sur une section introuvable ou répétée, dossiers créés directement dans le dossier de sortie, nouvelle capture qui remplace et retire la copie d'un autre dossier, sprint.mhtml et rapport.json et ses champs, migration depuis 1.0). À lire pour régler les sections et lire le rapport.
dimensions: [D11]
status: active
---

# Module `classement` (D11)

Phase 7E couverte : Engendrent.

## 1. Catégories (D11.INV-4)

Une catégorie est à la fois le texte d'un en-tête de section de la page du sprint et le nom du dossier où ses tickets sont rangés. Par défaut : `IA` et `DEV`, les deux parties de la page du sprint du développeur, où chacune s'ouvre sur un `<span>IA</span>` ou un `<span>DEV</span>`. Le développeur peut en donner d'autres, jusqu'à dix, une par ligne dans l'interface ou par `--categorie` en ligne de commande.

Une catégorie est refusée si elle ne peut pas nommer un dossier sous Windows ou sous Linux (plus de 60 caractères, `<`, `>`, `:`, `"`, `/`, `\`, `|`, `?`, `*`, caractère de contrôle, point au début ou à la fin), si elle double une autre une fois normalisée (`IA` et `ia`, `DEV` et `Dév`), ou si elle s'appelle `à classer`, réservé.

## 2. En-têtes de section (D11.INV-1)

Au relevé de la page du sprint (module `releve`), le skill cherche les en-têtes : les éléments dont tout le texte est le nom d'une catégorie. Le texte et le nom sont comparés normalisés : minuscules, accents retirés, blancs, tirets et `_` réduits à une espace. `<span>IA</span>` et `<span> ia </span>` sont des en-têtes `IA` ; « IA · 3 tickets », dans un seul élément, n'en est pas un, mais `<span>IA</span> · 3 tickets` en contient un.

Ne sont pas des en-têtes :

- un élément de la navigation (`nav`, `header`, `aside` et leurs rôles ARIA) : un filtre rapide nommé `IA` dans la barre de Jira ne range aucun ticket ;
- un élément masqué, par exemple dans un menu replié ou une infobulle ;
- un texte placé dans un lien de ticket.

## 3. Section d'un ticket (D11.INV-1, D11.INV-2)

Le bloc d'un en-tête est son plus haut ancêtre qui ne contient ni un autre en-tête, ni un ticket placé avant lui. Deux formes de page en découlent :

| Forme de la page | Bloc de l'en-tête | Section d'un ticket |
|---|---|---|
| Couloirs ou sprints : chaque section est un bloc qui contient son en-tête et ses cartes | le couloir, qui contient des tickets | le couloir qui le contient ; un ticket hors de tout couloir de catégorie, par exemple dans un couloir « Autres », n'en a pas |
| Liste plate : en-têtes et cartes se suivent, au même niveau | l'en-tête seul, sans ticket | le dernier en-tête qui le précède dans la page |

Un ticket sans section va dans `à classer` : aucun en-tête ne le précède, ou il suit la fin d'un couloir. Le skill ne devine jamais : ni par le titre du ticket, ni par sa page, ni par une catégorie majoritaire. Un ticket à classer se décide avec le développeur (module `agent`, D7.INV-2).

Une liste virtualisée retire de la page l'en-tête d'une section dès qu'il sort de l'écran. Les sections sont donc relevées à chaque pas du défilement, avec les liens : un ticket qu'aucun en-tête présent ne précède prend la section où s'arrêtait le pas précédent, et un ticket déjà relevé garde la sienne (D11.INV-2).

## 4. Avertissements (D11.INV-6)

Le relevé compte, pour chaque catégorie, ses en-têtes suivis d'au moins un ticket (`markers` du rapport). Un en-tête qui n'est suivi d'aucun ticket, comme un filtre rapide hors navigation en haut de la page, ne compte pas. À la fin de la capture, l'interface et la ligne de commande signalent :

| Compte | Message | Cause probable |
|---|---|---|
| 0 | « Aucun en-tête « DEV » suivi de tickets sur la page du sprint : vérifiez que la section porte ce nom. » | la section porte un autre nom, ou la page affichée n'est pas celle du sprint |
| 2 ou plus | « « IA » précède 3 groupes de tickets sur la page du sprint : une étiquette de carte porte peut-être ce nom ; vérifiez le classement dans rapport.json. » | une étiquette ou un composant affiché sur les cartes porte le nom d'une catégorie |

Un avertissement n'arrête pas la capture : les fichiers sont écrits, et le développeur décide.

## 5. Dossiers (D11.INV-3)

Les dossiers de catégorie, et `à classer` s'il sert, sont créés directement dans le dossier de sortie choisi, sans sous-dossier. Une nouvelle capture dans le même dossier :

- remplace le fichier de chaque ticket recapturé ;
- retire la copie d'un ticket qui serait restée dans un autre dossier de catégorie, par exemple un ticket passé d'`à classer` à `DEV` depuis la capture précédente, et le note dans `movedFrom` ;
- laisse en place les tickets qu'elle ne recapture pas, et la capture précédente d'un ticket en erreur.

Pour un nouveau sprint, le développeur choisit un nouveau dossier de sortie, ou vide l'ancien : le skill ne supprime jamais un ticket qu'il n'a pas recapturé.

## 6. Rapport (D11.INV-5)

Chaque capture écrit, dans le dossier de sortie, `sprint.mhtml`, la page du sprint telle qu'elle était au relevé, et `rapport.json`, qui décrit la dernière capture. Ses champs sont stables (E1) :

| Champ | Contenu |
|---|---|
| `date` | début de la capture, ISO 8601 |
| `sprintUrl` | adresse de la page du sprint |
| `folder` | dossier de sortie |
| `filter` | `{ prefix, min, max }` |
| `categories` | catégories de la capture |
| `markers` | pour chaque catégorie, ses en-têtes suivis de tickets (§ 4) ; depuis 1.1.0 |
| `listed`, `selected`, `ignored`, `ignoredSample` | tickets relevés, retenus, ignorés, et jusqu'à vingt clés ignorées |
| `counts` | nombre de tickets par dossier, `à classer` compris |
| `errors`, `aborted` | nombre de tickets en erreur ; capture arrêtée avant la fin |
| `tickets` | pour chaque ticket : `key`, `url`, puis `category`, `found`, `where`, `excerpt`, `file`, `movedFrom`, ou `category` à `null` et `error` |

Pour un ticket capturé, depuis 1.1.0 : `category` est la catégorie de sa section, ou `null` ; `found` la contient, ou est vide ; `where` vaut `section du sprint`, ou `null` ; `excerpt` est la ligne de son en-tête, par exemple `IA · 12 tickets`, 80 caractères au plus.

Le rapport contient l'adresse du Jira et le filtre du développeur : il reste dans le dossier de sortie, hors de tout dépôt (D1.INV-2).

## 7. Migration depuis 1.0

En 1.0, le skill cherchait un terme clé dans la page de chaque ticket (D5, remplacée). Sur son Jira, le développeur a vérifié que les deux parties du sprint s'annoncent sur la page du sprint par un `<span>IA</span>` et un `<span>DEV</span>`, et non dans les tickets : la version 1.1.0 classe par ces en-têtes (D11). Les invariants de D5 ne sont plus en vigueur ; ils restent dans le point d'entrée pour la lecture d'une capture 1.0. D11.INV-1 remplace D5.INV-1 et D5.INV-2 ; D11.INV-2 reprend D5.INV-3 pour les sections ; D11.INV-3, D11.INV-4 et D11.INV-5 reprennent D5.INV-4, D5.INV-5 et D5.INV-6.

- **Valeurs gardées dans le navigateur** : l'interface garde les sections sous une nouvelle clé de stockage local ; les catégories saisies en 1.0 ne sont pas reprises, et le champ propose `IA` et `DEV`.
- **Captures 1.0** : les dossiers `ticket avec ia`, `ticket sans ia` et `à classer` d'une capture 1.0 restent en place. Une capture 1.1.0 dans le même dossier n'y touche pas, sauf `à classer`, qui reste une catégorie réservée : la copie d'un ticket qui y était est retirée s'il rejoint `IA` ou `DEV`. Le plus simple est de capturer le sprint dans un nouveau dossier.
- **Rapport** : les champs restent les mêmes, `markers` en plus ; `where` vaut `section du sprint` et non plus `contenu`, `contenu masqué` ou `page`.

## 8. Contrôle de sortie

- R2, R3, R10, R11, R13, R14 et R18 du module `recette` passent.
- Sur un vrai sprint : aucun avertissement sur les sections ; chaque ticket à classer est examiné avec le développeur, et la section de quelques tickets classés est vérifiée avec lui sur la page du sprint.
