#!/usr/bin/env node
// Mesure du contexte chargé pour résoudre chaque feuille d'un arbre de skills de ticket
// (generateur-skill-ticket, D7, critère P7), comparé à celui du point d'entrée de l'orchestrateur C7E.
// Outil du générateur : les skills générés ne le portent pas.
//
// Mesure statique et déterministe, sans modèle. Pour chaque nœud, chaque contexte qui travaille pour lui :
// la session de son skill, chaque agent de couche, chaque sous-agent de rôle que sa consigne nomme ; puis
// les observateurs d'ordre 2 et 3 de l'arbre. Chaque feuille se compare à l'orchestrateur. Deux bornes :
//   - à l'activation : ce que Gemini CLI charge de lui-même, les noms et descriptions des skills et des
//     agents installés, puis le corps du skill activé ; pour un agent, son corps ;
//   - au plus : en plus, ce que sa consigne lui fait lire pour résoudre le ticket : les modules et les
//     fichiers qu'elle cite (sections 2 à 10 d'une consigne de skill, sans la place dans l'arbre ni la
//     table des fichiers ; tout le corps d'un agent), la copie du projet du fichier d'invariants, les
//     documents de la clé, la vue du nœud ; jamais ce qu'il écrit (copie de travail, analyse, remise), ni
//     le champ, qu'il lit par la vue.
// Le point d'entrée de l'orchestrateur se mesure de la même façon, selon son propre ordre de lecture : à
// l'activation, son nom, sa description et son SKILL.md ; au plus, la copie du projet du fichier
// d'invariants, les modules qualification et referentiel, le référentiel du projet, le ticket, les
// documents de la clé, le socle et les référentiels des couches que le ticket touche.
// Tailles en caractères ; tokens estimés à un pour quatre caractères, à recaler par une mesure réelle.
//
// Usage :
//   node mesurer-contexte.mjs mesurer <transmissions…> [--projet <dossier>] [--json] [--sortie <rapport.md>]
//   node mesurer-contexte.mjs calibrer <base.json> <activation.json> --caracteres <n>
// `mesurer` lit les transmissions d'un arbre ; `--projet`, le projet dont il lit les invariants, les
// documents de la clé et le champ (pour la vue des nœuds). `calibrer` lit deux sorties `gemini -p … -o json`
// de Gemini CLI, l'une sans skill, l'autre qui active un skill de n caractères, et en tire le nombre de
// caractères par token. Codes de sortie : 0, 1 au moindre écart, 2 pour un usage incorrect.

import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { relire } from '../../../tools/bundle.mjs';
import { MODULE_REFERENTIEL, RACINE_DEPOT, lireTexte } from './referentiel.mjs';
import { construireVue, vueDuNoeud } from './vue.mjs';

export const FORMAT_MESURE = 'skill-ticket.contexte/1';
export const CARACTERES_PAR_TOKEN = 4;
export const tokens = (caracteres) => Math.ceil(caracteres / CARACTERES_PAR_TOKEN);

/** Sections d'une consigne de skill qui disent quoi lire : sans la place dans l'arbre (1) ni la table des fichiers (11). */
export const SECTIONS_LUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];
const ROLES = ['redacteur', 'analyste', 'relecteur', 'qualite', 'observateur-2', 'observateur-3'];
const OBSERVATEURS = ['observateur-2', 'observateur-3'];
const ORCHESTRATEUR = join(RACINE_DEPOT, 'specs', 'orchestrateur-c7e');

const corps = (texte) => texte.replace(/^---\n[\s\S]*?\n---\n/, '');
const entete = (texte) => /^---\n([\s\S]*?)\n---\n/.exec(texte)?.[1] ?? '';
const champEntete = (texte, cle) => new RegExp(`^${cle}: (.*)$`, 'm').exec(entete(texte))?.[1] ?? '';
/** Ce que Gemini CLI garde d'un skill ou d'un agent installé avant son activation : son nom et sa description. */
const annonce = (texte) => `${champEntete(texte, 'name')}: ${champEntete(texte, 'description')}\n`;
const nombre = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const pluriel = (n, un, plusieurs) => `${n} ${n > 1 ? plusieurs : un}`;

// ---- Lecture des skills d'un arbre ----

