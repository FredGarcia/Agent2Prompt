---
name: referentiel
description: Dimension D10, le référentiel des méso-contrats du projet. Catégories de tickets avec leur empreinte technique par couche, composées par ticket (un principal et des compléments), options au choix (évolution de schéma et contrat CRUD pour PostgreSQL, règles, fonctionnalités, endpoints, variantes de représentation et événements temps réel pour Java, éléments graphiques et fonctionnalités pour Angular, analyse d'une image PNG de l'objectif pour toute option front), méso-contrats transverses, modèle générique de la demande dont part la qualification de chaque ticket (D11), et instance de chaque ticket dans ticket.toml. À lire à l'installation, à l'ouverture et à l'analyse de chaque ticket.
dimensions: [D10]
status: active
---

# Module `referentiel` (D10)

Statut : `active`, depuis la version 3.2.0. Modèle du référentiel en 3.1.0 depuis la version 3.3.0 du skill : modèle générique de la demande ajouté. Modèle en 3.2.0 depuis la version 3.4.0 : catégorie M04, variante de représentation d'une ressource, avec l'option `representations` et ses paramètres au choix par ticket, et l'option `evenements`, le temps réel par WebSocket STOMP (socle, SC7). Modèle en 3.3.0 depuis la version 3.5.0 : composition, un méso-contrat principal et des compléments par ticket.

## 1. Rôle

Deux fichiers du projet encadrent un ticket :

- le **fichier d'invariants**, `docs/c7e/meso-contrats.md` (D8), dit les règles que tout contrat respecte ;
- le **référentiel des méso-contrats**, `docs/c7e/referentiel-meso-contrats.toml` (D10), dit quels contrats un ticket engage : sa catégorie principale et, au besoin, ses compléments, les couches qu'ils touchent et les options choisies sur chaque couche.

Un méso-contrat est une catégorie de tickets, définie par son empreinte technique : pour chaque couche (persistance, backend, frontend), un impact `requis`, `optionnel` ou `aucun`, et les options permises. Le ticket choisit ses options parmi celles-ci ; chaque option engage un slot et des preuves. Un ticket engage un **méso-contrat principal**, celui qui porte le plus de sa demande, et, si le principal ne la porte pas toute, des **compléments** pour le reste : chaque option se rattache au méso-contrat qui la permet, et une couche à l'impact `aucun` dans l'un peut être couverte par un autre (module `qualification`, § 2). Les méso-contrats transverses (socle back-front, accessibilité, migration sûre) ne se choisissent pas : ils s'appliquent d'office aux couches touchées.

Le référentiel porte aussi le **modèle générique de la demande** (section 0) : une combinaison de possibilités de modification de l'application, couche par couche, chacune avec son option et ses repères, établies à l'analyse de l'application, et la règle de choix du méso-contrat. La qualification de chaque ticket, à son ouverture, part de ce modèle (module `qualification`, D11).

## 2. Emplacements

| Fichier | Rôle | Qui l'écrit | Emplacement |
|---|---|---|---|
| référentiel du projet | modèle générique de la demande, catégories, options, transverses, règles de validation | le développeur, à partir du modèle du § 6 ; jamais l'IA (D10.INV-5) | `docs/c7e/referentiel-meso-contrats.toml` |
| instance du ticket | demande remplie, composition confirmée (principal et compléments), options choisies et leur rattachement, version du référentiel | l'IA propose ; le développeur confirme la composition à la qualification (D11.INV-3), puis valide les options avec la fiche (D10.INV-1) | `docs/demandes/<CLÉ>/ticket.toml` |
| analyse d'image | extractions, correspondances, questions, écarts | l'IA ; validée avec la fiche (D10.INV-4) | `docs/demandes/<CLÉ>/analyse-image.md` |
| images de l'objectif | maquettes ou captures au format PNG | le développeur ou le PO | `docs/demandes/<CLÉ>/maquettes/` |

Les images sont versionnées avec la demande : les commandes de Gemini CLI n'injectent pas un fichier exclu de Git.

## 3. À l'analyse de chaque ticket (d=0)

Ces étapes prennent place dans l'analyse du § 3 du point d'entrée, après la cartographie d'impact et avant la fiche. Le ticket a déjà été qualifié à son ouverture : sa composition est confirmée, et `ticket.toml` porte la demande remplie et la version du référentiel (module `qualification`).

1. Partir de la composition confirmée. Si la cartographie d'impact montre que la demande sort de ses empreintes, revenir à la qualification : compléter la demande, proposer une autre composition et la faire confirmer, sans en changer de soi-même ni écrire de catégorie nouvelle (D11.INV-4, D10.INV-5).
2. Prendre pour point de départ les options que signale la demande remplie.
3. Choisir les options, couche par couche, parmi les options permises des méso-contrats de la composition, et rattacher chacune au méso-contrat qui la permet : le principal par défaut, sinon le complément retenu pour sa possibilité, nommé par la clé `meso_contrat` de l'option (D10.INV-2) :
   - persistance : évolution de schéma (tables, colonnes, index, contraintes) ; contrat CRUD, avec ses opérations et, si `delete` est retenu, le mode de suppression ;
   - backend : endpoints, règles métier, fonctionnalités ; variantes de représentation, avec le repérage depuis l'URI et une valeur pour chaque paramètre (mécanisme de sélection, exposition de la variante sans champ) ; la réponse actuelle reste inchangée sans sélection, et le remplacement d'une réponse publiée se refuse (D10.INV-6) ; événements temps réel, avec leur canal, leurs types, leur instantané et le courtier que nomme le fichier d'invariants du projet (socle, SC7) ;
   - frontend : éléments graphiques, fonctionnalités ; pour chacun, s'il y a lieu, l'image de l'objectif (`image_objectif`) et les extractions demandées (`analyse_image`).
