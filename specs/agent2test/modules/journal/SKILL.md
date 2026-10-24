---
name: journal
description: Journal d'Agent2Test (lignes en ajout seul, protégées par des déclencheurs et chaînées par empreintes SHA-256, échelle et phase 7E sur chaque ligne, chaîne vérifiée à chaque démarrage, journal rompu mis de côté par commande humaine) et journal de tests d'une campagne (rubriques, matrice critères × verdicts, Markdown, JSON lu par agent-tdd-jira, JUnit XML pour GitLab CI, HTML accessible, marquage des productions du moteur, empreinte de fin de chaîne). À implémenter au lot 2.
dimensions: [D10]
status: active
---

# Module `journal` (D10)

`journal` consigne tout ce qui se passe, et projette le journal de tests d'une campagne. C'est le seul agent qui écrit le journal.

## 1. Ligne de journal (D10.INV-1)

```json
{
  "n": 1234,
  "horodatage": "2026-10-21T10:15:02.123Z",
  "specVersion": "1.2.0",
  "campagne": "C-20261021-001",
  "correlation": "8f2c…",
  "parent": "77a1…",
  "echelle": "Etape",
  "phase": "E3",
  "agent": "navigateur",
  "type": "etape.jouee",
  "charge": { "scenario": "ECR-77-S01", "etape": 4, "action": "cliquer", "resultat": "reussie" },
  "empreintePrecedente": "<sha256 de la ligne n - 1>",
  "empreinte": "<sha256>"
}
```

- `empreinte` est le SHA-256 de `empreintePrecedente` suivi du JSON canonique de la ligne sans son champ `empreinte`. La première ligne prend 64 zéros pour empreinte précédente.
- Chaque ligne porte `echelle` et `phase` (D1.INV-1).
- La charge passe par le masque du noyau avant écriture : ni session, ni jeton, ni en-tête sensible (D4.INV-3).
- La table `journal__lignes` porte deux déclencheurs qui refusent toute modification et toute suppression (module `donnees`, section 5).
- `ecrire` passe par le contrat chaîné `journal.ajouter` du médiateur : dans une même transaction `BEGIN IMMEDIATE`, il lit la dernière ligne et écrit la nouvelle. Le numéro `n` et l'empreinte précédente viennent du fichier, jamais d'une valeur gardée en mémoire, et deux écrivains, le kit et la purge, ne rompent pas la chaîne (module `donnees`, section 2).

`verifierChaine({ depuis, jusqua })` recalcule les empreintes et rend `{ intacte: true }` ou `{ intacte: false, premiereLigneRompue: n }`. Il détecte aussi une ligne supprimée, par la rupture du numéro `n`.

Au démarrage, `verifierChaine` parcourt la chaîne entière. Une chaîne rompue empêche le démarrage, avec la première ligne rompue, comme un déclencheur absent (module `donnees`, section 3). Pour repartir, un humain restaure le fichier de données depuis une sauvegarde (module `donnees`, section 7), ou met le journal de côté par `npm run journal:mettre-de-cote`. La commande écrit d'abord une copie cohérente du fichier, `journal-rompu-<date>.sqlite`, par `VACUUM INTO`, sans rien en effacer ; puis, en une transaction, elle recrée la table `journal__lignes` et ses déclencheurs, par l'instruction même de leur migration, et y écrit la première ligne du journal neuf, `journal.reprise`, qui cite cette copie, sa première ligne rompue et l'empreinte de sa dernière ligne.

## 2. Actions

| Action | Rôle |
|---|---|
| `ecrire(ligne)` | ajoute une ligne ; appelée par le bus pour chaque trace et chaque événement |
| `consulter(filtre)` | lit des lignes, filtrées par campagne, échelle, phase, agent, type |
| `rapport(campagne, format)` | projette le journal de tests : `markdown`, `json`, `junit`, `html` |
| `verifierChaine(intervalle)` | vérifie la chaîne |

## 3. Journal de tests (D10.INV-2 à D10.INV-4)

Une seule source, la projection JSON ; les trois autres formats en dérivent. Rubriques :

1. en-tête : demande, versions épinglées (spécification, plan, référentiel, empreinte de la constitution), moteur, opérateurs ;
2. sélection : paliers, motifs, scénarios écartés, trous de couverture ;
3. matrice critères × verdicts, pour tous les critères de la demande, trous compris ;
4. détail par scénario et par étape : action, cible, résultat, durée, preuve ;
5. causes présumées, décisions et désaccords humains ;
6. mesures du premier ordre de la campagne ;
7. mentions d'origine des productions du moteur ;
8. empreinte de fin de chaîne.

