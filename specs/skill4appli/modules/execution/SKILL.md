---
name: execution
description: Contrat d'exécution du skill (commandes et options du script app_db.mjs, emplacement de la base dans le dossier commun git et identifiant du worktree source, sorties JSON et codes de sortie, base SQLite et migrations numérotées, environnement Node et git, matérialisation du script, de la recette et de l'agent avec leurs empreintes, source complète du script). À lire en premier : les autres modules s'appuient sur ce contrat.
dimensions: [D1]
status: active
---

# Module `execution` (D1)

Phase 7E couverte : Espace.

## 1. Commandes

```bash
node scripts/app_db.mjs <commande> [options]      # depuis le dossier du skill, ou par chemin absolu
node scripts/app_db.mjs --help
```

| Commande | Effet | Options utiles | Codes possibles |
|---|---|---|---|
| `init` | crée ou migre la base | `--repo`, `--db` | 0, 2, 3 |
| `ingest [dossier]` | indexe le worktree source tel qu'il est sur le disque (module `ingestion`) | `--max-size` | 0, 2, 3, 4 |
| `git-scan` | branches et fichiers par branche (module `branches`) | `--base` | 0, 2, 3, 4 |
| `query [sql \| -]` | requête SQL en lecture seule (module `interrogation`) | `--param`, `--file`, `--limit`, `--max-chars`, `--format table` | 0, 1, 2 |
| `search <terme>` | emplacements `chemin:ligne` (module `interrogation`) | `--path`, `--lang`, `--limit`, `--lines`, `--format text` | 0, 1, 2 |
| `schema` | tables et colonnes commentées (module `interrogation`) | | 0, 2 |
| `status` | écart entre la base et le worktree source (module `fraicheur`) | | 0, 6, 2, 3 |
| `watch` | worktree dédié sur la branche courante, suivi par scrutation (module `watcher`) | `--interval`, `--once`, `--base`, `--max-size` | 0, 2, 3, 4, 7 |
| `mirror-remove` | retire le worktree dédié (module `watcher`) | `--force` | 0, 3, 4, 7 |

`ingest .`, forme de la version d'origine, reste accepté : le dossier donné vaut `--repo`.

## 2. Options

| Option | Valeur | Défaut |
|---|---|---|
| `--repo <dossier>` | worktree source, ramené à sa racine (`git rev-parse --show-toplevel`) | dossier courant |
| `--db <fichier>` | emplacement de la base ; aussi par la variable `SKILL4APPLI_DB` | § 3 |
| `--format` | `json` (une ligne), `pretty` (indenté), `table` (pour `query`), `text` (pour `search`) | `json` |
| `--limit <n>` | lignes rendues par `query`, fichiers rendus par `search` | 200 ; 20 |
| `--max-chars <n>` | longueur maximale d'une valeur texte rendue par `query` | 2000 |
| `--param <valeur>` | paramètre positionnel `?` de `query`, répétable | |
| `--file <fichier>` | requête SQL lue dans un fichier | |
| `--path <préfixe>`, `--lang <langue>`, `--lines <n>` | filtres et lignes par fichier de `search` | ; ; 5 |
| `--max-size <octets>` | au-delà, un fichier est inventorié sans contenu | 1048576 |
| `--base <ref>` | base de `branch_files` | `origin/HEAD`, puis `main`, `master`, `develop` |
| `--interval <ms>` | intervalle de scrutation du watcher, 500 au minimum | 2000 |
| `--once` | `watch` : une seule synchronisation, puis sortie | |
| `--force` | `mirror-remove` : retire aussi un miroir modifié à la main | |

Une option inconnue, une valeur hors bornes ou une commande inconnue sortent avec le code 1.

## 3. Emplacements (D1.INV-2)

- **Worktree source** : `--repo`, ou le dossier courant, ramené à la racine de son worktree.
- **Identifiant** : nom du dossier du worktree, suivi des 8 premiers caractères de l'empreinte SHA-1 de son chemin absolu : `appli-1a2b3c4d`, `ECR-77-61fb139a`.
- **Base** : `<commun>/skill4appli/<id>/memoire.db`, où `<commun>` est le dossier commun git (`git rev-parse --git-common-dir`) : `.git/` d'un clone, `.bare/` dans la disposition du kit `agents-paralleles-gitlab`. `git status` ne liste jamais ce dossier : rien à ajouter au `.gitignore` ni à l'exclusion.
- **Miroir** : `<commun>/skill4appli/<id>/miroir/` (module `watcher`) ; **verrou** du watcher : `memoire.db.watch.lock`.
- **Base forcée** : `--db` ou `SKILL4APPLI_DB` ; si elle tombe dans l'arbre indexé, ses fichiers (`-wal`, `-shm`, `-journal`, verrou) sont exclus de l'inventaire.
- **Hors dépôt git** : la base est dans `<dossier>/.skill4appli/memoire.db` ; `git-scan`, `watch` et `mirror-remove` sortent avec le code 3.
- Lancée depuis un dépôt nu (la racine du kit) ou depuis le dossier commun, une commande sort avec le code 3 ; lancée dans un miroir, avec le code 1.
- Une commande de lecture ne crée jamais la base ni son dossier : une base absente donne le code 2, ou le verdict `jamais_indexe` pour `status`.

```
appli/                              worktree source, clone ordinaire
└── .git/
    └── skill4appli/
        └── appli-1a2b3c4d/
            ├── memoire.db          SQLite en mode WAL
            ├── memoire.db.watch.lock   présent tant qu'un watcher tourne
            └── miroir/             worktree dédié, HEAD détachée, verrouillé

~/dev/<projet>/                     disposition du kit agents-paralleles-gitlab
├── .bare/skill4appli/ECR-77-61fb139a/   base et miroir de la demande ECR-77
├── .skills/skill4appli/            le skill, matérialisé une fois, hors des worktrees
├── main/
└── ECR-77/                         worktree source de la demande
```

## 4. Sorties et codes (D1.INV-3)

- Sortie standard : un objet JSON par ligne (`--format json`), avec `"ok": true` et le nom de la commande ; `watch` y écrit un événement JSON par ligne (module `watcher`).
- Sortie d'erreur : `{"ok": false, "code": N, "erreur": "…", "details": …}` sur une ligne. Le seul avertissement filtré est celui de `node:sqlite` sur son statut expérimental ; tout autre avertissement de Node reste affiché.

| Code | Sens |
|---|---|
| 0 | succès ; pour `status`, base à jour |
| 1 | usage : commande, option ou valeur invalide ; commande lancée dans un miroir |
| 2 | base ou requête : base absente, illisible, d'une version plus récente, requête invalide ou refusée |
| 3 | git : git absent, hors worktree, commande git en échec, commande git demandée hors dépôt |
| 4 | conflit : un watcher actif est le seul écrivain de la base |
| 5 | environnement : Node trop ancien, `node:sqlite` indisponible |
| 6 | `status` seulement : la base n'est pas à jour (une réponse, pas une erreur : JSON sur la sortie standard) |
| 7 | miroir modifié à la main : le watcher et `mirror-remove` refusent d'y toucher |

## 5. Base et migrations (D1.INV-4)

- SQLite par `node:sqlite`, en mode WAL (`synchronous = NORMAL`, `busy_timeout` de 5 s) : les lecteurs lisent pendant que le watcher écrit.
- `PRAGMA user_version` compte les migrations appliquées. La migration 1 crée `app_metadata`, `app_structure` (et son index sur `lang`), l'index plein texte `app_fts` et ses trois déclencheurs, `git_branches` et `branch_files`. Elle ne sera jamais modifiée : une version suivante ajoute la migration 2.
- Une base sans numéro de schéma qui contient les tables de la version d'origine est reconstruite : la base est un cache, entièrement dérivable du dépôt.
- Une base dont le numéro dépasse celui du script est refusée (code 2) : elle a été créée par une version plus récente.
- Les commandes de lecture ouvrent la base en lecture seule et ne migrent jamais : une base au schéma ancien leur rend le code 2, et `ingest` ou `watch --once` la migrent.

## 6. Environnement (D1.INV-5)

