---
name: donnees
description: Données d'Agent2Test dans PostgreSQL sous Docker (image pgvector, base agent2test sur le port 5433, un schéma et un rôle par agent propriétaire, droits en ajout seul pour journal et grand livre, contrats nommés au lieu de SQL libre, migrations numérotées, oracle en lecture seule sur la base de l'application désactivé par défaut, purge des preuves). À implémenter au lot 2.
dimensions: [D2]
status: active
---

# Module `donnees` (D2)

`donnees` est le seul accès à PostgreSQL. Il tient un pool de connexions par rôle et choisit le rôle d'après le champ `appelant` du contexte de bus.

## 1. Base et schémas (D2.INV-1)

Une instance PostgreSQL 17 ou plus récente, image pgvector, en conteneur, port 5433 (module `exploitation`). Une base `agent2test`. Un schéma et un rôle par agent propriétaire :

| Schéma | Rôle propriétaire | Contenu principal |
|---|---|---|
| `plan` | `a2t_plan` | sources, versions du plan, US, critères, scénarios, demandes, campagnes du plan |
| `scan` | `a2t_scanner` | relevés, écrans, éléments, routes, points d'API, empreintes de fichiers |
| `strategie` | `a2t_stratege` | sélections, éléments retenus et écartés, motifs, scores |
| `preparation` | `a2t_preparateur` | profils d'environnement, parcours versionnés, résolutions, réparations |
| `execution` | `a2t_navigateur` | exécutions, résultats d'étape, preuves (chemin et empreinte), métadonnées de session, jamais le secret |
| `verdict` | `a2t_verdict` | verdicts, causes, empreintes, désaccords |
| `orchestration` | `a2t_orchestrateur` | campagnes, cycles, points de contrôle, décisions, file, verrous |
| `journal` | `a2t_journal` | lignes chaînées |
| `observation` | `a2t_observateur` | séries de mesures, alertes |
| `apprentissage` | `a2t_apprenant` | leçons, expositions |
| `reflexion` | `a2t_reflexif` | mesures d'accord, propositions, évaluations des observateurs |
| `referentiel` | `a2t_referentiel` | fiches, règles, versions, épinglages, grand livre |
| `memoire` | `a2t_memoire` | documents, fragments, `tsvector` français, vecteurs |

- Chaque rôle n'a de droits d'écriture que sur son schéma. Un agent qui tente d'écrire ailleurs reçoit le refus de la base elle-même, pas d'un contrôle applicatif.
- Les lectures croisées passent par une action de l'agent propriétaire, sur le bus ; aucun rôle n'a de droit de lecture sur le schéma d'un autre.
- `journal.lignes` et `referentiel.grand_livre` n'accordent à leur rôle que `INSERT` et `SELECT` : ni `UPDATE`, ni `DELETE`, ni `TRUNCATE`. Un déclencheur refuse en plus toute mise à jour.

## 2. Contrats nommés (D2.INV-2)

```js
await bus.demander('donnees', 'executer', { contrat: 'verdict.inserer', parametres: { ... } }, contexte);
```

- Chaque contrat est déclaré dans `src/donnees/contrats/<schema>.js` : nom, rôle, texte SQL paramétré, schéma des paramètres, nature (`lecture` ou `ecriture`).
- Un contrat inconnu, ou appelé par un agent qui n'est pas son propriétaire, est refusé `CONTRAT_INCONNU` ou `CONTRAT_INTERDIT`.
- Aucune action n'accepte de texte SQL en paramètre. Les paramètres passent par les marqueurs `$1, $2…` du pilote `pg`, jamais par concaténation.

## 3. Migrations

- `migrations/NNN-nom.sql`, numérotées, appliquées dans l'ordre par `npm run migrer` avec le rôle d'administration, jamais par un agent.
- Une table `public.migrations` enregistre numéro, nom et empreinte de chaque migration appliquée ; une migration appliquée dont le fichier a changé empêche le démarrage.

## 4. Base de l'application (D2.INV-3)

La base de l'application n'est pas touchée. L'oracle SQL en lecture seule reste possible, à trois conditions :

1. la configuration humaine porte `oracle: { actif: true, dsn: "<référence au fichier de secret>" }` ;
2. la connexion se fait avec un compte de lecture seule et `default_transaction_read_only = on` ;
3. seuls des contrats de lecture nommés, déclarés par les scénarios dans le profil d'environnement et ratifiés en CP-2, s'exécutent.

Sans ces trois conditions, toute demande à l'oracle est refusée `ORACLE_INACTIF`.

## 5. Conservation (D2.INV-4)

- Les preuves (captures, traces, instantanés) sont des fichiers ; leur chemin et leur empreinte SHA-256 sont en base.
- Durée de conservation par défaut : 30 jours, fixée par la configuration humaine (`conservation.preuvesJours`) ; le système ne la modifie pas.
- `npm run purger` supprime les fichiers échus et inscrit au journal une ligne `preuve.purgee` par fichier, avec son empreinte ; l'empreinte reste en base.
- Le journal et le grand livre sont conservés sans limite.

## 6. Pièges connus

- **Rôle unique de confort** : un seul rôle pour tous les agents ruine D2.INV-1 ; les tests se connectent avec chaque rôle.
- **SQL dynamique** : un nom de colonne choisi par paramètre est du SQL libre ; il passe par un contrat distinct.
- **Base de l'application par défaut** : le DSN de l'application ne figure dans aucune configuration tant que l'oracle est inactif.

## 7. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| BD1 | D2.INV-1 | le rôle `a2t_verdict` qui écrit dans `plan` reçoit le refus de PostgreSQL |
| BD2 | D2.INV-1 | le rôle `a2t_journal` ne peut ni mettre à jour ni supprimer une ligne du journal |
| BD3 | D2.INV-2 | un contrat inconnu est refusé `CONTRAT_INCONNU` ; un contrat appelé par un autre agent est refusé `CONTRAT_INTERDIT` |
| BD4 | D2.INV-2 | aucune action n'accepte de SQL en paramètre (analyse des contrats déclarés) |
| BD5 | D2.INV-3 | une demande à l'oracle sans configuration humaine est refusée `ORACLE_INACTIF` |
| BD6 | D2.INV-3 | avec l'oracle actif, une écriture est refusée par la transaction en lecture seule |
| BD7 | D2.INV-4 | une preuve de 31 jours est purgée, son empreinte reste en base et une ligne `preuve.purgee` est écrite |

Les tests emploient une base PostgreSQL de test démarrée par `docker compose` ; en son absence, les tests BD sont signalés comme non exécutés, jamais comme réussis.

## 8. Fichiers à produire

- `src/donnees/agent.js`, `src/donnees/pools.js`, `src/donnees/oracle.js`
- `src/donnees/contrats/<schema>.js` (un fichier par schéma)
- `migrations/001-schemas-et-roles.sql`, puis une migration par schéma
- `scripts/migrer.js`, `scripts/purger.js`
- `test/donnees/*.test.js`
