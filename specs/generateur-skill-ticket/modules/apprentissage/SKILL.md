---
name: apprentissage
description: Apprentissage permanent du générateur de skills de ticket (relevé de chaque ticket classé selon les quatre profondeurs de la composition récursive imbriquée, descente du besoin à la qualification, remontée des preuves à la clôture, registre du projet en ajout seul et chaîné, récurrences proposées au développeur, veille, tendance). À lire pour qualifier un ticket, clore un arbre ou décider d'une évolution du référentiel ou des consignes.
dimensions: [D8]
status: active
---

# Module `apprentissage` (D8)

Chaque ticket est une recette et un cycle d'apprentissage. Le générateur ne se règle pas sur des exemples, qui finiraient par l'y ajuster : il s'observe lui-même à chaque ticket réel, un niveau au-dessus des nœuds de l'arbre, avec la même boucle qu'eux. Il observe, il propose ; le développeur décide (D8.INV-2). Les arbres d'exemple restent des tests de non-régression, figés (D8.INV-4).

## 1. Les quatre profondeurs

Ce que le générateur apprend se classe selon la composition récursive imbriquée (CRI) de la méthode C7E, le moteur de récursivité fractale qui structure la descente du besoin et la remontée des preuves :

| Profondeur | Ce qu'elle porte | Dans l'arbre |
|---|---|---|
| `macro` | objectif métier du ticket Jira, invariants de délai, critères d'acceptation numérotés | le ticket, son US, ses critères |
| `meso-contrats` | frontières entre couches, schémas exposés, contrats | la composition, les méso-contrats, les possibilités du référentiel |
| `meso-composants` | implémentation des couches, services back, composants front | les tâches, une session et ses agents de couche chacune |
| `micro` | changesets Liquibase, annotations, directives, lignes de code | les commits de la branche, un par scénario et par thème |

## 2. Le relevé du ticket