/**
 * Skills d'un arbre, depuis leurs transmissions, dans l'ordre de l'arbre (la racine, puis chaque nœud avant
 * ses sous-tickets) : nom → { nom, reference, racine, nature, fichiers (rel → contenu) }.
 */
export function chargerSkills(chemins) {
  const fichiersDe = (c) => (existsSync(c) && !c.toLowerCase().endsWith('.md') ? readdirSync(c).filter((f) => f.toLowerCase().endsWith('.md')).sort().map((f) => join(c, f)) : [c]);
  const skills = chemins.flatMap(fichiersDe).map((chemin) => {
    const fichiers = new Map(relire(lireTexte(chemin)).fichiers.map((f) => [f.rel, f.contenu]));
    const m = JSON.parse(fichiers.get('manifest.json'));
    return { nom: m.name, reference: m.ticket.reference, racine: m.ticket.racine, nature: m.ticket.nature, fichiers };
  });
  skills.sort((x, y) => (x.reference < y.reference ? -1 : x.reference > y.reference ? 1 : 0));
  return new Map(skills.map((s) => [s.nom, s]));
}

const estFeuille = (s) => ['feuille', 'racine et feuille'].includes(s.nature);
const nomAgent = (rel) => /^agents\/(.+)\.md$/.exec(rel)?.[1] ?? null;
const estRole = (nom) => ROLES.some((r) => nom.endsWith(`-${r}`));
const estObservateur = (nom) => OBSERVATEURS.some((r) => nom.endsWith(`-${r}`));
/** Sous-agents de rôle que nomme une consigne : par leur nom entre accents graves, ou « sous-agent rédacteur ». */
const nomme = (texte, nom) => new RegExp(`\`${nom}\``).test(texte) || (nom.endsWith('-redacteur') && /sous-agent rédacteur/.test(texte));

// ---- Citations d'une consigne ----

/** Texte des sections lues d'une consigne de skill ; tout le corps pour un agent. */
export function texteLu(texte, sections = null) {
  if (!sections) return corps(texte);
  const parties = corps(texte).split(/^(?=## )/m);
  return parties.filter((p) => sections.includes(/^## (\d+)\./.exec(p)?.[1])).join('');
}

/**
 * Citations d'un texte : modules (« module `x` », « modules `x` et `y` », « du skill racine » pour ceux
 * de la racine), chemins de fichiers entre accents graves, copie du projet du fichier d'invariants, vues
 * de nœud lues par `vue.mjs generer --noeud`.
 * Un script cité se lance : sa sortie entre dans le contexte, pas son code ; seule la vue d'un nœud, la
 * sortie qui se lit en entier, se compte.
 */
export function citations(texte) {
  const res = [];
  for (const m of texte.matchAll(/\bmodules? ((?:`[a-z0-9-]+`(?:,\s*|\s+et\s+)?)+)(\s+du skill racine)?/g)) {
    for (const nom of m[1].matchAll(/`([a-z0-9-]+)`/g)) res.push({ type: 'module', nom: nom[1], racine: Boolean(m[2]), citation: m[0].replace(/[,\s]+$/, '').replace(/\s+/g, ' ') });
  }
  for (const m of texte.matchAll(/`([^`\s]+)`/g)) {
    const t = m[1];
    if (t.startsWith('/') || t.endsWith('/') || /\.(mjs|js)$/.test(t) || !(t.includes('/') || /\.(md|toml|json|feature)$/.test(t))) continue;
    res.push({ type: 'chemin', chemin: t, citation: `\`${t}\`` });
  }
  for (const m of texte.matchAll(/`(\.gemini\/skills\/<skill du sous-ticket>\/[^`\s]+)`/g)) res.push({ type: 'chemin', chemin: m[1], citation: `\`${m[1]}\`` });
  // Le fichier d'invariants du projet se cite aussi sans son chemin, qui est par défaut `docs/c7e/meso-contrats.md`.
  for (const m of texte.matchAll(/copie du projet du fichier d'invariants/g)) res.push({ type: 'chemin', chemin: 'docs/c7e/meso-contrats.md', citation: m[0] });
  for (const m of texte.matchAll(/vue\.mjs generer docs\/demandes\/[^\s`]+ --noeud ([^\s`]+)/g)) res.push({ type: 'vue', noeud: m[1], citation: m[0] });
  return res;
}

