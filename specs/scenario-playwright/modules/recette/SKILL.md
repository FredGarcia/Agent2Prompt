---
name: recette
description: Recette du skill (npm test, scénarios R1 à R17 contre une application de démonstration servie sur 127.0.0.1 sans réseau ni compte, deux origines, WebSocket d'écho, connexion simulée, export CSV ; profils et résultats temporaires ; navigateur de SCENARIO_PLAYWRIGHT_CANAL ; écran virtuel sous Linux ; bilan attendu ; défauts réintroduits qui font chacun échouer la recette ; recette en intégration continue sous Linux et Windows), sources de tests/application-demo.mjs et tests/run-tests.mjs.
dimensions: [D1, D2, D3, D4, D5, D6, D7, D8, D9]
status: active
---

# Module `recette`

Phase 7E couverte : Évolutif.

## 1. Lancer la recette

```bash
npm test
```

- Depuis le dossier du skill, après `npm ci`. Sous Linux sans écran : `xvfb-run -a npm test` ; le scénario s'y joue dans une fenêtre, comme sur le poste.
- Le navigateur est celui de `SCENARIO_PLAYWRIGHT_CANAL` : Chrome par défaut ; `chromium` après `npx playwright-core install chromium`.
- La recette travaille sur des profils et des dossiers temporaires : les profils et les résultats du dossier du skill ne sont pas touchés. Elle efface son dossier temporaire si tout passe ; sinon, ou avec `GARDER_TMP=1`, elle le garde et en donne le chemin.
- Durée : environ une minute.
- Bilan attendu : `Bilan : 17 scénarios, 213 contrôles, 213 réussis, 0 en échec, 0 sautés`. Là où un serveur ne peut écouter sur 127.0.0.2, deux contrôles de R8 sont sautés.

## 2. L'application de démonstration

`tests/application-demo.mjs` sert, sur `127.0.0.1` et un port libre, sans réseau ni compte, une application et une seconde origine, que les scénarios ne déclarent pas ; la même application est servie sur `127.0.0.2`, origine hors du poste au sens du skill, quand le système le permet. L'application a son propre JavaScript ; le skill n'en exécute aucun.

| Page | Contenu | Sert à |
|---|---|---|
| `/` | titre, liens vers les clients, l'export et la seconde origine | navigation bloquée, origine déclarée |
| `/clients` | tableau des clients avec un bouton « Supprimer » par ligne, menu au survol, liens « Nouveau client » et « Nouveau fournisseur », alerte « Client … créé » | cible ambiguë, `dans`, `survoler`, `nombre`, `contient` |
| `/clients/nouveau` | champs « Nom » (avec placeholder), « Ville » (liste), case « Client actif », pièce jointe, boutons « Enregistrer » et « Archiver » (inactif) ; l'envoi passe par l'API de l'application | `saisir`, `choisir`, `cocher`, `televerser`, `touche`, `actif`, `valeur` |
| `/differe` | texte « Chargement… » puis « Chargé », bouton activé et contenu affiché après 1,2 s | `attendre`, délais |
| `/connexion?auto=<ms>` | pose un cookie de session et passe à `/accueil-connecte` après le délai, comme un développeur qui se connecte | étape à la main, profil |
| `/session` | dit si le cookie de session est présent | profil retrouvé |
| `/export`, `/export.csv` | lien vers un CSV en pièce jointe | `telecharger` |
| `/erreurs` | erreur de console, requête en erreur 500, exception | erreurs relevées |
| `/externe` | image de la seconde origine | requête bloquée |
| `/ws` | WebSocket d'écho vers l'application et vers la seconde origine | WebSocket gardés |
| `/compteur` | bouton « Ajouter » qui incrémente un compteur par l'API | mutation hors du poste |
| autre chemin | page de statut 404 | navigation en échec |

## 3. Scénarios

| ID | Scénario | Invariants |
|---|---|---|
| R1 | Texte de départ : titre, fonctionnalité et étiquettes, réglages, neuf mots-clés, marques retirées de la phrase, variables, exemples ; même empreinte en CRLF avec BOM et en NFD ; origine de l'adresse par défaut ; dix-sept textes refusés, chacun à sa ligne ; toutes les erreurs levées ensemble | D2.INV-1, D2.INV-2, D2.INV-3 |
| R2 | Scénario TOML : scénario valide et valeurs par défaut ; jeu fermé de treize actions ; trente et un scénarios refusés (format, clés, actions, champs, mutation, délais, cibles, touche, fichiers, critères, `jusqua`, variables, jeux, origines) ; erreur de syntaxe à sa ligne ; erreur qui cite l'étape et ses deux lignes ; ordre `--param`, jeu, `[parametres]`, `$${` littéral ; `--param` et `--jeu` refusés ; fichier à téléverser absent | D3.INV-1, D3.INV-6, D4.INV-1, D4.INV-3, D5.INV-1, D5.INV-5 |
| R3 | Traduction : squelette écrit, écrasement refusé sans `--remplacer` ; structure recopiée, un bloc par étape, marques reportées ; squelette refusé tant qu'une étape reste à compléter ; traduction complétée acceptée ; plan ligne par ligne ; dix-sept écarts relevés (empreinte, texte absent, titre, étiquettes, adresse, origines, profil, paramètres, jeux, ligne manquante, ligne qui n'est pas une étape, ordre, ligne non traduite, mutation perdue, `main` absente ou ajoutée, variable perdue) ; texte et traduction en CRLF | D3.INV-2, D3.INV-3, D3.INV-4, D3.INV-5, D10.INV-1 |
| R4 | Cibles : notation de Playwright de chaque stratégie, de `exact`, `dans` et `rang`, relue en la même cible et réécrite en TOML ; `first()` ; nom en expression régulière simple ; six formes non convertibles ; cibles fragiles | D4.INV-1, D4.INV-3, D9.INV-1 |
| R5 | Exécution complète, vingt-quatre étapes, code 0 : chaque action du jeu fermé, ce que l'application reçoit (nom, ville, case, pièce jointe), rapport à côté du scénario, une capture par vérification et par capture demandée, téléchargement et son empreinte, durées et cibles, cible CSS fragile, navigateur et version, attente arrêtée dès l'état obtenu | D1.INV-2, D1.INV-4, D4.INV-1, D5.INV-1, D5.INV-2, D5.INV-4, D5.INV-5, D6.INV-1, D8.INV-1, D8.INV-2 |
| R6 | Échecs : cible ambiguë sans action et éléments cités, code 1 ; étape suivante non jouée ; capture et instantané ARIA ; vérifications qui se poursuivent après une vérification échouée, attendu et obtenu, bilan ; cible absente au délai de l'étape ; page en 404 | D4.INV-2, D5.INV-2, D5.INV-3, D5.INV-4, D8.INV-2, D1.INV-4 |
| R7 | Origines : image d'une origine non déclarée bloquée, page servie ; WebSocket déclaré relayé, WebSocket non déclaré fermé ; navigation vers une origine non déclarée en échec ; origine comptée dans le rapport et citée en fin de sortie ; origine déclarée qui passe | D7.INV-1 |
| R8 | Mutations hors du poste : origines du poste ; refus avant le navigateur sans `--autoriser-mutations`, sans rien écrire ; exécution avec l'option, notée au rapport ; garde à l'étape par le moteur appelé directement (E3) | D7.INV-2 |
| R9 | Étape à la main : reprise à l'adresse atteinte, message affiché ; `jusqua` par une cible ; délai dépassé ; refus sans fenêtre | D6.INV-3 |
| R10 | Paramètres et jeux : deux jeux, chacun avec ses valeurs ; `--param` qui l'emporte ; captures préfixées par le jeu ; `--param` inconnu ; `--jeu 2` ; `--jeu 3` refusé | D3.INV-6 |
| R11 | Profil et réglages : connexion à la main dans un profil, session retrouvée, profil séparé ; défauts, variable vide, valeurs invalides, chemins des profils ; canal invalide refusé avant le navigateur ; délai du réglage | D6.INV-2, D1.INV-3 |
| R12 | Lignes de commande : dix appels refusés avec le code 2, `verifier.mjs` sur un texte et un scénario, un fichier refusé suffit, note des mutations hors du poste | D1.INV-4 |
| R13 | Désignation : deux clics simulés, deux cibles, un lien et un bouton d'une ligne avec `dans`, page non actionnée, cible au format du scénario | D9.INV-1 |
| R14 | Compatibilité : `playwright-core` 1.65.1 et Chromium 159 lus dans le paquet ; écarts sans avertissement, ancien, plus récent, illisible ; avertissement du rapport | D6.INV-1 |
| R15 | Dépendance unique à version exacte, Node 22, `.gitignore`, aucune exécution de code dans la page dans les sources | D1.INV-1, D1.INV-2, D5.INV-1 |
| R16 | Points d'extension : champs du rapport, de ses étapes, du navigateur, du scénario et des options (E1) ; format et vocabulaire communs avec Agent2Test (E2) ; fonctions exportées du moteur, de la session et du scénario (E3) | |
| R17 | Preuves : erreur de console, exception de la page et réponse 500 relevées, sans échec de l'étape ; trace avec `--trace` et son avertissement ; aucune trace sans l'option | D8.INV-2, D7.INV-3 |

## 4. Contrôle de la recette elle-même

Vingt défauts, réintroduits un à un dans le code, font chacun échouer la recette par le scénario attendu (essai du 20 novembre 2026, Node 22.23.4, Chromium 159) :

| ID | Défaut réintroduit | Scénarios en échec | Contrôles en échec |
|---|---|---|---|
| M1 | La garde des origines laisse passer toute requête | R7 | 2 |
| M2 | Les WebSocket ne sont pas gardés | R7 | 3 |
| M3 | Pas de refus avant le navigateur d'un scénario qui modifie des données hors du poste | R8 | 1 |
| M4 | Pas de garde à l'étape de mutation | R8 | 1 |
| M5 | L'empreinte du texte n'est pas contrôlée | R3 | 1 |
| M6 | Une ligne du texte peut rester sans étape | R3 | 1 |
| M7 | Une marque de mutation du texte peut se perdre | R3 | 1 |
| M8 | Une vérification échouée arrête les vérifications suivantes | R6 | 3 |
| M9 | Une étape échouée n'arrête pas la suite | R6, R7 | 2 |
| M10 | Délai de 30 s pour toute étape, sans tenir compte des réglages | R6, R9, R11 | 4 |
| M11 | Une étape à la main est acceptée sans fenêtre | R9 | 1 |
| M12 | Une variable non déclarée est acceptée | R2 | 1 |
| M13 | `--param` ne l'emporte plus sur `[parametres]` ni sur le jeu | R2, R10 | 3 |
| M14 | Un fichier absolu ou hors du dossier du scénario est accepté | R2 | 2 |
| M15 | Une cible ambiguë agit sur le premier élément | R5, R6 | 10 |
| M16 | Pas de capture pour une vérification | R5, R10 | 2 |
| M17 | Navigateur ancien de trois versions accepté sans avertissement | R14 | 1 |
| M18 | Champ `origines_bloquees` du rapport renommé | R5, puis la recette s'arrête sur l'exception du rapport | 5 |
| M19 | Une étape main est acceptée sur une ligne non marquée | R3 | 1 |
| M20 | La désignation clique l'élément désigné | R13, où la recette s'arrête sur l'exception du second clic | 1 |

