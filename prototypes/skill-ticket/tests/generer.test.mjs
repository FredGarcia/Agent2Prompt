// Recette du lot 2 : la fabrique et le Monteur produisent un skill par nœud de l'arbre d'essai, chacun
// avec sa transmission tirée par tools/bundle.mjs (critère P2), reprenant tout ce dont il hérite (P3) ;
// un invariant omis ou altéré est rejeté (P1). Au lot 4, le skill racine porte en plus la boîte à outils
// de l'arbre : documents, kits, sous-agents de rôle, références et scripts, à leur version épinglée.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { relire } from '../../../tools/bundle.mjs';
import { lireToml } from '../outils/toml.mjs';
import { RACINE_DEPOT, chargerReferentiel, lireTexte } from '../outils/referentiel.mjs';
import { chargerArbre } from '../outils/arbre.mjs';
import { FabriqueJavaAngularPostgreSQL, FabriqueSkillTicket, SECTIONS_METHODE, nomSkill, phraseActivation, preuvesParametrees, sha256 } from '../outils/fabrique.mjs';
import { Monteur, generer, verifierHeritage, verifierTransmission } from '../outils/monteur.mjs';
import { BOITE, blocDeCode, chargerSources, extraireSection, lignesInvariants, resoudre } from '../outils/sources.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const EXEMPLE = join(ICI, '..', 'exemples', 'ABCDE-3620');
const ATTENDUES = join(ICI, '..', 'exemples', 'ABCDE-3620-skills', 'transmissions');
const OUTIL = join(ICI, '..', 'outils', 'generer.mjs');
const INSTALLATEUR = join(RACINE_DEPOT, 'tools', 'installer.mjs');
const NOMS = ['ticket-abcde-3620', 'ticket-abcde-3620-1', 'ticket-abcde-3620-1-1', 'ticket-abcde-3620-1-2', 'ticket-abcde-3620-2'];
const REGENERER = 'node prototypes/skill-ticket/outils/generer.mjs generer prototypes/skill-ticket/exemples/ABCDE-3620 --sortie prototypes/skill-ticket/exemples/ABCDE-3620-skills';

const temporaire = (prefixe) => mkdtempSync(join(tmpdir(), prefixe));
const attendue = (nom) => lireTexte(join(ATTENDUES, `${nom}-1.0.0.md`));
const fichiersDe = (texte) => new Map(relire(texte).fichiers.map((f) => [f.rel, f.contenu]));
const attendreEcart = (erreurs, motif) => assert.ok(erreurs.some((e) => motif.test(e)), `écart attendu ${motif} ; reçus :\n${erreurs.join('\n') || '(aucun)'}`);
const lancer = (...args) => spawnSync(process.execPath, [OUTIL, ...args], { encoding: 'utf8' });

/** Transmission modifiée puis rendue cohérente : table d'intégrité recalculée, comme le ferait un faussaire soigneux. */
function retoucher(texte, modifier) {
  const fichiers = relire(texte).fichiers.map((f) => ({ ...f }));
  modifier(fichiers);
  const { entete } = relire(texte);
  return [
    `${entete}\n`,
    ...fichiers.map((f) => `\n<<<FICHIER ${f.rel}>>>\n${f.contenu}<<<FIN ${f.rel}>>>\n`),
    "\n---\n\n# Table d'intégrité (sha256)\n\n",
    'Format compatible `sha256sum -c`, à exécuter depuis le dossier où les fichiers ont été matérialisés.\n\n',
    fichiers.map((f) => `    ${sha256(f.contenu)}  ${f.rel}\n`).join(''),
  ].join('');
}
const fichier = (fichiers, rel) => fichiers.find((f) => f.rel === rel);
const majManifeste = (fichiers, modifier) => {
  const m = fichier(fichiers, 'manifest.json');
  const json = JSON.parse(m.contenu);
  modifier(json);
  m.contenu = `${JSON.stringify(json, null, 2)}\n`;
};

// ---- P2 : un skill par nœud, transmissions fidèles et reproductibles ----

let generation;
const genererUneFois = () => {
  if (!generation) {
    const sortie = temporaire('skills-');
    generation = { sortie, ...generer({ arbre: EXEMPLE, sortie }) };
  }
  return generation;
};

test("un skill par nœud de l'arbre, dans l'ordre de l'arbre", () => {
  const { erreurs, skills } = genererUneFois();
  assert.deepStrictEqual(erreurs, []);
  assert.deepStrictEqual(skills.map((s) => s.nom), NOMS);
  assert.deepStrictEqual(skills.map((s) => s.reference), ['ABCDE-3620', 'ABCDE-3620-1', 'ABCDE-3620-1.1', 'ABCDE-3620-1.2', 'ABCDE-3620-2']);
});

test('P2 : chaque transmission est celle attendue, octet pour octet', () => {
  const { skills } = genererUneFois();
  for (const s of skills) {
    assert.ok(s.texte === attendue(s.nom), `${s.nom} : transmission différente de l'attendue ; si le changement est voulu, régénérer : ${REGENERER}`);
  }
  assert.deepStrictEqual(readdirSync(ATTENDUES).sort(), NOMS.map((n) => `${n}-1.0.0.md`).sort());
});

