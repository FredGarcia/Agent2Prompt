---
name: profil
description: Profil du projet de l'application et point V0 (proposition à partir des fichiers de construction avec la source de chaque valeur, versions réelles comparées aux cibles du skill, mode d'authentification, liste fermée des commandes en vecteurs d'arguments, fichiers exclus et protégés, fichiers locaux de la copie de travail, empreintes des fichiers de construction, ratification par le développeur, refus de toute commande de démarrage, de déploiement ou de batch, plateforme d'exécution). À implémenter au lot 3.
dimensions: [D4]
status: active
---

# Module `profil` (D4)

Le profil décrit le projet de l'application tel qu'Agent2Dev le traite : où il est, ce qu'il contient, quelles commandes vérifient le code. C'est l'étape « démarrage » du skill, formalisée : le skill demande l'accès au code, ses versions réelles et le mode d'authentification avant toute réalisation ; Agent2Dev les relève lui-même, et le développeur les valide en V0. Le profil appartient au développeur : le module le propose, le développeur le ratifie, et aucun agent ne l'écrit ensuite (D1.INV-6).

## 1. Quand V0 s'ouvre (D4.INV-1)

- À la première demande d'un projet, avant toute commande dans ce projet.
- Au début d'une demande, si l'empreinte d'un fichier de construction diffère de celle du profil ratifié : `pom.xml`, `mvnw`, `package.json`, `package-lock.json`, `angular.json`, le changelog maître de Liquibase.
- Sur demande du développeur, depuis le tableau de bord.

Les modifications qu'une demande fait elle-même, validées en cours de route (module `depot`, section 6), ne rouvrent pas V0 pendant cette demande ; elles le rouvrent à la suivante, si le développeur les a gardées.

## 2. Proposition (D4.INV-2, D4.INV-3)

`profil.proposer(racine)` lit, en lecture seule, par les recherches du `depot` :

| Valeur | Lue dans |
|---|---|
| version de Java | `pom.xml` (`maven.compiler.release`, `java.version`) |
| version de Spring Boot | `pom.xml` (parent `spring-boot-starter-parent`, ou nomenclature importée) |
| outil de migration | `pom.xml` et changelog Liquibase, ou scripts Flyway |
| version d'Angular | `package.json` (`@angular/core`) |
| outil de tests du front | `angular.json` (cible `test`), `package.json` (Karma ou Jest) |
| contrat d'API et sa génération | `api/openapi.yaml`, extension `openapi-generator` du `pom.xml` ou script du `package.json` |
| branche de base | configuration git du dépôt, à confirmer |
| fichiers locaux de la copie de travail | aucun par défaut ; le développeur en ajoute en V0, chacun par son chemin dans le projet |

Chaque valeur cite son fichier et sa ligne ; une valeur introuvable porte la marque « à renseigner ». Le mode d'authentification de l'application (jeton porteur ou cookie de session) ne se lit pas toujours dans le code : il est proposé s'il se déduit d'un intercepteur ou de la configuration de sécurité, avec sa source, et sinon demandé.

Les versions réelles sont comparées aux cibles du skill, données à la section 3 de son point d'entrée : Java 21, Spring Boot 3.5, Angular 20. Chaque écart est présenté en V0 avec la question « comment procéder ? » ; le développeur répond, et sa réponse est consignée au profil.

```json
{
  "projet": { "nom": "cockpit-ca", "racine": "/home/fred/projets/cockpit-ca", "brancheDeBase": "develop", "mode": "normal" },
  "versions": {
    "java": { "valeur": "21", "source": "back/pom.xml:18", "cible": "21" },
    "springBoot": { "valeur": "3.5.6", "source": "back/pom.xml:9", "cible": "3.5" },
    "angular": { "valeur": "20.3.1", "source": "front/package.json:14", "cible": "20" }
  },
  "migrations": { "outil": "liquibase", "source": "back/src/main/resources/db/changelog/db.changelog-master.yaml" },
  "front": { "outilTests": "karma", "source": "front/angular.json:72" },
  "authentification": { "valeur": "à renseigner", "options": ["jeton porteur", "cookie de session"] },
  "commandes": {
    "compiler-back": { "argv": ["./mvnw", "-q", "-DskipTests", "compile"], "cwd": "back", "delaiS": 600, "source": "back/mvnw" },
    "tester-back": { "argv": ["./mvnw", "-q", "verify"], "cwd": "back", "delaiS": 1800, "source": "back/pom.xml" },
    "tester-scenario-back": { "argv": ["./mvnw", "-q", "-Dgroups={scenario}", "test"], "cwd": "back", "delaiS": 900, "source": "back/pom.xml" },
    "installer-front": { "argv": ["npm", "ci", "--prefer-offline", "--no-audit", "--no-fund"], "cwd": "front", "delaiS": 1200, "source": "front/package-lock.json" },
    "compiler-front": { "argv": ["npx", "ng", "build", "--configuration", "development"], "cwd": "front", "delaiS": 900, "source": "front/angular.json" },
    "tester-front": { "argv": ["npx", "ng", "test", "--watch=false", "--browsers=ChromeHeadless"], "cwd": "front", "delaiS": 1200, "source": "front/package.json:9" },
    "tester-scenario-front": { "argv": ["npx", "ng", "test", "--watch=false", "--browsers=ChromeHeadless", "--include={fichiersTest}"], "cwd": "front", "delaiS": 900, "source": "front/angular.json:72" },
    "linter-front": { "argv": ["npx", "ng", "lint"], "cwd": "front", "delaiS": 600, "source": "front/angular.json:80" }
  },
  "copie": { "fichiersLocaux": [] },
  "exclusions": ["**/.env*", "**/*secret*", "**/*.pem", "**/*.key", "**/*.p12", "**/*.jks"],
  "proteges": [".git/**", ".gitlab-ci.yml", ".githooks/**", "regles-gitlab.txt"],
  "empreintes": { "back/pom.xml": "<sha256>", "front/package.json": "<sha256>", "front/angular.json": "<sha256>" }
}
```

