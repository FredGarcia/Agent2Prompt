// Fabrique abstraite de skill-ticket (prototype « skill de ticket », lots 2 à 6).
//
// Une fabrique produit, pour un nœud de l'arbre de tickets, la famille cohérente des fichiers de son
// skill : la consigne (SKILL.md), le ticket (ticket.toml), les blocs du référentiel copiés puis
// paramétrés (méso-contrats, options), la recette, la coordination des sous-tickets, les héritages
// (invariants et sections de la méthode de l'orchestrateur, socle, référentiels de la pile, invariants
// du projet), les agents et les observateurs. Au lot 4, le skill racine porte en plus la boîte à outils
// de l'arbre : les documents de la clé Jira selon agent-tdd-jira, les kits dev, test et démo, les
// sous-agents de rôle (rédacteur, analyste, relecteur, qualité) et leurs références, copiées des skills
// du dépôt à leur version épinglée, avec les scripts de contrôle. Au lot 5, il porte le champ
// d'observation de l'arbre et ses observateurs d'ordre 2 et 3 ; chaque nœud y dépose ses actions, les
// retours du développeur et ses observations, ratifications comprises. Au lot 6, il porte la vue
// augmentée de l'arbre : les ancres du ticket, jamais réécrit, avec les calques de ce que le champ en
// dit ; chaque nœud lit la sienne à son lancement, le développeur la vue entière. La consigne suit un patron
// de méthode : le même squelette pour tous les nœuds, des crochets selon la nature du nœud et selon la
// pile. Une fabrique concrète par pile technique fixe ce qui dépend de la pile : référentiels experts,
// agents, commandes de recette. Le choix des méso-contrats n'est pas le sien : il vient du ticket,
// qualifié avant.
//
// Rien n'est tiré au hasard ni daté : la même entrée donne les mêmes fichiers, octet pour octet.

import { createHash } from 'node:crypto';
import { COUCHES, decrireComposition } from './referentiel.mjs';
import { decrireArbre, ordreDeResolution } from './arbre.mjs';
import { extraireSection } from './sources.mjs';

export const VERSION_SKILL = '1.0.0';
/** Lot du prototype qui a produit le générateur, inscrit dans chaque skill. */
export const LOT = 6;

/** Format du rattachement des critères de l'arbre aux critères de la clé Jira, lu par les scripts de contrôle. */
export const FORMAT_RATTACHEMENT = 'skill-ticket.rattachement/1';
export const FICHIER_RATTACHEMENT = 'outils/rattachement.json';

/** Critère de la clé Jira : le k-ième critère de la racine devient `<CLÉ>-CAkk` (agent-tdd-jira, module us-criteres, § 2). */
export const identifiantCa = (cle, k) => `${cle}-CA${String(k).padStart(2, '0')}`;

/** Étiquette Gherkin d'une couche (agent-tdd-jira, module analyse-demande, § 5). */
export const ETIQUETTES_COUCHES = { persistance: '@back', backend: '@back', frontend: '@front' };

/**
 * Sous-agents de rôle de l'arbre, définis par le skill racine et invoqués par les skills des nœuds, chacun
 * dans son propre contexte. `ecrit` : l'agent écrit des fichiers ; sinon il lit seulement et rend son rapport.
 */
export const ROLES = {
  redacteur: { titre: 'rédacteur', ecrit: true },
  analyste: { titre: 'analyste', ecrit: false },
  relecteur: { titre: 'relecteur', ecrit: false },
  qualite: { titre: 'qualité', ecrit: false },
};

/** Ce que sert chaque fichier de la boîte à outils, pour le tableau des fichiers du skill racine. */
const USAGES_BOITE = {
  'references/agent-tdd-jira.md': 'méthode, points de validation et invariants, pour le rédacteur et les agents de couche',
  'references/agent-tdd-jira/ingestion-jira.md': 'demande.json au schéma version 1, pour le rédacteur',
  'references/agent-tdd-jira/us-criteres.md': 'US et critères d\'acceptation numérotés, us.md, pour le rédacteur',
  'references/agent-tdd-jira/analyse-demande.md': 'exigences, questions et scénarios Gherkin, pour le rédacteur',
  'references/agent-tdd-jira/cycle-tdd.md': 'cycle rouge, vert, remanié, pour les agents de couche des feuilles',
  'references/agent-tdd-jira/tracabilite.md': 'matrice de traçabilité, pour le kit test',
  'references/agent-tdd-jira/binome-agent2test.md': 'étiquettes du binôme et remise du plan, pour le rédacteur et la remise à Agent2Test',
  'references/agent2test/plan.md': 'jouabilité des scénarios selon Agent2Test, pour la remise',
  'references/agent2test/remise.md': 'format agent2test.remise/1, pour la remise',
  'references/analyse-projet.md': 'règles globales et invariants, pour l\'analyste',
  'references/analyse-projet/cartographie.md': 'cartographie du projet, pour l\'analyste',
  'references/java/revue.md': 'mode revue du référentiel Java, pour le relecteur',
  'references/angular/revue.md': 'mode revue du référentiel Angular, pour le relecteur',
  'references/sonarqube.md': 'règles globales, jeton et invariants, pour l\'agent qualité',
  'references/sonarqube/examen-local.md': 'examen local de la qualité, pour l\'agent qualité',
  'outils/extraire-jira.mjs': 'script d\'extraction d\'une capture MHTML de Jira, pour le rédacteur',
  'outils/controler-criteres.mjs': 'script de contrôle des US, des critères et des scénarios',
  'outils/verifier-documents.mjs': 'script de contrôle des documents de la clé contre le rattachement de l\'arbre',
  'outils/verifier-kits.mjs': 'script de contrôle des kits dev, test et démo et de la remise à Agent2Test',
  'outils/champ.mjs': 'script du champ d\'observation : dépôt, vérification et état',
  'outils/vue.mjs': 'script de la vue augmentée : calques et états de chaque ancre, d\'après le champ',
  [FICHIER_RATTACHEMENT]: 'rattachement des critères de l\'arbre aux critères de la clé, pour les scripts de contrôle, le champ et la vue',
};
export const sha256 = (texte) => createHash('sha256').update(texte, 'utf8').digest('hex');

/**
 * Sections de la méthode de l'orchestrateur recopiées dans le module `methode`, selon la nature du nœud :
 * la racine y ajoute la boucle de second ordre et le registre des concepts (§ 6, § 7.2), que lisent les
 * observateurs de l'arbre (lot 5).
 */
export const SECTIONS_METHODE = { feuille: ['2', '5.1', '5.2', '6', '7.1', '8', '11.5'], racine: ['6', '7.2', '11.5'], compose: ['11.5'] };
export const sectionsMethode = (n) => {
  if (n.estFeuille) return n.estRacine ? ['2', '5.1', '5.2', '6', '7.1', '7.2', '8', '11.5'] : SECTIONS_METHODE.feuille;
  return n.estRacine ? SECTIONS_METHODE.racine : SECTIONS_METHODE.compose;
};

/** Nom d'un skill de ticket : « ticket- » suivi de la référence, en minuscules et tirets. */
export const nomSkill = (reference) => `ticket-${reference.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;

/** Commande Gemini CLI d'un nœud : `/ticket:<référence en minuscules et tirets>`, et son fichier dans le skill. */
export const nomCommande = (reference) => nomSkill(reference).replace(/^ticket-/, '');
export const commandeSkill = (reference) => `/ticket:${nomCommande(reference)}`;
export const FICHIER_COMMANDE = (reference) => `commandes/ticket/${nomCommande(reference)}.toml`;

/**
 * Phrase qui active un skill de ticket installé par l'installateur, reprise par sa commande et par le
 * lancement de Gemini CLI. Ni guillemet, ni caractère qu'une invite de commandes interpréterait.
 */
export const phraseActivation = (nom) => `Active le skill ${nom}. L'étape 0 de sa consigne est faite : ses fichiers sont dans .gemini/skills/${nom}/, vérifiés par integrite.sha256. Lis CONSIGNE.md dans ce dossier et suis-la à partir de l'étape 1.`;

/**
 * Objet d'une ratification déposée dans le champ d'observation (lot 5) : « arbre <CLÉ> » sur la racine
 * d'un arbre, la référence de la feuille sinon. Sa forme fixe permet de la reconnaître sans
 * interprétation, à l'installateur comme aux autres skills. Les skills des lots 3 et 4 l'écrivaient dans
 * `retours.md`, sur une ligne `- AAAA-MM-JJ, <nom> : <objet> ratifié`, que l'installateur lit encore.
 */
export const objetRatification = (n) => (n.estRacine && !n.estFeuille ? `arbre ${n.reference}` : n.reference);

/** Couches touchées par un ticket : celles où il porte au moins une option. */
export const couchesDuTicket = (ticket) => COUCHES.filter((c) => ticket?.[c] && Object.keys(ticket[c]).length > 0);

const cellule = (texte) => String(texte ?? '').replace(/\|/g, '\\|').replace(/\n+/g, ' ');
const tableau = (entetes, lignes) => [
  `| ${entetes.join(' | ')} |`,
  `|${entetes.map(() => '---').join('|')}|`,
  ...lignes.map((l) => `| ${l.map(cellule).join(' | ')} |`),
].join('\n');
const fichier = (rel, lignes) => ({ rel, contenu: `${(Array.isArray(lignes) ? lignes.join('\n') : lignes).replace(/\n+$/, '')}\n` });
const liste = (elements) => (elements.length <= 1 ? elements.join('') : `${elements.slice(0, -1).join(', ')} et ${elements.at(-1)}`);

/** Texte libre rendu sûr pour une valeur YAML sans guillemets : ni « : », ni « # » précédé d'un blanc. */
const sansDeuxPoints = (texte) => String(texte).replace(/\s*:\s+/g, ', ').replace(/\s+#/g, ' n°');

/** En-tête YAML : valeurs simples sans guillemets, ou listes en bloc (les outils d'un agent). */
function frontmatter(champs) {
  const lignes = [];
  for (const [k, v] of Object.entries(champs)) {
    for (const x of Array.isArray(v) ? v : [v]) {
      if (/:\s|\s#|^[-?:,[\]{}#&*!|>'"%@`]/.test(x)) throw new Error(`frontmatter : ${k} n'est pas une valeur YAML simple (${x})`);
    }
    lignes.push(Array.isArray(v) ? `${k}:\n${v.map((x) => `  - ${x}`).join('\n')}` : `${k}: ${v}`);
  }
  return `---\n${lignes.join('\n')}\n---\n`;
}

/** Valeur TOML d'une instance d'option, pour la recopier dans un module. */
export function valeurToml(v) {
  if (typeof v === 'string') return JSON.stringify(v);
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return `[${v.map(valeurToml).join(', ')}]`;
  return `{ ${Object.entries(v).map(([k, x]) => `${/^[A-Za-z0-9_-]+$/.test(k) ? k : JSON.stringify(k)} = ${valeurToml(x)}`).join(', ')} }`;
}

const CHAMPS_CATALOGUE = new Set(['nom', 'slot', 'description', 'preuves', 'parametres', 'notes', 'applicable_a', 'formats', 'extractions', 'sortie']);

/**
 * Preuves d'une option, paramétrées : une preuve qui commence par une valeur du catalogue (« remplacement : … »,
 * « create : … ») ne vaut que si une instance du ticket a retenu cette valeur ; les autres valent toujours.
 */
export function preuvesParametrees(catalogue, instances) {
  const parametres = Object.keys(catalogue.parametres ?? {});
  const valeurs = new Set([...Object.values(catalogue.parametres ?? {}).flat(), ...(catalogue.operations ?? [])]);
  const retenues = new Set(instances.flatMap((i) => [...parametres.map((p) => i[p]), ...(Array.isArray(i.operations) ? i.operations : [])]));
  return (catalogue.preuves ?? []).map((preuve) => {
    const condition = /^([a-z_]+) : /.exec(preuve)?.[1];
    return { preuve, condition: valeurs.has(condition) ? condition : null, retenue: !valeurs.has(condition) || retenues.has(condition) };
  });
}

const accord = (n, singulier, pluriel_) => (n > 1 ? pluriel_ : singulier);

export class FabriqueSkillTicket {
  /**
   * `contexte` : R (référentiel), arbre (vérifié), sources (orchestrateur, rattachement des options aux
   * slots, socle, référentiels experts, invariants du projet).
   */
  constructor(contexte) {
    this.ctx = contexte;
    this.R = contexte.R;
    this.S = contexte.sources;
  }

  // ---- Crochets de la pile, définis par chaque fabrique concrète ----

  get nom() {
    throw new Error('fabrique concrète attendue');
  }

  /** Référentiels experts requis par les couches touchées : noms dans `sources.experts`. */
  static referencesRequises() {
    throw new Error('fabrique concrète attendue');
  }

  /** Agent d'une couche : { suffixe, titre, technologies, outils }. */
  agentDeCouche() {
    throw new Error('fabrique concrète attendue');
  }

  /** Commandes de recette de la pile pour les couches touchées. */
  commandesRecette() {
    throw new Error('fabrique concrète attendue');
  }

  experts(couches) {
    return this.constructor.referencesRequises(couches).map((nom) => this.S.experts[nom]);
  }

  // ---- Lecture du nœud ----

  racine(n) {
    return n.estRacine ? n : n.ancetres().at(-1);
  }

  nature(n) {
    if (n.estRacine) return n.estFeuille ? 'racine et feuille' : 'racine';
    return n.estFeuille ? 'feuille' : 'composé';
  }

  /** Dossier du ticket dans le projet : celui de la clé Jira, puis un sous-dossier par sous-ticket. */
  dossier(n) {
    const racine = this.racine(n).reference;
    return n.estRacine ? `docs/demandes/${racine}/` : `docs/demandes/${racine}/${n.reference}/`;
  }

  options(n) {
    return this.R.instancesOptions(n.ticket);
  }

  /** Clé Jira de l'arbre : la référence du ticket racine. */
  cle(n) {
    return this.racine(n).reference;
  }

  /**
   * Critères de la clé que soutient chaque critère de l'arbre (`<référence>:<id>` → identifiants
   * `<CLÉ>-CAnn`) : ceux de la racine par leur rang, ceux d'un sous-ticket par la chaîne de ses « soutient ».
   */
  criteresDeLaCle() {
    if (this._criteresDeLaCle) return this._criteresDeLaCle;
    const racine = this.ctx.arbre.racine;
    const carte = new Map(racine.criteres.map((c, k) => [`${racine.reference}:${c.id}`, [identifiantCa(racine.reference, k + 1)]]));
    const visiter = (n) => {
      for (const e of n.enfants) {
        for (const c of e.criteres) {
          const ca = [...new Set((c.soutient ?? []).flatMap((s) => carte.get(s) ?? []))].sort();
          carte.set(`${e.reference}:${c.id}`, ca);
        }
        visiter(e);
      }
    };
    visiter(racine);
    this._criteresDeLaCle = carte;
    return carte;
  }

  caDe(n, c) {
    return this.criteresDeLaCle().get(`${n.reference}:${c.id}`) ?? [];
  }

  /** Étiquettes Gherkin des couches d'une feuille ; aucune pour un nœud composé, qui prouve par agrégation. */
  etiquettesCouches(n) {
    return n.estFeuille ? [...new Set(this.couches(n).map((c) => ETIQUETTES_COUCHES[c]))] : [];
  }

  /** Images de l'objectif désignées par les options front d'une feuille (`image_objectif`). */
  imagesObjectif(n) {
    if (!n.estFeuille) return [];
    return [...new Set(this.options(n).filter((o) => o.couche === 'frontend' && typeof o.instance.image_objectif === 'string').map((o) => o.instance.image_objectif))];
  }

  /** Nom d'un sous-agent de rôle de l'arbre, défini par le skill racine. */
  nomRole(n, role) {
    return `${nomSkill(this.cle(n))}-${role}`;
  }

  /** Couches touchées : celles des options de la feuille, ou de toutes les feuilles du sous-arbre. */
  couches(n) {
    const touchees = new Set(n.feuilles().flatMap((f) => couchesDuTicket(f.ticket)));
    return COUCHES.filter((c) => touchees.has(c));
  }

  transverses(n) {
    const couches = this.couches(n);
    return (this.R.donnees.meso_contrats_transverses ?? []).filter((t) => (t.s_applique_si ?? []).some((c) => couches.includes(c)));
  }

  /** Options du nœud regroupées par couche et par option, dans l'ordre du catalogue, avec leurs slots. */
  optionsGroupees(n) {
    const groupes = [];
    for (const couche of COUCHES) {
      for (const option of Object.keys(this.R.options[couche] ?? {})) {
        const instances = this.options(n).filter((o) => o.couche === couche && o.option === option).map((o) => o.instance);
        if (instances.length === 0) continue;
        const slots = this.S.optionsSlots.get(`${couche}.${option}`) ?? { slots: this.R.options[couche][option].slot ?? '—', etiquettes: '—', engages: [] };
        groupes.push({ couche, option, catalogue: this.R.options[couche][option], instances, slots });
      }
    }
    return groupes;
  }

