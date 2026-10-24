---
name: binome
description: Acceptation en binôme avec Agent2Test, à la main (remise du plan validé et commité sur l'arbre de la demande propre, patchs remis présents, attente du journal de tests dont le développeur donne le chemin ou déclaration sans binôme, lecture par lire-acceptation.mjs, verdict par critère repris du script, défauts confirmés rouverts en cycle de correction dans leur budget, défauts contestés, non confirmés, régressions et journaux non valables présentés au développeur, rien d'écrit chez Agent2Test). À implémenter au lot 6.
dimensions: [D10]
status: active
---

# Module `binome` (D10)

Le `binome` applique le module `binome-agent2test` du skill. Agent2Test (spécification `agent2test` 1.2.0) est la tête de test ; Agent2Dev est la tête de développement ; le développeur fait le lien. Les deux têtes ne s'appellent jamais : elles échangent des fichiers, que le développeur porte, ou que l'échange par dossiers dépose et relève quand il est activé (module `echange`).

## 1. Remise (D10.INV-1)

Quand tous les scénarios prêts pour la réalisation sont acceptés à V4 :

1. en copie de travail, le `depot` met la copie à jour, puis vérifie la présence des patchs : la remise attend que chaque patch remis soit dans l'arbre de la demande, ou que le développeur ait déclaré que son arbre fait foi (module `depot`, section 2). Si la mise à jour a changé l'arbre de la copie, les suites sont relancées avant la remise (module `executant`, section 4) ;
2. le `depot` relève l'état de l'arbre de la demande : aucun fichier suivi modifié. Sinon, la remise attend que le développeur commite lui-même ; le `depot` ne commite après coup aucun scénario qu'il n'a pas commité à son V4 ;
3. l'`executant` lance `controler-criteres` dans l'arbre de la demande : aucun écart ;
4. le `binome` rend la remise au format du skill (`binome-agent2test`, section 4), sans moteur : commit de l'arbre de la demande, fichiers du plan, critères et leurs statuts, scénarios jouables prévus et non jouables avec leur motif, préalables de batch, plage de changements depuis la branche de base.

C'est l'arbre de la demande que le développeur construit et lance pour la campagne : la remise ne cite jamais la copie de travail. La même remise est aussi un fichier au format `agent2test.remise/1` : le tableau de bord le propose au téléchargement, et, en mode `dossiers`, l'échange le publie dans la boîte de sortie de l'instance (module `echange`, section 3).

La liste des jouables se déduit des étiquettes, selon les règles du skill (`binome-agent2test`, section 3) : `@back` sans `@front`, `@en-attente`, `@propose`, `@redemarrage` et `@ecriture-base` rendent un scénario non jouable ; `@role-<nom>` et `@batch-<nom>` sont rappelés. C'est une prévision : Agent2Test décide (`agent2test:D3.INV-5`).

## 2. Attente du journal

La demande passe à l'état « attente du journal de tests ». Le développeur redémarre l'application sur le Tomcat local, ouvre la campagne d'Agent2Test, la conduit à ses points de contrôle, puis donne à Agent2Dev le chemin du journal (`rapports/<campagne>/journal-de-tests.json`), depuis le tableau de bord ou par l'outil MCP `a2d_journal_de_tests`. Il peut aussi déclarer la demande « sans binôme ».

- En mode parallèle, le journal est déposé dans `travail/<CLÉ>/acceptation/`, et Agent2Dev refuse un chemin hors de ce dossier (skill, `binome-agent2test`, section 9).
- En mode `dossiers`, l'échange relève le journal dans la boîte de sortie d'Agent2Test : le `depot` le copie dans `acceptation/<campagne>.json` du dossier de travail, et la lecture qui suit est la même (module `echange`, section 4).
- Agent2Dev n'ouvre aucune campagne, n'appelle pas Agent2Test et n'écrit rien dans son projet (D10.INV-4).

## 3. Lecture du journal (D10.INV-2)

L'`executant` lance `lire-acceptation` dans l'arbre de la demande, sur `docs/demandes/<CLÉ>` et le journal donné. Le `binome` lit la sortie ligne à ligne, de façon déterministe :

| Ligne de la sortie | Ce qu'en fait le `binome` |
|---|---|
| `<CLÉ>-CAnn \| <acceptation> \| …` | l'acceptation du critère, reprise telle quelle pour la matrice (module `tracabilite`) |
| `DÉFAUT  <scénario> (…) : défaut applicatif confirmé en CP-3 ; cycle de correction (D7.INV-2)` | défaut à corriger (section 4) |
| tout autre `DÉFAUT` : contesté, non confirmé, journal incohérent, à rejouer | présenté au développeur (section 5) |
| `RÉGRESSION  <scénario> …` | présentée au développeur (section 5) |
| `ÉCART  …` | présenté au développeur, avec le journal |

Code de sortie : 0, verdicts valables pour le plan et le code courants ; 1, verdicts à ne pas reporter tels quels, présentés avec leur raison ; 2, erreur d'usage ou de format, présentée telle quelle.

