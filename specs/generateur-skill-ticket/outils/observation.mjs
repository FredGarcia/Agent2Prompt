#!/usr/bin/env node
// Export des observations du générateur de skills de ticket vers le socle d'observation
// (generateur-skill-ticket, D9, depuis 1.3.0 ; socle-observation 1.4.0). Il se lance depuis le clone du
// dépôt Agent2Prompt : aucun skill de ticket ne le porte.
//
// L'export lit, sans les modifier, le champ d'observation de chaque ticket du projet,
// docs/demandes/<CLÉ>/champ.jsonl, et son registre d'apprentissage, docs/c7e/registre-apprentissage.jsonl.
// Il traduit chaque enregistrement, sauf les actions, en une enveloppe socle-observation.enveloppe/1, selon
// les correspondances du socle (SO4), et l'ajoute au journal d'enveloppes du projet,
// docs/c7e/observations.jsonl : en ajout seul, chaque ligne chaînée à l'empreinte de la précédente, la tête
// docs/c7e/observations.tete portant le numéro et l'empreinte de la dernière (SO2). Aucun texte libre ne
// sort, et toute référence du projet sort par son empreinte salée (SO3) : le sel de l'instance, tiré à la
// première exportation du projet, de quelque système qu'elle soit, se garde dans le répertoire Git commun du
// projet, <git-common-dir>/agent2prompt/sel, que partagent ses worktrees et les systèmes qui y exportent ; il
// n'est jamais versionné, affiché ni exporté. Un enregistrement déjà
// exporté ne l'est pas deux fois ; une source altérée ou une enveloppe mal formée arrêtent l'export, sans
// rien écrire. Le développeur versionne le journal et sa tête avec le projet ; l'outil ne commite rien.
//
// Usage :
//   node <dépôt>/specs/generateur-skill-ticket/outils/observation.mjs exporter [--projet <dossier>]
//   node <dépôt>/specs/generateur-skill-ticket/outils/observation.mjs verifier [--projet <dossier>]
//   node <dépôt>/specs/generateur-skill-ticket/outils/observation.mjs etat [--projet <dossier>] [--json]
// <dossier> : la racine du projet, par défaut le dossier courant. Codes de sortie : 0 ; 1 pour un refus ou
// un journal altéré ; 2 pour un usage incorrect. Node 20 ou plus récent, modules natifs uniquement.

import { randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEMANDES, FORMAT_REGISTRE, NATURES as NATURES_RELEVE, REGISTRE, lireRegistre, profondeurDAncre, verifierRegistre } from './apprentissage.mjs';
import { FICHIER as FICHIER_CHAMP, FORMAT as FORMAT_CHAMP, TETE as TETE_CHAMP, canonique as canoniqueChamp, lireChamp, sha256 } from './champ.mjs';

export const SCHEMA = 'socle-observation.enveloppe/1';
export const JOURNAL = 'docs/c7e/observations.jsonl';
export const TETE = 'docs/c7e/observations.tete';
export const SEL = 'agent2prompt/sel'; // sous le répertoire Git commun du projet
export const SYSTEME = 'generateur-skill-ticket';
const SUJET_AGENT = `agent:${SYSTEME}`;
const INVARIANT_DESACCORD = 'désaccord entre nœuds (D6.INV-3)'; // celui que champ.mjs inscrit pour un désaccord
const INVARIANT_DESACCORD_DEPOT = 'orchestrateur-c7e:D6.INV-3';

// ---- Schéma fermé de l'enveloppe (socle, section 3.1) ----

const CHAMPS = ['schema', 'numero', 'date', 'systeme', 'instance', 'ordre', 'niveau', 'type', 'motif', 'sujet', 'source', 'precedent', 'nature', 'profondeur', 'cible', 'invariant', 'ancre', 'preuve', 'decision'];
const REQUIS = CHAMPS.slice(0, CHAMPS.indexOf('precedent') + 1);
const OBJETS = {
  systeme: { cles: ['nom', 'version'], requis: ['nom', 'version'] },
  source: { cles: ['format', 'journal', 'numero'], requis: ['format', 'numero'] },
  ancre: { cles: ['nature', 'ref'], requis: ['nature', 'ref'] },
  preuve: { cles: ['nature', 'ref'], requis: ['nature', 'ref'] },
  decision: { cles: ['valeur', 'vise'], requis: ['valeur', 'vise'] },
};
const LISTES = {
  ordre: ['OC1', 'OC2', 'OC3'],
  niveau: ['N1', 'N2', 'N3', 'humain'],
  type: ['observation', 'proposition', 'decision', 'refus', 'derogation', 'ecart'],
  profondeur: ['macro', 'meso-contrats', 'meso-composants', 'micro'],
  cible: ['instance', 'specification'],
  ancre: ['noeud', 'critere', 'ca', 'scenario', 'fichier', 'commit', 'contrat', 'option', 'ticket', 'concept'],
  preuve: ['test', 'commande', 'commit', 'fichier', 'enregistrements', 'rapport', 'champ', 'arbre'],
  decision: ['retenue', 'refusee', 'amendee'],
};
const SUJETS = ['developpeur', 'referent', 'observateur-N2', 'observateur-N3'];
const PREUVES_NUMEROS = ['enregistrements', 'champ']; // des numéros d'enregistrements d'un journal de l'instance
// Niveaux admis avec chaque ordre (socle, section 3.2) : aucun système n'émet OC3.
const NIVEAUX_DE = { OC1: ['N1', 'humain'], OC2: ['N2', 'N3', 'humain'], OC3: [] };
// Formats sources et natures que produisent les correspondances du générateur (socle, sections 6.1 et 6.2).
const FORMATS = [FORMAT_CHAMP, FORMAT_REGISTRE];
const NATURES = new Set([
  'conforme', 'ecart', 'proposition', 'fondee', 'infondee', 'veille', 'bilan', 'correction', 'choix', 'ratification', 'desaccord',
  ...NATURES_RELEVE, 'recurrence', 'decision',
]);

