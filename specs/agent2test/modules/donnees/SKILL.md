---
name: donnees
description: Données d'Agent2Test en SQLite (un fichier par agent propriétaire dans le dossier de données, ouvert par le module intégré node:sqlite sur une connexion qui n'est qu'à lui, journal WAL et synchronisation complète, contrôle d'intégrité au démarrage, contrats nommés au lieu de SQL libre, sans ATTACH, sans extension ni instruction de schéma, chaque écriture en transaction, déclencheurs d'ajout seul pour journal et grand livre, migrations numérotées par fichier, sauvegarde et export par commandes humaines, oracle en lecture seule sur la base de l'application désactivé par défaut, purge des preuves, reprise d'une instance 1.0.0 sur PostgreSQL). À implémenter au lot 2.
dimensions: [D21]
status: active
---

# Module `donnees` (D21)

`donnees` est le seul accès aux données. Il tient une connexion `DatabaseSync` par fichier, donc par agent propriétaire, et choisit la connexion d'après le champ `appelant` du contexte de bus. Aucun autre module n'importe `node:sqlite` ni `pg`.

## 1. Un fichier par agent (D21.INV-1)

Le dossier de données est fixé par la configuration humaine (`donnees.dossier`, `~/.agent2test/donnees/` par défaut), hors du dépôt d'Agent2Test et du projet de l'application (D18.INV-3). Chaque agent propriétaire a son fichier, qui garde le nom de son schéma de la version 1.0.0 :

| Fichier | Agent propriétaire | Contenu principal |
|---|---|---|
| `plan.sqlite` | `plan` | sources, versions du plan, US, critères, scénarios, demandes, campagnes du plan |
| `scan.sqlite` | `scanner` | relevés, écrans, éléments, routes, points d'API, empreintes de fichiers |
| `strategie.sqlite` | `stratege` | sélections, éléments retenus et écartés, motifs, scores |
| `preparation.sqlite` | `preparateur` | profils d'environnement, parcours versionnés, résolutions, réparations |
| `execution.sqlite` | `navigateur` | exécutions, résultats d'étape, preuves (chemin et empreinte), métadonnées de session, jamais le secret |
| `verdict.sqlite` | `verdict` | verdicts, causes, empreintes, désaccords |
| `orchestration.sqlite` | `orchestrateur` | campagnes, cycles, points de contrôle, décisions, file, verrous, remises reçues |
| `journal.sqlite` | `journal` | lignes chaînées |
| `observation.sqlite` | `observateur` | séries de mesures, alertes |
| `apprentissage.sqlite` | `apprenant` | leçons, expositions |
| `reflexion.sqlite` | `reflexif` | mesures d'accord, propositions, évaluations des observateurs |
| `referentiel.sqlite` | `referentiel` | fiches, règles, versions, épinglages, grand livre |
| `memoire.sqlite` | `memoire` | documents, fragments, index plein texte FTS5, vecteurs |

- `donnees` ouvre chaque fichier sur sa propre connexion, `new DatabaseSync(chemin)`, `allowExtension` restant à `false` : aucune extension ne se charge. Une connexion ne sert qu'aux contrats de son agent.
- Aucun contrat n'emploie `ATTACH`, `DETACH`, `PRAGMA`, `VACUUM`, `load_extension`, ni instruction de schéma (`CREATE`, `DROP`, `ALTER`) : au chargement des contrats, un texte qui en contient une empêche le démarrage, avec le nom du contrat. Les seules instructions `PRAGMA` sont celles de l'ouverture (section 2), écrites dans `src/donnees/connexions.js` ; le schéma n'évolue que par migrations (section 4).
- Une lecture croisée passe par une action de l'agent propriétaire, sur le bus ; aucune connexion n'atteint le fichier d'un autre agent.

## 2. Ouverture et transactions (D21.INV-5)

À l'ouverture, pour chaque fichier :

