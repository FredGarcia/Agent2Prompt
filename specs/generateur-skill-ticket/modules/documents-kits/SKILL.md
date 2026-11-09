---
name: documents-kits
description: Documents de la clé Jira, sous-agents de rôle et kits d'un arbre de skills de ticket (boîte à outils du skill racine, rédacteur, analyste, relecteur et qualité, demande.json, us.md et fichier Gherkin, rattachement des critères, kits dev, test et démo, remise à Agent2Test, scripts de contrôle). À lire pour suivre la racine d'un arbre installé.
dimensions: [D4]
status: active
---

# Module `documents-kits` (D4)

Le skill racine porte la boîte à outils de l'arbre : les documents de la clé Jira selon agent-tdd-jira, les kits dev, test et démo, les quatre sous-agents de rôle et leurs références, copiées des skills du dépôt à leur version épinglée, avec les scripts de contrôle. Les feuilles et les sous-agents lisent ces références dans le skill racine installé, `.gemini/skills/ticket-<clé>/` : rien n'est dupliqué d'un nœud à l'autre (D4.INV-3).

## 1. Boîte à outils de la racine

| Fichier du skill racine | Source | Usage |
|---|---|---|
| `references/agent-tdd-jira.md`, `references/agent-tdd-jira/{ingestion-jira,us-criteres,analyse-demande,cycle-tdd,tracabilite}.md` | agent-tdd-jira, point d'entrée et modules, en entier | rédacteur, agents de couche, kit test |
| `references/agent-tdd-jira/binome-agent2test.md` | agent-tdd-jira, module `binome-agent2test`, § 3 et § 4 | étiquettes du binôme, remise du plan |
| `references/agent2test/plan.md`, `references/agent2test/remise.md` | agent2test, modules `plan` § 2 et `echange` § 3 | jouabilité, format `agent2test.remise/1` |
| `references/analyse-projet.md`, `references/analyse-projet/cartographie.md` | analyse-projet, point d'entrée et module `cartographie` | analyste |
| `references/java/revue.md`, `references/angular/revue.md` | java et angular, modules `revue` | relecteur |
| `references/sonarqube.md`, `references/sonarqube/examen-local.md` | sonarqube, point d'entrée et module `examen-local` | qualité |
| `outils/extraire-jira.mjs`, `outils/controler-criteres.mjs` | agent-tdd-jira, blocs de code de `ingestion-jira` § 3 et `us-criteres` § 7, à l'identique | extraction d'une capture MHTML, contrôle des US et des scénarios |
| `outils/verifier-documents.mjs`, `outils/verifier-kits.mjs`, `outils/champ.mjs`, `outils/vue.mjs`, `outils/invariants.mjs` | le générateur, tels quels | contrôles des documents et des kits, champ d'observation, vue augmentée, comparaison du fichier d'invariants du projet à l'état de production de chaque skill |
| `outils/rattachement.json` | produit par la fabrique, `skill-ticket.rattachement/1` | critères de l'arbre rattachés aux critères de la clé, soutiens, énoncés, couches, images de l'objectif |

Chaque fichier de la boîte est identique à sa source à sa version épinglée, sous le contrôle de l'héritage (module `assemblage`, H3 et H4) ; un invariant d'un autre skill se cite avec son nom, `agent-tdd-jira:D10.INV-1`. Un skill racine exige la boîte de sa version : le script des invariants depuis la 1.0.1.

Au démarrage, chaque nœud compare la copie du projet du fichier d'invariants à l'état sur lequel son skill a été produit, sans lire la copie du skill :

```bash
node .gemini/skills/ticket-<clé>/outils/invariants.mjs comparer <skill du nœud> [--projet docs/c7e/meso-contrats.md]
```

Copies identiques : code 0. Copie du projet absente, copie du skill altérée, ou copies différentes, avec les sections qui diffèrent et leurs lignes : code 1. Les sections où restent des valeurs ADAPTER sont signalées dans tous les cas. La copie du projet fait foi, et seule elle se lit ; absente, la copie du skill en tient lieu.

## 2. Sous-agents de rôle

| Sous-agent | Invoqué par | Méthode | Outils |
|---|---|---|---|
| `ticket-<clé>-redacteur` | la racine, avant la ratification de l'arbre | agent-tdd-jira : `demande.json`, `us.md`, fichier Gherkin | lecture et écriture, limitée à `docs/demandes/<clé>/` |
| `ticket-<clé>-analyste` | chaque feuille, à l'analyse | analyse-projet, module `cartographie` ; skill4appli s'il est installé | lecture seule |
| `ticket-<clé>-relecteur` | chaque feuille, avant le slot É6 | java ou angular en mode revue | lecture seule |
| `ticket-<clé>-qualite` | chaque feuille, au slot É6 | sonarqube, module `examen-local` ; jeton par la seule variable `SONAR_TOKEN`, aucune écriture vers SonarQube sans validation explicite | lecture seule |

Chaque sous-agent travaille dans son propre contexte (D4.INV-3). Les agents de couche des feuilles réalisent leurs scénarios en cycle TDD d'agent-tdd-jira : les scénarios du fichier Gherkin qui portent l'un des critères d'acceptation de la feuille et l'étiquette de sa couche, un à un, test étiqueté d'abord, accepté par le développeur avant le suivant, commité `<CLÉ> Snn : [É<n>-<DOMAINE>] …`, avec la ligne `Sous-ticket : <référence>` dans le corps.

## 3. Documents de la clé

Le k-ième critère de la racine devient `<CLÉ>-CAkk`, repris mot pour mot ; chaque critère d'un sous-ticket se rattache aux critères de la clé par la chaîne de ses soutiens, et se prouve par leurs scénarios, de sa couche pour une feuille (D4.INV-1). Un critère de la racine jugé non vérifiable remonte au développeur, sans reformulation par le rédacteur.

