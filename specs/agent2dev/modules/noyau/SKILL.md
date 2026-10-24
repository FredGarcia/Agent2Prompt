---
name: noyau
description: Noyau immuable d'Agent2Dev (cycle 7E récursif aux échelles Système, Demande, Scénario et Pas, cellule 7E de chaque agent, bus à contrats déclarés, validateur de schémas fermés et de contrôles nommés, constitution vérifiée par empreinte au démarrage, port moteur, garde de périmètre et garde d'écriture des fichiers d'Agent2Dev). À lire en premier ; à implémenter au lot 1.
dimensions: [D1]
status: active
---

# Module `noyau` (D1)

Le noyau est une bibliothèque, pas un agent. Tous les agents en héritent ; aucun ne le modifie. Il ne dépend d'aucun autre module. Il suit la même forme que le noyau d'Agent2Test (`agent2test:D1.INV-1`), pour que les deux têtes se lisent de la même façon ; il n'en partage aucun code.

## 1. Cycle 7E (D1.INV-1)

Une seule classe, `Cycle7E`, sert aux quatre échelles. Une échelle est une spécialisation, pas un module.

```js
class Cycle7E {
  constructor({ echelle, contexte, journal }) {}
  async elements(entree) {}     // E1 : recenser, valider, figer pour le cycle
  async espace(elements) {}     // E2 : situer (fichiers, fiche composée, règles épinglées)
  async engendrer(espace) {}    // E3 : produire ; à l'échelle n, déroule les cycles de l'échelle n − 1
  async etat(produits) {}       // E4 : constater par rapport à l'attendu
  async expression(etat) {}     // E5 : rendre lisible et opposable
  async evolutif(expression) {} // E6 : ajuster dans le budget du premier ordre
  async environnement(bilan) {} // E7 : remonter au niveau englobant
  async derouler(entree) {}     // enchaîne E1 à E7 et journalise chaque phase
}
```

| Échelle | Classe | Instanciée par | E3 |
|---|---|---|---|
| Système | `CycleSysteme` | `orchestrateur` | cycles de demandes, un à la fois |
| Demande | `CycleDemande` | `orchestrateur` | V0, V1, V2, impact, V3, cycles de scénarios, acceptation, V5 |
| Scénario | `CycleScenario` | `realisation` | pas `contrat`, `rouge`, `vert`, `remanie`, puis suites et V4 |
| Pas | `CyclePas` | agent de l'étape | rédaction par le moteur, validation, écriture par le `depot`, commande par l'`executant` |

Règles :

- `derouler` appelle les sept méthodes dans l'ordre. Une phase sans objet s'exécute quand même et se journalise `vide` ; aucune phase n'est sautée.
- Une erreur levée en E3 ne rompt pas le cycle : E4 constate l'erreur, E5 l'exprime, E6 décide d'un nouvel essai dans le budget, E7 remonte le résultat.
- La valeur rendue par l'E7 d'un cycle enfant est versée à l'E4 du cycle parent.
- Chaque phase écrit une ligne de journal avec `echelle`, `phase`, durée et identifiant du cycle parent.
- Un point de validation est une attente dans l'E3 de la demande : le cycle s'y arrête jusqu'à la décision, puis reprend (module `orchestrateur`).

## 2. Cellule 7E

`Cellule7E` est la classe de base de chaque agent. Chaque message reçu est un cycle :

| E1 | E2 | E3 | E4 | E5 | E6 | E7 |
|---|---|---|---|---|---|---|
| valider l'entrée contre le contrat | charger fiche et règles épinglées | agir : moteur, écriture, commande | valider la sortie : schéma, contrôles nommés | répondre, publier | corriger dans le budget | remettre la trace au bus |

La trace porte le vecteur des sept durées, en millisecondes. Un agent déterministe laisse vides E2 et E6 s'ils sont sans objet ; la forme ne change pas.

## 3. Bus (D1.INV-2)

```js
bus.demander(cible, action, charge, contexte, { delaiMs }) // appel nommé : réponse, trace, délai de garde
bus.publier(type, charge, contexte)                        // événement sans réponse
bus.tracer(fn)                                             // reçoit chaque appel terminé, succès ou échec
bus.abonner(fn)                                            // reçoit chaque événement
```

Contexte propagé : `{ correlation, demande, scenario, echelle, phase, parent, appelant }`. `parent` construit l'arbre des traces. `appelant` est posé par le bus : c'est l'agent qui appelle, jamais une valeur qu'il fournit ; l'agent médiateur des données s'y fie (module `donnees`).

Chaque agent déclare son contrat au démarrage :

```js
export const contrat = {
  agent: 'depot',
  actions: {
    appliquer: { entree: 'depot.appliquer.entree', sortie: 'depot.appliquer.sortie' },
    chercher: { entree: 'depot.chercher.entree', sortie: 'depot.chercher.sortie' }
  },
  evenements: ['depot.ecrit', 'depot.ecriture_etrangere'],
  appelle: ['journal.ecrire']
};
```

