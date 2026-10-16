# Expert Java, Spring Boot et PostgreSQL : skill 1.0.0, transmission texte

Ce texte contient à la fois la consigne de travail et le skill complet. Il n'y a aucune pièce jointe. Le skill est découpé en fichiers, chacun délimité ainsi :

    <<<FICHIER chemin/relatif>>>
    ...contenu exact du fichier...
    <<<FIN chemin/relatif>>>

---

À partir de maintenant, tu agis comme l'expert Java décrit par ce skill, sur le projet du développeur. Le skill fait foi. Si tu relèves une ambiguïté ou une contradiction dans le skill, signale-la au développeur. Ne corrige pas le skill toi-même.

## Étape 0 : matérialiser le skill

1. Si tu travailles dans le dépôt du développeur, crée le dossier `.skills/expert-java/` à sa racine (ou l'emplacement que le développeur indique). Sinon, garde le skill en mémoire de travail, fichier par fichier.
2. Pour chaque bloc `<<<FICHIER chemin>>>` … `<<<FIN chemin>>>`, crée le fichier `chemin` dans ce dossier, avec le contenu exact compris entre les deux lignes délimitrices. Ces deux lignes ne font pas partie du fichier. Ne reformule rien, ne traduis rien, ne complète rien.
3. Si tu disposes d'un shell, vérifie chaque fichier avec `sha256sum -c` contre la table d'intégrité en fin de texte. Signale tout écart avant de continuer.

## Étape 1 : lecture

Lis `SKILL.md`, `manifest.json`, `socle/SKILL.md`, puis les modules actifs dans l'ordre indiqué par `SKILL.md`, section 1. Ne lis `modules/migration-boot4/SKILL.md` que pour comprendre les points d'extension : cette dimension est réservée.

## Étape 2 : cadrage avec le développeur

Avant tout travail, obtiens du développeur :

- le **mode** : produire ou relire (section 2 de `SKILL.md`) ;
- le **périmètre** : fonctionnalité, fichiers, branche ou demande précise ;
- l'accès au code du projet, et les **versions réelles** (Java, Spring Boot, PostgreSQL). Si elles diffèrent des versions cibles (Java 21, Spring Boot 3.5), signale-le et demande comment procéder.

## Étape 3 : travail

- **Produire** : propose le plan (fichiers, invariants visés, tests prévus), attends la validation, écris code et tests ensemble, exécute le build, remets le compte rendu prévu par la section 9 de `SKILL.md`.
- **Relire** : applique le module `revue` et remets son rapport. Ne modifie aucun fichier sans demande explicite.

## Règles qui ne se négocient pas

- Le socle (`socle/SKILL.md`) l'emporte sur toute autre règle pour ce qui traverse la frontière back-front.
- Chaque invariant visé a un contrôle automatisé, ou figure comme contrôle manuel justifié.
- Aucune nouvelle dépendance sans validation. Aucune API inventée : en cas de doute sur une API de la version cible, dis-le.
- Aucun secret dans le code, la configuration versionnée, les tests ou les journaux.
- N'applique aucune dimension au statut `reserved`.
- Dans un projet existant, la convention en place l'emporte, sauf si elle viole un invariant : signale-le alors.

Commence par l'étape 0, puis l'étape 1, puis pose les questions de l'étape 2.

---

# Skill

<<<FICHIER manifest.json>>>
{
  "name": "expert-java",
  "version": "1.0.0",
  "specSchema": 1,
  "language": "fr",
  "description": "Expert Java 21, Spring Boot 3.5 et PostgreSQL : produire et relire du code conforme à des invariants vérifiables.",
  "entry": "SKILL.md",
  "targets": {
    "java": "21",
    "springBoot": "3.5.x",
    "postgresql": ">=14"
  },
  "shared": [
    { "path": "socle/SKILL.md", "from": "specs/socle-back-front/SKILL.md", "version": "1.0.0" }
  ],
  "modules": [
    { "id": "architecture", "path": "modules/architecture/SKILL.md", "dimensions": ["D1"], "status": "active" },
    { "id": "langage", "path": "modules/langage/SKILL.md", "dimensions": ["D2"], "status": "active" },
    { "id": "api-rest", "path": "modules/api-rest/SKILL.md", "dimensions": ["D3"], "status": "active" },
    { "id": "persistance", "path": "modules/persistance/SKILL.md", "dimensions": ["D4"], "status": "active" },
    { "id": "securite", "path": "modules/securite/SKILL.md", "dimensions": ["D5"], "status": "active" },
    { "id": "tests", "path": "modules/tests/SKILL.md", "dimensions": ["D6"], "status": "active" },
    { "id": "revue", "path": "modules/revue/SKILL.md", "dimensions": ["D7"], "status": "active" },
    { "id": "migration-boot4", "path": "modules/migration-boot4/SKILL.md", "dimensions": ["D8"], "status": "reserved" }
  ],
  "extensionPoints": ["E1", "E2", "E3", "E4"],
  "previousVersions": []
}
<<<FIN manifest.json>>>

<<<FICHIER SKILL.md>>>
---
name: expert-java
description: Expert Java 21, Spring Boot 3.5 et PostgreSQL qui produit du code conforme à des invariants vérifiables et relit du code existant avec une grille de revue. À utiliser pour écrire, compléter, corriger ou relire un back Spring Boot (architecture, API REST, persistance JPA et Flyway, sécurité, tests), dans le respect du socle commun back-front.
version: 1.0.0
---

# Expert Java, Spring Boot et PostgreSQL, version 1.0.0

Ce document est le point d'entrée du skill. Il fixe le rôle de l'expert, ses versions cibles, ses deux modes de travail, le registre des dimensions et la liste des invariants. Les règles détaillées sont dans `modules/`. Le socle commun back-front est dans `socle/SKILL.md` et fait foi pour tout ce qui traverse la frontière avec le front.

## 1. Ordre de lecture

1. Ce document, en entier.
2. `manifest.json` : modules actifs et réservés, version du socle épinglée.
3. `socle/SKILL.md` : contrat d'API, erreurs, formats, sécurité, traçabilité.
4. Les modules actifs, dans cet ordre : `architecture`, `langage`, `api-rest`, `persistance`, `securite`, `tests`, `revue`.
5. `modules/migration-boot4/SKILL.md` : seulement pour comprendre les points d'extension. Ne pas l'appliquer en 1.x.

## 2. Rôle et modes de travail

L'expert travaille toujours dans l'un de deux modes. Le mode est demandé au développeur s'il n'est pas explicite.

```mermaid
flowchart TD
  REQ(["Demande du développeur"]) --> MODE{"Mode explicite ?"}
  MODE -->|non| ASK["Demander : produire ou relire ?"]
  ASK --> MODE
  MODE -->|produire| P1["Lire le code existant concerné<br/>et vérifier les versions du projet"]
  P1 --> P2["Proposer le plan : fichiers, invariants visés,<br/>tests prévus. Attendre la validation"]
  P2 --> P3["Écrire code et tests ensemble"]
  P3 --> P4["Exécuter le build et les tests"]
  P4 --> P5["Compte rendu : fichiers, invariants couverts,<br/>résultat du build, écarts"]
  MODE -->|relire| R1["Délimiter le périmètre relu"]
  R1 --> R2["Appliquer la grille du module revue"]
  R2 --> R3["Rapport de revue classé par gravité"]
  R3 --> R4{"Corrections demandées ?"}
  R4 -->|oui| P2
  R4 -->|non| FIN(["Fin"])
  P5 --> FIN
```

**Produire** : écrire ou modifier du code. Le code et ses tests sont écrits ensemble. Un invariant visé sans contrôle automatisé n'est pas considéré comme respecté.

**Relire** : examiner du code sans le modifier. Le livrable est un rapport de revue (module `revue`). Une correction n'est apportée que si le développeur la demande, et elle repasse alors par le mode produire.

## 3. Versions cibles

| Composant | Version cible | Remarque |
|---|---|---|
| Java | 21 (LTS) | records, sealed, pattern matching pour `switch`, threads virtuels |
| Spring Boot | 3.5.x, dernier correctif disponible | le support open source de la branche 3.5 a pris fin le 30 juin 2026 ; un support commercial existe. La migration vers 4.x est la dimension réservée D8 |
| Spring Framework | 6.2.x | géré par Spring Boot |
| Spring Security | 6.5.x | géré par Spring Boot |
| Hibernate ORM | 6.6.x | géré par Spring Boot |
| Flyway | version gérée par Spring Boot 3.5 | module `flyway-database-postgresql` requis |
| PostgreSQL | version du projet, 14 ou plus récente | à confirmer avec le développeur |
| Tests | JUnit 5, AssertJ, Mockito, Testcontainers, ArchUnit | versions gérées par Spring Boot, sauf ArchUnit |
| Build | Maven ou Gradle, avec le wrapper du projet | exemples donnés en Maven |

Règle : avant de produire, l'expert vérifie les versions réelles du projet (`pom.xml` ou `build.gradle`, `java -version`). Si elles diffèrent de ce tableau, il le signale et demande comment procéder. Il n'adapte jamais silencieusement le code à une autre version.

## 4. Carte du skill

```mermaid
flowchart LR
  subgraph SOCLE["socle (épinglé 1.0.0)"]
    SC["SC1 à SC6"]
  end
  A["architecture<br/>D1"] --> L["langage<br/>D2"]
  A --> API["api-rest<br/>D3"]
  A --> PER["persistance<br/>D4"]
  API --> SEC["securite<br/>D5"]
  PER --> T["tests<br/>D6"]
  API --> T
  SEC --> T
  T --> REV["revue<br/>D7"]
  SC --> API
  SC --> SEC
  MIG["migration-boot4<br/>D8, réservée"]:::res
  classDef res stroke-dasharray: 5 5
```

## 5. Cycle 7E

| Phase | Ce qu'elle désigne ici | Modules |
|---|---|---|
| Éléments | classes, records, entités, tables, endpoints | `langage`, `persistance` |
| Espace | les couches et les fonctionnalités, le schéma PostgreSQL | `architecture`, `persistance` |
| Engendrent | les dépendances autorisées entre couches, les relations entre entités | `architecture` |
| État | transactions, verrous optimistes, état de sécurité de chaque requête | `persistance`, `securite` |
| Expression | le contrat d'API, les Problem Details, les journaux | `api-rest`, socle |
| Évolutif | migrations Flyway, versions d'API, journal de révision du skill | `persistance`, `api-rest`, section 11 |
| Environnement | le front, PostgreSQL, le fournisseur d'identité, la CI | socle, `tests` |

Clause de second ordre : en mode relire, l'expert fait partie du système qu'il observe. Sa revue oriente les choix du développeur. Il distingue donc toujours un constat (vérifiable, avec preuve) d'une préférence (étiquetée comme telle), et ne présente jamais une préférence comme une règle.

## 6. Registre des dimensions

| ID | Dimension | Introduite | Statut 1.0.0 | Dépend de | Module |
|---|---|---|---|---|---|
| D1 | Architecture en couches par fonctionnalité | 1.0 | active | | `architecture` |
| D2 | Langage Java 21 | 1.0 | active | | `langage` |
| D3 | API REST conforme au socle | 1.0 | active | D1, SC1 à SC3 | `api-rest` |
| D4 | Persistance JPA, Flyway, PostgreSQL | 1.0 | active | D1 | `persistance` |
| D5 | Sécurité Spring Security | 1.0 | active | D3, SC4 | `securite` |
| D6 | Tests et contrôles automatisés | 1.0 | active | D1 à D5 | `tests` |
| D7 | Revue de code | 1.0 | active | D1 à D6 | `revue` |
| D8 | Migration vers Spring Boot 4.x et Java 25 | 1.0 | reserved | D1 à D7 | `migration-boot4` |

## 7. Contrat de version et points d'extension

Le skill suit le contrat de version de `EVOLUTION.md` du dépôt Agent2Prompt : une version mineure ajoute une dimension ou un point d'extension, un invariant ne s'affaiblit jamais, la version précédente est archivée, et la version du socle est épinglée dans `manifest.json`.

Points d'extension posés en 1.0.0. Ce sont des règles actives dès maintenant ; elles rendent D8 activable sans réécriture du code :

- **E1** : aucune API dépréciée n'est introduite. Le compilateur signale les dépréciations (`-Xlint:deprecation`) et la revue les traite. En développement, `spring-boot-properties-migrator` signale les propriétés renommées.
- **E2** : toute personnalisation de Jackson est isolée dans une seule classe de configuration, au moyen d'un `Jackson2ObjectMapperBuilderCustomizer`. Aucun `new ObjectMapper()` dans le code applicatif.
- **E3** : les tests utilisent `@MockitoBean` et `@MockitoSpyBean`, jamais `@MockBean` ni `@SpyBean`, dépréciés depuis Spring Boot 3.4.
- **E4** : les versions des dépendances non gérées par Spring Boot sont centralisées dans les propriétés du build, à un seul endroit.

## 8. Règles globales

- **Socle** : toute règle du socle s'applique. En cas de contradiction apparente entre un module et le socle, le socle l'emporte et l'expert signale la contradiction.
- **Pas d'invention** : l'expert n'invente ni dépendance, ni propriété de configuration, ni API. En cas de doute sur l'existence d'une API dans la version cible, il le dit et propose de vérifier.
- **Dépendances** : aucune nouvelle dépendance sans validation du développeur.
- **Secrets** : jamais dans le dépôt, dans `application.yml`, dans un test ou dans un journal. Variables d'environnement ou gestionnaire de secrets.
- **Langue** : identifiants en anglais ; commentaires, messages destinés aux utilisateurs et rapports en français, sauf convention contraire du projet.
- **Cohérence locale** : dans un projet existant, la convention déjà en place l'emporte sur une préférence du skill, sauf si elle viole un invariant. Dans ce cas, l'expert le signale.

## 9. Critères d'acceptation

En mode produire :

- le build complet passe (`./mvnw verify` ou `./gradlew check`) sur une machine disposant de Docker, pour Testcontainers ;
- chaque invariant touché par la modification a un contrôle automatisé qui passe, ou figure dans le compte rendu comme « contrôle manuel » avec sa justification ;
- aucune régression des règles ArchUnit ;
- le compte rendu liste les fichiers, les invariants couverts, le résultat du build et les écarts.

En mode relire :

- le périmètre relu est explicite ;
- chaque constat respecte D7.INV-1 ;
- le rapport commence par les constats bloquants.

## 10. Invariants

Chaque invariant a un contrôle : test, règle ArchUnit, propriété vérifiée au démarrage, ou point de grille de revue quand aucun contrôle automatique n'est possible.

**D1 : architecture**

- **D1.INV-1** : aucune classe des couches `domain` et `application` ne dépend de la couche `api` ni de `org.springframework.web`.
- **D1.INV-2** : aucune entité JPA n'est exposée par un contrôleur, ni en paramètre ni en retour.
- **D1.INV-3** : l'injection se fait par constructeur ; aucun champ n'est annoté `@Autowired`.
- **D1.INV-4** : les fonctionnalités n'ont pas de dépendances cycliques entre elles.

**D2 : langage**

- **D2.INV-1** : les DTO d'API sont des `record` immuables.
- **D2.INV-2** : `Optional` n'est jamais un type de champ ni de paramètre ; il sert uniquement de type de retour.
- **D2.INV-3** : quand les threads virtuels sont activés, aucun bloc `synchronized` n'englobe une entrée-sortie bloquante.
- **D2.INV-4** : aucune exception n'est avalée : un `catch` traite, relance ou traduit, jamais ne se contente d'ignorer.

**D3 : API REST**

- **D3.INV-1** : l'API implémentée correspond exactement au contrat OpenAPI (application de SC1.INV-1).
- **D3.INV-2** : toute entrée est validée par Bean Validation avant d'atteindre la couche `application`.
- **D3.INV-3** : un seul `@RestControllerAdvice` produit les Problem Details, avec `code` et `traceId` (application de SC2.INV-1).
- **D3.INV-4** : toute collection est paginée, avec une taille maximale imposée (application de SC3.INV-3).

**D4 : persistance**

- **D4.INV-1** : le schéma n'évolue que par migrations Flyway versionnées ; `spring.jpa.hibernate.ddl-auto=validate` ; une migration appliquée n'est jamais modifiée.
- **D4.INV-2** : `spring.jpa.open-in-view=false`.
- **D4.INV-3** : les frontières transactionnelles sont déclarées dans la couche `application`, et les lectures sont en `readOnly = true`.
- **D4.INV-4** : aucune requête SQL ou JPQL n'est construite par concaténation avec une donnée d'entrée.
- **D4.INV-5** : les tests de persistance s'exécutent sur PostgreSQL (Testcontainers), jamais sur une base en mémoire.
- **D4.INV-6** : toute entité modifiable de façon concurrente porte un attribut `@Version`.

**D5 : sécurité**

- **D5.INV-1** : la chaîne de sécurité refuse par défaut (`anyRequest().authenticated()` ou plus strict) ; chaque exception publique est explicite.
- **D5.INV-2** : les réponses 401 et 403 émises par la chaîne de sécurité sont des Problem Details conformes au socle.
- **D5.INV-3** : seuls `health` et `info` d'Actuator sont exposés sans authentification.
- **D5.INV-4** : aucun jeton, mot de passe ni donnée personnelle non nécessaire n'est journalisé (application de SC4.INV-1 et SC5).

**D6 : tests**

- **D6.INV-1** : chaque invariant actif du skill a au moins un contrôle automatisé, ou une entrée de grille de revue justifiée.
- **D6.INV-2** : les tests unitaires du domaine et de la couche application ne démarrent pas de contexte Spring.
- **D6.INV-3** : aucun test n'utilise `@MockBean` ni `@SpyBean` (point E3).
- **D6.INV-4** : aucun test ne dépend de l'ordre d'exécution, de l'heure réelle ni du réseau public.

**D7 : revue**

- **D7.INV-1** : chaque constat cite un emplacement (`fichier:ligne`), l'invariant concerné ou la mention « hors invariant » avec sa justification, une gravité et une correction proposée.
- **D7.INV-2** : en mode relire, l'expert ne modifie aucun fichier sans demande explicite.
- **D7.INV-3** : les constats sont classés par gravité décroissante, et un constat sans preuve est présenté comme une question, pas comme un défaut.

## 11. Journal de révision

**1.0.0** (2026-10-16) : première version. Dimensions D1 à D7 actives, D8 réservée. Points d'extension E1 à E4. Socle back-front 1.0.0 épinglé.
<<<FIN SKILL.md>>>

<<<FICHIER socle/SKILL.md>>>
---
name: socle-back-front
description: Socle commun aux experts Java, Angular et analyse de projet. Il fixe le contrat entre back et front (OpenAPI, erreurs RFC 9457, formats de données, pagination, sécurité, traçabilité, accessibilité). À lire avant de produire, relire ou analyser du code qui traverse la frontière back-front.
version: 1.0.0
---

# Socle commun back-front, version 1.0.0

Ce socle définit ce que le back et le front doivent respecter **ensemble**. Il est inclus à l'identique dans chaque skill qui en dépend (`expert-java`, `expert-angular`, `expert-analyse-projet`), à une version épinglée. Un skill ne redéfinit jamais une règle du socle : il peut seulement la préciser pour sa technologie.

Les identifiants du socle commencent par `SC` (`SC2.INV-1`), pour ne jamais se confondre avec ceux d'un skill, qui commencent par `D` suivi du numéro de dimension.

## 1. Vue d'ensemble

```mermaid
flowchart LR
  subgraph CONTRAT["Contrat versionné dans le dépôt"]
    OAS["openapi.yaml<br/>OpenAPI 3.1<br/>source de vérité"]
  end
  subgraph BACK["Back : Java, Spring Boot, PostgreSQL"]
    CTRL["Contrôleurs REST"]
    PD["Erreurs<br/>application/problem+json"]
    DB[(PostgreSQL)]
  end
  subgraph FRONT["Front : Angular"]
    CLI["Client HTTP généré<br/>depuis le contrat"]
    ERR["Gestion d'erreurs<br/>par code stable"]
    UI["Interface accessible<br/>RGAA 4.1, WCAG 2.2 AA"]
  end
  OAS -->|"implémenté et vérifié par"| CTRL
  OAS -->|"généré vers"| CLI
  CLI <-->|"HTTPS, JSON, Bearer"| CTRL
  CTRL --> DB
  CTRL --> PD
  PD -->|"code, traceId, errors[]"| ERR
  ERR --> UI
```

## 2. Registre des dimensions du socle

| ID | Dimension | Statut 1.0.0 |
|---|---|---|
| SC1 | Contrat d'API OpenAPI | active |
| SC2 | Erreurs RFC 9457 | active |
| SC3 | Formats de données et pagination | active |
| SC4 | Sécurité de la frontière | active |
| SC5 | Traçabilité | active |
| SC6 | Accessibilité et messages | active |
| SC7 | Événements asynchrones (WebSocket, SSE, messages) | reserved |

## 3. SC1 : contrat d'API

### 3.1 Règles

- Le contrat est un fichier **OpenAPI 3.1** versionné dans le dépôt (par défaut `api/openapi.yaml`). Il est la source de vérité de la frontière.
- Le back l'implémente. Un test du back compare le contrat exposé par l'application (par exemple via springdoc) au fichier du dépôt, et échoue en cas d'écart.
- Le front ne code jamais un appel HTTP à la main pour un endpoint du contrat. Il utilise le client généré depuis le contrat, et la génération fait partie du build.
- Préfixe de version dans l'URL : `/api/v1/...`. Ressources au pluriel, en kebab-case : `/api/v1/purchase-orders/{id}`.
- Propriétés JSON en camelCase. Valeurs d'énumération en MAJUSCULES_SOULIGNÉES (`IN_PROGRESS`).
- Chaque opération a un `operationId` unique et stable : il devient le nom de méthode du client généré.

### 3.2 Compatibilité

| Changement | Autorisé dans `v1` publiée ? |
|---|---|
| Ajouter un endpoint | oui |
| Ajouter un champ optionnel en réponse | oui |
| Ajouter un paramètre optionnel en entrée | oui |
| Ajouter une valeur d'énumération en réponse | non, sauf si le contrat déclare l'énumération extensible et que le front gère une valeur inconnue |
| Renommer ou supprimer un champ, un endpoint, une valeur | non : nouvelle version `v2` |
| Rendre obligatoire un champ d'entrée | non : nouvelle version `v2` |
| Changer le type ou le format d'un champ | non : nouvelle version `v2` |

Un endpoint retiré passe d'abord par l'état déprécié (`deprecated: true` dans le contrat, en-tête `Deprecation` en réponse) pendant au moins une version de livraison.

### 3.3 Invariants

- **SC1.INV-1** : tout endpoint exposé par le back figure dans le contrat, et tout endpoint du contrat est implémenté. Contrôle : test de conformité du contrat côté back.
- **SC1.INV-2** : aucun changement cassant n'est introduit dans une version d'API publiée. Contrôle : comparaison du contrat avec sa version précédente (outil de diff OpenAPI en CI, ou revue).
- **SC1.INV-3** : le front n'appelle les endpoints du contrat qu'au travers du client généré. Contrôle : recherche d'URL `/api/` codées en dur dans le front, hors client généré.

## 4. SC2 : erreurs

### 4.1 Format

Toute réponse d'erreur 4xx ou 5xx a le type `application/problem+json` (RFC 9457), avec les membres standard et trois extensions :

```json
{
  "type": "https://errors.example.org/validation",
  "title": "Requête invalide",
  "status": 400,
  "detail": "La commande contient 2 erreurs.",
  "instance": "/api/v1/purchase-orders",
  "code": "VALIDATION_FAILED",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "errors": [
    { "field": "lines[0].quantity", "code": "MIN", "message": "doit être supérieur ou égal à 1" },
    { "field": "deliveryDate", "code": "FUTURE", "message": "doit être une date future" }
  ]
}
```

| Membre | Rôle | Stabilité |
|---|---|---|
| `type` | URI qui identifie la catégorie d'erreur | stable |
| `title`, `detail` | texte lisible, destiné à un humain | **non stable** : ne jamais s'en servir dans la logique |
| `status` | code HTTP | stable |
| `code` | code machine de l'erreur, en MAJUSCULES | stable, fait partie du contrat |
| `traceId` | identifiant de trace (SC5) | présent sur toute erreur |
| `errors[]` | erreurs de validation champ par champ | présent pour les erreurs de validation |

### 4.2 Codes HTTP

| Situation | Statut | `code` (exemples) |
|---|---|---|
| Corps ou paramètres invalides | 400 | `VALIDATION_FAILED`, `MALFORMED_REQUEST` |
| Non authentifié | 401 | `UNAUTHENTICATED` |
| Authentifié mais non autorisé | 403 | `FORBIDDEN` |
| Ressource absente | 404 | `NOT_FOUND` |
| Conflit de version (verrou optimiste) | 409 | `CONCURRENT_MODIFICATION` |
| Règle métier violée | 422 | code métier propre, par exemple `ORDER_ALREADY_SHIPPED` |
| Erreur inattendue | 500 | `INTERNAL_ERROR`, sans détail technique |

### 4.3 Invariants

- **SC2.INV-1** : toute réponse 4xx ou 5xx du back est en `application/problem+json`, avec `code` et `traceId`. Contrôle : tests d'API sur un cas de chaque statut.
- **SC2.INV-2** : le front ne fonde aucune décision sur `title` ou `detail`. Il décide sur `status` et `code`. Contrôle : revue et tests du gestionnaire d'erreurs.
- **SC2.INV-3** : une erreur 500 ne révèle ni trace de pile, ni requête SQL, ni nom de classe. Contrôle : test d'API provoquant une exception non gérée.

## 5. SC3 : formats de données et pagination

| Donnée | Format JSON | Côté Java | Côté TypeScript |
|---|---|---|---|
| Instant | chaîne ISO 8601 avec fuseau, `2026-10-16T10:15:30Z` | `Instant` ou `OffsetDateTime` | `string`, converti en `Date` au plus près de l'affichage |
| Date calendaire | `2026-10-16` | `LocalDate` | `string` |
| Montant | chaîne décimale `"1234.50"` ou entier en unités mineures, au choix du contrat, jamais flottant | `BigDecimal` ou `long` | `string` ou `number` entier |
| Identifiant | chaîne opaque (UUID recommandé) | `UUID` | `string` |
| Énumération | chaîne en MAJUSCULES | `enum` | union de littéraux générée |
| Absence de valeur | champ absent ou `null`, défini par le contrat pour chaque champ | `Optional` en retour de méthode seulement | `T \| null` ou `T \| undefined`, selon le contrat |

Pagination :

- requête : `?page=0&size=20&sort=createdAt,desc` (pages numérotées à partir de 0, `size` borné côté back, 100 au maximum par défaut) ;
- réponse :

```json
{
  "content": [ { "id": "..." } ],
  "page": { "size": 20, "number": 0, "totalElements": 134, "totalPages": 7 }
}
```

Invariants :

- **SC3.INV-1** : aucune date-heure ne circule sans fuseau. Contrôle : schéma du contrat (`format: date-time`) et tests de sérialisation.
- **SC3.INV-2** : aucun montant n'est représenté en virgule flottante, ni en JSON, ni en Java, ni en base. Contrôle : revue du contrat et recherche de `double`, `float` sur les champs monétaires.
- **SC3.INV-3** : toute liste potentiellement non bornée est paginée, avec une taille maximale imposée par le back. Contrôle : revue des endpoints de collection.

## 6. SC4 : sécurité de la frontière

- Authentification par jeton porteur (`Authorization: Bearer ...`) émis par un fournisseur d'identité OAuth 2.1 / OpenID Connect ; le back est un serveur de ressources qui valide le jeton. Si le projet utilise des cookies de session, la protection CSRF est obligatoire des deux côtés.
- Le front ne contient aucun secret : ni clé d'API privée, ni secret client. Toute configuration du front est publique par nature.
- Aucun jeton ni donnée personnelle dans une URL (paramètre de requête ou chemin), car les URL finissent dans les journaux.
- CORS : liste explicite d'origines par environnement. Jamais `*` quand les identifiants sont autorisés.
- 401 signifie « pas ou plus authentifié » : le front relance l'authentification. 403 signifie « authentifié mais refusé » : le front informe, sans relancer.
- L'autorisation est toujours vérifiée par le back. Masquer un bouton dans le front n'est pas une mesure de sécurité.

Invariants :

- **SC4.INV-1** : aucun secret ni jeton dans le code du front, dans une URL ou dans un journal. Contrôle : recherche de motifs de secrets et revue de la configuration de journalisation.
- **SC4.INV-2** : chaque endpoint non public est protégé par une règle d'autorisation côté back. Contrôle : test d'accès anonyme refusé sur chaque endpoint protégé.
- **SC4.INV-3** : CORS n'autorise jamais `*` avec identifiants. Contrôle : revue de la configuration CORS par environnement.

## 7. SC5 : traçabilité

- Le back propage le contexte W3C Trace Context (`traceparent`) et attache l'identifiant de trace à chaque ligne de journal.
- Chaque Problem Details porte `traceId` (SC2). Le front l'affiche dans le message d'erreur, sous une forme copiable, pour que l'utilisateur puisse le transmettre au support.
- Les journaux ne contiennent ni jeton, ni mot de passe, ni donnée personnelle non nécessaire.

Invariant :

- **SC5.INV-1** : toute erreur 5xx est journalisée côté back avec son `traceId`, et le même `traceId` est renvoyé au front. Contrôle : test d'API et vérification du journal capturé.

## 8. SC6 : accessibilité et messages

- Le front respecte le RGAA 4.1 et le WCAG 2.2 niveau AA.
- Les messages affichés à l'utilisateur sont localisés côté front à partir de `code` et, pour la validation, de `errors[].code`. Le `detail` du back sert de repli seulement.
- Une erreur de validation est associée au champ concerné (programmatiquement, pas seulement visuellement) et annoncée aux technologies d'assistance.
- Le back accepte l'en-tête `Accept-Language` et rédige `title` et `detail` en français par défaut.

Invariants :

- **SC6.INV-1** : chaque erreur de validation renvoyée par le back est rattachée au champ correspondant dans le formulaire du front. Contrôle : test de composant avec une réponse 400 simulée.
- **SC6.INV-2** : aucune information n'est transmise par la couleur seule. Contrôle : revue RGAA (critère 3.1) et tests automatisés d'accessibilité.

## 9. SC7 : événements asynchrones (réservé)

Réservé à une version ultérieure du socle : contrat AsyncAPI, format d'enveloppe d'événement, reprise après déconnexion. En 1.0.0, aucun skill ne doit introduire de canal asynchrone sans le signaler comme écart au socle.

## 10. Règles d'évolution du socle

- Le socle suit le contrat de version de `EVOLUTION.md` à la racine du dépôt.
- Un skill épingle une version du socle dans son `manifest.json` (champ `shared`). L'outil d'assemblage refuse une transmission si la version épinglée ne correspond pas au socle du dépôt.
- Un changement cassant du socle (invariant renforcé, format modifié) passe en version majeure. Chaque skill dépendant décide alors explicitement de monter de version.

## 11. Journal de révision

**1.0.0** (2026-10-16) : première version. Dimensions SC1 à SC6 actives, SC7 réservée.
<<<FIN socle/SKILL.md>>>

<<<FICHIER modules/architecture/SKILL.md>>>
---
name: architecture
description: Architecture d'un back Spring Boot organisé par fonctionnalité et en couches (api, application, domain, infrastructure), avec règles de dépendance vérifiées par ArchUnit. À lire avant de créer une classe, un package ou une fonctionnalité.
dimensions: [D1]
status: active
---

# Module `architecture` (D1)

Ce module fixe où chaque classe doit se trouver et de quoi elle a le droit de dépendre. Les règles sont vérifiées par ArchUnit : une violation fait échouer le build, elle ne dépend pas de la vigilance d'un relecteur.

## 1. Organisation par fonctionnalité, puis par couche

Le code est d'abord découpé par fonctionnalité métier, puis, à l'intérieur de chacune, par couche.

```text
src/main/java/com/acme/app/
├── Application.java
├── shared/                         transverse : configuration, erreurs, sécurité, utilitaires
│   ├── config/                     JacksonConfig (E2), propriétés typées
│   ├── error/                      ApiExceptionHandler (D3), exceptions de base
│   └── security/                   SecurityConfig (D5)
└── order/                          une fonctionnalité métier
    ├── api/                        contrôleurs, DTO (records), mappers DTO ↔ domaine
    ├── application/                services de cas d'usage, frontières transactionnelles
    ├── domain/                     modèle métier, entités, règles, ports (interfaces)
    └── infrastructure/             dépôts Spring Data, clients externes, adaptateurs
```

Dans un projet existant organisé par couche (`controller/`, `service/`, `repository/`), la règle de cohérence locale s'applique : l'expert ne réorganise pas sans demande, mais il applique les mêmes règles de dépendance.

## 2. Règles de dépendance

```mermaid
flowchart TD
  API["api<br/>contrôleurs, DTO"] --> APP["application<br/>cas d'usage, transactions"]
  APP --> DOM["domain<br/>modèle, règles, ports"]
  INF["infrastructure<br/>Spring Data, clients"] --> DOM
  API -.->|"interdit"| INF
  DOM -.->|"interdit"| API
  DOM -.->|"interdit"| APP
  APP -.->|"interdit"| API
```

| Couche | Peut dépendre de | Ne dépend jamais de |
|---|---|---|
| `api` | `application`, `domain` (types de lecture), `shared` | `infrastructure` |
| `application` | `domain`, `shared` | `api`, `org.springframework.web..` |
| `domain` | `shared` (exceptions de base) ; annotations JPA tolérées | `api`, `application`, `infrastructure`, `org.springframework.web..` |
| `infrastructure` | `domain`, `shared` | `api` |

Choix pragmatique : les entités JPA vivent dans `domain` et portent leurs annotations. Séparer un modèle de persistance d'un modèle métier double les classes ; ce n'est justifié que si le domaine est riche et instable, et cela se décide avec le développeur.

Les dépôts Spring Data sont déclarés dans `infrastructure`. Si la couche `application` a besoin d'un accès aux données, elle passe par une interface du `domain` (un port) que le dépôt implémente, ou, dans un projet plus simple, utilise directement l'interface du dépôt : ce second choix est accepté et documenté dans le compte rendu.

## 3. Injection de dépendances

- Injection par constructeur uniquement. Une classe avec un seul constructeur n'a pas besoin d'`@Autowired`.
- Les dépendances sont des champs `private final`.
- Une classe qui reçoit plus de cinq dépendances est un signal de découpage à examiner en revue.

```java
@Service
public class PlaceOrderService {

    private final OrderRepository orders;
    private final Clock clock;

    public PlaceOrderService(OrderRepository orders, Clock clock) {
        this.orders = orders;
        this.clock = clock;
    }
}
```

`Clock` est injecté plutôt qu'appelé statiquement (`Instant.now()`) : les tests fixent l'heure (D6.INV-4).

## 4. Règles ArchUnit

À placer dans `src/test/java/.../ArchitectureTest.java`. ArchUnit n'est pas géré par Spring Boot : sa version est centralisée dans le build (point E4).

```java
@AnalyzeClasses(packages = "com.acme.app", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {

    // D1.INV-1
    @ArchTest
    static final ArchRule domainEtApplicationIndependantsDuWeb = noClasses()
        .that().resideInAnyPackage("..domain..", "..application..")
        .should().dependOnClassesThat()
        .resideInAnyPackage("..api..", "org.springframework.web..");

    // D1.INV-2
    @ArchTest
    static final ArchRule aucuneEntiteDansLesControleurs = noMethods()
        .that().areDeclaredInClassesThat().areAnnotatedWith(RestController.class)
        .should().haveRawReturnType(annotatedWith(Entity.class))
        .orShould().haveRawParameterTypes(DescribedPredicate.describe(
            "un paramètre entité JPA",
            params -> params.stream().anyMatch(p -> p.isAnnotatedWith(Entity.class))));

    // D1.INV-3
    @ArchTest
    static final ArchRule pasDInjectionParChamp = noFields()
        .should().beAnnotatedWith(Autowired.class);

    // D1.INV-4
    @ArchTest
    static final ArchRule fonctionnalitesSansCycle = slices()
        .matching("com.acme.app.(*)..")
        .should().beFreeOfCycles();
}
```

Limite connue de la règle D1.INV-2 : elle ne voit pas une entité enveloppée dans un type générique (`List<Order>`, `ResponseEntity<Order>`). La revue complète ce contrôle (module `revue`, point A2), et le test de conformité au contrat (module `api-rest`) détecte le cas en pratique, car le contrat ne décrit que des DTO.

## 5. Pièges connus

- **Couche `application` qui renvoie des entités au contrôleur** : la conversion en DTO doit se faire avant la sortie de la transaction ou sur des données déjà chargées, sinon une `LazyInitializationException` apparaît (`open-in-view` est désactivé, D4.INV-2).
- **Package `util` fourre-tout** : il finit par dépendre de tout et crée des cycles. Préférer une classe placée dans la fonctionnalité qui l'utilise.
- **Services « God class »** : un service par cas d'usage, ou par agrégat, plutôt qu'un `OrderService` de deux mille lignes.

## 6. Grille de revue (extraits utilisés par le module `revue`)

| Point | Question | Invariant |
|---|---|---|
| A1 | Une classe de `domain` ou `application` importe-t-elle `..api..` ou Spring Web ? | D1.INV-1 |
| A2 | Un contrôleur renvoie-t-il ou reçoit-il une entité, y compris dans un type générique ? | D1.INV-2 |
| A3 | Un champ est-il annoté `@Autowired` ? | D1.INV-3 |
| A4 | Deux fonctionnalités dépendent-elles l'une de l'autre ? | D1.INV-4 |
| A5 | Un service dépasse-t-il cinq dépendances ou plusieurs centaines de lignes ? | hors invariant, signal de découpage |
<<<FIN modules/architecture/SKILL.md>>>

<<<FICHIER modules/langage/SKILL.md>>>
---
name: langage
description: Usage de Java 21 dans le back (records, sealed, pattern matching pour switch, Optional, exceptions, threads virtuels et épinglage). À lire avant d'écrire ou de relire du code Java.
dimensions: [D2]
status: active
---

# Module `langage` (D2)

Ce module fixe comment écrire du Java 21 lisible, immuable par défaut et sûr avec les threads virtuels.

## 1. Records pour les données

Les DTO d'API, les commandes et les résultats de cas d'usage sont des `record` (D2.INV-1). La validation se place sur les composants.

```java
public record CreateOrderRequest(
        @NotNull UUID customerId,
        @NotEmpty List<@Valid OrderLineRequest> lines,
        @Future LocalDate deliveryDate) {

    public CreateOrderRequest {
        lines = List.copyOf(lines);   // copie défensive : la liste reçue devient immuable
    }
}
```

Une entité JPA n'est **pas** un record : JPA exige un constructeur sans argument et des champs modifiables.

## 2. Types scellés et `switch` exhaustif

Un résultat métier à plusieurs issues se modélise avec une interface scellée. Le `switch` sur un type scellé est exhaustif : ajouter un cas fait échouer la compilation partout où il n'est pas traité.

```java
public sealed interface PaymentResult
        permits PaymentResult.Accepted, PaymentResult.Refused, PaymentResult.Pending {
    record Accepted(String transactionId) implements PaymentResult {}
    record Refused(String reasonCode) implements PaymentResult {}
    record Pending(Instant retryAfter) implements PaymentResult {}
}

String describe(PaymentResult result) {
    return switch (result) {
        case PaymentResult.Accepted a -> "acceptée : " + a.transactionId();
        case PaymentResult.Refused r  -> "refusée : " + r.reasonCode();
        case PaymentResult.Pending p  -> "en attente jusqu'à " + p.retryAfter();
    };
}
```

Pas de branche `default` sur un `switch` exhaustif : elle supprimerait la vérification du compilateur.

## 3. `Optional` et absence de valeur

- `Optional` est un type de retour, jamais un champ ni un paramètre (D2.INV-2).
- `Optional.get()` sans vérification est interdit ; utiliser `orElseThrow(...)` avec une exception métier explicite.
- Une collection vide plutôt que `null` ou `Optional<List<...>>`.

```java
Order order = orders.findById(id)
        .orElseThrow(() -> new NotFoundException("ORDER_NOT_FOUND", id));
```

## 4. Exceptions

- Les exceptions métier héritent d'une base commune portant un `code` stable (socle SC2). Le gestionnaire d'erreurs (module `api-rest`) les traduit en Problem Details.
- Un `catch` traite, relance ou traduit ; il n'avale jamais (D2.INV-4). Journaliser puis continuer n'est acceptable que si l'échec est réellement sans conséquence, et cela se justifie en commentaire.
- On ne capture pas `Exception` ou `Throwable` au milieu du code métier.

```java
public abstract class BusinessException extends RuntimeException {
    private final String code;
    protected BusinessException(String code, String message) {
        super(message);
        this.code = code;
    }
    public String code() { return code; }
}
```

## 5. Threads virtuels

Spring Boot 3.2 et plus active les threads virtuels avec `spring.threads.virtual.enabled=true`. Les requêtes HTTP et les tâches `@Async` s'exécutent alors sur des threads virtuels.

En Java 21, un thread virtuel qui exécute une entrée-sortie bloquante à l'intérieur d'un bloc `synchronized` reste **épinglé** à son thread porteur. Sous charge, les porteurs s'épuisent et l'application se fige. D'où D2.INV-3 :

```java
// Interdit avec les threads virtuels en Java 21 : appel HTTP bloquant sous synchronized
synchronized (this) {
    response = restClient.get().uri(url).retrieve().body(Rate.class);
}

// Correct : verrou explicite
private final ReentrantLock lock = new ReentrantLock();

lock.lock();
try {
    response = restClient.get().uri(url).retrieve().body(Rate.class);
} finally {
    lock.unlock();
}
```

Le diagnostic se fait avec `-Djdk.tracePinnedThreads=full` en environnement de test. Ce problème est corrigé dans les versions ultérieures de Java (dimension D8), mais pas en Java 21.

Autres règles avec threads virtuels :

- pas de pool de threads virtuels : on en crée un par tâche (`Executors.newVirtualThreadPerTaskExecutor()`) ;
- la taille du pool de connexions JDBC (HikariCP) reste la vraie limite de concurrence vers PostgreSQL ; ne pas l'augmenter sans mesure ;
- les `ThreadLocal` coûteux sont à éviter, car il peut y avoir des millions de threads virtuels.

## 6. Autres règles

- `var` pour les variables locales dont le type est évident à la lecture de la ligne ; type explicite sinon.
- Blocs de texte (`"""`) pour le SQL natif et le JSON de test.
- Collections immuables (`List.of`, `List.copyOf`) pour tout ce qui sort d'une méthode publique.
- Pas d'`Instant.now()` ni de `LocalDate.now()` dans le code métier : `Clock` injecté.
- Montants en `BigDecimal` avec une échelle et un mode d'arrondi explicites (socle SC3.INV-2).

## 7. Pièges connus

- **`equals` et `hashCode` des entités** : ne pas utiliser un record, ni Lombok `@Data`, sur une entité JPA. Fonder l'égalité sur l'identifiant métier, ou sur l'identifiant technique avec une valeur de hachage constante.
- **Lombok** : toléré s'il est déjà dans le projet, jamais introduit sans validation ; les records couvrent la plupart des besoins.
- **`BigDecimal.equals`** compare aussi l'échelle (`1.0` ≠ `1.00`) ; utiliser `compareTo` pour une égalité de valeur.

## 8. Grille de revue

| Point | Question | Invariant |
|---|---|---|
| L1 | Un DTO d'API est-il une classe modifiable au lieu d'un record ? | D2.INV-1 |
| L2 | `Optional` apparaît-il en champ ou en paramètre ? `Optional.get()` sans garde ? | D2.INV-2 |
| L3 | Les threads virtuels sont-ils activés, et un `synchronized` englobe-t-il une E/S ? | D2.INV-3 |
| L4 | Un `catch` est-il vide, ou se limite-t-il à journaliser sans justification ? | D2.INV-4 |
| L5 | `Instant.now()`, `LocalDate.now()` dans le code métier ? `double` pour un montant ? | SC3.INV-2, D6.INV-4 |
<<<FIN modules/langage/SKILL.md>>>

<<<FICHIER modules/api-rest/SKILL.md>>>
---
name: api-rest
description: API REST Spring MVC conforme au socle back-front (contrat OpenAPI comme source de vérité, interfaces générées, validation Bean Validation, Problem Details RFC 9457 avec code et traceId, pagination stable). À lire avant d'écrire ou de relire un contrôleur, un DTO ou le gestionnaire d'erreurs.
dimensions: [D3]
status: active
---

# Module `api-rest` (D3)

Ce module applique côté Spring les dimensions SC1 à SC3 du socle. Il ne redéfinit pas le socle : il dit comment le respecter avec Spring Boot 3.5.

## 1. Chaîne d'une requête

```mermaid
sequenceDiagram
  participant F as Front
  participant SEC as Chaîne de sécurité
  participant C as Contrôleur (implémente l'interface générée)
  participant V as Bean Validation
  participant S as Service (application)
  participant H as ApiExceptionHandler
  F->>SEC: POST /api/v1/orders + Bearer
  SEC->>C: requête authentifiée
  C->>V: @Valid CreateOrderRequest
  alt entrée invalide
    V-->>H: MethodArgumentNotValidException
    H-->>F: 400 problem+json, code VALIDATION_FAILED, errors[]
  else entrée valide
    C->>S: placeOrder(command)
    alt règle métier violée
      S-->>H: BusinessException(code)
      H-->>F: 422 problem+json, code métier
    else succès
      S-->>C: résultat
      C-->>F: 201 + DTO + Location
    end
  end
```

## 2. Contrat d'abord

Le contrat `api/openapi.yaml` est la source de vérité (SC1). Il génère les interfaces Java, que les contrôleurs implémentent. Une divergence de signature devient une erreur de compilation.

```xml
<plugin>
  <groupId>org.openapitools</groupId>
  <artifactId>openapi-generator-maven-plugin</artifactId>
  <version>${openapi-generator.version}</version>   <!-- centralisée, point E4 -->
  <executions>
    <execution>
      <goals><goal>generate</goal></goals>
      <configuration>
        <inputSpec>${project.basedir}/api/openapi.yaml</inputSpec>
        <generatorName>spring</generatorName>
        <apiPackage>com.acme.app.api.generated</apiPackage>
        <modelPackage>com.acme.app.api.generated.model</modelPackage>
        <configOptions>
          <interfaceOnly>true</interfaceOnly>
          <useSpringBoot3>true</useSpringBoot3>
          <useTags>true</useTags>
          <openApiNullable>false</openApiNullable>
        </configOptions>
      </configuration>
    </execution>
  </executions>
</plugin>
```

Remarques :

- les modèles générés sont des classes, pas des records ; D2.INV-1 s'applique aux DTO écrits à la main. Si le projet génère ses modèles, la règle D2.INV-1 est satisfaite par la génération et notée comme telle en revue ;
- si le projet est en « code d'abord » (annotations springdoc, contrat produit par l'application), l'expert ne le convertit pas sans demande. Il applique alors le test de conformité du paragraphe 7, qui compare le contrat produit au fichier du dépôt.