// ---- Mesure ----

/**
 * Lecteur des fichiers d'un arbre installé et de son projet : résout une citation, depuis les skills où la
 * consigne se lit (le skill du nœud d'abord, celui qui porte la consigne en dernier), en entrées
 * { id, taille } : aucune pour ce qui ne se lit pas, plusieurs pour un chemin qui vaut pour chaque
 * sous-ticket (`.gemini/skills/<skill du sous-ticket>/…`).
 */
function lecteur({ skills, racine, cle, projet, rattachement }) {
  const vues = new Map();
  const vueDe = (noeud) => {
    if (!vues.has(noeud)) {
      const { erreurs, vue } = construireVue(join(projet ?? join(RACINE_DEPOT, '.inexistant'), 'docs', 'demandes', cle), { rattachement });
      vues.set(noeud, erreurs ? null : vueDuNoeud(vue, noeud));
    }
    return vues.get(noeud);
  };
  const projetLu = (rel) => (projet && existsSync(join(projet, ...rel.split('/'))) ? lireTexte(join(projet, ...rel.split('/'))) : null);
  const documents = [`docs/demandes/${cle}/${cle}.feature`, `docs/demandes/${cle}/us.md`, `docs/demandes/${cle}/demande.json`];
  const une = (id, texte) => (texte === null || texte === undefined ? [] : [{ id, taille: texte.length }]);
  return (c, bases) => {
    if (c.type === 'module') {
      const ou = c.racine ? [racine] : [...bases, racine];
      const s = ou.find((x) => x.fichiers.has(`modules/${c.nom}/SKILL.md`));
      return s ? une(`${s.nom}/modules/${c.nom}/SKILL.md`, s.fichiers.get(`modules/${c.nom}/SKILL.md`)) : [];
    }
    if (c.type === 'vue') return une(`vue du nœud ${c.noeud}`, vueDe(c.noeud));
    const t = c.chemin;
    if (t.startsWith('.gemini/skills/')) {
      const [, , nom, ...reste] = t.split('/');
      const rel = reste.join('/');
      if (nom === '<skill du sous-ticket>') {
        const porteur = bases[bases.length - 1];
        return [...skills.values()].filter((x) => x.reference.startsWith(`${porteur.reference}-`)).flatMap((x) => une(`${x.nom}/${rel}`, x.fichiers.get(rel)));
      }
      return une(`${nom}/${rel}`, skills.get(nom)?.fichiers.get(rel));
    }
    if (t.startsWith('.gemini/')) return [];
    // La copie du projet du fichier d'invariants ; à défaut, celle du skill, qui en garde l'état à la génération.
    if (t === 'docs/c7e/meso-contrats.md') return une(`projet/${t}`, projetLu(t) ?? bases[0].fichiers.get('projet/meso-contrats.md'));
    if (documents.includes(t)) return une(`projet/${t}`, projetLu(t));
    if (t.startsWith('docs/')) return []; // ce que le nœud écrit, le champ et la vue écrite
    const s = bases.find((x) => x.fichiers.has(t));
    return s ? une(`${s.nom}/${t}`, s.fichiers.get(t)) : [];
  };
}

/** Contexte : deux listes d'entrées, à l'activation et au plus, et leurs totaux. */
function contexte(nom, nature, activation, lus) {
  const auPlus = [...activation];
  for (const e of lus) if (e && !auPlus.some((x) => x.id === e.id)) auPlus.push(e);
  const total = (es) => es.reduce((s, e) => s + e.taille, 0);
  return {
    nom, nature,
    activation: { caracteres: total(activation), tokens: tokens(total(activation)), fichiers: activation },
    au_plus: { caracteres: total(auPlus), tokens: tokens(total(auPlus)), fichiers: auPlus },
  };
}

/** Entrées lues d'après les citations d'un texte, avec leur raison, sans doublon. */
function lire(texte, bases, resoudre) {
  const res = [];
  for (const c of citations(texte)) {
    for (const e of resoudre(c, bases)) if (!res.some((x) => x.id === e.id)) res.push({ ...e, raison: c.citation });
  }
  return res;
}

