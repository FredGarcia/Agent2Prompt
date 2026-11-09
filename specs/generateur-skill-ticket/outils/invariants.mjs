#!/usr/bin/env node
// Comparaison du fichier d'invariants du projet à l'état sur lequel un skill de ticket a été produit
// (generateur-skill-ticket, D4, depuis 1.0.1). Le skill racine en livre une copie, outils/invariants.mjs :
// chaque nœud compare ainsi la copie du projet à la sienne par empreinte, sans lire la copie du skill ; la
// copie du projet fait foi, et seule elle se lit.
//
// Usage, depuis la racine du projet :
//   node .gemini/skills/ticket-<clé>/outils/invariants.mjs comparer <skill> [--projet <chemin>] [--skills <dossier>]
//
// <skill> : le nom du skill du nœud. Sa copie est <skills>/<skill>/projet/meso-contrats.md, dont son
// manifeste déclare l'empreinte ; la copie du projet est docs/c7e/meso-contrats.md par défaut. Sortie :
// copies identiques ; ou copie du projet absente, avec la copie qui en tient lieu ; ou copie du skill
// altérée ; ou copies différentes, avec les sections qui diffèrent et leurs lignes ; puis les valeurs
// ADAPTER restées dans la copie du projet. Code 0 : copies identiques ; 1 : tout autre cas ; 2 : usage
// incorrect. Node 20 ou plus récent, modules natifs, fins de ligne CRLF admises.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const COPIE_SKILL = 'projet/meso-contrats.md';
export const COPIE_PROJET = 'docs/c7e/meso-contrats.md';
const USAGE = 'Usage : invariants.mjs comparer <skill> [--projet <chemin>] [--skills <dossier>]';
const MAX_LIGNES = 40;

const normaliser = (texte) => texte.replace(/\r\n/g, '\n');
export const empreinte = (texte) => createHash('sha256').update(normaliser(texte), 'utf8').digest('hex');

/** Sections d'un fichier d'invariants, par titre de niveau 2 ; ce qui précède le premier titre est l'en-tête. */
export function sections(texte) {
  const res = [];
  let courante = { titre: 'en-tête', lignes: [] };
  for (const ligne of normaliser(texte).split('\n')) {
    if (/^## /.test(ligne)) {
      res.push(courante);
      courante = { titre: ligne.slice(3).trim(), lignes: [] };
    } else {
      courante.lignes.push(ligne);
    }
  }
  res.push(courante);
  return res.filter((s) => s.titre !== 'en-tête' || s.lignes.some((l) => l.trim() !== ''));
}

/** Différences entre deux fichiers d'invariants, section par section : ajoutée, retirée, ou modifiée avec ses lignes. */
export function differences(projet, skill) {
  const avant = new Map(sections(skill).map((s) => [s.titre, s.lignes]));
  const apres = new Map(sections(projet).map((s) => [s.titre, s.lignes]));
  const res = [];
  for (const [titre, lignes] of apres) {
    if (!avant.has(titre)) res.push({ titre, nature: 'ajoutée', plus: lignes.filter((l) => l.trim() !== ''), moins: [] });
    else if (avant.get(titre).join('\n') !== lignes.join('\n')) {
      const anciennes = new Set(avant.get(titre));
      const nouvelles = new Set(lignes);
      res.push({ titre, nature: 'modifiée', plus: lignes.filter((l) => l.trim() !== '' && !anciennes.has(l)), moins: avant.get(titre).filter((l) => l.trim() !== '' && !nouvelles.has(l)) });
    }
  }
  for (const [titre, lignes] of avant) if (!apres.has(titre)) res.push({ titre, nature: 'retirée', plus: [], moins: lignes.filter((l) => l.trim() !== '') });
  return res;
}

/** Sections de la copie du projet où restent des valeurs ADAPTER, à signaler au développeur (D8.INV-1). */
export function adapter(texte) {
  return sections(texte).filter((s) => s.lignes.some((l) => l.includes('ADAPTER')) || s.titre.includes('ADAPTER')).map((s) => s.titre);
}

