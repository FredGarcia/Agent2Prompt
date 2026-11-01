---
name: pilotage
description: Interface locale de pilotage des tests SonarQube (script Node sans dépendance servi sur la boucle locale, clé de session, détection des modes de connexion, test de connexion par l'un ou l'autre mode d'API, périmètre du diff, règles actives du profil avec cache, analyse éphémère par lot d'écritures validé, précédée des tests du projet dont les résultats et la couverture remontent dans SonarQube, dossier du projet pour un monodépôt back et front, suppression vérifiée de la branche de travail, export CSV des règles des langages du projet, actives ou non dans son profil, dossier de relecture, commande du serveur MCP, constats par moteur, journal des appels sans jeton, recette de vingt-six scénarios contre un faux SonarQube et recette réelle de cinq scénarios contre l'instance du développeur). À lire pour piloter l'examen local depuis un navigateur.
dimensions: [D10]
status: active
---

# Module `pilotage` (D10)

L'interface de pilotage met l'examen local (module `examen-local`) à portée d'un navigateur : choisir le mode de connexion, calculer le périmètre, lire les règles du profil, lancer une analyse éphémère après validation du lot d'écritures, préparer le dossier de relecture, lire les constats et le journal des appels. Elle n'ajoute aucune règle : elle applique par programme celles des modules `cadrage-acces` et `examen-local` (D10.INV-4).

Elle est facultative. L'expert peut conduire l'examen local au terminal ; l'interface sert quand le développeur préfère cliquer, ou veut un journal des appels prêt pour le rapport.

## 1. Architecture

```mermaid
flowchart LR
  N["Navigateur<br/>127.0.0.1, clé de session"] -->|"JSON, en-tête x-pilote-cle"| P["pilote-sonar.mjs<br/>processus Node local"]
  P -->|"git fetch, merge-base, diff"| G[("Dépôt local")]
  P -->|"API web, jeton du processus"| S["Instance SonarQube"]
  P -->|"lot validé : scanner"| SC["mvn ou npx<br/>sous local-…"]
  SC --> S
  P --> L[".sonar-local/<br/>cache des règles, diff,<br/>dossier de relecture"]
```

Le jeton n'existe que dans l'environnement du processus du pilote, puis dans celui du scanner qu'il lance. Le navigateur n'en reçoit que la présence ; le journal, les erreurs et la sortie du scanner sont expurgés (D10.INV-2).

## 2. Lancer

```bash
# Dans le dépôt du projet, avec SONAR_HOST_URL et SONAR_TOKEN dans l'environnement
read -rs SONAR_TOKEN && export SONAR_TOKEN        # saisie masquée, rien dans l'historique
export SONAR_HOST_URL=https://sonar.exemple.org
node .skills/sonarqube/outils/pilote-sonar.mjs --racine . --port 8765
```

Le pilote affiche une adresse `http://127.0.0.1:8765/?cle=<clé>` : c'est la seule qui ouvre l'interface. La clé change à chaque lancement. Node 20 ou plus récent ; aucune dépendance à installer.

## 3. Écrans

| Écran | Ce qu'il fait | Appels | Règle appliquée |
|---|---|---|---|
| 1. Connexion | détecte les modes du module `cadrage-acces`, § 3 bis ; teste le mode d'API retenu, Bearer ou jeton en nom d'utilisateur ; relève version, édition, compte | `/api/authentication/validate`, `/api/server/version`, `/api/navigation/global`, `/api/users/current`, `GET <hôte>/mcp` | D1.INV-4, D1.INV-5 |
| 2. Projet et périmètre | `git fetch`, base de fusion avec `origin/<cible>`, fichiers et lignes du diff, modifications non commitées | git seulement | D9.INV-3 |
| 3. Règles du profil | profils du projet, règles actives paginées, cache invalidé par `rulesUpdatedAt` ; export CSV de toutes les règles des langages du projet, avec la colonne « active dans le profil du projet » ; dossier de relecture | `/api/qualityprofiles/search`, `/api/rules/search` | D9.INV-4 |
| 4. Analyse éphémère | propose le lot de deux écritures, avec la commande exacte, les tests du projet lancés avant et l'appel de suppression ; exécute seulement après « Valider et lancer » ; lit gate, constats, tests et couverture sur la branche de travail | tests du projet, scanner, `/api/project_branches/list`, `/api/qualitygates/project_status`, `/api/issues/search`, `/api/measures/component`, `/api/hotspots/search`, `/api/project_branches/delete` | D1.INV-3, D9.INV-2, D9.INV-7, D10.INV-3 |
| 5. Moteur SonarLint | affiche la commande du serveur MCP, sans valeur de jeton | aucun | D1.INV-2 |
| 6. Constats | tests et couverture lus dans SonarQube ; tableau par moteur ; constats hors périmètre comptés à part | aucun | D9.INV-1, D6.INV-2 |
| 7. Journal | méthode, chemin, statut, écriture ou non, sans jeton | aucun | D6.INV-1, D10.INV-2 |

La relecture par les règles reste le travail de l'expert : le pilote prépare `.sonar-local/relecture-<HEAD>.md`, avec le diff et les règles actives, et l'expert y répond selon le module `examen-local`, § 7.

## 4. API du pilote

Toutes les routes exigent l'en-tête `x-pilote-cle` ; la page exige le paramètre `cle`. Un en-tête `Host` autre que `127.0.0.1`, `localhost` ou `[::1]` est refusé, ce qui ferme la porte au rebond DNS (D10.INV-1).

| Route | Corps | Réponse |
|---|---|---|
| `GET /api/etat` | | modes de connexion, présence du jeton |
| `POST /api/connexion` | `{ mode: "bearer" \| "basic" }` | version, édition, login |
| `POST /api/perimetre` | `{ cible }` | base, HEAD, fichiers, lignes, non commité |
| `POST /api/regles` | `{ projet }` | profils et règles actives |
| `POST /api/regles/export` | `{ projet }` | CSV (séparateur « ; », UTF-8 avec BOM), total, actives, copie dans `.sonar-local/` |
| `POST /api/relecture` | `{ projet }` | chemin du dossier de relecture |
| `POST /api/ephemere/proposer` | `{ projet, type: "maven" \| "npm" \| "personnalise", base?, tests?, sansTests?, dossier? }` | lot : identifiant, branche, tests du projet, écritures exactes |
| `POST /api/ephemere/lancer` | `{ id }` | tests, gate, mesures, constats, hors périmètre, suppression, limites |
| `GET /api/journal` | | appels à l'API |
| `GET /api/mcp` | | commande du serveur MCP |

### 4.1 Les tests du projet passent par SonarQube (D9.INV-7)

SonarQube n'exécute pas les tests : il importe leurs rapports. Le pilote lance donc les tests du projet juste avant l'analyse éphémère, pour que leurs résultats et la couverture remontent dans l'instance et comptent dans le quality gate de la branche de travail.

| Préréglage | Tests du projet | Analyse | Ce qui remonte |
|---|---|---|---|
| `maven` (back) | dans `mvn verify` : JUnit, puis rapport JaCoCo | `mvn -B verify … sonar:sonar -Dmaven.test.failure.ignore=true -Dsonar.qualitygate.wait=true` | nombre de tests, échecs, erreurs, ignorés (rapports Surefire), couverture |
| `npm` (front) | `npx ng test --watch=false --code-coverage` (modifiable) | `npx @sonar/scan -Dsonar.qualitygate.wait=true` | couverture LCOV ; le nombre de tests du front exige un rapport d'exécution au format générique (`sonar.testExecutionReportPaths`), à configurer dans le projet |
| `personnalise` | commande libre, facultative | commande libre, sans branche, MR ni jeton | selon les rapports produits |

- **Un test en échec n'arrête pas l'examen** : côté Maven, `-Dmaven.test.failure.ignore=true` laisse l'analyse se faire, et l'échec est importé ; côté npm, l'analyse suit même si la commande de tests sort en erreur. Dans les deux cas, le rapport le signale.
- **Quality gate en échec** : avec `sonar.qualitygate.wait=true`, le scanner sort en erreur quand le gate échoue. Le pilote lit donc l'instance dès que la branche de travail existe, quel que soit le code de sortie ; si elle n'existe pas, il le dit et ne présente aucun constat.
- **Mesures lues** : `tests`, `test_failures`, `test_errors`, `skipped_tests`, `coverage`, `new_coverage`, sur la branche de travail. Une couverture absente est signalée (D2.INV-2), un test en échec aussi.
- **Monodépôt** : le champ « dossier du projet » (`web` pour un front dans `web/`) fixe où tournent tests et scanner, et ramène les chemins des constats à la racine du dépôt pour les filtrer au périmètre.
- **Sans tests** : la case « Ne pas lancer les tests » est possible, mais le lot l'annonce : couverture et résultats seront absents de l'analyse.

### 4.2 Validité d'un lot

Un lot vaut dix minutes et ne sert qu'une fois ; un identifiant inconnu, expiré ou déjà employé renvoie 409 sans rien écrire. Une commande personnalisée qui fixerait elle-même `sonar.branch.name`, une merge request ou un jeton est refusée : le pilote ajoute toujours `-Dsonar.branch.name=local-…` et `-Dsonar.newCode.referenceBranch=<cible>`, et retire de l'environnement du scanner les variables `CI_MERGE_REQUEST_*`.

## 5. Matérialiser les fichiers exécutables

Trois fichiers sont tirés des blocs annotés `<!-- fichier : chemin -->` de ce module, à l'identique, par programme plutôt qu'à la main. Depuis le dossier où le skill est matérialisé (`.skills/sonarqube/`) :

```text
node -e "const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'); const attendu = { 'outils/pilote-sonar.mjs': 'c0f6de3fba684c75363af269ac927f3b406f85a7bba2e1f403e5720153504bf1', 'tests/pilote-sonar.test.mjs': 'b827e26b1c90ab9aa2ce104a5105f1af7802e215b46a11bc43be9c1ac302ada7', 'tests/pilote-sonar.reel.test.mjs': 'bd4ea3fb36ebe5d87185a3de777d061e0b7818d4a2a88e73686e2cc29d98fa12' }; let ecarts = 0, vus = 0; const texte = fs.readFileSync('modules/pilotage/SKILL.md', 'utf8').replace(/\r\n/g, '\n'); for (const m of texte.matchAll(/^<\x21-- fichier : (\S+) -->\n\x60{3}[a-z]*\n([\s\S]*?)\n\x60{3}\n/gm)) { vus++; const contenu = m[2] + '\n'; fs.mkdirSync(path.dirname(m[1]), { recursive: true }); fs.writeFileSync(m[1], contenu); const conforme = crypto.createHash('sha256').update(contenu).digest('hex') === attendu[m[1]]; if (!conforme) ecarts++; console.log((conforme ? 'conforme  ' : 'ECART     ') + m[1]); } if (vus !== Object.keys(attendu).length) { console.log('fichiers trouvés : ' + vus); ecarts++; } if (ecarts > 0) process.exitCode = 1;"
```

Chaque fichier conforme est signalé `conforme` ; un écart arrête la commande avec un code non nul. Ne corrige pas un fichier en écart : signale-le au développeur.

## 6. Recette

Deux recettes, la première toujours, la seconde contre ton instance.

### 6.1 Recette simulée

```bash
node --test tests/pilote-sonar.test.mjs
```

Vingt-six scénarios, P1 à P26, contre un faux SonarQube local, un dépôt git temporaire avec un back Java et un front TypeScript dans `web/`, un faux scanner, et de faux `mvn` et `npx` placés en tête du `PATH` ; aucun réseau externe. La CI du dépôt Agent2Prompt la rejoue sous Linux et Windows, avec Node 20 et 22, à partir de la transmission courante.

| Scénario | Invariants |
|---|---|
| P1 nom de la branche de travail | D9.INV-2 |
| P2 deux modes d'API | D1.INV-5 |
| P3 commande de scanner refusée si elle fixe branche, MR ou jeton | D9.INV-2, D1.INV-2 |
| P4 lignes modifiées et périmètre d'un constat | D9.INV-3 |
| P5 environnement du scanner sans variables de MR | D9.INV-2 |
| P6 clé de session et Host local exigés | D10.INV-1 |
| P7 jeton absent de tout ce que reçoit le navigateur | D10.INV-2 |
| P8 connexion par l'un ou l'autre mode, relevé de l'instance | D1.INV-4, D1.INV-5 |
| P9 périmètre et non commité | D9.INV-3 |
| P10 règles actives, pagination et cache | D9.INV-4 |
| P11 rien n'est écrit sans lot valide | D10.INV-3 |
| P12 analyse éphémère complète, constats filtrés et étiquetés, suppression vérifiée | D9.INV-1, D9.INV-2, D10.INV-4 |
| P13 suppression même si le scanner échoue | D9.INV-2 |
| P14 échec de suppression rapporté | D9.INV-2 |
| P15 journal sans jeton, écriture marquée | D10.INV-2, D6.INV-1 |
| P16 dossier de relecture | D9.INV-1, D9.INV-4 |
| P17 préréglage npm : tests du front avant l'analyse, dans `web/` | D9.INV-7 |
| P18 préréglage Maven : tests dans `verify`, échecs importés | D9.INV-7 |
| P19 tests et couverture lus sur la branche, échecs signalés | D9.INV-7, D6.INV-2 |
| P20 couverture absente signalée, tests non lancés annoncés | D2.INV-2, D9.INV-7 |
| P21 front TypeScript : constats ramenés au dépôt, profil TS en cache propre | D9.INV-1, D9.INV-3, D9.INV-4 |
| P22 tests en échec : analyse poursuivie, branche supprimée | D9.INV-2, D9.INV-7 |
| P23 dossier du projet et commande de tests vérifiés | D1.INV-2 |
| P24 valeur d'une mesure, directe ou de période | D6.INV-2 |
| P25 analyse absente : aucun constat inventé, suppression tentée | D9.INV-1, D9.INV-2 |
| P26 export CSV des règles, actives ou non dans le profil | D9.INV-4, D10.INV-2 |

Répartition par langage : le back Java sert de décor à P8 à P16, P18, P19 et P25 ; le front TypeScript à P17 et P20 à P23 ; P9 et P26 portent sur les deux ; les autres scénarios ne dépendent d'aucun langage. La liste complète, avec les invariants, est dans `docs/sonarqube/tests-pilote.csv` du dépôt Agent2Prompt.

### 6.2 Recette réelle, contre l'instance du développeur

```bash
read -rs RECETTE_SONAR_TOKEN && export RECETTE_SONAR_TOKEN
export RECETTE_SONAR_HOST_URL=https://sonar.exemple.org
export RECETTE_SONAR_PROJET=agent2prompt-recette
node --test tests/pilote-sonar.reel.test.mjs
```

Cinq scénarios, R1 à R5, sur un **projet réservé à la recette**, créé à l'avance sur l'instance (édition Developer ou supérieure). Le jeton utilisateur doit y avoir Browse, Execute Analysis et Administer. La recette fabrique un petit projet JavaScript dans un dépôt temporaire, en analyse la branche principale comme décor, puis ajoute un fichier qui enfreint trois règles actives de Sonar way (`S3504`, `S1481`, `S1186`) et le soumet au pilote : tests avec couverture LCOV, analyse éphémère réelle, gate, constats, mesures, suppression vérifiée de la branche. Sans les trois variables, chaque scénario est sauté.

| Scénario, ce qui est prouvé contre l'instance | Invariants |
|---|---|
| R1 connexion Bearer, version, édition | D1.INV-4, D1.INV-5 |
| R2 jeton en nom d'utilisateur, accepté ou refusé proprement | D1.INV-5 |
| R3 modes détectés, jeton absent de l'état | D10.INV-2 |
| R4 périmètre, règles actives du profil réel, cache, export CSV | D9.INV-3, D9.INV-4 |
| R5 analyse éphémère complète, tests et couverture remontés, constats au périmètre, branche supprimée | D9.INV-1, D9.INV-2, D9.INV-7 |

Écritures sur l'instance : l'analyse de la branche principale du projet de recette, puis la branche `local-…`, supprimée ; un filet de sécurité la supprime aussi en fin de recette si un scénario a échoué. Réseau : npm, pour `@sonar/scan`, et l'instance. La CI du dépôt la lance seulement si la variable de dépôt `RECETTE_SONAR_ACTIVE` vaut `true` et que les secrets `RECETTE_SONAR_HOST_URL` et `RECETTE_SONAR_TOKEN` et la variable `RECETTE_SONAR_PROJET` sont définis ; une instance du réseau interne, injoignable depuis GitHub, se recette depuis le poste.

## 7. Pièges connus

- **Proxy du poste** : un proxy HTTP défini dans l'environnement peut intercepter `127.0.0.1` pour certains outils (`curl`). Le navigateur et le pilote n'en dépendent pas ; pour un essai en ligne de commande, `curl --noproxy '*'`.
- **Clé partagée** : l'adresse avec sa clé ouvre l'interface ; ne pas la coller dans un ticket ni une conversation.
- **Analyse longue** : la requête « Valider et lancer » dure le temps du build et de l'analyse ; ne pas relancer le lot, il ne sert qu'une fois.
- **Windows** : le scanner est lancé par le shell (`mvn.cmd`, `npx.cmd`) ; la commande personnalisée suit la syntaxe de CMD.

## 8. Contrôle de sortie

- Le pilote n'a écouté que sur `127.0.0.1` et n'a servi que des requêtes portant la clé (D10.INV-1).
- Aucune réponse, aucune ligne du journal ni de la sortie du scanner ne contient le jeton (D10.INV-2).
- Chaque écriture vient d'un lot proposé puis validé, non expiré, employé une fois (D10.INV-3).
- Les tests du projet ont tourné avant l'analyse, ou le lot annonçait qu'ils ne tourneraient pas ; tests et couverture lus sur la branche figurent au rapport (D9.INV-7).
- La branche de travail est supprimée et la suppression vérifiée, ou son échec rapporté avec le nom de la branche (D10.INV-4, D9.INV-2).

## 9. Script `outils/pilote-sonar.mjs`

<!-- fichier : outils/pilote-sonar.mjs -->
```javascript
#!/usr/bin/env node
// Pilote local de l'expert SonarQube (skill sonarqube 1.1.0, module pilotage, D10).
// Interface web sur la boucle locale : modes de connexion, périmètre, règles du profil,
// analyse éphémère par lot validé, dossier de relecture, journal des appels.
// Node 20 ou plus récent, aucune dépendance. Le jeton reste dans ce processus (D10.INV-2).

import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFile } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const VERSION = '1.1.0';
const LOT_DUREE_MS = 10 * 60 * 1000;
const PAGE_ISSUES = 500;
const MAX_ISSUES = 10000;

// ---------------------------------------------------------------- outils purs

/** Nom de la branche de travail : préfixe local-, login assaini, empreinte courte du HEAD (D9.INV-2). */
export function nomBrancheLocale(login, sha) {
  const l = String(login || 'inconnu').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || 'inconnu';
  const s = String(sha || '').toLowerCase().replace(/[^0-9a-f]/g, '').slice(0, 8);
  if (s.length < 7) throw new Error('empreinte du HEAD invalide');
  return `local-${l}-${s}`;
}

/** En-tête d'authentification selon le mode d'API retenu (cadrage-acces, § 3 bis). */
export function enteteAuth(mode, jeton) {
  if (!jeton) throw new Error('SONAR_TOKEN absent de l\'environnement');
  if (mode === 'basic') return `Basic ${Buffer.from(`${jeton}:`).toString('base64')}`;
  if (mode === 'bearer') return `Bearer ${jeton}`;
  throw new Error(`mode d'API inconnu : ${mode}`);
}

