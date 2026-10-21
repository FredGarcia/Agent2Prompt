# Journal des modifications

Les détails de chaque version figurent dans le journal de révision du `SKILL.md` de la spécification concernée. Ce fichier en donne la vue d'ensemble, dans l'ordre chronologique inverse.

## Socle et experts back-front

### 2026-10-21 : agent2test 1.0.0, agent-tdd-jira 1.3.0

- **agent2test 1.0.0** : Agent2Test, système multi-agents qui choisit, prépare, joue et journalise les tests essentiels d'une demande, dans un projet séparé de l'application. Playwright y est piloté comme une bibliothèque depuis Node ; le plan vient d'agent-tdd-jira (`us.md` et fichier Gherkin) ; chaque critère d'acceptation reçoit un verdict prouvé ; l'humain ratifie aux points de contrôle CP-0 à CP-5 ; le système observe et fait évoluer ses propres règles sous gouvernance. Dimensions D1 à D18 actives, D19 (accessibilité) et D20 (profil recette et conteneur) réservées ; 20 modules, 90 invariants, points d'extension E1 à E5 ; implémentation en huit lots. Node 22 au moins, deux dépendances (`playwright` 1.63 ou plus récent, `pg`), PostgreSQL pgvector sur le port 5433, Gemini Code Assist par MCP ou modèle local compatible OpenAI, tableau de bord sur `127.0.0.1`. Tirée du dossier de conception du dépôt Agent2Test (cadrage, architecture, cahier des charges du 25 septembre 2026), dont la section 11 donne la filiation.
- **agent-tdd-jira 1.3.0** : dimension D7 active, binôme avec Agent2Test ; module `binome-agent2test`. Après le dernier scénario accepté, l'agent remet le plan validé et commité ; le développeur redémarre l'application sur le Tomcat local et conduit la campagne ; le script `lire-acceptation.mjs` tire du journal de tests le verdict de chaque critère, s'il vaut pour le plan et le code courants, sinon « non joué » avec sa raison ; chaque défaut applicatif confirmé en CP-3 rouvre son scénario en cycle TDD. Étiquettes de prérequis dans le fichier Gherkin : `@role-<nom>`, `@batch-<nom>`, `@redemarrage`, `@ecriture-base`, et au choix du développeur `@criticite-*` et `@socle`. Colonne « Acceptation » dans la matrice, ligne d'acceptation dans le rapport et le projet de commentaire Jira. Invariants D7.INV-1 à D7.INV-5, aucun invariant existant modifié. Archive 1.2.2.
- Les deux spécifications se référencent l'une l'autre et se publient dans un même commit (`EVOLUTION.md`, section 7). Le script `lire-acceptation.mjs` est testé sur 33 cas, dont deux en worktree et un qui vérifie qu'il ne modifie aucun fichier, index git compris ; le journal d'exemple d'agent2test, lu par ce script sur l'exemple ECR-77 d'agent-tdd-jira, redonne exactement les deux sorties du module `binome-agent2test` ; l'exemple, qui porte désormais `@role-LECTEUR`, passe `controler-criteres.mjs` sans écart.
- Décisions du développeur (21 octobre 2026) : Agent2Dev reste la tête de développement et applique agent-tdd-jira ; Playwright en bibliothèque, Agent2Test en projet séparé de l'application ; Agent2Test devient une spécification transmissible de ce dépôt ; tout reste en local, enchaîné à la main ; application sur Tomcat en local, lancée par le développeur ; batchs Java lancés par le développeur à un point de contrôle (CP-5) ; tous les modules actifs, accessibilité réservée.
- Soumis à ratification :
  - lecture de « connexion SSO réglée automatiquement » : authentification intégrée du poste par défaut (stratégie `integree`), connexion humaine en CP-0 en repli, sans identifiant détenu ;
  - écarts au dossier de conception d'Agent2Test (H1, H2, H3, CA-1.5, H9, CA-9.4, T1, H12 et US-29), dont l'AI Act mis hors périmètre et l'envoi des sources à Gemini soumis à l'autorisation de la DSI et du RSSI ;
  - rôles de l'application : étiquette `@role-<nom>`, rôles de la session déclarés par un humain (`session.roles`), scénario non jouable si le rôle manque ;
  - contrat de lecture du journal JSON : sources du plan et leurs empreintes, état git relevé à l'ouverture, cible de chaque décision ; verdict « non joué » dès que le plan ou le code a changé depuis la campagne ;
  - cycle de correction ouvert par un défaut applicatif confirmé en CP-3 sans désaccord, et par lui seul ; régression d'une autre demande corrigée dans la demande en cours, avec l'accord du développeur.