  // ---- Méthodes de fabrication ----

  /** Le ticket du nœud, recopié tel quel. */
  ticket(n) {
    return fichier('ticket.toml', n.texte);
  }

  /** Blocs du référentiel copiés puis paramétrés (Prototype) : méso-contrats, puis options d'une feuille. */
  modules(n) {
    return [this.mesoContrats(n), ...this.optionsGroupees(n).map((g) => this.moduleOption(n, g))];
  }

  mesoContrats(n) {
    const { principal, complements } = n.composition;
    const blocs = [principal, ...complements].flatMap((id, k) => {
      const m = this.R.mesoContrats.get(id);
      const lignes = Object.entries(m.empreinte_technique).map(([c, e]) => [
        c, e.impact, [(e.technologies ?? []).join(', '), e.style ? `style ${e.style}` : ''].filter(Boolean).join(' ; '), e.options.join(', ') || 'aucune',
      ]);
      return [
        `## ${id}, ${m.code} : ${m.nom}${k === 0 ? ' (principal)' : ' (complément)'}`,
        '',
        String(m.description ?? '').trim(),
        '',
        `Complexité moyenne : ${m.complexite_moyenne ?? 'non précisée'}. Possibilités requises : ${(m.possibilites_requises ?? []).join(', ') || 'aucune'}.`,
        '',
        tableau(['Couche', 'Impact', 'Technologies', 'Options permises'], lignes),
        '',
      ];
    });
    const transverses = this.transverses(n).map((t) => `- **${t.id}, ${t.code}** : ${t.nom}. ${String(t.exigences ?? '').trim()}`);
    return fichier('modules/meso-contrats/SKILL.md', [
      frontmatter({ name: 'meso-contrats', description: `Méso-contrats de ${n.reference}, copiés du référentiel des méso-contrats ${this.R.version} (composition ${decrireComposition(n.composition)}), et méso-contrats transverses des couches touchées.` }),
      `# Méso-contrats de ${n.reference}`,
      '',
      `Composition confirmée à la qualification : ${decrireComposition(n.composition)}. Blocs copiés du référentiel des méso-contrats ${this.R.version}, sans modification. Si l'analyse montre que la demande sort de ces empreintes, ce skill ne change pas de composition : il remonte au ticket parent, ou au développeur pour la racine (D11.INV-4, D10.INV-5).`,
      '',
      ...blocs,
      '## Méso-contrats transverses',
      '',
      `Ils s'appliquent d'office aux couches touchées par ${n.estFeuille ? 'ce ticket' : 'ses sous-tickets'} (${liste(this.couches(n)) || 'aucune'}).`,
      '',
      ...(transverses.length > 0 ? transverses : ['Aucun.']),
    ]);
  }

