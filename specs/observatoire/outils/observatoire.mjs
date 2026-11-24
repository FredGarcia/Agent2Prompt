#!/usr/bin/env node
// Observatoire de l'écosystème Agent2Prompt (observatoire 1.1.0) : le premier couplage du troisième ordre,
// entre systèmes (EVOLUTION.md, section 10.3). Il se lance depuis le clone du dépôt, sur le poste.
//
// Il relève, vérifiés selon le socle d'observation, les journaux d'enveloppes des projets inscrits, un par
// système qui exporte, dans un magasin local, gardé dans le répertoire Git commun du clone,
// <git-common-dir>/agent2prompt/observatoire/ : jamais versionné, publié ni exporté. Il les confronte entre
// instances, et entre systèmes par les invariants du dépôt que citent leurs écarts, observe l'état de l'écosystème,
// écrit des propositions minimisées dans observatoire/propositions/, que le développeur apporte au dépôt par
// une pull request, et suit l'effet de celles que la ratification a fait entrer dans une version. Il propose
// et n'applique jamais : il ne modifie aucune spécification, ne commite ni ne publie.
//
// Usage, depuis le clone :
//   node specs/observatoire/outils/observatoire.mjs inscrire --projet <dossier>
//   node specs/observatoire/outils/observatoire.mjs relever
//   node specs/observatoire/outils/observatoire.mjs etat [--json]
//   node specs/observatoire/outils/observatoire.mjs confronter [--json]
//   node specs/observatoire/outils/observatoire.mjs proposer [--date AAAA-MM-JJ]
//   node specs/observatoire/outils/observatoire.mjs suivre [--json]
//   node specs/observatoire/outils/observatoire.mjs verifier
// etat, confronter, proposer et suivre relèvent d'abord les projets inscrits. Codes de sortie : 0 ; 1 pour un
// refus, un journal altéré ou un magasin altéré ; 2 pour un usage incorrect. Node 20 ou plus récent, modules
// natifs uniquement.

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SCHEMA = 'socle-observation.enveloppe/1';
export const FORMAT_PROJETS = 'observatoire.projets/1';
export const FORMAT_PROPOSITION = 'observatoire.proposition/1';
// Journaux d'enveloppes d'un projet, un par système qui exporte : le générateur de skills de ticket, l'orchestrateur C7E.
export const JOURNAUX = ['docs/c7e/observations.jsonl', 'docs/c7e/observations-orchestrateur-c7e.jsonl'];
export const PROPOSITIONS = 'observatoire/propositions';
export const MAGASIN = 'agent2prompt/observatoire'; // sous le répertoire Git commun du clone
export const SEUIL_INSTANCES = 2; // une récurrence : au moins deux instances distinctes
export const SEUIL_ENVELOPPES = 20; // un effet : au moins vingt enveloppes du système de part et d'autre de la version
// Motifs que les correspondances donnent faute de motif propre, et verdicts qui ne signalent rien : ni l'un
// ni l'autre ne fait une récurrence.
export const MOTIFS_GENERIQUES = ['conforme', 'ecart', 'correction', 'choix', 'proposition', 'ratifie', 'non-ratifie', 'fondee', 'infondee', 'veille', 'bilan', 'ecart-invariant-projet'];
const NATURES_NEUTRES = ['conforme', 'fondee', 'infondee', 'bilan'];
const TYPES_ECART = ['ecart', 'derogation']; // ce qui cite un invariant du dépôt dans la confrontation entre systèmes
const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

// ---- Schéma fermé de l'enveloppe (socle, section 3), pour tout système qui exporte ----

export const CHAMPS_ENVELOPPE = ['schema', 'numero', 'date', 'systeme', 'instance', 'ordre', 'niveau', 'type', 'motif', 'sujet', 'source', 'precedent', 'nature', 'profondeur', 'cible', 'invariant', 'ancre', 'preuve', 'decision'];
export const REQUIS_ENVELOPPE = CHAMPS_ENVELOPPE.slice(0, CHAMPS_ENVELOPPE.indexOf('precedent') + 1);
const CHAMPS = CHAMPS_ENVELOPPE;
const REQUIS = REQUIS_ENVELOPPE;
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
const PREUVES_NUMEROS = ['enregistrements', 'champ'];
// Niveaux admis avec chaque ordre (socle, section 3.2) : aucun système n'émet OC3, réservé à l'écosystème.
const NIVEAUX_DE = { OC1: ['N1', 'humain'], OC2: ['N2', 'N3', 'humain'], OC3: [] };

const MOTIF = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const JOUR = /^\d{4}-\d{2}-\d{2}$/;
const EMPREINTE = /^[0-9a-f]{64}$/;
const NUMEROS = /^[1-9]\d*(?:,[1-9]\d*)*$/;
const INVARIANT = /^[a-z][a-z0-9-]*:(?:D|SC|SO)\d+\.INV-\d+$/;
const AGENT = /^agent:[a-z][a-z0-9-]*$/;
const NOM = /^[a-z][a-z0-9-]*$/;
const VERSION = /^\d+\.\d+\.\d+$/;
const FORMAT_SOURCE = /^[a-z0-9][a-z0-9.-]*\/\d+$/;
// Référence tronquée d'une enveloppe : son instance, le système qui l'exporte quand une proposition en réunit
// plusieurs, son numéro dans le journal de ce système.
const REFERENCE = /^[0-9a-f]{8}:[1-9]\d*$/;
const REFERENCE_SYSTEME = /^[0-9a-f]{8}:[a-z][a-z0-9-]*:[1-9]\d*$/;
const ID_CONCEPT = /^C_[A-Z0-9]+(?:_[A-Z0-9]+)*_\d{3}$/; // concept du registre de départ de l'orchestrateur
const DEFINITION = /\*\*((?:D|SC|SO)\d+\.INV-\d+)\*\*/g;

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
const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;
const teteDe = (journal) => journal.replace(/\.jsonl$/, '.tete');
const court = (instance) => instance.slice(0, 8);
export const sha256 = (texte) => createHash('sha256').update(texte, 'utf8').digest('hex');

