---
name: tracabilite
description: Traçabilité, rapport et point V5 (matrice construite dans l'arbre de la demande par les recherches du depot et les scripts du skill, jamais de mémoire, patchs manquants nommés, état de réalisation et verdict d'acceptation de chaque critère, matrice incomplète jamais présentée, rapport final rendu depuis le journal au format du skill, projet de commentaire Jira rédigé par la fiche rapport et contrôlé, remis au développeur et jamais publié, rapport.md en mode parallèle). À implémenter au lot 6.
dimensions: [D11]
status: active
---

# Module `tracabilite` (D11)

Le `tracabilite` applique le module `tracabilite` du skill : il construit la matrice, rend le rapport final, fait rédiger le projet de commentaire Jira, puis présente le tout à V5. Il répond à la question du skill : chaque élément de la demande est-il réalisé, testé et livré, et où ?

## 1. Arbre lu (D11.INV-1)

La matrice décrit ce que le développeur publiera : elle se construit dans l'arbre de la demande, jamais dans la copie de travail.

- En copie de travail, le `depot` met d'abord la copie à jour et nomme les patchs manquants (module `depot`, section 2). Un scénario dont le patch n'est pas appliqué figure dans la matrice avec le statut « non réalisé : patch remis, non appliqué », et le nom du patch.
- Le plan, `us.md` et le fichier Gherkin, se lit aussi dans l'arbre de la demande. En copie de travail, s'il n'y est pas encore, parce que le premier patch n'est pas appliqué, il se lit dans la copie, où son empreinte est restée celle de V2 (module `cadrage`, section 3), et la matrice le dit.
- Avec l'autorisation d'écrire le code, l'arbre de la demande est l'arbre de travail ; un scénario accepté sans commit figure avec le statut « réalisé, non commité ».

## 2. Recherches et scripts (D11.INV-1)

Les recherches du skill (`tracabilite`, section 2) se font sans shell, par le `depot` et l'`executant` :

| Recherche du skill | Équivalent d'Agent2Dev |
|---|---|
| `grep -n '@ECR-77-S' docs/demandes/ECR-77/ECR-77.feature` | `depot.chercher({ arbre: "demande", motif: "@ECR-77-S\\d{2,}", inclure: "docs/demandes/ECR-77/ECR-77.feature" })` |
| `grep -rn '@Tag("ECR-77-S' src/test/java` | `depot.chercher({ arbre: "demande", motif: "@Tag\\(\"ECR-77-S\\d{2,}", inclure: "**/src/test/java/**/*.java" })` |
| `grep -rn "describe('ECR-77-S" src/app --include=*.spec.ts` | `depot.chercher({ arbre: "demande", motif: "describe\\(['\"]ECR-77-S\\d{2,}", inclure: "**/*.spec.ts" })` |
| `git log --oneline --grep='^ECR-77 '` | `depot.journal({ arbre: "demande", grep: "^ECR-77 " })` |
| `controler-criteres.mjs` avec `--depuis` le commit d'ajout de `us.md` | l'`executant`, à la racine de l'arbre où le plan est lu ; le commit est trouvé par `depot.journal` |
| `lire-acceptation.mjs` sur le journal de la dernière campagne | l'`executant`, dans l'arbre de la demande (module `binome`, section 3) |

- Les US, les critères, leurs statuts et les exigences se lisent dans `us.md`, au format du skill (`us-criteres`, section 3) ; les étiquettes de chaque scénario, dans le fichier Gherkin ; les variantes, dans les décisions V3 du journal.
- Rien ne vient d'une lecture du moteur ni de la mémoire d'une étape précédente : la matrice est recalculée à chaque présentation (`agent-tdd-jira:D6.INV-1`, `agent-tdd-jira:D10.INV-7`).

## 3. Matrice (D11.INV-3)

Les colonnes sont celles du skill (`tracabilite`, section 3) : US, CA, exigences, scénario, variante, tests back, tests front, commit, statut, acceptation.

- **Commit** : les commits de l'arbre de la demande dont le message commence par `<CLÉ> Snn : ` ; en copie de travail, ce sont ceux que `git am` a créés chez le développeur, pas ceux de la copie.
- **Statut** : `réalisé` ; `réalisé, corrigé après la campagne <campagne>` ; `réalisé, non commité` ; `non réalisé : <raison>` (en attente de Qn, retiré, budget épuisé, patch remis, non appliqué, patch écarté par le développeur avec sa décision).
- **Acceptation** : la ligne du critère dans la sortie de `lire-acceptation.mjs`, reprise telle quelle ; sans binôme, « non joué (pas de campagne Agent2Test) » (`agent-tdd-jira:D7.INV-3`).

Contrôle nommé `tracabilite.matrice-complete`, d'après le skill : une exigence sans CA ni scénario, un CA sans scénario, un scénario validé sans test ni statut, ou un critère sans acceptation rend la matrice incomplète. Une matrice incomplète n'est pas présentée à V5 : ses trous vont au développeur, qui rouvre un scénario (ajustement, module `realisation`) ou une analyse (nouveau V2).

## 4. Rapport final

Le rapport est rendu sans moteur, depuis le journal, la matrice et les sorties des scripts, au format du skill (`tracabilite`, section 4) : demande et empreinte de la source, critères et scénarios par statut, suites, acceptation, écarts à la demande, écarts aux référentiels, questions ouvertes, ligne de base (module `executant`, section 4).

