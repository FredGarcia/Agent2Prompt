---
name: execution
description: Exécution du skill (commandes npm depuis le dossier du skill, installation par npm ci, navigateur du poste et canal Chrome, Edge ou Chromium, emplacements du profil, des captures et des exports, .gitignore du skill, réglages par variables JIRA_CAPTURE_*, dépendance unique playwright-core à version exacte, pièges connus, commande d'extraction des fichiers exécutables à empreintes, sources de package.json, package-lock.json, .gitignore et du module commun scripts/jira-capture-core.mjs). À lire en premier, pour installer le skill.
dimensions: [D1]
status: active
---

# Module `execution` (D1)

Phase 7E couverte : Espace.

## 1. Commandes

Toutes se lancent depuis le dossier du skill.

| Commande | Effet | Module |
|---|---|---|
| `npm ci` | installe `playwright-core` 1.63.0, sans navigateur | ce module |
| `npm run capture` | interface de capture, sur http://127.0.0.1:3100 | `interface` |
| `npm run capture:cli -- "<page du sprint>" [options]`, ou `-- --ticket "<adresse du ticket>"` | capture en ligne de commande, d'un sprint ou d'un ticket seul | `interface`, `ticket` |
| `npm run export` | export par l'API, sur http://127.0.0.1:3000 | `export-api` |
| `python3 scripts/jira_sprint_export.py --board <tableau>` | export par l'API, en Python (sous Windows : `py`) | `export-api` |
| `npm test` | recette, 20 scénarios contre un faux Jira local | `recette` |

## 2. Installation

1. Node 20 ou plus récent : `node --version`.
2. `npm ci` installe la seule dépendance, à la version du verrou (D1.INV-1). Derrière un proxy d'entreprise, npm lit `HTTPS_PROXY` ou sa propre configuration (`npm config set proxy …`).
3. Le navigateur est celui du poste : Chrome par défaut. `playwright-core` n'en télécharge aucun.
   - Edge : `JIRA_CAPTURE_CHANNEL=msedge`.
   - Sans Chrome ni Edge : `npx playwright-core install chromium`, puis `JIRA_CAPTURE_CHANNEL=chromium`.
4. Sous WSL2, le navigateur doit être installé dans la distribution, et la fenêtre s'affiche par WSLg. Le plus simple reste de matérialiser et de lancer le skill sous Windows, à côté de Chrome.
5. La capture ouvre une fenêtre visible, pour la connexion SSO : elle demande un écran. Seule la recette tourne sans écran, sous `xvfb-run` (module `recette`, § 1).

## 3. Emplacements (D1.INV-2)

| Chemin, dans le dossier du skill | Contenu | Écarté par `.gitignore` |
|---|---|---|
| `.jira-profile/` | profil du navigateur dédié à Jira : cookies de la session SSO | oui |
| `mhtml/` | dossier de sortie par défaut des captures | oui |
| `exports/` | sortie par défaut du script d'export Python | oui |
| `node_modules/` | `playwright-core` | oui |
| tout fichier `*.mhtml` | capture rangée ailleurs dans le dossier | oui |

Un dossier de sortie choisi hors du skill (chemin absolu dans l'interface, `--sortie` en ligne de commande) n'est couvert par aucun `.gitignore` : il se choisit hors de tout dépôt. Le profil contient des cookies de session : il ne se copie ni ne se partage.

## 4. Réglages (D1.INV-3)

| Variable | Défaut | Rôle |
|---|---|---|
| `JIRA_CAPTURE_CHANNEL` | `chrome` | navigateur : `chrome`, `msedge`, ou `chromium` pour celui de Playwright |
| `JIRA_CAPTURE_PROFILE` | `.jira-profile` | dossier du profil, relatif au dossier du skill ou absolu |
| `JIRA_CAPTURE_PAGE_TIMEOUT_MS` | `20000` | délai d'affichage d'une page de ticket, en millisecondes |
| `PORT` | `3100` pour la capture, `3000` pour l'export | port de l'interface, toujours sur `127.0.0.1` |

Une variable vide vaut absente. Sous PowerShell : `$env:JIRA_CAPTURE_CHANNEL = "msedge"` ; sous bash : `export JIRA_CAPTURE_CHANNEL=msedge` ; puis `npm run capture`.

## 5. Dépendance (D1.INV-1)

`playwright-core` 1.63.0, à version exacte dans `package.json` et dans le verrou : c'est la version de la recette. Elle accepte Node 20 (`engines`), n'a aucune dépendance et pilote le navigateur du poste par le protocole Chrome DevTools. Une autre version se monte dans une nouvelle version du skill, recette rejouée.

## 6. Pièges connus

- **Profil déjà ouvert** : un profil ne s'ouvre que dans une fenêtre à la fois. Si l'interface et la ligne de commande tournent ensemble, la seconde ne lance pas le navigateur. Fermer la première fenêtre.
- **Chrome introuvable** : le lancement échoue et l'interface affiche « Impossible de lancer le navigateur ». Installer Chrome, ou choisir un autre canal (§ 4).
- **Session expirée** : traitée par le module `capture` (D4.INV-1, D4.INV-4).

## 7. Contrôle de sortie

- La commande du § 8 écrit `conforme` pour chacun des treize fichiers.
- `npm ci` installe `playwright-core` 1.63.0.
- `npm test` rend son bilan sans échec (module `recette`).

## 8. Matérialiser les fichiers exécutables

Treize fichiers sont tirés des blocs annotés `<!-- fichier : chemin -->` des modules, à l'identique, par programme plutôt qu'à la main :

| Fichier | Module, section | Empreinte sha256 |
|---|---|---|
| `package.json` | `execution`, § 9 | `d3784c1e36eb0ca8724d6643b20ac9570e2af3c0019033d460b6cb12abfe2927` |
| `package-lock.json` | `execution`, § 9 | `b3f53e6ed11bb366196541eb86f28bdf103637536177706072f902e989a2a7f8` |
| `.gitignore` | `execution`, § 9 | `b163b109241838c4ff48e7cc27de427a4fb4e7f9aebdb16c8a5ad3fbb7a02613` |
| `scripts/jira-capture-core.mjs` | `execution`, § 10 | `0cc8e50d0a11bd85a6e2c4fc8aaf82df3426720a753bd0ebd96d915cacf82007` |
| `scripts/jira-capture-app.mjs` | `interface`, § 8 | `02ffc1ae5d4cffc2c45e7f0112701564c5f36e00435e53194e49712e5e57c439` |
| `scripts/public/capture.html` | `interface`, § 8 | `0a42f8ad4f4c21bb4d8e9f3f15d437e9622e63fab1d23971d3fdf38a3b98c25a` |
| `scripts/jira-capture-mhtml.mjs` | `interface`, § 8 | `1aa5f7399a3e19d7a52bb10bec6ce3e3c66162521ff3941a6d32837176763d5c` |
| `agent/capteur-sprint.md` | `agent`, § 7 | `9843d0625310719470f4bb352de2d9c9d7ee1e64417582aac3bbd640267a7a76` |
| `scripts/jira-sprint-app.mjs` | `export-api`, § 6 | `14005092304d4d368c869d7ee801ca922529848325255054768e86f37c418ea8` |
| `scripts/public/index.html` | `export-api`, § 6 | `f69c6d601212d9a7e746181957a8c281f00a3d42decd488de25c54fdbb8abd91` |
| `scripts/jira_sprint_export.py` | `export-api`, § 6 | `60b6953199cbc21443572212fee36de21adc4522e86feb2215f38ba474b91782` |
| `tests/fake-jira.mjs` | `recette`, § 6 | `eb8de8e8bb1b46ad5a4c6e83cd6f8acdd812a494b8559d017d87b93907d4f83d` |
| `tests/run-tests.mjs` | `recette`, § 6 | `ba49ae2373b8e1ae2049ff7e4ec88ff405adb53136d6fd6227e0ac0e57149273` |

Depuis le dossier du skill, cette commande d'une ligne écrit les treize fichiers, compare leurs empreintes à celles du tableau et sort avec le code 1 au moindre écart ou à la moindre absence. Elle ne contient ni `$`, ni accent grave, ni `!`, ni `%`, ni guillemet intérieur : elle se colle telle quelle dans bash, zsh, CMD ou PowerShell, et dans un fichier `.cmd`. Elle lit aussi des modules aux fins de ligne CRLF.

```text
node -e "const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'); const attendu = { 'package.json': 'd3784c1e36eb0ca8724d6643b20ac9570e2af3c0019033d460b6cb12abfe2927', 'package-lock.json': 'b3f53e6ed11bb366196541eb86f28bdf103637536177706072f902e989a2a7f8', '.gitignore': 'b163b109241838c4ff48e7cc27de427a4fb4e7f9aebdb16c8a5ad3fbb7a02613', 'scripts/jira-capture-core.mjs': '0cc8e50d0a11bd85a6e2c4fc8aaf82df3426720a753bd0ebd96d915cacf82007', 'scripts/jira-capture-app.mjs': '02ffc1ae5d4cffc2c45e7f0112701564c5f36e00435e53194e49712e5e57c439', 'scripts/public/capture.html': '0a42f8ad4f4c21bb4d8e9f3f15d437e9622e63fab1d23971d3fdf38a3b98c25a', 'scripts/jira-capture-mhtml.mjs': '1aa5f7399a3e19d7a52bb10bec6ce3e3c66162521ff3941a6d32837176763d5c', 'agent/capteur-sprint.md': '9843d0625310719470f4bb352de2d9c9d7ee1e64417582aac3bbd640267a7a76', 'scripts/jira-sprint-app.mjs': '14005092304d4d368c869d7ee801ca922529848325255054768e86f37c418ea8', 'scripts/public/index.html': 'f69c6d601212d9a7e746181957a8c281f00a3d42decd488de25c54fdbb8abd91', 'scripts/jira_sprint_export.py': '60b6953199cbc21443572212fee36de21adc4522e86feb2215f38ba474b91782', 'tests/fake-jira.mjs': 'eb8de8e8bb1b46ad5a4c6e83cd6f8acdd812a494b8559d017d87b93907d4f83d', 'tests/run-tests.mjs': 'ba49ae2373b8e1ae2049ff7e4ec88ff405adb53136d6fd6227e0ac0e57149273' }; const vus = new Set(); let ecarts = 0; for (const module of ['modules/execution/SKILL.md', 'modules/interface/SKILL.md', 'modules/agent/SKILL.md', 'modules/export-api/SKILL.md', 'modules/recette/SKILL.md']) { const texte = fs.readFileSync(module, 'utf8').replace(/\r\n/g, '\n'); for (const m of texte.matchAll(/^<\x21-- fichier : (\S+) -->\n\x60{3}[a-z]*\n([\s\S]*?)\n\x60{3}\n/gm)) { const contenu = m[2] + '\n'; fs.mkdirSync(path.dirname(m[1]), { recursive: true }); fs.writeFileSync(m[1], contenu); vus.add(m[1]); const conforme = crypto.createHash('sha256').update(contenu).digest('hex') === attendu[m[1]]; if (conforme === false) ecarts++; console.log((conforme ? 'conforme  ' : 'ECART     ') + m[1]); } } for (const f of Object.keys(attendu)) { if (vus.has(f) === false) { ecarts++; console.log('ABSENT    ' + f); } } if (ecarts > 0) process.exitCode = 1;"
```

Puis, depuis le même dossier :

```bash
npm ci
npm test
```

## 9. Paquet et fichiers de travail

`package.json` déclare la dépendance unique et les commandes du § 1 ; `package-lock.json` en fixe la version ; `.gitignore` écarte les fichiers de travail (§ 3).

<!-- fichier : package.json -->
```json
{
  "name": "capture-sprint-jira",
  "version": "1.2.1",
  "private": true,
  "description": "Capture en MHTML des tickets d'un sprint Jira derrière un SSO, rangés par catégorie (skill capture-sprint-jira)",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "capture": "node scripts/jira-capture-app.mjs",
    "capture:cli": "node scripts/jira-capture-mhtml.mjs",
    "export": "node scripts/jira-sprint-app.mjs",
    "test": "node tests/run-tests.mjs"
  },
  "dependencies": {
    "playwright-core": "1.63.0"
  }
}
```

<!-- fichier : package-lock.json -->
```json
{
  "name": "capture-sprint-jira",
  "version": "1.2.1",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "capture-sprint-jira",
      "version": "1.2.1",
      "dependencies": {
        "playwright-core": "1.63.0"
      },
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/playwright-core": {
      "version": "1.63.0",
      "resolved": "https://registry.npmjs.org/playwright-core/-/playwright-core-1.63.0.tgz",
      "integrity": "sha512-rYCsBF/M5HjUch52bbtVONEFjv6Xu8sm8h72dNlR5bzIE1fvC/bxgspzkjSfU+MweEMmPM8KJebG6nnyxo5mCg==",
      "license": "Apache-2.0",
      "bin": {
        "playwright-core": "cli.js"
      },
      "engines": {
        "node": ">=20"
      }
    }
  }
}
```

<!-- fichier : .gitignore -->
```gitignore
# Fichiers de travail du skill capture-sprint-jira : session SSO, tickets capturés ou exportés.
# Ils ne vont jamais dans un dépôt.
node_modules/
.jira-profile/
mhtml/
exports/
*.mhtml
```

## 10. Module commun `scripts/jira-capture-core.mjs`

Le module commun porte tout ce que font la capture et le classement ; l'interface et la ligne de commande l'appellent (E2). Ses fonctions exportées :

| Fonction | Rôle | Module |
|---|---|---|
| `launchBrowser()`, `browserChannel()`, `profileDir()`, `ensureUsableWindow()` | fenêtre visible sur le profil dédié, agrandie si elle est trop petite pour le relevé | `session`, `releve` |
| `loadAllTickets(page, { categories })`, `parseFilter()`, `matchesFilter()` | relevé des liens et de leur section, filtre | `releve` |
| `captureTicket()`, `captureMhtml()`, `pageTimeoutMs()` | capture d'une page de ticket | `capture` |
| `addSectionLinks()`, `sectionWarnings()`, `parseCategories()`, `normalizeText()` | sections, avertissements, catégories | `classement` |
| `captureSprintTickets(context, page, options)` | capture complète d'un sprint, rapport | `classement` |
| `captureSingleTicket()`, `proposedFolder()`, `parseTicketUrl()` | capture d'un ticket seul par son adresse, dossier proposé | `ticket` |
| `outputFolder()` | dossier de sortie saisi | `interface` |

<!-- fichier : scripts/jira-capture-core.mjs -->
```javascript
// jira-capture-core.mjs : capture en MHTML des tickets d'un sprint Jira protégé par un SSO (skill capture-sprint-jira).
// Le navigateur s'ouvre sur un profil dédié ; l'utilisateur s'y connecte lui-même (SSO, MFA) : aucun identifiant ne
// passe par ce module. Sur la page du sprint, chaque lien /browse/<CLÉ> retenu par le filtre (préfixe, numéros) prend
// la catégorie de sa section : l'en-tête (IA, DEV…) qui le précède sur la page. La page du ticket est enregistrée en
// MHTML dans le dossier de cette catégorie. Module commun à jira-capture-app.mjs (interface) et à
// jira-capture-mhtml.mjs (ligne de commande). Un ticket se capture aussi seul, par son adresse, dans le dossier
// que choisit le développeur.
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

/** Dossier du skill (parent de scripts/) : base des chemins relatifs saisis dans l'interface. */
export const SKILL_DIR = fileURLToPath(new URL('..', import.meta.url));

/** Dossier des captures par défaut, écarté par le .gitignore du skill. */
export const DEFAULT_OUT_DIR = join(SKILL_DIR, 'mhtml');

/** Catégories par défaut : texte des en-têtes de section de la page du sprint, et noms de leurs dossiers. */
export const DEFAULT_CATEGORIES = ['IA', 'DEV'];

/** Dossier des tickets qu'aucun en-tête de catégorie ne précède sur la page du sprint. */
export const UNCLASSIFIED = 'à classer';

/** Arrêt de la capture après ce nombre d'échecs consécutifs : le plus souvent, la session SSO a expiré. */
export const MAX_FAILURES_IN_ROW = 3;

/** Profil du navigateur dédié à Jira, qui garde la session SSO ; JIRA_CAPTURE_PROFILE pour un autre dossier. */
export const profileDir = (env = process.env) => resolve(SKILL_DIR, env.JIRA_CAPTURE_PROFILE || '.jira-profile');

/** Délai d'affichage d'une page de ticket, 20 s par défaut ; JIRA_CAPTURE_PAGE_TIMEOUT_MS pour un Jira lent. */
export const pageTimeoutMs = (env = process.env) => Number(env.JIRA_CAPTURE_PAGE_TIMEOUT_MS) || 20_000;

export const firstLine = (err) => String(err?.message ?? err).split('\n')[0];

// ---------------------------------------------------------------------------------------------
// Navigateur
// ---------------------------------------------------------------------------------------------

/**
 * Canal du navigateur : Chrome installé sur le poste par défaut ; JIRA_CAPTURE_CHANNEL=msedge pour Edge,
 * ou chromium pour le Chromium de Playwright (npx playwright-core install chromium).
 */
export function browserChannel(env = process.env) {
  const channel = String(env.JIRA_CAPTURE_CHANNEL ?? '').trim() || 'chrome';
  return channel === 'chromium' ? undefined : channel;
}

/**
 * Ouvre une fenêtre visible sur le profil dédié : la connexion SSO s'y fait à la main. La fenêtre s'ouvre en
 * 1280 × 900, quelle que soit la taille qu'elle avait gardée, ou l'écran (sans écran réel, elle peut s'ouvrir
 * minuscule) ; le développeur peut ensuite la redimensionner.
 */
export function launchBrowser() {
  return chromium.launchPersistentContext(profileDir(), {
    channel: browserChannel(),
    headless: false,
    viewport: null, // la page prend la taille de la fenêtre
    args: ['--window-size=1280,900'],
  });
}

/** Dossier de sortie saisi : relatif au dossier du skill s'il n'est pas absolu, mhtml/ s'il est vide. */
export const outputFolder = (raw, base = SKILL_DIR) => resolve(base, String(raw ?? '').trim() || 'mhtml');

// ---------------------------------------------------------------------------------------------
// Filtre et catégories
// ---------------------------------------------------------------------------------------------

/** Lit le filtre { prefix, min, max } ; vides, ils ne filtrent rien. Lève une erreur si une valeur est invalide. */
export function parseFilter({ prefix, min, max } = {}) {
  const p = String(prefix ?? '').trim().toUpperCase();
  if (p && !/^[A-Z][A-Z0-9_]*$/.test(p)) throw new Error(`Préfixe invalide : « ${prefix} » (lettres, chiffres et _, en commençant par une lettre)`);
  const number = (value, label) => {
    const s = String(value ?? '').trim();
    if (!s) return null;
    if (!/^\d{1,9}$/.test(s)) throw new Error(`${label} invalide : « ${value} »`);
    return Number(s);
  };
  const lo = number(min, 'Numéro minimal');
  const hi = number(max, 'Numéro maximal');
  if (lo !== null && hi !== null && lo > hi) throw new Error(`Numéros : ${lo} est plus grand que ${hi}`);
  return { prefix: p, min: lo, max: hi };
}

/** Le ticket `key` (PROJET-NUMÉRO) passe-t-il le filtre ? Le préfixe porte sur la partie PROJET. */
export function matchesFilter(key, { prefix = '', min = null, max = null } = {}) {
  const m = String(key).toUpperCase().match(/^([A-Z][A-Z0-9_]*)-(\d+)$/);
  if (!m) return false;
  const n = Number(m[2]);
  return m[1].startsWith(prefix) && (min === null || n >= min) && (max === null || n <= max);
}

const keyParts = (key) => {
  const m = key.match(/^(.*)-(\d+)$/);
  return [Number(m[2]), m[1]];
};
/** Tri par numéro, puis par projet. */
const byNumber = (a, b) => {
  const [na, pa] = keyParts(a.key);
  const [nb, pb] = keyParts(b.key);
  return na - nb || (pa < pb ? -1 : pa > pb ? 1 : 0);
};

/** Minuscules, sans accents, séparateurs (blancs, _ et -) réduits à une espace. */
export const normalizeText = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[\s_-]+/g, ' ').trim();

// Interdit dans un nom de dossier sous Windows ou Linux
const BAD_FOLDER_NAME = /[<>:"/\\|?*\u0000-\u001f]/;

/**
 * Lit les catégories (liste, ou texte à une catégorie par ligne ou séparées par « ; ») : chacune est le texte d'un
 * en-tête de section de la page du sprint, et le nom de son dossier.
 */
export function parseCategories(raw = DEFAULT_CATEGORIES) {
  const list = (Array.isArray(raw) ? raw : String(raw ?? '').split(/\r?\n|;/))
    .map((c) => String(c).trim().replace(/\s+/g, ' ')).filter(Boolean);
  if (!list.length) throw new Error('Indiquez au moins une catégorie');
  if (list.length > 10) throw new Error('10 catégories au plus');
  for (const c of list) {
    if (c.length > 60 || BAD_FOLDER_NAME.test(c) || /^\.|\.$/.test(c)) {
      throw new Error(`Catégorie « ${c} » : 60 caractères au plus, sans < > : " / \\ | ? * ni point au début ou à la fin`);
    }
  }
  const keys = list.map(normalizeText);
  if (new Set(keys).size !== keys.length) throw new Error('Catégories en double');
  if (keys.includes(normalizeText(UNCLASSIFIED))) throw new Error(`« ${UNCLASSIFIED} » est réservé aux tickets sans catégorie`);
  return list;
}

