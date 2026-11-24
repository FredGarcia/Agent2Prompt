/**
 * Recette de `tools/glossaire.mjs` : `node --test tools/glossaire.test.mjs`, Node 20 ou plus récent.
 *
 * Le glossaire se génère depuis le dépôt, en lecture seule : la recette ne l'écrit pas. Elle porte sur les
 * espaces d'identifiants des socles, dont le préfixe `SA` du socle de l'acceptable ; elle tourne dans
 * `.github/workflows/verifier.yml`.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { genererGlossaire } from './glossaire.mjs';

const RACINE = dirname(dirname(fileURLToPath(import.meta.url)));
const lire = (rel) => readFileSync(join(RACINE, rel), 'utf8').replace(/\r\n/g, '\n');
const glossaire = genererGlossaire();
const sectionDe = (nom) => {
  const version = JSON.parse(lire(`specs/${nom}/manifest.json`)).version;
  const debut = glossaire.indexOf(`\n## ${nom} ${version}\n`);
  assert.ok(debut >= 0, `section ${nom} ${version} absente du glossaire`);
  const fin = glossaire.indexOf('\n## ', debut + 1);
  return glossaire.slice(debut, fin === -1 ? undefined : fin);
};

test('la notation des identifiants donne les trois socles', () => {
  for (const forme of ['`SCn`, `SCn.INV-k`', '`SOn`, `SOn.INV-k`', '`SAn`, `SAn.INV-k`']) assert.ok(glossaire.includes(`| ${forme} |`), forme);
});

test('chaque dimension et chaque invariant du socle de l’acceptable ont leur place dans le glossaire', () => {
  const socle = lire('specs/socle-acceptable/SKILL.md');
  const section = sectionDe('socle-acceptable');
  const dimensions = [...socle.matchAll(/^\| (SA\d+) \| ([^|]+) \| (active|reserved) \|$/gm)];
  const invariants = [...socle.matchAll(/^- \*\*(SA\d+\.INV-\d+)\*\* : /gm)].map((m) => m[1]);
  assert.ok(dimensions.length > 0 && invariants.length > 0);
  for (const [, id, nom, statut] of dimensions) assert.ok(section.includes(`\n### ${id} : ${nom.trim()} (${statut})\n`), id);
  for (const id of invariants) assert.match(section, new RegExp(`^\\| \\*\\*${id.replace('.', '\\.')}\\*\\* \\| `, 'm'), id);
  const sommaire = new RegExp(`^\\| \\[\`socle-acceptable\`\\]\\(#[^)]+\\) \\| [^|]+ \\| ${dimensions.filter((d) => d[3] === 'active').length} \\| \\d+ \\| ${invariants.length} \\|$`, 'm');
  assert.match(glossaire, sommaire);
});

test('une citation préfixée d’un invariant SA est reprise sous la spécification qui la fait', () => {
  // Chaque spécification qui cite `socle-acceptable:SAn.INV-k` figure dans la colonne « Repris dans » de l'invariant.
  const citations = [];
  for (const nom of ['agent2dev', 'agent2test', 'orchestrateur-c7e', 'generateur-skill-ticket']) {
    const manifeste = JSON.parse(lire(`specs/${nom}/manifest.json`));
    for (const module of manifeste.modules ?? []) {
      for (const [, id] of lire(`specs/${nom}/${module.path}`).matchAll(/socle-acceptable:(SA\d+\.INV-\d+)/g)) citations.push([id, `\`${nom}/${module.id}\``]);
    }
  }
  assert.ok(citations.length > 0, 'aucune citation préfixée du socle dans les modules des systèmes');
  const section = sectionDe('socle-acceptable');
  for (const [id, lieu] of citations) {
    const ligne = section.split('\n').find((l) => l.startsWith(`| **${id}** |`));
    assert.ok(ligne?.split(' | ').at(-1).includes(lieu), `${id} : ${lieu} attendu dans « Repris dans »`);
  }
});