Déroulé à la racine : le rédacteur écrit les trois documents, aux statuts « à valider » ; `controler-criteres.mjs` et `verifier-documents.mjs` passent sans écart ; l'arbre se présente avec eux, et sa ratification tient lieu de validation des documents ; les statuts passent à « validé », les contrôles repassent, la ratification se dépose dans le champ, puis les documents se commitent seuls sur la branche de l'arbre : `<CLÉ> : [É6-C7E] docs(demande): US, critères d'acceptation et scénarios ratifiés`. Sans capture MHTML, `demande.json` part du ticket racine, avec la limite « capture MHTML absente ».

```bash
node .gemini/skills/ticket-<clé>/outils/verifier-documents.mjs docs/demandes/<clé> --rattachement .gemini/skills/ticket-<clé>/outils/rattachement.json
```

## 4. Kits

À la clôture, la racine relève les contributions aux kits dans la remise de chaque feuille, puis écrit dans `docs/demandes/<clé>/kits/` trois manifestes fermés, `skill-ticket.kit/1`, chaque fichier cité avec son empreinte sha256 (D4.INV-2) :

| Kit | Contenu |
|---|---|
| dev, `dev.json` | branche, commits dans l'ordre de l'historique (empreinte, sous-ticket, titre), remise de chaque nœud, chemin de la remise à Agent2Test |
| test, `test.json` | plan (`us.md`, fichier Gherkin), `demande.json`, tests et scénarios qu'ils portent, matrice de traçabilité, ouverture de la campagne d'Agent2Test |
| démo, `demo.json` | parcours tiré des scénarios `@front` d'un critère validé, données et commandes de lancement, captures de l'écran livré comparées aux images de l'objectif |

La remise `agent2test.remise/1` se rédige en dernier, au commit de tête de la branche, avec la prévision de jouabilité du module `plan` d'Agent2Test. Les kits, comme le champ d'observation, ne se commitent pas avant la campagne, pour que le commit remis reste la tête de la branche.

```bash
node .gemini/skills/ticket-<clé>/outils/verifier-kits.mjs docs/demandes/<clé> --rattachement .gemini/skills/ticket-<clé>/outils/rattachement.json --depot
```

Avec `--depot`, le contrôle se fait aussi dans le dépôt : branche, commits, ligne `Sous-ticket` de chaque commit de feuille, tête, aucun fichier suivi modifié.

## 5. Projet d'exemple résolu

`exemples/ABCDE-3620-resolution/` est un projet réduit tel que l'arbre ABCDE-3620 le laisse à sa clôture : documents de la clé, remises, matrice, parcours, données, captures, kits et remise à Agent2Test. Ses fichiers de code et de test entrent chacun une fois dans l'historique, que la recette reconstruit à l'identique dans un dépôt Git temporaire. La recette contrôle ce projet avec les copies des scripts que livre la transmission du skill racine, puis des altérations. La rédaction des documents et l'assemblage des kits par le modèle s'essaient sur le poste, comme la recette P4 (module `installation`).

## 6. Recette

| Invariant | Preuves |
|---|---|
| D4.INV-1 | `tests/documents-kits.test.mjs` : « P8 : les documents de l'exemple passent controler-criteres et verifier-documents, livrés par le skill racine » ; « P8 : écart relevé » ; « P8 : une image de l'objectif d'une feuille doit figurer parmi les pièces de demande.json » ; `tests/generer.test.mjs` : « lot 4 : rattachement des critères de l'arbre aux critères d'acceptation de la clé » ; `tests/bout-en-bout.test.mjs` : « les contrôles des consignes passent sur la résolution, avec les scripts du skill racine installé » |
| D4.INV-2 | `tests/documents-kits.test.mjs` : « P9 : les kits de l'exemple sont complets et vérifiés, et la remise est conforme » ; « P9 : l'historique se reconstruit à l'identique, et le kit dev s'y vérifie avec --depot » ; « P9 : écart relevé » ; « P9 : chaque image de l'objectif a sa capture de l'écran livré, comparée » ; « P9 : prévision de jouabilité selon les règles du module plan d'Agent2Test » |
| D4.INV-3 | `tests/generer.test.mjs` : « lot 4 : la racine porte la boîte à outils, chaque fichier identique à sa source à sa version épinglée » ; « lot 4 : sous-agents de rôle en lecture seule, sauf le rédacteur ; références lues dans le skill racine installé » ; « lot 4 : transmission de la racine rejetée » ; « 1.0.1 : la racine fait rédiger les documents de la clé par le sous-agent rédacteur, nommé comme son agent » ; « 1.0.1 : un skill racine produit en 1.0.0 reste vérifiable sans le script des invariants ; en 1.0.1, le script est requis » ; `tests/invariants.test.mjs` : « invariants : copies identiques, code 0 ; seule la copie du projet est à lire, et les valeurs ADAPTER restées sont signalées » ; « invariants : une copie du projet en fins de ligne CRLF reste identique » ; « invariants : copie du projet différente, code 1, avec les sections qui diffèrent et leurs lignes » ; « invariants : copie du projet absente, code 1, avec la copie du skill qui en tient lieu » ; « invariants : copie du skill altérée, code 1, avant toute comparaison » ; « invariants : ligne de commande, depuis la racine du projet ; codes de sortie » ; `tests/bout-en-bout.test.mjs` : « 1.0.1 : dans le workspace d'ABCDE-3512, la comparaison des invariants de la consigne dit la copie du projet absente, identique, puis différente » |