/** Refuse une commande de scanner qui choisirait elle-même la branche, une MR ou un jeton. */
export function verifierCommande(commande, jeton = process.env.SONAR_TOKEN) {
  const c = String(commande || '').trim();
  if (!c) throw new Error('commande de scanner vide');
  if (/sonar\.(branch\.name|pullrequest\.|token|login|password)/i.test(c)) {
    throw new Error('la commande ne doit fixer ni la branche, ni une merge request, ni un jeton : le pilote s\'en charge');
  }
  if (jeton && c.includes(jeton)) throw new Error('la commande contient la valeur du jeton');
  if (/[\r\n]/.test(c)) throw new Error('la commande tient sur une ligne');
  return c;
}

/**
 * Préréglages : les tests du projet tournent avant l'analyse, pour que leurs résultats et la couverture
 * remontent dans SonarQube (D9.INV-7). Maven les lance dans verify ; un échec de test n'arrête pas
 * l'analyse, il y est importé et rapporté.
 */
export const PRESETS = {
  maven: {
    tests: null,
    analyse: 'mvn -B verify org.sonarsource.scanner.maven:sonar-maven-plugin:sonar -Dmaven.test.failure.ignore=true -Dsonar.qualitygate.wait=true',
    note: 'tests JUnit et couverture JaCoCo lancés par verify',
  },
  npm: {
    tests: 'npx ng test --watch=false --code-coverage',
    analyse: 'npx @sonar/scan -Dsonar.qualitygate.wait=true',
    note: 'tests Angular avec couverture LCOV, puis analyse',
  },
};

/** Mesures de tests et de couverture lues sur la branche de travail. */
export const MESURES_TESTS = ['tests', 'test_failures', 'test_errors', 'skipped_tests', 'coverage', 'new_coverage'];

/** Valeur d'une mesure : `value`, ou celle de la période pour les mesures du nouveau code. */
export function valeurMesure(m) {
  const v = m?.value ?? m?.period?.value ?? m?.periods?.[0]?.value;
  return v === undefined || v === null || v === '' ? null : Number(v);
}

/** Commande complète : la base retenue, plus la branche de travail et la référence du nouveau code. */
export function commandeScanner(base, branche, cible) {
  if (!/^local-[a-z0-9-]+$/.test(branche)) throw new Error('branche de travail invalide');
  if (!/^[A-Za-z0-9._/-]+$/.test(cible)) throw new Error('branche cible invalide');
  return `${verifierCommande(base)} -Dsonar.branch.name=${branche} -Dsonar.newCode.referenceBranch=${cible}`;
}

/** Lignes modifiées par fichier, d'après un diff unifié sans contexte. */
export function analyserDiff(texte) {
  const plages = new Map();
  let courant = null;
  for (const ligne of String(texte).split('\n')) {
    const f = /^\+\+\+ (?:b\/)?(.+)$/.exec(ligne);
    if (f) { courant = f[1] === '/dev/null' ? null : f[1]; if (courant && !plages.has(courant)) plages.set(courant, []); continue; }
    const h = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(ligne);
    if (h && courant) {
      const debut = Number(h[1]); const n = h[2] === undefined ? 1 : Number(h[2]);
      if (n > 0) plages.get(courant).push([debut, debut + n - 1]);
    }
  }
  return plages;
}

/**
 * Un constat est dans le périmètre si son fichier est modifié et, s'il a une ligne, si elle l'est aussi.
 * Le chemin d'un composant est relatif au dossier du projet SonarQube ; `dossier` le ramène à la racine du dépôt.
 */
export function dansPerimetre(plages, composant, ligne, dossier = '.') {
  const relatif = String(composant || '').includes(':') ? composant.slice(composant.indexOf(':') + 1) : composant;
  const fichier = path.posix.join(dossier || '.', relatif);
  const p = plages.get(fichier);
  if (!p) return false;
  if (!ligne) return true;
  return p.some(([a, b]) => ligne >= a && ligne <= b);
}

/** Dossier du projet dans le dépôt : relatif, sans remontée, existant. */
export function dossierProjet(racine, dossier = '.') {
  const d = String(dossier || '.').replace(/\\/g, '/').replace(/\/+$/, '') || '.';
  if (path.posix.isAbsolute(d) || /^[A-Za-z]:/.test(d) || d.split('/').includes('..')) throw new Error('dossier du projet : chemin relatif au dépôt, sans « .. »');
  const normal = path.posix.normalize(d);
  if (!fs.existsSync(path.join(racine, normal))) throw new Error(`dossier du projet introuvable : ${normal}`);
  return normal;
}

/** Environnement du scanner : sans variables de merge request, pour qu'il ne se croie pas en MR. */
export function environnementScanner(env = process.env) {
  const e = { ...env };
  for (const k of Object.keys(e)) if (/^CI_MERGE_REQUEST_/.test(k) || /^SONAR_PULLREQUEST/i.test(k)) delete e[k];
  return e;
}

// ---------------------------------------------------------------- accès

function executer(cmd, args, options = {}) {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout: 15000, maxBuffer: 32 * 1024 * 1024, ...options }, (err, stdout, stderr) => {
      resolve({ ok: !err, code: err ? (err.code ?? 1) : 0, stdout: String(stdout), stderr: String(stderr) });
    });
  });
}

function git(racine, ...args) { return executer('git', args, { cwd: racine }); }

export class Pilote {
  constructor({ racine = process.cwd(), env = process.env, horloge = () => Date.now() } = {}) {
    this.racine = path.resolve(racine);
    this.env = env;
    this.horloge = horloge;
    this.modeApi = 'bearer';
    this.journal = [];
    this.lots = new Map();
    this.perimetre = null;
    this.resultats = [];
  }

  get hote() { return String(this.env.SONAR_HOST_URL || '').replace(/\/+$/, ''); }
  get jeton() { return this.env.SONAR_TOKEN || ''; }

  /** Appel à l'API web ; le journal garde la méthode, le chemin et le statut, jamais le jeton (D10.INV-2). */
  async appel(chemin, { methode = 'GET', donnees = null, ecriture = false, mode = this.modeApi } = {}) {
    if (!this.hote) throw new Error('SONAR_HOST_URL absent de l\'environnement');
    const options = { method: methode, headers: { authorization: enteteAuth(mode, this.jeton), accept: 'application/json' }, signal: AbortSignal.timeout(30000) };
    if (donnees) {
      options.body = new URLSearchParams(donnees).toString();
      options.headers['content-type'] = 'application/x-www-form-urlencoded';
    }
    let statut = 0; let corps = null;
    try {
      const r = await fetch(this.hote + chemin, options);
      statut = r.status;
      const texte = await r.text();
      // Certaines routes répondent en texte brut (/api/server/version) : le texte est alors gardé tel quel.
      try { corps = texte ? JSON.parse(texte) : null; } catch { corps = texte.trim(); }
    } finally {
      this.journal.push({ date: new Date(this.horloge()).toISOString(), methode, chemin, statut, ecriture, mode });
    }
    if (statut < 200 || statut >= 300) {
      const detail = Array.isArray(corps?.errors) ? corps.errors.map((e) => e.msg).join(' ; ') : '';
      const err = new Error(`${methode} ${chemin.split('?')[0]} : HTTP ${statut}${detail ? ` (${detail})` : ''}`);
      err.statut = statut;
      throw err;
    }
    return corps;
  }

