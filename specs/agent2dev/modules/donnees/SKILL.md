---
name: donnees
description: Stockage d'Agent2Dev (port de stockage du noyau, un dossier JSON par agent propriétaire, bascule sans perte vers un fichier SQLite par agent au-delà du seuil fixé par l'humain, collections en ajout seul protégées jusque dans SQLite, accès d'un agent aux données d'un autre par le bus seulement, purge par commande humaine, copie de travail comprise). À implémenter au lot 2.
dimensions: [D2]
status: active
---

# Module `donnees` (D2)

Agent2Dev garde ses données hors du projet de l'application et hors de son propre dépôt, dans le dossier de données de la configuration humaine (`~/.agent2dev/donnees/` par défaut). Le module fournit le port de stockage du noyau ; chaque agent l'ouvre pour lui-même.

## 1. Port de stockage (D2.INV-1)

```js
const s = stockage.ouvrir(contexte);       // l'agent propriétaire est l'appelant du contexte
await s.lire(collection, id);              // un document, ou null
await s.ecrire(collection, id, document);  // crée ou remplace un document (collections modifiables)
await s.ajouter(collection, enregistrement); // ajoute en fin (collections en ajout seul)
await s.lister(collection, filtre);        // documents filtrés par champs égaux
await s.compter(collection);
```

- Un agent n'ouvre que son propre stockage. Ouvrir celui d'un autre est refusé avec l'erreur `DONNEES_D_UN_AUTRE_AGENT` ; un agent lit les données d'un autre par une action déclarée de cet agent, sur le bus.
- Chaque collection est déclarée par son agent, avec sa nature : `modifiable` ou `ajout-seul`. Le journal du module `journal`, le grand livre du `referentiel` et les décisions de l'`orchestrateur` sont `ajout-seul`.

| Agent | Collections principales |
|---|---|
| `orchestrateur` | demandes, points, décisions (ajout seul), budgets consommés |
| `profil` | profils proposés, profils ratifiés |
| `depot` | écritures appliquées, états git relevés, commits, copies de travail et patchs remis |
| `executant` | exécutions (commande, code de retour, durée, sortie bornée et masquée), lignes de base |
| `methode` | transmission vérifiée, empreintes, scripts extraits, fiches composées |
| `journal` | lignes chaînées (ajout seul) |
| `observateur` | séries de mesures, alertes |
| `apprenant` | leçons, expositions |
| `reflexif` | mesures d'effet, propositions |
| `referentiel` | versions de fiches et de règles, épinglages, grand livre (ajout seul) |

## 2. JSON, puis SQLite (D2.INV-2)

- Par défaut, un agent écrit dans `donnees/<agent>/` : un fichier `<collection>.json` par collection modifiable, un fichier `<collection>.jsonl` par collection en ajout seul, une ligne par enregistrement.
- Quand la taille totale des fichiers d'un agent dépasse le seuil de la configuration humaine (`stockage.seuilKo`, 250 par défaut), le port bascule cet agent dans `donnees/<agent>.sqlite`, par le module intégré `node:sqlite` :
  1. il crée une table par collection et y recopie chaque enregistrement ;
  2. il vérifie, collection par collection, le nombre d'enregistrements et l'empreinte SHA-256 du JSON canonique de chacun ; pour le journal, il vérifie la chaîne (module `journal`) ;
  3. il ne bascule qu'après ces vérifications, publie `donnees.bascule` avec les comptes, et range les fichiers JSON dans `donnees/<agent>.json-archive/`, en lecture seule.
- Une vérification en échec annule la bascule : l'agent reste en JSON et l'alerte `donnees.bascule_echouee` part au tableau de bord.
- Le seuil est fixé par l'humain ; aucun agent ne le change.

## 3. Ajout seul (D2.INV-3)

- Une collection `ajout-seul` n'expose ni `ecrire` ni suppression. En JSON, le port ouvre le fichier en ajout ; en SQLite, chaque table en ajout seul porte deux déclencheurs qui refusent `UPDATE` et `DELETE` :

```sql
CREATE TRIGGER journal_sans_modification BEFORE UPDATE ON journal BEGIN SELECT RAISE(ABORT, 'ajout seul'); END;
CREATE TRIGGER journal_sans_suppression BEFORE DELETE ON journal BEGIN SELECT RAISE(ABORT, 'ajout seul'); END;
```

- Une altération faite hors du port, à la main, se détecte par la chaîne d'empreintes (module `journal`, module `referentiel`).
- La purge est une commande humaine, hors du bus : `npm run donnees:purger -- --demande ECR-77` retire les données de travail, la copie de travail et la sortie d'une demande close. Elle ne touche jamais au journal, au grand livre, ni à l'arbre de la demande, et s'inscrit au journal (`donnees.purge`). Une demande dont des patchs n'ont pas été appliqués est purgée seulement si la commande porte `--patchs-non-appliques`.

## 4. Pièges connus

- **Lecture croisée par le fichier** : un agent qui ouvre le fichier d'un autre contourne son contrat ; le port le refuse, et le test des sources le détecte.
- **Bascule par moitié** : la recopie se fait d'un tenant, dans une transaction SQLite ; un arrêt en cours de route laisse l'agent en JSON.
- **`node:sqlite` sous drapeau** : avant Node 22.13, le module demande `--experimental-sqlite` ; Agent2Dev exige Node 22.13 au minimum (module `exploitation`).

## 5. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| DO1 | D2.INV-1 | l'`apprenant` qui ouvre le stockage de l'`orchestrateur` est refusé `DONNEES_D_UN_AUTRE_AGENT` |
| DO2 | D2.INV-1 | aucun fichier de `src/agents/<a>/` n'ouvre un chemin sous `donnees/<b>/` (analyse des sources) |
| DO3 | D2.INV-2 | au-delà de 250 Ko, les données d'un agent passent en SQLite ; comptes et empreintes égaux, chaîne du journal intacte, `donnees.bascule` publié |
| DO4 | D2.INV-2 | une empreinte qui diffère pendant la bascule l'annule ; l'agent reste en JSON et l'alerte part |
| DO5 | D2.INV-3 | sur une collection en ajout seul, `ecrire` n'existe pas ; en SQLite, un `UPDATE` et un `DELETE` lèvent « ajout seul » |
| DO6 | D2.INV-3 | la purge d'une demande close retire sa sortie, sa copie de travail et ses données de travail, garde le journal et le grand livre, et s'inscrit au journal |
| DO7 | D2.INV-3 | la purge d'une demande dont un patch n'est pas appliqué est refusée sans `--patchs-non-appliques` |

## 6. Fichiers à produire

- `src/noyau/stockage/port.js`, `src/noyau/stockage/json.js`, `src/noyau/stockage/sqlite.js`, `src/noyau/stockage/bascule.js`
- `scripts/purger-donnees.js`
- `test/donnees/*.test.js`
