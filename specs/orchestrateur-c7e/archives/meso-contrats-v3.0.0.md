---
fichier: meso-contrats.md (pre-rempli)
role: invariants_locaux (niveau fractal d=1)
modulation: ces valeurs sont FIXEES par l'utilisateur (mode hybride C)
  l'IA ajuste les parametres operationnels, jamais ces invariants
stack: [PostgreSQL 15+, Liquibase 4.x, Java 17 + Spring Boot 3.x, Angular 17+]
---

# MESO-CONTRATS — Invariants de projet (d=1)

> Injecter ce fichier avec le SKILL.md au lancement de l'IA.
> Tout ecart detecte par l'IA doit etre signale dans le registre (fin de fichier),
> jamais corrige silencieusement.
> ⚠️ ADAPTER = valeur a remplacer par votre norme d'entreprise exacte.

## 1. Contrats de persistance (É1) — PostgreSQL + Liquibase

### Nommage changesets
- Fichier : `db/changelog/<aaaa><mm><jj>-<hh><mm>-<slug>.yaml`
  Ex. : `db/changelog/20261030-1430-add-colonne-mode-chargement.yaml`
- `id` du changeset : identique au nom de fichier (sans extension)
- `author` : trigramme du developpeur (ex. `jdu`)

### Colonnes
- snake_case : `date_creation`, `mode_chargement` — jamais de camelCase en BDD
- Types : `timestamptz` (pas `timestamp`), `varchar(n)` avec n justifie,
  `numeric(p,s)` pour les montants — jamais `float`
- NULL : interdit par defaut ; toute colonne nullable exige une justification
  ecrite dans le commentaire du changeset
- Contraintes nommees : `pk_<table>`, `fk_<table>_<colonne>`,
  `uq_<table>_<colonne>`, `idx_<table>_<colonne>`

### Regles de migration
- `rollback` explicite OBLIGATOIRE sur tout changeset (tag `<rollback>` ou `runOnChange`)
- Idempotence : `preConditions` avec `onFail: MARK_RAN` si applicable
- ⚠️ ADAPTER — Seuil verrouillage : tables > 1M lignes => migration en heures creuses
  + confirmation prealable ; index `CONCURRENTLY`
- Donnees historiques : toute colonne NOT NULL sur table non vide exige soit un
  DEFAULT, soit un script de backfill en 2 changesets (add nullable -> backfill -> set not null)

## 2. Contrats d'interface (É3) — REST / Spring Boot

### Design des endpoints
- Ressources au pluriel, noms de domaine, pas de verbes dans l'URL :
  `GET /api/v1/donnees` ; action metier en sous-ressource : `POST /api/v1/donnees:recharger` ⚠️ ADAPTER si vous interdisez les custom methods
- Versioning : prefix `/api/v1/` (path versioning — ⚠️ ADAPTER : header `Accept-Version` si votre norme differe)
- Pagination obligatoire des collections : `?page=0&size=20` (Spring `Pageable`),
  reponse enveloppee `{ content: [], totalElements, totalPages, number }`
- Filtres : parametres de requete `?statut=ACTIF&dateDebut=2026-01-01` (ISO 8601)

### Contrat d'erreur — RFC 7807 (application/problem+json)
Toute erreur renvoie :
```json
{
  "type": "https://api.exemple.fr/errors/ressource-introuvable",
  "title": "Ressource introuvable",
  "status": 404,
  "detail": "Aucune donnee avec l'id 42",
  "instance": "/api/v1/donnees/42",
  "code": "DONNEE_NOT_FOUND",
  "timestamp": "2026-10-30T14:30:00Z"
}
```
- `code` : CONSTANTE_SNAKE_CASE stable (contrat pour le front)
- Status obligatoires : 200/201/204, 400, 401, 403, 404, 409, 422, 500
- Validation : 422 avec un `violations[]` listant champ -> message

### Gate É3 (bloquant)
- Spec OpenAPI 3.1 ecrite AVANT l'implementation (contrat d'abord)
- ⚠️ ADAPTER — Revue du contrat par le tech lead avant toute branche feature
- Le contrat OpenAPI est la source de verite ; le code ne doit pas le contredire
  (verifie en gate Meso->Macro par Swagger diff)

## 3. Contrats backend (É2/É4) — Spring Boot

