/**
 * Recette de `tools/verifier.mjs` : `node --test tools/verifier.test.mjs`, Node 20 ou plus récent.
 *
 * Le vérificateur se lance, comme en CI, sur une copie du dépôt, dans un dossier temporaire hors de Git :
 * il y lit le disque à la place de `git ls-files`. Chaque test altère des fichiers de la copie, lance le
 * vérificateur, attend les erreurs nommées, puis rend les fichiers. La recette porte sur le préfixe `SA` du
 * socle de l'acceptable, sur son bloc `noyau`, sur les constitutions qui l'épinglent, sur les manifestes de kit
 * `socle-acceptable.kit/1`, sur le catalogue des signaux d'`EVOLUTION.md`, sur les formes propres, que révise sa
 * section 10.7, et sur les examens et les ratifications de l'observatoire ; elle tourne dans
 * `.github/workflows/verifier.yml`.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const RACINE = dirname(dirname(fileURLToPath(import.meta.url)));
// Ce que lit le vérificateur : spécifications, transmissions, propositions de l'observatoire, README, EVOLUTION.md, glossaire.
const A_COPIER = ['tools', 'specs', 'transmissions', 'observatoire', 'README.md', 'EVOLUTION.md', 'glossaire.md', '.geminiignore'];
const SOCLE = 'specs/socle-acceptable/SKILL.md';
const lf = (texte) => texte.replace(/\r\n/g, '\n');
// Version courante d'une spécification, lue dans son manifeste : les tests suivent les versions sans être réécrits.
const manifesteDe = (nom) => JSON.parse(readFileSync(join(RACINE, 'specs', nom, 'manifest.json'), 'utf8'));
const versionDe = (nom) => manifesteDe(nom).version;
// Version précédente, la dernière archivée : celle à laquelle se comparent les formes propres.
const precedenteDe = (nom) => manifesteDe(nom).previousVersions.at(-1).version;
const VA = versionDe('socle-acceptable');
const motif = (texte) => texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Ajoute, en tête de l'entrée du journal de la version courante d'un point d'entrée, le texte donné. */
const auJournal = (version, ajout) => (texte) => texte.replace(new RegExp(`^(\\*\\*${motif(version)}\\*\\* \\([^)]*\\) : )`, 'm'), `$1${ajout}`);
let copie;

before(() => {
  copie = mkdtempSync(join(tmpdir(), 'verifier-'));
  for (const chemin of A_COPIER) cpSync(join(RACINE, chemin), join(copie, chemin), { recursive: true });
});
after(() => rmSync(copie, { recursive: true, force: true }));

const verifier = () => spawnSync(process.execPath, [join(copie, 'tools', 'verifier.mjs')], { cwd: copie, encoding: 'utf8' });

/** Remplace, dans le texte, chaque `[avant, après]` présent exactement une fois. */
function remplacer(...paires) {
  return (texte) =>
    paires.reduce((t, [avant, apres]) => {
      assert.equal(t.split(avant).length - 1, 1, `« ${avant} » doit figurer une fois`);
      return t.replace(avant, apres);
    }, texte);
}

/** Écrit dans la copie des fichiers nouveaux (chemin relatif → texte), lance `faire`, puis les retire. */
function avecFichiers(fichiers, faire) {
  try {
    for (const [rel, texte] of Object.entries(fichiers)) {
      mkdirSync(dirname(join(copie, rel)), { recursive: true });
      writeFileSync(join(copie, rel), texte);
    }
    return faire();
  } finally {
    for (const rel of Object.keys(fichiers)) rmSync(join(copie, rel), { force: true });
  }
}

/** Altère des fichiers de la copie (chemin relatif → transformation du texte en LF), lance le vérificateur, rend les fichiers. */
function alterer(alterations) {
  const originaux = new Map();
  try {
    for (const [rel, transformer] of Object.entries(alterations)) {
      const chemin = join(copie, rel);
      const original = readFileSync(chemin, 'utf8');
      originaux.set(chemin, original);
      const altere = transformer(lf(original));
      assert.notEqual(altere, lf(original), `${rel} : l'altération ne change rien`);
      writeFileSync(chemin, altere);
    }
    return verifier();
  } finally {
    for (const [chemin, original] of originaux) writeFileSync(chemin, original);
  }
}