/** Comparaison de deux versions x.y.z. */
export function comparerVersions(a, b) {
  const [x, y] = [a, b].map((v) => v.split('.').map(Number));
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  return 0;
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

/**
 * Écarts d'une enveloppe au socle : schéma fermé et listes (SO1.INV-1), ordres et niveaux (SO1.INV-2),
 * minimisation (SO3.INV-1, SO3.INV-2). La règle vaut pour tout système qui exporte : un format source, une
 * nature, se reconnaissent à leur forme ; une référence est une empreinte, des numéros, ou l'identifiant
 * d'un concept, C_<DOMAINE>_<NNN>, seul défini par une spécification du dépôt.
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
  if (!chaine(x.systeme.nom, NOM)) err.push(`systeme.nom « ${x.systeme.nom} » : le nom d'une spécification`);
  if (!chaine(x.systeme.version, VERSION)) err.push(`systeme.version « ${x.systeme.version} » : une version x.y.z`);
  if (!chaine(x.instance, EMPREINTE)) err.push('instance : l\'empreinte SHA-256 du sel de l\'instance');
  for (const k of ['ordre', 'niveau', 'type']) dansLaListe(k, x[k], LISTES[k]);
  if (!chaine(x.motif, MOTIF)) err.push(`motif « ${x.motif} » : minuscules et tirets`);
  if (!SUJETS.includes(x.sujet) && !chaine(x.sujet, AGENT)) err.push(`sujet « ${x.sujet} » : un rôle, ${SUJETS.join(', ')} ou agent:<spécification>`);
  if (!chaine(x.source.format, FORMAT_SOURCE)) err.push(`source.format « ${x.source.format} » : le nom d'un format, suivi de sa version`);
  if (x.source.journal !== undefined && !chaine(x.source.journal, EMPREINTE)) err.push('source.journal : une empreinte salée');
  if (!entier(x.source.numero)) err.push(`source.numero ${JSON.stringify(x.source.numero)} : un entier, à partir de 1`);
  if (x.precedent !== null && !chaine(x.precedent, EMPREINTE)) err.push('precedent : une empreinte SHA-256, ou null pour la première ligne');
  if (x.nature !== undefined && !chaine(x.nature, MOTIF)) err.push(`nature « ${x.nature} » : une valeur de la liste du format source`);
  for (const k of ['profondeur', 'cible']) if (x[k] !== undefined) dansLaListe(k, x[k], LISTES[k]);
  if (x.invariant !== undefined && !chaine(x.invariant, INVARIANT)) err.push(`invariant « ${x.invariant} » : l'identifiant d'un invariant du dépôt, préfixé par sa spécification`);
  if (x.ancre !== undefined) {
    dansLaListe('ancre.nature', x.ancre.nature, LISTES.ancre);
    if (!chaine(x.ancre.ref, EMPREINTE) && !(x.ancre.nature === 'concept' && chaine(x.ancre.ref, ID_CONCEPT))) err.push('ancre.ref : une empreinte salée, ou l\'identifiant d\'un concept, C_<DOMAINE>_<NNN>');
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

/**
 * Écarts d'un journal d'enveloppes au socle (SO1, SO2) : lignes lisibles, canoniques et au schéma fermé,
 * numéros consécutifs, dates dans l'ordre, chaîne d'empreintes, une seule instance, tête qui désigne la
 * dernière ligne.
 */
export function verifierJournal(lignes, tete) {
  const erreurs = [];
  const enveloppes = lignes.map((l) => {
    try {
      const x = JSON.parse(l);
      return estObjet(x) ? x : null;
    } catch {
      return null;
    }
  });
  lignes.forEach((ligne, i) => {
    const x = enveloppes[i];
    const nom = `ligne ${i + 1}`;
    if (!x) {
      erreurs.push(`${nom} : JSON illisible`);
      return;
    }
    erreurs.push(...controlerEnveloppe(x).map((e) => `${nom} : ${e}`));
    if (JSON.stringify(canonique(x)) !== ligne) erreurs.push(`${nom} : ligne non canonique, écrite hors de l'export`);
    if (x.numero !== i + 1) erreurs.push(`${nom} : numéro ${x.numero}, attendu ${i + 1} : ligne insérée ou supprimée`);
    if (x.precedent !== (i === 0 ? null : sha256(lignes[i - 1]))) erreurs.push(`${nom} : empreinte du précédent fausse, la ligne ${i} a été réécrite, insérée ou supprimée`);
    const avant = enveloppes[i - 1];
    if (avant && String(x.date) < String(avant.date)) erreurs.push(`${nom} : date ${x.date} antérieure à celle de la ligne ${i}`);
    if (enveloppes[0] && x.instance !== enveloppes[0].instance) erreurs.push(`${nom} : instance différente de celle de la ligne 1`);
  });
  if (lignes.length > 0) {
    if (!tete) erreurs.push('tête absente');
    else if (tete.illisible) erreurs.push('tête illisible');
    else if (tete.schema !== SCHEMA || tete.numero !== lignes.length) erreurs.push(`la tête annonce la ligne ${tete.numero}, le journal s'arrête à la ligne ${lignes.length} : lignes supprimées ou ajoutées hors de l'export`);
    else if (tete.empreinte !== sha256(lignes.at(-1))) erreurs.push(`la dernière ligne, n° ${lignes.length}, a été réécrite`);
  } else if (tete) erreurs.push('tête présente pour un journal vide');
  return { erreurs: [...new Set(erreurs)], enveloppes };
}

// ---- Dépôt : systèmes et versions connus ----

/** Spécifications du dépôt : nom → version courante et versions publiées, archives comprises. */
export function systemesConnus(depot = RACINE) {
  const connus = new Map();
  const specs = join(depot, 'specs');
  if (!existsSync(specs)) return connus;
  for (const d of readdirSync(specs, { withFileTypes: true })) {
    const manifeste = lireJson(join(specs, d.name, 'manifest.json'));
    if (!d.isDirectory() || !manifeste || manifeste.illisible || !chaine(manifeste.version, VERSION)) continue;
    const versions = new Set([manifeste.version, ...(manifeste.previousVersions ?? []).map((p) => p.version)]);
    connus.set(manifeste.name ?? d.name, { courante: manifeste.version, versions });
  }
  return connus;
}

/** Invariants que définissent les spécifications du dépôt, préfixés par leur nom : `java:D4.INV-1`. */
export function invariantsDuDepot(depot = RACINE) {
  const ids = new Set();
  const specs = join(depot, 'specs');
  if (!existsSync(specs)) return ids;
  for (const d of readdirSync(specs, { withFileTypes: true })) {
    const entree = join(specs, d.name, 'SKILL.md');
    if (!d.isDirectory() || !existsSync(entree)) continue;
    for (const [, id] of lire(entree).matchAll(DEFINITION)) ids.add(`${d.name}:${id}`);
  }
  return ids;
}

// ---- Magasin local ----

/** Répertoire Git commun d'un dossier, partagé par ses worktrees ; null hors d'un dépôt Git. */
export function repertoireGitCommun(dossier) {
  const git = (...args) => {
    try {
      return execFileSync('git', args, { cwd: dossier, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
      return null;
    }
  };
  const absolu = git('rev-parse', '--path-format=absolute', '--git-common-dir');
  if (absolu && !absolu.includes('\n') && isAbsolute(absolu) && existsSync(absolu)) return absolu;
  const relatif = git('rev-parse', '--git-common-dir'); // Git antérieur à 2.31
  if (!relatif || relatif.includes('\n')) return null;
  const chemin = resolve(dossier, relatif);
  return existsSync(chemin) ? chemin : null;
}

/** Magasin de l'observatoire : sous le répertoire Git commun du clone d'Agent2Prompt, hors de tout arbre de travail. */
export function magasinParDefaut(depot = RACINE) {
  const commun = repertoireGitCommun(depot);
  return commun ? join(commun, MAGASIN) : null;
}

const SANS_MAGASIN = 'le clone d\'Agent2Prompt n\'est pas un dépôt Git : le magasin de l\'observatoire se garde dans son répertoire Git commun';

function lireProjets(magasin) {
  if (!magasin) return { erreur: SANS_MAGASIN, projets: [] };
  const lu = lireJson(join(magasin, 'projets.json'));
  if (lu === null) return { projets: [] };
  if (lu.illisible || lu.format !== FORMAT_PROJETS || !Array.isArray(lu.projets)) return { erreur: `projets.json du magasin illisible : format ${FORMAT_PROJETS} attendu`, projets: [] };
  return { projets: lu.projets };
}

function ecrireProjets(magasin, projets) {
  mkdirSync(magasin, { recursive: true });
  const tries = [...projets].sort((a, b) => parCodePoint(a.chemin, b.chemin));
  writeFileSync(join(magasin, 'projets.json'), `${JSON.stringify({ format: FORMAT_PROJETS, projets: tries }, null, 2)}\n`);
}

const miroirDe = (magasin, instance, journal) => join(magasin, 'instances', instance, basename(journal));

/** Journaux d'enveloppes d'un projet, lus et vérifiés. */
function lireJournauxDuProjet(projet) {
  return JOURNAUX.map((journal) => {
    const lignes = lignesDe(join(projet, journal));
    const { erreurs, enveloppes } = verifierJournal(lignes, lireJson(join(projet, teteDe(journal))));
    return { journal, lignes, enveloppes, erreurs };
  });
}

/** Écarts du magasin : registre des projets, et chaque miroir vérifié comme un journal (D1.INV-2). */
export function verifierMagasin(magasin) {
  if (!magasin) return [SANS_MAGASIN];
  const erreurs = [];
  const { erreur, projets } = lireProjets(magasin);
  if (erreur) erreurs.push(erreur);
  for (const p of projets) {
    if (!estObjet(p) || typeof p.chemin !== 'string' || !isAbsolute(p.chemin) || !chaine(p.instance, EMPREINTE)) erreurs.push(`projets.json : inscription mal formée ${JSON.stringify(p)}`);
  }
  const instances = join(magasin, 'instances');
  if (existsSync(instances)) {
    for (const d of readdirSync(instances, { withFileTypes: true }).filter((e) => e.isDirectory()).sort((a, b) => parCodePoint(a.name, b.name))) {
      for (const nom of readdirSync(join(instances, d.name)).filter((n) => n.endsWith('.jsonl')).sort(parCodePoint)) {
        const chemin = join(instances, d.name, nom);
        const lignes = lignesDe(chemin);
        const { erreurs: ecarts, enveloppes } = verifierJournal(lignes, lireJson(teteDe(chemin)));
        erreurs.push(...ecarts.map((e) => `miroir ${court(d.name)}/${nom}, ${e}`));
        if (enveloppes[0] && enveloppes[0].instance !== d.name) erreurs.push(`miroir ${court(d.name)}/${nom} : ses enveloppes sont d'une autre instance`);
      }
    }
  }
  return erreurs;
}

// ---- D1 : inscription et relevé ----

/** Inscrit un projet par son chemin ; son instance est celle de son journal d'enveloppes, vérifié. */
export function inscrire(projet, { magasin = magasinParDefaut() } = {}) {
  if (!magasin) return { erreurs: [SANS_MAGASIN] };
  const chemin = resolve(projet);
  const presents = lireJournauxDuProjet(chemin).filter((j) => j.lignes.length > 0);
  if (presents.length === 0) return { erreurs: [`${chemin} : aucun journal d'enveloppes (${JOURNAUX.join(', ')}) ; l'export de ses systèmes vient d'abord`] };
  const erreurs = presents.flatMap((j) => j.erreurs.map((e) => `${j.journal} altéré, ${e} : le projet n'est pas inscrit`));
  if (erreurs.length > 0) return { erreurs };
  const instance = presents[0].enveloppes[0].instance;
  if (presents.some((j) => j.enveloppes[0].instance !== instance)) return { erreurs: [`${chemin} : ses journaux viennent d'instances différentes`] };
  const lu = lireProjets(magasin);
  if (lu.erreur) return { erreurs: [lu.erreur] };
  const deja = lu.projets.find((p) => p.chemin === chemin);
  if (deja) return deja.instance === instance ? { erreurs: [], instance, deja: true } : { erreurs: [`${chemin} : son instance a changé depuis son inscription ; un nouveau sel fait une nouvelle instance, à inscrire depuis un autre dossier`] };
  ecrireProjets(magasin, [...lu.projets, { chemin, instance }]);
  return { erreurs: [], instance, deja: false };
}

/**
 * Relève les journaux des projets inscrits dans leurs miroirs, en ajout seul. Un journal altéré, ou réécrit
 * depuis le dernier relevé, est refusé et son miroir reste tel quel ; un projet introuvable garde son miroir.
 */
export function relever({ magasin = magasinParDefaut() } = {}) {
  const lu = lireProjets(magasin);
  if (lu.erreur) return { erreurs: [lu.erreur], avertissements: [], releves: [] };
  const alterations = verifierMagasin(magasin);
  if (alterations.length > 0) return { erreurs: alterations.map((e) => `magasin altéré, ${e} : rien n'est relevé`), avertissements: [], releves: [], altere: true };
  const erreurs = [];
  const avertissements = [];
  const releves = [];
  for (const p of lu.projets) {
    if (!existsSync(p.chemin)) {
      avertissements.push(`${p.chemin} : projet introuvable, son miroir reste tel quel`);
      continue;
    }
    for (const j of lireJournauxDuProjet(p.chemin)) {
      if (j.lignes.length === 0) continue;
      const nom = `${p.chemin}, ${j.journal}`;
      if (j.erreurs.length > 0) {
        erreurs.push(...j.erreurs.map((e) => `${nom} altéré, ${e} : son miroir reste tel quel`));
        continue;
      }
      const instance = j.enveloppes[0].instance;
      if (instance !== p.instance) {
        erreurs.push(`${nom} : instance changée depuis l'inscription : son miroir reste tel quel`);
        continue;
      }
      const chemin = miroirDe(magasin, instance, j.journal);
      const miroir = lignesDe(chemin);
      const commun = Math.min(miroir.length, j.lignes.length);
      if (miroir.slice(0, commun).some((l, i) => l !== j.lignes[i])) {
        erreurs.push(`${nom} : journal réécrit depuis le dernier relevé : son miroir reste tel quel`);
        continue;
      }
      const nouvelles = j.lignes.slice(miroir.length);
      if (nouvelles.length > 0) {
        mkdirSync(dirname(chemin), { recursive: true });
        appendFileSync(chemin, `${nouvelles.join('\n')}\n`);
        writeFileSync(teteDe(chemin), `${JSON.stringify({ schema: SCHEMA, numero: j.lignes.length, empreinte: sha256(j.lignes.at(-1)) })}\n`);
      }
      releves.push({ chemin: p.chemin, instance, journal: j.journal, ajoutees: nouvelles.length, total: Math.max(miroir.length, j.lignes.length) });
    }
  }
  return { erreurs, avertissements, releves };
}

/**
 * Enveloppes des miroirs, par instance ; celles d'un système ou d'une version que le dépôt ne connaît pas
 * sont écartées (D1.INV-3).
 */
function chargerMagasin(magasin, depot) {
  const connus = systemesConnus(depot);
  const parInstance = new Map();
  const ecartees = [];
  const toutes = new Map();
  const instances = magasin ? join(magasin, 'instances') : null;
  if (instances && existsSync(instances)) {
    for (const d of readdirSync(instances, { withFileTypes: true }).filter((e) => e.isDirectory()).sort((a, b) => parCodePoint(a.name, b.name))) {
      const xs = readdirSync(join(instances, d.name)).filter((n) => n.endsWith('.jsonl')).sort(parCodePoint)
        .flatMap((n) => lignesDe(join(instances, d.name, n)).map((l) => JSON.parse(l)));
      toutes.set(d.name, xs);
      parInstance.set(d.name, xs.filter((x) => {
        const systeme = connus.get(x.systeme.nom);
        const connu = systeme?.versions.has(x.systeme.version);
        if (!connu) ecartees.push({ instance: d.name, numero: x.numero, systeme: `${x.systeme.nom} ${x.systeme.version}`, raison: systeme ? 'version inconnue du dépôt' : 'système inconnu du dépôt' });
        return connu;
      }));
    }
  }
  return { parInstance, toutes, ecartees, connus };
}

// ---- D2 : confrontation entre instances ; D6 : entre systèmes ----

const estSignal = (x) => x.type !== 'decision' && !NATURES_NEUTRES.includes(x.nature) && !MOTIFS_GENERIQUES.includes(x.motif) && x.profondeur !== undefined;
const cleDe = (systeme, motif, profondeur) => `${systeme}|${motif}|${profondeur ?? ''}`;
/** Clé d'une proposition : un candidat par invariant ne se confond avec aucun retour ni aucune récurrence. */
const cleDeProposition = (sorte, systeme, motif, profondeur) => (sorte === 'invariant' ? `invariant|${systeme}|${motif}` : cleDe(systeme, motif, profondeur));
/** Motif d'un candidat par invariant : `ecart-` suivi de l'invariant, en minuscules et tirets. */
export const motifDInvariant = (invariant) => `ecart-${invariant.toLowerCase().replace(/[:.]/g, '-')}`;
/**
 * Un écart se désigne par son instance et son ticket : l'ancre de l'enveloppe quand c'est un ticket, sinon son
 * journal source, qui pour le champ du générateur est le ticket ; à défaut, par sa source. Le même écart,
 * constaté par un système et décidé dans le registre d'un autre, a ainsi la même désignation.
 */
const ecartDe = (x, instance) => {
  const ticket = x.ancre?.nature === 'ticket' ? x.ancre.ref : x.source.journal;
  return ticket ? `${instance}|${ticket}` : `${instance}|${x.systeme.nom}|${x.source.format}|${x.source.numero}`;
};
const triReferences = (a, b) => {
  const [x, y] = [a, b].map((r) => r.split(':'));
  return parCodePoint(x[0], y[0]) || parCodePoint(x.length === 3 ? x[1] : '', y.length === 3 ? y[1] : '') || Number(x.at(-1)) - Number(y.at(-1));
};

/**
 * Candidats par invariant (D6) : un même invariant du dépôt, cité par des écarts ou des dérogations, quand ses
 * écarts distincts sont au moins deux et viennent de deux instances ou de deux systèmes. Il se propose à la
 * spécification qui le définit, à sa version courante.
 */
function parInvariant(parInstance, depot, connus) {
  const definis = invariantsDuDepot(depot);
  const groupes = new Map();
  for (const [instance, xs] of parInstance) {
    for (const x of xs) {
      if (!TYPES_ECART.includes(x.type) || x.invariant === undefined || !definis.has(x.invariant) || !connus.has(x.invariant.split(':')[0])) continue;
      const g = groupes.get(x.invariant) ?? { ecarts: new Set(), instances: new Set(), systemes: new Set(), references: new Set() };
      g.ecarts.add(ecartDe(x, instance));
      g.instances.add(instance);
      g.systemes.add(x.systeme.nom);
      g.references.add(`${court(instance)}:${x.systeme.nom}:${x.numero}`);
      groupes.set(x.invariant, g);
    }
  }
  return [...groupes]
    .filter(([, g]) => g.instances.size >= SEUIL_INSTANCES || (g.ecarts.size >= 2 && g.systemes.size >= 2))
    .map(([invariant, g]) => {
      const systeme = invariant.split(':')[0];
      return {
        sorte: 'invariant', systeme, motif: motifDInvariant(invariant), invariant, systemes: [...g.systemes].sort(parCodePoint), versions: [connus.get(systeme).courante],
        instances: g.instances.size, ecarts: g.ecarts.size, enveloppes: g.references.size, references: [...g.references].sort(triReferences),
      };
    });
}

/**
 * Retours, récurrences et invariants candidats. Un retour : une proposition d'instance qui vise une
 * spécification, qu'une décision humaine de l'instance a retenue, dès une instance. Une récurrence : un même
 * motif, à la même profondeur, pour un même système, dans au moins deux instances distinctes. Un invariant : un
 * même invariant du dépôt, relevé par des écarts distincts de deux systèmes ou de deux instances.
 */
export function confronter({ magasin = magasinParDefaut(), depot = RACINE } = {}) {
  const r = relever({ magasin });
  if (r.altere || !magasin) return { erreurs: r.erreurs, avertissements: [], candidats: [], ecartees: 0, instances: 0 };
  const { parInstance, ecartees, connus } = chargerMagasin(magasin, depot);
  const groupes = new Map();
  const ajouter = (x, instance, retour, ...refs) => {
    const cle = cleDe(x.systeme.nom, x.motif, x.profondeur);
    const g = groupes.get(cle) ?? { systeme: x.systeme.nom, motif: x.motif, profondeur: x.profondeur, retour: false, instances: new Set(), references: new Set(), versions: new Set() };
    g.retour ||= retour;
    g.instances.add(instance);
    g.versions.add(x.systeme.version);
    for (const y of refs) g.references.add(`${court(instance)}:${y.numero}`);
    groupes.set(cle, g);
  };
  for (const [instance, xs] of parInstance) {
    const parNumero = new Map(xs.map((x) => [x.numero, x]));
    for (const x of xs) {
      if (estSignal(x)) ajouter(x, instance, false, x);
      if (x.type === 'decision' && ['retenue', 'amendee'].includes(x.decision?.valeur)) {
        const p = parNumero.get(x.decision.vise);
        if (p?.type === 'proposition' && p.cible === 'specification') ajouter(p, instance, true, p, x);
      }
    }
  }
  const candidats = [...groupes.values()]
    .filter((g) => g.retour || g.instances.size >= SEUIL_INSTANCES)
    .map((g) => ({
      sorte: g.retour ? 'retour' : 'recurrence', systeme: g.systeme, motif: g.motif, profondeur: g.profondeur,
      versions: [...g.versions].sort(comparerVersions), instances: g.instances.size, enveloppes: g.references.size, references: [...g.references].sort(triReferences),
    }))
    .sort((a, b) => parCodePoint(cleDe(a.systeme, a.motif, a.profondeur), cleDe(b.systeme, b.motif, b.profondeur)));
  candidats.push(...parInvariant(parInstance, depot, connus).sort((a, b) => parCodePoint(a.invariant, b.invariant)));
  return { erreurs: r.erreurs, avertissements: r.avertissements, candidats, ecartees: ecartees.length, instances: parInstance.size };
}

// ---- D3 : état de l'écosystème ----

/** Pour chaque instance, chaque système qui exporte, comparé à sa version publiée. */
export function etat({ magasin = magasinParDefaut(), depot = RACINE } = {}) {
  const r = relever({ magasin });
  if (r.altere || !magasin) return { erreurs: r.erreurs, avertissements: [], instances: [], ecartees: 0, propositions: {} };
  const { toutes, ecartees, connus } = chargerMagasin(magasin, depot);
  const { projets } = lireProjets(magasin);
  const instances = [...toutes].map(([instance, xs]) => {
    const parSysteme = new Map();
    for (const x of xs) parSysteme.set(x.systeme.nom, [...(parSysteme.get(x.systeme.nom) ?? []), x]);
    const systemes = [...parSysteme].sort(([a], [b]) => parCodePoint(a, b)).map(([nom, ys]) => {
      const derniere = ys.at(-1).systeme.version;
      const publie = connus.get(nom);
      const ecart = !publie?.versions.has(derniere) ? 'inconnue' : derniere === publie.courante ? 'a-jour' : 'en-retard';
      return { nom, versions: [...new Set(ys.map((y) => y.systeme.version))].sort(comparerVersions), derniere, publiee: publie?.courante ?? null, ecart, enveloppes: ys.length };
    });
    return { instance: court(instance), chemins: projets.filter((p) => p.instance === instance).map((p) => p.chemin), enveloppes: xs.length, derniere: xs.at(-1)?.date ?? null, systemes };
  });
  const { propositions } = lirePropositions(depot);
  const statuts = {};
  for (const p of propositions) statuts[p.entete.statut] = (statuts[p.entete.statut] ?? 0) + 1;
  return { erreurs: r.erreurs, avertissements: r.avertissements, instances, ecartees: ecartees.length, propositions: statuts };
}

// ---- D4 : propositions ----

const CLES_PROPOSITION = ['format', 'date', 'systeme', 'versions', 'sorte', 'motif', 'invariant', 'systemes', 'profondeur', 'instances', 'enveloppes', 'references', 'statut', 'version', 'pr'];
const LISTES_PROPOSITION = ['versions', 'systemes', 'references'];

/**
 * En-tête d'une proposition et ses écarts au format `observatoire.proposition/1` (D4.INV-1) : rien que des
 * valeurs minimisées, système, versions, sorte, motif, profondeur, nombres, références tronquées, statut ;
 * pour une proposition par invariant, l'invariant du dépôt et les systèmes qui l'ont relevé.
 */
export function controlerProposition(texte) {
  const lignes = texte.replace(/^﻿/, '').replace(/\r\n/g, '\n').split('\n');
  if (lignes[0] !== '---') return { entete: null, erreurs: ['en-tête absent : la proposition commence par ---'] };
  const fin = lignes.indexOf('---', 1);
  if (fin === -1) return { entete: null, erreurs: ['en-tête non fermé par ---'] };
  const entete = {};
  const erreurs = [];
  for (const ligne of lignes.slice(1, fin)) {
    const m = /^([a-z]+): (.+)$/.exec(ligne);
    if (!m) {
      erreurs.push(`ligne d'en-tête mal formée : « ${ligne} »`);
      continue;
    }
    const [, cle, brut] = m;
    if (!CLES_PROPOSITION.includes(cle)) erreurs.push(`clé inconnue ${cle}`);
    if (cle in entete) erreurs.push(`clé répétée ${cle}`);
    if (LISTES_PROPOSITION.includes(cle)) {
      const l = /^\[(.*)\]$/.exec(brut);
      entete[cle] = l ? l[1].split(',').map((s) => s.trim()).filter(Boolean) : null;
    } else entete[cle] = ['instances', 'enveloppes', 'pr'].includes(cle) && /^\d+$/.test(brut) ? Number(brut) : brut;
  }
  const requis = ['format', 'date', 'systeme', 'versions', 'sorte', 'motif', 'instances', 'enveloppes', 'references', 'statut'];
  for (const k of requis) if (!(k in entete)) erreurs.push(`clé requise absente ${k}`);
  if (erreurs.length > 0) return { entete, erreurs };
  if (entete.format !== FORMAT_PROPOSITION) erreurs.push(`format « ${entete.format} », attendu ${FORMAT_PROPOSITION}`);
  if (!chaine(entete.date, JOUR)) erreurs.push(`date « ${entete.date} » : AAAA-MM-JJ`);
  if (!chaine(entete.systeme, NOM)) erreurs.push(`systeme « ${entete.systeme} » : le nom d'une spécification`);
  if (!Array.isArray(entete.versions) || entete.versions.length === 0 || !entete.versions.every((v) => VERSION.test(v))) erreurs.push('versions : une liste de versions x.y.z');
  if (!['retour', 'recurrence', 'invariant'].includes(entete.sorte)) erreurs.push(`sorte « ${entete.sorte} » : retour, recurrence ou invariant`);
  if (!chaine(entete.motif, MOTIF)) erreurs.push(`motif « ${entete.motif} » : minuscules et tirets`);
  if (entete.profondeur !== undefined && !LISTES.profondeur.includes(entete.profondeur)) erreurs.push(`profondeur « ${entete.profondeur} » hors de la liste`);
  for (const k of ['instances', 'enveloppes']) if (!entier(entete[k])) erreurs.push(`${k} : un entier, à partir de 1`);
  const parInvariant = entete.sorte === 'invariant';
  if (parInvariant) {
    if (!chaine(entete.invariant, INVARIANT) || entete.invariant.split(':')[0] !== entete.systeme) erreurs.push('invariant : l\'identifiant d\'un invariant du dépôt, préfixé par la spécification visée');
    else if (entete.motif !== motifDInvariant(entete.invariant)) erreurs.push(`motif « ${entete.motif} » : ${motifDInvariant(entete.invariant)}, celui de l'invariant`);
    if (!Array.isArray(entete.systemes) || entete.systemes.length === 0 || !entete.systemes.every((s) => NOM.test(s))) erreurs.push('systemes : la liste des systèmes qui ont relevé l\'invariant');
    if (entete.profondeur !== undefined) erreurs.push('profondeur : aucune pour une proposition par invariant');
  } else if (entete.invariant !== undefined || entete.systemes !== undefined) erreurs.push('invariant, systemes : seulement pour une proposition par invariant');
  const references = Array.isArray(entete.references) && entete.references.length > 0;
  if (!references || !entete.references.every((r) => (parInvariant ? REFERENCE_SYSTEME.test(r) && entete.systemes?.includes(r.split(':')[1]) : REFERENCE.test(r)))) {
    erreurs.push(parInvariant ? 'references : une liste de références tronquées, instance:systeme:numero, d\'un système de la liste' : 'references : une liste de références tronquées, instance:numero');
  }
  if (!['ouverte', 'ratifiee', 'refusee'].includes(entete.statut)) erreurs.push(`statut « ${entete.statut} » : ouverte, ratifiee ou refusee`);
  if (entete.statut === 'ratifiee' && !chaine(entete.version, VERSION)) erreurs.push('version : la version du système qui porte la proposition ratifiée');
  if (entete.statut !== 'ratifiee' && entete.version !== undefined) erreurs.push('version : seulement pour une proposition ratifiée');
  if (entete.pr !== undefined && (!entier(entete.pr) || entete.statut === 'ouverte')) erreurs.push('pr : le numéro de la pull request qui a décidé de la proposition');
  return { entete, erreurs };
}

/** Propositions du dépôt, avec leur en-tête. */
export function lirePropositions(depot = RACINE) {
  const dossier = join(depot, PROPOSITIONS);
  const propositions = [];
  const erreurs = [];
  if (!existsSync(dossier)) return { propositions, erreurs };
  for (const nom of readdirSync(dossier).filter((n) => n.endsWith('.md') && n !== 'README.md').sort(parCodePoint)) {
    const { entete, erreurs: ecarts } = controlerProposition(lire(join(dossier, nom)));
    if (ecarts.length > 0) erreurs.push(...ecarts.map((e) => `${PROPOSITIONS}/${nom} : ${e}`));
    else propositions.push({ fichier: `${PROPOSITIONS}/${nom}`, entete });
  }
  return { propositions, erreurs };
}

function texteDeProposition(c, date) {
  const entete = [
    '---',
    `format: ${FORMAT_PROPOSITION}`,
    `date: ${date}`,
    `systeme: ${c.systeme}`,
    `versions: [${c.versions.join(', ')}]`,
    `sorte: ${c.sorte}`,
    `motif: ${c.motif}`,
    ...(c.sorte === 'invariant' ? [`invariant: ${c.invariant}`, `systemes: [${c.systemes.join(', ')}]`] : []),
    ...(c.profondeur ? [`profondeur: ${c.profondeur}`] : []),
    `instances: ${c.instances}`,
    `enveloppes: ${c.enveloppes}`,
    `references: [${c.references.join(', ')}]`,
    'statut: ouverte',
    '---',
  ];
  const sortes = {
    retour: () => `une proposition retenue par le développeur d'une instance, et qui vise la spécification${c.instances > 1 ? `, son motif relevé dans ${c.instances} instances` : ''}`,
    recurrence: () => `le même motif, à la même profondeur, relevé dans ${c.instances} instances`,
    invariant: () => `l'invariant \`${c.invariant}\`, que définit la spécification, cité par des écarts de ${pluriel(c.systemes.length, 'système')}, ${c.systemes.join(', ')}, dans ${pluriel(c.instances, 'instance')}`,
  };
  const sorte = sortes[c.sorte]();
  return `${entete.join('\n')}

# Proposition : ${c.sorte === 'invariant' ? c.invariant : `${c.motif}${c.profondeur ? `, ${c.profondeur}` : ''}, ${c.systeme}`}

Proposée par l'observatoire le ${date} : ${sorte}. Elle ne s'applique pas d'elle-même : le développeur la relit, la complète et l'apporte au dépôt par une pull request, que la ratification décide.

## Ce qui change

À rédiger par le développeur : la règle de \`${c.systeme}\` à changer, et pourquoi. Aucune donnée d'une instance n'y entre ; les références de l'en-tête ne servent qu'à retrouver les enveloppes dans le magasin local.

## Statut

La pull request de ratification inscrit dans l'en-tête \`statut: ratifiee\`, avec \`version\`, la version de \`${c.systeme}\` qui porte la proposition, et \`pr\`, son numéro ; ou \`statut: refusee\`, avec \`pr\`.
`;
}

const aujourdhui = () => new Date().toISOString().slice(0, 10);

/**
 * Écrit dans `observatoire/propositions/` une proposition par candidat nouveau (D4.INV-2) : une proposition
 * ouverte ou ratifiée ne se répète pas ; une proposition refusée ne revient qu'avec une instance nouvelle.
 */
export function proposer({ magasin = magasinParDefaut(), depot = RACINE, date = aujourdhui() } = {}) {
  if (!chaine(date, JOUR)) return { erreurs: [`date « ${date} » : AAAA-MM-JJ`], avertissements: [], ecrites: [], ignorees: [] };
  const c = confronter({ magasin, depot });
  const { propositions, erreurs } = lirePropositions(depot);
  if (erreurs.length > 0) return { erreurs: erreurs.map((e) => `proposition mal formée, ${e} : rien n'est écrit`), avertissements: c.avertissements, ecrites: [], ignorees: [] };
  const ecrites = [];
  const ignorees = [];
  for (const candidat of c.candidats) {
    const nom = `${candidat.systeme}, ${candidat.motif}${candidat.profondeur ? `, ${candidat.profondeur}` : ''}`;
    const cle = cleDeProposition(candidat.sorte, candidat.systeme, candidat.motif, candidat.profondeur);
    const memes = propositions.filter(({ entete: e }) => cleDeProposition(e.sorte, e.systeme, e.motif, e.profondeur) === cle);
    const ouverte = memes.find((p) => p.entete.statut === 'ouverte');
    const ratifiee = memes.find((p) => p.entete.statut === 'ratifiee');
    const refusees = memes.filter((p) => p.entete.statut === 'refusee');
    const instancesRefusees = new Set(refusees.flatMap((p) => p.entete.references.map((r) => r.split(':')[0])));
    const nouvelles = new Set(candidat.references.map((r) => r.split(':')[0]).filter((i) => !instancesRefusees.has(i)));
    if (ouverte) ignorees.push({ candidat: nom, raison: `déjà proposée, ouverte : ${ouverte.fichier}` });
    else if (ratifiee) ignorees.push({ candidat: nom, raison: `déjà ratifiée, en ${ratifiee.entete.version} : ${ratifiee.fichier}` });
    else if (refusees.length > 0 && nouvelles.size === 0) ignorees.push({ candidat: nom, raison: `refusée, sans instance nouvelle : ${refusees.at(-1).fichier}` });
    else {
      const fichier = `${PROPOSITIONS}/${date}-${candidat.systeme}-${candidat.motif}${candidat.profondeur ? `-${candidat.profondeur}` : ''}.md`;
      if (existsSync(join(depot, fichier))) {
        ignorees.push({ candidat: nom, raison: `déjà écrite : ${fichier}` });
        continue;
      }
      mkdirSync(join(depot, PROPOSITIONS), { recursive: true });
      writeFileSync(join(depot, fichier), texteDeProposition(candidat, date));
      ecrites.push(fichier);
    }
  }
  return { erreurs: c.erreurs, avertissements: c.avertissements, ecrites, ignorees };
}

// ---- D5 : suivi ----

/**
 * Statut de chaque proposition ; pour une ratifiée, part du motif dans les enveloppes du système avant et
 * après la version qui la porte : effet observé, non observé, ou indécidable sous le seuil d'enveloppes.
 */
export function suivre({ magasin = magasinParDefaut(), depot = RACINE } = {}) {
  const r = relever({ magasin });
  if (r.altere || !magasin) return { erreurs: r.erreurs, avertissements: [], suivis: [] };
  const { parInstance } = chargerMagasin(magasin, depot);
  const { propositions, erreurs } = lirePropositions(depot);
  const toutes = [...parInstance.values()].flat();
  const suivis = propositions.map(({ fichier, entete: e }) => {
    const base = { fichier, systeme: e.systeme, motif: e.motif, profondeur: e.profondeur ?? null, sorte: e.sorte, ...(e.invariant ? { invariant: e.invariant } : {}), statut: e.statut };
    if (e.statut !== 'ratifiee') return { ...base, effet: null };
    const xs = toutes.filter((x) => x.systeme.nom === e.systeme);
    // Pour une proposition par invariant, le motif est celui des écarts qui citent l'invariant, dans les enveloppes
    // de la spécification qui le définit : indécidable si elle n'exporte pas.
    const duMotif = e.sorte === 'invariant'
      ? (x) => TYPES_ECART.includes(x.type) && x.invariant === e.invariant
      : (x) => estSignal(x) && x.motif === e.motif && x.profondeur === e.profondeur;
    const compter = (ys) => ({ motif: ys.filter(duMotif).length, enveloppes: ys.length });
    const avant = compter(xs.filter((x) => comparerVersions(x.systeme.version, e.version) < 0));
    const apres = compter(xs.filter((x) => comparerVersions(x.systeme.version, e.version) >= 0));
    let effet = 'indecidable';
    if (avant.enveloppes >= SEUIL_ENVELOPPES && apres.enveloppes >= SEUIL_ENVELOPPES) {
      effet = apres.motif / apres.enveloppes < avant.motif / avant.enveloppes ? 'observe' : 'non-observe';
    }
    return { ...base, version: e.version, avant, apres, effet };
  });
  return { erreurs: [...r.erreurs, ...erreurs.map((x) => `proposition mal formée, ${x}`)], avertissements: r.avertissements, suivis };
}

/** Écarts du magasin et des propositions du dépôt. */
export function verifier({ magasin = magasinParDefaut(), depot = RACINE } = {}) {
  return [...verifierMagasin(magasin), ...lirePropositions(depot).erreurs];
}

// ---- Ligne de commande ----

const USAGE = [
  'Usage, depuis le clone :',
  '  node specs/observatoire/outils/observatoire.mjs inscrire --projet <dossier>',
  '  node specs/observatoire/outils/observatoire.mjs relever',
  '  node specs/observatoire/outils/observatoire.mjs etat [--json]',
  '  node specs/observatoire/outils/observatoire.mjs confronter [--json]',
  '  node specs/observatoire/outils/observatoire.mjs proposer [--date AAAA-MM-JJ]',
  '  node specs/observatoire/outils/observatoire.mjs suivre [--json]',
  '  node specs/observatoire/outils/observatoire.mjs verifier',
].join('\n');

const OPTIONS = { inscrire: ['--projet'], relever: [], etat: ['--json'], confronter: ['--json'], proposer: ['--date'], suivre: ['--json'], verifier: [] };
const EFFETS = { observe: 'effet observé', 'non-observe': 'effet non observé', indecidable: 'indécidable, moins de vingt enveloppes d\'un côté' };
const ECARTS = { 'a-jour': 'à jour', 'en-retard': 'en retard', inconnue: 'version inconnue du dépôt' };

/**
 * Ligne de commande. Renvoie le code de sortie ; écrit par `sortie` et `erreur`. `contexte` ne sert qu'à la
 * recette : il remplace le magasin et le dépôt par défaut.
 */
export function principal(argv, sortie = console.log, erreur = console.error, contexte = {}) {
  const [commande, ...reste] = argv;
  if (!(commande in OPTIONS)) {
    erreur(USAGE);
    return 2;
  }
  const options = {};
  for (let k = 0; k < reste.length; k++) {
    const o = reste[k];
    if (!OPTIONS[commande].includes(o)) {
      erreur(USAGE);
      return 2;
    }
    if (o === '--json') options.json = true;
    else if (reste[k + 1] === undefined) {
      erreur(USAGE);
      return 2;
    } else options[o.slice(2)] = reste[++k];
  }
  if (commande === 'inscrire' && options.projet === undefined) {
    erreur(USAGE);
    return 2;
  }
  const lieux = { magasin: contexte.magasin ?? magasinParDefaut(), depot: contexte.depot ?? RACINE };
  const rendre = (r) => {
    for (const a of r.avertissements ?? []) erreur(`ATTENTION  ${a}`);
    for (const e of r.erreurs ?? []) erreur(`REFUS  ${e}`);
    return (r.erreurs ?? []).length > 0 ? 1 : 0;
  };

  if (commande === 'inscrire') {
    const r = inscrire(options.projet, { magasin: lieux.magasin });
    if (r.erreurs.length === 0) sortie(r.deja ? `projet déjà inscrit, instance ${court(r.instance)}` : `projet inscrit, instance ${court(r.instance)} ; « relever » recopie son journal dans le magasin`);
    return rendre(r);
  }
  if (commande === 'relever') {
    const r = relever({ magasin: lieux.magasin });
    for (const x of r.releves) sortie(`${court(x.instance)}  ${x.journal} : ${pluriel(x.ajoutees, 'enveloppe')} relevée${x.ajoutees > 1 ? 's' : ''}, ${x.total} en tout`);
    if (r.releves.length === 0 && r.erreurs.length === 0) sortie('aucun journal relevé : inscrire d\'abord un projet qui exporte');
    return rendre(r);
  }
  if (commande === 'etat') {
    const r = etat(lieux);
    if (options.json) sortie(JSON.stringify(r, null, 2));
    else {
      sortie(`${pluriel(r.instances.length, 'instance')}, ${pluriel(r.ecartees, 'enveloppe')} écartée${r.ecartees > 1 ? 's' : ''} : système ou version inconnus du dépôt`);
      for (const i of r.instances) {
        sortie(`${i.instance}  ${pluriel(i.enveloppes, 'enveloppe')}, la dernière datée ${i.derniere} ; ${i.chemins.join(', ') || 'aucun projet inscrit'}`);
        for (const s of i.systemes) sortie(`  ${s.nom} ${s.derniere} : ${ECARTS[s.ecart]}${s.publiee && s.ecart !== 'a-jour' ? `, publiée ${s.publiee}` : ''}`);
      }
      const statuts = Object.entries(r.propositions).map(([k, n]) => `${k} ${n}`).join(' · ');
      sortie(`propositions du dépôt : ${statuts || 'aucune'}`);
    }
    return rendre(r);
  }
  if (commande === 'confronter') {
    const r = confronter(lieux);
    if (options.json) sortie(JSON.stringify(r, null, 2));
    else {
      sortie(`${pluriel(r.instances, 'instance')} confrontée${r.instances > 1 ? 's' : ''} : ${pluriel(r.candidats.length, 'candidat')}`);
      for (const c of r.candidats) {
        const systemes = c.sorte === 'invariant' ? `${c.invariant}, ${pluriel(c.systemes.length, 'système')}, ` : '';
        sortie(`  ${c.sorte}  ${c.systeme}, ${c.motif}${c.profondeur ? `, ${c.profondeur}` : ''} : ${systemes}${pluriel(c.instances, 'instance')}, ${pluriel(c.enveloppes, 'enveloppe')}`);
      }
      if (r.instances < SEUIL_INSTANCES) sortie(`moins de ${SEUIL_INSTANCES} instances : aucune récurrence possible ; seuls remontent les retours, et les invariants relevés par deux systèmes`);
    }
    return rendre(r);
  }
  if (commande === 'proposer') {
    const r = proposer({ ...lieux, ...(options.date ? { date: options.date } : {}) });
    for (const f of r.ecrites) sortie(`écrite : ${f} ; à relire, compléter et apporter par une pull request`);
    for (const i of r.ignorees) sortie(`ignorée : ${i.candidat}, ${i.raison}`);
    if (r.ecrites.length === 0 && r.ignorees.length === 0 && r.erreurs.length === 0) sortie('aucun candidat : rien à proposer');
    return rendre(r);
  }
  if (commande === 'suivre') {
    const r = suivre(lieux);
    if (options.json) sortie(JSON.stringify(r, null, 2));
    else {
      if (r.suivis.length === 0) sortie('aucune proposition dans le dépôt');
      for (const s of r.suivis) {
        const mesure = s.effet ? ` : ${EFFETS[s.effet]} (avant ${s.avant.motif}/${s.avant.enveloppes}, après ${s.apres.motif}/${s.apres.enveloppes})` : '';
        sortie(`${s.statut}${s.version ? ` en ${s.version}` : ''}  ${s.fichier}${mesure}`);
      }
    }
    return rendre(r);
  }
  const erreurs = verifier(lieux);
  if (erreurs.length > 0) {
    for (const e of erreurs) erreur(`ALTÉRÉ  ${e}`);
    return 1;
  }
  sortie('magasin et propositions intacts');
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exitCode = principal(process.argv.slice(2));
