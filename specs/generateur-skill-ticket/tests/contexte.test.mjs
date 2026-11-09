// Recette du lot 7, critère P7 : le contexte chargé pour résoudre chaque feuille est mesuré et comparé à
// celui du point d'entrée de l'orchestrateur, sur les deux arbres d'exemple, ABCDE-3620 (trois niveaux) et
// ABCDE-3512 (un seul ticket). La mesure est déterministe : le même arbre redonne le même rapport, octet
// pour octet, celui qui est versionné ; chaque fichier compté existe, a la taille comptée, et la consigne
// qui le fait lire le cite ; l'orchestrateur se mesure selon son propre ordre de lecture. Le calibrage par
// une mesure réelle se vérifie sur deux sorties d'essai de Gemini CLI ; la mesure réelle elle-même se fait
// sur le poste du développeur, avec sa clé.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RACINE_DEPOT, lireTexte } from '../outils/referentiel.mjs';
import { construireVue, vueDuNoeud } from '../outils/vue.mjs';
import { CARACTERES_PAR_TOKEN, FORMAT_MESURE, SECTIONS_LUES, calibrer, chargerSkills, citations, mesurer, principal, rapport, texteLu, tokens, tokensGemini } from '../outils/mesurer-contexte.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const OUTIL = join(ICI, '..', 'outils', 'mesurer-contexte.mjs');
const EXEMPLES = join(ICI, '..', 'exemples');
const ORCHESTRATEUR = join(RACINE_DEPOT, 'specs', 'orchestrateur-c7e');
const GEMINI = join(ICI, 'fixtures', 'gemini');
const MESURER = 'node specs/generateur-skill-ticket/outils/mesurer-contexte.mjs mesurer';

const ROLES_FEUILLE = ['analyste', 'relecteur', 'qualite'];
const ARBRES = [
  {
    cle: 'ABCDE-3620',
    transmissions: join(EXEMPLES, 'ABCDE-3620-skills', 'transmissions'),
    projet: join(EXEMPLES, 'ABCDE-3620-resolution'),
    libelle: 'specs/generateur-skill-ticket/exemples/ABCDE-3620-resolution',
    regenerer: `${MESURER} specs/generateur-skill-ticket/exemples/ABCDE-3620-skills/transmissions --projet specs/generateur-skill-ticket/exemples/ABCDE-3620-resolution --sortie specs/generateur-skill-ticket/exemples/contexte/ABCDE-3620.md`,
    // Contextes de chaque nœud : sa session, ses agents de couche, les sous-agents de rôle que sa consigne nomme.
    contextes: {
      'ABCDE-3620': ['session du skill ticket-abcde-3620', 'sous-agent ticket-abcde-3620-redacteur'],
      'ABCDE-3620-1': ['session du skill ticket-abcde-3620-1'],
      'ABCDE-3620-1.1': ['session du skill ticket-abcde-3620-1-1', 'agent ticket-abcde-3620-1-1-persistance', ...ROLES_FEUILLE.map((r) => `sous-agent ticket-abcde-3620-${r}`)],
      'ABCDE-3620-1.2': ['session du skill ticket-abcde-3620-1-2', 'agent ticket-abcde-3620-1-2-back', ...ROLES_FEUILLE.map((r) => `sous-agent ticket-abcde-3620-${r}`)],
      'ABCDE-3620-2': ['session du skill ticket-abcde-3620-2', 'agent ticket-abcde-3620-2-front', ...ROLES_FEUILLE.map((r) => `sous-agent ticket-abcde-3620-${r}`)],
    },
    feuilles: ['ABCDE-3620-1.1', 'ABCDE-3620-1.2', 'ABCDE-3620-2'],
  },
  {
    cle: 'ABCDE-3512',
    transmissions: join(EXEMPLES, 'ABCDE-3512-skills', 'transmissions'),
    projet: null,
    libelle: null,
    regenerer: `${MESURER} specs/generateur-skill-ticket/exemples/ABCDE-3512-skills/transmissions --sortie specs/generateur-skill-ticket/exemples/contexte/ABCDE-3512.md`,
    contextes: {
      'ABCDE-3512': [
        'session du skill ticket-abcde-3512',
        ...['persistance', 'back', 'front'].map((c) => `agent ticket-abcde-3512-${c}`),
        ...['redacteur', ...ROLES_FEUILLE].map((r) => `sous-agent ticket-abcde-3512-${r}`),
      ],
    },
    feuilles: ['ABCDE-3512'],
  },
];
const MESURES = new Map(ARBRES.map((a) => [a.cle, mesurer([a.transmissions], { projet: a.projet })]));