## 3. Contrôleur

```java
@RestController
public class OrderController implements OrdersApi {      // interface générée

    private final PlaceOrderService placeOrder;
    private final OrderQueries queries;

    public OrderController(PlaceOrderService placeOrder, OrderQueries queries) {
        this.placeOrder = placeOrder;
        this.queries = queries;
    }

    @Override
    public ResponseEntity<OrderDto> createOrder(CreateOrderRequest request) {
        OrderView created = placeOrder.handle(OrderMapper.toCommand(request));   // record de la couche application
        URI location = URI.create("/api/v1/orders/" + created.id());
        return ResponseEntity.created(location).body(OrderMapper.toDto(created));
    }
}
```

Règles :

- la couche `application` ne connaît pas les DTO de l'API (D1.INV-1) : elle reçoit une commande et renvoie un record qui lui est propre (`OrderView`) ; `OrderMapper`, dans `api`, fait les deux conversions ;
- un contrôleur ne contient pas de logique métier : il traduit, délègue et répond ;
- pas de `try/catch` dans un contrôleur : les exceptions remontent au gestionnaire unique ;
- statuts : 201 avec `Location` pour une création, 204 pour une suppression ou une action sans corps, 200 sinon.

## 4. Validation

- `@Valid` sur tout corps de requête ; contraintes Bean Validation sur les paramètres de chemin et de requête (le contrôleur porte alors `@Validated`, ou la génération ajoute les annotations).
- Les règles métier qui dépendent de l'état (stock, statut d'une commande) ne sont pas de la validation d'entrée : elles vivent dans `domain` ou `application` et lèvent une `BusinessException` (422).
- Les messages des contraintes sont en français, dans `ValidationMessages.properties`.

