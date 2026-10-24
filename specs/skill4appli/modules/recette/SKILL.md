---
name: recette
description: Recette du skill (lancement de node --test sous Linux, WSL2 et Windows, dépôts temporaires et configuration git neutre, table des 34 scénarios T1 à T33 et T22b rattachés aux invariants de D1 à D6, D10 et D12, scénario sauté sous Windows, contrôles par réintroduction de défauts, inertie des dimensions réservées, recette en CI sur ubuntu-latest et windows-latest, source complète de tests/app_db.test.mjs). À lire pour installer le skill, et avant de publier une version.
dimensions: [D1, D2, D3, D4, D5, D6, D10, D12]
status: active
---

# Module `recette` (D1 à D6, D10, D12)

## 1. Lancer la recette

```bash
cd .skills/skill4appli
node --test tests/app_db.test.mjs
```

Sous Windows, la même commande, depuis CMD, PowerShell ou Git Bash : `cd .skills\skill4appli`, puis `node --test tests/app_db.test.mjs`.

Chaque test crée son propre dépôt git temporaire (`git init`, un projet type : code JavaScript et Java, un `.properties` en ISO-8859-1, un binaire, un fichier de verrouillage, des dossiers ignorés), lance le script comme un agent le ferait (processus séparé, sorties JSON lues) et supprime ses dossiers à la fin. La configuration git est neutre et la même partout : ni configuration système (`GIT_CONFIG_NOSYSTEM=1`, qui écarte le `core.autocrlf` de Git for Windows), ni configuration de l'utilisateur (un fichier vide en `GIT_CONFIG_GLOBAL`), ni variable `SKILL4APPLI_*` héritée. T31 active lui-même `core.autocrlf` pour éprouver les fins de ligne CRLF. Durée : une quinzaine de secondes.

| Plateforme | Attendu |
|---|---|
| Linux, WSL2 | `# pass 34`, `# fail 0` |
| Windows | `# pass 33`, `# skipped 1`, `# fail 0` : T20 est sauté, Windows ne transmettant aucun signal à un processus qu'on termine ; T30 couvre l'arrêt sur toutes les plateformes |

## 2. Scénarios

| ID | Scénario | Invariants |
|---|---|---|
| T1 | une branche nommée `x;touch${IFS}PWNED` : `git-scan` et `watch` ne créent aucun fichier, le nom est stocké tel quel | D1.INV-1 |
| T2 | `query`, `search`, `schema` et `status` lancés d'un autre dossier sur un projet jamais indexé : code 2 ou verdict `jamais_indexe`, aucune base créée | D1.INV-2 |
| T3 | après `ingest`, la base est dans `.git/skill4appli/`, `git status` est vide, une requête lancée d'ailleurs la trouve | D1.INV-2 |
| T4 | codes 0, 1, 2 et 3 ; erreur JSON sur la sortie d'erreur | D1.INV-3 |
| T5 | une base de la version d'origine, passée par `--db`, est reconstruite au schéma 1 | D1.INV-4 |
| T6 | une base au schéma 99 est refusée | D1.INV-4 |
| T7 | le script et la recette n'importent que des modules `node:` | D1.INV-5 |
| T8 | `target/`, `vendor/` et `.venv/`, ignorés, ne sont pas indexés ; un fichier non suivi non ignoré l'est | D2.INV-1 |
| T9 | un fichier supprimé disparaît de la base et de la recherche | D2.INV-2 |
| T10 | binaire, verrouillage, gros fichier sans contenu ; `.properties` latin1 lu sans perte | D2.INV-3 |
| T11 | ré-ingestion sans changement : rien de réécrit ; date seule : rien de réindexé ; contenu changé : un fichier modifié | D2.INV-4 |
| T12 | branches locale, distante, extraite dans un autre worktree ; amont, avance, retard ; ni `+` ni `origin/HEAD` | D3.INV-1 |
| T13 | fichiers d'une branche depuis l'ancêtre commun, statuts `A`, `M`, `D`, lignes ajoutées et retirées | D3.INV-2 |
| T14 | `DELETE` et `UPDATE` par `query`, en argument ou sur l'entrée standard, refusés ; base intacte après toutes les lectures | D4.INV-1 |
| T15 | `--limit` et `--max-chars` appliqués et signalés ; instantané joint à `query` et à `search` | D4.INV-2, D4.INV-3 |
| T16 | `search` sans casse ni accent, filtres de chemin et de langue, format texte, classement par pertinence | D4.INV-4 |
| T17 | `status` : `a_jour` et code 0, puis fichiers modifiés, nouveaux et disparus nommés avec le code 6, sans écriture | D5.INV-1, D5.INV-2 |
| T18 | `watch --once` : miroir enregistré, détaché, verrouillé ; références, index et état de la source inchangés ; verdict `modifs_locales` | D6.INV-1 |
| T19 | un commit : seuls les fichiers changés relus ; changement de branche suivi ; `a_jour` quand rien ne change | D6.INV-2 |
| T20 | watcher continu : `synchro` après un commit, arrêt propre par `SIGTERM`, verrou libéré ; sauté sous Windows | D6.INV-2 |
| T21 | watcher actif : `ingest`, `git-scan`, `watch` et `mirror-remove` refusés avec le code 4 ; verrou orphelin repris après un arrêt brutal | D6.INV-3 |
| T22 | miroir modifié à la main : `watch --once` et `mirror-remove` refusent (code 7) ; `mirror-remove --force` le retire | D6.INV-4, D6.INV-5 |
| T22b | même situation pendant un watcher continu : arrêt avec le code 7, miroir intact | D6.INV-4 |
| T23 | `mirror-remove` retire le miroir et lui seul ; l'autre worktree reste ; `watch` le recrée | D6.INV-5 |
| T24 | inertie de D8 et D9 : tables exactes du schéma 1, aucune commande `symbols` | |
| T25 | `SKILL4APPLI_REPO` lancé d'ailleurs, `SKILL4APPLI_MAX_SIZE` appliqué puis dépassé par `--max-size`, `SKILL4APPLI_FORMAT` puis `--format`, `SKILL4APPLI_DB` | D10.INV-1 |
| T26 | variables invalides nommées avec le code 1 ; variables vides valant absentes ; exécutable git introuvable : code 3 | D10.INV-2 |
| T27 | `config` : valeur et source de chaque réglage, emplacements, versions de la plateforme, rien d'écrit | D10.INV-3 |
| T28 | le même worktree atteint par un lien symbolique (Linux) ou par une autre casse (Windows) : une seule base, à jour | D12.INV-1 |
| T29 | `source`, `root`, `mirror_path` et `worktree_path` absolus, au format de la plateforme, existants ; chemins du dépôt sans `\` | D12.INV-2 |
| T30 | `watch-stop` arrête le watcher (événement `arret`, raison `watch-stop`, code 0), sans verrou ni demande restante ; sans watcher, rien à arrêter ; une demande antérieure au watcher, ou visant un autre processus, ne l'arrête pas | D12.INV-3 |
| T31 | `core.autocrlf` actif : miroir en CRLF ; `search` rend la ligne 2 sans retour chariot ; 3 lignes comptées ; `status` à jour | D12.INV-4 |
| T32 | diagnostic : WSL sur un montage DrvFs ou sur `/mnt/<lecteur>` sans table, avertissement ; WSL sur ext4, Linux natif, Windows, aucun ; `status` et `config` portent le diagnostic | D12.INV-5 |
| T33 | une seule ligne JSON par commande de lecture ; `executer()` importé rend le même objet que la ligne de commande ; aucune commande `mcp` | E4, inertie de D11 |

## 3. Contrôle de la recette elle-même

Avant publication, des défauts ont été réintroduits un à un dans le script ; chacun a fait échouer le test attendu, sans jamais bloquer la recette :

| Défaut réintroduit | Test en échec |
|---|---|
| appel de git par un shell | T1 |
| fichiers disparus conservés en base | T9 |
| références symboliques gardées | T12 |
| base ouverte en écriture par les commandes de lecture | T14 |
| vérification du miroir retirée avant son déplacement | T22b |
| variables d'environnement ignorées | T25 |
| variable vide prise pour une valeur | T26 |
| demande d'arrêt ignorée par le watcher | T30 |
| demande d'arrêt d'un autre processus honorée | T30 |
| demande d'arrêt antérieure gardée au démarrage | T30 |
| extrait gardant son retour chariot | T31 |
| repli sur `/mnt/<lecteur>` retiré du diagnostic | T32 |
| objet de la ligne de commande différent de celui d'`executer()` | T33 |

Un test qui attend un watcher le tue s'il ne s'arrête pas dans les 15 s : une régression fait échouer la recette, elle ne la fait jamais attendre sans fin.

## 4. Recette en intégration continue

Le dépôt Agent2Prompt rejoue la recette à chaque pull request et à chaque push sur `main` qui touchent ce skill (`.github/workflows/recette-skill4appli.yml`), sur `ubuntu-latest` et `windows-latest`, avec Node 22 et Node 24. Chaque tâche suit le chemin de l'IA du développeur :

1. elle matérialise la transmission de la version courante et vérifie sa table d'intégrité ;
2. elle lance la commande d'extraction du module `execution`, § 9, telle quelle : sous bash sur Linux, depuis un fichier `.cmd` sous CMD sur Windows ;
3. elle lance la recette et publie le bilan (tests, réussis, sautés, échecs) et chaque échec en annotations de la pull request.

## 5. Source de `tests/app_db.test.mjs`

<!-- fichier : tests/app_db.test.mjs -->
```js
// Recette de skill4appli 1.1.0 : un test par scénario, rattaché à son invariant, sous Linux, WSL2 et Windows.
// Usage, depuis le dossier du skill : node --test tests/app_db.test.mjs
// Node 22.13 ou plus récent, git 2.38 ou plus récent ; chaque test travaille dans un dépôt temporaire.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync, symlinkSync, utimesSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// T5, T6 et les tests qui importent le script chargent node:sqlite dans ce processus :
// son avertissement expérimental est filtré, les autres restent affichés.
process.removeAllListeners('warning');
process.on('warning', (w) => {
  if (!(w.name === 'ExperimentalWarning' && /sqlite/i.test(w.message))) process.stderr.write(`${w.name}: ${w.message}\n`);
});

