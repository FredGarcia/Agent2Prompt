#!/usr/bin/env node
// Apprentissage permanent du générateur de skills de ticket (generateur-skill-ticket, D8, depuis 1.1.0).
// Le skill racine en livre une copie, outils/apprentissage.mjs, à côté de champ.mjs et de rattachement.json.
//
// Chaque ticket est une recette et un cycle d'apprentissage, sans exemple de référence : le générateur
// s'observe lui-même, un niveau au-dessus des nœuds de l'arbre. Ce qu'il apprend se classe selon la
// composition récursive imbriquée (CRI) de la méthode C7E, en quatre profondeurs : macro (objectif,
// invariants de délai, critères d'acceptation), méso-contrats (frontières entre couches, contrats),
// méso-composants (implémentation des couches), micro (changesets, annotations, lignes de code, commits).
//
// Le relevé du ticket, docs/demandes/<CLÉ>/releve.json, reçoit la descente du besoin à la qualification
// (noter, qualifier), puis la remontée des preuves à la clôture (clore) : corrections et propositions du
// champ d'observation, écarts entre le plan des commits et la branche. Chaque entrée porte sa profondeur
// et sa preuve. À la clôture, le relevé passe au registre du projet, docs/c7e/registre-apprentissage.jsonl,
// en ajout seul, chaque ligne chaînée à l'empreinte de la précédente. Un même motif, à la même profondeur,
// dans deux tickets, devient une proposition ; seul le développeur décide, et deux refus mettent le motif
// en veille. Rien ne s'écrit dans le référentiel ni dans les consignes : ce script propose.
//
// Usage, depuis la racine du projet :
//   node apprentissage.mjs noter <clé> --profondeur <p> --nature <n> --motif <m> --cible <c> --sens <s> --resume <texte> --preuve <type>:<ref> [--extrait <texte>]
//   node apprentissage.mjs qualifier <clé> --cout <pourcentage> --preuve <type>:<ref>
//   node apprentissage.mjs clore <clé> [--rattachement <rattachement.json>] [--branche <ref>]
//   node apprentissage.mjs registre etat|verifier|proposer|tendance|propositions [--cible <c>]
//   node apprentissage.mjs registre decider <n> --decision retenue|refusee --par <nom> --raison <texte>
// Options communes : --demandes <dossier> (docs/demandes), --registre <fichier> (docs/c7e/registre-apprentissage.jsonl),
// --date <AAAA-MM-JJTHH:MM:SSZ>. Codes de sortie : 0 ; 1 pour un refus ou un registre altéré ; 2 pour un
// usage incorrect. Node 20 ou plus récent, modules natifs uniquement.

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lireChamp } from './champ.mjs';

export const FORMAT_RELEVE = 'generateur.releve/1';
export const FORMAT_REGISTRE = 'generateur.apprentissage/1';
export const REGISTRE = 'docs/c7e/registre-apprentissage.jsonl';
export const DEMANDES = 'docs/demandes';
export const PROFONDEURS = ['macro', 'meso-contrats', 'meso-composants', 'micro'];
export const NATURES = [
  'possibilite-inconnue', 'categorie-inadaptee', 'noeud-refuse', 'hors-arbre', 'cout',
  'correction', 'proposition-observateur', 'commit-hors-plan', 'commit-planifie-absent', 'commit-planifie-multiple', 'autre',
];
export const CIBLES = ['referentiel', 'generateur'];
export const SENS = ['descente', 'remontee'];
export const PREUVES = ['fichier', 'champ', 'commit', 'commande', 'arbre'];
export const VEILLE = 2; // refus d'un même motif qui le mettent en veille

