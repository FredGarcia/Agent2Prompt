/**
 * Recette de `tools/verifier.mjs` : `node --test tools/verifier.test.mjs`, Node 20 ou plus récent.
 *
 * Le vérificateur se lance, comme en CI, sur une copie du dépôt, dans un dossier temporaire hors de Git :
 * il y lit le disque à la place de `git ls-files`. Chaque test altère des fichiers de la copie, lance le
 * vérificateur, attend les erreurs nommées, puis rend les fichiers. La recette porte sur le préfixe `SA` du
 * socle de l'acceptable, sur son bloc `noyau` et sur les constitutions qui l'épinglent ; elle tourne dans
 * `.github/workflows/verifier.yml`.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const RACINE = dirname(dirname(fileURLToPath(import.meta.url)));
// Ce que lit le vérificateur : spécifications, transmissions, propositions de l'observatoire, README, glossaire.
const A_COPIER = ['tools', 'specs', 'transmissions', 'observatoire', 'README.md', 'glossaire.md', '.geminiignore'];
const SOCLE = 'specs/socle-acceptable/SKILL.md';
const lf = (texte) => texte.replace(/\r\n/g, '\n');
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
      ['## 14. Journal de révision\n', '## 14. Journal de révision\n\nVoir SA9.INV-1.\n'],
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
    'specs/agent2test/modules/acceptable/SKILL.md': remplacer([`"version": "1.0.1", ${EMPREINTE}`, `"version": "1.0.0", ${EMPREINTE}`]),
  });
  attendreErreurs(resultat, [
    'agent2dev : constitution : acceptable.empreinte 000000000000…, le bloc noyau de socle-acceptable 1.0.1 a l\'empreinte e815cadf2308…',
    'agent2dev : constitution : programmesInterdits, l\'entrée du noyau docker n\'est pas reprise à l\'identique',
    'agent2test : constitution : intentionsRefusees, l\'entrée du noyau administrer n\'est pas reprise à l\'identique',
    'agent2test : constitution : acceptable.version 1.0.0, la spécification inclut socle-acceptable 1.0.1',
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
