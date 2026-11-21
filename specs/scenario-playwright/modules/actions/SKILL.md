---
name: actions
description: Actions et étapes du moteur (jeu fermé de treize actions et leurs champs, naviguer, cliquer, saisir, choisir, cocher, survoler, touche, televerser, telecharger, attendre, verifier, capturer, main ; aucune exécution de code dans la page ; attentes par état dans un délai borné ; critères de vérification contient, visible, valeur, nombre, url, actif, attendu et obtenu, et hors de l'écran requete, api et fichier (module hors-ecran) ; adresses comparées par chemin, requête et étoile finale ; déroulé d'un jeu, aucune étape rejouée, vérifications qui se poursuivent ; mutations ; fichiers téléversés et téléchargés ; point d'extension E3, jouerScenario), source de scripts/moteur.mjs. À lire pour traduire une phrase en étape, ou comprendre un résultat.
dimensions: [D5]
status: active
---

# Module `actions` (D5)

Phases 7E couvertes : Éléments et État.

## 1. Jeu fermé (D5.INV-1)

| Action | Champs requis | Facultatifs | Geste |
|---|---|---|---|
| `naviguer` | `url` : chemin commençant par `/`, ou adresse d'une origine déclarée | | va à l'adresse, attend le chargement ; une réponse de statut 400 ou plus fait échouer l'étape |
| `cliquer` | `cible` | `mutation` | clique la cible |
| `saisir` | `cible`, `valeur` (texte) | `mutation` | vide le champ, puis y écrit la valeur |
| `choisir` | `cible`, `valeur` | `mutation` | choisit dans une liste l'option de ce libellé visible |
| `cocher` | `cible`, `valeur` (`true` ou `false`) | `mutation` | coche ou décoche |
| `survoler` | `cible` | | place le pointeur sur la cible |
| `touche` | `touche` : `Enter`, `Tab`, `Escape`, `ArrowDown`, `Control+A`, un caractère… | `cible`, `mutation` | presse la touche, sur la cible si elle est donnée |
| `televerser` | `cible`, `fichier` : chemin ou liste de chemins relatifs au dossier du scénario | `mutation` | joint les fichiers au champ (D5.INV-5) |
| `telecharger` | `cible` | `nom`, `mutation` | clique la cible et enregistre le fichier téléchargé dans les résultats (D5.INV-5) |
| `attendre` | `etat` : `visible`, `masque`, `actif`, `inactif`, `texte`, `url` | `cible`, `texte`, `url` | attend que la cible ait l'état, contienne le texte, ou que la page ait l'adresse |
| `verifier` | `critere` : `contient`, `visible`, `valeur`, `nombre`, `url`, `actif`, et hors de l'écran `requete`, `api`, `fichier` | `cible`, `attendu`, `exact` ; `methode`, `chemin`, `fichier` hors de l'écran | constate un attendu (§ 3 ; module `hors-ecran`) |
| `capturer` | `nom` : minuscules, chiffres, `-`, `_` | `cible`, `pleine_page` | capture la zone de la cible, ou la page, entière avec `pleine_page = true` |
| `main` | `message`, `jusqua` : `{ url = "…" }` ou `{ cible = { … }, etat = "visible" }` | | rend la main au développeur, jusqu'à l'état décrit (module `session`, § 4) |

Les champs communs, `ligne`, `delai` et `mutation`, sont décrits au module `scenario`, § 1. Aucune action n'exécute de code dans la page : ni évaluation, ni script injecté, ni fonction exposée ; le moteur ne voit la page que par les localisateurs de Playwright. Les sources du skill n'emploient ni `evaluate`, ni `addInitScript`, ni `exposeFunction`, ni `waitForTimeout`, et la recette le vérifie (R15). Le JavaScript de l'application, lui, s'exécute normalement.

## 2. Attentes et délais (D5.INV-2)

Chaque étape attend un état, jamais une durée : un élément actionnable pour un geste, la condition pour `attendre` et `verifier`, l'état de `jusqua` pour `main`. L'état s'interroge à intervalles croissants, 100, 250, 500 puis 1 000 ms, et l'étape s'arrête dès qu'il est obtenu. Le délai est celui de l'étape (`delai`), sinon du scénario, sinon du réglage `SCENARIO_PLAYWRIGHT_DELAI`, sinon 10 s ; il ne dépasse jamais 30 s, et 900 s pour une étape `main`, dont le délai par défaut est de 300 s.

## 3. Vérifications (D5.INV-4)

| Critère | Champs | Réussit quand |
|---|---|---|
| `contient` | `cible`, `attendu` (texte), `exact` facultatif | le texte affiché de la cible, espaces regroupés, contient l'attendu ; lui est égal avec `exact = true` |
| `visible` | `cible`, `attendu` (`true` par défaut, ou `false`) | la cible est visible, ou ne l'est pas (absente ou masquée) |
| `valeur` | `cible`, `attendu` (texte) | le champ a cette valeur |
| `nombre` | `cible`, `attendu` (entier) | la cible désigne ce nombre d'éléments ; seul critère où une cible peut en désigner plusieurs |
| `url` | `attendu` | la page a cette adresse (ci-dessous) |
| `actif` | `cible`, `attendu` (`true` par défaut, ou `false`) | la cible est active, ou inactive |

Une vérification interroge l'état jusqu'à son délai. Son échec donne l'attendu et l'obtenu : `attendu : un texte qui contient « Fournisseurs » ; obtenu : texte « Clients »`, `attendu : 99 éléments ; obtenu : 3 éléments`. Chaque vérification à l'écran a sa capture, de la zone de la cible si elle est visible, sinon de la page (D8.INV-2).

Hors de l'écran, `requete` observe les requêtes que la page a faites depuis la dernière action, `api` lit une ressource en GET sur une origine déclarée, avec la session du profil, et `fichier` lit un fichier téléchargé par une étape `telecharger` nommée : module `hors-ecran`. Ces vérifications ne prennent pas de cible ; elles ont leur relevé dans le rapport, et une capture à l'échec seulement.

Une adresse attendue (`verifier` et `url`, `attendre` et `url`, `jusqua.url`) se compare ainsi :

- un chemin qui commence par `/` se compare au chemin de la page, sur l'origine de `url_base` ; la requête (`?…`) compte s'il en porte une ;
- une étoile finale accepte la suite : `/clients/*`, `/clients?cree=*` ;
- une adresse complète se compare entière, sans l'ancre ;
- l'attendu et l'adresse se comparent décodés : `/clients?cree=Zoé` correspond à `/clients?cree=Zo%C3%A9`.

## 4. Déroulé d'un jeu (D5.INV-3)

Les étapes se jouent dans l'ordre, une fois chacune : aucune étape n'est rejouée, ni après un échec, ni en cas d'instabilité. Une étape échouée arrête le jeu ; les étapes suivantes sont « non jouées », avec le motif. Une exception : après une étape `verifier` échouée, les étapes `verifier` qui suivent sont jouées, car aucune ne change la page et chaque attendu reçoit son constat ; la première étape d'une autre action est alors non jouée, et le jeu s'arrête. Le jeu suivant, s'il y en a, est joué dans un onglet neuf du même profil.

## 5. Mutations

Une étape qui crée, modifie ou supprime des données porte `mutation` : sa ligne du texte est marquée, ou la traduction la signale (module `texte`, § 5). Hors du poste, ces étapes demandent l'autorisation explicite du développeur pour l'exécution, et une étape de mutation sur une page hors du poste échoue sans agir quand elle manque (D7.INV-2, module `garde`, § 2). Une mutation n'est jamais rejouée, comme toute étape (§ 4).

## 6. Fichiers (D5.INV-5)

- `televerser` ne prend que des fichiers du dossier du scénario et de ses sous-dossiers : un chemin absolu, un `..`, ou un fichier absent sont refusés avant le navigateur. Un fichier de données de test se range donc à côté du scénario, par exemple dans `donnees/`.
- `telecharger` attend le téléchargement que déclenche le clic, et l'enregistre dans `telechargements/` du dossier de résultats, sous le nom proposé par l'application, ou sous `nom` suivi de son extension. Le rapport donne le fichier, le nom proposé, la taille et l'empreinte SHA-256. Avec `nom`, une vérification `fichier` lit ensuite ce fichier (module `hors-ecran`, § 5).

## 7. Point d'extension E3

`jouerScenario(contexte, options)` joue des jeux préparés dans un contexte de navigateur ouvert, et rend la liste des jeux joués, chacun avec ses étapes au format du rapport (module `preuves`, § 2). Options : `scenario` (validé), `jeux` (préparés par `preparerJeux` du module `scenario`), `resultats` (dossier), `journal` (rendu par `garderOrigines` du module `session`), `delai` (s), `autoriserMutations`, `surEvenement` (avancement : début d'un jeu, début et fin d'une étape, étape à la main). `jouer.mjs` en est le premier appelant ; la recette en est un second (R8).

## 8. Contrôle de sortie

- Chaque action du jeu fermé est jouée sur l'application de démonstration, et l'application reçoit ce que l'utilisateur aurait fait (module `recette`, R5).
- Une attente s'arrête dès l'état obtenu, et échoue à son délai (D5.INV-2).
- Les vérifications échouées se poursuivent, les autres échecs arrêtent le jeu, rien n'est rejoué (D5.INV-3).
- Chaque critère donne l'attendu et l'obtenu (D5.INV-4), hors de l'écran compris (D19.INV-3).
- Aucune source n'exécute de code dans la page (D5.INV-1).

## 9. Source `scripts/moteur.mjs`

<!-- fichier : scripts/moteur.mjs -->
```javascript
// scenario-playwright 1.3.0 : moteur des étapes, jeu d'actions fermé.
//
// Chaque étape agit comme une personne devant l'écran, sur une cible résolue côté utilisateur (D4).
// Aucune étape n'exécute de code dans la page (D5.INV-1) ; les attentes portent sur un état, dans un
// délai borné (D5.INV-2) ; aucune étape n'est rejouée (D5.INV-3) ; une étape de mutation hors du poste
// n'agit qu'avec l'autorisation explicite du développeur (D7.INV-2). Hors de l'écran, les vérifications
// observent les requêtes de la page, lisent l'API en GET sur une origine déclarée, sans suivre de
// redirection, et lisent les fichiers téléchargés (D19.INV-1) ; aucun en-tête ni cookie n'est relevé,
// les corps restent en mémoire, jamais ceux d'une étape à la main, et les secrets sont masqués (D19.INV-2).
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { setTimeout as pause } from 'node:timers/promises';
import { URL, URLSearchParams } from 'node:url';
import { decrireCible, estFragile, localisateur } from './cibles.mjs';
import { DELAI_MAIN_DEFAUT, enTexte, masquerValeurs, RE_SECRET, resumeEtape } from './scenario.mjs';
import { estLocale } from './session.mjs';

export const INTERVALLES = [100, 250, 500, 1000];
export const INTERVALLES_API = [250, 500, 1000, 2000];
/** Bornes des vérifications hors de l'écran (D19.INV-3), en octets, et nombre de requêtes gardées par jeu. */
export const LIMITES_HORS_ECRAN = { corps: 65536, reponse: 262144, api: 1048576, fichier: 10485760, requetes: 500 };
const TYPES_RELEVES = new Set(['document', 'xhr', 'fetch']);
const ETAPES_SANS_ACTION = new Set(['verifier', 'attendre', 'capturer']);

/** Texte comparé : espaces regroupés, bords retirés. */
export const normaliserTexte = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

/**
 * Une adresse correspond-elle à l'attendu ? Un attendu qui commence par / se compare au chemin de la
 * page, sur l'origine de url_base, requête comprise s'il en porte une ; une étoile finale accepte la
 * suite. Une adresse complète se compare entière, sans l'ancre. Les deux se comparent décodées.
 */
export function adresseCorrespond(courante, attendu, urlBase) {
  let u;
  try {
    u = new URL(courante);
  } catch {
    return false;
  }
  const prefixe = attendu.endsWith('*');
  const motif = prefixe ? attendu.slice(0, -1) : attendu;
  let obtenu;
  if (motif.startsWith('/')) {
    if (u.origin !== new URL(urlBase).origin) return false;
    obtenu = u.pathname + (motif.includes('?') || prefixe ? u.search : '');
  } else {
    obtenu = u.href.replace(/#.*$/, '');
  }
  const decode = (s) => { try { return decodeURIComponent(s.replace(/\+/g, ' ')); } catch { return s; } };
  obtenu = decode(obtenu);
  const voulu = decode(motif);
  return prefixe ? obtenu.startsWith(voulu) : obtenu === voulu;
}

/** Message d'une erreur de Playwright, court et lisible ; une cible ambiguë garde ses candidats (D4.INV-2). */
export function messageErreur(e, delaiMs) {
  const brut = String(e?.message ?? e).replace(/\u001b\[[0-9;]*m/g, '');
  const lignes = brut.split('\n');
  if (/strict mode violation/.test(brut)) {
    const n = /resolved to (\d+) elements/.exec(brut)?.[1] ?? 'plusieurs';
    const candidats = lignes.filter((l) => /^\s*\d+\) /.test(l)).slice(0, 5).map((l) => l.trim());
    return `cible ambiguë, ${n} éléments trouvés, aucune action faite : ${candidats.join(' ; ')}`;
  }
  if (/ERR_BLOCKED_BY_CLIENT/.test(brut)) return 'navigation vers une origine non déclarée, interrompue (D7.INV-1)';
  if (e?.name === 'TimeoutError' || /Timeout \d+ms exceeded/.test(brut)) {
    const attente = lignes.find((l) => /waiting for/.test(l))?.replace(/^\s*-\s*/, '').trim();
    return `délai de ${Math.round(delaiMs / 1000)} s dépassé${attente ? ` (${attente})` : ''}`;
  }
  return lignes[0].replace(/^[a-zA-Z.]+: (Error: )?/, '').slice(0, 500);
}

/** Interroge un état jusqu'à son obtention ou la fin du délai ; rend { ok, valeur, erreur }. */
export async function sonder(lire, test, delaiMs, intervalles = INTERVALLES) {
  const fin = Date.now() + delaiMs;
  let i = 0;
  let derniere = { ok: false };
  for (;;) {
    try {
      const valeur = await lire();
      if (test(valeur)) return { ok: true, valeur };
      derniere = { ok: false, valeur };
    } catch (e) {
      derniere = { ok: false, erreur: e };
      if (/strict mode violation/.test(String(e?.message))) return derniere;
    }
    const reste = fin - Date.now();
    if (reste <= 0) return derniere;
    await pause(Math.min(intervalles[Math.min(i++, intervalles.length - 1)], reste));
  }
}

const sha256 = (tampon) => createHash('sha256').update(tampon).digest('hex');
const nomSur = (s) => basename(String(s)).replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').slice(0, 120) || 'telechargement';

class Echec extends Error {}

/** Vérification d'un critère (D5.INV-4) ; lève Echec avec l'attendu et l'obtenu. */
async function verifier(page, e, delaiMs, urlBase) {
  const loc = e.cible ? localisateur(page, e.cible) : null;
  const attendu = e.attendu;
  let r;
  let decrire;
  switch (e.critere) {
    case 'contient': {
      const voulu = normaliserTexte(attendu);
      r = await sonder(() => loc.innerText({ timeout: Math.min(delaiMs, 1000) }), (t) => (e.exact ? normaliserTexte(t) === voulu : normaliserTexte(t).includes(voulu)), delaiMs);
      decrire = (v) => `texte « ${normaliserTexte(v).slice(0, 200)} »`;
      break;
    }
    case 'visible': {
      const voulu = attendu !== false;
      r = await sonder(() => loc.isVisible(), (v) => v === voulu, delaiMs);
      decrire = (v) => (v ? 'visible' : 'non visible');
      break;
    }
    case 'valeur':
      r = await sonder(() => loc.inputValue({ timeout: Math.min(delaiMs, 1000) }), (v) => v === attendu, delaiMs);
      decrire = (v) => `valeur « ${v} »`;
      break;
    case 'nombre':
      r = await sonder(() => loc.count(), (v) => v === attendu, delaiMs);
      decrire = (v) => `${v} élément${v > 1 ? 's' : ''}`;
      break;
    case 'actif': {
      const voulu = attendu !== false;
      r = await sonder(() => loc.isEnabled({ timeout: Math.min(delaiMs, 1000) }), (v) => v === voulu, delaiMs);
      decrire = (v) => (v ? 'actif' : 'inactif');
      break;
    }
    default:
      r = await sonder(() => page.url(), (u) => adresseCorrespond(u, attendu, urlBase), delaiMs);
      decrire = (v) => `adresse ${v}`;
  }
  if (r.ok) return;
  if (r.erreur && /strict mode violation/.test(String(r.erreur.message))) throw new Echec(messageErreur(r.erreur, delaiMs));
  const obtenu = r.valeur !== undefined ? decrire(r.valeur) : `rien (${messageErreur(r.erreur, delaiMs)})`;
  const voulu = ({ contient: e.exact ? `le texte « ${attendu} »` : `un texte qui contient « ${attendu} »`, visible: attendu === false ? 'non visible' : 'visible', valeur: `la valeur « ${attendu} »`, nombre: `${attendu} élément${attendu > 1 ? 's' : ''}`, actif: attendu === false ? 'inactif' : 'actif', url: `l'adresse ${attendu}` })[e.critere];
  throw new Echec(`attendu : ${voulu} ; obtenu : ${obtenu}`);
}