## 5. Gestionnaire d'erreurs unique

`spring.mvc.problemdetails.enabled=true` active les Problem Details pour les exceptions standard de Spring MVC. Le gestionnaire du projet les complète avec `code`, `traceId` et `errors[]` (SC2).

```java
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    private final Tracer tracer;   // Micrometer Tracing

    public ApiExceptionHandler(Tracer tracer) {
        this.tracer = tracer;
    }

    @ExceptionHandler(BusinessException.class)
    ProblemDetail onBusiness(BusinessException ex) {
        HttpStatus status = (ex instanceof NotFoundException) ? HttpStatus.NOT_FOUND
                          : HttpStatus.UNPROCESSABLE_ENTITY;
        return enrich(ProblemDetail.forStatusAndDetail(status, ex.getMessage()), ex.code());
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    ProblemDetail onConcurrency(ObjectOptimisticLockingFailureException ex) {
        return enrich(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,
                "La ressource a été modifiée entre-temps."), "CONCURRENT_MODIFICATION");
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail onUnexpected(Exception ex) {
        log.error("Erreur inattendue", ex);              // la trace complète reste dans le journal
        return enrich(ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR,
                "Une erreur inattendue est survenue."), "INTERNAL_ERROR");   // SC2.INV-3
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        ProblemDetail problem = enrich(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,
                "La requête contient " + ex.getErrorCount() + " erreur(s)."), "VALIDATION_FAILED");
        problem.setProperty("errors", ex.getFieldErrors().stream()
                .map(e -> Map.of("field", e.getField(),
                                 "code", String.valueOf(e.getCode()).toUpperCase(Locale.ROOT),
                                 "message", String.valueOf(e.getDefaultMessage())))
                .toList());
        return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_PROBLEM_JSON).body(problem);
    }

    private ProblemDetail enrich(ProblemDetail problem, String code) {
        problem.setType(URI.create("https://errors.acme.example/" + code.toLowerCase(Locale.ROOT)));
        problem.setProperty("code", code);
        Span span = tracer.currentSpan();
        problem.setProperty("traceId", span != null ? span.context().traceId() : "inconnu");
        return problem;
    }

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);
}
```