/** Point d'entrée de l'orchestrateur, pour le ticket entier, selon son propre ordre de lecture. */
export function mesurerOrchestrateur({ skills, racine, cle, projet }) {
  const skill = lireTexte(join(ORCHESTRATEUR, 'SKILL.md'));
  const activation = [
    { id: 'orchestrateur-c7e : nom et description', taille: annonce(skill).length, raison: 'chargés au démarrage de Gemini CLI' },
    { id: 'orchestrateur-c7e/SKILL.md', taille: corps(skill).length, raison: 'corps du skill, à son activation' },
  ];
  const projetLu = (rel) => (projet && existsSync(join(projet, ...rel.split('/'))) ? lireTexte(join(projet, ...rel.split('/'))) : null);
  const referentiel = /^<!-- fichier : (\S+\.toml) -->\n```[a-z]*\n([\s\S]*?)\n```\n/m.exec(lireTexte(MODULE_REFERENTIEL))[2];
  const feuilles = [...skills.values()].filter(estFeuille);
  const reference = (rel) => feuilles.find((s) => s.fichiers.has(rel))?.fichiers.get(rel);
  const lus = [
    { id: 'projet/docs/c7e/meso-contrats.md', taille: (projetLu('docs/c7e/meso-contrats.md') ?? lireTexte(join(ORCHESTRATEUR, 'meso-contrats.md'))).length, raison: 'copie du projet du fichier d\'invariants, lue au démarrage' },
    ...['qualification', 'referentiel'].map((m) => ({ id: `orchestrateur-c7e/modules/${m}/SKILL.md`, taille: lireTexte(join(ORCHESTRATEUR, 'modules', m, 'SKILL.md')).length, raison: 'lu à l\'ouverture et à l\'analyse de chaque ticket' })),
    { id: 'projet/docs/c7e/referentiel-meso-contrats.toml', taille: referentiel.length, raison: 'référentiel du projet, écrit à l\'identique du modèle à l\'installation' },
    { id: `projet/docs/demandes/${cle}/ticket.toml`, taille: racine.fichiers.get('ticket.toml').length, raison: 'le ticket, une instance du référentiel' },
    ...[`docs/demandes/${cle}/${cle}.feature`, `docs/demandes/${cle}/us.md`].filter((r) => projetLu(r) !== null).map((r) => ({ id: `projet/${r}`, taille: projetLu(r).length, raison: 'documents de la clé' })),
    { id: 'orchestrateur-c7e/socle/SKILL.md', taille: racine.fichiers.get('socle/SKILL.md').length, raison: 'socle, quand le ticket touche son domaine' },
    ...['java', 'angular'].filter((r) => reference(`references/${r}.md`)).map((r) => ({ id: `orchestrateur-c7e/references/${r}.md`, taille: reference(`references/${r}.md`).length, raison: 'référentiel d\'une couche que le ticket touche' })),
  ];
  return contexte('orchestrateur-c7e', 'point d\'entrée', activation, lus);
}

const ratio = (x, y) => Math.round((x / y) * 1000) / 1000;
const plusGrandDe = (contextes) => contextes.reduce((m, c) => (c.au_plus.caracteres > m.au_plus.caracteres ? c : m));
const sommeDe = (contextes) => contextes.reduce((n, c) => n + c.au_plus.caracteres, 0);

