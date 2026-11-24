# Journal des modifications

Les détails de chaque version figurent dans le journal de révision du `SKILL.md` de la spécification concernée. Ce fichier en donne la vue d'ensemble, dans l'ordre chronologique inverse.

## Prototypes

### 2026-11-09 : skill de ticket C7E, intégré

- **Lot 7 validé** par le développeur, choix compris ; les six critères d'ABCDE-3512 relus et acceptés.
- **Voie d'intégration (b)** choisie : une spécification de générateur à part, qui dépend de l'orchestrateur 3.x sans le modifier, nommée `generateur-skill-ticket`, ses sources lues dans un clone du dépôt ; plan d'intégration en cinq lots ratifié, les lots 1 et 2 livrés ensemble.
- **Lot 3 de l'intégration** ratifié : les corrections relevées par le bilan, publiées en `generateur-skill-ticket` 1.0.1 (section « Socle et experts back-front »).
- Le prototype est devenu la spécification `generateur-skill-ticket` 1.0.0 (section « Socle et experts back-front ») : ses outils, sa recette, ses exemples, son bilan et l'histoire de sa conception (`PROTOTYPE.md`) sont dans `specs/generateur-skill-ticket/` ; `prototypes/skill-ticket/` garde un renvoi. Le bilan reste figé à la fin du lot 7, ses tableaux sur les rapports du lot 7, figés eux aussi.

### 2026-11-08 : skill de ticket C7E, lot 7, bilan

- **Lot 6 validé** par le développeur, choix compris, avec la ratification du plan du lot 7.
- **Lot 7, recette, mesure du contexte et bilan** (critère P7) ; le prototype est terminé :
  - `outils/mesurer-contexte.mjs`, outil du prototype : pour chaque nœud d'un arbre, chaque contexte (session du skill, agents de couche, sous-agents de rôle que sa consigne nomme) et les observateurs de l'arbre, à deux bornes, à l'activation et au plus, en caractères et en tokens estimés ; le point d'entrée de l'orchestrateur mesuré de même, selon son ordre de lecture ; chaque feuille comparée à lui ; plus grand contexte, somme et relectures de l'arbre ; `calibrer` recale l'estimation sur deux sorties `-o json` de Gemini CLI ;
  - rapports versionnés, `exemples/contexte/ABCDE-3620.md` et `ABCDE-3512.md` : aucun contexte au-delà de 53 % du point d'entrée de l'orchestrateur, au plus ; la session d'une feuille à 38 à 40 % (53 % pour un ticket seul) ; l'arbre entier lit cinq fois (ABCDE-3620) et trois fois (ABCDE-3512) ce que lit l'orchestrateur, dont près de la moitié en relectures ;
  - second arbre, ABCDE-3512, le ticket fil rouge du § 7.1 du module `referentiel`, un seul ticket, complété de six critères rédigés pour le prototype, à relire ; sa transmission versionnée ; `arbre.mjs plan` dit la ratification d'un ticket sans sous-ticket ;
  - recette de bout en bout dans un seul workspace : génération, installation dans le projet résolu à l'historique reconstruit, contrôles par les commandes des consignes installées, `liste` à « clos » partout et vue à jour, retrait, transmissions archivées vérifiées et mesurées ; même chemin pour ABCDE-3512, jusqu'à sa ratification et sa vue ;
  - `BILAN.md` : critères P1 à P9 et leurs preuves, P4 et la mesure réelle en protocole sur le poste ; mesures ; décision 8 revue (contexte séparé par agent et ordre 3 gardés, trois pistes contre les relectures) ; limites ; écarts relevés ; intégration à décider par le développeur, recommandation d'un orchestrateur-c7e 4.0.0 où le skill de ticket remplace la fiche, avec dix invariants candidats et les points ouverts ;
  - protocole de la mesure réelle sur le poste, avec une politique de Gemini CLI qui n'autorise que l'activation d'un skill ; la clé n'est jamais demandée ni affichée.
