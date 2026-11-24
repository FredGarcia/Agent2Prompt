#!/usr/bin/env node
/**
 * Installe ou met à jour, dans Gemini CLI, tous les skills et tous les agents du dépôt Agent2Prompt.
 *
 * Usage, depuis n'importe quel dossier, avec un clone du dépôt à jour (git pull) :
 *
 *     node <dépôt>/installer.mjs                     installer ou mettre à jour tout, au niveau utilisateur
 *     node <dépôt>/installer.mjs --liste             état de chaque skill, agent et commande
 *     node <dépôt>/installer.mjs --fusionne <nom>... la version déposée à fusionner l'a été : elle devient la base
 *     node <dépôt>/installer.mjs --retirer           retirer ce que cet installateur a installé, s'il est intact
 *
 * Sous Windows, dans CMD : <dépôt>\installer.cmd, avec les mêmes options.
 *
 * Options :
 *
 *     --workspace <dossier>   niveau d'un projet, <dossier>/.gemini/, plutôt que le niveau utilisateur
 *     --forcer                remplacer ou retirer malgré des changements locaux, sauvegardés d'abord
 *     --essai                 afficher ce qui serait fait, sans rien écrire
 *
 * Niveau utilisateur : ~/.gemini/, ou $GEMINI_CLI_HOME/.gemini/ si cette variable est posée. L'état de
 * l'installateur vit dans son dossier agent2prompt/, que Gemini CLI ne lit pas.
 *
 * Skills : chaque skill installable, depuis sa transmission courante, comme le fait tools/installer.mjs
 * (fichiers transmis, CONSIGNE.md, fichiers tirés des modules, integrite.sha256), dans skills/<nom>/.
 * Absent, il est installé. Intact, il est mis à jour en place : les fichiers ajoutés depuis son
 * installation (node_modules, fichiers de travail) restent. Modifié, il reste tel quel : la nouvelle
 * version est déposée dans agent2prompt/a-fusionner/skills/<nom>-<version>/, avec ses écarts, et
 * --fusionne <nom>, une fois la fusion faite à la main, en fait la base de l'installation. Les systèmes
 * à construire ne s'installent pas ; analyse-projet et observatoire ne s'installent qu'au niveau utilisateur.
 *
 * Agents et commandes : ceux que porte chaque skill installé, agent/*.md et commandes/<groupe>/*.toml,
 * copiés dans agents/ et commands/<groupe>/. La copie s'adapte à Gemini CLI, jamais le fichier du skill,
 * comme le demandent leurs modules : outils nommés comme Gemini CLI dans l'en-tête, chemin du skill
 * installé à la place de <DOSSIER_DU_SKILL> et de .skills/<nom>/. Une copie modifiée depuis son
 * installation reste en place ; la nouvelle est déposée dans agent2prompt/a-fusionner/. L'empreinte de
 * chaque copie installée est tenue dans agent2prompt/installation.json.
 *
 * Au niveau d'un projet, dans un dépôt Git, les skills sont masqués à git status comme le fait
 * tools/installer.mjs, et les agents, les commandes et l'état de l'installateur par l'exclusion locale.
 * Node 20 ou plus récent, modules natifs, et git pour le masquage.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, rmdirSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  basculer,
  CONSIGNE,
  comparerVersions,
  contenusAttendus,
  depotGit,
  enPosix,
  Erreur,
  etatInstalle,
  git,
  INTEGRITE,
  lireTransmission,
  listerFichiers,
  mettreAJourMasquage,
  nettoyerTemporaires,
  pluriel,
  sha256,
  skillsDuDepot,
  SUPPRIMER,
  tableDe,
  UTILISATEUR_SEUL,
} from './tools/installer.mjs';

const RACINE = dirname(fileURLToPath(import.meta.url));
const ETAT = 'agent2prompt';
const REGISTRE = 'installation.json';
const A_FUSIONNER = 'a-fusionner';
const SAUVEGARDES = 'sauvegardes';
const ECARTS = 'ECARTS.txt';
/** Marqueur d'une mise à jour en place inachevée : la table visée, pour la reprendre. */
const JOURNAL = '.agent2prompt-mise-a-jour';
const DEBUT_BLOC = '# >>> installateur agent2prompt : agents, commandes et état de installer.mjs';
const FIN_BLOC = '# <<< installateur agent2prompt';

/** Noms d'outils d'un en-tête d'agent écrit pour un autre outil, et leur nom dans Gemini CLI 0.67.0. */
const OUTILS_GEMINI = new Map([
  ['Bash', 'run_shell_command'],
  ['Read', 'read_file'],
  ['Glob', 'glob'],
  ['Grep', 'grep_search'],
  ['LS', 'list_directory'],
  ['Write', 'write_file'],
  ['Edit', 'replace'],
  ['WebFetch', 'web_fetch'],
  ['WebSearch', 'google_web_search'],
]);
const NOMS_GEMINI = new Set([...OUTILS_GEMINI.values(), 'read_many_files', 'write_todos', 'save_memory']);

const horodatage = () => new Date().toISOString().replace(/[:.]/g, '-');
const nombre = (n, singulier, plurielle) => `${n} ${n > 1 ? plurielle : singulier}`;

// ---------------------------------------------------------------------------
// Niveau d'installation, registre, dépôts à fusionner
// ---------------------------------------------------------------------------

function niveau(options) {
  const utilisateur = !options.workspace;
  const gemini = join(utilisateur ? process.env.GEMINI_CLI_HOME || homedir() : options.workspace, '.gemini');
  return {
    utilisateur,
    workspace: options.workspace,
    gemini,
    skills: join(gemini, 'skills'),
    etat: join(gemini, ETAT),
    affiche: (chemin) => (utilisateur ? chemin : enPosix(relative(options.workspace, chemin)) || '.'),
  };
}

function lireRegistre(n) {
  const chemin = join(n.etat, REGISTRE);
  if (!existsSync(chemin)) return { format: 1, fichiers: {} };
  try {
    const lu = JSON.parse(readFileSync(chemin, 'utf8'));
    return { format: 1, fichiers: lu.fichiers ?? {} };
  } catch {
    throw new Erreur(`${chemin} illisible : corrigez-le ou supprimez-le, puis relancez`);
  }
}