// Relectures indépendantes de l'outil : corps d'un fichier à en-tête, et ce que Gemini CLI en garde avant l'activation.
const corps = (texte) => texte.replace(/^---\n[\s\S]*?\n---\n/, '');
const annonce = (texte) => {
  const entete = /^---\n([\s\S]*?)\n---\n/.exec(texte)[1];
  const champ = (cle) => new RegExp(`^${cle}: (.*)$`, 'm').exec(entete)[1];
  return `${champ('name')}: ${champ('description')}\n`;
};
const ratio = (x, y) => Math.round((x / y) * 1000) / 1000;
const estFeuille = (n) => ['feuille', 'racine et feuille'].includes(n.nature);
const contextesDe = (m) => [...m.noeuds.flatMap((n) => n.contextes), ...m.observateurs];

// ---- P7 : rapports déterministes et versionnés ----

for (const a of ARBRES) {
  test(`P7 : ${a.cle}, le rapport regénéré est le rapport versionné, octet pour octet`, () => {
    const texte = rapport(MESURES.get(a.cle), { projet: a.libelle });
    assert.equal(rapport(mesurer([a.transmissions], { projet: a.projet }), { projet: a.libelle }), texte, 'deux mesures du même arbre diffèrent');
    assert.ok(texte === lireTexte(join(EXEMPLES, 'contexte', `${a.cle}.md`)), `rapport versionné de ${a.cle} périmé ; si le changement est voulu, le regénérer : ${a.regenerer}`);
  });
}

// ---- P7 : chaque fichier compté existe, a sa taille, et sa consigne le cite ----

for (const a of ARBRES) {
  test(`P7 : ${a.cle}, chaque fichier compté existe, a la taille comptée, et la consigne qui le fait lire le cite`, () => {
    const m = MESURES.get(a.cle);
    const skills = chargerSkills([a.transmissions]);
    const agents = new Map([...skills.values()].flatMap((s) => [...s.fichiers.keys()].filter((r) => /^agents\/.+\.md$/.test(r)).map((r) => [r.slice('agents/'.length, -'.md'.length), corps(s.fichiers.get(r))])));
    const installes = [...skills.values()].flatMap((s) => [...s.fichiers].filter(([r]) => r === 'SKILL.md' || /^agents\/.+\.md$/.test(r)).map(([, t]) => t));
    const descriptions = installes.reduce((n, t) => n + annonce(t).length, 0);
    const racine = [...skills.values()].find((s) => s.reference === s.racine);
    const rattachement = JSON.parse(racine.fichiers.get('outils/rattachement.json'));
    const { vue } = construireVue(join(a.projet ?? join(mkdtempSync(join(tmpdir(), 'contexte-')), 'absent'), 'docs', 'demandes', a.cle), { rattachement });
    const taille = (id, activation) => {
      if (id.startsWith('noms et descriptions ')) return descriptions;
      if (id.startsWith('vue du nœud ')) return vueDuNoeud(vue, id.slice('vue du nœud '.length)).length;
      if (id.startsWith('projet/')) {
        const rel = id.slice('projet/'.length);
        const chemin = join(a.projet ?? join(tmpdir(), 'absent-skill-ticket'), ...rel.split('/'));
        // Sans copie dans le projet, le fichier d'invariants se lit dans l'état où le skill a été produit.
        if (rel === 'docs/c7e/meso-contrats.md' && !existsSync(chemin)) return racine.fichiers.get('projet/meso-contrats.md').length;
        return lireTexte(chemin).length;
      }
      const [nom, ...reste] = id.split('/');
      const texte = skills.get(nom)?.fichiers.get(reste.join('/'));
      assert.ok(texte !== undefined, `${id} : fichier absent de l'arbre`);
      return activation ? corps(texte).length : texte.length;
    };
    let entrees = 0;
    for (const c of contextesDe(m)) {
      const nom = c.nom.replace(/^(session du skill|sous-agent|agent|observateur) /, '');
      const lu = (c.nature === 'session' ? texteLu(skills.get(nom).fichiers.get('SKILL.md'), SECTIONS_LUES) : agents.get(nom)).replace(/\s+/g, ' ');
      const n = c.activation.fichiers.length;
      assert.deepStrictEqual(c.au_plus.fichiers.slice(0, n), c.activation.fichiers, `${c.nom} : le contexte au plus commence par celui de l'activation`);
      assert.equal(new Set(c.au_plus.fichiers.map((e) => e.id)).size, c.au_plus.fichiers.length, `${c.nom} : un fichier compté deux fois`);
      c.au_plus.fichiers.forEach((e, i) => {
        assert.equal(e.taille, taille(e.id, i < n), `${c.nom} : taille de ${e.id}`);
        if (i >= n) assert.ok(lu.includes(e.raison), `${c.nom} : ${e.id} compté sans être cité par sa consigne (« ${e.raison} »)`);
        assert.doesNotMatch(e.id, /(^|\/)(champ\.(jsonl|tete)|vue\.(html|md)|analyse\.md|remise\.md)$|\.mjs$/, `${c.nom} : ${e.id} ne se lit pas pour résoudre`);
        entrees++;
      });
      for (const b of ['activation', 'au_plus']) {
        const total = c[b].fichiers.reduce((s, e) => s + e.taille, 0);
        assert.deepStrictEqual([c[b].caracteres, c[b].tokens], [total, tokens(total)], `${c.nom}, ${b}`);
      }
    }
    assert.ok(entrees > 50, `${entrees} fichiers comptés : la mesure ne lit presque rien`);
  });
}