/**
 * Avertissements sur les sections de la page du sprint, d'après les en-têtes comptés au relevé (`markers`) : une
 * catégorie dont aucun en-tête n'est suivi de tickets (la section porte-t-elle un autre nom ?), ou dont plusieurs le
 * sont (une étiquette de carte porte peut-être ce nom). Rend une liste de phrases, vide si chaque catégorie ouvre
 * une seule section.
 */
export function sectionWarnings({ categories = [], markers = {}, listed = 0 } = {}) {
  const notes = [];
  for (const c of categories) {
    const n = markers[c] ?? 0;
    if (n === 0 && listed > 0) notes.push(`Aucun en-tête « ${c} » suivi de tickets sur la page du sprint : vérifiez que la section porte ce nom.`);
    if (n > 1) notes.push(`« ${c} » précède ${n} groupes de tickets sur la page du sprint : une étiquette de carte porte peut-être ce nom ; vérifiez le classement dans rapport.json.`);
  }
  return notes;
}

// ---------------------------------------------------------------------------------------------
// Page du sprint
// ---------------------------------------------------------------------------------------------

/**
 * Un pas de défilement, exécuté dans la page : la fenêtre, si elle défile, et chaque bloc qui défile avancent de
 * 80 % de leur hauteur visible, si bien qu'aucune carte n'est sautée, même dans une petite fenêtre. Avec
 * `withLinks`, seuls comptent les blocs qui contiennent un lien de ticket, quelle que soit leur hauteur ; sans,
 * les blocs de 100 pixels de haut au moins. Chaque défilement est aussi signalé à la page par un événement
 * `scroll` : une page qui ne rend pas d'image (premier lancement lent, fenêtre masquée) ne l'émettrait pas, et une
 * liste chargée au défilement ne chargerait pas la suite. Rend true si l'un des blocs a bougé.
 */
