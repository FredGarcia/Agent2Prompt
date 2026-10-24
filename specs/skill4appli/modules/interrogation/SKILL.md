---
name: interrogation
description: Interrogation de la base en lecture seule (ouverture readOnly et query_only, query avec SQL en argument, fichier ou entrée standard et paramètres, réponses bornées et troncature signalée, instantané joint, search en FTS5 trigramme avec extraits chemin:ligne sans casse ni accent discriminants et classement bm25, schema commenté, requêtes utiles). À lire avant d'interroger la base ou d'écrire une requête pour un agent.
dimensions: [D4]
status: active
---

# Module `interrogation` (D4)

Phase 7E couverte : Expression.

## 1. Lecture seule (D4.INV-1)

`query`, `search`, `schema` et `status` ouvrent la base avec `readOnly: true`, puis `PRAGMA query_only = ON` : deux gardes indépendantes. Une requête d'écriture (`DELETE`, `UPDATE`, `DROP`, `PRAGMA user_version = …`) est refusée avec le code 2, et la base reste intacte. Une base absente n'est pas créée (D1.INV-2).

## 2. `query` (D4.INV-2, D4.INV-3)

```bash
node scripts/app_db.mjs query "SELECT path, lines FROM app_structure WHERE lang = ? ORDER BY lines DESC" --param java --limit 20
node scripts/app_db.mjs query --file requete.sql
printf '%s' "SELECT count(*) AS n FROM app_structure" | node scripts/app_db.mjs query -
```

- La requête vient de l'argument, de `--file`, ou de l'entrée standard (`-`, ou aucun argument hors terminal) : l'entrée standard évite les pièges de guillemets du shell. Les `?` reçoivent les `--param`, dans l'ordre.
- Au plus `--limit` lignes (200 par défaut) ; au-delà, `"truncated": true`. Une valeur texte plus longue que `--max-chars` (2 000 par défaut) est coupée et finie par `…[tronqué : N caractères]` ; `values_truncated` compte ces coupes. Un BLOB devient `[binaire : N octets]`.
- Réponse : `{"ok": true, "commande": "query", "rows": [...], "count", "truncated", "values_truncated", "snapshot": {"mode", "commit", "branch", "indexed_at"}}`. `--format table` affiche un tableau lisible par un humain ; `SKILL4APPLI_FORMAT` en fixe le format par défaut (module `configuration`).

## 3. `search` (D4.INV-4)

```bash
node scripts/app_db.mjs search "@GetMapping" --lang java
node scripts/app_db.mjs search commandes --path src/app/ --format text
```

- Terme d'au moins trois caractères : recherche dans `app_fts` (`MATCH` sur le terme entre guillemets, guillemets doublés), fichiers classés par `bm25`. Terme plus court : recherche par `instr` dans `content`, sans index, fichiers dans l'ordre des chemins.
- Le tokeniseur `trigram` ignore la casse et, avec `remove_diacritics`, les accents : `bibliotheque` trouve `Bibliothèque`. Les lignes sont repérées avec la même normalisation (décomposition Unicode, accents retirés, minuscules).
- Par fichier : nombre total d'occurrences (`matches`) et au plus `--lines` lignes (5 par défaut), chacune `{"line", "text"}`, texte ramené à 240 caractères autour du terme. Au plus `--limit` fichiers (20 par défaut), `truncated` sinon. Un fichier trouvé par son seul chemin rend une liste de lignes vide.
- Filtres : `--path` (préfixe de chemin, `%` et `_` échappés), `--lang`.
- `--format text` rend une ligne `chemin:ligne: extrait` par occurrence, à la manière de `grep -n`.
- Réponse JSON : `{"ok": true, "commande": "search", "term", "files", "truncated", "results": [{"path", "matches", "lines"}], "snapshot"}`.

## 4. `schema`