  moduleOption(n, { couche, option, catalogue, instances, slots }) {
    const listes = Object.entries(catalogue).filter(([k, v]) => !CHAMPS_CATALOGUE.has(k) && Array.isArray(v)).map(([k, v]) => `- \`${k}\` : ${v.map((x) => `\`${x}\``).join(', ')}`);
    const parametres = Object.entries(catalogue.parametres ?? {}).map(([p, v]) => `- \`${p}\` : ${v.map((x) => `\`${x}\``).join(', ')}`);
    const notes = Object.entries(catalogue.notes ?? {}).map(([p, t]) => `- \`${p}\` : ${t}`);
    const image = this.R.options.frontend?.analyse_image;
    const avecImage = image && instances.some((i) => i.analyse_image !== undefined);
    const blocsInstances = instances.flatMap((inst, k) => [
      `### Instance ${k + 1}, rattachée à ${inst.meso_contrat ?? n.composition.principal}`,
      '',
      '```toml',
      ...Object.entries(inst).map(([cle, v]) => `${/^[A-Za-z0-9_-]+$/.test(cle) ? cle : JSON.stringify(cle)} = ${valeurToml(v)}`),
      '```',
      '',
    ]);
    const sortieImage = avecImage ? String(image.sortie ?? '').replace(/docs\/demandes\/\{reference\}\//, this.dossier(n)).replaceAll('{reference}', n.reference) : '';
    const preuves = preuvesParametrees(catalogue, instances);
    const sansObjet = preuves.filter((p) => !p.retenue);
    return fichier(`modules/option-${couche}-${option}/SKILL.md`, [
      frontmatter({ name: `option-${couche}-${option}`, description: `Option « ${sansDeuxPoints(catalogue.nom)} » (${couche}, slots ${sansDeuxPoints(slots.slots)}) du référentiel des méso-contrats ${this.R.version}, copiée puis paramétrée pour ${n.reference}.` }),
      `# Option ${couche} « ${catalogue.nom} »`,
      '',
      `Bloc copié du référentiel des méso-contrats ${this.R.version}, puis paramétré pour ${n.reference}. Slots : ${slots.slots}. Étiquettes des commits : ${slots.etiquettes}.`,
      '',
      '## Ce que dit le référentiel',
      '',
      String(catalogue.description ?? '').trim() || 'Pas de description au référentiel.',
      '',
      ...(listes.length > 0 ? ['Catalogue :', '', ...listes, ''] : []),
      ...(parametres.length > 0 ? ['Paramètres au choix par ticket :', '', ...parametres, ''] : []),
      ...(notes.length > 0 ? ['Notes :', '', ...notes, ''] : []),
      '## Preuves exigées',
      '',
      ...preuves.filter((p) => p.retenue).map((p) => `- ${p.preuve}`),
      '',
      'Chaque preuve rejoint les tests déduits, reliée à un critère ou à un risque de la cartographie (D10.INV-3, D5.INV-1).',
      ...(sansObjet.length > 0
        ? ['', `Sans objet pour ce ticket, ${accord(sansObjet.length, 'sa valeur n\'étant pas retenue', 'leurs valeurs n\'étant pas retenues')} :`, '', ...sansObjet.map((p) => `- ${p.preuve}`)]
        : []),
      '',
      `## Paramétrage pour ${n.reference}`,
      '',
      ...blocsInstances,
      ...(avecImage
        ? [
          '## Analyse de l\'image de l\'objectif',
          '',
          String(image.description ?? '').trim(),
          '',
          `Formats : ${image.formats.join(', ')}. Extractions possibles : ${image.extractions.join(', ')}. Sortie : \`${sortieImage}\`, rédigée avant la ratification et ratifiée avec ce skill (D10.INV-4).`,
          '',
          ...(image.preuves ?? []).map((p) => `- ${p}`),
          '',
        ]
        : []),
    ]);
  }

  /**
   * Critères du nœud, avec le critère d'acceptation de la clé qu'ils portent ou soutiennent ; la colonne
   * « Soutient » pour un sous-ticket seulement, la racine ne soutient rien.
   */
  tableauCriteres(n, prefixe = '') {
    const ca = (c) => this.caDe(n, c).join(', ') || '—';
    if (n.estRacine) return tableau(['Critère', 'Énoncé', 'Critère d\'acceptation'], n.criteres.map((c) => [`${prefixe}${c.id}`, c.enonce, ca(c)]));
    return tableau(['Critère', 'Énoncé', 'Soutient', 'Critère d\'acceptation'], n.criteres.map((c) => [`${prefixe}${c.id}`, c.enonce, (c.soutient ?? []).join(', '), ca(c)]));
  }

  /** Recette : critères à prouver ; pour une feuille, scénarios, preuves des options, transverses, commandes de la pile. */
  recette(n) {
    const criteres = this.tableauCriteres(n, `${n.reference}:`);
    const cle = this.cle(n);
    const feature = `docs/demandes/${cle}/${cle}.feature`;
    const etiquettes = this.etiquettesCouches(n).map((e) => `\`${e}\``);
    const corps = n.estFeuille
      ? [
        '## Scénarios à réaliser',
        '',
        `Chaque critère se prouve par les scénarios de \`${feature}\` qui portent son critère d'acceptation et l'étiquette d'une couche de ce ticket (${liste(etiquettes)}), hors \`@en-attente\` et \`@propose\`. Les agents de couche les réalisent en cycle TDD (section 7 de \`SKILL.md\`) ; chaque test porte l'étiquette de son scénario (agent-tdd-jira:D6.INV-2).`,
        '',
        tableau(['Critère', 'Critère d\'acceptation', 'Scénarios'], n.criteres.map((c) => [
          `${n.reference}:${c.id}`, this.caDe(n, c).join(', '), `${this.caDe(n, c).map((x) => `\`@${x}\``).join(' ou ')} et ${etiquettes.join(' ou ')}`,
        ])),
        '',
        '## Preuves exigées par les options',
        '',
        ...this.optionsGroupees(n).map(({ couche, option, catalogue, instances }) => {
          const preuves = preuvesParametrees(catalogue, instances);
          const retenues = preuves.filter((p) => p.retenue).length;
          const sansObjet = preuves.length - retenues;
          return `- \`${couche}.${option}\` (module \`option-${couche}-${option}\`) : ${retenues} ${accord(retenues, 'preuve retenue', 'preuves retenues')}${sansObjet > 0 ? `, ${sansObjet} sans objet` : ''}.`;
        }),
        '',
        '## Exigences des méso-contrats transverses',
        '',
        ...this.transverses(n).map((t) => `- **${t.id}** : ${String(t.exigences ?? '').trim()}`),
        '',
        `## Commandes de la pile (fabrique ${this.nom})`,
        '',
        ...this.commandesRecette(this.couches(n)).map((c) => `- ${c}`),
        '',
        'Les commandes que fixe le fichier d\'invariants du projet priment sur celles-ci.',
        '',
        '## Règles',
        '',
        '- Les gates et la déduction des tests suivent le module `methode` (§ 5.1 et § 5.2).',
        '- Chaque test prouve un critère numéroté ou un risque de la cartographie (D5.INV-1).',
        '- Les tests se déduisent avant toute modification ; aucun test existant n\'est supprimé ni affaibli sans l\'accord du développeur (D5.INV-2).',
        '- La remise n\'a lieu qu\'après les gates de la profondeur visée, au niveau de preuve de la criticité (D5.INV-3).',
        '',
        '## Dossier de preuves',
        '',
        `Dans \`${this.dossier(n)}remise.md\` : test, scénario, critère ou risque, résultat ; gates passées ; contributions aux kits de l'arbre (section 8 de \`SKILL.md\`).`,
      ]
      : [
        '## Recette par agrégation',
        '',
        'Ce nœud n\'agit pas sur le code. Chacun de ses critères est prouvé quand les critères qui le soutiennent, dans ses sous-tickets, sont prouvés :',
        '',
        tableau(['Critère', 'Critère d\'acceptation', 'Soutenu par'], n.criteres.map((c) => {
          const ref = `${n.reference}:${c.id}`;
          return [ref, this.caDe(n, c).join(', '), n.enfants.flatMap((e) => e.criteres.filter((x) => (x.soutient ?? []).includes(ref)).map((x) => `${e.reference}:${x.id}`)).join(', ')];
        })),
        '',
        `Le bilan va dans \`${this.dossier(n)}remise.md\` : pour chaque critère, les preuves de ceux qui le soutiennent, avec le dossier du sous-ticket qui les porte.`,
      ];
    return fichier('modules/recette/SKILL.md', [
      frontmatter({ name: 'recette', description: `Recette de ${n.reference}, critères à prouver${n.estFeuille ? ', preuves des options, transverses et commandes de la pile' : ', preuve par agrégation des sous-tickets'}.` }),
      `# Recette de ${n.reference}`,
      '',
      '## Critères à prouver',
      '',
      criteres,
      '',
      ...corps,
    ]);
  }

  /** Coordination des sous-tickets d'un nœud composé : sous-arbre, ordre, dépendances extérieures. */
  sousTickets(n) {
    if (n.estFeuille) return [];
    const { ordre, externes } = ordreDeResolution(this.ctx.arbre, n);
    const lignes = n.enfants.map((e) => [e.reference, `\`${nomSkill(e.reference)}\``, decrireComposition(e.composition), this.nature(e), e.dependances.join(', ') || '—', `\`${this.dossier(e)}\``]);
    return [fichier('modules/sous-tickets/SKILL.md', [
      frontmatter({ name: 'sous-tickets', description: `Coordination des sous-tickets de ${n.reference}, sous-arbre, ordre de résolution, dépendances et règles de clôture.` }),
      `# Sous-tickets de ${n.reference}`,
      '',
      '```text',
      ...decrireArbre({ racine: n }),
      '```',
      '',
      tableau(['Sous-ticket', 'Skill', 'Composition', 'Nature', 'Dépend de', 'Dossier'], lignes),
      '',
      '## Ordre de résolution',
      '',
      ...ordre.map(({ noeud, action }, k) => `${k + 1}. ${noeud.reference} : ${action}, commande \`${commandeSkill(noeud.reference)}\`${noeud === n ? ' (ce skill)' : ''}`),
      '',
      ...(externes.length > 0 ? ['Préalables extérieurs à ce sous-arbre :', '', ...externes.map(({ noeud, dependance }) => `- ${noeud.reference} attend la clôture de ${dependance.reference}`), ''] : []),
      '## Coordination',
      '',
      '1. Chaque nœud se traite dans sa propre session de Gemini CLI, avec son propre contexte, que le développeur lance dans cet ordre : la commande du nœud dans une nouvelle session, ou `installer-arbre.mjs lancer <référence>`. Ce skill n\'active pas celui d\'un sous-ticket dans sa propre session.',
      '2. Un sous-ticket est prêt quand les tickets dont il dépend sont clos : leur `remise.md` est écrite et leurs critères sont prouvés. Une feuille se ratifie encore avant sa première action.',
      `3. ${n.reference} se clôt quand tous ses sous-tickets sont clos et que chacun de ses critères est prouvé par ceux qui le soutiennent (module \`recette\`) ; le développeur relance alors ce skill pour la clôture.`,
      '4. Un écart d\'un sous-ticket qui menace un critère de ce nœud remonte jusqu\'ici, avec sa preuve ; il s\'inscrit au registre des écarts et ne se tranche pas en silence (D6.INV-3).',
      '5. Une demande qui sort des empreintes d\'un sous-ticket remonte de même : ce nœud la porte à son parent, ou au développeur s\'il est la racine (D11.INV-4).',
    ])];
  }

  /** Rattachement des critères de l'arbre aux critères de la clé, et images de l'objectif des feuilles. */
  contenuRattachement(n) {
    const racine = this.racine(n);
    const cle = racine.reference;
    const noeuds = [];
    racine.accepter({ visiter: (x) => (!x.estRacine || x.estFeuille ? noeuds.push(x) : undefined) });
    return {
      format: FORMAT_RATTACHEMENT,
      cle,
      criteres: racine.criteres.map((c, k) => ({ ca: identifiantCa(cle, k + 1), critere: `${cle}:${c.id}`, enonce: c.enonce })),
      noeuds: noeuds.map((x) => ({
        reference: x.reference,
        nature: this.nature(x),
        dossier: this.dossier(x),
        etiquettes: this.etiquettesCouches(x),
        criteres: x.criteres.map((c) => ({ id: c.id, enonce: c.enonce, ca: this.caDe(x, c), soutient: c.soutient ?? [] })),
        images: this.imagesObjectif(x),
      })),
    };
  }

  /** Chemin d'un fichier de la boîte à outils dans le skill racine installé. */
  outil(n, rel) {
    return `.gemini/skills/${nomSkill(this.cle(n))}/${rel}`;
  }

  /** Commande du champ d'observation de l'arbre, depuis la racine du projet. */
  commandeChamp(n, commande) {
    return `node ${this.outil(n, 'outils/champ.mjs')} ${commande} docs/demandes/${this.cle(n)}`;
  }

  /** Commande de la vue augmentée de l'arbre, depuis la racine du projet ; avec `noeud`, la vue de ce nœud, sur la sortie. */
  commandeVue(n, commande, noeud = null) {
    return `node ${this.outil(n, 'outils/vue.mjs')} ${commande} docs/demandes/${this.cle(n)}${noeud ? ` --noeud ${noeud}` : ''}`;
  }

  /** Présentation de la vue entière au développeur, par la racine : à la ratification de l'arbre et à la clôture. */
  vueAuDeveloppeur(n, contenu) {
    return `Génère la vue augmentée de l'arbre, \`${this.commandeVue(n, 'generer')}\`, et invite le développeur à ouvrir \`docs/demandes/${this.cle(n)}/vue.html\` dans son navigateur : ${contenu}.`;
  }

  /** Dépôt de la ratification d'un nœud dans le champ, à compléter du nom et de la réponse du développeur. */
  depotRatification(n) {
    return `${this.commandeChamp(n, 'deposer')} retour --noeud ${n.reference} --auteur ${nomSkill(n.reference)} --nature ratification --objet "${objetRatification(n)}" --decision ratifié --par "<nom>" --contenu "<sa réponse>"`;
  }

  /**
   * Documents de la clé Jira, selon agent-tdd-jira, et rattachement des critères (skill racine) : rédigés
   * par le sous-agent rédacteur avant la ratification de l'arbre, contrôlés par script, ratifiés avec lui.
   */
  documents(n) {
    if (!n.estRacine) return [];
    const r = this.contenuRattachement(n);
    const cle = r.cle;
    const dossier = this.dossier(n);
    const versionTdd = this.S.boite.versions['agent-tdd-jira'];
    const images = r.noeuds.flatMap((x) => x.images.map((i) => `\`${i}\` (${x.reference})`));
    const sousTickets = r.noeuds.filter((x) => x.reference !== cle);
    return [
      fichier('modules/documents/SKILL.md', [
        frontmatter({ name: 'documents', description: `Documents de la clé Jira ${cle} selon agent-tdd-jira ${versionTdd}, demande.json, us.md et ${cle}.feature, rédigés par le sous-agent rédacteur avant la ratification de l'arbre, avec le rattachement des critères des sous-tickets et les contrôles par script.` }),
        `# Documents de la clé ${cle}`,
        '',
        `Avant la ratification de l'arbre, les documents de la clé Jira se rédigent dans \`${dossier}\`, avec la méthode d'agent-tdd-jira ${versionTdd}, incluse dans ce skill (\`references/agent-tdd-jira.md\` et \`references/agent-tdd-jira/\`). Ils sont le plan commun de l'arbre : chaque sous-ticket prouve ses critères par leurs scénarios, et Agent2Test les reçoit tels quels à la remise. Ils se ratifient avec l'arbre, ce qui tient lieu de la validation V2 d'agent-tdd-jira.`,
        '',
        '## 1. Les trois documents',
        '',
        tableau(['Document', 'Méthode', 'Contenu'], [
          ['`demande.json`', '`references/agent-tdd-jira/ingestion-jira.md`, § 2 à § 6', `schéma version 1 (§ 4). Si le développeur fournit la capture MHTML du ticket (dossier IA de capture-sprint-jira, ou page enregistrée selon le § 2), le rédacteur l'extrait avec \`outils/extraire-jira.mjs\`, sans la retoucher (agent-tdd-jira:D1.INV-1) ; sinon il part du ticket racine : \`source.fichier\` vaut \`ticket.toml\`, et la limite « capture MHTML absente » s'inscrit dans \`limites\`. Les commentaires gardent leur ordre ; chaque image de l'objectif d'un sous-ticket figure parmi les pièces.`],
          ['`us.md`', '`references/agent-tdd-jira/us-criteres.md`, § 1 à § 4', `au moins une US \`${cle}-USnn\` ; chaque critère de la racine repris mot pour mot sous son identifiant (section 2), origine « repris », statut « à valider » jusqu'à la ratification ; les exigences \`EX-nn\`, rattachées à un critère ou à une question (agent-tdd-jira:D10.INV-4).`],
          [`\`${cle}.feature\``, '`references/agent-tdd-jira/analyse-demande.md`, § 5 et § 6 ; `references/agent-tdd-jira/binome-agent2test.md`, § 3', `Gherkin en français ; chaque scénario étiqueté \`@${cle}-Snn\`, avec le ou les critères qu'il illustre (\`@${cle}-CAnn\`), ses couches (\`@back\`, \`@front\`) et les étiquettes du binôme avec Agent2Test (\`@role-<nom>\`, \`@batch-<nom>\`, \`@redemarrage\`, \`@ecriture-base\`).`],
        ]),
        '',
        'Images de l\'objectif des feuilles : ' + (images.length > 0 ? `${liste(images)}.` : 'aucune.'),
        '',
        '## 2. Critères de la racine',
        '',
        `Le k-ième critère de la racine devient \`${cle}-CAkk\`, et son énoncé se reprend mot pour mot :`,
        '',
        tableau(['Critère d\'acceptation', 'Critère', 'Énoncé'], r.criteres.map((c) => [c.ca, c.critere, c.enonce])),
        '',
        `Les identifiants ne se renumérotent jamais (agent-tdd-jira:D10.INV-1). Un critère proposé par le rédacteur prend le numéro suivant, avec l'origine « proposé », et se ratifie avec l'arbre. Si \`controler-criteres.mjs\` juge non vérifiable l'énoncé d'un critère de la racine, le rédacteur ne le reformule pas : l'écart remonte au développeur, qui corrige le ticket racine, puis l'arbre se régénère.`,
        '',
        '## 3. Critères des sous-tickets',
        '',
        'Chaque critère d\'un sous-ticket se rattache, par la chaîne de ses « soutient », à des critères d\'acceptation de la clé. Il se prouve par leurs scénarios ; pour une feuille, par ceux qui portent aussi l\'étiquette d\'une de ses couches. Chacun a donc au moins un tel scénario.',
        '',
        ...(sousTickets.length > 0
          ? [tableau(['Sous-ticket', 'Critère', 'Critère d\'acceptation', 'Scénarios attendus'], sousTickets.flatMap((x) => x.criteres.map((c) => [
            x.reference, c.id, c.ca.join(', '), `au moins un ${c.ca.map((a) => `\`@${a}\``).join(' ou ')}${x.etiquettes.length > 0 ? ` avec ${x.etiquettes.map((e) => `\`${e}\``).join(' ou ')}` : ''}`,
          ])))]
          : ['Ce ticket n\'a pas de sous-ticket.']),
        '',
        `\`${FICHIER_RATTACHEMENT}\` porte ces tableaux et les images de l'objectif des feuilles, pour les scripts de contrôle.`,
        '',
        '## 4. Rédaction, par le sous-agent rédacteur',
        '',
        '1. Demande au développeur s\'il fournit la capture MHTML du ticket, et son chemin ; sinon, le rédacteur part du ticket racine.',
        `2. Confie la rédaction au sous-agent \`${this.nomRole(n, 'redacteur')}\`, par l'outil \`invoke_agent\`, avec ce chemin s'il y en a un. Il écrit les trois documents dans son propre contexte, et seulement eux, puis rend son rapport.`,
        '3. Une contradiction entre la description et les commentaires, ou une ambiguïté, devient une question `Qn` (analyse-demande, § 4) : le critère concerné passe « en attente de Qn », et ses scénarios portent `@en-attente`. Rien ne se tranche en silence.',
        '',
        '## 5. Contrôles, sans écart',
        '',
        'Depuis la racine du projet :',
        '',
        '```bash',
        `node ${this.outil(n, 'outils/controler-criteres.mjs')} ${dossier.replace(/\/$/, '')}`,
        `node ${this.outil(n, 'outils/verifier-documents.mjs')} ${dossier.replace(/\/$/, '')} --rattachement ${this.outil(n, FICHIER_RATTACHEMENT)}`,
        '```',
        '',
        'Le premier est le script d\'agent-tdd-jira (us-criteres, § 7), à l\'identique. Le second vérifie que le premier ne signale aucun écart, que `demande.json` suit le schéma version 1 et porte les images de l\'objectif, que les critères de la racine sont repris mot pour mot, et que chaque critère d\'un sous-ticket est illustré par un scénario, de sa couche pour une feuille. Un écart se corrige avant la ratification, ou devient une question au développeur.',
        '',
        '## 6. Ratification, qui tient lieu de V2',
        '',
        'Au point de ratification de l\'arbre (section 6 de `SKILL.md`), présente avec lui :',
        '',
        '- le résumé de l\'extraction, si une capture MHTML a été extraite (ingestion-jira, § 6), qui tient lieu de V1 ;',
        '- le résumé V2 (us-criteres, § 6), le tableau des exigences, les questions et le fichier Gherkin ;',
        '- le rattachement des critères des sous-tickets (section 3).',
        '',
        'Après la réponse du développeur :',
        '',
        '1. Les statuts passent de « à valider » à « validé », « en attente de Qn » ou « retiré : <raison> », selon sa décision ; la colonne « Scénarios » de `us.md` suit le fichier Gherkin.',
        '2. Les deux contrôles de la section 5 repassent sans écart.',
        '3. La ratification de l\'arbre se dépose dans le champ d\'observation (module `champ`, section 3).',
        `4. La branche de l'arbre se crée si elle n'existe pas, au format du projet, par défaut \`<type>/${cle}-<slug>\` (D4.INV-1) ; les trois documents s'y commitent, et rien d'autre : \`${cle} : [É6-C7E] docs(demande): US, critères d'acceptation et scénarios ratifiés\` (D4.INV-2). Dans un arbre, les documents se commitent à la ratification, et non avec le premier scénario (cycle-tdd, § 7) : toutes les feuilles partent du même plan.`,
        '',
        'Toute modification ultérieure de `us.md` ou du fichier Gherkin repasse par ce skill et par une nouvelle ratification. Un sous-ticket qui a besoin d\'un critère nouveau le remonte ici.',
      ]),
      fichier(FICHIER_RATTACHEMENT, JSON.stringify(r, null, 2)),
    ];
  }

  /** Kits dev, test et démo, et remise à Agent2Test, assemblés à la clôture de l'arbre (skill racine). */
  kits(n) {
    if (!n.estRacine) return [];
    const cle = this.cle(n);
    const d = this.dossier(n);
    const r = this.contenuRattachement(n);
    const images = r.noeuds.flatMap((x) => x.images.map((i) => `\`${i}\` (${x.reference})`));
    const json = (objet) => ['```json', JSON.stringify(objet, null, 2), '```'];
    const fichiersExemple = [{ chemin: `${d}<fichier>`, sha256: '<sha256>' }];
    return [fichier('modules/kits/SKILL.md', [
      frontmatter({ name: 'kits', description: `Kits de l'arbre ${cle} assemblés à sa clôture par le skill racine, kit dev, kit test et kit démo, et remise à Agent2Test au format agent2test.remise/1, avec leurs manifestes fermés et leur contrôle par script.` }),
      `# Kits de ${cle}`,
      '',
      `À la clôture de l'arbre, le skill racine assemble trois kits à partir des documents de la clé et des remises des nœuds, puis rédige la remise à Agent2Test. Chaque kit est un manifeste JSON fermé, dans \`${d}kits/\`, au format \`skill-ticket.kit/1\` : un champ inconnu ou absent est un écart. Chaque fichier qu'il cite figure dans sa liste \`fichiers\`, avec son empreinte sha256 sur le contenu brut, celle que donne \`sha256sum\`. Les chemins partent de la racine du projet, séparés par \`/\`.`,
      '',
      '## 1. Kit dev, `kits/dev.json`',
      '',
      'De quoi reprendre le code : la branche de l\'arbre, ses commits dans l\'ordre de l\'historique, la remise de chaque nœud et la remise à Agent2Test.',
      '',
      ...json({
        format: 'skill-ticket.kit/1', kit: 'dev', cle, branche: `<type>/${cle}-<slug>`,
        commits: [
          { sha: '<sha1>', sous_ticket: cle, titre: `${cle} : [É6-C7E] docs(demande): US, critères d'acceptation et scénarios ratifiés` },
          { sha: '<sha1>', sous_ticket: '<feuille>', titre: `${cle} Snn : [É<n>-<DOMAINE>] <type>(<portée>): <description>` },
        ],
        remises: [`${d}remise.md`, '<dossier de chaque sous-ticket>remise.md'],
        remise_agent2test: `${d}kits/remise-agent2test.json`,
        fichiers: fichiersExemple,
      }),
      '',
      `- \`commits\` : chaque commit de l'arbre, un slot chacun (D4.INV-2). \`sous_ticket\` vaut ${cle} pour un commit de la racine, les documents ; sinon la feuille qui l'a produit, citée par la ligne \`Sous-ticket : <référence>\` du corps du commit. Chaque feuille a au moins un commit ; le dernier est la tête de la branche.`,
      '- `remises` : le `remise.md` de chaque nœud, racine comprise ; chacun figure dans `fichiers`.',
      '- `remise_agent2test` : le chemin de la remise (section 4), qui ne figure pas dans `fichiers` : elle se rédige après ce manifeste.',
      '',
      '## 2. Kit test, `kits/test.json`',
      '',
      'De quoi rejouer la preuve : le plan, les tests déduits et leurs scénarios, la matrice de traçabilité et l\'ouverture de la campagne d\'Agent2Test.',
      '',
      ...json({
        format: 'skill-ticket.kit/1', kit: 'test', cle,
        plan: [`${d}us.md`, `${d}${cle}.feature`],
        demande: `${d}demande.json`,
        tests: [{ chemin: '<fichier de test>', scenarios: [`${cle}-S01`] }],
        matrice: `${d}kits/matrice.md`,
        campagne: { adaptateur: 'agent-tdd-jira', dossier: d.replace(/\/$/, '') },
        fichiers: fichiersExemple,
      }),
      '',
      '- `tests` : les tests relevés dans les remises des feuilles ; chacun porte l\'étiquette de son scénario (agent-tdd-jira:D6.INV-2) ; chaque scénario ni `@en-attente` ni `@propose` a au moins un test.',
      '- `matrice` : la matrice de traçabilité (`references/agent-tdd-jira/tracabilite.md`, § 3), construite par recherche (§ 2) ; elle cite chaque scénario.',
      '- `campagne` : l\'adaptateur et le dossier avec lesquels le développeur ouvre la campagne d\'Agent2Test.',
      '',
      '## 3. Kit démo, `kits/demo.json`',
      '',
      'De quoi montrer le résultat : un parcours tiré des scénarios, les données et les commandes de lancement, et les captures de l\'écran livré, comparées aux images de l\'objectif.',
      '',
      ...json({
        format: 'skill-ticket.kit/1', kit: 'demo', cle,
        parcours: `${d}kits/demo/parcours.md`,
        scenarios: [`${cle}-Snn`],
        donnees: ['<dossier d\'une feuille>demo/<données>'],
        commandes: ['<commande de lancement>'],
        captures: [{ scenario: `${cle}-Snn`, capture: `<dossier de la feuille front>captures/${cle}-Snn.png`, image_objectif: null }],
        fichiers: fichiersExemple,
      }),
      '',
      '- `scenarios` : ceux que voit une personne, `@front`, qui illustrent un critère validé, ni `@propose` ni `@en-attente` ; le parcours les cite tous, dans l\'ordre de la démonstration, avec leurs étapes telles qu\'écrites.',
      '- `donnees` et `commandes` : les données à charger, fichiers que les feuilles déposent dans leur dossier, et les commandes de lancement, relevées dans leurs remises.',
      `- \`captures\` : l'écran livré, capturé par l'agent front de la feuille, et l'image de l'objectif à laquelle il est comparé, ou \`null\`. Chaque image de l'objectif a sa capture ; les écarts se décrivent dans le parcours. Images de l'objectif de cet arbre : ${images.length > 0 ? `${liste(images)}.` : 'aucune.'}`,
      '',
      '## 4. Remise à Agent2Test, `kits/remise-agent2test.json`',
      '',
      `Au format fermé \`agent2test.remise/1\` (\`references/agent2test/remise.md\`), rédigée en dernier, quand le dernier commit du kit dev est la tête de la branche et qu'aucun fichier suivi n'est modifié (binome-agent2test, § 4) :`,
      '',
      `- \`id\` : \`R-${cle}-<n>\` ; \`date\` en UTC ; \`racine\` : le chemin du projet, affiché et jamais ouvert par Agent2Test ;`,
      `- \`plan\` : adaptateur \`agent-tdd-jira\`, dossier \`${d.replace(/\/$/, '')}\`, sources \`us.md\` et \`${cle}.feature\`, avec leur empreinte ;`,
      '- `commit` : le dernier commit du kit dev ; `changements.git` : la plage depuis la branche de base ;',
      '- `criteres` : chaque critère non retiré de `us.md`, avec son statut ;',
      '- `jouables`, `nonJouables` avec leur motif, `roles` et `prealables` : la prévision, selon les règles de jouabilité d\'Agent2Test (`references/agent2test/plan.md`). Est jouable un scénario sans marque bloquante (`@propose`, `@en-attente`, `@back` sans `@front`, `@redemarrage`, `@ecriture-base`) qui illustre un critère validé ; les rôles sont ceux des étiquettes `@role-<nom>`, les préalables les batchs `@batch-<nom>` des scénarios jouables. Agent2Test décide à l\'ouverture.',
      '',
      'Ce skill ne transmet pas la remise à Agent2Test : il la donne au développeur, qui la dépose (binome-agent2test, § 4).',
      '',
      '## 5. Assemblage et contrôle',
      '',
      '1. Relève, dans le `remise.md` de chaque feuille, ses contributions aux kits : commits, tests et leurs scénarios, captures, données et commandes de démonstration.',
      '2. Écris la matrice et le parcours, puis `kits/test.json` et `kits/demo.json`.',
      '3. Écris le `remise.md` de la racine (section 8 de `SKILL.md`), puis `kits/dev.json`.',
      '4. Rédige `kits/remise-agent2test.json`.',
      '5. Contrôle, sans écart, depuis la racine du projet :',
      '',
      '```bash',
      `node ${this.outil(n, 'outils/verifier-kits.mjs')} ${d.replace(/\/$/, '')} --rattachement ${this.outil(n, FICHIER_RATTACHEMENT)} --depot`,
      '```',
      '',
      'Le script vérifie chaque manifeste, chaque empreinte, les commits dans le dépôt, la couverture des scénarios par les tests, le parcours et les captures, et la remise contre `us.md`, le fichier Gherkin et le kit dev.',
      '',
      'Les kits, comme le champ d\'observation, ne se commitent pas avant la campagne d\'Agent2Test : le commit remis doit rester la tête de la branche (agent2test, module echange, § 4). Le développeur les commite ensuite, s\'il le souhaite.',
    ])];
  }

  /**
   * Champ d'observation de l'arbre (skill racine, lot 5) : ses enregistrements, ses commandes, les ordres
   * d'observation, les déclencheurs, la propagation des menaces, l'escalade et les désaccords.
   */
  champ(n) {
    if (!n.estRacine) return [];
    const cle = this.cle(n);
    const d = `docs/demandes/${cle}`;
    const c = (commande) => this.commandeChamp(n, commande);
    const o2 = this.nomRole(n, 'observateur-2');
    const o3 = this.nomRole(n, 'observateur-3');
    const feuille = n.feuilles()[0];
    const exemple = feuille.estRacine ? n.reference : feuille.reference;
    const agent = feuille.estRacine ? nomSkill(n.reference) : this.nomAgent(feuille, this.couches(feuille)[0]);
    const critere = feuille.criteres[0] ? `${exemple}:${feuille.criteres[0].id}` : `${exemple}:C1`;
    return [fichier('modules/champ/SKILL.md', [
      frontmatter({ name: 'champ', description: `Champ d'observation de l'arbre ${cle} en ajout seul, actions, retours du développeur, observations des ordres 1 à 3 et écarts, avec ses déclencheurs, la propagation des menaces, l'escalade, les désaccords et les observateurs d'ordre 2 et 3.` }),
      `# Champ d'observation de l'arbre ${cle}`,
      '',
      `Chaque niveau de l'arbre dépose ce qu'il fait et ce qu'il observe dans un champ partagé, \`${d}/champ.jsonl\` ; tous le lisent, personne ne le réécrit. Le ticket n'est jamais réécrit par ceux qui l'observent : c'est l'état du champ qui évolue. Un enregistrement par ligne, au schéma fermé \`skill-ticket.observation/1\`, chaque ligne chaînée à l'empreinte de la précédente, \`champ.tete\` gardant la dernière : une ligne réécrite, insérée ou supprimée se voit. Le script \`outils/champ.mjs\` dépose, vérifie et lit ; personne n'écrit le champ à la main.`,
      '',
      '## 1. Enregistrements',
      '',
      tableau(['Type', 'Ce qu\'il porte', 'Qui le dépose'], [
        ['`action`', 'une proposition au développeur, avec ses options, ou une réalisation qu\'il peut corriger (scénario présenté, commit, modification annoncée), sur une ancre', 'l\'agent ou le skill qui agit'],
        ['`retour`', 'un choix du développeur parmi les options d\'une proposition, ou sa décision sur une proposition d\'ordre 2, retenue ou refusée ; une correction, qui vise une action et porte un motif ; une ratification', 'le skill du nœud, qui parle au développeur'],
        ['`observation`', 'à l\'ordre 1, un verdict, conforme ou écart, sur une ancre ; aux ordres 2 et 3, un verdict sur des enregistrements observés ; toujours avec sa preuve, et son coût s\'il est connu', 'les agents et les skills à l\'ordre 1 ; les observateurs de l\'arbre aux ordres 2 et 3'],
        ['`ecart`', 'un écart à un invariant, ou un désaccord entre nœuds, inscrit aussi au registre des écarts du projet', 'le skill qui le constate ; `champ.mjs` lui-même pour un désaccord'],
      ]),
      '',
      'Le script pose les champs communs : numéro, date en UTC, empreinte du précédent. Ancres : `noeud`, `critere` (`<référence>:<critère>`), `ca` (critère d\'acceptation de la clé), `scenario`, `fichier`, `commit`, `contrat` (élément d\'un contrat partagé entre nœuds), `option`. Preuves : `test`, `commande`, `commit`, `fichier`, `enregistrements`, `rapport`, avec un extrait facultatif (`--extrait`). Un motif de correction s\'écrit en minuscules et tirets ; deux corrections de même nature portent le même motif, sinon la répétition ne se voit pas.',
      '',
      'Un rouge du cycle TDD n\'est pas un écart : le critère reste à prouver. Un écart est un résultat contraire à ce qu\'un critère, une preuve passée ou un contrat attendaient : une régression, une gate en échec, un constat bloquant de revue, un verdict d\'Agent2Test.',
      '',
      '## 2. Commandes',
      '',
      'Depuis la racine du projet :',
      '',
      '```bash',
      c('etat'),
      c('verifier'),
      `${c('deposer')} action --noeud ${exemple} --auteur ${agent} --nature realisation --ancre scenario:${cle}-S01 --resume "<ce qui est fait>"`,
      `${c('deposer')} retour --noeud ${exemple} --auteur ${nomSkill(exemple)} --nature correction --vise <n de l'action> --motif <motif> --par "<nom>" --contenu "<la correction demandée>"`,
      `${c('deposer')} observation --noeud ${exemple} --auteur ${agent} --ordre 1 --verdict ecart --ancre critere:${critere} --ecart "<l'écart>" --preuve test:<fichier de test>`,
      `${c('deposer')} ecart --noeud ${exemple} --auteur ${nomSkill(exemple)} --ancre critere:${critere} --invariant "<invariant concerné>" --constat "<l'écart constaté>"`,
      '```',
      '',
      'Un dépôt refusé n\'écrit rien et dit pourquoi ; un champ altéré refuse tout dépôt, et `verifier` dit où. `deposer` annonce les observations que son enregistrement fait attendre. Le registre des écarts est `docs/c7e/registre-ecarts.md` ; si le fichier d\'invariants du projet en fixe un autre emplacement, chaque commande prend `--registre <chemin>`.',
      '',
      '## 3. Ratifications',
      '',
      `La ratification se dépose comme un retour de nature ratification, par le skill du nœud, avec le nom et la réponse du développeur : objet \`arbre ${cle}\` sur la racine, la référence de la feuille sur une feuille ; décision \`ratifié\`, ou \`non ratifié\` avec sa raison. La dernière décision sur un objet fait foi ; \`etat\` la montre, et l'installateur la lit.`,
      '',
      '```bash',
      this.depotRatification(n),
      ...(feuille.estRacine ? [] : [this.depotRatification(feuille)]),
      '```',
      '',
      '## 4. Ordres d\'observation',
      '',
      tableau(['Ordre', 'Qui', 'Observe', 'Produit'], [
        ['1', 'les agents de couche et les skills, d\'après leurs preuves et les rapports des sous-agents de rôle', 'le logiciel et le résultat des actions', 'un verdict conforme ou écart sur une ancre ; la correction d\'un écart est un commit de rétroaction qui cite l\'observation (D6.INV-1)'],
        ['2', `\`${o2}\``, 'les observations d\'ordre 1 et les retours du développeur', 'une adaptation de la manière de travailler, jamais une action sur le code ; retenue par le développeur, elle devient une entrée `proposed` du registre des concepts du projet, `docs/c7e/concepts.json`, qui cite l\'observation (D6.INV-1, D6.INV-2)'],
        ['3', `\`${o3}\``, 'l\'ordre 2', 'l\'examen d\'une proposition, fondée ou infondée ; la mise en veille d\'un motif ; le bilan de clôture : quelles propositions ont changé une décision'],
        ['humain', 'le développeur', 'tout', 'il ratifie, choisit, corrige, retient ou refuse une proposition, décide des écarts ; lui seul promeut une entrée du registre des concepts (D6.INV-2)'],
      ]),
      '',
      'Les observateurs d\'ordre 2 et 3 travaillent chacun dans leur propre contexte ; ils agissent sur la manière d\'observer du niveau qu\'ils observent, jamais sur son objet. La boucle de second ordre et le registre des concepts sont ceux de l\'orchestrateur (module `methode`, § 6 et § 7.2).',
      '',
      '## 5. Déclencheurs',
      '',
      'Le script décide quand, les observateurs formulent quoi. `etat` liste les observations attendues ; `deposer` les annonce dès qu\'elles naissent.',
      '',
      tableau(['Déclencheur', 'Attente', 'Suite'], [
        ['deux corrections au même motif, dans tout l\'arbre, qu\'aucune observation d\'ordre 2 ne couvre encore', 'ordre 2 sur ce motif', `invoquer \`${o2}\` par l'outil \`invoke_agent\` ; il dépose sa proposition, ou un verdict conforme si aucune manière de travailler n'est en cause`],
        ['une proposition d\'ordre 2 ni examinée ni décidée', 'ordre 3 sur cette proposition', `invoquer \`${o3}\`, qui la juge fondée ou infondée`],
        ['une proposition examinée, sans décision', 'décision du développeur', 'la lui présenter avec l\'examen, puis déposer son choix, retenue ou refusée ; retenue, le skill du nœud l\'inscrit au registre des concepts comme entrée `proposed` qui cite l\'observation, commitée à part (orchestrateur, § 6)'],
        ['deux propositions refusées sur un motif, sans proposition retenue depuis', 'mise en veille du motif', `invoquer \`${o3}\`, qui met le motif en veille : l'ordre 2 ne s'y éveille plus`],
      ]),
      '',
      'Récursion bornée : l\'ordre 3 ne s\'éveille que sur ces attentes et pour le bilan de clôture de la racine.',
      '',
      '## 6. Propagation et escalade',
      '',
      `Chaque critère de l'arbre prend un état : en écart, si le dernier verdict d'ordre 1 d'un nœud sur ce critère est un écart ; menacé, si un critère qui le soutient est en écart ou menacé, de proche en proche jusqu'au critère d'acceptation de la clé ; prouvé, si un verdict conforme le prouve, ou si tous les critères qui le soutiennent sont prouvés ; à prouver, sinon. Les critères d'acceptation de la clé sont ceux de la racine (\`${FICHIER_RATTACHEMENT}\`).`,
      '',
      'Un écart se traite au niveau le plus bas qui le peut : la feuille dont le critère est en écart le corrige à l\'ordre 1, par un commit de rétroaction qui cite l\'observation, puis dépose un verdict conforme ; un nœud composé dont un critère est menacé le voit à son lancement et coordonne ; une répétition de corrections passe à l\'ordre 2, puis à l\'ordre 3 ; un écart à un invariant et un désaccord vont au développeur, par le registre des écarts (D6.INV-3). Un critère encore en écart ou menacé à la remise d\'un nœud se présente au développeur avec ses preuves.',
      '',
      '## 7. Désaccords entre nœuds',
      '',
      'Deux nœuds dont les derniers verdicts d\'ordre 1 sur une même ancre sont contraires, l\'un conforme, l\'autre écart, sont en désaccord. Le script l\'inscrit d\'office : un enregistrement `ecart` qui cite les deux observations, et une ligne au registre des écarts du projet, décision laissée au développeur. Une nouvelle observation qui départage les nœuds lève le désaccord dans l\'état du champ ; la ligne du registre reste, avec la décision du développeur.',
      '',
      '## 8. Ce qui ne se fait pas',
      '',
      '- Écrire, réécrire ou supprimer une ligne du champ à la main.',
      '- Commiter le champ avant la campagne d\'Agent2Test : comme les kits, il reste hors des commits de l\'arbre, pour que le commit remis reste la tête de la branche.',
      '- Promouvoir, modifier ou retirer une entrée du registre des concepts, ou décider d\'un écart : seul le développeur le fait (D6.INV-2, D6.INV-3).',
      '- Agir sur le code depuis l\'ordre 2 ou 3 : une adaptation de la méthode n\'est pas une correction du logiciel.',
    ])];
  }

  /**
   * Vue augmentée de l'arbre (skill racine, lot 6) : les ancres du ticket, jamais réécrit, avec les calques
   * de ce que le champ en dit et un état qui résume leur pile ; ses commandes et ses lecteurs.
   */
  vue(n) {
    if (!n.estRacine) return [];
    const cle = this.cle(n);
    const d = `docs/demandes/${cle}`;
    const feuille = n.feuilles()[0];
    const exemple = feuille.estRacine ? n.reference : feuille.reference;
    return [fichier('modules/vue/SKILL.md', [
      frontmatter({ name: 'vue', description: `Vue augmentée de l'arbre ${cle}, dont les ancres du ticket, jamais réécrit, portent les calques de ce que le champ d'observation en dit (ordre 1, 2, 3 et humain) et un état qui résume leur pile ; vue entière pour le développeur, vue d'un nœud pour sa session.` }),
      `# Vue augmentée de l'arbre ${cle}`,
      '',
      `Chaque niveau voit le ticket augmenté des observations des autres niveaux. Le ticket n'est jamais réécrit par ceux qui l'observent : ses ancres restent celles de ses documents, et les calques posés sur elles changent avec le champ d'observation (module \`champ\`). La vue se tire du champ et des documents de la clé par \`outils/vue.mjs\` ; elle ne s'écrit ni ne se corrige à la main.`,
      '',
      '## 1. Ancres',
      '',
      tableau(['Ancre', 'D\'où elle vient'], [
        ['critère d\'acceptation', `\`${d}/us.md\` (énoncé et statut), rattaché au critère de la racine qui le porte (\`${FICHIER_RATTACHEMENT}\`)`],
        ['critère d\'un nœud', `le rattachement, avec son énoncé et le critère du parent qu'il soutient`],
        ['scénario', `\`${d}/${cle}.feature\`, avec ses étiquettes ; il se range sous les critères d'acceptation qu'il prouve`],
        ['nœud', 'l\'arbre : la racine, les nœuds composés, les feuilles'],
        ['née du champ', 'une ancre que seul le champ connaît : contrat partagé entre nœuds, fichier, commit, option'],
      ]),
      '',
      '## 2. Piles',
      '',
      'La pile d\'une ancre réunit les enregistrements qui l\'atteignent. Une action, une observation d\'ordre 1 et un écart atteignent leur ancre ; une correction atteint celle de l\'action qu\'elle vise, un choix celle de la proposition qu\'il tranche ; une observation d\'ordre 2 ou 3 atteint son ancre, s\'il y en a une, et celles des enregistrements qu\'elle observe ; une ratification atteint son nœud. Un enregistrement figure dans la pile de chaque ancre qu\'il atteint, et seulement là.',
      '',
      '## 3. Calques',
      '',
      tableau(['Calque', 'Ce qu\'il porte'], [
        ['ordre 1', 'les actions, les verdicts et les écarts des agents et des skills'],
        ['ordre 2', 'les propositions de l\'observateur d\'ordre 2 de l\'arbre'],
        ['ordre 3', 'les examens, les veilles et le bilan de l\'observateur d\'ordre 3'],
        ['humain', 'les retours du développeur, dans ses mots : choix, corrections, ratifications'],
      ]),
      '',
      'Chaque enregistrement y garde son numéro, sa date, son nœud, son auteur et sa preuve. Masquer un calque ne change pas l\'état de l\'ancre.',
      '',
      '## 4. États et marques',
      '',
      tableau(['Ancre', 'État, qui résume sa pile'], [
        ['critère', 'celui que lui donne le champ : en écart, menacé, prouvé, à prouver (module `champ`, section 6)'],
        ['contrat, fichier, commit, option', 'en désaccord, en écart, conforme ou non observée, d\'après les derniers verdicts d\'ordre 1 de chaque nœud'],
        ['scénario', 'à réaliser, réalisé, ou à reprendre quand sa dernière action a été corrigée ; en écart ou en désaccord d\'après les verdicts'],
        ['nœud', 'ratifié, non ratifié ou à ratifier ; un nœud composé n\'a pas de ratification propre'],
      ]),
      '',
      'Des marques s\'y ajoutent : un désaccord sur un critère, une observation attendue (ordre 2, ordre 3, décision du développeur, mise en veille), un motif en veille. « À traiter » vient en tête de la vue : désaccords, écarts, menaces, puis observations attendues.',
      '',
      '## 5. Commandes',
      '',
      'Depuis la racine du projet :',
      '',
      '```bash',
      this.commandeVue(n, 'generer'),
      this.commandeVue(n, 'generer', exemple),
      `${this.commandeVue(n, 'generer')} --json`,
      this.commandeVue(n, 'verifier'),
      '```',
      '',
      `\`generer\` écrit \`${d}/vue.html\`, pour le développeur, et \`${d}/vue.md\`. Avec \`--noeud\`, il écrit sur la sortie la vue de ce nœud, sans rien écrire : ses critères avec ceux qui les soutiennent, les scénarios qui les prouvent, son nœud, et les autres ancres où il a déposé, avec ce que les autres niveaux y ont mis ; la vue du nœud racine est la vue entière. \`--json\` donne le modèle de la vue. \`verifier\` dit si les vues écrites sont à jour, périmées ou modifiées. Un champ altéré ne donne pas de vue : \`${this.commandeChamp(n, 'verifier')}\` dit où. Même champ et mêmes documents : même vue, octet pour octet.`,
      '',
      '## 6. Lecteurs',
      '',
      '- Le skill de chaque nœud lit sa vue à chaque lancement, et après chaque correction du développeur.',
      `- Les observateurs d'ordre 2 et 3 lisent la vue entière, \`${this.commandeVue(n, 'generer', cle)}\`.`,
      '- Le skill racine présente la vue entière au développeur à la ratification de l\'arbre et à la clôture, et la cite dans sa remise.',
      '- Le développeur ouvre `vue.html` dans son navigateur quand il veut : calques à afficher ou masquer, filtre par nœud, états écrits en toutes lettres ; la page se lit au clavier et sans JavaScript.',
      '',
      '## 7. Ce qui ne se fait pas',
      '',
      '- Écrire ou corriger la vue à la main : elle se régénère, et `verifier` signale une vue modifiée ou périmée.',
      '- Commiter la vue : comme le champ et les kits, elle reste hors des commits de l\'arbre.',
      '- Réécrire le ticket pour qu\'il dise ce que la vue montre : les documents de la clé ne changent que par le skill racine, avec le développeur.',
    ])];
  }

  /** Sections de la méthode de l'orchestrateur, mot pour mot. */
  methode(n) {
    const o = this.S.orchestrateur;
    const sections = sectionsMethode(n);
    return fichier('modules/methode/SKILL.md', [
      frontmatter({ name: 'methode', description: `Sections de la méthode de l'orchestrateur C7E ${o.version} dont le skill de ticket ${n.reference} a besoin, recopiées mot pour mot (§ ${sections.join(', § ')}).` }),
      `# Méthode C7E pour ${n.reference}`,
      '',
      `Sections recopiées mot pour mot de l'orchestrateur C7E ${o.version} : § ${sections.join(', § ')}. La fiche dont elles parlent est ce skill, avec son analyse et sa remise (module \`invariants\`, correspondances). Un renvoi à un paragraphe absent de ce module est informatif.`,
      '',
      ...sections.flatMap((s) => [extraireSection(o.texte, s), '']),
    ]);
  }

  /** Invariants de l'orchestrateur, mot pour mot, avec les correspondances qui les appliquent au skill. */
  invariants(n) {
    const o = this.S.orchestrateur;
    const experts = n.estFeuille ? this.experts(this.couches(n)) : [];
    const racine = this.racine(n).reference;
    return fichier('modules/invariants/SKILL.md', [
      frontmatter({ name: 'invariants', description: `Invariants dont hérite le skill de ticket ${n.reference}, sans affaiblissement, avec ceux de l'orchestrateur C7E ${o.version} recopiés mot pour mot et leurs correspondances dans un skill de ticket.` }),
      `# Invariants hérités par ${n.reference}`,
      '',
      'Ce skill hérite, sans affaiblissement :',
      '',
      `- du socle back-front ${this.S.socle.version}, inclus en entier dans \`socle/SKILL.md\` ;`,
      '- des invariants du projet : sa copie du fichier d\'invariants, comparée au démarrage à `projet/meso-contrats.md` ;',
      ...experts.map((e) => `- du référentiel \`${e.path}\` (${e.from.split('/')[1]} ${e.version}), pour ses sections « Versions cibles » et « Invariants », sans adopter son mode de travail ;`),
      ...(n.estRacine
        ? [`- des skills dont les sous-agents de rôle appliquent la méthode, recopiés dans \`references/\` et \`outils/\` à leur version épinglée (${Object.entries(this.S.boite.versions).map(([s, v]) => `${s} ${v}`).join(', ')}) : leurs invariants s'appliquent au travail fait avec eux, cités avec le nom de leur skill (\`agent-tdd-jira:D10.INV-1\`) ;`]
        : []),
      `- des invariants de l'orchestrateur C7E ${o.version}, ci-dessous, mot pour mot.`,
      '',
      'Un invariant ne s\'affaiblit jamais. Une contradiction entre deux niveaux suit la précédence du module `methode` (§ 11.5) ; un écart s\'inscrit au registre des écarts, avec sa décision (D6.INV-3).',
      '',
      '## Correspondances',
      '',
      'Les invariants de l\'orchestrateur parlent de sa fiche de transformation. Dans un skill de ticket, ils s\'appliquent ainsi :',
      '',
      tableau(['Dans l\'orchestrateur', 'Dans ce skill de ticket'], [
        ['la fiche de transformation, première partie, présentée avant toute modification', `ce skill, avec la copie de travail de \`ticket.toml\` et \`analyse.md\` que produit son analyse, dans \`${this.dossier(n)}\``],
        ['la validation de la fiche (D3.INV-1)', 'la ratification de ce skill et de son analyse (section 6 de `SKILL.md`)'],
        ['la fiche complète à la remise (D3.INV-3)', `\`${this.dossier(n)}remise.md\` ; le skill reste identique à sa transmission`],
        ['`docs/demandes/<CLÉ>/`', `\`${this.dossier(n)}\``],
        ['la clé du ticket, qui nomme sa branche et ses commits (D4.INV-1, D4.INV-2)', `la clé Jira du ticket racine, ${racine} : une seule branche pour tout l'arbre${n.estRacine ? '' : `, et le corps de chaque commit cite le sous-ticket ${n.reference}`}`],
        ['le choix du développeur qui active le skill (D2.INV-3)', `le lancement de ce skill par le développeur, dans sa propre session : la commande \`${commandeSkill(n.reference)}\`, ou \`installer-arbre.mjs lancer ${n.reference}\``],
        ['le registre des écarts et le registre des concepts (D6.INV-1 à D6.INV-3)', `\`docs/c7e/registre-ecarts.md\` et \`docs/c7e/concepts.json\` du projet, alimentés depuis le champ d'observation de l'arbre (module \`champ\` du skill racine) ; l'IA y ajoute, le développeur décide et promeut`],
        ['la qualification et la confirmation de la composition (D10.INV-1, D11)', 'faites avant la génération de ce skill ; si l\'analyse montre que la demande sort des empreintes, ce skill remonte au parent, sans changer de composition (D11.INV-4)'],
        ['un paragraphe de l\'orchestrateur (§ n)', 'le texte recopié dans le module `methode` s\'il y figure ; sinon un renvoi informatif'],
      ]),
      '',
      `## Invariants de l'orchestrateur C7E ${o.version}`,
      '',
      ...o.invariants,
    ]);
  }

  /**
   * Héritages recopiés : socle, référentiels de la pile pour une feuille, invariants du projet et, pour la
   * racine, la boîte à outils de l'arbre (références des sous-agents de rôle et scripts de contrôle).
   */
  copies(n) {
    const S = this.S;
    return [S.socle, ...(n.estFeuille ? this.experts(this.couches(n)) : []), S.projet, ...(n.estRacine ? S.boite.fichiers : [])]
      .map((s) => ({ source: s, fichier: fichier(s.path, s.contenu) }));
  }

  /** Provenance de chaque héritage, pour le contrôle de l'héritage. */
  provenance(n, copies) {
    const o = this.S.orchestrateur;
    return [
      { path: 'modules/invariants/SKILL.md', from: o.from, version: o.version, invariants: o.invariants.length },
      { path: 'modules/methode/SKILL.md', from: o.from, version: o.version, sections: sectionsMethode(n) },
      ...copies.map(({ source, fichier: f }) => ({
        path: f.rel,
        from: source.from,
        ...(source.version ? { version: source.version } : {}),
        ...(source.sections ? { sections: source.sections } : {}),
        ...(source.bloc ? { bloc: source.bloc } : {}),
        sha256: sha256(f.contenu),
      })),
    ];
  }

  /** Nom de l'agent d'une couche d'une feuille. */
  nomAgent(n, couche) {
    return `${nomSkill(n.reference)}-${this.agentDeCouche(couche).suffixe}`;
  }

  /**
   * Agents du skill : un par couche touchée par une feuille ; et, sur la racine, les sous-agents de rôle de
   * l'arbre. Un nœud composé qui n'est pas la racine coordonne sans agent. L'installateur copie chaque
   * agent dans `.gemini/agents/` : son contexte est séparé de celui de la session, d'où les chemins
   * complets vers les fichiers des skills installés.
   */
  agents(n) {
    return [...this.agentsDeCouche(n), ...this.agentsDeRole(n)];
  }

  agentsDeCouche(n) {
    if (!n.estFeuille) return [];
    const nom = nomSkill(n.reference);
    const ici = `.gemini/skills/${nom}/`;
    const cle = this.cle(n);
    const boite = `.gemini/skills/${nomSkill(cle)}/references/agent-tdd-jira/cycle-tdd.md`;
    const cas = [...new Set(n.criteres.flatMap((c) => this.caDe(n, c)))].sort();
    return this.couches(n).map((couche) => {
      const a = this.agentDeCouche(couche);
      const groupes = this.optionsGroupees(n).filter((g) => g.couche === couche);
      const references = this.experts([couche]).map((e) => `\`${ici}${e.path}\``);
      const etiquette = ETIQUETTES_COUCHES[couche];
      const images = this.imagesObjectif(n);
      return fichier(`agents/${nom}-${a.suffixe}.md`, [
        frontmatter({
          name: `${nom}-${a.suffixe}`,
          description: `Agent ${a.titre} du skill de ticket ${n.reference} (${a.technologies}), qui réalise les options ${couche} du ticket en cycle TDD, scénario par scénario, après la ratification du skill, sous les invariants hérités.`,
          kind: 'local',
          tools: a.outils,
        }),
        `# Agent ${a.titre} de ${n.reference}`,
        '',
        `Tu réalises, pour le ticket ${n.reference}, la couche ${couche} : ${a.technologies}. Ton contexte est le tien : le skill \`${nom}\`, installé dans \`${ici}\`, te confie ce périmètre, et tu lui rends ton rapport. Commence par lire \`${ici}SKILL.md\` et \`${ici}ticket.toml\`.`,
        '',
        '## Périmètre',
        '',
        ...groupes.map((g) => `- option \`${couche}.${g.option}\`, slots ${g.slots.slots}, étiquettes ${g.slots.etiquettes} : \`${ici}modules/option-${couche}-${g.option}/SKILL.md\``),
        '',
        '## Scénarios, en cycle TDD',
        '',
        `Tu réalises un à un les scénarios de \`docs/demandes/${cle}/${cle}.feature\` qui portent l'un des critères d'acceptation de ce ticket (${cas.map((x) => `\`@${x}\``).join(', ')}) et l'étiquette \`${etiquette}\`, hors \`@en-attente\` et \`@propose\`, en cycle rouge, vert, remanié, selon \`${boite}\` :`,
        '',
        `- le test s'écrit d'abord, étiqueté avec son scénario (${couche === 'frontend' ? `\`describe('${cle}-Snn : …')\`` : `\`@Tag("${cle}-Snn")\``}), et échoue pour la raison attendue avant tout code de production (agent-tdd-jira:D5.INV-1) ;`,
        '- le code minimal le fait passer, la suite du module reste verte, puis le remaniement applique les invariants du référentiel, sans changer le comportement (agent-tdd-jira:D5.INV-2, agent-tdd-jira:D5.INV-3) ;',
        `- chaque scénario se présente au skill du ticket, qui le fait accepter au développeur (V4), avant le suivant ; puis il se commite, un slot par commit : \`${cle} Snn : [É<n>-<DOMAINE>] <type>(<portée>): <description>\`${n.estRacine ? '' : `, le corps citant \`Sous-ticket : ${n.reference}\``}${couche === 'frontend' ? ' ;' : '.'}`,
        ...(couche === 'frontend'
          ? [`- pour chaque scénario réalisé, une capture de l'écran livré, \`${this.dossier(n)}captures/${cle}-Snn.png\`, prise avec l'outil de bout en bout du projet s'il en a un, sinon demandée au développeur ; elle se compare à l'image de l'objectif ${images.length > 0 ? `(${liste(images.map((i) => `\`${i}\``))}, analysée dans \`${this.dossier(n)}analyse-image.md\`)` : 'quand le ticket en désigne une'}, et les écarts vont dans ton rapport.`]
          : []),
        '',
        '## Règles',
        '',
        `- Aucune modification avant la ratification du skill par le développeur, déposée dans le champ de l'arbre : \`${this.commandeChamp(n, 'etat')}\` montre « ${n.reference} : ratifié » (D3.INV-1, la fiche étant ce skill).`,
        `- Les invariants hérités s'appliquent : \`${ici}modules/invariants/SKILL.md\`, \`${ici}socle/SKILL.md\`, la copie du projet du fichier d'invariants${references.length > 0 ? ` et ${liste(references)}` : ''}.`,
        `- Un slot par commit ; chaque commit commence par \`${cle} : \`, ou \`${cle} Snn : \` pour un scénario, suivi de l'étiquette de son slot (D4.INV-2)${n.estRacine ? '' : `, et son corps cite \`Sous-ticket : ${n.reference}\``} ; tu ne pousses, ne fusionnes, ne rebases ni ne poses de tag (D4.INV-3).`,
        '- Tu ne sors pas de ta couche : un besoin hors de ton périmètre remonte au skill du ticket.',
        '',
        '## Rapport',
        '',
        '- Pour chaque scénario : son critère d\'acceptation, le rouge avec son message d\'échec, le vert, le remaniement, les suites et leurs résultats, les fichiers, le commit (cycle-tdd, § 6).',
        '- Chaque constat cite sa preuve : test, commande et sortie, ou réponse du développeur.',
        `- Dépose dans le champ, avec leur preuve, tes actions que le développeur peut corriger (scénario présenté, commit, modification annoncée) et tes observations d'ordre 1 : \`${this.commandeChamp(n, 'deposer')} action …\` ou \`observation --ordre 1 …\` (module \`champ\` du skill racine). Un rouge du cycle TDD n'est pas un écart : le critère reste à prouver. Les retours du développeur, le skill du ticket les dépose : ils sont la référence de ton observation.`,
      ]);
    });
  }

  /**
   * Sous-agents de rôle de l'arbre, sur le skill racine : le rédacteur des documents de la clé, l'analyste
   * en lecture seule, le relecteur en mode revue et l'agent qualité. Les skills des nœuds les invoquent
   * par leur nom ; chacun lit ses références dans le skill racine installé.
   */
  agentsDeRole(n) {
    if (!n.estRacine) return [];
    const cle = n.reference;
    const racine = `.gemini/skills/${nomSkill(cle)}/`;
    const ref = (rel) => `\`${racine}${rel}\``;
    const v = this.S.boite.versions;
    const lecture = ['read_file', 'list_directory', 'glob', 'grep_search', 'run_shell_command'];
    const ecriture = ['read_file', 'list_directory', 'glob', 'grep_search', 'write_file', 'replace', 'run_shell_command'];
    const agent = (role, description, outils, lignes) => fichier(`agents/${this.nomRole(n, role)}.md`, [
      frontmatter({ name: this.nomRole(n, role), description, kind: 'local', tools: outils }),
      ...lignes,
    ]);
    const lectureSeule = `- Lecture seule : tu ne crées, ne modifies ni ne supprimes aucun fichier, et tes commandes ne font que lire (\`git log\`, \`git show\`, \`git diff\`, \`git grep\`) ; aucune commande qui construit, installe ou écrit. Tu rends ton rapport au skill qui t'invoque, qui l'écrit lui-même.`;
    return [
      agent('redacteur', `Rédacteur des documents de la clé Jira ${cle}, demande.json, us.md et fichier Gherkin, selon agent-tdd-jira ${v['agent-tdd-jira']}, invoqué par le skill racine avant la ratification de l'arbre.`, ecriture, [
        `# Rédacteur des documents de ${cle}`,
        '',
        `Tu rédiges les documents de la clé Jira ${cle} dans \`${this.dossier(n)}\`, avec la méthode d'agent-tdd-jira ${v['agent-tdd-jira']}. Ton contexte est le tien : le skill racine \`${nomSkill(cle)}\` te confie ce travail et reçoit ton rapport. Commence par lire ${ref('modules/documents/SKILL.md')}, qui fixe les trois documents, les critères à reprendre et leur rattachement.`,
        '',
        '## Références',
        '',
        `- ${ref('references/agent-tdd-jira.md')} : méthode, points de validation et invariants d'agent-tdd-jira ;`,
        `- ${ref('references/agent-tdd-jira/ingestion-jira.md')} (§ 2 à § 6) et ${ref('outils/extraire-jira.mjs')}, pour \`demande.json\` ;`,
        `- ${ref('references/agent-tdd-jira/us-criteres.md')} (§ 1 à § 6), pour \`us.md\` ;`,
        `- ${ref('references/agent-tdd-jira/analyse-demande.md')} (§ 2 à § 6) et ${ref('references/agent-tdd-jira/binome-agent2test.md')} (§ 3), pour les exigences, les questions et le fichier Gherkin ;`,
        `- les tickets de l'arbre : ${ref('ticket.toml')} et celui de chaque sous-ticket, dans son skill installé (\`.gemini/skills/<skill du sous-ticket>/ticket.toml\`).`,
        '',
        '## Règles',
        '',
        `- Tu n'écris que dans \`${this.dossier(n)}\` : \`demande.json\`, \`us.md\`, \`${cle}.feature\`, et \`images/\` pour les pièces extraites. Tu ne touches ni au code, ni au schéma, ni à la configuration du projet, ni à la capture MHTML (agent-tdd-jira:D1.INV-1).`,
        '- Chaque critère de la racine se reprend mot pour mot sous son identifiant, origine « repris », statut « à valider » ; chaque US et chaque critère absent du ticket est marqué « proposé » (agent-tdd-jira:D10.INV-2).',
        '- Chaque critère d\'acceptation est illustré par au moins un scénario, et chaque critère d\'un sous-ticket par un scénario de son critère d\'acceptation, avec l\'étiquette de sa couche pour une feuille (module `documents`, section 3).',
        '- Un scénario décrit un comportement : ni sélecteur, ni URL technique, ni identifiant de test (binome-agent2test, § 3). Il porte les étiquettes du binôme que la demande justifie, et rien de déduit du code.',
        '- Une contradiction ou une ambiguïté devient une question `Qn` ; le critère concerné passe « en attente de Qn », ses scénarios portent `@en-attente`. Tu ne tranches rien en silence.',
        `- Tu lances les deux contrôles du module \`documents\` (section 5) et corriges jusqu'à n'avoir aucun écart ; un écart qui ne se corrige pas devient une question.`,
        '',
        '## Rapport',
        '',
        '- Les documents écrits, avec la sortie des deux contrôles, mot pour mot.',
        '- Le résumé V2 (us-criteres, § 6) et, si une capture MHTML a été extraite, le résumé de l\'extraction (ingestion-jira, § 6).',
        '- Les questions, chacune avec les critères qu\'elle concerne.',
      ]),
      agent('analyste', `Analyste en lecture seule de l'arbre ${cle}, qui cartographie la partie du projet que touche un sous-ticket, selon analyse-projet ${v['analyse-projet']}, et rend sa cartographie au skill de la feuille.`, lecture, [
        `# Analyste de l'arbre ${cle}`,
        '',
        `Tu cartographies, pour une feuille de l'arbre ${cle}, la partie du projet qu'elle touche, avec la méthode d'analyse-projet ${v['analyse-projet']}, en lecture seule. Ton contexte est le tien : le skill de la feuille qui t'invoque te donne sa référence et ses couches, et reçoit ta cartographie, qu'il écrit dans son \`analyse.md\`.`,
        '',
        '## Références',
        '',
        `- ${ref('references/analyse-projet.md')} : règles globales et invariants d'analyse-projet ;`,
        `- ${ref('references/analyse-projet/cartographie.md')} : sections de la cartographie, versions, back, front, données, matrice de frontière ;`,
        '- le skill de la feuille : son `ticket.toml`, ses modules d\'options et sa recette, dans `.gemini/skills/<skill de la feuille>/`.',
        '',
        '## Règles',
        '',
        lectureSeule,
        '- Si skill4appli est installé dans le projet, ses requêtes sur l\'index du code et des branches, qui ne font que lire, servent à trouver symboles, dépendances et consommateurs ; sinon la recherche dans les fichiers.',
        '- Le disque fait foi : chaque constat cite son fichier et sa ligne, ou sa commande et sa sortie ; ce qui n\'est pas observé reste une question.',
        '- Périmètre : les couches de la feuille et leurs frontières ; une demande qui sort des empreintes de sa composition se signale, sans proposer d\'autre composition (D11.INV-4).',
        '',
        '## Rapport',
        '',
        '- La cartographie, limitée à la feuille, dans l\'ordre des sections du module `cartographie` : contexte, versions, back, front, données, matrice de frontière.',
        '- L\'impact : dépendances explicites et détectées, autres consommateurs, risques, chacun avec sa preuve.',
        '- Les questions.',
      ]),
      agent('relecteur', `Relecteur de l'arbre ${cle}, qui relit les commits d'une feuille en mode revue du référentiel de leur couche, java ${v.java} ou angular ${v.angular}, et rend son rapport au skill de la feuille.`, lecture, [
        `# Relecteur de l'arbre ${cle}`,
        '',
        `Tu relis, pour une feuille de l'arbre ${cle}, les commits de sa couche, avec le mode revue du référentiel de cette couche : java ${v.java} pour la persistance et le back, angular ${v.angular} pour le front. Ton contexte est le tien : le skill de la feuille qui t'invoque te donne sa référence, la couche et ses commits (\`git log --grep "Sous-ticket : <référence>"\`), et reçoit ton rapport.`,
        '',
        '## Références',
        '',
        `- ${ref('references/java/revue.md')} et ${ref('references/angular/revue.md')} : déroulé, gravités, grille et format du rapport ;`,
        '- le référentiel de la couche dans le skill de la feuille, `references/java.md` ou `references/angular.md`, pour ses versions cibles et ses invariants ;',
        '- les modules d\'options et la recette de la feuille.',
        '',
        '## Règles',
        '',
        lectureSeule,
        '- Chaque constat cite son fichier et sa ligne, sa gravité (revue, § 2) et l\'invariant qu\'il touche, avec le nom de son skill (`java:D3.INV-3`, `angular:D2.INV-1`).',
        '- Tu ne corriges rien : la correction d\'un constat (revue, § 5) revient à l\'agent de la couche, après la décision du développeur, dans un commit de rétroaction qui cite la revue (D6.INV-1). Un constat bloquant arrête la remise de la feuille jusqu\'à sa correction.',
        '',
        '## Rapport',
        '',
        '- Au format du module revue (§ 4) : synthèse, constats, questions, points conformes notables.',
      ]),
      agent('qualite', `Agent qualité de l'arbre ${cle}, qui examine le diff d'une feuille avec la branche cible selon le module examen-local de sonarqube ${v.sonarqube}, sans écriture vers SonarQube sans validation explicite.`, lecture, [
        `# Agent qualité de l'arbre ${cle}`,
        '',
        `Tu examines la qualité des modifications d'une feuille de l'arbre ${cle}, avec le module examen-local de sonarqube ${v.sonarqube} : le périmètre est le diff entre \`HEAD\` et la base de fusion avec la branche cible (sonarqube:D9.INV-3), les règles sont celles du profil qualité du projet. Ton contexte est le tien : le skill de la feuille qui t'invoque te donne sa référence et la branche cible, et reçoit ton rapport.`,
        '',
        '## Références',
        '',
        `- ${ref('references/sonarqube.md')} : règles globales, jeton et invariants de sonarqube ;`,
        `- ${ref('references/sonarqube/examen-local.md')} : trois moteurs, cadrage, périmètre, restitution.`,
        '',
        '## Règles de jeton et de validation, inchangées',
        '',
        '- Tu ne demandes jamais au développeur de coller un jeton dans la conversation ; s\'il en colle un, tu le signales et recommandes sa révocation.',
        '- Le jeton ne se lit que dans la variable d\'environnement `SONAR_TOKEN` : jamais affiché, journalisé, versionné, ni placé dans une URL ou un argument de commande (sonarqube:D1.INV-2).',
        '- Aucune écriture vers SonarQube, analyse éphémère comprise, sans la validation explicite du lot d\'écritures proposé avec ses appels exacts (sonarqube:D1.INV-3, examen-local, § 5.2) ; l\'analyse éphémère se fait sous une branche `local-`, supprimée dans le même lot (sonarqube:D9.INV-2). Sans validation, tu te limites aux moteurs SonarLint et relecture par les règles.',
        '- Tu ne modifies aucun fichier du projet, ne pousses rien, ne commentes aucune issue et ne changes aucun statut (sonarqube:D9.INV-6).',
        '',
        '## Rapport',
        '',
        '- La restitution du module examen-local (§ 8) : chaque constat avec son moteur, son fichier, sa ligne et sa règle ; un constat de relecture n\'est jamais compté comme une issue SonarQube (sonarqube:D9.INV-1).',
      ]),
    ];
  }

  /**
   * Observateurs d'ordre 2 et 3 de l'arbre, sur le skill racine (lot 5) : chacun dans son propre contexte,
   * en lecture seule hors du champ, où il dépose ses observations par `champ.mjs`. L'ordre 1 est celui des
   * agents et des skills des nœuds.
   */
  observateurs(n) {
    if (!n.estRacine) return [];
    const cle = n.reference;
    const racine = `.gemini/skills/${nomSkill(cle)}/`;
    const outils = ['read_file', 'list_directory', 'glob', 'grep_search', 'run_shell_command'];
    const vue = this.commandeVue(n, 'generer', cle);
    const deposer = this.commandeChamp(n, 'deposer');
    const communs = [
      `- Tu ne crées, ne modifies ni ne supprimes aucun fichier ; ta seule écriture est le dépôt de tes observations par \`${racine}outils/champ.mjs\`. Tes autres commandes ne font que lire : la vue se lit avec \`--noeud\`, qui n'écrit rien.`,
      '- Types logiques : tu agis sur la manière d\'observer et de concevoir du niveau que tu observes, jamais sur son objet, ni le code ni le ticket.',
      '- Chaque observation cite les enregistrements qui la fondent ; ce qui n\'est ni dans le champ ni prouvé reste une question.',
      '- Ne pas apprendre à plaire : les retours du développeur orientent, ils ne lèvent aucun invariant ni aucune preuve (D6.INV-3).',
    ];
    const agent = (ordre, description, lignes) => fichier(`agents/${this.nomRole(n, `observateur-${ordre}`)}.md`, [
      frontmatter({ name: this.nomRole(n, `observateur-${ordre}`), description, kind: 'local', tools: outils }),
      ...lignes,
    ]);
    return [
      agent(2, `Observateur d'ordre 2 de l'arbre ${cle}, qui observe les observations d'ordre 1 et les corrections du développeur sur un motif répété, et propose une adaptation de la manière de travailler, jamais une action sur le code.`, [
        `# Observateur d'ordre 2 de l'arbre ${cle}`,
        '',
        `Tu observes la manière dont l'arbre ${cle} travaille, pas le logiciel : les actions des agents, les corrections que le développeur leur apporte et les observations d'ordre 1, déposées dans le champ \`docs/demandes/${cle}/champ.jsonl\`. Le skill d'un nœud t'invoque quand le champ attend une observation d'ordre 2 sur un motif : au moins deux corrections du développeur à ce motif. Ton contexte est le tien ; tu rends ton rapport au skill qui t'invoque.`,
        '',
        '## Références',
        '',
        `- \`${racine}modules/champ/SKILL.md\` : enregistrements, ordres, déclencheurs ;`,
        `- \`${racine}modules/vue/SKILL.md\` : ancres, piles, calques et états de la vue augmentée ;`,
        `- \`${racine}modules/methode/SKILL.md\`, § 6 et § 7.2 : boucle de second ordre et registre des concepts de l'orchestrateur.`,
        '',
        '## Méthode',
        '',
        `1. Lis la vue entière de l'arbre, \`${vue}\` : l'attente d'ordre 2 dans « À traiter », son motif et ses corrections, et, sur les ancres qu'elles atteignent, les calques de chaque niveau.`,
        '2. Relis chaque correction, l\'action qu\'elle vise et les observations d\'ordre 1 du même nœud. Cherche ce que la manière de travailler n\'a pas vu : concept absent, paramètre mal réglé, risque non déduit, convention du projet ignorée (orchestrateur, § 6, étape 3).',
        '3. Formule une adaptation de la manière de travailler : ce que les agents vérifieront ou proposeront autrement, et à quel moment. Si les corrections ne montrent aucune cause commune de méthode, ton verdict est conforme.',
        `4. Dépose ton observation : \`${deposer} observation --noeud <nœud de l'attente> --auteur ${this.nomRole(n, 'observateur-2')} --ordre 2 --verdict proposition --motif <motif> --observe <n des corrections et des actions> --preuve enregistrements:<mêmes n> --proposition "<adaptation>"\`, ou \`--verdict conforme\` sans proposition.`,
        '',
        '## Règles',
        '',
        ...communs,
        '- Ta proposition ne devient une entrée `proposed` du registre des concepts que si le développeur la retient ; seul le développeur la promeut ensuite (D6.INV-1, D6.INV-2).',
        '',
        '## Rapport',
        '',
        '- Le numéro de ton observation, la proposition et les enregistrements qui la fondent.',
      ]),
      agent(3, `Observateur d'ordre 3 de l'arbre ${cle}, qui examine les propositions de l'ordre 2, met un motif en veille après deux propositions refusées et fait le bilan de clôture, sans rien proposer lui-même.`, [
        `# Observateur d'ordre 3 de l'arbre ${cle}`,
        '',
        `Tu observes l'observateur d'ordre 2 de l'arbre ${cle}. Tu ne t'éveilles que dans trois cas : une proposition d'ordre 2 à examiner, une mise en veille attendue sur un motif, le bilan de clôture de la racine. Ton contexte est le tien ; tu rends ton rapport au skill qui t'invoque.`,
        '',
        '## Références',
        '',
        `- \`${racine}modules/champ/SKILL.md\` : ordres, déclencheurs, récursion bornée ;`,
        `- \`${racine}modules/vue/SKILL.md\` : la vue augmentée de l'arbre ;`,
        `- \`${racine}modules/methode/SKILL.md\`, § 6 et § 7.2.`,
        '',
        '## Méthode',
        '',
        `Lis d'abord la vue entière de l'arbre, \`${vue}\` : ce qui t'est attendu dans « À traiter », et la proposition posée, au calque de l'ordre 2, sur les ancres qu'elle observe.`,
        '',
        `- **Examen** : la proposition cite-t-elle ses preuves, des corrections qui portent bien son motif et les actions qu'elles visent ? Changerait-elle une décision, une consigne ou une proposition des agents ? Dépose \`${deposer} observation --noeud <nœud> --auteur ${this.nomRole(n, 'observateur-3')} --ordre 3 --verdict fondee --observe <n de la proposition> --preuve enregistrements:<n>\`, ou \`--verdict infondee\` avec la raison dans \`--commentaire\`.`,
        `- **Veille** : quand la vue attend une mise en veille, dépose par la même commande \`--verdict veille --motif <motif> --observe <n des propositions refusées> --preuve enregistrements:<mêmes n>\` : l'ordre 2 ne s'éveille plus sur ce motif.`,
        '- **Bilan de clôture** : relis les propositions d\'ordre 2 de l\'arbre et les décisions du développeur ; dépose par la même commande `--verdict bilan --observe <n de toutes les observations d\'ordre 2> --preuve enregistrements:<mêmes n> --commentaire "<lesquelles ont changé une décision>"`.',
        '',
        '## Règles',
        '',
        ...communs,
        '- Récursion bornée : rien d\'autre ne t\'éveille, et tu ne proposes aucune adaptation toi-même : tu juges l\'ordre 2.',
        '',
        '## Rapport',
        '',
        '- Le numéro de ton observation, ton verdict et sa raison.',
      ]),
    ];
  }

  /**
   * Commande Gemini CLI qui lance ce skill dans une session : l'installateur la copie dans
   * `.gemini/commands/ticket/`, elle devient `/ticket:<nœud>`.
   */
  commandes(n) {
    const quoi = n.estFeuille ? 'démarrage, analyse, ratification, transformation et remise' : n.estRacine ? 'documents de la clé, présentation et ratification de l\'arbre, suivi, puis clôture et kits' : 'suivi des sous-tickets, puis clôture';
    return [fichier(FICHIER_COMMANDE(n.reference), [
      `description = ${JSON.stringify(`Skill de ticket ${n.reference}, ${this.nature(n)} (${quoi}), dans cette session`)}`,
      'prompt = """',
      phraseActivation(nomSkill(n.reference)),
      'Précision du développeur, s\'il y en a une : {{args}}',
      '"""',
    ])];
  }

  // ---- Consigne : patron de méthode ----

  description(n) {
    const m = this.R.mesoContrats.get(n.composition.principal);
    const place = n.estRacine ? (n.estFeuille ? 'ticket sans sous-ticket' : 'racine de son arbre') : `${this.nature(n)} de ${n.parent.reference}`;
    const role = n.estFeuille ? `résoudre ce ${n.estRacine ? 'ticket' : 'sous-ticket'}` : n.estRacine ? 'rédiger les documents de la clé, présenter l\'arbre et le faire ratifier, coordonner ses sous-tickets puis assembler les kits' : 'coordonner ses sous-tickets';
    const deps = n.dependances.length > 0 ? `, après la clôture de ${liste(n.dependances)}` : '';
    return sansDeuxPoints(`Skill de ticket ${n.reference}, ${place} (${decrireComposition(n.composition)}, ${m.nom.toLowerCase()}), produit par le générateur C7E. À activer pour ${role}${deps} ; rien ne se modifie avant sa ratification.`);
  }

  consigne(n, fichiers) {
    const nom = nomSkill(n.reference);
    const o = this.S.orchestrateur;
    return fichier('SKILL.md', [
      frontmatter({ name: nom, description: this.description(n), version: VERSION_SKILL }),
      `# Skill de ticket ${n.reference}`,
      '',
      `> Produit par le générateur C7E (prototype « skill de ticket », lot ${LOT}), fabrique \`${this.nom}\`, référentiel des méso-contrats ${this.R.version}, orchestrateur-c7e ${o.version}. Ce skill remplace la fiche de transformation comme objet ratifié avant toute modification ; il reste identique à sa transmission. Si tu y relèves une ambiguïté ou une contradiction, signale-la au développeur ; ne corrige pas le skill toi-même.`,
      '',
      '## 1. Place dans l\'arbre',
      '',
      ...this.placeDansArbre(n),
      '',
      '## 2. Objectif et critères',
      '',
      `${n.ticket.titre}.`,
      '',
      `Intention : ${String(n.ticket.demande?.intention?.reponse ?? 'non précisée').replace(/\.$/, '')}.`,
      '',
      this.tableauCriteres(n),
      '',
      '## 3. Méso-contrats et options',
      '',
      `Composition confirmée : ${decrireComposition(n.composition)} (module \`meso-contrats\`). Méso-contrats transverses : ${this.transverses(n).map((t) => `${t.id} ${t.nom.toLowerCase()}`).join(', ') || 'aucun'}.`,
      '',
      ...this.optionsDuNoeud(n),
      '',
      '## 4. Au démarrage',
      '',
      ...this.demarrage(n),
      '',
      ...(n.estFeuille ? ['## 5. Analyse (d=0), avant toute modification', '', ...this.analyse(n)] : ['## 5. Coordination', '', ...this.coordination(n)]),
      '',
      '## 6. Ratification',
      '',
      ...this.ratification(n),
      '',
      ...(n.estFeuille ? ['## 7. Transformation, après la ratification', '', ...this.transformation(n)] : ['## 7. Clôture', '', ...this.cloture(n)]),
      '',
      '## 8. Remise',
      '',
      ...this.remise(n),
      '',
      '## 9. Champ d\'observation',
      '',
      `Le champ de l'arbre, \`docs/demandes/${this.cle(n)}/champ.jsonl\`, reçoit en ajout seul ce que fait chaque niveau : les actions que tu proposes ou réalises, les retours du développeur (ses choix parmi tes propositions, ses corrections sur tes actions, ses ratifications) et les observations, chacune avec sa preuve. Dépose chacun par \`${this.commandeChamp(n, 'deposer')} <type> …\`, jamais à la main (module \`champ\` du skill racine). La référence de ton observation est un retour du développeur ou une preuve : une auto-évaluation sans preuve ni retour n'est pas une observation.`,
      '',
      `Après chaque correction du développeur, et à chaque lancement, ta vue augmentée, \`${this.commandeVue(n, 'generer', n.reference)}\`, montre les critères menacés, les désaccords et les observations attendues, sur tes ancres et avec ce que les autres niveaux y ont déposé : invoque l'observateur d'ordre 2 ou d'ordre 3 de l'arbre quand il en attend une, puis présente sa proposition au développeur, qui la retient ou la refuse. Les retours orientent le travail ; ils ne lèvent aucun invariant ni aucune preuve.`,
      '',
      `Le ticket n'est jamais réécrit : ce sont les calques posés sur ses ancres qui changent. Le développeur lit la vue entière de l'arbre dans \`docs/demandes/${this.cle(n)}/vue.html\`, que \`${this.commandeVue(n, 'generer')}\` régénère d'après le champ et les documents de la clé (module \`vue\` du skill racine).`,
      '',
      '## 10. Invariants hérités',
      '',
      `Le module \`invariants\` liste ce dont ce skill hérite, sans affaiblissement : ${[
        'le socle back-front',
        'les invariants du projet',
        ...(n.estFeuille ? ['les référentiels de la pile'] : []),
        ...(n.estRacine ? ['les skills de la boîte à outils, cités avec le nom de leur skill'] : []),
      ].join(', ')} et, mot pour mot, les invariants de l'orchestrateur, avec leurs correspondances dans un skill de ticket. La précédence des règles suit le module \`methode\` (§ 11.5).`,
      '',
      '## 11. Fichiers',
      '',
      tableau(['Fichier', 'Rôle'], fichiers.map((f) => [`\`${f.rel}\``, this.role(f.rel)])),
    ]);
  }

  placeDansArbre(n) {
    const racine = this.racine(n);
    const lignes = [`- Nature : ${this.nature(n)}${n.estFeuille ? ' ; ce skill agit sur le code, par ses agents.' : ' ; ce skill coordonne ses sous-tickets et n\'agit pas sur le code.'}`];
    if (n.estRacine) lignes.push('- Boîte à outils de l\'arbre : ce skill porte les documents de la clé (module `documents`), les kits (module `kits`), le champ d\'observation et ses observateurs d\'ordre 2 et 3 (module `champ`), la vue augmentée de l\'arbre (module `vue`), les sous-agents de rôle, rédacteur, analyste, relecteur et qualité, que les skills des nœuds invoquent, et leurs références, copiées des skills du dépôt à leur version épinglée (`references/`, `outils/`).');
    if (!n.estRacine) {
      const parent = `${n.parent.reference} (skill \`${nomSkill(n.parent.reference)}\`)`;
      lignes.push(n.parent === racine ? `- Parent : ${parent}, le ticket racine ; profondeur ${n.profondeur}.` : `- Parent : ${parent} ; ticket racine : ${racine.reference} ; profondeur ${n.profondeur}.`);
    }
    if (!n.estFeuille) lignes.push(`- Sous-tickets : ${n.enfants.map((e) => `${e.reference} (skill \`${nomSkill(e.reference)}\`)`).join(', ')} ; module \`sous-tickets\`.`);
    if (n.dependances.length > 0) lignes.push(`- Dépend de : ${n.dependances.map((d) => `${d} (skill \`${nomSkill(d)}\`)`).join(', ')} ; rien ne commence avant ${accord(n.dependances.length, 'sa', 'leur')} clôture.`);
    lignes.push(`- Clé Jira : ${racine.reference}, qui nomme la branche et les commits de tout l'arbre. Dossier du ticket : \`${this.dossier(n)}\`.`);
    lignes.push(`- Session : ce skill travaille dans sa propre session de Gemini CLI, que le développeur lance par la commande \`${commandeSkill(n.reference)}\` ou par \`installer-arbre.mjs lancer ${n.reference}\`.`);
    return lignes;
  }

  optionsDuNoeud(n) {
    if (!n.estFeuille) return ['Ce nœud ne porte pas d\'option : ses sous-tickets les portent.'];
    return [tableau(['Couche', 'Option', 'Slots', 'Étiquettes', 'Module'], this.optionsGroupees(n).map(({ couche, option, catalogue, slots }) => [
      couche, catalogue.nom, slots.slots, slots.etiquettes, `\`option-${couche}-${option}\``,
    ]))];
  }

  demarrage(n) {
    const racine = this.racine(n);
    const etapes = [
      'Vérifie que ce skill est intact : s\'il a été installé par l\'installateur du dépôt Agent2Prompt, `sha256sum -c integrite.sha256` depuis son dossier.',
      'Lis la copie du projet du fichier d\'invariants (`docs/c7e/meso-contrats.md` par défaut) et compare-la à `projet/meso-contrats.md`, l\'état sur lequel ce skill a été produit. La copie du projet fait foi ; si elles diffèrent, dis-le au développeur avant tout le reste. Une valeur `ADAPTER` restée telle se signale, jamais devinée (D8.INV-1).',
      `Lis ta vue augmentée, \`${this.commandeVue(n, 'generer', n.reference)}\` : ${n.estRacine ? 'la vue entière de l\'arbre' : `les ancres de ce ${n.estFeuille ? 'ticket' : 'nœud et de ses sous-tickets'}`}, critères, scénarios et nœud, avec ce que chaque niveau y a déposé, les ratifications, et ce qui est à traiter : critères menacés ou en écart, désaccords, observations attendues. Traite d'abord ce qui t'est attribué, au niveau le plus bas qui peut le traiter (modules \`vue\` et \`champ\` du skill racine). Un champ altéré ne donne pas de vue : arrête-toi et montre au développeur ce que dit \`${this.commandeChamp(n, 'verifier')}\`.`,
      ...(n.estRacine ? [] : [`Vérifie dans cette vue que l'arbre a été ratifié : « ${objetRatification(racine)} : ratifié ». Sinon, arrête-toi et renvoie le développeur au skill racine, \`${commandeSkill(racine.reference)}\`.`]),
      n.dependances.length > 0
        ? `Vérifie que ${liste(n.dependances)} ${n.dependances.length > 1 ? 'sont clos' : 'est clos'} : remise écrite et critères prouvés. Sinon, arrête-toi et dis au développeur ce qui manque.`
        : 'Ce ticket ne dépend d\'aucun autre.',
    ];
    return etapes.map((e, k) => `${k + 1}. ${e}`);
  }

  analyse(n) {
    const options = this.optionsGroupees(n);
    const image = options.some((g) => g.instances.some((i) => i.analyse_image !== undefined));
    const cle = this.cle(n);
    const etapes = [
      ...(n.estRacine ? [`Fais rédiger les documents de la clé ${cle} par le sous-agent rédacteur, puis passe leurs contrôles sans écart (module \`documents\`, sections 4 et 5) : ils se ratifient avec ce skill.`] : []),
      `Écris la copie de travail de \`ticket.toml\` dans \`${this.dossier(n)}ticket.toml\`. Tu ne la complètes que de ce que demandent les options (repérage, valeurs relevées) ; sa demande, sa composition et ses options ne changent pas.`,
      `Fais cartographier l'architecture réelle par le sous-agent \`${this.nomRole(n, 'analyste')}\`, en lecture seule, par l'outil \`invoke_agent\`, avec la référence de ce ticket et ses couches : code, contrat, migrations, tests existants, conventions du projet. Vérifie ses constats ; le disque fait foi.`,
      'Cartographie l\'impact : dépendances explicites et détectées, autres consommateurs. Si la demande sort des empreintes de la composition, arrête-toi et remonte-la au ticket parent, ou au développeur pour la racine, sans changer de composition (D11.INV-4).',
      `Pour chaque option, relève ce que son module demande à l'analyse${image ? ', et analyse l\'image de l\'objectif dans `analyse-image.md` (D10.INV-4)' : ''}.`,
      'Choisis la configuration : mode, concepts et poids, profondeur, niveau de preuve, justifiés par la criticité selon la grille du fichier d\'invariants du projet (module `methode`, § 2 et § 7.1 ; D2.INV-1).',
      `Déduis les tests des critères et des risques : les scénarios de \`docs/demandes/${cle}/${cle}.feature\` que ce ticket réalise (module \`recette\`, scénarios à réaliser), les preuves des options et les exigences des méso-contrats transverses (D10.INV-3). Un critère sans scénario de sa couche remonte au skill racine, qui seul modifie les documents de la clé.`,
      `Écris \`${this.dossier(n)}analyse.md\` : cartographie d'impact, configuration retenue et sa justification, stratégie (slots engagés, gate contrats, points de retour arrière), scénarios et tests déduits.`,
    ];
    return etapes.map((e, k) => `${k + 1}. ${e}`);
  }

  coordination(n) {
    const etats = [
      ...(n.estRacine
        ? [
          `**Documents à rédiger**, sans \`${this.dossier(n)}us.md\` : fais rédiger les documents de la clé par le sous-agent rédacteur, puis passe leurs contrôles sans écart (module \`documents\`, sections 4 et 5) ; ensuite, ratification (section 6).`,
          `**Arbre non ratifié**, documents écrits, sans « ${objetRatification(n)} : ratifié » dans la vue : passe à la ratification (section 6).`,
        ]
        : []),
      `**Sous-tickets en cours** : montre l'état de chacun d'après la vue (ratifications, critères menacés ou en écart, désaccords, attentes) et son dossier (\`analyse.md\`, \`remise.md\`), puis le ou les sous-tickets prêts dans l'ordre du module \`sous-tickets\`, avec leur commande, à lancer dans une nouvelle session. Arrête-toi là.`,
      '**Tous les sous-tickets clos**, chacun avec sa `remise.md` : passe à la clôture (section 7).',
    ];
    return [
      `Ce nœud ne lit ni ne modifie le code, et n'active pas dans sa session le skill d'un sous-ticket : chaque nœud se traite dans sa propre session, lancée par le développeur. À chaque lancement, ce skill reconnaît où en est ${n.estRacine ? 'l\'arbre' : 'son sous-arbre'}, d'après sa vue augmentée, \`${this.commandeVue(n, 'generer', n.reference)}\`, et les dossiers sous \`docs/demandes/${this.racine(n).reference}/\` :`,
      '',
      ...etats.map((e, k) => `${k + 1}. ${e}`),
    ];
  }

  ratification(n) {
    const depot = `dépose sa décision dans le champ de l'arbre, \`${this.depotRatification(n)}\`, ou \`--decision "non ratifié"\` avec sa raison dans \`--contenu\` (module \`champ\` du skill racine, section 3)`;
    const documents = 'les statuts des critères mis à jour et leurs contrôles repassés sans écart';
    const commit = 'puis les documents se commitent sur la branche de l\'arbre (module `documents`, section 6)';
    if (n.estRacine && !n.estFeuille) {
      return [`Avant toute autre action, présente au développeur l'arbre complet : les sous-tickets et leurs méso-contrats, l'ordre de résolution et les critères, avec la façon dont chaque critère de la racine est soutenu (modules \`sous-tickets\` et \`recette\`), et les documents de la clé, qui se ratifient avec lui (module \`documents\`, section 6). ${this.vueAuDeveloppeur(n, 'les critères d\'acceptation, ceux qui les soutiennent et les scénarios qui les prouvent, encore sans calque')} **Point de ratification** : rien ne commence avant sa réponse. Une fois ${documents}, ${depot} ; ${commit}. Elle couvre l'arbre ; chaque feuille se ratifie encore avant sa première action. Une fois l'arbre ratifié, indique le premier sous-ticket prêt et sa commande, à lancer dans une nouvelle session.`];
    }
    if (!n.estFeuille) return ['Pas de ratification propre : l\'arbre a été ratifié sur le skill racine. Ce nœud coordonne ses sous-tickets.'];
    const presentation = `Présente au développeur ce skill et son analyse : objectif, critères, méso-contrats et options avec leur paramétrage, invariants, configuration, cartographie, stratégie, scénarios et tests déduits, avec la copie de travail de \`ticket.toml\`${n.estRacine ? ', et les documents de la clé, qui se ratifient avec lui (module `documents`, section 6)' : ''}. **Point de ratification** : rien n'est modifié avant sa réponse (D3.INV-1, la fiche étant ce skill).`;
    return [n.estRacine
      ? `${presentation} Une fois ${documents}, ${depot} ; ${commit}.`
      : `${presentation} Puis ${depot}.`];
  }

  transformation(n) {
    const racine = this.racine(n).reference;
    const parSlot = new Map();
    for (const g of this.optionsGroupees(n)) {
      for (const s of g.slots.engages) {
        if (!parSlot.has(s)) parSlot.set(s, []);
        parSlot.get(s).push(`\`${g.couche}.${g.option}\``);
      }
    }
    const slot = (id) => this.S.orchestrateur.slots.find((s) => s.id === id);
    const etape = (id, texte) => {
      const s = slot(id);
      return `**${id}, ${s.terme}** (${s.fonction.charAt(0).toLowerCase()}${s.fonction.slice(1)}) : ${texte}`;
    };
    const engage = (id, objet) => (parSlot.has(id) ? `${objet} ; options ${parSlot.get(id).join(', ')}.` : 'non engagé par ce ticket.');
    const options = new Set(this.optionsGroupees(n).map((g) => `${g.couche}.${g.option}`));
    const schema = options.has('persistance.schema');
    const elements = [
      ...(schema ? ['concevoir le changeset, versionné, réversible, idempotent, en vérifiant la nullabilité, les données historiques et le risque de verrouillage (fichier d\'invariants du projet, § 1)'] : []),
      ...(options.has('persistance.crud') ? ['arrêter le contrat CRUD, les opérations retenues par entité et leurs requêtes'] : []),
    ];
    const contrats = [
      ...(parSlot.has('É1') ? [schema ? 'le schéma exposé (É1)' : 'le contrat de données (É1)'] : []),
      ...(parSlot.has('É3') ? ['le contrat d\'interface (É3)'] : []),
    ];
    const etapes = [
      etape('É0', 'vérifier l\'environnement, les droits et l\'outillage. *Gate : environnement reproductible.*'),
      etape('É1', engage('É1', elements.join(' ; ') || 'structures de données persistantes')),
      etape('É3', engage('É3', 'contrat d\'interface aligné sur les conventions existantes et sur le socle')),
      ...(contrats.length > 0
        ? [`*Gate contrats*, fin de d=1 : ${liste(contrats)} ${accord(contrats.length, 'est validé', 'sont validés')} avant toute implémentation de niveau d=2 ou d=3${schema ? ', changeset compris' : ''} (D3.INV-2).`]
        : []),
      ...(schema ? ['**É1**, écriture du changeset conçu.'] : []),
      etape('É2', engage('É2', 'où vit l\'état, comment circulent les flux')),
      etape('É4', engage('É4', 'logique métier, déclenchée par le seul signal d\'appel')),
      etape('É5', engage('É5', 'interface qui consomme le contrat')),
      etape('É6', 'exécuter tous les tests déduits et les gates (module `methode`, § 5.1), mesurer, produire le dossier de preuves (module `recette`).'),
      etape('É7', `remettre \`remise.md\` au développeur (section 8) ; la validation métier, la livraison et la mesure en usage appartiennent à l'équipe, l'IA ne publie rien (D4.INV-3) ; capitaliser et clore par une rétrospective de second ordre (module \`methode\`, § 6).`),
    ];
    return [
      ...etapes.map((e, k) => `${k + 1}. ${e}`),
      '',
      `Chaque commit porte un seul slot et commence par \`${racine} : [É<n>-<DOMAINE>] \`, ou \`${racine} Snn : [É<n>-<DOMAINE>] \` pour le commit d'un scénario (D4.INV-2)${n.estRacine ? '' : `, son corps cite \`Sous-ticket : ${n.reference}\``} ; l'IA ne pousse, ne fusionne, ne rebase ni ne pose de tag (D4.INV-3).`,
      '',
      `Les options de chaque couche se confient à son agent, par l'outil \`invoke_agent\` : ${liste(this.couches(n).map((c) => `\`${this.nomAgent(n, c)}\` (${c})`))}. Chaque agent réalise ses scénarios un à un en cycle TDD (agent-tdd-jira, module \`cycle-tdd\`), dans son propre contexte, et te présente chacun : fais-le accepter au développeur (V4) avant le commit et avant le scénario suivant. Ce skill garde la ratification, la recette et la remise.`,
      '',
      `Avant É6, le sous-agent \`${this.nomRole(n, 'relecteur')}\` relit les commits de ce ticket, couche par couche, en mode revue du référentiel de la couche ; un constat bloquant se corrige par l'agent de la couche, après la décision du développeur, dans un commit de rétroaction qui cite la revue (D6.INV-1). En É6, le sous-agent \`${this.nomRole(n, 'qualite')}\` examine le diff avec la branche cible (sonarqube, module \`examen-local\`) ; aucune écriture vers SonarQube sans la validation explicite du développeur, et le jeton ne se lit que dans la variable \`SONAR_TOKEN\` (sonarqube:D1.INV-2, sonarqube:D1.INV-3). Leurs rapports vont dans \`remise.md\`.`,
    ];
  }

  cloture(n) {
    return [
      `${n.reference} se clôt quand tous ses sous-tickets sont clos et que chacun de ses critères est prouvé par ceux qui le soutiennent (module \`recette\`). Un critère non prouvé, ou un écart remonté par un sous-ticket, se présente au développeur avec ses preuves ; il ne se tranche pas en silence (D6.INV-3).`,
      ...(n.estRacine
        ? [
          '',
          `Si l'ordre 2 a proposé des adaptations, invoque l'observateur d'ordre 3 de l'arbre, \`${this.nomRole(n, 'observateur-3')}\`, pour le bilan de clôture : lesquelles ont changé une décision (module \`champ\`, section 4). ${this.vueAuDeveloppeur(n, 'chaque critère d\'acceptation avec ses preuves, les désaccords et les décisions')} Puis assemble les kits dev, test et démo et la remise à Agent2Test, et contrôle-les sans écart (module \`kits\`).`,
        ]
        : []),
    ];
  }

  remise(n) {
    const remise = `\`${this.dossier(n)}remise.md\``;
    const suite = n.estRacine ? 'Le ticket est alors clos ; l\'installateur peut retirer l\'arbre, en archivant ses skills dans le dossier du ticket.' : `Puis renvoie le développeur au skill de ${n.parent.reference}, \`${commandeSkill(n.parent.reference)}\`, dans une nouvelle session : il indique la suite.`;
    const kits = n.estFeuille
      ? 'Ce skill étant aussi la racine de l\'arbre, cette remise s\'écrit dans l\'ordre d\'assemblage des kits dev, test et démo et de la remise à Agent2Test (module `kits`, section 5), qui s\'y citent par leur chemin.'
      : 'Les kits dev, test et démo s\'y citent par leur chemin (module `kits`).';
    const racine = n.estRacine
      ? ` ${kits} L'état final du champ, \`${this.commandeChamp(n, 'etat')}\`, s'y reporte : critères prouvés, désaccords et leurs décisions au registre des écarts, propositions d'ordre 2 retenues ou refusées${n.estFeuille ? `, avec le bilan de clôture de l'observateur d'ordre 3 si l'ordre 2 a proposé des adaptations` : ''} ; la vue finale, \`docs/demandes/${this.cle(n)}/vue.html\`, s'y cite par son chemin, à jour (\`${this.commandeVue(n, 'verifier')}\`). Donne au développeur la remise à Agent2Test, qu'il dépose lui-même, le rapport final par critère (\`references/agent-tdd-jira/tracabilite.md\`, § 4) et le projet de commentaire Jira, qu'il publie lui-même (§ 5) : ce skill n'écrit jamais dans Jira.`
      : '';
    if (!n.estFeuille) return [`${remise} : pour chaque critère, les preuves de ceux qui le soutiennent ; les écarts remontés et leurs décisions ; l'état de chaque sous-ticket.${racine} ${suite}`];
    const front = this.couches(n).includes('frontend');
    const contributions = `sous le titre « Contributions aux kits », ce que le skill racine assemble à la clôture de l'arbre : les commits, avec leur empreinte et leur titre ; les tests et les scénarios qu'ils portent ;${front ? ` les captures de l'écran livré par scénario (\`${this.dossier(n)}captures/\`), avec l'image de l'objectif à laquelle chacune se compare ;` : ''} les données de démonstration, déposées dans \`${this.dossier(n)}demo/\`, et les commandes de lancement`;
    return [`${remise}, complète à la remise (D3.INV-3) : modifications par slot, avec les commits ; dossier de preuves, scénario par scénario ; rapports du relecteur et de l'agent qualité ; écarts ajoutés au registre des écarts ; boucle de second ordre (observations É6 et É7, commits de rétroaction, entrées proposées) ; capitalisation ; indicateurs et leur calcul (module \`methode\`, § 8) ; et, ${contributions}.${racine} ${suite}`];
  }

  role(rel) {
    if (rel === 'manifest.json') return 'manifeste : identité, place dans l\'arbre, provenance des héritages';
    if (rel === 'SKILL.md') return 'consigne, à lire en premier';
    if (rel === 'ticket.toml') return 'le ticket : demande, composition, critères, options';
    if (rel === 'socle/SKILL.md') return `socle back-front ${this.S.socle.version}, hérité en entier`;
    if (rel === 'projet/meso-contrats.md') return 'invariants du projet, dans l\'état où ce skill a été produit';
    const boite = this.S.boite.fichiers.find((f) => f.path === rel);
    if (boite || rel === FICHIER_RATTACHEMENT) {
      const origine = boite ? `${/^specs\/([^/]+)\//.exec(boite.from)?.[1] ?? 'prototype skill-ticket'}${boite.version ? ` ${boite.version}` : ''}${boite.sections ? `, extrait (§ ${boite.sections.join(', § ')})` : ''}${boite.bloc ? `, bloc de code du § ${boite.bloc.section}` : ''} : ` : '';
      return `${origine}${USAGES_BOITE[rel] ?? ''}`;
    }
    if (rel.startsWith('references/')) return 'référentiel de la pile : versions cibles et invariants';
    const observateur = /-observateur-([23])\.md$/.exec(rel)?.[1];
    if (observateur && rel.startsWith('agents/')) return `observateur d'ordre ${observateur} de l'arbre, dans son propre contexte, en lecture seule hors du champ ; copié dans \`.gemini/agents/\` à l'installation`;
    const roleAgent = Object.keys(ROLES).find((r) => rel.endsWith(`-${r}.md`) && rel.startsWith('agents/'));
    if (roleAgent) return `sous-agent ${ROLES[roleAgent].titre} de l'arbre, dans son propre contexte${ROLES[roleAgent].ecrit ? '' : ', en lecture seule'} ; copié dans \`.gemini/agents/\` à l'installation`;
    if (rel.startsWith('agents/')) return 'agent d\'une couche, dans son propre contexte ; copié dans `.gemini/agents/` à l\'installation';
    if (rel.startsWith('commandes/')) return `commande \`/ticket:${/([^/]+)\.toml$/.exec(rel)?.[1]}\` qui lance ce skill ; copiée dans \`.gemini/commands/ticket/\` à l'installation`;
    const m = /^modules\/([^/]+)\//.exec(rel)?.[1];
    if (m === 'meso-contrats') return 'méso-contrats de la composition et transverses, copiés du référentiel';
    if (m?.startsWith('option-')) return 'option copiée du référentiel, puis paramétrée pour ce ticket';
    if (m === 'recette') return 'critères à prouver, preuves et commandes';
    if (m === 'sous-tickets') return 'sous-arbre, ordre de résolution et coordination';
    if (m === 'documents') return 'documents de la clé selon agent-tdd-jira, rattachement des critères, contrôles et ratification';
    if (m === 'kits') return 'kits dev, test et démo, remise à Agent2Test, assemblage et contrôle';
    if (m === 'champ') return 'champ d\'observation de l\'arbre : enregistrements, commandes, ordres, déclencheurs, propagation, désaccords';
    if (m === 'vue') return 'vue augmentée de l\'arbre : ancres, piles, calques, états, commandes, lecteurs';
    if (m === 'methode') return 'sections de la méthode de l\'orchestrateur, mot pour mot';
    if (m === 'invariants') return 'invariants hérités, correspondances, invariants de l\'orchestrateur mot pour mot';
    return m ? `module \`${m}\`` : '';
  }

  /** En-tête de la transmission du skill. */
  entete(n) {
    const nom = nomSkill(n.reference);
    return fichier('ENTETE-TRANSMISSION.md', [
      `# Skill de ticket ${n.reference} : skill ${nom} {{VERSION}}, transmission texte`,
      '',
      'Ce texte contient le skill complet d\'un ticket, produit par le générateur C7E. Il n\'y a aucune pièce jointe. Le skill est découpé en fichiers, chacun délimité ainsi :',
      '',
      '    <<<FICHIER chemin/relatif>>>',
      '    ...contenu exact du fichier...',
      '    <<<FIN chemin/relatif>>>',
      '',
      '---',
      '',
      `À partir de maintenant, tu ${n.estFeuille ? 'résous' : 'coordonnes'} le ticket ${n.reference} avec ce skill. Le skill fait foi. Si tu relèves une ambiguïté ou une contradiction, signale-la au développeur ; ne corrige pas le skill toi-même.`,
      '',
      '## Étape 0 : matérialiser le skill',
      '',
      `Si le développeur a installé le skill avec l'installateur du dépôt Agent2Prompt (\`tools/installer.mjs\`, ou \`installer-arbre.mjs\` pour tout l'arbre), cette étape est faite : vérifie seulement les fichiers avec \`sha256sum -c integrite.sha256\`, depuis le dossier du skill, puis passe à l'étape 1. Sinon, crée le dossier \`.gemini/skills/${nom}/\`, puis, pour chaque bloc, le fichier de ce chemin avec le contenu exact compris entre les deux lignes délimitrices, qui n'en font pas partie ; ne reformule rien. Vérifie ensuite chaque fichier contre la table d'intégrité en fin de texte.`,
      '',
      '## Étape 1 : lecture',
      '',
      'Lis `SKILL.md` en entier, puis `ticket.toml` et les modules qu\'il désigne.',
      '',
      '## Étape 2 : travail',
      '',
      'Suis `SKILL.md` à partir de sa section 4. Rien n\'est modifié avant la ratification (section 6).',
    ]);
  }

  /** Manifeste : identité, place dans l'arbre, provenance des héritages, modules dans l'ordre de lecture. */
  manifeste(n, corps, herites) {
    const id = (rel) => rel.replace(/\/SKILL\.md$/, '').replace(/\.(md|toml)$/, '').replace(/^modules\//, '').replace(/\//g, '-');
    const contenu = {
      name: nomSkill(n.reference),
      version: VERSION_SKILL,
      specSchema: 1,
      language: 'fr',
      description: this.description(n),
      entry: 'SKILL.md',
      ticket: {
        reference: n.reference,
        racine: this.racine(n).reference,
        parent: n.parent?.reference ?? null,
        profondeur: n.profondeur,
        nature: this.nature(n),
        enfants: n.enfants.map((e) => e.reference),
        depend_de: n.dependances,
        composition: { principal: n.composition.principal, complements: n.composition.complements },
        referentiel: this.R.version,
        dossier: this.dossier(n),
        herites,
        genere_par: { prototype: 'skill-ticket', lot: LOT, fabrique: this.nom, orchestrateur: this.S.orchestrateur.version },
      },
      modules: corps.map((f) => ({ id: id(f.rel), path: f.rel, status: 'active' })),
    };
    return fichier('manifest.json', JSON.stringify(contenu, null, 2));
  }
}

/** Fabrique concrète de la pile PostgreSQL, Java et Angular : l'adaptateur par défaut de l'orchestrateur. */
export class FabriqueJavaAngularPostgreSQL extends FabriqueSkillTicket {
  get nom() {
    return 'java-angular-postgresql';
  }

  static referencesRequises(couches) {
    return [
      ...(couches.includes('persistance') || couches.includes('backend') ? ['java'] : []),
      ...(couches.includes('frontend') ? ['angular'] : []),
    ];
  }

  agentDeCouche(couche) {
    // Outils intégrés de Gemini CLI, tels que les déclare la version 0.67.0 (skill explication-hote-ia, repère H6).
    const outils = ['read_file', 'list_directory', 'glob', 'grep_search', 'write_file', 'replace', 'run_shell_command'];
    return {
      persistance: { suffixe: 'persistance', titre: 'persistance', technologies: 'PostgreSQL et Liquibase', outils },
      backend: { suffixe: 'back', titre: 'back', technologies: 'Java 21 et Spring Boot 3.5', outils },
      frontend: { suffixe: 'front', titre: 'front', technologies: 'Angular 20', outils },
    }[couche];
  }

  commandesRecette(couches) {
    return [
      ...(couches.includes('persistance') || couches.includes('backend')
        ? ['Java et Spring Boot, d\'après `references/java.md` (§ 9) : le build complet passe, `./mvnw verify` ou `./gradlew check` selon le wrapper du projet, sur une machine disposant de Docker pour Testcontainers.']
        : []),
      ...(couches.includes('persistance') ? ['Liquibase : migration jouée, annulée et rejouée (`update-testing-rollback`), sur une copie de la base de référence.'] : []),
      ...(couches.includes('frontend') ? ['Angular, d\'après `references/angular.md` (§ 9) : `ng lint`, `ng test` sans navigateur interactif et `ng build` passent.'] : []),
    ];
  }
}

export const FABRIQUES = { 'java-angular-postgresql': FabriqueJavaAngularPostgreSQL };
