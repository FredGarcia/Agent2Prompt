---
name: arbre
description: Arbre de tickets du générateur de skills de ticket (format d'un nœud en TOML, règles du référentiel sur chaque nœud, règles de la décomposition sur l'arbre, arbre des commits de la branche, plan et ordre de résolution, commandes de arbre.mjs). À lire avant de décomposer un ticket.
dimensions: [D1]
status: active
---

# Module `arbre` (D1)

Ce module fixe la forme d'un ticket décomposé et les règles qu'un arbre doit passer avant toute génération. Le modèle écrit les tickets ; `arbre.mjs` les vérifie et en tire le plan. Un arbre non conforme ne donne aucun skill (D2.INV-1).

## 1. Format d'un nœud

Un fichier TOML par nœud, dans un même dossier, `docs/demandes/<clé>/arbre/` pour un ticket réel. Chaque fichier suit le format de `ticket.toml` du module `referentiel` de l'orchestrateur, complété de trois éléments :

| Champ | Contenu |
|---|---|
| `reference` | identifiant unique du ticket ; la racine porte la clé Jira, un sous-ticket la clé suivie de son rang, `ABCDE-3620-1.2` |
| `parent` | référence du parent, une seule ; absent pour la racine |
| `depend_de` | références des tickets dont celui-ci attend la clôture ; ni un ancêtre, ni un descendant |
| `referentiel`, `meso_contrat`, `complements`, `meso_contrat_confirme`, `titre` | comme dans `ticket.toml` |
| `[ticket.demande]` | l'intention, la maquette et les dix-sept possibilités, chacune avec sa réponse, `oui`, `non` ou `inconnu`, et sa source |
| `[[ticket.criteres]]` | `id`, `enonce`, et `soutient` : les critères du parent direct que ce critère soutient, absent pour la racine |
| options par couche | sur les feuilles seulement : un nœud composé ne porte pas d'option, ses sous-tickets les portent |
| `[[ticket.scenarios]]` | sur la racine seulement, depuis 1.1.0 : `id` (`Snn`), `titre` et `prouve`, les critères de la racine que le scénario éprouve ; les scénarios de l'US, que le fichier Gherkin reprendra sous ces identifiants |
| `themes` et `[[ticket.commits]]` | sur les tâches seulement, depuis 1.1.0 : les thèmes de modification de la tâche, et ses commits planifiés, dans l'ordre, chacun avec `id` (`Kn`), `theme`, `scenario` facultatif et `resume` (section 4) |

Ce que le modèle écrit s'arrête là : la demande et ses sources, l'objectif, les critères et leurs soutiens, les options prises aux catalogues du référentiel. La composition sort de la règle de choix, appliquée à la demande ; le reste du skill est assemblé (module `assemblage`).

## 2. Règles sur chaque nœud

Les règles de la section `[validation]` du référentiel, sur chaque nœud (D1.INV-3) :

- demande complète, chaque possibilité sourcée ;
- aucune possibilité `inconnu` dont la réponse changerait la composition ;
- composition conforme à la règle de choix, principal et compléments, confirmée avant toute option ;
- options rattachées à un méso-contrat de la composition, permises par son empreinte, avec leurs paramètres et leurs catalogues ;
- couches requises du principal couvertes ; les méso-contrats transverses s'appliquent selon les couches que touche l'arbre.

## 3. Règles sur l'arbre

| Règle | Contenu | Invariant |
|---|---|---|
| A1 | références uniques ; chaque fichier porte une table `[ticket]` et une référence | D1.INV-1 |
| A2 | un seul parent, présent dans l'arbre | D1.INV-1 |
| A3 | une seule racine, chaque nœud relié à elle, sans cycle de parenté | D1.INV-1 |
| A4 | profondeur au plus égale au plafond : `--profondeur-max`, ou `[decomposition] profondeur_max` du référentiel, 3 par défaut | D1.INV-1 |
| A5 | dépendances vers des tickets présents, ni soi-même, ni un ancêtre, ni un descendant ; aucun cycle, ni entre dépendances, ni entre dépendances et clôtures | D1.INV-2 |
| A6 | chaque possibilité à oui d'un nœud composé est portée par au moins un de ses sous-tickets | D1.INV-3 |
| A7 | un sous-ticket ne met à oui aucune possibilité absente de son parent : sinon, retour à la qualification du parent | D1.INV-3 |
| A8 | critères uniques ; la racine ne soutient rien ; chaque critère d'un sous-ticket soutient un critère de son parent direct ; chaque critère d'un nœud composé est soutenu | D1.INV-4 |
| A9 | un nœud composé ne porte pas d'option ; ses couches requises sont couvertes par les options de ses feuilles | D1.INV-3 |

Une dépendance peut viser un ticket d'une autre branche : elle se vérifie indépendamment de l'arbre, et devient un préalable de la coordination du nœud composé qui la porte (module `assemblage`).

## 4. Arbre des commits

Depuis la 1.1.0, l'arbre est aussi le plan des commits du ticket, selon la composition récursive imbriquée (CRI) de la méthode C7E : un ticket, une US, une branche ; ses tâches, les feuilles de l'arbre, une session chacune ; leurs commits, un par scénario et par thème de modification. Le ticket et ses critères forment le niveau macro, la composition le niveau des méso-contrats, les tâches celui des méso-composants, les commits le niveau micro (module `apprentissage`).

