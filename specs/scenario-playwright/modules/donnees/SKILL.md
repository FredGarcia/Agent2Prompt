---
name: donnees
description: Préparation et nettoyage des données d'un scénario (marques du texte (par l'API), (nettoyage par l'API), et celles qui nomment un scénario de préparation ou de nettoyage ; sections [[preparation]] et [[nettoyage]] du TOML, hors du jeu d'actions ; appel d'API d'écriture POST, PUT, PATCH ou DELETE vers une origine déclarée, avec la session du navigateur et le jeton anti-CSRF recopié de son cookie, sans redirection suivie ni appel rejoué, corps JSON ou fichier .json, statut attendu, valeurs gardées de la réponse ; variable ${unique} ; scénario de préparation ratifié joué dans le même onglet ; préparation à sa place parmi les « Étant donné », nettoyage après les étapes, même après un échec ; garde des mutations ; rapport). À lire pour traduire une ligne de préparation ou de nettoyage, ou lire un tel résultat.
dimensions: [D20]
status: active
---

# Module `donnees` (D20)

Phases 7E couvertes : Éléments et État.

## 1. Principe

Avant de dérouler son scénario, un testeur prépare ce dont il a besoin : un client à modifier, une commande à valider. Il le crée par l'API, avec la session qu'il a ouverte, ou par l'écran, en suivant un autre parcours. À la fin, il nettoie derrière lui. Le skill fait de même : une ligne du texte marquée le dit, et son entrée du scénario TOML le fait, hors du jeu fermé de treize actions, qui reste commun avec le navigateur d'Agent2Test (D20.INV-1).

La préparation n'ajoute aucun identifiant : un appel part avec la session que le développeur a ouverte à la main dans le profil, et le jeton anti-CSRF que l'application a déposé dans un cookie, recopié comme le fait Angular (D20.INV-2). Une API qui attend un jeton dans l'en-tête `Authorization` répond donc 401 : la préparation passe alors par l'écran, par un scénario de préparation (§ 6).

## 2. Dans le texte

| Marque | Sens | Dans la traduction |
|---|---|---|
| `(par l'API)` | la ligne prépare des données par un appel d'API | une entrée `[[preparation]]` ou plus : des appels |
| `(nettoyage par l'API)` | la ligne nettoie des données par un appel d'API | une entrée `[[nettoyage]]` ou plus : des appels |
| `(préparation : nom)` | la ligne prépare des données par le scénario `nom.toml` | une seule entrée `[[preparation]]`, `scenario = "nom.toml"` |
| `(nettoyage : nom)` | la ligne nettoie des données par le scénario `nom.toml` | une seule entrée `[[nettoyage]]`, `scenario = "nom.toml"` |

Les marques se reconnaissent sans accents ni casse, l'apostrophe droite ou courbe ; `nom` est un chemin relatif au dossier du texte, sans extension, sans `..` ni espace (module `texte`, § 5). Une ligne de préparation précède toute étape qui n'est ni à la main ni de préparation ; une ligne de nettoyage suit toutes les autres ; il reste au moins une étape hors de la préparation et du nettoyage. Chaque erreur donne sa ligne.

```text
Scénario: Modifier la ville d'un client
  Adresse : http://127.0.0.1:4200
  Origines : http://127.0.0.1:4200, http://127.0.0.1:8080
  Étant donné que je me connecte (à la main)
  Et que le client « Client <unique> » existe (par l'API)
  Quand j'ouvre sa fiche
  Et je choisis la ville « Lyon » (modification)
  Alors la fiche affiche « Lyon »
  Et le client est supprimé (nettoyage par l'API)
```

`<unique>` vaut, à chaque jeu de chaque exécution, un suffixe propre : un scénario rejoué ne heurte pas les données de la fois précédente (§ 3.3).

## 3. Dans le scénario TOML

### 3.1 Appel d'API

| Champ | Requis | Rôle |
|---|---|---|
| `ligne` | dans un scénario traduit | ligne de la marque, dans le texte |
| `methode` | oui | `POST`, `PUT`, `PATCH` ou `DELETE` ; la mutation s'en déduit (§ 8) ; une lecture se vérifie par `verifier`, critère `api` |
| `chemin` | oui | chemin qui commence par `/`, sur l'origine de `url_base`, ou adresse d'une origine déclarée |
| `corps` | non | table ou tableau, envoyé en JSON |
| `corps_fichier` | non | fichier `.json` du dossier du scénario, sans `..`, lu et envoyé ; ses textes reçoivent les variables ; `corps` ou `corps_fichier`, pas les deux |
| `statut` | non | code attendu, ou liste de codes : `[204, 404]` pour un nettoyage qui tolère l'absence ; sinon un statut 2xx |
| `garder` | non, préparation seulement | `{ variable = "chemin" }` : une valeur simple de la réponse JSON devient une variable ; `id`, `client.id`, `lignes.0.id`, ou `.` pour la réponse entière |
| `delai` | non | délai de l'appel, de 1 à 30 s ; sinon celui du scénario |