const MOTIF = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const EMPREINTE = /^[0-9a-f]{64}$/;
const NUMEROS = /^[1-9]\d*(?:,[1-9]\d*)*$/;
const INVARIANT = /^[a-z][a-z0-9-]*:(?:D|SC|SO)\d+\.INV-\d+$/;
const AGENT = /^agent:[a-z][a-z0-9-]*$/;
const NOM = /^[a-z][a-z0-9-]*$/;
const VERSION = /^\d+\.\d+\.\d+$/;

const estObjet = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const chaine = (v, motif) => typeof v === 'string' && motif.test(v);
const entier = (v) => Number.isInteger(v) && v >= 1;
const choisir = (o, cles) => Object.fromEntries(cles.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));
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
const cleSource = (s) => `${s.format}|${s.journal ?? ''}|${s.numero}`;
const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;

/** Version de la spécification qui exporte, celle de son manifeste. */
export function versionDuSysteme() {
  return JSON.parse(lire(join(dirname(fileURLToPath(import.meta.url)), '..', 'manifest.json'))).version;
}

/** Forme canonique d'une enveloppe : les champs dans l'ordre du socle, ceux des objets imbriqués aussi. */
export function canonique(x) {
  const o = {};
  for (const k of CHAMPS) {
    if (x[k] === undefined) continue;
    o[k] = OBJETS[k] && estObjet(x[k]) ? choisir(x[k], OBJETS[k].cles) : x[k];
  }
  return o;
}

export const ligneDe = (x) => JSON.stringify(canonique(x));

/**
 * Écarts d'une enveloppe au schéma fermé du socle (SO1.INV-1), à sa table des ordres et des niveaux
 * (SO1.INV-2) et à la minimisation (SO3.INV-1, SO3.INV-2) : rien que des valeurs de listes fermées, des
 * motifs, des numéros, des identifiants d'invariants du dépôt et des empreintes.
 */
