#!/usr/bin/env node
// Champ d'observation d'un arbre de skills de ticket (prototype « skill de ticket », lot 5, critère P5).
// Le skill racine en livre une copie, outils/champ.mjs, à côté de rattachement.json.
//
// Le champ, docs/demandes/<CLÉ>/champ.jsonl, reçoit en ajout seul ce que fait chaque niveau de l'arbre :
// les actions des agents, les retours du développeur (choix, corrections, ratifications), les
// observations des ordres 1, 2 et 3, et les écarts inscrits au registre des écarts du projet. Un
// enregistrement par ligne, au schéma fermé skill-ticket.observation/1 ; chaque ligne porte l'empreinte
// de la précédente, et champ.tete le numéro et l'empreinte de la dernière : une ligne réécrite, insérée
// ou supprimée se voit. Personne n'écrit le champ à la main : ce script dépose, vérifie et lit.
//
// Usage :
//   node champ.mjs deposer <dossier> <type> --noeud <référence> --auteur <nom> [--<champ> <valeur>]... [--date <AAAA-MM-JJTHH:MM:SSZ>]
//   node champ.mjs verifier <dossier>
//   node champ.mjs etat <dossier> [--json]
//   <dossier> : docs/demandes/<CLÉ> ; options communes : --rattachement <rattachement.json>, par défaut à
//   côté de ce script ; --registre <registre-ecarts.md>, par défaut docs/c7e/registre-ecarts.md du projet.
//
// Règles déterministes : deux corrections du développeur au même motif attendent une observation d'ordre
// 2 ; une proposition d'ordre 2 attend l'examen de l'ordre 3, puis la décision du développeur ; deux
// propositions refusées sur un motif attendent sa mise en veille par l'ordre 3 ; un écart sur un critère
// menace, de proche en proche, les critères qu'il soutient (visiteur des critères de l'arbre, construits
// depuis le rattachement) ; deux nœuds aux verdicts contraires sur une
// même ancre font un désaccord, inscrit d'office comme écart au registre des écarts (D6.INV-3 de
// l'orchestrateur). Codes de sortie : 0, 1 au moindre refus ou écart, 2 pour un usage incorrect.
// Node 20 ou plus récent, modules natifs uniquement.

import { createHash } from 'node:crypto';
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const FORMAT = 'skill-ticket.observation/1';
export const FICHIER = 'champ.jsonl';
export const TETE = 'champ.tete';
const VERROU = 'champ.verrou';

const TYPES = ['action', 'retour', 'observation', 'ecart'];
const COMMUNS = ['n', 'date', 'type', 'noeud', 'auteur', 'precedent'];
const CHAMPS = {
  action: { requis: ['nature', 'ancre', 'resume'], facultatifs: ['options'] },
  retour: { requis: ['nature', 'par', 'contenu'], facultatifs: ['vise', 'motif', 'objet', 'decision'] },
  observation: { requis: ['ordre', 'verdict', 'preuve'], facultatifs: ['ancre', 'observe', 'ecart', 'proposition', 'motif', 'commentaire', 'cout'] },
  ecart: { requis: ['ancre', 'invariant', 'constat'], facultatifs: ['observe'] },
};
const ANCRES = ['noeud', 'critere', 'ca', 'scenario', 'fichier', 'commit', 'contrat', 'option'];
const PREUVES = ['test', 'commande', 'commit', 'fichier', 'enregistrements', 'rapport'];
const VERDICTS = { 1: ['conforme', 'ecart'], 2: ['proposition', 'conforme'], 3: ['fondee', 'infondee', 'veille', 'bilan'] };
const MOTIF = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const INVARIANT_DESACCORD = 'désaccord entre nœuds (D6.INV-3)';

