---
name: interface
description: Interfaces de la capture (page locale sur 127.0.0.1:3100, champs de l'adresse, du filtre, des catégories et du dossier gardés dans le navigateur, API HTTP open, capture, status et close, contrôle de l'hôte, de l'origine et du type de contenu, capture unique en tâche de fond, avancement et rapport, navigateur fermé ou gardé ouvert selon le résultat, arrêt par fermeture, ligne de commande et ses codes de sortie, sources de scripts/jira-capture-app.mjs, scripts/public/capture.html et scripts/jira-capture-mhtml.mjs). À lire pour lancer une capture, ou pour piloter l'interface depuis un agent.
dimensions: [D6]
status: active
---

# Module `interface` (D6)

Phase 7E couverte : Expression.

## 1. La page

`npm run capture`, puis http://127.0.0.1:3100. La page demande :

- l'adresse de la page du sprint : le backlog pour le prochain sprint (`…/boards/<n>/backlog` sur Jira Cloud, `RapidBoard.jspa?rapidView=<n>&view=planning` sur Data Center), le tableau pour le sprint en cours ;
- le préfixe des clés de tickets et les numéros de début et de fin (module `releve`) ;
- les catégories, une par ligne, `ticket avec ia` et `ticket sans ia` par défaut (module `classement`) ;
- le dossier de sortie : `mhtml` par défaut, relatif au dossier du skill, ou un chemin absolu.

Trois boutons : « Ouvrir le sprint », « Capturer les tickets », actif une fois le sprint ouvert, et « Fermer le navigateur ». Pendant la capture, une barre et une ligne d'état donnent l'avancement (« Ticket 3 sur 20 : ABCDE-3512… »). À la fin, la page affiche le rapport : nombre de tickets sur la page, retenus et ignorés, nombre par dossier, erreurs, puis une ligne par ticket avec son dossier, le terme trouvé et l'endroit, et l'extrait ou l'erreur. La ligne d'état est une région `aria-live` : un lecteur d'écran annonce l'avancement et le bilan.

Les valeurs saisies restent dans le navigateur du développeur, en stockage local, pour les fois suivantes (D6.INV-3). Ni la page ni le serveur ne les écrivent ailleurs que dans `rapport.json`, avec la capture.

## 2. API HTTP

La page appelle le serveur ; un agent peut l'appeler de même (module `agent`). Corps JSON, `Content-Type: application/json`.

| Appel | Réponse | Effet |
|---|---|---|
| `GET /api/status` | `{ browser, job }` | `browser` : navigateur ouvert ; `job.state` : `idle`, `running`, `done` ou `failed` ; `step`, `done`, `total`, `key` pendant la capture ; `report` à la fin ; `error` en cas d'échec |
| `POST /api/open` `{ url }` | 200, message | ouvre le navigateur sur la page ; 400 si l'adresse n'est pas en http ou https ; 409 pendant une capture |
| `POST /api/capture` `{ prefix, min, max, categories, folder }` | 202 | lance la capture en tâche de fond ; 409 sans sprint ouvert ou pendant une capture ; 400 pour un filtre ou une catégorie invalides |
| `POST /api/close` | 200, message | ferme le navigateur ; pendant une capture, l'arrête (« capture arrêtée ») |

## 3. Sécurité (D6.INV-1)

Le serveur écoute sur `127.0.0.1` seulement. Comme le serveur de GeminiBoard, il refuse :

- un en-tête `Host` autre que `127.0.0.1` ou `localhost` (403) : une page web ne peut pas le joindre par un nom de domaine qui pointerait vers `127.0.0.1` ;
- une origine autre que la sienne (403) : une page web ouverte dans le navigateur ne peut pas l'appeler ;
- un `POST` dont le corps n'est pas du JSON (415).

Aucun identifiant ne passe par l'interface : la page n'a aucun champ d'identifiant ni de mot de passe (D2.INV-1).

## 4. Capture en tâche de fond (D6.INV-2, D6.INV-4)

- Une seule capture à la fois : une seconde demande est refusée (409).
- L'avancement se lit par `GET /api/status`, que la page interroge chaque seconde. Rechargée, la page reprend l'affichage d'une capture en cours.
- Fermer le navigateur, par le bouton ou à la main, arrête la capture : le rapport partiel reste affiché (D4.INV-4).
- Sans erreur, le navigateur se ferme à la fin. Après une erreur ou un arrêt, il reste ouvert et revient à la page du sprint : le développeur vérifie sa session, puis relance la capture dans le même dossier, qui remplace les fichiers des tickets recapturés (D5.INV-4).

## 5. Ligne de commande (D6.INV-5)

```bash
npm run capture:cli -- "https://jira.example.com/jira/software/c/projects/ABC/boards/42/backlog" --prefixe ABC --min 3500 --max 4500
```

Le navigateur s'ouvre sur la page ; une fois les tickets affichés, Entrée dans le terminal lance la capture, qui s'affiche ticket par ticket, puis le bilan.

| Option | Rôle | Défaut |
|---|---|---|
| `--prefixe` | préfixe des clés | aucun : tous les tickets |
| `--min`, `--max` | numéros de début et de fin, compris | aucune borne |
| `--categorie` | une catégorie, répétable | `ticket avec ia` et `ticket sans ia` |
| `--sortie` | dossier de sortie, relatif au dossier courant | `mhtml/` du dossier du skill |

Codes de sortie : 0 ; 1 si un ticket est en erreur ; 2 pour une adresse manquante ou une option invalide. Un second argument sans option vaut `--sortie`.

## 6. Pièges connus

- **Page du sprint mal choisie** : un rapport à 0 ticket retenu signale le plus souvent que la page affichée n'était pas encore celle du sprint (connexion inachevée) ou que le filtre ne correspond pas aux clés.
- **Deux interfaces** : la capture (3100) et l'export (3000) ont chacune leur port ; un port occupé se change par `PORT`.

## 7. Contrôle de sortie

- R8, R9, R10, R11, R14, R15, R16 et R17 du module `recette` passent.
- Le développeur voit l'avancement, puis le rapport, et retrouve ses valeurs à la visite suivante.

## 8. Sources

### `scripts/jira-capture-app.mjs`

<!-- fichier : scripts/jira-capture-app.mjs -->
```javascript
#!/usr/bin/env node
// jira-capture-app.mjs : interface locale qui capture en MHTML les tickets d'un sprint Jira protégé par un SSO
// (skill capture-sprint-jira).
//   1. « Ouvrir le sprint » : le navigateur s'ouvre sur un profil dédié ; on s'y connecte soi-même (SSO, MFA).
//   2. « Capturer les tickets » : sur la page du sprint, chaque lien /browse/<CLÉ> retenu par le filtre
//      (préfixe, numéros) est ouvert, enregistré en MHTML et rangé dans le dossier de sa catégorie, reconnue
//      au terme clé que contient la page du ticket. La page suit l'avancement, puis affiche le rapport.
// Aucun identifiant ne passe par l'application. Session SSO dans .jira-profile/ et captures dans mhtml/ par
// défaut, dans le dossier du skill, que son .gitignore écarte.
// Node.js 20, playwright-core et Chrome installé sur le poste (ou Edge : JIRA_CAPTURE_CHANNEL=msedge).
// Usage, depuis le dossier du skill : npm run capture, puis ouvrir http://127.0.0.1:3100 (autre port : PORT).
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_CATEGORIES, captureSprintTickets, firstLine, launchBrowser, outputFolder, parseCategories, parseFilter,
} from './jira-capture-core.mjs';

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT || 3100);
const PAGE_FILE = fileURLToPath(new URL('./public/capture.html', import.meta.url));
const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost']);

let session = null; // { context, page }
let job = { state: 'idle' }; // state : idle, running, done, failed

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Nom d'hôte d'un en-tête Host (« 127.0.0.1:3100 » donne « 127.0.0.1 »). */
const hostnameOf = (host) => String(host ?? '').match(/^([^:]+)(?::\d+)?$/)?.[1].toLowerCase() ?? null;

// Hôte, origine et type de contenu contrôlés, comme le serveur du board (README, §11) : une page web
// ouverte dans le navigateur ne peut pas piloter l'application, même par un nom de domaine qui
// pointerait vers 127.0.0.1.
function checkRequest(req) {
  if (!LOCAL_HOSTS.has(hostnameOf(req.headers.host))) {
    throw new HttpError(403, "Hôte refusé : l'application ne répond qu'à 127.0.0.1 et localhost");
  }
  const origin = req.headers.origin;
  const port = req.socket.localPort;
  if (origin !== undefined && origin !== `http://127.0.0.1:${port}` && origin !== `http://localhost:${port}`) {
    throw new HttpError(403, `Origine refusée : ${origin}`);
  }
  if (req.method === 'POST' && !/^application\/json\s*(?:;|$)/i.test(String(req.headers['content-type'] ?? ''))) {
    throw new HttpError(415, 'Corps JSON attendu (Content-Type: application/json)');
  }
}

