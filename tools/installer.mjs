#!/usr/bin/env node
/**
 * Installe un skill du dépôt dans Gemini CLI, à partir de sa transmission.
 *
 * Usage, depuis le dossier où Gemini CLI est lancé (la racine du workspace) :
 *
 *     node <dépôt>/tools/installer.mjs <skill>[@<version>]...     installer ou mettre à jour
 *     node <dépôt>/tools/installer.mjs <transmission.md>...       installer depuis un fichier de transmission
 *     node <dépôt>/tools/installer.mjs --tous                     tous les skills installables du dépôt
 *     node <dépôt>/tools/installer.mjs --liste                    skills du dépôt et skills installés
 *     node <dépôt>/tools/installer.mjs --retirer <skill>...       désinstaller
 *
 * Options :
 *
 *     --workspace <dossier>   racine du workspace, là où Gemini CLI est lancé (défaut : dossier courant)
 *     --utilisateur           niveau utilisateur : ~/.gemini/skills/, ou $GEMINI_CLI_HOME/.gemini/skills/
 *     --visible               ne pas masquer le skill à Git : il apparaît dans git status, à versionner
 *     --forcer                remplacer ou retirer malgré des fichiers changés depuis l'installation
 *     --essai                 afficher ce qui serait fait, sans rien écrire
 *
 * Pour chaque skill, le script :
 *
 * 1. relit la transmission comme le ferait l'IA (`relire`, de `tools/bundle.mjs`), fins de ligne CRLF
 *    comprises, et vérifie chaque fichier contre la table d'intégrité avant d'écrire quoi que ce soit ;
 * 2. écrit dans `.gemini/skills/<nom>/` les fichiers transmis, la consigne de la transmission
 *    (`CONSIGNE.md`) et la table d'intégrité de l'installation (`integrite.sha256`, format
 *    `sha256sum -c`). Une version installée est remplacée d'un bloc ; si des fichiers y ont été
 *    modifiés, supprimés ou ajoutés depuis, le script refuse, sauf `--forcer` ;
 * 3. dans un dépôt Git, masque le skill à `git status` par l'exclusion locale (`info/exclude`) et le
 *    garde lisible par Gemini CLI par des négations dans `.geminiignore`, lui-même exclu. Sans elles,
 *    l'outil de lecture de Gemini CLI refuse les fichiers qu'exclut `.git/info/exclude` : le skill ne
 *    livrerait que son `SKILL.md` à l'activation, et ses modules resteraient illisibles.
 *
 * Il refuse les spécifications de systèmes à construire, que leur consigne matérialise dans `spec/`
 * de leur propre projet, et n'installe `analyse-projet` qu'au niveau utilisateur.
 * Node 20 ou plus récent, modules natifs, et git pour le masquage.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { relire } from './bundle.mjs';

const RACINE = dirname(dirname(fileURLToPath(import.meta.url)));
const CONSIGNE = 'CONSIGNE.md';
const INTEGRITE = 'integrite.sha256';
const BLOC_EXCLUSION = '# >>> agent2prompt : skills de Gemini CLI installés par tools/installer.mjs';
const BLOC_GEMINI = '# >>> agent2prompt : skills de .gemini/skills/ lisibles par Gemini CLI malgré leur exclusion de Git';
const FIN_BLOC = '# <<< agent2prompt';
const NOM_SKILL = /^[a-z0-9][a-z0-9-]*$/;
const SUPPRIMER = { recursive: true, force: true, maxRetries: 10, retryDelay: 100 };
/** Skills dont la consigne interdit d'écrire dans le projet : niveau utilisateur seulement. */
const UTILISATEUR_SEUL = new Map([
  ['analyse-projet', "sa consigne interdit d'écrire dans le projet analysé"],
  ['expert-analyse-projet', "sa consigne interdit d'écrire dans le projet analysé"],
]);

class Erreur extends Error {}

const sha256 = (contenu) => createHash('sha256').update(contenu).digest('hex');
const lireTexte = (chemin) => readFileSync(chemin, 'utf8').replace(/\r\n/g, '\n');
const enPosix = (chemin) => chemin.split(sep).join('/');
const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;

function comparerVersions(a, b) {
  const x = a.split('.').map(Number);
  const y = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}

