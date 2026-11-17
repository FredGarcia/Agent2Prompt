// Recette du lot 1 : l'arbre d'essai ABCDE-3620 est conforme, son plan est le bon, et chaque écart
// introduit volontairement est rejeté (critère P1 du prototype, et règles de la décomposition). En 1.1.0,
// l'arbre des commits : scénarios de l'US, commits de chaque tâche, proposition et règles (P10).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { appendFileSync, cpSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lireToml } from '../outils/toml.mjs';
import { chargerReferentiel, lireTexte } from '../outils/referentiel.mjs';
import { chargerArbre, construireArbre, decrireArbre, ordreDeResolution, verifierArbre } from '../outils/arbre.mjs';
import { aUnPlan, criteresRacineSoutenus, proposerCommits, scenariosDeLaTache, verifierPlan } from '../outils/commits.mjs';
import { arbreAvecPlan, PLAN, SCENARIOS } from './plan-commits.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const EXEMPLE = join(ICI, '..', 'exemples', 'ABCDE-3620');
const OUTIL = join(ICI, '..', 'outils', 'arbre.mjs');
const R = chargerReferentiel();

const entrees = () => readdirSync(EXEMPLE).filter((f) => f.endsWith('.toml')).sort()
  .map((f) => ({ fichier: f, donnees: lireToml(lireTexte(join(EXEMPLE, f)), f) }));
const ticket = (es, reference) => es.find((e) => e.donnees.ticket.reference === reference).donnees.ticket;
const verifierAvec = (modifier, options) => {
  const es = entrees();
  modifier(es);
  return verifierArbre(construireArbre(es), R, options);
};
const attendreEcart = (erreurs, motif) => assert.ok(erreurs.some((e) => motif.test(e)), `écart attendu ${motif} ; reçus :\n${erreurs.join('\n') || '(aucun)'}`);

test("l'arbre d'essai ABCDE-3620 est conforme", () => {
  assert.deepStrictEqual(verifierArbre(chargerArbre(EXEMPLE), R), []);
});

test('Composite : cinq nœuds sur trois niveaux, un seul parent chacun', () => {
  const arbre = chargerArbre(EXEMPLE);
  assert.equal(arbre.racine.reference, 'ABCDE-3620');
  assert.deepStrictEqual(arbre.racine.enfants.map((n) => n.reference), ['ABCDE-3620-1', 'ABCDE-3620-2']);
  assert.deepStrictEqual(arbre.racine.feuilles().map((n) => n.reference), ['ABCDE-3620-1.1', 'ABCDE-3620-1.2', 'ABCDE-3620-2']);
  assert.deepStrictEqual(arbre.noeuds.map((n) => [n.reference, n.profondeur]).sort(), [
    ['ABCDE-3620', 0], ['ABCDE-3620-1', 1], ['ABCDE-3620-1.1', 2], ['ABCDE-3620-1.2', 2], ['ABCDE-3620-2', 1],
  ]);
});

test('visiteur : le Composite se parcourt en ordre préfixe', () => {
  const vus = [];
  chargerArbre(EXEMPLE).racine.accepter({ visiter: (n) => vus.push(n.reference) });
  assert.deepStrictEqual(vus, ['ABCDE-3620', 'ABCDE-3620-1', 'ABCDE-3620-1.1', 'ABCDE-3620-1.2', 'ABCDE-3620-2']);
});

test('ordre de résolution : dépendances d\'abord, clôture des nœuds composés après leurs sous-tickets', () => {
  const { ordre, reste } = ordreDeResolution(chargerArbre(EXEMPLE));
  assert.deepStrictEqual(reste, []);
  assert.deepStrictEqual(ordre.map(({ noeud, action }) => `${noeud.reference} ${action}`), [
    'ABCDE-3620-1.1 résoudre', 'ABCDE-3620-1.2 résoudre', 'ABCDE-3620-1 clore', 'ABCDE-3620-2 résoudre', 'ABCDE-3620 clore',
  ]);
});

test("dessin de l'arbre", () => {
  assert.deepStrictEqual(decrireArbre(chargerArbre(EXEMPLE)), [
    'ABCDE-3620 · M04 · 5 critères',
    '├─ ABCDE-3620-1 · M04 · 5 critères',
    '│  ├─ ABCDE-3620-1.1 · M02 · 2 critères',
    '│  └─ ABCDE-3620-1.2 · M04 · 4 critères · dépend de ABCDE-3620-1.1',
    '└─ ABCDE-3620-2 · M03 · 2 critères · dépend de ABCDE-3620-1.2',
  ]);
});

