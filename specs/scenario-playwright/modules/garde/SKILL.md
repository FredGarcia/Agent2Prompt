---
name: garde
description: Garde du skill (origines déclarées seules permises, requêtes et WebSocket vers une autre origine interrompus avant chargement et comptés, navigation vers elle en échec, origine légitime ajoutée au texte puis retraduite ; mutations hors du poste, soit hors de 127.0.0.1, localhost et [::1], refusées sans --autoriser-mutations avant le navigateur et à l'étape ; aucun identifiant ; trace seulement sur demande, résultats sur le poste ; ce que la garde ne couvre pas). Le code est dans scripts/session.mjs, scripts/moteur.mjs et scripts/jouer.mjs. À lire avant de jouer un scénario sur une application réelle.
dimensions: [D7]
status: active
---

# Module `garde` (D7)

Phases 7E couvertes : Espace et Environnement.

Le skill agit dans un vrai navigateur, au nom du développeur. La garde borne ce qu'une exécution peut toucher : où partent les requêtes, ce qui peut être modifié, ce qui sort du poste.

## 1. Origines (D7.INV-1)

Le scénario déclare ses origines : `origines`, sinon celle de `url_base`. Une origine est un schéma, un hôte et un port : `http://127.0.0.1:4200`, `https://recette.exemple.fr`. Pendant l'exécution :

- toute requête vers une origine non déclarée est interrompue avant chargement, et comptée par origine dans le rapport (`origines_bloquees`) et en fin de sortie ;
- un WebSocket suit la même règle : `ws` se compare à `http`, `wss` à `https`, sur le même hôte et le même port ; un WebSocket permis est relayé tel quel, un autre est fermé ;
- une navigation de la page vers une origine non déclarée fait échouer l'étape, et la page ne la charge pas ;
- les adresses `data:`, `blob:` et `about:` restent dans la page ;
- `naviguer` n'accepte qu'un chemin, ou une adresse d'une origine déclarée : le reste est refusé avant le navigateur.

La fenêtre de Jira qu'ouvre l'import par l'adresse (module `jira`, § 2) ne joue aucun scénario : elle n'est pas gardée, et le skill n'y fait que naviguer vers l'adresse donnée (D16.INV-1).

Une origine bloquée qui manque à l'application, une API, un fournisseur d'identité, un CDN de polices, s'ajoute au texte de départ par le développeur (`Origines :`). La traduction est alors périmée par l'empreinte : elle se refait, et se ratifie (D3.INV-2). La règle est celle du navigateur d'Agent2Test (`agent2test:D4.INV-2`).

## 2. Mutations hors du poste (D7.INV-2)

Sont sur le poste les origines d'hôte `127.0.0.1`, `localhost` et `[::1]` ; toute autre est hors du poste, y compris une autre adresse en `127.x.x.x` et un serveur de recette. Une étape de mutation (module `actions`, § 5) y modifie des données qui ne sont pas celles du développeur seul. Donc :

- un scénario qui a une étape de mutation et déclare une origine hors du poste n'est joué qu'avec `--autoriser-mutations` ; sans cette option, `jouer.mjs` le refuse avec le code 2, avant d'ouvrir le navigateur, et cite les étapes et les origines en cause ;
- à l'étape, une mutation sur une page hors du poste échoue sans agir quand l'autorisation manque : la garde tient aussi pour un autre appelant du moteur (E3) ;
- l'autorisation vaut pour une exécution : l'agent la demande au développeur à chaque fois, et ne la donne jamais lui-même (D10.INV-2) ;
- `verifier.mjs` signale ces scénarios avant toute exécution.

Une origine du poste qui relaie une API distante, comme un serveur de développement avec proxy, se déclare aussi : l'origine distante, déclarée, déclenche la garde.

## 3. Aucun identifiant

Le skill ne demande, ne lit, ne stocke ni ne saisit aucun identifiant (D6.INV-2). Aucun scénario n'en contient : le texte et le TOML n'ont aucun moyen de lire une variable d'environnement ou un secret, et une connexion se fait à la main, dans la fenêtre (module `session`, § 4).

## 4. Trace et résultats (D7.INV-3)

- La trace de Playwright (`trace.zip`) n'est enregistrée qu'avec `--trace` : elle contient les cookies, les en-têtes et le contenu des pages. Le rapport le rappelle ; elle reste sur le poste et ne se partage pas.
- Captures, instantanés, téléchargements et rapports restent dans le dossier de résultats, sur le poste, écarté de Git (D1.INV-2). Le skill n'envoie rien nulle part.

## 5. Ce que la garde ne couvre pas

- Une étape qui modifie des données sans `mutation` n'est pas gardée : les marques du texte et leur relecture à la ratification en sont la défense. La traduction ajoute `mutation` à une phrase qui modifie manifestement des données, et le signale.
- Sur le poste, les mutations ne demandent aucune autorisation : la base de développement du développeur est à lui.
- Le JavaScript de l'application s'exécute normalement, avec ses propres requêtes, toutes soumises à la garde des origines.
- Captures et rapports montrent ce que la page affiche : des données personnelles d'une base de recette y figurent ; ils se traitent comme ces données.

## 6. Contrôle de sortie

- Une ressource, un WebSocket et une navigation vers une origine non déclarée sont interrompus et comptés ; une origine déclarée passe (module `recette`, R7).
- Un scénario qui modifie des données hors du poste est refusé sans `--autoriser-mutations`, sans rien écrire ; il se joue avec ; la garde à l'étape refuse sans agir (R8).
- `--sans-tete` est refusé avec une étape à la main (R9) ; la trace n'existe qu'avec `--trace`, avec son avertissement (R17).