4. Analyser les images demandées dans `analyse-image.md` (D10.INV-4) :
   - les extractions demandées : structure, composants, textes, états, couleurs, accessibilité ;
   - la correspondance de chaque élément de l'image avec une option du ticket ;
   - les éléments sans option correspondante, posés en questions au développeur ;
   - les écarts avec l'écran actuel, si sa capture est fournie (`image_actuelle`) ;
   - les tailles et les couleurs, données comme estimations à confirmer avec le système de design ; ce qu'une image ne montre pas (focus, annonces aux technologies d'assistance, comportement) reste à prouver par les tests.
5. Ajouter aux tests déduits les preuves de chaque option retenue et les exigences des méso-contrats transverses des couches touchées (D10.INV-2, D10.INV-3). Chaque preuve garde son lien à un critère ou à un risque (D5.INV-1).
6. Compléter `ticket.toml` des options choisies, et le présenter avec la fiche et l'analyse : un point de validation, avant toute modification (D3.INV-1).

## 4. Des options aux slots

| Couche | Option | Slot | Étiquette des commits |
|---|---|---|---|
| persistance | `schema`, `crud` | É1 | `[É1-DB]` |
| backend | `endpoints`, `representations`, `evenements` | É3 | `[É3-API]` |
| backend | `regles`, `fonctionnalites` | É4 | `[É4-SVC]` |
| frontend | `fonctionnalites` | É2, puis É5 | `[É2-UI]`, `[É5-UI]` |
| frontend | `elements_graphiques` | É5 | `[É5-UI]` |
| frontend | `analyse_image` | analyse (d=0), preuve en É6 | aucun commit propre |

## 5. Au démarrage

Le référentiel ne sert que si le développeur a choisi l'orchestrateur (D2.INV-3, § 11.4 du point d'entrée). Il se lit à l'ouverture et à l'analyse de chaque ticket, pas au démarrage : dans un chargement permanent, seul le fichier d'invariants accompagne le point d'entrée.

## 6. Modèle du référentiel

À l'installation (§ 11.3 du point d'entrée), le bloc annoté ci-dessous s'écrit à l'identique dans le projet, depuis sa racine ; le fichier est le contenu du bloc, terminé par un saut de ligne. Son empreinte se vérifie ensuite :

| Fichier | Empreinte sha256 |
|---|---|
| `docs/c7e/referentiel-meso-contrats.toml` | `a19de2f11e341f86b942ed69cba668c47b1aa121f4f6986f0c5f8bdb84c8855e` |

Commande d'extraction et de vérification, depuis la racine du projet (Node 20 ou plus récent, sans dépendance). Elle suppose le skill dans `.skills/orchestrateur-c7e/` ; pour un autre emplacement, comme `.gemini/skills/orchestrateur-c7e/` en chargement au choix, remplacer ce chemin :

```bash
node -e "const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'); const texte = fs.readFileSync('.skills/orchestrateur-c7e/modules/referentiel/SKILL.md', 'utf8').replace(/\r\n/g, '\n'); const m = /^<\x21-- fichier : (\S+) -->\n\x60{3}[a-z]*\n([\s\S]*?)\n\x60{3}\n/m.exec(texte); const contenu = m[2] + '\n'; fs.mkdirSync(path.dirname(m[1]), { recursive: true }); fs.writeFileSync(m[1], contenu); const conforme = crypto.createHash('sha256').update(contenu).digest('hex') === 'a19de2f11e341f86b942ed69cba668c47b1aa121f4f6986f0c5f8bdb84c8855e'; console.log((conforme ? 'conforme  ' : 'ECART     ') + m[1]); if (!conforme) process.exitCode = 1;"
```

Le développeur adapte ensuite sa copie : possibilités du modèle générique de la demande, confrontées à l'analyse de l'application (module `qualification`, § 2), catégories `M05` et suivantes, technologies, options permises, transverses. Il change `meta.version` à chaque modification ; les tickets déjà instanciés gardent la version qu'ils ont épinglée.

Un référentiel installé avant la version 3.3.0 du skill n'a pas de section `[modele_demande]` : le développeur l'y ajoute, copiée de ce modèle. D'ici là, la qualification prend celle du modèle et le signale (module `qualification`, § 2).

Un référentiel installé avant la version 3.4.0 n'a ni M04, ni les options `representations` et `evenements`, ni les possibilités `variante_representation` et `temps_reel`, ni la règle de choix sur les possibilités requises. Le développeur les copie de ce modèle s'il veut cette catégorie, et change `meta.version`. D'ici là, un ticket de variante de représentation ne trouve pas de catégorie : il se signale, sans catégorie inventée (D10.INV-1).

