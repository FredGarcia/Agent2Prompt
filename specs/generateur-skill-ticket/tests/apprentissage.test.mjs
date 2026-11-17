// Recette de l'apprentissage permanent (generateur-skill-ticket 1.1.0, D8) : relevé du ticket classé par
// profondeur CRI, chaque entrée avec sa preuve ; remontée tirée du champ d'observation et des écarts
// entre le plan des commits et la branche ; registre du projet en ajout seul et chaîné ; récurrences
// proposées, décidées par le développeur seul, veille après deux refus ; arbres d'exemple figés.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import {
  clore, commitsDeLaBranche, decider, entreesDuPlan, lireRegistre, lireReleve, noter, principal, proposer, recurrences, tendance, verifierRegistre,
} from '../outils/apprentissage.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const EXEMPLES = join(ICI, '..', 'exemples');
const OUTIL = join(ICI, '..', 'outils', 'apprentissage.mjs');
const D1 = '2026-11-17T10:00:00Z';

/** Projet temporaire : docs/demandes et docs/c7e ; avec `champ`, le champ de l'exemple ABCDE-3620. */
function projet({ champ = false } = {}) {
  const p = mkdtempSync(join(tmpdir(), 'apprentissage-'));
  mkdirSync(join(p, 'docs', 'demandes'), { recursive: true });
  if (champ) cpSync(join(EXEMPLES, 'ABCDE-3620-champ', 'docs', 'demandes', 'ABCDE-3620'), join(p, 'docs', 'demandes', 'ABCDE-3620'), { recursive: true });
  return { p, demandes: join(p, 'docs', 'demandes'), registre: join(p, 'docs', 'c7e', 'registre-apprentissage.jsonl') };
}
const entree = (x = {}) => ({ profondeur: 'meso-contrats', nature: 'possibilite-inconnue', motif: 'possibilite-batch', cible: 'referentiel', sens: 'descente', resume: 'un job batch passe par la possibilité service', preuve: { type: 'arbre', ref: 'ABCDE-4100' }, ...x });
const ticketClos = (o, cle, entrees, date) => {
  assert.deepStrictEqual(noter(cle, entrees, { demandes: o.demandes, date }).erreurs, []);
  assert.deepStrictEqual(clore(cle, { demandes: o.demandes, registre: o.registre, date }).erreurs, []);
};

