---
name: hote
description: Identification de l'hôte par la commande hote (indices et nature de chaque preuve, variable GEMINI_CLI posée par l'hôte, processus parents sous Linux et WSL, option --paquet, PATH, choix du paquet, version et documentation embarquée lues dans le paquet, commande doc et sous-agent cli_help, options de lancement masquées, hôte non reconnu décrit sans nom, avertissements). À lire avant d'affirmer quoi que ce soit de l'hôte ou de sa version.
dimensions: [D2]
status: active
---

# Module `hote` (D2)

Phase 7E couverte : Environnement et Éléments.

## 1. Ce que rend `hote`

| Champ | Contenu |
|---|---|
| `famille` | `gemini-cli` ou `inconnue` |
| `certitude` | `observée`, `déclarée`, `déduite`, ou `aucune` pour un hôte non reconnu |
| `indices` | chaque preuve, avec son moyen et sa nature |
| `lance_par_l_hote` | vrai si la variable `GEMINI_CLI` vaut `1` |
| `paquet` | racine, nom, version, source et nature de la preuve, dossier et nombre de documents embarqués, skills intégrés |
| `arguments_de_lancement` | options de lancement de l'hôte, sous Linux et WSL, prompts masqués (§ 4) |
| `bac_a_sable` | actif ou non, et sa nature (`sandbox-exec` ou conteneur) |
| `plateforme`, `accueil`, `racine` | système, architecture, version de Node, WSL ; dossier d'accueil de l'hôte et sa source ; racine observée |
| `generique` | pour un hôte non reconnu, les candidats déduits (§ 5) |
| `avertissements` | § 6 |

## 2. Reconnaître l'hôte (D2.INV-1)

| Indice | Nature | Ce qu'il prouve |
|---|---|---|
| variable `GEMINI_CLI=1` | observé | le script a été lancé par l'outil shell de Gemini CLI, qui la pose dans l'environnement de chaque commande, avec `TERM` et `PAGER` [repère : code de Gemini CLI 0.67.0 ; `tools/shell.md`] |
| processus parent dont la ligne de commande désigne `bundle/gemini.js` d'un paquet `@google/gemini-cli` | observé | le paquet qui s'exécute, et ses options de lancement ; Linux et WSL seulement, par `/proc` |
| option `--paquet` | déclaré | le paquet que le développeur désigne ; s'il diffère de celui qui s'exécute, l'avertissement `paquet_different` le dit |
| première commande `gemini` du PATH : lien vers `bundle/gemini.js`, cale npm avec son `node_modules`, ou script d'enveloppe | déduit | un Gemini CLI installé, pas forcément celui qui s'exécute |

Le paquet retenu est, dans l'ordre : celui de l'option, celui du processus parent, celui du PATH. La certitude est celle de la meilleure preuve : observée si un indice est observé, sinon déclarée, sinon déduite. Une preuve déduite ou déclarée n'est jamais présentée comme observée.

## 3. Paquet, version et documentation (D2.INV-2)

- La version est celle du `package.json` du paquet retenu ; le script ne lance pas `gemini --version`.
- La documentation est celle du paquet : `bundle/docs/`, des documents Markdown à la version exacte de l'hôte (95 en 0.67.0). C'est elle qui fait foi pour cette version (D6.INV-5).
- Les skills intégrés sont ceux de `bundle/builtin/` (en 0.67.0 : `skill-creator` et un skill de migration vers un autre outil de l'éditeur).
- `doc` sans chemin liste les documents ; `doc <chemin>` rend un document, `cli/skills.md` par exemple. Un chemin absolu, qui contient `..`, qui sort du dossier ou qui ne finit pas par `.md` est refusé avec le code 3 ; un document absent sort avec le code 2.
- Dans la session principale, le sous-agent intégré `cli_help` répond aux questions sur Gemini CLI à partir de la même documentation, par l'outil `get_internal_docs` qui n'est donné qu'à lui [repère : code de Gemini CLI 0.67.0]. Sa réponse passe par un modèle : elle se cite « [documenté, par cli_help] », et un point décisif se relit par `doc`. Un sous-agent ne peut pas appeler `cli_help` : les sous-agents n'appellent pas d'autres sous-agents [documenté : `core/subagents.md`].

## 4. Options de lancement

Sous Linux et WSL, quand le processus parent est l'hôte, le script rend ses options de lancement, une par élément :

- les options dont la valeur explique le comportement de l'hôte, avec leur valeur : `-m` et `--model`, `--approval-mode`, `--policy`, `--admin-policy`, `-e` et `--extensions`, `--include-directories`, `--output-format`, `-r` et `--resume`, `--allowed-mcp-server-names`, `--allowed-tools` ;
- les prompts, jamais : `-p`, `--prompt`, `-i` et `--prompt-interactive` sont rendus avec la longueur de leur texte seulement, comme tout argument libre (D8.INV-2) ;
- toute autre option, par son nom ; sa valeur attachée, s'il y en a une, n'est pas rendue.

`--approval-mode yolo`, `--skip-trust` ou `-m` expliquent souvent à eux seuls un comportement que les réglages ne montrent pas.

## 5. Hôte non reconnu (D2.INV-3)

Gemini CLI est le seul hôte que le skill nomme. C'est une règle du skill, reprise du dépôt où il est maintenu, depuis le 2 novembre 2026 : l'IA locale ne lit que des consignes qui la concernent. Un autre hôte se décrit par ce qui s'en observe, sans lui prêter de nom :

- `hote.famille` vaut `inconnue`, `certitude` vaut `aucune` ;
- `hote.generique` liste, en déduits, les dossiers cachés de la racine et de l'accueil qui contiennent `skills`, `agents`, `commands`, `rules`, `prompts` ou un `settings.json`, et les fichiers de consignes en capitales à la racine (hors `README`, `CHANGELOG`, `LICENSE`, `CONTRIBUTING`, `SECURITY`, `CODE_OF_CONDUCT`) ;
- sans aucune configuration de Gemini CLI sur le disque, `config`, `contexte` et `composants` rendent `applicable : false`, leur raison et les mêmes candidats, au lieu d'une configuration inventée.

L'agent explique alors le fonctionnement général d'un agent outillé (module `modele-hote`, § 1 et § 2), en le donnant pour général, et dit ce qu'il ne peut pas observer. Point d'extension E1 : la dimension réservée D10 ajoutera d'autres familles, chacune avec son adaptateur.

## 6. Avertissements

| Avertissement | Sens |
|---|---|
| `paquet_introuvable` | l'hôte est observé (`GEMINI_CLI=1`), mais son paquet n'a pas été localisé : `--paquet` |
| `paquet_invalide` | le dossier de `--paquet` n'est pas le paquet `@google/gemini-cli` |
| `paquet_different` | le paquet de `--paquet` n'est pas celui qui s'exécute, observé parmi les processus parents |
| `version_deduite` | l'hôte est observé, mais la version vient du PATH |
| `racine_windows_depuis_wsl` | la racine est sur le système de fichiers de Windows, lue depuis WSL |

## 7. Contrôle de sortie

- Chaque indice porte sa nature, et la certitude est celle de la meilleure preuve (D2.INV-1).
- La version et les documents cités viennent du paquet retenu (D2.INV-2).
- Un hôte non reconnu n'a ni nom ni configuration prêtés (D2.INV-3).
