// Recette du lot 3 : l'arbre de skills de ticket s'installe dans un workspace de Gemini CLI, avec ses
// agents, ses commandes et son relevé, masqués à Git ; il se liste, se vérifie, se lance nœud par nœud et
// se retire en archivant ses transmissions. Avec Gemini CLI réel (variable SKILL_TICKET_GEMINI), les
// skills sont découverts et les agents chargés : la partie du critère P4 qui se vérifie sans modèle. Au
// lot 4, les sous-agents de rôle de la racine s'installent avec les agents de couche, et la racine
// commence par les documents de la clé. Au lot 5, les observateurs d'ordre 2 et 3 s'y ajoutent, et l'état
// des nœuds se lit dans le champ d'observation de l'arbre.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { relire } from '../../../tools/bundle.mjs';
import { lireTexte } from '../outils/referentiel.mjs';
import { phraseActivation, sha256 } from '../outils/fabrique.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const OUTIL = join(ICI, '..', 'outils', 'installer-arbre.mjs');
const TRANSMISSIONS = join(ICI, '..', 'exemples', 'ABCDE-3620-skills', 'transmissions');
const NOMS = ['ticket-abcde-3620', 'ticket-abcde-3620-1', 'ticket-abcde-3620-1-1', 'ticket-abcde-3620-1-2', 'ticket-abcde-3620-2'];
const AGENTS = [
  'ticket-abcde-3620-1-1-persistance.md', 'ticket-abcde-3620-1-2-back.md', 'ticket-abcde-3620-2-front.md',
  'ticket-abcde-3620-analyste.md', 'ticket-abcde-3620-observateur-2.md', 'ticket-abcde-3620-observateur-3.md', 'ticket-abcde-3620-qualite.md',
  'ticket-abcde-3620-redacteur.md', 'ticket-abcde-3620-relecteur.md',
];
const COMMANDES = ['abcde-3620-1-1.toml', 'abcde-3620-1-2.toml', 'abcde-3620-1.toml', 'abcde-3620-2.toml', 'abcde-3620.toml'];
const GEMINI = process.env.SKILL_TICKET_GEMINI;

// Chemin réel : sous Windows, le dossier temporaire peut s'écrire en noms courts, que Gemini CLI ne reconnaîtrait pas.
const temporaire = (prefixe) => realpathSync.native(mkdtempSync(join(tmpdir(), prefixe)));
const lancer = (args, options = {}) => spawnSync(process.execPath, [OUTIL, ...args], { encoding: 'utf8', ...options, env: { ...process.env, SKILL_TICKET_GEMINI: '', ...options.env } });
const installer = (ws, ...autres) => lancer(['installer', TRANSMISSIONS, '--workspace', ws, ...autres]);
const fichiersDe = (nom) => new Map(relire(lireTexte(join(TRANSMISSIONS, `${nom}-1.0.0.md`))).fichiers.map((f) => [f.rel, f.contenu]));
const git = (ws, ...args) => spawnSync('git', ['-C', ws, ...args], { encoding: 'utf8' });
const depotGit = () => {
  const ws = temporaire('ws-git-');
  git(ws, 'init', '-q');
  return ws;
};

test('installer : cinq skills, neuf agents, cinq commandes, un relevé', () => {
  const ws = temporaire('ws-');
  const r = installer(ws);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /arbre ABCDE-3620 installé : 5 skills, 9 agents, 5 commandes/);
  for (const nom of NOMS) assert.ok(existsSync(join(ws, '.gemini', 'skills', nom, 'integrite.sha256')), nom);
  assert.deepStrictEqual(readdirSync(join(ws, '.gemini', 'agents')).sort(), AGENTS);
  assert.deepStrictEqual(readdirSync(join(ws, '.gemini', 'commands', 'ticket')).sort(), COMMANDES);
  const agent = fichiersDe('ticket-abcde-3620-1-2').get('agents/ticket-abcde-3620-1-2-back.md');
  assert.equal(readFileSync(join(ws, '.gemini', 'agents', 'ticket-abcde-3620-1-2-back.md'), 'utf8'), agent);
  const releve = JSON.parse(readFileSync(join(ws, '.gemini', 'skill-ticket', 'ABCDE-3620', 'installation.json'), 'utf8'));
  assert.equal(releve.format, 'skill-ticket.installation/1');
  assert.deepStrictEqual(releve.noeuds.map((n) => n.nom), NOMS);
  assert.deepStrictEqual(releve.commandes.map((c) => c.commande).sort(), ['/ticket:abcde-3620', '/ticket:abcde-3620-1', '/ticket:abcde-3620-1-1', '/ticket:abcde-3620-1-2', '/ticket:abcde-3620-2']);
  for (const n of releve.noeuds) {
    const copie = readFileSync(join(ws, '.gemini', 'skill-ticket', 'ABCDE-3620', n.transmission), 'utf8');
    assert.equal(copie, lireTexte(join(TRANSMISSIONS, `${n.nom}-1.0.0.md`)));
    assert.equal(sha256(copie), n.sha256);
  }
});

