// Repères de explication-hote-ia confrontés au Gemini CLI réel, sans qu'aucun appel ne sorte du poste.
// Lancé par .github/workflows/recette-explication-hote-ia.yml, sous Linux, à côté du paquet
// @google/gemini-cli à la version épinglée : node reperes-hote.mjs <racine du dépôt> <dossier du paquet>.
//
// Gemini CLI tourne dans un accueil isolé (GEMINI_CLI_HOME), avec une clé factice, contre une fausse API
// locale (127.0.0.1, port libre) qui enregistre chaque requête et répond « clé invalide ». On observe ainsi
// exactement ce que l'hôte envoie au modèle, son prompt système exporté et sa transcription, puis on
// vérifie les repères du module modele-hote et le script du skill sur ces mêmes traces (D9.INV-1).
// Toute autre sortie de l'hôte passe par un proxy témoin local, qui note l'hôte visé et refuse la
// connexion : rien ne quitte le poste, et ce que l'hôte cherche à joindre devient un constat (H1).
import { execFileSync, spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [depot, paquet] = process.argv.slice(2);
const gemini = join(paquet, 'bundle', 'gemini.js');
const version = JSON.parse(readFileSync(join(paquet, 'package.json'), 'utf8')).version;
const base = mkdtempSync(join(tmpdir(), 'reperes-'));
const accueil = join(base, 'accueil');
const projet = join(base, 'projet');
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
let ecarts = 0;
function constat(ok, message) {
  console.log(`${ok ? 'ok   ' : 'ÉCART'}  ${message}`);
  if (!ok) ecarts++;
}

// Fausse API locale : chaque requête est gardée, la réponse est toujours « clé invalide ».
const requetes = [];
const serveur = createServer((req, res) => {
  let corps = '';
  req.on('data', (d) => { corps += d; });
  req.on('end', () => {
    let json = null;
    try { json = JSON.parse(corps); } catch { /* corps non JSON : gardé tel quel */ }
    requetes.push({ url: req.url, json });
    res.writeHead(400, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: { code: 400, message: 'API key not valid.', status: 'INVALID_ARGUMENT' } }));
  });
});
await new Promise((r) => serveur.listen(0, '127.0.0.1', r));
const port = serveur.address().port;

// Proxy témoin : chaque demande de sortie est notée (hôte et port), puis refusée ; aucune n'est relayée.
const sorties = [];
const temoin = createServer((req, res) => {
  sorties.push(req.url);
  res.writeHead(502);
  res.end();
});
temoin.on('connect', (req, socket) => {
  sorties.push(req.url);
  socket.end('HTTP/1.1 502 Bad Gateway\r\n\r\n');
});
await new Promise((r) => temoin.listen(0, '127.0.0.1', r));
const proxy = `http://127.0.0.1:${temoin.address().port}`;
const vers = (liste, hote) => liste.some((s) => s === `${hote}:443` || s.startsWith(`https://${hote}`) || s.startsWith(`http://${hote}`));