function scrollStep(withLinks) {
  const root = document.scrollingElement ?? document.documentElement;
  const scrolls = (el) => el.scrollHeight > el.clientHeight + 1 && (el === root || /(auto|scroll|overlay)/.test(getComputedStyle(el).overflowY));
  const targets = scrolls(root) ? [root] : [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.clientHeight < (withLinks ? 1 : 100) || !scrolls(el)) continue;
    if (withLinks && !el.querySelector('a[href*="/browse/"]')) continue;
    targets.push(el);
  }
  let moved = false;
  for (const el of targets) {
    const before = el.scrollTop;
    el.scrollTop = before + Math.max(80, Math.round(el.clientHeight * 0.8));
    if (el.scrollTop === before) continue;
    moved = true;
    (el === root ? document : el).dispatchEvent(new Event('scroll', { bubbles: el === root }));
  }
  return moved;
}

async function scrollToTop(page, pauseMs) {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    for (const el of document.querySelectorAll('*')) if (el.scrollTop > 0) el.scrollTop = 0;
  });
  await page.waitForTimeout(pauseMs);
}

/**
 * Liens des tickets présents dans la page, hors navigation (menus, éléments récents), dans l'ordre de la page, une
 * entrée par clé, adresse ramenée à …/browse/<CLÉ>, chacun avec sa section.
 *   En-tête : élément visible dont tout le texte est le nom d'une catégorie, hors navigation et hors lien de ticket.
 *   Bloc d'un en-tête : son plus haut ancêtre qui ne contient ni autre en-tête, ni ticket placé avant lui. S'il
 *   contient des tickets (couloir, sprint), la section est ce bloc, et un ticket placé après lui, hors de tout
 *   bloc, n'a pas de section. Sinon (liste plate), la section va de l'en-tête jusqu'au suivant, dans l'ordre de
 *   la page.
 * Un ticket qu'aucun en-tête présent ne précède est dit ouvert : sa section est peut-être sortie de la page
 * (liste virtualisée). Compte aussi, par catégorie, les en-têtes suivis d'au moins un ticket : un filtre rapide
 * nommé comme une catégorie, en haut de la page, ne compte pas.
 * Rend { links: [{ key, url, section, excerpt, open }], markers: { <catégorie>: n } }.
 */
