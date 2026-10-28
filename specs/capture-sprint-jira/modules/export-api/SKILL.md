---
name: export-api
description: Export des tickets du prochain sprint par l'API REST Agile de Jira, quand Jira accepte un mot de passe ou un jeton (interface locale Node avec identifiant et mot de passe, script Python avec jeton d'API Cloud ou jeton personnel Data Center, choix du tableau et du prochain sprint, pagination, description ADF mise à plat, CSV pour Excel, identifiants jamais écrits, sources de scripts/jira-sprint-app.mjs, scripts/public/index.html et scripts/jira_sprint_export.py). À lire seulement pour un Jira sans SSO, ou avec un jeton.
dimensions: [D8]
status: active
---

# Module `export-api` (D8)

Phase 7E couverte : Éléments.

## 1. Quand s'en servir

Derrière un SSO, l'API REST de Jira n'accepte pas le mot de passe, et Jira Cloud ne l'accepte jamais : seule la capture par le navigateur convient alors (modules `session` à `classement`). L'export par l'API sert à un Jira qui accepte l'authentification de base (Data Center sans SSO), ou à un développeur qui dispose d'un jeton d'API (Cloud) ou d'un jeton personnel (Data Center). Il rend des données structurées, pas des pages MHTML.

## 2. Interface Node

`npm run export`, puis http://127.0.0.1:3000 : URL de Jira, identifiant, mot de passe, tableau (nom ou identifiant), sprint, champ d'estimation. Laissé vide, le sprint est le prochain : le sprint futur qui démarre le plus tôt (D8.INV-2). Les tickets s'affichent en tableau, avec un bouton qui télécharge le CSV. Le serveur suit les règles de sécurité du module `interface`, § 3 (D6.INV-1). Le mot de passe passe dans l'en-tête `Authorization` de la requête en cours, puis n'existe plus ; le champ se vide après l'envoi (D8.INV-1).

## 3. Script Python

```bash
python3 scripts/jira_sprint_export.py --board "Nom du tableau" [--sprint "Sprint 24"] [--out exports] [--points-field customfield_10016]
```

