#!/usr/bin/env node
// Arbre de tickets du prototype « skill de ticket », lot 1 : modèle et vérification.
//
// Un ticket et ses sous-tickets forment un Composite sur n niveaux : chaque nœud a la même
// interface, un seul parent, et se lit dans un fichier TOML (format du module referentiel de
// l'orchestrateur C7E, complété de `parent`, `depend_de` et `[[ticket.criteres]]`). Le vérificateur
// applique au nœud les règles du référentiel, et à l'arbre celles de la décomposition. Le plan donne
// l'ordre de résolution : un ticket après ses dépendances, un nœud composé après ses sous-tickets.
//
// Usage :
//   node prototypes/skill-ticket/outils/arbre.mjs verifier <dossier> [--referentiel <chemin>] [--profondeur-max <n>]
//   node prototypes/skill-ticket/outils/arbre.mjs plan <dossier> [--referentiel <chemin>] [--profondeur-max <n>]
//
// Sans --referentiel, le modèle vient du module referentiel de l'orchestrateur du dépôt. Rien n'est
// écrit : l'outil lit l'arbre et rend son verdict, code de sortie 1 au moindre écart.

import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ErreurToml, lireToml } from './toml.mjs';
import { chargerReferentiel, COUCHES, decrireComposition, lireTexte } from './referentiel.mjs';

const comparerReferences = (a, b) => a.localeCompare(b, 'fr', { numeric: true });

/** Nœud du Composite : un ticket, ou un sous-ticket à n'importe quelle profondeur. */
export class NoeudTicket {
  constructor(donnees, fichier, texte) {
    this.donnees = donnees;
    this.fichier = fichier;
    this.texte = texte; // texte source du nœud, fins de ligne normalisées
    this.ticket = donnees?.ticket ?? {};
    this.reference = this.ticket.reference;
    this.parent = null;
    this.enfants = [];
    this.relie = false; // relié à la racine par sa chaîne de parents
  }

  get estRacine() {
    return this.parent === null;
  }

  get estFeuille() {
    return this.enfants.length === 0;
  }

  get profondeur() {
    let n = 0;
    for (let p = this.parent; p; p = p.parent) n++;
    return n;
  }

  get composition() {
    return { principal: this.ticket.meso_contrat, complements: this.ticket.complements ?? [] };
  }

  get dependances() {
    return Array.isArray(this.ticket.depend_de) ? this.ticket.depend_de : [];
  }

  get criteres() {
    return Array.isArray(this.ticket.criteres) ? this.ticket.criteres : [];
  }

  ancetres() {
    const res = [];
    for (let p = this.parent; p; p = p.parent) res.push(p);
    return res;
  }

  descendants() {
    return this.enfants.flatMap((e) => [e, ...e.descendants()]);
  }

  feuilles() {
    return this.estFeuille ? [this] : this.enfants.flatMap((e) => e.feuilles());
  }

  /** Visiteur : le nœud, puis ses sous-tickets dans l'ordre des références. */
  accepter(visiteur) {
    visiteur.visiter(this);
    for (const e of this.enfants) e.accepter(visiteur);
  }
}

/** Lit tous les fichiers `.toml` d'un dossier, un nœud par fichier. */
export function chargerArbre(dossier) {
  const entrees = [];
  const erreurs = [];
  const fichiers = readdirSync(dossier).filter((f) => f.toLowerCase().endsWith('.toml')).sort(comparerReferences);
  for (const fichier of fichiers) {
    try {
      const texte = lireTexte(join(dossier, fichier));
      entrees.push({ donnees: lireToml(texte, fichier), fichier, texte });
    } catch (e) {
      if (!(e instanceof ErreurToml)) throw e;
      erreurs.push(e.message);
    }
  }
  const arbre = construireArbre(entrees);
  arbre.erreurs.unshift(...erreurs);
  if (fichiers.length === 0) arbre.erreurs.push(`${dossier} : aucun fichier .toml`);
  return arbre;
}