const sprintLinks = (page, categories) => page.evaluate((cats) => {
  const NAV = 'nav, header, aside, [role="navigation"], [role="banner"]';
  const SKIP = /^(?:SCRIPT|STYLE|NOSCRIPT|TEMPLATE|TITLE|OPTION)$/;
  const TICKET = 'a[href*="/browse/"]';
  const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[\s_-]+/g, ' ').trim();
  const visible = (el) => (el.checkVisibility ? el.checkVisibility() : el.offsetParent !== null);
  const byName = new Map(cats.map((c) => [norm(c), c]));
  const heads = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const el = walker.currentNode.parentElement;
    const cat = byName.get(norm(walker.currentNode.nodeValue));
    if (!cat || !el || SKIP.test(el.tagName) || norm(el.textContent) !== norm(cat)) continue;
    if (el.closest(NAV) || el.closest(TICKET) || !visible(el)) continue;
    const line = (el.parentElement ?? el).innerText.replace(/\s+/g, ' ').trim();
    heads.push({ el, cat, excerpt: line.length > 80 ? `${line.slice(0, 80)}…` : line });
  }
  const precedes = (node, el) => Boolean(node && node.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
  for (const head of heads) {
    let box = head.el;
    for (let up = box.parentElement; up && up !== document.body; up = up.parentElement) {
      if (heads.some((o) => o !== head && up.contains(o.el)) || precedes(up.querySelector(TICKET), head.el)) break;
      box = up;
    }
    head.box = box.querySelector(TICKET) ? box : null;
  }
  const links = new Map();
  const used = new Set(); // en-têtes suivis d'un ticket
  let h = -1; // dernier en-tête qui précède le lien courant
  for (const a of document.querySelectorAll(TICKET)) {
    while (h + 1 < heads.length && (heads[h + 1].el.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING)) h++;
    if (a.closest(NAV)) continue;
    const m = (a.getAttribute('href') ?? '').match(/^(.*?\/browse\/)([A-Za-z][A-Za-z0-9_]*-\d+)/);
    if (!m) continue;
    const key = m[2].toUpperCase();
    const head = heads.find((x) => x.box?.contains(a)) ?? (h >= 0 && !heads[h].box ? heads[h] : null);
    if (head) used.add(head);
    if (!links.has(key)) {
      links.set(key, {
        key, url: new URL(m[1] + key, document.baseURI).href,
        section: head?.cat ?? null, excerpt: head?.excerpt ?? null, open: !head && h < 0,
      });
    }
  }
  const markers = Object.fromEntries(cats.map((c) => [c, 0]));
  for (const head of used) markers[head.cat]++;
  return { links: [...links.values()], markers };
}, categories);