1. `PRAGMA journal_mode = WAL`, `PRAGMA synchronous = FULL`, `PRAGMA foreign_keys = ON`, `PRAGMA busy_timeout = 5000` ;
2. `PRAGMA integrity_check` doit rendre `ok` ; sinon, le démarrage est refusé avec le nom du fichier ;
3. les migrations du fichier doivent être toutes appliquées et inchangées (section 4) ;
4. pour `journal.sqlite` et `referentiel.sqlite`, les déclencheurs d'ajout seul doivent être présents (section 5).

- Chaque contrat d'écriture s'exécute dans une transaction `BEGIN IMMEDIATE` … `COMMIT`, avec `ROLLBACK` sur erreur ; un contrat composé enchaîne plusieurs instructions dans la même transaction. Un arrêt du processus, même brutal, ne laisse aucun enregistrement partiel : à la réouverture, SQLite garde ou écarte la transaction entière.
- Une table range ses documents en JSON quand leur forme varie : colonne `doc` contrainte par `CHECK (json_valid(doc))`, filtres par `json_extract` sur des index déclarés. Les champs que les contrats filtrent souvent sont des colonnes à part, typées.
- Deux processus peuvent écrire un même fichier, le kit et une commande humaine comme la purge : `BEGIN IMMEDIATE` les fait passer l'un après l'autre, et `busy_timeout` fait attendre le second 5 secondes au plus.

## 3. Contrats nommés (D21.INV-2)

```js
await bus.demander('donnees', 'executer', { contrat: 'verdict.inserer', parametres: { ... } }, contexte);
```

- Chaque contrat est déclaré dans `src/donnees/contrats/<fichier>.js` : nom, agent propriétaire, texte SQL paramétré, schéma des paramètres, nature (`lecture` ou `ecriture`).
- Un contrat inconnu, ou appelé par un agent qui n'est pas son propriétaire, est refusé `CONTRAT_INCONNU` ou `CONTRAT_INTERDIT`.
- Aucune action n'accepte de texte SQL en paramètre. Les paramètres passent par les paramètres nommés d'une instruction préparée (`StatementSync`, `:nom`), jamais par concaténation.

## 4. Migrations

- `migrations/<fichier>/NNN-nom.sql`, numérotées par fichier, appliquées dans l'ordre par `npm run migrer`, commande humaine que l'installation lance aussi ; jamais par un agent.
- Chaque fichier a sa table `migrations` : numéro, nom et empreinte SHA-256 de chaque migration appliquée. Au démarrage, une migration non appliquée, ou appliquée dont le fichier a changé, empêche le démarrage, avec son nom.

## 5. Ajout seul (D10.INV-1, D15.INV-2)

La table `lignes` de `journal.sqlite` et la table `grand_livre` de `referentiel.sqlite` portent chacune deux déclencheurs, créés par leur migration initiale, qui refusent toute modification et toute suppression :

```sql
CREATE TRIGGER lignes_sans_modification BEFORE UPDATE ON lignes BEGIN SELECT RAISE(ABORT, 'ajout seul'); END;
CREATE TRIGGER lignes_sans_suppression BEFORE DELETE ON lignes BEGIN SELECT RAISE(ABORT, 'ajout seul'); END;
```

- Les déclencheurs valent pour toute connexion, celle d'un outil SQLite comprise. Un `DELETE` sans condition les déclenche aussi : en présence d'un déclencheur, SQLite renonce à vider la table d'un coup.
- Aucun contrat ne peut retirer un déclencheur (section 1) ; seul un outil extérieur le peut. Au démarrage, un déclencheur absent empêche le démarrage, et la chaîne d'empreintes est vérifiée en entier (module `journal`, section 1 ; module `referentiel`, section 5).

## 6. Base de l'application (D21.INV-3)

La base de l'application n'est pas touchée. L'oracle SQL en lecture seule reste possible, à trois conditions :

