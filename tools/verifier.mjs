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
 * - chaque fichier partagé existe et a la version épinglée, courante ou archivée ; chaque skill référencé
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
 * - chaque invariant défini dans le point d'entrée (`**Dn.INV-k**`, `**SCn.INV-k**`, `**SOn.INV-k**`,
 *   `**SAn.INV-k**`) est repris dans au moins un module, et chaque invariant cité est défini ; un identifiant
 *   préfixé par un nom de skill, comme `java:D4.INV-2`, désigne un autre skill du dépôt
 *   et doit être défini dans son point d'entrée ;
 * - le socle de l'acceptable porte un seul bloc `noyau`, au schéma fermé `socle-acceptable.noyau/1` :
 *   six listes non vides, des entrées aux seules clés de leur liste, sans doublon, des motifs qui sont des
 *   expressions régulières valides, et des règles qui sont des invariants du socle ;
 * - une constitution d'exemple qui épingle ce noyau (champ `acceptable`) le fait à la version que la
 *   spécification inclut, avec l'empreinte de son bloc `noyau` en JSON canonique, et reprend chacune de ses
 *   entrées à l'identique, aucune marquée `derogeable` (`socle-acceptable:SA7.INV-1`) ;
 * - un manifeste de kit d'exemple suit le schéma fermé `socle-acceptable.kit/1` : système du dépôt, à sa
 *   version courante s'il s'agit de la spécification elle-même, environnement dev, test ou demo, patch au
 *   chemin relatif et à l'empreinte hexadécimale, noyau confronté à la version du socle qu'inclut le système
 *   producteur, avec l'empreinte de son bloc `noyau`, confrontation en entiers, retour arrière préparé
 *   (`socle-acceptable:SA8.INV-1`, `socle-acceptable:SA2.INV-3`).
 *
 * Pour le dépôt :
 *
 * - `README.md` affiche chaque spécification à sa version courante, avec sa transmission,
 *   et son schéma ne montre aucune version périmée ; ses liens vers `specs/` et
 *   `transmissions/` aboutissent ;
 * - `glossaire.md` est exactement celui que génère `tools/glossaire.mjs` ;
 * - le catalogue des signaux d'`EVOLUTION.md`, section 10.6, a une ligne par clause de second ordre des points
 *   d'entrée, et aucune autre : sa nature dans la liste ; pour un effet sur des personnes, un signal, un statut
 *   de la liste, un lieu, invariant défini ou fichier du dépôt, sauf pour un signal non mesuré, et ce avec quoi il
 *   se lit ; pour une autre nature, aucun signal (règle 6 de la section 10.5) ;
 * - le tableau de viabilité d'`EVOLUTION.md`, section 10.8, a une ligne par couplage de la section 10.3, dans
 *   l'ordre, puis le dépôt lui-même : une boucle décrite, un statut de la liste ; pour une ligne prouvée ou
 *   partielle, des preuves, chacune un invariant défini, préfixé par sa spécification, dont la ligne de recette
 *   cite des tests qui existent sous ces titres ; pour une ligne non couverte, aucune ; pour une ligne partielle
 *   ou non couverte, ce qui manque (règle 8) ; la lecture 7E de la section 6 a sa colonne « Au troisième ordre »,
 *   une ligne par phase ;
 * - chaque proposition de l'observatoire, dans `observatoire/propositions/`, suit le format
 *   `observatoire.proposition/1` (spécification `observatoire`, module `propositions`) : rien que des valeurs
 *   minimisées ; le magasin local de l'observatoire, lui, reste sur le poste et n'est pas vérifié ici ;
 * - chaque examen, dans `observatoire/examens/`, suit le format `observatoire.examen/1` (module `examens`), et
 *   chaque proposition ratifiée a le sien, du même nom, qui lui répond s'il est défavorable ;
 * - les formes propres du dépôt ne changent que par la révision d'`EVOLUTION.md`, section 10.7 : le noyau du
 *   socle de l'acceptable ne perd, ne change ni ne rend permise dans un kit aucune entrée de sa version archivée
 *   précédente, et son changement dit sa migration au journal ; la constitution d'exemple d'une spécification,
 *   comparée à celle de la transmission de sa version précédente, cite au journal, si elle se relâche, son examen,
 *   ses preuves et sa migration, et, si elle change autrement, sa migration ;
 * - les noms d'un autre hôte d'IA et de son éditeur ne figurent dans aucun fichier suivi, hors de
 *   l'historique figé que `.geminiignore` cache à Gemini CLI : archives des versions publiées et
 *   anciennes transmissions ; et `.geminiignore` ne cache rien d'autre, aucune version courante.
 *
 * Le contenu des archives (`archives/`) n'est pas vérifié : elles sont figées.
 * Les fichiers se lisent en fins de ligne Unix : une extraction en CRLF, comme celle de
 * Git sous Windows, donne le même résultat.
 * Code de sortie 1 si une erreur est trouvée. Node 20 ou plus récent, modules natifs.
 */
import { Buffer } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembler, relire, sourcePartagee } from './bundle.mjs';
import { CHEMIN_GLOSSAIRE, genererGlossaire } from './glossaire.mjs';
import { EXAMENS, PROPOSITIONS, controlerRatifications, lireExamens, lirePropositions } from '../specs/observatoire/outils/observatoire.mjs';

const racine = dirname(dirname(fileURLToPath(import.meta.url)));
const dossierSpecs = join(racine, 'specs');
const erreurs = [];
// Fins de ligne : une extraction Windows (core.autocrlf) écrit des CRLF, que le dépôt stocke en LF ; tout se lit en LF.
const lire = (chemin) => readFileSync(chemin, 'utf8').replace(/\r\n/g, '\n');
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

// Espaces d'identifiants : `Dn` d'une spécification, `SCn` du socle back-front, `SOn` du socle d'observation,
// `SAn` du socle de l'acceptable.
const DEFINITION = /\*\*((?:D|SC|SO|SA)\d+\.INV-\d+)\*\*/g;
// Identifiant non précédé d'un préfixe de skill (`nom-du-skill:`) ni d'un autre caractère d'identifiant.
const CITATION = /(?<![\w:-])((?:D|SC|SO|SA)\d+\.INV-\d+)/g;
// Identifiant d'un autre skill, préfixé par son nom : `java:D4.INV-2`, `socle-observation:SO1.INV-1`.
const CITATION_EXTERNE = /(?<![\w-])([a-z][a-z0-9-]*):((?:D|SC|SO|SA)\d+\.INV-\d+)/g;

