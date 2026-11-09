// Monteur des skills de ticket (generateur-skill-ticket, D2).
//
// Le Monteur assemble, nœud par nœud, le skill de chaque ticket de l'arbre avec les pièces que lui
// donne la fabrique de la pile ; il ne choisit rien lui-même. Il écrit chaque skill dans un dossier,
// en tire la transmission avec `tools/bundle.mjs`, vérifie l'aller-retour, puis contrôle l'héritage :
// chaque skill reprend, mot pour mot ou à l'empreinte près, tout ce dont il hérite. Un skill qui
// omet ou altère un invariant n'est pas écrit.
//
// L'assemblage est déterministe et ne consomme aucun token : du code, sur des fichiers.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { assembler, relire } from '../../../tools/bundle.mjs';
import { lireToml } from './toml.mjs';
import { chargerReferentiel } from './referentiel.mjs';
import { chargerArbre, verifierArbre } from './arbre.mjs';
import { FABRIQUES, VERSION_SKILL, couchesDuTicket, nomSkill, sha256 } from './fabrique.mjs';
import { BOITE, blocDeCode, chargerProjet, chargerSources, extraireSection, idInvariant, lignesInvariants, resoudre } from './sources.mjs';

export const DOSSIER_TRANSMISSIONS = 'transmissions';
const DEFINITION = /\*\*((?:D|SC)\d+\.INV-\d+)\*\*/g;
// Identifiant non précédé d'un préfixe de skill (`java:`) ni d'un autre caractère d'identifiant.
const CITATION = /(?<![\w:-])((?:D|SC)\d+\.INV-\d+)/g;

export class Monteur {
  constructor(fabrique) {
    this.fabrique = fabrique;
  }

  /** Fichiers du skill d'un nœud, dans l'ordre de la transmission, et son en-tête. */
  construire(n) {
    const f = this.fabrique;
    const copies = f.copies(n);
    const corps = [
      f.ticket(n),
      ...f.modules(n),
      f.recette(n),
      ...f.sousTickets(n),
      ...f.documents(n),
      ...f.kits(n),
      ...f.champ(n),
      ...f.champDepot(n),
      ...f.vue(n),
      f.methode(n),
      f.invariants(n),
      ...copies.map((c) => c.fichier),
      ...f.agents(n),
      ...f.commandes(n),
      ...f.observateurs(n),
    ];
    const manifeste = f.manifeste(n, corps, f.provenance(n, copies));
    const consigne = f.consigne(n, [manifeste, { rel: 'SKILL.md' }, ...corps]);
    return { reference: n.reference, nom: nomSkill(n.reference), version: VERSION_SKILL, fichiers: [manifeste, consigne, ...corps], entete: f.entete(n) };
  }

  /** Les skills de tout l'arbre, dans l'ordre de l'arbre (visiteur, préfixe). */
  construireArbre(arbre) {
    const skills = [];
    arbre.racine.accepter({ visiter: (n) => skills.push(this.construire(n)) });
    return skills;
  }
}

const carte = (fichiers) => new Map(fichiers.map((f) => [f.rel, f.contenu]));

/**
 * Contrôle de l'héritage d'un skill de ticket, à partir de ses fichiers (rel → contenu) : provenance
 * déclarée complète, invariants et sections de la méthode repris mot pour mot, copies identiques à
 * leur source à la version épinglée, chaque invariant cité défini. `projet` : fichier d'invariants du
 * projet hors du dépôt, pour comparer sa copie. Renvoie la liste des écarts.
 */
