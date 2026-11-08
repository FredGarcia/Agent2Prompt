#!/usr/bin/env node
// Vue augmentée d'un arbre de skills de ticket (prototype « skill de ticket », lot 6, critère P6).
// Le skill racine en livre une copie, outils/vue.mjs, à côté de champ.mjs, de verifier-documents.mjs et
// de rattachement.json.
//
// Le ticket n'est jamais réécrit : ses ancres (critères d'acceptation de us.md, critères des nœuds du
// rattachement, scénarios du fichier Gherkin, nœuds) portent, posés sur elles, les calques de ce que le
// champ d'observation en dit : ordre 1, ordre 2, ordre 3 et humain (patron Décorateur). La pile d'une
// ancre réunit les enregistrements qui l'atteignent, par leur ancre ou par ce qu'ils visent ou observent ;
// son état la résume. Les ancres que seul le champ connaît s'y ajoutent, nées du champ. Un visiteur des
// critères de l'arbre range la vue par critère d'acceptation, chaque critère suivi de ceux qui le
// soutiennent ; ce qui est à traiter vient d'abord : désaccords, écarts, menaces, observations attendues.
//
// Usage :
//   node vue.mjs generer <dossier> [--noeud <référence>] [--json]
//   node vue.mjs verifier <dossier>
//   <dossier> : docs/demandes/<CLÉ> ; options communes : --rattachement <rattachement.json>, par défaut à
//   côté de ce script ; --registre <registre-ecarts.md>, comme pour champ.mjs.
//
// generer écrit vue.html, pour le développeur, et vue.md dans le dossier ; avec --noeud, écrit sur la
// sortie la vue de ce nœud en Markdown, sans rien écrire ; avec --json, le modèle de la vue. verifier
// compare les vues écrites à celles que donnent le champ et les documents actuels. Un champ altéré ne
// donne pas de vue. Codes de sortie : 0, 1 au moindre écart, 2 pour un usage incorrect. Node 20 ou plus
// récent, modules natifs uniquement.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { attentes, chargerRattachement, cleAncre, contexteDe, decrireAncre, desaccords, estFeuille, etatsCriteres, lireChamp, ratifications, sha256, verifierChamp } from './champ.mjs';
import { criteresDeUs, scenariosDeFeature } from './verifier-documents.mjs';

export const FORMAT_VUE = 'skill-ticket.vue/1';
export const FICHIERS_VUE = ['vue.html', 'vue.md'];

/** Les quatre calques, dans l'ordre où ils se posent sur une ancre. */
export const CALQUES = [
  { nom: 'ordre-1', titre: 'Ordre 1', legende: 'actions, verdicts et écarts des agents et des skills' },
  { nom: 'ordre-2', titre: 'Ordre 2', legende: 'propositions de l\'observateur d\'ordre 2 de l\'arbre' },
  { nom: 'ordre-3', titre: 'Ordre 3', legende: 'examens, veilles et bilan de l\'observateur d\'ordre 3' },
  { nom: 'humain', titre: 'Humain', legende: 'retours du développeur : choix, corrections, ratifications' },
];

/** États d'une ancre : symbole d'appoint (le texte porte l'état) et famille d'affichage. */
export const ETATS = {
  'en désaccord': { symbole: '≠', famille: 'grave' },
  'en écart': { symbole: '✗', famille: 'grave' },
  menacé: { symbole: '▲', famille: 'alerte' },
  'à reprendre': { symbole: '↺', famille: 'alerte' },
  'non ratifié': { symbole: '✗', famille: 'alerte' },
  'à prouver': { symbole: '○', famille: 'neutre' },
  'à réaliser': { symbole: '○', famille: 'neutre' },
  'à ratifier': { symbole: '○', famille: 'neutre' },
  'non observée': { symbole: '○', famille: 'neutre' },
  'sans ratification propre': { symbole: '·', famille: 'neutre' },
  prouvé: { symbole: '✓', famille: 'bon' },
  réalisé: { symbole: '✓', famille: 'bon' },
  ratifié: { symbole: '✓', famille: 'bon' },
  conforme: { symbole: '✓', famille: 'bon' },
};

/** Gravités de « À traiter », dans l'ordre d'affichage. */
export const GRAVITES = ['en désaccord', 'en écart', 'menacé', 'attente'];

/** Marques posées sur une ancre, en plus de son état. */
export const LIBELLES_MARQUES = { desaccord: 'Désaccord', attente: 'Attente', veille: 'Veille' };