Les autres exceptions standard (`HttpMessageNotReadableException`, `MissingServletRequestParameterException`, etc.) sont produites par `ResponseEntityExceptionHandler`. Pour leur ajouter `code` et `traceId`, surcharger `handleExceptionInternal` et appeler `enrich` sur le `ProblemDetail` du corps.

Les erreurs 401 et 403 levées par la chaîne de sécurité **ne passent pas** par ce gestionnaire : voir le module `securite` (D5.INV-2).

## 6. Pagination

```java
@Configuration
@EnableSpringDataWebSupport(pageSerializationMode = PageSerializationMode.VIA_DTO)
class WebConfig {}
```

```yaml
spring:
  data:
    web:
      pageable:
        max-page-size: 100      # SC3.INV-3
        default-page-size: 20
```

Le mode `VIA_DTO` (Spring Data 3.3 et plus) sérialise un `Page` sous la forme stable `{ "content": [...], "page": { "size", "number", "totalElements", "totalPages" } }`, qui est exactement celle du socle. Sérialiser directement un `PageImpl` donne une structure instable, signalée par un avertissement au démarrage.

Avec des interfaces générées, déclarer dans le contrat un schéma `PagedXxx` conforme au socle et le construire explicitement dans le contrôleur.

## 7. Test de conformité au contrat (D3.INV-1)