const WINDOWS = process.platform === 'win32';
const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'app_db.mjs');
const temporaires = [];

// Chemin réel : sous Windows, rétablit les noms longs (RUNNER~1) et la casse du disque.
const reel = (chemin) => realpathSync.native(chemin);

function dossierTemporaire() {
  const dossier = reel(mkdtempSync(join(tmpdir(), 's4a-')));
  temporaires.push(dossier);
  return dossier;
}

// Configuration git neutre et identique sur toutes les plateformes : ni système (core.autocrlf de Git for Windows),
// ni configuration de l'utilisateur ; aucune variable SKILL4APPLI_* héritée.
const configGitVide = join(dossierTemporaire(), 'gitconfig');
writeFileSync(configGitVide, '');
for (const variable of Object.keys(process.env)) if (variable.startsWith('SKILL4APPLI_')) delete process.env[variable];
Object.assign(process.env, { LC_ALL: 'C', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: configGitVide });
const ENV = { ...process.env };

process.on('exit', () => {
  for (const dossier of temporaires) {
    try {
      rmSync(dossier, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    } catch {
      // un fichier encore ouvert sous Windows : le dossier temporaire reste
    }
  }
});

const memeChemin = (a, b) => (WINDOWS ? resolve(a).toLowerCase() === resolve(b).toLowerCase() : resolve(a) === resolve(b));
const pause = (ms) => new Promise((suite) => setTimeout(suite, ms));

function g(dossier, ...args) {
  return execFileSync('git', ['-C', dossier, ...args], { encoding: 'utf8', env: ENV, stdio: ['ignore', 'pipe', 'pipe'] });
}

function ecrire(racine, chemin, contenu) {
  mkdirSync(dirname(join(racine, chemin)), { recursive: true });
  writeFileSync(join(racine, chemin), contenu);
}

function commit(racine, message = 'commit') {
  g(racine, 'add', '-A');
  g(racine, 'commit', '-q', '-m', message);
  return g(racine, 'rev-parse', 'HEAD').trim();
}

function depot() {
  const racine = join(dossierTemporaire(), 'appli');
  mkdirSync(racine);
  g(racine, 'init', '-q', '-b', 'main');
  g(racine, 'config', 'user.email', 'recette@exemple.fr');
  g(racine, 'config', 'user.name', 'Recette');
  g(racine, 'config', 'commit.gpgsign', 'false');
  return racine;
}

// Projet type : code, fichier latin1, binaire, verrou, dossiers ignorés.
function projet() {
  const racine = depot();
  ecrire(racine, 'src/server.js', "import Fastify from 'fastify';\nexport const app = Fastify();\n");
  ecrire(racine, 'src/old.js', 'export const ancien = true;\n');
  ecrire(racine, 'src/Commande.java', 'package app;\n\n@RestController\npublic class Commande {}\n');
  ecrire(racine, 'config/messages.properties', Buffer.from('titre=Biblioth\xe8que\n', 'latin1'));
  ecrire(racine, 'assets/font.woff2', Buffer.from([0x77, 0x4f, 0x46, 0x32, 0x00, 0x01, 0x00, 0x00, 0xff, 0xfe]));
  ecrire(racine, 'package-lock.json', '{"lockfileVersion": 3}\n');
  ecrire(racine, '.gitignore', 'target/\nvendor/\n.venv/\n');
  ecrire(racine, 'target/classes/App.class', Buffer.from([0xca, 0xfe, 0xba, 0xbe, 0x00]));
  ecrire(racine, 'vendor/autoload.php', '<?php // dépendance\n');
  ecrire(racine, '.venv/lib/site.py', 'x = 1\n');
  commit(racine, 'init');
  return racine;
}

function lancer(args, { cwd, entree, repo, env } = {}) {
  const complet = repo ? [...args, '--repo', repo] : args;
  const r = spawnSync(process.execPath, [SCRIPT, ...complet], {
    cwd: cwd ?? repo, input: entree, encoding: 'utf8', env: { ...ENV, ...env },
  });
  // Une ligne par objet JSON ; une sortie indentée (--format pretty) se lit dans stdout.
  const lignes = (texte) => texte.split('\n').filter((l) => l.startsWith('{') && l.endsWith('}')).map((l) => JSON.parse(l));
  const sortie = lignes(r.stdout);
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, lignes: sortie, json: sortie.at(-1), erreur: lignes(r.stderr).at(-1) };
}

