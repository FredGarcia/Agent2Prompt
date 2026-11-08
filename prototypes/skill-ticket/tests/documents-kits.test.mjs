// Recette du lot 4 : les documents de la clé Jira passent le script d'agent-tdd-jira et le contrôle du
// rattachement de l'arbre (critère P8) ; les kits dev, test et démo sont complets et vérifiables, et la
// remise suit le format fermé agent2test.remise/1 (P9). Les contrôles se font avec les copies que livre le
// skill racine, sur le projet d'exemple résolu, puis sur des altérations de ce projet ; l'historique Git du
// kit dev se reconstruit à l'identique dans un dépôt temporaire.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { relire } from '../../../tools/bundle.mjs';
import { lireTexte } from '../outils/referentiel.mjs';
import { controlerDocuments } from '../outils/verifier-documents.mjs';
import { controlerKits, motifNonJouable } from '../outils/verifier-kits.mjs';
import { HISTORIQUE, PROJET, construireDepot } from './depot-resolution.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = join(ICI, '..', 'exemples', 'ABCDE-3620-skills', 'transmissions', 'ticket-abcde-3620-1.0.0.md');
const CLE = 'ABCDE-3620';
const DOSSIER = ['docs', 'demandes', CLE];

const temporaire = (prefixe) => mkdtempSync(join(tmpdir(), prefixe));
const attendreEcart = (ecarts, motif) => assert.ok(ecarts.some((e) => motif.test(e)), `écart attendu ${motif} ; reçus :\n${ecarts.join('\n') || '(aucun)'}`);

// Les outils du skill racine, tels que sa transmission les livre.
const BOITE = (() => {
  const dossier = temporaire('boite-');
  for (const f of relire(lireTexte(RACINE)).fichiers.filter((x) => x.rel.startsWith('outils/'))) {
    mkdirSync(join(dossier, dirname(f.rel)), { recursive: true });
    writeFileSync(join(dossier, ...f.rel.split('/')), f.contenu);
  }
  return join(dossier, 'outils');
})();
const RATTACHEMENT = JSON.parse(readFileSync(join(BOITE, 'rattachement.json'), 'utf8'));
const CONTROLEUR = join(BOITE, 'controler-criteres.mjs');
const outil = (nom, ...args) => spawnSync(process.execPath, [join(BOITE, nom), ...args], { encoding: 'utf8' });

/** Copie du projet d'exemple, éventuellement retouchée : `retoucher(chemin absolu d'un fichier du projet)`. */
function copie(retouches = {}) {
  const projet = join(temporaire('projet-'), 'projet');
  cpSync(PROJET, projet, { recursive: true });
  for (const [rel, modifier] of Object.entries(retouches)) {
    const chemin = join(projet, ...rel.split('/'));
    const avant = readFileSync(chemin, 'utf8');
    const apres = modifier(avant);
    assert.notEqual(apres, avant, `${rel} : retouche sans effet`);
    writeFileSync(chemin, apres);
  }
  return { projet, dossier: join(projet, ...DOSSIER) };
}
const json = (modifier) => (texte) => {
  const objet = JSON.parse(texte);
  modifier(objet);
  return `${JSON.stringify(objet, null, 2)}\n`;
};
const rattachementAvec = (modifier) => {
  const r = structuredClone(RATTACHEMENT);
  modifier(r);
  return r;
};
const kit = (nom) => `docs/demandes/${CLE}/kits/${nom}.json`;

// ---- P8 : documents de la clé ----

test('P8 : les documents de l\'exemple passent controler-criteres et verifier-documents, livrés par le skill racine', () => {
  const dossier = join(PROJET, ...DOSSIER);
  const c = outil('controler-criteres.mjs', dossier);
  assert.equal(c.status, 0, c.stdout);
  assert.match(c.stdout, /ABCDE-3620 : 1 US, 5 critères \(5 validés, 0 en attente, 0 à valider, 0 retirés\), 7 scénarios, 6 exigences/);
  assert.match(c.stdout, /\naucun écart\n/);
  const d = outil('verifier-documents.mjs', dossier, '--rattachement', join(BOITE, 'rattachement.json'));
  assert.equal(d.status, 0, d.stderr);
  assert.match(d.stdout, /ABCDE-3620 : documents conformes ; controler-criteres sans écart ; 5 critères repris ; 13 critères de sous-tickets rattachés et illustrés ; 7 scénarios/);
});

