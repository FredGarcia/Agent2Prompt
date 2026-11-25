---
name: export
description: Export d'un scénario ratifié en test @playwright/test du projet, et résultats d'une exécution aux formats d'import de Xray et de Zephyr Scale (exporter.mjs ; test écrit sans IA depuis le scénario valide, traduction contrôlée, même scénario même test ; un test par jeu, test.step numéroté par étape avec sa ligne, cibles en localisateurs de Playwright, étiquettes en tags ; aides communes qui reprennent la sémantique du moteur, vérifications qui se poursuivent, préparation à sa place, nettoyage dans un bloc finally ; souche de connexion pour l'équipe, aucun identifiant écrit ; dossier de tests désigné seulement, fichiers du skill reconnus à leur en-tête, conflit, test périmé, test retouché gardé à côté, --comparer, --remplacer ; TypeScript ou JavaScript ; SCENARIO_ORIGINES et SCENARIO_AUTORISER_MUTATIONS pour jouer ailleurs ; verifier.mjs sur un test exporté ; resultats.mjs, pour le JSON de Xray Cloud ou Data Center, d'une exécution ou d'une campagne, statut du verdict, statut par pas d'un test manuel converti, exemples des jeux, copies d'écran sur demande, sur leur pas, exécution de test existante, format « custom » de Zephyr Scale en JSON et en archive .zip, clé retenue à l'import ou --cle, rien n'est envoyé ; sources de scripts/export.mjs, scripts/aides-export.mjs, scripts/exporter.mjs et scripts/resultats.mjs). À lire pour mettre un scénario dans les tests du projet et en rendre les résultats.
dimensions: [D21]
status: active
---

# Module `export` (D21)

Phases 7E couvertes : Expression et Environnement.

## 1. Principe

Un scénario ratifié décrit ce que fait un testeur ; le skill le joue sur le poste, dans le navigateur du développeur. L'équipe veut aussi le rejouer sans le skill, dans sa CI, à côté de ses autres tests, et en rendre les résultats à l'outil où vivent ses cas de test. `exporter.mjs` écrit donc le scénario en test `@playwright/test` du projet, et `resultats.mjs` met le rapport d'une exécution au format d'import de Xray ou de Zephyr Scale.

L'export suit la règle de la traduction : rien n'y est laissé à l'IA. Le test s'écrit sans IA depuis le scénario valide, dont la traduction est contrôlée ; le même scénario donne le même test, octet pour octet, et `verifier.mjs` dit périmé un test dont le scénario a changé (D21.INV-1). Le scénario reste la source : un test exporté ne se retouche pas, il se régénère.

L'export n'écrit rien d'autre dans le projet que ses propres fichiers, dans le dossier de tests que le développeur désigne, et jamais d'identifiant (D21.INV-2). La connexion, qui revient au développeur lors d'une étape à la main, revient dans un test exporté à l'équipe : elle l'écrit une fois, avec les comptes de test et les secrets de sa CI.

## 2. La commande

```text
node <skill>/scripts/exporter.mjs <scénario.toml>... --dossier <dossier de tests du projet> [--langage ts|js] [--comparer | --remplacer]
```

| Option | Effet |
|---|---|
| `--dossier <dossier>` | le dossier de tests du projet, celui de la configuration de Playwright (`testDir`) ; requis, et il doit exister : le skill ne le crée pas |
| `--langage ts\|js` | le langage des fichiers écrits ; à défaut, `ts` si le dossier ou l'un de ses parents, jusqu'au `package.json` du projet, a un `tsconfig.json` ou un `playwright.config.ts`, sinon `js` |
| `--comparer` | dit, pour chaque fichier, s'il serait écrit, à jour, périmé, retouché ou en conflit, sans rien écrire |
| `--remplacer` | remplace un test périmé ; un test retouché à la main est d'abord gardé à côté, `<test>.avant-<horodatage>` |

Chaque scénario est lu et contrôlé comme pour l'exécution (modules `scenario` et `donnees`) : un scénario invalide, ou dont le texte a changé depuis la traduction, refuse l'export entier, avant toute écriture.

Sortie : une ligne par fichier, `écrit`, `à jour`, `périmé`, `retouché`, `conflit`, `gardé` ou `remplacé`, avec le titre du scénario, ses étapes, ses jeux, sa préparation et son nettoyage ; puis les notes : la connexion qui reste à écrire, les origines du scénario et la façon de les faire correspondre ailleurs, les tests qui modifient des données ; enfin `Exporté : n tests en TypeScript dans <dossier> ; npx playwright test <dossier>`. Les chemins s'écrivent avec des « / » sur tous les systèmes : `npx playwright test` lit son argument comme une expression régulière, où une barre oblique inverse de Windows serait un échappement.

| Code | Sens |
|---|---|
| 0 | chaque fichier est écrit ou à jour |
| 1 | un fichier n'est pas écrit : conflit, test périmé ou retouché sans `--remplacer` ; avec `--comparer`, un fichier changerait |
| 2 | option, dossier ou scénario refusé, avant toute écriture |

## 3. Les fichiers écrits (D21.INV-2)

| Fichier, dans le dossier désigné | Contenu | Remplacé |
|---|---|---|
| `<scénario>.spec.ts` ou `.spec.mjs` | le test du scénario, un par scénario, nommé comme lui | à jour : jamais réécrit ; périmé : avec `--remplacer` ; retouché : avec `--remplacer`, gardé d'abord à côté |
| `scenario-playwright.aides.ts` ou `.mjs` | les aides communes des tests exportés (§ 5) | comme un test |
| `scenario-playwright.connexion.ts` ou `.mjs` | la connexion de l'équipe ; le skill n'en pose qu'une souche, et seulement si un scénario a une étape à la main (§ 6) | jamais |

Un test et les aides commencent par un en-tête : `// @ts-nocheck` en TypeScript, puis la version du skill et le scénario source, chemin relatif au dossier du test, la consigne de ne pas les modifier, et l'empreinte SHA-256 de leur corps, ce qui suit l'en-tête. Le skill reconnaît ainsi ses fichiers : un fichier sans cet en-tête n'est pas à lui, et n'est jamais remplacé, même avec `--remplacer` ; un fichier à lui dont le corps n'a plus son empreinte a été retouché à la main. Les fichiers se comparent en fins de ligne LF : une extraction en CRLF n'est ni périmée ni retouchée.

Le test exporté ne contient aucune valeur que le scénario ne contient pas : ni identifiant, ni mot de passe, ni jeton, ni valeur gardée d'une exécution. Il se versionne avec les tests du projet ; les résultats du skill, eux, restent sur le poste (D1.INV-2).

## 4. Le test exporté (D21.INV-1)

Extrait d'un test exporté d'un scénario à deux jeux, dont une étape crée un client et dont le nettoyage le supprime :

```javascript
import { expect, test } from '@playwright/test';
import { ouvrir } from './scenario-playwright.aides.mjs';

const DEFINITION = { titre: 'Créer un client', url_base: 'http://127.0.0.1:4200', origines: ['http://127.0.0.1:4200'], mutations: ['étape 9', 'nettoyage 1'] };
const PARAMETRES = {};
const JEUX = [{"nom":"Ecran <unique>","ville":"Lyon"},{"nom":"Autre <unique>","ville":"Marseille"}];

test.describe('Créer un client', () => {
  for (const [indice, jeu] of JEUX.entries()) {
    test(`jeu ${indice + 1} : ${Object.entries(jeu).map(([k, v]) => `${k} = ${v}`).join(', ')}`, { tag: ['@DEMO-8-S02'] }, async ({ page }) => {
      const s = await ouvrir(page, DEFINITION, { parametres: PARAMETRES, jeu, indice });
      try {
        await s.etape(1, 'naviguer /clients/nouveau', () => s.naviguer('/clients/nouveau', 30000));
        await s.etape(2, 'saisir « ${nom} » dans getByLabel(\'Nom\')', () => page.getByLabel('Nom').fill(`${s.v.nom}`, { timeout: 30000 }));
        await s.etape(9, 'cliquer getByRole(\'button\', { name: \'Enregistrer\' })  [création]', () => page.getByRole('button', { name: 'Enregistrer' }).click({ timeout: 30000 }), { mutation: true });
        await s.etape(10, 'vérifier getByRole(\'alert\') contient « Client ${nom} créé »', () => s.contient(page.getByRole('alert'), `Client ${s.v.nom} créé`, { exact: false, delai: 30000 }), { verifier: true, action: false });
        s.fin();
      } finally {
        await s.nettoyage(1, 'DELETE /api/clients/${nom}  [suppression]', () => s.appeler({ methode: 'DELETE', chemin: `/api/clients/${s.v.nom}`, delai: 30000 }));
      }
    });
  }
});
```

Les règles de l'écriture :

- **Jeux** : chaque jeu devient un test, qui reçoit les valeurs du jeu ; un scénario à plusieurs jeux les groupe dans un `test.describe` du titre du scénario. Les étiquettes du scénario deviennent les tags du test (`@DEMO-13`) : un rapporteur de Playwright pour Xray ou Zephyr Scale, s'il y en a un dans le projet, y retrouve la clé du test.
- **Étapes** : chaque étape devient un `test.step` titré de son numéro, de sa ligne du texte (`l.12`) et de son résumé, le même que dans le rapport du skill. Une valeur `${nom}` y devient la valeur du jeu, `s.v.nom`, ou la valeur gardée par une préparation, `s.g('nom')`, lue à l'exécution ; `$${` reste un `${` littéral ; `${unique}` et `<unique>` valent, comme dans le moteur, un suffixe de sept caractères propre à chaque jeu de chaque exécution (D20.INV-6).
- **Cibles** : chaque cible devient le localisateur de Playwright que le skill emploie, dans la même notation : `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`, `getByTestId`, `getByAltText`, `getByTitle` ou `locator`, `exact`, `dans` en localisateurs enchaînés, `rang` en `nth` (module `cibles`).
- **Actions** : `cliquer`, `saisir`, `choisir`, `cocher`, `survoler`, `touche` et `televerser` deviennent les appels directs de Playwright, avec le délai de l'étape ; les vérifications `visible`, `valeur`, `nombre` et `actif`, des `expect` ; `naviguer`, `attendre`, `telecharger`, `capturer`, les vérifications `contient` et `url`, et hors de l'écran `requete`, `api` et `fichier`, passent par les aides, qui reprennent le moteur : mêmes attentes, mêmes messages, attendu et obtenu. Un fichier à téléverser se désigne par son chemin relatif au test ; un fichier téléchargé et une capture s'enregistrent dans les résultats du test (`testInfo.outputPath`), une capture s'y attache.
- **Délais** : celui de l'étape, sinon du scénario, sinon 10 s, et 300 s par défaut pour une étape à la main, écrits dans le test ; le réglage `SCENARIO_PLAYWRIGHT_DELAI` du poste n'y entre pas.
- **Vérifications** : une vérification en échec n'arrête pas les vérifications qui la suivent ; l'action suivante n'est pas jouée, et le test échoue, au plus tard à sa fin, par la première vérification en échec (D5.INV-3, D5.INV-4).
- **Préparation** : chaque entrée se place comme dans le moteur, avant la première étape d'une ligne plus grande du texte, dans un `test.step` `p1. préparation : …` ; un appel par `s.appeler`, un scénario de préparation par ses propres étapes, écrites sous l'entrée et jouées dans la même page avec ses valeurs (D20.INV-4, D20.INV-5).
- **Nettoyage** : dans le bloc `finally`, chaque entrée une fois, même après un échec, dans un `test.step` `n1. nettoyage : …` ; un nettoyage en échec est annoté (`nettoyage en échec`) et signalé par un `AVERTISSEMENT`, sans changer le résultat du test ; une entrée dont une valeur gardée manque n'est pas jouée, et le test l'annote (`nettoyage non joué`) (D20.INV-4).
- **Étape à la main** : elle appelle `seConnecter(page, { message, jusqua })`, la connexion de l'équipe (§ 6), puis attend l'état de fin de l'étape, `jusqua`, dans son délai ; aucun corps de requête n'est relevé pendant elle (D19.INV-2).

Un test exporté joue dans un contexte de navigateur neuf, comme tout test de Playwright : il ne retrouve pas la session du profil du skill. Une étape à la main s'y joue donc à chaque test, par la connexion de l'équipe.

## 5. Les aides (D21.INV-3)

`scenario-playwright.aides.ts` (ou `.mjs`) est le seul module que le test importe, avec `@playwright/test` du projet. `ouvrir(page, DEFINITION, { parametres, jeu, indice })` prépare le jeu : valeurs, garde des origines, garde des mutations, relevé des requêtes ; l'objet rendu joue les étapes et les entrées. Les aides n'emploient que l'interface publique et stable de `@playwright/test` (`test.step`, `test.info`, `test.skip`, `expect` dans le test, `page.context().route`, `routeWebSocket`, `request`) ; elles demandent `@playwright/test` 1.48 ou plus récent, pour la garde des WebSocket, et le disent sinon ; elles sont essayées avec la version 1.65.1 (module `recette`, R36 et R37).

- **Garde des origines** : aucune requête ne part vers une origine que le scénario ne déclare pas, WebSocket compris (D7.INV-1).
- **Origines jouées** : `SCENARIO_ORIGINES="<origine du scénario>=<origine jouée>,…"` remplace chaque origine du scénario, celle de `url_base` comprise, par celle de l'environnement où le test joue, recette ou CI : adresses relatives, vérifications d'adresse, appels et garde suivent la correspondance. Une correspondance mal formée fait échouer le test, sans rien jouer.
- **Garde des mutations** : un test qui modifie des données (étapes de mutation, appels et scénarios de préparation et de nettoyage qui en modifient) et dont une origine, après correspondance, est hors du poste est sauté (`test.skip`), avec son motif, sans `SCENARIO_AUTORISER_MUTATIONS=1`, que l'équipe définit pour l'environnement où elle l'autorise ; avec elle, une étape de mutation ou un appel hors du poste n'est pas fait sans elle (D7.INV-2, D20.INV-3).
- **Appels** : un appel de préparation ou de nettoyage part vers une origine déclarée, avec la session du navigateur du test et le jeton anti-CSRF recopié de son cookie, une fois, sans redirection suivie, et garde ses valeurs d'une réponse JSON d'au plus 1 Mio (D20.INV-2).
- **Secrets** : aucun en-tête, cookie ni jeton n'est relevé ; dans les messages, la valeur d'un paramètre d'adresse ou d'un champ au nom de secret est masquée, comme dans le rapport du skill (D19.INV-2).