test('P2 : chaque transmission se relit en redonnant exactement les fichiers du skill écrit', () => {
  const { skills, sortie } = genererUneFois();
  for (const s of skills) {
    const relu = relire(s.texte).fichiers;
    assert.deepStrictEqual(relu.map((f) => f.rel), s.fichiers.map((f) => f.rel));
    for (const f of relu) assert.equal(f.contenu, readFileSync(join(sortie, s.nom, ...f.rel.split('/')), 'utf8'), `${s.nom}/${f.rel}`);
  }
});

test('P2 : la même entrée redonne les mêmes fichiers, sans rien tirer au hasard ni dater', () => {
  const a = generer({ arbre: EXEMPLE });
  const b = generer({ arbre: EXEMPLE });
  assert.deepStrictEqual(a.erreurs, []);
  assert.deepStrictEqual(a.skills.map((s) => s.fichiers), b.skills.map((s) => s.fichiers));
  const sortie = temporaire('skills-bis-');
  const c = generer({ arbre: EXEMPLE, sortie });
  assert.deepStrictEqual(c.skills.map((s) => s.texte), genererUneFois().skills.map((s) => s.texte));
});

test('P2 : des tickets en fins de ligne CRLF donnent les mêmes transmissions', () => {
  const dossier = temporaire('arbre-crlf-');
  for (const f of readdirSync(EXEMPLE)) writeFileSync(join(dossier, f), lireTexte(join(EXEMPLE, f)).replace(/\n/g, '\r\n'));
  const { erreurs, skills } = generer({ arbre: dossier, sortie: temporaire('skills-crlf-') });
  assert.deepStrictEqual(erreurs, []);
  for (const s of skills) assert.ok(s.texte === attendue(s.nom), s.nom);
});

// ---- P3 : héritage complet, contrôlé automatiquement ----

const S = chargerSources();

test('P3 : chaque transmission attendue passe le contrôle d\'intégrité et d\'héritage', () => {
  for (const nom of NOMS) assert.deepStrictEqual(verifierTransmission(attendue(nom)).erreurs, [], nom);
});

test('P3 : les 33 invariants de l\'orchestrateur, mot pour mot, dans chaque skill', () => {
  assert.equal(S.orchestrateur.invariants.length, 33);
  for (const nom of NOMS) {
    const invariants = fichiersDe(attendue(nom)).get('modules/invariants/SKILL.md').split('\n');
    for (const l of S.orchestrateur.invariants) assert.ok(invariants.includes(l), `${nom} : ${l.slice(0, 20)}`);
  }
});

test('P3 : sections de la méthode, socle, référentiels de la pile et invariants du projet', () => {
  const references = {
    'ticket-abcde-3620': [], 'ticket-abcde-3620-1': [], 'ticket-abcde-3620-1-1': ['java'], 'ticket-abcde-3620-1-2': ['java'], 'ticket-abcde-3620-2': ['angular'],
  };
  const boite = (nom) => (nom === 'ticket-abcde-3620' ? BOITE.map((b) => b.path) : []);
  for (const nom of NOMS) {
    const f = fichiersDe(attendue(nom));
    const feuille = references[nom].length > 0;
    for (const s of SECTIONS_METHODE[feuille ? 'feuille' : 'compose']) assert.ok(f.get('modules/methode/SKILL.md').includes(extraireSection(S.orchestrateur.texte, s)), `${nom} § ${s}`);
    assert.equal(f.get('socle/SKILL.md'), S.socle.contenu.replace(/\n*$/, '\n'), `${nom} socle`);
    assert.equal(f.get('projet/meso-contrats.md'), S.projet.contenu.replace(/\n*$/, '\n'), `${nom} projet`);
    assert.deepStrictEqual([...f.keys()].filter((r) => r.startsWith('references/')), [...references[nom].map((r) => `references/${r}.md`), ...boite(nom).filter((p) => p.startsWith('references/'))], nom);
    for (const r of references[nom]) assert.equal(f.get(`references/${r}.md`), S.experts[r].contenu.replace(/\n*$/, '\n'));
    const herites = JSON.parse(f.get('manifest.json')).ticket.herites;
    assert.deepStrictEqual(herites.map((h) => h.path), [
      'modules/invariants/SKILL.md', 'modules/methode/SKILL.md', 'socle/SKILL.md', ...references[nom].map((r) => `references/${r}.md`), 'projet/meso-contrats.md', ...boite(nom),
    ]);
  }
});

// ---- P1 : un invariant omis, ou tout autre héritage altéré, est rejeté ----

class FabriqueOublieuse extends FabriqueJavaAngularPostgreSQL {
  invariants(n) {
    const f = super.invariants(n);
    return { ...f, contenu: f.contenu.split('\n').filter((l) => !l.startsWith('- **D5.INV-2** :')).join('\n') };
  }
}

class FabriqueQuiAffaiblit extends FabriqueJavaAngularPostgreSQL {
  invariants(n) {
    const f = super.invariants(n);
    return { ...f, contenu: f.contenu.replace('aucune modification du code', 'peu de modifications du code') };
  }
}