// Bloc `noyau` du socle de l'acceptable : la forme lisible par machine que reprennent les constitutions.
const SOCLE_ACCEPTABLE = 'socle-acceptable';
const SCHEMA_NOYAU = 'socle-acceptable.noyau/1';
// Clé propre à chaque liste du noyau ; une entrée porte cette clé, sa règle et, au besoin, `horsKit`.
const LISTES_DU_NOYAU = {
  intentionsRefusees: 'intention',
  programmesInterdits: 'programme',
  argumentsInterdits: 'argument',
  ecrituresInterdites: 'lieu',
  secrets: 'motif',
  leconsInterdites: 'motif',
};
const estObjet = (valeur) => valeur !== null && typeof valeur === 'object' && !Array.isArray(valeur);
// Manifeste de kit du socle de l'acceptable (section 11.2) : clés de chaque niveau, toutes requises, aucune autre.
const SCHEMA_KIT = 'socle-acceptable.kit/1';
const CLES_DU_KIT = {
  '': ['format', 'systeme', 'environnement', 'patch', 'noyau', 'confrontation', 'retourArriere'],
  systeme: ['nom', 'version'],
  patch: ['chemin', 'empreinte'],
  noyau: ['version', 'empreinte'],
  confrontation: ['fichiers', 'commandes'],
  retourArriere: ['prepare', 'verifie'],
};
const ENVIRONNEMENTS_DE_KIT = ['dev', 'test', 'demo'];

const blocsJson = (texte) => [...texte.matchAll(/^```json\n([\s\S]*?)\n```$/gm)].map((m) => m[1]);
// JSON canonique : clés triées, sans espace ; c'est la forme que hache l'empreinte d'un bloc `noyau`.
const canonique = (v) =>
  Array.isArray(v) ? `[${v.map(canonique).join(',')}]` : estObjet(v) ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonique(v[k])}`).join(',')}}` : JSON.stringify(v);

/** Le bloc `noyau` du socle de l'acceptable : un seul, au schéma fermé, qui ne cite que des invariants du socle. */
function verifierNoyau(texte, definisLocaux, erreur) {
  const blocs = blocsJson(texte).filter((b) => b.includes(`"${SCHEMA_NOYAU}"`));
  if (blocs.length !== 1) {
    erreur(`bloc noyau : ${blocs.length} blocs JSON au schéma ${SCHEMA_NOYAU}, un seul attendu`);
    return;
  }
  let noyau;
  try {
    noyau = JSON.parse(blocs[0]);
  } catch (e) {
    erreur(`bloc noyau : JSON illisible (${e.message})`);
    return;
  }
  if (!estObjet(noyau)) {
    erreur("bloc noyau : ce n'est pas un objet JSON");
    return;
  }
  if (noyau.schema !== SCHEMA_NOYAU) erreur(`bloc noyau : schema ${noyau.schema}, ${SCHEMA_NOYAU} attendu`);
  for (const cle of Object.keys(noyau)) {
    if (cle !== 'schema' && !Object.hasOwn(LISTES_DU_NOYAU, cle)) erreur(`bloc noyau : clé ${cle}, hors du schéma ${SCHEMA_NOYAU}`);
  }
  for (const [liste, cle] of Object.entries(LISTES_DU_NOYAU)) {
    const entrees = noyau[liste];
    if (!Array.isArray(entrees) || entrees.length === 0) {
      erreur(`bloc noyau : liste ${liste} absente ou vide`);
      continue;
    }
    const vues = new Set();
    entrees.forEach((entree, i) => {
      const lieu = `bloc noyau : ${liste}[${i}]`;
      if (!estObjet(entree)) {
        erreur(`${lieu} n'est pas un objet`);
        return;
      }
      for (const k of Object.keys(entree)) {
        if (![cle, 'horsKit', 'regle'].includes(k)) erreur(`${lieu} : clé ${k}, hors de ${cle}, horsKit et regle`);
      }
      const valeur = entree[cle];
      if (typeof valeur !== 'string' || valeur === '') erreur(`${lieu} : ${cle} absent ou vide`);
      else if (vues.has(valeur)) erreur(`${lieu} : ${cle} ${valeur} en double`);
      else {
        vues.add(valeur);
        if (cle === 'motif') {
          try {
            new RegExp(valeur);
          } catch (e) {
            erreur(`${lieu} : motif invalide (${e.message})`);
          }
        }
      }
      if (Object.hasOwn(entree, 'horsKit') && entree.horsKit !== true) erreur(`${lieu} : horsKit, s'il figure, vaut true`);
      if (typeof entree.regle !== 'string' || !/^SA\d+\.INV-\d+$/.test(entree.regle)) {
        erreur(`${lieu} : regle ${entree.regle}, un invariant SAn.INV-k attendu`);
      } else if (!definisLocaux.has(entree.regle)) {
        erreur(`${lieu} : regle ${entree.regle}, qui n'est pas définie dans le socle`);
      }
    });
  }
}

/** Le bloc `noyau` du socle de l'acceptable, à la version qu'inclut une spécification, et son empreinte en JSON canonique. */
function noyauInclus(partage, nom) {
  const bloc = blocsJson(lire(sourcePartagee(partage, nom))).find((b) => b.includes(`"${SCHEMA_NOYAU}"`));
  const noyau = JSON.parse(bloc);
  return { noyau, empreinte: createHash('sha256').update(canonique(noyau)).digest('hex') };
}

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

/**
 * Constitutions d'exemple qui épinglent le noyau du socle de l'acceptable (champ `acceptable`) : à la version
 * que la spécification inclut, avec l'empreinte de son bloc `noyau`, et, pour une constitution qui porte ses
 * listes, chaque entrée du noyau reprise à l'identique, aucune marquée `derogeable` (`socle-acceptable:SA7.INV-1`).
 */