## 6. La connexion de l'équipe

Une étape à la main revient au développeur : dans le navigateur du skill, il se connecte lui-même. Un test exporté joue sans lui ; sa connexion s'écrit donc, une fois, dans `scenario-playwright.connexion.ts`, par l'équipe :

```javascript
export async function seConnecter(page, { message, jusqua }) {
  // Écrite par l'équipe : connexion du compte de test, ses secrets pris dans les variables de la CI,
  // ou session préparée par un projet de configuration de Playwright (storageState).
}
```

Le skill n'en pose qu'une souche, quand un scénario exporté a une étape à la main et qu'il n'y a pas encore de fichier : elle échoue en disant ce qui manque (« connexion à écrire par l'équipe dans scenario-playwright.connexion : « Connectez-vous », jusqu'à l'adresse /accueil-connecte »), et la sortie de `exporter.mjs` le rappelle tant qu'elle reste une souche. Le skill ne la remplace jamais, n'y écrit aucun identifiant, et l'agent ne l'écrit pas (D21.INV-2, D10.INV-8). Après elle, le test attend l'état de fin de l'étape.

## 7. Un scénario qui change (D21.INV-1, D21.INV-2)

Le scénario est la source du test. Quand il change, puis se fait ratifier, son test devient périmé :

1. `verifier.mjs <test.spec.ts>` régénère le test depuis son scénario, nommé dans l'en-tête, et le compare : `ok … à jour`, ou `ERREUR` avec le code 2, périmé (le scénario, ou la version du skill, a changé) ou retouché à la main ; un scénario devenu invalide est dit aussi.
2. `exporter.mjs … --comparer` dit ce qui changerait, sans rien écrire.
3. `exporter.mjs … --remplacer` régénère le test ; un test retouché à la main est d'abord gardé à côté, `<test>.avant-<horodatage>`, pour que l'équipe reporte sa retouche dans le scénario, seule source.

## 8. Résultats pour Xray et Zephyr Scale (D21.INV-4)

```text
node <skill>/scripts/resultats.mjs <dossier de résultats | rapport.json | dossier de campagne>... --format xray|xray-dc|zephyr|jira [--cle CLÉ] [--execution CLÉ] [--preuves] [--sortie <dossier>]
```

`resultats.mjs` lit le `rapport.json` d'une exécution de `jouer.mjs` (module `preuves`), ou ceux des tests d'une campagne, dans l'ordre de `campagne.json` (module `conformite`, § 2), et écrit un fichier, que la personne qui en a le droit importe dans l'outil ; `--format jira` écrit le rapport de conformité à coller dans Jira (module `conformite`, § 5). Rien n'est envoyé : le skill n'écrit jamais dans Jira, Xray ni Zephyr Scale (D17.INV-2).

- **Clé du test** : celle que l'import du texte a retenue (module `cas-de-test`) : le scénario joué se retrouve à son empreinte, notée au rapport, dans le dossier que cite `campagne.json` pour un test d'une campagne, dans le dossier du scénario, dont le rapport est par défaut un sous-dossier de `resultats/`, près du rapport ou dans le dossier courant ; puis son texte de départ et sa provenance. Un texte écrit à la main, ou dont l'étiquette a été attribuée par l'import, n'a pas de clé : `--cle PROJET-123` (Xray) ou `--cle PROJET-T123` (Zephyr Scale) la donne, pour un seul rapport. La forme de la clé est contrôlée.
- **Xray Cloud**, `--format xray`, `xray-<scénario>.json`, au format JSON d'import des résultats d'exécution de Xray (Import Execution Results) : `info` (résumé, début et fin) et un test par rapport, `testKey`, `start`, `finish`, `status`, celui du verdict du test (`PASSED` conforme, `FAILED` non conforme, `ABORTED` bloqué ; module `conformite`, § 4), `comment` (chaque jeu, avec ses valeurs, sans `${unique}`, son verdict, l'entrée de préparation, l'étape avec sa ligne et le nettoyage en échec, et leur message) ; un exemple par jeu (`examples`) pour un scénario à plusieurs jeux, comme un plan de scénario de Cucumber ; pour un test manuel converti dont le texte n'a changé ni depuis l'import ni depuis l'exécution, le statut de chacun de ses pas (`steps`) : un pas, ce sont sa ligne « Quand » et ses lignes « Alors » ; il échoue si l'une de leurs étapes échoue, avec son message, passe si toutes passent, reste à faire sinon. Un texte retouché depuis l'import ne donne que le statut du test, avec une note. Avec `--preuves`, et seulement avec elle, les copies d'écran du test s'ajoutent, en PNG encodé en base64, sous leur nom stable (module `conformite`, § 5) : celles des étapes d'un pas sur ce pas, quand les pas sont rendus, les autres, l'écran à la fin des étapes compris, sur le test (`evidence`). `--execution PROJET-123` verse les résultats dans une exécution de test existante (`testExecutionKey`) ; sans elle, Xray en crée une à l'import.
- **Xray Data Center**, `--format xray-dc` : le même fichier, aux statuts de Xray Data Center, `PASS`, `FAIL`, `ABORTED` et `TODO`, les copies d'écran en `evidences`.
- **Zephyr Scale**, `zephyr-<scénario>.json` et `zephyr-<scénario>.zip`, au format « custom » d'import des résultats d'automatisation : `version` 1 et une exécution par rapport, `source`, `result`, celui du verdict (`Passed`, `Failed` ou `Blocked`), et `testCase.key` ; l'archive, un seul fichier stocké et contrôlé par son CRC-32, est celle qui s'envoie. Ce format ne porte ni pas ni pièce jointe : `--preuves` et `--execution` y sont refusés.
- **Plusieurs rapports** : un fichier, un test ou une exécution par rapport, `xray-resultats.json` ou `zephyr-resultats.json`, dans le dossier de `--sortie`, sinon le dossier courant ; une campagne : `xray-campagne.json` ou `zephyr-campagne.json`, dans son dossier ; un seul rapport : à côté de lui. `--cle` ne vaut que pour un seul rapport.

Les messages viennent du rapport, où les secrets sont déjà masqués (D19.INV-2, D20.INV-2). Code 0 quand le fichier est écrit, 2 quand une option, un rapport ou une clé est refusé, et rien n'est alors écrit.

## 9. Contrôle de sortie

- Le même scénario donne le même test ; un scénario invalide, ou dont le texte a changé, n'est pas exporté (D21.INV-1).
- Rien n'est écrit hors du dossier désigné ; un fichier qui n'est pas du skill n'est jamais remplacé ; un test périmé ne l'est qu'avec `--remplacer`, un test retouché est gardé à côté ; la connexion de l'équipe n'est jamais remplacée ; aucun identifiant n'est écrit (D21.INV-2).
- Joués par `@playwright/test` contre l'application de démonstration, les tests exportés rendent, étape par étape, les résultats du skill ; la garde des origines et des mutations s'y applique après correspondance (D21.INV-3 ; module `recette`, R36 et R37).
- Les résultats d'une exécution ou d'une campagne se lisent dans Xray Cloud, dans Xray Data Center et dans Zephyr Scale, la clé retenue à l'import, le statut du verdict, sans rien envoyer (D21.INV-4 ; module `recette`, R38 et R43).

## 10. Source `scripts/export.mjs`

Écriture du test depuis le scénario : valeurs, localisateurs, étapes, entrées de préparation et de nettoyage, placement de la préparation, en-tête et empreinte ; aides et souche de connexion ; en-tête d'un fichier, état d'un fichier, langage du projet, comparaison d'un test exporté à sa source.

<!-- fichier : scripts/export.mjs -->
```javascript
// scenario-playwright 1.6.5 : export d'un scénario ratifié en test @playwright/test du projet (D21).
//
// Le test s'écrit sans IA depuis le scénario TOML valide, dont la traduction est contrôlée : même scénario,
// même test. Chaque étape garde son numéro et sa ligne, chaque cible devient le même localisateur de
// Playwright ; les jeux deviennent des tests, la préparation se place comme dans le moteur, le nettoyage se
// joue dans un bloc finally. Les aides communes reprennent la sémantique du moteur ; la connexion revient à
// l'équipe. Le skill n'écrit dans le projet que ses propres fichiers, dans le dossier désigné (D21.INV-2).
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { strategie } from './cibles.mjs';
import { positionsPreparation } from './moteur.mjs';
import { DELAI_DEFAUT, DELAI_MAIN_DEFAUT, lireScenario, mutationsDe, resumeEntree, resumeEtape } from './scenario.mjs';

export const VERSION = '1.6.5';
export const NOM_AIDES = 'scenario-playwright.aides';
export const NOM_CONNEXION = 'scenario-playwright.connexion';
const RE_EMPREINTE = /^\/\/ Empreinte : ([0-9a-f]{64})$/;
const MARQUE_SOUCHE = '// Souche posée par scenario-playwright : la connexion reste à écrire par l\'équipe.';

const sha256 = (s) => createHash('sha256').update(s).digest('hex');
const lf = (s) => String(s).replace(/\r\n?/g, '\n');
const estTable = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const posix = (p) => p.split(sep).join('/');
const relatif = (de, vers) => { const r = posix(relative(de, vers)) || '.'; return r.startsWith('.') ? r : `./${r}`; };

/** Texte JS entre apostrophes, sans interpolation. */
export const js = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')}'`;

/**
 * Texte d'un scénario en expression JS : ${nom} y devient la valeur du jeu, ou la valeur gardée par une
 * préparation, lue à l'exécution ; $${ reste un ${ littéral. Sans variable, un texte entre apostrophes.
 */
function chaine(texte, ctx) {
  const t = String(texte);
  const parties = [];
  let dernier = 0;
  let variable = false;
  for (const m of t.matchAll(/\$\$\{|\$\{([^}]*)\}/g)) {
    parties.push({ litteral: t.slice(dernier, m.index) });
    if (m[1] === undefined) parties.push({ litteral: '${' });
    else { parties.push({ nom: m[1] }); variable = true; }
    dernier = m.index + m[0].length;
  }
  parties.push({ litteral: t.slice(dernier) });
  const brut = parties.filter((p) => p.litteral !== undefined).map((p) => p.litteral).join('');
  if (!variable) return js(brut);
  const echapper = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
  return `\`${parties.map((p) => (p.litteral !== undefined ? echapper(p.litteral) : ctx.gardees.has(p.nom) ? `\${${ctx.jeu}.g(${js(p.nom)})}` : `\${${ctx.jeu}.v.${p.nom}}`)).join('')}\``;
}

/** Valeur d'un scénario en expression JS : textes par chaine(), tables et tableaux en littéraux. */
function valeur(v, ctx) {
  if (typeof v === 'string') return chaine(v, ctx);
  if (Array.isArray(v)) return `[${v.map((x) => valeur(x, ctx)).join(', ')}]`;
  if (estTable(v)) {
    const champs = Object.entries(v).map(([k, x]) => `${/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : js(k)}: ${valeur(x, ctx)}`);
    return champs.length ? `{ ${champs.join(', ')} }` : '{}';
  }
  return JSON.stringify(v);
}

/** Localisateur de Playwright d'une cible, en expression JS (comme cibles.mjs, localisateur()). */
function localisateur(cible, ctx, racine = 'page') {
  const base = cible.dans ? localisateur(cible.dans, ctx, racine) : racine;
  const exact = Object.hasOwn(cible, 'exact') ? `, exact: ${cible.exact}` : '';
  const avecExact = (f, v) => `${base}.${f}(${chaine(v, ctx)}${exact ? `, { ${exact.slice(2)} }` : ''})`;
  let l;
  switch (strategie(cible)) {
    case 'role': l = cible.nom === undefined ? `${base}.getByRole(${js(cible.role)})` : `${base}.getByRole(${js(cible.role)}, { name: ${chaine(cible.nom, ctx)}${exact} })`; break;
    case 'libelle': l = avecExact('getByLabel', cible.libelle); break;
    case 'texte': l = avecExact('getByText', cible.texte); break;
    case 'placeholder': l = avecExact('getByPlaceholder', cible.placeholder); break;
    case 'testid': l = `${base}.getByTestId(${chaine(cible.testid, ctx)})`; break;
    case 'alt': l = avecExact('getByAltText', cible.alt); break;
    case 'titre': l = avecExact('getByTitle', cible.titre); break;
    default: l = `${base}.locator(${chaine(cible.css, ctx)})`;
  }
  return cible.rang ? `${l}.nth(${cible.rang - 1})` : l;
}

const titreEtape = (e) => js(`${e.ligne ? `l.${e.ligne} ` : ''}${resumeEtape(e)}`);

/** Appel d'une étape, dans s.etape() ; `ctx` : { jeu, gardees, scenario, dossier, dossierExport }. */
function codeEtape(e, numero, ctx) {
  const s = ctx.jeu;
  const delai = (e.delai ?? (e.action === 'main' ? DELAI_MAIN_DEFAUT : ctx.scenario.delai ?? DELAI_DEFAUT)) * 1000;
  const l = e.cible ? localisateur(e.cible, ctx) : null;
  const t = `{ timeout: ${delai} }`;
  let corps;
  let options = '';
  switch (e.action) {
    case 'naviguer': corps = `${s}.naviguer(${chaine(e.url, ctx)}, ${delai})`; break;
    case 'cliquer': corps = `${l}.click(${t})`; break;
    case 'saisir': corps = `${l}.fill(${chaine(e.valeur, ctx)}, ${t})`; break;
    case 'choisir': corps = `${l}.selectOption({ label: ${chaine(e.valeur, ctx)} }, ${t})`; break;
    case 'cocher': corps = `${l}.setChecked(${e.valeur !== false}, ${t})`; break;
    case 'survoler': corps = `${l}.hover(${t})`; break;
    case 'touche': corps = l ? `${l}.press(${js(e.touche)}, ${t})` : `page.keyboard.press(${js(e.touche)})`; break;
    case 'televerser': {
      const prefixe = relatif(ctx.dossierExport, ctx.dossier);
      const fichiers = (Array.isArray(e.fichier) ? e.fichier : [e.fichier]).map((f) => `${s}.fichier(${chaine(`${prefixe}/${f}`, ctx)})`);
      corps = `${l}.setInputFiles([${fichiers.join(', ')}], ${t})`;
      break;
    }
    case 'telecharger': corps = `${s}.telecharger(${l}, ${e.nom ? js(e.nom) : 'null'}, ${delai})`; break;
    case 'attendre': corps = `${s}.attendre({ etat: ${js(e.etat)}${l ? `, cible: ${l}` : ''}${e.url !== undefined ? `, url: ${chaine(e.url, ctx)}` : ''}${e.texte !== undefined ? `, texte: ${chaine(e.texte, ctx)}` : ''} }, ${delai})`; break;
    case 'capturer': corps = `${s}.capturer(${l ?? 'null'}, ${js(e.nom)}, { pleinePage: ${e.pleine_page === true}, delai: ${delai} })`; break;
    case 'main': {
      const jusqua = e.jusqua.url !== undefined ? `{ url: ${chaine(e.jusqua.url, ctx)} }` : `{ cible: ${localisateur(e.jusqua.cible, ctx)}${e.jusqua.etat ? `, etat: ${js(e.jusqua.etat)}` : ''} }`;
      corps = `${s}.main({ message: ${chaine(e.message, ctx)}, jusqua: ${jusqua}, delai: ${delai} }, () => seConnecter(page, { message: ${chaine(e.message, ctx)}, jusqua: ${jusqua} }))`;
      ctx.avecMain = true;
      break;
    }
    case 'verifier': {
      options = 'verifier: true, action: false';
      switch (e.critere) {
        case 'contient': corps = `${s}.contient(${l}, ${chaine(e.attendu, ctx)}, { exact: ${e.exact === true}, delai: ${delai} })`; break;
        case 'visible': corps = `expect(${l}).${e.attendu === false ? 'toBeHidden' : 'toBeVisible'}(${t})`; break;
        case 'valeur': corps = `expect(${l}).toHaveValue(${chaine(e.attendu, ctx)}, ${t})`; break;
        case 'nombre': corps = `expect(${l}).toHaveCount(${e.attendu}, ${t})`; break;
        case 'actif': corps = `expect(${l}).${e.attendu === false ? 'toBeDisabled' : 'toBeEnabled'}(${t})`; break;
        case 'url': corps = `${s}.adresseAtteinte(${chaine(e.attendu, ctx)}, ${delai})`; break;
        case 'requete': corps = `${s}.requete({ ${e.methode ? `methode: ${js(e.methode)}, ` : ''}chemin: ${chaine(e.chemin, ctx)}, attendu: ${valeur(e.attendu ?? {}, ctx)} }, ${delai})`; break;
        case 'api': corps = `${s}.api({ chemin: ${chaine(e.chemin, ctx)}, attendu: ${valeur(e.attendu ?? {}, ctx)} }, ${delai})`; break;
        default: corps = `${s}.fichierTelecharge(${js(e.fichier)}, ${valeur(e.attendu ?? {}, ctx)})`;
      }
      break;
    }
    default: throw new Error(`action inconnue : ${e.action}`);
  }
  if (e.action === 'attendre' || e.action === 'capturer') options = 'action: false';
  if (e.mutation) options = options ? `${options}, mutation: true` : 'mutation: true';
  return `await ${s}.etape(${numero}, ${titreEtape(e)}, () => ${corps}${options ? `, { ${options} }` : ''});`;
}

/** Variables gardées qu'une entrée emploie : un nettoyage sans l'une d'elles n'est pas joué (D20.INV-4). */
function gardeesDe(e, ctx) {
  const textes = [e.chemin, e.corps === undefined ? '' : JSON.stringify(e.corps), ...Object.values(e.parametres ?? {}).map(String)];
  return [...new Set(textes.flatMap((x) => [...String(x ?? '').matchAll(/\$\$\{|\$\{([^}]*)\}/g)].map((m) => m[1]).filter((n) => n !== undefined && ctx.gardees.has(n))))];
}

/**
 * Lignes d'une entrée de préparation ou de nettoyage : un appel d'API, ou les étapes d'un scénario de
 * préparation jouées dans la même page, avec ses valeurs (D20.INV-5).
 */
function codeEntree(e, k, genre, ctx) {
  const s = ctx.jeu;
  const titre = js(`${e.ligne ? `l.${e.ligne} ` : ''}${resumeEntree(e)}`);
  const methode = genre === 'preparation' ? 'preparation' : 'nettoyage';
  const requises = genre === 'nettoyage' ? gardeesDe(e, ctx) : [];
  const fin = requises.length ? `, ${JSON.stringify(requises)});` : ');';
  if (e.scenario !== undefined) {
    const sous = e.charge.scenario;
    const nom = `${s}${genre === 'preparation' ? 'p' : 'n'}${k}`;
    const ctxSous = { ...ctx, jeu: nom, scenario: sous, dossier: e.charge.dossier, gardees: new Set() };
    const valeurs = { ...Object.fromEntries(Object.entries(sous.parametres ?? {}).map(([kk, v]) => [kk, js(v)])), ...Object.fromEntries(Object.entries(e.parametres ?? {}).map(([kk, v]) => [kk, typeof v === 'string' ? chaine(v, ctx) : js(String(v))])) };
    const lignes = [
      `await ${s}.${methode}(${k}, ${titre}, async () => {`,
      `  const ${nom} = ${s}.sous(${definition(sous)}, { ${Object.entries(valeurs).map(([kk, v]) => `${kk}: ${v}`).join(', ')} });`,
      ...sous.etapes.map((x, i) => `  ${codeEtape(x, i + 1, ctxSous)}`),
      `  ${nom}.fin();`,
      `}${fin}`,
    ];
    ctx.avecMain ||= ctxSous.avecMain;
    return lignes;
  }
  const delai = (e.delai ?? ctx.scenario.delai ?? DELAI_DEFAUT) * 1000;
  const corps = e.corps_fichier !== undefined ? JSON.parse(readFileSync(resolve(ctx.dossier, e.corps_fichier), 'utf8')) : e.corps;
  const champs = [`methode: ${js(e.methode)}`, `chemin: ${chaine(e.chemin, ctx)}`];
  if (corps !== undefined) champs.push(`corps: ${valeur(corps, ctx)}`);
  if (e.statut !== undefined) champs.push(`statut: ${JSON.stringify(e.statut)}`);
  if (e.garder) champs.push(`garder: ${JSON.stringify(e.garder)}`);
  champs.push(`delai: ${delai}`);
  return [`await ${s}.${methode}(${k}, ${titre}, () => ${s}.appeler({ ${champs.join(', ')} })${fin}`];
}

/** Définition d'un scénario pour ouvrir() et sous() : titre, adresse, origines, ce qui modifie des données. */
function definition(scenario) {
  return `{ titre: ${js(scenario.titre)}, url_base: ${js(scenario.url_base)}, origines: [${scenario.origines.map(js).join(', ')}], mutations: [${mutationsDe(scenario).map(js).join(', ')}] }`;
}

/**
 * Test exporté d'un scénario : { erreurs, nom, contenu, avecMain, scenario }. `dossierExport` : le dossier
 * où le test s'écrit, pour les chemins relatifs ; `langage` : 'ts' ou 'js'.
 */
export function genererTest(cheminToml, { dossierExport, langage = 'ts' }) {
  const lu = lireScenario(cheminToml);
  if (!lu.scenario) return { erreurs: lu.erreurs, scenario: null };
  const scenario = lu.scenario;
  const gardees = new Set(scenario.preparation.flatMap((e) => Object.keys(e.garder ?? {})));
  const ctx = { jeu: 's', gardees, scenario, dossier: lu.dossier, dossierExport: resolve(dossierExport), avecMain: false };
  const positions = positionsPreparation(scenario.etapes, scenario.preparation);
  const essai = [];
  for (let i = 0; i <= scenario.etapes.length; i++) {
    scenario.preparation.forEach((p, k) => { if (positions[k] === i) essai.push(...codeEntree(p, k + 1, 'preparation', ctx)); });
    if (i < scenario.etapes.length) essai.push(codeEtape(scenario.etapes[i], i + 1, ctx));
  }
  essai.push('s.fin();');
  const nettoyage = scenario.nettoyage.flatMap((n, k) => codeEntree(n, k + 1, 'nettoyage', ctx));
  const ext = langage === 'ts' ? '' : '.mjs';
  const jeux = scenario.jeux ?? [{}];
  const tags = scenario.etiquettes.length ? `, { tag: [${scenario.etiquettes.map((x) => js(`@${x}`)).join(', ')}] }` : '';
  const sourceRel = relatif(ctx.dossierExport, resolve(cheminToml));
  const titreJeu = jeux.length > 1 ? '`jeu ${indice + 1} : ${Object.entries(jeu).map(([k, v]) => `${k} = ${v}`).join(\', \')}`' : js(scenario.titre);
  const interieur = [
    'const s = await ouvrir(page, DEFINITION, { parametres: PARAMETRES, jeu, indice });',
    'try {',
    ...essai.map((x) => `  ${x}`),
    '} finally {',
    ...(nettoyage.length ? nettoyage.map((x) => `  ${x}`) : ['  // aucun nettoyage']),
    '}',
  ];
  const boucle = [
    'for (const [indice, jeu] of JEUX.entries()) {',
    `  test(${titreJeu}${tags}, async ({ page }) => {`,
    ...interieur.map((x) => `    ${x}`),
    '  });',
    '}',
  ];
  const corps = [
    "import { expect, test } from '@playwright/test';",
    `import { ouvrir } from './${NOM_AIDES}${ext}';`,
    ctx.avecMain ? `import { seConnecter } from './${NOM_CONNEXION}${ext}';` : null,
    '',
    `const DEFINITION = ${definition(scenario)};`,
    `const PARAMETRES = ${JSON.stringify(scenario.parametres ?? {})};`,
    `const JEUX = ${JSON.stringify(jeux)};`,
    '',
    ...(jeux.length > 1 ? [`test.describe(${js(scenario.titre)}, () => {`, ...boucle.map((x) => `  ${x}`), '});'] : boucle),
    '',
  ].filter((x) => x !== null).join('\n');
  // expect ne sert qu'à certaines vérifications : sans elles, l'import se réduit à test.
  const final = /\bexpect\(/.test(corps) ? corps : corps.replace("import { expect, test } from '@playwright/test';", "import { test } from '@playwright/test';");
  const entete = [
    ...(langage === 'ts' ? ['// @ts-nocheck'] : []),
    `// Test écrit par scenario-playwright ${VERSION} (exporter.mjs), sans IA, depuis le scénario ratifié ${sourceRel}.`,
    '// Ne pas le modifier à la main : exporter.mjs le régénère, et garde à côté un test retouché avant de le remplacer.',
    `// Empreinte : ${sha256(final)}`,
  ];
  return { erreurs: [], scenario, nom: `${basename(cheminToml, '.toml')}.spec.${langage === 'ts' ? 'ts' : 'mjs'}`, contenu: `${entete.join('\n')}\n${final}`, avecMain: ctx.avecMain };
}

/** Aides communes des tests exportés, pour un langage. */
export function contenuAides(langage = 'ts') {
  const source = lf(readFileSync(fileURLToPath(new URL('./aides-export.mjs', import.meta.url)), 'utf8'));
  const entete = [
    ...(langage === 'ts' ? ['// @ts-nocheck'] : []),
    `// Aides des tests exportés, écrites par scenario-playwright ${VERSION} (exporter.mjs).`,
    '// Ne pas les modifier à la main : exporter.mjs les régénère, et garde à côté un fichier retouché avant de le remplacer.',
    `// Empreinte : ${sha256(source)}`,
  ];
  return `${entete.join('\n')}\n${source}`;
}

/** Souche de connexion, posée une fois pour l'équipe, jamais remplacée (D21.INV-2). */
export function contenuConnexion(langage = 'ts') {
  return [
    ...(langage === 'ts' ? ['// @ts-nocheck'] : []),
    MARQUE_SOUCHE,
    '// La connexion de l\'application s\'écrit ici, avec les comptes de test et les secrets de la CI, jamais en clair dans',
    '// le dépôt : le skill n\'écrit aucun identifiant (D6.INV-2). Après elle, le test attend l\'état de fin de l\'étape à',
    '// la main (jusqua). exporter.mjs ne remplace jamais ce fichier.',
    'export async function seConnecter(page, { message, jusqua }) {',
    '  throw new Error(`connexion à écrire par l\'équipe dans scenario-playwright.connexion : « ${message} »${jusqua?.url ? `, jusqu\'à l\'adresse ${jusqua.url}` : \'\'} (D21.INV-2)`);',
    '}',
    '',
  ].join('\n');
}

export const estSouche = (contenu) => lf(contenu).includes(MARQUE_SOUCHE);

/**
 * En-tête d'un fichier exporté : { genre ('test', 'aides' ou null), version, source, empreinte, corps }.
 * Le corps suit la ligne d'empreinte ; son SHA-256 dit si le fichier a été retouché.
 */
export function lireEntete(contenu) {
  const lignes = lf(contenu).split('\n');
  let i = lignes[0] === '// @ts-nocheck' ? 1 : 0;
  const premiere = lignes[i] ?? '';
  const test = /^\/\/ Test écrit par scenario-playwright (\S+) \(exporter\.mjs\), sans IA, depuis le scénario ratifié (.+)\.$/.exec(premiere);
  const aides = /^\/\/ Aides des tests exportés, écrites par scenario-playwright (\S+) \(exporter\.mjs\)\.$/.exec(premiere);
  if (!test && !aides) return { genre: null };
  for (; i < lignes.length && lignes[i].startsWith('//'); i++) {
    const m = RE_EMPREINTE.exec(lignes[i]);
    if (m) return { genre: test ? 'test' : 'aides', version: (test ?? aides)[1], source: test ? test[2] : null, empreinte: m[1], corps: lignes.slice(i + 1).join('\n') };
  }
  return { genre: null };
}

/**
 * État d'un fichier au regard de son contenu nouveau : absent, identique, perime (écrit par le skill, non
 * retouché), retouche (écrit par le skill, corps modifié depuis), conflit (pas écrit par le skill).
 */
export function etatFichier(chemin, nouveau) {
  if (!existsSync(chemin)) return 'absent';
  const actuel = lf(readFileSync(chemin, 'utf8'));
  if (actuel === lf(nouveau)) return 'identique';
  const e = lireEntete(actuel);
  if (!e.genre) return 'conflit';
  return sha256(e.corps) === e.empreinte ? 'perime' : 'retouche';
}

/** Langage des tests du projet : ts si tsconfig.json ou playwright.config.ts, du dossier jusqu'au package.json. */
export function langageDuProjet(dossier) {
  let d = resolve(dossier);
  for (;;) {
    if (existsSync(join(d, 'tsconfig.json')) || existsSync(join(d, 'playwright.config.ts'))) return 'ts';
    if (existsSync(join(d, 'package.json'))) return 'js';
    const parent = dirname(d);
    if (parent === d) return 'js';
    d = parent;
  }
}

/** Test exporté comparé à sa source : { etat: 'a-jour' | 'perime' | 'retouche' | 'etranger' | 'source', message }. */
export function verifierExport(chemin) {
  const contenu = lf(readFileSync(chemin, 'utf8'));
  const e = lireEntete(contenu);
  if (e.genre !== 'test') return { etat: 'etranger', message: 'pas un test exporté par scenario-playwright' };
  if (sha256(e.corps) !== e.empreinte) return { etat: 'retouche', message: `retouché à la main depuis l'export : exporter.mjs --remplacer le régénère, en gardant la version retouchée à côté (D21.INV-2)` };
  const source = resolve(dirname(chemin), e.source);
  const g = genererTest(source, { dossierExport: dirname(chemin), langage: chemin.endsWith('.ts') ? 'ts' : 'js' });
  if (!g.scenario) return { etat: 'source', message: `source ${e.source} : ${g.erreurs.join(' ; ')}` };
  if (lf(g.contenu) !== contenu) return { etat: 'perime', message: `périmé : le scénario ${e.source}, ou la version du skill, a changé depuis l'export ; exporter.mjs --remplacer le régénère (D21.INV-1)` };
  return { etat: 'a-jour', message: `à jour, exporté de ${e.source}` };
}
```

## 11. Source `scripts/aides-export.mjs`

Les aides, telles qu'elles s'écrivent dans le projet, sous leur en-tête : ouverture d'un jeu, gardes, étapes, préparation et nettoyage, actions et vérifications qui passent par elles, appels.

<!-- fichier : scripts/aides-export.mjs -->
```javascript
// scenario-playwright 1.6.5 : aides des tests exportés, copiées dans le dossier de tests du projet (D21).
//
// Un test exporté ne dépend que de @playwright/test et de ce fichier. Les aides reprennent la sémantique du
// moteur du skill : attentes bornées sur un état, aucune étape rejouée, vérifications qui se poursuivent après
// un échec, garde des origines, WebSocket compris, garde des mutations hors du poste, appels de préparation
// et de nettoyage avec la session du navigateur et le jeton anti-CSRF recopié de son cookie, sans redirection
// suivie ni appel rejoué, nettoyage même après un échec, secrets masqués dans les messages. Réglages par variables :
// SCENARIO_ORIGINES remplace les origines du scénario (« http://127.0.0.1:4200=https://recette.exemple.fr,… »),
// SCENARIO_AUTORISER_MUTATIONS=1 autorise les modifications de données hors du poste.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { setTimeout as pause } from 'node:timers/promises';
import { URL, URLSearchParams } from 'node:url';
import { test } from '@playwright/test';

const INTERVALLES = [100, 250, 500, 1000];
const INTERVALLES_API = [250, 500, 1000, 2000];
const LIMITES = { corps: 65536, reponse: 262144, api: 1048576, fichier: 10485760, requetes: 500, appel: 1048576 };
const TYPES_RELEVES = new Set(['document', 'xhr', 'fetch']);
const HOTES_LOCAUX = new Set(['127.0.0.1', 'localhost', '[::1]', '::1']);
const JETONS_CSRF = [['XSRF-TOKEN', 'X-XSRF-TOKEN'], ['csrftoken', 'X-CSRFToken']];
const RE_SECRET = /pass|pwd|secret|token|jeton|api.?key|auth|session|cookie|signature|credential|otp|cvv|iban|card|carte/i;
const INDICES_STATUT = {
  401: "l'API ne reconnaît pas la session du navigateur : se connecter avant la préparation, ou, pour une API à jeton, préparer par un scénario",
  403: 'accès refusé : droits de l\'utilisateur, ou jeton anti-CSRF absent ou refusé',
};

class Echec extends Error {}

const estTable = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const normaliser = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const echapperRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const masquer = (v, cle = '') => (RE_SECRET.test(cle) && v !== undefined && v !== null ? '***' : Array.isArray(v) ? v.map((x) => masquer(x)) : estTable(v) ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, masquer(x, k)])) : v);
const enTexte = (v) => JSON.stringify(v);