/** Contextes d'un nœud : la session de son skill, ses agents de couche, les sous-agents de rôle que sa consigne nomme. */
function mesurerNoeud(s, { descriptions, agents, resoudre, orchestrateur }) {
  const consigne = s.fichiers.get('SKILL.md');
  const lu = texteLu(consigne, SECTIONS_LUES);
  const contextes = [contexte(`session du skill ${s.nom}`, 'session', [descriptions, { id: `${s.nom}/SKILL.md`, taille: corps(consigne).length, raison: 'corps du skill, à son activation' }], lire(lu, [s], resoudre))];
  const propres = [...s.fichiers.keys()].map(nomAgent).filter((n) => n && !estRole(n));
  const nommes = [...agents.keys()].filter((n) => estRole(n) && !estObservateur(n) && nomme(lu, n));
  for (const n of [...propres, ...nommes]) {
    const a = agents.get(n);
    contextes.push(contexte(`${estRole(n) ? 'sous-agent' : 'agent'} ${n}`, estRole(n) ? 'sous-agent' : 'agent', [{ id: `${a.skill.nom}/agents/${n}.md`, taille: corps(a.texte).length, raison: 'corps de l\'agent, à son invocation' }], lire(corps(a.texte), [s, a.skill], resoudre)));
  }
  const plusGrand = plusGrandDe(contextes);
  const somme = sommeDe(contextes);
  const o = orchestrateur;
  return {
    reference: s.reference, skill: s.nom, nature: s.nature, contextes,
    plus_grand: { nom: plusGrand.nom, caracteres: plusGrand.au_plus.caracteres, tokens: plusGrand.au_plus.tokens },
    somme: { caracteres: somme, tokens: tokens(somme) },
    rapports: {
      session_activation: ratio(contextes[0].activation.caracteres, o.activation.caracteres),
      session_au_plus: ratio(contextes[0].au_plus.caracteres, o.au_plus.caracteres),
      plus_grand: ratio(plusGrand.au_plus.caracteres, o.au_plus.caracteres),
      somme: ratio(somme, o.au_plus.caracteres),
    },
  };
}

/**
 * Mesure d'un arbre : le point d'entrée de l'orchestrateur ; chaque nœud et ses contextes, les feuilles
 * comparées une à une à l'orchestrateur ; les observateurs de l'arbre ; la synthèse de tous les contextes.
 */
export function mesurer(chemins, { projet = null } = {}) {
  const skills = chargerSkills(chemins);
  const racine = [...skills.values()].find((s) => s.reference === s.racine);
  const cle = racine.reference;
  const rattachement = JSON.parse(racine.fichiers.get('outils/rattachement.json'));
  const resoudre = lecteur({ skills, racine, cle, projet, rattachement });
  // Ce que Gemini CLI charge au démarrage, dans le workspace où l'arbre est installé.
  const annonces = [...skills.values()].flatMap((s) => [s.fichiers.get('SKILL.md'), ...[...s.fichiers].filter(([rel]) => nomAgent(rel)).map(([, t]) => t)]);
  const descriptions = { id: `noms et descriptions ${skills.size > 1 ? `des ${skills.size} skills` : 'du skill'} et des agents installés`, taille: annonces.reduce((n, t) => n + annonce(t).length, 0), raison: 'chargés au démarrage de Gemini CLI' };
  const agents = new Map([...skills.values()].flatMap((s) => [...s.fichiers].filter(([rel]) => nomAgent(rel)).map(([rel, t]) => [nomAgent(rel), { skill: s, texte: t }])));
  const orchestrateur = mesurerOrchestrateur({ skills, racine, cle, projet });
  const noeuds = [...skills.values()].map((s) => mesurerNoeud(s, { descriptions, agents, resoudre, orchestrateur }));
  // Observateurs d'ordre 2 et 3 : invoqués sur attente du champ, par le skill d'un nœud ; mesurés une fois pour l'arbre.
  const observateurs = [...agents.keys()].filter(estObservateur).map((n) => {
    const a = agents.get(n);
    return contexte(`observateur ${n}`, 'observateur', [{ id: `${a.skill.nom}/agents/${n}.md`, taille: corps(a.texte).length, raison: 'corps de l\'agent, à son invocation' }], lire(corps(a.texte), [a.skill], resoudre));
  });
  const tous = [...noeuds.flatMap((n) => n.contextes), ...observateurs];
  const plusGrand = plusGrandDe(tous);
  const total = sommeDe(tous);
  // Relectures : un fichier lu dans plusieurs contextes y est compté chaque fois ; lu une fois, il compterait
  // sa plus grande taille lue (le fichier entier couvre son corps).
  const lectures = new Map();
  for (const c of tous) {
    for (const e of c.au_plus.fichiers) {
      const l = lectures.get(e.id) ?? { id: e.id, contextes: 0, lu: 0, taille: 0 };
      lectures.set(e.id, { ...l, contextes: l.contextes + 1, lu: l.lu + e.taille, taille: Math.max(l.taille, e.taille) });
    }
  }
  const uniques = [...lectures.values()].reduce((n, l) => n + l.taille, 0);
  const relus = [...lectures.values()].filter((l) => l.contextes > 1)
    .map((l) => ({ id: l.id, contextes: l.contextes, caracteres: l.lu - l.taille, tokens: tokens(l.lu - l.taille) }))
    .sort((x, y) => y.caracteres - x.caracteres || (x.id < y.id ? -1 : x.id > y.id ? 1 : 0));
  const arbre = {
    noeuds: noeuds.length, feuilles: noeuds.filter(estFeuille).length, contextes: tous.length,
    plus_grand: { nom: plusGrand.nom, caracteres: plusGrand.au_plus.caracteres, tokens: plusGrand.au_plus.tokens },
    total: { caracteres: total, tokens: tokens(total) },
    rapports: { plus_grand: ratio(plusGrand.au_plus.caracteres, orchestrateur.au_plus.caracteres), total: ratio(total, orchestrateur.au_plus.caracteres) },
    lectures: {
      uniques: { caracteres: uniques, tokens: tokens(uniques) },
      relectures: { caracteres: total - uniques, tokens: tokens(total - uniques), part: ratio(total - uniques, total) },
      fichiers_relus: relus,
    },
  };
  return { format: FORMAT_MESURE, cle, caracteres_par_token: CARACTERES_PAR_TOKEN, projet: projet ? 'fourni' : 'aucun', orchestrateur, arbre, noeuds, observateurs };
}

