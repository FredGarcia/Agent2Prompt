// Recette du bilan du prototype (lot 7) : ce que BILAN.md avance se vérifie. Chaque test cité en preuve d'un
// critère existe sous ce titre ; chaque ligne de mesure recopiée est celle d'un rapport versionné ; chaque
// fichier du prototype qu'il cite existe ; chaque critère P1 à P9 y a sa ligne.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lireTexte } from '../outils/referentiel.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const PROTOTYPE = join(ICI, '..');
const BILAN = lireTexte(join(PROTOTYPE, 'BILAN.md'));
const RAPPORTS = ['ABCDE-3620', 'ABCDE-3512'].map((cle) => lireTexte(join(PROTOTYPE, 'exemples', 'contexte', `${cle}.md`)));
const lignesCriteres = BILAN.split('\n').filter((l) => /^\| P\d :/.test(l));

test('bilan : chaque critère P1 à P9 a sa ligne, ses preuves et son état', () => {
  assert.deepStrictEqual(lignesCriteres.map((l) => /^\| (P\d) :/.exec(l)[1]), ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9']);
  for (const l of lignesCriteres) {
    const [critere, preuves, etat] = l.split(' | ');
    assert.match(preuves, /`tests\/[a-z-]+\.test\.mjs`/, critere);
    assert.match(etat, /^(atteint|protocole sur le poste)/, critere);
  }
  assert.match(lignesCriteres[3], /\| protocole sur le poste ; la partie sans modèle est atteinte \|$/, 'P4 joue son modèle sur le poste');
  assert.match(lignesCriteres[6], /mesure réelle : protocole sur le poste \|$/, 'P7 : la mesure réelle se fait sur le poste');
});

test('bilan : chaque test cité en preuve existe sous ce titre', () => {
  let cites = 0;
  for (const l of lignesCriteres) {
    let fichier = null;
    for (const m of l.matchAll(/`(tests\/[a-z-]+\.test\.mjs)`|« ([^»]+?) »/g)) {
      if (m[1]) {
        fichier = m[1];
        continue;
      }
      assert.ok(fichier, `titre cité sans son fichier : ${m[2]}`);
      // Titres tels que les lit le développeur : apostrophes d'un littéral entre apostrophes déséchappées.
      const source = readFileSync(join(PROTOTYPE, ...fichier.split('/')), 'utf8').replace(/\\'/g, '\'');
      assert.ok(source.includes(m[2]), `${fichier} : aucun test intitulé « ${m[2]} »`);
      cites++;
    }
  }
  assert.ok(cites >= 25, `${cites} titres cités`);
});

test('bilan : chaque ligne de mesure recopiée est celle d\'un rapport versionné', () => {
  const lignes = BILAN.split('\n').filter((l) => /^\| (ABCDE-[\d.-]+ \||plus grand contexte de l'arbre|somme des \d+ contextes)/.test(l));
  assert.equal(lignes.length, 8);
  for (const l of lignes) assert.ok(RAPPORTS.some((r) => r.split('\n').includes(l)), `ligne absente des rapports, à recopier après leur régénération : ${l}`);
  // Les points d'entrée de l'orchestrateur cités sont ceux des rapports.
  const orchestrateur = [...BILAN.matchAll(/Point d'entrée de l'orchestrateur : ([\d ]+) tokens à l'activation, ([\d ]+) tokens au plus\./g)];
  assert.equal(orchestrateur.length, 2, 'un point d\'entrée de l\'orchestrateur par arbre');
  orchestrateur.forEach(([, activation, auPlus], i) => {
    assert.match(RAPPORTS[i], new RegExp(`^\\| à l'activation \\| [\\d ]+ car\\., ${activation} tokens \\|$`, 'm'), `activation ${activation}`);
    assert.match(RAPPORTS[i], new RegExp(`^\\| au plus \\| [\\d ]+ car\\., ${auPlus} tokens \\|$`, 'm'), `au plus ${auPlus}`);
  });
});

test('bilan : chaque fichier du prototype qu\'il cite existe', () => {
  const chemins = [...BILAN.matchAll(/`((?:outils|tests|exemples)\/[^`\s]+)`/g)].map((m) => m[1]);
  assert.ok(chemins.length >= 10, `${chemins.length} chemins cités`);
  for (const c of chemins) assert.ok(existsSync(join(PROTOTYPE, ...c.split('/'))), c);
});