  /** Modes de connexion disponibles (cadrage-acces, § 3 bis). Le jeton n'y figure que par sa présence. */
  async modes() {
    const outil = async (cmd, args) => (await executer(cmd, args, { timeout: 8000, shell: process.platform === 'win32' })).ok;
    const [mvn, npx, docker, sonar] = await Promise.all([
      outil('mvn', ['-v']), outil('npx', ['--version']), outil('docker', ['--version']), outil('sonar', ['--version'])]);
    let mcpHeberge = 'inconnu';
    if (this.hote && this.jeton) {
      try {
        const r = await fetch(`${this.hote}/mcp`, { method: 'GET', headers: { authorization: enteteAuth('bearer', this.jeton) }, signal: AbortSignal.timeout(5000) });
        mcpHeberge = r.status === 404 ? 'absent' : `présent (HTTP ${r.status})`;
      } catch { mcpHeberge = 'injoignable'; }
    }
    return {
      version: VERSION,
      hote: this.hote || null,
      jetonPresent: Boolean(this.jeton),
      modeApi: this.modeApi,
      modes: [
        { id: 'bearer', libelle: 'API web, en-tête Bearer', usage: 'catalogue complet', disponible: Boolean(this.hote && this.jeton) },
        { id: 'basic', libelle: 'API web, jeton en nom d\'utilisateur', usage: 'catalogue complet, si Bearer est refusé', disponible: Boolean(this.hote && this.jeton) },
        { id: 'scanner-maven', libelle: 'Scanner Maven', usage: 'analyse éphémère du back', disponible: mvn },
        { id: 'scanner-npm', libelle: 'Scanner npm (@sonar/scan)', usage: 'analyse éphémère du front', disponible: npx },
        { id: 'mcp-ide', libelle: 'SonarQube for IDE par le serveur MCP autonome', usage: 'moteur SonarLint, sans envoi', disponible: docker, note: 'IDE connecté requis, non détectable ici' },
        { id: 'mcp-heberge', libelle: 'Serveur MCP hébergé par l\'instance', usage: 'aucun en 1.1 (D7 réservée)', disponible: mcpHeberge.startsWith('présent'), note: mcpHeberge },
        { id: 'cli', libelle: 'SonarQube CLI (sonar)', usage: 'détection de secrets locale', disponible: sonar },
      ],
    };
  }

  /** Teste un mode d'API et relève l'instance (D1.INV-4) ; le mode retenu sert ensuite à tous les appels. */
  async connexion(mode) {
    if (!['bearer', 'basic'].includes(mode)) throw new Error('mode d\'API : bearer ou basic');
    const valide = await this.appel('/api/authentication/validate', { mode });
    if (!valide?.valid) throw new Error('jeton refusé par l\'instance');
    const [version, global, utilisateur] = await Promise.all([
      this.appel('/api/server/version', { mode }).catch(() => null),
      this.appel('/api/navigation/global', { mode }).catch(() => null),
      this.appel('/api/users/current', { mode }),
    ]);
    this.modeApi = mode;
    this.login = utilisateur?.login;
    return { mode, version: version ?? 'inconnue', edition: global?.edition ?? 'inconnue', login: utilisateur?.login, permissions: utilisateur?.permissions?.global ?? [] };
  }

  /** Périmètre : diff entre HEAD et la base de fusion avec origin/<cible> (D9.INV-3). */
  async calculerPerimetre(cible) {
    if (!/^[A-Za-z0-9._/-]+$/.test(cible || '')) throw new Error('branche cible invalide');
    const fetchR = await git(this.racine, 'fetch', '--quiet', 'origin', cible);
    if (!fetchR.ok) throw new Error(`git fetch origin ${cible} : ${fetchR.stderr.trim()}`);
    const base = (await git(this.racine, 'merge-base', 'HEAD', `origin/${cible}`)).stdout.trim();
    if (!base) throw new Error(`aucune base de fusion avec origin/${cible}`);
    const head = (await git(this.racine, 'rev-parse', 'HEAD')).stdout.trim();
    const fichiers = (await git(this.racine, 'diff', '--name-only', '--diff-filter=ACMR', `${base}...HEAD`)).stdout.split('\n').filter(Boolean);
    const diff = (await git(this.racine, 'diff', '--unified=0', `${base}...HEAD`)).stdout;
    const nonCommite = (await git(this.racine, 'status', '--porcelain')).stdout.split('\n').filter((l) => l && !/^\?\? \.sonar-local\//.test(l));
    const plages = analyserDiff(diff);
    const lignes = [...plages.values()].reduce((n, p) => n + p.reduce((m, [a, b]) => m + b - a + 1, 0), 0);
    fs.mkdirSync(path.join(this.racine, '.sonar-local'), { recursive: true });
    fs.writeFileSync(path.join(this.racine, '.sonar-local', 'perimetre.diff'), diff);
    const gitignore = fs.existsSync(path.join(this.racine, '.gitignore')) ? fs.readFileSync(path.join(this.racine, '.gitignore'), 'utf8') : '';
    this.perimetre = { cible, base, head, fichiers, plages, diff };
    return { cible, base, head, fichiers, lignes, nonCommite, sonarLocalIgnore: /^\/?\.sonar-local\/?\s*$/m.test(gitignore) };
  }

  /** Règles actives des profils du projet, avec un cache invalidé par rulesUpdatedAt (D9.INV-4). */
  async regles(projet) {
    if (!projet) throw new Error('clé de projet requise');
    const profils = (await this.appel(`/api/qualityprofiles/search?project=${encodeURIComponent(projet)}`))?.profiles ?? [];
    const dossier = path.join(this.racine, '.sonar-local');
    fs.mkdirSync(dossier, { recursive: true });
    const sortie = [];
    for (const p of profils) {
      const cache = path.join(dossier, `regles-${p.key.replace(/[^A-Za-z0-9_-]/g, '_')}.json`);
      let lu = null;
      if (fs.existsSync(cache)) { try { lu = JSON.parse(fs.readFileSync(cache, 'utf8')); } catch { lu = null; } }
      if (lu && lu.rulesUpdatedAt === p.rulesUpdatedAt) { sortie.push({ ...lu, depuisCache: true }); continue; }
      const regles = [];
      for (let page = 1; ; page++) {
        const r = await this.appel(`/api/rules/search?qprofile=${encodeURIComponent(p.key)}&activation=true&ps=500&p=${page}`);
        for (const x of r?.rules ?? []) regles.push({ key: x.key, name: x.name, lang: x.lang, severity: x.severity, type: x.type, impacts: x.impacts });
        if (!r?.rules?.length || regles.length >= (r.total ?? r.paging?.total ?? 0)) break;
      }
      const entree = { key: p.key, name: p.name, language: p.language, rulesUpdatedAt: p.rulesUpdatedAt, regles };
      fs.writeFileSync(cache, JSON.stringify(entree, null, 1));
      sortie.push({ ...entree, depuisCache: false });
    }
    return sortie;
  }

  /** Propose le lot d'écritures de l'analyse éphémère, sans rien exécuter (D1.INV-3, D10.INV-3). */
  async proposerEphemere({ projet, type = 'maven', base: baseLibre, tests: testsLibre, sansTests = false, dossier = '.' }) {
    if (!this.perimetre) throw new Error('calculer d\'abord le périmètre');
    if (!projet) throw new Error('clé de projet requise');
    const preset = PRESETS[type];
    if (type !== 'personnalise' && !preset) throw new Error(`type de scanner inconnu : ${type}`);
    const base = type === 'personnalise' ? baseLibre : preset.analyse;
    if (!base) throw new Error('commande d\'analyse requise');
    const dossierP = dossierProjet(this.racine, dossier);
    const libre = String(testsLibre ?? '').trim();
    const tests = sansTests ? null : (libre ? verifierCommande(libre, this.jeton) : (preset?.tests ?? null));
    const login = this.login || (await this.appel('/api/users/current'))?.login;
    const branche = nomBrancheLocale(login, this.perimetre.head);
    const commande = commandeScanner(base, branche, this.perimetre.cible);
    const id = crypto.randomBytes(12).toString('hex');
    const lot = {
      id, projet, branche, commande, tests, dossier: dossierP, cible: this.perimetre.cible, expire: this.horloge() + LOT_DUREE_MS,
      testsDuProjet: tests ? `lancés avant l'analyse : ${tests}` : (type === 'maven' && !sansTests ? PRESETS.maven.note : 'non lancés : couverture et résultats de tests absents de l\'analyse'),
      ecritures: [
        { ordre: 1, action: `analyse du code local de ${projet} (dossier ${dossierP}) sous la branche de travail ${branche}`, appel: commande },
        { ordre: 2, action: 'suppression de la branche de travail, après lecture', appel: `POST /api/project_branches/delete project=${projet} branch=${branche}` },
      ],
      ouPartLeCode: 'instance SonarQube',
      permissions: ['Execute Analysis', 'Administer sur le projet'],
    };
    this.lots.set(id, lot);
    const { expire, ...visible } = lot;
    return { ...visible, expireDans: Math.round(LOT_DUREE_MS / 60000) + ' min' };
  }

  /** Exécute un lot validé : analyse, lecture, puis suppression vérifiée, même en cas d'échec (D9.INV-2). */
  async lancerEphemere(id) {
    const lot = this.lots.get(id);
    if (!lot) { const e = new Error('aucun lot validé sous cet identifiant'); e.statut = 409; throw e; }
    this.lots.delete(id);
    if (this.horloge() > lot.expire) { const e = new Error('lot expiré : le proposer à nouveau'); e.statut = 409; throw e; }
    const rapport = { branche: lot.branche, tests: null, scanner: null, qualityGate: null, mesures: {}, constats: [], horsPerimetre: 0, suppression: null, limites: [] };
    try {
      if (lot.tests) {
        rapport.tests = await this.#executer(lot.tests, lot.dossier);
        if (rapport.tests.code !== 0) rapport.limites.push(`tests du projet en échec (code ${rapport.tests.code}) : l'analyse continue, leurs rapports sont importés s'ils existent`);
      }
      rapport.scanner = await this.#executer(lot.commande, lot.dossier);
      // Avec sonar.qualitygate.wait=true, un quality gate en échec fait aussi sortir le scanner en erreur :
      // on lit donc l'instance dès que la branche de travail existe, quel que soit le code de sortie.
      if (rapport.scanner.code !== 0) rapport.limites.push(`scanner sorti en erreur (code ${rapport.scanner.code}) : quality gate en échec ou analyse interrompue`);
      const existe = await this.appel(`/api/project_branches/list?project=${encodeURIComponent(lot.projet)}`)
        .then((r) => (r?.branches ?? []).some((x) => x.name === lot.branche)).catch(() => false);
      if (!existe) rapport.limites.push('analyse absente de l\'instance : aucun constat lu');
      else {
        const b = encodeURIComponent(lot.branche); const p = encodeURIComponent(lot.projet);
        const gate = await this.appel(`/api/qualitygates/project_status?projectKey=${p}&branch=${b}`).catch((e) => { rapport.limites.push(e.message); return null; });
        rapport.qualityGate = gate?.projectStatus ?? null;
        const issues = [];
        for (let page = 1; page * PAGE_ISSUES <= MAX_ISSUES; page++) {
          const r = await this.appel(`/api/issues/search?components=${p}&branch=${b}&inNewCodePeriod=true&issueStatuses=OPEN,CONFIRMED&ps=${PAGE_ISSUES}&p=${page}`);
          issues.push(...(r?.issues ?? []));
          if (!r?.issues?.length || issues.length >= (r.total ?? r.paging?.total ?? 0)) break;
          if (page * PAGE_ISSUES >= MAX_ISSUES) rapport.limites.push('plus de 10 000 constats : découper la requête');
        }
        const mesures = await this.appel(`/api/measures/component?component=${p}&branch=${b}&metricKeys=${MESURES_TESTS.join(',')}`)
          .catch((e) => { rapport.limites.push(`mesures non lues : ${e.message}`); return null; });
        for (const m of mesures?.component?.measures ?? []) rapport.mesures[m.metric] = valeurMesure(m);
        if (mesures && rapport.mesures.coverage == null && rapport.mesures.new_coverage == null) {
          rapport.limites.push('couverture absente : aucun rapport JaCoCo ou LCOV importé (D2.INV-2)');
        }
        const enEchec = (rapport.mesures.test_failures ?? 0) + (rapport.mesures.test_errors ?? 0);
        if (enEchec > 0) rapport.limites.push(`${enEchec} test(s) en échec ou en erreur, lus dans SonarQube`);
        const hotspots = await this.appel(`/api/hotspots/search?project=${p}&branch=${b}&status=TO_REVIEW`)
          .then((r) => r?.hotspots ?? []).catch(() => { rapport.limites.push('revues de sécurité non lues'); return []; });
        for (const i of issues) {
          if (!dansPerimetre(this.perimetre.plages, i.component, i.line, lot.dossier)) { rapport.horsPerimetre++; continue; }
          rapport.constats.push({ moteur: 'analyse éphémère', cle: i.key, regle: i.rule, composant: i.component, ligne: i.line ?? null, message: i.message, impacts: i.impacts ?? null, severite: i.severity ?? null, type: i.type ?? null });
        }
        for (const h of hotspots) {
          if (!dansPerimetre(this.perimetre.plages, h.component, h.line, lot.dossier)) { rapport.horsPerimetre++; continue; }
          rapport.constats.push({ moteur: 'analyse éphémère', cle: h.key, regle: h.ruleKey, composant: h.component, ligne: h.line ?? null, message: h.message, revueSecurite: true });
        }
      }
    } finally {
      rapport.suppression = await this.#supprimer(lot.projet, lot.branche);
    }
    this.resultats = rapport.constats;
    return rapport;
  }

  async #supprimer(projet, branche) {
    try {
      await this.appel('/api/project_branches/delete', { methode: 'POST', donnees: { project: projet, branch: branche }, ecriture: true });
    } catch (e) {
      if (e.statut !== 404) return { faite: false, verifiee: false, detail: e.message };
    }
    try {
      const liste = await this.appel(`/api/project_branches/list?project=${encodeURIComponent(projet)}`);
      const reste = (liste?.branches ?? []).some((x) => x.name === branche);
      return { faite: !reste, verifiee: true, detail: reste ? `la branche ${branche} reste sur l'instance` : 'branche absente de la liste' };
    } catch (e) {
      return { faite: true, verifiee: false, detail: `vérification impossible : ${e.message}` };
    }
  }