// ---- Rapport ----

const pourcent = (r) => `${Math.round(r * 100)} %`;
const cellule = (b) => `${nombre(b.caracteres)} car., ${nombre(b.tokens)} tokens`;

/** Rapport en Markdown d'une mesure. */
export function rapport(m, { projet = null } = {}) {
  const o = m.orchestrateur;
  const a = m.arbre;
  const feuilles = m.noeuds.filter(estFeuille);
  const regroupements = m.noeuds.filter((n) => !estFeuille(n));
  const tableau = (contextes) => ['| Contexte | À l\'activation | Au plus |', '|---|---|---|', ...contextes.map((c) => `| ${c.nom} | ${cellule(c.activation)} | ${cellule(c.au_plus)} |`)];
  const lignes = [
    `# Contexte chargé pour résoudre chaque feuille de ${m.cle}`,
    '',
    `Mesure statique et déterministe (generateur-skill-ticket, critère P7), produite par \`outils/mesurer-contexte.mjs\`. Projet mesuré : ${projet ?? 'aucun ; ni documents de la clé ni champ, la vue des nœuds est celle d\'un champ vide'}. Tailles en caractères ; tokens estimés à un pour ${m.caracteres_par_token} caractères.`,
    '',
    'À l\'activation : ce que Gemini CLI charge de lui-même (noms et descriptions des skills et des agents installés, corps du skill activé ; corps d\'un agent à son invocation). Au plus : en plus, ce que la consigne fait lire pour résoudre le ticket, sans ce qu\'elle fait écrire. Chaque contexte est séparé : la session d\'un skill et chaque agent ont le leur.',
    '',
    `## Point d'entrée de l'orchestrateur, pour le ticket ${m.cle} entier`,
    '',
    '| Borne | Taille |',
    '|---|---|',
    `| à l'activation | ${cellule(o.activation)} |`,
    `| au plus | ${cellule(o.au_plus)} |`,
    '',
    ...o.au_plus.fichiers.map((f) => `- \`${f.id}\` : ${nombre(f.taille)} car., ${f.raison}`),
    '',
    '## Feuilles',
    '',
    '| Feuille | Session, activation | Session, au plus | Plus grand contexte | Somme des contextes |',
    '|---|---|---|---|---|',
    ...feuilles.map((f) => `| ${f.reference} | ${nombre(f.contextes[0].activation.tokens)} tokens, ${pourcent(f.rapports.session_activation)} | ${nombre(f.contextes[0].au_plus.tokens)} tokens, ${pourcent(f.rapports.session_au_plus)} | ${nombre(f.plus_grand.tokens)} tokens, ${pourcent(f.rapports.plus_grand)} | ${nombre(f.somme.tokens)} tokens, ${pourcent(f.rapports.somme)} |`),
    '',
    'Les pourcentages rapportent chaque taille à celle du point d\'entrée de l\'orchestrateur, à la même borne pour l\'activation, au plus pour le reste. La somme réunit les contextes qui travaillent pour la feuille : sa session, ses agents de couche, ses sous-agents de rôle.',
    '',
    '## Arbre entier',
    '',
    '| Mesure | Au plus |',
    '|---|---|',
    `| plus grand contexte de l'arbre, ${a.plus_grand.nom} | ${nombre(a.plus_grand.tokens)} tokens, ${pourcent(a.rapports.plus_grand)} |`,
    `| somme des ${a.contextes} contextes ${a.noeuds > 1 ? `des ${a.noeuds} nœuds` : 'du nœud'} et des observateurs | ${nombre(a.total.tokens)} tokens, ${pourcent(a.rapports.total)} |`,
    '',
    'Aucun contexte de l\'arbre ne charge plus que le pourcentage du plus grand ; la somme dit ce que l\'arbre lit en tout, quand chaque contexte relit ce qu\'il lui faut, au plus.',
    '',
    '## Relectures',
    '',
    `Sur la somme des contextes de l'arbre, ${nombre(a.lectures.relectures.tokens)} tokens (${pourcent(a.lectures.relectures.part)}) viennent de fichiers lus dans plusieurs contextes ; lus une seule fois chacun, les fichiers de l'arbre feraient ${nombre(a.lectures.uniques.tokens)} tokens, ${pourcent(ratio(a.lectures.uniques.caracteres, o.au_plus.caracteres))} du point d'entrée de l'orchestrateur.`,
    '',
    '| Fichier | Contextes qui le lisent | Relu, au plus |',
    '|---|---|---|',
    ...a.lectures.fichiers_relus.map((f) => `| \`${f.id}\` | ${f.contextes} | ${nombre(f.tokens)} tokens |`),
    '',
  ];
  if (regroupements.length > 0) {
    lignes.push('## Racine et nœuds intermédiaires', '', 'Ils coordonnent leurs sous-tickets, ratifient et, pour la racine, font rédiger les documents de la clé ; mesurés hors des sommes par feuille.', '', '| Nœud | Session, au plus | Somme des contextes |', '|---|---|---|');
    for (const n of regroupements) lignes.push(`| ${n.reference}, ${n.nature} | ${nombre(n.contextes[0].au_plus.tokens)} tokens, ${pourcent(n.rapports.session_au_plus)} | ${nombre(n.somme.tokens)} tokens, ${pourcent(n.rapports.somme)} |`);
    lignes.push('');
  }
  if (m.observateurs.length > 0) lignes.push('## Observateurs de l\'arbre, sur attente', '', 'Invoqués par le skill d\'un nœud quand le champ attend une observation d\'ordre 2 ou 3 ; mesurés une fois pour l\'arbre, hors des sommes par nœud.', '', ...tableau(m.observateurs), '');
  lignes.push('## Détail par nœud', '');
  const detail = (c) => [`Lu par ${c.nom} :`, '', ...c.au_plus.fichiers.map((e) => `- \`${e.id}\` : ${nombre(e.taille)} car.${e.raison ? `, ${e.raison}` : ''}`), ''];
  for (const n of m.noeuds) lignes.push(`### ${n.reference}, ${n.nature}`, '', ...tableau(n.contextes), '', ...n.contextes.flatMap(detail));
  if (m.observateurs.length > 0) lignes.push('### Observateurs', '', ...m.observateurs.flatMap(detail));
  return `${lignes.join('\n').replace(/\n+$/, '')}\n`;
}

