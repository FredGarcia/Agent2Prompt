// Recette de l'export de l'orchestrateur vers le socle d'observation (orchestrateur-c7e 3.7.0, D12 ; socle-observation
// 1.2.0, SO1 à SO4), sur un projet d'épreuve dont la recette construit l'historique Git : installation avec le
// registre de départ, une entrée proposée par un commit de second ordre, des écarts inscrits, une revue qui promeut,
// propose et retire. Les dates des commits sont fixées : deux projets construits de même donnent le même journal.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembler, sourcePartagee } from '../../../tools/bundle.mjs';
import { exporter as exporterGenerateur } from '../../generateur-skill-ticket/outils/observation.mjs';
import {
  CHAMPS_ENVELOPPE, JOURNAL, REQUIS_ENVELOPPE, SEL, TETE, conceptsDeDepart, controlerEnveloppe, empreinteSalee, exporter, lireJournal, principal, repertoireGitCommun, sha256, traduireConcept, verifierJournal,
} from '../outils/observation.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const SPEC = join(ICI, '..');
const RACINE = join(SPEC, '..', '..');
const lire = (chemin) => readFileSync(chemin, 'utf8').replace(/\r\n/g, '\n');
const MANIFESTE = JSON.parse(lire(join(SPEC, 'manifest.json')));
const ENTREE = lire(join(SPEC, 'SKILL.md'));
const DEPART = JSON.parse(/Registre de départ[\s\S]*?```json\n([\s\S]*?)\n```/.exec(ENTREE)[1]);
const MODELE = /```markdown\n(# Registre des écarts[\s\S]*?)\n```/.exec(lire(join(SPEC, 'meso-contrats.md')))[1];
const SEL_EPREUVE = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';
const RELECTEUR = 'Jean Dupont';

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const temporaire = (nom) => mkdtempSync(join(tmpdir(), `orchestrateur-${nom}-`));

function depot() {
  const p = temporaire('projet');
  git(p, 'init', '-q');
  git(p, 'symbolic-ref', 'HEAD', 'refs/heads/main');
  for (const [k, v] of [['user.name', 'Epreuve'], ['user.email', 'epreuve@exemple.invalid'], ['commit.gpgsign', 'false'], ['core.autocrlf', 'false']]) git(p, 'config', k, v);
  return p;
}

const dateDe = (date) => ({ ...process.env, GIT_AUTHOR_DATE: `${date} +0000`, GIT_COMMITTER_DATE: `${date} +0000` });

/**
 * Un commit daté, avec ses seuls fichiers : chemin → contenu, ou null pour le supprimer. Le journal d'enveloppes et
 * sa tête restent hors des commits, comme avant que le développeur les versionne.
 */
function commit(p, message, date, fichiers) {
  for (const [chemin, contenu] of Object.entries(fichiers)) {
    if (contenu === null) rmSync(join(p, chemin));
    else {
      mkdirSync(dirname(join(p, chemin)), { recursive: true });
      writeFileSync(join(p, chemin), contenu);
    }
  }
  execFileSync('git', ['add', '-A', '--', ...Object.keys(fichiers)], { cwd: p });
  execFileSync('git', ['commit', '-q', '-F', '-'], { cwd: p, env: dateDe(date), input: message, stdio: ['pipe', 'pipe', 'ignore'] });
}

/** Fusion d'une branche dans la branche courante, par un commit de fusion daté. */
function fusion(p, branche, date) {
  execFileSync('git', ['merge', '-q', '--no-ff', '-m', `Merge branch ${branche}`, branche], { cwd: p, env: dateDe(date), stdio: ['ignore', 'pipe', 'ignore'] });
}