test('D8 : une entrée sans profondeur CRI ou sans preuve est refusée, rien n\'est écrit', () => {
  const o = projet();
  const refus = [
    [{ profondeur: 'meso' }, /profondeur « meso » hors de macro, meso-contrats, meso-composants, micro/],
    [{ preuve: undefined }, /preuve absente ou mal typée .* une entrée sans preuve est refusée/],
    [{ preuve: { type: 'intuition', ref: 'x' } }, /preuve absente ou mal typée/],
    [{ preuve: { type: 'champ', ref: '' } }, /preuve absente ou mal typée/],
    [{ motif: 'Possibilité Batch' }, /motif en minuscules et tirets/],
    [{ nature: 'idee' }, /nature « idee »/],
    [{ cible: 'orchestrateur' }, /cible « orchestrateur »/],
    [{ sens: 'lateral' }, /sens « lateral »/],
    [{ resume: ' ' }, /résumé absent/],
  ];
  for (const [x, motif] of refus) {
    const r = noter('ABCDE-4100', [entree(), entree(x)], { demandes: o.demandes, date: D1 });
    assert.ok(r.erreurs.some((e) => motif.test(e)), `${motif} : ${r.erreurs.join(' ; ')}`);
    assert.equal(existsSync(join(o.demandes, 'ABCDE-4100', 'releve.json')), false, 'rien n\'est écrit, pas même l\'entrée valide');
  }
  assert.match(noter('ABCDE-4100', [entree()], { demandes: o.demandes, date: '17/11/2026' }).erreurs[0], /date « 17\/11\/2026 »/);
  const ok = noter('ABCDE-4100', [entree(), entree({ profondeur: 'macro', nature: 'hors-arbre', motif: 'diagnostic-hors-arbre', resume: 'diagnostic sans couche', preuve: { type: 'arbre', ref: 'ABCDE-4100-3', extrait: 'aucun méso-contrat' } })], { demandes: o.demandes, date: D1 });
  assert.deepStrictEqual(ok.erreurs, []);
  assert.deepStrictEqual(ok.releve.entrees.map((e) => [e.n, e.profondeur, e.motif]), [[1, 'meso-contrats', 'possibilite-batch'], [2, 'macro', 'diagnostic-hors-arbre']]);
  const md = readFileSync(join(o.demandes, 'ABCDE-4100', 'releve.md'), 'utf8');
  assert.match(md, /^# Relevé d'apprentissage de ABCDE-4100\n\n2 entrées\.\n\n## macro\n/);
  assert.ok(md.indexOf('## macro') < md.indexOf('## meso-contrats'), 'vue rangée par profondeur, de macro à micro');
});

test('D8 : la clôture classe la remontée du champ par profondeur CRI, depuis l\'ancre de l\'action corrigée', () => {
  const o = projet({ champ: true });
  const r = clore('ABCDE-3620', { demandes: o.demandes, registre: o.registre, date: D1 });
  assert.deepStrictEqual(r.erreurs, []);
  // Le champ d'exemple : deux corrections au motif requete-native, sur des actions ancrées à un scénario,
  // puis la proposition d'ordre 2 qu'elles ont fait attendre, retenue par le développeur.
  assert.deepStrictEqual(r.releve.entrees.map((e) => [e.profondeur, e.nature, e.motif, e.sens, e.preuve.type]), [
    ['meso-composants', 'correction', 'requete-native', 'remontee', 'champ'],
    ['meso-composants', 'correction', 'requete-native', 'remontee', 'champ'],
    ['meso-composants', 'proposition-observateur', 'requete-native', 'remontee', 'champ'],
  ]);
  assert.match(r.releve.entrees[2].resume, /\(décision du développeur : retenue\)$/);
  assert.deepStrictEqual(r.releve.entrees.map((e) => e.preuve.ref), ['4', '6', '7']);
});

/** Dépôt Git temporaire dont chaque commit porte les lignes données. */
function depot(commits) {
  const d = mkdtempSync(join(tmpdir(), 'branche-'));
  const git = (...a) => execFileSync('git', a, { cwd: d, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  git('init', '-q');
  git('config', 'user.email', 'essai@exemple.fr');
  git('config', 'user.name', 'Essai');
  commits.forEach(([titre, ...lignes], k) => {
    writeFileSync(join(d, `f${k}.txt`), String(k));
    git('add', '.');
    git('commit', '-q', '-m', [titre, '', ...lignes].join('\n'));
  });
  return d;
}

test('D8 : la clôture relève les écarts entre le plan des commits et la branche, au niveau micro', () => {
  const plan = [
    { tache: 'ABCDE-3620-1.1', commit: 'K1', theme: 'persistance', scenario: 'ABCDE-3620-S02' },
    { tache: 'ABCDE-3620-1.1', commit: 'K2', theme: 'persistance', scenario: 'ABCDE-3620-S03' },
    { tache: 'ABCDE-3620-2', commit: 'K1', theme: 'frontend', scenario: 'ABCDE-3620-S04' },
  ];
  const d = depot([
    ['ABCDE-3620 : [É6-C7E] docs(demande): documents de la clé'],
    ['ABCDE-3620 S02 : [É1-DATA] test(depot): agrégat', 'Tâche : ABCDE-3620-1.1', 'Scénario : ABCDE-3620-S02', 'Thème : persistance'],
    ['ABCDE-3620 S02 : [É1-DATA] feat(depot): agrégat', 'Tâche : ABCDE-3620-1.1', 'Scénario : ABCDE-3620-S02', 'Thème : persistance'],
    ['ABCDE-3620 S04 : [É5-UI] feat(lignes): temps réel', 'Tâche : ABCDE-3620-2', 'Scénario : ABCDE-3620-S04', 'Thème : frontend'],
    ['ABCDE-3620 : [É5-UI] style(lignes): libellés', 'Tâche : ABCDE-3620-2', 'Thème : libelles'],
  ]);
  const commits = commitsDeLaBranche(d);
  assert.deepStrictEqual(commits.map((c) => [c.tache, c.scenario, c.theme]), [
    ['ABCDE-3620-1.1', 'ABCDE-3620-S02', 'persistance'], ['ABCDE-3620-1.1', 'ABCDE-3620-S02', 'persistance'],
    ['ABCDE-3620-2', 'ABCDE-3620-S04', 'frontend'], ['ABCDE-3620-2', null, 'libelles'],
  ], 'le commit des documents, sans ligne « Tâche », n\'est pas une tâche');
  const ecarts = entreesDuPlan(plan, commits);
  assert.deepStrictEqual(ecarts.map((e) => [e.profondeur, e.nature, e.motif, e.preuve.type]), [
    ['micro', 'commit-planifie-multiple', 'commit-multiple-persistance', 'commit'],
    ['micro', 'commit-planifie-absent', 'commit-absent-persistance', 'arbre'],
    ['micro', 'commit-hors-plan', 'commit-hors-plan-libelles', 'commit'],
  ]);
  assert.match(ecarts[0].resume, /ABCDE-3620-1\.1:K1 \(persistance, ABCDE-3620-S02\) : réalisé en 2 commits/);
  // Par la clôture, avec le rattachement du skill racine.
  const o = projet();
  const r = clore('ABCDE-3620', { demandes: o.demandes, registre: o.registre, rattachement: { plan }, projet: d, date: D1 });
  assert.deepStrictEqual(r.erreurs, []);
  assert.equal(r.releve.entrees.filter((e) => e.profondeur === 'micro').length, 3);
  assert.match(clore('ABCDE-3700', { demandes: o.demandes, registre: o.registre, rattachement: { plan }, projet: mkdtempSync(join(tmpdir(), 'vide-')), date: D1 }).erreurs[0], /branche HEAD illisible/);
});

test('D8 : un relevé clos est versé au registre et ne reçoit plus rien', () => {
  const o = projet();
  ticketClos(o, 'ABCDE-4100', [entree(), entree({ profondeur: 'macro', nature: 'cout', motif: 'cout-de-l-arbre', cible: 'generateur', resume: '411 %', preuve: { type: 'commande', ref: 'mesurer-contexte.mjs mesurer' } })], D1);
  assert.equal(lireReleve('ABCDE-4100', o.demandes).clos, true);
  const { lignes, enregistrements } = lireRegistre(o.registre);
  assert.equal(lignes.length, 2);
  assert.deepStrictEqual(enregistrements.map((e) => [e.format, e.n, e.type, e.cle, e.entree, e.profondeur]), [
    ['generateur.apprentissage/1', 1, 'releve', 'ABCDE-4100', 1, 'meso-contrats'],
    ['generateur.apprentissage/1', 2, 'releve', 'ABCDE-4100', 2, 'macro'],
  ]);
  assert.equal(enregistrements[0].precedent, null);
  assert.equal(enregistrements[1].precedent, createHash('sha256').update(lignes[0], 'utf8').digest('hex'));
  assert.match(noter('ABCDE-4100', [entree()], { demandes: o.demandes, date: D1 }).erreurs[0], /relevé de ABCDE-4100 clos/);
  assert.match(clore('ABCDE-4100', { demandes: o.demandes, registre: o.registre, date: D1 }).erreurs[0], /déjà clos/);
  assert.equal(lireRegistre(o.registre).lignes.length, 2, 'rien de plus au registre');
});

test('D8 : un même motif dans deux tickets devient une proposition, décidée par le développeur seul', () => {
  const o = projet();
  ticketClos(o, 'ABCDE-4100', [entree()], D1);
  assert.deepStrictEqual(proposer({ registre: o.registre, date: D1 }).nouvelles, [], 'un seul ticket : pas de récurrence');
  // Même motif, mais à une autre profondeur ou pour une autre cible : pas la même récurrence.
  ticketClos(o, 'ABCDE-4200', [entree({ profondeur: 'micro' }), entree({ cible: 'generateur' })], '2026-11-18T10:00:00Z');
  assert.deepStrictEqual(proposer({ registre: o.registre, date: D1 }).nouvelles, []);
  ticketClos(o, 'ABCDE-4300', [entree({ resume: 'un fichier entrant passe encore par service', preuve: { type: 'arbre', ref: 'ABCDE-4300-2' } })], '2026-11-19T10:00:00Z');
  const { nouvelles } = proposer({ registre: o.registre, date: '2026-11-19T11:00:00Z' });
  assert.deepStrictEqual(nouvelles.map((p) => [p.profondeur, p.cible, p.motif, p.tickets]), [['meso-contrats', 'referentiel', 'possibilite-batch', ['ABCDE-4100', 'ABCDE-4300']]]);
  assert.match(nouvelles[0].resume, /relevé dans 2 tickets \(ABCDE-4100, ABCDE-4300\) : un fichier entrant passe encore par service/);
  assert.deepStrictEqual(proposer({ registre: o.registre, date: D1 }).nouvelles, [], 'une proposition en attente ne se répète pas');
  const n = lireRegistre(o.registre).enregistrements.find((e) => e.type === 'proposition').n;
  // La décision appartient au développeur, nommé, avec sa raison ; une seule fois.
  assert.ok(decider(n, { decision: 'retenue', par: '', raison: 'x', registre: o.registre, date: D1 }).erreurs.some((e) => /--par/.test(e)));
  assert.ok(decider(n, { decision: 'retenue', par: 'Fred', raison: '', registre: o.registre, date: D1 }).erreurs.some((e) => /--raison/.test(e)));
  assert.ok(decider(n, { decision: 'peut-etre', par: 'Fred', raison: 'x', registre: o.registre, date: D1 }).erreurs.some((e) => /retenue ou refusee/.test(e)));
  assert.match(decider(1, { decision: 'retenue', par: 'Fred', raison: 'x', registre: o.registre, date: D1 }).erreurs[0], /n° 1 : pas une proposition/);
  assert.deepStrictEqual(decider(n, { decision: 'retenue', par: 'Fred', raison: 'ajouter une possibilité « batch » au référentiel', registre: o.registre, date: D1 }).erreurs, []);
  assert.match(decider(n, { decision: 'refusee', par: 'Fred', raison: 'x', registre: o.registre, date: D1 }).erreurs[0], /déjà décidée : retenue/);
  // Le script n'écrit que le relevé et le registre : ni référentiel, ni consigne, ni autre fichier.
  const fichiers = (dir) => readdirSync(dir, { recursive: true, withFileTypes: true }).filter((x) => x.isFile()).map((x) => join(x.parentPath ?? x.path, x.name).slice(o.p.length + 1).replace(/\\/g, '/')).sort();
  assert.deepStrictEqual(fichiers(o.p), ['docs/c7e/registre-apprentissage.jsonl', ...['ABCDE-4100', 'ABCDE-4200', 'ABCDE-4300'].flatMap((c) => [`docs/demandes/${c}/releve.json`, `docs/demandes/${c}/releve.md`])]);
});

test('D8 : deux refus mettent un motif en veille ; une proposition retenue ne se repropose pas', () => {
  const o = projet();
  const motif = (p) => entree({ motif: p, nature: 'categorie-inadaptee', resume: 'M01 retenu pour un ticket qui n\'est pas une transition eager vers lazy' });
  ticketClos(o, 'ABCDE-4100', [motif('categorie-m01-inadaptee'), motif('possibilite-export')], D1);
  ticketClos(o, 'ABCDE-4200', [motif('categorie-m01-inadaptee'), motif('possibilite-export')], D1);
  let nouvelles = proposer({ registre: o.registre, date: D1 }).nouvelles;
  assert.equal(nouvelles.length, 2);
  const numero = (m) => etatPropositions(o).filter((p) => p.motif === m).at(-1).n;
  decider(numero('categorie-m01-inadaptee'), { decision: 'refusee', par: 'Fred', raison: 'pas encore assez de cas', registre: o.registre, date: D1 });
  decider(numero('possibilite-export'), { decision: 'retenue', par: 'Fred', raison: 'à ajouter', registre: o.registre, date: D1 });
  assert.deepStrictEqual(proposer({ registre: o.registre, date: D1 }).nouvelles, [], 'refusée sans ticket nouveau, retenue : rien');
  ticketClos(o, 'ABCDE-4300', [motif('categorie-m01-inadaptee'), motif('possibilite-export')], D1);
  nouvelles = proposer({ registre: o.registre, date: D1 }).nouvelles;
  assert.deepStrictEqual(nouvelles.map((p) => [p.motif, p.tickets]), [['categorie-m01-inadaptee', ['ABCDE-4100', 'ABCDE-4200', 'ABCDE-4300']]], 'la refusée revient avec un ticket nouveau ; la retenue, jamais');
  decider(numero('categorie-m01-inadaptee'), { decision: 'refusee', par: 'Fred', raison: 'toujours non', registre: o.registre, date: D1 });
  ticketClos(o, 'ABCDE-4400', [motif('categorie-m01-inadaptee')], D1);
  assert.deepStrictEqual(recurrences(lireRegistre(o.registre).enregistrements), [], 'deux refus : en veille');
  const sortie = [];
  assert.equal(principal(['registre', 'etat', '--registre', o.registre], (l) => sortie.push(l)), 0);
  assert.ok(sortie.includes('  en veille : meso-contrats · referentiel · categorie-m01-inadaptee'), sortie.join('\n'));
});
const etatPropositions = (o) => lireRegistre(o.registre).enregistrements.filter((e) => e.type === 'proposition');

test('D8 : un registre altéré se signale, sans proposition ni versement', () => {
  const alterations = [
    ['ligne réécrite', (l) => { l[0] = l[0].replace('un job batch', 'un job'); }, /ligne 2 : empreinte du précédent fausse/],
    ['ligne supprimée', (l) => { l.splice(1, 1); }, /ligne 2 : numéro 3, attendu 2/],
    ['ligne illisible', (l) => { l[1] = '{'; }, /ligne 2 illisible/],
  ];
  for (const [nom, alterer, motif] of alterations) {
    const o = projet();
    ticketClos(o, 'ABCDE-4100', [entree(), entree({ motif: 'autre-motif' }), entree({ motif: 'troisieme' })], D1);
    const lignes = readFileSync(o.registre, 'utf8').trimEnd().split('\n');
    alterer(lignes);
    writeFileSync(o.registre, `${lignes.join('\n')}\n`);
    assert.ok(verifierRegistre(o.registre).some((e) => motif.test(e)), `${nom} : ${verifierRegistre(o.registre).join(' ; ')}`);
    const avant = readFileSync(o.registre, 'utf8');
    assert.match(proposer({ registre: o.registre, date: D1 }).erreurs[0], /registre altéré, .* aucune proposition/);
    noter('ABCDE-4200', [entree()], { demandes: o.demandes, date: D1 });
    assert.match(clore('ABCDE-4200', { demandes: o.demandes, registre: o.registre, date: D1 }).erreurs[0], /registre altéré/);
    assert.equal(lireReleve('ABCDE-4200', o.demandes).clos, false);
    assert.equal(readFileSync(o.registre, 'utf8'), avant, `${nom} : rien n'est écrit`);
    assert.equal(principal(['registre', 'verifier', '--registre', o.registre], () => {}, () => {}), 1);
  }
});

test('D8 : tendance par ticket et profondeur ; propositions pour le générateur en Markdown', () => {
  const o = projet();
  const cout = (p) => entree({ profondeur: 'macro', nature: 'cout', motif: 'cout-de-l-arbre', cible: 'generateur', resume: `${p} %`, preuve: { type: 'commande', ref: 'mesurer' } });
  const plan = entree({ profondeur: 'micro', nature: 'commit-hors-plan', motif: 'commit-hors-plan-libelles', cible: 'generateur', sens: 'remontee', resume: 'commit de libellés hors du plan', preuve: { type: 'commit', ref: 'abc123' } });
  ticketClos(o, 'ABCDE-4100', [cout(411), entree(), plan], D1);
  ticketClos(o, 'ABCDE-4200', [cout(290), plan], D1);
  assert.deepStrictEqual(tendance(lireRegistre(o.registre).enregistrements), [
    { cle: 'ABCDE-4100', macro: 0, 'meso-contrats': 1, 'meso-composants': 0, micro: 1, cout: '411 %' },
    { cle: 'ABCDE-4200', macro: 0, 'meso-contrats': 0, 'meso-composants': 0, micro: 1, cout: '290 %' },
  ]);
  proposer({ registre: o.registre, date: D1 });
  const sortie = [];
  assert.equal(principal(['registre', 'propositions', '--cible', 'generateur', '--registre', o.registre], (l) => sortie.push(l)), 0);
  assert.equal(sortie[0], '# Propositions d\'évolution (generateur)');
  assert.match(sortie.join('\n'), /- n° \d+, micro, `commit-hors-plan-libelles`, en attente — commit-hors-plan-libelles relevé dans 2 tickets/);
  assert.doesNotMatch(sortie.join('\n'), /cout-de-l-arbre/, 'le coût se suit en tendance : il ne devient pas une proposition');
});

test('D8 : ligne de commande, codes de sortie', () => {
  const o = projet({ champ: true });
  const lancer = (...a) => spawnSync(process.execPath, [OUTIL, ...a, '--demandes', o.demandes, '--registre', o.registre, '--date', D1], { cwd: o.p, encoding: 'utf8' });
  const n = lancer('noter', 'ABCDE-3620', '--profondeur', 'meso-contrats', '--nature', 'categorie-inadaptee', '--motif', 'categorie-m04', '--cible', 'referentiel', '--sens', 'descente', '--resume', 'essai', '--preuve', 'fichier:docs/demandes/ABCDE-3620/arbre/ABCDE-3620.toml');
  assert.equal(n.status, 0, n.stderr);
  assert.match(n.stdout, /noté dans le relevé de ABCDE-3620 : meso-contrats, categorie-inadaptee, categorie-m04/);
  const sansPreuve = lancer('noter', 'ABCDE-3620', '--profondeur', 'macro', '--nature', 'autre', '--motif', 'x', '--cible', 'generateur', '--sens', 'descente', '--resume', 'r');
  assert.equal(sansPreuve.status, 1);
  assert.match(sansPreuve.stderr, /^REFUS {2}entrée 1 : preuve absente/);
  const q = lancer('qualifier', 'ABCDE-3620', '--cout', '496', '--preuve', 'commande:mesurer-contexte.mjs mesurer');
  assert.equal(q.status, 0, q.stderr);
  const c = lancer('clore', 'ABCDE-3620', '--rattachement', join(o.p, 'absent.json'));
  assert.equal(c.status, 0, c.stderr);
  assert.match(c.stdout, /relevé de ABCDE-3620 clos : 3 entrées de remontée, 5 versées au registre/);
  assert.equal(lancer('registre', 'verifier').status, 0);
  assert.match(lancer('registre', 'tendance').stdout, /\| ABCDE-3620 \| 0 \| 1 \| 3 \| 0 \| somme des contextes de l'arbre : 496 % du point d'entrée de l'orchestrateur \|/);
  assert.match(lancer('registre', 'proposer').stdout, /aucune récurrence nouvelle/);
  const muet = () => {};
  for (const args of [[], ['noter'], ['inconnue', 'x'], ['registre'], ['registre', 'decider'], ['qualifier', 'ABCDE-1'], ['noter', 'ABCDE-1', '--motif']]) assert.equal(principal(args, muet, muet), 2, args.join(' '));
});

test('D8 : les arbres d\'exemple sont figés, empreinte par empreinte', () => {
  // Une recette qui ne passe plus se corrige dans le générateur, jamais en retouchant un exemple : changer
  // un exemple demande de changer aussi cette liste, et se voit.
  const FIGES = {
    'ABCDE-3512/ABCDE-3512.toml': '7a6a452a',
    'ABCDE-3620/ABCDE-3620.toml': '99f8d264',
    'ABCDE-3620/ABCDE-3620-1.toml': '7df42cef',
    'ABCDE-3620/ABCDE-3620-1.1.toml': '3dd01b85',
    'ABCDE-3620/ABCDE-3620-1.2.toml': 'e24620fb',
    'ABCDE-3620/ABCDE-3620-2.toml': 'c032f265',
  };
  const empreinte = (rel) => createHash('sha256').update(readFileSync(join(EXEMPLES, ...rel.split('/')), 'utf8').replace(/\r\n/g, '\n'), 'utf8').digest('hex').slice(0, 8);
  const presents = ['ABCDE-3512', 'ABCDE-3620'].flatMap((d) => readdirSync(join(EXEMPLES, d)).filter((f) => f.endsWith('.toml')).map((f) => `${d}/${f}`)).sort();
  assert.deepStrictEqual(presents, Object.keys(FIGES).sort(), 'aucun nœud ajouté ni retiré');
  assert.deepStrictEqual(Object.fromEntries(presents.map((r) => [r, empreinte(r)])), FIGES);
  for (const d of ['ABCDE-3512', 'ABCDE-3620']) assert.equal(existsSync(join(EXEMPLES, d, 'releve.json')), false, 'un exemple ne porte pas de relevé');
});