export function verifierHeritage(fichiers, { projet } = {}) {
  let manifeste;
  try {
    manifeste = JSON.parse(fichiers.get('manifest.json'));
  } catch {
    return ['manifest.json absent ou illisible'];
  }
  const t = manifeste?.ticket;
  if (!t || !Array.isArray(t.herites)) return ["manifest.json : provenance des héritages absente (ticket.herites), ce n'est pas un skill de ticket"];
  const erreurs = [];
  const herites = new Map(t.herites.map((h) => [h.path, h]));

  // Le ticket transmis est bien celui du manifeste.
  let ticket = null;
  try {
    ticket = lireToml(fichiers.get('ticket.toml') ?? '', 'ticket.toml').ticket ?? null;
  } catch (e) {
    erreurs.push(`ticket.toml illisible : ${e.message}`);
  }
  if (ticket && ticket.reference !== t.reference) erreurs.push(`ticket.toml : référence ${ticket.reference}, manifeste ${t.reference}`);

  // Héritages requis : la méthode, le socle et le projet pour tout nœud ; les référentiels de la pile
  // des couches touchées pour une feuille ; la boîte à outils de l'arbre pour la racine (lot 4).
  const requis = ['modules/methode/SKILL.md', 'modules/invariants/SKILL.md', 'socle/SKILL.md', 'projet/meso-contrats.md'];
  const Fabrique = FABRIQUES[t.genere_par?.fabrique];
  if (!Fabrique) erreurs.push(`fabrique inconnue : ${t.genere_par?.fabrique ?? '(absente)'}`);
  else if ((t.enfants ?? []).length === 0 && ticket) {
    for (const nom of Fabrique.referencesRequises(couchesDuTicket(ticket))) requis.push(`references/${nom}.md`);
  }
  // Un skill produit par le générateur exige la boîte à outils de sa version ; un skill produit par le
  // prototype, celle de son lot.
  if (t.parent === null) requis.push(...BOITE.filter((b) => exigeDans(b, t.genere_par)).map((b) => b.path));
  for (const p of requis) if (!herites.has(p)) erreurs.push(`héritage absent du manifeste : ${p}`);

  for (const h of t.herites) {
    const contenu = fichiers.get(h.path);
    if (contenu === undefined) {
      erreurs.push(`${h.path} : fichier hérité absent`);
      continue;
    }
    let source = null;
    try {
      if (!String(h.from).startsWith('projet:')) source = resoudre({ from: h.from, version: h.version });
      else if (projet) source = projet.contenu;
    } catch (e) {
      erreurs.push(`${h.path} : source introuvable (${e.message})`);
      continue;
    }
    const origine = `${h.from}${h.version ? ` ${h.version}` : ''}`;
    if (h.invariants !== undefined) {
      const lignes = lignesInvariants(source);
      const presentes = new Set(contenu.split('\n'));
      for (const l of lignes) if (!presentes.has(l)) erreurs.push(`invariant omis ou altéré : ${idInvariant(l)} (${origine})`);
      if (h.invariants !== lignes.length) erreurs.push(`${h.path} : ${h.invariants} invariants déclarés, ${lignes.length} dans ${origine}`);
    } else if (h.sections !== undefined) {
      // Sections reprises mot pour mot : la méthode de l'orchestrateur, ou un extrait de la boîte à outils.
      const quoi = h.path === 'modules/methode/SKILL.md' ? 'de la méthode' : `de ${h.path}`;
      for (const s of h.sections) {
        let texte;
        try {
          texte = extraireSection(source, s);
        } catch (e) {
          erreurs.push(`${h.path} : ${e.message} dans ${origine}`);
          continue;
        }
        if (!contenu.includes(texte)) erreurs.push(`section § ${s} ${quoi} omise ou altérée (${origine})`);
      }
      if (h.sha256 !== undefined && sha256(contenu) !== h.sha256) erreurs.push(`${h.path} : empreinte différente de celle du manifeste, copie altérée`);
    } else if (h.bloc !== undefined) {
      // Script tiré d'un bloc de code d'une section, à l'identique.
      let attendu = null;
      try {
        attendu = blocDeCode(source, h.bloc.section, h.bloc.langage).replace(/\n*$/, '\n');
      } catch (e) {
        erreurs.push(`${h.path} : ${e.message} dans ${origine}`);
      }
      if (attendu !== null && contenu !== attendu) erreurs.push(`${h.path} : différent du bloc ${h.bloc.langage} du § ${h.bloc.section} de ${origine}, copie altérée`);
      if (sha256(contenu) !== h.sha256) erreurs.push(`${h.path} : empreinte différente de celle du manifeste, copie altérée`);
    } else {
      if (sha256(contenu) !== h.sha256) erreurs.push(`${h.path} : empreinte différente de celle du manifeste, copie altérée`);
      if (source !== null && contenu !== source.replace(/\n*$/, '\n')) erreurs.push(`${h.path} : différent de ${origine}, copie altérée`);
    }
  }

  // Chaque invariant cité par la consigne, les modules et les agents est défini : par l'orchestrateur
  // (module invariants) ou par le socle. Les copies gardent l'espace de noms de leur source.
  const definis = new Set();
  for (const [, id] of (fichiers.get('modules/invariants/SKILL.md') ?? '').matchAll(DEFINITION)) if (id.startsWith('D')) definis.add(id);
  for (const [, id] of (fichiers.get('socle/SKILL.md') ?? '').matchAll(DEFINITION)) if (id.startsWith('SC')) definis.add(id);
  for (const [rel, contenu] of fichiers) {
    if (!(rel === 'SKILL.md' || rel.startsWith('modules/') || rel.startsWith('agents/'))) continue;
    for (const [, id] of contenu.matchAll(CITATION)) if (!definis.has(id)) erreurs.push(`${rel} : ${id} cité, défini ni par l'orchestrateur ni par le socle`);
  }
  return [...new Set(erreurs)];
}

