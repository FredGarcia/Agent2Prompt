---
name: interface
description: Interfaces de la capture (page locale sur 127.0.0.1:3100, champs de l'adresse, du filtre, des sections et du dossier gardés dans le navigateur, API HTTP open, capture, status et close, contrôle de l'hôte, de l'origine et du type de contenu, capture unique en tâche de fond, avancement et rapport, navigateur fermé ou gardé ouvert selon le résultat, arrêt par fermeture, ligne de commande et ses codes de sortie, sources de scripts/jira-capture-app.mjs, scripts/public/capture.html et scripts/jira-capture-mhtml.mjs). À lire pour lancer une capture, ou pour piloter l'interface depuis un agent.
dimensions: [D6]
status: active
---

# Module `interface` (D6)

Phase 7E couverte : Expression.

## 1. La page

`npm run capture`, puis http://127.0.0.1:3100. La page demande :

- l'adresse de la page du sprint : le backlog pour le prochain sprint (`…/boards/<n>/backlog` sur Jira Cloud, `RapidBoard.jspa?rapidView=<n>&view=planning` sur Data Center), le tableau pour le sprint en cours ;
- le préfixe des clés de tickets et les numéros de début et de fin (module `releve`) ;
- les sections de la page du sprint, une par ligne, `IA` et `DEV` par défaut : le texte de l'en-tête qui ouvre chaque section, et le nom de son dossier (module `classement`) ;
- le dossier de sortie : `mhtml` par défaut, relatif au dossier du skill, ou un chemin absolu.

Trois boutons : « Ouvrir le sprint », « Capturer les tickets », actif une fois le sprint ouvert, et « Fermer le navigateur ». Pendant la capture, une barre et une ligne d'état donnent l'avancement (« Ticket 3 sur 20 : ABCDE-3512… »). À la fin, la page affiche le rapport : nombre de tickets sur la page, retenus et ignorés, nombre par dossier, erreurs, avertissements sur les sections (D11.INV-6), puis une ligne par ticket avec son dossier et la ligne de l'en-tête de sa section, ou l'erreur. La ligne d'état est une région `aria-live` : un lecteur d'écran annonce l'avancement et le bilan.

Une section « Un ticket seul » capture un ticket par son adresse (module `ticket`) : champ de l'adresse, liste « Dossier », pré-remplie d'après le dernier `rapport.json` du dossier de sortie avec une phrase qui dit d'où vient la proposition, et bouton « Capturer ce ticket », actif une fois le navigateur ouvert. La ligne d'état donne le fichier écrit (« Ticket ABCDE-3512 enregistré : IA/ABCDE-3512.mhtml »).

Les valeurs saisies restent dans le navigateur du développeur, en stockage local, pour les fois suivantes (D6.INV-3). Les sections y ont leur propre clé depuis 1.1.0 : les catégories saisies en 1.0 ne sont pas reprises (module `classement`, § 7). Ni la page ni le serveur ne les écrivent ailleurs que dans `rapport.json`, avec la capture.

## 2. API HTTP

La page appelle le serveur ; un agent peut l'appeler de même (module `agent`). Corps JSON, `Content-Type: application/json`.

| Appel | Réponse | Effet |
|---|---|---|
| `GET /api/status` | `{ browser, job }` | `browser` : navigateur ouvert ; `job.state` : `idle`, `running`, `done` ou `failed` ; `step`, `done`, `total`, `key` pendant la capture ; `report` et `warnings`, les avertissements sur les sections, à la fin ; `error` en cas d'échec |
| `POST /api/open` `{ url }` | 200, message | ouvre le navigateur sur la page ; 400 si l'adresse n'est pas en http ou https ; 409 pendant une capture |
| `POST /api/capture` `{ prefix, min, max, categories, folder }` | 202 | lance la capture en tâche de fond ; `categories` : un en-tête de section par ligne ; 409 sans sprint ouvert ou pendant une capture ; 400 pour un filtre ou une catégorie invalides |
| `POST /api/ticket` `{ url, category, categories, folder }` | 202 | capture un ticket seul en tâche de fond, dans le dossier `category` (module `ticket`) ; 409 sans navigateur ouvert ou pendant une capture ; 400 pour une adresse sans clé ou un dossier hors des catégories et d'`à classer` ; `job.kind` vaut `ticket`, et `job.ticket` donne l'entrée du ticket à la fin |
| `GET /api/section?url=…&folder=…&categories=…` | `{ key, folder, known }` | dossier proposé pour ce ticket, d'après le dernier `rapport.json` du dossier de sortie ; 400 pour une adresse sans clé |
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
- Fermer le navigateur, par le bouton ou à la main, arrête la capture : le rapport partiel reste affiché ; fermé pendant le relevé, avant le premier ticket, un message le dit, sans rapport (D4.INV-4).
- Sans erreur, le navigateur se ferme à la fin. Après une erreur ou un arrêt, il reste ouvert et revient à la page du sprint : le développeur vérifie sa session, puis relance la capture dans le même dossier, qui remplace les fichiers des tickets recapturés (D11.INV-3).

## 5. Ligne de commande (D6.INV-5)

```bash
npm run capture:cli -- "https://jira.example.com/jira/software/c/projects/ABC/boards/42/backlog" --prefixe ABC --min 3500 --max 4500
```

Le navigateur s'ouvre sur la page ; une fois les tickets affichés, Entrée dans le terminal lance la capture, qui s'affiche ticket par ticket, puis le bilan et les avertissements sur les sections.

| Option | Rôle | Défaut |
|---|---|---|
| `--prefixe` | préfixe des clés | aucun : tous les tickets |
| `--min`, `--max` | numéros de début et de fin, compris | aucune borne |
| `--categorie` | un en-tête de section, répétable | `IA` et `DEV` |
| `--sortie` | dossier de sortie, relatif au dossier courant | `mhtml/` du dossier du skill |
| `--ticket` | adresse d'un ticket à capturer seul, au lieu de l'adresse du sprint (module `ticket`) | aucun |
| `--dossier` | avec `--ticket` : une des catégories ou `à classer` | celui du dernier `rapport.json` du dossier de sortie, sinon `à classer` |

Codes de sortie : 0 ; 1 si un ticket est en erreur ; 2 pour une adresse manquante ou une option invalide, dont `--dossier` sans `--ticket` et une adresse de ticket sans clé. Un second argument sans option vaut `--sortie`.

```bash
npm run capture:cli -- --ticket "https://jira.example.com/browse/ABC-3512" --dossier IA --sortie C:\Sprints\S25
```

## 6. Pièges connus

- **Page du sprint mal choisie** : un rapport à 0 ticket retenu signale le plus souvent que la page affichée n'était pas encore celle du sprint (connexion inachevée) ou que le filtre ne correspond pas aux clés.
- **Section introuvable** : « Aucun en-tête « DEV » suivi de tickets » signale une section qui porte un autre nom sur la page, ou une page qui n'est pas celle du sprint ; tous ses tickets sont alors dans `à classer` (module `classement`, § 4).
- **Deux interfaces** : la capture (3100) et l'export (3000) ont chacune leur port ; un port occupé se change par `PORT`.

## 7. Contrôle de sortie

- R8, R9, R10, R11, R14, R15, R16, R17 et R20 du module `recette` passent.
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
//      (préfixe, numéros) est ouvert, enregistré en MHTML et rangé dans le dossier de sa section, nommée par
//      l'en-tête (IA, DEV…) qui le précède sur la page du sprint. La page suit l'avancement, puis affiche le rapport.
//   3. « Capturer ce ticket » : un ticket seul, par son adresse, dans le dossier choisi (proposé d'après le dernier
//      rapport du dossier) ; le navigateur revient ensuite à la page où il était.
// Aucun identifiant ne passe par l'application. Session SSO dans .jira-profile/ et captures dans mhtml/ par
// défaut, dans le dossier du skill, que son .gitignore écarte.
// Node.js 20, playwright-core et Chrome installé sur le poste (ou Edge : JIRA_CAPTURE_CHANNEL=msedge).
// Usage, depuis le dossier du skill : npm run capture, puis ouvrir http://127.0.0.1:3100 (autre port : PORT).
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_CATEGORIES, captureSingleTicket, captureSprintTickets, firstLine, launchBrowser, outputFolder,
  parseCategories, parseFilter, parseTicketUrl, proposedFolder, sectionWarnings, UNCLASSIFIED,
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
    // Sans échec, le navigateur se ferme ; sinon, il revient au sprint pour une nouvelle tentative. La capture
    // n'est déclarée terminée qu'ensuite : une relance immédiate part de la page du sprint, chargée.
    if (!report.errors && !report.aborted) await closeSession();
    else if (!page.isClosed()) await page.goto(report.sprintUrl, { waitUntil: 'domcontentloaded' }).catch(() => {});
    Object.assign(current, { state: 'done', report, warnings: sectionWarnings(report) });
  }).catch((err) => {
    // Navigateur fermé pendant le relevé, avant tout ticket : rien n'a été capturé, il n'y a pas de rapport
    const error = page.isClosed()
      ? 'Capture arrêtée : le navigateur a été fermé pendant le relevé des tickets, avant toute capture'
      : `Capture interrompue (${firstLine(err)})`;
    if (!page.isClosed()) console.error(err);
    Object.assign(current, { state: 'failed', error });
  });
}

