// Recette du référentiel lu par le prototype : chargement, règle de choix (principal et
// compléments), règles de validation d'un ticket.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lireToml } from '../outils/toml.mjs';
import { chargerReferentiel, decrireComposition } from '../outils/referentiel.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(ICI, 'fixtures', 'toml');
const R = chargerReferentiel();
const exemple = (n) => lireToml(readFileSync(join(FIXTURES, `exemple-${n}.toml`), 'utf8')).ticket;
const copie = (o) => JSON.parse(JSON.stringify(o));

test('le modèle se charge depuis le module referentiel de l\'orchestrateur', () => {
  assert.match(R.version, /^\d+\.\d+\.\d+$/);
  for (const m of ['M01', 'M02', 'M03', 'M04']) assert.ok(R.mesoContrats.has(m), m);
  assert.equal(R.possibilites.size, 17);
  assert.equal(R.profondeurMax, 3);
});

test('le modèle se charge aussi depuis un fichier TOML de projet', () => {
  const F = chargerReferentiel(join(FIXTURES, 'referentiel-3.3.0.toml'));
  assert.equal(F.version, '3.3.0');
  assert.deepStrictEqual([...F.mesoContrats.keys()], ['M01', 'M02', 'M03', 'M04']);
});

// Demandes types de l'orchestrateur 3.5.0 (section 16), et les nœuds de l'arbre d'essai.
const demandes = {
  'fil rouge': [['colonne', 'lecture', 'endpoint_modifie', 'regle', 'service', 'ecran_modifie', 'comportement'], 'M01'],
  'index seul': [['index'], 'M02'],
  'libellé': [['ecran_modifie'], 'M03'],
  'R17, date non exposée': [['colonne', 'lecture', 'endpoint_modifie', 'ecran_modifie'], 'M01'],
  'R17, date exposée': [['ecran_modifie'], 'M03'],
  'écran de saisie nouveau': [['table', 'ecriture', 'endpoint_nouveau', 'service', 'ecran_nouveau', 'formulaire', 'navigation'], 'M01'],
  'variante seule': [['variante_representation'], 'M04'],
  'variante avec agrégat': [['lecture', 'endpoint_modifie', 'variante_representation'], 'M04'],
  'variante avec front': [['lecture', 'endpoint_modifie', 'variante_representation', 'comportement'], 'M04'],
  'variante avec colonne à créer': [['colonne', 'lecture', 'variante_representation'], 'M04'],
  'variante avec URI propre': [['variante_representation', 'endpoint_nouveau'], 'M04'],
  'variante avec index': [['variante_representation', 'index'], 'M04'],
  'ABCDE-3620': [['lecture', 'endpoint_modifie', 'variante_representation', 'temps_reel', 'ecran_modifie', 'comportement'], 'M04'],
  'ABCDE-3655': [['lecture', 'endpoint_modifie', 'variante_representation', 'temps_reel', 'ecran_modifie', 'comportement', 'regle'], 'M04 avec M01'],
  'R13 : écran et colonne sans API': [['ecran_modifie', 'comportement', 'colonne'], 'M03 avec M02'],
  'libellé et index : égalité': [['ecran_modifie', 'index'], 'M02 avec M03 | M03 avec M02'],
};
for (const [nom, [oui, attendu]] of Object.entries(demandes)) {
  test(`règle de choix : ${nom} → ${attendu}`, () => {
    const r = R.compositions(oui);
    assert.equal(r.compositions.map(decrireComposition).join(' | '), attendu);
    assert.deepStrictEqual(r.nonPortees, []);
  });
}

test('règle de choix : temps réel sans variante, possibilité portée par aucun méso-contrat', () => {
  const r = R.compositions(['temps_reel', 'comportement']);
  assert.deepStrictEqual(r.compositions, []);
  assert.deepStrictEqual(r.nonPortees, ['temps_reel']);
});

test('exemple fil rouge du référentiel (7.1) : conforme', () => {
  const t = exemple('7.1');
  assert.deepStrictEqual([...R.verifierDemande(t), ...R.verifierComposition(t), ...R.verifierOptions(t)], []);
});

test('exemple 7.2 du référentiel : regle et service restent inconnus alors qu\'ils changeraient la composition', () => {
  // Écart relevé en codant la règle 4 du modèle ; signalé, sans toucher au référentiel.
  const erreurs = R.verifierDemande(exemple('7.2'));
  assert.deepStrictEqual(erreurs.map((e) => e.split(' ')[2]), ['regle', 'service']);
});

test('composition non conforme : attendu donné par la règle', () => {
  const t = copie(exemple('7.1'));
  t.meso_contrat = 'M03';
  assert.match(R.verifierComposition(t)[0], /composition M03 non conforme à la règle de choix ; attendu : M01/);
});

const options = [
  ['remplacement sur une version publiée', (t) => { t.backend = { representations: [{ selection: 'remplacement', exposition_sans_champ: 'base', version_publiee: true }] }; t.meso_contrat = 'M04'; }, /remplacement choisi pour une version d'API publiée/],
  ['paramètre hors catalogue', (t) => { t.backend = { evenements: [{ mecanisme: 'sse', courtier: 'simple', canal: 'c', types: ['x'], instantane: 'GET /x' }] }; t.meso_contrat = 'M04'; }, /paramètre mecanisme = « sse »/],
  ['événements incomplets', (t) => { t.backend = { evenements: [{ mecanisme: 'websocket_stomp', courtier: 'simple' }] }; t.meso_contrat = 'M04'; }, /canal manquant/],
  ['delete sans mode de suppression', (t) => { t.persistance.crud[0].operations = ['read', 'delete']; }, /delete impose un mode de suppression/],
  ['méthode hors catalogue', (t) => { t.backend.endpoints[0].methode = 'HEAD'; }, /méthode HEAD hors de/],
  ['analyse d\'image sans PNG', (t) => { t.frontend.elements_graphiques[0].image_objectif = 'maquette.jpg'; }, /analyse_image sans image_objectif en png/],
  ['options avant confirmation', (t) => { t.meso_contrat_confirme = false; }, /avant la confirmation/],
];
for (const [nom, modifier, motif] of options) {
  test(`option refusée : ${nom}`, () => {
    const t = copie(exemple('7.1'));
    modifier(t);
    const erreurs = R.verifierOptions(t);
    assert.ok(erreurs.some((e) => motif.test(e)), erreurs.join('\n'));
  });
}
