#!/usr/bin/env node
// Export des refus du binôme Agent2Dev et Agent2Test vers le socle d'observation (observatoire, D7, depuis 1.2.0 ;
// socle-observation 1.2.0, section 6.5). Il se lance depuis le clone du dépôt Agent2Prompt ; l'IA de l'observatoire
// ne l'exécute pas d'elle-même : elle en donne la commande au développeur.
//
// Le binôme n'a pas d'outil dans le dépôt, qui tient sa spécification et ses formats, pas son code : cet outil agit
// pour lui, à la source, dans le projet de l'application. Il lit, sans les modifier, les livrables d'Agent2Dev
// (agent2dev.livrable/1) et les journaux de tests d'Agent2Test (agent2test.journal-de-tests/1) qu'on lui désigne :
// chaque refus de leur rubrique acceptable, et chaque réponse à un refus, dérogation ou faux refus, devient une
// enveloppe socle-observation.enveloppe/1, datée par la rubrique, au nom et à la version du système qui l'a
// produite, ajoutée au journal de ce système dans le projet, docs/c7e/observations-agent2dev.jsonl ou
// docs/c7e/observations-agent2test.jsonl : en ajout seul, chaque ligne chaînée à l'empreinte de la précédente, la
// tête portant le numéro et l'empreinte de la dernière (SO2). Aucun texte ne sort, ni l'objet refusé, ni le motif
// d'une réponse, ni le nom de qui l'a donnée, et toute référence du projet sort par son empreinte salée (SO3) : le
// sel de l'instance, partagé avec les autres systèmes qui exportent dans le projet, est gardé dans son répertoire
// Git commun, <git-common-dir>/agent2prompt/sel ; il n'est jamais versionné, affiché ni exporté. Un enregistrement
// déjà exporté ne l'est pas deux fois ; une rubrique réécrite depuis son export, comme une enveloppe mal formée,
// arrête l'export, sans rien écrire. L'outil n'écrit rien dans le magasin de l'observatoire, et ne versionne rien.
//
// Usage, depuis le clone :
//   node specs/observatoire/outils/export-binome.mjs exporter --projet <dossier> <fichier>...
//   node specs/observatoire/outils/export-binome.mjs verifier --projet <dossier>
//   node specs/observatoire/outils/export-binome.mjs etat --projet <dossier> [--json]
// <dossier> : la racine du projet de l'application, dépôt Git ; sans --projet, le dossier courant. <fichier> : le
// livrable.json d'une demande d'Agent2Dev, ou le journal-de-tests.json d'une campagne d'Agent2Test. Codes de
// sortie : 0 ; 1 pour un refus ou un journal altéré ; 2 pour un usage incorrect. Node 20 ou plus récent, modules
// natifs uniquement.

import { randomBytes } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCHEMA, canonique, controlerEnveloppe, repertoireGitCommun, sha256, verifierJournal } from './observatoire.mjs';

export const SEL = 'agent2prompt/sel'; // sous le répertoire Git commun du projet, partagé par les systèmes de l'instance
// Les deux formats que traduit l'export, chacun avec son système, son journal d'enveloppes, la clé qui désigne une
// source dans l'instance, ses gardes et les rôles qui répondent à un refus, avec leur sujet dans le socle.
export const FORMATS = {
  'agent2dev.livrable/1': {
    systeme: 'agent2dev', journal: 'docs/c7e/observations-agent2dev.jsonl', nomCle: 'demande.cle', cleDe: (x) => x.demande?.cle,
    gardes: ['perimetre', 'ecriture', 'commandes', 'lecons'], roles: { developpeur: 'developpeur', referent: 'referent' },
  },
  'agent2test.journal-de-tests/1': {
    systeme: 'agent2test', journal: 'docs/c7e/observations-agent2test.jsonl', nomCle: 'campagne', cleDe: (x) => x.campagne,
    gardes: ['perimetre', 'ecriture', 'lecons'], roles: { testeur: 'testeur', 'referent-qualite': 'referent' },
  },
};
export const JOURNAUX = Object.values(FORMATS).map((f) => f.journal);
// Une réponse à un refus : son type, sa nature et la valeur de sa décision sur le refus (socle, section 6.5).
const REPONSES = {
  deroger: { type: 'derogation', nature: 'derogation', valeur: 'amendee' },
  'faux-refus': { type: 'decision', nature: 'faux-refus', valeur: 'refusee' },
};
// Préfixe d'une règle citée sans le sien : `D` est une règle du système qui refuse.
const PREFIXES = { SA: 'socle-acceptable', SC: 'socle-back-front', SO: 'socle-observation' };
const REGLE = /^(?:([a-z][a-z0-9-]*):)?((D|SC|SO|SA)\d+\.INV-\d+)$/;
const DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const VERSION = /^\d+\.\d+\.\d+$/;
const EMPREINTE = /^[0-9a-f]{64}$/;

