---
name: donnees
description: Stockage d'Agent2Dev (port de stockage du noyau, un fichier SQLite par agent propriétaire dès le premier enregistrement par le module intégré node:sqlite, journal WAL et synchronisation complète, chaque écriture dans une transaction, documents JSON validés par la base, collections en ajout seul protégées par déclencheurs, accès d'un agent aux données d'un autre par le bus seulement, migrations numérotées, export en lecture seule, purge par commande humaine, copie de travail comprise). À implémenter au lot 2.
dimensions: [D2]
status: active
---

# Module `donnees` (D2)

Agent2Dev garde ses données hors du projet de l'application et hors de son propre dépôt, dans le dossier de données de l'instance (`~/.agent2dev/donnees/` par défaut, module `exploitation`). Le module fournit le port de stockage du noyau ; chaque agent l'ouvre pour lui-même, sur son propre fichier SQLite.

## 1. Port de stockage (D2.INV-1)

```js
const s = stockage.ouvrir(contexte);       // l'agent propriétaire est l'appelant du contexte
await s.lire(collection, id);              // un document, ou null
await s.ecrire(collection, id, document);  // crée ou remplace un document (collections modifiables)
await s.ajouter(collection, enregistrement); // ajoute en fin (collections en ajout seul)
await s.lister(collection, filtre);        // documents filtrés par champs égaux
await s.compter(collection);
```

- Un agent n'ouvre que son propre fichier. Ouvrir celui d'un autre est refusé avec l'erreur `DONNEES_D_UN_AUTRE_AGENT` ; un agent lit les données d'un autre par une action déclarée de cet agent, sur le bus.
- Le port n'expose aucune requête SQL : les agents n'en écrivent pas. Ses requêtes sont fixes, dans `src/noyau/stockage/`, et aucune n'emploie `ATTACH`, `DETACH` ni une instruction `PRAGMA` qui modifierait le schéma : la connexion d'un agent n'atteint jamais le fichier d'un autre.
- Chaque collection est déclarée par son agent, avec sa nature : `modifiable` ou `ajout-seul`. Le journal du module `journal`, le grand livre du `referentiel` et les décisions de l'`orchestrateur` sont `ajout-seul`.

| Agent | Collections principales |
|---|---|
| `orchestrateur` | demandes, points, décisions (ajout seul), budgets consommés |
| `profil` | profils proposés |
| `depot` | écritures appliquées et contenus antérieurs, états git relevés, commits, copies de travail et patchs remis |
| `executant` | exécutions (commande, code de retour, durée, sortie bornée et masquée), lignes de base |
| `methode` | transmission vérifiée, empreintes, scripts extraits, fiches composées |
| `binome` | remises, journaux de tests reçus et leurs lectures |
| `journal` | lignes chaînées (ajout seul) |
| `observateur` | séries de mesures, alertes |
| `apprenant` | leçons, expositions |
| `reflexif` | mesures d'effet, propositions |
| `referentiel` | versions de fiches et de règles, épinglages, grand livre (ajout seul) |

## 2. Un fichier SQLite par agent (D2.INV-2)

- Dès son premier enregistrement, un agent écrit dans `donnees/<agent>.sqlite`, par le module intégré `node:sqlite` (`DatabaseSync`) : aucune dépendance, aucun serveur, aucun port.
- À l'ouverture, le port règle `journal_mode = WAL`, `synchronous = FULL` et `foreign_keys = ON`, et vérifie `integrity_check` ; un fichier qui échoue empêche le démarrage, avec le nom de l'agent.
- Une collection est une table : `id` en clé, `doc` en texte JSON contraint par `CHECK (json_valid(doc))`, horodatage et version de spécification ; les filtres de `lister` passent par `json_extract`, sur des index déclarés par l'agent.
- Chaque écriture du port est une transaction (`BEGIN IMMEDIATE` … `COMMIT`) : un arrêt du processus, même brutal, ne laisse aucun enregistrement partiel, et un pas du `depot` ou une ligne du journal est écrit d'un tenant ou pas du tout.
- Le schéma de chaque fichier évolue par migrations numérotées, `migrations/<agent>/NNN-nom.sql`, appliquées au démarrage dans l'ordre ; une table `migrations` garde le numéro, le nom et l'empreinte de chacune, et une migration appliquée dont le fichier a changé empêche le démarrage.
- Lisibilité : `npm run donnees:exporter -- --agent <agent> [--collection <nom>]` rend une collection en JSON Lines, sans rien modifier. Une instance ne lit jamais de fichiers JSON comme source de données.

