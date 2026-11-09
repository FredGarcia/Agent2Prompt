// Recette de bout en bout du lot 7, dans un seul workspace : l'arbre ABCDE-3620 se génère à l'identique de
// ses transmissions versionnées et s'installe dans le projet d'exemple résolu, dont l'historique Git est
// reconstruit ; les contrôles des consignes, lancés tels qu'ils y sont écrits avec les scripts du skill
// racine installé, passent sur sa résolution (documents de la clé, kits et historique, champ, vue) ; `liste`
// montre chaque nœud clos, le champ et la vue à jour ; le retrait archive les transmissions, qui se
// vérifient et se mesurent comme les versionnées, sans qu'aucun fichier suivi par Git n'ait changé. Le
// second arbre, ABCDE-3512, un seul ticket, se vérifie, se génère à l'identique, s'installe, se ratifie sous
// sa référence, et sa vue se génère ; en 1.0.1, la comparaison des invariants s'y lance telle que la consigne
// l'écrit. Ce que fait le modèle dans Gemini CLI s'essaie sur le poste (P4).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lireTexte } from '../outils/referentiel.mjs';
import { mesurer } from '../outils/mesurer-contexte.mjs';
import { generer, verifierTransmission } from '../outils/monteur.mjs';
import { PROJET, construireDepot } from './depot-resolution.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const OUTILS = join(ICI, '..', 'outils');
const EXEMPLES = join(ICI, '..', 'exemples');
const VERSIONNEES = (cle) => join(EXEMPLES, `${cle}-skills`, 'transmissions');
const REGENERER = (cle) => `node specs/generateur-skill-ticket/outils/generer.mjs generer specs/generateur-skill-ticket/exemples/${cle} --sortie specs/generateur-skill-ticket/exemples/${cle}-skills`;

// Chemin réel : sous Windows, le dossier temporaire peut s'écrire en noms courts.
const temporaire = (prefixe) => realpathSync.native(mkdtempSync(join(tmpdir(), prefixe)));
const node = (args, cwd) => spawnSync(process.execPath, args, { encoding: 'utf8', cwd, env: { ...process.env, SKILL_TICKET_GEMINI: '' } });
const installateur = (args, cwd) => node([join(OUTILS, 'installer-arbre.mjs'), ...args], cwd);
const git = (ws, ...args) => spawnSync('git', ['-C', ws, '-c', 'core.autocrlf=false', ...args], { encoding: 'utf8' }).stdout;
const suivisModifies = (ws) => git(ws, 'status', '--porcelain', '--untracked-files=no');

/** États des nœuds, ligne du champ et ligne de la vue, d'après la liste de l'installateur. */
function lister(ws) {
  const r = installateur(['liste', '--workspace', ws]);
  assert.equal(r.status, 0, r.stderr);
  const lignes = r.stdout.trim().split('\n');
  return {
    etats: Object.fromEntries(lignes.filter((l) => l.startsWith('  ')).map((l) => /^ {2}(\S+)\s+(?:racine et feuille|\S+)\s+\S+\s+(.+)$/.exec(l)).map((m) => [m[1], m[2]])),
    champ: lignes.find((l) => l.startsWith('Champ : ')) ?? null,
    vue: lignes.find((l) => l.startsWith('Vue : ')) ?? null,
  };
}

/** Texte des consignes installées d'un skill : ses fichiers Markdown, ceux de ses modules et de ses agents. */
function consignes(ws, nom) {
  const textes = [];
  const parcourir = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) parcourir(join(d, e.name));
      else if (e.name.endsWith('.md')) textes.push(readFileSync(join(d, e.name), 'utf8'));
    }
  };
  parcourir(join(ws, '.gemini', 'skills', nom));
  for (const f of readdirSync(join(ws, '.gemini', 'agents')).filter((x) => x.startsWith(`${nom}-`))) textes.push(readFileSync(join(ws, '.gemini', 'agents', f), 'utf8'));
  return textes.join('\n');
}

/**
 * Lance, depuis la racine du projet, une commande telle qu'une consigne installée l'écrit ; les valeurs entre
 * chevrons qu'elle laisse au modèle sont données par `valeurs`.
 */
function commandeDesConsignes(ws, texte, commande, valeurs = {}) {
  assert.ok(texte.includes(commande), `commande absente des consignes installées : ${commande}`);
  let ligne = commande;
  for (const [cle, valeur] of Object.entries(valeurs)) ligne = ligne.replace(cle, valeur);
  assert.doesNotMatch(ligne, /<[^>]+>/, `valeur laissée au modèle : ${ligne}`);
  const [programme, ...args] = [...ligne.matchAll(/"([^"]*)"|(\S+)/g)].map((m) => m[1] ?? m[2]);
  assert.equal(programme, 'node');
  return node(args, ws);
}

