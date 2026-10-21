#!/usr/bin/env node
/**
 * Génère `glossaire.md` : la notation des identifiants, puis, pour chaque spécification,
 * ses dimensions et le détail de ses invariants (énoncé, modules qui les reprennent,
 * autres spécifications qui les citent).
 *
 * Usage, depuis la racine du dépôt :
 *
 *     node tools/glossaire.mjs
 *
 * Le contenu est entièrement dérivé des points d'entrée et des modules de `specs/` :
 * `node tools/verifier.mjs` le recalcule et signale un glossaire qui n'est plus à jour.
 * Les archives ne sont pas lues : elles sont figées. Node 20 ou plus récent, modules
 * natifs uniquement.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const racine = dirname(dirname(fileURLToPath(import.meta.url)));
export const CHEMIN_GLOSSAIRE = join(racine, 'glossaire.md');
const lire = (chemin) => readFileSync(chemin, 'utf8');

const DEFINITION = /^- \*\*((?:D|SC)\d+\.INV-\d+)\*\* : (.+)$/gm;
const cellules = (ligne) => ligne.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
const echapper = (texte) => texte.replaceAll('|', '\\|');
const ancre = (titre) => titre.toLowerCase().replace(/[^\p{L}\p{N} -]/gu, '').replaceAll(' ', '-');

/** Dimensions du registre, dans l'ordre : identifiant, nom, statut (colonne « Statut … »). */
function registre(texte) {
  const section = /^## \d+\. Registre des dimensions[^\n]*\n([\s\S]*?)(?=\n## )/m.exec(texte);
  if (!section) return [];
  const lignes = section[1].split('\n').filter((l) => l.startsWith('|'));
  const iStatut = cellules(lignes[0]).findIndex((c) => c.startsWith('Statut'));
  return lignes
    .slice(2)
    .map(cellules)
    .filter((c) => /^(?:D|SC)\d+$/.test(c[0]))
    .map((c) => ({ id: c[0], nom: c[1], statut: c[iStatut] }));
}

function lireSpecs() {
  const dossierSpecs = join(racine, 'specs');
  return readdirSync(dossierSpecs)
    .sort()
    .filter((nom) => existsSync(join(dossierSpecs, nom, 'manifest.json')))
    .map((nom) => {
      const dossier = join(dossierSpecs, nom);
      const manifeste = JSON.parse(lire(join(dossier, 'manifest.json')));
      const entree = lire(join(dossier, manifeste.entry ?? 'SKILL.md'));
      const modules = (manifeste.modules ?? [])
        .filter((m) => existsSync(join(dossier, m.path)))
        .map((m) => ({ id: m.id, statut: m.status, texte: lire(join(dossier, m.path)) }));
      return {
        nom: manifeste.name,
        version: manifeste.version,
        description: manifeste.description,
        partages: (manifeste.shared ?? []).map((p) => p.from),
        entree,
        modules,
        dimensions: registre(entree),
        invariants: [...entree.matchAll(DEFINITION)].map((m) => ({ id: m[1], enonce: m[2] })),
      };
    });
}

/** Où chaque invariant est repris : modules de sa spécification, modules des skills qui incluent le socle, citations préfixées. */
function reprises(specs) {
  const resultat = new Map();
  const ajouter = (cle, lieu) => {
    if (!resultat.has(cle)) resultat.set(cle, []);
    if (!resultat.get(cle).includes(lieu)) resultat.get(cle).push(lieu);
  };
  const local = (id) => new RegExp(`(?<![\\w:-])${id.replace('.', '\\.')}(?!\\d)`);
  for (const spec of specs) {
    for (const { id } of spec.invariants) {
      for (const module of spec.modules) if (local(id).test(module.texte)) ajouter(`${spec.nom}:${id}`, `\`${module.id}\``);
      for (const autre of specs) {
        if (autre === spec) continue;
        const prefixe = new RegExp(`(?<![\\w-])${spec.nom}:${id.replace('.', '\\.')}(?!\\d)`);
        const inclutSocle = id.startsWith('SC') && autre.partages.includes(`specs/${spec.nom}/SKILL.md`);
        if (prefixe.test(autre.entree) || (inclutSocle && local(id).test(autre.entree))) {
          ajouter(`${spec.nom}:${id}`, `\`${autre.nom}\``);
        }
        for (const module of autre.modules) {
          if (prefixe.test(module.texte) || (inclutSocle && local(id).test(module.texte))) {
            ajouter(`${spec.nom}:${id}`, `\`${autre.nom}/${module.id}\``);
          }
        }
      }
    }
  }
  return resultat;
}

