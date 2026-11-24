// Recette de l'export vers le socle d'observation (generateur-skill-ticket 1.3.0, D9 ; socle-observation
// 1.1.0, SO1 à SO4) : ce que l'export lit et écrit, le sel de l'instance, l'export incrémental et
// idempotent, puis les sept invariants du socle appliqués au générateur, sur le champ de l'arbre d'exemple
// ABCDE-3620, un registre d'apprentissage et des champs écrits pour l'épreuve.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORMAT_REGISTRE, clore, decider, lireRegistre, noter, proposer } from '../outils/apprentissage.mjs';
import { FORMAT, canonique as canoniqueChamp, lireChamp, sha256 } from '../outils/champ.mjs';
import {
  JOURNAL, SCHEMA, SEL, TETE, controlerEnveloppe, empreinteSalee, exporter, lireJournal, lireSel, principal, repertoireGitCommun, verifierJournal,
} from '../outils/observation.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const SPEC = join(ICI, '..');
const MANIFESTE = JSON.parse(readFileSync(join(SPEC, 'manifest.json'), 'utf8'));
const OUTIL = join(SPEC, 'outils', 'observation.mjs');
const EXEMPLE = join(SPEC, 'exemples', 'ABCDE-3620-champ', 'docs', 'demandes', 'ABCDE-3620');
const ATTENDU = join(ICI, 'attendus', 'observations-ABCDE-3620.jsonl');
const SEL_EPREUVE = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';
const VERSION_ATTENDU = '1.3.0'; // version inscrite dans l'export attendu, figé
const PAR = 'Développeur d\'exemple';
const sansCR = (texte) => texte.replace(/\r\n/g, '\n');
const attendu = () => sansCR(readFileSync(ATTENDU, 'utf8')); // figé en LF, quelle que soit l'extraction
/** Même chemin, liens et noms courts résolus, sans tenir compte de la casse sous Windows. */
const memeChemin = (a, b) => {
  const forme = (c) => (process.platform === 'win32' ? realpathSync.native(c).toLowerCase() : realpathSync.native(c));
  return forme(a) === forme(b);
};

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

/** Projet temporaire, dans un dépôt Git ; avec `champ`, le champ de l'exemple ABCDE-3620. */
function projet({ champ = true, depot = true } = {}) {
  const p = mkdtempSync(join(tmpdir(), 'observation-'));
  mkdirSync(join(p, 'docs', 'demandes'), { recursive: true });
  if (champ) cpSync(EXEMPLE, join(p, 'docs', 'demandes', 'ABCDE-3620'), { recursive: true });
  if (depot) git(p, 'init', '-q');
  return p;
}

/** Ajoute au champ du ticket `cle` des enregistrements chaînés, avec sa tête, comme les écrit champ.mjs. */
function ajouterAuChamp(p, cle, ...partiels) {
  const dossier = join(p, 'docs', 'demandes', cle);
  mkdirSync(dossier, { recursive: true });
  const chemin = join(dossier, 'champ.jsonl');
  for (const partiel of partiels) {
    const lignes = existsSync(chemin) ? sansCR(readFileSync(chemin, 'utf8')).split('\n').filter(Boolean) : [];
    const n = lignes.length + 1;
    const ligne = JSON.stringify(canoniqueChamp({ n, noeud: cle, auteur: `ticket-${cle.toLowerCase()}`, precedent: n > 1 ? sha256(lignes.at(-1)) : null, ...partiel }));
    appendFileSync(chemin, `${ligne}\n`);
    writeFileSync(join(dossier, 'champ.tete'), `${JSON.stringify({ format: FORMAT, n, empreinte: sha256(ligne) })}\n`);
  }
}

const conforme = (date, ref) => ({
  date, type: 'observation', ordre: 1, verdict: 'conforme', preuve: { nature: 'test', ref: `back/src/test/java/fr/client/${ref}Test.java` }, ancre: { type: 'critere', ref: `${ref}:C1` },
});
// Second ticket, dont la branche arrive après celle d'ABCDE-3620 : un enregistrement plus ancien que le
// dernier d'ABCDE-3620, un à la même date que son n° 17, un plus récent.
const ABCDE_3700 = [conforme('2026-11-04T12:00:00Z', 'ABCDE-3700-1'), conforme('2026-11-04T15:00:00Z', 'ABCDE-3700-2'), conforme('2026-11-06T09:00:00Z', 'ABCDE-3700-3')];

const entree = (x = {}) => ({
  profondeur: 'meso-contrats', nature: 'possibilite-inconnue', motif: 'possibilite-batch', cible: 'referentiel', sens: 'descente',
  resume: 'un job batch du client Dupont passe par la possibilité service', preuve: { type: 'arbre', ref: 'ABCDE-4100' }, ...x,
});

/**
 * Registre d'apprentissage : deux tickets au même motif, qui font une proposition retenue, et un écart
 * aux consignes du générateur ; lignes 1 à 3 relevés, 4 proposition, 5 décision.
 */
