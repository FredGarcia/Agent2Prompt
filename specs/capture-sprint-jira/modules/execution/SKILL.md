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
| `npm run capture:cli -- "<page du sprint>" [options]` | capture en ligne de commande | `interface` |
| `npm run export` | export par l'API, sur http://127.0.0.1:3000 | `export-api` |
| `python3 scripts/jira_sprint_export.py --board <tableau>` | export par l'API, en Python (sous Windows : `py`) | `export-api` |
| `npm test` | recette, 19 scénarios contre un faux Jira local | `recette` |

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
| `package.json` | `execution`, § 9 | `7493a4af4ad23c1e13b92c66ba242c9bca40b3be0f9ba8ab77434c924306eb77` |
| `package-lock.json` | `execution`, § 9 | `80d7bb928817d7ca7ba7600b5292371ad49fa95d25c5af0316766f2a675c788a` |
| `.gitignore` | `execution`, § 9 | `b163b109241838c4ff48e7cc27de427a4fb4e7f9aebdb16c8a5ad3fbb7a02613` |
| `scripts/jira-capture-core.mjs` | `execution`, § 10 | `173c7b918feec11b3f271c3146c0ac2e30b0015793b8ee75eea9b4548c087f4d` |
| `scripts/jira-capture-app.mjs` | `interface`, § 8 | `07dab20b9b5ea116e1be03d228709896c46439fff26c9fb7bc81eb8de9a6f8f5` |
| `scripts/public/capture.html` | `interface`, § 8 | `f8c7a637f8c2dafc62b9b360e9eb504f24d59d86667c27904059f213081e3abb` |
| `scripts/jira-capture-mhtml.mjs` | `interface`, § 8 | `ad9a2a8d7926b215366ad9d8564527428657f8116ca18d759b52084662b88779` |
| `agent/capteur-sprint.md` | `agent`, § 7 | `758d783b13566506f00f7a52405a49adfc7543ad23adcc6d526bec0efb23ef9c` |
| `scripts/jira-sprint-app.mjs` | `export-api`, § 6 | `14005092304d4d368c869d7ee801ca922529848325255054768e86f37c418ea8` |
| `scripts/public/index.html` | `export-api`, § 6 | `f69c6d601212d9a7e746181957a8c281f00a3d42decd488de25c54fdbb8abd91` |
| `scripts/jira_sprint_export.py` | `export-api`, § 6 | `60b6953199cbc21443572212fee36de21adc4522e86feb2215f38ba474b91782` |
| `tests/fake-jira.mjs` | `recette`, § 6 | `8264199f3020af430970c17cae538f115287a3bba8b69b67729351927c5a663f` |
| `tests/run-tests.mjs` | `recette`, § 6 | `22de1b311e48fcefac770db87920cebbdde5407e41ee7ad299271e4da405cb55` |

Depuis le dossier du skill, cette commande d'une ligne écrit les treize fichiers, compare leurs empreintes à celles du tableau et sort avec le code 1 au moindre écart ou à la moindre absence. Elle ne contient ni `$`, ni accent grave, ni `!`, ni `%`, ni guillemet intérieur : elle se colle telle quelle dans bash, zsh, CMD ou PowerShell, et dans un fichier `.cmd`. Elle lit aussi des modules aux fins de ligne CRLF.

