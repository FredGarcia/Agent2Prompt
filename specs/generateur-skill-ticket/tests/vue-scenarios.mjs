// Vues augmentées d'essai de l'arbre ABCDE-3620 (prototype « skill de ticket », lot 6, critère P6) : le
// scénario d'essai du champ, rejoué jusqu'à un moment choisi dans un projet temporaire qui porte les
// documents de la clé, donne la vue de ce moment ; le même moment redonne la même vue, octet pour octet.
//
// node tests/vue-scenarios.mjs --ecrire réécrit les vues versionnées des exemples, après un changement
// voulu du rendu ; la recette les compare à celles qu'elle regénère.

import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { construireVue, contenusVue } from '../outils/vue.mjs';
import { CHAMPS, RATTACHEMENT, projetDe, rejouer } from './champ-scenarios.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
export const DOSSIER_ESSAI = join(projetDe(CHAMPS.essai), 'docs', 'demandes', CHAMPS.cle);
export const DOSSIER_RESOLUTION = join(projetDe(CHAMPS.resolution), 'docs', 'demandes', CHAMPS.cle);
export const DOSSIER_MOMENTS = join(projetDe(CHAMPS.essai), 'vues');

/**
 * Moments de l'essai : nombre de dépôts rejoués, et numéro du champ qu'ils donnent (le dépôt 20 fait
 * naître l'écart d'office n° 21).
 */
export const MOMENTS = [
  { nom: 'champ-n06', depots: 6, champ: 6, ce_qui_se_voit: 'deux corrections au motif requete-native : observation d\'ordre 2 attendue' },
  { nom: 'champ-n15', depots: 15, champ: 15, ce_qui_se_voit: 'écart sur ABCDE-3620-1.2:C3 : ABCDE-3620-1:C3 et CA03 menacés' },
  { nom: 'champ-n21', depots: 20, champ: 21, ce_qui_se_voit: 'verdicts contraires sur le canal des lignes : désaccord inscrit au registre' },
];

/** Projet temporaire qui porte les documents de la clé de l'essai, et le champ rejoué jusqu'au k-ième dépôt. */
export function projetAuMoment(k) {
  const projet = join(mkdtempSync(join(tmpdir(), 'vue-')), 'projet');
  const dossier = join(projet, 'docs', 'demandes', CHAMPS.cle);
  mkdirSync(dossier, { recursive: true });
  for (const f of ['us.md', `${CHAMPS.cle}.feature`]) cpSync(join(DOSSIER_ESSAI, f), join(dossier, f));
  if (k > 0) rejouer(CHAMPS.essai, projet, k);
  return { projet, dossier };
}

/** Vue de l'essai après k dépôts : { vue, contenus } ; le projet temporaire est supprimé. */
export function vueAuMoment(k) {
  const { projet, dossier } = projetAuMoment(k);
  try {
    const { erreurs, vue } = construireVue(dossier, { rattachement: RATTACHEMENT });
    if (erreurs) throw new Error(erreurs.join(' ; '));
    return { vue, contenus: contenusVue(vue) };
  } finally {
    rmSync(dirname(projet), { recursive: true, force: true });
  }
}

/** Vue d'un dossier d'exemple, tel qu'il est versionné. */
export function vueDe(dossier) {
  const { erreurs, vue } = construireVue(dossier, { rattachement: RATTACHEMENT });
  if (erreurs) throw new Error(erreurs.join(' ; '));
  return { vue, contenus: contenusVue(vue) };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1] && process.argv.includes('--ecrire')) {
  mkdirSync(DOSSIER_MOMENTS, { recursive: true });
  for (const m of MOMENTS) writeFileSync(join(DOSSIER_MOMENTS, `${m.nom}.md`), vueAuMoment(m.depots).contenus['vue.md']);
  for (const dossier of [DOSSIER_ESSAI, DOSSIER_RESOLUTION]) {
    const { contenus } = vueDe(dossier);
    for (const [f, texte] of Object.entries(contenus)) writeFileSync(join(dossier, f), texte);
  }
  console.log(`vues écrites : ${MOMENTS.map((m) => `vues/${m.nom}.md`).join(', ')}, et vue.html, vue.md des projets d'essai et résolu (${ICI})`);
}
