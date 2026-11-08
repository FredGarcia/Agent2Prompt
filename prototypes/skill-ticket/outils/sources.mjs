// Sources dont héritent les skills de ticket (prototype « skill de ticket », lot 2) : l'orchestrateur C7E
// (ses invariants, des sections de sa méthode, le rattachement des options aux slots), les fichiers qu'il
// épingle (socle back-front, référentiels Java et Angular) et le fichier d'invariants du projet.
//
// Tout se lit fins de ligne normalisées, sans BOM : une extraction Git en CRLF, sous Windows, donne les
// mêmes copies, octet pour octet, qu'une extraction en LF.

import { existsSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { MODULE_REFERENTIEL, RACINE_DEPOT, lireTexte } from './referentiel.mjs';

export const ORCHESTRATEUR = 'specs/orchestrateur-c7e';
export const MODELE_PROJET = `${ORCHESTRATEUR}/meso-contrats.md`;
const LIGNE_INVARIANT = /^- \*\*(D\d+\.INV-\d+)\*\* : .+$/gm;

const enPosix = (chemin) => chemin.split(sep).join('/');

/** Version déclarée dans le frontmatter (`version: x.y.z`), ou undefined. */
export function versionDeclaree(texte) {
  const fm = /^---\n([\s\S]*?)\n---/.exec(texte);
  return fm ? /^version:\s*(\S+)\s*$/m.exec(fm[1])?.[1] : undefined;
}

/**
 * Texte d'un fichier du dépôt à une version : le fichier courant s'il porte cette version, sinon son
 * archive déclarée dans le manifeste de son dossier (`previousVersions`). Même règle que
 * `sourcePartagee` de `tools/bundle.mjs`, fins de ligne normalisées.
 */
export function resoudre({ from, version }) {
  const source = join(RACINE_DEPOT, from);
  if (!existsSync(source)) throw new Error(`${from} : absent du dépôt`);
  const texte = lireTexte(source);
  if (version === undefined || versionDeclaree(texte) === version) return texte;
  const manifeste = join(dirname(source), 'manifest.json');
  const precedentes = existsSync(manifeste) ? JSON.parse(lireTexte(manifeste)).previousVersions ?? [] : [];
  const archive = precedentes.find((p) => p.version === version && p.file.endsWith('.md'));
  if (archive && existsSync(join(dirname(source), archive.file))) {
    const archive_ = lireTexte(join(dirname(source), archive.file));
    if (versionDeclaree(archive_) === version) return archive_;
  }
  throw new Error(`${from} en version ${version} : ni courant ni archivé dans le dépôt`);
}

/** Lignes d'invariants d'un point d'entrée (`- **Dn.INV-m** : …`), mot pour mot, dans leur ordre. */
export const lignesInvariants = (texte) => [...texte.matchAll(LIGNE_INVARIANT)].map((m) => m[0]);
export const idInvariant = (ligne) => /\*\*(D\d+\.INV-\d+)\*\*/.exec(ligne)?.[1];

/**
 * Section numérotée d'un document Markdown (`## 2. …`, `### 5.1 …`), titre compris, jusqu'au titre
 * suivant de même niveau ou de niveau supérieur, hors blocs de code ; sans le séparateur final.
 */
export function extraireSection(texte, numero) {
  const lignes = texte.split('\n');
  const motif = new RegExp(`^(#{2,4}) ${numero.replace(/\./g, '\\.')}[. ]`);
  let debut = -1;
  let niveau = 0;
  let code = false;
  let fin = lignes.length;
  for (let k = 0; k < lignes.length; k++) {
    if (/^\s*```/.test(lignes[k])) code = !code;
    if (code) continue;
    const titre = /^(#{1,6}) /.exec(lignes[k]);
    if (debut === -1) {
      const m = motif.exec(lignes[k]);
      if (m) {
        debut = k;
        niveau = m[1].length;
      }
    } else if (titre && titre[1].length <= niveau) {
      fin = k;
      break;
    }
  }
  if (debut === -1) throw new Error(`section ${numero} introuvable`);
  const section = lignes.slice(debut, fin);
  while (section.length > 0 && /^(\s*|---)$/.test(section.at(-1))) section.pop();
  return section.join('\n');
}

/** Lignes d'un tableau Markdown d'une section, en cellules, sans l'en-tête ni le séparateur. */
function lignesTableau(section) {
  return section.split('\n').filter((l) => l.startsWith('|')).slice(2).map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
}

/** Slots du cycle 7E (§ 1.1 de l'orchestrateur) : id, terme, fonction. */
export function tableSlots(texteOrchestrateur) {
  const slots = lignesTableau(extraireSection(texteOrchestrateur, '1.1')).map(([id, terme, fonction]) => ({
    id,
    terme: /\*\*(.+?)\*\*/.exec(terme)?.[1] ?? terme,
    fonction: fonction.replace(/\s*\*[^*]+\*\s*/g, ' ').trim().replace(/\.$/, ''),
  }));
  if (slots.length !== 8) throw new Error(`cycle 7E : ${slots.length} slots lus, 8 attendus`);
  return slots;
}

/** Rattachement des options aux slots (§ 4 du module referentiel) : « couche.option » → slots et étiquettes. */
export function tableOptionsSlots(texteModule) {
  const table = new Map();
  for (const [couche, options, slots, etiquettes] of lignesTableau(extraireSection(texteModule, '4'))) {
    for (const [, option] of options.matchAll(/`([a-z_]+)`/g)) {
      table.set(`${couche}.${option}`, { slots, etiquettes, engages: [...slots.matchAll(/É\d/g)].map((m) => m[0]) });
    }
  }
  if (table.size === 0) throw new Error('module referentiel : rattachement des options aux slots introuvable');
  return table;
}

/** Fichier d'invariants du projet : celui donné, ou le modèle de l'orchestrateur. */
export function chargerProjet(chemin) {
  const source = chemin ? resolve(chemin) : join(RACINE_DEPOT, MODELE_PROJET);
  if (!existsSync(source)) throw new Error(`fichier d'invariants du projet introuvable : ${chemin}`);
  const rel = enPosix(relative(RACINE_DEPOT, source));
  const from = rel.startsWith('..') || rel.includes(':') ? `projet:${basename(source)}` : rel;
  return { path: 'projet/meso-contrats.md', from, source, contenu: lireTexte(source) };
}

/**
 * Sources d'une génération : l'orchestrateur à sa version courante, les fichiers qu'il épingle à leur
 * version épinglée, le rattachement des options aux slots et le fichier d'invariants du projet.
 */
export function chargerSources({ invariantsProjet } = {}) {
  const manifeste = JSON.parse(lireTexte(join(RACINE_DEPOT, ORCHESTRATEUR, 'manifest.json')));
  const from = `${ORCHESTRATEUR}/SKILL.md`;
  const texte = resoudre({ from, version: manifeste.version });
  const partage = (path) => {
    const p = (manifeste.shared ?? []).find((s) => s.path === path);
    if (!p) throw new Error(`l'orchestrateur n'épingle pas ${path}`);
    return { path, from: p.from, version: p.version, contenu: resoudre(p) };
  };
  return {
    orchestrateur: { from, version: manifeste.version, texte, invariants: lignesInvariants(texte), slots: tableSlots(texte) },
    optionsSlots: tableOptionsSlots(lireTexte(MODULE_REFERENTIEL)),
    socle: partage('socle/SKILL.md'),
    experts: { java: partage('references/java.md'), angular: partage('references/angular.md') },
    projet: chargerProjet(invariantsProjet),
  };
}