function parseUrl(raw) {
  let u;
  try {
    u = new URL(String(raw ?? '').trim());
  } catch {
    throw new HttpError(400, 'Adresse invalide');
  }
  if (!['http:', 'https:'].includes(u.protocol)) throw new HttpError(400, 'Adresse invalide : http ou https attendu');
  return u.href;
}

const busy = () => job.state === 'running';

async function closeSession() {
  const current = session;
  session = null;
  if (current) await current.context.close().catch(() => {});
}

/** Ouvre le navigateur sur la page ; rend false si la page n'a pas fini de charger (redirection SSO lente). */
async function openSprint(rawUrl) {
  if (busy()) throw new HttpError(409, 'Une capture est en cours');
  const url = parseUrl(rawUrl);
  await closeSession();
  let context;
  try {
    context = await launchBrowser();
  } catch (err) {
    throw new HttpError(500, `Impossible de lancer le navigateur (${firstLine(err)})`);
  }
  const current = { context, page: context.pages()[0] ?? (await context.newPage()) };
  session = current;
  context.on('close', () => { // fenêtre fermée à la main : la session est oubliée
    if (session === current) session = null;
  });
  try {
    await current.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    return true;
  } catch {
    return false; // la fenêtre reste ouverte : la connexion et la navigation s'y terminent à la main
  }
}