const concepts = (...entrees) => `${JSON.stringify({ schemaVersion: 1, concepts: entrees }, null, 2)}\n`;
const entree = (id, status) => ({ ...DEPART.concepts[0], id, name: `Concept ${id}`, status });
const avecDepart = (...autres) => concepts(...DEPART.concepts, ...autres);
const sansPedagogie = (...autres) => concepts(...DEPART.concepts.filter((c) => c.id !== 'C_PEDAGOGIE_001'), ...autres);
const ecarts = (...lignes) => `${MODELE}\n${lignes.map((l) => `| ${l.join(' | ')} |`).join('\n')}\n`;
const LIGNES = [
  ['2026-11-04', 'ABCDE-3512', 'java:D4.INV-1, changeset appliqué', 'changeset appliqué modifié en place', 'respecter : un nouveau changeset'],
  ['2026-11-04', 'ABCDE-3512', 'meso-contrats, § 1, rollback', 'changeset sans rollback, chez le client Dupont', `dérogation validée par ${RELECTEUR}`],
  ['2026-11-04', 'ABCDE-3512', 'D8.INV-2', 'contradiction entre le fichier d\'invariants et le socle', ''],
];
const LIGNE_3_DECIDEE = [...LIGNES[2].slice(0, 4), 'respecter : le socle l\'emporte'];

/** Le projet d'épreuve, commit par commit ; `jusqua` arrête l'historique après ce commit. */
function projet({ jusqua = 5 } = {}) {
  const p = depot();
  const etapes = [
    () => commit(p, 'ABCDE-3500 : [É0-C7E] chore(c7e): installer l\'orchestrateur', '2026-11-02 09:00:00', { 'docs/c7e/concepts.json': avecDepart(), 'docs/c7e/registre-ecarts.md': `${MODELE}\n` }),
    () => commit(p, 'ABCDE-3512 : [É7-C7E] docs(c7e): proposer l\'évaluation d\'un index pour toute colonne filtrée', '2026-11-03 10:00:00', { 'docs/c7e/concepts.json': avecDepart(entree('C_PERFORMANCE_001', 'proposed')) }),
    () => commit(p, 'ABCDE-3512 : [É6-TEST] docs(c7e): inscrire les écarts', '2026-11-04 11:00:00', { 'docs/c7e/registre-ecarts.md': ecarts(...LIGNES) }),
    () => commit(p, 'Revue du registre des concepts', '2026-11-05 09:00:00', { 'docs/c7e/concepts.json': avecDepart(entree('C_PERFORMANCE_001', 'experimental'), entree('C_SECURITE_001', 'proposed')) }),
    () => commit(p, 'Revue : retraits, et l\'écart arbitré', '2026-11-06 09:00:00', { 'docs/c7e/concepts.json': sansPedagogie(entree('C_PERFORMANCE_001', 'experimental')), 'docs/c7e/registre-ecarts.md': ecarts(LIGNES[0], LIGNES[1], LIGNE_3_DECIDEE) }),
  ];
  etapes.slice(0, jusqua).forEach((f) => f());
  return p;
}

/** Fichiers sous `racine`, chemin relatif → empreinte ; `sauf` : chemins relatifs écartés. */
function inventaire(racine, { sauf = [] } = {}) {
  const res = {};
  const parcourir = (dossier) => {
    for (const d of readdirSync(dossier, { withFileTypes: true })) {
      const chemin = join(dossier, d.name);
      const rel = relative(racine, chemin).split(sep).join('/');
      if (sauf.some((s) => rel === s || rel.startsWith(`${s}/`))) continue;
      if (d.isDirectory()) parcourir(chemin);
      else res[rel] = sha256(readFileSync(chemin, 'latin1'));
    }
  };
  parcourir(racine);
  return res;
}

function lancer(...argv) {
  const sortie = [];
  const erreur = [];
  const code = principal(argv, (l) => sortie.push(l), (l) => erreur.push(l));
  return { code, sortie: sortie.join('\n'), erreur: erreur.join('\n') };
}

const enveloppes = (p) => lireJournal(p).enveloppes;
const texteDe = (p, rel) => lire(join(p, rel));

// ---- D12 : l'export de l'orchestrateur ----