1. la configuration humaine porte `oracle: { actif: true, dsn: "<référence au fichier de secret>" }` ;
2. la connexion se fait par le pilote `pg`, avec un compte de lecture seule et `default_transaction_read_only = on` ;
3. seuls des contrats de lecture nommés, déclarés par les scénarios dans le profil d'environnement et ratifiés en CP-2, s'exécutent.

Sans ces trois conditions, toute demande à l'oracle est refusée `ORACLE_INACTIF`. L'oracle est le seul usage de `pg`, et la seule connexion d'Agent2Test à une base qui ne soit pas l'un de ses fichiers.

## 7. Conservation, sauvegarde et export (D21.INV-4)

- Les preuves (captures, traces, instantanés) sont des fichiers ; leur chemin et leur empreinte SHA-256 sont en base.
- Durée de conservation par défaut : 30 jours, fixée par la configuration humaine (`conservation.preuvesJours`) ; le système ne la modifie pas.
- `npm run purger` supprime les fichiers échus et inscrit au journal une ligne `preuve.purgee` par fichier, avec son empreinte ; l'empreinte reste en base.
- Le journal et le grand livre sont conservés sans limite.
- `npm run donnees:sauvegarder` écrit une copie cohérente de chaque fichier par `VACUUM INTO`, dans le dossier de sauvegarde de la configuration humaine, et s'inscrit au journal (`donnees.sauvegarde`). `npm run donnees:exporter -- --fichier <nom> [--table <nom>]` rend une table en JSON Lines, sans rien modifier. Ce sont des commandes humaines, hors du bus.

## 8. Pièges connus

- **Une base pour tous** : un seul fichier, ou une connexion partagée, ruinerait D21.INV-1 ; un fichier et une connexion par agent.
- **`ATTACH` de confort** : attacher un fichier pour joindre deux agents en une requête contourne leurs contrats ; la jointure passe par le bus.
- **SQL dynamique** : un nom de colonne choisi par paramètre est du SQL libre ; il passe par un contrat distinct.
- **Transaction oubliée** : une suite d'écritures hors transaction laisserait une phase à moitié écrite ; `donnees` n'écrit qu'en transaction.
- **`node:sqlite` sous option** : avant Node 22.13, le module exige `--experimental-sqlite` ; le kit exige Node 22.13 (D18.INV-1).
- **Base de l'application par défaut** : le DSN de l'application ne figure dans aucune configuration tant que l'oracle est inactif.

## 9. Migration depuis la version 1.0.0 (D2 remplacée)

En 1.0.0, la dimension D2 gardait les données dans PostgreSQL, un schéma et un rôle par agent. D21 la remplace :

| 1.0.0 | 1.1.0 | Ce qui change |
|---|---|---|
| D2.INV-1 : un schéma et un rôle par agent, écriture croisée refusée par la base | D21.INV-1 : un fichier et une connexion par agent, sans `ATTACH` ni extension | la séparation ne tient plus aux droits d'un serveur, mais à ce qu'aucune connexion n'atteint un autre fichier ; le chargement des contrats et l'analyse des sources le vérifient |
| D2.INV-2 : contrats nommés seulement | D21.INV-2, mot pour mot | paramètres nommés de `StatementSync` au lieu des marqueurs `$1` de `pg` |
| D2.INV-3 : oracle en lecture seule | D21.INV-3, mot pour mot | inchangé ; `pg` ne sert plus qu'à l'oracle |
| D2.INV-4 : purge des preuves | D21.INV-4, mot pour mot | inchangé |
| — | D21.INV-5 : chaque écriture en transaction, contrôle d'intégrité au démarrage | ajouté |
| droits `INSERT` et `SELECT` seuls sur le journal et le grand livre | déclencheurs d'ajout seul, vérifiés au démarrage avec la chaîne | D10.INV-1 remplacé par un invariant plus fort |
| PostgreSQL d'Agent2Test sur le port 5433, service `postgres-a2t` | fichiers SQLite, sans serveur ni port | D18.INV-3 remplacé par un invariant plus fort ; le service Compose disparaît |
| `tsvector` français et pgvector | FTS5, et vecteurs rangés avec les fragments (module `memoire`) | invariants D12 inchangés |