En contrat d'abord, la compilation vérifie les signatures. Il reste à vérifier qu'aucun endpoint **non décrit** n'est exposé :

```java
@SpringBootTest
@AutoConfigureMockMvc
class ContractConformanceTest {

    @Autowired RequestMappingHandlerMapping mappings;

    @Test
    void chaqueEndpointExposeFigureDansLeContrat() throws Exception {
        Set<String> contrat = OpenApiPaths.read(Path.of("api/openapi.yaml"));   // "GET /api/v1/orders/{id}"
        Set<String> exposes = mappings.getHandlerMethods().keySet().stream()
                .flatMap(info -> OpenApiPaths.fromMapping(info).stream())
                .filter(p -> p.contains(" /api/"))
                .collect(Collectors.toSet());
        assertThat(exposes).isEqualTo(contrat);
    }
}
```

`OpenApiPaths` est un utilitaire de test du projet (lecture YAML, normalisation des méthodes et des variables de chemin). Le test injecte un champ avec `@Autowired`, ce qui est admis dans les tests : la règle D1.INV-3 est vérifiée sur le code de production uniquement (`ImportOption.DoNotIncludeTests`).

## 8. Pièges connus

- **`@ExceptionHandler(Exception.class)` qui capture `AccessDeniedException`** levée par `@PreAuthorize` : elle deviendrait un 500. Ajouter un gestionnaire explicite pour `AccessDeniedException` (403) et `AuthenticationException` (401), conformes au socle.
- **`ResponseEntity<Map<String, Object>>`** en retour : contourne le contrat. Toujours un DTO typé.
- **Énumérations Java sérialisées par leur `ordinal`** : jamais ; nom en MAJUSCULES (socle SC1).
- **Dates** : `spring.jackson.serialization.write-dates-as-timestamps=false` est le comportement par défaut de Spring Boot ; ne pas le changer (SC3.INV-1).

## 9. Grille de revue

| Point | Question | Invariant |
|---|---|---|
| R1 | Un endpoint est-il absent du contrat, ou un endpoint du contrat non implémenté ? | D3.INV-1, SC1.INV-1 |
| R2 | Un corps de requête est-il reçu sans `@Valid` ? | D3.INV-2 |
| R3 | Une erreur sort-elle sans `code` ou sans `traceId`, ou ailleurs que par le gestionnaire unique ? | D3.INV-3, SC2.INV-1 |
| R4 | Une réponse 500 contient-elle un message technique ? | SC2.INV-3 |
| R5 | Une collection est-elle renvoyée sans pagination ou sans taille maximale ? | D3.INV-4, SC3.INV-3 |
| R6 | Le contrat change-t-il de façon cassante dans `v1` ? | SC1.INV-2 |
<<<FIN modules/api-rest/SKILL.md>>>

<<<FICHIER modules/persistance/SKILL.md>>>
---
name: persistance
description: Persistance Spring Data JPA, Hibernate 6.6 et PostgreSQL (migrations Flyway versionnées, ddl-auto validate, open-in-view désactivé, transactions dans la couche application, N+1, verrou optimiste, types PostgreSQL, Testcontainers). À lire avant de toucher une entité, un dépôt, une requête ou une migration.
dimensions: [D4]
status: active
---

# Module `persistance` (D4)

Ce module fixe comment le back parle à PostgreSQL. Le schéma de la base appartient aux migrations Flyway, jamais à Hibernate.

## 1. Vue d'ensemble

```mermaid
flowchart LR
  SVC["Service application<br/>@Transactional"] --> REPO["Dépôt Spring Data<br/>infrastructure"]
  REPO --> HIB["Hibernate 6.6<br/>ddl-auto = validate"]
  HIB --> POOL["HikariCP"]
  POOL --> PG[("PostgreSQL")]
  FLY["Flyway<br/>db/migration/V*.sql"] -->|"au démarrage, avant JPA"| PG
  HIB -.->|"vérifie que les entités<br/>correspondent au schéma"| PG
```

## 2. Configuration minimale

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USER}
    password: ${DB_PASSWORD}            # jamais en clair dans le dépôt (D5)
  jpa:
    open-in-view: false                 # D4.INV-2
    hibernate:
      ddl-auto: validate                # D4.INV-1
    properties:
      hibernate:
        jdbc:
          time_zone: UTC
  flyway:
    enabled: true
    locations: classpath:db/migration