test('D12 : l\'export lit les deux registres et leur historique sans rien modifier, et n\'écrit que le journal de l\'orchestrateur, sa tête et le sel', () => {
  const p = projet();
  const avant = inventaire(p, { sauf: ['.git'] });
  const tete = git(p, 'rev-parse', 'HEAD');
  const r = lancer('exporter', '--projet', p);
  assert.equal(r.code, 0, r.erreur);
  const apres = inventaire(p, { sauf: ['.git'] });
  assert.deepStrictEqual(Object.keys(apres).filter((k) => !(k in avant)).sort(), [JOURNAL, TETE].sort());
  for (const [k, v] of Object.entries(avant)) assert.equal(apres[k], v, `${k} inchangé`);
  assert.equal(git(p, 'rev-parse', 'HEAD'), tete, 'aucun commit');
  assert.deepStrictEqual(git(p, 'status', '--porcelain').split('\n').sort(), [`?? ${JOURNAL}`, `?? ${TETE}`].sort(), 'le développeur versionne le journal et sa tête');
  assert.deepStrictEqual(readdirSync(join(p, '.git', 'agent2prompt')), ['sel']);
  const xs = enveloppes(p);
  assert.equal(xs.length, 8, 'cinq événements du registre des concepts, trois lignes décidées des écarts');
  for (const x of xs) assert.deepStrictEqual(x.systeme, { nom: 'orchestrateur-c7e', version: MANIFESTE.version });
});

