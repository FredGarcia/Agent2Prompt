// Recette de l'export du binôme (observatoire 1.2.0, D7 ; socle-observation 1.2.0, section 6.5), sur des projets
// d'épreuve, dépôts Git temporaires, et des livrables d'Agent2Dev et des journaux de tests d'Agent2Test écrits pour
// l'épreuve, avec refus, dérogations et faux refus. Le sel est donné à l'outil, sauf pour l'épreuve du sel tiré ;
// la recette n'écrit ni dans le clone, ni dans le magasin de l'observatoire.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORMATS, SEL, exporter, lireSource, prefixer, principal } from '../outils/export-binome.mjs';
import { MAGASIN, controlerEnveloppe, inscrire, relever, repertoireGitCommun, sha256, verifierJournal } from '../outils/observatoire.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const SELS = { A: 'a'.repeat(64), B: 'b'.repeat(64) };
const J2D = 'docs/c7e/observations-agent2dev.jsonl';
const J2T = 'docs/c7e/observations-agent2test.jsonl';
const temporaire = (nom) => mkdtempSync(join(tmpdir(), `export-binome-${nom}-`));
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const sansCR = (texte) => texte.replace(/\r\n/g, '\n');
const lignes = (p, j) => (existsSync(join(p, j)) ? sansCR(readFileSync(join(p, j), 'utf8')).trim().split('\n').filter(Boolean) : []);
const enveloppes = (p, j) => lignes(p, j).map((l) => JSON.parse(l));
const texte = (p, j) => (existsSync(join(p, j)) ? readFileSync(join(p, j), 'utf8') : null);
const tete = (p, j) => JSON.parse(readFileSync(join(p, j.replace(/\.jsonl$/, '.tete')), 'utf8'));

/** Projet d'application d'épreuve : un dépôt Git vide. */
function projet(nom) {
  const p = temporaire(nom);
  git(p, 'init', '-q');
  return p;
}

const REFUS_DOCKER = { n: 2107, date: '2026-10-21T14:05:40Z', garde: 'commandes', objet: 'docker', regles: ['SA2.INV-1'], reponse: { decision: 'faux-refus', role: 'developpeur', n: 2109, date: '2026-10-21T14:07:02Z' } };
const REFUS_PERIMETRE = { n: 2110, date: '2026-10-21T14:10:00Z', garde: 'perimetre', objet: 'redemarrer-l-application', regles: ['D1.INV-5'], reponse: null };
const REFUS_ESSAI = { n: 2120, date: '2026-10-21T15:00:00Z', garde: 'commandes', objet: '--essai-derogeable', regles: ['D6.INV-2'], reponse: { decision: 'deroger', role: 'referent', n: 2121, date: '2026-10-21T15:01:00Z' } };

/** Livrable d'Agent2Dev d'une demande, avec sa rubrique acceptable si des refus l'ont touchée. */
function livrable(refus, { cle = 'ECR-77', version = '1.3.1' } = {}) {
  return {
    format: 'agent2dev.livrable/1',
    demande: { cle, titre: 'Export des retours d\'expérience en CSV, chez le client Dupont', source: 'e'.repeat(64) },
    versions: { specification: version, skill: 'agent-tdd-jira 1.3.7', transmission: 'f'.repeat(64), referentiel: 'R-4', constitution: 'c'.repeat(64) },
    autorisations: { ecritureCode: false, moteurExterne: true },
    arbre: { mode: 'normal', branche: `feature/${cle}-export-csv`, commitDepart: '0'.repeat(40) },
    scenarios: [],
    productions: [{ id: 'P-12', fiche: 'vert@1.0.0+agent-tdd-jira@1.3.7+L1', moteur: 'gemini', adaptateur: 'externe', empreintePrompt: 'd'.repeat(64), decision: 'DEC-118' }],
    ...(refus ? { acceptable: { socle: 'socle-acceptable', version: '1.0.1', refus } } : {}),
  };
}