/** Lance la capture en tâche de fond ; l'avancement se lit par GET /api/status. */
function startCapture(body) {
  if (!session) throw new HttpError(409, "Ouvrez d'abord la page du sprint");
  if (busy()) throw new HttpError(409, 'Une capture est déjà en cours');
  let filter;
  let categories;
  try {
    filter = parseFilter(body);
    categories = parseCategories(body.categories ?? DEFAULT_CATEGORIES);
  } catch (err) {
    throw new HttpError(400, err.message);
  }
  const { context } = session;
  // L'onglet ouvert par l'application ; s'il a été fermé, le dernier onglet ouvert
  const page = session.page.isClosed() ? context.pages().at(-1) : session.page;
  if (!page) throw new HttpError(409, 'Aucun onglet ouvert : rouvrez le sprint');

  const current = { state: 'running', step: 'liste', done: 0, total: 0, key: null, startedAt: Date.now() };
  job = current;
  captureSprintTickets(context, page, {
    folder: outputFolder(body.folder), filter, categories, onProgress: (p) => Object.assign(current, p),
  }).then(async (report) => {
    Object.assign(current, { state: 'done', report });
    // Sans échec, le navigateur se ferme ; sinon, il revient au sprint pour une nouvelle tentative
    if (!report.errors && !report.aborted) await closeSession();
    else if (!page.isClosed()) await page.goto(report.sprintUrl, { waitUntil: 'domcontentloaded' }).catch(() => {});
  }).catch((err) => {
    console.error(err);
    Object.assign(current, { state: 'failed', error: `Capture interrompue (${firstLine(err)})` });
  });
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 10_000) throw new HttpError(413, 'Requête trop volumineuse');
  }
  try {
    return JSON.parse(raw || '{}');
  } catch {
    throw new HttpError(400, 'Requête JSON invalide');
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  try {
    checkRequest(req);
    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(await readFile(PAGE_FILE));
    }
    if (req.method === 'GET' && req.url === '/api/status') {
      return sendJson(res, 200, { browser: Boolean(session), job });
    }
    if (req.method === 'POST' && req.url === '/api/open') {
      const loaded = await openSprint((await readJson(req)).url);
      return sendJson(res, 200, {
        message: loaded
          ? "Le navigateur est ouvert sur le sprint. Connectez-vous, attendez l'affichage des tickets, puis cliquez sur « Capturer les tickets »."
          : "Le navigateur est ouvert, mais la page n'a pas fini de charger. Terminez la connexion dans la fenêtre, affichez le sprint, puis cliquez sur « Capturer les tickets ».",
      });
    }
    if (req.method === 'POST' && req.url === '/api/capture') {
      startCapture(await readJson(req));
      return sendJson(res, 202, { message: 'Capture lancée' });
    }
    if (req.method === 'POST' && req.url === '/api/close') {
      const stopping = busy(); // fermer le navigateur arrête la capture en cours, qui rend un rapport partiel
      await closeSession();
      return sendJson(res, 200, { message: stopping ? 'Navigateur fermé : capture arrêtée' : 'Navigateur fermé' });
    }
    sendJson(res, 404, { error: 'Introuvable' });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    if (status === 500) console.error(err);
    sendJson(res, status, { error: err instanceof HttpError ? err.message : 'Erreur interne' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Application prête : ouvrez http://${HOST}:${server.address().port} (Ctrl+C pour arrêter)`);
});

process.on('SIGINT', async () => {
  await closeSession();
  process.exit(0);
});
```

### `scripts/public/capture.html`

<!-- fichier : scripts/public/capture.html -->
```html
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Capture des tickets du sprint Jira</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 960px; margin: 2rem auto; padding: 0 1rem; color: #1f2933; }
  h1 { font-size: 1.5rem; }
  h2 { font-size: 1.2rem; margin-top: 2rem; }
  ol { line-height: 1.6; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem 1rem; }
  .wide { grid-column: 1 / -1; }
  label, legend { display: flex; flex-direction: column; gap: .3rem; font-size: .95rem; }
  fieldset { border: 0; margin: 0; padding: 0; display: flex; gap: .75rem; align-items: end; }
  legend { margin-bottom: .3rem; }
  input, textarea { padding: .5rem; font: inherit; border: 1px solid #9aa5b1; border-radius: 4px; }
  textarea { min-height: 3.5rem; resize: vertical; }
  .hint { font-size: .85rem; color: #52606d; }
  .buttons { display: flex; gap: .75rem; flex-wrap: wrap; margin: 1.25rem 0 .5rem; }
  button { padding: .6rem 1rem; font-size: 1rem; cursor: pointer; }
  button:disabled { opacity: .5; cursor: not-allowed; }
  progress { width: 100%; height: 1rem; }
  #status { min-height: 2.5rem; margin-top: .75rem; padding: .6rem; background: #f0f3f6; border-radius: 4px; white-space: pre-wrap; }
  #status.err { background: #fde8e8; color: #b42318; }
  .warn { background: #fff4e5; color: #7a4100; padding: .6rem; border-radius: 4px; }
  table { border-collapse: collapse; width: 100%; font-size: .85rem; margin-top: 1rem; }
  caption { text-align: left; font-weight: 600; margin-bottom: .4rem; }
  th, td { border: 1px solid #d9dee3; padding: .35rem .5rem; text-align: left; vertical-align: top; }
  th { background: #f0f3f6; }
  td.err { color: #b42318; }
  td:first-child { white-space: nowrap; }
  @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<h1>Capture des tickets du sprint (MHTML)</h1>

<ol>
  <li>Collez l'adresse de la page du sprint, puis cliquez sur « Ouvrir le sprint » : le navigateur s'ouvre, connectez-vous via le SSO.</li>
  <li>Quand les tickets sont affichés, cliquez sur « Capturer les tickets ». Chaque ticket retenu par le filtre est ouvert, enregistré en MHTML et rangé dans le dossier de sa catégorie.</li>
</ol>

<div class="grid">
  <label class="wide">Adresse de la page du sprint
    <input id="url" type="url" placeholder="https://votre-org.atlassian.net/jira/software/c/projects/XXX/boards/42/backlog">
  </label>

  <label>Préfixe des clés de tickets
    <input id="prefix" type="text" placeholder="ex. ABC" aria-describedby="prefix-hint" autocapitalize="characters" spellcheck="false">
    <span id="prefix-hint" class="hint">Début de la clé (ABC retient ABCDE-123) ; vide : tous les tickets.</span>
  </label>

  <fieldset>
    <legend>Numéros des tickets</legend>
    <label>de <input id="min" type="number" min="0" step="1" inputmode="numeric"></label>
    <label>à <input id="max" type="number" min="0" step="1" inputmode="numeric"></label>
  </fieldset>

  <label>Catégories (une par ligne)
    <textarea id="categories" aria-describedby="categories-hint">ticket avec ia
ticket sans ia</textarea>
    <span id="categories-hint" class="hint">Terme clé cherché dans la page du ticket, et nom du dossier ; sans terme, ou avec plusieurs : « à classer ».</span>
  </label>

  <label>Dossier de sortie
    <input id="folder" type="text" value="mhtml" aria-describedby="folder-hint" spellcheck="false">
    <span id="folder-hint" class="hint">Chemin absolu, ou relatif au dossier du skill ; les dossiers de catégorie y sont créés directement, et une nouvelle capture remplace celle des mêmes tickets.</span>
  </label>
</div>

<div class="buttons">
  <button id="open" type="button">Ouvrir le sprint</button>
  <button id="capture" type="button" disabled>Capturer les tickets</button>
  <button id="close" type="button">Fermer le navigateur</button>
</div>
<p class="hint">Les valeurs saisies sont gardées dans ce navigateur, pas dans le dépôt. Fermer le navigateur arrête une capture en cours.</p>

<progress id="progress" max="1" value="0" aria-label="Avancement de la capture" hidden></progress>
<div id="status" role="status" aria-live="polite"></div>

<section id="report" hidden>
  <h2>Rapport de la capture</h2>
  <p id="report-folder"></p>
  <ul id="report-summary"></ul>
  <p id="report-warning" class="warn" hidden></p>
  <table>
    <caption>Tickets capturés</caption>
    <thead><tr><th scope="col">Ticket</th><th scope="col">Dossier</th><th scope="col">Terme trouvé</th><th scope="col">Extrait ou erreur</th></tr></thead>
    <tbody id="report-rows"></tbody>
  </table>
</section>

<script>
  const $ = (id) => document.getElementById(id);
  const FIELDS = ['url', 'prefix', 'min', 'max', 'categories', 'folder'];
  const STORE = 'jira-capture:';
  let opened = false;
  let running = false;

  // Valeurs gardées dans ce navigateur (stockage local) : jamais dans le dépôt
  function restore() {
    for (const id of FIELDS) {
      try { const v = localStorage.getItem(STORE + id); if (v !== null) $(id).value = v; } catch { /* stockage indisponible */ }
    }
  }
  function remember() {
    for (const id of FIELDS) {
      try { localStorage.setItem(STORE + id, $(id).value); } catch { /* stockage indisponible */ }
    }
  }

  function setStatus(text, isError = false) {
    const el = $('status');
    if (el.textContent !== text) el.textContent = text; // pas de nouvelle annonce si rien ne change
    el.className = isError ? 'err' : '';
  }

  function refreshButtons() {
    $('open').disabled = running;
    $('capture').disabled = running || !opened;
  }

  async function call(method, url, body) {
    const r = await fetch(url, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || `Erreur HTTP ${r.status}`);
    return data;
  }

  function el(tag, text, className) {
    const node = document.createElement(tag);
    node.textContent = text ?? '';
    if (className) node.className = className;
    return node;
  }

  function renderReport(report) {
    $('report').hidden = false;
    $('report-folder').textContent = `Dossier : ${report.folder}`;
    const summary = $('report-summary');
    summary.replaceChildren();
    const sample = report.ignoredSample.length ? ` (par exemple ${report.ignoredSample.slice(0, 5).join(', ')})` : '';
    summary.append(el('li', `Tickets sur la page du sprint : ${report.listed} ; retenus par le filtre : ${report.selected} ; ignorés : ${report.ignored}${sample}`));
    for (const [name, n] of Object.entries(report.counts)) summary.append(el('li', `${name} : ${n}`));
    summary.append(el('li', `erreurs : ${report.errors}`));

    const warning = $('report-warning');
    const notes = [];
    if (report.selected === 0) notes.push('Aucun ticket ne passe le filtre : vérifiez le préfixe et les numéros, et que la page affichée est bien celle du sprint.');
    if (report.aborted) notes.push('Capture arrêtée après plusieurs échecs de suite : vérifiez la session dans le navigateur, resté ouvert sur le sprint, puis relancez.');
    else if (report.errors) notes.push('Des tickets ont échoué : le navigateur est resté ouvert sur le sprint, relancez la capture.');
    warning.textContent = notes.join(' ');
    warning.hidden = notes.length === 0;

    const rows = $('report-rows');
    rows.replaceChildren();
    for (const t of report.tickets) {
      const tr = document.createElement('tr');
      const keyCell = document.createElement('td');
      const link = el('a', t.key);
      link.href = t.url;
      link.target = '_blank';
      link.rel = 'noopener';
      keyCell.append(link);
      tr.append(keyCell);
      const moved = t.movedFrom?.length ? ` (copie précédente retirée de ${t.movedFrom.join(', ')})` : '';
      tr.append(el('td', t.error ? '—' : (t.category ?? 'à classer') + moved));
      tr.append(el('td', t.error ? '—' : t.found.length ? `${t.found.join(' + ')} (${t.where})` : 'aucun'));
      tr.append(t.error ? el('td', t.error, 'err') : el('td', t.excerpt ?? (t.found.length > 1 ? 'plusieurs catégories trouvées' : 'aucun terme clé dans la page')));
      rows.append(tr);
    }
  }

  function showProgress(job) {
    const bar = $('progress');
    bar.hidden = false;
    if (job.step === 'tickets' && job.total) {
      bar.max = job.total;
      bar.value = job.done;
      setStatus(`Ticket ${job.done + 1} sur ${job.total} : ${job.key}…`);
    } else {
      bar.removeAttribute('value'); // avancement indéterminé
      setStatus('Relevé des tickets sur la page du sprint…');
    }
  }

  async function poll() {
    try {
      const { browser, job } = await call('GET', '/api/status');
      opened = browser;
      running = job.state === 'running';
      if (running) {
        showProgress(job);
        setTimeout(poll, 1000);
      } else {
        $('progress').hidden = true;
        if (job.state === 'done') {
          const r = job.report;
          setStatus(`Capture terminée : ${r.tickets.length - r.errors} tickets enregistrés sur ${r.selected}${r.errors ? `, ${r.errors} en erreur` : ''}.`, r.errors > 0 || r.aborted);
          renderReport(r);
        } else if (job.state === 'failed') {
          setStatus(job.error, true);
        }
      }
    } catch (err) {
      running = false;
      setStatus('Erreur : ' + err.message, true);
    }
    refreshButtons();
  }

  $('open').addEventListener('click', async () => {
    remember();
    $('open').disabled = true;
    setStatus('Ouverture du navigateur…');
    try {
      const data = await call('POST', '/api/open', { url: $('url').value.trim() });
      opened = true;
      setStatus(data.message);
    } catch (err) {
      opened = false;
      setStatus('Erreur : ' + err.message, true);
    }
    refreshButtons();
  });

  $('capture').addEventListener('click', async () => {
    remember();
    $('report').hidden = true;
    try {
      await call('POST', '/api/capture', {
        prefix: $('prefix').value, min: $('min').value, max: $('max').value,
        categories: $('categories').value, folder: $('folder').value,
      });
      running = true;
      refreshButtons();
      poll();
    } catch (err) {
      setStatus('Erreur : ' + err.message, true);
    }
  });

  $('close').addEventListener('click', async () => {
    try {
      const data = await call('POST', '/api/close', {});
      opened = false;
      setStatus(data.message);
    } catch (err) {
      setStatus('Erreur : ' + err.message, true);
    }
    refreshButtons();
  });

  for (const id of FIELDS) $(id).addEventListener('change', remember);
  restore();
  poll(); // reprend l'avancement d'une capture en cours si la page est rechargée
</script>
</body>
</html>
```

### `scripts/jira-capture-mhtml.mjs`

<!-- fichier : scripts/jira-capture-mhtml.mjs -->
```javascript
#!/usr/bin/env node
// jira-capture-mhtml.mjs : la capture de jira-capture-app.mjs, en ligne de commande (skill capture-sprint-jira).
// Le navigateur s'ouvre sur la page du sprint ; on s'y connecte soi-même (SSO, MFA), puis Entrée dans le terminal
// lance la capture des tickets. Aucun identifiant ne passe par le script : la session SSO reste dans
// .jira-profile/, dans le dossier du skill.
// Usage, depuis le dossier du skill :
//   npm run capture:cli -- "<adresse de la page du sprint>" [--prefixe ABC] [--min 100] [--max 200]
//                          [--categorie "ticket avec ia" --categorie "ticket sans ia"] [--sortie <dossier>]
// Sortie : relative au dossier courant ; mhtml/ du dossier du skill par défaut. Les dossiers de catégorie y sont
// créés directement. Code de sortie : 0, 1 si un ticket est en erreur, 2 pour une option invalide.
import { resolve } from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import readline from 'node:readline/promises';
import { parseArgs } from 'node:util';
import {
  DEFAULT_CATEGORIES, DEFAULT_OUT_DIR, captureSprintTickets, launchBrowser, parseCategories, parseFilter,
} from './jira-capture-core.mjs';

const USAGE = 'Usage : node jira-capture-mhtml.mjs "<adresse de la page du sprint>" [--prefixe ABC] [--min N] [--max N] '
  + '[--categorie "<terme>"]… [--sortie <dossier>]';

let options;
try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      prefixe: { type: 'string' },
      min: { type: 'string' },
      max: { type: 'string' },
      categorie: { type: 'string', multiple: true },
      sortie: { type: 'string' },
    },
  });
  if (positionals.length < 1 || positionals.length > 2) throw new Error('une adresse de page attendue');
  options = {
    url: positionals[0],
    folder: values.sortie ?? positionals[1], // second argument : ancienne forme, toujours acceptée
    filter: parseFilter({ prefix: values.prefixe, min: values.min, max: values.max }),
    categories: parseCategories(values.categorie ?? DEFAULT_CATEGORIES),
  };
} catch (err) {
  console.error(`${err.message}\n${USAGE}`);
  process.exit(2);
}

const context = await launchBrowser();
try {
  const page = context.pages()[0] ?? (await context.newPage());
  await page.goto(options.url, { waitUntil: 'domcontentloaded', timeout: 60_000 }).catch(() => {
    console.log("La page n'a pas fini de charger : terminez la connexion dans la fenêtre.");
  });

  const rl = readline.createInterface({ input, output });
  await rl.question('Connectez-vous dans la fenêtre, attendez que les tickets soient affichés, puis appuyez sur Entrée… ');
  rl.close();

  const report = await captureSprintTickets(context, page, {
    folder: options.folder ? resolve(options.folder) : DEFAULT_OUT_DIR,
    filter: options.filter,
    categories: options.categories,
    onProgress: ({ step, done, total, key }) => {
      if (step === 'liste') console.log('Relevé des tickets sur la page du sprint…');
      if (step === 'tickets') console.log(`  [${done + 1}/${total}] ${key}`);
    },
  });

  console.log(`\nDossier : ${report.folder}`);
  console.log(`Tickets sur la page du sprint : ${report.listed} ; retenus par le filtre : ${report.selected} ; ignorés : ${report.ignored}`);
  for (const [name, n] of Object.entries(report.counts)) console.log(`  ${name} : ${n}`);
  console.log(`  erreurs : ${report.errors}`);
  for (const t of report.tickets) {
    if (t.error) console.log(`  ${t.key} : ${t.error}`);
    else if (!t.category) console.log(`  ${t.key} : à classer (${t.found.length ? `trouvé : ${t.found.join(' + ')}` : 'aucun terme clé'})`);
  }
  if (report.aborted) console.log('Capture arrêtée après plusieurs échecs de suite : vérifiez la session, puis relancez.');
  process.exitCode = report.errors ? 1 : 0;
} finally {
  await context.close();
}
```