// Accueil isolé : authentification par clé, mémoire globale témoin, sous-agent et commandes du skill.
// Les réglages de retrait coupent les statistiques d'usage et la recherche de mise à jour.
const reglages = (retrait) => JSON.stringify({
  security: { auth: { selectedType: 'gemini-api-key' } },
  ...(retrait ? { privacy: { usageStatisticsEnabled: false }, general: { enableAutoUpdate: false, enableAutoUpdateNotification: false } } : {}),
});
mkdirSync(join(accueil, '.gemini'), { recursive: true });
writeFileSync(join(accueil, '.gemini', 'settings.json'), reglages(false));
writeFileSync(join(accueil, '.gemini', 'GEMINI.md'), 'Repère : mémoire globale témoin.\n');
mkdirSync(projet, { recursive: true });
writeFileSync(join(projet, 'GEMINI.md'), 'Repère : consigne du projet témoin.\n');
const envGit = { ...process.env, GIT_CONFIG_GLOBAL: join(base, 'gitconfig'), GIT_CONFIG_NOSYSTEM: '1' };
execFileSync('git', ['init', '-q'], { cwd: projet, env: envGit });
execFileSync(process.execPath, [join(depot, 'tools', 'installer.mjs'), 'explication-hote-ia', '--visible'], { cwd: projet, env: { ...envGit, GEMINI_CLI_HOME: accueil }, stdio: 'ignore' });
const skill = join(projet, '.gemini', 'skills', 'explication-hote-ia');
constat(existsSync(join(skill, 'SKILL.md')), 'skill installé par tools/installer.mjs dans .gemini/skills/');
// Extraction des fichiers exécutables, comme à l'étape 2 de la consigne.
const execution = readFileSync(join(skill, 'modules', 'execution', 'SKILL.md'), 'utf8');
const extraction = /\x60{3}text\n(node -e .+)\n\x60{3}/.exec(execution.split('## 8. Matérialiser les fichiers exécutables')[1] ?? '')?.[1];
execFileSync('bash', ['-c', extraction], { cwd: skill, stdio: 'ignore' });
constat(existsSync(join(skill, 'scripts', 'instantane-hote.mjs')), 'six fichiers extraits par la commande du module execution, § 8');
mkdirSync(join(accueil, '.gemini', 'agents'), { recursive: true });
writeFileSync(join(accueil, '.gemini', 'agents', 'explicateur-hote.md'), readFileSync(join(skill, 'agent', 'explicateur-hote.md'), 'utf8').replaceAll('<DOSSIER_DU_SKILL>', skill));
cpSync(join(skill, 'commandes', 'hote'), join(accueil, '.gemini', 'commands', 'hote'), { recursive: true });

// L'hôte se met en mode non interactif quand CI ou GITHUB_ACTIONS vaut true (H17) : ces variables, que
// l'intégration continue pose, sont retirées de son environnement, pour observer le poste d'un développeur.
const { CI: _ci, GITHUB_ACTIONS: _gha, ...envPoste } = process.env;
const env = {
  ...envPoste,
  GEMINI_CLI_HOME: accueil,
  GEMINI_API_KEY: 'cle-factice-reperes',
  GOOGLE_GEMINI_BASE_URL: `http://127.0.0.1:${port}`,
  GEMINI_CLI_TRUST_WORKSPACE: 'true',
  NO_COLOR: '1',
  HTTPS_PROXY: proxy,
  HTTP_PROXY: proxy,
  https_proxy: proxy,
  http_proxy: proxy,
  NO_PROXY: '127.0.0.1,localhost',
  no_proxy: '127.0.0.1,localhost',
};
const avecExport = (exportation) => (exportation ? { GEMINI_WRITE_SYSTEM_MD: exportation } : {});

/** Session non interactive : attend la fin du processus (la fausse API refuse la clé). */
async function nonInteractive(prompt, exportation) {
  const debut = requetes.length;
  const sortiesAvant = sorties.length;
  const enfant = spawn(process.execPath, [gemini, '-p', prompt], { cwd: projet, env: { ...env, ...avecExport(exportation) }, stdio: 'ignore' });
  await new Promise((r) => { enfant.on('exit', r); setTimeout(() => { enfant.kill(); r(); }, 90000); });
  await attendre(500);
  return { requetes: requetes.slice(debut), sorties: sorties.slice(sortiesAvant) };
}

/**
 * Session interactive, sous un terminal (script), jusqu'à la première requête principale ; avec
 * `attendreSortie`, jusqu'à ce que le proxy témoin ait vu une demande vers cet hôte (10 secondes au plus).
 */
async function interactive(exportation, attendreSortie) {
  const debut = requetes.length;
  const sortiesAvant = sorties.length;
  const enfant = spawn('script', ['-qfc', `"${process.execPath}" "${gemini}"`, '/dev/null'], { cwd: projet, env: { ...env, ...avecExport(exportation), TERM: 'xterm-256color' }, stdio: ['pipe', 'pipe', 'ignore'], detached: true });
  let ecran = '';
  enfant.stdout.on('data', (d) => { ecran += d; });
  for (let i = 0; i < 240 && !/Type your message/.test(ecran); i++) await attendre(250);
  await attendre(1500);
  const exporteAvantSaisie = exportation ? existsSync(exportation) : false;
  enfant.stdin.write('bonjour');
  await attendre(500);
  enfant.stdin.write('\r');
  for (let i = 0; i < 240 && !requetes.slice(debut).some((q) => q.json?.tools); i++) await attendre(250);
  if (attendreSortie) for (let i = 0; i < 40 && !vers(sorties.slice(sortiesAvant), attendreSortie); i++) await attendre(250);
  else await attendre(1000);
  try { process.kill(-enfant.pid, 'SIGKILL'); } catch { enfant.kill('SIGKILL'); }
  return { requetes: requetes.slice(debut), sorties: sorties.slice(sortiesAvant), exporteAvantSaisie };
}