/**
 * Ajoute à `seen` (Map clé → lien) les liens d'un pas de défilement, dans l'ordre de la page. Un lien ouvert, qu'aucun
 * en-tête présent ne précède, prend la section où s'arrêtait le pas précédent, `carry` : une liste virtualisée retire
 * de la page l'en-tête d'une section dès qu'il sort de l'écran. Une clé déjà relevée garde sa section. Rend la
 * section du dernier lien du pas, { section, excerpt }, à reporter au pas suivant.
 */
export function addSectionLinks(seen, links, carry = { section: null, excerpt: null }) {
  let last = carry;
  for (const l of links) {
    const resolved = l.open ? carry : { section: l.section ?? null, excerpt: l.excerpt ?? null };
    if (!seen.has(l.key)) seen.set(l.key, { key: l.key, url: l.url, ...resolved });
    last = resolved;
  }
  return last;
}

/**
 * Fait défiler la page jusqu'à ce que, `stableSteps` pas de suite, elle ne défile plus et qu'aucun ticket nouveau
 * n'apparaisse : le bas est atteint et plus rien ne s'y charge. Revient ensuite en haut. Les liens et leurs sections
 * sont relevés à chaque pas : un affichage virtualisé, qui retire de la page les cartes et les en-têtes sortis de
 * l'écran, ne fait donc perdre ni ticket ni section. Rend { links: [{ key, url, section, excerpt }], markers }, où
 * markers donne, pour chaque catégorie, le plus grand nombre de ses en-têtes suivis d'un ticket vus à la fois.
 */