function verifierEpinglages(manifeste, textes, erreur) {
  const epinglages = [];
  for (const texte of textes) {
    for (const bloc of blocsJson(texte)) {
      let objet;
      try {
        objet = JSON.parse(bloc);
      } catch {
        continue;
      }
      if (!estObjet(objet) || !estObjet(objet.acceptable) || objet.acceptable.socle !== SOCLE_ACCEPTABLE) continue;
      // Un épinglage porte son empreinte, ou des listes de constitution ; une rubrique de livrable, ni l'une ni les autres.
      const listes = Object.keys(LISTES_DU_NOYAU).some((nom) => objet[nom] !== undefined || objet.commandes?.[nom] !== undefined);
      if (Object.hasOwn(objet.acceptable, 'empreinte') || listes) epinglages.push(objet);
    }
  }
  if (epinglages.length === 0) return;
  const partage = (manifeste.shared ?? []).find((p) => p.from === `specs/${SOCLE_ACCEPTABLE}/SKILL.md`);
  if (!partage) {
    erreur(`une constitution épingle ${SOCLE_ACCEPTABLE}, que la spécification n'inclut pas (shared)`);
    return;
  }
  let noyau;
  let empreinte;
  try {
    ({ noyau, empreinte } = noyauInclus(partage, manifeste.name));
  } catch {
    erreur(`bloc noyau de ${SOCLE_ACCEPTABLE} ${partage.version} illisible`);
    return;
  }
  for (const constitution of epinglages) {
    const { version, empreinte: epinglee } = constitution.acceptable;
    if (version !== partage.version) erreur(`constitution : acceptable.version ${version}, la spécification inclut ${SOCLE_ACCEPTABLE} ${partage.version}`);
    else if (epinglee !== empreinte) erreur(`constitution : acceptable.empreinte ${String(epinglee).slice(0, 12)}…, le bloc noyau de ${SOCLE_ACCEPTABLE} ${version} a l'empreinte ${empreinte.slice(0, 12)}…`);
    const listeDe = (nom) => constitution[nom] ?? constitution.commandes?.[nom];
    if (!Object.keys(LISTES_DU_NOYAU).some((nom) => listeDe(nom) !== undefined)) continue;
    for (const [nom, cle] of Object.entries(LISTES_DU_NOYAU)) {
      const reprises = new Set((Array.isArray(listeDe(nom)) ? listeDe(nom) : []).map(canonique));
      for (const entree of noyau[nom] ?? []) {
        if (!reprises.has(canonique(entree))) erreur(`constitution : ${nom}, l'entrée du noyau ${entree[cle]} n'est pas reprise à l'identique`);
      }
    }
  }
}

/**
 * Manifestes de kit d'exemple (`socle-acceptable.kit/1`, section 11.2 du socle de l'acceptable) : schéma fermé ;
 * système du dépôt, à sa version courante si c'est la spécification elle-même ; environnement dev, test ou demo ;
 * patch au chemin relatif et à l'empreinte hexadécimale ; noyau confronté à la version du socle qu'inclut le
 * système producteur, avec l'empreinte de son bloc `noyau` (`socle-acceptable:SA8.INV-1`) ; confrontation en
 * entiers positifs ou nuls ; retour arrière préparé (`socle-acceptable:SA2.INV-3`).
 */
function verifierKits(manifeste, textes, erreur) {
  for (const texte of textes) {
    for (const bloc of blocsJson(texte).filter((b) => b.includes(`"${SCHEMA_KIT}"`))) {
      let kit;
      try {
        kit = JSON.parse(bloc);
      } catch (e) {
        erreur(`manifeste de kit : JSON illisible (${e.message})`);
        continue;
      }
      if (!estObjet(kit) || kit.format !== SCHEMA_KIT) {
        erreur(`manifeste de kit : format ${kit?.format}, ${SCHEMA_KIT} attendu`);
        continue;
      }
      const nom = typeof kit.systeme?.nom === 'string' ? kit.systeme.nom : '?';
      const signaler = (message) => erreur(`manifeste de kit ${nom} : ${message}`);
      // Schéma fermé, niveau par niveau ; un niveau absent ou qui n'est pas un objet n'est pas vérifié plus avant.
      const lisibles = new Set();
      for (const [niveau, cles] of Object.entries(CLES_DU_KIT)) {
        const objet = niveau === '' ? kit : kit[niveau];
        if (niveau !== '' && !Object.hasOwn(kit, niveau)) continue;
        if (!estObjet(objet)) {
          signaler(`${niveau}, un objet attendu`);
          continue;
        }
        lisibles.add(niveau);
        const prefixe = niveau === '' ? 'clé ' : `${niveau}.`;
        for (const cle of Object.keys(objet)) if (!cles.includes(cle)) signaler(`${prefixe}${cle}, hors du schéma ${SCHEMA_KIT}`);
        for (const cle of cles) if (!Object.hasOwn(objet, cle)) signaler(`${prefixe}${cle} absent`);
      }
      if (lisibles.has('systeme')) {
        const { version } = kit.systeme;
        if (!existsSync(join(dossierSpecs, nom, 'manifest.json'))) signaler(`systeme.nom ${nom}, qui n'est pas une spécification du dépôt`);
        if (typeof version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version)) signaler(`systeme.version ${version}, une version X.Y.Z attendue`);
        else if (nom === manifeste.name && version !== manifeste.version) signaler(`systeme.version ${version}, la spécification est en version ${manifeste.version}`);
      }
      if (Object.hasOwn(kit, 'environnement') && !ENVIRONNEMENTS_DE_KIT.includes(kit.environnement)) {
        signaler(`environnement ${kit.environnement}, ${ENVIRONNEMENTS_DE_KIT.join(', ')} attendu`);
      }
      if (lisibles.has('patch')) {
        const { chemin, empreinte } = kit.patch;
        if (typeof chemin !== 'string' || chemin === '') signaler('patch.chemin absent ou vide');
        else if (/^([/\\]|[A-Za-z]:)/.test(chemin)) signaler(`patch.chemin ${chemin}, un chemin relatif au manifeste attendu`);
        if (typeof empreinte !== 'string' || !/^[0-9a-f]{64}$/.test(empreinte)) signaler('patch.empreinte, 64 caractères hexadécimaux en minuscules attendus');
      }
      if (lisibles.has('confrontation')) {
        for (const cle of CLES_DU_KIT.confrontation) {
          const n = kit.confrontation[cle];
          if (Object.hasOwn(kit.confrontation, cle) && !(Number.isInteger(n) && n >= 0)) signaler(`confrontation.${cle} ${n}, un entier positif ou nul attendu`);
        }
      }
      if (lisibles.has('retourArriere')) {
        const { prepare, verifie } = kit.retourArriere;
        if (Object.hasOwn(kit.retourArriere, 'prepare') && prepare !== true) signaler('retourArriere.prepare vaut true : un kit porte son retour arrière (socle-acceptable:SA2.INV-3)');
        if (Object.hasOwn(kit.retourArriere, 'verifie') && typeof verifie !== 'boolean') signaler(`retourArriere.verifie ${verifie}, true ou false attendu`);
      }
      // Le noyau confronté : la version du socle qu'inclut le système producteur, l'empreinte de son bloc `noyau`.
      if (lisibles.has('noyau') && lisibles.has('systeme') && existsSync(join(dossierSpecs, nom, 'manifest.json'))) {
        let partage;
        try {
          const producteur = JSON.parse(lire(join(dossierSpecs, nom, 'manifest.json')));
          partage = (producteur.shared ?? []).find((p) => p.from === `specs/${SOCLE_ACCEPTABLE}/SKILL.md`);
        } catch {
          partage = undefined;
        }
        if (!partage) {
          signaler(`${nom} n'inclut pas ${SOCLE_ACCEPTABLE} (shared) : aucun noyau à confronter`);
          continue;
        }
        const { version, empreinte } = kit.noyau;
        if (version !== partage.version) {
          signaler(`noyau.version ${version}, ${nom} inclut ${SOCLE_ACCEPTABLE} ${partage.version}`);
          continue;
        }
        let attendue;
        try {
          attendue = noyauInclus(partage, nom).empreinte;
        } catch {
          signaler(`bloc noyau de ${SOCLE_ACCEPTABLE} ${partage.version} illisible`);
          continue;
        }
        if (empreinte !== attendue) {
          signaler(`noyau.empreinte ${String(empreinte).slice(0, 12)}…, le bloc noyau de ${SOCLE_ACCEPTABLE} ${version} a l'empreinte ${attendue.slice(0, 12)}…`);
        }
      }
    }
  }
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
    let texte;
    try {
      texte = lire(sourcePartagee(partage, manifeste.name));
    } catch (e) {
      erreur(e.message);
      continue;
    }
    // Seuls les identifiants hors de l'espace local `Dn` sont importés (ceux des socles, `SCn`, `SOn` et `SAn`) :
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
  if (manifeste.name === SOCLE_ACCEPTABLE) verifierNoyau(texteEntree, definisLocaux, erreur);
  verifierEpinglages(manifeste, [texteEntree, ...textesModules], erreur);
  verifierKits(manifeste, [texteEntree, ...textesModules], erreur);
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

