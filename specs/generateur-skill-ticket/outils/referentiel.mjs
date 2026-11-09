// Référentiel des méso-contrats, lu par le générateur de skills de ticket.
//
// Le modèle vient du module `referentiel` de l'orchestrateur C7E (son bloc TOML), ou d'un fichier
// `referentiel-meso-contrats.toml` de projet. Ce module porte la règle de choix (méso-contrat
// principal et compléments) et les règles de validation d'un ticket, telles que le modèle les énonce
// dans sa section `[validation]`. Il ne modifie jamais le référentiel.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lireToml } from './toml.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
export const RACINE_DEPOT = join(ICI, '..', '..', '..');
export const MODULE_REFERENTIEL = join(RACINE_DEPOT, 'specs', 'orchestrateur-c7e', 'modules', 'referentiel', 'SKILL.md');
export const COUCHES = ['persistance', 'backend', 'frontend'];

/** Texte d'un fichier, sans BOM, fins de ligne normalisées. */
export function lireTexte(chemin) {
  return readFileSync(chemin, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
}

/**
 * Charge le référentiel : un fichier `.toml`, ou le premier bloc TOML d'un module Markdown
 * (par défaut le module `referentiel` de l'orchestrateur du dépôt).
 */
export function chargerReferentiel(chemin) {
  if (chemin && chemin.toLowerCase().endsWith('.toml')) return new Referentiel(lireToml(lireTexte(chemin), chemin), chemin);
  const source = chemin ?? MODULE_REFERENTIEL;
  const m = /^<!-- fichier : (\S+\.toml) -->\n```[a-z]*\n([\s\S]*?)\n```\n/m.exec(lireTexte(source));
  if (!m) throw new Error(`${source} : aucun bloc TOML de référentiel`);
  return new Referentiel(lireToml(`${m[2]}\n`, source), source);
}

/** Toutes les combinaisons de k éléments, dans l'ordre du tableau. */
function combinaisons(elements, k, debut = 0) {
  if (k === 0) return [[]];
  const res = [];
  for (let j = debut; j <= elements.length - k; j++) {
    for (const suite of combinaisons(elements, k - 1, j + 1)) res.push([elements[j], ...suite]);
  }
  return res;
}

const cleComposition = (c) => `${c.principal}+${[...c.complements].sort().join(',')}`;

/** « M04 », ou « M04 avec M01 ». */
export const decrireComposition = (c) => (c.complements.length > 0 ? `${c.principal} avec ${c.complements.join(', ')}` : c.principal);

export class Referentiel {
  constructor(donnees, source) {
    this.donnees = donnees;
    this.source = source;
    this.version = donnees.meta?.version;
    this.valeurs = donnees.modele_demande.valeurs;
    this.possibilites = new Map(donnees.modele_demande.possibilites.map((p) => [p.id, p]));
    this.mesoContrats = new Map(donnees.meso_contrats.map((m) => [m.id, m]));
    this.options = donnees.options;
    // Plafond de profondeur des sous-tickets : section [decomposition] du référentiel si elle
    // existe, 3 sinon.
    this.profondeurMax = donnees.decomposition?.profondeur_max ?? 3;
  }

  empreinte(m, couche) {
    return this.mesoContrats.get(m).empreinte_technique[couche];
  }

  /** Le méso-contrat porte la possibilité : sa couche n'y est pas à l'impact aucun, et son option y est permise. */
  porte(m, p) {
    const { couche, option } = this.possibilites.get(p);
    const e = this.empreinte(m, couche);
    return e.impact !== 'aucun' && e.options.includes(option);
  }

  couvre(m, oui) {
    return oui.filter((p) => this.porte(m, p));
  }

  requisesOk(m, oui) {
    return (this.mesoContrats.get(m).possibilites_requises ?? []).every((q) => oui.includes(q));
  }

  /** Chaque couche requise du méso-contrat a, parmi `possibles`, une possibilité qu'il porte. */
  couchesRequisesRemplies(m, possibles) {
    const portees = this.couvre(m, possibles);
    return Object.entries(this.mesoContrats.get(m).empreinte_technique)
      .every(([c, e]) => e.impact !== 'requis' || portees.some((p) => this.possibilites.get(p).couche === c));
  }

  peutEtrePrincipal(m, oui) {
    return this.requisesOk(m, oui) && this.couchesRequisesRemplies(m, oui);
  }

  /**
   * Règle de choix du modèle générique : le principal, puis les compléments en plus petit nombre,
   * en préférant ceux dont les couches requises sont remplies par les possibilités restantes.
   * Renvoie toutes les compositions retenues (plusieurs en cas d'égalité : une question les
   * départage), les possibilités qu'aucun méso-contrat ne porte, et l'absence de principal.
   */
  compositions(oui) {
    const ids = [...this.mesoContrats.keys()];
    const candidats = ids.filter((m) => this.peutEtrePrincipal(m, oui));
    if (candidats.length === 0) return { compositions: [], nonPortees: [], sansPrincipal: true };
    const meilleur = Math.max(...candidats.map((m) => this.couvre(m, oui).length));
    const compositions = [];
    const nonPortees = new Set();
    for (const principal of candidats.filter((m) => this.couvre(m, oui).length === meilleur)) {
      const reste = oui.filter((p) => !this.porte(principal, p));
      if (reste.length === 0) {
        compositions.push({ principal, complements: [] });
        continue;
      }
      const autres = ids.filter((m) => m !== principal && this.requisesOk(m, oui) && this.couvre(m, reste).length > 0);
      const orphelines = reste.filter((p) => !autres.some((m) => this.porte(m, p)));
      if (orphelines.length > 0) {
        orphelines.forEach((p) => nonPortees.add(p));
        continue;
      }
      for (let k = 1; k <= autres.length; k++) {
        const solutions = combinaisons(autres, k).filter((c) => reste.every((p) => c.some((m) => this.porte(m, p))));
        if (solutions.length === 0) continue;
        const naturelles = solutions.filter((c) => c.every((m) => this.couchesRequisesRemplies(m, reste)));
        for (const c of naturelles.length > 0 ? naturelles : solutions) compositions.push({ principal, complements: c });
        break;
      }
    }
    return { compositions, nonPortees: [...nonPortees], sansPrincipal: false };
  }

  /** Possibilités à oui d'une demande, dans l'ordre du modèle. */
  oui(demande) {
    return [...this.possibilites.keys()].filter((p) => demande?.[p]?.reponse === 'oui');
  }

  /** Possibilités inconnues dont la réponse oui changerait la composition : des questions à poser. */
  inconnusDeterminants(demande) {
    const oui = this.oui(demande);
    const signature = (r) => JSON.stringify([r.sansPrincipal, [...r.nonPortees].sort(), r.compositions.map(cleComposition).sort()]);
    const reference = signature(this.compositions(oui));
    return [...this.possibilites.keys()]
      .filter((p) => demande?.[p]?.reponse === 'inconnu')
      .filter((p) => signature(this.compositions([...oui, p])) !== reference);
  }

  /** Règles 2 et 4 : demande complète, sources citées, aucune inconnue déterminante. */
  verifierDemande(ticket) {
    const erreurs = [];
    const d = ticket.demande;
    if (!d || typeof d !== 'object') return ['demande absente'];
    for (const k of ['intention', 'maquette', ...this.possibilites.keys()]) {
      const r = d[k];
      if (!r || typeof r !== 'object') {
        erreurs.push(`demande : ${k} sans réponse`);
        continue;
      }
      if (k !== 'intention' && !this.valeurs.includes(r.reponse)) erreurs.push(`demande : ${k} vaut « ${r.reponse} », hors de ${this.valeurs.join(', ')}`);
      if (r.reponse !== 'inconnu' && !r.source) erreurs.push(`demande : ${k} sans source`);
    }
    for (const k of Object.keys(d)) {
      if (k !== 'intention' && k !== 'maquette' && !this.possibilites.has(k)) erreurs.push(`demande : ${k}, possibilité absente du modèle`);
    }
    if (erreurs.length === 0) {
      for (const p of this.inconnusDeterminants(d)) erreurs.push(`demande : ${p} reste inconnu alors que sa réponse changerait la composition (question à poser)`);
    }
    return erreurs;
  }

  /** Règles 1, 3 et 5 : composition nommée, conforme à la règle de choix, confirmée. */
  verifierComposition(ticket) {
    const erreurs = [];
    const principal = ticket.meso_contrat;
    const complements = ticket.complements ?? [];
    if (!this.mesoContrats.has(principal)) return [`méso-contrat principal inconnu : ${principal ?? '(absent)'}`];
    if (!Array.isArray(complements)) return ['complements doit être un tableau'];
    for (const m of complements) if (!this.mesoContrats.has(m)) erreurs.push(`complément inconnu : ${m}`);
    if (complements.includes(principal)) erreurs.push(`${principal} est à la fois principal et complément`);
    if (new Set(complements).size !== complements.length) erreurs.push('complément cité deux fois');
    if (ticket.referentiel !== this.version) erreurs.push(`référentiel ${ticket.referentiel ?? '(absent)'}, attendu ${this.version}`);
    if (erreurs.length > 0) return erreurs;
    const r = this.compositions(this.oui(ticket.demande));
    if (r.sansPrincipal) return ['aucun méso-contrat ne peut porter la demande en principal : à signaler, sans catégorie inventée'];
    if (r.nonPortees.length > 0) return [`possibilités portées par aucun méso-contrat : ${r.nonPortees.join(', ')} (à signaler)`];
    // En cas d'égalité, le développeur a tranché : sa composition est acceptée si elle figure parmi
    // celles que retient la règle.
    const declaree = { principal, complements };
    if (!r.compositions.some((c) => cleComposition(c) === cleComposition(declaree))) {
      erreurs.push(`composition ${decrireComposition(declaree)} non conforme à la règle de choix ; attendu : ${r.compositions.map(decrireComposition).join(', ou ')}`);
    }
    return erreurs;
  }

  /** Instances d'options d'un ticket : [{ couche, option, instance }]. */
  instancesOptions(ticket) {
    const res = [];
    for (const couche of COUCHES) {
      for (const [option, instances] of Object.entries(ticket[couche] ?? {})) {
        for (const instance of Array.isArray(instances) ? instances : [instances]) res.push({ couche, option, instance });
      }
    }
    return res;
  }

  /**
   * Règles 5 à 13, pour un ticket qui porte des options : rattachement, empreinte, paramètres,
   * catalogues, et couches requises remplies par des options rattachées.
   */
  verifierOptions(ticket) {
    const erreurs = [];
    const principal = ticket.meso_contrat;
    const composition = [principal, ...(ticket.complements ?? [])];
    const instances = this.instancesOptions(ticket);
    if (instances.length > 0 && ticket.meso_contrat_confirme !== true) erreurs.push('options choisies avant la confirmation de la composition (meso_contrat_confirme)');
    const rattachees = new Map(composition.map((m) => [m, new Set()]));
    for (const { couche, option, instance } of instances) {
      const nom = `${couche}.${option}`;
      const catalogue = this.options[couche]?.[option];
      if (!catalogue) {
        erreurs.push(`option inconnue du référentiel : ${nom}`);
        continue;
      }
      if (typeof instance !== 'object' || instance === null || Array.isArray(instance)) {
        erreurs.push(`${nom} : chaque instance doit être une table`);
        continue;
      }
      const m = instance.meso_contrat ?? principal;
      if (!rattachees.has(m)) {
        erreurs.push(`${nom} rattachée à ${m}, hors de la composition (${composition.join(', ')})`);
        continue;
      }
      const e = this.empreinte(m, couche);
      if (e.impact === 'aucun') erreurs.push(`${nom} rattachée à ${m}, dont la couche ${couche} est à l'impact aucun`);
      else if (!e.options.includes(option)) erreurs.push(`${nom} non permise par ${m} (options permises : ${e.options.join(', ') || 'aucune'})`);
      else rattachees.get(m).add(couche);
      for (const [p, valeurs] of Object.entries(catalogue.parametres ?? {})) {
        if (!valeurs.includes(instance[p])) erreurs.push(`${nom} : paramètre ${p} = « ${instance[p] ?? '(absent)'} », hors de ${valeurs.join(', ')}`);
      }
      if (option === 'crud') {
        const ops = instance.operations ?? [];
        for (const op of ops) if (!catalogue.operations.includes(op)) erreurs.push(`${nom} : opération ${op} hors de ${catalogue.operations.join(', ')}`);
        if (ops.includes('delete') && !catalogue.suppression.includes(instance.suppression)) erreurs.push(`${nom} : delete impose un mode de suppression (${catalogue.suppression.join(', ')})`);
      }
      if (option === 'endpoints' && !catalogue.methodes.includes(instance.methode)) erreurs.push(`${nom} : méthode ${instance.methode ?? '(absente)'} hors de ${catalogue.methodes.join(', ')}`);
      if (option === 'representations' && instance.selection === 'remplacement' && instance.version_publiee !== false) erreurs.push(`${nom} : remplacement choisi pour une version d'API publiée (socle, SC1.INV-2)`);
      if (option === 'evenements') {
        for (const champ of ['canal', 'types', 'instantane']) if (!instance[champ] || (Array.isArray(instance[champ]) && instance[champ].length === 0)) erreurs.push(`${nom} : ${champ} manquant`);
      }
      if (instance.analyse_image !== undefined) {
        const image = this.options.frontend?.analyse_image;
        if (couche !== 'frontend' || !image?.applicable_a.includes(option)) erreurs.push(`${nom} : analyse_image non applicable à cette option`);
        else {
          const format = String(instance.image_objectif ?? '').split('.').pop().toLowerCase();
          if (!instance.image_objectif || !image.formats.includes(format)) erreurs.push(`${nom} : analyse_image sans image_objectif en ${image.formats.join(', ')}`);
          for (const x of instance.analyse_image) if (!image.extractions.includes(x)) erreurs.push(`${nom} : extraction ${x} hors du catalogue`);
        }
      }
    }
    for (const [c, e] of Object.entries(this.mesoContrats.get(principal).empreinte_technique)) {
      if (e.impact === 'requis' && !rattachees.get(principal).has(c)) erreurs.push(`couche ${c} requise par ${principal} sans option qui lui soit rattachée`);
    }
    for (const m of composition.slice(1)) if (rattachees.has(m) && rattachees.get(m).size === 0) erreurs.push(`complément ${m} sans option qui lui soit rattachée`);
    return erreurs;
  }

  /** Règle 14 : méso-contrats transverses qui s'appliquent d'office aux couches touchées. */
  transverses(couchesTouchees) {
    return (this.donnees.meso_contrats_transverses ?? [])
      .filter((t) => (t.s_applique_si ?? []).some((c) => couchesTouchees.includes(c)))
      .map((t) => t.id);
  }
}