// ---- ABCDE-3620 : générer, installer, contrôler la résolution, lister, retirer ----

const ESPACE = (() => {
  const base = temporaire('bout-');
  const projet = join(base, 'projet');
  cpSync(PROJET, projet, { recursive: true });
  construireDepot(projet);
  return { base, projet, skills: join(base, 'skills'), dossier: join(projet, 'docs', 'demandes', 'ABCDE-3620') };
})();

test('bout en bout : ABCDE-3620 se génère à l\'identique de ses transmissions versionnées et s\'installe dans le projet résolu', () => {
  const { projet, skills } = ESPACE;
  const g = node([join(OUTILS, 'generer.mjs'), 'generer', join(EXEMPLES, 'ABCDE-3620'), '--sortie', skills], ESPACE.base);
  assert.equal(g.status, 0, g.stderr);
  const produites = join(skills, 'transmissions');
  assert.deepStrictEqual(readdirSync(produites).sort(), readdirSync(VERSIONNEES('ABCDE-3620')).sort());
  for (const f of readdirSync(produites)) assert.ok(readFileSync(join(produites, f), 'utf8') === lireTexte(join(VERSIONNEES('ABCDE-3620'), f)), `${f} : régénérer : ${REGENERER('ABCDE-3620')}`);
  const r = installateur(['installer', produites, '--workspace', projet]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /arbre ABCDE-3620 installé : 5 skills, 9 agents, 5 commandes/);
  assert.equal(suivisModifies(projet), '', 'l\'installation ne touche à aucun fichier suivi');
  assert.doesNotMatch(git(projet, 'status', '--porcelain'), /\.gemini/, 'l\'arbre installé est masqué à Git');
  const v = installateur(['verifier', 'ABCDE-3620', '--workspace', projet]);
  assert.equal(v.status, 0, `${v.stdout}${v.stderr}`);
});

test('bout en bout : les contrôles des consignes passent sur la résolution, avec les scripts du skill racine installé', () => {
  const { projet } = ESPACE;
  const texte = consignes(projet, 'ticket-abcde-3620');
  const controles = [
    ['node .gemini/skills/ticket-abcde-3620/outils/verifier-documents.mjs docs/demandes/ABCDE-3620 --rattachement .gemini/skills/ticket-abcde-3620/outils/rattachement.json', /ABCDE-3620/],
    ['node .gemini/skills/ticket-abcde-3620/outils/verifier-kits.mjs docs/demandes/ABCDE-3620 --rattachement .gemini/skills/ticket-abcde-3620/outils/rattachement.json --depot', /commits et branche vérifiés dans le dépôt/],
    ['node .gemini/skills/ticket-abcde-3620/outils/champ.mjs verifier docs/demandes/ABCDE-3620', /chaîne et tête intactes/],
    ['node .gemini/skills/ticket-abcde-3620/outils/vue.mjs verifier docs/demandes/ABCDE-3620', /vue de ABCDE-3620 à jour/],
  ];
  for (const [commande, attendu] of controles) {
    const r = commandeDesConsignes(projet, texte, commande);
    assert.equal(r.status, 0, `${commande}\n${r.stdout}${r.stderr}`);
    assert.match(r.stdout, attendu, commande);
  }
  // Chaque feuille lit sa vue par la commande de sa consigne : tous ses critères y sont prouvés.
  for (const [nom, noeud] of [['ticket-abcde-3620-1-1', 'ABCDE-3620-1.1'], ['ticket-abcde-3620-1-2', 'ABCDE-3620-1.2'], ['ticket-abcde-3620-2', 'ABCDE-3620-2']]) {
    const r = commandeDesConsignes(projet, consignes(projet, nom), `node .gemini/skills/ticket-abcde-3620/outils/vue.mjs generer docs/demandes/ABCDE-3620 --noeud ${noeud}`);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, new RegExp(`^# Vue augmentée de ${noeud.replace(/\./g, '\\.')}, dans l'arbre ABCDE-3620\\n`));
    assert.match(r.stdout, /## À traiter\n\nRien à traiter\./, noeud);
  }
});

test('bout en bout : liste montre chaque nœud clos, le champ et la vue à jour', () => {
  const l = lister(ESPACE.projet);
  assert.deepStrictEqual(l.etats, Object.fromEntries(['ABCDE-3620', 'ABCDE-3620-1', 'ABCDE-3620-1.1', 'ABCDE-3620-1.2', 'ABCDE-3620-2'].map((n) => [n, 'clos'])));
  assert.equal(l.champ, 'Champ : 12 enregistrements ; critères : 18 prouvés, 0 en écart, 0 menacé ; 0 désaccord ; 0 observation attendue');
  assert.equal(l.vue, 'Vue : docs/demandes/ABCDE-3620/vue.html, à jour, tirée du champ au n° 12');
});