test('P1 : une fabrique qui omet un invariant ne produit rien', () => {
  const sortie = join(temporaire('skills-p1-'), 'sortie');
  const { erreurs } = generer({ arbre: EXEMPLE, sortie, fabrique: FabriqueOublieuse });
  assert.equal(erreurs.filter((e) => /invariant omis ou altéré : D5\.INV-2 /.test(e)).length, NOMS.length);
  assert.equal(existsSync(sortie), false, 'aucun fichier ne doit être écrit');
});

test('P1 : une fabrique qui affaiblit un invariant ne produit rien', () => {
  const { erreurs } = generer({ arbre: EXEMPLE, fabrique: FabriqueQuiAffaiblit });
  attendreEcart(erreurs, /ticket-abcde-3620-1-2 : invariant omis ou altéré : D3\.INV-1 /);
});

const transmissionsAlterees = [
  ['invariant omis, table d\'intégrité recalculée', (fs) => {
    const m = fichier(fs, 'modules/invariants/SKILL.md');
    m.contenu = m.contenu.split('\n').filter((l) => !l.startsWith('- **D10.INV-3** :')).join('\n');
  }, /invariant omis ou altéré : D10\.INV-3 /],
  ['invariant altéré d\'un mot', (fs) => {
    const m = fichier(fs, 'modules/invariants/SKILL.md');
    m.contenu = m.contenu.replace("l'IA ne pousse pas, ne fusionne pas", "l'IA ne pousse pas, fusionne");
  }, /invariant omis ou altéré : D4\.INV-3 /],
  ['nombre d\'invariants déclaré faux', (fs) => majManifeste(fs, (j) => { j.ticket.herites[0].invariants = 32; }), /32 invariants déclarés, 33 dans/],
  ['section de la méthode altérée', (fs) => {
    const m = fichier(fs, 'modules/methode/SKILL.md');
    m.contenu = m.contenu.replace('avant toute implémentation de niveau d=2 (D3.INV-2)', 'si possible avant l\'implémentation');
  }, /section § 5\.1 de la méthode omise ou altérée/],
  ['copie du socle altérée, empreinte du manifeste ajustée', (fs) => {
    const s = fichier(fs, 'socle/SKILL.md');
    s.contenu = s.contenu.replace(/\*\*SC4\.INV-2\*\* : [^\n]*/, '**SC4.INV-2** : sans objet.');
    majManifeste(fs, (j) => { j.ticket.herites.find((h) => h.path === 'socle/SKILL.md').sha256 = sha256(s.contenu); });
  }, /socle\/SKILL\.md : différent de specs\/socle-back-front\/SKILL\.md 1\.1\.0, copie altérée/],
  ['copie du référentiel Java altérée', (fs) => {
    const s = fichier(fs, 'references/java.md');
    s.contenu = s.contenu.replace('Java', 'Kotlin');
  }, /references\/java\.md : empreinte différente de celle du manifeste/],
  ['référentiel de la pile retiré du manifeste', (fs) => majManifeste(fs, (j) => { j.ticket.herites = j.ticket.herites.filter((h) => h.path !== 'references/java.md'); }), /héritage absent du manifeste : references\/java\.md/],
  ['invariants du projet retirés', (fs) => {
    fs.splice(fs.findIndex((f) => f.rel === 'projet/meso-contrats.md'), 1);
  }, /projet\/meso-contrats\.md : fichier hérité absent/],
  ['invariant cité mais défini nulle part', (fs) => {
    const s = fichier(fs, 'SKILL.md');
    s.contenu = s.contenu.replace('(D3.INV-1, la fiche étant ce skill)', '(D3.INV-9, la fiche étant ce skill)');
  }, /SKILL\.md : D3\.INV-9 cité, défini ni par l'orchestrateur ni par le socle/],
  ['ticket d\'un autre nœud', (fs) => {
    fichier(fs, 'ticket.toml').contenu = attendue('ticket-abcde-3620-1-1').match(/<<<FICHIER ticket\.toml>>>\n([\s\S]*?)<<<FIN ticket\.toml>>>/)[1];
  }, /ticket\.toml : référence ABCDE-3620-1\.1, manifeste ABCDE-3620-1\.2/],
];
for (const [nom, modifier, motif] of transmissionsAlterees) {
  test(`P1, P3 : transmission rejetée, ${nom}`, () => {
    attendreEcart(verifierTransmission(retoucher(attendue('ticket-abcde-3620-1-2'), modifier)).erreurs, motif);
  });
}

test('transmission altérée sans recalculer sa table : empreinte fausse', () => {
  const texte = attendue('ticket-abcde-3620-2').replace('Liste des lignes et date-heure', 'Liste des lignes et heure');
  attendreEcart(verifierTransmission(texte).erreurs, /^ticket\.toml : empreinte fausse, transmission altérée$/);
});

test('un manifeste sans provenance n\'est pas un skill de ticket', () => {
  const erreurs = verifierHeritage(new Map([['manifest.json', '{"name":"x","version":"1.0.0"}']]));
  attendreEcart(erreurs, /provenance des héritages absente/);
});

// ---- Fabrique abstraite, Monteur, patron de méthode ----

test('fabrique abstraite : les crochets de la pile restent à définir par une fabrique concrète', () => {
  const R = chargerReferentiel();
  const arbre = chargerArbre(EXEMPLE);
  const abstraite = new FabriqueSkillTicket({ R, arbre, sources: S });
  assert.throws(() => abstraite.nom, /fabrique concrète attendue/);
  assert.throws(() => abstraite.agentDeCouche('backend'), /fabrique concrète attendue/);
  assert.throws(() => FabriqueSkillTicket.referencesRequises(['backend']), /fabrique concrète attendue/);
  assert.deepStrictEqual(FabriqueJavaAngularPostgreSQL.referencesRequises(['persistance']), ['java']);
  assert.deepStrictEqual(FabriqueJavaAngularPostgreSQL.referencesRequises(['frontend']), ['angular']);
  assert.deepStrictEqual(FabriqueJavaAngularPostgreSQL.referencesRequises(['persistance', 'backend', 'frontend']), ['java', 'angular']);
});

test('famille de fichiers : agents de couche pour les feuilles, sous-agents de rôle sur la racine, coordination pour les nœuds composés, une commande par nœud', () => {
  const familles = Object.fromEntries(NOMS.map((nom) => [nom, [...fichiersDe(attendue(nom)).keys()].filter((r) => r.startsWith('agents/') || r.startsWith('commandes/') || r === 'modules/sous-tickets/SKILL.md')]));
  assert.deepStrictEqual(familles, {
    'ticket-abcde-3620': [
      'modules/sous-tickets/SKILL.md', 'agents/ticket-abcde-3620-redacteur.md', 'agents/ticket-abcde-3620-analyste.md',
      'agents/ticket-abcde-3620-relecteur.md', 'agents/ticket-abcde-3620-qualite.md', 'commandes/ticket/abcde-3620.toml',
    ],
    'ticket-abcde-3620-1': ['modules/sous-tickets/SKILL.md', 'commandes/ticket/abcde-3620-1.toml'],
    'ticket-abcde-3620-1-1': ['agents/ticket-abcde-3620-1-1-persistance.md', 'commandes/ticket/abcde-3620-1-1.toml'],
    'ticket-abcde-3620-1-2': ['agents/ticket-abcde-3620-1-2-back.md', 'commandes/ticket/abcde-3620-1-2.toml'],
    'ticket-abcde-3620-2': ['agents/ticket-abcde-3620-2-front.md', 'commandes/ticket/abcde-3620-2.toml'],
  });
});

test('commandes : TOML de Gemini CLI, description et invite qui active le skill du nœud', () => {
  for (const nom of NOMS) {
    const court = nom.replace(/^ticket-/, '');
    const commande = lireToml(fichiersDe(attendue(nom)).get(`commandes/ticket/${court}.toml`), court);
    assert.deepStrictEqual(Object.keys(commande), ['description', 'prompt']);
    assert.match(commande.description, /^Skill de ticket ABCDE-3620/);
    assert.ok(commande.prompt.startsWith(`${phraseActivation(nom)}\n`), nom);
    assert.match(commande.prompt, /\{\{args\}\}/);
    assert.doesNotMatch(phraseActivation(nom), /["%!^&|<>`]/);
  }
});

test('cycle de vie : une session par nœud, ratification de l\'arbre vérifiée, états de la racine', () => {
  const consigne = (nom) => fichiersDe(attendue(nom)).get('SKILL.md');
  assert.match(consigne('ticket-abcde-3620'), /1\. \*\*Documents à rédiger\*\*[^\n]*\n2\. \*\*Arbre non ratifié\*\*[^\n]*\n3\. \*\*Sous-tickets en cours\*\*[^\n]*\n4\. \*\*Tous les sous-tickets clos\*\*/);
  assert.doesNotMatch(consigne('ticket-abcde-3620-1'), /Arbre non ratifié/);
  for (const nom of NOMS.slice(1)) {
    assert.match(consigne(nom), /Vérifie que l'arbre a été ratifié : la ligne `- AAAA-MM-JJ, <nom> : arbre ABCDE-3620 ratifié` figure dans `docs\/demandes\/ABCDE-3620\/retours\.md`/, nom);
  }
  assert.match(consigne('ticket-abcde-3620-1-2'), /Puis renvoie le développeur au skill de ABCDE-3620-1, `\/ticket:abcde-3620-1`, dans une nouvelle session/);
  assert.match(consigne('ticket-abcde-3620-1-2'), /par l'outil `invoke_agent` : `ticket-abcde-3620-1-2-back` \(backend\)/);
  assert.match(fichiersDe(attendue('ticket-abcde-3620-1-2')).get('agents/ticket-abcde-3620-1-2-back.md'), /`\.gemini\/skills\/ticket-abcde-3620-1-2\/modules\/option-backend-representations\/SKILL\.md`/);
});

test('patron de méthode : même squelette de consigne pour tous les nœuds', () => {
  const titres = (nom) => fichiersDe(attendue(nom)).get('SKILL.md').split('\n').filter((l) => l.startsWith('## ')).map((l) => l.replace(/^## \d+\. /, ''));
  const commun = ['Place dans l\'arbre', 'Objectif et critères', 'Méso-contrats et options', 'Au démarrage', 'Ratification', 'Remise', 'Retours du développeur', 'Invariants hérités', 'Fichiers'];
  for (const nom of NOMS) {
    const t = titres(nom);
    assert.equal(t.length, 11, nom);
    for (const c of commun) assert.ok(t.includes(c), `${nom} : ${c}`);
  }
  assert.deepStrictEqual(titres('ticket-abcde-3620-1-2').slice(4, 7), ['Analyse (d=0), avant toute modification', 'Ratification', 'Transformation, après la ratification']);
  assert.deepStrictEqual(titres('ticket-abcde-3620-1').slice(4, 7), ['Coordination', 'Ratification', 'Clôture']);
});

test('ratification : l\'arbre sur la racine, chaque feuille avant sa première action, rien sur un nœud intermédiaire', () => {
  const section = (nom) => /## 6\. Ratification\n\n([^\n]+)/.exec(fichiersDe(attendue(nom)).get('SKILL.md'))[1];
  assert.match(section('ticket-abcde-3620'), /l'arbre complet .* chaque feuille se ratifie encore avant sa première action/);
  assert.match(section('ticket-abcde-3620-1'), /Pas de ratification propre/);
  for (const nom of ['ticket-abcde-3620-1-1', 'ticket-abcde-3620-1-2', 'ticket-abcde-3620-2']) assert.match(section(nom), /\*\*Point de ratification\*\* : rien n'est modifié avant sa réponse \(D3\.INV-1/);
});

test('options copiées puis paramétrées : instances relues à l\'identique, preuves selon les valeurs retenues', () => {
  const arbre = chargerArbre(EXEMPLE);
  const R = chargerReferentiel();
  for (const n of arbre.racine.feuilles()) {
    const f = fichiersDe(attendue(nomSkill(n.reference)));
    for (const { couche, option, instance } of R.instancesOptions(n.ticket)) {
      const module = f.get(`modules/option-${couche}-${option}/SKILL.md`);
      const blocs = [...module.matchAll(/```toml\n([\s\S]*?)```/g)].map((m) => lireToml(m[1], option));
      assert.ok(blocs.some((b) => JSON.stringify(b) === JSON.stringify(instance)), `${n.reference} ${couche}.${option}`);
    }
  }
  const representations = R.options.backend.representations;
  const retenues = preuvesParametrees(representations, [{ selection: 'parametre_vue', exposition_sans_champ: 'base' }]);
  assert.deepStrictEqual(retenues.filter((p) => !p.retenue).map((p) => p.condition), ['negociation_contenu', 'remplacement']);
  const crud = preuvesParametrees(R.options.persistance.crud, [{ operations: ['read', 'delete'] }]);
  assert.deepStrictEqual(crud.filter((p) => !p.retenue).map((p) => p.condition), ['create', 'update']);
});

test('frontmatters : valeurs YAML simples, nom et description du skill pour Gemini CLI', () => {
  for (const nom of NOMS) {
    for (const [rel, contenu] of fichiersDe(attendue(nom))) {
      if (!rel.endsWith('.md') || rel.startsWith('socle/') || rel.startsWith('references/') || rel.startsWith('projet/')) continue;
      const fm = /^---\n([\s\S]*?)\n---\n/.exec(contenu)?.[1];
      assert.ok(fm, `${nom}/${rel} : frontmatter absent`);
      for (const ligne of fm.split('\n')) {
        const m = /^(?:(\w+):(?: (.*))?|  - (\S+))$/.exec(ligne);
        assert.ok(m, `${nom}/${rel} : ligne d'en-tête inattendue, ${ligne}`);
        assert.ok(!/:\s|\s#/.test(m[2] ?? m[3] ?? ''), `${nom}/${rel} : ${ligne} contient « : » ou « # »`);
      }
    }
    const fm = /^---\n([\s\S]*?)\n---\n/.exec(fichiersDe(attendue(nom)).get('SKILL.md'))[1];
    assert.match(fm, new RegExp(`^name: ${nom}$`, 'm'));
    assert.match(fm, /^description: Skill de ticket ABCDE-3620/m);
  }
});

test('le Monteur n\'écrase pas un dossier qui n\'est pas un skill de ticket généré', () => {
  const sortie = temporaire('skills-etranger-');
  mkdirSync(join(sortie, 'ticket-abcde-3620-1'));
  writeFileSync(join(sortie, 'ticket-abcde-3620-1', 'notes.md'), 'à garder\n');
  const { erreurs } = generer({ arbre: EXEMPLE, sortie });
  attendreEcart(erreurs, /ticket-abcde-3620-1 existe et n'est pas un skill de ticket généré : rien n'est remplacé/);
  assert.equal(readFileSync(join(sortie, 'ticket-abcde-3620-1', 'notes.md'), 'utf8'), 'à garder\n');
  assert.equal(existsSync(join(sortie, 'ticket-abcde-3620')), false);
});

test('un arbre non conforme ne donne aucun skill', () => {
  const dossier = temporaire('arbre-faux-');
  for (const f of readdirSync(EXEMPLE)) writeFileSync(join(dossier, f), lireTexte(join(EXEMPLE, f)));
  writeFileSync(join(dossier, 'ABCDE-3620-2.toml'), lireTexte(join(EXEMPLE, 'ABCDE-3620-2.toml')).replace('depend_de = ["ABCDE-3620-1.2"]', 'depend_de = ["ABCDE-3620"]'));
  const sortie = join(temporaire('skills-faux-'), 'sortie');
  const { erreurs } = generer({ arbre: dossier, sortie });
  attendreEcart(erreurs, /dépend de son ancêtre ABCDE-3620/);
  assert.equal(existsSync(sortie), false);
});

test('sous-arbre : une dépendance vers une autre branche devient un préalable de sa coordination', () => {
  const dossier = temporaire('arbre-externe-');
  for (const f of readdirSync(EXEMPLE)) writeFileSync(join(dossier, f), lireTexte(join(EXEMPLE, f)));
  const modifier = (f, de, vers) => {
    const texte = lireTexte(join(dossier, f));
    assert.ok(texte.includes(de), `${f} : ${de}`);
    writeFileSync(join(dossier, f), texte.replace(de, vers));
  };
  modifier('ABCDE-3620-2.toml', 'depend_de = ["ABCDE-3620-1.2"]', 'depend_de = []');
  modifier('ABCDE-3620-1.1.toml', 'parent = "ABCDE-3620-1"', 'parent = "ABCDE-3620-1"\ndepend_de = ["ABCDE-3620-2"]');
  const { erreurs, skills } = generer({ arbre: dossier });
  assert.deepStrictEqual(erreurs, []);
  const module = skills.find((s) => s.nom === 'ticket-abcde-3620-1').fichiers.find((f) => f.rel === 'modules/sous-tickets/SKILL.md').contenu;
  assert.match(module, /1\. ABCDE-3620-1\.1 : résoudre[^\n]*\n2\. ABCDE-3620-1\.2 : résoudre[^\n]*\n3\. ABCDE-3620-1 : clore/);
  assert.match(module, /Préalables extérieurs à ce sous-arbre :\n\n- ABCDE-3620-1\.1 attend la clôture de ABCDE-3620-2\n/);
  const racine = skills.find((s) => s.nom === 'ticket-abcde-3620').fichiers.find((f) => f.rel === 'modules/sous-tickets/SKILL.md').contenu;
  assert.match(racine, /1\. ABCDE-3620-2 : résoudre/);
  assert.doesNotMatch(racine, /Préalables extérieurs/);
});

test('le Monteur construit un nœud isolé comme un ticket sans sous-ticket', () => {
  const R = chargerReferentiel();
  const arbre = chargerArbre(EXEMPLE);
  const monteur = new Monteur(new FabriqueJavaAngularPostgreSQL({ R, arbre, sources: S }));
  const feuille = arbre.parReference.get('ABCDE-3620-1.1');
  const { nom, fichiers } = monteur.construire(feuille);
  assert.equal(nom, 'ticket-abcde-3620-1-1');
  assert.deepStrictEqual(verifierHeritage(new Map(fichiers.map((f) => [f.rel, f.contenu]))), []);
  assert.equal(lignesInvariants(fichiers.find((f) => f.rel === 'modules/invariants/SKILL.md').contenu).length, 33);
});

// ---- Lot 4 : boîte à outils de la racine, documents, kits, sous-agents de rôle ----

test('lot 4 : la racine porte la boîte à outils, chaque fichier identique à sa source à sa version épinglée', () => {
  const orchestrateur = JSON.parse(lireTexte(join(RACINE_DEPOT, 'specs', 'orchestrateur-c7e', 'manifest.json')));
  const tdd = JSON.parse(lireTexte(join(RACINE_DEPOT, 'specs', 'agent-tdd-jira', 'manifest.json')));
  const v = S.boite.versions;
  assert.equal(v['agent-tdd-jira'], orchestrateur.references.find((r) => r.name === 'agent-tdd-jira').version);
  assert.equal(v.agent2test, tdd.references.find((r) => r.name === 'agent2test').version);
  const f = fichiersDe(attendue('ticket-abcde-3620'));
  const herites = new Map(JSON.parse(f.get('manifest.json')).ticket.herites.map((h) => [h.path, h]));
  for (const b of S.boite.fichiers) {
    assert.equal(f.get(b.path), b.contenu.replace(/\n*$/, '\n'), b.path);
    assert.equal(herites.get(b.path).from, b.from, b.path);
    assert.equal(herites.get(b.path).sha256, sha256(f.get(b.path)), b.path);
  }
  assert.deepStrictEqual(herites.get('references/agent-tdd-jira/binome-agent2test.md').sections, ['3', '4']);
  assert.deepStrictEqual(herites.get('references/agent2test/remise.md').sections, ['3']);
  assert.deepStrictEqual(herites.get('outils/controler-criteres.mjs').bloc, { section: '7', langage: 'js' });
  const usCriteres = resoudre({ from: 'specs/agent-tdd-jira/modules/us-criteres/SKILL.md', version: v['agent-tdd-jira'] });
  assert.equal(f.get('outils/controler-criteres.mjs'), blocDeCode(usCriteres, '7', 'js'));
  assert.equal(f.get('outils/verifier-kits.mjs'), lireTexte(join(ICI, '..', 'outils', 'verifier-kits.mjs')));
  for (const nom of NOMS.slice(1)) assert.ok(![...fichiersDe(attendue(nom)).keys()].some((r) => r.startsWith('outils/') || r.includes('agent-tdd-jira')), nom);
});

test('lot 4 : rattachement des critères de l\'arbre aux critères d\'acceptation de la clé', () => {
  const r = JSON.parse(fichiersDe(attendue('ticket-abcde-3620')).get('outils/rattachement.json'));
  assert.equal(r.format, 'skill-ticket.rattachement/1');
  assert.deepStrictEqual(r.criteres.map((c) => `${c.ca}=${c.critere}`), [1, 2, 3, 4, 5].map((k) => `ABCDE-3620-CA0${k}=ABCDE-3620:C${k}`));
  assert.deepStrictEqual(r.criteres.map((c) => c.enonce), chargerArbre(EXEMPLE).racine.criteres.map((c) => c.enonce));
  assert.deepStrictEqual(Object.fromEntries(r.noeuds.map((n) => [n.reference, `${n.nature} ${n.etiquettes.join(',') || '-'} ${n.criteres.map((c) => `${c.id}=${c.ca.join('+')}`).join(' ')}`])), {
    'ABCDE-3620-1': 'composé - C1=ABCDE-3620-CA01 C2=ABCDE-3620-CA02 C3=ABCDE-3620-CA03 C4=ABCDE-3620-CA04 C5=ABCDE-3620-CA05',
    'ABCDE-3620-1.1': 'feuille @back C1=ABCDE-3620-CA04 C2=ABCDE-3620-CA03',
    'ABCDE-3620-1.2': 'feuille @back C1=ABCDE-3620-CA01 C2=ABCDE-3620-CA02 C3=ABCDE-3620-CA03 C4=ABCDE-3620-CA05',
    'ABCDE-3620-2': 'feuille @front C1=ABCDE-3620-CA05 C2=ABCDE-3620-CA05',
  });
  assert.match(fichiersDe(attendue('ticket-abcde-3620-2')).get('SKILL.md'), /\| C1 \| [^|]+ \| ABCDE-3620:C5 \| ABCDE-3620-CA05 \|/);
});

test('lot 4 : sous-agents de rôle en lecture seule, sauf le rédacteur ; références lues dans le skill racine installé', () => {
  const f = fichiersDe(attendue('ticket-abcde-3620'));
  const agent = (role) => f.get(`agents/ticket-abcde-3620-${role}.md`);
  const outils = (role) => /^tools:\n((?: {2}- \S+\n)+)/m.exec(agent(role))[1].trim().split('\n').map((l) => l.trim().replace(/^- /, ''));
  assert.ok(outils('redacteur').includes('write_file'));
  for (const role of ['analyste', 'relecteur', 'qualite']) assert.ok(!outils(role).includes('write_file') && !outils(role).includes('replace'), role);
  const references = {
    redacteur: ['references/agent-tdd-jira/us-criteres.md', 'outils/extraire-jira.mjs', 'modules/documents/SKILL.md'],
    analyste: ['references/analyse-projet/cartographie.md'],
    relecteur: ['references/java/revue.md', 'references/angular/revue.md'],
    qualite: ['references/sonarqube/examen-local.md'],
  };
  for (const [role, liste] of Object.entries(references)) {
    for (const rel of liste) {
      assert.ok(agent(role).includes(`\`.gemini/skills/ticket-abcde-3620/${rel}\``), `${role} : ${rel}`);
      assert.ok(f.has(rel), rel);
    }
  }
  assert.match(agent('qualite'), /Tu ne demandes jamais au développeur de coller un jeton/);
  assert.match(agent('qualite'), /variable d'environnement `SONAR_TOKEN`/);
  const feuille = fichiersDe(attendue('ticket-abcde-3620-1-1'));
  for (const role of ['analyste', 'relecteur', 'qualite']) assert.match(feuille.get('SKILL.md'), new RegExp(`sous-agent \`ticket-abcde-3620-${role}\``), role);
  const couche = feuille.get('agents/ticket-abcde-3620-1-1-persistance.md');
  assert.ok(couche.includes('`.gemini/skills/ticket-abcde-3620/references/agent-tdd-jira/cycle-tdd.md`'));
  assert.ok(couche.includes('(`@ABCDE-3620-CA03`, `@ABCDE-3620-CA04`) et l\'étiquette `@back`'));
  assert.ok(couche.includes('`@Tag("ABCDE-3620-Snn")`'));
});

test('lot 4 : documents de la clé avant la ratification de l\'arbre, kits à sa clôture', () => {
  const f = fichiersDe(attendue('ticket-abcde-3620'));
  assert.ok(f.get('modules/documents/SKILL.md').includes('node .gemini/skills/ticket-abcde-3620/outils/controler-criteres.mjs docs/demandes/ABCDE-3620\n'));
  assert.ok(f.get('modules/documents/SKILL.md').includes('verifier-documents.mjs docs/demandes/ABCDE-3620 --rattachement .gemini/skills/ticket-abcde-3620/outils/rattachement.json\n'));
  assert.ok(f.get('modules/kits/SKILL.md').includes('verifier-kits.mjs docs/demandes/ABCDE-3620 --rattachement .gemini/skills/ticket-abcde-3620/outils/rattachement.json --depot\n'));
  assert.match(f.get('SKILL.md'), /## 6\. Ratification\n\n[^\n]*les documents de la clé, qui se ratifient avec lui/);
  assert.match(f.get('SKILL.md'), /## 7\. Clôture\n\n[^\n]*\n\nPuis assemble les kits dev, test et démo et la remise à Agent2Test/);
  assert.match(fichiersDe(attendue('ticket-abcde-3620-2')).get('SKILL.md'), /sous le titre « Contributions aux kits »[^\n]*captures de l'écran livré/);
});

const boiteAlteree = (v) => [
  ['script d\'agent-tdd-jira altéré, empreinte du manifeste ajustée', (fs) => {
    const s = fichier(fs, 'outils/controler-criteres.mjs');
    s.contenu = s.contenu.replace('process.exit(ecarts.length ? 1 : 0);', 'process.exit(0);');
    majManifeste(fs, (j) => { j.ticket.herites.find((h) => h.path === 'outils/controler-criteres.mjs').sha256 = sha256(s.contenu); });
  }, new RegExp(`outils/controler-criteres\\.mjs : différent du bloc js du § 7 de specs/agent-tdd-jira/modules/us-criteres/SKILL\\.md ${v['agent-tdd-jira'].replace(/\./g, '\\.')}, copie altérée`)],
  ['extrait d\'agent-tdd-jira altéré', (fs) => {
    const s = fichier(fs, 'references/agent-tdd-jira/binome-agent2test.md');
    s.contenu = s.contenu.replace('Agent2Test en décide', 'l\'agent en décide');
  }, /section § 4 de references\/agent-tdd-jira\/binome-agent2test\.md omise ou altérée/],
  ['script de contrôle des kits retiré du manifeste', (fs) => majManifeste(fs, (j) => {
    j.ticket.herites = j.ticket.herites.filter((h) => h.path !== 'outils/verifier-kits.mjs');
  }), /héritage absent du manifeste : outils\/verifier-kits\.mjs/],
  ['module d\'un skill déclaré à une version que le dépôt n\'a pas', (fs) => majManifeste(fs, (j) => {
    j.ticket.herites.find((h) => h.path === 'references/agent-tdd-jira/cycle-tdd.md').version = '0.0.1';
  }), /references\/agent-tdd-jira\/cycle-tdd\.md : source introuvable \(specs\/agent-tdd-jira\/modules\/cycle-tdd\/SKILL\.md en version 0\.0\.1 : le dépôt porte agent-tdd-jira [\d.]+, et n'archive pas ses modules\)/],
  ['invariant d\'un autre skill cité sans le nom de son skill', (fs) => {
    const s = fichier(fs, 'modules/documents/SKILL.md');
    s.contenu = s.contenu.replace('(agent-tdd-jira:D10.INV-4)', '(D10.INV-9)');
  }, /modules\/documents\/SKILL\.md : D10\.INV-9 cité, défini ni par l'orchestrateur ni par le socle/],
];
for (const [nom, modifier, motif] of boiteAlteree(S.boite.versions)) {
  test(`lot 4 : transmission de la racine rejetée, ${nom}`, () => {
    attendreEcart(verifierTransmission(retoucher(attendue('ticket-abcde-3620'), modifier)).erreurs, motif);
  });
}

// ---- Ligne de commande et installateur ----

test('ligne de commande : generer, puis verifier, codes de sortie', () => {
  const sortie = temporaire('skills-cli-');
  const g = lancer('generer', EXEMPLE, '--sortie', sortie);
  assert.equal(g.status, 0, g.stderr);
  assert.match(g.stdout, /5 skills de ticket dans .* orchestrateur-c7e \d+\.\d+\.\d+ \(33 invariants\)/);
  const v = lancer('verifier', join(sortie, 'transmissions'));
  assert.equal(v.status, 0, v.stderr);
  assert.equal(v.stdout.trim().split('\n').length, 5);
  const fausse = join(sortie, 'fausse.md');
  writeFileSync(fausse, retoucher(attendue('ticket-abcde-3620'), (fs) => {
    const m = fichier(fs, 'modules/invariants/SKILL.md');
    m.contenu = m.contenu.split('\n').filter((l) => !l.startsWith('- **D6.INV-3** :')).join('\n');
  }));
  const r = lancer('verifier', fausse);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /invariant omis ou altéré : D6\.INV-3/);
  assert.equal(lancer('generer', EXEMPLE).status, 2);
  assert.equal(lancer('generer', EXEMPLE, '--sortie', sortie, '--fabrique', 'cobol').status, 2);
  assert.equal(lancer('inconnue').status, 2);
});

test("l'installateur du dépôt accepte chaque transmission produite", () => {
  const workspace = temporaire('workspace-');
  for (const nom of NOMS) {
    const r = spawnSync(process.execPath, [INSTALLATEUR, join(ATTENDUES, `${nom}-1.0.0.md`), '--workspace', workspace], { encoding: 'utf8' });
    assert.equal(r.status, 0, `${nom} : ${r.stderr}`);
    assert.ok(existsSync(join(workspace, '.gemini', 'skills', nom, 'integrite.sha256')), nom);
  }
  rmSync(workspace, { recursive: true, force: true });
});