export async function loadAllTickets(page, { categories = DEFAULT_CATEGORIES, pauseMs = 700, maxSteps = 150, stableSteps = 4 } = {}) {
  // Une image rendue d'abord : au premier lancement, sans écran réel, le rendu peut tarder ; 5 s au plus
  await page.evaluate(() => new Promise((done) => { requestAnimationFrame(() => done()); setTimeout(done, 5000); })).catch(() => {});
  const seen = new Map();
  const markers = Object.fromEntries(categories.map((c) => [c, 0]));
  let carry;
  const add = async () => {
    const step = await sprintLinks(page, categories);
    for (const c of categories) markers[c] = Math.max(markers[c], step.markers[c]);
    carry = addSectionLinks(seen, step.links, carry);
  };
  await add();
  for (let i = 0, stable = 0; i < maxSteps && stable < stableSteps; i++) {
    const moved = await page.evaluate(scrollStep, true);
    await page.waitForTimeout(pauseMs);
    const before = seen.size;
    await add();
    stable = seen.size === before && !moved ? stable + 1 : 0;
  }
  await scrollToTop(page, pauseMs);
  return { links: [...seen.values()], markers };
}

/**
 * Fenêtre trop petite pour afficher la liste du sprint : sans écran réel, la première fenêtre s'ouvre parfois presque
 * sans hauteur, et une liste sans hauteur ne défile pas. Elle est alors remise à 1280 × 900. Une fenêtre déjà assez
 * grande n'est pas touchée. Rend true si la fenêtre a été agrandie.
 */
export async function ensureUsableWindow(context, page, { min = 300 } = {}) {
  const [width, height] = await page.evaluate(() => [innerWidth, innerHeight]);
  if (width >= min && height >= min) return false;
  const cdp = await context.newCDPSession(page);
  try {
    const { windowId } = await cdp.send('Browser.getWindowForTarget');
    await cdp.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } });
    await cdp.send('Browser.setWindowBounds', { windowId, bounds: { width: 1280, height: 900 } });
  } finally {
    await cdp.detach().catch(() => {});
  }
  await page.waitForTimeout(500);
  return true;
}

/** Instantané MHTML de la page, comme « Enregistrer sous… », format « Page Web, un seul fichier ». */
export async function captureMhtml(context, page) {
  const cdp = await context.newCDPSession(page);
  try {
    const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
    return data;
  } finally {
    await cdp.detach().catch(() => {});
  }
}

// ---------------------------------------------------------------------------------------------
// Pages des tickets
// ---------------------------------------------------------------------------------------------

/**
 * Attend que la page soit celle du ticket (adresse …/browse/<CLÉ> ou titre qui la contient) et que la clé
 * soit affichée. Les navigations en cours, comme un aller-retour par le SSO, sont tolérées.
 */
async function waitForTicket(page, key, timeoutMs) {
  const end = Date.now() + timeoutMs;
  for (;;) {
    const ok = await page.evaluate((k) => {
      const onTicket = new RegExp(`/BROWSE/${k}(?![0-9])`).test(location.href.toUpperCase()) || document.title.toUpperCase().includes(k);
      return onTicket && (document.body?.innerText ?? '').toUpperCase().includes(k);
    }, key).catch(() => false);
    if (ok) return true;
    if (Date.now() >= end) return false;
    await page.waitForTimeout(400);
  }
}

/**
 * Fait défiler la page jusqu'en bas, tant que son texte s'allonge (commentaires chargés à l'affichage) : elle
 * s'arrête quand, `stableSteps` pas de suite, rien ne défile ni ne s'ajoute. Revient ensuite en haut.
 */
async function scrollThrough(page, { pauseMs = 500, maxSteps = 40, stableSteps = 2 } = {}) {
  const length = () => page.evaluate(() => document.body?.innerText.length ?? 0);
  let last = await length();
  for (let i = 0, stable = 0; i < maxSteps && stable < stableSteps; i++) {
    const moved = await page.evaluate(scrollStep, false);
    await page.waitForTimeout(pauseMs);
    const now = await length();
    stable = now === last && !moved ? stable + 1 : 0;
    last = now;
  }
  await scrollToTop(page, pauseMs);
}