function attendreErreurs(resultat, messages) {
  assert.equal(resultat.status, 1, `le vérificateur devait échouer :\n${resultat.stdout}`);
  for (const message of messages) assert.ok(resultat.stderr.includes(`ERREUR  ${message}`), `erreur attendue : ${message}\n${resultat.stderr}`);
}

test('la copie du dépôt passe le vérificateur, et le socle de l’acceptable y est vérifié', () => {
  const resultat = verifier();
  assert.equal(resultat.status, 0, resultat.stderr);
  assert.match(resultat.stdout, /^ok {2}socle-acceptable \d+\.\d+\.\d+ : 0 modules, \d+ invariants$/m);
});

test('SA : un invariant cité sans être défini est signalé, préfixé ou non, et le glossaire suit ses énoncés', () => {
  const resultat = alterer({
    [SOCLE]: remplacer(
      ['## 15. Journal de révision\n', '## 15. Journal de révision\n\nVoir SA9.INV-1.\n'],
      ['- **SA4.INV-1** : aucun secret,', '- **SA4.INV-1** : jamais aucun secret,'],
    ),
    'specs/agent2dev/SKILL.md': remplacer(['# Agent2Dev', '# Agent2Dev\n\nSelon socle-acceptable:SA1.INV-9.']),
  });
  attendreErreurs(resultat, [
    "socle-acceptable : SA9.INV-1 est cité mais n'est défini ni dans le point d'entrée ni dans un fichier partagé",
    "agent2dev : socle-acceptable:SA1.INV-9 est cité mais n'est pas défini dans specs/socle-acceptable/SKILL.md",
    "glossaire.md : n'est plus à jour, lancer node tools/glossaire.mjs",
  ]);
});

test('bloc noyau : schéma fermé, entrées aux seules clés de leur liste, sans doublon, motifs valides, règles du socle', () => {
  const resultat = alterer({
    [SOCLE]: remplacer(
      ['"schema": "socle-acceptable.noyau/1",', '"schema": "socle-acceptable.noyau/1",\n  "exceptions": [],'],
      ['{ "intention": "deployer", "horsKit": true, "regle": "SA1.INV-1" }', '{ "intention": "deployer", "horsKit": true, "regle": "SA1.INV-9" }'],
      ['{ "intention": "administrer", "horsKit": true, "regle": "SA1.INV-1" }', '{ "intention": "administrer", "horsKit": false, "regle": "D1.INV-5" }'],
      ['{ "programme": "kubectl", "horsKit": true, "regle": "SA2.INV-1" }', '{ "programme": "docker", "horsKit": true, "regle": "SA2.INV-1" }'],
      ['{ "lieu": "fiches", "regle": "SA3.INV-1" }', '{ "lieu": "fiches", "motif": "fiches/", "regle": "SA3.INV-1" }'],
      ['"secrets": [', '"secret": ['],
      ['{ "motif": "--force|--no-verify", "regle": "SA2.INV-2" }', '{ "motif": "(--force", "regle": "SA2.INV-2" }'],
    ),
  });
  attendreErreurs(resultat, [
    'socle-acceptable : bloc noyau : clé exceptions, hors du schéma socle-acceptable.noyau/1',
    'socle-acceptable : bloc noyau : intentionsRefusees[0] : regle SA1.INV-9, qui n\'est pas définie dans le socle',
    "socle-acceptable : bloc noyau : intentionsRefusees[1] : horsKit, s'il figure, vaut true",
    'socle-acceptable : bloc noyau : intentionsRefusees[1] : regle D1.INV-5, un invariant SAn.INV-k attendu',
    'socle-acceptable : bloc noyau : programmesInterdits[1] : programme docker en double',
    'socle-acceptable : bloc noyau : ecrituresInterdites[2] : clé motif, hors de lieu, horsKit et regle',
    'socle-acceptable : bloc noyau : clé secret, hors du schéma socle-acceptable.noyau/1',
    'socle-acceptable : bloc noyau : liste secrets absente ou vide',
    'socle-acceptable : bloc noyau : leconsInterdites[2] : motif invalide',
  ]);
});

