// Rejeu des champs d'observation d'essai de l'arbre ABCDE-3620 (prototype « skill de ticket », lot 5) :
// chaque dépôt passe par outils/champ.mjs, à sa date fixée, contre le rattachement que livre la
// transmission du skill racine. Le même scénario redonne le même champ, octet pour octet.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { relire } from '../../../tools/bundle.mjs';
import { lireTexte } from '../outils/referentiel.mjs';
import { contexteDe, deposer } from '../outils/champ.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
export const CHAMPS = JSON.parse(readFileSync(join(ICI, 'fixtures', 'champs-ABCDE-3620.json'), 'utf8'));
export const TRANSMISSION_RACINE = join(ICI, '..', 'exemples', 'ABCDE-3620-skills', 'transmissions', 'ticket-abcde-3620-1.0.0.md');
export const RATTACHEMENT = JSON.parse(relire(lireTexte(TRANSMISSION_RACINE)).fichiers.find((f) => f.rel === 'outils/rattachement.json').contenu);
export const CONTEXTE = contexteDe(RATTACHEMENT);
export const projetDe = (scenario) => join(ICI, '..', ...scenario.projet.split('/'));

/** Rejoue les k premiers dépôts d'un scénario (tous par défaut) dans <projet>/docs/demandes/<CLÉ>/. */
export function rejouer(scenario, projet, k = scenario.depots.length) {
  const dossier = join(projet, 'docs', 'demandes', CHAMPS.cle);
  const resultats = scenario.depots.slice(0, k).map(({ date, ...partiel }, i) => {
    const r = deposer(dossier, partiel, { contexte: CONTEXTE, date });
    if (r.erreurs.length > 0) throw new Error(`dépôt ${i + 1} refusé : ${r.erreurs.join(' ; ')}`);
    return r;
  });
  return { dossier, resultats };
}
