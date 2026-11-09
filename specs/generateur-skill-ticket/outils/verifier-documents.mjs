#!/usr/bin/env node
// Contrôle des documents de la clé Jira d'un arbre de skills de ticket (generateur-skill-ticket, D4,
// critère P8). Le skill racine en livre une copie, outils/verifier-documents.mjs, à côté de
// controler-criteres.mjs, le script d'agent-tdd-jira qu'elle lance.
//
// Usage : node verifier-documents.mjs <dossier de la demande> --rattachement <rattachement.json> [--controleur <controler-criteres.mjs>]
//   <dossier>        docs/demandes/<CLÉ>, qui contient demande.json, us.md et <CLÉ>.feature ;
//   --rattachement   le fichier du skill racine qui relie chaque critère de l'arbre à un critère <CLÉ>-CAnn ;
//   --controleur     le script d'agent-tdd-jira ; par défaut, controler-criteres.mjs à côté de ce script.
//
// Contrôles : le script d'agent-tdd-jira ne signale aucun écart ; demande.json suit le schéma version 1 et
// porte, parmi ses pièces, chaque image de l'objectif des feuilles ; chaque critère de la racine est repris
// mot pour mot sous son identifiant <CLÉ>-CAnn ; chaque critère d'un sous-ticket se rattache à un critère
// <CLÉ>-CAnn illustré par au moins un scénario, et, pour une feuille, par un scénario qui porte l'étiquette
// de sa couche. Rien n'est modifié. Code de sortie 1 au moindre écart. Node 20 ou plus récent, modules
// natifs uniquement.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const lire = (chemin) => readFileSync(chemin, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');

/** Lignes du tableau des critères de us.md : identifiant, énoncé, origine, statut. */
export function criteresDeUs(texte) {
  const criteres = new Map();
  const lignes = texte.split('\n');
  const cellules = (l) => l.split('|').slice(1, -1).map((c) => c.trim());
  for (let i = 0; i < lignes.length; i++) {
    if (!lignes[i].startsWith('|') || !/^\|[\s|:-]+\|$/.test(lignes[i + 1] ?? '')) continue;
    const entetes = cellules(lignes[i]);
    let j = i + 2;
    for (; j < lignes.length && lignes[j].startsWith('|'); j++) {
      if (entetes[0] !== 'CA') continue;
      const c = Object.fromEntries(entetes.map((e, k) => [e, cellules(lignes[j])[k] ?? '']));
      criteres.set(c.CA, { enonce: c['Énoncé'] ?? '', origine: c.Origine ?? '', statut: c.Statut ?? '' });
    }
    i = j - 1;
  }
  return criteres;
}

/** Scénarios d'un fichier Gherkin, avec leurs étiquettes, celles de la fonctionnalité comprises. */
export function scenariosDeFeature(texte) {
  const scenarios = [];
  let etiquettes = [];
  let communes = [];
  for (const brute of texte.split('\n')) {
    const ligne = brute.trim();
    if (ligne.startsWith('@')) {
      etiquettes.push(...ligne.split(/\s+/).filter((e) => e.startsWith('@')));
      continue;
    }
    if (ligne === '' || ligne.startsWith('#')) continue;
    if (/^Fonctionnalité\s*:/.test(ligne)) communes = etiquettes;
    const m = /^(Scénario|Exemple|Plan du [sS]cénario)\s*:\s*(.*)$/.exec(ligne);
    if (m) scenarios.push({ titre: m[2], etiquettes: [...communes, ...etiquettes] });
    etiquettes = [];
  }
  for (const s of scenarios) s.id = s.etiquettes.find((e) => /^@[A-Z][A-Z0-9_]+-\d+-S\d{2,}$/.test(e))?.slice(1);
  return scenarios;
}

/** Contrôle de demande.json, schéma version 1 d'agent-tdd-jira. */
function controlerDemande(demande, cle) {
  const ecarts = [];
  if (demande.schemaVersion !== 1) ecarts.push(`demande.json : schemaVersion ${demande.schemaVersion}, attendu 1`);
  if (typeof demande.source?.fichier !== 'string' || demande.source.fichier === '') ecarts.push('demande.json : source.fichier absent');
  if (demande.jira?.cle !== cle) ecarts.push(`demande.json : jira.cle ${demande.jira?.cle}, attendu ${cle}`);
  if (typeof demande.resume !== 'string' || demande.resume.trim() === '') ecarts.push('demande.json : résumé absent');
  if (typeof demande.description !== 'string') ecarts.push('demande.json : description absente');
  for (const champ of ['commentaires', 'pieces', 'limites']) if (!Array.isArray(demande[champ])) ecarts.push(`demande.json : ${champ} doit être une liste`);
  for (const p of Array.isArray(demande.pieces) ? demande.pieces : []) {
    if (typeof p.fichier !== 'string' || typeof p.type !== 'string') ecarts.push('demande.json : pièce sans type ou sans fichier');
  }
  return ecarts;
}

