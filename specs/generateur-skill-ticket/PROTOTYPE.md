# Prototype : skill de ticket C7E

**Statut** : prototype terminé, bilan rendu (`BILAN.md`), puis intégré : depuis le 8 novembre 2026, il est la spécification `generateur-skill-ticket` 1.0.0 (`SKILL.md`, `manifest.json`, `modules/`), dont ses outils, sa recette et ses exemples, réunis dans ce dossier, font partie sans être transmis. Ce document garde l'histoire de sa conception : décisions ratifiées, lots, choix validés et recettes de chaque lot ; les chemins de ses commandes sont ceux d'aujourd'hui. Les lots 1 à 7 ont livré le modèle et la vérification de l'arbre, la fabrique et le Monteur des skills de ticket, l'installation de l'arbre dans Gemini CLI, les documents de la clé Jira, les sous-agents de rôle et les kits dev, test et démo, le champ d'observation de l'arbre et ses observateurs d'ordre 2 et 3, la vue augmentée, puis la recette de bout en bout, la mesure du contexte et le bilan.

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

Ratifié ensuite, le même jour, après le lot 4 :

15. **Un champ d'observation par arbre**, `docs/demandes/<clé>/champ.jsonl`, en ajout seul, au schéma fermé `skill-ticket.observation/1`, chaque ligne chaînée à l'empreinte de la précédente. Quatre types d'enregistrements : action ; retour (choix, correction qui vise une action, ratification) ; observation d'ordre 1, 2 ou 3 (observateur, ancre ou observations observées, preuve, écart, proposition, coût) ; écart, reporté au registre des écarts du projet, décision au développeur.
16. **Ratification dans le champ** : `retours.md` quitte les nouveaux skills ; `liste` lit le champ, et `retours.md` pour les arbres déjà installés.
17. **Script `outils/champ.mjs`** dans la boîte à outils de la racine, `deposer`, `verifier` et `etat` : le script décide quand, les sous-agents formulent quoi. Deux corrections au même motif font attendre l'ordre 2 ; un écart sur un critère menace, de proche en proche, les critères qu'il soutient jusqu'au critère d'acceptation ; des verdicts contraires de deux nœuds sur une même ancre forment un désaccord, inscrit au registre des écarts (D6.INV-3). Un écart se traite au niveau le plus bas qui le peut.
18. **Ordres d'observation** : 1, les agents et les skills, une correction étant un commit de rétroaction qui cite son observation ; 2, l'observateur de l'arbre, qui propose une adaptation de la méthode, entrée `proposed` du registre des concepts, jamais une action sur le code ; 3, éveillé par une proposition d'ordre 2 ou par la clôture, qui vérifie les preuves et l'effet sur la décision, et met l'ordre 2 en veille sur un motif après deux propositions refusées ; l'humain au-dessus. Les observateurs d'ordre 2 et 3 et le module `champ` sont sur la racine.
19. **Recette P5** sur retours simulés pour ABCDE-3620, et altérations du champ.

Ratifié ensuite, le même jour, après le lot 5 (plan du lot 6, tel que proposé) :

20. **Vue augmentée** : ses ancres sont celles que porte le ticket, qui n'est jamais réécrit (critères d'acceptation de `us.md`, critères de chaque nœud, dont le rattachement reçoit les énoncés, scénarios du fichier Gherkin, nœuds), et celles que seul le champ connaît, marquées « nées du champ ». La pile d'une ancre réunit les enregistrements qui l'atteignent, directement par leur ancre ou par ce qu'ils visent ou observent ; une ratification atteint son nœud.
21. **Quatre calques** posés sur chaque ancre (Décorateur) : ordre 1, ordre 2, ordre 3, humain, chaque enregistrement avec son numéro et sa preuve ; masquer un calque ne change pas l'état. L'état d'une ancre résume sa pile : celui du champ pour un critère ; en désaccord, en écart, conforme ou non observée pour une autre ancre observée ; à réaliser, réalisé ou à reprendre pour un scénario ; ratifié, non ratifié ou à ratifier pour un nœud ; avec des marques pour une observation attendue et un motif en veille. Gravité d'abord : désaccord, écart, menace, attente.
22. **Second visiteur des critères**, qui range la vue par critère d'acceptation, chaque critère suivi de ceux qui le soutiennent et des scénarios qui le prouvent ; formats `vue.html` pour le développeur (autonome, accessible, lisible sans JavaScript), `vue.md` pour les agents, `--json` pour les outils ; même champ et mêmes documents, même vue.
23. **Script `outils/vue.mjs`** dans la boîte à outils de la racine, `generer [--noeud]` et `verifier` ; un champ altéré ne donne pas de vue ; la vue n'est pas commitée. Chaque nœud lit sa vue à son lancement, les observateurs d'ordre 2 et 3 la vue entière ; la racine la présente au développeur à la ratification de l'arbre et à la clôture, et la cite dans sa remise ; `liste` dit si elle est à jour.
24. **Recette P6** : vues de l'essai à plusieurs moments et du projet résolu, identiques aux vues versionnées ; piles recalculées et états du champ comparés à la vue ; altérations ; structure accessible vérifiée sans dépendance.

Ratifié ensuite, le même jour, après le lot 6 (plan du lot 7, tel que proposé ; « Oui aux 2 », tenu aussi pour la validation des choix du lot 6) :

25. **Mesure du contexte** : `outils/mesurer-contexte.mjs`, outil du prototype, hors de la boîte à outils de la racine ; pour chaque feuille, chaque contexte qui travaille pour elle (session de son skill, agents de couche, sous-agents de rôle que sa consigne nomme), à deux bornes, à l'activation et au plus, en caractères et en tokens estimés à un pour quatre caractères jusqu'à une mesure réelle ; le point d'entrée de l'orchestrateur mesuré de la même façon, pour le même ticket ; rapport versionné.
26. **Second arbre** : ABCDE-3512, le ticket fil rouge de l'orchestrateur (M01, trois couches, images de l'objectif, un seul ticket), complété des critères qu'exige le prototype, rédigés pour lui et à relire par le développeur ; généré, installé et mesuré.
27. **Mesure réelle facultative**, sur le poste : `gemini -p … -o json`, lecture de `stats`, calibrage du rapport entre caractères et tokens ; la clé n'est jamais demandée ni affichée.
28. **Recette de bout en bout** dans un seul workspace : génération, installation, résolution simulée (documents, champ, vue, kits, historique Git), contrôles par les scripts du skill racine installé, `liste` à « clos » partout et vue à jour, retrait, transmissions archivées vérifiées ; tableau des critères P1 à P9 et de leurs preuves, P4 et la mesure réelle marqués « protocole sur le poste » ; recette P7 : mesure déterministe, rapport versionné, chaque fichier compté existant et cité, second arbre généré et vérifié.
29. **Bilan** `BILAN.md` : critères, mesures, décision 8 revue à la lumière de P7, limites, écarts ; proposition d'intégration à décider par le développeur, (a) orchestrateur-c7e 4.0.0, où le skill de ticket remplace la fiche, ou (b) spécification de générateur à part, qui dépend de l'orchestrateur 3.x, avec les invariants candidats et les points ouverts ; prototype clos, aucune spécification modifiée par ce lot.