L'URL, l'e-mail et le jeton se lisent dans `JIRA_URL`, `JIRA_EMAIL` et `JIRA_TOKEN`, ou à l'invite, jeton masqué. Avec un e-mail, l'authentification est Basic (jeton d'API Cloud) ; avec un e-mail vide, Bearer (jeton personnel Data Center). Sortie : un CSV en UTF-8 avec BOM et séparateur « ; », pour Excel, et un JSON, dans `exports/` du dossier du skill ou dans `--out` (D8.INV-3).

## 4. Règles communes

- Pagination suivie jusqu'au dernier élément : `isLast` pour les tableaux et les sprints, `total` pour les tickets (D8.INV-2).
- Un nom de tableau qui en désigne plusieurs est signalé avec leurs identifiants ; rien n'est choisi au hasard (D8.INV-2).
- Description au format ADF de Jira Cloud mise à plat en texte ; ticket sans assigné nommé « Non assigné » (D8.INV-3).
- Le champ d'estimation dépend de l'instance (`customfield_10016` par défaut) : il se trouve dans `<URL de Jira>/rest/api/2/field`.

## 5. Contrôle de sortie

- R6 et R7 du module `recette` passent ; R7 est sauté sans Python.
- Aucun identifiant dans le journal du serveur ni dans la sortie du script (D8.INV-1).

## 6. Sources

### `scripts/jira-sprint-app.mjs`

<!-- fichier : scripts/jira-sprint-app.mjs -->
```javascript
#!/usr/bin/env node
// jira-sprint-app.mjs : interface locale qui exporte les tickets du prochain sprint par l'API REST de Jira,
// avec un identifiant et un mot de passe (skill capture-sprint-jira). Pour un Jira sans SSO dont l'API accepte
// l'authentification de base (Data Center) ; Jira Cloud exige un jeton d'API à la place du mot de passe ;
// derrière un SSO, utiliser plutôt jira-capture-app.mjs.
// Node.js 20, sans dépendance. Les identifiants ne servent qu'à la requête en cours : ni stockés, ni journalisés.
// Usage, depuis le dossier du skill : npm run export, puis ouvrir http://127.0.0.1:3000 (autre port : PORT).

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT || 3000);
const PAGE_FILE = fileURLToPath(new URL('./public/index.html', import.meta.url));
const DEFAULT_POINTS_FIELD = 'customfield_10016'; // varie selon l'instance
const BASE_FIELDS = ['summary', 'status', 'assignee', 'priority', 'issuetype',
                     'labels', 'parent', 'issuelinks', 'description'];
const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost']);

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Nom d'hôte d'un en-tête Host (« 127.0.0.1:3000 » donne « 127.0.0.1 »). */
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

function authHeader(login, password) {
  return 'Basic ' + Buffer.from(`${login}:${password}`, 'utf8').toString('base64');
}

async function jira(baseUrl, auth, path, params = {}) {
  const url = new URL(baseUrl + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  let res;
  try {
    res = await fetch(url, { headers: { Accept: 'application/json', Authorization: auth } });
  } catch (err) {
    throw new HttpError(502, `Connexion impossible à ${url.origin} (${err.cause?.code ?? err.message})`);
  }
  if (res.status === 401) {
    throw new HttpError(401,
      "Authentification refusée. Sur Jira Cloud, l'API n'accepte pas le mot de passe : il faut un jeton d'API. " +
      "Sur Data Center, vérifiez l'identifiant et que l'authentification de base est activée.");
  }
  if (res.status === 403) throw new HttpError(403, `Accès refusé sur ${path}`);
  if (!res.ok) throw new HttpError(502, `Jira a répondu HTTP ${res.status} sur ${path}`);
  return res.json();
}

async function paginate(baseUrl, auth, path, params = {}, pageSize = 50) {
  const out = [];
  let startAt = 0;
  for (;;) {
    const data = await jira(baseUrl, auth, path, { ...params, startAt, maxResults: pageSize });
    const items = data.issues ?? data.values ?? [];
    out.push(...items);
    startAt += items.length;
    if (!items.length || data.isLast === true) break;
    if (data.total !== undefined && startAt >= data.total) break;
  }
  return out;
}

async function findBoard(baseUrl, auth, nameOrId) {
  if (/^\d+$/.test(nameOrId)) return jira(baseUrl, auth, `/rest/agile/1.0/board/${nameOrId}`);
  const boards = await paginate(baseUrl, auth, '/rest/agile/1.0/board', { name: nameOrId });
  const exact = boards.filter((b) => b.name.toLowerCase() === nameOrId.toLowerCase());
  const candidates = exact.length ? exact : boards;
  if (!candidates.length) throw new HttpError(404, `Aucun tableau nommé « ${nameOrId} »`);
  if (candidates.length > 1) {
    const list = candidates.map((b) => `${b.id} : ${b.name}`).join(' ; ');
    throw new HttpError(400, `Plusieurs tableaux correspondent, indiquez l'identifiant (${list})`);
  }
  return candidates[0];
}

async function pickSprint(baseUrl, auth, boardId, wanted) {
  const sprints = await paginate(baseUrl, auth, `/rest/agile/1.0/board/${boardId}/sprint`, { state: 'future' });
  if (!sprints.length) throw new HttpError(404, 'Aucun sprint futur sur ce tableau');
  if (wanted) {
    const match = sprints.find((s) => s.name === wanted || String(s.id) === wanted);
    if (!match) throw new HttpError(404, `Sprint « ${wanted} » introuvable parmi les sprints futurs`);
    return match;
  }
  // Le prochain sprint est celui qui démarre le plus tôt
  return sprints.reduce((a, b) => ((b.startDate ?? '9999') < (a.startDate ?? '9999') ? b : a));
}

// Extrait le texte d'une description (texte brut ou format ADF de Jira Cloud)
function textOf(node) {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(textOf).filter(Boolean).join(' ');
  if (typeof node === 'object') {
    if (typeof node.text === 'string') return node.text;
    return (node.content ?? []).map(textOf).filter(Boolean).join(' ');
  }
  return '';
}