/**
 * Compare la copie du projet à celle du skill. Résultat : { code, lignes } ; code 0 si les deux copies sont
 * identiques, 1 sinon.
 */
export function comparer({ skill, projet = COPIE_PROJET, skills = join('.gemini', 'skills') }) {
  const dossier = join(skills, skill);
  const cheminSkill = join(dossier, ...COPIE_SKILL.split('/'));
  const cheminManifeste = join(dossier, 'manifest.json');
  if (!existsSync(cheminManifeste) || !existsSync(cheminSkill)) {
    return { code: 1, lignes: [`skill ${skill} introuvable dans ${skills} : ni ${cheminManifeste} ni ${cheminSkill} à lire`] };
  }
  const manifeste = JSON.parse(readFileSync(cheminManifeste, 'utf8'));
  const declaree = (manifeste.ticket?.herites ?? []).find((h) => h.path === COPIE_SKILL)?.sha256;
  const copieSkill = readFileSync(cheminSkill, 'utf8');
  if (!declaree || empreinte(copieSkill) !== declaree) {
    return { code: 1, lignes: [`copie du skill altérée : ${cheminSkill} n'a plus l'empreinte que déclare le manifeste de ${skill} ; vérifie le skill (sha256sum -c integrite.sha256) avant tout le reste`] };
  }
  if (!existsSync(projet)) {
    return { code: 1, lignes: [`copie du projet absente : ${projet} ; signale-le au développeur, et lis à sa place ${cheminSkill}, l'état sur lequel ${skill} a été produit`] };
  }
  const copieProjet = readFileSync(projet, 'utf8');
  const lignes = [];
  let code = 0;
  if (empreinte(copieProjet) === declaree) {
    lignes.push(`invariants du projet identiques à ceux sur lesquels ${skill} a été produit (sha256 ${declaree.slice(0, 12)}) : lis ${projet}, qui fait foi`);
  } else {
    code = 1;
    const ecarts = differences(copieProjet, copieSkill);
    lignes.push(`invariants du projet différents de ceux sur lesquels ${skill} a été produit : ${projet} fait foi ; ${ecarts.length} section${ecarts.length > 1 ? 's' : ''} diffère${ecarts.length > 1 ? 'nt' : ''}, à dire au développeur avant tout le reste`);
    for (const e of ecarts) {
      lignes.push(`  § ${e.titre} : ${e.nature}`);
      const detail = [...e.plus.map((l) => `    + ${l}`), ...e.moins.map((l) => `    - ${l}`)];
      lignes.push(...detail.slice(0, MAX_LIGNES));
      if (detail.length > MAX_LIGNES) lignes.push(`    … et ${detail.length - MAX_LIGNES} autres lignes`);
    }
  }
  const restes = adapter(copieProjet);
  if (restes.length > 0) lignes.push(`valeurs ADAPTER restées dans ${projet}, à signaler, jamais devinées : ${restes.map((t) => `§ ${t}`).join(' ; ')}`);
  return { code, lignes };
}

/** Ligne de commande. Renvoie le code de sortie ; écrit par `sortie` et `erreur`. */
export function principal(argv, sortie = console.log, erreur = console.error) {
  const [commande, ...reste] = argv;
  const options = { positions: [] };
  for (let k = 0; k < reste.length; k++) {
    const a = reste[k];
    if (!a.startsWith('--')) options.positions.push(a);
    else if (['--projet', '--skills'].includes(a) && reste[k + 1] !== undefined) options[a.slice(2)] = reste[++k];
    else {
      erreur(`option inconnue ou sans valeur : ${a}\n${USAGE}`);
      return 2;
    }
  }
  if (commande !== 'comparer' || options.positions.length !== 1) {
    erreur(USAGE);
    return 2;
  }
  const { code, lignes } = comparer({ skill: options.positions[0], projet: options.projet, skills: options.skills });
  for (const l of lignes) (code === 0 ? sortie : erreur)(l);
  return code;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exitCode = principal(process.argv.slice(2));