Chaque défaut a été retiré après son essai ; la recette du code publié passe en entier.

## 5. Recette en intégration continue

Le workflow `.github/workflows/recette-scenario-playwright.yml` du dépôt Agent2Prompt suit le chemin de l'IA du développeur : il matérialise la transmission courante, extrait les fichiers par la commande du module `execution`, § 8, sous bash et sous CMD, installe la dépendance par `npm ci`, puis lance la recette, sous `xvfb-run` sur `ubuntu-latest` et directement sur `windows-latest`, avec Node 22, 24 et 26.13.0 et le Chrome stable des images GitHub.

## 6. Sources

### `tests/application-demo.mjs`

<!-- fichier : tests/application-demo.mjs -->
```javascript
// scenario-playwright 1.0.0 : application de démonstration de la recette, servie sur 127.0.0.1 sans réseau.
//
// Deux origines : l'application, et une « autre » origine, que les scénarios ne déclarent pas, pour la
// garde des origines. Les pages couvrent chaque action du jeu fermé : liste et formulaire de clients,
// menu au survol, contenu différé, connexion simulée pour une étape à la main, export CSV, erreurs de
// console et réponses en erreur, WebSocket d'écho. L'application a son propre JavaScript ; le skill,
// lui, n'en exécute aucun dans la page.
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import http from 'node:http';
import { URL } from 'node:url';

const page = (titre, corps, script = '') => `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>${titre}</title>
<style>body{font-family:sans-serif;margin:2rem} .menu ul{display:none} .menu:hover ul{display:block} [hidden]{display:none!important}</style>
</head><body>${corps}${script ? `<script>${script}</script>` : ''}</body></html>`;

/** Serveur WebSocket d'écho minimal : poignée de main, puis chaque message texte renvoyé tel quel. */
function accepterWebSocket(req, socket) {
  const cle = req.headers['sec-websocket-key'];
  const accept = createHash('sha1').update(`${cle}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest('base64');
  socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
  socket.on('data', (trame) => {
    const opcode = trame[0] & 0x0f;
    if (opcode === 0x8) { socket.end(Buffer.from([0x88, 0x00])); return; }
    let longueur = trame[1] & 0x7f;
    let decalage = 2;
    if (longueur === 126) { longueur = trame.readUInt16BE(2); decalage = 4; }
    const masque = trame.subarray(decalage, decalage + 4);
    const donnees = Buffer.from(trame.subarray(decalage + 4, decalage + 4 + longueur).map((o, i) => o ^ masque[i % 4]));
    const entete = donnees.length < 126 ? Buffer.from([0x81, donnees.length]) : Buffer.from([0x81, 126, donnees.length >> 8, donnees.length & 0xff]);
    socket.write(Buffer.concat([entete, donnees]));
  });
  socket.on('error', () => {});
}

/**
 * Démarre l'application : rend { base, autre, distante, etat, arreter }. `distante` est la même
 * application servie sur 127.0.0.2, origine hors du poste au sens du skill, ou null si l'adresse
 * n'est pas disponible.
 */