### 2026-10-21 : agent-tdd-jira 1.2.2

- **agent-tdd-jira 1.2.2** : script de contrôle `controler-criteres.mjs` (module `us-criteres`, section 7), en Node sans dépendance. Il confronte `us.md` et le fichier Gherkin et signale chaque écart avec son invariant (D10.INV-1 à D10.INV-7, D2.INV-3) : identifiants, provenance, énoncés invérifiables, exigences rattachées, couverture des critères par les scénarios, critères en attente, colonne « Scénarios ». Avec `--depuis`, il vérifie qu'aucun identifiant n'a été renuméroté depuis une révision git. L'agent le lance avant V2 et avant V5 ; sa sortie donne les critères prêts pour la réalisation.
- `us.md` gagne une section « Exigences » ; le statut d'un critère retiré s'écrit « retiré : <raison> ». Aucune dimension ni aucun invariant modifié. Archive 1.2.1.
- Script testé sur l'exemple ECR-77 du module et sur 27 variantes défectueuses ou limites, dont 5 avec un historique git ; chaque défaut est signalé avec l'invariant attendu.
- Soumis à ratification : le contrôle par script avant V2 et avant V5 ; la section « Exigences » dans `us.md` ; le format « retiré : <raison> » ; la liste des formulations jugées invérifiables (« correctement », « rapidement », « facilement », « intuitif », « convivial », « ergonomique », « optimal », « rapide » sans seuil).

### 2026-10-21 : retrait du préfixe `expert-`

- Les skills `expert-java`, `expert-angular`, `expert-analyse-projet` et `expert-sonarqube` s'appellent désormais `java`, `angular`, `analyse-projet` et `sonarqube`. Le changement couvre les dossiers, les manifestes, les points d'entrée, les citations (`java:Dn.INV-k`), les référentiels inclus (`references/java.md`, `references/angular.md`) et les dossiers de matérialisation (`.skills/java/`, …). Motif : une nouvelle notion d'expertise sera définie ensuite.
- Correctifs, sans dimension ni invariant modifié : **java 1.1.1**, **angular 1.0.1**, **analyse-projet 1.0.2**, **sonarqube 1.0.2** ; **socle-back-front 1.0.1**, dont la liste des skills qui l'incluent est complétée de `sonarqube` et `agent-tdd-jira` ; **agents-paralleles-gitlab 1.0.1** (module `distribution`) ; **agent-tdd-jira 1.2.1** (référentiels renommés). Épinglages remontés en conséquence, versions précédentes archivées.
- **sonarqube 1.0.2** précise la notation : `java:Dn.INV-k` désigne un invariant du référentiel `java`, `java:Snnnn` une règle SonarQube.
- `README.md`, `EVOLUTION.md` et les commentaires des outils emploient les nouveaux noms ; le glossaire est régénéré.
- Inchangés, parce qu'ils sont des traces : les archives, les transmissions antérieures et les entrées plus anciennes de ce journal et des journaux de révision, qui gardent les anciens noms.
- Soumis à ratification : noms sans préfixe ; montée en correctif (`EVOLUTION.md`, section 4, point 2), le renommage n'ajoutant aucune dimension ; anciens noms conservés dans l'historique.