/**
 * Contrôle des documents d'une demande contre le rattachement de l'arbre. Renvoie { ecarts, bilan } ;
 * `controleur` : chemin du script d'agent-tdd-jira, lancé tel quel.
 */
export function controlerDocuments(dossier, rattachement, controleur) {
  const cle = rattachement.cle;
  const ecarts = [];
  if (basename(resolve(dossier)) !== cle) ecarts.push(`le dossier doit porter la clé ${cle} : ${dossier}`);
  const chemins = { demande: join(dossier, 'demande.json'), us: join(dossier, 'us.md'), feature: join(dossier, `${cle}.feature`) };
  for (const [nom, chemin] of Object.entries(chemins)) if (!existsSync(chemin)) ecarts.push(`${nom} absent : ${chemin}`);
  if (ecarts.length > 0) return { ecarts, bilan: null };

  // Le script d'agent-tdd-jira, sans écart.
  if (!controleur || !existsSync(controleur)) ecarts.push(`script d'agent-tdd-jira introuvable : ${controleur}`);
  else {
    const r = spawnSync(process.execPath, [controleur, dossier], { encoding: 'utf8' });
    if (r.status !== 0) {
      const details = (r.stdout ?? '').split('\n').filter((l) => l.startsWith('ÉCART')).map((l) => l.replace(/^ÉCART\s+/, ''));
      ecarts.push(...(details.length > 0 ? details.map((d) => `controler-criteres : ${d}`) : [`controler-criteres : ${(r.stderr || r.stdout || '').trim()}`]));
    }
  }

  let demande = null;
  try {
    demande = JSON.parse(lire(chemins.demande));
  } catch (e) {
    ecarts.push(`demande.json illisible : ${e.message}`);
  }
  if (demande) {
    ecarts.push(...controlerDemande(demande, cle));
    // Les images de l'objectif des sous-tickets sont des pièces de la demande, à côté de ses commentaires.
    const pieces = new Set((Array.isArray(demande.pieces) ? demande.pieces : []).flatMap((p) => [p.fichier, `docs/demandes/${cle}/${p.fichier}`]));
    for (const n of rattachement.noeuds) for (const image of n.images ?? []) if (!pieces.has(image)) ecarts.push(`demande.json : image de l'objectif ${image} (${n.reference}) absente des pièces`);
  }

  // Critères de la racine, repris mot pour mot.
  const criteres = criteresDeUs(lire(chemins.us));
  for (const c of rattachement.criteres) {
    const lu = criteres.get(c.ca);
    if (!lu) ecarts.push(`${c.ca} absent de us.md (critère ${c.critere})`);
    else {
      if (lu.enonce !== c.enonce) ecarts.push(`${c.ca} : énoncé différent du critère ${c.critere}, qui se reprend mot pour mot`);
      if (lu.origine !== 'repris') ecarts.push(`${c.ca} : origine « ${lu.origine} », attendu « repris »`);
    }
  }

  // Critères des sous-tickets : rattachés, et illustrés par un scénario, de leur couche pour une feuille.
  const scenarios = scenariosDeFeature(lire(chemins.feature));
  let rattaches = 0;
  for (const n of rattachement.noeuds) {
    for (const c of n.criteres) {
      if (c.ca.length === 0) {
        ecarts.push(`${n.reference}:${c.id} ne se rattache à aucun critère de ${cle}`);
        continue;
      }
      const illustres = scenarios.filter((s) => c.ca.some((ca) => s.etiquettes.includes(`@${ca}`)));
      const deSaCouche = n.etiquettes.length === 0 ? illustres : illustres.filter((s) => n.etiquettes.some((e) => s.etiquettes.includes(e)));
      if (illustres.length === 0) ecarts.push(`${n.reference}:${c.id} : aucun scénario n'illustre ${c.ca.join(' ou ')}`);
      else if (deSaCouche.length === 0) ecarts.push(`${n.reference}:${c.id} : aucun scénario de ${c.ca.join(' ou ')} ne porte ${n.etiquettes.join(' ou ')}`);
      else rattaches++;
    }
  }
  return {
    ecarts,
    bilan: `${cle} : documents conformes ; controler-criteres sans écart ; ${rattachement.criteres.length} critères repris ; ${rattaches} critères de sous-tickets rattachés et illustrés ; ${scenarios.length} scénarios`,
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
    erreur('Usage : node verifier-documents.mjs <dossier de la demande> --rattachement <rattachement.json> [--controleur <controler-criteres.mjs>]');
    return 2;
  }
  let rattachement;
  try {
    rattachement = JSON.parse(lire(cheminRattachement));
  } catch (e) {
    erreur(`rattachement illisible : ${e.message}`);
    return 2;
  }
  const controleur = option('--controleur') ?? join(dirname(fileURLToPath(import.meta.url)), 'controler-criteres.mjs');
  const { ecarts, bilan } = controlerDocuments(dossier, rattachement, controleur);
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
