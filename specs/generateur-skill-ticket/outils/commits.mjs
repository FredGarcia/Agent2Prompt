// Arbre des commits du générateur de skills de ticket (generateur-skill-ticket, D1, depuis 1.1.0).
//
// Un ticket se résout sur une branche, en plusieurs commits ; l'arbre en est le plan, selon la
// composition récursive imbriquée (CRI) : le ticket, son US et ses critères au niveau macro ; la
// composition au niveau des méso-contrats ; les tâches (les feuilles de l'arbre, une session
// chacune) au niveau des méso-composants ; leurs commits au niveau micro. La racine déclare les
// scénarios de l'US ([[ticket.scenarios]]) ; chaque tâche porte la liste ordonnée de ses commits
// ([[ticket.commits]]), un par scénario et par thème de modification, un thème purement technique
// ayant son commit sans scénario. Un arbre sans scénario ni commit garde le plan d'avant la 1.1.0 :
// une tâche sans plan vaut un commit par slot.
//
// Depuis la 1.1.1, un scénario peut dire les couches qu'il touche (`couches`) : il ne se croise alors
// qu'avec les thèmes de ces couches, et un commit d'un thème de couche ne réalise que les scénarios de
// cette couche. Des scénarios hors de la racine, ou des thèmes sur un nœud composé, ne seraient lus par
// rien : ce sont des écarts, et non des oublis silencieux.

import { COUCHES } from './referentiel.mjs';

export const MOTIF_THEME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const MOTIF_SCENARIO = /^S\d{2,}$/;
export const MOTIF_COMMIT = /^K\d+$/;

const tableau = (x) => (Array.isArray(x) ? x : []);

/** Scénarios déclarés par la racine : [{ id, titre, prouve, couches? }]. */
export const scenariosDe = (racine) => tableau(racine?.ticket?.scenarios);

/** Commits planifiés d'une tâche : [{ id, theme, scenario?, resume }]. */
export const commitsDe = (n) => tableau(n?.ticket?.commits);

/** L'arbre a-t-il un plan de commits (1.1.0) ? */
export const aUnPlan = (arbre) => Boolean(arbre.racine) && (scenariosDe(arbre.racine).length > 0 || arbre.noeuds.some((n) => commitsDe(n).length > 0));

/**
 * Critères de la racine que soutient un nœud, en remontant la chaîne de `soutient` : un critère
 * d'une feuille soutient un critère de son parent, qui soutient un critère du sien, jusqu'à la racine.
 */
export function criteresRacineSoutenus(n) {
  let refs = new Set(n.criteres.map((c) => `${n.reference}:${c.id}`));
  for (let x = n; x.parent; x = x.parent) {
    const suivants = new Set();
    for (const c of x.criteres) if (refs.has(`${x.reference}:${c.id}`)) for (const s of tableau(c.soutient)) suivants.add(String(s));
    refs = suivants;
  }
  const racine = n.ancetres().at(-1) ?? n;
  return new Set([...refs].filter((r) => r.startsWith(`${racine.reference}:`)).map((r) => r.slice(racine.reference.length + 1)));
}

/**
 * Un commit de ce thème peut-il réaliser ce scénario ? Oui, sauf si le thème est une couche et que le
 * scénario, disant ses couches, ne la touche pas (1.1.1).
 */
export const realisable = (s, theme) => !COUCHES.includes(theme) || !Array.isArray(s?.couches) || s.couches.includes(theme);

/** Scénarios d'une tâche : ceux qui éprouvent un critère de la racine qu'elle soutient. */
export function scenariosDeLaTache(n, racine) {
  if (n === racine) return scenariosDe(racine);
  const soutenus = criteresRacineSoutenus(n);
  return scenariosDe(racine).filter((s) => tableau(s.prouve).some((c) => soutenus.has(c)));
}

