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
 * Node 20 ou plus récent, modules natifs uniquement.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEBUT = '<<<FICHIER';
const FIN = '<<<FIN';

const sha256 = (texte) => createHash('sha256').update(texte, 'utf8').digest('hex');
const lire = (chemin) => readFileSync(chemin, 'utf8');

/** Version déclarée dans le frontmatter YAML d'un fichier Markdown (`version: x.y.z`). */
function versionDeclaree(texte) {
  const frontmatter = /^---\n([\s\S]*?)\n---/.exec(texte);
  return frontmatter ? /^version:\s*(\S+)\s*$/m.exec(frontmatter[1])?.[1] : undefined;
}

function echec(message) {
  console.error(message);
  process.exit(1);
}

function main() {
  if (process.argv.length !== 3) echec('Usage : node tools/bundle.mjs specs/<nom-de-la-spec>');
  const spec = process.argv[2].replace(/\/+$/, '');
  const racine = dirname(dirname(fileURLToPath(import.meta.url)));
  const manifeste = JSON.parse(lire(join(spec, 'manifest.json')));
  const { version, name: nom } = manifeste;
  if (manifeste.transmissible === false) {
    echec(`${nom} n'est pas transmissible seul : il est inclus dans les skills qui le déclarent dans « shared »`);
  }

  // Fichiers partagés (socle) : source unique dans le dépôt, version épinglée vérifiée.
  const sources = new Map();
  for (const partage of manifeste.shared ?? []) {
    const source = join(racine, partage.from);
    const trouvee = versionDeclaree(lire(source));
    if (trouvee !== partage.version) {
      echec(`${partage.from} est en version ${trouvee}, ${nom} épingle ${partage.version} : mettre à jour l'épinglage ou le socle`);
    }
    sources.set(partage.path, source);
  }

  // Skills référencés : la version citée doit être celle du dépôt.
  for (const reference of manifeste.references ?? []) {
    const cible = JSON.parse(lire(join(racine, 'specs', reference.name, 'manifest.json')));
    if (cible.version !== reference.version) {
      echec(`${nom} référence ${reference.name} ${reference.version}, le dépôt contient ${cible.version}`);
    }
  }

  const fichiers = ['manifest.json', manifeste.entry];
  for (const rel of [...sources.keys(), ...manifeste.modules.map((m) => m.path)]) {
    if (!fichiers.includes(rel)) fichiers.push(rel);
  }

  const entete = lire(join(spec, 'ENTETE-TRANSMISSION.md')).replaceAll('{{VERSION}}', version);
  const parties = [entete.replace(/\n+$/, '') + '\n'];
  const empreintes = [];
  for (const rel of fichiers) {
    let contenu = lire(sources.get(rel) ?? join(spec, rel));
    if (contenu.includes(DEBUT) || contenu.includes(FIN)) {
      echec(`délimiteur présent dans ${rel} : transmission impossible`);
    }
    if (!contenu.endsWith('\n')) contenu += '\n';
    empreintes.push([sha256(contenu), rel]);
    parties.push(`\n${DEBUT} ${rel}>>>\n${contenu}${FIN} ${rel}>>>\n`);
  }

  parties.push("\n---\n\n# Table d'intégrité (sha256)\n\n");
  parties.push('Format compatible `sha256sum -c`, à exécuter depuis `spec/`.\n\n');
  parties.push(empreintes.map(([h, r]) => `    ${h}  ${r}\n`).join(''));
  const texte = parties.join('');

  // Aller-retour : relire le texte comme l'IA, comparer chaque empreinte.
  const trouves = [...texte.matchAll(/^<<<FICHIER (.+?)>>>\n(.*?)^<<<FIN \1>>>$/gms)];
  if (trouves.map((m) => m[1]).join('\n') !== fichiers.join('\n')) {
    echec('aller-retour : ordre ou chemins incorrects');
  }
  trouves.forEach((m, i) => {
    if (sha256(m[2]) !== empreintes[i][0]) echec(`aller-retour : contenu altéré pour ${m[1]}`);
  });

  const sortie = join(racine, 'transmissions', `${nom}-${version}.md`);
  mkdirSync(dirname(sortie), { recursive: true });
  writeFileSync(sortie, texte, 'utf8');
  const lignes = texte.endsWith('\n') ? texte.split('\n').length - 1 : texte.split('\n').length;
  console.log(`${relative(racine, sortie)} : ${trouves.length} fichiers, ${lignes} lignes, aller-retour identique`);
}

main();