function registre(p, date = '2026-11-06T10:00:00Z') {
  const demandes = join(p, 'docs', 'demandes');
  const chemin = join(p, 'docs', 'c7e', 'registre-apprentissage.jsonl');
  const tickets = [
    ['ABCDE-4100', [entree()]],
    ['ABCDE-4200', [entree({ preuve: { type: 'arbre', ref: 'ABCDE-4200' } }), entree({ profondeur: 'micro', nature: 'commit-hors-plan', motif: 'commit-hors-plan-back', cible: 'generateur', sens: 'remontee', resume: 'ABCDE-4200 : commit hors du plan', preuve: { type: 'commit', ref: '0a1b2c3d4e5f' } })]],
  ];
  for (const [cle, entrees] of tickets) {
    assert.deepStrictEqual(noter(cle, entrees, { demandes, date }).erreurs, []);
    assert.deepStrictEqual(clore(cle, { demandes, registre: chemin, date }).erreurs, []);
  }
  assert.equal(proposer({ registre: chemin, date }).nouvelles.length, 1);
  assert.deepStrictEqual(decider(4, { decision: 'retenue', par: PAR, raison: 'le batch revient d\'un ticket à l\'autre', registre: chemin, date }).erreurs, []);
  return chemin;
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
const texteDe = (p, rel) => readFileSync(join(p, rel), 'utf8');
const enregistrementsDe = (p, cle) => lireChamp(join(p, 'docs', 'demandes', cle)).enregistrements;

// ---- D9 : l'export du générateur ----

test('D9 : l\'export lit le champ de chaque ticket et le registre d\'apprentissage sans les modifier, et n\'écrit que le journal d\'enveloppes, sa tête et le sel', () => {
  const p = projet();
  registre(p);
  const avant = inventaire(p, { sauf: ['.git'] });
  const r = lancer('exporter', '--projet', p);
  assert.equal(r.code, 0, r.erreur);
  const apres = inventaire(p, { sauf: ['.git'] });
  assert.deepStrictEqual(Object.keys(apres).filter((k) => !(k in avant)).sort(), [JOURNAL, TETE].sort(), 'seuls le journal et sa tête s\'ajoutent au projet');
  for (const [k, v] of Object.entries(avant)) assert.equal(apres[k], v, `${k} inchangé`);
  assert.deepStrictEqual(readdirSync(join(p, '.git', 'agent2prompt')), ['sel'], 'et le sel, hors de l\'arbre de travail');
  const xs = enveloppes(p);
  assert.equal(xs.length, 20 + 5, 'les 22 enregistrements du champ, moins ses 2 actions, et les 5 lignes du registre');
  assert.ok(!xs.some((x) => x.source.format === FORMAT && [3, 5].includes(x.source.numero)), 'une action n\'est pas traduite');
  for (const x of xs) {
    assert.equal(x.schema, SCHEMA);
    assert.deepStrictEqual(x.systeme, { nom: 'generateur-skill-ticket', version: MANIFESTE.version }, 'la spécification qui exporte, à sa version');
  }
});

test('D9 : le sel de l\'instance est tiré une fois, dans le répertoire Git commun, partagé par les worktrees, jamais versionné, affiché ni exporté', () => {
  const p = projet();
  const r1 = lancer('exporter', '--projet', p);
  assert.equal(r1.code, 0, r1.erreur);
  assert.match(r1.sortie, /sel de l'instance tiré et gardé dans <git-common-dir>\/agent2prompt\/sel/);
  const commun = repertoireGitCommun(p);
  assert.ok(memeChemin(commun, join(p, '.git')), `${commun} : le répertoire Git commun du projet`);
  const chemin = join(commun, SEL);
  const contenu = readFileSync(chemin, 'utf8');
  assert.match(contenu, /^[0-9a-f]{64}\n$/, '32 octets aléatoires, en hexadécimal');
  if (process.platform !== 'win32') assert.equal(statSync(chemin).mode & 0o777, 0o600, 'lisible du seul développeur');
  const sel = contenu.trim();
  assert.ok(enveloppes(p).every((x) => x.instance === sha256(sel)), 'l\'instance est l\'empreinte du sel');

  ajouterAuChamp(p, 'ABCDE-3620', { ...conforme('2026-11-05T11:00:00Z', 'ABCDE-3620-2'), noeud: 'ABCDE-3620-2' });
  const r2 = lancer('exporter', '--projet', p);
  assert.equal(r2.code, 0, r2.erreur);
  assert.doesNotMatch(r2.sortie, /sel de l'instance tiré/);
  assert.equal(readFileSync(chemin, 'utf8'), contenu, 'tiré une fois');
  assert.ok(enveloppes(p).every((x) => x.instance === sha256(sel)));

  const sorties = [r1, r2, lancer('verifier', '--projet', p), lancer('etat', '--projet', p), lancer('etat', '--projet', p, '--json')].map((r) => `${r.sortie}\n${r.erreur}`).join('\n');
  assert.ok(!sorties.includes(sel), 'jamais affiché');
  for (const rel of Object.keys(inventaire(p, { sauf: ['.git'] }))) assert.ok(!readFileSync(join(p, rel), 'utf8').includes(sel), `${rel} : le sel n'est ni versionné ni exporté`);

  git(p, '-c', 'user.name=Epreuve', '-c', 'user.email=epreuve@exemple.invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--allow-empty', '-m', 'init');
  const wt = join(mkdtempSync(join(tmpdir(), 'observation-wt-')), 'wt');
  git(p, 'worktree', 'add', '-q', wt);
  assert.ok(memeChemin(repertoireGitCommun(wt), commun), 'un worktree partage le répertoire Git commun du projet');
  assert.equal(lireSel(wt).sel, sel, 'et donc le sel de l\'instance');
});

test('D9 : sans le sel, un journal existant arrête l\'export, rien n\'est écrit', () => {
  const p = projet();
  assert.equal(lancer('exporter', '--projet', p).code, 0);
  const chemin = join(repertoireGitCommun(p), SEL);
  rmSync(chemin);
  ajouterAuChamp(p, 'ABCDE-3620', { ...conforme('2026-11-05T11:00:00Z', 'ABCDE-3620-2'), noeud: 'ABCDE-3620-2' });
  const journal = texteDe(p, JOURNAL);
  const tete = texteDe(p, TETE);
  const r = lancer('exporter', '--projet', p);
  assert.equal(r.code, 1);
  assert.match(r.erreur, /^REFUS {2}sel de l'instance absent de <git-common-dir>\/agent2prompt\/sel alors que docs\/c7e\/observations\.jsonl existe : un nouveau sel changerait l'identité de l'instance/m);
  assert.deepStrictEqual([texteDe(p, JOURNAL), texteDe(p, TETE), existsSync(chemin)], [journal, tete, false], 'ni enveloppe, ni sel tiré');

  writeFileSync(chemin, `${'f'.repeat(64)}\n`);
  const autre = lancer('exporter', '--projet', p);
  assert.equal(autre.code, 1);
  assert.match(autre.erreur, /le sel de ce clone n'est pas celui de l'instance du journal/);
  assert.match(lancer('verifier', '--projet', p).erreur, /le sel de ce clone n'est pas celui de l'instance du journal/);
  assert.equal(texteDe(p, JOURNAL), journal);

  const horsDepot = projet({ depot: false });
  const r3 = lancer('exporter', '--projet', horsDepot);
  assert.equal(r3.code, 1);
  assert.match(r3.erreur, /n'est pas dans un dépôt Git : le sel de l'instance se garde dans son répertoire Git commun/);
  assert.equal(existsSync(join(horsDepot, JOURNAL)), false);
});

test('D9 : l\'export est incrémental et idempotent : un enregistrement exporté ne l\'est pas deux fois, et deux exports sans nouveauté laissent le journal identique, octet pour octet', () => {
  const p = projet();
  const r1 = exporter({ projet: p, sel: SEL_EPREUVE });
  assert.deepStrictEqual([r1.erreurs, r1.ajoutees, r1.total], [[], 20, 20]);
  const journal = texteDe(p, JOURNAL);
  const tete = texteDe(p, TETE);
  const r2 = exporter({ projet: p, sel: SEL_EPREUVE });
  assert.deepStrictEqual([r2.erreurs, r2.ajoutees, r2.total], [[], 0, 20]);
  assert.deepStrictEqual([texteDe(p, JOURNAL), texteDe(p, TETE)], [journal, tete], 'rien de nouveau, rien d\'écrit');

  ajouterAuChamp(p, 'ABCDE-3620', { date: '2026-11-05T11:00:00Z', type: 'retour', noeud: 'ABCDE-3620-2', nature: 'ratification', par: PAR, contenu: 'Skill non ratifié : l\'annonce manque', objet: 'ABCDE-3620-2', decision: 'non ratifié' });
  const r3 = exporter({ projet: p, sel: SEL_EPREUVE });
  assert.deepStrictEqual([r3.erreurs, r3.ajoutees, r3.total], [[], 1, 21]);
  assert.ok(texteDe(p, JOURNAL).startsWith(journal), 'les lignes déjà écrites restent telles quelles');
  const derniere = enveloppes(p).at(-1);
  assert.deepStrictEqual([derniere.numero, derniere.source.numero, derniere.motif, derniere.precedent], [21, 23, 'non-ratifie', sha256(journal.trim().split('\n').at(-1))]);
  assert.equal(exporter({ projet: p, sel: SEL_EPREUVE }).ajoutees, 0);
  assert.deepStrictEqual(verifierJournal(p, { sel: SEL_EPREUVE }), []);
});

test('D9 : un enregistrement arrivé après d\'autres, plus récents, prend la date de la dernière enveloppe, et chaque journal source garde son ordre', () => {
  // En deux temps : la branche d'ABCDE-3700 est fusionnée après le premier export.
  const p = projet();
  assert.equal(exporter({ projet: p, sel: SEL_EPREUVE }).ajoutees, 20);
  ajouterAuChamp(p, 'ABCDE-3700', ...ABCDE_3700);
  assert.equal(exporter({ projet: p, sel: SEL_EPREUVE }).ajoutees, 3);
  assert.deepStrictEqual(enveloppes(p).slice(20).map((x) => [x.source.numero, x.date]), [
    [1, '2026-11-05T10:45:00Z'], [2, '2026-11-05T10:45:00Z'], [3, '2026-11-06T09:00:00Z'],
  ], 'le journal reste dans l\'ordre du temps, et le champ dans son ordre');
  assert.deepStrictEqual(verifierJournal(p), []);

  // D'un coup : fusion par date ; à date égale, le champ rangé le premier, par clé, passe d'abord.
  const q = projet();
  ajouterAuChamp(q, 'ABCDE-3700', ...ABCDE_3700);
  assert.equal(exporter({ projet: q, sel: SEL_EPREUVE }).ajoutees, 23);
  const nom = { [empreinteSalee(SEL_EPREUVE, 'ABCDE-3620')]: '3620', [empreinteSalee(SEL_EPREUVE, 'ABCDE-3700')]: '3700' };
  const suite = enveloppes(q).map((x) => `${nom[x.source.journal]}#${x.source.numero}`);
  const autour = suite.slice(suite.indexOf('3620#16'), suite.indexOf('3620#18') + 1);
  assert.deepStrictEqual(autour, ['3620#16', '3700#1', '3620#17', '3700#2', '3620#18']);
  assert.equal(suite.at(-1), '3700#3');
  assert.deepStrictEqual(enveloppes(q).filter((x) => nom[x.source.journal] === '3700').map((x) => x.date), ABCDE_3700.map((e) => e.date), 'à son heure, sa date');
});

test('D9 : ligne de commande, codes de sortie', () => {
  const p = projet();
  assert.equal(lancer('exporter', '--projet', p).code, 0);
  const e = lancer('etat', '--projet', p);
  assert.equal(e.code, 0, e.erreur);
  assert.match(e.sortie, /^docs\/c7e\/observations\.jsonl : 20 enveloppes, la dernière datée 2026-11-05T10:45:00Z$/m);
  assert.match(e.sortie, /par ordre et niveau : OC1 N1 11 · OC1 humain 6 · OC2 N2 1 · OC2 N3 1 · OC2 humain 1$/m);
  assert.match(e.sortie, /en attente d'export : 0$/m);
  const j = JSON.parse(lancer('etat', '--projet', p, '--json').sortie);
  assert.deepStrictEqual([j.enveloppes, j.parType.decision, j.sources.champs, j.enAttente, j.verification], [20, 5, 1, 0, []]);
  assert.match(lancer('verifier', '--projet', p).sortie, /^journal intact : 20 enveloppes au schéma socle-observation\.enveloppe\/1, chaîne et tête intactes$/);
  assert.equal(lancer('exporter', '--inconnu').code, 2);
  assert.equal(lancer('exporter', '--projet').code, 2);
  assert.equal(lancer('publier', '--projet', p).code, 2);
  writeFileSync(join(p, TETE), '{}\n');
  const v = lancer('verifier', '--projet', p);
  assert.equal(v.code, 1);
  assert.match(v.erreur, /^ALTÉRÉ {2}docs\/c7e\/observations\.tete annonce la ligne undefined/m);
  assert.equal(lancer('exporter', '--projet', p).code, 1);
  assert.equal(lancer('etat', '--projet', p).code, 1);
  const neuf = projet();
  assert.equal(JSON.parse(execFileSync(process.execPath, [OUTIL, 'etat', '--projet', neuf, '--json'], { encoding: 'utf8' })).enAttente, 20, 'sans sel ni journal, tout est en attente');
});

// ---- Socle d'observation, appliqué au générateur ----

test('SO1 : une enveloppe au schéma ouvert, hors liste ou incomplète est refusée, et rien n\'est écrit', () => {
  const x = JSON.parse(attendu().split('\n')[2]);
  assert.deepStrictEqual(controlerEnveloppe(x), []);
  const sans = (k) => Object.fromEntries(Object.entries(x).filter(([c]) => c !== k));
  const cas = [
    [{ ...x, texte: 'un commentaire' }, /champ inconnu texte/],
    [{ ...x, source: { ...x.source, chemin: 'docs/demandes/ABCDE-3620' } }, /champ inconnu source\.chemin/],
    [sans('motif'), /champ requis absent motif/],
    [sans('precedent'), /champ requis absent precedent/],
    [{ ...x, source: { format: x.source.format } }, /champ requis absent source\.numero/],
    [{ ...x, schema: 'socle-observation.enveloppe/2' }, /schema « socle-observation\.enveloppe\/2 »/],
    [{ ...x, type: 'avis' }, /type « avis » hors de la liste/],
    [{ ...x, niveau: 'N4' }, /niveau « N4 » hors de la liste/],
    [{ ...x, nature: 'avis' }, /nature « avis » hors des listes des formats sources/],
    [{ ...x, profondeur: 'meso' }, /profondeur « meso » hors de la liste/],
    [{ ...x, motif: 'Requête native' }, /motif « Requête native » : minuscules et tirets/],
    [{ ...x, sujet: PAR }, /sujet « Développeur d'exemple » : un rôle/],
    [{ ...x, date: '2026-11-03 10:05' }, /date "2026-11-03 10:05" : AAAA-MM-JJTHH:MM:SSZ/],
    [{ ...x, ancre: { nature: 'ecran', ref: x.ancre.ref } }, /ancre\.nature « ecran » hors de la liste/],
    [{ ...x, ancre: { nature: 'scenario', ref: 'ABCDE-3620-S04' } }, /ancre\.ref : une empreinte salée/],
    [{ ...x, preuve: { nature: 'test', ref: 'back/src/test/java/fr/exemple/commande/LigneCommandeRepositoryAgregatTest.java' } }, /preuve\.ref : une empreinte salée/],
    [{ ...x, preuve: { nature: 'enregistrements', ref: '3, 4' } }, /preuve\.ref/],
    [{ ...x, decision: { valeur: 'retenue', vise: 3 } }, /decision\.vise : le numéro d'une enveloppe antérieure/],
    [{ ...x, decision: { valeur: 'refusée', vise: 1 } }, /decision\.valeur « refusée » hors de la liste/],
    [{ ...x, invariant: 'D6.INV-3' }, /invariant « D6\.INV-3 »/],
  ];
  for (const [y, motif] of cas) {
    const ecarts = controlerEnveloppe(y);
    assert.ok(ecarts.some((e) => motif.test(e)), `${motif} : ${ecarts.join(' ; ')}`);
  }

  // À l'export : une enveloppe mal formée arrête tout, sans journal, sans tête et sans sel.
  const p = projet();
  ajouterAuChamp(p, 'ABCDE-3620', { date: '2026-11-05T11:00:00Z', type: 'retour', noeud: 'ABCDE-3620-1.1', nature: 'correction', par: PAR, contenu: 'Pas de SQL natif', vise: 3, motif: 'Requête Native' });
  const r = lancer('exporter', '--projet', p);
  assert.equal(r.code, 1);
  assert.match(r.erreur, /^REFUS {2}enveloppe refusée, champ de ABCDE-3620, n° 23 : motif « Requête Native » : minuscules et tirets : rien n'est écrit$/m);
  assert.deepStrictEqual([existsSync(join(p, JOURNAL)), existsSync(join(p, TETE)), existsSync(join(p, '.git', 'agent2prompt', 'sel'))], [false, false, false]);
});

test('SO1 : chaque type d\'enregistrement source déclare son ordre et son niveau ; aucun niveau au-delà de N3, jamais OC3', () => {
  const p = projet();
  registre(p, '2026-11-08T10:00:00Z');
  const o2 = 'ticket-abcde-3800-observateur-2';
  const o3 = 'ticket-abcde-3800-observateur-3';
  ajouterAuChamp(p, 'ABCDE-3800',
    { date: '2026-11-07T09:00:00Z', type: 'action', nature: 'proposition', ancre: { type: 'option', ref: 'back.pagination' }, resume: 'deux paginations possibles', options: ['curseur', 'offset'] },
    { date: '2026-11-07T09:05:00Z', type: 'retour', nature: 'choix', par: PAR, contenu: 'curseur', vise: 1 },
    { date: '2026-11-07T09:30:00Z', type: 'action', nature: 'realisation', ancre: { type: 'fichier', ref: 'back/src/main/java/fr/client/Pagination.java' }, resume: 'pagination par offset' },
    { date: '2026-11-07T09:35:00Z', type: 'retour', nature: 'correction', par: PAR, contenu: 'Pagination par curseur, comme ailleurs', vise: 3, motif: 'pagination-curseur' },
    { date: '2026-11-07T10:00:00Z', type: 'action', nature: 'realisation', ancre: { type: 'scenario', ref: 'ABCDE-3800-S02' }, resume: 'scénario S02, offset' },
    { date: '2026-11-07T10:05:00Z', type: 'retour', nature: 'correction', par: PAR, contenu: 'Toujours le curseur', vise: 5, motif: 'pagination-curseur' },
    { date: '2026-11-07T10:30:00Z', type: 'observation', auteur: o2, ordre: 2, verdict: 'proposition', preuve: { nature: 'enregistrements', ref: '3, 4, 5, 6' }, observe: [3, 4, 5, 6], proposition: 'Relever la pagination du projet avant d\'écrire une liste', motif: 'pagination-curseur' },
    { date: '2026-11-07T10:35:00Z', type: 'observation', auteur: o3, ordre: 3, verdict: 'infondee', preuve: { nature: 'enregistrements', ref: '7' }, observe: [7] },
    { date: '2026-11-07T10:40:00Z', type: 'retour', nature: 'choix', par: PAR, contenu: 'Refusée : la règle est déjà au référentiel', vise: 7, decision: 'refusée' },
    { date: '2026-11-07T11:00:00Z', type: 'observation', auteur: o2, ordre: 2, verdict: 'conforme', preuve: { nature: 'enregistrements', ref: '4, 6' }, observe: [4, 6], motif: 'pagination-curseur' },
    { date: '2026-11-07T11:10:00Z', type: 'observation', auteur: o3, ordre: 3, verdict: 'veille', preuve: { nature: 'enregistrements', ref: '7' }, observe: [7], motif: 'pagination-curseur' },
    { date: '2026-11-07T11:20:00Z', type: 'observation', auteur: o3, ordre: 3, verdict: 'bilan', preuve: { nature: 'rapport', ref: 'docs/demandes/ABCDE-3800/bilan.md' }, observe: [7, 10], commentaire: 'Une proposition, refusée' },
    { date: '2026-11-07T11:30:00Z', type: 'ecart', ancre: { type: 'contrat', ref: 'GET /v1/commandes, pagination' }, invariant: 'INV-PROJET-04 : pagination par curseur', constat: 'offset dans le contrat' },
    { date: '2026-11-07T11:40:00Z', type: 'retour', nature: 'ratification', par: PAR, contenu: 'Non ratifié', objet: 'ABCDE-3800', decision: 'non ratifié' },
  );
  assert.deepStrictEqual(exporter({ projet: p, sel: SEL_EPREUVE }).erreurs, []);

  const attendus = {
    'ordre 1 conforme': ['observation', 'OC1', 'N1'],
    'ordre 1 ecart': ['ecart', 'OC1', 'N1'],
    'ordre 2 proposition': ['proposition', 'OC2', 'N2'],
    'ordre 2 conforme': ['observation', 'OC2', 'N2'],
    'ordre 3': ['observation', 'OC2', 'N3'],
    correction: ['observation', 'OC1', 'humain'],
    'choix sur une proposition d\'ordre 2': ['decision', 'OC2', 'humain'],
    'choix sur une action': ['decision', 'OC1', 'humain'],
    ratification: ['decision', 'OC1', 'humain'],
    ecart: ['ecart', 'OC1', 'N1'],
    'registre releve': ['observation', 'OC2', 'N2'],
    'registre proposition': ['proposition', 'OC2', 'N2'],
    'registre decision': ['decision', 'OC2', 'humain'],
  };
  const champs = Object.fromEntries(['ABCDE-3620', 'ABCDE-3800'].map((cle) => [empreinteSalee(SEL_EPREUVE, cle), new Map(enregistrementsDe(p, cle).map((e) => [e.n, e]))]));
  const lignesRegistre = new Map(lireRegistre(join(p, 'docs', 'c7e', 'registre-apprentissage.jsonl')).enregistrements.map((e) => [e.n, e]));
  const genre = (x) => {
    if (x.source.format === FORMAT_REGISTRE) return `registre ${lignesRegistre.get(x.source.numero).type}`;
    const parN = champs[x.source.journal];
    const e = parN.get(x.source.numero);
    if (e.type === 'observation') return e.ordre === 3 ? 'ordre 3' : `ordre ${e.ordre} ${e.verdict}`;
    if (e.type === 'retour' && e.nature === 'choix') return parN.get(e.vise).type === 'observation' ? 'choix sur une proposition d\'ordre 2' : 'choix sur une action';
    return e.type === 'retour' ? e.nature : e.type;
  };
  const vus = new Set();
  for (const x of enveloppes(p)) {
    const g = genre(x);
    vus.add(g);
    assert.deepStrictEqual([x.type, x.ordre, x.niveau], attendus[g], `${g} (enveloppe n° ${x.numero})`);
    assert.notEqual(x.ordre, 'OC3');
    assert.ok(['N1', 'N2', 'N3', 'humain'].includes(x.niveau));
  }
  assert.deepStrictEqual([...vus].sort(), Object.keys(attendus).sort(), 'chaque type d\'enregistrement source est éprouvé');

  const de3800 = enveloppes(p).filter((x) => x.source.journal === empreinteSalee(SEL_EPREUVE, 'ABCDE-3800'));
  const parSource = (n) => de3800.find((x) => x.source.numero === n);
  assert.deepStrictEqual([parSource(2).ancre.nature, parSource(2).profondeur], ['option', 'meso-contrats'], 'un choix entre options prend l\'ancre de la proposition d\'action');
  assert.deepStrictEqual(parSource(9).decision, { valeur: 'refusee', vise: parSource(7).numero });
  assert.deepStrictEqual([8, 11, 12].map((n) => [parSource(n).nature, parSource(n).motif]), [['infondee', 'pagination-curseur'], ['veille', 'pagination-curseur'], ['bilan', 'pagination-curseur']], 'l\'ordre 3 porte le motif qu\'il examine');
  assert.deepStrictEqual([parSource(13).nature, parSource(13).motif, parSource(13).invariant], ['ecart', 'ecart-invariant-projet', undefined], 'un invariant du projet reste dans l\'instance');
  assert.deepStrictEqual([parSource(14).motif, parSource(12).preuve.nature], ['non-ratifie', 'rapport']);
});

test('SO2 : un journal altéré à la main se relève, ligne réécrite, insérée ou supprimée, jusqu\'à la dernière, et refuse tout ajout', () => {
  const lignes = attendu().trim().split('\n');
  const reecrire = (k, f) => lignes.map((l, i) => (i === k ? JSON.stringify(f(JSON.parse(l))) : l));
  const cas = [
    ['ligne réécrite', reecrire(4, (x) => ({ ...x, motif: 'autre-motif' })), /^ligne 6 : empreinte du précédent fausse, la ligne 5 a été réécrite, insérée ou supprimée$/],
    ['ligne insérée', [...lignes.slice(0, 3), lignes[2], ...lignes.slice(3)], /^ligne 4 : numéro 3, attendu 4 : ligne insérée ou supprimée$/],
    ['ligne supprimée', lignes.filter((_, i) => i !== 9), /^ligne 10 : numéro 11, attendu 10 : ligne insérée ou supprimée$/],
    ['date remontée', reecrire(1, (x) => ({ ...x, date: '2026-11-03T10:30:00Z' })), /^ligne 3 : date 2026-11-03T10:05:00Z antérieure à celle de la ligne 2$/],
    ['ligne écrite hors de l\'export', reecrire(6, (x) => ({ motif: x.motif, ...x })), /^ligne 7 : ligne non canonique, écrite hors de l'export$/],
    ['dernière ligne réécrite', reecrire(19, (x) => ({ ...x, nature: 'ecart' })), /^docs\/c7e\/observations\.tete : la dernière ligne, n° 20, a été réécrite$/],
    ['dernière ligne supprimée', lignes.slice(0, 19), /^docs\/c7e\/observations\.tete annonce la ligne 20, le journal s'arrête à la ligne 19 : lignes supprimées ou ajoutées hors de l'export$/],
  ];
  for (const [quoi, alteres, motif] of cas) {
    const p = projet();
    assert.equal(exporter({ projet: p, sel: SEL_EPREUVE }).ajoutees, 20);
    writeFileSync(join(p, JOURNAL), `${alteres.join('\n')}\n`);
    ajouterAuChamp(p, 'ABCDE-3620', { ...conforme('2026-11-05T11:00:00Z', 'ABCDE-3620-2'), noeud: 'ABCDE-3620-2' });
    const ecarts = verifierJournal(p);
    assert.ok(ecarts.some((e) => motif.test(e)), `${quoi} : ${ecarts.join(' ; ')}`);
    const r = exporter({ projet: p, sel: SEL_EPREUVE });
    assert.ok(r.erreurs.length > 0 && r.erreurs.every((e) => /^journal altéré, .* : rien n'est exporté$/.test(e)), `${quoi} : ${r.erreurs.join(' ; ')}`);
    assert.equal(texteDe(p, JOURNAL), `${alteres.join('\n')}\n`, `${quoi} : aucun ajout`);
  }
});

test('SO3 : aucune enveloppe ne porte de texte libre : l\'export d\'ABCDE-3620 ne garde que des valeurs de listes, des motifs, des numéros, des invariants du dépôt et des empreintes', () => {
  const p = projet();
  const chemin = registre(p);
  assert.deepStrictEqual(exporter({ projet: p, sel: SEL_EPREUVE }).erreurs, []);
  const valeurs = [];
  const collecter = (v) => {
    if (typeof v === 'string') valeurs.push(v);
    else if (v !== null && typeof v === 'object') Object.values(v).forEach(collecter);
  };
  for (const x of enveloppes(p)) {
    assert.deepStrictEqual(controlerEnveloppe(x), [], `enveloppe n° ${x.numero}`);
    collecter(x);
  }
  for (const v of valeurs) assert.doesNotMatch(v, /\s/, `« ${v} » : aucune valeur ne porte d'espace, donc aucune phrase`);
  const exporte = texteDe(p, JOURNAL);
  const textes = [
    ...enregistrementsDe(p, 'ABCDE-3620').flatMap((e) => [e.contenu, e.resume, e.proposition, e.ecart, e.constat, e.commentaire, e.preuve?.extrait]),
    ...lireRegistre(chemin).enregistrements.flatMap((e) => [e.resume, e.raison, e.preuve?.extrait]),
  ].filter((t) => typeof t === 'string');
  assert.ok(textes.length > 15, `${textes.length} textes éprouvés`);
  for (const t of textes) assert.ok(!exporte.includes(t), `texte sorti : « ${t} »`);
});

test('SO3 : aucun nom, aucune clé, aucun chemin du projet ne sort en clair, et le sel jamais', () => {
  const p = projet();
  const chemin = registre(p);
  const sorties = [lancer('exporter', '--projet', p), lancer('etat', '--projet', p, '--json'), lancer('verifier', '--projet', p)].map((r) => `${r.sortie}\n${r.erreur}`).join('\n');
  const exporte = texteDe(p, JOURNAL) + texteDe(p, TETE);
  const sel = readFileSync(join(repertoireGitCommun(p), SEL), 'utf8').trim();
  const enClair = new Set(['ABCDE', 'abcde', 'Dupont', 'exemple', 'fr/client', PAR]);
  for (const e of enregistrementsDe(p, 'ABCDE-3620')) {
    for (const v of [e.noeud, e.auteur, e.par, e.objet, e.ancre?.ref, e.preuve?.ref]) if (typeof v === 'string' && !/^[\d, ]+$/.test(v)) enClair.add(v);
  }
  for (const e of lireRegistre(chemin).enregistrements) for (const v of [e.cle, e.par, e.preuve?.ref, ...(e.tickets ?? [])]) if (typeof v === 'string') enClair.add(v);
  assert.ok(enClair.size > 20, `${enClair.size} noms, clés et chemins éprouvés`);
  for (const v of enClair) assert.ok(!exporte.includes(v), `en clair dans le journal : « ${v} »`);
  for (const x of enveloppes(p)) assert.ok(['developpeur', 'agent:generateur-skill-ticket', 'observateur-N2', 'observateur-N3'].includes(x.sujet), `sujet ${x.sujet} : un rôle`);
  assert.ok(!exporte.includes(sel), 'le sel ne sort jamais');
  assert.ok(!sorties.includes(sel), 'ni ne s\'affiche');
  assert.doesNotMatch(sorties, /ABCDE|Dupont/, 'les sorties d\'un export réussi ne nomment rien');
});

test('SO4 : l\'export traduit sans modifier ses sources, et désigne chaque enregistrement par son format, son journal et son numéro, sur un projet à deux champs', () => {
  const p = projet();
  registre(p);
  ajouterAuChamp(p, 'ABCDE-3700', ...ABCDE_3700);
  const sauf = ['c7e/observations.jsonl', 'c7e/observations.tete'];
  const avant = inventaire(join(p, 'docs'), { sauf });
  assert.deepStrictEqual(exporter({ projet: p, sel: SEL_EPREUVE }).erreurs, []);
  assert.deepStrictEqual(inventaire(join(p, 'docs'), { sauf }), avant, 'champs, têtes, relevés et registre inchangés : mêmes champs, même version, même emplacement');
  const xs = enveloppes(p);
  const cles = xs.map((x) => `${x.source.format}|${x.source.journal ?? ''}|${x.source.numero}`);
  assert.equal(new Set(cles).size, xs.length, 'une enveloppe par enregistrement, sans ambiguïté');
  const deChamp = xs.filter((x) => x.source.format === FORMAT);
  assert.deepStrictEqual([...new Set(deChamp.map((x) => x.source.journal))].sort(), [empreinteSalee(SEL_EPREUVE, 'ABCDE-3620'), empreinteSalee(SEL_EPREUVE, 'ABCDE-3700')].sort());
  assert.equal(deChamp.filter((x) => x.source.numero === 1).length, 2, 'le n° 1 de chaque champ, distingué par son journal');
  const deRegistre = xs.filter((x) => x.source.format === FORMAT_REGISTRE);
  assert.equal(deRegistre.length, 5);
  assert.ok(deRegistre.every((x) => x.source.journal === undefined), 'le registre, seul journal de son format, sans source.journal');
});

test('SO4 : même sources, même sel : même journal, octet pour octet, celui de tests/attendus/observations-ABCDE-3620.jsonl', () => {
  const [p, q] = [projet(), projet()];
  for (const x of [p, q]) assert.deepStrictEqual(exporter({ projet: x, sel: SEL_EPREUVE, version: VERSION_ATTENDU }).erreurs, []);
  const journal = readFileSync(join(p, JOURNAL));
  assert.ok(journal.equals(readFileSync(join(q, JOURNAL))), 'deux exports, deux journaux identiques');
  assert.ok(readFileSync(join(p, TETE)).equals(readFileSync(join(q, TETE))), 'et deux têtes identiques');
  assert.equal(journal.toString('utf8'), attendu(), 'l\'export attendu, figé');
  const crlf = projet();
  for (const nom of ['champ.jsonl', 'champ.tete']) {
    const chemin = join(crlf, 'docs', 'demandes', 'ABCDE-3620', nom);
    writeFileSync(chemin, readFileSync(chemin, 'utf8').replace(/\n/g, '\r\n'));
  }
  assert.deepStrictEqual(exporter({ projet: crlf, sel: SEL_EPREUVE, version: VERSION_ATTENDU }).erreurs, []);
  assert.ok(readFileSync(join(crlf, JOURNAL)).equals(journal), 'quelles que soient les fins de ligne du champ');
  const r = projet();
  assert.deepStrictEqual(exporter({ projet: r, sel: 'f'.repeat(64), version: VERSION_ATTENDU }).erreurs, []);
  const [autre, premier] = [enveloppes(r), enveloppes(p)];
  assert.notEqual(autre[0].instance, premier[0].instance, 'un autre sel, une autre instance');
  assert.deepStrictEqual(autre.map((x) => [x.type, x.ordre, x.niveau, x.motif, x.nature]), premier.map((x) => [x.type, x.ordre, x.niveau, x.motif, x.nature]), 'la même traduction');
});

test('SO4 : le registre d\'apprentissage se traduit selon le socle : relevés, propositions et décisions', () => {
  const p = projet({ champ: false });
  registre(p);
  assert.deepStrictEqual(exporter({ projet: p, sel: SEL_EPREUVE }).erreurs, []);
  const xs = enveloppes(p);
  assert.deepStrictEqual(xs.map((x) => [x.source.numero, x.type, x.ordre, x.niveau, x.sujet, x.nature, x.cible, x.profondeur, x.motif]), [
    [1, 'observation', 'OC2', 'N2', 'agent:generateur-skill-ticket', 'possibilite-inconnue', 'instance', 'meso-contrats', 'possibilite-batch'],
    [2, 'observation', 'OC2', 'N2', 'agent:generateur-skill-ticket', 'possibilite-inconnue', 'instance', 'meso-contrats', 'possibilite-batch'],
    [3, 'observation', 'OC2', 'N2', 'agent:generateur-skill-ticket', 'commit-hors-plan', 'specification', 'micro', 'commit-hors-plan-back'],
    [4, 'proposition', 'OC2', 'N2', 'agent:generateur-skill-ticket', 'recurrence', 'instance', 'meso-contrats', 'possibilite-batch'],
    [5, 'decision', 'OC2', 'humain', 'developpeur', 'decision', 'instance', 'meso-contrats', 'possibilite-batch'],
  ]);
  assert.deepStrictEqual(xs[0].ancre, { nature: 'ticket', ref: empreinteSalee(SEL_EPREUVE, 'ABCDE-4100') });
  assert.deepStrictEqual(xs[2].preuve, { nature: 'commit', ref: empreinteSalee(SEL_EPREUVE, '0a1b2c3d4e5f') });
  assert.deepStrictEqual(xs[3].preuve, { nature: 'enregistrements', ref: '1,2' }, 'une proposition cite les relevés qui la fondent');
  assert.deepStrictEqual(xs[4].decision, { valeur: 'retenue', vise: 4 }, 'une décision vise l\'enveloppe de sa proposition');
});