Format JSON, `agent2test.journal-de-tests/1`, celui que lit agent-tdd-jira (`agent-tdd-jira:D7.INV-3`) :

```json
{
  "format": "agent2test.journal-de-tests/1",
  "campagne": "C-20261021-001",
  "demande": { "cle": "ECR-77", "texte": "Export des retours d'expérience en CSV" },
  "versions": {
    "specification": "1.2.0", "plan": "P-14", "referentiel": "R-9", "constitution": "<sha256>",
    "sources": [{ "chemin": "docs/demandes/ECR-77/us.md", "empreinte": "<sha256>" }, { "chemin": "docs/demandes/ECR-77/ECR-77.feature", "empreinte": "<sha256>" }],
    "application": { "commit": "<sha1 de HEAD>", "fichiersModifies": [] }
  },
  "moteur": { "adaptateur": "externe", "nom": "gemini" },
  "selection": {
    "P1": ["ECR-77-S01", "ECR-77-S04"], "P2": [], "P3": ["socle/S-1.1"],
    "ecartes": [{ "scenario": "ECR-77-S02", "motif": "non jouable : limité au back" }, { "scenario": "ECR-77-S03", "motif": "non jouable : en attente de Q1" }],
    "trous": []
  },
  "matrice": [
    { "critere": "ECR-77-CA01", "verdict": "conforme", "scenarios": ["ECR-77-S01"], "preuves": ["<sha256>"] },
    { "critere": "ECR-77-CA02", "verdict": "non vérifié", "motif": "non jouable : limité au back" },
    { "critere": "ECR-77-CA03", "verdict": "non vérifié", "motif": "non jouable : en attente de Q1" },
    { "critere": "ECR-77-CA04", "verdict": "non conforme", "scenarios": ["ECR-77-S04"], "cause": "DEFAUT_APPLICATIF", "preuves": ["<sha256>"] }
  ],
  "scenarios": [
    { "id": "ECR-77-S01", "statut": "réussi", "etapes": [{ "n": 5, "action": "verifier", "statut": "réussie", "preuve": "preuves/C-20261021-001/ECR-77-S01/5.png" }] },
    { "id": "socle/S-1.1", "statut": "réussi", "etapes": [{ "n": 2, "action": "verifier", "statut": "réussie", "preuve": "preuves/C-20261021-001/socle-S-1.1/2.png" }] },
    { "id": "ECR-77-S04", "statut": "échoué", "cause": "DEFAUT_APPLICATIF", "signaux": ["cible résolue", "action jouée", "assertion contredite"],
      "etapes": [{ "n": 3, "action": "verifier", "statut": "échouée", "preuve": "preuves/C-20261021-001/ECR-77-S04/3.png" }],
      "trace": "preuves/C-20261021-001/ECR-77-S04/trace.zip" }
  ],
  "decisions": [{ "point": "CP-3", "cible": "ECR-77-S04", "auteur": "testeur", "canal": "tableau-de-bord", "date": "2026-10-21T10:40:00Z", "decision": "confirmer", "commentaire": "le bouton reste actif" }],
  "desaccords": [],
  "mesures": { "dureeMinutes": 6, "couvertureCriteres": 0.5 },
  "origineIA": [{ "element": "parcours P/ECR-77-S04, version 1", "moteur": "gemini", "fiche": "preparateur@1.0.0+L2", "empreintePrompt": "<sha256>", "ratifiePar": "testeur" }],
  "empreinteFin": "<sha256>"
}
```

Règles :