export function genererGlossaire() {
  const specs = lireSpecs();
  const lieux = reprises(specs);
  const titre = (spec) => `${spec.nom} ${spec.version}`;
  const sortie = [];
  sortie.push(`# Glossaire des invariants

Ce fichier détaille chaque invariant de chaque spécification du dépôt : son identifiant, la dimension qui le porte, son énoncé, et où il est repris. Il est généré par \`node tools/glossaire.mjs\` à partir des points d'entrée et des modules de \`specs/\`, archives exclues. Ne pas le modifier à la main : \`node tools/verifier.mjs\` signale un glossaire qui n'est plus à jour.

## Lire un identifiant

| Forme | Désigne | Exemple |
|---|---|---|
| \`Dn\` | dimension n d'une spécification : un axe, avec ses invariants et ses tests | \`D4\` de \`tension-dashboard-gitlab-agent\` : effecteur GitLab à garde-fous |
| \`Dn.INV-k\` | invariant k de la dimension n : une propriété qui doit toujours tenir, vérifiée par au moins un test ou un contrôle | \`D4.INV-3\` : la procédure n'emploie ni \`--force\` ni \`--force-with-lease\` |
| \`SCn\`, \`SCn.INV-k\` | dimension et invariant du socle back-front, inclus à l'identique dans plusieurs skills | \`SC1.INV-2\` : aucun changement cassant dans une version d'API publiée |
| \`<spécification>:Dn.INV-k\` | invariant d'une autre spécification, cité avec le nom de celle-ci | \`expert-java:D4.INV-2\` |
| \`En\` | point d'extension : emplacement réservé, inerte, pour une dimension future | \`E2\` |

Un identifiant n'a de sens qu'avec sa spécification : \`D6.INV-3\` existe dans plusieurs d'entre elles. Statut d'une dimension : \`active\` (invariants en vigueur et vérifiés), \`reserved\` (place posée, aucun invariant en vigueur), \`superseded\` (remplacée). Un invariant ne s'affaiblit jamais ; il peut être remplacé par un invariant plus fort, signalé dans le journal de révision de sa spécification (\`EVOLUTION.md\`, section 4).

La colonne « Repris dans » cite les modules de la spécification qui reprennent l'invariant, puis, sous la forme \`skill/module\`, les autres spécifications qui le citent ou qui incluent le socle.

## Sommaire

| Spécification | Version | Dimensions actives | Dimensions réservées | Invariants |
|---|---|---|---|---|`);
  for (const spec of specs) {
    const actives = spec.dimensions.filter((d) => d.statut === 'active').length;
    const reservees = spec.dimensions.filter((d) => d.statut === 'reserved').length;
    sortie.push(`| [\`${spec.nom}\`](#${ancre(titre(spec))}) | ${spec.version} | ${actives} | ${reservees} | ${spec.invariants.length} |`);
  }
  for (const spec of specs) {
    sortie.push('', `## ${titre(spec)}`, '', `${spec.description} Point d'entrée : [\`specs/${spec.nom}/SKILL.md\`](specs/${spec.nom}/SKILL.md).`);
    const connues = new Set(spec.dimensions.map((d) => d.id));
    const groupes = [...spec.dimensions];
    const orphelins = spec.invariants.filter((i) => !connues.has(i.id.split('.')[0]));
    if (orphelins.length > 0) groupes.push({ id: 'autres', nom: 'invariants hors registre', statut: '' });
    for (const dimension of groupes) {
      const siens = dimension.id === 'autres' ? orphelins : spec.invariants.filter((i) => i.id.split('.')[0] === dimension.id);
      sortie.push('', `### ${dimension.id} : ${dimension.nom}${dimension.statut ? ` (${dimension.statut})` : ''}`, '');
      if (siens.length === 0) {
        sortie.push(dimension.statut === 'reserved' ? 'Dimension réservée : aucun invariant en vigueur dans cette version.' : 'Aucun invariant défini.');
        continue;
      }
      sortie.push('| Invariant | Énoncé | Repris dans |', '|---|---|---|');
      for (const invariant of siens) {
        const ou = (lieux.get(`${spec.nom}:${invariant.id}`) ?? []).join(', ') || '—';
        sortie.push(`| **${invariant.id}** | ${echapper(invariant.enonce)} | ${ou} |`);
      }
    }
  }
  return sortie.join('\n') + '\n';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const texte = genererGlossaire();
  writeFileSync(CHEMIN_GLOSSAIRE, texte, 'utf8');
  const nb = (texte.match(/^\| \*\*(?:D|SC)\d+\.INV-\d+\*\* \|/gm) ?? []).length;
  console.log(`glossaire.md : ${nb} invariants, ${texte.split('\n').length - 1} lignes`);
}
