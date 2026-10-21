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
