#!/usr/bin/env node
/**
 * Assemble une spécification modulaire en un texte unique transmissible à une IA.
 *
 * Usage, depuis la racine du dépôt :
 *
 *     node tools/bundle.mjs specs/<nom-de-la-spec>
 *
 * Le script lit `manifest.json` de la spécification pour connaître sa version,
 * son point d'entrée, ses fichiers partagés (`shared`, par exemple le socle
 * back-front), les skills qu'elle référence (`references`) et ses modules
 * (actifs et réservés). Il refuse une spécification marquée
 * `"transmissible": false`, un fichier partagé dont la version ne correspond
 * pas à l'épinglage, et une référence à une version absente du dépôt. Il écrit
 * `transmissions/<nom>-<version>.md` :
 *
 * 1. l'en-tête `ENTETE-TRANSMISSION.md` de la spécification, où `{{VERSION}}`
 *    est remplacé ;
 * 2. chaque fichier entre `<<<FICHIER chemin>>>` et `<<<FIN chemin>>>` : le
 *    manifeste, le point d'entrée, les fichiers partagés, puis les modules ;
 * 3. une table d'intégrité sha256 au format `sha256sum -c`.
 *
 * Il vérifie ensuite l'aller-retour : le texte, relu comme le ferait l'IA, doit
 * redonner exactement chaque fichier. Les archives ne sont pas transmises.
 *
 * Le module exporte aussi `assembler` (le texte, sans rien écrire) et `relire`
 * (en-tête, fichiers et table d'intégrité d'une transmission) : `tools/verifier.mjs`
 * s'en sert pour contrôler que la transmission de chaque version courante reste
 * fidèle aux fichiers de la spécification.
 * Node 20 ou plus récent, modules natifs uniquement.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DEBUT = '<<<FICHIER';
const FIN = '<<<FIN';
const RACINE = dirname(dirname(fileURLToPath(import.meta.url)));

export const sha256 = (texte) => createHash('sha256').update(texte, 'utf8').digest('hex');
const lire = (chemin) => readFileSync(chemin, 'utf8');

/** Version déclarée dans le frontmatter YAML d'un fichier Markdown (`version: x.y.z`). */
function versionDeclaree(texte) {
  const frontmatter = /^---\n([\s\S]*?)\n---/.exec(texte);
  return frontmatter ? /^version:\s*(\S+)\s*$/m.exec(frontmatter[1])?.[1] : undefined;
}

/**
 * Assemble la transmission de la spécification du dossier `spec`, sans rien écrire.
 * Renvoie le nom, la version, le texte, l'en-tête et les fichiers transmis, dans l'ordre.
 * Lève une erreur si la spécification n'est pas transmissible ou incohérente.
 */
export function assembler(spec) {
  const dossier = spec.replace(/\/+$/, '');
  const manifeste = JSON.parse(lire(join(dossier, 'manifest.json')));
  const { version, name: nom } = manifeste;
  if (manifeste.transmissible === false) {
    throw new Error(`${nom} n'est pas transmissible seul : il est inclus dans les skills qui le déclarent dans « shared »`);
  }

  // Fichiers partagés (socle) : source unique dans le dépôt, version épinglée vérifiée.
  const sources = new Map();
  for (const partage of manifeste.shared ?? []) {
    const source = join(RACINE, partage.from);
    const trouvee = versionDeclaree(lire(source));
    if (trouvee !== partage.version) {
      throw new Error(`${partage.from} est en version ${trouvee}, ${nom} épingle ${partage.version} : mettre à jour l'épinglage ou le socle`);
    }
    sources.set(partage.path, source);
  }

  // Skills référencés : la version citée doit être celle du dépôt.
  for (const reference of manifeste.references ?? []) {
    const cible = JSON.parse(lire(join(RACINE, 'specs', reference.name, 'manifest.json')));
    if (cible.version !== reference.version) {
      throw new Error(`${nom} référence ${reference.name} ${reference.version}, le dépôt contient ${cible.version}`);
    }
  }

  const chemins = ['manifest.json', manifeste.entry];
  for (const rel of [...sources.keys(), ...manifeste.modules.map((m) => m.path)]) {
    if (!chemins.includes(rel)) chemins.push(rel);
  }

  const entete = lire(join(dossier, 'ENTETE-TRANSMISSION.md')).replaceAll('{{VERSION}}', version).replace(/\n+$/, '') + '\n';
  const parties = [entete];
  const fichiers = [];
  for (const rel of chemins) {
    let contenu = lire(sources.get(rel) ?? join(dossier, rel));
    if (contenu.includes(DEBUT) || contenu.includes(FIN)) {
      throw new Error(`délimiteur présent dans ${rel} : transmission impossible`);
    }
    if (!contenu.endsWith('\n')) contenu += '\n';
    fichiers.push({ rel, contenu, empreinte: sha256(contenu) });
    parties.push(`\n${DEBUT} ${rel}>>>\n${contenu}${FIN} ${rel}>>>\n`);
  }

  parties.push("\n---\n\n# Table d'intégrité (sha256)\n\n");
  parties.push('Format compatible `sha256sum -c`, à exécuter depuis le dossier où les fichiers ont été matérialisés.\n\n');
  parties.push(fichiers.map((f) => `    ${f.empreinte}  ${f.rel}\n`).join(''));
  return { nom, version, texte: parties.join(''), entete, fichiers };
}

/**
 * Relit une transmission comme le ferait l'IA : l'en-tête (tout ce qui précède le
 * premier fichier), chaque fichier entre ses délimiteurs, et la table d'intégrité.
 */
export function relire(texte) {
  const premier = /^<<<FICHIER .+?>>>$/m.exec(texte);
  const entete = premier ? texte.slice(0, Math.max(0, premier.index - 1)) : texte;
  const fichiers = [...texte.matchAll(/^<<<FICHIER (.+?)>>>\n(.*?)^<<<FIN \1>>>$/gms)].map((m) => ({ rel: m[1], contenu: m[2] }));
  const fin = texte.lastIndexOf(`\n${FIN} `);
  const table = fin === -1 ? '' : texte.slice(fin);
  const sommes = [...table.matchAll(/^ {4}([0-9a-f]{64}) {2}(\S.*)$/gm)].map((m) => ({ empreinte: m[1], rel: m[2] }));
  return { entete, fichiers, sommes };
}

function echec(message) {
  console.error(message);
  process.exit(1);
}

function main() {
  if (process.argv.length !== 3) echec('Usage : node tools/bundle.mjs specs/<nom-de-la-spec>');
  let resultat;
  try {
    resultat = assembler(process.argv[2]);
  } catch (e) {
    echec(e.message);
  }
  const { nom, version, texte, fichiers } = resultat;

  // Aller-retour : relire le texte comme l'IA, comparer chaque empreinte.
  const relu = relire(texte);
  if (relu.fichiers.map((f) => f.rel).join('\n') !== fichiers.map((f) => f.rel).join('\n')) {
    echec('aller-retour : ordre ou chemins incorrects');
  }
  relu.fichiers.forEach((f, i) => {
    if (sha256(f.contenu) !== fichiers[i].empreinte) echec(`aller-retour : contenu altéré pour ${f.rel}`);
  });

  const sortie = join(RACINE, 'transmissions', `${nom}-${version}.md`);
  mkdirSync(dirname(sortie), { recursive: true });
  writeFileSync(sortie, texte, 'utf8');
  const lignes = texte.endsWith('\n') ? texte.split('\n').length - 1 : texte.split('\n').length;
  console.log(`${relative(RACINE, sortie)} : ${relu.fichiers.length} fichiers, ${lignes} lignes, aller-retour identique`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
