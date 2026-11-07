---
name: secrets
description: Secrets et vie privée (fichiers que le script ne lit jamais, noms seulement pour tout ce qui peut porter un secret, liste fermée des réglages et des variables, motifs de masquage et seconde passe sur toute la sortie, messages d'erreur sans extrait, aucun texte de conversation, de prompt ni de fichier de contexte, conduite de l'agent devant un secret vu ailleurs). À lire avant de rendre une observation.
dimensions: [D8]
status: active
---

# Module `secrets` (D8)

Phase 7E couverte : Environnement.

## 1. Ce que le script ne lit jamais

Les jetons d'authentification et d'accès de l'hôte, quel que soit leur emplacement : `oauth_creds.json`, `google_accounts.json`, `mcp-oauth-tokens.json`, `a2a-oauth-tokens.json`, le trousseau du système. Aucun d'eux n'aide à expliquer l'hôte : leur existence suffit, et le mode d'authentification se lit dans `security.auth.selectedType`.

## 2. Des noms, pas des valeurs (D8.INV-1)

| Source | Ce qui est rendu |
|---|---|
| réglages | les valeurs de la liste fermée du module `configuration`, § 2, seulement ; les clés de premier niveau de chaque couche ; jamais un autre réglage |
| `.env` | les noms des variables ; une valeur seulement pour les variables non secrètes du module `configuration`, § 6 |
| environnement | la liste fermée du module `configuration`, § 6 : présence seulement pour les clés, jetons, identifiants et adresses d'API |
| serveurs MCP | les noms de leurs variables et de leurs en-têtes ; le nom de la commande, ses arguments masqués ; l'adresse masquée |
| options de lancement | les options et les valeurs de la liste du module `hote`, § 4 ; la longueur des prompts, jamais leur texte |
| `agents.overrides`, `experimental` | `enabled` par sous-agent ; les booléens et les nombres, « défini » pour le reste |

## 3. Masquage par motifs

Toute valeur rendue passe par le masquage, puis toute la sortie une seconde fois, chaque chaîne de l'objet, juste avant l'écriture (D8.INV-1). `[masqué]` remplace :

- les clés et jetons reconnaissables : clés d'API Google (`AIza…`), clés d'accès AWS (`AKIA…`), jetons JWT (`eyJ….….…`), jetons GitHub (`ghp_…`, `github_pat_…`), GitLab (`glpat-…`), Slack (`xox…`), Stripe (`sk_live_…`), jetons OAuth Google (`ya29.…`), blocs de clé privée ;
- les identifiants d'une adresse (`schéma://utilisateur:motdepasse@`) ;
- les paramètres sensibles d'une adresse (`token`, `access_token`, `key`, `api_key`, `password`, `secret`, `sig`) ;
- ce qui suit `Bearer` ou `Basic` ;
- la valeur d'une option sensible (`--token=…`, `--api-key …`, `--password:…`), et l'argument qui suit une option sensible ;
- la valeur d'une affectation sensible (`GITHUB_TOKEN=…`, `MY_SECRET=…`).

Le masquage par motifs est un filet : ce qui ne ressemble à rien de connu n'y est pas pris, d'où la règle des noms, qui ne dépend d'aucun motif.

## 4. Erreurs sans extrait

Le moteur JSON de Node cite parfois un extrait du texte qu'il n'a pas pu lire. Le script ne reprend jamais ce message : un fichier illisible est signalé par « JSON invalide » et sa ligne (D3.INV-2).

## 5. Aucun texte privé (D8.INV-2)

Le script ne rend aucun texte de conversation, aucun prompt de lancement, aucun texte de fichier de contexte, de mémoire ou de session : des chemins, des tailles, des nombres de lignes, des dates, des balises posées par l'hôte. Seule `doc` rend un texte, celui de la documentation publique du paquet, masquée elle aussi.

## 6. Conduite de l'agent (D8.INV-3)

L'agent peut voir un secret ailleurs que dans le script : un fichier qu'il lit avec ses outils, la sortie d'une commande, un message du développeur. Il ne le recopie jamais, ni dans une explication, ni dans un fichier, ni dans un appel d'outil ; il dit qu'il existe et où (« une clé d'API est posée dans `.gemini/.env` »). Si le développeur colle un secret, l'agent ne le répète pas et lui rappelle qu'il vaut mieux le renouveler.

## 7. Contrôle de sortie

- Aucune valeur secrète, ni dans la sortie standard ni dans la sortie d'erreur, quels que soient la commande et le format (D8.INV-1) : recette T12, T15, T16, T19, T25, T26.
- Aucun texte de conversation, de prompt ni de fichier de contexte (D8.INV-2) : recette T9, T22, T25.
- L'agent ne recopie aucun secret (D8.INV-3) : scénario A5 du module `agent`.
