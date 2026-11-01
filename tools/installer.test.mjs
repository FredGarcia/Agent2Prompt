/**
 * Recette de `tools/installer.mjs` : `node --test tools/installer.test.mjs`, Node 20 ou plus récent.
 *
 * Chaque test lance l'installateur comme le développeur, dans un dépôt Git temporaire, avec un dossier
 * utilisateur temporaire pour Gemini CLI (`GEMINI_CLI_HOME`) et une configuration Git isolée. Les
 * fichiers installés sont comparés à la transmission relue par `relire`, de `tools/bundle.mjs`.
 * La recette tourne sous Linux et sous Windows (`.github/workflows/recette-installer.yml`).
 */
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { relire } from './bundle.mjs';

const OUTILS = dirname(fileURLToPath(import.meta.url));
const RACINE = dirname(OUTILS);
const INSTALLER = join(OUTILS, 'installer.mjs');
const SYSTEMES = ['agent2dev', 'agent2test', 'tension-dashboard-gitlab-agent'];

const sha256 = (contenu) => createHash('sha256').update(contenu).digest('hex');
const lf = (texte) => texte.replace(/\r\n/g, '\n');
const echapper = (texte) => texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const manifeste = (nom) => JSON.parse(readFileSync(join(RACINE, 'specs', nom, 'manifest.json'), 'utf8'));
const cheminTransmission = (nom, version = manifeste(nom).version) => join(RACINE, 'transmissions', `${nom}-${version}.md`);
const transmission = (nom, version) => relire(lf(readFileSync(cheminTransmission(nom, version), 'utf8')));

/** Skills installables du dépôt : transmissibles, ni systèmes à construire, ni réservés au niveau utilisateur. */
const INSTALLABLES = readdirSync(join(RACINE, 'specs'))
  .filter((d) => existsSync(join(RACINE, 'specs', d, 'manifest.json')))
  .map((d) => manifeste(d))
  .filter((m) => m.transmissible !== false && !SYSTEMES.includes(m.name) && m.name !== 'analyse-projet')
  .map((m) => m.name)
  .sort();

function fichiersDe(dossier, prefixe = '') {
  return readdirSync(join(dossier, prefixe), { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? fichiersDe(dossier, prefixe ? `${prefixe}/${e.name}` : e.name) : [prefixe ? `${prefixe}/${e.name}` : e.name]))
    .sort();
}

/** Le dossier contient exactement la transmission, sa consigne et une table d'intégrité juste. */
function verifierInstallation(dossier, nom, attendue = transmission(nom)) {
  const attendus = [...attendue.fichiers.map((f) => f.rel), 'CONSIGNE.md', 'integrite.sha256'].sort();
  assert.deepEqual(fichiersDe(dossier), attendus, `${nom} : fichiers installés`);
  for (const f of attendue.fichiers) assert.equal(readFileSync(join(dossier, ...f.rel.split('/')), 'utf8'), f.contenu, `${nom} : ${f.rel}`);
  assert.equal(readFileSync(join(dossier, 'CONSIGNE.md'), 'utf8'), attendue.entete, `${nom} : consigne`);
  const table = readFileSync(join(dossier, 'integrite.sha256'), 'utf8');
  const lignes = attendus.filter((rel) => rel !== 'integrite.sha256').map((rel) => `${sha256(readFileSync(join(dossier, ...rel.split('/'))))}  ${rel}`);
  assert.deepEqual(table.trimEnd().split('\n').sort(), lignes.sort(), `${nom} : table d'intégrité`);
}