Tables et colonnes, avec une description pour les colonnes dont le sens n'est pas évident (`type`, `sha`, `last_commit`, `status`…), et le numéro de schéma. Les tables internes de l'index plein texte (`app_fts_data`, …) ne sont pas listées. Un agent lit `schema` une fois plutôt que d'explorer la base.

## 5. Un objet par réponse (E4)

Chaque commande de lecture (`config`, `status`, `query`, `search`, `schema`) construit un seul objet, puis la ligne de commande l'écrit, en une ligne avec `--format json`. Importé, le script expose ce même objet : `executer(commande, options, positionnels)` rend `{ sortie, code }` sans rien écrire. C'est ce que rendra le service MCP réservé (module `service-mcp`).

```js
const { executer } = await import('file:///C:/dev/projet/.skills/skill4appli/scripts/app_db.mjs');
const { sortie, code } = await executer('search', { repo: 'C:\\dev\\projet', lang: 'java' }, ['@GetMapping']);
```

## 6. Requêtes utiles

```sql
-- les deux requêtes d'exemple de la version d'origine restent valides
SELECT branch_name, is_current, last_commit FROM git_branches;
SELECT path FROM app_structure WHERE content LIKE '%Fastify%';
-- la même, par l'index : plus rapide sur un gros projet
SELECT s.path FROM app_fts JOIN app_structure s ON s.id = app_fts.rowid WHERE app_fts MATCH '"Fastify"' LIMIT 50;
-- répartition par langue
SELECT lang, count(*) AS fichiers, sum(lines) AS lignes FROM app_structure WHERE type = 'file' GROUP BY lang ORDER BY lignes DESC;
-- un fichier par son nom
SELECT path FROM app_structure WHERE path LIKE '%Controller.java' ORDER BY path LIMIT 50;
-- le contenu d'un fichier précis, borné
SELECT content FROM app_structure WHERE path = ?;   -- avec --param <chemin> --max-chars 4000
-- ce qui n'est pas indexé, et pourquoi
SELECT path, type, metadata FROM app_structure WHERE type <> 'file' ORDER BY type, path;
-- changelogs Liquibase : la source du schéma PostgreSQL du back Java
SELECT path, lang, lines FROM app_structure WHERE path LIKE '%db/changelog/%' ORDER BY path;
```

Le back Java fait évoluer le schéma PostgreSQL par Liquibase : ses changelogs, en YAML, XML ou SQL, sont dans le dépôt (`src/main/resources/db/changelog/`, chemin par défaut de Spring Boot). Pour savoir où une table ou une colonne est créée ou modifiée, chercher son nom dans ces seuls fichiers :

```bash
node scripts/app_db.mjs search commande --path src/main/resources/db/changelog/ --format text
node scripts/app_db.mjs search addColumn --path src/main/resources/db/changelog/ --limit 50
```

L'ordre d'application suit le changelog maître (`db.changelog-master.yaml` par défaut), qui inclut les autres : le lire sur le disque avant de conclure sur l'état du schéma.

## 7. Pièges connus

- **`MATCH` et la syntaxe FTS5** : un terme non entouré de guillemets est lu comme une expression (`-`, `:`, `*`, `AND`, `OR`). `search` met toujours le terme entre guillemets ; dans `query`, faire de même.
- **Moins de trois caractères** : le tokeniseur `trigram` ne trouve rien ; `search` bascule seul sur `instr`, une requête `MATCH` écrite à la main rend vide.
- **`content LIKE`** : parcourt toute la table et ne compare sans casse que l'ASCII ; préférer l'index.
- **Instantané** : une réponse décrit la base au commit et à la date de `snapshot`, pas forcément le disque (module `fraicheur`).

## 8. Contrôle de sortie

- Aucune écriture possible par `query`, base intacte après les commandes de lecture (D4.INV-1) : T14.
- Lignes et fichiers limités, troncature signalée, instantané joint (D4.INV-2, D4.INV-3) : T15.
- `chemin:ligne`, casse et accents, filtres, classement, format texte (D4.INV-4) : T16.
- Un objet par commande de lecture, le même par `executer()` (E4) : T33.
