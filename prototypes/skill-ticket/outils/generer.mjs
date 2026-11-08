#!/usr/bin/env node
// Générateur de skills de ticket (prototype « skill de ticket », lot 2) : un skill par nœud de l'arbre,
// assemblé par la fabrique de la pile et le Monteur, et sa transmission tirée par tools/bundle.mjs.
//
// Usage, depuis la racine du dépôt :
//   node prototypes/skill-ticket/outils/generer.mjs generer <dossier-arbre> --sortie <dossier>
//        [--referentiel <chemin>] [--invariants-projet <chemin>] [--profondeur-max <n>] [--fabrique <nom>]
//   node prototypes/skill-ticket/outils/generer.mjs verifier <transmission.md | dossier>... [--invariants-projet <chemin>]
//
// `generer` vérifie l'arbre (lot 1), construit les skills, contrôle leur héritage, puis écrit chaque
// skill dans <sortie>/<nom>/ et sa transmission dans <sortie>/transmissions/. Rien n'est écrit au
// moindre écart. `verifier` relit des transmissions et contrôle leur intégrité et leur héritage contre
// les sources du dépôt. Code de sortie 1 au moindre écart, 2 pour un usage incorrect.

import { readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FABRIQUES } from './fabrique.mjs';
import { chargerProjet, generer, transmissionsDe, verifierTransmission } from './monteur.mjs';

const USAGE = [
  'Usage : generer.mjs generer <dossier-arbre> --sortie <dossier> [--referentiel <chemin>] [--invariants-projet <chemin>] [--profondeur-max <n>] [--fabrique <nom>]',
  '        generer.mjs verifier <transmission.md | dossier>... [--invariants-projet <chemin>]',
].join('\n');

const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;

function lireOptions(reste, permises) {
  const options = { positions: [] };
  for (let k = 0; k < reste.length; k++) {
    const a = reste[k];
    if (!a.startsWith('--')) options.positions.push(a);
    else if (permises.includes(a) && reste[k + 1] !== undefined) options[a.slice(2)] = reste[++k];
    else return { erreur: `option inconnue ou sans valeur : ${a}` };
  }
  return options;
}

/** Ligne de commande. Renvoie le code de sortie ; écrit par `sortie` et `erreur`. */
export function principal(argv, sortie = console.log, erreur = console.error) {
  const [commande, ...reste] = argv;
  if (commande === 'generer') {
    const o = lireOptions(reste, ['--sortie', '--referentiel', '--invariants-projet', '--profondeur-max', '--fabrique']);
    const profondeurMax = o['profondeur-max'] === undefined ? undefined : Number(o['profondeur-max']);
    if (o.erreur || o.positions.length !== 1 || !o.sortie || (profondeurMax !== undefined && !(profondeurMax >= 0)) || (o.fabrique && !FABRIQUES[o.fabrique])) {
      erreur(o.erreur ?? (o.fabrique && !FABRIQUES[o.fabrique] ? `fabrique inconnue : ${o.fabrique} (connues : ${Object.keys(FABRIQUES).join(', ')})` : USAGE));
      return 2;
    }
    const { erreurs, skills, sources } = generer({
      arbre: o.positions[0], sortie: o.sortie, referentiel: o.referentiel, invariantsProjet: o['invariants-projet'], profondeurMax, fabrique: o.fabrique,
    });
    if (erreurs.length > 0) {
      for (const e of erreurs) erreur(`ÉCHEC  ${e}`);
      erreur(`${pluriel(erreurs.length, 'écart')} : aucun skill écrit`);
      return 1;
    }
    for (const s of skills) {
      sortie(`ok  ${s.nom} ${s.version} : ${pluriel(s.fichiers.length, 'fichier')}, ${s.texte.length} caractères, aller-retour identique, héritage complet`);
    }
    const o2 = sources.orchestrateur;
    sortie(`${pluriel(skills.length, 'skill')} de ticket dans ${relative(process.cwd(), resolve(o.sortie)) || '.'} : orchestrateur-c7e ${o2.version} (${o2.invariants.length} invariants), socle ${sources.socle.version}, java ${sources.experts.java.version}, angular ${sources.experts.angular.version}, invariants du projet ${sources.projet.from}`);
    return 0;
  }
  if (commande === 'verifier') {
    const o = lireOptions(reste, ['--invariants-projet']);
    if (o.erreur || o.positions.length === 0) {
      erreur(o.erreur ?? USAGE);
      return 2;
    }
    const projet = o['invariants-projet'] ? chargerProjet(o['invariants-projet']) : undefined;
    let ecarts = 0;
    for (const chemin of transmissionsDe(o.positions)) {
      let verdict;
      try {
        verdict = verifierTransmission(readFileSync(chemin, 'utf8'), { projet });
      } catch (e) {
        verdict = { erreurs: [e.code === 'ENOENT' ? 'fichier introuvable' : e.message] };
      }
      if (verdict.erreurs.length > 0) {
        ecarts += verdict.erreurs.length;
        for (const e of verdict.erreurs) erreur(`ÉCHEC  ${chemin} : ${e}`);
      } else sortie(`ok  ${verdict.nom} ${verdict.version} : ${pluriel(verdict.fichiers, 'fichier')}, intégrité et héritage vérifiés`);
    }
    if (ecarts > 0) {
      erreur(`${pluriel(ecarts, 'écart')}`);
      return 1;
    }
    return 0;
  }
  erreur(USAGE);
  return 2;
}

const estPrincipal = process.argv[1] && fileURLToPath(import.meta.url).toLowerCase() === resolve(process.argv[1]).toLowerCase();
if (estPrincipal) process.exitCode = principal(process.argv.slice(2));
