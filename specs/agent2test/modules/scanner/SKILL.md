---
name: scanner
description: Cartographie de l'application en lecture seule (routes Angular dont celles chargées à la demande, gabarits analysés par le compilateur Angular du projet, éléments interactifs avec rôle, nom accessible et identifiant de test, fragilités de ciblage, points d'API Spring appariés aux appels des services Angular, impact justifié d'un fichier modifié, état git de la racine à l'ouverture d'une campagne, scan incrémental par empreintes, relevé des écrans en marche par navigations seules). À implémenter au lot 3.
dimensions: [D5]
status: active
---

# Module `scanner` (D5)

Le `scanner` est le seul lecteur du code source de l'application. Il produit la carte applicative : ce qui existe, où, et comment l'atteindre. Il ne modifie rien.

## 1. Lecture confinée (D5.INV-1)

- La racine du projet de l'application vient du profil d'environnement. Le scanner résout chaque chemin par `realpath` et refuse, avec l'erreur `LECTURE_HORS_RACINE`, tout chemin qui en sort, y compris par lien symbolique.
- Il ouvre les fichiers en lecture seule et n'appelle aucune fonction d'écriture du système de fichiers.
- Il lit git en lecture seule, par quatre commandes et aucune autre : `git diff --name-only <plage>` et `git ls-files` pour les changements ; `git rev-parse HEAD` et `git status --porcelain --untracked-files=no` pour l'état de la racine à l'ouverture d'une campagne. Chacune est lancée avec `git --no-optional-locks`, pour que git ne réécrive pas son index au passage.

## 2. Scan statique du front

- Routes : les configurations de routes (`provideRouter`, `Routes`, `loadComponent`, `loadChildren`, gardes `canActivate`, `canMatch`), y compris les routes chargées à la demande, avec leur composant.
- Gabarits : analysés par le compilateur Angular du projet lui-même (`@angular/compiler` de son `node_modules`, fonction `parseTemplate`), qui comprend la syntaxe de contrôle `@if`, `@for` et `@switch`. TypeScript est lu par le paquet `typescript` du projet. Aucune dépendance n'est ajoutée à Agent2Test.
- Éléments interactifs : `button`, `a[href]`, `input`, `select`, `textarea`, éléments à rôle ARIA interactif. Pour chacun : rôle présumé, nom accessible (libellé associé, `aria-label`, `aria-labelledby`, texte, clé de traduction résolue dans les fichiers de traduction du profil), identifiant de test (attribut déclaré au profil, par exemple `data-testid`).
- Fragilités de ciblage : chaque élément interactif sans nom accessible y figure, avec son fichier et sa ligne (D5.INV-3).

## 3. Scan statique du back et appariement

- Points d'API : les classes `@RestController` ou `@Controller`, leur `@RequestMapping`, et les méthodes `@GetMapping`, `@PostMapping`, `@PutMapping`, `@PatchMapping`, `@DeleteMapping`, `@RequestMapping(method = …)`. Résultat : verbe, chemin complet, fichier, ligne.
- Appels du front : les appels `HttpClient` des services Angular (`get`, `post`, `put`, `patch`, `delete`, `request`), avec leur URL littérale ou gabarit.
- Appariement de chaque appel à un point d'API, avec la confiance `exacte`, `par motif` (variables de chemin) ou `non apparié`.

## 4. Impact (D5.INV-4)

`impact(changements)` rend, pour chaque fichier modifié, les écrans atteints et, pour chacun, le chemin qui le justifie :

```json
{ "fichier": "src/main/java/…/FeedbackExportController.java",
  "ecrans": [{ "route": "/retours", "chemin": ["FeedbackExportController.java", "GET /api/v1/feedbacks/export", "FeedbackService.exporter", "FeedbackListComponent", "/retours"] }] }
```

Un fichier du front mène directement au composant, puis aux routes qui l'affichent.

## 5. Scan incrémental (D5.INV-5)

Le scanner garde l'empreinte SHA-256 de chaque fichier analysé. Un second scan sans fichier modifié ne réanalyse aucun fichier et rend la carte en vigueur ; un fichier modifié est réanalysé seul, avec ce qui en dépend.

