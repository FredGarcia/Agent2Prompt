---
name: assemblage
description: Assemblage et transmission des skills de ticket (fabrique abstraite et fabrique de la pile, Monteur, contenu d'un skill de ticket, boîte à outils de la racine, contrôle de l'héritage H1 à H6, transmission par bundle.mjs, provenance, commandes de generer.mjs). À lire avant de générer un arbre.
dimensions: [D2]
status: active
---

# Module `assemblage` (D2)

Pour chaque nœud de l'arbre vérifié, le Monteur assemble un skill avec les pièces que lui donne la fabrique de la pile, contrôle son héritage, puis l'écrit et en tire la transmission par `tools/bundle.mjs`, dont il vérifie l'aller-retour. Le générateur ne choisit rien : la composition et les options viennent du ticket, qualifié avant ; l'assemblage est du code sur des fichiers, déterministe, sans token consommé (D2.INV-1).

## 1. Fabrique et Monteur

| Composant | Rôle | Patron |
|---|---|---|
| `FabriqueSkillTicket` | la famille de fichiers d'un nœud : consigne, modules, recette, sous-tickets, agents, commande ; même squelette de consigne pour tous les nœuds, crochets selon la nature du nœud et selon la pile | Fabrique abstraite, Patron de méthode |
| `FabriqueJavaAngularPostgreSQL` | les crochets de la pile : référentiels Java et Angular, agents de couche, commandes de test ; seule fabrique concrète en 1.0.0 (point d'extension E1) | Fabrique concrète |
| `Monteur` | l'assemblage nœud par nœud : blocs du référentiel copiés, puis paramétrés ; contrôle de l'héritage ; écriture et transmission | Monteur, Prototype |

La fabrique abstraite seule ne produit rien : ses crochets restent à définir par une fabrique concrète.

## 2. Contenu d'un skill de ticket

Le skill du nœud `ABCDE-3620-1.2` s'appelle `ticket-abcde-3620-1-2`, la référence en minuscules et tirets, en version 1.0.0.

| Fichier | Contenu | Nœuds |
|---|---|---|
| `manifest.json` | identité ; place dans l'arbre (racine, parent, enfants, dépendances, dossier) ; provenance de chaque héritage (`ticket.herites`) ; générateur, fabrique et orchestrateur (`ticket.genere_par`) | tous |
| `SKILL.md` | la consigne, en patron de méthode : place dans l'arbre, objectif et critères, méso-contrats et options, démarrage, analyse ou coordination, ratification, transformation par slot ou clôture, remise, champ d'observation, invariants, fichiers | tous |
| `ticket.toml` | le ticket du nœud, recopié tel quel | tous |
| `modules/meso-contrats/` | méso-contrats de la composition et transverses, copiés du référentiel | tous |
| `modules/option-<couche>-<option>/` | option copiée du référentiel, puis paramétrée : instances du ticket, slots et étiquettes, preuves retenues et preuves sans objet selon les valeurs choisies | feuilles |
| `modules/recette/` | critères à prouver ; preuves des options, exigences des transverses, commandes de la pile pour une feuille ; preuve par agrégation pour un nœud composé | tous |
| `modules/sous-tickets/` | sous-arbre, ordre de résolution, préalables extérieurs, règles de coordination et de clôture | nœuds composés |
| `modules/methode/` | sections de l'orchestrateur, mot pour mot, selon la nature du nœud | tous |
| `modules/invariants/` | ce dont le skill hérite, les correspondances entre la fiche de l'orchestrateur et le skill, et les invariants de l'orchestrateur, mot pour mot | tous |
| `socle/SKILL.md` | socle back-front à la version qu'épingle l'orchestrateur | tous |
| `references/java.md`, `references/angular.md` | référentiels de la pile des couches touchées | feuilles |
| `projet/meso-contrats.md` | invariants du projet dans l'état où le skill a été produit ; au démarrage, la copie du projet fait foi | tous |
| `agents/<skill>-<couche>.md` | un agent par couche touchée, au format des sous-agents de Gemini CLI 0.67.0 | feuilles |
| `commandes/ticket/<nœud>.toml` | la commande Gemini CLI qui lance le skill dans une session | tous |
| boîte à outils de l'arbre | documents de la clé, kits, champ, vue, scripts de contrôle, références et sous-agents de rôle, observateurs (modules `documents-kits`, `champ`, `vue`) | racine |

Chaque skill cite, au début de sa consigne comme dans son manifeste, le générateur et sa version, sa fabrique, le référentiel et l'orchestrateur dont il est issu (D2.INV-4).

## 3. Contrôle de l'héritage

| Règle | Contenu |
|---|---|
| H1 | la provenance déclarée est complète : méthode, invariants de l'orchestrateur, socle, invariants du projet ; pour une feuille, le référentiel de la pile de chaque couche touchée ; pour la racine, toute la boîte à outils de l'arbre |
| H2 | chaque invariant de l'orchestrateur, à la version déclarée, figure mot pour mot dans `modules/invariants`, et leur nombre est celui déclaré |
| H3 | chaque section de méthode déclarée figure mot pour mot dans `modules/methode`, et chaque section d'un extrait de la boîte à outils dans son fichier |
| H4 | chaque copie a l'empreinte que déclare le manifeste, et elle est identique à sa source à la version épinglée, courante ou archivée ; un module de skill à la version de son skill ; un script tiré d'un bloc de code, à ce bloc ; un script du générateur, à sa version du dépôt |
| H5 | chaque invariant cité par la consigne, les modules et les agents est défini par l'orchestrateur ou par le socle ; celui d'un autre skill se cite avec son nom, `agent-tdd-jira:D10.INV-1` |
| H6 | le ticket transmis est celui que nomme le manifeste |

Le Monteur applique ces règles avant d'écrire : un skill qui omet ou altère un invariant n'est pas écrit, ni aucun autre de l'arbre (D2.INV-2). `generer.mjs verifier` les applique à des transmissions, table d'intégrité comprise, contre les sources du dépôt. Un skill racine produit par le prototype reste vérifiable avec la boîte à outils de son lot ; un skill produit par le générateur exige toute la boîte.

## 4. Transmission et reproductibilité

Chaque skill s'écrit dans `<sortie>/<skill>/` et sa transmission dans `<sortie>/transmissions/<skill>-1.0.0.md`, au format de `tools/bundle.mjs` : en-tête, fichiers délimités, table d'intégrité. La transmission se relit en redonnant exactement les fichiers du skill ; la même entrée redonne les mêmes fichiers, octet pour octet : rien n'est tiré au hasard ni daté, et des tickets en fins de ligne CRLF donnent les mêmes transmissions (D2.INV-3). `generer` ne remplace qu'un dossier qui contient déjà un skill de ticket généré (D2.INV-4).

Les transmissions attendues des deux arbres d'exemple sont versionnées dans `exemples/ABCDE-3620-skills/transmissions/` et `exemples/ABCDE-3512-skills/transmissions/`. Elles changent dès que change une source dont héritent les skills, ou la version du générateur : la recette le signale, et elles se régénèrent par `generer`.

## 5. Commandes

```bash
node <dépôt>/specs/generateur-skill-ticket/outils/generer.mjs generer <arbre> --sortie <dossier> [--referentiel <chemin>] [--invariants-projet <chemin>] [--profondeur-max <n>] [--fabrique <nom>]
node <dépôt>/specs/generateur-skill-ticket/outils/generer.mjs verifier <transmission.md | dossier>... [--invariants-projet <chemin>]
```

`generer` vérifie l'arbre (module `arbre`), construit les skills, contrôle leur héritage, puis les écrit ; rien n'est écrit au moindre écart.

## 6. Recette

| Invariant | Preuves |
|---|---|
| D2.INV-1 | `tests/generer.test.mjs` : « options copiées puis paramétrées : instances relues à l'identique, preuves selon les valeurs retenues » ; « un arbre non conforme ne donne aucun skill » ; « famille de fichiers : agents de couche pour les feuilles, sous-agents de rôle et observateurs sur la racine, coordination pour les nœuds composés, une commande par nœud » ; « fabrique abstraite : les crochets de la pile restent à définir par une fabrique concrète » ; « patron de méthode : même squelette de consigne pour tous les nœuds » |
| D2.INV-2 | `tests/generer.test.mjs` : « P3 : chaque transmission attendue passe le contrôle d'intégrité et d'héritage » ; « P3 : les 33 invariants de l'orchestrateur, mot pour mot, dans chaque skill » ; « P3 : sections de la méthode, socle, référentiels de la pile et invariants du projet » ; « P1 : une fabrique qui omet un invariant ne produit rien » ; « P1 : une fabrique qui affaiblit un invariant ne produit rien » ; « P1, P3 : transmission rejetée » |
| D2.INV-3 | `tests/generer.test.mjs` : « P2 : chaque transmission est celle attendue, octet pour octet » ; « P2 : chaque transmission se relit en redonnant exactement les fichiers du skill écrit » ; « P2 : la même entrée redonne les mêmes fichiers, sans rien tirer au hasard ni dater » ; « P2 : des tickets en fins de ligne CRLF donnent les mêmes transmissions » ; « transmission altérée sans recalculer sa table : empreinte fausse » |
| D2.INV-4 | `tests/generer.test.mjs` : « 1.0.0 : chaque skill cite generateur-skill-ticket et la version de son manifeste » ; « le Monteur n'écrase pas un dossier qui n'est pas un skill de ticket généré » ; « un manifeste sans provenance n'est pas un skill de ticket » |