export async function demarrerApplication() {
  const etat = { clients: [{ nom: 'Dupont', ville: 'Paris' }, { nom: 'Martin', ville: 'Lyon' }], compteur: 0, ajouts: [] };
  const serveurs = [];
  let autre = '';

  const app = (req, res) => {
    const u = new URL(req.url, 'http://x');
    const html = (titre, corps, script, code = 200, entetes = {}) => { res.writeHead(code, { 'content-type': 'text/html; charset=utf-8', ...entetes }); res.end(page(titre, corps, script)); };
    const json = (obj, code = 200) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };
    const corps = () => new Promise((r) => { let d = ''; req.on('data', (c) => { d += c; }); req.on('end', () => r(d)); });
    switch (u.pathname) {
      case '/':
        return html('Accueil', `<h1>Démonstration</h1><nav><ul><li><a href="/clients">Clients</a></li><li><a href="/export">Export</a></li><li><a href="${autre}/autre">Lien externe</a></li></ul></nav>`);
      case '/clients': {
        const lignes = etat.clients.map((c) => `<tr><td>${c.nom}</td><td>${c.ville}</td><td><button type="button" data-nom="${c.nom}">Supprimer</button></td></tr>`).join('');
        const cree = u.searchParams.get('cree');
        return html('Clients', `<h1>Clients</h1>${cree ? `<p role="alert">Client ${cree} créé</p>` : ''}
          <div class="menu"><button type="button">Menu</button><ul><li><a href="/clients?vue=parametres">Paramètres</a></li></ul></div>
          <p><a href="/clients/nouveau">Nouveau client</a> <a href="/fournisseurs/nouveau">Nouveau fournisseur</a></p>
          <table><caption>Liste des clients</caption><thead><tr><th>Nom</th><th>Ville</th><th>Action</th></tr></thead><tbody>${lignes}</tbody></table>
          <p id="compte">${etat.clients.length} clients</p>`,
        `document.querySelectorAll('button[data-nom]').forEach((b) => b.addEventListener('click', async () => {
           await fetch('/api/clients/' + encodeURIComponent(b.dataset.nom), { method: 'DELETE' });
           location.href = '/clients';
         }));`);
      }
      case '/clients/nouveau':
        return html('Nouveau client', `<h1>Nouveau client</h1><form id="f">
          <p><label for="nom">Nom</label> <input id="nom" name="nom" placeholder="Nom du client"></p>
          <p><label for="ville">Ville</label> <select id="ville"><option>Paris</option><option>Lyon</option><option>Marseille</option></select></p>
          <p><input type="checkbox" id="actif"> <label for="actif">Client actif</label></p>
          <p><label for="piece">Pièce jointe</label> <input type="file" id="piece"></p>
          <p><button type="submit">Enregistrer</button> <button type="button" disabled>Archiver</button></p></form>`,
        `document.getElementById('f').addEventListener('submit', async (ev) => {
           ev.preventDefault();
           const piece = document.getElementById('piece').files[0];
           const client = { nom: document.getElementById('nom').value, ville: document.getElementById('ville').value, actif: document.getElementById('actif').checked, piece: piece ? piece.name : null };
           await fetch('/api/clients', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(client) });
           location.href = '/clients?cree=' + encodeURIComponent(client.nom);
         });`);
      case '/api/clients':
        if (req.method === 'POST') return corps().then((d) => { const c = JSON.parse(d); etat.clients.push(c); etat.ajouts.push(c); json({ ok: true }, 201); });
        return json(etat.clients);
      case '/differe':
        return html('Différé', `<h1>Contenu différé</h1><p id="etat">Chargement…</p><button type="button" id="b" disabled>Continuer</button><p id="tard" hidden>Données chargées</p>`,
          `setTimeout(() => { document.getElementById('etat').textContent = 'Chargé'; document.getElementById('b').disabled = false; document.getElementById('tard').hidden = false; }, 1200);`);
      case '/connexion':
        return html('Connexion', `<h1>Connexion</h1><p>Connectez-vous dans cette fenêtre.</p>`,
          u.searchParams.get('auto') ? `setTimeout(() => { document.cookie = 'session=ok; max-age=86400; path=/'; location.href = '/accueil-connecte'; }, ${Number(u.searchParams.get('auto'))});` : '');
      case '/accueil-connecte':
        return html('Espace connecté', '<h1>Espace connecté</h1><p>Bienvenue</p>');
      case '/session':
        return html('Session', `<h1>Session</h1><p id="s">Session : ${/(?:^|;\s*)session=ok/.test(req.headers.cookie ?? '') ? 'ouverte' : 'absente'}</p>`);
      case '/export':
        return html('Export', '<h1>Export</h1><p><a href="/export.csv">Exporter en CSV</a></p>');
      case '/export.csv':
        res.writeHead(200, { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="clients.csv"' });
        return res.end(`nom;ville\n${etat.clients.map((c) => `${c.nom};${c.ville}`).join('\n')}\n`);
      case '/erreurs':
        return html('Erreurs', '<h1>Erreurs</h1><p>Page qui se plaint</p>', `console.error('erreur de démonstration'); fetch('/manquant'); setTimeout(() => { throw new Error('exception de démonstration'); }, 10);`);
      case '/manquant':
        res.writeHead(500, { 'content-type': 'text/plain' });
        return res.end('erreur');
      case '/externe':
        return html('Externe', `<h1>Ressources externes</h1><img alt="Logo externe" src="${autre}/logo.png"><p>Contenu local</p>`);
      case '/ws':
        return html('WebSocket', `<h1>WebSocket</h1><p id="principal">principal : en attente</p><p id="autre">autre : en attente</p>`,
          `const essayer = (id, adresse) => { const w = new WebSocket(adresse); const p = document.getElementById(id);
             w.onopen = () => w.send('bonjour'); w.onmessage = (m) => { p.textContent = id + ' : écho ' + m.data; };
             w.onclose = () => { if (!p.textContent.includes('écho')) p.textContent = id + ' : fermé'; }; w.onerror = () => { p.textContent = id + ' : fermé'; }; };
           essayer('principal', 'ws://' + location.host + '/echo'); essayer('autre', '${autre.replace('http', 'ws')}/echo');`);
      case '/compteur':
        return html('Compteur', `<h1>Compteur</h1><p id="v">${etat.compteur}</p><button type="button" id="plus">Ajouter</button>`,
          `document.getElementById('plus').addEventListener('click', async () => { const r = await fetch('/api/compteur', { method: 'POST' }); document.getElementById('v').textContent = (await r.json()).compteur; });`);
      case '/api/compteur':
        if (req.method === 'POST') etat.compteur++;
        return json({ compteur: etat.compteur });
      default:
        if (u.pathname.startsWith('/api/clients/') && req.method === 'DELETE') {
          const nom = decodeURIComponent(u.pathname.slice('/api/clients/'.length));
          etat.clients = etat.clients.filter((c) => c.nom !== nom);
          return json({ ok: true });
        }
        return html('Introuvable', '<h1>Page introuvable</h1>', '', 404);
    }
  };

  const demarrer = (gestion, hote) => new Promise((resolve, reject) => {
    const s = http.createServer(gestion);
    s.on('upgrade', (req, socket) => { if (req.url === '/echo') accepterWebSocket(req, socket); else socket.destroy(); });
    s.on('error', reject);
    s.listen(0, hote, () => { serveurs.push(s); resolve(`http://${hote}:${s.address().port}`); });
  });
  const autreApp = (req, res) => {
    res.writeHead(200, { 'content-type': req.url.endsWith('.png') ? 'image/png' : 'text/html; charset=utf-8' });
    res.end(req.url.endsWith('.png') ? Buffer.alloc(0) : page('Autre origine', '<h1>Autre origine</h1>'));
  };
  autre = await demarrer(autreApp, '127.0.0.1');
  const base = await demarrer(app, '127.0.0.1');
  let distante = null;
  try {
    distante = await demarrer(app, '127.0.0.2');
  } catch {
    distante = null;
  }
  return {
    base, autre, distante, etat,
    arreter: () => Promise.all(serveurs.map((s) => new Promise((r) => { s.closeAllConnections?.(); s.close(() => r()); }))),
  };
}
```

### `tests/run-tests.mjs`

<!-- fichier : tests/run-tests.mjs -->
```javascript
#!/usr/bin/env node
// scenario-playwright 1.0.0 : recette du skill, scénarios R1 à R17, contre l'application de démonstration
// locale (tests/application-demo.mjs), sans réseau ni compte. Le navigateur s'ouvre, visible, sur des
// profils temporaires : les profils et les résultats du dossier du skill ne sont pas touchés.
//   Navigateur : celui de SCENARIO_PLAYWRIGHT_CANAL (chrome par défaut ; chromium après
//   npx playwright-core install chromium). Linux sans écran : xvfb-run -a npm test.
// Usage, depuis le dossier du skill : npm test ; sortie 0 si tout passe, 1 sinon (dossier temporaire gardé,
// comme avec GARDER_TMP=1).
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { clearTimeout, setTimeout } from 'node:timers';
import { fileURLToPath, URL } from 'node:url';
import * as cibles from '../scripts/cibles.mjs';
import * as moteur from '../scripts/moteur.mjs';
import * as rapport from '../scripts/rapport.mjs';
import * as scenario from '../scripts/scenario.mjs';
import * as session from '../scripts/session.mjs';
import * as texte from '../scripts/texte.mjs';
import { lireToml } from '../scripts/toml.mjs';
import { designer } from '../scripts/designer.mjs';
import { demarrerApplication } from './application-demo.mjs';

const SKILL = fileURLToPath(new URL('..', import.meta.url));
const TMP = mkdtempSync(join(tmpdir(), 'scenario-playwright-'));
const ENV = { ...process.env, SCENARIO_PLAYWRIGHT_PROFILS: join(TMP, 'profils') };
const resultats = [];
let courant = '';

function scenarioRecette(id, titre) {
  courant = id;
  console.log(`\n# ${id} · ${titre}`);
}
function controle(nom, ok, detail = '') {
  resultats.push({ scenario: courant, nom, ok: Boolean(ok) });
  // Le détail d'un échec tient sur une ligne : la sortie d'un script lancé ne se mêle pas au bilan de la recette.
  const d = String(detail).replace(/\s*\n\s*/g, ' | ').slice(0, 1500);
  console.log(`${ok ? 'OK  ' : 'KO  '} ${courant} · ${nom}${d && !ok ? ` : ${d}` : ''}`);
}
function saut(nom, raison) {
  resultats.push({ scenario: courant, nom, ok: true, saute: true });
  console.log(`SAUT ${courant} · ${nom} : ${raison}`);
}
const leve = (f) => { try { f(); return null; } catch (e) { return e; } };
const contient = (liste, motif) => liste.some((x) => (motif instanceof RegExp ? motif.test(x) : String(x).includes(motif)));
const sha = (chemin) => createHash('sha256').update(readFileSync(chemin)).digest('hex');

/** Écrit un fichier de scénario dans un dossier de la recette ; rend son chemin. */
function ecrire(dossier, nom, contenu) {
  const d = join(TMP, dossier);
  mkdirSync(d, { recursive: true });
  const chemin = join(d, nom);
  writeFileSync(chemin, contenu);
  return chemin;
}

/** Lance un script du skill sans bloquer ce processus, qui sert l'application ; rend { code, sortie, erreurs }. */
function lancer(script, args, { env = ENV, delai = 120_000 } = {}) {
  return new Promise((resolve) => {
    const enfant = spawn(process.execPath, [join(SKILL, 'scripts', script), ...args], { env, stdio: ['ignore', 'pipe', 'pipe'] });
    let sortie = '';
    let erreurs = '';
    enfant.stdout.setEncoding('utf8').on('data', (d) => { sortie += d; });
    enfant.stderr.setEncoding('utf8').on('data', (d) => { erreurs += d; });
    const minuterie = setTimeout(() => enfant.kill('SIGKILL'), delai);
    enfant.on('close', (code) => { clearTimeout(minuterie); resolve({ code, sortie, erreurs }); });
  });
}

/** Joue un scénario et lit son rapport ; rend { code, sortie, erreurs, rapport, dossier }. */
async function jouer(chemin, args = [], options = {}) {
  const r = await lancer('jouer.mjs', [chemin, ...args], options);
  const m = /^Rapport : (.+)rapport\.md$/m.exec(r.sortie);
  const dossier = m ? m[1].trim() : null;
  const lu = dossier && existsSync(join(dossier, 'rapport.json')) ? JSON.parse(readFileSync(join(dossier, 'rapport.json'), 'utf8')) : null;
  return { ...r, rapport: lu, dossier };
}

const etapes = (r) => (r.rapport ? r.rapport.jeux.flatMap((j) => j.etapes) : []);

// --------------------------------------------------------------------------------------------------
// Textes et scénarios de la recette
// --------------------------------------------------------------------------------------------------

const TEXTE_COMPLET = (base) => `# language: fr
@DEMO-7
Fonctionnalité: Clients
@DEMO-7-S01 @DEMO-7-CA01
Scénario : Créer des clients
  Adresse : ${base}
  Origines : ${base}
  Profil : essai
  Paramètre : ville = Lyon

  Étant donné que je me connecte (à la main)
  Soit la page des clients
  Quand je clique sur le lien « Nouveau client »
  Lorsqu'il saisit « <nom> » dans le champ « Nom »
  Et je choisis « <ville> » dans la liste « Ville »
  Et je clique sur « Enregistrer » (création)
  Mais je renomme le client (modification)
  Et je supprime le client (suppression)
  Alors je vois « Client <nom> créé »

  Exemples:
    | nom    |
    | Dupuis |
    | Leroy  |
`;

// --------------------------------------------------------------------------------------------------

async function principal() {
  const app = await demarrerApplication();
  const { base, autre, distante } = app;
  const canal = session.lireReglages(ENV).reglages.canal;
  console.log(`Recette de scenario-playwright 1.0.0 : Node ${process.versions.node}, navigateur ${canal}, application ${base}`);
  try {
    // ------------------------------------------------------------------------------------------
    scenarioRecette('R1', 'Texte de départ : structure, marques, variables, exemples, erreurs ligne par ligne');
    {
      const source = TEXTE_COMPLET(base);
      const { scenario: t, erreurs } = texte.analyserTexte(source);
      controle('un texte complet se lit sans erreur', erreurs.length === 0, JSON.stringify(erreurs));
      controle('titre, fonctionnalité, étiquettes des deux lignes', t.titre === 'Créer des clients' && t.fonctionnalite === 'Clients' && JSON.stringify(t.etiquettes) === '["DEMO-7","DEMO-7-S01","DEMO-7-CA01"]');
      controle('adresse, origines déclarées, profil, paramètre', t.adresse === base && t.originesDeclarees && t.origines[0] === base && t.profil === 'essai' && t.parametres.ville === 'Lyon');
      controle('neuf étapes, chacune avec sa ligne et son mot-clé', t.etapes.length === 9 && t.etapes[0].ligne === 11 && t.etapes.map((e) => e.motCle).join('|') === "Étant donné que|Soit|Quand|Lorsqu'|Et|Et|Mais|Et|Alors", t.etapes.map((e) => e.motCle).join('|'));
      controle('marques (à la main), (création), (modification), (suppression) retirées de la phrase', t.etapes[0].marque === 'main' && t.etapes[0].phrase === 'je me connecte' && t.etapes[5].marque === 'creation' && t.etapes[6].marque === 'modification' && t.etapes[7].marque === 'suppression');
      controle('variables <nom> et <ville> relevées par étape', JSON.stringify(t.etapes[3].variables) === '["nom"]' && JSON.stringify(t.etapes[4].variables) === '["ville"]' && JSON.stringify(t.etapes[8].variables) === '["nom"]');
      controle('tableau d\'exemples : deux jeux', JSON.stringify(t.jeux) === '[{"nom":"Dupuis"},{"nom":"Leroy"}]');
      const crlf = `﻿${source.replace(/\n/g, '\r\n')}`;
      controle('même empreinte en CRLF avec BOM, et en NFD (D2.INV-3)', texte.empreinteTexte(crlf) === t.empreinte && texte.empreinteTexte(source.normalize('NFD')) === t.empreinte && texte.analyserTexte(crlf).erreurs.length === 0);
      const sansOrigines = texte.analyserTexte(`Scénario: X\n  Adresse : ${base}/clients\n  Quand je regarde\n`).scenario;
      controle('sans ligne Origines, l\'origine de l\'adresse', !sansOrigines.originesDeclarees && JSON.stringify(sansOrigines.origines) === JSON.stringify([base]));
      const cas = [
        ['Scénario: A\n  Adresse : http://a.test\n  Quand x\nScénario: B\n', 4, 'second titre'],
        ['Scénario: A\n  Adresse : http://a.test\n  bonjour\n', 3, 'ligne non reconnue'],
        ['Scénario: A\n  Adresse : http://a.test\n  Quand x\n  Profil : p\n', 4, 'réglage après la première étape'],
        ['Quand x\nScénario: A\n  Adresse : http://a.test\n  Alors y\n', 1, 'étape avant le titre'],
        ['Scénario: A\n  Quand x\n', 1, 'adresse absente'],
        ['Scénario: A\n  Adresse : ftp://a.test\n  Quand x\n', 2, 'adresse invalide'],
        ['Scénario: A\n  Adresse : http://a.test\n  Origines : http://a.test/chemin\n  Quand x\n', 3, 'origine invalide'],
        ['Scénario: A\n  Adresse : http://a.test\n  Origines : http://b.test\n  Quand x\n', 3, 'n\'est pas parmi les origines'],
        ['Scénario: A\n  Adresse : http://a.test\n  Quand je saisis <inconnu>\n', 3, 'variable <inconnu> non déclarée'],
        ['Scénario: A\n  Adresse : http://a.test\n  Quand je saisis <Nom>\n', 3, 'variable invalide'],
        ['Scénario: A\n  Adresse : http://a.test\n  Quand <a>\n  Exemples:\n  | a | b |\n  | 1 |\n', 6, 'ligne d\'exemples de 1 cellules'],
        ['Scénario: A\n  Adresse : http://a.test\n  Quand x\n  Exemples:\n', 4, 'tableau d\'exemples vide'],
        ['Scénario: A\n  Adresse : http://a.test\n  Quand <a>\n  Exemples:\n  | a |\n  | 1 |\n  Alors y\n', 7, 'après le tableau'],
        ['Scénario: A\n  @t\n  Adresse : http://a.test\n  Quand x\n', 2, 'étiquettes après le titre'],
        ['Scénario: A\n  Adresse : http://a.test\n  Profil : Mon Profil\n  Quand x\n', 3, 'profil invalide'],
        ['Scénario: A\n  Adresse : http://a.test\n  Paramètre : a = 1\n  Paramètre : a = 2\n  Quand x\n', 4, 'paramètre en double'],
        ['# rien\n', 0, 'titre absent'],
      ];
      for (const [source2, ligne, motif] of cas) {
        const { erreurs: e2 } = texte.analyserTexte(source2);
        controle(`refus, ligne ${ligne} : ${motif}`, e2.some((e) => e.ligne === ligne && e.message.includes(motif)), JSON.stringify(e2));
      }
      const err = leve(() => texte.lireTexte('Scénario: A\n  Quand x\n  bonjour\n', 'a.scenario'));
      controle('lireTexte lève toutes les erreurs, chacune avec sa ligne', err instanceof texte.ErreurTexte && err.erreurs.length === 2 && /a\.scenario, ligne 1 : adresse absente/.test(err.message) && /ligne 3 : ligne non reconnue/.test(err.message), err?.message);
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R2', 'Scénario TOML : jeu fermé, champs, cibles, bornes, variables, fichiers');
    {
      const valide = `format = "scenario-playwright.scenario/1"
titre = "Valide"
url_base = "${base}/"

[parametres]
nom = "Zoé"

[[etapes]]
action = "naviguer"
url = "/clients"

[[etapes]]
action = "saisir"
cible = { libelle = "Nom" }
valeur = "\${nom}"
`;
      const lu = scenario.validerScenario(lireToml(valide));
      controle('un scénario valide passe, avec ses valeurs par défaut', lu.erreurs.length === 0 && JSON.stringify(lu.scenario.origines) === JSON.stringify([base]) && lu.scenario.jeux === null && lu.scenario.delai === null, JSON.stringify(lu.erreurs));
      controle('jeu fermé de treize actions (D5.INV-1)', Object.keys(scenario.ACTIONS).join(',') === 'naviguer,cliquer,saisir,choisir,cocher,survoler,touche,televerser,telecharger,attendre,verifier,capturer,main');
      const avec = (etape, entete = '') => `format = "scenario-playwright.scenario/1"\ntitre = "T"\nurl_base = "${base}"\n${entete}\n[[etapes]]\n${etape}\n`;
      const cas = [
        ['format absent', valide.replace(/^format.*\n/, ''), 'format attendu'],
        ['titre absent', valide.replace(/^titre.*\n/m, ''), 'titre manquant'],
        ['adresse invalide', valide.replace(`url_base = "${base}/"`, 'url_base = "ftp://x"'), 'url_base manquante ou invalide'],
        ['clé racine inconnue', `bonus = 1\n${valide}`, 'clé inconnue : « bonus »'],
        ['origines invalides', avec('action = "naviguer"\nurl = "/"', 'origines = ["http://a.test/x"]'), 'origines est une liste d\'origines'],
        ['url_base hors des origines', avec('action = "naviguer"\nurl = "/"', 'origines = ["http://a.test"]'), 'n\'est pas parmi les origines'],
        ['action inconnue', avec('action = "clicker"'), 'action inconnue « clicker »'],
        ['étape à compléter', avec('action = "à compléter"'), 'étape à compléter'],
        ['champ inconnu', avec('action = "naviguer"\nurl = "/"\ncible = { role = "button" }'), 'champ inconnu pour naviguer : « cible »'],
        ['champ requis manquant', avec('action = "saisir"\ncible = { libelle = "Nom" }'), 'valeur manquant pour saisir'],
        ['mutation invalide', avec('action = "cliquer"\ncible = { texte = "x" }\nmutation = "effacement"'), 'mutation vaut'],
        ['mutation sur une action qui n\'agit pas', avec('action = "survoler"\ncible = { texte = "x" }\nmutation = "creation"'), 'champ inconnu pour survoler : « mutation »'],
        ['délai au-delà de 30 s', avec('action = "naviguer"\nurl = "/"\ndelai = 31'), 'de 1 à 30'],
        ['délai de main au-delà de 900 s', avec('action = "main"\nmessage = "m"\njusqua = { url = "/" }\ndelai = 901'), 'de 1 à 900'],
        ['cible à deux stratégies', avec('action = "cliquer"\ncible = { role = "button", texte = "x" }'), 'une seule stratégie'],
        ['rôle inconnu', avec('action = "cliquer"\ncible = { role = "buton" }'), 'rôle inconnu « buton »'],
        ['nom sans rôle', avec('action = "cliquer"\ncible = { texte = "x", nom = "y" }'), 'nom ne s\'emploie qu\'avec role'],
        ['exact avec testid', avec('action = "cliquer"\ncible = { testid = "x", exact = true }'), 'exact ne s\'emploie pas avec testid'],
        ['rang nul', avec('action = "cliquer"\ncible = { texte = "x", rang = 0 }'), 'rang est un entier à partir de 1'],
        ['quatre niveaux de dans', avec('action = "cliquer"\ncible = { texte = "a", dans = { texte = "b", dans = { texte = "c", dans = { texte = "d" } } } }'), 'plus de 3 niveaux'],
        ['touche invalide', avec('action = "touche"\ntouche = "Entrée"'), 'touche invalide'],
        ['fichier absolu', avec('action = "televerser"\ncible = { libelle = "P" }\nfichier = "/etc/passwd"'), 'chemin relatif au dossier du scénario'],
        ['fichier avec ..', avec('action = "televerser"\ncible = { libelle = "P" }\nfichier = ["a.txt", "../b.txt"]'), 'sans « .. »'],
        ['attendre url avec une cible', avec('action = "attendre"\netat = "url"\nurl = "/"\ncible = { texte = "x" }'), 'ne prend ni cible ni texte'],
        ['critère inconnu', avec('action = "verifier"\ncritere = "egal"\ncible = { texte = "x" }'), 'critere vaut'],
        ['nombre négatif', avec('action = "verifier"\ncritere = "nombre"\ncible = { texte = "x" }\nattendu = -1'), 'entier positif ou nul'],
        ['nom de capture invalide', avec('action = "capturer"\nnom = "Écran 1"'), 'nom invalide'],
        ['jusqua invalide', avec('action = "main"\nmessage = "m"\njusqua = { url = "/", cible = { texte = "x" } }'), 'jusqua est'],
        ['variable non déclarée', avec('action = "naviguer"\nurl = "/\${page}"'), 'variable ${page} non déclarée'],
        ['jeux incohérents', avec('action = "naviguer"\nurl = "/"', '[[jeux]]\na = "1"\n[[jeux]]\nb = "2"\n'), 'mêmes variables attendues'],
        ['adresse absolue hors des origines', avec(`action = "naviguer"\nurl = "${autre}/autre"`), 'n\'est pas parmi les origines'],
      ];
      for (const [nom, source, motif] of cas) {
        let erreurs;
        try { erreurs = scenario.validerScenario(lireToml(source), scenario.lignesDesEtapes(source)).erreurs; } catch (e) { erreurs = [e.message]; }
        controle(`refus : ${nom}`, contient(erreurs, motif), JSON.stringify(erreurs));
      }
      const syntaxe = ecrire('r2', 'syntaxe.toml', 'format = "x"\ntitre = \n');
      controle('erreur de syntaxe TOML avec sa ligne', contient(scenario.lireScenario(syntaxe).erreurs, /ligne 2/));
      const lignes = avec('action = "clicker"').replace('[[etapes]]', '\n\n[[etapes]]\nligne = 4');
      controle('l\'erreur cite l\'étape, sa ligne du TOML et sa ligne du texte', contient(scenario.validerScenario(lireToml(lignes), scenario.lignesDesEtapes(lignes)).erreurs, /étape 1 \(ligne 7 du TOML, ligne 4 du texte\)/));
      const jeux = scenario.validerScenario(lireToml(avec('action = "saisir"\ncible = { libelle = "Nom" }\nvaleur = "${nom} ${ville} $${brut}"', '[parametres]\nville = "Paris"\nnom = "défaut"\n[[jeux]]\nnom = "A"\n[[jeux]]\nnom = "B"\n'))).scenario;
      const p1 = scenario.preparerJeux(jeux, TMP, { ville: 'Lyon' });
      controle('--param, puis jeu, puis [parametres] ; $${ reste littéral (D3.INV-6)', p1.erreurs.length === 0 && p1.jeux.map((j) => j.etapes[0].valeur).join('|') === 'A Lyon ${brut}|B Lyon ${brut}', JSON.stringify(p1));
      controle('--param inconnu refusé', contient(scenario.preparerJeux(jeux, TMP, { pays: 'FR' }).erreurs, '--param pays'));
      controle('--jeu hors des jeux refusé, --jeu 2 seul', contient(scenario.preparerJeux(jeux, TMP, {}, 3).erreurs, '--jeu 3') && scenario.preparerJeux(jeux, TMP, {}, 2).jeux.map((j) => j.numero).join() === '2');
      const tel = scenario.validerScenario(lireToml(avec('action = "televerser"\ncible = { libelle = "P" }\nfichier = "donnees/absent.txt"'))).scenario;
      controle('fichier à téléverser introuvable refusé avant le navigateur (D5.INV-5)', contient(scenario.preparerJeux(tel, TMP).erreurs, 'fichier introuvable : donnees/absent.txt'));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R3', 'Traduction : squelette sans IA, contrôle contre le texte, plan de ratification');
    {
      const cheminTexte = ecrire('r3', 'creer.scenario', TEXTE_COMPLET(base));
      const t1 = await lancer('traduire.mjs', [cheminTexte]);
      const cheminToml = join(TMP, 'r3', 'creer.toml');
      controle('traduire.mjs écrit le squelette (code 0)', t1.code === 0 && existsSync(cheminToml), t1.erreurs);
      const t2 = await lancer('traduire.mjs', [cheminTexte]);
      controle('traduire.mjs refuse d\'écraser sans --remplacer (code 2)', t2.code === 2 && /existe déjà/.test(t2.erreurs));
      const t3 = await lancer('traduire.mjs', [cheminTexte, '--remplacer']);
      controle('--remplacer réécrit le squelette', t3.code === 0);
      const sq = lireToml(readFileSync(cheminToml, 'utf8'));
      const tx = texte.lireTexte(TEXTE_COMPLET(base));
      controle('le squelette recopie la structure du texte (D3.INV-5)', sq.titre === tx.titre && JSON.stringify(sq.etiquettes) === JSON.stringify(tx.etiquettes) && sq.url_base === base && sq.profil === 'essai' && sq.parametres.ville === 'Lyon' && sq.jeux.length === 2 && sq.empreinte_source === tx.empreinte && sq.source === 'creer.scenario');
      controle('un bloc par étape du texte, marques reportées', sq.etapes.length === 9 && sq.etapes.every((e, i) => e.ligne === tx.etapes[i].ligne) && sq.etapes[0].action === 'main' && sq.etapes[0].message === 'je me connecte' && sq.etapes[5].mutation === 'creation' && sq.etapes[1].action === scenario.A_COMPLETER);
      const v1 = await lancer('verifier.mjs', [cheminToml]);
      controle('le squelette est refusé tant qu\'une étape reste à compléter', v1.code === 2 && /étape à compléter/.test(v1.sortie) && /jusqua manquant/.test(v1.sortie));
      const etapesTraduites = `
[[etapes]]
ligne = 11
action = "main"
message = "je me connecte"
jusqua = { url = "/accueil-connecte" }

[[etapes]]
ligne = 12
action = "naviguer"
url = "/clients"

[[etapes]]
ligne = 13
action = "cliquer"
cible = { role = "link", nom = "Nouveau client" }

[[etapes]]
ligne = 14
action = "saisir"
cible = { libelle = "Nom" }
valeur = "\${nom}"

[[etapes]]
ligne = 15
action = "choisir"
cible = { libelle = "Ville" }
valeur = "\${ville}"

[[etapes]]
ligne = 16
action = "cliquer"
cible = { role = "button", nom = "Enregistrer" }
mutation = "creation"

[[etapes]]
ligne = 17
action = "cliquer"
cible = { role = "button", nom = "Renommer" }
mutation = "modification"

[[etapes]]
ligne = 18
action = "cliquer"
cible = { role = "button", nom = "Supprimer", dans = { role = "row", nom = "\${nom}" } }
mutation = "suppression"

[[etapes]]
ligne = 19
action = "verifier"
critere = "contient"
cible = { role = "alert" }
attendu = "Client \${nom} créé"
`;
      const entete = readFileSync(cheminToml, 'utf8').split('\n# ligne 11')[0];
      const traduit = `${entete}\n${etapesTraduites}`;
      writeFileSync(cheminToml, traduit);
      const v2 = await lancer('verifier.mjs', [cheminToml, '--plan']);
      controle('la traduction complétée passe le contrôle (code 0)', v2.code === 0 && /traduction contrôlée/.test(v2.sortie), v2.sortie);
      controle('le plan montre chaque ligne du texte et ses étapes (D10.INV-1)', /l\.13 {2}Quand je clique sur le lien « Nouveau client »\n {8}→ cliquer getByRole\('link', \{ name: 'Nouveau client' \}\)/.test(v2.sortie) && /9 étapes, dont 3 qui modifient des données, et des étapes à la main\./.test(v2.sortie), v2.sortie);
      const ecarts = [
        ['texte modifié depuis la traduction (D3.INV-2)', (s) => s, 'a changé depuis la traduction', (src) => `${src}# ajout\n`],
        ['texte de départ absent', (s) => s.replace('source = "creer.scenario"', 'source = "absent.scenario"'), 'texte de départ introuvable'],
        ['titre différent', (s) => s.replace('titre = "Créer des clients"', 'titre = "Créer un client"'), 'titre « Créer un client » différent'],
        ['étiquettes différentes', (s) => s.replace('"DEMO-7-CA01"]', '"DEMO-7-CA02"]'), 'étiquettes'],
        ['adresse différente', (s) => s.replace(`url_base = "${base}"`, `url_base = "${base}/clients"`), 'url_base'],
        ['origines différentes', (s) => s.replace(`origines = ["${base}"]`, `origines = ["${base}", "${autre}"]`), 'origines'],
        ['profil différent', (s) => s.replace('profil = "essai"', 'profil = "autre"'), 'profil autre différent'],
        ['paramètres différents', (s) => s.replace('ville = "Lyon"', 'ville = "Nice"'), 'paramètres différents'],
        ['jeux différents', (s) => s.replace('nom = "Leroy"', 'nom = "Leroi"'), 'jeux différents'],
        ['étape sans ligne', (s) => s.replace('ligne = 12\n', ''), 'ligne du texte manquante'],
        ['ligne qui n\'est pas une étape', (s) => s.replace('ligne = 12\n', 'ligne = 9\n'), 'la ligne 9 n\'est pas une étape du texte'],
        ['ordre du texte non suivi', (s) => s.replace('ligne = 13\n', 'ligne = 11\n'), 'l\'ordre du texte n\'est pas suivi'],
        ['ligne du texte sans étape', (s) => s.replace(/\n\[\[etapes\]\]\nligne = 17\n[^[]*/, '\n'), 'ligne 17 du texte (« Mais je renomme le client ») : aucune étape ne la traduit'],
        ['marque de mutation perdue', (s) => s.replace('mutation = "suppression"\n', ''), 'marquée (suppression)'],
        ['(à la main) sans étape main', (s) => s.replace('action = "main"\nmessage = "je me connecte"\njusqua = { url = "/accueil-connecte" }', 'action = "naviguer"\nurl = "/connexion"'), 'une seule étape main attendue'],
        ['étape main sur une ligne non marquée', (s) => s.replace('action = "naviguer"\nurl = "/clients"', 'action = "main"\nmessage = "m"\njusqua = { url = "/clients" }'), 'ne marque pas « (à la main) »'],
        ['variable perdue', (s) => s.replace('valeur = "${nom}"', 'valeur = "Dupuis"'), 'la variable <nom> ne se retrouve'],
      ];
      for (const [nom, changer, motif, changerTexte] of ecarts) {
        const d = join(TMP, `r3-${resultats.length}`);
        mkdirSync(d, { recursive: true });
        writeFileSync(join(d, 'creer.scenario'), changerTexte ? changerTexte(TEXTE_COMPLET(base)) : TEXTE_COMPLET(base));
        writeFileSync(join(d, 'creer.toml'), changer(traduit));
        const r = scenario.lireScenario(join(d, 'creer.toml'));
        controle(`écart relevé : ${nom}`, r.scenario === null && contient(r.erreurs, motif), JSON.stringify(r.erreurs));
      }
      const dCrlf = join(TMP, 'r3-crlf');
      mkdirSync(dCrlf, { recursive: true });
      writeFileSync(join(dCrlf, 'creer.scenario'), TEXTE_COMPLET(base).replace(/\n/g, '\r\n'));
      writeFileSync(join(dCrlf, 'creer.toml'), traduit.replace(/\n/g, '\r\n'));
      controle('texte et traduction en CRLF : contrôle identique (D2.INV-3)', scenario.lireScenario(join(dCrlf, 'creer.toml')).erreurs.length === 0);
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R4', 'Cibles : stratégies côté utilisateur, notation de Playwright, lecture d\'un localisateur');
    {
      const exemples = [
        [{ role: 'button', nom: 'Enregistrer' }, "getByRole('button', { name: 'Enregistrer' })"],
        [{ role: 'heading' }, "getByRole('heading')"],
        [{ role: 'link', nom: "L'accueil", exact: true }, "getByRole('link', { name: 'L\\'accueil', exact: true })"],
        [{ libelle: 'Nom' }, "getByLabel('Nom')"],
        [{ texte: 'Bonjour', exact: true }, "getByText('Bonjour', { exact: true })"],
        [{ placeholder: 'Rechercher' }, "getByPlaceholder('Rechercher')"],
        [{ testid: 'valider' }, "getByTestId('valider')"],
        [{ alt: 'Logo' }, "getByAltText('Logo')"],
        [{ titre: 'Aide' }, "getByTitle('Aide')"],
        [{ css: '#principal > p' }, "locator('#principal > p')"],
        [{ role: 'button', nom: 'Supprimer', dans: { role: 'row', nom: 'Martin' } }, "getByRole('row', { name: 'Martin' }).getByRole('button', { name: 'Supprimer' })"],
        [{ role: 'listitem', rang: 2 }, "getByRole('listitem').nth(1)"],
      ];
      for (const [c, attendu] of exemples) {
        const d = cibles.decrireCible(c);
        controle(`notation : ${attendu}`, d === attendu, d);
        const relue = cibles.cibleDepuisLocator(d);
        controle(`relue depuis la notation et réécrite en TOML : ${attendu}`, JSON.stringify(relue) === JSON.stringify(c) && JSON.stringify(lireToml(`cible = ${cibles.cibleToml(c)}`).cible) === JSON.stringify(c), JSON.stringify(relue));
      }
      controle('first() devient rang = 1', JSON.stringify(cibles.cibleDepuisLocator("getByRole('row').first()")) === '{"role":"row","rang":1}');
      controle('nom en expression régulière simple : texte', cibles.cibleDepuisLocator("getByRole('button', { name: /Enregistrer/ })")?.nom === 'Enregistrer');
      for (const x of ["getByRole('button', { name: /^Envoy(er|é)$/i })", "getByRole('row').filter({ hasText: 'x' })", "getByRole('row').last()", 'n\'importe quoi', "getByText('a').getByText('b').getByText('c').getByText('d')", "getByRole('buton')"]) {
        controle(`non convertible : ${x}`, cibles.cibleDepuisLocator(x) === null);
      }
      controle('css et rang sont fragiles, jusque dans « dans » (D4.INV-1)', cibles.estFragile({ css: 'p' }) && cibles.estFragile({ texte: 'x', rang: 1 }) && cibles.estFragile({ role: 'button', dans: { css: 'div' } }) && !cibles.estFragile({ role: 'button', nom: 'x', dans: { role: 'row' } }));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R5', 'Exécution complète dans le navigateur : chaque action, preuves, téléchargement, code 0');
    let rapportComplet = null;
    {
      const d = join(TMP, 'r5');
      mkdirSync(join(d, 'donnees'), { recursive: true });
      writeFileSync(join(d, 'donnees', 'piece.txt'), 'pièce jointe\n');
      const chemin = ecrire('r5', 'complet.toml', `format = "scenario-playwright.scenario/1"
titre = "Parcours complet"
etiquettes = ["DEMO-8-S01"]
url_base = "${base}"
delai = 5

[parametres]
nom = "Zoé Martin"

[[etapes]]
action = "naviguer"
url = "/clients"

[[etapes]]
action = "survoler"
cible = { role = "button", nom = "Menu" }

[[etapes]]
action = "verifier"
critere = "visible"
cible = { role = "link", nom = "Paramètres" }

[[etapes]]
action = "cliquer"
cible = { role = "link", nom = "Nouveau client" }

[[etapes]]
action = "saisir"
cible = { libelle = "Nom" }
valeur = "\${nom}"

[[etapes]]
action = "verifier"
critere = "valeur"
cible = { placeholder = "Nom du client" }
attendu = "\${nom}"

[[etapes]]
action = "choisir"
cible = { libelle = "Ville" }
valeur = "Marseille"

[[etapes]]
action = "cocher"
cible = { libelle = "Client actif" }
valeur = true

[[etapes]]
action = "televerser"
cible = { libelle = "Pièce jointe" }
fichier = "donnees/piece.txt"

[[etapes]]
action = "verifier"
critere = "actif"
cible = { role = "button", nom = "Archiver" }
attendu = false

[[etapes]]
action = "touche"
cible = { libelle = "Nom" }
touche = "Enter"
mutation = "creation"

[[etapes]]
action = "attendre"
etat = "url"
url = "/clients?cree=*"

[[etapes]]
action = "verifier"
critere = "contient"
cible = { role = "alert" }
attendu = "Client \${nom} créé"

[[etapes]]
action = "verifier"
critere = "url"
attendu = "/clients?cree=\${nom}"

[[etapes]]
action = "verifier"
critere = "nombre"
cible = { role = "button", nom = "Supprimer" }
attendu = 3

[[etapes]]
action = "verifier"
critere = "contient"
cible = { role = "cell", nom = "Marseille", exact = true }
attendu = "Marseille"
exact = true

[[etapes]]
action = "naviguer"
url = "/differe"

[[etapes]]
action = "attendre"
etat = "actif"
cible = { role = "button", nom = "Continuer" }

[[etapes]]
action = "attendre"
etat = "texte"
cible = { css = "#etat" }
texte = "Chargé"

[[etapes]]
action = "verifier"
critere = "visible"
cible = { texte = "Données chargées" }
attendu = true

[[etapes]]
action = "capturer"
nom = "titre"
cible = { role = "heading" }

[[etapes]]
action = "capturer"
nom = "page-entiere"
pleine_page = true

[[etapes]]
action = "naviguer"
url = "/export"

[[etapes]]
action = "telecharger"
cible = { role = "link", nom = "Exporter en CSV" }
nom = "export"
`);
      const r = await jouer(chemin);
      rapportComplet = r.rapport;
      const e = etapes(r);
      controle('vingt-quatre étapes réussies, code 0 (D1.INV-4)', r.code === 0 && r.rapport?.statut === 'reussi' && e.length === 24 && e.every((x) => x.statut === 'reussie'), `${r.code} ${r.sortie} ${r.erreurs}`);
      const cree = app.etat.ajouts.find((c) => c.nom === 'Zoé Martin');
      controle('saisie, liste, case et téléversement reçus par l\'application', cree && cree.ville === 'Marseille' && cree.actif === true && cree.piece === 'piece.txt', JSON.stringify(app.etat.ajouts));
      controle('rapport.json et rapport.md dans resultats/ à côté du scénario (D8.INV-1, D1.INV-2)', r.dossier && r.dossier.startsWith(join(d, 'resultats')) && existsSync(join(r.dossier, 'rapport.md')) && /# Réussi : Parcours complet/.test(readFileSync(join(r.dossier, 'rapport.md'), 'utf8')));
      const captures = e.filter((x) => x.action === 'verifier' || x.action === 'capturer');
      controle('une capture par vérification et par capture demandée (D8.INV-2)', captures.length === 10 && captures.every((x) => x.capture && existsSync(join(r.dossier, x.capture))), JSON.stringify(captures.map((x) => x.capture)));
      const tel = e.find((x) => x.action === 'telecharger')?.telechargement;
      controle('téléchargement enregistré avec son empreinte (D5.INV-5)', tel && tel.fichier === 'telechargements/export.csv' && tel.propose === 'clients.csv' && sha(join(r.dossier, tel.fichier)) === tel.sha256 && /Zoé Martin;Marseille/.test(readFileSync(join(r.dossier, tel.fichier), 'utf8')), JSON.stringify(tel));
      controle('chaque étape a sa durée, son résumé et sa cible', e.every((x) => Number.isInteger(x.duree_ms) && x.resume) && e[1].cible === "getByRole('button', { name: 'Menu' })");
      controle('cible CSS signalée fragile dans le rapport (D4.INV-1)', r.rapport?.cibles_fragiles.includes("locator('#etat')") && e[18].fragile === true);
      controle('navigateur, version et playwright-core notés (D6.INV-1)', r.rapport?.navigateur.canal === canal && /^\d+\./.test(r.rapport?.navigateur.version ?? '') && r.rapport?.navigateur.playwright_core === '1.65.1');
      controle('attente bornée qui s\'arrête dès l\'état obtenu (D5.INV-2)', e[17].duree_ms >= 500 && e[17].duree_ms < 4000, `${e[17].duree_ms} ms`);
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R6', 'Échecs : cible ambiguë sans action, vérifications qui se poursuivent, arrêt, preuves, code 1');
    {
      const avant = app.etat.clients.length;
      const ambigu = ecrire('r6', 'ambigu.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Ambigu"\nurl_base = "${base}"\n\n[[etapes]]\naction = "naviguer"\nurl = "/clients"\n\n[[etapes]]\naction = "cliquer"\ncible = { role = "button", nom = "Supprimer" }\nmutation = "suppression"\n\n[[etapes]]\naction = "verifier"\ncritere = "visible"\ncible = { role = "table" }\n`);
      const r1 = await jouer(ambigu);
      const e1 = etapes(r1);
      controle('cible ambiguë : échec, candidats cités, code 1 (D4.INV-2)', r1.code === 1 && e1[1]?.statut === 'echec' && /cible ambiguë, \d+ éléments trouvés, aucune action faite/.test(e1[1]?.message) && /aka getByRole\('row'|aka getByRole\('button'/.test(e1[1]?.message), JSON.stringify(e1[1]));
      controle('aucune suppression faite', app.etat.clients.length === avant);
      controle('étape suivante non jouée (D5.INV-3)', e1[2]?.statut === 'non_jouee' && /non jouée : l'étape 2 a échoué/.test(e1[2]?.message));
      controle('capture et instantané ARIA de l\'échec (D8.INV-2)', e1[1]?.capture && existsSync(join(r1.dossier, e1[1].capture)) && e1[1]?.aria && /Liste des clients|table/.test(readFileSync(join(r1.dossier, e1[1].aria), 'utf8')));
      const suite = ecrire('r6', 'verifications.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Vérifications"\nurl_base = "${base}"\ndelai = 2\n\n[[etapes]]\naction = "naviguer"\nurl = "/clients"\n\n[[etapes]]\naction = "verifier"\ncritere = "contient"\ncible = { role = "heading" }\nattendu = "Fournisseurs"\n\n[[etapes]]\naction = "verifier"\ncritere = "visible"\ncible = { role = "table" }\n\n[[etapes]]\naction = "verifier"\ncritere = "nombre"\ncible = { role = "button", nom = "Supprimer" }\nattendu = 99\n\n[[etapes]]\naction = "cliquer"\ncible = { role = "link", nom = "Clients" }\n`);
      const r2 = await jouer(suite);
      const e2 = etapes(r2);
      controle('une vérification échouée n\'arrête pas les vérifications suivantes (D5.INV-3)', e2.map((x) => x.statut).join() === 'reussie,echec,reussie,echec,non_jouee', e2.map((x) => x.statut).join());
      controle('message : attendu et obtenu (D5.INV-4)', /attendu : un texte qui contient « Fournisseurs » ; obtenu : texte « Clients »/.test(e2[1]?.message) && /attendu : 99 éléments ; obtenu : \d+ éléments/.test(e2[3]?.message), `${e2[1]?.message} | ${e2[3]?.message}`);
      controle('bilan : 2 réussies, 2 en échec, 1 non jouée', JSON.stringify(r2.rapport?.bilan) === '{"jeux":1,"etapes":5,"reussies":2,"echecs":2,"non_jouees":1}', JSON.stringify(r2.rapport?.bilan));
      const absente = ecrire('r6', 'absente.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Absente"\nurl_base = "${base}"\n\n[[etapes]]\naction = "naviguer"\nurl = "/clients"\n\n[[etapes]]\naction = "cliquer"\ncible = { role = "button", nom = "Inexistant" }\ndelai = 1\n`);
      const r3 = await jouer(absente);
      const e3 = etapes(r3);
      controle('cible absente : échec au délai de l\'étape, borné (D5.INV-2)', e3[1]?.statut === 'echec' && /délai de 1 s dépassé/.test(e3[1]?.message) && e3[1]?.duree_ms < 3000, JSON.stringify(e3[1]));
      const p404 = ecrire('r6', 'introuvable.toml', `format = "scenario-playwright.scenario/1"\ntitre = "404"\nurl_base = "${base}"\n\n[[etapes]]\naction = "naviguer"\nurl = "/inexistant"\n`);
      const r4 = await jouer(p404);
      controle('page qui répond 404 : échec de la navigation', r4.code === 1 && /répond 404/.test(etapes(r4)[0]?.message ?? ''));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R7', 'Garde des origines : requêtes, WebSocket et navigation vers une origine non déclarée');
    {
      const chemin = ecrire('r7', 'origines.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Origines"\nurl_base = "${base}"\n\n[[etapes]]\naction = "naviguer"\nurl = "/externe"\n\n[[etapes]]\naction = "verifier"\ncritere = "contient"\ncible = { texte = "Contenu local" }\nattendu = "Contenu local"\n\n[[etapes]]\naction = "naviguer"\nurl = "/ws"\n\n[[etapes]]\naction = "attendre"\netat = "texte"\ncible = { css = "#principal" }\ntexte = "écho bonjour"\n\n[[etapes]]\naction = "attendre"\netat = "texte"\ncible = { css = "#autre" }\ntexte = "fermé"\n\n[[etapes]]\naction = "naviguer"\nurl = "/"\n\n[[etapes]]\naction = "cliquer"\ncible = { role = "link", nom = "Lien externe" }\n\n[[etapes]]\naction = "verifier"\ncritere = "visible"\ncible = { role = "heading", nom = "Autre origine" }\n`);
      const r = await jouer(chemin);
      const e = etapes(r);
      controle('ressource d\'une autre origine bloquée, page locale servie', e[0]?.statut === 'reussie' && e[1]?.statut === 'reussie');
      controle('WebSocket de l\'origine déclarée : écho reçu', e[3]?.statut === 'reussie', JSON.stringify(e[3]));
      controle('WebSocket d\'une origine non déclarée : fermé (D7.INV-1)', e[4]?.statut === 'reussie', JSON.stringify(e[4]));
      controle('navigation vers une origine non déclarée : échec, page non chargée', e[6]?.statut === 'echec' && /origine non déclarée/.test(e[6]?.message) && e[7]?.statut === 'non_jouee', JSON.stringify(e[6]));
      const bloquee = r.rapport?.origines_bloquees.find((o) => o.origine === autre);
      controle('origine bloquée comptée dans le rapport', bloquee && bloquee.requetes >= 3, JSON.stringify(r.rapport?.origines_bloquees));
      controle('origine bloquée citée en fin d\'exécution', r.sortie.includes(`origine bloquée : ${autre}`));
      const permise = ecrire('r7', 'permise.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Permise"\nurl_base = "${base}"\norigines = ["${base}", "${autre}"]\n\n[[etapes]]\naction = "naviguer"\nurl = "/"\n\n[[etapes]]\naction = "cliquer"\ncible = { role = "link", nom = "Lien externe" }\n\n[[etapes]]\naction = "verifier"\ncritere = "visible"\ncible = { role = "heading", nom = "Autre origine" }\n`);
      const r2 = await jouer(permise);
      controle('origine déclarée : la navigation passe', r2.code === 0, r2.sortie);
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R8', 'Mutations hors du poste : refus sans --autoriser-mutations, garde à l\'étape');
    {
      controle('127.0.0.1, localhost et [::1] sont sur le poste ; 127.0.0.2 et un domaine non', session.estLocale('http://127.0.0.1:3000') && session.estLocale('http://localhost') && session.estLocale('http://[::1]:8080') && !session.estLocale('http://127.0.0.2:3000') && !session.estLocale('https://recette.exemple.fr'));
      const cible = distante ?? 'http://127.0.0.2:9';
      const chemin = ecrire('r8', 'distant.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Distant"\nurl_base = "${cible}"\n\n[[etapes]]\naction = "naviguer"\nurl = "/compteur"\n\n[[etapes]]\naction = "cliquer"\ncible = { role = "button", nom = "Ajouter" }\nmutation = "creation"\n\n[[etapes]]\naction = "verifier"\ncritere = "contient"\ncible = { css = "#v" }\nattendu = "1"\n`);
      const avant = app.etat.compteur;
      const r1 = await jouer(chemin);
      controle('refus avant le navigateur, code 2, rien d\'écrit (D7.INV-2)', r1.code === 2 && /--autoriser-mutations/.test(r1.erreurs) && r1.dossier === null && !existsSync(join(TMP, 'r8', 'resultats')) && app.etat.compteur === avant, r1.erreurs);
      if (!distante) {
        saut('mutation autorisée hors du poste', '127.0.0.2 indisponible sur ce système');
        saut('garde à l\'étape', '127.0.0.2 indisponible sur ce système');
      } else {
        const r2 = await jouer(chemin, ['--autoriser-mutations']);
        controle('avec --autoriser-mutations : jouée, notée dans le rapport', r2.code === 0 && app.etat.compteur === avant + 1 && r2.rapport?.options.mutations_autorisees === true, r2.sortie + r2.erreurs);
        const sc = scenario.validerScenario(lireToml(readFileSync(chemin, 'utf8'))).scenario;
        const { jeux } = scenario.preparerJeux(sc, join(TMP, 'r8'));
        const ctx = await session.ouvrirNavigateur({ canal, profil: join(TMP, 'profils', 'api') });
        try {
          const dossier = rapport.dossierResultats(join(TMP, 'r8', 'api'), 'distant');
          const journal = await session.garderOrigines(ctx, sc.origines);
          const joues = await moteur.jouerScenario(ctx, { scenario: sc, jeux, resultats: dossier, journal, delai: 5, autoriserMutations: false });
          const e = joues[0].etapes;
          controle('garde à l\'étape par l\'API : mutation sur une page hors du poste refusée, sans action', e[1].statut === 'echec' && /hors du poste, sans --autoriser-mutations : aucune action faite/.test(e[1].message) && app.etat.compteur === avant + 1, JSON.stringify(e[1]));
        } finally {
          await ctx.close();
        }
      }
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R9', 'Étape à la main : attente de l\'état, délai, refus sans fenêtre');
    {
      const corps = (auto, delai, jusqua) => `format = "scenario-playwright.scenario/1"\ntitre = "Main"\nurl_base = "${base}"\n\n[[etapes]]\naction = "naviguer"\nurl = "/connexion?auto=${auto}"\n\n[[etapes]]\naction = "main"\nmessage = "Connectez-vous"\njusqua = ${jusqua}\ndelai = ${delai}\n\n[[etapes]]\naction = "verifier"\ncritere = "contient"\ncible = { role = "heading" }\nattendu = "Espace connecté"\n`;
      const r1 = await jouer(ecrire('r9', 'main.toml', corps(800, 10, '{ url = "/accueil-connecte" }')));
      controle('le développeur atteint l\'état : la suite reprend (D6.INV-3)', r1.code === 0 && etapes(r1)[1]?.duree_ms >= 500, r1.sortie);
      controle('message à la main affiché', /À VOUS : Connectez-vous — la suite reprend dès que l'adresse \/accueil-connecte est atteinte \(10 s au plus\)/.test(r1.sortie), r1.sortie);
      const r2 = await jouer(ecrire('r9', 'main-cible.toml', corps(600, 10, '{ cible = { role = "heading", nom = "Espace connecté" } }')));
      controle('jusqua par une cible visible', r2.code === 0, r2.sortie);
      const r3 = await jouer(ecrire('r9', 'main-delai.toml', corps(5000, 1, '{ url = "/accueil-connecte" }')));
      controle('délai dépassé : échec de l\'étape à la main', r3.code === 1 && /non terminée en 1 s/.test(etapes(r3)[1]?.message ?? ''), JSON.stringify(etapes(r3)[1]));
      const r4 = await jouer(join(TMP, 'r9', 'main.toml'), ['--sans-tete']);
      controle('--sans-tete refusé avec une étape à la main, code 2', r4.code === 2 && /D6\.INV-3/.test(r4.erreurs));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R10', 'Paramètres et jeux de valeurs : priorité, un rapport par jeu, --jeu');
    {
      const chemin = ecrire('r10', 'jeux.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Jeux"\nurl_base = "${base}"\n\n[parametres]\nville = "Paris"\n\n[[jeux]]\nnom = "Alpha"\n\n[[jeux]]\nnom = "Bêta"\n\n[[etapes]]\naction = "naviguer"\nurl = "/clients/nouveau"\n\n[[etapes]]\naction = "saisir"\ncible = { libelle = "Nom" }\nvaleur = "\${nom}"\n\n[[etapes]]\naction = "choisir"\ncible = { libelle = "Ville" }\nvaleur = "\${ville}"\n\n[[etapes]]\naction = "cliquer"\ncible = { role = "button", nom = "Enregistrer" }\nmutation = "creation"\n\n[[etapes]]\naction = "verifier"\ncritere = "contient"\ncible = { role = "alert" }\nattendu = "\${nom}"\n`);
      const r1 = await jouer(chemin, ['--param', 'ville=Lyon']);
      controle('deux jeux joués, chacun avec ses valeurs', r1.code === 0 && r1.rapport?.jeux.length === 2 && r1.rapport?.jeux.map((j) => `${j.valeurs.nom}/${j.valeurs.ville}`).join() === 'Alpha/Lyon,Bêta/Lyon', JSON.stringify(r1.rapport?.jeux.map((j) => j.valeurs)));
      controle('--param l\'emporte sur [parametres] (D3.INV-6)', ['Alpha', 'Bêta'].every((n) => app.etat.ajouts.find((c) => c.nom === n)?.ville === 'Lyon'));
      controle('captures préfixées par le jeu', etapes(r1).filter((x) => x.capture).map((x) => x.capture).join() === 'captures/j1-05-verifier.png,captures/j2-05-verifier.png');
      const r2 = await jouer(chemin, ['--param', 'pays=FR']);
      controle('--param inconnu : code 2', r2.code === 2 && /--param pays/.test(r2.erreurs));
      const r3 = await jouer(chemin, ['--jeu', '2']);
      controle('--jeu 2 : le seul jeu 2', r3.code === 0 && r3.rapport?.jeux.length === 1 && r3.rapport?.jeux[0].numero === 2);
      const r4 = await jouer(chemin, ['--jeu', '3']);
      controle('--jeu 3 : code 2', r4.code === 2);
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R11', 'Profil dédié et réglages : session retrouvée, profils séparés, variables');
    {
      const connexion = ecrire('r11', 'connexion.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Connexion"\nurl_base = "${base}"\nprofil = "essai"\n\n[[etapes]]\naction = "naviguer"\nurl = "/connexion?auto=200"\n\n[[etapes]]\naction = "main"\nmessage = "Connectez-vous"\njusqua = { url = "/accueil-connecte" }\ndelai = 10\n`);
      const r1 = await jouer(connexion);
      controle('connexion faite dans la fenêtre, profil créé', r1.code === 0 && existsSync(join(TMP, 'profils', 'essai')));
      const session2 = (profil, attendu) => `format = "scenario-playwright.scenario/1"\ntitre = "Session"\nurl_base = "${base}"\nprofil = "${profil}"\n\n[[etapes]]\naction = "naviguer"\nurl = "/session"\n\n[[etapes]]\naction = "verifier"\ncritere = "contient"\ncible = { css = "#s" }\nattendu = "${attendu}"\n`;
      const r2 = await jouer(ecrire('r11', 'meme.toml', session2('essai', 'Session : ouverte')));
      controle('même profil : session retrouvée sans se reconnecter (D6.INV-2)', r2.code === 0, JSON.stringify(etapes(r2)[1]));
      const r3 = await jouer(ecrire('r11', 'autre.toml', session2('autre', 'Session : absente')));
      controle('autre profil : session absente', r3.code === 0);
      const def = session.lireReglages({});
      controle('défauts : chrome, .profils dans le dossier du skill, délai du scénario (D1.INV-3)', def.erreurs.length === 0 && def.reglages.canal === 'chrome' && def.reglages.profils === join(session.DOSSIER_SKILL, '.profils') && def.reglages.delai === undefined);
      const vides = session.lireReglages({ SCENARIO_PLAYWRIGHT_CANAL: '', SCENARIO_PLAYWRIGHT_PROFILS: '', SCENARIO_PLAYWRIGHT_DELAI: '' });
      controle('variable vide vaut absente', vides.erreurs.length === 0 && vides.reglages.canal === 'chrome');
      const faux = session.lireReglages({ SCENARIO_PLAYWRIGHT_CANAL: 'firefox', SCENARIO_PLAYWRIGHT_DELAI: '45' });
      controle('canal et délai invalides refusés', faux.erreurs.length === 2);
      controle('dossier des profils relatif au skill, ou absolu', session.lireReglages({ SCENARIO_PLAYWRIGHT_PROFILS: 'p' }).reglages.profils === join(session.DOSSIER_SKILL, 'p') && session.lireReglages({ SCENARIO_PLAYWRIGHT_PROFILS: TMP }).reglages.profils === TMP);
      const r4 = await jouer(join(TMP, 'r11', 'meme.toml'), [], { env: { ...ENV, SCENARIO_PLAYWRIGHT_CANAL: 'firefox' } });
      controle('canal invalide : code 2 avant le navigateur', r4.code === 2 && /SCENARIO_PLAYWRIGHT_CANAL/.test(r4.erreurs));
      const lent = ecrire('r11', 'delai.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Délai"\nurl_base = "${base}"\n\n[[etapes]]\naction = "naviguer"\nurl = "/clients"\n\n[[etapes]]\naction = "cliquer"\ncible = { role = "button", nom = "Inexistant" }\n`);
      const r5 = await jouer(lent, [], { env: { ...ENV, SCENARIO_PLAYWRIGHT_DELAI: '1' } });
      controle('SCENARIO_PLAYWRIGHT_DELAI s\'applique sans délai dans le scénario', /délai de 1 s dépassé/.test(etapes(r5)[1]?.message ?? ''), JSON.stringify(etapes(r5)[1]));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R12', 'Lignes de commande et codes de sortie');
    {
      const ok = join(TMP, 'r11', 'meme.toml');
      const cas = [
        ['jouer sans argument', 'jouer.mjs', [], 2, /scénario manquant/],
        ['option inconnue', 'jouer.mjs', [ok, '--vite'], 2, /option inconnue/],
        ['deux scénarios', 'jouer.mjs', [ok, ok], 2, /un seul scénario/],
        ['--param mal formé', 'jouer.mjs', [ok, '--param', 'ville'], 2, /nom=valeur/],
        ['--ralenti hors bornes', 'jouer.mjs', [ok, '--ralenti', '5000'], 2, /de 0 à 2000/],
        ['scénario introuvable', 'jouer.mjs', [join(TMP, 'absent.toml')], 2, /fichier introuvable/],
        ['verifier sans fichier', 'verifier.mjs', [], 2, /aucun fichier/],
        ['traduire autre chose qu\'un .scenario', 'traduire.mjs', [ok], 2, /fichier \.scenario attendu/],
        ['designer sans adresse http', 'designer.mjs', ['ftp://x'], 2, /adresse http ou https/],
        ['designer --max hors bornes', 'designer.mjs', [base, '--max', '0'], 2, /--max/],
      ];
      for (const [nom, script, args, code, motif] of cas) {
        const r = await lancer(script, args);
        controle(`${nom} : code ${code}`, r.code === code && motif.test(r.erreurs + r.sortie), `${r.code} ${r.erreurs}`);
      }
      const v = await lancer('verifier.mjs', [ok, join(TMP, 'r3', 'creer.scenario')]);
      controle('verifier : un texte et un scénario conformes, code 0', v.code === 0 && (v.sortie.match(/^ok {2}/gm) ?? []).length === 2, v.sortie);
      const v2 = await lancer('verifier.mjs', [ok, join(TMP, 'r2', 'syntaxe.toml')]);
      controle('verifier : un fichier refusé suffit pour le code 2', v2.code === 2);
      const v3 = await lancer('verifier.mjs', [join(TMP, 'r8', 'distant.toml')]);
      controle('verifier signale les mutations hors du poste', v3.code === 0 && /se joue avec --autoriser-mutations/.test(v3.sortie));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R13', 'Désignation : clic du développeur, cible rendue, page non actionnée');
    {
      const ctx = await session.ouvrirNavigateur({ canal, profil: join(TMP, 'profils', 'designer') });
      try {
        const page = ctx.pages()[0] ?? await ctx.newPage();
        await page.goto(`${base}/clients`);
        const avant = app.etat.clients.length;
        const rendues = [];
        const cliquer = async (loc) => {
          const b = await loc.boundingBox();
          await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
          await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
        };
        const promesse = designer(page, { max: 2, surCible: (r) => rendues.push(r) });
        await new Promise((r) => { setTimeout(r, 400); });
        await cliquer(page.getByRole('link', { name: 'Nouveau client' }));
        await new Promise((r) => { setTimeout(r, 400); });
        await cliquer(page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'Martin', exact: true }) }).getByRole('button'));
        const fin = await Promise.race([promesse, new Promise((r) => { setTimeout(() => r(null), 10_000); })]);
        controle('deux clics, deux cibles rendues', fin && rendues.length === 2, JSON.stringify(rendues));
        controle('lien rendu par son rôle et son nom', JSON.stringify(rendues[0]?.cible) === '{"role":"link","nom":"Nouveau client"}', JSON.stringify(rendues[0]));
        controle('bouton d\'une ligne rendu avec « dans »', rendues[1]?.cible?.role === 'button' && rendues[1]?.cible?.dans?.role === 'row', JSON.stringify(rendues[1]));
        controle('le clic de désignation n\'actionne pas la page (D9.INV-1)', page.url() === `${base}/clients` && app.etat.clients.length === avant);
        controle('cible rendue au format du scénario', /^\{ role = "link", nom = "Nouveau client" \}$/.test(cibles.cibleToml(rendues[0]?.cible ?? { texte: '?' })));
      } finally {
        await ctx.close();
      }
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R14', 'Compatibilité avec le navigateur du poste');
    {
      const ref = session.reference();
      controle('playwright-core 1.65.1, Chromium 159 de référence', ref.playwrightCore === '1.65.1' && ref.majeur === 159, JSON.stringify(ref));
      const c = (v) => session.compatibilite(v, ref);
      controle('même version majeure, ou une ou deux avant : sans avertissement', c('159.0.8154.6').avertissement === null && c('158.0.8127.65').avertissement === null && c('157.0.1').avertissement === null);
      controle('trois versions avant : avertissement « ancien » (D6.INV-1)', /ancien, 3 versions avant/.test(c('156.0.1').avertissement ?? ''));
      controle('plus récent que le Chromium de référence : avertissement', /plus récent que le Chromium 159/.test(c('160.0.1').avertissement ?? ''));
      controle('version illisible : avertissement', /illisible/.test(c('inconnue').avertissement ?? ''));
      controle('le rapport porte l\'avertissement de sa version', rapportComplet && rapportComplet.navigateur.avertissement === c(rapportComplet.navigateur.version).avertissement);
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R15', 'Dépendance unique, fichiers de travail écartés, aucun code exécuté dans la page');
    {
      const paquet = JSON.parse(readFileSync(join(SKILL, 'package.json'), 'utf8'));
      const verrou = JSON.parse(readFileSync(join(SKILL, 'package-lock.json'), 'utf8'));
      controle('une seule dépendance, playwright-core à version exacte (D1.INV-1)', JSON.stringify(paquet.dependencies) === '{"playwright-core":"1.65.1"}' && verrou.packages['node_modules/playwright-core'].version === '1.65.1' && Object.keys(verrou.packages).length === 2);
      controle('Node 22 ou plus récent', paquet.engines.node === '>=22' && Number(process.versions.node.split('.')[0]) >= 22);
      const ignores = readFileSync(join(SKILL, '.gitignore'), 'utf8');
      controle('.gitignore écarte node_modules/, .profils/ et resultats/ (D1.INV-2)', ['node_modules/', '.profils/', 'resultats/'].every((x) => ignores.split('\n').includes(x)));
      const sources = readdirSync(join(SKILL, 'scripts')).filter((f) => f.endsWith('.mjs')).map((f) => [f, readFileSync(join(SKILL, 'scripts', f), 'utf8')]);
      const interdits = ['.evaluate(', 'evaluateHandle', 'addInitScript', 'exposeFunction', 'exposeBinding', 'waitForTimeout', 'addScriptTag', '$eval', '$$eval', 'new Function', 'eval('];
      const trouves = sources.flatMap(([f, s]) => interdits.filter((x) => s.includes(x)).map((x) => `${f} : ${x}`));
      controle('aucune exécution de code dans la page dans les sources (D5.INV-1)', trouves.length === 0, trouves.join(', '));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R16', 'Points d\'extension : rapport (E1), format du scénario (E2), moteur (E3)');
    {
      const r = rapportComplet;
      const champs = ['format', 'skill', 'version', 'scenario', 'debut', 'fin', 'duree_ms', 'navigateur', 'options', 'jeux', 'origines_bloquees', 'cibles_fragiles', 'bilan', 'statut'];
      controle('E1 : champs du rapport', r && JSON.stringify(Object.keys(r)) === JSON.stringify(champs) && r.format === rapport.FORMAT_RAPPORT, JSON.stringify(r && Object.keys(r)));
      const champsEtape = ['numero', 'ligne', 'action', 'resume', 'cible', 'fragile', 'mutation', 'statut', 'duree_ms', 'message', 'capture', 'aria', 'telechargement', 'console', 'erreurs_page', 'reponses'];
      controle('E1 : champs de chaque étape', r && r.jeux[0].etapes.every((e) => JSON.stringify(Object.keys(e)) === JSON.stringify(champsEtape)));
      controle('E1 : champs du navigateur, du scénario et des options', r && JSON.stringify(Object.keys(r.navigateur)) === '["canal","version","playwright_core","chromium_reference","avertissement"]' && JSON.stringify(Object.keys(r.scenario)) === '["fichier","titre","etiquettes","source","empreinte","url_base","origines"]' && JSON.stringify(Object.keys(r.options)) === '["sans_tete","ralenti","trace","mutations_autorisees","params","jeu"]');
      controle('E2 : format et vocabulaire communs avec le navigateur d\'Agent2Test', scenario.FORMAT_SCENARIO === 'scenario-playwright.scenario/1' && ['naviguer', 'cliquer', 'saisir', 'choisir', 'cocher', 'survoler', 'touche', 'televerser', 'attendre', 'verifier'].every((a) => a in scenario.ACTIONS) && JSON.stringify(scenario.CRITERES) === '["contient","visible","valeur","nombre","url","actif"]');
      controle('E3 : fonctions exportées du moteur et de la session', ['jouerScenario', 'messageErreur', 'adresseCorrespond'].every((f) => typeof moteur[f] === 'function') && ['ouvrirNavigateur', 'garderOrigines', 'lireReglages', 'compatibilite'].every((f) => typeof session[f] === 'function') && ['lireScenario', 'preparerJeux', 'controlerTraduction', 'squeletteToml', 'planTraduction'].every((f) => typeof scenario[f] === 'function'));
    }

    // ------------------------------------------------------------------------------------------
    scenarioRecette('R17', 'Preuves : console, erreurs de la page, réponses en erreur, trace sur demande');
    {
      const chemin = ecrire('r17', 'erreurs.toml', `format = "scenario-playwright.scenario/1"\ntitre = "Erreurs"\nurl_base = "${base}"\n\n[[etapes]]\naction = "naviguer"\nurl = "/erreurs"\n\n[[etapes]]\naction = "verifier"\ncritere = "contient"\ncible = { role = "paragraph" }\nattendu = "Page qui se plaint"\n`);
      const r = await jouer(chemin, ['--trace']);
      const e = etapes(r);
      const consoles = e.flatMap((x) => x.console);
      const pages = e.flatMap((x) => x.erreurs_page);
      const reponses = e.flatMap((x) => x.reponses);
      controle('erreur de console relevée (D8.INV-2)', contient(consoles, 'erreur de démonstration'), JSON.stringify(consoles));
      controle('exception de la page relevée', contient(pages, 'exception de démonstration'), JSON.stringify(pages));
      controle('réponse 500 relevée', contient(reponses, /^500 .*\/manquant$/), JSON.stringify(reponses));
      controle('les erreurs de l\'application ne font pas échouer les étapes', r.code === 0);
      controle('trace enregistrée sur demande, avec l\'avertissement (D7.INV-3)', existsSync(join(r.dossier ?? TMP, 'trace.zip')) && r.rapport?.options.trace === true && /contient les cookies et les en-têtes de la session/.test(readFileSync(join(r.dossier, 'rapport.md'), 'utf8')));
      const sans = await jouer(chemin);
      controle('sans --trace, aucune trace', sans.code === 0 && !existsSync(join(sans.dossier ?? TMP, 'trace.zip')));
    }
  } finally {
    await app.arreter();
  }
}

let codeSortie = 0;
try {
  await principal();
} catch (e) {
  resultats.push({ scenario: courant, nom: 'exception', ok: false });
  console.log(`KO   ${courant} · exception : ${e.stack ?? e}`);
}
const echecs = resultats.filter((r) => !r.ok);
const sautes = resultats.filter((r) => r.saute);
const scenariosVus = new Set(resultats.map((r) => r.scenario));
console.log(`\nBilan : ${scenariosVus.size} scénarios, ${resultats.length} contrôles, ${resultats.length - echecs.length - sautes.length} réussis, ${echecs.length} en échec, ${sautes.length} sautés`);
if (echecs.length > 0 || process.env.GARDER_TMP === '1') {
  console.log(`Dossier temporaire gardé : ${TMP}`);
  codeSortie = echecs.length > 0 ? 1 : 0;
} else {
  rmSync(TMP, { recursive: true, force: true });
}
process.exit(codeSortie);
```