/** Attend que le texte de la page ne change plus (deux relevés identiques), 10 s au plus. */
async function waitForStableText(page, { pauseMs = 500, maxMs = 10_000 } = {}) {
  const end = Date.now() + maxMs;
  let last = -1;
  for (let stable = 0; stable < 2 && Date.now() < end;) {
    const now = await page.evaluate(() => document.body?.innerText.length ?? 0).catch(() => -1);
    stable = now === last ? stable + 1 : 0;
    last = now;
    await page.waitForTimeout(pauseMs);
  }
}

/**
 * Ouvre la page du ticket, la charge en entier et la capture : rend { data }, le MHTML. L'appel échoue aussitôt si
 * la page ou le navigateur se ferment pendant ce temps, et au plus tard après `maxMs` (le délai d'affichage plus
 * deux minutes, par défaut) : un appel au navigateur pourrait sinon ne jamais aboutir, et la capture resterait en
 * cours sans fin.
 */
export async function captureTicket(context, page, ticket, options = {}) {
  if (page.isClosed()) throw new Error('navigateur fermé');
  const maxMs = options.maxMs ?? (options.timeoutMs ?? pageTimeoutMs()) + 120_000;
  let stop;
  let timer;
  const stopped = new Promise((_, reject) => {
    stop = () => reject(new Error('navigateur fermé pendant la capture'));
    page.once('close', stop);
    context.once?.('close', stop);
    timer = setTimeout(() => reject(new Error(`capture du ticket bloquée, abandonnée après ${Math.round(maxMs / 1000)} s`)), maxMs);
  });
  try {
    return await Promise.race([loadAndCapture(context, page, ticket, options), stopped]);
  } finally {
    clearTimeout(timer);
    page.off('close', stop);
    context.off?.('close', stop);
  }
}

async function loadAndCapture(context, page, { key, url }, { timeoutMs = pageTimeoutMs() } = {}) {
  let navError = null;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 }).catch((err) => { navError = err; });
  if (!(await waitForTicket(page, key, timeoutMs))) {
    throw new Error(navError
      ? `ouverture impossible (${firstLine(navError)})`
      : `page du ticket non affichée après ${timeoutMs / 1000} s (session SSO expirée ?)`);
  }
  await scrollThrough(page);
  await waitForStableText(page);
  return { data: await captureMhtml(context, page) };
}

// ---------------------------------------------------------------------------------------------
// Capture d'un sprint
// ---------------------------------------------------------------------------------------------

/**
 * Écrit le MHTML d'un ticket dans `folder`/`dir`, et retire sa copie d'un autre des dossiers `folders` (capture
 * précédente, rangée ailleurs). Rend la liste des dossiers d'où une copie a été retirée.
 */
async function storeTicket(folder, folders, dir, key, data) {
  await mkdir(join(folder, dir), { recursive: true });
  await writeFile(join(folder, dir, `${key}.mhtml`), data);
  const movedFrom = [];
  for (const other of folders) {
    const old = join(folder, other, `${key}.mhtml`);
    if (other !== dir && existsSync(old)) {
      await rm(old, { force: true });
      movedFrom.push(other);
    }
  }
  return movedFrom;
}

/**
 * Capture les tickets de la page du sprint affichée dans `page`, directement dans `folder` :
 *   <catégorie>/<CLÉ>.mhtml   un fichier par ticket retenu, dans le dossier de la section où il figure
 *   à classer/<CLÉ>.mhtml     aucun en-tête de catégorie ne le précède sur la page du sprint
 *   sprint.mhtml              la page du sprint, d'où viennent les liens et les sections
 *   rapport.json              filtre, catégories, en-têtes vus, et pour chaque ticket : catégorie, en-tête ou erreur
 * Une nouvelle capture d'un ticket remplace son fichier et retire sa copie d'un autre dossier de catégorie ;
 * un ticket en erreur garde sa capture précédente. onProgress({ step, done, total, key }) suit l'avancement.
 * Rend le rapport.
 */
export async function captureSprintTickets(context, page, {
  folder = DEFAULT_OUT_DIR, filter = {}, categories = DEFAULT_CATEGORIES, now = new Date(),
  onProgress = () => {}, timeoutMs = pageTimeoutMs(),
} = {}) {
  onProgress({ step: 'liste', done: 0, total: 0, key: null });
  const sprintUrl = page.url();
  await page.bringToFront().catch(() => {}); // la fenêtre du sprint passe devant : le développeur suit la capture
  await ensureUsableWindow(context, page);
  const list = await loadAllTickets(page, { categories });
  await mkdir(folder, { recursive: true });
  await writeFile(join(folder, 'sprint.mhtml'), await captureMhtml(context, page));

  const selected = list.links.filter((l) => matchesFilter(l.key, filter)).sort(byNumber);
  const ignored = list.links.filter((l) => !matchesFilter(l.key, filter)).map((l) => l.key);
  const folders = [...categories, UNCLASSIFIED];
  const tickets = [];
  let failuresInRow = 0;
  let aborted = false;
  for (const [i, ticket] of selected.entries()) {
    onProgress({ step: 'tickets', done: i, total: selected.length, key: ticket.key });
    try {
      const { data } = await captureTicket(context, page, ticket, { timeoutMs });
      const dir = ticket.section ?? UNCLASSIFIED;
      const movedFrom = await storeTicket(folder, folders, dir, ticket.key, data);
      tickets.push({
        key: ticket.key, url: ticket.url, category: ticket.section, found: ticket.section ? [ticket.section] : [],
        where: ticket.section ? 'section du sprint' : null, excerpt: ticket.excerpt, file: `${dir}/${ticket.key}.mhtml`, movedFrom,
      });
      failuresInRow = 0;
    } catch (err) {
      tickets.push({ key: ticket.key, url: ticket.url, category: null, error: firstLine(err) });
      failuresInRow++;
      if (page.isClosed() || failuresInRow >= MAX_FAILURES_IN_ROW) {
        aborted = i + 1 < selected.length;
        break;
      }
    }
  }

  const counts = Object.fromEntries(folders.map((c) => [c, 0]));
  let errors = 0;
  for (const t of tickets) {
    if (t.error) errors++;
    else counts[t.category ?? UNCLASSIFIED]++;
  }
  const report = {
    date: now.toISOString(), sprintUrl, folder, filter, categories, markers: list.markers,
    listed: list.links.length, selected: selected.length, ignored: ignored.length, ignoredSample: ignored.slice(0, 20),
    counts, errors, aborted, tickets,
  };
  await writeFile(join(folder, 'rapport.json'), `${JSON.stringify(report, null, 2)}\n`);
  onProgress({ step: 'fin', done: tickets.length, total: selected.length, key: null });
  return report;
}