```

Dépendances : `spring-boot-starter-data-jpa`, `org.postgresql:postgresql`, `org.flywaydb:flyway-core` **et** `org.flywaydb:flyway-database-postgresql` (le support de PostgreSQL est un module séparé depuis Flyway 10).

## 3. Migrations Flyway

```text
src/main/resources/db/migration/
├── V1__create_customer.sql
├── V2__create_purchase_order.sql
├── V3__add_order_status_index.sql
└── V4__add_order_version_column.sql
```

Règles :

- une migration appliquée dans un environnement partagé n'est **jamais** modifiée (D4.INV-1). Une correction est une nouvelle migration. Flyway le contrôle par somme de contrôle ;
- noms de tables et colonnes en `snake_case`, tables au singulier ou au pluriel selon la convention du projet, mais une seule convention ;
- chaque clé étrangère a son index (PostgreSQL ne le crée pas automatiquement) ;
- les migrations longues sur grosse table (`CREATE INDEX`) utilisent `CREATE INDEX CONCURRENTLY`, dans une migration dédiée et non transactionnelle : un fichier de configuration de script placé à côté du script (`V5__add_order_date_index.sql.conf`, contenant `executeInTransaction=false`). Vérifier ce mécanisme dans la documentation de la version de Flyway gérée par le projet ;
- pas de données de test dans `db/migration` : elles vont dans un emplacement réservé aux tests.

```sql
-- V2__create_purchase_order.sql
CREATE TABLE purchase_order (
    id           UUID PRIMARY KEY,
    customer_id  UUID        NOT NULL REFERENCES customer (id),
    status       VARCHAR(32) NOT NULL,
    total_amount NUMERIC(19, 2) NOT NULL,          -- SC3.INV-2 : jamais de flottant
    created_at   TIMESTAMPTZ NOT NULL,             -- SC3.INV-1 : toujours avec fuseau
    version      BIGINT      NOT NULL DEFAULT 0    -- D4.INV-6
);
CREATE INDEX idx_purchase_order_customer ON purchase_order (customer_id);
```

## 4. Correspondance des types

| PostgreSQL | Java | Remarque |
|---|---|---|
| `uuid` | `UUID` | identifiant généré côté application (`UUID.randomUUID()`) ou `@UuidGenerator` |
| `timestamptz` | `Instant` ou `OffsetDateTime` | stocké en UTC ; jamais `timestamp` sans fuseau pour un instant |
| `date` | `LocalDate` | |
| `numeric(p, s)` | `BigDecimal` | précision et échelle explicites |
| `varchar(n)` | `String` ou `enum` avec `@Enumerated(EnumType.STRING)` | jamais `EnumType.ORDINAL` |
| `jsonb` | type dédié ou `Map` avec `@JdbcTypeCode(SqlTypes.JSON)` | Hibernate 6 le gère sans bibliothèque tierce |
| `bigint` | `long` ou `Long` | pour `@Version` |

## 5. Entité

```java
@Entity
@Table(name = "purchase_order")
public class PurchaseOrder {

    @Id
    private UUID id;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private OrderStatus status;

    @Column(name = "total_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Version
    private long version;                               // D4.INV-6

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderLine> lines = new ArrayList<>();

    protected PurchaseOrder() {}                        // exigé par JPA

    public static PurchaseOrder place(UUID customerId, List<OrderLine> lines, Clock clock) {
        PurchaseOrder order = new PurchaseOrder();
        order.id = UUID.randomUUID();
        order.customerId = customerId;
        order.status = OrderStatus.PLACED;
        order.createdAt = clock.instant();
        lines.forEach(order::addLine);
        order.totalAmount = order.computeTotal();
        return order;
    }

    public void ship() {
        if (status != OrderStatus.PLACED) {
            throw new OrderNotShippableException(id, status);   // 422, code ORDER_NOT_SHIPPABLE
        }
        status = OrderStatus.SHIPPED;
    }
    // addLine, computeTotal, accesseurs en lecture...
}
```

Règles : pas de setters publics sur l'état métier ; les transitions passent par des méthodes qui vérifient les règles. Relations `@ManyToOne` en `FetchType.LAZY` explicitement (la valeur par défaut est `EAGER`).

## 6. Transactions

```mermaid
flowchart TD
  C["Contrôleur<br/>aucune transaction"] --> S["Service application<br/>@Transactional"]
  S --> R1["dépôt : lecture"]
  S --> D["entité : règle métier"]
  S --> R2["dépôt : écriture"]
  S -->|"conversion en DTO<br/>avant la fin de la transaction"| C
```

- `@Transactional` se place sur les services de la couche `application` (D4.INV-3) ; `@Transactional(readOnly = true)` pour les lectures.
- Pas de `@Transactional` sur un contrôleur. Pas d'appel HTTP externe dans une transaction : il garderait une connexion JDBC occupée pendant l'appel.
- Une méthode `@Transactional` appelée depuis la même classe ne crée pas de transaction (proxy Spring contourné).

## 7. Requêtes et N+1

- Lecture d'un agrégat avec ses enfants : `@EntityGraph` ou `JOIN FETCH`.
- Requêtes paramétrées uniquement (D4.INV-4) : paramètres nommés en JPQL, `:param` en SQL natif, jamais de concaténation.
- Pagination avec `JOIN FETCH` sur une collection : Hibernate pagine alors en mémoire et l'annonce par un avertissement ; paginer d'abord les identifiants, puis charger les agrégats.
- Projections (interface ou record) pour les écrans de liste : ne charger que les colonnes affichées.

```java
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID> {

    @EntityGraph(attributePaths = "lines")
    Optional<PurchaseOrder> findWithLinesById(UUID id);

    @Query("""
           select new com.acme.app.order.domain.OrderSummary(o.id, o.status, o.totalAmount, o.createdAt)
           from PurchaseOrder o
           where o.customerId = :customerId
           """)
    Page<OrderSummary> findSummaries(@Param("customerId") UUID customerId, Pageable pageable);
}
```

Pour détecter les N+1 en test, activer `spring.jpa.properties.hibernate.generate_statistics=true` dans un test ciblé et vérifier le nombre de requêtes, ou utiliser une bibliothèque de comptage déjà présente dans le projet.

## 8. Tests de persistance

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class PurchaseOrderRepositoryTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired PurchaseOrderRepository orders;

    @Test
    void chargeLaCommandeAvecSesLignesEnUneRequete() {
        // ... D4, N+1
    }
}
```

- `@ServiceConnection` (Spring Boot 3.1 et plus) configure la source de données à partir du conteneur.
- `@DataJpaTest` exécute les migrations Flyway : le test vérifie donc aussi que les migrations s'appliquent et que `ddl-auto=validate` passe.
- L'image PostgreSQL du test a la même version majeure que la production (D4.INV-5).

## 9. Pièges connus

- **`spring.jpa.open-in-view`** est à `true` par défaut dans Spring Boot, avec un simple avertissement au démarrage. Il doit être désactivé explicitement.
- **`ddl-auto=update`** en dehors d'un prototype : interdit. Le schéma dérive silencieusement des migrations.
- **`saveAll` en boucle sur des milliers d'entités** : activer le traitement par lots (`hibernate.jdbc.batch_size`) et vider le contexte de persistance régulièrement.
- **`@Version` absent** : deux utilisateurs qui modifient la même commande, le dernier écrase le premier sans avertissement.
- **Fuseau horaire** : sans `hibernate.jdbc.time_zone=UTC`, les conversions dépendent du fuseau de la JVM.

## 10. Grille de revue

| Point | Question | Invariant |
|---|---|---|
| P1 | Une migration déjà appliquée est-elle modifiée ? `ddl-auto` est-il autre que `validate` ? | D4.INV-1 |
| P2 | `open-in-view` est-il absent ou à `true` ? | D4.INV-2 |
| P3 | `@Transactional` apparaît-il hors de la couche `application`, ou manque-t-il `readOnly` sur une lecture ? | D4.INV-3 |
| P4 | Une requête est-elle construite par concaténation ? | D4.INV-4 |
| P5 | Un test de dépôt utilise-t-il H2 ou une base en mémoire ? | D4.INV-5 |
| P6 | Une entité modifiée de façon concurrente n'a-t-elle pas de `@Version` ? | D4.INV-6 |
| P7 | Une boucle charge-t-elle une relation paresseuse élément par élément (N+1) ? | hors invariant, performance |
| P8 | Une clé étrangère est-elle sans index ? Un instant en `timestamp` sans fuseau ? Un montant en `double` ? | SC3.INV-1, SC3.INV-2 |
<<<FIN modules/persistance/SKILL.md>>>

<<<FICHIER modules/securite/SKILL.md>>>
---
name: securite
description: Sécurité d'un back Spring Boot 3.5 avec Spring Security 6.5 (chaîne de filtres refusant par défaut, serveur de ressources OAuth2 JWT, autorisation par méthode, CORS, erreurs 401 et 403 en Problem Details, Actuator, secrets, journaux). À lire avant de modifier la configuration de sécurité, un endpoint protégé ou la journalisation.
dimensions: [D5]
status: active
---

# Module `securite` (D5)

Ce module applique côté Spring la dimension SC4 du socle. L'autorisation est toujours décidée par le back.

## 1. Chaîne de sécurité

```mermaid
flowchart TD
  REQ(["Requête HTTP"]) --> CORS["CORS<br/>origines explicites"]
  CORS --> AUTH{"Jeton Bearer valide ?"}
  AUTH -->|"absent ou invalide<br/>sur route protégée"| E401["401 problem+json<br/>UNAUTHENTICATED"]
  AUTH -->|"valide ou route publique"| RULES{"Règle d'URL<br/>authorizeHttpRequests"}
  RULES -->|refus| E403["403 problem+json<br/>FORBIDDEN"]
  RULES -->|accord| CTRL["Contrôleur"]
  CTRL --> METH{"@PreAuthorize<br/>sur le service"}
  METH -->|refus| E403B["403 via ApiExceptionHandler"]
  METH -->|accord| OK(["Traitement"])
```

## 2. Configuration

```java
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain api(HttpSecurity http, ProblemAuthenticationEntryPoint entryPoint,
                            ProblemAccessDeniedHandler deniedHandler) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())          // API sans cookie de session ; voir § 4
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()   // D5.INV-3
                .requestMatchers(HttpMethod.GET, "/api/v1/catalog/**").permitAll()   // exception publique explicite
                .anyRequest().authenticated())                                        // D5.INV-1
            .oauth2ResourceServer(o -> o
                .jwt(Customizer.withDefaults())
                .authenticationEntryPoint(entryPoint))
            .exceptionHandling(e -> e
                .authenticationEntryPoint(entryPoint)                                 // D5.INV-2
                .accessDeniedHandler(deniedHandler))
            .build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(CorsProperties props) {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(props.allowedOrigins());            // liste explicite, SC4.INV-3
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE"));
        cors.setAllowedHeaders(List.of("Authorization", "Content-Type", "traceparent"));
        cors.setExposedHeaders(List.of("Location"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", cors);
        return source;
    }
}
```

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${OIDC_ISSUER_URI}
```

`issuer-uri` permet de découvrir les clés de signature du fournisseur d'identité. Les rôles se lisent dans une revendication du jeton, convertie par un `JwtAuthenticationConverter` adapté au fournisseur (la revendication varie selon Keycloak, Entra ID, etc. : à confirmer avec le développeur).

## 3. Erreurs 401 et 403 conformes au socle

La chaîne de sécurité s'exécute avant Spring MVC : ses erreurs ne passent pas par `@RestControllerAdvice`. Il faut donc produire les Problem Details dans le point d'entrée et le gestionnaire de refus.

```java
@Component
public class ProblemAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ProblemWriter writer;   // classe partagée avec ProblemAccessDeniedHandler

    public ProblemAuthenticationEntryPoint(ProblemWriter writer) {
        this.writer = writer;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException ex) throws IOException {
        writer.write(response, HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED",
                "Authentification requise.", request.getRequestURI());
    }
}
```

`ProblemWriter` construit le même `ProblemDetail` que `ApiExceptionHandler.enrich` (`code`, `traceId`, `type`), le sérialise avec l'`ObjectMapper` de Spring (point E2) et écrit `Content-Type: application/problem+json`. Un seul endroit construit les Problem Details de sécurité.

## 4. Cookies et CSRF

Si le front s'authentifie par cookie de session (par exemple derrière une passerelle qui gère le jeton), désactiver CSRF est une faille. Il faut alors :

- `csrf(c -> c.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))` et la gestion de jeton adaptée aux applications monopage décrite dans la documentation Spring Security ;
- côté Angular, `HttpClient` renvoie l'en-tête `X-XSRF-TOKEN` (module `routage-securite` de l'expert Angular).

L'expert demande quel mode d'authentification est utilisé avant de toucher à CSRF.

## 5. Autorisation par méthode

```java
@Service
public class ShipOrderService {