// ---- Mesure réelle : sorties -o json de Gemini CLI ----

/** Tokens d'une sortie `gemini -p … -o json` : sommes sur les modèles de `stats.models`. */
export function tokensGemini(sortie) {
  const modeles = Object.values(sortie?.stats?.models ?? {});
  if (modeles.length === 0) throw new Error('sortie sans stats.models : lancer Gemini CLI avec -o json');
  const somme = (f) => modeles.reduce((n, m) => n + f(m), 0);
  return {
    requetes: somme((m) => m.api?.totalRequests ?? 0),
    prompt: somme((m) => m.tokens?.prompt ?? 0),
    cache: somme((m) => m.tokens?.cached ?? 0),
    total: somme((m) => m.tokens?.total ?? 0),
  };
}

/**
 * Calibrage : une session sans skill (une requête, contexte de base b) et une session qui active un skill
 * et s'arrête (deux requêtes : b, puis b plus le skill). Tokens du skill ≈ prompt cumulé − 2 b ; caractères
 * par token ≈ caractères du skill ÷ tokens du skill. Approximation : la première requête de la seconde
 * session vaut à peu près la base.
 */
export function calibrer(base, activation, caracteres) {
  const b = tokensGemini(base);
  const a = tokensGemini(activation);
  const ecarts = [];
  if (b.requetes !== 1) ecarts.push(`la session de base compte ${b.requetes} requêtes, attendu 1`);
  if (a.requetes !== 2) ecarts.push(`la session d'activation compte ${a.requetes} requêtes, attendu 2 : activation, puis réponse`);
  const tokensSkill = a.prompt - 2 * b.prompt;
  if (ecarts.length === 0 && tokensSkill <= 0) ecarts.push('tokens du skill nuls ou négatifs : les deux sessions ne se comparent pas');
  return { base: b, activation: a, tokens_skill: tokensSkill, caracteres_par_token: ecarts.length === 0 ? Math.round((caracteres / tokensSkill) * 100) / 100 : null, ecarts };
}