const documentsAlteres = [
  ['critère de la racine reformulé dans us.md', { [`docs/demandes/${CLE}/us.md`]: (t) => t.replace('renvoie CommandeDto, inchangée.', 'renvoie un CommandeDto inchangé.') },
    /ABCDE-3620-CA01 : énoncé différent du critère ABCDE-3620:C1, qui se reprend mot pour mot/],
  ['critère de la racine marqué « proposé »', { [`docs/demandes/${CLE}/us.md`]: (t) => t.replace('| repris | ticket racine, critère C4 |', '| proposé | ticket racine, critère C4 |') },
    /ABCDE-3620-CA04 : origine « proposé », attendu « repris »/],
  ['scénario d\'une feuille back sans l\'étiquette de sa couche', { [`docs/demandes/${CLE}/${CLE}.feature`]: (t) => t.replace('@ABCDE-3620-S04 @ABCDE-3620-CA04 @back', '@ABCDE-3620-S04 @ABCDE-3620-CA04') },
    /ABCDE-3620-1\.1:C1 : aucun scénario de ABCDE-3620-CA04 ne porte @back/],
  ['critère sans scénario', { [`docs/demandes/${CLE}/${CLE}.feature`]: (t) => t.replace('@ABCDE-3620-S06 @ABCDE-3620-CA05 @front', '@ABCDE-3620-S06 @front').replace('@ABCDE-3620-S05 @ABCDE-3620-CA05 @back @front', '@ABCDE-3620-S05 @back @front').replace('@ABCDE-3620-S07 @ABCDE-3620-CA05 @back @front', '@ABCDE-3620-S07 @back @front') },
    /ABCDE-3620-2:C1 : aucun scénario n'illustre ABCDE-3620-CA05/],
  ['écart signalé par le script d\'agent-tdd-jira', { [`docs/demandes/${CLE}/us.md`]: (t) => t.replace('| validé | S05, S06, S07 |', '| validé | S05, S06 |') },
    /controler-criteres : D10\.INV-7 : ABCDE-3620-CA05 : us\.md annonce S05, S06, le fichier Gherkin donne S05, S06, S07/],
  ['demande.json à un autre schéma', { [`docs/demandes/${CLE}/demande.json`]: json((d) => { d.schemaVersion = 2; }) },
    /demande\.json : schemaVersion 2, attendu 1/],
  ['demande.json sans liste de commentaires', { [`docs/demandes/${CLE}/demande.json`]: json((d) => { delete d.commentaires; }) },
    /demande\.json : commentaires doit être une liste/],
];
for (const [nom, retouches, motif] of documentsAlteres) {
  test(`P8 : écart relevé, ${nom}`, () => {
    const { dossier } = copie(retouches);
    const { ecarts } = controlerDocuments(dossier, RATTACHEMENT, CONTROLEUR);
    attendreEcart(ecarts, motif);
  });
}

test('P8 : une image de l\'objectif d\'une feuille doit figurer parmi les pièces de demande.json', () => {
  const image = `docs/demandes/${CLE}/ABCDE-3620-2/objectif-01.png`;
  const avecImage = rattachementAvec((r) => { r.noeuds.find((n) => n.reference === 'ABCDE-3620-2').images = [image]; });
  const { dossier } = copie();
  attendreEcart(controlerDocuments(dossier, avecImage, CONTROLEUR).ecarts, /image de l'objectif docs\/demandes\/ABCDE-3620\/ABCDE-3620-2\/objectif-01\.png \(ABCDE-3620-2\) absente des pièces/);
  const piece = copie({ [`docs/demandes/${CLE}/demande.json`]: json((d) => { d.pieces.push({ type: 'image/png', emplacement: 'ticket.toml', taille: 0, fichier: 'ABCDE-3620-2/objectif-01.png' }); }) });
  assert.deepStrictEqual(controlerDocuments(piece.dossier, avecImage, CONTROLEUR).ecarts, []);
});

test('P8 : le dossier porte la clé, et les trois documents sont là', () => {
  const { projet, dossier } = copie();
  const ailleurs = join(projet, 'docs', 'demandes', 'AUTRE-1');
  cpSync(dossier, ailleurs, { recursive: true });
  attendreEcart(controlerDocuments(ailleurs, RATTACHEMENT, CONTROLEUR).ecarts, /le dossier doit porter la clé ABCDE-3620/);
  const vide = join(projet, 'vide', CLE);
  mkdirSync(vide, { recursive: true });
  attendreEcart(controlerDocuments(vide, RATTACHEMENT, CONTROLEUR).ecarts, /demande absent/);
  assert.equal(outil('verifier-documents.mjs', dossier).status, 2);
});

// ---- P9 : kits dev, test et démo, remise à Agent2Test ----

test('P9 : les kits de l\'exemple sont complets et vérifiés, et la remise est conforme', () => {
  const r = outil('verifier-kits.mjs', join(PROJET, ...DOSSIER), '--rattachement', join(BOITE, 'rattachement.json'));
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout.trim(), 'ABCDE-3620 : kits dev, test et démo complets et vérifiés ; remise agent2test.remise/1 conforme');
});

test('P9 : l\'historique se reconstruit à l\'identique, et le kit dev s\'y vérifie avec --depot', () => {
  const { projet, dossier } = copie();
  const empreintes = construireDepot(projet);
  const dev = JSON.parse(readFileSync(join(projet, ...kit('dev').split('/')), 'utf8'));
  assert.deepStrictEqual(dev.commits.map((c) => c.sha), empreintes.slice(1), 'commits non reproductibles : le kit dev ne correspond plus à l\'historique reconstruit');
  assert.equal(HISTORIQUE.commits.length, empreintes.length);
  const r = outil('verifier-kits.mjs', dossier, '--rattachement', join(BOITE, 'rattachement.json'), '--depot');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /commits et branche vérifiés dans le dépôt/);
  // Un fichier suivi modifié après le dernier commit rendrait la remise périmée pour Agent2Test.
  writeFileSync(join(projet, 'back', 'src', 'main', 'java', 'fr', 'exemple', 'commande', 'LignesCommandeEtag.java'), '// retouche\n');
  attendreEcart(controlerKits(dossier, RATTACHEMENT, { depot: true }).ecarts, /fichier suivi modifié depuis le dernier commit, back\/src\/main\/java\/fr\/exemple\/commande\/LignesCommandeEtag\.java/);
});