export function controlerEnveloppe(x) {
  if (!estObjet(x)) return ['objet JSON attendu'];
  const err = [];
  for (const k of Object.keys(x)) if (!CHAMPS.includes(k)) err.push(`champ inconnu ${k}`);
  for (const k of REQUIS) if (!(k in x)) err.push(`champ requis absent ${k}`);
  for (const [k, { cles, requis }] of Object.entries(OBJETS)) {
    if (x[k] === undefined) continue;
    if (!estObjet(x[k])) {
      err.push(`${k} : objet attendu`);
      continue;
    }
    for (const c of Object.keys(x[k])) if (!cles.includes(c)) err.push(`champ inconnu ${k}.${c}`);
    for (const c of requis) if (!(c in x[k])) err.push(`champ requis absent ${k}.${c}`);
  }
  if (err.length > 0) return err;

  const dansLaListe = (nom, v, liste) => {
    if (!liste.includes(v)) err.push(`${nom} « ${v} » hors de la liste : ${liste.join(', ')}`);
  };
  if (x.schema !== SCHEMA) err.push(`schema « ${x.schema} », attendu ${SCHEMA}`);
  if (!entier(x.numero)) err.push(`numero ${JSON.stringify(x.numero)} : un entier, à partir de 1`);
  if (!chaine(x.date, DATE)) err.push(`date ${JSON.stringify(x.date)} : AAAA-MM-JJTHH:MM:SSZ, en UTC`);
  if (!chaine(x.systeme.nom, NOM)) err.push(`systeme.nom « ${x.systeme.nom} » : le nom d'une spécification du dépôt`);
  if (!chaine(x.systeme.version, VERSION)) err.push(`systeme.version « ${x.systeme.version} » : une version x.y.z`);
  if (!chaine(x.instance, EMPREINTE)) err.push('instance : l\'empreinte SHA-256 du sel de l\'instance');
  for (const k of ['ordre', 'niveau', 'type']) dansLaListe(k, x[k], LISTES[k]);
  if (!chaine(x.motif, MOTIF)) err.push(`motif « ${x.motif} » : minuscules et tirets`);
  if (!SUJETS.includes(x.sujet) && !chaine(x.sujet, AGENT)) err.push(`sujet « ${x.sujet} » : un rôle, ${SUJETS.join(', ')} ou agent:<spécification>`);
  dansLaListe('source.format', x.source.format, FORMATS);
  if (x.source.journal !== undefined && !chaine(x.source.journal, EMPREINTE)) err.push('source.journal : une empreinte salée');
  if (!entier(x.source.numero)) err.push(`source.numero ${JSON.stringify(x.source.numero)} : un entier, à partir de 1`);
  if (x.precedent !== null && !chaine(x.precedent, EMPREINTE)) err.push('precedent : une empreinte SHA-256, ou null pour la première ligne');
  if (x.nature !== undefined && !NATURES.has(x.nature)) err.push(`nature « ${x.nature} » hors des listes des formats sources`);
  for (const k of ['profondeur', 'cible']) if (x[k] !== undefined) dansLaListe(k, x[k], LISTES[k]);
  if (x.invariant !== undefined && !chaine(x.invariant, INVARIANT)) err.push(`invariant « ${x.invariant} » : l'identifiant d'un invariant du dépôt, préfixé par sa spécification`);
  if (x.ancre !== undefined) {
    dansLaListe('ancre.nature', x.ancre.nature, LISTES.ancre);
    if (!chaine(x.ancre.ref, EMPREINTE)) err.push('ancre.ref : une empreinte salée');
  }
  if (x.preuve !== undefined) {
    dansLaListe('preuve.nature', x.preuve.nature, LISTES.preuve);
    if (!chaine(x.preuve.ref, EMPREINTE) && !(PREUVES_NUMEROS.includes(x.preuve.nature) && chaine(x.preuve.ref, NUMEROS))) {
      err.push('preuve.ref : une empreinte salée, ou des numéros d\'enregistrements séparés par des virgules');
    }
  }
  if (x.decision !== undefined) {
    dansLaListe('decision.valeur', x.decision.valeur, LISTES.decision);
    if (!entier(x.decision.vise) || (entier(x.numero) && x.decision.vise >= x.numero)) err.push('decision.vise : le numéro d\'une enveloppe antérieure');
  }
  if (LISTES.ordre.includes(x.ordre) && LISTES.niveau.includes(x.niveau) && !NIVEAUX_DE[x.ordre].includes(x.niveau)) {
    err.push(`niveau ${x.niveau} avec l'ordre ${x.ordre} : N1 va avec OC1, N2 et N3 avec OC2, humain avec OC1 ou OC2, et aucun système n'émet OC3`);
  }
  return err;
}

// ---- Correspondances (socle, section 6) ----

/** Empreinte salée d'une référence propre à l'instance (socle, section 5.1). */
export const empreinteSalee = (sel, reference) => sha256(`${sel}:${reference}`);

const listeDeNumeros = (ref) => (/^\s*\d+(?:\s*,\s*\d+)*\s*$/.test(String(ref)) ? String(ref).split(',').map((s) => Number(s.trim())).join(',') : null);

/** Une preuve ne garde que sa nature et sa référence ; des numéros d'enregistrements sortent tels quels. */
function preuveDe(p, sel) {
  const nature = p.nature ?? p.type; // le champ écrit nature, le registre type
  const numeros = PREUVES_NUMEROS.includes(nature) ? listeDeNumeros(p.ref) : null;
  return { nature, ref: numeros ?? empreinteSalee(sel, String(p.ref)) };
}

const ancreDe = (a, sel) => (estObjet(a) ? { ancre: { nature: a.type, ref: empreinteSalee(sel, String(a.ref)) }, profondeur: profondeurDAncre(a) } : {});
const estPropositionDOrdre2 = (e) => e?.type === 'observation' && e.ordre === 2 && e.verdict === 'proposition';

/**
 * Enveloppe partielle d'un enregistrement du champ (socle, section 6.1), sans numéro, chaînage ni en-tête ;
 * null pour une action, qui est un travail et non une observation. `numeroDe(n)` donne le numéro de
 * l'enveloppe de l'enregistrement n du même champ, déjà traduit.
 */