function ecrireRegistre(n, registre, essai) {
  if (essai) return;
  const chemin = join(n.etat, REGISTRE);
  const fichiers = Object.fromEntries(Object.keys(registre.fichiers).sort().map((k) => [k, registre.fichiers[k]]));
  if (Object.keys(fichiers).length === 0) {
    rmSync(chemin, { force: true });
    return;
  }
  const texte = `${JSON.stringify({ format: 1, depot: RACINE, fichiers }, null, 2)}\n`;
  if (existsSync(chemin) && readFileSync(chemin, 'utf8') === texte) return;
  mkdirSync(n.etat, { recursive: true });
  writeFileSync(chemin, texte);
}

const dossierAFusionner = (n, ...parties) => join(n.etat, A_FUSIONNER, ...parties);

/** Retire les dépôts à fusionner d'un skill, toutes versions. */
function oublierDepotsSkill(n, nom, essai) {
  const base = dossierAFusionner(n, 'skills');
  if (essai || !existsSync(base)) return;
  for (const e of readdirSync(base)) if (new RegExp(`^${nom}-\\d+\\.\\d+\\.\\d+$`).test(e)) rmSync(join(base, e), SUPPRIMER);
  supprimerSiVide(base);
  supprimerSiVide(dossierAFusionner(n));
}

function supprimerSiVide(dossier) {
  try {
    if (existsSync(dossier) && readdirSync(dossier).length === 0) rmdirSync(dossier);
  } catch {
    // Un dossier qu'un autre programme garde ouvert : il restera vide.
  }
}

/** Supprime les dossiers devenus vides entre `rel` et `racine`, exclue. */
function remonterVides(racine, rel) {
  for (let d = dirname(rel); d && d !== '.' && d !== '/'; d = dirname(d)) supprimerSiVide(join(racine, ...d.split('/')));
}

