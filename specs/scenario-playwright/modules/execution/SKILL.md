---
name: execution
description: Exécution du skill (installation par npm ci, Node 22 ou plus récent, navigateur du poste et canal Chrome, Edge ou Chromium, dépendance unique playwright-core 1.65.1 à version exacte, emplacements des profils et des résultats, .gitignore du skill, réglages par variables SCENARIO_PLAYWRIGHT_*, lignes de commande de jouer, verifier, traduire et importer et leurs codes de sortie, pièges connus, commande d'extraction des fichiers exécutables à empreintes, sources de package.json, package-lock.json, .gitignore, scripts/jouer.mjs, scripts/verifier.mjs et scripts/traduire.mjs). À lire en premier, pour installer le skill.
dimensions: [D1]
status: active
---

# Module `execution` (D1)

Phase 7E couverte : Espace.

## 1. Commandes

Les scripts se lancent depuis n'importe quel dossier ; un scénario se désigne par son chemin, et ses résultats s'écrivent à côté de lui.

| Commande | Rôle | Module |
|---|---|---|
| `node <skill>/scripts/traduire.mjs <texte.scenario> [--remplacer]` | squelette TOML de la traduction, écrit à côté du texte | `scenario` |
| `node <skill>/scripts/verifier.mjs <fichier>... [--plan] [--param nom=valeur]...` | vérification sans navigateur d'un texte ou d'un scénario | `texte`, `scenario` |
| `node <skill>/scripts/jouer.mjs <scénario.toml> [options]` | exécution dans le navigateur du poste, rapport | `actions` |
| `node <skill>/scripts/designer.mjs <adresse> [--profil nom] [--max n]` | désignation de cibles à la souris | `designer` |
| `node <skill>/scripts/importer.mjs <page.mhtml \| adresse> --adresse <url> [options]` | un texte de départ par scénario Gherkin d'une demande Jira ; `--comparer` compare sans écrire | `jira` |
| `npm test`, depuis le dossier du skill | recette | `recette` |

`package.json` donne aussi `npm run jouer -- <scénario.toml>`, `npm run verifier -- <fichier>`, `npm run traduire -- <texte.scenario>`, `npm run designer -- <adresse>` et `npm run importer -- <page.mhtml> --adresse <url>`, depuis le dossier du skill.

## 2. Installation

1. Node 22 ou plus récent : `node --version`. `playwright-core` 1.65 n'est plus essayé sous Node 20 (D1.INV-1).
2. Depuis le dossier du skill, `npm ci` installe la seule dépendance, à la version du verrou. Derrière un proxy d'entreprise, npm lit `HTTPS_PROXY` ou sa propre configuration.
3. Le navigateur est celui du poste : Chrome par défaut. `playwright-core` n'en télécharge aucun.
   - Edge : `SCENARIO_PLAYWRIGHT_CANAL=msedge`.
   - Sans Chrome ni Edge : `npx playwright-core install chromium`, puis `SCENARIO_PLAYWRIGHT_CANAL=chromium`.
4. Sous WSL2, le navigateur doit être installé dans la distribution, et la fenêtre s'affiche par WSLg. Le plus simple reste d'installer et de lancer le skill sous Windows, à côté de Chrome.
5. Le scénario se joue dans une fenêtre visible : le développeur voit ce que fait le skill, et agit lui-même lors d'une étape à la main. `--sans-tete` joue sans fenêtre un scénario qui n'a aucune étape à la main (D6.INV-3). Sous Linux sans écran, la recette tourne sous `xvfb-run` (module `recette`, § 1).

Dans Gemini CLI, depuis un clone du dépôt Agent2Prompt, `node installer.mjs` installe le skill dans `~/.gemini/skills/scenario-playwright/`, avec son agent et ses commandes (module `agent`, § 2), et rappelle le `npm ci` à faire une fois.

## 3. Emplacements (D1.INV-2)

| Chemin | Contenu | Écarté par Git |
|---|---|---|
| `.profils/<profil>/`, dans le dossier du skill | profil du navigateur : cookies et session de chaque application ; `defaut` sans profil nommé ; `jira` pour l'import par l'adresse | oui, `.gitignore` du skill |
| `resultats/<horodatage>-<scénario>/`, à côté du scénario | rapport, captures, instantanés ARIA, téléchargements, trace | oui dans le dossier du skill ; ailleurs, `resultats/` s'ajoute au `.gitignore` du projet |
| `node_modules/`, dans le dossier du skill | `playwright-core` | oui |
| textes importés et `jira/<CLÉ>-<horodatage>.mhtml`, dans le dossier de `--dossier` de `importer.mjs` | textes de départ ; pages Jira enregistrées par l'import par l'adresse (module `jira`) | non : `jira/` s'ajoute au `.gitignore` du projet, une page de Jira ne se versionne pas |

Un dossier de résultats choisi par `--resultats` hors du skill n'est couvert par aucun `.gitignore` : il se choisit hors de tout dépôt, ou s'y ajoute à l'exclusion. Un profil contient des cookies de session : il ne se copie ni ne se partage.

## 4. Réglages (D1.INV-3)

| Variable | Défaut | Rôle |
|---|---|---|
| `SCENARIO_PLAYWRIGHT_CANAL` | `chrome` | navigateur : `chrome`, `msedge`, ou `chromium` pour celui de Playwright |
| `SCENARIO_PLAYWRIGHT_PROFILS` | `.profils` | dossier des profils, relatif au dossier du skill ou absolu |
| `SCENARIO_PLAYWRIGHT_DELAI` | aucun | délai d'une étape, en secondes, de 1 à 30, quand ni l'étape ni le scénario n'en donnent ; à défaut, 10 s |

Une variable vide vaut absente ; une valeur invalide est refusée, avec le code 2. Sous PowerShell : `$env:SCENARIO_PLAYWRIGHT_CANAL = "msedge"` ; sous bash : `export SCENARIO_PLAYWRIGHT_CANAL=msedge`.

## 5. Lignes de commande et codes de sortie (D1.INV-4)

`jouer.mjs <scénario.toml>` :

| Option | Effet |
|---|---|
| `--param nom=valeur` | valeur d'un paramètre ou d'une colonne des jeux, pour cette exécution (D3.INV-6) ; répétable |
| `--jeu n` | ne joue que le jeu `n`, à partir de 1 |
| `--resultats <dossier>` | dossier où créer le dossier de résultats, au lieu de `resultats/` à côté du scénario |
| `--sans-tete` | sans fenêtre ; refusé avec une étape à la main (D6.INV-3) |
| `--ralenti <ms>` | pause de 0 à 2 000 ms avant chaque geste de Playwright, pour suivre une démonstration |
| `--trace` | enregistre `trace.zip`, qui contient les cookies de la session (D7.INV-3) |
| `--autoriser-mutations` | autorise, pour cette exécution, les étapes de mutation hors du poste (D7.INV-2) |

Sortie : une ligne d'en-tête (titre, jeux, étapes, navigateur et version), `AVERTISSEMENT` de compatibilité s'il y a lieu (D6.INV-1), `Jeu n : …` pour chaque jeu quand il y en a plusieurs, `À VOUS : …` pour une étape à la main, une ligne par étape (`ok`, `KO` avec le message, `--` non jouée), `origine bloquée : …` pour chaque origine interrompue, puis `Bilan : …` et `Rapport : <chemin de rapport.md>`.

| Code | `jouer.mjs` | `verifier.mjs`, `traduire.mjs` |
|---|---|---|
| 0 | toutes les étapes de tous les jeux ont réussi | tout est conforme ; squelette écrit |
| 1 | au moins une étape a échoué ; le rapport est écrit | |
| 2 | scénario, option, réglage ou navigateur refusé, avant toute action dans le navigateur ; aucun rapport | un fichier refusé ; squelette non écrit |

Les options, la sortie et les codes de `importer.mjs` sont au module `jira`, § 7 (D16.INV-6).

`verifier.mjs` écrit `ok` pour chaque fichier conforme, `ERREUR` pour chaque erreur, et `note` pour ce que le développeur doit savoir avant de jouer : étapes de mutation et origines hors du poste, étapes à la main, cibles fragiles. `--plan` ajoute le plan de la traduction (module `scenario`, § 4.4) ; `--param` y vérifie une valeur donnée en ligne de commande.

## 6. Dépendance (D1.INV-1)

`playwright-core` 1.65.1, à version exacte dans `package.json` et dans le verrou : c'est la version de la recette. Elle n'a aucune dépendance, et pilote le navigateur du poste par le protocole Chrome DevTools. Elle porte le Chromium 159, qui suit le Chrome stable de sa publication et le suivant (module `session`, § 2). Une autre version se monte dans une nouvelle version du skill, recette rejouée.

## 7. Pièges connus

- **Profil déjà ouvert** : un profil ne s'ouvre que dans une fenêtre à la fois. Si deux exécutions, ou une exécution et une désignation, prennent le même profil, la seconde est refusée avec un message qui le dit. Fermer la première fenêtre.
- **Chrome introuvable** : le lancement est refusé, avec le code 2. Installer Chrome, ou choisir un autre canal (§ 4).
- **Avertissement de compatibilité** : Chrome plus récent que le Chromium de `playwright-core`. Un échec inattendu se signale : une nouvelle version du skill monte `playwright-core` (module `session`, § 2).
- **Origine bloquée** : une police ou un script d'un CDN, que le scénario ne déclare pas, est interrompu ; la page peut s'afficher autrement. L'origine s'ajoute au texte de départ si elle est légitime (module `garde`, § 1).
- **Étape à la main dans Gemini CLI** : la commande lancée par l'agent attend, le temps que le développeur agisse dans la fenêtre ; elle reprend seule dès l'état atteint. Il en va de même de la connexion à Jira, lors d'un import par l'adresse.
- **Jira qui ne ramène pas à la demande** : après la connexion, certains SSO mènent à l'accueil de Jira ; le développeur rouvre la demande dans la même fenêtre, et l'import reprend dès qu'elle s'affiche.

## 8. Matérialiser les fichiers exécutables

| Fichier | Module, section | Empreinte sha256 |
|---|---|---|
| `package.json` | `execution`, § 10 | `5a473fadee1b12a6971cf1cfdbd0a7b082d652cb3ce94a21b81b6aac595389de` |
| `package-lock.json` | `execution`, § 10 | `df97fe8d248170664e095b84f3871cbed9a8ab86c456490b60bdf0a7c8a2b43e` |
| `.gitignore` | `execution`, § 10 | `03bf7f97f17a0d1abb005b6480ec3b0f06a0b9c29c1d1f83131209b52b888a7e` |
| `scripts/jouer.mjs` | `execution`, § 11 | `430ce19ba2a932e181bbe9065e48e06cc4944e3e3129d84ee64e46931c845975` |
| `scripts/verifier.mjs` | `execution`, § 12 | `f329192fd45f660fcbf16d3ddf29b7acb2baca15afd20eabc5c2b37c6f9341c9` |
| `scripts/traduire.mjs` | `execution`, § 13 | `4c52689f4df5e0c90fd79439f5b8538167941384be8a02fc38e13c01d65578f1` |
| `scripts/texte.mjs` | `texte`, § 12 | `bcc0545ee54b6b0a5f26f69d7c7d97bfd6c2017e81238330e976ac188744485c` |
| `scripts/jira.mjs` | `jira`, § 9 | `41ddc6f4ffaa97e1dbb295629346d27e9f8b0e4de2bb17a0ec160dbb1eed2598` |
| `scripts/importer.mjs` | `jira`, § 10 | `9c80feecf208c971307e1fdaf1f5a87906344427a9605caecbfcc8a49720399c` |
| `scripts/toml.mjs` | `scenario`, § 6 | `f740a1b7eb5b4ada4774b359c5a1f48fa8c49405de14b80124624ed713456666` |
| `scripts/scenario.mjs` | `scenario`, § 7 | `36b7ad39a0d2b5d4c783b9117a2ea05eafee4d96dfb0ed4b4d890149000cb436` |
| `scripts/cibles.mjs` | `cibles`, § 6 | `79bbbbdbea27de1f322f67b9b2fa9308094912c86dda00138d0a00755da4e03e` |
| `scripts/moteur.mjs` | `actions`, § 9 | `1c564e1a7f347b4b035a0f544987dcf364f0d64d93058417aa2b16f240e6ce60` |
| `scripts/session.mjs` | `session`, § 7 | `9908b1e8af33c7275a1a168fe1bddb8f1444f045d8d605ecfe835f573344f39c` |
| `scripts/rapport.mjs` | `preuves`, § 7 | `8298e4045e289c82a26ed1083ee61869063ce4467ddffe3cdc3b1dedd9193bad` |
| `scripts/designer.mjs` | `designer`, § 5 | `065714ba07f1b0088e62ce25804661fcb6b3ed8c09987ccb79f8ab4ce868d74d` |
| `agent/pilote-scenario.md` | `agent`, § 6 | `c0e4b4c808a625c13ded2083e01fc9736eeeb9e5d2acbd874b835e0e68ddc116` |
| `commandes/scenario/importer.toml` | `agent`, § 7 | `da3140c828ac459e81d717b540f067bcac90f4fd87b07a8f5fae1dd6a563b967` |
| `commandes/scenario/traduire.toml` | `agent`, § 7 | `ddc33583462709478412cd30e809c66e2cecb76b6c3b369f293b10ccb2716b16` |
| `commandes/scenario/jouer.toml` | `agent`, § 7 | `61272fce078843e89e9d5730ff72bc6584359dbc59830eeed782b098234929dc` |
| `commandes/scenario/designer.toml` | `agent`, § 7 | `f71d7fddaad12eb20df43d4a04db0fec016021071253734de2e70de89ca62c73` |
| `tests/application-demo.mjs` | `recette`, § 6 | `f536e3bb587f985167631f1c96953b1aa0fd2a4706ca688292b33f06836db2fc` |
| `tests/run-tests.mjs` | `recette`, § 6 | `bcc43d9cb9e2b10d5008fcba47d7e284062f357d53b85573318f7d3712bece62` |

Depuis le dossier du skill, cette commande d'une ligne écrit les vingt-trois fichiers, compare leurs empreintes à celles du tableau et sort avec le code 1 au moindre écart. Elle ne contient ni `$`, ni accent grave, ni `!`, ni `%`, ni guillemet intérieur : elle se colle telle quelle dans bash, zsh, CMD ou PowerShell, et dans un fichier `.cmd`. Elle lit aussi des modules aux fins de ligne CRLF.

```text
node -e "const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'); const attendu = { 'package.json': '5a473fadee1b12a6971cf1cfdbd0a7b082d652cb3ce94a21b81b6aac595389de', 'package-lock.json': 'df97fe8d248170664e095b84f3871cbed9a8ab86c456490b60bdf0a7c8a2b43e', '.gitignore': '03bf7f97f17a0d1abb005b6480ec3b0f06a0b9c29c1d1f83131209b52b888a7e', 'scripts/jouer.mjs': '430ce19ba2a932e181bbe9065e48e06cc4944e3e3129d84ee64e46931c845975', 'scripts/verifier.mjs': 'f329192fd45f660fcbf16d3ddf29b7acb2baca15afd20eabc5c2b37c6f9341c9', 'scripts/traduire.mjs': '4c52689f4df5e0c90fd79439f5b8538167941384be8a02fc38e13c01d65578f1', 'scripts/texte.mjs': 'bcc0545ee54b6b0a5f26f69d7c7d97bfd6c2017e81238330e976ac188744485c', 'scripts/jira.mjs': '41ddc6f4ffaa97e1dbb295629346d27e9f8b0e4de2bb17a0ec160dbb1eed2598', 'scripts/importer.mjs': '9c80feecf208c971307e1fdaf1f5a87906344427a9605caecbfcc8a49720399c', 'scripts/toml.mjs': 'f740a1b7eb5b4ada4774b359c5a1f48fa8c49405de14b80124624ed713456666', 'scripts/scenario.mjs': '36b7ad39a0d2b5d4c783b9117a2ea05eafee4d96dfb0ed4b4d890149000cb436', 'scripts/cibles.mjs': '79bbbbdbea27de1f322f67b9b2fa9308094912c86dda00138d0a00755da4e03e', 'scripts/moteur.mjs': '1c564e1a7f347b4b035a0f544987dcf364f0d64d93058417aa2b16f240e6ce60', 'scripts/session.mjs': '9908b1e8af33c7275a1a168fe1bddb8f1444f045d8d605ecfe835f573344f39c', 'scripts/rapport.mjs': '8298e4045e289c82a26ed1083ee61869063ce4467ddffe3cdc3b1dedd9193bad', 'scripts/designer.mjs': '065714ba07f1b0088e62ce25804661fcb6b3ed8c09987ccb79f8ab4ce868d74d', 'agent/pilote-scenario.md': 'c0e4b4c808a625c13ded2083e01fc9736eeeb9e5d2acbd874b835e0e68ddc116', 'commandes/scenario/importer.toml': 'da3140c828ac459e81d717b540f067bcac90f4fd87b07a8f5fae1dd6a563b967', 'commandes/scenario/traduire.toml': 'ddc33583462709478412cd30e809c66e2cecb76b6c3b369f293b10ccb2716b16', 'commandes/scenario/jouer.toml': '61272fce078843e89e9d5730ff72bc6584359dbc59830eeed782b098234929dc', 'commandes/scenario/designer.toml': 'f71d7fddaad12eb20df43d4a04db0fec016021071253734de2e70de89ca62c73', 'tests/application-demo.mjs': 'f536e3bb587f985167631f1c96953b1aa0fd2a4706ca688292b33f06836db2fc', 'tests/run-tests.mjs': 'bcc43d9cb9e2b10d5008fcba47d7e284062f357d53b85573318f7d3712bece62' }; const vus = new Set(); let ecarts = 0; for (const module of ['modules/execution/SKILL.md', 'modules/texte/SKILL.md', 'modules/jira/SKILL.md', 'modules/scenario/SKILL.md', 'modules/cibles/SKILL.md', 'modules/actions/SKILL.md', 'modules/session/SKILL.md', 'modules/preuves/SKILL.md', 'modules/designer/SKILL.md', 'modules/agent/SKILL.md', 'modules/recette/SKILL.md']) { const texte = fs.readFileSync(module, 'utf8').replace(/\r\n/g, '\n'); for (const m of texte.matchAll(/^<\x21-- fichier : (\S+) -->\n\x60{3}[a-z]*\n([\s\S]*?)\n\x60{3}\n/gm)) { const contenu = m[2] + '\n'; fs.mkdirSync(path.dirname(m[1]), { recursive: true }); fs.writeFileSync(m[1], contenu); vus.add(m[1]); const conforme = crypto.createHash('sha256').update(contenu).digest('hex') === attendu[m[1]]; if (conforme === false) ecarts++; console.log((conforme ? 'conforme  ' : 'ECART     ') + m[1]); } } for (const f of Object.keys(attendu)) if (vus.has(f) === false) { ecarts++; console.log('ABSENT    ' + f); } if (ecarts > 0) process.exitCode = 1;"
```

Puis, depuis le même dossier : `npm ci`, et la recette, `npm test` (sous Linux sans écran, `xvfb-run -a npm test`).

## 9. Contrôle de sortie

- La commande du § 8 écrit `conforme` pour chacun des vingt-trois fichiers.
- `npm ci` installe `playwright-core` 1.65.1.
- `npm test` rend son bilan sans échec (module `recette`).

## 10. Paquet et fichiers de travail

`package.json` déclare la dépendance unique, la version de Node et les commandes du § 1 ; `package-lock.json` fixe la version de la dépendance ; `.gitignore` écarte les fichiers de travail (§ 3).

<!-- fichier : package.json -->
```json
{
  "name": "scenario-playwright",
  "version": "1.1.0",
  "private": true,
  "description": "Scénarios côté utilisateur, joués dans le Chrome du poste par Playwright (skill scenario-playwright)",
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "jouer": "node scripts/jouer.mjs",
    "verifier": "node scripts/verifier.mjs",
    "traduire": "node scripts/traduire.mjs",
    "designer": "node scripts/designer.mjs",
    "importer": "node scripts/importer.mjs",
    "test": "node tests/run-tests.mjs"
  },
  "dependencies": {
    "playwright-core": "1.65.1"
  }
}
```

<!-- fichier : package-lock.json -->
```json
{
  "name": "scenario-playwright",
  "version": "1.1.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "scenario-playwright",
      "version": "1.1.0",
      "dependencies": {
        "playwright-core": "1.65.1"
      },
      "engines": {
        "node": ">=22"
      }
    },
    "node_modules/playwright-core": {
      "version": "1.65.1",
      "resolved": "https://registry.npmjs.org/playwright-core/-/playwright-core-1.65.1.tgz",
      "integrity": "sha512-hqPpz7blSMPxWVdoeE1yiBSzXsKiVOd2k+kjCvmUywD2GPO2Dd9HfcWnq9NN0GHbNZDFgZ9JfBFr+X5/BLo0qw==",
      "license": "Apache-2.0",
      "bin": {
        "playwright-core": "cli.js"
      },
      "engines": {
        "node": ">=20"
      }
    }
  }
}
```

<!-- fichier : .gitignore -->
```gitignore
# Fichiers de travail du skill scenario-playwright : dépendance, profils du navigateur (sessions),
# résultats des exécutions. Ils ne vont jamais dans un dépôt.
node_modules/
.profils/
resultats/
```

## 11. `scripts/jouer.mjs`

L'exécution : lecture de la ligne de commande et des réglages, lecture et contrôle du scénario (module `scenario`), préparation des jeux, refus avant le navigateur (D6.INV-3, D7.INV-2), ouverture du navigateur et garde des origines (module `session`), moteur (module `actions`), rapport (module `preuves`).

<!-- fichier : scripts/jouer.mjs -->
```javascript
#!/usr/bin/env node
// scenario-playwright 1.1.0 : joue un scénario TOML dans le navigateur du poste, comme un utilisateur.
//
// Usage, depuis n'importe quel dossier :
//   node <dossier du skill>/scripts/jouer.mjs <scénario.toml> [--param nom=valeur]... [--jeu n]
//     [--resultats dossier] [--sans-tete] [--ralenti ms] [--trace] [--autoriser-mutations]
// Codes de sortie (D1.INV-4) : 0 tout a réussi, 1 une étape a échoué, 2 scénario, option ou environnement
// refusé avant toute action dans le navigateur.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { jouerScenario } from './moteur.mjs';
import { construireRapport, dossierResultats, ecrireRapport } from './rapport.mjs';
import { DELAI_DEFAUT, lireScenario, preparerJeux } from './scenario.mjs';
import { compatibilite, dossierProfil, estLocale, garderOrigines, lireReglages, ouvrirNavigateur, reference } from './session.mjs';

const USAGE = 'Usage : node scripts/jouer.mjs <scénario.toml> [--param nom=valeur]... [--jeu n] [--resultats dossier] [--sans-tete] [--ralenti ms] [--trace] [--autoriser-mutations]';

/** Lit la ligne de commande ; rend { options } ou { erreur }. */
export function lireArguments(args) {
  const o = { fichier: null, params: {}, jeu: null, resultats: null, sansTete: false, ralenti: 0, trace: false, autoriserMutations: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const suivant = () => {
      if (i + 1 >= args.length) throw new Error(`${a} attend une valeur`);
      return args[++i];
    };
    try {
      if (a === '--param') {
        const v = suivant();
        const m = /^([a-z][a-z0-9_]*)=(.*)$/s.exec(v);
        if (!m) throw new Error(`--param attend nom=valeur, nom en minuscules (« ${v} »)`);
        if (Object.hasOwn(o.params, m[1])) throw new Error(`--param ${m[1]} donné deux fois`);
        o.params[m[1]] = m[2];
      } else if (a === '--jeu') {
        const v = Number(suivant());
        if (!Number.isInteger(v) || v < 1) throw new Error('--jeu attend un numéro à partir de 1');
        o.jeu = v;
      } else if (a === '--resultats') o.resultats = suivant();
      else if (a === '--ralenti') {
        const v = Number(suivant());
        if (!Number.isInteger(v) || v < 0 || v > 2000) throw new Error('--ralenti attend un nombre de millisecondes, de 0 à 2000');
        o.ralenti = v;
      } else if (a === '--sans-tete') o.sansTete = true;
      else if (a === '--trace') o.trace = true;
      else if (a === '--autoriser-mutations') o.autoriserMutations = true;
      else if (a.startsWith('-')) throw new Error(`option inconnue : ${a}`);
      else if (o.fichier !== null) throw new Error(`un seul scénario à la fois (« ${a} » en plus)`);
      else o.fichier = a;
    } catch (e) {
      return { erreur: e.message };
    }
  }
  if (o.fichier === null) return { erreur: 'scénario manquant' };
  return { options: o };
}

const refus = (lignes) => {
  for (const l of [].concat(lignes)) console.error(`ERREUR ${l}`);
  return 2;
};

export async function main(args, env = process.env) {
  const lu = lireArguments(args);
  if (lu.erreur) return refus([lu.erreur, USAGE]);
  const o = lu.options;
  const { reglages, erreurs: erreursReglages } = lireReglages(env);
  if (erreursReglages.length) return refus(erreursReglages);
  const fichier = resolve(o.fichier);
  const { scenario, erreurs, dossier } = lireScenario(fichier);
  if (!scenario) return refus(erreurs.map((e) => `${basename(fichier)} : ${e}`));
  const { jeux, erreurs: erreursJeux } = preparerJeux(scenario, dossier, o.params, o.jeu);
  if (erreursJeux.length) return refus(erreursJeux.map((e) => `${basename(fichier)} : ${e}`));
  if (o.sansTete && scenario.etapes.some((e) => e.action === 'main')) return refus('le scénario a une étape à la main : il se joue dans une fenêtre visible, sans --sans-tete (D6.INV-3)');
  const distantes = scenario.origines.filter((x) => !estLocale(x));
  if (scenario.etapes.some((e) => e.mutation) && distantes.length && !o.autoriserMutations) {
    return refus(`le scénario modifie des données (étapes ${scenario.etapes.flatMap((e, i) => (e.mutation ? [i + 1] : [])).join(', ')}) et déclare des origines hors du poste (${distantes.join(', ')}) : --autoriser-mutations, avec l'accord du développeur pour cette exécution (D7.INV-2)`);
  }

  const ref = reference();
  let contexte;
  try {
    contexte = await ouvrirNavigateur({ canal: reglages.canal, profil: dossierProfil(reglages, scenario.profil), sansTete: o.sansTete, ralenti: o.ralenti });
  } catch (e) {
    const texte = String(e.message);
    if (/ProcessSingleton|profile.*in use|SingletonLock/i.test(texte)) return refus(`le profil ${scenario.profil ?? 'defaut'} est déjà ouvert dans une autre fenêtre : la fermer, puis relancer`);
    return refus(`navigateur ${reglages.canal} introuvable ou impossible à lancer : ${texte.split('\n')[0]} ; installer Chrome, ou choisir SCENARIO_PLAYWRIGHT_CANAL=msedge ou chromium (module execution)`);
  }
  const debut = new Date();
  const resultats = dossierResultats(o.resultats ? resolve(o.resultats) : join(dossier, 'resultats'), basename(fichier), debut);
  let joues = [];
  let journal = null;
  let version = 'inconnue';
  try {
    version = contexte.browser()?.version() ?? 'inconnue';
    journal = await garderOrigines(contexte, scenario.origines);
    if (o.trace) await contexte.tracing.start({ screenshots: true, snapshots: true });
    const compat = compatibilite(version, ref);
    console.log(`${scenario.titre} : ${jeux.length} jeu${jeux.length > 1 ? 'x' : ''}, ${scenario.etapes.length} étapes ; ${reglages.canal} ${version}`);
    if (compat.avertissement) console.log(`AVERTISSEMENT ${compat.avertissement}`);
    joues = await jouerScenario(contexte, {
      scenario, jeux, resultats, journal, delai: scenario.delai ?? reglages.delai ?? DELAI_DEFAUT, autoriserMutations: o.autoriserMutations,
      surEvenement: (ev) => {
        if (ev.type === 'jeu' && ev.plusieurs) console.log(`Jeu ${ev.jeu} : ${Object.entries(ev.valeurs).map(([k, v]) => `${k} = ${v}`).join(', ')}`);
        if (ev.type === 'main') console.log(`À VOUS : ${ev.message} — la suite reprend dès que ${ev.jusqua.url ? `l'adresse ${ev.jusqua.url} est atteinte` : 'l\'écran attendu apparaît'} (${ev.delai} s au plus).`);
        if (ev.type === 'fin-etape') {
          const e = ev.etape;
          const marque = { reussie: 'ok  ', echec: 'KO  ', non_jouee: '--  ' }[e.statut];
          console.log(`  ${marque}${String(e.numero).padStart(2)}. ${e.resume}${e.statut === 'echec' ? ` : ${e.message}` : ''}`);
        }
      },
    });
    if (o.trace) await contexte.tracing.stop({ path: join(resultats, 'trace.zip') });
  } finally {
    await contexte.close().catch(() => {});
  }
  const fin = new Date();
  const rapport = construireRapport({
    fichier: basename(fichier), scenario, empreinte: createHash('sha256').update(readFileSync(fichier)).digest('hex'), debut, fin,
    navigateur: { canal: reglages.canal, version, playwright_core: ref.playwrightCore, chromium_reference: ref.chromium, avertissement: compatibilite(version, ref).avertissement },
    options: { sans_tete: o.sansTete, ralenti: o.ralenti, trace: o.trace, mutations_autorisees: o.autoriserMutations, params: o.params, jeu: o.jeu },
    jeux: joues, journal,
  });
  ecrireRapport(resultats, rapport);
  const b = rapport.bilan;
  for (const x of rapport.origines_bloquees) console.log(`origine bloquée : ${x.origine} (${x.requetes} requête${x.requetes > 1 ? 's' : ''})`);
  console.log(`Bilan : ${rapport.statut === 'reussi' ? 'réussi' : 'échec'}, ${b.etapes} étapes, ${b.reussies} réussies, ${b.echecs} en échec, ${b.non_jouees} non jouées`);
  console.log(`Rapport : ${join(resultats, 'rapport.md')}`);
  return rapport.statut === 'reussi' ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (e) => { console.error(`ERREUR interne : ${e.stack ?? e}`); process.exitCode = 2; });
}
```

## 12. `scripts/verifier.mjs`

<!-- fichier : scripts/verifier.mjs -->
```javascript
#!/usr/bin/env node
// scenario-playwright 1.1.0 : vérifie des textes de départ et des scénarios TOML, sans ouvrir de navigateur.
//
// Usage : node <dossier du skill>/scripts/verifier.mjs <fichier.scenario | fichier.toml>... [--plan] [--param nom=valeur]...
// Un texte : sa structure (D2). Un scénario : sa validité, le contrôle de sa traduction s'il cite un texte,
// ses variables et ses fichiers (D3) ; --plan montre la traduction ligne du texte par ligne du texte, pour
// la ratification. Code 0 si tout est conforme, 2 sinon.
import { basename, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { decrireCible, estFragile } from './cibles.mjs';
import { lireScenario, planTraduction, preparerJeux } from './scenario.mjs';
import { estLocale } from './session.mjs';
import { analyserTexte } from './texte.mjs';

const USAGE = 'Usage : node scripts/verifier.mjs <fichier.scenario | fichier.toml>... [--plan] [--param nom=valeur]...';
const MARQUES = { creation: 'création', modification: 'modification', suppression: 'suppression', main: 'à la main' };

export function main(args) {
  const fichiers = [];
  const params = {};
  let plan = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--plan') plan = true;
    else if (a === '--param') {
      const m = /^([a-z][a-z0-9_]*)=(.*)$/s.exec(args[i + 1] ?? '');
      if (!m) { console.error(`ERREUR --param attend nom=valeur\n${USAGE}`); return 2; }
      params[m[1]] = m[2];
      i++;
    } else if (a.startsWith('-')) { console.error(`ERREUR option inconnue : ${a}\n${USAGE}`); return 2; }
    else fichiers.push(a);
  }
  if (fichiers.length === 0) { console.error(`ERREUR aucun fichier\n${USAGE}`); return 2; }
  let code = 0;
  for (const f of fichiers) {
    const nom = basename(f);
    if (/\.scenario$/i.test(f)) {
      let source;
      try { source = readFileSync(f, 'utf8'); } catch { console.log(`ERREUR ${nom} : fichier introuvable`); code = 2; continue; }
      const { scenario: t, erreurs } = analyserTexte(source);
      if (erreurs.length) { for (const e of erreurs) console.log(`ERREUR ${nom}, ligne ${e.ligne} : ${e.message}`); code = 2; continue; }
      const marques = t.etapes.filter((e) => e.marque).map((e) => `l.${e.ligne} ${MARQUES[e.marque]}`);
      console.log(`ok  ${nom} : « ${t.titre} », ${t.etapes.length} étape${t.etapes.length > 1 ? 's' : ''}${marques.length ? ` (${marques.join(', ')})` : ''}${t.jeux ? `, ${t.jeux.length} exemple${t.jeux.length > 1 ? 's' : ''}` : ''} ; empreinte ${t.empreinte}`);
      continue;
    }
    const { scenario, texte, erreurs, dossier } = lireScenario(resolve(f));
    if (!scenario) { for (const e of erreurs) console.log(`ERREUR ${nom} : ${e}`); code = 2; continue; }
    const { erreurs: erreursJeux } = preparerJeux(scenario, dossier, params);
    if (erreursJeux.length) { for (const e of erreursJeux) console.log(`ERREUR ${nom} : ${e}`); code = 2; continue; }
    console.log(`ok  ${nom} : « ${scenario.titre} », ${scenario.etapes.length} étapes${scenario.jeux ? `, ${scenario.jeux.length} jeux` : ''}${texte ? `, traduit de ${scenario.source}, empreinte conforme, traduction contrôlée` : ''}`);
    const mutations = scenario.etapes.flatMap((e, i) => (e.mutation ? [i + 1] : []));
    const distantes = scenario.origines.filter((o) => !estLocale(o));
    if (mutations.length) console.log(`note ${nom} : étapes qui modifient des données : ${mutations.join(', ')}${distantes.length ? ` ; origines hors du poste (${distantes.join(', ')}) : se joue avec --autoriser-mutations, après accord du développeur` : ''}`);
    if (scenario.etapes.some((e) => e.action === 'main')) console.log(`note ${nom} : étapes à la main : fenêtre visible nécessaire`);
    const fragiles = [...new Set(scenario.etapes.filter((e) => estFragile(e.cible)).map((e) => decrireCible(e.cible)))];
    if (fragiles.length) console.log(`note ${nom} : cibles fragiles : ${fragiles.join(' ; ')}`);
    if (plan) console.log(planTraduction(scenario, texte));
  }
  return code;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main(process.argv.slice(2));
```

## 13. `scripts/traduire.mjs`

<!-- fichier : scripts/traduire.mjs -->
```javascript
#!/usr/bin/env node
// scenario-playwright 1.1.0 : squelette TOML de la traduction d'un texte de départ, produit sans IA.
//
// Usage : node <dossier du skill>/scripts/traduire.mjs <fichier.scenario> [--remplacer]
// Écrit <fichier>.toml à côté du texte : structure recopiée du texte, empreinte du texte, et un bloc
// [[etapes]] par étape du texte, à compléter (D3.INV-5). Refuse d'écraser un scénario existant sans
// --remplacer. Code 0 si le squelette est écrit, 2 sinon.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { squeletteToml } from './scenario.mjs';
import { analyserTexte } from './texte.mjs';

const USAGE = 'Usage : node scripts/traduire.mjs <fichier.scenario> [--remplacer]';

export function main(args) {
  const remplacer = args.includes('--remplacer');
  const autres = args.filter((a) => a !== '--remplacer');
  if (autres.length !== 1 || autres[0].startsWith('-') || !/\.scenario$/i.test(autres[0])) { console.error(`ERREUR un fichier .scenario attendu\n${USAGE}`); return 2; }
  const fichier = autres[0];
  let source;
  try { source = readFileSync(fichier, 'utf8'); } catch { console.error(`ERREUR ${fichier} : fichier introuvable`); return 2; }
  const { scenario: texte, erreurs } = analyserTexte(source);
  if (erreurs.length) { for (const e of erreurs) console.error(`ERREUR ${basename(fichier)}, ligne ${e.ligne} : ${e.message}`); return 2; }
  const cible = join(dirname(fichier), basename(fichier).replace(/\.scenario$/i, '.toml'));
  if (existsSync(cible) && !remplacer) { console.error(`ERREUR ${cible} existe déjà : --remplacer pour l'écraser, après accord du développeur`); return 2; }
  writeFileSync(cible, squeletteToml(texte, basename(fichier)));
  const aCompleter = texte.etapes.length;
  console.log(`écrit : ${cible}`);
  console.log(`${aCompleter} étape${aCompleter > 1 ? 's' : ''} à compléter, une par ligne d'étape du texte ; puis node scripts/verifier.mjs ${basename(cible)} --plan, et la ratification.`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main(process.argv.slice(2));
```