### 2026-10-21 : agent-tdd-jira 1.2.0

- **agent-tdd-jira 1.2.0** : dimension D10 active, US et critères d'acceptation numérotés ; module `us-criteres`. L'analyse établit d'abord les US et leurs critères d'acceptation, repris du ticket avec leur provenance ou proposés, y rattache les exigences, puis décline chaque critère en au moins un scénario Gherkin. Identifiants stables `<CLÉ>-USnn` et `<CLÉ>-CAnn`, fichier `docs/demandes/<CLÉ>/us.md`, étiquette `@<CLÉ>-CAnn` sur chaque scénario (point d'extension E4), validation au point V2, matrice, rapport final et projet de commentaire Jira par critère. Invariants D10.INV-1 à D10.INV-7, aucun invariant existant modifié ; D2 et D6 dépendent de D10. Archive 1.1.0.
- Décision du développeur : « CA puis Gherkin, toujours ». Chaque critère d'acceptation est décliné en scénarios Gherkin, y compris quand le ticket ne contient que des critères ; aucun scénario sans critère.
- Décisions ratifiées (pull request n° 2) : numérotation des US et des critères sur toute la demande, jamais renumérotée ; fichier `us.md` versionné avec les autres fichiers de la demande ; validation des US et des critères intégrée au point V2, sans point de validation supplémentaire ; point d'extension E4 pour le futur rapport d'acceptation d'Agent2Test, un verdict par critère.

### 2026-10-20 : agents-paralleles-gitlab 1.0.0, agent-tdd-jira 1.1.0

- **agents-paralleles-gitlab 1.0.0** : kit de travail en parallèle sur un dépôt GitLab, une demande Jira par worktree. Dépôt nu partagé, branche sans amont, hooks communs (`pre-commit`, `commit-msg`, `pre-push`), script `agt` (`new`, `ls`, `diff`, `collisions`, `sync`, `reset`, `done`), push rules dans `regles-gitlab.txt`, fiche des garde-fous GitLab par édition, recette `recette.sh` de 44 contrôles sans réseau. Modules `isolation`, `hooks`, `orchestration`, `gitlab`, `distribution`, `recette` ; `controle-gitlab` (D6, contrôle par l'API en lecture seule) et `tension-depot` (D7, tension au niveau du dépôt) réservés. 20 invariants, points d'extension E1 et E2. Code de référence testé sur une copie du dépôt Agent2Prompt (git 2.43, bash 5.2), contre-épreuve comprise ; issu du tutoriel « Agents de code en parallèle » v2.
- **agent-tdd-jira 1.1.0** : dimension D9 active, travail dans un worktree géré, en parallèle d'autres demandes ; module `parallele`. Point d'entrée d'agents-paralleles-gitlab 1.0.0 inclus comme référentiel. Invariants D9.INV-1 à D9.INV-7, aucun invariant existant modifié ; en mode parallèle, l'agent ne pousse plus du tout. Archive 1.0.0.
- Décisions ratifiées (pull request n° 1) : fusion des merge requests par merge commit, sans squash ; aucun jeton GitLab pour les agents, la publication revient au développeur ; skill de l'agent matérialisé une seule fois, hors des worktrees ; rebase tant que la branche n'est pas publiée, fusion ensuite ; commit à clé seule hors scénario (`<CLÉ> : …`) ; points chauds par défaut : contrat, migrations, sécurité, fichiers de dépendances.

### 2026-10-16 : agent-tdd-jira 1.0.0, expert-java 1.1.0, correctifs 1.0.1

- **agent-tdd-jira 1.0.0** : agent de développement TDD. Entrée : une demande Jira (Cloud ou Data Center) enregistrée en MHTML. Parcours à cinq points de validation : ingestion et extraction (script Node sans dépendance, testé sur des MHTML Cloud et Data Center synthétiques), analyse avec commentaires et questions, scénarios Gherkin en français étiquetés `@CLÉ-Snn`, analyse d'impact, variantes back Java et front Angular par scénario, cycle rouge, vert, remanié scénario par scénario, matrice de traçabilité et projet de commentaire Jira. Modules `ingestion-jira`, `analyse-demande`, `impact`, `variantes`, `cycle-tdd`, `tracabilite` ; `binome-agent2test` (D7) et `connecteur-jira` (D8) réservés. 24 invariants, points d'extension E1 à E3. Socle 1.0.0, expert-java 1.1.0 et expert-angular 1.0.0 inclus comme référentiels.
- Décisions ratifiées : cycle TDD complet après choix des variantes ; scénarios en Gherkin ; Jira Cloud et Data Center.
- **expert-java 1.1.0** : migrations Flyway ou Liquibase (point d'extension E5). D4.INV-1 reformulé sur les garanties communes, sans affaiblissement. Archive 1.0.0.
- **expert-analyse-projet 1.0.1** et **expert-sonarqube 1.0.1** : correctifs, référence et référentiel expert-java montés en 1.1.0. Archives 1.0.0.

### 2026-10-16 : expert-sonarqube 1.0.0

- **expert-sonarqube 1.0.0** : SonarQube Server 2026.1 LTA et 2026.5 LTA, édition Developer ou supérieure, GitLab CI. Quatre missions : configurer l'analyse et la CI, trier et interpréter, corriger ou planifier, gouverner la qualité. Modules `cadrage-acces`, `configuration-analyse`, `triage`, `correction`, `gouvernance`, `rapport` ; `agents-sonar` (D7, serveur MCP et agents Sonar) et `conformite` (D8, rapports WCAG, OWASP, CRA) réservés. 22 invariants, points d'extension E1 à E3.
- Inclus et épinglés : socle 1.0.0, points d'entrée d'expert-java 1.0.0 et d'expert-angular 1.0.0 comme référentiels d'invariants pour les corrections directes.
- Décisions ratifiées : instance Server 2026.x Developer ou supérieure ; les quatre missions ; correction directe ou plan, au choix ; accès par le jeton du compte Sonar, lecture libre et écriture soumise à validation explicite.
- Évolutions de SonarQube 2026.5 prises en compte : Security Hotspots dépréciés au profit des Security Issues (traités sous une catégorie unique, point E3), Node.js 20 non pris en charge par les scanners JS/TS, PostgreSQL 15 requis pour l'instance.
- `tools/verifier.mjs` : seuls les identifiants du socle sont importés depuis les fichiers partagés, pour qu'un référentiel inclus ne masque pas une faute sur un invariant local.

### 2026-10-16 : socle-back-front 1.0.0, expert-java 1.0.0, expert-angular 1.0.0, expert-analyse-projet 1.0.0

- **socle-back-front 1.0.0** : contrat OpenAPI 3.1 comme source de vérité, erreurs RFC 9457 avec `code` et `traceId`, formats de données et pagination, sécurité de la frontière, traçabilité, accessibilité et messages. Dimensions SC1 à SC6 actives, SC7 (événements asynchrones) réservée. Non transmissible seul.
- **expert-java 1.0.0** : Java 21, Spring Boot 3.5, PostgreSQL. Modes produire et relire. Modules `architecture`, `langage`, `api-rest`, `persistance`, `securite`, `tests`, `revue` ; `migration-boot4` réservé (D8). Points d'extension E1 à E4.
- **expert-angular 1.0.0** : Angular 20. Modes produire et relire. Modules `architecture`, `composants`, `donnees-http`, `formulaires`, `routage-securite`, `accessibilite`, `tests`, `revue` ; `migration-angular22` (D9) et `bff-node` (D10) réservés. Points d'extension E1 à E5.
- **expert-analyse-projet 1.0.0** : analyse en lecture seule, trois livrables au choix (`cartographie`, `rapport`, `plans`). Modules `cadrage`, `cartographie`, `evaluation`, `rapport`, `plans-action` ; `delta` réservé (D6). Points d'extension E1 à E3 (identifiants stables, annexe `analyse.json`, versions enregistrées).
- Décisions ratifiées : les experts produisent et relisent ; versions cibles Java 21, Spring Boot 3.5, Angular 20 ; l'analyste laisse le développeur choisir son livrable ; skills autonomes avec un socle commun.
- Point d'attention consigné dans les skills : la branche Spring Boot 3.5 n'a plus de support open source depuis le 30 juin 2026, et Angular 20 arrive en fin de support long terme vers la fin novembre 2026. Les migrations correspondantes sont les dimensions réservées D8 (Java) et D9 (Angular).

## Outils

### 2026-10-21 : citations entre skills vérifiées

- `tools/verifier.mjs` vérifie aussi les identifiants d'un autre skill, cités sous la forme `java:D4.INV-2` : chacun doit être défini dans le point d'entrée du skill qu'il nomme, et ce skill doit exister dans le dépôt. Jusqu'ici, ces identifiants n'étaient pas vérifiés. Les 107 citations de ce type que contient le dépôt sont toutes définies.
- Testé par deux contre-épreuves de plus, soit 16 sur des copies du dépôt : un invariant d'un autre skill absent, un préfixe qui ne nomme aucun skill du dépôt.
- `EVOLUTION.md`, section 7 : deux versions qui se référencent l'une l'autre ne passent le vérificateur qu'ensemble, et se publient donc dans un même commit, avec leurs deux transmissions ; section 8 : le vérificateur contrôle les identifiants préfixés.
- Motif : le binôme entre agent-tdd-jira et Agent2Test repose sur des invariants cités d'une spécification à l'autre.

### 2026-10-21 : vérificateur étendu et vérification des pull requests

- `tools/verifier.mjs` contrôle aussi :
  - la transmission de la version courante de chaque spécification, qui doit redonner exactement l'en-tête, les fichiers et la table d'intégrité ;
  - le README : version de chaque spécification dans le tableau et dans le schéma, liens vers `specs/` et `transmissions/` ;
  - les archives : une par version précédente déclarée, à la bonne version, aucune archive non déclarée ;
  - les points d'extension du manifeste, face à ceux du point d'entrée ;
  - le registre des dimensions, face aux statuts des modules dans le manifeste.
- Testé par 14 contre-épreuves sur des copies du dépôt, chacune refusée avec le message attendu ; le dépôt intact passe.
- `tools/bundle.mjs` exporte `assembler` et `relire`, dont se sert le vérificateur ; les transmissions produites ne changent pas, sauf la consigne de la table d'intégrité, à vérifier « depuis le dossier où les fichiers ont été matérialisés » au lieu de `spec/`. La correction vaut pour les transmissions des prochaines versions : celles déjà publiées restent telles quelles.
- `.github/workflows/verifier.yml` : le vérificateur tourne à chaque pull request et à chaque push sur `main`, sous Node 20 et Node 24.
- `EVOLUTION.md`, section 7 : README mis à jour avec le journal, transmission régénérée avant la vérification, une version par commit, transmission comprise ; la transmission d'une version publiée n'est jamais régénérée.

### 2026-10-21 : glossaire des invariants

- Ajout de `tools/glossaire.mjs` : génère `glossaire.md`, qui détaille les 180 invariants des huit spécifications (dimension, énoncé, modules qui les reprennent, spécifications qui les citent) et la notation des identifiants. Node 20 ou plus récent, modules natifs.
- `tools/verifier.mjs` échoue si `glossaire.md` est absent ou ne correspond plus exactement aux spécifications. Testé sur trois défauts introduits volontairement : invariant modifié sans régénération, glossaire retouché à la main, glossaire absent.
- `EVOLUTION.md` : régénération du glossaire dans la procédure de publication et dans l'ajout d'une spécification.

### 2026-10-16 : fichiers partagés et vérificateur

- `tools/bundle.mjs` gère les fichiers partagés (`shared`, version épinglée vérifiée), les références entre skills (`references`, version vérifiée) et refuse une spécification `"transmissible": false`. Transmission de `tension-dashboard-gitlab-agent` 2.2.0 inchangée, octet pour octet.
- Ajout de `tools/verifier.mjs` : contrôle structurel de toutes les spécifications (manifestes, versions, modules, épinglages, références, blocs de code, invariants définis et cités). Testé sur six défauts introduits volontairement, tous détectés.
- `EVOLUTION.md` : nouvelles unités (fichier partagé, référence), section « Fichiers partagés et références », vérification automatisée dans la procédure de publication.

## tension-dashboard-gitlab-agent

### 2026-10-16 : outil de transmission en Node

- `tools/bundle.py` est remplacé par `tools/bundle.mjs` (Node 20 ou plus récent, modules natifs uniquement), cohérent avec la chaîne Node et Angular du projet. La sortie est identique octet pour octet à celle de la version Python.

### 2026-10-16 : transmission texte

- Ajout de `tools/bundle.py` (remplacé depuis par `tools/bundle.mjs`) : assemble une spécification modulaire en un texte unique, avec table d'intégrité sha256 et vérification de l'aller-retour.
- Ajout de `ENTETE-TRANSMISSION.md` : consigne pour l'IA du développeur (matérialiser `spec/`, lire, planifier, implémenter par étapes en commençant par le noyau).
- Première transmission : `transmissions/tension-dashboard-gitlab-agent-2.2.0.md`.
- Décision : seul du texte est transmis ; l'IA construit elle-même le package et le code. Le prompt d'amorçage intermédiaire, qui supposait un dossier joint, est remplacé par cet en-tête et n'a pas été versionné.

### 2.2.0 (2026-10-16) : package modulaire

- `SKILL.md` racine, `manifest.json` et six modules actifs : `tension`, `etats`, `verdict-journal`, `messagerie`, `dashboard`, `effecteur-gitlab`. Schémas Mermaid dans chaque module.
- Ratifié : table `confirm_tokens` dans la migration 1 (seul le HMAC du jeton est stocké) ; structure modulaire conservée.
- Point d'extension E6 (chargement piloté par le manifeste). Événements `EXECUTION_REFUSED` et `PIPELINE_RETRY`. Scénarios de l'effecteur renommés `G1` à `G10`.

### 2.1.0 (2026-10-16) : registre des dimensions

- Registre D1 à D10, contrat de version, 17 invariants `Dn.INV-k`, points d'extension E1 à E5.
- Dimension D7 active : client d'arbitrage signé `tension-arbitrer`.
- Corrections : le stash ne protège pas les fichiers gelés (pré-vérification à l'étape 0) ; statut réel du tracker (`git fetch` écrit les refs de suivi) ; seuil de volatilité paramétré ; `testCmd` sans shell ; compteur de relances persisté.
- `regulation-inter-agents.md` : dimensions D8 à D10 réservées à la 3.0 (communication directe entre agents, méta-niveau borné, rapport de couplage).

### 2.0.0 (2026-10-15) : spécification monolithique

- Agent de surveillance des fichiers sous tension, effecteur GitLab à garde-fous, tableau de bord en lecture seule.
- Décisions ratifiées : seuil de 300 caractères cumulés par fichier depuis l'ancêtre commun ; critère « stable » fondé sur l'absence de chevauchement ; SQLite ; messages signés HMAC ; cycle 7E ; clause de second ordre (verdict et action du développeur journalisés).

### 1.0 : document initial

- Spécification d'intention fournie par Fred (PDF), non versionnée dans ce dépôt. Elle a servi de base à l'analyse qui a conduit à la 2.0.0.
