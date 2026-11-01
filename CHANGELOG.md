# Journal des modifications

Les détails de chaque version figurent dans le journal de révision du `SKILL.md` de la spécification concernée. Ce fichier en donne la vue d'ensemble, dans l'ordre chronologique inverse.

## Socle et experts back-front

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
  - **Lancement** : fichier de contexte de l'IA locale avec les imports `@` de Gemini CLI (`GEMINI.md`, ou `README.md` nommé dans `context.fileName`) et de Claude Code, y compris dans la disposition du kit.
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
- Soumis à ratification :
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
