// Recette du script des invariants (generateur-skill-ticket 1.0.1) : livré dans le skill racine, il compare
// le fichier d'invariants du projet à l'état sur lequel le skill d'un nœud a été produit, par empreinte,
// sans que le nœud lise la copie du skill. Copies identiques, fins de ligne CRLF comprises : code 0.
// Copie du projet différente, avec ses sections et leurs lignes ; absente, avec la copie qui en tient
// lieu ; copie du skill altérée : code 1. Usage incorrect : code 2.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { relire } from '../../../tools/bundle.mjs';
import { lireTexte } from '../outils/referentiel.mjs';
import { comparer, differences, principal } from '../outils/invariants.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const OUTIL = join(ICI, '..', 'outils', 'invariants.mjs');
const TRANSMISSION = join(ICI, '..', 'exemples', 'ABCDE-3512-skills', 'transmissions', 'ticket-abcde-3512-1.0.0.md');
const SKILL = 'ticket-abcde-3512';

/** Workspace temporaire où le skill du ticket ABCDE-3512 est écrit tel que sa transmission le donne. */
function workspace() {
  const ws = mkdtempSync(join(tmpdir(), 'invariants-'));
  for (const f of relire(lireTexte(TRANSMISSION)).fichiers) {
    const chemin = join(ws, '.gemini', 'skills', SKILL, ...f.rel.split('/'));
    mkdirSync(dirname(chemin), { recursive: true });
    writeFileSync(chemin, f.contenu);
  }
  mkdirSync(join(ws, 'docs', 'c7e'), { recursive: true });
  return ws;
}
const copieDuSkill = (ws) => lireTexte(join(ws, '.gemini', 'skills', SKILL, 'projet', 'meso-contrats.md'));
const dans = (ws) => ({ skill: SKILL, projet: join(ws, 'docs', 'c7e', 'meso-contrats.md'), skills: join(ws, '.gemini', 'skills') });

test('invariants : copies identiques, code 0 ; seule la copie du projet est à lire, et les valeurs ADAPTER restées sont signalées', () => {
  const ws = workspace();
  writeFileSync(join(ws, 'docs', 'c7e', 'meso-contrats.md'), copieDuSkill(ws));
  const r = comparer(dans(ws));
  assert.equal(r.code, 0, r.lignes.join('\n'));
  assert.match(r.lignes[0], /^invariants du projet identiques à ceux sur lesquels ticket-abcde-3512 a été produit \(sha256 [0-9a-f]{12}\) : lis .*meso-contrats\.md, qui fait foi$/);
  assert.match(r.lignes.at(-1), /^valeurs ADAPTER restées dans .*, à signaler, jamais devinées : .*§ 6\. Exclusions et périmètre/);
});

test('invariants : une copie du projet en fins de ligne CRLF reste identique', () => {
  const ws = workspace();
  writeFileSync(join(ws, 'docs', 'c7e', 'meso-contrats.md'), copieDuSkill(ws).replace(/\n/g, '\r\n'));
  assert.equal(comparer(dans(ws)).code, 0);
});

test('invariants : copie du projet différente, code 1, avec les sections qui diffèrent et leurs lignes', () => {
  const ws = workspace();
  const skill = copieDuSkill(ws);
  const ligne = skill.split('\n').find((l) => l.startsWith('- ') && l.includes('rollback'));
  assert.ok(ligne, 'une règle de rollback dans le modèle');
  const projet = skill.replace(ligne, `${ligne} Revue obligatoire.`).replace(/\n## 7\. [\s\S]*$/, '\n## 8. Contrats propres au projet\n\n- Toute table porte une clé technique.\n');
  writeFileSync(join(ws, 'docs', 'c7e', 'meso-contrats.md'), projet);
  const r = comparer(dans(ws));
  assert.equal(r.code, 1);
  assert.match(r.lignes[0], /^invariants du projet différents de ceux sur lesquels ticket-abcde-3512 a été produit : .* fait foi ; 3 sections diffèrent, à dire au développeur avant tout le reste$/);
  const texte = r.lignes.join('\n');
  assert.match(texte, /\n {2}§ 1\. Contrats de persistance[^\n]* : modifiée\n {4}\+ [^\n]*Revue obligatoire\.\n {4}- /);
  assert.match(texte, /\n {2}§ 8\. Contrats propres au projet : ajoutée\n {4}\+ - Toute table porte une clé technique\./);
  assert.match(texte, /\n {2}§ 7\. Registre des écarts : modèle : retirée\n/);
  assert.deepStrictEqual(differences(skill, skill), []);
});

test('invariants : copie du projet absente, code 1, avec la copie du skill qui en tient lieu', () => {
  const ws = workspace();
  const r = comparer(dans(ws));
  assert.equal(r.code, 1);
  assert.match(r.lignes[0], /^copie du projet absente : .*meso-contrats\.md ; signale-le au développeur, et lis à sa place .*ticket-abcde-3512.projet.meso-contrats\.md, l'état sur lequel ticket-abcde-3512 a été produit$/);
});

test('invariants : copie du skill altérée, code 1, avant toute comparaison', () => {
  const ws = workspace();
  writeFileSync(join(ws, '.gemini', 'skills', SKILL, 'projet', 'meso-contrats.md'), `${copieDuSkill(ws)}\n- ajout clandestin\n`);
  writeFileSync(join(ws, 'docs', 'c7e', 'meso-contrats.md'), copieDuSkill(ws));
  const r = comparer(dans(ws));
  assert.equal(r.code, 1);
  assert.match(r.lignes[0], /^copie du skill altérée : .* n'a plus l'empreinte que déclare le manifeste de ticket-abcde-3512/);
});

test('invariants : ligne de commande, depuis la racine du projet ; codes de sortie', () => {
  const ws = workspace();
  writeFileSync(join(ws, 'docs', 'c7e', 'meso-contrats.md'), copieDuSkill(ws));
  const r = spawnSync(process.execPath, [OUTIL, 'comparer', SKILL], { cwd: ws, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^invariants du projet identiques/);
  const absent = spawnSync(process.execPath, [OUTIL, 'comparer', SKILL, '--projet', 'docs/c7e/absent.md'], { cwd: ws, encoding: 'utf8' });
  assert.equal(absent.status, 1);
  assert.match(absent.stderr, /^copie du projet absente : docs\/c7e\/absent\.md/);
  const muet = () => {};
  for (const args of [[], ['comparer'], ['comparer', SKILL, 'autre'], ['verifier', SKILL], ['comparer', SKILL, '--inconnue', 'x'], ['comparer', SKILL, '--projet']]) {
    assert.equal(principal(args, muet, muet), 2, args.join(' '));
  }
  assert.equal(principal(['comparer', 'ticket-inconnu', '--skills', join(ws, '.gemini', 'skills')], muet, muet), 1);
});