const lire = (chemin) => readFileSync(chemin, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
const lireSiPresent = (chemin) => (existsSync(chemin) ? lire(chemin) : null);
const liste = (ns) => ns.join(', ');
const date = (iso) => `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
const echapperRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Calque d'un enregistrement : les retours vont au calque humain, les observations à celui de leur ordre. */
export const calqueDe = (e) => (e.type === 'retour' ? 'humain' : e.type === 'observation' ? `ordre-${e.ordre}` : 'ordre-1');

// ---- Ancres et calques (patron Décorateur) ----

/**
 * Ancre de la vue, telle que le ticket la porte ou que le champ l'a fait naître : composant de base,
 * que les calques décorent. Ses données (type, référence, énoncé, état, marques) ne changent pas quand
 * un calque se pose ou se masque.
 */
export class AncreVue {
  constructor(donnees) {
    Object.assign(this, donnees);
  }

  base() {
    return this;
  }

  calques() {
    return [];
  }

  rendre(format, niveau) {
    return format.ancre(this, niveau);
  }
}

/**
 * Calque posé sur une ancre (patron Décorateur) : il garde l'interface de l'ancre qu'il recouvre et y
 * ajoute les enregistrements d'un ordre d'observation, sans toucher à son état.
 */
export class Calque {
  constructor(sous, nom, enregistrements) {
    Object.assign(this, { sous, nom, enregistrements });
  }

  base() {
    return this.sous.base();
  }

  calques() {
    return [...this.sous.calques(), { nom: this.nom, enregistrements: this.enregistrements }];
  }

  rendre(format, niveau) {
    return `${this.sous.rendre(format, niveau)}${format.calque(this.nom, this.enregistrements)}`;
  }
}

/** Pose sur une ancre un calque par ordre qui a quelque chose à dire, dans l'ordre des calques. */
export function poserCalques(ancre, pile) {
  let vue = ancre;
  for (const { nom } of CALQUES) {
    const es = pile.filter((e) => calqueDe(e) === nom);
    if (es.length > 0) vue = new Calque(vue, nom, es);
  }
  return vue;
}

/** Visiteur du rangement : chaque critère, suivi des critères qui le soutiennent, jusqu'aux feuilles. */
export class VisiteurRangement {
  constructor(ctx) {
    this.ctx = ctx;
  }

  visiterCritere(c) {
    return { cle: `critere:${c.ref}`, enfants: c.enfants.map((ref) => this.ctx.criteres.get(ref).accepter(this)) };
  }
}

// ---- Piles : ce qui atteint chaque ancre ----

/**
 * Ancres qu'atteint chaque enregistrement : la sienne pour une action, une observation d'ordre 1 ou un
 * écart ; celles de ce qu'il vise pour une correction ou un choix ; son ancre, s'il en a une, et celles
 * de ce qu'il observe pour une observation d'ordre 2 ou 3 ; son nœud pour une ratification.
 */
export function ancresAtteintes(enregistrements, ctx) {
  const memo = new Map();
  const de = (e) => {
    if (memo.has(e.n)) return memo.get(e.n);
    memo.set(e.n, []);
    let res = [];
    if (e.type === 'action' || e.type === 'ecart' || (e.type === 'observation' && e.ordre === 1)) res = [cleAncre(e.ancre, ctx)];
    else if (e.type === 'retour') res = e.nature === 'ratification' ? [`noeud:${e.noeud}`] : de(enregistrements[e.vise - 1]);
    else if (e.type === 'observation') res = [...new Set([...(e.ancre ? [cleAncre(e.ancre, ctx)] : []), ...(e.observe ?? []).flatMap((n) => de(enregistrements[n - 1]))])];
    memo.set(e.n, res);
    return res;
  };
  return new Map(enregistrements.map((e) => [e.n, de(e)]));
}

// ---- Construction de la vue ----

/** Documents de la clé dans le dossier de la demande : critères de us.md, scénarios du fichier Gherkin. */
function documentsDe(dossier, cle) {
  const us = lireSiPresent(join(dossier, 'us.md'));
  const feature = lireSiPresent(join(dossier, `${cle}.feature`));
  return { criteres: us === null ? new Map() : criteresDeUs(us), scenarios: feature === null ? [] : scenariosDeFeature(feature).filter((s) => s.id) };
}

function titreDe(a) {
  if (a.type === 'critere') return a.ca ? `${a.ca} · ${a.ref}` : a.ref;
  if (a.type === 'scenario') return a.titre ? `${a.ref} · ${a.titre}` : `${a.ref} (absent du fichier Gherkin)`;
  if (a.type === 'noeud') return `${a.ref} (${a.nature})`;
  return decrireAncre({ type: a.type, ref: a.ref });
}

/**
 * Vue d'un arbre : { erreurs } si le champ est altéré, sinon { vue } avec les ancres décorées de leurs
 * calques, leur rangement, ce qui est à traiter et l'état du champ dont elle est tirée.
 */
export function construireVue(dossier, { rattachement, registre } = {}) {
  const r = rattachement ?? chargerRattachement();
  const ctx = contexteDe(r);
  if (basename(resolve(dossier)) !== ctx.cle) return { erreurs: [`le dossier doit être celui de la clé ${ctx.cle} : ${dossier}`] };
  const verification = verifierChamp(dossier, ctx, registre ? { registre } : {});
  if (verification.length > 0) return { erreurs: ['champ altéré, vue non générée', ...verification] };
  const { lignes, enregistrements } = lireChamp(dossier);
  const documents = documentsDe(dossier, ctx.cle);
  const caDe = new RegExp(`^@${echapperRegex(ctx.cle)}-CA\\d{2,}$`);

  // Ancres du ticket : critères d'acceptation et critères des nœuds, scénarios, nœuds.
  const donnees = new Map();
  for (const c of r.criteres) {
    const us = documents.criteres.get(c.ca);
    donnees.set(`critere:${c.critere}`, { type: 'critere', ref: c.critere, ca: c.ca, cas: [c.ca], noeud: ctx.cle, enonce: us?.enonce || c.enonce, statut: us?.statut || null, origine: 'ticket' });
  }
  for (const n of r.noeuds) {
    for (const c of n.criteres) {
      const ref = `${n.reference}:${c.id}`;
      if (!donnees.has(`critere:${ref}`)) donnees.set(`critere:${ref}`, { type: 'critere', ref, ca: null, cas: c.ca ?? [], soutient: c.soutient ?? [], noeud: n.reference, enonce: c.enonce ?? null, statut: null, origine: 'ticket' });
    }
  }
  for (const s of documents.scenarios) {
    donnees.set(`scenario:${s.id}`, { type: 'scenario', ref: s.id, titre: s.titre, etiquettes: s.etiquettes, cas: s.etiquettes.filter((e) => caDe.test(e)).map((e) => e.slice(1)), origine: 'ticket' });
  }
  for (const n of ctx.noeuds.values()) donnees.set(`noeud:${n.reference}`, { type: 'noeud', ref: n.reference, nature: n.nature, origine: 'ticket' });

  // Piles, et ancres nées du champ, dans l'ordre où le champ les fait naître.
  const atteintes = ancresAtteintes(enregistrements, ctx);
  const piles = new Map();
  const nees = [];
  for (const e of enregistrements) {
    for (const cle of atteintes.get(e.n)) {
      if (!donnees.has(cle)) {
        const type = cle.slice(0, cle.indexOf(':'));
        donnees.set(cle, { type, ref: cle.slice(type.length + 1), origine: 'champ' });
        nees.push(cle);
      }
      if (!piles.has(cle)) piles.set(cle, []);
      piles.get(cle).push(e);
    }
  }

  // États : critères d'après le champ, désaccords, verdicts d'ordre 1, actions corrigées, ratifications.
  const etatsDesCriteres = new Map(etatsCriteres(enregistrements, ctx).map((x) => [x.ref, x]));
  const enDesaccord = new Map(desaccords(enregistrements, ctx).map((d) => [d.cle, d]));
  const verdicts = new Map();
  for (const e of enregistrements) {
    if (e.type !== 'observation' || e.ordre !== 1) continue;
    const cle = cleAncre(e.ancre, ctx);
    if (!verdicts.has(cle)) verdicts.set(cle, new Map());
    verdicts.get(cle).set(e.noeud, e);
  }
  const decisions = ratifications(enregistrements);
  const inscrit = (d) => enregistrements.find((x) => x.type === 'ecart' && d.ns.every((n) => x.observe?.includes(n)));
  const desaccordDe = (cle) => {
    const d = enDesaccord.get(cle);
    return d ? { conformes: d.conformes.map((o) => ({ noeud: o.noeud, n: o.n })), ecarts: d.ecarts.map((o) => ({ noeud: o.noeud, n: o.n, ecart: o.ecart })), inscrit: inscrit(d)?.n ?? null } : null;
  };
  const etatDe = (cle, a) => {
    const desaccord = desaccordDe(cle);
    if (a.type === 'critere') {
      // Un critère garde l'état que lui donne le champ ; un désaccord sur lui s'y ajoute en marque.
      const x = etatsDesCriteres.get(a.ref);
      return { etat: x.etat, causes: x.causes, observations: x.observations ?? [], desaccord };
    }
    if (desaccord) return { etat: 'en désaccord', causes: [], desaccord };
    if (a.type === 'noeud') {
      const objet = a.ref === ctx.cle && ctx.sousTickets ? `arbre ${ctx.cle}` : estFeuille(ctx, a.ref) ? a.ref : null;
      if (objet === null) return { etat: 'sans ratification propre', causes: [] };
      const x = decisions.get(objet);
      return { etat: x ? (x.decision === 'ratifié' ? 'ratifié' : 'non ratifié') : 'à ratifier', causes: [], objet };
    }
    const derniers = [...(verdicts.get(cle)?.values() ?? [])];
    const ecarts = derniers.filter((o) => o.verdict === 'ecart');
    if (ecarts.length > 0) return { etat: 'en écart', causes: [], observations: ecarts.map((o) => o.n) };
    const conforme = derniers.some((o) => o.verdict === 'conforme');
    if (a.type === 'scenario') {
      const derniere = enregistrements.filter((e) => e.type === 'action' && cleAncre(e.ancre, ctx) === cle).at(-1);
      if (derniere && enregistrements.some((e) => e.type === 'retour' && e.nature === 'correction' && e.vise === derniere.n)) return { etat: 'à reprendre', causes: [], action: derniere.n };
      return { etat: derniere || conforme ? 'réalisé' : 'à réaliser', causes: [] };
    }
    return { etat: conforme ? 'conforme' : 'non observée', causes: [] };
  };

  // Marques : observations attendues et motifs en veille, sur les ancres qu'atteint ce qu'elles concernent.
  const marques = new Map();
  const marquer = (ns, marque) => {
    for (const cle of new Set(ns.flatMap((n) => atteintes.get(n)))) {
      if (!marques.has(cle)) marques.set(cle, []);
      marques.get(cle).push(marque);
    }
  };
  for (const a of attentes(enregistrements, ctx)) {
    if (a.nature === 'ordre-2') marquer(a.corrections, { nature: 'attente', texte: `observation d'ordre 2 attendue sur le motif ${a.motif} (corrections n° ${liste(a.corrections)}) ; invoquer ${a.observateur}` });
    if (a.nature === 'ordre-3') marquer([a.proposition], { nature: 'attente', texte: `examen d'ordre 3 attendu de la proposition n° ${a.proposition} (motif ${a.motif}) ; invoquer ${a.observateur}` });
    if (a.nature === 'developpeur') marquer([a.proposition], { nature: 'attente', texte: `décision du développeur attendue sur la proposition n° ${a.proposition}, ${a.verdict === 'fondee' ? 'fondée' : 'infondée'} à l'examen n° ${a.examen}` });
    if (a.nature === 'veille') marquer(a.propositions, { nature: 'attente', texte: `mise en veille attendue du motif ${a.motif} (propositions n° ${liste(a.propositions)} refusées) ; invoquer ${a.observateur}` });
  }
  for (const v of enregistrements.filter((x) => x.type === 'observation' && x.ordre === 3 && x.verdict === 'veille')) {
    marquer(v.observe, { nature: 'veille', texte: `motif ${v.motif} en veille (n° ${v.n}) : l'ordre 2 ne s'y éveille plus` });
  }
  const etatCritere = (ref) => etatsDesCriteres.get(ref)?.etat ?? 'inconnu';

  // Nœuds concernés par chaque ancre : le sien, ceux qui y ont déposé ; pour un scénario, ceux qu'il prouve.
  const feuilles = r.noeuds.filter((n) => estFeuille(ctx, n.reference));
  const casDuNoeud = (n) => new Set(n.criteres.flatMap((c) => c.ca ?? []));
  const concernes = (cle, a, pile) => {
    const s = new Set(pile.map((e) => e.noeud));
    if (a.noeud) s.add(a.noeud);
    if (a.type === 'noeud') s.add(a.ref);
    if (a.type === 'scenario') {
      for (const n of r.noeuds) {
        const commun = a.cas.some((ca) => casDuNoeud(n).has(ca));
        if (commun && (!feuilles.includes(n) || n.etiquettes.some((e) => a.etiquettes.includes(e)))) s.add(n.reference);
      }
      if (a.cas.length > 0) s.add(ctx.cle);
    }
    return [...s].sort();
  };

  const ancres = new Map();
  for (const [cle, a] of donnees) {
    const pile = piles.get(cle) ?? [];
    const etat = etatDe(cle, a);
    const propres = [...(marques.get(cle) ?? [])];
    if (a.type === 'critere' && etat.desaccord) propres.unshift({ nature: 'desaccord', texte: texteDesaccord(etat.desaccord) });
    const base = new AncreVue({ cle, ...a, ...etat, marques: propres, noeuds: concernes(cle, a, pile) });
    // Ce que le critère soutient, avec l'état que le champ donne à chacun : un nœud voit l'effet de ses écarts.
    if (a.type === 'critere' && a.soutient?.length > 0) {
      base.soutiens = a.soutient.map((ref) => ({ ref, etat: etatCritere(ref) }));
      base.casEtats = a.cas.map((ca) => ({ ca, etat: ctx.cas.has(ca) ? etatCritere(ctx.cas.get(ca)) : 'inconnu' }));
    }
    if (a.type === 'critere') base.soutenuPar = ctx.criteres.get(a.ref)?.enfants ?? [];
    base.titre = titreDe(base);
    ancres.set(cle, poserCalques(base, pile));
  }

  // Rangement : critères d'acceptation et leur arbre (visiteur), scénarios ; nœuds ; ancres nées du champ.
  const visiteur = new VisiteurRangement(ctx);
  const criteresAcceptation = r.criteres.map((c) => ({
    ca: c.ca,
    arbre: ctx.criteres.get(c.critere).accepter(visiteur),
    scenarios: documents.scenarios.filter((s) => s.etiquettes.includes(`@${c.ca}`)).map((s) => `scenario:${s.id}`),
  }));
  const rangement = {
    criteres_acceptation: criteresAcceptation,
    autres_scenarios: documents.scenarios.filter((s) => !criteresAcceptation.some((x) => x.scenarios.includes(`scenario:${s.id}`))).map((s) => `scenario:${s.id}`),
    noeuds: [...ctx.noeuds.keys()].map((ref) => `noeud:${ref}`),
    nees_du_champ: nees,
  };
  const ordre = [];
  const ranger = (cle) => {
    if (!ordre.includes(cle)) ordre.push(cle);
  };
  const parcourir = (x) => {
    ranger(x.cle);
    x.enfants.forEach(parcourir);
  };
  for (const x of criteresAcceptation) {
    parcourir(x.arbre);
    x.scenarios.forEach(ranger);
  }
  [...rangement.autres_scenarios, ...rangement.noeuds, ...nees].forEach(ranger);

  // À traiter : désaccords, écarts, menaces, puis observations attendues, dans l'ordre du rangement.
  const aTraiter = [];
  const dejaListee = new Set();
  for (const gravite of GRAVITES) {
    for (const cle of ordre) {
      if (dejaListee.has(cle)) continue;
      const a = ancres.get(cle).base();
      let texte = null;
      if (gravite === 'en désaccord' && a.desaccord) texte = texteDesaccord(a.desaccord);
      else if (gravite === 'attente') {
        const textes = a.marques.filter((m) => m.nature === 'attente').map((m) => m.texte);
        if (textes.length > 0) texte = textes.join(' ; ');
      } else if (gravite !== 'en désaccord' && a.etat === gravite) texte = texteATraiter(a, enregistrements, ctx);
      if (texte !== null) {
        aTraiter.push({ cle, gravite, texte });
        dejaListee.add(cle);
      }
    }
  }

  return {
    vue: {
      cle: ctx.cle,
      ctx,
      champ: { enregistrements: lignes.length, empreinte: lignes.length > 0 ? sha256(lignes.at(-1)) : null, derniere_date: enregistrements.at(-1)?.date ?? null },
      ratifications: [...decisions.values()].map((e) => ({ objet: e.objet, decision: e.decision, n: e.n, date: e.date, par: e.par })),
      ancres,
      ordre,
      rangement,
      aTraiter,
    },
  };
}