export const sha256 = (texte) => createHash('sha256').update(texte, 'utf8').digest('hex');
const estObjet = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const texte = (v) => typeof v === 'string' && v.trim() !== '';
const choisir = (o, cles) => Object.fromEntries(cles.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));
const lire = (chemin) => readFileSync(chemin, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
const slug = (reference) => reference.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const cheminSur = (rel) => texte(rel) && !/[\\\0]/.test(rel) && !rel.startsWith('/') && !/^[A-Za-z]:/.test(rel) && rel.split('/').every((s) => s !== '' && s !== '.' && s !== '..');

/** Forme canonique d'un enregistrement : les champs dans l'ordre du schéma, ceux des objets imbriqués aussi. */
export function canonique(e) {
  const schema = CHAMPS[e?.type];
  const cles = schema ? [...COMMUNS, ...schema.requis, ...schema.facultatifs] : COMMUNS;
  const o = {};
  for (const k of cles) {
    if (e[k] === undefined) continue;
    if (k === 'ancre' && estObjet(e[k])) o[k] = choisir(e[k], ['type', 'ref']);
    else if (k === 'preuve' && estObjet(e[k])) o[k] = choisir(e[k], ['nature', 'ref', 'extrait']);
    else if (k === 'cout' && estObjet(e[k])) o[k] = choisir(e[k], ['tokens', 'secondes']);
    else o[k] = e[k];
  }
  return o;
}

// ---- Contexte de l'arbre : ses nœuds, ses critères, ses critères d'acceptation ----

/** Rattachement de l'arbre, produit par la fabrique dans le skill racine. */
export function chargerRattachement(chemin = join(dirname(fileURLToPath(import.meta.url)), 'rattachement.json')) {
  if (!existsSync(chemin)) throw new Error(`rattachement introuvable : ${chemin}`);
  return JSON.parse(lire(chemin));
}

/**
 * Critère de l'arbre, dans le champ (patron Visiteur) : il accepte un visiteur, qui le visite après les
 * critères qui le soutiennent (`enfants`). Les critères se construisent depuis le rattachement du skill
 * racine, sans le modèle de l'arbre : le script tourne dans le skill racine installé.
 */
export class CritereChamp {
  constructor({ ref, noeud, ca, soutient = [] }) {
    Object.assign(this, { ref, noeud, ca, soutient, enfants: [] });
  }

  accepter(visiteur) {
    return visiteur.visiterCritere(this);
  }
}

/** Contexte des contrôles : nœuds, critères (référence → critère et ses soutiens), critères d'acceptation, observateurs. */
export function contexteDe(r) {
  const noeuds = new Map([[r.cle, { reference: r.cle, nature: 'racine', criteres: [] }]]);
  for (const n of r.noeuds) noeuds.set(n.reference, n);
  const criteres = new Map(r.criteres.map((c) => [c.critere, new CritereChamp({ ref: c.critere, noeud: r.cle, ca: [c.ca] })]));
  for (const n of r.noeuds) {
    for (const c of n.criteres) {
      const ref = `${n.reference}:${c.id}`;
      if (!criteres.has(ref)) criteres.set(ref, new CritereChamp({ ref, noeud: n.reference, ca: c.ca ?? [], soutient: c.soutient ?? [] }));
    }
  }
  for (const c of criteres.values()) for (const s of c.soutient) criteres.get(s)?.enfants.push(c.ref);
  const racine = `ticket-${slug(r.cle)}`;
  return {
    cle: r.cle,
    noeuds,
    criteres,
    cas: new Map(r.criteres.map((c) => [c.ca, c.critere])),
    sousTickets: r.noeuds.some((n) => n.reference !== r.cle),
    observateurs: { 2: `${racine}-observateur-2`, 3: `${racine}-observateur-3` },
  };
}

export const estFeuille = (ctx, reference) => ['feuille', 'racine et feuille'].includes(ctx.noeuds.get(reference)?.nature);

/** Clé d'une ancre ; un critère d'acceptation de la clé se confond avec le critère de la racine qui le porte. */
export function cleAncre(ancre, ctx) {
  if (ancre?.type === 'ca' && ctx.cas.has(ancre.ref)) return `critere:${ctx.cas.get(ancre.ref)}`;
  return `${ancre?.type}:${ancre?.ref}`;
}
export const decrireAncre = (a) => ({ critere: `critère ${a.ref}`, ca: `critère d'acceptation ${a.ref}`, contrat: `contrat « ${a.ref} »`, noeud: `nœud ${a.ref}` }[a.type] ?? `${a.type} ${a.ref}`);

// ---- Contrôle d'un enregistrement, contre ceux qui le précèdent ----

function controlerAncre(a, ctx, nom) {
  if (!estObjet(a)) return [`${nom} : ancre attendue, objet { type, ref }`];
  const err = [];
  for (const k of Object.keys(a)) if (!['type', 'ref'].includes(k)) err.push(`${nom} : ancre, champ inconnu ${k}`);
  if (!ANCRES.includes(a.type)) return [...err, `${nom} : ancre de type ${a.type} inconnu (${ANCRES.join(', ')})`];
  if (!texte(a.ref)) return [...err, `${nom} : ancre sans référence`];
  const valide = {
    noeud: () => ctx.noeuds.has(a.ref),
    critere: () => ctx.criteres.has(a.ref),
    ca: () => ctx.cas.has(a.ref),
    scenario: () => new RegExp(`^${ctx.cle}-S\\d{2,}$`).test(a.ref),
    fichier: () => cheminSur(a.ref),
    commit: () => /^[0-9a-f]{7,40}$/.test(a.ref),
    contrat: () => true,
    option: () => /^[a-z_]+\.[a-z_]+$/.test(a.ref),
  }[a.type]();
  if (!valide) err.push(`${nom} : ancre ${a.type} « ${a.ref} » inconnue de l'arbre ${ctx.cle} ou mal formée`);
  return err;
}

const retours = (avant, nature) => avant.filter((x) => x.type === 'retour' && x.nature === nature);
const propositions = (avant) => avant.filter((x) => x.type === 'observation' && x.ordre === 2 && x.verdict === 'proposition');
const decisionSur = (avant, n) => avant.find((x) => x.type === 'retour' && x.nature === 'choix' && x.vise === n);

/** Écarts d'un enregistrement au schéma et aux règles du champ, compte tenu des enregistrements précédents. */
export function controler(e, avant, ctx) {
  const nom = `n° ${e?.n ?? avant.length + 1}`;
  if (!estObjet(e)) return [`${nom} : objet attendu`];
  if (!TYPES.includes(e.type)) return [`${nom} : type ${e.type} inconnu (${TYPES.join(', ')})`];
  const { requis, facultatifs } = CHAMPS[e.type];
  const err = [];
  for (const k of Object.keys(e)) if (![...COMMUNS, ...requis, ...facultatifs].includes(k)) err.push(`${nom} : champ inconnu ${k}`);
  for (const k of [...COMMUNS, ...requis]) if (!(k in e)) err.push(`${nom} : champ absent ${k}`);
  if (err.length > 0) return err;

  if (e.n !== avant.length + 1) err.push(`${nom} : numéro ${e.n}, attendu ${avant.length + 1}`);
  if (!DATE.test(e.date ?? '')) err.push(`${nom} : date ${e.date}, attendu AAAA-MM-JJTHH:MM:SSZ en UTC`);
  else if (avant.length > 0 && e.date < avant.at(-1).date) err.push(`${nom} : date ${e.date} antérieure à celle du n° ${avant.length}, ${avant.at(-1).date}`);
  if (!ctx.noeuds.has(e.noeud)) err.push(`${nom} : nœud ${e.noeud} hors de l'arbre ${ctx.cle}`);
  if (!texte(e.auteur)) err.push(`${nom} : auteur vide`);
  const cible = (n) => (Number.isInteger(n) && n >= 1 && n < e.n ? avant[n - 1] : undefined);
  const references = (liste) => {
    if (!Array.isArray(liste) || liste.length === 0 || liste.some((n) => !cible(n)) || new Set(liste).size !== liste.length) {
      err.push(`${nom} : observe doit lister des enregistrements antérieurs, distincts`);
      return [];
    }
    return liste.map(cible);
  };
  const absents = (...cles) => {
    for (const k of cles) if (e[k] !== undefined) err.push(`${nom} : champ ${k} sans objet pour ${e.type}${e.nature ? ` ${e.nature}` : ''}${e.ordre ? ` d'ordre ${e.ordre}` : ''}`);
  };

  if (e.type === 'action') {
    if (!['proposition', 'realisation'].includes(e.nature)) err.push(`${nom} : nature ${e.nature} inconnue (proposition, realisation)`);
    err.push(...controlerAncre(e.ancre, ctx, nom));
    if (!texte(e.resume)) err.push(`${nom} : résumé vide`);
    if (e.nature === 'proposition' && (!Array.isArray(e.options) || e.options.length === 0 || !e.options.every(texte))) err.push(`${nom} : une proposition liste ses options`);
    if (e.nature === 'realisation') absents('options');
  }

  if (e.type === 'retour') {
    if (!texte(e.par)) err.push(`${nom} : retour sans le nom du développeur (par)`);
    if (!texte(e.contenu)) err.push(`${nom} : contenu vide`);
    if (e.nature === 'correction') {
      const visee = cible(e.vise);
      if (!visee || visee.type !== 'action') err.push(`${nom} : une correction vise une action antérieure (vise ${e.vise})`);
      if (!MOTIF.test(e.motif ?? '')) err.push(`${nom} : une correction porte un motif en minuscules et tirets (motif ${e.motif})`);
      absents('objet', 'decision');
    } else if (e.nature === 'choix') {
      const visee = cible(e.vise);
      absents('motif', 'objet');
      if (visee?.type === 'action' && visee.nature === 'proposition') {
        absents('decision');
        if (!visee.options.includes(e.contenu)) err.push(`${nom} : choix hors des options de la proposition n° ${e.vise}`);
        if (decisionSur(avant, e.vise)) err.push(`${nom} : la proposition n° ${e.vise} a déjà son choix`);
      } else if (visee?.type === 'observation' && visee.ordre === 2 && visee.verdict === 'proposition') {
        if (!['retenue', 'refusée'].includes(e.decision)) err.push(`${nom} : décision sur une proposition d'ordre 2, retenue ou refusée (decision ${e.decision})`);
        if (decisionSur(avant, e.vise)) err.push(`${nom} : la proposition n° ${e.vise} est déjà décidée`);
      } else err.push(`${nom} : un choix vise une proposition, action ou observation d'ordre 2 (vise ${e.vise})`);
    } else if (e.nature === 'ratification') {
      absents('vise', 'motif');
      const arbre = `arbre ${ctx.cle}`;
      const permis = e.noeud === ctx.cle && ctx.sousTickets ? [arbre] : estFeuille(ctx, e.noeud) ? [e.noeud] : [];
      if (!permis.includes(e.objet)) err.push(`${nom} : ratification de « ${e.objet} » par ${e.noeud} ; attendu ${permis.map((p) => `« ${p} »`).join(' ou ') || 'aucune : ce nœud ne se ratifie pas'}`);
      if (!['ratifié', 'non ratifié'].includes(e.decision)) err.push(`${nom} : décision ${e.decision}, attendu ratifié ou non ratifié`);
    } else err.push(`${nom} : nature ${e.nature} inconnue (choix, correction, ratification)`);
  }

  if (e.type === 'observation') {
    if (![1, 2, 3].includes(e.ordre)) err.push(`${nom} : ordre ${e.ordre}, attendu 1, 2 ou 3`);
    else if (!VERDICTS[e.ordre].includes(e.verdict)) err.push(`${nom} : verdict ${e.verdict} inconnu à l'ordre ${e.ordre} (${VERDICTS[e.ordre].join(', ')})`);
    if (!estObjet(e.preuve) || !PREUVES.includes(e.preuve.nature) || !texte(e.preuve.ref) || Object.keys(e.preuve).some((k) => !['nature', 'ref', 'extrait'].includes(k))) {
      err.push(`${nom} : preuve attendue, { nature (${PREUVES.join(', ')}), ref, extrait facultatif }`);
    }
    if (e.cout !== undefined && (!estObjet(e.cout) || Object.keys(e.cout).length === 0 || Object.entries(e.cout).some(([k, v]) => !['tokens', 'secondes'].includes(k) || typeof v !== 'number' || v < 0))) {
      err.push(`${nom} : coût attendu, { tokens, secondes }, nombres positifs`);
    }
    if (e.ordre === 1) {
      err.push(...controlerAncre(e.ancre, ctx, nom));
      absents('observe', 'proposition', 'motif');
      if (e.verdict === 'ecart' && !texte(e.ecart)) err.push(`${nom} : un verdict ecart décrit l'écart`);
      if (e.verdict === 'conforme') absents('ecart');
    } else if (e.ordre === 2 || e.ordre === 3) {
      absents('ancre');
      if (e.auteur !== ctx.observateurs[e.ordre]) err.push(`${nom} : une observation d'ordre ${e.ordre} vient de ${ctx.observateurs[e.ordre]}, pas de ${e.auteur}`);
      const observes = references(e.observe);
      if (e.ordre === 2) {
        absents('ecart');
        if (!MOTIF.test(e.motif ?? '')) err.push(`${nom} : une observation d'ordre 2 porte le motif qu'elle examine`);
        if (e.verdict === 'proposition') {
          if (!texte(e.proposition)) err.push(`${nom} : une proposition d'ordre 2 énonce l'adaptation proposée`);
          const corrections = observes.filter((x) => x.type === 'retour' && x.nature === 'correction' && x.motif === e.motif);
          if (corrections.length < 2) err.push(`${nom} : une proposition d'ordre 2 cite au moins deux corrections au motif ${e.motif}`);
        } else absents('proposition');
      } else {
        absents('ecart', 'proposition');
        const examinees = observes.filter((x) => x.type === 'observation' && x.ordre === 2 && x.verdict === 'proposition');
        if (e.verdict === 'fondee' || e.verdict === 'infondee') {
          if (examinees.length !== 1) err.push(`${nom} : un examen d'ordre 3 vise une seule proposition d'ordre 2`);
          else if (avant.some((x) => x.type === 'observation' && x.ordre === 3 && ['fondee', 'infondee'].includes(x.verdict) && x.observe.includes(examinees[0].n))) err.push(`${nom} : la proposition n° ${examinees[0].n} est déjà examinée`);
        } else if (e.verdict === 'veille') {
          if (!MOTIF.test(e.motif ?? '')) err.push(`${nom} : une mise en veille porte son motif`);
          const refusees = examinees.filter((p) => p.motif === e.motif && decisionSur(avant, p.n)?.decision === 'refusée');
          if (refusees.length < 2) err.push(`${nom} : une mise en veille cite au moins deux propositions refusées au motif ${e.motif}`);
        } else if (e.verdict === 'bilan') {
          if (!texte(e.commentaire)) err.push(`${nom} : un bilan d'ordre 3 se rédige dans commentaire`);
          const toutes = avant.filter((x) => x.type === 'observation' && x.ordre === 2).map((x) => x.n);
          if (toutes.some((n) => !e.observe?.includes(n))) err.push(`${nom} : un bilan d'ordre 3 cite toutes les observations d'ordre 2`);
        }
      }
    }
  }

  if (e.type === 'ecart') {
    err.push(...controlerAncre(e.ancre, ctx, nom));
    if (!texte(e.invariant)) err.push(`${nom} : invariant concerné vide`);
    if (!texte(e.constat)) err.push(`${nom} : constat vide`);
    if (e.observe !== undefined) references(e.observe);
  }
  return err;
}

// ---- Lecture et vérification du champ ----

/** Lignes et enregistrements du champ ; un champ absent est vide. */
export function lireChamp(dossier) {
  const chemin = join(dossier, FICHIER);
  const lignes = existsSync(chemin) ? lire(chemin).split('\n').filter((l) => l !== '') : [];
  // Une ligne qui n'est pas un objet JSON se lit comme un enregistrement illisible : verifier la signale,
  // l'état ne la compte pour rien.
  const enregistrements = lignes.map((l, i) => {
    try {
      const e = JSON.parse(l);
      return estObjet(e) ? e : { n: i + 1, type: 'illisible' };
    } catch {
      return { n: i + 1, type: 'illisible' };
    }
  });
  return { lignes, enregistrements };
}

function lireTete(dossier) {
  const chemin = join(dossier, TETE);
  if (!existsSync(chemin)) return null;
  try {
    return JSON.parse(lire(chemin));
  } catch {
    return { illisible: true };
  }
}

/** Désaccords : sur une même ancre, les derniers verdicts d'ordre 1 de deux nœuds sont contraires. */
export function desaccords(enregistrements, ctx) {
  const parAncre = new Map();
  for (const e of enregistrements) {
    if (e.type !== 'observation' || e.ordre !== 1 || !e.ancre) continue;
    const cle = cleAncre(e.ancre, ctx);
    if (!parAncre.has(cle)) parAncre.set(cle, new Map());
    parAncre.get(cle).set(e.noeud, e);
  }
  const res = [];
  for (const [cle, parNoeud] of parAncre) {
    const derniers = [...parNoeud.values()];
    const conformes = derniers.filter((o) => o.verdict === 'conforme');
    const ecarts = derniers.filter((o) => o.verdict === 'ecart');
    if (conformes.length > 0 && ecarts.length > 0) {
      res.push({ cle, ancre: ecarts[0].ancre, conformes, ecarts, ns: [...conformes, ...ecarts].map((o) => o.n).sort((a, b) => a - b) });
    }
  }
  return res;
}
const inscrit = (enregistrements, d) => enregistrements.find((x) => x.type === 'ecart' && d.ns.every((n) => x.observe?.includes(n)));

const registreParDefaut = (dossier) => join(resolve(dossier, '..', '..', '..'), 'docs', 'c7e', 'registre-ecarts.md');
const relatifAuProjet = (dossier, fichier) => relative(resolve(dossier, '..', '..', '..'), resolve(dossier, fichier)).split(sep).join('/');

/** Écarts du champ entier : lecture, schéma, numéros, dates, chaîne d'empreintes, tête, désaccords inscrits. */
export function verifierChamp(dossier, ctx, { registre = registreParDefaut(dossier) } = {}) {
  const { lignes, enregistrements } = lireChamp(dossier);
  const erreurs = [];
  const avant = [];
  lignes.forEach((ligne, i) => {
    const e = enregistrements[i];
    if (e.type === 'illisible') erreurs.push(`ligne ${i + 1} : JSON illisible`);
    else {
      erreurs.push(...controler(e, avant, ctx));
      if (JSON.stringify(canonique(e)) !== ligne) erreurs.push(`n° ${i + 1} : ligne non canonique, écrite hors de champ.mjs`);
      const attendu = i === 0 ? null : sha256(lignes[i - 1]);
      if (e.precedent !== attendu) erreurs.push(`n° ${i + 1} : empreinte du précédent différente ; la ligne ${i} a été réécrite, insérée ou supprimée`);
    }
    avant.push(e);
  });
  const tete = lireTete(dossier);
  if (lignes.length > 0) {
    if (!tete) erreurs.push(`${TETE} absent`);
    else if (tete.illisible) erreurs.push(`${TETE} illisible`);
    else if (tete.n !== lignes.length) erreurs.push(`${TETE} annonce le n° ${tete.n}, le champ s'arrête au n° ${lignes.length} : lignes supprimées ou ajoutées hors de champ.mjs`);
    else if (tete.empreinte !== sha256(lignes.at(-1))) erreurs.push(`${TETE} : la dernière ligne, n° ${lignes.length}, a été réécrite`);
  } else if (tete) erreurs.push(`${TETE} présent pour un champ vide`);
  // Chaque désaccord apparu au fil du champ a son écart inscrit, et chaque écart sa ligne au registre.
  for (let k = 0; k < avant.length; k++) {
    const e = avant[k];
    if (e.type !== 'observation' || e.ordre !== 1 || !e.ancre) continue;
    const d = desaccords(avant.slice(0, k + 1), ctx).find((x) => x.ns.includes(e.n));
    if (d && !inscrit(avant, d)) erreurs.push(`désaccord sur ${decrireAncre(d.ancre)} (n° ${d.ns.join(', ')}) sans écart inscrit au registre`);
  }
  const ecarts = avant.filter((x) => x.type === 'ecart');
  if (ecarts.length > 0) {
    const contenu = existsSync(registre) ? lire(registre) : null;
    if (contenu === null) erreurs.push(`registre des écarts absent : ${registre}`);
    else for (const x of ecarts) if (!contenu.includes(`${relatifAuProjet(dossier, FICHIER)}, n° ${x.n} |`)) erreurs.push(`écart n° ${x.n} absent du registre des écarts`);
  }
  return [...new Set(erreurs)];
}

// ---- État : ratifications, critères, désaccords, attentes ----

/** Dernière décision de ratification pour chaque objet (« arbre <CLÉ> » ou référence d'une feuille). */
export function ratifications(enregistrements) {
  const res = new Map();
  for (const e of enregistrements) if (e.type === 'retour' && e.nature === 'ratification') res.set(e.objet, e);
  return res;
}
export const estRatifie = (enregistrements, objet) => ratifications(enregistrements).get(objet)?.decision === 'ratifié';

/**
 * Visiteur des états : un critère est en écart si le dernier verdict d'ordre 1 d'un nœud sur lui est un
 * écart ; menacé si un critère qui le soutient est en écart ou menacé, de proche en proche jusqu'au critère
 * d'acceptation ; prouvé par un verdict conforme, ou quand tous ceux qui le soutiennent sont prouvés ; à
 * prouver sinon. Chaque critère n'est visité qu'une fois, même soutenant plusieurs critères.
 */
export class VisiteurEtats {
  constructor(enregistrements, ctx) {
    this.ctx = ctx;
    this.memo = new Map();
    this.derniers = new Map();
    for (const e of enregistrements) {
      if (e.type !== 'observation' || e.ordre !== 1 || !['critere', 'ca'].includes(e.ancre?.type)) continue;
      const ref = e.ancre.type === 'ca' ? ctx.cas.get(e.ancre.ref) : e.ancre.ref;
      if (!ref) continue;
      if (!this.derniers.has(ref)) this.derniers.set(ref, new Map());
      this.derniers.get(ref).set(e.noeud, e);
    }
  }

  visiterCritere(c) {
    if (this.memo.has(c.ref)) return this.memo.get(c.ref);
    const propres = [...(this.derniers.get(c.ref)?.values() ?? [])];
    const ecarts = propres.filter((o) => o.verdict === 'ecart');
    const enfants = c.enfants.map((ref) => this.ctx.criteres.get(ref).accepter(this));
    const menaces = enfants.filter((x) => x.etat === 'en écart' || x.etat === 'menacé');
    let res;
    if (ecarts.length > 0) res = { etat: 'en écart', observations: ecarts.map((o) => o.n), causes: [] };
    else if (menaces.length > 0) res = { etat: 'menacé', causes: [...new Set(menaces.flatMap((x) => (x.etat === 'en écart' ? [x.ref] : x.causes)))] };
    else if (propres.some((o) => o.verdict === 'conforme') || (enfants.length > 0 && enfants.every((x) => x.etat === 'prouvé'))) res = { etat: 'prouvé', causes: [] };
    else res = { etat: 'à prouver', causes: [] };
    Object.assign(res, { ref: c.ref, noeud: c.noeud, ca: c.ca });
    this.memo.set(c.ref, res);
    return res;
  }
}

/** État de chaque critère de l'arbre, dans l'ordre du rattachement : en écart, menacé, prouvé ou à prouver. */
export function etatsCriteres(enregistrements, ctx) {
  const visiteur = new VisiteurEtats(enregistrements, ctx);
  return [...ctx.criteres.values()].map((c) => c.accepter(visiteur));
}

/** Observations attendues : ordre 2 sur un motif, ordre 3 sur une proposition, décision du développeur, mise en veille. */
export function attentes(enregistrements, ctx) {
  const res = [];
  const corrections = retours(enregistrements, 'correction');
  const props = propositions(enregistrements);
  const ordre2 = enregistrements.filter((x) => x.type === 'observation' && x.ordre === 2);
  const ordre3 = enregistrements.filter((x) => x.type === 'observation' && x.ordre === 3);
  for (const motif of [...new Set(corrections.map((c) => c.motif))]) {
    let refusees = [];
    for (const p of props.filter((x) => x.motif === motif)) {
      const d = decisionSur(enregistrements, p.n)?.decision;
      if (d === 'retenue') refusees = [];
      else if (d === 'refusée') refusees.push(p.n);
    }
    if (refusees.length >= 2) {
      if (!ordre3.some((o) => o.verdict === 'veille' && o.motif === motif)) res.push({ nature: 'veille', motif, propositions: refusees, observateur: ctx.observateurs[3] });
      continue;
    }
    const couvertes = new Set(ordre2.filter((o) => o.motif === motif).flatMap((o) => o.observe));
    const restantes = corrections.filter((c) => c.motif === motif && !couvertes.has(c.n)).map((c) => c.n);
    if (restantes.length >= 2) res.push({ nature: 'ordre-2', motif, corrections: restantes, observateur: ctx.observateurs[2] });
  }
  for (const p of props) {
    if (decisionSur(enregistrements, p.n)) continue;
    const examen = ordre3.find((o) => ['fondee', 'infondee'].includes(o.verdict) && o.observe.includes(p.n));
    res.push(examen
      ? { nature: 'developpeur', proposition: p.n, examen: examen.n, verdict: examen.verdict, motif: p.motif }
      : { nature: 'ordre-3', proposition: p.n, motif: p.motif, observateur: ctx.observateurs[3] });
  }
  return res;
}
const cleAttente = (a) => JSON.stringify([a.nature, a.motif, a.proposition ?? null, a.corrections ?? a.propositions ?? null]);

/** État du champ : ratifications, critères, désaccords, attentes et veilles. */
export function etatChamp(enregistrements, ctx) {
  return {
    cle: ctx.cle,
    enregistrements: enregistrements.length,
    ratifications: [...ratifications(enregistrements).values()].map((e) => ({ objet: e.objet, decision: e.decision, n: e.n, date: e.date, par: e.par })),
    criteres: etatsCriteres(enregistrements, ctx),
    desaccords: desaccords(enregistrements, ctx).map((d) => ({ ancre: d.ancre, conformes: d.conformes.map((o) => ({ noeud: o.noeud, n: o.n })), ecarts: d.ecarts.map((o) => ({ noeud: o.noeud, n: o.n, ecart: o.ecart })), inscrit: inscrit(enregistrements, d)?.n ?? null })),
    attentes: attentes(enregistrements, ctx),
    veilles: enregistrements.filter((x) => x.type === 'observation' && x.ordre === 3 && x.verdict === 'veille').map((x) => ({ motif: x.motif, n: x.n })),
  };
}

const liste = (ns) => ns.join(', ');

/** Texte de l'état, tel que l'affiche `etat`. */
export function formaterEtat(etat, verification = []) {
  const lignes = [`Champ de ${etat.cle} : ${etat.enregistrements} enregistrement${etat.enregistrements > 1 ? 's' : ''}, ${verification.length === 0 ? 'chaîne intacte' : `${verification.length} écart${verification.length > 1 ? 's' : ''} à la vérification`}.`];
  lignes.push('Ratifications :');
  if (etat.ratifications.length === 0) lignes.push('  aucune');
  for (const r of etat.ratifications) lignes.push(`  ${r.objet} : ${r.decision} (n° ${r.n}, ${r.date.slice(0, 10)}, ${r.par})`);
  lignes.push('Critères :');
  for (const c of etat.criteres) {
    const ca = c.ca.length > 0 ? ` (${c.ca.join(', ')})` : '';
    const detail = c.etat === 'en écart'
      ? `en écart, n° ${liste(c.observations)} ; à traiter par ${c.noeud}${c.noeud === etat.cle ? '' : ', à l\'ordre 1'}`
      : c.etat === 'menacé' ? `menacé par ${c.causes.join(', ')}` : c.etat;
    lignes.push(`  ${c.ref}${ca} : ${detail}`);
  }
  lignes.push('Désaccords :');
  if (etat.desaccords.length === 0) lignes.push('  aucun');
  for (const d of etat.desaccords) {
    const parts = [...d.conformes.map((o) => `${o.noeud} conforme (n° ${o.n})`), ...d.ecarts.map((o) => `${o.noeud} en écart (n° ${o.n})`)];
    lignes.push(`  ${decrireAncre(d.ancre)} : ${parts.join(', ')} ; ${d.inscrit ? `écart n° ${d.inscrit} au registre, décision au développeur` : 'à inscrire au registre'}`);
  }
  lignes.push('Attentes :');
  if (etat.attentes.length === 0) lignes.push('  aucune');
  for (const a of etat.attentes) {
    if (a.nature === 'ordre-2') lignes.push(`  ordre 2, motif ${a.motif}, corrections n° ${liste(a.corrections)} : invoquer ${a.observateur}`);
    if (a.nature === 'ordre-3') lignes.push(`  ordre 3, proposition n° ${a.proposition} (motif ${a.motif}) : invoquer ${a.observateur}`);
    if (a.nature === 'developpeur') lignes.push(`  développeur, proposition n° ${a.proposition} (motif ${a.motif}), examinée au n° ${a.examen}, ${a.verdict === 'fondee' ? 'fondée' : 'infondée'} : retenue ou refusée`);
    if (a.nature === 'veille') lignes.push(`  veille, motif ${a.motif}, propositions refusées n° ${liste(a.propositions)} : invoquer ${a.observateur}`);
  }
  lignes.push(`Veilles : ${etat.veilles.length === 0 ? 'aucune' : etat.veilles.map((v) => `motif ${v.motif} (n° ${v.n})`).join(', ')}`);
  return lignes.join('\n');
}

// ---- Dépôt ----

const maintenant = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
const attendre = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function verrouiller(dossier) {
  const chemin = join(dossier, VERROU);
  for (let k = 0; k < 50; k++) {
    try {
      closeSync(openSync(chemin, 'wx'));
      return () => rmSync(chemin, { force: true });
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      attendre(100);
    }
  }
  throw new Error(`champ verrouillé par un autre dépôt ; si aucun dépôt n'est en cours, supprimer ${chemin}`);
}

const cellule = (t) => String(t).replace(/\|/g, '\\|').replace(/\n+/g, ' ');

function inscrireAuRegistre(registre, dossier, e) {
  mkdirSync(dirname(registre), { recursive: true });
  if (!existsSync(registre)) {
    writeFileSync(registre, '# Registre des écarts\n\n| Date | Ticket | Invariant concerné | Écart constaté | Décision (respecter, ou dérogation validée par) |\n|---|---|---|---|---|\n');
  }
  const contenu = lire(registre);
  const ligne = `| ${e.date.slice(0, 10)} | ${cellule(e.noeud)} | ${cellule(e.invariant)} | ${cellule(`${decrireAncre(e.ancre)} : ${e.constat}`)} ; champ ${relatifAuProjet(dossier, FICHIER)}, n° ${e.n} |  |\n`;
  writeFileSync(registre, `${contenu.replace(/\n*$/, '\n')}${ligne}`);
}

/**
 * Dépose un enregistrement dans le champ : contrôle du champ existant, puis de l'enregistrement, ajout en
 * fin de fichier avec la chaîne et la tête, et, si l'observation fait naître un désaccord, l'écart inscrit
 * d'office au registre. Renvoie { erreurs, deposes, attentes } ; rien n'est écrit au moindre écart.
 */
export function deposer(dossier, partiel, { contexte, rattachement, registre = registreParDefaut(dossier), date } = {}) {
  const ctx = contexte ?? contexteDe(chargerRattachement(rattachement));
  if (basename(resolve(dossier)) !== ctx.cle) return { erreurs: [`le dossier doit être celui de la clé ${ctx.cle} : ${dossier}`], deposes: [], attentes: [] };
  mkdirSync(dossier, { recursive: true });
  const liberer = verrouiller(dossier);
  try {
    const existant = verifierChamp(dossier, ctx, { registre });
    if (existant.length > 0) return { erreurs: ['champ altéré, dépôt refusé', ...existant], deposes: [], attentes: [] };
    const { lignes, enregistrements } = lireChamp(dossier);
    // Contrôle sur l'enregistrement tel que reçu : un champ hors schéma est refusé, pas écarté en silence.
    const brut = Object.fromEntries(Object.entries({ ...partiel, n: lignes.length + 1, date: date ?? maintenant(), precedent: lignes.length > 0 ? sha256(lignes.at(-1)) : null }).filter(([, v]) => v !== undefined));
    const erreurs = controler(brut, enregistrements, ctx);
    if (erreurs.length > 0) return { erreurs, deposes: [], attentes: [] };
    const e = canonique(brut);
    const nouveaux = [e];
    if (e.type === 'observation' && e.ordre === 1) {
      const tous = [...enregistrements, e];
      const d = desaccords(tous, ctx).find((x) => x.ns.includes(e.n));
      if (d && !inscrit(tous, d)) {
        const constat = [
          ...d.conformes.map((o) => `${o.noeud} conforme (n° ${o.n})`),
          ...d.ecarts.map((o) => `${o.noeud} en écart (n° ${o.n}), ${o.ecart}`),
        ].join(' ; ');
        nouveaux.push(canonique({
          n: e.n + 1, date: e.date, type: 'ecart', noeud: ctx.cle, auteur: 'champ.mjs', precedent: sha256(JSON.stringify(e)),
          ancre: e.ancre, invariant: INVARIANT_DESACCORD, constat, observe: d.ns,
        }));
      }
    }
    for (const x of nouveaux) if (x.type === 'ecart') inscrireAuRegistre(registre, dossier, x);
    for (const x of nouveaux) appendFileSync(join(dossier, FICHIER), `${JSON.stringify(x)}\n`);
    const dernier = JSON.stringify(nouveaux.at(-1));
    writeFileSync(join(dossier, TETE), `${JSON.stringify({ format: FORMAT, n: nouveaux.at(-1).n, empreinte: sha256(dernier) })}\n`);
    const avant = new Set(attentes(enregistrements, ctx).map(cleAttente));
    const apres = attentes([...enregistrements, ...nouveaux], ctx);
    return { erreurs: [], deposes: nouveaux, attentes: apres.filter((a) => !avant.has(cleAttente(a))) };
  } finally {
    liberer();
  }
}

// ---- Ligne de commande ----

const DRAPEAUX = {
  noeud: 's', auteur: 's', nature: 's', ancre: 'ancre', resume: 's', option: 'liste', par: 's', contenu: 's', vise: 'n', motif: 's',
  objet: 's', decision: 's', ordre: 'n', verdict: 's', preuve: 'preuve', extrait: 's', observe: 'ns', ecart: 's', proposition: 's',
  commentaire: 's', tokens: 'n', secondes: 'n', invariant: 's', constat: 's',
};

const separer = (valeur, quoi) => {
  const i = valeur.indexOf(':');
  if (i <= 0) throw new Error(`${quoi} attendu sous la forme <type>:<référence>, reçu « ${valeur} »`);
  return [valeur.slice(0, i), valeur.slice(i + 1)];
};

/** Enregistrement d'après les options de la ligne de commande. */
export function enregistrementDe(type, options) {
  const e = { type };
  for (const [cle, valeur] of Object.entries(options)) {
    const sorte = DRAPEAUX[cle];
    if (!sorte) throw new Error(`option inconnue : --${cle}`);
    if (sorte === 's') e[cle] = valeur.at(-1);
    else if (sorte === 'n') e[cle] = Number(valeur.at(-1));
    else if (sorte === 'ns') e[cle] = valeur.at(-1).split(/[\s,]+/).filter(Boolean).map(Number);
    else if (sorte === 'liste') e.options = valeur;
    else if (sorte === 'ancre') {
      const [t, ref] = separer(valeur.at(-1), 'ancre');
      e.ancre = { type: t, ref };
    } else if (sorte === 'preuve') {
      const [nature, ref] = separer(valeur.at(-1), 'preuve');
      e.preuve = { nature, ref };
    }
  }
  if (e.preuve && e.extrait !== undefined) e.preuve.extrait = e.extrait;
  delete e.extrait;
  if (e.tokens !== undefined || e.secondes !== undefined) e.cout = choisir({ tokens: e.tokens, secondes: e.secondes }, ['tokens', 'secondes']);
  delete e.tokens;
  delete e.secondes;
  return e;
}

function analyser(argv) {
  const positionnels = [];
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const cle = argv[i].slice(2);
      if (cle === 'json') {
        options.json = ['oui'];
        continue;
      }
      if (i + 1 >= argv.length) throw new Error(`--${cle} sans valeur`);
      (options[cle] ??= []).push(argv[++i]);
    } else positionnels.push(argv[i]);
  }
  return { positionnels, options };
}