/** Relie les nœuds par leur parent ; relève références en double, parents multiples ou absents, racines. */
export function construireArbre(entrees) {
  const erreurs = [];
  const noeuds = [];
  const parReference = new Map();
  for (const { donnees, fichier, texte } of entrees) {
    const n = new NoeudTicket(donnees, fichier, texte);
    if (!donnees?.ticket || typeof n.reference !== 'string' || n.reference === '') {
      erreurs.push(`${fichier} : table [ticket] ou référence absente`);
      continue;
    }
    if (parReference.has(n.reference)) {
      erreurs.push(`${n.reference} : référence en double (${parReference.get(n.reference).fichier}, ${fichier})`);
      continue;
    }
    parReference.set(n.reference, n);
    noeuds.push(n);
  }
  for (const n of noeuds) {
    const p = n.ticket.parent;
    if (p === undefined) continue;
    if (typeof p !== 'string') {
      erreurs.push(`${n.reference} : un sous-ticket n'a qu'un seul parent ; parent doit être une référence, pas ${JSON.stringify(p)}`);
      continue;
    }
    const parent = parReference.get(p);
    if (!parent) erreurs.push(`${n.reference} : parent ${p} absent de l'arbre`);
    else if (parent === n) erreurs.push(`${n.reference} : un ticket ne peut pas être son propre parent`);
    else {
      n.parent = parent;
      parent.enfants.push(n);
    }
  }
  for (const n of noeuds) n.enfants.sort((a, b) => comparerReferences(a.reference, b.reference));
  const racines = noeuds.filter((n) => n.ticket.parent === undefined);
  if (racines.length === 0 && noeuds.length > 0) erreurs.push('aucune racine : un seul ticket doit être sans parent');
  if (racines.length > 1) erreurs.push(`plusieurs racines (${racines.map((r) => r.reference).join(', ')}) : un seul ticket doit être sans parent`);
  const racine = racines.length === 1 ? racines[0] : null;
  if (racine) {
    // Chaque nœud n'a qu'un parent : depuis la racine, on ne parcourt qu'un arbre, sans cycle.
    for (const n of [racine, ...racine.descendants()]) n.relie = true;
    for (const n of noeuds) {
      if (!n.relie && n.parent) erreurs.push(`${n.reference} : non relié à la racine ${racine.reference} (cycle de parenté)`);
    }
  }
  return { racine, noeuds, parReference, erreurs };
}

/** Dépendances admises d'un nœud : cibles existantes, ni lui-même, ni un ancêtre, ni un descendant. */
function dependancesAdmises(n, parReference) {
  return n.dependances
    .map((r) => parReference.get(r))
    .filter((c) => c && c !== n && c.relie && !n.ancetres().includes(c) && !c.ancetres().includes(n));
}

/** Premier cycle du graphe des dépendances seules, sous forme de chemin, ou null. */
function cycleDeDependances(noeuds, parReference) {
  const etat = new Map(); // 1 en cours, 2 terminé
  const pile = [];
  const visiter = (n) => {
    etat.set(n, 1);
    pile.push(n);
    for (const c of dependancesAdmises(n, parReference)) {
      if (etat.get(c) === 1) return [...pile.slice(pile.indexOf(c)), c];
      if (!etat.has(c)) {
        const cycle = visiter(c);
        if (cycle) return cycle;
      }
    }
    pile.pop();
    etat.set(n, 2);
    return null;
  };
  for (const n of noeuds) {
    if (!etat.has(n)) {
      const cycle = visiter(n);
      if (cycle) return cycle.map((x) => x.reference);
    }
  }
  return null;
}

/**
 * Ordre de résolution : une feuille se résout après ses dépendances, un nœud composé se clôt après
 * ses sous-tickets et ses dépendances. À égalité, l'ordre de l'arbre (préfixe). Les nœuds pris dans
 * un cycle restent dans `reste`. Pour un sous-arbre (`racine` donnée), les dépendances vers un
 * ticket extérieur sont des préalables, rendus dans `externes`.
 */