<!-- fichier : docs/c7e/referentiel-meso-contrats.toml -->
```toml
# ==============================================================================
# RÉFÉRENTIEL DES MÉSO-CONTRATS ET CATÉGORIES DE TICKETS
# ==============================================================================
#
# 3.3.0 (1er novembre 2026)
#   - Composition : un ticket engage un méso-contrat principal et, au besoin,
#     des compléments, pour les possibilités que le principal ne porte pas.
#     Une couche à l'impact aucun dans un méso-contrat peut être couverte par
#     un autre méso-contrat du ticket : chaque option est rattachée au
#     méso-contrat qui la permet (meso_contrat, le principal par défaut).
#   - Règle de choix et règles de validation réécrites pour la composition ;
#     un ticket sans complément suit les mêmes règles qu'avant.
#
# 3.2.0 (1er novembre 2026)
#   - Catégorie M04, variante de représentation d'une ressource : depuis l'URI
#     d'une opération, son type de réponse et un champ liste ou record, une
#     variante sans ce champ, et une variante à la même URI où ce champ est
#     remplacé par la date-heure de son dernier enregistrement.
#   - Possibilité variante_representation (backend) ; lecture étendue aux
#     projections et agrégats.
#   - Option backend « representations », avec des paramètres au choix par
#     ticket : mécanisme de sélection et exposition de la variante sans champ.
#   - Possibilités requises d'un méso-contrat (possibilites_requises), prises en
#     compte par la règle de choix.
#   - Possibilité temps_reel et option backend « evenements » : le champ servi
#     par son URI existante, et la date-heure du résumé, tenus à jour en temps
#     réel chez le client par WebSocket STOMP (socle 1.1.0, SC7).
#   - Trois règles de validation de plus (section 4).
#
# 3.1.0 (1er novembre 2026)
#   - Modèle générique de la demande (section 0) : une combinaison de
#     possibilités, les modifications qu'un ticket peut demander à l'application,
#     couche par couche (PostgreSQL, Java, Angular), établies à l'analyse de
#     l'application. À l'ouverture de chaque ticket, sa demande est la
#     combinaison des possibilités qu'il implique ; elle désigne le méso-contrat
#     par la règle de choix, et le développeur le confirme avant tout le reste.
#   - Le ticket garde sa demande dans [ticket.demande] ; règles de validation
#     correspondantes (section 4).
#
# 3.0.0 (31 octobre 2026)
#   - Options au choix par couche (section 1) :
#       PostgreSQL : évolution de schéma, contrat CRUD au choix ;
#       Java       : règles, fonctionnalités, endpoints ;
#       Angular    : éléments graphiques, fonctionnalités ;
#       toute option front accompagnée d'une image PNG de l'objectif peut en
#       demander l'analyse.
#   - Empreinte technique typée : impact requis, optionnel ou aucun, et options
#     permises par couche.
#   - Méso-contrats transverses, appliqués d'office selon les couches touchées.
#   - Le ticket concret sort du référentiel : un fichier par ticket
#     (docs/demandes/<référence>/ticket.toml), qui épingle la version utilisée.
# ==============================================================================

[meta]
version = "3.3.0"
domaine = "Software Factory & Architecture"
description = "Taxonomie des méso-contrats structurant les évolutions logicielles de la stack (PostgreSQL, Java, Angular), avec les options au choix de chaque couche."

[meta.valeurs]
impact = ["requis", "optionnel", "aucun"]
complexite = ["Faible", "Moyenne", "Élevée"]
couches = ["persistance", "backend", "frontend"]

# ------------------------------------------------------------------------------
# 0. MODÈLE GÉNÉRIQUE DE LA DEMANDE
#    Une combinaison de possibilités : les modifications qu'un ticket peut
#    demander à l'application, couche par couche. La liste ci-dessous vaut pour
#    une application PostgreSQL, Java et Angular ; à l'installation, l'IA la
#    confronte à l'analyse de l'application et propose au développeur les
#    possibilités à retenir, à préciser (repères) ou à ajouter (batch, message,
#    export…). Le développeur seul les écrit ici.
#    À l'ouverture de chaque ticket, chaque possibilité vaut oui, non ou
#    inconnu d'après le contenu du ticket, avec sa source ; la combinaison des
#    possibilités à oui désigne, par la règle de choix, le méso-contrat
#    principal et, au besoin, ses compléments. Une possibilité inconnue dont la
#    réponse changerait la composition ou ses options devient une question au
#    développeur, qui confirme ensuite la composition avant toute autre étape.
# ------------------------------------------------------------------------------

[modele_demande]
valeurs = ["oui", "non", "inconnu"]
choix = [
  "un méso-contrat porte une possibilité à oui si la couche de celle-ci n'y est pas à l'impact aucun et si son option figure parmi les options permises de cette couche",
  "un méso-contrat peut être principal si chacune de ses couches à l'impact requis a une possibilité à oui qu'il porte, et si toutes ses possibilités requises (possibilites_requises) sont à oui",
  "le principal est, parmi ceux-là, celui qui porte le plus de possibilités à oui ; à égalité, une question les départage",
  "les possibilités à oui que le principal ne porte pas reçoivent des compléments : le plus petit nombre de méso-contrats qui les portent toutes, chacun avec ses possibilités requises à oui et au moins une de ces possibilités",
  "entre deux ensembles de compléments de même taille, on préfère celui dont chaque complément a, pour chacune de ses couches à l'impact requis, une possibilité restante qu'il porte ; à égalité encore, une question les départage",
  "une possibilité qu'aucun méso-contrat ne porte, ou un ticket sans principal possible, est signalé, sans catégorie inventée",
]

[modele_demande.intention]
question = "Quel changement le demandeur attend-il, en une phrase ?"

[modele_demande.maquette]
question = "Une maquette ou une capture PNG montre-t-elle l'objectif ?"
couche = "frontend"
note = "L'image s'analyse avec l'option front qu'elle illustre (analyse_image)."

# Persistance : PostgreSQL et Liquibase

[[modele_demande.possibilites]]
id = "table"
couche = "persistance"
modification = "Créer une table"
option = "schema"
reperes = ["changelog Liquibase"]

[[modele_demande.possibilites]]
id = "colonne"
couche = "persistance"
modification = "Ajouter ou modifier une colonne"
option = "schema"
reperes = ["changelog Liquibase", "entité JPA"]

[[modele_demande.possibilites]]
id = "index"
couche = "persistance"
modification = "Ajouter ou modifier un index, pour la performance d'une requête"
option = "schema"
reperes = ["changelog Liquibase", "plan d'exécution"]

[[modele_demande.possibilites]]
id = "contrainte"
couche = "persistance"
modification = "Ajouter ou modifier une contrainte : clé, unicité, NOT NULL"
option = "schema"
reperes = ["changelog Liquibase"]

[[modele_demande.possibilites]]
id = "lecture"
couche = "persistance"
modification = "Lire les données d'une entité : filtre, tri, pagination, projection ou agrégat"
option = "crud"
reperes = ["repository Spring Data", "requête", "projection ou requête d'agrégat"]

[[modele_demande.possibilites]]
id = "ecriture"
couche = "persistance"
modification = "Créer, modifier ou supprimer les données d'une entité"
option = "crud"
reperes = ["repository Spring Data", "transaction"]

# Backend : Java et Spring Boot

[[modele_demande.possibilites]]
id = "endpoint_nouveau"
couche = "backend"
modification = "Ajouter un endpoint"
option = "endpoints"
reperes = ["contrat OpenAPI", "contrôleur REST"]

[[modele_demande.possibilites]]
id = "endpoint_modifie"
couche = "backend"
modification = "Modifier le contrat d'un endpoint : paramètres, réponse, erreurs"
option = "endpoints"
reperes = ["contrat OpenAPI", "contrôleur REST", "DTO"]

[[modele_demande.possibilites]]
id = "variante_representation"
couche = "backend"
modification = "Ajouter une variante de représentation d'une opération existante : un champ liste ou record retiré, ou remplacé par la date-heure de son dernier enregistrement"
option = "representations"
reperes = ["contrat OpenAPI", "contrôleur REST", "DTO ou record de réponse"]

[[modele_demande.possibilites]]
id = "temps_reel"
couche = "backend"
modification = "Tenir le front à jour en temps réel des changements d'une ressource, par un canal WebSocket STOMP (socle, SC7)"
option = "evenements"
reperes = ["contrat AsyncAPI", "configuration STOMP", "écouteur après commit"]

[[modele_demande.possibilites]]
id = "regle"
couche = "backend"
modification = "Ajouter ou modifier une règle métier ou une habilitation"
option = "regles"
reperes = ["service du domaine", "sécurité des méthodes"]

[[modele_demande.possibilites]]
id = "service"
couche = "backend"
modification = "Ajouter ou modifier un cas d'usage côté serveur"
option = "fonctionnalites"
reperes = ["service applicatif"]

# Frontend : Angular

[[modele_demande.possibilites]]
id = "ecran_nouveau"
couche = "frontend"
modification = "Créer un écran ou un composant"
option = "elements_graphiques"
reperes = ["composant Angular", "routes"]

[[modele_demande.possibilites]]
id = "ecran_modifie"
couche = "frontend"
modification = "Modifier un composant : mise en page, libellés, états visuels"
option = "elements_graphiques"
reperes = ["gabarit et styles du composant"]

[[modele_demande.possibilites]]
id = "formulaire"
couche = "frontend"
modification = "Ajouter ou modifier un formulaire ou ses validations"
option = "fonctionnalites"
reperes = ["formulaire réactif", "validateurs"]

[[modele_demande.possibilites]]
id = "comportement"
couche = "frontend"
modification = "Modifier un comportement : déclencheur, état local, appel d'API"
option = "fonctionnalites"
reperes = ["signals", "service HTTP"]

[[modele_demande.possibilites]]
id = "navigation"
couche = "frontend"
modification = "Ajouter ou modifier une navigation ou une route"
option = "fonctionnalites"
reperes = ["routes", "gardes"]

# ------------------------------------------------------------------------------
# 1. OPTIONS AU CHOIX, PAR COUCHE
#    Chaque option nomme le slot 7E qu'elle engage et les preuves qu'elle exige.
#    Un méso-contrat permet un sous-ensemble de ces options ; un ticket y choisit.
# ------------------------------------------------------------------------------

[options.persistance.schema]
nom = "Évolution de schéma"
slot = "É1"
description = "Tables, colonnes, index et contraintes, par changesets Liquibase."
changements = ["table", "colonne", "index", "contrainte"]
preuves = [
  "migration jouée, annulée, rejouée (update-testing-rollback)",
  "un changeset par fichier, avec son rollback",
]

[options.persistance.crud]
nom = "Contrat CRUD"
slot = "É1"
description = "Opérations retenues, par entité, parmi create, read, update et delete."
operations = ["create", "read", "update", "delete"]
suppression = ["logique", "physique"]  # à choisir dès que delete est retenu
preuves = [
  "un test d'intégration du dépôt par opération retenue",
  "create : contraintes NOT NULL et valeurs par défaut vérifiées",
  "read : index pour chaque filtre ou tri, pagination { content, page }",
  "update : règle de concurrence explicite (verrouillage optimiste ou dernier écrivain)",
  "delete : mode de suppression et effet sur les clés étrangères vérifiés",
]

[options.backend.regles]
nom = "Règles métier"
slot = "É4"
description = "Règles de gestion et invariants du domaine, appliqués par un service."
preuves = [
  "un test unitaire par règle : cas nominal, cas limite, violation",
  "violation rendue en 422, avec un code métier (RFC 9457)",
]

[options.backend.fonctionnalites]
nom = "Fonctionnalités"
slot = "É4"
description = "Cas d'usage orchestrés par la couche application."
preuves = ["un test d'intégration par cas d'usage"]

[options.backend.endpoints]
nom = "Endpoints"
slot = "É3"
description = "Opérations REST, décrites dans le contrat OpenAPI avant tout code."
methodes = ["GET", "POST", "PUT", "PATCH", "DELETE"]
preuves = [
  "contrat OpenAPI 3.1 validé avant le code",
  "un test de contrat par opération",
  "erreurs RFC 9457 : 400, 401, 403, 404, 409 ou 422 selon le cas",
]

[options.backend.representations]
nom = "Variantes de représentation"
slot = "É3"
description = """
Variantes du type de réponse d'une opération existante. À l'analyse (d=0),
l'IA repère depuis l'URI l'opération du contrat OpenAPI et son contrôleur, le
type de réponse, le champ liste ou record visé, l'URI existante qui sert ce
champ s'il y en a une, l'entité qui le porte et la colonne de date-heure de
son enregistrement ; elle l'écrit dans ticket.toml.
Variante sans champ : le type de réponse sans ce champ. Variante résumée : à
la même URI, le champ remplacé par la date-heure de son dernier enregistrement,
le maximum des dates des éléments pour une liste, la date du record pour un
record, calculée en base sans charger les éléments.
"""
variantes = ["sans_champ", "resume"]
preuves = [
  "repérage depuis l'URI écrit dans ticket.toml : opération, contrôleur, type de réponse, champ, URI existante du champ, entité et colonne de date-heure",
  "contrat OpenAPI : un schéma par variante et le mécanisme de sélection décrit, validés avant le code",
  "un test de contrat par variante : le champ retiré est absent de la réponse, et non pas null",
  "sans sélection, la réponse actuelle reste identique, vérifiée par un test de non-régression (sauf remplacement)",
  "date-heure du dernier enregistrement au format Instant du socle, ISO 8601 avec fuseau ; null documenté au contrat et testé pour une liste vide",
  "date-heure calculée en base par une seule requête, sans charger les éléments, vérifiée par un compteur de requêtes dans le test",
  "negociation_contenu : 406 pour un type de média non servi",
  "remplacement : version d'API non publiée, vérifiée par la comparaison du contrat avec sa version précédente",
]

[options.backend.representations.parametres]
# Au choix par ticket, gardés dans ticket.toml.
selection = ["parametre_vue", "negociation_contenu", "remplacement"]
exposition_sans_champ = ["base", "meme_uri", "uri_propre"]

[options.backend.representations.notes]
parametre_vue = "Paramètre de requête facultatif (par exemple ?vue=resume) ; sans lui, la réponse actuelle est inchangée."
negociation_contenu = "Type de média dédié dans l'en-tête Accept ; sans lui, la réponse actuelle est inchangée ; 406 pour un type non servi."
remplacement = "La réponse actuelle devient la variante résumée : retrait d'un champ, donc changement cassant (socle, SC1.INV-2), seulement pour une opération dont la version d'API n'est pas publiée."
base = "La variante sans champ n'a pas d'opération à elle : elle sert de base à la variante résumée."
meme_uri = "La variante sans champ se sélectionne aussi à la même URI, par le même mécanisme, avec une valeur de plus."
uri_propre = "La variante sans champ a sa propre opération, ajoutée au contrat (option endpoints)."

[options.backend.evenements]
nom = "Événements temps réel"
slot = "É3"
description = """
Changements d'une ressource diffusés au front par WebSocket STOMP, selon le
socle (SC7) : canal au contrat AsyncAPI, enveloppe CloudEvents avec sa
séquence, publication après commit, instantané REST dont l'ETag est la
dernière séquence, reprise après déconnexion, abonnement autorisé comme la
lecture REST. Pour une variante résumée, chaque événement de la liste porte
aussi la date-heure de son dernier enregistrement après le changement : le
résumé se tient à jour sans recharger la liste, suppressions comprises.
"""
preuves = [
  "canal et types d'événements au contrat AsyncAPI, validé avant le code (SC7.INV-1)",
  "enveloppe CloudEvents validée contre le contrat : time avec fuseau, sequence, traceparent (SC7.INV-2)",
  "transaction annulée : aucun événement reçu (SC7.INV-3)",
  "instantané REST avec ETag égal à la dernière séquence ; déconnexion, doublon et trou simulés côté client (SC7.INV-4)",
  "abonnement refusé sans droit de lecture, par une trame ERROR qui porte un Problem Details 403 ; aucun jeton dans l'URL (SC7.INV-5)",
  "mise à jour annoncée par une région aria-live polite, sans déplacer le focus (SC7.INV-6)",
  "relais : deux instances du back, un événement publié par l'une est reçu par un client connecté à l'autre",
]

[options.backend.evenements.parametres]
mecanisme = ["websocket_stomp"]
courtier = ["simple", "relais"]

[options.backend.evenements.notes]
websocket_stomp = "Seul mécanisme du socle 1.1.0 ; SSE et messages entre services restent réservés (SC7)."
simple = "Courtier en mémoire du back, pour une seule instance."
relais = "Relais vers un courtier STOMP externe, dès deux instances ; le fichier d'invariants du projet le nomme."

[options.frontend.elements_graphiques]
nom = "Éléments graphiques"
slot = "É5"
description = "Composants, mise en page et états visuels (repos, chargement, vide, erreur)."
preuves = [
  "un test de composant par état visuel",
  "contrôle d'accessibilité WCAG 2.2 AA",
]

[options.frontend.fonctionnalites]
nom = "Fonctionnalités"
slot = "É2"
description = "Comportements : déclencheurs, état local en signals, appels d'API, navigation."
preuves = [
  "un test de composant ou de service par comportement",
  "un test de bout en bout du parcours",
]

[options.frontend.analyse_image]
nom = "Analyse d'une image de l'objectif"
applicable_a = ["elements_graphiques", "fonctionnalites"]
formats = ["png"]
extractions = ["structure", "composants", "textes", "etats", "couleurs", "accessibilite"]
sortie = "docs/demandes/{reference}/analyse-image.md"
description = """
Pour toute option front qui désigne une image PNG de l'objectif, l'IA l'analyse
avant la fiche de transformation : inventaire des extractions demandées,
correspondance de chaque élément avec une option du ticket, éléments sans
correspondance posés en questions, écarts avec l'écran actuel si sa capture est
fournie. L'analyse se valide avec la fiche. Tailles et couleurs lues sur une
image sont des estimations, à confirmer avec le système de design.
"""
preuves = [
  "analyse validée par le développeur avec la fiche",
  "capture de l'écran livré comparée à l'image de l'objectif",
]

# ------------------------------------------------------------------------------
# 2. CATALOGUE DES MÉSO-CONTRATS (LES DIFFÉRENTES CATÉGORIES)
#    Un ticket en engage un, son principal, et au besoin des compléments
#    (section 0, règle de choix).
#    Pour ajouter une catégorie : un bloc [[meso_contrats]] d'identifiant M05,
#    M06…, dont chaque couche déclare son impact et ses options permises,
#    choisies dans la section 1, et, s'il y a lieu, les possibilités de la
#    section 0 sans lesquelles il ne convient pas (possibilites_requises).
# ------------------------------------------------------------------------------

[[meso_contrats]]
id = "M01"
code = "EVOL_PARADIGME_PULL"
nom = "Transition eager vers lazy (pilotée par l'intention)"
description = "Tickets impliquant une modification verticale complète : schéma (Liquibase, PostgreSQL), puis API (Java), puis IHM (Angular, à la demande)."
complexite_moyenne = "Élevée"

[meso_contrats.empreinte_technique]
persistance = { impact = "requis", technologies = ["Liquibase", "PostgreSQL"], options = ["schema", "crud"] }
backend = { impact = "requis", technologies = ["Java", "API REST"], options = ["endpoints", "fonctionnalites", "regles"] }
frontend = { impact = "requis", technologies = ["Angular"], style = "État et événements", options = ["elements_graphiques", "fonctionnalites"] }


[[meso_contrats]]
id = "M02"
code = "OPTIMISATION_DONNEES"
nom = "Optimisation de requêtage et indexation de la base de données"
description = "Tickets axés sur les performances de stockage, la création d'index ou la restructuration de tables, sans rupture d'API."
complexite_moyenne = "Moyenne"

[meso_contrats.empreinte_technique]
persistance = { impact = "requis", technologies = ["Liquibase", "PostgreSQL"], options = ["schema", "crud"] }
backend = { impact = "optionnel", technologies = ["Java"], options = ["fonctionnalites"] }
frontend = { impact = "aucun", technologies = [], options = [] }


[[meso_contrats]]
id = "M03"
code = "REFONTE_UI_COMPOSANT"
nom = "Évolution ergonomique du front-end"
description = "Tickets modifiant l'expérience utilisateur ou l'état local de l'IHM, sans impact sur le schéma de persistance."
complexite_moyenne = "Faible"

[meso_contrats.empreinte_technique]
persistance = { impact = "aucun", technologies = [], options = [] }
backend = { impact = "aucun", technologies = [], options = [] }
frontend = { impact = "requis", technologies = ["Angular"], style = "Composants et signals", options = ["elements_graphiques", "fonctionnalites"] }



[[meso_contrats]]
id = "M04"
code = "VARIANTE_REPRESENTATION"
nom = "Variante de représentation d'une ressource"
description = "Tickets qui, depuis l'URI d'une opération existante, dérivent de son type de réponse une variante sans un champ liste ou record, et, à la même URI, une variante où ce champ est remplacé par la date-heure de son dernier enregistrement ; le champ, servi par son URI existante, et la date-heure peuvent être tenus à jour en temps réel. Le front et la base ne sont touchés que si la demande l'exige."
complexite_moyenne = "Moyenne"
possibilites_requises = ["variante_representation"]

[meso_contrats.empreinte_technique]
persistance = { impact = "optionnel", technologies = ["PostgreSQL", "Liquibase"], options = ["crud", "schema"] }
backend = { impact = "requis", technologies = ["Java", "API REST", "WebSocket STOMP"], options = ["representations", "endpoints", "evenements"] }
frontend = { impact = "optionnel", technologies = ["Angular"], style = "Types et appels d'API", options = ["fonctionnalites", "elements_graphiques"] }

# ------------------------------------------------------------------------------
# 3. MÉSO-CONTRATS TRANSVERSES DE LA PLATEFORME
#    Ils ne se choisissent pas : ils s'appliquent d'office à tout ticket qui
#    touche l'une des couches citées.
# ------------------------------------------------------------------------------

[[meso_contrats_transverses]]
id = "T01"
code = "SOCLE_BACK_FRONT"
nom = "Socle back-front"
s_applique_si = ["backend", "frontend"]
exigences = "Contrat OpenAPI, erreurs RFC 9457, formats, pagination, sécurité OAuth 2.1 et OIDC, traçabilité W3C ; événements temps réel (contrat AsyncAPI, WebSocket STOMP, CloudEvents) dès qu'un canal est touché."

[[meso_contrats_transverses]]
id = "T02"
code = "ACCESSIBILITE"
nom = "Accessibilité"
s_applique_si = ["frontend"]
exigences = "RGAA 4.1 et WCAG 2.2 niveau AA."

[[meso_contrats_transverses]]
id = "T03"
code = "MIGRATION_SURE"
nom = "Migration de base sûre"
s_applique_si = ["persistance"]
exigences = "Un changeset par fichier, un rollback par changeset, migration jouée, annulée et rejouée avant livraison."

# ------------------------------------------------------------------------------
# 4. RÈGLES DE VALIDATION D'UN TICKET (docs/demandes/<référence>/ticket.toml)
# ------------------------------------------------------------------------------

[validation]
regles = [
  "le ticket nomme son méso-contrat principal (meso_contrat) et, s'il en a, ses compléments (complements), tous du catalogue, et la version du référentiel qu'il suit",
  "la section demande répond à l'intention et à chaque possibilité du modèle générique, et cite la source de chaque réponse autre qu'inconnu",
  "la composition, principal et compléments, respecte la règle de choix du modèle générique, appliquée aux possibilités à oui",
  "aucune possibilité ne reste inconnue si sa réponse pouvait changer la composition",
  "aucune option n'est choisie tant que la composition n'est pas confirmée (meso_contrat_confirme)",
  "chaque option choisie est rattachée à un méso-contrat de la composition (meso_contrat de l'option, le principal par défaut) et figure parmi les options permises de sa couche dans ce méso-contrat ; aucune n'est rattachée à un méso-contrat sur une couche où il est à l'impact aucun",
  "chaque couche à l'impact requis du principal porte au moins une option qui lui est rattachée ; chaque complément porte au moins une option qui lui est rattachée",
  "les opérations CRUD sont prises parmi create, read, update et delete ; delete impose un mode de suppression",
  "la méthode d'un endpoint est prise parmi les méthodes du catalogue",
  "chaque paramètre d'une option choisie prend une valeur de son catalogue (parametres)",
  "le mécanisme de sélection remplacement n'est choisi que pour une opération dont la version d'API n'est pas publiée (version_publiee = false)",
  "une option evenements nomme son canal, ses types d'événements et son instantané REST",
  "analyse_image n'apparaît qu'avec image_objectif, en PNG, et ses extractions sont prises dans le catalogue",
  "les méso-contrats transverses des couches touchées s'appliquent d'office",
]
```

