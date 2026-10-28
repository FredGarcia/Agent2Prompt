---
name: recette
description: Recette du skill (npm test, sous Windows, Linux et, sans écran, sous xvfb-run, profil et dossiers temporaires, faux Jira local avec API REST paginée, SSO simulé, backlogs chargés au défilement ou virtualisés, pages de tickets pour chaque cas de classement et session expirée, table des 19 scénarios R1 à R19 rattachés aux invariants de D1 à D6 et D8 et aux points d'extension, contrôle de la recette par six défauts réintroduits, recette en CI sur ubuntu-latest et windows-latest, sources de tests/fake-jira.mjs et tests/run-tests.mjs). À lire pour installer le skill, et avant de publier une version.
dimensions: [D1, D2, D3, D4, D5, D6, D8]
status: active
---

# Module `recette` (D1 à D6, D8)

## 1. Lancer la recette

```bash
npm test
```

- Sous Linux sans écran : `xvfb-run -a npm test`. La capture ouvre une fenêtre visible, comme sur le poste du développeur.
- Le navigateur est celui de `JIRA_CAPTURE_CHANNEL` : Chrome par défaut ; `chromium` après `npx playwright-core install chromium`.
- Python : la variable `PYTHON`, à défaut `py` sous Windows et `python3` ailleurs ; s'il manque, R7 est sauté.
- La recette travaille sur un profil et des dossiers temporaires : la session et les captures du dossier du skill ne sont pas touchées. Elle efface ses dossiers temporaires si tout passe ; sinon, ou avec `KEEP_TMP=1`, elle les garde et en donne le chemin, avec une capture d'écran de l'interface.
- Durée : environ 2 min 30 s, dont 35 s par capture des huit tickets du faux backlog.
- Bilan attendu : `19 scénarios, 108 contrôles, 108 réussis, 0 en échec, 0 sautés` ; sans Python, `104 contrôles, 103 réussis, 0 en échec, 1 sautés`, R7 étant sauté.

## 2. Le faux Jira

`tests/fake-jira.mjs` sert, sur `127.0.0.1` et un port libre, sans réseau ni compte :

- une API REST Agile : deux tableaux aux noms proches, trois sprints futurs paginés deux par deux, 120 tickets paginés cinquante par cinquante, descriptions en texte ou en ADF, authentification Basic ou Bearer ;
- un SSO simulé : sans cookie, un détour par `/sso/login`, qui pose un cookie persistant et compte ses passages ;
- le backlog 42 : 71 cartes (60 hors plage, trois hors filtre, puis les huit du sprint, en fin de liste), une épopée liée en lien absolu et en minuscules, et un ticket récent, dans la plage, cité dans l'en-tête de la page ; chargé quinze cartes par quinze au défilement, ou virtualisé avec `?mode=virtual` ;
- le backlog 43 : cinq tickets dont la session a expiré ;
- les pages de tickets, rendues 400 ms après le chargement, comme une application monopage, chacune avec un menu latéral qui cite « Ticket avec IA » :

| Ticket | Contenu de la page | Résultat attendu |
|---|---|---|
| `DEMOAB-3500` | « Étiquettes : ticket-avec-ia » | `ticket avec ia`, contenu |
| `DEMOCD-3501` | « Épopée : Ticket sans IA » | `ticket sans ia`, contenu |
| `DEMOAB-3502` | « Composants : TicketAvecIA » | `ticket avec ia`, contenu |
| `DEMOEF-3600` | « Catégorie : ticket sans ia », dans un panneau replié | `ticket sans ia`, contenu masqué |
| `DEMOAB-3700` | aucun terme, hors du menu latéral | `à classer` |
| `DEMOAB-3800` | « ticket_avec_ia, ticket_sans_ia » | `à classer`, deux termes |
| `DEMOAB-3900` | renvoi vers la page de connexion d'une autre origine | erreur, session expirée |
| `DEMOAB-4500` | « Ticket avec IA », et un commentaire chargé au défilement | `ticket avec ia`, commentaire dans le fichier |

## 3. Scénarios

| ID | Scénario | Invariants |
|---|---|---|
| R1 | Filtre : préfixe mis en majuscules, filtre vide qui retient tout, bornes comprises, préfixe porté sur la partie projet, valeurs invalides refusées | D3.INV-2 |
| R2 | Catégories : défaut, texte à une catégorie par ligne ou séparées par « ; », nom de dossier invalide, doublon, `à classer` et liste vide refusés | D5.INV-5 |
| R3 | Classement : quatre graphies et les accents, mots entiers, deux catégories, ordre des textes, extrait | D5.INV-1, D5.INV-2, D5.INV-3 |
| R4 | Réglages et emplacements : dossier de sortie, profil, canal, délai ; variables vides | D1.INV-2, D1.INV-3 |
| R5 | Dépendance unique à version exacte ; `.gitignore` du skill | D1.INV-1, D1.INV-2 |
| R6 | Export Node : hôte, origine, type de contenu ; prochain sprint ; 120 tickets sur trois pages ; ADF ; tableau par identifiant ; tableau ambigu ; mot de passe refusé ; aucun mot de passe dans le journal | D6.INV-1, D8.INV-1, D8.INV-2, D8.INV-3 |
| R7 | Export Python : e-mail et jeton (Basic), jeton personnel (Bearer), CSV pour Excel, aucun jeton dans la sortie, jeton refusé | D8.INV-1, D8.INV-2, D8.INV-3 |
| R8 | Interface de capture : hôte, origine, type de contenu ; aucun champ d'identifiant | D6.INV-1, D2.INV-1 |
| R9 | Interface de capture : capture refusée sans sprint, adresse non http refusée, ouverture après le SSO, préfixe invalide et catégorie réservée refusés | D2.INV-1, D3.INV-2, D5.INV-5 |
| R10 | Backlog chargé au défilement : 72 tickets relevés, navigation exclue, 8 retenus et triés, les huit cas du § 2, dossiers directement dans le dossier choisi, MHTML de Chrome par ticket, commentaire chargé au défilement, `sprint.mhtml` et `rapport.json`, décompte ; une seule capture à la fois ; navigateur gardé ouvert après l'erreur | D3.INV-1, D3.INV-3, D4.INV-1, D4.INV-2, D4.INV-3, D5.INV-2, D5.INV-3, D5.INV-4, D5.INV-6, D6.INV-2, D6.INV-4 |
| R11 | Nouvelle capture dans le même dossier, après un changement de catégorie dans Jira : retour à la page du sprint, ticket rangé dans sa nouvelle catégorie, copie précédente retirée, autres tickets en place, navigateur fermé sans erreur | D5.INV-4, D6.INV-4 |
| R12 | Navigateur rouvert sans nouveau passage par le SSO | D2.INV-2 |
| R13 | Backlog virtualisé : mêmes contrôles que R10 | D3.INV-1, D4.INV-1, D5.INV-3 |
| R14 | Cinq tickets à session expirée : trois erreurs, capture arrêtée, navigateur gardé ouvert | D4.INV-1, D4.INV-4, D6.INV-4 |
| R15 | « Fermer le navigateur » pendant la capture : capture arrêtée, rapport partiel | D4.INV-4, D6.INV-2 |
| R16 | Page de l'interface pilotée comme par le développeur : bouton activé, avancement, boutons bloqués, bilan, résumé, une ligne par ticket, avertissement, valeurs retrouvées après rechargement | D6.INV-2, D6.INV-3 |
| R17 | Ligne de commande : adresse manquante et numéro invalide (code 2), un ticket capturé directement dans le dossier (code 0), un ticket en erreur (code 1) | D6.INV-5, D4.INV-1 |
| R18 | Point d'extension E1 : champs du rapport, d'un ticket capturé, d'un ticket en erreur | D5.INV-6 |
| R19 | Point d'extension E2 : fonctions exportées par le module commun, dont `captureSprintTickets` | |

## 4. Contrôle de la recette elle-même

Six défauts, réintroduits un à un dans le code, font chacun échouer la recette par le scénario attendu (essai du 28 octobre 2026, Node 22.23.4) :

| ID | Défaut réintroduit | Scénarios en échec | Contrôles en échec |
|---|---|---|---|
| M1 | les liens de la navigation sont relevés : le ticket récent de l'en-tête est capturé | R10, R11, R13, R16 | 15 |
| M2 | la copie d'un ticket recapturé reste dans son ancien dossier | R11 | 1 |
| M3 | le classement lit toute la page, navigation comprise : le menu latéral classe les tickets sans terme et rend les autres ambigus | R10, R11, R13, R16 | 14 |
| M4 | l'origine des requêtes n'est plus contrôlée | R8 | 1 |
| M5 | une page est enregistrée sans vérifier qu'elle est celle du ticket : la page de connexion prend le nom du ticket | R10, R11, R13, R14, R16, R17, R18 | 17 |
| M6 | les liens ne sont relevés qu'avant le défilement : seuls les premiers tickets du backlog sont vus | R10, R11, R13, R15, R16, R17, R18 | 44 |

Chaque défaut a été retiré après son essai ; la recette du code publié passe en entier.

## 5. Recette en intégration continue

Le workflow `.github/workflows/recette-capture-sprint-jira.yml` du dépôt Agent2Prompt suit le chemin de l'IA du développeur : il matérialise la transmission courante, extrait les fichiers par la commande du module `execution`, § 8, sous bash et sous CMD, installe la dépendance par `npm ci`, puis lance la recette, sous `xvfb-run` sur `ubuntu-latest` et directement sur `windows-latest`, avec Node 20 et Node 22 et le Chrome des images GitHub.

## 6. Sources

### `tests/fake-jira.mjs`

<!-- fichier : tests/fake-jira.mjs -->
```javascript
// fake-jira.mjs : faux Jira local pour la recette du skill capture-sprint-jira, sans réseau ni compte.
//   API REST Agile : tableaux, sprints et tickets paginés, authentification Basic ou Bearer.
//   SSO simulé : sans cookie, détour par /sso/login, qui pose un cookie persistant.
//   Backlogs : 42, liste chargée au défilement (?mode=virtual : affichage virtualisé) ; 43, tickets à session expirée.
//   Pages de tickets /browse/<CLÉ> : contenu rendu après 400 ms, comme une application monopage.
import http from 'node:http';

const ACCEPTED = new Set([
  `Basic ${Buffer.from('jean.dupont@example.com:motdepasse').toString('base64')}`,
  `Basic ${Buffer.from('jean.dupont@example.com:jeton-demo').toString('base64')}`,
  'Bearer pat-demo',
]);

// Pages de tickets : où se trouve le terme clé
export const TICKETS = {
  'DEMOAB-3500': { visible: 'Étiquettes : ticket-avec-ia' },
  'DEMOCD-3501': { visible: 'Épopée : Ticket sans IA' },
  'DEMOAB-3502': { visible: 'Composants : TicketAvecIA' },
  'DEMOEF-3600': { hidden: 'Catégorie : ticket sans ia' }, // panneau replié
  'DEMOAB-3700': {}, // aucun terme dans le contenu ; le menu latéral en cite un
  'DEMOAB-3800': { visible: 'Étiquettes : ticket_avec_ia, ticket_sans_ia' },
  'DEMOAB-3900': { expired: true },
  'DEMOAB-4500': { visible: 'Étiquettes : Ticket avec IA', lazyComment: true },
};
// Backlog 42 : 60 tickets hors plage, trois hors filtre, puis ceux du sprint, en fin de liste. L'en-tête de la page
// cite en plus DEMOAB-3650, dans la plage : un élément récent de la navigation, qui ne doit pas être capturé.
export const BOARD_42 = [
  ...Array.from({ length: 60 }, (_, i) => `DEMOZZ-${i + 1}`),
  'DEMOAB-3499', 'AUTRE-3600', 'DEMOAB-4501',
  ...Object.keys(TICKETS),
];
export const BOARD_43 = ['DEMOXP-3501', 'DEMOXP-3502', 'DEMOXP-3503', 'DEMOXP-3504', 'DEMOXP-3505'];
const EXPIRED = new Set(['DEMOAB-3900', ...BOARD_43]);

// API REST
const BOARDS = [{ id: 42, name: 'Équipe démo' }, { id: 43, name: 'Équipe démo 2' }];
const SPRINTS = [
  { id: 7, name: 'Sprint 8', state: 'future', startDate: '2026-11-16T09:00:00.000Z' },
  { id: 6, name: 'Sprint 7', state: 'future', startDate: '2026-11-02T09:00:00.000Z' },
  { id: 9, name: 'Sprint 10', state: 'future' },
];
const apiIssue = (n, sprint) => ({
  key: `DEMO-${n}`,
  fields: {
    summary: `Ticket ${n} du sprint ${sprint}`,
    status: { name: n % 3 === 0 ? 'En cours' : 'À faire' },
    assignee: n % 4 === 0 ? null : { displayName: `Dev ${n % 4}` },
    priority: { name: 'Moyenne' },
    issuetype: { name: n % 5 === 0 ? 'Bug' : 'Story' },
    labels: n % 2 ? ['front'] : [],
    parent: n <= 10 ? { key: 'EPIC-1' } : null,
    issuelinks: n % 7 === 0 ? [{ id: '1' }] : [],
    description: n % 2
      ? { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Critère :' }, { type: 'text', text: `export ${n}` }] }] }
      : `Description texte ${n}`,
    customfield_10016: n % 6 === 0 ? null : (n % 5) + 1,
  },
});
const ISSUES = { 6: Array.from({ length: 120 }, (_, i) => apiIssue(i + 1, 7)), 7: [1, 2, 3].map((n) => apiIssue(n, 8)), 9: [] };

function boardHtml(keys) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Backlog - DEMO</title>
<style>body{margin:0;font-family:sans-serif} header{height:56px;background:#0052cc;color:#fff}
#list{height:calc(100vh - 56px);overflow:auto} .card{height:40px;padding:4px;border-bottom:1px solid #ddd}</style></head>
<body><header>Jira (faux) · Récents : <a href="/browse/DEMOAB-3650">DEMOAB-3650</a></header><main id="list"></main>
<script>
const KEYS = ${JSON.stringify(keys)};
const MODE = new URLSearchParams(location.search).get('mode');
const H = 49;
const list = document.getElementById('list');
const card = (i) => '<div class="card"><a href="/browse/' + KEYS[i] + '">' + KEYS[i] + '</a> Ticket ' + (i + 1)
  + (i < 10 ? ' · <a href="https://jira.example.com/browse/demoe-100?focus=1">DEMOE-100</a>' : '') + '</div>';
if (MODE === 'virtual') {
  const spacer = document.createElement('div');
  spacer.style.cssText = 'position:relative;height:' + KEYS.length * H + 'px';
  list.appendChild(spacer);
  const render = () => {
    const first = Math.max(0, Math.floor(list.scrollTop / H) - 3);
    const last = Math.min(KEYS.length, Math.ceil((list.scrollTop + list.clientHeight) / H) + 3);
    spacer.innerHTML = '';
    for (let i = first; i < last; i++) {
      const d = document.createElement('div');
      d.style.cssText = 'position:absolute;left:0;right:0;top:' + i * H + 'px';
      d.innerHTML = card(i);
      spacer.appendChild(d);
    }
  };
  list.addEventListener('scroll', render);
  render();
} else {
  let shown = 0, loading = false;
  const more = () => {
    const n = Math.min(KEYS.length, shown + 15);
    let html = '';
    for (let i = shown; i < n; i++) html += card(i);
    list.insertAdjacentHTML('beforeend', html);
    shown = n;
  };
  more(); more();
  list.addEventListener('scroll', () => {
    if (loading || shown >= KEYS.length) return;
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 200) {
      loading = true;
      setTimeout(() => { more(); loading = false; }, 300);
    }
  });
}
</script></body></html>`;
}

