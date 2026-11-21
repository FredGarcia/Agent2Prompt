---
name: hors-ecran
description: Vérifications de ce qui se passe hors de l'écran, critères de verifier propres au skill (requete, une requête de la page, sa méthode, son chemin, son statut, des champs JSON de son corps et de sa réponse, depuis la dernière action ; api, une lecture en GET sur une origine déclarée, avec la session du profil, sans en-tête ajouté ni redirection suivie, statut, texte ou champs JSON, nombre d'éléments ; fichier, un fichier téléchargé par le scénario, texte, lignes, colonne CSV ; aucun en-tête ni cookie relevé, corps en mémoire seulement, jamais ceux d'une étape à la main, secrets masqués dans les rapports ; bornes ; relevé du rapport). À lire pour traduire une phrase qui parle d'une requête, d'une réponse du back ou d'un fichier, ou lire un tel résultat.
dimensions: [D19]
status: active
---

# Module `hors-ecran` (D19)

Phases 7E couvertes : Espace et État.

## 1. Principe

Un testeur ne regarde pas que l'écran. Il ouvre l'onglet réseau pour voir partir la requête d'un formulaire et ce que le back répond ; il interroge l'API dans la barre d'adresse, avec sa session ; il ouvre le fichier qu'il vient de télécharger. Trois critères de `verifier` font de même, sans agir : `requete` observe les requêtes que la page a faites, `api` lit une ressource en GET, `fichier` lit un fichier téléchargé par le scénario (D19.INV-1). Ils ne prennent pas de `cible`, et suivent les règles des autres vérifications : un délai borné, l'attendu et l'obtenu à l'échec, et les vérifications qui suivent jouées après un échec (D5.INV-3).

Ces critères sont propres à ce skill, comme l'action `telecharger` : la remise à Agent2Test (D13, réservée) les traduira.

## 2. Critères

| Critère | Champs | Facultatifs | Réussit quand |
|---|---|---|---|
| `requete` | `chemin` | `methode`, `attendu` : `{ statut, corps, reponse }` | une requête de la page, depuis le début de la dernière action, a ce chemin, cette méthode, ce statut (sinon un statut inférieur à 400), et contient les champs attendus de son corps et de sa réponse |
| `api` | `chemin` | `methode` (`GET` seulement), `attendu` : `{ statut, contient, nombre }` | un GET de cette adresse, avec la session du profil, rend ce statut (sinon un statut 2xx), contient le texte ou les champs attendus, et un tableau de ce nombre d'éléments |
| `fichier` | `fichier`, `attendu` : `{ contient, lignes, csv }` | | le fichier téléchargé sous ce nom contient le texte, a ce nombre de lignes, et une ligne qui a cette valeur dans cette colonne |

```toml
[[etapes]]
ligne = 13
action = "verifier"
critere = "requete"
methode = "POST"
chemin = "/api/clients"
attendu = { statut = 201, corps = { nom = "${nom}", ville = "Lyon" } }

[[etapes]]
ligne = 14
action = "verifier"
critere = "api"
chemin = "/api/clients/${nom}"
attendu = { contient = { ville = "Lyon" } }

[[etapes]]
ligne = 16
action = "telecharger"
cible = { role = "link", nom = "Exporter en CSV" }
nom = "export"

[[etapes]]
ligne = 17
action = "verifier"
critere = "fichier"
fichier = "export"
attendu = { csv = { colonne = "ville", valeur = "Lyon" } }
```

Les textes de `chemin` et de `attendu`, tables et tableaux compris, prennent les variables `${nom}` (module `scenario`, § 3). Une clé inconnue de `attendu`, une méthode hors de `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD` et `OPTIONS`, un statut hors de 100 à 599, une `cible` ou `exact` sont refusés à la validation, avant le navigateur.

## 3. `requete` : les requêtes de la page