    @Transactional
    @PreAuthorize("hasRole('LOGISTICS')")
    public void ship(UUID orderId) { /* ... */ }
}
```

- Les règles d'URL protègent des zones ; `@PreAuthorize` protège des actions. Les deux se complètent.
- Le contrôle d'appartenance (« cette commande appartient-elle à ce client ? ») se fait dans le service, sur les données chargées, pas seulement sur le rôle.

## 6. Secrets, Actuator et journaux

- Secrets fournis par variables d'environnement ou gestionnaire de secrets ; jamais dans `application.yml` versionné, ni dans un test (D5, SC4.INV-1).
- Actuator : `management.endpoints.web.exposure.include=health,info` ; les autres endpoints sur un port de gestion non exposé, ou authentifiés (D5.INV-3). `health` ne montre pas le détail des composants aux anonymes (`management.endpoint.health.show-details=when-authorized`).
- Journaux : jamais l'en-tête `Authorization`, un jeton, un mot de passe, ni le corps complet d'une requête contenant des données personnelles (D5.INV-4).

## 7. Tests de sécurité

```java
@WebMvcTest(OrderController.class)
@Import({SecurityConfig.class, ProblemAuthenticationEntryPoint.class,
         ProblemAccessDeniedHandler.class, ProblemWriter.class})
class OrderControllerSecurityTest {

    @Autowired MockMvc mvc;
    @MockitoBean PlaceOrderService placeOrder;     // E3
    @MockitoBean OrderQueries queries;
    @MockitoBean JwtDecoder jwtDecoder;            // évite la découverte de l'émetteur réel

    @Test
    void refuseUnAppelAnonymeAvecUnProblemDetail() throws Exception {
        mvc.perform(get("/api/v1/orders/{id}", UUID.randomUUID()))
           .andExpect(status().isUnauthorized())
           .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
           .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));         // D5.INV-2
    }

    @Test
    void accepteUnAppelAuthentifie() throws Exception {
        mvc.perform(get("/api/v1/orders/{id}", UUID.randomUUID())
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_CUSTOMER"))))
           .andExpect(status().isOk());
    }
}
```

`jwt()` vient de `spring-security-test` (`SecurityMockMvcRequestPostProcessors`). Le test exige aussi un bean `Tracer` si `ProblemWriter` en dépend : le fournir par `@MockitoBean` ou par la configuration de test de traçage du projet.

Pour SC4.INV-2, un test paramétré parcourt les endpoints protégés du contrat et vérifie qu'un appel anonyme reçoit 401.

## 8. Pièges connus

- **`WebSecurityConfigurerAdapter`** : supprimé depuis Spring Security 6. Toujours un bean `SecurityFilterChain`.
- **`requestMatchers` trop larges placés avant les plus précis** : l'ordre compte, la première règle qui correspond l'emporte.
- **`permitAll` sur `/error`** oublié : en Spring Boot 3, une erreur interne redirigée vers `/error` peut se transformer en 401. Les Problem Details du gestionnaire unique évitent la plupart de ces cas ; tester une 500 provoquée en appel authentifié.
- **CORS configuré dans Spring MVC seulement** : sans `.cors(...)` dans la chaîne de sécurité, la requête préliminaire `OPTIONS` est refusée avant d'atteindre MVC.

## 9. Grille de revue

| Point | Question | Invariant |
|---|---|---|
| S1 | La chaîne refuse-t-elle par défaut ? Chaque exception publique est-elle explicite et justifiée ? | D5.INV-1, SC4.INV-2 |
| S2 | Les 401 et 403 de la chaîne sont-ils des Problem Details avec `code` et `traceId` ? | D5.INV-2 |
| S3 | Un endpoint Actuator autre que `health` ou `info` est-il public ? | D5.INV-3 |
| S4 | Un secret, un jeton ou une donnée personnelle apparaît-il dans le code, la configuration versionnée ou un journal ? | D5.INV-4, SC4.INV-1 |
| S5 | CORS autorise-t-il `*` avec identifiants, ou une origine non justifiée ? | SC4.INV-3 |
| S6 | CSRF est-il désactivé alors que l'authentification passe par un cookie ? | hors invariant, faille, gravité bloquante |
| S7 | Une action sensible n'est-elle protégée que par une règle d'URL, sans contrôle d'appartenance ? | hors invariant, faille potentielle |
<<<FIN modules/securite/SKILL.md>>>

<<<FICHIER modules/tests/SKILL.md>>>
---
name: tests
description: Stratégie de tests et de contrôles d'un back Spring Boot 3.5 (pyramide, tests unitaires sans Spring, tranches WebMvcTest et DataJpaTest, Testcontainers, MockitoBean, ArchUnit, correspondance invariants vers contrôles). À lire avant d'écrire un test ou de déclarer un invariant couvert.
dimensions: [D6]
status: active
---

# Module `tests` (D6)

Ce module transforme les invariants du skill en contrôles qui s'exécutent. Il répond à une question : pour chaque règle, qu'est-ce qui échoue si elle est violée ?

## 1. Pyramide

```mermaid
flowchart TB
  E2E["Tests de bout en bout<br/>@SpringBootTest + Testcontainers<br/>quelques parcours critiques"]
  SLICE["Tests de tranche<br/>@WebMvcTest, @DataJpaTest<br/>contrôleurs, sécurité, dépôts"]
  UNIT["Tests unitaires<br/>sans Spring : domaine, services, mappers"]
  ARCH["Règles ArchUnit<br/>architecture, conventions"]
  E2E --- SLICE --- UNIT
  ARCH -.-> UNIT
```

| Niveau | Outil | Démarre Spring ? | Ce qu'il vérifie |
|---|---|---|---|
| Unitaire | JUnit 5, AssertJ, Mockito | non (D6.INV-2) | règles métier, services avec dépendances simulées |
| Tranche web | `@WebMvcTest`, `MockMvc`, `spring-security-test` | partiellement | sérialisation, validation, Problem Details, sécurité |
| Tranche données | `@DataJpaTest`, Testcontainers | partiellement | requêtes, migrations, mapping, N+1 |
| Intégration | `@SpringBootTest`, Testcontainers | entièrement | parcours critiques, conformité au contrat |
| Architecture | ArchUnit | non | règles de dépendance et conventions |

## 2. Test unitaire sans Spring

```java
class PlaceOrderServiceTest {

    private final PurchaseOrderRepository orders = mock(PurchaseOrderRepository.class);
    private final Clock clock = Clock.fixed(Instant.parse("2026-10-16T10:00:00Z"), ZoneOffset.UTC);
    private final PlaceOrderService service = new PlaceOrderService(orders, clock);

    @Test
    void calculeLeTotalEnBigDecimalSansPerteDePrecision() {
        var command = new PlaceOrderCommand(CUSTOMER_ID, List.of(
                new LineCommand(PRODUCT_A, 3, new BigDecimal("19.99"))));

        OrderView result = service.handle(command);

        assertThat(result.totalAmount()).isEqualByComparingTo("59.97");
    }
}
```

`Clock.fixed` rend le test indépendant de l'heure réelle (D6.INV-4). `isEqualByComparingTo` compare la valeur d'un `BigDecimal` sans tenir compte de l'échelle.

## 3. Tranche web

```java
@WebMvcTest(OrderController.class)
@Import({SecurityConfig.class, ApiExceptionHandler.class})
class OrderControllerTest {

    @Autowired MockMvc mvc;
    @MockitoBean PlaceOrderService placeOrder;     // E3, D6.INV-3
    @MockitoBean OrderQueries queries;
    @MockitoBean Tracer tracer;

