---
name: donnees
description: Données d'Agent2Test dans un fichier SQLite unique, dont l'agent médiateur donnees tient la seule connexion (module intégré node:sqlite, journal WAL et synchronisation complète, contrôle d'intégrité au démarrage, tables préfixées par leur agent propriétaire, contrats nommés au lieu de SQL libre, exécutés pour leur seul propriétaire et vérifiés au démarrage sur le plan d'exécution de SQLite, déclencheurs compris, sans ATTACH, sans extension ni instruction de schéma, chaque écriture en transaction, déclencheurs d'ajout seul pour journal et grand livre, migrations par propriétaire dont chaque objet porte son préfixe, sauvegarde et export par commandes humaines, oracle en lecture seule sur la base de l'application désactivé par défaut, purge des preuves, reprise d'une instance 1.1.0 ou 1.0.0). À implémenter au lot 2.
dimensions: [D23]
status: active
---

# Module `donnees` (D23)

`donnees` est l'agent médiateur des données : il est le seul à ouvrir le fichier de données, et chaque autre agent n'y accède que par ses actions, sur le bus. Il tient une seule connexion `DatabaseSync`. Aucun autre module n'importe `node:sqlite` ni `pg` ; les commandes humaines (migrations, purge, sauvegarde, export, reprise) passent par son code, `src/donnees/`, dans leur propre processus.

## 1. Le fichier unique et ses espaces (D23.INV-1)

Le fichier est `agent2test.sqlite`, dans le dossier de données de la configuration humaine (`donnees.dossier`, `~/.agent2test/donnees/` par défaut), hors du dépôt d'Agent2Test et du projet de l'application (D18.INV-3). Chaque agent propriétaire y a son espace : ses tables, leurs index et leurs déclencheurs portent son préfixe, le nom de son schéma de la version 1.0.0 suivi de deux soulignés.

| Préfixe | Agent propriétaire | Contenu principal |
|---|---|---|
| `plan__` | `plan` | sources, versions du plan, US, critères, scénarios, demandes, campagnes du plan |
| `scan__` | `scanner` | relevés, écrans, éléments, routes, points d'API, empreintes de fichiers |
| `strategie__` | `stratege` | sélections, éléments retenus et écartés, motifs, scores |
| `preparation__` | `preparateur` | profils d'environnement, parcours versionnés, résolutions, réparations |
| `execution__` | `navigateur` | exécutions, résultats d'étape, preuves (chemin et empreinte), métadonnées de session, jamais le secret |
| `verdict__` | `verdict` | verdicts, causes, empreintes, désaccords |
| `orchestration__` | `orchestrateur` | campagnes, cycles, points de contrôle, décisions, file, verrous, remises reçues |
| `journal__` | `journal` | lignes chaînées |
| `observation__` | `observateur` | séries de mesures, alertes |
| `apprentissage__` | `apprenant` | leçons, expositions |
| `reflexion__` | `reflexif` | mesures d'accord, propositions, évaluations des observateurs |
| `referentiel__` | `referentiel` | fiches, règles, versions, épinglages, grand livre |
| `memoire__` | `memoire` | documents, fragments, index plein texte FTS5, vecteurs |
| `donnees__` | `donnees` | migrations appliquées |

- Le médiateur ouvre le fichier par `new DatabaseSync(chemin)`, `allowExtension` restant à `false` : aucune extension ne se charge.
- Une lecture croisée passe par une action de l'agent propriétaire, sur le bus ; le médiateur ne sert jamais à un agent la table d'un autre.

## 2. Contrats nommés et leur vérification (D23.INV-1, D23.INV-2)

```js
await bus.demander('donnees', 'executer', { contrat: 'verdict.inserer', parametres: { ... } }, contexte);
```

- Chaque contrat est déclaré dans `src/donnees/contrats/<espace>.js` : nom, agent propriétaire, texte SQL paramétré, schéma des paramètres, nature (`lecture` ou `ecriture`).
- Un contrat inconnu, ou appelé par un agent qui n'est pas son propriétaire, est refusé `CONTRAT_INCONNU` ou `CONTRAT_INTERDIT`. L'appelant est celui que pose le bus dans le contexte (module `noyau`), jamais une valeur de la charge.
- Aucune action n'accepte de texte SQL en paramètre. Les paramètres passent par les paramètres nommés d'une instruction préparée (`StatementSync`, `:nom`), jamais par concaténation.
- Un contrat de nature `chainee`, comme `journal.ajouter` et celui qui inscrit au grand livre, ajoute une ligne chaînée : dans la même transaction, le médiateur lit la dernière ligne, calcule le numéro `n` et les empreintes par la fonction de chaînage du noyau, puis écrit la ligne. Deux écrivains, le kit et une commande humaine, ne rompent pas la chaîne.

Au démarrage, avant de servir le premier appel, le médiateur prépare chaque contrat et le vérifie :

1. un texte qui emploie `ATTACH`, `DETACH`, `PRAGMA`, `VACUUM`, `load_extension` ou une instruction de schéma (`CREATE`, `DROP`, `ALTER`) empêche le démarrage, avec le nom du contrat ;
2. le médiateur lit le plan d'exécution du contrat (`EXPLAIN`) : chaque ouverture de table, `OpenRead` ou `OpenWrite`, désigne une page racine, que `sqlite_schema` rattache à sa table. Une table hors de l'espace du propriétaire, ou une ouverture hors de la base principale, empêche le démarrage, avec le contrat et la table. Le plan comprend les programmes des déclencheurs, les tables sous une vue et les contrôles de clés étrangères : un déclencheur, une vue ou une clé étrangère qui atteint l'espace d'un autre fait refuser chaque contrat qui le met en jeu ;
3. une table virtuelle, comme l'index FTS5 de la `memoire`, n'apparaît pas par sa page racine : un contrat ne nomme que les tables virtuelles de son espace, d'après la liste de `sqlite_schema` ;
4. sous Node 24.10 ou plus récent, le médiateur pose en plus un autorisateur (`setAuthorizer`), qui refuse à la préparation toute table hors de l'espace du propriétaire du contrat.

Les instructions préparées sont gardées pour toute la vie du processus. Aucun appel ne passe tant que la vérification n'est pas terminée.

## 3. Ouverture et transactions (D23.INV-5)

À l'ouverture :

1. `PRAGMA journal_mode = WAL`, `PRAGMA synchronous = FULL`, `PRAGMA foreign_keys = ON`, `PRAGMA busy_timeout = 5000`, écrits dans `src/donnees/connexion.js` ; ce sont les seules instructions `PRAGMA` du kit ;
2. `PRAGMA integrity_check` doit rendre `ok` ; sinon, comme pour un fichier que SQLite refuse dès la première instruction, le démarrage est refusé, avec le message « fichier de données altéré : restaurer une sauvegarde » ;
3. les migrations doivent être toutes appliquées et inchangées (section 4) ;
4. les déclencheurs d'ajout seul du journal et du grand livre doivent être présents (section 5) ;
5. les contrats sont vérifiés (section 2).

- Chaque contrat d'écriture s'exécute dans une transaction `BEGIN IMMEDIATE` … `COMMIT`, avec `ROLLBACK` sur erreur ; un contrat composé enchaîne plusieurs instructions de son espace dans la même transaction. Un arrêt du processus, même brutal, ne laisse aucun enregistrement partiel : à la réouverture, SQLite garde ou écarte la transaction entière.
- Une table range ses documents en JSON quand leur forme varie : colonne `doc` contrainte par `CHECK (json_valid(doc))`, filtres par `json_extract` sur des index déclarés. Les champs que les contrats filtrent souvent sont des colonnes à part, typées.
- Dans le kit, le médiateur est le seul à écrire le fichier ; une commande humaine, comme la purge, ouvre sa propre connexion pendant que le kit tourne. `BEGIN IMMEDIATE` les fait passer l'un après l'autre, et `busy_timeout` fait attendre le second 5 secondes au plus.

## 4. Migrations (D23.INV-1)

- `migrations/<espace>/NNN-nom.sql`, numérotées par espace, appliquées dans l'ordre par `npm run migrer`, commande humaine que l'installation lance aussi ; jamais par un agent.
- Chaque migration s'applique dans une transaction. Le médiateur compare `sqlite_schema` avant et après : chaque objet créé ou modifié doit appartenir à une table de l'espace de la migration ; sinon, la transaction est annulée en entier, et la commande s'arrête avec l'objet en cause. Les index automatiques de SQLite (`sqlite_autoindex_…`) se rattachent à leur table.
- La table `donnees__migrations` garde l'espace, le numéro, le nom et l'empreinte SHA-256 de chaque migration appliquée. Au démarrage, une migration non appliquée, ou appliquée dont le fichier a changé, empêche le démarrage, avec son nom.

## 5. Ajout seul (D10.INV-1, D15.INV-2)

Les tables `journal__lignes` et `referentiel__grand_livre` portent chacune deux déclencheurs, créés par leur migration initiale, qui refusent toute modification et toute suppression :

```sql
CREATE TRIGGER journal__lignes_sans_modification BEFORE UPDATE ON journal__lignes BEGIN SELECT RAISE(ABORT, 'ajout seul'); END;
CREATE TRIGGER journal__lignes_sans_suppression BEFORE DELETE ON journal__lignes BEGIN SELECT RAISE(ABORT, 'ajout seul'); END;
```

- Les déclencheurs valent pour toute connexion, celle d'un outil SQLite comprise. Un `DELETE` sans condition les déclenche aussi : en présence d'un déclencheur, SQLite renonce à vider la table d'un coup.
- Aucun contrat ne peut retirer un déclencheur (section 2) ; seul un outil extérieur le peut. Au démarrage, un déclencheur absent empêche le démarrage, et la chaîne d'empreintes est vérifiée en entier (module `journal`, section 1 ; module `referentiel`, section 5).

## 6. Base de l'application (D23.INV-3)

La base de l'application n'est pas touchée. L'oracle SQL en lecture seule reste possible, à trois conditions :

1. la configuration humaine porte `oracle: { actif: true, dsn: "<référence au fichier de secret>" }` ;
2. la connexion se fait par le pilote `pg`, avec un compte de lecture seule et `default_transaction_read_only = on` ;
3. seuls des contrats de lecture nommés, déclarés par les scénarios dans le profil d'environnement et ratifiés en CP-2, s'exécutent.

Sans ces trois conditions, toute demande à l'oracle est refusée `ORACLE_INACTIF`. L'oracle est le seul usage de `pg`, et la seule connexion d'Agent2Test à une base qui ne soit pas son fichier de données.

## 7. Conservation, sauvegarde et export (D23.INV-4)

- Les preuves (captures, traces, instantanés) sont des fichiers ; leur chemin et leur empreinte SHA-256 sont en base.
- Durée de conservation par défaut : 30 jours, fixée par la configuration humaine (`conservation.preuvesJours`) ; le système ne la modifie pas.
- `npm run purger` supprime les fichiers échus et inscrit au journal une ligne `preuve.purgee` par fichier, avec son empreinte ; l'empreinte reste en base.
- Le journal et le grand livre sont conservés sans limite.
- `npm run donnees:sauvegarder` écrit une copie cohérente du fichier par `VACUUM INTO`, dans le dossier de sauvegarde de la configuration humaine, et s'inscrit au journal (`donnees.sauvegarde`). `npm run donnees:exporter -- --table <nom>` rend une table en JSON Lines, sans rien modifier. Ce sont des commandes humaines, hors du bus.

## 8. Pièges connus

- **Connexion de confort** : un agent qui ouvrirait le fichier lui-même contournerait le médiateur ; aucune source hors de `src/donnees/` n'importe `node:sqlite`, et un test le vérifie.
- **Table sans préfixe** : elle n'aurait pas de propriétaire ; la migration qui la crée est annulée.
- **Déclencheur passeur, vue ou clé étrangère** : un objet de l'espace `verdict` qui lirait ou écrirait celui du `plan` ferait un accès croisé sans contrat croisé, et passerait le contrôle des migrations, puisqu'il porte le bon préfixe ; le plan d'exécution le montre, et les contrats qui le mettent en jeu sont refusés.
- **SQL dynamique** : un nom de colonne choisi par paramètre est du SQL libre ; il passe par un contrat distinct.
- **Guillemets doubles** : `node:sqlite` refuse par défaut une chaîne entre guillemets doubles, qu'il lit comme un identifiant ; les contrats écrivent les chaînes entre apostrophes.
- **`node:sqlite` sous option** : avant Node 22.13, le module exige `--experimental-sqlite` ; le kit exige Node 22.13 (D18.INV-1).
- **Fichier altéré** : selon l'endroit de l'altération, SQLite refuse le fichier dès la première instruction (« file is not a database »), lève une erreur pendant `integrity_check` (« database disk image is malformed »), ou rend la liste des écarts ; les trois cas donnent le même message, et le médiateur ne tente aucune réparation.
- **Base de l'application par défaut** : le DSN de l'application ne figure dans aucune configuration tant que l'oracle est inactif.

## 9. Migration depuis les versions 1.1.0 et 1.0.0 (D21 et D2 remplacées)

En 1.1.0, la dimension D21 gardait les données dans un fichier SQLite par agent ; elle avait elle-même remplacé D2, qui, en 1.0.0, les gardait dans PostgreSQL, un schéma et un rôle par agent (D2.INV-1, D2.INV-2, D2.INV-3 et D2.INV-4). D23 remplace D21 :

| 1.1.0 | 1.2.0 | Ce qui change |
|---|---|---|
| D21.INV-1 : un fichier et une connexion par agent, sans `ATTACH` ni extension | D23.INV-1 : un fichier unique, dont le médiateur tient la seule connexion ; tables préfixées par leur propriétaire ; contrats vérifiés au démarrage sur le plan d'exécution de SQLite | la séparation ne tient plus à des fichiers distincts, mais au médiateur et à la vérification des contrats et des migrations |
| D21.INV-2 : contrats nommés seulement | D23.INV-2, mot pour mot | inchangé |
| D21.INV-3 : oracle en lecture seule | D23.INV-3, mot pour mot | inchangé |
| D21.INV-4 : purge des preuves | D23.INV-4, mot pour mot | inchangé |
| D21.INV-5 : chaque écriture en transaction, contrôle d'intégrité au démarrage | D23.INV-5 | le contrôle porte sur le fichier unique |

Une instance sans données n'a rien à faire : l'installation crée le fichier. Une instance qui a des données les reprend une fois, par une commande humaine :

- depuis la 1.1.0, `npm run migrer:depuis-fichiers` lit chaque fichier par agent en lecture seule, et recopie ses tables dans l'espace de son propriétaire (`lignes` de `journal.sqlite` devient `journal__lignes`) ;
- depuis la 1.0.0, `npm run migrer:depuis-postgresql -- --dsn <référence au fichier de secret>` lit chaque schéma de la base `agent2test` dans une transaction en lecture seule, et le recopie de même.

Dans les deux cas :

1. chaque source s'écrit dans le fichier unique en une transaction ;
2. les lignes du journal et les entrées du grand livre sont recopiées avec leurs empreintes, sans rien recalculer, puis les deux chaînes sont vérifiées dans le fichier unique : elles doivent être intactes, avec la même empreinte de fin qu'à la source ;
3. le nombre de lignes de chaque table est comparé à la source ; un écart arrête la reprise et retire le fichier écrit ;
4. une ligne `donnees.migration` s'inscrit au journal, avec les comptes et les deux empreintes de fin.

La commande ne modifie ni ne supprime rien à la source : le développeur retire lui-même les anciens fichiers, ou le service `postgres-a2t`, une fois la reprise vérifiée. Les preuves, qui sont des fichiers, restent où elles sont.

## 10. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| BD1 | D23.INV-1 | un contrat de `verdict` qui lit ou écrit une table du `plan`, par jointure, sous-requête, `INSERT … SELECT`, déclencheur, vue de son espace ou clé étrangère, empêche le démarrage, avec le contrat et la table ; un contrat qui contient `ATTACH` ou `DROP TRIGGER` aussi |
| BD2 | D23.INV-1 | aucun fichier de `src/` hors de `src/donnees/` n'importe `node:sqlite` ni `pg`, les commandes humaines passent par `src/donnees/`, et `allowExtension` n'est jamais vrai (analyse des sources) |
| BD3 | D23.INV-2 | un contrat inconnu est refusé `CONTRAT_INCONNU` ; un contrat appelé par un autre agent est refusé `CONTRAT_INTERDIT`, même quand la charge prétend un autre appelant |
| BD4 | D23.INV-2 | aucune action n'accepte de SQL en paramètre, et aucun texte de contrat n'est construit par concaténation (analyse des contrats déclarés) |
| BD5 | D23.INV-3 | une demande à l'oracle sans configuration humaine est refusée `ORACLE_INACTIF` |
| BD6 | D23.INV-3 | avec l'oracle actif, une écriture est refusée par la transaction en lecture seule |
| BD7 | D23.INV-4 | une preuve de 31 jours est purgée, son empreinte reste en base et une ligne `preuve.purgee` est écrite |
| BD8 | D23.INV-5 | un processus tué au milieu d'une transaction de 50 000 enregistrements ne laisse, à la réouverture, aucun de ces enregistrements, et `integrity_check` rend `ok` ; un fichier altéré, à l'en-tête comme dans une page de table ou d'index, empêche le démarrage, avec le message prévu |
| BD9 | D23.INV-5 | le kit et la purge, qui écrivent le journal en même temps, laissent une chaîne intacte ; une migration appliquée dont le fichier a changé empêche le démarrage |
| BD10 | D23.INV-1 | une migration de l'espace `verdict` qui crée aussi `plan__intrus` est annulée en entier, avec l'objet en cause ; la table `verdict__verdicts`, créée par la même migration, n'existe pas après l'annulation |
| BD11 | D23.INV-1 | un contrat de la `memoire` sur sa table FTS5 est accepté ; un contrat de `verdict` qui la nomme, ou qui lit l'une de ses tables internes, est refusé |
| BD12 | D23.INV-1 | sous Node 24.10 ou plus récent, l'autorisateur refuse à la préparation une instruction qui touche la table d'un autre espace ; sous une version antérieure, BD12 est signalé comme non exécuté, jamais comme réussi |
| BD13 | D10.INV-1, D15.INV-2 | la reprise d'un jeu de fichiers 1.1.0 simulé donne un fichier unique dont les chaînes du journal et du grand livre sont intactes, avec les mêmes empreintes de fin ; un écart de compte arrête la reprise et ne laisse aucun fichier |
| BD14 | D10.INV-1, D15.INV-2 | la reprise d'un jeu de schémas 1.0.0 simulé donne le même résultat, et un écart de compte l'arrête de même |

Les tests BD tournent sans réseau ni Docker, sauf BD6, qui a besoin d'un PostgreSQL de test et d'un compte de lecture seule ; en leur absence, BD6 est signalé comme non exécuté, jamais comme réussi. BD14 simule le pilote `pg`.

## 11. Fichiers à produire

- `src/donnees/agent.js`, `src/donnees/connexion.js`, `src/donnees/verification.js`, `src/donnees/transactions.js`, `src/donnees/oracle.js`
- `src/donnees/contrats/<espace>.js` (un par espace)
- `migrations/<espace>/001-initial.sql`, une par espace
- `scripts/migrer.js`, `scripts/purger.js`, `scripts/sauvegarder.js`, `scripts/exporter.js`, `scripts/migrer-depuis-fichiers.js`, `scripts/migrer-depuis-postgresql.js`
- `test/donnees/*.test.js`