test('constitutions qui épinglent le noyau : version incluse, empreinte du bloc, chaque entrée reprise à l\'identique, aucune dérogeable', () => {
  const EMPREINTE = '"empreinte": "e815cadf230886d507d56dbbfb5d7cfd0cf3982036d54d0279b70cc8f49b4764"';
  const resultat = alterer({
    'specs/agent2dev/modules/noyau/SKILL.md': remplacer(
      [EMPREINTE, `"empreinte": "${'0'.repeat(64)}"`],
      ['{ "programme": "docker", "horsKit": true, "regle": "SA2.INV-1" }', '{ "programme": "docker", "horsKit": true, "regle": "SA2.INV-1", "derogeable": true }'],
    ),
    'specs/agent2test/modules/noyau/SKILL.md': remplacer(['    { "intention": "administrer", "horsKit": true, "regle": "SA1.INV-1" },\n', '']),
    'specs/agent2test/modules/acceptable/SKILL.md': remplacer([`"version": "${VA}", ${EMPREINTE}`, `"version": "1.0.0", ${EMPREINTE}`]),
  });
  attendreErreurs(resultat, [
    `agent2dev : constitution : acceptable.empreinte 000000000000…, le bloc noyau de socle-acceptable ${VA} a l'empreinte e815cadf2308…`,
    'agent2dev : constitution : programmesInterdits, l\'entrée du noyau docker n\'est pas reprise à l\'identique',
    'agent2test : constitution : intentionsRefusees, l\'entrée du noyau administrer n\'est pas reprise à l\'identique',
    `agent2test : constitution : acceptable.version 1.0.0, la spécification inclut socle-acceptable ${VA}`,
  ]);
});

test('bloc noyau : un seul, en JSON lisible', () => {
  attendreErreurs(alterer({ [SOCLE]: remplacer(['"schema": "socle-acceptable.noyau/1",', '"schema": "socle-acceptable.noyau/1"']) }), [
    'socle-acceptable : bloc noyau : JSON illisible',
  ]);
  attendreErreurs(alterer({ [SOCLE]: remplacer(['"schema": "socle-acceptable.noyau/1",', '"schema": "socle-acceptable.noyau/2",']) }), [
    'socle-acceptable : bloc noyau : 0 blocs JSON au schéma socle-acceptable.noyau/1, un seul attendu',
  ]);
});

test('manifestes de kit : schéma fermé, système et environnement, patch, noyau confronté à la version incluse, retour arrière préparé', () => {
  const NOYAU = `"noyau": { "version": "${VA}", "empreinte": "e815cadf230886d507d56dbbfb5d7cfd0cf3982036d54d0279b70cc8f49b4764" },`;
  const resultat = alterer({
    'specs/agent2dev/modules/kit/SKILL.md': remplacer(
      ['  "environnement": "dev",\n', '  "environnement": "production",\n'],
      ['"chemin": "../patchs/002-S02.patch", "empreinte": "54b440c3', '"chemin": "../patchs/002-S02.patch", "empreinte": "54B440C3'],
      ['"confrontation": { "fichiers": 3, "commandes": 0 }', '"confrontation": { "fichiers": 3, "commandes": -1 }'],
      ['"retourArriere": { "prepare": true, "verifie": false }', '"retourArriere": { "prepare": false, "verifie": "non" }'],
    ),
    'specs/agent2test/modules/kit/SKILL.md': remplacer(
      [`"systeme": { "nom": "agent2test", "version": "${versionDe('agent2test')}" },`, '"systeme": { "nom": "agent2test", "version": "1.5.1" },\n  "application": "manuelle",'],
      [NOYAU, NOYAU.replace(VA, '1.0.1')],
    ),
    [SOCLE]: remplacer(
      ['"patch": { "chemin": "../patchs/002-S02.patch",', '"patch": { "chemin": "/tmp/002-S02.patch",'],
      [NOYAU, `"noyau": { "version": "${VA}", "empreinte": "${'0'.repeat(64)}" },`],
      ['  "confrontation": { "fichiers": 3, "commandes": 0 },\n', ''],
    ),
  });
  attendreErreurs(resultat, [
    'agent2dev : manifeste de kit agent2dev : environnement production, dev, test, demo attendu',
    'agent2dev : manifeste de kit agent2dev : patch.empreinte, 64 caractères hexadécimaux en minuscules attendus',
    'agent2dev : manifeste de kit agent2dev : confrontation.commandes -1, un entier positif ou nul attendu',
    'agent2dev : manifeste de kit agent2dev : retourArriere.prepare vaut true : un kit porte son retour arrière (socle-acceptable:SA2.INV-3)',
    'agent2dev : manifeste de kit agent2dev : retourArriere.verifie non, true ou false attendu',
    'agent2test : manifeste de kit agent2test : clé application, hors du schéma socle-acceptable.kit/1',
    `agent2test : manifeste de kit agent2test : systeme.version 1.5.1, la spécification est en version ${versionDe('agent2test')}`,
    `agent2test : manifeste de kit agent2test : noyau.version 1.0.1, agent2test inclut socle-acceptable ${VA}`,
    'socle-acceptable : manifeste de kit agent2dev : patch.chemin /tmp/002-S02.patch, un chemin relatif au manifeste attendu',
    `socle-acceptable : manifeste de kit agent2dev : noyau.empreinte 000000000000…, le bloc noyau de socle-acceptable ${VA} a l'empreinte e815cadf2308…`,
    'socle-acceptable : manifeste de kit agent2dev : clé confrontation absent',
  ]);
});