- **Node 22.13 ou plus récent** : `node:sqlite` n'exige plus d'option depuis 22.13 et 23.4. Son SQLite intégré doit offrir FTS5 et le tokeniseur `trigram` avec `remove_diacritics` (SQLite 3.45 ou plus récent). Essayé avec Node 22.22 et SQLite 3.50.4.
- Dans la documentation récente de Node, la classe s'appelle `Database` et `DatabaseSync` en devient un alias déprécié (DEP0210) : le script prend `Database` s'il existe, sinon `DatabaseSync`.
- **git 2.38 ou plus récent** (`worktree list -z`, `rev-parse --path-format=absolute`, `%(worktreepath)`) ; essayé avec git 2.43 (Ubuntu 24.04). Le script lance git avec `LC_ALL=C`, pour des sorties non traduites, et `GIT_OPTIONAL_LOCKS=0`, pour ne jamais réécrire l'index du worktree source.
- **WSL2** : la scrutation du watcher n'attend aucun événement du système de fichiers et fonctionne aussi sous `/mnt/c` ; git y est plus lent que sur le système de fichiers Linux.
- Aucun `npm install` : le script et la recette n'importent que des modules `node:`.

## 7. Pièges connus

- `node --test tests/` : sous Node 22, un dossier n'est pas un motif de recherche ; nommer le fichier, `node --test tests/app_db.test.mjs`.
- Lancer le script depuis le dossier du skill sans `--repo` vise le dossier du skill, pas le projet : depuis le projet, appeler le script par son chemin.
- Le PID d'un verrou orphelin peut, rarement, être repris par un autre processus : le verrou paraît alors actif. Vérifier qu'aucun watcher ne tourne avant de supprimer `memoire.db.watch.lock` à la main.

## 8. Contrôle de sortie

- T1 à T7 de la recette passent (D1.INV-1 à D1.INV-5).
- La table d'empreintes du § 9 correspond aux fichiers matérialisés.

## 9. Matérialiser les fichiers exécutables

Trois fichiers sont tirés des blocs annotés `<!-- fichier : chemin -->` des modules, à l'identique, par programme plutôt qu'à la main :

| Fichier | Module, section |
|---|---|
| `scripts/app_db.mjs` | `execution`, § 10 |
| `tests/app_db.test.mjs` | `recette`, § 4 |
| `agent/memoire-appli.md` | `agent`, § 7 |

Depuis le dossier du skill :

```bash
node -e '
const fs = require("node:fs"), path = require("node:path");
for (const module of ["modules/execution/SKILL.md", "modules/recette/SKILL.md", "modules/agent/SKILL.md"]) {
  const texte = fs.readFileSync(module, "utf8");
  for (const [, fichier, contenu] of texte.matchAll(/^<!-- fichier : (\S+) -->\n```[a-z]*\n([\s\S]*?)\n```$/gm)) {
    fs.mkdirSync(path.dirname(fichier), { recursive: true });
    fs.writeFileSync(fichier, contenu + "\n");
    console.log("écrit : " + fichier);
  }
}'
sha256sum -c <<'EMPREINTES'
54d2a907e50cc0e61c817a481331cc4e4516157d8ad0b8ab966ee39668900cd4  scripts/app_db.mjs
4d640a5da5e34123a7c893cdff444d8f5afe402e13d7ef8ffe522695d07364b0  tests/app_db.test.mjs
3b8e66771c5737d7bedf43f75daaa047d4bda2371e256a462b9994c867676182  agent/memoire-appli.md
EMPREINTES
node --test tests/app_db.test.mjs
```

## 10. Script `scripts/app_db.mjs`

<!-- fichier : scripts/app_db.mjs -->
```js
#!/usr/bin/env node
// skill4appli 1.0.0 : mémoire SQLite d'une application locale, de ses branches git,
// et watcher de la branche courante chargée dans un worktree dédié.
// Usage : node scripts/app_db.mjs <commande> [options]   (aide : --help)
// Node 22.13 ou plus récent, modules natifs uniquement. Aucune commande externe ne passe par un shell.

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { parseArgs } from 'node:util';

const VERSION = '1.0.0';
const CODES = { OK: 0, USAGE: 1, BASE: 2, GIT: 3, CONFLIT: 4, ENVIRONNEMENT: 5, PAS_A_JOUR: 6, MIROIR_MODIFIE: 7 };
const TAILLE_MAX = 1024 * 1024;
const LIMITE_LISTES = 50;

class Echec extends Error {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

let FORMAT = 'json';

function ecrire(objet) {
  process.stdout.write(FORMAT === 'pretty' ? `${JSON.stringify(objet, null, 2)}\n` : `${JSON.stringify(objet)}\n`);
}

let evenementsEmis = 0;

function evenement(objet) {
  evenementsEmis++;
  process.stdout.write(`${JSON.stringify({ t: new Date().toISOString(), ...objet })}\n`);
}

function sortieErreur(e) {
  const code = e instanceof Echec ? e.code : CODES.BASE;
  const corps = { ok: false, code, erreur: e.message };
  if (e instanceof Echec && e.details !== undefined) corps.details = e.details;
  process.stderr.write(`${JSON.stringify(corps)}\n`);
  process.exit(code);
}

// L'avertissement « SQLite is an experimental feature » encombrerait la sortie lue par un agent :
// il est filtré avant le chargement de node:sqlite ; tout autre avertissement reste affiché.
process.removeAllListeners('warning');
process.on('warning', (w) => {
  if (w.name === 'ExperimentalWarning' && /sqlite/i.test(w.message)) return;
  process.stderr.write(`${w.name}: ${w.message}\n`);
});

const [majeure, mineure] = process.versions.node.split('.').map(Number);
if (majeure < 22 || (majeure === 22 && mineure < 13)) {
  sortieErreur(new Echec(CODES.ENVIRONNEMENT, `Node 22.13 ou plus récent requis (version ${process.versions.node})`));
}
let Database;
try {
  const sqlite = await import('node:sqlite');
  Database = sqlite.Database ?? sqlite.DatabaseSync;
} catch (e) {
  sortieErreur(new Echec(CODES.ENVIRONNEMENT, `node:sqlite indisponible : ${e.message}`));
}

// ---------------------------------------------------------------- git, sans shell

const ENV_GIT = { ...process.env, LC_ALL: 'C', LANGUAGE: '', GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0' };

function git(dossier, args, { permettreEchec = false } = {}) {
  try {
    return execFileSync('git', ['-C', dossier, ...args], {
      encoding: 'utf8',
      env: ENV_GIT,
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 512 * 1024 * 1024,
    });
  } catch (e) {
    if (permettreEchec) return null;
    if (e.code === 'ENOENT') throw new Echec(CODES.GIT, 'git introuvable dans le PATH');
    const detail = String(e.stderr ?? e.message).trim().split('\n').filter(Boolean).pop() ?? e.message;
    throw new Echec(CODES.GIT, `git ${args[0]} : ${detail}`);
  }
}

const elementsNul = (texte) => texte.split('\0').filter((s) => s.length > 0);

function teteSource(ctx) {
  const sortie = git(ctx.source, ['rev-parse', 'HEAD', '--abbrev-ref', 'HEAD'], { permettreEchec: true });
  if (sortie === null) {
    const branche = git(ctx.source, ['symbolic-ref', '-q', '--short', 'HEAD'], { permettreEchec: true });
    return { commit: '', branch: branche ? branche.trim() : '' };
  }
  const [commit, branche] = sortie.trim().split('\n');
  return { commit, branch: branche === 'HEAD' ? '(détachée)' : branche };
}

// ---------------------------------------------------------------- contexte et emplacements

const slug = (nom) => nom.replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 40) || 'depot';

function contexte(opts) {
  const dossier = resolve(opts.repo ?? process.cwd());
  if (!existsSync(dossier)) throw new Echec(CODES.USAGE, `dossier introuvable : ${dossier}`);
  const dedans = git(dossier, ['rev-parse', '--is-inside-work-tree'], { permettreEchec: true });
  const forceDb = opts.db ?? process.env.SKILL4APPLI_DB;
  if (dedans === null) {
    const base = join(dossier, '.skill4appli');
    const db = forceDb ? resolve(forceDb) : join(base, 'memoire.db');
    return { git: false, source: dossier, base, db, verrou: `${db}.watch.lock` };
  }
  if (dedans.trim() !== 'true') {
    throw new Echec(CODES.GIT, `${dossier} n'est pas dans un worktree : lancer la commande depuis un worktree du dépôt`);
  }
  const [source, commun] = git(dossier, ['rev-parse', '--path-format=absolute', '--show-toplevel', '--git-common-dir'])
    .trim()
    .split('\n')
    .map((p) => resolve(p));
  const racineSkill = join(commun, 'skill4appli');
  if (source === racineSkill || source.startsWith(racineSkill + sep)) {
    throw new Echec(CODES.USAGE, 'commande lancée dans un miroir du skill : la lancer depuis le worktree source');
  }
  const id = `${slug(basename(source))}-${createHash('sha1').update(source).digest('hex').slice(0, 8)}`;
  const base = join(racineSkill, id);
  const db = forceDb ? resolve(forceDb) : join(base, 'memoire.db');
  return { git: true, source, commun, base, db, miroir: join(base, 'miroir'), verrou: `${db}.watch.lock` };
}

