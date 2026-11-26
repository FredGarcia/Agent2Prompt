// Recette de l'observatoire (observatoire 1.6.0, D1 à D6, D8 à D12), sur des instances d'épreuve dont les journaux
// sont produits par l'export du générateur de skills de ticket : A, le champ de l'arbre d'exemple ABCDE-3620
// et un registre d'apprentissage dont une proposition, qui vise le générateur, est retenue ; B et C, des
// champs écrits pour l'épreuve ; pour la confrontation entre systèmes, par l'export de l'orchestrateur C7E,
// depuis un registre des écarts commité dans ces projets ; et, pour la confrontation de l'acceptable, par
// l'export du binôme, depuis des livrables d'Agent2Dev et des journaux de tests d'Agent2Test écrits pour
// l'épreuve, avec leurs refus et, pour la confrontation des kits et des signaux, leurs kits et leurs points de
// validation ; et, pour l'examen indépendant, des propositions et des examens écrits pour l'épreuve. Le magasin
// et le dépôt d'épreuve sont temporaires : la recette n'écrit ni dans le répertoire Git commun du clone, ni dans
// ses propositions, ni dans ses examens.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { clore, decider, noter, proposer as proposerAuRegistre } from '../../generateur-skill-ticket/outils/apprentissage.mjs';
import { FORMAT, canonique as canoniqueChamp } from '../../generateur-skill-ticket/outils/champ.mjs';
import { exporter } from '../../generateur-skill-ticket/outils/observation.mjs';
import { exporter as exporterOrchestrateur } from '../../orchestrateur-c7e/outils/observation.mjs';
import { exporter as exporterBinome } from '../outils/export-binome.mjs';
import {
  EXAMENS, MAGASIN, PROPOSITIONS, SEUIL_ENVELOPPES, canonique, confronter, controlerEnveloppe, controlerExamen, controlerProposition, controlerRatifications, etat,
  inscrire, lireExamens, lirePropositions, magasinParDefaut, principal, proposer, relever, repertoireGitCommun, sha256, suivre, verifier,
} from '../outils/observatoire.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = join(ICI, '..', '..', '..');
const EXEMPLE = join(RACINE, 'specs', 'generateur-skill-ticket', 'exemples', 'ABCDE-3620-champ', 'docs', 'demandes', 'ABCDE-3620');
const JOURNAL = join('docs', 'c7e', 'observations.jsonl');
const SELS = { A: 'a'.repeat(64), B: 'b'.repeat(64), C: 'c'.repeat(64), D: 'd'.repeat(64), E: 'e'.repeat(64) };
const PREFIXE = Object.fromEntries(Object.entries(SELS).map(([k, sel]) => [k, sha256(sel).slice(0, 8)]));
const PAR = 'Développeur d\'exemple';
const RESUME = 'commit hors du plan, chez le client Dupont';
const ORCHESTRATEUR = join(RACINE, 'specs', 'orchestrateur-c7e');
const DEPART = /Registre de départ[\s\S]*?```json\n([\s\S]*?)\n```/.exec(readFileSync(join(ORCHESTRATEUR, 'SKILL.md'), 'utf8').replace(/\r\n/g, '\n'))[1];
const MODELE = /```markdown\n(# Registre des écarts[\s\S]*?)\n```/.exec(readFileSync(join(ORCHESTRATEUR, 'meso-contrats.md'), 'utf8').replace(/\r\n/g, '\n'))[1];
const JOURNAL_ORCHESTRATEUR = 'docs/c7e/observations-orchestrateur-c7e.jsonl';
// Version courante de l'orchestrateur, celle qu'exporte son outil, et une version publiée plus tard, pour une ratification.
const VERSION_ORCHESTRATEUR = JSON.parse(readFileSync(join(ORCHESTRATEUR, 'manifest.json'), 'utf8')).version;
const ORCHESTRATEUR_SUIVANT = VERSION_ORCHESTRATEUR.replace(/^(\d+)\.(\d+)\.\d+$/, (_, a, b) => `${a}.${Number(b) + 1}.0`);
// Le désaccord du champ de l'arbre d'exemple, que champ.mjs inscrit au registre des écarts, décidé par le développeur.
const DESACCORD = ['2026-11-05', 'ABCDE-3620', 'désaccord entre nœuds (D6.INV-3)', 'la date-heure reçue par le canal des lignes arrive sans fuseau', 'respecter : le canal porte le fuseau'];
const AUTRE_DESACCORD = ['2026-11-06', 'ABCDE-3621', 'D6.INV-3', 'deux nœuds contraires sur le contrat de pagination', 'respecter : un seul contrat'];
// Versions courantes du binôme et du socle de l'acceptable, celles des livrables d'épreuve et des propositions.
const versionDe = (nom) => JSON.parse(readFileSync(join(RACINE, 'specs', nom, 'manifest.json'), 'utf8')).version;
const [VERSION_A2D, VERSION_A2T, VERSION_SA] = ['agent2dev', 'agent2test', 'socle-acceptable'].map(versionDe);
const suivante = (version) => version.replace(/^(\d+)\.(\d+)\.\d+$/, (_, a, b) => `${a}.${Number(b) + 1}.0`);

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const sansCR = (texte) => texte.replace(/\r\n/g, '\n');
const memeChemin = (a, b) => {
  const forme = (c) => (process.platform === 'win32' ? realpathSync.native(c).toLowerCase() : realpathSync.native(c));
  return forme(a) === forme(b);
};
const temporaire = (nom) => mkdtempSync(join(tmpdir(), `observatoire-${nom}-`));

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

/** Une action sur une ancre, puis la correction du développeur sous un motif : deux enregistrements. */
const corrige = (date, ancre, motif, n) => [
  { date, type: 'action', nature: 'realisation', ancre, resume: 'réalisation du nœud' },
  { date, type: 'retour', nature: 'correction', par: PAR, contenu: 'Corrigé à la main, chez le client Dupont', vise: n, motif },
];
const conformes = (debut, k, cle) => Array.from({ length: k }, (_, i) => ({
  date: new Date(Date.parse(debut) + i * 60_000).toISOString().replace('.000Z', 'Z'), type: 'observation', ordre: 1, verdict: 'conforme',
  preuve: { nature: 'test', ref: `back/src/test/java/fr/client/${cle}Test${i}.java` }, ancre: { type: 'critere', ref: `${cle}-${i}:C1` },
}));

function projet(nom, { exemple = false } = {}) {
  const p = temporaire(`projet-${nom}`);
  mkdirSync(join(p, 'docs', 'demandes'), { recursive: true });
  if (exemple) cpSync(EXEMPLE, join(p, 'docs', 'demandes', 'ABCDE-3620'), { recursive: true });
  return p;
}

function exporterInstance(p, nom, version = '1.3.0') {
  const r = exporter({ projet: p, sel: SELS[nom], version });
  assert.deepStrictEqual(r.erreurs, [], `export de l'instance ${nom}`);
  return r;
}

/** Registre d'apprentissage : deux tickets relèvent le même commit hors du plan, cible le générateur ; la proposition est décidée. */
function registre(p, decision = 'retenue') {
  const demandes = join(p, 'docs', 'demandes');
  const chemin = join(p, 'docs', 'c7e', 'registre-apprentissage.jsonl');
  const date = '2026-11-06T10:00:00Z';
  const entree = (cle) => ({ profondeur: 'micro', nature: 'commit-hors-plan', motif: 'commit-hors-plan-back', cible: 'generateur', sens: 'remontee', resume: RESUME, preuve: { type: 'commit', ref: `0a1b2c3d-${cle}` } });
  for (const cle of ['ABCDE-4100', 'ABCDE-4200']) {
    assert.deepStrictEqual(noter(cle, [entree(cle)], { demandes, date }).erreurs, []);
    assert.deepStrictEqual(clore(cle, { demandes, registre: chemin, date }).erreurs, []);
  }
  assert.equal(proposerAuRegistre({ registre: chemin, date }).nouvelles.length, 1);
  assert.deepStrictEqual(decider(3, { decision, par: PAR, raison: 'le plan de commits oublie le back', registre: chemin, date }).erreurs, []);
}

/** Les instances d'épreuve. A : exemple ABCDE-3620 et registre ; B : requete-native ; C : pagination-curseur. */
const INSTANCES = {
  A: (version) => {
    const p = projet('A', { exemple: true });
    registre(p);
    exporterInstance(p, 'A', version);
    return p;
  },
  B: (version) => {
    const p = projet('B');
    ajouterAuChamp(p, 'FGHIJ-100', ...corrige('2026-11-10T09:00:00Z', { type: 'scenario', ref: 'FGHIJ-100-S01' }, 'requete-native', 1), ...corrige('2026-11-10T10:00:00Z', { type: 'scenario', ref: 'FGHIJ-100-S02' }, 'requete-native', 3));
    exporterInstance(p, 'B', version);
    return p;
  },
  C: (version) => {
    const p = projet('C');
    ajouterAuChamp(p, 'KLMNO-7', ...corrige('2026-11-12T09:00:00Z', { type: 'fichier', ref: 'front/src/app/liste/pagination.ts' }, 'pagination-curseur', 1));
    exporterInstance(p, 'C', version);
    return p;
  },
};

/** Dépôt d'épreuve : les manifestes des systèmes, celui du générateur à la version courante voulue. */
function depot({ courante = '1.3.0' } = {}) {
  const d = temporaire('depot');
  const manifeste = JSON.parse(readFileSync(join(RACINE, 'specs', 'generateur-skill-ticket', 'manifest.json'), 'utf8'));
  const anciennes = ['1.0.0', '1.1.0', '1.1.1', '1.2.0', '1.3.0'].filter((v) => v !== courante);
  mkdirSync(join(d, 'specs', 'generateur-skill-ticket'), { recursive: true });
  writeFileSync(join(d, 'specs', 'generateur-skill-ticket', 'manifest.json'), JSON.stringify({ ...manifeste, version: courante, previousVersions: anciennes.map((version) => ({ version, file: `archives/SKILL-v${version}.md` })) }));
  for (const nom of ['orchestrateur-c7e', 'socle-observation', 'java', 'agent2dev', 'agent2test', 'socle-acceptable']) {
    for (const f of ['manifest.json', 'SKILL.md']) cpSync(join(RACINE, 'specs', nom, f), join(d, 'specs', nom, f));
  }
  // Le socle back-front, connu du dépôt d'épreuve, sans son point d'entrée : ses invariants n'y sont pas définis.
  cpSync(join(RACINE, 'specs', 'socle-back-front', 'manifest.json'), join(d, 'specs', 'socle-back-front', 'manifest.json'));
  return d;
}

/**
 * Les registres de l'orchestrateur dans le projet, qui devient un dépôt Git : le registre des concepts, celui de
 * départ par défaut, et le registre des écarts, avec ses lignes ; commités, puis exportés avec le sel de
 * l'instance `nom`. Rappelé, il commite les registres donnés et exporte ce qui est nouveau.
 */
