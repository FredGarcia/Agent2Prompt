---
name: journal
description: Journal d'Agent2Dev et livrable de demande (lignes en ajout seul chaînées par empreintes SHA-256, version de spécification, échelle et phase 7E sur chaque ligne, arbre de la demande au pas, vérification de la chaîne au démarrage et avant chaque livrable, origine de chaque production du moteur rattachée à sa décision, livrable en JSON et en Markdown projeté d'une seule source, provisoire avant la clôture, empreinte de fin de chaîne). À implémenter au lot 2.
dimensions: [D13]
status: active
---

# Module `journal` (D13)

`journal` consigne tout ce qui se passe dans une instance, et projette le livrable de chaque demande. C'est le seul agent qui écrit le journal ; il suit la forme du journal d'Agent2Test, sans en partager le code.

## 1. Ligne de journal (D13.INV-1, D13.INV-2)

```json
{
  "n": 2041,
  "horodatage": "2026-10-21T14:02:11.482Z",
  "specVersion": "1.0.0",
  "instance": "principale",
  "demande": "ECR-77",
  "correlation": "5d1e…",
  "parent": "9b07…",
  "echelle": "Pas",
  "phase": "E3",
  "agent": "executant",
  "type": "commande.executee",
  "charge": { "scenario": "ECR-77-S02", "pas": "rouge", "commande": "tester-scenario-back", "arbre": "copie", "code": 1, "nature": "assertion" },
  "empreintePrecedente": "<sha256 de la ligne n - 1>",
  "empreinte": "<sha256>"
}
```

- `empreinte` est le SHA-256 de `empreintePrecedente` suivi du JSON canonique de la ligne sans son champ `empreinte`. La première ligne prend 64 zéros pour empreinte précédente.
- Chaque ligne porte la version de spécification qui l'a produite, son échelle (`Systeme`, `Demande`, `Scenario`, `Pas`) et sa phase (`E1` à `E7`) : une demande se relit comme un arbre 7E, de la demande au pas.
- La charge passe par le masque du noyau avant écriture : aucun secret, aucun jeton, aucun contenu de fichier exclu.
- La ligne s'écrit dans une transaction du fichier SQLite du `journal` ; deux déclencheurs y refusent `UPDATE` et `DELETE` (module `donnees`, section 3).

`verifierChaine({ depuis, jusqua })` recalcule les empreintes et rend `{ intacte: true }` ou `{ intacte: false, premiereLigneRompue: n }`. Il détecte aussi une ligne supprimée, par la rupture du numéro `n`. La chaîne est vérifiée au démarrage et avant chaque livrable : une rupture lève l'alerte critique `journal.chaine_rompue`, et le livrable porte la mention « chaîne rompue à la ligne n ».

## 2. Actions

| Action | Rôle |
|---|---|
| `ecrire(ligne)` | ajoute une ligne ; appelée par le bus pour chaque trace et chaque événement |
| `consulter(filtre)` | lit des lignes, filtrées par demande, scénario, échelle, phase, agent, type |
| `arbre(demande)` | rend l'arbre 7E de la demande : demande, scénarios, pas, avec leurs phases |
| `livrable(demande, format)` | projette le livrable : `json` ou `markdown` |
| `verifierChaine(intervalle)` | vérifie la chaîne |

## 3. Productions du moteur (D13.INV-4)

Chaque sortie du moteur reçoit un identifiant, `P-<n>`. Sa ligne, de type `moteur.production`, porte l'adaptateur et le nom du moteur, la fiche et sa version composée (module `methode`, section 4), l'empreinte du prompt rendu, celle du texte reçu, et le résultat de la validation.

La décision qui l'a validée s'y rattache par une ligne `production.decidee`, qui cite la production et la décision : la décision V du point qui a présenté la production, ou, pour une sortie refusée par le validateur, ce refus. Une production n'est jamais consommée sans validation (D1.INV-3) ; au livrable, chacune paraît avec sa décision.

## 4. Livrable de demande (D13.INV-3)

Une seule source, la projection JSON, de format `agent2dev.livrable/1` ; le Markdown en dérive. Rubriques :

