---
name: service-mcp
description: Dimension réservée D11, service MCP du skill (outils en lecture seule status, search, query, schema et config rendant les objets d'executer, transport stdio lancé par le client de l'agent, franchissement de la frontière Windows et WSL2 par l'interop sans port ni réseau, transport HTTP écarté en 1.x, aucune écriture par le service). Ne pas implémenter en 1.x ; lire seulement pour comprendre le point d'extension E4.
dimensions: [D11]
status: reserved
---

# Module `service-mcp` (D11, réservé)

Statut : `reserved`. En 1.1.0, l'interface du skill est la ligne de commande ; aucune commande `mcp` n'existe.

## 1. Pourquoi cette dimension existe

Facteur VII des douze facteurs : un service s'expose lui-même par un port. Pour un agent, l'équivalent est un serveur MCP : l'agent appelle des outils typés au lieu de construire une ligne de commande et de connaître le chemin du script. La dimension est réservée tant qu'aucun client MCP des agents qui l'utilisent n'en a l'usage.

## 2. Principe prévu

- Une commande `mcp` du même script, qui parle JSON-RPC sur l'entrée et la sortie standard (transport stdio), sans dépendance.
- Des outils en lecture seule : `skill4appli_status`, `skill4appli_search`, `skill4appli_query`, `skill4appli_schema`, `skill4appli_config`. Chacun rend l'objet `sortie` d'`executer()` (E4) ; un code de sortie non nul devient une erreur d'outil.
- Aucune écriture par le service : `ingest`, `git-scan`, `watch`, `watch-stop` et `mirror-remove` restent des commandes que le développeur ou l'agent lance avec son accord (D7.INV-3).
- Le service se lance du côté du git qui possède le worktree (module `parite`) : sous Windows, `node C:\…\app_db.mjs mcp --repo C:\dev\acme` ; un client MCP dans WSL2 le lance par `node.exe` et lui parle par les tubes de l'interop. Aucun port à ouvrir, aucune règle de pare-feu, aucune dépendance au mode réseau de WSL2.
- Transport HTTP écarté en 1.x : dans le mode réseau NAT, par défaut dans WSL2, un service à l'écoute sur le `127.0.0.1` de Windows n'est pas joignable par `localhost` depuis WSL2 ; il faudrait le mode réseau miroir, ou l'adresse de l'hôte.
- La version du protocole MCP est choisie et vérifiée à l'activation.

## 3. Ce que prépare le point d'extension

| Point | Règle active en 1.x |
|---|---|
| E4 | chaque commande de lecture construit un seul objet, écrit en une ligne par la ligne de commande ; importé, le script exporte `executer(commande, options, positionnels)`, qui rend ce même objet sans rien écrire |

## 4. Test d'inertie en 1.x

T33 du module `recette` : une ligne JSON par commande de lecture, le même objet par `executer()`, et `mcp` est une commande inconnue (code 1).