- Choix à valider avec le lot : périmètre de la mesure, ce qui compte comme lu, sous-agents d'un nœud, mesure de l'orchestrateur, rapports versionnés, calibrage, second arbre, recette de bout en bout, recommandation du bilan.
- Aucune spécification modifiée.
- Vérifications : recette de 265 tests, dont 20 du lot 7 (rapports versionnés, fichiers comptés existants, de la taille comptée et cités, ordre de lecture de l'orchestrateur, comparaisons et relectures, citations, calibrage, ligne de commande, bout en bout sur les deux arbres, preuves du bilan) ; workflow : second arbre vérifié, rapports de mesure à jour.

### 2026-11-08 : skill de ticket C7E, lot 6

- **Lot 5 validé** par le développeur, choix compris, avec la ratification du plan du lot 6.
- **Lot 6, vue augmentée** (critère P6) :
  - `outils/vue.mjs`, livré tel quel dans le skill racine : `generer` écrit `vue.html` et `vue.md` dans le dossier de la clé, `generer --noeud` écrit sur la sortie la vue d'un nœud, `--json` le modèle `skill-ticket.vue/1`, `verifier` dit si les vues écrites sont à jour, périmées, modifiées ou absentes ; un champ altéré ne donne pas de vue ;
  - ancres du ticket, jamais réécrit (critères d'acceptation de `us.md`, critères des nœuds, scénarios du fichier Gherkin, nœuds), et ancres nées du champ ; pile d'une ancre : ce qui l'atteint, par son ancre ou par ce qu'il vise ou observe ; quatre calques posés sur l'ancre (Décorateur), ordre 1, 2, 3 et humain, sans toucher à son état ; états et marques ; « À traiter » en tête, par gravité ; rangement par un second visiteur des critères ;
  - page accessible et autonome : calques à afficher ou masquer, filtre par nœud, états écrits, thèmes clair et sombre aux contrastes AA, clavier, lisible sans JavaScript ;
  - skill racine : module `vue`, rattachement complété des énoncés des critères des nœuds ; consignes : chaque nœud lit sa vue à son lancement, les observateurs d'ordre 2 et 3 la vue entière, la racine la présente à la ratification de l'arbre et à la clôture et la cite dans sa remise ;
  - `installer-arbre.mjs liste` : chemin de la vue et sa fraîcheur ;
  - exemples : documents de la clé dans le projet d'essai du champ, vues versionnées à trois moments de l'essai (`vues/champ-n06.md`, `champ-n15.md`, `champ-n21.md`), vues finales de l'essai et du projet résolu ; `tests/vue-scenarios.mjs --ecrire` les réécrit.
- Choix à valider avec le lot : critère en désaccord, états des scénarios, nœuds concernés par une ancre, vue d'un nœud, commandes de la page, fraîcheur, exemples, compatibilité avec les skills du lot 5.
- Vérifications : recette de 245 tests, dont 30 du lot 6 (vues versionnées, piles recalculées sans le script et comparées au modèle et à la page, états du champ à chaque dépôt, attentes, menaces et désaccords, Décorateur et Visiteur, vue d'un nœud, structure accessible, vues périmées, modifiées, absentes et champ altéré, ligne de commande, génération) ; avec Gemini CLI 0.67.0 réel, cinq skills découverts et neuf agents chargés ; mêmes résultats sous Node 20, 22 et 24 et sur une copie du dépôt en CRLF ; workflow : vues des projets d'exemple vérifiées par le script du skill racine.

### 2026-11-08 : skill de ticket C7E, lot 5

- **Lot 4 validé** par le développeur, choix compris, avec la ratification du plan du lot 5.
- **Lot 5, champ d'observation** (critère P5) :
  - `outils/champ.mjs`, livré tel quel dans le skill racine : `deposer`, `verifier`, `etat` ; un champ par arbre, `docs/demandes/<clé>/champ.jsonl`, en ajout seul, au schéma fermé `skill-ticket.observation/1` (action, retour, observation des ordres 1 à 3, écart), chaque ligne chaînée à l'empreinte de la précédente, `champ.tete` gardant la dernière ; un dépôt hors schéma, ou sur un champ altéré, est refusé sans rien écrire ;
  - déclencheurs décidés par le script : deux corrections au même motif font attendre l'ordre 2, une proposition l'ordre 3 puis la décision du développeur, deux propositions refusées la mise en veille du motif ; un écart sur un critère menace les critères qu'il soutient jusqu'au critère d'acceptation ; des verdicts contraires de deux nœuds sur une même ancre s'inscrivent d'office au registre des écarts du projet (D6.INV-3) ;
  - skill racine : module `champ`, observateurs d'ordre 2 et 3 sans outil d'écriture, sections § 6 et § 7.2 de la méthode ; rattachement des critères complété de leurs « soutient » ;
  - consignes : état du champ lu à chaque lancement, ratifications déposées dans le champ (`retours.md` quitte les nouveaux skills), observations d'ordre 1 et actions déposées par les skills et les agents de couche, bilan d'ordre 3 et état final du champ à la clôture de la racine ;
  - `installer-arbre.mjs liste` : ratifications lues dans le champ, `retours.md` pour les arbres des lots 3 et 4, puis l'état du champ et un champ altéré signalés ;
  - exemples : champ d'essai `exemples/ABCDE-3620-champ/` (correction répétée, menace jusqu'à CA03, désaccord au registre), champ du projet résolu, qui prouve chaque critère d'acceptation.
- Choix à valider avec le lot : seuils de deux corrections et de deux refus, états des critères et propagation par un visiteur des critères tirés du rattachement, désaccords inscrits d'office et ancre `contrat` en texte libre, champ hors des commits avant la campagne, observateurs sans outil d'écriture et bilan conditionnel, intégrité du champ, compatibilité avec les arbres du lot 4, ticket sans sous-ticket.
- Vérifications : recette de 215 tests, dont 36 du lot 5 (rejeu des retours simulés, déclencheurs, propagation et son visiteur, désaccord, veille, ratifications, altérations du champ et dépôts refusés, ligne de commande, génération et installation) ; avec Gemini CLI 0.67.0 réel, cinq skills découverts et neuf agents chargés ; mêmes résultats sous Node 20, 22 et 24 et sur une copie du dépôt en CRLF ; workflow : champs d'observation des projets d'exemple vérifiés et lus par le script du skill racine.

### 2026-11-08 : skill de ticket C7E, lot 4

- **Lot 3 validé** par le développeur, choix compris.
- **Lot 4, documents de la clé, sous-agents de rôle et kits** :
  - boîte à outils du skill racine : agent-tdd-jira 1.3.4 (point d'entrée, modules `ingestion-jira`, `us-criteres`, `analyse-demande`, `cycle-tdd`, `tracabilite`, extrait de `binome-agent2test`), agent2test 1.3.1 (extraits des modules `plan` et `echange`), analyse-projet 1.0.2, modules `revue` de java 1.1.1 et angular 1.0.1, sonarqube 1.1.0, scripts `extraire-jira.mjs` et `controler-criteres.mjs` tirés d'agent-tdd-jira, `verifier-documents.mjs` et `verifier-kits.mjs` du prototype, `rattachement.json` ; contrôle de l'héritage étendu aux extraits, aux blocs de code et aux modules, résolus à la version de leur skill ;
  - quatre sous-agents de rôle sur la racine, rédacteur, analyste, relecteur et qualité, ces trois derniers sans outil d'écriture ; agents de couche des feuilles en cycle TDD d'agent-tdd-jira, scénario par scénario ;
  - consignes : documents de la clé rédigés avant la ratification de l'arbre, qui tient lieu de V2, puis commités ; critère d'acceptation de la clé dans les critères de chaque nœud ; analyste, relecteur et agent qualité dans les feuilles ; contributions aux kits dans leurs remises ; kits et remise à Agent2Test à la clôture ; état « documents à rédiger » dans `liste` ;
  - `outils/verifier-documents.mjs` (P8) et `outils/verifier-kits.mjs` (P9, avec `--depot` pour la branche, les commits, HEAD et l'arbre de travail) ;
  - projet d'exemple résolu `exemples/ABCDE-3620-resolution/`, dont la recette reconstruit l'historique Git à l'identique.
- Choix à valider avec le lot : boîte à outils sur la racine seule, épingles, numérotation et rattachement des critères, ratification valant V2 et documents commités à la ratification, commits de scénario, kits non commités avant la campagne, démonstration, sous-agents sans outil d'écriture.
- Vérifications : recette de 179 tests, dont 40 du lot 4 (boîte à outils et ses altérations, rattachement, sous-agents, documents et kits du projet d'exemple et leurs altérations, historique reconstruit) ; avec Gemini CLI 0.67.0 réel, cinq skills découverts et sept agents chargés ; mêmes résultats sous Node 20, 22 et 24 et sur une copie du dépôt en CRLF ; workflow : documents et kits du projet d'exemple contrôlés par les scripts du skill racine.

### 2026-11-08 : skill de ticket C7E, lot 3

- **Plan ratifié après le lot 2** (décisions 10 à 14 du README du prototype) : documents d'agent-tdd-jira rédigés par le skill racine, sous-agents de rôle tirés des skills du dépôt, kits dev, test et démo, Agent2Test tel quel et Agent2Dev hors du prototype ; un lot « documents et kits » prend la place 4, l'observation passe au lot 5, la vue augmentée au lot 6, la recette et le bilan au lot 7 ; critères P8 et P9.
- **Lot 3, installation dans Gemini CLI** :
  - `outils/installer-arbre.mjs` : `installer` (transmissions vérifiées, arbre complet, skills par `tools/installer.mjs`, agents dans `.gemini/agents/`, commandes dans `.gemini/commands/ticket/`, relevé dans `.gemini/skill-ticket/<clé>/`, masquage à Git), `liste` (état de chaque nœud), `verifier` (fichiers intacts, puis découverte des skills et chargement des agents par Gemini CLI), `lancer` (Gemini CLI en mode interactif sur la phrase d'activation du nœud), `retirer` (transmissions archivées dans `docs/demandes/<clé>/skills/`) ;
  - skills de ticket : une commande par nœud (`commandes/ticket/<nœud>.toml`, `/ticket:<nœud>`), une session par nœud, ratification de l'arbre vérifiée au démarrage de chaque sous-ticket, états de la racine et des nœuds composés, ratification consignée sur une ligne de forme fixe, agents appelés par `invoke_agent` avec les chemins du skill installé ; transmissions attendues régénérées.
- Choix à valider avec le lot : session par nœud, ligne de ratification, commandes dans les transmissions, archivage au retrait, version 1.0.0 maintenue, contrat épinglé à Gemini CLI 0.67.0.
- Vérifications : recette de 139 tests, dont 15 du lot 3 (installation dans un dossier et dans un dépôt Git, masquage, idempotence, refus, liste des états, lancement par un faux Gemini CLI, retrait et archivage, et, avec Gemini CLI 0.67.0 réel, skills découverts, agents chargés, dossier non fiable signalé) ; mêmes résultats sur une copie du dépôt toute en CRLF et sous Node 20 ; workflow : installation de l'arbre d'essai et job `contrat-gemini` sous Linux et Windows. Le critère P4 attend sa vérification sur le poste du développeur.

### 2026-11-08 : skill de ticket C7E, lot 2

- **Lot 2, fabrique et Monteur** : un skill de ticket par nœud de l'arbre, avec sa transmission tirée par `tools/bundle.mjs`.
  - `outils/fabrique.mjs` : fabrique abstraite `FabriqueSkillTicket` et fabrique concrète `FabriqueJavaAngularPostgreSQL` (référentiels, agents et commandes de la pile) ; consigne en patron de méthode, même squelette pour tous les nœuds ; blocs du référentiel copiés puis paramétrés, preuves des options retenues ou sans objet selon les valeurs choisies ;
  - `outils/monteur.mjs` : Monteur nœud par nœud, écriture des skills, transmission, aller-retour, et contrôle de l'héritage H1 à H6 (provenance complète, invariants et sections de la méthode de l'orchestrateur mot pour mot, copies identiques à leur source à la version épinglée, invariants cités définis, ticket du manifeste) ; rien n'est écrit au moindre écart ;
  - `outils/sources.mjs` : sources de l'héritage à leur version épinglée, archives comprises, fins de ligne normalisées ; `outils/generer.mjs` : commandes `generer` et `verifier` ;
  - `outils/arbre.mjs` : ordre de résolution d'un sous-arbre, avec ses préalables extérieurs ;
  - transmissions attendues des cinq skills de l'arbre d'essai, `exemples/ABCDE-3620-skills/transmissions/`.
- Choix à valider avec le lot : la fiche se répartit entre le skill ratifié, l'analyse (`analyse.md`, copie de travail de `ticket.toml`) et `remise.md` ; un dossier par sous-ticket sous celui de la clé Jira ; une branche et une clé pour tout l'arbre, le sous-ticket cité dans le corps des commits ; agents au format des sous-agents de Gemini CLI 0.67.0, installés au lot 3.
- Vérifications : recette de 124 tests, dont 34 du lot 2 (transmissions identiques aux attendues, aller-retour, reproductibilité, tickets en CRLF, héritage complet, préalables d'un sous-arbre, quatorze altérations rejetées dont l'invariant omis du critère P1, ligne de commande, installation par `tools/installer.mjs`) ; mêmes résultats et mêmes transmissions, octet pour octet, sur une copie du dépôt toute en CRLF ; 49 en-têtes YAML lus par js-yaml ; workflow étendu à la génération et à la vérification des transmissions, et aux sources dont héritent les skills de ticket.

### 2026-11-08 : skill de ticket C7E, lot 1

- **Prototype** `prototypes/skill-ticket/`, hors de `specs/` : chaque ticket résolu par un skill de ticket et ses agents, assemblés depuis le référentiel des méso-contrats sur le modèle fractal et récursif C7E. Décisions ratifiées : assemblage depuis le référentiel, skill de ticket à la place de la fiche de transformation, sous-tickets sur n niveaux avec un plafond réglable (3), un seul parent, exécution par l'installateur dans Gemini CLI, retours humains comme référence de l'observation, fabrique abstraite de skill-ticket par pile technique, ratification de l'arbre puis de chaque feuille.
- **Lot 1, modèle et vérification** :
  - `outils/arbre.mjs` : Composite `NoeudTicket` sur n niveaux, vérificateur (règles du référentiel sur chaque nœud, règles A1 à A9 de la décomposition), ordre de résolution, commandes `verifier` et `plan` ;
  - `outils/referentiel.mjs` : règle de choix (principal et compléments) et règles de validation du modèle, lues dans le module referentiel de l'orchestrateur ou dans un fichier de projet ;
  - `outils/toml.mjs` : lecteur TOML sans dépendance, comparé aux lectures de `tomllib` ;
  - arbre d'essai `exemples/ABCDE-3620/` : cinq nœuds sur trois niveaux (M04, M04, M02, M04, M03), dont une dépendance entre branches.
- Vérifications : recette de 90 tests (lecteur TOML, règle de choix sur seize demandes types, six écarts du critère P1 et seize écarts de décomposition rejetés, ligne de commande) ; workflow `prototype-skill-ticket.yml` sous Linux et Windows.
- Écart relevé : l'exemple du § 7.2 du module referentiel laisse `regle` et `service` inconnus alors qu'ils changeraient la composition ; non corrigé, signalé.

## Socle et experts back-front

### 2026-11-24 : orchestrateur-c7e 3.7.0, observatoire 1.1.0, generateur-skill-ticket 1.3.1

- **orchestrateur-c7e 3.7.0** : dimension D12 active, l'export de ses registres vers le socle d'observation, jalon J1c du passage au troisième ordre. Premier outil de l'orchestrateur, `outils/observation.mjs`, lancé par le développeur depuis le clone (`exporter`, `verifier`, `etat`) : l'IA en donne la commande sans l'exécuter, et la transmission ne le porte pas. Les événements du registre des concepts se lisent dans l'historique Git de `docs/c7e/concepts.json`, au premier parent de la branche d'intégration ; une entrée ajoutée par un commit `[É7-C7E]`, retrouvé à travers la fusion qui l'apporte, sort au niveau N2. Les lignes décidées du registre des écarts sortent avec l'invariant du dépôt qu'elles concernent ; une ligne sans décision, ou une dérogation sans le nom qui la valide, attend. Journal propre, `docs/c7e/observations-orchestrateur-c7e.jsonl`, en ajout seul et chaîné, avec sa tête, sous le sel de l'instance que partage le générateur ; une ligne ou un historique réécrits depuis l'export l'arrêtent. Socle 1.1.0 inclus, épinglé et référencé, ses correspondances précisées dans le module `observation` sans être redéfinies ; invariants D12.INV-1 à D12.INV-3, trente-six invariants ; scénario R23, point d'extension E6 et emplacement du journal à jour. Recette de douze tests, qui construit l'historique Git de ses projets d'épreuve.
- **observatoire 1.1.0** : dimension D6 active, la confrontation entre systèmes. Il relève aussi le journal de l'orchestrateur et reconnaît en clair les identifiants de concepts `C_<DOMAINE>_<NNN>`. Une sorte de candidat de plus, l'invariant : un même invariant du dépôt, cité par des écarts distincts de deux systèmes ou de deux instances, proposé à la spécification qui le définit ; le désaccord que constate le générateur et que le développeur décide au registre des écarts de l'orchestrateur est un seul écart, compté une fois. Module `systemes`, invariants D6.INV-1 et D6.INV-2 ; D4.INV-1 étendu aux deux clés d'une proposition par invariant, l'invariant et les systèmes, identifiants du dépôt ; références qui nomment le système de chaque enveloppe ; onze invariants. Recette de dix-huit tests.
- **generateur-skill-ticket 1.3.1** : correctif. Référence à orchestrateur-c7e 3.7.0 : les skills de ticket recopient ses trois invariants de plus ; transmissions d'exemple et rapports de contexte régénérés. Défaut corrigé : l'export ne regardait que son propre journal pour refuser un sel absent ou étranger ; il regarde tout journal d'enveloppes du projet. D9.INV-2 renforcé ; les tests qui comptaient trente-trois invariants de l'orchestrateur les comptent dans son point d'entrée. La recette passe ses 345 tests (un attend Gemini CLI).
- Les trois versions se référencent et se publient dans un même commit (`EVOLUTION.md`, section 7). `EVOLUTION.md`, section 10 : le couplage 1 confronte deux systèmes, par les invariants du dépôt. README, modes d'emploi, glossaire et transmissions à jour.
- Décisions ratifiées avant la rédaction (plan du jalon J1c) : outil propre à l'orchestrateur (C1) ; événements du registre des concepts lus dans l'historique Git, niveau N2 pour un commit `[É7-C7E]` (C2) ; journal propre, sel partagé (C3) ; confrontation par invariant dans l'observatoire (C4).
- Décisions ratifiées (pull request n° 79) : les douze points au-delà du plan, le commit `[É7-C7E]` retrouvé à travers la fusion qui l'apporte, la valeur `amendee` d'une rétrogradation et aucune `decision` pour une entrée jamais proposée, la ligne décidée par « respecter » ou par une dérogation validée par un nom, l'écart désigné par son instance et son ticket et compté une fois entre deux systèmes, la dimension D6 de l'observatoire, les références qui nomment le système de chaque enveloppe, D4.INV-1 étendu à l'invariant et aux systèmes, l'effet d'une proposition par invariant mesuré dans les enveloppes de la spécification qui le définit, le sel vu de tout journal du projet par l'export du générateur, avec D9.INV-2 renforcé, les tests du générateur qui comptent les invariants de l'orchestrateur dans son point d'entrée, le registre des concepts sans récurrence, faute de profondeur, et l'export lancé depuis la branche d'intégration ; le reste tel que proposé.

### 2026-11-24 : observatoire 1.0.0

- **observatoire 1.0.0**, nouvelle spécification, transmissible et outillée comme le générateur, jalon J2 du passage au troisième ordre : l'observatoire de l'écosystème, sur le poste. L'outil `observatoire.mjs`, lancé depuis le clone (`inscrire`, `relever`, `etat`, `confronter`, `proposer`, `suivre`, `verifier`), relève, vérifiés selon le socle, les journaux d'enveloppes des projets inscrits dans un magasin local, sous le répertoire Git commun du clone, jamais versionné ; il confronte les instances, observe l'état de l'écosystème, écrit des propositions minimisées dans `observatoire/propositions/`, au format `observatoire.proposition/1`, et suit l'effet des propositions ratifiées. Il propose et n'applique jamais : il ne commite ni ne publie, et rien d'une instance n'entre dans le dépôt que les valeurs minimisées d'une proposition.
- Dimensions D1 à D5, actives, et neuf invariants ; le registre déclare l'ordre de chaque dimension, D1 en OC1, D2 à D5 en OC3 : la première boucle du troisième ordre du dépôt, entre systèmes. Socle `socle-observation` 1.1.0 inclus et référencé. Recette de quinze tests, dont les instances d'épreuve sont produites par l'export du générateur ; workflow de recette, Linux et Windows.
- `observatoire/propositions/`, nouveau dossier, avec son README ; `EVOLUTION.md`, section 10 : la règle 3 nomme la colonne « Ordre », et la dernière phrase dit le couplage 1 fermé dans ses limites déclarées, un seul système qui exporte et un seul sujet qui ratifie. README, mode d'emploi, glossaire et transmission à jour.
- Décisions ratifiées avant la rédaction (plan du jalon J2) : spécification `observatoire`, transmissible et outillée (O1) ; magasin dans le répertoire Git commun du clone (O2) ; retours dès une instance, récurrences dans au moins deux (O3) ; propositions versionnées, leur statut inscrit par la pull request de ratification (O4).
- Décisions ratifiées (pull request n° 77) : les quatre points au-delà du plan, le vérificateur qui contrôle les propositions par l'outil de l'observatoire, l'installation de l'observatoire au niveau utilisateur seulement, les seuils de deux instances pour une récurrence et de vingt enveloppes de chaque côté pour un effet, et le workflow du générateur qui suit le socle d'observation ; le reste tel que proposé.

### 2026-11-24 : socle-observation 1.1.0, orchestrateur-c7e 3.6.1, generateur-skill-ticket 1.3.0

- **socle-observation 1.1.0** : lacune corrigée, un projet ayant un champ d'observation par ticket, numéroté à partir de 1 dans chacun : champ facultatif `source.journal`, l'empreinte salée de la clé du journal source, pour un format qui tient plusieurs journaux dans une instance ; SO4.INV-1 renforcé, l'enveloppe désigne sans ambiguïté l'enregistrement dont elle provient. Précisions : forme du sel dans les empreintes ; tête du journal, qui relève une dernière ligne réécrite ou supprimée ; date d'une enveloppe, celle de son enregistrement, ou celle de la ligne précédente si elle est plus récente, et fusion des journaux sources à l'export ; numéros sans espace ; preuve sans extrait ; motifs d'une ratification ; ancre d'un retour sur une action ; preuve d'une proposition et décision du registre d'apprentissage. Inclus par le générateur, référencé par l'orchestrateur.
- **orchestrateur-c7e 3.6.1** : correctif, référence au socle 1.1.0 ; D12 reste réservée ; aucune dimension ni aucun invariant modifié.
- **generateur-skill-ticket 1.3.0** : dimension D9 active, l'export de ses observations vers le socle. Outil `observation.mjs`, lancé depuis le clone, `exporter`, `verifier` et `etat` : il traduit le champ de chaque ticket et le registre d'apprentissage dans le journal d'enveloppes du projet, `docs/c7e/observations.jsonl`, en ajout seul et chaîné, avec sa tête, sans texte ni référence en clair, et n'exporte un enregistrement qu'une fois ; le sel de l'instance, tiré au premier export, reste dans le répertoire Git commun du projet, jamais versionné, affiché ni exporté. Socle 1.1.0 inclus dans la transmission, épinglé ; invariants D9.INV-1 à D9.INV-3 et critère P12 ; les sept invariants du socle entrent en vigueur dans le générateur, prouvés par la recette `tests/observation.test.mjs`, avec l'export attendu du champ d'ABCDE-3620 figé dans `tests/attendus/`. La recette passe ses 344 tests (un attend Gemini CLI). Les skills de ticket ne portent ni l'outil ni le module : leurs transmissions d'exemple et les rapports de contexte sont régénérés, seules les versions qu'ils citent changent.
- Les trois versions se référencent et se publient dans un même commit (`EVOLUTION.md`, section 7). README, modes d'emploi et glossaire à jour ; transmissions orchestrateur-c7e 3.6.1 et generateur-skill-ticket 1.3.0. Aucune dimension OC3 n'est encore active : l'export rend le générateur observable, et l'observatoire fermera la boucle du couplage entre systèmes (`EVOLUTION.md`, section 10).
- Décisions ratifiées avant la rédaction (plan du jalon J1b) : observatoire local, propositions par pull request, aucune donnée brute dans un dépôt (R5) ; export du générateur activé avant l'observatoire ; `source.journal` facultatif, socle 1.1.0 et orchestrateur 3.6.1 (Q1) ; sel dans le répertoire Git commun du projet (Q2) ; journal `docs/c7e/observations.jsonl`, versionné avec le projet (Q3) ; commande lancée depuis le clone, skills de ticket inchangés (Q4).
- Décisions ratifiées (pull request n° 75) : les quatre précisions apparues à la réalisation, la tête du journal, sans laquelle SO2.INV-1 ne tenait pas pour sa dernière ligne, la date bornée par la ligne précédente plutôt qu'un refus, `source.journal` attaché au format, présent même avec un seul ticket, et les correspondances précisées ; le reste tel que proposé.

### 2026-11-24 : socle-observation 1.0.0, orchestrateur-c7e 3.6.0, generateur-skill-ticket 1.2.0

- **socle-observation 1.0.0**, nouveau socle, non transmissible : le milieu commun du couplage entre systèmes du troisième ordre (`EVOLUTION.md`, section 10). Enveloppe `socle-observation.enveloppe/1` au schéma fermé (SO1), ordre cybernétique et niveau d'observation déclarés par chaque enveloppe ; journal en ajout seul, chaîné par l'empreinte de la ligne précédente (SO2) ; minimisation par sel d'instance et empreintes salées, aucun texte libre ni nom de personne, de client ou de projet (SO3) ; correspondances avec le champ et le registre d'apprentissage du générateur, le registre des concepts et le registre des écarts de l'orchestrateur, sans changer ces formats (SO4). Invariants SO1.INV-1 à SO4.INV-2. Aucun système ne l'applique encore.
- **orchestrateur-c7e 3.6.0** : dimension D12 réservée, l'observation partagée de ses registres ; point d'extension E6 ; module `observation` ; scénario R23, qui vérifie l'inertie ; socle d'observation référencé. Aucun invariant ajouté ni modifié, aucune section recopiée par les skills de ticket modifiée.
- **generateur-skill-ticket 1.2.0** : dimension D9 réservée, l'export de ses observations vers le socle ; point d'extension E4 ; module `observation` ; références à orchestrateur-c7e 3.6.0 et au socle d'observation, à la version qu'épingle l'orchestrateur ; test d'inertie dans la recette, qui passe ses 328 tests (un attend Gemini CLI). Les transmissions des skills de ticket d'exemple et les rapports de contexte sont régénérés : seules les versions qu'ils citent changent.
- Les trois versions se référencent et se publient dans un même commit (`EVOLUTION.md`, section 7). README, `EVOLUTION.md` (section 8), modes d'emploi et glossaire à jour ; transmissions orchestrateur-c7e 3.6.0 et generateur-skill-ticket 1.2.0.
- Décisions ratifiées avant la rédaction (plan du jalon J1) : périmètre pilote, le générateur et l'orchestrateur (R3) ; socle non transmissible (R4) ; préfixe `SO`, enveloppe sans texte libre, référence sans inclusion tant que les dimensions sont réservées, dimensions D12 et D9 avec leurs points d'extension, livraison en deux commits (P1 à P5).
- Décisions ratifiées (pull request n° 73) : les deux précisions du socle, les références propres à l'instance sorties par empreinte salée et les champs facultatifs `nature`, `cible` et `invariant` ; le reste tel que proposé.

### 2026-11-23 : scenario-playwright 1.6.1

- **scenario-playwright 1.6.1**, correctif de la recette et de la documentation de 1.6.0, fusionnée avant la fin de l'essai des défauts réintroduits.
  - Recette : sous un défaut qui arrête une campagne au premier test en échec (M172), R41 lisait un test absent de `campagne.json`, et la recette s'arrêtait avant la fin ; les contrôles de R41, R42 et R43 qui lisent un test, un pas ou une copie d'écran sans le trouver échouent désormais sans l'arrêter. Toujours 43 scénarios et 605 contrôles, sans échec, sous Node 26, 24 et 22.
  - Essai des défauts : cent quatre-vingt-dix défauts réintroduits un à un sur le code de 1.6.1, dont trente-deux nouveaux pour 1.6.0 (pages enregistrées, campagne, copies d'écran, verdict, rapport de conformité, résultats de campagne pour Xray) et quatre motifs de 1.5.0 adaptés au nouveau `resultats.mjs` (M149, M151 à M153) ; chacun relevé, la recette allant au bout pour chacun. Des cent cinquante-huit défauts de 1.5.0, douze sont relevés en plus par R38 à R43, aucun n'est perdu ; la table du module recette les donne tous.
  - L'entrée 1.6.0 du journal annonçait les défauts tous rejoués : elle dit désormais que leur essai, en cours à la publication, est rendu en 1.6.1 ; l'archive de 1.6.0 reste telle que publiée.
- Mode d'emploi et README mis à jour.

### 2026-11-23 : scenario-playwright 1.6.0

- **scenario-playwright 1.6.0**, pour l'essai du skill sur le poste du développeur : un poste Windows, en CMD, sans jeton d'API, d'où rien ne doit sortir ; chaque test de Xray s'y effectue, et son rapport de conformité ou de non-conformité se rend avec ses copies d'écran, prêt à coller dans Jira ou à verser dans Xray. Choix ratifiés par le développeur : les tests lus depuis leurs pages enregistrées en HTML complet, en mode formulaire comme en tableau ; une campagne, plusieurs scénarios dans une seule fenêtre avec une seule connexion, un test en échec n'arrêtant pas les suivants ; une copie d'écran à chaque vérification, à chaque échec et à la fin de chaque test ; un verdict, conforme, non conforme ou bloqué ; le rapport à coller sous deux formes, le balisage wiki de Jira Data Center et une page HTML pour Jira Cloud, les copies d'écran sous un nom stable ; un fichier d'import des résultats de Xray par campagne, statut et copies d'écran par pas.
  - Module `cas-de-test`, D17.INV-7 : `scripts/pages.mjs` lit la page d'un test de Xray enregistrée par Chrome, ou un dossier de pages, comme du texte, sans rien exécuter ni suivre d'adresse, ses cadres seulement dans le dossier de la page ; les pas se reconnaissent à leurs libellés Action, Données et Résultat attendu, en français ou en anglais, en tableau (Data Center) ou en mode formulaire (Cloud), sinon le scénario Gherkin d'un test Cucumber ; le même test donne le même texte que par l'API ; `--diagnostic` décrit une page sans aucune de ses valeurs, pour la signaler sans rien transmettre du poste.
  - Nouveau module `conformite`, dimension D22 : `jouer.mjs` joue une campagne, tous ses scénarios contrôlés avant la première action, un seul profil, une seule fenêtre et une seule connexion, la garde des origines de chaque scénario, `campagne.json` et `campagne.md` ; copie d'écran à chaque vérification, hors de l'écran comprise, et à la fin des étapes de chaque jeu ; verdict de chaque jeu, de chaque test et de la campagne, avec sa cause ; `resultats.mjs --format jira` écrit `conformite-jira.txt` et `conformite.html`, mêmes contenus, texte échappé, et, avec `--preuves`, les copies d'écran sous leur nom stable dans `captures-jira/`. D22.INV-1 à D22.INV-4.
  - `resultats.mjs` : `--format xray-dc`, une campagne en un fichier, statut du verdict (`ABORTED` et `Blocked` pour un test bloqué), copies d'écran de chaque pas sur ce pas, `--execution` pour une exécution de test existante.
  - E1 étendu (`verdict`, `capture_fin`, `cause`) ; D1.INV-4, D8.INV-2 et D21.INV-4 étendus. Agent : pages enregistrées, campagne et rapport de conformité, D10.INV-9, scénarios A17 et A18.
  - Recette : R39 à R43, de 570 à 605 contrôles ; vérifiée sous Node 26, 24 et 22, CI verte sous Linux et Windows ; l'essai des défauts réintroduits, en cours à la fusion, est rendu en 1.6.1.
- Mode d'emploi et README mis à jour.

### 2026-11-22 : scenario-playwright 1.5.0

- **scenario-playwright 1.5.0**, dernière étape de la feuille de route : le scénario ratifié mis dans les tests du projet, et ses résultats rendus à Xray ou à Zephyr Scale, sans rien écrire dans Jira. Choix ratifiés par le développeur, tels que recommandés : une seule version ; un fichier `@playwright/test` par scénario, écrit sans IA depuis le scénario, en TypeScript ou en JavaScript, avec des aides communes ; l'écriture dans le seul dossier de tests désigné, jamais par-dessus un fichier que le skill n'a pas écrit ; l'étape à la main confiée à une fonction de connexion que l'équipe écrit, le skill n'en posant qu'une souche qui échoue, sans aucun identifiant ; hors du poste, un test qui modifie des données sauté sans `SCENARIO_AUTORISER_MUTATIONS=1` ; les formats natifs de Xray et de Zephyr Scale, sous la clé retenue à l'import, sans capture sauf demande, les étiquettes en tags du test ; l'en-tête du test avec sa source et son empreinte, le test périmé dit par `verifier.mjs`, `--remplacer`, le test retouché gardé à côté ; la recette joue les tests exportés par `@playwright/test` 1.65.1 et les compare au skill, étape par étape.
  - Nouveau module `export`, dimension D21 : `exporter.mjs` écrit, pour chaque scénario valide dont la traduction est contrôlée, un test par jeu, une étape par `test.step` avec son numéro et sa ligne du texte, les cibles en localisateurs de Playwright dans la notation du skill, les étiquettes en tags ; les aides communes reprennent le moteur : attentes bornées, vérifications qui se poursuivent, préparation à sa place, nettoyage dans un bloc `finally`, nettoyage en échec annoté sans changer le résultat, `${unique}` propre à chaque jeu, garde des origines, WebSocket compris, et des mutations, `SCENARIO_ORIGINES` pour jouer ailleurs, appels avec la session du test et le jeton anti-CSRF recopié, messages masqués ; fichiers du skill reconnus à leur en-tête et à l'empreinte de leur corps, conflit, test périmé, test retouché gardé à côté, `--comparer`, `--remplacer` ; `verifier.mjs` compare un test exporté à son scénario. D21.INV-1 à D21.INV-5.
  - `resultats.mjs` : JSON d'import des résultats d'exécution de Xray, statut par pas d'un test manuel converti dont le texte n'a pas changé, exemples des jeux, captures seulement avec `--preuves` ; format « custom » de Zephyr Scale, en JSON et en archive .zip ; clé retenue à l'import, le scénario joué retrouvé à son empreinte, ou `--cle`, forme contrôlée ; rien n'est envoyé.
  - D1.INV-1 précisé : `@playwright/test` 1.65.1 en dépendance de développement, qu'aucun script du skill n'importe ; D1.INV-4 étendu à `exporter.mjs` et `resultats.mjs`. Agent : export et résultats, D10.INV-8, scénarios A15 et A16, commandes `/scenario:exporter` et `/scenario:resultats`.
  - Recette : R35 à R38, de 522 à 570 contrôles, les tests exportés joués par `@playwright/test` contre l'application de démonstration ; des contrôles de R5, R13, R32 et R33 rendus sûrs devant une entrée absente, qui arrêtaient la recette sous six défauts de 1.4.0 ; garde-fou de la recette porté de dix à quinze minutes, la recette ayant gagné un tiers de sa durée, et délai de la CI de douze à dix-huit minutes ; vérifiée sous Node 26, 24 et 22 ; trente-neuf défauts réintroduits de plus, cent cinquante-huit en tout, chacun relevé. Le nouvel essai des cent dix-neuf défauts de 1.4.0 sur le code fusionné a redonné la table publiée, sauf M78, onze contrôles en échec et non dix : le contrôle ajouté par le correctif des preuves échoue aussi ; la table de 1.5.0, remesurée en entier, le porte.
- Mode d'emploi et README mis à jour.

### 2026-11-22 : scenario-playwright 1.4.0

- **scenario-playwright 1.4.0**, troisième étape de la feuille de route : la préparation des données par l'API sous la garde des mutations, et par l'écran. Choix ratifiés par le développeur : deux sections du scénario, la préparation jouée à sa place parmi les « Étant donné », le nettoyage après la dernière étape, le jeu de treize actions inchangé, des marques sur les lignes du texte ; les appels avec la session du navigateur seulement, ses cookies et le jeton anti-CSRF recopié, sans aucun identifiant ; la garde des étapes, la mutation déduite de la méthode, aucune redirection suivie ni aucun appel rejoué ; des valeurs de la réponse gardées en variables et un suffixe propre à chaque exécution ; un nettoyage explicite, joué même après un échec, chaque appel une fois, signalé sans cacher le résultat ; la préparation par un autre scénario ratifié, dans le même onglet.
  - Nouveau module `donnees`, dimension D20 : marques `(par l'API)`, `(nettoyage par l'API)`, `(préparation : nom)` et `(nettoyage : nom)` du texte, à leur place ; sections `[[preparation]]` et `[[nettoyage]]` du scénario, hors du jeu d'actions ; appels `POST`, `PUT`, `PATCH` et `DELETE` vers une origine déclarée, par `page.context().request`, avec les cookies du profil et le jeton recopié de son cookie (`XSRF-TOKEN` dans `X-XSRF-TOKEN`, `csrftoken` dans `X-CSRFToken`), corps JSON ou fichier `.json`, statut attendu, une fois, sans redirection suivie ; valeurs gardées d'une réponse JSON d'au plus 1 Mio, masquées par leur nom, une valeur secrète masquée aussi partout où elle reparaît ; `${unique}` ; scénario de préparation contrôlé (traduction, origines, profil, ni jeux ni préparation à lui) et joué dans le même onglet, ses étapes au rapport ; préparation en échec qui arrête le jeu, nettoyage après les étapes même après un échec, nettoyage en échec signalé sans changer le statut ni le code de sortie ; garde hors du poste avant le navigateur et à l'appel ; `verifier.mjs` note un nettoyage d'une donnée fixe. D20.INV-1 à D20.INV-6 ; D2.INV-2 étendu ; E1 et E2 étendus sans qu'aucun champ change de sens.
  - Index du code : classes de corps des endpoints, Java, Kotlin et OpenAPI, avec leurs champs ; corps des opérations OpenAPI ; `traduire.mjs` propose, pour une ligne de préparation, les endpoints d'écriture et les champs de leur corps avec leurs contraintes, en commentaire, l'appel restant à compléter.
  - Agent : traduction de la préparation et du nettoyage, examen d'un nettoyage d'une donnée fixe avant la ratification, autorisation des mutations demandée à chaque exécution, D10.INV-7, scénarios A13 et A14.
  - Recette étendue d'une API d'écriture à session et jeton anti-CSRF sur l'application de démonstration : R30 à R34, de 426 à 522 contrôles ; vérifiée sous Node 26, 22 et 24 ; cinquante-trois défauts réintroduits de plus, cent dix-neuf en tout, chacun relevé.
- Mode d'emploi et README mis à jour.

### 2026-11-21 : scenario-playwright 1.3.0

- **scenario-playwright 1.3.0**, deuxième étape de la feuille de route : l'index sans IA du code du front et du back, lu par l'IA à la traduction, et les vérifications hors de l'écran, en lecture. Choix ratifiés par le développeur : piles Spring Boot et Angular, plus les gabarits HTML, Vue et JSX et le contrat OpenAPI ; libellés traduits par les fichiers JSON ; propositions du squelette et cibles absentes signalées en avertissement ; requête de la page, API en lecture et fichier téléchargé ; rien de plus pour les tests manuels sans jeton.
  - Nouveau module `code`, dimension D18 : `indexer.mjs <dossier du projet>` lit le code sans rien exécuter, ni suivre de lien symbolique, ni lire les dépendances, les sorties de construction et les fichiers de test, et écrit `index/code.json` et `index/code.md` dans le dossier des scénarios : routes d'Angular (modules chargés à la demande préfixés, gardes), de Vue Router et de React Router ; éléments d'interface des gabarits Angular, Vue, HTML et JSX, avec leur rôle, leurs noms accessibles possibles et leurs identifiants de test ; libellés traduits de ngx-translate, Transloco, vue-i18n et i18next ; endpoints de Spring en Java et en Kotlin, du contrat OpenAPI et des appels du front ; contraintes de validation et leurs messages ; chaque entrée avec sa source, `fichier:ligne`. De la configuration du back, seul le chemin de contexte est retenu. Empreinte des fichiers lus : un code modifié rend l'index périmé, qui n'est plus employé ; lecture bornée.
  - `traduire.mjs` ajoute sous chaque étape, en commentaire, les cibles de l'index dont le nom correspond aux libellés entre guillemets de la phrase ; `verifier.mjs` note une cible ou un chemin absent de l'index, sans changer son code de sortie.
  - Nouveau module `hors-ecran`, dimension D19 : critères `requete` (une requête de la page depuis la dernière action, sa méthode, son chemin, son statut, des champs JSON de son corps et de sa réponse), `api` (un GET sur une origine déclarée, avec la session du profil, sans redirection suivie) et `fichier` (texte, lignes, colonne CSV d'un fichier téléchargé). Ni en-tête, ni cookie, ni corps d'une étape à la main relevé ; secrets masqués ; nouveau champ `hors_ecran` du rapport.
  - Agent : indexation, lecture de l'index et examen des notes avec le développeur, D10.INV-6, scénarios A11 et A12, commande `/scenario:indexer` ; installateur racine : test de la cinquième commande.
  - Recette étendue d'un projet de démonstration front et back et d'API de lecture : R26 à R29, de 339 à 426 contrôles ; vérifiée sous Node 26, 22 et 24 ; vingt-quatre défauts réintroduits de plus, soixante-six en tout, chacun relevé.
- Mode d'emploi et README mis à jour.

### 2026-11-21 : scenario-playwright 1.2.0

- **scenario-playwright 1.2.0**, première étape de la feuille de route qui répond à la demande du développeur : « à partir d'un scénario et de l'accès au code back/front ainsi qu'au navigateur, toute l'action d'un testeur humain soit émulée pour réaliser des tests automatisés », quel que soit l'outil. Feuille de route ratifiée : étendre ce skill par versions mineures ; les sources Xray et Zephyr d'abord ; puis un index sans IA du code, des vérifications hors de l'écran en lecture, la préparation des données sous la garde des mutations ; enfin l'export en test Playwright du projet et en résultats au format d'import de Xray ou de Zephyr ; une version par étape. Choix ratifiés pour la 1.2.0 : fichiers exportés et API REST en lecture seule, jeton par variable d'environnement seulement ; test manuel converti pas à pas en « Quand » puis « Alors », signalé en tête.
  - `importer.mjs` lit aussi un fichier `.feature`, exporté de Xray ou de Zephyr Scale ou pris dans le dépôt, et une archive `.zip` d'un export, lue en mémoire, CRC-32 contrôlé, tailles bornées.
  - Par l'API, en lecture seule : `xray:` (Xray Cloud, authentification puis GraphQL `query`), `xray-dc:` (API de Jira et de Xray), `zephyr:` (Zephyr Scale Cloud, API v2, pas lus page après page), `zephyr-dc:` (API atm 1.0). Jetons dans `XRAY_CLIENT_ID` et `XRAY_CLIENT_SECRET`, `ZEPHYR_TOKEN` ou `JIRA_TOKEN` seulement, jamais affichés ni écrits ; https hors du poste, aucune redirection suivie, aucune requête vers une autre origine ; rien n'est écrit dans Jira, Xray ni Zephyr Scale.
  - Nouveau module `cas-de-test`, dimension D17, `scripts/cas.mjs` : test Cucumber ou BDD recopié sous le résumé du test, test manuel converti, test générique, en texte libre, qui appelle un autre cas ou dont un pas est vide refusé avec son motif, préconditions signalées ; la clé du test pour identité, d'un chemin d'import à l'autre (`@TestCaseKey=` de Zephyr Scale, clé de Xray, préfixe `TEST_`) ; provenance par lot. D17.INV-1 à D17.INV-6 ; D16.INV-5 et D16.INV-6 étendus ; quarante-huit invariants.
  - Agent : protocole d'import des cas de test, D10.INV-5 (aucun jeton demandé, affiché ni écrit ; un jeton collé se signale, avec la recommandation de le révoquer), scénarios A9 et A10, commande `/scenario:importer`.
  - Recette étendue d'un Xray et d'un Zephyr Scale factices, Cloud et Data Center, qui notent chaque requête, et d'archives d'export : R22 à R25, de 279 à 339 contrôles ; vérifiée sous Node 26, 22 et 24 ; treize défauts réintroduits de plus, quarante-deux en tout, chacun relevé.
- Mode d'emploi et README mis à jour.

### 2026-11-20 : scenario-playwright 1.1.1

- **scenario-playwright 1.1.1**, correctif. La recette passait par intermittence dans la CI, toujours sous Node 24 : un premier lancement du navigateur lent dépassait les délais courts de R5, R6, R8 et R11, ou ceux des preuves d'un échec, sur `main` après la fusion de 1.0.0 et sur la pull request de 1.1.0 ; puis, sur celle de 1.1.1, la recette s'est bloquée sous Windows jusqu'au délai du job, sans journal.
  - Preuves d'un échec, capture et instantané ARIA : 10 s au plus, au lieu de 5 et 3 ; la durée d'une étape en échec s'arrête à l'échec, sans le temps de ses preuves.
  - Recette : les délais courts ne portent plus que sur les étapes dont ils sont l'objet ; R5 prend le délai par défaut, 10 s ; le contrôle des preuves de R6 dit ce qu'il a trouvé. La recette dit son dossier temporaire dès le début, ferme ses propres navigateurs sans les attendre plus de 15 s, lit la sortie d'un script 2 s au plus après sa fin, et s'arrête d'elle-même au bout de dix minutes, en disant dans quel scénario.
  - Workflow `recette-scenario-playwright.yml` : la sortie de la recette s'affiche au fil de l'eau ; un pas bloqué s'arrête au bout de douze minutes ; une recette en échec laisse son dossier temporaire en artefact, sans les profils du navigateur, pour examiner l'échec sans le reproduire.
  - Piège connu, au module `execution` : Node 24, sous lequel seul ces lenteurs et ce blocage ont été vus.
  - Aucune dimension ni aucun invariant modifié ; les vingt-neuf défauts réintroduits rejoués, chacun relevé comme en 1.1.0.

### 2026-11-20 : scenario-playwright 1.1.0

- **scenario-playwright 1.1.0**, à la demande du développeur : « les scénarios pourraient aussi être récupérés depuis une page Jira ». Choix ratifiés : deux sources, un lecteur ; la description et les champs de texte, les commentaires sur demande, la provenance de chaque scénario ; des mots-clés en anglais ou en français ; la comparaison au réimport et le remplacement sur demande seulement ; une version 1.1.0 en une seule pull request.
  - `importer.mjs` : depuis une page enregistrée en MHTML (à la main, par capture-sprint-jira, ou remise à agent-tdd-jira), lue sans navigateur ; ou par l'adresse de la demande, ouverte dans le navigateur du poste sur un profil dédié à Jira, connexion à la main, page enregistrée dans `<dossier>/jira/`. Le skill n'y fait que naviguer et n'écrit jamais dans Jira.
  - Lecteur sans IA, `scripts/jira.mjs` : MHTML en quoted-printable ou en base64, Jira Cloud et Jira Data Center reconnus à leurs marqueurs, description et champs de texte, commentaires avec `--commentaires` ; scénarios Gherkin en français ou en anglais recopiés tels qu'écrits, contexte reporté en tête des étapes, colonnes d'exemples adaptées au format texte, refus motivés (table de données, texte multiligne, plusieurs tableaux d'exemples).
  - Un texte `<ÉTIQUETTE>.scenario` par scénario, avec sa provenance et ses empreintes ; étiquette `@<CLÉ>-Snn` de Jira, sinon reprise d'un import précédent par le titre, sinon attribuée.
  - Réimport : textes inchangés jamais réécrits ; `--comparer` dit identique, modifié, nouveau ou disparu, sans rien écrire ; `--remplacer` remplace les textes modifiés dans Jira et garde à côté un texte retouché depuis l'import ; un texte écrit à la main n'est jamais remplacé, un texte disparu jamais supprimé ; la traduction d'un texte remplacé devient périmée par l'empreinte.
  - Texte de départ : mots-clés de Gherkin en anglais ou en français (D2.INV-4).
  - Agent : protocole d'import, D10.INV-4, scénarios A7 et A8, commande `/scenario:importer`.
  - Dimension D16 active, module `jira` ; quarante et un invariants. Référence à capture-sprint-jira 1.2.2 ajoutée.
  - Recette étendue d'un Jira factice, pages de Jira Cloud et de Jira Data Center et leur MHTML : R1 étendu, R18 à R21, de la lecture à l'import par l'adresse ; défauts réintroduits étendus.
- `installer.mjs` installe aussi la commande `/scenario:importer` ; mode d'emploi et README mis à jour.

### 2026-11-20 : scenario-playwright 1.0.0

- **scenario-playwright 1.0.0**, nouvelle spécification, à la demande du développeur : « un skill playwright qui soit programmable par un scénario et permette d'effectuer les manipulations côté utilisateur ». Choix ratifiés : le nom ; un format de départ en texte inspiré de Gherkin, traduit en TOML ; la traduction par l'IA, ratifiée par le développeur ; la connexion à la main seulement ; le navigateur choisi pour la meilleure compatibilité avec Chrome ; les mutations hors du poste sur autorisation explicite.
  - Texte de départ `.scenario` : étiquettes, titre, adresse, origines, profil, paramètres, étapes en `Étant donné`, `Quand`, `Alors`, marques `(création)`, `(modification)`, `(suppression)` et `(à la main)`, variables `<nom>` et tableau d'exemples ; lu sans IA, chaque erreur avec sa ligne.
  - Scénario TOML exécutable : squelette écrit sans IA par `traduire.mjs`, étapes complétées par l'IA, contrôle sans IA de la traduction (empreinte du texte, structure, lignes, ordre, marques, variables), plan ligne par ligne pour la ratification.
  - Moteur : jeu fermé de treize actions, commun avec le navigateur d'Agent2Test pour les gestes partagés ; cibles par rôle et nom accessible, libellé ou texte ; cible ambiguë qui échoue sans agir ; attentes par état, bornées ; aucune étape rejouée ; aucun code exécuté dans la page.
  - Garde : seules les origines déclarées sont permises, WebSocket compris ; mutations hors du poste refusées sans `--autoriser-mutations` ; aucun identifiant, connexion à la main dans un profil dédié ; trace seulement sur demande.
  - Preuves : rapport JSON aux champs stables et rapport Markdown, captures, instantanés ARIA à l'échec, erreurs de console et réponses en erreur, téléchargements avec leur empreinte.
  - `designer.mjs` rend la cible d'un élément cliqué par le développeur, sans actionner la page. Agent `pilote-scenario` et commandes `/scenario:traduire`, `/scenario:jouer` et `/scenario:designer`.
  - `playwright-core` 1.65.1, dont le Chromium 159 suit le Chrome stable 158 et le suivant ; Node 22 ou plus récent, `playwright-core` 1.65 n'étant plus essayé sous Node 20.
  - Dimensions D1 à D10 actives, D11 à D15 réservées ; points d'extension E1 à E3 ; trente-trois invariants. Références à agent2test 1.3.1 et à agent-tdd-jira 1.3.4, sans inclusion.
  - Workflow `recette-scenario-playwright.yml` ; mode d'emploi `docs/scenario-playwright/mode-emploi.md`.
- `installer.mjs` installe le skill avec son agent et ses commandes ; sa recette et le contrat avec Gemini CLI en tiennent compte.
- Vérifications : recette de 17 scénarios (213 contrôles), sous Node 22 avec Chromium 159 et sous Node 24 avec Chrome for Testing 153 ; vingt défauts réintroduits, chacun relevé par la recette ; `tools/verifier.mjs`.

### 2026-11-17 : generateur-skill-ticket 1.1.1

- **generateur-skill-ticket 1.1.1** : correctif, ce qu'a relevé la revérification de la 1.1.0, ratifié par le développeur ; aucune dimension ajoutée, aucune autre spécification touchée.
  - Clôture d'un ticket sans sous-ticket : son skill verse aussi l'apprentissage du ticket au registre, dans sa remise, comme la racine d'un arbre dans sa clôture.
  - Ordre de la clôture : l'apprentissage vient après le contrôle des kits et l'ouverture de la campagne d'Agent2Test, car le registre, suivi par Git, rendrait la remise périmée ; le développeur versionne ensuite le relevé et le registre, avec le dossier du ticket.
  - `apprentissage.mjs clore` ne compte que les commits du ticket, et non ceux des tickets antérieurs que porte l'historique de la branche ; un commit planifié réalisé sur plusieurs slots n'est plus un écart, seuls deux commits sur le même slot en font un.
  - Couches des scénarios : un scénario peut dire les couches qu'il touche, `couches`. `arbre.mjs proposer` ne le croise qu'avec les thèmes de ces couches (pour ABCDE-3512, sept commits proposés au lieu de seize), la vérification refuse un commit d'une autre couche, le rattachement porte leurs étiquettes et `verifier-documents.mjs` les contrôle dans le fichier Gherkin.
  - Des scénarios hors de la racine, et des thèmes sur un nœud composé ou mal formés, sont refusés au lieu d'être ignorés. D1.INV-5 est remplacé par un invariant plus fort, qui ajoute ces règles sans en retirer aucune.
  - La consigne d'une tâche ne renvoie plus à un module absent de l'arbre.
  - Les protocoles sur le poste, P4 de l'installation et la mesure réelle, portent sur le ticket en cours, la taille du skill lue dans le rapport de son arbre ; plus aucun arbre d'exemple ni taille recopiée.
  - Mesure : somme des contextes de 275 511 à 275 715 tokens pour ABCDE-3620, de 158 787 à 159 172 pour ABCDE-3512, toujours plus de 10 % sous le lot 7.
- Vérifications : recette de 328 tests, dont 12 de la 1.1.1 ; `tools/verifier.mjs`.

### 2026-11-17 : generateur-skill-ticket 1.1.0

- **generateur-skill-ticket 1.1.0** : évolution mineure, ratifiée par le développeur, en remplacement de la recette sur des scénarios d'exemple : chaque ticket réel devient une recette et un cycle d'apprentissage.
  - Arbre des commits : l'arbre suit la composition récursive imbriquée (CRI) de la méthode C7E, ticket et US au niveau macro, composition au niveau des méso-contrats, tâches au niveau des méso-composants, commits au niveau micro. La racine déclare les scénarios de l'US ; chaque tâche porte ses commits planifiés, un par scénario et par thème, proposés par `arbre.mjs proposer` et ratifiés avec l'arbre ; nouvel invariant D1.INV-5. Les commits portent les lignes `Tâche`, `Scénario` et `Thème` ; la ligne `Sous-ticket` reste admise pour un arbre produit avant. Le rattachement porte les scénarios et le plan ; le fichier Gherkin reprend les scénarios déclarés, contrôlés par `verifier-documents.mjs`.
  - Apprentissage permanent, nouvelle dimension D8 et module `apprentissage` : relevé de chaque ticket classé par profondeur CRI, chaque entrée avec sa preuve ; descente notée à la qualification, remontée tirée à la clôture du champ et des écarts entre le plan des commits et la branche ; registre du projet en ajout seul et chaîné ; un motif relevé dans deux tickets devient une proposition, retenue ou refusée par le développeur seul, et deux refus le mettent en veille ; tendance par ticket. Script `apprentissage.mjs` dans la boîte à outils de la racine, exigé depuis la 1.1.0.
  - Critères P10 et P11 ; les arbres d'exemple restent des tests de non-régression, figés (D8.INV-4).
- Vérifications : recette de 316 tests, dont 33 de la 1.1.0 ; `tools/verifier.mjs`.

### 2026-11-09 : generateur-skill-ticket 1.0.1

- **generateur-skill-ticket 1.0.1** : correctif, lot 3 de l'intégration, les corrections relevées par le bilan du prototype ; aucune dimension ni aucun invariant modifié, aucune autre spécification touchée.
  - Fichier d'invariants comparé par empreinte : nouveau script `outils/invariants.mjs`, livré dans le skill racine ; au démarrage, chaque nœud compare la copie du projet à l'état sur lequel son skill a été produit, sans lire la copie du skill, puis ne lit que la copie du projet, qui fait foi ; sections qui diffèrent, copie absente ou altérée et valeurs ADAPTER restées sont signalées. Un skill racine exige le script depuis la 1.0.1 ; un skill produit en 1.0.0, ou par le prototype, reste vérifiable sans lui.
  - Chaque agent de couche porte sa part de la consigne, objectif, critères et composition, au lieu de relire celle de son nœud.
  - Module court `champ-depot` du skill racine pour les nœuds et les agents de couche : ce qu'ils déposent dans le champ et la suite qu'ils donnent à ses attentes ; le module `champ` entier reste à la racine et aux observateurs.
  - Le rédacteur est invoqué par son nom d'agent, comme les autres sous-agents de rôle.
  - P4 précisé pour un ticket sans sous-ticket, avec la variante du protocole sur le poste pour ABCDE-3512.
  - Mesure : les relectures visées par le bilan ont disparu des rapports ; somme des contextes de 311 138 à 275 231 tokens pour ABCDE-3620 (−11,5 %), de 179 881 à 158 705 pour ABCDE-3512 (−11,8 %) ; plus grand contexte de 50 à 44 % et de 53 à 47 % du point d'entrée de l'orchestrateur. Le bilan estimait environ 14 % : l'extrait de dépôt compte 5 000 caractères plutôt que 2 000, et chaque agent de couche lit désormais les méso-contrats de son nœud.
  - Lecture partielle du socle et des référentiels : hors de ce correctif.
- Vérifications : recette de 283 tests, dont 13 de la 1.0.1 (script des invariants, consignes et agents, extrait de dépôt du champ, rédacteur, exigence par version, réduction des relectures, comparaison de bout en bout dans le workspace d'ABCDE-3512) ; `tools/verifier.mjs`.

### 2026-11-09 : generateur-skill-ticket 1.0.0

- **generateur-skill-ticket 1.0.0** : première version, issue du prototype « skill de ticket » (lots 1 à 7), selon la voie (b) choisie par le développeur : une spécification à part, qui dépend de l'orchestrateur C7E sans le modifier, le skill de ticket tenant lieu de fiche de transformation.
  - Point d'entrée : déroulé du générateur (qualifier, décomposer, vérifier l'arbre, présenter le plan, générer, installer, lancer la racine), outils, cycle 7E, registre des dimensions D1 à D7, toutes actives, 24 invariants, points d'extension E1 à E3 (fabriques par pile, exécuteur, formats propres au générateur).
  - Modules `arbre`, `assemblage`, `installation`, `documents-kits`, `champ`, `vue` et `mesure`, chacun avec la recette de ses invariants : les tests qui les prouvent, cités sous leur titre.
  - Références : orchestrateur-c7e 3.5.3, socle-back-front 1.1.0, java 1.1.1, angular 1.0.1, agent-tdd-jira 1.3.4, agent2test 1.3.1, analyse-projet 1.0.2, sonarqube 1.1.0, aux versions qu'épinglent les sources des skills de ticket.
  - Outils, recette et exemples du prototype dans `specs/generateur-skill-ticket/`, non transmis : le générateur se lance depuis un clone du dépôt, où il lit ses sources à leurs versions épinglées. Chaque skill de ticket cite désormais le générateur et sa version ; un skill produit par le prototype reste vérifiable, et le bloc d'exclusion Git qu'écrivait le prototype est reconnu puis remplacé.
  - Mode d'emploi : `docs/generateur-skill-ticket/mode-emploi.md`. Workflow `recette-generateur-skill-ticket.yml`, à la place de celui du prototype.
- Vérifications : recette de 270 tests, dont 4 pour la spécification (recette de chaque invariant, outils cités, références) et 1 pour la provenance des skills ; `tools/verifier.mjs` : 15 spécifications, transmissions fidèles.

### 2026-11-07 : explication-hote-ia 1.1.0

- **explication-hote-ia 1.1.0** : version mineure. Le développeur a demandé que le skill, bien que maintenu dans ce dépôt, en soit complètement indépendant, pour une diffusion autonome, avec un mode d'emploi à côté de lui.
  - Dimension D12, diffusion autonome : module `diffusion` et invariants D12.INV-1 à D12.INV-5. Le dossier du skill se suffit : l'installer, le vérifier et s'en servir ne demandent que ce dossier, Node 20 ou plus récent et Gemini CLI ; aucune étape du skill ne passe par le dépôt, par un outil extérieur ou par le réseau ; seul Gemini CLI parle à son modèle, comme sans le skill.
  - `specs/explication-hote-ia/MODE-EMPLOI.md`, à côté du point d'entrée : installer, vérifier, utiliser, mettre à jour, retirer, diffuser. Déclaré comme module de D12, il part avec le dossier et avec la transmission ; ses commandes sont, à l'identique, celles des modules.
  - Installation par Gemini CLI lui-même : `gemini skills install`, depuis le dossier ou un fichier `.skill` (une archive zip du dossier), puis l'extraction et la recette. Le sous-agent et les commandes s'installent par une commande que le développeur lance, et une commande de retrait les supprime ; avec `gemini skills uninstall`, rien ne reste.
  - Plus aucune dépendance au dépôt : l'en-tête de transmission et le module `agent` n'installent plus par `tools/installer.mjs` ; le contrat de version est écrit dans le point d'entrée ; les modules `hote`, `composants` et `recette` ne nomment le dépôt que comme origine et lieu de vérification.
- `docs/explication-hote-ia/mode-emploi.md` garde « Comprendre l'IA avant de s'en servir », les sept questions ; l'installation et l'usage passent dans le mode d'emploi joint au skill, vers lequel il renvoie.
- Outillage : la recette des repères installe le skill comme le dit le mode d'emploi, `gemini skills install` depuis le dossier et depuis un fichier `.skill`, commandes du mode d'emploi, retrait, sans plus passer par `tools/installer.mjs` ; le workflow de recette lance, sous bash et sous CMD, les commandes du mode d'emploi qui installent puis retirent le sous-agent et les commandes, et vérifie que sa commande d'extraction est celle du module `execution`.
- README : ligne d'explication-hote-ia, mode d'emploi du skill dans le tableau des documents, installation autonome signalée dans « Installer un skill dans Gemini CLI ».
- Vérifications :
  - recette de 28 tests réussie sous Node 20, 24 et 26.13.0, sous Linux, en rejouant les étapes bash du workflow, commandes du sous-agent et du retrait comprises ; 23 défauts réintroduits un à un, tous attrapés sous Node 26.13.0 ;
  - repères : 32 constats tenus contre `@google/gemini-cli` 0.67.0, sous Node 26.13.0, dans un espace réseau isolé, dont 5 pour la diffusion autonome ; `strace` ne relève aucune connexion hors de la boucle locale ;
  - les deux commandes qui font le fichier `.skill`, `python3 -m zipfile` et `tar --format zip`, donnent un fichier que Gemini CLI 0.67.0 installe ;
  - en-têtes YAML lus sans erreur par js-yaml ; contrat avec Gemini CLI tenu ; vérificateur, glossaire, transmission (aller-retour identique) et recette de l'installateur (17 tests) à jour.
- Décisions ratifiées (pull request n° 47) :
  - D12 comme nouvelle dimension, d'où la version mineure 1.1.0 ;
  - la diffusion par le dossier ou par un fichier `.skill`, installé par `gemini skills install` ;
  - deux guides : le mode d'emploi joint au skill pour installer et utiliser, et `docs/` qui garde « Comprendre » ;
  - les mentions du dépôt gardées comme origine et lieu de vérification, sans aucune étape qui en dépende ;
  - le mode d'emploi déclaré comme module de D12, donc transmis avec le skill ;
  - la recette des repères qui installe le skill comme le dit le mode d'emploi, et non plus par `tools/installer.mjs`.

### 2026-11-07 : explication-hote-ia 1.0.2

- **explication-hote-ia 1.0.2** : correctif. L'en-tête de transmission et le module `recette` citaient encore les scénarios A1 à A10 : à l'installation, l'IA rejouait les scénarios sans A11 (« c'est une boîte noire ») ni A12 (« est-ce que tu envoies tout mon code chez Google ? »), ceux du parcours découverte. Ils citent A1 à A12, comme le point d'entrée et le module `agent`. Le tableau des dimensions porte la version courante ; la version annoncée par le script, le sous-agent et les commandes passe à 1.0.2. Aucun comportement ni aucun invariant modifié. Archive 1.0.1 ; la transmission 1.0.1 reste telle qu'elle a été publiée.
- `docs/explication-hote-ia/mode-emploi.md` : renvois à la version 1.0.2 et à sa transmission.
- Vérifications :
  - recette de 28 tests réussie sous Node 20, 24 et 26.13.0, sous Linux, après matérialisation de la transmission et extraction des six fichiers par la commande du module `execution`, § 8 ; 23 défauts réintroduits un à un, tous attrapés sous Node 26.13.0 ;
  - repères : 29 constats tenus contre `@google/gemini-cli` 0.67.0, sous Node 26.13.0, dans un espace réseau isolé ; `strace` ne relève aucune connexion hors de la boucle locale ;
  - en-têtes YAML lus sans erreur par js-yaml ; contrat avec Gemini CLI tenu ; vérificateur, glossaire, transmission (aller-retour identique) et recette de l'installateur (17 tests) à jour.
- Décisions ratifiées (pull request n° 46) :
  - la correction publiée en version 1.0.2, sans attendre une prochaine évolution ;
  - la version annoncée par le script, le sous-agent et les commandes portée à 1.0.2, bien que leur comportement ne change pas.

### 2026-11-07 : explication-hote-ia 1.0.1

- **explication-hote-ia 1.0.1** : correctif. Le développeur a précisé la destination du skill : l'équipe, qui le diffuse aux développeurs hésitant à se servir de l'IA sans en connaître le fonctionnement. L'hésitation qui revient le plus est le sentiment d'une boîte noire.
  - Parcours découverte, à la place du parcours guidé : sept questions d'un développeur qui découvre l'outil, de « qu'est-ce que c'est, au juste ? » à « peut-il se tromper, et comment le vérifier ? ». Chacune se traite en trois temps : la réponse simple, sa démonstration sur le poste, ce que le développeur garde en main. Pendant le parcours, l'agent ne modifie rien.
  - Étiquettes en clair pour qui découvre l'outil, comme « vu sur votre poste » ou « je ne peux pas le savoir d'ici » ; elles gardent la catégorie et la source des étiquettes courtes.
  - Invariants D7.INV-4 (pédagogie) et D7.INV-5 : expliquer sans chercher à convaincre ; les limites et les risques se disent aussi clairement que les garde-fous, et aucune réassurance ne se donne sans source. Scénarios A11 et A12.
  - Repère H1 corrigé : sous Node 26.13.0, la connexion par compte Google suit le proxy de `HTTPS_PROXY`, mais pas les requêtes au modèle par clé d'API, les statistiques d'usage ni la recherche de mise à jour, qui partent en direct. `NODE_USE_ENV_PROXY=1` les ramène au proxy. Sous Node 22 et 24, tout suit le proxy.
  - En-têtes YAML des modules `agent`, `contexte` et `diagnostic` rendus lisibles par un lecteur YAML strict.
- `docs/explication-hote-ia/mode-emploi.md` refait pour la diffusion : « Comprendre avant de s'en servir », sept questions lisibles sans rien installer ; « Essayer sans risque », l'installation et le parcours découverte ; « Aller plus loin ».
- Outillage : les repères tournent sous Node 26.13.0, avec `NODE_USE_ENV_PROXY=1`, pour que toute sortie de l'hôte reste dans le proxy témoin.
- Vérifications :
  - recette de 28 tests réussie sous Node 20, 22 et 26.13.0, sous Linux ; 23 défauts réintroduits un à un, tous attrapés sous Node 26.13.0 ;
  - repères : 29 constats tenus contre `@google/gemini-cli` 0.67.0, sous Node 26.13.0, dans un espace réseau isolé ; `strace` ne relève aucune connexion hors de la boucle locale ;
  - en-têtes YAML du skill, de ses modules et du sous-agent lus sans erreur par js-yaml, le lecteur de Gemini CLI ; contrat avec Gemini CLI sans erreur ;
  - vérificateur, glossaire, transmission et recette de l'installateur (17 tests) à jour.
- Décisions ratifiées (pull request n° 44) :
  - le parcours découverte comme réponse par défaut de `/hote:explique` sans question ;
  - les étiquettes en clair pour qui découvre l'outil ;
  - les invariants D7.INV-4 et D7.INV-5 ;
  - les repères confrontés sous Node 26.13.0, avec `NODE_USE_ENV_PROXY=1`.

### 2026-11-07 : agent2test 1.3.1, agent-tdd-jira 1.3.4, agent2dev 1.1.3, orchestrateur-c7e 3.5.3

- Le poste de la mission est passé à Node 26.13.0 le 6 novembre 2026 ; à la demande du développeur, les spécifications et l'intégration continue en tiennent compte.
  - **agent2test 1.3.1** : correctif. Node 26.13.0 recommandé, à la place de Node 24 : manifeste, règles globales, module `exploitation` (schéma de la topologie, message de démarrage). Minimum inchangé, Node 22.13 (D18.INV-1). Entrée : agent-tdd-jira 1.3.4. Archive 1.3.0.
  - **agent2dev 1.1.3** : correctif. Node 26.13.0 recommandé, à la place de Node 24 : manifeste, règles globales, module `exploitation` (schéma, message de démarrage, prérequis du guide) ; minimum inchangé, Node 22.13. Méthode : agent-tdd-jira 1.3.4 ; binôme : agent2test 1.3.1 ; exemples du journal à la version 1.1.3. Archive 1.1.2.
  - **agent-tdd-jira 1.3.4** : correctif. Référence à agent2test 1.3.1 ; `lire-acceptation.mjs` inchangé. Archive 1.3.3.
  - **orchestrateur-c7e 3.5.3** : correctif. Référence à agent-tdd-jira 1.3.4. Archive 3.5.2.
  - Aucune dimension ni aucun invariant modifié. Les quatre spécifications se référencent et se publient dans un même commit (`EVOLUTION.md`, section 7) ; les transmissions agent2test 1.3.0, agent-tdd-jira 1.3.3, agent2dev 1.1.2 et orchestrateur-c7e 3.5.2, publiées, restent telles quelles.
- Intégration continue : chaque matrice de Node garde ses versions et ajoute 26.13.0, sous Linux et sous Windows (vérificateur, installateur, recettes de skill4appli, de sonarqube, de capture-sprint-jira et d'explication-hote-ia) ; le contrat de Gemini CLI se vérifie sous Node 26.13.0, à la place de Node 24. skill4appli (Node 22 et 24) et capture-sprint-jira (Node 20 et 22) énoncent des versions qui restent vérifiées : leurs spécifications ne changent pas.
- Modes d'emploi d'Agent2Test et d'Agent2Dev : Node 26.13.0 recommandé ; modes d'emploi de l'agent TDD et de l'orchestrateur à leur nouvelle version.
- Entrées du 2026-11-06 : décisions ratifiées par les pull requests n° 40 (agent2test 1.3.0) et n° 41 (explication-hote-ia 1.0.0).
- Vérifications sous Node 26.13.0 (SQLite 3.54.0 intégré), avant les montées :
  - vérificateur : 13 spécifications, transmissions fidèles ; recette de l'installateur : 17 tests ; contrat de Gemini CLI 0.66.0 tenu ;
  - recettes rejouées comme dans les workflows, transmission matérialisée puis extraite : skill4appli 1.1.1, 34 tests ; sonarqube 1.1.0, 26 tests, et 5 sautés dans la recette réelle, sans serveur SonarQube ; capture-sprint-jira 1.2.2 sous xvfb avec Chrome, 20 scénarios, 132 contrôles ; explication-hote-ia 1.0.0, 28 tests ;
  - implémentation de référence du constat d'agent2test, hors dépôt : 18 tests en monde simulé ; exemple TAB-1 et treize contre-épreuves, 136 contrôles, aucun écart ;
  - `node:sqlite` : FTS5 et le tokeniseur `trigram` avec `remove_diacritics` disponibles ; `setAuthorizer` présent, il refuse à la préparation une instruction qui touche la table d'un autre espace : le scénario BD12 d'agent2test s'exécute ;
  - seul changement de comportement relevé : depuis Node 23, `node --test` écrit au format spec même quand sa sortie est redirigée ; les recettes du dépôt demandent le format TAP ou ont leur propre lanceur, et n'en dépendent pas ;
  - après les montées : vérificateur, glossaire, quatre transmissions (aller-retour identique) et README à jour.
- Décisions ratifiées (pull request n° 42) :
  - Node 26.13.0 recommandé pour Agent2Test et Agent2Dev, le minimum restant Node 22.13 ;
  - la version exacte 26.13.0 dans les workflows, plutôt que la dernière version 26 ;
  - l'ajout de 26.13.0 aux matrices, sans en retirer de version.

### 2026-11-06 : explication-hote-ia 1.0.0

- **explication-hote-ia 1.0.0**, nouvelle spécification, à la demande du développeur : « un skill pour un agent qui explique le fonctionnement de l'IA dans laquelle on l'exécute, comme par exemple Gemini CLI ».
  - L'agent explique l'outil d'IA qui l'exécute : Gemini CLI, ou un hôte non reconnu décrit par ce qui s'en observe, sans être nommé. Trois modes : expliquer, carte et pourquoi. Sous-agent `explicateur-hote` ; commandes `/hote:explique`, `/hote:carte` et `/hote:pourquoi`.
  - Chaque affirmation sur l'hôte porte sa provenance : `[observé]`, `[déclaré]`, `[documenté]`, `[déduit]` ou `[inconnu]`. L'agent ne tire de sa propre impression ni son modèle, ni sa version, ni ses limites. Il nomme ses angles morts. La documentation embarquée de la version installée fait foi.
  - Script `instantane-hote.mjs` : Node 20, sans dépendance, lecture seule ; il ne rend ni valeur secrète ni texte de conversation. Commandes `hote`, `config`, `contexte`, `composants`, `doc` et `tout`.
  - Repères H1 à H17 vérifiés sur Gemini CLI 0.67.0, et dix écarts entre sa documentation et son code.
  - Dimensions D1 à D9 actives ; D10 (autres hôtes reconnus) et D11 (comparaison de deux instantanés) réservées. Points d'extension E1 et E2 ; trente invariants.
- Constats sur Gemini CLI 0.67.0, utiles pour le poste :
  - réglé par défaut, Gemini CLI envoie des statistiques d'usage à `play.googleapis.com`, même en mode non interactif, et cherche une mise à jour sur `registry.npmjs.org` en mode interactif, même quand l'API du modèle est locale. `privacy.usageStatisticsEnabled`, `general.enableAutoUpdate` et `general.enableAutoUpdateNotification` à `false` coupent ces deux sorties ;
  - `CI` ou `GITHUB_ACTIONS` à `true` mettent Gemini CLI en mode non interactif, même sous un terminal ;
  - au lancement suivant, une session dont aucun tour n'a abouti est supprimée, malgré `minRetention`.
- Vérifications :
  - recette de 28 tests réussie sous Node 20 et Node 22, sous Linux, avec et sans les variables de l'intégration continue ;
  - 23 défauts réintroduits un à un, tous attrapés par la recette ;
  - recette des repères : 29 constats tenus contre `@google/gemini-cli` 0.67.0. Les sorties de l'hôte passent par un proxy témoin qui les refuse, et `strace` ne relève aucune connexion hors de la boucle locale ;
  - installation par `tools/installer.mjs`, dans le workspace et au niveau utilisateur, et retrait ; extraction des six fichiers conforme aux empreintes ;
  - vérificateur, glossaire, transmission, recette de l'installateur (17 tests) et contrat avec Gemini CLI à jour.
- Outillage : le workflow `recette-explication-hote-ia.yml` lance la recette sous Linux et Windows, avec Node 20 et 24, et les repères contre Gemini CLI 0.67.0 ; script `.github/scripts/reperes-hote.mjs`.
- `docs/explication-hote-ia/mode-emploi.md` : installation, trois modes, lecture des étiquettes, ce qui sort du poste, dépannage.
- Décisions ratifiées (pull request n° 41) :
  - Gemini CLI comme seul hôte nommé ; tout autre hôte est décrit par ce qui s'en observe ;
  - une installation au niveau utilisateur par défaut ;
  - un explicateur en lecture seule : une modification se décrit, et ne s'applique que sur demande explicite, hors du rôle d'explicateur ;
  - des listes fermées de réglages et de variables observés ;
  - les repères confrontés en CI au Gemini CLI réel, à une version épinglée.


### 2026-11-06 : agent2test 1.3.0, agent-tdd-jira 1.3.3, agent2dev 1.1.2, orchestrateur-c7e 3.5.2

- **agent2test 1.3.0** : dimension D25 active, le constat perceptif, dans le module `navigateur`, à la demande du développeur : « démontrer que Playwright prend bien le rôle d'une personne qui navigue vers une page, l'observe et rend compte de ce qu'elle voit ou ne voit pas ».
  - Trois canaux : la vue (boîtes de `ariaSnapshotJSON({ boxes: true })` et capture de la zone), le lecteur d'écran (rôles, noms accessibles, ordre de lecture), le clavier (arrêts de la touche Tab). Ni sélecteur sur la structure, ni attribut, ni texte du DOM, ni code exécuté dans la page n'établit un constat.
  - Attendus perceptifs de l'étape `verifier` : `position` et `absence` d'un élément à un bord d'une zone, `chaqueCellule` d'une colonne (lien, nom accessible, atteinte au clavier, pictogramme), `titre` d'un tableau ; canaux et comparaison déclarés.
  - Absence constatée seulement dans une portée vue ; « chaque » refusé sur un ensemble vide ; comparaison de texte déclarée, exacte pour « seulement » ; pictogramme reconnu par ressemblance à une référence ratifiée en CP-2 avec le profil, seuil `vision.seuil` (0,80, entre 0,70 et 0,95) ; constat « vu » confirmé par un second regard ; une étape `verifier` échouée n'arrête plus les `verifier` suivantes.
  - Témoignage de chaque étape `verifier`, réussie ou non : portée, canaux, règle de comparaison, vu, non vu, remarques, preuves. Il est versé au résultat d'étape et au journal de tests, qui garde son format `agent2test.journal-de-tests/1` avec le champ ajouté `scenarios[].etapes[].temoignage`. Chaque constat se recalcule depuis ses preuves, perception JSON scellée comprise.
  - Modules : `navigateur` ; `preparateur` (champ `references.pictogrammes` du profil, contrôles `parcours.comparaison-declaree`, `parcours.reference-ratifiee` et `parcours.canaux`) ; `verdict` (signaux du constat dans les causes) ; `journal` (témoignage) ; `referentiel` (règle `vision.seuil`) ; `tableau-de-bord` (CP-2 et CP-3). Aucune dépendance nouvelle : la ressemblance lit les PNG avec `node:zlib`.
  - D25.INV-1 à D25.INV-8 ; scénarios NA15 à NA23, PR14 à PR16, VE10 à VE12, JO12 et RF9. Exemple TAB-1 et treize contre-épreuves dans l'application de démonstration. 21 modules, 116 invariants définis, dont 103 en vigueur, 198 scénarios de test. Entrée : agent-tdd-jira 1.3.3. Archive 1.2.0.
- **agent-tdd-jira 1.3.3** : correctif. Référence à agent2test 1.3.0 ; le module `binome-agent2test` reproduit un défaut confirmé aussi d'après le témoignage de l'étape (`agent2test:D25.INV-7`). Aucune dimension ni aucun invariant modifié ; `lire-acceptation.mjs` inchangé. Archive 1.3.2.
- **agent2dev 1.1.2** : correctif. Méthode : agent-tdd-jira 1.3.3, seule version prise en charge ; binôme : agent2test 1.3.0 ; exemples du journal à la version 1.1.2. Aucune dimension ni aucun invariant modifié. Archive 1.1.1.
- **orchestrateur-c7e 3.5.2** : correctif. Référence à agent-tdd-jira 1.3.3 ; conventions Git et numérotation des critères inchangées. Archive 3.5.1.
- Les quatre spécifications se référencent et se publient dans un même commit (`EVOLUTION.md`, section 7). Les transmissions agent2test 1.2.0, agent-tdd-jira 1.3.2, agent2dev 1.1.1 et orchestrateur-c7e 3.5.1, publiées, restent telles quelles.
- `docs/agent2test/mode-emploi.md` : version 1.3.0, ce que le navigateur constate, références de pictogrammes en CP-2, témoignage en CP-3, trois cas de dépannage. Modes d'emploi d'agent-tdd-jira, d'Agent2Dev et de l'orchestrateur à leur nouvelle version.
- Vérifications :
  - implémentation de référence du constat, hors dépôt (Node 22, Playwright 1.63, Chrome) : la page de l'exemple TAB-1 et treize contre-épreuves, 136 contrôles, aucun écart ; 18 tests en monde simulé ; chaque constat recalculé à l'identique depuis ses preuves, et une capture altérée refusée ;
  - dix défauts réintroduits un à un (absence sans ancre, ordre de l'arbre pris pour l'ordre vu, sous-chaîne, constat sans second regard, « chaque » sur un ensemble vide, liens homonymes confondus, arrêts du clavier repérés sans position, seuil de ressemblance à 0,40, lien sans nom accepté, stabilité sensible au texte) : chacun fait échouer un test ou la recette. Retirer tout le contrôle de stabilité d'un regard n'est pas détecté : le second regard rattrape les pages qui bougent ;
  - des contrôles naïfs sur le DOM se trompent sur quatre contre-épreuves (`dir="rtl"`, page sans tableau, « REE 2026 », titre affiché mais non associé), que le navigateur juge correctement ;
  - ressemblance de l'œil dessiné de 16 à 64 px, en bleu, noir ou rouge, à sa référence de 48 px : de 0,88 à 0,95 ; œil barré : de 0,46 à 0,54 ;
  - vérificateur, glossaire, quatre transmissions (aller-retour identique) et README à jour.
- Décisions ratifiées (pull request n° 40) :
  - les trois canaux et leur source, et la règle « rien d'autre n'établit un constat » ;
  - « gauche » et « droite » pris comme bords à l'écran, l'ordre de lecture rapporté en remarque sans décider ;
  - la reconnaissance d'un pictogramme par ressemblance à une référence ratifiée avec le profil, au seuil de 0,80 ;
  - « non constatable » plutôt qu'« absent » quand l'ancre n'est pas vue, et « non vérifié » pour « chaque » sur un ensemble vide ;
  - une étape `verifier` échouée qui n'arrête plus les suivantes ;
  - le champ `temoignage` ajouté sans changer le nom du format du journal de tests.

### 2026-11-02 : orchestrateur-c7e 3.5.1, agent2dev 1.1.1, skill4appli 1.1.1, capture-sprint-jira 1.2.2

- Correctifs, à la demande du développeur : les mentions d'outils d'IA autres que Gemini sont retirées de tout ce que l'IA locale lit, pour que Gemini CLI ne reçoive que des consignes qui le concernent. Aucune transmission courante n'en contient plus ; les archives et les transmissions publiées restent telles quelles.
  - **orchestrateur-c7e 3.5.1** : cible du manifeste « Gemini CLI ou équivalent » ; le § 11.4 décrit tout autre outil sans le nommer.
  - **agent2dev 1.1.1** : dans la filiation, les moteurs d'un fournisseur commercial sont désignés sans leur nom ; exemples du journal à la version 1.1.1.
  - **skill4appli 1.1.1** : l'agent `memoire-appli` s'installe comme sous-agent d'un outil qui en accepte, ou comme consigne système, Gemini CLI compris ; le script et l'agent portent la version ; nouvelles empreintes.
  - **capture-sprint-jira 1.2.2** : l'agent `capteur-sprint` s'installe dans Gemini CLI par GeminiBoard, comme sous-agent d'un autre outil, ou comme consigne système ; `package.json`, `package-lock.json` et l'agent portent la version ; nouvelles empreintes.
- Modes d'emploi : les prérequis disent « Gemini CLI ou équivalent ».
- Vérifications : recette de skill4appli 1.1.1, 34 tests réussis ; recette de capture-sprint-jira 1.2.2 sous xvfb avec Chrome, 132 contrôles réussis ; extractions conformes aux nouvelles empreintes ; vérificateur, glossaire, transmissions et recette de l'installateur à jour.
- Constat qui a motivé la demande : les quatre transmissions refusées par l'installateur sur le poste du développeur (« empreinte fausse ») étaient exactement celles dont un fichier mentionnait un autre outil ; le zip publié était intact.

### 2026-11-01 : orchestrateur-c7e 3.5.0

- **orchestrateur-c7e 3.5.0** : composition de méso-contrats, à la demande du développeur : « Il peut y avoir plusieurs méso-contrats. »
  - Un ticket engage un méso-contrat principal, celui qui porte le plus de possibilités de sa demande parmi ceux dont les couches requises et les possibilités requises sont remplies, et, si le principal ne porte pas tout, des compléments, en plus petit nombre, chacun justifié par une possibilité que le principal ne porte pas (D11.INV-6). Une égalité devient une question ; une possibilité que rien ne porte est signalée.
  - L'union l'emporte : une couche à l'impact `aucun` dans un méso-contrat peut être couverte par un autre du ticket. Chaque option est rattachée au méso-contrat qui la permet, le principal par défaut, sinon celui que nomme sa clé `meso_contrat`.
  - Point d'extension E5. Modèle du référentiel 3.3.0 : règle de choix et règles de validation réécrites, quatorze règles ; `complements` dans `ticket.toml` ; troisième exemple, `ABCDE-3655`, M04 avec le complément M01 pour une règle d'habilitation.
  - Qualification : gabarit de la composition, composition imposée par `/c7e ABCDE-3655 M04 M01`, trois exemples nouveaux. Fiche : méso-contrats et rattachement des options.
  - D10.INV-1, D10.INV-2, D11.INV-3 et D11.INV-4 remplacés pour la composition, identiques pour un ticket à un seul méso-contrat ; D11.INV-6 ; trente-trois invariants. Scénarios R21 et R22 ; R13 revu.
- Vérifications :
  - le modèle se lit en TOML et la commande d'extraction redonne sa nouvelle empreinte ;
  - les trois exemples d'instance respectent les quatorze règles, et sept écarts volontaires dans la composition sont tous rejetés ;
  - la règle de choix redonne, sans complément, le même méso-contrat qu'en 3.4.0 pour les douze demandes types à un seul méso-contrat, et compose ou signale correctement cinq demandes nouvelles ;
  - vérificateur, glossaire, transmission et recette de l'installateur à jour.
- `docs/orchestrateur-c7e/mode-emploi.md` : version 3.5.0, composition dans la qualification, la commande, les options et le dépannage.
- Décisions ratifiées :
  - une composition par ticket plutôt qu'un choix entre méso-contrats ;
  - un principal et des compléments plutôt qu'une couverture sans hiérarchie ;
  - l'union des empreintes, chaque option rattachée au méso-contrat qui la permet.

### 2026-11-01 : orchestrateur-c7e 3.4.0 et socle-back-front 1.1.0

- **orchestrateur-c7e 3.4.0** : catégorie M04, variante de représentation d'une ressource, deuxième exemple de méso-contrat donné par le développeur après le CRUD en base, son endpoint Java et sa lecture depuis le front : « Trouver le endpoint d'une URI avec le type de donnée ; sa composition contient un champ avec une liste ou un record. Réaliser une variante de ce type avec ce champ en moins. Réaliser une variante avec la même URI où ce champ ne sera pas intégré ; les informations le concernant seront uniquement la date et l'heure du dernier enregistrement. » Complément : le champ, une liste de records appelée au travers d'une URI existante, est mis à jour en temps réel.
  - M04, `VARIANTE_REPRESENTATION` : backend requis, persistance et frontend optionnels ; aucune catégorie existante ne convenait.
  - Option `representations` (slot É3) : repérage depuis l'URI (opération, contrôleur, type de réponse, champ, URI existante du champ, entité, colonne de date-heure), variante sans champ, variante résumée à la même URI dont la date-heure se calcule en base sans charger les éléments ; huit preuves.
  - Option `evenements` (slot É3) : la liste, à son URI existante, et la date-heure du résumé tenues à jour par WebSocket STOMP selon le socle 1.1.0 ; chaque événement porte la date-heure recalculée, suppressions comprises ; courtier `simple` ou `relais`, nommé dans le fichier d'invariants du projet ; sept preuves.
  - Point d'extension E4 : paramètres d'option au choix par ticket (mécanisme de sélection `parametre_vue`, `negociation_contenu` ou `remplacement` ; exposition de la variante sans champ `base`, `meme_uri` ou `uri_propre` ; mécanisme et courtier des événements) ; possibilités requises d'un méso-contrat, prises en compte par la règle de choix.
  - Modèle du référentiel 3.2.0 : possibilités `variante_representation` et `temps_reel`, `lecture` étendue aux projections et agrégats, dix-sept possibilités ; trois règles de validation de plus, quinze en tout ; T01 couvre les événements temps réel ; second exemple d'instance, `ABCDE-3620`.
  - Fichier d'invariants du projet : section « Événements temps réel (SC7) », courtier à adapter ; gate É3 étendue au contrat AsyncAPI.
  - Invariant D10.INV-6 : réponse actuelle inchangée sans sélection, champ absent et non `null`, date-heure au format Instant du socle, remplacement refusé pour une version d'API publiée. Trente-deux invariants. Scénarios R19, temps réel compris, et R20.
- **socle-back-front 1.1.0** : dimension SC7 active, les événements temps réel vers le front. WebSocket et STOMP 1.2 ; contrat AsyncAPI 3.0 dont les schémas renvoient au contrat OpenAPI ; enveloppe CloudEvents 1.0 avec `sequence` et `traceparent` ; publication après commit ; reprise par instantané REST dont l'`ETag` est la dernière séquence ; connexion `wss://` à origines explicites, jeton dans la trame `CONNECT` et jamais dans l'URL, droit de lecture vérifié à chaque abonnement ; erreurs en Problem Details dans une trame `ERROR` ; annonce `aria-live`. SSE, messages entre services et commandes du client restent réservés. Invariants SC7.INV-1 à SC7.INV-6. Épinglé par `orchestrateur-c7e` 3.4.0 ; les autres skills gardent la 1.0.1, archivée.
- Outils : `bundle.mjs` et `verifier.mjs` prennent un fichier partagé à sa version épinglée, courante ou archivée dans les `previousVersions` de sa source ; une évolution du socle n'oblige plus tous les skills à monter ensemble, chacun décide (EVOLUTION.md, section 8).
- Vérifications :
  - le modèle se lit en TOML et la commande d'extraction redonne sa nouvelle empreinte ;
  - les deux exemples d'instance respectent les quinze règles, et dix écarts volontaires dans l'exemple M04 sont tous rejetés ;
  - la règle de choix retient les mêmes catégories qu'en 3.3.0 pour les six demandes types de la 3.3.0, M04 pour six variantes de représentation, et aucune pour le temps réel sans variante ;
  - les transmissions publiées des skills qui gardent le socle 1.0.1 restent fidèles ;
  - vérificateur, glossaire, transmission et recette de l'installateur à jour.
- `docs/orchestrateur-c7e/mode-emploi.md` : version 3.4.0, options `representations` et `evenements`, trois cas de dépannage.
- Décisions ratifiées :
  - une catégorie nouvelle, M04, plutôt qu'un élargissement de M01 ;
  - le mécanisme de sélection à la même URI et l'exposition de la variante sans champ au choix par ticket ;
  - en temps réel, la liste et la date-heure du résumé, par WebSocket STOMP ;
  - l'activation de SC7 dans le socle plutôt qu'un écart par ticket ;
  - une version mineure, pour le point d'extension E4.

### 2026-11-01 : modes d'emploi de toutes les spécifications

- Un mode d'emploi par spécification transmissible qui n'en avait pas, dans `docs/<nom>/mode-emploi.md` : `java`, `angular`, `analyse-projet`, `sonarqube`, `agent-tdd-jira`, `agent2test`, `agent2dev`, `agents-paralleles-gitlab`, `skill4appli`, `capture-sprint-jira`, `tension-dashboard-gitlab-agent`. Chacun suit le même plan : à quoi sert la spécification, prérequis, installation (installateur, transmission collée, ou construction dans `spec/` pour les systèmes à construire), cadrage ou démarrage, usage et points de validation, règles qui ne se négocient pas, mise à jour, dépannage, avec un schéma Mermaid.
- `socle-back-front`, qui ne se transmet qu'inclus dans les experts, n'a pas de mode d'emploi propre.
- Aucune spécification modifiée : versions, transmissions et glossaire inchangés.

### 2026-11-01 : sonarqube 1.1.0

- **sonarqube 1.1.0** : dimensions D9 et D10 actives, l'examen local avant GitLab et son interface de pilotage, à la demande du développeur. Cinquième mission, « Examiner en local » : le code est examiné avant son envoi sur GitLab, selon les règles du profil qualité du projet sur l'instance, en accédant à SonarQube par le jeton du compte Sonar.
  - Module `examen-local` : périmètre réduit au diff entre `HEAD` et la base de fusion avec la branche cible lue sur le dépôt distant ; trois moteurs au choix, que le développeur combine :
    - **analyse éphémère** : scanner Maven ou npm lancé en local sous une branche de travail `local-<login>-<HEAD>`, nouveau code défini par la branche cible, quality gate et constats lus sur cette branche, puis branche supprimée ; analyse et suppression forment un seul lot validé ;
    - **moteur SonarLint** : analyseurs de SonarQube for IDE en mode connecté, avec les règles du profil, pilotés par l'outil `analyze_file_list` du serveur MCP de Sonar, sans envoi du code ; `analyze_code_snippet`, déprécié, seulement en repli signalé ;
    - **relecture par les règles** : relecture du diff contre les règles actives du profil, lues par l'API et gardées en cache tant que le profil n'a pas changé ; constats étiquetés avec un niveau de confiance, jamais comptés comme des issues.
  - Catalogue d'appels (point E1) : règles actives d'un profil, analyse sous une branche de travail, suppression d'une branche, outil MCP admis ; le reste de D7 demeure réservé.
  - Rapport : mission « Examiner en local », constats par moteur.
  - Modes de connexion au choix, retenus au cadrage (module `cadrage-acces`, § 3 bis) : API web par en-tête `Bearer` ou par jeton en nom d'utilisateur, scanner, SonarQube for IDE par le serveur MCP autonome, serveur MCP hébergé par l'instance (relevé, sans usage tant que D7 est réservée), SonarQube CLI ; chacun avec ses usages admis et sa variable de jeton ; invariant D1.INV-5.
  - Dimension D10 active, l'interface de pilotage : module `pilotage`, script Node sans dépendance `outils/pilote-sonar.mjs` servi sur `127.0.0.1` avec une clé de session (connexion, périmètre, règles, analyse éphémère par lot validé, dossier de relecture, commande MCP, constats, journal sans jeton) recette simulée de vingt-six scénarios contre un faux SonarQube (back Java, front TypeScript dans `web/`, faux `mvn` et `npx`) et recette réelle de cinq scénarios contre l'instance du développeur, sur un projet réservé, tirés du module par une commande à empreintes ; workflow `recette-sonarqube.yml`, Linux et Windows, Node 20 et 22, et travail de recette réelle activé par la variable `RECETTE_SONAR_ACTIVE`. Invariants D10.INV-1 à D10.INV-4.
  - Tests du projet passés par SonarQube : ils tournent avant chaque analyse éphémère (JUnit et JaCoCo dans `mvn verify`, échecs importés ; `ng test` avec couverture LCOV côté front), et tests, échecs, ignorés et couverture sont lus sur la branche de travail ; l'instance est lue même quand le gate fait sortir le scanner en erreur. Invariant D9.INV-7. Dossier du projet pour un monodépôt back et front.
  - Export CSV des règles de l'instance pour les langages du projet, actives ou non dans son profil (écran 3 du pilote, scénario P26). Recette réelle : le fichier soumis enfreint trois règles actives de Sonar way pour JavaScript (`S3504`, `S1481`, `S1186`) au lieu de `S1525`, dépréciée.
  - `docs/sonarqube/` : tables des règles Java (780) et JavaScript / TypeScript (583), tirées des métadonnées de `sonar-java` et `SonarJS` du 30 octobre 2026, avec type, qualité et gravité, statut, présence dans Sonar way et Sonar agentic AI par langage ; script de régénération `generer-regles.mjs` ; liste des 31 scénarios de recette du pilote par langage.
  - Trente-quatre invariants. Archive : `archives/SKILL-v1.0.2.md`.
- Décisions ratifiées :
  - les trois moteurs, au choix du développeur, plutôt qu'un seul ;
  - le périmètre limité au diff avec la branche cible ;
  - un examen lancé à la demande, sans hook `pre-push` ;
  - une livraison par pull request ;
  - les modes de connexion en option, chacun borné à ses usages, le serveur MCP hébergé relevé mais sans usage tant que D7 est réservée ;
  - une interface de pilotage locale, intégrée à la 1.1.0 encore non publiée plutôt qu'en 1.2.0 ;
  - les tests du projet passés par SonarQube avant chaque analyse éphémère, et une recette réelle contre l'instance du développeur, en plus de la recette simulée.

### 2026-11-01 : orchestrateur-c7e 3.3.0

- **orchestrateur-c7e 3.3.0** : dimension D11 active, la qualification de la demande, à la demande du développeur. À l'ouverture d'un ticket, la première chose à faire est de trouver son méso-contrat, avec un modèle générique de la demande, à partir du contenu du ticket, en posant des questions complémentaires si besoin. Le modèle est une combinaison de possibilités, fondées sur les modifications de l'application construite sur la pile PostgreSQL, Java et Angular, établies à son analyse.
  - Module `qualification` : la demande du ticket est rangée dans le modèle, chaque réponse avec sa source ; les possibilités inconnues qui changeraient le méso-contrat ou ses options deviennent des questions, posées ensemble ; le méso-contrat retenu par la règle de choix est confirmé par le développeur avant la lecture du code, l'analyse et la fiche ; gabarit de présentation ; méso-contrat imposé par `/c7e` ; deux exemples.
  - Modèle du référentiel 3.1.0, section 0, `[modele_demande]` : quinze possibilités de modification pour la pile, chacune avec sa couche, son option et ses repères (PostgreSQL : table, colonne, index, contrainte, lecture, écriture ; Java : endpoint nouveau ou modifié, règle, service ; Angular : écran nouveau ou modifié, formulaire, comportement, navigation), l'intention, la maquette et la règle de choix ; quatre règles de validation de plus ; nouvelle empreinte.
  - À l'installation, l'IA confronte ces possibilités à l'analyse de l'application et propose celles à retenir, avec leurs repères, à retirer et à ajouter ; le développeur les écrit.
  - `ticket.toml` : section `[ticket.demande]`, qui remplace `[ticket.specifications_metier]` du modèle remis en 2.0.0, et `meso_contrat_confirme`.
  - § 3 : trois temps, qualification, analyse, transformation, et deux réponses du développeur ; § 10, § 11 et la consigne suivent. Menu de démarrage et commande `/c7e` : qualification d'abord.
  - Invariants D11.INV-1 à D11.INV-5 ; D10.INV-1 renforcé, le méso-contrat étant confirmé dès la qualification ; trente et un invariants. Scénarios R16 à R18 ; R13 revient à la qualification.
- Vérifications :
  - le modèle du référentiel se lit en TOML, ses quinze possibilités n'engagent que des couches et des options du catalogue, et la commande d'extraction redonne sa nouvelle empreinte ;
  - l'exemple d'instance respecte les douze règles de validation, et quatorze écarts introduits volontairement sont tous rejetés ;
  - la règle de choix retient M01 pour le ticket fil rouge et pour un écran de saisie nouveau avec sa table et son API, M02 pour un index seul, M03 pour un libellé d'écran, et M03 ou M01 pour une date à afficher, selon qu'elle est déjà exposée ou non ;
  - installé par `tools/installer.mjs`, le skill est découvert une fois par Gemini CLI, le module `qualification` n'y devient pas un skill, et tous ses fichiers sont lisibles ;
  - vérificateur, glossaire et transmission à jour.
- `docs/orchestrateur-c7e/mode-emploi.md` : version 3.3.0, qualification à l'ouverture du ticket dans l'introduction, le schéma, le menu, la commande, l'usage quotidien et le dépannage ; adaptation des possibilités à l'application.
- Décisions ratifiées (pull request n° 32) :
  - une dimension nouvelle, D11, et donc une version mineure, plutôt qu'un ajout à D10 ;
  - les quinze possibilités de modification proposées pour la pile, leurs options et leurs repères, et la règle de choix ;
  - la confrontation des possibilités à l'analyse de l'application à l'installation, l'IA proposant et le développeur écrivant ;
  - une confirmation du méso-contrat à part, avant toute analyse du code, en plus de la validation de la fiche ;
  - des questions limitées aux possibilités inconnues qui changeraient le méso-contrat ou ses options ;
  - `[ticket.demande]` à la place de `[ticket.specifications_metier]` ;
  - un méso-contrat imposé par `/c7e` qui vaut confirmation s'il couvre la demande remplie ;
  - le modèle du skill pris par défaut, et signalé, quand le référentiel du projet n'a pas encore de section `[modele_demande]`.

### 2026-11-01 : orchestrateur-c7e 3.2.1

- **orchestrateur-c7e 3.2.1** : correctif de l'installation. Masqué à Git par la seule exclusion `.git/info/exclude` d'un clone ordinaire, comme le prévoyait la 3.2.0, le skill ne livrait que son `SKILL.md` à l'activation : l'outil de lecture de Gemini CLI refuse les fichiers ainsi exclus, et les modules restaient illisibles.
  - § 11.3 et étape 0 de la consigne : exclusion du dossier du skill et de `/.geminiignore`, et une négation par niveau de dossier dans `.geminiignore` (`!/.gemini/`, `!/.gemini/skills/`, `!/.gemini/skills/orchestrateur-c7e/`, ou `!/.skills/` et `!/.skills/orchestrateur-c7e/` en chargement permanent).
  - L'installateur du dépôt, `tools/installer.mjs`, fait la matérialisation et le masquage ; l'étape 0 de la consigne le reconnaît et se limite alors à vérifier `integrite.sha256`.
  - § 11.4 : l'activation livre le `SKILL.md` et la liste des fichiers du skill, que l'IA lit ensuite ; les skills du workspace ne se chargent que dans un dossier de confiance, quand la confiance des dossiers est activée.
  - Scénario R15 : un skill installé dans un clone ordinaire est absent de `git status`, et ses fichiers se lisent après l'activation. Invariants inchangés.
- Vérifications : comportement de Gemini CLI lu dans son code et reproduit avec `@google/gemini-cli-core` 0.66.0, en chargement au choix et en chargement permanent, y compris quand `/.gemini/skills/` ou `/.skills/` était déjà exclu ; vérificateur, glossaire et transmission à jour.
- `docs/orchestrateur-c7e/mode-emploi.md` : version 3.2.1, renvoi au § 11.3 ; la note sur l'écart entre la spécification et le mode d'emploi est retirée.
- Décisions ratifiées (pull request n° 29) :
  - un correctif (3.2.1) plutôt qu'une version mineure : aucune dimension, aucun point d'extension, aucun invariant ne change ;
  - la spécification qui renvoie à l'installateur du dépôt Agent2Prompt, à côté de la matérialisation par l'IA.

### 2026-10-31 : orchestrateur-c7e 3.2.0

- **orchestrateur-c7e 3.2.0** : le référentiel des méso-contrats remis par le développeur, en TOML, intégré à l'orchestrateur comme dimension D10, active.
  - Module `referentiel` : rôle, emplacements, étapes à l'analyse de chaque ticket, correspondance des options avec les slots, modèle du référentiel à installer dans le projet (`docs/c7e/referentiel-meso-contrats.toml`) avec son empreinte et sa commande d'extraction, exemple de `ticket.toml`.
  - Options au choix par couche : évolution de schéma et contrat CRUD (PostgreSQL) ; règles, fonctionnalités et endpoints (Java) ; éléments graphiques et fonctionnalités (Angular) ; analyse d'une image PNG de l'objectif pour toute option front. Chaque option nomme son slot et les preuves qu'elle apporte aux tests déduits.
  - Catégories M01 à M03 reprises du modèle remis ; méso-contrats transverses T01 à T03 (socle back-front, accessibilité, migration sûre), appliqués d'office ; règles de validation d'un ticket.
  - Démarrage au choix du développeur : chargement permanent ou au choix, menu, commande `/c7e` ; description du skill corrigée en conséquence.
  - Invariants D2.INV-3 et D10.INV-1 à D10.INV-5, soit vingt-six ; scénarios R11 à R14.
  - Archives : `SKILL-v3.1.0.md` ; modèle remis, `referentiel-meso-contrats-v2.0.0.toml`. La section 16 du point d'entrée donne chaque changement apporté au modèle et sa raison.
- Mode d'emploi (`docs/orchestrateur-c7e/mode-emploi.md`) aligné :
  - les « modèles méso » sont les catégories du référentiel, et non des fichiers d'invariants par périmètre ;
  - un menu à deux choix et une commande `/c7e` unique, au lieu d'une commande par modèle ;
  - des chargements nommés « permanent » et « au choix », pour ne pas les confondre avec les modes de modulation A, B et C.
- Vérifications :
  - le modèle et le modèle remis se lisent en TOML ;
  - la commande d'extraction, rejouée dans un projet factice, redonne le fichier et son empreinte ;
  - l'exemple d'instance respecte les huit règles de validation, et huit écarts introduits volontairement sont tous rejetés ;
  - vérificateur, glossaire et transmission, à huit fichiers, à jour.
- Décisions ratifiées (pull request n° 25) :
  - le référentiel intégré comme dimension D10 de l'orchestrateur, avec un modèle à installer dans `docs/c7e/` et une instance `ticket.toml` par ticket ;
  - l'option « évolution de schéma », ajoutée au contrat CRUD demandé ;
  - les méso-contrats transverses T01 à T03, appliqués d'office ;
  - le démarrage au choix du développeur (D2.INV-3) et la commande `/c7e` unique ;
  - dans le mode d'emploi, les catégories du référentiel à la place des modèles méso par fichier (`docs/c7e/meso/`) ;
  - le modèle remis, archivé dans `previousVersions` sous sa propre version, 2.0.0.

### 2026-10-31 : orchestrateur-c7e 3.1.0

- **orchestrateur-c7e 3.1.0** : l'orchestrateur fractal C7E et son fichier d'invariants du projet, remis par le développeur en 3.0.0 pour être chargés au lancement de l'IA locale, corrigés et mis au format du dépôt.
  - `SKILL.md` garde toute la méthode en un fichier, avec la structure de la 3.0.0 : cycle 7E, profondeurs du CRI, concepts, matrice, pipeline, Git, gates et tests, second ordre, modes, registre, valeur, anti-patterns, fiche. `meso-contrats.md` en est le module D8.
  - Dimensions D1 à D8 actives, D9 (campagne de mesure de la valeur) réservée ; vingt invariants, dix scénarios de recette, points d'extension E1 à E3.
  - Socle back-front 1.0.1 inclus ; experts `java` 1.1.1 et `angular` 1.0.1 inclus comme référentiels ; `agents-paralleles-gitlab` 1.0.1 et `agent-tdd-jira` 1.3.2 référencés pour leurs conventions Git et la numérotation des critères.
  - Les deux fichiers de la 3.0.0 sont archivés tels quels ; la section 16 du point d'entrée donne chaque correction et sa raison.
- Corrections principales :
  - **Git** : la branche par slot `feature/7e-e<SLOT>-…` et le message `[É<SLOT>-<DOMAINE>] …`, rejoués avec les hooks du kit, sont refusés par `pre-commit` et `commit-msg`. Désormais une branche par ticket `<type>/<CLÉ>-<slug>`, des commits `<CLÉ> : [É<n>-<DOMAINE>] <type>(<portée>): …`, et aucun push, fusion ni tag par l'IA. Le tag `release/vX.Y.Z`, ambigu à côté d'une branche `release/*`, devient la convention du projet.
  - **Axiome 7E** : le tableau des slots nommait É0 « Environnement (hors-axiome) », É6 « Évaluation » et É7 « Évolution ». Les numéros et les fonctions sont gardés, les noms rendus à l'axiome : É0 Outillage, É6 Évolutif, É7 Environnement.
  - **Méthode** :
    - une analyse et une fiche validées avant toute modification, puis une gate contrats avant tout code ;
    - des tests déduits avant le code, et aucun test existant supprimé ;
    - le commit de rétroaction rangé au premier ordre, le second ordre étant une entrée `proposed` du registre ;
    - des poids déclarés comme priorités et des indicateurs normalisés ;
    - des emplacements dans le projet et un registre de départ de quatre concepts.
  - **Fichier d'invariants** :
    - aligné sur le socle : RFC 9457 au lieu de RFC 7807, `400` pour la validation, extensions `code`, `traceId`, `errors[]`, pagination `{ content, page }` ;
    - aligné sur les référentiels : DTO en `record`, nommage d'Angular 20, `exhaustMap` contre le double clic, accessibilité ;
    - Liquibase : `runOnChange` n'est pas un rollback ; trois changesets pour un rattrapage ; `CREATE INDEX CONCURRENTLY` hors transaction ;
    - registre des écarts dans un fichier distinct, le fichier d'invariants n'étant jamais modifié par l'IA ; accents rétablis.
  - **Lancement** : fichier de contexte de l'IA locale avec les imports `@` de Gemini CLI (`GEMINI.md`, ou `README.md` nommé dans `context.fileName`) et d'un autre outil qui charge son propre fichier de contexte, y compris dans la disposition du kit.
- Vérifié :
  - les six exemples de commits et l'exemple de branche passent les hooks `pre-commit` et `commit-msg` du kit 1.0.1, rejoués dans un dépôt de demande `ABCDE-3512` ;
  - `docs/c7e/` et `docs/demandes/` y sont acceptés, `.skills/` refusé ;
  - frontmatters en YAML, registre de départ et exemple de Problem Details en JSON, exemple de changeset en YAML ;
  - la transmission, relue comme le ferait l'IA, redonne les sept fichiers à l'identique.
- La liste du socle des skills qui l'incluent ne nomme pas encore `orchestrateur-c7e` : elle sera complétée à la prochaine version du socle, pour ne pas monter cinq spécifications pour une mention.
- Décisions du développeur (31 octobre 2026) : les deux fichiers sont destinés au lancement de l'IA locale ; ils sont analysés, corrigés et ajoutés au dépôt Agent2Prompt.
- Décisions ratifiées (pull request n° 19) :
  - les noms des slots É0, É6 et É7 rendus à l'Axiome 7E ;
  - le principe de résonance énoncé selon sa formulation, la remontée de cause en devenant la conséquence au premier ordre ;
  - une méthode en un seul fichier, D1 à D7 sans modules séparés, pour le lancement ;
  - le nom `orchestrateur-c7e`, à la place de `c7e_fractal_orchestrator`, et la version 3.1.0, qui prolonge la 3.0.0 remise ;
  - la validation de la fiche et la gate contrats dans tous les modes, B compris ;
  - les conventions Git du kit, et l'interdiction pour l'IA de pousser, fusionner ou poser un tag ;
  - l'inclusion du socle et des référentiels Java et Angular, qui font foi devant le fichier d'invariants ;
  - les quatre concepts de départ au statut `validated` par la ratification de cette version ;
  - `clarity=0.9`, sans définition, remplacé par la règle « synthèse d'abord » ; `rigor=0.95` défini comme part des décisions prouvées ;
  - les emplacements par défaut : `.skills/orchestrateur-c7e/`, `docs/c7e/`, `docs/demandes/<CLÉ>/` ;
  - les défauts du fichier d'invariants alignés sur le socle et les référentiels (versions, codes d'erreur, pagination, DTO, nommage, double clic) ;
  - l'archivage des deux fichiers de la 3.0.0 dans le dépôt public.

### 2026-10-28 : capture-sprint-jira 1.2.1

- **capture-sprint-jira 1.2.1** : correctif. Une fois la version 1.2.0 fusionnée, sa recette en CI a échoué sur `ubuntu-latest` Node 22 : après la fermeture du navigateur pendant la capture (R15), la capture est restée en cours sur le deuxième ticket, et les scénarios suivants en ont échoué (8 contrôles). Les trois autres jobs passaient.
  - Capture (D4.INV-4) : la capture d'un ticket échoue aussitôt si la page ou le navigateur se ferment, et au plus tard après le délai d'affichage plus deux minutes, si le navigateur ne répond plus. Le ticket est alors en erreur, et la capture s'arrête ou passe au suivant.
  - Le blocage n'a pas été reproduit hors de la CI, en trente fermetures pendant la capture, avec Chromium et Google Chrome : le correctif rend ce blocage impossible, sans en prouver la cause.
  - Recette : deux contrôles en R15, sur un faux onglet qui ne répond plus ; 132 contrôles. Dix-neuf défauts réintroduits ; M18 et M19, les gardes retirées, sont nouveaux.
- Version 1.2.0 archivée ; sa transmission reste telle qu'elle a été publiée. README mis à jour.

### 2026-10-28 : capture-sprint-jira 1.2.0

- **capture-sprint-jira 1.2.0** : capture d'un ticket seul par son adresse, à la demande du développeur, pour recapturer ou ajouter un ticket sans relancer le sprint.
  - D12, active, module `ticket` : l'adresse `…/browse/<CLÉ>` est ramenée à sa clé, une adresse sans clé est refusée ; la page est attendue et enregistrée comme dans la capture du sprint. Le dossier est choisi par le développeur parmi les catégories et `à classer`, proposé d'après le dernier `rapport.json` du dossier de sortie ; la copie d'un autre dossier est retirée ; l'entrée du rapport est remplacée ou ajoutée, avec le choix noté, ou le rapport est créé ; rien n'est écrit en cas d'erreur ; le navigateur revient à la page d'avant.
  - Interface : section « Un ticket seul », `POST /api/ticket` et `GET /api/section`. Ligne de commande : `--ticket` et `--dossier`. Agent : protocole du ticket seul, scénario A6.
- Point d'extension E2 : `captureSingleTicket()` exportée. Au total : 12 modules, 39 invariants, dont les six de D5, qui ne sont plus en vigueur, 20 scénarios de recette (130 contrôles).
- Essayé avec Node 20.20.2 et 22.23.4, Chrome for Testing 153, Google Chrome 156 et Python 3.13 : 130 contrôles sur 130, après extraction depuis la transmission 1.2.0. Dix-sept défauts réintroduits un à un font chacun échouer le scénario attendu.
- Version 1.1.0 archivée sous `specs/capture-sprint-jira/archives/SKILL-v1.1.0.md` ; sa transmission reste telle qu'elle a été publiée. README mis à jour.

### 2026-10-28 : capture-sprint-jira 1.1.0

- **capture-sprint-jira 1.1.0** : classement par section de la page du sprint. Après vérification sur son Jira, le développeur précise que les deux parties du sprint s'annoncent sur la page du sprint par un `<span>IA</span>` et un `<span>DEV</span>`, et non dans la page de chaque ticket, et que les dossiers prennent ces noms.
  - D11, active : classement par section de la page du sprint, dossiers et rapport. Catégories par défaut `IA` et `DEV`. La section d'un ticket est le couloir de l'en-tête qui le contient ou, dans une liste plate, le dernier en-tête qui le précède ; elle est relevée à chaque pas du défilement, et gardée dans une liste virtualisée. Un ticket sans section va dans `à classer`. Une section introuvable, ou une catégorie qui précède plusieurs groupes de tickets, est signalée en fin de capture, sans l'arrêter.
  - D5, recherche d'un terme clé dans la page du ticket : `superseded`, remplacée par D11. Ses invariants restent pour lire une capture 1.0 ; le module `classement` a une section de migration.
- Point d'extension E1 étendu : `markers`, les en-têtes comptés par catégorie. Au total : 11 modules, 35 invariants, dont les six de D5, qui ne sont plus en vigueur, 19 scénarios de recette (117 contrôles).
- Relevé (D3.INV-1, précisé). Sur la pull request de cette version, le job `ubuntu-latest` Node 22 a refait l'échec de la 1.0.0 : 31 tickets sur 72 relevés en 5 s, au premier lancement du navigateur. Le skill couvre désormais les deux causes qui produisent cet échec :
  - une fenêtre presque sans hauteur, où la liste du sprint ne défile pas (reproduit dans une fenêtre de 100 pixels de haut) : la fenêtre du sprint passe au premier plan, et elle est agrandie à 1 280 × 900 si elle est trop petite ;
  - une page qui ne rend pas encore d'image, où le navigateur n'émet pas l'événement `scroll` qui fait charger la suite : le relevé attend une première image, 5 s au plus, et signale lui-même chaque pas de défilement à la page.
- Essayé avec Node 20.20.2 et 22.23.4, Chrome for Testing 153, Google Chrome 156 et Python 3.13 : 117 contrôles sur 117, après extraction depuis la transmission 1.1.0. Quatorze défauts réintroduits un à un font chacun échouer le scénario attendu.
- Version 1.0.1 archivée sous `specs/capture-sprint-jira/archives/SKILL-v1.0.1.md` ; sa transmission reste telle qu'elle a été publiée. README mis à jour.

### 2026-10-28 : capture-sprint-jira 1.0.1

- **capture-sprint-jira 1.0.1** : correctif. Une fois la version 1.0.0 fusionnée, sa recette en CI échouait sur les deux jobs Node 20 : sur `ubuntu-latest`, le relevé s'arrêtait à 31 tickets sur 72 ; sur `windows-latest`, R15 et R16 dépendaient de la vitesse du runner.
  - Relevé (D3.INV-1) : tout bloc qui défile et contient un lien de ticket est parcouru, quelle que soit sa hauteur, et non plus seulement ceux de 100 pixels au moins. La fenêtre s'ouvre en 1 280 × 900 pixels, quelle que soit la taille gardée par le profil.
  - Capture (D4.INV-4, précisé) : fermé pendant le relevé, avant tout ticket, le navigateur arrête la capture avec un message qui le dit, et non plus sur un message technique.
  - Recette : le faux Jira charge des cartes tant que la liste ne remplit pas sa zone, comme Jira, et sa liste virtualisée tient dans 80 pixels ; R15 couvre la fermeture pendant le relevé ; R16 attend l'interface sans s'interrompre au premier délai dépassé. 110 contrôles, contre 108 en 1.0.0. Huit défauts réintroduits un à un font chacun échouer le scénario attendu ; M8, le seuil de 100 pixels, est nouveau.
- Essayé avec Node 20.20.2 et 22.23.4, Chrome for Testing 153 et Python 3.13 : 110 contrôles sur 110, après extraction depuis la transmission 1.0.1, sur l'écran virtuel par défaut comme sur un grand écran.
- Version 1.0.0 archivée sous `specs/capture-sprint-jira/archives/SKILL-v1.0.0.md` ; sa transmission reste telle qu'elle a été publiée. README mis à jour.

### 2026-10-28 : capture-sprint-jira 1.0.0

- **capture-sprint-jira 1.0.0** : nouveau skill. Il capture en MHTML les tickets du prochain sprint d'un Jira protégé par un SSO et les range dans un dossier par catégorie, `ticket avec ia` et `ticket sans ia` par défaut. Le développeur les enregistrait jusque-là un à un, à la main. Dimensions :
  - D1 à D8, actives : exécution (Node 20, `playwright-core` 1.63.0 seule dépendance, Chrome du poste, variables `JIRA_CAPTURE_*`) ; session SSO (connexion faite à la main dans une fenêtre visible, profil dédié, aucun identifiant) ; relevé des liens `/browse/<CLÉ>` de la page du sprint, navigation exclue, liste virtualisée comprise, filtre par préfixe de clé et plage de numéros ; capture de chaque page de ticket, attendue par son adresse ou son titre et par la clé affichée ; classement par terme clé, dossier `à classer` quand aucun terme ou plusieurs, dossiers créés directement dans le dossier de sortie, rapport JSON ; interface locale et ligne de commande ; agent `capteur-sprint` ; export par l'API REST pour un Jira sans SSO.
  - D9 et D10, réservées : remise des tickets capturés à `agent-tdd-jira`, pilotage de la capture par un autre outil, comme GeminiBoard pour Gemini CLI.
- Points d'extension E1 (champs stables de `rapport.json`) et E2 (`captureSprintTickets()` exportée). Au total : 11 modules, 29 invariants, 19 scénarios de recette (108 contrôles), scénarios d'agent A1 à A5.
- Treize fichiers tirés des modules par une commande d'extraction à empreintes, valable sous bash, CMD et PowerShell, qui signale aussi un fichier absent.
- Tiré des outils déposés d'abord dans `utils/` de `geminiboard-cadrage` (pull request n° 10 de ce dépôt, close sans fusion). Le préfixe, les numéros et l'adresse du Jira du développeur ne figurent dans aucun fichier : l'interface les garde dans son navigateur.
- Essayé avec Node 20.20.2 et 22.23.4, Chrome for Testing 153 et Python 3.13 : 108 contrôles sur 108, après extraction depuis la transmission, sur un grand écran comme sur l'écran virtuel par défaut. Sept défauts réintroduits un à un font chacun échouer le scénario attendu.
- La première exécution en CI a révélé deux défauts, corrigés avant publication. Le défilement à la molette, à pas fixe de 1 200 pixels, sautait des cartes d'une liste virtualisée dans une petite fenêtre : il est devenu programmé, à 80 % de la hauteur affichée, jusqu'en bas (D3.INV-1). La capture était déclarée terminée avant le retour du navigateur au sprint : une relance immédiate pouvait partir d'une page en chargement (D6.INV-4). La recette lit aussi la sortie de Python en UTF-8 sous Windows.
- Outillage : workflow `.github/workflows/recette-capture-sprint-jira.yml`, qui rejoue ce chemin sur `ubuntu-latest` et `windows-latest`, avec Node 20 et 22 : extraction sous bash et sous CMD, `npm ci`, recette, bilan et échecs en annotations. README mis à jour.

### 2026-10-24 : skill4appli 1.1.0

- **skill4appli 1.1.0** : inscription du skill dans le cycle 7E et les douze facteurs. Dans la section 5 du point d'entrée, chaque facteur est rattaché à une phase et prouvé par un invariant et ses tests, ou déclaré non couvert. Nouvelles dimensions :
  - D10, active : configuration par l'environnement. Variables `SKILL4APPLI_REPO`, `SKILL4APPLI_DB`, `SKILL4APPLI_FORMAT`, `SKILL4APPLI_MAX_SIZE`, `SKILL4APPLI_INTERVAL`, `SKILL4APPLI_BASE` et `SKILL4APPLI_GIT`. L'option l'emporte, une variable vide vaut absente, une valeur invalide est nommée. Commande `config`.
  - D12, active : parité Linux, WSL2 et Windows. Identité canonique du worktree (chemin réel, casse ignorée sous Windows) ; chemins absolus natifs, chemins du dépôt en `/` ; arrêt propre commun par `watch-stop`, puisque Windows ne transmet aucun signal à un processus qu'on termine ; fins de ligne CRLF sans effet ; avertissement `depot_windows_depuis_wsl`, tiré de la table des montages.
  - D11, réservée : service MCP en stdio, en lecture seule, qui franchit la frontière Windows et WSL2 par l'interop, sans port.
- Point d'extension E4 : un objet par commande de lecture, et `executer()` exporté. Au total : 13 modules, 34 invariants, 34 tests, scénarios d'agent A1 à A6.
- Commande d'extraction d'une ligne, sans `$`, accent grave, `!`, `%` ni guillemet intérieur : elle vaut sous bash, CMD et PowerShell.
- Agent `memoire-appli` : il relaie les avertissements, appelle `node.exe` depuis WSL pour un dépôt sous Windows, et ne lance `watch-stop` qu'avec l'accord du développeur.
- Aucune migration, aucun invariant de 1.0.0 modifié ; identifiant de base inchangé sous Linux et WSL2. Archive 1.0.0.
- Poste visé, décrit par le développeur : Java et Angular sous Windows, PostgreSQL dans WSL2, le back Java faisant évoluer le schéma par Liquibase. Le skill tourne du côté du git qui possède le worktree, donc sous Windows ; un agent de WSL2 l'appelle par `node.exe`, avec des chemins Windows (module `parite`). Le schéma PostgreSQL entre dans la mémoire par les changelogs Liquibase du dépôt, avec des requêtes types (module `interrogation`, § 6).
- Essayé avec Node 22.22, SQLite 3.50.4 et git 2.43 : 34 tests sur 34.
  - Treize défauts réintroduits un à un font chacun échouer le test attendu, dont huit nouveaux : variables ignorées, variable vide prise pour une valeur, demande d'arrêt ignorée, demande d'un autre processus honorée, demande antérieure gardée, extrait gardant son retour chariot, repli `/mnt/<lecteur>` retiré, objet de la ligne de commande différent de celui d'`executer()`.
  - La transmission, relue comme le ferait l'IA, redonne les trois fichiers aux empreintes publiées par la commande d'extraction, et leur recette y passe.
- Outillage : workflow `.github/workflows/recette-skill4appli.yml`. Il rejoue ce chemin sur `ubuntu-latest` et `windows-latest`, avec Node 22 et 24 : extraction sous bash et sous CMD, puis recette, bilan et échecs en annotations. README mis à jour.
- Décisions du développeur (24 octobre 2026) :
  - 1.1.0 ratifiée telle que proposée : configuration par l'environnement active, service MCP réservé, section de lecture 12 facteurs ;
  - poste : Java et Angular sous Windows, PostgreSQL dans WSL2 ;
  - le back Java passe par Liquibase pour PostgreSQL (commentaire sur la pull request n° 11).
- Décisions ratifiées (pull request n° 11) :
  - le skill tourne sous Windows, du côté du git du développeur ; depuis WSL, un agent l'appelle par `node.exe` plutôt que de lancer le Node de WSL sur `/mnt/c` ;
  - un avertissement, et non un refus, pour un worktree Windows lu depuis WSL ;
  - la correspondance proposée entre facteurs et phases 7E (section 5) ;
  - des variables pour les réglages de déploiement, aucune pour les options de requête ;
  - `watch-stop` par un fichier de demande qui vise un PID ; T20 sauté sous Windows ;
  - D11 en stdio seulement, HTTP écarté en 1.x ;
  - le workflow de recette multiplateforme ;
  - des exemples neutres (`acme`), le dépôt étant public.

### 2026-10-24 : agent2dev 1.1.0, agent2test 1.2.0, agent-tdd-jira 1.3.2

- **agent2dev 1.1.0** : dimensions D24 (données en un fichier unique, par l'agent médiateur) et D25 (échange du binôme par dossiers, facultatif) actives ; D2 (données par agent) et D23 (relais n8n) passent à `superseded`, chacune avec sa section de migration. Données : un fichier SQLite unique, `agent2dev.sqlite`, dont l'agent médiateur `donnees` tient la seule connexion ; les autres agents n'y accèdent que par ses actions du bus, `lire`, `ecrire`, `ajouter`, `lister` et `compter`, sur les collections qu'ils déclarent, `modifiable`, `ajout-seul` ou `chainee` ; le médiateur tire la table de l'appelant que le bus atteste et de la collection, `<agent>__<collection>`, sans SQL ni nom de table venu d'un agent, et numérote et chaîne le journal et le grand livre dans la transaction d'ajout ; une migration qui crée ou modifie un objet hors des tables de son agent est annulée en entier, et, au démarrage, chaque requête du médiateur est vérifiée sur le plan d'exécution de SQLite (`EXPLAIN`), déclencheurs, vues et clés étrangères compris ; une instance 1.0.0 reprend ses données par `npm run donnees:reprendre`, chaînes recopiées sans recalcul puis vérifiées. Échange : en mode `manuel`, le défaut, la remise se télécharge depuis le tableau de bord, au format `agent2test.remise/1`, et le développeur donne le chemin du journal de tests ; en mode `dossiers`, le `depot` publie la remise dans la boîte de sortie de l'instance, sous un nom provisoire puis renommée, et l'échange relève, toutes les 30 secondes et en lecture seule, le journal de tests nommé d'après la remise courante dans la boîte de sortie d'Agent2Test ; le `depot` le copie dans le dossier de travail, et `lire-acceptation.mjs` le lit comme un journal déposé à la main. Aucune connexion, aucune décision. Le module `relais`, le rôle `relais` et les outils `a2d_remise` et `a2d_remise_relayee` sont retirés. D24.INV-1 et D24.INV-2 remplacent D2.INV-1 ; D24.INV-3 reprend D2.INV-2 et y ajoute le contrôle d'intégrité au démarrage ; D24.INV-4 reprend mot pour mot D2.INV-3 ; D25.INV-1 et D25.INV-3 reprennent D23.INV-1 et D23.INV-3 ; D25.INV-2 et D25.INV-4 s'ajoutent. 23 modules, 96 invariants définis, dont 89 en vigueur, 223 scénarios de test. Méthode : agent-tdd-jira 1.3.2 ; binôme : agent2test 1.2.0. Archive 1.0.0.
- **agent2test 1.2.0** : dimensions D23 (données en un fichier unique, par l'agent médiateur) et D24 (remises d'Agent2Dev, en fichier ou par dossier d'échange) actives ; D21 (données SQLite par agent) et D22 (relais n8n) passent à `superseded`. Données : un fichier SQLite unique, `agent2test.sqlite`, dont l'agent médiateur `donnees` tient la seule connexion ; chaque agent y a son espace de tables, préfixées par son nom (`plan__`, `verdict__`, `journal__`…) ; au démarrage, chaque contrat nommé est vérifié sur le plan d'exécution de SQLite (`EXPLAIN`), déclencheurs compris : il n'ouvre que des tables de son propriétaire ; les tables plein texte se vérifient par leur nom ; sous Node 24.10 ou plus récent, un autorisateur refuse en plus, à la préparation, toute instruction qui touche un autre espace ; le journal et le grand livre s'écrivent par des contrats chaînés, numérotés dans la transaction d'ajout ; un journal rompu se met de côté par `VACUUM INTO`, puis sa table est recréée ; une instance 1.1.0 ou 1.0.0 reprend ses données par commande humaine. Échange : en mode `manuel`, le défaut, l'opérateur dépose la remise dans le tableau de bord ; en mode `dossiers`, Agent2Test relève les remises dans la boîte de sortie de chaque instance d'Agent2Dev, et dépose dans la sienne le journal de tests JSON clos d'une campagne issue d'une remise. Une remise s'ouvre sur la racine admise dont `HEAD` est le commit remis, jamais sur le chemin qu'elle cite, qu'Agent2Test, sous Windows, ne lirait pas. Le module `relais`, le rôle `relais` et l'outil `a2t_deposer_remise` sont retirés ; `a2t_demarrer_campagne` accepte une remise. 21 modules, 108 invariants définis, dont 95 en vigueur, 181 scénarios de test. Entrée : agent-tdd-jira 1.3.2. Archive 1.1.0.
- **agent-tdd-jira 1.3.2** : correctif. Référence à agent2test 1.2.0 ; le module `binome-agent2test` parle d'échange au lieu de relais : quand la tête de développement le prévoit, la remise et le journal de tests passent par des dossiers d'échange, sans connexion ni décision. Aucune dimension ni aucun invariant modifié ; `lire-acceptation.mjs` inchangé. Archive 1.3.1.
- Les trois spécifications se référencent entre elles et se publient dans un même commit (`EVOLUTION.md`, section 7). Les transmissions agent2dev 1.0.0, agent2test 1.1.0 et agent-tdd-jira 1.3.1, publiées, restent telles quelles.
- Décisions du développeur :
  - 22 octobre 2026 : un fichier SQLite unique, dont l'accès est géré par un agent médiateur, plutôt qu'un fichier par agent ;
  - 23 octobre 2026 : la conception proposée le 22 octobre, retenue : un fichier par tête, sans fichier commun aux deux, puisque le mode WAL exige un seul hôte et qu'Agent2Test tourne sous Windows, Agent2Dev dans WSL2 ; tables préfixées par le nom de leur agent ; dans Agent2Dev, table tirée de l'appelant que le bus atteste et de la collection ; dans Agent2Test, contrats nommés vérifiés au démarrage sur le plan d'exécution de SQLite, tables plein texte par leur nom, autorisateur à partir de Node 24.10 ;
  - 23 octobre 2026 : n8n remplacé par l'échange par dossiers proposé le 22 octobre : mode `manuel` par défaut, `dossiers` en option ; une boîte de sortie par tête, que l'autre lit en lecture seule ; fichiers écrits sous un nom provisoire puis renommés ; relève toutes les 30 secondes, réglable ; aucune connexion, aucune décision ; rôle `relais` et outil `a2t_deposer_remise` retirés ; racine d'une remise retrouvée par son commit.
- Décisions ratifiées (pull request n° 10) :
  - dans Agent2Dev, les cinq actions du médiateur et les trois natures de collection ; les filtres de `lister` limités aux champs indexés déclarés, valeurs liées ;
  - dans Agent2Dev, la vérification des requêtes du médiateur par `EXPLAIN` au démarrage, ajoutée parce que le contrôle des migrations laisse passer un déclencheur, une vue ou une clé étrangère qui, depuis l'espace d'un agent, atteint la table d'un autre ;
  - le contrôle des migrations par comparaison de `sqlite_schema` avant et après, objet par objet, d'après sa table (`tbl_name`), pour que les index automatiques de SQLite passent, et la table `donnees__migrations` de chaque tête ;
  - le numéro et l'empreinte des lignes chaînées calculés par le médiateur dans la transaction d'ajout ; dans Agent2Test, le contrat `journal.ajouter` et celui du grand livre ;
  - un journal rompu d'Agent2Test mis de côté par `VACUUM INTO` dans `journal-rompu-<date>.sqlite`, puis table recréée par sa migration et reprise inscrite au journal ;
  - les noms d'échange `R-<CLÉ>-<n>.json` et `<remise>.<campagne>.json`, les fichiers provisoires `.<nom>.tmp` ; les fichiers en point, les liens symboliques et les fichiers de plus de 1 Mo ignorés à la relève ; un intervalle de 5 à 300 secondes ; une remise publiée jamais réécrite, une correction prenant le numéro suivant ;
  - dans Agent2Dev, `a2d_journal_de_tests` gardé pour donner le chemin du journal ; une configuration qui porte encore `relais`, ou une boîte d'échange placée dans un dépôt git, refusée au démarrage ;
  - D2 et D23 d'agent2dev, D21 et D22 d'agent2test remplacées plutôt que réécrites ; D24.INV-3 d'agent2dev renforcé par le contrôle d'intégrité ; un fichier altéré refusé au démarrage avec le même message, qu'il soit refusé dès la première instruction ou que `integrity_check` échoue.
- Médiateur d'Agent2Dev essayé avec Node 22.22 et son SQLite 3.50.4 : la collection d'un autre agent est refusée `COLLECTION_INCONNUE`, même quand la charge prétend un autre appelant, et un nom de collection forgé aussi ; un filtre sur un champ non indexé est refusé ; `UPDATE` et `DELETE` lancés par un outil SQLite lèvent « ajout seul » ; un document JSON invalide est refusé par la base ; une migration de l'`apprenant` qui crée aussi `orchestrateur__intrus`, ou un déclencheur sur une table de l'`orchestrateur`, est annulée en entier, et une table de son espace avec son index automatique passe ; un déclencheur de l'`apprenant` posé sur sa propre table qui écrit chez l'`orchestrateur`, une vue de l'`apprenant` sur ses décisions ou une clé étrangère vers elles passent le contrôle des migrations, et la vérification par `EXPLAIN` les repère tous trois ; deux écrivains de 2 000 lignes chaînées laissent une chaîne de 4 000 lignes intacte ; une ligne falsifiée par un outil qui retire les déclencheurs est nommée ; un processus tué au milieu d'une transaction de 50 000 enregistrements n'en laisse aucun. Selon l'endroit d'une altération, SQLite refuse le fichier dès la première instruction, lève une erreur pendant `integrity_check`, ou rend la liste des écarts : les modules `donnees` traitent les trois cas.
- Médiateur d'Agent2Test essayé de même : un contrat de `verdict` qui atteint une table du `plan` par jointure, CTE, `INSERT … SELECT`, UPSERT, déclencheur, vue de son espace ou clé étrangère est repéré sur le plan d'exécution ; les tables virtuelles n'y paraissent que par un pointeur, d'où leur contrôle par le nom, tables internes FTS5 comprises ; `ATTACH` et `sqlite_schema` sont refusés ; le journal mis de côté par `VACUUM INTO` garde ses déclencheurs. L'autorisateur de Node 24.10 n'a pas été essayé : Node 22.22 ne l'a pas. Échange : un fichier écrit sous un nom provisoire puis renommé n'est jamais lu à moitié, et la relève ne retient que le journal de la remise courante.
- Les trois transmissions, reconstruites comme le ferait l'IA, redonnent les fichiers de leurs spécifications, empreintes vérifiées ; les 20 diagrammes Mermaid des trois spécifications et du README se rendent ; `lire-acceptation.mjs` passe ses 33 cas, et le journal d'exemple d'agent2test 1.2.0, lu sur l'exemple ECR-77, redonne exactement les deux sorties du module `binome-agent2test`.

### 2026-10-23 : skill4appli 1.0.0

- **skill4appli 1.0.0** : mémoire SQLite d'une application locale et de ses branches git, pour qu'un agent localise du code sans parcourir le dépôt à chaque question. Inventaire fidèle à git (`.gitignore` respecté), fichiers binaires, de verrouillage, minifiés ou trop gros inventoriés sans contenu, textes non UTF-8 lus en latin1 sans perte ; relecture limitée aux fichiers changés, aucun fichier fantôme ; branches locales et distantes par un seul `for-each-ref`, avec amont, avance, retard et worktree d'extraction, et fichiers de chaque branche depuis l'ancêtre commun ; `query` en lecture seule et bornée, `search` en FTS5 trigramme qui rend `chemin:ligne` sans casse ni accent discriminants, `schema` commenté ; `status`, qui mesure l'écart entre la base et le worktree source ; watcher qui charge la branche courante dans un worktree dédié, détaché et verrouillé dans le dossier commun git, la suit par scrutation et ne relit que les fichiers changés d'un commit à l'autre ; agent `memoire-appli`. Dimensions D1 à D7 actives, D8 (modifications non commitées superposées au miroir) et D9 (symboles par langue) réservées ; 10 modules, 26 invariants, 25 tests et 5 scénarios d'agent, points d'extension E1 à E3. Le script `scripts/app_db.mjs`, la recette `tests/app_db.test.mjs` et l'agent `agent/memoire-appli.md` sont écrits en entier dans les modules `execution`, `recette` et `agent`, avec une commande d'extraction et leurs empreintes. Node 22.13 au moins, git 2.38 au moins, aucune dépendance.
- Tirée de `skill4appli-fr`, remis par le développeur le 23 octobre 2026 (un `SKILL.md` et `scripts/app_db.mjs`). La section 10 du point d'entrée donne la filiation, défaut par défaut : la version d'origine, rejouée sur un dépôt d'essai, exécutait une commande cachée dans un nom de branche, enregistrait `+ feature/wt` pour une branche extraite dans un autre worktree, créait sa base dans le dossier courant, gardait les fichiers supprimés, indexait les dossiers ignorés et corrompait binaires et fichiers latin1, laissait `query` vider la base, sortait toujours avec le code 0, et ingérait 3 000 fichiers en 5,4 s. Commandes, tables et colonnes d'origine conservées ; ses requêtes d'exemple restent valides.
- Essayé avec Node 22.22 et son SQLite 3.50.4, git 2.43 : les 25 tests passent en 13 s ; cinq défauts réintroduits un à un (shell, fichiers fantômes, références symboliques, base ouverte en écriture par une lecture, miroir déplacé sans vérification) font chacun échouer le test attendu. Sur 3 000 fichiers : ingestion complète en 0,62 s, ré-ingestion sans changement en 67 ms, indexation du miroir en 0,96 s, synchronisation d'un commit en 0,13 s. Disposition du kit `agents-paralleles-gitlab` essayée : dépôt nu `.bare/`, worktrees `main/` et `ECR-77/`, base et miroir rangés sous `.bare/skill4appli/`, commande refusée depuis la racine du kit. La transmission, relue comme le ferait l'IA, redonne les trois fichiers aux empreintes publiées, et leur recette y passe.
- Décisions du développeur (23 octobre 2026) :
  - une spécification transmissible dans un dossier `skill4appli` de ce dépôt, au format des autres, l'agent qui accompagne le skill en étant une dimension ;
  - un watcher sur la branche courante, chargée dans un dossier dédié par git worktree ; lecture ratifiée : worktree en HEAD détachée, puisque git refuse d'extraire deux fois la même branche, suivi par scrutation, réindexation limitée aux fichiers changés entre deux commits, modifications non commitées hors du miroir, signalées par `status` et réservées à une version suivante.
- Décisions ratifiées (pull request n° 8) :
  - base et miroir dans le dossier commun git, `<commun>/skill4appli/<id>/`, un couple par worktree source : rien dans l'arbre suivi, rien à exclure ;
  - commandes, options, tables et colonnes en anglais, comme la version d'origine, messages en français ; `last_commit` gardé au format « sha court - sujet », colonnes structurées ajoutées ;
  - fichiers de verrouillage, minifiés et cartes de source inventoriés sans contenu ; limite de contenu à 1 Mo, réglable ;
  - une base de la version d'origine reconstruite plutôt que migrée : elle n'est qu'un cache ;
  - `status` qui sort avec le code 6 quand la base n'est pas à jour, réponse sur la sortie standard ;
  - scrutation toutes les 2 s, 500 ms au minimum, plutôt que les événements du système de fichiers, pour fonctionner aussi sous WSL2 sur `/mnt/c` ;
  - avant `agt done` du kit, `mirror-remove` depuis le worktree de la demande ;
  - un agent sans écriture ni édition (`tools: Bash, Read, Grep, Glob`), qui ne lance `watch` ni `mirror-remove` sans accord, et lance `ingest` seul quand la base n'existe pas.

### 2026-10-22 : agent2dev 1.0.0, agent2test 1.1.0, agent-tdd-jira 1.3.1

- **agent2dev 1.0.0** : Agent2Dev, système multi-agents de développement qui applique le skill agent-tdd-jira 1.3.1 comme méthode, lu depuis sa transmission, vérifiée par sa table d'intégrité, et jamais réécrit. De la demande Jira en MHTML au rapport : extraction par le script du skill (V1), US, critères et scénarios Gherkin contrôlés par `controler-criteres.mjs` (V2), impact et variantes (V3), cycle TDD scénario par scénario (V4), binôme avec Agent2Test, dont le journal de tests est lu par `lire-acceptation.mjs`, puis matrice, rapport et projet de commentaire Jira (V5). Le moteur rédige par huit fiches qui citent le skill tel quel ; trois agents déterministes agissent : `methode` fournit le skill, `depot` est le seul écrivain, `executant` le seul exécutant de commandes. Le développeur valide aux points V0 à V5, toujours présentés ; le référent gouverne les leçons en CP-4. Dimensions D1 à D20 et D23 actives, D21 (mémoire) et D22 (autonomie) réservées ; 23 modules, 88 invariants, 220 scénarios de test, points d'extension E1 à E4 ; implémentation en neuf lots, dans le dossier `agent2dev/` du dépôt Agent2Dev. Node 22.13 au moins, aucune dépendance d'exécution, un fichier SQLite par agent dès le départ, Gemini Code Assist par MCP, modèle local compatible OpenAI ou simulation, exécution locale sous WSL2. Relais n8n facultatif (D23, module `relais`), désactivé par défaut : il porte la remise vers Agent2Test et le journal de tests vers Agent2Dev, par les serveurs MCP des deux têtes, au rôle `relais` limité à trois outils, et ne décide rien ; Agent2Dev fournit son workflow et sa composition, sur `127.0.0.1`, base SQLite, télémétrie coupée.
- **agent2test 1.1.0** : dimensions D21 (données SQLite par agent) et D22 (relais n8n facultatif) actives ; D2 (données sur PostgreSQL) passe à `superseded`, remplacée par D21, avec sa section de migration et une commande de reprise d'une instance 1.0.0. Un fichier SQLite par agent, par `node:sqlite` ; contrats nommés sur la seule connexion de leur propriétaire, sans `ATTACH`, sans extension ni instruction de schéma ; chaque écriture en transaction ; déclencheurs d'ajout seul, dont la présence et la chaîne du journal et du grand livre sont vérifiées à chaque démarrage ; journal rompu mis de côté par commande humaine ; sauvegarde par `VACUUM INTO` ; mémoire en FTS5, mots réduits et cherchés en préfixe, vecteurs rangés avec les fragments ; plus de conteneur PostgreSQL, `pg` gardé pour l'oracle seul ; Node 22.13 au moins. Relais : remise au format `agent2test.remise/1`, à schéma fermé, déposée par l'outil `a2t_deposer_remise` au rôle `relais` ; la remise attend qu'un testeur ou le développeur ouvre la campagne, et une remise périmée (commit, fichier suivi ou empreinte d'une source qui diffère) est refusée à l'ouverture ; racines admises par la configuration humaine ; vue « Remises reçues ». Invariants remplacés par des invariants plus forts : D10.INV-1, D18.INV-1, D18.INV-3 ; D21.INV-1 à D21.INV-5 et D22.INV-1 à D22.INV-4 s'ajoutent. 21 modules, 99 invariants définis, dont 95 en vigueur, 177 scénarios de test. Archive 1.0.0.
- **agent-tdd-jira 1.3.1** : correctif. Référence à agent2test 1.1.0 ; le module `binome-agent2test` mentionne le relais, qui peut porter la remise et le journal de tests à la place du développeur, sans rien décider. Aucune dimension ni aucun invariant modifié ; `lire-acceptation.mjs` inchangé. Archive 1.3.0.
- Les trois spécifications se référencent entre elles et se publient dans un même commit (`EVOLUTION.md`, section 7). `lire-acceptation.mjs` passe toujours ses 33 cas, et le journal d'exemple d'agent2test 1.1.0, lu sur l'exemple ECR-77, redonne exactement les deux sorties du module `binome-agent2test`.
- Tirée de la conception de l'étape 1 d'Agent2Dev (cadrage et architecture 0.3.0, ratifiés le 4 octobre 2026, dépôt Agent2Dev) et de sa lignée `agents-modif` ; la section 11 du point d'entrée d'agent2dev en donne la filiation, invariant par invariant, et ce qui change.
- Décisions du développeur (21 octobre 2026) :
  - une spécification transmissible dans ce dépôt, puis le code, par lots, dans le dossier `agent2dev/` du dépôt Agent2Dev ;
  - les points V1 à V5 toujours présentés, sans autonomie ; l'autonomie par point est réservée (D22 d'agent2dev) ;
  - les adaptateurs de moteur d'Agent2Test : `externe` (Gemini Code Assist par MCP), `compatible-openai`, `simulation` ;
  - à la ratification de la conception, SQLite dès le départ, pour Agent2Dev comme pour Agent2Test, au lieu du JSON puis SQLite au-delà de 250 Ko d'abord retenu pour Agent2Dev, et au lieu de PostgreSQL pour Agent2Test ;
  - à la ratification de la conception, n8n facultatif, en relais de transport seulement, sur sa base SQLite : sans lui, le développeur porte les fichiers à la main ;
  - l'option B de l'étape 1 retirée : l'`executant` ne fait que compiler, tester et lancer les scripts du skill ; l'application, sa base et ses batchs restent au développeur ;
  - l'écriture du code en option : par défaut, Agent2Dev écrit et teste dans une copie de travail, dans ses propres données, et remet un patch par scénario accepté, que le développeur applique par `git am` ; avec l'autorisation de la configuration humaine, sa référence et son auteur, il écrit dans l'arbre de la demande ; avant la remise à Agent2Test, il vérifie que l'arbre du développeur contient chaque patch remis.
- Décisions ratifiées (pull request n° 7) :
  - D2 d'agent2test remplacée par D21 plutôt que réécrite, et D10.INV-1, D18.INV-1 et D18.INV-3 remplacés par des invariants plus forts ;
  - au démarrage d'Agent2Test, un déclencheur absent ou une chaîne rompue empêche le démarrage ; un journal rompu se met de côté par commande humaine, un grand livre rompu se restaure depuis une sauvegarde ;
  - recherche plein texte sans racinisation française : mots réduits de deux lettres au-delà de cinq, cherchés en préfixe, classés par bm25 ;
  - format `agent2test.remise/1`, et remise périmée à l'ouverture dès que le commit, un fichier suivi ou une source a changé ;
  - rôle `relais` limité à trois outils de chaque côté ; décisions, ouverture de campagne, arrêt d'urgence et reprise lui sont refusés ;
  - workflow et composition de n8n fournis par Agent2Dev seul ; n8n, sous Sustainable Use License, qui n'est pas une licence open source, est installé par le développeur, hors des deux kits.
- Mécanique de la copie de travail essayée avec git 2.43 : clone d'un worktree, `git am -3` relancé sans effet, mise à jour par `git fetch origin HEAD` et rebase qui retire les patchs appliqués, conflit sur un patch réécrit par le développeur ; le clone, la mise à jour et les lectures laissent l'arbre du développeur identique, `.git` compris, contenus et dates. `git am` ne lance ni `pre-commit` ni `commit-msg` : le `depot` vérifie lui-même le motif du message et les fichiers interdits du kit sur chaque commit de la copie.
- Stockage essayé avec Node 22.22 et son SQLite 3.50.4 : mode WAL ; FTS5 avec `unicode61 remove_diacritics 2`, termes en préfixe et classement bm25 ; déclencheurs qui lèvent « ajout seul » sur `UPDATE` et sur `DELETE`, sans condition compris ; `CHECK (json_valid(doc))` ; un processus tué au milieu d'une transaction de 50 000 enregistrements ne laisse aucun enregistrement, et `integrity_check` rend `ok` ; deux écrivains de 2 000 lignes chaînées chacun laissent une chaîne intacte ; `VACUUM INTO` copie un fichier en WAL, déclencheurs compris ; les extensions restent fermées par défaut, et le moteur accepte `ATTACH`, d'où le contrôle des contrats à leur chargement.

### 2026-10-21 : agent2test 1.0.0, agent-tdd-jira 1.3.0

- **agent2test 1.0.0** : Agent2Test, système multi-agents qui choisit, prépare, joue et journalise les tests essentiels d'une demande, dans un projet séparé de l'application. Playwright y est piloté comme une bibliothèque depuis Node ; le plan vient d'agent-tdd-jira (`us.md` et fichier Gherkin) ; chaque critère d'acceptation reçoit un verdict prouvé ; l'humain ratifie aux points de contrôle CP-0 à CP-5 ; le système observe et fait évoluer ses propres règles sous gouvernance. Dimensions D1 à D18 actives, D19 (accessibilité) et D20 (profil recette et conteneur) réservées ; 20 modules, 90 invariants, points d'extension E1 à E5 ; implémentation en huit lots. Node 22 au moins, deux dépendances (`playwright` 1.63 ou plus récent, `pg`), PostgreSQL pgvector sur le port 5433, Gemini Code Assist par MCP ou modèle local compatible OpenAI, tableau de bord sur `127.0.0.1`. Tirée du dossier de conception du dépôt Agent2Test (cadrage, architecture, cahier des charges du 25 septembre 2026), dont la section 11 donne la filiation.
- **agent-tdd-jira 1.3.0** : dimension D7 active, binôme avec Agent2Test ; module `binome-agent2test`. Après le dernier scénario accepté, l'agent remet le plan validé et commité ; le développeur redémarre l'application sur le Tomcat local et conduit la campagne ; le script `lire-acceptation.mjs` tire du journal de tests le verdict de chaque critère, s'il vaut pour le plan et le code courants, sinon « non joué » avec sa raison ; chaque défaut applicatif confirmé en CP-3 rouvre son scénario en cycle TDD. Étiquettes de prérequis dans le fichier Gherkin : `@role-<nom>`, `@batch-<nom>`, `@redemarrage`, `@ecriture-base`, et au choix du développeur `@criticite-*` et `@socle`. Colonne « Acceptation » dans la matrice, ligne d'acceptation dans le rapport et le projet de commentaire Jira. Invariants D7.INV-1 à D7.INV-5, aucun invariant existant modifié. Archive 1.2.2.
- Les deux spécifications se référencent l'une l'autre et se publient dans un même commit (`EVOLUTION.md`, section 7). Le script `lire-acceptation.mjs` est testé sur 33 cas, dont deux en worktree et un qui vérifie qu'il ne modifie aucun fichier, index git compris ; le journal d'exemple d'agent2test, lu par ce script sur l'exemple ECR-77 d'agent-tdd-jira, redonne exactement les deux sorties du module `binome-agent2test` ; l'exemple, qui porte désormais `@role-LECTEUR`, passe `controler-criteres.mjs` sans écart.
- Décisions du développeur (21 octobre 2026) : Agent2Dev reste la tête de développement et applique agent-tdd-jira ; Playwright en bibliothèque, Agent2Test en projet séparé de l'application ; Agent2Test devient une spécification transmissible de ce dépôt ; tout reste en local, enchaîné à la main ; application sur Tomcat en local, lancée par le développeur ; batchs Java lancés par le développeur à un point de contrôle (CP-5) ; tous les modules actifs, accessibilité réservée.
- Décisions ratifiées (pull request n° 5) :
  - lecture de « connexion SSO réglée automatiquement » : authentification intégrée du poste par défaut (stratégie `integree`), connexion humaine en CP-0 en repli, sans identifiant détenu ;
  - écarts au dossier de conception d'Agent2Test (H1, H2, H3, CA-1.5, H9, CA-9.4, T1, H12 et US-29), dont l'AI Act mis hors périmètre et l'envoi des sources à Gemini soumis à l'autorisation de la DSI et du RSSI ;
  - rôles de l'application : étiquette `@role-<nom>`, rôles de la session déclarés par un humain (`session.roles`), scénario non jouable si le rôle manque ;
  - contrat de lecture du journal JSON : sources du plan et leurs empreintes, état git relevé à l'ouverture, cible de chaque décision ; verdict « non joué » dès que le plan ou le code a changé depuis la campagne ;
  - cycle de correction ouvert par un défaut applicatif confirmé en CP-3 sans désaccord, et par lui seul ; régression d'une autre demande corrigée dans la demande en cours, avec l'accord du développeur.

### 2026-10-21 : agent-tdd-jira 1.2.2

- **agent-tdd-jira 1.2.2** : script de contrôle `controler-criteres.mjs` (module `us-criteres`, section 7), en Node sans dépendance. Il confronte `us.md` et le fichier Gherkin et signale chaque écart avec son invariant (D10.INV-1 à D10.INV-7, D2.INV-3) : identifiants, provenance, énoncés invérifiables, exigences rattachées, couverture des critères par les scénarios, critères en attente, colonne « Scénarios ». Avec `--depuis`, il vérifie qu'aucun identifiant n'a été renuméroté depuis une révision git. L'agent le lance avant V2 et avant V5 ; sa sortie donne les critères prêts pour la réalisation.
- `us.md` gagne une section « Exigences » ; le statut d'un critère retiré s'écrit « retiré : <raison> ». Aucune dimension ni aucun invariant modifié. Archive 1.2.1.
- Script testé sur l'exemple ECR-77 du module et sur 27 variantes défectueuses ou limites, dont 5 avec un historique git ; chaque défaut est signalé avec l'invariant attendu.
- Décisions ratifiées (pull request n° 4) : le contrôle par script avant V2 et avant V5 ; la section « Exigences » dans `us.md` ; le format « retiré : <raison> » ; la liste des formulations jugées invérifiables (« correctement », « rapidement », « facilement », « intuitif », « convivial », « ergonomique », « optimal », « rapide » sans seuil).

### 2026-10-21 : retrait du préfixe `expert-`

- Les skills `expert-java`, `expert-angular`, `expert-analyse-projet` et `expert-sonarqube` s'appellent désormais `java`, `angular`, `analyse-projet` et `sonarqube`. Le changement couvre les dossiers, les manifestes, les points d'entrée, les citations (`java:Dn.INV-k`), les référentiels inclus (`references/java.md`, `references/angular.md`) et les dossiers de matérialisation (`.skills/java/`, …). Motif : une nouvelle notion d'expertise sera définie ensuite.
- Correctifs, sans dimension ni invariant modifié : **java 1.1.1**, **angular 1.0.1**, **analyse-projet 1.0.2**, **sonarqube 1.0.2** ; **socle-back-front 1.0.1**, dont la liste des skills qui l'incluent est complétée de `sonarqube` et `agent-tdd-jira` ; **agents-paralleles-gitlab 1.0.1** (module `distribution`) ; **agent-tdd-jira 1.2.1** (référentiels renommés). Épinglages remontés en conséquence, versions précédentes archivées.
- **sonarqube 1.0.2** précise la notation : `java:Dn.INV-k` désigne un invariant du référentiel `java`, `java:Snnnn` une règle SonarQube.
- `README.md`, `EVOLUTION.md` et les commentaires des outils emploient les nouveaux noms ; le glossaire est régénéré.
- Inchangés, parce qu'ils sont des traces : les archives, les transmissions antérieures et les entrées plus anciennes de ce journal et des journaux de révision, qui gardent les anciens noms.
- Décisions ratifiées (pull request n° 3) : noms sans préfixe ; montée en correctif (`EVOLUTION.md`, section 4, point 2), le renommage n'ajoutant aucune dimension ; anciens noms conservés dans l'historique.

### 2026-10-21 : agent-tdd-jira 1.2.0

- **agent-tdd-jira 1.2.0** : dimension D10 active, US et critères d'acceptation numérotés ; module `us-criteres`. L'analyse établit d'abord les US et leurs critères d'acceptation, repris du ticket avec leur provenance ou proposés, y rattache les exigences, puis décline chaque critère en au moins un scénario Gherkin. Identifiants stables `<CLÉ>-USnn` et `<CLÉ>-CAnn`, fichier `docs/demandes/<CLÉ>/us.md`, étiquette `@<CLÉ>-CAnn` sur chaque scénario (point d'extension E4), validation au point V2, matrice, rapport final et projet de commentaire Jira par critère. Invariants D10.INV-1 à D10.INV-7, aucun invariant existant modifié ; D2 et D6 dépendent de D10. Archive 1.1.0.
- Décision du développeur : « CA puis Gherkin, toujours ». Chaque critère d'acceptation est décliné en scénarios Gherkin, y compris quand le ticket ne contient que des critères ; aucun scénario sans critère.
- Décisions ratifiées (pull request n° 2) : numérotation des US et des critères sur toute la demande, jamais renumérotée ; fichier `us.md` versionné avec les autres fichiers de la demande ; validation des US et des critères intégrée au point V2, sans point de validation supplémentaire ; point d'extension E4 pour le futur rapport d'acceptation d'Agent2Test, un verdict par critère.

### 2026-10-20 : agents-paralleles-gitlab 1.0.0, agent-tdd-jira 1.1.0

- **agents-paralleles-gitlab 1.0.0** : kit de travail en parallèle sur un dépôt GitLab, une demande Jira par worktree. Dépôt nu partagé, branche sans amont, hooks communs (`pre-commit`, `commit-msg`, `pre-push`), script `agt` (`new`, `ls`, `diff`, `collisions`, `sync`, `reset`, `done`), push rules dans `regles-gitlab.txt`, fiche des garde-fous GitLab par édition, recette `recette.sh` de 44 contrôles sans réseau. Modules `isolation`, `hooks`, `orchestration`, `gitlab`, `distribution`, `recette` ; `controle-gitlab` (D6, contrôle par l'API en lecture seule) et `tension-depot` (D7, tension au niveau du dépôt) réservés. 20 invariants, points d'extension E1 et E2. Code de référence testé sur une copie du dépôt Agent2Prompt (git 2.43, bash 5.2), contre-épreuve comprise ; issu du tutoriel « Agents de code en parallèle » v2.
- **agent-tdd-jira 1.1.0** : dimension D9 active, travail dans un worktree géré, en parallèle d'autres demandes ; module `parallele`. Point d'entrée d'agents-paralleles-gitlab 1.0.0 inclus comme référentiel. Invariants D9.INV-1 à D9.INV-7, aucun invariant existant modifié ; en mode parallèle, l'agent ne pousse plus du tout. Archive 1.0.0.
- Décisions ratifiées (pull request n° 1) : fusion des merge requests par merge commit, sans squash ; aucun jeton GitLab pour les agents, la publication revient au développeur ; skill de l'agent matérialisé une seule fois, hors des worktrees ; rebase tant que la branche n'est pas publiée, fusion ensuite ; commit à clé seule hors scénario (`<CLÉ> : …`) ; points chauds par défaut : contrat, migrations, sécurité, fichiers de dépendances.

### 2026-10-16 : agent-tdd-jira 1.0.0, expert-java 1.1.0, correctifs 1.0.1

- **agent-tdd-jira 1.0.0** : agent de développement TDD. Entrée : une demande Jira (Cloud ou Data Center) enregistrée en MHTML. Parcours à cinq points de validation : ingestion et extraction (script Node sans dépendance, testé sur des MHTML Cloud et Data Center synthétiques), analyse avec commentaires et questions, scénarios Gherkin en français étiquetés `@CLÉ-Snn`, analyse d'impact, variantes back Java et front Angular par scénario, cycle rouge, vert, remanié scénario par scénario, matrice de traçabilité et projet de commentaire Jira. Modules `ingestion-jira`, `analyse-demande`, `impact`, `variantes`, `cycle-tdd`, `tracabilite` ; `binome-agent2test` (D7) et `connecteur-jira` (D8) réservés. 24 invariants, points d'extension E1 à E3. Socle 1.0.0, expert-java 1.1.0 et expert-angular 1.0.0 inclus comme référentiels.
- Décisions ratifiées : cycle TDD complet après choix des variantes ; scénarios en Gherkin ; Jira Cloud et Data Center.
- **expert-java 1.1.0** : migrations Flyway ou Liquibase (point d'extension E5). D4.INV-1 reformulé sur les garanties communes, sans affaiblissement. Archive 1.0.0.
- **expert-analyse-projet 1.0.1** et **expert-sonarqube 1.0.1** : correctifs, référence et référentiel expert-java montés en 1.1.0. Archives 1.0.0.

### 2026-10-16 : expert-sonarqube 1.0.0

- **expert-sonarqube 1.0.0** : SonarQube Server 2026.1 LTA et 2026.5 LTA, édition Developer ou supérieure, GitLab CI. Quatre missions : configurer l'analyse et la CI, trier et interpréter, corriger ou planifier, gouverner la qualité. Modules `cadrage-acces`, `configuration-analyse`, `triage`, `correction`, `gouvernance`, `rapport` ; `agents-sonar` (D7, serveur MCP et agents Sonar) et `conformite` (D8, rapports WCAG, OWASP, CRA) réservés. 22 invariants, points d'extension E1 à E3.
- Inclus et épinglés : socle 1.0.0, points d'entrée d'expert-java 1.0.0 et d'expert-angular 1.0.0 comme référentiels d'invariants pour les corrections directes.
- Décisions ratifiées : instance Server 2026.x Developer ou supérieure ; les quatre missions ; correction directe ou plan, au choix ; accès par le jeton du compte Sonar, lecture libre et écriture soumise à validation explicite.
- Évolutions de SonarQube 2026.5 prises en compte : Security Hotspots dépréciés au profit des Security Issues (traités sous une catégorie unique, point E3), Node.js 20 non pris en charge par les scanners JS/TS, PostgreSQL 15 requis pour l'instance.
- `tools/verifier.mjs` : seuls les identifiants du socle sont importés depuis les fichiers partagés, pour qu'un référentiel inclus ne masque pas une faute sur un invariant local.

### 2026-10-16 : socle-back-front 1.0.0, expert-java 1.0.0, expert-angular 1.0.0, expert-analyse-projet 1.0.0

- **socle-back-front 1.0.0** : contrat OpenAPI 3.1 comme source de vérité, erreurs RFC 9457 avec `code` et `traceId`, formats de données et pagination, sécurité de la frontière, traçabilité, accessibilité et messages. Dimensions SC1 à SC6 actives, SC7 (événements asynchrones) réservée. Non transmissible seul.
- **expert-java 1.0.0** : Java 21, Spring Boot 3.5, PostgreSQL. Modes produire et relire. Modules `architecture`, `langage`, `api-rest`, `persistance`, `securite`, `tests`, `revue` ; `migration-boot4` réservé (D8). Points d'extension E1 à E4.
- **expert-angular 1.0.0** : Angular 20. Modes produire et relire. Modules `architecture`, `composants`, `donnees-http`, `formulaires`, `routage-securite`, `accessibilite`, `tests`, `revue` ; `migration-angular22` (D9) et `bff-node` (D10) réservés. Points d'extension E1 à E5.
- **expert-analyse-projet 1.0.0** : analyse en lecture seule, trois livrables au choix (`cartographie`, `rapport`, `plans`). Modules `cadrage`, `cartographie`, `evaluation`, `rapport`, `plans-action` ; `delta` réservé (D6). Points d'extension E1 à E3 (identifiants stables, annexe `analyse.json`, versions enregistrées).
- Décisions ratifiées : les experts produisent et relisent ; versions cibles Java 21, Spring Boot 3.5, Angular 20 ; l'analyste laisse le développeur choisir son livrable ; skills autonomes avec un socle commun.
- Point d'attention consigné dans les skills : la branche Spring Boot 3.5 n'a plus de support open source depuis le 30 juin 2026, et Angular 20 arrive en fin de support long terme vers la fin novembre 2026. Les migrations correspondantes sont les dimensions réservées D8 (Java) et D9 (Angular).

## Documents

### 2026-11-01 : présentation « L'IA, un investissement mesurable », changement de paradigme

- **`docs/presentation-valeur-ia/`** : deux diapositives et deux sections pour illustrer le changement de paradigme, à la demande du développeur.
  - « Un changement de paradigme » : sans méthode, une seule question, « Quel code ferme ce ticket ? » ; avec la méthode, trois questions posées avant d'écrire la moindre ligne (vers quel état l'application doit passer, ce qui ne doit pas bouger, comment le prouver), et les rôles de l'IA et des équipes qui changent avec elles.
  - « D'un état validé au suivant » : un ticket fait passer l'application d'un état validé au suivant en quatre pas (qualifier, modéliser, transformer, prouver) ; ce qui change, ce que le ticket demande et seulement cela ; ce qui ne bouge pas, les invariants du projet.
  - PowerPoint : dix-huit diapositives ; une section « Le changement de paradigme » réunit les deux nouvelles et « Ce qui change dans un ticket » ; le renvoi de l'annexe B vise désormais les diapositives 12 et 13.
  - Markdown : quinze sections ; la liste des questions passe de « Ce qui change dans un ticket » à la section 5.
- Vérifications : PowerPoint validé, rendu et relu diapositive par diapositive ; schéma Mermaid rendu ; invariants cités en exemple confrontés au socle back-front et au modèle des invariants d'`orchestrateur-c7e` ; aucun nom de client ni de mission.
- Décisions ratifiées (pull request n° 34) :
  - la section « Le changement de paradigme » du PowerPoint, qui reprend « Ce qui change dans un ticket » ;
  - les invariants cités en exemple : contrat d'API et format des erreurs, pagination, sécurité, accessibilité, migrations réversibles.

### 2026-11-01 : mode d'emploi de l'orchestrateur C7E, compléments

- `docs/orchestrateur-c7e/mode-emploi.md`, compléments à l'installateur et à la version 3.2.1 :
  - § 1 : un clone d'Agent2Prompt pour l'installateur ; les deux dépôts en jeu, Agent2Prompt et celui du projet ; le rôle du dossier `transmissions/` ;
  - § 2 : mettre à jour le skill (`git pull`, puis la même commande, `--liste`, `--forcer`) et le retirer ;
  - § 3 : ces fichiers appartiennent au dépôt du projet ; colonne du modèle de chaque fichier dans le skill ; ligne de la fiche de transformation ; chemin de la commande d'extraction en chargement au choix ;
  - § 5.2 : ce que livre l'activation, aligné sur le § 11.4 du skill ;
  - § 10 : trois lignes de dépannage (skill collé par l'IA, fichiers changés, fichier de `docs/c7e/` introuvable).
- Motif : un fichier de `docs/c7e/` cherché dans Agent2Prompt, et le rôle de `transmissions/`, qui n'étaient pas expliqués.

### 2026-10-31 : mode d'emploi de l'orchestrateur C7E

- **`docs/orchestrateur-c7e/mode-emploi.md`** : installer `orchestrateur-c7e` 3.1.0 dans un projet et le faire appeler au lancement de Gemini CLI, selon deux modes :
  - A, toujours actif : le fichier de démarrage importe le skill et le fichier d'invariants ;
  - B, au choix : le skill installé comme skill de Gemini CLI, chargé seulement s'il est activé ; un menu au démarrage et une commande `/c7e:<modèle>` par modèle méso, rangé dans `docs/c7e/meso/`.
- Aussi : la déclaration du fichier de démarrage dans `context.fileName`, les vérifications (`/skills list`, `/memory show`, `/commands list`), l'usage quotidien, les limites connues et un tableau de dépannage.
- Compatible avec la version 3.1.0, sans la modifier : l'emplacement du skill est laissé au développeur par l'en-tête, et le modèle méso choisi tient lieu du fichier d'invariants pour la session.
- Vérifications : comportements de Gemini CLI confrontés à sa documentation (fichiers de contexte, imports, skills, commandes personnalisées) ; schéma Mermaid rendu ; liens du dépôt valides.
- Décisions ratifiées (pull request n° 24) :
  - le mode B comme mode recommandé dès qu'il y a plusieurs modèles méso ;
  - les emplacements `.gemini/skills/orchestrateur-c7e/` et `docs/c7e/meso/<modèle>.md` ;
  - des registres communs à tous les modèles, chaque entrée nommant son modèle.

### 2026-10-31 : présentation « L'IA, un investissement mesurable »

- **`docs/presentation-valeur-ia/`**, remaniée :
  - titre et argumentaire centrés sur l'investissement et sa contrepartie, sans nommer l'objection du client ;
  - la diapositive et la section de définition retirées, avec leur source : seize diapositives, treize sections ;
  - dans le Markdown, un schéma de la boucle de l'investissement accompagne le message ;
  - un thème clair : fond blanc sur toutes les diapositives, tons bleus, la valeur nette en bleu pâle sous le seuil et en bleu soutenu au-dessus.
- Vérifications : aucune mention de l'objection dans le texte, les notes et les métadonnées ; schémas Mermaid rendus ; PowerPoint validé et relu diapositive par diapositive.
- Décisions ratifiées (pull request n° 22) :
  - le titre « L'IA, un investissement mesurable » ;
  - le retrait de la diapositive de définition ;
  - l'entrée de la première version, reformulée pour que le dépôt ne nomme plus l'objection.

### 2026-10-31 : présentation de la valeur de l'IA, première version

- **`docs/presentation-valeur-ia/`** : une présentation qui justifie auprès d'un client la valeur de l'IA dans le développement de ses applications, quand il doute de sa contrepartie. Deux formats :
  - `presentation-valeur-ia.md`, avec cinq schémas Mermaid ;
  - `presentation-valeur-ia.pptx`, dix-sept diapositives avec notes du présentateur.
- Argumentaire :
  - une diapositive de définition, retirée dans la version suivante ;
  - les constats publics qui fondent la prudence du client (MIT NANDA, Gartner, METR), et ce qui distingue les projets qui créent de la valeur (MIT NANDA, les sept capacités de DORA 2025) ;
  - la contrepartie de chaque ticket, ce qui reste dans les dépôts du client et les garde-fous, repris d'`orchestrateur-c7e` 3.1.0 ;
  - un seuil de rentabilité calculé sur des hypothèses données en exemple, la valeur nette selon le gain mesuré, un protocole de mesure et un pilote avec règle d'arrêt.
- Vérifications :
  - le calcul du seuil et des scénarios, rejoué ;
  - chaque chiffre public, confronté à sa source, listée en annexe ;
  - les schémas Mermaid, rendus ;
  - le PowerPoint, validé et relu diapositive par diapositive ;
  - aucun nom de client ni de mission.
- Décisions ratifiées (pull request n° 20) :
  - un dossier `docs/` pour les documents qui ne sont pas des spécifications, hors du vérificateur ;
  - les hypothèses du seuil (journée à 600 €, licence à 50 €, 15 jours de mise en place, équipe de cinq), à remplacer par les chiffres réels ;
  - la publication, dans ce dépôt public, d'un argumentaire destiné à un client, sans nom de client ni de mission.

## Outils

### 2026-11-24 : recette de l'orchestrateur C7E

- **Workflows** : `recette-orchestrateur-c7e.yml`, nouveau, Linux et Windows, Node 22 et 24 : la recette de l'export de l'orchestrateur, qui suit aussi le socle d'observation, l'export du générateur et le champ de l'arbre d'exemple, les spécifications dont elle cite les invariants et l'outil de transmission. La recette de l'observatoire suit aussi l'orchestrateur et le référentiel Java, dont ses instances d'épreuve exportent ou citent les invariants.

### 2026-11-24 : propositions de l'observatoire vérifiées

- **`tools/verifier.mjs`** : chaque proposition de `observatoire/propositions/` suit le format `observatoire.proposition/1`, lu par l'outil de la spécification `observatoire` ; le magasin local de l'observatoire reste sur le poste, hors de la vérification. Vérification : une proposition à clé inconnue et sans ses clés requises, relevée.
- **`tools/installer.mjs`**, **`installer.mjs`** : `observatoire` ne s'installe qu'au niveau utilisateur, comme `analyse-projet` : il observe plusieurs projets depuis le clone, sans écrire dans aucun. Recettes de l'installateur à jour.
- **Workflows** : `recette-observatoire.yml`, Linux et Windows, Node 22 et 24 ; la recette du générateur suit aussi le socle d'observation, qu'il inclut.

### 2026-11-24 : préfixe SO des invariants du socle d'observation

- **`tools/verifier.mjs`** : les identifiants `SOn.INV-k` sont reconnus dans les définitions, les citations et les citations préfixées par un nom de spécification, comme `Dn.INV-k` et `SCn.INV-k`. Un identifiant `SO` cité sans définition était jusqu'ici ignoré.
- **`tools/glossaire.mjs`** : dimensions et invariants `SO` lus comme ceux des autres espaces ; notations `SOn`, `OCn` et `Nn` dans « Lire un identifiant ». Glossaire régénéré, 670 invariants, inchangés.
- Vérifications : trois défauts introduits volontairement, tous relevés : `SO1.INV-1` cité sans définition, et `socle-observation:SO1.INV-1` cité sans le socle, que la version précédente laissait passer ; glossaire non régénéré.

### 2026-11-24 : ordres cybernétiques

- **`EVOLUTION.md`, section 10 « Ordres cybernétiques »** : le vocabulaire commun des ordres cybernétiques, `OC1` à `OC3`, et des niveaux d'observation, `N1` à `N3`, à ne jamais confondre ; le troisième ordre défini par trois couplages, entre systèmes, entre description et pratique, avec les valeurs ; la correspondance avec les termes des spécifications ; cinq règles, dont la première : un troisième ordre ne s'obtient jamais par un niveau d'observation de plus.
- Section 2 : `OC` et `N`, suivis d'un chiffre, réservés à ces notations ; aucune unité ne les prenait.
- `README.md` : renvoi à la section 10.
- Aucune spécification modifiée : versions, transmissions et glossaire inchangés. Aucune dimension du troisième ordre n'est active : le dépôt reste au second ordre, à ses deux échelles.
- Décisions ratifiées avant la rédaction : le troisième ordre défini par les trois couplages ; les notations `OC1` à `OC3` et `N1` à `N3`, les formats publiés gardant leurs noms.
- Décisions ratifiées (pull request n° 71) : la rédaction de la section 10, ses cinq règles et la table des correspondances, telles que proposées.

### 2026-11-17 : installateur de la racine, historique caché à Gemini CLI

- **`installer.mjs`**, à la racine du dépôt, avec **`installer.cmd`** (ASCII, pour CMD) : installe ou met à jour dans Gemini CLI tous les skills installables et les agents qu'ils portent, au niveau utilisateur par défaut (`~/.gemini/`), ou d'un projet (`--workspace`).
  - Skills : chacun depuis sa transmission courante, comme `tools/installer.mjs`. Un skill intact se met à jour en place, et les fichiers ajoutés depuis son installation restent ; une mise à jour interrompue se reprend.
  - Agents et commandes : `capteur-sprint`, `explicateur-hote` et ses commandes `/hote:*`, `memoire-appli`, copiés dans `agents/` et `commands/`. La copie s'adapte à Gemini CLI, comme le demandent leurs modules : outils nommés comme Gemini CLI dans l'en-tête, description entre guillemets, chemin du skill installé ; le fichier du skill ne change pas. Leurs empreintes sont tenues dans `agent2prompt/installation.json`.
  - Changements locaux : un skill, un agent ou une commande changé depuis son installation reste tel quel ; sa nouvelle version est déposée dans `agent2prompt/a-fusionner/`, avec ses écarts, et `--fusionne <nom>` en fait la base une fois la fusion faite. `--forcer` remplace, après une sauvegarde dans `agent2prompt/sauvegardes/`.
  - `--liste`, `--retirer` (ce qui est intact ; les fichiers ajoutés restent), `--essai`. Au niveau d'un projet, tout est masqué à Git.
- **`tools/installer.mjs`** : un skill installé porte aussi les fichiers qu'il tire de ses modules, ceux de la table `attendu` de sa commande d'extraction, contrôlés par leur empreinte (capture-sprint-jira, explication-hote-ia, skill4appli, sonarqube) ; ses fonctions servent à l'installateur de la racine.
- **`.geminiignore`** à la racine : Gemini CLI ne lit plus l'historique figé, les archives des versions publiées et les quinze anciennes transmissions qui citent un autre hôte d'IA. Elles restent telles que publiées. Une ligne de ce journal, la seule à le citer, est reformulée.
- **`tools/verifier.mjs`** : les noms d'un autre hôte d'IA et de son éditeur ne figurent dans aucun fichier suivi hors de cet historique, et `.geminiignore` ne cache aucune version courante.
- Vérifications : recette de `tools/installer.mjs` (18 tests) et de `installer.mjs` (14 tests) sous Linux et Windows ; contrat avec `@google/gemini-cli-core` 0.66.0 : skills découverts et lisibles, trois sous-agents chargés sans erreur, avec les outils de Gemini CLI, et, dans le dépôt, l'historique caché par `.geminiignore` sans qu'aucune version courante le soit.

### 2026-11-17 : vérificateur en fins de ligne CRLF

- `tools/verifier.mjs`, `tools/bundle.mjs` et `tools/glossaire.mjs` lisent les fichiers en fins de ligne Unix, comme l'installateur. Sur une extraction en CRLF, celle de Git sous Windows avec `core.autocrlf`, le vérificateur relevait 104 erreurs pour les 15 spécifications : frontmatters illisibles, versions épinglées introuvables, invariants partagés non importés, transmissions dites infidèles, glossaire dit périmé. Il passe désormais, et `bundle.mjs` y redonne les mêmes transmissions. Rien ne change sur une extraction en LF : aucune transmission, aucun glossaire n'est modifié.
- `.github/workflows/verifier.yml` : la même vérification sur une extraction en CRLF, faite dans un worktree à part, sans toucher à l'extraction du dépôt ; sans la correction, elle échoue.
- Défaut relevé par la revérification de generateur-skill-ticket 1.1.0, antérieur à elle ; corrigé à part du correctif 1.1.1.

### 2026-11-01 : installateur des skills dans Gemini CLI

- Ajout de `tools/installer.mjs` : il installe un skill du dépôt dans Gemini CLI à partir de sa transmission et fait l'étape 0 de la consigne sans IA. Node 20 ou plus récent, modules natifs, git pour le masquage.
  - Cible : `.gemini/skills/<skill>/` du workspace, ou `~/.gemini/skills/` avec `--utilisateur` (`GEMINI_CLI_HOME` respecté). Le skill se désigne par son nom, `<skill>@<version>` ou un fichier de transmission ; `--tous`, `--liste`, `--retirer`, `--essai`.
  - La transmission est relue par `relire` (CRLF compris), et chaque fichier vérifié contre la table d'intégrité avant toute écriture ; un chemin qui sortirait du dossier est refusé.
  - Le dossier reçoit les fichiers transmis, `CONSIGNE.md` (l'en-tête de la transmission) et `integrite.sha256`. Une version installée est remplacée d'un bloc ; refus si des fichiers ont changé depuis l'installation, sauf `--forcer` ; un dossier que l'outil n'a pas installé est protégé.
  - Masquage dans un dépôt Git : exclusion locale (`info/exclude`, commune aux worktrees, gardée tant qu'un autre worktree a le skill) et négations dans `.geminiignore`, lui-même exclu. `--visible` laisse le skill dans `git status`. Si `.geminiignore` est versionné, le skill n'est pas masqué et un avertissement donne les lignes à y ajouter.
  - Refusés : les systèmes à construire (`agent2dev`, `agent2test`, `tension-dashboard-gitlab-agent`), matérialisés dans `spec/` de leur propre projet. `analyse-projet` ne s'installe qu'au niveau utilisateur.
- Constats sur Gemini CLI, lus dans son code (`skillLoader.ts`, `skillManager.ts`, `activate-skill.ts`, `read-file.ts`, `gitIgnoreParser.ts`) et reproduits avec `@google/gemini-cli-core` 0.66.0 :
  - seuls `SKILL.md` et `*/SKILL.md` d'un dossier de skills sont découverts, et seuls `name` et `description` du frontmatter sont lus : les modules d'un skill ne deviennent pas des skills ;
  - l'activation livre le corps du `SKILL.md` et la liste des fichiers du dossier ; les autres fichiers se lisent ensuite par l'outil de lecture ;
  - les skills du workspace ne sont chargés que si le dossier est de confiance, quand la confiance des dossiers est activée ;
  - l'outil de lecture refuse les fichiers qu'excluent `.gitignore` et `.git/info/exclude` d'un clone ordinaire, mais pas ceux de l'exclusion commune d'un worktree ni de l'exclusion globale de Git ; une négation dans `.geminiignore` rend un fichier exclu de nouveau lisible, à condition de nier chaque niveau de dossier exclu.
- Conséquence : un skill matérialisé dans `.skills/` ou `.gemini/skills/` d'un clone ordinaire et exclu par `.git/info/exclude`, comme le prévoient le § 11.3 et l'étape 0 de l'orchestrateur C7E 3.2.0, ne livre que son `SKILL.md` ; ses modules sont refusés. Le mode d'emploi de C7E passe désormais par l'installateur et donne les négations à poser à la main ; la spécification reste à corriger.
- Recette : `tools/installer.test.mjs`, 17 tests en boîte noire, dans des dépôts Git temporaires. 10 contre-épreuves sur des copies de l'outil (négations absentes, CRLF, chemins, empreintes, changements locaux, worktrees, systèmes, sous-dossier, dossier non géré, remplacement), toutes détectées.
- `.github/workflows/recette-installer.yml` : la recette sous Linux et Windows, Node 20 et 24, et un contrat avec le code de Gemini CLI (`.github/scripts/contrat-gemini.mjs`). Le contrat installe les huit skills installables et `analyse-projet` dans un projet où `/.gemini/skills/` était déjà exclu. Chaque skill est découvert une fois, nom et description lus tels quels, et tous ses fichiers sont lisibles. `node_modules` reste ignoré.
- `README.md` : section « Installer un skill dans Gemini CLI ». `docs/orchestrateur-c7e/mode-emploi.md` : installation par l'outil, masquage lisible, deux lignes de dépannage.
- Décisions ratifiées (pull request n° 27) :
  - un utilitaire déterministe plutôt qu'un agent : l'IA ne fait que les étapes qui suivent l'étape 0, à partir de `CONSIGNE.md` ;
  - le workspace par défaut ; `analyse-projet` au niveau utilisateur seulement ; les systèmes à construire refusés ;
  - le masquage par exclusion locale et négations dans `.geminiignore`, plutôt que l'exclusion globale de Git ou un skill versionné ;
  - deux fichiers ajoutés au dossier du skill, hors transmission : `CONSIGNE.md` et `integrite.sha256`.

### 2026-10-21 : citations entre skills vérifiées

- `tools/verifier.mjs` vérifie aussi les identifiants d'un autre skill, cités sous la forme `java:D4.INV-2` : chacun doit être défini dans le point d'entrée du skill qu'il nomme, et ce skill doit exister dans le dépôt. Jusqu'ici, ces identifiants n'étaient pas vérifiés. Les 107 citations de ce type que contient le dépôt sont toutes définies.
- Testé par deux contre-épreuves de plus, soit 16 sur des copies du dépôt : un invariant d'un autre skill absent, un préfixe qui ne nomme aucun skill du dépôt.
- `EVOLUTION.md`, section 7 : deux versions qui se référencent l'une l'autre ne passent le vérificateur qu'ensemble, et se publient donc dans un même commit, avec leurs deux transmissions ; section 8 : le vérificateur contrôle les identifiants préfixés.
- Motif : le binôme entre agent-tdd-jira et Agent2Test repose sur des invariants cités d'une spécification à l'autre.

### 2026-10-21 : vérificateur étendu et vérification des pull requests

- `tools/verifier.mjs` contrôle aussi :
  - la transmission de la version courante de chaque spécification, qui doit redonner exactement l'en-tête, les fichiers et la table d'intégrité ;
  - le README : version de chaque spécification dans le tableau et dans le schéma, liens vers `specs/` et `transmissions/` ;
  - les archives : une par version précédente déclarée, à la bonne version, aucune archive non déclarée ;
  - les points d'extension du manifeste, face à ceux du point d'entrée ;
  - le registre des dimensions, face aux statuts des modules dans le manifeste.
- Testé par 14 contre-épreuves sur des copies du dépôt, chacune refusée avec le message attendu ; le dépôt intact passe.
- `tools/bundle.mjs` exporte `assembler` et `relire`, dont se sert le vérificateur ; les transmissions produites ne changent pas, sauf la consigne de la table d'intégrité, à vérifier « depuis le dossier où les fichiers ont été matérialisés » au lieu de `spec/`. La correction vaut pour les transmissions des prochaines versions : celles déjà publiées restent telles quelles.
- `.github/workflows/verifier.yml` : le vérificateur tourne à chaque pull request et à chaque push sur `main`, sous Node 20 et Node 24.
- `EVOLUTION.md`, section 7 : README mis à jour avec le journal, transmission régénérée avant la vérification, une version par commit, transmission comprise ; la transmission d'une version publiée n'est jamais régénérée.

### 2026-10-21 : glossaire des invariants

- Ajout de `tools/glossaire.mjs` : génère `glossaire.md`, qui détaille les 180 invariants des huit spécifications (dimension, énoncé, modules qui les reprennent, spécifications qui les citent) et la notation des identifiants. Node 20 ou plus récent, modules natifs.
- `tools/verifier.mjs` échoue si `glossaire.md` est absent ou ne correspond plus exactement aux spécifications. Testé sur trois défauts introduits volontairement : invariant modifié sans régénération, glossaire retouché à la main, glossaire absent.
- `EVOLUTION.md` : régénération du glossaire dans la procédure de publication et dans l'ajout d'une spécification.

### 2026-10-16 : fichiers partagés et vérificateur

- `tools/bundle.mjs` gère les fichiers partagés (`shared`, version épinglée vérifiée), les références entre skills (`references`, version vérifiée) et refuse une spécification `"transmissible": false`. Transmission de `tension-dashboard-gitlab-agent` 2.2.0 inchangée, octet pour octet.
- Ajout de `tools/verifier.mjs` : contrôle structurel de toutes les spécifications (manifestes, versions, modules, épinglages, références, blocs de code, invariants définis et cités). Testé sur six défauts introduits volontairement, tous détectés.
- `EVOLUTION.md` : nouvelles unités (fichier partagé, référence), section « Fichiers partagés et références », vérification automatisée dans la procédure de publication.

## tension-dashboard-gitlab-agent

### 2026-10-16 : outil de transmission en Node

- `tools/bundle.py` est remplacé par `tools/bundle.mjs` (Node 20 ou plus récent, modules natifs uniquement), cohérent avec la chaîne Node et Angular du projet. La sortie est identique octet pour octet à celle de la version Python.

### 2026-10-16 : transmission texte

- Ajout de `tools/bundle.py` (remplacé depuis par `tools/bundle.mjs`) : assemble une spécification modulaire en un texte unique, avec table d'intégrité sha256 et vérification de l'aller-retour.
- Ajout de `ENTETE-TRANSMISSION.md` : consigne pour l'IA du développeur (matérialiser `spec/`, lire, planifier, implémenter par étapes en commençant par le noyau).
- Première transmission : `transmissions/tension-dashboard-gitlab-agent-2.2.0.md`.
- Décision : seul du texte est transmis ; l'IA construit elle-même le package et le code. Le prompt d'amorçage intermédiaire, qui supposait un dossier joint, est remplacé par cet en-tête et n'a pas été versionné.

### 2.2.0 (2026-10-16) : package modulaire

- `SKILL.md` racine, `manifest.json` et six modules actifs : `tension`, `etats`, `verdict-journal`, `messagerie`, `dashboard`, `effecteur-gitlab`. Schémas Mermaid dans chaque module.
- Ratifié : table `confirm_tokens` dans la migration 1 (seul le HMAC du jeton est stocké) ; structure modulaire conservée.
- Point d'extension E6 (chargement piloté par le manifeste). Événements `EXECUTION_REFUSED` et `PIPELINE_RETRY`. Scénarios de l'effecteur renommés `G1` à `G10`.

### 2.1.0 (2026-10-16) : registre des dimensions

- Registre D1 à D10, contrat de version, 17 invariants `Dn.INV-k`, points d'extension E1 à E5.
- Dimension D7 active : client d'arbitrage signé `tension-arbitrer`.
- Corrections : le stash ne protège pas les fichiers gelés (pré-vérification à l'étape 0) ; statut réel du tracker (`git fetch` écrit les refs de suivi) ; seuil de volatilité paramétré ; `testCmd` sans shell ; compteur de relances persisté.
- `regulation-inter-agents.md` : dimensions D8 à D10 réservées à la 3.0 (communication directe entre agents, méta-niveau borné, rapport de couplage).

### 2.0.0 (2026-10-15) : spécification monolithique

- Agent de surveillance des fichiers sous tension, effecteur GitLab à garde-fous, tableau de bord en lecture seule.
- Décisions ratifiées : seuil de 300 caractères cumulés par fichier depuis l'ancêtre commun ; critère « stable » fondé sur l'absence de chevauchement ; SQLite ; messages signés HMAC ; cycle 7E ; clause de second ordre (verdict et action du développeur journalisés).

### 1.0 : document initial

- Spécification d'intention fournie par Fred (PDF), non versionnée dans ce dépôt. Elle a servi de base à l'analyse qui a conduit à la 2.0.0.
