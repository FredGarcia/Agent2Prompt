---
name: persistance
description: Persistance Spring Data JPA, Hibernate 6.6 et PostgreSQL (migrations Flyway ou Liquibase versionnées et immuables, ddl-auto validate, open-in-view désactivé, transactions dans la couche application, N+1, verrou optimiste, types PostgreSQL, Testcontainers). À lire avant de toucher une entité, un dépôt, une requête ou une migration.
dimensions: [D4]
status: active
---

# Module `persistance` (D4)

Ce module fixe comment le back parle à PostgreSQL. Le schéma de la base appartient aux migrations, jamais à Hibernate. L'outil de migration est celui du projet, Flyway ou Liquibase : les règles portent sur des garanties communes aux deux (point d'extension E5).

## 1. Vue d'ensemble

```mermaid
flowchart LR
  SVC["Service application<br/>@Transactional"] --> REPO["Dépôt Spring Data<br/>infrastructure"]
  REPO --> HIB["Hibernate 6.6<br/>ddl-auto = validate"]
  HIB --> POOL["HikariCP"]
  POOL --> PG[("PostgreSQL")]
  FLY["Flyway ou Liquibase<br/>migrations versionnées"] -->|"au démarrage, avant JPA"| PG
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
  # Selon l'outil du projet, l'un ou l'autre bloc :
  flyway:
    enabled: true
    locations: classpath:db/migration
  liquibase:
    enabled: true
    change-log: classpath:db/changelog/db.changelog-master.yaml
```

Dépendances : `spring-boot-starter-data-jpa`, `org.postgresql:postgresql`, puis selon l'outil :

- Flyway : `org.flywaydb:flyway-core` **et** `org.flywaydb:flyway-database-postgresql` (le support de PostgreSQL est un module séparé depuis Flyway 10) ;
- Liquibase : `org.liquibase:liquibase-core`.

Un projet n'utilise qu'un seul outil. L'expert n'en change jamais sans décision explicite du développeur.

## 3. Migrations

### 3.1 Garanties communes (D4.INV-1, point E5)

Quel que soit l'outil :

| Garantie | Flyway | Liquibase |
|---|---|---|
| le schéma n'évolue que par migrations versionnées dans le dépôt | scripts `V<n>__<description>.sql` | changesets inclus dans le changelog maître |
| une migration appliquée n'est jamais modifiée | somme de contrôle vérifiée au démarrage | somme de contrôle de chaque changeset vérifiée au démarrage |
| l'ordre d'application est déterministe | numéro de version | ordre d'inclusion dans le changelog maître |
| Hibernate ne modifie jamais le schéma | `ddl-auto=validate` | `ddl-auto=validate` |
| les données de test ne sont pas des migrations de production | emplacement réservé aux tests | contexte ou étiquette réservé aux tests |

Un nouvel outil de migration s'ajouterait au skill par une colonne de ce tableau et une section dédiée, sans changer l'invariant.

### 3.2 Flyway

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

### 3.3 Liquibase

```text
src/main/resources/db/changelog/
├── db.changelog-master.yaml
└── changes/
    ├── 0001-create-customer.sql
    ├── 0002-create-purchase-order.sql
    └── 0003-add-order-status-index.sql
```

```yaml
# db.changelog-master.yaml : inclusions explicites, dans l'ordre
databaseChangeLog:
  - include: { file: changes/0001-create-customer.sql, relativeToChangelogFile: true }
  - include: { file: changes/0002-create-purchase-order.sql, relativeToChangelogFile: true }
  - include: { file: changes/0003-add-order-status-index.sql, relativeToChangelogFile: true }
```

```sql
--liquibase formatted sql

--changeset acme:0002-create-purchase-order
CREATE TABLE purchase_order (
    id           UUID PRIMARY KEY,
    customer_id  UUID        NOT NULL REFERENCES customer (id),
    status       VARCHAR(32) NOT NULL,
    total_amount NUMERIC(19, 2) NOT NULL,          -- SC3.INV-2
    created_at   TIMESTAMPTZ NOT NULL,             -- SC3.INV-1
    version      BIGINT      NOT NULL DEFAULT 0    -- D4.INV-6
);
CREATE INDEX idx_purchase_order_customer ON purchase_order (customer_id);
--rollback DROP TABLE purchase_order;
```

Règles :

- un changeset est identifié par son identifiant, son auteur et son fichier ; une fois appliqué, il n'est **jamais** modifié (D4.INV-1). Une correction est un nouveau changeset ;
- `validCheckSum` et `runOnChange` contournent la vérification des sommes de contrôle : interdits, sauf pour un objet recréé à chaque fois (vue, fonction) avec un commentaire qui le justifie ;
- inclusions explicites plutôt que `includeAll`, pour que l'ordre soit lisible dans le changelog maître ;
- format SQL (`--liquibase formatted sql`) recommandé pour PostgreSQL : il permet les fonctions propres à PostgreSQL sans traduction. Dans un projet existant, le format en place (YAML, XML) est conservé ;
- chaque changeset porte un bloc `--rollback` quand le retour arrière est possible ;
- `CREATE INDEX CONCURRENTLY` dans un changeset dédié, avec `runInTransaction:false` ;
- les données de test sont dans des changesets portant un contexte réservé aux tests (`context:test`), exclu en production par `spring.liquibase.contexts`.

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
- `@DataJpaTest` exécute les migrations Flyway ou Liquibase : le test vérifie donc aussi que les migrations s'appliquent et que `ddl-auto=validate` passe.
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