// Catalogue des signaux du deuxième couplage (EVOLUTION.md, section 10.6 ; règle 6 de la section 10.5).
const NATURES_DE_CLAUSE = ['effet sur des personnes', 'structure du second ordre', "effet sur l'observateur", "précaution d'observateur"];
const STATUTS_DE_SIGNAL = ['exporté', 'mesuré', 'disponible', 'non mesuré'];
// Statuts du tableau de viabilité d'EVOLUTION.md, section 10.8, et phases de l'Axiome 7E, dans l'ordre de la section 6.
const STATUTS_DE_VIABILITE = ['prouvé', 'partiel', 'non couvert'];
const PHASES_7E = ['Éléments', 'Espace', 'Engendrent', 'État', 'Expression', 'Évolutif', 'Environnement'];
const CLAUSE = /^Clause de second ordre : /m;

/**
 * Catalogue des signaux : une ligne par clause de second ordre d'un point d'entrée, et aucune autre. Renvoie le
 * nombre de clauses classées. Une ligne d'effet sur des personnes porte un signal, un statut de la liste, un lieu
 * qui existe, sauf pour un signal non mesuré, et ce avec quoi il se lit ; une autre nature n'a pas de signal.
 */
function verifierCatalogue() {
  const erreur = (message) => erreurs.push(`EVOLUTION.md : catalogue des signaux : ${message}`);
  const chemin = join(racine, 'EVOLUTION.md');
  if (!existsSync(chemin)) {
    erreurs.push('EVOLUTION.md absent');
    return 0;
  }
  const section = /^### 10\.6 [^\n]*\n([\s\S]*?)(?=\n### |\n## |(?![\s\S]))/m.exec(lire(chemin));
  if (!section) {
    erreur('section 10.6 absente');
    return 0;
  }
  const clauses = new Set(
    readdirSync(dossierSpecs)
      .filter((nom) => existsSync(join(dossierSpecs, nom, 'manifest.json')))
      .filter((nom) => {
        try {
          const manifeste = JSON.parse(lire(join(dossierSpecs, nom, 'manifest.json')));
          return CLAUSE.test(lire(join(dossierSpecs, nom, manifeste.entry ?? 'SKILL.md')));
        } catch {
          return false;
        }
      }),
  );
  const cellules = (ligne) => ligne.slice(1, -1).split('|').map((c) => c.trim());
  // Le tableau du catalogue : sous son en-tête, les lignes qui le suivent sans interruption.
  const texte = section[1].split('\n');
  const debut = texte.findIndex((l) => /^\| Spécification \| Nature \|/.test(l));
  if (debut === -1) {
    erreur('tableau absent : en-tête « | Spécification | Nature | … »');
    return 0;
  }
  const lignes = [];
  for (let i = debut + 2; i < texte.length && texte[i].startsWith('|'); i++) lignes.push(texte[i]);
  const vues = new Set();
  for (const ligne of lignes) {
    const c = cellules(ligne);
    const nom = c[0].replace(/`/g, '');
    if (c.length !== 6) {
      erreur(`${nom} : six colonnes attendues, spécification, nature, signal, statut, lieu et lu avec`);
      continue;
    }
    const [, nature, signal, statut, lieu, avec] = c;
    if (vues.has(nom)) erreur(`${nom} : deux lignes`);
    vues.add(nom);
    if (!clauses.has(nom)) erreur(`${nom} : aucune clause de second ordre dans son point d'entrée`);
    if (!NATURES_DE_CLAUSE.includes(nature)) {
      erreur(`${nom} : nature « ${nature} », hors de la liste : ${NATURES_DE_CLAUSE.join(', ')}`);
      continue;
    }
    if (nature !== 'effet sur des personnes') {
      if ([signal, statut, lieu, avec].some((v) => v !== '—')) erreur(`${nom} : une clause de nature « ${nature} » n'a pas de signal, « — » dans chaque colonne`);
      continue;
    }
    if (signal === '' || signal === '—') erreur(`${nom} : effet sur des personnes sans signal`);
    if (!STATUTS_DE_SIGNAL.includes(statut)) erreur(`${nom} : statut « ${statut} », hors de la liste : ${STATUTS_DE_SIGNAL.join(', ')}`);
    if (avec === '' || avec === '—') erreur(`${nom} : signal lu seul, sans ce avec quoi il se lit`);
    if (statut === 'non mesuré') {
      if (lieu !== '—') erreur(`${nom} : un signal non mesuré n'a pas de lieu, « — »`);
      continue;
    }
    const m = /^`([^`]+)`$/.exec(lieu);
    const reference = m?.[1] ?? '';
    const invariant = /^([a-z][a-z0-9-]*):((?:D|SC|SO|SA)\d+\.INV-\d+)$/.exec(reference);
    if (invariant) {
      if (!definitionsDe(invariant[1])?.has(invariant[2])) erreur(`${nom} : lieu ${reference}, invariant qui n'est pas défini`);
    } else if (!reference.startsWith('specs/') || !existsSync(join(racine, reference))) {
      erreur(`${nom} : lieu « ${lieu} », un invariant préfixé par sa spécification ou un fichier du dépôt attendu`);
    }
  }
  for (const nom of clauses) if (!vues.has(nom)) erreur(`${nom} : sa clause de second ordre n'a pas de ligne`);
  return vues.size;
}

