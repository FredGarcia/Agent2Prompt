#!/usr/bin/env node
// Contrôle des trois kits d'un ticket, dev, test et démo, et de sa remise à Agent2Test
// (generateur-skill-ticket, D4, critère P9). Le skill racine en livre une copie, outils/verifier-kits.mjs,
// à côté de verifier-documents.mjs, dont elle lit les US et les scénarios.
//
// Usage : node verifier-kits.mjs <dossier de la demande> --rattachement <rattachement.json> [--projet <racine>] [--depot]
//   <dossier>        docs/demandes/<CLÉ>, dont kits/ contient dev.json, test.json, demo.json et remise-agent2test.json ;
//   --rattachement   le fichier du skill racine qui décrit l'arbre : nœuds, couches, critères, images de l'objectif ;
//   --projet         la racine du projet, d'où partent les chemins des kits (par défaut : trois niveaux au-dessus du dossier) ;
//   --depot          vérifier aussi, dans le dépôt Git du projet, la branche et chaque commit du kit dev.
//
// Chaque kit est un manifeste fermé : un champ inconnu ou absent est un écart. Chaque fichier qu'il cite
// existe et a l'empreinte sha256 annoncée ; chaque élément exigé est là ; la remise suit le format fermé
// agent2test.remise/1 d'Agent2Test et concorde avec us.md, le fichier Gherkin et le kit dev. La remise se
// rédige en dernier, au commit de tête de la branche : elle n'est pas un fichier du kit dev, et les kits ne
// se commitent pas avant la campagne, pour que le commit remis reste la tête de la branche (Agent2Test,
// module echange, § 4). Rien n'est modifié. Code de sortie 1 au moindre écart. Node 20 ou plus récent,
// modules natifs, git pour --depot.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { criteresDeUs, scenariosDeFeature } from './verifier-documents.mjs';

export const FORMAT_KIT = 'skill-ticket.kit/1';
export const FORMAT_REMISE = 'agent2test.remise/1';
const CHAMPS = {
  dev: ['format', 'kit', 'cle', 'branche', 'commits', 'remises', 'remise_agent2test', 'fichiers'],
  test: ['format', 'kit', 'cle', 'plan', 'demande', 'tests', 'matrice', 'campagne', 'fichiers'],
  demo: ['format', 'kit', 'cle', 'parcours', 'scenarios', 'donnees', 'commandes', 'captures', 'fichiers'],
};
const CHAMPS_REMISE = ['format', 'id', 'date', 'demande', 'racine', 'plan', 'commit', 'changements', 'criteres', 'jouables', 'nonJouables', 'roles', 'prealables'];
const SHA256 = /^[0-9a-f]{64}$/;
const SHA1 = /^[0-9a-f]{40}$/;
const DATE_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