function orchestrateur(p, nom, lignes, { concepts = `${DEPART}\n`, date = '2026-11-20 09:00:00' } = {}) {
  if (!existsSync(join(p, '.git'))) {
    git(p, 'init', '-q');
    for (const [k, v] of [['user.name', 'Epreuve'], ['user.email', 'epreuve@exemple.invalid'], ['commit.gpgsign', 'false'], ['core.autocrlf', 'false']]) git(p, 'config', k, v);
  }
  mkdirSync(join(p, 'docs', 'c7e'), { recursive: true });
  writeFileSync(join(p, 'docs', 'c7e', 'concepts.json'), concepts);
  writeFileSync(join(p, 'docs', 'c7e', 'registre-ecarts.md'), `${MODELE}\n${lignes.map((l) => `| ${l.join(' | ')} |`).join('\n')}\n`);
  git(p, 'add', '--', 'docs/c7e/concepts.json', 'docs/c7e/registre-ecarts.md');
  execFileSync('git', ['commit', '-q', '--allow-empty', '-F', '-'], { cwd: p, input: 'Registres de l\'orchestrateur', env: { ...process.env, GIT_AUTHOR_DATE: `${date} +0000`, GIT_COMMITTER_DATE: `${date} +0000` }, stdio: ['pipe', 'pipe', 'ignore'] });
  const r = exporterOrchestrateur({ projet: p, sel: SELS[nom] });
  assert.deepStrictEqual(r.erreurs, [], `export de l'orchestrateur, instance ${nom}`);
}

/** Un refus d'une rubrique acceptable, et sa réponse. */
const refusDe = (n, date, garde, regles, reponse = null) => ({ n, date, garde, objet: 'objet-d-epreuve', regles, reponse });
const reponseDe = (decision, role, n, date) => ({ decision, role, n, date });
const livrableA2D = (cle, refus, kits, points, revisions) => ({ format: 'agent2dev.livrable/1', demande: { cle, titre: 'Demande d\'épreuve, chez le client Dupont', source: 'e'.repeat(64) }, versions: { specification: VERSION_A2D }, acceptable: { socle: 'socle-acceptable', version: VERSION_SA, refus }, ...(kits ? { kits } : {}), ...(points ? { points } : {}), ...(revisions ? { revisions } : {}) });
/** Une présentation d'un point de validation, et sa décision, ou null tant qu'elle attend. */
const pointDe = (n, date, point, decision = null) => ({ n, date, point, decision });
const decisionDe = (n, date, valeur) => ({ n, date, valeur, role: 'developpeur', canal: 'tableau-de-bord', commentaire: 'chez le client Dupont' });
const journalA2T = (campagne, cle, refus, kits, revisions) => ({ format: 'agent2test.journal-de-tests/1', campagne, demande: { cle, texte: 'Demande d\'épreuve' }, versions: { specification: VERSION_A2T }, acceptable: { socle: 'socle-acceptable', version: VERSION_SA, refus }, ...(kits ? { kits } : {}), ...(revisions ? { revisions } : {}) });
/** Une entrée de la rubrique revisions : une publication, avec son sens et ses relâchements, ou un examen, avec son avis. */
const publicationDe = (n, date, empreinte, sens, relachements = 0) => ({ n, date, type: 'constitution.publiee', version: `2.${n}.0`, empreinte, sens, relachements, renforcements: sens === 'renforcement' ? 1 : 0 });
const examenDe2 = (n, date, empreinte, avis) => ({ n, date, type: 'constitution.examinee', version: `2.${n + 1}.0`, empreinte, avis });
/** Un kit d'une rubrique kits : sa remise, puis ses étapes, chacune à sa ligne de journal, avec son rôle. */
const kitDe = (n, date, environnement, empreinte, etapes = {}) => ({ n, date, environnement, empreinte, validation: null, application: null, retourArriere: null, ...etapes });
const etapeDe = (n, date, role, resultat) => ({ n, date, role, ...(resultat ? { resultat } : {}) });

/** Exporte, par l'outil d'export du binôme, des livrables et des journaux de tests dans le projet, sous le sel de l'instance `nom`. */
function binome(p, nom, ...contenus) {
  if (!existsSync(join(p, '.git'))) {
    git(p, 'init', '-q');
    for (const [k, v] of [['user.name', 'Epreuve'], ['user.email', 'epreuve@exemple.invalid'], ['commit.gpgsign', 'false'], ['core.autocrlf', 'false']]) git(p, 'config', k, v);
  }
  const d = temporaire('livrables');
  const fichiers = contenus.map((c, i) => {
    const f = join(d, `source-${i + 1}.json`);
    writeFileSync(f, JSON.stringify(c));
    return f;
  });
  const r = exporterBinome({ projet: p, fichiers, sel: SELS[nom] });
  assert.deepStrictEqual(r.erreurs, [], `export du binôme, instance ${nom}`);
}

/** Écrit un journal d'enveloppes chaîné, avec sa tête, à partir d'enveloppes partielles, sous le sel de l'instance `nom`. */
function ecrireJournal(p, journal, nom, partielles) {
  const lignes = [];
  for (const [i, x] of partielles.entries()) {
    lignes.push(JSON.stringify(canonique({ schema: 'socle-observation.enveloppe/1', numero: i + 1, instance: sha256(SELS[nom]), ...x, precedent: i === 0 ? null : sha256(lignes[i - 1]) })));
  }
  mkdirSync(join(p, 'docs', 'c7e'), { recursive: true });
  writeFileSync(join(p, journal), `${lignes.join('\n')}\n`);
  writeFileSync(join(p, journal.replace(/\.jsonl$/, '.tete')), `${JSON.stringify({ schema: 'socle-observation.enveloppe/1', numero: lignes.length, empreinte: sha256(lignes.at(-1)) })}\n`);
}

/** Numéro, dans le journal du générateur d'un projet, de l'enveloppe qui cite `invariant`. */
const numeroDuGenerateur = (p, invariant) => sansCR(readFileSync(join(p, JOURNAL), 'utf8')).trim().split('\n').map((l) => JSON.parse(l)).find((x) => x.invariant === invariant).numero;