- **Chemin** : un chemin qui commence par `/` vaut sur toute origine déclarée par le scénario ; une adresse complète, sur son origine, qui doit être déclarée. `{nom}` y désigne un segment quelconque, `/api/clients/{nom}` ; une étoile finale accepte la suite, `/api/cli*` ; une requête (`?source=formulaire`) n'exige que les paramètres qu'elle cite. Chemin et adresse se comparent décodés.
- **Fenêtre** : seules comptent les requêtes parties depuis le début de la dernière étape qui agit, c'est-à-dire qui n'est ni `verifier`, ni `attendre`, ni `capturer` : après un clic sur « Enregistrer », plusieurs vérifications portent sur les requêtes de ce clic, et sur la navigation qui le suit.
- **Requêtes relevées** : les documents et les appels `xhr` et `fetch` de la page, 500 au plus par jeu ; ni les images, ni les scripts, ni les feuilles de style. Une requête vers une origine non déclarée est interrompue par la garde (D7.INV-1) et ne correspond jamais.
- **Statut** : celui de la réponse reçue ; une réponse reçue puis interrompue, parce que la page a changé d'adresse, garde son statut. Sans `statut` attendu, la requête doit avoir reçu une réponse de statut inférieur à 400.
- **Corps et réponse** : le corps d'une requête se lit en JSON, ou comme un formulaire `a=1&b=2` (valeurs en texte) ; un corps `multipart` ou de plus de 64 Kio n'est pas lu. La réponse se lit si elle est en JSON, jusqu'à 256 Kio, et tant que la page garde son document : après un changement de document, Chromium ne la rend plus, et le relevé dit « réponse interrompue » ; une application monopage (Angular, React, Vue) garde le sien. `attendu.corps` et `attendu.reponse` sont des tables ou des tableaux de champs attendus : chaque champ attendu doit exister avec sa valeur, en profondeur ; chaque élément d'un tableau attendu doit se retrouver dans un élément du tableau obtenu, en tout ordre ; les autres champs ne comptent pas.
- **Échec** : une requête trouvée mais différente donne l'attendu et l'obtenu des seuls champs attendus ; aucune requête donne les dernières requêtes vues depuis la dernière action :

```text
requête POST http://127.0.0.1:4200/api/clients?source=formulaire&jeton=*** : attendu : statut 200 ; obtenu : statut 201
aucune requête /api/inexistant depuis l'étape 3 ; requêtes vues : POST http://127.0.0.1:4200/api/clients?source=formulaire&jeton=*** 201, GET http://127.0.0.1:4200/clients?cree=Echec 200
```

## 4. `api` : une lecture, avec la session du profil

- **GET seulement** : une autre méthode est refusée à la validation ; aucune vérification `api` ne modifie de données, et aucune n'est soumise à `--autoriser-mutations`.
- **Origine déclarée** : le chemin se rapporte à `url_base` ; une adresse complète doit être sur une origine du scénario, à la validation, puis avant l'appel, avec les variables substituées. La requête part du contexte du navigateur, avec ses cookies, donc la session que le développeur a ouverte à la main ; aucun en-tête n'est ajouté, aucun jeton n'est lu. Une API qui attend son jeton dans un en-tête, et non dans un cookie, comme une application Angular qui ajoute `Authorization` par un intercepteur, répond donc 401 : ce que la page reçoit de cette API se vérifie alors par `requete`, sur l'appel que fait la page avec son en-tête.
- **Aucune redirection suivie** : une réponse 3xx fait échouer l'étape, sans joindre l'adresse de redirection, que le message cite, masquée (`redirection vers … non suivie`).
- **Interrogation** : le GET se répète, à 250, 500, 1 000 puis 2 000 ms d'intervalle, jusqu'à l'attendu ou au délai de l'étape. Une réponse de plus de 1 Mio n'est pas lue, et fait échouer l'étape.
- **Attendu** : `statut` (sinon 2xx) ; `contient`, un texte contenu dans le corps, ou une table ou un tableau de champs JSON, comparés comme au § 3 ; `nombre`, la longueur du tableau JSON rendu.