```text
node -e "const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'); const attendu = { 'package.json': '7493a4af4ad23c1e13b92c66ba242c9bca40b3be0f9ba8ab77434c924306eb77', 'package-lock.json': '80d7bb928817d7ca7ba7600b5292371ad49fa95d25c5af0316766f2a675c788a', '.gitignore': 'b163b109241838c4ff48e7cc27de427a4fb4e7f9aebdb16c8a5ad3fbb7a02613', 'scripts/jira-capture-core.mjs': '173c7b918feec11b3f271c3146c0ac2e30b0015793b8ee75eea9b4548c087f4d', 'scripts/jira-capture-app.mjs': '07dab20b9b5ea116e1be03d228709896c46439fff26c9fb7bc81eb8de9a6f8f5', 'scripts/public/capture.html': 'f8c7a637f8c2dafc62b9b360e9eb504f24d59d86667c27904059f213081e3abb', 'scripts/jira-capture-mhtml.mjs': 'ad9a2a8d7926b215366ad9d8564527428657f8116ca18d759b52084662b88779', 'agent/capteur-sprint.md': '758d783b13566506f00f7a52405a49adfc7543ad23adcc6d526bec0efb23ef9c', 'scripts/jira-sprint-app.mjs': '14005092304d4d368c869d7ee801ca922529848325255054768e86f37c418ea8', 'scripts/public/index.html': 'f69c6d601212d9a7e746181957a8c281f00a3d42decd488de25c54fdbb8abd91', 'scripts/jira_sprint_export.py': '60b6953199cbc21443572212fee36de21adc4522e86feb2215f38ba474b91782', 'tests/fake-jira.mjs': '8264199f3020af430970c17cae538f115287a3bba8b69b67729351927c5a663f', 'tests/run-tests.mjs': '22de1b311e48fcefac770db87920cebbdde5407e41ee7ad299271e4da405cb55' }; const vus = new Set(); let ecarts = 0; for (const module of ['modules/execution/SKILL.md', 'modules/interface/SKILL.md', 'modules/agent/SKILL.md', 'modules/export-api/SKILL.md', 'modules/recette/SKILL.md']) { const texte = fs.readFileSync(module, 'utf8').replace(/\r\n/g, '\n'); for (const m of texte.matchAll(/^<\x21-- fichier : (\S+) -->\n\x60{3}[a-z]*\n([\s\S]*?)\n\x60{3}\n/gm)) { const contenu = m[2] + '\n'; fs.mkdirSync(path.dirname(m[1]), { recursive: true }); fs.writeFileSync(m[1], contenu); vus.add(m[1]); const conforme = crypto.createHash('sha256').update(contenu).digest('hex') === attendu[m[1]]; if (conforme === false) ecarts++; console.log((conforme ? 'conforme  ' : 'ECART     ') + m[1]); } } for (const f of Object.keys(attendu)) { if (vus.has(f) === false) { ecarts++; console.log('ABSENT    ' + f); } } if (ecarts > 0) process.exitCode = 1;"
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
  "version": "1.0.0",
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
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "capture-sprint-jira",
      "version": "1.0.0",
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
| `launchBrowser()`, `browserChannel()`, `profileDir()` | fenêtre visible sur le profil dédié | `session` |
| `loadAllTickets(page)`, `parseFilter()`, `matchesFilter()` | relevé des liens et filtre | `releve` |
| `captureTicket()`, `captureMhtml()`, `pageTimeoutMs()` | capture d'une page de ticket | `capture` |
| `classify()`, `parseCategories()`, `normalizeText()`, `termPattern()` | classement | `classement` |
| `captureSprintTickets(context, page, options)` | capture complète d'un sprint, rapport | `classement` |
| `outputFolder()` | dossier de sortie saisi | `interface` |

<!-- fichier : scripts/jira-capture-core.mjs -->
```javascript
// jira-capture-core.mjs : capture en MHTML des tickets d'un sprint Jira protégé par un SSO (skill capture-sprint-jira).
// Le navigateur s'ouvre sur un profil dédié ; l'utilisateur s'y connecte lui-même (SSO, MFA) : aucun identifiant ne
// passe par ce module. Sur la page du sprint, chaque lien /browse/<CLÉ> retenu par le filtre (préfixe, numéros) est
// ouvert ; la page du ticket est enregistrée en MHTML dans le dossier de sa catégorie, reconnue au terme clé qu'elle
// contient. Module commun à jira-capture-app.mjs (interface) et à jira-capture-mhtml.mjs (ligne de commande).
import { existsSync } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

/** Dossier du skill (parent de scripts/) : base des chemins relatifs saisis dans l'interface. */
export const SKILL_DIR = fileURLToPath(new URL('..', import.meta.url));

/** Dossier des captures par défaut, écarté par le .gitignore du skill. */
export const DEFAULT_OUT_DIR = join(SKILL_DIR, 'mhtml');

/** Catégories par défaut : termes clés cherchés dans la page de chaque ticket, et noms de leurs dossiers. */
export const DEFAULT_CATEGORIES = ['ticket avec ia', 'ticket sans ia'];

/** Dossier des tickets dont la page ne contient aucun terme clé, ou en contient plusieurs. */
export const UNCLASSIFIED = 'à classer';

/** Arrêt de la capture après ce nombre d'échecs consécutifs : le plus souvent, la session SSO a expiré. */
export const MAX_FAILURES_IN_ROW = 3;

/** Profil du navigateur dédié à Jira, qui garde la session SSO ; JIRA_CAPTURE_PROFILE pour un autre dossier. */
export const profileDir = (env = process.env) => resolve(SKILL_DIR, env.JIRA_CAPTURE_PROFILE || '.jira-profile');

/** Délai d'affichage d'une page de ticket, 20 s par défaut ; JIRA_CAPTURE_PAGE_TIMEOUT_MS pour un Jira lent. */
export const pageTimeoutMs = (env = process.env) => Number(env.JIRA_CAPTURE_PAGE_TIMEOUT_MS) || 20_000;

export const firstLine = (err) => String(err?.message ?? err).split('\n')[0];
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

