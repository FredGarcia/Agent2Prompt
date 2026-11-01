// Contrat avec Gemini CLI : ce que son propre code fait d'une installation par tools/installer.mjs.
// Lancé par .github/workflows/recette-installer.yml, à côté du paquet @google/gemini-cli-core à la version
// épinglée : node contrat-gemini.mjs <racine du dépôt>. Découverte des skills (nom, description, modules
// non pris pour des skills) et lecture de chacun de leurs fichiers par l'outil de Gemini CLI.
import { execFileSync } from 'node:child_process';
import { appendFileSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { FileDiscoveryService, loadSkillsFromDir } from '@google/gemini-cli-core';

const depot = process.argv[2];
const base = mkdtempSync(join(tmpdir(), 'contrat-'));
const env = {
  ...process.env,
  GEMINI_CLI_HOME: join(base, 'home'),
  GIT_CONFIG_GLOBAL: join(base, 'gitconfig'),
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'contrat',
  GIT_AUTHOR_EMAIL: 'contrat@example.invalid',
  GIT_COMMITTER_NAME: 'contrat',
  GIT_COMMITTER_EMAIL: 'contrat@example.invalid',
};
const git = (cwd, ...args) => execFileSync('git', args, { cwd, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const installer = (cwd, ...args) => execFileSync(process.execPath, [join(depot, 'tools', 'installer.mjs'), ...args], { cwd, env, encoding: 'utf8' });
const fichiers = (dossier) => readdirSync(dossier).flatMap((n) => (statSync(join(dossier, n)).isDirectory() ? fichiers(join(dossier, n)) : [join(dossier, n)]));

let ecarts = 0;
function constat(ok, message) {
  console.log(`${ok ? 'ok   ' : 'ÉCART'}  ${message}`);
  if (!ok) ecarts++;
}

// Un projet dont le .gitignore ignore node_modules, et où /.gemini/skills/ est déjà exclu de Git,
// comme le conseillait le mode d'emploi de l'orchestrateur C7E 3.2.0.
const ws = join(base, 'projet');
mkdirSync(join(ws, 'node_modules', 'lib'), { recursive: true });
writeFileSync(join(ws, 'node_modules', 'lib', 'index.js'), '// dépendance\n');
writeFileSync(join(ws, '.gitignore'), 'node_modules/\n');
writeFileSync(join(ws, 'README.md'), 'projet\n');
git(ws, 'init', '-q');
git(ws, 'add', '.');
git(ws, 'commit', '-q', '-m', 'init');
appendFileSync(join(ws, '.git', 'info', 'exclude'), '/.gemini/skills/\n');

// Témoin : sans négation, Gemini CLI refuse de lire un fichier qu'exclut .git/info/exclude.
const temoin = join(ws, '.gemini', 'skills', 'temoin');
mkdirSync(join(temoin, 'modules', 'm'), { recursive: true });
writeFileSync(join(temoin, 'SKILL.md'), '---\nname: temoin\ndescription: témoin\n---\n');
writeFileSync(join(temoin, 'modules', 'm', 'SKILL.md'), '---\nname: m\ndescription: module\n---\n');
constat(new FileDiscoveryService(ws).shouldIgnoreFile(join(temoin, 'modules', 'm', 'SKILL.md')), 'témoin : sans négation, Gemini CLI refuse le module d\'un skill exclu par .git/info/exclude');
rmSync(join(ws, '.gemini'), { recursive: true, force: true });

installer(ws, '--tous');
installer(ws, 'analyse-projet', '--utilisateur');
constat(git(ws, 'status', '--porcelain', '--untracked-files=all').trim() === '', 'git status propre après installation');

const fds = new FileDiscoveryService(ws);
constat(fds.shouldIgnoreFile(join(ws, 'node_modules', 'lib', 'index.js')), 'node_modules reste ignoré par Gemini CLI : les négations ne débordent pas');
for (const [portee, dossier] of [
  ['workspace', join(ws, '.gemini', 'skills')],
  ['utilisateur', join(base, 'home', '.gemini', 'skills')],
]) {
  const skills = await loadSkillsFromDir(dossier);
  const dossiers = readdirSync(dossier).filter((n) => !n.startsWith('.'));
  constat(skills.length === dossiers.length, `${portee} : un skill découvert par dossier (${dossiers.length}), les modules ne sont pas pris pour des skills`);
  for (const s of skills.sort((a, b) => a.name.localeCompare(b.name))) {
    const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(readFileSync(s.location, 'utf8'))[1];
    const nom = /^name:\s*(\S+)/m.exec(frontmatter)[1];
    const description = /^description:\s*(.*)$/m.exec(frontmatter)[1];
    const refuses = portee === 'workspace' ? fichiers(join(dossier, s.name)).filter((f) => fds.shouldIgnoreFile(f)) : [];
    const lecture = refuses.length === 0 ? 'tous ses fichiers lisibles' : `fichiers refusés : ${refuses.map((f) => relative(ws, f)).join(', ')}`;
    constat(s.name === nom && s.description === description && refuses.length === 0, `${portee} : ${s.name}, nom et description lus tels quels, ${lecture}`);
  }
}
rmSync(base, { recursive: true, force: true });
console.log(ecarts === 0 ? '\nContrat tenu.' : `\n${ecarts} écart(s).`);
process.exitCode = ecarts === 0 ? 0 : 1;
