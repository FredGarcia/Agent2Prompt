/**
 * Recette de l'installateur de la racine du dépôt, `installer.mjs` : `node --test tools/installer-racine.test.mjs`,
 * Node 20 ou plus récent.
 *
 * Chaque test lance l'installateur comme le développeur, avec un dossier utilisateur temporaire pour Gemini
 * CLI (`GEMINI_CLI_HOME`) et une configuration Git isolée. Les skills installés sont comparés à leur
 * transmission, relue par `tools/installer.mjs` ; les agents et les commandes, aux fichiers que leur skill
 * tire de ses modules. La recette tourne sous Linux et sous Windows (`.github/workflows/recette-installer.yml`) ;
 * le chargement des agents par Gemini CLI lui-même est vérifié par `.github/scripts/contrat-gemini.mjs`.
 */
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, sep } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { adapterEntete } from '../installer.mjs';
import { contenusAttendus, Erreur, lireTransmission, sha256, tableDe } from './installer.mjs';

const RACINE = dirname(dirname(fileURLToPath(import.meta.url)));
const INSTALLATEUR = join(RACINE, 'installer.mjs');
const OUTIL = join(RACINE, 'tools', 'installer.mjs');
const SYSTEMES = ['agent2dev', 'agent2test', 'tension-dashboard-gitlab-agent'];
const AGENTS = ['agents/capteur-sprint.md', 'agents/explicateur-hote.md', 'agents/memoire-appli.md', 'agents/pilote-scenario.md'];
const COMMANDES = ['commands/hote/carte.toml', 'commands/hote/explique.toml', 'commands/hote/pourquoi.toml', 'commands/scenario/designer.toml', 'commands/scenario/exporter.toml', 'commands/scenario/importer.toml', 'commands/scenario/indexer.toml', 'commands/scenario/jouer.toml', 'commands/scenario/resultats.toml', 'commands/scenario/traduire.toml'];
const SKILL_DES_COMMANDES = { hote: 'explication-hote-ia', scenario: 'scenario-playwright' };

const manifeste = (nom) => JSON.parse(readFileSync(join(RACINE, 'specs', nom, 'manifest.json'), 'utf8'));
const transmission = (nom, version = manifeste(nom).version) => lireTransmission(join(RACINE, 'transmissions', `${nom}-${version}.md`));
const attendus = (nom, version) => new Map(contenusAttendus(transmission(nom, version)));
const posix = (chemin) => chemin.split(sep).join('/');

/** Skills que l'installateur installe au niveau utilisateur : transmissibles, hors systèmes à construire. */
const SKILLS = readdirSync(join(RACINE, 'specs'))
  .filter((d) => existsSync(join(RACINE, 'specs', d, 'manifest.json')))
  .map((d) => manifeste(d))
  .filter((m) => m.transmissible !== false && !SYSTEMES.includes(m.name))
  .map((m) => m.name)
  .sort();

function fichiersDe(dossier, prefixe = '') {
  return readdirSync(join(dossier, prefixe), { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? fichiersDe(dossier, prefixe ? `${prefixe}/${e.name}` : e.name) : [prefixe ? `${prefixe}/${e.name}` : e.name]))
    .sort();
}

/** Les fichiers de l'installation d'un skill sont ceux de sa version, et sa table d'intégrité est la sienne. */
function verifierSkill(dossier, nom, version) {
  const contenus = attendus(nom, version);
  const table = readFileSync(join(dossier, 'integrite.sha256'), 'utf8');
  assert.equal(table, tableDe([...contenus]), `${nom} : table d'intégrité`);
  for (const [rel, contenu] of contenus) assert.equal(readFileSync(join(dossier, ...rel.split('/')), 'utf8'), contenu, `${nom} : ${rel}`);
}