## 3. Ajout seul (D2.INV-3)

- Une collection `ajout-seul` n'expose ni `ecrire` ni suppression, et sa table porte deux déclencheurs qui refusent `UPDATE` et `DELETE` :

```sql
CREATE TRIGGER journal_sans_modification BEFORE UPDATE ON journal BEGIN SELECT RAISE(ABORT, 'ajout seul'); END;
CREATE TRIGGER journal_sans_suppression BEFORE DELETE ON journal BEGIN SELECT RAISE(ABORT, 'ajout seul'); END;
```

- Une altération faite hors du port, par un outil SQLite par exemple, se détecte par la chaîne d'empreintes (module `journal`, module `referentiel`).
- La purge est une commande humaine, hors du bus : `npm run donnees:purger -- --demande ECR-77` retire les données de travail, la copie de travail et la sortie d'une demande close, puis compacte les fichiers par `VACUUM`. Elle ne touche jamais au journal, au grand livre, ni à l'arbre de la demande, et s'inscrit au journal (`donnees.purge`). Une demande dont des patchs n'ont pas été appliqués est purgée seulement si la commande porte `--patchs-non-appliques`.

## 4. Pièges connus

- **Lecture croisée par le fichier** : un agent qui ouvre le fichier d'un autre contourne son contrat ; le port le refuse, et le test des sources le détecte.
- **Une base pour tous** : un seul fichier partagé ruinerait D2.INV-1 ; chaque agent a le sien, et le port ne les attache jamais l'un à l'autre.
- **Transaction oubliée** : une suite d'écritures hors transaction laisserait un pas à moitié écrit ; le port n'écrit qu'en transaction.
- **`node:sqlite` sous drapeau** : avant Node 22.13, le module demande `--experimental-sqlite` ; Agent2Dev exige Node 22.13 au minimum (module `exploitation`).

## 5. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| DO1 | D2.INV-1 | l'`apprenant` qui ouvre le stockage de l'`orchestrateur` est refusé `DONNEES_D_UN_AUTRE_AGENT` |
| DO2 | D2.INV-1 | aucun fichier de `src/agents/<a>/` n'ouvre un fichier `.sqlite`, et aucune requête du port n'emploie `ATTACH` ni `DETACH` (analyse des sources) |
| DO3 | D2.INV-2 | le premier enregistrement d'un agent crée `donnees/<agent>.sqlite`, en mode WAL ; aucun fichier JSON de données n'est écrit |
| DO4 | D2.INV-2 | un processus tué au milieu d'une transaction de 50 000 enregistrements ne laisse, à la réouverture, aucun de ces enregistrements, et `integrity_check` rend `ok` |
| DO5 | D2.INV-3 | sur une collection en ajout seul, `ecrire` n'existe pas, et un `UPDATE` ou un `DELETE` lancé par un outil SQLite lève « ajout seul » |
| DO6 | D2.INV-3 | la purge d'une demande close retire sa sortie, sa copie de travail et ses données de travail, garde le journal et le grand livre, et s'inscrit au journal |
| DO7 | D2.INV-3 | la purge d'une demande dont un patch n'est pas appliqué est refusée sans `--patchs-non-appliques` |
| DO8 | D2.INV-2 | une migration appliquée dont le fichier a changé empêche le démarrage ; un document JSON invalide est refusé par la base |

## 6. Fichiers à produire

- `src/noyau/stockage/port.js`, `src/noyau/stockage/sqlite.js`, `src/noyau/stockage/migrations.js`
- `migrations/<agent>/001-initial.sql`, une par agent propriétaire
- `scripts/purger-donnees.js`, `scripts/exporter-donnees.js`
- `test/donnees/*.test.js`