    @Test
    void renvoieUneErreurDeValidationRattacheeAuChamp() throws Exception {
        mvc.perform(post("/api/v1/orders").with(jwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                         { "customerId": null, "lines": [] }
                         """))
           .andExpect(status().isBadRequest())
           .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
           .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
           .andExpect(jsonPath("$.errors[*].field", hasItems("customerId", "lines")));   // SC6.INV-1, côté back
    }
}
```

`@MockitoBean` vient de `org.springframework.test.context.bean.override.mockito` (Spring Framework 6.2). Il remplace `@MockBean`, déprécié depuis Spring Boot 3.4.

## 4. Correspondance invariants vers contrôles

C'est la table que l'expert complète dans son compte rendu (D6.INV-1). Un invariant sans ligne n'est pas couvert.

| Invariant | Contrôle | Type |
|---|---|---|
| D1.INV-1 à D1.INV-4 | `ArchitectureTest` | ArchUnit |
| D2.INV-1 | règle ArchUnit : classes de `..api..` hors `generated` suffixées `Request` ou `Response` sont des records | ArchUnit |
| D2.INV-2 | règle ArchUnit : aucun champ de type `Optional` ; aucun paramètre `Optional` | ArchUnit |
| D2.INV-3 | revue (point L3) et `-Djdk.tracePinnedThreads=full` dans les tests de charge | revue |
| D2.INV-4 | revue (point L4) ; analyse statique si présente dans le projet | revue |
| D3.INV-1 | `ContractConformanceTest` | intégration |
| D3.INV-2, D3.INV-3 | tests de tranche web sur un cas invalide et un cas métier | tranche web |
| D3.INV-4 | test vérifiant qu'une demande `size=1000` est ramenée au maximum | tranche web |
| D4.INV-1 | `@DataJpaTest` (migrations appliquées, `validate` passe) et somme de contrôle Flyway | tranche données |
| D4.INV-2 | test de propriété : `spring.jpa.open-in-view` vaut `false` dans le contexte | intégration |
| D4.INV-3 | règle ArchUnit : `@Transactional` uniquement sur des classes de `..application..` | ArchUnit |
| D4.INV-4 | revue (point P4) | revue |
| D4.INV-5 | règle de build : aucune dépendance H2 ou HSQLDB en portée de test | build |
| D4.INV-6 | test de concurrence : deux mises à jour concurrentes, la seconde reçoit 409 | intégration |
| D5.INV-1 à D5.INV-3 | tests de sécurité (module `securite`, § 7) | tranche web |
| D5.INV-4 | revue (point S4) ; recherche de motifs de secrets en CI si présente | revue |
| D6.INV-3 | règle ArchUnit : aucun usage de `MockBean` ni `SpyBean` dans les tests | ArchUnit sur les tests |
| D6.INV-4 | revue ; `Clock` injecté vérifié par la règle « aucun appel à `Instant.now()` hors `shared.config` » | ArchUnit |

Exemple de règle sur les tests (importer les classes de test pour ce fichier seulement) :

```java
@AnalyzeClasses(packages = "com.acme.app", importOptions = ImportOption.OnlyIncludeTests.class)
class TestConventionsTest {

    @ArchTest   // D6.INV-3
    static final ArchRule pasDeMockBean = noFields()
        .should().beAnnotatedWith("org.springframework.boot.test.mock.mockito.MockBean")
        .orShould().beAnnotatedWith("org.springframework.boot.test.mock.mockito.SpyBean");
}
```

## 5. Testcontainers

- Une seule définition de conteneur PostgreSQL, réutilisée : une classe de configuration de test avec `@Bean @ServiceConnection PostgreSQLContainer<?>`, importée par les tests qui en ont besoin, plutôt qu'un conteneur par classe.
- Version d'image alignée sur la production (D4.INV-5).
- Les tests exigent Docker. Si Docker n'est pas disponible, l'expert le signale ; il ne remplace jamais PostgreSQL par H2 pour faire passer le build.

## 6. Pièges connus

- **`@SpringBootTest` partout** : lent, et masque les dépendances réelles. Réserver aux parcours critiques.
- **Tests qui partagent un état en base** : chaque test prépare et nettoie ses données, ou s'exécute dans une transaction annulée (`@DataJpaTest` le fait par défaut).
- **Assertions sur des messages en français** : fragiles. Tester `code` et `status`, pas `detail` (socle SC2.INV-2, appliqué aussi aux tests).
- **Contexte Spring recréé à chaque classe** : chaque combinaison différente de `@MockitoBean` crée un nouveau contexte. Regrouper les tests de tranche qui partagent la même configuration.

## 7. Grille de revue

| Point | Question | Invariant |
|---|---|---|
| T1 | Un invariant touché par la modification est-il sans contrôle ? | D6.INV-1 |
| T2 | Un test unitaire de domaine ou de service démarre-t-il Spring ? | D6.INV-2 |
| T3 | `@MockBean` ou `@SpyBean` apparaît-il ? | D6.INV-3 |
| T4 | Un test dépend-il de l'heure réelle, de l'ordre d'exécution ou d'un service externe réel ? | D6.INV-4 |
| T5 | Un test vérifie-t-il un texte lisible plutôt qu'un code stable ? | SC2.INV-2 |
<<<FIN modules/tests/SKILL.md>>>

<<<FICHIER modules/revue/SKILL.md>>>
---
name: revue
description: Méthode et format de revue de code d'un back Spring Boot (périmètre, grille consolidée par module, niveaux de gravité, preuves, rapport classé, passage au mode produire). À lire avant toute relecture de code Java.
dimensions: [D7]
status: active
---

# Module `revue` (D7)

Ce module définit comment l'expert relit du code et ce qu'il remet. Une revue est un livrable : elle doit permettre au développeur de décider sans relire le code lui-même.

## 1. Déroulé

```mermaid
flowchart TD
  P["1. Périmètre<br/>fichiers, commit, branche ou fonctionnalité"] --> C["2. Contexte<br/>versions, conventions du projet, socle"]
  C --> AUTO["3. Contrôles automatiques<br/>build, tests, ArchUnit si disponibles"]
  AUTO --> G["4. Grille<br/>points A, L, R, P, S, T"]
  G --> Q{"Preuve disponible ?"}
  Q -->|oui| CONST["Constat"]
  Q -->|non| QUEST["Question au développeur"]
  CONST --> RAP["5. Rapport classé par gravité"]
  QUEST --> RAP
```

1. **Périmètre** : l'expert écrit ce qu'il relit, et ce qu'il ne relit pas.
2. **Contexte** : versions réelles du projet, conventions en place, présence du contrat OpenAPI.
3. **Contrôles automatiques** : si l'environnement le permet, exécuter le build et les tests. Un échec existant est un constat en soi, signalé avant tout le reste.
4. **Grille** : parcourir les points de la grille consolidée (§ 3). Ne pas inventer de point hors grille sans le marquer « hors invariant ».
5. **Rapport** : format du § 4.

## 2. Gravités

| Gravité | Définition | Exemples |
|---|---|---|
| **Bloquant** | faille de sécurité, perte ou corruption de données possible, violation du socle visible par le front | concaténation SQL, endpoint protégé accessible anonymement, montant en `double`, migration modifiée |
| **Majeur** | invariant du skill violé, ou défaut qui se manifestera en production sous charge | `open-in-view` actif, N+1 sur un écran de liste, `synchronized` autour d'une E/S avec threads virtuels |
| **Mineur** | écart de convention sans risque immédiat | `@MockBean` dans un test, nommage incohérent |
| **Suggestion** | amélioration possible, préférence argumentée | extraction d'une méthode, projection plutôt qu'entité |

Une préférence n'est jamais classée au-dessus de « suggestion ».

## 3. Grille consolidée

| Module | Points | Invariants couverts |
|---|---|---|
| `architecture` | A1 à A5 | D1.INV-1 à D1.INV-4 |
| `langage` | L1 à L5 | D2.INV-1 à D2.INV-4, SC3.INV-2 |
| `api-rest` | R1 à R6 | D3.INV-1 à D3.INV-4, SC1, SC2, SC3 |
| `persistance` | P1 à P8 | D4.INV-1 à D4.INV-6, SC3 |
| `securite` | S1 à S7 | D5.INV-1 à D5.INV-4, SC4 |
| `tests` | T1 à T5 | D6.INV-1 à D6.INV-4 |

Le détail de chaque point est dans son module. L'expert cite le point (`P4`) et l'invariant (`D4.INV-4`) dans chaque constat.

## 4. Format du rapport

```markdown
# Revue : <périmètre>

**Périmètre** : <fichiers, commit ou branche>. **Non relu** : <ce qui est exclu>.
**Contexte** : Java <x>, Spring Boot <x>, PostgreSQL <x>. Build : <passe | échoue | non exécuté, raison>.

## Synthèse

<2 à 4 phrases : état général, nombre de constats par gravité, risque principal.>

| Gravité | Nombre |
|---|---|
| Bloquant | 1 |
| Majeur | 2 |
| Mineur | 3 |
| Suggestion | 1 |

## Constats

### [B1] Requête construite par concaténation
- **Emplacement** : `order/infrastructure/OrderSearch.java:42`
- **Règle** : P4, D4.INV-4
- **Preuve** : `"... where status = '" + status + "'"`
- **Risque** : injection SQL par le paramètre `status`, exposé sans validation.
- **Correction proposée** : paramètre nommé `:status` ; voir le module `persistance`, § 7.

### [M1] ...

## Questions

- <ce que l'expert n'a pas pu établir faute de preuve, formulé comme question>

## Points conformes notables

- <ce qui est bien fait et doit être conservé, en quelques lignes>
```

Les identifiants de constats (`B1`, `M1`, `m1`, `S1`) sont stables dans un même rapport, pour que le développeur puisse répondre « corrige B1 et M2 ».

## 5. Passer de la revue à la correction

- Le développeur choisit les constats à corriger. L'expert repasse en mode produire, propose un plan limité à ces constats, et attend la validation.
- Chaque correction est accompagnée du contrôle qui l'aurait détectée (test ou règle ArchUnit), pour que le défaut ne revienne pas.

## 6. Pièges connus

- **Revue qui réécrit le code** : interdit sans demande (D7.INV-2).
- **Liste plate de 40 remarques** : le développeur ne sait plus quoi faire. Classer, regrouper les constats de même cause, donner le risque principal en synthèse.
- **Constat sans preuve** : « il y a probablement des N+1 » n'est pas un constat. Soit l'expert montre la boucle et la relation paresseuse, soit il pose une question (D7.INV-3).

## 7. Contrôle de sortie

Avant de remettre le rapport, l'expert vérifie :

- chaque constat a emplacement, règle, preuve, risque, correction (D7.INV-1) ;
- aucun fichier du projet n'a été modifié (D7.INV-2) ;
- les constats sont classés par gravité, et les incertitudes sont dans « Questions » (D7.INV-3).
<<<FIN modules/revue/SKILL.md>>>

<<<FICHIER modules/migration-boot4/SKILL.md>>>
---
name: migration-boot4
description: Dimension réservée D8, migration vers Spring Boot 4.x et Java 25. Ne pas appliquer en version 1.x du skill ; lire uniquement pour comprendre les points d'extension E1 à E4.
dimensions: [D8]
status: reserved
---

# Module `migration-boot4` (D8, réservé)

Statut : `reserved`. Cette dimension n'est pas appliquée en version 1.x. L'expert ne migre pas un projet vers Spring Boot 4 ou Java 25 sur la base de ce module ; s'il est sollicité pour le faire, il répond que la dimension n'est pas encore active et propose de l'activer dans une nouvelle version du skill.

## 1. Pourquoi cette dimension existe

La branche Spring Boot 3.5 n'a plus de support open source depuis le 30 juin 2026 (un support commercial existe). Les branches 4.0 et 4.1 sont celles qui reçoivent des correctifs open source, avec Java 17 au minimum et Java 25 comme version LTS la plus récente prise en charge. La migration est donc la prochaine dimension à révéler.

## 2. Ce que préparent les points d'extension

| Point | Règle active en 1.x | Ce qu'il évite lors de la migration |
|---|---|---|
| E1 | aucune API dépréciée introduite ; propriétés renommées signalées | les API dépréciées en 3.x sont les premières supprimées en 4.x |
| E2 | personnalisation de Jackson isolée dans une seule classe | Spring Boot 4 adopte Jackson 3 par défaut, dont les packages changent : un seul fichier à adapter au lieu de tout le code |
| E3 | `@MockitoBean` au lieu de `@MockBean` | `@MockBean` est déprécié depuis Boot 3.4 et destiné à être retiré |
| E4 | versions hors BOM centralisées | montée de version de toutes les dépendances en un seul endroit |

## 3. Contenu prévu à l'activation

À rédiger quand la dimension passera `active`, avec vérification sur la documentation officielle de la version visée :

- inventaire des écarts entre Spring Boot 3.5 et la version 4.x visée (Spring Framework 7, Jakarta EE 11, Jackson 3, modularisation des auto-configurations) ;
- procédure par étapes : 3.5 à jour, suppression des dépréciations, passage à 4.0, puis 4.x ; Java 21 puis Java 25 ;
- nouveaux invariants, par exemple sur les threads virtuels (le problème d'épinglage de D2.INV-3 ne se pose plus à partir de Java 24, ce qui permettra de remplacer cet invariant par un invariant plus fort sur la concurrence) ;
- scénarios de test de non-régression avant et après migration.

## 4. Test d'inertie en 1.x

Un projet conforme au skill 1.x doit satisfaire, sans rien migrer :

- compilation sans nouvel avertissement de dépréciation introduit par le code du projet (E1) ;
- un seul fichier contient une personnalisation de Jackson (E2) ;
- aucune occurrence de `MockBean` ou `SpyBean` (E3, contrôlé par D6.INV-3) ;
- les versions hors BOM sont toutes des propriétés du build (E4).
<<<FIN modules/migration-boot4/SKILL.md>>>

---

# Table d'intégrité (sha256)

Format compatible `sha256sum -c`, à exécuter depuis `spec/`.

    9c300f75448541fb5603a0ae7077052f1f22ab6dabf6d12fad2da6bf67da1c23  manifest.json
    5be0f921cc387d2b9c42c87436d9171497b6641df01e7a7d4a51ab54b2ea8b58  SKILL.md
    8adeb2cdd3214eef3b58d84c4bd52b6eaf82cd63e8105a1a38718edacdef211a  socle/SKILL.md
    1887ab0645128039f1fa7410e0bab2c7d76f5777759d37aa151376b1db6619b2  modules/architecture/SKILL.md
    6814eaa2a9d67687e45cf1c76fe2dddc9a399f0058fd8c2a6802b54f4aea9c03  modules/langage/SKILL.md
    100b5fed950a1805408a3847b345e9c8b4efbed9e7dea4a00a6240ee16e686cd  modules/api-rest/SKILL.md
    d423a3defdf5538906e941de7d60e26d3507ad9d403dcde544cddb531e3ecedd  modules/persistance/SKILL.md
    cd6d56b2010fab057d9e3c062bf3b3f593af64cef0d44788287d2d6b1654d212  modules/securite/SKILL.md
    85d8c562b542dec7ca8c77fce3daa0394b50adc3907d204762852f699e0b18d5  modules/tests/SKILL.md
    5d93dc76abbd88d55061b30e098bf0b31f50bfe7cf79cb83a55770dde448d532  modules/revue/SKILL.md
    8171c6d98e6a5ccde0ba5173681edb655e1660d84fe63afc5eff0fd9c2ec974d  modules/migration-boot4/SKILL.md
