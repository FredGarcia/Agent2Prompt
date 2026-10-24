---
name: donnees
description: Données d'Agent2Dev dans un fichier SQLite unique, dont l'agent médiateur donnees tient la seule connexion (actions du bus lire, ecrire, ajouter, lister et compter sur les collections que l'appelant a déclarées, appelant attesté par le bus, table tirée de l'appelant et de la collection, aucun SQL ni nom de table venu d'un agent, module intégré node:sqlite dès le premier enregistrement, journal WAL et synchronisation complète, contrôle d'intégrité au démarrage, documents JSON validés par la base, chaque écriture en transaction, collections en ajout seul protégées par déclencheurs, collections chaînées numérotées par le médiateur dans la transaction d'ajout, migrations par agent dont chaque objet porte son préfixe, requêtes du médiateur vérifiées au démarrage sur le plan d'exécution de SQLite, déclencheurs, vues et clés étrangères compris, export en lecture seule, purge par commande humaine, copie de travail comprise, reprise d'une instance 1.0.0). À implémenter au lot 2.
dimensions: [D24]
status: active
---

# Module `donnees` (D24)

Agent2Dev garde ses données hors du projet de l'application et hors de son propre dépôt, dans le dossier de données de l'instance (`~/.agent2dev/donnees/` par défaut, module `exploitation`). `donnees` est l'agent médiateur : il est le seul à ouvrir le fichier de données, `agent2dev.sqlite`, et chaque autre agent n'y accède que par ses actions, sur le bus (D24.INV-1).

## 1. Actions du médiateur (D24.INV-1, D24.INV-2)

```js
await bus.demander('donnees', 'lire', { collection, id }, contexte);                 // un document, ou null
await bus.demander('donnees', 'ecrire', { collection, id, document }, contexte);     // crée ou remplace (collections modifiables)
await bus.demander('donnees', 'ajouter', { collection, enregistrement }, contexte);  // ajoute en fin (collections en ajout seul)
await bus.demander('donnees', 'lister', { collection, filtre }, contexte);           // documents filtrés par champs égaux
await bus.demander('donnees', 'compter', { collection }, contexte);
```

- L'agent propriétaire est l'appelant que pose le bus dans le contexte (module `noyau`, section 3), jamais une valeur de la charge. Le médiateur tire la table de l'appelant et de la collection, `<agent>__<collection>`, par exemple `orchestrateur__decisions`. Aucun agent ne lui transmet de SQL ni de nom de table : un agent ne peut même pas désigner la table d'un autre.
- Chaque agent déclare ses collections dans son contrat, avec leur nature et leurs index : `modifiable`, `ajout-seul`, ou `chainee`, en ajout seul et chaînée par empreintes. Une collection que l'appelant n'a pas déclarée est refusée `COLLECTION_INCONNUE`.
- Un agent lit les données d'un autre par une action déclarée de cet agent, sur le bus ; le médiateur ne lui sert jamais la collection d'un autre.
- Le journal du module `journal` et le grand livre du `referentiel` sont `chainee` ; les décisions de l'`orchestrateur` sont `ajout-seul`. Pour une collection `chainee`, le médiateur lit la dernière ligne, calcule le numéro `n` et les empreintes par la fonction de chaînage du noyau, puis écrit la ligne, dans la même transaction : deux écrivains, le kit et une commande humaine, ne rompent pas la chaîne.

| Agent | Collections principales |
|---|---|
| `orchestrateur` | demandes, points, décisions (ajout seul), budgets consommés |
| `profil` | profils proposés |
| `depot` | écritures appliquées et contenus antérieurs, états git relevés, commits, copies de travail et patchs remis |
| `executant` | exécutions (commande, code de retour, durée, sortie bornée et masquée), lignes de base |
| `methode` | transmission vérifiée, empreintes, scripts extraits, fiches composées |
| `binome` | remises, journaux de tests reçus et leurs lectures |
| `echange` | remises publiées, journaux relevés |
| `journal` | lignes (chaînée) |
| `observateur` | séries de mesures, alertes |
| `apprenant` | leçons, expositions |
| `reflexif` | mesures d'effet, propositions |
| `referentiel` | versions de fiches et de règles, épinglages, grand livre (chaînée) |
| `donnees` | migrations appliquées |

## 2. Le fichier unique (D24.INV-2, D24.INV-3)

- Dès le premier enregistrement, le médiateur écrit dans `donnees/agent2dev.sqlite`, par le module intégré `node:sqlite` (`DatabaseSync`), sur une seule connexion, `allowExtension` restant à `false` : aucune dépendance, aucun serveur, aucun port, aucune extension.
- À l'ouverture, il règle `journal_mode = WAL`, `synchronous = FULL`, `foreign_keys = ON` et `busy_timeout = 5000`, et vérifie `integrity_check` ; un fichier dont le contrôle ne rend pas `ok`, ou que SQLite refuse dès la première instruction, empêche le démarrage, avec le message « fichier de données altéré : restaurer une sauvegarde ».
- Une collection est une table : `id` en clé, `doc` en texte JSON contraint par `CHECK (json_valid(doc))`, horodatage et version de spécification ; les filtres de `lister` passent par `json_extract`, sur les index déclarés.
- Chaque écriture est une transaction (`BEGIN IMMEDIATE` … `COMMIT`) : un arrêt du processus, même brutal, ne laisse aucun enregistrement partiel, et un pas du `depot` ou une ligne du journal est écrit d'un tenant ou pas du tout.
- Les requêtes du médiateur sont fixes, dans `src/agents/donnees/`. Aucune n'emploie `ATTACH`, `DETACH`, ni une instruction `PRAGMA` hors de l'ouverture. Seules les commandes humaines (purge, export, reprise) ouvrent aussi le fichier, par le code du médiateur, dans leur propre processus ; `BEGIN IMMEDIATE` et `busy_timeout` les font passer après lui, ou avant, jamais en même temps.
- Le schéma évolue par migrations numérotées, `migrations/<agent>/NNN-nom.sql`, que le médiateur applique au démarrage, dans l'ordre, chacune dans une transaction. Il compare `sqlite_schema` avant et après : chaque objet créé ou modifié doit appartenir à une table de l'agent de la migration ; sinon, la migration est annulée en entier, et le démarrage refusé avec l'objet en cause. La table `donnees__migrations` garde l'agent, le numéro, le nom et l'empreinte de chacune ; une migration appliquée dont le fichier a changé empêche le démarrage.
- Une table de l'agent peut encore atteindre celle d'un autre sans la nommer dans une requête : par un déclencheur posé sur elle, par une vue de son espace déclarée comme collection, ou par une clé étrangère. Après les migrations, le médiateur vérifie donc chacune de ses requêtes fixes, sur chaque collection déclarée, par le plan d'exécution de SQLite (`EXPLAIN`), qui comprend les sous-programmes des déclencheurs, les tables sous une vue et les contrôles de clés étrangères : chaque table ou index ouvert en lecture ou en écriture (`OpenRead`, `OpenWrite`) doit appartenir, d'après `sqlite_schema`, à une table de l'agent de la collection, dans le fichier principal ; sinon, le démarrage est refusé, avec la collection et la table en cause.
- Lisibilité : `npm run donnees:exporter -- --collection <agent>__<nom>` rend une collection en JSON Lines, sans rien modifier. Une instance ne lit jamais de fichiers JSON comme source de données.

## 3. Ajout seul (D24.INV-4)

- Une collection `ajout-seul` ou `chainee` n'expose ni `ecrire` ni suppression, et sa table porte deux déclencheurs qui refusent `UPDATE` et `DELETE` :

```sql
CREATE TRIGGER journal__lignes_sans_modification BEFORE UPDATE ON journal__lignes BEGIN SELECT RAISE(ABORT, 'ajout seul'); END;
CREATE TRIGGER journal__lignes_sans_suppression BEFORE DELETE ON journal__lignes BEGIN SELECT RAISE(ABORT, 'ajout seul'); END;
```

- Une altération faite hors du médiateur, par un outil SQLite par exemple, se détecte par la chaîne d'empreintes (module `journal`, module `referentiel`).
- La purge est une commande humaine, hors du bus : `npm run donnees:purger -- --demande ECR-77` retire, en une transaction, les données de travail de la demande close dans les collections de chaque agent, puis sa copie de travail, sa sortie et ses remises de la boîte de sortie de l'échange (module `echange`), et compacte le fichier par `VACUUM`. Elle ne touche jamais au journal, au grand livre, ni à l'arbre de la demande, et s'inscrit au journal (`donnees.purge`). Une demande dont des patchs n'ont pas été appliqués est purgée seulement si la commande porte `--patchs-non-appliques`.

## 4. Pièges connus

- **Connexion de confort** : un agent qui ouvrirait le fichier lui-même contournerait le médiateur ; aucune source hors de `src/agents/donnees/` n'importe `node:sqlite`, et le test des sources le vérifie.
- **Déclencheur passeur, vue ou clé étrangère** : un objet de l'espace d'un agent qui lirait ou écrirait la table d'un autre passerait le contrôle des migrations, puisqu'il porte le bon préfixe ; la vérification par `EXPLAIN` le repère au démarrage.
- **Nom de table construit par l'agent** : impossible par construction ; le médiateur ne reçoit qu'un nom de collection, qu'il préfixe par l'appelant.
- **Chaîne calculée hors de la transaction** : un agent qui calculerait le numéro et l'empreinte avant d'écrire romprait la chaîne au premier écrivain concurrent ; le médiateur les calcule dans la transaction d'ajout.
- **Transaction oubliée** : une suite d'écritures hors transaction laisserait un pas à moitié écrit ; le médiateur n'écrit qu'en transaction.
- **`node:sqlite` sous drapeau** : avant Node 22.13, le module demande `--experimental-sqlite` ; Agent2Dev exige Node 22.13 au minimum (module `exploitation`).
- **Fichier altéré** : selon l'endroit de l'altération, SQLite refuse le fichier dès la première instruction (« file is not a database »), lève une erreur pendant `integrity_check` (« database disk image is malformed »), ou rend la liste des écarts ; les trois cas donnent le même message, et le médiateur ne tente aucune réparation.
- **Guillemets doubles** : `node:sqlite` refuse par défaut une chaîne entre guillemets doubles ; les requêtes écrivent les chaînes entre apostrophes.

## 5. Migration depuis la version 1.0.0 (D2 remplacée)

En 1.0.0, la dimension D2 gardait les données dans un fichier SQLite par agent. D24 la remplace :

| 1.0.0 | 1.1.0 | Ce qui change |
|---|---|---|
| D2.INV-1 : chaque fichier de données a un seul agent propriétaire ; lecture croisée par le bus | D24.INV-1, D24.INV-2 | un fichier unique, que seul le médiateur ouvre ; chaque table a un seul agent propriétaire, dont le médiateur tire le nom de l'appelant que le bus atteste ; la lecture croisée passe toujours par le bus |
| D2.INV-2 : les données d'un agent dans son seul fichier SQLite ; chaque écriture en transaction | D24.INV-3 | un seul fichier pour tous les agents ; les transactions ne changent pas |
| D2.INV-3 : journal et grand livre en ajout seul, purge par commande humaine | D24.INV-4, mot pour mot | inchangé ; le médiateur numérote et chaîne les collections `chainee` dans la transaction d'ajout |

Une instance 1.0.0 sans données n'a rien à faire. Une instance qui a des données les reprend une fois, par la commande humaine `npm run donnees:reprendre [-- --instance <nom>]` :

1. elle lit chaque fichier par agent en lecture seule, et recopie ses tables dans le fichier unique, sous le préfixe de leur agent (`decisions` de `orchestrateur.sqlite` devient `orchestrateur__decisions`), une transaction par fichier ;
2. elle recopie les lignes du journal et les entrées du grand livre avec leurs empreintes, sans rien recalculer, puis vérifie les deux chaînes dans le fichier unique : elles doivent être intactes, avec la même empreinte de fin qu'à la source ;
3. elle compare le nombre d'enregistrements de chaque collection ; un écart arrête la reprise et retire le fichier écrit ;
4. elle inscrit au journal une ligne `donnees.migration`, avec les comptes et les deux empreintes de fin.

La commande ne modifie ni ne supprime les fichiers d'origine ; le développeur les retire lui-même, une fois la reprise vérifiée.

## 6. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| DO1 | D24.INV-1 | l'`apprenant` qui demande au médiateur la collection `decisions` reçoit `COLLECTION_INCONNUE` : il n'atteint que ses collections ; une charge qui prétend un autre appelant ne change rien |
| DO2 | D24.INV-1 | aucun fichier de `src/` hors de `src/agents/donnees/` n'importe `node:sqlite`, les commandes humaines passent par le code du médiateur, et `allowExtension` n'est jamais vrai (analyse des sources) |
| DO3 | D24.INV-2 | les schémas d'entrée des actions du médiateur n'admettent ni SQL ni nom de table, et un enregistrement de l'`executant` dans `executions` va dans la table `executant__executions` |
| DO4 | D24.INV-3 | le premier enregistrement crée `donnees/agent2dev.sqlite`, en mode WAL ; aucun autre fichier de données n'est écrit |
| DO5 | D24.INV-3 | un processus tué au milieu d'une transaction de 50 000 enregistrements ne laisse, à la réouverture, aucun de ces enregistrements, et `integrity_check` rend `ok` ; un fichier de données altéré, à l'en-tête comme dans une page de table ou d'index, empêche le démarrage avec le message « fichier de données altéré : restaurer une sauvegarde » |
| DO6 | D24.INV-2, D24.INV-3 | une migration appliquée dont le fichier a changé empêche le démarrage ; une migration de l'`apprenant` qui crée aussi `orchestrateur__intrus` est annulée en entier ; un document JSON invalide est refusé par la base |
| DO7 | D24.INV-4 | sur une collection en ajout seul, `ecrire` n'existe pas, et un `UPDATE` ou un `DELETE` lancé par un outil SQLite lève « ajout seul » ; le kit et la purge, qui ajoutent au journal en même temps, laissent une chaîne intacte |
| DO8 | D24.INV-4 | la purge d'une demande close retire sa sortie, sa copie de travail, ses remises et ses données de travail, garde le journal et le grand livre, et s'inscrit au journal |
| DO9 | D24.INV-4 | la purge d'une demande dont un patch n'est pas appliqué est refusée sans `--patchs-non-appliques` |
| DO10 | D24.INV-4 | la reprise d'un jeu de fichiers 1.0.0 simulé donne un fichier unique dont les chaînes du journal et du grand livre sont intactes, avec les mêmes empreintes de fin ; un écart de compte arrête la reprise et ne laisse aucun fichier |
| DO11 | D24.INV-2 | un déclencheur de l'`apprenant`, posé sur sa propre table, qui écrit dans `orchestrateur__decisions`, une vue de l'`apprenant` sur cette table déclarée comme collection, ou une clé étrangère d'une table de l'`apprenant` vers elle, empêche le démarrage, avec la collection et la table en cause ; les collections de chaque agent, sans objet passeur, passent |

## 7. Fichiers à produire

- `src/agents/donnees/agent.js`, `src/agents/donnees/sqlite.js`, `src/agents/donnees/collections.js`, `src/agents/donnees/migrations.js`
- `migrations/<agent>/001-initial.sql`, une par agent propriétaire
- `scripts/purger-donnees.js`, `scripts/exporter-donnees.js`, `scripts/reprendre-donnees.js`
- `test/donnees/*.test.js`