// ---- P7 : l'orchestrateur, selon son ordre de lecture ----

test('P7 : le point d\'entrée de l\'orchestrateur se mesure selon son propre ordre de lecture', () => {
  const skill = lireTexte(join(ORCHESTRATEUR, 'SKILL.md'));
  // Si l'orchestrateur change son ordre de lecture, la mesure est à revoir avant de regénérer les rapports.
  assert.match(skill, /Ordre de lecture au premier lancement : ce document en entier ; la copie du projet du fichier d'invariants ; `modules\/qualification\/SKILL\.md` ; `modules\/referentiel\/SKILL\.md` ; `socle\/SKILL\.md` ;/);
  assert.match(skill, /les modules `qualification` et `referentiel`, et le référentiel du projet, se lisent à l'ouverture et à l'analyse de chaque ticket, le socle et les référentiels quand un ticket touche leur domaine/);
  for (const a of ARBRES) {
    const o = MESURES.get(a.cle).orchestrateur;
    const racine = [...chargerSkills([a.transmissions]).values()].find((s) => s.reference === s.racine);
    const attendu = [
      ['orchestrateur-c7e : nom et description', annonce(skill).length],
      ['orchestrateur-c7e/SKILL.md', corps(skill).length],
      ['projet/docs/c7e/meso-contrats.md', lireTexte(join(ORCHESTRATEUR, 'meso-contrats.md')).length],
      ...['qualification', 'referentiel'].map((x) => [`orchestrateur-c7e/modules/${x}/SKILL.md`, lireTexte(join(ORCHESTRATEUR, 'modules', x, 'SKILL.md')).length]),
      ['projet/docs/c7e/referentiel-meso-contrats.toml', null],
      [`projet/docs/demandes/${a.cle}/ticket.toml`, racine.fichiers.get('ticket.toml').length],
      ...(a.projet ? [`${a.cle}.feature`, 'us.md'].map((f) => [`projet/docs/demandes/${a.cle}/${f}`, lireTexte(join(a.projet, 'docs', 'demandes', a.cle, f)).length]) : []),
      ['orchestrateur-c7e/socle/SKILL.md', racine.fichiers.get('socle/SKILL.md').length],
      ['orchestrateur-c7e/references/java.md', null],
      ['orchestrateur-c7e/references/angular.md', null],
    ];
    assert.deepStrictEqual(o.au_plus.fichiers.map((f) => f.id), attendu.map(([id]) => id), a.cle);
    assert.deepStrictEqual(o.activation.fichiers, o.au_plus.fichiers.slice(0, 2), a.cle);
    for (const [id, t] of attendu.filter(([, x]) => x !== null)) assert.equal(o.au_plus.fichiers.find((f) => f.id === id).taille, t, `${a.cle} : ${id}`);
    // Le référentiel du projet est le modèle du module referentiel, écrit à l'identique à l'installation.
    const toml = o.au_plus.fichiers.find((f) => f.id === 'projet/docs/c7e/referentiel-meso-contrats.toml');
    assert.ok(lireTexte(join(ORCHESTRATEUR, 'modules', 'referentiel', 'SKILL.md')).includes('<!-- fichier : docs/c7e/referentiel-meso-contrats.toml -->'));
    assert.ok(toml.taille > 10000, `référentiel du projet : ${toml.taille} caractères`);
    for (const c of ['java', 'angular']) assert.ok(o.au_plus.fichiers.find((f) => f.id === `orchestrateur-c7e/references/${c}.md`).taille > 5000, c);
    const total = o.au_plus.fichiers.reduce((s, f) => s + f.taille, 0);
    assert.deepStrictEqual([o.au_plus.caracteres, o.au_plus.tokens], [total, tokens(total)]);
  }
});

// ---- P7 : comparaison de chaque feuille, et de l'arbre entier ----

test('P7 : chaque feuille est comparée au point d\'entrée de l\'orchestrateur, à chaque borne ; l\'arbre entier aussi', () => {
  for (const a of ARBRES) {
    const m = MESURES.get(a.cle);
    const o = m.orchestrateur;
    assert.equal(m.format, FORMAT_MESURE);
    assert.equal(m.caracteres_par_token, CARACTERES_PAR_TOKEN);
    assert.deepStrictEqual(Object.fromEntries(m.noeuds.map((n) => [n.reference, n.contextes.map((c) => c.nom)])), a.contextes, a.cle);
    assert.deepStrictEqual(m.noeuds.filter(estFeuille).map((f) => f.reference), a.feuilles, a.cle);
    assert.deepStrictEqual(m.observateurs.map((c) => c.nom), [2, 3].map((k) => `observateur ticket-${a.cle.toLowerCase()}-observateur-${k}`));
    for (const n of m.noeuds) {
      const [session] = n.contextes;
      const plusGrand = Math.max(...n.contextes.map((c) => c.au_plus.caracteres));
      const somme = n.contextes.reduce((s, c) => s + c.au_plus.caracteres, 0);
      assert.deepStrictEqual(n.rapports, {
        session_activation: ratio(session.activation.caracteres, o.activation.caracteres),
        session_au_plus: ratio(session.au_plus.caracteres, o.au_plus.caracteres),
        plus_grand: ratio(plusGrand, o.au_plus.caracteres),
        somme: ratio(somme, o.au_plus.caracteres),
      }, n.reference);
      assert.deepStrictEqual([n.plus_grand.caracteres, n.somme.caracteres, n.somme.tokens], [plusGrand, somme, tokens(somme)], n.reference);
      for (const c of n.contextes) assert.ok(c.activation.caracteres < c.au_plus.caracteres, `${c.nom} : rien à lire au-delà de l'activation`);
    }
    const tous = contextesDe(m);
    const total = tous.reduce((s, c) => s + c.au_plus.caracteres, 0);
    const plusGrand = Math.max(...tous.map((c) => c.au_plus.caracteres));
    // Relectures : ce que la somme compte en plus d'une lecture de chaque fichier, à sa plus grande taille lue.
    const tailles = new Map();
    for (const c of tous) for (const e of c.au_plus.fichiers) tailles.set(e.id, Math.max(tailles.get(e.id) ?? 0, e.taille));
    const uniques = [...tailles.values()].reduce((s, t) => s + t, 0);
    const { lectures } = m.arbre;
    assert.deepStrictEqual([lectures.uniques.caracteres, lectures.relectures.caracteres, lectures.relectures.part], [uniques, total - uniques, ratio(total - uniques, total)], a.cle);
    assert.equal(lectures.fichiers_relus.reduce((s, f) => s + f.caracteres, 0), total - uniques, a.cle);
    assert.ok(lectures.fichiers_relus.every((f, i, t) => f.contextes > 1 && (i === 0 || t[i - 1].caracteres >= f.caracteres)), `${a.cle} : relectures rangées de la plus lourde à la plus légère`);
    // D7.INV-1 : aucun contexte de l'arbre ne dépasse, au plus, le point d'entrée de l'orchestrateur.
    assert.ok(plusGrand <= o.au_plus.caracteres, `${a.cle} : le plus grand contexte (${plusGrand} car.) dépasse le point d'entrée de l'orchestrateur (${o.au_plus.caracteres} car.)`);
    assert.deepStrictEqual(
      [m.arbre.noeuds, m.arbre.feuilles, m.arbre.contextes, m.arbre.total.caracteres, m.arbre.plus_grand.caracteres, m.arbre.rapports],
      [m.noeuds.length, a.feuilles.length, tous.length, total, plusGrand, { plus_grand: ratio(plusGrand, o.au_plus.caracteres), total: ratio(total, o.au_plus.caracteres) }],
      a.cle,
    );
  }
});

// ---- Citations et sections lues ----

test('citations : modules, chemins, fichier d\'invariants cité sans son chemin, vue d\'un nœud ; ni script, ni dossier, ni chemin absolu', () => {
  const texte = [
    'Lis le module `methode`, puis les modules `vue` et `champ` du skill racine, et les modules `kits`,',
    '`documents` ; puis `docs/c7e/meso-contrats.md`, `ticket.toml`, `.gemini/skills/<skill du sous-ticket>/ticket.toml`,',
    'mais ni `/etc/passwd.md`, ni `docs/demandes/<CLÉ>/`, ni `outils/champ.mjs`, ni `@role-back` ; la copie du projet du fichier d\'invariants ;',
    'enfin `node .gemini/skills/t/outils/vue.mjs generer docs/demandes/K --noeud K-1.2`.',
  ].join('\n');
  const sansTexte = (c) => Object.fromEntries(Object.entries(c).filter(([cle]) => cle !== 'citation'));
  assert.deepStrictEqual(citations(texte).map(sansTexte), [
    { type: 'module', nom: 'methode', racine: false },
    { type: 'module', nom: 'vue', racine: true },
    { type: 'module', nom: 'champ', racine: true },
    { type: 'module', nom: 'kits', racine: false },
    { type: 'module', nom: 'documents', racine: false },
    { type: 'chemin', chemin: 'docs/c7e/meso-contrats.md' },
    { type: 'chemin', chemin: 'ticket.toml' },
    { type: 'chemin', chemin: '.gemini/skills/<skill du sous-ticket>/ticket.toml' },
    { type: 'chemin', chemin: 'docs/c7e/meso-contrats.md' },
    { type: 'vue', noeud: 'K-1.2' },
  ]);
  assert.equal(citations(texte)[1].citation, 'modules `vue` et `champ` du skill racine');
  assert.equal(citations(texte)[3].citation, 'modules `kits`, `documents`', 'une citation coupée à la ligne se lit sur une ligne');
});

test('sections lues : ni la place dans l\'arbre ni la table des fichiers d\'une consigne ; tout le corps d\'un agent', () => {
  const skills = chargerSkills([ARBRES[0].transmissions]);
  const consigne = skills.get('ticket-abcde-3620').fichiers.get('SKILL.md');
  const lu = texteLu(consigne, SECTIONS_LUES);
  assert.doesNotMatch(lu, /^## 1\. Place dans l'arbre$|^## 11\. Fichiers$|^---$/m);
  for (const k of SECTIONS_LUES) assert.match(lu, new RegExp(`^## ${k}\\. `, 'm'), `section ${k}`);
  const agent = skills.get('ticket-abcde-3620').fichiers.get('agents/ticket-abcde-3620-qualite.md');
  assert.equal(texteLu(agent), corps(agent));
});

// ---- Mesure réelle : calibrage sur des sorties de Gemini CLI ----

const sortieGemini = (nom) => JSON.parse(readFileSync(join(GEMINI, `${nom}.json`), 'utf8'));

test('calibrage : tokens du skill tirés de deux sorties -o json de Gemini CLI, et caractères par token', () => {
  assert.deepStrictEqual(tokensGemini(sortieGemini('base')), { requetes: 1, prompt: 9120, cache: 0, total: 9180 });
  const r = calibrer(sortieGemini('base'), sortieGemini('activation'), 23000);
  assert.deepStrictEqual(r.ecarts, []);
  assert.equal(r.tokens_skill, 24080 - 2 * 9120);
  assert.equal(r.caracteres_par_token, Math.round((23000 / 5840) * 100) / 100);
  // Plusieurs modèles dans une session : leurs tokens s'additionnent.
  const deux = sortieGemini('activation');
  deux.stats.models['gemini-2.5-flash'] = structuredClone(deux.stats.models['gemini-2.5-pro']);
  assert.equal(tokensGemini(deux).prompt, 2 * 24080);
});

test('calibrage : deux sessions qui ne se comparent pas sont relevées, une sortie sans stats refusée', () => {
  const base = sortieGemini('base');
  const activation = sortieGemini('activation');
  assert.match(calibrer(activation, activation, 23000).ecarts.join('\n'), /session de base compte 2 requêtes, attendu 1/);
  assert.match(calibrer(base, base, 23000).ecarts.join('\n'), /session d'activation compte 1 requêtes, attendu 2/);
  const sansSkill = structuredClone(activation);
  sansSkill.stats.models['gemini-2.5-pro'].tokens.prompt = 2 * 9120;
  assert.match(calibrer(base, sansSkill, 23000).ecarts.join('\n'), /tokens du skill nuls ou négatifs/);
  assert.equal(calibrer(base, sansSkill, 23000).caracteres_par_token, null);
  assert.throws(() => tokensGemini({ response: 'texte' }), /sans stats\.models : lancer Gemini CLI avec -o json/);
});

// ---- Ligne de commande ----

const executer = (...argv) => {
  const sortie = [];
  const erreur = [];
  const code = principal(argv, (t) => sortie.push(t), (t) => erreur.push(t));
  return { code, sortie: sortie.join('\n'), erreur: erreur.join('\n') };
};

test('ligne de commande : mesurer en Markdown, en JSON, vers un fichier ; calibrer ; codes de sortie', () => {
  const [, a] = ARBRES;
  const m = MESURES.get(a.cle);
  const md = executer('mesurer', a.transmissions);
  assert.equal(md.code, 0, md.erreur);
  assert.equal(`${md.sortie}\n`, rapport(m));
  const json = executer('mesurer', a.transmissions, '--json');
  assert.deepStrictEqual(JSON.parse(json.sortie), m);
  const fichier = join(mkdtempSync(join(tmpdir(), 'contexte-')), 'rapport.md');
  const ecrit = executer('mesurer', join(a.transmissions, 'ticket-abcde-3512-1.0.0.md'), '--sortie', fichier);
  assert.equal(ecrit.code, 0, ecrit.erreur);
  assert.equal(ecrit.sortie, `mesure de ABCDE-3512 : 1 nœud, dont 1 feuille, 10 contextes ; ${fichier}`);
  assert.equal(readFileSync(fichier, 'utf8'), lireTexte(join(EXEMPLES, 'contexte', 'ABCDE-3512.md')));
  const c = executer('calibrer', join(GEMINI, 'base.json'), join(GEMINI, 'activation.json'), '--caracteres', '23000');
  assert.equal(c.code, 0, c.erreur);
  assert.match(c.sortie, /skill : 23000 caractères, environ 5840 tokens, soit 3\.94 caractères par token \(estimation de la mesure statique : 4\)/);
  assert.equal(executer('calibrer', join(GEMINI, 'base.json'), join(GEMINI, 'base.json'), '--caracteres', '23000').code, 1);
  for (const args of [[], ['mesurer'], ['inconnue', a.transmissions], ['mesurer', a.transmissions, '--inconnue'], ['mesurer', a.transmissions, '--projet'], ['calibrer', join(GEMINI, 'base.json')], ['calibrer', join(GEMINI, 'base.json'), join(GEMINI, 'activation.json')], ['calibrer', join(GEMINI, 'base.json'), join(GEMINI, 'activation.json'), '--caracteres', 'zéro']]) {
    assert.equal(executer(...args).code, 2, args.join(' '));
  }
  // Lancé comme script : mêmes codes de sortie.
  assert.equal(spawnSync(process.execPath, [OUTIL], { encoding: 'utf8' }).status, 2);
  const r = spawnSync(process.execPath, [OUTIL, 'calibrer', join(GEMINI, 'base.json'), join(GEMINI, 'activation.json'), '--caracteres', '23000', '--json'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(r.stdout).caracteres_par_token, 3.94);
});