// ---- Ligne de commande ----

export function principal(argv, sortie = console.log, erreur = console.error) {
  const usage = 'Usage : node mesurer-contexte.mjs mesurer <transmissions…> [--projet <dossier>] [--json] [--sortie <rapport.md>] | calibrer <base.json> <activation.json> --caracteres <n>';
  const [commande, ...reste] = argv;
  const o = { positionnels: [] };
  for (let i = 0; i < reste.length; i++) {
    const a = reste[i];
    if (a === '--json') o.json = true;
    else if (['--projet', '--sortie', '--caracteres'].includes(a) && reste[i + 1] !== undefined) o[a.slice(2)] = reste[++i];
    else if (a.startsWith('--')) {
      erreur(`option inconnue ou sans valeur : ${a}\n${usage}`);
      return 2;
    } else o.positionnels.push(a);
  }
  if (commande === 'calibrer') {
    if (o.positionnels.length !== 2 || !(Number(o.caracteres) > 0)) {
      erreur(usage);
      return 2;
    }
    let r;
    try {
      r = calibrer(...o.positionnels.map((f) => JSON.parse(lireTexte(f))), Number(o.caracteres));
    } catch (e) {
      erreur(`ÉCART  ${e.message}`);
      return 1;
    }
    if (o.json) sortie(JSON.stringify(r, null, 2));
    else {
      sortie(`base : ${r.base.requetes} requête(s), ${r.base.prompt} tokens d'entrée ; activation : ${r.activation.requetes} requête(s), ${r.activation.prompt} tokens d'entrée cumulés`);
      if (r.caracteres_par_token) sortie(`skill : ${o.caracteres} caractères, environ ${r.tokens_skill} tokens, soit ${r.caracteres_par_token} caractères par token (estimation de la mesure statique : ${CARACTERES_PAR_TOKEN})`);
    }
    for (const e of r.ecarts) erreur(`ÉCART  ${e}`);
    return r.ecarts.length > 0 ? 1 : 0;
  }
  if (commande !== 'mesurer' || o.positionnels.length === 0) {
    erreur(usage);
    return 2;
  }
  const m = mesurer(o.positionnels, { projet: o.projet ?? null });
  // Le projet se nomme dans le rapport tel qu'il est donné, en séparateurs « / » : même rapport sous Windows.
  const texte = o.json ? `${JSON.stringify(m, null, 2)}\n` : rapport(m, { projet: o.projet ? o.projet.replace(/\\/g, '/') : null });
  if (o.sortie) {
    writeFileSync(o.sortie, texte);
    sortie(`mesure de ${m.cle} : ${pluriel(m.arbre.noeuds, 'nœud', 'nœuds')}, dont ${pluriel(m.arbre.feuilles, 'feuille', 'feuilles')}, ${pluriel(m.arbre.contextes, 'contexte', 'contextes')} ; ${o.sortie}`);
  } else sortie(texte.replace(/\n$/, ''));
  return 0;
}

const estPrincipal = process.argv[1] && fileURLToPath(import.meta.url).toLowerCase() === resolve(process.argv[1]).toLowerCase();
if (estPrincipal) process.exitCode = principal(process.argv.slice(2));