function toRow(issue, pointsField) {
  const f = issue.fields ?? {};
  return {
    cle: issue.key,
    type: f.issuetype?.name ?? '',
    resume: f.summary ?? '',
    statut: f.status?.name ?? '',
    assigne: f.assignee?.displayName ?? 'Non assigné',
    priorite: f.priority?.name ?? '',
    estimation: f[pointsField] ?? '',
    parent: f.parent?.key ?? '',
    libelles: (f.labels ?? []).join(';'),
    nb_liens: (f.issuelinks ?? []).length,
    description: textOf(f.description).split(/\s+/).filter(Boolean).join(' '),
  };
}

async function exportSprint({ url, login, password, board, sprint, pointsField }) {
  const auth = authHeader(login, password);
  const b = await findBoard(url, auth, board);
  const s = await pickSprint(url, auth, b.id, sprint);
  const issues = await paginate(url, auth, `/rest/agile/1.0/sprint/${s.id}/issue`,
    { fields: [...BASE_FIELDS, pointsField].join(',') });
  return {
    board: { id: b.id, name: b.name },
    sprint: { id: s.id, name: s.name, state: s.state, startDate: s.startDate, endDate: s.endDate },
    tickets: issues.map((i) => toRow(i, pointsField)),
  };
}

function parseInput(body) {
  const required = (key) => {
    const v = String(body[key] ?? '').trim();
    if (!v) throw new HttpError(400, `Champ manquant : ${key}`);
    return v;
  };
  let url;
  try {
    url = new URL(required('url'));
  } catch {
    throw new HttpError(400, 'URL Jira invalide');
  }
  if (!['https:', 'http:'].includes(url.protocol)) throw new HttpError(400, 'URL Jira invalide');
  if (!body.password) throw new HttpError(400, 'Champ manquant : password');
  return {
    url: url.origin + url.pathname.replace(/\/+$/, ''),
    login: required('login'),
    password: String(body.password), // pas de trim : le mot de passe est pris tel quel
    board: required('board'),
    sprint: String(body.sprint ?? '').trim() || null,
    pointsField: String(body.pointsField ?? '').trim() || DEFAULT_POINTS_FIELD,
  };
}

