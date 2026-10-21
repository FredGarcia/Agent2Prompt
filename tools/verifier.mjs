#!/usr/bin/env node
/**
 * Vérifie la cohérence structurelle de toutes les spécifications du dépôt.
 *
 * Usage, depuis la racine du dépôt :
 *
 *     node tools/verifier.mjs
 *
 * Pour chaque dossier de `specs/` qui contient un `manifest.json` :
 *
 * - le manifeste est un JSON valide, son nom est celui du dossier ;
 * - le point d'entrée existe, et son frontmatter porte le même nom et la même version ;
 * - chaque module existe, et son frontmatter porte le même statut et les mêmes dimensions ;
 * - chaque fichier partagé existe et a la version épinglée ; chaque skill référencé
 *   existe à la version citée ;
 * - une spécification transmissible a un `ENTETE-TRANSMISSION.md` contenant `{{VERSION}}` ;
 * - chaque bloc de code Markdown est fermé ;
 * - chaque invariant défini dans le point d'entrée (`**Dn.INV-k**`, `**SCn.INV-k**`) est
 *   repris dans au moins un module, et chaque invariant cité est défini (un identifiant
 *   préfixé par un nom de skill, comme `expert-java:D4.INV-2`, désigne un autre skill et
 *   n'est pas vérifié ici) ;
 * - `glossaire.md` est exactement celui que génère `tools/glossaire.mjs`.
 *
 * Les archives (`archives/`) ne sont pas vérifiées : elles sont figées.
 * Code de sortie 1 si une erreur est trouvée. Node 20 ou plus récent, modules natifs.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHEMIN_GLOSSAIRE, genererGlossaire } from './glossaire.mjs';

const racine = dirname(dirname(fileURLToPath(import.meta.url)));
const dossierSpecs = join(racine, 'specs');
const erreurs = [];
const lire = (chemin) => readFileSync(chemin, 'utf8');
const rel = (chemin) => relative(racine, chemin);

function frontmatter(texte) {
  const bloc = /^---\n([\s\S]*?)\n---/.exec(texte);
  if (!bloc) return {};
  const champs = {};
  for (const ligne of bloc[1].split('\n')) {
    const m = /^(\w+):\s*(.*)$/.exec(ligne);
    if (m) champs[m[1]] = m[2].trim();
  }
  return champs;
}

function fichiersMarkdown(dossier) {
  const resultat = [];
  for (const nom of readdirSync(dossier)) {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) {
      if (nom !== 'archives') resultat.push(...fichiersMarkdown(chemin));
    } else if (nom.endsWith('.md')) {
      resultat.push(chemin);
    }
  }
  return resultat;
}

const DEFINITION = /\*\*((?:D|SC)\d+\.INV-\d+)\*\*/g;
// Identifiant non précédé d'un préfixe de skill (`nom-du-skill:`) ni d'un autre caractère d'identifiant.
const CITATION = /(?<![\w:-])((?:D|SC)\d+\.INV-\d+)/g;

function definitions(texte) {
  return new Set([...texte.matchAll(DEFINITION)].map((m) => m[1]));
}