/** Vérifie le plan de commits de l'arbre ; rien à vérifier pour un arbre d'avant la 1.1.0. */
export function verifierPlan(arbre) {
  const erreurs = [];
  const { racine } = arbre;
  if (!racine) return erreurs;
  // Depuis la 1.1.1 : un champ du plan placé où rien ne le lit, et des thèmes mal formés.
  for (const n of [racine, ...racine.descendants()]) {
    if (n !== racine && n.ticket?.scenarios !== undefined) erreurs.push(`${n.reference} : seule la racine déclare les scénarios de l'US ([[ticket.scenarios]]) ; ceux-ci ne seraient pas lus`);
    if (!n.estFeuille && n.ticket?.themes !== undefined) erreurs.push(`${n.reference} : nœud composé ; ses tâches portent les thèmes (themes), pas lui`);
    const themes = n.ticket?.themes;
    if (n.estFeuille && themes !== undefined && (!Array.isArray(themes) || themes.length === 0 || themes.some((t) => typeof t !== 'string' || !MOTIF_THEME.test(t)))) erreurs.push(`${n.reference} : themes, une liste non vide de thèmes en minuscules et tirets`);
  }
  if (!aUnPlan(arbre)) return erreurs;
  const scenarios = scenariosDe(racine);
  const criteresRacine = new Set(racine.criteres.map((c) => c.id));
  const ids = scenarios.map((s) => s?.id);
  if (scenarios.length === 0) erreurs.push(`${racine.reference} : des tâches ont un plan de commits, mais la racine ne déclare aucun scénario ([[ticket.scenarios]])`);
  for (const [k, s] of scenarios.entries()) {
    const ici = `${racine.reference}:${s?.id ?? `scénario n° ${k + 1}`}`;
    if (typeof s?.id !== 'string' || !MOTIF_SCENARIO.test(s.id)) erreurs.push(`${ici} : identifiant de scénario attendu sous la forme Snn`);
    else if (ids.indexOf(s.id) !== k) erreurs.push(`${ici} : scénario en double`);
    if (typeof s?.titre !== 'string' || s.titre.trim() === '') erreurs.push(`${ici} : titre absent`);
    const prouve = tableau(s?.prouve);
    if (prouve.length === 0) erreurs.push(`${ici} : n'éprouve aucun critère de la racine (prouve)`);
    for (const c of prouve) if (!criteresRacine.has(c)) erreurs.push(`${ici} : éprouve ${c}, critère absent de la racine`);
    if (s?.couches !== undefined) {
      if (!Array.isArray(s.couches) || s.couches.length === 0) erreurs.push(`${ici} : couches, une liste non vide parmi ${COUCHES.join(', ')}`);
      else {
        for (const c of s.couches) if (!COUCHES.includes(c)) erreurs.push(`${ici} : couche « ${c} » hors de ${COUCHES.join(', ')}`);
        if (new Set(s.couches).size !== s.couches.length) erreurs.push(`${ici} : couche en double`);
      }
    }
  }
  for (const c of racine.criteres) {
    if (!scenarios.some((s) => tableau(s.prouve).includes(c.id))) erreurs.push(`${racine.reference}:${c.id} : aucun scénario ne l'éprouve`);
  }
  for (const n of [racine, ...racine.descendants()].filter((x) => !x.estFeuille)) {
    if (commitsDe(n).length > 0) erreurs.push(`${n.reference} : nœud composé ; ses tâches portent les commits, pas lui`);
  }
  const taches = racine.feuilles();
  const couverts = new Set();
  for (const t of taches) {
    const commits = commitsDe(t);
    const propres = new Set(scenariosDeLaTache(t, racine).map((s) => s.id));
    if (commits.length === 0) erreurs.push(`${t.reference} : tâche sans commit planifié ([[ticket.commits]])`);
    const cids = commits.map((c) => c?.id);
    const couples = new Set();
    for (const [k, c] of commits.entries()) {
      const ici = `${t.reference}:${c?.id ?? `commit n° ${k + 1}`}`;
      if (typeof c?.id !== 'string' || !MOTIF_COMMIT.test(c.id)) erreurs.push(`${ici} : identifiant de commit attendu sous la forme Kn`);
      else if (cids.indexOf(c.id) !== k) erreurs.push(`${ici} : commit en double`);
      if (typeof c?.theme !== 'string' || !MOTIF_THEME.test(c.theme)) erreurs.push(`${ici} : un thème, et un seul, en minuscules et tirets`);
      if (typeof c?.resume !== 'string' || c.resume.trim() === '') erreurs.push(`${ici} : résumé absent`);
      if (c?.scenario !== undefined) {
        if (typeof c.scenario !== 'string') erreurs.push(`${ici} : au plus un scénario, une chaîne Snn`);
        else if (!ids.includes(c.scenario)) erreurs.push(`${ici} : scénario ${c.scenario} non déclaré par la racine`);
        else if (!propres.has(c.scenario)) erreurs.push(`${ici} : le scénario ${c.scenario} n'éprouve aucun critère de la racine que soutient ${t.reference}`);
        else {
          const s = scenarios.find((x) => x?.id === c.scenario);
          if (!realisable(s, c.theme)) erreurs.push(`${ici} : thème ${c.theme}, une couche que le scénario ${c.scenario} ne touche pas (couches : ${s.couches.join(', ')})`);
          couverts.add(c.scenario);
        }
      }
      const couple = `${c?.scenario ?? '-'}|${c?.theme}`;
      if (couples.has(couple)) erreurs.push(`${ici} : un seul commit par scénario et par thème (${c?.scenario ?? 'sans scénario'}, ${c?.theme})`);
      couples.add(couple);
    }
  }
  for (const s of scenarios) if (typeof s?.id === 'string' && !couverts.has(s.id)) erreurs.push(`${racine.reference}:${s.id} : aucun commit planifié ne le réalise`);
  return erreurs;
}