/** Bac à sable : dossier temporaire, dossier utilisateur de Gemini CLI, configuration Git isolée. */
function bac(t) {
  const base = mkdtempSync(join(tmpdir(), 'installer-'));
  t.after(() => rmSync(base, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }));
  const env = {
    ...process.env,
    GEMINI_CLI_HOME: join(base, 'home'),
    GIT_CONFIG_GLOBAL: join(base, 'gitconfig'),
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CEILING_DIRECTORIES: base,
    GIT_AUTHOR_NAME: 'recette',
    GIT_AUTHOR_EMAIL: 'recette@example.invalid',
    GIT_COMMITTER_NAME: 'recette',
    GIT_COMMITTER_EMAIL: 'recette@example.invalid',
  };
  const git = (cwd, ...args) => execFileSync('git', args, { cwd, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const depot = (nom = 'projet') => {
    const racine = join(base, nom);
    mkdirSync(racine, { recursive: true });
    git(racine, 'init', '-q');
    writeFileSync(join(racine, 'README.md'), 'projet\n');
    git(racine, 'add', '.');
    git(racine, 'commit', '-q', '-m', 'init');
    return racine;
  };
  const lancer = (cwd, ...args) => {
    const r = spawnSync(process.execPath, [INSTALLER, ...args], { cwd, env, encoding: 'utf8' });
    return { code: r.status, sortie: r.stdout, erreur: r.stderr };
  };
  const statut = (cwd) => git(cwd, 'status', '--porcelain', '--untracked-files=all').trim();
  return { base, git, depot, lancer, statut, utilisateur: join(base, 'home', '.gemini', 'skills') };
}

test('--tous installe chaque skill de sa transmission courante, fichier pour fichier, et --retirer --tous les retire sans trace', (t) => {
  const b = bac(t);
  const ws = b.depot();
  const exclusion = join(ws, '.git', 'info', 'exclude');
  const avant = lf(readFileSync(exclusion, 'utf8'));
  let r = b.lancer(ws, '--tous');
  assert.equal(r.code, 0, r.erreur);
  assert.deepEqual(readdirSync(join(ws, '.gemini', 'skills')).sort(), INSTALLABLES);
  for (const nom of INSTALLABLES) verifierInstallation(join(ws, '.gemini', 'skills', nom), nom);
  for (const nom of SYSTEMES) assert.match(r.sortie, new RegExp(`${echapper(nom)} \\(système à construire\\)`));
  assert.match(r.sortie, /analyse-projet \(niveau utilisateur seul : --utilisateur\)/);
  assert.equal(b.statut(ws), '');

  r = b.lancer(ws, '--retirer', '--tous');
  assert.equal(r.code, 0, r.erreur);
  assert.deepEqual(readdirSync(join(ws, '.gemini', 'skills')), []);
  assert.equal(lf(readFileSync(exclusion, 'utf8')), avant);
  assert.equal(existsSync(join(ws, '.geminiignore')), false);
  assert.equal(b.statut(ws), '');
});

test("les systèmes à construire sont refusés ; analyse-projet ne s'installe qu'au niveau utilisateur", (t) => {
  const b = bac(t);
  const ws = b.depot();
  for (const nom of SYSTEMES) {
    const r = b.lancer(ws, nom);
    assert.equal(r.code, 1, nom);
    assert.match(r.erreur, /système à construire, pas un skill/);
  }
  let r = b.lancer(ws, 'analyse-projet');
  assert.equal(r.code, 1);
  assert.match(r.erreur, /niveau utilisateur seulement.*--utilisateur/);
  r = b.lancer(ws, 'analyse-projet', '--utilisateur');
  assert.equal(r.code, 0, r.erreur);
  verifierInstallation(join(b.utilisateur, 'analyse-projet'), 'analyse-projet');
  assert.equal(existsSync(join(ws, '.gemini')), false);
  assert.equal(b.statut(ws), '');
});

test('masquage : exclusion locale et négations dans .geminiignore, mises à jour skill par skill', (t) => {
  const b = bac(t);
  const ws = b.depot();
  const exclusion = join(ws, '.git', 'info', 'exclude');
  const avant = lf(readFileSync(exclusion, 'utf8'));
  const r = b.lancer(ws, 'java', 'angular');
  assert.equal(r.code, 0, r.erreur);
  assert.match(r.sortie, /masqué à Git \(\.git\/info\/exclude\), lisible par Gemini CLI \(\.geminiignore\)/);
  const bloc = lf(readFileSync(exclusion, 'utf8')).slice(avant.replace(/\n+$/, '').length);
  assert.match(bloc, /^\n\n# >>> agent2prompt[^\n]*\n\/\.geminiignore\n\/\.gemini\/skills\/angular\/\n\/\.gemini\/skills\/java\/\n# <<< agent2prompt\n$/);
  assert.match(
    readFileSync(join(ws, '.geminiignore'), 'utf8'),
    /^# >>> agent2prompt[^\n]*\n!\/\.gemini\/\n!\/\.gemini\/skills\/\n!\/\.gemini\/skills\/angular\/\n!\/\.gemini\/skills\/java\/\n# <<< agent2prompt\n$/,
  );
  assert.equal(b.statut(ws), '');

  assert.equal(b.lancer(ws, '--retirer', 'java').code, 0);
  assert.doesNotMatch(readFileSync(exclusion, 'utf8'), /skills\/java/);
  assert.doesNotMatch(readFileSync(join(ws, '.geminiignore'), 'utf8'), /skills\/java/);
  assert.equal(existsSync(join(ws, '.gemini', 'skills', 'java')), false);
  assert.equal(b.statut(ws), '');
});

test('relancer sur un skill intact ne change rien', (t) => {
  const b = bac(t);
  const ws = b.depot();
  assert.equal(b.lancer(ws, 'java').code, 0);
  const fichiers = [join(ws, '.git', 'info', 'exclude'), join(ws, '.geminiignore'), join(ws, '.gemini', 'skills', 'java', 'integrite.sha256')];
  const avant = fichiers.map((f) => readFileSync(f, 'utf8'));
  const r = b.lancer(ws, 'java');
  assert.equal(r.code, 0, r.erreur);
  assert.match(r.sortie, /java \S+ déjà installé dans \.gemini\/skills\/java\/, intact/);
  assert.deepEqual(fichiers.map((f) => readFileSync(f, 'utf8')), avant);
});

test("mise à jour : la version courante remplace l'ancienne, sans reste", (t) => {
  const b = bac(t);
  const ws = b.depot();
  const { version } = manifeste('orchestrateur-c7e');
  const ancienne = readdirSync(join(RACINE, 'transmissions'))
    .map((f) => /^orchestrateur-c7e-(\d+\.\d+\.\d+)\.md$/.exec(f)?.[1])
    .filter((v) => v && v !== version)
    .sort()[0];
  assert.ok(ancienne, 'une version antérieure transmise');
  const dossier = join(ws, '.gemini', 'skills', 'orchestrateur-c7e');
  let r = b.lancer(ws, `orchestrateur-c7e@${ancienne}`);
  assert.equal(r.code, 0, r.erreur);
  verifierInstallation(dossier, 'orchestrateur-c7e', transmission('orchestrateur-c7e', ancienne));
  r = b.lancer(ws, 'orchestrateur-c7e');
  assert.equal(r.code, 0, r.erreur);
  assert.match(r.sortie, new RegExp(`remplace ${echapper(ancienne)}`));
  verifierInstallation(dossier, 'orchestrateur-c7e');
  assert.equal(b.statut(ws), '');
});

test("fichiers changés depuis l'installation : refus, sauf --forcer", (t) => {
  const b = bac(t);
  const ws = b.depot();
  const dossier = join(ws, '.gemini', 'skills', 'java');
  assert.equal(b.lancer(ws, 'java').code, 0);
  appendFileSync(join(dossier, 'SKILL.md'), 'retouche\n');
  writeFileSync(join(dossier, 'notes.md'), 'notes\n');
  let r = b.lancer(ws, 'java');
  assert.equal(r.code, 1);
  assert.match(r.erreur, /SKILL\.md \(modifié\)/);
  assert.match(r.erreur, /notes\.md \(ajouté\)/);
  assert.equal(b.lancer(ws, '--retirer', 'java').code, 1);
  r = b.lancer(ws, 'java', '--forcer');
  assert.equal(r.code, 0, r.erreur);
  verifierInstallation(dossier, 'java');

  rmSync(join(dossier, 'manifest.json'));
  r = b.lancer(ws, 'java');
  assert.equal(r.code, 1);
  assert.match(r.erreur, /manifest\.json \(supprimé\)/);
  r = b.lancer(ws, '--retirer', 'java', '--forcer');
  assert.equal(r.code, 0, r.erreur);
  assert.equal(existsSync(dossier), false);
  assert.equal(b.statut(ws), '');
});

test("un dossier de skill qui ne vient pas de l'installateur est protégé", (t) => {
  const b = bac(t);
  const ws = b.depot();
  const dossier = join(ws, '.gemini', 'skills', 'java');
  mkdirSync(dossier, { recursive: true });
  writeFileSync(join(dossier, 'SKILL.md'), '---\nname: java\ndescription: le mien\n---\n');
  let r = b.lancer(ws, 'java');
  assert.equal(r.code, 1);
  assert.match(r.erreur, /n'a pas été installé par cet outil/);
  assert.equal(b.lancer(ws, '--retirer', 'java').code, 1);
  r = b.lancer(ws, 'java', '--forcer');
  assert.equal(r.code, 0, r.erreur);
  verifierInstallation(dossier, 'java');
});

test('--visible laisse le skill dans git status, et retire une exclusion posée avant', (t) => {
  const b = bac(t);
  const ws = b.depot();
  let r = b.lancer(ws, 'java', '--visible');
  assert.equal(r.code, 0, r.erreur);
  assert.match(b.statut(ws), /\.gemini\/skills\/java\//);
  assert.equal(existsSync(join(ws, '.geminiignore')), false);
  assert.equal(b.lancer(ws, 'java').code, 0);
  assert.equal(b.statut(ws), '');
  r = b.lancer(ws, 'java', '--visible');
  assert.match(r.sortie, /visible dans git status.*exclusion retirée/);
  assert.match(b.statut(ws), /\.gemini\/skills\/java\//);
});

test('.geminiignore versionné : installé sans masquage, avec un avertissement', (t) => {
  const b = bac(t);
  const ws = b.depot();
  writeFileSync(join(ws, '.geminiignore'), 'dist/\n');
  b.git(ws, 'add', '.geminiignore');
  b.git(ws, 'commit', '-q', '-m', 'geminiignore');
  const r = b.lancer(ws, 'java');
  assert.equal(r.code, 0, r.erreur);
  assert.match(r.sortie, /ATTENTION, non masqué : \.geminiignore est versionné/);
  assert.equal(readFileSync(join(ws, '.geminiignore'), 'utf8'), 'dist/\n');
  assert.doesNotMatch(readFileSync(join(ws, '.git', 'info', 'exclude'), 'utf8'), /agent2prompt/);
  assert.match(b.statut(ws), /\.gemini\/skills\/java\//);
});

test("worktrees : exclusion commune, gardée tant qu'un autre worktree a le skill", (t) => {
  const b = bac(t);
  const principal = b.depot();
  const demande = join(b.base, 'demande');
  b.git(principal, 'worktree', 'add', '-q', demande, '-b', 'demande');
  const exclusion = join(principal, '.git', 'info', 'exclude');
  let r = b.lancer(demande, 'java');
  assert.equal(r.code, 0, r.erreur);
  assert.match(r.sortie, /worktree : le skill ne vaut que pour celui-ci/);
  assert.match(readFileSync(exclusion, 'utf8'), /^\/\.gemini\/skills\/java\/$/m);
  assert.equal(b.statut(demande), '');

  assert.equal(b.lancer(principal, 'java').code, 0);
  r = b.lancer(demande, '--retirer', 'java');
  assert.equal(r.code, 0, r.erreur);
  assert.match(r.sortie, /exclusion gardée/);
  assert.equal(b.statut(principal), '');
  assert.equal(b.statut(demande), '');

  r = b.lancer(principal, '--retirer', 'java');
  assert.equal(r.code, 0, r.erreur);
  assert.doesNotMatch(readFileSync(exclusion, 'utf8'), /skills\/java/);
  assert.equal(b.statut(principal), '');
  assert.equal(b.statut(demande), '');
});

test('workspace dans un sous-dossier du dépôt : motifs préfixés', (t) => {
  const b = bac(t);
  const racine = b.depot();
  const app = join(racine, 'app');
  mkdirSync(app);
  const r = b.lancer(racine, 'java', '--workspace', app);
  assert.equal(r.code, 0, r.erreur);
  const exclusion = readFileSync(join(racine, '.git', 'info', 'exclude'), 'utf8');
  assert.match(exclusion, /^\/app\/\.geminiignore$/m);
  assert.match(exclusion, /^\/app\/\.gemini\/skills\/java\/$/m);
  verifierInstallation(join(app, '.gemini', 'skills', 'java'), 'java');
  assert.equal(b.statut(racine), '');
});

test('transmission seule, hors du dépôt et en CRLF : même installation', (t) => {
  const b = bac(t);
  const ws = b.depot();
  const copie = join(b.base, 'java.md');
  writeFileSync(copie, lf(readFileSync(cheminTransmission('java'), 'utf8')).replace(/\n/g, '\r\n'));
  const r = b.lancer(ws, copie);
  assert.equal(r.code, 0, r.erreur);
  verifierInstallation(join(ws, '.gemini', 'skills', 'java'), 'java');
});

test("transmission altérée ou chemin hors du dossier : refus, rien n'est écrit", (t) => {
  const b = bac(t);
  const ws = b.depot();
  const texte = lf(readFileSync(cheminTransmission('java'), 'utf8'));
  const alteree = join(b.base, 'alteree.md');
  writeFileSync(alteree, texte.replace('<<<FIN SKILL.md>>>', 'ligne ajoutée\n<<<FIN SKILL.md>>>'));
  let r = b.lancer(ws, alteree);
  assert.equal(r.code, 1);
  assert.match(r.erreur, /empreinte fausse pour SKILL\.md/);

  const piege = 'piège\n';
  const table = texte.lastIndexOf("\n---\n\n# Table d'intégrité");
  const dangereuse = join(b.base, 'dangereuse.md');
  writeFileSync(dangereuse, `${texte.slice(0, table)}\n<<<FICHIER ../piege.md>>>\n${piege}<<<FIN ../piege.md>>>\n${texte.slice(table)}    ${sha256(piege)}  ../piege.md\n`);
  r = b.lancer(ws, dangereuse);
  assert.equal(r.code, 1);
  assert.match(r.erreur, /chemin refusé, "\.\.\/piege\.md"/);
  assert.equal(existsSync(join(ws, '.gemini')), false);
  assert.equal(existsSync(join(ws, 'piege.md')), false);
});

test("--essai n'écrit rien", (t) => {
  const b = bac(t);
  const ws = b.depot();
  const exclusion = readFileSync(join(ws, '.git', 'info', 'exclude'), 'utf8');
  const r = b.lancer(ws, 'java', '--essai');
  assert.equal(r.code, 0, r.erreur);
  assert.match(r.sortie, /essai : java \S+ serait installé dans \.gemini\/skills\/java\//);
  assert.match(r.sortie, /essai : serait masqué à Git/);
  assert.equal(existsSync(join(ws, '.gemini')), false);
  assert.equal(existsSync(join(ws, '.geminiignore')), false);
  assert.equal(readFileSync(join(ws, '.git', 'info', 'exclude'), 'utf8'), exclusion);
});

test('hors dépôt Git : installé, sans masquage', (t) => {
  const b = bac(t);
  const ws = join(b.base, 'libre');
  mkdirSync(ws);
  const r = b.lancer(ws, 'java');
  assert.equal(r.code, 0, r.erreur);
  verifierInstallation(join(ws, '.gemini', 'skills', 'java'), 'java');
  assert.doesNotMatch(r.sortie, /masqué/);
  assert.equal(existsSync(join(ws, '.geminiignore')), false);
});

test("--liste donne la version du dépôt et l'état du workspace et du niveau utilisateur", (t) => {
  const b = bac(t);
  const ws = b.depot();
  assert.equal(b.lancer(ws, 'java').code, 0);
  assert.equal(b.lancer(ws, 'analyse-projet', '--utilisateur').code, 0);
  assert.equal(b.lancer(ws, 'angular', '--utilisateur').code, 0);
  const r0 = b.lancer(ws, 'angular');
  assert.match(r0.sortie, /prime sur angular \S+, installé au niveau utilisateur/);
  appendFileSync(join(ws, '.gemini', 'skills', 'java', 'SKILL.md'), 'retouche\n');
  const r = b.lancer(ws, '--liste');
  assert.equal(r.code, 0, r.erreur);
  const java = echapper(manifeste('java').version);
  const analyse = echapper(manifeste('analyse-projet').version);
  assert.match(r.sortie, new RegExp(`^java\\s+${java}\\s+${java}, 1 changement\\s+—$`, 'm'));
  assert.match(r.sortie, new RegExp(`^analyse-projet\\s+${analyse}\\s+niveau utilisateur seul\\s+${analyse}$`, 'm'));
  assert.match(r.sortie, /^agent2dev\s+\S+\s+système à construire, non installable$/m);
  assert.match(r.sortie, /^orchestrateur-c7e\s+\S+\s+—\s+—$/m);
});

test('nom inconnu, version absente, socle : messages utiles', (t) => {
  const b = bac(t);
  const ws = b.depot();
  let r = b.lancer(ws, 'inexistant');
  assert.equal(r.code, 1);
  assert.match(r.erreur, /aucun skill de ce nom dans le dépôt \(.*java.*\)/);
  r = b.lancer(ws, 'java@9.9.9');
  assert.equal(r.code, 1);
  assert.match(r.erreur, /java 9\.9\.9 : aucune transmission \(versions disponibles : .+\)/);
  r = b.lancer(ws, 'socle-back-front');
  assert.equal(r.code, 1);
  assert.match(r.erreur, /pas transmissible seul/);
  r = b.lancer(ws, '--inconnue');
  assert.equal(r.code, 2);
  assert.match(r.erreur, /option inconnue : --inconnue/);
});