async function readJson(req) {
  let data = '';
  for await (const chunk of req) {
    data += chunk;
    if (data.length > 100_000) throw new HttpError(413, 'Requête trop volumineuse');
  }
  try {
    return JSON.parse(data || '{}');
  } catch {
    throw new HttpError(400, 'Requête JSON invalide');
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  try {
    checkRequest(req);
    if (req.method === 'GET' && req.url === '/') {
      const html = await readFile(PAGE_FILE);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    }
    if (req.method === 'POST' && req.url === '/api/export') {
      const input = parseInput(await readJson(req));
      return sendJson(res, 200, await exportSprint(input));
    }
    sendJson(res, 404, { error: 'Introuvable' });
  } catch (err) {
    // Le message d'erreur ne contient jamais le mot de passe
    const status = err instanceof HttpError ? err.status : 500;
    const message = err instanceof HttpError ? err.message : 'Erreur interne';
    if (status === 500) console.error(err);
    sendJson(res, status, { error: message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Application prête : ouvrez http://${HOST}:${server.address().port} dans votre navigateur (Ctrl+C pour arrêter)`);
});
```

### `scripts/public/index.html`

<!-- fichier : scripts/public/index.html -->
```html
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Export des tickets du sprint Jira</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 1100px; margin: 2rem auto; padding: 0 1rem; color: #1f2933; }
  h1 { font-size: 1.5rem; }
  form { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; align-items: end; margin-bottom: 1rem; }
  label { display: flex; flex-direction: column; font-size: .9rem; gap: .25rem; }
  .wide { grid-column: 1 / -1; }
  input { padding: .5rem; font-size: 1rem; border: 1px solid #9aa5b1; border-radius: 4px; }
  button { padding: .6rem 1rem; font-size: 1rem; cursor: pointer; }
  button:disabled { opacity: .6; cursor: wait; }
  #status { min-height: 1.5rem; margin: .5rem 0; }
  .err { color: #b42318; }
  .note { font-size: .85rem; color: #52606d; }
  table { border-collapse: collapse; width: 100%; font-size: .85rem; margin-top: 1rem; }
  th, td { border: 1px solid #d9dee3; padding: .35rem .5rem; text-align: left; vertical-align: top; }
  th { background: #f0f3f6; }
  #result button { margin: .5rem 0; }
</style>
</head>
<body>
<h1>Export des tickets du prochain sprint</h1>
<p class="note">
  Vos identifiants restent sur cette machine. Ils sont transmis à votre Jira uniquement pour cette requête :
  ils ne sont ni enregistrés, ni journalisés, et le champ mot de passe est vidé après envoi.
</p>

<form id="f" autocomplete="off">
  <label class="wide">URL Jira
    <input name="url" required placeholder="https://votre-org.atlassian.net">
  </label>
  <label>Identifiant (e-mail ou login)
    <input name="login" required autocomplete="username">
  </label>
  <label>Mot de passe
    <input name="password" type="password" required autocomplete="current-password">
  </label>
  <label>Tableau (nom ou identifiant)
    <input name="board" required>
  </label>
  <label>Sprint (vide = prochain sprint)
    <input name="sprint">
  </label>
  <label class="wide">Champ d'estimation (facultatif)
    <input name="pointsField" placeholder="customfield_10016">
  </label>
  <div class="wide">
    <button id="go" type="submit">Exporter</button>
  </div>
</form>

<div id="status" role="status" aria-live="polite"></div>
<div id="result"></div>

<script>
  const $ = (id) => document.getElementById(id);
  let last = null;

  function el(tag, text) {
    const node = document.createElement(tag);
    node.textContent = text ?? '';
    return node;
  }

  function toCsv(rows) {
    if (!rows.length) return '';
    const cols = Object.keys(rows[0]);
    const esc = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    return [cols.join(';'), ...rows.map((r) => cols.map((c) => esc(r[c])).join(';'))].join('\r\n');
  }

  function download() {
    const blob = new Blob(['\ufeff' + toCsv(last.tickets)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = last.sprint.name.replace(/[^\w-]+/g, '_') + '.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function render(data) {
    last = data;
    const box = $('result');
    box.replaceChildren();

    const counts = {};
    data.tickets.forEach((t) => { counts[t.statut] = (counts[t.statut] || 0) + 1; });
    box.append(el('h2', `${data.sprint.name} : ${data.tickets.length} tickets`));
    box.append(el('p', Object.entries(counts).map(([k, v]) => `${k} : ${v}`).join('  |  ')));

    const btn = el('button', 'Télécharger le CSV');
    btn.type = 'button';
    btn.addEventListener('click', download);
    box.append(btn);

    const cols = ['cle', 'type', 'resume', 'statut', 'assigne', 'priorite', 'estimation', 'parent', 'libelles', 'nb_liens'];
    const table = document.createElement('table');
    const head = document.createElement('tr');
    cols.forEach((c) => head.append(el('th', c)));
    table.append(head);
    data.tickets.forEach((t) => {
      const tr = document.createElement('tr');
      cols.forEach((c) => tr.append(el('td', t[c])));
      table.append(tr);
    });
    box.append(table);
  }

  $('f').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = $('go');
    const status = $('status');
    status.className = '';
    status.textContent = 'Connexion à Jira…';
    btn.disabled = true;

    const payload = Object.fromEntries(new FormData(form));
    form.password.value = ''; // on ne garde pas le mot de passe affiché

    try {
      const r = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `Erreur HTTP ${r.status}`);
      status.textContent = '';
      render(data);
    } catch (err) {
      status.className = 'err';
      status.textContent = 'Erreur : ' + err.message;
    } finally {
      btn.disabled = false;
    }
  });
</script>
</body>
</html>
```

### `scripts/jira_sprint_export.py`

<!-- fichier : scripts/jira_sprint_export.py -->
```python
#!/usr/bin/env python3
"""
Exporte les tickets du prochain sprint d'un tableau Jira vers CSV et JSON, par l'API REST.

Python 3, bibliothèque standard uniquement, aucune installation nécessaire.
Les identifiants ne sont jamais enregistrés sur le disque : ils viennent des
variables d'environnement ou sont demandés à l'invite.

Jira Cloud (atlassian.net) : URL + e-mail + jeton d'API
  https://id.atlassian.com/manage-profile/security/api-tokens
Jira Data Center            : URL + jeton d'accès personnel (pas d'e-mail)
Derrière un SSO sans jeton : utiliser plutôt jira-capture-app.mjs.

Variables d'environnement facultatives :
  JIRA_URL, JIRA_EMAIL, JIRA_TOKEN

Exemples, depuis le dossier du skill capture-sprint-jira :
  python3 scripts/jira_sprint_export.py --board "Nom du tableau"
  python3 scripts/jira_sprint_export.py --board 42 --sprint "Sprint 24" --out exports

Sortie par défaut : exports/, dans le dossier du skill, que son .gitignore écarte.
"""

import argparse
import base64
import csv
import getpass
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from datetime import datetime
from pathlib import Path

DEFAULT_POINTS_FIELD = "customfield_10016"  # varie selon l'instance, à vérifier
DEFAULT_OUT_DIR = Path(__file__).resolve().parent.parent / "exports"  # dossier du skill
BASE_FIELDS = ["summary", "status", "assignee", "priority", "issuetype",
               "labels", "parent", "issuelinks", "description"]


def die(msg):
    sys.exit(f"Erreur : {msg}")


class JiraClient:
    def __init__(self, base_url, email, token):
        self.base = base_url.rstrip("/")
        if email:  # Cloud : authentification de base e-mail + jeton
            basic = base64.b64encode(f"{email}:{token}".encode()).decode()
            self.auth = f"Basic {basic}"
        else:      # Data Center : jeton d'accès personnel
            self.auth = f"Bearer {token}"

    def get(self, path, params=None):
        url = self.base + path
        if params:
            url += "?" + urllib.parse.urlencode(params)
        req = urllib.request.Request(
            url, headers={"Accept": "application/json", "Authorization": self.auth})
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.load(resp)
        except urllib.error.HTTPError as e:
            body = e.read()[:300].decode("utf-8", "replace")
            if e.code == 401:
                die("authentification refusée (vérifiez l'e-mail et le jeton)")
            if e.code == 403:
                die(f"accès refusé sur {path}")
            die(f"HTTP {e.code} sur {path} : {body}")
        except urllib.error.URLError as e:
            die(f"connexion impossible : {e.reason}")

    def paginate(self, path, params=None, page=50):
        params = dict(params or {})
        start, out = 0, []
        while True:
            params.update(startAt=start, maxResults=page)
            data = self.get(path, params)
            items = data.get("issues", data.get("values", []))
            if not items:
                break
            out.extend(items)
            start += len(items)
            if data.get("isLast") is True:
                break
            if "total" in data and start >= data["total"]:
                break
        return out


def find_board(client, name_or_id):
    if str(name_or_id).isdigit():
        return client.get(f"/rest/agile/1.0/board/{name_or_id}")
    boards = client.paginate("/rest/agile/1.0/board", {"name": name_or_id})
    exact = [b for b in boards if b["name"].lower() == name_or_id.lower()]
    candidates = exact or boards
    if not candidates:
        die(f"aucun tableau nommé « {name_or_id} »")
    if len(candidates) > 1:
        lines = "\n".join(f"  {b['id']} : {b['name']}" for b in candidates)
        die(f"plusieurs tableaux correspondent, précisez l'identifiant :\n{lines}")
    return candidates[0]


def pick_sprint(client, board_id, wanted):
    sprints = client.paginate(f"/rest/agile/1.0/board/{board_id}/sprint",
                              {"state": "future"})
    if not sprints:
        die("aucun sprint futur sur ce tableau")
    if wanted:
        match = [s for s in sprints if s["name"] == wanted or str(s["id"]) == wanted]
        if not match:
            die(f"sprint « {wanted} » introuvable parmi les sprints futurs")
        return match[0]
    # Le prochain sprint est celui qui démarre le plus tôt
    return min(sprints, key=lambda s: s.get("startDate") or "9999")


def fetch_issues(client, sprint_id, points_field):
    fields = ",".join(BASE_FIELDS + [points_field])
    return client.paginate(f"/rest/agile/1.0/sprint/{sprint_id}/issue",
                           {"fields": fields})


def text_of(node):
    """Extrait le texte d'une description (texte brut ou format ADF Jira Cloud)."""
    if node is None:
        return ""
    if isinstance(node, str):
        return node
    if isinstance(node, list):
        return " ".join(filter(None, (text_of(n) for n in node)))
    if isinstance(node, dict):
        if "text" in node:
            return node["text"]
        return " ".join(filter(None, (text_of(c) for c in node.get("content", []))))
    return ""


def to_row(issue, points_field):
    f = issue["fields"]
    return {
        "cle": issue["key"],
        "type": (f.get("issuetype") or {}).get("name", ""),
        "resume": f.get("summary", ""),
        "statut": (f.get("status") or {}).get("name", ""),
        "assigne": (f.get("assignee") or {}).get("displayName", "Non assigné"),
        "priorite": (f.get("priority") or {}).get("name", ""),
        "estimation": f.get(points_field, ""),
        "parent": (f.get("parent") or {}).get("key", ""),
        "libelles": ";".join(f.get("labels") or []),
        "nb_liens": len(f.get("issuelinks") or []),
        "description": " ".join(text_of(f.get("description")).split()),
    }


def write_outputs(rows, sprint, out_dir):
    out_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M")
    safe = "".join(c if c.isalnum() else "_" for c in sprint["name"])
    base = out_dir / f"{safe}_{stamp}"
    with open(f"{base}.csv", "w", newline="", encoding="utf-8-sig") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(rows[0].keys()), delimiter=";")
        writer.writeheader()
        writer.writerows(rows)
    with open(f"{base}.json", "w", encoding="utf-8") as fh:
        json.dump({"sprint": sprint, "tickets": rows}, fh, ensure_ascii=False, indent=2)
    return base


def main():
    parser = argparse.ArgumentParser(description="Export des tickets du prochain sprint Jira.")
    parser.add_argument("--board", required=True, help="nom ou identifiant du tableau")
    parser.add_argument("--sprint", help="nom ou identifiant du sprint (défaut : le prochain)")
    parser.add_argument("--out", default=str(DEFAULT_OUT_DIR),
                        help="dossier de sortie (défaut : exports/ du dossier du skill)")
    parser.add_argument("--points-field", default=DEFAULT_POINTS_FIELD,
                        help="identifiant du champ d'estimation")
    args = parser.parse_args()

    url = os.environ.get("JIRA_URL") or input("URL Jira (ex. https://votre-org.atlassian.net) : ").strip()
    email = os.environ.get("JIRA_EMAIL")
    if email is None:
        email = input("E-mail Atlassian (laisser vide pour Data Center) : ").strip() or None
    token = os.environ.get("JIRA_TOKEN") or getpass.getpass("Jeton d'API (saisie masquée) : ")

    client = JiraClient(url, email, token)
    board = find_board(client, args.board)
    print(f"Tableau : {board['name']} (id {board['id']})")

    sprint = pick_sprint(client, board["id"], args.sprint)
    print(f"Sprint : {sprint['name']} (id {sprint['id']})")

    issues = fetch_issues(client, sprint["id"], args.points_field)
    if not issues:
        die("aucun ticket dans ce sprint")
    rows = [to_row(i, args.points_field) for i in issues]

    base = write_outputs(rows, sprint, Path(args.out))
    print(f"{len(rows)} tickets exportés :")
    print(f"  {base}.csv")
    print(f"  {base}.json")
    print("Répartition par statut :", dict(Counter(r["statut"] for r in rows)))


if __name__ == "__main__":
    main()
```