export function ordreDeResolution(arbre, racine = arbre.racine) {
  const { parReference } = arbre;
  if (!racine) return { ordre: [], reste: [], externes: [] };
  const prefixe = [];
  racine.accepter({ visiter: (n) => prefixe.push(n) });
  const dedans = new Set(prefixe);
  const rang = new Map(prefixe.map((n, k) => [n, k]));
  const externes = prefixe.flatMap((n) => dependancesAdmises(n, parReference).filter((d) => !dedans.has(d)).map((d) => ({ noeud: n, dependance: d })));
  const attentes = new Map(prefixe.map((n) => [n, new Set([...n.enfants, ...dependancesAdmises(n, parReference).filter((d) => dedans.has(d))])]));
  const ordre = [];
  const faits = new Set();
  for (;;) {
    const prets = prefixe.filter((n) => !faits.has(n) && [...attentes.get(n)].every((x) => faits.has(x)));
    if (prets.length === 0) break;
    prets.sort((a, b) => rang.get(a) - rang.get(b));
    const n = prets[0];
    faits.add(n);
    ordre.push({ noeud: n, action: n.estFeuille ? 'résoudre' : 'clore' });
  }
  return { ordre, reste: prefixe.filter((n) => !faits.has(n)).map((n) => n.reference), externes };
}

/** Couches touchées par les options des feuilles de l'arbre. */
function couchesTouchees(arbre, R) {
  const couches = new Set();
  for (const f of arbre.racine?.feuilles() ?? []) for (const { couche } of R.instancesOptions(f.ticket)) couches.add(couche);
  return COUCHES.filter((c) => couches.has(c));
}