export const estLocale = (origine) => { try { return HOTES_LOCAUX.has(new URL(origine).hostname); } catch { return false; } };

function origineHttp(adresse) {
  try {
    const u = new URL(adresse);
    const schema = { 'ws:': 'http:', 'wss:': 'https:', 'http:': 'http:', 'https:': 'https:' }[u.protocol];
    return schema ? `${schema}//${u.host}` : null;
  } catch {
    return null;
  }
}

/** Adresse lisible : sans ancre, valeurs des paramètres au nom de secret masquées. */
export function adresseMasquee(adresse) {
  let u;
  try { u = new URL(adresse); } catch { return String(adresse).replace(/[?#].*$/, ''); }
  const p = [...u.searchParams].map(([k, v]) => `${encodeURIComponent(k)}=${RE_SECRET.test(k) ? '***' : encodeURIComponent(v)}`).join('&');
  return `${u.origin}${u.pathname}${p ? `?${p}` : ''}`;
}

/** Une adresse correspond-elle à l'attendu ? Même règle que le moteur du skill (module actions). */
export function adresseCorrespond(courante, attendu, urlBase) {
  let u;
  try { u = new URL(courante); } catch { return false; }
  const prefixe = attendu.endsWith('*');
  const motif = prefixe ? attendu.slice(0, -1) : attendu;
  let obtenu;
  if (motif.startsWith('/')) {
    if (u.origin !== new URL(urlBase).origin) return false;
    obtenu = u.pathname + (motif.includes('?') || prefixe ? u.search : '');
  } else obtenu = u.href.replace(/#.*$/, '');
  const decode = (s) => { try { return decodeURIComponent(s.replace(/\+/g, ' ')); } catch { return s; } };
  obtenu = decode(obtenu);
  const voulu = decode(motif);
  return prefixe ? obtenu.startsWith(voulu) : obtenu === voulu;
}

export function sousEnsemble(attendu, obtenu) {
  if (Array.isArray(attendu)) return Array.isArray(obtenu) && attendu.every((a) => obtenu.some((o) => sousEnsemble(a, o)));
  if (estTable(attendu)) return estTable(obtenu) && Object.entries(attendu).every(([k, v]) => Object.hasOwn(obtenu, k) && sousEnsemble(v, obtenu[k]));
  return attendu === obtenu;
}

function lireCorps(texte) {
  if (typeof texte !== 'string' || texte === '') return null;
  try { return JSON.parse(texte); } catch { /* pas du JSON */ }
  return /^[^=&\s]+=[^&]*(?:&[^=&\s]+=[^&]*)*$/.test(texte) ? Object.fromEntries(new URLSearchParams(texte)) : null;
}

function extrait(attendu, obtenu) {
  const v = estTable(attendu) && estTable(obtenu) ? Object.fromEntries(Object.keys(attendu).map((k) => [k, Object.hasOwn(obtenu, k) ? obtenu[k] : '(absent)'])) : obtenu;
  const t = enTexte(masquer(v));
  return t.length > 300 ? `${t.slice(0, 300)}…` : t;
}

function requeteCorrespond(q, e, origines) {
  if (e.methode && q.methode !== e.methode) return false;
  let u;
  try { u = new URL(q.url); } catch { return false; }
  let motif = e.chemin;
  if (/^https?:\/\//i.test(motif)) {
    const o = /^https?:\/\/[^/?#]+/i.exec(motif)[0];
    if (u.origin !== new URL(o).origin) return false;
    motif = motif.slice(o.length) || '/';
  } else if (!origines.includes(u.origin)) return false;
  const prefixe = motif.endsWith('*');
  if (prefixe) motif = motif.slice(0, -1);
  const [chemin, requete] = motif.split('?');
  const decode = (x) => { try { return decodeURIComponent(x); } catch { return x; } };
  const re = new RegExp(`^${chemin.split(/(\{[^}]+\})/).map((p) => (/^\{[^}]+\}$/.test(p) ? '[^/]+' : echapperRe(p))).join('')}${prefixe ? '' : '/?$'}`);
  if (!re.test(decode(u.pathname))) return false;
  if (requete) for (const [k, v] of new URLSearchParams(requete)) if (!u.searchParams.getAll(k).includes(v)) return false;
  return true;
}

export function lireCsv(texte) {
  const premiere = texte.split('\n')[0] ?? '';
  const compter = (c) => premiere.split(c).length - 1;
  const sep = [';', ',', '\t'].reduce((m, c) => (compter(c) > compter(m) ? c : m), ';');
  const lignes = [];
  let ligne = [];
  let cellule = '';
  let guillemets = false;
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (guillemets) {
      if (c === '"' && texte[i + 1] === '"') { cellule += '"'; i++; } else if (c === '"') guillemets = false;
      else cellule += c;
    } else if (c === '"' && cellule === '') guillemets = true;
    else if (c === sep) { ligne.push(cellule); cellule = ''; } else if (c === '\n') { ligne.push(cellule); if (ligne.some((x) => x !== '')) lignes.push(ligne); ligne = []; cellule = ''; } else cellule += c;
  }
  ligne.push(cellule);
  if (ligne.some((x) => x !== '')) lignes.push(ligne);
  return lignes;
}

/** Interroge un état jusqu'à son obtention ou la fin du délai ; rend { ok, valeur, erreur }. */
async function sonder(lire, essai, delaiMs, intervalles = INTERVALLES) {
  const fin = Date.now() + delaiMs;
  let i = 0;
  let derniere = { ok: false };
  for (;;) {
    try {
      const valeur = await lire();
      if (essai(valeur)) return { ok: true, valeur };
      derniere = { ok: false, valeur };
    } catch (e) {
      derniere = { ok: false, erreur: e };
      if (/strict mode violation/.test(String(e?.message))) return derniere;
    }
    const reste = fin - Date.now();
    if (reste <= 0) return derniere;
    await pause(Math.min(intervalles[Math.min(i++, intervalles.length - 1)], reste));
  }
}

function messageErreur(e, delaiMs) {
  const brut = String(e?.message ?? e).replace(/\u001b\[[0-9;]*m/g, '');
  if (/strict mode violation/.test(brut)) return `cible ambiguë, ${/resolved to (\d+) elements/.exec(brut)?.[1] ?? 'plusieurs'} éléments trouvés, aucune action faite`;
  if (e?.name === 'TimeoutError' || /Timeout \d+ms exceeded/.test(brut)) return `délai de ${Math.round(delaiMs / 1000)} s dépassé`;
  return brut.split('\n')[0].slice(0, 500);
}

/** url_base dont l'origine est remplacée par sa correspondance, le reste tel qu'écrit. */
const avecOrigine = (adresse, vers) => { const o = new URL(adresse).origin; return adresse.replace(o, vers(o)); };

/** Valeur d'un paramètre ou d'un jeu : ${unique}, ou <unique> recopié du texte, y est remplacé (D20.INV-6). */
const avecUnique = (v, unique) => (typeof v === 'string' ? v.split('${unique}').join(unique).split('<unique>').join(unique) : v);
const valeursAvecUnique = (valeurs, unique) => ({ ...Object.fromEntries(Object.entries(valeurs).map(([k, v]) => [k, avecUnique(v, unique)])), unique });

const jetonExecution = () => Array.from({ length: 6 }, () => '0123456789abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 36)]).join('');
const EXECUTION = jetonExecution();

/** Correspondance des origines du scénario, par SCENARIO_ORIGINES. */
function correspondances() {
  const m = new Map();
  for (const paire of String(process.env.SCENARIO_ORIGINES ?? '').split(',').map((x) => x.trim()).filter(Boolean)) {
    const [de, vers] = paire.split('=').map((x) => x.trim());
    const a = origineHttp(de);
    const b = origineHttp(vers);
    if (!a || !b) throw new Echec(`SCENARIO_ORIGINES : « ${paire} » n'est pas « origine du scénario=origine jouée »`);
    m.set(a, b);
  }
  return m;
}

/**
 * Ouvre un jeu d'un scénario exporté dans la page du test : valeurs, garde des origines, garde des mutations,
 * relevé des requêtes. Rend l'objet du jeu, dont les méthodes jouent les étapes et les entrées.
 */
export async function ouvrir(page, definition, { parametres = {}, jeu = {}, indice = 0 } = {}) {
  const info = test.info();
  const carte = correspondances();
  const vers = (o) => carte.get(o) ?? o;
  const unique = `${EXECUTION}${(indice + 1).toString(36)}`;
  const valeurs = valeursAvecUnique({ ...parametres, ...jeu }, unique);
  const origines = definition.origines.map(vers);
  const urlBase = avecOrigine(definition.url_base, vers);
  const distantes = origines.filter((o) => !estLocale(o));
  const autorise = process.env.SCENARIO_AUTORISER_MUTATIONS === '1';
  if (definition.mutations.length && distantes.length && !autorise) {
    test.skip(true, `le scénario modifie des données (${definition.mutations.join(', ')}) et déclare des origines hors du poste (${distantes.join(', ')}) : SCENARIO_AUTORISER_MUTATIONS=1 pour l'autoriser, avec l'accord de l'équipe (D21.INV-3)`);
  }
  if (typeof page.context().routeWebSocket !== 'function') throw new Echec('@playwright/test 1.48 ou plus récent est requis : la garde des origines couvre aussi les WebSocket (D21.INV-3)');
  const permises = new Set(origines);
  await page.context().route('**/*', (route) => {
    const o = origineHttp(route.request().url());
    return o === null || permises.has(o) ? route.continue() : route.abort('blockedbyclient');
  });
  await page.context().routeWebSocket(/.*/, (ws) => {
    const o = origineHttp(ws.url());
    return o !== null && permises.has(o) ? ws.connectToServer() : ws.close({ code: 1008, reason: 'origine non déclarée par le scénario' });
  });
  const s = new Jeu(page, info, { definition, valeurs, origines, urlBase, autorise, vers });
  s.releverRequetes();
  return s;
}

class Jeu {
  constructor(page, info, { definition, valeurs, origines, urlBase, autorise, vers }) {
    Object.assign(this, { page, info, definition, v: valeurs, origines, urlBase, autorise, vers });
    this.gardees = new Map();
    this.echecVerifier = null;
    this.reseau = { requetes: [], debutAction: Date.now(), main: false };
    this.telechargements = new Map();
  }

  /** Scénario de préparation joué dans la même page, avec ses valeurs (D20.INV-5). */
  sous(definition, valeurs) {
    const s = Object.create(this);
    Object.assign(s, { definition, urlBase: avecOrigine(definition.url_base, this.vers), origines: definition.origines.map(this.vers), v: valeursAvecUnique(valeurs, this.v.unique), echecVerifier: null, telechargements: new Map() });
    return s;
  }

  /** Valeur gardée par une préparation ; une valeur non obtenue arrête l'étape (D20.INV-6). */
  g(nom) {
    if (!this.gardees.has(nom)) throw new Echec(`variable \${${nom}} non obtenue : aucune action faite (D20.INV-6)`);
    return this.gardees.get(nom);
  }

  /** Adresse jouée : relative à url_base, origines du scénario remplacées par leur correspondance. */
  adresse(texte) {
    const u = new URL(texte, this.urlBase);
    const o = this.vers(u.origin);
    return o === u.origin ? u.href : u.href.replace(u.origin, o);
  }

  fichier(rel) {
    return resolve(dirname(this.info.file), rel);
  }

  releverRequetes() {
    const enCours = new Map();
    const reseau = this.reseau;
    this.page.on('request', (req) => {
      let type;
      try { type = req.resourceType(); } catch { return; }
      if (!TYPES_RELEVES.has(type)) return;
      const q = { methode: req.method(), url: req.url(), quand: Date.now(), type, statut: null, fini: false, echec: null, corps: null, reponse: null, main: reseau.main };
      if (!q.main) {
        try {
          const d = req.postData();
          if (d !== null && d.length <= LIMITES.corps && !/multipart/i.test(req.headers()['content-type'] ?? '')) q.corps = d;
        } catch { /* corps illisible */ }
      }
      enCours.set(req, q);
      reseau.requetes.push(q);
      if (reseau.requetes.length > LIMITES.requetes) reseau.requetes.shift();
    });
    this.page.on('response', (rep) => {
      const q = enCours.get(rep.request());
      if (!q) return;
      q.statut = rep.status();
      if (!q.main && q.type !== 'document' && /json/i.test(rep.headers()['content-type'] ?? '')) {
        q.lecture = rep.body().then((corps) => {
          if (corps.length <= LIMITES.reponse) q.reponse = corps.toString('utf8');
          else q.reponseTropGrande = true;
        }, () => { q.interrompue = true; });
      }
    });
    this.page.on('requestfinished', async (req) => {
      const q = enCours.get(req);
      if (!q) return;
      enCours.delete(req);
      await q.lecture;
      q.fini = true;
    });
    this.page.on('requestfailed', (req) => {
      const q = enCours.get(req);
      if (!q) return;
      enCours.delete(req);
      q.fini = true;
      if (q.statut === null) q.echec = req.failure()?.errorText ?? 'échec';
      else if (q.reponse === null) q.interrompue = true;
    });
  }

  garderMutation() {
    const url = this.page.url();
    if (!/^https?:/.test(url)) throw new Echec(`étape de mutation sur ${url}, hors du poste, sans SCENARIO_AUTORISER_MUTATIONS=1 : aucune action faite (D21.INV-3)`);
    const o = new URL(url).origin;
    if (!estLocale(o) && !this.autorise) throw new Echec(`étape de mutation sur ${o}, hors du poste, sans SCENARIO_AUTORISER_MUTATIONS=1 : aucune action faite (D21.INV-3)`);
  }

  /**
   * Une étape, dans un test.step numéroté. Une vérification échouée n'arrête pas les vérifications
   * suivantes ; l'action suivante n'est pas jouée et le test échoue (D5.INV-4).
   */
  async etape(numero, titre, faire, { verifier = false, mutation = false, action = true } = {}) {
    if (this.echecVerifier && !verifier) throw this.echecVerifier;
    if (action) { this.reseau.debutAction = Date.now(); this.reseau.etape = numero; }
    const jouer = async () => {
      if (mutation) this.garderMutation();
      await faire();
    };
    if (!verifier) return test.step(`${numero}. ${titre}`, jouer);
    try {
      await test.step(`${numero}. ${titre}`, jouer);
    } catch (e) {
      this.echecVerifier ??= e;
    }
  }

  /** Fin d'une suite d'étapes : la première vérification échouée fait échouer le test. */
  fin() {
    if (this.echecVerifier) throw this.echecVerifier;
  }

  /** Étape à la main : la connexion écrite par l'équipe, puis l'état de fin attendu ; aucun corps relevé. */
  async main({ message, jusqua, delai }, connexion) {
    this.reseau.main = true;
    try {
      await connexion();
      if (jusqua.url) {
        const r = await sonder(() => this.page.url(), (u) => adresseCorrespond(u, jusqua.url, this.urlBase), delai);
        if (!r.ok) throw new Echec(`étape à la main « ${message} » non terminée en ${delai / 1000} s : l'adresse ${jusqua.url} n'est pas atteinte`);
      } else {
        const r = await sonder(() => jusqua.cible.isVisible(), (v) => v === ((jusqua.etat ?? 'visible') === 'visible'), delai);
        if (!r.ok) throw new Echec(`étape à la main « ${message} » non terminée en ${delai / 1000} s : la cible attendue n'est pas ${(jusqua.etat ?? 'visible') === 'visible' ? 'visible' : 'masquée'}`);
      }
    } finally {
      this.reseau.main = false;
    }
  }

  /** Préparation à sa place ; un échec arrête le jeu (D20.INV-4). */
  async preparation(numero, titre, faire) {
    if (this.echecVerifier) throw this.echecVerifier;
    await test.step(`p${numero}. préparation : ${titre}`, faire);
  }

  /** Nettoyage : une fois, même après un échec ; un échec est annoté sans changer le résultat (D20.INV-4). */
  async nettoyage(numero, titre, faire, requises = []) {
    const manquantes = requises.filter((n) => !this.gardees.has(n));
    if (manquantes.length) {
      this.info.annotations.push({ type: 'nettoyage non joué', description: `nettoyage ${numero} : ${manquantes.map((m) => `\${${m}}`).join(', ')} non obtenue${manquantes.length > 1 ? 's' : ''}, sa préparation n'a pas abouti (D20.INV-4)` });
      return;
    }
    try {
      await test.step(`n${numero}. nettoyage : ${titre}`, faire);
    } catch (e) {
      const message = e instanceof Echec ? e.message : messageErreur(e, 10_000);
      this.info.annotations.push({ type: 'nettoyage en échec', description: `nettoyage ${numero} : ${message} ; des données de l'exécution peuvent rester (D20.INV-4)` });
      console.warn(`AVERTISSEMENT nettoyage ${numero} en échec : ${message} ; des données de l'exécution peuvent rester (D20.INV-4)`);
    }
  }

  async naviguer(url, delai) {
    const adresse = this.adresse(url);
    const reponse = await this.page.goto(adresse, { timeout: delai, waitUntil: 'load' });
    if (reponse && reponse.status() >= 400) throw new Echec(`la page ${adresseMasquee(adresse)} répond ${reponse.status()}`);
  }

  async contient(cible, attendu, { exact = false, delai }) {
    const voulu = normaliser(attendu);
    const r = await sonder(() => cible.innerText({ timeout: Math.min(delai, 1000) }), (t) => (exact ? normaliser(t) === voulu : normaliser(t).includes(voulu)), delai);
    if (r.ok) return;
    if (r.erreur && /strict mode violation/.test(String(r.erreur.message))) throw new Echec(messageErreur(r.erreur, delai));
    throw new Echec(`attendu : ${exact ? `le texte « ${attendu} »` : `un texte qui contient « ${attendu} »`} ; obtenu : ${r.valeur !== undefined ? `texte « ${normaliser(r.valeur).slice(0, 200)} »` : `rien (${messageErreur(r.erreur, delai)})`}`);
  }

  async adresseAtteinte(attendu, delai) {
    const r = await sonder(() => this.page.url(), (u) => adresseCorrespond(u, attendu, this.urlBase), delai);
    if (!r.ok) throw new Echec(`attendu : l'adresse ${attendu} ; obtenu : adresse ${r.valeur}`);
  }

  async attendre({ etat, cible, url, texte }, delai) {
    if (etat === 'url') {
      const r = await sonder(() => this.page.url(), (u) => adresseCorrespond(u, url, this.urlBase), delai);
      if (!r.ok) throw new Echec(`l'adresse ${url} n'est pas atteinte en ${Math.round(delai / 1000)} s ; adresse : ${adresseMasquee(this.page.url())}`);
      return;
    }
    const lectures = {
      visible: [() => cible.isVisible(), (v) => v === true, 'visible'],
      masque: [() => cible.isVisible(), (v) => v === false, 'masqué'],
      actif: [() => cible.isEnabled({ timeout: Math.min(delai, 1000) }), (v) => v === true, 'actif'],
      inactif: [() => cible.isEnabled({ timeout: Math.min(delai, 1000) }), (v) => v === false, 'inactif'],
      texte: [() => cible.innerText({ timeout: Math.min(delai, 1000) }), (t) => normaliser(t).includes(normaliser(texte)), `avec le texte « ${texte} »`],
    };
    const [lire, essai, libelle] = lectures[etat];
    const r = await sonder(lire, essai, delai);
    if (r.ok) return;
    if (r.erreur && /strict mode violation/.test(String(r.erreur.message))) throw new Echec(messageErreur(r.erreur, delai));
    throw new Echec(`la cible n'est pas ${libelle} en ${Math.round(delai / 1000)} s`);
  }

  async telecharger(cible, nom, delai) {
    const [telechargement] = await Promise.all([this.page.waitForEvent('download', { timeout: delai }), cible.click({ timeout: delai })]);
    const propose = String(telechargement.suggestedFilename()).replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').slice(0, 120) || 'telechargement';
    const chemin = this.info.outputPath('telechargements', nom ? `${nom}${/\.[^.]+$/.exec(propose)?.[0] ?? ''}` : propose);
    await telechargement.saveAs(chemin);
    if (nom) this.telechargements.set(nom, chemin);
  }

  async capturer(cible, nom, { pleinePage = false, delai }) {
    const chemin = this.info.outputPath('captures', `${nom}.png`);
    if (cible) await cible.screenshot({ path: chemin, timeout: delai });
    else await this.page.screenshot({ path: chemin, fullPage: pleinePage, timeout: delai });
    await this.info.attach(nom, { path: chemin, contentType: 'image/png' });
  }

  async requete(e, delai) {
    const a = e.attendu ?? {};
    const depuis = this.reseau.debutAction;
    const lire = async () => this.reseau.requetes.filter((q) => q.quand >= depuis && requeteCorrespond(q, e, this.origines));
    const satisfait = (q) => q.fini && !q.echec && (a.statut !== undefined ? q.statut === a.statut : q.statut !== null && q.statut < 400)
      && (a.corps === undefined || sousEnsemble(a.corps, lireCorps(q.corps))) && (a.reponse === undefined || sousEnsemble(a.reponse, lireCorps(q.reponse)));
    const s = await sonder(lire, (liste) => liste.some(satisfait), delai);
    if (s.ok) return;
    const liste = s.valeur ?? [];
    const q = liste.find(satisfait) ?? liste.at(-1) ?? null;
    const quoi = `${e.methode ? `${e.methode} ` : ''}${e.chemin}`;
    if (!q) {
      const vues = this.reseau.requetes.filter((x) => x.quand >= depuis).slice(-5).map((x) => `${x.methode} ${adresseMasquee(x.url)}${x.statut ? ` ${x.statut}` : ''}`);
      throw new Echec(`aucune requête ${quoi} depuis l'étape ${this.reseau.etape ?? 1}${vues.length ? ` ; requêtes vues : ${vues.join(', ')}` : ' ; aucune requête de la page'}`);
    }
    const desig = `${q.methode} ${adresseMasquee(q.url)}`;
    if (!q.fini) throw new Echec(`requête ${desig} sans réponse en ${Math.round(delai / 1000)} s`);
    if (q.echec) throw new Echec(`requête ${desig} en échec : ${q.echec}`);
    const voulu = [a.statut !== undefined ? `statut ${a.statut}` : 'un statut inférieur à 400'];
    const obtenu = [`statut ${q.statut}`];
    if (a.corps !== undefined) { voulu.push(`corps ${enTexte(masquer(a.corps))}`); obtenu.push(q.main ? 'corps non relevé pendant une étape à la main' : q.corps === null ? 'corps absent ou non relevé' : `corps ${extrait(a.corps, lireCorps(q.corps))}`); }
    if (a.reponse !== undefined) { voulu.push(`réponse ${enTexte(masquer(a.reponse))}`); obtenu.push(q.main ? 'réponse non relevée pendant une étape à la main' : q.reponseTropGrande ? `réponse de plus de ${LIMITES.reponse} octets, non lue` : q.interrompue ? 'réponse interrompue avant la fin de sa lecture (la page a changé d\'adresse)' : q.reponse === null ? 'réponse non JSON, ou non relevée' : `réponse ${extrait(a.reponse, lireCorps(q.reponse))}`); }
    throw new Echec(`requête ${desig} : attendu : ${voulu.join(', ')} ; obtenu : ${obtenu.join(', ')}`);
  }

  async api(e, delai) {
    const adresse = new URL(this.adresse(e.chemin));
    if (!this.origines.includes(adresse.origin)) throw new Echec(`${adresse.origin} n'est pas parmi les origines du scénario : aucun appel fait (D19.INV-1)`);
    const a = e.attendu ?? {};
    const lire = async () => {
      const rep = await this.page.context().request.get(adresse.href, { maxRedirects: 0, failOnStatusCode: false, timeout: Math.max(1000, Math.min(delai, 10_000)) });
      try {
        const statut = rep.status();
        if (statut >= 300 && statut < 400) return { statut, redirection: rep.headers().location ?? '' };
        const corps = await rep.body();
        return corps.length > LIMITES.api ? { statut, trop: true } : { statut, texte: corps.toString('utf8') };
      } finally {
        await rep.dispose().catch(() => {});
      }
    };
    const json = (v) => { try { return JSON.parse(v.texte); } catch { return undefined; } };
    const satisfait = (v) => v.redirection === undefined && !v.trop && (a.statut !== undefined ? v.statut === a.statut : v.statut >= 200 && v.statut < 300)
      && (a.contient === undefined || (typeof a.contient === 'string' ? v.texte.includes(a.contient) : sousEnsemble(a.contient, json(v))))
      && (a.nombre === undefined || (Array.isArray(json(v)) && json(v).length === a.nombre));
    const s = await sonder(lire, (v) => satisfait(v) || v.redirection !== undefined, delai, INTERVALLES_API);
    const v = s.valeur;
    if (v?.redirection !== undefined) throw new Echec(`l'API répond ${v.statut}, redirection vers ${adresseMasquee(new URL(v.redirection, adresse).href)} non suivie (D19.INV-1)`);
    if (s.ok) return;
    const desig = `API GET ${adresseMasquee(adresse.href)}`;
    if (!v) throw new Echec(`${desig} : ${messageErreur(s.erreur, delai)}`);
    if (v.trop) throw new Echec(`${desig} : réponse de plus de ${LIMITES.api} octets, non lue`);
    const voulu = [a.statut !== undefined ? `statut ${a.statut}` : 'un statut 2xx'];
    const obtenu = [`statut ${v.statut}`];
    if (a.contient !== undefined) { voulu.push(typeof a.contient === 'string' ? `un corps qui contient « ${a.contient} »` : `les champs ${enTexte(masquer(a.contient))}`); obtenu.push(typeof a.contient === 'string' ? `corps « ${normaliser(v.texte).slice(0, 200)} »` : `corps ${extrait(a.contient, json(v))}`); }
    if (a.nombre !== undefined) { voulu.push(`un tableau de ${a.nombre} élément${a.nombre > 1 ? 's' : ''}`); obtenu.push(Array.isArray(json(v)) ? `${json(v).length} élément${json(v).length > 1 ? 's' : ''}` : 'pas un tableau JSON'); }
    throw new Echec(`${desig} : attendu : ${voulu.join(', ')} ; obtenu : ${obtenu.join(', ')}`);
  }

  async fichierTelecharge(nom, a) {
    const chemin = this.telechargements.get(nom);
    if (!chemin) throw new Echec(`aucun fichier téléchargé sous le nom « ${nom} » dans ce jeu`);
    const contenu = readFileSync(chemin);
    if (contenu.length > LIMITES.fichier) throw new Echec(`fichier ${nom} de plus de ${LIMITES.fichier} octets, non lu`);
    const texte = contenu.toString('utf8').replace(/^﻿/, '').replace(/\r\n?/g, '\n');
    const lignes = texte.split('\n').filter((l) => l.trim() !== '');
    const voulu = [];
    const obtenu = [];
    if (a.contient !== undefined && !texte.includes(a.contient)) { voulu.push(`un texte qui contient « ${a.contient} »`); obtenu.push(`début « ${normaliser(texte).slice(0, 120)} »`); }
    if (a.lignes !== undefined && lignes.length !== a.lignes) { voulu.push(`${a.lignes} ligne${a.lignes > 1 ? 's' : ''}`); obtenu.push(`${lignes.length} ligne${lignes.length > 1 ? 's' : ''}`); }
    if (a.csv !== undefined) {
      const table = lireCsv(texte);
      const entete = (table[0] ?? []).map((c) => c.trim());
      const k = entete.findIndex((c) => c.toLowerCase() === a.csv.colonne.trim().toLowerCase());
      const secret = RE_SECRET.test(a.csv.colonne);
      if (k < 0) { voulu.push(`une colonne « ${a.csv.colonne} »`); obtenu.push(`colonnes ${entete.join(', ').slice(0, 200)}`); } else {
        const valeurs = table.slice(1).map((l) => (l[k] ?? '').trim());
        if (!valeurs.includes(a.csv.valeur.trim())) {
          voulu.push(`la valeur « ${secret ? '***' : a.csv.valeur} » dans la colonne ${entete[k]}`);
          obtenu.push(secret ? `${valeurs.length} valeurs masquées` : `valeurs ${[...new Set(valeurs)].slice(0, 10).join(', ').slice(0, 200)}`);
        }
      }
    }
    if (voulu.length) throw new Echec(`fichier ${nom} : attendu : ${voulu.join(', ')} ; obtenu : ${obtenu.join(', ')}`);
  }

  /**
   * Appel de préparation ou de nettoyage : origine déclarée, session du navigateur et jeton anti-CSRF
   * recopié de son cookie, une fois, sans redirection suivie ; valeurs gardées d'une réponse JSON (D20.INV-2).
   */
  async appeler({ methode, chemin, corps, statut, garder, delai }) {
    const adresse = new URL(this.adresse(chemin));
    const desig = `${methode} ${adresseMasquee(adresse.href)}`;
    if (!this.origines.includes(adresse.origin)) throw new Echec(`${adresse.origin} n'est pas parmi les origines du scénario : aucun appel fait (D20.INV-2)`);
    if (!estLocale(adresse.origin) && !this.autorise) throw new Echec(`appel ${methode} sur ${adresse.origin}, hors du poste, sans SCENARIO_AUTORISER_MUTATIONS=1 : aucun appel fait (D21.INV-3)`);
    const contexte = this.page.context();
    const entetes = { accept: 'application/json' };
    const cookies = await contexte.cookies(adresse.href);
    for (const [cookie, entete] of JETONS_CSRF) {
      const c = cookies.find((x) => x.name === cookie);
      if (c) { entetes[entete] = decodeURIComponent(c.value); break; }
    }
    const options = { method: methode, headers: entetes, maxRedirects: 0, failOnStatusCode: false, timeout: delai };
    if (corps !== undefined) { entetes['content-type'] = 'application/json'; options.data = JSON.stringify(corps); }
    let rep;
    try {
      rep = await contexte.request.fetch(adresse.href, options);
    } catch (err) {
      throw new Echec(`${desig} : ${messageErreur(err, delai)}`);
    }
    try {
      const obtenu = rep.status();
      if (obtenu >= 300 && obtenu < 400) throw new Echec(`${desig} : l'API répond ${obtenu}, redirection vers ${adresseMasquee(new URL(rep.headers().location ?? '', adresse).href)} non suivie (D20.INV-2)`);
      const attendus = statut === undefined ? null : [].concat(statut);
      if (attendus ? !attendus.includes(obtenu) : obtenu < 200 || obtenu >= 300) {
        const indice = INDICES_STATUT[obtenu] ? ` (${INDICES_STATUT[obtenu]})` : '';
        throw new Echec(`${desig} : attendu : ${attendus ? `statut ${attendus.join(' ou ')}` : 'un statut 2xx'} ; obtenu : statut ${obtenu}${indice}`);
      }
      if (!garder) return;
      const brut = await rep.body();
      if (brut.length > LIMITES.appel) throw new Echec(`${desig} : réponse de plus de ${LIMITES.appel} octets, non lue : aucune valeur gardée`);
      let json;
      try { json = JSON.parse(brut.toString('utf8')); } catch { throw new Echec(`${desig} : réponse non JSON : aucune valeur gardée`); }
      for (const [nom, cheminJson] of Object.entries(garder)) {
        const v = cheminJson === '.' ? json : cheminJson.split('.').reduce((o, k) => (o === null || o === undefined ? undefined : Array.isArray(o) && /^\d+$/.test(k) ? o[Number(k)] : o[k]), json);
        if (v === undefined || v === null) throw new Echec(`${desig} : valeur « ${cheminJson} » absente de la réponse : ${nom} non gardée`);
        if (typeof v === 'object') throw new Echec(`${desig} : « ${cheminJson} » n'est pas une valeur simple de la réponse : ${nom} non gardée`);
        this.gardees.set(nom, String(v));
      }
    } finally {
      await rep.dispose().catch(() => {});
    }
  }
}
```

## 12. Source `scripts/exporter.mjs`

<!-- fichier : scripts/exporter.mjs -->
```javascript
#!/usr/bin/env node
// scenario-playwright 1.6.5 : exporte des scénarios ratifiés en tests @playwright/test du projet (D21).
//
// Usage : node <dossier du skill>/scripts/exporter.mjs <scénario.toml>... --dossier <dossier de tests du projet>
//           [--langage ts|js] [--comparer] [--remplacer]
// Écrit, dans le dossier désigné seulement, un test par scénario, les aides communes, et une fois la souche de
// connexion que l'équipe complète. Un fichier que le skill n'a pas écrit n'est jamais remplacé ; un test
// périmé ne l'est qu'avec --remplacer, et un test retouché à la main est d'abord gardé à côté (D21.INV-2).
// --comparer dit ce qui changerait, sans rien écrire. Code 0 si tout est écrit ou à jour, 1 si un fichier
// n'est pas écrit (conflit, périmé ou retouché sans --remplacer), 2 si un scénario ou une option est refusé.
import { existsSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { contenuAides, contenuConnexion, estSouche, etatFichier, genererTest, langageDuProjet, NOM_AIDES, NOM_CONNEXION } from './export.mjs';
import { estLocale } from './session.mjs';

const USAGE = 'Usage : node scripts/exporter.mjs <scénario.toml>... --dossier <dossier de tests du projet> [--langage ts|js] [--comparer] [--remplacer]';
const horodatage = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
// Chemins affichés avec des « / » sur tous les systèmes : npx playwright test lit son argument comme une
// expression régulière, où une barre oblique inverse de Windows serait un échappement.
const affiche = (p) => p.split(sep).join('/');

export function main(args) {
  const scenarios = [];
  let dossier = null;
  let langage = null;
  let comparer = false;
  let remplacer = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--dossier') dossier = args[++i] ?? '';
    else if (a === '--langage') langage = args[++i] ?? '';
    else if (a === '--comparer') comparer = true;
    else if (a === '--remplacer') remplacer = true;
    else if (a.startsWith('-')) { console.error(`ERREUR option inconnue : ${a}\n${USAGE}`); return 2; }
    else scenarios.push(a);
  }
  if (!scenarios.length) { console.error(`ERREUR aucun scénario\n${USAGE}`); return 2; }
  if (!dossier) { console.error(`ERREUR --dossier manquant : le dossier de tests du projet où écrire les tests\n${USAGE}`); return 2; }
  if (langage !== null && !['ts', 'js'].includes(langage)) { console.error(`ERREUR --langage vaut ts ou js\n${USAGE}`); return 2; }
  if (comparer && remplacer) { console.error(`ERREUR --comparer et --remplacer ne vont pas ensemble\n${USAGE}`); return 2; }
  const cible = resolve(dossier);
  if (!existsSync(cible) || !statSync(cible).isDirectory()) { console.error(`ERREUR dossier introuvable : ${dossier} ; le créer d'abord, le skill n'écrit que dans un dossier de tests existant (D21.INV-2)`); return 2; }
  const lang = langage ?? langageDuProjet(cible);
  const ext = lang === 'ts' ? 'ts' : 'mjs';
  const tests = [];
  let refus = false;
  for (const s of scenarios) {
    const g = genererTest(s, { dossierExport: cible, langage: lang });
    if (!g.scenario) { for (const e of g.erreurs) console.log(`ERREUR ${basename(s)} : ${e}`); refus = true; continue; }
    tests.push({ source: s, ...g });
  }
  if (refus) { console.log('Rien n\'est écrit : chaque scénario doit être valide, sa traduction contrôlée (D21.INV-1).'); return 2; }
  const memes = tests.filter((t, i) => tests.findIndex((u) => u.nom === t.nom) !== i).map((t) => t.nom);
  if (memes.length) { console.log(`ERREUR deux scénarios donneraient le même test : ${[...new Set(memes)].join(', ')} ; les exporter l'un après l'autre, dans des dossiers distincts\nRien n'est écrit.`); return 2; }
  const fichiers = [{ nom: `${NOM_AIDES}.${ext}`, contenu: contenuAides(lang), quoi: 'aides communes' }];
  for (const t of tests) {
    const s = t.scenario;
    const entrees = [s.preparation.length ? `préparation ${s.preparation.length}` : null, s.nettoyage.length ? `nettoyage ${s.nettoyage.length}` : null].filter(Boolean);
    fichiers.push({ nom: t.nom, contenu: t.contenu, quoi: `« ${s.titre} », ${s.etapes.length} étape${s.etapes.length > 1 ? 's' : ''}${s.jeux ? `, ${s.jeux.length} jeux` : ''}${entrees.length ? `, ${entrees.join(', ')}` : ''}` });
  }
  let code = 0;
  const rel = (f) => affiche(relative(process.cwd(), join(cible, f))) || f;
  for (const f of fichiers) {
    const chemin = join(cible, f.nom);
    const etat = etatFichier(chemin, f.contenu);
    if (etat === 'identique') { console.log(`à jour   ${rel(f.nom)} : ${f.quoi}`); continue; }
    if (etat === 'conflit') { console.log(`conflit  ${rel(f.nom)} : ce fichier n'a pas été écrit par le skill ; rien n'est remplacé (D21.INV-2)`); code = 1; continue; }
    if (comparer) { console.log(`${etat === 'absent' ? 'nouveau ' : etat === 'perime' ? 'périmé  ' : 'retouché'} ${rel(f.nom)} : ${f.quoi}`); if (etat !== 'absent') code = 1; continue; }
    if (etat === 'absent') { writeFileSync(chemin, f.contenu); console.log(`écrit    ${rel(f.nom)} : ${f.quoi}`); continue; }
    if (!remplacer) {
      console.log(`${etat === 'perime' ? 'périmé  ' : 'retouché'} ${rel(f.nom)} : ${etat === 'perime' ? 'le scénario ou le skill a changé' : 'retouché à la main depuis l\'export'} ; --remplacer pour le remplacer${etat === 'retouche' ? ', la version retouchée gardée à côté' : ''}`);
      code = 1;
      continue;
    }
    if (etat === 'retouche') {
      const garde = `${chemin}.avant-${horodatage()}`;
      renameSync(chemin, garde);
      console.log(`gardé    ${rel(basename(garde))} : la version retouchée`);
    }
    writeFileSync(chemin, f.contenu);
    console.log(`remplacé ${rel(f.nom)} : ${f.quoi}`);
  }
  const connexion = join(cible, `${NOM_CONNEXION}.${ext}`);
  if (tests.some((t) => t.avecMain)) {
    if (!existsSync(connexion)) {
      if (!comparer) { writeFileSync(connexion, contenuConnexion(lang)); console.log(`écrit    ${rel(`${NOM_CONNEXION}.${ext}`)} : souche de connexion, à compléter par l'équipe`); }
      else console.log(`nouveau  ${rel(`${NOM_CONNEXION}.${ext}`)} : souche de connexion`);
    }
    if (!existsSync(connexion) || estSouche(readFileSync(connexion, 'utf8'))) console.log(`note : la connexion reste à écrire dans ${rel(`${NOM_CONNEXION}.${ext}`)}, avec les comptes de test et les secrets de la CI ; le skill n'écrit aucun identifiant (D6.INV-2)`);
  }
  const distantes = [...new Set(tests.flatMap((t) => t.scenario.origines))];
  const avecMutations = tests.filter((t) => t.scenario.etapes.some((e) => e.mutation) || t.scenario.preparation.length || t.scenario.nettoyage.length);
  console.log(`note : origines du scénario : ${distantes.join(', ')} ; pour jouer ailleurs, SCENARIO_ORIGINES="${distantes[0] ?? 'origine'}=<origine jouée>,…"`);
  if (avecMutations.length) console.log(`note : ${avecMutations.length} test${avecMutations.length > 1 ? 's modifient' : ' modifie'} des données : hors du poste, ${avecMutations.length > 1 ? 'ils sont sautés' : 'il est sauté'} sans SCENARIO_AUTORISER_MUTATIONS=1${distantes.some((o) => !estLocale(o)) ? ' (le scénario déclare déjà des origines hors du poste)' : ''} (D21.INV-3)`);
  const ici = affiche(relative(process.cwd(), cible)) || '.';
  console.log(`Exporté : ${tests.length} test${tests.length > 1 ? 's' : ''} en ${lang === 'ts' ? 'TypeScript' : 'JavaScript'} dans ${ici} ; npx playwright test ${ici}`);
  return code;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main(process.argv.slice(2));
```

## 13. Source `scripts/resultats.mjs`

Lecture des rapports et des campagnes, clé du test, verdicts recalculés, JSON de Xray Cloud et Data Center, statut et copies d'écran des pas, format « custom » de Zephyr Scale et son archive, rapport de conformité (module `conformite`).

<!-- fichier : scripts/resultats.mjs -->
```javascript
#!/usr/bin/env node
// scenario-playwright 1.6.5 : résultats d'une exécution ou d'une campagne aux formats d'import de Xray et de
// Zephyr Scale (D21), et rapport de conformité à coller dans Jira (D22).
//
// Usage : node <dossier du skill>/scripts/resultats.mjs <dossier de résultats | rapport.json | dossier de campagne>...
//           --format xray|xray-dc|zephyr|jira [--cle CLÉ] [--execution CLÉ] [--preuves] [--sortie <dossier>]
// Lit le rapport.json de chaque exécution, ou ceux d'une campagne, et écrit des fichiers, que la personne qui en a
// le droit importe ou colle elle-même. xray : le JSON de Xray Cloud ; xray-dc : celui de Xray Data Center ; pour
// chaque test, le statut de son verdict (conforme, non conforme, bloqué : PASSED, FAILED, ABORTED ; PASS, FAIL,
// ABORTED), un commentaire, un exemple par jeu, et pour un test manuel converti dont le texte n'a pas changé
// depuis l'import, le statut de chacun de ses pas ; avec --preuves, les copies d'écran de chaque pas sur ce pas,
// les autres sur le test ; --execution pour verser les résultats dans une exécution de test existante. zephyr :
// le format « custom » de Zephyr Scale, en JSON et en archive .zip. jira : conformite-jira.txt, en balisage wiki
// de Jira Data Center, et conformite.html, page à copier-coller dans Jira Cloud, avec, sur --preuves, les copies
// d'écran sous leur nom stable dans captures-jira/. La clé du test est celle retenue à l'import, ou --cle. Rien
// n'est envoyé : le skill n'écrit jamais dans Jira, Xray ni Zephyr Scale ; aucune capture sans --preuves
// (D21.INV-4, D22.INV-4). Code 0 si les fichiers sont écrits, 2 si une option, un rapport ou une clé est refusé.
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { crc32 } from 'node:zlib';
import { capturesDuRapport, rapportHtml, rapportWiki } from './conformite.mjs';
import { lireProvenance } from './jira.mjs';
import { FORMAT_CAMPAGNE, LIBELLES_VERDICT, verdictDe, verdictDuJeu } from './rapport.mjs';
import { analyserTexte, empreinteTexte } from './texte.mjs';
import { lireToml } from './toml.mjs';

const USAGE = 'Usage : node scripts/resultats.mjs <dossier de résultats | rapport.json | dossier de campagne>... --format xray|xray-dc|zephyr|jira [--cle CLÉ] [--execution CLÉ] [--preuves] [--sortie <dossier>]';
const FORMATS = ['xray', 'xray-dc', 'zephyr', 'jira'];
const RE_CLE_XRAY = /^[A-Z][A-Z0-9_]*-\d+$/;
const RE_CLE_ZEPHYR = /^[A-Z][A-Z0-9_]*-T\d+$/;
const RE_PROVENANCE = /^# Scénario : @(\S+), (test|cas de test) (.+) ([A-Z][A-Z0-9_]*-T?\d+)$/;
const SOURCES_TESTS = ['Xray', 'Zephyr Scale', 'un fichier .feature', 'une archive .zip'];
/** Statuts de Xray par verdict, et des pas : Cloud et Data Center. Le champ des pièces jointes diffère aussi. */
const XRAY = {
  xray: { conforme: 'PASSED', non_conforme: 'FAILED', bloque: 'ABORTED', reussi: 'PASSED', echec: 'FAILED', afaire: 'TODO', preuves: 'evidence', variante: 'Cloud' },
  'xray-dc': { conforme: 'PASS', non_conforme: 'FAIL', bloque: 'ABORTED', reussi: 'PASS', echec: 'FAIL', afaire: 'TODO', preuves: 'evidences', variante: 'Data Center' },
};
const ZEPHYR = { conforme: 'Passed', non_conforme: 'Failed', bloque: 'Blocked' };

/**
 * Provenance du texte d'un rapport : { cle, sorte, retouche } d'un test importé de Xray ou de Zephyr Scale,
 * ou d'un fichier .feature ou d'une archive qui en vient ; null pour un texte écrit à la main ou venu de Jira.
 */
export function provenanceTest(texte) {
  const p = lireProvenance(texte);
  if (!p || !SOURCES_TESTS.includes(p.source)) return null;
  const m = String(texte).replace(/\r\n?/g, '\n').split('\n').map((l) => RE_PROVENANCE.exec(l)).find(Boolean);
  // Une étiquette attribuée par l'import, la source n'en donnant pas, n'est pas la clé d'un test.
  return { cle: m ? m[4] : p.attribuee ? null : p.etiquette, sorte: m ? m[3] : null, retouche: p.retouche };
}

const sha256 = (b) => createHash('sha256').update(b).digest('hex');

/**
 * Scénario joué d'un rapport : le fichier TOML de même empreinte, dans le dossier que cite sa campagne, dans
 * le dossier du scénario (le rapport est par défaut dans son sous-dossier resultats/), près du rapport ou dans
 * le dossier courant ; null sinon.
 */
function scenarioDuRapport(dossier, r, ailleurs = []) {
  const nom = r.scenario?.fichier;
  if (typeof nom !== 'string' || !nom || basename(nom) !== nom || typeof r.scenario.empreinte !== 'string') return null;
  for (const d of [...ailleurs, resolve(dossier, '..', '..'), resolve(dossier, '..'), dossier, process.cwd()]) {
    try { if (sha256(readFileSync(join(d, nom))) === r.scenario.empreinte) return join(d, nom); } catch { /* absent */ }
  }
  return null;
}

/**
 * Rapport d'une exécution : son chemin, son contenu, le scénario joué et son texte de départ s'ils sont
 * retrouvés ; `pasFiables` dit si le texte est celui que le scénario traduisait lors de l'exécution. Les
 * verdicts sont recalculés des étapes (D22.INV-3).
 */
function lireRapport(chemin, ailleurs = []) {
  const fichier = existsSync(chemin) && statSync(chemin).isDirectory() ? join(chemin, 'rapport.json') : chemin;
  let rapport;
  try { rapport = JSON.parse(readFileSync(fichier, 'utf8')); } catch { return { erreur: `${chemin} : rapport.json illisible` }; }
  if (rapport.format !== 'scenario-playwright.rapport/1' || !Array.isArray(rapport.jeux)) return { erreur: `${chemin} : pas un rapport de scenario-playwright` };
  const dossier = dirname(fichier);
  const toml = scenarioDuRapport(dossier, rapport, ailleurs);
  let texte = null;
  let pasFiables = false;
  if (toml && rapport.scenario.source) {
    try {
      texte = readFileSync(resolve(dirname(toml), rapport.scenario.source), 'utf8');
      pasFiables = empreinteTexte(texte) === lireToml(readFileSync(toml, 'utf8')).empreinte_source;
    } catch { texte = null; }
  }
  const jeux = rapport.jeux.map((j) => ({ ...j, ...verdictDuJeu(j) }));
  const verdict = verdictDe(jeux.map((j) => j.verdict));
  const premier = jeux.find((j) => j.verdict === verdict && j.cause);
  return { fichier, dossier, rapport, toml, texte, pasFiables, jeux, verdict, cause: premier?.cause ?? null, jeu: premier && jeux.length > 1 ? premier.numero : null };
}

/**
 * Entrées données : chaque dossier de résultats ou rapport.json, et chaque dossier de campagne, dont les
 * tests sont lus dans l'ordre de campagne.json. Rend { lus, campagne, erreurs } ; `campagne` est le dossier de
 * la campagne quand elle est la seule entrée.
 */
function lireEntrees(entrees) {
  const lus = [];
  const erreurs = [];
  let campagnes = 0;
  let dossierCampagne = null;
  for (const e of entrees) {
    const p = resolve(e);
    if (existsSync(join(p, 'campagne.json'))) {
      let c;
      try { c = JSON.parse(readFileSync(join(p, 'campagne.json'), 'utf8')); } catch { erreurs.push(`${e} : campagne.json illisible`); continue; }
      if (c.format !== FORMAT_CAMPAGNE || !Array.isArray(c.tests)) { erreurs.push(`${e} : pas une campagne de scenario-playwright`); continue; }
      campagnes++;
      dossierCampagne = p;
      for (const t of c.tests) {
        const dossier = typeof t.dossier === 'string' && basename(t.dossier) === t.dossier ? join(p, t.dossier) : null;
        if (!dossier) { erreurs.push(`${e} : test sans dossier de résultats`); continue; }
        const lu = lireRapport(dossier, typeof t.scenario === 'string' ? [resolve(p, dirname(t.scenario))] : []);
        if (lu.erreur) erreurs.push(lu.erreur); else lus.push({ ...lu, entree: `${e}/${t.dossier}` });
      }
      continue;
    }
    const lu = lireRapport(p);
    if (lu.erreur) erreurs.push(lu.erreur); else lus.push({ ...lu, entree: e });
  }
  return { lus, erreurs, campagne: campagnes === 1 && entrees.length === 1 ? dossierCampagne : null };
}

/** Commentaire d'un test : chaque jeu, son verdict, son étape en échec et son message, la préparation et le nettoyage en échec. */
function commentaire(lu) {
  return lu.jeux.map((j) => {
    const nom = lu.jeux.length > 1 ? `jeu ${j.numero}${Object.keys(j.valeurs ?? {}).length ? ` (${Object.entries(j.valeurs).filter(([k]) => k !== 'unique').map(([k, v]) => `${k} = ${v}`).join(', ')})` : ''}` : 'scénario';
    const p = j.preparation?.find((e) => e.statut === 'echec');
    const e = j.etapes.find((x) => x.statut === 'echec');
    const n = (j.nettoyage ?? []).filter((x) => x.statut === 'echec');
    const parties = [p ? `préparation ${p.numero} en échec : ${p.message}` : null, e ? `étape ${e.numero}${e.ligne ? ` (ligne ${e.ligne})` : ''} en échec : ${e.message}` : null, ...n.map((x) => `nettoyage ${x.numero} en échec : ${x.message}`)].filter(Boolean);
    return `${nom} : ${LIBELLES_VERDICT[j.verdict]}${parties.length ? ` ; ${parties.join(' ; ')}` : ''}`;
  }).join('\n');
}

/** Pas d'un test manuel converti : chacun, ce sont les lignes de son « Quand » et des étapes qui le suivent jusqu'au suivant. */
export function groupesDesPas(texte) {
  const { scenario } = analyserTexte(texte);
  if (!scenario) return null;
  const pas = [];
  for (const e of scenario.etapes) {
    if (/^quand$/i.test(e.motCle) || pas.length === 0) pas.push([e.ligne]);
    else pas.at(-1).push(e.ligne);
  }
  return pas;
}

/**
 * Statut de chaque pas d'un test manuel converti : un pas, ce sont ses lignes « Quand » puis « Alors » du texte ;
 * le pas échoue si l'une de leurs étapes échoue, passe si toutes passent, reste à faire sinon.
 */
export function statutsDesPas(texte, jeu, s = XRAY.xray) {
  const groupes = groupesDesPas(texte);
  if (!groupes) return null;
  return groupes.map((lignes) => {
    const etapes = jeu.etapes.filter((x) => lignes.includes(x.ligne));
    const ko = etapes.find((x) => x.statut === 'echec');
    if (ko) return { status: s.echec, actualResult: ko.message };
    if (etapes.length && etapes.every((x) => x.statut === 'reussie')) return { status: s.reussi };
    return { status: s.afaire };
  });
}

/** Copie d'écran en pièce jointe de Xray, sous son nom stable ; null si le fichier manque. */
function pieceJointe(lu, c) {
  const chemin = join(lu.dossier, c.chemin);
  if (!existsSync(chemin)) return null;
  return { data: readFileSync(chemin).toString('base64'), filename: c.nom, contentType: 'image/png' };
}

/**
 * Test au format JSON de Xray : { testKey, start, finish, status, comment, examples?, steps?, evidence? } ;
 * avec preuves, la copie d'écran d'une étape va sur son pas quand les pas sont rendus, les autres sur le test.
 */
function testXray(lu, cle, base, preuves, s) {
  const r = lu.rapport;
  const t = { testKey: cle, start: r.debut, finish: r.fin, status: s[lu.verdict], comment: commentaire(lu) };
  const p = lu.texte ? provenanceTest(lu.texte) : null;
  const captures = preuves ? capturesDuRapport({ ...r, jeux: lu.jeux }, base) : [];
  const surLesPas = new Set();
  if (lu.jeux.length > 1) t.examples = lu.jeux.map((j) => s[j.verdict]);
  else if (p?.sorte === 'manuel' && p.retouche === false && lu.pasFiables) {
    const groupes = groupesDesPas(lu.texte);
    const pas = groupes ? statutsDesPas(lu.texte, lu.jeux[0], s) : null;
    if (pas) {
      t.steps = pas.map((x, k) => {
        if (!preuves) return x;
        const lignes = groupes[k];
        const jointes = captures.filter((c) => c.ou.genre === 'etape' && lignes.includes(c.ou.ref.ligne));
        for (const c of jointes) surLesPas.add(c);
        const pj = jointes.map((c) => pieceJointe(lu, c)).filter(Boolean);
        return pj.length ? { ...x, [s.preuves]: pj } : x;
      });
    }
  }
  if (preuves) {
    const pj = captures.filter((c) => !surLesPas.has(c)).map((c) => pieceJointe(lu, c)).filter(Boolean);
    if (pj.length) t[s.preuves] = pj;
  }
  return t;
}

/** Archive .zip d'un seul fichier, sans compression, contrôlée par son CRC-32. */
export function archiveZip(nom, contenu) {
  const donnees = Buffer.from(contenu, 'utf8');
  const n = Buffer.from(nom, 'utf8');
  const crc = crc32(donnees) >>> 0;
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6); local.writeUInt16LE(0, 8);
  local.writeUInt32LE(0, 10); local.writeUInt32LE(crc, 14); local.writeUInt32LE(donnees.length, 18); local.writeUInt32LE(donnees.length, 22);
  local.writeUInt16LE(n.length, 26); local.writeUInt16LE(0, 28);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x0800, 8); central.writeUInt16LE(0, 10);
  central.writeUInt32LE(0, 12); central.writeUInt32LE(crc, 16); central.writeUInt32LE(donnees.length, 20); central.writeUInt32LE(donnees.length, 24);
  central.writeUInt16LE(n.length, 28); central.writeUInt16LE(0, 30); central.writeUInt16LE(0, 32); central.writeUInt16LE(0, 34); central.writeUInt16LE(0, 36);
  central.writeUInt32LE(0, 38); central.writeUInt32LE(0, 42);
  const debutCentral = local.length + n.length + donnees.length;
  const fin = Buffer.alloc(22);
  fin.writeUInt32LE(0x06054b50, 0); fin.writeUInt16LE(0, 4); fin.writeUInt16LE(0, 6); fin.writeUInt16LE(1, 8); fin.writeUInt16LE(1, 10);
  fin.writeUInt32LE(central.length + n.length, 12); fin.writeUInt32LE(debutCentral, 16); fin.writeUInt16LE(0, 20);
  return Buffer.concat([local, n, donnees, central, n, fin]);
}

const souche = (fichier) => basename(String(fichier ?? 'scenario'), '.toml').replace(/[^A-Za-z0-9_-]+/g, '-') || 'scenario';

export function main(args) {
  const entrees = [];
  let format = null;
  let cleImposee = null;
  let execution = null;
  let preuves = false;
  let sortie = null;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--format') format = args[++i] ?? '';
    else if (a === '--cle') cleImposee = args[++i] ?? '';
    else if (a === '--execution') execution = args[++i] ?? '';
    else if (a === '--preuves') preuves = true;
    else if (a === '--sortie') sortie = args[++i] ?? '';
    else if (a.startsWith('-')) { console.error(`ERREUR option inconnue : ${a}\n${USAGE}`); return 2; }
    else entrees.push(a);
  }
  if (!entrees.length) { console.error(`ERREUR aucun dossier de résultats\n${USAGE}`); return 2; }
  if (!FORMATS.includes(format)) { console.error(`ERREUR --format vaut xray, xray-dc, zephyr ou jira\n${USAGE}`); return 2; }
  if (preuves && format === 'zephyr') { console.error('ERREUR --preuves ne vaut que pour Xray et pour Jira : le format « custom » de Zephyr Scale ne porte pas de pièce jointe'); return 2; }
  if (execution !== null && !XRAY[format]) { console.error('ERREUR --execution ne vaut que pour xray et xray-dc'); return 2; }
  if (execution !== null && !RE_CLE_XRAY.test(execution)) { console.error(`ERREUR --execution : « ${execution} » n'est pas une clé d'exécution de test Xray (PROJET-123)`); return 2; }
  const { lus: tous, erreurs, campagne } = lireEntrees(entrees);
  if (cleImposee !== null && (entrees.length > 1 || tous.length > 1)) { console.error('ERREUR --cle ne vaut que pour un seul dossier de résultats'); return 2; }
  let refus = erreurs.length > 0;
  for (const e of erreurs) console.log(`ERREUR ${e}`);
  const forme = format === 'zephyr' ? RE_CLE_ZEPHYR : RE_CLE_XRAY;
  const lus = [];
  for (const lu of tous) {
    const p = lu.texte ? provenanceTest(lu.texte) : null;
    const cle = cleImposee ?? p?.cle ?? null;
    const outil = format === 'zephyr' ? 'Zephyr Scale' : 'Xray';
    if (!cle && format !== 'jira') {
      const pourquoi = !lu.toml ? `le scénario ${lu.rapport.scenario?.fichier ?? ''} joué n'est pas retrouvé près du rapport, avec la même empreinte` : !lu.texte ? 'le scénario ne cite pas de texte de départ lisible' : `le texte de départ n'a pas été importé d'un test de ${outil}`;
      console.log(`ERREUR ${lu.entree} : aucune clé de test, ${pourquoi} ; --cle la donne (D21.INV-4)`);
      refus = true;
      continue;
    }
    if (cle && format !== 'jira' && !forme.test(cle)) { console.log(`ERREUR ${lu.entree} : « ${cle} » n'est pas une clé de ${format === 'zephyr' ? 'cas de test Zephyr Scale (PROJET-T123)' : 'test Xray (PROJET-123)'}`); refus = true; continue; }
    if (cle && format === 'jira' && !RE_CLE_XRAY.test(cle) && !RE_CLE_ZEPHYR.test(cle)) { console.log(`ERREUR ${lu.entree} : « ${cle} » n'est pas une clé de test (PROJET-123 ou PROJET-T123)`); refus = true; continue; }
    if (XRAY[format] && cleImposee === null && p?.sorte === 'manuel' && lu.jeux.length === 1 && !(p.retouche === false && lu.pasFiables)) {
      console.log(`note : ${cle} : ${p.retouche !== false ? 'texte retouché depuis l\'import' : 'texte changé depuis l\'exécution'}, les pas ne correspondent plus sûrement à ceux de Xray : statut du test seulement`);
    }
    lus.push({ ...lu, cle, base: cle ?? souche(lu.rapport.scenario?.fichier) });
  }
  const bases = lus.map((l) => l.base);
  const doublons = [...new Set(bases.filter((b, k) => bases.indexOf(b) !== k))];
  if (format === 'jira' && doublons.length) { console.log(`ERREUR deux tests donneraient les mêmes noms de copies d'écran : ${doublons.join(', ')} ; les rendre en deux fois`); refus = true; }
  if (refus) { console.log('Rien n\'est écrit.'); return 2; }
  const dossierSortie = resolve(sortie ?? campagne ?? (lus.length === 1 ? lus[0].dossier : '.'));
  if (!existsSync(dossierSortie)) { console.log(`ERREUR dossier de sortie introuvable : ${sortie}`); return 2; }
  const nomBase = campagne ? 'campagne' : lus.length === 1 ? souche(lus[0].rapport.scenario.fichier) : 'resultats';
  const rel = (f) => relative(process.cwd(), f) || f;

  if (XRAY[format]) {
    const s = XRAY[format];
    const debut = lus.map((l) => l.rapport.debut).sort()[0];
    const fin = lus.map((l) => l.rapport.fin).sort().at(-1);
    const xray = {
      ...(execution ? { testExecutionKey: execution } : {}),
      info: { summary: campagne ? `scenario-playwright : campagne, ${lus.length} test${lus.length > 1 ? 's' : ''}` : lus.length === 1 ? `scenario-playwright : ${lus[0].rapport.scenario.titre}` : `scenario-playwright : ${lus.length} scénarios`, description: 'Résultats écrits par scenario-playwright (resultats.mjs), à importer dans Xray par une personne qui en a le droit.', startDate: debut, finishDate: fin },
      tests: lus.map((l) => testXray(l, l.cle, l.base, preuves, s)),
    };
    const chemin = join(dossierSortie, `xray-${nomBase}.json`);
    writeFileSync(chemin, `${JSON.stringify(xray, null, 2)}\n`);
    for (const t of xray.tests) {
      const pj = (t[s.preuves]?.length ?? 0) + (t.steps ?? []).reduce((n, x) => n + (x[s.preuves]?.length ?? 0), 0);
      console.log(`ok  ${t.testKey} : ${t.status}${t.steps ? `, ${t.steps.length} pas` : ''}${t.examples ? `, ${t.examples.length} exemples` : ''}${pj ? `, ${pj} capture${pj > 1 ? 's' : ''}` : ''}`);
    }
    console.log(`Écrit : ${rel(chemin)}, au format JSON de Xray ${s.variante}${execution ? `, pour l'exécution ${execution}` : ''} ; à importer dans Xray (Import Execution Results), rien n'est envoyé par le skill (D21.INV-4)`);
    return 0;
  }

  if (format === 'jira') {
    const tests = lus.map((l) => ({ cle: l.cle, base: l.base, rapport: l.rapport, jeux: l.jeux, verdict: l.verdict, cause: l.cause, jeu: l.jeu, captures: capturesDuRapport({ ...l.rapport, jeux: l.jeux }, l.base), dossier: l.dossier }));
    const image = (t, chemin) => (existsSync(join(t.dossier, chemin)) ? readFileSync(join(t.dossier, chemin)).toString('base64') : null);
    const wiki = join(dossierSortie, 'conformite-jira.txt');
    const html = join(dossierSortie, 'conformite.html');
    writeFileSync(wiki, rapportWiki(tests, { preuves }));
    writeFileSync(html, rapportHtml(tests, { preuves, image }));
    let copiees = 0;
    if (preuves) {
      // Le dossier captures-jira est celui du skill : ses anciennes copies sont retirées, les nouvelles écrites.
      const d = join(dossierSortie, 'captures-jira');
      if (existsSync(d)) for (const f of readdirSync(d)) if (/\.png$/i.test(f)) rmSync(join(d, f));
      mkdirSync(d, { recursive: true });
      for (const t of tests) for (const c of t.captures) {
        if (!existsSync(join(t.dossier, c.chemin))) continue;
        copyFileSync(join(t.dossier, c.chemin), join(d, c.nom));
        copiees++;
      }
    }
    for (const t of tests) console.log(`ok  ${t.base} : ${LIBELLES_VERDICT[t.verdict]}${t.cause ? ` (${t.jeu ? `jeu ${t.jeu}, ` : ''}${t.cause.genre === 'preparation' ? 'préparation' : 'étape'} ${t.cause.numero})` : ''}`);
    console.log(`Écrit : ${rel(wiki)} (balisage wiki de Jira Data Center) et ${rel(html)} (à ouvrir, puis à copier-coller dans Jira Cloud)${preuves ? ` ; ${copiees} copie${copiees > 1 ? 's' : ''} d'écran dans ${rel(join(dossierSortie, 'captures-jira'))}, à joindre au ticket` : ' ; sans copie d\'écran : --preuves les ajoute'} ; rien n'est envoyé par le skill (D22.INV-4)`);
    return 0;
  }

  const zephyr = { version: 1, executions: lus.map((l) => ({ source: l.rapport.scenario.fichier, result: ZEPHYR[l.verdict], testCase: { key: l.cle } })) };
  const texte = `${JSON.stringify(zephyr, null, 2)}\n`;
  const json = join(dossierSortie, `zephyr-${nomBase}.json`);
  const zip = join(dossierSortie, `zephyr-${nomBase}.zip`);
  writeFileSync(json, texte);
  writeFileSync(zip, archiveZip(`zephyr-${nomBase}.json`, texte));
  for (const x of zephyr.executions) console.log(`ok  ${x.testCase.key} : ${x.result}`);
  console.log(`Écrit : ${rel(json)} et ${rel(zip)}, au format « custom » de Zephyr Scale ; l'archive s'envoie à l'import des résultats d'automatisation, rien n'est envoyé par le skill (D21.INV-4)`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main(process.argv.slice(2));
```