function ticketHtml(key, spec = {}) {
  const fields = (spec.visible ? `<p>${spec.visible}</p>` : '')
    + (spec.hidden ? `<details><summary>Autres champs</summary><p>${spec.hidden}</p></details>` : '');
  const lazy = spec.lazyComment ? `
  let loaded = false;
  window.addEventListener('scroll', () => {
    if (loaded || innerHeight + scrollY < document.body.scrollHeight - 300) return;
    loaded = true;
    setTimeout(() => { document.getElementById('activite').innerHTML = '<p>Commentaire chargé au défilement</p>'; }, 200);
  });` : '';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>[${key}] Ticket de démonstration - Jira (faux)</title></head>
<body><nav>Filtres enregistrés : Ticket avec IA · Mes tickets ouverts</nav>
<main id="contenu">Chargement…</main>
<script>
setTimeout(() => {
  document.getElementById('contenu').innerHTML = '<h1>${key} : ticket de démonstration</h1>' + ${JSON.stringify(fields)}
    + '<div>' + '<p>Paragraphe de description.</p>'.repeat(80) + '</div><div id="activite"></div>';${lazy}
}, 400);
</script></body></html>`;
}

const LOGIN_PAGE = '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Connexion</title></head><body><main>Connexion requise</main></body></html>';

/** Démarre le faux Jira sur 127.0.0.1 ; rend { url, port, stats, close }. */
export function startFakeJira({ port = 0 } = {}) {
  const stats = { ssoLogins: 0, apiCalls: 0 };
  const server = http.createServer((req, res) => {
    const self = server.address().port;
    const url = new URL(req.url, `http://127.0.0.1:${self}`);
    const q = (k) => url.searchParams.get(k);
    const startAt = Number(q('startAt') || 0);
    const maxResults = Number(q('maxResults') || 50);
    const send = (status, body, headers = {}) => {
      const json = typeof body !== 'string';
      res.writeHead(status, { 'Content-Type': json ? 'application/json' : 'text/html; charset=utf-8', ...headers });
      res.end(json ? JSON.stringify(body) : body);
    };

    if (url.pathname === '/sso/login') {
      stats.ssoLogins++;
      return send(302, '', { Location: q('next') || '/', 'Set-Cookie': 'sso=ok; Path=/; Max-Age=3600; HttpOnly' });
    }
    if (url.pathname === '/sso/expired') return send(200, LOGIN_PAGE);

    if (url.pathname.startsWith('/jira/software/') || url.pathname.startsWith('/browse/')) {
      if (!/(?:^|;\s*)sso=ok/.test(req.headers.cookie ?? '')) {
        return send(302, '', { Location: `/sso/login?next=${encodeURIComponent(url.pathname + url.search)}` });
      }
      if (url.pathname === '/jira/software/c/projects/DEMO/boards/42/backlog') return send(200, boardHtml(BOARD_42));
      if (url.pathname === '/jira/software/c/projects/DEMO/boards/43/backlog') return send(200, boardHtml(BOARD_43));
      const key = url.pathname.match(/^\/browse\/([A-Z][A-Z0-9_]*-\d+)$/)?.[1];
      if (!key) return send(404, 'introuvable');
      // Session expirée : renvoi vers le fournisseur d'identité, sur une autre origine
      if (EXPIRED.has(key)) return send(302, '', { Location: `http://localhost:${self}/sso/expired` });
      return send(200, ticketHtml(key, TICKETS[key]));
    }

    if (url.pathname.startsWith('/rest/')) {
      stats.apiCalls++;
      if (!ACCEPTED.has(req.headers.authorization ?? '')) return send(401, { errorMessages: ['Non autorisé'] });
      let m;
      if (url.pathname === '/rest/agile/1.0/board') {
        const name = (q('name') ?? '').toLowerCase();
        const found = BOARDS.filter((b) => b.name.toLowerCase().includes(name));
        return send(200, { values: found.slice(startAt, startAt + maxResults), isLast: true, startAt, maxResults });
      }
      if ((m = url.pathname.match(/^\/rest\/agile\/1\.0\/board\/(\d+)$/))) {
        const b = BOARDS.find((x) => x.id === Number(m[1]));
        return b ? send(200, b) : send(404, { errorMessages: ['Tableau introuvable'] });
      }
      if ((m = url.pathname.match(/^\/rest\/agile\/1\.0\/board\/(\d+)\/sprint$/))) {
        const all = SPRINTS.filter((s) => !q('state') || s.state === q('state'));
        const values = all.slice(startAt, startAt + Math.min(maxResults, 2)); // deux par page : isLast sert
        return send(200, { values, isLast: startAt + values.length >= all.length, startAt, maxResults });
      }
      if ((m = url.pathname.match(/^\/rest\/agile\/1\.0\/sprint\/(\d+)\/issue$/))) {
        const all = ISSUES[m[1]] ?? [];
        const issues = all.slice(startAt, startAt + Math.min(maxResults, 50)); // 50 au plus par page, comme Jira
        return send(200, { issues, total: all.length, startAt, maxResults: issues.length });
      }
      return send(404, { errorMessages: ['Ressource inconnue'] });
    }
    send(404, 'introuvable');
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      const p = server.address().port;
      const close = () => {
        server.closeAllConnections(); // le navigateur garde ses connexions ouvertes
        return new Promise((r) => server.close(r));
      };
      resolve({ url: `http://127.0.0.1:${p}`, port: p, stats, close });
    });
  });
}
```

### `tests/run-tests.mjs`

<!-- fichier : tests/run-tests.mjs -->
```javascript
#!/usr/bin/env node
// run-tests.mjs : recette du skill capture-sprint-jira, scénarios R1 à R19, contre un faux Jira local
// (tests/fake-jira.mjs), sans réseau ni compte. Le navigateur s'ouvre, visible, sur un profil temporaire :
// la session et les captures du dossier du skill ne sont pas touchées.
//   Navigateur : celui de JIRA_CAPTURE_CHANNEL (chrome par défaut ; chromium après npx playwright-core install chromium).
//   Linux sans écran : xvfb-run -a npm test.
//   Python : variable PYTHON, à défaut py sous Windows et python3 ailleurs ; s'il manque, R7 est sauté.
// Usage, depuis le dossier du skill : npm test ; sortie 0 si tout passe, 1 sinon (dossier temporaire gardé).
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import http from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import * as core from '../scripts/jira-capture-core.mjs';
import { BOARD_42, TICKETS, startFakeJira } from './fake-jira.mjs';

