---
name: referentiel
description: Dimension D10, le référentiel des méso-contrats du projet. Catégories de tickets avec leur empreinte technique par couche, options au choix (évolution de schéma et contrat CRUD pour PostgreSQL, règles, fonctionnalités et endpoints pour Java, éléments graphiques et fonctionnalités pour Angular, analyse d'une image PNG de l'objectif pour toute option front), méso-contrats transverses, et instance de chaque ticket dans ticket.toml. À lire à l'installation et à l'analyse de chaque ticket.
dimensions: [D10]
status: active
---

# Module `referentiel` (D10)

Statut : `active`, depuis la version 3.2.0.

## 1. Rôle

Deux fichiers du projet encadrent un ticket :

- le **fichier d'invariants**, `docs/c7e/meso-contrats.md` (D8), dit les règles que tout contrat respecte ;
- le **référentiel des méso-contrats**, `docs/c7e/referentiel-meso-contrats.toml` (D10), dit quels contrats un ticket engage : sa catégorie, les couches qu'elle touche et les options choisies sur chaque couche.

Un méso-contrat est une catégorie de tickets, définie par son empreinte technique : pour chaque couche (persistance, backend, frontend), un impact `requis`, `optionnel` ou `aucun`, et les options permises. Le ticket choisit ses options parmi celles-ci ; chaque option engage un slot et des preuves. Les méso-contrats transverses (socle back-front, accessibilité, migration sûre) ne se choisissent pas : ils s'appliquent d'office aux couches touchées.

## 2. Emplacements

| Fichier | Rôle | Qui l'écrit | Emplacement |
|---|---|---|---|
| référentiel du projet | catégories, options, transverses, règles de validation | le développeur, à partir du modèle du § 6 ; jamais l'IA (D10.INV-5) | `docs/c7e/referentiel-meso-contrats.toml` |
| instance du ticket | méso-contrat, options choisies, version du référentiel | l'IA propose ; le développeur valide avec la fiche (D10.INV-1) | `docs/demandes/<CLÉ>/ticket.toml` |
| analyse d'image | extractions, correspondances, questions, écarts | l'IA ; validée avec la fiche (D10.INV-4) | `docs/demandes/<CLÉ>/analyse-image.md` |
| images de l'objectif | maquettes ou captures au format PNG | le développeur ou le PO | `docs/demandes/<CLÉ>/maquettes/` |

Les images sont versionnées avec la demande : les commandes de Gemini CLI n'injectent pas un fichier exclu de Git.

## 3. À l'analyse de chaque ticket (d=0)

Ces étapes prennent place dans l'analyse du § 3 du point d'entrée, après la cartographie d'impact et avant la fiche.

1. Lire le référentiel du projet et noter sa version (`meta.version`).
2. Classer le ticket : proposer le méso-contrat dont l'empreinte couvre les couches que touche la cartographie d'impact. Si aucun ne convient, le dire dans la fiche et proposer au développeur une catégorie nouvelle, sans l'écrire (D10.INV-1, D10.INV-5).
3. Choisir les options, couche par couche, parmi les options permises du méso-contrat (D10.INV-2) :
   - persistance : évolution de schéma (tables, colonnes, index, contraintes) ; contrat CRUD, avec ses opérations et, si `delete` est retenu, le mode de suppression ;
   - backend : endpoints, règles métier, fonctionnalités ;
   - frontend : éléments graphiques, fonctionnalités ; pour chacun, s'il y a lieu, l'image de l'objectif (`image_objectif`) et les extractions demandées (`analyse_image`).
4. Analyser les images demandées dans `analyse-image.md` (D10.INV-4) :
   - les extractions demandées : structure, composants, textes, états, couleurs, accessibilité ;
   - la correspondance de chaque élément de l'image avec une option du ticket ;
   - les éléments sans option correspondante, posés en questions au développeur ;
   - les écarts avec l'écran actuel, si sa capture est fournie (`image_actuelle`) ;
   - les tailles et les couleurs, données comme estimations à confirmer avec le système de design ; ce qu'une image ne montre pas (focus, annonces aux technologies d'assistance, comportement) reste à prouver par les tests.
5. Ajouter aux tests déduits les preuves de chaque option retenue et les exigences des méso-contrats transverses des couches touchées (D10.INV-2, D10.INV-3). Chaque preuve garde son lien à un critère ou à un risque (D5.INV-1).
6. Écrire `ticket.toml`, qui épingle la version du référentiel (D10.INV-5), et le présenter avec la fiche et l'analyse : un seul point de validation, avant toute modification (D3.INV-1).

## 4. Des options aux slots

| Couche | Option | Slot | Étiquette des commits |
|---|---|---|---|
| persistance | `schema`, `crud` | É1 | `[É1-DB]` |
| backend | `endpoints` | É3 | `[É3-API]` |
| backend | `regles`, `fonctionnalites` | É4 | `[É4-SVC]` |
| frontend | `fonctionnalites` | É2, puis É5 | `[É2-UI]`, `[É5-UI]` |
| frontend | `elements_graphiques` | É5 | `[É5-UI]` |
| frontend | `analyse_image` | analyse (d=0), preuve en É6 | aucun commit propre |