const USAGE = [
  'Usage : node champ.mjs deposer <dossier> <type> --noeud <référence> --auteur <nom> [--<champ> <valeur>]... [--date <AAAA-MM-JJTHH:MM:SSZ>]',
  '        node champ.mjs verifier <dossier>',
  '        node champ.mjs etat <dossier> [--json]',
  'Options communes : --rattachement <rattachement.json>, --registre <registre-ecarts.md>',
].join('\n');

/** Ligne de commande. Renvoie le code de sortie. */
export function principal(argv, sortie = console.log, erreur = console.error) {
  let analyse;
  try {
    analyse = analyser(argv);
  } catch (e) {
    erreur(`${e.message}\n${USAGE}`);
    return 2;
  }
  const { positionnels, options } = analyse;
  const [commande, dossier, type] = positionnels;
  const commun = (cle) => {
    const v = options[cle]?.at(-1);
    delete options[cle];
    return v;
  };
  const cheminRattachement = commun('rattachement');
  const registre = commun('registre');
  const date = commun('date');
  const json = Boolean(commun('json'));
  if (!['deposer', 'verifier', 'etat'].includes(commande) || !dossier || (commande === 'deposer') !== Boolean(type) || positionnels.length > (commande === 'deposer' ? 3 : 2)) {
    erreur(USAGE);
    return 2;
  }
  let ctx;
  try {
    ctx = contexteDe(chargerRattachement(cheminRattachement ? resolve(cheminRattachement) : undefined));
  } catch (e) {
    erreur(e.message);
    return 2;
  }
  const optionsRegistre = registre ? { registre: resolve(registre) } : {};
  if (commande === 'verifier' || commande === 'etat') {
    if (Object.keys(options).length > 0 || date || (json && commande === 'verifier')) {
      erreur(USAGE);
      return 2;
    }
    const verification = verifierChamp(dossier, ctx, optionsRegistre);
    if (commande === 'verifier') {
      if (verification.length > 0) {
        for (const e of verification) erreur(`ÉCART  ${e}`);
        erreur(`${verification.length} écart${verification.length > 1 ? 's' : ''}`);
        return 1;
      }
      sortie(`Champ de ${ctx.cle} : ${lireChamp(dossier).lignes.length} enregistrements, schéma ${FORMAT} respecté, chaîne et tête intactes, désaccords inscrits au registre`);
      return 0;
    }
    const etat = etatChamp(lireChamp(dossier).enregistrements, ctx);
    sortie(json ? JSON.stringify({ ...etat, verification }, null, 2) : formaterEtat(etat, verification));
    for (const e of verification) erreur(`ÉCART  ${e}`);
    return verification.length > 0 ? 1 : 0;
  }
  let partiel;
  try {
    partiel = enregistrementDe(type, options);
  } catch (e) {
    erreur(`${e.message}\n${USAGE}`);
    return 2;
  }
  let resultat;
  try {
    resultat = deposer(dossier, partiel, { contexte: ctx, ...optionsRegistre, ...(date ? { date } : {}) });
  } catch (e) {
    erreur(`REFUS  ${e.message}`);
    return 1;
  }
  if (resultat.erreurs.length > 0) {
    for (const e of resultat.erreurs) erreur(`REFUS  ${e}`);
    return 1;
  }
  for (const x of resultat.deposes) {
    sortie(x.type === 'ecart'
      ? `n° ${x.n} déposé : écart, ${x.invariant}, inscrit au registre des écarts`
      : `n° ${x.n} déposé : ${x.type}${x.nature ? ` ${x.nature}` : ''}${x.ordre ? ` d'ordre ${x.ordre}, ${x.verdict}` : ''}`);
  }
  for (const a of resultat.attentes) {
    if (a.nature === 'ordre-2') sortie(`attente : ordre 2, motif ${a.motif}, corrections n° ${liste(a.corrections)} ; invoquer ${a.observateur}`);
    if (a.nature === 'ordre-3') sortie(`attente : ordre 3, proposition n° ${a.proposition} ; invoquer ${a.observateur}`);
    if (a.nature === 'developpeur') sortie(`attente : décision du développeur sur la proposition n° ${a.proposition}, retenue ou refusée`);
    if (a.nature === 'veille') sortie(`attente : mise en veille du motif ${a.motif} ; invoquer ${a.observateur}`);
  }
  return 0;
}

const estPrincipal = process.argv[1] && fileURLToPath(import.meta.url).toLowerCase() === resolve(process.argv[1]).toLowerCase();
if (estPrincipal) process.exitCode = principal(process.argv.slice(2));