## 7. Exemple d'instance

### 7.1 Ticket fil rouge, M01

`docs/demandes/ABCDE-3512/ticket.toml`, pour le ticket fil rouge du point d'entrée (§ 15, R3, R11 et R16). La section `[ticket.demande]` vient de la qualification, à l'ouverture du ticket ; les options, de l'analyse :

```toml
[ticket]
reference = "ABCDE-3512"
referentiel = "3.3.0"
meso_contrat = "M01"
meso_contrat_confirme = true
titre = "Charger les données au clic plutôt qu'à l'ouverture de l'écran"

# Demande : la combinaison des possibilités de modification que le ticket implique,
# établie à son ouverture (qualification, D11). Les possibilités que le ticket
# n'évoque pas restent inconnues : aucune ne changerait le méso-contrat ni ses options.
[ticket.demande]
intention = { reponse = "Charger les données au clic plutôt qu'à l'ouverture de l'écran", source = "ticket : titre" }
maquette = { reponse = "oui", precision = "maquettes/ecran-cible.png et maquettes/parcours-cible.png", source = "ticket : pièces jointes" }
table = { reponse = "inconnu" }
colonne = { reponse = "oui", precision = "mode_chargement, AUTO ou CLIC, dans la table donnee", source = "ticket : description" }
index = { reponse = "inconnu" }
contrainte = { reponse = "inconnu" }
lecture = { reponse = "oui", precision = "données paginées", source = "ticket : critères d'acceptation" }
ecriture = { reponse = "inconnu" }
endpoint_nouveau = { reponse = "non", source = "développeur : question 1" }
endpoint_modifie = { reponse = "oui", precision = "GET /api/v1/donnees, paginé", source = "développeur : question 1" }
variante_representation = { reponse = "non", precision = "réponse paginée, sans variante", source = "développeur : question 1" }
temps_reel = { reponse = "non", precision = "chargement au clic, sans mise à jour poussée", source = "ticket : titre" }
regle = { reponse = "oui", precision = "seul un utilisateur habilité obtient les données", source = "ticket : critères d'acceptation" }
service = { reponse = "oui", precision = "fournir les données à la demande", source = "ticket : description" }
ecran_nouveau = { reponse = "inconnu" }
ecran_modifie = { reponse = "oui", precision = "bouton « Charger les données »", source = "ticket : critères d'acceptation" }
formulaire = { reponse = "inconnu" }
comportement = { reponse = "oui", precision = "chargement au clic, et non dans ngOnInit", source = "ticket : titre" }
navigation = { reponse = "inconnu" }

[[ticket.persistance.schema]]
changement = "colonne"
table = "donnee"
description = "Colonne mode_chargement, AUTO ou CLIC, avec une valeur par défaut pour les lignes existantes."

[[ticket.persistance.crud]]
entite = "Donnee"
table = "donnee"
operations = ["read"]

[[ticket.backend.endpoints]]
methode = "GET"
chemin = "/api/v1/donnees"
reponse = "page de DonneeDto"
erreurs = [400, 401, 403]

[[ticket.backend.fonctionnalites]]
nom = "Fournir les données à la demande, paginées"

[[ticket.backend.regles]]
id = "ABCDE-3512-R1"
enonce = "Seul un utilisateur habilité obtient les données ; sinon 403."

[[ticket.frontend.elements_graphiques]]
nom = "Bouton « Charger les données »"
etats = ["repos", "chargement", "erreur", "chargé"]
image_objectif = "docs/demandes/ABCDE-3512/maquettes/ecran-cible.png"
analyse_image = ["structure", "composants", "textes", "etats", "accessibilite"]

[[ticket.frontend.fonctionnalites]]
nom = "Charger au clic, et non dans ngOnInit"
declencheur = "click"
image_objectif = "docs/demandes/ABCDE-3512/maquettes/parcours-cible.png"
image_actuelle = "docs/demandes/ABCDE-3512/maquettes/ecran-actuel.png"
analyse_image = ["structure", "etats"]
```

