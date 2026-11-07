---
name: recette
description: Recette du skill (lancement et bilan attendu par plateforme, tests T1 à T28 et leurs invariants, contre-épreuves où chaque défaut réintroduit est attrapé par son test, recette des repères contre le Gemini CLI réel sans réseau, installation comprise, intégration continue sous Linux et Windows avec Node 20, 24 et 26.13.0, texte complet de tests/instantane-hote.test.mjs). À lire avant de déclarer le skill installé ou de modifier son script.
dimensions: [D1, D2, D3, D4, D5, D8]
status: active
---

# Module `recette` (D1, D2, D3, D4, D5, D8)

Phase 7E couverte : Évolutif.

## 1. Lancer la recette

Depuis le dossier du skill, après l'extraction du module `execution`, § 8 :

```bash
node --test tests/instantane-hote.test.mjs
```

Attendu : 28 tests réussis sous Linux et WSL2 ; 27 réussis et 1 sauté (T9, qui lit les processus parents dans `/proc`) sous Windows et macOS ; Node 20 ou plus récent, vérifié sous Node 20, 22, 24 et 26.13.0. Chaque test bâtit son propre monde dans un dossier temporaire, puis le supprime : un accueil, un dossier système, un faux paquet de Gemini CLI avec sa documentation, et un dépôt dont la racine est un sous-dossier. Le monde contient quinze secrets témoins, dans les réglages, les serveurs MCP, un hook, un `.env`, une extension, une session, un fichier de contexte et la mémoire privée : aucun ne doit ressortir.

La recette ne lance jamais Gemini CLI et n'a besoin d'aucun réseau. Lancée par Gemini CLI lui-même, elle donne le même bilan : les appels faits en processus ignorent les processus parents, et T9 désigne son propre faux hôte.

## 2. Tests et invariants