/** Lance la capture d'un ticket seul, par son adresse, en tâche de fond ; même suivi par GET /api/status. */
function startTicket(body) {
  if (!session) throw new HttpError(409, "Ouvrez d'abord le navigateur et connectez-vous");
  if (busy()) throw new HttpError(409, 'Une capture est déjà en cours');
  let ticket;
  let categories;
  try {
    ticket = parseTicketUrl(body.url);
    categories = parseCategories(body.categories ?? DEFAULT_CATEGORIES);
    const dir = String(body.category ?? '').trim() || UNCLASSIFIED;
    if (![...categories, UNCLASSIFIED].includes(dir)) throw new Error(`Dossier « ${dir} » : une des catégories ou « ${UNCLASSIFIED} » attendu`);
  } catch (err) {
    throw new HttpError(400, err.message);
  }
  const { context } = session;
  const page = session.page.isClosed() ? context.pages().at(-1) : session.page;
  if (!page) throw new HttpError(409, 'Aucun onglet ouvert : rouvrez le navigateur');
  const current = { state: 'running', kind: 'ticket', step: 'ticket', done: 0, total: 1, key: ticket.key, startedAt: Date.now() };
  job = current;
  captureSingleTicket(context, page, {
    url: ticket.url, folder: outputFolder(body.folder), category: body.category, categories,
  }).then((entry) => {
    Object.assign(current, { state: 'done', done: 1, ticket: entry });
  }).catch((err) => {
    Object.assign(current, { state: 'failed', error: `${ticket.key} : ${firstLine(err)}` });
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
    if (req.method === 'POST' && req.url === '/api/ticket') {
      startTicket(await readJson(req));
      return sendJson(res, 202, { message: 'Capture du ticket lancée' });
    }
    if (req.method === 'GET' && req.url.startsWith('/api/section?')) {
      const q = new URL(req.url, 'http://127.0.0.1').searchParams;
      try {
        const categories = parseCategories(q.get('categories') ?? DEFAULT_CATEGORIES);
        return sendJson(res, 200, await proposedFolder(outputFolder(q.get('folder')), q.get('url'), categories));
      } catch (err) {
        throw new HttpError(400, err.message);
      }
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
  input, textarea, select { padding: .5rem; font: inherit; border: 1px solid #9aa5b1; border-radius: 4px; }
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
  <li>Quand les tickets sont affichés, cliquez sur « Capturer les tickets ». Chaque ticket retenu par le filtre est ouvert, enregistré en MHTML et rangé dans le dossier de sa section (IA, DEV…).</li>
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

  <label>Sections de la page du sprint (une par ligne)
    <textarea id="sections" aria-describedby="sections-hint">IA
DEV</textarea>
    <span id="sections-hint" class="hint">Texte de l'en-tête qui ouvre la section, et nom du dossier ; un ticket qu'aucun en-tête ne précède va dans « à classer ».</span>
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

<h2>Un ticket seul</h2>
<p class="hint">Le navigateur doit être ouvert et connecté. Le ticket va dans le dossier de sortie ci-dessus, sous le dossier choisi ; le navigateur revient ensuite à la page où il était.</p>
<div class="grid">
  <label class="wide">Adresse du ticket
    <input id="ticket-url" type="url" placeholder="https://votre-org.atlassian.net/browse/ABC-123" spellcheck="false">
  </label>
  <label>Dossier
    <select id="ticket-folder" aria-describedby="ticket-folder-hint"></select>
    <span id="ticket-folder-hint" class="hint">Proposé d'après le dernier rapport du dossier de sortie ; « à classer » pour un ticket qu'il ne connaît pas.</span>
  </label>
</div>
<div class="buttons">
  <button id="ticket" type="button" disabled>Capturer ce ticket</button>
</div>

<progress id="progress" max="1" value="0" aria-label="Avancement de la capture" hidden></progress>
<div id="status" role="status" aria-live="polite"></div>

<section id="report" hidden>
  <h2>Rapport de la capture</h2>
  <p id="report-folder"></p>
  <ul id="report-summary"></ul>
  <p id="report-warning" class="warn" hidden></p>
  <table>
    <caption>Tickets capturés</caption>
    <thead><tr><th scope="col">Ticket</th><th scope="col">Dossier</th><th scope="col">En-tête de section ou erreur</th></tr></thead>
    <tbody id="report-rows"></tbody>
  </table>
</section>

<script>
  const $ = (id) => document.getElementById(id);
  const FIELDS = ['url', 'prefix', 'min', 'max', 'sections', 'folder', 'ticket-url'];
  const UNCLASSIFIED = 'à classer';
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
    $('ticket').disabled = running || !opened;
  }

  // Dossiers proposés pour un ticket seul : les sections saisies, puis « à classer »
  function fillFolders(selected) {
    const names = $('sections').value.split(/\r?\n|;/).map((s) => s.trim()).filter(Boolean);
    const select = $('ticket-folder');
    const keep = selected ?? select.value;
    select.replaceChildren(...[...names, UNCLASSIFIED].map((n) => { const o = el('option', n); o.value = n; return o; }));
    select.value = [...names, UNCLASSIFIED].includes(keep) ? keep : UNCLASSIFIED;
  }

  // Dossier du ticket dans le dernier rapport du dossier de sortie, s'il y figure
  async function proposeFolder() {
    fillFolders();
    const url = $('ticket-url').value.trim();
    if (!url) return;
    const q = new URLSearchParams({ url, folder: $('folder').value, categories: $('sections').value });
    try {
      const data = await call('GET', '/api/section?' + q);
      fillFolders(data.folder);
      $('ticket-folder-hint').textContent = data.known
        ? `${data.key} figure dans le dernier rapport : dossier « ${data.folder} » proposé.`
        : `${data.key} ne figure pas dans le dernier rapport du dossier : « à classer » proposé.`;
    } catch (err) {
      $('ticket-folder-hint').textContent = err.message;
    }
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

  function renderReport(report, warnings = []) {
    $('report').hidden = false;
    $('report-folder').textContent = `Dossier : ${report.folder}`;
    const summary = $('report-summary');
    summary.replaceChildren();
    const sample = report.ignoredSample.length ? ` (par exemple ${report.ignoredSample.slice(0, 5).join(', ')})` : '';
    summary.append(el('li', `Tickets sur la page du sprint : ${report.listed} ; retenus par le filtre : ${report.selected} ; ignorés : ${report.ignored}${sample}`));
    for (const [name, n] of Object.entries(report.counts)) summary.append(el('li', `${name} : ${n}`));
    summary.append(el('li', `erreurs : ${report.errors}`));

    const warning = $('report-warning');
    const notes = [...warnings];
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
      tr.append(t.error ? el('td', t.error, 'err') : el('td', t.excerpt ?? 'aucun en-tête de section avant ce ticket sur la page du sprint'));
      rows.append(tr);
    }
  }

  function showProgress(job) {
    const bar = $('progress');
    bar.hidden = false;
    if (job.step === 'ticket') {
      bar.removeAttribute('value');
      setStatus(`Capture du ticket ${job.key}…`);
    } else if (job.step === 'tickets' && job.total) {
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
        if (job.state === 'done' && job.kind === 'ticket') {
          const t = job.ticket;
          const moved = t.movedFrom?.length ? ` (copie précédente retirée de ${t.movedFrom.join(', ')})` : '';
          setStatus(`Ticket ${t.key} enregistré : ${t.file}${moved}. Le rapport du dossier est à jour.`);
        } else if (job.state === 'done') {
          const r = job.report;
          setStatus(`Capture terminée : ${r.tickets.length - r.errors} tickets enregistrés sur ${r.selected}${r.errors ? `, ${r.errors} en erreur` : ''}.`, r.errors > 0 || r.aborted);
          renderReport(r, job.warnings);
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
        categories: $('sections').value, folder: $('folder').value,
      });
      running = true;
      refreshButtons();
      poll();
    } catch (err) {
      setStatus('Erreur : ' + err.message, true);
    }
  });

  $('ticket').addEventListener('click', async () => {
    remember();
    try {
      await call('POST', '/api/ticket', {
        url: $('ticket-url').value.trim(), category: $('ticket-folder').value,
        categories: $('sections').value, folder: $('folder').value,
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
  for (const id of ['ticket-url', 'sections', 'folder']) $(id).addEventListener('change', proposeFolder);
  restore();
  proposeFolder();
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
//                          [--categorie IA --categorie DEV] [--sortie <dossier>]
//   npm run capture:cli -- --ticket "<adresse du ticket>" [--dossier IA] [--categorie …] [--sortie <dossier>]
//     un ticket seul : rangé sous --dossier (une catégorie ou « à classer ») ; par défaut, le dossier où le range le
//     dernier rapport.json du dossier de sortie, sinon « à classer ».
// Une catégorie est le texte d'un en-tête de section de la page du sprint, et le nom de son dossier (IA et DEV par
// défaut). Sortie : relative au dossier courant ; mhtml/ du dossier du skill par défaut. Les dossiers de catégorie y
// sont créés directement. Code de sortie : 0, 1 si un ticket est en erreur, 2 pour une option invalide.
import { resolve } from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import readline from 'node:readline/promises';
import { parseArgs } from 'node:util';
import {
  DEFAULT_CATEGORIES, DEFAULT_OUT_DIR, UNCLASSIFIED, captureSingleTicket, captureSprintTickets, launchBrowser,
  parseCategories, parseFilter, parseTicketUrl, proposedFolder, sectionWarnings,
} from './jira-capture-core.mjs';

const USAGE = 'Usage : node jira-capture-mhtml.mjs "<adresse de la page du sprint>" [--prefixe ABC] [--min N] [--max N] '
  + '[--categorie "<en-tête de section>"]… [--sortie <dossier>]\n'
  + '        node jira-capture-mhtml.mjs --ticket "<adresse du ticket>" [--dossier <catégorie ou à classer>] [--categorie …] [--sortie <dossier>]';

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
      ticket: { type: 'string' },
      dossier: { type: 'string' },
    },
  });
  if (values.ticket !== undefined) {
    if (positionals.length) throw new Error('--ticket : aucune adresse de sprint attendue');
    const categories = parseCategories(values.categorie ?? DEFAULT_CATEGORIES);
    const dossier = values.dossier?.trim();
    if (dossier && ![...categories, UNCLASSIFIED].includes(dossier)) {
      throw new Error(`Dossier « ${dossier} » : une des catégories ou « ${UNCLASSIFIED} » attendu`);
    }
    options = { ticket: parseTicketUrl(values.ticket), dossier, categories, folder: values.sortie };
  } else {
    if (values.dossier !== undefined) throw new Error('--dossier ne sert qu\'avec --ticket');
    if (positionals.length < 1 || positionals.length > 2) throw new Error('une adresse de page attendue');
    options = {
      url: positionals[0],
      folder: values.sortie ?? positionals[1], // second argument : ancienne forme, toujours acceptée
      filter: parseFilter({ prefix: values.prefixe, min: values.min, max: values.max }),
      categories: parseCategories(values.categorie ?? DEFAULT_CATEGORIES),
    };
  }
} catch (err) {
  console.error(`${err.message}\n${USAGE}`);
  process.exit(2);
}

if (options.ticket) {
  const folder = options.folder ? resolve(options.folder) : DEFAULT_OUT_DIR;
  const dossier = options.dossier ?? (await proposedFolder(folder, options.ticket.url, options.categories)).folder;
  const context = await launchBrowser();
  try {
    const page = context.pages()[0] ?? (await context.newPage());
    await page.goto(options.ticket.url, { waitUntil: 'domcontentloaded', timeout: 60_000 }).catch(() => {
      console.log("La page n'a pas fini de charger : terminez la connexion dans la fenêtre.");
    });
    const rl = readline.createInterface({ input, output });
    await rl.question(`Connectez-vous dans la fenêtre si besoin, puis appuyez sur Entrée pour capturer ${options.ticket.key} dans « ${dossier} »… `);
    rl.close();
    const entry = await captureSingleTicket(context, page, { url: options.ticket.url, folder, category: dossier, categories: options.categories });
    const moved = entry.movedFrom.length ? ` (copie précédente retirée de ${entry.movedFrom.join(', ')})` : '';
    console.log(`Ticket ${entry.key} enregistré : ${resolve(folder, entry.file)}${moved}`);
  } catch (err) {
    console.log(`${options.ticket.key} : ${err.message}`);
    process.exitCode = 1;
  } finally {
    await context.close();
  }
  process.exit(process.exitCode ?? 0);
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
    else if (!t.category) console.log(`  ${t.key} : à classer (aucun en-tête de section avant ce ticket)`);
  }
  for (const note of sectionWarnings(report)) console.log(`Attention : ${note}`);
  if (report.aborted) console.log('Capture arrêtée après plusieurs échecs de suite : vérifiez la session, puis relancez.');
  process.exitCode = report.errors ? 1 : 0;
} finally {
  await context.close();
}
```