```toml
[[preparation]]
ligne = 5
methode = "POST"
chemin = "http://127.0.0.1:8080/api/clients"
corps = { nom = "Client ${unique}", ville = "Paris" }
statut = 201
garder = { id_client = "id" }

[[nettoyage]]
ligne = 9
methode = "DELETE"
chemin = "http://127.0.0.1:8080/api/clients/${id_client}"
statut = [204, 404]
```

### 3.2 Scénario de préparation

| Champ | Requis | Rôle |
|---|---|---|
| `ligne` | dans un scénario traduit | ligne de la marque, dans le texte |
| `scenario` | oui | `nom.toml`, chemin relatif au dossier du scénario, sans `..` |
| `parametres` | non | valeurs des paramètres de ce scénario, des valeurs simples où les variables s'écrivent : `{ nom = "Client ${unique}" }` |

### 3.3 Variables

- `${unique}`, `<unique>` dans le texte, est une variable intégrée : sept caractères, minuscules et chiffres, propres à chaque jeu de chaque exécution, les six premiers communs aux jeux d'une même exécution. Elle s'emploie partout sans être déclarée, et se remplace aussi dans les valeurs de `[parametres]`, des jeux et de `--param` ; `unique` ne se déclare pas, ne se garde pas et ne se passe pas par `--param` (D20.INV-6).
- Une variable gardée par `garder` s'emploie à partir de sa préparation : dans les préparations suivantes, dans les étapes qui ne sont pas à la main, une étape à la main pouvant précéder la préparation, et dans le nettoyage. Son nom n'est ni un paramètre, ni une colonne des jeux, ni gardé deux fois. Sa valeur n'est connue qu'à l'exécution : jusque-là, les textes substitués la gardent en attente, et `verifier.mjs --plan` l'écrit `${nom}`.

### 3.4 Validation

`verifier.mjs` et `jouer.mjs` valident les entrées avant le navigateur, comme les étapes (D3.INV-1) : champs connus de leur forme, méthode d'écriture, chemin et origine déclarée, corps, statut, `garder` en préparation seulement, variables déclarées ou gardées avant, fichier de corps présent et JSON valide. Chaque erreur cite l'entrée, sa ligne du TOML et sa ligne du texte : `préparation 1 (ligne 22 du TOML, ligne 5 du texte) : methode vaut POST, PUT, PATCH, DELETE`. Le squelette écrit `methode = "à compléter"` : tant qu'un appel le garde, le scénario est refusé (D3.INV-5).

## 4. Contrôle de la traduction (D20.INV-1)

À chaque lecture d'un scénario traduit, en plus du contrôle du module `scenario`, § 4.3 :

| Contrôle | Refus |
|---|---|
| chaque entrée a une `ligne`, marquée de son genre | entrée sans ligne, ou sur une ligne qui n'est pas de préparation (de nettoyage) |
| une ligne « par l'API » reçoit des appels, une ligne qui nomme un scénario reçoit ce scénario | un scénario sur une ligne « par l'API », un appel sur une ligne qui nomme un scénario, un autre scénario que celui nommé |
| chaque ligne marquée a ses entrées ; une ligne qui nomme un scénario en a une seule | ligne non traduite |
| les entrées de chaque section suivent l'ordre du texte | une entrée avant celle d'une ligne précédente |
| chaque variable `<nom>` d'une ligne se retrouve en `${nom}` dans une de ses entrées | variable perdue |
| aucune étape `[[etapes]]` sur une ligne de préparation ou de nettoyage | étape sur une telle ligne |

## 5. Appel d'API (D20.INV-2)

Un appel part de la session du navigateur, comme une requête de la page, par `page.context().request` :