| ID | Ce qui est vérifié | Invariants |
|---|---|---|
| T1 | aide, version, commande inconnue ou réservée, options invalides : codes et JSON | D1.INV-2 |
| T2 | chaque commande rend un objet daté, versionné, au schéma 1, sur une ligne | D1.INV-2 |
| T3 | aucune commande, aucun format ne change le moindre fichier du monde | D1.INV-1 |
| T4 | le texte du script n'importe ni processus ni réseau, n'appelle aucune fonction d'écriture, n'ouvre qu'en lecture, ne nomme aucun fichier de jetons | D1.INV-1 |
| T5 | listes bornées par `--max` et signalées, document borné par `--max-caracteres` | D1.INV-3 |
| T6 | paquet désigné par `--paquet` : version, documentation, skills intégrés ; dossier invalide signalé | D2.INV-1, D2.INV-2 |
| T7 | `GEMINI_CLI=1` : certitude observée | D2.INV-1 |
| T8 | paquet trouvé par le PATH (lien, cale npm sous Windows, script d'enveloppe) : déduit, jamais observé | D2.INV-1 |
| T9 | Linux : processus parent observé, options rendues, prompt masqué | D2.INV-1, D8.INV-2 |
| T10 | hôte non reconnu : candidats déduits, `applicable : false`, aucune configuration prêtée | D2.INV-3 |
| T11 | couches dans l'ordre de l'hôte, valeur effective et sa couche, réglage hors liste jamais rendu | D3.INV-1 |
| T12 | JSON avec commentaires ; JSON cassé signalé par sa ligne, sans le moindre extrait | D3.INV-2, D8.INV-1 |
| T13 | confiance : fichier, règle la plus longue, `TRUST_PARENT`, variables, réglage, fichier déplacé | D3.INV-3 |
| T14 | dossier non fiable : réglages, commandes, serveurs MCP, skills et contexte du projet écartés, avec leur raison | D3.INV-3, D4.INV-2, D5.INV-1 |
| T15 | `.env` : `.gemini/.env` d'abord, remontée, noms seulement pour les secrets | D3.INV-4, D8.INV-1 |
| T16 | variables : présence pour les secrets, valeur pour les autres, surcharges, retrait de variables annoncé | D3.INV-4, D8.INV-1 |
| T17 | skills : paliers, alias, masquage, désactivation, écarts d'en-tête | D4.INV-1 |
| T18 | sous-agents et commandes : en-têtes, noms invalides, désactivation, espaces de noms, masquage | D4.INV-1 |
| T19 | extensions, serveurs MCP, hooks, politiques, fichiers d'exclusion, sans aucune valeur secrète | D4.INV-1, D8.INV-1 |
| T20 | fichiers de contexte : global, projet jusqu'au dépôt dans l'ordre trié, imports hors blocs de code, à la demande, extensions | D5.INV-1, D5.INV-2 |
| T21 | noms de fichiers réglés, liste de marqueurs vide | D5.INV-1 |
| T22 | mémoire privée par le registre ; trace de la dernière session : chemins et balises, jamais le texte | D5.INV-3, D8.INV-2 |
| T23 | prompt système exporté : titres hors blocs de code, skills, sous-agents, mémoires, balises ; fichier absent : code 2 | D5.INV-4 |
| T24 | `doc` : liste, document, chemins refusés (code 3) ou introuvables (code 2), paquet absent | D2.INV-2, D1.INV-2 |
| T25 | aucun secret témoin ne sort, quelle que soit la commande et le format | D8.INV-1, D8.INV-2 |
| T26 | masquage par motifs ; arguments qui suivent une option sensible ; options de lancement | D8.INV-1 |
| T27 | clés de chemin comme l'hôte, selon la plateforme ; lecture des en-têtes YAML | D3.INV-3, D4.INV-1 |
| T28 | racine égale à l'accueil : la couche du workspace n'est pas comptée deux fois | D3.INV-1 |

D6, D7 et D9 portent sur la conduite de l'agent : ils se vérifient par les scénarios A1 à A12 du module `agent` et, pour les repères, par la recette du § 4. D12, la diffusion autonome, se vérifie par la recette des repères, qui installe le skill comme le dit le mode d'emploi, et par l'intégration continue, qui lance ses commandes sous Linux et sous Windows (§ 5).

## 3. Contre-épreuves

Chaque défaut ci-dessous a été réintroduit, un à la fois, dans une copie du script : la recette a échoué, et par le test indiqué. Un défaut que la recette laisserait passer serait un trou de la recette, à combler avant toute version.

| Défaut réintroduit | Tests en échec |
|---|---|
| la seconde passe de masquage est retirée | T24, T25 |
| les valeurs des variables d'un serveur MCP sont rendues | T19, T25 |
| les valeurs des en-têtes d'un serveur MCP sont rendues | T19 |
| le message du moteur JSON est repris | T12 |
| la couche du workspace reste prise en compte sans confiance | T14 |
| la première règle de confiance l'emporte, pas la plus longue | T13 |
| TRUST_PARENT vaut pour le dossier lui-même | T13 |
| le texte du message d'ouverture de session est rendu | T20, T22, T25 |
| l'alias .agents/skills perd contre .gemini/skills | T17 |
| le chemin d'un document n'est plus contrôlé | T24 |
| le script écrit un cache | T3, T4 |
| le texte d'un prompt de lancement est rendu | T9, T26 |
| --max n'est plus appliqué | T5 |
| un paquet trouvé par le PATH est donné pour observé | T8 |
| une configuration est prêtée à un hôte non reconnu | T10 |
| les imports d'un bloc de code sont comptés | T20 |
| les fichiers du projet ne sont plus triés | T20 |
| la valeur d'une variable secrète d'un .env est rendue | T12, T15, T16, T25 |
| le contenu brut d'une couche de réglages est rendu | T12, T16, T25 |
| le dossier de la racine d'accueil compte deux fois | T28 |
| le nettoyage des sessions n'est plus observé | T11 |
| les réglages de mise à jour ne sont plus observés | T11 |
| les variables qui forcent le mode non interactif ne sont plus observées | T16 |

## 4. Recette des repères

Les repères du module `modele-hote` sont confrontés au Gemini CLI réel par les mainteneurs du skill, hors du skill : par le script `.github/scripts/reperes-hote.mjs` du dépôt où il est maintenu, le dépôt Agent2Prompt, à côté du paquet `@google/gemini-cli` installé à la version épinglée. Cette recette n'est nécessaire ni pour installer le skill, ni pour s'en servir (D12.INV-5). Dans un accueil isolé, elle installe le skill comme le dit son mode d'emploi : `gemini skills install` depuis le dossier, au niveau utilisateur, puis la commande d'extraction et celle du sous-agent et des commandes, prises dans `MODE-EMPLOI.md`. Elle essaie aussi un fichier `.skill`, fait par la commande du mode d'emploi, installé au niveau du projet puis retiré. Elle lance ensuite cinq sessions de Gemini CLI avec une clé factice, contre une fausse API locale qui garde chaque requête et répond « clé invalide » : deux non interactives, A avec les réglages par défaut et B avec les réglages de retrait des statistiques d'usage et de la mise à jour ; deux interactives sous un terminal, C avec les réglages de retrait et D avec les réglages par défaut ; enfin E, deux lancements sous un terminal, sans puis avec `CI=true`. Les variables `CI` et `GITHUB_ACTIONS`, que pose l'intégration continue, sont retirées de l'environnement de l'hôte, sauf pour le second lancement de E : les sessions observent ainsi le poste d'un développeur. L'hôte compose chaque session, exporte son prompt système et enregistre sa transcription, puis échoue à joindre l'API. Toute autre sortie passe par un proxy témoin local, qui note l'hôte visé et refuse la connexion : aucun appel ne quitte le poste. L'hôte reçoit `NODE_USE_ENV_PROXY=1` : sous Node 26, sans elle, une partie de ses sorties ignorerait le proxy témoin et partirait en direct (repère H1). À la fin, la commande de retrait du mode d'emploi et `gemini skills uninstall` retirent ce que l'installation a écrit. En intégration continue, le travail des repères relève en plus chaque connexion ouverte (`strace`), et échoue si l'une vise une autre adresse que la boucle locale. Elle vérifie :

- D12 : `gemini skills install` installe le skill depuis son dossier, au niveau utilisateur, `MODE-EMPLOI.md` compris ; Gemini CLI n'y découvre qu'un skill, les modules ne sont pas pris pour des skills ;
- D12 : la commande d'extraction du mode d'emploi est celle du module `execution`, § 8 ; lancée dans le dossier installé, elle écrit les six fichiers, tous conformes ;
- D12 : la commande du mode d'emploi, celle du module `diffusion`, § 4, copie le sous-agent, chemin du dossier installé substitué, et les trois commandes dans l'accueil de l'hôte ;
- D12 : un fichier `.skill`, fait par la commande du mode d'emploi, s'installe au niveau du projet ; `gemini skills uninstall --scope workspace` le retire, sans toucher au niveau utilisateur ;
- H13 : une commande `/hote:carte` est développée par l'hôte, `{{args}}` compris, avant l'envoi ;
- H17 : en mode non interactif, les outils de lecture et `invoke_agent` sont déclarés, mais ni `activate_skill`, ni `run_shell_command`, ni `write_file` ;
- H15 : un appel interne, sur un autre modèle, précède la requête principale ;
- H1 : avec les réglages par défaut, l'hôte cherche à envoyer ses statistiques d'usage à `play.googleapis.com`, même en mode non interactif, et, en mode interactif, une mise à jour sur `registry.npmjs.org` ; avec `privacy.usageStatisticsEnabled`, `general.enableAutoUpdate` et `general.enableAutoUpdateNotification` à `false`, il ne demande aucune sortie, en mode non interactif comme interactif ;
- H4 : le prompt exporté par `GEMINI_WRITE_SYSTEM_MD` est exactement le texte des instructions système envoyées ;
- H11 : le skill figure dans `<available_skills>`, par son nom et l'emplacement de son `SKILL.md` ;
- H12 : le sous-agent `explicateur-hote` figure parmi les sous-agents, appelés par `invoke_agent` ;
- H3 : la mémoire globale (`<global_context>`) et l'index privé du projet (`<user_project_memory>`) sont dans les instructions système, le `GEMINI.md` du projet n'y est pas ; le premier message porte `<session_context>`, `<project_context>`, les dossiers du workspace et l'arborescence ;
- module `contexte`, § 6 : en mode interactif, le prompt est exporté au démarrage, avant toute saisie ;
- H14 : au lancement de la session interactive, la session précédente, sans tour abouti, a été supprimée par le nettoyage des sessions, malgré son âge de quelques secondes ;
- H6 : en mode interactif, sous un terminal, `activate_skill`, `run_shell_command`, `write_file`, `replace`, `ask_user` et `invoke_agent` sont déclarés ;
- H17 : sous un terminal, sans prompt, l'interface interactive s'ouvre ; avec `CI=true`, l'hôte passe en mode non interactif et s'arrête faute d'entrée ;
- le script, sur ces mêmes traces : trace de la seconde session non interactive, lue avant le lancement suivant qui la supprime ; skill et sous-agent retrouvés dans le prompt exporté ; mémoire privée localisée ; réglages de retrait observés avec leur couche ; version, documentation et skills intégrés du paquet ; présence dans la documentation embarquée de chaque document cité par les modules ; commandes `/hote:*` et sous-agent vus sans écart d'en-tête ;
- D12 : à la fin, la commande de retrait du mode d'emploi, celle du module `diffusion`, § 5, supprime le sous-agent et les commandes, et `gemini skills uninstall` le skill : rien ne reste.

Une nouvelle version de Gemini CLI se confronte en changeant la version épinglée : un constat qui ne tient plus désigne le repère à réviser (D9.INV-1).

## 5. Intégration continue

Le workflow `.github/workflows/recette-explication-hote-ia.yml`, dans le même dépôt, suit le chemin de l'IA du développeur : il matérialise la transmission courante, extrait les six fichiers par la commande du module `execution`, § 8, sous bash et sous CMD, puis lance la recette, sur `ubuntu-latest` et `windows-latest`, avec Node 20, version minimale, Node 24 et Node 26.13.0, celle du poste de la mission. Il lance aussi, sous bash et sous CMD, les commandes du mode d'emploi qui installent puis retirent le sous-agent et les commandes, dans un accueil temporaire (`GEMINI_CLI_HOME`), et vérifie leur effet. Un second travail, sous Linux et Node 26.13.0, lance la recette des repères. Il tourne à chaque pull request et à chaque push sur `main` qui touchent la spécification, sa transmission, l'outil d'assemblage, l'installateur, le script des repères ou le workflow.

## 6. Recette `tests/instantane-hote.test.mjs`

<!-- fichier : tests/instantane-hote.test.mjs -->
```js
// Recette de explication-hote-ia 1.1.0 : node --test tests/instantane-hote.test.mjs
// Node 20 ou plus récent, modules natifs. Chaque test bâtit son propre monde dans un dossier temporaire :
// un accueil, un dossier système, un faux paquet de Gemini CLI et un dépôt, puis interroge le script,
// importé ou lancé comme le ferait l'agent. Le monde contient des secrets témoins qui ne doivent jamais
// ressortir (D8.INV-1, D8.INV-2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
const SCRIPT = resolve(ICI, '..', 'scripts', 'instantane-hote.mjs');
const M = await import(pathToFileURL(SCRIPT).href);
const WINDOWS = process.platform === 'win32';
const CLOTURE = String.fromCharCode(96).repeat(3);
const CLE_GOOGLE = 'AIzaSyA0123456789abcdefghijklmnopqrstuv';
const SECRETS = [
  'valeur-privee-env-7731', 'jeton-entete-4412abcd', 'cle-argument-9981', 'jeton-option-5530', 'motdepasse-6620',
  'jeton-hook-2207abcd', CLE_GOOGLE, 'secret-env-3390', 'jeton-source-1188', 'secret-conversation-5512',
  'contenu-memoire-privee-4471', 'secret-json-casse-8823', 'consigne-confidentielle-6604', 'secret-prompt-4410',
  'ghp_abcdefghijklmnopqrstuvwxyz0123456789',
];

function ecrire(chemin, contenu) {
  mkdirSync(dirname(chemin), { recursive: true });
  writeFileSync(chemin, contenu);
}
const skill = (nom, description) => `---\nname: ${nom}\ndescription: ${description}\n---\n# ${nom}\n`;
const ligne = (o) => `${JSON.stringify(o)}\n`;

const RELAIS = [
  "const { spawnSync } = require('node:child_process');",
  "const r = spawnSync(process.execPath, [process.env.SCRIPT_HOTE, 'hote'], { encoding: 'utf8', env: { ...process.env, GEMINI_CLI: '1' } });",
  "process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || ''); process.exitCode = r.status === null ? 1 : r.status;",
  '',
].join('\n');

/** Un monde complet ; `reglage` ajuste la confiance, le PATH, l'environnement. */
function monde(reglage = {}) {
  const base = mkdtempSync(join(tmpdir(), 'hote-'));
  const accueil = join(base, 'accueil');
  const g = join(accueil, '.gemini');
  const systeme = join(base, 'systeme');
  const paquet = join(base, 'paquet', 'node_modules', '@google', 'gemini-cli');
  const depot = join(base, 'depot');
  const racine = join(depot, 'app');

  ecrire(join(paquet, 'package.json'), JSON.stringify({ name: '@google/gemini-cli', version: '0.67.0' }));
  ecrire(join(paquet, 'bundle', 'gemini.js'), RELAIS);
  ecrire(join(paquet, 'bundle', 'docs', 'index.md'), '# Documentation\n');
  ecrire(join(paquet, 'bundle', 'docs', 'cli', 'gemini-md.md'), `# GEMINI.md\nContexte hiérarchique.\nexport GEMINI_API_KEY=${CLE_GOOGLE}\n`);
  ecrire(join(paquet, 'bundle', 'builtin', 'skill-creator', 'SKILL.md'), skill('skill-creator', 'Créer des skills.'));

  ecrire(join(systeme, 'system-defaults.json'), JSON.stringify({ model: { name: 'modele-defauts' }, context: { includeDirectoryTree: true } }));
  ecrire(join(systeme, 'policies', 'admin.toml'), '[[rule]]\ntoolName = "run_shell_command"\ncommandPrefix = "rm -rf"\ndecision = "deny"\npriority = 900\n');

  ecrire(join(g, 'settings.json'), [
    '{',
    '  // réglages de l\'utilisateur',
    '  "model": { "name": "modele-utilisateur" },',
    `  "security": { "auth": { "selectedType": "gemini-api-key", "apiKey": "${CLE_GOOGLE}" } },`,
    '  /* serveurs MCP */',
    '  "mcpServers": {',
    '    "base": { "command": "/usr/local/bin/serveur-base", "args": ["--api-key", "cle-argument-9981", "--token=jeton-option-5530", "postgresql://alice:motdepasse-6620@db/app"], "env": { "MON_JETON": "valeur-privee-env-7731" }, "trust": true }',
    '  },',
    '  "hooks": { "BeforeTool": [{ "matcher": "run_shell_command", "hooks": [{ "name": "journal", "type": "command", "command": "curl -H \'Authorization: Bearer jeton-hook-2207abcd\' https://journal.example.invalid" }] }] },',
    '  "skills": { "disabled": ["beta"] },',
    '  "agents": { "overrides": { "relecteur": { "enabled": false } } },',
    '  "mcp": { "excluded": ["exclu"] },',
    '  "experimental": { "autoMemory": true, "jeton": "ghp_abcdefghijklmnopqrstuvwxyz0123456789" },',
    '  "adresse": "https://exemple.invalid//chemin"',
    '}',
  ].join('\n'));
  ecrire(join(g, 'GEMINI.md'), 'Préférences globales.\n');
  ecrire(join(g, 'skills', 'alpha', 'SKILL.md'), skill('alpha', 'Alpha utilisateur.'));
  ecrire(join(accueil, '.agents', 'skills', 'alpha', 'SKILL.md'), skill('alpha', 'Alpha utilisateur, alias.'));
  ecrire(join(g, 'skills', 'mal-nomme', 'SKILL.md'), skill('autre-nom', 'Dossier et nom différents.'));
  ecrire(join(g, 'skills', 'sans-entete', 'SKILL.md'), '# Sans en-tête\n');
  ecrire(join(g, 'agents', 'relecteur.md'), '---\nname: relecteur\ndescription: >\n  Relit le code\n  sans le modifier.\ntools:\n  - read_file\n  - grep_search\nmodel: modele-x\n---\nCorps.\n');
  ecrire(join(g, 'commands', 'hote', 'explique.toml'), 'description = "Explique (utilisateur)"\nprompt = """{{args}}"""\n');
  ecrire(join(g, 'commands', 'outil.toml'), "description = 'Outil'\nprompt = \"x\"\n");
  ecrire(join(g, 'policies', 'regles.toml'), '[[rule]]\ntoolName = ["read_file", "glob"]\ndecision = "allow"\npriority = 100\nmodes = ["plan", "default"]\n\n[[rule]]\ntoolName = "write_file"\ndecision = "ask_user"\npriority = 100\nsubagent = "relecteur"\n');
  ecrire(join(g, 'policies', 'auto-saved.toml'), '[[rule]]\ntoolName = "run_shell_command"\ncommandPrefix = "npm test"\ndecision = "allow"\npriority = 100\n');
  const ext = join(g, 'extensions', 'ext-a');
  ecrire(join(ext, 'gemini-extension.json'), JSON.stringify({
    name: 'ext-a', version: '1.2.3', description: 'Extension témoin', contextFileName: 'CONTEXTE.md',
    mcpServers: { distant: { httpUrl: 'https://mcp.example.invalid/mcp?token=jeton-source-1188' } },
    excludeTools: ['run_shell_command(rm -rf)'],
  }));
  ecrire(join(ext, 'CONTEXTE.md'), 'Contexte de l\'extension.\n');
  ecrire(join(ext, 'skills', 'beta', 'SKILL.md'), skill('beta', 'Beta d\'extension.'));
  ecrire(join(ext, 'agents', 'aide.md'), '---\nname: aide\ndescription: Aide d\'extension.\nkind: local\n---\n');
  ecrire(join(ext, 'commands', 'deployer.toml'), 'description = "Déployer"\nprompt = "x"\n');
  ecrire(join(ext, '.gemini-extension-install.json'), JSON.stringify({ source: 'https://bob:jeton-source-1188@example.invalid/ext.git', type: 'git' }));

  ecrire(join(depot, '.git', 'HEAD'), 'ref: refs/heads/main\n');
  ecrire(join(depot, '.git', 'info', 'exclude'), '/.skills/\n');
  ecrire(join(depot, 'GEMINI.md'), `Consigne consigne-confidentielle-6604.\n@./docs/regles.md\n@./absent.md\n${CLOTURE}\n@./dans-bloc.md\n${CLOTURE}\n`);
  ecrire(join(depot, 'docs', 'regles.md'), 'Règles.\n');
  ecrire(join(racine, 'GEMINI.md'), 'Consigne de l\'application.\n');
  ecrire(join(racine, 'src', 'api', 'GEMINI.md'), 'Consigne de l\'API.\n');
  ecrire(join(racine, 'node_modules', 'lib', 'GEMINI.md'), 'Ignoré.\n');
  ecrire(join(racine, '.geminiignore'), 'secret/\n');
  ecrire(join(racine, '.gemini', 'settings.json'), JSON.stringify({
    model: { name: 'modele-workspace' },
    mcpServers: { local: { httpUrl: 'http://127.0.0.1:7000/mcp', headers: { Authorization: 'Bearer jeton-entete-4412abcd' } }, exclu: { command: 'x' } },
  }));
  ecrire(join(racine, '.gemini', 'skills', 'alpha', 'SKILL.md'), skill('alpha', 'Alpha du workspace.'));
  ecrire(join(racine, '.gemini', 'agents', 'mauvais.md'), '---\nname: Mauvais Nom\ndescription: Nom invalide.\n---\n');
  ecrire(join(racine, '.gemini', 'commands', 'hote', 'explique.toml'), 'description = "Explique (workspace)"\nprompt = "x"\n');
  ecrire(join(racine, '.gemini', '.env'), `GEMINI_SYSTEM_MD=1\nGEMINI_API_KEY=${CLE_GOOGLE}\nMON_SECRET=secret-env-3390\n`);

  const id = 'app';
  ecrire(join(g, 'projects.json'), JSON.stringify({ projects: { [M.cleRegistre(racine)]: id } }));
  ecrire(join(g, 'tmp', id, 'memory', 'MEMORY.md'), 'Index contenu-memoire-privee-4471.\n');
  const chats = join(g, 'tmp', id, 'chats');
  const ouverture = (dossiers, fichiers) => [
    '<session_context>',
    'This is the Gemini CLI. We are setting up the context for our chat.',
    '- **Workspace Directories:**',
    ...dossiers.map((d) => `  - ${d}`),
    '- **Directory Structure:**',
    '',
    '<loaded_context>',
    '<project_context>',
    ...fichiers.flatMap((f) => [`--- Context from: ${f} ---`, 'Consigne consigne-confidentielle-6604.', `--- End of Context from: ${f} ---`]),
    '</project_context>',
    '</loaded_context>',
    '</session_context>',
  ].join('\n');
  ecrire(join(chats, 'session-ancienne.jsonl'), ligne({ sessionId: 'a', startTime: '2026-11-01T08:00:00.000Z', kind: 'main' }) + ligne({ type: 'user', content: [{ text: ouverture([join(base, 'ancien')], [join(base, 'ancien', 'GEMINI.md')]) }] }));
  const ancienne = new Date('2026-11-01T08:00:00Z');
  utimesSync(join(chats, 'session-ancienne.jsonl'), ancienne, ancienne);
  ecrire(join(chats, 'session-recente.jsonl'),
    ligne({ sessionId: 'b', startTime: '2026-11-06T08:00:00.000Z', kind: 'main' })
    + ligne({ type: 'user', content: [{ text: ouverture([racine], [join(depot, 'GEMINI.md'), join(racine, 'GEMINI.md')]) }] })
    + ligne({ type: 'user', content: [{ text: 'voici secret-conversation-5512' }] }));

  if (reglage.confiance !== null) ecrire(join(g, 'trustedFolders.json'), JSON.stringify({ [depot]: reglage.confiance ?? 'TRUST_FOLDER' }));
  const env = { PATH: reglage.PATH ?? '', HOME: accueil, USERPROFILE: accueil, GEMINI_CLI_HOME: accueil, ...reglage.env };
  return { base, accueil, g, systeme, paquet, depot, racine, ext, env, nettoyer: () => rmSync(base, { recursive: true, force: true }) };
}

/** Appel en processus : options du monde, sans remonter les processus parents. */
function appeler(w, commande, options = {}, positionnels = []) {
  return M.executer(commande, { env: w.env, racine: w.racine, dossierSysteme: w.systeme, paquet: w.paquet, ancetres: false, ...options }, positionnels);
}

/** Appel en ligne de commande, comme l'agent ; l'environnement du test n'y entre pas. */
function lancer(w, args, envEnPlus = {}, cwd = w.racine) {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) if (!/^(GEMINI|GOOGLE|SANDBOX|PATH$)/i.test(k)) env[k] = v;
  Object.assign(env, w.env, envEnPlus);
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd, env, encoding: 'utf8' });
  return { code: r.status, sortie: r.stdout, erreur: r.stderr, json: () => JSON.parse(r.stdout) };
}

