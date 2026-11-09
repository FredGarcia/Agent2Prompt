// Sources dont héritent les skills de ticket (generateur-skill-ticket, D2) : l'orchestrateur
// C7E (ses invariants, des sections de sa méthode, le rattachement des options aux slots), les fichiers
// qu'il épingle (socle back-front, référentiels Java et Angular), le fichier d'invariants du projet et, au
// lot 4, la boîte à outils du skill racine : les skills du dépôt dont les sous-agents de rôle appliquent la
// méthode (agent-tdd-jira, Agent2Test, analyse-projet, revues Java et Angular, sonarqube), à leur version
// épinglée, et les scripts de contrôle des documents et des kits.
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

/** Manifeste d'un skill du dépôt : `specs/<nom>/manifest.json`. */
export const manifesteSkill = (nom) => JSON.parse(lireTexte(join(RACINE_DEPOT, 'specs', nom, 'manifest.json')));

/**
 * Texte d'un fichier du dépôt à une version : le fichier courant s'il porte cette version, sinon son
 * archive déclarée dans le manifeste de son dossier (`previousVersions`). Même règle que
 * `sourcePartagee` de `tools/bundle.mjs`, fins de ligne normalisées. Un module de skill
 * (`specs/<skill>/modules/…`) ne déclare pas de version : il suit celle de son skill, et le dépôt
 * n'archive pas les modules ; il ne se résout donc qu'à la version courante du skill.
 */