const lireTexte = (chemin) => readFileSync(chemin, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
const empreinte = (chemin) => createHash('sha256').update(readFileSync(chemin)).digest('hex');
const cheminSur = (rel) => typeof rel === 'string' && rel.length > 0 && !/[\\\0:]/.test(rel) && !rel.startsWith('/') && rel.split('/').every((s) => s !== '' && s !== '.' && s !== '..');
const estObjet = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** Champs inconnus ou absents d'un objet fermé. */
function ferme(objet, champs, nom, ecarts) {
  if (!estObjet(objet)) {
    ecarts.push(`${nom} : objet attendu`);
    return false;
  }
  for (const k of Object.keys(objet)) if (!champs.includes(k)) ecarts.push(`${nom} : champ inconnu ${k}`);
  for (const k of champs) if (!(k in objet)) ecarts.push(`${nom} : champ absent ${k}`);
  return true;
}

/** Les fichiers déclarés d'un kit : chemin sûr, présent, empreinte juste. Renvoie l'ensemble des chemins déclarés. */
function fichiersDeclares(kit, projet, nom, ecarts) {
  const declares = new Set();
  if (!Array.isArray(kit.fichiers)) {
    ecarts.push(`${nom} : fichiers doit être une liste`);
    return declares;
  }
  for (const f of kit.fichiers) {
    if (!ferme(f, ['chemin', 'sha256'], `${nom}, fichier`, ecarts)) continue;
    if (!cheminSur(f.chemin)) {
      ecarts.push(`${nom} : chemin refusé, ${JSON.stringify(f.chemin)}`);
      continue;
    }
    declares.add(f.chemin);
    const absolu = join(projet, ...f.chemin.split('/'));
    if (!existsSync(absolu)) ecarts.push(`${nom} : ${f.chemin} absent`);
    else if (!SHA256.test(f.sha256 ?? '') || empreinte(absolu) !== f.sha256) ecarts.push(`${nom} : ${f.chemin}, empreinte différente de celle du kit`);
  }
  return declares;
}

const exiger = (declares, chemin, nom, ecarts) => {
  if (!declares.has(chemin)) ecarts.push(`${nom} : ${chemin} cité mais absent de ses fichiers`);
};

function git(projet, ...args) {
  try {
    return execFileSync('git', ['-C', projet, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

/** Contrôle de la remise au format agent2test.remise/1, puis de sa concordance avec les documents. */
export function controlerRemise(remise, contexte) {
  const { cle, projet, criteres, scenarios, dernierCommit } = contexte;
  const ecarts = [];
  const nom = 'remise agent2test';
  if (!ferme(remise, CHAMPS_REMISE, nom, ecarts)) return ecarts;
  const dossier = `docs/demandes/${cle}`;
  if (remise.format !== FORMAT_REMISE) ecarts.push(`${nom} : format ${remise.format}, attendu ${FORMAT_REMISE}`);
  if (!new RegExp(`^R-${cle}-\\d+$`).test(remise.id ?? '')) ecarts.push(`${nom} : identifiant ${remise.id}, attendu R-${cle}-<n>`);
  if (!DATE_UTC.test(remise.date ?? '')) ecarts.push(`${nom} : date ${remise.date}, attendu ISO 8601 en UTC`);
  if (ferme(remise.demande, ['cle', 'texte'], `${nom}, demande`, ecarts)) {
    if (remise.demande.cle !== cle) ecarts.push(`${nom} : demande.cle ${remise.demande.cle}, attendu ${cle}`);
    if (typeof remise.demande.texte !== 'string' || remise.demande.texte.trim() === '') ecarts.push(`${nom} : demande.texte vide`);
  }
  if (typeof remise.racine !== 'string' || remise.racine === '') ecarts.push(`${nom} : racine vide`);
  if (ferme(remise.plan, ['adaptateur', 'dossier', 'sources'], `${nom}, plan`, ecarts)) {
    if (!['agent-tdd-jira', 'annexe-a'].includes(remise.plan.adaptateur)) ecarts.push(`${nom} : adaptateur ${remise.plan.adaptateur} inconnu`);
    if (remise.plan.dossier !== dossier) ecarts.push(`${nom} : plan.dossier ${remise.plan.dossier}, attendu ${dossier}`);
    const sources = Array.isArray(remise.plan.sources) ? remise.plan.sources : [];
    if (sources.length === 0) ecarts.push(`${nom} : plan sans source`);
    for (const s of sources) {
      if (!ferme(s, ['chemin', 'empreinte'], `${nom}, source`, ecarts)) continue;
      if (!cheminSur(s.chemin) || !s.chemin.startsWith(`${dossier}/`)) ecarts.push(`${nom} : source hors de ${dossier}, ${s.chemin}`);
      else if (!SHA256.test(s.empreinte ?? '')) ecarts.push(`${nom} : empreinte mal formée pour ${s.chemin}`);
      else if (!existsSync(join(projet, ...s.chemin.split('/'))) || empreinte(join(projet, ...s.chemin.split('/'))) !== s.empreinte) ecarts.push(`${nom} : ${s.chemin}, empreinte différente du fichier`);
    }
    const attendues = [`${dossier}/us.md`, `${dossier}/${cle}.feature`];
    if (sources.map((s) => s.chemin).sort().join(',') !== attendues.sort().join(',')) ecarts.push(`${nom} : sources attendues, us.md et ${cle}.feature`);
  }
  if (!SHA1.test(remise.commit ?? '')) ecarts.push(`${nom} : commit mal formé`);
  else if (dernierCommit && remise.commit !== dernierCommit) ecarts.push(`${nom} : commit ${remise.commit.slice(0, 7)}, alors que le kit dev finit par ${dernierCommit.slice(0, 7)}`);
  if (ferme(remise.changements, ['git'], `${nom}, changements`, ecarts) && (typeof remise.changements.git !== 'string' || remise.changements.git === '')) ecarts.push(`${nom} : plage de changements vide`);

  // Concordance avec us.md et le fichier Gherkin.
  const ids = [...criteres.entries()].filter(([, c]) => !c.statut.startsWith('retiré'));
  const remis = Array.isArray(remise.criteres) ? remise.criteres : [];
  for (const c of remis) ferme(c, ['id', 'statut'], `${nom}, critère`, ecarts);
  if (remis.map((c) => `${c.id}=${c.statut}`).sort().join('\n') !== ids.map(([id, c]) => `${id}=${c.statut}`).sort().join('\n')) {
    ecarts.push(`${nom} : critères et statuts différents de ceux de us.md`);
  }
  const jouables = scenarios.filter((s) => motifNonJouable(s, criteres) === null).map((s) => s.id);
  const autres = scenarios.filter((s) => !jouables.includes(s.id)).map((s) => s.id);
  if (!Array.isArray(remise.jouables) || [...remise.jouables].sort().join(',') !== [...jouables].sort().join(',')) ecarts.push(`${nom} : jouables ${(Array.isArray(remise.jouables) ? remise.jouables : []).join(', ') || 'aucun'}, attendu ${jouables.join(', ') || 'aucun'} (règles du module plan d'Agent2Test)`);
  const nonJouables = Array.isArray(remise.nonJouables) ? remise.nonJouables : [];
  for (const nj of nonJouables) if (ferme(nj, ['scenario', 'motif'], `${nom}, non jouable`, ecarts) && (typeof nj.motif !== 'string' || nj.motif === '')) ecarts.push(`${nom} : ${nj.scenario} non jouable sans motif`);
  if (nonJouables.map((nj) => nj.scenario).sort().join(',') !== [...autres].sort().join(',')) ecarts.push(`${nom} : non jouables attendus, ${autres.join(', ') || 'aucun'}`);
  const roles = [...new Set(scenarios.flatMap((s) => s.etiquettes.filter((e) => e.startsWith('@role-')).map((e) => e.slice('@role-'.length))))].sort();
  if (!Array.isArray(remise.roles) || [...remise.roles].sort().join(',') !== roles.join(',')) ecarts.push(`${nom} : rôles attendus, ${roles.join(', ') || 'aucun'} (étiquettes @role-)`);
  const batchs = [...new Set(scenarios.filter((s) => jouables.includes(s.id)).flatMap((s) => s.etiquettes.filter((e) => e.startsWith('@batch-')).map((e) => e.slice('@batch-'.length))))].sort();
  if (!Array.isArray(remise.prealables) || [...remise.prealables].sort().join(',') !== batchs.join(',')) ecarts.push(`${nom} : préalables attendus, ${batchs.join(', ') || 'aucun'} (étiquettes @batch- des scénarios jouables)`);
  return ecarts;
}

/**
 * Prévision d'Agent2Test pour un scénario (module plan, section 2) : null s'il est jouable, sinon le motif.
 * Un scénario @role-<nom> reste jouable, sous réserve des rôles que la session déclare.
 */
export function motifNonJouable(scenario, criteres) {
  const e = scenario.etiquettes;
  if (e.includes('@propose')) return 'proposé, non validé';
  if (e.includes('@en-attente')) return 'en attente';
  if (e.includes('@back') && !e.includes('@front')) return 'limité au back';
  if (e.includes('@redemarrage') || e.includes('@ecriture-base')) return 'non automatisable';
  const couverts = e.filter((x) => /^@[A-Z][A-Z0-9_]+-\d+-CA\d{2,}$/.test(x)).map((x) => criteres.get(x.slice(1))?.statut);
  if (!couverts.includes('validé')) return 'critère non validé';
  return null;
}

/** Scénarios d'un parcours de démonstration : ceux que voit une personne, @front, validés, ni proposés ni en attente. */
export const scenariosDemontrables = (scenarios, criteres) =>
  scenarios
    .filter((s) => s.etiquettes.includes('@front') && !s.etiquettes.includes('@propose') && !s.etiquettes.includes('@en-attente'))
    .filter((s) => s.etiquettes.some((x) => criteres.get(x.slice(1))?.statut === 'validé'))
    .map((s) => s.id);

/** Contrôle des trois kits d'une demande. Renvoie { ecarts, bilan }. */
export function controlerKits(dossier, rattachement, { projet = resolve(dossier, '..', '..', '..'), depot = false } = {}) {
  const cle = rattachement.cle;
  const ecarts = [];
  const lireKit = (nom) => {
    const chemin = join(dossier, 'kits', `${nom}.json`);
    if (!existsSync(chemin)) {
      ecarts.push(`kit ${nom} absent : ${chemin}`);
      return null;
    }
    try {
      return JSON.parse(lireTexte(chemin));
    } catch (e) {
      ecarts.push(`kit ${nom} illisible : ${e.message}`);
      return null;
    }
  };
  const base = `docs/demandes/${cle}`;
  const criteres = existsSync(join(dossier, 'us.md')) ? criteresDeUs(lireTexte(join(dossier, 'us.md'))) : new Map();
  const scenarios = existsSync(join(dossier, `${cle}.feature`)) ? scenariosDeFeature(lireTexte(join(dossier, `${cle}.feature`))) : [];
  if (criteres.size === 0 || scenarios.length === 0) ecarts.push(`documents de ${cle} absents ou vides : us.md et ${cle}.feature précèdent les kits`);
  const idsScenarios = new Set(scenarios.map((s) => s.id));
  const feuilles = rattachement.noeuds.filter((n) => n.nature === 'feuille' || n.nature === 'racine et feuille');
  const tousLesNoeuds = [{ reference: cle, dossier: `${base}/` }, ...rattachement.noeuds.filter((n) => n.reference !== cle)];

  // Kit dev.
  const dev = lireKit('dev');
  let dernierCommit = null;
  if (dev && ferme(dev, CHAMPS.dev, 'kit dev', ecarts)) {
    if (dev.format !== FORMAT_KIT || dev.kit !== 'dev' || dev.cle !== cle) ecarts.push(`kit dev : en-tête attendu ${FORMAT_KIT}, dev, ${cle}`);
    const declares = fichiersDeclares(dev, projet, 'kit dev', ecarts);
    if (typeof dev.branche !== 'string' || !dev.branche.includes(cle)) ecarts.push(`kit dev : la branche doit porter la clé ${cle}`);
    // Commits : un slot chacun (orchestrateur, D4.INV-2), dans l'ordre de la branche ; ceux de la racine
    // portent les documents de la clé, ceux d'une feuille citent leur sous-ticket.
    const commits = Array.isArray(dev.commits) ? dev.commits : [];
    const titre = new RegExp(`^${cle}( S\\d{2,})? : \\[É[1-7]-[A-Z0-9]+\\] (feat|fix|refactor|test|chore|docs)\\([^)]+\\): \\S`);
    for (const c of commits) {
      if (!ferme(c, ['sha', 'sous_ticket', 'titre'], 'kit dev, commit', ecarts)) continue;
      if (!SHA1.test(c.sha ?? '')) ecarts.push(`kit dev : commit mal formé, ${c.sha}`);
      if (!titre.test(c.titre ?? '')) ecarts.push(`kit dev : titre de commit hors format, « ${c.titre} »`);
      if (c.sous_ticket !== cle && !feuilles.some((f) => f.reference === c.sous_ticket)) ecarts.push(`kit dev : ${c.sous_ticket} n'est ni la racine ni une feuille de l'arbre`);
    }
    for (const f of feuilles) if (!commits.some((c) => c.sous_ticket === f.reference)) ecarts.push(`kit dev : aucun commit pour ${f.reference}`);
    dernierCommit = commits.at(-1)?.sha ?? null;
    const remises = Array.isArray(dev.remises) ? dev.remises : [];
    for (const n of tousLesNoeuds) {
      const r = `${n.dossier}remise.md`;
      if (!remises.includes(r)) ecarts.push(`kit dev : remise de ${n.reference} absente, ${r}`);
    }
    for (const r of remises) exiger(declares, r, 'kit dev', ecarts);
    if (depot) {
      if (!git(projet, 'rev-parse', '--git-dir')) ecarts.push(`kit dev : ${projet} n'est pas un dépôt Git`);
      else {
        const pointe = git(projet, 'rev-parse', '--verify', '--quiet', `refs/heads/${dev.branche}`)?.trim();
        if (!pointe) ecarts.push(`kit dev : branche ${dev.branche} absente du dépôt`);
        else if (dernierCommit && pointe !== dernierCommit) ecarts.push(`kit dev : la branche ${dev.branche} finit par ${pointe.slice(0, 7)}, le kit par ${String(dernierCommit).slice(0, 7)}`);
        // Agent2Test ouvre la campagne sur une racine dont HEAD est le commit remis, sans fichier suivi modifié.
        const tete = git(projet, 'rev-parse', 'HEAD')?.trim();
        if (dernierCommit && tete !== dernierCommit) ecarts.push(`kit dev : HEAD vaut ${String(tete).slice(0, 7)}, et non le dernier commit du kit, ${String(dernierCommit).slice(0, 7)}`);
        const modifies = (git(projet, 'status', '--porcelain', '--untracked-files=no') ?? '').split('\n').filter(Boolean);
        for (const m of modifies) ecarts.push(`kit dev : fichier suivi modifié depuis le dernier commit, ${m.slice(3)}`);
        commits.forEach((c, i) => {
          const message = git(projet, 'log', '-1', '--format=%B', c.sha);
          if (message === null) {
            ecarts.push(`kit dev : commit ${String(c.sha).slice(0, 7)} absent du dépôt`);
            return;
          }
          const [premiere, ...corps] = message.replace(/\r\n/g, '\n').trimEnd().split('\n');
          if (premiere !== c.titre) ecarts.push(`kit dev : commit ${c.sha.slice(0, 7)}, titre différent dans le dépôt`);
          if (c.sous_ticket !== cle && !corps.some((l) => l.trim() === `Sous-ticket : ${c.sous_ticket}`)) ecarts.push(`kit dev : commit ${c.sha.slice(0, 7)} sans la ligne « Sous-ticket : ${c.sous_ticket} »`);
          if (pointe && git(projet, 'merge-base', '--is-ancestor', c.sha, pointe) === null) ecarts.push(`kit dev : commit ${c.sha.slice(0, 7)} hors de la branche ${dev.branche}`);
          if (i > 0 && SHA1.test(commits[i - 1].sha ?? '') && git(projet, 'merge-base', '--is-ancestor', commits[i - 1].sha, c.sha) === null) ecarts.push(`kit dev : commit ${c.sha.slice(0, 7)} listé après ${commits[i - 1].sha.slice(0, 7)}, qu'il ne suit pas dans l'historique`);
        });
      }
    }
    // Remise à Agent2Test.
    const cheminRemise = typeof dev.remise_agent2test === 'string' && cheminSur(dev.remise_agent2test) ? join(projet, ...dev.remise_agent2test.split('/')) : null;
    if (!cheminRemise || !existsSync(cheminRemise)) ecarts.push(`remise agent2test absente : ${dev.remise_agent2test}`);
    else {
      try {
        ecarts.push(...controlerRemise(JSON.parse(lireTexte(cheminRemise)), { cle, projet, criteres, scenarios, dernierCommit }));
      } catch (e) {
        ecarts.push(`remise agent2test illisible : ${e.message}`);
      }
    }
  }

  // Kit test.
  const test = lireKit('test');
  if (test && ferme(test, CHAMPS.test, 'kit test', ecarts)) {
    if (test.format !== FORMAT_KIT || test.kit !== 'test' || test.cle !== cle) ecarts.push(`kit test : en-tête attendu ${FORMAT_KIT}, test, ${cle}`);
    const declares = fichiersDeclares(test, projet, 'kit test', ecarts);
    const plan = [`${base}/us.md`, `${base}/${cle}.feature`];
    if (!Array.isArray(test.plan) || [...test.plan].sort().join(',') !== [...plan].sort().join(',')) ecarts.push(`kit test : plan attendu, ${plan.join(' et ')}`);
    for (const p of plan) exiger(declares, p, 'kit test', ecarts);
    if (test.demande !== `${base}/demande.json`) ecarts.push(`kit test : demande attendue, ${base}/demande.json`);
    exiger(declares, test.demande, 'kit test', ecarts);
    const tests = Array.isArray(test.tests) ? test.tests : [];
    if (tests.length === 0) ecarts.push('kit test : aucun test');
    for (const t of tests) {
      if (!ferme(t, ['chemin', 'scenarios'], 'kit test, test', ecarts)) continue;
      exiger(declares, t.chemin, 'kit test', ecarts);
      const source = cheminSur(t.chemin) && existsSync(join(projet, ...t.chemin.split('/'))) ? lireTexte(join(projet, ...t.chemin.split('/'))) : null;
      for (const s of Array.isArray(t.scenarios) ? t.scenarios : []) {
        if (!idsScenarios.has(s)) ecarts.push(`kit test : ${t.chemin} cite ${s}, absent du fichier Gherkin`);
        // Un test porte l'étiquette de son scénario (agent-tdd-jira, point E3) : @Tag("<id>") ou describe('<id> …').
        else if (source !== null && !source.includes(s)) ecarts.push(`kit test : ${t.chemin} ne porte pas l'étiquette de ${s}`);
      }
    }
    for (const s of scenarios.filter((x) => !x.etiquettes.includes('@en-attente') && !x.etiquettes.includes('@propose'))) {
      if (!tests.some((t) => Array.isArray(t.scenarios) && t.scenarios.includes(s.id))) ecarts.push(`kit test : aucun test pour ${s.id}`);
    }
    exiger(declares, test.matrice, 'kit test', ecarts);
    const matrice = typeof test.matrice === 'string' && cheminSur(test.matrice) && existsSync(join(projet, ...test.matrice.split('/'))) ? lireTexte(join(projet, ...test.matrice.split('/'))) : '';
    for (const s of scenarios) if (!matrice.includes(s.id)) ecarts.push(`kit test : la matrice ne cite pas ${s.id}`);
    if (!ferme(test.campagne, ['adaptateur', 'dossier'], 'kit test, campagne', ecarts) || test.campagne.adaptateur !== 'agent-tdd-jira' || test.campagne.dossier !== base) ecarts.push(`kit test : campagne attendue, adaptateur agent-tdd-jira, dossier ${base}`);
  }

  // Kit démo.
  const demo = lireKit('demo');
  if (demo && ferme(demo, CHAMPS.demo, 'kit démo', ecarts)) {
    if (demo.format !== FORMAT_KIT || demo.kit !== 'demo' || demo.cle !== cle) ecarts.push(`kit démo : en-tête attendu ${FORMAT_KIT}, demo, ${cle}`);
    const declares = fichiersDeclares(demo, projet, 'kit démo', ecarts);
    exiger(declares, demo.parcours, 'kit démo', ecarts);
    const parcours = typeof demo.parcours === 'string' && cheminSur(demo.parcours) && existsSync(join(projet, ...demo.parcours.split('/'))) ? lireTexte(join(projet, ...demo.parcours.split('/'))) : '';
    const visibles = scenariosDemontrables(scenarios, criteres);
    const listes = Array.isArray(demo.scenarios) ? demo.scenarios : [];
    if ([...listes].sort().join(',') !== [...visibles].sort().join(',')) ecarts.push(`kit démo : scénarios attendus, ${visibles.join(', ') || 'aucun'} (ceux que voit une personne, @front, validés)`);
    for (const s of listes) if (!parcours.includes(s)) ecarts.push(`kit démo : le parcours ne cite pas ${s}`);
    for (const d of Array.isArray(demo.donnees) ? demo.donnees : []) exiger(declares, d, 'kit démo', ecarts);
    if (!Array.isArray(demo.commandes) || demo.commandes.length === 0 || demo.commandes.some((c) => typeof c !== 'string' || c.trim() === '')) ecarts.push('kit démo : commandes de lancement absentes');
    const captures = Array.isArray(demo.captures) ? demo.captures : [];
    for (const c of captures) {
      if (!ferme(c, ['scenario', 'capture', 'image_objectif'], 'kit démo, capture', ecarts)) continue;
      if (!idsScenarios.has(c.scenario)) ecarts.push(`kit démo : capture pour ${c.scenario}, absent du fichier Gherkin`);
      exiger(declares, c.capture, 'kit démo', ecarts);
      if (c.image_objectif !== null) exiger(declares, c.image_objectif, 'kit démo', ecarts);
    }
    for (const n of rattachement.noeuds) {
      for (const image of n.images ?? []) {
        if (!captures.some((c) => c.image_objectif === image)) ecarts.push(`kit démo : aucune capture comparée à l'image de l'objectif ${image} (${n.reference})`);
      }
    }
  }

  return {
    ecarts,
    bilan: `${cle} : kits dev, test et démo complets et vérifiés${depot ? ', commits et branche vérifiés dans le dépôt' : ''} ; remise ${FORMAT_REMISE} conforme`,
  };
}

/** Ligne de commande. Renvoie le code de sortie. */
export function principal(argv, sortie = console.log, erreur = console.error) {
  const option = (nom) => {
    const i = argv.indexOf(nom);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const dossier = argv[0];
  const cheminRattachement = option('--rattachement');
  if (!dossier || dossier.startsWith('--') || !cheminRattachement) {
    erreur('Usage : node verifier-kits.mjs <dossier de la demande> --rattachement <rattachement.json> [--projet <racine>] [--depot]');
    return 2;
  }
  let rattachement;
  try {
    rattachement = JSON.parse(lireTexte(cheminRattachement));
  } catch (e) {
    erreur(`rattachement illisible : ${e.message}`);
    return 2;
  }
  const projet = option('--projet') ? resolve(option('--projet')) : undefined;
  const { ecarts, bilan } = controlerKits(dossier, rattachement, { ...(projet ? { projet } : {}), depot: argv.includes('--depot') });
  if (ecarts.length > 0) {
    for (const e of ecarts) erreur(`ÉCART  ${e}`);
    erreur(`${ecarts.length} écart${ecarts.length > 1 ? 's' : ''}`);
    return 1;
  }
  sortie(bilan);
  return 0;
}

const estPrincipal = process.argv[1] && fileURLToPath(import.meta.url).toLowerCase() === resolve(process.argv[1]).toLowerCase();
if (estPrincipal) process.exitCode = principal(process.argv.slice(2));