function exigerGit(ctx) {
  if (!ctx.git) throw new Echec(CODES.GIT, `${ctx.source} n'est pas un dépôt git : commande indisponible hors dépôt`);
}

// ---------------------------------------------------------------- base et migrations

const MIGRATIONS = [
  `CREATE TABLE app_metadata (
     key TEXT PRIMARY KEY,
     value TEXT NOT NULL
   );
   CREATE TABLE app_structure (
     id INTEGER PRIMARY KEY,
     path TEXT NOT NULL UNIQUE,
     type TEXT NOT NULL,
     lang TEXT,
     size INTEGER NOT NULL,
     lines INTEGER,
     sha TEXT,
     encoding TEXT,
     mtime_ms INTEGER NOT NULL,
     content TEXT,
     metadata TEXT NOT NULL DEFAULT '{}'
   );
   CREATE INDEX app_structure_lang ON app_structure (lang);
   CREATE VIRTUAL TABLE app_fts USING fts5 (
     path, content,
     content = 'app_structure', content_rowid = 'id',
     tokenize = 'trigram remove_diacritics 1'
   );
   CREATE TRIGGER app_structure_ai AFTER INSERT ON app_structure BEGIN
     INSERT INTO app_fts (rowid, path, content) VALUES (new.id, new.path, new.content);
   END;
   CREATE TRIGGER app_structure_ad AFTER DELETE ON app_structure BEGIN
     INSERT INTO app_fts (app_fts, rowid, path, content) VALUES ('delete', old.id, old.path, old.content);
   END;
   CREATE TRIGGER app_structure_au AFTER UPDATE OF path, content ON app_structure BEGIN
     INSERT INTO app_fts (app_fts, rowid, path, content) VALUES ('delete', old.id, old.path, old.content);
     INSERT INTO app_fts (rowid, path, content) VALUES (new.id, new.path, new.content);
   END;
   CREATE TABLE git_branches (
     id INTEGER PRIMARY KEY,
     branch_name TEXT NOT NULL UNIQUE,
     is_remote INTEGER NOT NULL,
     is_current INTEGER NOT NULL,
     last_commit TEXT NOT NULL,
     commit_sha TEXT NOT NULL,
     commit_subject TEXT NOT NULL,
     committed_at TEXT,
     upstream TEXT,
     track TEXT,
     ahead INTEGER,
     behind INTEGER,
     worktree_path TEXT,
     updated_at TEXT NOT NULL
   );
   CREATE TABLE branch_files (
     branch_name TEXT NOT NULL,
     base TEXT NOT NULL,
     merge_base TEXT NOT NULL,
     path TEXT NOT NULL,
     status TEXT NOT NULL,
     added INTEGER,
     deleted INTEGER,
     PRIMARY KEY (branch_name, path)
   );`,
];

const TABLES_ORIGINE = ['app_structure', 'git_branches', 'app_metadata'];

function migrer(db) {
  const version = db.prepare('PRAGMA user_version').get().user_version;
  if (version > MIGRATIONS.length) {
    throw new Echec(CODES.BASE, `base créée par une version plus récente du skill (schéma ${version}, ${MIGRATIONS.length} au plus ici)`);
  }
  for (let v = version; v < MIGRATIONS.length; v++) {
    db.exec('BEGIN IMMEDIATE');
    try {
      if (v === 0) {
        // Base de la version d'origine (sans user_version) : un cache dérivable, reconstruit.
        for (const table of TABLES_ORIGINE) db.exec(`DROP TABLE IF EXISTS ${table}`);
      }
      db.exec(MIGRATIONS[v]);
      db.exec(`PRAGMA user_version = ${v + 1}`);
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw new Echec(CODES.BASE, `migration ${v + 1} : ${e.message}`);
    }
  }
}

function ouvrirEcriture(ctx) {
  mkdirSync(dirname(ctx.db), { recursive: true });
  let db;
  try {
    db = new Database(ctx.db);
    db.exec('PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL;');
  } catch (e) {
    throw new Echec(CODES.BASE, `base impossible à ouvrir (${ctx.db}) : ${e.message}`);
  }
  migrer(db);
  return db;
}

function ouvrirLecture(ctx) {
  if (!existsSync(ctx.db)) throw new Echec(CODES.BASE, `base absente (${ctx.db}) : lancer ingest ou watch --once`);
  let db;
  try {
    db = new Database(ctx.db, { readOnly: true });
    db.exec('PRAGMA busy_timeout = 5000; PRAGMA query_only = ON;');
  } catch (e) {
    throw new Echec(CODES.BASE, `base illisible (${ctx.db}) : ${e.message}`);
  }
  const version = db.prepare('PRAGMA user_version').get().user_version;
  if (version !== MIGRATIONS.length) {
    db.close();
    const raison = version > MIGRATIONS.length ? 'créée par une version plus récente du skill' : 'à migrer : lancer ingest ou watch --once';
    throw new Echec(CODES.BASE, `base ${raison} (schéma ${version})`);
  }
  return db;
}

function transaction(db, travail) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const resultat = travail();
    db.exec('COMMIT');
    return resultat;
  } catch (e) {
    try {
      db.exec('ROLLBACK');
    } catch {
      // transaction déjà annulée
    }
    throw e;
  }
}

const lireMeta = (db) => Object.fromEntries(db.prepare('SELECT key, value FROM app_metadata').all().map((r) => [r.key, r.value]));

function ecrireMeta(db, valeurs) {
  const st = db.prepare('INSERT INTO app_metadata (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value');
  for (const [cle, valeur] of Object.entries(valeurs)) st.run(cle, String(valeur ?? ''));
}

const instantane = (meta) => ({
  mode: meta.mode || null,
  commit: meta.indexed_commit || null,
  branch: meta.indexed_branch || null,
  indexed_at: meta.indexed_at || null,
});

// ---------------------------------------------------------------- verrou du watcher (un seul écrivain)

function lireVerrou(ctx) {
  try {
    return JSON.parse(readFileSync(ctx.verrou, 'utf8'));
  } catch {
    return null;
  }
}

function processusVivant(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === 'EPERM';
  }
}

function watcherActif(ctx) {
  const tenant = lireVerrou(ctx);
  return tenant && processusVivant(tenant.pid) ? tenant : null;
}

function verifierAucunWatcher(ctx) {
  const tenant = watcherActif(ctx);
  if (tenant) throw new Echec(CODES.CONFLIT, `un watcher est actif sur cette base (pid ${tenant.pid}) : il en est le seul écrivain`);
}

function prendreVerrou(ctx) {
  mkdirSync(dirname(ctx.verrou), { recursive: true });
  for (let essai = 0; essai < 2; essai++) {
    try {
      writeFileSync(ctx.verrou, JSON.stringify({ pid: process.pid, depuis: new Date().toISOString(), source: ctx.source }), { flag: 'wx' });
      return;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      verifierAucunWatcher(ctx);
      rmSync(ctx.verrou, { force: true }); // verrou orphelin : son processus n'existe plus
    }
  }
  throw new Echec(CODES.CONFLIT, `verrou impossible à prendre : ${ctx.verrou}`);
}

