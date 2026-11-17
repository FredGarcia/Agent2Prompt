// Arbre des commits d'essai (1.1.0) : l'arbre ABCDE-3620, tel que versionné, complété dans un dossier
// temporaire des scénarios de son US et du plan des commits de ses tâches. L'exemple lui-même reste figé
// (D8.INV-4) : le plan ne s'écrit que dans la copie. Un scénario peut dire ses couches (1.1.1), en
// quatrième place.

import { appendFileSync, cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
export const EXEMPLE_3620 = join(ICI, '..', 'exemples', 'ABCDE-3620');

export const SCENARIOS = [
  ['S01', 'Sans paramètre, la commande est servie inchangée', ['C1']],
  ['S02', 'Vue résumée : sans les lignes, avec la date-heure de la dernière', ['C2', 'C4']],
  ['S03', 'Commande sans ligne : date-heure nulle', ['C3']],
  ['S04', 'Lignes et résumé tenus à jour en temps réel', ['C5']],
];

export const PLAN = {
  'ABCDE-3620-1.1': [['K1', 'persistance', 'S02', 'Agrégat de la date-heure de la dernière ligne'], ['K2', 'persistance', 'S03', 'Agrégat nul pour une commande sans ligne']],
  'ABCDE-3620-1.2': [['K1', 'backend', 'S01', 'Réponse inchangée sans paramètre'], ['K2', 'backend', 'S02', 'Vue résumée à la même URI'], ['K3', 'backend', 'S03', 'Date-heure nulle au contrat'], ['K4', 'backend', 'S04', 'Canal STOMP des lignes et ETag']],
  'ABCDE-3620-2': [['K1', 'frontend', 'S04', 'Liste et résumé à jour en temps réel, annoncés']],
};

const chaine = (x) => JSON.stringify(x);
export const scenariosToml = (scenarios = SCENARIOS) => scenarios.map(([id, titre, prouve, couches]) => `\n[[ticket.scenarios]]\nid = ${chaine(id)}\ntitre = ${chaine(titre)}\nprouve = ${chaine(prouve)}\n${couches ? `couches = ${chaine(couches)}\n` : ''}`).join('');
export const commitsToml = (commits) => commits.map(([id, theme, scenario, resume]) => `\n[[ticket.commits]]\nid = ${chaine(id)}\ntheme = ${chaine(theme)}\n${scenario ? `scenario = ${chaine(scenario)}\n` : ''}resume = ${chaine(resume)}\n`).join('');

/**
 * Copie de l'arbre ABCDE-3620 avec ses scénarios et son plan. `ajouts` : TOML ajouté à la fin du fichier
 * d'un nœud, par référence ; `champs` : lignes ajoutées à la table [ticket] d'un nœud, par référence.
 */
export function arbreAvecPlan({ scenarios = SCENARIOS, plan = PLAN, ajouts = {}, champs = {} } = {}) {
  const dossier = mkdtempSync(join(tmpdir(), 'plan-3620-'));
  cpSync(EXEMPLE_3620, dossier, { recursive: true });
  for (const [reference, lignes] of Object.entries(champs)) {
    const chemin = join(dossier, `${reference}.toml`);
    writeFileSync(chemin, readFileSync(chemin, 'utf8').replace(/^\[ticket\]\r?\n/m, (entete) => `${entete}${lignes}\n`));
  }
  appendFileSync(join(dossier, 'ABCDE-3620.toml'), scenariosToml(scenarios));
  for (const [tache, commits] of Object.entries(plan)) appendFileSync(join(dossier, `${tache}.toml`), commitsToml(commits));
  for (const [reference, toml] of Object.entries(ajouts)) appendFileSync(join(dossier, `${reference}.toml`), toml);
  return dossier;
}