/** Chemin relatif sûr : ni absolu, ni lecteur, ni `..`, ni antislash. */
const cheminSur = (rel) =>
  rel.length > 0 && !/[\\\0:]/.test(rel) && !rel.startsWith('/') && rel.split('/').every((s) => s !== '' && s !== '.' && s !== '..');

/** Fichiers d'un dossier, chemins relatifs au format posix. */
function listerFichiers(dossier, prefixe = '') {
  const fichiers = [];
  for (const entree of readdirSync(join(dossier, prefixe), { withFileTypes: true })) {
    const rel = prefixe ? `${prefixe}/${entree.name}` : entree.name;
    if (entree.isDirectory()) fichiers.push(...listerFichiers(dossier, rel));
    else fichiers.push(rel);
  }
  return fichiers.sort();
}

const vraiChemin = (chemin) => {
  try {
    return realpathSync.native(chemin);
  } catch {
    return resolve(chemin);
  }
};

// ---------------------------------------------------------------------------
// Transmissions
// ---------------------------------------------------------------------------

/** Spécifications transmissibles du dépôt, à leur version courante. */
function skillsDuDepot() {
  return readdirSync(join(RACINE, 'specs'), { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(RACINE, 'specs', d.name, 'manifest.json')))
    .map((d) => JSON.parse(readFileSync(join(RACINE, 'specs', d.name, 'manifest.json'), 'utf8')))
    .filter((m) => m.transmissible !== false)
    .map((m) => ({ nom: m.name, version: m.version, chemin: join(RACINE, 'transmissions', `${m.name}-${m.version}.md`) }))
    .sort((a, b) => a.nom.localeCompare(b.nom));
}

/** Fichier de transmission désigné par `<skill>`, `<skill>@<version>` ou un chemin vers un `.md`. */
function trouverTransmission(cible) {
  if (/\.md$/i.test(cible)) {
    const chemin = resolve(cible);
    if (!existsSync(chemin)) throw new Erreur(`transmission introuvable : ${cible}`);
    return chemin;
  }
  const m = /^([a-z0-9][a-z0-9-]*)(?:@(\d+\.\d+\.\d+))?$/.exec(cible);
  if (!m) throw new Erreur(`${cible} : attendu <skill>, <skill>@<version> ou un fichier de transmission .md`);
  const [, nom, demandee] = m;
  let version = demandee;
  if (!version) {
    const manifeste = join(RACINE, 'specs', nom, 'manifest.json');
    if (!existsSync(manifeste)) {
      throw new Erreur(`${nom} : aucun skill de ce nom dans le dépôt (${skillsDuDepot().map((s) => s.nom).join(', ')})`);
    }
    const lu = JSON.parse(readFileSync(manifeste, 'utf8'));
    if (lu.transmissible === false) throw new Erreur(`${nom} n'est pas transmissible seul : il est inclus dans les skills qui le déclarent`);
    version = lu.version;
  }
  const chemin = join(RACINE, 'transmissions', `${nom}-${version}.md`);
  if (!existsSync(chemin)) {
    const motif = new RegExp(`^${nom}-(\\d+\\.\\d+\\.\\d+)\\.md$`);
    const versions = readdirSync(join(RACINE, 'transmissions'))
      .map((f) => motif.exec(f)?.[1])
      .filter(Boolean)
      .sort(comparerVersions);
    throw new Erreur(`${nom} ${version} : aucune transmission${versions.length > 0 ? ` (versions disponibles : ${versions.join(', ')})` : ''}`);
  }
  return chemin;
}