// ---------------------------------------------------------------------------------------------
// Un ticket seul, par son adresse
// ---------------------------------------------------------------------------------------------

/** Clé et adresse ramenée à …/browse/<CLÉ> d'une adresse de ticket ; erreur si l'adresse n'en contient pas. */
export function parseTicketUrl(raw) {
  let u;
  try {
    u = new URL(String(raw ?? '').trim());
  } catch {
    throw new Error("Adresse de ticket invalide : …/browse/<CLÉ> attendu");
  }
  const m = ['http:', 'https:'].includes(u.protocol) && u.pathname.match(/^(.*\/browse\/)([A-Za-z][A-Za-z0-9_]*-\d+)\/?$/);
  if (!m) throw new Error("Adresse de ticket invalide : …/browse/<CLÉ> attendu");
  const key = m[2].toUpperCase();
  return { key, url: new URL(m[1] + key, u).href };
}

/** Lit rapport.json dans `folder` ; null s'il manque ou est illisible. */
async function readReport(folder) {
  try {
    return JSON.parse(await readFile(join(folder, 'rapport.json'), 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Dossier proposé pour un ticket capturé seul : celui où le range le dernier rapport.json de `folder`, s'il y figure
 * sans erreur, et si ce dossier est encore une des `categories` (ou « à classer ») ; sinon « à classer ».
 * Rend { key, folder, known } : known dit si le ticket figure dans le rapport.
 */
export async function proposedFolder(folder, rawUrl, categories = DEFAULT_CATEGORIES) {
  const { key } = parseTicketUrl(rawUrl);
  const entry = (await readReport(folder))?.tickets?.find((t) => t.key === key && !t.error);
  const dir = entry ? (entry.category ?? UNCLASSIFIED) : UNCLASSIFIED;
  return { key, folder: [...categories, UNCLASSIFIED].includes(dir) ? dir : UNCLASSIFIED, known: Boolean(entry) };
}

/**
 * Capture un ticket seul, par son adresse, dans la session ouverte : mêmes attentes et même MHTML que dans la capture
 * d'un sprint (captureTicket). Le fichier va dans `folder`/`category`, une des `categories` ou « à classer », choisi
 * par le développeur ; une copie rangée dans un autre dossier est retirée. L'entrée du ticket dans rapport.json est
 * remplacée ou ajoutée, et les décomptes recalculés ; sans rapport, un rapport à ce seul ticket est créé. En cas
 * d'erreur, rien n'est écrit. La page revient ensuite à l'adresse où elle était. Rend l'entrée du ticket.
 */
export async function captureSingleTicket(context, page, {
  url, folder = DEFAULT_OUT_DIR, category = UNCLASSIFIED, categories = DEFAULT_CATEGORIES, now = new Date(),
  timeoutMs = pageTimeoutMs(),
} = {}) {
  const ticket = parseTicketUrl(url);
  const folders = [...categories, UNCLASSIFIED];
  const dir = String(category ?? '').trim() || UNCLASSIFIED;
  if (!folders.includes(dir)) throw new Error(`Dossier « ${dir} » : une des catégories ou « ${UNCLASSIFIED} » attendu`);
  const back = page.url();
  try {
    const { data } = await captureTicket(context, page, ticket, { timeoutMs });
    const movedFrom = await storeTicket(folder, folders, dir, ticket.key, data);
    const chosen = dir === UNCLASSIFIED ? null : dir;
    const entry = {
      key: ticket.key, url: ticket.url, category: chosen, found: chosen ? [chosen] : [],
      where: chosen ? 'choisi par le développeur' : null, excerpt: null, file: `${dir}/${ticket.key}.mhtml`, movedFrom,
    };
    const report = (await readReport(folder)) ?? {
      date: now.toISOString(), sprintUrl: null, folder, filter: { prefix: '', min: null, max: null }, categories,
      markers: Object.fromEntries(categories.map((c) => [c, 0])), listed: 0, selected: 0, ignored: 0, ignoredSample: [],
      counts: {}, errors: 0, aborted: false, tickets: [],
    };
    const i = report.tickets.findIndex((t) => t.key === ticket.key);
    if (i >= 0) report.tickets[i] = entry;
    else {
      report.tickets.push(entry);
      report.selected += 1;
    }
    const counts = Object.fromEntries([...new Set([...(report.categories ?? []), ...folders])].map((c) => [c, 0]));
    for (const t of report.tickets) if (!t.error) counts[t.category ?? UNCLASSIFIED] = (counts[t.category ?? UNCLASSIFIED] ?? 0) + 1;
    report.counts = counts;
    report.errors = report.tickets.filter((t) => t.error).length;
    await writeFile(join(folder, 'rapport.json'), `${JSON.stringify(report, null, 2)}\n`);
    return entry;
  } finally {
    if (!page.isClosed() && back && back !== page.url()) {
      await page.goto(back, { waitUntil: 'domcontentloaded', timeout: 60_000 }).catch(() => {});
    }
  }
}
```
