#!/usr/bin/env node
/**
 * Assemble une spécification modulaire en un texte unique transmissible à une IA.
 *
 * Usage, depuis la racine du dépôt :
 *
 *     node tools/bundle.mjs specs/<nom-de-la-spec>
 *
 * Le script lit `manifest.json` de la spécification pour connaître sa version,
 * son point d'entrée et ses modules (actifs et réservés). Il écrit
 * `transmissions/<nom>-<version>.md` :
 *
 * 1. l'en-tête `ENTETE-TRANSMISSION.md` de la spécification, où `{{VERSION}}`
 *    est remplacé ;
 * 2. chaque fichier entre `<<<FICHIER chemin>>>` et `<<<FIN chemin>>>` ;
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

  const fichiers = ['manifest.json', manifeste.entry];
  for (const module of manifeste.modules) {
    if (!fichiers.includes(module.path)) fichiers.push(module.path);
  }

  const entete = lire(join(spec, 'ENTETE-TRANSMISSION.md')).replaceAll('{{VERSION}}', version);
  const parties = [entete.replace(/\n+$/, '') + '\n'];
  const empreintes = [];
  for (const rel of fichiers) {
    let contenu = lire(join(spec, rel));
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