test('D12 : une instance, une identité : le générateur et l\'orchestrateur d\'un projet ont le même sel ; sans lui, tout journal du projet arrête l\'export', () => {
  const p = projet();
  mkdirSync(join(p, 'docs', 'demandes'), { recursive: true });
  cpExemple(p);
  assert.deepStrictEqual(exporterGenerateur({ projet: p }).erreurs, [], 'le générateur exporte d\'abord, et tire le sel');
  assert.equal(lancer('exporter', '--projet', p).code, 0);
  const instanceGenerateur = lireJournal(p, 'docs/c7e/observations.jsonl').enveloppes[0].instance;
  assert.ok(enveloppes(p).every((x) => x.instance === instanceGenerateur), 'les deux journaux portent la même instance');

  const q = projet();
  cpExemple(q);
  assert.deepStrictEqual(exporterGenerateur({ projet: q }).erreurs, []);
  rmSync(join(repertoireGitCommun(q), SEL));
  const r = lancer('exporter', '--projet', q);
  assert.equal(r.code, 1);
  assert.match(r.erreur, /sel de l'instance absent de <git-common-dir>\/agent2prompt\/sel alors que docs\/c7e\/observations\.jsonl existe/);
  assert.equal(existsSync(join(q, JOURNAL)), false);

  const s = projet();
  cpExemple(s);
  assert.deepStrictEqual(exporterGenerateur({ projet: s }).erreurs, []);
  writeFileSync(join(repertoireGitCommun(s), SEL), `${'f'.repeat(64)}\n`);
  const r2 = lancer('exporter', '--projet', s);
  assert.equal(r2.code, 1);
  assert.match(r2.erreur, /le sel de ce clone n'est pas celui de l'instance du journal docs\/c7e\/observations\.jsonl/);
  assert.equal(existsSync(join(s, JOURNAL)), false);

  const horsGit = temporaire('hors-git');
  assert.match(exporter({ projet: horsGit, sel: SEL_EPREUVE }).erreurs[0], /n'est pas dans un dépôt Git : l'export de l'orchestrateur lit l'historique du projet/);
});

function cpExemple(p) {
  const source = join(RACINE, 'specs', 'generateur-skill-ticket', 'exemples', 'ABCDE-3620-champ', 'docs', 'demandes', 'ABCDE-3620');
  const cible = join(p, 'docs', 'demandes', 'ABCDE-3620');
  mkdirSync(cible, { recursive: true });
  for (const nom of readdirSync(source)) writeFileSync(join(cible, nom), readFileSync(join(source, nom)));
}

test('D12 : l\'export est incrémental et idempotent ; une ligne d\'écart ou un historique réécrits depuis l\'export l\'arrêtent', () => {
  const p = projet({ jusqua: 4 });
  const r1 = exporter({ projet: p, sel: SEL_EPREUVE });
  assert.deepStrictEqual([r1.erreurs, r1.ajoutees], [[], 5], 'trois événements du registre des concepts et deux lignes décidées ; la troisième attend');
  const [journal, tete] = [texteDe(p, JOURNAL), texteDe(p, TETE)];
  const r1b = exporter({ projet: p, sel: SEL_EPREUVE });
  assert.deepStrictEqual([r1b.erreurs, r1b.ajoutees, texteDe(p, JOURNAL), texteDe(p, TETE)], [[], 0, journal, tete], 'rien de nouveau : journal et tête identiques, octet pour octet');
  commit(p, 'Revue : retraits, et l\'écart arbitré', '2026-11-06 09:00:00', { 'docs/c7e/concepts.json': sansPedagogie(entree('C_PERFORMANCE_001', 'experimental')), 'docs/c7e/registre-ecarts.md': ecarts(LIGNES[0], LIGNES[1], LIGNE_3_DECIDEE) });
  const r2 = exporter({ projet: p, sel: SEL_EPREUVE });
  assert.deepStrictEqual([r2.erreurs, r2.ajoutees, r2.total], [[], 3, 8]);
  assert.ok(texteDe(p, JOURNAL).startsWith(journal), 'les lignes déjà écrites restent');
  const ligne3 = enveloppes(p).find((x) => x.source.format === 'orchestrateur.ecarts/1' && x.source.numero === 3);
  assert.deepStrictEqual([ligne3.numero, ligne3.date], [6, '2026-11-05T09:00:00Z'], 'une ligne décidée après d\'autres enveloppes, plus récentes, prend la date de la dernière');
  assert.deepStrictEqual(enveloppes(p).at(-1).decision, { valeur: 'refusee', vise: 5 }, 'un retrait vise la proposition, exportée avant lui');
  assert.deepStrictEqual(verifierJournal(p, { sel: SEL_EPREUVE }), []);

  const complet = texteDe(p, JOURNAL);
  commit(p, 'Correction d\'une décision', '2026-11-07 09:00:00', { 'docs/c7e/registre-ecarts.md': ecarts([...LIGNES[0].slice(0, 4), `dérogation validée par ${RELECTEUR}`], LIGNES[1], LIGNE_3_DECIDEE) });
  const r3 = exporter({ projet: p, sel: SEL_EPREUVE });
  assert.ok(r3.erreurs.some((e) => /^docs\/c7e\/registre-ecarts\.md réécrit : la ligne 1 a changé depuis son export, ou n'est plus décidée : rien n'est exporté ; rétablis-la telle qu'elle a été exportée/.test(e)), r3.erreurs.join(' ; '));
  assert.equal(texteDe(p, JOURNAL), complet);

  git(p, 'reset', '-q', '--hard', 'HEAD~2');
  commit(p, 'Revue : promotion', '2026-11-06 09:00:00', { 'docs/c7e/concepts.json': avecDepart(entree('C_PERFORMANCE_001', 'validated')) });
  const r4 = exporter({ projet: p, sel: SEL_EPREUVE });
  assert.ok(r4.erreurs.includes('historique de docs/c7e/concepts.json réécrit, ou export lancé depuis une autre branche que celle de l\'intégration : l\'événement 4 n\'est plus celui qui a été exporté : rien n\'est exporté'), r4.erreurs.join(' ; '));
  assert.equal(texteDe(p, JOURNAL), complet);
});

test('D12 : une ligne sans décision, ou une dérogation sans le nom qui la valide, attend, et la ligne d\'exemple du modèle ne sort jamais', () => {
  const p = projet({ jusqua: 2 });
  commit(p, 'Écarts en attente', '2026-11-04 11:00:00', {
    'docs/c7e/registre-ecarts.md': ecarts(
      LIGNES[2],
      ['2026-11-04', 'ABCDE-3512', 'SC1.INV-1', 'liste sans pagination', 'dérogation'],
      ['2026-11-04', 'ABCDE-3512', 'D6.INV-1', 'commit de rétroaction sans observation', 'à voir avec le référent'],
      ['2026-11-04', 'ABCDE-3513', 'socle-back-front:SC2.INV-1', 'contrat changé \\| sans version', 'respecter : une version 2 de l\'API'],
      ['2026-11-04', 'ABCDE-3514', 'java:D99.INV-1', 'règle de la revue d\'architecture', 'respecter : la règle s\'applique'],
    ),
  });
  assert.deepStrictEqual(exporter({ projet: p, sel: SEL_EPREUVE }).erreurs, []);
  const xs = enveloppes(p).filter((x) => x.source.format === 'orchestrateur.ecarts/1');
  assert.deepStrictEqual(xs.map((x) => [x.source.numero, x.type, x.motif, x.invariant]), [
    [4, 'ecart', 'ecart-socle-back-front-sc2-inv-1', 'socle-back-front:SC2.INV-1'],
    [5, 'ecart', 'ecart-invariant-projet', undefined],
  ], 'la quatrième ligne, après celle d\'exemple, et la cinquième, dont l\'invariant n\'est défini nulle part dans le dépôt : il reste dans l\'instance');
  const e = lancer('etat', '--projet', p);
  assert.match(e.sortie, /^en attente d'export : inconnu, sans le sel de l'instance$/m, 'sans le sel, l\'état ne compte pas les enregistrements en attente');
});

test('D12 : ligne de commande, codes de sortie', () => {
  const p = projet();
  assert.equal(lancer('exporter', '--projet', p).code, 0);
  const e = lancer('etat', '--projet', p);
  assert.equal(e.code, 0, e.erreur);
  assert.match(e.sortie, /^docs\/c7e\/observations-orchestrateur-c7e\.jsonl : 8 enveloppes, la dernière datée 2026-11-06T09:00:00Z$/m);
  assert.match(e.sortie, /par ordre et niveau : OC1 N1 2 · OC1 humain 1 · OC2 N2 1 · OC2 humain 4$/m);
  assert.match(e.sortie, /^en attente d'export : 0$/m);
  assert.match(lancer('verifier', '--projet', p).sortie, /^journal intact : 8 enveloppes/);
  assert.equal(lancer('exporter', '--inconnu').code, 2);
  assert.equal(lancer('exporter', '--projet', p, '--sel', SEL_EPREUVE).code, 2, 'le sel ne passe jamais en argument');
  assert.equal(lancer('publier', '--projet', p).code, 2);
  writeFileSync(join(p, TETE), '{}\n');
  assert.equal(lancer('verifier', '--projet', p).code, 1);
  assert.equal(lancer('exporter', '--projet', p).code, 1);
});

// ---- Socle d'observation, appliqué à l'orchestrateur ----

test('SO1 : chaque événement des deux registres déclare son ordre et son niveau ; jamais OC3', () => {
  const p = projet();
  assert.deepStrictEqual(exporter({ projet: p, sel: SEL_EPREUVE }).erreurs, []);
  const vue = enveloppes(p).map((x) => [x.numero, x.source.format.split('.')[1], x.source.numero, x.type, x.ordre, x.niveau, x.sujet, x.nature, x.motif, x.invariant ?? null, x.decision ?? null]);
  assert.deepStrictEqual(vue, [
    [1, 'concepts/1', 1, 'proposition', 'OC2', 'N2', 'agent:orchestrateur-c7e', 'proposed', 'concept-performance', null, null],
    [2, 'ecarts/1', 1, 'ecart', 'OC1', 'N1', 'agent:orchestrateur-c7e', 'respecter', 'ecart-java-d4-inv-1', 'java:D4.INV-1', null],
    [3, 'ecarts/1', 2, 'derogation', 'OC1', 'humain', 'referent', 'derogation', 'ecart-invariant-projet', null, null],
    [4, 'ecarts/1', 3, 'ecart', 'OC1', 'N1', 'agent:orchestrateur-c7e', 'respecter', 'ecart-orchestrateur-c7e-d8-inv-2', 'orchestrateur-c7e:D8.INV-2', null],
    [5, 'concepts/1', 2, 'decision', 'OC2', 'humain', 'referent', 'experimental', 'concept-performance', null, { valeur: 'retenue', vise: 1 }],
    [6, 'concepts/1', 3, 'proposition', 'OC2', 'humain', 'developpeur', 'proposed', 'concept-securite', null, null],
    [7, 'concepts/1', 4, 'decision', 'OC2', 'humain', 'referent', 'retire', 'concept-pedagogie', null, null],
    [8, 'concepts/1', 5, 'decision', 'OC2', 'humain', 'referent', 'retire', 'concept-securite', null, { valeur: 'refusee', vise: 6 }],
  ]);
  for (const x of enveloppes(p)) assert.notEqual(x.ordre, 'OC3');
  const retrograde = traduireConcept({ date: '2026-11-09T09:00:00Z', id: 'C_PERFORMANCE_001', sorte: 'statut', statut: 'experimental', avant: 'validated', n: 6 }, { sel: SEL_EPREUVE, depart: conceptsDeDepart(), numeroDeProposition: () => 1 });
  assert.deepStrictEqual([retrograde.type, retrograde.nature, retrograde.decision], ['decision', 'experimental', { valeur: 'amendee', vise: 1 }], 'une rétrogradation porte la valeur amendee');
});

test('SO1 : une entrée proposée par un commit de second ordre sort au niveau N2, même apportée par une fusion ; une autre au niveau humain', () => {
  const p = depot();
  commit(p, 'ABCDE-3500 : [É0-C7E] chore(c7e): installer l\'orchestrateur', '2026-11-02 09:00:00', { 'docs/c7e/concepts.json': avecDepart(), 'docs/c7e/registre-ecarts.md': `${MODELE}\n` });
  git(p, 'checkout', '-q', '-b', 'feat/ABCDE-3512-chargement');
  commit(p, 'ABCDE-3512 : [É7-C7E] docs(c7e): proposer l\'évaluation d\'un index pour toute colonne filtrée', '2026-11-03 10:00:00', { 'docs/c7e/concepts.json': avecDepart(entree('C_PERFORMANCE_001', 'proposed')) });
  git(p, 'checkout', '-q', 'main');
  commit(p, 'Base de connaissances', '2026-11-03 11:00:00', { 'docs/c7e/connaissances.md': '# Connaissances\n' });
  fusion(p, 'feat/ABCDE-3512-chargement', '2026-11-04 09:00:00');
  git(p, 'checkout', '-q', '-b', 'feat/ABCDE-3513-securite');
  commit(p, 'ABCDE-3513 : docs(c7e): proposer une revue de sécurité', '2026-11-05 10:00:00', { 'docs/c7e/concepts.json': avecDepart(entree('C_PERFORMANCE_001', 'proposed'), entree('C_SECURITE_001', 'proposed')) });
  git(p, 'checkout', '-q', 'main');
  commit(p, 'Base de connaissances, suite', '2026-11-05 11:00:00', { 'docs/c7e/connaissances.md': '# Connaissances\n\n- une convention\n' });
  fusion(p, 'feat/ABCDE-3513-securite', '2026-11-06 09:00:00');
  assert.deepStrictEqual(exporter({ projet: p, sel: SEL_EPREUVE }).erreurs, []);
  assert.deepStrictEqual(enveloppes(p).map((x) => [x.date, x.type, x.motif, x.ordre, x.niveau, x.sujet]), [
    ['2026-11-04T09:00:00Z', 'proposition', 'concept-performance', 'OC2', 'N2', 'agent:orchestrateur-c7e'],
    ['2026-11-06T09:00:00Z', 'proposition', 'concept-securite', 'OC2', 'humain', 'developpeur'],
  ], 'datées par la fusion, qui les porte sur la branche d\'intégration');
});

test('SO1 : une enveloppe au schéma ouvert, hors liste ou incomplète est refusée, et une source illisible n\'écrit rien', () => {
  const p = projet();
  assert.deepStrictEqual(exporter({ projet: p, sel: SEL_EPREUVE }).erreurs, []);
  const x = enveloppes(p)[1];
  assert.deepStrictEqual(controlerEnveloppe(x), []);
  const cas = [
    [{ ...x, texte: 'un commentaire' }, /champ inconnu texte/],
    [{ ...x, nature: 'avis' }, /nature « avis » hors de la liste/],
    [{ ...x, sujet: RELECTEUR }, /sujet « Jean Dupont » hors de la liste/],
    [{ ...x, ancre: { nature: 'concept', ref: 'C_PERFORMANCE_001' } }, /ancre\.ref : une empreinte salée, ou l'identifiant d'un concept du registre de départ/],
    [{ ...x, source: { ...x.source, journal: 'a'.repeat(64) } }, /source\.journal : absent/],
    [{ ...x, preuve: { nature: 'commit', ref: 'a'.repeat(64) } }, /preuve : aucune correspondance de l'orchestrateur n'en porte/],
    [{ ...x, mesure: { nom: 'delai-decision', valeur: 60 } }, /mesure : aucune correspondance de l'orchestrateur n'en porte/],
    [{ ...x, ordre: 'OC3' }, /aucun système n'émet OC3/],
  ];
  for (const [y, motif] of cas) assert.ok(controlerEnveloppe(y).some((e) => motif.test(e)), `${motif} : ${controlerEnveloppe(y).join(' ; ')}`);
  const q = projet({ jusqua: 2 });
  commit(q, 'Écart mal daté', '2026-11-04 11:00:00', { 'docs/c7e/registre-ecarts.md': ecarts(['04/11/2026', 'ABCDE-3512', 'D6.INV-3', 'contradiction', 'respecter : arbitré']) });
  const r = lancer('exporter', '--projet', q);
  assert.equal(r.code, 1);
  assert.match(r.erreur, /^REFUS {2}source illisible, docs\/c7e\/registre-ecarts\.md, ligne 1 : date « 04\/11\/2026 » : AAAA-MM-JJ : rien n'est exporté$/m);
  assert.deepStrictEqual([existsSync(join(q, JOURNAL)), existsSync(join(q, '.git', 'agent2prompt', 'sel'))], [false, false]);
});

test('SO2 : un journal altéré à la main se relève, jusqu\'à sa dernière ligne, et refuse tout ajout', () => {
  const cas = [
    ['ligne réécrite', (l) => l.map((x, i) => (i === 2 ? x.replace('"OC1"', '"OC2"').replace('"humain"', '"N2"') : x)), /^ligne 4 : empreinte du précédent fausse/],
    ['dernière ligne réécrite', (l) => l.map((x, i) => (i === l.length - 1 ? x.replace('"retire"', '"validated"') : x)), /la dernière ligne, n° 8, a été réécrite$/],
    ['dernière ligne supprimée', (l) => l.slice(0, -1), /annonce la ligne 8, le journal s'arrête à la ligne 7/],
  ];
  for (const [quoi, alterer, motif] of cas) {
    const p = projet({ jusqua: 4 });
    commit(p, 'Revue : retraits, et l\'écart arbitré', '2026-11-06 09:00:00', { 'docs/c7e/concepts.json': sansPedagogie(entree('C_PERFORMANCE_001', 'experimental')), 'docs/c7e/registre-ecarts.md': ecarts(LIGNES[0], LIGNES[1], LIGNE_3_DECIDEE) });
    assert.equal(exporter({ projet: p, sel: SEL_EPREUVE }).ajoutees, 8);
    const alteres = alterer(texteDe(p, JOURNAL).trim().split('\n'));
    writeFileSync(join(p, JOURNAL), `${alteres.join('\n')}\n`);
    assert.ok(verifierJournal(p).some((e) => motif.test(e)), `${quoi} : ${verifierJournal(p).join(' ; ')}`);
    commit(p, 'Une proposition de plus', '2026-11-08 09:00:00', { 'docs/c7e/concepts.json': sansPedagogie(entree('C_PERFORMANCE_001', 'experimental'), entree('C_TRACE_001', 'proposed')) });
    const r = exporter({ projet: p, sel: SEL_EPREUVE });
    assert.ok(r.erreurs.length > 0 && r.erreurs.every((e) => /^journal altéré, .* : rien n'est exporté$/.test(e)), `${quoi} : ${r.erreurs.join(' ; ')}`);
    assert.equal(texteDe(p, JOURNAL), `${alteres.join('\n')}\n`);
  }
});

test('SO3 : aucun texte, aucun nom, aucune clé de ticket en clair ; seuls les concepts du registre de départ sortent en clair', () => {
  const p = projet();
  const r = lancer('exporter', '--projet', p);
  assert.equal(r.code, 0, r.erreur);
  const exporte = texteDe(p, JOURNAL) + texteDe(p, TETE);
  for (const v of [RELECTEUR, 'Dupont', 'ABCDE', 'C_PERFORMANCE_001', 'C_SECURITE_001', 'changeset', 'contradiction', 'rollback', 'meso-contrats', 'Revue', 'index']) assert.ok(!exporte.includes(v), `en clair : « ${v} »`);
  assert.ok(exporte.includes('"ref":"C_PEDAGOGIE_001"'), 'un concept du registre de départ sort en clair');
  assert.equal(enveloppes(p)[0].ancre.ref, empreinteSalee(readFileSync(join(repertoireGitCommun(p), SEL), 'utf8').trim(), 'C_PERFORMANCE_001'));
  const sel = readFileSync(join(repertoireGitCommun(p), SEL), 'utf8').trim();
  assert.ok(!exporte.includes(sel) && !`${r.sortie}${r.erreur}`.includes(sel), 'le sel ne sort ni ne s\'affiche');
  const valeurs = [];
  const collecter = (v) => (typeof v === 'string' ? valeurs.push(v) : v && typeof v === 'object' && Object.values(v).forEach(collecter));
  enveloppes(p).forEach(collecter);
  for (const v of valeurs) assert.doesNotMatch(v, /\s/, `« ${v} » : aucune phrase`);
});

test('SO4 : l\'export traduit sans modifier ses sources ; même historique, même sel : même journal, octet pour octet', () => {
  const [p, q] = [projet(), projet()];
  const avant = git(p, 'log', '--format=%H %s');
  for (const x of [p, q]) assert.deepStrictEqual(exporter({ projet: x, sel: SEL_EPREUVE, version: '3.7.0' }).erreurs, []);
  assert.equal(git(p, 'log', '--format=%H %s'), avant, 'l\'historique reste tel quel');
  assert.equal(texteDe(p, JOURNAL), texteDe(q, JOURNAL), 'deux projets de même historique, deux journaux identiques');
  assert.equal(texteDe(p, TETE), texteDe(q, TETE));
  const cles = enveloppes(p).map((x) => `${x.source.format}|${x.source.numero}`);
  assert.equal(new Set(cles).size, cles.length, 'une enveloppe par événement ou par ligne');
});

// ---- Spécification ----

test('spécification : chaque invariant de D12, et chaque invariant du socle épinglé, a sa ligne de recette ; le schéma de l\'outil est celui du socle', () => {
  const module = lire(join(SPEC, 'modules', 'observation', 'SKILL.md'));
  assert.match(module, /^status: active$/m);
  const definis = [...ENTREE.matchAll(/^- \*\*(D12\.INV-\d+)\*\* : /gm)].map((m) => m[1]);
  assert.deepStrictEqual(definis, ['D12.INV-1', 'D12.INV-2', 'D12.INV-3']);
  const partage = MANIFESTE.shared.find((s) => s.from === 'specs/socle-observation/SKILL.md');
  assert.ok(partage, 'le socle d\'observation est inclus');
  assert.ok(MANIFESTE.references.some((r) => r.name === 'socle-observation' && r.version === partage.version), 'et référencé à la même version');
  const socle = lire(sourcePartagee(partage));
  const attendus = [...definis, ...[...socle.matchAll(/^- \*\*(SO\d+\.INV-\d+)\*\* : /gm)].map((m) => `socle-observation:${m[1]}`)];
  const source = lire(join(ICI, 'observation.test.mjs')).replace(/\\'/g, '\'');
  for (const id of attendus) {
    const ligne = module.split('\n').find((l) => l.startsWith(`| ${id} | `));
    assert.ok(ligne, `${id} : aucune ligne de recette`);
    const titres = [...ligne.matchAll(/« ([^»]+?) »/g)].map((m) => m[1]);
    assert.ok(titres.length > 0, `${id} : aucun test cité`);
    for (const t of titres) assert.ok(source.includes(t), `${id} : aucun test intitulé « ${t} »`);
  }
  const { fichiers } = assembler(SPEC);
  assert.ok(fichiers.every((f) => !/^(?:outils|tests)\//.test(f.rel)), 'la transmission ne porte ni l\'outil d\'export ni sa recette : l\'IA locale ne peut pas exporter d\'elle-même');
  assert.match(module, /node <dépôt>\/specs\/orchestrateur-c7e\/outils\/observation\.mjs exporter/, 'le module donne la commande, que le développeur lance depuis le clone');
  const table = /^### 3\.1[^\n]*\n([\s\S]*?)(?=\n### )/m.exec(socle)[1];
  const champs = [...table.matchAll(/^\| `([a-z]+)` \| (oui|non) \|/gm)].map((m) => ({ champ: m[1], requis: m[2] === 'oui' }));
  assert.deepStrictEqual(champs.map((c) => c.champ), CHAMPS_ENVELOPPE);
  assert.deepStrictEqual(champs.filter((c) => c.requis).map((c) => c.champ), REQUIS_ENVELOPPE);
});