Ratifié ensuite, le même jour, après le lot 7 (« 1 : ok, 2 : validé », puis « Oui pour la solution b », puis « Oui au deux c'est très bien ») :

30. **Lot 7 validé** avec ses choix ; les six critères d'ABCDE-3512, rédigés pour le prototype, relus et acceptés par le développeur.
31. **Voie d'intégration (b)** : une spécification de générateur à part, `generateur-skill-ticket`, qui dépend de l'orchestrateur 3.x à versions épinglées ; l'orchestrateur n'est pas modifié. Le générateur lit les sources dont héritent les skills de ticket dans un clone du dépôt, à leurs versions épinglées, comme le prototype.
32. **Plan d'intégration** : 1, la spécification ; 2, les outils, les exemples et la recette du prototype dans la spécification, avec la CI (lots 1 et 2 livrés ensemble : la consigne de la 1.0.0 cite ses outils par leur chemin) ; 3, les corrections relevées par le bilan (trois pistes contre les relectures, rédacteur nommé comme les autres sous-agents, P4 précisé pour un ticket sans sous-ticket) ; 4, la recette sur le poste du développeur (P4, rédaction des documents, observateurs, mesure réelle) ; 5, la clôture du prototype.

Ratifié le 9 novembre 2026, après la fusion de la 1.0.0 (« Oui d'accord ») :

33. **Lot 3 de l'intégration, generateur-skill-ticket 1.0.1**, un correctif : le fichier d'invariants comparé par empreinte, avec un script de la boîte à outils, la copie du projet seule lue ; chaque agent de couche avec sa part de la consigne ; un module court `champ-depot` pour les nœuds et les agents de couche, le module `champ` entier pour la racine et les observateurs ; le rédacteur nommé comme son agent ; P4 précisé pour un ticket sans sous-ticket, avec la variante du protocole sur le poste pour ABCDE-3512. Recette : relectures visées disparues des rapports, somme de chaque arbre en baisse d'au moins 10 % depuis le lot 7, plafond de D7.INV-1 tenu. La lecture partielle du socle et des référentiels reste hors du lot.

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
| `SKILL.md` | la consigne, patron de méthode : place dans l'arbre, objectif et critères, méso-contrats et options, démarrage, analyse ou coordination, ratification, transformation par slot ou clôture, remise, champ d'observation (retours du développeur jusqu'au lot 4), invariants, fichiers | tous |
| `ticket.toml` | le ticket du nœud, recopié tel quel | tous |
| `modules/meso-contrats/` | méso-contrats de la composition et transverses, copiés du référentiel | tous |
| `modules/option-<couche>-<option>/` | option copiée du référentiel, puis paramétrée : instances du ticket, slots et étiquettes (§ 4 du module `referentiel`), preuves retenues et preuves sans objet selon les valeurs choisies | feuilles |
| `modules/recette/` | critères à prouver ; preuves des options, exigences des transverses, commandes de la pile pour une feuille ; preuve par agrégation pour un nœud composé | tous |
| `modules/sous-tickets/` | sous-arbre, ordre de résolution du sous-arbre, préalables extérieurs, règles de coordination et de clôture | nœuds composés |
| `modules/methode/` | sections de l'orchestrateur recopiées mot pour mot : § 2, 5.1, 5.2, 6, 7.1, 8 et 11.5 pour une feuille, § 11.5 pour un nœud composé ; depuis le lot 5, § 6, 7.2 et 11.5 pour la racine, où sont les observateurs, et § 7.2 en plus pour un ticket sans sous-ticket | tous |
| `modules/invariants/` | ce dont le skill hérite, les correspondances entre la fiche de l'orchestrateur et le skill, et les 33 invariants de l'orchestrateur mot pour mot | tous |
| `socle/SKILL.md` | socle back-front à la version qu'épingle l'orchestrateur | tous |
| `references/java.md`, `references/angular.md` | référentiels de la pile des couches touchées | feuilles |
| `projet/meso-contrats.md` | invariants du projet dans l'état où le skill a été produit ; au démarrage, la copie du projet fait foi | tous |
| `agents/<skill>-<couche>.md` | un agent par couche touchée, au format des sous-agents de Gemini CLI 0.67.0 | feuilles |
| `commandes/ticket/<nœud>.toml` | la commande Gemini CLI qui lance le skill dans une session, `/ticket:<nœud>` (lot 3) | tous |
| `modules/documents/`, `modules/kits/`, `outils/`, `references/<skill>…`, `agents/<skill>-<rôle>.md` | boîte à outils de l'arbre : documents de la clé, kits, scripts de contrôle, références des sous-agents de rôle et ces sous-agents (lot 4) | racine |
| `modules/champ/`, `outils/champ.mjs`, `agents/<skill>-observateur-2.md`, `agents/<skill>-observateur-3.md` | champ d'observation de l'arbre, son script et ses observateurs d'ordre 2 et 3 (lot 5) | racine |
| `modules/vue/`, `outils/vue.mjs` | vue augmentée de l'arbre et son script (lot 6) | racine |

L'arbre d'essai donne cinq skills, de 11 à 43 fichiers ; leurs transmissions attendues sont versionnées dans `exemples/ABCDE-3620-skills/transmissions/` : de 69 000 à 112 000 caractères pour les nœuds, 452 000 pour la racine, qui porte la boîte à outils, contre 230 000 pour la transmission de l'orchestrateur. Un sous-agent ne charge que ses références ; la mesure du contexte chargé reste celle du lot 7.

### Contrôle de l'héritage

| Règle | Contenu |
|---|---|
| H1 | la provenance déclarée est complète : méthode, invariants de l'orchestrateur, socle, invariants du projet, et, pour une feuille, le référentiel de la pile de chaque couche touchée ; pour la racine, depuis le lot 4, toute la boîte à outils de son lot (le script du champ depuis le lot 5, celui de la vue depuis le lot 6) |
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
| `liste` | arbres installés, et état de chaque nœud d'après le champ d'observation et les dossiers du ticket : documents à rédiger, arbre à ratifier, en attente, prêt, analysé, ratifié, prêt à clore, clos ; puis l'état du champ : critères prouvés, en écart, menacés, désaccords, observations attendues, et un champ altéré avec la commande qui dit où (lot 5) ; enfin la vue augmentée : son chemin, à jour, périmée, modifiée ou absente, avec la commande qui la régénère (lot 6) |
| `verifier [<clé>]` | fichiers installés intacts ; si Gemini CLI est là, ses skills découverts et activés, ses agents chargés sans erreur, et un dossier non fiable signalé |
| `lancer <référence>` | ouvre Gemini CLI dans le workspace, en mode interactif, sur la phrase qui active le skill du nœud : `gemini -i "Active le skill …"` |
| `retirer <clé>` | archive les transmissions dans `docs/demandes/<clé>/skills/`, où elles se versionnent avec le ticket, puis retire skills, agents, commandes et relevé |

Gemini CLI se désigne par `--gemini <exécutable>` ou par la variable `SKILL_TICKET_GEMINI`, sinon `gemini`. Le lancement ne passe ni `--skip-trust` ni un mode d'approbation automatique : la confiance du dossier et les approbations restent au développeur.

### Cycle de vie d'un nœud

Chaque nœud se traite dans **sa propre session** de Gemini CLI, avec son propre contexte (décision 8), que le développeur lance par la commande du nœud ou par `lancer`. Aucun skill n'active celui d'un sous-ticket dans sa session. Les états se lisent dans les dossiers du ticket et, depuis le lot 5, dans son champ d'observation, que chaque nœud lit dans sa vue augmentée depuis le lot 6 :

| Nœud | États |
|---|---|
| racine | documents à rédiger (lot 4) ; arbre à ratifier (présentation, puis ratification) ; en cours (état des sous-tickets, prochain nœud prêt et sa commande) ; prêt à clore (puis kits, lot 4) ; clos |
| nœud composé | en cours ; prêt à clore ; clos |
| feuille | en attente de la ratification de l'arbre, ou d'un ticket dont elle dépend ; prêt ; analysé, à ratifier ; ratifié, en transformation ; clos |

Depuis le lot 5, une ratification se dépose dans le champ d'observation de l'arbre, par `champ.mjs deposer … retour --nature ratification`, objet `arbre ABCDE-3620` sur la racine, la référence de la feuille sur une feuille, décision `ratifié` ou `non ratifié` : la dernière décision sur un objet fait foi, et `etat` la montre. Aux lots 3 et 4, elle s'écrivait dans `retours.md` sur une ligne de forme fixe, `- AAAA-MM-JJ, <nom> : arbre ABCDE-3620 ratifié`, que `liste` reconnaît encore pour les arbres déjà installés. Un nœud est clos quand son `remise.md` existe. Une feuille confie chaque couche à son agent par l'outil `invoke_agent`.

### Contrat avec Gemini CLI

Vérifié avec Gemini CLI 0.67.0, sans modèle : `gemini skills list`, lancé dans le workspace de confiance, découvre et active les cinq skills ; il charge sans erreur les neuf agents, trois agents de couche, quatre sous-agents de rôle depuis le lot 4 et deux observateurs depuis le lot 5, alors qu'il refuse un agent au nom ou aux outils invalides ; dans un dossier non fiable, il ignore skills et agents. Le job `contrat-gemini` du workflow le rejoue sous Linux et sous Windows.

### Recette P4 sur le poste du développeur

La présentation de l'arbre et l'attente de la ratification demandent un modèle : elles se vérifient dans Gemini CLI, sur le poste. Dans un workspace d'essai, dossier vide ou dépôt Git de test, marqué de confiance :

1. `node <dépôt>/specs/generateur-skill-ticket/outils/installer-arbre.mjs installer <dépôt>/specs/generateur-skill-ticket/exemples/ABCDE-3620-skills/transmissions`
2. `node <dépôt>/specs/generateur-skill-ticket/outils/installer-arbre.mjs verifier ABCDE-3620` : « skills découverts et activés, agents chargés sans erreur ».
3. `node <dépôt>/specs/generateur-skill-ticket/outils/installer-arbre.mjs lancer ABCDE-3620` ; Gemini CLI demande d'autoriser le skill à sa première activation. Attendu : le skill racine signale l'absence de `docs/c7e/meso-contrats.md` (normal dans un workspace d'essai), présente l'arbre (cinq nœuds), les méso-contrats (M04, M02, M03), l'ordre de résolution, les critères et la façon dont chacun est soutenu, puis attend la ratification, sans modifier aucun fichier.
4. Ratifier : le skill dépose la ratification dans `docs/demandes/ABCDE-3620/champ.jsonl` (lot 5 ; `retours.md` aux lots 3 et 4), et indique ABCDE-3620-1.1 avec sa commande, `/ticket:abcde-3620-1-1`.
5. `node <dépôt>/specs/generateur-skill-ticket/outils/installer-arbre.mjs liste` : racine « en cours », ABCDE-3620-1.1 « prêt ».
6. `node <dépôt>/specs/generateur-skill-ticket/outils/installer-arbre.mjs retirer ABCDE-3620 --sans-archive` pour finir.

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

La remise `agent2test.remise/1` se rédige en dernier, au commit de tête de la branche, avec la prévision de jouabilité du module `plan` d'Agent2Test ; les kits, comme le champ d'observation depuis le lot 5, ne se commitent pas avant la campagne, pour que le commit remis reste la tête de la branche. `verifier-kits.mjs --depot` le vérifie aussi dans le dépôt : branche, commits, ligne `Sous-ticket` de chaque commit de feuille, HEAD, aucun fichier suivi modifié.

### Projet d'exemple résolu

`exemples/ABCDE-3620-resolution/` est un projet réduit tel que l'arbre ABCDE-3620 le laisse à sa clôture : documents de la clé, remises, matrice, parcours, données, captures, kits et remise à Agent2Test. Ses fichiers de code et de test, réduits, entrent chacun une fois dans l'historique, que la recette reconstruit à l'identique dans un dépôt Git temporaire, aux dates fixées par `tests/fixtures/historique-ABCDE-3620.json`. La recette contrôle ce projet avec les copies des scripts que livre la transmission du skill racine (P8, P9), puis des altérations : critère reformulé, scénario sans l'étiquette de sa couche, schéma de `demande.json`, fichier modifié après le kit, feuille sans commit, titre hors format, test sans étiquette, remise au champ inconnu, jouables faux, commit autre que la tête, image de l'objectif sans capture.

La rédaction des documents et l'assemblage des kits demandent un modèle : comme P4, ils s'essaient dans Gemini CLI, sur le poste. Après `installer-arbre.mjs installer` et `lancer ABCDE-3620`, le skill racine est « documents à rédiger » : il invoque le rédacteur, passe les deux contrôles, puis présente l'arbre et les documents avant la ratification.

### Choix du lot 4, validés le 8 novembre 2026

1. **Boîte à outils sur la racine seule**, lue par les feuilles et les sous-agents dans le skill racine installé ; références copiées en entier ou par extraits, scripts tirés des blocs de code, sous le contrôle de l'héritage.
2. **Épingles** : agent-tdd-jira et Java, Angular par l'orchestrateur, Agent2Test par agent-tdd-jira, analyse-projet 1.0.2 et sonarqube 1.1.0 par le prototype ; un module se résout à la version courante de son skill, faute d'archive.
3. **Critères de la clé** : rang de la racine pour la numérotation, énoncé mot pour mot ; rattachement des sous-tickets par les « soutient » ; un critère de la racine jugé non vérifiable remonte au développeur, sans reformulation par le rédacteur.
4. **Ratification de l'arbre valant V2**, puis documents commités seuls à la ratification, et non avec le premier scénario, pour que toutes les feuilles partent du même plan ; commit de la racine au slot É6, domaine C7E.
5. **Commits de scénario** `<CLÉ> Snn : [É<n>-<DOMAINE>] …`, un slot chacun, corps `Sous-ticket : <référence>`, acceptés un à un (V4).
6. **Kits en manifestes fermés** non commités avant la campagne ; remise rédigée en dernier, au commit de tête ; captures et données de démonstration déposées par les feuilles dans leur dossier ; préalables de la remise : les noms des batchs `@batch-<nom>` des scénarios jouables, le schéma d'Agent2Test n'en fixant pas la forme.
7. **Démo** : les scénarios `@front` d'un critère validé, ni proposés ni en attente ; une capture exigée pour chaque image de l'objectif, facultative sinon.
8. **Sous-agents analyste, relecteur et qualité sans outil d'écriture** ; leur shell ne sert qu'à lire, par consigne ; le rédacteur n'écrit que dans le dossier de la clé.

## Champ d'observation (lot 5)

Chaque niveau de l'arbre dépose ce qu'il fait et ce qu'il observe dans un champ partagé, `docs/demandes/<clé>/champ.jsonl` ; tous le lisent, personne ne le réécrit (décisions 15 à 18). Le ticket n'est jamais réécrit par ceux qui l'observent : c'est l'état du champ qui évolue. `outils/champ.mjs`, livré tel quel dans le skill racine, est le seul à l'écrire :

| Commande | Effet |
|---|---|
| `deposer <dossier> <type> --noeud … --auteur … [options]` | contrôle le champ existant, puis l'enregistrement contre le schéma fermé et les règles du champ ; l'ajoute avec son numéro, sa date en UTC et l'empreinte de la ligne précédente, met à jour `champ.tete` ; inscrit d'office l'écart d'un désaccord, au champ et au registre des écarts ; annonce les observations que le dépôt fait attendre. Un dépôt refusé n'écrit rien |
| `verifier <dossier>` | schéma, numéros, dates non décroissantes, forme canonique de chaque ligne, chaîne d'empreintes et tête, désaccords inscrits, écarts présents au registre des écarts |
| `etat <dossier> [--json]` | ratifications, état de chaque critère de l'arbre, désaccords, observations attendues, motifs en veille |

Le rattachement du skill racine (`outils/rattachement.json`) porte, depuis le lot 5, le critère du parent que soutient chaque critère : le script en tire les critères de l'arbre sans le modèle de l'arbre, dans le skill racine installé, et un visiteur les parcourt pour en donner l'état.

| Enregistrement | Contenu | Déposé par |
|---|---|---|
| `action` | proposition au développeur, avec ses options, ou réalisation qu'il peut corriger, sur une ancre (`noeud`, `critere`, `ca`, `scenario`, `fichier`, `commit`, `contrat`, `option`) | l'agent ou le skill qui agit |
| `retour` | choix parmi les options d'une proposition, ou décision sur une proposition d'ordre 2 ; correction, qui vise une action et porte un motif ; ratification | le skill du nœud, au nom du développeur |
| `observation` | ordre 1 : conforme ou écart sur une ancre ; ordre 2 : proposition d'adaptation de la méthode, ou conforme ; ordre 3 : proposition fondée ou infondée, veille d'un motif, bilan de clôture ; toujours avec sa preuve (`test`, `commande`, `commit`, `fichier`, `enregistrements`, `rapport`) et, s'il est connu, son coût | agents et skills à l'ordre 1, observateurs de l'arbre aux ordres 2 et 3 |
| `ecart` | écart à un invariant, ou désaccord entre nœuds, avec sa ligne au registre des écarts | le skill qui le constate ; le script pour un désaccord |

| Déclencheur, décidé par le script | Attente | Suite, formulée par un sous-agent ou le développeur |
|---|---|---|
| deux corrections au même motif, dans l'arbre, sans observation d'ordre 2 qui les couvre | ordre 2 | `ticket-<clé>-observateur-2` propose une adaptation, ou conclut conforme |
| une proposition d'ordre 2 non examinée | ordre 3 | `ticket-<clé>-observateur-3` la juge fondée ou infondée |
| une proposition examinée, non décidée | développeur | il la retient, et elle s'inscrit au registre des concepts comme entrée `proposed`, ou il la refuse |
| deux propositions refusées sur un motif | veille | l'observateur d'ordre 3 met le motif en veille : l'ordre 2 ne s'y éveille plus |

Un critère est en écart si le dernier verdict d'ordre 1 sur lui est un écart ; menacé si un critère qui le soutient est en écart ou menacé, jusqu'au critère d'acceptation de la clé ; prouvé par un verdict conforme ou par tous ses soutiens ; à prouver sinon. Un rouge du cycle TDD n'est pas un écart. Deux nœuds dont les derniers verdicts d'ordre 1 sur une même ancre sont contraires sont en désaccord : le script l'inscrit au champ et au registre des écarts du projet, décision au développeur ; une observation qui départage les nœuds le lève dans l'état, la ligne du registre reste.

Les consignes lisent l'état du champ à chaque lancement, après la vérification des invariants du projet : la ratification de l'arbre s'y vérifie, les critères menacés ou en écart et les observations attendues s'y traitent, au niveau le plus bas qui le peut. À la clôture, la racine fait faire le bilan d'ordre 3 si l'ordre 2 a proposé, puis reporte l'état final du champ dans sa remise.

### Recette P5

`tests/fixtures/champs-ABCDE-3620.json` décrit deux scénarios de retours simulés, rejoués dépôt par dépôt par `champ.mjs`, à dates fixées : le même scénario redonne le même champ, octet pour octet.

- `essai`, dans `exemples/ABCDE-3620-champ/` : deux corrections au motif `requete-native` sur les actions de l'agent de persistance de ABCDE-3620-1.1 font attendre l'ordre 2 à la seconde, pas à la première ; la proposition attend l'ordre 3, puis la décision du développeur, qui la retient. Un écart sur ABCDE-3620-1.2:C3 menace ABCDE-3620-1:C3 et ABCDE-3620:C3, donc CA03, jusqu'à sa correction à l'ordre 1. ABCDE-3620-1.2 et ABCDE-3620-2 rendent des verdicts contraires sur le canal des lignes : le désaccord s'inscrit au registre des écarts du projet. `etat.txt` est l'état final.
- `resolution`, dans `exemples/ABCDE-3620-resolution/` : ratifications et verdicts conformes d'ordre 1, qui prouvent chaque critère d'acceptation ; la remise de la racine en reporte l'état final.

La recette vérifie aussi la mise en veille après deux propositions refusées, la dernière ratification qui fait foi, un nœud composé qui ne se ratifie pas, et des altérations : ligne réécrite, insérée ou supprimée au milieu ou en fin de champ, ligne non canonique, tête absente, écart absent du registre ; puis des dépôts refusés sans rien écrire : champ inconnu ou absent, nœud hors de l'arbre, ancre inconnue, correction sans motif ou qui ne vise pas une action antérieure, observation d'ordre 2 d'un autre agent ou sur une seule correction, preuve de nature inconnue, proposition déjà décidée, date antérieure.

L'invocation des observateurs par les skills, sur les attentes du champ, demande un modèle : comme P4, elle s'essaie dans Gemini CLI, sur le poste.

### Choix du lot 5, validés le 8 novembre 2026

1. **Seuils** : deux corrections au même motif, comptées dans tout l'arbre, éveillent l'ordre 2 ; deux propositions refusées sur un motif, sans proposition retenue depuis, appellent la veille. Le motif, en minuscules et tirets, est choisi par le skill qui dépose la correction.
2. **États des critères** d'après le dernier verdict d'ordre 1 de chaque nœud ; propagation par un visiteur des critères de l'arbre, construits depuis les « soutient » du rattachement, dans le skill racine installé, sans le modèle de l'arbre ; la vue augmentée du lot 6 y ajoutera son visiteur.
3. **Désaccords** inscrits d'office par le script, au nom de la clé, au dépôt qui les fait naître ; ancre `contrat` en texte libre, deux verdicts ne se comparant que sur la même chaîne.
4. **Champ hors des commits** jusqu'à la campagne d'Agent2Test, comme les kits ; une proposition d'ordre 2 retenue s'inscrit au registre des concepts par le skill du nœud, commitée à part (orchestrateur, § 6).
5. **Observateurs** sans outil d'écriture, leur seule écriture passant par `champ.mjs` ; bilan d'ordre 3 à la clôture, s'il y a eu des propositions d'ordre 2.
6. **Intégrité** : `champ.tete` garde l'empreinte de la dernière ligne ; un champ altéré refuse tout dépôt ; un verrou de fichier sérialise les dépôts de deux sessions ; dates en UTC, non décroissantes.
7. **Compatibilité** : un skill racine produit au lot 4 reste vérifiable sans le script du champ ; `liste` lit `retours.md` quand le champ ne dit rien d'un objet.
8. **Ticket sans sous-ticket** : sa racine porte aussi le champ et les observateurs, avec les sections de la méthode d'une feuille et le § 7.2 ; il se ratifie sous sa référence.

## Vue augmentée (lot 6)

Chaque niveau voit le ticket augmenté des observations des autres niveaux (décisions 20 à 23). Le ticket n'est jamais réécrit : ses ancres restent celles de ses documents, et les calques posés sur elles changent avec le champ. `outils/vue.mjs`, livré tel quel dans le skill racine à côté de `champ.mjs`, tire la vue du champ et des documents de la clé ; elle ne s'écrit ni ne se corrige à la main.

| Commande | Effet |
|---|---|
| `generer <dossier>` | écrit `vue.html`, pour le développeur, et `vue.md` dans le dossier de la clé ; un champ altéré ne donne pas de vue |
| `generer <dossier> --noeud <référence>` | écrit sur la sortie la vue de ce nœud, en Markdown, sans rien écrire : ses critères avec ceux qui les soutiennent, les scénarios qui les prouvent, son nœud, et les autres ancres où il a déposé, avec ce que les autres niveaux y ont mis ; la vue du nœud racine est la vue entière ; elle se lit même avant le premier dépôt |
| `generer <dossier> --json` | le modèle de la vue, `skill-ticket.vue/1` : ancres, état, marques, calques, rangement, à traiter |
| `verifier <dossier>` | les vues écrites sont-elles à jour, périmées (tirées d'un champ plus court), modifiées ou absentes ? |

La vue s'ouvre sur ce qui est à traiter, par gravité : désaccords, écarts, menaces, observations attendues ; puis chaque critère d'acceptation, suivi des critères qui le soutiennent jusqu'aux feuilles et des scénarios qui le prouvent ; les nœuds ; les ancres nées du champ. Un critère d'un nœud dit l'état de ce qu'il soutient : une feuille voit l'effet de ses écarts sur son parent et sur le critère d'acceptation. La page `vue.html` est autonome, sans réseau ni ressource extérieure : calques à afficher ou masquer, filtre par nœud avec un message d'état, états écrits en toutes lettres avec un symbole d'appoint, thèmes clair et sombre aux contrastes AA, lisible au clavier et sans JavaScript, ses commandes n'apparaissant qu'avec lui.

### Recette P6

`tests/vue-scenarios.mjs` rejoue le scénario d'essai du champ jusqu'à un moment choisi, dans un projet temporaire qui porte les documents de la clé :

- `exemples/ABCDE-3620-champ/vues/champ-n06.md` : deux corrections au motif `requete-native` ; l'observation d'ordre 2 attendue se pose sur les scénarios S03 et S04, que les corrections atteignent ;
- `champ-n15.md` : l'écart sur ABCDE-3620-1.2:C3 menace ABCDE-3620-1:C3 et CA03, en tête de « À traiter » ;
- `champ-n21.md` : le contrat du canal des lignes, né du champ, en désaccord, avec son écart au registre ;
- la vue finale de l'essai, `docs/demandes/ABCDE-3620/vue.html` et `vue.md`, et celle du projet résolu, que sa remise cite : tous les critères prouvés, rien à traiter.

La recette compare ces vues à celles qu'elle regénère, octet pour octet ; recalcule les piles sans le script, à plusieurs dépôts de l'essai, et les compare au modèle comme à la page, ancre par ancre et calque par calque ; compare l'état de chaque critère à celui du champ, à chaque dépôt ; vérifie la vue d'un nœud, le Décorateur et le Visiteur ; relève une vue périmée, modifiée à la main ou absente et un champ altéré ; vérifie la structure accessible de la page sans dépendance : langue, titre, un seul titre de premier niveau et aucun niveau sauté, libellés des commandes, liens internes, aucune ressource extérieure, états écrits. `node tests/vue-scenarios.mjs --ecrire` réécrit les vues versionnées après un changement voulu du rendu.

### Choix du lot 6, validés le 8 novembre 2026

1. **Critère en désaccord** : il garde l'état que lui donne le champ ; le désaccord s'y ajoute en marque et le met en tête de « À traiter ». Les autres ancres prennent l'état « en désaccord ».
2. **Scénario** : réalisé dès une réalisation ou un verdict conforme ; à reprendre quand sa dernière action a été corrigée, jusqu'à une nouvelle réalisation.
3. **Nœuds concernés** par une ancre, pour le filtre et la vue d'un nœud : le sien, ceux qui y ont déposé ; pour un scénario, les nœuds dont un critère porte l'un de ses critères d'acceptation et, pour une feuille, qui partagent son étiquette de couche.
4. **Vue d'un nœud** : les ratifications de tout l'arbre, puis ses ancres ; la vue du nœud racine est la vue entière ; elle se lit même avant que le dossier de la clé existe.
5. **Page** : commandes révélées par un script en ligne, masquées sans JavaScript, où la page reste entière ; légende repliable ; aucune ressource extérieure.
6. **Fraîcheur** : `verifier` regénère et compare ; « périmée » quand la vue écrite vient d'un champ plus court, « modifiée » sinon, à la main ou d'après d'autres documents.
7. **Exemples** : les documents de la clé du projet résolu copiés dans le projet d'essai ; vues des trois moments versionnées en Markdown, vues finales en HTML et en Markdown.
8. **Compatibilité** : un skill racine du lot 5 reste vérifiable sans le script de la vue ; un rattachement sans énoncés des critères des nœuds donne une vue sans ces énoncés.

## Recette, mesure du contexte et bilan (lot 7)

Le lot 7 clôt le prototype (décisions 25 à 29) : il mesure le contexte que charge chaque feuille, essaie un second arbre, joue la recette de bout en bout et rend le bilan, `BILAN.md`, avec le tableau des critères P1 à P9 et la proposition d'intégration.

### Mesure du contexte

`outils/mesurer-contexte.mjs`, outil du prototype que les skills générés ne portent pas, mesure sans modèle ce que charge chaque contexte d'un arbre : la session du skill de chaque nœud, chaque agent de couche, chaque sous-agent de rôle que sa consigne nomme, et les deux observateurs de l'arbre. À l'activation, ce que Gemini CLI charge de lui-même : noms et descriptions des skills et des agents installés, puis le corps du skill activé ou de l'agent invoqué. Au plus, en plus, ce que la consigne fait lire pour résoudre le ticket : modules et fichiers cités, copie du projet du fichier d'invariants, documents de la clé, vue du nœud ; jamais ce qu'elle fait écrire, ni le champ, qu'elle lit par la vue, ni le code d'un script, qui se lance. Le point d'entrée de l'orchestrateur se mesure de la même façon, selon l'ordre de lecture qu'écrit son `SKILL.md`, pour le même ticket. Le rapport compare chaque feuille à l'orchestrateur, puis donne le plus grand contexte de l'arbre, la somme de tous ses contextes et les fichiers relus d'un contexte à l'autre.

Rapports versionnés : `exemples/contexte/ABCDE-3620.md`, sur le projet d'exemple résolu, et `exemples/contexte/ABCDE-3512.md`. En bref : aucun contexte ne charge plus de 53 % du point d'entrée de l'orchestrateur, au plus ; la session d'une feuille en charge 38 à 40 % (53 % pour un ticket sans sous-ticket), 18 à 26 % à son activation ; l'arbre entier lit en tout cinq fois (ABCDE-3620) et trois fois (ABCDE-3512) ce que lit l'orchestrateur, dont près de la moitié en relectures. Le bilan en tire la revue de la décision 8.

### Second arbre : ABCDE-3512

`exemples/ABCDE-3512/ABCDE-3512.toml` reprend mot pour mot le ticket fil rouge du § 7.1 du module `referentiel` de l'orchestrateur : M01, trois couches, images de l'objectif, un seul ticket. Le prototype exigeant des critères, six y sont ajoutés, rédigés pour lui et à relire par le développeur. L'arbre se vérifie (un ticket, profondeur 0), se génère en un skill, racine et feuille à la fois, dont la transmission est versionnée dans `exemples/ABCDE-3512-skills/transmissions/`, s'installe avec ses neuf agents et sa commande, et se mesure. Sans arbre à ratifier, le ticket se ratifie une fois, sous sa référence, après son analyse : le champ refuse une ratification « arbre ABCDE-3512 ».

### Recette de bout en bout

Dans un seul workspace, la copie du projet d'exemple résolu, son historique Git reconstruit : l'arbre ABCDE-3620 se génère à l'identique de ses transmissions versionnées et s'installe ; les contrôles des consignes, lancés tels que les consignes installées les écrivent, avec les scripts du skill racine, passent sur la résolution : documents de la clé, kits et historique (`--depot`), champ, vue, et la vue de chaque feuille, où rien n'est à traiter ; `liste` montre chaque nœud clos, le champ, dont les 18 critères sont prouvés, et la vue à jour ; le retrait archive les transmissions, qui se vérifient et se mesurent comme les versionnées ; aucun fichier suivi par Git n'a changé, de l'installation au retrait. ABCDE-3512 suit le même chemin, de la vérification de l'arbre à sa vue, en passant par sa ratification. Le modèle n'y joue aucun rôle : P4, la rédaction des documents et l'invocation des observateurs s'essaient sur le poste.

### Mesure réelle sur le poste

La mesure statique estime les tokens à un pour quatre caractères ; une mesure réelle la recale, sur le poste du développeur, avec Gemini CLI 0.67.0 et sa clé, déjà configurée, jamais demandée ni affichée. Dans un workspace d'essai de confiance où l'arbre ABCDE-3620 est installé (recette P4, étapes 1 et 2) :

1. Session de base, qui n'active aucun skill : `gemini --approval-mode plan -p "Réponds seulement : prêt." -o json > base.json`. Sans interface, Gemini CLI refuse par défaut l'activation d'un skill (règle `activate_skill` de sa politique d'écriture, en mode non interactif).
2. Session d'activation, qui active le skill d'une feuille et s'arrête, avec une politique qui n'autorise que l'activation, dans un fichier `calibrage.toml` hors du dépôt :

   ```toml
   [[rule]]
   toolName = "activate_skill"
   decision = "allow"
   priority = 100
   ```

   puis `gemini --approval-mode plan --policy calibrage.toml -p "Active le skill ticket-abcde-3620-1-1, puis réponds seulement : activé." -o json > activation.json`.
3. `node <dépôt>/specs/generateur-skill-ticket/outils/mesurer-contexte.mjs calibrer base.json activation.json --caracteres 12566`, où 12 566 est la taille du corps du skill activé, que donne le rapport (ligne « corps du skill, à son activation » de sa session).

`calibrer` lit les statistiques des deux sorties (`stats.models`, tokens d'entrée et requêtes), attend une requête pour la base et deux pour l'activation, et donne le nombre de caractères par token du skill, à comparer à quatre. Si Gemini CLI demande une confirmation, ou si le skill fait plus que s'activer, les requêtes ne sont plus celles attendues : `calibrer` le relève et ne conclut pas. Le protocole n'a pas encore été joué : il est vérifié sur deux sorties d'essai de la forme de celles de Gemini CLI 0.67.0 (`tests/fixtures/gemini/`). Les sorties ne contiennent que la réponse et les statistiques ; aucune clé n'y figure.

### Recette P7

`tests/contexte.test.mjs` regénère les deux rapports et les compare aux rapports versionnés, octet pour octet ; vérifie que chaque fichier compté existe dans l'arbre ou dans le projet, a la taille comptée et se trouve cité par la consigne qui le fait lire, et qu'aucun fichier écrit par un nœud, ni le champ, ni un script n'est compté ; mesure l'orchestrateur selon l'ordre de lecture qu'elle relit dans son `SKILL.md` ; recalcule, pour chaque nœud et pour l'arbre, les rapports, les sommes, le plus grand contexte et les relectures ; vérifie le calibrage sur les sorties d'essai, et la ligne de commande. `tests/bout-en-bout.test.mjs` joue la recette de bout en bout sur les deux arbres ; `tests/bilan.test.mjs` vérifie ce qu'avance le bilan : chaque test cité en preuve existe sous ce titre, chaque ligne de mesure recopiée est celle d'un rapport, chaque fichier cité existe.

### Choix du lot 7, validés le 8 novembre 2026

1. **Périmètre de la mesure** : tous les nœuds, pas seulement les feuilles ; chaque feuille comparée à l'orchestrateur (P7), et en plus la racine et les nœuds composés, les observateurs, mesurés une fois pour l'arbre, la somme de l'arbre entier et ses relectures.
2. **Ce qui compte comme lu** : les modules et les fichiers que citent les sections 2 à 10 d'une consigne de skill, sans la place dans l'arbre ni la table des fichiers, ou tout le corps d'un agent ; la copie du projet du fichier d'invariants, même citée sans son chemin, et la copie du skill, que la consigne fait comparer ; un seul niveau de citations ; un script se lance et ne compte pas, sauf la vue du nœud, sa seule sortie lue en entier ; une lecture partielle (« § 2 à § 6 ») compte le fichier entier ; un chemin qui vaut pour chaque sous-ticket compte chacun.
3. **Sous-agents d'un nœud** : ceux que sa consigne nomme, par leur nom d'agent ou comme « sous-agent rédacteur » ; les agents de couche d'une feuille sont les siens ; les observateurs, appelés sur attente du champ, restent hors des sommes par nœud.
4. **Orchestrateur** : son ordre de lecture, au premier lancement puis à chaque ticket ; le référentiel du projet pris au modèle du module `referentiel` ; les référentiels Java et Angular comptés entiers quand le ticket touche leur couche ; sans copie du fichier d'invariants dans le projet, son modèle.
5. **Rapports versionnés** dans `exemples/contexte/`, le projet nommé tel qu'il est donné, en séparateurs `/` : même rapport sous Windows ; ils se régénèrent comme les transmissions attendues quand une source change.
6. **Calibrage** par différence entre une session de base et une session d'activation ; vérifié sur deux sorties d'essai, pas encore sur une session réelle.
7. **Second arbre** : critères d'ABCDE-3512 rédigés pour le prototype, à relire ; transmission versionnée comme celles d'ABCDE-3620.
8. **Recette de bout en bout** : les commandes des consignes installées, telles qu'elles sont écrites, depuis la racine du projet ; les valeurs qu'elles laissent au modèle (`<nom>`, `<sa réponse>`) données par la recette.
9. **Bilan** : recommandation de la voie (a), à décider par le développeur ; invariants candidats à numéroter à l'intégration ; `BILAN.md` vérifié par sa recette.

## Commandes

Depuis la racine du dépôt, sans dépendance : Node 20 ou plus récent pour les outils, Node 22 ou plus récent pour la recette (motifs de fichiers de `node --test`) :

```bash
node specs/generateur-skill-ticket/outils/arbre.mjs verifier specs/generateur-skill-ticket/exemples/ABCDE-3620
node specs/generateur-skill-ticket/outils/arbre.mjs plan specs/generateur-skill-ticket/exemples/ABCDE-3620
node specs/generateur-skill-ticket/outils/generer.mjs generer specs/generateur-skill-ticket/exemples/ABCDE-3620 --sortie <dossier>
node specs/generateur-skill-ticket/outils/generer.mjs verifier <dossier>/transmissions
node specs/generateur-skill-ticket/outils/installer-arbre.mjs installer <dossier>/transmissions --workspace <workspace>
node specs/generateur-skill-ticket/outils/verifier-documents.mjs <projet>/docs/demandes/<clé> --rattachement <dossier>/ticket-<clé>/outils/rattachement.json --controleur <dossier>/ticket-<clé>/outils/controler-criteres.mjs
node specs/generateur-skill-ticket/outils/verifier-kits.mjs <projet>/docs/demandes/<clé> --rattachement <dossier>/ticket-<clé>/outils/rattachement.json [--depot]
node specs/generateur-skill-ticket/outils/champ.mjs etat|verifier <projet>/docs/demandes/<clé> --rattachement <dossier>/ticket-<clé>/outils/rattachement.json
node specs/generateur-skill-ticket/outils/champ.mjs deposer <projet>/docs/demandes/<clé> <type> --noeud <référence> --auteur <nom> … --rattachement <dossier>/ticket-<clé>/outils/rattachement.json
node specs/generateur-skill-ticket/outils/vue.mjs generer|verifier <projet>/docs/demandes/<clé> [--noeud <référence>] [--json] --rattachement <dossier>/ticket-<clé>/outils/rattachement.json
node specs/generateur-skill-ticket/outils/mesurer-contexte.mjs mesurer <dossier>/transmissions [--projet <projet>] [--json] [--sortie <rapport.md>]
node specs/generateur-skill-ticket/outils/mesurer-contexte.mjs calibrer <base.json> <activation.json> --caracteres <n>
node --test "specs/generateur-skill-ticket/tests/*.test.mjs"
```

Sous Windows, les mêmes commandes passent dans PowerShell, avec `\` ou `/` dans les chemins ; une extraction Git en CRLF donne les mêmes skills, octet pour octet. `--referentiel <chemin>` lit un `referentiel-meso-contrats.toml` de projet au lieu du modèle de l'orchestrateur ; `--profondeur-max <n>` change le plafond ; `--invariants-projet <chemin>` donne la copie du projet du fichier d'invariants, au lieu du modèle de l'orchestrateur. `generer` écrit chaque skill dans `<dossier>/<skill>/` et sa transmission dans `<dossier>/transmissions/`, et ne remplace qu'un dossier qui contient déjà un skill de ticket généré. Code de sortie 1 au moindre écart, 2 pour un usage incorrect.

Un arbre s'installe par `installer-arbre.mjs` (section précédente) ; une transmission seule s'installe aussi comme les autres, `node tools/installer.mjs <dossier>/transmissions/ticket-abcde-3620-1-2-1.0.0.md`, mais sans ses agents ni sa commande. Avec `SKILL_TICKET_GEMINI` pointant vers Gemini CLI, la recette vérifie aussi la découverte des skills et le chargement des agents.

Les transmissions attendues changent dès que change une source dont héritent les skills de ticket (orchestrateur, socle, référentiels, modèle des invariants du projet, skills et scripts de la boîte à outils de la racine) : la recette le signale, et elles se régénèrent par

```bash
node specs/generateur-skill-ticket/outils/generer.mjs generer specs/generateur-skill-ticket/exemples/ABCDE-3620 --sortie specs/generateur-skill-ticket/exemples/ABCDE-3620-skills
```

(seules les transmissions y sont versionnées), de même que celle du second arbre, en remplaçant `ABCDE-3620` par `ABCDE-3512`. Les rapports de mesure du contexte changent avec elles, ou avec l'orchestrateur, et se régénèrent par

```bash
node specs/generateur-skill-ticket/outils/mesurer-contexte.mjs mesurer specs/generateur-skill-ticket/exemples/ABCDE-3620-skills/transmissions --projet specs/generateur-skill-ticket/exemples/ABCDE-3620-resolution --sortie specs/generateur-skill-ticket/exemples/contexte/ABCDE-3620.md
node specs/generateur-skill-ticket/outils/mesurer-contexte.mjs mesurer specs/generateur-skill-ticket/exemples/ABCDE-3512-skills/transmissions --sortie specs/generateur-skill-ticket/exemples/contexte/ABCDE-3512.md
```

`BILAN.md` recopie les rapports du lot 7, figés dans `exemples/contexte/lot-7/`, qui ne se régénèrent pas.

## Architecture et patrons

| Composant | Patron | Lot |
|---|---|---|
| `NoeudTicket` : même interface pour un ticket et ses sous-tickets, sur n niveaux | Composite | 1, livré |
| parcours de l'arbre par les vérifications ; parcours des critères de l'arbre par le champ, qui propage les menaces d'un critère à ceux qu'il soutient, puis par la vue, qui range ses ancres | Visiteur | 1, 5 et 6, livrés |
| ordre de résolution : un nœud prêt quand ses prérequis sont clos ; cycle de vie d'un nœud | Observateur, État | 1 et 3, livrés |
| `FabriqueSkillTicket` et `FabriqueJavaAngularPostgreSQL` : la famille de fichiers d'un nœud, référentiels, agents et commandes de la pile | Fabrique abstraite | 2, livré |
| `Monteur` : assemblage nœud par nœud, blocs du référentiel copiés puis paramétrés | Monteur, Prototype | 2, livré |
| consigne du nœud : même squelette, crochets selon la nature du nœud et selon la pile | Patron de méthode | 2, livré |
| exécuteur Gemini CLI par l'installateur ; place prévue pour le binôme Agent2Dev et Agent2Test, ou n8n | Pont | 3 |
| sous-agents de rôle, chacun dans son contexte, invoqués par les nœuds ; kits assemblés depuis les remises des feuilles | Stratégie, Monteur | 4, livré |
| champ d'observation partagé, en ajout seul : les niveaux ne se parlent que par lui | Médiateur | 5, livré |
| escalade ordre 1, 2, 3, puis humain, au niveau le plus bas qui le peut | Chaîne de responsabilité | 5, livré |
| actions enregistrées, corrections humaines qui les visent | Commande | 5, livré |
| vue augmentée : calques posés sur les ancres du ticket, sans toucher à leur état | Décorateur | 6, livré |

`outils/toml.mjs` lit le sous-ensemble de TOML 1.0 du référentiel et des tickets, sans dépendance ; sa recette le compare aux lectures de `tomllib` (Python), versionnées dans `tests/fixtures/toml/` et `tests/attendus/`. `outils/sources.mjs` lit les sources de l'héritage à leur version épinglée, archives comprises, fins de ligne normalisées ; `outils/fabrique.mjs` porte les fabriques, `outils/monteur.mjs` le Monteur et le contrôle de l'héritage, `outils/generer.mjs` la ligne de commande du générateur, `outils/installer-arbre.mjs` l'installation, le lancement et le retrait d'un arbre dans Gemini CLI, `outils/verifier-documents.mjs` et `outils/verifier-kits.mjs` les contrôles des documents et des kits, `outils/champ.mjs` le champ d'observation, `outils/vue.mjs` la vue augmentée, livrés tels quels dans le skill racine ; `outils/mesurer-contexte.mjs`, outil du générateur que les skills ne portent pas, la mesure du contexte.

## Lots et critères d'acceptation

| Lot | Contenu | Critères | Statut |
|---|---|---|---|
| 1 | modèle et vérification de l'arbre | P1, sauf l'invariant omis | livré |
| 2 | fabrique et Monteur : un skill par nœud, sa transmission par `bundle.mjs` | P1 (invariant omis), P2, P3 | livré |
| 3 | installation de l'arbre dans Gemini CLI, activation vérifiée sur le poste du développeur | P4 | livré |
| 4 | documents d'agent-tdd-jira, sous-agents de rôle, kits dev, test et démo | P8, P9 | livré |
| 5 | champ d'observation, retours humains simulés, observateurs d'ordre 2 et 3, escalade, propagation | P5 | livré |
| 6 | vue augmentée générée depuis le champ | P6 | livré |
| 7 | recette de bout en bout, mesure du contexte, second arbre, bilan | P7 | livré |

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

En codant la règle « aucune possibilité ne reste inconnue si sa réponse pouvait changer la composition », le prototype constate que l'exemple du § 7.2 du module `referentiel` (orchestrateur-c7e 3.5.3) laisse `regle` et `service` à `inconnu`, alors qu'un `oui` ajouterait un complément à M04. Le référentiel n'est pas modifié ; l'arbre d'essai répond à ces deux possibilités, et un test documente l'écart. Les écarts trouvés par la suite, dont l'absence de critères dans le ticket du § 7.1, sont relevés dans `BILAN.md`.