/** Un observatoire d'épreuve : magasin et dépôt temporaires, projets inscrits. */
function observatoire(projets, options = {}) {
  const lieux = { magasin: join(temporaire('magasin'), MAGASIN), depot: options.depot ?? depot() };
  for (const p of projets) assert.deepStrictEqual(inscrire(p, lieux).erreurs, [], `inscription de ${p}`);
  return lieux;
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

function lancer(contexte, ...argv) {
  const sortie = [];
  const erreur = [];
  const code = principal(argv, (l) => sortie.push(l), (l) => erreur.push(l), contexte);
  return { code, sortie: sortie.join('\n'), erreur: erreur.join('\n') };
}

const cle = (c) => `${c.sorte} ${c.systeme} ${c.motif} ${c.profondeur ?? '-'}`;
const miroirDe = (lieux, nom) => join(lieux.magasin, 'instances', sha256(SELS[nom]), 'observations.jsonl');
const ecrireStatut = (d, fichier, statut) => writeFileSync(join(d, fichier), readFileSync(join(d, fichier), 'utf8').replace('statut: ouverte', statut));

// ---- D1 : inscription et relevé ----

test('D1 : le magasin est dans le répertoire Git commun du clone, partagé par ses worktrees, hors de l\'arbre de travail : jamais versionné ni publié', () => {
  const clone = temporaire('clone');
  git(clone, 'init', '-q');
  git(clone, '-c', 'user.name=Epreuve', '-c', 'user.email=epreuve@exemple.invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--allow-empty', '-m', 'init');
  const magasin = magasinParDefaut(clone);
  assert.ok(memeChemin(dirname(dirname(magasin)), join(clone, '.git')), `${magasin} : sous le répertoire Git commun`);
  assert.equal(MAGASIN, 'agent2prompt/observatoire');
  const wt = join(temporaire('wt'), 'wt');
  git(clone, 'worktree', 'add', '-q', wt);
  assert.ok(memeChemin(dirname(dirname(magasinParDefaut(wt))), dirname(dirname(magasin))), 'un worktree du clone a le même magasin');
  assert.equal(magasinParDefaut(temporaire('hors-git')), null, 'hors d\'un dépôt Git, aucun magasin');
  assert.match(relever({ magasin: null }).erreurs[0], /n'est pas un dépôt Git : le magasin de l'observatoire se garde dans son répertoire Git commun/);

  const a = INSTANCES.A();
  assert.deepStrictEqual(inscrire(a, { magasin }).erreurs, []);
  assert.deepStrictEqual(relever({ magasin }).erreurs, []);
  assert.equal(git(clone, 'status', '--porcelain'), '', 'rien à versionner dans le clone');
  const fichiers = Object.keys(inventaire(magasin)).sort();
  assert.deepStrictEqual(fichiers, ['instances/' + sha256(SELS.A) + '/observations.jsonl', 'instances/' + sha256(SELS.A) + '/observations.tete', 'projets.json'].sort(), 'des miroirs d\'enveloppes et les projets inscrits, rien d\'autre');
  for (const ligne of readFileSync(join(magasin, fichiers[0]), 'utf8').trim().split('\n')) assert.deepStrictEqual(controlerEnveloppe(JSON.parse(ligne)), []);
});

test('D1 : un journal ne se relève que vérifié : un journal altéré ou réécrit depuis le dernier relevé est refusé, et son miroir ne fait que s\'allonger', () => {
  const vide = projet('vide');
  const lieux = observatoire([]);
  assert.match(inscrire(vide, lieux).erreurs[0], /aucun journal d'enveloppes/);
  const a = INSTANCES.A();
  assert.deepStrictEqual(inscrire(a, lieux), { erreurs: [], instance: sha256(SELS.A), deja: false });
  assert.deepStrictEqual(inscrire(a, lieux), { erreurs: [], instance: sha256(SELS.A), deja: true });
  const r1 = relever(lieux);
  assert.deepStrictEqual([r1.erreurs, r1.releves.map((x) => [x.ajoutees, x.total])], [[], [[24, 24]]], '20 enveloppes du champ, 4 du registre');
  const journal = () => sansCR(readFileSync(join(a, JOURNAL), 'utf8'));
  assert.equal(readFileSync(miroirDe(lieux, 'A'), 'utf8'), journal(), 'le miroir, ligne pour ligne');
  assert.deepStrictEqual(relever(lieux).releves.map((x) => x.ajoutees), [0]);

  ajouterAuChamp(a, 'ABCDE-3620', ...conformes('2026-11-07T09:00:00Z', 2, 'ABCDE-3620-3'));
  exporterInstance(a, 'A');
  const avant = readFileSync(miroirDe(lieux, 'A'), 'utf8');
  assert.deepStrictEqual(relever(lieux).releves.map((x) => x.ajoutees), [2]);
  assert.ok(readFileSync(miroirDe(lieux, 'A'), 'utf8').startsWith(avant), 'le miroir s\'allonge');

  const intact = journal();
  const lignes = intact.trim().split('\n');
  writeFileSync(join(a, JOURNAL), `${lignes.map((l, i) => (i === 4 ? l.replace(/"date":"[^"]+"/, '"date":"2026-11-04T09:31:00Z"') : l)).join('\n')}\n`);
  const miroir = readFileSync(miroirDe(lieux, 'A'), 'utf8');
  const r2 = relever(lieux);
  assert.ok(r2.erreurs.some((e) => /observations\.jsonl altéré, ligne 6 : empreinte du précédent fausse.* : son miroir reste tel quel$/.test(e)), r2.erreurs.join(' ; '));
  assert.equal(readFileSync(miroirDe(lieux, 'A'), 'utf8'), miroir);
  const q = projet('altere');
  cpSync(join(a, 'docs'), join(q, 'docs'), { recursive: true });
  assert.match(inscrire(q, lieux).erreurs[0], /altéré, .* : le projet n'est pas inscrit$/);

  // Un journal refait, cohérent mais autre : sa chaîne tient, il ne prolonge plus son miroir.
  rmSync(join(a, 'docs', 'c7e', 'observations.jsonl'));
  rmSync(join(a, 'docs', 'c7e', 'observations.tete'));
  exporterInstance(a, 'A', '1.2.0');
  const r3 = relever(lieux);
  assert.ok(r3.erreurs.some((e) => /journal réécrit depuis le dernier relevé : son miroir reste tel quel$/.test(e)), r3.erreurs.join(' ; '));
  assert.equal(readFileSync(miroirDe(lieux, 'A'), 'utf8'), miroir);

  // Un miroir altéré arrête tout relevé.
  writeFileSync(miroirDe(lieux, 'A'), miroir.replace('"OC1"', '"OC2"'));
  const r4 = relever(lieux);
  assert.ok(r4.erreurs.length > 0 && r4.erreurs.every((e) => /^magasin altéré, .* : rien n'est relevé$/.test(e)), r4.erreurs.join(' ; '));
  assert.ok(verifier(lieux).some((e) => /^miroir [0-9a-f]{8}\/observations\.jsonl, /.test(e)));
});

test('D1 : une enveloppe d\'un système ou d\'une version inconnus du dépôt est écartée de toute confrontation et signalée', () => {
  const [a, b, d] = [INSTANCES.A(), INSTANCES.B(), projet('D')];
  ajouterAuChamp(d, 'PQRST-9', ...corrige('2026-11-11T09:00:00Z', { type: 'fichier', ref: 'front/src/app/liste/pagination.ts' }, 'pagination-curseur', 1));
  exporterInstance(d, 'D', '9.9.9');
  const c = INSTANCES.C();
  const lieux = observatoire([a, b, c, d]);
  const r = confronter(lieux);
  assert.deepStrictEqual(r.erreurs, []);
  assert.equal(r.ecartees, 1, 'la correction de D, version 9.9.9');
  assert.ok(!r.candidats.some((x) => x.motif === 'pagination-curseur'), 'C seule compte : pas de récurrence avec D, au même motif et à la même profondeur');
  const e = etat(lieux);
  assert.equal(e.ecartees, 1);
  assert.deepStrictEqual(e.instances.find((i) => i.instance === PREFIXE.D).systemes.map((s) => [s.nom, s.derniere, s.ecart]), [['generateur-skill-ticket', '9.9.9', 'inconnue']]);
});

test('D1 : les journaux de chaque système d\'une instance se relèvent, chacun dans son miroir ; une instance aux journaux de sels différents n\'est pas inscrite', () => {
  const a = INSTANCES.A();
  orchestrateur(a, 'A', [DESACCORD]);
  orchestrateur(a, 'A', [DESACCORD], { concepts: `${JSON.stringify({ ...JSON.parse(DEPART), concepts: JSON.parse(DEPART).concepts.filter((c) => c.id !== 'C_PEDAGOGIE_001') }, null, 2)}\n`, date: '2026-11-21 09:00:00' });
  const lieux = observatoire([a]);
  const r = relever(lieux);
  assert.deepStrictEqual([r.erreurs, r.releves.map((x) => [x.journal, x.ajoutees])], [[], [[JOURNAL.split(sep).join('/'), 24], [JOURNAL_ORCHESTRATEUR, 2]]], 'le désaccord décidé, et le retrait d\'un concept du registre de départ');
  const dossier = join(lieux.magasin, 'instances', sha256(SELS.A));
  assert.deepStrictEqual(readdirSync(dossier).sort(), ['observations-orchestrateur-c7e.jsonl', 'observations-orchestrateur-c7e.tete', 'observations.jsonl', 'observations.tete']);
  const xs = readFileSync(join(dossier, 'observations-orchestrateur-c7e.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  for (const x of xs) assert.deepStrictEqual(controlerEnveloppe(x), []);
  const retrait = xs.find((x) => x.ancre.nature === 'concept');
  assert.deepStrictEqual([retrait.type, retrait.nature, retrait.ancre.ref], ['decision', 'retire', 'C_PEDAGOGIE_001'], 'un concept du registre de départ, en clair');
  assert.ok(controlerEnveloppe({ ...retrait, ancre: { nature: 'concept', ref: 'c-pedagogie-001' } }).some((e) => /^ancre\.ref : /.test(e)), 'un identifiant de concept d\'une autre forme est refusé');
  assert.deepStrictEqual(etat(lieux).instances[0].systemes.map((s) => [s.nom, s.derniere, s.ecart]), [['generateur-skill-ticket', '1.3.0', 'a-jour'], ['orchestrateur-c7e', VERSION_ORCHESTRATEUR, 'a-jour']]);

  const b = INSTANCES.B();
  const autre = projet('autre-sel');
  orchestrateur(autre, 'C', [['2026-11-10', 'FGHIJ-100', 'java:D4.INV-1', 'changeset modifié en place', 'respecter : un nouveau changeset']]);
  for (const f of [JOURNAL_ORCHESTRATEUR, JOURNAL_ORCHESTRATEUR.replace(/\.jsonl$/, '.tete')]) cpSync(join(autre, f), join(b, f));
  assert.match(inscrire(b, observatoire([])).erreurs[0], /ses journaux viennent d'instances différentes$/);
});

// ---- D2 : confrontation ----

test('D2 : une récurrence compte des instances distinctes : un même motif, à la même profondeur, pour un même système, dans au moins deux instances', () => {
  const [a, b, c] = [INSTANCES.A(), INSTANCES.B(), INSTANCES.C()];
  const copieDeB = projet('B2');
  cpSync(join(b, 'docs'), join(copieDeB, 'docs'), { recursive: true });
  // D : des verdicts conformes et un écart sur des critères, comme A : des motifs génériques, à la même profondeur.
  const d = projet('D');
  ajouterAuChamp(d, 'PQRST-9', ...conformes('2026-11-11T09:00:00Z', 2, 'PQRST-9'), { ...conformes('2026-11-11T10:00:00Z', 1, 'PQRST-9-E')[0], verdict: 'ecart', ecart: 'le critère C1 échoue' });
  exporterInstance(d, 'D');
  const lieux = observatoire([a, b, c, copieDeB, d]);
  const r = confronter(lieux);
  assert.deepStrictEqual(r.erreurs, []);
  assert.equal(r.instances, 4, 'cinq projets, quatre instances : la copie de B est B');
  assert.deepStrictEqual(r.candidats.map(cle), ['retour generateur-skill-ticket commit-hors-plan-back micro', 'recurrence generateur-skill-ticket requete-native meso-composants']);
  const recurrence = r.candidats[1];
  assert.deepStrictEqual([recurrence.instances, recurrence.versions], [2, ['1.3.0']]);
  assert.deepStrictEqual([...new Set(recurrence.references.map((x) => x.split(':')[0]))].sort(), [PREFIXE.A, PREFIXE.B].sort());
  assert.ok(!r.candidats.some((x) => ['ecart', 'conforme', 'correction', 'desaccord-entre-noeuds', 'pagination-curseur'].includes(x.motif)), 'ni motif générique, ni motif d\'une seule instance');
  const seule = confronter(observatoire([b]));
  assert.deepStrictEqual(seule.candidats, [], 'une instance seule ne fait pas de récurrence');
});

test('D2 : un retour remonte dès une instance : une proposition qui vise la spécification, retenue par le développeur de l\'instance', () => {
  const a = INSTANCES.A();
  const r = confronter(observatoire([a]));
  assert.deepStrictEqual(r.candidats.map(cle), ['retour generateur-skill-ticket commit-hors-plan-back micro'], 'le choix retenu sur une proposition du champ vise l\'instance : il n\'est pas un retour');
  assert.deepStrictEqual([r.candidats[0].instances, r.candidats[0].references], [1, [21, 22, 23, 24].map((n) => `${PREFIXE.A}:${n}`)], 'les deux relevés, la proposition et sa décision');
  const refusee = projet('A-refusee', { exemple: true });
  registre(refusee, 'refusee');
  exporterInstance(refusee, 'E');
  assert.deepStrictEqual(confronter(observatoire([refusee])).candidats, [], 'une proposition refusée par l\'instance ne remonte pas');
});

// ---- D6 : confrontation entre systèmes ----

test('D6 : un même invariant du dépôt, relevé par des écarts distincts de deux systèmes, ou dans deux instances, est un candidat ; un même écart ne compte qu\'une fois', () => {
  const a = INSTANCES.A();
  orchestrateur(a, 'A', [DESACCORD]);
  const seul = confronter(observatoire([a]));
  assert.deepStrictEqual(seul.candidats.map(cle), ['retour generateur-skill-ticket commit-hors-plan-back micro'], 'le désaccord du champ et sa ligne décidée au registre des écarts : un seul écart, compté une fois');
  orchestrateur(a, 'A', [DESACCORD, AUTRE_DESACCORD], { date: '2026-11-21 09:00:00' });
  const deux = confronter(observatoire([a]));
  const c = deux.candidats.find((x) => x.sorte === 'invariant');
  assert.deepStrictEqual({ ...c, references: undefined }, {
    sorte: 'invariant', systeme: 'orchestrateur-c7e', motif: 'ecart-orchestrateur-c7e-d6-inv-3', invariant: 'orchestrateur-c7e:D6.INV-3', systemes: ['generateur-skill-ticket', 'orchestrateur-c7e'],
    versions: [VERSION_ORCHESTRATEUR], instances: 1, ecarts: 2, enveloppes: 3, references: undefined,
  }, 'deux écarts distincts, deux systèmes : le candidat va à la spécification qui définit l\'invariant, à sa version courante');
  assert.deepStrictEqual(c.references, [`${PREFIXE.A}:generateur-skill-ticket:${numeroDuGenerateur(a, 'orchestrateur-c7e:D6.INV-3')}`, `${PREFIXE.A}:orchestrateur-c7e:1`, `${PREFIXE.A}:orchestrateur-c7e:2`]);

  // B et C : l'orchestrateur seul, un même invariant de java dans deux instances ; un invariant de l'orchestrateur
  // sur deux tickets de B, un seul système dans une seule instance ; un invariant que le dépôt d'épreuve ne définit pas.
  const [b, d] = [INSTANCES.B(), INSTANCES.C()];
  const sansDefinition = (cle) => ['2026-11-10', cle, 'SC2.INV-1', 'contrat changé sans version', 'respecter : une version 2'];
  orchestrateur(b, 'B', [
    ['2026-11-10', 'FGHIJ-100', 'java:D4.INV-1', 'changeset modifié en place', 'respecter : un nouveau changeset'],
    ['2026-11-10', 'FGHIJ-100', 'D8.INV-2', 'contradiction avec le socle', 'respecter : le socle l\'emporte'],
    ['2026-11-11', 'FGHIJ-101', 'D8.INV-2', 'contradiction avec le socle', 'respecter : le socle l\'emporte'],
    sansDefinition('FGHIJ-100'),
  ]);
  orchestrateur(d, 'C', [['2026-11-12', 'KLMNO-7', 'java:D4.INV-1', 'changeset modifié en place', `dérogation validée par ${PAR}`], sansDefinition('KLMNO-7')]);
  const r = confronter(observatoire([b, d]));
  assert.deepStrictEqual(r.candidats.filter((x) => x.sorte === 'invariant').map((x) => [x.invariant, x.systeme, x.motif, x.systemes, x.versions, x.instances, x.ecarts, x.enveloppes]), [
    ['java:D4.INV-1', 'java', 'ecart-java-d4-inv-1', ['orchestrateur-c7e'], ['1.1.1'], 2, 2, 2],
  ], 'java : deux instances ; D8.INV-2 : deux écarts, un système, une instance ; SC2.INV-1 : non défini par le dépôt d\'épreuve');
});

test('D6 : un candidat par invariant se propose à la spécification qui le définit, avec les systèmes qui l\'ont relevé, et ses références nomment le système de chaque enveloppe', () => {
  const a = INSTANCES.A();
  orchestrateur(a, 'A', [DESACCORD, AUTRE_DESACCORD]);
  const lieux = observatoire([a]);
  const sortie = lancer(lieux, 'confronter').sortie;
  assert.match(sortie, /^ {2}invariant {2}orchestrateur-c7e, ecart-orchestrateur-c7e-d6-inv-3 : orchestrateur-c7e:D6\.INV-3, 2 systèmes, 1 instance, 3 enveloppes$/m);
  assert.match(sortie, /^moins de 2 instances : aucune récurrence ni règle trop large possible ; seuls remontent les retours, et les invariants relevés par deux systèmes$/m);
  const r = proposer({ ...lieux, date: '2026-11-24' });
  const fichier = `${PROPOSITIONS}/2026-11-24-orchestrateur-c7e-ecart-orchestrateur-c7e-d6-inv-3.md`;
  assert.ok(r.ecrites.includes(fichier), r.ecrites.join(' ; '));
  const texte = readFileSync(join(lieux.depot, fichier), 'utf8');
  const { entete, erreurs } = controlerProposition(texte);
  assert.deepStrictEqual(erreurs, []);
  assert.deepStrictEqual([entete.sorte, entete.systeme, entete.invariant, entete.systemes, entete.versions, entete.profondeur, entete.instances, entete.enveloppes], ['invariant', 'orchestrateur-c7e', 'orchestrateur-c7e:D6.INV-3', ['generateur-skill-ticket', 'orchestrateur-c7e'], [VERSION_ORCHESTRATEUR], undefined, 1, 3]);
  for (const v of ['ABCDE', 'fuseau', 'pagination', PAR, ...Object.values(SELS), sha256(SELS.A)]) assert.ok(!texte.includes(v), `« ${v} » en clair`);
  const cas = [
    [texte.replace('systeme: orchestrateur-c7e', 'systeme: java'), /invariant : l'identifiant d'un invariant du dépôt, préfixé par la spécification visée/],
    [texte.replace(/^systemes: .*\n/m, ''), /systemes : la liste des systèmes/],
    [texte.replace(/^references: \[([0-9a-f]{8}):generateur-skill-ticket:/m, 'references: [$1:'), /references : une liste de références tronquées, instance:systeme:numero/],
    [texte.replace(/^references: \[([0-9a-f]{8}):generateur-skill-ticket:/m, 'references: [$1:java:'), /references : .* d'un système de la liste/],
    [texte.replace('statut: ouverte', 'profondeur: micro\nstatut: ouverte'), /profondeur : aucune pour une proposition par invariant/],
    [texte.replace(/^motif: .*$/m, 'motif: desaccord-entre-noeuds'), /motif « desaccord-entre-noeuds » : ecart-orchestrateur-c7e-d6-inv-3/],
    [texte.replace('sorte: invariant', 'sorte: recurrence'), /invariant, systemes : seulement pour une proposition par invariant/],
  ];
  for (const [mute, motif] of cas) assert.ok(controlerProposition(mute).erreurs.some((e) => motif.test(e)), `${motif} : ${controlerProposition(mute).erreurs.join(' ; ')}`);
  assert.deepStrictEqual(proposer({ ...lieux, date: '2026-11-25' }).ignorees.map((i) => i.raison.split(' : ')[0]), ['déjà proposée, ouverte', 'déjà proposée, ouverte']);

  ecrireStatut(lieux.depot, fichier, `statut: ratifiee\nversion: ${ORCHESTRATEUR_SUIVANT}\npr: 90`);
  const s = suivre(lieux).suivis.find((x) => x.fichier === fichier);
  assert.deepStrictEqual([s.sorte, s.invariant, s.effet, s.avant, s.apres], ['invariant', 'orchestrateur-c7e:D6.INV-3', 'indecidable', { motif: 2, enveloppes: 2 }, { motif: 0, enveloppes: 0 }], 'les écarts qui citent l\'invariant, parmi les enveloppes de la spécification qui le définit');
});

test('D2 : une décision vise une enveloppe du journal de son propre système : la décision d\'un système ne retient pas la proposition d\'un autre', () => {
  // Le générateur propose, pour sa spécification, sans décision ; l'orchestrateur promeut un concept proposé dans son
  // propre journal. Les deux enveloppes visées portent le même numéro, 1, chacune dans son journal.
  const p = projet('index');
  const date = '2026-11-20T09:00:00Z';
  ecrireJournal(p, JOURNAL.split(sep).join('/'), 'A', [
    { date, systeme: { nom: 'generateur-skill-ticket', version: '1.3.0' }, ordre: 'OC2', niveau: 'N2', type: 'proposition', motif: 'commit-hors-plan-back', sujet: 'agent:generateur-skill-ticket', source: { format: 'generateur.apprentissage/1', numero: 3 }, nature: 'recurrence', profondeur: 'micro', cible: 'specification', ancre: { nature: 'ticket', ref: sha256('ticket') } },
  ]);
  const concept = { nature: 'concept', ref: sha256('concept') };
  ecrireJournal(p, JOURNAL_ORCHESTRATEUR, 'A', [
    { date, systeme: { nom: 'orchestrateur-c7e', version: VERSION_ORCHESTRATEUR }, ordre: 'OC2', niveau: 'humain', type: 'proposition', motif: 'concept-observabilite', sujet: 'developpeur', source: { format: 'orchestrateur.concepts/1', numero: 1 }, nature: 'proposed', cible: 'instance', ancre: concept },
    { date, systeme: { nom: 'orchestrateur-c7e', version: VERSION_ORCHESTRATEUR }, ordre: 'OC2', niveau: 'humain', type: 'decision', motif: 'concept-observabilite', sujet: 'referent', source: { format: 'orchestrateur.concepts/1', numero: 2 }, nature: 'experimental', cible: 'instance', ancre: concept, decision: { valeur: 'retenue', vise: 1 } },
  ]);
  const r = confronter(observatoire([p]));
  assert.deepStrictEqual(r.erreurs, []);
  assert.deepStrictEqual(r.candidats, [], 'la promotion d\'un concept de l\'orchestrateur ne retient pas la proposition du générateur de même numéro');
});

// ---- D8 : confrontation de l'acceptable ----

test('D8 : les refus se confrontent par règle : refus, dérogations et faux refus comptés par système et par instance ; aucun ne fait de retour, de récurrence ni de candidat par invariant', () => {
  const [a, b] = [projet('A'), projet('B')];
  binome(a, 'A', livrableA2D('ECR-1', [
    refusDe(100, '2026-11-20T09:00:00Z', 'perimetre', ['SA1.INV-1']),
    refusDe(110, '2026-11-20T09:10:00Z', 'commandes', ['D6.INV-2'], reponseDe('deroger', 'referent', 111, '2026-11-20T09:11:00Z')),
  ]));
  binome(b, 'B', livrableA2D('FGH-2', [refusDe(200, '2026-11-21T09:00:00Z', 'commandes', ['D6.INV-2'], reponseDe('deroger', 'developpeur', 201, '2026-11-21T09:01:00Z'))]),
    journalA2T('C-1', 'FGH-2', [refusDe(300, '2026-11-21T10:00:00Z', 'perimetre', ['SA1.INV-1', 'D1.INV-5'], reponseDe('faux-refus', 'testeur', 301, '2026-11-21T10:01:00Z'))]));
  const lieux = observatoire([a, b]);
  const r = confronter(lieux);
  assert.deepStrictEqual(r.erreurs, []);
  assert.deepStrictEqual(r.candidats, [], 'deux dérogations d\'une même règle dans deux instances ne font pas de candidat par invariant ; un faux refus d\'une seule instance ne fait pas de règle trop large');
  assert.deepStrictEqual(r.acceptable, [
    { invariant: 'agent2dev:D6.INV-2', refus: 2, derogations: 2, fauxRefus: 0, systemes: ['agent2dev'], instances: 2 },
    { invariant: 'socle-acceptable:SA1.INV-1', refus: 2, derogations: 0, fauxRefus: 1, systemes: ['agent2dev', 'agent2test'], instances: 2 },
  ]);
  const sortie = lancer(lieux, 'confronter').sortie;
  assert.match(sortie, /^acceptable : 2 règles citées par des refus$/m);
  assert.match(sortie, /^ {2}socle-acceptable:SA1\.INV-1 : 2 refus, 0 dérogation, 1 faux refus ; agent2dev, agent2test ; 2 instances$/m);
  assert.deepStrictEqual(etat(lieux).instances.find((i) => i.instance === PREFIXE.B).systemes.map((s) => [s.nom, s.derniere, s.ecart]), [['agent2dev', VERSION_A2D, 'a-jour'], ['agent2test', VERSION_A2T, 'a-jour']]);
  assert.deepStrictEqual(proposer({ ...lieux, date: '2026-11-25' }).ecrites, [], 'rien à proposer');
});

test('D8 : une règle déclarée infondée par des faux refus dans deux instances est proposée, trop large, à la spécification qui la définit ; des faux refus d\'une seule instance ne font que se compter', () => {
  const [a, b] = [projet('A'), projet('B')];
  // Une règle que le dépôt ne définit pas, venue d'un système plus récent que le clone : elle se compte, sans candidat.
  const inconnue = (n, date) => refusDe(n, date, 'commandes', ['D99.INV-9'], reponseDe('faux-refus', 'developpeur', n + 1, date));
  binome(a, 'A',
    livrableA2D('ECR-1', [refusDe(100, '2026-11-20T09:00:00Z', 'perimetre', ['SA1.INV-1'], reponseDe('faux-refus', 'developpeur', 101, '2026-11-20T09:01:00Z'))]),
    livrableA2D('ECR-2', [refusDe(120, '2026-11-20T10:00:00Z', 'perimetre', ['D1.INV-5'], reponseDe('faux-refus', 'referent', 121, '2026-11-20T10:01:00Z')), inconnue(130, '2026-11-20T11:00:00Z')]));
  const seule = confronter(observatoire([a]));
  assert.deepStrictEqual(seule.candidats, [], 'une seule instance : les faux refus se comptent');
  assert.deepStrictEqual(seule.acceptable.map((x) => [x.invariant, x.fauxRefus, x.instances]), [['agent2dev:D1.INV-5', 1, 1], ['agent2dev:D99.INV-9', 1, 1], ['socle-acceptable:SA1.INV-1', 1, 1]]);
  binome(b, 'B',
    journalA2T('C-7', 'KLM-3', [refusDe(400, '2026-11-22T09:00:00Z', 'perimetre', ['SA1.INV-1'], reponseDe('faux-refus', 'referent-qualite', 401, '2026-11-22T09:01:00Z'))]),
    livrableA2D('KLM-3', [refusDe(500, '2026-11-22T10:00:00Z', 'perimetre', ['D1.INV-5'], reponseDe('faux-refus', 'developpeur', 501, '2026-11-22T10:01:00Z')), inconnue(510, '2026-11-22T11:00:00Z')]));
  const lieux = observatoire([a, b]);
  const r = confronter(lieux);
  assert.deepStrictEqual(r.erreurs, []);
  assert.deepStrictEqual(r.candidats.map((c) => [c.sorte, c.systeme, c.motif, c.invariant, c.systemes, c.versions, c.instances, c.enveloppes]), [
    ['faux-refus', 'agent2dev', 'faux-refus-agent2dev-d1-inv-5', 'agent2dev:D1.INV-5', ['agent2dev'], [VERSION_A2D], 2, 2],
    ['faux-refus', 'socle-acceptable', 'faux-refus-socle-acceptable-sa1-inv-1', 'socle-acceptable:SA1.INV-1', ['agent2dev', 'agent2test'], [VERSION_SA], 2, 2],
  ], 'la règle du noyau va au socle de l\'acceptable, la règle de la constitution à Agent2Dev, chacune à sa version courante ; D99.INV-9, que le dépôt ne définit pas, n\'en fait pas');
  assert.deepStrictEqual(r.acceptable.find((x) => x.invariant === 'agent2dev:D99.INV-9'), { invariant: 'agent2dev:D99.INV-9', refus: 2, derogations: 0, fauxRefus: 2, systemes: ['agent2dev'], instances: 2 });
  assert.deepStrictEqual(r.candidats[1].references.slice().sort(), [`${PREFIXE.A}:agent2dev:2`, `${PREFIXE.B}:agent2test:2`].sort(), 'les faux refus, par instance, système et numéro');
  assert.match(lancer(lieux, 'confronter').sortie, /^ {2}faux-refus {2}socle-acceptable, faux-refus-socle-acceptable-sa1-inv-1 : socle-acceptable:SA1\.INV-1, 2 systèmes, 2 instances, 2 enveloppes$/m);

  const ecrites = proposer({ ...lieux, date: '2026-11-25' }).ecrites;
  const fichier = `${PROPOSITIONS}/2026-11-25-socle-acceptable-faux-refus-socle-acceptable-sa1-inv-1.md`;
  assert.deepStrictEqual(ecrites, [`${PROPOSITIONS}/2026-11-25-agent2dev-faux-refus-agent2dev-d1-inv-5.md`, fichier]);
  const texte = readFileSync(join(lieux.depot, fichier), 'utf8');
  const { entete, erreurs } = controlerProposition(texte);
  assert.deepStrictEqual(erreurs, []);
  assert.deepStrictEqual([entete.sorte, entete.systeme, entete.invariant, entete.systemes, entete.versions, entete.profondeur, entete.instances, entete.enveloppes], ['faux-refus', 'socle-acceptable', 'socle-acceptable:SA1.INV-1', ['agent2dev', 'agent2test'], [VERSION_SA], undefined, 2, 2]);
  assert.match(texte, /^# Proposition : règle trop large, socle-acceptable:SA1\.INV-1$/m);
  for (const v of ['ECR-', 'KLM-', 'C-7', 'Dupont', 'objet-d-epreuve', ...Object.values(SELS), sha256(SELS.A)]) assert.ok(!texte.includes(v), `« ${v} » en clair`);
  const cas = [
    [texte.replace(/^motif: .*$/m, 'motif: ecart-socle-acceptable-sa1-inv-1'), /motif « ecart-socle-acceptable-sa1-inv-1 » : faux-refus-socle-acceptable-sa1-inv-1/],
    [texte.replace('sorte: faux-refus', 'sorte: invariant'), /motif « faux-refus-socle-acceptable-sa1-inv-1 » : ecart-socle-acceptable-sa1-inv-1/],
    [texte.replace('statut: ouverte', 'profondeur: micro\nstatut: ouverte'), /profondeur : aucune pour une proposition par invariant ou par faux refus/],
    [texte.replace('sorte: faux-refus', 'sorte: recurrence'), /invariant, systemes : seulement pour une proposition par invariant ou par faux refus/],
    [texte.replace('sorte: faux-refus', 'sorte: refus'), /sorte « refus » : retour, recurrence, invariant ou faux-refus/],
    [texte.replace('systeme: socle-acceptable', 'systeme: agent2dev'), /invariant : l'identifiant d'un invariant du dépôt, préfixé par la spécification visée/],
  ];
  for (const [mute, motif] of cas) assert.ok(controlerProposition(mute).erreurs.some((e) => motif.test(e)), `${motif} : ${controlerProposition(mute).erreurs.join(' ; ')}`);
  assert.deepStrictEqual(proposer({ ...lieux, date: '2026-11-26' }).ignorees.map((i) => i.raison.split(' : ')[0]), ['déjà proposée, ouverte', 'déjà proposée, ouverte']);

  // Ratifiées : l'effet se mesure sur les faux refus qui citent la règle, dans les enveloppes de la spécification qui
  // la définit ; le socle de l'acceptable n'exporte pas : indécidable.
  ecrireStatut(lieux.depot, fichier, `statut: ratifiee\nversion: ${suivante(VERSION_SA)}\npr: 95`);
  ecrireStatut(lieux.depot, ecrites[0], `statut: ratifiee\nversion: ${suivante(VERSION_A2D)}\npr: 96`);
  const suivis = suivre(lieux).suivis;
  const s = (f) => suivis.find((x) => x.fichier === f);
  assert.deepStrictEqual([s(fichier).sorte, s(fichier).effet, s(fichier).avant, s(fichier).apres], ['faux-refus', 'indecidable', { motif: 0, enveloppes: 0 }, { motif: 0, enveloppes: 0 }]);
  assert.deepStrictEqual([s(ecrites[0]).effet, s(ecrites[0]).avant, s(ecrites[0]).apres], ['indecidable', { motif: 2, enveloppes: 10 }, { motif: 0, enveloppes: 0 }], 'deux faux refus de la règle parmi les dix enveloppes d\'Agent2Dev');
});

// ---- D3 : état de l'écosystème ----

test('D9 : les kits se comptent par système et par environnement, remis, validés, appliqués, en échec, défaits, en attente, sans nettoyage, avec leurs instances ; aucun ne fait de retour, de récurrence ni de candidat', () => {
  const [a, b] = [projet('A'), projet('B')];
  binome(a, 'A',
    livrableA2D('ECR-1', [], [
      kitDe(100, '2026-11-20T09:00:00Z', 'dev', '1'.repeat(64), { validation: etapeDe(101, '2026-11-20T09:01:00Z', 'developpeur'), application: etapeDe(102, '2026-11-20T09:05:00Z', 'developpeur', 'applique'), retourArriere: etapeDe(103, '2026-11-20T10:00:00Z', 'developpeur') }),
      kitDe(110, '2026-11-20T11:00:00Z', 'dev', '2'.repeat(64), { validation: etapeDe(111, '2026-11-20T11:01:00Z', 'developpeur') }),
    ]),
    journalA2T('C-1', 'ECR-1', [], [kitDe(200, '2026-11-20T12:00:00Z', 'test', '3'.repeat(64), { validation: etapeDe(201, '2026-11-20T12:01:00Z', 'testeur'), application: etapeDe(202, '2026-11-20T12:05:00Z', 'developpeur', 'applique') })]));
  binome(b, 'B', livrableA2D('FGH-2', [], [
    kitDe(300, '2026-11-21T09:00:00Z', 'dev', '4'.repeat(64), { validation: etapeDe(301, '2026-11-21T09:01:00Z', 'developpeur'), application: etapeDe(302, '2026-11-21T09:05:00Z', 'developpeur', 'echec') }),
    kitDe(310, '2026-11-21T10:00:00Z', 'dev', '5'.repeat(64)),
    kitDe(320, '2026-11-21T11:00:00Z', 'dev', '6'.repeat(64), { validation: etapeDe(321, '2026-11-21T11:01:00Z', 'developpeur'), application: etapeDe(322, '2026-11-21T11:05:00Z', 'developpeur', 'applique') }),
  ]));
  const lieux = observatoire([a, b]);
  const r = confronter(lieux);
  assert.deepStrictEqual(r.erreurs, []);
  assert.deepStrictEqual(r.kits, [
    { systeme: 'agent2dev', environnement: 'dev', remis: 5, valides: 4, appliques: 2, echecs: 1, retoursArriere: 1, enAttente: 1, nonNettoyes: 0, instances: 2 },
    { systeme: 'agent2test', environnement: 'test', remis: 1, valides: 1, appliques: 1, echecs: 0, retoursArriere: 0, enAttente: 0, nonNettoyes: 1, instances: 1 },
  ], 'un échec comprend son retour arrière : il ne compte pas parmi les kits défaits ; un kit dev appliqué sans retour arrière n\'est pas un kit test à nettoyer');
  assert.deepStrictEqual([r.candidats, r.acceptable], [[], []], 'aucun retour, aucune récurrence dans deux instances, aucun candidat par invariant ni par faux refus : des comptes seulement');
  assert.deepStrictEqual(proposer({ ...lieux, date: '2026-11-25' }).ecrites, [], 'rien à proposer');
  const sortie = lancer(lieux, 'confronter').sortie;
  assert.match(sortie, /^kits : des comptes, sans candidat$/m);
  assert.match(sortie, /^ {2}agent2dev, kit dev : 5 remis, 4 validés, 2 appliqués, 1 échec, 1 défait ; 1 en attente d'application ; 2 instances$/m);
  assert.match(sortie, /^ {2}agent2test, kit test : 1 remis, 1 validé, 1 appliqué, 0 échec, 0 défait ; 1 sans nettoyage déclaré ; 1 instance$/m);
  assert.deepStrictEqual(JSON.parse(lancer(lieux, 'confronter', '--json').sortie).kits, r.kits);
  const instances = etat(lieux).instances;
  const systemesDe = (nom) => instances.find((i) => i.instance === PREFIXE[nom]).systemes.map((s) => [s.nom, s.ecart]);
  assert.deepStrictEqual([systemesDe('A'), systemesDe('B')], [[['agent2dev', 'a-jour'], ['agent2test', 'a-jour']], [['agent2dev', 'a-jour']]], 'les kits comptent dans l\'état de l\'écosystème comme toute enveloppe');
});

test('D10 : les décisions aux points de validation se comptent par système et par point, retenues, amendées, refusées, en attente, avec leurs délais médian et maximal et leurs instances ; aucun candidat', () => {
  const [a, b] = [projet('A'), projet('B')];
  binome(a, 'A', livrableA2D('ECR-1', [], null, [
    pointDe(100, '2026-11-20T09:00:00Z', 'V2', decisionDe(101, '2026-11-20T09:30:00Z', 'corriger')),
    pointDe(102, '2026-11-20T10:00:00Z', 'V2', decisionDe(103, '2026-11-20T10:10:00Z', 'valider')),
    pointDe(104, '2026-11-20T10:20:00Z', 'V3'),
  ]));
  // Chez B, la décision arrive après une présentation plus récente : la date de son enveloppe est avancée, son délai non.
  const [p200, p202] = [pointDe(200, '2026-11-21T09:00:00Z', 'V2'), pointDe(202, '2026-11-21T12:00:00Z', 'V2')];
  binome(b, 'B', livrableA2D('FGH-2', [], null, [p200, p202]));
  binome(b, 'B', livrableA2D('FGH-2', [], null, [{ ...p200, decision: decisionDe(201, '2026-11-21T11:00:00Z', 'rejeter') }, p202]));
  const lieux = observatoire([a, b]);
  const r = confronter(lieux);
  assert.deepStrictEqual(r.erreurs, []);
  assert.deepStrictEqual(r.signaux, [
    { systeme: 'agent2dev', point: 'V2', presentes: 4, retenues: 1, amendees: 1, refusees: 1, enAttente: 1, delaiMedian: 1800, delaiMax: 7200, instances: 2 },
    { systeme: 'agent2dev', point: 'V3', presentes: 1, retenues: 0, amendees: 0, refusees: 0, enAttente: 1, delaiMedian: null, delaiMax: null, instances: 1 },
  ], 'le délai vient de la mesure de chaque décision : 1 800, 600 et 7 200 secondes, et non des dates de ses enveloppes, qui en donneraient 10 800 chez B');
  assert.deepStrictEqual([r.candidats, r.acceptable, r.kits], [[], [], []], 'une décision retenue sur une présentation n\'est pas un retour, ni une récurrence, ni un écart : des comptes seulement');
  assert.deepStrictEqual(proposer({ ...lieux, date: '2026-11-25' }).ecrites, [], 'rien à proposer');
  const sortie = lancer(lieux, 'confronter').sortie;
  assert.match(sortie, /^signaux des points de validation : des comptes, sans candidat$/m);
  assert.match(sortie, /^ {2}agent2dev, point V2 : 4 présentations, 1 retenue, 1 amendée, 1 refusée, 1 en attente ; délai médian 30 min, maximal 2,0 h ; 2 instances$/m);
  assert.match(sortie, /^ {2}agent2dev, point V3 : 1 présentation, 0 retenue, 0 amendée, 0 refusée, 1 en attente ; aucun délai ; 1 instance$/m);
  assert.deepStrictEqual(JSON.parse(lancer(lieux, 'confronter', '--json').sortie).signaux, r.signaux);
  // Une enveloppe à la mesure mal formée n'entre pas : le schéma fermé du socle la refuse.
  const x = sansCR(readFileSync(join(b, 'docs', 'c7e', 'observations-agent2dev.jsonl'), 'utf8')).trim().split('\n').map((l) => JSON.parse(l))[2];
  assert.deepStrictEqual([x.type, x.date, x.mesure], ['decision', '2026-11-21T12:00:00Z', { nom: 'delai-decision', valeur: 7200 }], 'la décision de B : date avancée, délai intact');
  assert.deepStrictEqual(controlerEnveloppe(x), []);
  assert.match(controlerEnveloppe({ ...x, mesure: { nom: 'Délai', valeur: -1 } }).join(' ; '), /mesure\.nom « Délai » : le nom que définit une correspondance.*mesure\.valeur -1 : un entier positif ou nul/);
  assert.match(controlerEnveloppe({ ...x, mesure: { nom: 'delai-decision', valeur: 7200, unite: 's' } }).join(' ; '), /champ inconnu mesure\.unite/);
});

test('D3 : chaque instance est comparée aux versions publiées des systèmes qu\'elle exporte : à jour, en retard, ou inconnue', () => {
  const [a, b] = [INSTANCES.A('1.3.0'), INSTANCES.B('1.4.0')];
  const d = projet('D');
  ajouterAuChamp(d, 'PQRST-9', ...conformes('2026-11-11T09:00:00Z', 1, 'PQRST-9'));
  exporterInstance(d, 'D', '9.9.9');
  const lieux = observatoire([a, b, d], { depot: depot({ courante: '1.4.0' }) });
  const e = etat(lieux);
  assert.deepStrictEqual(e.erreurs, []);
  const vue = Object.fromEntries(e.instances.map((i) => [i.instance, i.systemes.map((s) => [s.derniere, s.publiee, s.ecart])]));
  assert.deepStrictEqual(vue, { [PREFIXE.A]: [['1.3.0', '1.4.0', 'en-retard']], [PREFIXE.B]: [['1.4.0', '1.4.0', 'a-jour']], [PREFIXE.D]: [['9.9.9', '1.4.0', 'inconnue']] });
  assert.deepStrictEqual(e.instances.find((i) => i.instance === PREFIXE.A).chemins, [a]);
});

// ---- D4 : propositions ----

test('D4 : une proposition ne porte que des valeurs minimisées, et aucun texte, chemin ni nom d\'une instance n\'entre dans le dépôt', () => {
  const [a, b, c] = [INSTANCES.A(), INSTANCES.B(), INSTANCES.C()];
  const lieux = observatoire([a, b, c]);
  const r = proposer({ ...lieux, date: '2026-11-24' });
  assert.deepStrictEqual(r.erreurs, []);
  assert.deepStrictEqual(r.ecrites, [
    `${PROPOSITIONS}/2026-11-24-generateur-skill-ticket-commit-hors-plan-back-micro.md`,
    `${PROPOSITIONS}/2026-11-24-generateur-skill-ticket-requete-native-meso-composants.md`,
  ]);
  const enClair = ['ABCDE', 'FGHIJ', 'KLMNO', 'Dupont', 'client', PAR, RESUME, 'exemple', a, b, c, ...Object.values(SELS), ...Object.values(SELS).map((s) => sha256(s))];
  for (const f of r.ecrites) {
    const texte = readFileSync(join(lieux.depot, f), 'utf8');
    const { entete, erreurs } = controlerProposition(texte);
    assert.deepStrictEqual(erreurs, [], f);
    assert.equal(entete.statut, 'ouverte');
    for (const v of enClair) assert.ok(!texte.includes(v), `${f} : « ${v} » en clair`);
  }
  const { entete } = controlerProposition(readFileSync(join(lieux.depot, r.ecrites[1]), 'utf8'));
  assert.deepStrictEqual([entete.sorte, entete.motif, entete.profondeur, entete.instances, entete.versions], ['recurrence', 'requete-native', 'meso-composants', 2, ['1.3.0']]);
  const bon = readFileSync(join(lieux.depot, r.ecrites[0]), 'utf8');
  const cas = [
    [bon.replace('statut: ouverte', 'statut: ouverte\nchemin: /home/dev/clients/dupont'), /clé inconnue chemin/],
    [bon.replace(/^motif: .*$/m, 'motif: Requête native du client'), /motif « Requête native du client »/],
    [bon.replace(/^references: \[.*\]$/m, `references: [${sha256(SELS.A)}:21]`), /references : une liste de références tronquées/],
    [bon.replace('statut: ouverte', 'statut: ratifiee'), /version : la version du système qui porte la proposition ratifiée/],
    [bon.replace('statut: ouverte', 'statut: ouverte\npr: 80'), /pr : le numéro de la pull request/],
    [bon.replace('format: observatoire.proposition/1', 'format: autre/1'), /format « autre\/1 »/],
    [bon.replace(/^---\n/, ''), /en-tête absent/],
  ];
  for (const [texte, motif] of cas) {
    const { erreurs } = controlerProposition(texte);
    assert.ok(erreurs.some((e) => motif.test(e)), `${motif} : ${erreurs.join(' ; ')}`);
  }
});

test('D4 : l\'observatoire n\'écrit dans le dépôt que des propositions, sans toucher aux projets ; une ouverte ou une ratifiée ne se répète pas, une refusée ne revient qu\'avec une instance nouvelle', () => {
  const [a, b, c] = [INSTANCES.A(), INSTANCES.B(), INSTANCES.C()];
  const lieux = observatoire([a, b, c]);
  const projets = [a, b, c].map((p) => inventaire(p));
  const avant = inventaire(lieux.depot);
  const r1 = proposer({ ...lieux, date: '2026-11-24' });
  assert.equal(r1.ecrites.length, 2);
  const apres = inventaire(lieux.depot);
  assert.deepStrictEqual(Object.keys(apres).filter((k) => !(k in avant)).sort(), r1.ecrites.slice().sort(), 'rien que les propositions');
  for (const [k, v] of Object.entries(avant)) assert.equal(apres[k], v, `${k} inchangé`);
  assert.deepStrictEqual([a, b, c].map((p) => inventaire(p)), projets, 'les projets sont seulement lus');

  const r2 = proposer({ ...lieux, date: '2026-11-25' });
  assert.deepStrictEqual([r2.ecrites, r2.ignorees.map((i) => i.raison.split(' : ')[0])], [[], ['déjà proposée, ouverte', 'déjà proposée, ouverte']]);
  ecrireStatut(lieux.depot, r1.ecrites[0], 'statut: ratifiee\nversion: 1.4.0\npr: 80');
  ecrireStatut(lieux.depot, r1.ecrites[1], 'statut: refusee\npr: 81');
  const r3 = proposer({ ...lieux, date: '2026-11-26' });
  assert.deepStrictEqual([r3.ecrites, r3.ignorees.map((i) => i.raison.split(' : ')[0])], [[], ['déjà ratifiée, en 1.4.0', 'refusée, sans instance nouvelle']]);

  const e = projet('E');
  ajouterAuChamp(e, 'UVWXY-3', ...corrige('2026-11-20T09:00:00Z', { type: 'scenario', ref: 'UVWXY-3-S01' }, 'requete-native', 1));
  exporterInstance(e, 'E');
  assert.deepStrictEqual(inscrire(e, lieux).erreurs, []);
  const r4 = proposer({ ...lieux, date: '2026-11-27' });
  assert.deepStrictEqual(r4.ecrites, [`${PROPOSITIONS}/2026-11-27-generateur-skill-ticket-requete-native-meso-composants.md`], 'une instance nouvelle rouvre une proposition refusée');
  assert.equal(controlerProposition(readFileSync(join(lieux.depot, r4.ecrites[0]), 'utf8')).entete.instances, 3);
  assert.deepStrictEqual(lirePropositions(lieux.depot).erreurs, []);
});

test('D12 : les révisions des constitutions se comptent par système : publications par sens, entrées relâchées, examens par avis, et instances ; aucun candidat', () => {
  const [a, b2] = [projet('A'), projet('B')];
  const [c1, c2, c3] = ['1', '2', '3'].map((c) => c.repeat(64));
  binome(a, 'A', livrableA2D('ABC-1', [], null, null, [publicationDe(3, '2026-11-20T09:00:00Z', c1, 'premiere'), examenDe2(5, '2026-11-21T09:00:00Z', c2, 'reserve'), publicationDe(6, '2026-11-21T09:05:00Z', c2, 'relachement', 2)]));
  binome(b2, 'B', livrableA2D('FGH-1', [], null, null, [publicationDe(4, '2026-11-20T10:00:00Z', c1, 'premiere'), publicationDe(7, '2026-11-22T10:00:00Z', c3, 'renforcement')]), journalA2T('C-1', 'FGH-1', [], null, [publicationDe(2, '2026-11-20T11:00:00Z', c1, 'premiere'), examenDe2(8, '2026-11-23T11:00:00Z', c3, 'defavorable'), publicationDe(9, '2026-11-23T11:30:00Z', c3, 'relachement', 1)]));
  const lieux = observatoire([a, b2]);
  const r = confronter(lieux);
  assert.deepStrictEqual(r.erreurs, []);
  assert.deepStrictEqual(r.revisions, [
    { systeme: 'agent2dev', publications: 4, premieres: 2, neutres: 0, renforcements: 1, relachements: 1, entreesRelachees: 2, examens: 1, favorables: 0, reserves: 1, defavorables: 0, instances: 2 },
    { systeme: 'agent2test', publications: 2, premieres: 1, neutres: 0, renforcements: 0, relachements: 1, entreesRelachees: 1, examens: 1, favorables: 0, reserves: 0, defavorables: 1, instances: 1 },
  ]);
  assert.deepStrictEqual([r.candidats, r.acceptable, r.kits, r.signaux], [[], [], [], []], 'des comptes seulement : aucun candidat, ni règle, ni kit, ni signal');
  assert.deepStrictEqual(proposer({ ...lieux, date: '2026-11-26' }).ecrites, [], 'rien à proposer : un relâchement examiné est une décision du développeur, non un retour');
  assert.deepStrictEqual(JSON.parse(lancer(lieux, 'confronter', '--json').sortie).revisions, r.revisions);
  const sortie = lancer(lieux, 'confronter').sortie;
  assert.match(sortie, /^révisions des constitutions : des comptes, sans candidat$/m);
  assert.match(sortie, /^ {2}agent2dev : 4 publications, 2 premières, 0 neutre, 1 renforcement, 1 relâchement de 2 entrées ; 1 examen : 0 favorable, 1 réservé, 0 défavorable ; 2 instances$/m);
  assert.match(sortie, /^ {2}agent2test : 2 publications, 1 première, 0 neutre, 0 renforcement, 1 relâchement de 1 entrée ; 1 examen : 0 favorable, 0 réservé, 1 défavorable ; 1 instance$/m);
  // Le socle admet l'observateur extérieur et l'ancre de la constitution ; une révision n'a pas d'invariant.
  const x = sansCR(readFileSync(join(a, 'docs', 'c7e', 'observations-agent2dev.jsonl'), 'utf8')).trim().split('\n').map((l) => JSON.parse(l))[1];
  assert.deepStrictEqual([x.sujet, x.ancre.nature, x.invariant, controlerEnveloppe(x)], ['observateur-externe', 'constitution', undefined, []]);
  assert.match(controlerEnveloppe({ ...x, sujet: 'examinateur' }).join(' ; '), /sujet « examinateur »/);
  assert.match(controlerEnveloppe({ ...x, ancre: { nature: 'grand-livre', ref: x.ancre.ref } }).join(' ; '), /ancre\.nature/);
});

// ---- D11 : examens indépendants ----

/** Une proposition au format observatoire.proposition/1, au statut donné, avec son corps. */
const propositionDe = (statut, corps = '## Ce qui change\n\nLa règle de requête native se précise.\n') =>
  `---\nformat: observatoire.proposition/1\ndate: 2026-11-26\nsysteme: generateur-skill-ticket\nversions: [1.3.0]\nsorte: recurrence\nmotif: requete-native\nprofondeur: meso-composants\ninstances: 2\nenveloppes: 3\nreferences: [0123abcd:12, 4567cdef:4, 4567cdef:9]\n${statut}\n---\n\n${corps}`;
/** Un examen au format observatoire.examen/1 : son en-tête, puis son corps. */
const examenDe = (entete, corps = '## Avis\n\n- Les preuves viennent de deux instances, sur le même motif.\n') => `---\n${entete}\n---\n\n${corps}`;
const EXAMEN_DE_PROPOSITION = 'format: observatoire.examen/1\ndate: 2026-11-26\nobjet: proposition\nexaminateur: observateur-externe\nmodele: gemini-3-flash-preview\navis: favorable';

test('D11 : un examen suit le format observatoire.examen/1 : en-tête fermé, objet et cible, examinateur, modèle et avis, corps sous ## Avis', () => {
  const bon = examenDe('format: observatoire.examen/1\ndate: 2026-11-26\nobjet: specification\nsysteme: agent2dev\nversion: 1.5.0\nexaminateur: observateur-externe\nmodele: gemini-3-flash-preview\navis: reserve');
  assert.deepStrictEqual(controlerExamen(bon, 'agent2dev-1.5.0.md'), { entete: { format: 'observatoire.examen/1', date: '2026-11-26', objet: 'specification', systeme: 'agent2dev', version: '1.5.0', examinateur: 'observateur-externe', modele: 'gemini-3-flash-preview', avis: 'reserve' }, erreurs: [] });
  const cas = [
    [bon.replace('avis: reserve', 'avis: reserve\nauteur: Fred Dupont'), /clé inconnue auteur/],
    [bon.replace('avis: reserve', 'avis: neutre'), /avis « neutre » : favorable, reserve ou defavorable/],
    [bon.replace('examinateur: observateur-externe', 'examinateur: developpeur'), /examinateur « developpeur » : le rôle observateur-externe/],
    [bon.replace('modele: gemini-3-flash-preview', 'modele: Gemini 3, chez le client Dupont'), /modele « Gemini 3, chez le client Dupont »/],
    [bon.replace('objet: specification', 'objet: version'), /objet « version » : proposition, specification ou constitution/],
    [bon.replace('version: 1.5.0', 'version: 1.5'), /version « 1\.5 » : la version qui porte le relâchement/],
    [bon.replace('date: 2026-11-26', 'date: 26/11/2026'), /date « 26\/11\/2026 »/],
    [bon.replace(/## Avis\n\n- .*\n$/, 'Favorable, sans plus.\n'), /corps : ## Avis, puis les points de l'examinateur/],
    [bon.replace('format: observatoire.examen/1', 'format: observatoire.proposition/1'), /format « observatoire\.proposition\/1 », attendu observatoire\.examen\/1/],
    [bon.replace('avis: reserve\n', ''), /clé requise absente avis/],
    [bon.replace(/^---\n/, ''), /en-tête absent/],
  ];
  for (const [texte, motif] of cas) {
    const { erreurs } = controlerExamen(texte, 'agent2dev-1.5.0.md');
    assert.ok(erreurs.some((e) => motif.test(e)), `${motif} : ${erreurs.join(' ; ')}`);
  }
  assert.match(controlerExamen(bon, 'agent2dev-1.4.0.md').erreurs.join(' ; '), /nom du fichier : agent2dev-1\.5\.0\.md, celui de la spécification et de sa version/);
  const deConstitution = examenDe('format: observatoire.examen/1\ndate: 2026-11-26\nobjet: constitution\nsysteme: agent2dev\nversion: 2.2.0\nexaminateur: observateur-externe\nmodele: gemini-3-flash-preview\navis: reserve');
  assert.deepStrictEqual(controlerExamen(deConstitution, '2.2.0.md').erreurs, [], 'l\'examen d\'une constitution, dans son instance, porte le nom de sa version');
  assert.match(controlerExamen(deConstitution, 'agent2dev-2.2.0.md').erreurs.join(' ; '), /nom du fichier : 2\.2\.0\.md, la version de la constitution/);
  const deProposition = examenDe(EXAMEN_DE_PROPOSITION);
  assert.deepStrictEqual(controlerExamen(deProposition, '2026-11-26-x.md').erreurs, []);
  assert.match(controlerExamen(deProposition.replace('objet: proposition', 'objet: proposition\nsysteme: agent2dev'), '2026-11-26-x.md').erreurs.join(' ; '), /systeme, version : seulement pour l'examen d'une spécification/);
});

test('D11 : une proposition ne se ratifie qu\'avec son examen, du même nom, qui la vise ; contre un avis défavorable, elle lui répond ; un refus n\'en demande pas', () => {
  const d = temporaire('depot');
  const nom = '2026-11-26-generateur-skill-ticket-requete-native-meso-composants.md';
  mkdirSync(join(d, PROPOSITIONS), { recursive: true });
  mkdirSync(join(d, EXAMENS), { recursive: true });
  const ecrire = (rel, texte) => writeFileSync(join(d, rel), texte);
  ecrire(`${PROPOSITIONS}/${nom}`, propositionDe('statut: ouverte'));
  ecrire(`${PROPOSITIONS}/2026-11-26-agent2dev-faux-refus-agent2dev-d1-inv-5.md`, propositionDe('statut: refusee\npr: 81').replace('systeme: generateur-skill-ticket', 'systeme: agent2dev').replace('sorte: recurrence\nmotif: requete-native\nprofondeur: meso-composants', 'sorte: faux-refus\nmotif: faux-refus-agent2dev-d1-inv-5\ninvariant: agent2dev:D1.INV-5\nsystemes: [agent2dev]').replace('references: [0123abcd:12, 4567cdef:4, 4567cdef:9]', 'references: [0123abcd:agent2dev:12, 4567cdef:agent2dev:4]'));
  assert.deepStrictEqual([lirePropositions(d).erreurs, controlerRatifications(d).erreurs], [[], []], 'une ouverte attend, une refusée se décide seule');
  ecrire(`${PROPOSITIONS}/${nom}`, propositionDe('statut: ratifiee\nversion: 1.4.0\npr: 80'));
  assert.deepStrictEqual(controlerRatifications(d).erreurs, [`${PROPOSITIONS}/${nom} : ratifiée sans examen, ${EXAMENS}/${nom} attendu (D11.INV-1)`]);
  ecrire(`${EXAMENS}/${nom}`, examenDe(EXAMEN_DE_PROPOSITION));
  assert.deepStrictEqual([lireExamens(d).examens.map((e) => [e.fichier, e.entete.avis]), lireExamens(d).erreurs, controlerRatifications(d).erreurs], [[[`${EXAMENS}/${nom}`, 'favorable']], [], []]);
  ecrire(`${EXAMENS}/${nom}`, examenDe(EXAMEN_DE_PROPOSITION.replace('avis: favorable', 'avis: defavorable')));
  assert.deepStrictEqual(controlerRatifications(d).erreurs, [`${PROPOSITIONS}/${nom} : ratifiée contre un avis défavorable, sans « ## Réponse à l'examen » dans son corps`], 'un avis ne décide pas, mais il demande sa réponse');
  ecrire(`${PROPOSITIONS}/${nom}`, propositionDe('statut: ratifiee\nversion: 1.4.0\npr: 80', '## Ce qui change\n\nLa règle se précise.\n\n## Réponse à l\'examen\n\nLa règle se précise sans s\'affaiblir.\n'));
  assert.deepStrictEqual(controlerRatifications(d).erreurs, []);
  // L'examen d'une constitution vit dans son instance, jamais dans le dépôt.
  ecrire(`${EXAMENS}/2.2.0.md`, examenDe('format: observatoire.examen/1\ndate: 2026-11-26\nobjet: constitution\nsysteme: agent2dev\nversion: 2.2.0\nexaminateur: observateur-externe\nmodele: gemini-3-flash-preview\navis: reserve'));
  assert.deepStrictEqual(lireExamens(d).erreurs, [`${EXAMENS}/2.2.0.md : l'examen d'une constitution vit dans son instance, constitution/examens/, non dans le dépôt`]);
  rmSync(join(d, EXAMENS, '2.2.0.md'));
  // Un examen sans sa proposition, ou qui vise une spécification sous le nom d'une proposition.
  ecrire(`${EXAMENS}/2026-11-26-autre.md`, examenDe(EXAMEN_DE_PROPOSITION));
  ecrire(`${EXAMENS}/${nom}`, examenDe('format: observatoire.examen/1\ndate: 2026-11-26\nobjet: specification\nsysteme: generateur-skill-ticket\nversion: 1.4.0\nexaminateur: observateur-externe\nmodele: gemini-3-flash-preview\navis: favorable'));
  assert.deepStrictEqual(lireExamens(d).erreurs, [
    `${EXAMENS}/2026-11-26-autre.md : aucune proposition ${PROPOSITIONS}/2026-11-26-autre.md à examiner`,
    `${EXAMENS}/${nom} : nom du fichier : generateur-skill-ticket-1.4.0.md, celui de la spécification et de sa version`,
  ]);
  assert.deepStrictEqual(controlerRatifications(d).erreurs, [], 'un examen hors format est relevé une fois, par lireExamens');
  // La commande verifier les relève, et n'écrit rien.
  const contexte = { magasin: join(temporaire('magasin'), MAGASIN), depot: d };
  const avant = inventaire(d);
  const r = lancer(contexte, 'verifier');
  assert.equal(r.code, 1);
  assert.match(r.erreur, /^ALTÉRÉ {2}observatoire\/examens\/2026-11-26-autre\.md : aucune proposition/m);
  assert.deepStrictEqual(inventaire(d), avant, 'verifier ne fait que lire');
  rmSync(join(d, EXAMENS, '2026-11-26-autre.md'));
  ecrire(`${EXAMENS}/${nom}`, examenDe(EXAMEN_DE_PROPOSITION.replace('avis: favorable', 'avis: defavorable')));
  ecrire(`${PROPOSITIONS}/${nom}`, propositionDe('statut: ratifiee\nversion: 1.4.0\npr: 80'));
  assert.deepStrictEqual(lancer(contexte, 'verifier'), { code: 1, sortie: '', erreur: `ALTÉRÉ  ${PROPOSITIONS}/${nom} : ratifiée contre un avis défavorable, sans « ## Réponse à l'examen » dans son corps` });
  ecrire(`${EXAMENS}/${nom}`, examenDe(EXAMEN_DE_PROPOSITION));
  assert.deepStrictEqual(lancer(contexte, 'verifier'), { code: 0, sortie: 'magasin, propositions et examens intacts', erreur: '' });
  // Une proposition dont l'examen, valide, vise une spécification : il ne compte pas pour la ratifier.
  const piege = 'generateur-skill-ticket-1.4.0.md';
  ecrire(`${PROPOSITIONS}/${piege}`, propositionDe('statut: ratifiee\nversion: 1.4.0\npr: 82'));
  ecrire(`${EXAMENS}/${piege}`, examenDe('format: observatoire.examen/1\ndate: 2026-11-26\nobjet: specification\nsysteme: generateur-skill-ticket\nversion: 1.4.0\nexaminateur: observateur-externe\nmodele: gemini-3-flash-preview\navis: favorable'));
  assert.deepStrictEqual(controlerRatifications(d).erreurs, [`${PROPOSITIONS}/${piege} : son examen, ${EXAMENS}/${piege}, ne vise pas une proposition`]);
});

// ---- D5 : suivi ----

test('D5 : l\'effet d\'une proposition ratifiée se mesure avant et après sa version : observé, non observé, ou indécidable sous vingt enveloppes', () => {
  const ratifiee = (lieux) => {
    const r = proposer({ ...lieux, date: '2026-11-24' });
    const fichier = r.ecrites.find((f) => f.includes('requete-native'));
    ecrireStatut(lieux.depot, fichier, 'statut: ratifiee\nversion: 1.4.0\npr: 80');
    return fichier;
  };
  const suivi = (lieux, fichier) => suivre(lieux).suivis.find((s) => s.fichier === fichier);

  const [a, b] = [INSTANCES.A(), INSTANCES.B()];
  const lieux = observatoire([a, b], { depot: depot({ courante: '1.4.0' }) });
  const fichier = ratifiee(lieux);
  const s1 = suivi(lieux, fichier);
  assert.deepStrictEqual([s1.effet, s1.avant, s1.apres], ['indecidable', { motif: 4, enveloppes: 26 }, { motif: 0, enveloppes: 0 }], 'quatre corrections requete-native sur 26 enveloppes, rien après');
  assert.ok(s1.avant.enveloppes >= SEUIL_ENVELOPPES);
  ajouterAuChamp(b, 'FGHIJ-200', ...conformes('2026-12-01T09:00:00Z', 19, 'FGHIJ-200'));
  exporterInstance(b, 'B', '1.4.0');
  assert.equal(suivi(lieux, fichier).effet, 'indecidable', 'dix-neuf enveloppes après la version : sous le seuil');
  ajouterAuChamp(b, 'FGHIJ-200', ...conformes('2026-12-02T09:00:00Z', 1, 'FGHIJ-201'));
  exporterInstance(b, 'B', '1.4.0');
  assert.deepStrictEqual([suivi(lieux, fichier).effet, suivi(lieux, fichier).apres], ['observe', { motif: 0, enveloppes: 20 }]);
  const autre = suivre(lieux).suivis.find((s) => s.fichier !== fichier);
  assert.deepStrictEqual([autre.statut, autre.effet], ['ouverte', null], 'une proposition ouverte n\'a pas d\'effet à mesurer');

  const [a2, b2] = [INSTANCES.A(), INSTANCES.B()];
  const lieux2 = observatoire([a2, b2], { depot: depot({ courante: '1.4.0' }) });
  const fichier2 = ratifiee(lieux2);
  ajouterAuChamp(b2, 'FGHIJ-300', ...conformes('2026-12-01T09:00:00Z', 15, 'FGHIJ-300'));
  for (let k = 0; k < 5; k++) ajouterAuChamp(b2, 'FGHIJ-300', ...corrige(`2026-12-02T0${k}:00:00Z`, { type: 'scenario', ref: `FGHIJ-300-S0${k}` }, 'requete-native', 16 + 2 * k));
  exporterInstance(b2, 'B', '1.4.0');
  const s2 = suivi(lieux2, fichier2);
  assert.deepStrictEqual([s2.effet, s2.apres], ['non-observe', { motif: 5, enveloppes: 20 }], 'cinq sur vingt après, quatre sur vingt-six avant : la part du motif monte');
});

// ---- Ligne de commande ----

test('Ligne de commande : codes de sortie ; le magasin d\'épreuve seul est écrit', () => {
  const [a, b] = [INSTANCES.A(), INSTANCES.B()];
  const contexte = { magasin: join(temporaire('magasin'), MAGASIN), depot: depot() };
  assert.equal(lancer(contexte, 'inscrire').code, 2);
  assert.equal(lancer(contexte, 'publier').code, 2);
  assert.equal(lancer(contexte, 'etat', '--projet', a).code, 2);
  assert.equal(lancer(contexte, 'proposer', '--date').code, 2);
  assert.match(lancer(contexte, 'inscrire', '--projet', a).sortie, new RegExp(`^projet inscrit, instance ${PREFIXE.A}`));
  assert.equal(lancer(contexte, 'inscrire', '--projet', b).code, 0);
  assert.match(lancer(contexte, 'relever').sortie, new RegExp(`^${PREFIXE.A} {2}docs/c7e/observations\\.jsonl : 24 enveloppes relevées, 24 en tout$`, 'm'));
  const e = lancer(contexte, 'etat');
  assert.equal(e.code, 0, e.erreur);
  assert.match(e.sortie, /^2 instances, 0 enveloppe écartée : système ou version inconnus du dépôt$/m);
  assert.match(e.sortie, /^ {2}generateur-skill-ticket 1\.3\.0 : à jour$/m);
  const c = JSON.parse(lancer(contexte, 'confronter', '--json').sortie);
  assert.deepStrictEqual(c.candidats.map(cle), ['retour generateur-skill-ticket commit-hors-plan-back micro', 'recurrence generateur-skill-ticket requete-native meso-composants']);
  assert.match(lancer(contexte, 'proposer', '--date', '2026-11-24').sortie, /^écrite : observatoire\/propositions\/2026-11-24-generateur-skill-ticket-commit-hors-plan-back-micro\.md ; à relire, compléter et apporter par une pull request$/m);
  assert.match(lancer(contexte, 'suivre').sortie, /^ouverte {2}observatoire\/propositions\/2026-11-24-/m);
  assert.deepStrictEqual(lancer(contexte, 'verifier'), { code: 0, sortie: 'magasin, propositions et examens intacts', erreur: '' });
  const miroir = join(contexte.magasin, 'instances', sha256(SELS.A), 'observations.tete');
  writeFileSync(miroir, '{}\n');
  assert.equal(lancer(contexte, 'verifier').code, 1);
  assert.equal(lancer(contexte, 'relever').code, 1);
  const processus = spawnSync(process.execPath, [join(ICI, '..', 'outils', 'observatoire.mjs'), 'publier'], { encoding: 'utf8' });
  assert.deepStrictEqual([processus.status, processus.stdout], [2, ''], 'en processus : usage incorrect, rien d\'écrit');
});