/** Copie des fichiers locaux avant de les remplacer ou de les supprimer (--forcer). */
function sauvegarder(n, nom, dossier, rels) {
  const cible = join(n.etat, SAUVEGARDES, `${nom}-${horodatage()}`);
  for (const rel of rels) {
    const source = join(dossier, ...rel.split('/'));
    if (!existsSync(source)) continue;
    mkdirSync(dirname(join(cible, ...rel.split('/'))), { recursive: true });
    cpSync(source, join(cible, ...rel.split('/')), { recursive: true });
  }
  return cible;
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

/** Table lue au format `sha256sum -c` : chemin vers empreinte. */
function lireTable(texte) {
  const table = new Map();
  for (const ligne of texte.replace(/\r\n/g, '\n').split('\n')) {
    const m = /^([0-9a-f]{64}) {2}(.+)$/.exec(ligne);
    if (m) table.set(m[2], m[1]);
  }
  return table;
}

/**
 * Changements locaux d'un skill installé : fichiers modifiés ou supprimés depuis son installation. Les
 * fichiers ajoutés depuis ne comptent pas. Une mise à jour en place inachevée (journal) ne compte pas
 * non plus : un fichier qui porte déjà sa nouvelle version est le sien.
 */
function changementsLocaux(etat, dossier) {
  const journal = join(dossier, JOURNAL);
  const vise = existsSync(journal) ? lireTable(readFileSync(journal, 'utf8')) : new Map();
  const modifies = etat.modifies.filter((rel) => !vise.has(rel) || sha256(readFileSync(join(dossier, ...rel.split('/')))) !== vise.get(rel));
  const supprimes = etat.supprimes.filter((rel) => vise.size === 0 || vise.has(rel));
  return { modifies, supprimes, reprise: vise.size > 0 };
}

function ecrireNeuf(n, nom, contenus, table) {
  const dossier = join(n.skills, nom);
  mkdirSync(n.skills, { recursive: true });
  nettoyerTemporaires(n.skills, nom);
  const nouveau = join(n.skills, `.${nom}.nouveau-${process.pid}`);
  for (const [rel, contenu] of contenus) {
    const chemin = join(nouveau, ...rel.split('/'));
    mkdirSync(dirname(chemin), { recursive: true });
    writeFileSync(chemin, contenu);
  }
  writeFileSync(join(nouveau, INTEGRITE), table);
  for (const [rel, contenu] of contenus) {
    if (sha256(readFileSync(join(nouveau, ...rel.split('/')))) !== sha256(contenu)) {
      rmSync(nouveau, SUPPRIMER);
      throw new Erreur(`${nom} : relecture fausse pour ${rel}`);
    }
  }
  basculer(nouveau, dossier, n.skills, nom);
}

/**
 * Mise à jour en place : les fichiers de la nouvelle version remplacent ceux de l'ancienne, ceux qui
 * n'en sont plus disparaissent, et les fichiers ajoutés depuis l'installation restent. Le journal porte
 * la table visée jusqu'à la fin : une mise à jour interrompue se reprend au lancement suivant.
 */
function mettreAJourEnPlace(dossier, ancienne, contenus, table) {
  writeFileSync(join(dossier, JOURNAL), table);
  for (const [rel, contenu] of contenus) {
    const chemin = join(dossier, ...rel.split('/'));
    if (existsSync(chemin) && sha256(readFileSync(chemin)) === sha256(contenu)) continue;
    mkdirSync(dirname(chemin), { recursive: true });
    writeFileSync(chemin, contenu);
  }
  const gardes = new Set(contenus.map(([rel]) => rel));
  for (const rel of ancienne.keys()) {
    if (gardes.has(rel)) continue;
    rmSync(join(dossier, ...rel.split('/')), { force: true });
    remonterVides(dossier, rel);
  }
  for (const [rel, contenu] of contenus) {
    if (sha256(readFileSync(join(dossier, ...rel.split('/')))) !== sha256(contenu)) throw new Erreur(`${dossier} : relecture fausse pour ${rel}`);
  }
  writeFileSync(join(dossier, INTEGRITE), table);
  rmSync(join(dossier, JOURNAL), { force: true });
}

/** Dépose la nouvelle version d'un skill gardé, avec la liste de ses écarts, pour une fusion à la main. */
function deposerSkill(n, t, contenus, table, dossier, etat, locaux, essai) {
  const cible = dossierAFusionner(n, 'skills', `${t.nom}-${t.version}`);
  if (essai) return cible;
  oublierDepotsSkill(n, t.nom, false);
  for (const [rel, contenu] of contenus) {
    const chemin = join(cible, ...rel.split('/'));
    mkdirSync(dirname(chemin), { recursive: true });
    writeFileSync(chemin, contenu);
  }
  writeFileSync(join(cible, INTEGRITE), table);
  const changes = [...locaux.modifies.map((r) => `  ${r} (modifié)`), ...locaux.supprimes.map((r) => `  ${r} (supprimé)`)];
  writeFileSync(
    join(cible, ECARTS),
    [
      `${t.nom} ${t.version}, déposé par ${join(RACINE, 'installer.mjs')} le ${new Date().toISOString().slice(0, 10)}.`,
      '',
      `Version installée : ${etat?.version ?? 'inconnue'}, dans ${dossier}.`,
      etat?.gere
        ? `Fichiers changés depuis son installation, que la version installée garde :\n${changes.join('\n')}`
        : `Ce dossier n'a pas été installé par l'installateur du dépôt : il n'a pas de ${INTEGRITE}.`,
      '',
      `Comparer : git diff --no-index "${dossier}" "${cible}"`,
      `Une fois la fusion faite dans ${dossier}, manifest.json compris :`,
      `  node "${join(RACINE, 'installer.mjs')}" --fusionne ${t.nom}`,
      `Pour prendre la nouvelle version telle quelle, changements locaux sauvegardés dans ${join(n.etat, SAUVEGARDES)} :`,
      `  node "${join(RACINE, 'installer.mjs')}" --forcer`,
      '',
    ].join('\n'),
  );
  return cible;
}

/**
 * Installe, met à jour ou garde un skill. Renvoie son issue : installé, mis à jour, à jour, gardé (et
 * déposé à fusionner), remplacé (--forcer) ou écarté, avec la ligne du compte rendu.
 */
function traiterSkill(s, n, options) {
  const t = lireTransmission(s.chemin);
  if (t.systeme) return { nom: t.nom, issue: 'ecarte', ligne: `${t.nom} : non installé, système à construire (sa consigne le matérialise dans spec/ de son propre projet)` };
  if (!n.utilisateur && UTILISATEUR_SEUL.has(t.nom)) return { nom: t.nom, issue: 'ecarte', ligne: `${t.nom} : non installé, niveau utilisateur seul (${UTILISATEUR_SEUL.get(t.nom)})` };
  const contenus = contenusAttendus(t);
  const table = tableDe(contenus);
  const dossier = join(n.skills, t.nom);
  const ici = `${t.nom} ${t.version}`;
  const tires = contenus.length - t.fichiers.length - 1;
  const essai = options.essai ? 'essai : ' : '';
  const etat = etatInstalle(dossier);

  const nouveaux = new Map(contenus);
  if (!etat) {
    if (!options.essai) ecrireNeuf(n, t.nom, contenus, table);
    return { nom: t.nom, version: t.version, dossier, contenus: nouveaux, issue: 'installe', ligne: `${essai}${ici} : installé${tires > 0 ? `, ${pluriel(tires, 'fichier')} tiré${tires > 1 ? 's' : ''} des modules` : ''}` };
  }

  const locaux = etat.gere ? changementsLocaux(etat, dossier) : { modifies: [], supprimes: [], reprise: false };
  const nLocaux = locaux.modifies.length + locaux.supprimes.length;
  const pareil = etat.gere && etat.table === table && !locaux.reprise;

  if (pareil) {
    if (!options.essai) oublierDepotsSkill(n, t.nom, false);
    const garde = nLocaux > 0 ? `, ${nombre(nLocaux, 'changement local', 'changements locaux')} gardé${nLocaux > 1 ? 's' : ''}` : '';
    return { nom: t.nom, version: t.version, dossier, issue: 'a-jour', ligne: `${ici} : à jour${garde}` };
  }

  if (etat.gere && nLocaux === 0) {
    if (!options.essai) mettreAJourEnPlace(dossier, lireTable(etat.table), contenus, table);
    const avant = etat.version && etat.version !== t.version ? `${etat.version} → ${t.version}` : locaux.reprise ? 'mise à jour interrompue reprise' : 'installation complétée';
    const ajoutes = etat.ajoutes.filter((r) => r !== JOURNAL).length;
    const gardes = ajoutes > 0 ? ` ; ${nombre(ajoutes, 'fichier ajouté', 'fichiers ajoutés')} depuis l'installation, gardé${ajoutes > 1 ? 's' : ''}` : '';
    return { nom: t.nom, version: t.version, dossier, contenus: nouveaux, issue: 'mis-a-jour', ligne: `${essai}${ici} : mis à jour (${avant})${gardes}` };
  }

  if (options.forcer) {
    const aSauver = etat.gere ? locaux.modifies : listerFichiers(dossier);
    const sauvegarde = options.essai || aSauver.length === 0 ? null : sauvegarder(n, t.nom, dossier, aSauver);
    if (!options.essai) {
      if (etat.gere) mettreAJourEnPlace(dossier, lireTable(etat.table), contenus, table);
      else ecrireNeuf(n, t.nom, contenus, table);
      oublierDepotsSkill(n, t.nom, false);
    }
    const sauve = sauvegarde ? `, changements locaux sauvegardés dans ${sauvegarde}` : '';
    return { nom: t.nom, version: t.version, dossier, contenus: nouveaux, issue: 'remplace', ligne: `${essai}${ici} : remplacé malgré ${etat.gere ? nombre(nLocaux, 'changement local', 'changements locaux') : `l'absence de ${INTEGRITE}`} (--forcer)${sauve}` };
  }

  const cible = deposerSkill(n, t, contenus, table, dossier, etat, locaux, options.essai);
  const pourquoi = etat.gere ? `${nombre(nLocaux, 'changement local', 'changements locaux')} depuis son installation (${etat.version ?? '?'})` : `installé hors de cet installateur, sans ${INTEGRITE}`;
  return {
    nom: t.nom,
    version: etat.version ?? t.version,
    dossier,
    issue: 'garde',
    ligne: `${essai}${ici} : gardé tel quel, ${pourquoi} ; nouvelle version ${options.essai ? 'à déposer' : 'déposée'} dans ${n.affiche(cible)}`,
  };
}

// ---------------------------------------------------------------------------
// Agents et commandes
// ---------------------------------------------------------------------------

/** Valeur d'un champ d'en-tête sur une ligne, guillemets YAML ôtés. */
function valeurDe(brute) {
  const v = brute.trim();
  if (v.startsWith('"') && v.endsWith('"')) return JSON.parse(v);
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
  return v;
}

/**
 * En-tête d'un agent pour Gemini CLI. Un en-tête déjà écrit pour Gemini CLI, qui porte `kind`, reste tel
 * quel. Un en-tête écrit pour un autre outil, champs sur une ligne et `tools: A, B`, devient celui d'un
 * sous-agent local de Gemini CLI : nom, description entre guillemets (elle peut contenir « : »),
 * `kind: local` et la liste des outils sous leur nom dans Gemini CLI.
 */
function adapterEntete(contenu, ici) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(contenu);
  if (!m) throw new Erreur(`${ici} : sans en-tête entre deux lignes ---, Gemini CLI ne le chargerait pas`);
  const lignes = m[1].split('\n');
  if (lignes.some((l) => /^kind:/.test(l))) return { contenu, outils: null };
  const champs = new Map();
  for (const l of lignes) {
    const c = /^([A-Za-z_][\w-]*):(.*)$/.exec(l);
    if (c) champs.set(c[1], c[2]);
    else if (l.trim() !== '') throw new Erreur(`${ici} : ligne d'en-tête sur plusieurs lignes, à adapter à la main : ${l.trim()}`);
  }
  const autres = [...champs.keys()].filter((k) => !['name', 'description', 'tools'].includes(k));
  if (autres.length > 0) throw new Erreur(`${ici} : champ d'en-tête sans équivalent sûr dans Gemini CLI, ${autres.join(', ')}`);
  const nom = valeurDe(champs.get('name') ?? '');
  const description = valeurDe(champs.get('description') ?? '');
  if (!/^[a-z0-9_-]+$/.test(nom)) throw new Erreur(`${ici} : nom d'agent ${JSON.stringify(nom)}, attendu en minuscules, chiffres et tirets`);
  if (description === '') throw new Erreur(`${ici} : description absente`);
  const noms = (champs.get('tools') ?? '')
    .trim()
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((x) => valeurDe(x))
    .filter(Boolean);
  const inconnus = noms.filter((x) => !OUTILS_GEMINI.has(x) && !NOMS_GEMINI.has(x));
  if (inconnus.length > 0) throw new Erreur(`${ici} : outil sans équivalent dans Gemini CLI, ${inconnus.join(', ')}`);
  const gemini = [...new Set(noms.map((x) => OUTILS_GEMINI.get(x) ?? x))];
  const outils = gemini.length > 0 ? ['tools:', ...gemini.map((x) => `  - ${x}`)] : [];
  const entete = ['---', `name: ${nom}`, `description: ${JSON.stringify(description)}`, 'kind: local', ...outils, '---', ''].join('\n');
  return { contenu: entete + contenu.slice(m[0].length), outils: gemini };
}

/** Chemin du skill installé à la place de `<DOSSIER_DU_SKILL>` (natif) et de `.skills/<nom>/` (barres obliques). */
function adapterChemins(contenu, dossier, nom) {
  const posix = `${enPosix(dossier)}/`;
  let n = 0;
  const remplacer = (texte, motif, par) => {
    const parties = texte.split(motif);
    n += parties.length - 1;
    return parties.join(par);
  };
  let texte = remplacer(contenu, '<DOSSIER_DU_SKILL>', dossier);
  texte = remplacer(texte, `../.skills/${nom}/`, posix);
  texte = remplacer(texte, `.skills/${nom}/`, posix);
  return { contenu: texte, remplacements: n };
}

/**
 * Copies attendues des agents et des commandes que portent les skills installés : chemin sous .gemini/,
 * contenu adapté, skill d'origine et description de l'adaptation.
 */
function copiesAttendues(skills) {
  const copies = new Map();
  for (const s of skills) {
    // Les fichiers du skill après son traitement : la nouvelle version s'il l'a reçue, sinon le disque.
    const rels = s.contenus ? [...s.contenus.keys()] : existsSync(s.dossier) ? listerFichiers(s.dossier) : [];
    const sources = [];
    for (const rel of rels.sort()) {
      let m = /^agent\/([^/]+)\.md$/.exec(rel);
      if (m) sources.push({ rel, cible: `agents/${m[1]}.md`, type: 'agent', nom: m[1] });
      m = /^commandes\/([^/]+)\/([^/]+)\.toml$/.exec(rel);
      if (m) sources.push({ rel, cible: `commands/${m[1]}/${m[2]}.toml`, type: 'commande', nom: `/${m[1]}:${m[2]}` });
    }
    for (const src of sources) {
      const ici = `${s.nom}, ${src.rel}`;
      const brut = (s.contenus ? s.contenus.get(src.rel) : readFileSync(join(s.dossier, ...src.rel.split('/')), 'utf8')).replace(/\r\n/g, '\n');
      const chemins = adapterChemins(brut, s.dossier, s.nom);
      const entete = src.type === 'agent' ? adapterEntete(chemins.contenu, ici) : { contenu: chemins.contenu, outils: null };
      const adaptations = [];
      if (entete.outils) adaptations.push(`en-tête adapté à Gemini CLI (outils : ${entete.outils.join(', ')})`);
      if (chemins.remplacements > 0) adaptations.push(`chemin du skill installé (${chemins.remplacements})`);
      if (copies.has(src.cible)) throw new Erreur(`${src.cible} : porté par ${copies.get(src.cible).skill} et par ${s.nom}`);
      copies.set(src.cible, { ...src, skill: s.nom, version: s.version, contenu: entete.contenu, adaptations });
    }
  }
  return copies;
}

/** Nom d'une copie : celui de l'agent, ou /<groupe>:<commande>. */
function nomDeCopie(rel) {
  const agent = /^agents\/([^/]+)\.md$/.exec(rel);
  if (agent) return agent[1];
  const commande = /^commands\/([^/]+)\/([^/]+)\.toml$/.exec(rel);
  return commande ? `/${commande[1]}:${commande[2]}` : rel;
}

/** État d'une copie installée par rapport au registre et au contenu attendu. */
function etatCopie(n, registre, rel, attendu) {
  const chemin = join(n.gemini, ...rel.split('/'));
  const actuel = existsSync(chemin) ? sha256(readFileSync(chemin)) : null;
  const note = registre.fichiers[rel];
  const vise = attendu === undefined ? undefined : sha256(attendu);
  if (actuel === null) return { chemin, actuel, note, etat: 'absent' };
  if (vise !== undefined && actuel === vise) return { chemin, actuel, note, etat: 'a-jour' };
  if (note && actuel === note.sha256) return { chemin, actuel, note, etat: vise === undefined ? 'intact' : 'ancien' };
  if (note && vise !== undefined && note.sha256 === vise) return { chemin, actuel, note, etat: 'modifie-a-jour' };
  return { chemin, actuel, note, etat: 'modifie' };
}

function traiterCopies(n, registre, copies, gardes, options) {
  const lignes = [];
  lignes.changees = 0;
  lignes.deposees = 0;
  const essai = options.essai ? 'essai : ' : '';
  for (const [rel, c] of copies) {
    const e = etatCopie(n, registre, rel, c.contenu);
    const ici = `${c.nom} (${rel})`;
    const plus = c.adaptations.length > 0 ? ` ; ${c.adaptations.join(', ')}` : '';
    const noter = () => {
      registre.fichiers[rel] = { sha256: sha256(c.contenu), skill: c.skill, version: c.version };
    };
    const oublierDepot = () => {
      if (options.essai || !existsSync(dossierAFusionner(n, ...rel.split('/')))) return;
      rmSync(dossierAFusionner(n, ...rel.split('/')), { force: true });
      remonterVides(n.etat, `${A_FUSIONNER}/${rel}`);
    };
    const ecrire = () => {
      if (options.essai) return;
      mkdirSync(dirname(e.chemin), { recursive: true });
      writeFileSync(e.chemin, c.contenu);
      oublierDepot();
    };
    if (e.etat === 'absent') {
      ecrire();
      noter();
      lignes.changees++;
      lignes.push(`${essai}${ici} : installé${plus}`);
    } else if (e.etat === 'a-jour') {
      noter();
      oublierDepot();
      lignes.push(`${ici} : à jour`);
    } else if (e.etat === 'ancien') {
      ecrire();
      noter();
      lignes.changees++;
      lignes.push(`${essai}${ici} : mis à jour (${e.note.version ?? '?'} → ${c.version})${plus}`);
    } else if (e.etat === 'modifie-a-jour') {
      lignes.push(`${ici} : à jour, changé depuis son installation, gardé`);
    } else if (options.forcer) {
      const sauvegarde = options.essai ? null : sauvegarder(n, c.nom.replace(/[/:]/g, '-').replace(/^-/, ''), n.gemini, [rel]);
      ecrire();
      noter();
      lignes.changees++;
      lignes.push(`${essai}${ici} : remplacé malgré un changement local (--forcer)${sauvegarde ? `, sauvegardé dans ${sauvegarde}` : ''}`);
    } else {
      const cible = dossierAFusionner(n, ...rel.split('/'));
      if (!options.essai) {
        mkdirSync(dirname(cible), { recursive: true });
        writeFileSync(cible, c.contenu);
      }
      lignes.deposees++;
      const pourquoi = gardes.has(c.skill) ? '' : e.note ? ', changé depuis son installation' : ', installé hors de cet installateur';
      lignes.push(`${essai}${ici} : gardé tel quel${pourquoi} ; nouvelle copie ${options.essai ? 'à déposer' : 'déposée'} dans ${n.affiche(cible)}`);
    }
  }
  return lignes;
}

/** Copies notées au registre que plus aucun skill installé ne porte : retirées si intactes. */
function retirerObsoletes(n, registre, copies, traites, depot, options) {
  const lignes = [];
  for (const [rel, note] of Object.entries(registre.fichiers)) {
    if (copies.has(rel) || (depot.has(note.skill) && !traites.has(note.skill))) continue;
    lignes.push(...retirerCopie(n, registre, rel, options, `n'est plus porté par ${note.skill}`));
  }
  return lignes;
}

function retirerCopie(n, registre, rel, options, raison) {
  const e = etatCopie(n, registre, rel, undefined);
  const essai = options.essai ? 'essai : ' : '';
  if (e.etat === 'absent') {
    delete registre.fichiers[rel];
    return [];
  }
  if (e.etat !== 'intact' && !options.forcer) return [`${rel} : ${raison}, mais changé depuis son installation ; gardé (--forcer pour le retirer)`];
  const sauvegarde = e.etat !== 'intact' && !options.essai ? sauvegarder(n, rel.replace(/[/]/g, '-'), n.gemini, [rel]) : null;
  if (!options.essai) {
    rmSync(e.chemin, { force: true });
    remonterVides(n.gemini, rel);
  }
  delete registre.fichiers[rel];
  return [`${essai}${rel} : retiré (${raison})${sauvegarde ? `, sauvegardé dans ${sauvegarde}` : ''}`];
}

// ---------------------------------------------------------------------------
// Masquage au niveau d'un projet
// ---------------------------------------------------------------------------

/** Le texte sans le bloc de cet installateur, et les lignes de ce bloc. */
function separerBlocPropre(texte) {
  const dedans = [];
  const dehors = [];
  let dans = false;
  for (const ligne of texte.replace(/\r\n/g, '\n').split('\n')) {
    if (!dans && ligne === DEBUT_BLOC) dans = true;
    else if (dans && ligne === FIN_BLOC) dans = false;
    else (dans ? dedans : dehors).push(ligne);
  }
  return { lignes: dedans.filter((l) => l.trim() !== ''), reste: dehors.join('\n').replace(/\n+$/, '') };
}

/**
 * Exclusion locale des agents, des commandes et de l'état de l'installateur dans le projet. Gemini CLI les
 * charge par le système de fichiers : l'exclusion de Git ne les lui cache pas.
 */
function masquerCopies(n, depot, rels, essai) {
  const exclusion = existsSync(depot.exclusion) ? readFileSync(depot.exclusion, 'utf8') : '';
  const { reste } = separerBlocPropre(exclusion);
  const suivis = new Set((git(n.workspace, 'ls-files', '--', '.gemini') ?? '').split('\n').filter(Boolean));
  const lignes = rels.filter((r) => !suivis.has(r)).map((r) => `/${depot.prefixe}${r}`);
  if (existsSync(n.etat) || lignes.length > 0) lignes.push(`/${depot.prefixe}.gemini/${ETAT}/`);
  const texte = lignes.length > 0 ? `${reste ? `${reste}\n\n` : ''}${DEBUT_BLOC}\n${[...new Set(lignes)].sort().join('\n')}\n${FIN_BLOC}\n` : reste ? `${reste}\n` : '';
  if (!essai && texte !== exclusion.replace(/\r\n/g, '\n')) {
    mkdirSync(dirname(depot.exclusion), { recursive: true });
    writeFileSync(depot.exclusion, texte);
  }
  const ignores = rels.filter((r) => suivis.has(r));
  return ignores.length > 0 ? [`suivis par Git dans ce projet, laissés sans exclusion : ${ignores.join(', ')}`] : [];
}

function masquer(n, skills, registre, options, mode) {
  const depot = depotGit(n.workspace);
  if (!depot) return [];
  const lignes = [];
  let masques = 0;
  for (const nom of skills) {
    const ligne = mettreAJourMasquage(n.workspace, depot, nom, mode, options.essai);
    if (ligne && /^(essai : serait masqué|masqué) à Git/.test(ligne)) masques++;
    else if (ligne) lignes.push(`  ${nom} : ${ligne}`);
  }
  if (masques > 0) {
    const s = masques > 1 ? 's' : '';
    const verbe = options.essai ? `serai${masques > 1 ? 'ent' : 't'} ` : '';
    lignes.unshift(`  ${pluriel(masques, 'skill')} ${verbe}masqué${s} à Git, lisible${s} par Gemini CLI`);
  }
  const rels = Object.keys(registre.fichiers).map((r) => `.gemini/${r}`);
  lignes.push(...masquerCopies(n, depot, rels, options.essai).map((l) => `  ${l}`));
  if (depot.lie) lignes.push('  worktree : cette installation ne vaut que pour lui ; pour tous les worktrees, le niveau utilisateur');
  return lignes;
}

// ---------------------------------------------------------------------------
// Installer, fusionner, retirer, lister
// ---------------------------------------------------------------------------

function aFaire(n, issues, copies) {
  const lignes = [];
  const nouveaux = issues.filter((i) => ['installe', 'mis-a-jour', 'remplace'].includes(i.issue));
  if (nouveaux.length > 0 || copies.changees > 0) {
    lignes.push(`Dans les sessions ouvertes de Gemini CLI${n.utilisateur ? '' : ' de ce projet'} : /skills reload, /agents reload et /commands reload.`);
    if (!n.utilisateur) lignes.push('Si la confiance des dossiers est activée dans Gemini CLI, ce projet doit être de confiance : sinon, Gemini CLI ignore ses skills, agents et commandes.');
  }
  for (const i of issues) {
    if (!i.dossier || !existsSync(join(i.dossier, 'package.json')) || existsSync(join(i.dossier, 'node_modules'))) continue;
    lignes.push(`${i.nom} : ses dépendances, une fois, depuis son dossier : cd "${i.dossier}" puis npm ci`);
  }
  if (nouveaux.some((i) => i.nom === 'generateur-skill-ticket')) lignes.push(`generateur-skill-ticket : le chemin du clone qu'il demande, <dépôt>, est ${RACINE}`);
  const gardes = issues.filter((i) => i.issue === 'garde').map((i) => i.nom);
  if (gardes.length > 0 || copies.deposees > 0) {
    lignes.push(`À fusionner à la main, depuis ${n.affiche(dossierAFusionner(n))}${gardes.length > 0 ? ` : ${gardes.join(', ')} (écarts dans ${ECARTS})` : ''} ; puis --fusionne <nom>.`);
  }
  if (issues.some((i) => i.issue === 'installe')) {
    lignes.push(`À la première utilisation d'un skill : « Active le skill <skill>. L'étape 0 de sa consigne est faite : ses fichiers sont dans ${n.affiche(join(n.skills, '<skill>'))}, vérifiés par ${INTEGRITE}. Lis ${CONSIGNE} dans ce dossier et suis-la à partir de l'étape 1. »`);
  }
  return lignes;
}

function installerTout(n, options) {
  const registre = lireRegistre(n);
  const issues = [];
  const echecs = [];
  console.log(`${n.utilisateur ? 'Niveau utilisateur' : 'Niveau du projet'} : ${n.gemini}${options.essai ? ' (essai : rien n\'est écrit)' : ''}\n\nSkills`);
  for (const s of skillsDuDepot()) {
    try {
      const issue = traiterSkill(s, n, options);
      issues.push(issue);
      console.log(`  ${issue.ligne}`);
    } catch (e) {
      if (!(e instanceof Erreur)) throw e;
      echecs.push(s.nom);
      console.error(`  ÉCHEC  ${e.message}`);
    }
  }
  const installes = issues.filter((i) => i.issue !== 'ecarte');
  const gardes = new Set(issues.filter((i) => i.issue === 'garde').map((i) => i.nom));
  console.log('\nAgents et commandes');
  let lignes = [];
  let bilanCopies = { changees: 0, deposees: 0 };
  try {
    const copies = copiesAttendues(installes);
    const depot = new Set(skillsDuDepot().map((s) => s.nom));
    const traitees = traiterCopies(n, registre, copies, gardes, options);
    const retirees = retirerObsoletes(n, registre, copies, new Set(installes.map((i) => i.nom)), depot, options);
    bilanCopies = { changees: traitees.changees + retirees.filter((l) => / : retiré/.test(l)).length, deposees: traitees.deposees };
    lignes = [...traitees, ...retirees];
  } catch (e) {
    if (!(e instanceof Erreur)) throw e;
    echecs.push('agents et commandes');
    lignes = [`ÉCHEC  ${e.message}`];
  }
  console.log(lignes.length > 0 ? lignes.map((l) => `  ${l}`).join('\n') : '  aucun');
  ecrireRegistre(n, registre, options.essai);
  if (!n.utilisateur) {
    const m = masquer(n, installes.map((i) => i.nom), registre, options, 'masquer');
    if (m.length > 0) console.log(`\nGit\n${m.join('\n')}`);
  }
  const suite = aFaire(n, issues, bilanCopies);
  if (suite.length > 0) console.log(`\nÀ faire\n${suite.map((l) => `  - ${l}`).join('\n')}`);
  if (echecs.length > 0) {
    console.error(`\n${pluriel(echecs.length, 'skill')} en échec : ${echecs.join(', ')}.`);
    return 1;
  }
  return 0;
}

function fusionner(n, noms, options) {
  const registre = lireRegistre(n);
  const skills = new Map(skillsDuDepot().map((s) => [s.nom, s]));
  let echecs = 0;
  for (const nom of noms) {
    try {
      if (skills.has(nom)) {
        const t = lireTransmission(skills.get(nom).chemin);
        const dossier = join(n.skills, nom);
        if (!existsSync(dossierAFusionner(n, 'skills', `${nom}-${t.version}`))) throw new Erreur(`${nom} ${t.version} : aucune nouvelle version déposée à fusionner dans ${n.affiche(dossierAFusionner(n, 'skills'))}`);
        if (!existsSync(join(dossier, 'SKILL.md'))) throw new Erreur(`${nom} : non installé dans ${n.affiche(dossier)}, rien à fusionner`);
        const table = tableDe(contenusAttendus(t));
        if (!options.essai) {
          writeFileSync(join(dossier, INTEGRITE), table);
          rmSync(join(dossier, JOURNAL), { force: true });
          oublierDepotsSkill(n, nom, false);
        }
        const etat = options.essai ? null : etatInstalle(dossier);
        const reste = etat ? etat.modifies.length + etat.supprimes.length : 0;
        console.log(`${options.essai ? 'essai : ' : ''}${nom} ${t.version} : la version fusionnée devient la base de l'installation${reste > 0 ? ` ; ${nombre(reste, 'changement local', 'changements locaux')} par rapport au dépôt, gardé${reste > 1 ? 's' : ''}` : ''}`);
        continue;
      }
      const voulu = nom.replace(/^\//, '');
      const rel = Object.keys(registre.fichiers).find((r) => r === nom || nomDeCopie(r).replace(/^\//, '') === voulu);
      const depose = rel ? dossierAFusionner(n, ...rel.split('/')) : null;
      if (!rel || !existsSync(depose)) throw new Erreur(`${nom} : aucun skill de ce nom, ni d'agent ou de commande déposé à fusionner`);
      const contenu = readFileSync(depose, 'utf8');
      if (!options.essai) {
        registre.fichiers[rel] = { ...registre.fichiers[rel], sha256: sha256(contenu), version: registre.fichiers[rel].version };
        rmSync(depose, { force: true });
        remonterVides(n.etat, `${A_FUSIONNER}/${rel}`);
      }
      console.log(`${options.essai ? 'essai : ' : ''}${rel} : la copie fusionnée devient la base de l'installation`);
    } catch (e) {
      if (!(e instanceof Erreur)) throw e;
      echecs++;
      console.error(`ÉCHEC  ${e.message}`);
    }
  }
  ecrireRegistre(n, registre, options.essai);
  return echecs > 0 ? 1 : 0;
}

function retirerTout(n, options) {
  const registre = lireRegistre(n);
  const essai = options.essai ? 'essai : ' : '';
  console.log(`${n.utilisateur ? 'Niveau utilisateur' : 'Niveau du projet'} : ${n.gemini}${options.essai ? ' (essai : rien n\'est écrit)' : ''}\n`);
  const lignes = [];
  for (const rel of Object.keys(registre.fichiers)) lignes.push(...retirerCopie(n, registre, rel, options, 'retrait demandé'));
  const retires = [];
  for (const s of skillsDuDepot()) {
    const dossier = join(n.skills, s.nom);
    const etat = etatInstalle(dossier);
    if (!etat) continue;
    if (!etat.gere) {
      lignes.push(`${s.nom} : ${n.affiche(dossier)} n'a pas été installé par cet installateur ; gardé`);
      continue;
    }
    const locaux = changementsLocaux(etat, dossier);
    if (locaux.modifies.length + locaux.supprimes.length > 0 && !options.forcer) {
      lignes.push(`${s.nom} : ${nombre(locaux.modifies.length + locaux.supprimes.length, 'changement local', 'changements locaux')} depuis son installation ; gardé (--forcer pour le retirer)`);
      continue;
    }
    const sauvegarde = locaux.modifies.length > 0 && !options.essai ? sauvegarder(n, s.nom, dossier, locaux.modifies) : null;
    const ajoutes = etat.ajoutes.filter((r) => r !== JOURNAL);
    if (!options.essai) {
      for (const rel of [...lireTable(etat.table).keys(), INTEGRITE, JOURNAL]) {
        rmSync(join(dossier, ...rel.split('/')), { force: true });
        remonterVides(dossier, rel);
      }
      supprimerSiVide(dossier);
    }
    retires.push(s.nom);
    const garde = ajoutes.length > 0 ? ` ; ${nombre(ajoutes.length, 'fichier ajouté', 'fichiers ajoutés')} depuis l'installation, gardé${ajoutes.length > 1 ? 's' : ''} dans ${n.affiche(dossier)}` : '';
    lignes.push(`${essai}${s.nom} : retiré${sauvegarde ? `, changements locaux sauvegardés dans ${sauvegarde}` : ''}${garde}`);
  }
  console.log(lignes.length > 0 ? lignes.join('\n') : 'Rien à retirer.');
  ecrireRegistre(n, registre, options.essai);
  if (!options.essai) supprimerSiVide(n.etat);
  if (!n.utilisateur) {
    const m = masquer(n, retires, registre, options, 'retirer');
    if (m.length > 0) console.log(`\nGit\n${m.join('\n')}`);
  }
  for (const reste of [A_FUSIONNER, SAUVEGARDES]) if (existsSync(join(n.etat, reste))) console.log(`\nGardé : ${n.affiche(join(n.etat, reste))}`);
  return 0;
}

function lister(n) {
  const registre = lireRegistre(n);
  console.log(`Dépôt    ${RACINE}\nNiveau   ${n.utilisateur ? 'utilisateur' : 'projet'}, ${n.gemini}\n`);
  const lignes = [['skill', 'dépôt', 'installé']];
  const presents = [];
  for (const s of skillsDuDepot()) {
    let t;
    try {
      t = lireTransmission(s.chemin);
    } catch (e) {
      lignes.push([s.nom, s.version, `transmission illisible : ${e.message}`]);
      continue;
    }
    if (t.systeme) {
      lignes.push([s.nom, s.version, 'système à construire, non installable']);
      continue;
    }
    if (!n.utilisateur && UTILISATEUR_SEUL.has(s.nom)) {
      lignes.push([s.nom, s.version, 'niveau utilisateur seul']);
      continue;
    }
    const dossier = join(n.skills, s.nom);
    const etat = etatInstalle(dossier);
    if (!etat) {
      lignes.push([s.nom, s.version, '—']);
      continue;
    }
    presents.push({ nom: s.nom, version: s.version, dossier });
    if (!etat.gere) {
      lignes.push([s.nom, s.version, `sans ${INTEGRITE}, installé hors de cet installateur`]);
      continue;
    }
    const locaux = changementsLocaux(etat, dossier);
    const nLocaux = locaux.modifies.length + locaux.supprimes.length;
    const table = tableDe(contenusAttendus(t));
    const details = [etat.version ?? '?'];
    if (etat.table !== table) details.push(etat.version && comparerVersions(etat.version, s.version) < 0 ? 'ancienne' : 'à compléter');
    if (nLocaux > 0) details.push(nombre(nLocaux, 'changement local', 'changements locaux'));
    if (existsSync(dossierAFusionner(n, 'skills', `${s.nom}-${s.version}`))) details.push('nouvelle version à fusionner');
    lignes.push([s.nom, s.version, details.join(', ')]);
  }
  const largeurs = [0, 1].map((i) => Math.max(...lignes.map((l) => l[i].length)) + 3);
  for (const l of lignes) console.log(`${l[0].padEnd(largeurs[0])}${l[1].padEnd(largeurs[1])}${l[2]}`.trimEnd());

  let copies;
  try {
    copies = copiesAttendues(presents);
  } catch (e) {
    if (!(e instanceof Erreur)) throw e;
    console.log(`\nAgents et commandes : ${e.message}`);
    return;
  }
  const libelles = { absent: 'absent', 'a-jour': 'à jour', ancien: 'à mettre à jour', 'modifie-a-jour': 'à jour, changé localement', modifie: 'changé localement' };
  const lignesCopies = [['agent ou commande', 'skill', 'état']];
  for (const [rel, c] of copies) {
    const e = etatCopie(n, registre, rel, c.contenu);
    lignesCopies.push([`${c.nom} (${rel})`, c.skill, `${libelles[e.etat]}${existsSync(dossierAFusionner(n, ...rel.split('/'))) ? ', nouvelle copie à fusionner' : ''}`]);
  }
  for (const rel of Object.keys(registre.fichiers)) if (!copies.has(rel)) lignesCopies.push([rel, registre.fichiers[rel].skill, 'plus porté par son skill']);
  if (lignesCopies.length > 1) {
    const l2 = [0, 1].map((i) => Math.max(...lignesCopies.map((l) => l[i].length)) + 3);
    console.log('');
    for (const l of lignesCopies) console.log(`${l[0].padEnd(l2[0])}${l[1].padEnd(l2[1])}${l[2]}`.trimEnd());
  }
}

// ---------------------------------------------------------------------------
// Ligne de commande
// ---------------------------------------------------------------------------

const AIDE = `Installe ou met à jour, dans Gemini CLI, tous les skills et tous les agents du dépôt Agent2Prompt.

  node installer.mjs                       installer ou mettre à jour tout, au niveau utilisateur (~/.gemini/)
  node installer.mjs --liste               état de chaque skill, agent et commande
  node installer.mjs --fusionne <nom>...   la version déposée à fusionner l'a été : elle devient la base
  node installer.mjs --retirer             retirer ce que cet installateur a installé, s'il est intact

Sous Windows, dans CMD : installer.cmd, avec les mêmes options.

Options :
  --workspace <dossier>   niveau d'un projet, <dossier>/.gemini/, plutôt que le niveau utilisateur
  --forcer                remplacer ou retirer malgré des changements locaux, sauvegardés d'abord
  --essai                 afficher ce qui serait fait, sans rien écrire

Un skill, un agent ou une commande changé depuis son installation reste tel quel : sa nouvelle version
est déposée dans .gemini/agent2prompt/a-fusionner/, pour une fusion à la main.`;

function lireArguments(argv) {
  const options = { noms: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--liste') options.liste = true;
    else if (a === '--retirer') options.retirer = true;
    else if (a === '--fusionne') options.fusionne = true;
    else if (a === '--forcer') options.forcer = true;
    else if (a === '--essai') options.essai = true;
    else if (['--aide', '--help', '-h'].includes(a)) options.aide = true;
    else if (a === '--workspace') {
      if (!argv[i + 1]) throw new Erreur('--workspace attend un dossier');
      options.workspace = resolve(argv[++i]);
      if (!existsSync(options.workspace) || !statSync(options.workspace).isDirectory()) throw new Erreur(`workspace introuvable : ${options.workspace}`);
    } else if (a.startsWith('-')) throw new Erreur(`option inconnue : ${a}`);
    else options.noms.push(a);
  }
  const actions = ['liste', 'retirer', 'fusionne'].filter((x) => options[x]);
  if (actions.length > 1) throw new Erreur(`une seule action à la fois : ${actions.map((x) => `--${x}`).join(', ')}`);
  if (options.fusionne && options.noms.length === 0) throw new Erreur('--fusionne attend le nom d\'un skill, d\'un agent ou d\'une commande');
  if (!options.fusionne && options.noms.length > 0) throw new Erreur(`argument inattendu : ${options.noms[0]} (l'installateur prend tout le dépôt ; pour un seul skill, tools/installer.mjs)`);
  return options;
}

function main() {
  let options;
  try {
    options = lireArguments(process.argv.slice(2));
  } catch (e) {
    if (!(e instanceof Erreur)) throw e;
    console.error(`${e.message}\n\n${AIDE}`);
    return 2;
  }
  if (options.aide) {
    console.log(AIDE);
    return 0;
  }
  const n = niveau(options);
  try {
    if (options.liste) {
      lister(n);
      return 0;
    }
    if (options.fusionne) return fusionner(n, options.noms, options);
    if (options.retirer) return retirerTout(n, options);
    return installerTout(n, options);
  } catch (e) {
    if (!(e instanceof Erreur)) throw e;
    console.error(`ÉCHEC  ${e.message}`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) process.exitCode = main();

export { adapterChemins, adapterEntete, OUTILS_GEMINI };