1. en-tête : clé, titre, empreinte du fichier MHTML, instance, versions épinglées (spécification, skill et empreinte de sa transmission, référentiel `R-<n>`, constitution), moteur, autorisations (écriture du code, moteur externe), mode, arbre de la demande (chemin, branche, commit de départ) ;
2. profil : version ratifiée, écarts de versions et réponses ;
3. points, attentes et décisions : cible, décision, auteur, canal, date, commentaire ;
4. scénarios : pas par pas, avec le message du rouge, les essais consommés, les suites, le commit et, en copie de travail, le patch ;
5. acceptation : remises, campagnes lues, lignes du script, corrections ;
6. matrice, rapport et projet de commentaire Jira (module `tracabilite`) ;
7. productions du moteur, avec leur décision ;
8. ligne de base, régressions, écritures étrangères intégrées, budgets consommés ;
9. empreinte de fin de chaîne.

```json
{
  "format": "agent2dev.livrable/1",
  "demande": { "cle": "ECR-77", "titre": "Export des retours d'expérience en CSV", "source": "<sha256 du MHTML>" },
  "versions": { "specification": "1.0.0", "skill": "agent-tdd-jira 1.3.1", "transmission": "<sha256>", "referentiel": "R-4", "constitution": "<sha256>" },
  "autorisations": { "ecritureCode": false, "moteurExterne": true },
  "arbre": { "mode": "normal", "branche": "feature/ECR-77-export-csv", "commitDepart": "<sha1>" },
  "scenarios": [
    { "id": "ECR-77-S02", "statut": "accepté", "rouge": "Expecting actual: [] to start with: [-17, -69, -65]", "essais": { "rouge": 1, "vert": 2 },
      "suites": { "back": "vert", "front": "non concerné" }, "patch": "002-S02.patch", "commit": "<sha1 dans l'arbre de la demande>" }
  ],
  "productions": [{ "id": "P-12", "fiche": "vert@1.0.0+agent-tdd-jira@1.3.1+L1", "moteur": "gemini", "adaptateur": "externe", "empreintePrompt": "<sha256>", "decision": "DEC-118" }],
  "empreinteFin": "<sha256>"
}
```

- Le livrable va dans `<sortie>/<CLÉ>/livrable.json` et `livrable.md`.
- `empreinteFin` est l'empreinte de la ligne `demande.close` ; un livrable rendu avant la clôture porte la mention « provisoire » et aucune empreinte de fin.
- Le Markdown reprend les rubriques dans l'ordre, la matrice en tableau, et marque chaque contenu rédigé par le moteur « produit par <moteur>, fiche <fiche> ».

## 5. Pièges connus

- **Horloge relue au rejeu** : l'horodatage est écrit une fois ; la vérification ne relit jamais l'horloge.
- **Empreinte sur un JSON non canonique** : l'ordre des clés change l'empreinte ; le JSON canonique trie les clés.
- **Ligne corrigée après coup** : on ajoute une ligne, on n'en réécrit jamais ; une décision rattachée plus tard à une production est une ligne nouvelle.
- **Sortie de commande complète** : seule la sortie bornée et masquée entre au journal (module `executant`, section 3).

## 6. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| JO1 | D13.INV-1 | trois lignes écrites forment une chaîne intacte ; chaque ligne porte sa version de spécification |
| JO2 | D13.INV-1 | une ligne modifiée à la main par un outil SQLite, déclencheurs retirés, est détectée, et `premiereLigneRompue` la nomme |
| JO3 | D13.INV-1 | une ligne supprimée est détectée par la rupture de `n` ; au démarrage, l'alerte `journal.chaine_rompue` part |
| JO4 | D13.INV-2 | chaque ligne d'une demande simulée porte échelle et phase ; `arbre(demande)` la reconstruit de la demande au pas |
| JO5 | D13.INV-3 | le livrable JSON et le livrable Markdown sortent de la même projection : mêmes scénarios, mêmes décisions, mêmes verdicts |
| JO6 | D13.INV-3 | avant `demande.close`, le livrable est « provisoire » ; après, `empreinteFin` égale l'empreinte de la ligne de clôture |
| JO7 | D13.INV-4 | chaque production du moteur du livrable porte adaptateur, moteur, fiche, version composée, empreinte du prompt et décision |
| JO8 | D13.INV-4 | une sortie refusée par le validateur garde sa ligne `moteur.production`, rattachée à son refus |

## 7. Fichiers à produire

- `src/agents/journal/agent.js`, `src/agents/journal/chaine.js`, `src/agents/journal/arbre.js`
- `src/agents/journal/livrable.js`, `src/agents/journal/formats/{json,markdown}.js`
- `schemas/ligne-journal.json`, `schemas/livrable.json`
- `test/journal/*.test.js`