## 5. Au démarrage

Le référentiel ne sert que si le développeur a choisi l'orchestrateur (D2.INV-3, § 11.4 du point d'entrée). Il se lit à l'analyse de chaque ticket, pas au démarrage : dans un chargement permanent, seul le fichier d'invariants accompagne le point d'entrée.

## 6. Modèle du référentiel

À l'installation (§ 11.3 du point d'entrée), le bloc annoté ci-dessous s'écrit à l'identique dans le projet, depuis sa racine ; le fichier est le contenu du bloc, terminé par un saut de ligne. Son empreinte se vérifie ensuite :

| Fichier | Empreinte sha256 |
|---|---|
| `docs/c7e/referentiel-meso-contrats.toml` | `f7a7bea03485fe5cc8fbb38c00ac4b135763f3f957436dbe6c7442dc491dfd76` |

Commande d'extraction et de vérification, depuis la racine du projet (Node 20 ou plus récent, sans dépendance). Elle suppose le skill dans `.skills/orchestrateur-c7e/` ; pour un autre emplacement, comme `.gemini/skills/orchestrateur-c7e/` en chargement au choix, remplacer ce chemin :

```bash
node -e "const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'); const texte = fs.readFileSync('.skills/orchestrateur-c7e/modules/referentiel/SKILL.md', 'utf8').replace(/\r\n/g, '\n'); const m = /^<\x21-- fichier : (\S+) -->\n\x60{3}[a-z]*\n([\s\S]*?)\n\x60{3}\n/m.exec(texte); const contenu = m[2] + '\n'; fs.mkdirSync(path.dirname(m[1]), { recursive: true }); fs.writeFileSync(m[1], contenu); const conforme = crypto.createHash('sha256').update(contenu).digest('hex') === 'f7a7bea03485fe5cc8fbb38c00ac4b135763f3f957436dbe6c7442dc491dfd76'; console.log((conforme ? 'conforme  ' : 'ECART     ') + m[1]); if (!conforme) process.exitCode = 1;"
```

Le développeur adapte ensuite sa copie : catégories `M04` et suivantes, technologies, options permises, transverses. Il change `meta.version` à chaque modification ; les tickets déjà instanciés gardent la version qu'ils ont épinglée.

<!-- fichier : docs/c7e/referentiel-meso-contrats.toml -->
```toml
# ==============================================================================
# RÉFÉRENTIEL DES MÉSO-CONTRATS ET CATÉGORIES DE TICKETS
# ==============================================================================
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
version = "3.0.0"
domaine = "Software Factory & Architecture"
description = "Taxonomie des méso-contrats structurant les évolutions logicielles de la stack (PostgreSQL, Java, Angular), avec les options au choix de chaque couche."

[meta.valeurs]
impact = ["requis", "optionnel", "aucun"]
complexite = ["Faible", "Moyenne", "Élevée"]
couches = ["persistance", "backend", "frontend"]

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
#    Pour ajouter une catégorie : un bloc [[meso_contrats]] d'identifiant M04,
#    M05…, dont chaque couche déclare son impact et ses options permises,
#    choisies dans la section 1.
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
exigences = "Contrat OpenAPI, erreurs RFC 9457, formats, pagination, sécurité OAuth 2.1 et OIDC, traçabilité W3C."

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
  "le ticket nomme un méso-contrat du catalogue et la version du référentiel qu'il suit",
  "chaque couche à l'impact requis porte au moins une option choisie",
  "aucune option n'est choisie sur une couche à l'impact aucun",
  "chaque option choisie figure parmi les options permises de sa couche",
  "les opérations CRUD sont prises parmi create, read, update et delete ; delete impose un mode de suppression",
  "la méthode d'un endpoint est prise parmi les méthodes du catalogue",
  "analyse_image n'apparaît qu'avec image_objectif, en PNG, et ses extractions sont prises dans le catalogue",
  "les méso-contrats transverses des couches touchées s'appliquent d'office",
]
```

## 7. Exemple d'instance

`docs/demandes/ABCDE-3512/ticket.toml`, pour le ticket fil rouge du point d'entrée (§ 15, R3 et R11) :

```toml
[ticket]
reference = "ABCDE-3512"
referentiel = "3.0.0"
meso_contrat = "M01"
titre = "Charger les données au clic plutôt qu'à l'ouverture de l'écran"

[ticket.specifications_metier]
element_persiste = "Colonne mode_chargement de la table donnee (Liquibase)"
exposition_api = "GET /api/v1/donnees"
interaction_ihm = "Clic sur le bouton, puis appel de l'API"

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

## 8. Contrôles

- La section `[validation]` du référentiel énumère les règles d'un ticket ; l'IA les vérifie avant de présenter `ticket.toml` (D10.INV-2).
- Scénarios R11 à R14 du point d'entrée.
- À la publication : le modèle se lit en TOML, et l'exemple d'instance respecte toutes ses règles de validation (point d'entrée, section 16).