// --- Hors de l'écran : requêtes de la page, API en lecture, fichiers téléchargés (D19) ---------------------

const estTable = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const echapperRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Adresse lisible dans un rapport : sans ancre, valeurs des paramètres au nom de secret masquées (D19.INV-2). */
export function adresseMasquee(adresse) {
  let u;
  try { u = new URL(adresse); } catch { return String(adresse).replace(/[?#].*$/, ''); }
  const p = [...u.searchParams].map(([k, v]) => `${encodeURIComponent(k)}=${RE_SECRET.test(k) ? '***' : encodeURIComponent(v)}`).join('&');
  return `${u.origin}${u.pathname}${p ? `?${p}` : ''}`;
}

/** Une valeur attendue est-elle contenue dans la valeur obtenue ? Tables : chaque champ attendu, avec sa valeur ; tableaux : chaque élément attendu dans un élément obtenu. */
export function sousEnsemble(attendu, obtenu) {
  if (Array.isArray(attendu)) return Array.isArray(obtenu) && attendu.every((a) => obtenu.some((o) => sousEnsemble(a, o)));
  if (estTable(attendu)) return estTable(obtenu) && Object.entries(attendu).every(([k, v]) => Object.hasOwn(obtenu, k) && sousEnsemble(v, obtenu[k]));
  return attendu === obtenu;
}

/** Corps lu : JSON, ou formulaire a=1&b=2 ; null sinon. */
export function lireCorps(texte) {
  if (typeof texte !== 'string' || texte === '') return null;
  try { return JSON.parse(texte); } catch { /* pas du JSON */ }
  return /^[^=&\s]+=[^&]*(?:&[^=&\s]+=[^&]*)*$/.test(texte) ? Object.fromEntries(new URLSearchParams(texte)) : null;
}

/** Valeurs obtenues pour les champs attendus, masquées, pour le message d'échec. */
function extrait(attendu, obtenu) {
  const v = estTable(attendu) && estTable(obtenu) ? Object.fromEntries(Object.keys(attendu).map((k) => [k, Object.hasOwn(obtenu, k) ? obtenu[k] : '(absent)'])) : obtenu;
  const t = enTexte(masquerValeurs(v));
  return t.length > 300 ? `${t.slice(0, 300)}…` : t;
}

/** Une requête relevée correspond-elle au chemin et à la méthode d'une vérification ? */
export function requeteCorrespond(q, e, origines) {
  if (e.methode && q.methode !== e.methode) return false;
  let u;
  try { u = new URL(q.url); } catch { return false; }
  let motif = e.chemin;
  if (/^https?:\/\//i.test(motif)) {
    const o = /^https?:\/\/[^/?#]+/i.exec(motif)[0];
    if (u.origin !== new URL(o).origin) return false;
    motif = motif.slice(o.length) || '/';
  } else if (!origines.includes(u.origin)) return false;
  const prefixe = motif.endsWith('*');
  if (prefixe) motif = motif.slice(0, -1);
  const [chemin, requete] = motif.split('?');
  const decode = (x) => { try { return decodeURIComponent(x); } catch { return x; } };
  const re = new RegExp(`^${chemin.split(/(\{[^}]+\})/).map((p) => (/^\{[^}]+\}$/.test(p) ? '[^/]+' : echapperRe(p))).join('')}${prefixe ? '' : '/?$'}`);
  if (!re.test(decode(u.pathname))) return false;
  if (requete) for (const [k, v] of new URLSearchParams(requete)) if (!u.searchParams.getAll(k).includes(v)) return false;
  return true;
}

/**
 * Relevé des requêtes d'une page, documents et appels xhr ou fetch (D19.INV-2) : méthode, adresse, statut ;
 * ni en-tête ni cookie ; corps de requête et réponses JSON en mémoire seulement, bornés, jamais ceux
 * d'une étape à la main.
 */
function releverRequetes(page, reseau) {
  const enCours = new Map();
  page.on('request', (req) => {
    let type;
    try { type = req.resourceType(); } catch { return; }
    if (!TYPES_RELEVES.has(type)) return;
    const q = { methode: req.method(), url: req.url(), quand: Date.now(), type, statut: null, fini: false, echec: null, corps: null, reponse: null, main: reseau.main };
    if (!q.main) {
      try {
        const d = req.postData();
        if (d !== null && d.length <= LIMITES_HORS_ECRAN.corps && !/multipart/i.test(req.headers()['content-type'] ?? '')) q.corps = d;
      } catch { /* corps illisible */ }
    }
    enCours.set(req, q);
    reseau.requetes.push(q);
    if (reseau.requetes.length > LIMITES_HORS_ECRAN.requetes) reseau.requetes.shift();
  });
  page.on('response', (rep) => {
    const q = enCours.get(rep.request());
    if (!q) return;
    q.statut = rep.status();
    // Le corps se demande dès la réponse : après un changement d'adresse de la page, il n'est plus lisible.
    if (!q.main && q.type !== 'document' && /json/i.test(rep.headers()['content-type'] ?? '')) {
      q.lecture = rep.body().then((corps) => {
        if (corps.length <= LIMITES_HORS_ECRAN.reponse) q.reponse = corps.toString('utf8');
        else q.reponseTropGrande = true;
      }, () => { q.interrompue = true; });
    }
  });
  page.on('requestfinished', async (req) => {
    const q = enCours.get(req);
    if (!q) return;
    enCours.delete(req);
    await q.lecture;
    q.fini = true;
  });
  page.on('requestfailed', (req) => {
    const q = enCours.get(req);
    if (!q) return;
    enCours.delete(req);
    q.fini = true;
    // Une réponse reçue puis interrompue (la page a changé d'adresse) garde son statut ; son corps n'est pas lu.
    if (q.statut === null) q.echec = req.failure()?.errorText ?? 'échec';
    else if (q.reponse === null) q.interrompue = true;
  });
}

async function verifierRequete(e, { delaiMs, scenario, reseau, r }) {
  const a = e.attendu ?? {};
  const depuis = reseau.debutAction;
  const lire = async () => reseau.requetes.filter((q) => q.quand >= depuis && requeteCorrespond(q, e, scenario.origines));
  const satisfait = (q) => q.fini && !q.echec && (a.statut !== undefined ? q.statut === a.statut : q.statut !== null && q.statut < 400)
    && (a.corps === undefined || sousEnsemble(a.corps, lireCorps(q.corps))) && (a.reponse === undefined || sousEnsemble(a.reponse, lireCorps(q.reponse)));
  const s = await sonder(lire, (liste) => liste.some(satisfait), delaiMs);
  const liste = s.valeur ?? [];
  const q = liste.find(satisfait) ?? liste.at(-1) ?? null;
  if (q) r.hors_ecran = { critere: 'requete', methode: q.methode, adresse: adresseMasquee(q.url), statut: q.statut };
  if (s.ok) return;
  const quoi = `${e.methode ? `${e.methode} ` : ''}${e.chemin}`;
  if (!q) {
    const vues = reseau.requetes.filter((x) => x.quand >= depuis).slice(-5).map((x) => `${x.methode} ${adresseMasquee(x.url)}${x.statut ? ` ${x.statut}` : ''}`);
    throw new Echec(`aucune requête ${quoi} depuis l'étape ${reseau.etapeAction || 1}${vues.length ? ` ; requêtes vues : ${vues.join(', ')}` : ' ; aucune requête de la page'}`);
  }
  const desig = `${q.methode} ${adresseMasquee(q.url)}`;
  if (!q.fini) throw new Echec(`requête ${desig} sans réponse en ${Math.round(delaiMs / 1000)} s`);
  if (q.echec) throw new Echec(`requête ${desig} en échec : ${q.echec}`);
  const voulu = [a.statut !== undefined ? `statut ${a.statut}` : 'un statut inférieur à 400'];
  const obtenu = [`statut ${q.statut}`];
  if (a.corps !== undefined) {
    voulu.push(`corps ${enTexte(masquerValeurs(a.corps))}`);
    obtenu.push(q.main ? 'corps non relevé pendant une étape à la main' : q.corps === null ? 'corps absent ou non relevé' : `corps ${extrait(a.corps, lireCorps(q.corps))}`);
  }
  if (a.reponse !== undefined) {
    voulu.push(`réponse ${enTexte(masquerValeurs(a.reponse))}`);
    obtenu.push(q.main ? 'réponse non relevée pendant une étape à la main' : q.reponseTropGrande ? `réponse de plus de ${LIMITES_HORS_ECRAN.reponse} octets, non lue` : q.interrompue ? 'réponse interrompue avant la fin de sa lecture (la page a changé d\'adresse)' : q.reponse === null ? 'réponse non JSON, ou non relevée' : `réponse ${extrait(a.reponse, lireCorps(q.reponse))}`);
  }
  throw new Echec(`requête ${desig} : attendu : ${voulu.join(', ')} ; obtenu : ${obtenu.join(', ')}`);
}

async function verifierApi(page, e, { delaiMs, scenario, r }) {
  const adresse = new URL(e.chemin, scenario.url_base);
  if (!scenario.origines.includes(adresse.origin)) throw new Echec(`${adresse.origin} n'est pas parmi les origines du scénario : aucun appel fait (D19.INV-1)`);
  const a = e.attendu ?? {};
  const lire = async () => {
    const rep = await page.context().request.get(adresse.href, { maxRedirects: 0, failOnStatusCode: false, timeout: Math.max(1000, Math.min(delaiMs, 10_000)) });
    try {
      const statut = rep.status();
      if (statut >= 300 && statut < 400) return { statut, redirection: rep.headers().location ?? '' };
      const corps = await rep.body();
      return corps.length > LIMITES_HORS_ECRAN.api ? { statut, octets: corps.length, trop: true } : { statut, octets: corps.length, texte: corps.toString('utf8') };
    } finally {
      await rep.dispose().catch(() => {});
    }
  };
  const json = (v) => { try { return JSON.parse(v.texte); } catch { return undefined; } };
  const satisfait = (v) => v.redirection === undefined && !v.trop && (a.statut !== undefined ? v.statut === a.statut : v.statut >= 200 && v.statut < 300)
    && (a.contient === undefined || (typeof a.contient === 'string' ? v.texte.includes(a.contient) : sousEnsemble(a.contient, json(v))))
    && (a.nombre === undefined || (Array.isArray(json(v)) && json(v).length === a.nombre));
  const s = await sonder(lire, (v) => satisfait(v) || v.redirection !== undefined, delaiMs, INTERVALLES_API);
  const v = s.valeur;
  if (v) r.hors_ecran = { critere: 'api', methode: 'GET', adresse: adresseMasquee(adresse.href), statut: v.statut, octets: v.octets ?? null };
  if (v?.redirection !== undefined) throw new Echec(`l'API répond ${v.statut}, redirection vers ${adresseMasquee(new URL(v.redirection, adresse).href)} non suivie (D19.INV-1)`);
  if (s.ok) return;
  if (!v) throw new Echec(`API GET ${adresseMasquee(adresse.href)} : ${messageErreur(s.erreur, delaiMs)}`);
  if (v.trop) throw new Echec(`API GET ${adresseMasquee(adresse.href)} : réponse de plus de ${LIMITES_HORS_ECRAN.api} octets, non lue`);
  const voulu = [a.statut !== undefined ? `statut ${a.statut}` : 'un statut 2xx'];
  const obtenu = [`statut ${v.statut}`];
  if (a.contient !== undefined) {
    voulu.push(typeof a.contient === 'string' ? `un corps qui contient « ${a.contient} »` : `les champs ${enTexte(masquerValeurs(a.contient))}`);
    obtenu.push(typeof a.contient === 'string' ? `corps « ${normaliserTexte(v.texte).slice(0, 200)} »` : `corps ${extrait(a.contient, json(v))}`);
  }
  if (a.nombre !== undefined) {
    voulu.push(`un tableau de ${a.nombre} élément${a.nombre > 1 ? 's' : ''}`);
    obtenu.push(Array.isArray(json(v)) ? `${json(v).length} élément${json(v).length > 1 ? 's' : ''}` : 'pas un tableau JSON');
  }
  throw new Echec(`API GET ${adresseMasquee(adresse.href)} : attendu : ${voulu.join(', ')} ; obtenu : ${obtenu.join(', ')}`);
}

/** Lignes d'un CSV, séparateur deviné sur la première ligne (; , ou tabulation), guillemets compris. */
export function lireCsv(texte) {
  const premiere = texte.split('\n')[0] ?? '';
  const compter = (c) => premiere.split(c).length - 1;
  const sep = [';', ',', '\t'].reduce((m, c) => (compter(c) > compter(m) ? c : m), ';');
  const lignes = [];
  let ligne = [];
  let cellule = '';
  let guillemets = false;
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (guillemets) {
      if (c === '"' && texte[i + 1] === '"') { cellule += '"'; i++; } else if (c === '"') guillemets = false;
      else cellule += c;
    } else if (c === '"' && cellule === '') guillemets = true;
    else if (c === sep) { ligne.push(cellule); cellule = ''; } else if (c === '\n') { ligne.push(cellule); if (ligne.some((x) => x !== '')) lignes.push(ligne); ligne = []; cellule = ''; } else cellule += c;
  }
  ligne.push(cellule);
  if (ligne.some((x) => x !== '')) lignes.push(ligne);
  return lignes;
}

function verifierFichier(e, { telechargements, r }) {
  const t = telechargements.get(e.fichier);
  if (!t) throw new Echec(`aucun fichier téléchargé sous le nom « ${e.fichier} » dans ce jeu`);
  const contenu = readFileSync(t.chemin);
  if (contenu.length > LIMITES_HORS_ECRAN.fichier) throw new Echec(`fichier ${t.rel} de plus de ${LIMITES_HORS_ECRAN.fichier} octets, non lu`);
  const texte = contenu.toString('utf8').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const lignes = texte.split('\n').filter((l) => l.trim() !== '');
  r.hors_ecran = { critere: 'fichier', fichier: t.rel, lignes: lignes.length, octets: contenu.length };
  const a = e.attendu;
  const voulu = [];
  const obtenu = [];
  if (a.contient !== undefined && !texte.includes(a.contient)) { voulu.push(`un texte qui contient « ${a.contient} »`); obtenu.push(`début « ${normaliserTexte(texte).slice(0, 120)} »`); }
  if (a.lignes !== undefined && lignes.length !== a.lignes) { voulu.push(`${a.lignes} ligne${a.lignes > 1 ? 's' : ''}`); obtenu.push(`${lignes.length} ligne${lignes.length > 1 ? 's' : ''}`); }
  if (a.csv !== undefined) {
    const table = lireCsv(texte);
    const entete = (table[0] ?? []).map((c) => c.trim());
    const k = entete.findIndex((c) => c.toLowerCase() === a.csv.colonne.trim().toLowerCase());
    const secret = RE_SECRET.test(a.csv.colonne);
    if (k < 0) { voulu.push(`une colonne « ${a.csv.colonne} »`); obtenu.push(`colonnes ${entete.join(', ').slice(0, 200)}`); } else {
      const valeurs = table.slice(1).map((l) => (l[k] ?? '').trim());
      if (!valeurs.includes(a.csv.valeur.trim())) {
        voulu.push(`la valeur « ${secret ? '***' : a.csv.valeur} » dans la colonne ${entete[k]}`);
        obtenu.push(secret ? `${valeurs.length} valeurs masquées` : `valeurs ${[...new Set(valeurs)].slice(0, 10).join(', ').slice(0, 200)}`);
      }
    }
  }
  if (voulu.length) throw new Echec(`fichier ${t.rel} : attendu : ${voulu.join(', ')} ; obtenu : ${obtenu.join(', ')}`);
}

async function attendre(page, e, delaiMs, urlBase) {
  if (e.etat === 'url') {
    const r = await sonder(() => page.url(), (u) => adresseCorrespond(u, e.url, urlBase), delaiMs);
    if (!r.ok) throw new Echec(`l'adresse ${e.url} n'est pas atteinte en ${Math.round(delaiMs / 1000)} s ; adresse : ${page.url()}`);
    return;
  }
  const loc = localisateur(page, e.cible);
  const lectures = {
    visible: [() => loc.isVisible(), (v) => v === true, 'visible'],
    masque: [() => loc.isVisible(), (v) => v === false, 'masqué'],
    actif: [() => loc.isEnabled({ timeout: Math.min(delaiMs, 1000) }), (v) => v === true, 'actif'],
    inactif: [() => loc.isEnabled({ timeout: Math.min(delaiMs, 1000) }), (v) => v === false, 'inactif'],
    texte: [() => loc.innerText({ timeout: Math.min(delaiMs, 1000) }), (t) => normaliserTexte(t).includes(normaliserTexte(e.texte)), `avec le texte « ${e.texte} »`],
  };
  const [lire, test, libelle] = lectures[e.etat];
  const r = await sonder(lire, test, delaiMs);
  if (r.ok) return;
  if (r.erreur && /strict mode violation/.test(String(r.erreur.message))) throw new Echec(messageErreur(r.erreur, delaiMs));
  throw new Echec(`${decrireCible(e.cible)} n'est pas ${libelle} en ${Math.round(delaiMs / 1000)} s`);
}

/**
 * Joue les jeux préparés dans le contexte du navigateur (point d'extension E3). Options :
 * { scenario, jeux, resultats (dossier), journal (garde des origines), delai (s), autoriserMutations,
 *   surEvenement }. Rend la liste des jeux joués, avec le résultat de chaque étape.
 */
export async function jouerScenario(contexte, { scenario, jeux, resultats, journal, delai, autoriserMutations = false, surEvenement = () => {} }) {
  const joues = [];
  const plusieurs = jeux.length > 1;
  let precedente = null;
  for (const jeu of jeux) {
    // Chaque jeu dans un onglet neuf, ouvert avant de fermer le précédent : fermer le dernier onglet fermerait la fenêtre.
    const page = precedente === null && contexte.pages().length > 0 ? contexte.pages()[0] : await contexte.newPage();
    if (precedente) await precedente.close().catch(() => {});
    precedente = page;
    let seau = null;
    page.on('console', (m) => { if (seau && m.type() === 'error') seau.console.push(m.text().slice(0, 500)); });
    page.on('pageerror', (err) => { if (seau) seau.erreurs_page.push(String(err.message).slice(0, 500)); });
    page.on('response', (rep) => { if (seau && rep.status() >= 400) seau.reponses.push(`${rep.status()} ${rep.url()}`); });
    const reseau = { requetes: [], debutAction: Date.now(), etapeAction: 0, main: false };
    releverRequetes(page, reseau);
    const telechargements = new Map();
    const resultat = { numero: jeu.numero, valeurs: jeu.valeurs, statut: 'reussi', etapes: [] };
    surEvenement({ type: 'jeu', jeu: jeu.numero, valeurs: jeu.valeurs, plusieurs });
    let arret = null; // motif d'arrêt : les étapes suivantes ne sont pas jouées
    let echecVerifier = false;
    for (let i = 0; i < jeu.etapes.length; i++) {
      const e = jeu.etapes[i];
      const prefixe = `${plusieurs ? `j${jeu.numero}-` : ''}${String(i + 1).padStart(2, '0')}`;
      const r = {
        numero: i + 1, ligne: e.ligne ?? null, action: e.action, resume: resumeEtape(e), cible: e.cible ? decrireCible(e.cible) : null,
        fragile: estFragile(e.cible) || estFragile(e.jusqua?.cible), mutation: e.mutation ?? null, statut: 'reussie', duree_ms: 0, message: null,
        capture: null, aria: null, telechargement: null, hors_ecran: null, console: [], erreurs_page: [], reponses: [],
      };
      resultat.etapes.push(r);
      if (arret || (echecVerifier && e.action !== 'verifier')) {
        if (!arret) arret = 'une vérification a échoué';
        r.statut = 'non_jouee';
        r.message = `non jouée : ${arret}`;
        continue;
      }
      seau = r;
      const delaiMs = (e.delai ?? (e.action === 'main' ? DELAI_MAIN_DEFAUT : delai)) * 1000;
      const debut = Date.now();
      let fin = null;
      surEvenement({ type: 'etape', jeu: jeu.numero, etape: r });
      if (!ETAPES_SANS_ACTION.has(e.action)) { reseau.debutAction = debut; reseau.etapeAction = i + 1; }
      reseau.main = e.action === 'main';
      try {
        if (e.mutation) {
          const origine = new URL(page.url()).origin;
          if (!/^https?:/.test(page.url()) || (!estLocale(origine) && !autoriserMutations)) {
            throw new Echec(`étape de mutation sur ${/^https?:/.test(page.url()) ? origine : page.url()}, hors du poste, sans --autoriser-mutations : aucune action faite (D7.INV-2)`);
          }
        }
        await jouerEtape(page, e, { delaiMs, scenario, resultats, prefixe, r, surEvenement, reseau, telechargements });
        const bloquee = journal?.navigations.find((n) => n.page === page && n.quand >= debut);
        if (bloquee) throw new Echec(`navigation vers ${bloquee.url}, origine non déclarée par le scénario, interrompue (D7.INV-1)`);
      } catch (err) {
        r.statut = 'echec';
        r.message = err instanceof Echec ? err.message : messageErreur(err, delaiMs);
        resultat.statut = 'echec';
        if (e.action === 'verifier') echecVerifier = true;
        else arret = `l'étape ${i + 1} a échoué`;
        // La durée de l'étape s'arrête à l'échec : les preuves de l'échec n'y entrent pas.
        fin = Date.now();
        await preuvesEchec(page, resultats, prefixe, r);
      }
      reseau.main = false;
      r.duree_ms = (fin ?? Date.now()) - debut;
      // Le seau reste celui de cette étape jusqu'au début de la suivante : un message tardif lui revient.
      surEvenement({ type: 'fin-etape', jeu: jeu.numero, etape: r });
    }
    joues.push(resultat);
  }
  return joues;
}

async function preuvesEchec(page, resultats, prefixe, r) {
  if (page.isClosed()) return;
  try {
    if (!r.capture) {
      const rel = `captures/${prefixe}-${r.action}-echec.png`;
      mkdirSync(join(resultats, 'captures'), { recursive: true });
      await page.screenshot({ path: join(resultats, rel), timeout: 10_000 });
      r.capture = rel;
    }
  } catch { /* page fermée ou figée : pas de capture */ }
  try {
    const arbre = await page.locator('body').ariaSnapshot({ timeout: 10_000 });
    const rel = `aria/${prefixe}-${r.action}.yml`;
    mkdirSync(join(resultats, 'aria'), { recursive: true });
    writeFileSync(join(resultats, rel), `${arbre}\n`);
    r.aria = rel;
  } catch { /* pas d'instantané */ }
}

async function capture(cible, page, resultats, rel, options = {}) {
  mkdirSync(join(resultats, 'captures'), { recursive: true });
  const chemin = join(resultats, rel);
  if (cible) await cible.screenshot({ path: chemin, ...options });
  else await page.screenshot({ path: chemin, ...options });
  return rel;
}

async function jouerEtape(page, e, { delaiMs, scenario, resultats, prefixe, r, surEvenement, reseau, telechargements }) {
  const options = { timeout: delaiMs };
  const loc = e.cible ? localisateur(page, e.cible) : null;
  switch (e.action) {
    case 'naviguer': {
      const adresse = new URL(e.url, scenario.url_base).href;
      const reponse = await page.goto(adresse, { timeout: delaiMs, waitUntil: 'load' });
      if (reponse && reponse.status() >= 400) throw new Echec(`la page ${adresse} répond ${reponse.status()}`);
      return;
    }
    case 'cliquer': return void await loc.click(options);
    case 'saisir': return void await loc.fill(e.valeur, options);
    case 'choisir': return void await loc.selectOption({ label: e.valeur }, options);
    case 'cocher': return void await loc.setChecked(e.valeur, options);
    case 'survoler': return void await loc.hover(options);
    case 'touche': return void await (loc ? loc.press(e.touche, options) : page.keyboard.press(e.touche));
    case 'televerser': return void await loc.setInputFiles(e.fichiers, options);
    case 'telecharger': {
      const [telechargement] = await Promise.all([page.waitForEvent('download', { timeout: delaiMs }), loc.click(options)]);
      const propose = nomSur(telechargement.suggestedFilename());
      const nom = e.nom ? `${e.nom}${extname(propose)}` : propose;
      mkdirSync(join(resultats, 'telechargements'), { recursive: true });
      const chemin = join(resultats, 'telechargements', nom);
      await telechargement.saveAs(chemin);
      const contenu = readFileSync(chemin);
      r.telechargement = { fichier: `telechargements/${nom}`, propose, octets: contenu.length, sha256: sha256(contenu) };
      if (e.nom) telechargements.set(e.nom, { chemin, rel: `telechargements/${nom}` });
      return;
    }
    case 'attendre': return attendre(page, e, delaiMs, scenario.url_base);
    case 'verifier':
      if (e.critere === 'requete') return verifierRequete(e, { delaiMs, scenario, reseau, r });
      if (e.critere === 'api') return verifierApi(page, e, { delaiMs, scenario, r });
      if (e.critere === 'fichier') return verifierFichier(e, { telechargements, r });
      try {
        await verifier(page, e, delaiMs, scenario.url_base);
      } finally {
        try {
          const zone = loc && (await loc.count()) === 1 && (await loc.isVisible()) ? loc : null;
          r.capture = await capture(zone, page, resultats, `captures/${prefixe}-verifier.png`, { timeout: 5000 });
        } catch { /* capture impossible : l'échec reste rapporté */ }
      }
      return;
    case 'capturer':
      r.capture = await capture(loc, page, resultats, `captures/${prefixe}-${e.nom}.png`, loc ? options : { fullPage: e.pleine_page === true, timeout: delaiMs });
      return;
    case 'main': {
      surEvenement({ type: 'main', message: e.message, jusqua: e.jusqua, delai: delaiMs / 1000 });
      await page.bringToFront().catch(() => {});
      if (e.jusqua.url) {
        const s = await sonder(() => page.url(), (u) => adresseCorrespond(u, e.jusqua.url, scenario.url_base), delaiMs);
        if (!s.ok) throw new Echec(`étape à la main non terminée en ${delaiMs / 1000} s : l'adresse ${e.jusqua.url} n'est pas atteinte`);
      } else {
        const l = localisateur(page, e.jusqua.cible);
        const etat = e.jusqua.etat ?? 'visible';
        const s = await sonder(() => l.isVisible(), (v) => v === (etat === 'visible'), delaiMs);
        if (!s.ok) throw new Echec(`étape à la main non terminée en ${delaiMs / 1000} s : ${decrireCible(e.jusqua.cible)} n'est pas ${etat === 'visible' ? 'visible' : 'masqué'}`);
      }
      return;
    }
    default:
      throw new Echec(`action inconnue : ${e.action}`);
  }
}
```
