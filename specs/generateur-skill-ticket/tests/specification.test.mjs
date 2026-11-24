// Recette de la spécification generateur-skill-ticket : chaque invariant défini par le point d'entrée a,
// dans le module de sa dimension, sa ligne de recette et au moins un test qui le prouve, cité sous son
// titre et présent dans la recette ; les outils que cite la consigne existent ; les skills référencés par
// le manifeste sont ceux, à la version, dont les sources épinglées par le générateur héritent. La
// structure de la spécification (modules, registre, invariants cités, transmission) est vérifiée, avec
// toutes les autres, par tools/verifier.mjs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lireTexte } from '../outils/referentiel.mjs';
import { chargerSources, extraireSection } from '../outils/sources.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const SPEC = join(ICI, '..');
const MANIFESTE = JSON.parse(readFileSync(join(SPEC, 'manifest.json'), 'utf8'));
const ENTREE = lireTexte(join(SPEC, 'SKILL.md'));
const DEFINITIONS = [...ENTREE.matchAll(/^- \*\*(D\d+)\.INV-(\d+)\*\* : /gm)].map((m) => ({ id: `${m[1]}.INV-${m[2]}`, dimension: m[1] }));
const texteDe = (module) => lireTexte(join(SPEC, ...module.path.split('/')));
const sourceDe = (fichier) => readFileSync(join(SPEC, ...fichier.split('/')), 'utf8').replace(/\\'/g, '\'');

/** Lignes de recette d'un module : invariant → titres cités, chacun avec son fichier de test. */
function recette(texte) {
  const lignes = new Map();
  for (const [, id, preuves] of texte.matchAll(/^\| (D\d+\.INV-\d+) \| (.+) \|$/gm)) {
    let fichier = null;
    const titres = [];
    for (const m of preuves.matchAll(/`(tests\/[a-z-]+\.test\.mjs)`|« ([^»]+?) »/g)) {
      if (m[1]) fichier = m[1];
      else titres.push({ fichier, titre: m[2] });
    }
    lignes.set(id, titres);
  }
  return lignes;
}