const estObjet = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const entier = (v) => Number.isInteger(v) && v >= 1;
const lire = (chemin) => readFileSync(chemin, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
const lignesDe = (chemin) => (existsSync(chemin) ? lire(chemin).split('\n').filter((l) => l !== '') : []);
const lireJson = (chemin) => {
  if (!existsSync(chemin)) return null;
  try {
    return JSON.parse(lire(chemin));
  } catch {
    return { illisible: true };
  }
};
const parCodePoint = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;
const teteDe = (journal) => journal.replace(/\.jsonl$/, '.tete');
const cleSource = (s) => `${s.format}|${s.journal ?? ''}|${s.numero}`;
export const ligneDe = (x) => JSON.stringify(canonique(x));
export const empreinteSalee = (sel, reference) => sha256(`${sel}:${reference}`);

/** Règle citée, préfixée par la spécification qui la définit ; une règle déjà préfixée garde son préfixe. */
export function prefixer(regle, systeme) {
  const m = REGLE.exec(regle);
  if (!m) return null;
  return m[1] ? regle : `${m[3] === 'D' ? systeme : PREFIXES[m[3]]}:${m[2]}`;
}

// ---- Sources : la rubrique acceptable d'un livrable ou d'un journal de tests ----

/**
 * Lit un fichier désigné et sa rubrique acceptable. Renvoie { erreurs, source } : la source porte son format, sa
 * clé, sa demande, la version du système, et ses enregistrements, refus et réponses, dans l'ordre de leur numéro.
 * Le fichier n'est que lu. Une rubrique absente ne donne aucun enregistrement : aucun refus n'a touché la source.
 */
export function lireSource(chemin) {
  let x;
  try {
    x = JSON.parse(lire(chemin));
  } catch {
    return { erreurs: [`${chemin} : JSON illisible`] };
  }
  if (!estObjet(x)) return { erreurs: [`${chemin} : objet JSON attendu`] };
  const f = FORMATS[x.format];
  if (!f) return { erreurs: [`${chemin} : format « ${x.format} », attendu ${Object.keys(FORMATS).join(' ou ')}`] };
  const erreurs = [];
  const cle = f.cleDe(x);
  const demande = x.demande?.cle;
  const version = x.versions?.specification;
  if (typeof cle !== 'string' || cle === '') erreurs.push(`${chemin} : ${f.nomCle} absent`);
  if (typeof demande !== 'string' || demande === '') erreurs.push(`${chemin} : demande.cle absent`);
  if (typeof version !== 'string' || !VERSION.test(version)) erreurs.push(`${chemin} : versions.specification, la version x.y.z du système, absente`);
  const enregistrements = [];
  const a = x.acceptable;
  if (a !== undefined) {
    if (!estObjet(a) || a.socle !== 'socle-acceptable' || typeof a.version !== 'string' || !VERSION.test(a.version) || !Array.isArray(a.refus)) {
      erreurs.push(`${chemin} : rubrique acceptable mal formée : le socle socle-acceptable, sa version et la liste des refus`);
    } else {
      const numeros = new Set();
      const numero = (n, ici) => {
        if (!entier(n)) erreurs.push(`${ici} : n, le numéro de sa ligne de journal`);
        else if (numeros.has(n)) erreurs.push(`${ici} : numéro ${n} déjà pris dans la rubrique`);
        else numeros.add(n);
      };
      a.refus.forEach((r, i) => {
        const ici = `${chemin}, refus ${i + 1}`;
        if (!estObjet(r)) {
          erreurs.push(`${ici} : objet attendu`);
          return;
        }
        const avant = erreurs.length;
        numero(r.n, ici);
        if (typeof r.date !== 'string' || !DATE.test(r.date)) erreurs.push(`${ici} : date, AAAA-MM-JJTHH:MM:SSZ, en UTC`);
        if (!f.gardes.includes(r.garde)) erreurs.push(`${ici} : garde « ${r.garde} », hors de la liste : ${f.gardes.join(', ')}`);
        if (!Array.isArray(r.regles) || r.regles.length === 0 || !r.regles.every((g) => typeof g === 'string' && REGLE.test(g))) erreurs.push(`${ici} : regles, la liste des règles citées, identifiants d'invariants`);
        const q = r.reponse;
        if (q !== null && q !== undefined && (!estObjet(q) || !(q.decision in REPONSES) || !(q.role in f.roles) || !entier(q.n) || typeof q.date !== 'string' || !DATE.test(q.date))) {
          erreurs.push(`${ici} : réponse mal formée : décision ${Object.keys(REPONSES).join(' ou ')}, rôle ${Object.keys(f.roles).join(' ou ')}, numéro et date`);
        }
        if (erreurs.length > avant) return;
        enregistrements.push({ sorte: 'refus', n: r.n, date: r.date, garde: r.garde, regle: r.regles[0] });
        if (estObjet(q)) {
          numero(q.n, `${ici}, réponse`);
          if (q.n <= r.n || q.date < r.date) erreurs.push(`${ici}, réponse : postérieure au refus, par son numéro et par sa date`);
          enregistrements.push({ sorte: 'reponse', n: q.n, date: q.date, garde: r.garde, regle: r.regles[0], refus: r.n, decision: q.decision, role: q.role });
        }
      });
    }
  }
  if (erreurs.length > 0) return { erreurs };
  enregistrements.sort((p, q) => p.n - q.n);
  return { erreurs: [], source: { chemin, format: x.format, cle, demande, version, enregistrements } };
}

/** Enveloppe partielle d'un enregistrement, selon la correspondance du socle (section 6.5), sans numéro ni chaînage. */
export function traduire(e, source, sel) {
  const f = FORMATS[source.format];
  const commun = {
    date: e.date,
    source: { format: source.format, journal: empreinteSalee(sel, source.cle), numero: e.n },
    cible: 'specification',
    invariant: prefixer(e.regle, f.systeme),
    ancre: { nature: 'ticket', ref: empreinteSalee(sel, source.demande) },
  };
  if (e.sorte === 'refus') return { ...commun, ordre: 'OC1', niveau: 'N1', type: 'refus', motif: `refus-${e.garde}`, sujet: `agent:${f.systeme}`, nature: e.garde };
  const r = REPONSES[e.decision];
  return { ...commun, ordre: 'OC1', niveau: 'humain', type: r.type, motif: `refus-${e.garde}`, sujet: f.roles[e.role], nature: r.nature, decision: { valeur: r.valeur, vise: null } };
}

const empreinteDeTraduction = (x) => JSON.stringify([x.type, x.nature, x.motif, x.niveau, x.sujet, x.invariant ?? null, x.ancre?.ref ?? null, x.decision?.valeur ?? null]);

// ---- Journaux et sel ----

/** Journal d'enveloppes d'un système du binôme, lu et vérifié (SO1, SO2) : il ne porte que des enveloppes de ce système. */
export function lireJournal(projet, journal) {
  const lignes = lignesDe(join(projet, journal));
  const { erreurs, enveloppes } = verifierJournal(lignes, lireJson(join(projet, teteDe(journal))));
  const systeme = Object.values(FORMATS).find((f) => f.journal === journal).systeme;
  if (erreurs.length === 0 && enveloppes.some((x) => x.systeme.nom !== systeme)) erreurs.push(`une enveloppe d'un autre système que ${systeme}`);
  return { lignes, enveloppes, erreurs };
}

/** Journaux d'enveloppes du projet, de tous ses systèmes : `docs/c7e/observations*.jsonl`. */
function journauxDuProjet(projet) {
  const dossier = join(projet, 'docs', 'c7e');
  return existsSync(dossier) ? readdirSync(dossier).filter((n) => /^observations.*\.jsonl$/.test(n)).sort(parCodePoint).map((n) => `docs/c7e/${n}`) : [];
}

/** Sel de l'instance, s'il a été tiré, et son emplacement ; le sel n'est jamais affiché ni exporté. */
export function lireSel(projet = '.') {
  const commun = repertoireGitCommun(projet);
  if (!commun) return { erreur: `${projet} n'est pas dans un dépôt Git : le sel de l'instance se garde dans le répertoire Git commun du projet de l'application` };
  const chemin = join(commun, SEL);
  if (!existsSync(chemin)) return { chemin, sel: null };
  const sel = readFileSync(chemin, 'utf8').trim();
  return EMPREINTE.test(sel) ? { chemin, sel } : { erreur: `sel de l'instance illisible dans <git-common-dir>/${SEL} : 64 caractères hexadécimaux attendus` };
}

// ---- Export ----

const refus = (erreurs) => ({ erreurs, journaux: [], selTire: false });

/**
 * Exporte les enregistrements nouveaux des fichiers désignés ; renvoie { erreurs, journaux, selTire }, chaque journal
 * avec son système, ses enveloppes ajoutées et son total. Tout ou rien : un journal altéré, une source illisible ou
 * réécrite depuis son export, deux sources de même clé, un sel absent alors qu'un journal d'enveloppes du projet
 * existe, un sel étranger à l'un d'eux, une enveloppe mal formée arrêtent l'export, et rien n'est écrit. L'option
 * `sel` ne sert qu'aux tests.
 */
export function exporter({ projet = '.', fichiers = [], sel } = {}) {
  if (fichiers.length === 0) return refus(['aucun fichier désigné : le livrable d\'une demande d\'Agent2Dev, ou le journal de tests d\'une campagne d\'Agent2Test']);
  const journaux = new Map();
  for (const f of Object.values(FORMATS)) {
    const j = lireJournal(projet, f.journal);
    if (j.erreurs.length > 0) return refus(j.erreurs.map((e) => `${f.journal} altéré, ${e} : rien n'est exporté`));
    journaux.set(f.systeme, j);
  }

  let chemin = null;
  let selTire = false;
  const autres = journauxDuProjet(projet).filter((j) => lignesDe(join(projet, j)).length > 0);
  if (sel === undefined) {
    const lu = lireSel(projet);
    if (lu.erreur) return refus([lu.erreur]);
    ({ chemin, sel } = lu);
    if (sel === null) {
      if (autres.length > 0) return refus([`sel de l'instance absent de <git-common-dir>/${SEL} alors que ${autres.join(', ')} existe : un nouveau sel changerait l'identité de l'instance au milieu de ses journaux ; recopie dans ce clone, à cet emplacement, le sel du clone qui les a commencés`]);
      sel = randomBytes(32).toString('hex');
      selTire = true;
    }
  } else if (repertoireGitCommun(projet) === null) return refus([`${projet} n'est pas dans un dépôt Git : le sel de l'instance se garde dans le répertoire Git commun du projet de l'application`]);
  const instance = sha256(sel);
  for (const j of autres) {
    let premiere = null;
    try {
      premiere = JSON.parse(lignesDe(join(projet, j))[0]);
    } catch {
      premiere = null;
    }
    if (estObjet(premiere) && premiere.instance !== instance) return refus([`le sel de ce clone n'est pas celui de l'instance du journal ${j} : rien n'est exporté`]);
  }

  const sources = [];
  const erreurs = [];
  for (const fichier of fichiers) {
    const r = lireSource(fichier);
    if (r.erreurs.length > 0) erreurs.push(...r.erreurs);
    else sources.push(r.source);
  }
  for (const [i, s] of sources.entries()) {
    const meme = sources.findIndex((t) => t.format === s.format && t.cle === s.cle);
    if (meme !== i) erreurs.push(`${s.chemin} : même ${FORMATS[s.format].nomCle} que ${sources[meme].chemin} : une source par demande ou par campagne`);
  }
  if (erreurs.length > 0) return refus(erreurs.map((e) => `source refusée, ${e} : rien n'est exporté`));

  const ecritures = [];
  for (const [format, f] of Object.entries(FORMATS)) {
    const { lignes, enveloppes } = journaux.get(f.systeme);
    // Les sources d'un système, dans l'ordre de leur clé ; leurs enregistrements, dans l'ordre de leur numéro.
    const siennes = sources.filter((s) => s.format === format).sort((a, b) => parCodePoint(a.cle, b.cle));
    if (siennes.length === 0) continue;
    const deja = new Map(enveloppes.map((x) => [cleSource(x.source), x]));
    const numeros = new Map(enveloppes.map((x) => [cleSource(x.source), x.numero]));
    const files = siennes.map((s) => {
      const journal = empreinteSalee(sel, s.cle);
      return s.enregistrements.map((e) => ({
        s, e,
        cle: cleSource({ format, journal, numero: e.n }),
        cleDuRefus: e.sorte === 'reponse' ? cleSource({ format, journal, numero: e.refus }) : null,
        partielle: traduire(e, s, sel),
      }));
    });

    // Un enregistrement déjà exporté doit se traduire comme à son export, et rester dans sa rubrique.
    const reecrits = [];
    const presentes = new Set(files.flat().map((r) => r.cle));
    for (const r of files.flat()) {
      const x = deja.get(r.cle);
      if (x && empreinteDeTraduction(r.partielle) !== empreinteDeTraduction(x)) reecrits.push(`${r.s.chemin} : l'enregistrement ${r.e.n} a changé depuis son export`);
    }
    const designes = new Map(siennes.map((s) => [empreinteSalee(sel, s.cle), s]));
    for (const [cle, x] of deja) {
      const s = designes.get(x.source.journal);
      if (s && !presentes.has(cle)) reecrits.push(`${s.chemin} : l'enregistrement ${x.source.numero}, exporté, n'est plus dans sa rubrique`);
    }
    if (reecrits.length > 0) return refus(reecrits.map((e) => `rubrique réécrite, ${e} : rien n'est exporté ; une source ne change pas ce qu'elle a déjà rendu`));

    // Fusion des sources par date, sans changer l'ordre d'une même source ; à date égale, la première clé d'abord.
    const nouvelles = files.map((file) => file.filter((r) => !deja.has(r.cle)));
    const positions = nouvelles.map(() => 0);
    const ordre = [];
    for (;;) {
      let k = -1;
      nouvelles.forEach((file, i) => {
        const r = file[positions[i]];
        if (r && (k === -1 || r.e.date < nouvelles[k][positions[k]].e.date)) k = i;
      });
      if (k === -1) break;
      ordre.push(nouvelles[k][positions[k]++]);
    }

    const ajout = [];
    let precedent = lignes.length > 0 ? sha256(lignes.at(-1)) : null;
    let derniere = enveloppes.at(-1)?.date ?? null;
    for (const r of ordre) {
      const numero = lignes.length + ajout.length + 1;
      const partielle = { ...r.partielle };
      if (partielle.decision) {
        const vise = numeros.get(r.cleDuRefus);
        if (!vise) {
          erreurs.push(`${r.s.chemin}, enregistrement ${r.e.n} : son refus, ${r.e.refus}, n'a pas d'enveloppe`);
          continue;
        }
        partielle.decision = { valeur: partielle.decision.valeur, vise };
      }
      const date = derniere !== null && partielle.date < derniere ? derniere : partielle.date;
      const enveloppe = { schema: SCHEMA, numero, systeme: { nom: f.systeme, version: r.s.version }, instance, ...partielle, date, precedent };
      const ecarts = controlerEnveloppe(enveloppe);
      if (ecarts.length > 0) {
        erreurs.push(...ecarts.map((e) => `${r.s.chemin}, enregistrement ${r.e.n} : ${e}`));
        continue;
      }
      const ligne = ligneDe(enveloppe);
      ajout.push(ligne);
      numeros.set(r.cle, numero);
      precedent = sha256(ligne);
      derniere = date;
    }
    ecritures.push({ f, ajout, total: lignes.length + ajout.length, precedent });
  }
  if (erreurs.length > 0) return refus(erreurs.map((e) => `enveloppe refusée, ${e} : rien n'est écrit`));

  if (selTire && ecritures.some((w) => w.ajout.length > 0)) {
    try {
      mkdirSync(dirname(chemin), { recursive: true });
      writeFileSync(chemin, `${sel}\n`, { mode: 0o600, flag: 'wx' });
    } catch {
      return refus([`sel de l'instance impossible à écrire dans <git-common-dir>/${SEL} : rien n'est écrit`]);
    }
  }
  for (const w of ecritures.filter((x) => x.ajout.length > 0)) {
    mkdirSync(dirname(join(projet, w.f.journal)), { recursive: true });
    appendFileSync(join(projet, w.f.journal), `${w.ajout.join('\n')}\n`);
    writeFileSync(join(projet, teteDe(w.f.journal)), `${JSON.stringify({ schema: SCHEMA, numero: w.total, empreinte: w.precedent })}\n`);
  }
  return {
    erreurs: [],
    journaux: ecritures.map((w) => ({ journal: w.f.journal, systeme: w.f.systeme, ajoutees: w.ajout.length, total: w.total })),
    selTire: selTire && ecritures.some((w) => w.ajout.length > 0),
  };
}

// ---- Vérification et état ----

/** Écarts des deux journaux du binôme dans le projet ; avec le sel, l'instance doit être la sienne. */
export function verifier(projet = '.') {
  const lu = lireSel(projet);
  const erreurs = [];
  for (const journal of JOURNAUX) {
    const { enveloppes, erreurs: ecarts } = lireJournal(projet, journal);
    erreurs.push(...ecarts.map((e) => `${journal}, ${e}`));
    if (ecarts.length === 0 && lu.sel && enveloppes[0] && enveloppes[0].instance !== sha256(lu.sel)) erreurs.push(`${journal} : le sel de ce clone n'est pas celui de l'instance du journal`);
  }
  return erreurs;
}

/** Enveloppes de chaque journal du binôme, par type et par sujet, et leur vérification. */
export function etat(projet = '.') {
  const compter = (xs, cle) => {
    const res = {};
    for (const x of xs) res[cle(x)] = (res[cle(x)] ?? 0) + 1;
    return res;
  };
  return {
    journaux: Object.values(FORMATS).map((f) => {
      const { enveloppes } = lireJournal(projet, f.journal);
      const xs = enveloppes.filter(estObjet);
      return { journal: f.journal, systeme: f.systeme, enveloppes: xs.length, derniere: xs.at(-1)?.date ?? null, parType: compter(xs, (x) => x.type), parSujet: compter(xs, (x) => x.sujet) };
    }),
    verification: verifier(projet),
  };
}

// ---- Ligne de commande ----

const USAGE = [
  'Usage :',
  '  node export-binome.mjs exporter [--projet <dossier>] <fichier>...',
  '  node export-binome.mjs verifier [--projet <dossier>]',
  '  node export-binome.mjs etat [--projet <dossier>] [--json]',
].join('\n');

const enLigne = (compte) => Object.entries(compte).sort(([a], [b]) => parCodePoint(a, b)).map(([k, n]) => `${k} ${n}`).join(' · ') || 'aucune';

/** Ligne de commande. Renvoie le code de sortie ; écrit par `sortie` et `erreur`. */
export function principal(argv, sortie = console.log, erreur = console.error) {
  const [commande, ...reste] = argv;
  const options = { fichiers: [] };
  for (let k = 0; k < reste.length; k++) {
    if (reste[k] === '--json' && commande === 'etat') options.json = true;
    else if (reste[k] === '--projet' && reste[k + 1] !== undefined) options.projet = reste[++k];
    else if (commande === 'exporter' && !reste[k].startsWith('--')) options.fichiers.push(reste[k]);
    else {
      erreur(USAGE);
      return 2;
    }
  }
  const projet = options.projet ?? '.';
  if (commande === 'exporter') {
    if (options.fichiers.length === 0) {
      erreur(USAGE);
      return 2;
    }
    const r = exporter({ projet, fichiers: options.fichiers });
    if (r.erreurs.length > 0) {
      for (const e of r.erreurs) erreur(`REFUS  ${e}`);
      return 1;
    }
    if (r.selTire) sortie(`sel de l'instance tiré et gardé dans <git-common-dir>/${SEL}, hors de l'arbre de travail : ni versionné ni exporté ; un autre clone du projet en aura besoin pour continuer ses journaux`);
    for (const j of r.journaux) {
      sortie(j.ajoutees === 0
        ? `aucun enregistrement nouveau : ${j.journal} inchangé, ${pluriel(j.total, 'enveloppe')}`
        : `${pluriel(j.ajoutees, 'enveloppe')} ajoutée${j.ajoutees > 1 ? 's' : ''} à ${j.journal}, ${j.total} en tout ; à versionner avec ${teteDe(j.journal)}`);
    }
    return 0;
  }
  if (commande === 'verifier') {
    const erreurs = verifier(projet);
    if (erreurs.length > 0) {
      for (const e of erreurs) erreur(`ALTÉRÉ  ${e}`);
      return 1;
    }
    sortie(`journaux du binôme intacts : ${JOURNAUX.join(', ')}, au schéma ${SCHEMA}, chaîne et tête intactes`);
    return 0;
  }
  if (commande === 'etat') {
    const e = etat(projet);
    if (options.json) sortie(JSON.stringify(e, null, 2));
    else {
      for (const j of e.journaux) {
        sortie(`${j.journal} : ${pluriel(j.enveloppes, 'enveloppe')}${j.derniere ? `, la dernière datée ${j.derniere}` : ''}`);
        sortie(`  par type : ${enLigne(j.parType)}`);
        sortie(`  par sujet : ${enLigne(j.parSujet)}`);
      }
      for (const v of e.verification) erreur(`ALTÉRÉ  ${v}`);
    }
    return e.verification.length > 0 ? 1 : 0;
  }
  erreur(USAGE);
  return 2;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exitCode = principal(process.argv.slice(2));