test('P9 : avec --depot, un commit de feuille sans la ligne « Sous-ticket » est relevé', () => {
  const { projet, dossier } = copie();
  const historique = structuredClone(HISTORIQUE);
  historique.commits.at(-1).sous_ticket = CLE; // message sans la ligne du sous-ticket
  const empreintes = construireDepot(projet, { historique });
  const chemin = join(projet, ...kit('dev').split('/'));
  writeFileSync(chemin, json((d) => { d.commits.forEach((c, i) => { c.sha = empreintes[i + 1]; }); })(readFileSync(chemin, 'utf8')));
  const remise = join(projet, ...kit('remise-agent2test').split('/'));
  writeFileSync(remise, json((d) => { d.commit = empreintes.at(-1); })(readFileSync(remise, 'utf8')));
  const { ecarts } = controlerKits(dossier, RATTACHEMENT, { depot: true });
  assert.deepStrictEqual(ecarts, [`kit dev : commit ${empreintes.at(-1).slice(0, 7)} sans la ligne « Sous-ticket : ABCDE-3620-2 »`]);
});

const kitsAlteres = [
  ['fichier de test modifié après le kit', { 'back/src/test/java/fr/exemple/commande/CommandeControllerSansVueTest.java': (t) => t.replace('reponseInchangeeSansParametre', 'autreNom') },
    /kit test : back\/src\/test\/java\/fr\/exemple\/commande\/CommandeControllerSansVueTest\.java, empreinte différente de celle du kit/],
  ['feuille sans commit', { [kit('dev')]: json((d) => { d.commits = d.commits.filter((c) => c.sous_ticket !== 'ABCDE-3620-2'); }) },
    /kit dev : aucun commit pour ABCDE-3620-2/],
  ['titre de commit sans l\'étiquette de son slot', { [kit('dev')]: json((d) => { d.commits[1].titre = 'ABCDE-3620 S04 : feat(jpa): agrégat'; }) },
    /kit dev : titre de commit hors format, « ABCDE-3620 S04 : feat\(jpa\): agrégat »/],
  ['champ inconnu dans le kit dev', { [kit('dev')]: json((d) => { d.auteur = 'x'; }) },
    /kit dev : champ inconnu auteur/],
  ['remise d\'un nœud absente du kit dev', { [kit('dev')]: json((d) => { d.remises = d.remises.filter((r) => !r.includes('ABCDE-3620-1/')); }) },
    /kit dev : remise de ABCDE-3620-1 absente, docs\/demandes\/ABCDE-3620\/ABCDE-3620-1\/remise\.md/],
  ['scénario sans test', { [kit('test')]: json((d) => { d.tests = d.tests.filter((t) => !t.scenarios.includes('ABCDE-3620-S06')); }) },
    /kit test : aucun test pour ABCDE-3620-S06/],
  ['test qui ne porte pas l\'étiquette du scénario cité', { [kit('test')]: json((d) => { d.tests[2].scenarios = ['ABCDE-3620-S02']; }) },
    /kit test : back\/src\/test\/java\/fr\/exemple\/commande\/CommandeControllerSansVueTest\.java ne porte pas l'étiquette de ABCDE-3620-S02/],
  ['matrice qui omet un scénario', { [`docs/demandes/${CLE}/kits/matrice.md`]: (t) => t.replace(/^.*@ABCDE-3620-S06.*\n/m, '') },
    /kit test : la matrice ne cite pas ABCDE-3620-S06/],
  ['parcours de démonstration qui omet un scénario', { [kit('demo')]: json((d) => { d.scenarios = d.scenarios.filter((s) => s !== 'ABCDE-3620-S06'); }) },
    /kit démo : scénarios attendus, ABCDE-3620-S05, ABCDE-3620-S06, ABCDE-3620-S07/],
  ['démonstration sans commande de lancement', { [kit('demo')]: json((d) => { d.commandes = []; }) },
    /kit démo : commandes de lancement absentes/],
  ['remise sans un scénario jouable', { [kit('remise-agent2test')]: json((d) => { d.jouables = ['ABCDE-3620-S05', 'ABCDE-3620-S07']; d.nonJouables.push({ scenario: 'ABCDE-3620-S06', motif: 'oubli' }); }) },
    /remise agent2test : jouables ABCDE-3620-S05, ABCDE-3620-S07, attendu ABCDE-3620-S05, ABCDE-3620-S06, ABCDE-3620-S07/],
  ['remise au schéma fermé, champ inconnu', { [kit('remise-agent2test')]: json((d) => { d.jeton = 'x'; }) },
    /remise agent2test : champ inconnu jeton/],
  ['remise sur un autre commit que la tête du kit dev', { [kit('remise-agent2test')]: json((d) => { d.commit = 'a'.repeat(40); }) },
    /remise agent2test : commit aaaaaaa, alors que le kit dev finit par 3743b46/],
  ['remise dont une source a changé', { [`docs/demandes/${CLE}/${CLE}.feature`]: (t) => `${t}\n` },
    /remise agent2test : docs\/demandes\/ABCDE-3620\/ABCDE-3620\.feature, empreinte différente du fichier/],
  ['remise sans le rôle des scénarios', { [kit('remise-agent2test')]: json((d) => { d.roles = []; }) },
    /remise agent2test : rôles attendus, GESTIONNAIRE \(étiquettes @role-\)/],
];
for (const [nom, retouches, motif] of kitsAlteres) {
  test(`P9 : écart relevé, ${nom}`, () => {
    const { dossier } = copie(retouches);
    attendreEcart(controlerKits(dossier, RATTACHEMENT).ecarts, motif);
  });
}

test('P9 : chaque image de l\'objectif a sa capture de l\'écran livré, comparée', () => {
  const image = `docs/demandes/${CLE}/ABCDE-3620-2/objectif-01.png`;
  const avecImage = rattachementAvec((r) => { r.noeuds.find((n) => n.reference === 'ABCDE-3620-2').images = [image]; });
  const { dossier } = copie();
  attendreEcart(controlerKits(dossier, avecImage).ecarts, /kit démo : aucune capture comparée à l'image de l'objectif docs\/demandes\/ABCDE-3620\/ABCDE-3620-2\/objectif-01\.png \(ABCDE-3620-2\)/);
});

test('P9 : prévision de jouabilité selon les règles du module plan d\'Agent2Test', () => {
  const criteres = new Map([['ABCDE-3620-CA01', { statut: 'validé' }], ['ABCDE-3620-CA02', { statut: 'en attente de Q1' }]]);
  const s = (...etiquettes) => ({ etiquettes });
  assert.equal(motifNonJouable(s('@ABCDE-3620-CA01', '@back', '@front', '@role-GESTIONNAIRE'), criteres), null);
  assert.equal(motifNonJouable(s('@ABCDE-3620-CA01', '@back'), criteres), 'limité au back');
  assert.equal(motifNonJouable(s('@ABCDE-3620-CA01', '@front', '@propose'), criteres), 'proposé, non validé');
  assert.equal(motifNonJouable(s('@ABCDE-3620-CA02', '@front', '@en-attente'), criteres), 'en attente');
  assert.equal(motifNonJouable(s('@ABCDE-3620-CA01', '@front', '@redemarrage'), criteres), 'non automatisable');
  assert.equal(motifNonJouable(s('@ABCDE-3620-CA02', '@front'), criteres), 'critère non validé');
});

test('P9 : ligne de commande, codes de sortie', () => {
  const { dossier } = copie({ [kit('demo')]: json((d) => { d.commandes = []; }) });
  const ko = outil('verifier-kits.mjs', dossier, '--rattachement', join(BOITE, 'rattachement.json'));
  assert.equal(ko.status, 1);
  assert.match(ko.stderr, /^ÉCART {2}kit démo : commandes de lancement absentes$/m);
  assert.equal(outil('verifier-kits.mjs', dossier).status, 2);
  assert.equal(outil('verifier-kits.mjs').status, 2);
});