export function resoudre({ from, version }) {
  const source = join(RACINE_DEPOT, from);
  if (!existsSync(source)) throw new Error(`${from} : absent du dépôt`);
  const texte = lireTexte(source);
  if (version === undefined || versionDeclaree(texte) === version) return texte;
  const module = /^specs\/([^/]+)\/modules\//.exec(from)?.[1];
  if (module && versionDeclaree(texte) === undefined) {
    const courante = manifesteSkill(module).version;
    if (courante === version) return texte;
    throw new Error(`${from} en version ${version} : le dépôt porte ${module} ${courante}, et n'archive pas ses modules`);
  }
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

/** Premier bloc de code d'un langage dans une section numérotée, sans ses clôtures, fin de ligne comprise. */
export function blocDeCode(texte, numero, langage) {
  const m = new RegExp(`^\`\`\`${langage}\\n([\\s\\S]*?)\\n\`\`\`$`, 'm').exec(extraireSection(texte, numero));
  if (!m) throw new Error(`section ${numero} : aucun bloc ${langage}`);
  return `${m[1]}\n`;
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
 * Versions épinglées par le générateur, pour les skills que n'épinglent ni l'orchestrateur ni agent-tdd-jira.
 * Une nouvelle version de l'un d'eux arrête la génération, jusqu'à ce que le générateur la reprenne ici,
 * dans une version à lui (références de son manifeste).
 */
export const EPINGLES_PROTOTYPE = { 'analyse-projet': '1.0.2', sonarqube: '1.1.0' };

/** Scripts du générateur livrés dans le skill racine, tels quels, sous `outils/`. */
/** Dossier du générateur dans le dépôt : son manifeste donne le nom et la version inscrits dans chaque skill. */
export const GENERATEUR = 'specs/generateur-skill-ticket';
export const DOSSIER_OUTILS = `${GENERATEUR}/outils`;

/**
 * Boîte à outils du skill racine (lots 4 et 5), dans l'ordre de la transmission : un module ou un point
 * d'entrée de skill copié en entier, un extrait (`sections`), un script tiré d'un bloc de code (`bloc`),
 * ou un script du générateur (`outil`) ; `depuis` : le lot qui l'a ajouté, 4 par défaut.
 */
export const BOITE = [
  { path: 'references/agent-tdd-jira.md', skill: 'agent-tdd-jira' },
  ...['ingestion-jira', 'us-criteres', 'analyse-demande', 'cycle-tdd', 'tracabilite'].map((module) => ({ path: `references/agent-tdd-jira/${module}.md`, skill: 'agent-tdd-jira', module })),
  { path: 'references/agent-tdd-jira/binome-agent2test.md', skill: 'agent-tdd-jira', module: 'binome-agent2test', sections: ['3', '4'] },
  { path: 'references/agent2test/plan.md', skill: 'agent2test', module: 'plan', sections: ['2'] },
  { path: 'references/agent2test/remise.md', skill: 'agent2test', module: 'echange', sections: ['3'] },
  { path: 'references/analyse-projet.md', skill: 'analyse-projet' },
  { path: 'references/analyse-projet/cartographie.md', skill: 'analyse-projet', module: 'cartographie' },
  { path: 'references/java/revue.md', skill: 'java', module: 'revue' },
  { path: 'references/angular/revue.md', skill: 'angular', module: 'revue' },
  { path: 'references/sonarqube.md', skill: 'sonarqube' },
  { path: 'references/sonarqube/examen-local.md', skill: 'sonarqube', module: 'examen-local' },
  { path: 'outils/extraire-jira.mjs', skill: 'agent-tdd-jira', module: 'ingestion-jira', bloc: { section: '3', langage: 'js' } },
  { path: 'outils/controler-criteres.mjs', skill: 'agent-tdd-jira', module: 'us-criteres', bloc: { section: '7', langage: 'js' } },
  { path: 'outils/verifier-documents.mjs', outil: 'verifier-documents.mjs' },
  { path: 'outils/verifier-kits.mjs', outil: 'verifier-kits.mjs' },
  { path: 'outils/champ.mjs', outil: 'champ.mjs', depuis: 5 },
  { path: 'outils/vue.mjs', outil: 'vue.mjs', depuis: 6 },
];

/**
 * Boîte à outils chargée, chaque fichier à sa version épinglée : agent-tdd-jira et les référentiels Java
 * et Angular suivent l'orchestrateur ; Agent2Test suit agent-tdd-jira ; analyse-projet et sonarqube suivent
 * `EPINGLES_PROTOTYPE`. Chaque fichier : path (dans le skill), from, version, contenu, et `sections` pour un
 * extrait, `bloc` pour un script tiré d'un bloc de code.
 */
export function chargerBoite(manifesteOrchestrateur) {
  const epingle = (nom, manifeste) => {
    const r = (manifeste.references ?? []).find((x) => x.name === nom);
    if (!r) throw new Error(`${manifeste.name} n'épingle pas ${nom}`);
    return r.version;
  };
  const tdd = manifesteSkill('agent-tdd-jira');
  const versionTdd = epingle('agent-tdd-jira', manifesteOrchestrateur);
  if (tdd.version !== versionTdd) throw new Error(`l'orchestrateur épingle agent-tdd-jira ${versionTdd}, le dépôt porte ${tdd.version}`);
  const versions = {
    'agent-tdd-jira': versionTdd,
    agent2test: epingle('agent2test', tdd),
    java: epingle('java', manifesteOrchestrateur),
    angular: epingle('angular', manifesteOrchestrateur),
    ...EPINGLES_PROTOTYPE,
  };
  const charger = ({ path, skill, module, sections, bloc, outil }) => {
    if (outil) return { path, from: `${DOSSIER_OUTILS}/${outil}`, contenu: lireTexte(join(RACINE_DEPOT, DOSSIER_OUTILS, outil)) };
    const from = module ? `specs/${skill}/modules/${module}/SKILL.md` : `specs/${skill}/SKILL.md`;
    const version = versions[skill];
    const source = resoudre({ from, version });
    if (bloc) return { path, from, version, bloc, contenu: blocDeCode(source, bloc.section, bloc.langage) };
    if (!sections) return { path, from, version, contenu: source };
    const contenu = [
      `# Extrait de ${skill} ${version}, module \`${module}\` : § ${sections.join(' et § ')}`,
      '',
      `> Sections recopiées mot pour mot de \`${from}\`, version ${version}, pour le skill racine d'un arbre de skills de ticket. Un renvoi à une section absente de cet extrait est informatif.`,
      '',
      ...sections.flatMap((s) => [extraireSection(source, s), '']),
    ].join('\n').replace(/\n+$/, '\n');
    return { path, from, version, sections, contenu };
  };
  return { versions, fichiers: BOITE.map(charger) };
}

/**
 * Sources d'une génération : l'orchestrateur à sa version courante, les fichiers qu'il épingle à leur
 * version épinglée, le rattachement des options aux slots, le fichier d'invariants du projet et la boîte
 * à outils du skill racine.
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
  const generateur = JSON.parse(lireTexte(join(RACINE_DEPOT, GENERATEUR, 'manifest.json')));
  return {
    generateur: { nom: generateur.name, version: generateur.version },
    orchestrateur: { from, version: manifeste.version, texte, invariants: lignesInvariants(texte), slots: tableSlots(texte) },
    optionsSlots: tableOptionsSlots(lireTexte(MODULE_REFERENTIEL)),
    socle: partage('socle/SKILL.md'),
    experts: { java: partage('references/java.md'), angular: partage('references/angular.md') },
    projet: chargerProjet(invariantsProjet),
    boite: chargerBoite(manifeste),
  };
}
