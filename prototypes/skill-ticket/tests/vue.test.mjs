// Recette du lot 6 : la vue augmentée montre, pour chaque ancre, des calques et un état conformes au
// champ (critère P6). Les vues de l'essai à plusieurs moments et du projet résolu sont identiques aux vues
// versionnées ; les piles, recalculées ici sans le script, et les états du champ sont ceux de la vue, dans
// son modèle comme dans sa page ; une vue modifiée, périmée ou tirée d'un champ altéré se voit.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lireTexte } from '../outils/referentiel.mjs';
import { deposer, etatsCriteres, lireChamp } from '../outils/champ.mjs';
import { AncreVue, CALQUES, Calque, ETATS, VisiteurRangement, construireVue, contenusVue, etatVue, identifiant, modeleDe, poserCalques, vueDuNoeud } from '../outils/vue.mjs';
import { CHAMPS, CONTEXTE, RATTACHEMENT } from './champ-scenarios.mjs';
import { DOSSIER_ESSAI, DOSSIER_MOMENTS, DOSSIER_RESOLUTION, MOMENTS, projetAuMoment, vueAuMoment, vueDe } from './vue-scenarios.mjs';

const OUTIL = join(dirname(fileURLToPath(import.meta.url)), '..', 'outils', 'vue.mjs');
const CLE = CHAMPS.cle;
const CONTRAT = 'contrat:canal /topic/v1/commandes/{id}/lignes, lignesDernierEnregistrement en ISO 8601 avec fuseau';
const TOUS = CHAMPS.essai.depots.length;

const attendreEcart = (ecarts, motif) => assert.ok(ecarts.some((e) => motif.test(e)), `écart attendu ${motif} ; reçus :\n${ecarts.join('\n') || '(aucun)'}`);
const modele = (k) => modeleDe(vueAuMoment(k).vue);
const ancre = (m, cle) => m.ancres.find((a) => a.cle === cle);

/** Enregistrements du champ de l'essai après k dépôts, lus dans un projet temporaire. */
function enregistrementsAuMoment(k) {
  const { projet, dossier } = projetAuMoment(k);
  try {
    return lireChamp(dossier).enregistrements;
  } finally {
    rmSync(join(projet, '..'), { recursive: true, force: true });
  }
}

/**
 * Piles recalculées sans le script, d'après la définition ratifiée : une ancre propre, celles de ce que
 * l'enregistrement vise, celles de ce qu'une observation observe, le nœud d'une ratification.
 */
function pilesAttendues(enregistrements) {
  const caVersCritere = new Map(RATTACHEMENT.criteres.map((c) => [c.ca, c.critere]));
  const cle = (a) => (a.type === 'ca' && caVersCritere.has(a.ref) ? `critere:${caVersCritere.get(a.ref)}` : `${a.type}:${a.ref}`);
  const atteintes = new Map();
  for (const e of enregistrements) {
    const s = new Set();
    if (e.ancre) s.add(cle(e.ancre));
    if (e.type === 'retour' && e.nature === 'ratification') s.add(`noeud:${e.noeud}`);
    if (e.type === 'retour' && e.vise) for (const x of atteintes.get(e.vise)) s.add(x);
    if (e.type === 'observation') for (const o of e.observe ?? []) for (const x of atteintes.get(o)) s.add(x);
    atteintes.set(e.n, s);
  }
  const piles = new Map();
  for (const e of enregistrements) {
    const calque = e.type === 'retour' ? 'humain' : e.type === 'observation' ? `ordre-${e.ordre}` : 'ordre-1';
    for (const x of atteintes.get(e.n)) {
      if (!piles.has(x)) piles.set(x, Object.fromEntries(CALQUES.map((c) => [c.nom, []])));
      piles.get(x)[calque].push(e.n);
    }
  }
  return piles;
}