function sansSecret(texte, contexte) {
  for (const s of SECRETS) assert.ok(!texte.includes(s), `${contexte} : le secret témoin « ${s} » est sorti`);
}

function photographier(dossier) {
  const carte = new Map();
  const pile = [dossier];
  while (pile.length > 0) {
    const d = pile.pop();
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const c = join(d, e.name);
      if (e.isDirectory()) {
        carte.set(c, 'dossier');
        pile.push(c);
      } else {
        const s = statSync(c);
        carte.set(c, `${s.size}:${s.mtimeMs}:${createHash('sha256').update(readFileSync(c)).digest('hex')}`);
      }
    }
  }
  return carte;
}

// --- D1 : exécution -----------------------------------------------------------------------------

test('T1 aide, version, commande inconnue ou réservée, options invalides : codes et JSON documentés (D1.INV-2)', () => {
  const w = monde();
  try {
    const aide = lancer(w, ['--help']);
    assert.equal(aide.code, 0);
    assert.match(aide.sortie, /Codes de sortie/);
    assert.deepEqual(lancer(w, ['--version']).json(), { ok: true, version: M.VERSION, schema: M.SCHEMA });
    const inconnue = lancer(w, ['inventer']);
    assert.equal(inconnue.code, 1);
    assert.equal(inconnue.sortie, '');
    assert.equal(JSON.parse(inconnue.erreur).ok, false);
    const reservee = lancer(w, ['comparer']);
    assert.equal(reservee.code, 1);
    assert.match(JSON.parse(reservee.erreur).erreur, /réservée.*E2/);
    assert.equal(lancer(w, ['hote', '--format', 'yaml']).code, 1);
    assert.equal(lancer(w, ['hote', '--max', '0']).code, 1);
    assert.equal(lancer(w, ['hote', '--option-inconnue']).code, 1);
    const texte = lancer(w, ['config', '--format', 'texte', '--paquet', w.paquet, '--dossier-systeme', w.systeme]);
    assert.equal(texte.code, 0);
    assert.match(texte.sortie, /^# Instantané de l'hôte : config/);
  } finally {
    w.nettoyer();
  }
});

test('T2 chaque commande rend un objet daté, versionné, au schéma déclaré (D1.INV-2, E2)', () => {
  const w = monde();
  try {
    for (const commande of ['hote', 'config', 'contexte', 'composants', 'tout']) {
      const r = lancer(w, [commande, '--paquet', w.paquet, '--dossier-systeme', w.systeme]);
      assert.equal(r.code, 0, `${commande} : ${r.erreur}`);
      const o = r.json();
      assert.equal(o.ok, true);
      assert.equal(o.commande, commande);
      assert.equal(o.version, M.VERSION);
      assert.equal(o.schema, 1);
      assert.match(o.date, /^\d{4}-\d{2}-\d{2}T/);
      assert.equal(r.sortie.trim().split('\n').length, 1, 'une ligne JSON');
    }
  } finally {
    w.nettoyer();
  }
});

test('T3 lecture seule : aucune commande ne crée, ne modifie ni ne supprime de fichier (D1.INV-1)', () => {
  const w = monde();
  try {
    const avant = photographier(w.base);
    for (const args of [['hote'], ['config'], ['contexte'], ['composants'], ['tout'], ['doc'], ['doc', 'cli/gemini-md.md'], ['tout', '--format', 'texte']]) {
      const r = lancer(w, [...args, '--paquet', w.paquet, '--dossier-systeme', w.systeme]);
      assert.equal(r.code, 0, `${args.join(' ')} : ${r.erreur}`);
    }
    assert.deepEqual(photographier(w.base), avant);
  } finally {
    w.nettoyer();
  }
});

test('T4 le script n\'importe ni processus, ni réseau, ni aucune fonction d\'écriture (D1.INV-1)', () => {
  const source = readFileSync(SCRIPT, 'utf8');
  assert.doesNotMatch(source, /from 'node:(child_process|net|http|https|http2|dgram|tls|dns|worker_threads|cluster)'/);
  assert.doesNotMatch(source, /\b(writeFile|appendFile|mkdir|rmSync|rmdir|unlink|rename|copyFile|cpSync|symlink|chmod|chown|truncate|createWriteStream|utimes)\w*\s*\(/);
  assert.doesNotMatch(source, /\bfetch\s*\(|WebSocket|XMLHttpRequest/);
  for (const m of source.matchAll(/openSync\(([^)]*)\)/g)) assert.match(m[1], /'r'/, 'ouverture en lecture seule');
  assert.doesNotMatch(source, /oauth_creds|google_accounts|mcp-oauth-tokens|a2a-oauth-tokens/, 'aucun fichier de jetons de l\'hôte');
});

test('T5 sorties bornées : une liste plus longue que --max est tronquée et signalée (D1.INV-3)', () => {
  const w = monde();
  try {
    for (let i = 0; i < 12; i++) ecrire(join(w.g, 'skills', `masse-${String(i).padStart(2, '0')}`, 'SKILL.md'), skill(`masse-${String(i).padStart(2, '0')}`, 'Masse.'));
    const o = appeler(w, 'composants', { max: 5 });
    assert.equal(o.composants.skills.length, 5);
    assert.ok(o.troncatures.some((t) => /^composants\.skills : \d+ éléments, 5 rendus$/.test(t)));
    const doc = appeler(w, 'doc', { maxCaracteres: 10 }, ['cli/gemini-md.md']).doc;
    assert.equal(doc.texte.length, 10);
    assert.equal(doc.tronque, true);
  } finally {
    w.nettoyer();
  }
});

// --- D2 : l'hôte -----------------------------------------------------------------------------------

test('T6 hôte désigné par --paquet : version, documentation et skills intégrés lus dans le paquet (D2.INV-1, D2.INV-2)', () => {
  const w = monde();
  try {
    const h = appeler(w, 'hote').hote;
    assert.equal(h.famille, 'gemini-cli');
    assert.equal(h.certitude, 'déclarée');
    assert.equal(h.paquet.version, '0.67.0');
    assert.equal(h.paquet.nature, 'déclaré');
    assert.equal(h.paquet.documentation.fichiers, 2);
    assert.deepEqual(h.paquet.skills_integres, ['skill-creator']);
    const invalide = appeler(w, 'hote', { paquet: w.base }).hote;
    assert.equal(invalide.paquet, null);
    assert.ok(invalide.avertissements.some((a) => a.startsWith('paquet_invalide')));
  } finally {
    w.nettoyer();
  }
});

test('T7 hôte observé : GEMINI_CLI=1 posé par l\'hôte rend la certitude « observée » (D2.INV-1)', () => {
  const w = monde({ env: { GEMINI_CLI: '1' } });
  try {
    const h = appeler(w, 'hote').hote;
    assert.equal(h.lance_par_l_hote, true);
    assert.equal(h.certitude, 'observée');
    assert.ok(h.indices.some((i) => i.nature === 'observé' && /GEMINI_CLI=1/.test(i.moyen)));
  } finally {
    w.nettoyer();
  }
});

test('T8 paquet trouvé par le PATH : nature « déduit », jamais présentée comme observée (D2.INV-1)', () => {
  const w = monde();
  try {
    const bin = join(w.base, 'bin');
    mkdirSync(bin, { recursive: true });
    if (WINDOWS) {
      ecrire(join(bin, 'gemini.cmd'), '@ECHO off\r\nnode "%dp0%\\node_modules\\@google\\gemini-cli\\bundle\\gemini.js" %*\r\n');
      ecrire(join(bin, 'node_modules', '@google', 'gemini-cli', 'package.json'), JSON.stringify({ name: '@google/gemini-cli', version: '0.67.1' }));
    } else {
      symlinkSync(join(w.paquet, 'bundle', 'gemini.js'), join(bin, 'gemini'));
    }
    const h = appeler({ ...w, env: { ...w.env, PATH: bin } }, 'hote', { paquet: undefined }).hote;
    assert.equal(h.paquet.nature, 'déduit');
    assert.equal(h.certitude, 'déduite');
    assert.equal(h.paquet.version, WINDOWS ? '0.67.1' : '0.67.0');
    if (!WINDOWS) {
      const enveloppe = join(w.base, 'bin2');
      ecrire(join(enveloppe, 'gemini'), `#!/bin/sh\nexec node "${join(w.paquet, 'bundle', 'gemini.js')}" "$@"\n`);
      const h2 = appeler({ ...w, env: { ...w.env, PATH: enveloppe } }, 'hote', { paquet: undefined }).hote;
      assert.equal(h2.paquet?.version, '0.67.0', 'script d\'enveloppe lu');
    }
  } finally {
    w.nettoyer();
  }
});

test('T9 Linux : le processus parent de l\'hôte est observé, ses options rendues, son prompt masqué (D2.INV-1, D8.INV-2)', { skip: process.platform !== 'linux' && 'les processus parents se lisent dans /proc' }, () => {
  const w = monde();
  try {
    const env = {};
    for (const [k, v] of Object.entries(process.env)) if (!/^(GEMINI|GOOGLE|SANDBOX)/.test(k)) env[k] = v;
    Object.assign(env, w.env, { SCRIPT_HOTE: SCRIPT, PATH: process.env.PATH });
    const r = spawnSync(process.execPath, [join(w.paquet, 'bundle', 'gemini.js'), '--approval-mode=yolo', '-m', 'modele-y', '-p', 'texte secret-prompt-4410', '--skip-trust'], { cwd: w.racine, env, encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const h = JSON.parse(r.stdout).hote;
    assert.equal(h.certitude, 'observée');
    assert.equal(h.paquet.nature, 'observé');
    assert.equal(h.paquet.racine, w.paquet);
    assert.deepEqual(h.arguments_de_lancement, ['--approval-mode yolo', '-m modele-y', `-p [texte masqué, ${'texte secret-prompt-4410'.length} caractères]`, '--skip-trust']);
    sansSecret(r.stdout, 'processus parent');
  } finally {
    w.nettoyer();
  }
});

test('T10 hôte non reconnu : description générique, sans configuration inventée (D2.INV-3)', () => {
  const base = mkdtempSync(join(tmpdir(), 'hote-nu-'));
  try {
    const accueil = join(base, 'accueil');
    const racine = join(base, 'projet');
    ecrire(join(racine, '.outil-x', 'skills', 'un', 'SKILL.md'), skill('un', 'Un.'));
    ecrire(join(racine, '.outil-x', 'settings.json'), '{}');
    ecrire(join(racine, 'CONSIGNES.md'), 'Consignes.\n');
    ecrire(join(racine, 'README.md'), 'Lisez-moi.\n');
    mkdirSync(accueil, { recursive: true });
    const env = { PATH: '', HOME: accueil, USERPROFILE: accueil };
    const o = M.executer('hote', { env, racine, dossierSysteme: join(base, 'systeme'), ancetres: false });
    assert.equal(o.hote.famille, 'inconnue');
    assert.equal(o.hote.certitude, 'aucune');
    assert.deepEqual(o.hote.generique.dossiers_de_configuration, [{ dossier: join(racine, '.outil-x'), indices: ['skills', 'settings.json'] }]);
    assert.deepEqual(o.hote.generique.fichiers_de_consignes, [join(racine, 'CONSIGNES.md')]);
    const c = M.executer('config', { env, racine, dossierSysteme: join(base, 'systeme'), ancetres: false });
    assert.equal(c.applicable, false);
    assert.equal(c.config, undefined);
    assert.equal(c.generique.nature, 'déduit');
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

// --- D3 : configuration -------------------------------------------------------------------------

test('T11 couches de réglages : chaque valeur effective porte sa couche, dans l\'ordre de l\'hôte (D3.INV-1)', () => {
  const w = monde();
  try {
    let c = appeler(w, 'config').config;
    assert.deepEqual(c.couches.map((x) => x.portee), ['défauts système', 'utilisateur', 'workspace', 'système']);
    assert.deepEqual(c.effectifs['model.name'], { valeur: 'modele-workspace', source: 'workspace' });
    assert.deepEqual(c.effectifs['context.includeDirectoryTree'], { valeur: true, source: 'défauts système' });
    ecrire(join(w.systeme, 'settings.json'), JSON.stringify({ model: { name: 'modele-systeme' }, general: { sessionRetention: { maxAge: '7d' }, enableAutoUpdate: false }, privacy: { usageStatisticsEnabled: false } }));
    c = appeler(w, 'config').config;
    assert.deepEqual(c.effectifs['model.name'], { valeur: 'modele-systeme', source: 'système' });
    assert.deepEqual(c.effectifs['general.sessionRetention.maxAge'], { valeur: '7d', source: 'système' });
    assert.deepEqual(c.effectifs['general.enableAutoUpdate'], { valeur: false, source: 'système' });
    assert.deepEqual(c.effectifs['privacy.usageStatisticsEnabled'], { valeur: false, source: 'système' });
    assert.equal(c.effectifs['general.sessionRetention.maxCount'], undefined, 'un réglage absent de toutes les couches n\'est pas rendu');
    assert.equal(c.effectifs['security.auth.apiKey'], undefined, 'une clé hors liste n\'est jamais rendue');
    assert.deepEqual(c.effectifs['agents.overrides'].valeur, { relecteur: { enabled: false } });
    assert.deepEqual(c.effectifs.experimental.valeur, { autoMemory: true, jeton: 'défini' });
  } finally {
    w.nettoyer();
  }
});

test('T12 JSON avec commentaires lu comme l\'hôte ; JSON cassé signalé par sa ligne, sans extrait (D3.INV-2, D8.INV-1)', () => {
  const w = monde();
  try {
    assert.deepEqual(M.lireJsonc('{ "a": "https://x//y", /* b */ "b": 1 // fin\n }'), { a: 'https://x//y', b: 1 });
    ecrire(join(w.racine, '.gemini', 'settings.json'), '{\n  "model": { "name": secret-json-casse-8823 }\n}\n');
    const c = appeler(w, 'config').config;
    const ws = c.couches.find((x) => x.portee === 'workspace');
    assert.equal(ws.lisible, false);
    assert.match(ws.erreur, /^JSON invalide( \(ligne \d+\))?$/, 'aucun extrait du fichier');
    ecrire(join(w.racine, '.gemini', 'settings.json'), '{\n  "model": { "name": "m" \n  "x": 1\n}\n');
    assert.equal(appeler(w, 'config').config.couches.find((x) => x.portee === 'workspace').erreur, 'JSON invalide (ligne 3)');
    ecrire(join(w.racine, '.gemini', 'settings.json'), '{\n  "model": { "name": secret-json-casse-8823 }\n}\n');
    assert.equal(ws.prise_en_compte, false);
    assert.deepEqual(c.effectifs['model.name'], { valeur: 'modele-utilisateur', source: 'utilisateur' });
    sansSecret(JSON.stringify(c), 'JSON cassé');
  } finally {
    w.nettoyer();
  }
});

test('T13 confiance : fichier, règle la plus longue, TRUST_PARENT, variables et réglage, comme l\'hôte (D3.INV-3)', () => {
  const cas = [
    [{ confiance: 'TRUST_FOLDER' }, 'oui', 'fichier des dossiers de confiance'],
    [{ confiance: 'DO_NOT_TRUST' }, 'non', 'fichier des dossiers de confiance'],
    [{ confiance: null }, 'indéterminée', null],
    [{ confiance: 'DO_NOT_TRUST', env: { GEMINI_CLI_TRUST_WORKSPACE: 'true' } }, 'oui', 'variable d\'environnement'],
    [{ confiance: 'TRUST_FOLDER', env: { GEMINI_CLI_TRUST_WORKSPACE: 'false' } }, 'non', 'variable d\'environnement'],
  ];
  for (const [reglage, verdict, source] of cas) {
    const w = monde(reglage);
    try {
      const c = appeler(w, 'config').config.confiance;
      assert.equal(c.verdict, verdict, JSON.stringify(reglage));
      assert.equal(c.source, source);
    } finally {
      w.nettoyer();
    }
  }
  const w = monde({ confiance: null });
  try {
    ecrire(join(w.g, 'trustedFolders.json'), JSON.stringify({ [w.depot]: 'DO_NOT_TRUST', [w.racine]: 'TRUST_FOLDER' }));
    assert.equal(appeler(w, 'config').config.confiance.verdict, 'oui', 'la règle la plus longue l\'emporte');
    ecrire(join(w.g, 'trustedFolders.json'), JSON.stringify({ [join(w.depot, 'voisin')]: 'TRUST_PARENT' }));
    assert.equal(appeler(w, 'config').config.confiance.verdict, 'oui', 'TRUST_PARENT vaut pour le dossier parent');
    ecrire(join(w.systeme, 'settings.json'), JSON.stringify({ security: { folderTrust: { enabled: false } } }));
    rmSync(join(w.g, 'trustedFolders.json'));
    assert.equal(appeler(w, 'config').config.confiance.verdict, 'oui', 'confiance désactivée : tout est fiable');
    const autre = join(w.base, 'ailleurs', 'confiance.json');
    ecrire(autre, JSON.stringify({ [w.depot]: 'DO_NOT_TRUST' }));
    rmSync(join(w.systeme, 'settings.json'));
    assert.equal(appeler({ ...w, env: { ...w.env, GEMINI_CLI_TRUSTED_FOLDERS_PATH: autre } }, 'config').config.confiance.verdict, 'non');
  } finally {
    w.nettoyer();
  }
});

test('T14 dossier non fiable : réglages, commandes, serveurs MCP, skills et contexte du workspace écartés (D3.INV-3, D4.INV-2, D5.INV-1)', () => {
  const w = monde({ confiance: 'DO_NOT_TRUST' });
  try {
    const o = appeler(w, 'tout');
    const ws = o.config.couches.find((x) => x.portee === 'workspace');
    assert.equal(ws.prise_en_compte, false);
    assert.match(ws.raison, /non fiable/);
    assert.equal(o.config.effectifs['model.name'].source, 'utilisateur');
    assert.ok(o.composants.commandes.every((c) => /non fiable/.test(c.ignore)));
    assert.ok(o.composants.serveurs_mcp.serveurs.filter((s) => s.origine === 'réglages workspace').every((s) => s.ignore));
    assert.match(o.composants.serveurs_mcp.note, /aucun serveur MCP/);
    assert.ok(o.composants.skills.filter((s) => s.portee.startsWith('workspace')).every((s) => s.ignore === 'dossier non fiable'));
    assert.match(o.contexte.projet.charge_au_demarrage, /^non/);
    assert.deepEqual(o.contexte.a_la_demande.fichiers, []);
    assert.equal(o.config.fichier_env.chemin, null, 'pas de .gemini/.env sans confiance, et aucun .env ailleurs');
  } finally {
    w.nettoyer();
  }
});

test('T15 .env que l\'hôte chargerait : .gemini/.env d\'abord, noms des variables, valeurs non secrètes seulement (D3.INV-4, D8.INV-1)', () => {
  const w = monde();
  try {
    const c = appeler(w, 'config').config;
    assert.equal(c.fichier_env.chemin, join(w.racine, '.gemini', '.env'));
    assert.deepEqual(c.fichier_env.variables, [{ nom: 'GEMINI_SYSTEM_MD', valeur: '1' }, { nom: 'GEMINI_API_KEY' }, { nom: 'MON_SECRET' }]);
    ecrire(join(w.depot, '.env'), 'AUTRE=1\n');
    rmSync(join(w.racine, '.gemini', '.env'));
    assert.equal(appeler(w, 'config').config.fichier_env.chemin, join(w.depot, '.env'), 'remontée vers les parents');
  } finally {
    w.nettoyer();
  }
});

test('T16 variables d\'environnement : présence pour les secrets, valeur pour les autres, surcharges nommées (D3.INV-4, D8.INV-1)', () => {
  const w = monde({ env: { GEMINI_API_KEY: CLE_GOOGLE, GEMINI_MODEL: 'modele-env', GEMINI_SYSTEM_MD: '/chemin/systeme.md', AUTRE_JETON: 'secret-env-3390', GEMINI_CLI: '1', CI: 'true' } });
  try {
    const c = appeler(w, 'config').config;
    assert.deepEqual(c.variables.GEMINI_API_KEY, { presente: true });
    assert.deepEqual(c.variables.GEMINI_MODEL, { presente: true, valeur: 'modele-env' });
    assert.deepEqual(c.variables.CI, { presente: true, valeur: 'true' }, 'CI met l\'hôte en mode non interactif : sa valeur est rendue');
    assert.equal(c.variables.AUTRE_JETON, undefined);
    assert.deepEqual(c.surcharges_environnement.GEMINI_MODEL, { valeur: 'modele-env', remplace: 'model.name' });
    assert.deepEqual(c.surcharges_environnement.GEMINI_SYSTEM_MD, { valeur: '/chemin/systeme.md', remplace: 'prompt système' });
    assert.equal(c.note_variables, null, 'pas de retrait de variables annoncé sans le réglage');
    ecrire(join(w.g, 'settings.json'), JSON.stringify({ security: { environmentVariableRedaction: { enabled: true } } }));
    assert.match(appeler(w, 'config').config.note_variables, /absente ici peut exister/);
    sansSecret(JSON.stringify(c), 'variables');
  } finally {
    w.nettoyer();
  }
});

// --- D4 : composants ------------------------------------------------------------------------------

test('T17 skills : paliers et alias, masquage du plus bas par le plus haut, désactivés, écarts d\'en-tête (D4.INV-1)', () => {
  const w = monde();
  try {
    const skills = appeler(w, 'composants').composants.skills;
    const alpha = skills.filter((s) => s.nom === 'alpha');
    assert.deepEqual(alpha.map((s) => s.portee), ['utilisateur', 'utilisateur (.agents)', 'workspace']);
    const gagnant = join(w.racine, '.gemini', 'skills', 'alpha', 'SKILL.md');
    assert.ok(alpha.slice(0, 2).every((s) => s.masque_par === gagnant));
    assert.equal(alpha[2].masque_par, undefined);
    assert.equal(skills.find((s) => s.nom === 'skill-creator').portee, 'intégré');
    assert.equal(skills.find((s) => s.nom === 'beta').desactive, true);
    assert.match(skills.find((s) => s.nom === 'autre-nom').ecarts[0], /différent du nom/);
    assert.deepEqual(skills.find((s) => s.nom === 'sans-entete').ecarts, ['en-tête YAML absent']);
  } finally {
    w.nettoyer();
  }
});

test('T18 sous-agents et commandes : en-têtes, noms invalides, désactivation, espaces de noms, masquage (D4.INV-1)', () => {
  const w = monde();
  try {
    const c = appeler(w, 'composants').composants;
    const relecteur = c.sous_agents.find((a) => a.nom === 'relecteur');
    assert.deepEqual(relecteur.outils, ['read_file', 'grep_search']);
    assert.equal(relecteur.description, 'Relit le code sans le modifier.');
    assert.equal(relecteur.active, false);
    assert.match(c.sous_agents.find((a) => a.nom === 'Mauvais Nom').ecarts[0], /minuscules/);
    assert.equal(c.sous_agents.find((a) => a.nom === 'aide').portee, 'extension ext-a');
    const explique = c.commandes.filter((x) => x.commande === '/hote:explique');
    assert.deepEqual(explique.map((x) => x.portee), ['utilisateur', 'workspace']);
    assert.equal(explique[0].masquee_par, join(w.racine, '.gemini', 'commands', 'hote', 'explique.toml'));
    assert.equal(c.commandes.find((x) => x.commande === '/outil').description, 'Outil');
    assert.equal(c.commandes.find((x) => x.commande === '/deployer').portee, 'extension ext-a');
  } finally {
    w.nettoyer();
  }
});

test('T19 extensions, serveurs MCP, hooks, politiques : décrits sans aucune valeur secrète (D4.INV-1, D8.INV-1)', () => {
  const w = monde();
  try {
    const c = appeler(w, 'composants').composants;
    const ext = c.extensions[0];
    assert.equal(ext.nom, 'ext-a');
    assert.deepEqual(ext.serveurs_mcp, ['distant']);
    assert.equal(ext.fichier_de_contexte, 'CONTEXTE.md');
    assert.deepEqual(ext.contient, ['commands', 'skills', 'agents']);
    assert.equal(ext.source, 'https://[masqué]@example.invalid/ext.git');
    const base = c.serveurs_mcp.serveurs.find((s) => s.nom === 'base');
    assert.equal(base.transport, 'stdio');
    assert.equal(base.commande, 'serveur-base');
    assert.deepEqual(base.arguments, ['--api-key', '[masqué]', '--token=[masqué]', 'postgresql://[masqué]@db/app']);
    assert.deepEqual(base.variables, ['MON_JETON']);
    assert.equal(base.trust, true);
    const local = c.serveurs_mcp.serveurs.find((s) => s.nom === 'local');
    assert.deepEqual(local.en_tetes, ['Authorization']);
    assert.equal(c.serveurs_mcp.serveurs.find((s) => s.nom === 'distant').adresse, 'https://mcp.example.invalid/mcp?token=[masqué]');
    assert.equal(c.serveurs_mcp.serveurs.find((s) => s.nom === 'exclu').exclu, 'mcp.excluded');
    const hook = c.hooks.hooks.find((h) => h.nom === 'journal');
    assert.equal(hook.evenement, 'BeforeTool');
    assert.match(hook.commande, /Bearer \[masqué\]/);
    const admin = c.politiques.fichiers.find((p) => p.palier === 'administrateur');
    assert.deepEqual(admin.decisions, { allow: 0, deny: 1, ask_user: 0 });
    const regles = c.politiques.fichiers.find((p) => p.fichier.endsWith('regles.toml'));
    assert.equal(regles.regles, 2);
    assert.deepEqual(regles.outils, ['glob', 'read_file', 'write_file']);
    assert.deepEqual(regles.modes, ['default', 'plan']);
    assert.deepEqual(regles.sous_agents, ['relecteur']);
    assert.equal(c.politiques.fichiers.find((p) => p.fichier.endsWith('auto-saved.toml')).approbations_enregistrees, true);
    assert.equal(c.fichiers_d_exclusion.geminiignore, join(w.racine, '.geminiignore'));
    assert.equal(c.fichiers_d_exclusion.exclusion_git, join(w.depot, '.git', 'info', 'exclude'));
    sansSecret(JSON.stringify(c), 'composants');
  } finally {
    w.nettoyer();
  }
});

// --- D5 : contexte ----------------------------------------------------------------------------------

test('T20 fichiers de contexte : global, projet jusqu\'au dépôt dans l\'ordre de l\'hôte, imports, à la demande (D5.INV-1, D5.INV-2)', () => {
  const w = monde();
  try {
    const c = appeler(w, 'contexte').contexte;
    assert.deepEqual(c.noms_de_fichiers, { noms: ['GEMINI.md'], source: 'défaut documenté de l\'hôte' });
    assert.deepEqual(c.global.fichiers.map((f) => f.chemin), [join(w.g, 'GEMINI.md')]);
    const attendus = [join(w.depot, 'GEMINI.md'), join(w.racine, 'GEMINI.md')].sort();
    assert.deepEqual(c.projet.fichiers.map((f) => f.chemin), attendus);
    assert.equal(c.projet.depot, w.depot);
    const depot = c.projet.fichiers.find((f) => f.chemin === join(w.depot, 'GEMINI.md'));
    assert.deepEqual(depot.imports, [{ cible: './docs/regles.md', existe: true }, { cible: './absent.md', existe: false }]);
    assert.deepEqual(c.a_la_demande.fichiers, [join(w.racine, 'src', 'api', 'GEMINI.md')]);
    assert.deepEqual(c.extensions, [{ extension: 'ext-a', chemin: join(w.ext, 'CONTEXTE.md'), present: true }]);
    sansSecret(JSON.stringify(c), 'contexte');
  } finally {
    w.nettoyer();
  }
});

test('T21 noms de fichiers et marqueurs réglés : AGENTS.md cherché, aucune remontée sans marqueur (D5.INV-1)', () => {
  const w = monde();
  try {
    ecrire(join(w.racine, 'AGENTS.md'), 'Consignes partagées.\n');
    ecrire(join(w.racine, '.gemini', 'settings.json'), JSON.stringify({ context: { fileName: ['AGENTS.md', 'GEMINI.md'], memoryBoundaryMarkers: [] } }));
    const c = appeler(w, 'contexte').contexte;
    assert.deepEqual(c.noms_de_fichiers, { noms: ['AGENTS.md', 'GEMINI.md'], source: 'réglages workspace' });
    assert.deepEqual(c.projet.fichiers.map((f) => f.chemin), [join(w.racine, 'AGENTS.md'), join(w.racine, 'GEMINI.md')]);
    assert.equal(c.projet.depot, null);
    assert.equal(c.projet.dossiers_parcourus, 1);
  } finally {
    w.nettoyer();
  }
});

test('T22 mémoire privée du projet et trace de la dernière session : chemins et balises, jamais le texte (D5.INV-3, D8.INV-2)', () => {
  const w = monde();
  try {
    const c = appeler(w, 'contexte').contexte;
    assert.equal(c.memoire_privee_du_projet.identifiant, 'app');
    assert.equal(c.memoire_privee_du_projet.index.present, true);
    const t = c.trace_de_session;
    assert.equal(t.sessions, 2);
    assert.match(t.fichier, /session-recente\.jsonl$/);
    assert.equal(t.debut, '2026-11-06T08:00:00.000Z');
    assert.deepEqual(t.dossiers_workspace, [w.racine]);
    assert.deepEqual(t.fichiers_de_contexte_charges, [join(w.depot, 'GEMINI.md'), join(w.racine, 'GEMINI.md')]);
    assert.deepEqual(t.balises, ['session_context', 'loaded_context', 'project_context']);
    assert.equal(t.arborescence_incluse, true);
    sansSecret(JSON.stringify(c), 'trace de session');
  } finally {
    w.nettoyer();
  }
});

test('T23 prompt système exporté : sections, skills, sous-agents, mémoires chargées ; fichier absent : code 2 (D5.INV-4)', () => {
  const w = monde();
  try {
    const exporte = join(w.base, 'systeme-exporte.md');
    ecrire(exporte, [
      '# Core Mandates', 'texte', '# Available Sub-Agents', '- codebase_investigator -> analyse', '- cli_help -> aide', '### Délégation',
      '<available_subagents>', '  <subagent>', '    <name>explicateur-hote</name>', '    <description>Explique.</description>', '  </subagent>', '</available_subagents>', '',
      'You can invoke sub-agents using the `invoke_agent` tool.', '# Available Agent Skills', '<available_skills>',
      '  <skill>', '    <name>explication-hote-ia</name>', '    <description>Explique.</description>', '    <location>/x/SKILL.md</location>', '  </skill>',
      '</available_skills>', CLOTURE, '# pas un titre', CLOTURE, '---', '<loaded_context>', '<global_context>',
      `--- Context from: ${join(w.g, 'GEMINI.md')} ---`, 'Préférences consigne-confidentielle-6604.', `--- End of Context from: ${join(w.g, 'GEMINI.md')} ---`,
      '</global_context>', '</loaded_context>', '',
    ].join('\n'));
    const p = appeler(w, 'contexte', { promptSysteme: exporte }).contexte.prompt_systeme;
    assert.deepEqual(p.titres, ['# Core Mandates', '# Available Sub-Agents', '# Available Agent Skills']);
    assert.deepEqual(p.skills, [{ nom: 'explication-hote-ia', emplacement: '/x/SKILL.md' }]);
    assert.deepEqual(p.sous_agents, ['codebase_investigator', 'cli_help', 'explicateur-hote'], 'listes des deux gabarits du prompt');
    assert.deepEqual(p.fichiers_de_contexte, [join(w.g, 'GEMINI.md')]);
    assert.deepEqual(p.balises, ['loaded_context', 'global_context']);
    assert.equal(p.outil_d_appel_des_sous_agents, 'invoke_agent');
    sansSecret(JSON.stringify(p), 'prompt exporté');
    const absent = lancer(w, ['contexte', '--paquet', w.paquet, '--dossier-systeme', w.systeme, '--prompt-systeme', join(w.base, 'absent.md')]);
    assert.equal(absent.code, 2);
  } finally {
    w.nettoyer();
  }
});

// --- Documentation embarquée --------------------------------------------------------------------------

test('T24 doc : liste et documents de la version installée ; chemin hors du dossier refusé ; absent introuvable (D2.INV-2, D1.INV-2)', () => {
  const w = monde();
  try {
    const liste = appeler(w, 'doc').doc;
    assert.deepEqual(liste.fichiers, ['cli/gemini-md.md', 'index.md']);
    assert.equal(liste.version, '0.67.0');
    const d = appeler(w, 'doc', {}, ['cli/gemini-md.md']).doc;
    assert.match(d.texte, /Contexte hiérarchique/);
    assert.equal(d.nature, 'documenté');
    for (const [chemin, code] of [['../package.json', 3], [join(w.paquet, 'package.json'), 3], ['cli/absent.md', 2], ['index.txt', 3]]) {
      const r = lancer(w, ['doc', chemin, '--paquet', w.paquet, '--dossier-systeme', w.systeme]);
      assert.equal(r.code, code, `${chemin} : ${r.erreur}`);
    }
    const texte = lancer(w, ['doc', 'cli/gemini-md.md', '--format', 'texte', '--paquet', w.paquet, '--dossier-systeme', w.systeme]);
    assert.match(texte.sortie, /^# GEMINI\.md/);
    sansSecret(texte.sortie, 'document');
    assert.throws(() => M.executer('doc', { env: { ...w.env, PATH: '' }, racine: w.racine, dossierSysteme: w.systeme, ancetres: false }), (e) => e.code === M.CODES.INTROUVABLE);
  } finally {
    w.nettoyer();
  }
});

// --- D8 : secrets ------------------------------------------------------------------------------------

test('T25 aucun secret témoin ne sort, quelle que soit la commande et le format (D8.INV-1, D8.INV-2)', () => {
  const w = monde({ env: { GEMINI_API_KEY: CLE_GOOGLE, GEMINI_CLI: '1' } });
  try {
    for (const args of [['hote'], ['config'], ['contexte'], ['composants'], ['tout'], ['tout', '--format', 'texte'], ['doc', 'cli/gemini-md.md'], ['doc', 'cli/gemini-md.md', '--format', 'texte']]) {
      const r = lancer(w, [...args, '--paquet', w.paquet, '--dossier-systeme', w.systeme]);
      assert.equal(r.code, 0, r.erreur);
      sansSecret(r.sortie + r.erreur, args.join(' '));
    }
  } finally {
    w.nettoyer();
  }
});

test('T26 masquage par motifs et arguments sensibles (D8.INV-1)', () => {
  const cas = [
    [`clé ${CLE_GOOGLE}`, 'clé [masqué]'],
    ['https://alice:mdp@hote.example/x', 'https://[masqué]@hote.example/x'],
    ['https://hote.example/x?api_key=abc&y=1', 'https://hote.example/x?api_key=[masqué]&y=1'],
    ['Authorization: Bearer abcdef123456', 'Authorization: Bearer [masqué]'],
    ['--password=abc123', '--password=[masqué]'],
    ['GITHUB_TOKEN=ghp_xyz', 'GITHUB_TOKEN=[masqué]'],
    ['jeton ghp_abcdefghijklmnopqrstuvwxyz0123456789', 'jeton [masqué]'],
    ['-----BEGIN RSA PRIVATE KEY-----\nMIIE\n-----END RSA PRIVATE KEY-----', '[masqué]'],
    ['modele-x', 'modele-x'],
  ];
  for (const [entree, attendu] of cas) assert.equal(M.masquer(entree), attendu, entree);
  assert.deepEqual(M.masquerArguments(['--api-key', 'abc', '--verbose', 'x', '--token', 'def']), ['--api-key', '[masqué]', '--verbose', 'x', '--token', '[masqué]']);
  assert.deepEqual(M.decrireArguments(['--model=m', '-p', 'bonjour', 'question libre', '--debug', '--cle=x']), ['--model m', '-p [texte masqué, 7 caractères]', '[argument masqué, 14 caractères]', '--debug', '--cle=[valeur non rendue]']);
});

// --- Utilitaires de parité ----------------------------------------------------------------------------

test('T27 clés de chemin comme l\'hôte : minuscules sous Windows pour le registre, sous Windows et macOS pour la confiance', () => {
  const p = resolve('/Dev/App');
  assert.equal(M.cleRegistre(p, 'win32'), p.toLowerCase());
  assert.equal(M.cleRegistre(p, 'darwin'), p);
  assert.equal(M.cleRegistre(p, 'linux'), p);
  assert.equal(M.cleConfiance(p, 'darwin'), p.toLowerCase());
  assert.equal(M.cleConfiance(p, 'linux'), p);
  assert.deepEqual(M.lireEnTete('---\nname: a\ndescription: |\n  ligne 1\n  ligne 2\ntools: [x, "y"]\n---\n'), { name: 'a', description: 'ligne 1 ligne 2', tools: ['x', 'y'] });
  assert.equal(M.lireEnTete('# pas d\'en-tête\n'), null);
});

test('T28 racine égale à l\'accueil : les réglages de l\'utilisateur ne sont pas comptés deux fois (D3.INV-1)', () => {
  const w = monde();
  try {
    const c = appeler({ ...w, racine: w.accueil }, 'config').config;
    const ws = c.couches.find((x) => x.portee === 'workspace');
    assert.equal(ws.prise_en_compte, false);
    assert.match(ws.raison, /accueil/);
    assert.equal(c.effectifs['model.name'].source, 'utilisateur');
  } finally {
    w.nettoyer();
  }
});
```