function texteDesaccord(d) {
  const parties = [...d.conformes.map((o) => `${o.noeud} conforme (n° ${o.n})`), ...d.ecarts.map((o) => `${o.noeud} en écart (n° ${o.n})`)];
  return `${parties.join(' ; ')} ; ${d.inscrit ? `écart n° ${d.inscrit} au registre des écarts` : 'écart à inscrire au registre des écarts'}, décision au développeur`;
}

function texteATraiter(a, enregistrements, ctx) {
  if (a.etat === 'en écart') {
    const obs = a.observations.map((n) => enregistrements[n - 1]);
    const qui = [...new Set(obs.map((o) => o.noeud))];
    return `${obs.map((o) => `n° ${o.n} (${o.noeud}) : ${o.ecart}`).join(' ; ')} ; à traiter par ${liste(qui)}, à l'ordre 1`;
  }
  return `menacé par ${liste(a.causes)}${a.causes.length > 0 ? ` ; à traiter par ${liste([...new Set(a.causes.map((c) => ctx.criteres.get(c)?.noeud))])}, à l'ordre 1` : ''}`;
}

// ---- Texte d'un enregistrement, commun aux deux formats ----

function decrirePreuve(p) {
  return `preuve ${p.nature} : ${p.ref}${p.extrait ? ` (« ${p.extrait} »)` : ''}`;
}