/** Bac à sable : dossier temporaire, dossier utilisateur de Gemini CLI, configuration Git isolée. */
function bac(t) {
  const base = mkdtempSync(join(tmpdir(), 'installateur-'));
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
  const ailleurs = join(base, 'ailleurs');
  mkdirSync(ailleurs);
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
  const executer = (script, args) => {
    const r = spawnSync(process.execPath, [script, ...args], { cwd: ailleurs, env, encoding: 'utf8' });
    return { code: r.status, sortie: r.stdout, erreur: r.stderr };
  };
  const gemini = join(base, 'home', '.gemini');
  return {
    base,
    env,
    git,
    depot,
    gemini,
    skills: join(gemini, 'skills'),
    etat: join(gemini, 'agent2prompt'),
    lancer: (...args) => executer(INSTALLATEUR, args),
    outil: (...args) => executer(OUTIL, args),
    registre: () => JSON.parse(readFileSync(join(gemini, 'agent2prompt', 'installation.json'), 'utf8')),
    statut: (cwd) => git(cwd, 'status', '--porcelain', '--untracked-files=all').trim(),
  };
}

test('installe au niveau utilisateur chaque skill installable, puis les agents et les commandes de ses modules, adaptés à Gemini CLI', (t) => {
  const b = bac(t);
  const r = b.lancer();
  assert.equal(r.code, 0, r.erreur);
  assert.deepEqual(readdirSync(b.skills).sort(), SKILLS);
  for (const nom of SKILLS) verifierSkill(join(b.skills, nom), nom);
  for (const nom of SYSTEMES) assert.match(r.sortie, new RegExp(`${nom} : non installé, système à construire`));
  assert.match(r.sortie, /capture-sprint-jira 1\.2\.2 : installé, 13 fichiers tirés des modules/);

  // Les copies : agents et commandes, rien d'autre, chacun noté au registre avec son empreinte.
  assert.deepEqual(fichiersDe(join(b.gemini, 'agents')).map((f) => `agents/${f}`), AGENTS);
  assert.deepEqual(fichiersDe(join(b.gemini, 'commands')).map((f) => `commands/${f}`), COMMANDES);
  const registre = b.registre();
  assert.deepEqual(Object.keys(registre.fichiers).sort(), [...AGENTS, ...COMMANDES].sort());
  for (const [rel, note] of Object.entries(registre.fichiers)) assert.equal(note.sha256, sha256(readFileSync(join(b.gemini, ...rel.split('/')))), rel);

  // capteur-sprint et memoire-appli : en-tête de sous-agent de Gemini CLI, chemin du skill installé.
  const capteur = readFileSync(join(b.gemini, 'agents', 'capteur-sprint.md'), 'utf8');
  const source = readFileSync(join(b.skills, 'capture-sprint-jira', 'agent', 'capteur-sprint.md'), 'utf8');
  const description = /^description: (.*)$/m.exec(source)[1];
  assert.ok(capteur.startsWith(`---\nname: capteur-sprint\ndescription: ${JSON.stringify(description)}\nkind: local\ntools:\n  - run_shell_command\n  - read_file\n  - glob\n---\n`));
  assert.ok(capteur.includes(`Dossier du skill : \`${posix(join(b.skills, 'capture-sprint-jira'))}/\``));
  assert.ok(!capteur.includes('.skills/capture-sprint-jira/'));
  const memoire = readFileSync(join(b.gemini, 'agents', 'memoire-appli.md'), 'utf8');
  assert.match(memoire, /\nkind: local\ntools:\n {2}- run_shell_command\n {2}- read_file\n {2}- grep_search\n {2}- glob\n---\n/);
  assert.ok(memoire.includes(`node ${posix(join(b.skills, 'skill4appli'))}/scripts/app_db.mjs <commande>`));
  assert.ok(!/(^|[^\\])\.skills\/skill4appli\//.test(memoire));
  // explicateur-hote, écrit pour Gemini CLI : en-tête intact, <DOSSIER_DU_SKILL> remplacé par le chemin natif.
  const explicateur = readFileSync(join(b.gemini, 'agents', 'explicateur-hote.md'), 'utf8');
  const brut = readFileSync(join(b.skills, 'explication-hote-ia', 'agent', 'explicateur-hote.md'), 'utf8');
  assert.equal(explicateur, brut.split('<DOSSIER_DU_SKILL>').join(join(b.skills, 'explication-hote-ia')));
  // pilote-scenario, écrit pour Gemini CLI comme explicateur-hote.
  const pilote = readFileSync(join(b.gemini, 'agents', 'pilote-scenario.md'), 'utf8');
  const brutPilote = readFileSync(join(b.skills, 'scenario-playwright', 'agent', 'pilote-scenario.md'), 'utf8');
  assert.equal(pilote, brutPilote.split('<DOSSIER_DU_SKILL>').join(join(b.skills, 'scenario-playwright')));
  for (const rel of COMMANDES) {
    const [, groupe, fichier] = rel.split('/');
    assert.equal(readFileSync(join(b.gemini, ...rel.split('/')), 'utf8'), readFileSync(join(b.skills, SKILL_DES_COMMANDES[groupe], 'commandes', groupe, fichier), 'utf8'));
  }
  // Le fichier du skill ne change jamais : seule la copie s'adapte.
  assert.equal(source, attendus('capture-sprint-jira').get('agent/capteur-sprint.md'));

  assert.match(r.sortie, /\/skills reload, \/agents reload et \/commands reload/);
  assert.match(r.sortie, /capture-sprint-jira : ses dépendances, une fois, depuis son dossier : cd ".*" puis npm ci/);
  assert.match(r.sortie, /scenario-playwright : ses dépendances, une fois, depuis son dossier : cd ".*" puis npm ci/);
  assert.ok(r.sortie.includes(`generateur-skill-ticket : le chemin du clone qu'il demande, <dépôt>, est ${RACINE}`));
});

test('relancer ne change rien : tout est à jour, aucun fichier réécrit', (t) => {
  const b = bac(t);
  assert.equal(b.lancer().code, 0);
  const temoins = [join(b.skills, 'java', 'SKILL.md'), join(b.gemini, 'agents', 'capteur-sprint.md'), join(b.etat, 'installation.json')];
  const avant = temoins.map((f) => [statSync(f).mtimeMs, readFileSync(f, 'utf8')]);
  const r = b.lancer();
  assert.equal(r.code, 0, r.erreur);
  for (const nom of SKILLS) assert.match(r.sortie, new RegExp(`${nom} \\d+\\.\\d+\\.\\d+ : à jour\\n`));
  for (const rel of [...AGENTS, ...COMMANDES]) assert.match(r.sortie, new RegExp(`\\(${rel.replace(/[.]/g, '\\.')}\\) : à jour`));
  assert.doesNotMatch(r.sortie, /reload/);
  assert.deepEqual(temoins.map((f) => [statSync(f).mtimeMs, readFileSync(f, 'utf8')]), avant);
});

test('un skill intact se met à jour en place : les fichiers ajoutés depuis son installation restent', (t) => {
  const b = bac(t);
  assert.equal(b.outil('skill4appli@1.1.0', '--utilisateur').code, 0);
  const dossier = join(b.skills, 'skill4appli');
  writeFileSync(join(dossier, 'notes.txt'), 'notes\n');
  mkdirSync(join(dossier, 'node_modules', 'x'), { recursive: true });
  writeFileSync(join(dossier, 'node_modules', 'x', 'index.js'), '// dépendance\n');
  const r = b.lancer();
  assert.equal(r.code, 0, r.erreur);
  assert.match(r.sortie, /skill4appli 1\.1\.1 : mis à jour \(1\.1\.0 → 1\.1\.1\) ; 2 fichiers ajoutés depuis l'installation, gardés/);
  verifierSkill(dossier, 'skill4appli');
  assert.equal(readFileSync(join(dossier, 'notes.txt'), 'utf8'), 'notes\n');
  assert.ok(existsSync(join(dossier, 'node_modules', 'x', 'index.js')));
  const anciens = [...attendus('skill4appli', '1.1.0').keys()].filter((rel) => !attendus('skill4appli').has(rel));
  for (const rel of anciens) assert.equal(existsSync(join(dossier, ...rel.split('/'))), false, rel);
  assert.deepEqual(fichiersDe(dossier).filter((f) => !['notes.txt', 'node_modules/x/index.js', 'integrite.sha256'].includes(f)), [...attendus('skill4appli').keys()].sort());
});

test('un skill changé reste tel quel : sa nouvelle version est déposée à fusionner, et --fusionne en fait la base', (t) => {
  const b = bac(t);
  assert.equal(b.outil('skill4appli@1.1.0', '--utilisateur').code, 0);
  const dossier = join(b.skills, 'skill4appli');
  appendFileSync(join(dossier, 'SKILL.md'), '\nRéglage local.\n');
  const local = readFileSync(join(dossier, 'SKILL.md'), 'utf8');
  let r = b.lancer();
  assert.equal(r.code, 0, r.erreur);
  const depot = join(b.etat, 'a-fusionner', 'skills', 'skill4appli-1.1.1');
  assert.ok(r.sortie.includes(`skill4appli 1.1.1 : gardé tel quel, 1 changement local depuis son installation (1.1.0) ; nouvelle version déposée dans ${depot}`));
  assert.equal(readFileSync(join(dossier, 'SKILL.md'), 'utf8'), local);
  assert.equal(JSON.parse(readFileSync(join(dossier, 'manifest.json'), 'utf8')).version, '1.1.0');
  verifierSkill(depot, 'skill4appli');
  const ecarts = readFileSync(join(depot, 'ECARTS.txt'), 'utf8');
  assert.match(ecarts, /Version installée : 1\.1\.0/);
  assert.match(ecarts, /  SKILL\.md \(modifié\)/);
  assert.match(ecarts, /--fusionne skill4appli/);
  assert.match(r.sortie, /À fusionner à la main, depuis .* : skill4appli \(écarts dans ECARTS\.txt\) ; puis --fusionne <nom>\./);
  // L'agent suit le skill gardé : sa copie vient de la version installée.
  assert.match(readFileSync(join(b.gemini, 'agents', 'memoire-appli.md'), 'utf8'), /skill skill4appli 1\.1\.0/);

  // La fusion faite à la main : la nouvelle version, réglage local gardé ; --fusionne en fait la base.
  for (const rel of attendus('skill4appli').keys()) if (rel !== 'SKILL.md') cpSync(join(depot, ...rel.split('/')), join(dossier, ...rel.split('/')));
  for (const rel of attendus('skill4appli', '1.1.0').keys()) if (!attendus('skill4appli').has(rel)) rmSync(join(dossier, ...rel.split('/')), { force: true });
  r = b.lancer('--fusionne', 'skill4appli');
  assert.equal(r.code, 0, r.erreur);
  assert.match(r.sortie, /skill4appli 1\.1\.1 : la version fusionnée devient la base de l'installation ; 1 changement local par rapport au dépôt, gardé/);
  assert.equal(existsSync(depot), false);
  r = b.lancer();
  assert.match(r.sortie, /skill4appli 1\.1\.1 : à jour, 1 changement local gardé/);
  assert.match(r.sortie, /memoire-appli \(agents\/memoire-appli\.md\) : mis à jour \(1\.1\.0 → 1\.1\.1\)/);
  assert.equal(readFileSync(join(dossier, 'SKILL.md'), 'utf8'), local);
  // Sans version déposée, --fusionne refuse.
  r = b.lancer('--fusionne', 'java');
  assert.equal(r.code, 1);
  assert.match(r.erreur, /java 1\.1\.1 : aucune nouvelle version déposée à fusionner/);
});

test('--forcer remplace un skill changé et sauvegarde d\'abord ses changements locaux', (t) => {
  const b = bac(t);
  assert.equal(b.outil('skill4appli@1.1.0', '--utilisateur').code, 0);
  const dossier = join(b.skills, 'skill4appli');
  appendFileSync(join(dossier, 'SKILL.md'), '\nRéglage local.\n');
  const local = readFileSync(join(dossier, 'SKILL.md'), 'utf8');
  const r = b.lancer('--forcer');
  assert.equal(r.code, 0, r.erreur);
  const m = /skill4appli 1\.1\.1 : remplacé malgré 1 changement local \(--forcer\), changements locaux sauvegardés dans (.+)\n/.exec(r.sortie);
  assert.ok(m, r.sortie);
  assert.equal(readFileSync(join(m[1], 'SKILL.md'), 'utf8'), local);
  verifierSkill(dossier, 'skill4appli');
});

test('un agent changé reste tel quel ; sa nouvelle copie est déposée à fusionner, et --fusionne en fait la base', (t) => {
  const b = bac(t);
  assert.equal(b.lancer().code, 0);
  const copie = join(b.gemini, 'agents', 'capteur-sprint.md');
  appendFileSync(copie, '\nConsigne locale.\n');
  const locale = readFileSync(copie, 'utf8');
  let r = b.lancer();
  assert.match(r.sortie, /capteur-sprint \(agents\/capteur-sprint\.md\) : à jour, changé depuis son installation, gardé/);
  // Une copie installée par une version plus ancienne : la nouvelle est déposée, la locale reste.
  const registre = b.registre();
  const attendue = registre.fichiers['agents/capteur-sprint.md'].sha256;
  registre.fichiers['agents/capteur-sprint.md'] = { ...registre.fichiers['agents/capteur-sprint.md'], sha256: '0'.repeat(64), version: '1.2.1' };
  writeFileSync(join(b.etat, 'installation.json'), JSON.stringify(registre));
  r = b.lancer();
  assert.equal(r.code, 0, r.erreur);
  const depot = join(b.etat, 'a-fusionner', 'agents', 'capteur-sprint.md');
  assert.ok(r.sortie.includes(`capteur-sprint (agents/capteur-sprint.md) : gardé tel quel, changé depuis son installation ; nouvelle copie déposée dans ${depot}`));
  assert.equal(readFileSync(copie, 'utf8'), locale);
  assert.equal(sha256(readFileSync(depot)), attendue);
  r = b.lancer('--fusionne', 'capteur-sprint');
  assert.equal(r.code, 0, r.erreur);
  assert.match(r.sortie, /agents\/capteur-sprint\.md : la copie fusionnée devient la base de l'installation/);
  assert.equal(b.registre().fichiers['agents/capteur-sprint.md'].sha256, attendue);
  assert.equal(existsSync(depot), false);
  assert.match(b.lancer().sortie, /capteur-sprint \(agents\/capteur-sprint\.md\) : à jour, changé depuis son installation, gardé/);
  r = b.lancer('--fusionne', '/hote:carte');
  assert.equal(r.code, 1);
  assert.match(r.erreur, /\/hote:carte : aucun skill de ce nom, ni d'agent ou de commande déposé à fusionner/);
});

test('une mise à jour en place interrompue se reprend au lancement suivant', (t) => {
  const b = bac(t);
  assert.equal(b.outil('skill4appli@1.1.0', '--utilisateur').code, 0);
  const dossier = join(b.skills, 'skill4appli');
  const nouveaux = attendus('skill4appli');
  // Interrompue après le journal et un premier fichier écrit.
  writeFileSync(join(dossier, '.agent2prompt-mise-a-jour'), tableDe([...nouveaux]));
  writeFileSync(join(dossier, 'manifest.json'), nouveaux.get('manifest.json'));
  const r = b.lancer();
  assert.equal(r.code, 0, r.erreur);
  assert.match(r.sortie, /skill4appli 1\.1\.1 : mis à jour \(mise à jour interrompue reprise\)/);
  verifierSkill(dossier, 'skill4appli');
  assert.equal(existsSync(join(dossier, '.agent2prompt-mise-a-jour')), false);
});

test("niveau d'un projet : skills masqués, agents, commandes et état exclus de Git, analyse-projet et observatoire écartés ; --retirer nettoie", (t) => {
  const b = bac(t);
  const ws = b.depot();
  let r = b.lancer('--workspace', ws);
  assert.equal(r.code, 0, r.erreur);
  assert.match(r.sortie, /analyse-projet : non installé, niveau utilisateur seul/);
  assert.equal(existsSync(join(ws, '.gemini', 'skills', 'analyse-projet')), false);
  assert.match(r.sortie, /observatoire : non installé, niveau utilisateur seul \(il observe plusieurs projets depuis le clone d'Agent2Prompt, sans écrire dans aucun\)/);
  assert.equal(existsSync(join(ws, '.gemini', 'skills', 'observatoire')), false);
  assert.equal(b.statut(ws), '');
  assert.match(r.sortie, /11 skills masqués à Git, lisibles par Gemini CLI/);
  const exclusion = readFileSync(join(ws, '.git', 'info', 'exclude'), 'utf8');
  assert.match(exclusion, /# >>> installateur agent2prompt : agents, commandes et état de installer\.mjs\n\/\.gemini\/agent2prompt\/\n\/\.gemini\/agents\/capteur-sprint\.md\n/);
  assert.match(exclusion, /\/\.gemini\/skills\/java\//);
  const capteur = readFileSync(join(ws, '.gemini', 'agents', 'capteur-sprint.md'), 'utf8');
  assert.ok(capteur.includes(`${posix(join(ws, '.gemini', 'skills', 'capture-sprint-jira'))}/`));
  assert.equal(existsSync(b.gemini), false, 'rien au niveau utilisateur');

  r = b.lancer('--retirer', '--workspace', ws);
  assert.equal(r.code, 0, r.erreur);
  assert.equal(b.statut(ws), '');
  assert.equal(existsSync(join(ws, '.gemini', 'agents')), false);
  assert.equal(existsSync(join(ws, '.gemini', 'skills', 'java')), false);
  assert.doesNotMatch(readFileSync(join(ws, '.git', 'info', 'exclude'), 'utf8'), /agent2prompt/);
});

test('--retirer retire ce qui est intact, et garde les changements locaux et les fichiers ajoutés', (t) => {
  const b = bac(t);
  assert.equal(b.lancer().code, 0);
  mkdirSync(join(b.skills, 'capture-sprint-jira', 'node_modules', 'playwright-core'), { recursive: true });
  writeFileSync(join(b.skills, 'capture-sprint-jira', 'node_modules', 'playwright-core', 'index.js'), '// dépendance\n');
  appendFileSync(join(b.skills, 'java', 'SKILL.md'), '\nRéglage local.\n');
  appendFileSync(join(b.gemini, 'agents', 'memoire-appli.md'), '\nConsigne locale.\n');
  let r = b.lancer('--retirer');
  assert.equal(r.code, 0, r.erreur);
  assert.match(r.sortie, /java : 1 changement local depuis son installation ; gardé \(--forcer pour le retirer\)/);
  assert.match(r.sortie, /agents\/memoire-appli\.md : retrait demandé, mais changé depuis son installation ; gardé/);
  assert.match(r.sortie, /capture-sprint-jira : retiré ; 1 fichier ajouté depuis l'installation, gardé dans /);
  assert.deepEqual(readdirSync(b.skills).sort(), ['capture-sprint-jira', 'java']);
  assert.deepEqual(fichiersDe(join(b.skills, 'capture-sprint-jira')), ['node_modules/playwright-core/index.js']);
  assert.deepEqual(readdirSync(join(b.gemini, 'agents')), ['memoire-appli.md']);
  assert.equal(existsSync(join(b.gemini, 'commands')), false);
  assert.deepEqual(Object.keys(b.registre().fichiers), ['agents/memoire-appli.md']);

  r = b.lancer('--retirer', '--forcer');
  assert.equal(r.code, 0, r.erreur);
  assert.match(r.sortie, /java : retiré, changements locaux sauvegardés dans /);
  assert.equal(existsSync(join(b.skills, 'java')), false);
  assert.equal(existsSync(join(b.gemini, 'agents')), false);
  assert.equal(existsSync(join(b.etat, 'installation.json')), false);
  assert.match(r.sortie, /Gardé : .*sauvegardes/);
});

test("--essai montre ce qui serait fait et n'écrit rien", (t) => {
  const b = bac(t);
  const r = b.lancer('--essai');
  assert.equal(r.code, 0, r.erreur);
  assert.match(r.sortie, /essai : java 1\.1\.1 : installé/);
  assert.match(r.sortie, /essai : capteur-sprint \(agents\/capteur-sprint\.md\) : installé ; en-tête adapté à Gemini CLI \(outils : run_shell_command, read_file, glob\)/);
  assert.equal(existsSync(join(b.base, 'home')), false);
});

test('--liste donne, pour chaque skill, agent et commande, la version du dépôt et l\'état installé', (t) => {
  const b = bac(t);
  assert.equal(b.outil('skill4appli@1.1.0', '--utilisateur').code, 0);
  assert.equal(b.lancer('--retirer').code, 0);
  assert.equal(b.outil('skill4appli@1.1.0', '--utilisateur').code, 0);
  assert.equal(b.outil('java', '--utilisateur').code, 0);
  appendFileSync(join(b.skills, 'java', 'SKILL.md'), '\nRéglage local.\n');
  const r = b.lancer('--liste');
  assert.equal(r.code, 0, r.erreur);
  assert.match(r.sortie, /skill4appli +1\.1\.1 +1\.1\.0, ancienne\n/);
  assert.match(r.sortie, /java +1\.1\.1 +1\.1\.1, 1 changement local\n/);
  assert.match(r.sortie, /agent2dev +\d+\.\d+\.\d+ +système à construire, non installable/);
  assert.match(r.sortie, /orchestrateur-c7e +\d+\.\d+\.\d+ +—/);
  assert.match(r.sortie, /memoire-appli \(agents\/memoire-appli\.md\) +skill4appli +absent/);
});

test('arguments : une action à la fois, des noms seulement avec --fusionne', (t) => {
  const b = bac(t);
  let r = b.lancer('java');
  assert.equal(r.code, 2);
  assert.match(r.erreur, /argument inattendu : java \(l'installateur prend tout le dépôt ; pour un seul skill, tools\/installer\.mjs\)/);
  r = b.lancer('--liste', '--retirer');
  assert.equal(r.code, 2);
  assert.match(r.erreur, /une seule action à la fois : --liste, --retirer/);
  r = b.lancer('--fusionne');
  assert.equal(r.code, 2);
  r = b.lancer('--aide');
  assert.equal(r.code, 0);
  assert.match(r.sortie, /--fusionne <nom>/);
});

test('installer.cmd : ASCII, fins de ligne CRLF, et il passe ses arguments à installer.mjs', (t) => {
  const octets = readFileSync(join(RACINE, 'installer.cmd'));
  assert.ok(octets.every((o) => o < 0x80), 'ASCII seulement');
  const texte = octets.toString('ascii');
  assert.ok(texte.split('\r\n').slice(0, -1).every((l) => !l.includes('\n')) && texte.endsWith('\r\n'), 'fins de ligne CRLF');
  assert.ok(texte.includes('node "%~dp0installer.mjs" %*'));
  if (process.platform !== 'win32') return;
  const b = bac(t);
  const r = spawnSync('cmd.exe', ['/d', '/s', '/c', `"${join(RACINE, 'installer.cmd')}" --liste`], { env: b.env, encoding: 'utf8', windowsVerbatimArguments: true });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Dépôt/);
});

test("en-tête d'agent : celui d'un autre outil devient celui de Gemini CLI ; celui de Gemini CLI reste tel quel", () => {
  const corps = '\n# Agent\n';
  const autre = `---\nname: essai\ndescription: Agent d'essai : il lit, sans écrire.\ntools: Bash, Read, Grep, Glob\n---\n${corps}`;
  const adapte = adapterEntete(autre, 'essai');
  assert.equal(adapte.contenu, `---\nname: essai\ndescription: "Agent d'essai : il lit, sans écrire."\nkind: local\ntools:\n  - run_shell_command\n  - read_file\n  - grep_search\n  - glob\n---\n${corps}`);
  assert.deepEqual(adapte.outils, ['run_shell_command', 'read_file', 'grep_search', 'glob']);
  const natif = `---\nname: essai\ndescription: Agent.\nkind: local\ntools:\n  - read_file\n---\n${corps}`;
  assert.deepEqual(adapterEntete(natif, 'essai'), { contenu: natif, outils: null });
  assert.throws(() => adapterEntete(autre.replace('Glob', 'Telepathie'), 'essai'), (e) => e instanceof Erreur && /outil sans équivalent dans Gemini CLI, Telepathie/.test(e.message));
  assert.throws(() => adapterEntete(autre.replace('tools:', 'model: rapide\ntools:'), 'essai'), (e) => e instanceof Erreur && /champ d'en-tête sans équivalent sûr dans Gemini CLI, model/.test(e.message));
  assert.throws(() => adapterEntete('# sans en-tête\n', 'essai'), /sans en-tête/);
});