const MOTIF = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const sha256 = (t) => createHash('sha256').update(t, 'utf8').digest('hex');
const lire = (chemin) => readFileSync(chemin, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
const texte = (v) => typeof v === 'string' && v.trim() !== '';
const maintenant = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
export const cleMotif = (e) => `${e.profondeur}|${e.cible}|${e.motif}`;

/** Profondeur CRI de ce que vise une ancre du champ. */
export function profondeurDAncre(ancre) {
  return { critere: 'macro', ca: 'macro', contrat: 'meso-contrats', option: 'meso-contrats', noeud: 'meso-composants', scenario: 'meso-composants', fichier: 'micro', commit: 'micro' }[ancre?.type] ?? 'meso-composants';
}

/** Contrôle d'une entrée de relevé (D8.INV-1) : profondeur, nature, motif, cible, sens, résumé, preuve. */
export function controlerEntree(e) {
  const erreurs = [];
  if (!PROFONDEURS.includes(e.profondeur)) erreurs.push(`profondeur « ${e.profondeur ?? ''} » hors de ${PROFONDEURS.join(', ')}`);
  if (!NATURES.includes(e.nature)) erreurs.push(`nature « ${e.nature ?? ''} » hors de ${NATURES.join(', ')}`);
  if (!texte(e.motif) || !MOTIF.test(e.motif)) erreurs.push('motif en minuscules et tirets, le même pour un même écart d\'un ticket à l\'autre');
  if (!CIBLES.includes(e.cible)) erreurs.push(`cible « ${e.cible ?? ''} » hors de ${CIBLES.join(', ')}`);
  if (!SENS.includes(e.sens)) erreurs.push(`sens « ${e.sens ?? ''} » hors de ${SENS.join(', ')}`);
  if (!texte(e.resume)) erreurs.push('résumé absent');
  if (!e.preuve || !PREUVES.includes(e.preuve.type) || !texte(String(e.preuve.ref ?? ''))) erreurs.push(`preuve absente ou mal typée (${PREUVES.join(', ')}) : une entrée sans preuve est refusée`);
  return erreurs;
}

// ---- Relevé du ticket ----

const cheminReleve = (cle, demandes) => join(demandes, cle, 'releve.json');

export function lireReleve(cle, demandes = DEMANDES) {
  const chemin = cheminReleve(cle, demandes);
  if (!existsSync(chemin)) return { format: FORMAT_RELEVE, cle, clos: false, entrees: [] };
  return JSON.parse(lire(chemin));
}

/** Vue Markdown d'un relevé, par profondeur CRI. */
export function releveEnMarkdown(r) {
  const lignes = [`# Relevé d'apprentissage de ${r.cle}`, '', `${r.entrees.length} entrée${r.entrees.length > 1 ? 's' : ''}${r.clos ? ', relevé clos et versé au registre du projet' : ''}.`];
  for (const p of PROFONDEURS) {
    const ici = r.entrees.filter((e) => e.profondeur === p);
    if (ici.length === 0) continue;
    lignes.push('', `## ${p}`, '', '| N° | Sens | Nature | Motif | Cible | Résumé | Preuve |', '| --- | --- | --- | --- | --- | --- | --- |');
    for (const e of ici) lignes.push(`| ${e.n} | ${e.sens} | ${e.nature} | ${e.motif} | ${e.cible} | ${e.resume.replace(/\|/g, '\\|')} | ${e.preuve.type} ${String(e.preuve.ref).replace(/\|/g, '\\|')} |`);
  }
  return `${lignes.join('\n')}\n`;
}

function ecrireReleve(r, demandes) {
  const chemin = cheminReleve(r.cle, demandes);
  mkdirSync(dirname(chemin), { recursive: true });
  writeFileSync(chemin, `${JSON.stringify(r, null, 2)}\n`);
  writeFileSync(join(dirname(chemin), 'releve.md'), releveEnMarkdown(r));
}

/** Ajoute des entrées au relevé ; refuse tout s'il est clos ou si une entrée est mal formée. */
export function noter(cle, entrees, { demandes = DEMANDES, date = maintenant() } = {}) {
  const r = lireReleve(cle, demandes);
  if (r.clos) return { erreurs: [`relevé de ${cle} clos : il est au registre du projet, rien ne s'y ajoute`] };
  const erreurs = entrees.flatMap((e, k) => controlerEntree(e).map((x) => `entrée ${k + 1} : ${x}`));
  if (!DATE.test(date)) erreurs.push(`date « ${date} » au format AAAA-MM-JJTHH:MM:SSZ`);
  if (erreurs.length > 0) return { erreurs };
  for (const e of entrees) r.entrees.push({ n: r.entrees.length + 1, date, ...e });
  ecrireReleve(r, demandes);
  return { erreurs: [], releve: r };
}

// ---- Remontée : champ d'observation et branche ----

/** Entrées tirées du champ : corrections du développeur et propositions d'ordre 2, avec leur décision. */
export function entreesDuChamp(enregistrements) {
  const parN = new Map(enregistrements.map((e) => [e.n, e]));
  const res = [];
  for (const e of enregistrements) {
    if (e.type === 'retour' && e.nature === 'correction' && texte(e.motif)) {
      const visee = parN.get(e.vise);
      res.push({
        profondeur: profondeurDAncre(visee?.ancre), nature: 'correction', motif: e.motif, cible: 'referentiel', sens: 'remontee',
        resume: `${e.noeud} : ${e.contenu}`, preuve: { type: 'champ', ref: String(e.n) },
      });
    }
    if (e.type === 'observation' && e.ordre === 2 && e.verdict === 'proposition') {
      const choix = enregistrements.find((x) => x.type === 'retour' && x.nature === 'choix' && x.vise === e.n);
      res.push({
        profondeur: profondeurDAncre(e.ancre ?? parN.get((e.observe ?? [])[0])?.ancre), nature: 'proposition-observateur', motif: texte(e.motif) ? e.motif : 'proposition-ordre-2', cible: 'referentiel', sens: 'remontee',
        resume: `${e.proposition ?? ''}${choix ? ` (décision du développeur : ${choix.decision})` : ' (sans décision)'}`.trim(), preuve: { type: 'champ', ref: String(e.n) },
      });
    }
  }
  return res;
}

/**
 * Commits de la branche qui portent une ligne « Tâche » : [{ sha, tache, scenario, theme, slot }]. Le slot
 * (É1 à É7) est celui de l'étiquette `[É<n>-<DOMAINE>]` du titre ; null si le titre n'en porte pas.
 */
export function commitsDeLaBranche(projet, branche = 'HEAD') {
  let sortie;
  try {
    sortie = execFileSync('git', ['log', '--reverse', '--format=%H%x00%B%x1e', branche], { cwd: projet, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
  return sortie.split('\x1e').map((b) => b.trim()).filter(Boolean).map((b) => {
    const [sha, corps = ''] = b.split('\x00');
    const lignes = corps.replace(/\r\n/g, '\n').split('\n').map((l) => l.trim());
    const ligne = (nom) => lignes.find((l) => l.startsWith(`${nom} : `))?.slice(nom.length + 3);
    return { sha, tache: ligne('Tâche'), scenario: ligne('Scénario') ?? null, theme: ligne('Thème'), slot: /\[(É\d)-[^\]]*\]/.exec(lignes[0] ?? '')?.[1] ?? null };
  }).filter((c) => c.tache);
}

/**
 * Le commit est-il du ticket `cle` ? Sa tâche est la clé, une référence qui la prolonge, ou un nœud ou une
 * tâche du plan que décrit le rattachement. La branche porte aussi l'historique d'avant elle, avec les
 * commits d'autres tickets : ils ne sont ni dans le plan, ni hors du plan de celui-ci (1.1.1).
 */
export function duTicket(cle, rattachement = null) {
  const references = new Set([cle, rattachement?.cle, ...(rattachement?.noeuds ?? []).map((x) => x.reference), ...(rattachement?.plan ?? []).map((p) => p.tache)].filter(Boolean));
  return (c) => references.has(c.tache) || String(c.tache).startsWith(`${cle}-`);
}

/**
 * Écarts entre le plan des commits ratifié et la branche (niveau micro). Un commit planifié peut se
 * réaliser en plusieurs commits, un par slot (orchestrateur, D4.INV-2) : seuls deux commits ou plus sur
 * le même slot en font un écart (1.1.1).
 */
export function entreesDuPlan(plan, commits) {
  const res = [];
  const cle = (x) => `${x.tache}|${x.scenario ?? '-'}|${x.theme}`;
  const parCle = new Map();
  for (const c of commits) {
    if (!parCle.has(cle(c))) parCle.set(cle(c), []);
    parCle.get(cle(c)).push(c);
  }
  const planifies = new Set(plan.map(cle));
  for (const p of plan) {
    const faits = parCle.get(cle(p)) ?? [];
    const ici = `${p.tache}:${p.commit} (${p.theme}${p.scenario ? `, ${p.scenario}` : ''})`;
    if (faits.length === 0) res.push({ profondeur: 'micro', nature: 'commit-planifie-absent', motif: `commit-absent-${p.theme}`, cible: 'generateur', sens: 'remontee', resume: `${ici} : aucun commit sur la branche`, preuve: { type: 'arbre', ref: `${p.tache}:${p.commit}` } });
    const parSlot = new Map();
    for (const f of faits) {
      if (!parSlot.has(f.slot ?? null)) parSlot.set(f.slot ?? null, []);
      parSlot.get(f.slot ?? null).push(f);
    }
    for (const [slot, memes] of parSlot) {
      if (memes.length > 1) res.push({ profondeur: 'micro', nature: 'commit-planifie-multiple', motif: `commit-multiple-${p.theme}`, cible: 'generateur', sens: 'remontee', resume: `${ici} : ${memes.length} commits ${slot ? `sur le même slot, ${slot}` : 'sans slot dans leur titre'}`, preuve: { type: 'commit', ref: memes.map((f) => f.sha.slice(0, 12)).join(', ') } });
    }
  }
  for (const c of commits) {
    if (!planifies.has(cle(c))) res.push({ profondeur: 'micro', nature: 'commit-hors-plan', motif: `commit-hors-plan-${c.theme ?? 'sans-theme'}`, cible: 'generateur', sens: 'remontee', resume: `${c.tache} : commit hors du plan (${c.theme ?? 'sans thème'}${c.scenario ? `, ${c.scenario}` : ''})`, preuve: { type: 'commit', ref: c.sha.slice(0, 12) } });
  }
  return res;
}

// ---- Registre du projet ----

export function lireRegistre(chemin = REGISTRE) {
  const lignes = existsSync(chemin) ? lire(chemin).split('\n').filter((l) => l !== '') : [];
  return { lignes, enregistrements: lignes.map((l) => { try { return JSON.parse(l); } catch { return null; } }) };
}

/** Vérifie le chaînage et la numérotation du registre (D8.INV-3). */
export function verifierRegistre(chemin = REGISTRE) {
  const { lignes, enregistrements } = lireRegistre(chemin);
  const erreurs = [];
  enregistrements.forEach((e, k) => {
    if (!e) return erreurs.push(`ligne ${k + 1} illisible`);
    if (e.format !== FORMAT_REGISTRE) erreurs.push(`ligne ${k + 1} : format ${e.format}, attendu ${FORMAT_REGISTRE}`);
    if (e.n !== k + 1) erreurs.push(`ligne ${k + 1} : numéro ${e.n}, attendu ${k + 1} (ligne insérée ou supprimée)`);
    const attendu = k === 0 ? null : sha256(lignes[k - 1]);
    if (e.precedent !== attendu) erreurs.push(`ligne ${k + 1} : empreinte du précédent fausse (ligne réécrite avant elle)`);
  });
  return erreurs;
}

function ajouterAuRegistre(chemin, partiels, date) {
  const { lignes } = lireRegistre(chemin);
  mkdirSync(dirname(chemin), { recursive: true });
  let precedent = lignes.length > 0 ? sha256(lignes.at(-1)) : null;
  let n = lignes.length;
  const ajout = partiels.map((p) => {
    n += 1;
    const ligne = JSON.stringify({ format: FORMAT_REGISTRE, n, date, precedent, ...p });
    precedent = sha256(ligne);
    return ligne;
  });
  if (ajout.length > 0) appendFileSync(chemin, `${ajout.join('\n')}\n`);
  return ajout.length;
}

/** Clôture : remontée du champ et de la branche, puis versement du relevé au registre ; le relevé se ferme. */
export function clore(cle, { demandes = DEMANDES, registre = REGISTRE, rattachement = null, projet = '.', branche = 'HEAD', date = maintenant() } = {}) {
  const r = lireReleve(cle, demandes);
  if (r.clos) return { erreurs: [`relevé de ${cle} déjà clos`] };
  const alteration = verifierRegistre(registre);
  if (alteration.length > 0) return { erreurs: alteration.map((e) => `registre altéré, ${e}`) };
  const remontee = [...entreesDuChamp(lireChamp(join(demandes, cle)).enregistrements)];
  if (rattachement?.plan) {
    const commits = commitsDeLaBranche(projet, branche);
    if (commits === null) return { erreurs: [`branche ${branche} illisible dans ${projet}`] };
    remontee.push(...entreesDuPlan(rattachement.plan, commits.filter(duTicket(cle, rattachement))));
  }
  const ajout = noter(cle, remontee, { demandes, date });
  if (ajout.erreurs.length > 0) return ajout;
  const final = ajout.releve;
  ajouterAuRegistre(registre, final.entrees.map((e) => ({ type: 'releve', cle, entree: e.n, profondeur: e.profondeur, nature: e.nature, motif: e.motif, cible: e.cible, sens: e.sens, resume: e.resume, preuve: e.preuve })), date);
  final.clos = true;
  ecrireReleve(final, demandes);
  return { erreurs: [], releve: final, remontee: remontee.length };
}

/** État du registre : propositions et leurs décisions, motifs en veille. */
export function etatRegistre(enregistrements) {
  const propositions = enregistrements.filter((e) => e?.type === 'proposition').map((p) => ({ ...p, decision: enregistrements.filter((d) => d?.type === 'decision' && d.vise === p.n).at(-1) ?? null }));
  const refus = new Map();
  for (const p of propositions) if (p.decision?.decision === 'refusee') refus.set(cleMotif(p), (refus.get(cleMotif(p)) ?? 0) + 1);
  const veille = new Set([...refus].filter(([, k]) => k >= VEILLE).map(([m]) => m));
  return { propositions, veille, releves: enregistrements.filter((e) => e?.type === 'releve') };
}

/**
 * Récurrences : un même motif, à la même profondeur et pour la même cible, relevé dans au moins deux
 * tickets (le coût, qui se suit en tendance, n'en est pas un), et qui n'a ni proposition en attente ou retenue, ni veille, devient une proposition.
 */
export function recurrences(enregistrements) {
  const { propositions, veille, releves } = etatRegistre(enregistrements);
  const groupes = new Map();
  for (const e of releves.filter((x) => x.nature !== 'cout')) {
    if (!groupes.has(cleMotif(e))) groupes.set(cleMotif(e), []);
    groupes.get(cleMotif(e)).push(e);
  }
  const res = [];
  for (const [m, es] of groupes) {
    const tickets = [...new Set(es.map((e) => e.cle))];
    if (tickets.length < 2 || veille.has(m)) continue;
    const dejaLa = propositions.filter((p) => cleMotif(p) === m);
    const ouverte = dejaLa.some((p) => !p.decision || p.decision.decision === 'retenue');
    const nouveaux = tickets.filter((t) => !dejaLa.some((p) => p.tickets.includes(t)));
    if (ouverte || (dejaLa.length > 0 && nouveaux.length === 0)) continue;
    const [profondeur, cible, motif] = m.split('|');
    res.push({ type: 'proposition', profondeur, cible, motif, tickets, releves: es.map((e) => e.n), resume: `${motif} relevé dans ${tickets.length} tickets (${tickets.join(', ')}) : ${es.at(-1).resume}` });
  }
  return res;
}

export function proposer({ registre = REGISTRE, date = maintenant() } = {}) {
  const alteration = verifierRegistre(registre);
  if (alteration.length > 0) return { erreurs: alteration.map((e) => `registre altéré, ${e} : aucune proposition`) };
  const nouvelles = recurrences(lireRegistre(registre).enregistrements);
  ajouterAuRegistre(registre, nouvelles, date);
  return { erreurs: [], nouvelles };
}

export function decider(vise, { decision, par, raison, registre = REGISTRE, date = maintenant() }) {
  const alteration = verifierRegistre(registre);
  if (alteration.length > 0) return { erreurs: alteration.map((e) => `registre altéré, ${e}`) };
  const { propositions } = etatRegistre(lireRegistre(registre).enregistrements);
  const p = propositions.find((x) => x.n === vise);
  const erreurs = [];
  if (!p) erreurs.push(`n° ${vise} : pas une proposition du registre`);
  else if (p.decision) erreurs.push(`proposition n° ${vise} déjà décidée : ${p.decision.decision}`);
  if (!['retenue', 'refusee'].includes(decision)) erreurs.push('décision retenue ou refusee');
  if (!texte(par)) erreurs.push('--par : le développeur qui décide');
  if (!texte(raison)) erreurs.push('--raison : la raison de la décision');
  if (erreurs.length > 0) return { erreurs };
  ajouterAuRegistre(registre, [{ type: 'decision', vise, decision, par, raison }], date);
  return { erreurs: [] };
}

/** Tendance : par ticket, les entrées par profondeur et le coût relevé. */
export function tendance(enregistrements) {
  const parTicket = new Map();
  for (const e of enregistrements.filter((x) => x?.type === 'releve')) {
    if (!parTicket.has(e.cle)) parTicket.set(e.cle, { cle: e.cle, ...Object.fromEntries(PROFONDEURS.map((p) => [p, 0])), cout: null });
    const t = parTicket.get(e.cle);
    if (e.nature === 'cout') t.cout = e.resume;
    else t[e.profondeur] += 1;
  }
  return [...parTicket.values()];
}

// ---- Ligne de commande ----

const USAGE = `Usage :
  apprentissage.mjs noter <clé> --profondeur <p> --nature <n> --motif <m> --cible <c> --sens <s> --resume <texte> --preuve <type>:<ref> [--extrait <texte>]
  apprentissage.mjs qualifier <clé> --cout <pourcentage> --preuve <type>:<ref>
  apprentissage.mjs clore <clé> [--rattachement <fichier>] [--branche <ref>]
  apprentissage.mjs registre etat|verifier|proposer|tendance|propositions [--cible <c>]
  apprentissage.mjs registre decider <n> --decision retenue|refusee --par <nom> --raison <texte>
Options communes : --demandes <dossier>, --registre <fichier>, --date <AAAA-MM-JJTHH:MM:SSZ>`;

function lireOptions(reste) {
  const positions = [];
  const options = {};
  for (let k = 0; k < reste.length; k++) {
    if (!reste[k].startsWith('--')) positions.push(reste[k]);
    else if (reste[k + 1] === undefined) return null;
    else options[reste[k].slice(2)] = reste[++k];
  }
  return { positions, options };
}

const preuveDe = (o) => {
  const [type, ...ref] = String(o.preuve ?? '').split(':');
  return o.preuve ? { type, ref: ref.join(':'), ...(o.extrait ? { extrait: o.extrait } : {}) } : null;
};

/** Ligne de commande. Renvoie le code de sortie ; écrit par `sortie` et `erreur`. */
export function principal(argv, sortie = console.log, erreur = console.error) {
  const [commande, ...reste] = argv;
  const lu = lireOptions(reste);
  if (!lu) {
    erreur(USAGE);
    return 2;
  }
  const { positions, options: o } = lu;
  const communs = { demandes: o.demandes ?? DEMANDES, registre: o.registre ?? REGISTRE, ...(o.date ? { date: o.date } : {}) };
  const rendre = ({ erreurs }, succes) => {
    if (erreurs.length > 0) {
      for (const e of erreurs) erreur(`REFUS  ${e}`);
      return 1;
    }
    succes();
    return 0;
  };
  if (commande === 'noter' && positions.length === 1) {
    const e = { profondeur: o.profondeur, nature: o.nature, motif: o.motif, cible: o.cible, sens: o.sens, resume: o.resume, preuve: preuveDe(o) };
    return rendre(noter(positions[0], [e], communs), () => sortie(`noté dans le relevé de ${positions[0]} : ${e.profondeur}, ${e.nature}, ${e.motif}`));
  }
  if (commande === 'qualifier' && positions.length === 1 && o.cout !== undefined) {
    const e = { profondeur: 'macro', nature: 'cout', motif: 'cout-de-l-arbre', cible: 'generateur', sens: 'descente', resume: `somme des contextes de l'arbre : ${o.cout} % du point d'entrée de l'orchestrateur`, preuve: preuveDe(o) };
    return rendre(noter(positions[0], [e], communs), () => sortie(`coût de l'arbre noté dans le relevé de ${positions[0]} : ${o.cout} %`));
  }
  if (commande === 'clore' && positions.length === 1) {
    const cle = positions[0];
    const chemin = o.rattachement ?? join(dirname(fileURLToPath(import.meta.url)), 'rattachement.json');
    const rattachement = existsSync(chemin) ? JSON.parse(lire(chemin)) : null;
    const r = clore(cle, { ...communs, rattachement, branche: o.branche ?? 'HEAD' });
    return rendre(r, () => sortie(`relevé de ${cle} clos : ${r.remontee} entrée${r.remontee > 1 ? 's' : ''} de remontée, ${r.releve.entrees.length} versée${r.releve.entrees.length > 1 ? 's' : ''} au registre ; lance « registre proposer » pour les récurrences`));
  }
  if (commande === 'registre') {
    const [action, cible] = positions;
    if (action === 'verifier' || action === 'etat') {
      const alteration = verifierRegistre(communs.registre);
      if (alteration.length > 0) {
        for (const e of alteration) erreur(`ALTÉRÉ  ${e}`);
        return 1;
      }
      if (action === 'verifier') {
        sortie(`registre intact : ${lireRegistre(communs.registre).lignes.length} lignes`);
        return 0;
      }
      const { propositions, veille, releves } = etatRegistre(lireRegistre(communs.registre).enregistrements);
      sortie(`${releves.length} entrées de relevés, de ${new Set(releves.map((e) => e.cle)).size} tickets ; ${propositions.length} propositions`);
      for (const p of propositions) sortie(`  n° ${p.n} · ${p.profondeur} · ${p.cible} · ${p.motif} · ${p.decision ? `${p.decision.decision} par ${p.decision.par}` : 'en attente de ta décision'}`);
      for (const m of veille) sortie(`  en veille : ${m.replace(/\|/g, ' · ')}`);
      return 0;
    }
    if (action === 'proposer') {
      const r = proposer(communs);
      return rendre(r, () => {
        sortie(r.nouvelles.length === 0 ? 'aucune récurrence nouvelle' : `${r.nouvelles.length} proposition${r.nouvelles.length > 1 ? 's' : ''} nouvelle${r.nouvelles.length > 1 ? 's' : ''}, en attente de ta décision :`);
        for (const p of r.nouvelles) sortie(`  ${p.profondeur} · ${p.cible} · ${p.motif} : ${p.resume}`);
      });
    }
    if (action === 'decider' && cible !== undefined) {
      return rendre(decider(Number(cible), { ...communs, decision: o.decision, par: o.par, raison: o.raison }), () => sortie(`proposition n° ${cible} : ${o.decision}`));
    }
    if (action === 'tendance') {
      const t = tendance(lireRegistre(communs.registre).enregistrements);
      sortie(`| Ticket | ${PROFONDEURS.join(' | ')} | Coût |`);
      sortie(`| --- |${PROFONDEURS.map(() => ' --- |').join('')} --- |`);
      for (const x of t) sortie(`| ${x.cle} | ${PROFONDEURS.map((p) => x[p]).join(' | ')} | ${x.cout ?? '—'} |`);
      return 0;
    }
    if (action === 'propositions') {
      const { propositions } = etatRegistre(lireRegistre(communs.registre).enregistrements);
      const choisies = propositions.filter((p) => (!o.cible || p.cible === o.cible) && p.decision?.decision !== 'refusee');
      sortie(`# Propositions d'évolution${o.cible ? ` (${o.cible})` : ''}`);
      sortie('');
      for (const p of choisies) sortie(`- n° ${p.n}, ${p.profondeur}, \`${p.motif}\`, ${p.decision ? `retenue par ${p.decision.par} : ${p.decision.raison}` : 'en attente'} — ${p.resume}`);
      return 0;
    }
  }
  erreur(USAGE);
  return 2;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exitCode = principal(process.argv.slice(2));
