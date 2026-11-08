// Recette du lecteur TOML : mêmes objets que tomllib (Python), dont les instantanés sont versionnés
// dans tests/fixtures/toml/*.json et tests/attendus/*.json ; erreurs explicites, avec la ligne.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ErreurToml, lireToml } from '../outils/toml.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(ICI, 'fixtures', 'toml');
const ATTENDUS = join(ICI, 'attendus');
const EXEMPLE = join(ICI, '..', 'exemples', 'ABCDE-3620');

const lireJson = (chemin) => JSON.parse(readFileSync(chemin, 'utf8'));
const sources = [
  ...readdirSync(FIXTURES).filter((f) => f.endsWith('.toml')).map((f) => [join(FIXTURES, f), join(FIXTURES, f.replace(/\.toml$/, '.json'))]),
  ...readdirSync(EXEMPLE).filter((f) => f.endsWith('.toml')).map((f) => [join(EXEMPLE, f), join(ATTENDUS, f.replace(/\.toml$/, '.json'))]),
];

for (const [toml, json] of sources) {
  const nom = toml.slice(join(ICI, '..').length + 1).replace(/\\/g, '/');
  test(`même lecture que tomllib : ${nom}`, () => {
    const texte = readFileSync(toml, 'utf8');
    assert.deepStrictEqual(lireToml(texte, nom), lireJson(json));
  });
  test(`fins de ligne CRLF admises : ${nom}`, () => {
    const texte = readFileSync(toml, 'utf8').replace(/\r?\n/g, '\r\n');
    assert.deepStrictEqual(lireToml(texte, nom), lireJson(json));
  });
}

test('valeurs : nombres, chaînes, échappements, tableaux et tables en ligne', () => {
  const t = lireToml([
    'a = 1_000', 'b = -2.5e-1', 's = "tab\\tguillemet\\" é\\u00e9"', "l = 'C:\\brut'",
    '"cle libre" = true', 'x.y = false', 't = [ [1, 2], [],', '  "z", # commentaire', ']',
    'm = """', 'un \\', '   deux', '"""', 'v = { a = 1, b = { c = "d" } }',
  ].join('\n'));
  assert.deepStrictEqual(t, {
    a: 1000, b: -0.25, s: 'tab\tguillemet" éé', l: 'C:\\brut', 'cle libre': true, x: { y: false },
    t: [[1, 2], [], 'z'], m: 'un deux\n', v: { a: 1, b: { c: 'd' } },
  });
});

test('tableaux de tables et sous-tables rattachées au dernier élément', () => {
  const t = lireToml('[[m]]\nid = 1\n[m.e]\nk = "a"\n[[m]]\nid = 2\n[m.e]\nk = "b"\n');
  assert.deepStrictEqual(t, { m: [{ id: 1, e: { k: 'a' } }, { id: 2, e: { k: 'b' } }] });
});

const erreurs = [
  ['clé définie deux fois', 'a = 1\na = 2', /ligne 2 : clé définie deux fois : a/],
  ['table définie deux fois', '[t]\n[t]', /ligne 2 : table définie deux fois/],
  ['date', 'd = 2026-11-08', /ligne 1 : dates et heures non prises en charge/],
  ['hexadécimal', 'h = 0x1F', /entiers hexadécimaux/],
  ['zéro de tête', 'n = 01', /zéro de tête/],
  ['chaîne non terminée', 's = "abc', /chaîne non terminée/],
  ['retour dans une table en ligne', 'x = { a = 1,\n b = 2 }', /ligne 1/],
  ['« = » manquant', 'a 1', /« = » attendu/],
  ['valeur manquante', 'k =', /valeur attendue/],
  ['tableau mal séparé', 'a = [1 2]', /« , » ou « ] »/],
];
for (const [nom, texte, motif] of erreurs) {
  test(`erreur explicite : ${nom}`, () => {
    assert.throws(() => lireToml(texte, 'cas'), (e) => e instanceof ErreurToml && motif.test(e.message));
  });
}