- Le bus refuse un appel vers une action non déclarée, un appel que l'appelant n'a pas déclaré dans `appelle`, et un événement non déclaré. Le refus est une erreur nommée, `APPEL_NON_DECLARE`, journalisée.
- Les entrées et sorties sont validées par le validateur contre les schémas nommés du contrat.
- Délai de garde par défaut : 30 secondes ; une commande de l'`executant` porte le délai de son profil. Au-delà, le bus rend `DELAI_DEPASSE`.
- Le bus tient le graphe des appels effectifs ; l'`observateur` s'en sert.
- Un agent ne reçoit qu'une poignée vers le bus. Aucun fichier de `src/agents/<a>/` n'importe un fichier de `src/agents/<b>/` ; un test le vérifie sur les sources.

## 4. Validateur (D1.INV-3)

Le validateur est écrit dans le noyau, sans dépendance : il couvre le sous-ensemble de JSON Schema employé par la spécification (`type`, `properties`, `required`, `additionalProperties: false`, `enum`, `const`, `pattern`, `items`, `minItems`, `maxItems`, `minimum`, `maximum`, `oneOf`). Tous les schémas sont fermés : `additionalProperties` vaut `false` partout.

Les contrôles nommés complètent les schémas, par exemple `realisation.test-etiquete` ou `depot.chemin-sous-racine`. Chacun est une fonction pure, enregistrée sous son nom, qui rend une liste d'écarts.

Le résultat est une liste d'écarts `{ chemin, regle, message }`. Une liste non vide interdit de consommer la sortie : l'agent la renvoie au moteur dans son budget (E6), ou présente l'échec au développeur.

## 5. Constitution (D1.INV-4, D1.INV-6)

`constitution/constitution.json` est le point fixe du système :

```json
{
  "version": "1.0.0",
  "methode": { "skill": "agent-tdd-jira", "version": "1.3.2" },
  "invariants": ["D1.INV-1", "D1.INV-2"],
  "points": ["V0", "V1", "V2", "V3", "V4", "V5", "CP-4"],
  "reglesModifiables": [
    { "regle": "budget.tentativesSortie", "bornes": { "min": 1, "max": 3 } },
    { "regle": "budget.tentativesPas", "bornes": { "min": 1, "max": 5 } }
  ],
  "metaCriteres": { "fenetre": 10, "expositionMin": 3, "marge": 15 },
  "intentionsRefusees": ["demarrer", "arreter", "deployer", "batch", "administrer", "ecrire-en-base", "ecrire-dans-jira"],
  "commandes": {
    "noms": ["compiler-back", "tester-back", "tester-scenario-back", "installer-front", "compiler-front", "tester-front", "tester-scenario-front", "linter-front", "regenerer-contrat"],
    "programmesInterdits": ["docker", "kubectl", "oc", "helm", "ansible", "ansible-playbook", "catalina.sh", "startup.sh", "shutdown.sh"],
    "argumentsInterdits": ["spring-boot:run", "spring-boot:start", "cargo:run", "cargo:deploy", "tomcat7:run", "jetty:run", "deploy", "exec:java"]
  }
}
```

La liste complète des règles modifiables et de leurs bornes est au module `referentiel`, section 4 ; la constitution la recopie. Elle porte aussi la liste fermée des motifs de leçons interdites (module `apprenant`, section 2).

- L'empreinte est le SHA-256 de la constitution sérialisée en JSON canonique (clés triées, sans espace).
- Au démarrage, le noyau compare cette empreinte à la dernière entrée `constitution.publiee` du grand livre. Un écart, ou l'absence d'entrée, empêche le démarrage avec le message « constitution non publiée ou modifiée : publier par `npm run constitution:publier` ».
- La publication est une commande humaine, hors du bus : `npm run constitution:publier` inscrit l'empreinte au grand livre. Aucun agent ne l'appelle.

Garde d'écriture des fichiers d'Agent2Dev : le noyau expose `ecriture.autoriser(chemin, agent)`. Seuls sont permis :