export function traduireChamp(e, { parN, journal, sel, numeroDe }) {
  if (e.type === 'action') return null;
  const commun = { date: e.date, source: { format: FORMAT_CHAMP, journal, numero: e.n }, cible: 'instance' };
  const preuve = estObjet(e.preuve) ? { preuve: preuveDe(e.preuve, sel) } : {};
  if (e.type === 'observation' && e.ordre === 1) {
    return { ...commun, ordre: 'OC1', niveau: 'N1', type: e.verdict === 'ecart' ? 'ecart' : 'observation', motif: e.motif ?? e.verdict, sujet: SUJET_AGENT, nature: e.verdict, ...ancreDe(e.ancre, sel), ...preuve };
  }
  if (e.type === 'observation' && e.ordre === 2) {
    return { ...commun, ordre: 'OC2', niveau: 'N2', type: e.verdict === 'proposition' ? 'proposition' : 'observation', motif: e.motif ?? e.verdict, sujet: 'observateur-N2', nature: e.verdict, ...preuve };
  }
  if (e.type === 'observation' && e.ordre === 3) {
    const examine = (e.observe ?? []).map((n) => parN.get(n)).find((x) => typeof x?.motif === 'string');
    return { ...commun, ordre: 'OC2', niveau: 'N3', type: 'observation', motif: e.motif ?? examine?.motif ?? e.verdict, sujet: 'observateur-N3', nature: e.verdict, ...preuve };
  }
  if (e.type === 'retour' && e.nature === 'correction') {
    return { ...commun, ordre: 'OC1', niveau: 'humain', type: 'observation', motif: e.motif ?? 'correction', sujet: 'developpeur', nature: 'correction', ...ancreDe(parN.get(e.vise)?.ancre, sel) };
  }
  if (e.type === 'retour' && e.nature === 'choix') {
    const visee = parN.get(e.vise);
    if (estPropositionDOrdre2(visee)) {
      const valeur = e.decision === 'refusée' ? 'refusee' : e.decision;
      return { ...commun, ordre: 'OC2', niveau: 'humain', type: 'decision', motif: visee.motif ?? 'choix', sujet: 'developpeur', nature: 'choix', decision: { valeur, vise: numeroDe(visee.n) } };
    }
    return { ...commun, ordre: 'OC1', niveau: 'humain', type: 'decision', motif: 'choix', sujet: 'developpeur', nature: 'choix', ...ancreDe(visee?.type === 'action' ? visee.ancre : undefined, sel) };
  }
  if (e.type === 'retour' && e.nature === 'ratification') {
    return { ...commun, ordre: 'OC1', niveau: 'humain', type: 'decision', motif: e.decision === 'ratifié' ? 'ratifie' : 'non-ratifie', sujet: 'developpeur', nature: 'ratification' };
  }
  if (e.type === 'ecart') {
    const desaccord = e.invariant === INVARIANT_DESACCORD;
    return {
      ...commun, ordre: 'OC1', niveau: 'N1', type: 'ecart', motif: desaccord ? 'desaccord-entre-noeuds' : 'ecart-invariant-projet', sujet: SUJET_AGENT,
      nature: desaccord ? 'desaccord' : 'ecart', ...(desaccord ? { invariant: INVARIANT_DESACCORD_DEPOT } : {}), ...ancreDe(e.ancre, sel),
    };
  }
  throw new Error(`enregistrement ${e.type}${e.nature ? ` ${e.nature}` : ''}${e.ordre ? ` d'ordre ${e.ordre}` : ''} sans correspondance`);
}

const cibleDe = (c) => {
  const cible = { generateur: 'specification', referentiel: 'instance' }[c];
  if (!cible) throw new Error(`cible « ${c} » sans correspondance (generateur, referentiel)`);
  return cible;
};

/**
 * Enveloppe partielle d'une ligne du registre d'apprentissage (socle, section 6.2). `numeroDe(n)` donne le
 * numéro de l'enveloppe de la ligne n du registre, déjà traduite.
 */
export function traduireRegistre(e, { parN, sel, numeroDe }) {
  const commun = { date: e.date, source: { format: FORMAT_REGISTRE, numero: e.n } };
  if (e.type === 'releve') {
    return {
      ...commun, ordre: 'OC2', niveau: 'N2', type: 'observation', motif: e.motif, sujet: SUJET_AGENT, nature: e.nature, profondeur: e.profondeur, cible: cibleDe(e.cible),
      ancre: { nature: 'ticket', ref: empreinteSalee(sel, String(e.cle)) }, ...(estObjet(e.preuve) ? { preuve: preuveDe(e.preuve, sel) } : {}),
    };
  }
  if (e.type === 'proposition') {
    return { ...commun, ordre: 'OC2', niveau: 'N2', type: 'proposition', motif: e.motif, sujet: SUJET_AGENT, nature: 'recurrence', profondeur: e.profondeur, cible: cibleDe(e.cible), preuve: { nature: 'enregistrements', ref: (e.releves ?? []).join(',') } };
  }
  if (e.type === 'decision') {
    const p = parN.get(e.vise);
    if (p?.type !== 'proposition') throw new Error(`la ligne visée, n° ${e.vise}, n'est pas une proposition`);
    return { ...commun, ordre: 'OC2', niveau: 'humain', type: 'decision', motif: p.motif, sujet: 'developpeur', nature: 'decision', profondeur: p.profondeur, cible: cibleDe(p.cible), decision: { valeur: e.decision, vise: numeroDe(p.n) } };
  }
  throw new Error(`ligne ${e.type} sans correspondance`);
}

// ---- Sources ----

/** Intégrité d'un champ, sans son arbre : lignes lisibles et canoniques, numéros, dates, chaîne et tête. */
function integriteChamp(dossier) {
  const { lignes, enregistrements } = lireChamp(dossier);
  const erreurs = [];
  lignes.forEach((ligne, i) => {
    const e = enregistrements[i];
    if (e.type === 'illisible') {
      erreurs.push(`ligne ${i + 1} illisible`);
      return;
    }
    if (e.n !== i + 1) erreurs.push(`ligne ${i + 1} : n° ${e.n}, ligne insérée ou supprimée`);
    if (JSON.stringify(canoniqueChamp(e)) !== ligne) erreurs.push(`n° ${i + 1} : ligne non canonique, écrite hors de champ.mjs`);
    if (e.precedent !== (i === 0 ? null : sha256(lignes[i - 1]))) erreurs.push(`n° ${i + 1} : empreinte du précédent fausse, la ligne ${i} a été réécrite, insérée ou supprimée`);
    if (i > 0 && typeof e.date === 'string' && e.date < enregistrements[i - 1].date) erreurs.push(`n° ${i + 1} : date antérieure à celle du n° ${i}`);
  });
  const tete = lireJson(join(dossier, TETE_CHAMP));
  if (lignes.length > 0 && (!tete || tete.illisible || tete.n !== lignes.length || tete.empreinte !== sha256(lignes.at(-1)))) {
    erreurs.push(`${TETE_CHAMP} absente, illisible, ou qui ne désigne pas la dernière ligne : ligne supprimée ou réécrite à la fin du champ`);
  }
  return { erreurs, enregistrements };
}

/**
 * Journaux sources du projet, dans leur ordre de rangement : les champs par clé de ticket, puis le
 * registre d'apprentissage ; chacun vérifié avant tout export.
 */
export function lireSources(projet = '.') {
  const erreurs = [];
  const journaux = [];
  const demandes = join(projet, DEMANDES);
  const cles = existsSync(demandes)
    ? readdirSync(demandes, { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(join(demandes, d.name, FICHIER_CHAMP))).map((d) => d.name).sort(parCodePoint)
    : [];
  for (const cle of cles) {
    const { erreurs: ecarts, enregistrements } = integriteChamp(join(demandes, cle));
    erreurs.push(...ecarts.map((e) => `champ de ${cle}, ${e}`));
    journaux.push({ format: FORMAT_CHAMP, cle, nom: `champ de ${cle}`, enregistrements });
  }
  const registre = join(projet, REGISTRE);
  if (existsSync(registre)) {
    erreurs.push(...verifierRegistre(registre).map((e) => `registre d'apprentissage, ${e}`));
    journaux.push({ format: FORMAT_REGISTRE, cle: null, nom: 'registre d\'apprentissage', enregistrements: lireRegistre(registre).enregistrements });
  }
  return { erreurs, journaux };
}

/** Pour chaque journal source, ses enregistrements à traduire et pas encore exportés, dans leur ordre. */
function aExporter(journaux, sel, exportees) {
  return journaux.map((j, rang) => {
    const journal = j.cle === null ? undefined : empreinteSalee(sel, j.cle);
    const nouveaux = j.enregistrements.filter((e) => e && !(j.format === FORMAT_CHAMP && e.type === 'action') && !exportees.has(cleSource({ format: j.format, journal, numero: e.n })));
    return { ...j, rang, journal, parN: new Map(j.enregistrements.filter(Boolean).map((e) => [e.n, e])), nouveaux };
  });
}

/**
 * Fusion des journaux par date, sans jamais changer l'ordre d'un même journal ; à date égale, le journal
 * rangé le premier passe d'abord.
 */
function fusionner(files) {
  const positions = files.map(() => 0);
  const ordre = [];
  for (;;) {
    let k = -1;
    files.forEach((f, i) => {
      const e = f.nouveaux[positions[i]];
      if (e && (k === -1 || String(e.date) < String(files[k].nouveaux[positions[k]].date))) k = i;
    });
    if (k === -1) return ordre;
    ordre.push({ f: files[k], e: files[k].nouveaux[positions[k]++] });
  }
}

// ---- Journal d'enveloppes ----

export function lireJournal(projet = '.') {
  const lignes = lignesDe(join(projet, JOURNAL));
  const enveloppes = lignes.map((l) => {
    try {
      const x = JSON.parse(l);
      return estObjet(x) ? x : null;
    } catch {
      return null;
    }
  });
  return { lignes, enveloppes };
}

/**
 * Écarts du journal (SO1, SO2) : lignes lisibles, canoniques et au schéma fermé, numéros consécutifs,
 * dates dans l'ordre, chaîne d'empreintes, une seule instance, tête qui désigne la dernière ligne ; avec le
 * sel, l'instance doit être la sienne.
 */
export function verifierJournal(projet = '.', { sel = null } = {}) {
  const { lignes, enveloppes } = lireJournal(projet);
  const erreurs = [];
  lignes.forEach((ligne, i) => {
    const x = enveloppes[i];
    const nom = `ligne ${i + 1}`;
    if (!x) {
      erreurs.push(`${nom} : JSON illisible`);
      return;
    }
    erreurs.push(...controlerEnveloppe(x).map((e) => `${nom} : ${e}`));
    if (ligneDe(x) !== ligne) erreurs.push(`${nom} : ligne non canonique, écrite hors de l'export`);
    if (x.numero !== i + 1) erreurs.push(`${nom} : numéro ${x.numero}, attendu ${i + 1} : ligne insérée ou supprimée`);
    if (x.precedent !== (i === 0 ? null : sha256(lignes[i - 1]))) erreurs.push(`${nom} : empreinte du précédent fausse, la ligne ${i} a été réécrite, insérée ou supprimée`);
    const avant = enveloppes[i - 1];
    if (avant && String(x.date) < String(avant.date)) erreurs.push(`${nom} : date ${x.date} antérieure à celle de la ligne ${i}`);
    if (enveloppes[0] && x.instance !== enveloppes[0].instance) erreurs.push(`${nom} : instance différente de celle de la ligne 1`);
  });
  if (sel && enveloppes[0] && enveloppes[0].instance !== sha256(sel)) erreurs.push(`le sel de ce clone n'est pas celui de l'instance du journal`);
  const tete = lireJson(join(projet, TETE));
  if (lignes.length > 0) {
    if (!tete) erreurs.push(`${TETE} absente`);
    else if (tete.illisible) erreurs.push(`${TETE} illisible`);
    else if (tete.schema !== SCHEMA || tete.numero !== lignes.length) erreurs.push(`${TETE} annonce la ligne ${tete.numero}, le journal s'arrête à la ligne ${lignes.length} : lignes supprimées ou ajoutées hors de l'export`);
    else if (tete.empreinte !== sha256(lignes.at(-1))) erreurs.push(`${TETE} : la dernière ligne, n° ${lignes.length}, a été réécrite`);
  } else if (tete) erreurs.push(`${TETE} présente pour un journal vide`);
  return [...new Set(erreurs)];
}

// ---- Sel de l'instance ----

/** Répertoire Git commun du projet, partagé par ses worktrees ; null hors d'un dépôt Git. */
export function repertoireGitCommun(projet = '.') {
  const git = (...args) => {
    try {
      return execFileSync('git', args, { cwd: projet, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
      return null;
    }
  };
  const absolu = git('rev-parse', '--path-format=absolute', '--git-common-dir');
  if (absolu && !absolu.includes('\n') && isAbsolute(absolu) && existsSync(absolu)) return absolu;
  const relatif = git('rev-parse', '--git-common-dir'); // Git antérieur à 2.31
  if (!relatif || relatif.includes('\n')) return null;
  const chemin = resolve(projet, relatif);
  return existsSync(chemin) ? chemin : null;
}

/** Sel de l'instance, s'il a été tiré, et son emplacement ; le sel n'est jamais affiché ni exporté. */
export function lireSel(projet = '.') {
  const commun = repertoireGitCommun(projet);
  if (!commun) return { erreur: `${projet} n'est pas dans un dépôt Git : le sel de l'instance se garde dans son répertoire Git commun` };
  const chemin = join(commun, SEL);
  if (!existsSync(chemin)) return { chemin, sel: null };
  const sel = readFileSync(chemin, 'utf8').trim();
  return EMPREINTE.test(sel) ? { chemin, sel } : { erreur: `sel de l'instance illisible dans <git-common-dir>/${SEL} : 64 caractères hexadécimaux attendus` };
}

// ---- Export ----

const refus = (erreurs) => ({ erreurs, ajoutees: 0, total: null, selTire: false });

/**
 * Journaux d'enveloppes non vides du projet, de tous les systèmes qui y exportent sous le sel de l'instance,
 * `docs/c7e/observations*.jsonl`, avec l'instance de leur première ligne.
 */
function journauxDeLInstance(projet) {
  const dossier = join(projet, 'docs', 'c7e');
  if (!existsSync(dossier)) return [];
  return readdirSync(dossier).filter((n) => /^observations.*\.jsonl$/.test(n)).sort(parCodePoint).flatMap((n) => {
    const [premiere] = lignesDe(join(dossier, n));
    if (premiere === undefined) return [];
    let instance = null;
    try {
      instance = JSON.parse(premiere).instance ?? null;
    } catch {
      instance = null;
    }
    return [{ journal: `docs/c7e/${n}`, instance }];
  });
}

/**
 * Exporte les enregistrements nouveaux du projet ; renvoie { erreurs, ajoutees, total, selTire }. Tout ou
 * rien : un journal ou une source altérés, un sel absent alors qu'un journal d'enveloppes du projet existe, le
 * sien ou celui d'un autre système, un sel étranger à l'un d'eux, une enveloppe mal formée arrêtent l'export,
 * et rien n'est écrit. Les options `sel` et `version` ne servent qu'aux tests : la ligne
 * de commande ne prend jamais le sel en argument, et la version est celle du manifeste.
 */
export function exporter({ projet = '.', sel, version = versionDuSysteme() } = {}) {
  const alteration = verifierJournal(projet);
  if (alteration.length > 0) return refus(alteration.map((e) => `journal altéré, ${e} : rien n'est exporté`));
  const { lignes, enveloppes } = lireJournal(projet);
  const sources = lireSources(projet);
  if (sources.erreurs.length > 0) return refus(sources.erreurs.map((e) => `source altérée, ${e} : rien n'est exporté ; « champ.mjs verifier » ou « apprentissage.mjs registre verifier » en donne le détail`));

  let chemin = null;
  let selTire = false;
  const journaux = journauxDeLInstance(projet);
  if (sel === undefined) {
    const lu = lireSel(projet);
    if (lu.erreur) return refus([lu.erreur]);
    ({ chemin, sel } = lu);
    if (sel === null) {
      if (journaux.length > 0) {
        const plusieurs = journaux.length > 1;
        return refus([`sel de l'instance absent de <git-common-dir>/${SEL} alors que ${journaux.map((j) => j.journal).join(', ')} existe${plusieurs ? 'nt' : ''} : un nouveau sel changerait l'identité de l'instance au milieu de ${plusieurs ? 'ses journaux' : 'son journal'} ; recopie dans ce clone, à cet emplacement, le sel du clone qui ${plusieurs ? 'les a commencés' : 'a commencé le journal'}`]);
      }
      sel = randomBytes(32).toString('hex');
      selTire = true;
    }
  }
  const instance = sha256(sel);
  const etranger = journaux.find((j) => j.instance !== instance);
  if (etranger) return refus([`le sel de ce clone n'est pas celui de l'instance du journal ${etranger.journal} : rien n'est exporté`]);

  const numeros = new Map(enveloppes.map((x) => [cleSource(x.source), x.numero]));
  const ordre = fusionner(aExporter(sources.journaux, sel, numeros));
  if (ordre.length === 0) return { erreurs: [], ajoutees: 0, total: lignes.length, selTire: false };

  const erreurs = [];
  const ajout = [];
  let precedent = lignes.length > 0 ? sha256(lignes.at(-1)) : null;
  let derniere = enveloppes.at(-1)?.date ?? null;
  for (const { f, e } of ordre) {
    const numero = lignes.length + ajout.length + 1;
    const numeroDe = (n) => {
      const v = numeros.get(cleSource({ format: f.format, journal: f.journal, numero: n }));
      if (v === undefined) throw new Error(`l'enregistrement visé, n° ${n}, n'a pas d'enveloppe`);
      return v;
    };
    let partielle;
    try {
      partielle = f.format === FORMAT_CHAMP ? traduireChamp(e, { parN: f.parN, journal: f.journal, sel, numeroDe }) : traduireRegistre(e, { parN: f.parN, sel, numeroDe });
    } catch (x) {
      erreurs.push(`${f.nom}, n° ${e.n} : ${x.message}`);
      continue;
    }
    // La date de l'enregistrement, ou celle de la ligne précédente si elle est plus récente : le journal
    // reste dans l'ordre du temps quand un enregistrement arrive après d'autres, plus récents.
    const date = derniere !== null && String(partielle.date) < derniere ? derniere : partielle.date;
    const enveloppe = { schema: SCHEMA, numero, systeme: { nom: SYSTEME, version }, instance, ...partielle, date, precedent };
    const ecarts = controlerEnveloppe(enveloppe);
    if (ecarts.length > 0) {
      erreurs.push(...ecarts.map((x) => `${f.nom}, n° ${e.n} : ${x}`));
      continue;
    }
    const ligne = ligneDe(enveloppe);
    ajout.push(ligne);
    numeros.set(cleSource(enveloppe.source), numero);
    precedent = sha256(ligne);
    derniere = date;
  }
  if (erreurs.length > 0) return refus(erreurs.map((x) => `enveloppe refusée, ${x} : rien n'est écrit`));

  if (selTire) {
    try {
      mkdirSync(dirname(chemin), { recursive: true });
      writeFileSync(chemin, `${sel}\n`, { mode: 0o600, flag: 'wx' });
    } catch {
      return refus([`sel de l'instance impossible à écrire dans <git-common-dir>/${SEL} : rien n'est écrit`]);
    }
  }
  mkdirSync(dirname(join(projet, JOURNAL)), { recursive: true });
  appendFileSync(join(projet, JOURNAL), `${ajout.join('\n')}\n`);
  writeFileSync(join(projet, TETE), `${JSON.stringify({ schema: SCHEMA, numero: lignes.length + ajout.length, empreinte: precedent })}\n`);
  return { erreurs: [], ajoutees: ajout.length, total: lignes.length + ajout.length, selTire };
}

// ---- État ----

/** Enveloppes du journal par type, par ordre et niveau, par sujet ; sources et enregistrements en attente. */
export function etat(projet = '.') {
  const lu = lireSel(projet);
  const verification = verifierJournal(projet, { sel: lu.sel ?? null });
  const { enveloppes } = lireJournal(projet);
  const compter = (cle) => {
    const res = {};
    for (const x of enveloppes.filter(Boolean)) res[cle(x)] = (res[cle(x)] ?? 0) + 1;
    return res;
  };
  const sources = lireSources(projet);
  let enAttente = null;
  if (!lu.erreur && sources.erreurs.length === 0 && (lu.sel || enveloppes.length === 0)) {
    const exportees = new Set(enveloppes.filter(Boolean).map((x) => cleSource(x.source)));
    enAttente = aExporter(sources.journaux, lu.sel ?? '', exportees).reduce((n, f) => n + f.nouveaux.length, 0);
  }
  return {
    journal: JOURNAL,
    enveloppes: enveloppes.length,
    derniere: enveloppes.at(-1)?.date ?? null,
    parType: compter((x) => x.type),
    parOrdreEtNiveau: compter((x) => `${x.ordre} ${x.niveau}`),
    parSujet: compter((x) => x.sujet),
    sources: { champs: sources.journaux.filter((j) => j.format === FORMAT_CHAMP).length, registre: sources.journaux.find((j) => j.format === FORMAT_REGISTRE)?.enregistrements.length ?? 0 },
    enAttente,
    verification: [...verification, ...sources.erreurs.map((e) => `source altérée, ${e}`)],
  };
}

// ---- Ligne de commande ----

const USAGE = [
  'Usage :',
  '  node observation.mjs exporter [--projet <dossier>]',
  '  node observation.mjs verifier [--projet <dossier>]',
  '  node observation.mjs etat [--projet <dossier>] [--json]',
].join('\n');

const enLigne = (compte) => Object.entries(compte).sort(([a], [b]) => parCodePoint(a, b)).map(([k, n]) => `${k} ${n}`).join(' · ') || 'aucune';

/** Ligne de commande. Renvoie le code de sortie ; écrit par `sortie` et `erreur`. */
export function principal(argv, sortie = console.log, erreur = console.error) {
  const [commande, ...reste] = argv;
  const options = {};
  for (let k = 0; k < reste.length; k++) {
    if (reste[k] === '--json') options.json = true;
    else if (reste[k] === '--projet' && reste[k + 1] !== undefined) options.projet = reste[++k];
    else {
      erreur(USAGE);
      return 2;
    }
  }
  const projet = options.projet ?? '.';
  if (commande === 'exporter' && !options.json) {
    const r = exporter({ projet });
    if (r.erreurs.length > 0) {
      for (const e of r.erreurs) erreur(`REFUS  ${e}`);
      return 1;
    }
    if (r.selTire) sortie(`sel de l'instance tiré et gardé dans <git-common-dir>/${SEL}, hors de l'arbre de travail : ni versionné ni exporté ; un autre clone du projet en aura besoin pour continuer ce journal`);
    sortie(r.ajoutees === 0
      ? `aucun enregistrement nouveau : ${JOURNAL} inchangé, ${pluriel(r.total, 'enveloppe')}`
      : `${pluriel(r.ajoutees, 'enveloppe')} ajoutée${r.ajoutees > 1 ? 's' : ''} à ${JOURNAL}, ${r.total} en tout ; à versionner avec ${TETE}, comme le registre d'apprentissage`);
    return 0;
  }
  if (commande === 'verifier' && !options.json) {
    const lu = lireSel(projet);
    const erreurs = verifierJournal(projet, { sel: lu.sel ?? null });
    if (erreurs.length > 0) {
      for (const e of erreurs) erreur(`ALTÉRÉ  ${e}`);
      return 1;
    }
    sortie(`journal intact : ${pluriel(lireJournal(projet).lignes.length, 'enveloppe')} au schéma ${SCHEMA}, chaîne et tête intactes`);
    return 0;
  }
  if (commande === 'etat') {
    const e = etat(projet);
    if (options.json) sortie(JSON.stringify(e, null, 2));
    else {
      sortie(`${e.journal} : ${pluriel(e.enveloppes, 'enveloppe')}${e.derniere ? `, la dernière datée ${e.derniere}` : ''}`);
      sortie(`  par type : ${enLigne(e.parType)}`);
      sortie(`  par ordre et niveau : ${enLigne(e.parOrdreEtNiveau)}`);
      sortie(`  par sujet : ${enLigne(e.parSujet)}`);
      sortie(`sources : ${pluriel(e.sources.champs, 'champ')} de ticket, registre d'apprentissage de ${pluriel(e.sources.registre, 'ligne')} ; en attente d'export : ${e.enAttente ?? 'inconnu, sans le sel de l\'instance'}`);
      for (const v of e.verification) erreur(`ALTÉRÉ  ${v}`);
    }
    return e.verification.length > 0 ? 1 : 0;
  }
  erreur(USAGE);
  return 2;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exitCode = principal(process.argv.slice(2));
