# Prototype : skill de ticket C7E

**Statut** : lots 1 à 4 livrés : modèle et vérification de l'arbre, fabrique et Monteur des skills de ticket, installation de l'arbre dans Gemini CLI, puis documents de la clé Jira, sous-agents de rôle et kits dev, test et démo ; les choix du lot 4 attendent la validation du développeur. Les lots 5 à 7 suivent, chacun validé par le développeur. Rien ici n'est encore une spécification versionnée : le prototype reste hors de `specs/` jusqu'à son bilan, après quoi il entrera dans l'orchestrateur C7E, probablement en version majeure, ou dans une spécification de générateur à part.

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

Ratifié ensuite, le même jour, après le lot 2 :

10. **Documents d'agent-tdd-jira** : le skill racine rédige les documents de la clé Jira avec agent-tdd-jira, inclus et épinglé comme les référentiels Java et Angular : `demande.json` (avec les commentaires et les images de l'objectif), `us.md` (les critères de la racine deviennent `<CLÉ>-CA01`…) et le fichier Gherkin, chaque scénario étiqueté par les critères qu'il prouve. Chaque feuille reprend les scénarios des critères qu'elle soutient. Contrôle : `controler-criteres.mjs` d'agent-tdd-jira, sans écart.
11. **Sous-agents de rôle**, chacun dans son contexte, tirés des skills du dépôt : rédacteur (agent-tdd-jira), analyste en lecture seule (analyse-projet, skill4appli s'il est installé), relecteur (java et angular en mode relecture), qualité (sonarqube, ses règles de jeton et de validation inchangées). Les agents de couche suivent le cycle TDD d'agent-tdd-jira.
12. **Trois kits** : dev (branche de l'arbre, commits par slot, `remise.md`, remise `agent2test.remise/1`) ; test (`us.md`, fichier Gherkin, tests déduits, matrice de traçabilité, plan de la campagne d'Agent2Test) ; démo (parcours de démonstration tiré des scénarios, données et commandes de lancement, captures de l'écran livré comparées aux images de l'objectif).
13. **Agent2Test tel quel** ; **Agent2Dev hors du prototype** : schéma v2 de `demande.json` avec les liens vers d'autres tickets (agent-tdd-jira), et entrée « demande » d'Agent2Dev à côté du MHTML (son D1.INV-5 à réécrire, version majeure probable), en évolutions de leurs spécifications.
14. **Découpage des lots** : un lot « documents et kits » prend la place 4, après l'installation ; l'observation passe au lot 5, la vue augmentée au lot 6, la recette et le bilan au lot 7. Critères ajoutés : P8 et P9.

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

## Skills de ticket (lot 2)

Pour chaque nœud de l'arbre vérifié, le Monteur assemble un skill avec les pièces que lui donne la fabrique de la pile, l'écrit dans un dossier, en tire la transmission par `tools/bundle.mjs`, vérifie l'aller-retour, puis contrôle l'héritage. Le générateur ne choisit rien : la composition et les options viennent du ticket, qualifié avant ; l'assemblage est du code sur des fichiers, déterministe, sans aucun token consommé.

Le skill du nœud `ABCDE-3620-1.2` s'appelle `ticket-abcde-3620-1-2` (référence en minuscules et tirets), en version 1.0.0 :

| Fichier | Contenu | Nœuds |
|---|---|---|
| `manifest.json` | identité, place dans l'arbre (racine, parent, enfants, dépendances, dossier), provenance de chaque héritage (`ticket.herites`), fabrique et versions | tous |
| `SKILL.md` | la consigne, patron de méthode : place dans l'arbre, objectif et critères, méso-contrats et options, démarrage, analyse ou coordination, ratification, transformation par slot ou clôture, remise, retours du développeur, invariants, fichiers | tous |
| `ticket.toml` | le ticket du nœud, recopié tel quel | tous |
| `modules/meso-contrats/` | méso-contrats de la composition et transverses, copiés du référentiel | tous |
| `modules/option-<couche>-<option>/` | option copiée du référentiel, puis paramétrée : instances du ticket, slots et étiquettes (§ 4 du module `referentiel`), preuves retenues et preuves sans objet selon les valeurs choisies | feuilles |
| `modules/recette/` | critères à prouver ; preuves des options, exigences des transverses, commandes de la pile pour une feuille ; preuve par agrégation pour un nœud composé | tous |
| `modules/sous-tickets/` | sous-arbre, ordre de résolution du sous-arbre, préalables extérieurs, règles de coordination et de clôture | nœuds composés |
| `modules/methode/` | sections de l'orchestrateur recopiées mot pour mot : § 2, 5.1, 5.2, 6, 7.1, 8 et 11.5 pour une feuille, § 11.5 pour un nœud composé | tous |
| `modules/invariants/` | ce dont le skill hérite, les correspondances entre la fiche de l'orchestrateur et le skill, et les 33 invariants de l'orchestrateur mot pour mot | tous |
| `socle/SKILL.md` | socle back-front à la version qu'épingle l'orchestrateur | tous |
| `references/java.md`, `references/angular.md` | référentiels de la pile des couches touchées | feuilles |
| `projet/meso-contrats.md` | invariants du projet dans l'état où le skill a été produit ; au démarrage, la copie du projet fait foi | tous |
| `agents/<skill>-<couche>.md` | un agent par couche touchée, au format des sous-agents de Gemini CLI 0.67.0 | feuilles |
| `commandes/ticket/<nœud>.toml` | la commande Gemini CLI qui lance le skill dans une session, `/ticket:<nœud>` (lot 3) | tous |
| `modules/documents/`, `modules/kits/`, `outils/`, `references/<skill>…`, `agents/<skill>-<rôle>.md` | boîte à outils de l'arbre : documents de la clé, kits, scripts de contrôle, références des sous-agents de rôle et ces sous-agents (lot 4) | racine |

L'arbre d'essai donne cinq skills, de 11 à 37 fichiers ; leurs transmissions attendues sont versionnées dans `exemples/ABCDE-3620-skills/transmissions/` : de 69 000 à 112 000 caractères pour les nœuds, 336 000 pour la racine, qui porte la boîte à outils, contre 230 000 pour la transmission de l'orchestrateur. Un sous-agent ne charge que ses références ; la mesure du contexte chargé reste celle du lot 7.

### Contrôle de l'héritage

| Règle | Contenu |
|---|---|
| H1 | la provenance déclarée est complète : méthode, invariants de l'orchestrateur, socle, invariants du projet, et, pour une feuille, le référentiel de la pile de chaque couche touchée ; pour la racine, depuis le lot 4, toute la boîte à outils |
| H2 | chaque invariant de l'orchestrateur, à la version déclarée, figure mot pour mot dans `modules/invariants`, et leur nombre est celui déclaré |
| H3 | chaque section de la méthode déclarée figure mot pour mot dans `modules/methode`, et chaque section d'un extrait de la boîte à outils dans son fichier |
| H4 | chaque copie a l'empreinte que déclare le manifeste, et elle est identique à sa source à la version épinglée, courante ou archivée ; un module de skill à la version de son skill ; un script tiré d'un bloc de code, à ce bloc |
| H5 | chaque invariant cité par la consigne, les modules et les agents est défini par l'orchestrateur ou par le socle ; celui d'un autre skill se cite avec son nom, `agent-tdd-jira:D10.INV-1` |
| H6 | le ticket transmis est celui que nomme le manifeste |

Le Monteur applique ces règles avant d'écrire : un skill qui omet ou altère un invariant n'est pas écrit, ni aucun autre de l'arbre. `generer.mjs verifier` les applique à des transmissions, avec leur table d'intégrité, contre les sources du dépôt.

### Choix du lot 2, validés le 8 novembre 2026

1. **La fiche se répartit** : le skill, ratifié et immuable, tient la première partie de la fiche de transformation ; l'analyse (d=0) produit, avant la ratification, la copie de travail de `ticket.toml` et `analyse.md` (cartographie, configuration retenue, stratégie, tests déduits), ratifiées avec le skill ; la seconde partie va dans `remise.md`. Les retours du développeur s'ajoutent à `retours.md`, en ajout seul, en attendant le champ d'observation du lot 5.
2. **Dossiers** : `docs/demandes/<clé>/` pour la racine, `docs/demandes/<clé>/<référence>/` pour chaque sous-ticket.
3. **Une branche et une clé pour tout l'arbre**, celles du ticket Jira racine : chaque commit commence par `ABCDE-3620 : ` et cite le sous-ticket dans son corps, ce qu'accepte le hook `commit-msg` du kit `agents-paralleles-gitlab` (son D2.INV-2) ; D4.INV-1 et D4.INV-2 restent tenus.
4. **Invariants du projet** : le skill garde l'état sur lequel il a été produit et le compare au démarrage à la copie du projet, qui fait foi (D8.INV-1).
5. **Méthode par extraits** : les sections utiles de l'orchestrateur, mot pour mot, plutôt que son point d'entrée entier ; une correspondance dit comment chaque invariant qui parle de la fiche s'applique au skill.
6. **Preuves paramétrées** : une preuve que le référentiel conditionne à une valeur (`remplacement : …`, `create : …`) est marquée sans objet quand le ticket ne la retient pas.
7. **Agents** : un par couche touchée, outils intégrés de Gemini CLI ; leur installation dans `.gemini/agents/` et leur appel sont faits au lot 3.
8. **Version** : 1.0.0 pour tout skill de ticket généré ; une régénération après une modification du ticket garde ce numéro, revu au lot 3.

## Installation dans Gemini CLI (lot 3)

`outils/installer-arbre.mjs` installe un arbre entier dans le workspace de Gemini CLI, à partir de ses transmissions, et le lance nœud par nœud :

| Commande | Effet |
|---|---|
| `installer <dossier ou transmissions>` | vérifie chaque transmission (intégrité et héritage, lot 2) et que l'ensemble forme un arbre complet ; installe les skills par `tools/installer.mjs` ; copie les agents des feuilles dans `.gemini/agents/` et les commandes des nœuds dans `.gemini/commands/ticket/` ; écrit le relevé et une copie des transmissions dans `.gemini/skill-ticket/<clé>/` ; masque le tout à Git, comme `tools/installer.mjs` masque les skills. Rien n'est écrit au moindre écart ; un fichier modifié depuis l'installation n'est remplacé qu'avec `--forcer` |
| `liste` | arbres installés, et état de chaque nœud d'après son dossier : documents à rédiger, arbre à ratifier, en attente, prêt, analysé, ratifié, prêt à clore, clos |
| `verifier [<clé>]` | fichiers installés intacts ; si Gemini CLI est là, ses skills découverts et activés, ses agents chargés sans erreur, et un dossier non fiable signalé |
| `lancer <référence>` | ouvre Gemini CLI dans le workspace, en mode interactif, sur la phrase qui active le skill du nœud : `gemini -i "Active le skill …"` |
| `retirer <clé>` | archive les transmissions dans `docs/demandes/<clé>/skills/`, où elles se versionnent avec le ticket, puis retire skills, agents, commandes et relevé |

Gemini CLI se désigne par `--gemini <exécutable>` ou par la variable `SKILL_TICKET_GEMINI`, sinon `gemini`. Le lancement ne passe ni `--skip-trust` ni un mode d'approbation automatique : la confiance du dossier et les approbations restent au développeur.

### Cycle de vie d'un nœud

Chaque nœud se traite dans **sa propre session** de Gemini CLI, avec son propre contexte (décision 8), que le développeur lance par la commande du nœud ou par `lancer`. Aucun skill n'active celui d'un sous-ticket dans sa session. Les états se lisent dans les dossiers du ticket :

| Nœud | États |
|---|---|
| racine | documents à rédiger (lot 4) ; arbre à ratifier (présentation, puis ratification) ; en cours (état des sous-tickets, prochain nœud prêt et sa commande) ; prêt à clore (puis kits, lot 4) ; clos |
| nœud composé | en cours ; prêt à clore ; clos |
| feuille | en attente de la ratification de l'arbre, ou d'un ticket dont elle dépend ; prêt ; analysé, à ratifier ; ratifié, en transformation ; clos |

Une ratification s'écrit dans `retours.md` sur une ligne de forme fixe, `- AAAA-MM-JJ, <nom> : arbre ABCDE-3620 ratifié` sur la racine, `- AAAA-MM-JJ, <nom> : ABCDE-3620-1.2 ratifié` sur une feuille, ou `… non ratifié, <motif>` : les skills et `liste` la reconnaissent sans interprétation. Un nœud est clos quand son `remise.md` existe. Une feuille confie chaque couche à son agent par l'outil `invoke_agent`.

### Contrat avec Gemini CLI

Vérifié avec Gemini CLI 0.67.0, sans modèle : `gemini skills list`, lancé dans le workspace de confiance, découvre et active les cinq skills ; il charge sans erreur les sept agents, trois agents de couche et, depuis le lot 4, quatre sous-agents de rôle, alors qu'il refuse un agent au nom ou aux outils invalides ; dans un dossier non fiable, il ignore skills et agents. Le job `contrat-gemini` du workflow le rejoue sous Linux et sous Windows.

### Recette P4 sur le poste du développeur

La présentation de l'arbre et l'attente de la ratification demandent un modèle : elles se vérifient dans Gemini CLI, sur le poste. Dans un workspace d'essai, dossier vide ou dépôt Git de test, marqué de confiance :

1. `node <dépôt>/prototypes/skill-ticket/outils/installer-arbre.mjs installer <dépôt>/prototypes/skill-ticket/exemples/ABCDE-3620-skills/transmissions`
2. `node <dépôt>/prototypes/skill-ticket/outils/installer-arbre.mjs verifier ABCDE-3620` : « skills découverts et activés, agents chargés sans erreur ».
3. `node <dépôt>/prototypes/skill-ticket/outils/installer-arbre.mjs lancer ABCDE-3620` ; Gemini CLI demande d'autoriser le skill à sa première activation. Attendu : le skill racine signale l'absence de `docs/c7e/meso-contrats.md` (normal dans un workspace d'essai), présente l'arbre (cinq nœuds), les méso-contrats (M04, M02, M03), l'ordre de résolution, les critères et la façon dont chacun est soutenu, puis attend la ratification, sans modifier aucun fichier.
4. Ratifier : la ligne `- AAAA-MM-JJ, <nom> : arbre ABCDE-3620 ratifié` s'ajoute à `docs/demandes/ABCDE-3620/retours.md`, et le skill indique ABCDE-3620-1.1 avec sa commande, `/ticket:abcde-3620-1-1`.
5. `node <dépôt>/prototypes/skill-ticket/outils/installer-arbre.mjs liste` : racine « en cours », ABCDE-3620-1.1 « prêt ».
6. `node <dépôt>/prototypes/skill-ticket/outils/installer-arbre.mjs retirer ABCDE-3620 --sans-archive` pour finir.

### Choix du lot 3, validés le 8 novembre 2026

1. **Une session par nœud**, lancée par le développeur ; la racine et les nœuds composés reconnaissent leur état d'après les dossiers, et indiquent le prochain nœud prêt avec sa commande.
2. **Ratification en une ligne de forme fixe** dans `retours.md`, reconnue par les skills et par `liste`, en attendant le champ d'observation du lot 5.
3. **Commandes dans les transmissions** (`commandes/ticket/<nœud>.toml`), copiées par l'installateur comme les agents ; tout ce que l'installation écrit hors des skills est relevé dans `.gemini/skill-ticket/<clé>/` et masqué à Git.
4. **Retrait avec archivage** des transmissions dans `docs/demandes/<clé>/skills/` : le skill ratifié y est rangé comme l'était la fiche (D3.INV-3).
5. **Version 1.0.0 maintenue** : l'installation se reconnaît à sa table d'intégrité ; une transmission régénérée remplace une installation intacte, et refuse une installation modifiée, sauf `--forcer`.
6. **Contrat Gemini CLI épinglé à 0.67.0**, la version de référence du dépôt (skill explication-hote-ia).

## Documents et kits (lot 4)

Le skill racine porte la **boîte à outils de l'arbre** (décisions 10 à 12) : les documents de la clé Jira selon agent-tdd-jira, les kits dev, test et démo, les quatre sous-agents de rôle et leurs références, copiées des skills du dépôt à leur version épinglée, avec les scripts de contrôle. Les feuilles et les sous-agents lisent ces références dans le skill racine installé (`.gemini/skills/ticket-<clé>/`) : rien n'est dupliqué d'un nœud à l'autre.

### Boîte à outils de la racine

| Fichier du skill racine | Source | Usage |
|---|---|---|
| `references/agent-tdd-jira.md`, `references/agent-tdd-jira/{ingestion-jira,us-criteres,analyse-demande,cycle-tdd,tracabilite}.md` | agent-tdd-jira, point d'entrée et modules, en entier | rédacteur, agents de couche, kit test |
| `references/agent-tdd-jira/binome-agent2test.md` | agent-tdd-jira, module `binome-agent2test`, extrait § 3 et § 4 | étiquettes du binôme, remise du plan |
| `references/agent2test/plan.md`, `references/agent2test/remise.md` | agent2test, modules `plan` § 2 et `echange` § 3, extraits | jouabilité, format `agent2test.remise/1` |
| `references/analyse-projet.md`, `references/analyse-projet/cartographie.md` | analyse-projet, point d'entrée et module `cartographie` | analyste |
| `references/java/revue.md`, `references/angular/revue.md` | java et angular, modules `revue` | relecteur |
| `references/sonarqube.md`, `references/sonarqube/examen-local.md` | sonarqube, point d'entrée et module `examen-local` | agent qualité |
| `outils/extraire-jira.mjs`, `outils/controler-criteres.mjs` | agent-tdd-jira, blocs de code de `ingestion-jira` § 3 et `us-criteres` § 7, à l'identique | extraction d'une capture MHTML, contrôle des US et des scénarios |
| `outils/verifier-documents.mjs`, `outils/verifier-kits.mjs` | ce prototype, tels quels | contrôles P8 et P9 |
| `outils/rattachement.json` | produit par la fabrique | critères de l'arbre rattachés aux critères de la clé, couches, images de l'objectif |

Épingles : agent-tdd-jira et les référentiels Java et Angular suivent l'orchestrateur ; Agent2Test suit agent-tdd-jira ; analyse-projet et sonarqube suivent `EPINGLES_PROTOTYPE` (`outils/sources.mjs`). Un module de skill ne déclare pas de version et n'est pas archivé : il se résout à la version de son skill, et une nouvelle version de l'un de ces skills arrête la génération jusqu'à ce que le prototype la reprenne. Le workflow suit leurs spécifications pour le signaler.

Le contrôle de l'héritage couvre la boîte : un extrait reprend ses sections mot pour mot, un script tiré d'un bloc de code lui est identique, un module se résout à la version de son skill, et la racine d'un arbre du lot 4 porte toute la boîte. Un invariant d'un autre skill se cite avec son nom (`agent-tdd-jira:D10.INV-1`), comme dans les skills du dépôt.

### Sous-agents de rôle

| Sous-agent | Invoqué par | Méthode | Outils |
|---|---|---|---|
| `ticket-<clé>-redacteur` | la racine, avant la ratification de l'arbre | agent-tdd-jira : `demande.json`, `us.md`, fichier Gherkin | lecture et écriture, limitée à `docs/demandes/<clé>/` |
| `ticket-<clé>-analyste` | chaque feuille, à l'analyse | analyse-projet, module `cartographie` ; skill4appli s'il est installé | lecture seule |
| `ticket-<clé>-relecteur` | chaque feuille, avant É6 | java ou angular en mode revue | lecture seule |
| `ticket-<clé>-qualite` | chaque feuille, en É6 | sonarqube, module `examen-local` ; jeton par `SONAR_TOKEN`, aucune écriture vers SonarQube sans validation explicite | lecture seule |

Les agents de couche des feuilles réalisent leurs scénarios en cycle TDD d'agent-tdd-jira : les scénarios du fichier Gherkin qui portent l'un des critères d'acceptation de la feuille et l'étiquette de sa couche, un à un, test étiqueté d'abord, accepté par le développeur (V4) avant le suivant, commité `<CLÉ> Snn : [É<n>-<DOMAINE>] …`.

### Documents de la clé

Le k-ième critère de la racine devient `<CLÉ>-CAkk`, repris mot pour mot, origine « repris » ; chaque critère d'un sous-ticket se rattache aux critères de la clé par la chaîne de ses « soutient », et se prouve par leurs scénarios, de sa couche pour une feuille. Pour ABCDE-3620 : ABCDE-3620-1.1 porte CA04 et CA03 (`@back`), ABCDE-3620-1.2 CA01, CA02, CA03 et CA05 (`@back`), ABCDE-3620-2 CA05 (`@front`).

Déroulé de la racine : le rédacteur écrit les trois documents, statuts « à valider » ; `controler-criteres.mjs` et `verifier-documents.mjs` passent sans écart ; l'arbre se présente avec eux, et sa ratification tient lieu de V2 (et de V1 si une capture MHTML a été extraite) ; les statuts passent à « validé », les contrôles repassent, la ligne de ratification s'écrit, puis les documents se commitent seuls sur la branche de l'arbre : `<CLÉ> : [É6-C7E] docs(demande): US, critères d'acceptation et scénarios ratifiés`. Sans capture MHTML, `demande.json` part du ticket racine, avec la limite « capture MHTML absente ».

### Kits

À la clôture, la racine relève les contributions aux kits dans la remise de chaque feuille, puis écrit dans `docs/demandes/<clé>/kits/` trois manifestes fermés au format `skill-ticket.kit/1`, chaque fichier cité avec son empreinte sha256 :

| Kit | Contenu |
|---|---|
| dev, `dev.json` | branche, commits dans l'ordre de l'historique (empreinte, sous-ticket, titre), remise de chaque nœud, chemin de la remise à Agent2Test |
| test, `test.json` | plan (`us.md`, fichier Gherkin), `demande.json`, tests et scénarios qu'ils portent, matrice de traçabilité, ouverture de la campagne d'Agent2Test |
| démo, `demo.json` | parcours tiré des scénarios `@front` validés, données et commandes de lancement, captures de l'écran livré comparées aux images de l'objectif |

La remise `agent2test.remise/1` se rédige en dernier, au commit de tête de la branche, avec la prévision de jouabilité du module `plan` d'Agent2Test ; les kits ne se commitent pas avant la campagne, pour que le commit remis reste la tête de la branche. `verifier-kits.mjs --depot` le vérifie aussi dans le dépôt : branche, commits, ligne `Sous-ticket` de chaque commit de feuille, HEAD, aucun fichier suivi modifié.

### Projet d'exemple résolu

`exemples/ABCDE-3620-resolution/` est un projet réduit tel que l'arbre ABCDE-3620 le laisse à sa clôture : documents de la clé, remises, matrice, parcours, données, captures, kits et remise à Agent2Test. Ses fichiers de code et de test, réduits, entrent chacun une fois dans l'historique, que la recette reconstruit à l'identique dans un dépôt Git temporaire, aux dates fixées par `tests/fixtures/historique-ABCDE-3620.json`. La recette contrôle ce projet avec les copies des scripts que livre la transmission du skill racine (P8, P9), puis des altérations : critère reformulé, scénario sans l'étiquette de sa couche, schéma de `demande.json`, fichier modifié après le kit, feuille sans commit, titre hors format, test sans étiquette, remise au champ inconnu, jouables faux, commit autre que la tête, image de l'objectif sans capture.

La rédaction des documents et l'assemblage des kits demandent un modèle : comme P4, ils s'essaient dans Gemini CLI, sur le poste. Après `installer-arbre.mjs installer` et `lancer ABCDE-3620`, le skill racine est « documents à rédiger » : il invoque le rédacteur, passe les deux contrôles, puis présente l'arbre et les documents avant la ratification.

### Choix du lot 4, à valider

1. **Boîte à outils sur la racine seule**, lue par les feuilles et les sous-agents dans le skill racine installé ; références copiées en entier ou par extraits, scripts tirés des blocs de code, sous le contrôle de l'héritage.
2. **Épingles** : agent-tdd-jira et Java, Angular par l'orchestrateur, Agent2Test par agent-tdd-jira, analyse-projet 1.0.2 et sonarqube 1.1.0 par le prototype ; un module se résout à la version courante de son skill, faute d'archive.
3. **Critères de la clé** : rang de la racine pour la numérotation, énoncé mot pour mot ; rattachement des sous-tickets par les « soutient » ; un critère de la racine jugé non vérifiable remonte au développeur, sans reformulation par le rédacteur.
4. **Ratification de l'arbre valant V2**, puis documents commités seuls à la ratification, et non avec le premier scénario, pour que toutes les feuilles partent du même plan ; commit de la racine au slot É6, domaine C7E.
5. **Commits de scénario** `<CLÉ> Snn : [É<n>-<DOMAINE>] …`, un slot chacun, corps `Sous-ticket : <référence>`, acceptés un à un (V4).
6. **Kits en manifestes fermés** non commités avant la campagne ; remise rédigée en dernier, au commit de tête ; captures et données de démonstration déposées par les feuilles dans leur dossier ; préalables de la remise : les noms des batchs `@batch-<nom>` des scénarios jouables, le schéma d'Agent2Test n'en fixant pas la forme.
7. **Démo** : les scénarios `@front` d'un critère validé, ni proposés ni en attente ; une capture exigée pour chaque image de l'objectif, facultative sinon.
8. **Sous-agents analyste, relecteur et qualité sans outil d'écriture** ; leur shell ne sert qu'à lire, par consigne ; le rédacteur n'écrit que dans le dossier de la clé.

## Commandes

Depuis la racine du dépôt, sans dépendance : Node 20 ou plus récent pour les outils, Node 22 ou plus récent pour la recette (motifs de fichiers de `node --test`) :

```bash
node prototypes/skill-ticket/outils/arbre.mjs verifier prototypes/skill-ticket/exemples/ABCDE-3620
node prototypes/skill-ticket/outils/arbre.mjs plan prototypes/skill-ticket/exemples/ABCDE-3620
node prototypes/skill-ticket/outils/generer.mjs generer prototypes/skill-ticket/exemples/ABCDE-3620 --sortie <dossier>
node prototypes/skill-ticket/outils/generer.mjs verifier <dossier>/transmissions
node prototypes/skill-ticket/outils/installer-arbre.mjs installer <dossier>/transmissions --workspace <workspace>
node prototypes/skill-ticket/outils/verifier-documents.mjs <projet>/docs/demandes/<clé> --rattachement <dossier>/ticket-<clé>/outils/rattachement.json --controleur <dossier>/ticket-<clé>/outils/controler-criteres.mjs
node prototypes/skill-ticket/outils/verifier-kits.mjs <projet>/docs/demandes/<clé> --rattachement <dossier>/ticket-<clé>/outils/rattachement.json [--depot]
node --test "prototypes/skill-ticket/tests/*.test.mjs"
```

Sous Windows, les mêmes commandes passent dans PowerShell, avec `\` ou `/` dans les chemins ; une extraction Git en CRLF donne les mêmes skills, octet pour octet. `--referentiel <chemin>` lit un `referentiel-meso-contrats.toml` de projet au lieu du modèle de l'orchestrateur ; `--profondeur-max <n>` change le plafond ; `--invariants-projet <chemin>` donne la copie du projet du fichier d'invariants, au lieu du modèle de l'orchestrateur. `generer` écrit chaque skill dans `<dossier>/<skill>/` et sa transmission dans `<dossier>/transmissions/`, et ne remplace qu'un dossier qui contient déjà un skill de ticket généré. Code de sortie 1 au moindre écart, 2 pour un usage incorrect.

Un arbre s'installe par `installer-arbre.mjs` (section précédente) ; une transmission seule s'installe aussi comme les autres, `node tools/installer.mjs <dossier>/transmissions/ticket-abcde-3620-1-2-1.0.0.md`, mais sans ses agents ni sa commande. Avec `SKILL_TICKET_GEMINI` pointant vers Gemini CLI, la recette vérifie aussi la découverte des skills et le chargement des agents.

Les transmissions attendues changent dès que change une source dont héritent les skills de ticket (orchestrateur, socle, référentiels, modèle des invariants du projet, skills et scripts de la boîte à outils de la racine) : la recette le signale, et elles se régénèrent par

```bash
node prototypes/skill-ticket/outils/generer.mjs generer prototypes/skill-ticket/exemples/ABCDE-3620 --sortie prototypes/skill-ticket/exemples/ABCDE-3620-skills
```

(seules les transmissions y sont versionnées).

## Architecture et patrons

| Composant | Patron | Lot |
|---|---|---|
| `NoeudTicket` : même interface pour un ticket et ses sous-tickets, sur n niveaux | Composite | 1, livré |
| parcours de l'arbre par les vérifications, puis par les observateurs | Visiteur | 1 livré, 5 |
| ordre de résolution : un nœud prêt quand ses prérequis sont clos ; cycle de vie d'un nœud | Observateur, État | 1 livré, 3, 5 |
| `FabriqueSkillTicket` et `FabriqueJavaAngularPostgreSQL` : la famille de fichiers d'un nœud, référentiels, agents et commandes de la pile | Fabrique abstraite | 2, livré |
| `Monteur` : assemblage nœud par nœud, blocs du référentiel copiés puis paramétrés | Monteur, Prototype | 2, livré |
| consigne du nœud : même squelette, crochets selon la nature du nœud et selon la pile | Patron de méthode | 2, livré |
| exécuteur Gemini CLI par l'installateur ; place prévue pour le binôme Agent2Dev et Agent2Test, ou n8n | Pont | 3 |
| sous-agents de rôle, chacun dans son contexte, invoqués par les nœuds ; kits assemblés depuis les remises des feuilles | Stratégie, Monteur | 4, livré |
| champ d'observation partagé, en ajout seul | Médiateur | 5 |
| escalade ordre 1, 2, 3, puis humain | Chaîne de responsabilité | 5 |
| actions enregistrées, corrections humaines qui les visent | Commande | 5 |
| vue augmentée : calques posés sur les ancres du ticket | Décorateur | 6 |

`outils/toml.mjs` lit le sous-ensemble de TOML 1.0 du référentiel et des tickets, sans dépendance ; sa recette le compare aux lectures de `tomllib` (Python), versionnées dans `tests/fixtures/toml/` et `tests/attendus/`. `outils/sources.mjs` lit les sources de l'héritage à leur version épinglée, archives comprises, fins de ligne normalisées ; `outils/fabrique.mjs` porte les fabriques, `outils/monteur.mjs` le Monteur et le contrôle de l'héritage, `outils/generer.mjs` la ligne de commande du générateur, `outils/installer-arbre.mjs` l'installation, le lancement et le retrait d'un arbre dans Gemini CLI, `outils/verifier-documents.mjs` et `outils/verifier-kits.mjs` les contrôles des documents et des kits, livrés tels quels dans le skill racine.

## Lots et critères d'acceptation

| Lot | Contenu | Critères | Statut |
|---|---|---|---|
| 1 | modèle et vérification de l'arbre | P1, sauf l'invariant omis | livré |
| 2 | fabrique et Monteur : un skill par nœud, sa transmission par `bundle.mjs` | P1 (invariant omis), P2, P3 | livré |
| 3 | installation de l'arbre dans Gemini CLI, activation vérifiée sur le poste du développeur | P4 | livré |
| 4 | documents d'agent-tdd-jira, sous-agents de rôle, kits dev, test et démo | P8, P9 | livré, choix à valider |
| 5 | champ d'observation, retours humains simulés, visiteurs, escalade, propagation | P5 | à venir |
| 6 | vue augmentée générée depuis le champ | P6 | à venir |
| 7 | recette, mesure du contexte, bilan | P7 | à venir |

- **P1** : l'arbre d'essai passe le vérificateur ; sont rejetés : deux parents, un cycle de dépendances, une dépendance vers un ancêtre, une profondeur au-delà du plafond, une possibilité du parent portée par aucun sous-ticket, une option hors de la composition, un invariant omis (lot 2).
- **P2** : chaque skill produit se relit à l'identique depuis sa transmission ; la même entrée redonne les mêmes fichiers ; l'assemblage ne consomme aucun token.
- **P3** : chaque skill de ticket reprend tous les invariants dont il hérite, contrôlé automatiquement.
- **P4** : dans Gemini CLI, le skill parent présente l'arbre, les méso-contrats, l'ordre de résolution et les critères, puis attend la ratification avant toute action.
- **P5** : sur retours simulés, une correction répétée déclenche une proposition d'ordre 2 ; un écart dans un sous-ticket menace le critère du parent qu'il soutient ; un désaccord entre nœuds va au registre des écarts.
- **P6** : la vue augmentée montre, pour chaque ancre, des calques et un état conformes au champ.
- **P7** : le contexte chargé pour résoudre une feuille est mesuré et comparé à celui du point d'entrée de l'orchestrateur.
- **P8** : les documents de la clé Jira (`demande.json`, `us.md`, fichier Gherkin) passent `controler-criteres.mjs` d'agent-tdd-jira sans écart ; chaque critère d'un sous-ticket se rattache à un critère `<CLÉ>-CAnn` et à au moins un scénario.
- **P9** : chaque kit (dev, test, démo) est complet et vérifiable ; la remise est conforme au schéma fermé `agent2test.remise/1`.

## Écart relevé dans le référentiel

En codant la règle « aucune possibilité ne reste inconnue si sa réponse pouvait changer la composition », le prototype constate que l'exemple du § 7.2 du module `referentiel` (orchestrateur-c7e 3.5.3) laisse `regle` et `service` à `inconnu`, alors qu'un `oui` ajouterait un complément à M04. Le référentiel n'est pas modifié ; l'arbre d'essai répond à ces deux possibilités, et un test documente l'écart.