/**
 * Plan proposé d'une tâche : un commit technique pour son évolution de schéma s'il y en a une, puis
 * un commit par scénario de la tâche et par thème. Thèmes : ceux que déclare la tâche (`themes`), à
 * défaut les couches que touchent ses options. Un scénario qui dit ses couches ne se croise qu'avec les
 * thèmes de ces couches (1.1.1) ; un thème sans scénario garde un commit à décrire. Le développeur
 * ratifie, ou corrige, avec l'arbre.
 */
export function proposerCommits(t, racine, couchesDe) {
  const themes = tableau(t.ticket.themes).length > 0 ? t.ticket.themes : couchesDe(t);
  const scenarios = scenariosDeLaTache(t, racine);
  const res = [];
  const ajouter = (c) => res.push({ id: `K${res.length + 1}`, ...c });
  const schema = tableau(t.ticket.persistance?.schema);
  if (schema.length > 0) ajouter({ theme: 'schema', resume: `Évolution de schéma : ${schema.map((s) => `${s.changement} ${s.table ?? ''}`.trim()).join(', ')}` });
  for (const theme of themes) {
    const croises = scenarios.filter((s) => realisable(s, theme));
    if (croises.length === 0) ajouter({ theme, resume: `${theme} : à décrire` });
    for (const s of croises) ajouter({ theme, scenario: s.id, resume: `${s.titre}, ${theme}` });
  }
  return res;
}

/** Les commits proposés d'une tâche, en TOML, à recopier dans son fichier. */
export function commitsEnToml(commits) {
  const chaine = (x) => JSON.stringify(x);
  return commits.flatMap((c) => [
    '[[ticket.commits]]',
    `id = ${chaine(c.id)}`,
    `theme = ${chaine(c.theme)}`,
    ...(c.scenario ? [`scenario = ${chaine(c.scenario)}`] : []),
    `resume = ${chaine(c.resume)}`,
    '',
  ]);
}

/** Plan des commits, ligne par ligne, dans l'ordre de résolution des tâches. */
export function decrirePlan(arbre, ordre) {
  const lignes = [];
  let k = 0;
  for (const { noeud } of ordre) {
    if (!noeud.estFeuille) continue;
    for (const c of commitsDe(noeud)) {
      k += 1;
      lignes.push(`  ${String(k).padStart(2)}. ${noeud.reference}:${c.id}  ${c.theme}${c.scenario ? ` · ${c.scenario}` : ' · sans scénario'}  ${c.resume}`);
    }
  }
  return lignes;
}