- vers une origine déclarée seulement ;
- avec les cookies du profil, donc la session ouverte à la main ;
- avec le jeton anti-CSRF recopié de son cookie dans son en-tête, en mémoire, comme le font Angular, Spring Security, Laravel et Django : `XSRF-TOKEN` dans `X-XSRF-TOKEN`, sinon `csrftoken` dans `X-CSRFToken` ; ce jeton n'est pas un identifiant, il ne vaut qu'avec la session, et ne s'écrit nulle part ;
- sans autre en-tête que `Accept` et, pour un corps, `Content-Type: application/json` ; aucun identifiant n'est lu ; une API qui n'accepte pas de corps JSON répond 415, et se prépare par un scénario (§ 6) ;
- une seule fois, sans rien rejouer après un échec ou un délai dépassé (D5.INV-3) ;
- sans suivre de redirection : une réponse 3xx fait échouer l'entrée, l'adresse de la redirection masquée ;
- l'adresse et le résumé de l'entrée masqués : la valeur d'un paramètre de requête au nom de secret s'écrit `***` (`?jeton=***`), dans la sortie comme dans le rapport ; une valeur gardée au nom de secret, de quatre caractères au moins, s'y écrit aussi `***` partout où elle reparaît, réemployée par une étape ou un appel.

L'appel réussit quand le statut est l'attendu, sinon 2xx. Avec `garder`, la réponse se lit, 1 Mio au plus, en JSON, et chaque valeur doit être présente et simple : texte, nombre ou booléen ; sinon l'entrée échoue, et rien n'est gardé. Le corps et la réponse restent en mémoire. Les messages d'échec donnent l'attendu et l'obtenu, avec la conduite à tenir pour 401 et 403 :

```text
POST http://127.0.0.1:8080/api/clients : attendu : statut 201 ; obtenu : statut 401 (l'API ne reconnaît pas la session du navigateur : se connecter à la main avant la préparation, ou, pour une API à jeton, préparer par un scénario (module donnees))
POST http://127.0.0.1:8080/api/clients : attendu : un statut 2xx ; obtenu : statut 403 (accès refusé : droits de l'utilisateur, ou jeton anti-CSRF absent ou refusé)
POST http://127.0.0.1:8080/api/clients : valeur « id » absente de la réponse : id_client non gardée
POST http://127.0.0.1:8080/api/clients : « client » n'est pas une valeur simple de la réponse : id_client non gardée
POST http://127.0.0.1:8080/api/clients : réponse non JSON : aucune valeur gardée
POST http://127.0.0.1:8080/api/exports : réponse de plus de 1048576 octets, non lue : aucune valeur gardée
```

## 6. Préparation par l'écran (D20.INV-5)

Un scénario de préparation est un scénario ratifié du même dossier, que le testeur suit par l'écran. À la lecture du scénario qui le nomme, il est lu et contrôlé comme tout scénario, traduction comprise, et refusé s'il :

- est introuvable, hors du dossier, ou le scénario lui-même ;
- a des jeux de valeurs : il reçoit les siennes par `parametres`, chacune un de ses paramètres ;
- a sa propre préparation ou son nettoyage ;
- déclare une origine que le scénario qui le nomme ne déclare pas ;
- a un autre profil : un même onglet, un même profil.

Il se joue une fois, dans l'onglet du jeu, avec le `${unique}` du jeu, ses adresses relatives à son propre `url_base`. Ses étapes suivent les règles des étapes : attentes, preuves, garde des mutations, vérifications qui se poursuivent ; ses captures sont préfixées par son entrée (`captures/p1-04-verifier.png`). L'entrée échoue avec sa première étape en échec : `scénario creer-client.toml, étape 4 : attendu : …`.

## 7. Déroulé d'un jeu (D20.INV-4)

1. Chaque entrée de préparation se joue à sa place : avant la première étape d'une ligne plus grande du texte ; sans texte, avant la première étape qui n'est pas à la main, ou à sa place si les entrées et les étapes portent leurs lignes. Une préparation se joue ainsi après une connexion à la main qui la précède.
2. Une préparation en échec arrête le jeu : les préparations et les étapes suivantes sont non jouées, avec le motif `la préparation 1 a échoué`.
3. Le nettoyage se joue après les étapes, réussies ou non : chaque entrée une fois, dans l'ordre, la suivante jouée après l'échec de l'une. Une entrée dont une variable gardée n'a pas été obtenue n'est pas jouée : `non jouée : ${id_client} non obtenue, sa préparation n'a pas abouti`.
4. Un nettoyage en échec ne change ni le statut du jeu ni le code de sortie ; il est signalé dans la sortie (`AVERTISSEMENT nettoyage 1 en échec : … ; des données de l'exécution peuvent rester`) et dans le rapport.
5. Une exécution interrompue, par Ctrl+C ou un poste éteint, ne joue pas son nettoyage : ses données restent, et `${unique}` évite qu'elles gênent l'exécution suivante.

