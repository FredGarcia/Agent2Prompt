---
name: execution
description: Exécution du script instantane-hote.mjs (commandes, options, où le lancer et depuis quel dossier, confirmation par l'hôte, sorties JSON et texte, codes de sortie, bornes et troncatures, lecture seule, Node 20 sans dépendance, pièges connus, commande d'extraction des six fichiers à empreintes, texte complet du script). À lire avant de lancer le script ou d'en lire une sortie.
dimensions: [D1]
status: active
---

# Module `execution` (D1)

Phase 7E couverte : État et Expression.

## 1. Commandes

    node <dossier du skill>/scripts/instantane-hote.mjs <commande> [options]

| Commande | Rend | Module |
|---|---|---|
| `hote` | famille de l'hôte, certitude et indices, paquet (version, documentation, skills intégrés), options de lancement, bac à sable, plateforme, accueil, racine, avertissements ; pour un hôte non reconnu, les candidats déduits | `hote` |
| `config` | couches de réglages, valeurs effectives et leur couche, règle de fusion, surcharges par l'environnement, confiance, fichier `.env`, variables | `configuration` |
| `contexte` | noms des fichiers de contexte, paliers global, projet, mémoire privée, extensions, à la demande ; trace de la dernière session ; prompt système exporté, avec `--prompt-systeme` | `contexte` |
| `composants` | skills, sous-agents, commandes, extensions, serveurs MCP, hooks, politiques, fichiers d'exclusion | `composants` |
| `doc [chemin]` | sans chemin, la liste des documents embarqués dans le paquet ; avec un chemin relatif au dossier de documentation, ce document | `hote` |
| `tout` | `hote`, `config`, `contexte` et `composants` dans un même objet | ce module |
| `comparer` | réservée (D11, point d'extension E2) : code 1 | `comparaison` |

## 2. Options

| Option | Effet | Défaut |
|---|---|---|
| `--racine <dossier>` | racine du workspace observé | le dossier courant |
| `--paquet <dossier>` | dossier du paquet `@google/gemini-cli`, quand il n'est trouvé ni par les processus parents ni par le PATH | recherche automatique (module `hote`, § 2) |
| `--dossier-systeme <dossier>` | dossier système de l'hôte | `/etc/gemini-cli`, `C:\ProgramData\gemini-cli` ou `/Library/Application Support/GeminiCli` |
| `--prompt-systeme <fichier>` | prompt système exporté par le développeur, à analyser avec `contexte` | aucun |
| `--format json\|texte` | une ligne JSON pour un agent, ou un texte lisible | `json` |
| `--max <n>` | éléments rendus par liste | 50 |
| `--max-caracteres <n>` | caractères rendus d'un document | 40000 |
| `--version`, `--help` | version et schéma ; aide | |

Les variables que l'hôte lit pour ses propres emplacements valent aussi pour le script : `GEMINI_CLI_HOME`, `GEMINI_CLI_SYSTEM_SETTINGS_PATH`, `GEMINI_CLI_SYSTEM_DEFAULTS_PATH`, `GEMINI_CLI_TRUSTED_FOLDERS_PATH`. Le script n'a pas de variable propre.

## 3. Où le lancer

- **Depuis la racine du workspace**, celle où l'hôte a été lancé ; sinon `--racine`. Les commandes de l'hôte s'exécutent par défaut dans cette racine.
- **Le dossier du skill** : dans la session principale, celui du `SKILL.md` que donne `<available_skills>` dans le prompt système [déclaré] ; installé au niveau utilisateur, `~/.gemini/skills/explication-hote-ia/` ; dans le workspace, `.gemini/skills/explication-hote-ia/` ; collé dans une autre IA, `.skills/explication-hote-ia/`. Le sous-agent lit ce chemin dans sa définition (module `agent`, § 2).
- **Confirmation** : Gemini CLI soumet chaque commande de son outil shell à sa politique ; le développeur accepte le lancement, une fois ou pour la session. Le skill ne propose aucune règle de politique pour s'en dispenser.
- **Windows** : `node "C:\Users\<nom>\.gemini\skills\explication-hote-ia\scripts\instantane-hote.mjs" hote`, guillemets doubles autour d'un chemin qui contient des espaces.
- **Bac à sable de l'hôte** : dans un conteneur, le script voit le système de fichiers du conteneur ; `hote.bac_a_sable` le signale et les chemins rendus sont ceux du conteneur.

## 4. Sorties et codes (D1.INV-2)

Chaque réussite rend un objet sur une ligne, avec des champs communs : `ok` (`true`), `commande`, `skill` (`explication-hote-ia`), `version` (celle du script), `schema` (1) et `date` (ISO 8601). Viennent ensuite les sections de la commande ; `config`, `contexte` et `composants` portent `hote_confirme`, vrai seulement si l'hôte est observé. `troncatures` s'ajoute quand une liste a été bornée.

`--format texte` rend le même objet, indenté, pour le développeur ; `doc <chemin>` y rend le document tel quel. Le masquage des secrets s'applique avant le choix du format (module `secrets`).

| Code | Sens | Sortie |
|---|---|---|
| 0 | réussite | l'objet, sur la sortie standard |
| 1 | usage : commande inconnue ou réservée, option inconnue, valeur invalide | `{"ok": false, "code": 1, "erreur": "…"}` sur la sortie d'erreur |
| 2 | introuvable : paquet ou document absent, prompt exporté absent | idem, code 2 |
| 3 | chemin refusé : document hors du dossier de documentation, absolu ou non Markdown | idem, code 3 |
| 4 | erreur interne : un défaut du script, à rapporter | idem, code 4 |

## 5. Bornes (D1.INV-3)

- Chaque liste rendue s'arrête à `--max` éléments ; la liste `troncatures` nomme chaque liste bornée, avec son nombre d'éléments.
- Un document de `doc` s'arrête à `--max-caracteres` ; `tronque` et `caracteres` le disent.
- Lectures bornées par le script lui-même : 512 Ko au début d'un fichier de session, 2 000 dossiers pour les fichiers de contexte à la demande (`a_la_demande.tronque`), 5 000 fichiers par dossier parcouru, 4 Ko d'une commande trouvée dans le PATH.

## 6. Lecture seule (D1.INV-1)

Le script lit : les fichiers de réglages, les fichiers de contexte (leur taille, leurs lignes et leurs imports, jamais leur texte en sortie), les dossiers de skills, d'agents, de commandes, d'extensions et de politiques, le registre des projets, le début du fichier de la dernière session, la documentation et le `package.json` du paquet, `/proc` sous Linux.

Il ne fait rien d'autre : aucune écriture, aucune création de dossier, aucune suppression, aucun processus lancé, pas même `gemini --version` (la version se lit dans `package.json`), aucune connexion. Il n'importe que `node:fs`, `node:os`, `node:path`, `node:url` et `node:util`, et n'ouvre de fichier qu'en lecture (`'r'`). La recette le vérifie sur le texte du script et sur le disque (T3, T4).

## 7. Environnement (D1.INV-4)

Node 20 ou plus récent, modules natifs seulement, aucune installation. La recette tourne avec Node 20, 24 et 26.13.0, celle du poste de la mission, sous Linux et sous Windows.

## 8. Matérialiser les fichiers exécutables

Six fichiers sont tirés des blocs annotés `<!-- fichier : chemin -->` des modules, à l'identique, par programme plutôt qu'à la main :

| Fichier | Module, section | Empreinte sha256 |
|---|---|---|
| `scripts/instantane-hote.mjs` | `execution`, § 11 | `ae296517f6670e0d0499db9c6d03d8550596b6eee4e7be69335c72e359fdd34d` |
| `tests/instantane-hote.test.mjs` | `recette`, § 6 | `c66a1ff94ebe065d9fe0197ccc6af8f9d1d48798c89b53fb903b7de6625e0b17` |
| `agent/explicateur-hote.md` | `agent`, § 8 | `e38d01c3ea9dbb77c414f7c0209974d99183e4c7910c8c8fc821c26af091475e` |
| `commandes/hote/explique.toml` | `agent`, § 9 | `cfd784a3449c1ac6f5914da112b9e0daa79bc1e52cdbc0721a4d94d894dbce6a` |
| `commandes/hote/carte.toml` | `agent`, § 9 | `e2d9ab278eca3c9e22a97b4f10f09bda0455abe021aa9931b8f96cecd8ce042b` |
| `commandes/hote/pourquoi.toml` | `agent`, § 9 | `09a0ae500aa33c2587925b379801b84c3886e06a0fa7c7fd5c9dd4fdd8095720` |

Depuis le dossier du skill, cette commande d'une ligne écrit les six fichiers, compare leurs empreintes à celles du tableau et sort avec le code 1 au moindre écart. Elle ne contient ni `$`, ni accent grave, ni `!`, ni `%`, ni guillemet intérieur : elle se colle telle quelle dans bash, zsh, CMD ou PowerShell, et dans un fichier `.cmd`. Elle lit aussi des modules aux fins de ligne CRLF.

```text
node -e "const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'); const attendu = { 'scripts/instantane-hote.mjs': 'ae296517f6670e0d0499db9c6d03d8550596b6eee4e7be69335c72e359fdd34d', 'tests/instantane-hote.test.mjs': 'c66a1ff94ebe065d9fe0197ccc6af8f9d1d48798c89b53fb903b7de6625e0b17', 'agent/explicateur-hote.md': 'e38d01c3ea9dbb77c414f7c0209974d99183e4c7910c8c8fc821c26af091475e', 'commandes/hote/explique.toml': 'cfd784a3449c1ac6f5914da112b9e0daa79bc1e52cdbc0721a4d94d894dbce6a', 'commandes/hote/carte.toml': 'e2d9ab278eca3c9e22a97b4f10f09bda0455abe021aa9931b8f96cecd8ce042b', 'commandes/hote/pourquoi.toml': '09a0ae500aa33c2587925b379801b84c3886e06a0fa7c7fd5c9dd4fdd8095720' }; const vus = new Set(); let ecarts = 0; for (const module of ['modules/execution/SKILL.md', 'modules/recette/SKILL.md', 'modules/agent/SKILL.md']) { const texte = fs.readFileSync(module, 'utf8').replace(/\r\n/g, '\n'); for (const m of texte.matchAll(/^<\x21-- fichier : (\S+) -->\n\x60{3}[a-z]*\n([\s\S]*?)\n\x60{3}\n/gm)) { const contenu = m[2] + '\n'; fs.mkdirSync(path.dirname(m[1]), { recursive: true }); fs.writeFileSync(m[1], contenu); vus.add(m[1]); const conforme = crypto.createHash('sha256').update(contenu).digest('hex') === attendu[m[1]]; if (conforme === false) ecarts++; console.log((conforme ? 'conforme  ' : 'ECART     ') + m[1]); } } for (const f of Object.keys(attendu)) if (vus.has(f) === false) { ecarts++; console.log('ABSENT    ' + f); } if (ecarts > 0) process.exitCode = 1;"
```

Puis la recette, depuis le même dossier :

```bash
node --test tests/instantane-hote.test.mjs
```

## 9. Pièges connus

| Constat | Cause | Conduite |
|---|---|---|
| `contexte` ne trouve ni le `GEMINI.md` du projet ni la mémoire privée | script lancé depuis un autre dossier que la racine | relancer depuis la racine, ou `--racine` |
| la version rendue n'est pas celle qu'affiche `/about` | paquet trouvé par le PATH (`nature : déduit`), alors qu'un autre s'exécute | `--paquet` vers le paquet que l'hôte exécute ; sous Linux, l'observation des processus parents l'évite |
| réglages, commandes et serveurs MCP du workspace marqués ignorés | dossier non fiable pour l'hôte | ce n'est pas une erreur du script : l'hôte les ignore aussi (module `configuration`, § 3) |
| la trace de session décrit une autre conversation | plusieurs sessions sur le même projet ; le script prend la plus récemment modifiée | comparer `debut` à l'heure de la session en cours ; `/memory list` fait foi |
| `arguments_de_lancement` vaut `null` | Windows, macOS, ou hôte non trouvé parmi les processus parents | demander au développeur les options de lancement |

## 10. Contrôle de sortie

- Chaque commande sort avec un code du tableau du § 4, et un objet daté et versionné en cas de réussite (D1.INV-2).
- Toute liste bornée apparaît dans `troncatures` (D1.INV-3).
- Aucun fichier du disque n'a changé après une commande (D1.INV-1).

## 11. Script `scripts/instantane-hote.mjs`

<!-- fichier : scripts/instantane-hote.mjs -->
```js
#!/usr/bin/env node
// explication-hote-ia 1.1.0 : instantané en lecture seule de l'outil d'IA qui exécute l'agent
// (Gemini CLI, ou un hôte non reconnu décrit de façon générique), pour l'agent qui l'explique.
// Usage : node scripts/instantane-hote.mjs <commande> [options]   (aide : --help)
// Commandes : hote, config, contexte, composants, doc [chemin], tout.
// Node 20 ou plus récent, modules natifs. Le script lit seulement : il n'écrit, ne crée ni ne
// supprime aucun fichier, ne lance aucun processus et n'ouvre aucune connexion (D1.INV-1).
// Aucune valeur secrète ne sort : des noms, jamais des valeurs, et un masquage final (D8.INV-1).
// Importé, le module ne lance rien : executer() rend l'objet de la commande sans l'écrire.

import { closeSync, openSync, readFileSync, readSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { arch, homedir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

export const VERSION = '1.1.0';
export const SCHEMA = 1;
export const CODES = { OK: 0, USAGE: 1, INTROUVABLE: 2, REFUS: 3, INTERNE: 4 };
export const COMMANDES = ['hote', 'config', 'contexte', 'composants', 'doc', 'tout'];
const RESERVEES = { comparer: 'D11, point d\'extension E2' };
export const MASQUE = '[masqué]';
const FORMATS = ['json', 'texte'];
const MAX_DEFAUT = 50;
const MAX_DOC = 40000;
const PAQUET = '@google/gemini-cli';
const CLOTURE = String.fromCharCode(96).repeat(3);

export class Echec extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

// ---------------------------------------------------------------------------------------------
// Lecture prudente : aucune de ces fonctions n'écrit ni ne lève.

function lireTexte(chemin) {
  try {
    return readFileSync(chemin, 'utf8');
  } catch {
    return null;
  }
}

function lireDebut(chemin, octets) {
  let fd;
  try {
    fd = openSync(chemin, 'r');
    const tampon = Buffer.alloc(octets);
    const lus = readSync(fd, tampon, 0, octets, 0);
    return tampon.subarray(0, lus).toString('utf8');
  } catch {
    return null;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

function etat(chemin) {
  try {
    return statSync(chemin);
  } catch {
    return null;
  }
}

const estFichier = (chemin) => etat(chemin)?.isFile() === true;
const estDossier = (chemin) => etat(chemin)?.isDirectory() === true;

function entrees(dossier) {
  try {
    return readdirSync(dossier, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

function cheminReel(chemin) {
  try {
    return realpathSync(chemin);
  } catch {
    return resolve(chemin);
  }
}

/** Fichiers d'un dossier, chemins relatifs en `/`, triés ; parcours borné, liens symboliques non suivis. */
function fichiersSous(dossier, garder, limite = 5000) {
  const trouves = [];
  const pile = [''];
  while (pile.length > 0 && trouves.length < limite) {
    const rel = pile.shift();
    for (const e of entrees(join(dossier, rel))) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) pile.push(r);
      else if (e.isFile() && garder(e.name)) trouves.push(r);
    }
  }
  return trouves.sort();
}

/** JSON avec commentaires, lu comme l'hôte le lit (commentaires retirés hors des chaînes). */
export function lireJsonc(texte) {
  let sortie = '';
  let i = 0;
  let chaine = false;
  const t = texte.replace(/^\uFEFF/, '');
  while (i < t.length) {
    const c = t[i];
    const s = t[i + 1];
    if (chaine) {
      sortie += c;
      if (c === '\\') {
        sortie += s ?? '';
        i += 2;
        continue;
      }
      if (c === '"') chaine = false;
      i++;
      continue;
    }
    if (c === '"') {
      chaine = true;
      sortie += c;
      i++;
      continue;
    }
    if (c === '/' && s === '/') {
      while (i < t.length && t[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && s === '*') {
      i += 2;
      while (i < t.length && !(t[i] === '*' && t[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    sortie += c;
    i++;
  }
  return JSON.parse(sortie);
}

/**
 * Fichier JSON : présence, lisibilité, données. Le message d'erreur du moteur JSON n'est jamais
 * repris : il peut citer un extrait du fichier, donc un secret ; seule sa position est rendue.
 */
function lireJson(chemin) {
  const texte = lireTexte(chemin);
  if (texte === null) return { present: estFichier(chemin), lisible: false, donnees: null };
  try {
    return { present: true, lisible: true, donnees: lireJsonc(texte) };
  } catch (e) {
    const position = /position (\d+)/.exec(String(e?.message))?.[1];
    let ou = '';
    if (position !== undefined) {
      const avant = texte.slice(0, Number(position));
      ou = ` (ligne ${avant.split('\n').length})`;
    }
    return { present: true, lisible: false, erreur: `JSON invalide${ou}`, donnees: null };
  }
}

function valeurA(objet, cheminPoints) {
  let courant = objet;
  for (const cle of cheminPoints.split('.')) {
    if (courant === null || typeof courant !== 'object' || !Object.hasOwn(courant, cle)) return undefined;
    courant = courant[cle];
  }
  return courant;
}

function compterLignes(texte) {
  if (!texte) return 0;
  return texte.split('\n').length - (texte.endsWith('\n') ? 1 : 0);
}

// ---------------------------------------------------------------------------------------------
// Secrets (D8) : noms seulement pour tout ce qui peut porter un secret, et un masquage par motifs
// appliqué à chaque chaîne de la sortie, en dernier recours.

const MOTIFS_SECRETS = [
  /AIza[0-9A-Za-z_-]{30,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /eyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}/g,
  /\bgh[pousr]_[A-Za-z0-9]{20,}/g,
  /\bgithub_pat_[A-Za-z0-9_]{20,}/g,
  /\bglpat-[A-Za-z0-9_-]{16,}/g,
  /\bxox[abprs]-[A-Za-z0-9-]{10,}/g,
  /\b[rs]k_(?:live|test)_[0-9A-Za-z]{16,}/g,
  /\bya29\.[0-9A-Za-z_-]{20,}/g,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?(?:-----END [A-Z ]*PRIVATE KEY-----|$)/g,
];
const MOTIF_URL_IDENTIFIANTS = /\b([a-z][a-z0-9+.-]*:\/\/)[^\s/@:'"]+(?::[^\s/@'"]*)?@/gi;
const MOTIF_REQUETE = /([?&](?:access_token|token|key|api_key|apikey|password|secret|sig|signature)=)[^&\s#'"]+/gi;
const MOTIF_PORTEUR = /\b(bearer|basic)\s+[A-Za-z0-9._~+/=-]{6,}/gi;
const MOTIF_OPTION = /(--?[A-Za-z0-9_-]*(?:token|key|secret|passw|pwd|auth)[A-Za-z0-9_-]*[=:])[^\s'"]+/gi;
const MOTIF_AFFECTATION = /\b([A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|PASSWD|API_KEY|APIKEY|ACCESS_KEY|PRIVATE_KEY|CREDENTIAL)[A-Z0-9_]*=)[^\s'"&]+/g;

/** Masque dans une chaîne tout ce qui ressemble à un secret. */
export function masquer(valeur) {
  if (typeof valeur !== 'string') return valeur;
  let v = valeur;
  for (const motif of MOTIFS_SECRETS) v = v.replace(motif, MASQUE);
  return v
    .replace(MOTIF_URL_IDENTIFIANTS, `$1${MASQUE}@`)
    .replace(MOTIF_REQUETE, `$1${MASQUE}`)
    .replace(MOTIF_PORTEUR, `$1 ${MASQUE}`)
    .replace(MOTIF_OPTION, `$1${MASQUE}`)
    .replace(MOTIF_AFFECTATION, `$1${MASQUE}`);
}

/** Nom (variable, clé, en-tête, option) qui annonce un secret. */
export const nomSensible = (nom) => /(key|token|secret|passw|pwd|auth|credential|private|cert|cookie|signature)/i.test(String(nom));

/** Arguments d'une commande : chacun masqué, et la valeur qui suit une option sensible remplacée. */
export function masquerArguments(args) {
  const sortie = [];
  let suivantSecret = false;
  for (const a of args ?? []) {
    const texte = String(a);
    if (suivantSecret) {
      sortie.push(MASQUE);
      suivantSecret = false;
      continue;
    }
    if (/^--?[A-Za-z0-9_-]+$/.test(texte) && nomSensible(texte)) suivantSecret = true;
    sortie.push(masquer(texte));
  }
  return sortie;
}

function masquerProfond(valeur) {
  if (typeof valeur === 'string') return masquer(valeur);
  if (Array.isArray(valeur)) return valeur.map(masquerProfond);
  if (valeur && typeof valeur === 'object') {
    const copie = {};
    for (const [cle, v] of Object.entries(valeur)) copie[cle] = masquerProfond(v);
    return copie;
  }
  return valeur;
}

// Variables d'environnement observées : valeur rendue (masquée) pour celles qui ne portent pas de
// secret ; présence seulement pour les autres. Toute autre variable est ignorée.
const VARIABLES_VALEUR = [
  'GEMINI_CLI', 'GEMINI_MODEL', 'GEMINI_SANDBOX', 'SANDBOX', 'GEMINI_SYSTEM_MD', 'GEMINI_WRITE_SYSTEM_MD',
  'GEMINI_CLI_HOME', 'GEMINI_CLI_TRUST_WORKSPACE', 'GEMINI_RESTRICTED_MODE', 'GEMINI_CLI_TRUSTED_FOLDERS_PATH',
  'GEMINI_CLI_SYSTEM_SETTINGS_PATH', 'GEMINI_CLI_SYSTEM_DEFAULTS_PATH', 'GEMINI_CLI_SURFACE',
  'GOOGLE_CLOUD_LOCATION', 'GOOGLE_GENAI_USE_VERTEXAI', 'GOOGLE_GENAI_USE_GCA',
  'GEMINI_TELEMETRY_ENABLED', 'GEMINI_TELEMETRY_TARGET', 'GEMINI_TELEMETRY_LOG_PROMPTS',
  'CI', 'GITHUB_ACTIONS', 'GEMINI_CLI_INTEGRATION_TEST',
];
const VARIABLES_PRESENCE = [
  'GEMINI_API_KEY', 'GOOGLE_API_KEY', 'GOOGLE_APPLICATION_CREDENTIALS', 'GOOGLE_CLOUD_PROJECT',
  'GOOGLE_GEMINI_BASE_URL', 'GOOGLE_VERTEX_BASE_URL', 'CODE_ASSIST_ENDPOINT',
  'GEMINI_TELEMETRY_OTLP_ENDPOINT', 'GEMINI_TELEMETRY_OTLP_HEADERS',
];

function observerVariables(env) {
  const resultat = {};
  for (const nom of VARIABLES_VALEUR) {
    if (env[nom] !== undefined && env[nom] !== '') resultat[nom] = { presente: true, valeur: masquer(env[nom]) };
  }
  for (const nom of VARIABLES_PRESENCE) {
    if (env[nom] !== undefined && env[nom] !== '') resultat[nom] = { presente: true };
  }
  return resultat;
}

// ---------------------------------------------------------------------------------------------
// Chemins de l'hôte, comme Gemini CLI les calcule.

/** Clé d'un projet dans projects.json : chemin résolu, en minuscules sous Windows. */
export function cleRegistre(chemin, plateforme = process.platform) {
  const absolu = resolve(chemin);
  return plateforme === 'win32' ? absolu.toLowerCase() : absolu;
}

/** Clé de comparaison pour la confiance : en minuscules sous Windows et macOS. */
export function cleConfiance(chemin, plateforme = process.platform) {
  const absolu = resolve(chemin);
  return plateforme === 'win32' || plateforme === 'darwin' ? absolu.toLowerCase() : absolu;
}

function estSousChemin(parent, enfant) {
  const r = relative(parent, enfant);
  return r === '' || (!r.startsWith('..') && !isAbsolute(r));
}

function dossierSystemeParDefaut(plateforme = process.platform) {
  if (plateforme === 'darwin') return '/Library/Application Support/GeminiCli';
  if (plateforme === 'win32') return 'C:\\ProgramData\\gemini-cli';
  return '/etc/gemini-cli';
}

function emplacements(options) {
  const env = options.env;
  const accueilEnv = env.GEMINI_CLI_HOME;
  const accueil = accueilEnv || (process.platform === 'win32' ? env.USERPROFILE : env.HOME) || homedir();
  const gemini = join(accueil, '.gemini');
  const execution = env.SANDBOX === 'sandbox-exec' ? join(accueil, '.cache', '.gemini') : gemini;
  const systeme = options.dossierSysteme ? resolve(options.dossierSysteme) : dossierSystemeParDefaut();
  const racine = resolve(options.racine ?? process.cwd());
  return {
    accueil,
    source_accueil: accueilEnv ? 'GEMINI_CLI_HOME' : 'système',
    gemini,
    execution,
    racine,
    racine_est_accueil: cleConfiance(cheminReel(racine)) === cleConfiance(cheminReel(accueil)),
    systeme,
    reglages_systeme: env.GEMINI_CLI_SYSTEM_SETTINGS_PATH || join(systeme, 'settings.json'),
    defauts_systeme: env.GEMINI_CLI_SYSTEM_DEFAULTS_PATH || join(systeme, 'system-defaults.json'),
    reglages_utilisateur: join(gemini, 'settings.json'),
    reglages_workspace: join(racine, '.gemini', 'settings.json'),
    dossiers_de_confiance: env.GEMINI_CLI_TRUSTED_FOLDERS_PATH || join(execution, 'trustedFolders.json'),
    registre_projets: join(execution, 'projects.json'),
    temporaire: join(execution, 'tmp'),
    agents_accueil: join(accueil, '.agents'),
  };
}

// ---------------------------------------------------------------------------------------------
// D2 : l'hôte. Qui exécute ce script, avec quel paquet, à quelle version.

function racinePaquetDepuis(fichier) {
  let d = dirname(fichier);
  for (let i = 0; i < 5; i++) {
    if (lireJson(join(d, 'package.json')).donnees?.name === PAQUET) return d;
    const parent = dirname(d);
    if (parent === d) break;
    d = parent;
  }
  return null;
}

function lireLigneDeCommande(pid) {
  const t = lireTexte(`/proc/${pid}/cmdline`);
  return t === null ? null : t.split('\0').filter((a) => a !== '');
}

function parentDe(pid) {
  const t = lireTexte(`/proc/${pid}/stat`);
  if (!t) return null;
  const champs = t.slice(t.lastIndexOf(')') + 2).split(' ');
  const ppid = Number(champs[1]);
  return Number.isInteger(ppid) && ppid > 1 ? ppid : null;
}

const OPTIONS_A_VALEUR_VISIBLE = new Set([
  '-m', '--model', '--approval-mode', '--policy', '--admin-policy', '-e', '--extensions',
  '--include-directories', '--output-format', '-o', '-r', '--resume', '--allowed-mcp-server-names', '--allowed-tools',
]);
const OPTIONS_DE_PROMPT = new Set(['-p', '--prompt', '-i', '--prompt-interactive']);

/** Arguments de lancement de l'hôte : options et valeurs utiles, texte des prompts jamais rendu. */
export function decrireArguments(args) {
  const sortie = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const [option, attachee] = a.startsWith('-') && a.includes('=') ? [a.slice(0, a.indexOf('=')), a.slice(a.indexOf('=') + 1)] : [a, undefined];
    if (OPTIONS_DE_PROMPT.has(option)) {
      const texte = attachee ?? (args[i + 1] !== undefined && !args[i + 1].startsWith('-') ? args[++i] : '');
      sortie.push(`${option} [texte masqué, ${texte.length} caractères]`);
    } else if (OPTIONS_A_VALEUR_VISIBLE.has(option)) {
      const valeur = attachee ?? (args[i + 1] !== undefined && !args[i + 1].startsWith('-') ? args[++i] : '');
      sortie.push(`${option} ${masquer(valeur)}`.trim());
    } else if (option.startsWith('-')) {
      sortie.push(attachee === undefined ? option : `${option}=[valeur non rendue]`);
    } else {
      sortie.push(`[argument masqué, ${a.length} caractères]`);
    }
  }
  return sortie;
}

/** Linux et WSL : remonte les processus parents jusqu'à celui de Gemini CLI, s'il y en a un. */
function paquetParProcessus() {
  if (process.platform !== 'linux') return null;
  let pid = parentDe(process.pid);
  for (let n = 0; pid && n < 16; n++) {
    const args = lireLigneDeCommande(pid) ?? [];
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (!isAbsolute(a) || !estFichier(a)) continue;
      const reel = cheminReel(a);
      if (!/gemini(\.js)?$/i.test(basename(reel))) continue;
      const racine = racinePaquetDepuis(reel);
      if (racine) return { racine, pid, arguments: decrireArguments(args.slice(i + 1)) };
    }
    pid = parentDe(pid);
  }
  return null;
}

/** Première commande `gemini` du PATH et son paquet : elle n'est pas forcément celle qui s'exécute. */
function paquetParPath(env) {
  const windows = process.platform === 'win32';
  const noms = windows ? ['gemini.cmd', 'gemini.ps1', 'gemini'] : ['gemini'];
  const chemins = (env.PATH ?? env.Path ?? '').split(windows ? ';' : ':').filter(Boolean);
  for (const d of chemins) {
    for (const n of noms) {
      const commande = join(d, n);
      if (!estFichier(commande)) continue;
      const reel = cheminReel(commande);
      let racine = /\.js$/i.test(reel) ? racinePaquetDepuis(reel) : null;
      if (!racine) {
        const voisin = join(d, 'node_modules', '@google', 'gemini-cli');
        if (lireJson(join(voisin, 'package.json')).donnees?.name === PAQUET) racine = voisin;
      }
      if (!racine) {
        const debut = lireDebut(reel, 4096) ?? '';
        const cible = /(?:[A-Za-z]:)?[^\s"'%$]*[\\/]@google[\\/]gemini-cli[\\/]bundle[\\/]gemini\.js/.exec(debut)?.[0];
        if (cible && isAbsolute(cible)) racine = racinePaquetDepuis(cible);
      }
      if (racine) return { racine, commande };
    }
  }
  return null;
}

function decrirePaquet(racine, source, nature) {
  const pj = lireJson(join(racine, 'package.json')).donnees ?? {};
  const docs = join(racine, 'bundle', 'docs');
  const integres = join(racine, 'bundle', 'builtin');
  return {
    racine,
    nom: pj.name ?? null,
    version: pj.version ?? null,
    source,
    nature,
    documentation: { dossier: docs, presente: estDossier(docs), fichiers: estDossier(docs) ? fichiersSous(docs, (n) => n.endsWith('.md')).length : 0 },
    skills_integres: entrees(integres).filter((e) => e.isDirectory() && estFichier(join(integres, e.name, 'SKILL.md'))).map((e) => e.name),
  };
}

/** Paquet de l'hôte : l'option l'emporte, puis le processus parent observé, puis le PATH (déduit). */
function trouverPaquet(options) {
  const processus = options.ancetres === false ? null : paquetParProcessus();
  if (options.paquet) {
    const racine = resolve(options.paquet);
    if (lireJson(join(racine, 'package.json')).donnees?.name !== PAQUET) {
      return { paquet: null, processus, ecart: `paquet_invalide : ${racine} n'est pas le paquet ${PAQUET}` };
    }
    const ecart = processus && cleConfiance(cheminReel(processus.racine)) !== cleConfiance(cheminReel(racine))
      ? `paquet_different : l'hôte en cours d'exécution vient de ${processus.racine}`
      : undefined;
    return { paquet: decrirePaquet(racine, 'option --paquet', 'déclaré'), processus, ecart };
  }
  if (processus) return { paquet: decrirePaquet(processus.racine, `processus parent ${processus.pid}`, 'observé'), processus };
  const path = paquetParPath(options.env);
  if (path) return { paquet: decrirePaquet(path.racine, `PATH : ${path.commande}`, 'déduit'), processus: null };
  return { paquet: null, processus: null };
}

