# Journal des modifications

Les détails de chaque version figurent dans le journal de révision du `SKILL.md` de la spécification concernée. Ce fichier en donne la vue d'ensemble, dans l'ordre chronologique inverse.

## Socle et experts back-front

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
