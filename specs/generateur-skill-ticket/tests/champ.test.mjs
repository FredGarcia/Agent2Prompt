// Recette du lot 5 : le champ d'observation de l'arbre reçoit en ajout seul les actions, les retours du
// développeur, les observations et les écarts. Sur retours simulés, une correction répétée fait attendre
// une proposition d'ordre 2, un écart dans un sous-ticket menace le critère du parent qu'il soutient, un
// désaccord entre nœuds va au registre des écarts (critère P5). Un champ altéré se voit, un dépôt hors
// schéma est refusé sans rien écrire.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lireTexte } from '../outils/referentiel.mjs';
import { CritereChamp, chargerModeles, contexteDe, controler, deposer, enregistrementDe, estRatifie, etatChamp, etatsCriteres, formaterEtat, lireChamp, verifierChamp } from '../outils/champ.mjs';
import { CHAMPS, CONTEXTE, RATTACHEMENT, projetDe, rejouer } from './champ-scenarios.mjs';
import { decrireEnregistrement } from '../outils/vue.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const OUTIL = join(ICI, '..', 'outils', 'champ.mjs');
const ESSAI = CHAMPS.essai;
const CLE = CHAMPS.cle;
const DEV = 'Développeur d\'exemple';
const O2 = 'ticket-abcde-3620-observateur-2';
const O3 = 'ticket-abcde-3620-observateur-3';

const temporaire = (prefixe) => mkdtempSync(join(tmpdir(), prefixe));
const attendreEcart = (ecarts, motif) => assert.ok(ecarts.some((e) => motif.test(e)), `écart attendu ${motif} ; reçus :\n${ecarts.join('\n') || '(aucun)'}`);
const projetVide = () => join(temporaire('champ-'), 'projet');
const etats = (dossier) => Object.fromEntries(etatsCriteres(lireChamp(dossier).enregistrements, CONTEXTE).map((c) => [c.ref, c.etat]));
const nombreDeLignes = (dossier) => lireChamp(dossier).lignes.length;

/** Copie du champ d'essai complet, dans un projet temporaire. */
function copieEssai() {
  const projet = projetVide();
  cpSync(projetDe(ESSAI), projet, { recursive: true });
  return { projet, dossier: join(projet, 'docs', 'demandes', CLE) };
}

// ---- P5 : retours simulés ----

test('P5 : le scénario d\'essai redonne le champ, la tête, le registre et l\'état de l\'exemple, octet pour octet', () => {
  const projet = projetVide();
  const { dossier } = rejouer(ESSAI, projet);
  for (const rel of [`docs/demandes/${CLE}/champ.jsonl`, `docs/demandes/${CLE}/champ.tete`, 'docs/c7e/registre-ecarts.md']) {
    assert.equal(readFileSync(join(projet, ...rel.split('/')), 'utf8'), lireTexte(join(projetDe(ESSAI), ...rel.split('/'))), rel);
  }
  const etat = formaterEtat(etatChamp(lireChamp(dossier).enregistrements, CONTEXTE), verifierChamp(dossier, CONTEXTE));
  assert.equal(`${etat}\n`, lireTexte(join(projetDe(ESSAI), 'etat.txt')));
});

test('P5 : une correction répétée fait attendre une proposition d\'ordre 2, à la deuxième correction', () => {
  const { resultats } = rejouer(ESSAI, projetVide(), 6);
  assert.deepStrictEqual(resultats[3].attentes, [], 'une seule correction ne déclenche rien');
  assert.deepStrictEqual(resultats[5].attentes, [{ nature: 'ordre-2', motif: 'requete-native', corrections: [4, 6], observateur: O2 }]);
});

test('P5 : la proposition d\'ordre 2 attend l\'examen de l\'ordre 3, puis la décision du développeur', () => {
  const projet = projetVide();
  const { dossier, resultats } = rejouer(ESSAI, projet, 9);
  assert.deepStrictEqual(resultats[6].attentes, [{ nature: 'ordre-3', proposition: 7, motif: 'requete-native', observateur: O3 }]);
  assert.deepStrictEqual(resultats[7].attentes, [{ nature: 'developpeur', proposition: 7, examen: 8, verdict: 'fondee', motif: 'requete-native' }]);
  assert.deepStrictEqual(etatChamp(lireChamp(dossier).enregistrements, CONTEXTE).attentes, [], 'retenue, la proposition ne fait plus rien attendre');
});