function decrireCout(c) {
  if (!c) return '';
  const parties = [c.tokens !== undefined ? `${c.tokens} tokens` : null, c.secondes !== undefined ? `${c.secondes} s` : null].filter(Boolean);
  return ` ; coût : ${parties.join(', ')}`;
}

/** Description d'un enregistrement dans un calque : ce qu'il dit, sa preuve, sans son en-tête. */
export function decrireEnregistrement(e) {
  if (e.type === 'action') return `${e.nature === 'proposition' ? 'proposition' : 'réalisation'} : ${e.resume}${e.options ? ` ; options : ${e.options.join(' | ')}` : ''}`;
  if (e.type === 'retour') {
    if (e.nature === 'correction') return `correction de n° ${e.vise}, motif ${e.motif}, par ${e.par} : « ${e.contenu} »`;
    if (e.nature === 'ratification') return `ratification de « ${e.objet} » : ${e.decision}, par ${e.par} : « ${e.contenu} »`;
    return `choix sur n° ${e.vise}${e.decision ? ` : ${e.decision}` : ''}, par ${e.par} : « ${e.contenu} »`;
  }
  if (e.type === 'ecart') return `écart inscrit au registre (${e.invariant}) : ${e.constat} ; décision au développeur`;
  const cout = decrireCout(e.cout);
  if (e.ordre === 1) return `${e.verdict === 'ecart' ? `écart : ${e.ecart}` : 'conforme'} ; ${decrirePreuve(e.preuve)}${cout}`;
  if (e.ordre === 2) return `${e.verdict === 'proposition' ? `proposition sur le motif ${e.motif} : « ${e.proposition} »` : `conforme sur le motif ${e.motif}`}, observe n° ${liste(e.observe)} ; ${decrirePreuve(e.preuve)}${cout}`;
  const commentaire = e.commentaire ? ` : « ${e.commentaire} »` : '';
  if (e.verdict === 'veille') return `motif ${e.motif} mis en veille, propositions n° ${liste(e.observe)} refusées ; ${decrirePreuve(e.preuve)}${cout}`;
  if (e.verdict === 'bilan') return `bilan de clôture des observations n° ${liste(e.observe)}${commentaire} ; ${decrirePreuve(e.preuve)}${cout}`;
  return `examen de la proposition n° ${liste(e.observe)} : ${e.verdict === 'fondee' ? 'fondée' : 'infondée'}${commentaire} ; ${decrirePreuve(e.preuve)}${cout}`;
}

const enTeteEnregistrement = (e) => `n° ${e.n} · ${date(e.date)} · ${e.noeud} · ${e.auteur}`;

function decrireEtat(a) {
  return a.etat === 'menacé' && a.causes.length > 0 ? `menacé par ${liste(a.causes)}` : a.etat;
}

function provenance(vue) {
  const c = vue.champ;
  if (c.enregistrements === 0) return 'Champ vide : aucun enregistrement encore ; les ancres du ticket attendent leurs calques.';
  return `Tirée du champ d'observation de l'arbre au n° ${c.enregistrements} (dernier enregistrement du ${date(c.derniere_date)}, empreinte de tête ${c.empreinte.slice(0, 16)}), chaîne intacte. Le ticket n'est pas réécrit : ses ancres portent les calques de ce que le champ en dit.`;
}

/** Ce que soutient un critère d'un nœud, avec l'état de chacun dans le champ. */
const texteSoutien = (a) => `Soutient ${a.soutiens.map((x) => `${x.ref} (${x.etat})`).join(', ')} ; critère d'acceptation ${a.casEtats.map((x) => `${x.ca} (${x.etat})`).join(', ')}`;

/** Message d'une ancre sans calque. */
const messageVide = (a) => (a.soutenuPar?.length > 0 ? 'Rien n\'est déposé directement sur ce critère : son état vient des critères qui le soutiennent.' : 'Rien n\'est encore déposé sur cette ancre.');