test('spécification : version du point d\'entrée, de son titre et du manifeste ; huit dimensions actives et une réservée, un module chacune', () => {
  assert.equal(MANIFESTE.name, 'generateur-skill-ticket');
  assert.match(ENTREE, new RegExp(`^version: ${MANIFESTE.version.replace(/\./g, '\\.')}$`, 'm'));
  assert.match(ENTREE, new RegExp(`^# Générateur de skills de ticket C7E, version ${MANIFESTE.version.replace(/\./g, '\\.')}$`, 'm'));
  assert.deepStrictEqual(MANIFESTE.modules.map((m) => m.dimensions.join()), ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9']);
  assert.deepStrictEqual(MANIFESTE.modules.filter((m) => m.status !== 'active').map((m) => `${m.id}:${m.status}`), ['observation:reserved']);
  assert.equal(DEFINITIONS.length, 29);
});

test('1.2.0 : D9 réservée, inerte : aucun outil n\'exporte vers le socle d\'observation, et aucun skill de ticket ne porte le module observation', () => {
  const observation = MANIFESTE.modules.find((m) => m.id === 'observation');
  assert.match(texteDe(observation), /^status: reserved$/m);
  assert.ok(!DEFINITIONS.some((d) => d.dimension === 'D9'), 'une dimension réservée n\'a aucun invariant en vigueur');
  for (const nom of readdirSync(join(SPEC, 'outils'))) {
    assert.doesNotMatch(sourceDe(`outils/${nom}`), /socle-observation|enveloppe\/1/, `outils/${nom} : aucun export`);
  }
  for (const cle of ['ABCDE-3620', 'ABCDE-3512']) {
    const dossier = join(SPEC, 'exemples', `${cle}-skills`, 'transmissions');
    const transmissions = readdirSync(dossier).filter((nom) => nom.endsWith('.md'));
    assert.ok(transmissions.length > 0, `${cle} : transmissions d'exemple`);
    for (const nom of transmissions) {
      assert.doesNotMatch(readFileSync(join(dossier, nom), 'utf8'), /modules\/observation\/|socle-observation/, `${cle}, ${nom} : ni le module ni le socle`);
    }
  }
});

test('spécification : chaque invariant a sa ligne de recette dans le module de sa dimension, et chaque test cité existe sous ce titre', () => {
  let cites = 0;
  for (const module of MANIFESTE.modules) {
    const lignes = recette(texteDe(module));
    const attendus = DEFINITIONS.filter((d) => module.dimensions.includes(d.dimension)).map((d) => d.id);
    assert.deepStrictEqual([...lignes.keys()], attendus, `module ${module.id} : une ligne de recette par invariant de sa dimension, dans l'ordre`);
    for (const [id, titres] of lignes) {
      assert.ok(titres.length > 0, `${id} : aucun test cité`);
      for (const { fichier, titre } of titres) {
        assert.ok(fichier, `${id} : titre cité sans son fichier, « ${titre} »`);
        assert.ok(sourceDe(fichier).includes(titre), `${id} : ${fichier} n'a aucun test intitulé « ${titre} »`);
        cites++;
      }
    }
  }
  assert.ok(cites >= 3 * DEFINITIONS.length, `${cites} titres cités pour ${DEFINITIONS.length} invariants`);
});

test('spécification : les outils que citent la consigne et les modules existent dans le dépôt', () => {
  const textes = [ENTREE, ...MANIFESTE.modules.map(texteDe), lireTexte(join(SPEC, 'ENTETE-TRANSMISSION.md'))].join('\n');
  const outils = new Set([...textes.matchAll(/<dépôt>\/specs\/generateur-skill-ticket\/outils\/([a-z-]+\.mjs)/g)].map((m) => m[1]));
  for (const [, nom] of ENTREE.matchAll(/^\| `([a-z-]+\.mjs)`/gm)) outils.add(nom);
  assert.ok(outils.size >= 5, [...outils].join(', '));
  for (const nom of outils) assert.ok(existsSync(join(SPEC, 'outils', nom)), `outils/${nom}`);
  for (const [, chemin] of textes.matchAll(/`((?:exemples|tests)\/[^`\s]+)`/g)) assert.ok(existsSync(join(SPEC, ...chemin.split('/'))), chemin);
});

test('1.1.1 : les protocoles sur le poste portent sur le ticket en cours, sans arbre d\'exemple ni taille recopiée', () => {
  const module = (id) => texteDe(MANIFESTE.modules.find((m) => m.id === id));
  const protocoles = { installation: extraireSection(module('installation'), '4'), mesure: extraireSection(module('mesure'), '3') };
  for (const [id, texte] of Object.entries(protocoles)) {
    assert.match(texte, /ticket (réel|en cours)/, `${id} : sur le ticket réel`);
    assert.doesNotMatch(texte, /exemples\/|ABCDE-|abcde-/, `${id} : aucun arbre d'exemple`);
    assert.doesNotMatch(texte, /--caracteres \d/, `${id} : la taille se lit dans le rapport de l'arbre`);
    assert.match(texte, /relevé du ticket/, `${id} : un écart se note dans le relevé`);
  }
});

test('spécification : les skills référencés sont ceux dont héritent les skills de ticket, aux versions qu\'épinglent leurs sources', () => {
  const S = chargerSources();
  // Le socle d'observation, que référence la dimension réservée D9, à la version qu'épingle l'orchestrateur (1.2.0).
  const orchestrateur = JSON.parse(readFileSync(join(SPEC, '..', 'orchestrateur-c7e', 'manifest.json'), 'utf8'));
  const socleObservation = orchestrateur.references.find((r) => r.name === 'socle-observation');
  assert.ok(socleObservation, 'l\'orchestrateur référence le socle d\'observation');
  const attendu = {
    'orchestrateur-c7e': S.orchestrateur.version,
    'socle-back-front': S.socle.version,
    'socle-observation': socleObservation.version,
    ...S.boite.versions,
  };
  assert.deepStrictEqual(Object.fromEntries(MANIFESTE.references.map((r) => [r.name, r.version])), Object.fromEntries(Object.keys(attendu).sort().map((k) => [k, attendu[k]])));
  assert.deepStrictEqual(S.generateur, { nom: MANIFESTE.name, version: MANIFESTE.version });
});