- `mode` vaut `normal` ou `parallele` : en mode parallèle, la racine est le worktree que le kit a créé pour la demande, et les règles du module `parallele` du skill s'ajoutent (module `depot`).
- Les noms de commandes forment la liste fermée de la constitution. Une commande sans objet dans le projet (pas de contrat généré, par exemple) est absente, jamais inventée.
- `installer-front` installe les dépendances du front dans la copie de travail, qui n'a pas de `node_modules` (module `depot`, section 2). Avec l'autorisation d'écrire le code, elle ne sert que si le développeur la demande.
- `copie.fichiersLocaux` liste les fichiers non suivis que les tests exigent, recopiés dans la copie de travail. Un fichier exclu comme secret ne peut pas y figurer.
- Les seuls emplacements substitués sont `{scenario}`, un identifiant de scénario validé par motif, et `{fichiersTest}`, des chemins de fichiers de test sous la racine (D6.INV-1, module `executant`).

## 3. Commandes refusées (D4.INV-4)

Une commande dont le programme figure dans `commandes.programmesInterdits` de la constitution, ou dont un argument contient un motif de `commandes.argumentsInterdits`, est refusée dès la proposition, et le profil ne peut pas être ratifié tant qu'elle y figure. Sont ainsi exclus le démarrage de l'application (`spring-boot:run`, scripts de Tomcat), son déploiement (`deploy`, `kubectl`, `oc`, `helm`, `ansible`), la base ou les conteneurs (`docker`), et les batchs lancés par `exec:java`. C'est le développeur qui lance l'application et les batchs (`agent-tdd-jira:D7.INV-4`).

## 4. Plateforme

Les commandes s'exécutent sans shell (D6.INV-1). Sous Windows, les enveloppes `mvnw.cmd` et `ng.cmd` ne se lancent qu'à travers `cmd.exe` : Agent2Dev refuse donc de ratifier un profil sous Windows natif, avec le motif « exécuter Agent2Dev sous WSL2 », et le guide l'installe dans WSL2, projet dans le système de fichiers de WSL2 (module `exploitation`).

## 5. Ratification

V0 présente le profil proposé, ses sources, ses marques « à renseigner », les écarts de versions et les commandes. Le développeur valide, corrige (commentaire obligatoire) ou rejette. Chaque ratification crée une version nouvelle, `profils/<projet>/v<n>.json` du dossier de configuration, avec l'auteur, la date et le commentaire ; la version la plus haute fait foi. Le `profil` crée ce fichier et ne le réécrit jamais ; aucun autre agent n'y touche (D1.INV-6).

## 6. Pièges connus

- **Profil deviné** : une commande absente du projet n'est pas inventée ; elle manque, et ce qui en dépend se présente au développeur.
- **Commande de confort** : « lancer l'application pour vérifier » n'est jamais une commande du profil ; la vérification de bout en bout est le rôle d'Agent2Test.
- **`npm test` en mode veille** : un exécuteur de tests qui attend des modifications ne rend jamais la main ; la commande porte `--watch=false`, et son délai l'arrête sinon.

## 7. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| PF1 | D4.INV-1 | sans profil ratifié, une commande demandée par un pas est refusée et V0 s'ouvre |
| PF2 | D4.INV-1 | un `pom.xml` modifié depuis la ratification rouvre V0 au début de la demande suivante |
| PF3 | D4.INV-2 | sur le projet de démonstration, chaque valeur proposée cite fichier et ligne ; le mode d'authentification absent est « à renseigner » et bloque la ratification |
| PF4 | D4.INV-3 | Spring Boot 3.4 dans le `pom.xml` est présenté comme écart à la cible 3.5, avec sa question |
| PF5 | D4.INV-4 | une commande `./mvnw spring-boot:run` ou `docker compose up` est refusée à la proposition comme à la ratification |
| PF6 | D4.INV-4 | une commande `./mvnw exec:java` est refusée |
| PF7 | D4.INV-2 | un projet sans contrat généré n'a pas de commande `regenerer-contrat`, et aucune n'est inventée |
| PF8 | D6.INV-1 | sous Windows natif, la ratification est refusée « exécuter Agent2Dev sous WSL2 » |
| PF9 | D5.INV-1 | un `copie.fichiersLocaux` qui contient `.env.local`, exclu comme secret, empêche la ratification |

## 8. Fichiers à produire

- `src/agents/profil/agent.js`, `src/agents/profil/proposer.js`, `src/agents/profil/versions.js`, `src/agents/profil/commandes.js`
- `schemas/profil.json`
- `test/profil/*.test.js`, `test/fixtures/projet/` (projet de démonstration Java et Angular, sources et fichiers de construction seulement)