const ligneRatification = (x) => `${x.objet} : ${x.decision} (n° ${x.n}, ${x.date.slice(0, 10)}, ${x.par})`;

// ---- Vue d'un nœud ----

/**
 * Ancres d'un nœud : ses critères, avec ceux qui les soutiennent ; les scénarios qui les prouvent ; son
 * nœud ; puis les autres ancres où il a déposé, avec ce que les autres niveaux y ont mis.
 */
export function ancresDuNoeud(vue, reference) {
  if (!vue.ctx.noeuds.has(reference)) return null;
  const visiteur = new VisiteurRangement(vue.ctx);
  const criteres = [...vue.ctx.criteres.values()].filter((c) => c.noeud === reference).map((c) => c.accepter(visiteur));
  const dansArbres = new Set();
  const marquer = (x) => {
    dansArbres.add(x.cle);
    x.enfants.forEach(marquer);
  };
  criteres.forEach(marquer);
  const scenarios = vue.ordre.filter((cle) => cle.startsWith('scenario:') && vue.ancres.get(cle).base().noeuds.includes(reference));
  const autres = vue.ordre.filter((cle) => !dansArbres.has(cle) && !scenarios.includes(cle) && cle !== `noeud:${reference}` && vue.ancres.get(cle).base().noeuds.includes(reference) && vue.ancres.get(cle).calques().length > 0);
  return { criteres, scenarios, noeud: `noeud:${reference}`, autres, cles: new Set([...dansArbres, ...scenarios, `noeud:${reference}`, ...autres]) };
}

// ---- Markdown ----

const md = {
  ancre(a, niveau) {
    const lignes = [`${'#'.repeat(Math.min(6, niveau))} ${a.titre} — ${decrireEtat(a)}`, ''];
    if (a.enonce) lignes.push(`> ${a.enonce}`, '');
    if (a.statut) lignes.push(`Statut dans us.md : ${a.statut}.`, '');
    if (a.soutiens) lignes.push(`${texteSoutien(a)}.`, '');
    if (a.type === 'scenario' && a.etiquettes) lignes.push(`Étiquettes : ${a.etiquettes.map((e) => `\`${e}\``).join(' ')}.`, '');
    if (a.origine === 'champ') lignes.push('Ancre née du champ.', '');
    for (const m of a.marques) lignes.push(`- ${LIBELLES_MARQUES[m.nature]} : ${m.texte}`);
    if (a.marques.length > 0) lignes.push('');
    return `${lignes.join('\n')}\n`;
  },
  calque(nom, enregistrements) {
    const c = CALQUES.find((x) => x.nom === nom);
    return [`- ${c.titre}`, ...enregistrements.map((e) => `  - ${enTeteEnregistrement(e)} : ${decrireEnregistrement(e)}`), ''].join('\n');
  },
};

function rendreMarkdown(vue, noeud = null) {
  const rendues = new Set();
  const sortie = [];
  const ancre = (cle, niveau) => {
    const a = vue.ancres.get(cle);
    if (rendues.has(cle)) {
      sortie.push(`${'#'.repeat(Math.min(6, niveau))} ${a.base().titre} — voir plus haut`, '');
      return;
    }
    rendues.add(cle);
    const texte = a.rendre(md, niveau);
    sortie.push(texte.replace(/\n+$/, ''), '');
    if (a.calques().length === 0) sortie.push(messageVide(a.base()), '');
  };
  const arbre = (x, niveau) => {
    const deja = rendues.has(x.cle);
    ancre(x.cle, niveau);
    if (!deja) for (const e of x.enfants) arbre(e, niveau + 1);
  };
  const filtre = noeud && noeud !== vue.cle ? ancresDuNoeud(vue, noeud) : null;
  sortie.push(noeud && noeud !== vue.cle ? `# Vue augmentée de ${noeud}, dans l'arbre ${vue.cle}` : `# Vue augmentée de ${vue.cle}`, '');
  sortie.push(provenance(vue), '');
  sortie.push('Ratifications :', '', ...(vue.ratifications.length > 0 ? vue.ratifications.map((x) => `- ${ligneRatification(x)}`) : ['- aucune']), '');
  sortie.push(`Calques : ${CALQUES.map((c) => `${c.titre.toLowerCase()} (${c.legende})`).join(' ; ')}.`, '');
  const aTraiter = filtre ? vue.aTraiter.filter((x) => filtre.cles.has(x.cle)) : vue.aTraiter;
  sortie.push('## À traiter', '');
  if (aTraiter.length === 0) sortie.push('Rien à traiter.', '');
  else sortie.push(...aTraiter.map((x) => `- **${x.gravite}** : ${vue.ancres.get(x.cle).base().titre} — ${x.texte}`), '');
  if (filtre) {
    sortie.push(`## Critères de ${noeud}`, '');
    for (const x of filtre.criteres) arbre(x, 3);
    sortie.push('## Scénarios', '');
    if (filtre.scenarios.length === 0) sortie.push('Aucun scénario du fichier Gherkin pour ce nœud.', '');
    for (const cle of filtre.scenarios) ancre(cle, 3);
    sortie.push('## Nœud', '');
    ancre(filtre.noeud, 3);
    if (filtre.autres.length > 0) {
      sortie.push(`## Autres ancres où ${noeud} a déposé`, '');
      for (const cle of filtre.autres) ancre(cle, 3);
    }
  } else {
    sortie.push('## Critères d\'acceptation', '');
    for (const x of vue.rangement.criteres_acceptation) {
      arbre(x.arbre, 3);
      sortie.push(`#### Scénarios qui prouvent ${x.ca}`, '');
      if (x.scenarios.length === 0) sortie.push('Aucun scénario dans le fichier Gherkin.', '');
      for (const cle of x.scenarios) ancre(cle, 5);
    }
    if (vue.rangement.autres_scenarios.length > 0) {
      sortie.push('## Autres scénarios du ticket', '');
      for (const cle of vue.rangement.autres_scenarios) ancre(cle, 3);
    }
    sortie.push('## Nœuds', '');
    for (const cle of vue.rangement.noeuds) ancre(cle, 3);
    if (vue.rangement.nees_du_champ.length > 0) {
      sortie.push('## Ancres nées du champ', '');
      for (const cle of vue.rangement.nees_du_champ) ancre(cle, 3);
    }
  }
  return `${sortie.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\n+$/, '')}\n`;
}

// ---- HTML ----

const echapper = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Identifiant HTML d'une ancre : lisible, et court même pour un contrat écrit en texte libre. */
export function identifiant(cle) {
  const lisible = cle.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return lisible.length <= 48 ? `a-${lisible}` : `a-${lisible.slice(0, 40).replace(/-+$/, '')}-${sha256(cle).slice(0, 8)}`;
}