test('manifestes de kit : un système hors du dépôt, ou qui n’inclut pas le socle de l’acceptable', () => {
  attendreErreurs(
    alterer({ [SOCLE]: remplacer(['"systeme": { "nom": "agent2dev", "version": "1.4.0" },', '"systeme": { "nom": "agent2prod", "version": "1.4" },']) }),
    ["socle-acceptable : manifeste de kit agent2prod : systeme.nom agent2prod, qui n'est pas une spécification du dépôt", 'socle-acceptable : manifeste de kit agent2prod : systeme.version 1.4, une version X.Y.Z attendue'],
  );
  attendreErreurs(
    alterer({ [SOCLE]: remplacer(['"systeme": { "nom": "agent2dev", "version": "1.4.0" },', '"systeme": { "nom": "java", "version": "1.1.1" },']) }),
    ["socle-acceptable : manifeste de kit java : java n'inclut pas socle-acceptable (shared) : aucun noyau à confronter"],
  );
});

test('catalogue des signaux : une ligne par clause de second ordre ; nature de la liste ; signal, statut, lieu et lecture pour un effet sur des personnes, aucun signal sinon', () => {
  const resultat = alterer({
    'EVOLUTION.md': remplacer(
      ['| `java` | effet sur des personnes | constats et préférences contestés en revue | non mesuré | — | les constats acceptés |\n', ''],
      ['| `angular` | précaution d\'observateur |', '| `angular` | effet esthétique |'],
      ['| faux positifs, acceptations, suppressions et exclusions | mesuré |', '| faux positifs, acceptations, suppressions et exclusions | estimé |'],
      ['`tension-dashboard-gitlab-agent:D5.INV-1`', '`tension-dashboard-gitlab-agent:D5.INV-9`'],
      ['| disponible | `capture-sprint-jira:D11.INV-2` | les tickets classés |', '| disponible | `capture-sprint-jira:D11.INV-2` | — |'],
      ['| recommandations retenues ou écartées | non mesuré | — |', '| recommandations retenues ou écartées | non mesuré | `specs/analyse-projet/SKILL.md` |'],
      ['| `agent2dev` | structure du second ordre | — |', '| `agent2dev` | structure du second ordre | leçons ratifiées |'],
      ['| décisions en attente et délai de décision aux points de validation d\'Agent2Dev | exporté | `observatoire:D10.INV-1` |', '| décisions en attente et délai de décision aux points de validation d\'Agent2Dev | exporté | `specs/agents-paralleles-gitlab/absent.md` |'],
      ['| `skill4appli` | effet sur l\'observateur | — | — | — | — |\n', '| `skill4appli` | effet sur l\'observateur | — | — | — | — |\n| `socle-observation` | structure du second ordre | — | — | — | — |\n| `skill4appli` | effet sur l\'observateur | — | — | — | — |\n'],
    ),
    'specs/observatoire/SKILL.md': remplacer(['## 1. Lecture', 'Clause de second ordre : l\'observatoire fait partie de l\'écosystème qu\'il observe.\n\n## 1. Lecture']),
  });
  attendreErreurs(resultat, [
    "EVOLUTION.md : catalogue des signaux : java : sa clause de second ordre n'a pas de ligne",
    "EVOLUTION.md : catalogue des signaux : angular : nature « effet esthétique », hors de la liste : effet sur des personnes, structure du second ordre, effet sur l'observateur, précaution d'observateur",
    'EVOLUTION.md : catalogue des signaux : sonarqube : statut « estimé », hors de la liste : exporté, mesuré, disponible, non mesuré',
    "EVOLUTION.md : catalogue des signaux : tension-dashboard-gitlab-agent : lieu tension-dashboard-gitlab-agent:D5.INV-9, invariant qui n'est pas défini",
    'EVOLUTION.md : catalogue des signaux : capture-sprint-jira : signal lu seul, sans ce avec quoi il se lit',
    "EVOLUTION.md : catalogue des signaux : analyse-projet : un signal non mesuré n'a pas de lieu, « — »",
    "EVOLUTION.md : catalogue des signaux : agent2dev : une clause de nature « structure du second ordre » n'a pas de signal, « — » dans chaque colonne",
    'EVOLUTION.md : catalogue des signaux : agents-paralleles-gitlab : lieu « `specs/agents-paralleles-gitlab/absent.md` », un invariant préfixé par sa spécification ou un fichier du dépôt attendu',
    "EVOLUTION.md : catalogue des signaux : socle-observation : aucune clause de second ordre dans son point d'entrée",
    'EVOLUTION.md : catalogue des signaux : skill4appli : deux lignes',
    "EVOLUTION.md : catalogue des signaux : observatoire : sa clause de second ordre n'a pas de ligne",
  ]);
});