/** Calques et états lus dans la page : chaque ancre (article), ses calques et les numéros qu'ils portent. */
function lirePage(texte) {
  const desechapper = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const ancres = new Map();
  const pile = [];
  let calque = null;
  for (const m of texte.matchAll(/<article [^>]*data-ancre="([^"]*)" data-etat="([^"]*)"[^>]*>|<\/article>|<div class="calque calque-([a-z0-9-]+)">|<\/div>|<span class="numero">n° (\d+)<\/span>/g)) {
    if (m[1] !== undefined) {
      const cle = desechapper(m[1]);
      ancres.set(cle, { etat: desechapper(m[2]), calques: Object.fromEntries(CALQUES.map((c) => [c.nom, []])) });
      pile.push(cle);
    } else if (m[0] === '</article>') pile.pop();
    else if (m[3] !== undefined) calque = m[3];
    else if (m[0] === '</div>') calque = null;
    else if (calque) ancres.get(pile.at(-1)).calques[calque].push(Number(m[4]));
  }
  return ancres;
}

// ---- P6 : vues versionnées ----

for (const m of MOMENTS) {
  test(`P6 : la vue de l'essai au n° ${m.champ} est celle de l'exemple, octet pour octet (${m.ce_qui_se_voit})`, () => {
    assert.equal(vueAuMoment(m.depots).contenus['vue.md'], lireTexte(join(DOSSIER_MOMENTS, `${m.nom}.md`)));
  });
}

test('P6 : vues finales de l\'essai et du projet résolu identiques aux vues versionnées, et à jour', () => {
  for (const dossier of [DOSSIER_ESSAI, DOSSIER_RESOLUTION]) {
    const { contenus } = vueDe(dossier);
    for (const f of ['vue.html', 'vue.md']) assert.equal(contenus[f], lireTexte(join(dossier, f)), `${dossier} ${f}`);
    assert.equal(etatVue(dossier, { rattachement: RATTACHEMENT }).etat, 'à jour', dossier);
  }
  assert.deepStrictEqual(vueAuMoment(TOUS).contenus, vueDe(DOSSIER_ESSAI).contenus, 'le scénario rejoué en entier redonne la vue de l\'exemple');
});

// ---- P6 : calques conformes au champ ----

for (const k of [0, 6, 7, 9, 15, 16, 19, 20, TOUS]) {
  test(`P6 : piles recalculées sans le script, après ${k} dépôts : chaque ancre porte exactement ce qui l'atteint, dans le modèle et dans la page`, () => {
    const { vue, contenus } = vueAuMoment(k);
    const m = modeleDe(vue);
    const attendues = pilesAttendues(enregistrementsAuMoment(k));
    const vides = Object.fromEntries(CALQUES.map((c) => [c.nom, []]));
    for (const cle of attendues.keys()) assert.ok(ancre(m, cle), `ancre du champ absente de la vue : ${cle}`);
    for (const a of m.ancres) assert.deepStrictEqual(a.calques, attendues.get(a.cle) ?? vides, a.cle);
    const page = lirePage(contenus['vue.html']);
    assert.deepStrictEqual([...page.keys()].sort(), m.ancres.map((a) => a.cle).sort(), 'chaque ancre a son article dans la page');
    for (const a of m.ancres) {
      assert.deepStrictEqual(page.get(a.cle).calques, a.calques, `page, calques de ${a.cle}`);
      assert.equal(page.get(a.cle).etat, a.etat, `page, état de ${a.cle}`);
    }
  });
}

test('P6 : l\'état de chaque critère est celui que lui donne le champ, à chaque dépôt de l\'essai', () => {
  for (let k = 0; k <= TOUS; k++) {
    const m = modele(k);
    const champ = etatsCriteres(enregistrementsAuMoment(k), CONTEXTE);
    for (const c of champ) assert.equal(ancre(m, `critere:${c.ref}`).etat, c.etat, `après ${k} dépôts, ${c.ref}`);
  }
});

