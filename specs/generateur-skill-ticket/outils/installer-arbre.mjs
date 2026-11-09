#!/usr/bin/env node
// Installateur d'un arbre de skills de ticket dans Gemini CLI (generateur-skill-ticket, D3).
//
// Usage, depuis le dossier où Gemini CLI est lancé (ou avec --workspace <dossier>) :
//   node <dépôt>/specs/generateur-skill-ticket/outils/installer-arbre.mjs installer <dossier | transmission.md>... [--visible] [--forcer] [--essai]
//   node <dépôt>/specs/generateur-skill-ticket/outils/installer-arbre.mjs liste
//   node <dépôt>/specs/generateur-skill-ticket/outils/installer-arbre.mjs verifier [<clé>] [--gemini <exécutable>]
//   node <dépôt>/specs/generateur-skill-ticket/outils/installer-arbre.mjs lancer <référence> [--gemini <exécutable>] [--essai]
//   node <dépôt>/specs/generateur-skill-ticket/outils/installer-arbre.mjs retirer <clé> [--sans-archive] [--forcer] [--essai]
//
// `installer` vérifie chaque transmission (intégrité et héritage, lot 2) et que l'ensemble forme un arbre
// complet ; installe les skills par tools/installer.mjs ; copie les agents des feuilles dans
// .gemini/agents/ et la commande de chaque nœud dans .gemini/commands/ticket/ ; écrit le relevé de
// l'installation et une copie des transmissions dans .gemini/skill-ticket/<clé>/ ; masque le tout à Git,
// comme tools/installer.mjs masque les skills. Rien n'est écrit au moindre écart.
// `lancer` ouvre Gemini CLI dans le workspace, en mode interactif, sur la phrase qui active le skill du
// nœud : une session par nœud, avec son propre contexte.
// `liste` montre les arbres installés et l'état de chaque nœud, d'après le champ d'observation de l'arbre
// (lot 5 ; retours.md pour les arbres des lots 3 et 4) et les dossiers sous docs/demandes/, puis le
// résumé du champ : critères en écart ou menacés, désaccords, observations attendues ; et, depuis le
// lot 6, le chemin de la vue augmentée et sa fraîcheur.
// `verifier` contrôle les fichiers installés, puis, si Gemini CLI est là, que ses skills sont découverts
// et ses agents chargés.
// `retirer` archive les transmissions dans docs/demandes/<clé>/skills/, puis retire skills, agents,
// commandes et relevé.
//
// Gemini CLI se désigne par --gemini, ou par la variable SKILL_TICKET_GEMINI ; à défaut, `gemini`.
// Code de sortie 1 au moindre écart, 2 pour un usage incorrect. Node 20 ou plus récent, git pour le masquage.

import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { relire } from '../../../tools/bundle.mjs';
import { RACINE_DEPOT, lireTexte } from './referentiel.mjs';
import { phraseActivation } from './fabrique.mjs';
import { contexteDe, etatChamp, lireChamp, ratifications, verifierChamp } from './champ.mjs';
import { FICHIERS_VUE, etatVue } from './vue.mjs';
import { transmissionsDe, verifierTransmission } from './monteur.mjs';