Un nettoyage qui vise une donnée fixe, sans valeur gardée ni `${unique}`, ni variable dont chaque valeur contient `${unique}`, peut supprimer une donnée qui existait avant l'exécution : `verifier.mjs` le note, et la note s'examine avant la ratification (D10.INV-7). Un nom d'exemple qui porte `<unique>` (`| Dupuis <unique> |`) rend propre à l'exécution la donnée créée par l'écran, que le nettoyage vise ensuite par ce nom.

## 8. Garde (D20.INV-3)

- Chaque appel est une mutation que sa méthode détermine : `POST` création, `PUT` et `PATCH` modification, `DELETE` suppression. Un scénario de préparation compte par ses étapes de mutation.
- Un scénario qui en a et déclare une origine hors du poste (module `garde`, § 2) n'est joué qu'avec `--autoriser-mutations`, que l'agent demande à chaque exécution ; sans l'option, `jouer.mjs` le refuse avant le navigateur, en citant les étapes et les entrées en cause : `le scénario modifie des données (préparation 1, nettoyage 1) et déclare des origines hors du poste`.
- À l'exécution, un appel vers une origine hors du poste n'est pas fait sans l'autorisation, quel que soit l'appelant du moteur (E3) : `appel POST sur http://…, hors du poste, sans --autoriser-mutations : aucun appel fait`.
- `verifier.mjs` liste ce qui modifie des données : `modifient des données : étape 4, préparation 1, nettoyage 1`.

## 9. Rapport

Chaque jeu du rapport (module `preuves`, § 2) porte, en plus de ses étapes :

| Champ | Contenu |
|---|---|
| `preparation`, `nettoyage` | les entrées jouées, dans l'ordre |
| `gardees` | `{ nom: valeur }` des valeurs gardées, masquées par leur nom (`***` pour un nom de secret) |
| `nettoyage_en_echec` | nombre d'entrées de nettoyage en échec |

Champs de chaque entrée : `numero`, `ligne`, `genre` (`preparation`, `nettoyage`), `type` (`api`, `scenario`), `resume` (masqué comme l'adresse), `mutation`, `statut`, `duree_ms`, `message`, `appel` (`{ methode, adresse, statut, octets }`, l'adresse masquée), `gardees` (les noms), `scenario`, `etapes` (celles d'un scénario de préparation, au format des étapes), `capture`, `aria` (preuves d'un appel en échec). Le bilan ajoute `preparations`, `nettoyages` et `nettoyages_en_echec`. `rapport.md` a ses sections Préparation et Nettoyage, et les valeurs gardées ; la sortie de `jouer.mjs` une ligne par entrée (`ok  p1. préparation : POST … → 201`), les étapes d'un scénario de préparation en retrait.

## 10. Contrôle de sortie

- Les marques se lisent, leur place se contrôle ; le squelette écrit un bloc par ligne marquée, refusé tant qu'un appel reste à compléter ; chaque écart du § 4 est refusé (module `recette`, R30, D20.INV-1).
- Les entrées se valident avant le navigateur ; `${unique}` et les variables gardées se résolvent comme au § 3.3 (R30, D20.INV-6).
- Un appel part avec la session et le jeton anti-CSRF recopié, `XSRF-TOKEN` comme `csrftoken`, sans en-tête `Authorization`, un corps en JSON annoncé comme tel, une fois, sans suivre de redirection ; une valeur ne se garde que d'une réponse JSON d'au plus 1 Mio, présente et simple ; ni le jeton, ni une valeur gardée secrète, même réemployée par une étape ou un appel, ni un paramètre de requête secret n'entrent dans le rapport ni dans la sortie (R32, D20.INV-2).
- Le nettoyage se joue après un échec, une fois par entrée ; une préparation en échec arrête le jeu ; un nettoyage en échec ne change pas le statut (R33, D20.INV-4).
- Hors du poste, refus sans autorisation, avant le navigateur et à l'appel ; un scénario de préparation se joue dans le même onglet, ses étapes au rapport (R30, R34, D20.INV-3, D20.INV-5).
- Les classes de corps de l'index et les propositions d'écriture du squelette se vérifient au module `code` (R31).

Le code de la préparation est dans `scripts/scenario.mjs` (validation, contrôle, jeux préparés ; module `scenario`) et `scripts/moteur.mjs` (appels, scénarios de préparation, déroulé ; module `actions`).