/**
 * Sous un terminal, sans prompt : l'interface interactive s'ouvre-t-elle (bandeau d'accueil), ou l'hôte
 * s'arrête-t-il en mode non interactif, faute d'entrée ? (variables d'environnement en plus)
 */
async function lancementSousTerminal(envEnPlus, delai) {
  const enfant = spawn('script', ['-qfc', `"${process.execPath}" "${gemini}"`, '/dev/null'], { cwd: projet, env: { ...env, ...envEnPlus, TERM: 'xterm-256color' }, stdio: ['pipe', 'pipe', 'ignore'], detached: true });
  let ecran = '';
  enfant.stdout.on('data', (d) => { ecran += d; });
  const vu = () => /Tips for getting started|Type your message/.test(ecran) || /No input provided via stdin/.test(ecran);
  for (let i = 0; i < delai / 250 && !vu(); i++) await attendre(250);
  try { process.kill(-enfant.pid, 'SIGKILL'); } catch { enfant.kill('SIGKILL'); }
  return { interface: /Tips for getting started|Type your message/.test(ecran), sansEntree: /No input provided via stdin/.test(ecran) };
}

const principale = (liste) => liste.find((q) => q.json?.tools);
const outils = (q) => (q?.json?.tools ?? []).flatMap((t) => (t.functionDeclarations ?? []).map((f) => f.name));
const texteSysteme = (q) => (q?.json?.systemInstruction?.parts ?? []).map((p) => p.text ?? '').join('');
const parties = (q) => (q?.json?.contents ?? []).flatMap((c) => c.parts ?? []).map((p) => p.text ?? '');
const modele = (q) => /\/models\/([^:]+):/.exec(q?.url ?? '')?.[1];

// Session A : commande personnalisée, non interactive, réglages par défaut.
const a = await nonInteractive('/hote:carte precision-temoin', join(base, 'systeme-a.md'));
const pa = principale(a.requetes);
constat(pa !== undefined, `Gemini CLI ${version} : requête principale capturée sur la fausse API locale`);
constat(parties(pa).some((t) => t.includes('applique son mode « carte »') && t.includes('precision-temoin')), 'H13 : la commande /hote:carte est développée par l\'hôte, {{args}} compris, avant l\'envoi');
const nonInter = outils(pa);
constat(['read_file', 'glob', 'grep_search', 'list_directory', 'invoke_agent'].every((o) => nonInter.includes(o)), `H17 : outils de lecture et invoke_agent déclarés en mode non interactif (${nonInter.join(', ')})`);
constat(!nonInter.includes('activate_skill') && !nonInter.includes('run_shell_command') && !nonInter.includes('write_file'), 'H17 : en mode non interactif, activate_skill, run_shell_command et write_file ne sont pas déclarés');
const utilitaires = a.requetes.filter((q) => !q.json?.tools);
constat(utilitaires.some((q) => modele(q) !== modele(pa)), `H15 : un appel interne précède la requête principale, sur un autre modèle (${utilitaires.map(modele).join(', ')} puis ${modele(pa)})`);
constat(vers(a.sorties, 'play.googleapis.com'), `H1 : par défaut, l'hôte cherche à envoyer ses statistiques d'usage à play.googleapis.com, même en mode non interactif ; demande refusée par le proxy témoin (${a.sorties.join(', ') || 'aucune demande'})`);

