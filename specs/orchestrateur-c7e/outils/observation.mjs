#!/usr/bin/env node
// Export des registres de l'orchestrateur C7E vers le socle d'observation (orchestrateur-c7e, D12, depuis 3.7.0 ;
// socle-observation 1.4.0). Il se lance depuis le clone du dépôt Agent2Prompt ; l'IA de l'orchestrateur ne
// l'exécute pas d'elle-même : elle en donne la commande au développeur.
//
// L'export ne lit que ce qui est commité dans le projet, sans rien modifier : le registre des concepts,
// docs/c7e/concepts.json, dans son historique Git, au premier parent de la branche courante, et le registre des
// écarts, docs/c7e/registre-ecarts.md, à son dernier commit. Chaque événement du premier, entrée proposée,
// promotion ou retrait, et chaque ligne décidée du second deviennent une enveloppe socle-observation.enveloppe/1,
// selon les correspondances du socle (sections 6.3 et 6.4) et les précisions du module observation de
// l'orchestrateur, ajoutée au journal d'enveloppes de l'orchestrateur, docs/c7e/observations-orchestrateur-c7e.jsonl :
// en ajout seul, chaque ligne chaînée à l'empreinte de la précédente, la tête docs/c7e/observations-orchestrateur-c7e.tete
// portant le numéro et l'empreinte de la dernière (SO2). Aucun texte ne sort, et toute référence du projet sort par
// son empreinte salée (SO3) : le sel de l'instance, partagé avec les autres systèmes qui exportent dans le projet, est
// gardé dans son répertoire Git commun, <git-common-dir>/agent2prompt/sel ; il n'est jamais versionné, affiché ni
// exporté. Un enregistrement déjà exporté ne l'est pas deux fois ; une ligne d'écart ou un historique réécrits depuis
// leur export, comme une enveloppe mal formée, arrêtent l'export, sans rien écrire. L'outil ne commite rien.
//
// Usage :
//   node <dépôt>/specs/orchestrateur-c7e/outils/observation.mjs exporter [--projet <dossier>]
//   node <dépôt>/specs/orchestrateur-c7e/outils/observation.mjs verifier [--projet <dossier>]
//   node <dépôt>/specs/orchestrateur-c7e/outils/observation.mjs etat [--projet <dossier>] [--json]
// <dossier> : la racine du projet, dépôt Git, par défaut le dossier courant. Codes de sortie : 0 ; 1 pour un refus
// ou un journal altéré ; 2 pour un usage incorrect. Node 20 ou plus récent, modules natifs uniquement.