`docs/demandes/<clé>/releve.json`, au format `generateur.releve/1`, avec sa vue `releve.md`. Chaque entrée porte sa profondeur, sa nature, un motif en minuscules et tirets, le même pour un même écart d'un ticket à l'autre, sa cible (`referentiel` pour ce qui relève du référentiel ou des conventions du projet, `generateur` pour ce qui relève de ses consignes), son sens (`descente` ou `remontee`), un résumé et sa preuve : `fichier`, `champ` (numéro d'enregistrement), `commit`, `commande` ou `arbre`. Une entrée sans profondeur ou sans preuve est refusée, et rien n'est écrit (D8.INV-1).

Natures : `possibilite-inconnue` (une possibilité que le modèle de la demande n'a pas, comme un job batch ou un fichier entrant), `categorie-inadaptee` (une catégorie retenue par la règle de choix dont le nom ne dit pas l'intention), `noeud-refuse` (un nœud que le vérificateur refuse, avec sa raison), `hors-arbre` (une partie du ticket qui n'a ni couche ni méso-contrat, comme un diagnostic), `cout`, `correction`, `proposition-observateur`, `commit-hors-plan`, `commit-planifie-absent`, `commit-planifie-multiple`, `autre`.

**Descente, à la qualification.** Le générateur note chaque écart qu'il rencontre en qualifiant et en décomposant, avant la génération : `node <dépôt>/specs/generateur-skill-ticket/outils/apprentissage.mjs noter <clé> --profondeur <p> --nature <n> --motif <m> --cible <c> --sens descente --resume <texte> --preuve <type>:<ref>`. Après la génération, `qualifier <clé> --cout <pourcentage> --preuve commande:<commande>` note la somme des contextes de l'arbre, mesurée par `mesurer-contexte.mjs` (module `mesure`).

**Remontée, à la clôture.** Le skill racine lance `clore <clé>` (`apprentissage.mjs` est dans sa boîte à outils). Le script tire du champ d'observation chaque correction du développeur, classée par ce qu'elle vise : un critère ou un critère d'acceptation en `macro`, un contrat ou une option en `meso-contrats`, un nœud ou un scénario en `meso-composants`, un fichier ou un commit en `micro` ; et chaque proposition d'ordre 2, avec la décision du développeur. Pour un arbre qui a un plan de commits, il compare le plan ratifié à la branche, par les lignes `Tâche`, `Scénario` et `Thème` des commits : commit planifié absent, commit planifié réalisé en plusieurs commits, commit hors du plan, au niveau `micro`.

## 3. Le registre du projet

À la clôture, le relevé passe au registre du projet, `docs/c7e/registre-apprentissage.jsonl`, au format `generateur.apprentissage/1` ; le relevé est alors clos et ne reçoit plus rien. Le registre est en ajout seul : chaque ligne porte son numéro et l'empreinte de la précédente, et seul le script l'écrit. Un registre altéré se signale et refuse tout versement et toute proposition (D8.INV-3).

Les écarts au référentiel restent dans le projet, dont le référentiel est propre. Les écarts aux consignes du générateur s'en extraient, `registre propositions --cible generateur`, en Markdown, que le développeur porte au dépôt Agent2Prompt comme proposition de version.

## 4. Récurrences et décisions

`registre proposer` cherche les récurrences : un même motif, à la même profondeur et pour la même cible, relevé dans au moins deux tickets, devient une proposition, en attente de la décision du développeur ; le coût, qui se suit en tendance, ne se propose pas. Le skill racine la lui présente à la clôture ; il la retient ou la refuse, avec sa raison : `registre decider <n> --decision retenue|refusee --par <nom> --raison <texte>`. Une proposition retenue ne se repropose pas ; une refusée revient si un nouveau ticket relève le motif ; deux refus sur un même motif le mettent en veille, et il ne se propose plus. Rien n'entre dans le référentiel ni dans les consignes sans la décision du développeur, et c'est lui qui l'y écrit : le script ne modifie que le relevé et le registre (D8.INV-2).

`registre tendance` donne, ticket par ticket, les entrées par profondeur et le coût relevé : une tendance qui baisse dit que le système apprend ; une qui monte, qu'il dérive. `registre etat` donne les propositions, leurs décisions et les motifs en veille.

## 5. Commandes

Depuis la racine du projet, avec la copie du skill racine installé, `node .gemini/skills/ticket-<clé>/outils/apprentissage.mjs`, ou celle du clone avant l'installation :

| Commande | Effet |
|---|---|
| `noter <clé> …` | ajoute une entrée au relevé du ticket |
| `qualifier <clé> --cout <p> --preuve <type>:<ref>` | note le coût de l'arbre, en pourcentage du point d'entrée de l'orchestrateur |
| `clore <clé> [--rattachement <fichier>] [--branche <ref>]` | remontée du champ et de la branche, versement au registre |
| `registre verifier`, `etat`, `tendance` | intégrité, propositions et veille, tendance |
| `registre proposer` | récurrences nouvelles, ajoutées comme propositions |
| `registre decider <n> …` | décision du développeur sur une proposition |
| `registre propositions [--cible <c>]` | propositions retenues ou en attente, en Markdown |

Options communes : `--demandes <dossier>`, `--registre <fichier>`, `--date <AAAA-MM-JJTHH:MM:SSZ>`. Code de sortie 1 pour un refus ou un registre altéré, 2 pour un usage incorrect.

## 6. Recette

| Invariant | Tests |
|---|---|
| D8.INV-1 | `tests/apprentissage.test.mjs` : « D8 : une entrée sans profondeur CRI ou sans preuve est refusée, rien n'est écrit » ; « D8 : la clôture classe la remontée du champ par profondeur CRI, depuis l'ancre de l'action corrigée » ; « D8 : la clôture relève les écarts entre le plan des commits et la branche, au niveau micro » ; « D8 : ligne de commande, codes de sortie » |
| D8.INV-2 | `tests/apprentissage.test.mjs` : « D8 : un même motif dans deux tickets devient une proposition, décidée par le développeur seul » ; « D8 : deux refus mettent un motif en veille ; une proposition retenue ne se repropose pas » ; « D8 : tendance par ticket et profondeur ; propositions pour le générateur en Markdown » ; `tests/generer.test.mjs` : « 1.1.0 : la clôture de la racine verse l'apprentissage au registre et présente les propositions au développeur » |
| D8.INV-3 | `tests/apprentissage.test.mjs` : « D8 : un relevé clos est versé au registre et ne reçoit plus rien » ; « D8 : un registre altéré se signale, sans proposition ni versement » |
| D8.INV-4 | `tests/apprentissage.test.mjs` : « D8 : les arbres d'exemple sont figés, empreinte par empreinte » ; `tests/bilan.test.mjs` : « bilan : chaque ligne de mesure recopiée est celle d'un rapport du lot 7, figé » |
