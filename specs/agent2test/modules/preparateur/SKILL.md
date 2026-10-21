---
name: preparateur
description: Mise en place de l'exécution (profil d'environnement proposé avec la provenance de chaque valeur et ratifié en CP-2, parcours JSON au jeu d'actions fermé produits par le moteur à partir des étapes des scénarios, contrôles nommés, préfixe des données, cibles ordonnées, origine des productions, exécution probatoire avec preuves, versions, réparation bornée avec désignation par l'opérateur). Agent cognitif, à implémenter au lot 4.
dimensions: [D7]
status: active
---

# Module `preparateur` (D7)

Le `preparateur` rend jouables les scénarios retenus. Il fait rédiger les parcours par le moteur, les valide, les essaie, et les présente à la ratification. Il ne joue rien en campagne.

## 1. Profil d'environnement (D7.INV-5)

`amorcer(projet)` propose le profil à partir de `scanner.configuration()` et de la configuration humaine :

| Champ | Exemple | Provenance |
|---|---|---|
| `profil` | `local` | constant en 1.0.0 (D18.INV-4) |
| `urlBase` | `http://localhost:4200` | `angular.json`, `proxy.conf.json` |
| `urlApi` | `http://localhost:8080` | `proxy.conf.json` |
| `urlSante` | `http://localhost:8080/actuator/health` | `application.yml`, ou « à renseigner » |
| `urlProtegee` | `/retours` | carte, première route gardée |
| `originesAutorisees` | application, API, fournisseur SSO | configuration humaine |
| `origineSso` | `https://sso.exemple.local` | configuration humaine |
| `strategieSession` | `integree` | configuration humaine |
| `attributIdentifiantTest` | `data-testid` | gabarits du projet |
| `fichiersTraduction` | `src/assets/i18n/fr.json` | `angular.json` |
| `masques` | par écran, liste de cibles à masquer | « à renseigner » |
| `racineProjet` | chemin du projet de l'application | configuration humaine |

Chaque valeur cite le fichier du projet dont elle vient, ou porte la marque « à renseigner ». Aucune campagne ne s'exécute tant que le profil n'est pas ratifié en CP-2 ; toute modification du profil crée une version nouvelle, à ratifier.

## 2. Schéma des parcours (D7.INV-1 à D7.INV-4, D7.INV-7)

```json
{
  "id": "P/ECR-77-S01",
  "version": 2,
  "scenario": "ECR-77-S01",
  "empreinteScenario": "<sha256 des étapes du scénario>",
  "criteres": ["ECR-77-CA01"],
  "origine": { "moteur": "gemini", "fiche": "preparateur@1.0.0+L2", "empreintePrompt": "<sha256>", "ratifiePar": "testeur", "ratifieLe": "2026-10-21" },
  "donnees": { "filtre": "A2T-{campagne}-export" },
  "etapes": [
    { "n": 1, "action": "naviguer", "url": "/retours" },
    { "n": 2, "action": "saisir", "cible": { "label": "Rechercher" }, "valeur": "{filtre}" },
    { "n": 3, "action": "cliquer", "cible": { "role": "button", "nom": "Exporter en CSV" } },
    { "n": 4, "action": "verifier", "critere": "ECR-77-CA01",
      "cible": { "role": "status" }, "attendu": { "contient": "retours-experience.csv" } }
  ]
}
```

Schéma fermé `schemas/parcours.json` et contrôles nommés :

| Contrôle | Règle |
|---|---|
| `parcours.actions-fermees` | chaque action appartient au jeu fermé du module `navigateur` ; `auditer` est rejetée « action réservée » (point E2) |
| `parcours.verifier-par-critere` | chaque critère de `criteres` est porté par au moins une étape `verifier` (D7.INV-2) |
| `parcours.prefixe-mutation` | dans un parcours qui comporte une mutation, toute valeur textuelle saisie commence par `A2T-{campagne}-` ; une valeur non textuelle déclare son `format` (nombre, date, option) ; la cible d'une `suppression` contient une donnée préfixée (D7.INV-3) |
| `parcours.cibles-ordonnees` | chaque cible emploie la première stratégie disponible dans l'ordre du profil ; une cible `css` porte un `motif` et entre dans les fragilités (D7.INV-7) |
| `parcours.origine` | `origine` est complet : moteur, fiche et version composée, empreinte du prompt ; `ratifiePar` et `ratifieLe` sont remplis à la ratification (D7.INV-4) |
| `parcours.urls` | chaque `naviguer` vise une URL relative à l'URL de base |

## 3. Préparer (D7.INV-6)