/** Vérifie l'arbre : règles du référentiel sur chaque nœud, règles de la décomposition sur l'arbre. */
export function verifierArbre(arbre, R, { profondeurMax = R.profondeurMax } = {}) {
  const erreurs = [...arbre.erreurs];
  const { racine, noeuds, parReference } = arbre;
  const relies = noeuds.filter((n) => n.relie);

  // Règles du référentiel, nœud par nœud (visiteur sur le Composite).
  racine?.accepter({
    visiter(n) {
      const ajouter = (e) => erreurs.push(`${n.reference} : ${e}`);
      R.verifierDemande(n.ticket).forEach(ajouter);
      const composition = R.verifierComposition(n.ticket);
      composition.forEach(ajouter);
      const principalConnu = R.mesoContrats.has(n.ticket.meso_contrat);
      if (n.estFeuille) {
        if (principalConnu) R.verifierOptions(n.ticket).forEach(ajouter);
        return;
      }
      if (R.instancesOptions(n.ticket).length > 0) ajouter("nœud composé : il ne porte pas d'option, ses sous-tickets les portent");
      if (n.ticket.meso_contrat_confirme !== true) ajouter('composition non confirmée (meso_contrat_confirme)');
      if (!principalConnu) return;
      const couvertes = new Set(n.feuilles().flatMap((f) => R.instancesOptions(f.ticket).map((o) => o.couche)));
      for (const [c, e] of Object.entries(R.mesoContrats.get(n.ticket.meso_contrat).empreinte_technique)) {
        if (e.impact === 'requis' && !couvertes.has(c)) ajouter(`couche ${c} requise par ${n.ticket.meso_contrat} : aucune option dans ses sous-tickets`);
      }
    },
  });

  // Profondeur.
  for (const n of relies) {
    if (n.profondeur > profondeurMax) erreurs.push(`${n.reference} : profondeur ${n.profondeur}, au-delà du plafond ${profondeurMax}`);
  }

  // Décomposition : couverture du parent, et pas de débordement des sous-tickets.
  for (const n of relies) {
    if (n.estFeuille) continue;
    const portees = new Set(n.enfants.flatMap((e) => R.oui(e.ticket.demande)));
    for (const p of R.oui(n.ticket.demande)) {
      if (!portees.has(p)) erreurs.push(`${n.reference} : ${p} est à oui, mais aucun de ses sous-tickets ne le porte`);
    }
  }
  for (const n of relies) {
    if (!n.parent) continue;
    const duParent = new Set(R.oui(n.parent.ticket.demande));
    for (const p of R.oui(n.ticket.demande)) {
      if (!duParent.has(p)) erreurs.push(`${n.reference} : ${p} est à oui, absent de son parent ${n.parent.reference} : revenir à la qualification du parent`);
    }
  }

  // Critères : chaque sous-ticket soutient son parent, chaque critère d'un nœud composé est soutenu.
  for (const n of relies) {
    const ids = n.criteres.map((c) => c.id);
    if (ids.length === 0) erreurs.push(`${n.reference} : aucun critère d'acceptation`);
    const doubles = [...new Set(ids.filter((x, k) => ids.indexOf(x) !== k))];
    if (doubles.length > 0) erreurs.push(`${n.reference} : critère en double : ${doubles.join(', ')}`);
    for (const c of n.criteres) {
      const ici = `${n.reference}:${c.id}`;
      if (!n.parent) {
        if (c.soutient !== undefined) erreurs.push(`${ici} : la racine ne soutient aucun critère`);
        continue;
      }
      if (!Array.isArray(c.soutient) || c.soutient.length === 0) {
        erreurs.push(`${ici} : ne soutient aucun critère de son parent ${n.parent.reference}`);
        continue;
      }
      for (const ref of c.soutient) {
        const [r, id] = String(ref).split(':');
        if (r !== n.parent.reference) erreurs.push(`${ici} : soutient ${ref}, qui n'est pas un critère de son parent ${n.parent.reference}`);
        else if (!n.parent.criteres.some((x) => x.id === id)) erreurs.push(`${ici} : soutient ${ref}, critère absent de ${n.parent.reference}`);
      }
    }
  }
  for (const n of relies) {
    if (n.estFeuille) continue;
    for (const c of n.criteres) {
      const ref = `${n.reference}:${c.id}`;
      const soutenu = n.enfants.some((e) => e.criteres.some((x) => Array.isArray(x.soutient) && x.soutient.includes(ref)));
      if (!soutenu) erreurs.push(`${ref} : aucun critère de ses sous-tickets ne le soutient`);
    }
  }

  // Dépendances : cibles admises, puis cycles.
  for (const n of relies) {
    const dep = n.ticket.depend_de;
    if (dep !== undefined && (!Array.isArray(dep) || dep.some((x) => typeof x !== 'string'))) {
      erreurs.push(`${n.reference} : depend_de doit être un tableau de références`);
      continue;
    }
    for (const r of n.dependances) {
      const cible = parReference.get(r);
      if (!cible) erreurs.push(`${n.reference} : dépend de ${r}, absent de l'arbre`);
      else if (cible === n) erreurs.push(`${n.reference} : dépend de lui-même`);
      else if (n.relie && n.ancetres().includes(cible)) erreurs.push(`${n.reference} : dépend de son ancêtre ${r} ; un ticket se clôt après ses sous-tickets`);
      else if (cible.relie && cible.ancetres().includes(n)) erreurs.push(`${n.reference} : dépend de son descendant ${r} ; c'est déjà la condition de sa clôture`);
    }
  }
  const cycle = cycleDeDependances(relies, parReference);
  if (cycle) erreurs.push(`cycle de dépendances : ${cycle.join(' → ')}`);
  else {
    const { reste } = ordreDeResolution(arbre);
    if (reste.length > 0) erreurs.push(`cycle entre dépendances et clôtures : ${reste.join(', ')}`);
  }
  return erreurs;
}