/** Journal de tests d'Agent2Test d'une campagne, avec sa rubrique acceptable. */
function journalDeTests(refus, { campagne = 'C-20261021-001', cle = 'ECR-77', version = '1.5.1' } = {}) {
  return {
    format: 'agent2test.journal-de-tests/1',
    campagne,
    demande: { cle, texte: 'Export des retours d\'expérience en CSV' },
    versions: { specification: version, plan: 'P-14', referentiel: 'R-9', constitution: 'c'.repeat(64), sources: [], application: { commit: '1'.repeat(40), fichiersModifies: [] } },
    matrice: [],
    scenarios: [],
    decisions: [{ point: 'CP-3', cible: `${cle}-S04`, auteur: 'fred', canal: 'tableau-de-bord', date: '2026-10-21T10:40:00Z', decision: 'confirmer', commentaire: 'le bouton reste actif' }],
    desaccords: [],
    ...(refus ? { acceptable: { socle: 'socle-acceptable', version: '1.0.1', refus } } : {}),
  };
}

const REFUS_A2T = [
  { n: 812, date: '2026-10-21T10:02:14Z', garde: 'perimetre', objet: 'deployer', regles: ['SA1.INV-1', 'D1.INV-5'], reponse: { decision: 'faux-refus', role: 'referent-qualite', n: 815, date: '2026-10-21T10:05:00Z' } },
  { n: 820, date: '2026-10-21T10:20:00Z', garde: 'ecriture', objet: 'essai', regles: ['D1.INV-6'], reponse: { decision: 'deroger', role: 'testeur', n: 822, date: '2026-10-21T10:21:00Z' } },
];

/** Écrit des sources d'épreuve dans un dossier hors du projet, comme la sortie d'Agent2Dev et le projet d'Agent2Test. */
function sources(...contenus) {
  const d = temporaire('sources');
  return contenus.map((c, i) => {
    const chemin = join(d, `source-${i + 1}.json`);
    writeFileSync(chemin, `${JSON.stringify(c, null, 2)}\n`);
    return chemin;
  });
}

const sansErreur = (r) => {
  assert.deepStrictEqual(r.erreurs, [], r.erreurs.join(' ; '));
  return r;
};