Le moteur ne lit jamais le journal pour en tirer un verdict. Pour un défaut confirmé, le `binome` extrait du JSON l'entrée du scénario (étapes, signaux, preuves) et la passe à la fiche `rouge` ; il n'en tire aucun verdict.

## 4. Défauts confirmés (D10.INV-3)

- Chaque défaut que le script déclare confirmé, avec un cycle de correction, rouvre son scénario au rouge (module `realisation`, section 7), dans le budget `budget.correctionsParScenario` (3 par défaut). Au-delà, le défaut est présenté au développeur.
- Les corrections se font une à une, dans l'ordre du fichier Gherkin, chacune jusqu'à son acceptation à V4, dans l'arbre de travail ; en copie de travail, chacune remet son patch, d'objet `Snn-correction`.
- Après la dernière correction, nouvelle remise (section 1), qui attend à son tour la présence des patchs. Le journal précédent ne vaut plus pour le code corrigé : le script le dit (« code modifié depuis la campagne »), et le développeur rejoue la campagne.

## 5. Ce qui va au développeur (D10.INV-4)

Un défaut contesté ou non confirmé, une régression d'une autre demande, un journal provisoire, incohérent ou périmé : le `binome` les présente, avec la ligne du script et, s'il y en a, ce qu'il constate de son côté (test vert du scénario, étape ambiguë, rôle de la session). Il ne conteste ni ne réécrit aucun verdict (`agent-tdd-jira:D7.INV-4`). Le développeur choisit :

| Décision | Suite |
|---|---|
| corriger quand même | cycle de correction, compté dans le budget du scénario |
| rejouer | nouvelle attente du journal |
| question sur le scénario | nouvelle analyse, qui repasse par V2 |
| corriger la régression dans la demande | cycle TDD dont le test rouge porte l'étiquette du scénario d'origine ; commit à clé seule `<CLÉ> : régression <scénario>, …`, et, en copie de travail, patch d'objet `demande` |
| passer au rapport | V5, avec les verdicts que le script a rendus |

Sans binôme, chaque critère porte « non joué (pas de campagne Agent2Test) », et la demande passe au rapport.

## 6. Pièges connus

- **Remise sur un arbre modifié** : le verdict ne se rattacherait à aucun commit ; la remise attend.
- **Remise sans les patchs** : la campagne jouerait un code qui n'a pas les scénarios ; la remise attend leur présence dans l'arbre de la demande.
- **Lire le verdict dans le JSON** : le script fait foi ; une lecture parallèle finirait par diverger.
- **Corriger un défaut présumé** : seul un défaut confirmé, sans désaccord, ouvre un cycle de lui-même.

## 7. Tests (scénarios)

Jeux d'essai : le journal d'exemple de la spécification d'Agent2Test (module `journal`), empreintes calculées sur le projet de démonstration, et ses variantes.

| Scénario | Vérifie | Cas |
|---|---|---|
| BI1 | D10.INV-1 | avec un fichier suivi modifié, la remise attend ; arbre propre et script sans écart, elle est rendue au format du skill, sans moteur |
| BI2 | D10.INV-1 | la remise de l'exemple ECR-77 prévoit S01 et S04 jouables, S02 limité au back et S03 en attente de Q1 |
| BI3 | D10.INV-2 | sur le journal d'exemple, l'acceptation de chaque critère est la ligne du script, reprise telle quelle |
| BI4 | D10.INV-2 | un journal dont le code a changé depuis la campagne donne « non joué », présenté avec sa raison |
| BI5 | D10.INV-3 | le défaut confirmé de S04 rouvre S04 au rouge, avec l'étape 3 et ses signaux en entrée de la fiche |
| BI6 | D10.INV-3 | au-delà de trois corrections du même scénario, le défaut est présenté au développeur |
| BI7 | D10.INV-3 | un défaut contesté en CP-3 n'ouvre aucun cycle et va au développeur |
| BI8 | D10.INV-4 | une régression sur `ECR-12-S03` est présentée ; « corriger » ouvre un cycle dont le test porte l'étiquette `ECR-12-S03` |
| BI9 | D10.INV-4 | aucun fichier n'est écrit hors du projet de l'application et des données d'Agent2Dev ; aucune connexion vers Agent2Test |
| BI10 | D10.INV-4 | en mode parallèle, un journal hors de `travail/ECR-77/acceptation/` est refusé |
| BI11 | D10.INV-2 | « sans binôme » donne « non joué (pas de campagne Agent2Test) » pour chaque critère |
| BI12 | D10.INV-1 | en copie de travail, un patch non appliqué empêche la remise, qui le nomme ; une fois appliqué par `git am`, la remise cite le commit de l'arbre de la demande |

## 8. Fichiers à produire

- `src/agents/binome/agent.js`, `src/agents/binome/remise.js`, `src/agents/binome/lecture.js`, `src/agents/binome/defauts.js`
- `test/binome/*.test.js`, `test/fixtures/journaux/`
