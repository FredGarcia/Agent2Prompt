---
name: noyau
description: Noyau immuable d'Agent2Test (cycle 7E récursif à quatre échelles, cellule 7E de chaque agent, bus à contrats déclarés, validateur de schémas fermés et de contrôles nommés, constitution vérifiée par empreinte au démarrage, port moteur, garde de périmètre et garde d'écriture). À lire en premier ; à implémenter au lot 1.
dimensions: [D1]
status: active
---

# Module `noyau` (D1)

Le noyau est une bibliothèque, pas un agent. Tous les agents en héritent ; aucun ne le modifie. Il ne dépend d'aucun autre module.

## 1. Cycle 7E (D1.INV-1)

Une seule classe, `Cycle7E`, sert aux quatre échelles. Une échelle est une spécialisation, pas un module.

```js
class Cycle7E {
  constructor({ echelle, contexte, journal }) {}
  async elements(entree) {}     // E1 : recenser, valider, figer pour le cycle
  async espace(elements) {}     // E2 : situer (carte, session, mémoire, règles épinglées)
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
| Système | `CycleSysteme` | `orchestrateur` | cycles de campagnes |
| Campagne | `CycleCampagne` | `orchestrateur` | sélection, parcours, cycles de scénarios |
| Scénario | `CycleScenario` | `orchestrateur` | cycles d'étapes |
| Étape | `CycleEtape` | `navigateur` | acte Playwright |

Règles :

- `derouler` appelle les sept méthodes dans l'ordre. Une phase sans objet s'exécute quand même et se journalise `vide` ; aucune phase n'est sautée.
- Une erreur levée en E3 ne rompt pas le cycle : E4 constate l'erreur, E5 l'exprime, E6 décide d'un nouvel essai dans le budget, E7 remonte le résultat.
- La valeur rendue par l'E7 d'un cycle enfant est versée à l'E4 du cycle parent.
- Chaque phase écrit une ligne de journal avec `echelle`, `phase`, durée et identifiant du cycle parent.

## 2. Cellule 7E

`Cellule7E` est la classe de base de chaque agent. Chaque message reçu est un cycle :

| E1 | E2 | E3 | E4 | E5 | E6 | E7 |
|---|---|---|---|---|---|---|
| valider l'entrée contre le contrat | charger fiche, mémoire et règles épinglées | agir : outil, moteur, contrat SQL | valider la sortie : schéma, contrôles nommés | répondre, publier | corriger dans le budget | remettre la trace au bus |

La trace porte le vecteur des sept durées, en millisecondes. Un agent déterministe laisse vides E2 et E6 s'ils sont sans objet ; la forme ne change pas.

## 3. Bus (D1.INV-2)

```js
bus.demander(cible, action, charge, contexte, { delaiMs }) // appel nommé : réponse, trace, délai de garde
bus.publier(type, charge, contexte)                        // événement sans réponse
bus.tracer(fn)                                             // reçoit chaque appel terminé, succès ou échec
bus.abonner(fn)                                            // reçoit chaque événement
```

Contexte propagé : `{ correlation, campagne, echelle, phase, parent, appelant }`. `parent` construit l'arbre des traces ; `appelant` permet à `donnees` de choisir le rôle PostgreSQL.

Chaque agent déclare son contrat au démarrage :

```js
export const contrat = {
  agent: 'verdict',
  actions: {
    juger: { entree: 'verdict.juger.entree', sortie: 'verdict.juger.sortie' }
  },
  evenements: ['verdict.rendu'],
  appelle: ['journal.ecrire', 'donnees.executer']
};
```

- Le bus refuse un appel vers une action non déclarée, un appel que l'appelant n'a pas déclaré dans `appelle`, et un événement non déclaré. Le refus est une erreur nommée, `APPEL_NON_DECLARE`, journalisée.
- Les entrées et sorties sont validées par le validateur contre les schémas nommés du contrat.
- Délai de garde par défaut : 30 secondes ; une action le dépasse, le bus rend `DELAI_DEPASSE`.
- Le bus tient le graphe des appels effectifs ; `observateur` s'en sert pour D11.INV-3.
- Un agent ne reçoit qu'une poignée vers le bus. Aucun fichier de `src/agents/<a>/` n'importe un fichier de `src/agents/<b>/` ; un test le vérifie sur les sources.

## 4. Validateur (D1.INV-3)

Le validateur est écrit dans le noyau, sans dépendance : il couvre le sous-ensemble de JSON Schema employé par la spécification (`type`, `properties`, `required`, `additionalProperties: false`, `enum`, `const`, `pattern`, `items`, `minItems`, `maxItems`, `minimum`, `maximum`, `oneOf`). Tous les schémas sont fermés : `additionalProperties` vaut `false` partout.

Les contrôles nommés complètent les schémas, par exemple `parcours.verifier-par-critere` ou `parcours.prefixe-mutation`. Chacun est une fonction pure, enregistrée sous son nom.

Le résultat est une liste d'écarts `{ chemin, regle, message }`. Une liste non vide interdit de consommer la sortie : l'agent la renvoie au moteur dans son budget (E6), ou présente l'échec au point de contrôle.

## 5. Constitution (D1.INV-4, D1.INV-6)

`constitution/constitution.json` est le point fixe du système :

```json
{
  "version": "1.0.0",
  "invariants": ["D1.INV-1", "D1.INV-2"],
  "pointsDeControle": ["CP-0", "CP-1", "CP-2", "CP-3", "CP-4", "CP-5"],
  "reglesModifiables": [
    { "regle": "selection.poids", "bornes": { "min": 0, "max": 1 } },
    { "regle": "budget.reessaiEtape", "bornes": { "min": 0, "max": 2 } }
  ],
  "metaCriteres": { "fenetre": 10, "expositionMin": 3, "marge": 15 }
}
```

La liste complète des règles modifiables et de leurs bornes est au module `referentiel`, section 4 ; la constitution la recopie.

- L'empreinte est le SHA-256 de la constitution sérialisée en JSON canonique (clés triées, sans espace).
- Au démarrage, le noyau compare cette empreinte à la dernière entrée `constitution.publiee` du grand livre. Un écart, ou l'absence d'entrée, empêche le démarrage avec le message « constitution non publiée ou modifiée : publier par `npm run constitution:publier` ».
- La publication est une commande humaine, hors du bus : `npm run constitution:publier` inscrit l'empreinte au grand livre. Aucun agent ne l'appelle.

Garde d'écriture : le noyau expose `ecriture.autoriser(chemin, agent)`. Seuls sont permis le dossier des preuves (`navigateur`, `journal`), le fichier de session (`navigateur`) et les exports du journal de tests (`journal`). Toute autre écriture, et en particulier `constitution/`, `src/`, `migrations/`, `fiches/` et `configuration/`, est refusée avec l'erreur `ECRITURE_INTERDITE`.

## 6. Port moteur

```js
moteur.completer({ systeme, message, schema, fiche, version }) // → { texte, usage }
```

Le noyau définit l'interface et choisit l'adaptateur d'après la configuration ; les adaptateurs sont au module `mcp`. La sortie `texte` est toujours analysée en JSON puis passée au validateur avant usage (D1.INV-3).

## 7. Garde de périmètre (D1.INV-5)

`perimetre.verifier(demande)` est appelé par `plan` à l'ouverture d'une campagne. Une demande est refusée avec le motif « hors périmètre » quand son objet n'est pas de tester, ou quand son texte demande de modifier du code, de déployer, d'administrer ou d'écrire en base. La liste des intentions refusées est dans la constitution.

## 8. Pièges connus

- **Orchestrateur par échelle** : il n'y en a qu'un ; une échelle est une spécialisation de `Cycle7E`.
- **Phase sautée sur erreur** : une erreur en E3 se traite en E4 et E6, pas par un `return` anticipé.
- **Validateur indulgent** : un champ inconnu est un écart, jamais un champ ignoré.
- **Publication automatique de la constitution** : jamais au démarrage, jamais par un agent.

## 9. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| NO1 | D1.INV-1 | un cycle à deux échelles journalise sept phases par échelle, dans l'ordre, l'E7 de l'enfant versé à l'E4 du parent |
| NO2 | D1.INV-1 | une erreur levée en E3 produit quand même E4 à E7, et une phase sans objet se journalise `vide` |
| NO3 | D1.INV-2 | un appel vers une action non déclarée est refusé `APPEL_NON_DECLARE` et journalisé |
| NO4 | D1.INV-2 | un appel non déclaré dans `appelle` est refusé ; un événement non déclaré est refusé |
| NO5 | D1.INV-2 | aucun fichier de `src/agents/<a>/` n'importe `src/agents/<b>/` (analyse des sources) |
| NO6 | D1.INV-3 | une sortie du moteur avec un champ inconnu, ou un contrôle nommé en échec, n'est pas consommée et ses écarts sont listés |
| NO7 | D1.INV-4 | une constitution modifiée d'un caractère empêche le démarrage avec le message prévu |
| NO8 | D1.INV-4 | sans entrée `constitution.publiee` au grand livre, le démarrage est refusé |
| NO9 | D1.INV-5 | une demande « corriger le code du composant » est refusée « hors périmètre » ; une demande de test est acceptée |
| NO10 | D1.INV-6 | une tentative d'écriture d'un agent dans `constitution/` ou `configuration/` est refusée `ECRITURE_INTERDITE` |

## 10. Fichiers à produire

- `src/noyau/cycle7e.js`, `src/noyau/echelles.js`, `src/noyau/cellule7e.js`
- `src/noyau/bus.js`, `src/noyau/contrats.js`
- `src/noyau/validateur.js`, `src/noyau/controles.js`, `schemas/` (un fichier par schéma nommé)
- `src/noyau/constitution.js`, `constitution/constitution.json`, `scripts/publier-constitution.js`
- `src/noyau/moteur.js` (interface et choix de l'adaptateur)
- `src/noyau/perimetre.js`, `src/noyau/ecriture.js`
- `test/noyau/*.test.js`