/** Dessin de l'arbre, une ligne par nœud. */
export function decrireArbre(arbre) {
  const lignes = [];
  const decrire = (n, prefixe, dernier, racine) => {
    const branche = racine ? '' : dernier ? '└─ ' : '├─ ';
    const deps = n.dependances.length > 0 ? ` · dépend de ${n.dependances.join(', ')}` : '';
    const nb = n.criteres.length;
    lignes.push(`${prefixe}${branche}${n.reference} · ${decrireComposition(n.composition)} · ${nb} critère${nb > 1 ? 's' : ''}${deps}`);
    const suite = racine ? '' : prefixe + (dernier ? '   ' : '│  ');
    n.enfants.forEach((e, k) => decrire(e, suite, k === n.enfants.length - 1, false));
  };
  if (arbre.racine) decrire(arbre.racine, '', true, true);
  return lignes;
}

function bilan(arbre, R, profondeurMax) {
  const relies = arbre.noeuds.filter((n) => n.relie);
  const profondeur = Math.max(0, ...relies.map((n) => n.profondeur));
  return `Arbre ${arbre.racine.reference} conforme : ${relies.length} ticket${relies.length > 1 ? 's' : ''}, profondeur ${profondeur} (plafond ${profondeurMax}), référentiel ${R.version}`;
}

/** Ligne de commande. Renvoie le code de sortie ; écrit par `sortie` et `erreur`. */
export function principal(argv, sortie = console.log, erreur = console.error) {
  const [commande, dossier, ...reste] = argv;
  const options = {};
  for (let k = 0; k < reste.length; k++) {
    if (reste[k] === '--referentiel') options.referentiel = reste[++k];
    else if (reste[k] === '--profondeur-max') options.profondeurMax = Number(reste[++k]);
    else {
      erreur(`option inconnue : ${reste[k]}`);
      return 2;
    }
  }
  if (!['verifier', 'plan'].includes(commande) || !dossier || (options.profondeurMax !== undefined && !(options.profondeurMax >= 0))) {
    erreur('Usage : arbre.mjs verifier|plan <dossier> [--referentiel <chemin>] [--profondeur-max <n>]');
    return 2;
  }
  const R = chargerReferentiel(options.referentiel);
  const profondeurMax = options.profondeurMax ?? R.profondeurMax;
  const arbre = chargerArbre(dossier);
  const erreurs = verifierArbre(arbre, R, { profondeurMax });
  if (erreurs.length > 0) {
    for (const e of erreurs) erreur(`ÉCHEC  ${e}`);
    erreur(`${erreurs.length} écart${erreurs.length > 1 ? 's' : ''} : arbre non conforme`);
    return 1;
  }
  sortie(bilan(arbre, R, profondeurMax));
  if (commande === 'plan') {
    sortie('');
    for (const l of decrireArbre(arbre)) sortie(l);
    sortie('');
    sortie('Ordre de résolution :');
    const { ordre } = ordreDeResolution(arbre);
    const largeur = Math.max(...ordre.map(({ noeud }) => noeud.reference.length));
    ordre.forEach(({ noeud, action }, k) => sortie(`  ${String(k + 1).padStart(2)}. ${noeud.reference.padEnd(largeur)}  ${action}`));
    sortie('');
    sortie(`Méso-contrats transverses : ${R.transverses(couchesTouchees(arbre, R)).join(', ') || 'aucun'}`);
    const feuilles = arbre.racine.feuilles().map((f) => f.reference);
    sortie(arbre.racine.estFeuille
      ? `Ratification : le skill ${arbre.racine.reference}, ticket sans sous-ticket, avant sa première action.`
      : `Ratification : l'arbre, sur le skill parent ${arbre.racine.reference} ; puis chaque feuille avant sa première action (${feuilles.join(', ')}).`);
  }
  return 0;
}

const estPrincipal = process.argv[1] && fileURLToPath(import.meta.url).toLowerCase() === resolve(process.argv[1]).toLowerCase();
if (estPrincipal) process.exitCode = principal(process.argv.slice(2));
