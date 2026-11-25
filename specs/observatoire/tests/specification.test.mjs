// Recette de la spécification de l'observatoire : versions, registre et ordres, recette citée par chaque
// invariant, outil et commandes décrits, socle épinglé conforme à la vérification des enveloppes, et
// propositions du dépôt au format observatoire.proposition/1.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sourcePartagee } from '../../../tools/bundle.mjs';
import { CHAMPS_ENVELOPPE, PROPOSITIONS, REQUIS_ENVELOPPE, controlerProposition } from '../outils/observatoire.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const SPEC = join(ICI, '..');
const RACINE = join(SPEC, '..', '..');
const lire = (chemin) => readFileSync(chemin, 'utf8').replace(/\r\n/g, '\n');
const MANIFESTE = JSON.parse(lire(join(SPEC, 'manifest.json')));
const ENTREE = lire(join(SPEC, 'SKILL.md'));
const DEFINITIONS = [...ENTREE.matchAll(/^- \*\*(D\d+)\.INV-(\d+)\*\* : /gm)].map((m) => ({ id: `${m[1]}.INV-${m[2]}`, dimension: m[1] }));
const texteDe = (module) => lire(join(SPEC, ...module.path.split('/')));
const sourceDe = (fichier) => lire(join(SPEC, ...fichier.split('/'))).replace(/\\'/g, '\'');

/** Lignes de recette d'un module : invariant → titres cités, chacun avec son fichier de test. */
function recette(texte) {
  const lignes = new Map();
  for (const [, id, preuves] of texte.matchAll(/^\| (D\d+\.INV-\d+) \| (.+) \|$/gm)) {
    const titres = [];
    let fichier = null;
    for (const m of preuves.matchAll(/`(tests\/[a-z-]+\.test\.mjs)`|« ([^»]+?) »/g)) {
      if (m[1]) fichier = m[1];
      else titres.push({ fichier, titre: m[2] });
    }
    lignes.set(id, titres);
  }
  return lignes;
}