/** Les tests que cite la ligne de recette d'un invariant, dans les modules ou le point d'entrée de sa spécification : [{ fichier, titre }], ou null. */
function recetteDe(nom, id) {
  const dossier = join(dossierSpecs, nom);
  const fichiers = [join(dossier, 'SKILL.md'), ...(existsSync(join(dossier, 'modules')) ? fichiersMarkdown(join(dossier, 'modules')) : [])];
  for (const chemin of fichiers.filter((f) => existsSync(f))) {
    const ligne = lire(chemin).split('\n').find((l) => l.startsWith(`| ${id} |`) && l.includes('`tests/'));
    if (!ligne) continue;
    const titres = [];
    let fichier = null;
    for (const m of ligne.matchAll(/`(tests\/[a-z0-9-]+\.test\.mjs)`|« ([^»]+?) »/g)) {
      if (m[1]) fichier = m[1];
      else if (fichier) titres.push({ fichier, titre: m[2] });
    }
    return titres;
  }
  return null;
}

/**
 * Le tableau de viabilité d'EVOLUTION.md, section 10.8 (règle 8), et la colonne « Au troisième ordre » de la lecture
 * 7E de la section 6. Rend le bilan, ou null si le tableau manque.
 */
function verifierViabilite() {
  const erreur = (message) => erreurs.push(`EVOLUTION.md : viabilité des couplages : ${message}`);
  const chemin = join(racine, 'EVOLUTION.md');
  if (!existsSync(chemin)) return null;
  const texte = lire(chemin);
  const section = (titre) => new RegExp(`^${titre} [^\\n]*\\n([\\s\\S]*?)(?=\\n### |\\n## |(?![\\s\\S]))`, 'm').exec(texte)?.[1] ?? null;
  const cellules = (ligne) => ligne.slice(1, -1).split('|').map((c) => c.trim());
  const tableau = (corps, entete) => {
    const lignes = corps.split('\n');
    const debut = lignes.findIndex((l) => l === entete);
    if (debut === -1) return null;
    const rangs = [];
    for (let i = debut + 2; i < lignes.length && lignes[i].startsWith('|'); i++) rangs.push(cellules(lignes[i]));
    return rangs;
  };
  // Section 6 : chaque phase, dans l'ordre, lue aussi au troisième ordre.
  const lecture = section('## 6\\.');
  const phases = lecture === null ? null : tableau(lecture, '| Phase | Au niveau du dépôt | Au troisième ordre |');
  if (phases === null) erreur('lecture 7E de la section 6 : en-tête « | Phase | Au niveau du dépôt | Au troisième ordre | » attendu');
  else {
    if (phases.map((c) => c[0]).join(', ') !== PHASES_7E.join(', ')) erreur(`lecture 7E de la section 6 : phases ${phases.map((c) => c[0]).join(', ')}, attendu ${PHASES_7E.join(', ')}`);
    for (const c of phases) if (c.length !== 3 || c[2] === '' || c[2] === '—') erreur(`lecture 7E de la section 6 : ${c[0]} n'est pas lue au troisième ordre`);
  }
  // Section 10.8 : une ligne par couplage de la section 10.3, dans l'ordre, puis le dépôt lui-même.
  const couplages = [...(section('### 10\\.3') ?? '').matchAll(/^(\d)\. \*\*([^*]+?)\.\*\*/gm)].map((m) => `${m[1]}. ${m[2]}`);
  const attendues = [...couplages, 'Le dépôt lui-même'];
  const viabilite = section('### 10\\.8');
  if (viabilite === null) {
    erreur('section 10.8 absente');
    return null;
  }
  const lignes = tableau(viabilite, '| Couplage | Boucle | Preuves | Statut | Ce qui manque |');
  if (lignes === null) {
    erreur('tableau absent : en-tête « | Couplage | Boucle | Preuves | Statut | Ce qui manque | »');
    return null;
  }
  const noms = lignes.map((c) => c[0]);
  if (noms.join(' ; ') !== attendues.join(' ; ')) erreur(`lignes ${noms.map((n) => `« ${n} »`).join(', ')} : une par couplage de la section 10.3, dans l'ordre, puis le dépôt, attendues : ${attendues.map((n) => `« ${n} »`).join(', ')}`);
  const bilan = { lignes: lignes.length, prouvé: 0, partiel: 0, 'non couvert': 0, preuves: 0 };
  for (const c of lignes) {
    const nom = c[0];
    if (c.length !== 5) {
      erreur(`${nom} : cinq colonnes attendues, couplage, boucle, preuves, statut et ce qui manque`);
      continue;
    }
    const [, boucle, preuves, statut, manque] = c;
    if (boucle === '' || boucle === '—') erreur(`${nom} : boucle non décrite`);
    if (!STATUTS_DE_VIABILITE.includes(statut)) {
      erreur(`${nom} : statut « ${statut} », hors de la liste : ${STATUTS_DE_VIABILITE.join(', ')}`);
      continue;
    }
    bilan[statut]++;
    if (statut !== 'prouvé' && (manque === '' || manque === '—')) erreur(`${nom} : ${statut}, sans dire ce qui manque`);
    if (statut === 'non couvert') {
      if (preuves !== '—') erreur(`${nom} : non couvert, sans preuve, « — »`);
      continue;
    }
    if (preuves === '' || preuves === '—') {
      erreur(`${nom} : ${statut}, sans preuve`);
      continue;
    }
    for (const preuve of preuves.split(/,\s*/)) {
      const m = /^`([a-z][a-z0-9-]*):((?:D|SC|SO|SA)\d+\.INV-\d+)`$/.exec(preuve);
      if (!m) {
        erreur(`${nom} : preuve « ${preuve} », un invariant préfixé par sa spécification attendu`);
        continue;
      }
      const reference = `${m[1]}:${m[2]}`;
      if (!definitionsDe(m[1])?.has(m[2])) {
        erreur(`${nom} : preuve ${reference}, invariant qui n'est pas défini`);
        continue;
      }
      const tests = recetteDe(m[1], m[2]);
      if (!tests || tests.length === 0) {
        erreur(`${nom} : preuve ${reference}, sans ligne de recette qui cite ses tests`);
        continue;
      }
      let prouvee = true;
      for (const { fichier, titre } of tests) {
        const source = join(dossierSpecs, m[1], fichier);
        if (!existsSync(source)) {
          erreur(`${nom} : preuve ${reference}, ${fichier} absent`);
          prouvee = false;
        } else if (!lire(source).replace(/\\'/g, '\'').includes(titre)) {
          erreur(`${nom} : preuve ${reference}, aucun test « ${titre} » dans ${fichier}`);
          prouvee = false;
        }
      }
      if (prouvee) bilan.preuves++;
    }
  }
  return bilan;
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

// ---------------------------------------------------------------------------
// Formes propres du dépôt (EVOLUTION.md, section 10.7)
// ---------------------------------------------------------------------------

/** Paragraphe du journal de révision d'un point d'entrée pour une version, ou une chaîne vide. */
const entreeDuJournal = (texte, version) => new RegExp(`^\\*\\*${echapper(version)}\\*\\* \\([^)]*\\) : (.*)$`, 'm').exec(texte)?.[1] ?? '';

/**
 * Le noyau courant, comparé à celui de la version précédente : une entrée qui se retire, change de règle ou devient
 * permise dans un kit l'affaiblirait ; une entrée ajoutée, ou qui perd `horsKit`, le renforce.
 */
function ecartsDuNoyau(avant, apres) {
  const affaiblissements = [];
  for (const [liste, cle] of Object.entries(LISTES_DU_NOYAU)) {
    const courantes = new Map((Array.isArray(apres[liste]) ? apres[liste] : []).map((e) => [e[cle], e]));
    for (const e of Array.isArray(avant[liste]) ? avant[liste] : []) {
      const c = courantes.get(e[cle]);
      if (!c) affaiblissements.push(`${liste} : l'entrée ${e[cle]} se retire`);
      else if (c.regle !== e.regle) affaiblissements.push(`${liste} : l'entrée ${e[cle]} change de règle, ${e.regle} devient ${c.regle}`);
      else if (!e.horsKit && c.horsKit) affaiblissements.push(`${liste} : l'entrée ${e[cle]} devient permise dans un kit`);
    }
  }
  return { affaiblissements, change: canonique(avant) !== canonique(apres) };
}

// Une liste d'une constitution, en tête ou sous `commandes` ; une entrée s'y reconnaît à sa valeur et à sa règle.
const listeDeConstitution = (c, nom) => (Array.isArray(c[nom]) ? c[nom] : Array.isArray(c.commandes?.[nom]) ? c.commandes[nom] : []);
const idEntree = (e, cle) => `${e[cle]} (${e.regle})`;

/** La constitution d'exemple : le premier bloc JSON qui épingle le noyau, porte sa version et des listes du noyau. */
function constitutionDExemple(textes) {
  for (const texte of textes) {
    for (const bloc of blocsJson(texte)) {
      let objet;
      try {
        objet = JSON.parse(bloc);
      } catch {
        continue;
      }
      if (!estObjet(objet) || objet.acceptable?.socle !== SOCLE_ACCEPTABLE || typeof objet.version !== 'string') continue;
      if (Object.keys(LISTES_DU_NOYAU).some((nom) => listeDeConstitution(objet, nom).length > 0)) return objet;
    }
  }
  return null;
}

/**
 * Ce qui relâche une constitution d'exemple par rapport à la précédente : une entrée d'une liste retirée ou
 * modifiée, rendue permise dans un kit ou dérogeable ; un point ou un invariant retiré ; une commande ou une règle
 * modifiable ajoutée ; des bornes élargies ; un méta-critère changé. Le reste la renforce, ou ne la change pas.
 */
function relachementsDeConstitution(avant, apres) {
  const r = [];
  for (const [liste, cle] of Object.entries(LISTES_DU_NOYAU)) {
    const courantes = new Map(listeDeConstitution(apres, liste).map((e) => [idEntree(e, cle), e]));
    for (const e of listeDeConstitution(avant, liste)) {
      const c = courantes.get(idEntree(e, cle));
      if (!c) r.push(`${liste}, entrée ${idEntree(e, cle)} retirée ou modifiée`);
      else if (!e.horsKit && c.horsKit) r.push(`${liste}, entrée ${idEntree(e, cle)} permise dans un kit`);
      else if (!e.derogeable && c.derogeable) r.push(`${liste}, entrée ${idEntree(e, cle)} rendue dérogeable`);
    }
  }
  for (const nom of ['points', 'pointsDeControle', 'invariants']) {
    const courants = new Set(Array.isArray(apres[nom]) ? apres[nom] : []);
    for (const v of Array.isArray(avant[nom]) ? avant[nom] : []) if (!courants.has(v)) r.push(`${nom}, ${v} retiré`);
  }
  const noms = new Set(avant.commandes?.noms ?? []);
  for (const n of apres.commandes?.noms ?? []) if (!noms.has(n)) r.push(`commandes.noms, ${n} ajoutée`);
  const bornes = new Map((avant.reglesModifiables ?? []).map((m) => [m.regle, m.bornes ?? {}]));
  for (const m of apres.reglesModifiables ?? []) {
    const b = bornes.get(m.regle);
    if (!b) r.push(`reglesModifiables, ${m.regle} ajoutée`);
    else if ((m.bornes?.min ?? -Infinity) < (b.min ?? -Infinity) || (m.bornes?.max ?? Infinity) > (b.max ?? Infinity)) r.push(`reglesModifiables, bornes de ${m.regle} élargies`);
  }
  const [ma, mb] = [avant.metaCriteres ?? {}, apres.metaCriteres ?? {}];
  for (const k of [...new Set([...Object.keys(ma), ...Object.keys(mb)])]) if (canonique(ma[k]) !== canonique(mb[k])) r.push(`metaCriteres.${k} changé`);
  return r;
}

/**
 * Formes propres (EVOLUTION.md, section 10.7). Le noyau du socle de l'acceptable, comparé à sa version archivée
 * précédente : aucun affaiblissement, et un changement dit sa migration. La constitution d'exemple d'une
 * spécification, comparée à celle de la transmission de sa version précédente : un relâchement cite au journal son
 * examen, `observatoire/examens/<nom>-<version>.md`, ses preuves et sa migration, et répond à un avis défavorable ;
 * un autre changement dit sa migration. Renvoie un bilan.
 */
function verifierFormesPropres(examens) {
  const bilan = { noyau: null, constitutions: 0, relachements: 0 };
  const parNom = new Map(examens.map((e) => [e.nom, e]));
  for (const nom of readdirSync(dossierSpecs).sort()) {
    const dossier = join(dossierSpecs, nom);
    if (!existsSync(join(dossier, 'manifest.json'))) continue;
    let manifeste;
    try {
      manifeste = JSON.parse(lire(join(dossier, 'manifest.json')));
    } catch {
      continue;
    }
    const precedente = (manifeste.previousVersions ?? []).at(-1);
    const cheminEntree = join(dossier, manifeste.entry ?? 'SKILL.md');
    if (!precedente || !existsSync(cheminEntree)) continue;
    const entree = lire(cheminEntree);
    const journal = entreeDuJournal(entree, manifeste.version);
    const erreur = (message) => erreurs.push(`${nom} : formes propres : ${message}`);
    const exiger = (motif, quoi, raison) => {
      if (!journal.includes(motif)) erreur(`${raison} : le journal de ${manifeste.version} ne dit pas ${quoi} (« ${motif} »)`);
    };
    if (nom === SOCLE_ACCEPTABLE) {
      const archive = join(dossier, precedente.file);
      const blocAvant = existsSync(archive) ? blocsJson(lire(archive)).find((b) => b.includes(`"${SCHEMA_NOYAU}"`)) : undefined;
      const blocApres = blocsJson(entree).find((b) => b.includes(`"${SCHEMA_NOYAU}"`));
      let avant;
      let apres;
      try {
        avant = JSON.parse(blocAvant);
        apres = JSON.parse(blocApres);
      } catch {
        continue; // un bloc absent ou illisible est déjà relevé par verifierNoyau
      }
      if (!estObjet(avant) || !estObjet(apres)) continue;
      const { affaiblissements, change } = ecartsDuNoyau(avant, apres);
      for (const a of affaiblissements) erreur(`noyau, ${a} depuis ${precedente.version} ; une règle de sûreté ne s'affaiblit jamais (EVOLUTION.md, section 10.7)`);
      if (change) exiger('Migration :', 'sa migration', `le noyau change depuis ${precedente.version}`);
      bilan.noyau = `${manifeste.version}, ${change ? 'renforcé' : 'inchangé'} depuis ${precedente.version}`;
      continue;
    }
    const textes = [entree, ...(manifeste.modules ?? []).map((m) => join(dossier, m.path)).filter((c) => existsSync(c)).map(lire)];
    const apres = constitutionDExemple(textes);
    const cheminAvant = join(racine, 'transmissions', `${manifeste.name}-${precedente.version}.md`);
    if (!apres || !existsSync(cheminAvant)) continue;
    const avant = constitutionDExemple(relire(lire(cheminAvant)).fichiers.map((f) => f.contenu));
    if (!avant) continue;
    bilan.constitutions++;
    if (canonique(avant) === canonique(apres)) continue;
    const relachements = relachementsDeConstitution(avant, apres);
    if (relachements.length === 0) {
      exiger('Migration :', 'sa migration', `constitution d'exemple changée depuis ${precedente.version}`);
      continue;
    }
    bilan.relachements += relachements.length;
    const fichier = `${EXAMENS}/${manifeste.name}-${manifeste.version}.md`;
    const raison = `constitution d'exemple relâchée depuis ${precedente.version} (${relachements.join(' ; ')})`;
    const examen = parNom.get(`${manifeste.name}-${manifeste.version}.md`);
    if (!examen) erreur(`${raison} : examen absent, ${fichier} attendu (EVOLUTION.md, section 10.7)`);
    if (!journal.includes(fichier)) erreur(`${raison} : le journal de ${manifeste.version} ne cite pas son examen, ${fichier}`);
    exiger('Preuves :', 'ses preuves', raison);
    exiger('Migration :', 'sa migration', raison);
    if (examen?.entete.avis === 'defavorable') exiger("Réponse à l'examen", "sa réponse à l'avis défavorable", raison);
  }
  return bilan;
}

// ---------------------------------------------------------------------------
// Historique caché à Gemini CLI, et noms d'un autre hôte d'IA
// ---------------------------------------------------------------------------

// Noms d'un autre hôte d'IA et de son éditeur, écrits en base64 pour que ce fichier ne les porte pas.
const NOMS_HISTORIQUES = ['Y2xhdWRl', 'YW50aHJvcGlj'].map((b) => Buffer.from(b, 'base64').toString('utf8'));
const MOTIF_NOMS = new RegExp(NOMS_HISTORIQUES.join('|'), 'i');
const TEXTE = /\.(md|mjs|cjs|js|ts|json|toml|ya?ml|cmd|bat|sh|txt|html|css|feature|java|py|csv|xml|properties|sql)$|(^|\/)\.[a-z]+ignore$/i;

/** Fichiers suivis du dépôt (posix), ou à défaut ceux du disque, hors de .git et de node_modules. */
function fichiersDuDepot() {
  try {
    return execFileSync('git', ['-C', racine, 'ls-files', '-z'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\0').filter(Boolean);
  } catch {
    const tous = [];
    const parcourir = (dossier) => {
      for (const e of readdirSync(dossier, { withFileTypes: true })) {
        if (e.name === '.git' || e.name === 'node_modules') continue;
        if (e.isDirectory()) parcourir(join(dossier, e.name));
        else tous.push(rel(join(dossier, e.name)).split('\\').join('/'));
      }
    };
    parcourir(racine);
    return tous;
  }
}

/** Motifs de `.geminiignore` : un dossier dont un segment peut valoir `*`, ou un fichier exact. */
function verifierHistoriqueCache(versionsCourantes) {
  const chemin = join(racine, '.geminiignore');
  const motifs = existsSync(chemin) ? lire(chemin).split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')) : [];
  const regles = [];
  for (const motif of motifs) {
    const transmission = /^transmissions\/([a-z0-9-]+)-(\d+\.\d+\.\d+)\.md$/.exec(motif);
    if (motif === 'specs/*/archives/') regles.push(/^specs\/[^/]+\/archives\//);
    else if (transmission) {
      if (!existsSync(join(racine, motif))) erreurs.push(`.geminiignore : ${motif}, fichier absent`);
      else if (versionsCourantes.get(transmission[1]) === transmission[2]) erreurs.push(`.geminiignore : ${motif} est la transmission courante de ${transmission[1]}, que Gemini CLI doit pouvoir lire`);
      regles.push(new RegExp(`^${echapper(motif)}$`));
    } else erreurs.push(`.geminiignore : motif ${motif}, hors de l'historique (specs/*/archives/ ou une ancienne transmission)`);
  }
  const cache = (fichier) => regles.some((r) => r.test(fichier));
  for (const fichier of fichiersDuDepot()) {
    if (!TEXTE.test(fichier) || cache(fichier) || !existsSync(join(racine, fichier))) continue;
    const lignes = lire(join(racine, fichier)).split('\n');
    const i = lignes.findIndex((l) => MOTIF_NOMS.test(l));
    if (i >= 0) erreurs.push(`${fichier}, ligne ${i + 1} : « ${MOTIF_NOMS.exec(lignes[i])[0]} », nom d'un autre hôte d'IA ou de son éditeur, hors de l'historique que .geminiignore cache à Gemini CLI`);
  }
  return motifs.length;
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
const avantCatalogue = erreurs.length;
const clausesCataloguees = verifierCatalogue();
const catalogueAJour = erreurs.length === avantCatalogue;
const avantViabilite = erreurs.length;
const viabilite = verifierViabilite();
const viabiliteAJour = viabilite !== null && erreurs.length === avantViabilite;
// Glossaire : il doit être exactement celui que génère tools/glossaire.mjs.
let glossaireAJour = false;
if (!existsSync(CHEMIN_GLOSSAIRE)) erreurs.push('glossaire.md : absent, lancer node tools/glossaire.mjs');
else if (lire(CHEMIN_GLOSSAIRE) !== genererGlossaire()) erreurs.push("glossaire.md : n'est plus à jour, lancer node tools/glossaire.mjs");
else glossaireAJour = true;
// Propositions de l'observatoire : chacune au format observatoire.proposition/1.
const avantPropositions = erreurs.length;
const propositions = lirePropositions(racine);
erreurs.push(...propositions.erreurs);
const propositionsConformes = erreurs.length === avantPropositions;
// Examens indépendants : chacun au format observatoire.examen/1 ; une proposition ratifiée a le sien.
const avantExamens = erreurs.length;
const examens = lireExamens(racine);
erreurs.push(...examens.erreurs, ...controlerRatifications(racine).erreurs);
const examensConformes = erreurs.length === avantExamens;
// Formes propres : révision selon EVOLUTION.md, section 10.7.
const avantFormes = erreurs.length;
const formes = verifierFormesPropres(examens.examens);
const formesConformes = erreurs.length === avantFormes;
const avantHistorique = erreurs.length;
const versionsCourantes = new Map(
  readdirSync(dossierSpecs)
    .filter((nom) => existsSync(join(dossierSpecs, nom, 'manifest.json')))
    .map((nom) => {
      try {
        return [nom, JSON.parse(lire(join(dossierSpecs, nom, 'manifest.json'))).version];
      } catch {
        return [nom, undefined];
      }
    }),
);
const motifsCaches = verifierHistoriqueCache(versionsCourantes);

for (const { bilan } of specs) console.log(`ok  ${bilan}`);
if (readmeAJour) console.log('ok  README.md à jour');
if (glossaireAJour) console.log('ok  glossaire.md à jour');
if (catalogueAJour) console.log(`ok  EVOLUTION.md : catalogue des signaux, ${clausesCataloguees} clauses de second ordre classées`);
if (viabiliteAJour) {
  const accord = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;
  console.log(`ok  EVOLUTION.md : viabilité des couplages, ${accord(viabilite.lignes, 'ligne')}, ${accord(viabilite['prouvé'], 'prouvée')}, ${accord(viabilite.partiel, 'partielle')}, ${viabilite['non couvert']} non couverte${viabilite['non couvert'] > 1 ? 's' : ''} ; ${accord(viabilite.preuves, 'preuve')} testée${viabilite.preuves > 1 ? 's' : ''} ; lecture 7E au troisième ordre`);
}
if (propositionsConformes) console.log(`ok  ${PROPOSITIONS}/ : ${propositions.propositions.length} proposition${propositions.propositions.length > 1 ? 's' : ''} au format observatoire.proposition/1`);
if (examensConformes) console.log(`ok  ${EXAMENS}/ : ${examens.examens.length} examen${examens.examens.length > 1 ? 's' : ''} au format observatoire.examen/1 ; chaque proposition ratifiée a le sien`);
if (formesConformes) {
  const relachements = formes.relachements === 0 ? 'aucun relâchement' : `${formes.relachements} relâchement${formes.relachements > 1 ? 's' : ''}, chacun examiné`;
  console.log(`ok  formes propres : noyau de socle-acceptable ${formes.noyau ?? 'sans version précédente'} ; ${formes.constitutions} constitution${formes.constitutions > 1 ? 's' : ''} d'exemple comparée${formes.constitutions > 1 ? 's' : ''} à leur version précédente, ${relachements}`);
}
if (erreurs.length === avantHistorique) console.log(`ok  historique caché à Gemini CLI (${motifsCaches} motifs de .geminiignore), aucun nom d'un autre hôte d'IA ailleurs`);
const uniques = [...new Set(erreurs)];
for (const message of uniques) console.error(`ERREUR  ${message}`);
if (uniques.length > 0) process.exit(1);
console.log(`${specs.length} spécifications vérifiées, transmissions fidèles, aucune erreur`);