const INSTALLATEUR = join(RACINE_DEPOT, 'tools', 'installer.mjs');
const RELEVES = ['.gemini', 'skill-ticket'];
const FORMAT = 'skill-ticket.installation/1';
const BLOC = '# >>> skill-ticket : agents, commandes et relevés des arbres de skills de ticket (specs/generateur-skill-ticket)';
// Bloc écrit par le prototype : reconnu, puis remplacé par le bloc courant à la prochaine écriture.
const BLOCS_ANCIENS = ['# >>> skill-ticket : agents, commandes et relevés des arbres de skills de ticket (prototypes/skill-ticket)'];
const FIN_BLOC = '# <<< skill-ticket';
const CARACTERES_INTERDITS = /["%!^&|<>`\r\n]/;
const CLE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export class Erreur extends Error {}

const sha256 = (contenu) => createHash('sha256').update(contenu).digest('hex');
const enPosix = (chemin) => chemin.split(sep).join('/');
const pluriel = (n, mot, pluriels = `${mot}s`) => `${n} ${n > 1 ? pluriels : mot}`;
const echapper = (texte) => texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const vraiChemin = (chemin) => {
  try {
    return realpathSync.native(chemin);
  } catch {
    return resolve(chemin);
  }
};
const fichierDans = (ws, chemin) => join(ws, ...chemin.split('/').filter(Boolean));
const lireOuNull = (chemin) => {
  try {
    return readFileSync(chemin);
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------------------
// L'arbre, à partir de ses transmissions
// ---------------------------------------------------------------------------

/** Lit et vérifie les transmissions d'un arbre ; renvoie la clé et les nœuds dans l'ordre de l'arbre. */
export function lireArbre(cibles) {
  const chemins = transmissionsDe(cibles);
  if (chemins.length === 0) throw new Erreur('aucune transmission désignée');
  const erreurs = [];
  const noeuds = [];
  for (const chemin of chemins) {
    if (!existsSync(chemin)) {
      erreurs.push(`${chemin} : introuvable`);
      continue;
    }
    const texte = lireTexte(chemin);
    const verdict = verifierTransmission(texte);
    if (verdict.erreurs.length > 0) {
      for (const e of verdict.erreurs) erreurs.push(`${basename(chemin)} : ${e}`);
      continue;
    }
    const fichiers = new Map(relire(texte).fichiers.map((f) => [f.rel, f.contenu]));
    const m = JSON.parse(fichiers.get('manifest.json'));
    noeuds.push({ chemin: resolve(chemin), texte, fichiers, nom: m.name, version: m.version, t: m.ticket });
  }
  if (erreurs.length > 0) throw new Erreur(`transmission refusée :\n    ${erreurs.join('\n    ')}`);

  const parReference = new Map();
  for (const n of noeuds) {
    if (parReference.has(n.t.reference)) erreurs.push(`${n.t.reference} : deux transmissions`);
    parReference.set(n.t.reference, n);
  }
  const racines = noeuds.filter((n) => n.t.parent === null);
  if (racines.length !== 1) erreurs.push(`une seule racine attendue, ${racines.length} parmi les transmissions`);
  const cle = racines[0]?.t.reference;
  if (cle && !CLE.test(cle)) erreurs.push(`${cle} : clé de ticket inattendue`);
  for (const n of noeuds) {
    if (cle && n.t.racine !== cle) erreurs.push(`${n.t.reference} : appartient à l'arbre ${n.t.racine}, pas à ${cle}`);
    if (n.t.parent !== null && !parReference.has(n.t.parent)) erreurs.push(`${n.t.reference} : son parent ${n.t.parent} manque`);
    for (const e of n.t.enfants) if (!parReference.has(e)) erreurs.push(`${n.t.reference} : son sous-ticket ${e} manque`);
    for (const d of n.t.depend_de) if (!parReference.has(d)) erreurs.push(`${n.t.reference} : le ticket dont il dépend, ${d}, manque`);
  }
  if (erreurs.length > 0) throw new Erreur(`arbre incomplet ou incohérent :\n    ${erreurs.join('\n    ')}`);
  const ordre = [];
  const visiter = (n) => {
    ordre.push(n);
    for (const e of n.t.enfants) visiter(parReference.get(e));
  };
  visiter(racines[0]);
  if (ordre.length !== noeuds.length) throw new Erreur('arbre incohérent : des nœuds ne sont pas reliés à la racine');
  return { cle, noeuds: ordre };
}

/** Commande Gemini CLI d'un fichier de `.gemini/commands/` : `ticket/abcde-3620.toml` donne `/ticket:abcde-3620`. */
const commandeDe = (chemin) => `/${chemin.replace(/^\.gemini\/commands\//, '').replace(/\.toml$/, '').split('/').join(':')}`;

/** Fichiers que l'installation copie dans les dossiers de Gemini CLI : agents des feuilles, commandes des nœuds. */
function copiesHote(noeuds) {
  const copies = [];
  for (const n of noeuds) {
    for (const [rel, contenu] of n.fichiers) {
      const m = /^agents\/([a-z0-9][a-z0-9_-]*\.md)$/.exec(rel);
      const c = /^commandes\/([a-z0-9-]+\/[a-z0-9-]+\.toml)$/.exec(rel);
      if (m) copies.push({ type: 'agent', skill: n.nom, chemin: `.gemini/agents/${m[1]}`, contenu });
      else if (c) copies.push({ type: 'commande', skill: n.nom, chemin: `.gemini/commands/${c[1]}`, contenu });
    }
  }
  return copies;
}

// ---------------------------------------------------------------------------
// Relevés d'installation
// ---------------------------------------------------------------------------

const dossierReleve = (ws, cle) => join(ws, ...RELEVES, cle);

function lireReleve(ws, cle) {
  if (!CLE.test(cle)) return null;
  const texte = lireOuNull(join(dossierReleve(ws, cle), 'installation.json'));
  if (!texte) return null;
  const releve = JSON.parse(texte.toString('utf8'));
  return releve.format === FORMAT ? releve : null;
}

function lireReleves(ws) {
  const base = join(ws, ...RELEVES);
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => lireReleve(ws, d.name)).filter(Boolean)
    .sort((a, b) => a.cle.localeCompare(b.cle));
}

// ---------------------------------------------------------------------------
// tools/installer.mjs et Gemini CLI
// ---------------------------------------------------------------------------

function installateurDuDepot(args, ws) {
  const r = spawnSync(process.execPath, [INSTALLATEUR, ...args, '--workspace', ws], { encoding: 'utf8' });
  return { code: r.status, sortie: r.stdout ?? '', erreur: r.stderr ?? '' };
}

/** Lignes du compte rendu de tools/installer.mjs, sans ses conseils généraux. */
const compteRendu = (sortie) => {
  const lignes = sortie.replace(/\r\n/g, '\n').split('\n');
  const fin = lignes.indexOf('');
  return (fin === -1 ? lignes : lignes.slice(0, fin)).filter((l) => l.trim() !== '');
};

/**
 * Exécute Gemini CLI avec des arguments sans caractère spécial. Sous Windows, `gemini` est un script
 * `.cmd`, lancé par l'invite de commandes ; un fichier `.js` se lance par Node, partout.
 */
function executerGemini(executable, args, cwd, stdio = 'pipe') {
  for (const a of args) if (CARACTERES_INTERDITS.test(a)) throw new Erreur(`argument refusé pour Gemini CLI : ${a}`);
  const options = { cwd, stdio, encoding: 'utf8', env: process.env };
  if (/\.(c|m)?js$/i.test(executable)) return spawnSync(process.execPath, [executable, ...args], options);
  if (process.platform === 'win32') {
    if (CARACTERES_INTERDITS.test(executable)) throw new Erreur(`chemin refusé pour Gemini CLI : ${executable}`);
    return spawnSync([`"${executable}"`, ...args.map((a) => (/\s/.test(a) || a === '' ? `"${a}"` : a))].join(' '), { ...options, shell: true });
  }
  return spawnSync(executable, args, options);
}

function geminiDisponible(executable) {
  try {
    const r = executerGemini(executable, ['--version'], process.cwd());
    return r.status === 0 ? (r.stdout ?? '').trim().split('\n').at(-1) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Git : masquer agents, commandes et relevés à git status
// ---------------------------------------------------------------------------

function git(dossier, ...args) {
  try {
    return execFileSync('git', ['-C', dossier, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

function depotGit(ws) {
  const sortie = git(ws, 'rev-parse', '--show-toplevel', '--git-path', 'info/exclude');
  if (!sortie) return null;
  const [racine, exclusion] = sortie.split('\n');
  if (!racine || !exclusion) return null;
  const rel = enPosix(relative(vraiChemin(racine), vraiChemin(ws)));
  return { racine, prefixe: rel ? `${rel}/` : '', exclusion: resolve(ws, exclusion) };
}

/** Le texte sans notre bloc, et les lignes de ce bloc. Le bloc de tools/installer.mjs reste dans le texte. */
function separerBloc(texte) {
  const dedans = [];
  const dehors = [];
  let dans = false;
  for (const ligne of texte.replace(/\r\n/g, '\n').split('\n')) {
    if (!dans && (ligne === BLOC || BLOCS_ANCIENS.includes(ligne))) dans = true;
    else if (dans && ligne === FIN_BLOC) dans = false;
    else (dans ? dedans : dehors).push(ligne);
  }
  return { lignes: dedans.filter((l) => l.trim() !== ''), reste: dehors.join('\n').replace(/\n+$/, '') };
}

const avecBloc = (reste, lignes) => (lignes.length === 0 ? (reste ? `${reste}\n` : '') : `${reste ? `${reste}\n\n` : ''}${BLOC}\n${lignes.join('\n')}\n${FIN_BLOC}\n`);

/** Le même workspace dans les autres worktrees du dépôt, qui partagent l'exclusion locale. */
function autresWorkspaces(ws, depot) {
  const ici = vraiChemin(depot.racine);
  return (git(ws, 'worktree', 'list', '--porcelain') ?? '')
    .split('\n')
    .filter((l) => l.startsWith('worktree '))
    .map((l) => l.slice('worktree '.length))
    .filter((chemin) => existsSync(chemin) && vraiChemin(chemin) !== ici)
    .map((chemin) => join(chemin, ...depot.prefixe.split('/').filter(Boolean)));
}

/**
 * Ajoute ou retire des chemins du workspace dans notre bloc de l'exclusion locale. Un chemin suivi par
 * Git n'est pas exclu ; un chemin encore présent dans un autre worktree reste exclu.
 */
function masquer(ws, ajouter, retirer, essai) {
  const depot = depotGit(ws);
  if (!depot) return null;
  const texte = existsSync(depot.exclusion) ? readFileSync(depot.exclusion, 'utf8') : '';
  const { lignes, reste } = separerBloc(texte);
  const motifs = new Set(lignes);
  const suivis = [];
  for (const c of ajouter) {
    if ((git(ws, 'ls-files', '--', c) ?? '').trim() !== '') suivis.push(c);
    else motifs.add(`/${depot.prefixe}${c}`);
  }
  const ailleurs = autresWorkspaces(ws, depot);
  for (const c of retirer) if (!ailleurs.some((w) => existsSync(fichierDans(w, c)))) motifs.delete(`/${depot.prefixe}${c}`);
  const nouveau = avecBloc(reste, [...motifs].sort());
  if (!essai && nouveau !== texte.replace(/\r\n/g, '\n')) {
    mkdirSync(dirname(depot.exclusion), { recursive: true });
    writeFileSync(depot.exclusion, nouveau);
  }
  return { fichier: enPosix(relative(ws, depot.exclusion)), suivis };
}

// ---------------------------------------------------------------------------
// Commandes
// ---------------------------------------------------------------------------

/** Installe un arbre. Renvoie les lignes du compte rendu. */
export function installer(cibles, o) {
  const { cle, noeuds } = lireArbre(cibles);
  const ws = o.workspace;
  const copies = copiesHote(noeuds);
  const ancien = lireReleve(ws, cle);
  const anciennesCopies = ancien ? [...ancien.agents, ...ancien.commandes] : [];
  const conflits = [];
  for (const c of copies) {
    const actuel = lireOuNull(fichierDans(ws, c.chemin));
    if (!actuel || sha256(actuel) === sha256(c.contenu)) continue;
    const connu = anciennesCopies.find((x) => x.chemin === c.chemin);
    if (connu && sha256(actuel) === connu.sha256) continue;
    conflits.push(`${c.chemin} : ${connu ? 'modifié depuis l\'installation' : 'existe, sans avoir été installé par cet outil'}`);
  }
  const nouveaux = new Set(copies.map((c) => c.chemin));
  const perimes = anciennesCopies.filter((x) => !nouveaux.has(x.chemin));
  for (const p of perimes) {
    const actuel = lireOuNull(fichierDans(ws, p.chemin));
    if (actuel && sha256(actuel) !== p.sha256) conflits.push(`${p.chemin} : modifié depuis l'installation`);
  }
  if (conflits.length > 0 && !o.forcer) throw new Erreur(`${pluriel(conflits.length, 'fichier')} à remplacer, --forcer pour le faire :\n    ${conflits.join('\n    ')}`);

  const forcer = o.forcer ? ['--forcer'] : [];
  const drapeaux = [...(o.visible ? ['--visible'] : []), ...forcer];
  const chemins = noeuds.map((n) => n.chemin);
  const skillsPerimes = ancien ? ancien.noeuds.map((n) => n.nom).filter((nom) => !noeuds.some((n) => n.nom === nom)) : [];
  for (const args of [[...chemins, '--essai', ...drapeaux], ...(skillsPerimes.length > 0 ? [['--retirer', ...skillsPerimes, '--essai', ...forcer]] : [])]) {
    const essai = installateurDuDepot(args, ws);
    if (essai.code !== 0) throw new Erreur(`tools/installer.mjs refuse :\n    ${essai.erreur.trim().split('\n').join('\n    ')}`);
  }
  const resume = `${pluriel(noeuds.length, 'skill')}, ${pluriel(copies.filter((c) => c.type === 'agent').length, 'agent')}, ${pluriel(copies.filter((c) => c.type === 'commande').length, 'commande')}`;
  if (o.essai) return [`essai : l'arbre ${cle} serait installé (${resume}), transmissions vérifiées`];

  const rapport = [];
  const reel = installateurDuDepot([...chemins, ...drapeaux], ws);
  if (reel.code !== 0) throw new Erreur(`tools/installer.mjs a échoué :\n    ${reel.erreur.trim().split('\n').join('\n    ')}`);
  rapport.push(...compteRendu(reel.sortie));
  if (skillsPerimes.length > 0) rapport.push(...compteRendu(installateurDuDepot(['--retirer', ...skillsPerimes, ...forcer], ws).sortie));
  for (const c of copies) {
    const cible = fichierDans(ws, c.chemin);
    mkdirSync(dirname(cible), { recursive: true });
    writeFileSync(cible, c.contenu);
  }
  for (const p of perimes) rmSync(fichierDans(ws, p.chemin), { force: true });

  const dossier = dossierReleve(ws, cle);
  rmSync(join(dossier, 'transmissions'), { recursive: true, force: true });
  mkdirSync(join(dossier, 'transmissions'), { recursive: true });
  for (const n of noeuds) writeFileSync(join(dossier, 'transmissions', `${n.nom}-${n.version}.md`), n.texte);
  const releve = {
    format: FORMAT,
    cle,
    masque: !o.visible && depotGit(ws) !== null,
    noeuds: noeuds.map((n) => ({
      reference: n.t.reference,
      nom: n.nom,
      version: n.version,
      nature: n.t.nature,
      parent: n.t.parent,
      enfants: n.t.enfants,
      depend_de: n.t.depend_de,
      dossier: n.t.dossier,
      transmission: `transmissions/${n.nom}-${n.version}.md`,
      sha256: sha256(n.texte),
    })),
    agents: copies.filter((c) => c.type === 'agent').map((c) => ({ chemin: c.chemin, skill: c.skill, sha256: sha256(c.contenu) })),
    commandes: copies.filter((c) => c.type === 'commande').map((c) => ({ chemin: c.chemin, commande: commandeDe(c.chemin), skill: c.skill, sha256: sha256(c.contenu) })),
  };
  writeFileSync(join(dossier, 'installation.json'), `${JSON.stringify(releve, null, 2)}\n`);
  rapport.push(`arbre ${cle} installé : ${resume} ; agents dans .gemini/agents/, commandes dans .gemini/commands/ticket/, relevé dans .gemini/skill-ticket/${cle}/`);

  const propres = [...copies.map((c) => c.chemin)];
  const m = o.visible
    ? masquer(ws, [], [...propres, ...perimes.map((p) => p.chemin)], false)
    : masquer(ws, [...propres, '.gemini/skill-ticket/'], perimes.map((p) => p.chemin), false);
  if (m) {
    rapport.push(o.visible ? '  agents, commandes et relevé visibles dans git status' : `  agents, commandes et relevé masqués à Git (${m.fichier})`);
    if (m.suivis.length > 0) rapport.push(`  suivis par Git, laissés tels quels : ${m.suivis.join(', ')}`);
  }
  const absolu = fileURLToPath(import.meta.url);
  const relatif = relative(process.cwd(), absolu);
  const outil = relatif.split(sep).filter((s) => s === '..').length <= 2 ? relatif : absolu;
  const racine = releve.commandes.find((c) => c.skill === noeuds[0].nom)?.commande;
  rapport.push(
    '',
    'Ensuite, dans ce dossier :',
    `  node ${outil} verifier ${cle} : skills découverts et agents chargés par Gemini CLI ;`,
    `  node ${outil} lancer ${cle} : la racine présente l'arbre et attend sa ratification (ou ${racine} dans Gemini CLI) ;`,
    '  une session par nœud : chaque skill indique la commande du nœud suivant.',
    '  Dans une session déjà ouverte : /skills reload, /agents reload et /commands reload.',
    '  Si la confiance des dossiers est activée dans Gemini CLI, ce dossier doit être de confiance : sinon, Gemini CLI ignore les skills et les agents du workspace.',
  );
  return rapport;
}

/** Champ d'observation d'un arbre installé, avec le rattachement de son skill racine s'il en porte un. */
function champDe(ws, releve) {
  const racine = releve.noeuds.find((n) => n.parent === null);
  const dossier = fichierDans(ws, racine.dossier);
  const enregistrements = lireChamp(dossier).enregistrements;
  const brut = lireOuNull(join(ws, '.gemini', 'skills', racine.nom, 'outils', 'rattachement.json'));
  const rattachement = brut ? JSON.parse(brut.toString('utf8')) : null;
  return { racine, dossier, enregistrements, rattachement, contexte: rattachement ? contexteDe(rattachement) : null };
}

/** État d'un nœud : remise, ratification (champ, ou retours.md avant le lot 5), analyse, dépendances. */
function etatsDesNoeuds(ws, releve) {
  const parReference = new Map(releve.noeuds.map((n) => [n.reference, n]));
  const fichier = (n, f) => {
    const contenu = lireOuNull(join(fichierDans(ws, n.dossier), f));
    return contenu === null ? null : contenu.toString('utf8').replace(/\r\n/g, '\n');
  };
  const decisions = ratifications(champDe(ws, releve).enregistrements);
  const ratifie = (n, objet) => (decisions.has(objet)
    ? decisions.get(objet).decision === 'ratifié'
    : new RegExp(`^- \\d{4}-\\d{2}-\\d{2}, .+ : ${echapper(objet)} ratifié\\s*$`, 'm').test(fichier(n, 'retours.md') ?? ''));
  const racine = releve.noeuds.find((n) => n.parent === null);
  const arbreRatifie = racine.enfants.length === 0 || ratifie(racine, `arbre ${racine.reference}`);
  const clos = (n) => fichier(n, 'remise.md') !== null;
  // Lot 4 : un skill racine qui porte le module `documents` rédige d'abord les documents de la clé.
  const documentsARediger = existsSync(join(ws, '.gemini', 'skills', racine.nom, 'modules', 'documents', 'SKILL.md')) && fichier(racine, 'us.md') === null;
  return releve.noeuds.map((n) => {
    const enfantsClos = n.enfants.every((e) => clos(parReference.get(e)));
    let etat;
    if (clos(n)) etat = 'clos';
    else if (n.parent === null && documentsARediger) etat = 'documents à rédiger';
    else if (n.enfants.length > 0) {
      if (n.parent === null && !arbreRatifie) etat = 'arbre à ratifier';
      else etat = enfantsClos ? 'prêt à clore' : 'en cours';
    } else if (!arbreRatifie) etat = 'en attente de la ratification de l\'arbre';
    else {
      const attendus = n.depend_de.filter((d) => !clos(parReference.get(d)));
      if (attendus.length > 0) etat = `en attente de ${attendus.join(', ')}`;
      else if (ratifie(n, n.reference)) etat = 'ratifié, en transformation';
      else if (fichier(n, 'analyse.md') !== null) etat = 'analysé, à ratifier';
      else etat = 'prêt';
    }
    return { noeud: n, etat };
  });
}

export function liste(o) {
  const releves = lireReleves(o.workspace);
  if (releves.length === 0) return ['aucun arbre de skills de ticket installé dans ce workspace'];
  const lignes = [];
  for (const r of releves) {
    lignes.push(`Arbre ${r.cle} : ${pluriel(r.noeuds.length, 'skill')}, ${pluriel(r.agents.length, 'agent')}, ${pluriel(r.commandes.length, 'commande')}${r.masque ? ', masqués à Git' : ''}`);
    const etats = etatsDesNoeuds(o.workspace, r);
    const commande = (n) => r.commandes.find((c) => c.skill === n.nom)?.commande ?? '—';
    const largeurs = [Math.max(...r.noeuds.map((n) => n.reference.length)), Math.max(...r.noeuds.map((n) => n.nature.length)), Math.max(...r.noeuds.map((n) => commande(n).length))];
    for (const { noeud, etat } of etats) lignes.push(`  ${noeud.reference.padEnd(largeurs[0])}  ${noeud.nature.padEnd(largeurs[1])}  ${commande(noeud).padEnd(largeurs[2])}  ${etat}`);
    const { racine, dossier, enregistrements, rattachement, contexte } = champDe(o.workspace, r);
    const cheminDemande = racine.dossier.replace(/\/+$/, '');
    if (enregistrements.length > 0 && contexte) {
      const e = etatChamp(enregistrements, contexte);
      const compte = (etat) => e.criteres.filter((c) => c.etat === etat).length;
      const ecarts = verifierChamp(dossier, contexte);
      const altere = ecarts.length > 0 ? ` ; altéré, ${pluriel(ecarts.length, 'écart')} : node .gemini/skills/${racine.nom}/outils/champ.mjs verifier ${racine.dossier.replace(/\/+$/, '')}` : '';
      lignes.push(`Champ : ${pluriel(e.enregistrements, 'enregistrement')} ; critères : ${pluriel(compte('prouvé'), 'prouvé')}, ${compte('en écart')} en écart, ${pluriel(compte('menacé'), 'menacé')} ; ${pluriel(e.desaccords.length, 'désaccord')} ; ${pluriel(e.attentes.length, 'observation attendue', 'observations attendues')}${altere}`);
    }
    // Vue augmentée (lot 6) : son chemin et sa fraîcheur, dès qu'un champ ou une vue existe.
    const vueEcrite = FICHIERS_VUE.some((f) => existsSync(join(dossier, f)));
    if (contexte && existsSync(join(o.workspace, '.gemini', 'skills', racine.nom, 'outils', 'vue.mjs')) && (enregistrements.length > 0 || vueEcrite)) {
      const v = etatVue(dossier, { rattachement });
      const generer = `node .gemini/skills/${racine.nom}/outils/vue.mjs generer ${cheminDemande}`;
      const suite = {
        'à jour': `à jour, tirée du champ au n° ${v.champ}`,
        absente: `absente : ${generer}`,
        périmée: `périmée, tirée du champ au n° ${v.depuis}, champ au n° ${v.champ} : ${generer}`,
        modifiée: `modifiée à la main : ${generer}`,
      }[v.etat];
      if (suite) lignes.push(`Vue : ${cheminDemande}/vue.html, ${suite}`);
    }
  }
  return lignes;
}

/** Contrôle les fichiers installés d'un arbre, puis leur découverte par Gemini CLI. */
export function verifier(cle, o) {
  const ws = o.workspace;
  const releves = cle ? [lireReleve(ws, cle)].filter(Boolean) : lireReleves(ws);
  if (releves.length === 0) throw new Erreur(cle ? `${cle} : aucun arbre installé sous cette clé` : 'aucun arbre de skills de ticket installé dans ce workspace');
  const erreurs = [];
  const notes = [];
  for (const r of releves) {
    for (const n of r.noeuds) {
      const dossier = join(ws, '.gemini', 'skills', n.nom);
      const table = lireOuNull(join(dossier, 'integrite.sha256'));
      if (!table) {
        erreurs.push(`${n.nom} : skill absent de .gemini/skills/`);
        continue;
      }
      for (const ligne of table.toString('utf8').replace(/\r\n/g, '\n').split('\n')) {
        const m = /^([0-9a-f]{64}) {2}(.+)$/.exec(ligne);
        if (!m) continue;
        const contenu = lireOuNull(fichierDans(dossier, m[2]));
        if (!contenu) erreurs.push(`${n.nom}/${m[2]} : absent`);
        else if (sha256(contenu) !== m[1]) erreurs.push(`${n.nom}/${m[2]} : modifié depuis l'installation`);
      }
    }
    for (const x of [...r.agents, ...r.commandes]) {
      const contenu = lireOuNull(fichierDans(ws, x.chemin));
      if (!contenu) erreurs.push(`${x.chemin} : absent`);
      else if (sha256(contenu) !== x.sha256) erreurs.push(`${x.chemin} : modifié depuis l'installation`);
    }
    notes.push(`arbre ${r.cle} : ${pluriel(r.noeuds.length, 'skill')}, ${pluriel(r.agents.length, 'agent')} et ${pluriel(r.commandes.length, 'commande')} installés et intacts`);
  }

  const executable = o.gemini || process.env.SKILL_TICKET_GEMINI || 'gemini';
  const version = geminiDisponible(executable);
  if (!version) {
    if (o.gemini || process.env.SKILL_TICKET_GEMINI) erreurs.push(`Gemini CLI introuvable : ${executable}`);
    else notes.push('Gemini CLI introuvable : découverte des skills et des agents non vérifiée (--gemini <exécutable>)');
  } else {
    const r = executerGemini(executable, ['skills', 'list'], ws);
    const texte = `${r.stdout ?? ''}\n${r.stderr ?? ''}`.replace(/\r\n/g, '\n');
    if (r.status !== 0) erreurs.push(`gemini skills list a échoué : ${texte.trim().split('\n').at(-1)}`);
    else if (/untrusted folder|folder is not trusted/i.test(texte)) erreurs.push('dossier non fiable pour Gemini CLI : il ignore les skills et les agents du workspace (le marquer de confiance, /permissions trust)');
    else {
      for (const rel of releves) {
        for (const n of rel.noeuds) {
          if (!new RegExp(`^${echapper(n.nom)} \\[Enabled\\]`, 'm').test(texte)) erreurs.push(`${n.nom} : non découvert, ou désactivé, par Gemini CLI`);
        }
        for (const a of rel.agents) {
          const fichierAgent = basename(a.chemin);
          for (const ligne of texte.split('\n').filter((l) => /Agent loading error/i.test(l) && l.includes(fichierAgent))) erreurs.push(`${a.chemin} : refusé par Gemini CLI, ${ligne.trim()}`);
        }
      }
      if (erreurs.length === 0) notes.push(`Gemini CLI ${version} : skills découverts et activés, agents chargés sans erreur`);
    }
  }
  if (erreurs.length > 0) throw new Erreur(`${pluriel(erreurs.length, 'écart')} :\n    ${erreurs.join('\n    ')}`);
  return notes;
}

/** Ouvre Gemini CLI dans le workspace sur la phrase qui active le skill d'un nœud. Renvoie le code de sortie. */
export function lancer(reference, o, sortie = console.log) {
  const trouve = lireReleves(o.workspace).flatMap((r) => r.noeuds).find((n) => n.reference === reference || n.nom === reference);
  if (!trouve) throw new Erreur(`${reference} : aucun skill de ticket installé pour cette référence (voir : installer-arbre.mjs liste)`);
  if (!existsSync(join(o.workspace, '.gemini', 'skills', trouve.nom, 'integrite.sha256'))) throw new Erreur(`${trouve.nom} : absent de .gemini/skills/, à réinstaller`);
  const phrase = phraseActivation(trouve.nom);
  const executable = o.gemini || process.env.SKILL_TICKET_GEMINI || 'gemini';
  if (o.essai) {
    sortie(`essai : ${executable} -i "${phrase}"`);
    return 0;
  }
  sortie(`Gemini CLI, session du skill ${trouve.nom} (${trouve.reference}) :`);
  const r = executerGemini(executable, ['-i', phrase], o.workspace, 'inherit');
  if (r.error) throw new Erreur(`Gemini CLI introuvable (${executable}) : --gemini <exécutable>, ou la variable SKILL_TICKET_GEMINI`);
  return r.status ?? 1;
}

/** Archive les transmissions dans le dossier du ticket, puis retire tout ce que l'installation a écrit. */
export function retirer(cle, o) {
  const ws = o.workspace;
  const releve = lireReleve(ws, cle);
  if (!releve) return [`${cle} : aucun arbre installé sous cette clé, rien à retirer`];
  const dossier = dossierReleve(ws, cle);
  const archive = o.sansArchive ? null : join(ws, 'docs', 'demandes', cle, 'skills');
  const conflits = [];
  const transmissions = releve.noeuds.map((n) => ({ source: join(dossier, n.transmission), cible: archive && join(archive, basename(n.transmission)), empreinte: n.sha256 }));
  for (const t of transmissions) {
    const contenu = lireOuNull(t.source);
    if (!contenu) conflits.push(`${enPosix(relative(ws, t.source))} : copie de la transmission absente du relevé`);
    else if (sha256(contenu) !== t.empreinte) conflits.push(`${enPosix(relative(ws, t.source))} : copie de la transmission modifiée`);
    const archivee = t.cible && lireOuNull(t.cible);
    if (archivee && sha256(archivee) !== t.empreinte) conflits.push(`${enPosix(relative(ws, t.cible))} : existe, avec un autre contenu`);
  }
  for (const x of [...releve.agents, ...releve.commandes]) {
    const contenu = lireOuNull(fichierDans(ws, x.chemin));
    if (contenu && sha256(contenu) !== x.sha256) conflits.push(`${x.chemin} : modifié depuis l'installation`);
  }
  if (conflits.length > 0 && !o.forcer) throw new Erreur(`${pluriel(conflits.length, 'écart')}, --forcer pour retirer malgré tout :\n    ${conflits.join('\n    ')}`);
  const forcer = o.forcer ? ['--forcer'] : [];
  const noms = releve.noeuds.map((n) => n.nom);
  const essai = installateurDuDepot(['--retirer', ...noms, '--essai', ...forcer], ws);
  if (essai.code !== 0) throw new Erreur(`tools/installer.mjs refuse :\n    ${essai.erreur.trim().split('\n').join('\n    ')}`);
  if (o.essai) return [`essai : l'arbre ${cle} serait retiré${archive ? `, ses transmissions archivées dans docs/demandes/${cle}/skills/` : ''}`];

  const rapport = [];
  if (archive) {
    mkdirSync(archive, { recursive: true });
    for (const t of transmissions) {
      const contenu = lireOuNull(t.source);
      if (contenu) writeFileSync(t.cible, contenu);
    }
    rapport.push(`${pluriel(transmissions.length, 'transmission')} archivée${transmissions.length > 1 ? 's' : ''} dans docs/demandes/${cle}/skills/, à versionner avec le ticket`);
  }
  const reel = installateurDuDepot(['--retirer', ...noms, ...forcer], ws);
  if (reel.code !== 0) throw new Erreur(`tools/installer.mjs a échoué :\n    ${reel.erreur.trim().split('\n').join('\n    ')}`);
  rapport.push(...compteRendu(reel.sortie));
  const chemins = [...releve.agents, ...releve.commandes].map((x) => x.chemin);
  for (const c of chemins) rmSync(fichierDans(ws, c), { force: true });
  for (const d of ['.gemini/commands/ticket', '.gemini/commands', '.gemini/agents']) {
    const chemin = fichierDans(ws, d);
    if (existsSync(chemin) && readdirSync(chemin).length === 0) rmSync(chemin, { recursive: true, force: true });
  }
  rmSync(dossier, { recursive: true, force: true });
  const restants = lireReleves(ws).length;
  if (restants === 0) rmSync(join(ws, ...RELEVES), { recursive: true, force: true });
  masquer(ws, [], [...chemins, ...(restants === 0 ? ['.gemini/skill-ticket/'] : [])], false);
  rapport.push(`arbre ${cle} retiré : ${pluriel(noms.length, 'skill')}, ${pluriel(releve.agents.length, 'agent')}, ${pluriel(releve.commandes.length, 'commande')} et le relevé`);
  return rapport;
}

// ---------------------------------------------------------------------------
// Ligne de commande
// ---------------------------------------------------------------------------

const AIDE = `Installe un arbre de skills de ticket dans Gemini CLI (generateur-skill-ticket).

  installer-arbre.mjs installer <dossier | transmission.md>...   vérifier, puis installer skills, agents et commandes
  installer-arbre.mjs liste                                      arbres installés et état de chaque nœud
  installer-arbre.mjs verifier [<clé>]                           fichiers intacts ; avec Gemini CLI, skills découverts et agents chargés
  installer-arbre.mjs lancer <référence>                         ouvrir Gemini CLI sur le skill d'un nœud, dans une nouvelle session
  installer-arbre.mjs retirer <clé>                              archiver les transmissions, puis tout retirer

Options :
  --workspace <dossier>   racine du workspace, là où Gemini CLI est lancé (défaut : dossier courant)
  --gemini <exécutable>   Gemini CLI (défaut : la variable SKILL_TICKET_GEMINI, sinon gemini)
  --visible               ne pas masquer à Git
  --forcer                remplacer ou retirer malgré des fichiers changés
  --sans-archive          retirer sans archiver les transmissions dans docs/demandes/<clé>/skills/
  --essai                 afficher ce qui serait fait, sans rien écrire ni lancer`;

const DRAPEAUX = { '--visible': 'visible', '--forcer': 'forcer', '--essai': 'essai', '--sans-archive': 'sansArchive' };
const VALEURS = { '--workspace': 'workspace', '--gemini': 'gemini' };
const ATTENDUS = { installer: [1, Infinity], liste: [0, 0], verifier: [0, 1], lancer: [1, 1], retirer: [1, 1] };

/** Ligne de commande. Renvoie le code de sortie ; écrit par `sortie` et `erreur`. */
export function principal(argv, sortie = console.log, erreur = console.error) {
  const [commande, ...reste] = argv;
  const o = { positions: [], workspace: process.cwd() };
  for (let k = 0; k < reste.length; k++) {
    const a = reste[k];
    if (DRAPEAUX[a]) o[DRAPEAUX[a]] = true;
    else if (VALEURS[a] && reste[k + 1] !== undefined) o[VALEURS[a]] = reste[++k];
    else if (a.startsWith('--')) {
      erreur(`option inconnue ou sans valeur : ${a}\n\n${AIDE}`);
      return 2;
    } else o.positions.push(a);
  }
  const attendus = ATTENDUS[commande];
  if (!attendus || o.positions.length < attendus[0] || o.positions.length > attendus[1]) {
    erreur(AIDE);
    return 2;
  }
  o.workspace = resolve(o.workspace);
  if (!existsSync(o.workspace) || !statSync(o.workspace).isDirectory()) {
    erreur(`workspace introuvable : ${o.workspace}`);
    return 2;
  }
  try {
    if (commande === 'lancer') return lancer(o.positions[0], o, sortie);
    const lignes = {
      installer: () => installer(o.positions, o),
      liste: () => liste(o),
      verifier: () => verifier(o.positions[0], o),
      retirer: () => retirer(o.positions[0], o),
    }[commande]();
    for (const l of lignes) sortie(l);
    return 0;
  } catch (e) {
    if (!(e instanceof Erreur)) throw e;
    erreur(`ÉCHEC  ${e.message}`);
    return 1;
  }
}

const estPrincipal = process.argv[1] && fileURLToPath(import.meta.url).toLowerCase() === resolve(process.argv[1]).toLowerCase();
if (estPrincipal) process.exitCode = principal(process.argv.slice(2));