function surWsl(env) {
  if (process.platform !== 'linux') return false;
  return /microsoft/i.test(lireTexte('/proc/sys/kernel/osrelease') ?? '') || Boolean(env.WSL_DISTRO_NAME);
}

/** Hôte non reconnu : dossiers cachés qui ressemblent à une configuration d'agents, sans les nommer. */
function candidatsGeneriques(lieux) {
  const dossiers = [];
  for (const base of [lieux.racine, lieux.accueil]) {
    for (const e of entrees(base)) {
      if (!e.isDirectory() || !e.name.startsWith('.') || e.name === '.git') continue;
      const d = join(base, e.name);
      const indices = ['skills', 'agents', 'commands', 'rules', 'prompts'].filter((s) => estDossier(join(d, s)));
      if (estFichier(join(d, 'settings.json'))) indices.push('settings.json');
      if (indices.length > 0) dossiers.push({ dossier: d, indices });
    }
  }
  const consignes = entrees(lieux.racine)
    .filter((e) => e.isFile() && /^[A-Z][A-Z0-9_-]*\.md$/.test(e.name) && !/^(README|CHANGELOG|LICENSE|CONTRIBUTING|SECURITY|CODE_OF_CONDUCT)\.md$/.test(e.name))
    .map((e) => join(lieux.racine, e.name));
  return { nature: 'déduit', dossiers_de_configuration: dossiers, fichiers_de_consignes: consignes };
}