test('D7 : la rubrique acceptable d\'un livrable et d\'un journal de tests devient des enveloppes conformes au socle, datées par la rubrique, au nom et à la version du système, sans rien modifier des sources', () => {
  const p = projet('application');
  const fichiers = sources(livrable([REFUS_DOCKER, REFUS_PERIMETRE, REFUS_ESSAI]), journalDeTests(REFUS_A2T));
  const avant = fichiers.map((f) => readFileSync(f, 'latin1'));
  const r = sansErreur(exporter({ projet: p, fichiers, sel: SELS.A }));
  assert.deepStrictEqual(r.journaux.map((j) => [j.journal, j.ajoutees, j.total]), [[J2D, 5, 5], [J2T, 4, 4]]);
  assert.deepStrictEqual(fichiers.map((f) => readFileSync(f, 'latin1')), avant, 'les sources ne sont que lues');

  const salee = (ref) => sha256(`${SELS.A}:${ref}`);
  const d = enveloppes(p, J2D);
  for (const x of [...d, ...enveloppes(p, J2T)]) assert.deepStrictEqual(controlerEnveloppe(x), [], JSON.stringify(x));
  assert.deepStrictEqual(d.map((x) => [x.numero, x.type, x.nature, x.motif, x.ordre, x.niveau, x.sujet, x.invariant, x.source.numero, x.date, x.decision ?? null]), [
    [1, 'refus', 'commandes', 'refus-commandes', 'OC1', 'N1', 'agent:agent2dev', 'socle-acceptable:SA2.INV-1', 2107, '2026-10-21T14:05:40Z', null],
    [2, 'decision', 'faux-refus', 'refus-commandes', 'OC1', 'humain', 'developpeur', 'socle-acceptable:SA2.INV-1', 2109, '2026-10-21T14:07:02Z', { valeur: 'refusee', vise: 1 }],
    [3, 'refus', 'perimetre', 'refus-perimetre', 'OC1', 'N1', 'agent:agent2dev', 'agent2dev:D1.INV-5', 2110, '2026-10-21T14:10:00Z', null],
    [4, 'refus', 'commandes', 'refus-commandes', 'OC1', 'N1', 'agent:agent2dev', 'agent2dev:D6.INV-2', 2120, '2026-10-21T15:00:00Z', null],
    [5, 'derogation', 'derogation', 'refus-commandes', 'OC1', 'humain', 'referent', 'agent2dev:D6.INV-2', 2121, '2026-10-21T15:01:00Z', { valeur: 'amendee', vise: 4 }],
  ]);
  for (const x of d) {
    assert.deepStrictEqual([x.systeme, x.instance, x.cible, x.source.format, x.source.journal, x.ancre], [{ nom: 'agent2dev', version: '1.3.1' }, sha256(SELS.A), 'specification', 'agent2dev.livrable/1', salee('ECR-77'), { nature: 'ticket', ref: salee('ECR-77') }]);
  }
  const t = enveloppes(p, J2T);
  assert.deepStrictEqual(t.map((x) => [x.type, x.sujet, x.invariant, x.source.journal, x.ancre.ref, x.systeme.version, x.decision ?? null]), [
    ['refus', 'agent:agent2test', 'socle-acceptable:SA1.INV-1', salee('C-20261021-001'), salee('ECR-77'), '1.5.1', null],
    ['decision', 'referent', 'socle-acceptable:SA1.INV-1', salee('C-20261021-001'), salee('ECR-77'), '1.5.1', { valeur: 'refusee', vise: 1 }],
    ['refus', 'agent:agent2test', 'agent2test:D1.INV-6', salee('C-20261021-001'), salee('ECR-77'), '1.5.1', null],
    ['derogation', 'testeur', 'agent2test:D1.INV-6', salee('C-20261021-001'), salee('ECR-77'), '1.5.1', { valeur: 'amendee', vise: 3 }],
  ], 'le référent qualité devient referent, le testeur testeur ; la règle du noyau d\'abord, préfixée');
  assert.deepStrictEqual([prefixer('D1.INV-5', 'agent2test'), prefixer('agent-tdd-jira:D5.INV-1', 'agent2dev'), prefixer('SC2.INV-1', 'agent2dev'), prefixer('budget.tentativesPas', 'agent2dev')], ['agent2test:D1.INV-5', 'agent-tdd-jira:D5.INV-1', 'socle-back-front:SC2.INV-1', null]);

  // Rejoué : rien de nouveau ; la même entrée sous le même sel, dans un autre projet : les mêmes octets.
  const journaux = [texte(p, J2D), texte(p, J2T)];
  const deux = sansErreur(exporter({ projet: p, fichiers, sel: SELS.A }));
  assert.deepStrictEqual(deux.journaux.map((j) => j.ajoutees), [0, 0]);
  assert.deepStrictEqual([texte(p, J2D), texte(p, J2T)], journaux);
  const q = projet('copie');
  sansErreur(exporter({ projet: q, fichiers: [...fichiers].reverse(), sel: SELS.A }));
  assert.deepStrictEqual([texte(q, J2D), texte(q, J2T)], journaux, 'octet pour octet, quel que soit l\'ordre des fichiers désignés');
  // Deux livrables d'Agent2Dev, deux refus à la même date : la clé de la demande la plus petite passe d'abord.
  const memeDate = sources(livrable([{ ...REFUS_PERIMETRE, n: 900, date: REFUS_DOCKER.date }], { cle: 'ECR-78' }), livrable([REFUS_DOCKER], { cle: 'ECR-79' }));
  const [r1, r2] = [projet('egalite-1'), projet('egalite-2')];
  sansErreur(exporter({ projet: r1, fichiers: memeDate, sel: SELS.A }));
  sansErreur(exporter({ projet: r2, fichiers: [...memeDate].reverse(), sel: SELS.A }));
  assert.equal(texte(r1, J2D), texte(r2, J2D));
  assert.deepStrictEqual(enveloppes(r1, J2D).map((x) => x.source.numero), [900, 2107, 2109], 'ECR-78 avant ECR-79, à date égale');
  const autre = projet('autre-sel');
  sansErreur(exporter({ projet: autre, fichiers, sel: SELS.B }));
  assert.notEqual(texte(autre, J2D), journaux[0], 'un autre sel, une autre instance');

  // Une source sans rubrique : aucun refus, rien à exporter.
  const vide = sansErreur(exporter({ projet: projet('sans-refus'), fichiers: sources(livrable(null)), sel: SELS.A }));
  assert.deepStrictEqual(vide.journaux.map((j) => [j.ajoutees, j.total]), [[0, 0]]);
});

