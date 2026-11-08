// Fabrique abstraite de skill-ticket (prototype « skill de ticket », lots 2 et 3).
//
// Une fabrique produit, pour un nœud de l'arbre de tickets, la famille cohérente des fichiers de son
// skill : la consigne (SKILL.md), le ticket (ticket.toml), les blocs du référentiel copiés puis
// paramétrés (méso-contrats, options), la recette, la coordination des sous-tickets, les héritages
// (invariants et sections de la méthode de l'orchestrateur, socle, référentiels de la pile, invariants
// du projet), les agents et, au lot 4, les observateurs. La consigne suit un patron de méthode : le même
// squelette pour tous les nœuds, des crochets selon la nature du nœud et selon la pile. Une fabrique
// concrète par pile technique fixe ce qui dépend de la pile : référentiels experts, agents, commandes
// de recette. Le choix des méso-contrats n'est pas le sien : il vient du ticket, qualifié avant.
//
// Rien n'est tiré au hasard ni daté : la même entrée donne les mêmes fichiers, octet pour octet.

import { createHash } from 'node:crypto';
import { COUCHES, decrireComposition } from './referentiel.mjs';
import { decrireArbre, ordreDeResolution } from './arbre.mjs';
import { extraireSection } from './sources.mjs';

export const VERSION_SKILL = '1.0.0';
/** Lot du prototype qui a produit le générateur, inscrit dans chaque skill. */
export const LOT = 3;
export const sha256 = (texte) => createHash('sha256').update(texte, 'utf8').digest('hex');

/** Sections de la méthode de l'orchestrateur recopiées dans le module `methode`, selon la nature du nœud. */
export const SECTIONS_METHODE = { feuille: ['2', '5.1', '5.2', '6', '7.1', '8', '11.5'], compose: ['11.5'] };

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
 * Ligne de ratification ajoutée à `retours.md` : `- AAAA-MM-JJ, <nom> : arbre <CLÉ> ratifié` sur la racine,
 * `- AAAA-MM-JJ, <nom> : <référence> ratifié` sur une feuille ; un refus finit par `non ratifié, <motif>`.
 * Sa forme fixe permet de la reconnaître sans interprétation, à l'installateur comme aux autres skills.
 */