test('bout en bout : le retrait archive les transmissions, qui se vérifient et se mesurent comme les versionnées', () => {
  const { projet, dossier } = ESPACE;
  const r = installateur(['retirer', 'ABCDE-3620', '--workspace', projet]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /5 transmissions archivées dans docs\/demandes\/ABCDE-3620\/skills\//);
  const archive = join(dossier, 'skills');
  assert.deepStrictEqual(readdirSync(archive).sort(), readdirSync(VERSIONNEES('ABCDE-3620')).sort());
  for (const f of readdirSync(archive)) assert.ok(readFileSync(join(archive, f), 'utf8') === lireTexte(join(VERSIONNEES('ABCDE-3620'), f)), f);
  const v = node([join(OUTILS, 'generer.mjs'), 'verifier', archive], projet);
  assert.equal(v.status, 0, `${v.stdout}${v.stderr}`);
  assert.deepStrictEqual(mesurer([archive], { projet }), mesurer([VERSIONNEES('ABCDE-3620')], { projet: PROJET }), 'les transmissions archivées ne se mesurent pas comme les versionnées');
  for (const d of ['agents', 'commands', 'skill-ticket']) assert.equal(existsSync(join(projet, '.gemini', d)), false, d);
  assert.deepStrictEqual(readdirSync(join(projet, '.gemini', 'skills')), []);
  assert.equal(suivisModifies(projet), '', 'aucun fichier suivi n\'a changé, de l\'installation au retrait');
});

// ---- ABCDE-3512 : le second arbre, un seul ticket ----

test('second arbre : ABCDE-3512, un seul ticket, se vérifie, se génère à l\'identique, s\'installe, se ratifie sous sa référence, et sa vue se génère', () => {
  const arbre = join(EXEMPLES, 'ABCDE-3512');
  const v = node([join(OUTILS, 'arbre.mjs'), 'verifier', arbre]);
  assert.equal(v.status, 0, v.stderr);
  assert.match(v.stdout, /^Arbre ABCDE-3512 conforme : 1 ticket, profondeur 0 \(plafond 3\)/);
  assert.match(node([join(OUTILS, 'arbre.mjs'), 'plan', arbre]).stdout, /\nRatification : le skill ABCDE-3512, ticket sans sous-ticket, avant sa première action\.\n/);
  const sortie = join(temporaire('bout-3512-'), 'skills');
  const { erreurs, skills } = generer({ arbre, sortie });
  assert.deepStrictEqual(erreurs, []);
  assert.deepStrictEqual(skills.map((s) => s.nom), ['ticket-abcde-3512']);
  assert.deepStrictEqual(readdirSync(VERSIONNEES('ABCDE-3512')), ['ticket-abcde-3512-1.0.0.md']);
  assert.ok(skills[0].texte === lireTexte(join(VERSIONNEES('ABCDE-3512'), 'ticket-abcde-3512-1.0.0.md')), `transmission différente de la versionnée ; si le changement est voulu, régénérer : ${REGENERER('ABCDE-3512')}`);
  assert.deepStrictEqual(verifierTransmission(skills[0].texte).erreurs, []);

  const ws = temporaire('ws-3512-');
  git(ws, 'init', '-q');
  const r = installateur(['installer', VERSIONNEES('ABCDE-3512'), '--workspace', ws]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /arbre ABCDE-3512 installé : 1 skill, 9 agents, 1 commande/);
  const etat = () => lister(ws).etats['ABCDE-3512'];
  assert.equal(etat(), 'documents à rédiger');
  const dossier = join(ws, 'docs', 'demandes', 'ABCDE-3512');
  mkdirSync(dossier, { recursive: true });
  writeFileSync(join(dossier, 'us.md'), '# ABCDE-3512 : US et critères d\'acceptation\n');
  assert.equal(etat(), 'prêt', 'sans sous-ticket, pas de ratification de l\'arbre : la seule est celle du ticket, après son analyse');
  const champ = (...args) => node([join('.gemini', 'skills', 'ticket-abcde-3512', 'outils', 'champ.mjs'), ...args], ws);
  const refus = champ('deposer', 'docs/demandes/ABCDE-3512', 'retour', '--noeud', 'ABCDE-3512', '--auteur', 'ticket-abcde-3512', '--nature', 'ratification', '--objet', 'arbre ABCDE-3512', '--decision', 'ratifié', '--par', 'Fred', '--contenu', 'ratifié');
  assert.equal(refus.status, 1);
  assert.match(refus.stderr, /ratification de « arbre ABCDE-3512 » par ABCDE-3512 ; attendu « ABCDE-3512 »/);
  writeFileSync(join(dossier, 'analyse.md'), 'analyse\n');
  assert.equal(etat(), 'analysé, à ratifier');
  const texte = consignes(ws, 'ticket-abcde-3512');
  const ratifier = commandeDesConsignes(ws, texte, 'node .gemini/skills/ticket-abcde-3512/outils/champ.mjs deposer docs/demandes/ABCDE-3512 retour --noeud ABCDE-3512 --auteur ticket-abcde-3512 --nature ratification --objet "ABCDE-3512" --decision ratifié --par "<nom>" --contenu "<sa réponse>"', { '<nom>': 'Fred', '<sa réponse>': 'ratifié' });
  assert.equal(ratifier.status, 0, ratifier.stderr);
  assert.equal(etat(), 'ratifié, en transformation');
  const g = commandeDesConsignes(ws, texte, 'node .gemini/skills/ticket-abcde-3512/outils/vue.mjs generer docs/demandes/ABCDE-3512');
  assert.equal(g.status, 0, g.stderr);
  assert.match(g.stdout, /vue de ABCDE-3512 : 7 ancres \(7 du ticket, 0 née du champ\), 0 à traiter ; champ au n° 1/);
  assert.equal(lister(ws).vue, 'Vue : docs/demandes/ABCDE-3512/vue.html, à jour, tirée du champ au n° 1');
  // La vue porte les six critères rédigés pour le prototype, avec leurs énoncés, et la ratification.
  const vue = readFileSync(join(dossier, 'vue.md'), 'utf8');
  for (let k = 1; k <= 6; k++) assert.match(vue, new RegExp(`### ABCDE-3512-CA0${k} · ABCDE-3512:C${k} — à prouver\\n\\n> \\S`), `C${k}`);
  assert.match(vue, /- ABCDE-3512 : ratifié \(n° 1, \d{4}-\d{2}-\d{2}, Fred\)/);
  assert.equal(suivisModifies(ws), '');
});

test('1.0.1 : dans le workspace d\'ABCDE-3512, la comparaison des invariants de la consigne dit la copie du projet absente, identique, puis différente', () => {
  const ws = temporaire('ws-3512-invariants-');
  git(ws, 'init', '-q');
  const r = installateur(['installer', VERSIONNEES('ABCDE-3512'), '--workspace', ws]);
  assert.equal(r.status, 0, r.stderr);
  const texte = consignes(ws, 'ticket-abcde-3512');
  const comparer = () => commandeDesConsignes(ws, texte, 'node .gemini/skills/ticket-abcde-3512/outils/invariants.mjs comparer ticket-abcde-3512');
  const absente = comparer();
  assert.equal(absente.status, 1);
  assert.match(absente.stderr, /^copie du projet absente : docs\/c7e\/meso-contrats\.md ; signale-le au développeur, et lis à sa place \.gemini[\\/]skills[\\/]ticket-abcde-3512[\\/]projet[\\/]meso-contrats\.md, l'état sur lequel ticket-abcde-3512 a été produit\n$/);
  // Le développeur installe le modèle de l'orchestrateur, dans l'état sur lequel le skill a été produit.
  mkdirSync(join(ws, 'docs', 'c7e'), { recursive: true });
  const modele = readFileSync(join(ws, '.gemini', 'skills', 'ticket-abcde-3512', 'projet', 'meso-contrats.md'), 'utf8');
  writeFileSync(join(ws, 'docs', 'c7e', 'meso-contrats.md'), modele);
  const identique = comparer();
  assert.equal(identique.status, 0, identique.stderr);
  assert.match(identique.stdout, /^invariants du projet identiques à ceux sur lesquels ticket-abcde-3512 a été produit \(sha256 [0-9a-f]{12}\) : lis docs\/c7e\/meso-contrats\.md, qui fait foi\nvaleurs ADAPTER restées dans docs\/c7e\/meso-contrats\.md, à signaler, jamais devinées : /);
  // Puis il y ajoute un invariant transverse propre au projet.
  writeFileSync(join(ws, 'docs', 'c7e', 'meso-contrats.md'), modele.replace(/\n## 6\. /, '\n- Toute table porte une clé technique.\n\n## 6. '));
  const differente = comparer();
  assert.equal(differente.status, 1);
  assert.match(differente.stderr, /^invariants du projet différents de ceux sur lesquels ticket-abcde-3512 a été produit : docs\/c7e\/meso-contrats\.md fait foi ; 1 section diffère, à dire au développeur avant tout le reste\n {2}§ 5\. Invariants transverses[^\n]* : modifiée\n {4}\+ - Toute table porte une clé technique\.\n/);
  assert.equal(suivisModifies(ws), '');
});
