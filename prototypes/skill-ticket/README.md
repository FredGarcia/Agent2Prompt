# Prototype : skill de ticket C7E

**Statut** : lot 1 livré, modèle et vérification de l'arbre. Les lots 2 à 6 suivent, chacun validé par le développeur. Rien ici n'est encore une spécification versionnée : le prototype reste hors de `specs/` jusqu'à son bilan, après quoi il entrera dans l'orchestrateur C7E, probablement en version majeure, ou dans une spécification de générateur à part.

## Objet

Un ticket n'est plus résolu directement par l'orchestrateur : il l'est par un **skill de ticket** et ses agents, produits pour lui sur le même modèle fractal et récursif C7E. Le générateur qualifie le ticket, le décompose en sous-tickets, puis assemble pour chaque nœud un skill à partir des blocs ratifiés du référentiel des méso-contrats. Chaque skill s'observe par rapport aux retours de l'humain : ses choix parmi les options proposées et ses corrections sur les actions.

Le prototype prouve la boucle sur un cas du référentiel, sans encore résoudre de ticket dans une application réelle.

## Décisions ratifiées le 8 novembre 2026

1. Le skill de ticket est **assemblé depuis le référentiel** ; le modèle n'écrit que ce qui est propre au ticket (objectif, critères, repérage).
2. Le skill de ticket **remplace la fiche de transformation** comme objet validé avant tout code.
3. Les sous-tickets vont sur **n niveaux** (Composite), avec un **plafond de sécurité réglable**, 3 par défaut.
4. Un sous-ticket n'a **qu'un seul parent** : la décomposition est un arbre, les dépendances un graphe sans cycle.
5. L'exécution est **lancée par l'installateur, dans Gemini CLI**.
6. La référence de toute auto-observation est un **retour humain** (choix ou correction) ou une preuve, jamais l'auto-évaluation seule.
7. Une **fabrique abstraite de skill-ticket**, avec une fabrique concrète par pile technique ; le choix des méso-contrats reste le travail du Monteur.
8. Pour le prototype : ordre d'observation maximal 3 plus l'humain, et un contexte séparé par agent, à revoir au bilan.
9. Ratification : l'arbre une fois, sur le skill parent, puis chaque feuille avant sa première action ; les nœuds intermédiaires ne font que coordonner.

## Arbre d'essai : ABCDE-3620 sur trois niveaux

