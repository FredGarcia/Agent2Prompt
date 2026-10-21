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
 * - le registre des dimensions du point d'entrée donne à chaque dimension d'un module
 *   le statut que le manifeste donne à ce module ;
 * - chaque fichier partagé existe et a la version épinglée ; chaque skill référencé
 *   existe à la version citée ;
 * - une spécification transmissible a un `ENTETE-TRANSMISSION.md` contenant `{{VERSION}}`,
 *   et la transmission de sa version courante (`transmissions/<nom>-<version>.md`) existe
 *   et reste fidèle aux fichiers : même en-tête, mêmes fichiers dans le même ordre, même
 *   table d'intégrité ;
 * - chaque version précédente déclarée (`previousVersions`) a son archive, à la bonne
 *   version, et chaque archive est déclarée ;
 * - les points d'extension du manifeste (`extensionPoints`) sont ceux que définit le
 *   point d'entrée (`- **En**`) ;
 * - chaque bloc de code Markdown est fermé ;
 * - chaque invariant défini dans le point d'entrée (`**Dn.INV-k**`, `**SCn.INV-k**`) est
 *   repris dans au moins un module, et chaque invariant cité est défini ; un identifiant
 *   préfixé par un nom de skill, comme `java:D4.INV-2`, désigne un autre skill du dépôt
 *   et doit être défini dans son point d'entrée.
 *
 * Pour le dépôt :
 *
 * - `README.md` affiche chaque spécification à sa version courante, avec sa transmission,
 *   et son schéma ne montre aucune version périmée ; ses liens vers `specs/` et
 *   `transmissions/` aboutissent ;
 * - `glossaire.md` est exactement celui que génère `tools/glossaire.mjs`.
 *
 * Le contenu des archives (`archives/`) n'est pas vérifié : elles sont figées.
 * Code de sortie 1 si une erreur est trouvée. Node 20 ou plus récent, modules natifs.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembler, relire } from './bundle.mjs';
import { CHEMIN_GLOSSAIRE, genererGlossaire } from './glossaire.mjs';

const racine = dirname(dirname(fileURLToPath(import.meta.url)));
const dossierSpecs = join(racine, 'specs');
const erreurs = [];
const lire = (chemin) => readFileSync(chemin, 'utf8');
const rel = (chemin) => relative(racine, chemin);
const echapper = (texte) => texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const parNumero = (a, b) => Number(a.slice(1)) - Number(b.slice(1));

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
// Identifiant d'un autre skill, préfixé par son nom : `java:D4.INV-2`.
const CITATION_EXTERNE = /(?<![\w-])([a-z][a-z0-9-]*):((?:D|SC)\d+\.INV-\d+)/g;

function definitions(texte) {
  return new Set([...texte.matchAll(DEFINITION)].map((m) => m[1]));
}

/** Invariants définis par le point d'entrée d'un autre skill du dépôt, ou null s'il n'existe pas. */
const definitionsParSkill = new Map();
function definitionsDe(nom) {
  if (!definitionsParSkill.has(nom)) {
    const chemin = join(dossierSpecs, nom, 'SKILL.md');
    definitionsParSkill.set(nom, existsSync(chemin) ? definitions(lire(chemin)) : null);
  }
  return definitionsParSkill.get(nom);
}

/** Statut de chaque dimension d'après le registre du point d'entrée (colonne « Statut … »). */
function statutsDuRegistre(texte) {
  // Fin de section : le titre suivant, ou la fin du texte (`$` désignerait une fin de ligne en mode multiligne).
  const section = /^## \d+\. Registre des dimensions[^\n]*\n([\s\S]*?)(?=\n## |(?![\s\S]))/m.exec(texte);
  const statuts = new Map();
  if (!section) return statuts;
  const lignes = section[1].split('\n').filter((l) => l.startsWith('|'));
  if (lignes.length < 2) return statuts;
  const colonnes = (ligne) => ligne.split('|').slice(1, -1).map((c) => c.trim());
  const entetes = colonnes(lignes[0]);
  const iId = entetes.indexOf('ID');
  const iStatut = entetes.findIndex((c) => c.startsWith('Statut'));
  if (iId === -1 || iStatut === -1) return statuts;
  for (const ligne of lignes.slice(2)) {
    const c = colonnes(ligne);
    if (c[iId]) statuts.set(c[iId], c[iStatut]);
  }
  return statuts;
}