test('D7 : l\'export écrit un journal par système, en ajout seul et chaîné, sous le sel de l\'instance ; une réponse venue plus tard s\'ajoute et vise son refus ; une rubrique réécrite, un journal altéré ou un sel étranger arrêtent l\'export sans rien écrire', () => {
  const p = projet('application');
  const provisoire = { ...REFUS_DOCKER, reponse: null };
  sansErreur(exporter({ projet: p, fichiers: sources(livrable([provisoire])), sel: SELS.A }));
  assert.equal(lignes(p, J2D).length, 1);
  const fichier = sources(livrable([REFUS_DOCKER]))[0];
  sansErreur(exporter({ projet: p, fichiers: [fichier], sel: SELS.A }));
  const xs = enveloppes(p, J2D);
  assert.deepStrictEqual(xs.map((x) => [x.type, x.decision?.vise ?? null]), [['refus', null], ['decision', 1]], 'la réponse venue après l\'export de son refus le vise');
  assert.deepStrictEqual(verifierJournal(lignes(p, J2D), tete(p, J2D)).erreurs, []);
  assert.deepStrictEqual(tete(p, J2D), { schema: 'socle-observation.enveloppe/1', numero: 2, empreinte: sha256(lignes(p, J2D)[1]) });

  // Une source plus ancienne, exportée après : sa date est bornée par la dernière ligne, et le journal reste dans l'ordre.
  const ancienne = { ...REFUS_PERIMETRE, n: 1801, date: '2026-10-20T09:00:00Z' };
  sansErreur(exporter({ projet: p, fichiers: sources(livrable([ancienne], { cle: 'ECR-70' })), sel: SELS.A }));
  assert.equal(enveloppes(p, J2D)[2].date, REFUS_DOCKER.reponse.date);

  const intact = texte(p, J2D);
  const refuse = (fichiers, motif, options = {}) => {
    const r = exporter({ projet: p, fichiers, sel: SELS.A, ...options });
    assert.ok(r.erreurs.length > 0 && r.erreurs.some((e) => motif.test(e)), `${motif} : ${r.erreurs.join(' ; ')}`);
    assert.equal(texte(p, J2D), intact, 'rien n\'est écrit');
  };
  refuse(sources(livrable([{ ...REFUS_DOCKER, garde: 'perimetre' }])), /^rubrique réécrite, .* l'enregistrement 2107 a changé depuis son export/);
  refuse(sources(livrable([{ ...REFUS_DOCKER, regles: ['D6.INV-2'] }])), /l'enregistrement 2107 a changé depuis son export/);
  refuse(sources(livrable([REFUS_PERIMETRE])), /l'enregistrement 2107, exporté, n'est plus dans sa rubrique/);
  refuse(sources(livrable([REFUS_DOCKER]), livrable([REFUS_PERIMETRE])), /même demande\.cle que .* : une source par demande ou par campagne/);
  refuse(sources(livrable([{ ...REFUS_DOCKER, garde: 'reseau' }], { cle: 'ECR-80' })), /garde « reseau », hors de la liste/);
  refuse(sources(journalDeTests([{ ...REFUS_A2T[0], garde: 'commandes' }])), /garde « commandes », hors de la liste : perimetre, ecriture, lecons/);
  refuse(sources(livrable([{ ...REFUS_DOCKER, n: 3000, regles: [] }], { cle: 'ECR-80' })), /regles, la liste des règles citées/);
  refuse(sources(livrable([{ ...REFUS_DOCKER, n: 3000, reponse: { ...REFUS_DOCKER.reponse, role: 'fred' } }], { cle: 'ECR-80' })), /réponse mal formée/);
  refuse(sources(livrable([{ ...REFUS_DOCKER, n: 3000, reponse: { ...REFUS_DOCKER.reponse, n: 2999 } }], { cle: 'ECR-80' })), /postérieure au refus/);
  refuse(sources(livrable([{ ...REFUS_DOCKER, n: 3000, date: '2026-10-21' }], { cle: 'ECR-80' })), /date, AAAA-MM-JJTHH:MM:SSZ/);
  refuse(sources(livrable([REFUS_DOCKER], { version: '1.3' })), /versions\.specification/);
  refuse(sources({ format: 'agent2dev.livrable/2' }), /format « agent2dev\.livrable\/2 »/);
  refuse([join(temporaire('illisible'), 'absent.json')], /JSON illisible/);
  refuse(sources(livrable([REFUS_DOCKER], { cle: 'ECR-81' })), /le sel de ce clone n'est pas celui de l'instance du journal docs\/c7e\/observations-agent2dev\.jsonl/, { sel: SELS.B });
  refuse(sources(livrable([REFUS_DOCKER], { cle: 'ECR-81' })), /sel de l'instance absent de <git-common-dir>\/agent2prompt\/sel alors que docs\/c7e\/observations-agent2dev\.jsonl existe/, { sel: undefined });

  // Un journal altéré à la main.
  const altere = intact.replace('"refus-commandes"', '"refus-perimetre"');
  writeFileSync(join(p, J2D), altere);
  const r = exporter({ projet: p, fichiers: sources(livrable([REFUS_ESSAI], { cle: 'ECR-90' })), sel: SELS.A });
  assert.ok(r.erreurs.some((e) => /^docs\/c7e\/observations-agent2dev\.jsonl altéré, ligne 2 : empreinte du précédent fausse, la ligne 1 a été réécrite.* : rien n'est exporté$/.test(e)), r.erreurs.join(' ; '));
  assert.equal(texte(p, J2D), altere);
  writeFileSync(join(p, J2D), intact);

  // Hors d'un dépôt Git, aucun sel : rien n'est écrit.
  const horsGit = temporaire('hors-git');
  assert.match(exporter({ projet: horsGit, fichiers: sources(livrable([REFUS_DOCKER])), sel: SELS.A }).erreurs[0], /n'est pas dans un dépôt Git/);
  assert.equal(existsSync(join(horsGit, 'docs')), false);
});

test('D7 : aucune enveloppe ne porte l\'objet refusé, le motif d\'une réponse, la clé d\'une demande ni le nom d\'une personne ; l\'outil n\'écrit rien dans le magasin de l\'observatoire, et le sel ne s\'affiche pas', () => {
  const p = projet('application');
  const fichiers = sources(livrable([REFUS_DOCKER, REFUS_PERIMETRE, REFUS_ESSAI]), journalDeTests(REFUS_A2T));
  const sortie = [];
  const erreur = [];
  assert.equal(principal(['exporter', '--projet', p, ...fichiers], (l) => sortie.push(l), (l) => erreur.push(l)), 0, erreur.join('\n'));
  assert.match(sortie[0], /^sel de l'instance tiré et gardé dans <git-common-dir>\/agent2prompt\/sel, hors de l'arbre de travail/);
  assert.deepStrictEqual(sortie.slice(1), [
    `5 enveloppes ajoutées à ${J2D}, 5 en tout ; à versionner avec docs/c7e/observations-agent2dev.tete`,
    `4 enveloppes ajoutées à ${J2T}, 4 en tout ; à versionner avec docs/c7e/observations-agent2test.tete`,
  ]);
  const commun = repertoireGitCommun(p);
  const sel = readFileSync(join(commun, SEL), 'utf8').trim();
  assert.match(sel, /^[0-9a-f]{64}$/);
  if (process.platform !== 'win32') assert.equal(statSync(join(commun, SEL)).mode & 0o777, 0o600, 'le sel n\'est lisible que par son propriétaire');
  assert.deepStrictEqual(readdirSync(join(commun, 'agent2prompt')), ['sel'], 'le sel, rien d\'autre : aucun magasin d\'observatoire dans le projet');
  assert.equal(existsSync(join(commun, MAGASIN)), false);
  assert.deepStrictEqual(git(p, 'status', '--porcelain', '--untracked-files=all').split('\n').map((l) => l.slice(3)).sort(), [J2D, 'docs/c7e/observations-agent2dev.tete', J2T, 'docs/c7e/observations-agent2test.tete'].sort(), 'le sel n\'est pas dans l\'arbre de travail');

  const enClair = ['docker', 'essai-derogeable', 'redemarrer', 'deployer', 'ECR-77', 'C-20261021-001', 'Dupont', 'fred', 'feature/', 'gemini', 'referent-qualite', 'DEC-118', sel];
  for (const j of [J2D, J2T]) {
    const t = texte(p, j);
    for (const v of enClair) assert.ok(!t.includes(v), `${j} : « ${v} » en clair`);
  }
  assert.ok(![...sortie, ...erreur].join('\n').includes(sel), 'le sel ne s\'affiche pas');

  // Le projet s'inscrit dans un observatoire, qui relève ses deux journaux.
  const lieux = { magasin: join(temporaire('magasin'), MAGASIN) };
  assert.deepStrictEqual(inscrire(p, lieux).erreurs, []);
  const releve = relever(lieux);
  assert.deepStrictEqual([releve.erreurs, releve.releves.map((x) => [x.journal, x.ajoutees])], [[], [[J2D, 5], [J2T, 4]]]);

  // Lignes de commande.
  const lancer = (...argv) => {
    const s = [];
    const e = [];
    const code = principal(argv, (l) => s.push(l), (l) => e.push(l));
    return { code, sortie: s.join('\n'), erreur: e.join('\n') };
  };
  assert.equal(lancer('exporter', '--projet', p).code, 2, 'aucun fichier désigné');
  assert.equal(lancer('exporter', '--json', ...fichiers).code, 2);
  assert.equal(lancer('verifier', fichiers[0]).code, 2);
  assert.equal(lancer('publier').code, 2);
  assert.match(lancer('exporter', '--projet', p, ...fichiers).sortie, /^aucun enregistrement nouveau : docs\/c7e\/observations-agent2dev\.jsonl inchangé, 5 enveloppes$/m);
  assert.deepStrictEqual(lancer('verifier', '--projet', p), { code: 0, sortie: `journaux du binôme intacts : ${J2D}, ${J2T}, au schéma socle-observation.enveloppe/1, chaîne et tête intactes`, erreur: '' });
  const e = JSON.parse(lancer('etat', '--projet', p, '--json').sortie);
  assert.deepStrictEqual(e.journaux.map((j) => [j.systeme, j.enveloppes, j.parType]), [['agent2dev', 5, { decision: 1, derogation: 1, refus: 3 }], ['agent2test', 4, { decision: 1, derogation: 1, refus: 2 }]]);
  writeFileSync(join(p, J2T), texte(p, J2T).replace('"testeur"', '"developpeur"'));
  assert.equal(lancer('verifier', '--projet', p).code, 1);
  assert.equal(lancer('exporter', '--projet', p, ...fichiers).code, 1);
  const processus = spawnSync(process.execPath, [join(ICI, '..', 'outils', 'export-binome.mjs'), 'publier'], { encoding: 'utf8' });
  assert.deepStrictEqual([processus.status, processus.stdout], [2, ''], 'en processus : usage incorrect, rien d\'écrit');

  // Les formats et leurs journaux : un par système.
  assert.deepStrictEqual(Object.entries(FORMATS).map(([format, f]) => [format, f.systeme, f.journal]), [['agent2dev.livrable/1', 'agent2dev', J2D], ['agent2test.journal-de-tests/1', 'agent2test', J2T]]);
  assert.deepStrictEqual(lireSource(fichiers[0]).source.enregistrements.map((x) => [x.sorte, x.n]), [['refus', 2107], ['reponse', 2109], ['refus', 2110], ['refus', 2120], ['reponse', 2121]]);
});