const html = {
  ancre(a, niveau) {
    const e = ETATS[a.etat];
    const n = Math.min(6, niveau);
    const lignes = [
      `<h${n}>${echapper(a.titre)}</h${n}>`,
      `<p class="etat etat-${e.famille}"><span class="symbole" aria-hidden="true">${e.symbole}</span> État : <strong>${echapper(decrireEtat(a))}</strong></p>`,
    ];
    if (a.enonce) lignes.push(`<p class="enonce">${echapper(a.enonce)}</p>`);
    if (a.statut) lignes.push(`<p class="detail">Statut dans us.md : ${echapper(a.statut)}</p>`);
    if (a.soutiens) lignes.push(`<p class="detail">${echapper(texteSoutien(a))}</p>`);
    if (a.type === 'scenario' && a.etiquettes) lignes.push(`<p class="detail">Étiquettes : ${a.etiquettes.map((x) => `<code>${echapper(x)}</code>`).join(' ')}</p>`);
    if (a.origine === 'champ') lignes.push('<p class="detail">Ancre née du champ.</p>');
    if (a.marques.length > 0) lignes.push('<ul class="marques">', ...a.marques.map((m) => `<li class="marque marque-${m.nature}"><strong>${LIBELLES_MARQUES[m.nature]}</strong> : ${echapper(m.texte)}</li>`), '</ul>');
    return `${lignes.join('\n')}\n`;
  },
  calque(nom, enregistrements) {
    const c = CALQUES.find((x) => x.nom === nom);
    return [
      `<div class="calque calque-${nom}">`,
      `<p class="nom-calque">${c.titre}</p>`,
      '<ol class="enregistrements">',
      ...enregistrements.map((e) => `<li><span class="numero">n° ${e.n}</span> · <time datetime="${e.date}">${date(e.date)}</time> · ${echapper(e.noeud)} · ${echapper(e.auteur)} : ${echapper(decrireEnregistrement(e))}</li>`),
      '</ol>',
      '</div>',
      '',
    ].join('\n');
  },
};

const STYLE = `:root{color-scheme:light dark;--fond:#ffffff;--surface:#f3f4f6;--texte:#1d1d20;--discret:#4f525a;--bord:#8d9099;--lien:#0b57a4;--focus:#b3470a;--grave:#a3190f;--alerte:#8a4b00;--neutre:#4a4d55;--bon:#1d6b33}
@media (prefers-color-scheme:dark){:root{--fond:#16171a;--surface:#202226;--texte:#ececef;--discret:#b5b7be;--bord:#7d808a;--lien:#8cc2ff;--focus:#ffb37a;--grave:#ff8f86;--alerte:#ffc266;--neutre:#c6c8ce;--bon:#86dca0}}
*{box-sizing:border-box}
body{margin:0 auto;max-width:72rem;padding:1rem;font:1rem/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;background:var(--fond);color:var(--texte)}
a{color:var(--lien)}
:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
header{margin-bottom:.75rem}
header p{margin:.25rem 0}
.provenance,.ratifications{color:var(--discret)}
#commandes{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem 1.25rem;margin:.5rem 0}
#commandes[hidden]{display:none}
#commandes fieldset{border:1px solid var(--bord);margin:0;padding:.25rem .75rem .4rem}
#commandes label{margin-right:.9rem;white-space:nowrap}
#statut-filtre{flex-basis:100%;margin:0;color:var(--discret)}
input,select,button{font:inherit}
select{padding:.15rem .3rem;color:var(--texte);background:var(--fond);border:1px solid var(--bord)}
.legende{margin:.5rem 0}
.legende summary{cursor:pointer;color:var(--lien)}
nav{border-top:1px solid var(--bord);border-bottom:1px solid var(--bord);padding:.4rem 0;margin:.75rem 0 1rem}
nav ul{display:flex;flex-wrap:wrap;gap:.25rem 1.1rem;list-style:none;margin:0;padding:0}
.ancre{border-left:.3rem solid var(--bord);padding:.25rem 0 .25rem .9rem;margin:1rem 0}
.ancre .ancre{margin-left:.5rem}
.ancre-grave{border-left-color:var(--grave)}.ancre-alerte{border-left-color:var(--alerte)}.ancre-bon{border-left-color:var(--bon)}
h1,h2,h3,h4,h5,h6{line-height:1.25;margin:.75rem 0 .25rem;overflow-wrap:break-word}
h1{font-size:1.75rem}h2{font-size:1.4rem}h3{font-size:1.2rem}h4{font-size:1.08rem}h5,h6{font-size:1rem}
li,p{overflow-wrap:break-word}
.etat{margin:.25rem 0;font-weight:600}
.etat-grave{color:var(--grave)}.etat-alerte{color:var(--alerte)}.etat-neutre{color:var(--neutre)}.etat-bon{color:var(--bon)}
.enonce{margin:.25rem 0;padding:.4rem .6rem;background:var(--surface)}
.detail,.renvoi,.vide{color:var(--discret);margin:.25rem 0}
.marques{margin:.25rem 0;padding-left:1.25rem}
.calque{background:var(--surface);margin:.4rem 0;padding:.3rem .6rem}
.nom-calque{font-weight:600;margin:0}
.enregistrements{margin:.2rem 0;padding-left:1.25rem}
.numero{font-variant-numeric:tabular-nums;font-weight:600}
code{font-size:.95em}
.sans-ordre-1 .calque-ordre-1,.sans-ordre-2 .calque-ordre-2,.sans-ordre-3 .calque-ordre-3,.sans-humain .calque-humain{display:none}`;

const SCRIPT = `(()=>{const c=document.getElementById('commandes');c.hidden=false;
for(const i of c.querySelectorAll('input[data-calque]'))i.addEventListener('change',()=>document.body.classList.toggle('sans-'+i.dataset.calque,!i.checked));
const f=document.getElementById('filtre-noeud'),s=document.getElementById('statut-filtre');
f.addEventListener('change',()=>{for(const a of document.querySelectorAll('main [data-noeuds]'))a.hidden=f.value!==''&&!a.dataset.noeuds.split(' ').includes(f.value);
const n=document.querySelectorAll('main article.ancre:not([hidden])').length;s.textContent=f.value===''?'Tous les nœuds : '+n+' ancres affichées.':'Nœud '+f.value+' : '+n+' ancres affichées.';});})();`;