### 7.2 Variante de représentation en temps réel, M04

`docs/demandes/ABCDE-3620/ticket.toml`, pour le scénario R19. Le ticket : « Trouver l'endpoint de l'URI `/api/v1/commandes/{id}` avec son type de donnée ; sa composition contient le champ `lignes`, une liste de records. Réaliser une variante de ce type sans ce champ. Réaliser une variante à la même URI où ce champ ne sera pas intégré : les informations le concernant seront uniquement la date et l'heure du dernier enregistrement. La liste des lignes, appelée par son URI existante, devra être mise à jour en temps réel. » Le développeur a répondu aux quatre questions de la qualification : sélection par paramètre de vue, variante sans champ sans opération à elle, date-heure déjà stockée sur les lignes, front qui affiche la liste et le résumé. Le courtier vient du fichier d'invariants du projet ; le repérage depuis l'URI, de l'analyse :

```toml
[ticket]
reference = "ABCDE-3620"
referentiel = "3.3.0"
meso_contrat = "M04"
meso_contrat_confirme = true
titre = "Commande : variante sans les lignes, résumé à la même URI avec la date-heure de la dernière ligne enregistrée, lignes en temps réel"

[ticket.demande]
intention = { reponse = "Dériver de la réponse de GET /api/v1/commandes/{id} une variante sans les lignes et, à la même URI, une variante où les lignes sont remplacées par la date-heure de la dernière ligne enregistrée ; tenir à jour en temps réel la liste des lignes, servie par son URI existante", source = "ticket : description" }
maquette = { reponse = "non", source = "ticket : pièces jointes" }
table = { reponse = "inconnu" }
colonne = { reponse = "non", precision = "ligne_commande.enregistree_le existe déjà", source = "développeur : question 3" }
index = { reponse = "inconnu" }
contrainte = { reponse = "inconnu" }
lecture = { reponse = "oui", precision = "date-heure maximale des lignes d'une commande, sans charger les lignes", source = "ticket : description" }
ecriture = { reponse = "inconnu" }
endpoint_nouveau = { reponse = "non", source = "développeur : question 2" }
endpoint_modifie = { reponse = "oui", precision = "GET /api/v1/commandes/{id}, paramètre vue facultatif ; GET /api/v1/commandes/{id}/lignes, en-tête ETag", source = "développeur : question 1 ; ticket : description" }
variante_representation = { reponse = "oui", precision = "champ lignes, une liste de records", source = "ticket : description" }
temps_reel = { reponse = "oui", precision = "liste des lignes, et date-heure du résumé", source = "ticket : description" }
regle = { reponse = "inconnu" }
service = { reponse = "inconnu" }
ecran_nouveau = { reponse = "non", source = "développeur : question 4" }
ecran_modifie = { reponse = "oui", precision = "liste des lignes et date-heure du dernier enregistrement, annoncées à leur mise à jour", source = "développeur : question 4" }
formulaire = { reponse = "inconnu" }
comportement = { reponse = "oui", precision = "abonnement au canal des lignes, instantané, application des événements", source = "développeur : question 4" }
navigation = { reponse = "inconnu" }

[[ticket.persistance.crud]]
entite = "LigneCommande"
table = "ligne_commande"
operations = ["read"]
lecture = "max(enregistree_le) des lignes d'une commande, par une requête d'agrégat"

[[ticket.backend.representations]]
operation = "GET /api/v1/commandes/{id}"
version_publiee = true
controleur = "CommandeController#lire"
type_reponse = "CommandeDto"
champ = { nom = "lignes", nature = "liste", type = "List<LigneCommandeDto>", uri = "GET /api/v1/commandes/{id}/lignes" }
entite = "LigneCommande"
colonne_date = "ligne_commande.enregistree_le"
selection = "parametre_vue"
exposition_sans_champ = "base"
variante_sans_champ = { type = "CommandeSansLignesDto" }
variante_resume = { type = "CommandeResumeDto", vue = "resume", champ_date = "lignesDernierEnregistrement", vide = "null" }

[[ticket.backend.endpoints]]
methode = "GET"
chemin = "/api/v1/commandes/{id}"
parametres = ["vue, facultatif : resume"]
reponse = "CommandeDto sans paramètre, inchangée ; CommandeResumeDto avec vue=resume"
erreurs = [400, 401, 403, 404]

[[ticket.backend.endpoints]]
methode = "GET"
chemin = "/api/v1/commandes/{id}/lignes"
reponse = "page de LigneCommandeDto, inchangée, avec l'en-tête ETag égal à la dernière séquence du canal"
erreurs = [400, 401, 403, 404]

[[ticket.backend.evenements]]
mecanisme = "websocket_stomp"
courtier = "relais"
canal = "/topic/v1/commandes/{id}/lignes"
types = ["ligne-commande.creee.v1", "ligne-commande.modifiee.v1", "ligne-commande.supprimee.v1"]
instantane = "GET /api/v1/commandes/{id}/lignes"
donnees = "la ligne (son identifiant seul pour une suppression), et lignesDernierEnregistrement après le changement"

[[ticket.frontend.fonctionnalites]]
nom = "Tenir à jour la liste des lignes et le résumé : abonnement, puis instantané, puis événements dans l'ordre des séquences"
declencheur = "ouverture du détail de la commande"

[[ticket.frontend.elements_graphiques]]
nom = "Liste des lignes et date-heure du dernier enregistrement"
etats = ["chargement", "à jour", "reconnexion", "erreur"]
```