/** Relit et vérifie une transmission, sans rien écrire. */
function lireTransmission(chemin) {
  const nomFichier = basename(chemin);
  const { entete, fichiers, sommes } = relire(lireTexte(chemin));
  if (fichiers.length === 0) throw new Erreur(`${nomFichier} : aucun bloc <<<FICHIER>>>, ce n'est pas une transmission`);
  if (sommes.length !== fichiers.length || sommes.some((s, i) => s.rel !== fichiers[i].rel)) {
    throw new Erreur(`${nomFichier} : la table d'intégrité ne correspond pas aux fichiers transmis`);
  }
  fichiers.forEach((f, i) => {
    if (!cheminSur(f.rel)) throw new Erreur(`${nomFichier} : chemin refusé, ${JSON.stringify(f.rel)}`);
    if (f.rel === CONSIGNE || f.rel === INTEGRITE) throw new Erreur(`${nomFichier} : ${f.rel} est réservé à l'installation`);
    if (sha256(f.contenu) !== sommes[i].empreinte) throw new Erreur(`${nomFichier} : empreinte fausse pour ${f.rel}, transmission altérée`);
  });
  const manifeste = fichiers.find((f) => f.rel === 'manifest.json');
  const entree = fichiers.find((f) => f.rel === 'SKILL.md');
  if (!manifeste || !entree) throw new Erreur(`${nomFichier} : manifest.json ou SKILL.md manquant`);
  const { name: nom, version } = JSON.parse(manifeste.contenu);
  const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(entree.contenu)?.[1] ?? '';
  const nomDeclare = /^name:\s*(\S+)\s*$/m.exec(frontmatter)?.[1];
  if (!NOM_SKILL.test(nom ?? '') || nomDeclare !== nom) {
    throw new Erreur(`${nomFichier} : le nom du SKILL.md (${nomDeclare}) doit être celui du manifeste (${nom})`);
  }
  if (!/^description:\s*\S/m.test(frontmatter)) throw new Erreur(`${nomFichier} : SKILL.md sans description, Gemini CLI ne le découvrirait pas`);
  // Les systèmes à construire (agent2dev, agent2test, tableau de bord) se matérialisent dans spec/.
  const systeme = entete.includes('`spec/chemin`');
  return { nom, version, entete, fichiers, systeme };
}