function verifierSpec(dossier) {
  const nomDossier = dossier.split('/').pop();
  const erreur = (message) => erreurs.push(`${nomDossier} : ${message}`);
  let manifeste;
  try {
    manifeste = JSON.parse(lire(join(dossier, 'manifest.json')));
  } catch (e) {
    erreur(`manifest.json illisible (${e.message})`);
    return;
  }
  if (manifeste.name !== nomDossier) erreur(`le manifeste s'appelle ${manifeste.name}`);

  const entree = join(dossier, manifeste.entry ?? 'SKILL.md');
  if (!existsSync(entree)) {
    erreur(`point d'entrée absent : ${manifeste.entry}`);
    return;
  }
  const texteEntree = lire(entree);
  const fm = frontmatter(texteEntree);
  if (fm.name !== manifeste.name) erreur(`frontmatter du point d'entrée : name = ${fm.name}`);
  if (fm.version !== manifeste.version) erreur(`version ${fm.version} dans le point d'entrée, ${manifeste.version} dans le manifeste`);

  const textesModules = [];
  for (const module of manifeste.modules ?? []) {
    const chemin = join(dossier, module.path);
    if (!existsSync(chemin)) {
      erreur(`module absent : ${module.path}`);
      continue;
    }
    const texte = lire(chemin);
    textesModules.push(texte);
    const fmModule = frontmatter(texte);
    if (fmModule.status && fmModule.status !== module.status) {
      erreur(`${module.path} : statut ${fmModule.status}, manifeste ${module.status}`);
    }
    if (fmModule.dimensions) {
      const dims = fmModule.dimensions.replace(/[[\]\s]/g, '').split(',').filter(Boolean).join(',');
      if (dims !== module.dimensions.join(',')) {
        erreur(`${module.path} : dimensions [${dims}], manifeste [${module.dimensions.join(',')}]`);
      }
    }
  }

  const definis = definitions(texteEntree);
  for (const partage of manifeste.shared ?? []) {
    const source = join(racine, partage.from);
    if (!existsSync(source)) {
      erreur(`fichier partagé absent : ${partage.from}`);
      continue;
    }
    const texte = lire(source);
    if (frontmatter(texte).version !== partage.version) {
      erreur(`${partage.from} n'est pas en version ${partage.version}`);
    }
    // Seuls les identifiants hors de l'espace local `Dn` sont importés (ceux du socle, `SCn`) :
    // un référentiel d'expert inclus définit aussi des `Dn`, qui masqueraient une faute de frappe locale.
    for (const id of definitions(texte)) if (!id.startsWith('D')) definis.add(id);
  }
  for (const reference of manifeste.references ?? []) {
    const chemin = join(dossierSpecs, reference.name, 'manifest.json');
    if (!existsSync(chemin)) {
      erreur(`skill référencé absent : ${reference.name}`);
    } else if (JSON.parse(lire(chemin)).version !== reference.version) {
      erreur(`${reference.name} n'est pas en version ${reference.version} dans le dépôt`);
    }
  }

  if (manifeste.transmissible !== false) {
    const entete = join(dossier, 'ENTETE-TRANSMISSION.md');
    if (!existsSync(entete)) erreur('ENTETE-TRANSMISSION.md absent');
    else if (!lire(entete).includes('{{VERSION}}')) erreur('ENTETE-TRANSMISSION.md sans {{VERSION}}');
  }

  for (const fichier of fichiersMarkdown(dossier)) {
    const clotures = lire(fichier).split('\n').filter((l) => /^\s*```/.test(l)).length;
    if (clotures % 2 !== 0) erreur(`${rel(fichier)} : bloc de code non fermé`);
  }

  // Invariants : couverture et citations.
  const definisLocaux = definitions(texteEntree);
  if (textesModules.length > 0) {
    const corpusModules = textesModules.join('\n');
    for (const id of definisLocaux) {
      if (!new RegExp(`(?<![\\w:-])${id.replace('.', '\\.')}(?!\\d)`).test(corpusModules)) {
        erreur(`${id} est défini mais repris dans aucun module`);
      }
    }
  }
  for (const texte of [texteEntree, ...textesModules]) {
    for (const [, id] of texte.matchAll(CITATION)) {
      if (!definis.has(id)) erreur(`${id} est cité mais n'est défini ni dans le point d'entrée ni dans un fichier partagé`);
    }
  }

  const nbModules = (manifeste.modules ?? []).length;
  return `${manifeste.name} ${manifeste.version} : ${nbModules} modules, ${definisLocaux.size} invariants`;
}

const bilans = [];
for (const nom of readdirSync(dossierSpecs).sort()) {
  const dossier = join(dossierSpecs, nom);
  if (statSync(dossier).isDirectory() && existsSync(join(dossier, 'manifest.json'))) {
    const bilan = verifierSpec(dossier);
    if (bilan) bilans.push(bilan);
  }
}
// Glossaire : il doit être exactement celui que génère tools/glossaire.mjs.
let glossaireAJour = false;
if (!existsSync(CHEMIN_GLOSSAIRE)) erreurs.push('glossaire.md : absent, lancer node tools/glossaire.mjs');
else if (lire(CHEMIN_GLOSSAIRE) !== genererGlossaire()) erreurs.push("glossaire.md : n'est plus à jour, lancer node tools/glossaire.mjs");
else glossaireAJour = true;

for (const bilan of bilans) console.log(`ok  ${bilan}`);
if (glossaireAJour) console.log('ok  glossaire.md à jour');
const uniques = [...new Set(erreurs)];
for (const message of uniques) console.error(`ERREUR  ${message}`);
if (uniques.length > 0) process.exit(1);
console.log(`${bilans.length} spécifications vérifiées, aucune erreur`);