const reussir = (args, options) => {
  const r = lancer(args, options);
  assert.equal(r.code, 0, `code ${r.code} pour ${args.join(' ')} : ${r.stderr}`);
  return r.json;
};

const lignesSql = (repo, sql, ...params) => reussir(['query', sql, ...params.flatMap((p) => ['--param', String(p)])], { repo }).rows;

function attendre(predicat, delai = 15000) {
  return new Promise((resoudre, rejeter) => {
    const debut = Date.now();
    const boucle = () => {
      if (predicat()) return resoudre();
      if (Date.now() - debut > delai) return rejeter(new Error('délai dépassé'));
      setTimeout(boucle, 50);
    };
    boucle();
  });
}

function watcherEnFond(repo, ...args) {
  const enfant = spawn(process.execPath, [SCRIPT, 'watch', '--repo', repo, '--interval', '500', ...args], { env: ENV });
  const evenements = [];
  let reste = '';
  enfant.stdout.on('data', (morceau) => {
    reste += morceau;
    const lignes = reste.split('\n');
    reste = lignes.pop();
    for (const ligne of lignes) if (ligne.trim()) evenements.push(JSON.parse(ligne));
  });
  const fin = new Promise((resoudre) => enfant.on('exit', (code, signal) => resoudre({ code, signal })));
  const arreter = () => {
    if (enfant.exitCode === null && enfant.signalCode === null) enfant.kill('SIGKILL');
  };
  // Une régression doit faire échouer le test, jamais le laisser attendre sans fin.
  const finAvant = (delai = 15000) =>
    Promise.race([
      fin,
      new Promise((_, rejeter) => {
        setTimeout(() => {
          arreter();
          rejeter(new Error('le watcher ne s’est pas arrêté à temps'));
        }, delai).unref();
      }),
    ]);
  return { enfant, evenements, fin, finAvant, arreter, a: (nom) => evenements.some((e) => e.evenement === nom) };
}

const cheminBase = (repo) => reussir(['init'], { repo }).db;
const miroirDe = (repo) => lignesSql(repo, "SELECT value FROM app_metadata WHERE key = 'mirror_path'")[0].value;

// Worktrees enregistrés, chemins au format de la plateforme.
function worktrees(repo) {
  return g(repo, 'worktree', 'list', '--porcelain')
    .split('\n')
    .filter((l) => l.startsWith('worktree '))
    .map((l) => resolve(l.slice('worktree '.length)));
}

// ------------------------------------------------------------------ D1 : exécution

test('T1 D1.INV-1 : un nom de branche piégé reste une donnée, aucune commande n’est exécutée', () => {
  const repo = projet();
  const piege = 'x;touch${IFS}PWNED';
  g(repo, 'branch', piege);
  reussir(['git-scan'], { repo });
  reussir(['watch', '--once'], { repo });
  assert.equal(existsSync(join(repo, 'PWNED')), false);
  const noms = lignesSql(repo, 'SELECT branch_name FROM git_branches').map((l) => l.branch_name);
  assert.ok(noms.includes(piege));
});

test('T2 D1.INV-2 : une commande de lecture lancée d’ailleurs ne crée aucune base', () => {
  const repo = projet();
  const ailleurs = dossierTemporaire();
  for (const commande of [['query', 'SELECT 1'], ['search', 'fastify'], ['schema']]) {
    const r = lancer([...commande, '--repo', repo], { cwd: ailleurs });
    assert.equal(r.code, 2);
    assert.match(r.erreur.erreur, /base absente/);
  }
  const statut = lancer(['status', '--repo', repo], { cwd: ailleurs });
  assert.equal(statut.code, 6);
  assert.equal(statut.json.verdict, 'jamais_indexe');
  assert.equal(existsSync(join(repo, '.git', 'skill4appli')), false);
  assert.equal(existsSync(join(ailleurs, 'app_memory.db')), false);
});

test('T3 D1.INV-2 : la base vit dans le dossier commun git, le worktree reste propre', () => {
  const repo = projet();
  const ingestion = reussir(['ingest'], { repo });
  assert.ok(ingestion.db.startsWith(join(repo, '.git', 'skill4appli') + sep));
  assert.equal(g(repo, 'status', '--porcelain'), '');
  const ailleurs = dossierTemporaire();
  const r = reussir(['query', 'SELECT count(*) AS n FROM app_structure', '--repo', repo], { cwd: ailleurs });
  assert.ok(r.rows[0].n > 0);
});

test('T4 D1.INV-3 : codes de sortie et messages JSON', () => {
  const repo = projet();
  reussir(['ingest'], { repo });
  const ok = lancer(['query', 'SELECT 1 AS un'], { repo });
  assert.equal(ok.code, 0);
  assert.equal(ok.json.ok, true);
  const sql = lancer(['query', 'SELEC oups'], { repo });
  assert.equal(sql.code, 2);
  assert.equal(sql.erreur.ok, false);
  assert.equal(sql.erreur.code, 2);
  assert.equal(lancer(['inconnue'], { repo }).code, 1);
  assert.equal(lancer(['query', 'SELECT 1', '--limit', 'zero'], { repo }).code, 1);
  assert.equal(lancer(['git-scan'], { repo: dossierTemporaire() }).code, 3);
});

test('T5 D1.INV-4 : une base de la version d’origine est reconstruite', async () => {
  const repo = projet();
  const db = join(dossierTemporaire(), 'app_memory.db');
  const { DatabaseSync } = await import('node:sqlite');
  const ancienne = new DatabaseSync(db);
  ancienne.exec(`CREATE TABLE app_structure (id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT UNIQUE, type TEXT, content TEXT, metadata TEXT);
    CREATE TABLE git_branches (id INTEGER PRIMARY KEY AUTOINCREMENT, branch_name TEXT UNIQUE, is_current INTEGER, last_commit TEXT, updated_at TEXT);
    CREATE TABLE app_metadata (key TEXT PRIMARY KEY, value TEXT);
    INSERT INTO app_structure (path, type, content, metadata) VALUES ('fantome.js', 'file', 'x', '');`);
  ancienne.close();
  reussir(['ingest', '--db', db], { repo });
  const r = reussir(['query', "SELECT count(*) AS n FROM app_structure WHERE path = 'fantome.js'", '--db', db], { repo });
  assert.equal(r.rows[0].n, 0);
  const version = reussir(['query', 'PRAGMA user_version', '--db', db], { repo });
  assert.equal(version.rows[0].user_version, 1);
});