// Critère P1 : écarts introduits volontairement, tous rejetés (l'invariant omis vient au lot 2).
const p1 = [
  ['deux parents', (es) => { ticket(es, 'ABCDE-3620-2').parent = ['ABCDE-3620', 'ABCDE-3620-1']; }, /un sous-ticket n'a qu'un seul parent/],
  ['cycle de dépendances', (es) => { ticket(es, 'ABCDE-3620-1.1').depend_de = ['ABCDE-3620-1.2']; }, /cycle de dépendances : ABCDE-3620-1\.1 → ABCDE-3620-1\.2 → ABCDE-3620-1\.1/],
  ['dépendance vers un ancêtre', (es) => { ticket(es, 'ABCDE-3620-1.2').depend_de = ['ABCDE-3620-1']; }, /dépend de son ancêtre ABCDE-3620-1/],
  ['profondeur au-delà du plafond', () => {}, /ABCDE-3620-1\.1 : profondeur 2, au-delà du plafond 1/, { profondeurMax: 1 }],
  ['possibilité du parent portée par aucun sous-ticket', (es) => { ticket(es, 'ABCDE-3620-2').demande.comportement = { reponse: 'non', source: 'essai' }; }, /ABCDE-3620 : comportement est à oui, mais aucun de ses sous-tickets ne le porte/],
  ['option hors de la composition', (es) => { ticket(es, 'ABCDE-3620-2').backend = { endpoints: [{ methode: 'GET', chemin: '/api/v1/x' }] }; }, /backend\.endpoints rattachée à M03, dont la couche backend est à l'impact aucun/],
];
for (const [nom, modifier, motif, options] of p1) {
  test(`P1 · écart rejeté : ${nom}`, () => attendreEcart(verifierAvec(modifier, options), motif));
}

const decomposition = [
  ['parent absent de l\'arbre', (es) => { ticket(es, 'ABCDE-3620-2').parent = 'ABCDE-9999'; }, /parent ABCDE-9999 absent de l'arbre/],
  ['référence en double', (es) => { ticket(es, 'ABCDE-3620-2').reference = 'ABCDE-3620-1'; }, /référence en double/],
  ['plusieurs racines', (es) => { delete ticket(es, 'ABCDE-3620-2').parent; }, /plusieurs racines/],
  ['cycle de parenté', (es) => { ticket(es, 'ABCDE-3620-1').parent = 'ABCDE-3620-1.1'; }, /non relié à la racine ABCDE-3620 \(cycle de parenté\)/],
  ['sous-ticket qui déborde de son parent', (es) => { ticket(es, 'ABCDE-3620-2').demande.formulaire = { reponse: 'oui', source: 'essai' }; }, /formulaire est à oui, absent de son parent ABCDE-3620 : revenir à la qualification du parent/],
  ['critère du parent non soutenu', (es) => { ticket(es, 'ABCDE-3620-1.1').criteres[0].soutient = ['ABCDE-3620-1:C3']; }, /ABCDE-3620-1:C4 : aucun critère de ses sous-tickets ne le soutient/],
  ['soutien d\'un critère absent', (es) => { ticket(es, 'ABCDE-3620-1.1').criteres[1].soutient = ['ABCDE-3620-1:C9']; }, /soutient ABCDE-3620-1:C9, critère absent/],
  ['soutien d\'un critère qui n\'est pas du parent', (es) => { ticket(es, 'ABCDE-3620-1.1').criteres[1].soutient = ['ABCDE-3620:C3']; }, /n'est pas un critère de son parent ABCDE-3620-1/],
  ['racine qui soutient un critère', (es) => { ticket(es, 'ABCDE-3620').criteres[0].soutient = ['X:C1']; }, /la racine ne soutient aucun critère/],
  ['nœud composé qui porte une option', (es) => { ticket(es, 'ABCDE-3620-1').persistance = { crud: [{ entite: 'X', operations: ['read'] }] }; }, /nœud composé : il ne porte pas d'option/],
  ['composition non conforme à la règle de choix', (es) => { ticket(es, 'ABCDE-3620-2').meso_contrat = 'M01'; }, /composition M01 non conforme à la règle de choix ; attendu : M03/],
  ['inconnue qui changerait la composition', (es) => { ticket(es, 'ABCDE-3620-1.1').demande.endpoint_modifie = { reponse: 'inconnu' }; }, /endpoint_modifie reste inconnu alors que sa réponse changerait la composition/],
  ['dépendance vers un ticket absent', (es) => { ticket(es, 'ABCDE-3620-2').depend_de = ['ABCDE-7777']; }, /dépend de ABCDE-7777, absent de l'arbre/],
  ['dépendance vers soi-même', (es) => { ticket(es, 'ABCDE-3620-2').depend_de = ['ABCDE-3620-2']; }, /dépend de lui-même/],
  ['dépendance vers un descendant', (es) => { ticket(es, 'ABCDE-3620-1').depend_de = ['ABCDE-3620-1.1']; }, /dépend de son descendant ABCDE-3620-1\.1/],
  ['cycle entre dépendances et clôtures', (es) => { ticket(es, 'ABCDE-3620-1.1').depend_de = ['ABCDE-3620-2']; ticket(es, 'ABCDE-3620-2').depend_de = ['ABCDE-3620-1']; }, /cycle entre dépendances et clôtures/],
];
for (const [nom, modifier, motif] of decomposition) {
  test(`décomposition · écart rejeté : ${nom}`, () => attendreEcart(verifierAvec(modifier), motif));
}

const lancer = (...args) => spawnSync(process.execPath, [OUTIL, ...args], { encoding: 'utf8' });

test('ligne de commande : verifier et plan sur l\'arbre d\'essai', () => {
  const v = lancer('verifier', EXEMPLE);
  assert.equal(v.status, 0, v.stderr);
  assert.match(v.stdout, /Arbre ABCDE-3620 conforme : 5 tickets, profondeur 2 \(plafond 3\), référentiel \d+\.\d+\.\d+/);
  const p = lancer('plan', EXEMPLE);
  assert.equal(p.status, 0, p.stderr);
  assert.match(p.stdout, /Ordre de résolution :\n {3}1\. ABCDE-3620-1\.1 {2}résoudre/);
  assert.match(p.stdout, /Méso-contrats transverses : T01, T02, T03/);
  assert.match(p.stdout, /Ratification : l'arbre, sur le skill parent ABCDE-3620 ; puis chaque feuille avant sa première action/);
});

test('ligne de commande : arbre non conforme, code 1 ; usage incorrect, code 2', () => {
  const dossier = mkdtempSync(join(tmpdir(), 'arbre-'));
  try {
    cpSync(EXEMPLE, dossier, { recursive: true });
    writeFileSync(join(dossier, 'ABCDE-3620-3.toml'), '[ticket]\nreference = "ABCDE-3620-3"\nparent = "ABCDE-3620"\nreferentiel = "3.3.0"\nmeso_contrat = "M03"\nentier = 01\n');
    const r = lancer('verifier', dossier);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /ÉCHEC {2}ABCDE-3620-3\.toml, ligne 6 : nombre avec un zéro de tête/);
  } finally {
    rmSync(dossier, { recursive: true, force: true });
  }
  assert.equal(lancer('construire', EXEMPLE).status, 2);
  assert.equal(lancer('verifier', EXEMPLE, '--inconnue').status, 2);
});

// ---- 1.1.0 : arbre des commits ----

const avecPlan = (retouche = (p) => p) => {
  const base = { scenarios: structuredClone(SCENARIOS), plan: structuredClone(PLAN) };
  return chargerArbre(arbreAvecPlan(retouche(base) ?? base));
};

test('arbre des commits : plan conforme, chaque scénario réalisé par un commit de sa tâche', () => {
  const arbre = avecPlan();
  assert.deepStrictEqual(verifierArbre(arbre, R), []);
  assert.deepStrictEqual([...criteresRacineSoutenus(arbre.parReference.get('ABCDE-3620-1.1'))].sort(), ['C3', 'C4']);
  assert.deepStrictEqual(scenariosDeLaTache(arbre.parReference.get('ABCDE-3620-2'), arbre.racine).map((s) => s.id), ['S04']);
  const p = lancer('plan', arbreAvecPlan());
  assert.equal(p.status, 0, p.stderr);
  assert.match(p.stdout, /Plan des commits de la branche :\n {3}1\. ABCDE-3620-1\.1:K1 {2}persistance · S02 {2}Agrégat de la date-heure de la dernière ligne\n/);
  assert.match(p.stdout, / {3}7\. ABCDE-3620-2:K1 {2}frontend · S04 {2}Liste et résumé à jour en temps réel, annoncés\n\nMéso-contrats transverses/);
});

const ecartsDuPlan = [
  ['commits sans scénario déclaré', (p) => { p.scenarios = []; }, /la racine ne déclare aucun scénario/],
  ['identifiant de scénario', (p) => { p.scenarios[0][0] = 'X1'; }, /identifiant de scénario attendu sous la forme Snn/],
  ['scénario en double', (p) => { p.scenarios[1][0] = 'S01'; }, /S01 : scénario en double/],
  ['scénario sans critère', (p) => { p.scenarios[0][2] = []; }, /S01 : n'éprouve aucun critère de la racine/],
  ['critère absent de la racine', (p) => { p.scenarios[0][2] = ['C9']; }, /S01 : éprouve C9, critère absent de la racine/],
  ['critère éprouvé par aucun scénario', (p) => { p.scenarios[2][2] = ['C2']; }, /ABCDE-3620:C3 : aucun scénario ne l'éprouve/],
  ['tâche sans commit', (p) => { delete p.plan['ABCDE-3620-2']; }, /ABCDE-3620-2 : tâche sans commit planifié/],
  ['nœud composé avec des commits', (p) => { p.plan['ABCDE-3620-1'] = [['K1', 'backend', 'S01', 'x']]; }, /ABCDE-3620-1 : nœud composé ; ses tâches portent les commits/],
  ['identifiant de commit', (p) => { p.plan['ABCDE-3620-2'][0][0] = 'C1'; }, /identifiant de commit attendu sous la forme Kn/],
  ['thème absent ou mal formé', (p) => { p.plan['ABCDE-3620-2'][0][1] = 'Front End'; }, /un thème, et un seul, en minuscules et tirets/],
  ['scénario non déclaré', (p) => { p.plan['ABCDE-3620-2'][0][2] = 'S09'; }, /scénario S09 non déclaré par la racine/],
  ['scénario hors des critères de la tâche', (p) => { p.plan['ABCDE-3620-2'].push(['K2', 'frontend', 'S01', 'x']); }, /le scénario S01 n'éprouve aucun critère de la racine que soutient ABCDE-3620-2/],
  ['deux commits pour un scénario et un thème', (p) => { p.plan['ABCDE-3620-2'].push(['K2', 'frontend', 'S04', 'x']); }, /un seul commit par scénario et par thème \(S04, frontend\)/],
  ['scénario réalisé par aucun commit', (p) => { p.plan['ABCDE-3620-1.2'] = p.plan['ABCDE-3620-1.2'].filter((c) => c[2] !== 'S01'); }, /ABCDE-3620:S01 : aucun commit planifié ne le réalise/],
];
for (const [nom, retouche, motif] of ecartsDuPlan) {
  test(`arbre des commits · écart rejeté : ${nom}`, () => attendreEcart(verifierArbre(avecPlan((p) => { retouche(p); return p; }), R), motif));
}

test('arbre des commits : proposer croise les scénarios de chaque tâche et ses thèmes', () => {
  const dossier = arbreAvecPlan({ plan: {} });
  const r = lancer('proposer', dossier);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^# ABCDE-3620-1\.1 \(ABCDE-3620-1\.1\.toml\)\n\[\[ticket\.commits\]\]\nid = "K1"\ntheme = "persistance"\nscenario = "S02"\n/);
  assert.match(r.stdout, /# ABCDE-3620-2 \(ABCDE-3620-2\.toml\)\n\[\[ticket\.commits\]\]\nid = "K1"\ntheme = "frontend"\nscenario = "S04"\nresume = "Lignes et résumé tenus à jour en temps réel, frontend"\n/);
  const arbre = chargerArbre(dossier);
  const couches = (t) => [...new Set(R.instancesOptions(t.ticket).map((o) => o.couche))];
  assert.deepStrictEqual(proposerCommits(arbre.parReference.get('ABCDE-3620-1.2'), arbre.racine, couches).map((c) => `${c.id}:${c.theme}:${c.scenario}`), ['K1:backend:S01', 'K2:backend:S02', 'K3:backend:S03', 'K4:backend:S04']);
  // Des thèmes déclarés, et une évolution de schéma qui a son commit technique.
  const t = arbre.parReference.get('ABCDE-3620-1.1');
  t.ticket.themes = ['requete', 'test-depot'];
  t.ticket.persistance.schema = [{ changement: 'index', table: 'ligne_commande' }];
  assert.deepStrictEqual(proposerCommits(t, arbre.racine, couches).map((c) => `${c.id}:${c.theme}:${c.scenario ?? '-'}`), ['K1:schema:-', 'K2:requete:S02', 'K3:requete:S03', 'K4:test-depot:S02', 'K5:test-depot:S03']);
  // Recopiée telle quelle, la proposition donne un arbre conforme.
  for (const bloc of r.stdout.split(/^# /m).filter(Boolean)) {
    const [entete, ...corps] = bloc.split('\n');
    appendFileSync(join(dossier, /\((.+)\)/.exec(entete)[1]), `\n${corps.join('\n')}`);
  }
  assert.deepStrictEqual(verifierArbre(chargerArbre(dossier), R), []);
  assert.equal(lancer('proposer', EXEMPLE).status, 1);
});

test("arbre des commits : un arbre sans scénario ni commit garde le plan d'avant la 1.1.0", () => {
  const arbre = chargerArbre(EXEMPLE);
  assert.equal(aUnPlan(arbre), false);
  assert.deepStrictEqual(verifierPlan(arbre), []);
  assert.doesNotMatch(lancer('plan', EXEMPLE).stdout, /Plan des commits/);
});