test('P5 : un écart dans un sous-ticket menace le critère du parent qu\'il soutient, jusqu\'au critère d\'acceptation', () => {
  const projet = projetVide();
  const { dossier } = rejouer(ESSAI, projet, 15);
  const avant = etats(dossier);
  assert.equal(avant['ABCDE-3620-1.2:C3'], 'en écart');
  assert.equal(avant['ABCDE-3620-1:C3'], 'menacé');
  assert.equal(avant['ABCDE-3620:C3'], 'menacé');
  assert.equal(avant['ABCDE-3620-1.1:C2'], 'prouvé', 'le critère frère qui soutient aussi CA03 reste prouvé');
  assert.deepStrictEqual([avant['ABCDE-3620:C1'], avant['ABCDE-3620:C5']], ['prouvé', 'à prouver'], 'les autres critères de la racine ne sont pas touchés');
  const racine = etatsCriteres(lireChamp(dossier).enregistrements, CONTEXTE).find((c) => c.ref === 'ABCDE-3620:C3');
  assert.deepStrictEqual([racine.ca, racine.causes], [['ABCDE-3620-CA03'], ['ABCDE-3620-1.2:C3']]);
  assert.match(formaterEtat(etatChamp(lireChamp(dossier).enregistrements, CONTEXTE)), /ABCDE-3620-1\.2:C3 \(ABCDE-3620-CA03\) : en écart, n° 15 ; à traiter par ABCDE-3620-1\.2, à l'ordre 1/);
  rejouer({ depots: ESSAI.depots.slice(15, 16) }, projet);
  const apres = etats(dossier);
  assert.deepStrictEqual([apres['ABCDE-3620-1.2:C3'], apres['ABCDE-3620-1:C3'], apres['ABCDE-3620:C3']], ['prouvé', 'prouvé', 'prouvé'], 'corrigé à l\'ordre 1, l\'écart ne menace plus rien');
});

test('Visiteur : chaque critère de l\'arbre accepte un visiteur, qui l\'atteint après les critères qui le soutiennent', () => {
  assert.ok([...CONTEXTE.criteres.values()].every((c) => c instanceof CritereChamp));
  const ordre = [];
  const visiteur = {
    vus: new Set(),
    visiterCritere(c) {
      if (this.vus.has(c.ref)) return;
      this.vus.add(c.ref);
      for (const ref of c.enfants) CONTEXTE.criteres.get(ref).accepter(this);
      ordre.push(c.ref);
    },
  };
  CONTEXTE.criteres.get('ABCDE-3620:C3').accepter(visiteur);
  assert.deepStrictEqual(ordre, ['ABCDE-3620-1.1:C2', 'ABCDE-3620-1.2:C3', 'ABCDE-3620-1:C3', 'ABCDE-3620:C3']);
  CONTEXTE.criteres.get('ABCDE-3620:C5').accepter(visiteur);
  assert.deepStrictEqual(ordre.slice(4), ['ABCDE-3620-1.2:C4', 'ABCDE-3620-1:C5', 'ABCDE-3620-2:C1', 'ABCDE-3620-2:C2', 'ABCDE-3620:C5']);
});

test('P5 : un désaccord entre nœuds va au registre des écarts, décision laissée au développeur', () => {
  const projet = projetVide();
  rejouer(ESSAI, projet, 19);
  const registre = join(projet, 'docs', 'c7e', 'registre-ecarts.md');
  assert.throws(() => readFileSync(registre), /ENOENT/, 'aucun écart avant le désaccord');
  const { dossier, resultats } = rejouer({ depots: ESSAI.depots.slice(19, 20) }, projet);
  assert.deepStrictEqual(resultats[0].deposes.map((x) => [x.n, x.type]), [[20, 'observation'], [21, 'ecart']]);
  const ecart = resultats[0].deposes[1];
  assert.deepStrictEqual([ecart.auteur, ecart.noeud, ecart.invariant, ecart.observe], ['champ.mjs', CLE, 'désaccord entre nœuds (D6.INV-3)', [18, 20]]);
  assert.match(readFileSync(registre, 'utf8'), /\| 2026-11-05 \| ABCDE-3620 \| désaccord entre nœuds \(D6\.INV-3\) \| contrat « [^»]+ » : ABCDE-3620-1\.2 conforme \(n° 18\) ; ABCDE-3620-2 en écart \(n° 20\), [^|]+ ; champ docs\/demandes\/ABCDE-3620\/champ\.jsonl, n° 21 \| {2}\|\n$/);
  const etat = etatChamp(lireChamp(dossier).enregistrements, CONTEXTE);
  assert.deepStrictEqual(etat.desaccords.map((d) => [d.conformes.map((o) => o.noeud), d.ecarts.map((o) => o.noeud), d.inscrit]), [[['ABCDE-3620-1.2'], ['ABCDE-3620-2'], 21]]);
  // Une observation qui départage les nœuds lève le désaccord dans l'état ; le registre garde sa ligne.
  const r = deposer(dossier, { type: 'observation', noeud: 'ABCDE-3620-2', auteur: 'ticket-abcde-3620-2-front', ordre: 1, verdict: 'conforme', ancre: ESSAI.depots[19].ancre, preuve: { nature: 'test', ref: 'front/src/app/commande/lignes-commande.temps-reel.spec.ts' } }, { contexte: CONTEXTE, date: '2026-11-05T12:00:00Z' });
  assert.deepStrictEqual(r.erreurs, []);
  assert.deepStrictEqual(etatChamp(lireChamp(dossier).enregistrements, CONTEXTE).desaccords, []);
  assert.equal(readFileSync(registre, 'utf8').split('\n').filter((l) => l.startsWith('| 2026')).length, 1);
  assert.deepStrictEqual(verifierChamp(dossier, CONTEXTE), []);
});

test('P5 : deux propositions refusées mettent le motif en veille ; l\'ordre 2 ne s\'y éveille plus', () => {
  const dossier = join(projetVide(), 'docs', 'demandes', CLE);
  let minute = 0;
  const d = (partiel) => {
    minute += 1;
    const r = deposer(dossier, partiel, { contexte: CONTEXTE, date: `2026-11-03T10:${String(minute).padStart(2, '0')}:00Z` });
    assert.deepStrictEqual(r.erreurs, [], JSON.stringify(partiel));
    return r;
  };
  const action = () => d({ type: 'action', noeud: 'ABCDE-3620-1.1', auteur: 'ticket-abcde-3620-1-1-persistance', nature: 'realisation', ancre: { type: 'scenario', ref: 'ABCDE-3620-S04' }, resume: 'test nommé en anglais' }).deposes[0].n;
  const correction = (vise) => d({ type: 'retour', noeud: 'ABCDE-3620-1.1', auteur: 'ticket-abcde-3620-1-1', nature: 'correction', vise, motif: 'nommage-test', par: DEV, contenu: 'nommer les tests en français' });
  const proposition = (observe) => d({ type: 'observation', noeud: 'ABCDE-3620-1.1', auteur: O2, ordre: 2, verdict: 'proposition', motif: 'nommage-test', observe, preuve: { nature: 'enregistrements', ref: observe.join(', ') }, proposition: 'relever la langue des noms de tests du projet avant d\'écrire' }).deposes[0].n;
  const refus = (vise) => d({ type: 'retour', noeud: 'ABCDE-3620-1.1', auteur: 'ticket-abcde-3620-1-1', nature: 'choix', vise, decision: 'refusée', par: DEV, contenu: 'Refusée' });
  const deuxCorrections = () => {
    const a = action();
    const c1 = correction(a).deposes[0].n;
    const b = action();
    return [c1, correction(b)];
  };
  const [c1, r2] = deuxCorrections();
  assert.equal(r2.attentes[0]?.nature, 'ordre-2');
  const p1 = proposition([c1, r2.deposes[0].n]);
  refus(p1);
  const [c3, r4] = deuxCorrections();
  assert.equal(r4.attentes[0]?.nature, 'ordre-2', 'après un seul refus, l\'ordre 2 s\'éveille encore');
  const p2 = proposition([c3, r4.deposes[0].n]);
  const dernier = refus(p2);
  assert.deepStrictEqual(dernier.attentes, [{ nature: 'veille', motif: 'nommage-test', propositions: [p1, p2], observateur: O3 }]);
  d({ type: 'observation', noeud: 'ABCDE-3620-1.1', auteur: O3, ordre: 3, verdict: 'veille', motif: 'nommage-test', observe: [p1, p2], preuve: { nature: 'enregistrements', ref: `${p1}, ${p2}` } });
  const [, r6] = deuxCorrections();
  assert.deepStrictEqual(r6.attentes, [], 'en veille, deux nouvelles corrections ne réveillent pas l\'ordre 2');
  assert.match(formaterEtat(etatChamp(lireChamp(dossier).enregistrements, CONTEXTE)), /Veilles : motif nommage-test \(n° \d+\)/);
  assert.deepStrictEqual(verifierChamp(dossier, CONTEXTE), []);
});

test('ratifications : déposées dans le champ, la dernière décision fait foi ; un nœud composé ne se ratifie pas', () => {
  const dossier = join(projetVide(), 'docs', 'demandes', CLE);
  const ratifier = (noeud, objet, decision, date) => deposer(dossier, { type: 'retour', noeud, auteur: 'skill', nature: 'ratification', objet, decision, par: DEV, contenu: decision }, { contexte: CONTEXTE, date });
  assert.deepStrictEqual(ratifier(CLE, `arbre ${CLE}`, 'non ratifié', '2026-11-03T09:00:00Z').erreurs, []);
  assert.equal(estRatifie(lireChamp(dossier).enregistrements, `arbre ${CLE}`), false);
  assert.deepStrictEqual(ratifier(CLE, `arbre ${CLE}`, 'ratifié', '2026-11-03T09:10:00Z').erreurs, []);
  assert.equal(estRatifie(lireChamp(dossier).enregistrements, `arbre ${CLE}`), true);
  attendreEcart(ratifier('ABCDE-3620-1', 'ABCDE-3620-1', 'ratifié', '2026-11-03T09:20:00Z').erreurs, /ratification de « ABCDE-3620-1 » par ABCDE-3620-1 ; attendu aucune : ce nœud ne se ratifie pas/);
  attendreEcart(ratifier('ABCDE-3620-1.1', `arbre ${CLE}`, 'ratifié', '2026-11-03T09:20:00Z').erreurs, /attendu « ABCDE-3620-1\.1 »/);
  assert.deepStrictEqual(ratifier('ABCDE-3620-1.1', 'ABCDE-3620-1.1', 'ratifié', '2026-11-03T09:30:00Z').erreurs, []);
});

test('le champ du projet résolu prouve chaque critère d\'acceptation, sans désaccord ni attente', () => {
  const dossier = join(projetDe(CHAMPS.resolution), 'docs', 'demandes', CLE);
  assert.deepStrictEqual(verifierChamp(dossier, CONTEXTE), []);
  const etat = etatChamp(lireChamp(dossier).enregistrements, CONTEXTE);
  assert.ok(etat.criteres.every((c) => c.etat === 'prouvé'), etat.criteres.filter((c) => c.etat !== 'prouvé').map((c) => c.ref).join(', '));
  assert.deepStrictEqual([etat.desaccords, etat.attentes, etat.ratifications.length], [[], [], 4]);
  const projet = projetVide();
  rejouer(CHAMPS.resolution, projet);
  assert.equal(readFileSync(join(projet, 'docs', 'demandes', CLE, 'champ.jsonl'), 'utf8'), lireTexte(join(dossier, 'champ.jsonl')));
});

// ---- Ajout seul : un champ altéré se voit ----

const alterations = [
  ['ligne réécrite au milieu du champ', (l) => { l[3] = l[3].replace('pas de SQL natif', 'SQL natif accepté'); }, /n° 5 : empreinte du précédent différente ; la ligne 4 a été réécrite, insérée ou supprimée/],
  ['ligne supprimée au milieu du champ', (l) => { l.splice(9, 1); }, /n° 11 : numéro 11, attendu 10|empreinte du précédent différente/],
  ['dernière ligne supprimée', (l) => { l.pop(); }, /champ\.tete annonce le n° 22, le champ s'arrête au n° 21/],
  ['dernière ligne réécrite', (l) => { l[l.length - 1] = l.at(-1).replace('"conforme"', '"ecart"').replace('}}', '},"ecart":"x"}'); }, /champ\.tete : la dernière ligne, n° 22, a été réécrite/],
  ['ligne réécrite hors de champ.mjs, sans sa forme canonique', (l) => { l[0] = JSON.stringify(JSON.parse(l[0]), null, 1).replace(/\n/g, ''); }, /n° 1 : ligne non canonique, écrite hors de champ\.mjs/],
  ['ligne insérée', (l) => { l.splice(2, 0, l[2]); }, /n° 3 : numéro 3, attendu 4|empreinte du précédent différente/],
];
for (const [nom, alterer, motif] of alterations) {
  test(`ajout seul : champ altéré relevé, ${nom}`, () => {
    const { dossier } = copieEssai();
    const lignes = readFileSync(join(dossier, 'champ.jsonl'), 'utf8').split('\n').filter(Boolean);
    alterer(lignes);
    writeFileSync(join(dossier, 'champ.jsonl'), `${lignes.join('\n')}\n`);
    attendreEcart(verifierChamp(dossier, CONTEXTE), motif);
    const r = deposer(dossier, { type: 'retour', noeud: CLE, auteur: 'ticket-abcde-3620', nature: 'ratification', objet: `arbre ${CLE}`, decision: 'ratifié', par: DEV, contenu: 'ok' }, { contexte: CONTEXTE, date: '2026-11-06T09:00:00Z' });
    assert.equal(r.erreurs[0], 'champ altéré, dépôt refusé');
  });
}

test('ajout seul : tête absente, écart absent du registre', () => {
  const { projet, dossier } = copieEssai();
  rmSync(join(dossier, 'champ.tete'));
  attendreEcart(verifierChamp(dossier, CONTEXTE), /champ\.tete absent/);
  const autre = copieEssai();
  writeFileSync(join(autre.projet, 'docs', 'c7e', 'registre-ecarts.md'), '# Registre des écarts\n');
  attendreEcart(verifierChamp(autre.dossier, CONTEXTE), /écart n° 21 absent du registre des écarts/);
  rmSync(join(projet, 'docs', 'c7e'), { recursive: true });
  attendreEcart(verifierChamp(dossier, CONTEXTE), /registre des écarts absent/);
});

// ---- Schéma fermé : un dépôt hors schéma est refusé, sans rien écrire ----

const action = { type: 'action', noeud: 'ABCDE-3620-1.2', auteur: 'ticket-abcde-3620-1-2-back', nature: 'realisation', ancre: { type: 'scenario', ref: 'ABCDE-3620-S02' }, resume: 'S02 présenté' };
const refus = [
  ['champ inconnu', { ...action, jeton: 'x' }, /champ inconnu jeton/],
  ['champ absent', { type: 'action', noeud: 'ABCDE-3620-1.2', auteur: 'a', nature: 'realisation', resume: 'r' }, /champ absent ancre/],
  ['nœud hors de l\'arbre', { ...action, noeud: 'ABCDE-9999' }, /nœud ABCDE-9999 hors de l'arbre ABCDE-3620/],
  ['ancre de critère inconnue', { ...action, ancre: { type: 'critere', ref: 'ABCDE-3620-1.2:C9' } }, /ancre critere « ABCDE-3620-1\.2:C9 » inconnue/],
  ['correction sans motif', { type: 'retour', noeud: 'ABCDE-3620-1.2', auteur: 's', nature: 'correction', vise: 3, par: DEV, contenu: 'c' }, /une correction porte un motif en minuscules et tirets/],
  ['correction qui vise un retour', { type: 'retour', noeud: 'ABCDE-3620-1.2', auteur: 's', nature: 'correction', vise: 4, motif: 'm', par: DEV, contenu: 'c' }, /une correction vise une action antérieure \(vise 4\)/],
  ['correction qui vise l\'avenir', { type: 'retour', noeud: 'ABCDE-3620-1.2', auteur: 's', nature: 'correction', vise: 40, motif: 'm', par: DEV, contenu: 'c' }, /une correction vise une action antérieure \(vise 40\)/],
  ['observation d\'ordre 2 par un autre agent', { type: 'observation', noeud: 'ABCDE-3620-1.1', auteur: 'ticket-abcde-3620-1-1', ordre: 2, verdict: 'proposition', motif: 'requete-native', observe: [4, 6], preuve: { nature: 'enregistrements', ref: '4, 6' }, proposition: 'p' }, /une observation d'ordre 2 vient de ticket-abcde-3620-observateur-2, pas de ticket-abcde-3620-1-1/],
  ['proposition d\'ordre 2 sur une seule correction', { type: 'observation', noeud: 'ABCDE-3620-1.1', auteur: O2, ordre: 2, verdict: 'proposition', motif: 'requete-native', observe: [4], preuve: { nature: 'enregistrements', ref: '4' }, proposition: 'p' }, /cite au moins deux corrections au motif requete-native/],
  ['observation d\'ordre 1 sans ancre', { type: 'observation', noeud: 'ABCDE-3620-1.2', auteur: 'a', ordre: 1, verdict: 'conforme', preuve: { nature: 'test', ref: 't' } }, /ancre attendue/],
  ['écart sans description', { type: 'observation', noeud: 'ABCDE-3620-1.2', auteur: 'a', ordre: 1, verdict: 'ecart', ancre: { type: 'critere', ref: 'ABCDE-3620-1.2:C1' }, preuve: { nature: 'test', ref: 't' } }, /un verdict ecart décrit l'écart/],
  ['preuve absente de sa nature', { type: 'observation', noeud: 'ABCDE-3620-1.2', auteur: 'a', ordre: 1, verdict: 'conforme', ancre: { type: 'critere', ref: 'ABCDE-3620-1.2:C1' }, preuve: { nature: 'intuition', ref: 't' } }, /preuve attendue/],
  ['proposition déjà décidée', { type: 'retour', noeud: 'ABCDE-3620-1.1', auteur: 's', nature: 'choix', vise: 7, decision: 'refusée', par: DEV, contenu: 'Refusée' }, /la proposition n° 7 est déjà décidée/],
];
for (const [nom, partiel, motif] of refus) {
  test(`schéma fermé : dépôt refusé, ${nom}`, () => {
    const { dossier } = copieEssai();
    const avant = readFileSync(join(dossier, 'champ.jsonl'), 'utf8');
    const r = deposer(dossier, partiel, { contexte: CONTEXTE, date: '2026-11-06T09:00:00Z' });
    attendreEcart(r.erreurs, motif);
    assert.equal(readFileSync(join(dossier, 'champ.jsonl'), 'utf8'), avant, 'rien n\'est écrit');
  });
}

test('schéma fermé : une date antérieure au dernier enregistrement est refusée ; le dossier porte la clé', () => {
  const { dossier, projet } = copieEssai();
  attendreEcart(deposer(dossier, action, { contexte: CONTEXTE, date: '2026-11-01T09:00:00Z' }).erreurs, /antérieure à celle du n° 22/);
  const ailleurs = join(projet, 'docs', 'demandes', 'AUTRE-1');
  mkdirSync(ailleurs, { recursive: true });
  attendreEcart(deposer(ailleurs, action, { contexte: CONTEXTE }).erreurs, /le dossier doit être celui de la clé ABCDE-3620/);
  assert.equal(nombreDeLignes(dossier), 22);
});

// ---- Ligne de commande ----

test('ligne de commande : deposer, etat, verifier, codes de sortie', () => {
  const projet = projetVide();
  const outils = join(projet, '..', 'outils');
  mkdirSync(outils, { recursive: true });
  writeFileSync(join(outils, 'rattachement.json'), JSON.stringify(RATTACHEMENT));
  const dossier = join(projet, 'docs', 'demandes', CLE);
  const lancer = (...args) => spawnSync(process.execPath, [OUTIL, ...args, '--rattachement', join(outils, 'rattachement.json')], { encoding: 'utf8' });
  const r = lancer('deposer', dossier, 'retour', '--noeud', CLE, '--auteur', 'ticket-abcde-3620', '--nature', 'ratification', '--objet', `arbre ${CLE}`, '--decision', 'ratifié', '--par', DEV, '--contenu', 'Arbre ratifié', '--date', '2026-11-03T09:00:00Z');
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout.trim(), 'n° 1 déposé : retour ratification');
  const o = lancer('deposer', dossier, 'observation', '--noeud', 'ABCDE-3620-1.2', '--auteur', 'ticket-abcde-3620-1-2-back', '--ordre', '1', '--verdict', 'ecart', '--ancre', 'critere:ABCDE-3620-1.2:C3', '--ecart', 'absent au lieu de null', '--preuve', 'test:CommandeControllerSansLigneTest.java', '--extrait', 'No value at JSON path', '--tokens', '1200', '--date', '2026-11-04T11:00:00Z');
  assert.equal(o.status, 0, o.stderr);
  assert.deepStrictEqual(lireChamp(dossier).enregistrements[1].preuve, { nature: 'test', ref: 'CommandeControllerSansLigneTest.java', extrait: 'No value at JSON path' });
  assert.deepStrictEqual(lireChamp(dossier).enregistrements[1].cout, { tokens: 1200 });
  const e = lancer('etat', dossier);
  assert.equal(e.status, 0, e.stderr);
  assert.match(e.stdout, /ABCDE-3620:C3 \(ABCDE-3620-CA03\) : menacé par ABCDE-3620-1\.2:C3/);
  assert.equal(JSON.parse(lancer('etat', dossier, '--json').stdout).criteres.find((c) => c.ref === 'ABCDE-3620-1:C3').etat, 'menacé');
  const v = lancer('verifier', dossier);
  assert.equal(v.status, 0, v.stderr);
  const k = lancer('deposer', dossier, 'retour', '--noeud', 'ABCDE-3620-1.2', '--auteur', 's', '--nature', 'correction', '--vise', '1', '--motif', 'm', '--par', DEV, '--contenu', 'c');
  assert.equal(k.status, 1);
  assert.match(k.stderr, /^REFUS {2}n° 3 : une correction vise une action antérieure \(vise 1\)$/m);
  assert.equal(lancer('deposer', dossier, 'action', '--inconnue', 'x').status, 2);
  assert.equal(lancer('etat').status, 2);
  assert.equal(lancer('verifier', dossier, '--json').status, 2);
  assert.throws(() => enregistrementDe('action', { ancre: ['sans-deux-points'] }), /ancre attendu sous la forme <type>:<référence>/);
});

// ---- D11 : observateur extérieur ----

const MODELES = { session: 'gemini-3-pro-preview', observateur: 'gemini-3-flash-preview', effectif: 'gemini-3-flash-preview' };
const exterieur = (modeles = MODELES) => contexteDe(RATTACHEMENT, modeles);
/** Rejoue les k premiers dépôts du scénario d'essai avec un contexte donné, sans s'arrêter à un refus. */
function rejouerAvec(ctx, k, projet = projetVide()) {
  const dossier = join(projet, 'docs', 'demandes', CLE);
  const resultats = ESSAI.depots.slice(0, k).map(({ date, ...partiel }) => deposer(dossier, partiel, { contexte: ctx, date }));
  return { projet, dossier, resultats };
}

test('D11 : dans un arbre à deux modèles, champ.mjs inscrit à chaque observation d\'ordre 3 le modèle effectif de son observateur, et refuse celle qui retomberait sur la session ou dont le modèle est introuvable', () => {
  const { dossier, resultats } = rejouerAvec(exterieur(), 8);
  assert.deepStrictEqual(resultats.map((x) => x.erreurs), Array(8).fill([]));
  const { enregistrements } = lireChamp(dossier);
  assert.deepStrictEqual([enregistrements[7].ordre, enregistrements[7].modele], [3, 'gemini-3-flash-preview']);
  assert.ok(enregistrements.slice(0, 7).every((e) => e.modele === undefined), 'seul l\'ordre 3 porte un modèle');
  assert.deepStrictEqual(verifierChamp(dossier, exterieur()), []);
  assert.deepStrictEqual(verifierChamp(dossier, CONTEXTE), [], 'le champ reste au schéma skill-ticket.observation/1, lu sans les modèles');
  for (const [modeles, motif] of [
    [{ ...MODELES, effectif: MODELES.session }, /n° 8 : l'observateur d'ordre 3 tourne sur le modèle de la session, gemini-3-pro-preview : son jugement ne serait pas extérieur/],
    [{ ...MODELES, effectif: null }, /modèle de l'observateur d'ordre 3 introuvable : ni l'en-tête de ticket-abcde-3620-observateur-3/],
  ]) {
    const refus = rejouerAvec(exterieur(modeles), 8);
    attendreEcart(refus.resultats[7].erreurs, motif);
    assert.equal(nombreDeLignes(refus.dossier), 7, 'rien n\'est écrit');
  }
  // Sans modèle d'observateur, l'ordre 3 ne porte rien, comme avant.
  assert.equal(lireChamp(rejouerAvec(CONTEXTE, 8).dossier).enregistrements[7].modele, undefined);
  // Le modèle ne vient jamais du déposant, et n'appartient qu'à l'ordre 3.
  assert.throws(() => enregistrementDe('observation', { ordre: ['3'], modele: ['gemini-3-flash-preview'] }), /option inconnue : --modele/);
  attendreEcart(controler({ ...enregistrements[6], modele: 'gemini-3-flash-preview' }, enregistrements.slice(0, 6), exterieur()), /champ modele sans objet pour observation d'ordre 2/);
  attendreEcart(controler({ ...enregistrements[7], modele: 'gemini 3' }, enregistrements.slice(0, 7), exterieur()), /modèle « gemini 3 », un nom de modèle/);
  // Un champ dont l'ordre 3 est sur le modèle que l'arbre donne à la session ne se vérifie pas.
  attendreEcart(verifierChamp(dossier, exterieur({ ...MODELES, session: 'gemini-3-flash-preview' })), /n° 8 : l'observateur d'ordre 3 tourne sur le modèle de la session/);
  // L'état dit sur quel modèle juge l'ordre 3 ; un arbre sans modèle n'en dit rien.
  const etat = etatChamp(enregistrements, exterieur());
  assert.deepStrictEqual(etat.observateur, { session: 'gemini-3-pro-preview', modele: 'gemini-3-flash-preview' });
  assert.match(formaterEtat(etat), /^Observateur d'ordre 3 : sur gemini-3-flash-preview, autre que celui de la session, gemini-3-pro-preview$/m);
  assert.match(formaterEtat(etatChamp(enregistrements, exterieur({ ...MODELES, effectif: MODELES.session }))), /^Observateur d'ordre 3 : sur le modèle de la session, gemini-3-pro-preview : dépôt d'ordre 3 refusé$/m);
  assert.match(formaterEtat(etatChamp(enregistrements, exterieur({ ...MODELES, effectif: null }))), /^Observateur d'ordre 3 : modèle introuvable, dépôt d'ordre 3 refusé$/m);
  assert.equal(etatChamp(enregistrements, CONTEXTE).observateur, undefined);
  // La vue dit sur quel modèle l'ordre 3 a jugé.
  assert.match(decrireEnregistrement(enregistrements[7]), /^examen de la proposition n° 7 : fondée ; .* ; jugé sur gemini-3-flash-preview, hors du modèle de la session$/);
  assert.doesNotMatch(decrireEnregistrement({ ...enregistrements[7], modele: undefined }), /jugé sur/);
});

/** Skill racine installé dans un projet temporaire : rattachement, manifeste, agent de l'observateur d'ordre 3. */
function installe() {
  const projet = temporaire('installe-');
  const gemini = join(projet, '.gemini');
  const skill = join(gemini, 'skills', 'ticket-abcde-3620');
  mkdirSync(join(skill, 'outils'), { recursive: true });
  mkdirSync(join(gemini, 'agents'), { recursive: true });
  const rattachement = join(skill, 'outils', 'rattachement.json');
  writeFileSync(rattachement, JSON.stringify(RATTACHEMENT));
  return {
    projet, rattachement, utilisateur: join(projet, 'utilisateur.json'), reglages: join(gemini, 'settings.json'),
    manifeste: (modeles) => writeFileSync(join(skill, 'manifest.json'), JSON.stringify({ name: 'ticket-abcde-3620', ticket: { reference: CLE, ...(modeles ? { modeles } : {}) } })),
    agent: (model) => writeFileSync(join(gemini, 'agents', 'ticket-abcde-3620-observateur-3.md'), `---\nname: ticket-abcde-3620-observateur-3\nkind: local\n${model ? `model: ${model}\n` : ''}---\n\n# Observateur d'ordre 3\n`),
    surcharge: (chemin, model) => writeFileSync(chemin, JSON.stringify({ agents: { overrides: { 'ticket-abcde-3620-observateur-3': { modelConfig: { model } } } } })),
  };
}

test('D11 : le modèle effectif de l\'observateur d\'ordre 3 se lit comme Gemini CLI le servirait : l\'en-tête de son agent installé, sauf surcharge de l\'utilisateur, puis du projet ; inherit le ramène à la session', () => {
  const i = installe();
  const lire = () => chargerModeles(i.rattachement, { utilisateur: i.utilisateur });
  i.manifeste(null);
  assert.equal(lire(), null, 'sans modèle nommé, l\'ordre 3 est intérieur');
  i.manifeste({ session: 'gemini-3-pro-preview' });
  assert.equal(lire(), null, 'la session seule ne fait pas d\'observateur extérieur');
  i.manifeste({ session: 'gemini-3-pro-preview', observateur: 'gemini-3-flash-preview' });
  assert.deepStrictEqual(lire(), { session: 'gemini-3-pro-preview', observateur: 'gemini-3-flash-preview', effectif: null }, 'agent non installé');
  i.agent('gemini-3-flash-preview');
  assert.equal(lire().effectif, 'gemini-3-flash-preview');
  i.surcharge(i.utilisateur, 'gemini-3-pro-preview');
  assert.equal(lire().effectif, 'gemini-3-pro-preview', 'la surcharge de l\'utilisateur l\'emporte sur l\'en-tête');
  i.surcharge(i.reglages, 'gemini-2.5-flash');
  assert.equal(lire().effectif, 'gemini-2.5-flash', 'celle du projet, sur celle de l\'utilisateur');
  rmSync(i.reglages);
  rmSync(i.utilisateur);
  i.agent('inherit');
  assert.equal(lire().effectif, 'gemini-3-pro-preview', 'inherit : le modèle de la session');
  writeFileSync(i.reglages, '{');
  assert.throws(lire, /réglages de Gemini CLI illisibles/);
});

test('D11 : en ligne de commande, depuis le skill racine installé, le dépôt d\'ordre 3 porte le modèle de l\'observateur, et l\'état le dit ; ramené par les réglages au modèle de la session, il est refusé', () => {
  const ordre3 = (dossier, i, maison) => spawnSync(process.execPath, [OUTIL, 'deposer', dossier, 'observation', '--noeud', 'ABCDE-3620-1.1', '--auteur', O3, '--ordre', '3', '--verdict', 'fondee', '--observe', '7', '--preuve', 'enregistrements:7', '--date', '2026-11-03T11:05:00Z', '--rattachement', i.rattachement], { encoding: 'utf8', env: { ...process.env, HOME: maison, USERPROFILE: maison } });
  const maison = temporaire('maison-');
  const i = installe();
  i.manifeste({ session: 'gemini-3-pro-preview', observateur: 'gemini-3-flash-preview' });
  i.agent('gemini-3-flash-preview');
  const { dossier } = rejouerAvec(CONTEXTE, 7, i.projet);
  const ok = ordre3(dossier, i, maison);
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /^n° 8 déposé : observation d'ordre 3, fondee$/m);
  assert.equal(lireChamp(dossier).enregistrements[7].modele, 'gemini-3-flash-preview');
  const etat = spawnSync(process.execPath, [OUTIL, 'etat', dossier, '--rattachement', i.rattachement], { encoding: 'utf8', env: { ...process.env, HOME: maison, USERPROFILE: maison } });
  assert.match(etat.stdout, /^Observateur d'ordre 3 : sur gemini-3-flash-preview, autre que celui de la session, gemini-3-pro-preview$/m);
  const j = installe();
  j.manifeste({ session: 'gemini-3-pro-preview', observateur: 'gemini-3-flash-preview' });
  j.agent('gemini-3-flash-preview');
  j.surcharge(j.reglages, 'gemini-3-pro-preview');
  const refus = ordre3(rejouerAvec(CONTEXTE, 7, j.projet).dossier, j, maison);
  assert.equal(refus.status, 1);
  assert.match(refus.stderr, /REFUS {2}n° 8 : l'observateur d'ordre 3 tourne sur le modèle de la session, gemini-3-pro-preview/);
  assert.equal(spawnSync(process.execPath, [OUTIL, 'deposer', dossier, 'observation', '--modele', 'x', '--rattachement', i.rattachement], { encoding: 'utf8' }).status, 2, 'le déposant ne donne jamais le modèle');
});