- **Suites** : les dernières suites lancées. En copie de travail, ce sont celles de la copie mise à jour sur le commit de l'arbre de la demande : quand tous les patchs sont appliqués, les deux arbres portent les mêmes fichiers suivis, et une mise à jour qui change la copie relance les suites.
- **Écarts aux référentiels** : les choix de V3 que `suivi.md` consigne avec un écart.
- **Écarts à la demande** : les critères retirés ou non réalisés, les scénarios proposés et validés, les écritures étrangères intégrées.
- Le `depot` écrit le rapport dans `<dossier de travail>/rapport.md` : en mode parallèle, `travail/<CLÉ>/rapport.md`, que le développeur reprend dans sa merge request (skill, `parallele`, section 8).

## 5. Projet de commentaire Jira (D11.INV-2)

La fiche `rapport` rédige le projet de commentaire, en appliquant la section 5 du module `tracabilite` du skill. Entrées : la matrice, le rapport, le titre de la demande et sa branche, les questions ouvertes et leurs options. Sortie, schéma `fiche.rapport.sortie` :

```json
{ "commentaire": "Réalisation ECR-77 (branche feature/ECR-77-export-csv)\n\nCritères d'acceptation remplis :\n- CA01 …" }
```

Contrôles nommés :

- `rapport.criteres-et-etats` : chaque critère de la matrice est cité, sous son identifiant court (`CA01`), avec l'état que la matrice lui donne ; aucun critère n'est ajouté ;
- `rapport.commits-de-la-matrice` : les commits cités sont ceux de la matrice ;
- `rapport.sans-classes` : aucun nom de fichier, de classe ni de test cité par la matrice ; le destinataire est l'auteur de la demande ;
- `rapport.sans-donnee-sensible` : le masque du noyau n'y trouve rien, et aucune adresse électronique absente de `demande.json` n'y figure.

Agent2Dev n'écrit jamais dans Jira et n'ouvre aucune connexion vers Jira : le `depot` écrit le projet de commentaire dans `<dossier de travail>/commentaire-jira.txt`, et le développeur le publie lui-même (`agent-tdd-jira:D6.INV-3`).

## 6. V5

V5 présente, côte à côte, la matrice, le rapport et le projet de commentaire, avec les patchs manquants s'il y en a (D19.INV-2).

| Décision | Suite |
|---|---|
| accepter | la demande est close « acceptée » ; le rapport, le projet de commentaire et le livrable de demande (module `journal`) sont remis |
| corriger, commentaire obligatoire | la matrice et le rapport sont recalculés ; le commentaire entre dans la fiche `rapport`, qui rédige de nouveau le projet de commentaire ; nouveau V5 |
| recalculer | après un patch appliqué ou un commit du développeur : la matrice, le rapport et le projet de commentaire sont refaits ; nouveau V5 |

## 7. Pièges connus

- **Matrice de la copie** : elle montrerait des commits que le développeur n'a pas ; seul l'arbre de la demande compte.
- **Matrice gardée d'une présentation à l'autre** : elle se recalcule, sinon un patch appliqué entre-temps n'y paraît pas.
- **Commentaire Jira technique** : le contrôle `rapport.sans-classes` le refuse ; on parle en critères et en comportements.
- **Verdict reformulé** : la colonne « Acceptation » est la ligne du script, mot pour mot.

## 8. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| TR1 | D11.INV-1 | sur l'exemple ECR-77, la matrice se construit par les recherches du `depot` et les deux scripts, dans l'arbre de la demande, sans appel au moteur |
| TR2 | D11.INV-1 | en copie de travail, S02 non appliqué figure « non réalisé : patch remis, non appliqué (002-S02.patch) » ; après `git am`, il figure « réalisé » avec le commit du développeur |
| TR3 | D11.INV-1 | un test sans étiquette n'apparaît pas dans la matrice, et le trou est signalé |
| TR4 | D11.INV-3 | la colonne « Acceptation » reprend la sortie de `lire-acceptation.mjs` mot pour mot ; sans binôme, chaque critère porte « non joué (pas de campagne Agent2Test) » |
| TR5 | D11.INV-3 | une matrice où un CA n'a pas de scénario n'est pas présentée à V5 ; le trou va au développeur |
| TR6 | D11.INV-2 | aucune connexion n'est ouverte vers Jira ; le projet de commentaire est un fichier du dossier de travail |
| TR7 | D11.INV-2 | un projet de commentaire qui cite `FeedbackCsv` est refusé par `rapport.sans-classes` ; un projet qui omet CA02 est refusé par `rapport.criteres-et-etats` |
| TR8 | D13.INV-3 | le rapport final de l'exemple est rendu depuis le journal, sans moteur, au format du skill |
| TR9 | D5.INV-1 | en mode parallèle, le rapport va dans `travail/ECR-77/rapport.md`, et rien d'autre n'est écrit dans le worktree |
| TR10 | D11.INV-3 | « corriger » à V5 recalcule la matrice et fait rédiger de nouveau le projet de commentaire, avec le commentaire en entrée ; « recalculer », après `git am` de S02, fait passer S02 à « réalisé » |
| TR11 | D11.INV-1 | en copie de travail, sans le premier patch appliqué, le plan se lit dans la copie, son empreinte est celle de V2, et la matrice le signale |

## 9. Fichiers à produire

- `src/agents/tracabilite/agent.js`, `src/agents/tracabilite/matrice.js`, `src/agents/tracabilite/lecture-plan.js`
- `src/agents/tracabilite/rapport.js`, `src/agents/tracabilite/commentaire.js`
- `schemas/fiche.rapport.sortie.json`
- `test/tracabilite/*.test.js`, `test/fixtures/moteur/rapport/`