/** Relit une transmission de skill de ticket et la vérifie : intégrité, identité, héritage. */
export function verifierTransmission(texte, options = {}) {
  const { entete, fichiers, sommes } = relire(texte.replace(/^﻿/, '').replace(/\r\n/g, '\n'));
  if (fichiers.length === 0) return { erreurs: ['aucun bloc <<<FICHIER>>> : ce n\'est pas une transmission'] };
  const erreurs = [];
  if (sommes.length !== fichiers.length || sommes.some((s, i) => s.rel !== fichiers[i].rel)) erreurs.push("table d'intégrité différente des fichiers transmis");
  fichiers.forEach((f, i) => {
    if (sommes[i]?.rel === f.rel && sha256(f.contenu) !== sommes[i].empreinte) erreurs.push(`${f.rel} : empreinte fausse, transmission altérée`);
  });
  const contenus = carte(fichiers);
  let manifeste = {};
  try {
    manifeste = JSON.parse(contenus.get('manifest.json'));
  } catch {
    erreurs.push('manifest.json absent ou illisible');
  }
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(contenus.get('SKILL.md') ?? '')?.[1] ?? '';
  if (/^name:\s*(\S+)\s*$/m.exec(fm)?.[1] !== manifeste.name) erreurs.push(`SKILL.md : nom différent de celui du manifeste (${manifeste.name})`);
  if (!entete.includes(`skill ${manifeste.name} ${manifeste.version},`)) erreurs.push('en-tête : nom ou version différents de ceux du manifeste');
  erreurs.push(...verifierHeritage(contenus, options));
  return { nom: manifeste.name, version: manifeste.version, fichiers: fichiers.length, erreurs: [...new Set(erreurs)] };
}

/** Ordre de deux versions X.Y.Z : négatif, nul ou positif. */
const comparerVersions = (a, b) => {
  const [x, y] = [a, b].map((v) => String(v).split('.').map(Number));
  for (let k = 0; k < 3; k++) if ((x[k] ?? 0) !== (y[k] ?? 0)) return (x[k] ?? 0) - (y[k] ?? 0);
  return 0;
};

/**
 * Un fichier de la boîte à outils est-il exigé du skill racine que décrit `genere_par` ? Ajouté par un lot du
 * prototype (nombre) : exigé d'un skill du générateur, ou du prototype à partir de ce lot. Ajouté par une
 * version du générateur (chaîne) : exigé d'un skill de cette version ou d'une suivante.
 */
export function exigeDans(b, genereePar = {}) {
  const depuis = b.depuis ?? 4;
  if (typeof depuis === 'string') return Boolean(genereePar?.generateur) && comparerVersions(genereePar.version, depuis) >= 0;
  return Boolean(genereePar?.generateur) || depuis <= (genereePar?.lot ?? 0);
}

/** Un dossier se remplace seulement s'il contient un skill de ticket produit par le générateur, ou par le prototype dont il est issu. */
function estSkillGenere(dossier) {
  try {
    const g = JSON.parse(readFileSync(join(dossier, 'manifest.json'), 'utf8')).ticket?.genere_par;
    return g?.generateur === 'generateur-skill-ticket' || g?.prototype === 'skill-ticket';
  } catch {
    return false;
  }
}