const {
  DEFAULT_CATEGORIES, UNCLASSIFIED, browserChannel, classify, matchesFilter, outputFolder, pageTimeoutMs,
  parseCategories, parseFilter, profileDir,
} = core;
const SKILL = fileURLToPath(new URL('..', import.meta.url));
const TMP = mkdtempSync(join(tmpdir(), 'capture-sprint-jira-'));
const ENV = { ...process.env, JIRA_CAPTURE_PROFILE: join(TMP, 'profil'), JIRA_CAPTURE_PAGE_TIMEOUT_MS: '3000' };
const results = [];
const children = [];
let current = '';

function scenario(id, title) {
  current = id;
  console.log(`\n# ${id} · ${title}`);
}
function check(name, ok, detail = '') {
  results.push({ scenario: current, name, ok: Boolean(ok) });
  console.log(`${ok ? 'OK  ' : 'KO  '} ${current} · ${name}${detail ? ` : ${detail}` : ''}`);
}
function skip(name, reason) {
  results.push({ scenario: current, name, ok: true, skipped: true });
  console.log(`SAUT ${current} · ${name} : ${reason}`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const throws = (fn) => { try { fn(); return null; } catch (e) { return e.message; } };
const sameSet = (a, b) => a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|');
// Texte d'un MHTML : lignes douces du quoted-printable recollées (les accents restent encodés)
const mhtml = (file) => readFileSync(file, 'latin1').replace(/=\r?\n/g, '');

function startApp(script, env = {}) {
  const child = spawn(process.execPath, [join(SKILL, 'scripts', script)], { env: { ...ENV, PORT: '0', ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(child);
  let log = '';
  child.stdout.on('data', (d) => { log += d; });
  child.stderr.on('data', (d) => { log += d; });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${script} ne démarre pas :\n${log}`)), 15_000);
    const poll = setInterval(() => {
      const m = log.match(/http:\/\/127\.0\.0\.1:(\d+)/);
      if (!m) return;
      clearTimeout(timer);
      clearInterval(poll);
      resolve({ child, port: Number(m[1]), log: () => log });
    }, 50);
    child.on('exit', (code) => {
      clearTimeout(timer);
      clearInterval(poll);
      reject(new Error(`${script} arrêté (code ${code}) :\n${log}`));
    });
  });
}

/** Lance une commande sans bloquer ce processus, qui sert le faux Jira ; rend { status, stdout, stderr }. */
function run(cmd, args, { env = ENV, input = '', timeout = 120_000 } = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { env, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8').on('data', (d) => { stdout += d; });
    child.stderr.setEncoding('utf8').on('data', (d) => { stderr += d; });
    const timer = setTimeout(() => child.kill('SIGKILL'), timeout);
    child.on('error', (err) => { clearTimeout(timer); resolve({ status: null, stdout, stderr: stderr + err.message }); });
    child.on('close', (status) => { clearTimeout(timer); resolve({ status, stdout, stderr }); });
    child.stdin.end(input);
  });
}

function request(port, { method = 'GET', path = '/', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, method, path, headers }, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch { /* page HTML */ }
        resolve({ status: res.statusCode, text: data, json });
      });
    });
    req.on('error', reject);
    if (body !== undefined) req.write(body);
    req.end();
  });
}
const post = (port, path, obj, headers = {}) => request(port, {
  method: 'POST', path, body: JSON.stringify(obj),
  headers: { 'Content-Type': 'application/json', Origin: `http://127.0.0.1:${port}`, ...headers },
});

/** Contrôles d'hôte, d'origine et de type de contenu, communs aux deux interfaces. */
async function guards(port, label) {
  const page = await request(port, { path: '/' });
  check(`${label} : la page s'affiche`, page.status === 200 && /<html/.test(page.text), `HTTP ${page.status}`);
  const host = await request(port, { path: '/', headers: { Host: `evil.example.com:${port}` } });
  check(`${label} : hôte étranger refusé (rebond DNS)`, host.status === 403, `HTTP ${host.status}`);
  const origin = await post(port, '/api/close', {}, { Origin: 'https://evil.example.com' });
  check(`${label} : origine étrangère refusée`, origin.status === 403, `HTTP ${origin.status}`);
  const plain = await request(port, { method: 'POST', path: '/api/close', body: '{}', headers: { 'Content-Type': 'text/plain' } });
  check(`${label} : corps text/plain refusé`, plain.status === 415, `HTTP ${plain.status}`);
  const unknown = await request(port, { path: '/inconnu' });
  check(`${label} : route inconnue`, unknown.status === 404 && Boolean(unknown.json?.error), `HTTP ${unknown.status}`);
  return page.text;
}

/** Attend la fin de la capture en cours ; rend le dernier état. */
async function waitForJob(port, timeoutMs = 240_000) {
  const end = Date.now() + timeoutMs;
  for (;;) {
    const { json } = await request(port, { path: '/api/status' });
    if (json.job.state !== 'running' || Date.now() > end) return json;
    await sleep(500);
  }
}

// Résultat attendu de chaque ticket du backlog 42 (tests/fake-jira.mjs)
const EXPECTED = {
  'DEMOAB-3500': { category: 'ticket avec ia', where: 'contenu' },
  'DEMOCD-3501': { category: 'ticket sans ia', where: 'contenu' },
  'DEMOAB-3502': { category: 'ticket avec ia', where: 'contenu' },
  'DEMOEF-3600': { category: 'ticket sans ia', where: 'contenu masqué' },
  'DEMOAB-3700': { category: null, found: 0 },
  'DEMOAB-3800': { category: null, found: 2 },
  'DEMOAB-3900': { error: true },
  'DEMOAB-4500': { category: 'ticket avec ia', where: 'contenu' },
};
// Champs stables du rapport (point d'extension E1)
const REPORT_FIELDS = ['date', 'sprintUrl', 'folder', 'filter', 'categories', 'listed', 'selected', 'ignored', 'ignoredSample', 'counts', 'errors', 'aborted', 'tickets'];
const TICKET_FIELDS = ['key', 'url', 'category', 'found', 'where', 'excerpt', 'file', 'movedFrom'];

/** Vérifie le rapport et les fichiers d'une capture du backlog 42 filtrée sur DEMO, 3500 à 4500, dans `folder`. */
function verifyRun(report, folder) {
  check('tickets relevés sur la page', report.listed === BOARD_42.length + 1, `${report.listed} (dont l'épopée DEMOE-100)`);
  const keys = report.tickets.map((t) => t.key).join(' ');
  check('filtre (préfixe, bornes comprises), tri par numéro, navigation exclue', keys === Object.keys(EXPECTED).join(' ') && report.selected === 8
    && !keys.includes('DEMOAB-3650'), keys);
  for (const [key, exp] of Object.entries(EXPECTED)) {
    const t = report.tickets.find((x) => x.key === key) ?? {};
    let ok;
    let detail;
    if (exp.error) {
      ok = /session SSO expirée/.test(t.error ?? '') && !t.file && !existsSync(join(folder, UNCLASSIFIED, `${key}.mhtml`));
      detail = t.error;
    } else if (exp.category) {
      ok = t.category === exp.category && t.where === exp.where && existsSync(join(folder, t.file ?? '-'));
      detail = `${t.file} (${t.where}) ${t.excerpt ?? ''}`;
    } else {
      ok = t.category === null && t.found?.length === exp.found && t.file === `${UNCLASSIFIED}/${key}.mhtml` && existsSync(join(folder, t.file));
      detail = `${t.file}, trouvé : ${(t.found ?? []).join(' + ') || 'rien'}`;
    }
    check(`${key}${TICKETS[key].expired ? ' (session expirée)' : ''}`, ok, detail);
  }
  check('dossiers de catégorie directement dans le dossier choisi', report.folder === folder
    && sameSet(readdirSync(folder), ['ticket avec ia', 'ticket sans ia', UNCLASSIFIED, 'sprint.mhtml', 'rapport.json']), readdirSync(folder).join(', '));
  const files = report.tickets.filter((t) => t.file).map((t) => join(folder, t.file));
  check('chaque fichier est la page MHTML de son ticket', files.length === 7
    && files.every((f) => { const s = mhtml(f); return /^From: <Saved by Blink>/m.test(s) && s.includes(f.match(/([A-Z]+-\d+)\.mhtml$/)[1]); }));
  const lazy = join(folder, 'ticket avec ia', 'DEMOAB-4500.mhtml');
  check('commentaire chargé au défilement capturé', existsSync(lazy) && mhtml(lazy).includes('Commentaire charg'));
  const onDisk = JSON.parse(readFileSync(join(folder, 'rapport.json'), 'utf8'));
  check('page du sprint et rapport.json écrits', /^From: <Saved by Blink>/m.test(mhtml(join(folder, 'sprint.mhtml')))
    && JSON.stringify(onDisk.counts) === JSON.stringify(report.counts) && onDisk.tickets.length === 8);
  check('décompte', JSON.stringify(report.counts) === JSON.stringify({ 'ticket avec ia': 3, 'ticket sans ia': 2, [UNCLASSIFIED]: 2 })
    && report.errors === 1 && report.aborted === false, `${JSON.stringify(report.counts)}, erreurs : ${report.errors}`);
  return onDisk;
}

let fake;
try {
  // ------------------------------------------------------------------ fonctions pures
  scenario('R1', 'filtre des tickets');
  const f = parseFilter({ prefix: 'demo', min: '3500', max: '4500' });
  check('préfixe en majuscules, bornes en nombres', f.prefix === 'DEMO' && f.min === 3500 && f.max === 4500);
  check('filtre vide : il retient tout', matchesFilter('XYZ-1', parseFilter({})));
  check('bornes comprises', matchesFilter('DEMOAB-3500', f) && matchesFilter('DEMOAB-4500', f)
    && !matchesFilter('DEMOAB-3499', f) && !matchesFilter('DEMOAB-4501', f));
  check('le préfixe porte sur le début du projet', matchesFilter('demoab-3600', f) && !matchesFilter('AUTRE-3600', f) && !matchesFilter('XDEMO-3600', f));
  check('valeurs invalides refusées', ['1AB', 'A-B', 'é'].every((p) => throws(() => parseFilter({ prefix: p })))
    && throws(() => parseFilter({ min: 'abc' })) && throws(() => parseFilter({ min: '10', max: '5' })));

  scenario('R2', 'catégories');
  check('par défaut : ticket avec ia, ticket sans ia', parseCategories().join('|') === DEFAULT_CATEGORIES.join('|'));
  check('texte : une par ligne, ou séparées par « ; »', parseCategories('a\r\n b ;c').join('|') === 'a|b|c');
  check('nom de dossier invalide, doublon, « à classer » ou liste vide refusés',
    [['a/b'], ['x:'], ['.cache'], ['ticket avec ia', 'Ticket-avec-IA'], [UNCLASSIFIED], []].every((c) => throws(() => parseCategories(c))));

  scenario('R3', 'classement');
  const cls = (text) => classify([['contenu', text]], DEFAULT_CATEGORIES);
  check('graphies reconnues', ['ticket avec ia', 'Ticket-avec-IA', 'TICKET_AVEC_IA', 'TicketAvecIA', 'tîcket avec ïa']
    .every((s) => cls(s).category === 'ticket avec ia'));
  check('mots entiers seulement', ['tickets avec ia', 'ticket avec iam', 'unticket avec ia'].every((s) => cls(s).category === null));
  check('deux catégories : aucune retenue', cls('ticket avec ia, ticket sans ia').category === null
    && cls('ticket avec ia, ticket sans ia').found.length === 2);
  const ordered = classify([['contenu', 'rien'], ['contenu masqué', 'ticket sans ia'], ['page', 'ticket avec ia']], DEFAULT_CATEGORIES);
  check('le premier texte qui contient un terme décide', ordered.category === 'ticket sans ia' && ordered.where === 'contenu masqué');
  check('extrait autour du terme', /ticket avec ia/.test(cls('Étiquettes : ticket-avec-ia').excerpt ?? ''));

  scenario('R4', 'réglages et emplacements');
  check('dossier de sortie : relatif au dossier du skill, mhtml/ si vide', outputFolder('') === resolve(SKILL, 'mhtml')
    && outputFolder('x') === resolve(SKILL, 'x') && outputFolder(TMP) === TMP);
  check('profil : .jira-profile du skill, ou JIRA_CAPTURE_PROFILE', profileDir({}) === resolve(SKILL, '.jira-profile')
    && profileDir({ JIRA_CAPTURE_PROFILE: TMP }) === TMP && profileDir({ JIRA_CAPTURE_PROFILE: '' }) === resolve(SKILL, '.jira-profile'));
  check('navigateur : chrome par défaut, msedge, chromium de Playwright', browserChannel({}) === 'chrome'
    && browserChannel({ JIRA_CAPTURE_CHANNEL: '' }) === 'chrome' && browserChannel({ JIRA_CAPTURE_CHANNEL: 'msedge' }) === 'msedge'
    && browserChannel({ JIRA_CAPTURE_CHANNEL: 'chromium' }) === undefined);
  check("délai d'une page de ticket : 20 s, ou JIRA_CAPTURE_PAGE_TIMEOUT_MS", pageTimeoutMs({}) === 20_000
    && pageTimeoutMs({ JIRA_CAPTURE_PAGE_TIMEOUT_MS: '' }) === 20_000 && pageTimeoutMs({ JIRA_CAPTURE_PAGE_TIMEOUT_MS: '45000' }) === 45_000);

  scenario('R5', 'dépendance et fichiers de travail');
  const pkg = JSON.parse(readFileSync(join(SKILL, 'package.json'), 'utf8'));
  check('une seule dépendance, à version exacte : playwright-core 1.63.0', JSON.stringify(pkg.dependencies) === '{"playwright-core":"1.63.0"}'
    && pkg.engines?.node === '>=20');
  const ignore = readFileSync(join(SKILL, '.gitignore'), 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith('#'));
  check('.gitignore : profil, captures, exports et node_modules', ['node_modules/', '.jira-profile/', 'mhtml/', 'exports/', '*.mhtml'].every((l) => ignore.includes(l)), ignore.join(' '));

  fake = await startFakeJira();
  const backlog = `${fake.url}/jira/software/c/projects/DEMO/boards/42/backlog`;

  // ------------------------------------------------------------------ export par l'API (Node.js)
  scenario('R6', "export par l'API, interface Node.js");
  const api = await startApp('jira-sprint-app.mjs');
  await guards(api.port, 'export');
  const creds = { url: `${fake.url}/`, login: 'jean.dupont@example.com', password: 'motdepasse' };
  let r = await post(api.port, '/api/export', { ...creds, board: 'Équipe démo' });
  check('prochain sprint = date de début la plus proche', r.json?.sprint?.name === 'Sprint 7', r.json?.sprint?.name ?? r.json?.error);
  check('120 tickets sur trois pages', r.json?.tickets?.length === 120, `${r.json?.tickets?.length}`);
  const t1 = r.json?.tickets?.[0] ?? {};
  check('description ADF mise à plat, estimation, parent', t1.description === 'Critère : export 1' && t1.estimation === 2 && t1.parent === 'EPIC-1');
  check('ticket non assigné', r.json?.tickets?.[3]?.assigne === 'Non assigné');
  r = await post(api.port, '/api/export', { ...creds, board: '42', sprint: 'Sprint 8' });
  check('tableau par identifiant, sprint par nom', r.json?.sprint?.id === 7 && r.json?.tickets?.length === 3);
  r = await post(api.port, '/api/export', { ...creds, board: 'Équipe' });
  check('tableau ambigu signalé', r.status === 400 && /Plusieurs tableaux/.test(r.json?.error ?? ''));
  r = await post(api.port, '/api/export', { ...creds, password: 'faux', board: 'Équipe démo' });
  check('mauvais mot de passe', r.status === 401);
  check('aucun mot de passe dans le journal', !/motdepasse|faux/.test(api.log()));
  api.child.kill();

  // ------------------------------------------------------------------ export par l'API (Python)
  scenario('R7', "export par l'API, script Python");
  const PY = process.env.PYTHON || (process.platform === 'win32' ? 'py' : 'python3');
  if (spawnSync(PY, ['--version']).status !== 0) {
    skip('export Python', `${PY} introuvable`);
  } else {
    // Entrée vide : une invite éventuelle (variable vide supprimée par Windows) reçoit une réponse vide
    const py = (args, env) => run(PY, [join(SKILL, 'scripts', 'jira_sprint_export.py'), ...args], { env: { ...process.env, JIRA_URL: fake.url, ...env }, input: '\n' });
    let p = await py(['--board', 'Équipe démo', '--out', join(TMP, 'py')], { JIRA_EMAIL: 'jean.dupont@example.com', JIRA_TOKEN: 'jeton-demo' });
    const csv = existsSync(join(TMP, 'py')) ? readdirSync(join(TMP, 'py')).find((x) => x.endsWith('.csv')) : null;
    const rows = csv ? readFileSync(join(TMP, 'py', csv), 'utf8').trimEnd().split('\n') : []; // trim() ôterait le BOM
    check('e-mail et jeton : 120 tickets en CSV', p.status === 0 && rows.length === 121, `${p.status} ${p.stderr.trim()}`);
    check('CSV pour Excel (BOM, séparateur « ; »)', rows[0]?.startsWith('﻿cle;type;resume'));
    check('aucun jeton dans la sortie', !/jeton-demo/.test(p.stdout + p.stderr));
    p = await py(['--board', '42', '--sprint', 'Sprint 8', '--out', join(TMP, 'py2')], { JIRA_EMAIL: '', JIRA_TOKEN: 'pat-demo' });
    check('jeton personnel (Bearer)', p.status === 0 && /3 tickets exportés/.test(p.stdout), p.stdout.trim().split('\n')[2]);
    p = await py(['--board', '42', '--out', join(TMP, 'py3')], { JIRA_EMAIL: 'jean.dupont@example.com', JIRA_TOKEN: 'faux' });
    check('jeton refusé', p.status === 1 && /authentification refusée/.test(p.stderr));
  }

  // ------------------------------------------------------------------ capture, interface
  scenario('R8', 'interface de capture : hôte, origine, type de contenu');
  const app = await startApp('jira-capture-app.mjs');
  const port = app.port;
  const html = await guards(port, 'capture');
  check('aucun champ d\'identifiant ni de mot de passe dans la page', !/type="password"|autocomplete="(?:username|current-password)"/.test(html));

  scenario('R9', 'interface de capture : refus');
  r = await post(port, '/api/capture', {});
  check('capture refusée sans sprint ouvert', r.status === 409, r.json?.error);
  r = await post(port, '/api/open', { url: 'file:///etc/passwd' });
  check('adresse non http refusée', r.status === 400, r.json?.error);
  r = await post(port, '/api/open', { url: backlog });
  check('navigateur ouvert, après le SSO', r.status === 200 && /ouvert sur le sprint/.test(r.json?.message ?? ''), r.json?.message ?? r.json?.error);
  check('un passage par le SSO', fake.stats.ssoLogins === 1, `${fake.stats.ssoLogins}`);
  r = await post(port, '/api/capture', { prefix: '1AB' });
  check('préfixe invalide refusé', r.status === 400, r.json?.error);
  r = await post(port, '/api/capture', { categories: 'ticket avec ia\nà classer' });
  check('catégorie réservée refusée', r.status === 400, r.json?.error);

  scenario('R10', 'capture d\'un backlog chargé au défilement');
  const filter = { prefix: 'demo', min: '3500', max: '4500', categories: 'ticket avec ia\nticket sans ia' };
  const out = join(TMP, 'sortie');
  let started = Date.now();
  r = await post(port, '/api/capture', { ...filter, folder: out });
  check('lancée en tâche de fond', r.status === 202, r.json?.message);
  r = await post(port, '/api/capture', { ...filter, folder: out });
  check('une seule capture à la fois', r.status === 409, r.json?.error);
  let status = await waitForJob(port);
  check('terminée', status.job.state === 'done', `${status.job.state} en ${((Date.now() - started) / 1000).toFixed(1)} s ${status.job.error ?? ''}`);
  const onDisk = status.job.report ? verifyRun(status.job.report, out) : null;
  check('avec une erreur, le navigateur reste ouvert', status.browser === true);

  scenario('R18', 'point d\'extension E1 : champs stables du rapport');
  check('champs du rapport', onDisk && sameSet(Object.keys(onDisk), REPORT_FIELDS), Object.keys(onDisk ?? {}).join(', '));
  check('champs d\'un ticket capturé', sameSet(Object.keys(onDisk?.tickets.find((t) => t.file) ?? {}), TICKET_FIELDS));
  check('champs d\'un ticket en erreur', sameSet(Object.keys(onDisk?.tickets.find((t) => t.error) ?? {}), ['key', 'url', 'category', 'error']));

  scenario('R11', 'nouvelle capture dans le même dossier');
  TICKETS['DEMOAB-3700'] = { visible: 'Étiquettes : ticket-sans-ia' }; // la catégorie du ticket a changé dans Jira
  await post(port, '/api/capture', { ...filter, min: '3700', max: '3700', folder: out });
  status = await waitForJob(port);
  const again = status.job.report ?? { tickets: [] };
  check('revenu à la page du sprint après une erreur : le ticket est retrouvé', again.selected === 1 && again.listed === BOARD_42.length + 1, `${again.selected} sur ${again.listed}`);
  check('le ticket rejoint sa nouvelle catégorie, sa copie précédente est retirée',
    existsSync(join(out, 'ticket sans ia', 'DEMOAB-3700.mhtml')) && !existsSync(join(out, UNCLASSIFIED, 'DEMOAB-3700.mhtml'))
    && JSON.stringify(again.tickets[0]?.movedFrom) === JSON.stringify([UNCLASSIFIED]), JSON.stringify(again.tickets[0]?.movedFrom));
  check('les autres tickets restent en place, sans sous-dossier', existsSync(join(out, 'ticket avec ia', 'DEMOAB-3500.mhtml'))
    && sameSet(readdirSync(out), ['ticket avec ia', 'ticket sans ia', UNCLASSIFIED, 'sprint.mhtml', 'rapport.json']));
  check('sans erreur, le navigateur se ferme', again.errors === 0 && status.browser === false);
  TICKETS['DEMOAB-3700'] = {};

  scenario('R12', 'session SSO gardée dans le profil');
  r = await post(port, '/api/open', { url: `${backlog}?mode=virtual` });
  check('navigateur rouvert sans nouveau passage par le SSO', r.status === 200 && fake.stats.ssoLogins === 1, `${fake.stats.ssoLogins}`);

  scenario('R13', 'capture d\'un backlog virtualisé');
  const virtual = join(TMP, 'sortie-virtuelle');
  started = Date.now();
  await post(port, '/api/capture', { ...filter, folder: virtual });
  status = await waitForJob(port);
  check('terminée', status.job.state === 'done', `${((Date.now() - started) / 1000).toFixed(1)} s ${status.job.error ?? ''}`);
  if (status.job.report) verifyRun(status.job.report, virtual);

  scenario('R14', 'arrêt après trois échecs de suite');
  await post(port, '/api/open', { url: `${fake.url}/jira/software/c/projects/DEMO/boards/43/backlog` });
  await post(port, '/api/capture', { prefix: 'DEMOXP', folder: join(TMP, 'sortie-expiree') });
  status = await waitForJob(port);
  const expired = status.job.report ?? {};
  check('trois erreurs sur cinq tickets, capture arrêtée', expired.aborted === true && expired.errors === 3 && expired.selected === 5
    && expired.tickets.length === 3, `${expired.errors} erreurs sur ${expired.selected}, arrêt : ${expired.aborted}`);
  check('le navigateur reste ouvert', status.browser === true);

  scenario('R15', 'arrêt par « Fermer le navigateur »');
  await post(port, '/api/open', { url: backlog });
  await post(port, '/api/capture', { ...filter, folder: join(TMP, 'sortie-arretee') });
  for (let i = 0; i < 120; i++) { // attend le deuxième ticket
    const { json } = await request(port, { path: '/api/status' });
    if (json.job.step === 'tickets' && json.job.done >= 1) break;
    await sleep(250);
  }
  r = await post(port, '/api/close', {});
  check('la fermeture arrête la capture', r.status === 200 && /arrêtée/.test(r.json?.message ?? ''), r.json?.message);
  status = await waitForJob(port);
  check('rapport partiel', status.job.state === 'done' && status.job.report?.aborted === true
    && status.job.report.tickets.length < 8 && status.browser === false, `${status.job.report?.tickets.length} tickets`);

  // ------------------------------------------------------------------ page de l'interface, pilotée comme par l'utilisateur
  scenario('R16', "page de l'interface");
  const ui = await chromium.launch({ channel: browserChannel(), headless: true });
  try {
    const page = await ui.newPage();
    // Une attente dépassée devient un contrôle en échec, sans interrompre la recette
    const waitUi = (fn, timeout) => page.waitForFunction(fn, null, { timeout }).then(() => true, () => false);
    await page.goto(`http://127.0.0.1:${port}/`);
    await page.fill('#url', backlog);
    await page.fill('#prefix', 'demo');
    await page.fill('#min', '3500');
    await page.fill('#max', '4500');
    await page.fill('#folder', join(TMP, 'interface'));
    await page.click('#open');
    const opened = await waitUi(() => /ouvert sur le sprint/.test(document.getElementById('status').textContent), 30_000);
    check("« Capturer les tickets » activé après l'ouverture", opened && await page.isEnabled('#capture'));
    await page.click('#capture');
    const progress = await waitUi(() => /^Ticket \d+ sur 8 : DEMO/.test(document.getElementById('status').textContent), 60_000);
    check('avancement affiché, boutons bloqués', progress && await page.isVisible('#progress') && await page.isDisabled('#open') && await page.isDisabled('#capture'));
    await waitUi(() => !document.getElementById('report').hidden, 180_000);
    const statusText = await page.textContent('#status');
    check('bilan de fin', /Capture terminée : 7 tickets enregistrés sur 8, 1 en erreur/.test(statusText), statusText);
    const summary = (await page.textContent('#report-summary')).replace(/\s+/g, ' ');
    check('résumé du rapport', /retenus par le filtre : 8/.test(summary) && /ticket avec ia : 3/.test(summary) && /à classer : 2/.test(summary), summary);
    const rows = await page.$$eval('#report-rows tr', (trs) => trs.map((tr) => [...tr.cells].map((td) => td.textContent)));
    check('une ligne par ticket, erreur signalée', rows.length === 8
      && rows.find((x) => x[0] === 'DEMOAB-3900')?.[3].includes('session SSO') && rows.find((x) => x[0] === 'DEMOAB-3700')?.[1] === UNCLASSIFIED, `${rows.length} lignes`);
    check('avertissement après une erreur', await page.isVisible('#report-warning'));
    await page.screenshot({ path: join(TMP, 'interface.png'), fullPage: true });
    await page.reload();
    check('valeurs gardées dans le navigateur', await page.inputValue('#prefix') === 'demo'
      && await page.inputValue('#max') === '4500' && await page.inputValue('#url') === backlog);
  } finally {
    await ui.close();
  }
  await post(port, '/api/close', {});
  app.child.kill('SIGINT');
  await sleep(1000);

  // ------------------------------------------------------------------ capture, ligne de commande
  scenario('R17', 'ligne de commande');
  const cli = (args) => run(process.execPath, [join(SKILL, 'scripts', 'jira-capture-mhtml.mjs'), ...args], { input: '\n' });
  let c = await cli([]);
  check('adresse manquante : code 2', c.status === 2 && /Usage/.test(c.stderr));
  c = await cli([backlog, '--min', 'abc']);
  check('numéro invalide : code 2', c.status === 2 && /Numéro minimal invalide/.test(c.stderr));
  c = await cli([backlog, '--prefixe', 'demoab', '--min', '4500', '--max', '4500', '--sortie', join(TMP, 'cli')]);
  check('un ticket capturé et classé, directement dans le dossier', c.status === 0 && /retenus par le filtre : 1 /.test(c.stdout)
    && existsSync(join(TMP, 'cli', 'ticket avec ia', 'DEMOAB-4500.mhtml')), `${c.status} ${c.stderr.trim().split('\n')[0] ?? ''}`);
  c = await cli([backlog, '--prefixe', 'demoab', '--min', '3900', '--max', '3900', '--sortie', join(TMP, 'cli')]);
  check('un ticket en erreur : code 1', c.status === 1 && /DEMOAB-3900 : page du ticket non affichée/.test(c.stdout), `${c.status}`);

  scenario('R19', "point d'extension E2 : capture pilotable par un autre outil");
  const exported = Object.keys(core).filter((k) => typeof core[k] === 'function').sort();
  check('fonctions exportées par le module commun', ['captureSprintTickets', 'loadAllTickets', 'captureTicket', 'captureMhtml', 'launchBrowser',
    'classify', 'parseFilter', 'matchesFilter', 'parseCategories'].every((k) => exported.includes(k)), exported.join(', '));
} catch (err) {
  check('exécution', false, err.stack);
} finally {
  for (const child of children) if (child.exitCode === null) child.kill('SIGKILL');
  await fake?.close();
  const failed = results.filter((x) => !x.ok);
  const skipped = results.filter((x) => x.skipped).length;
  const scenarios = new Set(results.map((x) => x.scenario).filter(Boolean)).size;
  if (failed.length || process.env.KEEP_TMP) console.log(`\nDossier temporaire gardé pour l'examen : ${TMP}`);
  else {
    try {
      rmSync(TMP, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    } catch (err) { // sous Windows, un fichier du profil peut rester verrouillé un instant
      console.log(`\nDossier temporaire non effacé (${err.code}) : ${TMP}`);
    }
  }
  console.log(`\nBilan : ${scenarios} scénarios, ${results.length} contrôles, ${results.length - failed.length - skipped} réussis, ${failed.length} en échec, ${skipped} sautés · Node.js ${process.version}`);
  process.exit(failed.length ? 1 : 0);
}
```