- pour le seul `donnees`, l'agent médiateur, le fichier de données de l'instance (module `donnees`) ;
- pour le seul `journal`, le livrable, dans le dossier de sortie de la demande ;
- pour le seul `depot`, le dossier de travail de la demande (scripts extraits, `demande.json` et ses compléments, `impact.txt`, journaux de tests relevés par l'échange, patchs, rapport, projet de commentaire), le dossier des copies de travail et la boîte de sortie de l'échange (module `echange`) ;
- pour le seul `profil`, la création d'une version nouvelle de profil ratifié, à la décision V0 ; un profil ratifié n'est jamais réécrit.

Les autres agents rédigent ou calculent ces contenus, et les remettent au `depot` par le bus.

Toute autre écriture, et en particulier `constitution/`, `src/`, `schemas/`, `fiches/`, la configuration humaine, un profil ratifié existant et la transmission du skill, est refusée avec l'erreur `ECRITURE_INTERDITE`. L'écriture dans un arbre du projet, copie de travail comprise, relève du seul `depot`, avec ses propres gardes (module `depot`).

## 6. Port moteur

```js
moteur.completer({ systeme, message, schema, fiche, version }) // → { texte, usage, moteur }
```

Le noyau définit l'interface et choisit l'adaptateur d'après la configuration ; les adaptateurs sont au module `mcp`. La sortie `texte` est toujours analysée en JSON puis passée au validateur avant usage (D1.INV-3). Agent2Dev ne donne au moteur aucun accès au projet, au bus ni à un outil : il lui transmet un prompt et en reçoit un texte. L'agent de l'IDE garde ses propres accès à l'espace de travail du développeur ; `GEMINI.md` et la configuration de l'IDE les restreignent (module `mcp`, section 6), et le `depot` détecte toute écriture qui ne vient pas de lui (D5.INV-3).

## 7. Garde de périmètre (D1.INV-5)

`perimetre.verifier(demande)` est appelé par l'`orchestrateur` quand une demande entre :

- l'entrée doit être un fichier MHTML d'une demande Jira, et le projet visé doit avoir un profil ratifié, ou passer d'abord par V0 ;
- le texte extrait est confronté aux intentions refusées de la constitution : une demande dont l'objet est de démarrer, d'arrêter ou de déployer l'application, de lancer un batch, d'administrer un environnement, d'écrire en base ou dans Jira est refusée avec le motif « hors périmètre ». Une demande qui modifie du code est le cas nominal.

Le refus est présenté au développeur ; la demande ne démarre pas.

## 8. Pièges connus

- **Orchestrateur par échelle** : il n'y en a qu'un ; une échelle est une spécialisation de `Cycle7E`.
- **Phase sautée sur erreur** : une erreur en E3 se traite en E4 et E6, pas par un `return` anticipé.
- **Validateur indulgent** : un champ inconnu est un écart, jamais un champ ignoré.
- **Publication automatique de la constitution** : jamais au démarrage, jamais par un agent.
- **Moteur outillé** : un adaptateur ne donne au moteur aucun outil de lecture, d'écriture ni d'exécution ; il ne passe qu'un prompt.

## 9. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| NO1 | D1.INV-1 | un cycle à quatre échelles journalise sept phases par échelle, dans l'ordre, l'E7 de l'enfant versé à l'E4 du parent |
| NO2 | D1.INV-1 | une erreur levée en E3 produit quand même E4 à E7, et une phase sans objet se journalise `vide` |
| NO3 | D1.INV-2 | un appel vers une action non déclarée est refusé `APPEL_NON_DECLARE` et journalisé |
| NO4 | D1.INV-2 | un appel non déclaré dans `appelle` est refusé ; un événement non déclaré est refusé |
| NO5 | D1.INV-2 | aucun fichier de `src/agents/<a>/` n'importe `src/agents/<b>/` (analyse des sources) |
| NO6 | D1.INV-3 | une sortie du moteur avec un champ inconnu, ou un contrôle nommé en échec, n'est pas consommée et ses écarts sont listés |
| NO7 | D1.INV-4 | une constitution modifiée d'un caractère empêche le démarrage avec le message prévu |
| NO8 | D1.INV-4 | sans entrée `constitution.publiee` au grand livre, le démarrage est refusé |
| NO9 | D1.INV-5 | une demande « redémarrer l'application en recette » est refusée « hors périmètre » ; une demande d'évolution de code est acceptée |
| NO10 | D1.INV-5 | un fichier qui n'est pas un MHTML de Jira est refusé à l'entrée |
| NO11 | D1.INV-6 | une tentative d'écriture d'un agent dans `constitution/`, dans la configuration humaine ou dans la transmission du skill est refusée `ECRITURE_INTERDITE` |
| NO12 | D1.INV-6 | le `profil` crée `v2.json` à une ratification ; une réécriture de `v1.json`, ou une écriture d'un autre agent sous `profils/`, est refusée `ECRITURE_INTERDITE` |

## 10. Fichiers à produire

- `src/noyau/cycle7e.js`, `src/noyau/echelles.js`, `src/noyau/cellule7e.js`
- `src/noyau/bus.js`, `src/noyau/contrats.js`
- `src/noyau/validateur.js`, `src/noyau/controles.js`, `schemas/` (un fichier par schéma nommé)
- `src/noyau/constitution.js`, `constitution/constitution.json`, `scripts/publier-constitution.js`
- `src/noyau/moteur.js` (interface et choix de l'adaptateur)
- `src/noyau/perimetre.js`, `src/noyau/ecriture.js`
- `test/noyau/*.test.js`