import { createHash, randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SCHEMA = 'socle-observation.enveloppe/1';
export const JOURNAL = 'docs/c7e/observations-orchestrateur-c7e.jsonl';
export const TETE = 'docs/c7e/observations-orchestrateur-c7e.tete';
export const CONCEPTS = 'docs/c7e/concepts.json';
export const ECARTS = 'docs/c7e/registre-ecarts.md';
export const FORMAT_CONCEPTS = 'orchestrateur.concepts/1';
export const FORMAT_ECARTS = 'orchestrateur.ecarts/1';
export const SEL = 'agent2prompt/sel'; // sous le répertoire Git commun du projet, partagé par les systèmes de l'instance
export const SYSTEME = 'orchestrateur-c7e';
export const SECOND_ORDRE = '[É7-C7E]'; // marque d'un commit de second ordre (section 4 de l'orchestrateur)
export const LIGNE_D_EXEMPLE = 'EX-001'; // ticket de la ligne d'exemple du modèle du registre des écarts
const SUJET_AGENT = `agent:${SYSTEME}`;
const ICI = dirname(fileURLToPath(import.meta.url));
const SPEC = join(ICI, '..');
const RACINE = join(SPEC, '..', '..');

// ---- Schéma fermé de l'enveloppe (socle, section 3.1), pour les formats de l'orchestrateur ----

export const CHAMPS_ENVELOPPE = ['schema', 'numero', 'date', 'systeme', 'instance', 'ordre', 'niveau', 'type', 'motif', 'sujet', 'source', 'precedent', 'nature', 'profondeur', 'cible', 'invariant', 'ancre', 'preuve', 'decision', 'mesure'];
export const REQUIS_ENVELOPPE = CHAMPS_ENVELOPPE.slice(0, CHAMPS_ENVELOPPE.indexOf('precedent') + 1);
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
const NIVEAUX_DE = { OC1: ['N1', 'humain'], OC2: ['N2', 'N3', 'humain'], OC3: [] };
// Formats, natures et sujets que produisent les correspondances de l'orchestrateur (socle, sections 6.3 et 6.4).
const FORMATS = [FORMAT_CONCEPTS, FORMAT_ECARTS];
const NATURES = ['proposed', 'experimental', 'validated', 'retire', 'respecter', 'derogation'];
const SUJETS = [SUJET_AGENT, 'developpeur', 'referent'];

const MOTIF = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const JOUR = /^\d{4}-\d{2}-\d{2}$/;
const EMPREINTE = /^[0-9a-f]{64}$/;
const INVARIANT = /^[a-z][a-z0-9-]*:(?:D|SC|SO)\d+\.INV-\d+$/;
const ID_CONCEPT = /^C_([A-Z0-9]+(?:_[A-Z0-9]+)*)_(\d{3})$/;
const VERSION = /^\d+\.\d+\.\d+$/;
const NOM = /^[a-z][a-z0-9-]*$/;

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
export const sha256 = (texte) => createHash('sha256').update(texte, 'utf8').digest('hex');
/** Empreinte salée d'une référence propre à l'instance (socle, section 5.1). */
export const empreinteSalee = (sel, reference) => sha256(`${sel}:${reference}`);

/** Version de la spécification qui exporte, celle de son manifeste. */
export function versionDuSysteme() {
  return JSON.parse(lire(join(SPEC, 'manifest.json'))).version;
}

/** Identifiants du registre de départ (section 7.2 du point d'entrée) : seuls à sortir en clair. */
export function conceptsDeDepart() {
  const texte = lire(join(SPEC, 'SKILL.md'));
  const bloc = /Registre de départ[\s\S]*?```json\n([\s\S]*?)\n```/.exec(texte);
  return new Set(bloc ? JSON.parse(bloc[1]).concepts.map((c) => c.id) : []);
}

/** Invariants définis dans le dépôt, préfixés par leur spécification : `java:D4.INV-1`. */
export function invariantsDuDepot(depot = RACINE) {
  const ids = new Set();
  const specs = join(depot, 'specs');
  for (const nom of existsSync(specs) ? readdirSync(specs) : []) {
    const entree = join(specs, nom, 'SKILL.md');
    if (!existsSync(entree)) continue;
    for (const [, id] of lire(entree).matchAll(/\*\*((?:D|SC|SO)\d+\.INV-\d+)\*\*/g)) ids.add(`${nom}:${id}`);
  }
  return ids;
}

/** Forme canonique d'une enveloppe : les champs dans l'ordre du socle, ceux des objets imbriqués aussi. */
export function canonique(x) {
  const o = {};
  for (const k of CHAMPS_ENVELOPPE) {
    if (x[k] === undefined) continue;
    o[k] = OBJETS[k] && estObjet(x[k]) ? choisir(x[k], OBJETS[k].cles) : x[k];
  }
  return o;
}

export const ligneDe = (x) => JSON.stringify(canonique(x));

/**
 * Écarts d'une enveloppe au schéma fermé du socle (SO1.INV-1), à sa table des ordres et des niveaux (SO1.INV-2)
 * et à la minimisation (SO3.INV-1, SO3.INV-2), pour les formats de l'orchestrateur : rien que des valeurs de
 * listes fermées, des motifs, des numéros, des identifiants d'invariants du dépôt, des identifiants du registre de
 * départ et des empreintes.
 */
export function controlerEnveloppe(x, { depart = conceptsDeDepart() } = {}) {
  if (!estObjet(x)) return ['objet JSON attendu'];
  const err = [];
  for (const k of Object.keys(x)) if (!CHAMPS_ENVELOPPE.includes(k)) err.push(`champ inconnu ${k}`);
  for (const k of REQUIS_ENVELOPPE) if (!(k in x)) err.push(`champ requis absent ${k}`);
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
  dansLaListe('sujet', x.sujet, SUJETS);
  dansLaListe('source.format', x.source.format, FORMATS);
  if (x.source.journal !== undefined) err.push('source.journal : absent, chaque registre est seul de son format dans une instance');
  if (!entier(x.source.numero)) err.push(`source.numero ${JSON.stringify(x.source.numero)} : un entier, à partir de 1`);
  if (x.precedent !== null && !chaine(x.precedent, EMPREINTE)) err.push('precedent : une empreinte SHA-256, ou null pour la première ligne');
  if (x.nature !== undefined) dansLaListe('nature', x.nature, NATURES);
  for (const k of ['profondeur', 'cible']) if (x[k] !== undefined) dansLaListe(k, x[k], LISTES[k]);
  if (x.invariant !== undefined && !chaine(x.invariant, INVARIANT)) err.push(`invariant « ${x.invariant} » : l'identifiant d'un invariant du dépôt, préfixé par sa spécification`);
  if (x.ancre !== undefined) {
    dansLaListe('ancre.nature', x.ancre.nature, LISTES.ancre);
    if (!chaine(x.ancre.ref, EMPREINTE) && !(x.ancre.nature === 'concept' && depart.has(x.ancre.ref))) err.push('ancre.ref : une empreinte salée, ou l\'identifiant d\'un concept du registre de départ');
  }
  if (x.preuve !== undefined) err.push('preuve : aucune correspondance de l\'orchestrateur n\'en porte');
  if (x.mesure !== undefined) err.push('mesure : aucune correspondance de l\'orchestrateur n\'en porte');
  if (x.decision !== undefined) {
    dansLaListe('decision.valeur', x.decision.valeur, LISTES.decision);
    if (!entier(x.decision.vise) || (entier(x.numero) && x.decision.vise >= x.numero)) err.push('decision.vise : le numéro d\'une enveloppe antérieure');
  }
  if (LISTES.ordre.includes(x.ordre) && LISTES.niveau.includes(x.niveau) && !NIVEAUX_DE[x.ordre].includes(x.niveau)) {
    err.push(`niveau ${x.niveau} avec l'ordre ${x.ordre} : N1 va avec OC1, N2 et N3 avec OC2, humain avec OC1 ou OC2, et aucun système n'émet OC3`);
  }
  return err;
}

// ---- Git ----

function git(projet, ...args) {
  return execFileSync('git', args, { cwd: projet, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
}

/** Répertoire Git commun du projet, partagé par ses worktrees ; null hors d'un dépôt Git. */
export function repertoireGitCommun(projet = '.') {
  const essayer = (...args) => {
    try {
      return git(projet, ...args).trim();
    } catch {
      return null;
    }
  };
  const absolu = essayer('rev-parse', '--path-format=absolute', '--git-common-dir');
  if (absolu && !absolu.includes('\n') && isAbsolute(absolu) && existsSync(absolu)) return absolu;
  const relatif = essayer('rev-parse', '--git-common-dir'); // Git antérieur à 2.31
  if (!relatif || relatif.includes('\n')) return null;
  const chemin = resolve(projet, relatif);
  return existsSync(chemin) ? chemin : null;
}

/** Contenu commité d'un fichier à une révision ; null s'il n'y est pas. */
function contenuA(projet, revision, chemin) {
  try {
    return git(projet, 'show', `${revision}:${chemin}`).replace(/^﻿/, '').replace(/\r\n/g, '\n');
  } catch {
    return null;
  }
}

const dateUtc = (secondes) => new Date(Number(secondes) * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z');

// ---- Registre des concepts : événements lus dans l'historique Git ----

const domaineDe = (id) => {
  const m = ID_CONCEPT.exec(id);
  return m ? m[1].toLowerCase().replace(/_/g, '-') : 'inconnu';
};

/** Entrées d'un état commité du registre des concepts, identifiant → statut ; null s'il est absent ou illisible. */
function registreA(projet, revision) {
  const texte = contenuA(projet, revision, CONCEPTS);
  if (texte === null) return null;
  try {
    const lu = JSON.parse(texte);
    if (!estObjet(lu) || !Array.isArray(lu.concepts)) return null;
    return new Map(lu.concepts.filter((c) => estObjet(c) && typeof c.id === 'string').map((c) => [c.id, c.status]));
  } catch {
    return null;
  }
}

/**
 * Le commit de second ordre est-il celui qui a ajouté l'entrée ? Le commit de la branche d'intégration apporte,
 * seul, ou avec la branche qu'il fusionne, les commits qui ont changé le registre depuis son premier parent : celui
 * qui ajoute l'entrée est le premier d'entre eux où elle figure, au statut `proposed`. Il est de second ordre quand
 * son message porte la marque `[É7-C7E]` (section 4 de l'orchestrateur).
 */
function ajouteeAuSecondOrdre(projet, commit, parent, id) {
  let apportes = [];
  try {
    apportes = git(projet, 'log', '--reverse', '--format=%H', parent ? `${parent}..${commit}` : commit, '--', CONCEPTS).split('\n').filter(Boolean);
  } catch {
    apportes = [];
  }
  const qui = apportes.find((k) => registreA(projet, k)?.get(id) === 'proposed') ?? commit;
  return git(projet, 'log', '-1', '--format=%B', qui).includes(SECOND_ORDRE);
}

/**
 * Événements du registre des concepts, dans l'ordre de l'historique : au premier parent de la branche courante, la
 * branche d'intégration du projet, chaque commit qui change le fichier, comparé au précédent état lisible, daté par
 * ce commit. Le premier état est la base : seules ses entrées `proposed` en sont des événements. Avertit d'un état
 * absent ou illisible, sans s'y arrêter.
 */
export function evenementsDesConcepts(projet) {
  const avertissements = [];
  let historique = '';
  try {
    historique = git(projet, 'log', '--first-parent', '--reverse', '--format=%H%x09%P%x09%ct', 'HEAD', '--', CONCEPTS);
  } catch {
    return { evenements: [], avertissements };
  }
  const evenements = [];
  let precedent = null;
  for (const ligne of historique.split('\n').filter(Boolean)) {
    const [commit, parents, secondes] = ligne.split('\t');
    const registre = registreA(projet, commit);
    if (registre === null) {
      avertissements.push(`${CONCEPTS} absent ou illisible au commit ${commit.slice(0, 12)} : cet état est ignoré`);
      continue;
    }
    const date = dateUtc(secondes);
    const parent = parents.split(' ').filter(Boolean)[0] ?? null;
    const ids = [...new Set([...registre.keys(), ...(precedent?.keys() ?? [])])].sort(parCodePoint);
    for (const id of ids) {
      const avant = precedent?.get(id);
      const apres = registre.get(id);
      if (avant === apres) continue;
      if (apres === undefined) evenements.push({ date, id, sorte: 'retrait', statut: 'retire' });
      else if (avant === undefined && apres === 'proposed') evenements.push({ date, id, sorte: 'proposition', statut: 'proposed', secondOrdre: ajouteeAuSecondOrdre(projet, commit, parent, id) });
      else if (avant === undefined && precedent === null) continue; // base : le registre de départ, ou l'état d'avant l'historique
      else evenements.push({ date, id, sorte: 'statut', statut: apres, avant: avant ?? null });
    }
    precedent = registre;
  }
  return { evenements: evenements.map((e, i) => ({ ...e, n: i + 1 })), avertissements };
}

const ORDRE_DES_STATUTS = ['proposed', 'experimental', 'validated'];

/** Enveloppe partielle d'un événement du registre des concepts (socle, section 6.3, précisée par le module observation). */
export function traduireConcept(e, { sel, depart, numeroDeProposition }) {
  const commun = {
    date: e.date, source: { format: FORMAT_CONCEPTS, numero: e.n }, cible: 'instance', motif: `concept-${domaineDe(e.id)}`,
    ancre: { nature: 'concept', ref: depart.has(e.id) ? e.id : empreinteSalee(sel, e.id) },
  };
  if (e.sorte === 'proposition') {
    return { ...commun, ordre: 'OC2', niveau: e.secondOrdre ? 'N2' : 'humain', type: 'proposition', sujet: e.secondOrdre ? SUJET_AGENT : 'developpeur', nature: 'proposed' };
  }
  const vise = numeroDeProposition(e.id);
  const valeur = e.sorte === 'retrait' ? 'refusee'
    : ORDRE_DES_STATUTS.indexOf(e.statut) > ORDRE_DES_STATUTS.indexOf(e.avant ?? 'proposed') ? 'retenue' : 'amendee';
  return { ...commun, ordre: 'OC2', niveau: 'humain', type: 'decision', sujet: 'referent', nature: e.statut, ...(vise ? { decision: { valeur, vise } } : {}) };
}

// ---- Registre des écarts : lignes décidées ----

/**
 * Lignes du tableau du registre des écarts, celui dont l'en-tête commence par Date et Ticket, hors la ligne
 * d'exemple du modèle, numérotées dans leur ordre : le rang d'une ligne est son numéro.
 */
export function lignesDesEcarts(texte) {
  if (texte === null) return [];
  const cellules = (l) => l.trim().replace(/^\|/, '').replace(/(?<!\\)\|$/, '').split(/(?<!\\)\|/).map((c) => c.trim());
  const lignes = texte.split('\n');
  const iEntete = lignes.findIndex((l) => /^\s*\|\s*Date\s*\|\s*Ticket\s*\|/.test(l));
  if (iEntete === -1) return [];
  const tableau = [];
  for (const l of lignes.slice(iEntete + 1)) {
    if (!l.trim().startsWith('|')) break;
    if (!/^\|[\s|:-]+\|$/.test(l.trim())) tableau.push(cellules(l));
  }
  return tableau
    .filter((c) => c[1] !== LIGNE_D_EXEMPLE)
    .map((c, i) => ({ n: i + 1, date: c[0] ?? '', ticket: c[1] ?? '', invariant: c[2] ?? '', decision: c[4] ?? '' }));
}

const PREFIXE_PAR_DEFAUT = { D: SYSTEME, SC: 'socle-back-front', SO: 'socle-observation' };

/** Invariant du dépôt que cite une cellule, préfixé par sa spécification ; null pour un invariant du projet. */
function invariantCite(cellule, invariants) {
  const m = /(?:([a-z][a-z0-9-]*):)?((D|SC|SO)\d+\.INV-\d+)/.exec(cellule);
  if (!m) return null;
  const id = `${m[1] ?? PREFIXE_PAR_DEFAUT[m[3]]}:${m[2]}`;
  return invariants.has(id) ? id : null;
}

/** Sorte d'une décision : `respecter`, `derogation` validée par un nom, ou null tant que la ligne n'est pas décidée. */
const sorteDeDecision = (decision) => {
  const d = decision.toLowerCase();
  if (/^respecter\b/.test(d)) return 'respecter';
  if (/^d[ée]rogation\s+valid[ée]e\s+par\s+\S/.test(d)) return 'derogation';
  return null;
};

/** Enveloppe partielle d'une ligne décidée du registre des écarts (socle, section 6.4) ; null si elle attend sa décision. */
export function traduireEcart(l, { sel, invariants }) {
  const sorte = sorteDeDecision(l.decision);
  if (!sorte) return null;
  if (!JOUR.test(l.date)) throw new Error(`date « ${l.date} » : AAAA-MM-JJ`);
  if (!l.ticket) throw new Error('ticket absent');
  const invariant = invariantCite(l.invariant, invariants);
  const commun = {
    date: `${l.date}T00:00:00Z`, source: { format: FORMAT_ECARTS, numero: l.n }, cible: 'instance', nature: sorte,
    motif: invariant ? `ecart-${invariant.toLowerCase().replace(/[:.]/g, '-')}` : 'ecart-invariant-projet',
    ancre: { nature: 'ticket', ref: empreinteSalee(sel, l.ticket) }, ...(invariant ? { invariant } : {}),
  };
  return sorte === 'respecter'
    ? { ...commun, ordre: 'OC1', niveau: 'N1', type: 'ecart', sujet: SUJET_AGENT }
    : { ...commun, ordre: 'OC1', niveau: 'humain', type: 'derogation', sujet: 'referent' };
}

// ---- Journal d'enveloppes ----

export function lireJournal(projet = '.', journal = JOURNAL) {
  const lignes = lignesDe(join(projet, journal));
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
 * Écarts du journal (SO1, SO2) : lignes lisibles, canoniques et au schéma fermé, numéros consécutifs, dates dans
 * l'ordre, chaîne d'empreintes, une seule instance, tête qui désigne la dernière ligne ; avec le sel, l'instance
 * doit être la sienne.
 */
export function verifierJournal(projet = '.', { sel = null } = {}) {
  const { lignes, enveloppes } = lireJournal(projet);
  const depart = conceptsDeDepart();
  const erreurs = [];
  lignes.forEach((ligne, i) => {
    const x = enveloppes[i];
    const nom = `ligne ${i + 1}`;
    if (!x) {
      erreurs.push(`${nom} : JSON illisible`);
      return;
    }
    erreurs.push(...controlerEnveloppe(x, { depart }).map((e) => `${nom} : ${e}`));
    if (ligneDe(x) !== ligne) erreurs.push(`${nom} : ligne non canonique, écrite hors de l'export`);
    if (x.numero !== i + 1) erreurs.push(`${nom} : numéro ${x.numero}, attendu ${i + 1} : ligne insérée ou supprimée`);
    if (x.precedent !== (i === 0 ? null : sha256(lignes[i - 1]))) erreurs.push(`${nom} : empreinte du précédent fausse, la ligne ${i} a été réécrite, insérée ou supprimée`);
    const avant = enveloppes[i - 1];
    if (avant && String(x.date) < String(avant.date)) erreurs.push(`${nom} : date ${x.date} antérieure à celle de la ligne ${i}`);
    if (enveloppes[0] && x.instance !== enveloppes[0].instance) erreurs.push(`${nom} : instance différente de celle de la ligne 1`);
  });
  if (sel && enveloppes[0] && enveloppes[0].instance !== sha256(sel)) erreurs.push('le sel de ce clone n\'est pas celui de l\'instance du journal');
  const tete = lireJson(join(projet, TETE));
  if (lignes.length > 0) {
    if (!tete) erreurs.push(`${TETE} absente`);
    else if (tete.illisible) erreurs.push(`${TETE} illisible`);
    else if (tete.schema !== SCHEMA || tete.numero !== lignes.length) erreurs.push(`${TETE} annonce la ligne ${tete.numero}, le journal s'arrête à la ligne ${lignes.length} : lignes supprimées ou ajoutées hors de l'export`);
    else if (tete.empreinte !== sha256(lignes.at(-1))) erreurs.push(`${TETE} : la dernière ligne, n° ${lignes.length}, a été réécrite`);
  } else if (tete) erreurs.push(`${TETE} présente pour un journal vide`);
  return [...new Set(erreurs)];
}

/** Journaux d'enveloppes du projet, de tous ses systèmes : `docs/c7e/observations*.jsonl`. */
function journauxDuProjet(projet) {
  const dossier = join(projet, 'docs', 'c7e');
  return existsSync(dossier) ? readdirSync(dossier).filter((n) => /^observations.*\.jsonl$/.test(n)).sort(parCodePoint).map((n) => `docs/c7e/${n}`) : [];
}

// ---- Sel de l'instance ----

/** Sel de l'instance, s'il a été tiré, et son emplacement ; le sel n'est jamais affiché ni exporté. */
export function lireSel(projet = '.') {
  const commun = repertoireGitCommun(projet);
  if (!commun) return { erreur: `${projet} n'est pas dans un dépôt Git : l'export de l'orchestrateur lit l'historique du projet, et le sel de l'instance se garde dans son répertoire Git commun` };
  const chemin = join(commun, SEL);
  if (!existsSync(chemin)) return { chemin, sel: null };
  const sel = readFileSync(chemin, 'utf8').trim();
  return EMPREINTE.test(sel) ? { chemin, sel } : { erreur: `sel de l'instance illisible dans <git-common-dir>/${SEL} : 64 caractères hexadécimaux attendus` };
}

// ---- Export ----

const refus = (erreurs) => ({ erreurs, avertissements: [], ajoutees: 0, total: null, selTire: false });

/** Sources traduites : événements des concepts, puis lignes des écarts, chacune avec sa clé de source. */
function sourcesTraduites(projet, sel, { depart, invariants, numeros }) {
  const erreurs = [];
  const { evenements, avertissements } = evenementsDesConcepts(projet);
  const propositions = new Map();
  const concepts = [];
  for (const e of evenements) {
    const cle = cleSource({ format: FORMAT_CONCEPTS, numero: e.n });
    // La proposition que vise une décision est la dernière proposition de l'entrée avant elle.
    const visee = e.sorte === 'proposition' ? null : propositions.get(e.id) ?? null;
    if (e.sorte === 'proposition') propositions.set(e.id, cle);
    const numeroDeProposition = () => (visee ? numeros.get(visee) ?? null : null);
    concepts.push({ cle, e, traduire: () => traduireConcept(e, { sel, depart, numeroDeProposition }) });
  }
  const ecarts = [];
  for (const l of lignesDesEcarts(contenuA(projet, 'HEAD', ECARTS))) {
    let partielle;
    try {
      partielle = traduireEcart(l, { sel, invariants });
    } catch (x) {
      erreurs.push(`${ECARTS}, ligne ${l.n} : ${x.message}`);
      continue;
    }
    if (partielle) ecarts.push({ cle: cleSource(partielle.source), e: l, traduire: () => partielle });
  }
  return { erreurs, avertissements, concepts, ecarts };
}

const empreinteDeTraduction = (x) => JSON.stringify([x.type, x.nature, x.motif, x.niveau, x.sujet, x.invariant ?? null, x.ancre?.ref ?? null, x.decision?.valeur ?? null]);

/**
 * Exporte les enregistrements nouveaux des deux registres ; renvoie { erreurs, avertissements, ajoutees, total,
 * selTire }. Tout ou rien : un journal altéré, une source réécrite depuis son export, un sel absent alors qu'un
 * journal d'enveloppes du projet existe, un sel étranger à l'un d'eux, une enveloppe mal formée arrêtent l'export,
 * et rien n'est écrit. Les options `sel` et `version` ne servent qu'aux tests.
 */
export function exporter({ projet = '.', sel, version = versionDuSysteme(), depot = RACINE } = {}) {
  const alteration = verifierJournal(projet);
  if (alteration.length > 0) return refus(alteration.map((e) => `journal altéré, ${e} : rien n'est exporté`));
  const { lignes, enveloppes } = lireJournal(projet);
  let chemin = null;
  let selTire = false;
  const autres = journauxDuProjet(projet).filter((j) => lireJournal(projet, j).lignes.length > 0);
  if (sel === undefined) {
    const lu = lireSel(projet);
    if (lu.erreur) return refus([lu.erreur]);
    ({ chemin, sel } = lu);
    if (sel === null) {
      if (autres.length > 0) return refus([`sel de l'instance absent de <git-common-dir>/${SEL} alors que ${autres.join(', ')} existe : un nouveau sel changerait l'identité de l'instance au milieu de ses journaux ; recopie dans ce clone, à cet emplacement, le sel du clone qui les a commencés`]);
      sel = randomBytes(32).toString('hex');
      selTire = true;
    }
  } else if (repertoireGitCommun(projet) === null) return refus([`${projet} n'est pas dans un dépôt Git : l'export de l'orchestrateur lit l'historique du projet`]);
  const instance = sha256(sel);
  for (const j of autres) {
    const premiere = lireJournal(projet, j).enveloppes[0];
    if (premiere && premiere.instance !== instance) return refus([`le sel de ce clone n'est pas celui de l'instance du journal ${j} : rien n'est exporté`]);
  }

  const depart = conceptsDeDepart();
  const invariants = invariantsDuDepot(depot);
  const numeros = new Map(enveloppes.map((x) => [cleSource(x.source), x.numero]));
  const deja = new Map(enveloppes.map((x) => [cleSource(x.source), x]));
  const sources = sourcesTraduites(projet, sel, { depart, invariants, numeros });
  if (sources.erreurs.length > 0) return { ...refus(sources.erreurs.map((e) => `source illisible, ${e} : rien n'est exporté`)), avertissements: sources.avertissements };

  // Une source déjà exportée doit se traduire comme à son export : sinon elle a été réécrite depuis.
  const reecritures = [];
  const presentes = new Set();
  for (const s of [...sources.concepts, ...sources.ecarts]) {
    presentes.add(s.cle);
    const exportee = deja.get(s.cle);
    if (exportee && empreinteDeTraduction(s.traduire()) !== empreinteDeTraduction(exportee)) reecritures.push(s);
  }
  for (const [cle, x] of deja) if (!presentes.has(cle)) reecritures.push({ cle, e: { n: x.source.numero }, absente: true, format: x.source.format });
  if (reecritures.length > 0) {
    return refus(reecritures.map((s) => (s.cle.startsWith(FORMAT_ECARTS)
      ? `${ECARTS} réécrit : la ligne ${s.e.n} a changé depuis son export, ou n'est plus décidée : rien n'est exporté ; rétablis-la telle qu'elle a été exportée, une décision nouvelle s'inscrit sur une ligne nouvelle`
      : `historique de ${CONCEPTS} réécrit, ou export lancé depuis une autre branche que celle de l'intégration : l'événement ${s.e.n} n'est plus celui qui a été exporté : rien n'est exporté`)));
  }

  // Fusion des deux registres par date, sans changer l'ordre d'un même registre ; à date égale, les concepts d'abord.
  const files = [sources.concepts.filter((s) => !deja.has(s.cle)), sources.ecarts.filter((s) => !deja.has(s.cle))];
  const positions = [0, 0];
  const ordre = [];
  for (;;) {
    let k = -1;
    files.forEach((f, i) => {
      const s = f[positions[i]];
      if (s && (k === -1 || String(s.e.date) < String(files[k][positions[k]].e.date))) k = i;
    });
    if (k === -1) break;
    ordre.push(files[k][positions[k]++]);
  }
  if (ordre.length === 0) return { erreurs: [], avertissements: sources.avertissements, ajoutees: 0, total: lignes.length, selTire: false };

  const erreurs = [];
  const ajout = [];
  let precedent = lignes.length > 0 ? sha256(lignes.at(-1)) : null;
  let derniere = enveloppes.at(-1)?.date ?? null;
  for (const s of ordre) {
    const numero = lignes.length + ajout.length + 1;
    const partielle = s.traduire();
    const date = derniere !== null && String(partielle.date) < derniere ? derniere : partielle.date;
    const enveloppe = { schema: SCHEMA, numero, systeme: { nom: SYSTEME, version }, instance, ...partielle, date, precedent };
    const ecarts = controlerEnveloppe(enveloppe, { depart });
    if (ecarts.length > 0) {
      erreurs.push(...ecarts.map((x) => `${s.cle.startsWith(FORMAT_ECARTS) ? `${ECARTS}, ligne` : `${CONCEPTS}, événement`} ${s.e.n} : ${x}`));
      continue;
    }
    const ligne = ligneDe(enveloppe);
    ajout.push(ligne);
    numeros.set(s.cle, numero);
    precedent = sha256(ligne);
    derniere = date;
  }
  if (erreurs.length > 0) return { ...refus(erreurs.map((x) => `enveloppe refusée, ${x} : rien n'est écrit`)), avertissements: sources.avertissements };

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
  return { erreurs: [], avertissements: sources.avertissements, ajoutees: ajout.length, total: lignes.length + ajout.length, selTire };
}

// ---- État ----

/** Enveloppes du journal par type, par ordre et niveau, par sujet ; enregistrements en attente. */
export function etat(projet = '.') {
  const lu = lireSel(projet);
  const verification = verifierJournal(projet, { sel: lu.sel ?? null });
  const { enveloppes } = lireJournal(projet);
  const compter = (cle) => {
    const res = {};
    for (const x of enveloppes.filter(Boolean)) res[cle(x)] = (res[cle(x)] ?? 0) + 1;
    return res;
  };
  let enAttente = null;
  if (!lu.erreur && (lu.sel || enveloppes.length === 0)) {
    const exportees = new Set(enveloppes.filter(Boolean).map((x) => cleSource(x.source)));
    const sources = sourcesTraduites(projet, lu.sel ?? '', { depart: conceptsDeDepart(), invariants: invariantsDuDepot(), numeros: new Map() });
    enAttente = [...sources.concepts, ...sources.ecarts].filter((s) => !exportees.has(s.cle)).length;
  }
  return {
    journal: JOURNAL,
    enveloppes: enveloppes.length,
    derniere: enveloppes.at(-1)?.date ?? null,
    parType: compter((x) => x.type),
    parOrdreEtNiveau: compter((x) => `${x.ordre} ${x.niveau}`),
    parSujet: compter((x) => x.sujet),
    enAttente,
    verification,
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
    for (const a of r.avertissements) erreur(`ATTENTION  ${a}`);
    if (r.erreurs.length > 0) {
      for (const e of r.erreurs) erreur(`REFUS  ${e}`);
      return 1;
    }
    if (r.selTire) sortie(`sel de l'instance tiré et gardé dans <git-common-dir>/${SEL}, hors de l'arbre de travail : ni versionné ni exporté ; un autre clone du projet en aura besoin pour continuer ses journaux`);
    sortie(r.ajoutees === 0
      ? `aucun enregistrement nouveau : ${JOURNAL} inchangé, ${pluriel(r.total, 'enveloppe')}`
      : `${pluriel(r.ajoutees, 'enveloppe')} ajoutée${r.ajoutees > 1 ? 's' : ''} à ${JOURNAL}, ${r.total} en tout ; à versionner avec ${TETE}`);
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
      sortie(`en attente d'export : ${e.enAttente ?? 'inconnu, sans le sel de l\'instance'}`);
      for (const v of e.verification) erreur(`ALTÉRÉ  ${v}`);
    }
    return e.verification.length > 0 ? 1 : 0;
  }
  erreur(USAGE);
  return 2;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exitCode = principal(process.argv.slice(2));