function estSysteme(chemin) {
  try {
    return lireTransmission(chemin).systeme;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Skills installés
// ---------------------------------------------------------------------------

function dossierUtilisateur() {
  return join(process.env.GEMINI_CLI_HOME || homedir(), '.gemini', 'skills');
}

/** État d'un dossier de skill : absent (null), non géré, ou installé avec ses changements. */
function etatInstalle(dossier) {
  if (!existsSync(dossier)) return null;
  const chemin = join(dossier, INTEGRITE);
  if (!existsSync(chemin)) return { gere: false };
  const table = readFileSync(chemin, 'utf8').replace(/\r\n/g, '\n');
  const attendus = new Map();
  for (const ligne of table.split('\n')) {
    const m = /^([0-9a-f]{64}) {2}(.+)$/.exec(ligne);
    if (m && cheminSur(m[2])) attendus.set(m[2], m[1]);
  }
  const presents = new Set(listerFichiers(dossier));
  const changes = [];
  for (const [rel, empreinte] of attendus) {
    if (!presents.has(rel)) changes.push(`${rel} (supprimé)`);
    else if (sha256(readFileSync(join(dossier, ...rel.split('/')))) !== empreinte) changes.push(`${rel} (modifié)`);
  }
  for (const rel of presents) if (rel !== INTEGRITE && !attendus.has(rel)) changes.push(`${rel} (ajouté)`);
  let version;
  try {
    version = JSON.parse(readFileSync(join(dossier, 'manifest.json'), 'utf8')).version;
  } catch {
    version = undefined;
  }
  return { gere: true, version, changes, table };
}

/** Skills installés par cet outil dans un dossier de skills. */
function skillsInstalles(base) {
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.') && existsSync(join(base, d.name, INTEGRITE)))
    .map((d) => d.name)
    .sort();
}

/** Retire les dossiers temporaires d'une installation interrompue. */
function nettoyerTemporaires(base, nom) {
  for (const entree of readdirSync(base)) {
    if (entree.startsWith(`.${nom}.nouveau-`) || entree.startsWith(`.${nom}.ancien-`)) rmSync(join(base, entree), SUPPRIMER);
  }
}

function changesDetectes(nom, changes, verbe) {
  return new Erreur(`${nom} : ${pluriel(changes.length, 'fichier')} changé${changes.length > 1 ? 's' : ''} depuis l'installation, --forcer pour les ${verbe} :\n    ${changes.join('\n    ')}`);
}

// ---------------------------------------------------------------------------
// Git : masquer le skill à git status, le garder lisible par Gemini CLI
// ---------------------------------------------------------------------------

function git(dossier, ...args) {
  try {
    return execFileSync('git', ['-C', dossier, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

/** Dépôt Git du workspace, ou null : racine, préfixe du workspace, fichier d'exclusion, worktree lié. */
function depotGit(workspace) {
  const sortie = git(workspace, 'rev-parse', '--show-toplevel', '--git-path', 'info/exclude', '--absolute-git-dir', '--git-common-dir');
  if (!sortie) return null;
  const [racine, exclusion, gitDir, commun] = sortie.split('\n');
  if (!racine || !exclusion || !gitDir || !commun) return null;
  const rel = enPosix(relative(vraiChemin(racine), vraiChemin(workspace)));
  return {
    racine,
    prefixe: rel ? `${rel}/` : '',
    exclusion: resolve(workspace, exclusion),
    lie: vraiChemin(gitDir) !== vraiChemin(resolve(workspace, commun)),
  };
}

/** Le texte sans le bloc géré, et les lignes de ce bloc. */
function separerBloc(texte) {
  const dedans = [];
  const dehors = [];
  let dans = false;
  for (const ligne of texte.replace(/\r\n/g, '\n').split('\n')) {
    if (!dans && ligne.startsWith('# >>> agent2prompt')) dans = true;
    else if (dans && ligne.startsWith(FIN_BLOC)) dans = false;
    else (dans ? dedans : dehors).push(ligne);
  }
  return { lignes: dedans.filter((l) => l.trim() !== ''), reste: dehors.join('\n').replace(/\n+$/, '') };
}

function avecBloc(reste, entete, lignes) {
  if (lignes.length === 0) return reste ? `${reste}\n` : '';
  return `${reste ? `${reste}\n\n` : ''}${entete}\n${lignes.join('\n')}\n${FIN_BLOC}\n`;
}

/**
 * Le même workspace dans les autres worktrees du dépôt : l'exclusion locale leur est commune,
 * elle doit donc rester tant que l'un d'eux en a besoin.
 */
function autresWorkspaces(workspace, depot) {
  const ici = vraiChemin(depot.racine);
  return (git(workspace, 'worktree', 'list', '--porcelain') ?? '')
    .split('\n')
    .filter((l) => l.startsWith('worktree '))
    .map((l) => l.slice('worktree '.length))
    .filter((chemin) => existsSync(chemin) && vraiChemin(chemin) !== ici)
    .map((chemin) => join(chemin, ...depot.prefixe.split('/').filter(Boolean)));
}

/** `.geminiignore` ne contient que le bloc géré de cet outil. */
function geminiignoreANous(workspace) {
  const chemin = join(workspace, '.geminiignore');
  if (!existsSync(chemin)) return false;
  const { lignes, reste } = separerBloc(readFileSync(chemin, 'utf8'));
  return lignes.length > 0 && reste.trim() === '';
}

/**
 * Met à jour les blocs gérés de l'exclusion locale et de `.geminiignore` pour un skill du workspace,
 * selon le mode : « masquer » (installation), « visible » (installation avec --visible) ou « retirer ».
 * Renvoie la ligne du compte rendu, ou null s'il n'y a rien à dire.
 */
function mettreAJourMasquage(workspace, depot, nom, mode, essai) {
  const { prefixe } = depot;
  const cheminGemini = join(workspace, '.geminiignore');
  const geminiSuivi = git(workspace, 'ls-files', '--error-unmatch', '--', '.geminiignore') !== null;
  if (mode === 'masquer') {
    if ((git(workspace, 'ls-files', '--', `.gemini/skills/${nom}`) ?? '').trim() !== '') {
      return 'suivi par Git dans ce dépôt : laissé tel quel, sans exclusion';
    }
    if (geminiSuivi) {
      return `ATTENTION, non masqué : .geminiignore est versionné, et le masquage le modifierait. Ajoutez-y avec l'équipe « !/.gemini/ », « !/.gemini/skills/ » et « !/.gemini/skills/${nom}/ », puis relancez ; sinon, --visible ou --utilisateur`;
    }
  }

  const exclusionTexte = existsSync(depot.exclusion) ? readFileSync(depot.exclusion, 'utf8') : '';
  const exclusion = separerBloc(exclusionTexte);
  const motif = new RegExp(`^/${prefixe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.gemini/skills/([a-z0-9][a-z0-9-]*)/$`);
  const masques = new Set(exclusion.lignes.map((l) => motif.exec(l)?.[1]).filter(Boolean));
  const etaitMasque = masques.has(nom);
  const ailleurs = autresWorkspaces(workspace, depot);
  let garde = false;
  if (mode === 'masquer') masques.add(nom);
  else if (etaitMasque) {
    garde = ailleurs.some((w) => existsSync(join(w, '.gemini', 'skills', nom, INTEGRITE)));
    if (!garde) masques.delete(nom);
  }
  const noms = [...masques].sort();

  // .geminiignore : les négations du bloc géré, à côté du contenu éventuel du développeur.
  const geminiTexte = existsSync(cheminGemini) ? readFileSync(cheminGemini, 'utf8') : '';
  const gemini = separerBloc(geminiTexte);
  const negations = noms.length > 0 ? ['!/.gemini/', '!/.gemini/skills/', ...noms.map((n) => `!/.gemini/skills/${n}/`)] : [];
  const nouveauGemini = geminiSuivi ? geminiTexte : avecBloc(gemini.reste, BLOC_GEMINI, negations);
  // .geminiignore n'est exclu que s'il ne contient que le bloc géré, ici ou dans un autre worktree.
  const exclureGemini = (noms.length > 0 && !geminiSuivi && gemini.reste.trim() === '') || ailleurs.some(geminiignoreANous);
  const lignesExclusion = [...(exclureGemini ? [`/${prefixe}.geminiignore`] : []), ...noms.map((n) => `/${prefixe}.gemini/skills/${n}/`)];
  const nouvelleExclusion = avecBloc(exclusion.reste, BLOC_EXCLUSION, lignesExclusion);

  if (!essai) {
    if (nouvelleExclusion !== exclusionTexte.replace(/\r\n/g, '\n')) {
      mkdirSync(dirname(depot.exclusion), { recursive: true });
      writeFileSync(depot.exclusion, nouvelleExclusion);
    }
    if (nouveauGemini === '') rmSync(cheminGemini, { force: true });
    else if (nouveauGemini !== geminiTexte) writeFileSync(cheminGemini, nouveauGemini);
  }

  const fichier = enPosix(relative(workspace, depot.exclusion));
  if (garde) return `exclusion gardée dans ${fichier} : un autre worktree a encore ce skill`;
  if (mode === 'masquer') {
    return `${essai ? 'essai : serait masqué' : 'masqué'} à Git (${fichier}), lisible par Gemini CLI (.geminiignore)`;
  }
  const retiree = etaitMasque ? `exclusion ${essai ? 'qui serait ' : ''}retirée de ${fichier} et de .geminiignore` : null;
  if (mode === 'visible') return `${essai ? 'essai : ' : ''}visible dans git status, à versionner avec le projet${retiree ? ` ; ${retiree}` : ''}`;
  return retiree && `${essai ? 'essai : ' : ''}${retiree}`;
}

// ---------------------------------------------------------------------------
// Installer, retirer, lister
// ---------------------------------------------------------------------------

/** Renomme, en réessayant quelques instants si Windows garde un fichier ouvert (antivirus, indexation). */
function renommer(de, vers) {
  for (let essai = 0; ; essai++) {
    try {
      renameSync(de, vers);
      return;
    } catch (e) {
      if (essai >= 20 || !['EPERM', 'EBUSY', 'EACCES'].includes(e.code)) throw e;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
    }
  }
}

/** Remplace le dossier du skill par le dossier préparé, d'un bloc. */
function basculer(nouveau, dossier, base, nom) {
  try {
    if (existsSync(dossier)) {
      const ancien = join(base, `.${nom}.ancien-${process.pid}`);
      renommer(dossier, ancien);
      try {
        renommer(nouveau, dossier);
      } catch (e) {
        renommer(ancien, dossier);
        throw e;
      }
      try {
        rmSync(ancien, SUPPRIMER);
      } catch {
        // Ancienne version restée masquée (.<nom>.ancien-…) : retirée au prochain lancement.
      }
    } else {
      renommer(nouveau, dossier);
    }
  } catch (e) {
    rmSync(nouveau, SUPPRIMER);
    throw new Erreur(`${nom} : remplacement impossible (${e.code ?? e.message}). Un programme utilise peut-être le dossier : fermez-le, puis relancez`);
  }
}

function installer(cible, options) {
  const t = lireTransmission(trouverTransmission(cible));
  if (t.systeme) {
    throw new Erreur(`${t.nom} décrit un système à construire, pas un skill : sa consigne le matérialise dans spec/ de son propre projet. Collez sa transmission dans l'IA de ce projet`);
  }
  if (!options.utilisateur && UTILISATEUR_SEUL.has(t.nom)) {
    throw new Erreur(`${t.nom} s'installe au niveau utilisateur seulement (${UTILISATEUR_SEUL.get(t.nom)}) : relancez avec --utilisateur`);
  }
  const base = options.utilisateur ? dossierUtilisateur() : join(options.workspace, '.gemini', 'skills');
  const dossier = join(base, t.nom);
  const affiche = options.utilisateur ? dossier : `.gemini/skills/${t.nom}/`;
  const contenus = [...t.fichiers.map((f) => [f.rel, f.contenu]), [CONSIGNE, t.entete]];
  const table = contenus.map(([rel, contenu]) => `${sha256(contenu)}  ${rel}\n`).join('');
  const rapport = [];

  const etat = etatInstalle(dossier);
  if (etat && !etat.gere && !options.forcer) {
    throw new Erreur(`${affiche} existe sans ${INTEGRITE} : il n'a pas été installé par cet outil. --forcer le remplace`);
  }
  if (etat?.gere && etat.changes.length > 0 && !options.forcer) throw changesDetectes(t.nom, etat.changes, 'remplacer');
  const aJour = etat?.gere && etat.changes.length === 0 && etat.table === table;

  if (aJour) rapport.push(`${t.nom} ${t.version} déjà installé dans ${affiche}, intact`);
  else if (options.essai) rapport.push(`essai : ${t.nom} ${t.version} serait installé dans ${affiche} (${pluriel(t.fichiers.length, 'fichier')} vérifiés)`);
  else {
    mkdirSync(base, { recursive: true });
    nettoyerTemporaires(base, t.nom);
    const nouveau = join(base, `.${t.nom}.nouveau-${process.pid}`);
    for (const [rel, contenu] of contenus) {
      const chemin = join(nouveau, ...rel.split('/'));
      mkdirSync(dirname(chemin), { recursive: true });
      writeFileSync(chemin, contenu);
    }
    writeFileSync(join(nouveau, INTEGRITE), table);
    for (const [rel, contenu] of contenus) {
      if (sha256(readFileSync(join(nouveau, ...rel.split('/')))) !== sha256(contenu)) {
        rmSync(nouveau, SUPPRIMER);
        throw new Erreur(`${t.nom} : relecture fausse pour ${rel}`);
      }
    }
    basculer(nouveau, dossier, base, t.nom);
    const avant = etat?.gere && etat.version ? `, remplace ${etat.version}` : '';
    rapport.push(`${t.nom} ${t.version} installé dans ${affiche}${avant} : ${pluriel(t.fichiers.length, 'fichier')} vérifiés, ${CONSIGNE}, ${INTEGRITE}`);
  }

  if (!options.utilisateur) {
    const depot = depotGit(options.workspace);
    if (depot) {
      rapport.push(`  ${mettreAJourMasquage(options.workspace, depot, t.nom, options.visible ? 'visible' : 'masquer', options.essai)}`);
      if (depot.lie) rapport.push('  worktree : le skill ne vaut que pour celui-ci ; pour tous les worktrees du kit, --utilisateur');
    }
    const utilisateur = etatInstalle(join(dossierUtilisateur(), t.nom));
    if (utilisateur) rapport.push(`  prime sur ${t.nom}${utilisateur.version ? ` ${utilisateur.version}` : ''}, installé au niveau utilisateur`);
  }
  const ancienEmplacement = `.skills/${t.nom}/`;
  const citations = t.fichiers.reduce((n, f) => n + f.contenu.split(ancienEmplacement).length - 1, 0);
  if (citations > 0) {
    rapport.push(`  ses fichiers citent ${ancienEmplacement} (${citations} fois), l'emplacement d'une matérialisation par l'IA : ici, lire ${affiche}`);
  }
  return { nom: t.nom, rapport };
}

function retirer(cible, options) {
  if (!NOM_SKILL.test(cible)) throw new Erreur(`${cible} : nom de skill attendu`);
  const base = options.utilisateur ? dossierUtilisateur() : join(options.workspace, '.gemini', 'skills');
  const dossier = join(base, cible);
  const affiche = options.utilisateur ? dossier : `.gemini/skills/${cible}/`;
  const etat = etatInstalle(dossier);
  const rapport = [];
  if (!etat) rapport.push(`${cible} : rien à retirer dans ${affiche}`);
  else {
    if (!etat.gere && !options.forcer) throw new Erreur(`${affiche} n'a pas été installé par cet outil. --forcer le supprime`);
    if (etat.gere && etat.changes.length > 0 && !options.forcer) throw changesDetectes(cible, etat.changes, 'supprimer');
    if (options.essai) rapport.push(`essai : ${affiche} serait supprimé`);
    else {
      rmSync(dossier, SUPPRIMER);
      rapport.push(`${cible} retiré de ${affiche}`);
    }
  }
  if (!options.utilisateur) {
    const depot = depotGit(options.workspace);
    const ligne = depot ? mettreAJourMasquage(options.workspace, depot, cible, 'retirer', options.essai) : null;
    if (ligne) rapport.push(`  ${ligne}`);
  }
  return { nom: cible, rapport };
}

function decrireEtat(etat, versionDepot) {
  if (!etat) return '—';
  if (!etat.gere) return 'non géré';
  const version = etat.version ?? '?';
  if (etat.changes.length > 0) return `${version}, ${pluriel(etat.changes.length, 'changement')}`;
  if (versionDepot && etat.version && comparerVersions(etat.version, versionDepot) < 0) return `${version}, ancienne`;
  return version;
}

function lister(options) {
  const workspace = join(options.workspace, '.gemini', 'skills');
  const utilisateur = dossierUtilisateur();
  const lignes = [['skill', 'dépôt', 'workspace', 'utilisateur']];
  const vus = new Set();
  for (const s of skillsDuDepot()) {
    vus.add(s.nom);
    if (estSysteme(s.chemin)) {
      lignes.push([s.nom, s.version, 'système à construire, non installable', '']);
      continue;
    }
    const ici = UTILISATEUR_SEUL.has(s.nom) ? 'niveau utilisateur seul' : decrireEtat(etatInstalle(join(workspace, s.nom)), s.version);
    lignes.push([s.nom, s.version, ici, decrireEtat(etatInstalle(join(utilisateur, s.nom)), s.version)]);
  }
  for (const nom of new Set([...skillsInstalles(workspace), ...skillsInstalles(utilisateur)])) {
    if (!vus.has(nom)) lignes.push([nom, '—', decrireEtat(etatInstalle(join(workspace, nom))), decrireEtat(etatInstalle(join(utilisateur, nom)))]);
  }
  const largeurs = [0, 1, 2].map((i) => Math.max(...lignes.filter((l) => l[3] !== '' || i < 2).map((l) => l[i].length)) + 3);
  console.log(`Dépôt       ${RACINE}`);
  console.log(`Workspace   ${workspace}`);
  console.log(`Utilisateur ${utilisateur}\n`);
  for (const l of lignes) console.log(`${l[0].padEnd(largeurs[0])}${l[1].padEnd(largeurs[1])}${l[2].padEnd(largeurs[2])}${l[3]}`.trimEnd());
}

// ---------------------------------------------------------------------------
// Ligne de commande
// ---------------------------------------------------------------------------

const AIDE = `Installe un skill d'Agent2Prompt dans Gemini CLI, à partir de sa transmission.

Depuis le dossier où Gemini CLI est lancé :

  node tools/installer.mjs <skill>[@<version>]...   installer ou mettre à jour dans .gemini/skills/<skill>/
  node tools/installer.mjs <transmission.md>...     installer depuis un fichier de transmission
  node tools/installer.mjs --tous                   tous les skills installables du dépôt
  node tools/installer.mjs --liste                  skills du dépôt et skills installés
  node tools/installer.mjs --retirer <skill>...     désinstaller (--retirer --tous : tous)

Options :
  --workspace <dossier>   racine du workspace (défaut : dossier courant)
  --utilisateur           niveau utilisateur, ~/.gemini/skills/ (ou $GEMINI_CLI_HOME/.gemini/skills/)
  --visible               ne pas masquer le skill à Git : il apparaît dans git status, à versionner
  --forcer                remplacer ou retirer malgré des fichiers changés depuis l'installation
  --essai                 afficher ce qui serait fait, sans rien écrire`;

const DRAPEAUX = {
  '--tous': 'tous',
  '--liste': 'liste',
  '--retirer': 'retirer',
  '--utilisateur': 'utilisateur',
  '--visible': 'visible',
  '--forcer': 'forcer',
  '--essai': 'essai',
  '--aide': 'aide',
  '--help': 'aide',
  '-h': 'aide',
};

function lireArguments(argv) {
  const options = { cibles: [], workspace: process.cwd() };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (DRAPEAUX[a]) options[DRAPEAUX[a]] = true;
    else if (a === '--workspace') {
      if (!argv[i + 1]) throw new Erreur('--workspace attend un dossier');
      options.workspace = argv[++i];
    } else if (a.startsWith('-')) throw new Erreur(`option inconnue : ${a}`);
    else options.cibles.push(a);
  }
  options.workspace = resolve(options.workspace);
  if (!existsSync(options.workspace) || !statSync(options.workspace).isDirectory()) throw new Erreur(`workspace introuvable : ${options.workspace}`);
  if (options.visible && options.utilisateur) throw new Erreur('--visible ne vaut que pour le workspace, pas avec --utilisateur');
  return options;
}

function main() {
  let options;
  try {
    options = lireArguments(process.argv.slice(2));
  } catch (e) {
    console.error(`${e.message}\n\n${AIDE}`);
    process.exit(2);
  }
  if (options.aide || (!options.liste && !options.tous && options.cibles.length === 0)) {
    console.log(AIDE);
    process.exit(options.aide ? 0 : 2);
  }
  if (options.liste) {
    lister(options);
    return;
  }
  let cibles = options.cibles;
  const ecartes = [];
  if (options.tous && options.retirer) cibles = skillsInstalles(options.utilisateur ? dossierUtilisateur() : join(options.workspace, '.gemini', 'skills'));
  else if (options.tous) {
    cibles = [];
    for (const s of skillsDuDepot()) {
      if (estSysteme(s.chemin)) ecartes.push(`${s.nom} (système à construire)`);
      else if (!options.utilisateur && UTILISATEUR_SEUL.has(s.nom)) ecartes.push(`${s.nom} (niveau utilisateur seul : --utilisateur)`);
      else cibles.push(s.nom);
    }
  }

  let echecs = 0;
  const installes = [];
  for (const cible of cibles) {
    try {
      const { nom, rapport } = options.retirer ? retirer(cible, options) : installer(cible, options);
      console.log(rapport.join('\n'));
      installes.push(nom);
    } catch (e) {
      if (!(e instanceof Erreur)) throw e;
      echecs++;
      console.error(`ÉCHEC  ${e.message}`);
    }
  }

  if (!options.retirer && !options.essai && installes.length > 0) {
    const nom = installes.length === 1 ? installes[0] : '<skill>';
    const ou = options.utilisateur ? join(dossierUtilisateur(), nom) : `.gemini/skills/${nom}/`;
    const lignes = [
      '',
      `Ensuite, dans Gemini CLI${options.utilisateur ? '' : ', lancé dans ce dossier'} :`,
      `  /skills reload, puis /skills list : ${installes.join(', ')} ${installes.length > 1 ? 'doivent' : 'doit'} y figurer.`,
      `  À la première utilisation : « Active le skill ${nom}. L'étape 0 de sa consigne est faite : ses fichiers sont dans ${ou}, vérifiés par ${INTEGRITE}. Lis ${CONSIGNE} dans ce dossier et suis-la à partir de l'étape 1. »`,
    ];
    if (!options.utilisateur) {
      lignes.push('  Si la confiance des dossiers est activée dans Gemini CLI, ce dossier doit être de confiance : sinon, Gemini CLI ignore les skills du workspace.');
    }
    console.log(lignes.join('\n'));
  }
  if (ecartes.length > 0) console.log(`\nNon installés : ${ecartes.join(', ')}.`);
  if (echecs > 0) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