Le ticket ABCDE-3620 du référentiel (module `referentiel` de l'orchestrateur, § 7.2), décomposé en `exemples/ABCDE-3620/` :

```text
ABCDE-3620 · M04 · 5 critères
├─ ABCDE-3620-1 · M04 · 5 critères
│  ├─ ABCDE-3620-1.1 · M02 · 2 critères
│  └─ ABCDE-3620-1.2 · M04 · 4 critères · dépend de ABCDE-3620-1.1
└─ ABCDE-3620-2 · M03 · 2 critères · dépend de ABCDE-3620-1.2

Ordre de résolution :
   1. ABCDE-3620-1.1  résoudre
   2. ABCDE-3620-1.2  résoudre
   3. ABCDE-3620-1    clore
   4. ABCDE-3620-2    résoudre
   5. ABCDE-3620      clore
```

Chaque méso-contrat sort de la règle de choix du référentiel, appliquée à la demande du nœud. La dépendance du front vise un sous-ticket de l'autre branche : les dépendances se vérifient indépendamment de l'arbre.

## Format d'un nœud

Un fichier TOML par nœud, au format de `ticket.toml` du module `referentiel`, complété de trois éléments :

| Champ | Contenu |
|---|---|
| `reference` | identifiant unique du ticket |
| `parent` | référence du parent, une seule ; absent pour la racine |
| `depend_de` | références des tickets dont celui-ci attend la clôture ; ni un ancêtre, ni un descendant |
| `referentiel`, `meso_contrat`, `complements`, `meso_contrat_confirme`, `titre` | comme dans `ticket.toml` |
| `[ticket.demande]` | l'intention, la maquette et les dix-sept possibilités, avec leurs sources |
| `[[ticket.criteres]]` | `id`, `enonce`, et `soutient` : les critères du parent direct que ce critère soutient (absent pour la racine) |
| options par couche | sur les feuilles seulement : un nœud composé ne porte pas d'option, ses sous-tickets les portent |

## Règles vérifiées

**Sur chaque nœud, les règles du référentiel** (section `[validation]` du modèle) : demande complète et sourcée ; aucune inconnue dont la réponse changerait la composition ; composition conforme à la règle de choix, principal et compléments ; composition confirmée avant toute option ; options rattachées à un méso-contrat de la composition, permises par son empreinte, avec leurs paramètres et leurs catalogues ; couches requises du principal couvertes. Les méso-contrats transverses s'appliquent selon les couches touchées par l'arbre.

**Sur l'arbre, les règles de la décomposition** :

| Règle | Contenu |
|---|---|
| A1 | références uniques ; chaque fichier porte une table `[ticket]` et une référence |
| A2 | un seul parent, présent dans l'arbre |
| A3 | une seule racine, et chaque nœud relié à elle (pas de cycle de parenté) |
| A4 | profondeur au plus égale au plafond (`--profondeur-max`, ou `[decomposition] profondeur_max` du référentiel, 3 par défaut) |
| A5 | dépendances vers des tickets présents, ni soi-même, ni un ancêtre, ni un descendant ; aucun cycle, ni entre dépendances, ni entre dépendances et clôtures |
| A6 | chaque possibilité à oui d'un nœud composé est portée par au moins un de ses sous-tickets |
| A7 | un sous-ticket ne met à oui aucune possibilité absente de son parent : sinon, retour à la qualification du parent |
| A8 | critères uniques ; la racine ne soutient rien ; chaque critère d'un sous-ticket soutient un critère de son parent direct ; chaque critère d'un nœud composé est soutenu |
| A9 | un nœud composé ne porte pas d'option ; ses couches requises sont couvertes par les options de ses feuilles |

## Commandes

Depuis la racine du dépôt, sans dépendance : Node 20 ou plus récent pour l'outil, Node 22 ou plus récent pour la recette (motifs de fichiers de `node --test`) :

```bash
node prototypes/skill-ticket/outils/arbre.mjs verifier prototypes/skill-ticket/exemples/ABCDE-3620
node prototypes/skill-ticket/outils/arbre.mjs plan prototypes/skill-ticket/exemples/ABCDE-3620
node --test "prototypes/skill-ticket/tests/*.test.mjs"
```

Sous Windows, les mêmes commandes passent dans PowerShell, avec `\` ou `/` dans les chemins. `--referentiel <chemin>` lit un `referentiel-meso-contrats.toml` de projet au lieu du modèle de l'orchestrateur ; `--profondeur-max <n>` change le plafond. Code de sortie 1 au moindre écart, 2 pour un usage incorrect.

## Architecture et patrons

| Composant | Patron | Lot |
|---|---|---|
| `NoeudTicket` : même interface pour un ticket et ses sous-tickets, sur n niveaux | Composite | 1, livré |
| parcours de l'arbre par les vérifications, puis par les observateurs | Visiteur | 1 livré, 4 |
| ordre de résolution : un nœud prêt quand ses prérequis sont clos | Observateur, État | 1 livré, 4 |
| `FabriqueSkillTicket` et `FabriqueJavaAngularPostgreSQL` | Fabrique abstraite | 2 |
| `Monteur` : assemblage nœud par nœud, blocs du référentiel copiés puis paramétrés | Monteur, Prototype | 2 |
| consigne du nœud : squelette É1 à É7 commun | Patron de méthode | 2 |
| exécuteur Gemini CLI par l'installateur ; place prévue pour n8n | Pont | 3 |
| champ d'observation partagé, en ajout seul | Médiateur | 4 |
| escalade ordre 1, 2, 3, puis humain | Chaîne de responsabilité | 4 |
| actions enregistrées, corrections humaines qui les visent | Commande | 4 |
| vue augmentée : calques posés sur les ancres du ticket | Décorateur | 5 |

`outils/toml.mjs` lit le sous-ensemble de TOML 1.0 du référentiel et des tickets, sans dépendance ; sa recette le compare aux lectures de `tomllib` (Python), versionnées dans `tests/fixtures/toml/` et `tests/attendus/`.

## Lots et critères d'acceptation

| Lot | Contenu | Critères | Statut |
|---|---|---|---|
| 1 | modèle et vérification de l'arbre | P1, sauf l'invariant omis | livré |
| 2 | fabrique et Monteur : un skill par nœud, sa transmission par `bundle.mjs` | P1 (invariant omis), P2, P3 | à venir |
| 3 | installation de l'arbre dans Gemini CLI, activation vérifiée sur le poste du développeur | P4 | à venir |
| 4 | champ d'observation, retours humains simulés, visiteurs, escalade, propagation | P5 | à venir |
| 5 | vue augmentée générée depuis le champ | P6 | à venir |
| 6 | recette, mesure du contexte, bilan | P7 | à venir |

- **P1** : l'arbre d'essai passe le vérificateur ; sont rejetés : deux parents, un cycle de dépendances, une dépendance vers un ancêtre, une profondeur au-delà du plafond, une possibilité du parent portée par aucun sous-ticket, une option hors de la composition, un invariant omis (lot 2).
- **P2** : chaque skill produit se relit à l'identique depuis sa transmission ; la même entrée redonne les mêmes fichiers ; l'assemblage ne consomme aucun token.
- **P3** : chaque skill de ticket reprend tous les invariants dont il hérite, contrôlé automatiquement.
- **P4** : dans Gemini CLI, le skill parent présente l'arbre, les méso-contrats, l'ordre de résolution et les critères, puis attend la ratification avant toute action.
- **P5** : sur retours simulés, une correction répétée déclenche une proposition d'ordre 2 ; un écart dans un sous-ticket menace le critère du parent qu'il soutient ; un désaccord entre nœuds va au registre des écarts.
- **P6** : la vue augmentée montre, pour chaque ancre, des calques et un état conformes au champ.
- **P7** : le contexte chargé pour résoudre une feuille est mesuré et comparé à celui du point d'entrée de l'orchestrateur.

## Écart relevé dans le référentiel

En codant la règle « aucune possibilité ne reste inconnue si sa réponse pouvait changer la composition », le prototype constate que l'exemple du § 7.2 du module `referentiel` (orchestrateur-c7e 3.5.3) laisse `regle` et `service` à `inconnu`, alors qu'un `oui` ajouterait un complément à M04. Le référentiel n'est pas modifié ; l'arbre d'essai répond à ces deux possibilités, et un test documente l'écart.