test('formes propres : le noyau ne perd, ne change ni ne rend permise dans un kit aucune entrée de sa version archivée ; un changement dit sa migration', () => {
  const PA = precedenteDe('socle-acceptable');
  const OC = '    { "programme": "oc", "horsKit": true, "regle": "SA2.INV-1" },\n';
  const resultat = alterer({
    [SOCLE]: remplacer(
      [OC, ''],
      ['{ "argument": "--force", "regle": "SA2.INV-2" }', '{ "argument": "--force", "horsKit": true, "regle": "SA2.INV-2" }'],
      ['{ "lieu": "fiches", "regle": "SA3.INV-1" }', '{ "lieu": "fiches", "regle": "SA2.INV-1" }'],
    ),
  });
  const sureté = "une règle de sûreté ne s'affaiblit jamais (EVOLUTION.md, section 10.7)";
  attendreErreurs(resultat, [
    `socle-acceptable : formes propres : noyau, programmesInterdits : l'entrée oc se retire depuis ${PA} ; ${sureté}`,
    `socle-acceptable : formes propres : noyau, argumentsInterdits : l'entrée --force devient permise dans un kit depuis ${PA} ; ${sureté}`,
    `socle-acceptable : formes propres : noyau, ecrituresInterdites : l'entrée fiches change de règle, SA3.INV-1 devient SA2.INV-1 depuis ${PA} ; ${sureté}`,
    `socle-acceptable : formes propres : le noyau change depuis ${PA} : le journal de ${VA} ne dit pas sa migration (« Migration : »)`,
  ]);
  // Une entrée ajoutée renforce le noyau : seule sa migration est due, et, dite au journal, rien ne manque aux formes propres.
  const PODMAN = `${OC}    { "programme": "podman", "horsKit": true, "regle": "SA2.INV-1" },\n`;
  const ajout = alterer({ [SOCLE]: remplacer([OC, PODMAN]) });
  attendreErreurs(ajout, [`socle-acceptable : formes propres : le noyau change depuis ${PA} : le journal de ${VA} ne dit pas sa migration (« Migration : »)`]);
  assert.doesNotMatch(ajout.stderr, /noyau, \w+ : l'entrée/, 'un ajout n\'affaiblit rien');
  const migre = alterer({ [SOCLE]: (texte) => auJournal(VA, 'Migration : les constitutions reprennent podman. ')(remplacer([OC, PODMAN])(texte)) });
  assert.doesNotMatch(migre.stderr, /formes propres/, migre.stderr);
});