- La matrice a une ligne par critère de la demande. Un critère sans scénario jouable est « non vérifié », avec son motif : trou de couverture, non jouable, non sélectionné.
- `versions.sources` reprend les sources du plan figé, chemin et empreinte (module `plan`, section 3) ; `versions.application` reprend l'état git de la racine relevé à l'ouverture : `commit` et `fichiersModifies`.
- Chaque décision et chaque désaccord nomment leur `cible` : scénario, critère ou parcours. Un désaccord porte aussi son auteur, la cause ou le statut proposé (`proposition`), son commentaire et sa date (module `verdict`, section 4).
- JUnit XML : une suite par campagne, un cas par scénario joué (`name` : identifiant et titre), un `<failure>` par scénario échoué avec sa cause et le critère contredit, un `<skipped>` par scénario non joué avec son motif. GitLab CI le lit tel quel dans son rapport de tests.
- Markdown : les rubriques dans l'ordre, la matrice en tableau. HTML : la même chose, conforme aux règles d'accessibilité du module `tableau-de-bord`.
- Tout contenu produit par le moteur (motif de sélection, parcours, réparation, leçon) est marqué « produit par <moteur>, fiche <fiche> » et figure dans `origineIA` (D10.INV-3).
- `empreinteFin` est l'empreinte de la ligne `campagne.close` ; un journal de tests produit avant la clôture porte la mention « provisoire » et aucune empreinte de fin (D10.INV-4).
- Les fichiers produits vont dans `rapports/<campagne>/journal-de-tests.{md,json,xml,html}`.
- **Contrat de lecture** : agent-tdd-jira 1.3.2 lit ce JSON pour reporter un verdict par critère et corriger les défauts confirmés (`agent-tdd-jira:D7.INV-3`). Il s'appuie sur `format`, `campagne`, `demande.cle`, `versions.plan`, `versions.sources`, `versions.application`, `matrice` (critère, verdict de la liste fermée, motif, scénarios), `scenarios` (identifiant, cause, étapes), `decisions` et `desaccords` avec leur cible, et `empreinteFin`. Changer le sens ou la forme de l'un de ces champs change le format, donc son nom (`agent2test.journal-de-tests/2`).

## 4. Pièges connus

- **Horloge relue au rejeu** : l'horodatage est écrit une fois ; la vérification ne relit jamais l'horloge.
- **Empreinte sur un JSON non canonique** : l'ordre des clés change l'empreinte ; le JSON canonique trie les clés.
- **Matrice limitée aux scénarios joués** : elle porte tous les critères de la demande.
- **Dernière empreinte gardée en mémoire** : un second écrivain, la purge par exemple, ferait diverger la chaîne ; la dernière ligne se relit dans la transaction d'écriture.

## 5. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| JO1 | D10.INV-1 | trois lignes écrites forment une chaîne intacte ; chaque ligne porte échelle et phase |
| JO2 | D10.INV-1 | une ligne modifiée par un outil SQLite, déclencheurs retirés puis remis, empêche le démarrage suivant, et `premiereLigneRompue` la nomme |
| JO3 | D10.INV-1 | une ligne supprimée par un outil SQLite, déclencheurs retirés puis remis, est détectée par la rupture de `n` |
| JO4 | D10.INV-2 | les quatre formats sortent de la même projection : mêmes critères, mêmes verdicts, mêmes causes |
| JO5 | D10.INV-2 | un critère sans scénario figure dans la matrice, « non vérifié », motif « trou de couverture » |
| JO6 | D10.INV-2 | le JUnit XML d'une campagne à un échec et un scénario non joué contient un `<failure>` avec sa cause et un `<skipped>` avec son motif |
| JO7 | D10.INV-3 | un parcours produit par le moteur apparaît dans `origineIA` et porte la mention dans le Markdown |
| JO8 | D10.INV-4 | `empreinteFin` égale l'empreinte de la ligne `campagne.close` ; avant la clôture, le rapport est « provisoire » |
| JO9 | D10.INV-2 | le JSON de l'exemple ECR-77 porte les sources du plan et leurs empreintes, l'état git relevé à l'ouverture, et la cible de chaque décision et de chaque désaccord ; il se valide contre `schemas/journal-de-tests.json` |
| JO10 | D10.INV-1 | un `UPDATE` ou un `DELETE`, sans condition compris, sur `lignes` lève « ajout seul », par la connexion du journal comme par un outil SQLite ; un déclencheur retiré empêche le démarrage |
| JO11 | D10.INV-1 | après une chaîne rompue, `npm run journal:mettre-de-cote` permet le démarrage ; la copie garde le journal rompu entier, la table neuve a ses deux déclencheurs, et la première ligne du journal neuf cite la copie, sa première ligne rompue et l'empreinte de sa dernière ligne |

## 6. Fichiers à produire

- `src/agents/journal/agent.js`, `src/agents/journal/chaine.js`
- `src/agents/journal/projection.js`, `src/agents/journal/formats/{markdown,json,junit,html}.js`
- `schemas/journal-de-tests.json`
- `scripts/mettre-de-cote-journal.js`
- `test/journal/*.test.js`