/** Colonnes du registre des dimensions : identifiant → { statut, ordre, module }. */
function registre() {
  const section = /^## \d+\. Registre des dimensions\n([\s\S]*?)(?=\n## )/m.exec(ENTREE)[1];
  const lignes = section.split('\n').filter((l) => l.startsWith('|'));
  const cellules = (l) => l.split('|').slice(1, -1).map((c) => c.trim());
  const entetes = cellules(lignes[0]);
  const i = (nom) => entetes.findIndex((c) => c.startsWith(nom));
  return new Map(lignes.slice(2).map(cellules).map((c) => [c[0], { statut: c[i('Statut')], ordre: c[i('Ordre')], module: c[i('Module')].replace(/`/g, '') }]));
}

test('spécification : version du point d\'entrée, de son titre et du manifeste ; dix dimensions actives, un module chacune, et leur ordre déclaré', () => {
  assert.match(ENTREE, new RegExp(`^version: ${MANIFESTE.version.replace(/\./g, '\\.')}$`, 'm'));
  assert.match(ENTREE, new RegExp(`^# Observatoire de l'écosystème, version ${MANIFESTE.version.replace(/\./g, '\\.')}$`, 'm'));
  assert.match(ENTREE, new RegExp(`\\| ID \\| Dimension \\| Introduite \\| Statut ${MANIFESTE.version.replace(/\./g, '\\.')} \\| Ordre \\|`));
  const r = registre();
  assert.deepStrictEqual([...r.keys()], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10']);
  assert.deepStrictEqual([...r.values()].map((d) => d.ordre), ['OC1', 'OC3', 'OC3', 'OC3', 'OC3', 'OC3', 'OC1', 'OC3', 'OC3', 'OC3'], 'D1 régule l\'entrée du magasin, D7 la sortie d\'une instance pour le binôme ; D2 à D6 et D8 font la boucle du troisième ordre, que D9 observe pour les kits et D10 pour les signaux');
  for (const m of MANIFESTE.modules) {
    assert.equal(m.status, 'active', m.id);
    assert.deepStrictEqual(m.dimensions.map((d) => r.get(d).module), [m.id]);
  }
  assert.equal(DEFINITIONS.length, 18);
  assert.deepStrictEqual(MANIFESTE.previousVersions.map((p) => p.version), ['1.0.0', '1.1.0', '1.2.0', '1.3.0'], 'les versions précédentes, archivées');
});

test('spécification : chaque invariant a sa ligne de recette dans son module, et chaque test cité existe sous ce titre', () => {
  let cites = 0;
  for (const { id, dimension } of DEFINITIONS) {
    const module = MANIFESTE.modules.find((m) => m.dimensions.includes(dimension));
    const titres = recette(texteDe(module)).get(id);
    assert.ok(titres && titres.length > 0, `${id} : aucune ligne de recette dans le module ${module.id}`);
    for (const { fichier, titre } of titres) {
      assert.ok(fichier, `${id} : titre cité sans son fichier, « ${titre} »`);
      assert.ok(sourceDe(fichier).includes(`'${titre}'`) || sourceDe(fichier).includes(titre), `${id} : ${fichier} n'a aucun test intitulé « ${titre} »`);
      cites++;
    }
  }
  assert.ok(cites >= 2 * DEFINITIONS.length, `${cites} titres cités pour ${DEFINITIONS.length} invariants`);
});

test('spécification : l\'outil et ses commandes, tels que le point d\'entrée et la transmission les décrivent', () => {
  const outil = lire(join(SPEC, 'outils', 'observatoire.mjs'));
  const usage = [...outil.matchAll(/^\/\/ {3}node specs\/observatoire\/outils\/observatoire\.mjs ([a-z]+)/gm)].map((m) => m[1]);
  assert.deepStrictEqual(usage, ['inscrire', 'relever', 'etat', 'confronter', 'proposer', 'suivre', 'verifier']);
  const ligne = ENTREE.split('\n').find((l) => l.startsWith('| `observatoire.mjs` |'));
  assert.ok(ligne, 'la section 4 décrit l\'outil');
  assert.deepStrictEqual([...ligne.matchAll(/`([a-z]+)(?: [^`]*)?`/g)].map((m) => m[1]), usage, 'les mêmes commandes, dans le même ordre');
  // L'outil d'export du binôme, et ses commandes, tels que la section 4 et son module les décrivent.
  const exportBinome = lire(join(SPEC, 'outils', 'export-binome.mjs'));
  const commandes = [...exportBinome.matchAll(/^\/\/ {3}node specs\/observatoire\/outils\/export-binome\.mjs ([a-z]+)/gm)].map((m) => m[1]);
  assert.deepStrictEqual(commandes, ['exporter', 'verifier', 'etat']);
  const ligneExport = ENTREE.split('\n').find((l) => l.startsWith('| `export-binome.mjs` |'));
  assert.ok(ligneExport, 'la section 4 décrit l\'outil d\'export du binôme');
  assert.deepStrictEqual([...ligneExport.matchAll(/`([a-z]+)(?: [^`]*)?`/g)].map((m) => m[1]).filter((c) => c !== 'export'), commandes);
  const module = lire(join(SPEC, 'modules', 'export-binome', 'SKILL.md'));
  for (const c of commandes) assert.match(module, new RegExp(`^node specs/observatoire/outils/export-binome\\.mjs ${c} `, 'm'), `le module donne la commande ${c}`);
  assert.doesNotMatch(lire(join(SPEC, 'outils', 'observatoire.mjs')), /agent2prompt\/sel|lireSel|randomBytes/, 'observatoire.mjs ne lit ni ne tire le sel d\'une instance');
  assert.match(lire(join(SPEC, 'ENTETE-TRANSMISSION.md')), /\{\{VERSION\}\}/);
  for (const nom of readdirSync(join(SPEC, 'outils'))) assert.doesNotMatch(lire(join(SPEC, 'outils', nom)), /\b(?:git (?:commit|push)|'commit'|'push'|fetch\(|https?:\/\/)/, `outils/${nom} : ni commit, ni push, ni réseau`);
});

test('spécification : le socle épinglé décrit l\'enveloppe que l\'observatoire vérifie, champ pour champ', () => {
  const partage = MANIFESTE.shared.find((s) => s.from === 'specs/socle-observation/SKILL.md');
  assert.ok(partage, 'le socle d\'observation est inclus');
  assert.deepStrictEqual(MANIFESTE.references, [{ name: 'socle-observation', version: partage.version }], 'et référencé à la même version');
  const socle = lire(sourcePartagee(partage));
  const table = /^### 3\.1[^\n]*\n([\s\S]*?)(?=\n### )/m.exec(socle)[1];
  const champs = [...table.matchAll(/^\| `([a-z]+)` \| (oui|non) \|/gm)].map((m) => ({ champ: m[1], requis: m[2] === 'oui' }));
  assert.deepStrictEqual(champs.map((c) => c.champ), CHAMPS_ENVELOPPE, 'les champs, dans l\'ordre canonique');
  assert.deepStrictEqual(champs.filter((c) => c.requis).map((c) => c.champ), REQUIS_ENVELOPPE, 'les champs requis');
});

test('spécification : chaque proposition du dépôt suit le format observatoire.proposition/1, et leur dossier a son README', () => {
  const dossier = join(RACINE, PROPOSITIONS);
  assert.ok(existsSync(join(dossier, 'README.md')), `${PROPOSITIONS}/README.md`);
  assert.match(lire(join(dossier, 'README.md')), /observatoire\.proposition\/1/);
  for (const nom of readdirSync(dossier).filter((n) => n.endsWith('.md') && n !== 'README.md')) {
    assert.deepStrictEqual(controlerProposition(lire(join(dossier, nom))).erreurs, [], `${PROPOSITIONS}/${nom}`);
  }
});
