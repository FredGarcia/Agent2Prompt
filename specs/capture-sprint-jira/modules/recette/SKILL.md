---
name: recette
description: Recette du skill (npm test, sous Windows, Linux et, sans écran, sous xvfb-run, profil et dossiers temporaires, faux Jira local avec API REST paginée, SSO simulé, backlogs à sections IA et DEV chargés au défilement ou virtualisés, tableau à couloirs, pages de tickets et session expirée, table des 19 scénarios R1 à R19 rattachés aux invariants de D1 à D4, D6, D8 et D11 et aux points d'extension, contrôle de la recette par douze défauts réintroduits, recette en CI sur ubuntu-latest et windows-latest, sources de tests/fake-jira.mjs et tests/run-tests.mjs). À lire pour installer le skill, et avant de publier une version.
dimensions: [D1, D2, D3, D4, D6, D8, D11]
status: active
---

# Module `recette` (D1 à D4, D6, D8, D11)

## 1. Lancer la recette

```bash
npm test
```

- Sous Linux sans écran : `xvfb-run -a npm test`. La capture ouvre une fenêtre visible, comme sur le poste du développeur.
- Le navigateur est celui de `JIRA_CAPTURE_CHANNEL` : Chrome par défaut ; `chromium` après `npx playwright-core install chromium`.
- Python : la variable `PYTHON`, à défaut `py` sous Windows et `python3` ailleurs ; s'il manque, R7 est sauté.
- La recette travaille sur un profil et des dossiers temporaires : la session et les captures du dossier du skill ne sont pas touchées. Elle efface ses dossiers temporaires si tout passe ; sinon, ou avec `KEEP_TMP=1`, elle les garde et en donne le chemin, avec une capture d'écran de l'interface.
- Durée : environ 4 min 30 s, dont 51 s pour la capture du backlog chargé au défilement et 77 s pour le backlog virtualisé.
- Bilan attendu : `19 scénarios, 115 contrôles, 115 réussis, 0 en échec, 0 sautés` ; sans Python, `111 contrôles, 110 réussis, 0 en échec, 1 sautés`, R7 étant sauté.

## 2. Le faux Jira

`tests/fake-jira.mjs` sert, sur `127.0.0.1` et un port libre, sans réseau ni compte :

- une API REST Agile : deux tableaux aux noms proches, trois sprints futurs paginés deux par deux, 120 tickets paginés cinquante par cinquante, descriptions en texte ou en ADF, authentification Basic ou Bearer ;
- un SSO simulé : sans cookie, un détour par `/sso/login`, qui pose un cookie persistant et compte ses passages ;
- le backlog 42, liste plate : 71 cartes (60 hors plage, trois hors filtre, les huit du sprint) et deux lignes d'en-tête, `<span>IA</span> · 3 tickets` et `<span>DEV</span> · 4 tickets` ; dix cartes hors plage ouvrent la section `IA`, plus longue que la zone virtualisée, si bien que son en-tête sort de la page avant ses tickets ; une épopée liée en lien absolu et en minuscules ; l'en-tête de la page cite un ticket récent, dans la plage, et des filtres rapides `IA` et `DEV` ; chargé quinze lignes par quinze au défilement, et tant que la liste ne remplit pas sa zone, comme Jira, ou virtualisé avec `?mode=virtual`, dans une zone de 80 pixels de haut, comme dans une fenêtre réduite, qui retire les en-têtes sortis de l'écran comme les cartes ;
- le backlog 43 : cinq tickets dont la session a expiré, sans section ;
- le tableau 44, à couloirs : `IA` (`DEMOAB-3500`, `DEMOAB-3502`), `DEV` (`DEMOCD-3501`) et `Autres` (`DEMOEF-3600`), chacun avec son en-tête et ses cartes, sous une barre de filtres rapides `IA` et `DEV` hors navigation ;
- les pages de tickets, rendues 400 ms après le chargement, comme une application monopage, chacune avec un menu de navigation qui cite `IA` et `DEV`.

Place des tickets du sprint dans le backlog 42 :

| Ticket | Place dans le backlog | Résultat attendu |
|---|---|---|
| `DEMOAB-3700` | avant le premier en-tête | `à classer` |
| `DEMOAB-3500` | section `IA` | `IA` |
| `DEMOAB-3502` | section `IA` ; un `DEV` masqué dans sa carte | `IA`, le `DEV` masqué ignoré |
| `DEMOAB-4500` | section `IA` ; un commentaire chargé au défilement dans sa page | `IA`, commentaire dans le fichier |
| `DEMOCD-3501` | section `DEV` | `DEV` |
| `DEMOEF-3600` | section `DEV` | `DEV` |
| `DEMOAB-3800` | section `DEV` | `DEV` |
| `DEMOAB-3900` | section `DEV` ; renvoi vers la page de connexion d'une autre origine | erreur, session expirée |

## 3. Scénarios

| ID | Scénario | Invariants |
|---|---|---|
| R1 | Filtre : préfixe mis en majuscules, filtre vide qui retient tout, bornes comprises, préfixe porté sur la partie projet, valeurs invalides refusées | D3.INV-2 |
| R2 | Catégories : `IA` et `DEV` par défaut, texte à une catégorie par ligne ou séparées par « ; », nom de dossier invalide, doublon une fois normalisé, `à classer` et liste vide refusés | D11.INV-4 |
| R3 | Sections : en-tête, ticket avant le premier en-tête, section reportée d'un pas à l'autre d'une liste virtualisée, ticket déjà relevé inchangé, fin d'un couloir, avertissements ; tableau 44 à couloirs, couloir `Autres` à classer, filtres rapides ignorés, un en-tête compté par couloir ; liste plate dont seul l'en-tête `IA` est présent | D11.INV-1, D11.INV-2, D11.INV-6 |
| R4 | Réglages et emplacements : dossier de sortie, profil, canal, délai ; variables vides | D1.INV-2, D1.INV-3 |
| R5 | Dépendance unique à version exacte ; `.gitignore` du skill | D1.INV-1, D1.INV-2 |
| R6 | Export Node : hôte, origine, type de contenu ; prochain sprint ; 120 tickets sur trois pages ; ADF ; tableau par identifiant ; tableau ambigu ; mot de passe refusé ; aucun mot de passe dans le journal | D6.INV-1, D8.INV-1, D8.INV-2, D8.INV-3 |
| R7 | Export Python : e-mail et jeton (Basic), jeton personnel (Bearer), CSV pour Excel, aucun jeton dans la sortie, jeton refusé | D8.INV-1, D8.INV-2, D8.INV-3 |
| R8 | Interface de capture : hôte, origine, type de contenu ; aucun champ d'identifiant | D6.INV-1, D2.INV-1 |
| R9 | Interface de capture : capture refusée sans sprint, adresse non http refusée, ouverture après le SSO, préfixe invalide et catégorie réservée refusés | D2.INV-1, D3.INV-2, D11.INV-4 |
| R10 | Backlog chargé au défilement : 72 tickets relevés, navigation exclue, 8 retenus et triés, les huit cas du § 2, dossiers `IA`, `DEV` et `à classer` directement dans le dossier choisi, MHTML de Chrome par ticket, commentaire chargé au défilement, `sprint.mhtml` et `rapport.json`, décompte, un en-tête compté par section ; une seule capture à la fois ; navigateur gardé ouvert après l'erreur | D3.INV-1, D3.INV-3, D4.INV-1, D4.INV-2, D4.INV-3, D11.INV-1, D11.INV-2, D11.INV-3, D11.INV-5, D6.INV-2, D6.INV-4 |
| R11 | Nouvelle capture dans le même dossier : retour à la page du sprint après une erreur ; puis, le ticket passé dans la section `DEV` de Jira, ticket rangé dans sa nouvelle section, copie précédente retirée, autres tickets en place, navigateur fermé sans erreur | D11.INV-3, D6.INV-4 |
| R12 | Navigateur rouvert sans nouveau passage par le SSO | D2.INV-2 |
| R13 | Backlog virtualisé, dans une zone de 80 pixels, en-têtes compris : mêmes contrôles que R10 | D3.INV-1, D4.INV-1, D11.INV-2 |
| R14 | Cinq tickets à session expirée, sans section : trois erreurs, capture arrêtée, navigateur gardé ouvert, deux avertissements | D4.INV-1, D4.INV-4, D6.INV-4, D11.INV-6 |
| R15 | « Fermer le navigateur » pendant le relevé : capture arrêtée sans rapport, avec un message qui le dit ; puis pendant la capture des tickets : capture arrêtée, rapport partiel | D4.INV-4, D6.INV-2 |
| R16 | Page de l'interface pilotée comme par le développeur : bouton activé, avancement, boutons bloqués, bilan, résumé par section, une ligne par ticket avec l'en-tête de sa section, avertissement, valeurs retrouvées après rechargement | D6.INV-2, D6.INV-3 |
| R17 | Ligne de commande : adresse manquante et numéro invalide (code 2), un ticket capturé directement dans le dossier de sa section (code 0), un ticket en erreur (code 1) | D6.INV-5, D4.INV-1 |
| R18 | Point d'extension E1 : champs du rapport, `markers` compris, d'un ticket capturé, d'un ticket en erreur | D11.INV-5 |
| R19 | Point d'extension E2 : fonctions exportées par le module commun, dont `captureSprintTickets`, `addSectionLinks` et `sectionWarnings` | |

## 4. Contrôle de la recette elle-même

Douze défauts, réintroduits un à un dans le code, font chacun échouer la recette par le scénario attendu (essai du 28 octobre 2026, Node 22.23.4) :

| ID | Défaut réintroduit | Scénarios en échec | Contrôles en échec |
|---|---|---|---|
| M1 | les liens de la navigation sont relevés : le ticket récent de l'en-tête est capturé | R10, R11, R13, R16 | 15 |
| M2 | la copie d'un ticket recapturé reste dans son ancien dossier | R11 | 1 |
| M3 | les en-têtes de la navigation comptent : le filtre rapide `DEV` de l'en-tête de la page range en `DEV` le ticket placé avant le premier en-tête | R10, R11, R13, R14, R16 | 17 |
| M4 | l'origine des requêtes n'est plus contrôlée | R8 | 1 |
| M5 | une page est enregistrée sans vérifier qu'elle est celle du ticket : la page de connexion prend le nom du ticket | R10, R11, R13 à R18 | 18 |
| M6 | les liens ne sont relevés qu'avant le défilement : seuls les premiers tickets du backlog sont vus | R10, R11, R13, R15 à R18 | 47 |
| M7 | pas de défilement fixe de 1 200 pixels, plus grand que la zone affichée : des cartes de la liste virtualisée sont sautées | R13 | 11 |
| M8 | seuls les blocs de 100 pixels de haut au moins défilent, comme en 1.0.0 : la liste virtualisée de 80 pixels n'est pas parcourue | R13 | 16 |
| M9 | la section n'est pas reportée d'un pas à l'autre : dans la liste virtualisée, les tickets dont l'en-tête est sorti de la page vont dans `à classer` | R3, R13 | 7 |
| M10 | un en-tête masqué compte : le `DEV` caché dans une carte de la section `IA` range en `DEV` le ticket suivant | R10, R13, R16, R17 | 10 |
| M11 | aucun bloc d'en-tête : la section va toujours jusqu'à l'en-tête suivant, et le couloir `Autres` du tableau 44 rejoint `DEV` | R3 | 1 |
| M12 | le bloc d'un en-tête englobe les tickets placés avant lui : tant que `DEV` n'est pas chargé, la liste entière passe en `IA`, ticket sans section compris | R3, R10, R11, R13, R16 | 11 |

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
//   Backlogs : 42, liste plate à sections IA et DEV, chargée au défilement (?mode=virtual : affichage virtualisé) ;
//   43, tickets à session expirée, sans section. Tableau 44 : couloirs IA, DEV et Autres.
//   Pages de tickets /browse/<CLÉ> : contenu rendu après 400 ms, comme une application monopage.
import http from 'node:http';

const ACCEPTED = new Set([
  `Basic ${Buffer.from('jean.dupont@example.com:motdepasse').toString('base64')}`,
  `Basic ${Buffer.from('jean.dupont@example.com:jeton-demo').toString('base64')}`,
  'Bearer pat-demo',
]);

// Tickets du sprint : section du backlog 42 (null : avant tout en-tête), et cas particuliers
export const TICKETS = {
  'DEMOAB-3500': { section: 'IA' },
  'DEMOCD-3501': { section: 'DEV' },
  'DEMOAB-3502': { section: 'IA', hiddenLabel: 'DEV' }, // un « DEV » masqué dans la carte ne compte pas
  'DEMOEF-3600': { section: 'DEV' },
  'DEMOAB-3700': { section: null },
  'DEMOAB-3800': { section: 'DEV' },
  'DEMOAB-3900': { section: 'DEV', expired: true },
  'DEMOAB-4500': { section: 'IA', lazyComment: true },
};
// Backlog 42, liste plate : 50 tickets hors plage, trois hors filtre, le ticket du sprint d'aucune section, puis
// l'en-tête IA, dix tickets hors plage et ceux du sprint de la section IA (une section plus longue que la zone
// virtualisée : son en-tête sort de la page avant ses tickets), puis l'en-tête DEV et les siens. L'en-tête de la page
// cite en plus DEMOAB-3650, dans la plage, et des filtres rapides IA et DEV : la navigation ne compte pas.
export const BOARD_42 = [
  ...Array.from({ length: 60 }, (_, i) => `DEMOZZ-${i + 1}`),
  'DEMOAB-3499', 'AUTRE-3600', 'DEMOAB-4501',
  ...Object.keys(TICKETS),
];
const board42Rows = () => {
  const of = (section) => Object.keys(TICKETS).filter((k) => TICKETS[k].section === section);
  return [
    ...BOARD_42.slice(0, 50), ...BOARD_42.slice(60, 63), ...of(null),
    { section: 'IA' }, ...BOARD_42.slice(50, 60), ...of('IA'), { section: 'DEV' }, ...of('DEV'),
  ];
};
export const BOARD_43 = ['DEMOXP-3501', 'DEMOXP-3502', 'DEMOXP-3503', 'DEMOXP-3504', 'DEMOXP-3505'];
// Tableau 44, à couloirs : chaque couloir contient son en-tête et ses cartes ; le dernier n'est pas une catégorie
export const BOARD_44 = { IA: ['DEMOAB-3500', 'DEMOAB-3502'], DEV: ['DEMOCD-3501'], Autres: ['DEMOEF-3600'] };
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

function boardHtml(rows) {
  const hidden = Object.fromEntries(Object.entries(TICKETS).filter(([, s]) => s.hiddenLabel).map(([k, s]) => [k, s.hiddenLabel]));
  const sizes = {};
  for (const r of rows) if (typeof r === 'string' && TICKETS[r]) sizes[TICKETS[r].section] = (sizes[TICKETS[r].section] ?? 0) + 1;
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Backlog - DEMO</title>
<style>body{margin:0;font-family:sans-serif} header{height:56px;background:#0052cc;color:#fff}
#list{height:calc(100vh - 56px);overflow:auto} .card{height:40px;padding:4px;border-bottom:1px solid #ddd}
.section{font-weight:bold;background:#f4f5f7}</style></head>
<body><header>Jira (faux) · Récents : <a href="/browse/DEMOAB-3650">DEMOAB-3650</a> · Filtres rapides : <span>IA</span> <span>DEV</span></header>
<main id="list"></main>
<script>
const ROWS = ${JSON.stringify(rows)};
const HIDDEN = ${JSON.stringify(hidden)};
const SIZES = ${JSON.stringify(sizes)};
const MODE = new URLSearchParams(location.search).get('mode');
const H = 49;
const list = document.getElementById('list');
// Une ligne : l'en-tête d'une section, ou la carte d'un ticket
const card = (i) => typeof ROWS[i] === 'object'
  ? '<div class="card section"><span>' + ROWS[i].section + '</span> · ' + (SIZES[ROWS[i].section] ?? 0) + ' tickets</div>'
  : '<div class="card"><a href="/browse/' + ROWS[i] + '">' + ROWS[i] + '</a> Ticket ' + (i + 1)
    + (i < 10 ? ' · <a href="https://jira.example.com/browse/demoe-100?focus=1">DEMOE-100</a>' : '')
    + (HIDDEN[ROWS[i]] ? ' <span style="display:none">' + HIDDEN[ROWS[i]] + '</span>' : '') + '</div>';
if (MODE === 'virtual') {
  // Zone de 80 pixels, comme dans une fenêtre réduite : un pas plus grand que la zone sauterait des cartes,
  // et un bloc aussi bas ne doit pas être ignoré
  list.style.height = '80px';
  const spacer = document.createElement('div');
  spacer.style.cssText = 'position:relative;height:' + ROWS.length * H + 'px';
  list.appendChild(spacer);
  const render = () => {
    const first = Math.max(0, Math.floor(list.scrollTop / H) - 3);
    const last = Math.min(ROWS.length, Math.ceil((list.scrollTop + list.clientHeight) / H) + 3);
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
    const n = Math.min(ROWS.length, shown + 15);
    let html = '';
    for (let i = shown; i < n; i++) html += card(i);
    list.insertAdjacentHTML('beforeend', html);
    shown = n;
  };
  more(); more();
  // Comme Jira : tant que la liste ne déborde pas de sa zone, d'autres cartes se chargent
  const fill = () => { while (shown < ROWS.length && list.scrollHeight <= list.clientHeight) more(); };
  fill();
  window.addEventListener('resize', fill);
  list.addEventListener('scroll', () => {
    if (loading || shown >= ROWS.length) return;
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 200) {
      loading = true;
      setTimeout(() => { more(); loading = false; }, 300);
    }
  });
}
</script></body></html>`;
}

function swimlanesHtml() {
  const lane = (name, keys) => `<div class="couloir"><div class="entete"><span>${name}</span> · ${keys.length} tickets</div>`
    + `<div class="cartes">${keys.map((k) => `<div class="card"><a href="/browse/${k}">${k}</a> Ticket</div>`).join('')}</div></div>`;
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Tableau - DEMO</title></head>
<body><header>Jira (faux) · Filtres rapides : <span>IA</span> <span>DEV</span></header>
<main><div class="filtres">Filtres rapides : <span>IA</span> <span>DEV</span></div>
<div class="couloirs">${Object.entries(BOARD_44).map(([name, keys]) => lane(name, keys)).join('')}</div></main></body></html>`;
}

function ticketHtml(key, spec = {}) {
  const lazy = spec.lazyComment ? `
  let loaded = false;
  window.addEventListener('scroll', () => {
    if (loaded || innerHeight + scrollY < document.body.scrollHeight - 300) return;
    loaded = true;
    setTimeout(() => { document.getElementById('activite').innerHTML = '<p>Commentaire chargé au défilement</p>'; }, 200);
  });` : '';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>[${key}] Ticket de démonstration - Jira (faux)</title></head>
<body><nav>Filtres enregistrés : IA · DEV · Mes tickets ouverts</nav>
<main id="contenu">Chargement…</main>
<script>
setTimeout(() => {
  document.getElementById('contenu').innerHTML = '<h1>${key} : ticket de démonstration</h1>'
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
      if (url.pathname === '/jira/software/c/projects/DEMO/boards/42/backlog') return send(200, boardHtml(board42Rows()));
      if (url.pathname === '/jira/software/c/projects/DEMO/boards/43/backlog') return send(200, boardHtml(BOARD_43));
      if (url.pathname === '/jira/software/c/projects/DEMO/boards/44') return send(200, swimlanesHtml());
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
  DEFAULT_CATEGORIES, UNCLASSIFIED, addSectionLinks, browserChannel, loadAllTickets, matchesFilter, outputFolder,
  pageTimeoutMs, parseCategories, parseFilter, profileDir, sectionWarnings,
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
  'DEMOAB-3500': { category: 'IA' },
  'DEMOCD-3501': { category: 'DEV' },
  'DEMOAB-3502': { category: 'IA' },
  'DEMOEF-3600': { category: 'DEV' },
  'DEMOAB-3700': { category: null },
  'DEMOAB-3800': { category: 'DEV' },
  'DEMOAB-3900': { error: true },
  'DEMOAB-4500': { category: 'IA' },
};
// Champs stables du rapport (point d'extension E1)
const REPORT_FIELDS = ['date', 'sprintUrl', 'folder', 'filter', 'categories', 'markers', 'listed', 'selected', 'ignored', 'ignoredSample', 'counts', 'errors', 'aborted', 'tickets'];
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
      ok = t.category === exp.category && t.where === 'section du sprint' && t.found?.join() === exp.category
        && t.excerpt?.startsWith(`${exp.category} · `) && t.file === `${exp.category}/${key}.mhtml` && existsSync(join(folder, t.file));
      detail = `${t.file} (${t.excerpt})`;
    } else {
      ok = t.category === null && t.found?.length === 0 && t.where === null && t.file === `${UNCLASSIFIED}/${key}.mhtml` && existsSync(join(folder, t.file));
      detail = `${t.file} (${t.excerpt ?? 'aucun en-tête'})`;
    }
    check(`${key}${TICKETS[key].expired ? ' (session expirée)' : ''}`, ok, detail);
  }
  check('dossiers de catégorie directement dans le dossier choisi', report.folder === folder
    && sameSet(readdirSync(folder), ['IA', 'DEV', UNCLASSIFIED, 'sprint.mhtml', 'rapport.json']), readdirSync(folder).join(', '));
  const files = report.tickets.filter((t) => t.file).map((t) => join(folder, t.file));
  check('chaque fichier est la page MHTML de son ticket', files.length === 7
    && files.every((f) => { const s = mhtml(f); return /^From: <Saved by Blink>/m.test(s) && s.includes(f.match(/([A-Z]+-\d+)\.mhtml$/)[1]); }));
  const lazy = join(folder, 'IA', 'DEMOAB-4500.mhtml');
  check('commentaire chargé au défilement capturé', existsSync(lazy) && mhtml(lazy).includes('Commentaire charg'));
  const onDisk = JSON.parse(readFileSync(join(folder, 'rapport.json'), 'utf8'));
  check('page du sprint et rapport.json écrits', /^From: <Saved by Blink>/m.test(mhtml(join(folder, 'sprint.mhtml')))
    && JSON.stringify(onDisk.counts) === JSON.stringify(report.counts) && onDisk.tickets.length === 8);
  check('décompte', JSON.stringify(report.counts) === JSON.stringify({ IA: 3, DEV: 3, [UNCLASSIFIED]: 1 })
    && report.errors === 1 && report.aborted === false, `${JSON.stringify(report.counts)}, erreurs : ${report.errors}`);
  check('un en-tête par section, filtres rapides et « DEV » masqué ignorés', JSON.stringify(report.markers) === '{"IA":1,"DEV":1}',
    JSON.stringify(report.markers));
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
  check('par défaut : IA, DEV', parseCategories().join('|') === 'IA|DEV' && DEFAULT_CATEGORIES.join('|') === 'IA|DEV');
  check('texte : une par ligne, ou séparées par « ; »', parseCategories('a\r\n b ;c').join('|') === 'a|b|c');
  check('nom de dossier invalide, doublon, « à classer » ou liste vide refusés',
    [['a/b'], ['x:'], ['.cache'], ['IA', 'ia'], ['Dév', 'DEV'], [UNCLASSIFIED], []].every((c) => throws(() => parseCategories(c))));

  scenario('R3', 'classement par section de la page du sprint');
  const seen = new Map();
  let carry = addSectionLinks(seen, [
    { key: 'A-1', url: 'u1', section: null, excerpt: null, open: true },
    { key: 'A-2', url: 'u2', section: 'IA', excerpt: 'IA · 3', open: false },
  ]);
  carry = addSectionLinks(seen, [
    { key: 'A-2', url: 'u2', section: null, excerpt: null, open: true }, // en-tête sorti de la page
    { key: 'A-3', url: 'u3', section: null, excerpt: null, open: true },
    { key: 'A-4', url: 'u4', section: 'DEV', excerpt: 'DEV', open: false },
    { key: 'A-5', url: 'u5', section: null, excerpt: null, open: false }, // après la fin d'un couloir
  ], carry);
  check('section de son en-tête ; aucun en-tête avant : à classer', seen.get('A-1').section === null
    && seen.get('A-2').section === 'IA' && seen.get('A-4').section === 'DEV');
  check('liste virtualisée : section reportée sur un ticket ouvert, ticket déjà relevé inchangé', seen.get('A-3').section === 'IA'
    && seen.get('A-3').excerpt === 'IA · 3' && seen.get('A-2').section === 'IA');
  check('après la fin d\'un couloir : à classer, et reporté au pas suivant', seen.get('A-5').section === null && carry.section === null);
  const warn = (markers) => sectionWarnings({ categories: ['IA', 'DEV'], markers, listed: 10 });
  check('avertissements : section introuvable, ou plusieurs groupes', warn({ IA: 1, DEV: 1 }).length === 0
    && /« DEV »/.test(warn({ IA: 1, DEV: 0 }).join(' ')) && /3 groupes/.test(warn({ IA: 3, DEV: 1 }).join(' ')));

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

  scenario('R3', 'classement par section : tableau à couloirs');
  const probe = await chromium.launch({ channel: browserChannel(), headless: true });
  try {
    const ctx = await probe.newContext();
    await ctx.addCookies([{ name: 'sso', value: 'ok', url: fake.url }]); // session déjà ouverte, sans passer par le SSO
    const page = await ctx.newPage();
    await page.goto(`${fake.url}/jira/software/c/projects/DEMO/boards/44`);
    const lanes = await loadAllTickets(page, { categories: DEFAULT_CATEGORIES, pauseMs: 100 });
    const sec = Object.fromEntries(lanes.links.map((l) => [l.key, l.section]));
    check('chaque couloir donne sa section ; couloir Autres à classer ; filtres rapides ignorés', sec['DEMOAB-3500'] === 'IA'
      && sec['DEMOAB-3502'] === 'IA' && sec['DEMOCD-3501'] === 'DEV' && sec['DEMOEF-3600'] === null, JSON.stringify(sec));
    check('un en-tête compté par couloir', JSON.stringify(lanes.markers) === '{"IA":1,"DEV":1}', JSON.stringify(lanes.markers));
    // Liste plate dont seul l'en-tête IA est présent (DEV pas encore chargé) : il ne couvre que ce qui le suit
    await page.setContent('<div id="liste"><div><a href="https://jira.example.com/browse/DEMOAB-3700">DEMOAB-3700</a></div>'
      + '<div><span>IA</span> · 1 ticket</div><div><a href="https://jira.example.com/browse/DEMOAB-3500">DEMOAB-3500</a></div></div>');
    const flat = await loadAllTickets(page, { categories: DEFAULT_CATEGORIES, pauseMs: 50, stableSteps: 1 });
    const flatSec = Object.fromEntries(flat.links.map((l) => [l.key, l.section]));
    check('liste plate : un ticket placé avant le premier en-tête reste à classer', flatSec['DEMOAB-3700'] === null
      && flatSec['DEMOAB-3500'] === 'IA', JSON.stringify(flatSec));
  } finally {
    await probe.close();
  }

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
    // PYTHONUTF8 : sous Windows, Python écrirait sa sortie en cp1252
    const py = (args, env) => run(PY, [join(SKILL, 'scripts', 'jira_sprint_export.py'), ...args], {
      env: { ...process.env, PYTHONUTF8: '1', JIRA_URL: fake.url, ...env }, input: '\n',
    });
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
  r = await post(port, '/api/capture', { categories: 'IA\nà classer' });
  check('catégorie réservée refusée', r.status === 400, r.json?.error);

  scenario('R10', 'capture d\'un backlog chargé au défilement');
  const filter = { prefix: 'demo', min: '3500', max: '4500', categories: 'IA\nDEV' };
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
  await post(port, '/api/capture', { ...filter, min: '3700', max: '3700', folder: out });
  status = await waitForJob(port);
  let again = status.job.report ?? { tickets: [] };
  check('revenu à la page du sprint après une erreur : le ticket est retrouvé', again.selected === 1 && again.listed === BOARD_42.length + 1
    && status.browser === false, `${again.selected} sur ${again.listed}`);
  TICKETS['DEMOAB-3700'].section = 'DEV'; // le ticket rejoint la section DEV dans Jira
  await post(port, '/api/open', { url: backlog });
  await post(port, '/api/capture', { ...filter, min: '3700', max: '3700', folder: out });
  status = await waitForJob(port);
  again = status.job.report ?? { tickets: [] };
  check('le ticket rejoint sa nouvelle section, sa copie précédente est retirée',
    existsSync(join(out, 'DEV', 'DEMOAB-3700.mhtml')) && !existsSync(join(out, UNCLASSIFIED, 'DEMOAB-3700.mhtml'))
    && JSON.stringify(again.tickets[0]?.movedFrom) === JSON.stringify([UNCLASSIFIED]), JSON.stringify(again.tickets[0]?.movedFrom));
  check('les autres tickets restent en place, sans sous-dossier', existsSync(join(out, 'IA', 'DEMOAB-3500.mhtml'))
    && sameSet(readdirSync(out), ['IA', 'DEV', UNCLASSIFIED, 'sprint.mhtml', 'rapport.json']));
  check('sans erreur, le navigateur se ferme', again.errors === 0 && status.browser === false);
  TICKETS['DEMOAB-3700'].section = null;

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
  check('page sans section : deux avertissements', status.job.warnings?.length === 2 && /« IA »/.test(status.job.warnings[0]),
    (status.job.warnings ?? []).join(' '));

  scenario('R15', 'arrêt par « Fermer le navigateur »');
  await post(port, '/api/open', { url: backlog });
  await post(port, '/api/capture', { ...filter, folder: join(TMP, 'sortie-fermee-au-releve') });
  await sleep(1000); // pendant le relevé de la page du sprint
  await post(port, '/api/close', {});
  status = await waitForJob(port);
  check('fermé pendant le relevé : capture arrêtée, sans rapport, et dit', status.job.state === 'failed'
    && /fermé pendant le relevé/.test(status.job.error ?? '') && !status.job.report, status.job.error ?? status.job.state);
  await post(port, '/api/open', { url: backlog });
  await post(port, '/api/capture', { ...filter, folder: join(TMP, 'sortie-arretee') });
  let second = false;
  for (let i = 0; i < 480 && !second; i++) { // attend le deuxième ticket, deux minutes au plus
    const { json } = await request(port, { path: '/api/status' });
    second = json.job.step === 'tickets' && json.job.done >= 1;
    if (!second) await sleep(250);
  }
  check('deuxième ticket atteint', second);
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
    await page.click('#open', { timeout: 10_000 }).catch(() => {});
    const opened = await waitUi(() => /ouvert sur le sprint/.test(document.getElementById('status').textContent), 30_000);
    check("« Capturer les tickets » activé après l'ouverture", opened && await page.isEnabled('#capture'));
    await page.click('#capture', { timeout: 10_000 }).catch(() => {});
    const progress = await waitUi(() => /^Ticket \d+ sur 8 : DEMO/.test(document.getElementById('status').textContent), 60_000);
    check('avancement affiché, boutons bloqués', progress && await page.isVisible('#progress') && await page.isDisabled('#open') && await page.isDisabled('#capture'));
    await waitUi(() => !document.getElementById('report').hidden, 180_000);
    const statusText = await page.textContent('#status');
    check('bilan de fin', /Capture terminée : 7 tickets enregistrés sur 8, 1 en erreur/.test(statusText), statusText);
    const summary = (await page.textContent('#report-summary')).replace(/\s+/g, ' ');
    check('résumé du rapport', /retenus par le filtre : 8/.test(summary) && /IA : 3/.test(summary) && /DEV : 3/.test(summary)
      && /à classer : 1/.test(summary), summary);
    const rows = await page.$$eval('#report-rows tr', (trs) => trs.map((tr) => [...tr.cells].map((td) => td.textContent)));
    check('une ligne par ticket, en-tête de section, erreur signalée', rows.length === 8
      && rows.find((x) => x[0] === 'DEMOAB-3500')?.[2].startsWith('IA · ') && rows.find((x) => x[0] === 'DEMOAB-3900')?.[2].includes('session SSO')
      && rows.find((x) => x[0] === 'DEMOAB-3700')?.[1] === UNCLASSIFIED, `${rows.length} lignes`);
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
    && existsSync(join(TMP, 'cli', 'IA', 'DEMOAB-4500.mhtml')), `${c.status} ${c.stderr.trim().split('\n')[0] ?? ''}`);
  c = await cli([backlog, '--prefixe', 'demoab', '--min', '3900', '--max', '3900', '--sortie', join(TMP, 'cli')]);
  check('un ticket en erreur : code 1', c.status === 1 && /DEMOAB-3900 : page du ticket non affichée/.test(c.stdout), `${c.status}`);

  scenario('R19', "point d'extension E2 : capture pilotable par un autre outil");
  const exported = Object.keys(core).filter((k) => typeof core[k] === 'function').sort();
  check('fonctions exportées par le module commun', ['captureSprintTickets', 'loadAllTickets', 'captureTicket', 'captureMhtml', 'launchBrowser',
    'addSectionLinks', 'sectionWarnings', 'parseFilter', 'matchesFilter', 'parseCategories'].every((k) => exported.includes(k)), exported.join(', '));
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