test('formes propres : une constitution d\'exemple relâchée cite son examen, ses preuves et sa migration ; un autre changement, sa migration', () => {
  const [VD, PD, VT, PT] = [versionDe('agent2dev'), precedenteDe('agent2dev'), versionDe('agent2test'), precedenteDe('agent2test')];
  const EXAMEN = `observatoire/examens/agent2dev-${VD}.md`;
  // Chaque sorte de relâchement, dans l'ordre où le vérificateur les nomme.
  const relacher = remplacer(
    ['{ "intention": "demarrer", "regle": "D1.INV-5" }', '{ "intention": "demarrer", "horsKit": true, "regle": "D1.INV-5" }'],
    ['{ "intention": "arreter", "regle": "D1.INV-5" }', '{ "intention": "arreter", "regle": "D1.INV-5", "derogeable": true }'],
    ['    { "intention": "batch", "regle": "D1.INV-5" },\n', ''],
    ['"points": ["V0", "V1", "V2", "V3", "V4", "V5", "CP-4"]', '"points": ["V0", "V1", "V2", "V4", "V5", "CP-4"]'],
    ['"invariants": ["D1.INV-1", "D1.INV-2"]', '"invariants": ["D1.INV-1"]'],
    ['"noms": ["compiler-back",', '"noms": ["deployer", "compiler-back",'],
    ['{ "regle": "budget.tentativesSortie", "bornes": { "min": 1, "max": 3 } }', '{ "regle": "budget.tentativesSortie", "bornes": { "min": 1, "max": 5 } }'],
    ['{ "regle": "budget.tentativesPas", "bornes": { "min": 1, "max": 5 } }', '{ "regle": "budget.tentativesPas", "bornes": { "min": 1, "max": 5 } },\n    { "regle": "contexte.plafond", "bornes": { "min": 8000, "max": 60000 } }'],
    ['"metaCriteres": { "fenetre": 10, "expositionMin": 3, "marge": 15 }', '"metaCriteres": { "fenetre": 10, "expositionMin": 3, "marge": 10 }'],
  );
  const relachements = [
    'intentionsRefusees, entrée demarrer (D1.INV-5) permise dans un kit',
    'intentionsRefusees, entrée arreter (D1.INV-5) rendue dérogeable',
    'intentionsRefusees, entrée batch (D1.INV-5) retirée ou modifiée',
    'points, V3 retiré',
    'invariants, D1.INV-2 retiré',
    'commandes.noms, deployer ajoutée',
    'reglesModifiables, bornes de budget.tentativesSortie élargies',
    'reglesModifiables, contexte.plafond ajoutée',
    'metaCriteres.marge changé',
  ];
  const raison = `agent2dev : formes propres : constitution d'exemple relâchée depuis ${PD} (${relachements.join(' ; ')})`;
  // Sans migration au journal, ni examen, ni preuves : tout ce qui manque est relevé. Agent2Test : sa constitution
  // d'exemple, changée ici sans se relâcher, sa version seule, ne doit que sa migration.
  const sansMigration = (version) => (texte) => texte.replace(new RegExp(`^(\\*\\*${motif(version)}\\*\\* .*)Migration : `, 'm'), '$1Ensuite : ');
  const versionSeule = (texte) => texte.replace(/^( {2}"version": ")(\d+\.\d+\.)(\d+)(",)$/m, (_, a, b, c, d) => `${a}${b}${Number(c) + 1}${d}`);
  const r1 = alterer({ 'specs/agent2dev/modules/noyau/SKILL.md': relacher, 'specs/agent2dev/SKILL.md': sansMigration(VD), 'specs/agent2test/modules/noyau/SKILL.md': versionSeule, 'specs/agent2test/SKILL.md': sansMigration(VT) });
  attendreErreurs(r1, [
    `${raison} : examen absent, ${EXAMEN} attendu (EVOLUTION.md, section 10.7)`,
    `${raison} : le journal de ${VD} ne cite pas son examen, ${EXAMEN}`,
    `${raison} : le journal de ${VD} ne dit pas ses preuves (« Preuves : »)`,
    `${raison} : le journal de ${VD} ne dit pas sa migration (« Migration : »)`,
    `agent2test : formes propres : constitution d'exemple changée depuis ${PT} : le journal de ${VT} ne dit pas sa migration (« Migration : »)`,
  ]);
  assert.doesNotMatch(r1.stderr, /agent2test : formes propres : constitution d'exemple relâchée/, 'une constitution dont seule la version change ne se relâche pas');
  // Examinée, avec un avis défavorable, citée au journal avec ses preuves : seule manque la réponse à l'avis.
  const examen = `---\nformat: observatoire.examen/1\ndate: 2026-11-26\nobjet: specification\nsysteme: agent2dev\nversion: ${VD}\nexaminateur: observateur-externe\nmodele: gemini-3-flash-preview\navis: defavorable\n---\n\n## Avis\n\n- Une marge plus étroite fait adopter des leçons sur moins de preuves.\n`;
  const cite = auJournal(VD, `Preuves : incident du 2026-11-20. Examen : \`${EXAMEN}\`. `);
  avecFichiers({ [EXAMEN]: examen }, () => {
    const r2 = alterer({ 'specs/agent2dev/modules/noyau/SKILL.md': relacher, 'specs/agent2dev/SKILL.md': cite });
    attendreErreurs(r2, [`${raison} : le journal de ${VD} ne dit pas sa réponse à l'avis défavorable (« Réponse à l'examen »)`]);
    assert.doesNotMatch(r2.stderr, /examen absent|ne cite pas son examen|ses preuves/, r2.stderr);
    const r3 = alterer({ 'specs/agent2dev/modules/noyau/SKILL.md': relacher, 'specs/agent2dev/SKILL.md': auJournal(VD, `Preuves : incident du 2026-11-20. Examen : \`${EXAMEN}\`. Réponse à l'examen : la marge reste bornée par la constitution. `) });
    assert.doesNotMatch(r3.stderr, /formes propres/, r3.stderr);
  });
});

test('examens : une proposition ratifiée sans examen, ou un examen hors format, sont relevés', () => {
  const nom = '2026-11-26-generateur-skill-ticket-requete-native-meso-composants.md';
  const proposition = `---\nformat: observatoire.proposition/1\ndate: 2026-11-26\nsysteme: generateur-skill-ticket\nversions: [${versionDe('generateur-skill-ticket')}]\nsorte: recurrence\nmotif: requete-native\nprofondeur: meso-composants\ninstances: 2\nenveloppes: 3\nreferences: [0123abcd:12, 4567cdef:4, 4567cdef:9]\nstatut: ratifiee\nversion: 9.9.9\npr: 999\n---\n\n## Ce qui change\n\nLa règle de requête native se précise.\n`;
  avecFichiers({ [`observatoire/propositions/${nom}`]: proposition }, () => {
    attendreErreurs(verifier(), [`observatoire/propositions/${nom} : ratifiée sans examen, observatoire/examens/${nom} attendu (D11.INV-1)`]);
    const examen = '---\nformat: observatoire.examen/1\ndate: 2026-11-26\nobjet: proposition\nexaminateur: observateur-externe\nmodele: gemini-3-flash-preview\navis: neutre\n---\n\n## Avis\n\n- Rien à redire.\n';
    avecFichiers({ [`observatoire/examens/${nom}`]: examen }, () => {
      attendreErreurs(verifier(), [`observatoire/examens/${nom} : avis « neutre » : favorable, reserve ou defavorable`]);
    });
    avecFichiers({ [`observatoire/examens/${nom}`]: examen.replace('avis: neutre', 'avis: favorable') }, () => {
      const r = verifier();
      assert.equal(r.status, 0, r.stderr);
      assert.match(r.stdout, /^ok {2}observatoire\/examens\/ : 1 examen au format observatoire\.examen\/1 ; chaque proposition ratifiée a le sien$/m);
    });
  });
});
