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