/** Ouvre une fenêtre visible sur le profil dédié : la connexion SSO s'y fait à la main. */
export function launchBrowser() {
  return chromium.launchPersistentContext(profileDir(), {
    channel: browserChannel(),
    headless: false,
    viewport: null, // la page prend la taille de la fenêtre
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
export const normalizeText = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[\s_-]+/g, ' ').trim();

/** Motif d'un terme clé : mots entiers, séparés par une espace, un tiret, un _ ou rien (« TicketAvecIA »). */
export const termPattern = (term) => new RegExp(`(?<![a-z0-9])${normalizeText(term).split(' ').map(escapeRe).join(' ?')}(?![a-z0-9])`);

// Interdit dans un nom de dossier sous Windows ou Linux
const BAD_FOLDER_NAME = /[<>:"/\\|?*\u0000-\u001f]/;

/** Lit les catégories (liste, ou texte à une catégorie par ligne ou séparées par « ; ») ; elles nomment les dossiers. */
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

const excerptAround = (hay, m) => {
  const start = Math.max(0, m.index - 40);
  const end = Math.min(hay.length, m.index + m[0].length + 40);
  return `${start > 0 ? '…' : ''}${hay.slice(start, end)}${end < hay.length ? '…' : ''}`;
};

/**
 * Catégorie d'un ticket d'après les textes de sa page, pris dans l'ordre : [[où, texte], …]. Le premier texte
 * qui contient au moins un terme clé décide : une seule catégorie trouvée est retenue ; plusieurs, aucune.
 * Rend { category, where, found, excerpt } ; category vaut null si le ticket est à classer.
 */
export function classify(sources, categories) {
  for (const [where, text] of sources) {
    const hay = normalizeText(text);
    const hits = [];
    for (const c of categories) {
      const m = termPattern(c).exec(hay);
      if (m) hits.push({ c, m });
    }
    if (hits.length === 1) return { category: hits[0].c, where, found: [hits[0].c], excerpt: excerptAround(hay, hits[0].m) };
    if (hits.length > 1) return { category: null, where, found: hits.map((h) => h.c), excerpt: null };
  }
  return { category: null, where: null, found: [], excerpt: null };
}

// ---------------------------------------------------------------------------------------------
// Page du sprint
// ---------------------------------------------------------------------------------------------

/**
 * Un pas de défilement, exécuté dans la page : la fenêtre, si elle défile, et chaque bloc qui défile (100 pixels
 * de haut au moins ; avec `withLinks`, seulement s'il contient un lien de ticket) avancent de 80 % de leur hauteur
 * visible, si bien qu'aucune carte n'est sautée, même dans une petite fenêtre. Rend true si l'un d'eux a bougé.
 */
function scrollStep(withLinks) {
  const root = document.scrollingElement ?? document.documentElement;
  const scrolls = (el) => el.scrollHeight > el.clientHeight + 1 && (el === root || /(auto|scroll|overlay)/.test(getComputedStyle(el).overflowY));
  const targets = scrolls(root) ? [root] : [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.clientHeight < 100 || !scrolls(el)) continue;
    if (withLinks && !el.querySelector('a[href*="/browse/"]')) continue;
    targets.push(el);
  }
  let moved = false;
  for (const el of targets) {
    const before = el.scrollTop;
    el.scrollTop = before + Math.max(80, Math.round(el.clientHeight * 0.8));
    if (el.scrollTop !== before) moved = true;
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
 * Liens des tickets de la page, hors navigation (menus, éléments récents) : [{ key, url }], une entrée par clé,
 * adresse ramenée à …/browse/<CLÉ>.
 */
const ticketLinks = (page) => page.evaluate(() => {
  const NAV = 'nav, header, aside, [role="navigation"], [role="banner"]';
  const links = new Map();
  for (const a of document.querySelectorAll('a[href*="/browse/"]')) {
    if (a.closest(NAV)) continue;
    const m = (a.getAttribute('href') ?? '').match(/^(.*?\/browse\/)([A-Za-z][A-Za-z0-9_]*-\d+)/);
    if (!m) continue;
    const key = m[2].toUpperCase();
    if (!links.has(key)) links.set(key, new URL(m[1] + key, document.baseURI).href);
  }
  return [...links].map(([key, url]) => ({ key, url }));
});

/**
 * Fait défiler la page jusqu'à ce que, `stableSteps` pas de suite, elle ne défile plus et qu'aucun ticket nouveau
 * n'apparaisse : le bas est atteint et plus rien ne s'y charge. Revient ensuite en haut. Les liens sont relevés à
 * chaque pas : un affichage virtualisé, qui retire de la page les cartes sorties de l'écran, ne fait donc perdre
 * aucun ticket. Rend { seen, present, links }.
 */
export async function loadAllTickets(page, { pauseMs = 700, maxSteps = 150, stableSteps = 4 } = {}) {
  const seen = new Map();
  const add = (links) => { for (const l of links) if (!seen.has(l.key)) seen.set(l.key, l.url); };
  add(await ticketLinks(page));
  for (let i = 0, stable = 0; i < maxSteps && stable < stableSteps; i++) {
    const moved = await page.evaluate(scrollStep, true);
    await page.waitForTimeout(pauseMs);
    const before = seen.size;
    add(await ticketLinks(page));
    stable = seen.size === before && !moved ? stable + 1 : 0;
  }
  await scrollToTop(page, pauseMs);
  return { seen: seen.size, present: (await ticketLinks(page)).length, links: [...seen].map(([key, url]) => ({ key, url })) };
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
 * Textes où chercher la catégorie, du plus sûr au moins sûr : le contenu principal (main), visible ; le même,
 * panneaux repliés compris ; la page visible, hors navigation, si elle n'a pas de contenu principal. La
 * navigation (filtres enregistrés, éléments récents) peut citer un terme clé sans rapport avec le ticket.
 */
const pageTexts = (page) => page.evaluate(() => {
  const SKIP = /^(?:SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/;
  const NAV = 'nav, header, aside, [role="navigation"], [role="banner"]';
  const collect = (root, { visibleOnly, skipNav }) => {
    const parts = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const el = walker.currentNode.parentElement;
      if (!el || SKIP.test(el.tagName)) continue;
      if (skipNav && el.closest(NAV)) continue;
      if (visibleOnly && !(el.checkVisibility ? el.checkVisibility() : el.offsetParent !== null)) continue;
      parts.push(walker.currentNode.nodeValue);
    }
    return parts.join(' ');
  };
  const main = document.querySelector('main, [role="main"]');
  return [
    ['contenu', main ? collect(main, { visibleOnly: true }) : ''],
    ['contenu masqué', main ? collect(main, { visibleOnly: false }) : ''],
    ['page', collect(document.body, { visibleOnly: true, skipNav: true })],
  ];
});

/** Ouvre la page du ticket, la charge en entier et la capture : rend { data, texts }. */
export async function captureTicket(context, page, { key, url }, { timeoutMs = pageTimeoutMs() } = {}) {
  let navError = null;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 }).catch((err) => { navError = err; });
  if (!(await waitForTicket(page, key, timeoutMs))) {
    throw new Error(navError
      ? `ouverture impossible (${firstLine(navError)})`
      : `page du ticket non affichée après ${timeoutMs / 1000} s (session SSO expirée ?)`);
  }
  await scrollThrough(page);
  await waitForStableText(page);
  const texts = await pageTexts(page);
  return { data: await captureMhtml(context, page), texts };
}

// ---------------------------------------------------------------------------------------------
// Capture d'un sprint
// ---------------------------------------------------------------------------------------------

/**
 * Capture les tickets de la page du sprint affichée dans `page`, directement dans `folder` :
 *   <catégorie>/<CLÉ>.mhtml   un fichier par ticket retenu, dans le dossier de sa catégorie
 *   à classer/<CLÉ>.mhtml     aucun terme clé trouvé, ou plusieurs
 *   sprint.mhtml              la page du sprint, d'où viennent les liens
 *   rapport.json              filtre, catégories, et pour chaque ticket : catégorie, extrait trouvé ou erreur
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
  const list = await loadAllTickets(page);
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
      const { data, texts } = await captureTicket(context, page, ticket, { timeoutMs });
      const c = classify(texts, categories);
      const dir = c.category ?? UNCLASSIFIED;
      await mkdir(join(folder, dir), { recursive: true });
      await writeFile(join(folder, dir, `${ticket.key}.mhtml`), data);
      const movedFrom = [];
      for (const other of folders) { // copie d'une capture précédente, rangée ailleurs
        const old = join(folder, other, `${ticket.key}.mhtml`);
        if (other !== dir && existsSync(old)) {
          await rm(old, { force: true });
          movedFrom.push(other);
        }
      }
      tickets.push({ ...ticket, category: c.category, found: c.found, where: c.where, excerpt: c.excerpt, file: `${dir}/${ticket.key}.mhtml`, movedFrom });
      failuresInRow = 0;
    } catch (err) {
      tickets.push({ ...ticket, category: null, error: firstLine(err) });
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
    date: now.toISOString(), sprintUrl, folder, filter, categories,
    listed: list.links.length, selected: selected.length, ignored: ignored.length, ignoredSample: ignored.slice(0, 20),
    counts, errors, aborted, tickets,
  };
  await writeFile(join(folder, 'rapport.json'), `${JSON.stringify(report, null, 2)}\n`);
  onProgress({ step: 'fin', done: tickets.length, total: selected.length, key: null });
  return report;
}
```