test('T6 D1.INV-4 : une base d’une version plus récente est refusée', async () => {
  const repo = projet();
  const db = join(dossierTemporaire(), 'future.db');
  const { DatabaseSync } = await import('node:sqlite');
  const future = new DatabaseSync(db);
  future.exec('PRAGMA user_version = 99');
  future.close();
  const r = lancer(['ingest', '--db', db], { repo });
  assert.equal(r.code, 2);
  assert.match(r.erreur.erreur, /plus récente/);
});

test('T7 D1.INV-5 : le script et sa recette n’importent que des modules natifs', () => {
  for (const fichier of [SCRIPT, fileURLToPath(import.meta.url)]) {
    const source = readFileSync(fichier, 'utf8');
    const statiques = [...source.matchAll(/^import\s[^;]*?from\s+'([^']+)'/gm)].map((m) => m[1]);
    const dynamiques = [...source.matchAll(/\bimport\(\s*'([^']+)'\s*\)/g)].map((m) => m[1]);
    const modules = [...statiques, ...dynamiques];
    assert.ok(modules.length > 0);
    for (const nom of modules) assert.ok(nom.startsWith('node:'), `module non natif dans ${fichier} : ${nom}`);
  }
});

// ------------------------------------------------------------------ D2 : inventaire et ingestion

test('T8 D2.INV-1 : l’inventaire est celui de git, les fichiers ignorés ne sont jamais indexés', () => {
  const repo = projet();
  ecrire(repo, 'src/nouveau.ts', 'export const neuf = 1;\n');
  reussir(['ingest'], { repo });
  const chemins = lignesSql(repo, 'SELECT path FROM app_structure ORDER BY path').map((l) => l.path);
  assert.ok(chemins.includes('src/nouveau.ts'), 'fichier non suivi mais non ignoré');
  for (const ignore of ['target/classes/App.class', 'vendor/autoload.php', '.venv/lib/site.py']) {
    assert.ok(!chemins.includes(ignore), `${ignore} ne doit pas être indexé`);
  }
});

test('T9 D2.INV-2 : aucun fichier fantôme après suppression', () => {
  const repo = projet();
  reussir(['ingest'], { repo });
  rmSync(join(repo, 'src/old.js'));
  const bilan = reussir(['ingest'], { repo });
  assert.equal(bilan.supprimes, 1);
  assert.equal(lignesSql(repo, 'SELECT count(*) AS n FROM app_structure WHERE path = ?', 'src/old.js')[0].n, 0);
  assert.equal(reussir(['search', 'ancien'], { repo }).files, 0);
});

test('T10 D2.INV-3 : binaire, verrou et gros fichier sans contenu ; latin1 lu sans perte', () => {
  const repo = projet();
  ecrire(repo, 'docs/gros.txt', 'a'.repeat(5000));
  reussir(['ingest', '--max-size', '4096'], { repo });
  const fiches = Object.fromEntries(lignesSql(repo, 'SELECT path, type, encoding, content FROM app_structure').map((l) => [l.path, l]));
  assert.equal(fiches['assets/font.woff2'].type, 'binary');
  assert.equal(fiches['assets/font.woff2'].content, null);
  assert.equal(fiches['package-lock.json'].type, 'skipped');
  assert.equal(fiches['package-lock.json'].content, null);
  assert.equal(fiches['docs/gros.txt'].type, 'large');
  assert.equal(fiches['docs/gros.txt'].content, null);
  assert.equal(fiches['config/messages.properties'].encoding, 'latin1');
  assert.equal(fiches['config/messages.properties'].content, 'titre=Bibliothèque\n');
});

test('T11 D2.INV-4 : une ré-ingestion sans changement ne réécrit rien, une date seule ne réindexe pas', () => {
  const repo = projet();
  reussir(['ingest'], { repo });
  const deuxieme = reussir(['ingest'], { repo });
  assert.deepEqual([deuxieme.ajoutes, deuxieme.modifies, deuxieme.supprimes], [0, 0, 0]);
  const futur = new Date(Date.now() + 60000);
  utimesSync(join(repo, 'src/server.js'), futur, futur);
  const troisieme = reussir(['ingest'], { repo });
  assert.deepEqual([troisieme.modifies, troisieme.inchanges], [0, troisieme.fichiers]);
  ecrire(repo, 'src/server.js', 'export const autre = 2;\n');
  assert.equal(reussir(['ingest'], { repo }).modifies, 1);
});

// ------------------------------------------------------------------ D3 : branches

test('T12 D3.INV-1 : branches locales, distantes, worktree, amont, en un seul passage', () => {
  const repo = projet();
  const distant = join(dossierTemporaire(), 'distant.git');
  execFileSync('git', ['init', '-q', '--bare', distant], { env: ENV });
  g(repo, 'remote', 'add', 'origin', distant);
  g(repo, 'push', '-q', '-u', 'origin', 'main');
  g(repo, 'remote', 'set-head', 'origin', 'main');
  ecrire(repo, 'src/local.js', 'export const local = 1;\n');
  commit(repo, 'commit local');
  const autre = join(dirname(repo), 'wt-feature');
  g(repo, 'worktree', 'add', '-q', autre, '-b', 'feature/wt');
  reussir(['git-scan'], { repo });
  const branches = Object.fromEntries(lignesSql(repo, 'SELECT * FROM git_branches').map((l) => [l.branch_name, l]));
  assert.equal(branches.main.is_current, 1);
  assert.equal(branches.main.ahead, 1);
  assert.equal(branches.main.behind, 0);
  assert.equal(branches.main.upstream, 'origin/main');
  assert.match(branches.main.last_commit, /^[0-9a-f]{7,} - commit local$/);
  assert.equal(branches['feature/wt'].worktree_path, autre);
  assert.equal(branches['feature/wt'].is_current, 0);
  assert.equal(branches['origin/main'].is_remote, 1);
  assert.equal(branches['origin/HEAD'], undefined);
  assert.equal(Object.keys(branches).some((nom) => nom.startsWith('+') || nom.startsWith('*')), false);
});

test('T13 D3.INV-2 : fichiers modifiés par branche depuis l’ancêtre commun', () => {
  const repo = projet();
  g(repo, 'switch', '-q', '-c', 'feature/export');
  ecrire(repo, 'src/export.js', 'export const csv = 1;\nexport const bom = 2;\n');
  ecrire(repo, 'src/server.js', "import Fastify from 'fastify';\nexport const app = Fastify({ logger: true });\n");
  rmSync(join(repo, 'src/old.js'));
  commit(repo, 'export');
  g(repo, 'switch', '-q', 'main');
  ecrire(repo, 'src/main-seulement.js', 'x\n');
  commit(repo, 'main avance');
  const bilan = reussir(['git-scan'], { repo });
  assert.equal(bilan.base, 'main');
  const fichiers = Object.fromEntries(
    lignesSql(repo, 'SELECT path, status, added, deleted FROM branch_files WHERE branch_name = ?', 'feature/export').map((l) => [l.path, l]),
  );
  assert.deepEqual(Object.keys(fichiers).sort(), ['src/export.js', 'src/old.js', 'src/server.js']);
  assert.deepEqual([fichiers['src/export.js'].status, fichiers['src/export.js'].added, fichiers['src/export.js'].deleted], ['A', 2, 0]);
  assert.deepEqual([fichiers['src/server.js'].status, fichiers['src/server.js'].added, fichiers['src/server.js'].deleted], ['M', 1, 1]);
  assert.equal(fichiers['src/old.js'].status, 'D');
});

// ------------------------------------------------------------------ D4 : interrogation

test('T14 D4.INV-1 : query, search, schema et status n’écrivent jamais la base', () => {
  const repo = projet();
  const db = reussir(['ingest'], { repo }).db;
  const avant = statSync(db).mtimeMs;
  const r = lancer(['query', 'DELETE FROM app_structure'], { repo });
  assert.equal(r.code, 2);
  assert.match(r.erreur.erreur, /readonly|read-only|lecture/i);
  const r2 = lancer(['query', '-'], { repo, entree: "UPDATE app_metadata SET value = 'x'" });
  assert.equal(r2.code, 2);
  reussir(['search', 'fastify'], { repo });
  reussir(['schema'], { repo });
  lancer(['status'], { repo });
  assert.ok(lignesSql(repo, 'SELECT count(*) AS n FROM app_structure')[0].n > 0);
  assert.equal(statSync(db).mtimeMs, avant);
});

test('T15 D4.INV-2 et D4.INV-3 : réponse bornée, troncature signalée, instantané joint', () => {
  const repo = projet();
  const ingestion = reussir(['ingest'], { repo });
  const limite = reussir(['query', 'SELECT path FROM app_structure', '--limit', '2'], { repo });
  assert.equal(limite.rows.length, 2);
  assert.equal(limite.truncated, true);
  const long = reussir(['query', 'SELECT content FROM app_structure WHERE path = ?', '--param', 'src/server.js', '--max-chars', '20'], { repo });
  assert.match(long.rows[0].content, /^import Fastify from …\[tronqué : \d+ caractères\]$/);
  assert.equal(long.values_truncated, 1);
  assert.deepEqual(long.snapshot, ingestion.snapshot);
  assert.equal(long.snapshot.mode, 'travail');
  assert.equal(long.snapshot.commit, g(repo, 'rev-parse', 'HEAD').trim());
  const recherche = reussir(['search', 'export', '--limit', '1'], { repo });
  assert.equal(recherche.files, 1);
  assert.equal(recherche.truncated, true);
  assert.deepEqual(recherche.snapshot, ingestion.snapshot);
});

test('T16 D4.INV-4 : search rend chemin:ligne, sans casse ni accent discriminants', () => {
  const repo = projet();
  reussir(['ingest'], { repo });
  const fastify = reussir(['search', 'FASTIFY'], { repo });
  assert.deepEqual(fastify.results[0].lines.map((l) => l.line), [1, 2]);
  assert.equal(fastify.results[0].path, 'src/server.js');
  const accent = reussir(['search', 'bibliotheque'], { repo });
  assert.equal(accent.results[0].path, 'config/messages.properties');
  assert.equal(accent.results[0].lines[0].text, 'titre=Bibliothèque');
  const filtre = reussir(['search', 'export', '--path', 'src/', '--lang', 'javascript'], { repo });
  assert.ok(filtre.results.every((r) => r.path.startsWith('src/') && r.path.endsWith('.js')));
  const texte = lancer(['search', 'RestController', '--format', 'text'], { repo });
  assert.equal(texte.stdout, 'src/Commande.java:3: @RestController\n');
  ecrire(repo, 'docs/rare.md', `${'contexte sans rapport. '.repeat(40)}une seule mention de pertinence ici.\n`);
  ecrire(repo, 'docs/dense.md', 'pertinence, pertinence, pertinence.\n');
  reussir(['ingest'], { repo });
  const classement = reussir(['search', 'pertinence'], { repo }).results.map((r) => r.path);
  assert.deepEqual(classement, ['docs/dense.md', 'docs/rare.md']);
});

// ------------------------------------------------------------------ D5 : fraîcheur

test('T17 D5.INV-1 et D5.INV-2 : status nomme l’écart et ne rend 0 que pour une base à jour', () => {
  const repo = projet();
  const ingestion = reussir(['ingest'], { repo });
  const avant = statSync(ingestion.db).mtimeMs;
  const ajour = lancer(['status'], { repo });
  assert.equal(ajour.code, 0);
  assert.equal(ajour.json.verdict, 'a_jour');
  assert.deepEqual(ajour.json.snapshot, ingestion.snapshot);
  assert.ok(ajour.json.snapshot.indexed_at);
  ecrire(repo, 'src/server.js', 'export const change = 1;\n');
  ecrire(repo, 'src/neuf.js', 'export const neuf = 1;\n');
  rmSync(join(repo, 'src/old.js'));
  const retard = lancer(['status'], { repo });
  assert.equal(retard.code, 6);
  assert.equal(retard.json.verdict, 'en_retard');
  assert.deepEqual(retard.json.fichiers_modifies.premiers, ['src/server.js']);
  assert.deepEqual(retard.json.fichiers_nouveaux.premiers, ['src/neuf.js']);
  assert.deepEqual(retard.json.fichiers_disparus.premiers, ['src/old.js']);
  assert.equal(statSync(ingestion.db).mtimeMs, avant);
  reussir(['ingest'], { repo });
  assert.equal(lancer(['status'], { repo }).code, 0);
});

// ------------------------------------------------------------------ D6 : watcher et miroir

const refsDe = (repo) => g(repo, 'for-each-ref', '--format=%(objectname) %(refname)');

test('T18 D6.INV-1 : le miroir est un worktree dédié, détaché et verrouillé ; la source est intacte', () => {
  const repo = projet();
  ecrire(repo, 'src/en-cours.js', 'non commité\n');
  const refs = refsDe(repo);
  const statut = g(repo, 'status', '--porcelain');
  const index = statSync(join(repo, '.git', 'index')).mtimeMs;
  const r = reussir(['watch', '--once'], { repo });
  assert.equal(r.evenement, 'indexation_complete');
  const liste = g(repo, 'worktree', 'list', '--porcelain');
  const bloc = liste.split('\n\n').find((b) => b.includes('/.git/skill4appli/'));
  assert.ok(bloc, 'miroir enregistré');
  assert.match(bloc, /\ndetached\n/);
  assert.match(bloc, /\nlocked/);
  assert.equal(refsDe(repo), refs);
  assert.equal(statSync(join(repo, '.git', 'index')).mtimeMs, index);
  assert.equal(g(repo, 'status', '--porcelain'), statut);
  const meta = Object.fromEntries(lignesSql(repo, 'SELECT key, value FROM app_metadata').map((l) => [l.key, l.value]));
  assert.equal(meta.mode, 'miroir');
  assert.equal(meta.indexed_commit, g(repo, 'rev-parse', 'HEAD').trim());
  assert.equal(lignesSql(repo, 'SELECT count(*) AS n FROM app_structure WHERE path = ?', 'src/en-cours.js')[0].n, 0);
  const etat = lancer(['status'], { repo });
  assert.equal(etat.json.verdict, 'modifs_locales');
  assert.equal(etat.code, 6);
});

test('T19 D6.INV-2 : un commit ne réindexe que les fichiers changés ; un changement de branche est suivi', () => {
  const repo = projet();
  reussir(['watch', '--once'], { repo });
  const ancien = g(repo, 'rev-parse', 'HEAD').trim();
  ecrire(repo, 'src/server.js', 'export const v2 = 1;\n');
  ecrire(repo, 'src/ajout.js', 'export const ajout = 1;\n');
  rmSync(join(repo, 'src/old.js'));
  const nouveau = commit(repo, 'v2');
  const synchro = reussir(['watch', '--once'], { repo });
  assert.equal(synchro.evenement, 'synchro');
  assert.deepEqual([synchro.de, synchro.a], [ancien, nouveau]);
  assert.deepEqual([synchro.ajoutes, synchro.modifies, synchro.supprimes], [1, 1, 1]);
  assert.equal(reussir(['search', 'v2'], { repo }).results[0].path, 'src/server.js');
  assert.equal(lancer(['status'], { repo }).json.verdict, 'a_jour');
  g(repo, 'switch', '-q', '-c', 'feature/suivie');
  const branche = reussir(['watch', '--once'], { repo });
  assert.deepEqual([branche.evenement, branche.a], ['branche', 'feature/suivie']);
  ecrire(repo, 'src/suivie.js', 'export const suivie = 1;\n');
  commit(repo, 'sur la branche suivie');
  const suite = reussir(['watch', '--once'], { repo });
  assert.deepEqual([suite.evenement, suite.branche, suite.ajoutes], ['synchro', 'feature/suivie', 1]);
  assert.equal(reussir(['watch', '--once'], { repo }).evenement, 'a_jour');
});

test('T20 D6.INV-2 : en continu, le watcher suit les commits et s’arrête proprement sur SIGTERM',
  { skip: WINDOWS && 'Windows ne transmet aucun signal à un processus qu’on termine : arrêt commun par watch-stop, T30' }, async () => {
    const repo = projet();
    const w = watcherEnFond(repo);
    try {
      await attendre(() => w.a('indexation_complete'));
      ecrire(repo, 'src/continu.js', 'export const continu = 1;\n');
      commit(repo, 'continu');
      await attendre(() => w.a('synchro'));
      w.enfant.kill('SIGTERM');
      const fin = await w.finAvant();
      assert.equal(fin.code, 0);
      assert.ok(w.a('arret'));
    } finally {
      w.arreter();
    }
    const db = cheminBase(repo);
    assert.equal(existsSync(`${db}.watch.lock`), false);
    assert.equal(reussir(['search', 'continu'], { repo }).files, 1);
  });

test('T21 D6.INV-3 : un seul écrivain ; un verrou orphelin est repris', async () => {
  const repo = projet();
  const w = watcherEnFond(repo);
  try {
    await attendre(() => w.a('indexation_complete'));
    assert.equal(lancer(['ingest'], { repo }).code, 4);
    assert.equal(lancer(['git-scan'], { repo }).code, 4);
    assert.equal(lancer(['watch', '--once'], { repo }).code, 4);
    assert.equal(lancer(['mirror-remove'], { repo }).code, 4);
    assert.equal(lancer(['status'], { repo }).json.watcher.actif, true);
  } finally {
    w.arreter();
  }
  await w.finAvant();
  const db = cheminBase(repo);
  assert.equal(existsSync(`${db}.watch.lock`), true, 'verrou laissé par un arrêt brutal');
  assert.equal(lancer(['watch', '--once'], { repo }).code, 0);
  assert.equal(existsSync(`${db}.watch.lock`), false);
});

test('T22 D6.INV-4 : un miroir modifié à la main n’est jamais écrasé', () => {
  const repo = projet();
  reussir(['watch', '--once'], { repo });
  const miroir = miroirDe(repo);
  writeFileSync(join(miroir, 'src/server.js'), 'modifié à la main\n');
  ecrire(repo, 'src/autre.js', 'x\n');
  commit(repo, 'nouveau commit');
  const r = lancer(['watch', '--once'], { repo });
  assert.equal(r.code, 7);
  assert.deepEqual(r.erreur.details.fichiers, ['src/server.js']);
  assert.equal(readFileSync(join(miroir, 'src/server.js'), 'utf8'), 'modifié à la main\n');
  assert.equal(lancer(['mirror-remove'], { repo }).code, 7);
  assert.equal(existsSync(miroir), true);
  assert.equal(reussir(['mirror-remove', '--force'], { repo }).retire, true);
  assert.equal(existsSync(miroir), false);
});

test('T22b D6.INV-4 : en continu aussi, le watcher s’arrête sur un miroir modifié sans l’écraser', async () => {
  const repo = projet();
  const w = watcherEnFond(repo);
  let miroir;
  try {
    await attendre(() => w.a('indexation_complete'));
    miroir = miroirDe(repo);
    writeFileSync(join(miroir, 'src/server.js'), 'modifié pendant la surveillance\n');
    ecrire(repo, 'src/autre.js', 'x\n');
    commit(repo, 'commit pendant la surveillance');
    const fin = await w.finAvant();
    assert.equal(fin.code, 7);
  } finally {
    w.arreter();
  }
  assert.equal(readFileSync(join(miroir, 'src/server.js'), 'utf8'), 'modifié pendant la surveillance\n');
  assert.equal(existsSync(`${cheminBase(repo)}.watch.lock`), false);
});

test('T23 D6.INV-5 : seul le miroir du skill est retiré, et seulement sur commande', () => {
  const repo = projet();
  const autre = join(dirname(repo), 'wt-autre');
  g(repo, 'worktree', 'add', '-q', autre, '-b', 'feature/autre');
  reussir(['watch', '--once'], { repo });
  const miroir = miroirDe(repo);
  assert.ok(worktrees(repo).some((p) => memeChemin(p, miroir)));
  const retrait = reussir(['mirror-remove'], { repo });
  assert.equal(retrait.retire, true);
  const restants = worktrees(repo);
  assert.ok(!restants.some((p) => memeChemin(p, miroir)));
  assert.ok(restants.some((p) => memeChemin(p, autre)));
  assert.ok(existsSync(join(autre, 'src/server.js')));
  assert.equal(reussir(['mirror-remove'], { repo }).retire, false);
  assert.equal(reussir(['watch', '--once'], { repo }).evenement, 'indexation_complete');
});

// ------------------------------------------------------------------ inertie des dimensions réservées

test('T24 inertie de D8 et D9 : aucune couche locale, aucune table de symboles', () => {
  const repo = projet();
  reussir(['ingest'], { repo });
  const tables = reussir(['schema'], { repo }).tables.map((t) => t.name);
  assert.deepEqual(tables, ['app_fts', 'app_metadata', 'app_structure', 'branch_files', 'git_branches']);
  assert.equal(lancer(['symbols'], { repo }).code, 1);
});

// ------------------------------------------------------------------ D10 : configuration par l'environnement

test('T25 D10.INV-1 : l’option l’emporte sur la variable, la variable sur le défaut', () => {
  const repo = projet();
  const ailleurs = dossierTemporaire();
  // la variable désigne le worktree source : aucune option, lancé d'ailleurs
  const parVariable = lancer(['ingest'], { cwd: ailleurs, env: { SKILL4APPLI_REPO: repo } });
  assert.equal(parVariable.code, 0, parVariable.stderr);
  assert.ok(memeChemin(parVariable.json.racine, repo));
  // la variable de taille s'applique, l'option l'emporte sur elle
  ecrire(repo, 'docs/moyen.txt', 'b'.repeat(3000));
  reussir(['ingest'], { repo, env: { SKILL4APPLI_MAX_SIZE: '2048' } });
  assert.equal(lignesSql(repo, 'SELECT type FROM app_structure WHERE path = ?', 'docs/moyen.txt')[0].type, 'large');
  ecrire(repo, 'docs/moyen.txt', 'c'.repeat(3000));
  reussir(['ingest', '--max-size', '4096'], { repo, env: { SKILL4APPLI_MAX_SIZE: '2048' } });
  assert.equal(lignesSql(repo, 'SELECT type FROM app_structure WHERE path = ?', 'docs/moyen.txt')[0].type, 'file');
  // le format par la variable ; l'option l'emporte
  const pretty = lancer(['schema'], { repo, env: { SKILL4APPLI_FORMAT: 'pretty' } });
  assert.ok(pretty.stdout.split('\n').length > 3, 'sortie indentée');
  const compacte = lancer(['schema', '--format', 'json'], { repo, env: { SKILL4APPLI_FORMAT: 'pretty' } });
  assert.equal(compacte.stdout.trim().split('\n').length, 1);
  // la base désignée par la variable
  const base = join(dossierTemporaire(), 'ailleurs.db');
  assert.ok(memeChemin(reussir(['ingest'], { repo, env: { SKILL4APPLI_DB: base } }).db, base));
  assert.ok(existsSync(base));
});

test('T26 D10.INV-2 : une variable invalide est nommée, une variable vide vaut absente', () => {
  const repo = projet();
  for (const [variable, valeur] of [['SKILL4APPLI_INTERVAL', 'vite'], ['SKILL4APPLI_MAX_SIZE', '0'], ['SKILL4APPLI_FORMAT', 'xml']]) {
    const r = lancer(['config'], { repo, env: { [variable]: valeur } });
    assert.equal(r.code, 1, `${variable}=${valeur}`);
    assert.ok(r.erreur.erreur.startsWith(`${variable} :`), r.erreur.erreur);
  }
  const vide = reussir(['config'], { repo, env: { SKILL4APPLI_INTERVAL: '', SKILL4APPLI_FORMAT: '' } });
  assert.deepEqual([vide.reglages.interval.valeur, vide.reglages.interval.source], [2000, 'defaut']);
  assert.deepEqual([vide.reglages.format.valeur, vide.reglages.format.source], ['json', 'defaut']);
  const introuvable = lancer(['status'], { repo, env: { SKILL4APPLI_GIT: 'git-introuvable-s4a' } });
  assert.equal(introuvable.code, 3);
  assert.match(introuvable.erreur.erreur, /git introuvable/);
});

test('T27 D10.INV-3 : config rend chaque réglage effectif et sa source, sans rien écrire', () => {
  const repo = projet();
  const r = reussir(['config', '--interval', '900'], { repo, env: { SKILL4APPLI_MAX_SIZE: '4096' } });
  assert.deepEqual([r.reglages.interval.valeur, r.reglages.interval.source], [900, 'option']);
  assert.deepEqual([r.reglages.max_size.valeur, r.reglages.max_size.source, r.reglages.max_size.variable], [4096, 'environnement', 'SKILL4APPLI_MAX_SIZE']);
  assert.deepEqual([r.reglages.git.valeur, r.reglages.git.source], ['git', 'defaut']);
  assert.ok(memeChemin(r.emplacements.source, repo));
  assert.ok(r.emplacements.db.startsWith(join(repo, '.git', 'skill4appli') + sep));
  assert.equal(r.plateforme.os, process.platform);
  assert.match(r.plateforme.sqlite, /^3\.\d+\.\d+$/);
  assert.match(r.plateforme.git, /^\d+\.\d+\.\d+/);
  assert.ok(Array.isArray(r.avertissements));
  assert.equal(existsSync(join(repo, '.git', 'skill4appli')), false, 'config ne crée rien');
});

// ------------------------------------------------------------------ D12 : parité des plateformes

test('T28 D12.INV-1 : un worktree a une seule base, quel que soit le chemin qui y mène', () => {
  const repo = projet();
  const db = reussir(['ingest'], { repo }).db;
  let variante;
  if (WINDOWS) {
    variante = repo.toUpperCase(); // NTFS ne distingue pas la casse
  } else {
    variante = join(dossierTemporaire(), 'lien');
    symlinkSync(repo, variante);
  }
  const parVariante = reussir(['status'], { repo: variante });
  assert.equal(parVariante.db, db);
  assert.equal(parVariante.verdict, 'a_jour');
  assert.ok(memeChemin(parVariante.source, repo));
});

test('T29 D12.INV-2 : chemins absolus au format de la plateforme, chemins du dépôt en /', () => {
  const repo = projet();
  const autre = join(dirname(repo), 'wt-natif');
  g(repo, 'worktree', 'add', '-q', autre, '-b', 'feature/natif');
  reussir(['watch', '--once'], { repo });
  const meta = Object.fromEntries(lignesSql(repo, 'SELECT key, value FROM app_metadata').map((l) => [l.key, l.value]));
  const absolus = [meta.source, meta.root, meta.mirror_path, ...lignesSql(repo, 'SELECT worktree_path FROM git_branches WHERE worktree_path IS NOT NULL').map((l) => l.worktree_path)];
  assert.ok(absolus.length >= 4);
  for (const chemin of absolus) {
    assert.ok(isAbsolute(chemin), chemin);
    assert.equal(resolve(chemin), chemin, `format natif : ${chemin}`);
    assert.ok(existsSync(chemin), chemin);
  }
  assert.ok(absolus.some((p) => memeChemin(p, autre)));
  assert.equal(lignesSql(repo, 'SELECT count(*) AS n FROM app_structure WHERE instr(path, char(92)) > 0')[0].n, 0);
});

test('T30 D12.INV-3 : watch-stop arrête proprement le watcher, sur toutes les plateformes', async () => {
  const repo = projet();
  const w = watcherEnFond(repo);
  try {
    await attendre(() => w.a('indexation_complete'));
    const arret = reussir(['watch-stop'], { repo });
    assert.equal(arret.arrete, true);
    assert.equal(arret.pid, w.enfant.pid);
    assert.equal((await w.finAvant()).code, 0);
    const dernier = w.evenements.at(-1);
    assert.deepEqual([dernier.evenement, dernier.raison], ['arret', 'watch-stop']);
  } finally {
    w.arreter();
  }
  const db = cheminBase(repo);
  assert.equal(existsSync(`${db}.watch.lock`), false);
  assert.equal(existsSync(`${db}.watch.stop`), false);
  assert.equal(reussir(['watch-stop'], { repo }).arrete, false);
  // une demande antérieure au watcher, puis une demande qui vise un autre processus, ne l'arrêtent pas
  writeFileSync(`${db}.watch.stop`, JSON.stringify({ demande: 'antérieure' }));
  const w2 = watcherEnFond(repo);
  try {
    await attendre(() => w2.a('demarrage'));
    await pause(800);
    assert.equal(w2.enfant.exitCode, null, 'demande antérieure ignorée');
    writeFileSync(`${db}.watch.stop`, JSON.stringify({ pid: w2.enfant.pid + 100000 }));
    await pause(1200);
    assert.equal(w2.enfant.exitCode, null, 'demande visant un autre processus ignorée');
    assert.equal(reussir(['watch-stop'], { repo }).arrete, true);
    assert.equal((await w2.finAvant()).code, 0);
  } finally {
    w2.arreter();
  }
});

test('T31 D12.INV-4 : les fins de ligne CRLF ne faussent ni les lignes, ni les extraits, ni la fraîcheur', () => {
  const repo = depot();
  g(repo, 'config', 'core.autocrlf', 'true');
  ecrire(repo, 'src/a.js', 'const un = 1;\nexport const deux = 2;\nconst trois = 3;\n');
  commit(repo, 'fins de ligne');
  reussir(['watch', '--once'], { repo });
  assert.ok(readFileSync(join(miroirDe(repo), 'src/a.js'), 'utf8').includes('\r\n'), 'miroir extrait en CRLF');
  const r = reussir(['search', 'deux'], { repo });
  assert.deepEqual(r.results[0].lines, [{ line: 2, text: 'export const deux = 2;' }]);
  assert.equal(lignesSql(repo, 'SELECT lines FROM app_structure WHERE path = ?', 'src/a.js')[0].lines, 3);
  const etat = lancer(['status'], { repo });
  assert.equal(etat.json.verdict, 'a_jour', JSON.stringify(etat.json.modifications_locales));
  assert.equal(etat.code, 0);
});

test('T32 D12.INV-5 : lancé dans WSL sur un worktree du système de fichiers Windows, le skill le signale', async () => {
  const { analyserMontages, diagnosticPlateforme } = await import(pathToFileURL(SCRIPT).href);
  const montages = analyserMontages('/dev/sdc / ext4 rw,relatime 0 0\nC:\\134 /mnt/c 9p rw,noatime,dirsync,aname=drvfs;path=C:\\;uid=1000 0 0\n');
  assert.equal(montages[1].peripherique, 'C:\\');
  const wsl = { plateforme: 'linux', noyau: '5.15.167.4-microsoft-standard-WSL2', env: { WSL_DISTRO_NAME: 'Ubuntu' } };
  const surWindows = diagnosticPlateforme({ ...wsl, source: '/mnt/c/dev/acme', montages });
  assert.equal(surWindows.plateforme.wsl, true);
  assert.equal(surWindows.plateforme.depot_windows_depuis_wsl, true);
  assert.deepEqual(surWindows.avertissements.map((a) => a.code), ['depot_windows_depuis_wsl']);
  const surLinux = diagnosticPlateforme({ ...wsl, source: '/home/dev/acme', montages });
  assert.deepEqual([surLinux.plateforme.depot_windows_depuis_wsl, surLinux.avertissements.length], [false, 0]);
  const sansTable = diagnosticPlateforme({ ...wsl, source: '/mnt/d/projet', montages: [] });
  assert.equal(sansTable.plateforme.depot_windows_depuis_wsl, true);
  const linuxNatif = diagnosticPlateforme({ plateforme: 'linux', noyau: '6.8.0-45-generic', env: {}, source: '/mnt/c/dev', montages });
  assert.deepEqual([linuxNatif.plateforme.wsl, linuxNatif.avertissements.length], [false, 0]);
  const windows = diagnosticPlateforme({ plateforme: 'win32', noyau: '10.0.22631', env: {}, source: 'C:\\dev\\acme' });
  assert.deepEqual([windows.plateforme.wsl, windows.avertissements.length], [false, 0]);
  // status et config portent toujours le diagnostic de la plateforme qui exécute
  const repo = projet();
  for (const commande of ['status', 'config']) {
    const r = lancer([commande], { repo }).json;
    assert.equal(r.plateforme.os, process.platform);
    assert.ok(Array.isArray(r.avertissements));
  }
});

// ------------------------------------------------------------------ inertie de D11 et point d'extension E4

test('T33 E4 et inertie de D11 : un objet par commande de lecture, le même par import, aucun service MCP', async () => {
  const repo = projet();
  reussir(['ingest'], { repo });
  for (const commande of [['status'], ['search', 'fastify'], ['query', 'SELECT 1 AS un'], ['schema'], ['config']]) {
    const r = lancer(commande, { repo });
    const lignes = r.stdout.split('\n').filter(Boolean);
    assert.equal(lignes.length, 1, commande.join(' '));
    assert.equal(JSON.parse(lignes[0]).commande, commande[0]);
  }
  const { executer } = await import(pathToFileURL(SCRIPT).href);
  const direct = await executer('search', { repo }, ['fastify']);
  assert.equal(direct.code, 0);
  assert.deepEqual(JSON.parse(JSON.stringify(direct.sortie)), lancer(['search', 'fastify'], { repo }).json);
  const etat = await executer('status', { repo });
  assert.deepEqual([etat.sortie.verdict, etat.code], ['a_jour', 0]);
  assert.equal(lancer(['mcp'], { repo }).code, 1);
});
```