## 6. Relevé des écrans en marche (D5.INV-2)

- Le scanner demande au `navigateur` `instantane(url)` pour chaque écran impacté : navigation seule, jamais de clic, de saisie ni de soumission.
- Chaque écran relevé produit un instantané ARIA (`page.ariaSnapshotJSON()`, Playwright 1.63 ou plus récent) et une capture dont les zones sensibles du profil sont masquées.
- Tout écart entre deux relevés du même écran est signalé (`carte.ecart`).
- Le relevé s'arrête au budget de la configuration humaine (30 écrans par défaut) et liste les écrans non relevés.

## 7. Revue par le moteur, en option

Quand la configuration l'active, la fiche `scanner` propose un appariement pour les appels `non apparié`. La proposition est validée par schéma, marquée comme production du moteur, et ne remplace jamais un appariement `exacte`.

## 8. Actions et événements

| Action | Rôle |
|---|---|
| `scanner({ mode, portee })` | scan statique, complet ou incrémental ; `mode` : `statique`, `dynamique`, `complet` |
| `carte(filtre)` | carte en vigueur |
| `impact(changements)` | écrans atteints et chemins justificatifs |
| `etatGit()` | commit `HEAD` de la racine et fichiers suivis modifiés, chemins relatifs à la racine avec `/` pour séparateur ; appelé par le `plan` à l'ouverture d'une campagne |
| `configuration()` | éléments du projet utiles au profil d'environnement (URL de base, proxy, fichiers de traduction, attribut d'identifiant de test), chacun avec le fichier dont il vient |

Événements : `carte.mise_a_jour`, `carte.ecart`.

## 9. Pièges connus

- **Analyse du HTML par expressions régulières** : les blocs `@if` et `@for` la mettent en échec ; le compilateur du projet est la référence.
- **Clé de traduction non résolue** : le nom accessible est la clé, et l'élément est signalé fragile.
- **Relevé qui « explore »** : un clic pour ouvrir un menu est une action ; le relevé ne le fait pas.

## 10. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| CT1 | D5.INV-1 | un chemin `../secret.txt` et un lien symbolique vers l'extérieur sont refusés `LECTURE_HORS_RACINE` |
| CT2 | D5.INV-1 | après un scan complet, l'arborescence du projet de démonstration est identique, octet pour octet |
| CT3 | D5.INV-2 | le relevé d'un écran ne déclenche aucun clic, aucune saisie, aucune soumission (journal des actes du navigateur) |
| CT4 | D5.INV-3 | un bouton sans nom accessible figure dans les fragilités, avec fichier et ligne |
| CT5 | D5.INV-4 | un contrôleur Spring modifié mène à l'écran qui appelle son point d'API, avec le chemin complet |
| CT6 | D5.INV-5 | un second scan sans modification ne réanalyse aucun fichier ; une modification réanalyse ce seul fichier |
| CT7 | D5.INV-4 | une route `loadComponent` apparaît dans la carte avec son composant et ses gardes |
| CT8 | D5.INV-3 | un gabarit avec `@if`, `@for` et `@switch` est analysé sans erreur |
| CT9 | D5.INV-2 | le relevé s'arrête au budget et liste les écrans non relevés |
| CT10 | D5.INV-1 | `etatGit()` rend le commit `HEAD` et les fichiers suivis modifiés du projet de démonstration ; le journal des commandes ne montre aucune commande git hors des quatre permises |

## 11. Fichiers à produire

- `src/agents/scanner/agent.js`, `src/agents/scanner/confinement.js`
- `src/agents/scanner/front/{routes,gabarits,elements,traductions}.js`, `src/agents/scanner/back/controleurs.js`, `src/agents/scanner/appariement.js`
- `src/agents/scanner/impact.js`, `src/agents/scanner/empreintes.js`, `src/agents/scanner/releve.js`, `src/agents/scanner/git.js`
- `test/scanner/*.test.js`, `test/fixtures/appli/` (projet de démonstration Angular et Spring, sources seulement)