export const objetRatification = (n) => (n.estRacine && !n.estFeuille ? `arbre ${n.reference}` : n.reference);
export const ligneRatification = (objet) => `- AAAA-MM-JJ, <nom> : ${objet} ratifié`;

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

  /** Critères du nœud ; la colonne « Soutient » pour un sous-ticket seulement, la racine ne soutient rien. */
  tableauCriteres(n, prefixe = '') {
    if (n.estRacine) return tableau(['Critère', 'Énoncé'], n.criteres.map((c) => [`${prefixe}${c.id}`, c.enonce]));
    return tableau(['Critère', 'Énoncé', 'Soutient'], n.criteres.map((c) => [`${prefixe}${c.id}`, c.enonce, (c.soutient ?? []).join(', ')]));
  }

  /** Recette : critères à prouver ; pour une feuille, preuves des options, transverses, commandes de la pile. */
  recette(n) {
    const criteres = this.tableauCriteres(n, `${n.reference}:`);
    const corps = n.estFeuille
      ? [
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
        `Dans \`${this.dossier(n)}remise.md\` : test, critère ou risque, résultat ; gates passées.`,
      ]
      : [
        '## Recette par agrégation',
        '',
        'Ce nœud n\'agit pas sur le code. Chacun de ses critères est prouvé quand les critères qui le soutiennent, dans ses sous-tickets, sont prouvés :',
        '',
        tableau(['Critère', 'Soutenu par'], n.criteres.map((c) => {
          const ref = `${n.reference}:${c.id}`;
          return [ref, n.enfants.flatMap((e) => e.criteres.filter((x) => (x.soutient ?? []).includes(ref)).map((x) => `${e.reference}:${x.id}`)).join(', ')];
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

  /** Sections de la méthode de l'orchestrateur, mot pour mot. */
  methode(n) {
    const o = this.S.orchestrateur;
    const sections = SECTIONS_METHODE[n.estFeuille ? 'feuille' : 'compose'];
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
        ['la qualification et la confirmation de la composition (D10.INV-1, D11)', 'faites avant la génération de ce skill ; si l\'analyse montre que la demande sort des empreintes, ce skill remonte au parent, sans changer de composition (D11.INV-4)'],
        ['un paragraphe de l\'orchestrateur (§ n)', 'le texte recopié dans le module `methode` s\'il y figure ; sinon un renvoi informatif'],
      ]),
      '',
      `## Invariants de l'orchestrateur C7E ${o.version}`,
      '',
      ...o.invariants,
    ]);
  }

  /** Héritages recopiés en entier : socle, référentiels de la pile pour une feuille, invariants du projet. */
  copies(n) {
    const S = this.S;
    return [S.socle, ...(n.estFeuille ? this.experts(this.couches(n)) : []), S.projet].map((s) => ({ source: s, fichier: fichier(s.path, s.contenu) }));
  }

  /** Provenance de chaque héritage, pour le contrôle de l'héritage. */
  provenance(n, copies) {
    const o = this.S.orchestrateur;
    return [
      { path: 'modules/invariants/SKILL.md', from: o.from, version: o.version, invariants: o.invariants.length },
      { path: 'modules/methode/SKILL.md', from: o.from, version: o.version, sections: SECTIONS_METHODE[n.estFeuille ? 'feuille' : 'compose'] },
      ...copies.map(({ source, fichier: f }) => ({ path: f.rel, from: source.from, ...(source.version ? { version: source.version } : {}), sha256: sha256(f.contenu) })),
    ];
  }

  /** Nom de l'agent d'une couche d'une feuille. */
  nomAgent(n, couche) {
    return `${nomSkill(n.reference)}-${this.agentDeCouche(couche).suffixe}`;
  }

  /**
   * Un agent par couche touchée par une feuille ; un nœud composé coordonne sans agent. L'installateur
   * copie chaque agent dans `.gemini/agents/` : son contexte est séparé de celui de la session, d'où les
   * chemins complets vers les fichiers du skill installé.
   */
  agents(n) {
    if (!n.estFeuille) return [];
    const nom = nomSkill(n.reference);
    const ici = `.gemini/skills/${nom}/`;
    const racine = this.racine(n).reference;
    return this.couches(n).map((couche) => {
      const a = this.agentDeCouche(couche);
      const groupes = this.optionsGroupees(n).filter((g) => g.couche === couche);
      const references = this.experts([couche]).map((e) => `\`${ici}${e.path}\``);
      return fichier(`agents/${nom}-${a.suffixe}.md`, [
        frontmatter({
          name: `${nom}-${a.suffixe}`,
          description: `Agent ${a.titre} du skill de ticket ${n.reference} (${a.technologies}), qui réalise les options ${couche} du ticket après la ratification du skill, sous les invariants hérités.`,
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
        '## Règles',
        '',
        `- Aucune modification avant la ratification du skill par le développeur : la ligne \`${ligneRatification(n.reference)}\` dans \`${this.dossier(n)}retours.md\` (D3.INV-1, la fiche étant ce skill).`,
        `- Les invariants hérités s'appliquent : \`${ici}modules/invariants/SKILL.md\`, \`${ici}socle/SKILL.md\`, la copie du projet du fichier d'invariants${references.length > 0 ? ` et ${liste(references)}` : ''}.`,
        `- Un slot par commit ; chaque commit commence par \`${racine} : \` suivi de l'étiquette de son slot (D4.INV-2)${n.estRacine ? '' : `, et son corps cite \`Sous-ticket : ${n.reference}\``} ; tu ne pousses, ne fusionnes, ne rebases ni ne poses de tag (D4.INV-3).`,
        '- Tu ne sors pas de ta couche : un besoin hors de ton périmètre remonte au skill du ticket.',
        '',
        '## Rapport',
        '',
        '- Chaque constat cite sa preuve : test, commande et sortie, ou réponse du développeur.',
        `- Chaque choix du développeur parmi tes propositions, et chaque correction qu'il demande sur tes actions, s'ajoute à \`${this.dossier(n)}retours.md\` : c'est la référence de ton observation.`,
      ]);
    });
  }

  /** Observateurs des ordres 1 à 3 : au lot 5 du prototype. */
  observateurs() {
    return [];
  }

  /**
   * Commande Gemini CLI qui lance ce skill dans une session : l'installateur la copie dans
   * `.gemini/commands/ticket/`, elle devient `/ticket:<nœud>`.
   */
  commandes(n) {
    const quoi = n.estFeuille ? 'démarrage, analyse, ratification, transformation et remise' : n.estRacine ? 'présentation et ratification de l\'arbre, suivi, puis clôture' : 'suivi des sous-tickets, puis clôture';
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
    const role = n.estFeuille ? `résoudre ce ${n.estRacine ? 'ticket' : 'sous-ticket'}` : n.estRacine ? 'présenter l\'arbre du ticket, le faire ratifier puis coordonner ses sous-tickets' : 'coordonner ses sous-tickets';
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
      '## 9. Retours du développeur',
      '',
      `La référence de ton observation est le retour du développeur : ses choix parmi les options que tu proposes, et ses corrections sur tes actions. Ajoute chacun à \`${this.dossier(n)}retours.md\`, en ajout seul, avec ce que tu avais proposé ou fait. Une auto-évaluation sans preuve ni retour n'est pas une observation. Les retours orientent le travail ; ils ne lèvent aucun invariant ni aucune preuve.`,
      '',
      '## 10. Invariants hérités',
      '',
      'Le module `invariants` liste ce dont ce skill hérite, sans affaiblissement : le socle back-front, les invariants du projet, les référentiels de la pile et, mot pour mot, les invariants de l\'orchestrateur, avec leurs correspondances dans un skill de ticket. La précédence des règles suit le module `methode` (§ 11.5).',
      '',
      '## 11. Fichiers',
      '',
      tableau(['Fichier', 'Rôle'], fichiers.map((f) => [`\`${f.rel}\``, this.role(f.rel)])),
    ]);
  }

  placeDansArbre(n) {
    const racine = this.racine(n);
    const lignes = [`- Nature : ${this.nature(n)}${n.estFeuille ? ' ; ce skill agit sur le code, par ses agents.' : ' ; ce skill coordonne ses sous-tickets et n\'agit pas sur le code.'}`];
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
      ...(n.estRacine ? [] : [`Vérifie que l'arbre a été ratifié : la ligne \`${ligneRatification(objetRatification(racine))}\` figure dans \`${this.dossier(racine)}retours.md\`. Sinon, arrête-toi et renvoie le développeur au skill racine, \`${commandeSkill(racine.reference)}\`.`]),
      n.dependances.length > 0
        ? `Vérifie que ${liste(n.dependances)} ${n.dependances.length > 1 ? 'sont clos' : 'est clos'} : remise écrite et critères prouvés. Sinon, arrête-toi et dis au développeur ce qui manque.`
        : 'Ce ticket ne dépend d\'aucun autre.',
    ];
    return etapes.map((e, k) => `${k + 1}. ${e}`);
  }

  analyse(n) {
    const options = this.optionsGroupees(n);
    const image = options.some((g) => g.instances.some((i) => i.analyse_image !== undefined));
    return [
      `1. Écris la copie de travail de \`ticket.toml\` dans \`${this.dossier(n)}ticket.toml\`. Tu ne la complètes que de ce que demandent les options (repérage, valeurs relevées) ; sa demande, sa composition et ses options ne changent pas.`,
      '2. Lis l\'architecture réelle : code, contrat, migrations, tests existants, conventions du projet. Le disque fait foi.',
      '3. Cartographie l\'impact : dépendances explicites et détectées, autres consommateurs. Si la demande sort des empreintes de la composition, arrête-toi et remonte-la au ticket parent, ou au développeur pour la racine, sans changer de composition (D11.INV-4).',
      `4. Pour chaque option, relève ce que son module demande à l'analyse${image ? ', et analyse l\'image de l\'objectif dans `analyse-image.md` (D10.INV-4)' : ''}.`,
      '5. Choisis la configuration : mode, concepts et poids, profondeur, niveau de preuve, justifiés par la criticité selon la grille du fichier d\'invariants du projet (module `methode`, § 2 et § 7.1 ; D2.INV-1).',
      '6. Déduis les tests des critères et des risques, avec les preuves des options et les exigences des méso-contrats transverses (module `recette` ; D10.INV-3).',
      `7. Écris \`${this.dossier(n)}analyse.md\` : cartographie d'impact, configuration retenue et sa justification, stratégie (slots engagés, gate contrats, points de retour arrière), tests déduits.`,
    ];
  }

  coordination(n) {
    const etats = [
      ...(n.estRacine ? [`**Arbre non ratifié**, sans la ligne \`${ligneRatification(objetRatification(n))}\` dans \`${this.dossier(n)}retours.md\` : passe à la ratification (section 6).`] : []),
      `**Sous-tickets en cours** : montre l'état de chacun d'après son dossier (\`retours.md\`, \`analyse.md\`, \`remise.md\`), puis le ou les sous-tickets prêts dans l'ordre du module \`sous-tickets\`, avec leur commande, à lancer dans une nouvelle session. Arrête-toi là.`,
      '**Tous les sous-tickets clos**, chacun avec sa `remise.md` : passe à la clôture (section 7).',
    ];
    return [
      `Ce nœud ne lit ni ne modifie le code, et n'active pas dans sa session le skill d'un sous-ticket : chaque nœud se traite dans sa propre session, lancée par le développeur. À chaque lancement, ce skill reconnaît où en est ${n.estRacine ? 'l\'arbre' : 'son sous-arbre'}, d'après les dossiers sous \`docs/demandes/${this.racine(n).reference}/\` :`,
      '',
      ...etats.map((e, k) => `${k + 1}. ${e}`),
    ];
  }

  ratification(n) {
    if (n.estRacine && !n.estFeuille) {
      return [`Avant toute autre action, présente au développeur l'arbre complet : les sous-tickets et leurs méso-contrats, l'ordre de résolution et les critères, avec la façon dont chaque critère de la racine est soutenu (modules \`sous-tickets\` et \`recette\`). **Point de ratification** : rien ne commence avant sa réponse. Ajoute sa décision à \`${this.dossier(n)}retours.md\`, sur une ligne \`${ligneRatification(objetRatification(n))}\`, ou \`… non ratifié, <motif>\`, avec la date et son nom. Elle couvre l'arbre ; chaque feuille se ratifie encore avant sa première action. Une fois l'arbre ratifié, indique le premier sous-ticket prêt et sa commande, à lancer dans une nouvelle session.`];
    }
    if (!n.estFeuille) return ['Pas de ratification propre : l\'arbre a été ratifié sur le skill racine. Ce nœud coordonne ses sous-tickets.'];
    return [`Présente au développeur ce skill et son analyse : objectif, critères, méso-contrats et options avec leur paramétrage, invariants, configuration, cartographie, stratégie et tests déduits, avec la copie de travail de \`ticket.toml\`. **Point de ratification** : rien n'est modifié avant sa réponse (D3.INV-1, la fiche étant ce skill). Ajoute sa décision à \`${this.dossier(n)}retours.md\`, sur une ligne \`${ligneRatification(objetRatification(n))}\`, ou \`… non ratifié, <motif>\`, avec la date et son nom.`];
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
      `Chaque commit porte un seul slot et commence par \`${racine} : [É<n>-<DOMAINE>] \` (D4.INV-2)${n.estRacine ? '' : `, son corps cite \`Sous-ticket : ${n.reference}\``} ; l'IA ne pousse, ne fusionne, ne rebase ni ne pose de tag (D4.INV-3).`,
      '',
      `Les options de chaque couche se confient à son agent, par l'outil \`invoke_agent\` : ${liste(this.couches(n).map((c) => `\`${this.nomAgent(n, c)}\` (${c})`))}. Chaque agent travaille dans son propre contexte et rend son rapport ; ce skill garde la ratification, la recette et la remise.`,
    ];
  }

  cloture(n) {
    return [`${n.reference} se clôt quand tous ses sous-tickets sont clos et que chacun de ses critères est prouvé par ceux qui le soutiennent (module \`recette\`). Un critère non prouvé, ou un écart remonté par un sous-ticket, se présente au développeur avec ses preuves ; il ne se tranche pas en silence (D6.INV-3).`];
  }

  remise(n) {
    const remise = `\`${this.dossier(n)}remise.md\``;
    const suite = n.estRacine ? 'Le ticket est alors clos ; l\'installateur peut retirer l\'arbre, en archivant ses skills dans le dossier du ticket.' : `Puis renvoie le développeur au skill de ${n.parent.reference}, \`${commandeSkill(n.parent.reference)}\`, dans une nouvelle session : il indique la suite.`;
    if (!n.estFeuille) return [`${remise} : pour chaque critère, les preuves de ceux qui le soutiennent ; les écarts remontés et leurs décisions ; l'état de chaque sous-ticket. ${suite}`];
    return [`${remise}, complète à la remise (D3.INV-3) : modifications par slot, avec les commits ; dossier de preuves ; écarts ajoutés au registre des écarts ; boucle de second ordre (observations É6 et É7, commits de rétroaction, entrées proposées) ; capitalisation ; indicateurs et leur calcul (module \`methode\`, § 8). ${suite}`];
  }

  role(rel) {
    if (rel === 'manifest.json') return 'manifeste : identité, place dans l\'arbre, provenance des héritages';
    if (rel === 'SKILL.md') return 'consigne, à lire en premier';
    if (rel === 'ticket.toml') return 'le ticket : demande, composition, critères, options';
    if (rel === 'socle/SKILL.md') return `socle back-front ${this.S.socle.version}, hérité en entier`;
    if (rel === 'projet/meso-contrats.md') return 'invariants du projet, dans l\'état où ce skill a été produit';
    if (rel.startsWith('references/')) return 'référentiel de la pile : versions cibles et invariants';
    if (rel.startsWith('agents/')) return 'agent d\'une couche, dans son propre contexte ; copié dans `.gemini/agents/` à l\'installation';
    if (rel.startsWith('commandes/')) return `commande \`/ticket:${/([^/]+)\.toml$/.exec(rel)?.[1]}\` qui lance ce skill ; copiée dans \`.gemini/commands/ticket/\` à l'installation`;
    const m = /^modules\/([^/]+)\//.exec(rel)?.[1];
    if (m === 'meso-contrats') return 'méso-contrats de la composition et transverses, copiés du référentiel';
    if (m?.startsWith('option-')) return 'option copiée du référentiel, puis paramétrée pour ce ticket';
    if (m === 'recette') return 'critères à prouver, preuves et commandes';
    if (m === 'sous-tickets') return 'sous-arbre, ordre de résolution et coordination';
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