/** Contrôle que la transmission de la version courante redonne exactement les fichiers actuels. */
function verifierTransmission(dossier, manifeste, nomDossier, erreur) {
  const chemin = join(racine, 'transmissions', `${manifeste.name}-${manifeste.version}.md`);
  const consigne = `lancer node tools/bundle.mjs specs/${nomDossier} (si cette version est déjà publiée, monter d'abord la version : EVOLUTION.md, section 7)`;
  if (!existsSync(chemin)) {
    erreur(`${rel(chemin)} absente : ${consigne}`);
    return;
  }
  let attendu;
  try {
    attendu = assembler(dossier);
  } catch (e) {
    erreur(`transmission impossible à assembler : ${e.message}`);
    return;
  }
  const relu = relire(lire(chemin));
  const ecarts = [];
  if (relu.entete !== attendu.entete) ecarts.push('en-tête');
  const liste = (fichiers) => fichiers.map((f) => f.rel).join('\n');
  if (liste(relu.fichiers) !== liste(attendu.fichiers)) {
    ecarts.push('liste des fichiers');
  } else {
    relu.fichiers.forEach((f, i) => {
      if (f.contenu !== attendu.fichiers[i].contenu) ecarts.push(f.rel);
    });
  }
  const table = (lignes) => lignes.map((l) => `${l.empreinte}  ${l.rel}`).join('\n');
  if (table(relu.sommes) !== table(attendu.fichiers)) ecarts.push("table d'intégrité");
  if (ecarts.length > 0) erreur(`${rel(chemin)} n'est plus fidèle aux fichiers (${ecarts.join(', ')}) : ${consigne}`);
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

  const statuts = statutsDuRegistre(texteEntree);
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
    for (const dimension of module.dimensions ?? []) {
      if (!statuts.has(dimension)) erreur(`${dimension} (module ${module.id}) absente du registre des dimensions`);
      else if (statuts.get(dimension) !== module.status) {
        erreur(`${dimension} : registre ${statuts.get(dimension)}, manifeste ${module.status} (module ${module.id})`);
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
    else verifierTransmission(dossier, manifeste, nomDossier, erreur);
  }

  // Archives : une par version précédente déclarée, à la bonne version, et aucune archive orpheline.
  const declarees = new Set();
  for (const precedente of manifeste.previousVersions ?? []) {
    declarees.add(precedente.file);
    const chemin = join(dossier, precedente.file);
    if (!existsSync(chemin)) {
      erreur(`archive absente : ${precedente.file} (version ${precedente.version})`);
      continue;
    }
    // Une archive antérieure au champ `version` du frontmatter (2.0.0 de tension-dashboard) n'en porte pas : elle est figée telle quelle.
    const versionArchivee = frontmatter(lire(chemin)).version;
    if (versionArchivee && versionArchivee !== precedente.version) {
      erreur(`${precedente.file} est en version ${versionArchivee}, previousVersions annonce ${precedente.version}`);
    }
  }
  const dossierArchives = join(dossier, 'archives');
  if (existsSync(dossierArchives)) {
    for (const nom of readdirSync(dossierArchives)) {
      if (!declarees.has(`archives/${nom}`)) erreur(`archives/${nom} n'est pas déclarée dans previousVersions`);
    }
  }

  // Points d'extension : ceux du manifeste sont ceux que définit le point d'entrée.
  const pointsEntree = [...new Set([...texteEntree.matchAll(/^- \*\*(E\d+)\*\*/gm)].map((m) => m[1]))].sort(parNumero);
  const pointsManifeste = [...(manifeste.extensionPoints ?? [])].sort(parNumero);
  if (pointsEntree.join(',') !== pointsManifeste.join(',')) {
    erreur(`points d'extension : manifeste [${pointsManifeste.join(', ')}], point d'entrée [${pointsEntree.join(', ')}]`);
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
    for (const [, nom, id] of texte.matchAll(CITATION_EXTERNE)) {
      const autres = definitionsDe(nom);
      if (autres === null) erreur(`${nom}:${id} est cité, mais ${nom} n'est pas une spécification du dépôt`);
      else if (!autres.has(id)) erreur(`${nom}:${id} est cité mais n'est pas défini dans specs/${nom}/SKILL.md`);
    }
  }

  const nbModules = (manifeste.modules ?? []).length;
  return {
    nom: manifeste.name,
    version: manifeste.version,
    transmissible: manifeste.transmissible !== false,
    bilan: `${manifeste.name} ${manifeste.version} : ${nbModules} modules, ${definisLocaux.size} invariants`,
  };
}

/** Le README affiche chaque spécification à sa version courante, et ses liens aboutissent. */
function verifierReadme(specs) {
  const chemin = join(racine, 'README.md');
  if (!existsSync(chemin)) {
    erreurs.push('README.md absent');
    return false;
  }
  const texte = lire(chemin);
  const avant = erreurs.length;
  for (const { nom, version, transmissible } of specs) {
    const attendu = transmissible
      ? `| [\`${nom}\`](specs/${nom}/SKILL.md) | ${version} | [\`transmissions/${nom}-${version}.md\`](transmissions/${nom}-${version}.md) |`
      : `[\`${nom}\`](specs/${nom}/SKILL.md) ${version}`;
    if (!texte.includes(attendu)) {
      erreurs.push(`README.md : ${nom} doit y figurer en version ${version}${transmissible ? ', avec sa transmission' : ''} (${attendu})`);
    }
    for (const m of texte.matchAll(new RegExp(`\\["${echapper(nom)} (\\d+\\.\\d+\\.\\d+)"\\]`, 'g'))) {
      if (m[1] !== version) erreurs.push(`README.md : le schéma affiche ${nom} ${m[1]}, version courante ${version}`);
    }
  }
  for (const [, cible] of texte.matchAll(/\]\(((?:specs|transmissions)\/[^)#\s]+)\)/g)) {
    if (!existsSync(join(racine, cible))) erreurs.push(`README.md : lien vers ${cible}, fichier absent`);
  }
  return erreurs.length === avant;
}

const specs = [];
for (const nom of readdirSync(dossierSpecs).sort()) {
  const dossier = join(dossierSpecs, nom);
  if (statSync(dossier).isDirectory() && existsSync(join(dossier, 'manifest.json'))) {
    const resultat = verifierSpec(dossier);
    if (resultat) specs.push(resultat);
  }
}
const readmeAJour = verifierReadme(specs);
// Glossaire : il doit être exactement celui que génère tools/glossaire.mjs.
let glossaireAJour = false;
if (!existsSync(CHEMIN_GLOSSAIRE)) erreurs.push('glossaire.md : absent, lancer node tools/glossaire.mjs');
else if (lire(CHEMIN_GLOSSAIRE) !== genererGlossaire()) erreurs.push("glossaire.md : n'est plus à jour, lancer node tools/glossaire.mjs");
else glossaireAJour = true;

for (const { bilan } of specs) console.log(`ok  ${bilan}`);
if (readmeAJour) console.log('ok  README.md à jour');
if (glossaireAJour) console.log('ok  glossaire.md à jour');
const uniques = [...new Set(erreurs)];
for (const message of uniques) console.error(`ERREUR  ${message}`);
if (uniques.length > 0) process.exit(1);
console.log(`${specs.length} spécifications vérifiées, transmissions fidèles, aucune erreur`);
