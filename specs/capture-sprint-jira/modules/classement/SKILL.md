---
name: classement
description: Classement des tickets capturés (catégories et termes clés, ticket avec ia et ticket sans ia par défaut, noms de dossier valides, recherche sans casse ni accents et en mots entiers, séparateurs équivalents, ordre des textes lus de la page, navigation de Jira exclue, dossier à classer quand aucun terme ou plusieurs, dossiers créés directement dans le dossier de sortie, nouvelle capture qui remplace et retire la copie d'un autre dossier, sprint.mhtml et rapport.json et ses champs). À lire pour régler les catégories et lire le rapport.
dimensions: [D5]
status: active
---

# Module `classement` (D5)

Phase 7E couverte : Engendrent.

## 1. Catégories (D5.INV-5)

Une catégorie est à la fois le terme clé cherché dans la page d'un ticket et le nom du dossier où le ticket est rangé. Par défaut : `ticket avec ia` et `ticket sans ia`. Le développeur peut en donner d'autres, jusqu'à dix, une par ligne dans l'interface ou par `--categorie` en ligne de commande.

Une catégorie est refusée si elle ne peut pas nommer un dossier sous Windows ou sous Linux (plus de 60 caractères, `<`, `>`, `:`, `"`, `/`, `\`, `|`, `?`, `*`, caractère de contrôle, point au début ou à la fin), si elle double une autre une fois normalisée (`Ticket-avec-IA` et `ticket avec ia`), ou si elle s'appelle `à classer`, réservé.

## 2. Recherche d'un terme (D5.INV-1)

Le texte de la page et le terme sont normalisés de la même façon : minuscules, accents retirés, blancs, tirets et `_` réduits à une espace. Entre deux mots du terme, l'espace peut aussi manquer. « Ticket avec IA », `ticket-avec-ia`, `ticket_avec_ia`, `TICKET_AVEC_IA` et `TicketAvecIA` se valent. Les mots sont pris entiers : « tickets avec ia », « ticket avec iam » et « unticket avec ia » ne comptent pas.

## 3. Textes lus (D5.INV-2)

Trois textes sont lus, dans cet ordre ; le premier qui contient au moins un terme décide :

| Ordre | Texte | Endroit dans le rapport |
|---|---|---|
| 1 | contenu principal de la page (`main`, ou rôle `main`), visible | `contenu` |
| 2 | le même, panneaux repliés et champs masqués compris | `contenu masqué` |
| 3 | toute la page visible, hors navigation | `page` |

La navigation (`nav`, `header`, `aside` et leurs rôles ARIA) n'est jamais lue : un filtre enregistré nommé « Ticket avec IA », dans le menu latéral, apparaît sur toutes les pages et classerait tous les tickets. Le texte des scripts et des styles n'est pas lu non plus.

## 4. Décision (D5.INV-3)

| Termes trouvés dans le texte qui décide | Dossier | Rapport |
|---|---|---|
| un seul | celui de la catégorie | `category`, `where`, `excerpt` : 40 caractères de part et d'autre du terme |
| plusieurs | `à classer` | `category` à `null`, `found` : les catégories trouvées |
| aucun, dans aucun des trois textes | `à classer` | `category` à `null`, `found` vide |

Le skill ne devine jamais : ni par le titre du ticket, ni par sa position dans le sprint, ni par une catégorie majoritaire. Un ticket à classer se décide avec le développeur (module `agent`, D7.INV-2).

## 5. Dossiers (D5.INV-4)

Les dossiers de catégorie, et `à classer` s'il sert, sont créés directement dans le dossier de sortie choisi, sans sous-dossier. Une nouvelle capture dans le même dossier :

- remplace le fichier de chaque ticket recapturé ;
- retire la copie d'un ticket qui serait restée dans un autre dossier de catégorie, par exemple un ticket passé d'`à classer` à `ticket sans ia` depuis la capture précédente, et le note dans `movedFrom` ;
- laisse en place les tickets qu'elle ne recapture pas, et la capture précédente d'un ticket en erreur.

Pour un nouveau sprint, le développeur choisit un nouveau dossier de sortie, ou vide l'ancien : le skill ne supprime jamais un ticket qu'il n'a pas recapturé.

## 6. Rapport (D5.INV-6)

Chaque capture écrit, dans le dossier de sortie, `sprint.mhtml`, la page du sprint telle qu'elle était au relevé, et `rapport.json`, qui décrit la dernière capture. Ses champs sont stables (E1) :

| Champ | Contenu |
|---|---|
| `date` | début de la capture, ISO 8601 |
| `sprintUrl` | adresse de la page du sprint |
| `folder` | dossier de sortie |
| `filter` | `{ prefix, min, max }` |
| `categories` | catégories de la capture |
| `listed`, `selected`, `ignored`, `ignoredSample` | tickets relevés, retenus, ignorés, et jusqu'à vingt clés ignorées |
| `counts` | nombre de tickets par dossier, `à classer` compris |
| `errors`, `aborted` | nombre de tickets en erreur ; capture arrêtée avant la fin |
| `tickets` | pour chaque ticket : `key`, `url`, puis `category`, `found`, `where`, `excerpt`, `file`, `movedFrom`, ou `category` à `null` et `error` |

Le rapport contient l'adresse du Jira et le filtre du développeur : il reste dans le dossier de sortie, hors de tout dépôt (D1.INV-2).

## 7. Contrôle de sortie

- R2, R3, R10, R11, R13 et R18 du module `recette` passent.
- Sur un vrai sprint : chaque ticket à classer est examiné avec le développeur, et l'extrait de quelques tickets classés est vérifié avec lui.