test('installer deux fois : rien ne change, l\'installation est intacte', () => {
  const ws = temporaire('ws-');
  assert.equal(installer(ws).status, 0);
  const releve = readFileSync(join(ws, '.gemini', 'skill-ticket', 'ABCDE-3620', 'installation.json'), 'utf8');
  const r = installer(ws);
  assert.equal(r.status, 0, r.stderr);
  assert.equal((r.stdout.match(/déjà installé dans .*, intact/g) ?? []).length, 5);
  assert.equal(readFileSync(join(ws, '.gemini', 'skill-ticket', 'ABCDE-3620', 'installation.json'), 'utf8'), releve);
});

test('un agent modifié depuis l\'installation n\'est remplacé qu\'avec --forcer', () => {
  const ws = temporaire('ws-');
  assert.equal(installer(ws).status, 0);
  const agent = join(ws, '.gemini', 'agents', 'ticket-abcde-3620-2-front.md');
  const original = readFileSync(agent, 'utf8');
  writeFileSync(agent, `${original}\nAjout local.\n`);
  const refus = installer(ws);
  assert.equal(refus.status, 1);
  assert.match(refus.stderr, /\.gemini\/agents\/ticket-abcde-3620-2-front\.md : modifié depuis l'installation/);
  assert.equal(installer(ws, '--forcer').status, 0);
  assert.equal(readFileSync(agent, 'utf8'), original);
});

test('un fichier étranger à la place d\'une commande n\'est pas écrasé', () => {
  const ws = temporaire('ws-');
  mkdirSync(join(ws, '.gemini', 'commands', 'ticket'), { recursive: true });
  writeFileSync(join(ws, '.gemini', 'commands', 'ticket', 'abcde-3620.toml'), 'description = "à moi"\nprompt = "x"\n');
  const r = installer(ws);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /abcde-3620\.toml : existe, sans avoir été installé par cet outil/);
  assert.equal(existsSync(join(ws, '.gemini', 'skills')), false, 'rien ne doit être installé');
});

test('un arbre incomplet ou une transmission altérée ne s\'installe pas', () => {
  const quatre = temporaire('transmissions-');
  for (const f of readdirSync(TRANSMISSIONS).filter((f) => !f.startsWith('ticket-abcde-3620-2-'))) cpSync(join(TRANSMISSIONS, f), join(quatre, f));
  const ws = temporaire('ws-');
  const incomplet = lancer(['installer', quatre, '--workspace', ws]);
  assert.equal(incomplet.status, 1);
  assert.match(incomplet.stderr, /ABCDE-3620 : son sous-ticket ABCDE-3620-2 manque/);
  const alteree = join(quatre, 'ticket-abcde-3620-1-2-1.0.0.md');
  writeFileSync(alteree, lireTexte(alteree).replace(/^- \*\*D3\.INV-1\*\* : .*\n/m, ''));
  const refus = lancer(['installer', alteree, '--workspace', ws]);
  assert.equal(refus.status, 1);
  assert.match(refus.stderr, /empreinte fausse|invariant omis/);
  assert.deepStrictEqual(readdirSync(ws), []);
});