  #executer(commande, dossier = '.') {
    return new Promise((resolve) => {
      const enfant = spawn(commande, { cwd: path.join(this.racine, dossier), env: environnementScanner(this.env), shell: true });
      let sortie = '';
      const garder = (d) => { sortie = (sortie + d).slice(-20000); };
      enfant.stdout.on('data', garder);
      enfant.stderr.on('data', garder);
      enfant.on('error', (e) => resolve({ code: 127, sortie: String(e.message) }));
      enfant.on('close', (code) => resolve({ code: code ?? 1, sortie: this.jeton ? sortie.split(this.jeton).join('***') : sortie }));
    });
  }

  /**
   * Export CSV des règles de l'instance pour les langages des profils du projet, avec une colonne qui dit
   * si chaque règle est active dans le profil du projet (D9.INV-4). Séparateur « ; », UTF-8 avec BOM.
   */
  async exporterRegles(projet) {
    const profils = await this.regles(projet);
    const QUALITE = { MAINTAINABILITY: 'maintenabilité', RELIABILITY: 'fiabilité', SECURITY: 'sécurité' };
    const GRAVITE = { BLOCKER: 'bloquante', HIGH: 'haute', MEDIUM: 'moyenne', LOW: 'basse', INFO: 'info' };
    const lignes = [];
    for (const p of profils) {
      const actives = new Set(p.regles.map((x) => x.key));
      const toutes = [];
      for (let page = 1; page * 500 <= 10000; page++) {
        const r = await this.appel(`/api/rules/search?languages=${encodeURIComponent(p.language)}&ps=500&p=${page}`);
        toutes.push(...(r?.rules ?? []));
        if (!r?.rules?.length || toutes.length >= (r.total ?? r.paging?.total ?? 0)) break;
      }
      for (const x of toutes) {
        lignes.push([x.key, x.lang ?? p.language, x.name ?? '', x.type ?? '',
          (x.impacts ?? []).map((i) => `${QUALITE[i.softwareQuality] ?? i.softwareQuality} : ${GRAVITE[i.severity] ?? i.severity}`).join(', '),
          x.severity ?? '', x.status ?? '', actives.has(x.key) ? 'oui' : 'non', p.name, [...(x.sysTags ?? []), ...(x.tags ?? [])].join(', '), x.scope ?? '']);
      }
    }
    const entete = ['clé de règle', 'langage', 'titre', 'type', 'qualité logicielle : gravité (mode MQR)', 'sévérité (mode standard)', 'statut', 'active dans le profil du projet', 'profil', 'tags', 'portée'];
    const champ = (v) => { const t = String(v ?? ''); return /[;"\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
    const contenu = '\ufeff' + [entete, ...lignes].map((l) => l.map(champ).join(';')).join('\r\n') + '\r\n';
    const fichier = path.join(this.racine, '.sonar-local', `regles-${String(projet).replace(/[^A-Za-z0-9_.-]/g, '_')}.csv`);
    fs.writeFileSync(fichier, contenu);
    return { fichier: path.relative(this.racine, fichier), total: lignes.length, actives: lignes.filter((l) => l[7] === 'oui').length, contenu };
  }

  /** Dossier de relecture : diff et règles actives, pour le moteur de relecture de l'expert (D9, § 7). */
  async dossierRelecture(projet) {
    if (!this.perimetre) throw new Error('calculer d\'abord le périmètre');
    const profils = await this.regles(projet);
    const lignes = [
      `# Dossier de relecture : ${projet}, HEAD ${this.perimetre.head.slice(0, 8)} contre ${this.perimetre.cible}`, '',
      `- Base de fusion : ${this.perimetre.base.slice(0, 8)}`,
      `- Fichiers : ${this.perimetre.fichiers.length}`,
      '- Moteur : relecture par les règles. Les constats qui en sortent ne sont pas des issues SonarQube (D9.INV-1).', '',
      '## Règles actives des profils du projet', '',
    ];
    for (const p of profils) {
      lignes.push(`### ${p.name} (${p.language}), mis à jour le ${p.rulesUpdatedAt ?? 'inconnu'}`, '');
      for (const r of p.regles) lignes.push(`- \`${r.key}\` : ${r.name}`);
      lignes.push('');
    }
    lignes.push('## Diff', '', '```diff', this.perimetre.diff.trimEnd(), '```', '');
    const fichier = path.join(this.racine, '.sonar-local', `relecture-${this.perimetre.head.slice(0, 8)}.md`);
    fs.writeFileSync(fichier, lignes.join('\n'));
    return { fichier: path.relative(this.racine, fichier), regles: profils.reduce((n, p) => n + p.regles.length, 0) };
  }

  commandeMcp() {
    return [
      'export SONARQUBE_URL="$SONAR_HOST_URL"',
      'export SONARQUBE_TOKEN="$SONAR_TOKEN"',
      'export SONARQUBE_TOOLSETS=ide',
      'export SONARQUBE_IDE_PORT=<port de SonarQube for IDE>',
      'docker run -i --rm --init --pull=always --network=host \\',
      '  -e SONARQUBE_URL -e SONARQUBE_TOKEN -e SONARQUBE_TOOLSETS -e SONARQUBE_IDE_PORT \\',
      '  sonarsource/sonarqube-mcp',
    ].join('\n');
  }
}

// ---------------------------------------------------------------- serveur

const PAGE = String.raw`<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pilote SonarQube</title>
<style>
:root{--fond:#f6f7f5;--carte:#fff;--encre:#1b2430;--doux:#59636e;--ligne:#d3d8dc;--accent:#155e8b;--ok:#2b6b3f;--ko:#9a3412}
@media (prefers-color-scheme:dark){:root{--fond:#12171d;--carte:#1a2129;--encre:#e5e9ed;--doux:#9aa6b2;--ligne:#2e3842;--accent:#7fb6dc;--ok:#8fd0a3;--ko:#f0a372}}
*{box-sizing:border-box}body{margin:0;background:var(--fond);color:var(--encre);font:15px/1.5 system-ui,sans-serif}
main{max-width:1080px;margin:0 auto;padding:20px 16px 60px}h1{font-size:1.6rem;margin:0 0 4px}h2{font-size:1.15rem;margin:0 0 10px}
p.sous{color:var(--doux);margin:0 0 18px}section{background:var(--carte);border:1px solid var(--ligne);border-radius:8px;padding:16px;margin-bottom:16px}
label{display:block;font-weight:600;margin:8px 0 4px}input,select{font:inherit;padding:7px 9px;border:1px solid var(--ligne);border-radius:5px;background:var(--fond);color:var(--encre);width:100%;max-width:420px}
button{font:inherit;font-weight:600;padding:7px 13px;border-radius:5px;border:1px solid var(--accent);background:var(--accent);color:var(--carte);cursor:pointer;margin:10px 8px 0 0}
button.second{background:transparent;color:var(--accent)}button:disabled{opacity:.5;cursor:default}
:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
table{border-collapse:collapse;width:100%;font-size:.92rem;margin-top:8px}th,td{border-bottom:1px solid var(--ligne);padding:6px 8px;text-align:left;vertical-align:top}
caption{text-align:left;font-weight:600;padding:4px 0}code,pre{font-family:ui-monospace,Consolas,monospace;font-size:.88rem}
pre{background:var(--fond);border:1px solid var(--ligne);border-radius:5px;padding:10px;overflow:auto;white-space:pre-wrap}
.ok{color:var(--ok);font-weight:600}.ko{color:var(--ko);font-weight:600}.etat{min-height:1.4em;margin-top:8px}
.lot{border:2px solid var(--ko);border-radius:6px;padding:12px;margin-top:10px}
label.case{font-weight:400;display:flex;gap:8px;align-items:center}input[type=checkbox]{width:auto}
</style></head><body><main>
<h1>Pilote SonarQube</h1>
<p class="sous">Examen local avant GitLab — le jeton reste dans le processus du pilote ; ce navigateur n'en connaît que la présence.</p>

<section aria-labelledby="t-co"><h2 id="t-co">1. Connexion</h2>
<div id="instance"></div>
<table><caption>Modes de connexion détectés</caption><thead><tr><th scope="col">Mode</th><th scope="col">Usage admis</th><th scope="col">Disponible</th></tr></thead><tbody id="modes"></tbody></table>
<label for="modeApi">Mode d'API retenu</label>
<select id="modeApi"><option value="bearer">API web, en-tête Bearer</option><option value="basic">API web, jeton en nom d'utilisateur</option></select>
<button id="bConnexion">Tester la connexion</button>
<div class="etat" id="eConnexion" role="status" aria-live="polite"></div></section>

<section aria-labelledby="t-pe"><h2 id="t-pe">2. Projet et périmètre</h2>
<label for="projet">Clé du projet SonarQube</label><input id="projet" autocomplete="off" placeholder="acme-api">
<label for="cible">Branche cible</label><input id="cible" autocomplete="off" value="develop">
<label for="dossier">Dossier du projet dans le dépôt</label><input id="dossier" autocomplete="off" value="." placeholder=". pour la racine, web pour un front dans web/">
<button id="bPerimetre">Calculer le diff</button>
<div class="etat" id="ePerimetre" role="status" aria-live="polite"></div></section>

<section aria-labelledby="t-re"><h2 id="t-re">3. Règles du profil</h2>
<button id="bRegles">Lire les règles actives</button><button id="bExport" class="second">Exporter les règles en CSV</button><button id="bRelecture" class="second">Préparer le dossier de relecture</button>
<div class="etat" id="eRegles" role="status" aria-live="polite"></div></section>

<section aria-labelledby="t-ep"><h2 id="t-ep">4. Analyse éphémère</h2>
<label for="scanner">Scanner</label>
<select id="scanner"><option value="maven">Maven (back)</option><option value="npm">npm, @sonar/scan (front)</option><option value="personnalise">Commande personnalisée</option></select>
<label for="baseLibre">Commande personnalisée, sans branche ni jeton</label><input id="baseLibre" autocomplete="off" disabled>
<label for="tests">Tests du projet, lancés avant l'analyse (vide : commande du préréglage)</label><input id="tests" autocomplete="off" placeholder="inclus dans mvn verify">
<label class="case"><input type="checkbox" id="sansTests"> Ne pas lancer les tests : couverture et résultats absents de l'analyse</label>
<button id="bProposer">Proposer le lot</button>
<div id="lot"></div>
<div class="etat" id="eEphemere" role="status" aria-live="polite"></div></section>

<section aria-labelledby="t-sl"><h2 id="t-sl">5. Moteur SonarLint</h2>
<p>SonarQube for IDE, en mode connecté, analyse en local sans envoi. Lancer le serveur MCP de Sonar dans un terminal, puis demander à l'expert d'appeler <code>analyze_file_list</code> sur les fichiers du périmètre.</p>
<pre id="mcp"></pre></section>

<section aria-labelledby="t-rs"><h2 id="t-rs">6. Constats</h2><div id="constats"><p>Aucun constat pour l'instant.</p></div></section>

<section aria-labelledby="t-jo"><h2 id="t-jo">7. Journal des appels</h2><button id="bJournal" class="second">Rafraîchir</button>
<table><caption>Appels à l'API, sans jeton</caption><thead><tr><th scope="col">Date</th><th scope="col">Méthode</th><th scope="col">Chemin</th><th scope="col">Statut</th><th scope="col">Écriture</th></tr></thead><tbody id="journal"></tbody></table></section>
</main>
<script>
const CLE = '__CLE__';
const $ = (id) => document.getElementById(id);
const txt = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
async function api(chemin, corps) {
  const r = await fetch(chemin, { method: corps ? 'POST' : 'GET', headers: { 'x-pilote-cle': CLE, 'content-type': 'application/json' }, body: corps ? JSON.stringify(corps) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.erreur || ('HTTP ' + r.status));
  return d;
}
function etat(id, html, ko) { $(id).innerHTML = '<span class="' + (ko ? 'ko' : 'ok') + '">' + html + '</span>'; }
async function charger() {
  const e = await api('/api/etat');
  $('instance').innerHTML = '<p>Instance : <code>' + txt(e.hote || 'SONAR_HOST_URL absent') + '</code> — jeton : ' + (e.jetonPresent ? '<span class="ok">présent</span>' : '<span class="ko">absent</span>') + '</p>';
  $('modes').innerHTML = e.modes.map((m) => '<tr><td>' + txt(m.libelle) + '</td><td>' + txt(m.usage) + (m.note ? '<br><small>' + txt(m.note) + '</small>' : '') + '</td><td>' + (m.disponible ? '<span class="ok">oui</span>' : '<span class="ko">non</span>') + '</td></tr>').join('');
  $('mcp').textContent = (await api('/api/mcp')).commande;
}
$('bConnexion').onclick = async () => { try { const c = await api('/api/connexion', { mode: $('modeApi').value }); etat('eConnexion', 'Connecté : SonarQube ' + txt(c.version) + ', édition ' + txt(c.edition) + ', compte ' + txt(c.login)); } catch (e) { etat('eConnexion', txt(e.message), true); } };
$('bPerimetre').onclick = async () => { try { const p = await api('/api/perimetre', { cible: $('cible').value.trim() }); etat('ePerimetre', p.fichiers.length + ' fichier(s), ' + p.lignes + ' ligne(s) modifiée(s) ; base ' + txt(p.base.slice(0, 8)) + ', HEAD ' + txt(p.head.slice(0, 8)) + (p.nonCommite.length ? ' — <span class="ko">' + p.nonCommite.length + ' modification(s) non commitée(s), hors examen</span>' : '') + (p.sonarLocalIgnore ? '' : ' — ajouter .sonar-local/ au .gitignore')); } catch (e) { etat('ePerimetre', txt(e.message), true); } };
$('bRegles').onclick = async () => { try { const r = await api('/api/regles', { projet: $('projet').value.trim() }); etat('eRegles', r.map((p) => txt(p.name) + ' (' + txt(p.language) + ') : ' + p.regles.length + ' règles' + (p.depuisCache ? ', depuis le cache vérifié' : '')).join(' ; ') || 'aucun profil'); } catch (e) { etat('eRegles', txt(e.message), true); } };
$('bExport').onclick = async () => {
  try {
    const projet = $('projet').value.trim();
    const r = await api('/api/regles/export', { projet });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([r.contenu], { type: 'text/csv;charset=utf-8' }));
    a.download = 'regles-' + projet + '.csv'; document.body.appendChild(a); a.click(); a.remove();
    etat('eRegles', r.total + ' règles exportées, dont ' + r.actives + ' actives dans le profil du projet ; copie : <code>' + txt(r.fichier) + '</code>');
  } catch (e) { etat('eRegles', txt(e.message), true); }
};
$('bRelecture').onclick = async () => { try { const r = await api('/api/relecture', { projet: $('projet').value.trim() }); etat('eRegles', 'Dossier écrit : <code>' + txt(r.fichier) + '</code> (' + r.regles + ' règles) — à remettre à l\'expert'); } catch (e) { etat('eRegles', txt(e.message), true); } };
const TESTS_PRESETS = { maven: 'inclus dans mvn verify', npm: 'npx ng test --watch=false --code-coverage', personnalise: 'commande de tests, facultative' };
$('scanner').onchange = () => { $('baseLibre').disabled = $('scanner').value !== 'personnalise'; $('tests').placeholder = TESTS_PRESETS[$('scanner').value]; };
$('bProposer').onclick = async () => {
  try {
    const l = await api('/api/ephemere/proposer', { projet: $('projet').value.trim(), type: $('scanner').value, base: $('baseLibre').value, tests: $('tests').value, sansTests: $('sansTests').checked, dossier: $('dossier').value.trim() || '.' });
    $('lot').innerHTML = '<div class="lot" role="group" aria-labelledby="t-lot"><h3 id="t-lot">Écritures proposées (lot de ' + l.ecritures.length + ')</h3><ol>' + l.ecritures.map((x) => '<li>' + txt(x.action) + '<pre>' + txt(x.appel) + '</pre></li>').join('') + '</ol><p>Tests du projet : ' + txt(l.testsDuProjet) + '</p><p>Où part le code : <strong>' + txt(l.ouPartLeCode) + '</strong> — permissions : ' + txt(l.permissions.join(', ')) + ' — valable ' + txt(l.expireDans) + '.</p><button id="bValider">Valider et lancer</button><button id="bAnnuler" class="second">Annuler</button></div>';
    $('bAnnuler').onclick = () => { $('lot').innerHTML = ''; };
    $('bValider').onclick = async () => {
      $('bValider').disabled = true; etat('eEphemere', 'Analyse en cours…');
      try {
        const r = await api('/api/ephemere/lancer', { id: l.id });
        $('lot').innerHTML = '';
        const g = r.qualityGate ? r.qualityGate.status : 'non lu';
        etat('eEphemere', 'Quality gate : ' + txt(g) + ' — ' + r.constats.length + ' constat(s) dans le périmètre, ' + r.horsPerimetre + ' hors périmètre — branche ' + txt(r.branche) + ' : ' + (r.suppression.faite ? 'supprimée' : 'NON supprimée') + (r.suppression.verifiee ? ', vérifié' : ', non vérifié') + (r.limites.length ? ' — limites : ' + txt(r.limites.join(' ; ')) : ''), g !== 'OK' || !r.suppression.faite);
        afficherConstats(r.constats, r.mesures);
      } catch (e) { etat('eEphemere', txt(e.message), true); }
    };
  } catch (e) { etat('eEphemere', txt(e.message), true); }
};
function afficherConstats(c, mesures) {
  const libelles = { tests: 'tests', test_failures: 'échecs', test_errors: 'erreurs', skipped_tests: 'ignorés', coverage: 'couverture (%)', new_coverage: 'couverture du nouveau code (%)' };
  const m = mesures && Object.keys(mesures).length ? '<table><caption>Tests et couverture, lus dans SonarQube</caption><tbody>' + Object.entries(mesures).map(([k, v]) => '<tr><th scope="row">' + txt(libelles[k] || k) + '</th><td>' + (v == null ? '—' : txt(v)) + '</td></tr>').join('') + '</tbody></table>' : '';
  if (!c.length) { $('constats').innerHTML = m + '<p>Aucun constat dans le périmètre.</p>'; return; }
  $('constats').innerHTML = m + '<table><caption>Constats par moteur</caption><thead><tr><th scope="col">Moteur</th><th scope="col">Règle</th><th scope="col">Emplacement</th><th scope="col">Constat</th></tr></thead><tbody>' + c.map((x) => '<tr><td>' + txt(x.moteur) + (x.revueSecurite ? '<br><small>revue de sécurité</small>' : '') + '</td><td><code>' + txt(x.regle) + '</code></td><td><code>' + txt(String(x.composant).split(':').slice(1).join(':')) + (x.ligne ? ':' + x.ligne : '') + '</code></td><td>' + txt(x.message) + '</td></tr>').join('') + '</tbody></table>';
}
$('bJournal').onclick = async () => { const j = await api('/api/journal'); $('journal').innerHTML = j.map((x) => '<tr><td>' + txt(x.date) + '</td><td>' + txt(x.methode) + '</td><td><code>' + txt(x.chemin) + '</code></td><td>' + x.statut + '</td><td>' + (x.ecriture ? '<span class="ko">oui</span>' : 'non') + '</td></tr>').join(''); };
charger().catch((e) => etat('eConnexion', txt(e.message), true));
</script></body></html>`;

function lireCorps(req) {
  return new Promise((resolve, reject) => {
    let d = '';
    req.on('data', (c) => { d += c; if (d.length > 1e6) { reject(new Error('requête trop grande')); req.destroy(); } });
    req.on('end', () => { try { resolve(d ? JSON.parse(d) : {}); } catch { reject(new Error('JSON invalide')); } });
  });
}

/** Serveur du pilote : boucle locale, clé de session, en-tête Host local (D10.INV-1). */
export function creerServeur(pilote, { cle = crypto.randomBytes(18).toString('hex') } = {}) {
  const envoyer = (res, code, objet, type = 'application/json; charset=utf-8') => {
    const corps = type.startsWith('application/json') ? JSON.stringify(objet) : objet;
    res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer' });
    res.end(corps);
  };
  const serveur = http.createServer(async (req, res) => {
    try {
      const hote = String(req.headers.host || '').replace(/:\d+$/, '');
      if (!['127.0.0.1', 'localhost', '[::1]'].includes(hote)) return envoyer(res, 403, { erreur: 'hôte refusé' });
      const url = new URL(req.url, 'http://127.0.0.1');
      if (req.method === 'GET' && url.pathname === '/') {
        if (url.searchParams.get('cle') !== cle) return envoyer(res, 403, 'clé de session absente ou fausse', 'text/plain; charset=utf-8');
        return envoyer(res, 200, PAGE.replace('__CLE__', cle), 'text/html; charset=utf-8');
      }
      if (req.headers['x-pilote-cle'] !== cle) return envoyer(res, 403, { erreur: 'clé de session absente ou fausse' });
      const corps = req.method === 'POST' ? await lireCorps(req) : {};
      const routes = {
        'GET /api/etat': () => pilote.modes(),
        'GET /api/journal': () => pilote.journal,
        'GET /api/mcp': () => ({ commande: pilote.commandeMcp() }),
        'POST /api/connexion': () => pilote.connexion(corps.mode),
        'POST /api/perimetre': () => pilote.calculerPerimetre(corps.cible),
        'POST /api/regles': () => pilote.regles(corps.projet),
        'POST /api/relecture': () => pilote.dossierRelecture(corps.projet),
        'POST /api/regles/export': () => pilote.exporterRegles(corps.projet),
        'POST /api/ephemere/proposer': () => pilote.proposerEphemere(corps),
        'POST /api/ephemere/lancer': () => pilote.lancerEphemere(corps.id),
      };
      const route = routes[`${req.method} ${url.pathname}`];
      if (!route) return envoyer(res, 404, { erreur: 'route inconnue' });
      return envoyer(res, 200, await route());
    } catch (e) {
      const msg = pilote.jeton ? String(e.message).split(pilote.jeton).join('***') : String(e.message);
      return envoyer(res, e.statut === 409 ? 409 : 400, { erreur: msg });
    }
  });
  return { serveur, cle };
}

// ---------------------------------------------------------------- ligne de commande

async function principal(argv) {
  const opt = { port: 8765, racine: process.cwd() };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--port') opt.port = Number(argv[++i]);
    else if (argv[i] === '--racine') opt.racine = argv[++i];
    else if (argv[i] === '--version') { console.log(VERSION); return; }
    else { console.error(`option inconnue : ${argv[i]}\nusage : node pilote-sonar.mjs [--port 8765] [--racine <dépôt>]`); process.exitCode = 2; return; }
  }
  if (!fs.existsSync(path.join(opt.racine, '.git'))) { console.error(`${opt.racine} n'est pas la racine d'un dépôt git`); process.exitCode = 2; return; }
  const pilote = new Pilote({ racine: opt.racine });
  const { serveur, cle } = creerServeur(pilote);
  serveur.listen(opt.port, '127.0.0.1', () => {
    console.log(`Pilote SonarQube ${VERSION} — dépôt ${pilote.racine}`);
    console.log(`Instance : ${pilote.hote || 'SONAR_HOST_URL absent'} ; jeton : ${pilote.jeton ? 'présent' : 'absent'}`);
    console.log(`Ouvrir : http://127.0.0.1:${serveur.address().port}/?cle=${cle}`);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  principal(process.argv.slice(2));
}
```

## 10. Recette simulée `tests/pilote-sonar.test.mjs`

<!-- fichier : tests/pilote-sonar.test.mjs -->
```javascript
// Recette du pilote SonarQube (skill sonarqube 1.1.0, module pilotage, D10).
// Faux SonarQube local, dépôt git temporaire avec un origin nu, faux scanner : aucun réseau externe.
// Lancer : node --test tests/pilote-sonar.test.mjs

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  Pilote, creerServeur, nomBrancheLocale, enteteAuth, verifierCommande, commandeScanner,
  analyserDiff, dansPerimetre, environnementScanner, PRESETS, valeurMesure, dossierProjet,
} from '../outils/pilote-sonar.mjs';

const JETON = 'squ_jeton-de-recette-0123456789';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pilote-sonar-'));
const depot = path.join(tmp, 'depot');
const trace = path.join(tmp, 'scanner.json');
const fauxScanner = path.join(tmp, 'faux-scanner.mjs');
const bin = path.join(tmp, 'bin');
const traceOutils = path.join(tmp, 'outils.jsonl');
let sonar; let hote;
const MESURES_DEFAUT = [
  { metric: 'tests', value: '12' }, { metric: 'test_failures', value: '1' }, { metric: 'test_errors', value: '0' },
  { metric: 'skipped_tests', value: '2' }, { metric: 'coverage', value: '81.5' }, { metric: 'new_coverage', period: { index: 1, value: '71.4' } },
];
const etat = { branches: new Set(['main', 'develop']), refuserBearer: false, rulesUpdatedAt: '2026-10-28T10:00:00+0000', reglesLues: 0, supprimerEchoue: false, mesures: MESURES_DEFAUT };

function g(...args) { return execFileSync('git', args, { cwd: depot, encoding: 'utf8' }); }

before(async () => {
  // Dépôt : develop sur origin, puis une branche locale avec deux commits non poussés et un fichier non commité.
  execFileSync('git', ['init', '--bare', '-q', path.join(tmp, 'origin.git')]);
  fs.mkdirSync(depot);
  g('init', '-q', '-b', 'develop');
  g('config', 'user.email', 'recette@exemple.org'); g('config', 'user.name', 'Recette'); g('config', 'core.autocrlf', 'false');
  g('remote', 'add', 'origin', path.join(tmp, 'origin.git'));
  fs.mkdirSync(path.join(depot, 'src'));
  fs.writeFileSync(path.join(depot, 'src', 'A.java'), 'class A {\n  int a = 1;\n  int b = 2;\n}\n');
  fs.writeFileSync(path.join(depot, '.gitignore'), '.sonar-local/\n');
  g('add', '.'); g('commit', '-q', '-m', 'base'); g('push', '-q', 'origin', 'develop');
  g('checkout', '-q', '-b', 'feature');
  fs.writeFileSync(path.join(depot, 'src', 'A.java'), 'class A {\n  int a = 10;\n  int b = 2;\n}\n');
  g('commit', '-q', '-am', 'modifie A');
  fs.writeFileSync(path.join(depot, 'src', 'B.java'), 'class B {\n  void f() {}\n}\n');
  g('add', '.'); g('commit', '-q', '-m', 'ajoute B');
  fs.mkdirSync(path.join(depot, 'web', 'src', 'app'), { recursive: true });
  fs.writeFileSync(path.join(depot, 'web', 'src', 'app', 'b.service.ts'), 'export class BService {\n  inutile = 1;\n}\n');
  g('add', '.'); g('commit', '-q', '-m', 'ajoute le service du front');
  fs.writeFileSync(path.join(depot, 'brouillon.txt'), 'non commité\n');

  // Faux mvn et npx en tête du PATH : consignent appel, arguments et dossier ; le scan crée la branche.
  fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, 'faux-outil.mjs'), `import fs from 'node:fs';
const [outil, ...args] = process.argv.slice(2);
fs.appendFileSync(${JSON.stringify(traceOutils)}, JSON.stringify({ outil, args, dossier: process.cwd() }) + '\\n');
if (outil === 'npx' && args[0] === 'ng') process.exit(Number(process.env.FAUX_TESTS_CODE || 0));
const b = args.find((a) => a.startsWith('-Dsonar.branch.name='));
if (b) await fetch(process.env.SONAR_HOST_URL + '/faux/creer-branche?b=' + encodeURIComponent(b.split('=')[1]));
`);
  for (const outil of ['npx', 'mvn']) {
    fs.writeFileSync(path.join(bin, outil), `#!/bin/sh\nexec node "\${0%/*}/faux-outil.mjs" ${outil} "$@"\n`, { mode: 0o755 });
    fs.writeFileSync(path.join(bin, `${outil}.cmd`), `@echo off\r\nnode "%~dp0faux-outil.mjs" ${outil} %*\r\n`);
  }

  // Faux scanner : consigne ses arguments et son environnement, sort avec le code demandé.
  fs.writeFileSync(fauxScanner, `import fs from 'node:fs';
fs.writeFileSync(${JSON.stringify(trace)}, JSON.stringify({ args: process.argv.slice(2), mr: Object.keys(process.env).filter((k) => k.startsWith('CI_MERGE_REQUEST_')), jeton: Boolean(process.env.SONAR_TOKEN) }));
const b = process.argv.find((a) => a.startsWith('-Dsonar.branch.name='));
if (b) await fetch(process.env.SONAR_HOST_URL + '/faux/creer-branche?b=' + encodeURIComponent(b.split('=')[1]));
console.log('analyse terminée, jeton ' + process.env.SONAR_TOKEN);
process.exit(Number(process.env.FAUX_CODE || 0));
`);

  // Faux SonarQube.
  sonar = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    const auth = req.headers.authorization || '';
    const json = (code, o) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(o)); };
    if (url.pathname === '/faux/creer-branche') { etat.branches.add(url.searchParams.get('b')); return json(200, {}); }
    const bearer = auth === `Bearer ${JETON}` && !etat.refuserBearer;
    const basic = auth === `Basic ${Buffer.from(`${JETON}:`).toString('base64')}`;
    if (url.pathname === '/mcp') return json(404, {});
    if (!bearer && !basic) return json(401, { errors: [{ msg: 'non authentifié' }] });
    const p = url.pathname;
    if (p === '/api/authentication/validate') return json(200, { valid: true });
    if (p === '/api/server/version') { res.writeHead(200, { 'content-type': 'text/plain' }); return res.end('2026.5.0.12345'); }
    if (p === '/api/navigation/global') return json(200, { edition: 'developer' });
    if (p === '/api/users/current') return json(200, { login: 'F.Garcia', permissions: { global: ['scan'] } });
    if (p === '/api/qualityprofiles/search') {
      if (url.searchParams.get('project') === 'acme-web') return json(200, { profiles: [{ key: 'AYprof-ts', name: 'Sonar way', language: 'ts', rulesUpdatedAt: '2026-09-01T08:00:00+0000' }] });
      return json(200, { profiles: [{ key: 'AYprof-java', name: 'Acme way', language: 'java', rulesUpdatedAt: etat.rulesUpdatedAt }] });
    }
    if (p === '/api/rules/search' && url.searchParams.get('languages')) {
      const l = url.searchParams.get('languages');
      const regles = l === 'ts'
        ? [{ key: 'typescript:S1481', name: 'Variable locale inutilisée', lang: 'ts', type: 'CODE_SMELL', severity: 'MINOR', status: 'READY', impacts: [{ softwareQuality: 'MAINTAINABILITY', severity: 'LOW' }] },
          { key: 'typescript:S1525', name: 'Instruction debugger', lang: 'ts', type: 'VULNERABILITY', severity: 'MINOR', status: 'DEPRECATED' },
          { key: 'typescript:S9998', name: 'Règle hors profil', lang: 'ts', type: 'BUG', severity: 'MAJOR', status: 'READY', sysTags: ['suspicious'] }]
        : [{ key: 'java:S6813', name: 'Injection par champ', lang: 'java', type: 'CODE_SMELL', severity: 'MAJOR', status: 'READY', impacts: [{ softwareQuality: 'MAINTAINABILITY', severity: 'MEDIUM' }] },
          { key: 'java:S2077', name: 'Requête SQL "formatée"; à vérifier', lang: 'java', type: 'VULNERABILITY', severity: 'CRITICAL', status: 'READY', impacts: [{ softwareQuality: 'SECURITY', severity: 'HIGH' }] },
          { key: 'java:S1481', name: 'Variable locale inutilisée', lang: 'java', type: 'CODE_SMELL', severity: 'MINOR', status: 'READY' },
          { key: 'java:S9999', name: 'Règle hors profil', lang: 'java', type: 'BUG', severity: 'MAJOR', status: 'READY', scope: 'TEST' }];
      return json(200, { total: regles.length, rules: Number(url.searchParams.get('p')) > 1 ? [] : regles });
    }
    if (p === '/api/rules/search') {
      etat.reglesLues++;
      const page = Number(url.searchParams.get('p'));
      if (url.searchParams.get('qprofile') === 'AYprof-ts') return json(200, { total: 2, rules: page > 1 ? [] : [{ key: 'typescript:S1481', name: 'Variable locale inutilisée', lang: 'ts' }, { key: 'typescript:S1525', name: 'Instruction debugger', lang: 'ts' }] });
      const toutes = [{ key: 'java:S6813', name: 'Injection par champ', lang: 'java' }, { key: 'java:S2077', name: 'Requête SQL formatée', lang: 'java' }, { key: 'java:S1481', name: 'Variable locale inutilisée', lang: 'java' }];
      const ps = 2;
      return json(200, { total: toutes.length, rules: toutes.slice((page - 1) * ps, page * ps) });
    }
    if (p === '/api/qualitygates/project_status') return json(200, { projectStatus: { status: 'ERROR', conditions: [{ metricKey: 'new_coverage', status: 'ERROR', actualValue: '71.4', errorThreshold: '80' }] } });
    if (p === '/api/issues/search') {
      if (!etat.branches.has(url.searchParams.get('branch'))) return json(404, { errors: [{ msg: 'branche inconnue' }] });
      if (url.searchParams.get('components') === 'acme-web') return json(200, { total: 2, issues: [
        { key: 'AW1', rule: 'typescript:S1481', component: 'acme-web:src/app/b.service.ts', line: 2, message: 'propriété inutilisée' },
        { key: 'AW2', rule: 'typescript:S1525', component: 'acme-web:src/app/ancien.ts', line: 1, message: 'fichier non modifié' },
      ] });
      return json(200, { total: 3, issues: [
        { key: 'AZ1', rule: 'java:S1481', component: 'acme-api:src/A.java', line: 2, message: 'variable inutilisée', severity: 'MINOR' },
        { key: 'AZ2', rule: 'java:S1481', component: 'acme-api:src/A.java', line: 3, message: 'ligne non modifiée', severity: 'MINOR' },
        { key: 'AZ3', rule: 'java:S6813', component: 'acme-api:src/B.java', line: 2, message: 'injection par champ', severity: 'MAJOR' },
      ] });
    }
    if (p === '/api/measures/component') {
      if (!etat.branches.has(url.searchParams.get('branch'))) return json(404, { errors: [{ msg: 'branche inconnue' }] });
      return json(200, { component: { key: url.searchParams.get('component'), measures: etat.mesures } });
    }
    if (p === '/api/hotspots/search') return json(404, { errors: [{ msg: 'déprécié' }] });
    if (p === '/api/project_branches/delete' && req.method === 'POST') {
      let corps = ''; req.on('data', (c) => { corps += c; });
      req.on('end', () => {
        const b = new URLSearchParams(corps).get('branch');
        if (etat.supprimerEchoue) return json(500, { errors: [{ msg: 'panne' }] });
        etat.branches.delete(b); return json(200, {});
      });
      return undefined;
    }
    if (p === '/api/project_branches/list') return json(200, { branches: [...etat.branches].map((name) => ({ name })) });
    return json(404, { errors: [{ msg: `route inconnue ${p}` }] });
  });
  await new Promise((r) => sonar.listen(0, '127.0.0.1', r));
  hote = `http://127.0.0.1:${sonar.address().port}`;
});