function observerHote(options, contexte) {
  const { env } = options;
  const lieux = contexte.lieux;
  const { paquet, processus, ecart } = contexte.recherche;
  const indices = [];
  if (env.GEMINI_CLI === '1') indices.push({ moyen: 'variable GEMINI_CLI=1, posée par l\'hôte dans ses commandes', nature: 'observé' });
  if (processus) indices.push({ moyen: `processus parent ${processus.pid}`, nature: 'observé' });
  if (paquet && paquet.nature === 'déclaré') indices.push({ moyen: 'option --paquet', nature: 'déclaré' });
  if (paquet && paquet.nature === 'déduit') indices.push({ moyen: 'première commande gemini du PATH', nature: 'déduit' });
  const famille = indices.length > 0 ? 'gemini-cli' : 'inconnue';
  const nature = (n) => indices.some((i) => i.nature === n);
  const certitude = famille === 'inconnue' ? 'aucune' : nature('observé') ? 'observée' : nature('déclaré') ? 'déclarée' : 'déduite';
  const avertissements = [];
  if (env.GEMINI_CLI === '1' && !paquet) avertissements.push('paquet_introuvable : l\'hôte est Gemini CLI, mais son paquet n\'a pas été localisé (option --paquet)');
  if (ecart) avertissements.push(ecart);
  if (surWsl(env) && /^\/mnt\/[a-z]\//i.test(lieux.racine)) avertissements.push('racine_windows_depuis_wsl : la racine est sur le système de fichiers de Windows, lue depuis WSL');
  if (paquet && processus === null && paquet.nature === 'déduit' && env.GEMINI_CLI === '1') {
    avertissements.push('version_deduite : le paquet vient du PATH ; ce n\'est pas forcément celui qui s\'exécute');
  }
  return {
    famille,
    certitude,
    indices,
    lance_par_l_hote: env.GEMINI_CLI === '1',
    paquet,
    arguments_de_lancement: processus ? processus.arguments : null,
    bac_a_sable: env.SANDBOX ? { actif: true, nature: env.SANDBOX === 'sandbox-exec' ? 'sandbox-exec' : 'conteneur' } : { actif: false },
    plateforme: { os: process.platform, arch: arch(), node: process.versions.node, wsl: surWsl(env) },
    accueil: { dossier: lieux.accueil, source: lieux.source_accueil },
    racine: { dossier: lieux.racine, est_l_accueil: lieux.racine_est_accueil },
    generique: famille === 'inconnue' ? candidatsGeneriques(lieux) : null,
    avertissements,
  };
}

// ---------------------------------------------------------------------------------------------
// D3 : configuration. Couches de réglages, confiance, fichier .env, variables.

const CLES_OBSERVEES = [
  ['model.name', 'valeur'], ['model.compressionThreshold', 'valeur'], ['model.maxSessionTurns', 'valeur'],
  ['general.defaultApprovalMode', 'valeur'],
  ['general.sessionRetention.enabled', 'valeur'], ['general.sessionRetention.maxAge', 'valeur'], ['general.sessionRetention.maxCount', 'valeur'],
  ['context.fileName', 'valeur'], ['context.memoryBoundaryMarkers', 'valeur'], ['context.includeDirectoryTree', 'valeur'],
  ['context.includeDirectories', 'valeur'], ['context.loadMemoryFromIncludeDirectories', 'valeur'], ['context.discoveryMaxDirs', 'valeur'],
  ['context.fileFiltering.respectGitIgnore', 'valeur'], ['context.fileFiltering.respectGeminiIgnore', 'valeur'],
  ['security.folderTrust.enabled', 'valeur'], ['security.environmentVariableRedaction.enabled', 'valeur'],
  ['security.auth.selectedType', 'valeur'], ['security.allowedEnvironmentVariables', 'valeur'], ['security.blockedEnvironmentVariables', 'valeur'],
  ['tools.sandbox', 'valeur'], ['tools.core', 'valeur'], ['tools.exclude', 'valeur'], ['tools.discoveryCommand', 'presence'],
  ['skills.enabled', 'valeur'], ['skills.disabled', 'valeur'],
  ['hooksConfig.enabled', 'valeur'], ['hooksConfig.disabled', 'valeur'],
  ['mcp.allowed', 'valeur'], ['mcp.excluded', 'valeur'], ['mcp.serverCommand', 'presence'],
  ['agents.overrides', 'agents'], ['experimental', 'drapeaux'],
  ['admin.secureModeEnabled', 'valeur'], ['admin.extensions.enabled', 'valeur'], ['admin.mcp.enabled', 'valeur'], ['admin.skills.enabled', 'valeur'],
  ['telemetry.enabled', 'valeur'], ['telemetry.target', 'valeur'], ['telemetry.logPrompts', 'valeur'], ['telemetry.otlpEndpoint', 'presence'],
  ['privacy.usageStatisticsEnabled', 'valeur'], ['general.enableAutoUpdate', 'valeur'], ['general.enableAutoUpdateNotification', 'valeur'],
  ['policyPaths', 'valeur'], ['adminPolicyPaths', 'valeur'],
  ['advanced.ignoreLocalEnv', 'valeur'], ['advanced.excludedEnvVars', 'valeur'],
];

function rendreValeur(valeur, nature) {
  if (nature === 'presence') return 'défini';
  if (nature === 'agents') {
    const r = {};
    for (const [nom, conf] of Object.entries(valeur ?? {})) r[nom] = { enabled: typeof conf?.enabled === 'boolean' ? conf.enabled : 'non précisé' };
    return r;
  }
  if (nature === 'drapeaux') {
    const r = {};
    for (const [nom, v] of Object.entries(valeur ?? {})) r[nom] = typeof v === 'boolean' || typeof v === 'number' ? v : 'défini';
    return r;
  }
  return masquerProfond(valeur);
}

function chargerCouches(lieux) {
  const definitions = [
    ['défauts système', lieux.defauts_systeme],
    ['utilisateur', lieux.reglages_utilisateur],
    ['workspace', lieux.reglages_workspace],
    ['système', lieux.reglages_systeme],
  ];
  return definitions.map(([portee, chemin]) => {
    const lu = lireJson(chemin);
    return { portee, chemin, present: lu.present, lisible: lu.lisible, erreur: lu.erreur, donnees: lu.donnees };
  });
}

/** Valeur effective d'une clé : la couche la plus haute qui la définit (défauts système < utilisateur < workspace < système). */
function effective(couches, cle) {
  for (const couche of [...couches].reverse()) {
    if (!couche.prise_en_compte || !couche.donnees) continue;
    const v = valeurA(couche.donnees, cle);
    if (v !== undefined) return { valeur: v, source: couche.portee };
  }
  return undefined;
}

/** Confiance du dossier, dans l'ordre de l'hôte : variables, réglage, IDE (non observable), fichier. */
function evaluerConfiance(lieux, couches, env) {
  const fichier = lieux.dossiers_de_confiance;
  if (env.GEMINI_RESTRICTED_MODE === 'true' || env.GEMINI_CLI_TRUST_WORKSPACE === 'false') {
    return { verdict: 'non', source: 'variable d\'environnement', fichier };
  }
  if (env.GEMINI_CLI_TRUST_WORKSPACE === 'true') return { verdict: 'oui', source: 'variable d\'environnement', fichier };
  const sansWorkspace = couches.map((c) => ({ ...c, prise_en_compte: c.portee !== 'workspace' }));
  const active = effective(sansWorkspace, 'security.folderTrust.enabled');
  if (active && active.valeur === false) return { verdict: 'oui', source: `réglage security.folderTrust.enabled = false (${active.source})`, fichier };
  const lu = lireJson(fichier);
  const note = 'un IDE compagnon connecté peut imposer sa propre confiance : non observable par le script';
  if (!lu.present) return { verdict: 'indéterminée', source: null, fichier, fichier_present: false, note };
  if (!lu.lisible) return { verdict: 'indéterminée', source: null, fichier, fichier_present: true, erreur: lu.erreur, note };
  const cible = cleConfiance(cheminReel(lieux.racine));
  let meilleure = null;
  for (const [regle, niveau] of Object.entries(lu.donnees ?? {})) {
    if (!['TRUST_FOLDER', 'TRUST_PARENT', 'DO_NOT_TRUST'].includes(niveau)) continue;
    const effectif = niveau === 'TRUST_PARENT' ? dirname(regle) : regle;
    if (estSousChemin(cleConfiance(cheminReel(effectif)), cible) && (!meilleure || regle.length > meilleure.regle.length)) {
      meilleure = { regle, niveau };
    }
  }
  if (!meilleure) return { verdict: 'indéterminée', source: null, fichier, fichier_present: true, note };
  return { verdict: meilleure.niveau === 'DO_NOT_TRUST' ? 'non' : 'oui', source: 'fichier des dossiers de confiance', regle: meilleure, fichier, note };
}

function lireVariablesEnv(chemin) {
  const texte = lireTexte(chemin) ?? '';
  const variables = [];
  for (const ligne of texte.split(/\r?\n/)) {
    const m = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(ligne);
    if (!m) continue;
    const brute = m[2].trim().replace(/^(['"])(.*)\1$/, '$2');
    variables.push(VARIABLES_VALEUR.includes(m[1]) && !nomSensible(m[1]) ? { nom: m[1], valeur: masquer(brute) } : { nom: m[1] });
  }
  return variables;
}

/** Fichier .env que l'hôte chargerait (logique de Gemini CLI 0.67.0, relue dans son code). */
function trouverFichierEnv(lieux, fiable, ignorerLocal) {
  let d = lieux.racine;
  for (;;) {
    if (fiable && estFichier(join(d, '.gemini', '.env'))) return join(d, '.gemini', '.env');
    if (estFichier(join(d, '.env')) && (!ignorerLocal || cleConfiance(d) === cleConfiance(lieux.accueil))) return join(d, '.env');
    const parent = dirname(d);
    if (parent === d) break;
    d = parent;
  }
  if (fiable && estFichier(join(lieux.accueil, '.gemini', '.env'))) return join(lieux.accueil, '.gemini', '.env');
  if (estFichier(join(lieux.accueil, '.env'))) return join(lieux.accueil, '.env');
  return null;
}

function preparerConfiguration(options, lieux) {
  const couches = chargerCouches(lieux);
  const confiance = evaluerConfiance(lieux, couches, options.env);
  for (const c of couches) {
    if (c.portee === 'workspace' && lieux.racine_est_accueil) {
      c.prise_en_compte = false;
      c.raison = 'la racine est le dossier d\'accueil : ses réglages sont ceux de l\'utilisateur';
    } else if (c.portee === 'workspace' && confiance.verdict === 'non') {
      c.prise_en_compte = false;
      c.raison = 'dossier non fiable : l\'hôte ignore les réglages du workspace';
    } else {
      c.prise_en_compte = c.lisible;
    }
  }
  return { couches, confiance };
}

function observerConfiguration(options, contexte) {
  const { couches, confiance } = contexte.configuration;
  const lieux = contexte.lieux;
  const effectifs = {};
  for (const [cle, nature] of CLES_OBSERVEES) {
    const e = effective(couches, cle);
    if (e !== undefined) effectifs[cle] = { valeur: rendreValeur(e.valeur, nature), source: e.source };
  }
  const env = options.env;
  const ignorerLocal = effective(couches, 'advanced.ignoreLocalEnv')?.valeur === true;
  const fichierEnv = trouverFichierEnv(lieux, confiance.verdict === 'oui', ignorerLocal);
  const surcharges = {};
  for (const [variable, cle] of [['GEMINI_MODEL', 'model.name'], ['GEMINI_SANDBOX', 'tools.sandbox'], ['GEMINI_SYSTEM_MD', 'prompt système']]) {
    if (env[variable]) surcharges[variable] = { valeur: masquer(env[variable]), remplace: cle };
  }
  const redaction = effective(couches, 'security.environmentVariableRedaction.enabled')?.valeur === true || Boolean(env.GITHUB_SHA);
  return {
    couches: couches.map((c) => ({
      portee: c.portee,
      chemin: c.chemin,
      present: c.present,
      lisible: c.lisible,
      ...(c.erreur ? { erreur: c.erreur } : {}),
      prise_en_compte: c.prise_en_compte,
      ...(c.raison ? { raison: c.raison } : {}),
      cles_racine: c.donnees && typeof c.donnees === 'object' ? Object.keys(c.donnees).sort() : [],
    })),
    regle_de_fusion: 'pour chaque clé, la couche la plus haute qui la définit : défauts système < utilisateur < workspace < système ; certaines listes sont fusionnées par l\'hôte (voir sa documentation)',
    effectifs,
    surcharges_environnement: surcharges,
    confiance,
    fichier_env: fichierEnv
      ? { chemin: fichierEnv, nature: 'déduit', variables: lireVariablesEnv(fichierEnv) }
      : { chemin: null, nature: 'déduit' },
    variables: observerVariables(env),
    note_variables: options.env.GEMINI_CLI === '1' && redaction
      ? 'l\'hôte retire des commandes qu\'il lance les variables jugées sensibles : une variable absente ici peut exister pour lui'
      : null,
  };
}

// ---------------------------------------------------------------------------------------------
// En-têtes YAML (skills, agents) et TOML (commandes, politiques), lus de façon minimale.

const nettoyer = (s) => s.trim().replace(/^(['"])(.*)\1$/, '$2');

export function lireEnTete(texte) {
  const m = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(texte ?? '');
  if (!m) return null;
  const champs = {};
  let liste = null;
  let bloc = null;
  for (const ligne of m[1].split(/\r?\n/)) {
    if (bloc && /^\s+\S/.test(ligne)) {
      champs[bloc] = `${champs[bloc]} ${ligne.trim()}`.trim();
      continue;
    }
    bloc = null;
    const element = /^\s+-\s+(.*)$/.exec(ligne);
    if (element && liste) {
      champs[liste].push(nettoyer(element[1]));
      continue;
    }
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(ligne);
    if (!kv) continue;
    liste = null;
    const [, cle, brut] = kv;
    if (brut === '') {
      champs[cle] = [];
      liste = cle;
    } else if (/^[>|][+-]?$/.test(brut)) {
      champs[cle] = '';
      bloc = cle;
    } else if (/^\[.*\]$/.test(brut)) {
      champs[cle] = brut.slice(1, -1).split(',').map(nettoyer).filter(Boolean);
    } else {
      champs[cle] = nettoyer(brut);
    }
  }
  return champs;
}

const tronquer = (texte, n = 200) => (typeof texte === 'string' && texte.length > n ? `${texte.slice(0, n - 1)}…` : texte);

function descriptionToml(texte) {
  const m = /^\s*description\s*=\s*(?:"((?:[^"\\\n]|\\.)*)"|'([^'\n]*)')/m.exec(texte ?? '');
  return m ? (m[1] ?? m[2]) : null;
}

// ---------------------------------------------------------------------------------------------
// D4 : composants. Skills, sous-agents, commandes, extensions, serveurs MCP, hooks, politiques.

function listerExtensions(lieux) {
  const dossier = join(lieux.gemini, 'extensions');
  return entrees(dossier)
    .filter((e) => e.isDirectory() && estFichier(join(dossier, e.name, 'gemini-extension.json')))
    .map((e) => {
      const d = join(dossier, e.name);
      const lu = lireJson(join(d, 'gemini-extension.json'));
      return { dossier: d, nom_dossier: e.name, lu };
    });
}

function decrireSkill(dossierSkill, portee, emplacement) {
  const chemin = join(dossierSkill, 'SKILL.md');
  const entete = lireEnTete(lireTexte(chemin));
  const ecarts = [];
  if (!entete) ecarts.push('en-tête YAML absent');
  else {
    if (!entete.name) ecarts.push('champ name absent');
    if (!entete.description) ecarts.push('champ description absent');
    if (entete.name && entete.name !== basename(dossierSkill)) ecarts.push(`dossier « ${basename(dossierSkill)} » différent du nom « ${entete.name} »`);
  }
  return { nom: entete?.name || basename(dossierSkill), description: tronquer(entete?.description ?? null), portee, emplacement: chemin, source: emplacement, ecarts };
}

function skillsDe(dossier, portee) {
  return entrees(dossier)
    .filter((e) => e.isDirectory() && estFichier(join(dossier, e.name, 'SKILL.md')))
    .map((e) => decrireSkill(join(dossier, e.name), portee, dossier));
}

function observerSkills(contexte) {
  const { lieux, paquet, extensions, fiable, couches } = contexte;
  const paliers = [];
  if (paquet) paliers.push(...skillsDe(join(paquet.racine, 'bundle', 'builtin'), 'intégré'));
  for (const ext of extensions) paliers.push(...skillsDe(join(ext.dossier, 'skills'), `extension ${ext.nom_dossier}`));
  paliers.push(...skillsDe(join(lieux.gemini, 'skills'), 'utilisateur'));
  paliers.push(...skillsDe(join(lieux.agents_accueil, 'skills'), 'utilisateur (.agents)'));
  const workspace = [...skillsDe(join(lieux.racine, '.gemini', 'skills'), 'workspace'), ...skillsDe(join(lieux.racine, '.agents', 'skills'), 'workspace (.agents)')];
  if (!lieux.racine_est_accueil) paliers.push(...workspace);
  const desactives = new Set(effective(couches, 'skills.disabled')?.valeur ?? []);
  const retenu = new Map();
  for (const s of paliers) {
    if (s.portee.startsWith('workspace') && !fiable) s.ignore = 'dossier non fiable';
    if (desactives.has(s.nom)) s.desactive = true;
  }
  for (const s of paliers) if (!s.ignore) retenu.set(s.nom, s);
  for (const s of paliers) {
    const gagnant = retenu.get(s.nom);
    if (!s.ignore && gagnant !== s) s.masque_par = gagnant.emplacement;
  }
  return paliers;
}

function decrireAgent(chemin, portee, overrides) {
  const entete = lireEnTete(lireTexte(chemin));
  const ecarts = [];
  if (!entete) ecarts.push('en-tête YAML absent');
  else {
    if (!entete.name) ecarts.push('champ name absent');
    else if (!/^[a-z0-9_-]+$/.test(entete.name)) ecarts.push('name : minuscules, chiffres, - et _ seulement');
    if (!entete.description) ecarts.push('champ description absent');
  }
  const nom = entete?.name || basename(chemin, '.md');
  const override = overrides?.[nom];
  return {
    nom,
    description: tronquer(entete?.description ?? null),
    portee,
    fichier: chemin,
    nature: entete?.kind ?? 'local',
    outils: entete?.tools ?? 'hérités de la session',
    modele: entete?.model ?? 'hérité',
    ...(override && typeof override.enabled === 'boolean' ? { active: override.enabled } : {}),
    ecarts,
  };
}

function observerSousAgents(contexte) {
  const { lieux, extensions, fiable, couches } = contexte;
  const overrides = effective(couches, 'agents.overrides')?.valeur ?? {};
  const agents = [];
  const de = (dossier, portee) => entrees(dossier).filter((e) => e.isFile() && e.name.endsWith('.md')).map((e) => decrireAgent(join(dossier, e.name), portee, overrides));
  for (const ext of extensions) agents.push(...de(join(ext.dossier, 'agents'), `extension ${ext.nom_dossier}`));
  agents.push(...de(join(lieux.gemini, 'agents'), 'utilisateur'));
  if (!lieux.racine_est_accueil) {
    for (const a of de(join(lieux.racine, '.gemini', 'agents'), 'workspace')) {
      if (!fiable) a.ignore = 'dossier non fiable';
      agents.push(a);
    }
  }
  return agents;
}

function observerCommandes(contexte) {
  const { lieux, extensions, fiable } = contexte;
  const commandes = [];
  const de = (dossier, portee) =>
    fichiersSous(dossier, (n) => n.endsWith('.toml')).map((rel) => {
      const texte = lireTexte(join(dossier, ...rel.split('/')));
      return {
        commande: `/${rel.replace(/\.toml$/, '').split('/').join(':')}`,
        description: tronquer(descriptionToml(texte)),
        portee,
        fichier: join(dossier, ...rel.split('/')),
        prompt_defini: /^\s*prompt\s*=/m.test(texte ?? ''),
      };
    });
  for (const ext of extensions) commandes.push(...de(join(ext.dossier, 'commands'), `extension ${ext.nom_dossier}`));
  commandes.push(...de(join(lieux.gemini, 'commands'), 'utilisateur'));
  if (!lieux.racine_est_accueil) commandes.push(...de(join(lieux.racine, '.gemini', 'commands'), 'workspace'));
  const retenu = new Map();
  for (const c of commandes) {
    if (!fiable) c.ignore = 'dossier non fiable : l\'hôte ne charge aucune commande personnalisée';
    else retenu.set(c.commande, c);
  }
  for (const c of commandes) {
    const gagnant = retenu.get(c.commande);
    if (!c.ignore && gagnant !== c) c.masquee_par = gagnant.fichier;
  }
  return commandes;
}

function decrireServeurMcp(nom, conf, origine) {
  const transport = conf?.httpUrl ? 'http' : conf?.url ? 'sse' : conf?.command ? 'stdio' : 'inconnu';
  return {
    nom,
    origine,
    transport,
    ...(conf?.command ? { commande: basename(String(conf.command)), arguments: masquerArguments(conf.args) } : {}),
    ...(conf?.url || conf?.httpUrl ? { adresse: masquer(String(conf.httpUrl ?? conf.url)) } : {}),
    variables: Object.keys(conf?.env ?? {}).sort(),
    en_tetes: Object.keys(conf?.headers ?? {}).sort(),
    ...(conf?.trust !== undefined ? { trust: conf.trust === true } : {}),
    ...(conf?.includeTools ? { includeTools: conf.includeTools } : {}),
    ...(conf?.excludeTools ? { excludeTools: conf.excludeTools } : {}),
  };
}

function observerServeursMcp(contexte) {
  const { couches, extensions, fiable } = contexte;
  const serveurs = [];
  for (const ext of extensions) {
    for (const [nom, conf] of Object.entries(ext.lu.donnees?.mcpServers ?? {})) serveurs.push(decrireServeurMcp(nom, conf, `extension ${ext.nom_dossier}`));
  }
  for (const c of couches) {
    for (const [nom, conf] of Object.entries(c.donnees?.mcpServers ?? {})) {
      const s = decrireServeurMcp(nom, conf, `réglages ${c.portee}`);
      if (!c.prise_en_compte) s.ignore = c.raison ?? 'couche non prise en compte';
      serveurs.push(s);
    }
  }
  const autorises = effective(couches, 'mcp.allowed')?.valeur;
  const exclus = effective(couches, 'mcp.excluded')?.valeur;
  for (const s of serveurs) {
    if (Array.isArray(exclus) && exclus.includes(s.nom)) s.exclu = 'mcp.excluded';
    if (Array.isArray(autorises) && !autorises.includes(s.nom)) s.exclu = 'absent de mcp.allowed';
  }
  return {
    serveurs,
    note: fiable ? null : 'dossier non fiable : l\'hôte ne connecte aucun serveur MCP',
  };
}

function decrireHooks(hooks, origine) {
  const resultat = [];
  for (const [evenement, groupes] of Object.entries(hooks ?? {})) {
    if (!Array.isArray(groupes)) continue;
    for (const groupe of groupes) {
      for (const h of groupe?.hooks ?? []) {
        resultat.push({
          evenement,
          origine,
          nom: h?.name ?? null,
          type: h?.type ?? null,
          ...(groupe?.matcher ? { filtre: masquer(String(groupe.matcher)) } : {}),
          commande: tronquer(masquer(String(h?.command ?? '')), 120),
        });
      }
    }
  }
  return resultat;
}

function observerHooks(contexte) {
  const { couches, extensions } = contexte;
  const hooks = [];
  for (const ext of extensions) hooks.push(...decrireHooks(lireJson(join(ext.dossier, 'hooks', 'hooks.json')).donnees?.hooks, `extension ${ext.nom_dossier}`));
  for (const c of couches) {
    const liste = decrireHooks(c.donnees?.hooks, `réglages ${c.portee}`);
    for (const h of liste) if (!c.prise_en_compte) h.ignore = c.raison ?? 'couche non prise en compte';
    hooks.push(...liste);
  }
  return { actives: effective(couches, 'hooksConfig.enabled')?.valeur ?? 'non précisé (défaut de l\'hôte)', hooks };
}

function decrirePolitique(chemin, palier) {
  const texte = lireTexte(chemin) ?? '';
  const decisions = { allow: 0, deny: 0, ask_user: 0 };
  for (const m of texte.matchAll(/^\s*(?:decision|action)\s*=\s*"(allow|deny|ask_user)"/gm)) decisions[m[1]]++;
  const outils = new Set();
  for (const m of texte.matchAll(/^\s*toolName\s*=\s*(?:"([^"]+)"|\[([^\]]*)\])/gm)) {
    for (const o of (m[1] ?? m[2]).split(',')) if (nettoyer(o)) outils.add(nettoyer(o));
  }
  if (/^\s*command(?:Prefix|Regex)\s*=/m.test(texte)) outils.add('run_shell_command');
  const modes = new Set();
  for (const m of texte.matchAll(/^\s*modes\s*=\s*\[([^\]]*)\]/gm)) for (const x of m[1].split(',')) if (nettoyer(x)) modes.add(nettoyer(x));
  const sousAgents = new Set([...texte.matchAll(/^\s*subagent\s*=\s*"([^"]+)"/gm)].map((m) => m[1]));
  return {
    fichier: chemin,
    palier,
    regles: [...texte.matchAll(/^\s*\[\[\s*rules?\s*\]\]/gm)].length,
    decisions,
    outils: [...outils].sort(),
    modes: [...modes].sort(),
    sous_agents: [...sousAgents].sort(),
    ...(basename(chemin) === 'auto-saved.toml' ? { approbations_enregistrees: true } : {}),
  };
}

function observerPolitiques(contexte) {
  const { lieux, extensions, couches } = contexte;
  const fichiers = [];
  const de = (dossier, palier) => entrees(dossier).filter((e) => e.isFile() && e.name.endsWith('.toml')).map((e) => decrirePolitique(join(dossier, e.name), palier));
  fichiers.push(...de(join(lieux.systeme, 'policies'), 'administrateur'));
  fichiers.push(...de(join(lieux.gemini, 'policies'), 'utilisateur'));
  if (!lieux.racine_est_accueil) fichiers.push(...de(join(lieux.racine, '.gemini', 'policies'), 'workspace'));
  for (const ext of extensions) fichiers.push(...de(join(ext.dossier, 'policies'), `extension ${ext.nom_dossier}`));
  for (const [cle, palier] of [['policyPaths', 'utilisateur (policyPaths)'], ['adminPolicyPaths', 'administrateur (adminPolicyPaths)']]) {
    for (const p of effective(couches, cle)?.valeur ?? []) {
      const chemin = resolve(lieux.racine, String(p));
      if (estDossier(chemin)) fichiers.push(...de(chemin, palier));
      else if (estFichier(chemin)) fichiers.push(decrirePolitique(chemin, palier));
    }
  }
  return {
    fichiers,
    note: 'le palier du workspace et la priorité de chaque palier se lisent dans la documentation de la version installée (reference/policy-engine.md)',
  };
}

function observerExtensions(contexte) {
  return contexte.extensions.map((ext) => {
    const m = ext.lu.donnees ?? {};
    const installation = lireJson(join(ext.dossier, '.gemini-extension-install.json')).donnees;
    return {
      nom: m.name ?? ext.nom_dossier,
      version: m.version ?? null,
      dossier: ext.dossier,
      lisible: ext.lu.lisible,
      description: tronquer(m.description ?? null),
      serveurs_mcp: Object.keys(m.mcpServers ?? {}).sort(),
      fichier_de_contexte: m.contextFileName ?? (estFichier(join(ext.dossier, 'GEMINI.md')) ? 'GEMINI.md' : null),
      excludeTools: m.excludeTools ?? [],
      contient: ['commands', 'skills', 'agents', 'policies', 'hooks'].filter((d) => estDossier(join(ext.dossier, d))),
      ...(installation?.source ? { source: masquer(String(installation.source)) } : {}),
    };
  });
}

function observerIgnores(lieux) {
  const depot = contexteDepot(lieux.racine, ['.git']);
  return {
    geminiignore: estFichier(join(lieux.racine, '.geminiignore')) ? join(lieux.racine, '.geminiignore') : null,
    gitignore: estFichier(join(lieux.racine, '.gitignore')) ? join(lieux.racine, '.gitignore') : null,
    exclusion_git: depot && estFichier(join(depot, '.git', 'info', 'exclude')) ? join(depot, '.git', 'info', 'exclude') : null,
  };
}

function observerComposants(options, contexte) {
  const max = options.max;
  const borne = (liste, etiquette) => {
    if (liste.length > max) contexte.troncatures.push(`${etiquette} : ${liste.length} éléments, ${max} rendus`);
    return liste.slice(0, max);
  };
  const mcp = observerServeursMcp(contexte);
  const hooks = observerHooks(contexte);
  const politiques = observerPolitiques(contexte);
  return {
    confiance: contexte.configuration.confiance.verdict,
    skills: borne(observerSkills(contexte), 'composants.skills'),
    sous_agents: borne(observerSousAgents(contexte), 'composants.sous_agents'),
    note_sous_agents: 'les sous-agents intégrés vivent dans le code de l\'hôte : la section « Available Sub-Agents » du prompt système et /agents list les montrent',
    commandes: borne(observerCommandes(contexte), 'composants.commandes'),
    extensions: borne(observerExtensions(contexte), 'composants.extensions'),
    activation_des_extensions: estFichier(join(contexte.lieux.gemini, 'extensions', 'extension-enablement.json')) ? 'fichier présent : /extensions list fait foi' : null,
    serveurs_mcp: { ...mcp, serveurs: borne(mcp.serveurs, 'composants.serveurs_mcp') },
    hooks: { ...hooks, hooks: borne(hooks.hooks, 'composants.hooks') },
    politiques: { ...politiques, fichiers: borne(politiques.fichiers, 'composants.politiques') },
    fichiers_d_exclusion: observerIgnores(contexte.lieux),
  };
}

// ---------------------------------------------------------------------------------------------
// D5 : contexte. Fichiers de contexte, mémoire privée du projet, trace de la dernière session,
// prompt système exporté par le développeur.

function contexteDepot(depart, marqueurs) {
  if (marqueurs.length === 0) return null;
  let d = resolve(depart);
  for (;;) {
    for (const m of marqueurs) {
      if (isAbsolute(m) || m.includes('..')) continue;
      if (etat(join(d, m))) return d;
    }
    const parent = dirname(d);
    if (parent === d) return null;
    d = parent;
  }
}

function importsDe(texte, dossier) {
  const imports = [];
  let dansBloc = false;
  for (const ligne of (texte ?? '').split('\n')) {
    if (ligne.trimStart().startsWith(CLOTURE)) {
      dansBloc = !dansBloc;
      continue;
    }
    if (dansBloc) continue;
    for (const m of ligne.matchAll(/(?:^|\s)@([./A-Za-z][^\s]*)/g)) {
      const cible = m[1];
      if (!/[./\\]/.test(cible)) continue;
      imports.push({ cible, existe: estFichier(resolve(dossier, cible)) });
    }
  }
  return imports;
}

function decrireFichierContexte(chemin) {
  const texte = lireTexte(chemin);
  return { chemin, octets: Buffer.byteLength(texte ?? '', 'utf8'), lignes: compterLignes(texte), imports: importsDe(texte, dirname(chemin)) };
}

function nomsDeContexte(couches) {
  const e = effective(couches, 'context.fileName');
  if (e === undefined) return { noms: ['GEMINI.md'], source: 'défaut documenté de l\'hôte' };
  const noms = (Array.isArray(e.valeur) ? e.valeur : [e.valeur]).filter((n) => typeof n === 'string' && n !== '');
  return { noms: noms.length > 0 ? noms : ['GEMINI.md'], source: `réglages ${e.source}` };
}

const DOSSIERS_SAUTES = new Set(['.git', 'node_modules', 'target', 'dist', 'build', 'vendor', '.venv', '__pycache__']);

function fichiersALaDemande(racine, noms, max) {
  const trouves = [];
  const file = [racine];
  let examines = 0;
  while (file.length > 0 && examines < 2000) {
    const d = file.shift();
    examines++;
    for (const e of entrees(d)) {
      const chemin = join(d, e.name);
      if (e.isDirectory() && !DOSSIERS_SAUTES.has(e.name)) file.push(chemin);
      else if (e.isFile() && d !== racine && noms.includes(e.name)) trouves.push(chemin);
    }
  }
  return { nature: 'déduit', fichiers: trouves.slice(0, max), total: trouves.length, dossiers_examines: examines, tronque: file.length > 0 || trouves.length > max };
}

function identifiantProjet(lieux) {
  const lu = lireJson(lieux.registre_projets);
  const projets = lu.donnees?.projects;
  if (!projets || typeof projets !== 'object') return { identifiant: null, registre: lieux.registre_projets, present: lu.present };
  const cle = cleRegistre(lieux.racine);
  return { identifiant: typeof projets[cle] === 'string' ? projets[cle] : null, registre: lieux.registre_projets, present: true };
}

function texteSessionContext(fichier) {
  const debut = lireDebut(fichier, 512 * 1024) ?? '';
  const candidats = [];
  if (fichier.endsWith('.jsonl')) {
    for (const ligne of debut.split('\n').slice(0, 40)) {
      try {
        candidats.push(JSON.parse(ligne));
      } catch {
        // ligne tronquée ou non JSON : ignorée
      }
    }
  } else {
    try {
      candidats.push(...(JSON.parse(debut).messages ?? []));
    } catch {
      // fichier plus grand que la lecture bornée : rien n'est rendu
    }
  }
  for (const o of candidats) {
    const parties = Array.isArray(o?.content) ? o.content : Array.isArray(o?.parts) ? o.parts : [];
    const texte = parties.map((p) => (typeof p?.text === 'string' ? p.text : '')).join('\n');
    if (texte.includes('<session_context>')) return { texte, debut: candidats[0]?.startTime ?? null };
  }
  return null;
}

/** Balises de contexte posées par l'hôte (`<session_context>`, `<global_context>`…), jamais le texte qu'elles entourent. */
function balisesDeContexte(texte) {
  return [...new Set([...texte.matchAll(/<([a-z_]+_context|user_project_memory)>/g)].map((m) => m[1]))].slice(0, 20);
}

/** Dernière session du projet : seuls les chemins et les balises du message d'ouverture sont rendus. */
function traceDerniereSession(lieux, identifiant, max) {
  if (!identifiant) return null;
  const dossier = join(lieux.temporaire, identifiant, 'chats');
  const sessions = entrees(dossier)
    .filter((e) => e.isFile() && /^session-.*\.jsonl?$/.test(e.name))
    .map((e) => ({ chemin: join(dossier, e.name), date: etat(join(dossier, e.name))?.mtimeMs ?? 0 }))
    .sort((a, b) => b.date - a.date);
  if (sessions.length === 0) return { dossier, sessions: 0 };
  const plusRecente = sessions[0].chemin;
  const lu = texteSessionContext(plusRecente);
  if (!lu) return { dossier, sessions: sessions.length, fichier: plusRecente, message_d_ouverture: false };
  const charges = [...lu.texte.matchAll(/^--- Context from: (.+) ---$/gm)].map((m) => m[1]);
  const espaces = [];
  const apres = lu.texte.split('- **Workspace Directories:**')[1] ?? '';
  for (const ligne of apres.split('\n').slice(1)) {
    const m = /^ {2}- (.+)$/.exec(ligne);
    if (!m) break;
    espaces.push(m[1]);
  }
  return {
    dossier,
    sessions: sessions.length,
    fichier: plusRecente,
    nature: 'observé',
    note: 'session la plus récemment modifiée du projet : pas forcément celle de la conversation en cours',
    debut: lu.debut,
    message_d_ouverture: true,
    balises: balisesDeContexte(lu.texte),
    dossiers_workspace: espaces.slice(0, max),
    arborescence_incluse: lu.texte.includes('- **Directory Structure:**'),
    fichiers_de_contexte_charges: charges.slice(0, max),
  };
}

function analyserPromptSysteme(fichier, max) {
  const texte = lireTexte(fichier);
  if (texte === null) throw new Echec(CODES.INTROUVABLE, `prompt système exporté introuvable : ${fichier}`);
  const titres = [];
  let dansBloc = false;
  for (const ligne of texte.split('\n')) {
    if (ligne.trimStart().startsWith(CLOTURE)) dansBloc = !dansBloc;
    else if (!dansBloc && /^#{1,2} \S/.test(ligne)) titres.push(ligne.trim());
  }
  const skills = [...texte.matchAll(/<skill>\s*<name>([^<]*)<\/name>[\s\S]*?<location>([^<]*)<\/location>\s*<\/skill>/g)].map((m) => ({ nom: m[1].trim(), emplacement: m[2].trim() }));
  const sousAgents = [];
  const section = texte.split(/^# Available Sub-Agents\s*$/m)[1]?.split(/^# /m)[0] ?? '';
  for (const m of section.matchAll(/^- ([A-Za-z0-9_-]+) -> /gm)) sousAgents.push(m[1]);
  for (const m of section.matchAll(/<subagent>\s*<name>([^<]+)<\/name>/g)) sousAgents.push(m[1].trim());
  return {
    fichier,
    nature: 'observé',
    caracteres: texte.length,
    titres: titres.slice(0, 80),
    skills: skills.slice(0, max),
    sous_agents: sousAgents.slice(0, max),
    balises: balisesDeContexte(texte),
    fichiers_de_contexte: [...texte.matchAll(/^--- Context from: (.+) ---$/gm)].map((m) => m[1]).slice(0, max),
    outil_d_appel_des_sous_agents: texte.includes('invoke_agent') ? 'invoke_agent' : null,
  };
}

function observerContexte(options, contexte) {
  const { lieux } = contexte;
  const { couches, confiance } = contexte.configuration;
  const max = options.max;
  const { noms, source } = nomsDeContexte(couches);
  const marqueursConf = effective(couches, 'context.memoryBoundaryMarkers');
  const marqueurs = Array.isArray(marqueursConf?.valeur) ? marqueursConf.valeur.map(String) : ['.git'];
  const global = noms.map((n) => join(lieux.gemini, n)).filter(estFichier).map(decrireFichierContexte);
  const depot = contexteDepot(lieux.racine, marqueurs);
  const plafond = depot ?? lieux.racine;
  const projet = [];
  let d = lieux.racine;
  let parcourus = 0;
  for (;;) {
    parcourus++;
    if (cleConfiance(d) === cleConfiance(lieux.gemini)) break;
    for (const n of noms) {
      const chemin = join(d, n);
      if (estFichier(chemin) && !global.some((g) => cleConfiance(g.chemin) === cleConfiance(chemin))) projet.push(decrireFichierContexte(chemin));
    }
    if (cleConfiance(d) === cleConfiance(plafond)) break;
    const parent = dirname(d);
    if (parent === d) break;
    d = parent;
  }
  const { identifiant, registre, present } = identifiantProjet(lieux);
  const dossierMemoire = identifiant ? join(lieux.temporaire, identifiant, 'memory') : null;
  const index = dossierMemoire ? join(dossierMemoire, 'MEMORY.md') : null;
  const extensions = contexte.extensions.map((ext) => {
    const nom = ext.lu.donnees?.contextFileName ?? 'GEMINI.md';
    const chemin = join(ext.dossier, nom);
    return { extension: ext.nom_dossier, chemin, present: estFichier(chemin) };
  });
  return {
    noms_de_fichiers: { noms, source },
    global: { nature: 'observé', fichiers: global, note: 'chargé à chaque session, dans les instructions système' },
    projet: {
      nature: 'déduit',
      depot,
      marqueurs,
      dossiers_parcourus: parcourus,
      fichiers: projet.sort((a, b) => (a.chemin < b.chemin ? -1 : a.chemin > b.chemin ? 1 : 0)).slice(0, max),
      charge_au_demarrage: confiance.verdict === 'oui' ? 'oui' : confiance.verdict === 'non' ? 'non : dossier non fiable' : 'si le dossier est déclaré fiable',
      note: 'de la racine jusqu\'au dépôt (marqueurs), dans l\'ordre des chemins triés : chargés dans le premier message de la session',
    },
    memoire_privee_du_projet: {
      registre,
      registre_present: present,
      identifiant,
      dossier: dossierMemoire,
      index: index ? { chemin: index, present: estFichier(index), octets: estFichier(index) ? etat(index).size : 0 } : null,
    },
    extensions,
    a_la_demande: confiance.verdict === 'non' ? { nature: 'déduit', fichiers: [], note: 'dossier non fiable : aucun chargement à la demande' } : fichiersALaDemande(lieux.racine, noms, max),
    trace_de_session: traceDerniereSession(lieux, identifiant, max),
    prompt_systeme: options.promptSysteme ? analyserPromptSysteme(resolve(options.promptSysteme), max) : null,
  };
}

// ---------------------------------------------------------------------------------------------
// Documentation embarquée dans le paquet installé, à sa version exacte.

function documentation(options, paquet, positionnels) {
  if (!paquet) throw new Echec(CODES.INTROUVABLE, 'paquet de Gemini CLI introuvable : préciser --paquet <dossier du paquet>');
  if (!paquet.documentation.presente) throw new Echec(CODES.INTROUVABLE, `ce paquet n'embarque pas de documentation : ${paquet.documentation.dossier}`);
  const dossier = paquet.documentation.dossier;
  const demande = positionnels[0];
  if (!demande) {
    return { version: paquet.version, dossier, nature: 'documenté', fichiers: fichiersSous(dossier, (n) => n.endsWith('.md')).slice(0, 500) };
  }
  if (isAbsolute(demande) || demande.split(/[\\/]/).includes('..')) {
    throw new Echec(CODES.REFUS, `chemin refusé : ${demande} (relatif au dossier de documentation, sans « .. »)`);
  }
  const chemin = resolve(dossier, demande);
  if (!estSousChemin(dossier, chemin) || !chemin.endsWith('.md')) throw new Echec(CODES.REFUS, `chemin refusé : ${demande}`);
  const texte = lireTexte(chemin);
  if (texte === null) throw new Echec(CODES.INTROUVABLE, `document introuvable dans la documentation ${paquet.version} : ${demande}`);
  const limite = options.maxCaracteres ?? MAX_DOC;
  return {
    version: paquet.version,
    document: demande.split(sep).join('/'),
    chemin,
    nature: 'documenté',
    caracteres: texte.length,
    tronque: texte.length > limite,
    texte: texte.slice(0, limite),
  };
}

// ---------------------------------------------------------------------------------------------
// Exécution.

function preparer(options) {
  const lieux = emplacements(options);
  const recherche = trouverPaquet(options);
  const configuration = preparerConfiguration(options, lieux);
  return {
    lieux,
    recherche,
    paquet: recherche.paquet,
    configuration,
    couches: configuration.couches,
    fiable: configuration.confiance.verdict !== 'non',
    extensions: listerExtensions(lieux),
    troncatures: [],
  };
}

/** Rend l'objet d'une commande, sans rien écrire. */
export function executer(commande, options = {}, positionnels = []) {
  if (Object.hasOwn(RESERVEES, commande)) throw new Echec(CODES.USAGE, `commande réservée (${RESERVEES[commande]}) : non disponible en ${VERSION}`);
  if (!COMMANDES.includes(commande)) throw new Echec(CODES.USAGE, `commande inconnue : ${commande ?? '(aucune)'} ; commandes : ${COMMANDES.join(', ')}`);
  const opts = { env: process.env, max: MAX_DEFAUT, ...options };
  if (!Number.isInteger(opts.max) || opts.max < 1) throw new Echec(CODES.USAGE, '--max : entier positif attendu');
  const contexte = preparer(opts);
  const objet = { ok: true, commande, skill: 'explication-hote-ia', version: VERSION, schema: SCHEMA, date: new Date().toISOString() };
  if (commande === 'doc') return masquerProfond({ ...objet, doc: documentation(opts, contexte.paquet, positionnels) });
  const hote = observerHote(opts, contexte);
  if (commande === 'hote' || commande === 'tout') objet.hote = hote;
  const configurationGemini = hote.famille !== 'inconnue' || estDossier(contexte.lieux.gemini) || estDossier(join(contexte.lieux.racine, '.gemini'));
  if (!configurationGemini && commande !== 'hote') {
    objet.applicable = false;
    objet.raison = 'hôte non reconnu et aucune configuration de Gemini CLI : seule une description générique est possible';
    objet.generique = candidatsGeneriques(contexte.lieux);
  } else {
    if (commande !== 'hote') objet.hote_confirme = hote.certitude === 'observée';
    if (commande === 'config' || commande === 'tout') objet.config = observerConfiguration(opts, contexte);
    if (commande === 'contexte' || commande === 'tout') objet.contexte = observerContexte(opts, contexte);
    if (commande === 'composants' || commande === 'tout') objet.composants = observerComposants(opts, contexte);
  }
  if (contexte.troncatures.length > 0) objet.troncatures = contexte.troncatures;
  return masquerProfond(objet);
}

// ---------------------------------------------------------------------------------------------
// Sorties.

function rendreTexte(valeur, niveau = 0) {
  const marge = '  '.repeat(niveau);
  const lignes = [];
  if (Array.isArray(valeur)) {
    if (valeur.length === 0) return [`${marge}(aucun)`];
    for (const v of valeur) {
      if (v && typeof v === 'object') {
        const [premiere, ...suite] = rendreTexte(v, niveau + 1);
        lignes.push(`${marge}- ${premiere.trimStart()}`, ...suite);
      } else lignes.push(`${marge}- ${v}`);
    }
    return lignes;
  }
  for (const [cle, v] of Object.entries(valeur ?? {})) {
    if (v === null || v === undefined) lignes.push(`${marge}${cle} : —`);
    else if (typeof v === 'object' && (Array.isArray(v) ? v.length > 0 : Object.keys(v).length > 0)) lignes.push(`${marge}${cle} :`, ...rendreTexte(v, niveau + 1));
    else if (typeof v === 'object') lignes.push(`${marge}${cle} : (aucun)`);
    else lignes.push(`${marge}${cle} : ${v}`);
  }
  return lignes;
}

function texteDe(objet) {
  if (objet.doc?.texte !== undefined) return `${objet.doc.texte}${objet.doc.tronque ? `\n[document tronqué à ${objet.doc.texte.length} caractères sur ${objet.doc.caracteres}]\n` : ''}`;
  const { ok, commande, skill, version, schema, date, ...reste } = objet;
  return [`# Instantané de l'hôte : ${commande} (${skill} ${version}, schéma ${schema}, ${date})`, ...rendreTexte(reste)].join('\n') + '\n';
}

const AIDE = `explication-hote-ia ${VERSION} : instantané en lecture seule de l'outil d'IA hôte.

Usage : node scripts/instantane-hote.mjs <commande> [options]

Commandes :
  hote               qui exécute le script : famille, paquet, version, documentation, plateforme
  config             couches de réglages, valeurs effectives et leur source, confiance, .env, variables
  contexte           fichiers de contexte, mémoire privée du projet, trace de la dernière session
  composants         skills, sous-agents, commandes, extensions, serveurs MCP, hooks, politiques
  doc [chemin]       documentation embarquée dans le paquet installé : liste, ou un document
  tout               hote, config, contexte et composants ensemble

Options :
  --racine <dossier>          racine du workspace (défaut : dossier courant)
  --paquet <dossier>          dossier du paquet @google/gemini-cli, s'il n'est pas trouvé seul
  --dossier-systeme <dossier> dossier système de l'hôte (défaut : celui de la plateforme)
  --prompt-systeme <fichier>  prompt système exporté par le développeur, à analyser (contexte)
  --format json|texte         json sur une ligne (défaut) ou texte lisible
  --max <n>                   éléments rendus par liste (défaut ${MAX_DEFAUT}) ; toute troncature est signalée
  --max-caracteres <n>        longueur rendue d'un document (défaut ${MAX_DOC})
  --version, --help

Codes de sortie : 0 réussite ; 1 usage ; 2 introuvable ; 3 chemin refusé ; 4 erreur interne.
Le script n'écrit rien, ne lance rien, ne se connecte à rien. Aucune valeur secrète n'est rendue.
`;

function analyserLigne(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    strict: true,
    options: {
      racine: { type: 'string' },
      paquet: { type: 'string' },
      'dossier-systeme': { type: 'string' },
      'prompt-systeme': { type: 'string' },
      format: { type: 'string' },
      max: { type: 'string' },
      'max-caracteres': { type: 'string' },
      version: { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  const entier = (nom, texte) => {
    if (texte === undefined) return undefined;
    if (!/^\d+$/.test(texte) || Number(texte) < 1) throw new Echec(CODES.USAGE, `--${nom} : entier positif attendu`);
    return Number(texte);
  };
  const format = values.format ?? 'json';
  if (!FORMATS.includes(format)) throw new Echec(CODES.USAGE, `--format : ${FORMATS.join(' ou ')}`);
  return {
    commande: positionals[0],
    positionnels: positionals.slice(1),
    format,
    aide: values.help === true,
    version: values.version === true,
    options: {
      racine: values.racine,
      paquet: values.paquet,
      dossierSysteme: values['dossier-systeme'],
      promptSysteme: values['prompt-systeme'],
      max: entier('max', values.max) ?? MAX_DEFAUT,
      maxCaracteres: entier('max-caracteres', values['max-caracteres']),
    },
  };
}

function principal(argv) {
  let format = 'json';
  try {
    const ligne = analyserLigne(argv);
    format = ligne.format;
    if (ligne.aide) {
      process.stdout.write(AIDE);
      return CODES.OK;
    }
    if (ligne.version) {
      process.stdout.write(`${JSON.stringify({ ok: true, version: VERSION, schema: SCHEMA })}\n`);
      return CODES.OK;
    }
    const objet = executer(ligne.commande, ligne.options, ligne.positionnels);
    process.stdout.write(format === 'texte' ? texteDe(objet) : `${JSON.stringify(objet)}\n`);
    return CODES.OK;
  } catch (e) {
    const usage = typeof e?.code === 'string' && e.code.startsWith('ERR_PARSE_ARGS');
    const code = e instanceof Echec ? e.code : usage ? CODES.USAGE : CODES.INTERNE;
    const message = masquer(e instanceof Echec || usage ? e.message : `erreur inattendue : ${e?.message}`);
    process.stderr.write(format === 'texte' ? `erreur (${code}) : ${message}\n` : `${JSON.stringify({ ok: false, code, erreur: message })}\n`);
    return code;
  }
}

const estPrincipal = (() => {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
})();
if (estPrincipal) process.exitCode = principal(process.argv.slice(2));
```