test('dépôt Git : tout est masqué, git status reste vide ; retirer remet l\'exclusion locale en l\'état', () => {
  const ws = depotGit();
  const exclusionAvant = readFileSync(join(ws, '.git', 'info', 'exclude'), 'utf8');
  const r = installer(ws);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /agents, commandes et relevé masqués à Git/);
  assert.equal(git(ws, 'status', '--porcelain', '--untracked-files=all').stdout, '');
  const exclusion = readFileSync(join(ws, '.git', 'info', 'exclude'), 'utf8');
  assert.match(exclusion, /# >>> skill-ticket[^\n]*\n\/\.gemini\/agents\/ticket-abcde-3620-1-1-persistance\.md\n/);
  assert.match(exclusion, /# >>> agent2prompt[^\n]*\n\/\.geminiignore\n\/\.gemini\/skills\/ticket-abcde-3620\/\n/);
  const retrait = lancer(['retirer', 'ABCDE-3620', '--workspace', ws, '--sans-archive']);
  assert.equal(retrait.status, 0, retrait.stderr);
  assert.equal(git(ws, 'status', '--porcelain', '--untracked-files=all').stdout, '');
  assert.equal(readFileSync(join(ws, '.git', 'info', 'exclude'), 'utf8').replace(/\n+$/, ''), exclusionAvant.replace(/\n+$/, ''));
});

test('dépôt Git, --visible : skills, agents, commandes et relevé apparaissent dans git status', () => {
  const ws = depotGit();
  assert.equal(installer(ws, '--visible').status, 0);
  const statut = git(ws, 'status', '--porcelain', '--untracked-files=all').stdout;
  assert.match(statut, /\.gemini\/agents\/ticket-abcde-3620-1-2-back\.md/);
  assert.match(statut, /\.gemini\/commands\/ticket\/abcde-3620\.toml/);
  assert.match(statut, /\.gemini\/skills\/ticket-abcde-3620\/SKILL\.md/);
});

/** États des nœuds et ligne du champ, d'après la liste de l'installateur. */
const lister = (ws) => {
  const lignes = lancer(['liste', '--workspace', ws]).stdout.trim().split('\n');
  return {
    etats: Object.fromEntries(lignes.filter((l) => l.startsWith('  ')).map((l) => /^ {2}(\S+)\s+\S+\s+\S+\s+(.+)$/.exec(l)).map((m) => [m[1], m[2]])),
    champ: lignes.find((l) => l.startsWith('Champ : ')) ?? null,
    vue: lignes.find((l) => l.startsWith('Vue : ')) ?? null,
  };
};
const dossierDans = (ws) => (...p) => {
  const d = join(ws, 'docs', 'demandes', 'ABCDE-3620', ...p);
  mkdirSync(d, { recursive: true });
  return d;
};

test('liste : état de chaque nœud, des documents de la clé à la clôture, d\'après le champ de l\'arbre', () => {
  const ws = temporaire('ws-');
  assert.equal(installer(ws).status, 0);
  const etats = () => lister(ws).etats;
  assert.deepStrictEqual(etats(), {
    'ABCDE-3620': 'documents à rédiger',
    'ABCDE-3620-1': 'en cours',
    'ABCDE-3620-1.1': 'en attente de la ratification de l\'arbre',
    'ABCDE-3620-1.2': 'en attente de la ratification de l\'arbre',
    'ABCDE-3620-2': 'en attente de la ratification de l\'arbre',
  });
  assert.equal(lister(ws).champ, null, 'pas de ligne du champ avant le premier dépôt');
  assert.equal(lister(ws).vue, null, 'ni de la vue');
  const dossier = dossierDans(ws);
  writeFileSync(join(dossier(), 'us.md'), '# ABCDE-3620 : US et critères d\'acceptation\n');
  assert.equal(etats()['ABCDE-3620'], 'arbre à ratifier');
  // Les dépôts passent par le script du skill racine installé, depuis la racine du projet, comme dans les consignes.
  const champ = (...args) => spawnSync(process.execPath, [join('.gemini', 'skills', 'ticket-abcde-3620', 'outils', 'champ.mjs'), ...args], { encoding: 'utf8', cwd: ws });
  const deposer = (...args) => {
    const r = champ('deposer', 'docs/demandes/ABCDE-3620', ...args);
    assert.equal(r.status, 0, r.stderr);
    return r;
  };
  const ratifier = (noeud, objet, decision = 'ratifié') => deposer('retour', '--noeud', noeud, '--auteur', 'essai', '--nature', 'ratification', '--objet', objet, '--decision', decision, '--par', 'Fred', '--contenu', decision);
  ratifier('ABCDE-3620', 'arbre ABCDE-3620');
  assert.equal(etats()['ABCDE-3620-1.1'], 'prêt');
  const generer = 'node .gemini/skills/ticket-abcde-3620/outils/vue.mjs generer docs/demandes/ABCDE-3620';
  assert.equal(lister(ws).vue, `Vue : docs/demandes/ABCDE-3620/vue.html, absente : ${generer}`);
  writeFileSync(join(dossier('ABCDE-3620-1.1'), 'analyse.md'), 'analyse\n');
  assert.equal(etats()['ABCDE-3620-1.1'], 'analysé, à ratifier');
  ratifier('ABCDE-3620-1.1', 'ABCDE-3620-1.1');
  assert.equal(etats()['ABCDE-3620-1.1'], 'ratifié, en transformation');
  assert.equal(lister(ws).champ, 'Champ : 2 enregistrements ; critères : 0 prouvé, 0 en écart, 0 menacé ; 0 désaccord ; 0 observation attendue');
  // La vue se génère par le script du skill racine installé, comme dans les consignes.
  const vue = (...args) => spawnSync(process.execPath, [join('.gemini', 'skills', 'ticket-abcde-3620', 'outils', 'vue.mjs'), ...args], { encoding: 'utf8', cwd: ws });
  const g = vue('generer', 'docs/demandes/ABCDE-3620');
  assert.equal(g.status, 0, g.stderr);
  assert.equal(lister(ws).vue, 'Vue : docs/demandes/ABCDE-3620/vue.html, à jour, tirée du champ au n° 2');
  assert.match(vue('generer', 'docs/demandes/ABCDE-3620', '--noeud', 'ABCDE-3620-1.1').stdout, /^# Vue augmentée de ABCDE-3620-1\.1, dans l'arbre ABCDE-3620\n[\s\S]*- ABCDE-3620-1\.1 : ratifié \(n° 2, /);
  deposer('observation', '--noeud', 'ABCDE-3620-1.1', '--auteur', 'ticket-abcde-3620-1-1-persistance', '--ordre', '1', '--verdict', 'ecart', '--ancre', 'critere:ABCDE-3620-1.1:C1', '--ecart', 'requête native', '--preuve', 'test:LigneCommandeRepositoryTest.java');
  assert.equal(lister(ws).champ, 'Champ : 3 enregistrements ; critères : 0 prouvé, 1 en écart, 2 menacés ; 0 désaccord ; 0 observation attendue');
  assert.equal(lister(ws).vue, `Vue : docs/demandes/ABCDE-3620/vue.html, périmée, tirée du champ au n° 2, champ au n° 3 : ${generer}`);
  assert.equal(vue('verifier', 'docs/demandes/ABCDE-3620').status, 1);
  assert.match(champ('etat', 'docs/demandes/ABCDE-3620').stdout, /ABCDE-3620:C4 \(ABCDE-3620-CA04\) : menacé par ABCDE-3620-1\.1:C1/);
  writeFileSync(join(dossier('ABCDE-3620-1.1'), 'remise.md'), 'remise\n');
  writeFileSync(join(dossier('ABCDE-3620-1.2'), 'remise.md'), 'remise\n');
  assert.deepStrictEqual([etats()['ABCDE-3620-1.1'], etats()['ABCDE-3620-1'], etats()['ABCDE-3620-2']], ['clos', 'prêt à clore', 'prêt']);
  ratifier('ABCDE-3620', 'arbre ABCDE-3620', 'non ratifié');
  assert.equal(etats()['ABCDE-3620'], 'arbre à ratifier', 'la dernière décision fait foi');
  // Un champ écrit à la main se voit dans la liste.
  writeFileSync(join(dossier(), 'champ.jsonl'), `${readFileSync(join(dossier(), 'champ.jsonl'), 'utf8')}{"n":5}\n`);
  assert.match(lister(ws).champ, / ; altéré, \d+ écarts? : node \.gemini\/skills\/ticket-abcde-3620\/outils\/champ\.mjs verifier docs\/demandes\/ABCDE-3620$/);
  assert.equal(lister(ws).vue, null, 'un champ altéré ne donne pas de vue : la ligne du champ dit où');
  assert.match(vue('generer', 'docs/demandes/ABCDE-3620').stderr, /REFUS {2}champ altéré, vue non générée/);
  assert.equal(champ('verifier', 'docs/demandes/ABCDE-3620').status, 1);
});

test('liste : un arbre installé avant le lot 5 garde sa ratification dans retours.md ; une décision du champ l\'emporte', () => {
  const ws = temporaire('ws-');
  assert.equal(installer(ws).status, 0);
  const dossier = dossierDans(ws);
  writeFileSync(join(dossier(), 'us.md'), '# ABCDE-3620 : US et critères d\'acceptation\n');
  writeFileSync(join(dossier(), 'retours.md'), '- 2026-11-08, Fred : arbre ABCDE-3620 ratifié\n');
  assert.equal(lister(ws).etats['ABCDE-3620-1.1'], 'prêt');
  writeFileSync(join(dossier('ABCDE-3620-1.1'), 'analyse.md'), 'analyse\n');
  writeFileSync(join(dossier('ABCDE-3620-1.1'), 'retours.md'), '- 2026-11-09, Fred : ABCDE-3620-1.1 ratifié\n');
  assert.equal(lister(ws).etats['ABCDE-3620-1.1'], 'ratifié, en transformation');
  writeFileSync(join(dossier(), 'retours.md'), '- 2026-11-08, Fred : arbre ABCDE-3620 non ratifié, critères à revoir\n');
  assert.equal(lister(ws).etats['ABCDE-3620'], 'arbre à ratifier');
  const r = spawnSync(process.execPath, [join('.gemini', 'skills', 'ticket-abcde-3620', 'outils', 'champ.mjs'), 'deposer', 'docs/demandes/ABCDE-3620', 'retour', '--noeud', 'ABCDE-3620', '--auteur', 'essai', '--nature', 'ratification', '--objet', 'arbre ABCDE-3620', '--decision', 'ratifié', '--par', 'Fred', '--contenu', 'ratifié'], { encoding: 'utf8', cwd: ws });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(lister(ws).etats['ABCDE-3620-1.1'], 'ratifié, en transformation', 'le champ ratifie l\'arbre ; la feuille garde la ratification de retours.md');
});

test('verifier : fichiers intacts, puis un agent modifié est signalé', () => {
  const ws = temporaire('ws-');
  assert.equal(installer(ws).status, 0);
  const ok = lancer(['verifier', 'ABCDE-3620', '--workspace', ws], { env: { PATH: '' } });
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /5 skills, 9 agents et 5 commandes installés et intacts/);
  assert.match(ok.stdout, /Gemini CLI introuvable : découverte des skills et des agents non vérifiée/);
  writeFileSync(join(ws, '.gemini', 'agents', 'ticket-abcde-3620-1-1-persistance.md'), 'autre\n');
  const ko = lancer(['verifier', '--workspace', ws], { env: { PATH: '' } });
  assert.equal(ko.status, 1);
  assert.match(ko.stderr, /\.gemini\/agents\/ticket-abcde-3620-1-1-persistance\.md : modifié depuis l'installation/);
});

test('lancer : Gemini CLI en mode interactif, sur la phrase qui active le skill du nœud, dans le workspace', () => {
  const ws = temporaire('ws-');
  assert.equal(installer(ws).status, 0);
  const essai = lancer(['lancer', 'ABCDE-3620', '--workspace', ws, '--essai']);
  assert.equal(essai.status, 0);
  assert.equal(essai.stdout.trim(), `essai : gemini -i "${phraseActivation('ticket-abcde-3620')}"`);
  // Un faux Gemini CLI note ses arguments : script exécutable sous Linux, fichier .cmd sous Windows.
  const faux = temporaire('faux-gemini-');
  const sortie = join(faux, 'sortie.json');
  writeFileSync(join(faux, 'noter.js'), 'require("fs").writeFileSync(process.env.SORTIE_GEMINI, JSON.stringify({ argv: process.argv.slice(2), cwd: process.cwd() }));\n');
  let executable;
  if (process.platform === 'win32') {
    executable = join(faux, 'gemini.cmd');
    writeFileSync(executable, `@echo off\r\n"${process.execPath}" "%~dp0noter.js" %*\r\n`);
  } else {
    executable = join(faux, 'gemini');
    writeFileSync(executable, `#!/bin/sh\nexec "${process.execPath}" "${join(faux, 'noter.js')}" "$@"\n`);
    chmodSync(executable, 0o755);
  }
  const r = lancer(['lancer', 'ABCDE-3620-1.2', '--workspace', ws, '--gemini', executable], { env: { SORTIE_GEMINI: sortie } });
  assert.equal(r.status, 0, r.stderr);
  const note = JSON.parse(readFileSync(sortie, 'utf8'));
  assert.deepStrictEqual(note.argv, ['-i', phraseActivation('ticket-abcde-3620-1-2')]);
  assert.equal(note.cwd.toLowerCase(), ws.toLowerCase());
  const inconnu = lancer(['lancer', 'ABCDE-9999', '--workspace', ws]);
  assert.equal(inconnu.status, 1);
  assert.match(inconnu.stderr, /ABCDE-9999 : aucun skill de ticket installé/);
});

test('retirer : transmissions archivées dans le dossier du ticket, plus rien dans .gemini', () => {
  const ws = temporaire('ws-');
  assert.equal(installer(ws).status, 0);
  const essai = lancer(['retirer', 'ABCDE-3620', '--workspace', ws, '--essai']);
  assert.equal(essai.status, 0);
  assert.ok(existsSync(join(ws, '.gemini', 'skills', 'ticket-abcde-3620')));
  const r = lancer(['retirer', 'ABCDE-3620', '--workspace', ws]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /5 transmissions archivées dans docs\/demandes\/ABCDE-3620\/skills\//);
  const archive = join(ws, 'docs', 'demandes', 'ABCDE-3620', 'skills');
  assert.deepStrictEqual(readdirSync(archive).sort(), readdirSync(TRANSMISSIONS).sort());
  for (const f of readdirSync(archive)) assert.equal(readFileSync(join(archive, f), 'utf8'), lireTexte(join(TRANSMISSIONS, f)));
  for (const d of ['agents', 'commands', 'skill-ticket']) assert.equal(existsSync(join(ws, '.gemini', d)), false, d);
  assert.deepStrictEqual(readdirSync(join(ws, '.gemini', 'skills')), []);
  assert.match(lancer(['retirer', 'ABCDE-3620', '--workspace', ws]).stdout, /rien à retirer/);
});

test('usage incorrect : code de sortie 2', () => {
  assert.equal(lancer([]).status, 2);
  assert.equal(lancer(['installer']).status, 2);
  assert.equal(lancer(['lancer', 'a', 'b']).status, 2);
  assert.equal(lancer(['liste', '--inconnue']).status, 2);
  assert.equal(lancer(['liste', '--workspace', join(tmpdir(), 'absent-skill-ticket')]).status, 2);
});

test('Gemini CLI réel : skills découverts et activés, agents chargés, dossier non fiable signalé', { skip: GEMINI ? false : 'SKILL_TICKET_GEMINI non définie : Gemini CLI absent' }, () => {
  const ws = depotGit();
  assert.equal(installer(ws).status, 0);
  const maison = temporaire('gemini-home-');
  mkdirSync(join(maison, '.gemini'));
  const env = { SKILL_TICKET_GEMINI: GEMINI, GEMINI_CLI_HOME: maison };
  const nonFiable = lancer(['verifier', 'ABCDE-3620', '--workspace', ws], { env });
  assert.equal(nonFiable.status, 1);
  assert.match(nonFiable.stderr, /dossier non fiable pour Gemini CLI/);
  writeFileSync(join(maison, '.gemini', 'trustedFolders.json'), JSON.stringify({ [ws]: 'TRUST_FOLDER' }));
  const r = lancer(['verifier', 'ABCDE-3620', '--workspace', ws], { env });
  assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
  assert.match(r.stdout, /Gemini CLI \d+\.\d+\.\d+ : skills découverts et activés, agents chargés sans erreur/);
});