Une instance 1.0.0 sans données n'a rien à faire : l'installation crée les fichiers. Une instance qui a des données les reprend une fois, par la commande humaine `npm run migrer:depuis-postgresql -- --dsn <référence au fichier de secret>` :

1. elle lit chaque schéma de la base `agent2test` dans une transaction en lecture seule, et écrit le fichier correspondant en une transaction ;
2. elle recopie les lignes du journal et les entrées du grand livre avec leurs empreintes, sans rien recalculer, puis vérifie les deux chaînes dans les fichiers : elles doivent être intactes, avec la même empreinte de fin que dans PostgreSQL ;
3. elle compare le nombre de lignes de chaque table ; un écart arrête la reprise et retire les fichiers qu'elle a écrits ;
4. elle inscrit au journal une ligne `donnees.migration`, avec les comptes et les deux empreintes de fin.

La commande ne modifie ni ne supprime rien dans PostgreSQL. Une fois la reprise vérifiée, le développeur arrête et retire lui-même le service `postgres-a2t`. Les preuves, qui sont des fichiers, restent où elles sont.

## 10. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| BD1 | D21.INV-1 | la connexion de `verdict` n'atteint aucune table de `plan.sqlite` ; un contrat qui contient `ATTACH` ou `DROP TRIGGER` empêche le démarrage, avec son nom |
| BD2 | D21.INV-1 | aucun fichier de `src/` hors de `src/donnees/` n'importe `node:sqlite` ni `pg`, et `allowExtension` n'est jamais vrai (analyse des sources) |
| BD3 | D21.INV-2 | un contrat inconnu est refusé `CONTRAT_INCONNU` ; un contrat appelé par un autre agent est refusé `CONTRAT_INTERDIT` |
| BD4 | D21.INV-2 | aucune action n'accepte de SQL en paramètre, et aucun texte de contrat n'est construit par concaténation (analyse des contrats déclarés) |
| BD5 | D21.INV-3 | une demande à l'oracle sans configuration humaine est refusée `ORACLE_INACTIF` |
| BD6 | D21.INV-3 | avec l'oracle actif, une écriture est refusée par la transaction en lecture seule |
| BD7 | D21.INV-4 | une preuve de 31 jours est purgée, son empreinte reste en base et une ligne `preuve.purgee` est écrite |
| BD8 | D21.INV-5 | un processus tué au milieu d'une transaction de 50 000 enregistrements ne laisse, à la réouverture, aucun de ces enregistrements, et `integrity_check` rend `ok` ; un fichier altéré empêche le démarrage, avec son nom |
| BD9 | D21.INV-5 | le kit et la purge, qui écrivent le journal en même temps, laissent une chaîne intacte ; une migration appliquée dont le fichier a changé empêche le démarrage |
| BD10 | D10.INV-1, D15.INV-2 | la reprise d'un jeu de schémas 1.0.0 simulé donne des fichiers dont les chaînes du journal et du grand livre sont intactes, avec les mêmes empreintes de fin ; un écart de compte arrête la reprise et ne laisse aucun fichier |

Les tests BD tournent sans réseau ni Docker, sauf BD6, qui a besoin d'un PostgreSQL de test et d'un compte de lecture seule ; en leur absence, BD6 est signalé comme non exécuté, jamais comme réussi. BD10 simule le pilote `pg`.

## 11. Fichiers à produire

- `src/donnees/agent.js`, `src/donnees/connexions.js`, `src/donnees/transactions.js`, `src/donnees/oracle.js`
- `src/donnees/contrats/<fichier>.js` (un par fichier de données)
- `migrations/<fichier>/001-initial.sql`, une par fichier de données
- `scripts/migrer.js`, `scripts/purger.js`, `scripts/sauvegarder.js`, `scripts/exporter.js`, `scripts/migrer-depuis-postgresql.js`
- `test/donnees/*.test.js`