function libererVerrou(ctx) {
  if (lireVerrou(ctx)?.pid === process.pid) rmSync(ctx.verrou, { force: true });
}

// ---------------------------------------------------------------- inventaire et lecture des fichiers

const DOSSIERS_EXCLUS = new Set([
  '.git', '.skill4appli', '.skills', 'node_modules', 'venv', '.venv', '__pycache__', 'dist', 'build', '.next', '.nuxt',
  '.output', 'target', 'vendor', '.gradle', '.idea', '.vscode', 'coverage', '.pytest_cache', '.mypy_cache', '.tox', 'out',
]);
const VERROUS = new Set([
  'package-lock.json', 'npm-shrinkwrap.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lockb', 'composer.lock', 'poetry.lock',
  'Pipfile.lock', 'Cargo.lock', 'Gemfile.lock', 'gradle.lockfile',
]);
const LANGUES = {
  java: 'java', kt: 'kotlin', kts: 'kotlin', groovy: 'groovy', gradle: 'gradle', scala: 'scala',
  js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'javascript',
  ts: 'typescript', mts: 'typescript', cts: 'typescript', tsx: 'typescript',
  vue: 'vue', svelte: 'svelte', py: 'python', php: 'php', rb: 'ruby', go: 'go', rs: 'rust',
  c: 'c', h: 'c', cc: 'cpp', cpp: 'cpp', hpp: 'cpp', cs: 'csharp', swift: 'swift',
  html: 'html', htm: 'html', css: 'css', scss: 'scss', sass: 'sass', less: 'less', twig: 'twig',
  sql: 'sql', xml: 'xml', json: 'json', yml: 'yaml', yaml: 'yaml', toml: 'toml', ini: 'ini',
  properties: 'properties', md: 'markdown', sh: 'shell', bash: 'shell', bat: 'batch', cmd: 'batch', ps1: 'powershell',
};
const NOMS = { Dockerfile: 'dockerfile', Makefile: 'make', Jenkinsfile: 'groovy' };

function langue(chemin) {
  const nom = chemin.slice(chemin.lastIndexOf('/') + 1);
  if (NOMS[nom]) return NOMS[nom];
  const point = nom.lastIndexOf('.');
  return point > 0 ? LANGUES[nom.slice(point + 1).toLowerCase()] ?? null : null;
}

function raisonExclusion(chemin) {
  const nom = chemin.slice(chemin.lastIndexOf('/') + 1);
  if (VERROUS.has(nom)) return 'verrouillage';
  if (/\.min\.(js|css)$/.test(nom)) return 'minifié';
  if (nom.endsWith('.map')) return 'carte de source';
  return null;
}

function inventaire(ctx, racine, { suivisSeulement = false } = {}) {
  if (ctx.git) {
    const args = suivisSeulement ? ['ls-files', '-z'] : ['ls-files', '-z', '--cached', '--others', '--exclude-standard'];
    return [...new Set(elementsNul(git(racine, args)))];
  }
  const resultat = [];
  const pile = [''];
  while (pile.length > 0) {
    const rel = pile.pop();
    for (const entree of readdirSync(join(racine, rel), { withFileTypes: true })) {
      const chemin = rel ? `${rel}/${entree.name}` : entree.name;
      if (entree.isDirectory()) {
        if (!DOSSIERS_EXCLUS.has(entree.name)) pile.push(chemin);
      } else if (entree.isFile()) {
        resultat.push(chemin);
      }
    }
  }
  return resultat.sort();
}

// Fichiers de la base elle-même, si --db la place dans l'arbre indexé.
function fichiersDeLaBase(ctx, racine) {
  const rel = relative(racine, ctx.db).split(sep).join('/');
  if (rel.startsWith('..')) return new Set();
  return new Set(['', '-wal', '-shm', '-journal', '.watch.lock'].map((suffixe) => rel + suffixe));
}

const empreinteBlob = (contenu) => createHash('sha1').update(`blob ${contenu.length}\0`).update(contenu).digest('hex');

function compterLignes(texte) {
  if (texte.length === 0) return 0;
  let n = 0;
  for (let i = texte.indexOf('\n'); i !== -1; i = texte.indexOf('\n', i + 1)) n++;
  return texte.endsWith('\n') ? n : n + 1;
}

function lireFiche(absolu, chemin, info, tailleMax) {
  const fiche = {
    path: chemin, type: 'file', lang: langue(chemin), size: info.size, lines: null, sha: null,
    encoding: null, mtime_ms: Math.trunc(info.mtimeMs), content: null, metadata: '{}',
  };
  const raison = raisonExclusion(chemin);
  if (raison) return { ...fiche, type: 'skipped', metadata: JSON.stringify({ raison }) };
  if (info.size > tailleMax) return { ...fiche, type: 'large', metadata: JSON.stringify({ raison: 'taille', limite: tailleMax }) };
  const octets = readFileSync(absolu);
  fiche.sha = empreinteBlob(octets);
  if (octets.subarray(0, 8000).includes(0)) return { ...fiche, type: 'binary' };
  try {
    fiche.content = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(octets);
    fiche.encoding = 'utf-8';
  } catch {
    fiche.content = octets.toString('latin1');
    fiche.encoding = 'latin1';
  }
  fiche.lines = compterLignes(fiche.content);
  return fiche;
}

function requetes(db) {
  return {
    upsert: db.prepare(`INSERT INTO app_structure (path, type, lang, size, lines, sha, encoding, mtime_ms, content, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (path) DO UPDATE SET type = excluded.type, lang = excluded.lang, size = excluded.size,
        lines = excluded.lines, sha = excluded.sha, encoding = excluded.encoding, mtime_ms = excluded.mtime_ms,
        content = excluded.content, metadata = excluded.metadata`),
    date: db.prepare('UPDATE app_structure SET mtime_ms = ? WHERE path = ?'),
    supprimer: db.prepare('DELETE FROM app_structure WHERE path = ?'),
  };
}

const valeurs = (f) => [f.path, f.type, f.lang, f.size, f.lines, f.sha, f.encoding, f.mtime_ms, f.content, f.metadata];

function statFichier(absolu) {
  try {
    const info = lstatSync(absolu);
    return info.isFile() ? info : null; // lien symbolique, dossier (sous-module) ou autre : absent de l'inventaire
  } catch {
    return null;
  }
}

// Inventaire complet : la base contient ensuite exactement ces fichiers (aucun fantôme).
function ingererInventaire(db, racine, chemins, { tailleMax, forcer, exclus }) {
  const r = requetes(db);
  const existants = new Map(db.prepare('SELECT path, size, mtime_ms, sha FROM app_structure').all().map((l) => [l.path, l]));
  const vus = new Set();
  const bilan = { fichiers: 0, ajoutes: 0, modifies: 0, inchanges: 0, supprimes: 0 };
  for (const chemin of chemins) {
    if (exclus.has(chemin)) continue;
    const absolu = join(racine, chemin);
    const info = statFichier(absolu);
    if (!info) continue;
    vus.add(chemin);
    const avant = existants.get(chemin);
    if (!forcer && avant && avant.size === info.size && avant.mtime_ms === Math.trunc(info.mtimeMs)) {
      bilan.inchanges++;
      continue;
    }
    const fiche = lireFiche(absolu, chemin, info, tailleMax);
    if (!forcer && avant && avant.sha && avant.sha === fiche.sha) {
      r.date.run(fiche.mtime_ms, chemin); // seule la date a changé : le contenu n'est pas réécrit
      bilan.inchanges++;
      continue;
    }
    r.upsert.run(...valeurs(fiche));
    if (avant) bilan.modifies++;
    else bilan.ajoutes++;
  }
  for (const chemin of existants.keys()) {
    if (!vus.has(chemin)) {
      r.supprimer.run(chemin);
      bilan.supprimes++;
    }
  }
  bilan.fichiers = vus.size;
  return bilan;
}

