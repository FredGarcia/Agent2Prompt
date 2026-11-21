---
name: actions
description: Actions et étapes du moteur (jeu fermé de treize actions et leurs champs, naviguer, cliquer, saisir, choisir, cocher, survoler, touche, televerser, telecharger, attendre, verifier, capturer, main ; aucune exécution de code dans la page ; attentes par état dans un délai borné ; critères de vérification contient, visible, valeur, nombre, url, actif, attendu et obtenu ; adresses comparées par chemin, requête et étoile finale ; déroulé d'un jeu, aucune étape rejouée, vérifications qui se poursuivent ; mutations ; fichiers téléversés et téléchargés ; point d'extension E3, jouerScenario), source de scripts/moteur.mjs. À lire pour traduire une phrase en étape, ou comprendre un résultat.
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
| `verifier` | `critere` : `contient`, `visible`, `valeur`, `nombre`, `url`, `actif` | `cible`, `attendu`, `exact` | constate un attendu (§ 3) |
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

Une vérification interroge l'état jusqu'à son délai. Son échec donne l'attendu et l'obtenu : `attendu : un texte qui contient « Fournisseurs » ; obtenu : texte « Clients »`, `attendu : 99 éléments ; obtenu : 3 éléments`. Chaque vérification a sa capture, de la zone de la cible si elle est visible, sinon de la page (D8.INV-2).

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
- `telecharger` attend le téléchargement que déclenche le clic, et l'enregistre dans `telechargements/` du dossier de résultats, sous le nom proposé par l'application, ou sous `nom` suivi de son extension. Le rapport donne le fichier, le nom proposé, la taille et l'empreinte SHA-256.

## 7. Point d'extension E3

`jouerScenario(contexte, options)` joue des jeux préparés dans un contexte de navigateur ouvert, et rend la liste des jeux joués, chacun avec ses étapes au format du rapport (module `preuves`, § 2). Options : `scenario` (validé), `jeux` (préparés par `preparerJeux` du module `scenario`), `resultats` (dossier), `journal` (rendu par `garderOrigines` du module `session`), `delai` (s), `autoriserMutations`, `surEvenement` (avancement : début d'un jeu, début et fin d'une étape, étape à la main). `jouer.mjs` en est le premier appelant ; la recette en est un second (R8).

## 8. Contrôle de sortie

- Chaque action du jeu fermé est jouée sur l'application de démonstration, et l'application reçoit ce que l'utilisateur aurait fait (module `recette`, R5).
- Une attente s'arrête dès l'état obtenu, et échoue à son délai (D5.INV-2).
- Les vérifications échouées se poursuivent, les autres échecs arrêtent le jeu, rien n'est rejoué (D5.INV-3).
- Chaque critère donne l'attendu et l'obtenu (D5.INV-4).
- Aucune source n'exécute de code dans la page (D5.INV-1).

## 9. Source `scripts/moteur.mjs`

<!-- fichier : scripts/moteur.mjs -->
```javascript
// scenario-playwright 1.2.0 : moteur des étapes, jeu d'actions fermé.
//
// Chaque étape agit comme une personne devant l'écran, sur une cible résolue côté utilisateur (D4).
// Aucune étape n'exécute de code dans la page (D5.INV-1) ; les attentes portent sur un état, dans un
// délai borné (D5.INV-2) ; aucune étape n'est rejouée (D5.INV-3) ; une étape de mutation hors du poste
// n'agit qu'avec l'autorisation explicite du développeur (D7.INV-2).
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { setTimeout as pause } from 'node:timers/promises';
import { URL } from 'node:url';
import { decrireCible, estFragile, localisateur } from './cibles.mjs';
import { DELAI_MAIN_DEFAUT, resumeEtape } from './scenario.mjs';
import { estLocale } from './session.mjs';

export const INTERVALLES = [100, 250, 500, 1000];

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
export async function sonder(lire, test, delaiMs) {
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
    await pause(Math.min(INTERVALLES[Math.min(i++, INTERVALLES.length - 1)], reste));
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
        capture: null, aria: null, telechargement: null, console: [], erreurs_page: [], reponses: [],
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
      try {
        if (e.mutation) {
          const origine = new URL(page.url()).origin;
          if (!/^https?:/.test(page.url()) || (!estLocale(origine) && !autoriserMutations)) {
            throw new Echec(`étape de mutation sur ${/^https?:/.test(page.url()) ? origine : page.url()}, hors du poste, sans --autoriser-mutations : aucune action faite (D7.INV-2)`);
          }
        }
        await jouerEtape(page, e, { delaiMs, scenario, resultats, prefixe, r, surEvenement });
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

async function jouerEtape(page, e, { delaiMs, scenario, resultats, prefixe, r, surEvenement }) {
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
      return;
    }
    case 'attendre': return attendre(page, e, delaiMs, scenario.url_base);
    case 'verifier':
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