## 5. `fichier` : un fichier téléchargé

- `fichier` est le `nom` d'une étape `telecharger` précédente du scénario, vérifié à la validation ; à l'exécution, le fichier enregistré sous ce nom dans le jeu en cours, dans `telechargements/`.
- Le fichier se lit en UTF-8, BOM retiré, fins de ligne ramenées, jusqu'à 10 Mio.
- `contient` : un texte du fichier. `lignes` : le nombre de ses lignes non vides, en-tête compris. `csv` : `{ colonne = "…", valeur = "…" }`, une ligne de données a cette valeur dans cette colonne ; le séparateur se devine sur la première ligne (`;`, `,` ou tabulation), les guillemets se lisent, et la colonne se cherche dans l'en-tête sans tenir compte de la casse.

## 6. Confidentialité (D19.INV-2)

- **Ni en-tête, ni cookie** : le relevé d'une requête garde sa méthode, son adresse, son statut et, en mémoire, son corps et sa réponse ; jamais un en-tête, ni `Authorization`, ni un cookie. Le type de contenu ne se lit que pour savoir si un corps est en JSON, sans être gardé.
- **En mémoire seulement** : les corps et les réponses ne s'écrivent nulle part ; ils disparaissent avec l'exécution.
- **Étape à la main** : pendant une étape `main`, où le développeur se connecte, aucun corps ni aucune réponse n'est relevé : seuls la méthode, l'adresse et le statut. Une vérification du corps d'une telle requête échoue, en le disant (`corps non relevé pendant une étape à la main`).
- **Secrets masqués** : dans les relevés et les messages d'échec, la valeur d'un paramètre d'adresse ou d'un champ dont le nom évoque un secret (`pass`, `pwd`, `secret`, `token`, `jeton`, `apikey`, `auth`, `session`, `cookie`, `signature`, `credential`, `otp`, `cvv`, `iban`, `card`, `carte`) s'écrit `***`, comme les valeurs d'une colonne CSV de ce nom ; dans le plan et le résumé d'une étape, la valeur attendue d'un tel champ, de même. Le rapport ne cite d'un corps que les champs attendus.

## 7. Relevé dans le rapport

Chaque vérification hors de l'écran a son relevé, le champ `hors_ecran` de son étape (module `preuves`, § 2), à la place d'une capture quand elle réussit ; à l'échec, elle a aussi la capture de la page et son instantané ARIA, comme tout échec (D8.INV-2).

| Critère | `hors_ecran` |
|---|---|
| `requete` | `{ critere, methode, adresse, statut }` de la requête retenue, ou de la dernière requête du chemin à l'échec |
| `api` | `{ critere, methode, adresse, statut, octets }` |
| `fichier` | `{ critere, fichier, lignes, octets }` |

L'adresse est sans ancre, ses secrets masqués. `rapport.md` en fait une ligne : `requête POST http://127.0.0.1:4200/api/clients → 201`, `API GET http://127.0.0.1:4200/api/session → 200, 16 octets`, `fichier telechargements/export.csv, 4 lignes`.

## 8. Contrôle de sortie

- `requete` voit les requêtes de la page depuis la dernière action, leur méthode, leur chemin, leur statut, les champs de leur corps et de leur réponse ; `api` ne fait que des GET, vers une origine déclarée, avec la session du profil, et ne suit aucune redirection ; `fichier` lit le fichier téléchargé (D19.INV-1).
- Aucun en-tête, aucun cookie, aucun jeton de l'adresse, aucun corps d'une étape à la main dans un rapport (D19.INV-2).
- Chaque critère est fermé et borné en taille et en délai ; chaque échec donne l'attendu et l'obtenu (D19.INV-3).

Le code de ces critères est dans le module `actions` (`scripts/moteur.mjs`) pour l'exécution, et dans le module `scenario` (`scripts/scenario.mjs`) pour la validation et les variables.