### 7.3 Composition, M04 et un complément M01

`docs/demandes/ABCDE-3655/ticket.toml`, pour le scénario R21. Le ticket reprend celui du § 7.2 et ajoute : « Seuls les utilisateurs du rôle COMMERCIAL obtiennent le résumé ; les autres reçoivent 403. » La possibilité `regle` passe à `oui`. M04 reste le principal, il porte six des sept possibilités à `oui` ; il ne permet pas l'option `regles`, que M01 permet : M01 est le seul complément. Le fichier est celui du § 7.2, à ces lignes près :

```toml
[ticket]
reference = "ABCDE-3655"
referentiel = "3.3.0"
meso_contrat = "M04"
complements = ["M01"]
meso_contrat_confirme = true
titre = "Commande : variante sans les lignes, résumé réservé au rôle COMMERCIAL, lignes en temps réel"

[ticket.demande]
# … les autres réponses comme au § 7.2 …
regle = { reponse = "oui", precision = "résumé réservé au rôle COMMERCIAL, sinon 403", source = "ticket : critères d'acceptation" }

# … les options du § 7.2, rattachées au principal M04 …

[[ticket.backend.regles]]
meso_contrat = "M01"
id = "ABCDE-3655-R1"
enonce = "Seul un utilisateur du rôle COMMERCIAL obtient la vue resume de GET /api/v1/commandes/{id} ; sinon 403."
```

Les méso-contrats transverses s'appliquent selon les couches touchées par toute la composition. Les preuves sont celles de toutes les options retenues, quel que soit leur rattachement.

## 8. Contrôles

- La section `[validation]` du référentiel énumère les règles d'un ticket, celles de la demande remplie comprises ; l'IA les vérifie avant de présenter `ticket.toml` (D10.INV-2).
- Scénarios R11 à R14 du point d'entrée ; R16 à R18 pour le modèle générique de la demande ; R19 et R20 pour M04 et l'option `representations` ; R21 et R22 pour la composition.
- À la publication : le modèle se lit en TOML, et les deux exemples d'instance respectent toutes ses règles de validation, et l'exemple de composition aussi (point d'entrée, section 16).