Le découpage se propose automatiquement, puis se ratifie avec l'arbre. La racine déclare les scénarios de l'US ; `arbre.mjs proposer` donne, pour chaque tâche, les commits qui croisent ses scénarios, ceux qui éprouvent un critère de la racine que la tâche soutient par la chaîne de ses « soutient », avec ses thèmes : ceux qu'elle déclare dans `themes`, à défaut les couches que touchent ses options. Une évolution de schéma a son commit technique, sans scénario. Le modèle recopie la proposition dans le fichier de la tâche, l'ajuste à l'heuristique, un commit par scénario et par thème, et le développeur ratifie le tout.

| Règle | Contenu | Invariant |
|---|---|---|
| C1 | dès qu'une tâche a un plan, la racine déclare ses scénarios ; chaque scénario a un identifiant `Snn` unique, un titre, et éprouve au moins un critère de la racine ; chaque critère de la racine est éprouvé par au moins un scénario | D1.INV-5 |
| C2 | chaque tâche a au moins un commit planifié ; un nœud composé n'en a pas | D1.INV-5 |
| C3 | chaque commit porte un identifiant `Kn` unique dans sa tâche, un thème et un seul, en minuscules et tirets, un résumé, et au plus un scénario, déclaré par la racine et qui éprouve un critère que la tâche soutient ; un seul commit par scénario et par thème | D1.INV-5 |
| C4 | chaque scénario de l'US est réalisé par au moins un commit planifié | D1.INV-5 |

Un arbre sans scénario ni commit garde le plan d'avant la 1.1.0 : une tâche sans plan vaut un commit par slot. Sur la branche, un commit planifié peut se réaliser en plusieurs commits, un par slot (D4.INV-2), qui portent les mêmes lignes `Tâche`, `Scénario` et `Thème` ; les écarts entre le plan et la branche se relèvent à la clôture (module `apprentissage`).

## 5. Plan et ordre de résolution

`arbre.mjs plan` présente l'arbre et l'ordre de résolution : un ticket vient après ceux dont il dépend, un nœud composé se clôt après ses sous-tickets (D1.INV-2). Pour l'arbre d'exemple ABCDE-3620 :

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

Pour un arbre qui a un plan de commits, `plan` liste ensuite les commits de la branche, dans l'ordre de résolution des tâches, chacun avec sa tâche, son thème et son scénario. Le plan dit aussi qui ratifie : l'arbre sur sa racine, puis chaque feuille avant sa première action ; pour un ticket sans sous-ticket, le skill de ce ticket, avant sa première action (D3.INV-3).

## 6. Commandes

```bash
node <dépôt>/specs/generateur-skill-ticket/outils/arbre.mjs verifier <arbre> [--referentiel <chemin>] [--profondeur-max <n>]
node <dépôt>/specs/generateur-skill-ticket/outils/arbre.mjs plan <arbre> [--referentiel <chemin>] [--profondeur-max <n>]
node <dépôt>/specs/generateur-skill-ticket/outils/arbre.mjs proposer <arbre> [--referentiel <chemin>]
```

`verifier` donne chaque écart avec sa règle et son nœud, code 1 ; `plan` ne s'écrit que pour un arbre conforme ; `proposer` écrit sur la sortie, en TOML, les commits proposés pour chaque tâche, à recopier, et ne modifie aucun fichier. `outils/toml.mjs` lit le sous-ensemble de TOML 1.0 du référentiel et des tickets, sans dépendance.

## 7. Recette

| Invariant | Preuves |
|---|---|
| D1.INV-1 | `tests/arbre.test.mjs` : « P1 · écart rejeté » (deux parents, profondeur au-delà du plafond) ; « décomposition · écart rejeté » (parent absent de l'arbre, référence en double, plusieurs racines, cycle de parenté) ; « Composite : cinq nœuds sur trois niveaux, un seul parent chacun » |
| D1.INV-2 | `tests/arbre.test.mjs` : « P1 · écart rejeté » (cycle de dépendances, dépendance vers un ancêtre) ; « décomposition · écart rejeté » (dépendance vers un ticket absent, vers soi-même, vers un descendant, cycle entre dépendances et clôtures) ; « ordre de résolution : dépendances d'abord, clôture des nœuds composés après leurs sous-tickets » |
| D1.INV-3 | `tests/arbre.test.mjs` : « P1 · écart rejeté » (possibilité du parent portée par aucun sous-ticket, option hors de la composition) ; « décomposition · écart rejeté » (sous-ticket qui déborde de son parent, nœud composé qui porte une option, composition non conforme à la règle de choix, inconnue qui changerait la composition) ; `tests/referentiel.test.mjs` : « règle de choix » ; « option refusée » ; « exemple fil rouge du référentiel (7.1) : conforme » |
| D1.INV-4 | `tests/arbre.test.mjs` : « décomposition · écart rejeté » (critère du parent non soutenu, soutien d'un critère absent, soutien d'un critère qui n'est pas du parent, racine qui soutient un critère) |
| D1.INV-5 | `tests/arbre.test.mjs` : « arbre des commits : plan conforme, chaque scénario réalisé par un commit de sa tâche » ; « arbre des commits · écart rejeté » ; « arbre des commits : proposer croise les scénarios de chaque tâche et ses thèmes » ; « arbre des commits : un arbre sans scénario ni commit garde le plan d'avant la 1.1.0 » |