function rendreHtml(vue) {
  const rendues = new Set();
  const famille = (cle) => ETATS[vue.ancres.get(cle).base().etat].famille;
  // Nœuds concernés par une ancre et tout ce qui s'y range dessous, pour le filtre par nœud.
  const concernes = (cles) => [...new Set(cles.flatMap((cle) => vue.ancres.get(cle).base().noeuds))].sort().join(' ');
  const article = (cle, niveau, dessous = [], interieur = '') => {
    const a = vue.ancres.get(cle);
    if (rendues.has(cle)) return `<p class="renvoi" data-noeuds="${echapper(concernes([cle]))}"><a href="#${identifiant(cle)}">${echapper(a.base().titre)}</a> : voir plus haut.</p>\n`;
    rendues.add(cle);
    const vide = a.calques().length === 0 ? `<p class="vide">${echapper(messageVide(a.base()))}</p>\n` : '';
    return `<article id="${identifiant(cle)}" class="ancre ancre-${famille(cle)}" data-ancre="${echapper(cle)}" data-etat="${echapper(a.base().etat)}" data-noeuds="${echapper(concernes([cle, ...dessous]))}">\n${a.rendre(html, niveau)}${vide}${interieur}</article>\n`;
  };
  const cles = (x) => [x.cle, ...x.enfants.flatMap(cles)];
  const arbre = (x, niveau, apres = { cles: [], html: '' }) => {
    if (rendues.has(x.cle)) return article(x.cle, niveau);
    rendues.add(x.cle);
    const interieur = `${x.enfants.map((e) => arbre(e, niveau + 1)).join('')}${apres.html}`;
    rendues.delete(x.cle);
    return article(x.cle, niveau, [...x.enfants.flatMap(cles), ...apres.cles], interieur);
  };

  const corps = [];
  const ratifs = vue.ratifications.length > 0 ? vue.ratifications.map((x) => `${x.objet} : ${x.decision} (n° ${x.n})`).join(' ; ') : 'aucune';
  corps.push('<header>', `<h1>Vue augmentée de ${echapper(vue.cle)}</h1>`, `<p class="provenance">${echapper(provenance(vue))}</p>`, `<p class="ratifications"><strong>Ratifications</strong> : ${echapper(ratifs)}.</p>`, '</header>');
  const noeuds = [...vue.ctx.noeuds.keys()];
  corps.push(
    '<div id="commandes" hidden>',
    '<fieldset><legend>Calques affichés</legend>',
    ...CALQUES.map((c) => `<label><input type="checkbox" checked data-calque="${c.nom}"> ${c.titre}</label>`),
    '</fieldset>',
    '<label for="filtre-noeud">Nœud</label> <select id="filtre-noeud"><option value="">Tous les nœuds</option>',
    ...noeuds.map((ref) => `<option value="${echapper(ref)}">${echapper(ref)}</option>`),
    '</select>',
    '<p id="statut-filtre" role="status"></p>',
    '</div>',
    '<details class="legende"><summary>Lire les calques et les états</summary>',
    '<ul>',
    ...CALQUES.map((c) => `<li><strong>${c.titre}</strong> : ${echapper(c.legende)}.</li>`),
    '</ul>',
    '<p>Chaque ancre du ticket porte son état, écrit en toutes lettres : il résume tout ce qui l\'atteint dans le champ, et masquer un calque ne le change pas. Les ancres nées du champ sont celles que le ticket ne nomme pas.</p>',
    '</details>',
  );
  corps.push('<nav aria-label="Sommaire">', '<ul>', '<li><a href="#s-a-traiter">À traiter</a></li>');
  corps.push(...vue.rangement.criteres_acceptation.map((x) => `<li><a href="#${identifiant(x.arbre.cle)}">${echapper(x.ca)}</a></li>`));
  if (vue.rangement.autres_scenarios.length > 0) corps.push('<li><a href="#s-autres-scenarios">Autres scénarios du ticket</a></li>');
  corps.push('<li><a href="#s-noeuds">Nœuds</a></li>');
  if (vue.rangement.nees_du_champ.length > 0) corps.push('<li><a href="#s-nees">Ancres nées du champ</a></li>');
  corps.push('</ul>', '</nav>', '<main>');
  corps.push('<section aria-labelledby="s-a-traiter">', '<h2 id="s-a-traiter">À traiter</h2>');
  if (vue.aTraiter.length === 0) corps.push('<p>Rien à traiter.</p>');
  else {
    corps.push('<ol>', ...vue.aTraiter.map((x) => `<li data-noeuds="${echapper(concernes([x.cle]))}"><strong>${echapper(x.gravite)}</strong> : <a href="#${identifiant(x.cle)}">${echapper(vue.ancres.get(x.cle).base().titre)}</a> — ${echapper(x.texte)}</li>`), '</ol>');
  }
  corps.push('</section>');
  corps.push('<section aria-labelledby="s-criteres">', '<h2 id="s-criteres">Critères d\'acceptation</h2>');
  for (const x of vue.rangement.criteres_acceptation) {
    const scenarios = [
      `<h4>Scénarios qui prouvent ${echapper(x.ca)}</h4>`,
      x.scenarios.length === 0 ? '<p class="vide">Aucun scénario dans le fichier Gherkin.</p>' : '',
      ...x.scenarios.map((cle) => article(cle, 5)),
    ].filter(Boolean).join('\n');
    corps.push(arbre(x.arbre, 3, { cles: x.scenarios, html: `${scenarios}\n` }).replace(/\n$/, ''));
  }
  corps.push('</section>');
  if (vue.rangement.autres_scenarios.length > 0) {
    corps.push('<section aria-labelledby="s-autres-scenarios">', '<h2 id="s-autres-scenarios">Autres scénarios du ticket</h2>', ...vue.rangement.autres_scenarios.map((cle) => article(cle, 3).replace(/\n$/, '')), '</section>');
  }
  corps.push('<section aria-labelledby="s-noeuds">', '<h2 id="s-noeuds">Nœuds</h2>', ...vue.rangement.noeuds.map((cle) => article(cle, 3).replace(/\n$/, '')), '</section>');
  if (vue.rangement.nees_du_champ.length > 0) {
    corps.push('<section aria-labelledby="s-nees">', '<h2 id="s-nees">Ancres nées du champ</h2>', ...vue.rangement.nees_du_champ.map((cle) => article(cle, 3).replace(/\n$/, '')), '</section>');
  }
  corps.push('</main>');
  return [
    '<!doctype html>',
    '<html lang="fr">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="color-scheme" content="light dark">',
    `<meta name="generator" content="skill-ticket vue.mjs, ${FORMAT_VUE}">`,
    `<title>Vue augmentée de ${echapper(vue.cle)}</title>`,
    `<style>\n${STYLE}\n</style>`,
    '</head>',
    '<body>',
    ...corps,
    `<script>\n${SCRIPT}\n</script>`,
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

// ---- Modèle JSON ----

/** Modèle de la vue, pour les outils : ancres avec état, marques et calques, rangement, à traiter. */
export function modeleDe(vue, noeud = null) {
  const filtre = noeud ? ancresDuNoeud(vue, noeud) : null;
  const garder = (cle) => !filtre || noeud === vue.cle || filtre.cles.has(cle);
  return {
    format: FORMAT_VUE,
    cle: vue.cle,
    noeud,
    champ: vue.champ,
    ratifications: vue.ratifications,
    a_traiter: vue.aTraiter.filter((x) => garder(x.cle)),
    ancres: vue.ordre.filter(garder).map((cle) => {
      const v = vue.ancres.get(cle);
      const a = v.base();
      const calques = Object.fromEntries(CALQUES.map((c) => [c.nom, []]));
      for (const c of v.calques()) calques[c.nom] = c.enregistrements.map((e) => e.n);
      return {
        cle, type: a.type, ref: a.ref, origine: a.origine, titre: a.titre, enonce: a.enonce ?? null, noeud: a.noeud ?? null,
        etat: a.etat, causes: a.causes, marques: a.marques, noeuds: a.noeuds, calques,
      };
    }),
    rangement: vue.rangement,
  };
}

// ---- Écriture et vérification ----

/** Contenus des vues écrites dans le dossier de la demande : { 'vue.html': …, 'vue.md': … }. */
export function contenusVue(vue) {
  return { 'vue.html': rendreHtml(vue), 'vue.md': rendreMarkdown(vue) };
}

/** Vue d'un nœud, en Markdown, pour sa session ; null si le nœud n'est pas dans l'arbre. */
export function vueDuNoeud(vue, reference) {
  return vue.ctx.noeuds.has(reference) ? rendreMarkdown(vue, reference) : null;
}

const numeroDe = (texte) => {
  if (/Champ vide/.test(texte)) return 0;
  const m = /au n° (\d+) \(dernier enregistrement/.exec(texte);
  return m ? Number(m[1]) : null;
};

/**
 * État des vues écrites : 'à jour', 'absente', 'périmée' (tirée d'un champ plus court), 'modifiée' (à la
 * main, ou tirée d'autres documents) ou 'champ altéré' ; avec les écarts, un par fichier.
 */
export function etatVue(dossier, options = {}) {
  const { erreurs, vue } = construireVue(dossier, options);
  if (erreurs) return { etat: 'champ altéré', ecarts: erreurs };
  const attendus = contenusVue(vue);
  const ecarts = [];
  const etats = [];
  for (const f of FICHIERS_VUE) {
    const lu = lireSiPresent(join(dossier, f));
    if (lu === null) {
      etats.push('absente');
      ecarts.push(`${f} absente : node vue.mjs generer ${dossier}`);
    } else if (lu !== attendus[f]) {
      const n = numeroDe(lu);
      if (n !== null && n < vue.champ.enregistrements) {
        etats.push('périmée');
        ecarts.push(`${f} périmée : tirée du champ au n° ${n}, champ au n° ${vue.champ.enregistrements}`);
      } else {
        etats.push('modifiée');
        ecarts.push(`${f} modifiée à la main, ou tirée d'autres documents du ticket`);
      }
    } else etats.push('à jour');
  }
  const etat = ['modifiée', 'périmée', 'absente', 'à jour'].find((x) => etats.includes(x));
  return { etat, ecarts, depuis: numeroDe(lireSiPresent(join(dossier, 'vue.md')) ?? ''), champ: vue.champ.enregistrements };
}

// ---- Ligne de commande ----

function lireOptions(args) {
  const options = { positionnels: [] };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--json') options.json = true;
    else if (['--noeud', '--rattachement', '--registre'].includes(a)) {
      if (args[i + 1] === undefined) throw new Error(`${a} attend une valeur`);
      options[a.slice(2)] = args[++i];
    } else if (a.startsWith('--')) throw new Error(`option inconnue : ${a}`);
    else options.positionnels.push(a);
  }
  return options;
}

export function principal(argv, sortie = console.log, erreur = console.error) {
  const usage = 'Usage : node vue.mjs generer <dossier> [--noeud <référence>] [--json] | verifier <dossier> ; options : --rattachement <fichier>, --registre <fichier>';
  const [commande, ...reste] = argv;
  let o;
  try {
    o = lireOptions(reste);
  } catch (e) {
    erreur(`${e.message}\n${usage}`);
    return 2;
  }
  if (!['generer', 'verifier'].includes(commande) || o.positionnels.length !== 1 || (commande === 'verifier' && (o.noeud || o.json))) {
    erreur(usage);
    return 2;
  }
  const dossier = o.positionnels[0];
  let rattachement;
  try {
    rattachement = chargerRattachement(o.rattachement);
  } catch (e) {
    erreur(e.message);
    return 2;
  }
  const options = { rattachement, registre: o.registre };
  if (commande === 'verifier') {
    const v = etatVue(dossier, options);
    if (v.etat === 'à jour') {
      sortie(`vue de ${rattachement.cle} à jour : ${FICHIERS_VUE.join(', ')}, tirées du champ au n° ${v.champ}`);
      return 0;
    }
    for (const e of v.ecarts) erreur(`ÉCART  ${e}`);
    return 1;
  }
  const { erreurs, vue } = construireVue(dossier, options);
  if (erreurs) {
    for (const e of erreurs) erreur(`REFUS  ${e}`);
    return 1;
  }
  if (o.noeud && !vue.ctx.noeuds.has(o.noeud)) {
    erreur(`REFUS  nœud ${o.noeud} hors de l'arbre ${vue.cle}`);
    return 1;
  }
  if (o.json) {
    sortie(JSON.stringify(modeleDe(vue, o.noeud ?? null), null, 2));
    return 0;
  }
  if (o.noeud) {
    sortie(vueDuNoeud(vue, o.noeud).replace(/\n$/, ''));
    return 0;
  }
  // Les fichiers de la vue s'écrivent dans le dossier de la demande, qui doit exister ; la vue d'un nœud
  // et le modèle se lisent même avant le premier dépôt, sur un champ vide.
  if (!existsSync(dossier)) {
    erreur(`REFUS  dossier absent : ${dossier}`);
    return 1;
  }
  const contenus = contenusVue(vue);
  for (const f of FICHIERS_VUE) writeFileSync(join(dossier, f), contenus[f]);
  const nees = vue.rangement.nees_du_champ.length;
  const accord = (n, un, plusieurs) => `${n} ${n > 1 ? plusieurs : un}`;
  sortie(`vue de ${vue.cle} : ${accord(vue.ordre.length, 'ancre', 'ancres')} (${vue.ordre.length - nees} du ticket, ${accord(nees, 'née du champ', 'nées du champ')}), ${vue.aTraiter.length} à traiter ; champ au n° ${vue.champ.enregistrements} ; ${FICHIERS_VUE.map((f) => join(dossier, f)).join(', ')}`);
  return 0;
}

const estPrincipal = process.argv[1] && fileURLToPath(import.meta.url).toLowerCase() === resolve(process.argv[1]).toLowerCase();
if (estPrincipal) process.exitCode = principal(process.argv.slice(2));