`preparer(selection)` traite chaque scénario retenu :

1. Un parcours ratifié dont `empreinteScenario` égale celle du scénario courant est repris tel quel ; il ne repasse pas par CP-2.
2. Sinon, le moteur rédige le parcours (fiche `preparateur`) à partir des étapes du scénario, de ses critères, de la carte des écrans concernés (instantanés ARIA), du profil et des leçons actives.
3. La sortie est validée (D1.INV-3). Une sortie non conforme revient au moteur avec la liste de ses écarts, 3 fois au plus ; au-delà, CP-2 présente l'échec.
4. Chaque cible est résolue dans la carte de l'écran attendu (`navigateur.resoudre`), ou porte la marque « non résolue ».
5. Exécution probatoire (`navigateur.jouer(parcours, 'probatoire')`) : trace et capture par étape `verifier`.
6. CP-2 présente côte à côte le parcours, son résultat probatoire et ses preuves.

Un parcours ratifié qu'on modifie devient une version nouvelle, soumise à CP-2 (D7.INV-5).

## 4. Réparer (D7.INV-6)

`reparer(parcours, diagnostic)`, déclenché par un `DEFAUT_PARCOURS` ou par une demande en CP-3 :

- part du diagnostic de l'échec et d'un relevé neuf de l'écran concerné ;
- peut s'appuyer sur la désignation de l'élément par l'opérateur (`navigateur.designer`) ; la cible est construite à partir de cette désignation ;
- fait rédiger la correction par la fiche `reparation`, la valide, l'essaie ;
- crée une version nouvelle, soumise à CP-2 ;
- 2 réparations au plus par parcours et par campagne ; au-delà, CP-3 présente le parcours « non réparé ».

## 5. Actions et événements

| Action | Rôle |
|---|---|
| `amorcer(projet)` | profil d'environnement proposé |
| `preparer(selection)` | parcours repris ou rédigés, validés, essayés |
| `reparer(parcours, diagnostic)` | version réparée |

Événements : `profil.propose`, `parcours.propose`, `parcours.non_repare`.

## 6. Pièges connus

- **Parcours écrit en code** : un parcours est une donnée ; un champ `script` est un écart.
- **Préfixe oublié dans une donnée de recherche** : sans mutation, la saisie n'a pas besoin de préfixe ; avec mutation, toute valeur textuelle en porte un.
- **Ratification implicite** : un parcours non ratifié n'est jamais joué en campagne, même s'il a réussi à l'essai.

## 7. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| PR1 | D7.INV-1 | un parcours avec une action `executer` est rejeté avant toute exécution |
| PR2 | D7.INV-1 | un parcours avec un champ inconnu est rejeté ; ses écarts sont listés |
| PR3 | D7.INV-2 | un parcours qui couvre deux critères mais n'en vérifie qu'un est rejeté |
| PR4 | D7.INV-3 | dans un parcours de création, une saisie « Nouveau contrat » sans préfixe est rejetée |
| PR5 | D7.INV-4 | un parcours sans empreinte de prompt est rejeté ; à la ratification, `ratifiePar` est rempli |
| PR6 | D7.INV-5 | un parcours essayé avec succès mais non ratifié n'est pas joué en campagne |
| PR7 | D7.INV-5 | un parcours ratifié et inchangé n'ouvre pas CP-2 ; une modification crée la version 3 et ouvre CP-2 |
| PR8 | D7.INV-6 | trois sorties non conformes de suite mènent CP-2 à présenter l'échec ; il n'y a pas de quatrième appel |
| PR9 | D7.INV-6 | une troisième réparation du même parcours dans la campagne est refusée ; CP-3 le présente « non réparé » |
| PR10 | D7.INV-7 | une cible CSS sans motif est rejetée ; avec un motif, elle est acceptée et entre dans les fragilités |
| PR11 | D7.INV-5 | le profil proposé cite la provenance de chaque valeur ou porte « à renseigner » ; une campagne attend sa ratification |
| PR12 | D7.INV-6 | une réparation part d'un relevé neuf de l'écran et du diagnostic, et peut reprendre la cible désignée par l'opérateur |
| PR13 | point E2 | un parcours qui contient une étape `auditer` est rejeté « action réservée » |

## 8. Fichiers à produire

- `src/agents/preparateur/agent.js`, `src/agents/preparateur/profil.js`, `src/agents/preparateur/generation.js`, `src/agents/preparateur/reparation.js`
- `schemas/parcours.json`, `schemas/profil-environnement.json`, contrôles nommés dans `src/noyau/controles.js`
- `test/preparateur/*.test.js`
