// Recette de la spécification generateur-skill-ticket : chaque invariant défini par le point d'entrée a,
// dans le module de sa dimension, sa ligne de recette et au moins un test qui le prouve, cité sous son
// titre et présent dans la recette ; les outils que cite la consigne existent ; les skills référencés par
// le manifeste sont ceux, à la version, dont les sources épinglées par le générateur héritent. La
// structure de la spécification (modules, registre, invariants cités, transmission) est vérifiée, avec
// toutes les autres, par tools/verifier.mjs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lireTexte } from '../outils/referentiel.mjs';
import { chargerSources } from '../outils/sources.mjs';

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

test('spécification : version du point d\'entrée, de son titre et du manifeste ; sept dimensions actives, un module chacune', () => {
  assert.equal(MANIFESTE.name, 'generateur-skill-ticket');
  assert.match(ENTREE, new RegExp(`^version: ${MANIFESTE.version.replace(/\./g, '\\.')}$`, 'm'));
  assert.match(ENTREE, new RegExp(`^# Générateur de skills de ticket C7E, version ${MANIFESTE.version.replace(/\./g, '\\.')}$`, 'm'));
  assert.deepStrictEqual(MANIFESTE.modules.map((m) => m.dimensions.join()), ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7']);
  assert.ok(MANIFESTE.modules.every((m) => m.status === 'active'));
  assert.equal(DEFINITIONS.length, 24);
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

test('spécification : les skills référencés sont ceux dont héritent les skills de ticket, aux versions qu\'épinglent leurs sources', () => {
  const S = chargerSources();
  const attendu = {
    'orchestrateur-c7e': S.orchestrateur.version,
    'socle-back-front': S.socle.version,
    ...S.boite.versions,
  };
  assert.deepStrictEqual(Object.fromEntries(MANIFESTE.references.map((r) => [r.name, r.version])), Object.fromEntries(Object.keys(attendu).sort().map((k) => [k, attendu[k]])));
  assert.deepStrictEqual(S.generateur, { nom: MANIFESTE.name, version: MANIFESTE.version });
});