test('P6 : une correction répétée fait attendre l\'ordre 2 sur les ancres de ses corrections, puis l\'ordre 3, puis le développeur', () => {
  const marques = (k) => Object.fromEntries(modele(k).ancres.filter((a) => a.marques.length > 0).map((a) => [a.cle, a.marques.map((x) => x.texte)]));
  assert.deepStrictEqual(marques(5), {}, 'une seule correction ne fait rien attendre');
  assert.deepStrictEqual(Object.keys(marques(6)), [`scenario:${CLE}-S03`, `scenario:${CLE}-S04`]);
  assert.match(marques(6)[`scenario:${CLE}-S04`][0], /^observation d'ordre 2 attendue sur le motif requete-native \(corrections n° 4, 6\) ; invoquer ticket-abcde-3620-observateur-2$/);
  assert.match(marques(7)[`scenario:${CLE}-S03`][0], /^examen d'ordre 3 attendu de la proposition n° 7/);
  assert.match(marques(8)[`scenario:${CLE}-S03`][0], /^décision du développeur attendue sur la proposition n° 7, fondée à l'examen n° 8$/);
  assert.deepStrictEqual(marques(9), {});
  const m6 = modele(6);
  assert.deepStrictEqual(m6.a_traiter.map((x) => [x.gravite, x.cle]), [['attente', `scenario:${CLE}-S03`], ['attente', `scenario:${CLE}-S04`]]);
  assert.deepStrictEqual([ancre(modele(5), `scenario:${CLE}-S03`).etat, ancre(m6, `scenario:${CLE}-S03`).etat], ['réalisé', 'à reprendre'], 'la dernière action corrigée est à reprendre');
});

test('P6 : un écart dans une feuille menace le critère du parent et le critère d\'acceptation ; « À traiter » les range par gravité', () => {
  const m = modele(15);
  assert.deepStrictEqual(m.a_traiter.map((x) => [x.gravite, x.cle]), [['en écart', `critere:${CLE}-1.2:C3`], ['menacé', `critere:${CLE}:C3`], ['menacé', `critere:${CLE}-1:C3`]]);
  assert.match(m.a_traiter[0].texte, /n° 15 \(ABCDE-3620-1\.2\) : avec la configuration Jackson du projet, non_null, lignesDernierEnregistrement est absent au lieu de valoir null ; à traiter par ABCDE-3620-1\.2, à l'ordre 1$/);
  const md = vueAuMoment(15).contenus['vue.md'];
  assert.match(md, /##### ABCDE-3620-1\.1:C2 — prouvé\n\n> [^\n]+\n\nSoutient ABCDE-3620-1:C3 \(menacé\) ; critère d'acceptation ABCDE-3620-CA03 \(menacé\)\./, 'un critère frère voit la menace sur ce qu\'il soutient');
  assert.deepStrictEqual(modele(16).a_traiter, [], 'corrigé à l\'ordre 1, plus rien à traiter');
});

test('P6 : un désaccord entre nœuds se voit sur l\'ancre du contrat, avec son écart au registre', () => {
  const avant = modele(19);
  assert.equal(ancre(avant, CONTRAT).etat, 'conforme');
  const m = modele(20);
  const contrat = ancre(m, CONTRAT);
  assert.equal(contrat.etat, 'en désaccord');
  assert.equal(contrat.origine, 'champ');
  assert.deepStrictEqual(contrat.calques['ordre-1'], [18, 20, 21]);
  assert.deepStrictEqual(contrat.noeuds, [CLE, `${CLE}-1.2`, `${CLE}-2`]);
  assert.deepStrictEqual(m.a_traiter.map((x) => [x.gravite, x.cle]), [['en désaccord', CONTRAT]]);
  assert.match(m.a_traiter[0].texte, /^ABCDE-3620-1\.2 conforme \(n° 18\) ; ABCDE-3620-2 en écart \(n° 20\) ; écart n° 21 au registre des écarts, décision au développeur$/);
});

test('P6 : nœuds et ratifications ; un nœud composé n\'a pas de ratification propre ; le projet résolu prouve tout', () => {
  assert.deepStrictEqual([0, 1, 2].map((k) => [`noeud:${CLE}`, `noeud:${CLE}-1`, `noeud:${CLE}-1.1`].map((cle) => ancre(modele(k), cle).etat)), [
    ['à ratifier', 'sans ratification propre', 'à ratifier'],
    ['ratifié', 'sans ratification propre', 'à ratifier'],
    ['ratifié', 'sans ratification propre', 'ratifié'],
  ]);
  const vide = modele(0);
  assert.equal(vide.champ.enregistrements, 0);
  assert.ok(vide.ancres.filter((a) => a.type === 'critere').every((a) => a.etat === 'à prouver'));
  assert.ok(vide.ancres.filter((a) => a.type === 'scenario').every((a) => a.etat === 'à réaliser'));
  assert.match(vueAuMoment(0).contenus['vue.md'], /Champ vide : aucun enregistrement encore/);
  const resolu = modeleDe(vueDe(DOSSIER_RESOLUTION).vue);
  assert.ok(resolu.ancres.filter((a) => a.type === 'critere').every((a) => a.etat === 'prouvé'));
  assert.deepStrictEqual(resolu.a_traiter, []);
  assert.deepStrictEqual(resolu.ancres.filter((a) => a.type === 'noeud').map((a) => a.etat), ['ratifié', 'sans ratification propre', 'ratifié', 'ratifié', 'ratifié']);
});

// ---- Patrons : Décorateur et Visiteur ----

test('Décorateur : les calques se posent sur l\'ancre dans l\'ordre des ordres, sans toucher à son état', () => {
  const base = new AncreVue({ cle: 'scenario:X', type: 'scenario', ref: 'X', etat: 'à reprendre', marques: [] });
  const e = (n, type, extra = {}) => ({ n, type, ...extra });
  const pile = [e(1, 'retour', { nature: 'correction' }), e(2, 'observation', { ordre: 2 }), e(3, 'action'), e(4, 'observation', { ordre: 3 }), e(5, 'observation', { ordre: 1 })];
  const decoree = poserCalques(base, pile);
  assert.ok(decoree instanceof Calque);
  assert.equal(decoree.base(), base);
  assert.equal(decoree.base().etat, 'à reprendre');
  assert.deepStrictEqual(decoree.calques().map((c) => [c.nom, c.enregistrements.map((x) => x.n)]), [['ordre-1', [3, 5]], ['ordre-2', [2]], ['ordre-3', [4]], ['humain', [1]]]);
  const format = { ancre: (a) => `[${a.ref}]`, calque: (nom, es) => `(${nom}:${es.map((x) => x.n).join(',')})` };
  assert.equal(decoree.rendre(format, 3), '[X](ordre-1:3,5)(ordre-2:2)(ordre-3:4)(humain:1)');
  assert.equal(poserCalques(base, []), base, 'une ancre sans pile reste nue');
});

test('Visiteur : la vue se range par critère d\'acceptation, chaque critère suivi de ceux qui le soutiennent', () => {
  const v = new VisiteurRangement(CONTEXTE);
  const nom = (x) => [x.cle.replace('critere:', ''), x.enfants.map(nom)];
  assert.deepStrictEqual(nom(CONTEXTE.criteres.get(`${CLE}:C3`).accepter(v)), [`${CLE}:C3`, [[`${CLE}-1:C3`, [[`${CLE}-1.1:C2`, []], [`${CLE}-1.2:C3`, []]]]]]);
  assert.deepStrictEqual(nom(CONTEXTE.criteres.get(`${CLE}:C5`).accepter(v)), [`${CLE}:C5`, [[`${CLE}-1:C5`, [[`${CLE}-1.2:C4`, []]]], [`${CLE}-2:C1`, []], [`${CLE}-2:C2`, []]]]);
  const m = modele(TOUS);
  assert.deepStrictEqual(m.rangement.criteres_acceptation.map((x) => [x.ca, x.scenarios]), [1, 2, 3, 4, 5].map((i) => [`${CLE}-CA0${i}`, i < 5 ? [`scenario:${CLE}-S0${i}`] : [`scenario:${CLE}-S05`, `scenario:${CLE}-S06`, `scenario:${CLE}-S07`]]));
  assert.deepStrictEqual(m.rangement.nees_du_champ, [CONTRAT]);
});

// ---- Vue d'un nœud ----

test('vue d\'un nœud : ses ancres, et ce que les autres niveaux y ont déposé ; la vue du nœud racine est la vue entière', () => {
  const { vue, contenus } = vueAuMoment(TOUS);
  assert.equal(vueDuNoeud(vue, CLE), contenus['vue.md']);
  const front = vueDuNoeud(vue, `${CLE}-2`);
  assert.match(front, /^# Vue augmentée de ABCDE-3620-2, dans l'arbre ABCDE-3620\n/);
  assert.match(front, /- arbre ABCDE-3620 : ratifié \(n° 1, 2026-11-03, Développeur d'exemple\)/);
  assert.match(front, /## Autres ancres où ABCDE-3620-2 a déposé\n\n### contrat « canal \/topic\/v1\/commandes\/\{id\}\/lignes[^»]+» — en désaccord/);
  assert.match(front, /n° 18 · 2026-11-04 15:50 UTC · ABCDE-3620-1\.2 · ticket-abcde-3620-1-2-back : conforme/, 'le front voit le verdict du back sur le contrat partagé');
  assert.doesNotMatch(front, /ABCDE-3620-1\.1:C1/);
  const compose = modeleDe(vue, `${CLE}-1`);
  assert.deepStrictEqual(compose.ancres.filter((a) => a.type === 'critere').map((a) => a.ref), [`${CLE}-1:C1`, `${CLE}-1.2:C1`, `${CLE}-1:C2`, `${CLE}-1.2:C2`, `${CLE}-1:C3`, `${CLE}-1.1:C2`, `${CLE}-1.2:C3`, `${CLE}-1:C4`, `${CLE}-1.1:C1`, `${CLE}-1:C5`, `${CLE}-1.2:C4`]);
  assert.equal(vueDuNoeud(vue, 'ABCDE-9999'), null);
});

// ---- Page accessible, sans dépendance ----

test('page : structure accessible, autonome, lisible sans JavaScript', () => {
  const page = vueDe(DOSSIER_ESSAI).contenus['vue.html'];
  assert.match(page, /^<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">/);
  assert.match(page, /<title>Vue augmentée de ABCDE-3620<\/title>/);
  assert.equal(page.match(/<h1>/g).length, 1);
  const niveaux = [...page.matchAll(/<h([1-6])[ >]/g)].map((m) => Number(m[1]));
  niveaux.forEach((n, i) => assert.ok(i === 0 || n <= niveaux[i - 1] + 1, `titre h${n} après h${niveaux[i - 1]}`));
  assert.doesNotMatch(page, /\ssrc=|href="(?!#)|url\(|@import/, 'aucune ressource extérieure');
  const ids = [...page.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'identifiants uniques');
  for (const m of page.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(m[1]), `lien interne vers ${m[1]}`);
  assert.match(page, /<fieldset><legend>Calques affichés<\/legend>/);
  for (const c of CALQUES) assert.match(page, new RegExp(`<label><input type="checkbox" checked data-calque="${c.nom}"> ${c.titre}</label>`));
  assert.match(page, /<label for="filtre-noeud">Nœud<\/label> <select id="filtre-noeud">/);
  assert.match(page, /<p id="statut-filtre" role="status"><\/p>/);
  assert.match(page, /<div id="commandes" hidden>/, 'sans JavaScript, les commandes restent masquées et tout se lit');
  for (const m of page.matchAll(/<p class="etat etat-(\w+)"><span class="symbole" aria-hidden="true">[^<]+<\/span> État : <strong>([^<]+)<\/strong><\/p>/g)) {
    const etat = m[2].replace(/^menacé par .*/, 'menacé');
    assert.ok(ETATS[etat], `état écrit en toutes lettres : ${m[2]}`);
    assert.equal(ETATS[etat].famille, m[1]);
  }
  assert.match(page, /@media \(prefers-color-scheme:dark\)/);
  assert.match(page, /:focus-visible\{outline:3px solid var\(--focus\)/);
  assert.equal(identifiant(CONTRAT), identifiant(CONTRAT));
  assert.ok(identifiant(CONTRAT).length <= 51);
});

// ---- Vue périmée, modifiée, absente ; champ altéré ----

/** Projet temporaire avec la vue écrite après k dépôts. */
function projetAvecVue(k) {
  const { projet, dossier } = projetAuMoment(k);
  const { contenus } = vueDe(dossier);
  for (const [f, texte] of Object.entries(contenus)) writeFileSync(join(dossier, f), texte);
  return { projet, dossier };
}

test('vérification : vue à jour, puis périmée après un dépôt, modifiée à la main, absente', () => {
  const { dossier } = projetAvecVue(15);
  const etat = () => etatVue(dossier, { rattachement: RATTACHEMENT });
  assert.deepStrictEqual(etat(), { etat: 'à jour', ecarts: [], depuis: 15, champ: 15 });
  const { date, ...partiel } = CHAMPS.essai.depots[15];
  assert.deepStrictEqual(deposer(dossier, partiel, { contexte: CONTEXTE, date }).erreurs, []);
  const perimee = etat();
  assert.equal(perimee.etat, 'périmée');
  attendreEcart(perimee.ecarts, /^vue\.md périmée : tirée du champ au n° 15, champ au n° 16$/);
  for (const [f, texte] of Object.entries(vueDe(dossier).contenus)) writeFileSync(join(dossier, f), texte);
  assert.equal(etat().etat, 'à jour');
  const md = readFileSync(join(dossier, 'vue.md'), 'utf8');
  const retouchee = md.replace(/(### ABCDE-3620-CA03 · ABCDE-3620:C3) — prouvé\n/, '$1 — en écart\n');
  assert.notEqual(retouchee, md);
  writeFileSync(join(dossier, 'vue.md'), retouchee);
  attendreEcart(etat().ecarts, /^vue\.md modifiée à la main, ou tirée d'autres documents du ticket$/);
  rmSync(join(dossier, 'vue.md'));
  const us = readFileSync(join(dossier, 'us.md'), 'utf8');
  assert.ok(us.includes('renvoie CommandeDto, inchangée.'));
  writeFileSync(join(dossier, 'us.md'), us.replace('renvoie CommandeDto, inchangée.', 'renvoie CommandeDto, inchangée, sans lignes.'));
  const v = etat();
  assert.equal(v.etat, 'modifiée', 'vue.html tirée d\'autres documents ; vue.md absente');
  attendreEcart(v.ecarts, /^vue\.md absente : node vue\.mjs generer /);
  attendreEcart(v.ecarts, /^vue\.html modifiée à la main, ou tirée d'autres documents du ticket$/);
});

test('vérification : un champ altéré ne donne pas de vue, et rien n\'est écrit', () => {
  const { dossier } = projetAvecVue(TOUS);
  const avant = readFileSync(join(dossier, 'vue.md'), 'utf8');
  const lignes = readFileSync(join(dossier, 'champ.jsonl'), 'utf8').split('\n');
  const ligne = lignes.findIndex((l) => l.includes('pas de SQL natif'));
  lignes[ligne] = lignes[ligne].replace('pas de SQL natif', 'SQL natif accepté');
  writeFileSync(join(dossier, 'champ.jsonl'), lignes.join('\n'));
  const { erreurs } = construireVue(dossier, { rattachement: RATTACHEMENT });
  assert.equal(erreurs[0], 'champ altéré, vue non générée');
  attendreEcart(erreurs, /empreinte du précédent différente/);
  const r = spawnSync(process.execPath, [OUTIL, 'generer', dossier, '--rattachement', ecrireRattachement()], { encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /^REFUS {2}champ altéré, vue non générée$/m);
  assert.equal(readFileSync(join(dossier, 'vue.md'), 'utf8'), avant);
  assert.equal(etatVue(dossier, { rattachement: RATTACHEMENT }).etat, 'champ altéré');
});

test('déterminisme : même champ et mêmes documents, même vue ; fins de ligne CRLF sans effet', () => {
  const { dossier } = projetAuMoment(TOUS);
  const une = vueDe(dossier).contenus;
  for (const f of ['us.md', `${CLE}.feature`]) writeFileSync(join(dossier, f), readFileSync(join(dossier, f), 'utf8').replace(/\n/g, '\r\n'));
  assert.deepStrictEqual(vueDe(dossier).contenus, une);
  assert.deepStrictEqual(contenusVue(construireVue(dossier, { rattachement: RATTACHEMENT }).vue), une);
});

// ---- Ligne de commande ----

let rattachementEcrit = null;
function ecrireRattachement() {
  if (rattachementEcrit) return rattachementEcrit;
  const d = mkdtempSync(join(tmpdir(), 'rattachement-'));
  rattachementEcrit = join(d, 'rattachement.json');
  writeFileSync(rattachementEcrit, JSON.stringify(RATTACHEMENT));
  return rattachementEcrit;
}

test('ligne de commande : generer, --noeud, --json, verifier, codes de sortie', () => {
  const { projet, dossier } = projetAuMoment(TOUS);
  const lancer = (...args) => spawnSync(process.execPath, [OUTIL, ...args, '--rattachement', ecrireRattachement()], { encoding: 'utf8' });
  assert.equal(lancer('verifier', dossier).status, 1, 'vue absente');
  const g = lancer('generer', dossier);
  assert.equal(g.status, 0, g.stderr);
  assert.match(g.stdout, /^vue de ABCDE-3620 : 31 ancres \(30 du ticket, 1 née du champ\), 1 à traiter ; champ au n° 22 ; /);
  assert.equal(readFileSync(join(dossier, 'vue.md'), 'utf8'), vueDe(DOSSIER_ESSAI).contenus['vue.md']);
  const v = lancer('verifier', dossier);
  assert.equal(v.status, 0, v.stderr);
  assert.match(v.stdout, /^vue de ABCDE-3620 à jour : vue\.html, vue\.md, tirées du champ au n° 22$/m);
  const n = lancer('generer', dossier, '--noeud', `${CLE}-2`);
  assert.equal(n.status, 0, n.stderr);
  assert.equal(`${n.stdout}`, vueDuNoeud(vueDe(dossier).vue, `${CLE}-2`));
  const j = JSON.parse(lancer('generer', dossier, '--json').stdout);
  assert.deepStrictEqual([j.format, j.cle, j.noeud, j.ancres.length, j.champ.enregistrements], ['skill-ticket.vue/1', CLE, null, 31, 22]);
  assert.equal(JSON.parse(lancer('generer', dossier, '--json', '--noeud', `${CLE}-1.1`).stdout).noeud, `${CLE}-1.1`);
  const hors = lancer('generer', dossier, '--noeud', 'ABCDE-9999');
  assert.equal(hors.status, 1);
  assert.match(hors.stderr, /REFUS {2}nœud ABCDE-9999 hors de l'arbre ABCDE-3620/);
  assert.equal(lancer('generer').status, 2);
  assert.equal(lancer('generer', dossier, '--inconnue').status, 2);
  assert.equal(lancer('verifier', dossier, '--noeud', CLE).status, 2);
  const autre = join(projet, 'docs', 'demandes', 'AUTRE-1');
  mkdirSync(autre, { recursive: true });
  assert.match(lancer('generer', autre).stderr, /le dossier doit être celui de la clé ABCDE-3620/);
  // Avant le premier dépôt, le dossier peut manquer : la vue d'un nœud se lit, les fichiers ne s'écrivent pas.
  const neuf = join(mkdtempSync(join(tmpdir(), 'neuf-')), 'docs', 'demandes', CLE);
  const lu = lancer('generer', neuf, '--noeud', `${CLE}-1.1`);
  assert.equal(lu.status, 0, lu.stderr);
  assert.match(lu.stdout, /Champ vide : aucun enregistrement encore/);
  const ecrit = lancer('generer', neuf);
  assert.equal(ecrit.status, 1);
  assert.match(ecrit.stderr, /REFUS {2}dossier absent/);
});