// Changements entre deux commits du miroir : seuls ces fichiers sont relus.
function ingererChangements(db, racine, changements, { tailleMax }) {
  const r = requetes(db);
  const existe = db.prepare('SELECT 1 AS present FROM app_structure WHERE path = ?');
  const bilan = { ajoutes: 0, modifies: 0, supprimes: 0 };
  for (const { statut, chemin } of changements) {
    const avait = existe.get(chemin) !== undefined;
    const info = statut === 'D' ? null : statFichier(join(racine, chemin));
    if (!info) {
      if (avait) {
        r.supprimer.run(chemin);
        bilan.supprimes++;
      }
      continue;
    }
    r.upsert.run(...valeurs(lireFiche(join(racine, chemin), chemin, info, tailleMax)));
    if (avait) bilan.modifies++;
    else bilan.ajoutes++;
  }
  return bilan;
}

// ---------------------------------------------------------------- branches

const FORMAT_REFS = [
  '%(refname)', '%(symref)', '%(HEAD)', '%(objectname)', '%(objectname:short)', '%(committerdate:iso-strict)',
  '%(upstream:short)', '%(upstream:track,nobracket)', '%(worktreepath)', '%(subject)',
].join('%00');

function lireRefs(ctx) {
  const refs = [];
  for (const ligne of git(ctx.source, ['for-each-ref', `--format=${FORMAT_REFS}`, 'refs/heads', 'refs/remotes']).split('\n')) {
    if (!ligne) continue;
    const [refname, symref, tete, sha, court, date, amont, suivi, worktree, sujet] = ligne.split('\0');
    if (symref) continue; // origin/HEAD et autres références symboliques
    const distante = refname.startsWith('refs/remotes/');
    const nom = refname.replace(/^refs\/(heads|remotes)\//, '');
    const perdu = suivi === 'gone';
    refs.push({
      nom, refname, distante, courante: tete === '*', sha, court, date, amont: amont || null, suivi: suivi || null,
      avance: amont && !perdu ? Number(/ahead (\d+)/.exec(suivi)?.[1] ?? 0) : null,
      retard: amont && !perdu ? Number(/behind (\d+)/.exec(suivi)?.[1] ?? 0) : null,
      worktree: worktree || null, sujet: sujet ?? '',
    });
  }
  return refs;
}

function resoudreBase(ctx, demandee) {
  const verifier = (ref) => git(ctx.source, ['rev-parse', '--verify', '--quiet', '--end-of-options', `${ref}^{commit}`], { permettreEchec: true })?.trim() || null;
  if (demandee) {
    const sha = verifier(demandee);
    if (!sha) throw new Echec(CODES.USAGE, `base introuvable : ${demandee}`);
    return { nom: demandee, sha };
  }
  const origine = git(ctx.source, ['symbolic-ref', '-q', 'refs/remotes/origin/HEAD'], { permettreEchec: true })?.trim();
  for (const candidat of [origine?.replace(/^refs\/remotes\//, ''), 'main', 'master', 'develop']) {
    if (!candidat) continue;
    const sha = verifier(candidat);
    if (sha) return { nom: candidat, sha };
  }
  return null;
}

function fichiersDeBranche(ctx, base, ref) {
  const ancetre = git(ctx.source, ['merge-base', base.sha, ref.sha], { permettreEchec: true })?.trim();
  if (!ancetre) return null;
  const statuts = elementsNul(git(ctx.source, ['diff', '--name-status', '-z', '--no-renames', ancetre, ref.sha]));
  const lignes = new Map();
  for (const entree of elementsNul(git(ctx.source, ['diff', '--numstat', '-z', '--no-renames', ancetre, ref.sha]))) {
    const [ajout, retrait, ...reste] = entree.split('\t');
    lignes.set(reste.join('\t'), [ajout === '-' ? null : Number(ajout), retrait === '-' ? null : Number(retrait)]);
  }
  const fichiers = [];
  for (let i = 0; i + 1 < statuts.length; i += 2) {
    const chemin = statuts[i + 1];
    const [ajout, retrait] = lignes.get(chemin) ?? [null, null];
    fichiers.push({ statut: statuts[i], chemin, ajout, retrait });
  }
  return { ancetre, fichiers };
}

// Écrit git_branches et branch_files ; à appeler dans une transaction.
function scannerBranches(db, ctx, baseDemandee) {
  const refs = lireRefs(ctx);
  const maintenant = new Date().toISOString();
  db.exec('DELETE FROM git_branches; DELETE FROM branch_files;');
  const insererBranche = db.prepare(`INSERT INTO git_branches (branch_name, is_remote, is_current, last_commit, commit_sha,
    commit_subject, committed_at, upstream, track, ahead, behind, worktree_path, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const ref of refs) {
    insererBranche.run(ref.nom, ref.distante ? 1 : 0, ref.courante ? 1 : 0, `${ref.court} - ${ref.sujet}`, ref.sha, ref.sujet,
      ref.date || null, ref.amont, ref.suivi, ref.avance, ref.retard, ref.worktree, maintenant);
  }
  const base = resoudreBase(ctx, baseDemandee);
  let lignesFichiers = 0;
  if (base) {
    const insererFichier = db.prepare(`INSERT INTO branch_files (branch_name, base, merge_base, path, status, added, deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?)`);
    for (const ref of refs.filter((r) => !r.distante)) {
      const diff = fichiersDeBranche(ctx, base, ref);
      if (!diff) continue;
      for (const f of diff.fichiers) {
        insererFichier.run(ref.nom, base.nom, diff.ancetre, f.chemin, f.statut, f.ajout, f.retrait);
        lignesFichiers++;
      }
    }
  }
  return {
    branches: refs.length,
    locales: refs.filter((r) => !r.distante).length,
    distantes: refs.filter((r) => r.distante).length,
    courante: refs.find((r) => r.courante)?.nom ?? null,
    base: base?.nom ?? null,
    fichiers_de_branches: lignesFichiers,
  };
}

const empreinteRefs = (ctx) =>
  createHash('sha1').update(git(ctx.source, ['for-each-ref', '--format=%(objectname) %(refname)', 'refs/heads', 'refs/remotes'])).digest('hex');

// ---------------------------------------------------------------- miroir : la branche courante dans un worktree dédié

function worktreesEnregistres(ctx) {
  const resultat = new Map();
  let courant = null;
  for (const ligne of git(ctx.source, ['worktree', 'list', '--porcelain', '-z']).split('\0')) {
    if (ligne.startsWith('worktree ')) {
      courant = { chemin: resolve(ligne.slice('worktree '.length)), detache: false, verrouille: false };
      resultat.set(courant.chemin, courant);
    } else if (courant && ligne === 'detached') courant.detache = true;
    else if (courant && (ligne === 'locked' || ligne.startsWith('locked '))) courant.verrouille = true;
  }
  return resultat;
}

function verifierMiroirPropre(ctx) {
  const modifies = elementsNul(git(ctx.miroir, ['status', '--porcelain', '-z', '--untracked-files=no']));
  if (modifies.length > 0) {
    throw new Echec(CODES.MIROIR_MODIFIE, `le miroir ${ctx.miroir} a été modifié à la main : le watcher ne l'écrase pas`, {
      fichiers: modifies.map((e) => e.slice(3)).slice(0, LIMITE_LISTES),
    });
  }
}

function preparerMiroir(ctx, tete) {
  const enregistre = worktreesEnregistres(ctx).get(ctx.miroir);
  const raison = `skill4appli : miroir de ${ctx.source}`;
  if (!enregistre) {
    if (existsSync(ctx.miroir)) throw new Echec(CODES.GIT, `${ctx.miroir} existe mais n'est pas un worktree du dépôt : le retirer à la main`);
    mkdirSync(dirname(ctx.miroir), { recursive: true });
    git(ctx.source, ['worktree', 'add', '--detach', '--lock', '--reason', raison, ctx.miroir, tete.commit]);
    return true;
  }
  if (!existsSync(ctx.miroir)) {
    // Enregistré mais dossier disparu : seule cette entrée est recréée, aucun autre worktree n'est élagué.
    git(ctx.source, ['worktree', 'add', '-f', '-f', '--detach', '--lock', '--reason', raison, ctx.miroir, tete.commit]);
    return true;
  }
  if (!enregistre.detache) throw new Echec(CODES.MIROIR_MODIFIE, `le miroir ${ctx.miroir} n'est plus en HEAD détachée : une branche y a été extraite à la main`);
  verifierMiroirPropre(ctx);
  return false;
}

function amenerMiroir(ctx, commit) {
  verifierMiroirPropre(ctx);
  git(ctx.miroir, ['checkout', '--detach', '--quiet', commit]);
}

function synchroComplete(db, ctx, tete, opts, etat) {
  const debut = Date.now();
  amenerMiroir(ctx, tete.commit);
  const chemins = inventaire(ctx, ctx.miroir, { suivisSeulement: true });
  const bilan = transaction(db, () => {
    const b = ingererInventaire(db, ctx.miroir, chemins, { tailleMax: opts.tailleMax, forcer: true, exclus: new Set() });
    ecrireMeta(db, metaMiroir(ctx, tete, opts));
    scannerBranches(db, ctx, opts.base);
    return b;
  });
  etat.empreinte = empreinteRefs(ctx);
  evenement({ evenement: 'indexation_complete', branche: tete.branch, commit: tete.commit, ...bilan, duree_ms: Date.now() - debut });
}

function synchroIncrementale(db, ctx, tete, opts, etat, ancien) {
  const debut = Date.now();
  amenerMiroir(ctx, tete.commit);
  const diff = git(ctx.miroir, ['diff', '--name-status', '-z', '--no-renames', ancien, tete.commit], { permettreEchec: true });
  if (diff === null) {
    synchroComplete(db, ctx, tete, opts, etat); // ancien commit introuvable : historique réécrit
    return;
  }
  const elements = elementsNul(diff);
  const changements = [];
  for (let i = 0; i + 1 < elements.length; i += 2) changements.push({ statut: elements[i], chemin: elements[i + 1] });
  const bilan = transaction(db, () => {
    const b = ingererChangements(db, ctx.miroir, changements, { tailleMax: opts.tailleMax });
    ecrireMeta(db, metaMiroir(ctx, tete, opts));
    scannerBranches(db, ctx, opts.base);
    return b;
  });
  etat.empreinte = empreinteRefs(ctx);
  evenement({ evenement: 'synchro', branche: tete.branch, de: ancien, a: tete.commit, ...bilan, duree_ms: Date.now() - debut });
}

const metaMiroir = (ctx, tete, opts) => ({
  mode: 'miroir', root: ctx.miroir, source: ctx.source, mirror_path: ctx.miroir, indexed_commit: tete.commit,
  indexed_branch: tete.branch, indexed_at: new Date().toISOString(), tool_version: VERSION, max_size: opts.tailleMax,
});

function cycle(db, ctx, opts, etat) {
  const tete = teteSource(ctx);
  if (!tete.commit) throw new Echec(CODES.GIT, "la branche courante n'a encore aucun commit");
  const meta = lireMeta(db);
  if (meta.mode !== 'miroir' || meta.mirror_path !== ctx.miroir || !meta.indexed_commit) {
    synchroComplete(db, ctx, tete, opts, etat);
  } else if (tete.commit !== meta.indexed_commit) {
    synchroIncrementale(db, ctx, tete, opts, etat, meta.indexed_commit);
  } else if (tete.branch !== meta.indexed_branch) {
    transaction(db, () => {
      ecrireMeta(db, { indexed_branch: tete.branch });
      scannerBranches(db, ctx, opts.base);
    });
    etat.empreinte = empreinteRefs(ctx);
    evenement({ evenement: 'branche', de: meta.indexed_branch, a: tete.branch, commit: tete.commit });
  } else {
    const empreinte = empreinteRefs(ctx);
    if (empreinte !== etat.empreinte) {
      const bilan = transaction(db, () => scannerBranches(db, ctx, opts.base));
      if (etat.empreinte !== undefined) evenement({ evenement: 'refs', ...bilan });
      etat.empreinte = empreinte;
    }
  }
}

// ---------------------------------------------------------------- utilitaires d'options et de sortie

function entier(valeur, defaut, min, max, nom) {
  if (valeur === undefined) return defaut;
  const n = Number(valeur);
  if (!Number.isInteger(n) || n < min || n > max) throw new Echec(CODES.USAGE, `--${nom} : entier entre ${min} et ${max} attendu`);
  return n;
}

function bornerLigne(ligne, maxCaracteres, compteur) {
  const resultat = {};
  for (const [cle, valeur] of Object.entries(ligne)) {
    if (typeof valeur === 'string' && valeur.length > maxCaracteres) {
      resultat[cle] = `${valeur.slice(0, maxCaracteres)}…[tronqué : ${valeur.length} caractères]`;
      compteur.n++;
    } else if (valeur instanceof Uint8Array) {
      resultat[cle] = `[binaire : ${valeur.length} octets]`;
    } else if (typeof valeur === 'bigint') {
      resultat[cle] = Number.isSafeInteger(Number(valeur)) ? Number(valeur) : String(valeur);
    } else {
      resultat[cle] = valeur;
    }
  }
  return resultat;
}

const normaliser = (texte) => texte.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

function extrait(ligne, terme) {
  const texte = ligne.trim();
  if (texte.length <= 240) return texte;
  const position = Math.max(0, texte.toLowerCase().indexOf(terme.toLowerCase()));
  const debut = Math.max(0, position - 80);
  return `${debut > 0 ? '…' : ''}${texte.slice(debut, debut + 240)}…`;
}

// ---------------------------------------------------------------- commandes

function cmdInit(ctx) {
  const db = ouvrirEcriture(ctx);
  const schema = db.prepare('PRAGMA user_version').get().user_version;
  db.close();
  ecrire({ ok: true, commande: 'init', db: ctx.db, schema, version: VERSION });
}

function cmdIngest(ctx, opts) {
  verifierAucunWatcher(ctx);
  const tailleMax = entier(opts['max-size'], TAILLE_MAX, 1, 1024 * 1024 * 1024, 'max-size');
  const debut = Date.now();
  const db = ouvrirEcriture(ctx);
  const meta = lireMeta(db);
  const chemins = inventaire(ctx, ctx.source);
  const tete = ctx.git ? teteSource(ctx) : { commit: '', branch: '' };
  const forcer = Boolean(meta.mode) && meta.mode !== 'travail';
  const bilan = transaction(db, () => {
    const b = ingererInventaire(db, ctx.source, chemins, { tailleMax, forcer, exclus: fichiersDeLaBase(ctx, ctx.source) });
    ecrireMeta(db, {
      mode: 'travail', root: ctx.source, source: ctx.source, mirror_path: meta.mirror_path ?? '', indexed_commit: tete.commit,
      indexed_branch: tete.branch, indexed_at: new Date().toISOString(), tool_version: VERSION, max_size: tailleMax,
    });
    return b;
  });
  const snapshot = instantane(lireMeta(db));
  db.close();
  ecrire({ ok: true, commande: 'ingest', db: ctx.db, racine: ctx.source, changement_de_mode: forcer, ...bilan, duree_ms: Date.now() - debut, snapshot });
}

function cmdGitScan(ctx, opts) {
  exigerGit(ctx);
  verifierAucunWatcher(ctx);
  const db = ouvrirEcriture(ctx);
  const bilan = transaction(db, () => scannerBranches(db, ctx, opts.base));
  db.close();
  ecrire({ ok: true, commande: 'git-scan', ...bilan });
}

function lireSql(opts, positionnels) {
  if (opts.file) return readFileSync(opts.file, 'utf8');
  const sql = positionnels[0];
  if (sql === undefined || sql === '-') {
    if (process.stdin.isTTY) throw new Echec(CODES.USAGE, 'requête SQL attendue : en argument, par --file ou sur l’entrée standard');
    return readFileSync(0, 'utf8');
  }
  return sql;
}

function cmdQuery(ctx, opts, positionnels) {
  const sql = lireSql(opts, positionnels);
  if (!sql.trim()) throw new Echec(CODES.USAGE, 'requête SQL vide');
  const limite = entier(opts.limit, 200, 1, 100000, 'limit');
  const maxCaracteres = entier(opts['max-chars'], 2000, 20, 100000000, 'max-chars');
  const db = ouvrirLecture(ctx);
  const lignes = [];
  const compteur = { n: 0 };
  let tronque = false;
  try {
    const requete = db.prepare(sql);
    for (const ligne of requete.iterate(...(opts.param ?? []))) {
      if (lignes.length === limite) {
        tronque = true;
        break;
      }
      lignes.push(bornerLigne(ligne, maxCaracteres, compteur));
    }
  } catch (e) {
    throw new Echec(CODES.BASE, `requête refusée : ${e.message}`);
  }
  const snapshot = instantane(lireMeta(db));
  db.close();
  if (FORMAT === 'table') {
    console.table(lignes);
    return;
  }
  ecrire({ ok: true, commande: 'query', rows: lignes, count: lignes.length, truncated: tronque, values_truncated: compteur.n, snapshot });
}

function cmdSearch(ctx, opts, positionnels) {
  const terme = positionnels[0];
  if (!terme) throw new Echec(CODES.USAGE, 'terme de recherche attendu : search <terme>');
  const limite = entier(opts.limit, 20, 1, 1000, 'limit');
  const parFichier = entier(opts.lines, 5, 1, 1000, 'lines');
  const db = ouvrirLecture(ctx);
  const filtres = [];
  const parametres = [];
  if (opts.path) {
    filtres.push("s.path LIKE ? ESCAPE '\\'");
    parametres.push(`${opts.path.replace(/[\\%_]/g, (c) => `\\${c}`)}%`);
  }
  if (opts.lang) {
    filtres.push('s.lang = ?');
    parametres.push(opts.lang);
  }
  const et = filtres.map((f) => ` AND ${f}`).join('');
  let candidats;
  try {
    candidats = [...terme].length >= 3
      ? db.prepare(`SELECT s.path, s.content FROM app_fts JOIN app_structure s ON s.id = app_fts.rowid
          WHERE app_fts MATCH ?${et} ORDER BY bm25(app_fts) LIMIT ?`).all(`"${terme.replaceAll('"', '""')}"`, ...parametres, limite + 1)
      : db.prepare(`SELECT s.path, s.content FROM app_structure s
          WHERE s.content IS NOT NULL AND instr(lower(s.content), lower(?)) > 0${et} ORDER BY s.path LIMIT ?`).all(terme, ...parametres, limite + 1);
  } catch (e) {
    throw new Echec(CODES.BASE, `recherche refusée : ${e.message}`);
  }
  const tronque = candidats.length > limite;
  const cible = normaliser(terme);
  const resultats = candidats.slice(0, limite).map(({ path, content }) => {
    const lignes = [];
    let total = 0;
    (content ?? '').split('\n').forEach((ligne, i) => {
      if (!normaliser(ligne).includes(cible)) return;
      total++;
      if (lignes.length < parFichier) lignes.push({ line: i + 1, text: extrait(ligne, terme) });
    });
    return { path, matches: total, lines: lignes };
  });
  const snapshot = instantane(lireMeta(db));
  db.close();
  if (FORMAT === 'text') {
    for (const r of resultats) {
      if (r.lines.length === 0) process.stdout.write(`${r.path}: (correspondance dans le chemin)\n`);
      for (const l of r.lines) process.stdout.write(`${r.path}:${l.line}: ${l.text}\n`);
    }
    return;
  }
  ecrire({ ok: true, commande: 'search', term: terme, files: resultats.length, truncated: tronque, results: resultats, snapshot });
}

const DESCRIPTIONS = {
  app_metadata: 'instantané indexé : mode, root, source, mirror_path, indexed_commit, indexed_branch, indexed_at, tool_version, max_size',
  app_structure: 'un fichier par ligne ; content seulement pour type = file',
  'app_structure.path': 'chemin POSIX relatif à la racine indexée',
  'app_structure.type': 'file (texte indexé), binary, large (au-delà de max_size), skipped (verrouillage, minifié, carte de source)',
  'app_structure.lang': "langue déduite de l'extension",
  'app_structure.sha': 'empreinte blob git du contenu (nulle pour large et skipped)',
  'app_structure.encoding': 'utf-8 ou latin1',
  'app_structure.metadata': "JSON : raison d'une exclusion",
  app_fts: 'index plein texte trigramme sur path et content : WHERE app_fts MATCH \'"terme"\', ou commande search',
  git_branches: 'branches locales et distantes, avance et retard sur l’amont, worktree où chacune est extraite',
  'git_branches.last_commit': '"sha court - sujet", format de la version d’origine',
  branch_files: "fichiers modifiés par chaque branche locale depuis l'ancêtre commun avec la base",
  'branch_files.status': 'A ajouté, M modifié, D supprimé, T type changé',
};

function cmdSchema(ctx) {
  const db = ouvrirLecture(ctx);
  const tables = db.prepare(`SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
    AND name NOT LIKE 'app\\_fts\\_%' ESCAPE '\\' ORDER BY name`).all().map(({ name }) => ({
    name,
    description: DESCRIPTIONS[name] ?? null,
    columns: db.prepare(`SELECT name, type FROM pragma_table_info(?)`).all(name).map((c) => ({
      name: c.name, type: c.type, ...(DESCRIPTIONS[`${name}.${c.name}`] ? { description: DESCRIPTIONS[`${name}.${c.name}`] } : {}),
    })),
  }));
  const schema = db.prepare('PRAGMA user_version').get().user_version;
  db.close();
  ecrire({ ok: true, commande: 'schema', schema, tables });
}

function ecartTravail(db, ctx) {
  const exclus = fichiersDeLaBase(ctx, ctx.source);
  const existants = new Map(db.prepare('SELECT path, size, mtime_ms FROM app_structure').all().map((l) => [l.path, l]));
  const modifies = [];
  const nouveaux = [];
  const vus = new Set();
  for (const chemin of inventaire(ctx, ctx.source)) {
    if (exclus.has(chemin)) continue;
    const info = statFichier(join(ctx.source, chemin));
    if (!info) continue;
    vus.add(chemin);
    const avant = existants.get(chemin);
    if (!avant) nouveaux.push(chemin);
    else if (avant.size !== info.size || avant.mtime_ms !== Math.trunc(info.mtimeMs)) modifies.push(chemin);
  }
  const disparus = [...existants.keys()].filter((c) => !vus.has(c));
  return { modifies, nouveaux, disparus };
}

function modificationsLocales(ctx) {
  const elements = elementsNul(git(ctx.source, ['status', '--porcelain=v1', '-z', '--untracked-files=all']));
  const fichiers = [];
  for (let i = 0; i < elements.length; i++) {
    const statut = elements[i].slice(0, 2);
    fichiers.push({ statut: statut.trim(), chemin: elements[i].slice(3) });
    if (statut[0] === 'R' || statut[0] === 'C') i++; // chemin d'origine du renommage
  }
  return fichiers;
}

function cmdStatus(ctx) {
  const tenant = watcherActif(ctx);
  const watcher = tenant ? { actif: true, pid: tenant.pid, depuis: tenant.depuis } : { actif: false };
  if (!existsSync(ctx.db)) {
    ecrire({ ok: true, commande: 'status', verdict: 'jamais_indexe', db: ctx.db, source: ctx.source, watcher });
    process.exitCode = CODES.PAS_A_JOUR;
    return;
  }
  const db = ouvrirLecture(ctx);
  const meta = lireMeta(db);
  const tete = ctx.git ? teteSource(ctx) : { commit: '', branch: '' };
  const rapport = {
    ok: true, commande: 'status', verdict: 'a_jour', db: ctx.db, source: ctx.source, snapshot: instantane(meta),
    courant: { commit: tete.commit || null, branch: tete.branch || null }, watcher,
  };
  const borne = (liste) => ({ total: liste.length, premiers: liste.slice(0, LIMITE_LISTES) });
  if (!meta.indexed_at) {
    rapport.verdict = 'jamais_indexe';
  } else if (meta.mode === 'miroir') {
    if (tete.commit !== meta.indexed_commit) {
      rapport.verdict = 'en_retard';
      const compte = git(ctx.source, ['rev-list', '--count', `${meta.indexed_commit}..${tete.commit}`], { permettreEchec: true });
      rapport.commits_en_retard = compte === null ? null : Number(compte.trim());
      const changes = git(ctx.source, ['diff', '--name-only', '-z', '--no-renames', meta.indexed_commit, tete.commit], { permettreEchec: true });
      rapport.fichiers_changes = changes === null ? null : borne(elementsNul(changes));
      if (changes === null) rapport.historique_reecrit = true;
    }
    const locales = modificationsLocales(ctx);
    rapport.modifications_locales = borne(locales);
    if (rapport.verdict === 'a_jour' && locales.length > 0) rapport.verdict = 'modifs_locales';
  } else {
    const ecart = ecartTravail(db, ctx);
    rapport.fichiers_modifies = borne(ecart.modifies);
    rapport.fichiers_nouveaux = borne(ecart.nouveaux);
    rapport.fichiers_disparus = borne(ecart.disparus);
    rapport.commit_change = Boolean(ctx.git && tete.commit !== meta.indexed_commit);
    if (ecart.modifies.length + ecart.nouveaux.length + ecart.disparus.length > 0) rapport.verdict = 'en_retard';
  }
  db.close();
  ecrire(rapport);
  if (rapport.verdict !== 'a_jour') process.exitCode = CODES.PAS_A_JOUR;
}

async function cmdWatch(ctx, opts) {
  exigerGit(ctx);
  const reglages = {
    intervalle: entier(opts.interval, 2000, 500, 3600000, 'interval'),
    tailleMax: entier(opts['max-size'], TAILLE_MAX, 1, 1024 * 1024 * 1024, 'max-size'),
    base: opts.base,
  };
  const tete = teteSource(ctx);
  if (!tete.commit) throw new Echec(CODES.GIT, "la branche courante n'a encore aucun commit : rien à charger dans le miroir");
  prendreVerrou(ctx);
  let db;
  try {
    const cree = preparerMiroir(ctx, tete);
    db = ouvrirEcriture(ctx);
    const etat = {};
    if (opts.once) {
      const avant = evenementsEmis;
      cycle(db, ctx, reglages, etat);
      if (evenementsEmis === avant) evenement({ evenement: 'a_jour', branche: tete.branch, commit: tete.commit });
      return;
    }
    evenement({ evenement: 'demarrage', source: ctx.source, miroir: ctx.miroir, miroir_cree: cree, intervalle_ms: reglages.intervalle, pid: process.pid });
    let arret = false;
    let reveil = () => {};
    let minuteur = null;
    const arreter = () => {
      arret = true;
      clearTimeout(minuteur);
      reveil();
    };
    process.once('SIGINT', arreter);
    process.once('SIGTERM', arreter);
    while (!arret) {
      try {
        cycle(db, ctx, reglages, etat);
      } catch (e) {
        if (e instanceof Echec && e.code === CODES.MIROIR_MODIFIE) throw e;
        evenement({ evenement: 'erreur', message: e.message });
      }
      if (arret) break;
      await new Promise((suite) => {
        reveil = suite;
        minuteur = setTimeout(suite, reglages.intervalle);
      });
    }
    evenement({ evenement: 'arret' });
  } finally {
    try {
      db?.close();
    } catch {
      // déjà fermée
    }
    libererVerrou(ctx);
  }
}

function cmdMirrorRemove(ctx, opts) {
  exigerGit(ctx);
  verifierAucunWatcher(ctx);
  const racineSkill = join(ctx.commun, 'skill4appli') + sep;
  if (!ctx.miroir.startsWith(racineSkill)) throw new Echec(CODES.USAGE, `chemin de miroir inattendu : ${ctx.miroir}`);
  if (!worktreesEnregistres(ctx).has(ctx.miroir)) {
    ecrire({ ok: true, commande: 'mirror-remove', retire: false, raison: 'aucun miroir enregistré', miroir: ctx.miroir });
    return;
  }
  if (!opts.force && existsSync(ctx.miroir)) verifierMiroirPropre(ctx);
  git(ctx.source, ['worktree', 'unlock', ctx.miroir], { permettreEchec: true });
  git(ctx.source, ['worktree', 'remove', ...(opts.force ? ['--force'] : []), ctx.miroir]);
  if (existsSync(ctx.db)) {
    const db = ouvrirEcriture(ctx);
    ecrireMeta(db, { mirror_path: '' });
    db.close();
  }
  ecrire({ ok: true, commande: 'mirror-remove', retire: true, miroir: ctx.miroir });
}

const AIDE = `skill4appli ${VERSION} : mémoire SQLite d'une application locale et de ses branches git

Usage : node scripts/app_db.mjs <commande> [options]

Commandes
  init                      crée ou migre la base
  ingest [dossier]          indexe le worktree source tel qu'il est sur le disque (mode travail)
  git-scan                  branches locales et distantes, fichiers modifiés par branche
  query [sql | -]           requête SQL en lecture seule (argument, --file ou entrée standard)
  search <terme>            emplacements chemin:ligne où figure le terme
  schema                    tables et colonnes de la base
  status                    fraîcheur de la base par rapport au worktree source (code 6 si pas à jour)
  watch                     charge la branche courante dans un worktree dédié et le suit (mode miroir)
  mirror-remove             retire le worktree dédié (watcher arrêté)

Options
  --repo <dossier>          worktree source (défaut : dossier courant)
  --db <fichier>            base (défaut : <dossier commun git>/skill4appli/<id>/memoire.db ; ou SKILL4APPLI_DB)
  --format json|pretty|table|text   sortie (défaut json ; table pour query, text pour search)
  --limit <n>               lignes (query, défaut 200) ou fichiers (search, défaut 20)
  --max-chars <n>           longueur maximale d'une valeur texte rendue par query (défaut 2000)
  --param <valeur>          paramètre positionnel ? de query, répétable
  --file <fichier>          requête SQL lue dans un fichier
  --path <préfixe>          search : chemins commençant par ce préfixe
  --lang <langue>           search : fichiers de cette langue
  --lines <n>               search : lignes rendues par fichier (défaut 5)
  --max-size <octets>       taille au-delà de laquelle le contenu n'est pas indexé (défaut 1048576)
  --base <ref>              git-scan, watch : base de branch_files (défaut origin/HEAD, main, master, develop)
  --interval <ms>           watch : intervalle de scrutation (défaut 2000, minimum 500)
  --once                    watch : une seule synchronisation, puis sortie
  --force                   mirror-remove : retire aussi un miroir modifié à la main

Codes de sortie
  0 succès · 1 usage · 2 base ou requête · 3 git · 4 watcher actif · 5 environnement · 6 base pas à jour · 7 miroir modifié à la main
`;

const COMMANDES = {
  init: cmdInit, ingest: cmdIngest, 'git-scan': cmdGitScan, query: cmdQuery, search: cmdSearch, schema: cmdSchema,
  status: cmdStatus, watch: cmdWatch, 'mirror-remove': cmdMirrorRemove,
};

async function principal() {
  let analyse;
  try {
    analyse = parseArgs({
      args: process.argv.slice(2),
      allowPositionals: true,
      strict: true,
      options: {
        repo: { type: 'string' }, db: { type: 'string' }, format: { type: 'string' }, limit: { type: 'string' },
        'max-chars': { type: 'string' }, 'max-size': { type: 'string' }, param: { type: 'string', multiple: true },
        file: { type: 'string' }, path: { type: 'string' }, lang: { type: 'string' }, lines: { type: 'string' },
        base: { type: 'string' }, interval: { type: 'string' }, once: { type: 'boolean' }, force: { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
      },
    });
  } catch (e) {
    throw new Echec(CODES.USAGE, e.message);
  }
  const { values: opts, positionals } = analyse;
  if (opts.help) {
    process.stdout.write(AIDE);
    return;
  }
  FORMAT = opts.format ?? 'json';
  if (!['json', 'pretty', 'table', 'text'].includes(FORMAT)) throw new Echec(CODES.USAGE, `--format inconnu : ${FORMAT}`);
  const [commande, ...reste] = positionals;
  if (!commande) throw new Echec(CODES.USAGE, 'commande attendue (aide : --help)');
  const executer = COMMANDES[commande];
  if (!executer) throw new Echec(CODES.USAGE, `commande inconnue : ${commande} (aide : --help)`);
  if (commande === 'ingest' && reste[0] && !opts.repo) opts.repo = reste[0];
  await executer(contexte(opts), opts, reste);
}

principal().catch(sortieErreur);
```
