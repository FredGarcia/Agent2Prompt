---
name: executant
description: Seul exécutant des commandes du projet (liste fermée des commandes du profil ratifié et des trois scripts du skill, répertoire de chaque commande dans l'arbre de travail ou, pour les scripts qui lisent, dans l'arbre de la demande, vecteurs d'arguments sans shell, substitutions validées par motif, environnement réduit, délais et arrêt de toute l'arborescence, refus du démarrage et du déploiement de l'application et des batchs, sorties masquées et bornées, échecs structurés lus dans les rapports JUnit et dans la sortie, nature de chaque échec, ligne de base de la demande, régressions après une mise à jour de la copie). À implémenter au lot 3.
dimensions: [D6]
status: active
---

# Module `executant` (D6)

L'`executant` remplace l'`exploitant` de l'étape 1, sans son option B : il compile, lance les tests et les scripts du skill, et rien d'autre. Il ne démarre, n'arrête ni ne déploie l'application, et ne lance aucun batch : c'est le développeur qui le fait (`agent-tdd-jira:D7.INV-4`).

## 1. Liste fermée (D6.INV-1, D6.INV-2)

| Nom | Origine | Exemple |
|---|---|---|
| `compiler-back`, `tester-back`, `tester-scenario-back` | profil ratifié | `./mvnw -q -Dgroups={scenario} test` |
| `installer-front` | profil ratifié, s'il y a un front | `npm ci --prefer-offline --no-audit --no-fund` |
| `compiler-front`, `tester-front`, `tester-scenario-front`, `linter-front` | profil ratifié | `npx ng test --watch=false --include={fichiersTest}` |
| `regenerer-contrat` | profil ratifié, s'il existe | `./mvnw -q generate-sources` |
| `extraire-jira` | script du skill | `node <outils>/extraire-jira.mjs <demande.mhtml> --sortie <travail>/demande.json --images <travail>/images` |
| `controler-criteres` | script du skill | `node <outils>/controler-criteres.mjs docs/demandes/<CLÉ> [--depuis <commit>]` |
| `lire-acceptation` | script du skill | `node <outils>/lire-acceptation.mjs docs/demandes/<CLÉ> <journal>` |

Les commandes git du `depot` sont l'autre partie de la liste fermée (module `depot`, section 5) ; elles suivent les mêmes règles d'exécution.

- Une commande s'exécute par `execFile`, jamais par un shell : `{ shell: false }`, le programme en premier élément du vecteur. Les scripts du skill s'exécutent avec le Node d'Agent2Dev (`process.execPath`), après vérification de leur empreinte (module `methode`, section 5).
- Les seuls emplacements substitués sont `{scenario}`, validé par le motif `^[A-Z][A-Z0-9_]+-\d+-S\d{2,}(#\d+)?$`, `{fichiersTest}`, des chemins de tests sous la racine de l'arbre de travail que le `depot` a écrits pour le scénario, et, pour les scripts, des chemins sous la racine de l'arbre ou sous les données d'Agent2Dev, et un commit relevé par le `depot`. Aucune valeur produite par le moteur n'entre dans un vecteur d'arguments.
- Le contrôle des programmes et arguments interdits de la constitution s'applique encore à l'exécution, même sur un profil ratifié : une commande qui démarrerait l'application, la déploierait ou lancerait un batch est refusée `COMMANDE_INTERDITE`, et le refus est présenté au développeur.
- L'environnement transmis est réduit : `PATH`, `HOME`, `LANG`, `JAVA_HOME`, `MAVEN_OPTS`, `CHROME_BIN` et les variables que le profil déclare, plus `HUSKY=0`, qui empêche Husky de réécrire `core.hooksPath` pendant `installer-front`, comme le recommande le kit `agents-paralleles-gitlab`, et `GIT_OPTIONAL_LOCKS=0`, qui empêche git de réécrire l'index quand un script relève l'état. Aucun jeton ni secret d'Agent2Dev n'y figure.
- Chaque commande a son délai (profil). Au-delà, l'`executant` arrête toute l'arborescence des processus lancés, `SIGTERM` puis `SIGKILL` après 10 secondes, et rend `DELAI_DEPASSE`.

## 2. Répertoires (D6.INV-1)

| Commande | Répertoire |
|---|---|
| commandes du profil | l'arbre de travail, sous le `cwd` que le profil leur donne (`back`, `front`) |
| `extraire-jira` | le dossier de travail de la demande (module `depot`, section 1) |
| `controler-criteres` | la racine de l'arbre de travail ; à la remise et avant V5, celle de l'arbre de la demande, qui porte les patchs appliqués |
| `lire-acceptation` | la racine de l'arbre de la demande, où se trouve le commit de la campagne |

Sans autorisation d'écrire le code, rien d'autre ne s'exécute dans l'arbre de la demande : ni compilation, ni test, ni installation. Les deux scripts qui s'y exécutent ne font que lire, et leurs commandes git ne réécrivent pas l'index.

## 3. Résultat (D6.INV-3)

```json
{
  "commande": "tester-scenario-back",
  "arbre": "copie",
  "argv": ["./mvnw", "-q", "-Dgroups=ECR-77-S02", "test"],
  "code": 1,
  "dureeMs": 48210,
  "echecs": [
    { "nature": "assertion", "test": "FeedbackCsvTest.exportCommenceParLeBomEtUtiliseLePointVirgule",
      "fichier": "back/src/test/java/fr/exemple/feedback/FeedbackCsvTest.java", "ligne": 42,
      "message": "Expecting actual: [] to start with: [-17, -69, -65]" }
  ],
  "sortieBornee": "…",
  "empreinteSortie": "<sha256>"
}
```

- **Masquage** : la sortie passe par le masque du noyau (valeurs de `password`, `secret`, `token`, en-têtes `Authorization`, clés privées) avant d'être journalisée, présentée ou transmise au moteur.
- **Borne** : la sortie gardée en clair se limite aux 2 000 premiers et aux 20 000 derniers caractères ; l'empreinte porte sur la sortie complète, masquée.
- **Échecs structurés** : pour le back, les rapports JUnit XML de Surefire (`target/surefire-reports/*.xml`) sont lus en priorité, puis la sortie de Maven pour les erreurs de compilation (`[ERROR] <fichier>:[ligne,colonne] …`) ; pour le front, la sortie de l'exécuteur de tests (Karma et Jasmine, ou Jest) et les erreurs TypeScript (`error TS…`, fichier et ligne).
- **Nature d'un échec** :

| Nature | Signal | Ce qu'en fait le `realisation` |
|---|---|---|
| `assertion` | échec d'assertion : `AssertionFailedError`, `AssertionError`, `Expected … to be …`, `expect(…).toBe(…)` | rouge valable, si le test porte l'étiquette du scénario |
| `compilation` | erreur du compilateur Java ou TypeScript | pas de rouge valable : signature minimale, puis nouvel essai (skill, `cycle-tdd`, section 3) |
| `erreur` | exception hors assertion, configuration, contexte Spring qui ne démarre pas | pas de rouge valable : écart rendu au moteur |
| `delai` | délai dépassé | écart présenté au développeur |

## 4. Ligne de base et régressions (D6.INV-4)

Avant le premier scénario d'une demande, l'`executant` lance `tester-back` et `tester-front` une fois dans l'arbre de travail, sur l'état du projet à l'entrée de la demande. Les tests en échec forment la ligne de base : ils ne sont imputés à aucun scénario, ne bloquent pas un vert, et figurent au rapport final avec la mention « échec antérieur à la demande ». Un test de la ligne de base qui devient vert pendant la demande est signalé ; un test qui passe au rouge est imputé au scénario en cours.

Après une mise à jour de la copie qui change son arbre (module `depot`, section 2), les suites sont relancées avant la suite du travail : un test qui passe alors au rouge est une régression venue de l'arbre de la demande. Elle est signalée au développeur, n'est imputée à aucun scénario, et rien ne reprend avant sa décision (`agent-tdd-jira:D9.INV-7`).

## 5. Pièges connus

- **`.cmd` sous Windows** : ils exigent un shell ; Agent2Dev s'exécute sous WSL2 (module `profil`, section 4).
- **Lire le seul code de retour** : `mvn` rend 1 pour une compilation ratée comme pour un test rouge ; seule la nature de l'échec dit si le rouge est valable.
- **Processus orphelins** : un navigateur sans tête lancé par Karma survit à son parent ; l'arrêt vise l'arborescence entière.
- **Substitution d'un texte du moteur** : un nom de test proposé par le moteur ne va jamais dans un argument ; on sélectionne par étiquette de scénario ou par chemin de fichier écrit par le `depot`.
- **`npm ci` hors ligne** : `--prefer-offline` s'appuie sur le cache du développeur ; un paquet absent du cache est demandé au registre que le développeur a configuré, comme pour son propre `npm ci`.

## 6. Tests (scénarios)

Les tests s'appuient sur des outils simulés du projet de démonstration (`test/fixtures/projet/outils-simules/`) : des scripts Node qui imitent `mvnw`, `npm` et `ng`, sorties et rapports Surefire compris, selon un fichier de scénario.

| Scénario | Vérifie | Cas |
|---|---|---|
| EX1 | D6.INV-1 | une commande absente du profil est refusée ; une commande du profil s'exécute sans shell, avec son répertoire |
| EX2 | D6.INV-1 | `{scenario}` qui vaut `ECR-77-S01; rm -rf /` est refusé par le motif ; aucun texte du moteur n'entre dans un argument |
| EX3 | D6.INV-1 | un script du skill dont l'empreinte a changé depuis son extraction n'est pas lancé |
| EX4 | D6.INV-2 | `./mvnw spring-boot:run` ajouté à la main au profil ratifié est refusé `COMMANDE_INTERDITE` à l'exécution |
| EX5 | D6.INV-3 | une sortie qui contient `password=secret` et un en-tête `Authorization` est masquée dans le journal et dans le message au moteur |
| EX6 | D6.INV-3 | un rapport Surefire en échec d'assertion donne `nature: assertion`, test, fichier, ligne et message ; une erreur `cannot find symbol` donne `compilation` |
| EX7 | D6.INV-3 | un échec Karma `Expected false to be true.` donne `assertion`, avec fichier et ligne du test |
| EX8 | D6.INV-3 | une commande qui dépasse son délai est arrêtée avec ses processus enfants et rend `DELAI_DEPASSE` |
| EX9 | D6.INV-4 | un test en échec avant la demande entre dans la ligne de base, ne bloque pas un vert et figure au rapport |
| EX10 | D6.INV-4 | un test qui passe au rouge pendant la demande est imputé au scénario en cours |
| EX11 | D6.INV-1 | sans autorisation d'écrire le code, `tester-back` demandé dans l'arbre de la demande est refusé ; `controler-criteres` et `lire-acceptation` y sont lancés, et l'arbre reste identique |
| EX12 | D6.INV-1 | l'environnement d'`installer-front` porte `HUSKY=0` et `GIT_OPTIONAL_LOCKS=0`, et aucune variable des secrets d'Agent2Dev |
| EX13 | D6.INV-4 | un test qui passe au rouge après une mise à jour de la copie est présenté comme régression, sans être imputé à un scénario |

## 7. Fichiers à produire

- `src/agents/executant/agent.js`, `src/agents/executant/commandes.js`, `src/agents/executant/processus.js`, `src/agents/executant/repertoires.js`
- `src/agents/executant/lecteurs/{surefire,maven,karma,jest,typescript}.js`, `src/agents/executant/ligne-de-base.js`
- `schemas/resultat-commande.json`
- `test/executant/*.test.js`, `test/fixtures/projet/outils-simules/`