### Architecture en couches (stricte)
```
Controller (@RestController) -> Service (@Service) -> Repository (@Repository)
```
- Le Controller : pas de logique metier, pas d'acces direct au Repository
- Le Service : transactionnel par cas (`@Transactional` sur methode publique,
  readOnly=true pour les lectures)
- Le Repository : interface Spring Data JPA uniquement ; requetes derivees de
  preference, `@Query` documentee sinon

### DTO (obligatoire — jamais d'entite exposee)
- Request DTO : `XxxRequest` avec annotations Bean Validation (`@NotBlank`,
  `@Size(max=...)`, `@Pattern`) et messages explicites
- Response DTO : `XxxResponse` immuable (record ou Lombok @Value)
- Mapping : MapStruct ⚠️ ADAPTER (ou mapping explicite si interdit)

### Gestion d'erreurs
- Exceptions metier typees : `DonneeNotFoundException`, `AccesRefuseException`...
  etendent une `BusinessException` avec un `ErrorCode`
- `@RestControllerAdvice` centralise la traduction vers RFC 7807
- AUCUN try/catch muet ; toute exception non geree remonte loggee (correlationId)

## 4. Contrats frontend (É5) — Angular

### Structure
- Composants standalone (pas de NgModules sauf existant)
- Nommage : `donnees-list.component.ts`, `donnees.service.ts`, fichier par classe
- ChangeDetectionStrategy.OnPush par defaut

### State management (⚠️ ADAPTER si NgRx impose)
- Signal store ou service a signaux : etat local du composant en `signal()`
- Le composant ne stocke pas l'etat serveur : il le consomme via service + async pipe
- Etats UI OBLIGATOIRES sur toute donnee asynchrone : `loading / success / error / empty`
  (template discrimine union type, pas de booleens isLoading && isError entremelés)

### Interactions
- Appels API centralises dans le service (jamais d'HttpClient dans un composant)
- Annulation/rejeu : `switchMap` sur les recherches ; debounce 300ms
- Double clic : bouton desactive pendant `isPending` — pas de requetes concurrentes
  indesirables (debounce + guard)
- Erreur API : affichage d'un etat d'erreur + message normalise depuis le `code`
  RFC 7807 (pas de `error.message` brut)

## 5. Invariants transverses (d=0 -> d=3)

### Performance / SLA (⚠️ ADAPTER valeurs)
- Endpoints lecture : p95 < 300 ms ; ecriture : p95 < 500 ms
- Toute requete SQL generee avec JOIN > 3 tables ou sans index : a analyser (EXPLAIN)
- N+1 detections : `@EntityGraph` ou `JOIN FETCH` obligatoire si constate

### Securite
- Auth : JWT (Bearer) via Spring Security — ⚠️ ADAPTER (OAuth2/OIDC si SSO)
- Autorisations : `@PreAuthorize("hasRole('...')")` sur les endpoints ; jamais
  verifiee cote front seul (le front n'est jamais une barriere de securite)
- Exposition : champs sensibles (PII, tokens) jamais dans les logs ni les DTO
  response sans masquage
- Injection : requetes parametrees (JPA / Criteria), jamais de concatenation SQL

### Git (aligne SKILL §4)
- Branche : `feature/7e-e<SLOT>-<domaine>-<slug>` ex. `feature/7e-e3-api-donnees-on-demand`
- Commit : `[É<SLOT>-<DOM>] <type>(<portee>): <description>` — types : feat|fix|refactor|test|chore|docs
- Retroaction : `[É<SLOT>-DOM] fix(...): ... after É6 observation ...`
- Tag release : `release/vX.Y.Z`

### Niveau de preuve par criticite (⚠️ ADAPTER grille)
| Criticité | Tests requis | Revue |
|---|---|---|
| Trivial (1 couche, pas de BDD) | Unitaires cibles | Auto |
| Standard (multi-couches) | Unitaires + integration + contrat | Pair |
| Critique (auth, paiement, batch) | + E2E + scenario rollback BDD | Tech lead obligatoire |

## 6. Exclusions / perimetre (⚠️ ADAPTER — remplir par projet)
- Zones hors perimetre (ne pas modifier sans accord) : ...
- Deps interdites ou a valider : ...
- Environnements : dev -> recette -> prod (promotion par MR uniquement)

---
# Registre des ecarts (rempli par l'IA pendant le traitement)
| Ticket | Invariant concerne | Ecart constate | Decision (respecter / deroger validee par) |
|---|---|---|---|
| EX-001 | §1 rollback | changeset genere sans rollback | corrige avant commit |