after(() => { sonar.close(); fs.rmSync(tmp, { recursive: true, force: true }); });

const CLE_PATH = Object.keys(process.env).find((k) => k.toUpperCase() === 'PATH') || 'PATH';
const env = (extra = {}) => ({ ...process.env, [CLE_PATH]: bin + path.delimiter + process.env[CLE_PATH], SONAR_HOST_URL: hote, SONAR_TOKEN: JETON, CI_MERGE_REQUEST_IID: '412', ...extra });
const appelsOutils = () => (fs.existsSync(traceOutils) ? fs.readFileSync(traceOutils, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);

/** Un pilote servi sur un port libre ; renvoie un client qui porte la clé de session. */
async function demarrer(extra) {
  const pilote = new Pilote({ racine: depot, env: env(extra) });
  const { serveur, cle } = creerServeur(pilote);
  await new Promise((r) => serveur.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${serveur.address().port}`;
  const appel = async (chemin, corps, { avecCle = true, hoteEntete } = {}) => {
    const headers = { 'content-type': 'application/json' };
    if (avecCle) headers['x-pilote-cle'] = cle;
    if (hoteEntete) headers.host = hoteEntete;
    const r = await new Promise((resolve, reject) => {
      const u = new URL(base + chemin);
      const req = http.request({ hostname: u.hostname, port: u.port, path: u.pathname + u.search, method: corps ? 'POST' : 'GET', headers }, (rep) => {
        let d = ''; rep.on('data', (c) => { d += c; }); rep.on('end', () => resolve({ status: rep.statusCode, texte: d }));
      });
      req.on('error', reject);
      if (corps) req.write(JSON.stringify(corps));
      req.end();
    });
    let json = null; try { json = JSON.parse(r.texte); } catch { /* page HTML */ }
    return { ...r, json };
  };
  return { pilote, cle, appel, fermer: () => serveur.close() };
}

test('P1 : branche de travail préfixée local-, login assaini, empreinte courte (D9.INV-2)', () => {
  assert.equal(nomBrancheLocale('F.Garcia', '9c41e07ab12'), 'local-f-garcia-9c41e07a');
  assert.match(nomBrancheLocale('', 'abcdef1234'), /^local-inconnu-abcdef12$/);
  assert.throws(() => nomBrancheLocale('x', 'zz'));
});

test('P2 : deux modes d\'API, Bearer ou jeton en nom d\'utilisateur (D1.INV-5)', () => {
  assert.equal(enteteAuth('bearer', 'abc'), 'Bearer abc');
  assert.equal(enteteAuth('basic', 'abc'), `Basic ${Buffer.from('abc:').toString('base64')}`);
  assert.throws(() => enteteAuth('mcp', 'abc'));
  assert.throws(() => enteteAuth('bearer', ''));
});

test('P3 : une commande de scanner ne fixe ni branche, ni MR, ni jeton (D9.INV-2, D1.INV-2)', () => {
  assert.throws(() => verifierCommande('mvn sonar:sonar -Dsonar.branch.name=main'));
  assert.throws(() => verifierCommande('npx @sonar/scan -Dsonar.pullrequest.key=4'));
  assert.throws(() => verifierCommande('npx @sonar/scan -Dsonar.token=x'));
  assert.throws(() => verifierCommande(`npx @sonar/scan -Dx=${JETON}`, JETON));
  const c = commandeScanner('npx @sonar/scan', 'local-f-12345678', 'develop');
  assert.match(c, /-Dsonar\.branch\.name=local-f-12345678 -Dsonar\.newCode\.referenceBranch=develop$/);
  assert.throws(() => commandeScanner('npx @sonar/scan', 'main', 'develop'));
});

test('P4 : lignes modifiées et périmètre d\'un constat (D9.INV-3)', () => {
  const plages = analyserDiff('+++ b/src/A.java\n@@ -2 +2 @@\n+++ b/src/B.java\n@@ -0,0 +1,3 @@\n+++ /dev/null\n@@ -1,2 +0,0 @@\n');
  assert.deepEqual(plages.get('src/A.java'), [[2, 2]]);
  assert.deepEqual(plages.get('src/B.java'), [[1, 3]]);
  assert.equal(dansPerimetre(plages, 'acme-api:src/A.java', 2), true);
  assert.equal(dansPerimetre(plages, 'acme-api:src/A.java', 3), false);
  assert.equal(dansPerimetre(plages, 'acme-api:src/B.java', null), true);
  assert.equal(dansPerimetre(plages, 'acme-api:src/C.java', 1), false);
});

test('P5 : l\'environnement du scanner ne contient aucune variable de merge request', () => {
  const e = environnementScanner({ CI_MERGE_REQUEST_IID: '1', CI_MERGE_REQUEST_TARGET_BRANCH_NAME: 'main', SONAR_TOKEN: 't', PATH: '/bin' });
  assert.deepEqual(Object.keys(e).sort(), ['PATH', 'SONAR_TOKEN']);
});

test('P6 : la page et l\'API exigent la clé de session et un Host local (D10.INV-1)', async () => {
  const s = await demarrer();
  try {
    assert.equal((await s.appel('/')).status, 403);
    assert.equal((await s.appel(`/?cle=${s.cle}`)).status, 200);
    assert.equal((await s.appel('/api/etat', null, { avecCle: false })).status, 403);
    assert.equal((await s.appel('/api/etat', null, { hoteEntete: 'attaquant.exemple:80' })).status, 403);
  } finally { s.fermer(); }
});

test('P7 : le jeton ne parvient jamais au navigateur (D10.INV-2)', async () => {
  const s = await demarrer();
  try {
    const page = await s.appel(`/?cle=${s.cle}`);
    const etatJ = await s.appel('/api/etat');
    assert.equal(etatJ.json.jetonPresent, true);
    assert.equal(etatJ.json.modes.find((m) => m.id === 'mcp-heberge').note, 'absent');
    for (const r of [page, etatJ, await s.appel('/api/mcp')]) assert.equal(r.texte.includes(JETON), false);
    assert.match((await s.appel('/api/mcp')).json.commande, /-e SONARQUBE_TOKEN /);
  } finally { s.fermer(); }
});

test('P8 : connexion par l\'un ou l\'autre mode d\'API ; le mode retenu sert ensuite (D1.INV-4, D1.INV-5)', async () => {
  const s = await demarrer();
  try {
    const c = await s.appel('/api/connexion', { mode: 'bearer' });
    assert.equal(c.status, 200);
    assert.equal(c.json.version, '2026.5.0.12345');
    assert.equal(c.json.edition, 'developer');
    etat.refuserBearer = true;
    assert.equal((await s.appel('/api/connexion', { mode: 'bearer' })).status, 400);
    assert.equal((await s.appel('/api/connexion', { mode: 'basic' })).status, 200);
    assert.equal(s.pilote.modeApi, 'basic');
    assert.equal((await s.appel('/api/connexion', { mode: 'mcp' })).status, 400);
  } finally { etat.refuserBearer = false; s.fermer(); }
});

test('P9 : périmètre = diff avec la base de fusion de origin/<cible> ; non commité déclaré (D9.INV-3)', async () => {
  const s = await demarrer();
  try {
    const r = await s.appel('/api/perimetre', { cible: 'develop' });
    assert.equal(r.status, 200, r.texte);
    assert.deepEqual(r.json.fichiers.sort(), ['src/A.java', 'src/B.java', 'web/src/app/b.service.ts']);
    assert.equal(r.json.lignes, 7);
    assert.deepEqual(r.json.nonCommite, ['?? brouillon.txt']);
    assert.equal(r.json.sonarLocalIgnore, true);
    assert.equal(r.json.head, g('rev-parse', 'HEAD').trim());
    assert.equal((await s.appel('/api/perimetre', { cible: 'develop; rm -rf /' })).status, 400);
  } finally { s.fermer(); }
});

test('P10 : règles actives paginées, cache réutilisé tant que le profil ne change pas (D9.INV-4)', async () => {
  const s = await demarrer();
  try {
    etat.reglesLues = 0;
    fs.rmSync(path.join(depot, '.sonar-local'), { recursive: true, force: true });
    const r1 = await s.appel('/api/regles', { projet: 'acme-api' });
    assert.equal(r1.json[0].regles.length, 3);
    assert.equal(r1.json[0].depuisCache, false);
    assert.equal(etat.reglesLues, 2);
    const r2 = await s.appel('/api/regles', { projet: 'acme-api' });
    assert.equal(r2.json[0].depuisCache, true);
    assert.equal(etat.reglesLues, 2);
    etat.rulesUpdatedAt = '2026-11-01T09:00:00+0000';
    const r3 = await s.appel('/api/regles', { projet: 'acme-api' });
    assert.equal(r3.json[0].depuisCache, false);
  } finally { s.fermer(); }
});

test('P11 : rien n\'est écrit sans lot proposé, validé et non expiré (D10.INV-3)', async () => {
  const s = await demarrer();
  try {
    assert.equal((await s.appel('/api/ephemere/lancer', { id: 'inconnu' })).status, 409);
    await s.appel('/api/perimetre', { cible: 'develop' });
    let maintenant = Date.now();
    s.pilote.horloge = () => maintenant;
    const lot = (await s.appel('/api/ephemere/proposer', { projet: 'acme-api', type: 'personnalise', base: `node "${fauxScanner}"` })).json;
    assert.equal(lot.ecritures.length, 2);
    assert.match(lot.ecritures[1].appel, /^POST \/api\/project_branches\/delete /);
    maintenant += 11 * 60 * 1000;
    fs.rmSync(trace, { force: true });
    assert.equal((await s.appel('/api/ephemere/lancer', { id: lot.id })).status, 409);
    assert.equal(fs.existsSync(trace), false, 'le scanner ne doit pas avoir tourné');
    assert.equal(s.pilote.journal.filter((x) => x.ecriture).length, 0);
  } finally { s.fermer(); }
});

test('P12 : analyse éphémère sous local-, constats filtrés et étiquetés, branche supprimée et vérifiée (D9.INV-1, D9.INV-2, D10.INV-4)', async () => {
  const s = await demarrer();
  try {
    await s.appel('/api/connexion', { mode: 'bearer' });
    await s.appel('/api/perimetre', { cible: 'develop' });
    const lot = (await s.appel('/api/ephemere/proposer', { projet: 'acme-api', type: 'personnalise', base: `node "${fauxScanner}"` })).json;
    assert.match(lot.branche, /^local-f-garcia-[0-9a-f]{8}$/);
    const r = await s.appel('/api/ephemere/lancer', { id: lot.id });
    assert.equal(r.status, 200, r.texte);
    const t = JSON.parse(fs.readFileSync(trace, 'utf8'));
    assert.ok(t.args.includes(`-Dsonar.branch.name=${lot.branche}`));
    assert.ok(t.args.includes('-Dsonar.newCode.referenceBranch=develop'));
    assert.deepEqual(t.mr, []);
    assert.equal(t.jeton, true);
    assert.equal(r.json.qualityGate.status, 'ERROR');
    assert.deepEqual(r.json.constats.map((c) => c.cle).sort(), ['AZ1', 'AZ3']);
    assert.equal(r.json.horsPerimetre, 1);
    assert.ok(r.json.constats.every((c) => c.moteur === 'analyse éphémère'));
    assert.deepEqual(r.json.suppression, { faite: true, verifiee: true, detail: 'branche absente de la liste' });
    assert.equal(etat.branches.has(lot.branche), false);
    assert.equal(r.texte.includes(JETON), false, 'la sortie du scanner est expurgée');
    assert.equal((await s.appel('/api/ephemere/lancer', { id: lot.id })).status, 409, 'un lot ne sert qu\'une fois');
  } finally { s.fermer(); }
});

test('P13 : scanner en erreur (gate en échec) : résultats lus quand même, branche supprimée (D9.INV-2)', async () => {
  const s = await demarrer({ FAUX_CODE: '3' });
  try {
    await s.appel('/api/perimetre', { cible: 'develop' });
    const lot = (await s.appel('/api/ephemere/proposer', { projet: 'acme-api', type: 'personnalise', base: `node "${fauxScanner}"` })).json;
    const r = await s.appel('/api/ephemere/lancer', { id: lot.id });
    assert.equal(r.status, 200);
    assert.equal(r.json.scanner.code, 3);
    assert.ok(r.json.limites.some((l) => l.startsWith('scanner sorti en erreur (code 3)')));
    assert.ok(r.json.qualityGate, 'branche créée : l\'instance est lue malgré le code de sortie');
    assert.equal(r.json.suppression.faite, true);
    assert.equal(etat.branches.has(lot.branche), false);
  } finally { s.fermer(); }
});

test('P14 : un échec de suppression est rapporté avec le nom de la branche restante', async () => {
  const s = await demarrer();
  try {
    etat.supprimerEchoue = true;
    await s.appel('/api/perimetre', { cible: 'develop' });
    const lot = (await s.appel('/api/ephemere/proposer', { projet: 'acme-api', type: 'personnalise', base: `node "${fauxScanner}"` })).json;
    const r = await s.appel('/api/ephemere/lancer', { id: lot.id });
    assert.equal(r.json.suppression.faite, false);
    assert.match(r.json.suppression.detail, /HTTP 500/);
  } finally { etat.supprimerEchoue = false; etat.branches.clear(); etat.branches.add('main'); etat.branches.add('develop'); s.fermer(); }
});

test('P15 : journal sans jeton, écritures marquées (D10.INV-2, D6.INV-1)', async () => {
  const s = await demarrer();
  try {
    await s.appel('/api/perimetre', { cible: 'develop' });
    const lot = (await s.appel('/api/ephemere/proposer', { projet: 'acme-api', type: 'personnalise', base: `node "${fauxScanner}"` })).json;
    await s.appel('/api/ephemere/lancer', { id: lot.id });
    const j = await s.appel('/api/journal');
    assert.equal(j.texte.includes(JETON), false);
    const ecritures = j.json.filter((x) => x.ecriture);
    assert.equal(ecritures.length, 1);
    assert.equal(ecritures[0].chemin, '/api/project_branches/delete');
    assert.equal(ecritures[0].methode, 'POST');
  } finally { s.fermer(); }
});

test('P16 : dossier de relecture avec règles actives et diff, dans .sonar-local (D9.INV-1, D9.INV-4)', async () => {
  const s = await demarrer();
  try {
    await s.appel('/api/perimetre', { cible: 'develop' });
    const r = await s.appel('/api/relecture', { projet: 'acme-api' });
    assert.equal(r.status, 200, r.texte);
    assert.match(r.json.fichier, /^\.sonar-local[\\/]relecture-[0-9a-f]{8}\.md$/);
    const texte = fs.readFileSync(path.join(depot, r.json.fichier), 'utf8');
    assert.match(texte, /`java:S6813`/);
    assert.match(texte, /ne sont pas des issues SonarQube/);
    assert.match(texte, /\+  int a = 10;/);
    assert.equal(g('status', '--porcelain').includes('.sonar-local'), false);
  } finally { s.fermer(); }
});

test('P17 : préréglage npm, les tests du projet tournent avant l\'analyse, dans le dossier du projet (D9.INV-7)', async () => {
  const s = await demarrer();
  try {
    fs.rmSync(traceOutils, { force: true });
    await s.appel('/api/perimetre', { cible: 'develop' });
    const lot = (await s.appel('/api/ephemere/proposer', { projet: 'acme-web', type: 'npm', dossier: 'web' })).json;
    assert.match(lot.testsDuProjet, /^lancés avant l'analyse : npx ng test --watch=false --code-coverage$/);
    const r = await s.appel('/api/ephemere/lancer', { id: lot.id });
    assert.equal(r.status, 200, r.texte);
    const appels = appelsOutils();
    assert.deepEqual(appels.map((a) => a.args[0]), ['ng', '@sonar/scan']);
    assert.ok(appels.every((a) => fs.realpathSync(a.dossier) === fs.realpathSync(path.join(depot, 'web'))));
    assert.ok(appels[1].args.includes(`-Dsonar.branch.name=${lot.branche}`));
    assert.ok(appels[1].args.includes('-Dsonar.qualitygate.wait=true'));
    assert.equal(r.json.tests.code, 0);
    assert.equal(r.json.suppression.faite, true);
  } finally { s.fermer(); }
});

test('P18 : préréglage Maven, tests JUnit et JaCoCo dans verify, échecs de tests importés plutôt que bloquants (D9.INV-7)', async () => {
  const s = await demarrer();
  try {
    fs.rmSync(traceOutils, { force: true });
    await s.appel('/api/perimetre', { cible: 'develop' });
    const lot = (await s.appel('/api/ephemere/proposer', { projet: 'acme-api', type: 'maven' })).json;
    assert.equal(lot.testsDuProjet, PRESETS.maven.note);
    await s.appel('/api/ephemere/lancer', { id: lot.id });
    const appels = appelsOutils();
    assert.equal(appels.length, 1);
    assert.equal(appels[0].outil, 'mvn');
    for (const a of ['verify', '-Dmaven.test.failure.ignore=true', `-Dsonar.branch.name=${lot.branche}`, '-Dsonar.newCode.referenceBranch=develop']) assert.ok(appels[0].args.includes(a), a);
  } finally { s.fermer(); }
});

test('P19 : tests et couverture lus sur la branche de travail ; échecs signalés (D9.INV-7, D6.INV-2)', async () => {
  const s = await demarrer();
  try {
    await s.appel('/api/perimetre', { cible: 'develop' });
    const lot = (await s.appel('/api/ephemere/proposer', { projet: 'acme-api', type: 'maven' })).json;
    const r = (await s.appel('/api/ephemere/lancer', { id: lot.id })).json;
    assert.deepEqual(r.mesures, { tests: 12, test_failures: 1, test_errors: 0, skipped_tests: 2, coverage: 81.5, new_coverage: 71.4 });
    assert.ok(r.limites.includes('1 test(s) en échec ou en erreur, lus dans SonarQube'));
    assert.equal(r.limites.some((l) => l.startsWith('couverture absente')), false);
  } finally { s.fermer(); }
});

test('P20 : couverture absente signalée ; tests non lancés annoncés dans le lot (D2.INV-2, D9.INV-7)', async () => {
  const s = await demarrer();
  try {
    etat.mesures = [{ metric: 'tests', value: '0' }];
    await s.appel('/api/perimetre', { cible: 'develop' });
    const lot = (await s.appel('/api/ephemere/proposer', { projet: 'acme-web', type: 'npm', dossier: 'web', sansTests: true })).json;
    assert.match(lot.testsDuProjet, /^non lancés/);
    fs.rmSync(traceOutils, { force: true });
    const r = (await s.appel('/api/ephemere/lancer', { id: lot.id })).json;
    assert.deepEqual(appelsOutils().map((a) => a.args[0]), ['@sonar/scan']);
    assert.ok(r.limites.some((l) => l.startsWith('couverture absente')));
  } finally { etat.mesures = MESURES_DEFAUT; s.fermer(); }
});

test('P21 : front TypeScript dans web/, constats ramenés au dépôt et filtrés, profil TS dans son propre cache (D9.INV-1, D9.INV-3, D9.INV-4)', async () => {
  const s = await demarrer();
  try {
    await s.appel('/api/perimetre', { cible: 'develop' });
    const regles = (await s.appel('/api/regles', { projet: 'acme-web' })).json;
    assert.deepEqual(regles.map((p) => [p.language, p.regles.length]), [['ts', 2]]);
    assert.ok(fs.existsSync(path.join(depot, '.sonar-local', 'regles-AYprof-ts.json')));
    assert.ok(fs.existsSync(path.join(depot, '.sonar-local', 'regles-AYprof-java.json')));
    const lot = (await s.appel('/api/ephemere/proposer', { projet: 'acme-web', type: 'npm', dossier: 'web' })).json;
    const r = (await s.appel('/api/ephemere/lancer', { id: lot.id })).json;
    assert.deepEqual(r.constats.map((c) => [c.cle, c.regle, c.moteur]), [['AW1', 'typescript:S1481', 'analyse éphémère']]);
    assert.equal(r.horsPerimetre, 1);
    assert.equal(dansPerimetre(analyserDiff('+++ b/web/src/a.ts\n@@ -0,0 +1 @@\n'), 'acme-web:src/a.ts', 1, 'web'), true);
  } finally { s.fermer(); }
});

test('P22 : tests du projet en échec, l\'analyse continue et la branche est supprimée (D9.INV-2, D9.INV-7)', async () => {
  const s = await demarrer({ FAUX_TESTS_CODE: '1' });
  try {
    fs.rmSync(traceOutils, { force: true });
    await s.appel('/api/perimetre', { cible: 'develop' });
    const lot = (await s.appel('/api/ephemere/proposer', { projet: 'acme-web', type: 'npm', dossier: 'web' })).json;
    const r = (await s.appel('/api/ephemere/lancer', { id: lot.id })).json;
    assert.equal(r.tests.code, 1);
    assert.ok(r.limites.some((l) => l.startsWith('tests du projet en échec (code 1)')));
    assert.deepEqual(appelsOutils().map((a) => a.args[0]), ['ng', '@sonar/scan']);
    assert.equal(r.suppression.faite, true);
  } finally { s.fermer(); }
});

test('P23 : dossier du projet et commande de tests vérifiés avant tout lot (D1.INV-2)', async () => {
  const s = await demarrer();
  try {
    await s.appel('/api/perimetre', { cible: 'develop' });
    for (const dossier of ['../ailleurs', '/etc', 'C:/Windows', 'absent']) {
      assert.equal((await s.appel('/api/ephemere/proposer', { projet: 'acme-web', type: 'npm', dossier })).status, 400, dossier);
    }
    assert.equal((await s.appel('/api/ephemere/proposer', { projet: 'acme-web', type: 'npm', dossier: 'web', tests: `npm test -- --jeton=${JETON}` })).status, 400);
    assert.equal(dossierProjet(depot, 'web/'), 'web');
    assert.equal(dossierProjet(depot, '.'), '.');
  } finally { s.fermer(); }
});

test('P24 : valeur d\'une mesure, directe ou de période', () => {
  assert.equal(valeurMesure({ metric: 'coverage', value: '81.5' }), 81.5);
  assert.equal(valeurMesure({ metric: 'new_coverage', period: { value: '71.4' } }), 71.4);
  assert.equal(valeurMesure({ metric: 'new_coverage', periods: [{ index: 1, value: '0.0' }] }), 0);
  assert.equal(valeurMesure({ metric: 'tests' }), null);
});

test('P25 : analyse absente de l\'instance, aucun constat inventé, suppression tentée (D9.INV-1, D9.INV-2)', async () => {
  const s = await demarrer();
  try {
    await s.appel('/api/perimetre', { cible: 'develop' });
    const lot = (await s.appel('/api/ephemere/proposer', { projet: 'acme-api', type: 'personnalise', base: 'node -e "process.exit(4)"' })).json;
    const r = (await s.appel('/api/ephemere/lancer', { id: lot.id })).json;
    assert.ok(r.limites.includes('analyse absente de l\'instance : aucun constat lu'));
    assert.deepEqual(r.constats, []);
    assert.equal(r.qualityGate, null);
    assert.equal(s.pilote.journal.filter((x) => x.ecriture).length >= 1, true);
  } finally { s.fermer(); }
});

test('P26 : export CSV de toutes les règles des langages du projet, actives ou non dans son profil (D9.INV-4, D10.INV-2)', async () => {
  const s = await demarrer();
  try {
    for (const [projet, total, actives, hors] of [['acme-api', 4, 3, 'java:S9999'], ['acme-web', 3, 2, 'typescript:S9998']]) {
      const r = await s.appel('/api/regles/export', { projet });
      assert.equal(r.status, 200, r.texte);
      assert.equal(r.json.total, total);
      assert.equal(r.json.actives, actives);
      const lignes = r.json.contenu.split('\r\n');
      assert.equal(lignes[0].charCodeAt(0), 0xfeff, 'BOM pour Excel');
      assert.match(lignes[0], /^﻿clé de règle;langage;titre;type;qualité logicielle : gravité \(mode MQR\);/);
      assert.ok(lignes.some((l) => l.startsWith(`${hors};`) && l.split(';')[7] === 'non'));
      assert.equal(fs.readFileSync(path.join(depot, r.json.fichier), 'utf8'), r.json.contenu);
      assert.equal(r.texte.includes(JETON), false);
    }
    const java = (await s.appel('/api/regles/export', { projet: 'acme-api' })).json.contenu;
    assert.ok(java.includes('"Requête SQL ""formatée""; à vérifier"'), 'champ avec point-virgule et guillemets échappé');
    assert.ok(java.includes('sécurité : haute'));
  } finally { s.fermer(); }
});
```

## 11. Recette réelle `tests/pilote-sonar.reel.test.mjs`

<!-- fichier : tests/pilote-sonar.reel.test.mjs -->
```javascript
// Recette réelle du pilote SonarQube (skill sonarqube 1.1.0, module pilotage, D10).
// Elle tourne contre une vraie instance, édition Developer ou supérieure, sur un projet dédié à la recette.
// Sans les trois variables ci-dessous, chaque scénario est sauté : aucune écriture, aucun réseau.
//
//   RECETTE_SONAR_HOST_URL  adresse de l'instance
//   RECETTE_SONAR_TOKEN     jeton utilisateur : Browse, Execute Analysis et Administer sur le projet de recette
//   RECETTE_SONAR_PROJET    clé du projet de recette, déjà créé sur l'instance, réservé à cet usage
//
// Écritures sur l'instance : une analyse de la branche principale du projet de recette (le décor), puis
// une analyse éphémère sous local-…, supprimée et vérifiée. Réseau : npm (@sonar/scan) et l'instance.
// Lancer : node --test tests/pilote-sonar.reel.test.mjs

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { Pilote, enteteAuth } from '../outils/pilote-sonar.mjs';

const HOTE = (process.env.RECETTE_SONAR_HOST_URL || '').replace(/\/+$/, '');
const JETON = process.env.RECETTE_SONAR_TOKEN || '';
const PROJET = process.env.RECETTE_SONAR_PROJET || '';
const ACTIVE = Boolean(HOTE && JETON && PROJET);
const sauter = ACTIVE ? false : 'RECETTE_SONAR_HOST_URL, RECETTE_SONAR_TOKEN et RECETTE_SONAR_PROJET absentes';
const LONG = 15 * 60 * 1000;
const SCAN = 'npx --yes @sonar/scan';
const TESTS = 'node --test --experimental-test-coverage --test-reporter=spec --test-reporter-destination=stdout --test-reporter=lcov --test-reporter-destination=coverage/lcov.info';

let tmp; let depot; let pilote; let brancheMain = 'main'; let edition = 'inconnue'; let lot = null;
const env = { ...process.env, SONAR_HOST_URL: HOTE, SONAR_TOKEN: JETON };
for (const k of Object.keys(env)) if (/^CI_MERGE_REQUEST_/.test(k)) delete env[k];

function g(...args) { return execFileSync('git', args, { cwd: depot, encoding: 'utf8' }); }
async function api(chemin, options = {}) {
  const r = await fetch(HOTE + chemin, { ...options, headers: { authorization: enteteAuth('bearer', JETON), ...(options.headers || {}) } });
  const texte = await r.text();
  try { return { statut: r.status, corps: JSON.parse(texte) }; } catch { return { statut: r.status, corps: texte }; }
}

before(async () => {
  if (!ACTIVE) return;
  const branches = await api(`/api/project_branches/list?project=${encodeURIComponent(PROJET)}`);
  assert.equal(branches.statut, 200, `projet de recette ${PROJET} introuvable ou jeton sans droit : ${JSON.stringify(branches.corps)}`);
  brancheMain = branches.corps.branches.find((b) => b.isMain)?.name || 'main';

  // Décor : un petit projet JavaScript, testé avec couverture LCOV, analysé sur la branche principale.
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pilote-reel-'));
  depot = path.join(tmp, 'depot');
  execFileSync('git', ['init', '--bare', '-q', path.join(tmp, 'origin.git')]);
  fs.mkdirSync(path.join(depot, 'src'), { recursive: true });
  fs.mkdirSync(path.join(depot, 'test'));
  g('init', '-q', '-b', brancheMain);
  g('config', 'user.email', 'recette@exemple.org'); g('config', 'user.name', 'Recette'); g('config', 'core.autocrlf', 'false');
  g('remote', 'add', 'origin', path.join(tmp, 'origin.git'));
  fs.writeFileSync(path.join(depot, 'sonar-project.properties'), [
    `sonar.projectKey=${PROJET}`, 'sonar.sources=src', 'sonar.tests=test',
    'sonar.javascript.lcov.reportPaths=coverage/lcov.info', 'sonar.scm.provider=git', '',
  ].join('\n'));
  fs.writeFileSync(path.join(depot, 'package.json'), '{ "name": "recette-pilote", "private": true, "type": "module" }\n');
  fs.writeFileSync(path.join(depot, '.gitignore'), 'coverage/\n.sonar-local/\n.scannerwork/\n');
  fs.writeFileSync(path.join(depot, 'src', 'calcul.js'), 'export function somme(a, b) {\n  return a + b;\n}\n');
  fs.writeFileSync(path.join(depot, 'test', 'calcul.test.js'), "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { somme } from '../src/calcul.js';\ntest('somme', () => assert.equal(somme(2, 3), 5));\n");
  g('add', '.'); g('commit', '-q', '-m', 'décor'); g('push', '-q', 'origin', brancheMain);
  const tests = spawnSync(TESTS, { cwd: depot, shell: true, env, encoding: 'utf8' });
  assert.equal(tests.status, 0, tests.stderr);
  const scan = spawnSync(`${SCAN} -Dsonar.qualitygate.wait=false`, { cwd: depot, shell: true, env, encoding: 'utf8', timeout: LONG });
  assert.equal(scan.status, 0, `analyse du décor : ${(scan.stdout + scan.stderr).split(JETON).join('***').slice(-3000)}`);

  // Modification à examiner, sans test : trois règles actives de Sonar way pour JavaScript
  // (S3504 déclaration par var, S1481 variable inutilisée, S1186 fonction vide).
  g('checkout', '-q', '-b', 'fonction-locale');
  fs.writeFileSync(path.join(depot, 'src', 'nouveau.js'), 'export function double(x) {\n  var resultat = x * 2;\n  const inutile = 42;\n  return resultat;\n}\n\nexport function vide() {}\n');
  g('add', '.'); g('commit', '-q', '-m', 'ajoute double');
  pilote = new Pilote({ racine: depot, env });
}, { timeout: LONG });

after(async () => {
  if (!ACTIVE) return;
  if (lot) { // filet de sécurité : la branche de travail ne doit pas survivre à la recette
    await api('/api/project_branches/delete', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ project: PROJET, branch: lot.branche }) }).catch(() => {});
  }
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
});

test('R1 : connexion réelle par en-tête Bearer, relevé de l\'instance (D1.INV-4, D1.INV-5)', { skip: sauter }, async () => {
  const c = await pilote.connexion('bearer');
  assert.match(String(c.version), /^\d{4}\.\d+/);
  assert.ok(c.login);
  edition = String(c.edition).toLowerCase();
  assert.ok(['developer', 'enterprise', 'datacenter'].includes(edition), `édition ${edition} : l'analyse de branches exige Developer ou supérieure`);
});

test('R2 : jeton en nom d\'utilisateur, accepté ou refusé proprement selon l\'instance (D1.INV-5)', { skip: sauter }, async (t) => {
  try {
    const c = await pilote.connexion('basic');
    assert.ok(c.login);
  } catch (e) {
    t.diagnostic(`mode refusé par l'instance : ${e.message}`);
    assert.equal(String(e.message).includes(JETON), false);
  }
  await pilote.connexion('bearer');
});

test('R3 : modes détectés, jeton absent de l\'état (D10.INV-2)', { skip: sauter }, async (t) => {
  const m = await pilote.modes();
  assert.equal(m.jetonPresent, true);
  assert.equal(JSON.stringify(m).includes(JETON), false);
  t.diagnostic(`serveur MCP hébergé : ${m.modes.find((x) => x.id === 'mcp-heberge').note}`);
});

test('R4 : périmètre, règles actives du profil réel, cache et export CSV (D9.INV-3, D9.INV-4)', { skip: sauter }, async () => {
  const p = await pilote.calculerPerimetre(brancheMain);
  assert.deepEqual(p.fichiers, ['src/nouveau.js']);
  const r1 = await pilote.regles(PROJET);
  assert.ok(r1.length >= 1 && r1.every((x) => x.regles.length > 0), 'au moins un profil avec des règles actives');
  const r2 = await pilote.regles(PROJET);
  assert.ok(r2.every((x) => x.depuisCache));
  const e = await pilote.exporterRegles(PROJET);
  assert.ok(e.total > e.actives && e.actives > 0, `export : ${e.total} règles, ${e.actives} actives`);
  assert.equal(e.contenu.includes(JETON), false);
}, { timeout: LONG });

test('R5 : analyse éphémère réelle, tests et couverture remontés, constats au périmètre, branche supprimée (D9.INV-1, D9.INV-2, D9.INV-7)', { skip: sauter, timeout: LONG }, async () => {
  if (!['developer', 'enterprise', 'datacenter'].includes(edition)) return;
  lot = await pilote.proposerEphemere({ projet: PROJET, type: 'personnalise', base: `${SCAN} -Dsonar.qualitygate.wait=true`, tests: TESTS });
  const r = await pilote.lancerEphemere(lot.id);
  const journal = JSON.stringify(pilote.journal) + JSON.stringify(r);
  assert.equal(journal.includes(JETON), false, 'jeton absent du rapport et du journal');
  assert.equal(r.tests.code, 0, r.tests.sortie);
  // quality gate en échec : le scanner sort avec un code non nul, mais l'analyse a bien eu lieu
  assert.ok(r.qualityGate, `quality gate lu ; limites : ${r.limites.join(' ; ')}`);
  assert.ok(r.constats.length >= 1, `au moins un constat sur src/nouveau.js ; hors périmètre : ${r.horsPerimetre}`);
  const attendues = ['javascript:S3504', 'javascript:S1481', 'javascript:S1186'].filter((k) => r.constats.some((c) => c.regle === k));
  assert.ok(attendues.length >= 1, `au moins une des règles de Sonar way visées ; trouvées : ${r.constats.map((c) => c.regle).join(', ')}`);
  assert.ok(r.constats.every((c) => c.moteur === 'analyse éphémère' && c.composant.endsWith(':src/nouveau.js')));
  assert.ok(r.mesures.coverage != null || r.mesures.new_coverage != null, 'couverture importée depuis lcov.info');
  assert.deepEqual([r.suppression.faite, r.suppression.verifiee], [true, true], r.suppression.detail);
  const liste = await api(`/api/project_branches/list?project=${encodeURIComponent(PROJET)}`);
  assert.equal(liste.corps.branches.some((b) => b.name === lot.branche), false);
  lot = null;
});
```