// Session B : réglages de retrait, mémoire privée du projet ajoutée, puis prompt simple, non interactif.
writeFileSync(join(accueil, '.gemini', 'settings.json'), reglages(true));
const registre = JSON.parse(readFileSync(join(accueil, '.gemini', 'projects.json'), 'utf8')).projects;
const identifiant = Object.values(registre)[0];
mkdirSync(join(accueil, '.gemini', 'tmp', identifiant, 'memory'), { recursive: true });
writeFileSync(join(accueil, '.gemini', 'tmp', identifiant, 'memory', 'MEMORY.md'), 'Repère : mémoire privée du projet.\n');
const b = await nonInteractive('bonjour', join(base, 'systeme-b.md'));
const pb = principale(b.requetes);
const exporte = readFileSync(join(base, 'systeme-b.md'), 'utf8');
constat(texteSysteme(pb).trim() === exporte.trim(), 'H4 : le prompt exporté par GEMINI_WRITE_SYSTEM_MD est exactement les instructions système envoyées');
constat(/^# Available Agent Skills$/m.test(exporte) && exporte.includes('<name>explication-hote-ia</name>') && exporte.includes(`<location>${join(skill, 'SKILL.md')}</location>`), 'H11 : le skill figure dans <available_skills>, par son nom et l\'emplacement de son SKILL.md');
constat(/^# Available Sub-Agents$/m.test(exporte) && exporte.includes('invoke_agent') && /explicateur-hote/.test(exporte.split('# Available Sub-Agents')[1] ?? ''), 'H12 : le sous-agent explicateur-hote figure parmi les sous-agents, appelés par invoke_agent');
constat(exporte.includes('<global_context>') && exporte.includes('Repère : mémoire globale témoin.'), 'H3 : mémoire globale dans les instructions système, balise <global_context>');
constat(exporte.includes('<user_project_memory>') && exporte.includes('Repère : mémoire privée du projet.'), 'H3 : index privé du projet (MEMORY.md) dans les instructions système, balise <user_project_memory>');
constat(!exporte.includes('Repère : consigne du projet témoin.'), 'H3 : le GEMINI.md du projet n\'est pas dans les instructions système');
const ouverture = parties(pb)[0] ?? '';
constat(ouverture.includes('<session_context>') && ouverture.includes('<project_context>') && ouverture.includes(`--- Context from: ${join(projet, 'GEMINI.md')} ---`), 'H3 : le premier message porte <session_context> et le GEMINI.md du projet dans <project_context>');
constat(ouverture.includes('- **Workspace Directories:**') && ouverture.includes('- **Directory Structure:**'), 'H3 : le premier message porte les dossiers du workspace et l\'arborescence');

// Le script du skill sur la session B, avant toute autre session : au démarrage suivant, le nettoyage des
// sessions de l'hôte (general.sessionRetention, actif par défaut) supprime une session dont aucun tour n'a
// abouti, ce qui est toujours le cas contre la fausse API.
const script = join(skill, 'scripts', 'instantane-hote.mjs');
const lancer = (...args) => JSON.parse(execFileSync(process.execPath, [script, ...args], { cwd: projet, env: { ...env, GEMINI_CLI: '1' }, encoding: 'utf8' }));
const ctx = lancer('contexte', '--paquet', paquet, '--prompt-systeme', join(base, 'systeme-b.md')).contexte;
constat(ctx.trace_de_session?.fichiers_de_contexte_charges?.includes(join(projet, 'GEMINI.md')) === true, 'script : la trace de la session B nomme le GEMINI.md du projet');
constat(ctx.prompt_systeme?.skills?.some((s) => s.nom === 'explication-hote-ia') === true && ctx.prompt_systeme.sous_agents.includes('explicateur-hote'), 'script : l\'analyse du prompt exporté retrouve le skill et le sous-agent');
constat(ctx.memoire_privee_du_projet?.index?.present === true, 'script : la mémoire privée du projet est localisée par projects.json');
const sessionB = ctx.trace_de_session?.fichier;
const cfg = lancer('config', '--paquet', paquet).config;
constat(cfg.effectifs?.['privacy.usageStatisticsEnabled']?.valeur === false && cfg.effectifs?.['general.enableAutoUpdate']?.valeur === false && cfg.effectifs?.['general.enableAutoUpdateNotification']?.valeur === false, 'script : les réglages de retrait sont observés, avec leur couche');

// Session C : interactive, sous un terminal, réglages de retrait.
const c = await interactive(join(base, 'systeme-c.md'));
constat(c.exporteAvantSaisie, 'contexte, § 6 : en mode interactif, le prompt est exporté au démarrage, avant toute saisie');
constat(typeof sessionB === 'string' && !existsSync(sessionB), 'H14 : au lancement suivant, la session B, sans tour abouti, est supprimée par le nettoyage des sessions, malgré son âge de quelques secondes');
const inter = outils(principale(c.requetes));
constat(['activate_skill', 'run_shell_command', 'write_file', 'replace', 'ask_user', 'invoke_agent'].every((o) => inter.includes(o)), `H6 : en mode interactif, les outils soumis à confirmation sont déclarés (${inter.join(', ')})`);
constat(b.sorties.length === 0 && c.sorties.length === 0, `H1 : avec privacy.usageStatisticsEnabled, general.enableAutoUpdate et general.enableAutoUpdateNotification à false, aucune demande de sortie, en mode non interactif comme interactif (${[...b.sorties, ...c.sorties].join(', ') || 'aucune'})`);

// Session D : interactive, réglages par défaut, jusqu'à la recherche de mise à jour.
writeFileSync(join(accueil, '.gemini', 'settings.json'), reglages(false));
const d = await interactive(null, 'registry.npmjs.org');
constat(vers(d.sorties, 'registry.npmjs.org'), `H1 : par défaut, en mode interactif, l'hôte cherche une mise à jour sur registry.npmjs.org ; demande refusée par le proxy témoin (${d.sorties.join(', ') || 'aucune demande'})`);

// Session E : sous un terminal, avec CI=true : l'interface interactive ne s'ouvre pas (mode non interactif).
writeFileSync(join(accueil, '.gemini', 'settings.json'), reglages(true));
const sansCi = await lancementSousTerminal({}, 30000);
const avecCi = await lancementSousTerminal({ CI: 'true' }, 30000);
const etat = (l) => (l.interface ? 'interface ouverte' : l.sansEntree ? 'arrêt faute d\'entrée' : 'rien de reconnu');
constat(sansCi.interface && !avecCi.interface && avecCi.sansEntree, `H17 : sous un terminal, CI=true met l'hôte en mode non interactif : au lieu d'ouvrir son interface, il s'arrête faute d'entrée (sans CI : ${etat(sansCi)} ; avec CI=true : ${etat(avecCi)})`);

// Le script du skill, sur le paquet et l'installation.
const hote = lancer('hote', '--paquet', paquet).hote;
constat(hote.paquet?.version === version && hote.paquet.documentation.fichiers > 0 && hote.paquet.skills_integres.includes('skill-creator'), `script : paquet ${version}, sa documentation (${hote.paquet?.documentation.fichiers} documents) et ses skills intégrés`);
const doc = lancer('doc', '--paquet', paquet).doc.fichiers;
const cites = ['cli/gemini-md.md', 'cli/skills.md', 'core/subagents.md', 'reference/tools.md', 'reference/policy-engine.md', 'reference/configuration.md', 'cli/system-prompt.md', 'cli/trusted-folders.md', 'cli/custom-commands.md', 'extensions/reference.md', 'hooks/reference.md', 'tools/mcp-server.md', 'tools/memory.md', 'tools/shell.md', 'cli/model.md', 'cli/model-routing.md', 'cli/headless.md', 'cli/sandbox.md', 'cli/auto-memory.md', 'cli/session-management.md', 'cli/checkpointing.md', 'reference/memport.md', 'reference/commands.md', 'cli/token-caching.md', 'resources/tos-privacy.md', 'cli/enterprise.md'];
const absents = cites.filter((x) => !doc.includes(x));
constat(absents.length === 0, `script : les documents cités par les modules sont dans la documentation embarquée${absents.length ? ` (absents : ${absents.join(', ')})` : ''}`);
const comp = lancer('composants', '--paquet', paquet).composants;
constat(comp.commandes.some((x) => x.commande === '/hote:carte') && comp.sous_agents.some((x) => x.nom === 'explicateur-hote' && x.ecarts.length === 0), 'script : commandes /hote:* et sous-agent explicateur-hote vus, sans écart d\'en-tête');

const hotesVises = [...new Set(sorties.map((s) => s.replace(/^https?:\/\//, '').split(/[/:]/)[0]))].sort();
console.log(`\nDemandes de sortie notées par le proxy témoin, toutes refusées : ${sorties.length} (${hotesVises.join(', ') || 'aucune'}).`);
serveur.close();
temoin.close();
rmSync(base, { recursive: true, force: true });
console.log(ecarts === 0 ? `Repères tenus sur Gemini CLI ${version}.` : `${ecarts} écart(s) sur Gemini CLI ${version}.`);
process.exitCode = ecarts === 0 ? 0 : 1;