function ecrireFichiers(dossier, fichiers) {
  for (const f of fichiers) {
    const chemin = join(dossier, ...f.rel.split('/'));
    mkdirSync(dirname(chemin), { recursive: true });
    writeFileSync(chemin, f.contenu);
  }
}

/**
 * Génère les skills de ticket d'un arbre. Vérifie l'arbre (lot 1), construit chaque skill, contrôle
 * son héritage ; puis, si `sortie` est donnée, écrit chaque skill dans `<sortie>/<nom>/`, en tire la
 * transmission par `tools/bundle.mjs`, vérifie l'aller-retour et l'héritage de la transmission, et
 * l'écrit dans `<sortie>/transmissions/<nom>-<version>.md`. Rien n'est écrit au moindre écart.
 */
export function generer({ arbre: dossierArbre, sortie, referentiel, invariantsProjet, profondeurMax, fabrique = 'java-angular-postgresql' }) {
  const Fabrique = typeof fabrique === 'function' ? fabrique : FABRIQUES[fabrique];
  if (!Fabrique) return { erreurs: [`fabrique inconnue : ${fabrique} (connues : ${Object.keys(FABRIQUES).join(', ')})`], skills: [] };
  const R = chargerReferentiel(referentiel);
  const arbre = chargerArbre(dossierArbre);
  const erreursArbre = verifierArbre(arbre, R, { profondeurMax: profondeurMax ?? R.profondeurMax });
  if (erreursArbre.length > 0) return { erreurs: erreursArbre, skills: [] };

  const sources = chargerSources({ invariantsProjet });
  const skills = new Monteur(new Fabrique({ R, arbre, sources })).construireArbre(arbre);
  const erreurs = [];
  const noms = new Map();
  for (const s of skills) {
    if (noms.has(s.nom)) erreurs.push(`${s.reference} et ${noms.get(s.nom)} donnent le même nom de skill, ${s.nom}`);
    noms.set(s.nom, s.reference);
    for (const e of verifierHeritage(carte(s.fichiers), { projet: sources.projet })) erreurs.push(`${s.nom} : ${e}`);
  }
  if (erreurs.length > 0 || !sortie) return { erreurs, skills, sources };

  // Écriture : d'abord s'assurer que rien d'étranger ne sera remplacé.
  for (const s of skills) {
    const dossier = join(sortie, s.nom);
    if (existsSync(dossier) && !estSkillGenere(dossier)) erreurs.push(`${dossier} existe et n'est pas un skill de ticket généré : rien n'est remplacé`);
  }
  if (erreurs.length > 0) return { erreurs, skills, sources };
  const dossierTransmissions = join(sortie, DOSSIER_TRANSMISSIONS);
  mkdirSync(dossierTransmissions, { recursive: true });
  for (const s of skills) {
    const dossier = join(sortie, s.nom);
    rmSync(dossier, { recursive: true, force: true });
    ecrireFichiers(dossier, [...s.fichiers, s.entete]);
    const t = assembler(dossier);
    // Aller-retour : la transmission, relue comme le ferait l'IA, redonne chaque fichier construit.
    const relu = relire(t.texte);
    const attendu = s.fichiers.map((f) => `${f.rel}\n${f.contenu}`).join('\0');
    if (relu.fichiers.map((f) => `${f.rel}\n${f.contenu}`).join('\0') !== attendu) erreurs.push(`${s.nom} : aller-retour de la transmission différent des fichiers construits`);
    const verdict = verifierTransmission(t.texte, { projet: sources.projet });
    for (const e of verdict.erreurs) erreurs.push(`${s.nom} : ${e}`);
    s.transmission = join(dossierTransmissions, `${t.nom}-${t.version}.md`);
    s.texte = t.texte;
    writeFileSync(s.transmission, t.texte);
  }
  return { erreurs, skills, sources };
}

/** Transmissions désignées : des fichiers `.md`, ou tous ceux d'un dossier. */
export function transmissionsDe(chemins) {
  return chemins.flatMap((c) => (existsSync(c) && !c.toLowerCase().endsWith('.md')
    ? readdirSync(c).filter((f) => f.toLowerCase().endsWith('.md')).sort().map((f) => join(c, f))
    : [c]));
}

export { chargerProjet };
