# Glossaire des invariants

Ce fichier détaille chaque invariant de chaque spécification du dépôt : son identifiant, la dimension qui le porte, son énoncé, et où il est repris. Il est généré par `node tools/glossaire.mjs` à partir des points d'entrée et des modules de `specs/`, archives exclues. Ne pas le modifier à la main : `node tools/verifier.mjs` signale un glossaire qui n'est plus à jour.

## Lire un identifiant

| Forme | Désigne | Exemple |
|---|---|---|
| `Dn` | dimension n d'une spécification : un axe, avec ses invariants et ses tests | `D4` de `tension-dashboard-gitlab-agent` : effecteur GitLab à garde-fous |
| `Dn.INV-k` | invariant k de la dimension n : une propriété qui doit toujours tenir, vérifiée par au moins un test ou un contrôle | `D4.INV-3` : la procédure n'emploie ni `--force` ni `--force-with-lease` |
| `SCn`, `SCn.INV-k` | dimension et invariant du socle back-front, inclus à l'identique dans plusieurs skills | `SC1.INV-2` : aucun changement cassant dans une version d'API publiée |
| `SOn`, `SOn.INV-k` | dimension et invariant du socle d'observation : l'enveloppe commune des observations, référencée ou incluse par les systèmes qui les exportent | `socle-observation:SO3.INV-1` : aucune enveloppe ne porte de texte libre |
| `SAn`, `SAn.INV-k` | dimension et invariant du socle de l'acceptable : le noyau commun de ce que tous les systèmes refusent, référencé par ceux qui le prévoient, inclus par ceux qui l'appliquent ; un refus cite sa règle | `socle-acceptable:SA2.INV-2` : aucun agent, kit compris, ne pousse en force |
| `<spécification>:Dn.INV-k` | invariant d'une autre spécification, cité avec le nom de celle-ci | `java:D4.INV-2` |
| `En` | point d'extension : emplacement réservé, inerte, pour une dimension future | `E2` |
| `OCn` | ordre cybernétique d'une boucle (`EVOLUTION.md`, section 10) : `OC1` régulation, `OC2` observation de l'observation, `OC3` régulation de l'écosystème | `OC2` : la boucle d'évolution du dépôt |
| `Nn` | niveau d'observation dans un système, de `N1` à `N3`, l'humain au-dessus ; un niveau n'est pas un ordre (`EVOLUTION.md`, section 10) | `N3` : l'observateur d'ordre 3 du générateur de skills de ticket |

Un identifiant n'a de sens qu'avec sa spécification : `D6.INV-3` existe dans plusieurs d'entre elles. Statut d'une dimension : `active` (invariants en vigueur et vérifiés), `reserved` (place posée, aucun invariant en vigueur), `superseded` (remplacée). Un invariant ne s'affaiblit jamais ; il peut être remplacé par un invariant plus fort, signalé dans le journal de révision de sa spécification (`EVOLUTION.md`, section 4).

La colonne « Repris dans » cite les modules de la spécification qui reprennent l'invariant, puis, sous la forme `skill/module`, les autres spécifications qui le citent ou qui incluent le socle.

## Sommaire

| Spécification | Version | Dimensions actives | Dimensions réservées | Invariants |
|---|---|---|---|---|
| [`agent-tdd-jira`](#agent-tdd-jira-1311) | 1.3.11 | 9 | 1 | 43 |
| [`agent2dev`](#agent2dev-150) | 1.5.0 | 24 | 2 | 106 |
| [`agent2test`](#agent2test-170) | 1.7.0 | 23 | 2 | 126 |
| [`agents-paralleles-gitlab`](#agents-paralleles-gitlab-101) | 1.0.1 | 5 | 2 | 20 |
| [`analyse-projet`](#analyse-projet-102) | 1.0.2 | 5 | 1 | 16 |
| [`angular`](#angular-101) | 1.0.1 | 8 | 2 | 30 |
| [`capture-sprint-jira`](#capture-sprint-jira-122) | 1.2.2 | 9 | 2 | 39 |
| [`explication-hote-ia`](#explication-hote-ia-110) | 1.1.0 | 10 | 2 | 37 |
| [`generateur-skill-ticket`](#generateur-skill-ticket-150) | 1.5.0 | 10 | 1 | 35 |
| [`java`](#java-111) | 1.1.1 | 7 | 1 | 29 |
| [`observatoire`](#observatoire-170) | 1.7.0 | 13 | 0 | 24 |
| [`orchestrateur-c7e`](#orchestrateur-c7e-387) | 3.8.7 | 11 | 2 | 36 |
| [`scenario-playwright`](#scenario-playwright-168) | 1.6.8 | 17 | 5 | 76 |
| [`skill4appli`](#skill4appli-111) | 1.1.1 | 9 | 3 | 34 |
| [`socle-acceptable`](#socle-acceptable-120) | 1.2.0 | 8 | 0 | 14 |
| [`socle-back-front`](#socle-back-front-110) | 1.1.0 | 7 | 0 | 21 |
| [`socle-observation`](#socle-observation-150) | 1.5.0 | 4 | 0 | 7 |
| [`sonarqube`](#sonarqube-110) | 1.1.0 | 8 | 2 | 34 |
| [`tension-dashboard-gitlab-agent`](#tension-dashboard-gitlab-agent-220) | 2.2.0 | 7 | 3 | 17 |

## agent-tdd-jira 1.3.11

Agent de développement TDD : demande Jira en MHTML, analyse avec commentaires, US et critères d'acceptation numérotés, scénarios Gherkin par critère, variantes back Java et front Angular, cycle rouge, vert, remanié scénario par scénario, traçabilité ; binôme avec Agent2Test, verdict d'acceptation par critère ; mode parallèle dans un worktree géré par agents-paralleles-gitlab. Point d'entrée : [`specs/agent-tdd-jira/SKILL.md`](specs/agent-tdd-jira/SKILL.md).

### D1 : Ingestion d'une demande Jira en MHTML (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D1.INV-1** | le fichier MHTML n'est jamais modifié ; l'extraction travaille en lecture seule et enregistre l'empreinte sha256 de la source. | `ingestion-jira`, `parallele`, `agent2dev`, `agent2dev/cadrage`, `capture-sprint-jira/remise`, `scenario-playwright`, `scenario-playwright/jira` |
| **D1.INV-2** | le résumé de l'extraction (clé, titre, description, nombre de commentaires, pièces, limites) est confirmé par le développeur avant toute analyse. | `ingestion-jira`, `agent2dev`, `agent2dev/cadrage` |
| **D1.INV-3** | toute partie non extraite ou incertaine (commentaires repliés, pièces absentes, page non reconnue) est déclarée comme limite. | `ingestion-jira`, `capture-sprint-jira/capture` |

### D2 : Analyse et scénarios Gherkin (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | chaque scénario cite sa provenance : passage de la description, commentaire (auteur, date) ou réponse du développeur. | `analyse-demande` |
| **D2.INV-2** | une contradiction ou une ambiguïté entre la description et les commentaires devient une question ; elle n'est jamais tranchée par l'agent. | `us-criteres`, `analyse-demande`, `agent2dev`, `agent2dev/cadrage` |
| **D2.INV-3** | chaque scénario est écrit en Gherkin français, porte une étiquette unique `@<CLÉ>-Snn` et au moins une étape `Alors` vérifiable. | `us-criteres`, `analyse-demande`, `scenario-playwright`, `scenario-playwright/jira` |
| **D2.INV-4** | un scénario que la demande n'énonce pas explicitement (cas d'erreur, limite) porte l'étiquette `@propose` et n'est utilisé qu'après validation. | `analyse-demande` |
| **D2.INV-5** | les scénarios sont validés par le développeur avant l'étude des variantes. | `analyse-demande`, `agent2dev/autonomie` |

### D3 : Analyse d'impact back et front (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | l'analyse d'impact ne modifie rien et cite le fichier de chaque élément impacté. | `impact`, `parallele`, `agent2dev`, `agent2dev/conception` |
| **D3.INV-2** | l'impact sur le contrat d'API est qualifié pour chaque scénario : aucun, compatible ou cassant. | `impact`, `agent2dev/conception` |

### D4 : Variantes de réalisation back et front (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D4.INV-1** | pour chaque scénario, l'agent propose des variantes back et front (au moins deux par couche concernée, ou une seule avec la justification de son unicité), ou justifie qu'une couche n'est pas concernée. | `variantes`, `agent2dev/conception` |
| **D4.INV-2** | chaque variante indique les invariants des référentiels et du socle qu'elle engage ; une variante qui en viole un est signalée et n'est jamais recommandée. | `variantes`, `agent2dev`, `agent2dev/conception` |
| **D4.INV-3** | le choix du développeur est consigné avant toute écriture de code. | `variantes`, `agent2dev`, `agent2dev/conception` |
| **D4.INV-4** | la combinaison back et front retenue est compatible avec le contrat publié (SC1.INV-2). | `variantes` |

### D5 : Cycle TDD scénario par scénario (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D5.INV-1** | aucun code de production n'est écrit pour un scénario avant qu'un test étiqueté de ce scénario ait échoué pour la raison attendue. | `cycle-tdd`, `agent2dev`, `agent2dev/noyau`, `agent2dev/apprenant` |
| **D5.INV-2** | la phase verte se limite au code nécessaire pour faire passer le test, et la suite de tests du module concerné reste verte. | `cycle-tdd` |
| **D5.INV-3** | le remaniement ne change pas le comportement, garde toutes les suites vertes et applique les invariants des référentiels. | `cycle-tdd` |
| **D5.INV-4** | un seul scénario est réalisé à la fois, et le suivant ne commence qu'après acceptation du précédent. | `cycle-tdd`, `parallele`, `agent2dev`, `agent2dev/realisation`, `agent2dev/autonomie` |
| **D5.INV-5** | quand un scénario touche le contrat d'API, l'ordre est : contrat, puis back, puis front. | `impact`, `cycle-tdd`, `agent2dev`, `agent2dev/realisation`, `agents-paralleles-gitlab/distribution` |
| **D5.INV-6** | aucune dépendance nouvelle n'est ajoutée sans validation. | `cycle-tdd`, `agent2dev`, `agents-paralleles-gitlab/distribution` |

### D6 : Traçabilité et rapport (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D6.INV-1** | la matrice relie chaque exigence de la demande à au moins un scénario, chaque scénario validé à au moins un test et à un commit, ou à un statut explicite « non réalisé » avec sa raison. | `tracabilite`, `agent2dev`, `agent2dev/tracabilite` |
| **D6.INV-2** | chaque test écrit par l'agent porte l'étiquette de son scénario. | `cycle-tdd`, `tracabilite`, `agent2dev/realisation` |
| **D6.INV-3** | l'agent n'écrit jamais dans Jira ; il fournit un projet de commentaire que le développeur publie lui-même. | `tracabilite`, `parallele`, `agent2dev`, `agent2dev/tracabilite` |
| **D6.INV-4** | le rapport final liste les écarts à la demande, les questions restées ouvertes et le résultat des suites de tests back et front. | `tracabilite` |

### D7 : Binôme avec Agent2Test (tests de bout en bout et d'acceptation) (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D7.INV-1** | le plan remis à Agent2Test est `us.md` et le fichier Gherkin validés à V2 et commités, tels quels ; l'agent n'écrit ni parcours ni fichier d'Agent2Test. | `binome-agent2test`, `agent2dev`, `agent2test/plan` |
| **D7.INV-2** | chaque défaut applicatif confirmé en CP-3 par Agent2Test rouvre le scénario qu'il vise en cycle TDD : un test rouge, étiqueté avec ce scénario, reproduit le défaut avant tout code de production. | `binome-agent2test`, `agent2dev` |
| **D7.INV-3** | la matrice et le rapport final donnent, pour chaque critère d'acceptation, le verdict d'Agent2Test valable pour le plan et le code courants (conforme, non conforme, non vérifié avec son motif), ou « non joué » avec sa raison. | `tracabilite`, `binome-agent2test`, `agent2dev`, `agent2dev/tracabilite`, `agent2test/journal` |
| **D7.INV-4** | l'agent ne démarre, n'arrête ni ne déploie l'application et ne lance aucun batch ; il ne réécrit ni ne conteste lui-même un verdict d'Agent2Test : un désaccord est remonté au développeur. | `binome-agent2test`, `agent2dev`, `agent2dev/profil`, `agent2dev/executant`, `agent2dev/binome` |
| **D7.INV-5** | un scénario qui exige un rôle de l'application porte `@role-<nom>`, directement ou par sa fonctionnalité ; un batch Java, `@batch-<nom>` ; un redémarrage de l'application ou une écriture directe en base, `@redemarrage` ou `@ecriture-base`. | `analyse-demande`, `binome-agent2test` |

### D8 : Connecteur Jira (API ou MCP) à la place du MHTML (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D9 : Travail dans un worktree géré, en parallèle d'autres demandes (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D9.INV-1** | en mode parallèle, l'agent n'écrit que dans le worktree de sa demande ; ses fichiers de travail (demande enregistrée, `demande.json`, images, script d'extraction, `impact.txt`, `rapport.md`) vont dans `travail/`. | `parallele`, `agent2dev/methode`, `agent2dev/depot` |
| **D9.INV-2** | en mode parallèle, l'agent ne pousse pas, ne fusionne pas, ne rebase pas et ne change pas de branche ; il n'emploie ni `--no-verify`, ni `--force`, ni `--force-with-lease`, ni `git config`, ni `git -c`, ni `reset --hard`, ni `stash drop`, ni `stash clear`, ni `branch -D`, ni `git worktree`. | `parallele`, `binome-agent2test`, `agent2dev`, `agent2dev/depot`, `agents-paralleles-gitlab/hooks` |
| **D9.INV-3** | en mode parallèle, chaque commit commence par `<CLÉ> Snn : ` pour un scénario, ou `<CLÉ> : ` hors scénario. | `parallele`, `binome-agent2test`, `agent2dev/depot` |
| **D9.INV-4** | un refus d'un garde-fou du kit arrête l'action en cours ; l'agent le cite au développeur et ne le contourne jamais. | `parallele`, `agent2dev/depot`, `agents-paralleles-gitlab` |
| **D9.INV-5** | à l'étape d'impact, l'agent écrit les chemins impactés dans `travail/<CLÉ>/impact.txt`, un chemin relatif par ligne, et signale dans la fiche ceux qui relèvent d'un point chaud. | `parallele`, `agent2dev/conception`, `agents-paralleles-gitlab/orchestration`, `agents-paralleles-gitlab/distribution` |
| **D9.INV-6** | le skill partagé est vérifié avec la table d'intégrité de la transmission et n'est jamais réécrit. | `parallele`, `agent2dev`, `agent2dev/methode` |
| **D9.INV-7** | après une synchronisation annoncée par le développeur, l'agent relance les suites back et front avant le scénario suivant et signale toute régression. | `parallele`, `agent2dev/depot`, `agent2dev/executant`, `agent2dev/orchestrateur`, `agents-paralleles-gitlab/distribution` |

### D10 : US et critères d'acceptation numérotés (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D10.INV-1** | chaque US porte un identifiant stable `<CLÉ>-USnn` et chaque critère d'acceptation un identifiant stable `<CLÉ>-CAnn`, attribués une fois pour toutes et jamais renumérotés ; un critère appartient à une seule US. | `us-criteres`, `generateur-skill-ticket/assemblage`, `generateur-skill-ticket/documents-kits`, `orchestrateur-c7e` |
| **D10.INV-2** | chaque US et chaque critère d'acceptation cite sa provenance (champ du ticket, passage de la description, commentaire avec auteur et date) ; ce que le ticket n'énonce pas est marqué « proposé » et n'est utilisé qu'après validation à V2. | `us-criteres`, `analyse-demande` |
| **D10.INV-3** | chaque critère d'acceptation énonce un résultat observable et vérifiable ; un critère ambigu, invérifiable ou contredit par un commentaire devient une question, jamais une interprétation de l'agent. | `us-criteres` |
| **D10.INV-4** | chaque exigence de la demande est rattachée à au moins un critère d'acceptation, ou à une question. | `us-criteres`, `analyse-demande` |
| **D10.INV-5** | chaque critère d'acceptation validé est décliné en au moins un scénario Gherkin, et chaque scénario porte l'étiquette `@<CLÉ>-CAnn` d'au moins un critère qu'il illustre. | `us-criteres`, `analyse-demande`, `agent2test/plan` |
| **D10.INV-6** | un critère d'acceptation n'entre en réalisation (choix des variantes V3, cycle TDD V4) que s'il est validé, décliné en scénarios validés, et qu'aucune question ouverte ne le concerne. | `us-criteres`, `variantes`, `agent2dev/cadrage` |
| **D10.INV-7** | la matrice de traçabilité relie chaque US à ses critères d'acceptation, et chaque critère à ses scénarios, tests et commits, ou à un statut « non réalisé » avec sa raison ; le rapport final donne l'état de chaque critère. | `us-criteres`, `tracabilite`, `agent2dev`, `agent2dev/tracabilite` |

## agent2dev 1.5.0

Agent2Dev : système multi-agents de développement qui applique le skill agent-tdd-jira comme méthode, de la demande Jira en MHTML jusqu'au rapport, en cycle TDD scénario par scénario et en binôme avec Agent2Test ; le moteur rédige, des agents déterministes écrivent et exécutent, le développeur valide à chaque point ; journal chaîné, apprentissage sous gouvernance, constitution qui ne se relâche qu'examinée et prouvée, un fichier SQLite unique ouvert par un agent médiateur, binôme à la main ou par un échange par dossiers facultatif, exécution locale. Point d'entrée : [`specs/agent2dev/SKILL.md`](specs/agent2dev/SKILL.md).

### D1 : Noyau 7E, bus et constitution (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D1.INV-1** | le cycle 7E se déroule en sept phases, dans l'ordre, aux quatre échelles Système, Demande, Scénario et Pas ; l'E3 d'une échelle est la suite des cycles de l'échelle inférieure, et l'E7 d'un cycle enfant est versé à l'E4 de son parent. | `noyau`, `orchestrateur`, `observateur` |
| **D1.INV-2** | tout appel ou événement que son contrat ne déclare pas est refusé par le bus ; aucun agent n'importe le code d'un autre agent. | `noyau` |
| **D1.INV-3** | le moteur ne produit que des données ; une sortie qui s'écarte de son schéma fermé ou échoue à un contrôle nommé n'est jamais consommée. | `noyau`, `journal` |
| **D1.INV-4** | la constitution est vérifiée par son empreinte au démarrage ; modifiée ou non publiée, Agent2Dev ne démarre pas ; sa publication est une commande humaine. | `noyau`, `referentiel`, `acceptable`, `revision` |
| **D1.INV-5** | Agent2Dev ne traite qu'une demande Jira exportée en MHTML, pour le projet d'un profil ratifié ; toute intention de démarrer, d'arrêter ou de déployer l'application, de lancer un batch, d'administrer un environnement, d'écrire en base ou dans Jira est refusée avec le motif « hors périmètre ». | `noyau`, `orchestrateur`, `acceptable`, `revision`, `observatoire/export-binome`, `socle-acceptable` |
| **D1.INV-6** | aucun agent n'écrit la constitution, le code ou les schémas d'Agent2Dev, la configuration humaine ni la transmission du skill, et aucun ne réécrit un profil ratifié : le `profil` en crée seulement une version nouvelle, à la décision V0. | `noyau`, `profil`, `referentiel`, `exploitation`, `acceptable`, `kit`, `socle-acceptable` |

### D2 : Données par agent, en SQLite (superseded)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | chaque fichier de données a un seul agent propriétaire ; un agent lit les données d'un autre par une action du bus, jamais par le fichier. | `donnees` |
| **D2.INV-2** | les données d'un agent sont dans son seul fichier SQLite, ouvert par `node:sqlite` dès le premier enregistrement ; chaque écriture est une transaction, et un arrêt du processus, même brutal, ne laisse aucun enregistrement partiel. | `donnees` |
| **D2.INV-3** | le journal et le grand livre sont en ajout seul : aucune action ne modifie ni ne supprime un enregistrement, et toute purge est une commande humaine, journalisée. | `donnees` |

### D3 : Méthode : skill agent-tdd-jira, fiches et scripts (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | le skill n'est lu que depuis sa transmission, à la version épinglée par la configuration humaine, chaque fichier conforme à sa table d'intégrité ; à défaut, Agent2Dev ne démarre pas (`agent-tdd-jira:D9.INV-6`). | `methode` |
| **D3.INV-2** | les consignes d'une fiche reprennent les sections du skill telles quelles : rien n'y est réécrit, résumé, traduit ni complété, hors des leçons ratifiées, ajoutées à part. | `methode` |
| **D3.INV-3** | les trois scripts du skill sont extraits tels quels de leur module et exécutés par l'`executant` ; ni Agent2Dev ni le moteur n'en écrivent d'autre version. | `methode` |
| **D3.INV-4** | chaque module actif du skill est appliqué par au moins une étape d'Agent2Dev, selon la table de correspondance, vérifiée au démarrage contre le manifeste du skill. | `methode` |
| **D3.INV-5** | un prompt composé qui dépasse le plafond de contexte n'est jamais tronqué : le pas s'arrête et se présente au développeur. | `noyau`, `methode`, `apprenant`, `mcp` |

### D4 : Profil du projet (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D4.INV-1** | aucune commande ne s'exécute dans un projet sans profil ratifié en V0 ; un fichier de construction modifié depuis la ratification rouvre V0. | `profil` |
| **D4.INV-2** | chaque valeur du profil cite le fichier du projet dont elle vient, ou porte la marque « à renseigner », qui empêche la ratification. | `profil` |
| **D4.INV-3** | les versions réelles du projet sont comparées aux cibles du skill (Java 21, Spring Boot 3.5, Angular 20) ; chaque écart est présenté en V0, avec la question de la suite à donner. | `profil` |
| **D4.INV-4** | un profil qui contient une commande de démarrage, d'arrêt ou de déploiement de l'application, ou de lancement d'un batch, est refusé, à la proposition comme à la ratification. | `profil` |

### D5 : Écriture dans le projet (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D5.INV-1** | seul le `depot` écrit dans un arbre du projet, et seulement dans l'arbre de travail de la demande et, en mode parallèle, dans le dossier `travail/` de son worktree, sous leur racine, hors des fichiers protégés (`.git`, secrets, CI, fichiers du kit) ; un chemin qui sort de la racine, y compris par lien symbolique, est refusé. | `profil`, `depot`, `tracabilite` |
| **D5.INV-2** | une modification ne s'applique que si chaque bloc « avant » apparaît exactement une fois dans le fichier courant ; sinon rien n'est appliqué, et l'écart revient au moteur dans son budget. | `depot` |
| **D5.INV-3** | toute écriture dans l'arbre de travail qui ne vient pas du `depot`, par l'IDE ou par un autre outil, est détectée avant le pas suivant et arrête la demande jusqu'à la décision du développeur. | `noyau`, `depot`, `mcp` |
| **D5.INV-4** | dans l'arbre de la demande, un commit n'est fait qu'après l'acceptation du scénario à V4, si le développeur l'accepte, avec le message `<CLÉ> Snn : …`, ou `<CLÉ> : …` hors scénario, et le `depot` ne fusionne pas, ne rebase pas, ne change pas de branche et ne réécrit aucun historique (`agent-tdd-jira:D9.INV-2`) ; dans la copie de travail, chaque scénario accepté est commité avec ce message pour former son patch ; le `depot` ne pousse jamais. | `noyau`, `depot`, `apprenant` |
| **D5.INV-5** | une dépendance nouvelle, une modification de la chaîne de construction, la modification d'un test existant ou la suppression d'un fichier attend une validation explicite du développeur avant d'être appliquée (`agent-tdd-jira:D5.INV-6`). | `depot` |
| **D5.INV-6** | un changeset de migration existant n'est jamais modifié ni supprimé ; un schéma évolue par un changeset nouveau. | `depot` |
| **D5.INV-7** | sans l'autorisation d'écrire le code, donnée dans la configuration humaine, l'arbre de travail est une copie de travail : Agent2Dev n'écrit rien dans l'arbre de la demande, hors des fichiers de travail que le kit exclut du dépôt, et remet pour chaque scénario accepté un patch que le développeur applique lui-même. | `depot`, `realisation`, `tableau-de-bord` |

### D6 : Exécution des commandes (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D6.INV-1** | seules s'exécutent les commandes nommées du profil ratifié, les trois scripts du skill et les commandes git de la liste fermée du `depot`, en vecteur d'arguments, sans shell, avec leur répertoire et leur délai, dans l'arbre de travail ; dans l'arbre de la demande, sans autorisation d'écrire le code, seuls s'exécutent les scripts du skill qui lisent, `controler-criteres` et `lire-acceptation` ; les seuls paramètres substitués sont un identifiant de scénario validé par motif et des chemins sous la racine de l'arbre ou sous les données d'Agent2Dev. | `profil`, `depot`, `executant`, `orchestrateur` |
| **D6.INV-2** | aucune commande ne démarre, n'arrête ni ne déploie l'application, ni ne lance un batch (`agent-tdd-jira:D7.INV-4`). | `noyau`, `executant`, `apprenant`, `exploitation` |
| **D6.INV-3** | la sortie d'une commande est masquée et bornée avant d'être journalisée ou transmise au moteur ; les échecs de compilation et de test reviennent structurés : fichier, ligne, test, message. | `executant` |
| **D6.INV-4** | les échecs présents avant le premier scénario forment la ligne de base de la demande ; ils ne sont imputés à aucun scénario et figurent au rapport. | `executant`, `orchestrateur` |

### D7 : Cadrage : extraction et analyse (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D7.INV-1** | la demande est extraite par le script du skill, jamais par le moteur ; le fichier MHTML n'est jamais modifié, et l'extraction est confirmée à V1 avant toute analyse (`agent-tdd-jira:D1.INV-1`, `agent-tdd-jira:D1.INV-2`). | `cadrage` |
| **D7.INV-2** | `us.md` et le fichier Gherkin ne sont présentés à V2 qu'après `controler-criteres.mjs` ; chaque écart du script est corrigé dans le budget du moteur, ou présenté comme écart. | `cadrage`, `binome` |
| **D7.INV-3** | une question soulevée par l'analyse n'est jamais tranchée par le système : elle attend la réponse du développeur à V2 (`agent-tdd-jira:D2.INV-2`). | `cadrage` |
| **D7.INV-4** | après V2, `us.md` et le fichier Gherkin ne changent que par une nouvelle validation V2. | `depot`, `cadrage` |

### D8 : Conception : impact et variantes (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D8.INV-1** | chaque élément de la fiche d'impact cite un fichier et une ligne trouvés par une recherche du `depot` ; un élément sans résultat de recherche est un écart (`agent-tdd-jira:D3.INV-1`). | `conception`, `memoire` |
| **D8.INV-2** | aucune réalisation ne commence avant que le développeur ait choisi à V3 une variante back et une variante front par scénario, et que le `depot` ait consigné ce choix dans `suivi.md` (`agent-tdd-jira:D4.INV-3`). | `conception` |
| **D8.INV-3** | une variante qui viole un invariant d'un référentiel ou du socle n'est jamais présentée comme recommandée ; un contrôle nommé le vérifie sur la sortie de la fiche (`agent-tdd-jira:D4.INV-2`). | `conception` |

### D9 : Réalisation en cycle TDD (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D9.INV-1** | un seul scénario est réalisé à la fois, et le suivant attend l'acceptation du précédent à V4 (`agent-tdd-jira:D5.INV-4`). | `realisation` |
| **D9.INV-2** | aucun code de production n'est appliqué pour un scénario avant que l'`executant` ait constaté l'échec d'un test étiqueté de ce scénario pour la raison attendue : une assertion, pas une erreur de compilation ni de configuration ; seule une signature minimale, sans logique, peut précéder ce constat quand le test ne compile pas (`agent-tdd-jira:D5.INV-1`). | `realisation`, `reflexif` |
| **D9.INV-3** | un scénario n'est présenté à V4 qu'après les suites complètes back et front vertes, ligne de base exclue, constatées par l'`executant`. | `realisation` |
| **D9.INV-4** | aucun pas n'affaiblit les tests : retirer un test ou une assertion, ajouter `@Disabled`, `fit`, `fdescribe` ou `xit` est refusé par contrôle nommé. | `noyau`, `realisation`, `apprenant`, `reflexif`, `acceptable` |
| **D9.INV-5** | quand un scénario touche le contrat d'API, le pas `contrat` précède les tests du back, puis ceux du front (`agent-tdd-jira:D5.INV-5`). | `realisation` |
| **D9.INV-6** | la présentation V4 est rendue depuis le journal, au format du skill : rouge avec son message d'échec, vert, remanié, suites, fichiers, commit proposé. | `realisation` |

### D10 : Binôme avec Agent2Test (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D10.INV-1** | la remise n'a lieu qu'arbre de la demande propre, `controler-criteres.mjs` sans écart et, sans autorisation d'écrire le code, chaque patch remis présent dans l'arbre de la demande ; elle cite le commit et le plan tels quels (`agent-tdd-jira:D7.INV-1`). | `depot`, `binome` |
| **D10.INV-2** | le verdict de chaque critère est celui que rend `lire-acceptation.mjs` sur le journal de tests, jamais une lecture du moteur (`agent-tdd-jira:D7.INV-3`). | `binome` |
| **D10.INV-3** | seul un défaut que le script déclare confirmé, avec un cycle de correction, rouvre un scénario, dans le budget de corrections par scénario ; tout autre défaut est présenté au développeur (`agent-tdd-jira:D7.INV-2`). | `binome` |
| **D10.INV-4** | Agent2Dev n'écrit rien dans le projet Agent2Test, ne conteste ni ne réécrit un verdict, et n'ouvre aucune campagne : le développeur ouvre chaque campagne à la main (`agent-tdd-jira:D7.INV-4`). | `binome` |

### D11 : Traçabilité et rapport (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D11.INV-1** | la matrice est construite par les recherches du `depot` et par les scripts du skill, jamais de mémoire (`agent-tdd-jira:D6.INV-1`, `agent-tdd-jira:D10.INV-7`). | `tracabilite` |
| **D11.INV-2** | Agent2Dev n'écrit jamais dans Jira : le projet de commentaire est remis au développeur (`agent-tdd-jira:D6.INV-3`). | `tracabilite` |
| **D11.INV-3** | V5 n'est présentée qu'avec chaque critère dans la matrice, son état de réalisation et son verdict d'acceptation, ou « non joué » avec sa raison (`agent-tdd-jira:D7.INV-3`). | `tracabilite` |

### D12 : Orchestration et points de validation (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D12.INV-1** | aucun point de validation n'est sauté, supprimé ni décidé par le système ; aucune étape ne consomme une sortie qui attend une décision. | `noyau`, `orchestrateur`, `apprenant` |
| **D12.INV-2** | une instance d'Agent2Dev porte une demande à la fois ; les suivantes attendent en file. | `orchestrateur`, `exploitation` |
| **D12.INV-3** | un pas qui épuise son budget s'arrête et se présente au développeur ; aucune boucle ne se relance sans budget. | `orchestrateur` |
| **D12.INV-4** | l'arrêt d'urgence est lu entre deux pas ; la reprise est une décision humaine ; après un redémarrage du processus, la demande reprend au début du pas interrompu. | `depot`, `orchestrateur` |
| **D12.INV-5** | chaque décision enregistre sa cible, son auteur, son canal, sa date et son commentaire ; une correction ou un ajustement exige un commentaire. | `depot`, `orchestrateur` |

### D13 : Journal et livrable de demande (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D13.INV-1** | le journal est en ajout seul et chaîné par empreintes SHA-256 ; `verifierChaine` nomme la première ligne rompue ou manquante. | `journal` |
| **D13.INV-2** | chaque ligne porte son échelle et sa phase : une demande se relit comme un arbre 7E, de la demande au pas. | `journal` |
| **D13.INV-3** | le livrable de demande est une projection du journal, en Markdown et en JSON, depuis la même source ; sa rubrique `points` porte chaque présentation d'un point de validation et sa décision, avec le numéro et la date de leurs lignes, la valeur et le rôle de la décision. | `tracabilite`, `journal` |
| **D13.INV-4** | toute production du moteur porte l'adaptateur et le nom du moteur, la fiche et sa version composée, l'empreinte du prompt et la décision qui l'a validée. | `journal` |

### D14 : Observabilité de premier ordre (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D14.INV-1** | l'observateur ne produit que des mesures et des alertes ; il n'agit sur aucun cycle. | `observateur` |
| **D14.INV-2** | chaque mesure se recalcule depuis le journal, à l'identique. | `observateur` |
| **D14.INV-3** | une mesure qui franchit un seuil de la configuration humaine lève une alerte, journalisée et affichée. | `observateur` |

### D15 : Apprentissage (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D15.INV-1** | chaque correction ou ajustement commenté à V2, V3, V4 ou V5, et chaque défaut confirmé par Agent2Test après une acceptation V4, produit une leçon candidate, liée à sa fiche, à son moteur et à sa source. | `apprenant` |
| **D15.INV-2** | une leçon n'a d'effet qu'après ratification en CP-4, depuis le tableau de bord, et seulement pour le moteur sur lequel elle a été apprise. | `apprenant`, `referentiel` |
| **D15.INV-3** | une leçon qui contredit une règle du skill ou de la constitution est refusée par contrôle nommé avant d'être proposée. | `apprenant`, `socle-acceptable` |

### D16 : Réflexivité de second ordre (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D16.INV-1** | une leçon ou une règle dont l'effet mesuré dégrade le taux d'acceptation au-delà de la marge, sur la fenêtre et après l'exposition minimale, est suspendue par le système seul ; il n'adopte jamais seul une règle nouvelle et n'élargit aucune borne. | `reflexif`, `referentiel` |
| **D16.INV-2** | le taux de défauts confirmés par Agent2Test après une acceptation V4 est mesuré par fiche et par moteur ; sa hausse lève une alerte au référent. | `reflexif` |
| **D16.INV-3** | les dérives qui contourneraient la méthode (rouge pour une mauvaise raison, tests modifiés au vert, lignes par pas en hausse) sont mesurées, et lèvent une alerte au référent. | `reflexif` |

### D17 : Référentiel, versions et grand livre (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D17.INV-1** | chaque demande s'exécute avec le référentiel épinglé à son E2 ; une règle ratifiée ne s'applique qu'aux demandes suivantes. | `orchestrateur`, `apprenant`, `reflexif`, `referentiel` |
| **D17.INV-2** | le grand livre est en ajout seul et chaîné ; il inscrit chaque constitution publiée, ratification, refus, suspension et retour arrière. | `referentiel` |
| **D17.INV-3** | les règles modifiables se limitent à la liste fermée de la constitution, chacune dans ses bornes ; une valeur hors bornes est refusée. | `reflexif`, `referentiel` |
| **D17.INV-4** | les pouvoirs sont séparés : proposer (`apprenant`, `reflexif`), ratifier (un humain, en CP-4, hors du canal MCP), appliquer (`referentiel`), mesurer (`reflexif`). | `reflexif`, `referentiel`, `autonomie` |
| **D17.INV-5** | chaque fiche porte une version composée, fiche, skill et leçons ; le prompt de toute sortie du moteur se reconstitue à partir du journal, et son empreinte égale celle du journal. | `methode`, `apprenant`, `referentiel` |

### D18 : Moteurs et serveur MCP (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D18.INV-1** | les interfaces n'écoutent que sur `127.0.0.1` ; le serveur MCP exige un jeton porteur et refuse un en-tête `Origin` non autorisé. | `mcp`, `tableau-de-bord` |
| **D18.INV-2** | une décision CP-4 reçue par le canal MCP est refusée ; une décision V relayée porte l'auteur humain du jeton et obéit aux droits de ses rôles. | `orchestrateur`, `referentiel`, `mcp` |
| **D18.INV-3** | aucun contenu du projet ne part vers un moteur externe tant que la configuration humaine ne porte pas l'autorisation de l'envoyer. | `mcp` |
| **D18.INV-4** | le contexte transmis au moteur se limite au pas, est borné et masqué : aucune valeur de secret, aucun jeton, aucun fichier exclu par le profil. | `mcp`, `memoire` |
| **D18.INV-5** | changer d'adaptateur ne change que la configuration ; un adaptateur inconnu est refusé au démarrage ; chaque appel est journalisé. | `mcp` |
| **D18.INV-6** | avec le profil souverain, aucune connexion sortante n'est ouverte, hors celle du moteur local. | `mcp` |

### D19 : Tableau de bord par rôle (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D19.INV-1** | les décisions suivent les rôles : développeur pour V0 à V5, référent pour CP-4. | `tableau-de-bord` |
| **D19.INV-2** | chaque point présente l'objet à décider avec ses preuves, côte à côte : extraction, fichiers et écarts du script, fiche d'impact et variantes, diff et sorties de commande, matrice et rapport. | `tracabilite`, `tableau-de-bord` |
| **D19.INV-3** | l'interface s'utilise au clavier et au lecteur d'écran ; aucun rafraîchissement automatique ne démarre sans demande. | `tableau-de-bord` |

### D20 : Exploitation locale (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D20.INV-1** | Agent2Dev n'a aucune dépendance d'exécution : modules natifs de Node seulement, `node:sqlite` compris. | `tableau-de-bord`, `exploitation` |
| **D20.INV-2** | la configuration humaine et les secrets vivent hors du dépôt d'Agent2Dev et du projet, et ne sont jamais écrits par le système. | `exploitation` |
| **D20.INV-3** | tout s'exécute en local, sur le poste du développeur. | `exploitation` |

### D21 : Mémoire et recherche sur le code et les demandes passées (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D22 : Autonomie par point de validation (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D23 : Relais du binôme par n8n, facultatif (superseded)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D23.INV-1** | Agent2Dev ne dépend jamais du relais n8n : désactivé par défaut, le binôme se fait à la main, à l'identique ; activé, c'est le relais qui appelle le serveur MCP, et Agent2Dev n'ouvre aucune connexion vers n8n ni vers Agent2Test. | `echange` |
| **D23.INV-2** | un jeton au rôle `relais` n'atteint que `a2d_remise`, `a2d_remise_relayee` et `a2d_journal_de_tests` ; toute décision, rédaction, soumission de demande, suspension ou reprise lui est refusée. | `echange` |
| **D23.INV-3** | un journal de tests reçu du relais l'est par son contenu, jamais par un chemin ; le `depot` le range dans le dossier de travail de la demande, et `lire-acceptation.mjs` le lit comme un journal déposé à la main. | `echange` |
| **D23.INV-4** | la configuration fournie pour n8n le fait écouter sur `127.0.0.1` seulement, avec sa base SQLite, sans télémétrie ni appel sortant ; son workflow n'appelle que les outils du rôle `relais` des deux têtes, et ses fichiers ne contiennent aucun jeton. | `echange` |

### D24 : Données en un fichier unique, par l'agent médiateur (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D24.INV-1** | seul l'agent médiateur `donnees` ouvre le fichier de données, et les commandes humaines par son code ; un autre agent n'y accède que par les actions du médiateur, sur le bus, qui atteste l'appelant ; un agent lit les données d'un autre par une action déclarée de cet agent, jamais par le médiateur. | `donnees` |
| **D24.INV-2** | chaque table a un seul agent propriétaire, dont elle porte le nom en préfixe ; le médiateur tire la table de l'appelant et de la collection, et aucun agent ne lui transmet de SQL ni de nom de table ; une migration qui crée ou modifie un objet hors des tables de son agent est annulée en entier, et, au démarrage, chaque requête du médiateur est vérifiée sur le plan d'exécution de SQLite : sur la collection d'un agent, elle ne touche que des tables de cet agent, déclencheurs, vues et clés étrangères compris. | `donnees` |
| **D24.INV-3** | les données d'Agent2Dev sont dans un seul fichier SQLite, ouvert par `node:sqlite` dès le premier enregistrement ; chaque écriture est une transaction, et un arrêt du processus, même brutal, ne laisse aucun enregistrement partiel ; un fichier de données que SQLite refuse, ou qui échoue à son contrôle d'intégrité, empêche le démarrage. | `donnees` |
| **D24.INV-4** | le journal et le grand livre sont en ajout seul : aucune action ne modifie ni ne supprime un enregistrement, et toute purge est une commande humaine, journalisée. | `donnees` |

### D25 : Échange du binôme par dossiers, facultatif (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D25.INV-1** | Agent2Dev ne dépend jamais de l'échange : en mode `manuel`, le défaut, le binôme se fait à la main, à l'identique ; en mode `dossiers`, Agent2Dev n'ouvre aucune connexion vers Agent2Test, et l'échange n'écrit, par le `depot`, que dans la boîte de sortie de l'instance et dans le dossier de travail de la demande. | `echange`, `exploitation` |
| **D25.INV-2** | de l'échange, Agent2Dev ne lit que la boîte de sortie d'Agent2Test déclarée dans la configuration humaine, en lecture seule, et n'y retient que le journal de tests nommé d'après la remise courante de la demande. | `echange` |
| **D25.INV-3** | un journal relevé par l'échange est copié par le `depot` dans le dossier de travail de la demande, et `lire-acceptation.mjs` le lit comme un journal déposé à la main. | `echange` |
| **D25.INV-4** | une remise publiée porte le format `agent2test.remise/1`, sans contenu de fichier ni secret ; elle s'écrit par un fichier provisoire renommé ensuite, et n'est jamais réécrite ; l'échange ne décide rien et n'ouvre aucune campagne. | `echange` |

### D26 : Acceptable partagé : noyau du socle de l'acceptable, refus, dérogations et faux refus (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D26.INV-1** | la constitution épingle le noyau du socle de l'acceptable inclus, par son nom, sa version et l'empreinte de son bloc `noyau`, et en reprend chaque entrée à l'identique, aucune dérogeable ; un écart empêche le démarrage. | `noyau`, `acceptable` |
| **D26.INV-2** | chaque refus d'une garde, de périmètre, d'écriture, de commandes ou des leçons, cite les règles des entrées qui l'arrêtent, celles du noyau en tête ; il est journalisé et présenté au développeur ; tant que le contrat des kits n'est pas décrit, une entrée `horsKit` vaut partout. | `acceptable` |
| **D26.INV-3** | seuls le développeur et le référent répondent à un refus, depuis le tableau de bord ou par MCP, avec leur motif ; une dérogation n'est admise que si chaque entrée qui a refusé est propre à Agent2Dev et déclarée dérogeable, jamais pour une entrée du noyau, et n'exécute l'action qu'une fois ; un faux refus n'exécute rien ; ni le moteur, ni un agent, ni l'échange ne répondent à un refus. | `mcp`, `tableau-de-bord`, `acceptable` |
| **D26.INV-4** | le livrable d'une demande touchée par un refus porte la rubrique `acceptable` : chaque refus avec sa garde, ses règles et sa réponse, chaque refus et chaque réponse datés de leur ligne de journal, sans motif en clair. | `acceptable` |

### D27 : Kit dev : patch confronté, manifeste, validation en V4, application déclarée (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D27.INV-1** | le patch d'un scénario ne devient son kit dev qu'après sa confrontation par le `depot`, avant V4, à la version épinglée du noyau et de la constitution, fichiers écrits et contenu ; un patch qui enfreint une règle n'est pas remis, et le refus cite sa règle ; un patch conforme reçoit son manifeste `socle-acceptable.kit/1`, à son empreinte, avec la version et l'empreinte du noyau confronté (`socle-acceptable:SA8.INV-1`). | `kit`, `socle-acceptable` |
| **D27.INV-2** | un kit dev ne s'applique, par la fabrication de l'hôte, sur l'environnement dev, qu'après la décision « accepter » de V4, qui le valide à son empreinte ; seul le développeur déclare son application et son retour arrière, depuis le tableau de bord ; une déclaration pour un patch dont l'empreinte n'est plus celle du manifeste est refusée `KIT_MODIFIE` ; aucun agent n'applique un kit ni ne déclare son application (`socle-acceptable:SA8.INV-2`). | `mcp`, `kit` |
| **D27.INV-3** | le livrable d'une demande dont un kit a été remis porte la rubrique `kits` : chaque kit avec son scénario, son environnement, son empreinte, sa validation, son application et son retour arrière, chacun daté de sa ligne de journal, avec le rôle de qui l'a validé ou déclaré ; un échec, déclaré avec son retour arrière, ne remplit que l'application. | `kit` |

### D28 : Révision de la constitution : publication qui classe, examen et preuves d'un relâchement, rubrique `revisions` (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D28.INV-1** | chaque publication de la constitution, commande humaine qu'aucun agent n'appelle, se compare à la dernière publiée, que le grand livre porte entière, et se classe, première, neutre, renforcement ou relâchement, ses relâchements et ses renforcements nommés selon `EVOLUTION.md`, section 10.7 ; une constitution changée porte une version nouvelle ; ce qui ne relâche rien se publie seul, sans examen ni preuve. | `revision` |
| **D28.INV-2** | un relâchement ne se publie qu'avec l'examen de sa version, `constitution/examens/<version>.md`, au format `observatoire.examen/1`, d'objet `constitution`, d'un observateur sur un autre modèle, une réponse si l'avis est défavorable, et ses preuves : pour chaque entrée relâchée d'une liste, deux faux refus vérifiés, qui répondent à des refus de cette entrée, ou un incident déclaré, et un incident pour tout autre relâchement ; une entrée du noyau ne se relâche jamais ; à défaut, la publication est refusée, dit ce qui manque et n'écrit rien ; l'examen et la publication s'inscrivent ensemble au grand livre, `constitution.examinee` puis `constitution.publiee`. | `revision` |
| **D28.INV-3** | le livrable porte la rubrique `revisions` dès que le grand livre porte une publication classée : chaque entrée `constitution.examinee` et `constitution.publiee`, avec son numéro et sa date au grand livre, la version et l'empreinte de la constitution, le sens et les relâchements et renforcements comptés d'une publication, l'avis d'un examen ; ni la constitution, ni l'examen, ni la réponse, ni les preuves. | `revision` |

## agent2test 1.7.0

Agent2Test : système multi-agents qui choisit, prépare, exécute et journalise les tests essentiels d'une application Angular pour une demande, en pilotant Playwright comme une bibliothèque depuis Node, dans un projet séparé de l'application ; plan importé d'agent-tdd-jira, verdict par critère d'acceptation, navigateur qui regarde comme une personne et rend compte de ce qu'il voit et ne voit pas, points de contrôle humains, cybernétique de premier et de second ordre, constitution qui ne se relâche qu'examinée et prouvée, un fichier SQLite unique ouvert par un agent médiateur, remise d'Agent2Dev en fichier ou par un échange par dossiers facultatif, exécution locale. Point d'entrée : [`specs/agent2test/SKILL.md`](specs/agent2test/SKILL.md).

### D1 : Noyau 7E, bus et constitution (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D1.INV-1** | chaque cycle déroule les sept phases E1 à E7, dans l'ordre, à chacune des quatre échelles (Système, Campagne, Scénario, Étape) ; l'E3 d'une échelle est la suite des cycles complets de l'échelle inférieure, et chaque ligne de journal porte son échelle et sa phase. | `noyau`, `orchestrateur`, `journal`, `observateur`, `agent2dev/noyau` |
| **D1.INV-2** | les agents ne communiquent que par le bus ; le bus refuse tout appel ou événement absent du contrat déclaré de l'agent, et aucun agent n'importe un autre agent. | `noyau` |
| **D1.INV-3** | toute sortie du moteur est validée contre un schéma fermé et des contrôles nommés avant d'être consommée ; une sortie non conforme n'est jamais utilisée. | `noyau`, `preparateur`, `kit` |
| **D1.INV-4** | au démarrage, une constitution dont l'empreinte SHA-256 diffère de celle inscrite au grand livre empêche le démarrage, avec un message explicite. | `noyau`, `acceptable`, `revision` |
| **D1.INV-5** | toute demande étrangère aux tests (modifier le code, déployer, administrer) est refusée avec le motif « hors périmètre ». | `noyau`, `plan`, `acceptable`, `kit`, `revision`, `socle-acceptable` |
| **D1.INV-6** | aucune action d'agent n'écrit la constitution, le code, les schémas du journal ou du grand livre, ni la configuration humaine. | `noyau`, `referentiel`, `exploitation`, `acceptable`, `socle-acceptable` |

### D2 : Données isolées par agent, sur PostgreSQL (superseded)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | chaque agent propriétaire a son schéma et son rôle PostgreSQL ; une écriture d'un agent dans le schéma d'un autre est refusée par la base elle-même. | `donnees` |
| **D2.INV-2** | seuls des contrats nommés s'exécutent ; une requête SQL libre est refusée. | `donnees` |
| **D2.INV-3** | la base de l'application n'est jamais accédée, sauf par l'oracle en lecture seule, activé explicitement dans la configuration humaine et limité à des contrats de lecture nommés. | `donnees` |
| **D2.INV-4** | les preuves sont purgées au-delà de leur durée de conservation ; le journal garde leurs empreintes. | `donnees` |

### D3 : Plan canonique et demande (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | le système ne rédige ni ne corrige aucune US, aucun critère, aucun scénario ; un critère qu'aucun scénario ne couvre est marqué « trou de couverture », et aucun scénario n'est créé pour lui. | `plan`, `agent-tdd-jira/binome-agent2test` |
| **D3.INV-2** | chaque US, critère et scénario a un identifiant canonique unique ; deux éléments de même identifiant bloquent l'import, et le message cite leurs deux emplacements. | `plan` |
| **D3.INV-3** | un scénario dont un prérequis sort du périmètre (redémarrage, écriture directe en base) est marqué « non automatisable » avec son motif, sauf un prérequis de données qu'établit un kit test validé et déclaré appliqué (D27) ; un prérequis de batch Java devient un préalable confié au développeur (CP-5). | `plan` |
| **D3.INV-4** | le plan est versionné : réimporter des sources inchangées ne crée aucune version, une source modifiée en crée une nouvelle, et la précédente reste consultable. | `plan` |
| **D3.INV-5** | seul un scénario validé, qui illustre au moins un critère validé, est jouable ; un scénario proposé non validé, en attente d'une question, limité au back, ou qui exige un rôle que la session n'a pas, est « non jouable », avec son motif. | `plan`, `navigateur`, `echange`, `agent-tdd-jira/binome-agent2test`, `agent2dev/binome` |
| **D3.INV-6** | un critère cité par la demande et absent du plan est signalé avant la sélection. | `plan` |

### D4 : Navigateur, session et preuves (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D4.INV-1** | seul `navigateur` pilote Playwright ; aucun autre module n'ouvre de navigateur. | `navigateur` |
| **D4.INV-2** | le navigateur ne charge que les origines déclarées au profil ; une navigation vers une autre origine est bloquée avant chargement, et le journal indique l'origine visée. | `navigateur`, `scenario-playwright`, `scenario-playwright/garde`, `scenario-playwright/remise` |
| **D4.INV-3** | le système ne détient aucun identifiant SSO et ne saisit rien dans les pages du fournisseur SSO ; la session est un secret local (fichier hors dépôt, mode 0600), jamais journalisée ni transmise au moteur, et les traces conservées sont expurgées des en-têtes `Authorization`, `Cookie` et `Set-Cookie`. | `navigateur`, `journal`, `profil-recette` |
| **D4.INV-4** | seules les actions du jeu fermé s'exécutent ; aucun code produit par le moteur n'atteint la page, ni par script, ni par évaluation. | `navigateur`, `scenario-playwright`, `scenario-playwright/remise` |
| **D4.INV-5** | une étape n'attend que des états, dans un délai borné ; aucune étape n'attend une durée fixe. | `navigateur`, `scenario-playwright` |
| **D4.INV-6** | une étape de mutation exécutée n'est jamais rejouée ; une étape `verifier`, ou une étape dont l'action n'a pas eu lieu, est retentée deux fois au plus, et un succès au réessai classe l'étape `INSTABILITE`, jamais « réussie ». | `navigateur`, `verdict`, `scenario-playwright`, `scenario-playwright/remise` |
| **D4.INV-7** | la session s'établit d'abord sans action humaine, par la stratégie configurée ; si cela échoue, CP-0 s'ouvre, et seul le système le ferme, après avoir atteint seul une page protégée. | `navigateur` |

### D5 : Cartographie de l'application (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D5.INV-1** | le scan ne crée, ne modifie ni ne supprime aucun fichier du projet de l'application, et refuse toute lecture hors de sa racine. | `scanner` |
| **D5.INV-2** | le relevé des écrans en marche ne joue que des navigations : aucun clic, aucune saisie, aucune soumission. | `scanner` |
| **D5.INV-3** | chaque élément interactif sans nom accessible figure dans la liste des fragilités de ciblage. | `scanner` |
| **D5.INV-4** | pour un fichier modifié, l'impact renvoie chaque écran atteint avec le chemin qui le justifie : fichier, point d'API, service, composant, route. | `scanner` |
| **D5.INV-5** | un second scan sans fichier modifié ne réanalyse aucun fichier. | `scanner` |

### D6 : Sélection des tests essentiels (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D6.INV-1** | le palier P1 contient tous les scénarios jouables qui couvrent un critère cité par la demande ; la règle est revérifiée après la revue du moteur. | `stratege`, `reflexif` |
| **D6.INV-2** | le palier P3 contient tous les scénarios jouables déclarés « socle ». | `stratege`, `reflexif`, `accessibilite` |
| **D6.INV-3** | chaque scénario retenu ou écarté porte un motif d'une phrase, et chaque score du palier P2 se lit décomposé facteur par facteur. | `stratege` |
| **D6.INV-4** | aucune préparation ne démarre avant la décision en CP-1 ; une correction en CP-1 exige un commentaire. | `stratege`, `orchestrateur` |
| **D6.INV-5** | sans moteur disponible, la sélection déterministe est présentée seule, avec la marque « sans revue du moteur ». | `stratege`, `mcp` |

### D7 : Préparation des parcours (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D7.INV-1** | un parcours est une donnée conforme au schéma des parcours ; une action hors du jeu fermé, ou une donnée non conforme, est rejetée avant toute exécution. | `preparateur` |
| **D7.INV-2** | chaque critère couvert par un parcours est porté par au moins une étape `verifier`. | `preparateur` |
| **D7.INV-3** | toute valeur saisie par une étape de mutation porte le préfixe `A2T-<campagne>-` ; une étape de suppression dont la cible ne porte pas ce préfixe n'est pas jouée et bloque le scénario jusqu'à la décision en CP-3. | `navigateur`, `preparateur` |
| **D7.INV-4** | chaque parcours porte son origine : moteur, fiche et version composée, empreinte du prompt, ratificateur. | `preparateur` |
| **D7.INV-5** | un profil d'environnement ou un parcours n'est exécuté en campagne qu'une fois ratifié en CP-2 ; toute modification, réparation comprise, crée une version nouvelle soumise à CP-2. | `preparateur` |
| **D7.INV-6** | les budgets sont bornés : 3 renvois au moteur pour une sortie non conforme, 2 réparations par parcours et par campagne ; au-delà, l'échec est présenté au point de contrôle. | `preparateur` |
| **D7.INV-7** | les cibles suivent l'ordre fixé (rôle et nom accessible, libellé, identifiant de test, texte, texte indicatif, CSS) ; une cible CSS porte un motif et figure parmi les fragilités de ciblage. | `preparateur` |

### D8 : Verdicts et causes présumées (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D8.INV-1** | pas de verdict sans preuve : un critère dont une preuve manque est « non vérifié », jamais « conforme » ; « conforme » et « non conforme » dérivent des critères d'acceptation, jamais du code. | `verdict`, `reflexif` |
| **D8.INV-2** | un verdict n'est jamais réécrit ; un désaccord humain est consigné à côté. | `verdict` |
| **D8.INV-3** | chaque échec reçoit une cause de la liste fermée (`DEFAUT_APPLICATIF`, `DEFAUT_PARCOURS`, `SESSION_EXPIREE`, `ENVIRONNEMENT`, `INSTABILITE`, `INDETERMINE`) et cite les signaux qui la fondent. | `verdict` |
| **D8.INV-4** | chaque verdict porte l'empreinte SHA-256 de ses preuves. | `verdict` |
| **D8.INV-5** | une session expirée n'impute aucun échec : après CP-0, le scénario est rejoué depuis son début. | `verdict` |

### D9 : Orchestration et points de contrôle (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D9.INV-1** | aucun point de contrôle n'est supprimé, sauté ou validé par le système ; aucune phase ne consomme une sortie non ratifiée, et le niveau d'autonomie de chaque point se lit dans la configuration humaine. | `orchestrateur` |
| **D9.INV-2** | chaque décision enregistre son auteur, son canal, sa date et son commentaire. | `orchestrateur` |
| **D9.INV-3** | avant le premier scénario, une sonde vérifie que l'application répond ; sinon, la campagne est refusée avec ce motif. | `orchestrateur`, `echange` |
| **D9.INV-4** | une seule campagne s'exécute à la fois sur une application cible ; les autres attendent en file. | `orchestrateur` |
| **D9.INV-5** | l'arrêt d'urgence suspend la campagne au plus tard à la fin de l'étape en cours. | `orchestrateur` |
| **D9.INV-6** | après un redémarrage du processus, la campagne reprend au début du scénario interrompu, sans perte de journal. | `orchestrateur` |
| **D9.INV-7** | Agent2Test ne démarre, n'arrête ni ne déploie l'application, et ne lance aucun batch ; un scénario à préalable de batch attend en CP-5 que le développeur l'ait lancé et l'ait déclaré terminé. | `plan`, `orchestrateur`, `exploitation`, `echange`, `agent-tdd-jira/binome-agent2test` |

### D10 : Journal et journal de tests (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D10.INV-1** | le journal est en ajout seul, imposé par des déclencheurs de la base qui refusent toute modification et toute suppression, et chaîné par empreintes ; au démarrage, un déclencheur absent ou une chaîne rompue empêche le démarrage, et `verifierChaine` nomme la première ligne rompue, même quand l'altération vient d'un outil SQLite, hors du système. | `donnees`, `journal` |
| **D10.INV-2** | le journal de tests d'une campagne est produit en Markdown, JSON, JUnit XML et HTML à partir de la même source, et sa matrice critères × verdicts couvre tous les critères de la demande, trous de couverture compris. | `journal` |
| **D10.INV-3** | tout contenu produit par le moteur est marqué comme tel dans le journal de tests, avec moteur, fiche et version. | `stratege`, `journal` |
| **D10.INV-4** | l'empreinte de fin de chaîne du journal de tests est celle du journal à la clôture de la campagne. | `journal`, `echange` |

### D11 : Observabilité de premier ordre (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D11.INV-1** | chaque appel entre agents produit une trace portant corrélation, parent, échelle, phase et vecteur des sept durées. | `observateur` |
| **D11.INV-2** | pour chaque campagne, toute échelle dont les sept phases ne figurent pas dans l'ordre au journal est signalée comme violation de D1.INV-1. | `observateur` |
| **D11.INV-3** | aucun module du premier ordre n'appelle un module du second ordre ; le graphe des appels du bus le vérifie. | `noyau`, `observateur` |
| **D11.INV-4** | une dérive d'indicateur au-delà de son seuil lève une alerte visible au tableau de bord. | `observateur` |

### D12 : Mémoire et recherche hybride (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D12.INV-1** | la recherche fonctionne par le plein texte seul ; avec un modèle de plongement local, plein texte et vecteurs sont fusionnés par rang réciproque. | `memoire` |
| **D12.INV-2** | tout fragment injecté dans une consigne appartient aux versions épinglées de la campagne, et ses identifiants sont journalisés avec l'appel au moteur. | `memoire` |
| **D12.INV-3** | avant injection, les secrets, adresses électroniques et noms de personnes déclarés sont masqués, et un fragment trop long est tronqué avec la marque « tronqué ». | `memoire`, `mcp` |

### D13 : Apprentissage (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D13.INV-1** | chaque correction ou rejet commenté en CP-1, CP-2 ou CP-3 produit une leçon candidate, liée à sa fiche, à son moteur et à sa décision source. | `apprenant` |
| **D13.INV-2** | aucune leçon n'entre dans une fiche avant sa ratification en CP-4. | `apprenant` |
| **D13.INV-3** | une leçon ratifiée ne s'applique qu'au moteur sur lequel elle a été apprise ; l'étendre à un autre moteur est une ratification distincte. | `apprenant`, `referentiel` |

### D14 : Réflexivité de second ordre (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D14.INV-1** | pour chaque contrôle automatique, l'accord avec les décisions humaines est mesuré par fiche, version et moteur dès l'exposition minimale, et la précision des alertes O1 est mesurée à partir de leur qualification par l'opérateur. | `observateur`, `reflexif` |
| **D14.INV-2** | le système revient seul au dernier état ratifié quand une leçon ou un recalibrage dégrade sa mesure au-delà de la marge ; il n'adopte jamais seul une règle nouvelle, n'élargit aucune borne et n'assouplit aucun point de contrôle. | `reflexif`, `referentiel` |
| **D14.INV-3** | un écart entre la répartition des causes présumées et les reclassements humains en CP-3 lève une alerte au référent qualité. | `verdict`, `reflexif` |
| **D14.INV-4** | chaque proposition nomme la règle, l'échelle et la phase touchées, la valeur actuelle, la valeur proposée, les preuves et l'effet attendu, et reste dans les bornes de la constitution. | `reflexif` |
| **D14.INV-5** | le second ordre lit le premier ordre et ne l'écrit jamais. | `reflexif` |

### D15 : Référentiel, versions et grand livre (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D15.INV-1** | chaque campagne s'exécute avec le référentiel épinglé à son E2 ; une règle ratifiée ne s'applique qu'à partir de la campagne suivante. | `orchestrateur`, `referentiel` |
| **D15.INV-2** | le grand livre est en ajout seul et chaîné par empreintes ; il inscrit chaque version publiée de la constitution, chaque ratification, refus, suspension et retour arrière. | `donnees`, `referentiel` |
| **D15.INV-3** | chaque fiche porte une version composée ; pour toute sortie du moteur, le prompt se reconstitue à partir de la fiche, de sa version et des fragments journalisés, et son empreinte égale celle du journal. | `memoire`, `apprenant`, `referentiel` |
| **D15.INV-4** | les pouvoirs sont séparés : proposer (`apprenant`, `reflexif`), ratifier (un humain, en CP-4, hors du canal MCP), appliquer (`referentiel`), mesurer (`reflexif`). | `referentiel` |
| **D15.INV-5** | les règles modifiables se limitent à la liste fermée de la constitution, chacune dans ses bornes ; une valeur hors bornes est refusée. | `reflexif`, `referentiel` |

### D16 : Moteurs et serveur MCP (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D16.INV-1** | le serveur MCP n'écoute que sur `127.0.0.1` ; une requête HTTP sans jeton valide, ou venant d'une origine non autorisée, est refusée. | `mcp` |
| **D16.INV-2** | une décision CP-4 reçue par le canal MCP est refusée ; l'arrêt d'urgence y reste permis. | `orchestrateur`, `referentiel`, `mcp` |
| **D16.INV-3** | le contexte transmis au moteur, par MCP ou par un autre adaptateur, est minimisé, borné et masqué ; aucun secret ni identifiant n'y figure. | `mcp` |
| **D16.INV-4** | changer de moteur ne demande aucune modification de code ; chaque appel au moteur est journalisé avec fiche et version composée, moteur, empreinte du prompt, fragments injectés et usage. | `mcp` |
| **D16.INV-5** | aucun contenu du projet de l'application n'est transmis à un moteur externe tant que la configuration humaine ne porte pas l'autorisation de l'envoyer. | `mcp` |
| **D16.INV-6** | avec le profil souverain, une campagne complète aboutit sans autre connexion sortante que vers l'application cible et son fournisseur SSO. | `mcp` |

### D17 : Tableau de bord par rôle (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D17.INV-1** | le tableau de bord n'écoute que sur `127.0.0.1` et exige un jeton porteur. | `tableau-de-bord` |
| **D17.INV-2** | les droits de décision suivent les rôles : testeur (CP-0 à CP-3), développeur (CP-2, CP-5), référent qualité (CP-4, seulement depuis le tableau de bord). | `mcp`, `tableau-de-bord` |
| **D17.INV-3** | l'IHM ne présente aucune non-conformité RGAA 4.1 de niveau A ou AA. | `tableau-de-bord` |
| **D17.INV-4** | les textes de l'IHM, les messages et le journal de tests sont en français. | `tableau-de-bord` |

### D18 : Exploitation locale (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D18.INV-1** | sous une version de Node antérieure à 22.13, le kit refuse de démarrer avec un message explicite. | `donnees`, `exploitation` |
| **D18.INV-2** | le kit n'a que deux dépendances d'exécution, `playwright` et `pg`, épinglées par un fichier de verrouillage et installées par `npm ci` ; toutes ses dépendances et images sont sous licence open source. | `exploitation`, `accessibilite` |
| **D18.INV-3** | les données d'Agent2Test sont des fichiers SQLite, hors de son dépôt et du projet de l'application, sans serveur ni port ; la seule base de l'application qu'il joint est celle de l'oracle, en lecture seule (D23.INV-3). | `donnees`, `exploitation` |
| **D18.INV-4** | seul le profil d'environnement `local` est accepté ; un profil `recette` ou `conteneur` est refusé tant que la dimension D20 est réservée. | `preparateur`, `exploitation` |

### D19 : Accessibilité des parcours (axe) (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D20 : Profil recette et conteneur (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D21 : Données par agent, en SQLite (superseded)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D21.INV-1** | chaque agent propriétaire a son propre fichier SQLite, sur une connexion qui n'est qu'à lui ; un contrat ne s'exécute que sur la connexion de son propriétaire, et aucun contrat n'attache un autre fichier ni ne charge d'extension : un agent n'a aucun moyen d'écrire dans les données d'un autre. | `donnees` |
| **D21.INV-2** | seuls des contrats nommés s'exécutent ; une requête SQL libre est refusée. | `donnees` |
| **D21.INV-3** | la base de l'application n'est jamais accédée, sauf par l'oracle en lecture seule, activé explicitement dans la configuration humaine et limité à des contrats de lecture nommés. | `donnees` |
| **D21.INV-4** | les preuves sont purgées au-delà de leur durée de conservation ; le journal garde leurs empreintes. | `donnees` |
| **D21.INV-5** | chaque écriture est une transaction : un arrêt du processus, même brutal, ne laisse aucun enregistrement partiel ; un fichier qui échoue au contrôle d'intégrité de SQLite empêche le démarrage, avec son nom. | `donnees` |

### D22 : Relais du binôme par n8n, facultatif (superseded)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D22.INV-1** | Agent2Test ne dépend jamais du relais n8n : désactivé par défaut, une campagne s'ouvre et se mène à la main, à l'identique ; activé, c'est le relais qui appelle le serveur MCP, et Agent2Test n'ouvre aucune connexion vers n8n ni vers Agent2Dev. | `echange` |
| **D22.INV-2** | un jeton au rôle `relais` n'atteint que `a2t_deposer_remise`, `a2t_etat` et `a2t_rapport`, qui ne lui montrent que les remises et les campagnes qui en sont issues ; toute décision, toute ouverture de campagne, l'arrêt d'urgence et la reprise lui sont refusés. | `echange` |
| **D22.INV-3** | une remise déposée n'ouvre aucune campagne : un testeur ou le développeur l'ouvre, depuis le tableau de bord ou par MCP ; à l'ouverture, un commit, un fichier suivi modifié ou une empreinte de source qui diffère de la remise la rend périmée, et aucune campagne ne s'ouvre. | `echange` |
| **D22.INV-4** | une remise n'est reçue que conforme au schéma fermé `agent2test.remise/1`, sans contenu de fichier ni secret, et pour une racine admise : celle du profil d'environnement, ou une racine de `remises.racines` dans la configuration humaine. | `echange` |

### D23 : Données en un fichier unique, par l'agent médiateur (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D23.INV-1** | seul l'agent médiateur `donnees` ouvre le fichier de données, et les commandes humaines par son code ; chaque table a un seul agent propriétaire, dont elle porte le préfixe ; un contrat ne s'exécute que pour son propriétaire, et, au démarrage, le médiateur vérifie sur le plan d'exécution de SQLite que chaque contrat ne touche que des tables de son propriétaire, déclencheurs compris, sans attacher de fichier ni charger d'extension : un agent n'a aucun moyen d'écrire dans les données d'un autre. | `donnees`, `memoire` |
| **D23.INV-2** | seuls des contrats nommés s'exécutent ; une requête SQL libre est refusée. | `donnees` |
| **D23.INV-3** | la base de l'application n'est jamais accédée, sauf par l'oracle en lecture seule, activé explicitement dans la configuration humaine et limité à des contrats de lecture nommés. | `donnees`, `exploitation` |
| **D23.INV-4** | les preuves sont purgées au-delà de leur durée de conservation ; le journal garde leurs empreintes. | `donnees` |
| **D23.INV-5** | chaque écriture est une transaction : un arrêt du processus, même brutal, ne laisse aucun enregistrement partiel ; un fichier de données que SQLite refuse, ou qui échoue à son contrôle d'intégrité, empêche le démarrage. | `donnees` |

### D24 : Remises d'Agent2Dev, en fichier ou par dossier d'échange (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D24.INV-1** | Agent2Test ne dépend jamais de l'échange : en mode `manuel`, le défaut, une campagne s'ouvre et se mène à la main, à l'identique ; en mode `dossiers`, Agent2Test n'ouvre aucune connexion vers Agent2Dev, ne lit que les boîtes de sortie d'Agent2Dev déclarées dans la configuration humaine, en lecture seule, et n'écrit que dans sa propre boîte de sortie. | `echange` |
| **D24.INV-2** | une remise reçue, déposée par l'opérateur ou lue dans une boîte, n'ouvre aucune campagne : un testeur ou le développeur l'ouvre, depuis le tableau de bord ou par MCP ; à l'ouverture, un fichier suivi modifié ou une empreinte de source qui diffère de la remise la rend périmée, et aucune campagne ne s'ouvre. | `plan`, `orchestrateur`, `echange` |
| **D24.INV-3** | une remise n'est reçue que conforme au schéma fermé `agent2test.remise/1`, sans contenu de fichier ni secret ; elle s'ouvre sur la racine admise, celle du profil ou de `remises.racines`, dont `HEAD` est le commit remis, et jamais sur le chemin qu'elle cite ; sans racine admise à ce commit, elle est périmée. | `plan`, `echange` |
| **D24.INV-4** | en mode `dossiers`, Agent2Test ne dépose dans sa boîte de sortie que le journal de tests JSON clos d'une campagne issue d'une remise, octet pour octet, sous le nom de la remise et de la campagne, par un fichier provisoire renommé ensuite. | `echange` |

### D25 : Constat perceptif et témoignage (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D25.INV-1** | un constat ne se fonde que sur ce qu'une personne perçoit, par trois canaux : la vue (boîtes de l'arbre d'accessibilité et capture de la zone), le lecteur d'écran (rôles, noms accessibles, ordre de lecture) et le clavier (arrêts de la touche Tab) ; ni sélecteur sur la structure, ni attribut, ni texte du DOM, ni code exécuté dans la page n'établit un constat, et un élément sans surface n'est pas vu. | `navigateur` |
| **D25.INV-2** | chaque constat est une fonction pure de sa perception et des références ratifiées ; il se recalcule à l'identique, sans navigateur, depuis ses preuves scellées, et une preuve dont l'empreinte ne correspond plus rend le critère « non vérifié : preuve manquante ». | `navigateur`, `verdict` |
| **D25.INV-3** | une absence n'est constatée que dans une portée dont la présence a d'abord été constatée, une zone visible contenant au moins un élément du rôle observé ; sans cette ancre, le constat est « non constatable », jamais « absent », et le témoignage dit ce qui est vu à la place. | `navigateur` |
| **D25.INV-4** | un attendu qui porte sur chaque élément d'un ensemble exige au moins `auMoins` éléments perçus, 1 par défaut ; un ensemble plus petit rend le constat « non constatable » et le critère « non vérifié », jamais « conforme ». | `navigateur`, `verdict` |
| **D25.INV-5** | toute comparaison de texte déclare son mode, `exacte` ou `contient`, et sa casse, `exacte` ou `ignoree`, et normalise les espaces ; « seulement » et « exactement » s'écrivent `exacte` ; un attendu sans comparaison déclarée est rejeté avant toute exécution. | `navigateur`, `preparateur` |
| **D25.INV-6** | un pictogramme n'est reconnu que par ressemblance à une image de référence ratifiée en CP-2 et intacte, au seuil `vision.seuil` de la constitution ou au-dessus ; un parcours qui demande un pictogramme sans référence ratifiée est rejeté, et à l'exécution le constat est « non constatable », sans réessai. | `navigateur`, `preparateur`, `referentiel` |
| **D25.INV-7** | chaque étape `verifier` à attendu perceptif rend un témoignage, réussie ou non : portée regardée, canaux, règle de comparaison, ce qui a été vu, ce qui ne l'a pas été, et les preuves ; un canal déclaré mais non perçu rend le constat « non constatable » ; ce qu'un canal non déclaré voit autrement est rapporté en remarque, sans décider ; une étape `verifier` échouée n'empêche pas les `verifier` suivantes d'être jouées. | `navigateur`, `preparateur`, `journal`, `agent-tdd-jira`, `agent-tdd-jira/binome-agent2test`, `agent2dev` |
| **D25.INV-8** | un constat « vu » n'est retenu qu'après un second regard qui rend le même constat ; un regard pendant lequel la géométrie de la zone change ne vaut rien ; des regards discordants classent l'étape `INSTABILITE`, jamais « réussie ». | `navigateur`, `verdict` |

### D26 : Acceptable partagé : noyau du socle de l'acceptable, refus, leçons interdites, dérogations et faux refus (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D26.INV-1** | la constitution épingle le noyau du socle de l'acceptable inclus, par son nom, sa version et l'empreinte de son bloc `noyau`, et en reprend chaque entrée à l'identique, aucune dérogeable ; un écart empêche le démarrage. | `noyau`, `acceptable` |
| **D26.INV-2** | chaque refus d'une garde, de périmètre, d'écriture ou des leçons, cite les règles des entrées qui l'arrêtent, celles du noyau en tête ; il est journalisé et présenté au testeur ; une leçon candidate qui correspond à un motif de `leconsInterdites` n'est pas proposée ; tant que le contrat des kits n'est pas décrit, une entrée `horsKit` vaut partout. | `apprenant`, `acceptable` |
| **D26.INV-3** | seuls le testeur et le référent qualité répondent à un refus, depuis le tableau de bord ou par MCP, avec leur motif ; une dérogation n'est admise que si chaque entrée qui a refusé est propre à Agent2Test et déclarée dérogeable, jamais pour une entrée du noyau, et n'exécute l'action qu'une fois ; un faux refus n'exécute rien ; ni le moteur, ni un agent, ni l'échange ne répondent à un refus. | `mcp`, `tableau-de-bord`, `acceptable` |
| **D26.INV-4** | le journal de tests d'une campagne touchée par un refus porte la rubrique `acceptable` : chaque refus avec sa garde, ses règles et sa réponse, chaque refus et chaque réponse datés de leur ligne de journal, sans motif en clair ; le format garde son nom, et sa lecture par agent-tdd-jira ne change pas. | `acceptable` |

### D27 : Kit test : prérequis de données et nettoyage, confrontés, validés en CP-2, application déclarée (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D27.INV-1** | les prérequis de données des scénarios retenus ne deviennent le kit test de la campagne qu'après sa confrontation, avant CP-2, à la version épinglée du noyau et de la constitution, fichiers écrits, contenu et intention ; un kit qui enfreint une règle n'est pas remis, et le refus cite sa règle ; un kit conforme reçoit son manifeste `socle-acceptable.kit/1`, à l'empreinte de son patch, avec la version et l'empreinte du noyau confronté (`socle-acceptable:SA8.INV-1`). | `kit`, `socle-acceptable` |
| **D27.INV-2** | un kit test ne s'applique, par la fabrication de l'hôte, sur l'environnement de test, qu'après sa validation en CP-2, à son empreinte ; seuls le testeur et le développeur déclarent son application et son nettoyage, depuis le tableau de bord ; une déclaration pour un patch dont l'empreinte n'est plus celle du manifeste est refusée `KIT_MODIFIE` ; les parcours de ses scénarios ne se préparent, et ces scénarios ne se jouent, qu'après l'application déclarée ; aucun agent n'applique un kit ni ne déclare son application (`socle-acceptable:SA8.INV-2`). | `plan`, `mcp`, `kit` |
| **D27.INV-3** | le journal de tests d'une campagne dont un kit a été remis porte la rubrique `kits` : le kit avec ses scénarios, son environnement, son empreinte, sa validation, son application et son nettoyage, chacun daté de sa ligne de journal, avec le rôle de qui l'a validé ou déclaré ; un échec, déclaré avec son retour arrière, ne remplit que l'application ; le format garde son nom, et sa lecture par agent-tdd-jira ne change pas. | `kit` |

### D28 : Révision de la constitution : publication qui classe, examen et preuves d'un relâchement, rubrique `revisions` (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D28.INV-1** | chaque publication de la constitution, commande humaine qu'aucun agent n'appelle, se compare à la dernière publiée, que le grand livre porte entière, et se classe, première, neutre, renforcement ou relâchement, ses relâchements et ses renforcements nommés selon `EVOLUTION.md`, section 10.7 ; une constitution changée porte une version nouvelle ; ce qui ne relâche rien se publie seul, sans examen ni preuve. | `revision` |
| **D28.INV-2** | un relâchement ne se publie qu'avec l'examen de sa version, `constitution/examens/<version>.md`, au format `observatoire.examen/1`, d'objet `constitution`, d'un observateur sur un autre modèle, une réponse si l'avis est défavorable, et ses preuves : pour chaque entrée relâchée d'une liste, deux faux refus vérifiés, qui répondent à des refus de cette entrée, ou un incident déclaré, et un incident pour tout autre relâchement ; une entrée du noyau ne se relâche jamais ; à défaut, la publication est refusée, dit ce qui manque et n'écrit rien ; l'examen et la publication s'inscrivent ensemble au grand livre, `constitution.examinee` puis `constitution.publiee`. | `revision` |
| **D28.INV-3** | le journal de tests porte la rubrique facultative `revisions` dès que le grand livre porte une publication classée : chaque entrée `constitution.examinee` et `constitution.publiee`, avec son numéro et sa date au grand livre, la version et l'empreinte de la constitution, le sens et les relâchements et renforcements comptés d'une publication, l'avis d'un examen ; ni la constitution, ni l'examen, ni la réponse, ni les preuves ; le format garde son nom, et sa lecture par agent-tdd-jira ne change pas. | `revision` |

## agents-paralleles-gitlab 1.0.1

Plusieurs agents en parallèle sur un dépôt GitLab, une demande Jira par worktree : isolation, hooks communs, script agt, garde-fous GitLab, recette de 44 contrôles. Point d'entrée : [`specs/agents-paralleles-gitlab/SKILL.md`](specs/agents-paralleles-gitlab/SKILL.md).

### D1 : Isolation : une demande par worktree (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D1.INV-1** | une demande a un worktree nommé par sa clé Jira, sur une branche `<type>/<CLÉ>-<slug>` conforme aux conventions ; une même branche n'est jamais extraite dans deux worktrees. | `isolation`, `orchestration`, `recette`, `orchestrateur-c7e`, `skill4appli/watcher` |
| **D1.INV-2** | la branche d'une demande est créée sans branche amont ; son premier push crée la branche distante du même nom. | `isolation`, `recette` |
| **D1.INV-3** | le point de retour `agent/<CLÉ>/start` est posé et le worktree verrouillé avant que l'agent commence. | `isolation`, `orchestration`, `recette` |
| **D1.INV-4** | `travail/`, `.skills/`, `*.mht` et `*.mhtml` sont exclus de tous les worktrees par l'exclusion commune (`.bare/info/exclude`), sans modifier le `.gitignore` du projet. | `isolation`, `distribution`, `recette` |

### D2 : Garde-fous locaux : hooks communs (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | aucun commit sur `main`, `master`, `develop`, `release/*`, en HEAD détachée, ni sur une branche dont la clé n'est pas celle du worktree. | `hooks`, `recette` |
| **D2.INV-2** | tout commit, hors commit de fusion, commence par `<CLÉ> Snn : ` ou `<CLÉ> : `, de sorte que `git log --grep='^<CLÉ> '` retrouve tous les commits de la demande. | `hooks`, `recette`, `agent2dev/depot`, `orchestrateur-c7e` |
| **D2.INV-3** | aucun fichier interdit n'est commité, même forcé dans l'index : `.env`, clés et certificats, `*.mht`, `*.mhtml`, `.skills/`, `travail/`. | `hooks`, `recette`, `agent2dev/depot`, `socle-acceptable` |
| **D2.INV-4** | un worktree ne pousse que vers la branche de sa demande ou une branche `fix/tension-*`, et ne supprime aucune branche distante. | `hooks`, `recette` |
| **D2.INV-5** | aucun push ne réécrit une branche distante, avec ou sans `--force` ou `--force-with-lease`. | `hooks`, `recette`, `agent-tdd-jira/parallele`, `socle-acceptable` |

### D3 : Orchestration : script `agt` (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | `agt reset` ne réécrit aucun commit publié et crée une sauvegarde `backup/<CLÉ>-<horodatage>` avant toute écriture. | `orchestration`, `recette` |
| **D3.INV-2** | `agt sync` refuse un worktree non propre, rebase une branche jamais publiée et fusionne la base dans une branche publiée. | `orchestration`, `distribution`, `recette` |
| **D3.INV-3** | `agt done` ne supprime une branche que si elle est contenue dans la base distante, sauf `--abandon` explicite, et archive `travail/` avant de supprimer le worktree. | `orchestration`, `recette` |
| **D3.INV-4** | `agt ls` signale des hooks inactifs et toute URL de distant qui contient un identifiant ou un jeton. | `hooks`, `orchestration`, `gitlab`, `recette`, `socle-acceptable` |
| **D3.INV-5** | `agt` n'appelle pas GitLab et ne pousse rien. | `orchestration`, `recette` |

### D4 : Garde-fous GitLab (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D4.INV-1** | les push rules de `regles-gitlab.txt` acceptent tout ce que les hooks et `agt new` acceptent, refusent les sauvegardes `backup/` et les messages hors format, et reprennent l'expression des fichiers interdits du hook `pre-commit`. | `gitlab`, `recette` |
| **D4.INV-2** | une merge request est fusionnée par merge commit, sans squash : les commits de la demande entrent dans la base avec leur SHA. | `gitlab`, `recette` |
| **D4.INV-3** | les agents n'ont aucun accès à GitLab : aucun jeton dans le kit, dans un worktree ou dans une URL de distant. | `gitlab`, `recette` |

### D5 : Distribution et synchronisation des demandes (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D5.INV-1** | avant le code, `agt collisions` signale les chemins communs aux fiches d'impact (`travail/<CLÉ>/impact.txt`) de deux demandes actives, en marquant les points chauds. | `orchestration`, `distribution`, `recette` |
| **D5.INV-2** | pendant la réalisation, `agt collisions` signale les fichiers modifiés en commun par deux demandes, avec le résultat de la fusion simulée, dans le format stable du point E2. | `orchestration`, `distribution`, `recette` |
| **D5.INV-3** | une demande empilée part de la branche parente déclarée ; une fois la parente fusionnée par merge commit, elle n'apporte à la base que ses propres commits. | `distribution`, `recette` |

### D6 : Contrôle de la configuration GitLab par l'API, en lecture seule (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D7 : Tension entre demandes au niveau du dépôt (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

## analyse-projet 1.0.2

Expert en analyse de projet back et front, en lecture seule : cartographie, rapport et feuille de route, ou plans d'action pour les experts Java et Angular. Point d'entrée : [`specs/analyse-projet/SKILL.md`](specs/analyse-projet/SKILL.md).

### D1 : Cadrage et lecture seule (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D1.INV-1** | le mode (`cartographie`, `rapport` ou `plans`), le périmètre et les options sont explicites et confirmés par le développeur avant toute analyse. | `cadrage` |
| **D1.INV-2** | l'analyste ne modifie aucun fichier du projet, aucune configuration, aucun historique Git, et n'exécute aucune commande qui écrit vers un système externe. | `cadrage` |
| **D1.INV-3** | toute source inaccessible ou non lue est déclarée comme limite dans le livrable. | `cadrage` |

### D2 : Cartographie back, front et frontière (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | chaque élément cartographié cite sa source (fichier, ou commande et extrait de sortie). | `cartographie` |
| **D2.INV-2** | la matrice de frontière couvre tous les endpoints connus et tous les appels du front, et chaque écart est listé. | `cartographie` |

### D3 : Évaluation par axes (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | chaque constat a une preuve vérifiable, un axe, une règle de référence et une gravité. | `evaluation` |
| **D3.INV-2** | une hypothèse est étiquetée comme telle, avec un niveau de confiance et les données qui permettraient de la confirmer. | `evaluation` |
| **D3.INV-3** | chaque axe retenu est soit évalué en entier sur le périmètre, soit marqué « non évalué » ou « échantillonné » avec la raison. | `cadrage`, `evaluation` |

### D4 : Rapport et feuille de route (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D4.INV-1** | chaque recommandation renvoie à au moins un constat. | `rapport` |
| **D4.INV-2** | la feuille de route est ordonnée selon des critères écrits (gravité, impact, effort, dépendances) et présentée comme une proposition. | `rapport` |
| **D4.INV-3** | à entrées identiques, le rapport attribue les mêmes identifiants et le même ordre aux constats. | `rapport`, `delta` |
| **D4.INV-4** | l'annexe `analyse.json` respecte le schéma version 1. | `rapport` |

### D5 : Plans d'action pour les experts (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D5.INV-1** | chaque plan vise un seul skill destinataire, à une version donnée, et cite les invariants de ce skill qu'il fait respecter. | `plans-action` |
| **D5.INV-2** | chaque plan a des critères d'acceptation vérifiables, ses risques et son mode de retour arrière. | `plans-action` |
| **D5.INV-3** | l'analyste n'exécute aucun plan. | `plans-action` |
| **D5.INV-4** | une modification du contrat d'API produit des plans liés pour le back et le front, dans un ordre de livraison qui ne casse pas la version publiée de l'API (SC1.INV-2). | `plans-action` |

### D6 : Comparaison de deux analyses (delta) (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

## angular 1.0.1

Expert Angular 20 : produire et relire du code conforme à des invariants vérifiables, accessibilité RGAA et WCAG comprise. Point d'entrée : [`specs/angular/SKILL.md`](specs/angular/SKILL.md).

### D1 : Architecture standalone par fonctionnalité (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D1.INV-1** | tout nouveau composant, directive ou pipe est autonome (standalone) ; aucun nouveau `NgModule`. | `architecture`, `tests`, `revue`, `analyse-projet/evaluation`, `orchestrateur-c7e/meso-contrats` |
| **D1.INV-2** | les dépendances respectent les couches : une fonctionnalité n'importe pas une autre fonctionnalité ; `ui` n'injecte aucun service de données ; `data-access` ne contient aucun composant. | `architecture`, `tests`, `analyse-projet/evaluation` |
| **D1.INV-3** | TypeScript en mode `strict` et templates en `strictTemplates`. | `architecture`, `tests`, `revue`, `analyse-projet/evaluation` |

### D2 : Composants à signaux (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | chaque composant est en `ChangeDetectionStrategy.OnPush`. | `composants`, `tests`, `revue`, `agent-tdd-jira/variantes`, `agent-tdd-jira/cycle-tdd`, `analyse-projet/evaluation`, `orchestrateur-c7e/meso-contrats` |
| **D2.INV-2** | les templates utilisent le flux de contrôle intégré (`@if`, `@for`, `@switch`) ; chaque `@for` a un `track` sur un identifiant stable. | `composants`, `tests`, `migration-angular22`, `analyse-projet/evaluation`, `orchestrateur-c7e/meso-contrats` |
| **D2.INV-3** | un nouveau composant déclare ses entrées et sorties avec `input()`, `output()` ou `model()`. | `composants`, `tests`, `analyse-projet/evaluation`, `orchestrateur-c7e/meso-contrats` |
| **D2.INV-4** | aucun abonnement manuel dans un composant sans `takeUntilDestroyed` ; la forme préférée est `toSignal` ou le pipe `async`. | `composants`, `tests`, `analyse-projet/evaluation`, `orchestrateur-c7e/meso-contrats` |
| **D2.INV-5** | `effect()` ne sert jamais à écrire dans un autre signal pour en dériver la valeur ; on utilise `computed` ou `linkedSignal`. | `composants`, `tests`, `revue`, `analyse-projet/evaluation` |

### D3 : Données HTTP conformes au socle (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | les endpoints du contrat ne sont appelés qu'au travers du client généré (application de SC1.INV-3). | `donnees-http`, `tests`, `revue`, `bff-node`, `agent-tdd-jira/variantes`, `agent-tdd-jira/cycle-tdd`, `agent2dev/conception`, `analyse-projet/evaluation`, `orchestrateur-c7e/meso-contrats` |
| **D3.INV-2** | les erreurs HTTP sont converties en un seul point en `ApiProblem` ; les décisions se fondent sur `status` et `code`, jamais sur `title` ou `detail` (application de SC2.INV-2). | `donnees-http`, `tests`, `agent-tdd-jira/variantes`, `analyse-projet/evaluation` |
| **D3.INV-3** | aucun composant de la couche `ui` ne déclenche de requête HTTP. | `donnees-http`, `tests`, `analyse-projet/evaluation`, `orchestrateur-c7e/meso-contrats` |
| **D3.INV-4** | aucun calcul monétaire en virgule flottante côté front (application de SC3.INV-2). | `donnees-http`, `tests`, `revue`, `analyse-projet/evaluation` |

### D4 : Formulaires réactifs typés (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D4.INV-1** | tout nouveau formulaire est réactif et typé ; aucun `UntypedFormGroup` ni `any` dans son modèle. | `formulaires`, `tests`, `revue`, `analyse-projet/evaluation` |
| **D4.INV-2** | chaque erreur de validation renvoyée par le back est rattachée au contrôle correspondant (application de SC6.INV-1) ; une erreur sans contrôle correspondant est affichée dans le résumé d'erreurs. | `formulaires`, `tests`, `revue`, `analyse-projet/evaluation` |
| **D4.INV-3** | chaque champ a un libellé associé, et son message d'erreur lui est lié par `aria-describedby`. | `formulaires`, `tests`, `revue`, `analyse-projet/evaluation`, `analyse-projet/rapport`, `orchestrateur-c7e/meso-contrats` |

### D5 : Routage et sécurité (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D5.INV-1** | chaque fonctionnalité est chargée à la demande (`loadComponent` ou `loadChildren`). | `routage-securite`, `tests`, `revue`, `analyse-projet/evaluation` |
| **D5.INV-2** | aucun `bypassSecurityTrust*` ni `innerHTML` alimenté par une donnée non maîtrisée, sauf justification écrite et revue. | `routage-securite`, `tests`, `analyse-projet/evaluation` |
| **D5.INV-3** | le jeton d'accès n'est jamais dans une URL, dans `localStorage` ni dans un journal, et l'intercepteur ne l'envoie qu'à l'origine de l'API. | `donnees-http`, `routage-securite`, `tests`, `bff-node`, `agent-tdd-jira/variantes`, `analyse-projet/evaluation` |
| **D5.INV-4** | les gardes de route améliorent l'expérience mais ne sont jamais la seule protection d'une donnée ; le back décide (application de SC4). | `routage-securite`, `revue`, `analyse-projet/evaluation` |

### D6 : Accessibilité RGAA 4.1, WCAG 2.2 AA (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D6.INV-1** | aucune erreur des règles d'accessibilité des templates d'`angular-eslint`. | `accessibilite`, `tests`, `revue`, `analyse-projet/evaluation`, `sonarqube/triage` |
| **D6.INV-2** | aucune violation axe des niveaux WCAG A et AA sur les parcours couverts par les tests de bout en bout. | `accessibilite`, `tests`, `agent2test/accessibilite`, `analyse-projet/evaluation` |
| **D6.INV-3** | à chaque navigation, le titre du document change et le focus est placé sur le titre principal de la page. | `architecture`, `routage-securite`, `accessibilite`, `tests`, `analyse-projet/evaluation` |
| **D6.INV-4** | tout message qui apparaît sans action de l'utilisateur sur l'élément concerné (chargement terminé, erreur, confirmation) est annoncé aux technologies d'assistance. | `donnees-http`, `accessibilite`, `tests`, `revue`, `agent-tdd-jira/variantes`, `agent-tdd-jira/cycle-tdd`, `analyse-projet/evaluation`, `orchestrateur-c7e/meso-contrats` |

### D7 : Tests et contrôles automatisés (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D7.INV-1** | chaque invariant actif a au moins un contrôle automatisé, ou une entrée de grille de revue justifiée. | `tests`, `revue`, `analyse-projet/evaluation` |
| **D7.INV-2** | les tests unitaires n'émettent aucune requête réseau réelle ; les appels HTTP sont vérifiés avec `HttpTestingController`. | `tests`, `analyse-projet/evaluation` |
| **D7.INV-3** | les tests ciblent les éléments par rôle, libellé ou harnais, jamais par une classe CSS de présentation. | `tests`, `analyse-projet/evaluation` |
| **D7.INV-4** | aucun test ne dépend de l'heure réelle ni d'un délai réel. | `tests`, `revue`, `analyse-projet/evaluation` |

### D8 : Revue de code (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D8.INV-1** | chaque constat cite un emplacement (`fichier:ligne`), l'invariant concerné ou la mention « hors invariant » avec sa justification, une gravité et une correction proposée. | `revue` |
| **D8.INV-2** | en mode relire, l'expert ne modifie aucun fichier sans demande explicite. | `revue` |
| **D8.INV-3** | les constats sont classés par gravité décroissante, et un constat sans preuve est présenté comme une question. | `revue` |

### D9 : Migration vers Angular 22 (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D10 : BFF Node entre Angular et les API (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

## capture-sprint-jira 1.2.2

Capture en MHTML des tickets du prochain sprint d'un Jira protégé par un SSO, rangés dans un dossier par catégorie : connexion faite à la main dans le navigateur du poste, relevé et filtre des tickets, une page MHTML par ticket, classement par section de la page du sprint (IA et DEV par défaut), capture d'un ticket seul par son adresse, rapport, interface locale, ligne de commande, agent capteur-sprint, export par l'API REST sans SSO. Point d'entrée : [`specs/capture-sprint-jira/SKILL.md`](specs/capture-sprint-jira/SKILL.md).

### D1 : Exécution : installation, dépendance, emplacements, réglages (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D1.INV-1** | le skill demande Node 20 ou plus récent et une seule dépendance, `playwright-core` à version exacte, qui pilote le navigateur installé sur le poste sans en télécharger ; Python 3 n'est demandé que par le script d'export facultatif. | `execution`, `recette` |
| **D1.INV-2** | tout ce que le skill écrit par défaut reste dans son dossier : profil (`.jira-profile/`), captures (`mhtml/`) et exports (`exports/`) ; son `.gitignore` les écarte, avec `node_modules/` et tout fichier `.mhtml`. | `execution`, `session`, `classement`, `recette` |
| **D1.INV-3** | chaque réglage de déploiement se lit dans sa variable `JIRA_CAPTURE_CHANNEL`, `JIRA_CAPTURE_PROFILE` ou `JIRA_CAPTURE_PAGE_TIMEOUT_MS`, ou prend son défaut ; une variable vide vaut absente. | `execution`, `recette` |

### D2 : Session SSO : connexion à la main, profil dédié (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | aucun outil de capture ne demande, ne lit ni ne stocke d'identifiant, de mot de passe ou de jeton : la connexion se fait à la main, dans une fenêtre visible du navigateur. | `session`, `ticket`, `interface`, `agent`, `recette`, `pilotage`, `scenario-playwright` |
| **D2.INV-2** | la session vit dans un profil de navigateur dédié, réutilisé d'une ouverture à l'autre : un SSO aux cookies persistants ne redemande pas la connexion. | `session`, `recette`, `scenario-playwright` |

### D3 : Relevé des tickets sur la page du sprint, filtre (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | la page du sprint défile par pas de 80 % de la hauteur affichée de chaque bloc qui défile, jusqu'à ce que, quatre pas de suite, rien ne défile plus et qu'aucun ticket nouveau n'apparaisse ; les liens `/browse/<CLÉ>` sont relevés à chaque pas, hors navigation (menus, éléments récents), si bien qu'une liste virtualisée ne fait perdre aucun ticket, même dans une petite fenêtre ; une fenêtre trop petite pour afficher la liste est agrandie avant le relevé, et chaque pas de défilement est signalé à la page par un événement `scroll`. | `releve`, `recette` |
| **D3.INV-2** | un ticket est retenu si la partie projet de sa clé commence par le préfixe et si son numéro est entre les bornes, comprises ; un préfixe et des bornes vides retiennent tout ; une valeur invalide est refusée avant toute capture. | `releve`, `recette` |
| **D3.INV-3** | chaque clé n'est capturée qu'une fois, quelle que soit la forme de ses liens (relatif, absolu, casse) ; les tickets retenus sont capturés un à un, par numéro croissant. | `releve`, `recette` |

### D4 : Capture des pages de tickets en MHTML (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D4.INV-1** | une page n'est capturée que si elle est celle du ticket : adresse `…/browse/<CLÉ>` ou titre qui la contient, et clé affichée ; sinon, passé le délai, le ticket est en erreur et rien n'est écrit pour lui. | `execution`, `capture`, `ticket`, `recette` |
| **D4.INV-2** | avant la capture, la page du ticket défile tant que son texte s'allonge, puis attend qu'il ne change plus : un contenu chargé à l'affichage figure dans le fichier. | `capture`, `ticket`, `recette` |
| **D4.INV-3** | chaque fichier est un MHTML de Chrome, au format « Page Web, un seul fichier » d'« Enregistrer sous… », nommé par la clé du ticket. | `capture`, `ticket`, `recette`, `scenario-playwright`, `scenario-playwright/jira` |
| **D4.INV-4** | une erreur n'arrête pas la capture ; trois erreurs de suite, ou la fermeture du navigateur, l'arrêtent ; le rapport dit ce qui a été capturé et que la capture s'est arrêtée ; fermé pendant le relevé, avant tout ticket, le navigateur arrête la capture sans rapport, avec un message qui le dit. | `execution`, `capture`, `interface`, `recette` |

### D5 : Classement par terme clé dans la page du ticket, dossiers et rapport (superseded)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D5.INV-1** | la catégorie d'un ticket est le terme clé trouvé dans sa page, sans tenir compte de la casse ni des accents, ses mots séparés par une espace, un tiret, un `_` ou rien, et pris entiers. | `classement` |
| **D5.INV-2** | les textes de la page sont lus dans cet ordre : contenu principal visible, contenu principal avec ses panneaux repliés, page visible hors navigation ; le premier qui contient un terme décide ; la navigation de Jira n'est jamais lue. | `classement` |
| **D5.INV-3** | un seul terme trouvé : le ticket va dans le dossier de sa catégorie ; aucun, ou plusieurs : dans `à classer` ; aucune catégorie n'est jamais devinée. | `classement` |
| **D5.INV-4** | les dossiers de catégorie sont créés directement dans le dossier de sortie choisi ; une nouvelle capture d'un ticket remplace son fichier et retire sa copie d'un autre dossier de catégorie ; un ticket en erreur garde sa capture précédente. | `classement` |
| **D5.INV-5** | une catégorie est un nom de dossier valide sous Windows et sous Linux ; une catégorie en double, ou nommée `à classer`, est refusée. | `classement` |
| **D5.INV-6** | chaque capture écrit `sprint.mhtml`, la page du sprint, et `rapport.json` : filtre, catégories et, pour chaque ticket, sa catégorie, l'endroit et l'extrait où le terme a été trouvé, ou son erreur. | `classement` |

### D6 : Interfaces : page locale et ligne de commande (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D6.INV-1** | les interfaces locales écoutent sur `127.0.0.1` seulement ; elles refusent un hôte autre que `127.0.0.1` ou `localhost` et une origine autre que la leur (403), et un corps qui n'est pas du JSON (415). | `interface`, `export-api`, `recette` |
| **D6.INV-2** | une seule capture à la fois, en tâche de fond ; son avancement et son rapport se lisent par `GET /api/status` ; fermer le navigateur l'arrête. | `ticket`, `interface`, `recette` |
| **D6.INV-3** | les valeurs saisies dans la page (adresse, préfixe, numéros, catégories, dossier) restent dans le navigateur du développeur, en stockage local ; le serveur ne les écrit que dans le rapport de la capture. | `interface`, `agent`, `recette` |
| **D6.INV-4** | après une capture sans erreur, le navigateur se ferme ; après une erreur ou un arrêt, il reste ouvert et revient à la page du sprint, pour une nouvelle tentative. | `capture`, `interface`, `recette` |
| **D6.INV-5** | la ligne de commande fait la même capture, avec les mêmes filtre, catégories et dossier de sortie ; elle sort avec le code 2 sur une option invalide, 1 si un ticket est en erreur, 0 sinon. | `interface`, `recette` |

### D7 : Agent capteur-sprint (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D7.INV-1** | l'agent ne demande, ne lit ni ne saisit aucun identifiant ; il laisse le développeur se connecter et attend sa confirmation avant de lancer la capture. | `agent` |
| **D7.INV-2** | l'agent rend le bilan du rapport (tickets par catégorie, tickets à classer, avertissements sur les sections, erreurs, arrêt) et ne déplace, ne renomme ni ne supprime aucun fichier capturé sans l'accord du développeur. | `classement`, `agent` |
| **D7.INV-3** | l'agent n'écrit ni l'adresse, ni le préfixe, ni les numéros du Jira du développeur dans un fichier du skill ou d'un dépôt. | `agent` |

### D8 : Export par l'API REST, sans SSO (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D8.INV-1** | l'identifiant, le mot de passe ou le jeton ne servent qu'à la requête en cours vers Jira : ils ne sont écrits ni sur le disque, ni dans un journal, ni dans une sortie. | `export-api`, `recette` |
| **D8.INV-2** | le prochain sprint est le sprint futur qui démarre le plus tôt ; la pagination de l'API est suivie jusqu'au dernier élément ; un tableau ambigu est signalé, sans choix arbitraire. | `export-api`, `recette` |
| **D8.INV-3** | l'export donne un ticket par ligne, description au format ADF mise à plat et ticket non assigné nommé comme tel ; le CSV du script Python est en UTF-8 avec BOM et séparateur « ; », pour Excel. | `export-api`, `recette` |

### D9 : Remise des tickets capturés à agent-tdd-jira (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D10 : Pilotage de la capture par un autre outil (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D11 : Classement par section de la page du sprint, dossiers et rapport (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D11.INV-1** | la catégorie d'un ticket est celle de sa section sur la page du sprint ; un en-tête de section est un élément visible dont tout le texte est le nom d'une catégorie, sans tenir compte de la casse ni des accents, hors navigation et hors lien de ticket ; la section d'un ticket est le bloc d'en-tête qui le contient (couloir, sprint) ou, dans une liste plate, le dernier en-tête qui le précède. | `releve`, `classement`, `recette` |
| **D11.INV-2** | un ticket qu'aucun en-tête ne précède, ou placé après la fin d'un couloir de catégorie, va dans `à classer` ; aucune catégorie n'est jamais devinée ; dans une liste virtualisée, un ticket garde la section de l'en-tête sorti de la page. | `releve`, `classement`, `agent`, `recette` |
| **D11.INV-3** | les dossiers de catégorie sont créés directement dans le dossier de sortie choisi ; une nouvelle capture d'un ticket remplace son fichier et retire sa copie d'un autre dossier de catégorie ; un ticket en erreur garde sa capture précédente. | `capture`, `classement`, `ticket`, `interface`, `recette` |
| **D11.INV-4** | une catégorie est un nom de dossier valide sous Windows et sous Linux ; une catégorie en double une fois normalisée, ou nommée `à classer`, est refusée. | `classement`, `recette` |
| **D11.INV-5** | chaque capture écrit `sprint.mhtml`, la page du sprint, et `rapport.json` : filtre, catégories, en-têtes comptés et, pour chaque ticket, sa catégorie et la ligne de l'en-tête de sa section, ou son erreur. | `classement`, `recette` |
| **D11.INV-6** | une catégorie dont aucun en-tête n'est suivi de tickets, ou dont plusieurs le sont, est signalée à la fin de la capture, dans l'interface et en ligne de commande, sans l'arrêter. | `classement`, `interface`, `agent`, `recette` |

### D12 : Capture d'un ticket seul par son adresse (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D12.INV-1** | un ticket se capture seul par son adresse `…/browse/<CLÉ>`, dans la session du navigateur ouvert, avec les mêmes attentes et le même MHTML que dans la capture d'un sprint ; une adresse sans clé est refusée avant toute capture. | `ticket`, `recette` |
| **D12.INV-2** | le dossier d'un ticket capturé seul est choisi par le développeur parmi les catégories et `à classer`, tout autre nom refusé ; il est proposé d'après le dossier du ticket dans le dernier `rapport.json` du dossier de sortie, sinon `à classer` ; la section n'est jamais devinée. | `ticket`, `agent`, `recette` |
| **D12.INV-3** | la capture d'un ticket seul remplace son fichier, retire sa copie d'un autre dossier de catégorie, et remplace ou ajoute son entrée dans `rapport.json`, avec le choix noté et les décomptes recalculés, ou crée ce rapport ; en cas d'erreur, rien n'est écrit. | `ticket`, `recette` |
| **D12.INV-4** | après la capture d'un ticket seul, réussie ou non, le navigateur revient à la page où il était. | `ticket`, `recette` |

## explication-hote-ia 1.1.0

Agent qui explique le fonctionnement de l'outil d'IA qui l'exécute, Gemini CLI ou un hôte non reconnu décrit sans être nommé, d'abord pour les développeurs qui hésitent à s'en servir faute d'en voir le fonctionnement : parcours découverte qui ouvre la boîte noire, en langage simple ; boucle d'un tour, assemblage du contexte, outils et politique, confiance, composants, mémoire, modèle, ce qui sort du poste, angles morts ; carte de l'installation et diagnostic ; chaque affirmation étiquetée par sa provenance ; script Node en lecture seule qui ne rend aucun secret ; se diffuse seul, avec son mode d'emploi, installé par Gemini CLI depuis son dossier ou un fichier .skill. Point d'entrée : [`specs/explication-hote-ia/SKILL.md`](specs/explication-hote-ia/SKILL.md).

### D1 : Exécution du script : lecture seule, sorties, codes, bornes (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D1.INV-1** | le script ne fait que lire : il ne crée, ne modifie ni ne supprime aucun fichier, ne lance aucun processus et n'ouvre aucune connexion ; il n'importe aucun module de processus ni de réseau. | `execution`, `recette`, `comparaison` |
| **D1.INV-2** | une réussite sort avec le code 0 et un objet sur une ligne, qui porte la commande, la version du skill, le numéro de schéma et la date ; un échec sort avec un code documenté (1 usage, 2 introuvable, 3 chemin refusé, 4 erreur interne) et un JSON `{"ok": false, ...}` sur la sortie d'erreur ; une commande réservée sort avec le code 1. | `execution`, `recette`, `comparaison` |
| **D1.INV-3** | toute liste est bornée par `--max` et tout document par `--max-caracteres` ; chaque troncature est signalée dans la sortie. | `execution`, `recette` |
| **D1.INV-4** | le script et sa recette n'utilisent que les modules natifs de Node 20 ou plus récent ; aucune installation de paquet n'est nécessaire. | `execution` |

### D2 : Identification de l'hôte : famille, preuve, paquet, version, documentation, hôte non reconnu (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | la famille de l'hôte et son paquet portent la nature de leur preuve : observé (variable `GEMINI_CLI=1` que l'hôte pose dans ses commandes, processus parent), déclaré (option `--paquet`), déduit (première commande `gemini` du PATH) ; une preuve déduite ou déclarée n'est jamais rendue comme observée. | `hote`, `recette` |
| **D2.INV-2** | la version et la documentation sont celles du paquet trouvé ; `doc` ne rend que des documents Markdown de son dossier de documentation, et refuse tout chemin absolu ou qui en sort. | `hote`, `recette` |
| **D2.INV-3** | un hôte non reconnu est décrit par des candidats déduits de ce qui s'observe (dossiers cachés de configuration d'agents, fichiers de consignes), sans configuration ni nom prêtés ; sans configuration de Gemini CLI, `config`, `contexte` et `composants` le disent au lieu d'en inventer une. | `hote`, `agent`, `recette`, `autres-hotes` |

### D3 : Configuration observée : couches, valeurs effectives, confiance, `.env`, variables (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | chaque valeur effective d'un réglage observé porte la couche qui la donne, dans l'ordre de l'hôte (défauts système, utilisateur, workspace, système) ; la couche du workspace est écartée, avec sa raison, si le dossier n'est pas fiable ou si la racine est le dossier d'accueil ; un réglage hors de la liste observée n'est jamais rendu. | `configuration`, `recette` |
| **D3.INV-2** | un fichier de réglages est lu comme l'hôte le lit, commentaires compris ; un fichier illisible est signalé avec sa ligne, sans aucun extrait de son contenu, et les autres couches restent lues. | `configuration`, `secrets`, `recette` |
| **D3.INV-3** | la confiance du dossier s'évalue dans l'ordre de l'hôte : variables d'environnement, réglage `security.folderTrust.enabled`, fichier des dossiers de confiance, où la règle la plus longue l'emporte et `TRUST_PARENT` vaut pour le dossier parent ; ce que le script ne peut pas observer, un IDE compagnon connecté, est dit. | `configuration`, `recette` |
| **D3.INV-4** | le fichier `.env` que l'hôte chargerait est désigné avec les noms de ses variables ; les variables d'environnement observées forment une liste fermée, et les surcharges de réglages par l'environnement sont nommées. | `configuration`, `recette` |

### D4 : Composants : skills, sous-agents, commandes, extensions, serveurs MCP, hooks, politiques (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D4.INV-1** | skills, sous-agents, commandes, extensions, serveurs MCP, hooks et politiques sont rendus avec leur portée ; entre homonymes, celui qui l'emporte est désigné et chacun des autres marqué masqué ; les écarts d'en-tête sont signalés. | `composants`, `recette` |
| **D4.INV-2** | un composant que l'hôte ignorerait (dossier non fiable, désactivation, exclusion) est rendu marqué ignoré, avec sa raison, jamais omis. | `composants`, `recette` |

### D5 : Contexte : fichiers par palier, imports, mémoire privée, trace de session, prompt exporté (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D5.INV-1** | les fichiers de contexte sont désignés par palier, comme l'hôte les cherche : global, projet de la racine jusqu'au dépôt (marqueurs réglés) dans l'ordre des chemins triés, extensions, et à la demande dans les sous-dossiers, ces derniers en déduits ; sans confiance, aucun fichier du projet n'est annoncé comme chargé. | `contexte`, `recette` |
| **D5.INV-2** | les imports `@chemin` d'un fichier de contexte sont listés avec leur existence, hors blocs de code. | `contexte`, `recette` |
| **D5.INV-3** | la trace de la dernière session ne rend que des chemins, des dates et les balises posées par l'hôte, jamais le texte d'un message ; elle dit qu'elle n'est pas forcément celle de la conversation en cours. | `contexte`, `recette` |
| **D5.INV-4** | un prompt système exporté par le développeur se lit en titres, skills et leurs emplacements, sous-agents, fichiers de contexte chargés et balises ; un fichier absent sort avec le code 2. | `contexte`, `agent`, `recette` |

### D6 : Provenance des affirmations et angles morts (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D6.INV-1** | toute affirmation de l'agent sur l'hôte porte une étiquette, `[observé]`, `[déclaré]`, `[documenté]`, `[déduit]` ou `[inconnu]`, et sa source. | `provenance`, `agent` |
| **D6.INV-2** | l'agent ne tire jamais de sa propre impression son identité de modèle, sa version, la version de l'hôte, ses réglages ni les limites de son contexte : seulement d'une observation ; quand il parle du modèle, il signale que le routage automatique et les sous-agents peuvent en employer d'autres. | `provenance`, `diagnostic`, `agent` |
| **D6.INV-3** | entre deux sources contradictoires, l'observation de la session l'emporte sur la documentation, qui l'emporte sur la déduction ; la contradiction est dite avec ses deux sources, jamais tranchée en silence. | `provenance`, `modele-hote`, `agent` |
| **D6.INV-4** | les angles morts sont nommés : ce qui ne s'observe pas d'ici est rendu `[inconnu]`, avec le moyen de l'observer quand il en existe un. | `provenance`, `agent` |
| **D6.INV-5** | un repère daté d'une autre version de l'hôte que celle observée se signale « à revérifier », et la documentation de la version installée fait foi pour elle. | `provenance`, `hote`, `modele-hote`, `agent`, `diffusion` |

### D7 : Agent explicateur : niveaux d'observation, modes, parcours découverte, pédagogie, protocole, commandes (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D7.INV-1** | l'explication d'une session, de son contexte et de ses outils, se fait dans cette session, skill activé ; un sous-agent dit qu'il ne voit pas le contexte de la session qui l'appelle et rend ce qu'il peut observer. | `provenance`, `diagnostic`, `agent` |
| **D7.INV-2** | l'agent ne modifie aucun fichier pendant qu'il explique ; une modification de configuration se décrit (fichier, clé, valeur, effet attendu) et ne s'applique que sur demande explicite du développeur, hors du rôle d'explicateur. | `modele-hote`, `diagnostic`, `agent`, `diffusion` |
| **D7.INV-3** | avant toute affirmation sur cette installation, l'agent lance l'instantané, en commençant par `hote`, et cite la version observée de l'hôte. | `diagnostic`, `agent` |
| **D7.INV-4** | pour qui découvre l'outil, chaque étape du parcours découverte répond à une question du développeur en langage simple, montre sur cette installation ce qu'elle affirme quand cela s'observe, et dit ce que le développeur garde en main ; un terme technique s'explique à sa première apparition, et les étiquettes s'écrivent en clair. | `provenance`, `modele-hote`, `agent` |
| **D7.INV-5** | l'agent explique sans chercher à convaincre : une limite ou un risque de l'outil se dit aussi clairement qu'un garde-fou, et une inquiétude sans réponse vérifiable reçoit `[inconnu]`, avec le moyen de la vérifier, jamais une réassurance. | `modele-hote`, `agent` |

### D8 : Secrets et vie privée (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D8.INV-1** | aucune valeur secrète ne sort du script : des noms seulement pour les variables, les en-têtes et les clés sensibles ; toute valeur rendue passe par un masquage par motifs, puis toute la sortie une seconde fois. | `execution`, `configuration`, `composants`, `secrets`, `recette`, `comparaison` |
| **D8.INV-2** | aucun texte de conversation, de prompt de lancement ni de fichier de contexte ne sort du script : des chemins, des tailles, des dates et des balises. | `hote`, `contexte`, `secrets`, `recette` |
| **D8.INV-3** | l'agent ne recopie jamais une valeur secrète qu'il a vue, dans un fichier ou une sortie ; il dit seulement qu'elle existe et où. | `secrets`, `agent` |

### D9 : Modèle de fonctionnement de l'hôte : repères vérifiés, parcours, diagnostics (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D9.INV-1** | chaque repère du module `modele-hote` porte la version de l'hôte, la date et la source de sa vérification (document de la version, code relu, essai réel) ; la recette des repères les confronte au Gemini CLI réel de cette version, sans réseau, à chaque modification de la spécification. | `modele-hote`, `recette` |
| **D9.INV-2** | un diagnostic suit la table du module `diagnostic` : chaque hypothèse se confirme ou s'écarte par une observation nommée, et la cause retenue est étiquetée ; faute d'observation décisive, le diagnostic le dit et propose l'observation qui manque. | `diagnostic`, `agent` |

### D10 : Autres hôtes reconnus, chacun par un adaptateur (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D11 : Comparaison de deux instantanés dans le temps (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D12 : Diffusion autonome : un dossier qui se suffit, installation par l'hôte, mode d'emploi joint, retrait complet (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D12.INV-1** | le dossier du skill se suffit : l'installer, le vérifier et s'en servir ne demandent que ce dossier, Node 20 ou plus récent et l'hôte ; aucune étape du skill ne passe par un dépôt, un outil ou un fichier extérieur au dossier, ni par le réseau, et seul l'hôte parle à son modèle, comme il le fait sans le skill. | `agent`, `diffusion` |
| **D12.INV-2** | dans Gemini CLI, le skill s'installe par la commande de l'hôte, `gemini skills install`, depuis son dossier ou un fichier `.skill`, et n'y devient qu'un seul skill, ses modules n'étant jamais pris pour des skills ; ses six fichiers exécutables s'en tirent ensuite par la commande d'extraction, puis la recette passe ; un écart ou un échec arrête l'installation. | `diffusion` |
| **D12.INV-3** | le mode d'emploi `MODE-EMPLOI.md` fait partie du dossier et de la transmission, et porte la version du skill ; ses commandes sont, à l'identique, celles des modules `execution` et `diffusion`, et ses renvois ne sortent pas du dossier. | `diffusion` |
| **D12.INV-4** | hors du dossier du skill, rien ne s'écrit sans la demande du développeur : le sous-agent et les commandes s'installent par une commande qu'il lance ou qu'il approuve, une commande de retrait les supprime, et, avec `gemini skills uninstall`, rien ne reste. | `agent`, `diffusion` |
| **D12.INV-5** | le dépôt où le skill est maintenu se nomme comme son origine et le lieu de sa vérification, jamais comme une étape ; le contrat de version, les règles et la recette du skill sont écrits dans le skill. | `recette`, `diffusion` |

## generateur-skill-ticket 1.5.0

Générateur de skills de ticket C7E : décompose un ticket en arbre de sous-tickets, produit pour chaque nœud un skill assemblé depuis le référentiel des méso-contrats, l'installe et le lance dans Gemini CLI ; chaque skill s'observe dans un champ partagé, et chaque niveau voit le ticket augmenté ; l'observateur d'ordre 3 peut juger sur un autre modèle que la session ; chaque ticket entraîne le générateur, qui propose ses évolutions au développeur ; ses observations s'exportent, minimisées, vers le socle d'observation du dépôt. Point d'entrée : [`specs/generateur-skill-ticket/SKILL.md`](specs/generateur-skill-ticket/SKILL.md).

### D1 : Arbre de tickets (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D1.INV-1** | un sous-ticket n'a qu'un seul parent ; l'arbre a une seule racine, à laquelle chaque nœud se relie sans cycle de parenté ; sa profondeur ne dépasse pas le plafond, 3 par défaut, réglable dans le référentiel ou par `--profondeur-max`. | `arbre` |
| **D1.INV-2** | une dépendance vise un ticket de l'arbre, ni lui-même, ni un ancêtre, ni un descendant ; les dépendances ne forment aucun cycle, ni entre elles, ni avec les clôtures ; l'ordre de résolution place chaque ticket après ceux dont il dépend, et chaque nœud composé après ses sous-tickets. | `arbre` |
| **D1.INV-3** | chaque nœud passe les règles de validation du référentiel (demande complète et sourcée, aucune inconnue qui changerait la composition, composition conforme à la règle de choix, options permises par sa composition) ; chaque possibilité à oui d'un nœud composé est portée par au moins un de ses sous-tickets, aucun sous-ticket ne met à oui une possibilité absente de son parent, et un nœud composé ne porte pas d'option. | `arbre` |
| **D1.INV-4** | chaque critère d'un sous-ticket soutient un critère de son parent direct, la racine n'en soutient aucun, et chaque critère d'un nœud composé est soutenu par au moins un critère de ses sous-tickets. | `arbre` |
| **D1.INV-5** | seule la racine déclare des scénarios, et seules les tâches des thèmes ; dès qu'une tâche a un plan de commits, la racine déclare les scénarios de l'US, chaque critère de la racine éprouvé par au moins un, chaque scénario avec, s'il les dit, les couches qu'il touche, prises au référentiel ; chaque tâche a au moins un commit planifié, chacun avec un thème et au plus un scénario, déclaré, qui éprouve un critère que la tâche soutient et, pour un thème de couche, touche cette couche s'il dit les siennes, un seul par scénario et par thème ; chaque scénario est réalisé par au moins un commit planifié. | `arbre` |

### D2 : Assemblage et transmission des skills de ticket (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | un skill de ticket s'assemble depuis les blocs ratifiés du référentiel et les sources du dépôt, copiés puis paramétrés ; le modèle n'écrit que la partie propre au ticket, dans les tickets de l'arbre ; l'assemblage est du code, sans token consommé, et un arbre non conforme ne donne aucun skill. | `arbre`, `assemblage` |
| **D2.INV-2** | chaque skill reprend mot pour mot les invariants de l'orchestrateur et les sections de méthode qu'il déclare, et à l'identique chaque copie dont il hérite, à sa version épinglée ; un invariant omis ou affaibli arrête la génération de tout l'arbre. | `assemblage` |
| **D2.INV-3** | un skill se relit à l'identique depuis sa transmission, table d'intégrité comprise ; la même entrée redonne les mêmes fichiers, octet pour octet, sans rien tirer au hasard ni dater, quelles que soient les fins de ligne. | `assemblage` |
| **D2.INV-4** | chaque skill cite le générateur et sa version, sa fabrique et l'orchestrateur dont il est issu ; le Monteur ne remplace qu'un dossier qui contient déjà un skill de ticket généré. | `assemblage` |

### D3 : Installation et cycle de vie dans Gemini CLI (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | un arbre ne s'installe que complet, chaque transmission vérifiée ; rien n'est écrit au moindre écart ; un fichier modifié depuis l'installation, ou que l'installateur n'a pas écrit, n'est remplacé qu'avec `--forcer`. | `installation` |
| **D3.INV-2** | tout ce que l'installation écrit est relevé et masqué à Git, sauf `--visible` ; le retrait archive les transmissions dans le dossier du ticket et ne laisse rien de l'arbre dans `.gemini` ; ni l'installation ni le retrait ne modifient un fichier suivi par Git. | `installation` |
| **D3.INV-3** | chaque nœud se traite dans sa propre session de Gemini CLI ; l'arbre se ratifie sur sa racine, puis chaque feuille avant sa première action, et un ticket sans sous-ticket une seule fois, sous sa référence ; aucun nœud ne modifie le projet avant sa ratification, le skill tenant lieu de fiche (orchestrateur-c7e:D3.INV-1). | `arbre`, `installation` |
| **D3.INV-4** | le lancement ouvre Gemini CLI en mode interactif sur la phrase qui active le skill du nœud, sans contourner la confiance du dossier ni approuver à la place du développeur ; Gemini CLI 0.67.0 découvre les skills de l'arbre et charge ses agents sans erreur. | `installation` |

### D4 : Documents de la clé, sous-agents de rôle et kits (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D4.INV-1** | les documents de la clé, `demande.json`, `us.md` et le fichier Gherkin, passent `controler-criteres.mjs` d'agent-tdd-jira et `verifier-documents.mjs` sans écart ; chaque critère de la racine y devient un critère `<CLÉ>-CAnn`, mot pour mot, et chaque critère d'un sous-ticket s'y rattache par ses soutiens et se prouve par au moins un scénario, de sa couche pour une feuille. | `documents-kits` |
| **D4.INV-2** | chaque kit, dev, test et démo, est un manifeste fermé, complet, chaque fichier cité avec son empreinte ; la remise suit le schéma fermé `agent2test.remise/1` ; avec le dépôt, la branche et les commits du kit dev s'y retrouvent. | `arbre`, `documents-kits`, `acceptable`, `socle-acceptable` |
| **D4.INV-3** | la boîte à outils de l'arbre est sur la racine seule, chaque fichier identique à sa source à sa version épinglée ; chaque sous-agent de rôle travaille dans son propre contexte, l'analyste, le relecteur et la qualité sans outil d'écriture, le rédacteur n'écrivant que dans le dossier de la clé. | `documents-kits` |

### D5 : Champ d'observation (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D5.INV-1** | un champ par arbre, en ajout seul, au schéma fermé `skill-ticket.observation/1` ; chaque enregistrement porte son numéro, sa date en UTC, jamais antérieure à la précédente, et l'empreinte du précédent ; `champ.mjs` est seul à l'écrire, et un champ altéré refuse tout dépôt. | `champ` |
| **D5.INV-2** | toute observation porte sa preuve ; une correction vise une action antérieure et porte un motif ; seul l'observateur de l'arbre observe à l'ordre 2, et il propose une adaptation de la méthode, jamais une action sur le code. | `champ` |
| **D5.INV-3** | deux corrections au même motif dans l'arbre font attendre une proposition d'ordre 2, qui attend l'examen de l'ordre 3, puis la décision du développeur ; deux propositions refusées sur un motif le mettent en veille ; l'ordre d'observation ne dépasse pas 3, le développeur au-dessus. | `champ`, `exterieur` |
| **D5.INV-4** | un écart sur un critère menace, de proche en proche, les critères qu'il soutient, jusqu'au critère d'acceptation de la clé ; des verdicts contraires de deux nœuds sur une même ancre forment un désaccord, que le script inscrit au champ et au registre des écarts du projet, décision au développeur. | `champ` |

### D6 : Vue augmentée (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D6.INV-1** | la vue se tire du champ et des documents de la clé, sans les réécrire, et ne s'écrit ni ne se corrige à la main ; mêmes champ et documents, même vue, octet pour octet, quelles que soient les fins de ligne ; un champ altéré ne donne pas de vue. | `vue` |
| **D6.INV-2** | chaque ancre porte exactement ce qui l'atteint, et son état est celui que lui donne le champ ; les calques se posent sur l'ancre sans toucher à son état. | `vue` |
| **D6.INV-3** | la page `vue.html` est autonome, sans réseau ni ressource extérieure, lisible au clavier et sans JavaScript, à la structure accessible : langue, titre, niveaux de titre sans saut, commandes libellées, états écrits en toutes lettres. | `vue` |

### D7 : Contexte chargé (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D7.INV-1** | chaque session de nœud et chaque agent a son propre contexte ; la mesure du contexte de chaque arbre d'exemple, à l'activation et au plus, est déterministe et versionnée, et aucun de ses contextes n'y dépasse, au plus, le point d'entrée de l'orchestrateur pour le même ticket. | `mesure` |
| **D7.INV-2** | chaque fichier compté existe, a la taille comptée, et la consigne qui le fait lire le cite ; ce qu'un nœud écrit, le champ et le code des scripts ne se comptent pas ; le point d'entrée de l'orchestrateur se mesure selon son propre ordre de lecture. | `mesure` |

### D8 : Apprentissage permanent (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D8.INV-1** | chaque entrée du relevé d'un ticket porte sa profondeur CRI, macro, méso-contrats, méso-composants ou micro, sa nature, son motif, sa cible, son sens et sa preuve ; une entrée sans profondeur ou sans preuve est refusée, et rien n'est écrit. | `apprentissage` |
| **D8.INV-2** | rien n'entre dans le référentiel ni dans les consignes sans la décision explicite du développeur : le script ne modifie que le relevé et le registre ; un motif relevé dans deux tickets devient une proposition, retenue ou refusée par le développeur seul, et deux refus le mettent en veille. | `apprentissage` |
| **D8.INV-3** | le registre d'apprentissage du projet est en ajout seul, chaque ligne numérotée et chaînée à l'empreinte de la précédente ; un relevé versé au registre est clos ; un registre altéré se signale, sans versement ni proposition. | `apprentissage` |
| **D8.INV-4** | les arbres d'exemple sont des tests de non-régression, figés ; aucun ne se modifie pour qu'un relevé ou une recette passe. | `installation`, `apprentissage` |

### D9 : Export vers le socle d'observation (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D9.INV-1** | l'export lit le champ de chaque ticket du projet et son registre d'apprentissage sans les modifier, ne traduit ni les actions ni aucun texte, et n'écrit dans le projet que le journal d'enveloppes `docs/c7e/observations.jsonl` et sa tête ; chaque enveloppe suit le socle épinglé, à la version du générateur qui l'exporte ; aucun skill de ticket ne porte l'outil ni le module. | `observation` |
| **D9.INV-2** | le sel de l'instance est tiré une seule fois, à la première exportation du projet, de quelque système qu'elle soit, et gardé dans le répertoire Git commun du projet, que partagent ses worktrees et les systèmes qui y exportent ; il n'est jamais versionné, affiché, exporté ni passé en argument ; sans lui, un journal d'enveloppes du projet, celui du générateur ou celui d'un autre système, arrête l'export, comme un sel étranger à l'un d'eux, au lieu qu'un nouveau sel change l'identité de l'instance. | `observation` |
| **D9.INV-3** | l'export est incrémental et idempotent : un enregistrement déjà exporté, reconnu par son format, son journal et son numéro, ne l'est pas une seconde fois, et un export sans enregistrement nouveau laisse le journal et sa tête identiques, octet pour octet ; un enregistrement arrivé après d'autres, plus récents, prend la date de la dernière enveloppe, sans que son journal source change d'ordre. | `observation` |

### D10 : Acceptable partagé : kits et actions confrontés au noyau du socle de l'acceptable (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D11 : Observateur extérieur : l'ordre 3 sur un autre modèle que la session, nommé, inscrit au champ (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D11.INV-1** | les modèles de la session et de l'observateur d'ordre 3 sont facultatifs à la génération ; celui de l'observateur demande celui de la session et en diffère, chacun un nom de modèle, sinon la génération est refusée et n'écrit rien ; nommés, l'en-tête de l'observateur d'ordre 3 de la racine porte le sien, les manifestes de l'arbre les deux, et tout autre agent garde le modèle de la session ; sans eux, l'arbre se génère comme avant. | `exterieur` |
| **D11.INV-2** | dans un arbre qui nomme deux modèles, `champ.mjs` inscrit à chaque observation d'ordre 3 le modèle effectif de son observateur, l'en-tête de son agent installé ou sa surcharge dans les réglages de Gemini CLI, que le déposant ne donne jamais, et refuse l'observation si ce modèle est introuvable ou retombe sur celui de la session ; un modèle ne se porte qu'à l'ordre 3 ; le champ garde son format, et l'export ne change pas. | `exterieur` |
| **D11.INV-3** | `lancer` ouvre la session d'un nœud sur le modèle de la session que nomme le manifeste de son skill, un nom de modèle, sinon il refuse ; sans modèle nommé, sur les réglages du développeur. | `installation`, `exterieur` |

## java 1.1.1

Expert Java 21, Spring Boot 3.5 et PostgreSQL : produire et relire du code conforme à des invariants vérifiables. Point d'entrée : [`specs/java/SKILL.md`](specs/java/SKILL.md).

### D1 : Architecture en couches par fonctionnalité (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D1.INV-1** | aucune classe des couches `domain` et `application` ne dépend de la couche `api` ni de `org.springframework.web`. | `architecture`, `api-rest`, `tests`, `revue`, `analyse-projet/evaluation` |
| **D1.INV-2** | aucune entité JPA n'est exposée par un contrôleur, ni en paramètre ni en retour. | `architecture`, `analyse-projet/evaluation`, `orchestrateur-c7e/meso-contrats` |
| **D1.INV-3** | l'injection se fait par constructeur ; aucun champ n'est annoté `@Autowired`. | `architecture`, `api-rest`, `agent-tdd-jira/cycle-tdd`, `analyse-projet/evaluation`, `orchestrateur-c7e/meso-contrats`, `sonarqube/triage`, `sonarqube/correction`, `sonarqube/rapport` |
| **D1.INV-4** | les fonctionnalités n'ont pas de dépendances cycliques entre elles. | `architecture`, `tests`, `revue`, `analyse-projet/evaluation` |

### D2 : Langage Java 21 (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | les DTO d'API sont des `record` immuables. | `langage`, `api-rest`, `tests`, `revue`, `agent-tdd-jira/cycle-tdd`, `analyse-projet/evaluation`, `orchestrateur-c7e`, `orchestrateur-c7e/meso-contrats` |
| **D2.INV-2** | `Optional` n'est jamais un type de champ ni de paramètre ; il sert uniquement de type de retour. | `langage`, `tests`, `analyse-projet/evaluation`, `sonarqube/triage` |
| **D2.INV-3** | quand les threads virtuels sont activés, aucun bloc `synchronized` n'englobe une entrée-sortie bloquante. | `langage`, `tests`, `migration-boot4`, `analyse-projet/evaluation` |
| **D2.INV-4** | aucune exception n'est avalée : un `catch` traite, relance ou traduit, jamais ne se contente d'ignorer. | `langage`, `tests`, `revue`, `analyse-projet/evaluation`, `orchestrateur-c7e/meso-contrats`, `sonarqube/triage` |

### D3 : API REST conforme au socle (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | l'API implémentée correspond exactement au contrat OpenAPI (application de SC1.INV-1). | `api-rest`, `tests`, `revue`, `agent-tdd-jira/variantes`, `agent2dev/conception`, `analyse-projet/evaluation` |
| **D3.INV-2** | toute entrée est validée par Bean Validation avant d'atteindre la couche `application`. | `api-rest`, `tests`, `agent-tdd-jira/variantes`, `analyse-projet/evaluation`, `orchestrateur-c7e/meso-contrats` |
| **D3.INV-3** | un seul `@RestControllerAdvice` produit les Problem Details, avec `code` et `traceId` (application de SC2.INV-1). | `api-rest`, `tests`, `agent-tdd-jira/cycle-tdd`, `analyse-projet/evaluation`, `orchestrateur-c7e/meso-contrats` |
| **D3.INV-4** | toute collection est paginée, avec une taille maximale imposée (application de SC3.INV-3). | `api-rest`, `tests`, `revue`, `agent-tdd-jira/variantes`, `analyse-projet/evaluation` |

### D4 : Persistance JPA, migrations Flyway ou Liquibase, PostgreSQL (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D4.INV-1** | le schéma n'évolue que par migrations versionnées (Flyway ou Liquibase) ; `spring.jpa.hibernate.ddl-auto=validate` ; une migration appliquée n'est jamais modifiée. | `persistance`, `tests`, `revue`, `analyse-projet/evaluation`, `orchestrateur-c7e`, `orchestrateur-c7e/meso-contrats`, `orchestrateur-c7e/observation` |
| **D4.INV-2** | `spring.jpa.open-in-view=false`. | `architecture`, `persistance`, `tests`, `analyse-projet/evaluation`, `analyse-projet/rapport`, `analyse-projet/plans-action`, `orchestrateur-c7e/meso-contrats` |
| **D4.INV-3** | les frontières transactionnelles sont déclarées dans la couche `application`, et les lectures sont en `readOnly = true`. | `persistance`, `tests`, `agent-tdd-jira/variantes`, `agent-tdd-jira/cycle-tdd`, `analyse-projet/evaluation`, `analyse-projet/plans-action`, `orchestrateur-c7e/meso-contrats` |
| **D4.INV-4** | aucune requête SQL ou JPQL n'est construite par concaténation avec une donnée d'entrée. | `persistance`, `tests`, `revue`, `analyse-projet/evaluation`, `orchestrateur-c7e/meso-contrats`, `sonarqube`, `sonarqube/triage`, `sonarqube/correction`, `sonarqube/rapport` |
| **D4.INV-5** | les tests de persistance s'exécutent sur PostgreSQL (Testcontainers), jamais sur une base en mémoire. | `persistance`, `tests`, `analyse-projet/evaluation`, `orchestrateur-c7e` |
| **D4.INV-6** | toute entité modifiable de façon concurrente porte un attribut `@Version`. | `persistance`, `tests`, `revue`, `analyse-projet/evaluation` |

### D5 : Sécurité Spring Security (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D5.INV-1** | la chaîne de sécurité refuse par défaut (`anyRequest().authenticated()` ou plus strict) ; chaque exception publique est explicite. | `securite`, `tests`, `revue`, `analyse-projet/evaluation`, `orchestrateur-c7e/meso-contrats` |
| **D5.INV-2** | les réponses 401 et 403 émises par la chaîne de sécurité sont des Problem Details conformes au socle. | `api-rest`, `securite`, `analyse-projet/evaluation` |
| **D5.INV-3** | seuls `health` et `info` d'Actuator sont exposés sans authentification. | `securite`, `tests`, `analyse-projet/evaluation` |
| **D5.INV-4** | aucun jeton, mot de passe ni donnée personnelle non nécessaire n'est journalisé (application de SC4.INV-1 et SC5). | `securite`, `tests`, `revue`, `analyse-projet/evaluation`, `orchestrateur-c7e/meso-contrats` |

### D6 : Tests et contrôles automatisés (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D6.INV-1** | chaque invariant actif du skill a au moins un contrôle automatisé, ou une entrée de grille de revue justifiée. | `tests`, `revue`, `analyse-projet/evaluation` |
| **D6.INV-2** | les tests unitaires du domaine et de la couche application ne démarrent pas de contexte Spring. | `tests`, `analyse-projet/evaluation` |
| **D6.INV-3** | aucun test n'utilise `@MockBean` ni `@SpyBean` (point E3). | `tests`, `migration-boot4`, `analyse-projet/evaluation` |
| **D6.INV-4** | aucun test ne dépend de l'ordre d'exécution, de l'heure réelle ni du réseau public. | `architecture`, `langage`, `tests`, `revue`, `analyse-projet/evaluation` |

### D7 : Revue de code (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D7.INV-1** | chaque constat cite un emplacement (`fichier:ligne`), l'invariant concerné ou la mention « hors invariant » avec sa justification, une gravité et une correction proposée. | `revue` |
| **D7.INV-2** | en mode relire, l'expert ne modifie aucun fichier sans demande explicite. | `revue` |
| **D7.INV-3** | les constats sont classés par gravité décroissante, et un constat sans preuve est présenté comme une question, pas comme un défaut. | `revue` |

### D8 : Migration vers Spring Boot 4.x et Java 25 (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

## observatoire 1.7.0

Observatoire de l'écosystème Agent2Prompt, sur le poste : relève les journaux d'enveloppes des projets selon le socle d'observation, dont ceux qu'il écrit pour le binôme Agent2Dev et Agent2Test à partir de leurs refus, de leurs kits, de leurs décisions aux points de validation et des révisions de leurs constitutions, les confronte entre instances, entre systèmes par les invariants du dépôt que citent leurs écarts, et par règle de l'acceptable que citent les refus, compte les kits, les signaux et les révisions, observe l'état de l'écosystème, écrit des propositions minimisées que le développeur apporte au dépôt par pull request, contrôle les examens indépendants qui précèdent leur ratification, et suit l'effet des propositions ratifiées ; compte aussi la gouvernance du dépôt lui-même, dans son historique Git et son CHANGELOG ; premier et troisième couplages du troisième ordre, deuxième ouvert, le dépôt observé, il propose et n'applique jamais. Point d'entrée : [`specs/observatoire/SKILL.md`](specs/observatoire/SKILL.md).

### D1 : Inscription et relevé (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D1.INV-1** | le magasin de l'observatoire est dans le répertoire Git commun du clone d'Agent2Prompt, `<git-common-dir>/agent2prompt/observatoire/`, partagé par ses worktrees et hors de tout arbre de travail : il n'est jamais versionné, publié ni exporté, et ne garde que les chemins des projets inscrits et les miroirs de leurs journaux. | `releve` |
| **D1.INV-2** | un journal ne se relève que vérifié selon le socle épinglé, schéma, chaîne et tête ; un journal altéré, ou réécrit depuis le dernier relevé, est refusé et son miroir reste tel quel ; un miroir ne fait que s'allonger, et un magasin altéré arrête tout relevé. | `releve` |
| **D1.INV-3** | une enveloppe d'un système ou d'une version que le dépôt ne publie pas est écartée de toute confrontation, et signalée. | `releve` |

### D2 : Confrontation entre instances (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | une récurrence est un même motif, à la même profondeur, pour un même système, dans au moins deux instances distinctes, comptées par leur empreinte et non par leurs projets ; un motif générique, un verdict neutre ou une décision n'en font pas. | `confrontation` |
| **D2.INV-2** | un retour est une proposition d'une instance qui vise une spécification et qu'une décision humaine de cette instance a retenue ; il remonte dès une instance ; une proposition refusée, ou qui ne vise que l'instance, ne remonte pas. | `confrontation` |

### D3 : État de l'écosystème (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | pour chaque instance, chaque système qui exporte est comparé à la version que le dépôt publie : à jour, en retard, ou inconnue. | `etat` |

### D4 : Propositions au dépôt (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D4.INV-1** | une proposition suit le format `observatoire.proposition/1` : son en-tête ne porte que des valeurs minimisées, système, versions, sorte, motif, profondeur, nombres d'instances et d'enveloppes, références tronquées et statut, et, pour une proposition par invariant ou par faux refus, l'invariant du dépôt et les systèmes qui l'ont relevé ; aucun texte, chemin, clé ni nom d'une instance n'entre dans le dépôt. | `propositions` |
| **D4.INV-2** | l'observatoire n'écrit dans le dépôt que des propositions, dans `observatoire/propositions/`, ne modifie ni une spécification ni un projet, ne commite ni ne publie : la pull request et sa ratification restent humaines ; une proposition ouverte ou ratifiée ne se répète pas, et une proposition refusée ne revient qu'avec une instance nouvelle. | `propositions`, `examens` |

### D5 : Suivi des propositions ratifiées (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D5.INV-1** | l'effet d'une proposition ratifiée se mesure par la part de son motif dans les enveloppes du système, avant et après la version qui la porte ; il ne se déclare, observé ou non observé, qu'avec au moins vingt enveloppes de part et d'autre, sinon il est indécidable. | `suivi` |

### D6 : Confrontation entre systèmes (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D6.INV-1** | un même invariant du dépôt, cité par des écarts ou des dérogations, fait un candidat quand ses écarts distincts sont au moins deux et viennent de deux instances ou de deux systèmes ; un écart se désigne par son instance et son ticket, et les enveloppes d'un même écart, celle du système qui le constate et celle du registre où il est décidé, ne comptent qu'une fois ; un invariant que le dépôt ne définit pas ne fait pas de candidat ; une réponse à un refus, qui vise l'enveloppe de son refus, n'est pas un écart : elle relève de D8. | `systemes` |
| **D6.INV-2** | un candidat par invariant se propose à la spécification qui définit l'invariant, à sa version courante, avec les systèmes qui l'ont relevé ; ses références désignent chaque enveloppe par son instance tronquée, son système et son numéro, puisque chaque système tient son journal. | `systemes` |

### D7 : Export du binôme (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D7.INV-1** | l'export du binôme traduit la rubrique `acceptable` d'un livrable d'Agent2Dev ou d'un journal de tests d'Agent2Test selon la correspondance du socle d'observation, section 6.5, sa rubrique `kits` selon la section 6.6, pour Agent2Dev, sa rubrique `points` selon la section 6.7, et sa rubrique `revisions` selon la section 6.8 : une enveloppe par refus, par réponse, par étape d'un kit, un échec en une seule, par présentation d'un point et par décision, avec son délai calculé à la source, et par examen et par publication d'une constitution, datée par la rubrique, au nom et à la version du système qui a produit l'enregistrement ; il ne modifie aucun fichier désigné, et la même rubrique, sous le même sel, donne les mêmes enveloppes, octet pour octet, quel que soit l'ordre des fichiers. | `export-binome` |
| **D7.INV-2** | l'export écrit dans le projet de l'application un journal par système, `docs/c7e/observations-agent2dev.jsonl` et `docs/c7e/observations-agent2test.jsonl`, en ajout seul, chaîné, avec sa tête, sous le sel de l'instance, qu'il lit dans le répertoire Git commun du projet, ou tire s'il n'y existe aucun journal d'enveloppes ; un enregistrement déjà exporté ne l'est pas deux fois, ni une révision du grand livre que portent plusieurs sources ; une réponse venue après son refus le vise, la validation d'un kit, l'enveloppe de sa remise, et une décision, l'enveloppe de la présentation de son point ; un journal altéré, une source illisible, une rubrique qui change ou retire un enregistrement exporté, deux sources qui disent autrement une même révision, un relâchement sans l'examen de la même constitution juste avant lui, un sel absent alors qu'un journal existe, ou étranger à l'un d'eux, ou une enveloppe mal formée arrêtent l'export, sans rien écrire. | `export-binome` |
| **D7.INV-3** | aucune enveloppe de l'export ne porte l'objet refusé, le motif d'une réponse, le commentaire d'un échec ou d'une décision, son canal ni le nom d'une personne : la règle sort préfixée par la spécification qui la définit, le rôle qui répond ou déclare par son nom dans le socle, la demande, la campagne, l'empreinte du patch d'un kit et celle d'une constitution par leur empreinte salée, la version d'une constitution jamais ; l'export n'écrit rien dans le magasin de l'observatoire, et le sel ne s'affiche ni ne sort. | `export-binome` |

### D8 : Confrontation de l'acceptable (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D8.INV-1** | les refus se confrontent par règle : pour chaque invariant qu'un refus cite, l'observatoire rend le nombre de refus, de dérogations et de faux refus, les systèmes qui les ont produits et le nombre d'instances où ils ont paru, une réponse comptant sous la règle du refus qu'elle vise, dans le journal de son système ; un refus, une dérogation ou un faux refus ne fait ni retour, ni récurrence, ni candidat par invariant. | `acceptable` |
| **D8.INV-2** | une règle que le dépôt définit, déclarée infondée par des faux refus dans au moins deux instances distinctes, fait un candidat « règle trop large », de sorte `faux-refus`, proposé à la spécification qui la définit, à sa version courante, avec les systèmes qui ont relevé ces faux refus ; un refus sans faux refus, des faux refus d'une seule instance, ou une règle que le dépôt ne définit pas n'en font pas. | `acceptable` |

### D9 : Confrontation des kits (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D9.INV-1** | les kits se comptent par système et par environnement, leurs étapes se reconnaissant à l'ancre de leur kit : remis, validés, appliqués, en échec, défaits, validés en attente d'application, kits test appliqués sans nettoyage déclaré, et le nombre d'instances où ils ont paru, un échec comprenant son retour arrière ; une enveloppe de kit ne fait ni retour, ni récurrence, ni candidat par invariant ou par faux refus, et la confrontation des kits ne propose rien. | `kits` |

### D10 : Confrontation des signaux (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D10.INV-1** | les décisions aux points de validation se comptent par système et par point, une décision se reconnaissant à la présentation qu'elle vise, dans le journal de son système : présentations, décisions retenues, amendées et refusées, présentations en attente, délais médian et maximal, lus dans la mesure de chaque décision, et le nombre d'instances ; une enveloppe de point ne fait ni retour, ni récurrence, ni candidat, et ne classe aucune personne. | `signaux` |

### D11 : Examen indépendant (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D11.INV-1** | une proposition ne se ratifie qu'avec son examen, du même nom dans `observatoire/examens/`, qui la vise ; une version qui relâche une forme propre du dépôt cite à son journal l'examen de la spécification à cette version (`EVOLUTION.md`, section 10.7) ; un avis ne décide jamais, et une ratification contre un avis défavorable lui répond ; un refus n'en demande pas. Contrôle : commande `verifier` de l'outil et vérificateur du dépôt, sur des propositions ratifiées avec et sans examen, et des constitutions d'exemple relâchées. | `propositions`, `examens` |
| **D11.INV-2** | un examen suit le format fermé `observatoire.examen/1` : rien que des valeurs minimisées, l'objet, pour une spécification son nom et sa version, pour une constitution, dans son instance, son système et sa version, l'examinateur, un rôle, son modèle déclaré et son avis dans la liste ; son corps, sous `## Avis`, les points de l'examinateur, sans donnée d'une instance ; l'examen d'une constitution vit dans son instance, sous le nom de sa version, jamais dans le dépôt ; l'observatoire n'en écrit aucun. Contrôle : examens altérés, refusés. | `examens` |

### D12 : Confrontation des révisions (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D12.INV-1** | les révisions des constitutions se comptent par système : publications, par sens, première, neutre, renforcement, relâchement, entrées relâchées, lues dans la mesure de chaque publication, examens, par avis, favorable, réservé, défavorable, et le nombre d'instances ; une enveloppe de révision ne fait ni retour, ni récurrence, ni candidat, et la confrontation des révisions ne propose rien. | `revisions` |

### D13 : Le dépôt observé (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D13.INV-1** | le dépôt s'observe hors ligne, sans jeton : la commande `depot` ne lit que l'historique Git de la branche courante du clone, en premier parent, et son `CHANGELOG.md` ; elle n'écrit rien, ni journal, ni enveloppe, ni proposition, ne touche pas au magasin, et ses comptes se recalculent à chaque appel. | `depot` |
| **D13.INV-2** | seule une fusion par merge commit, de sujet « Merge pull request #N from … », est une pull request ; son délai court de la date du plus ancien de ses commits à celle de sa fusion, et ses reprises sont ses commits au-delà du premier ; une pull request de branche `docs/ratification-<n>` est la consignation de la n° n, qui compte pour elle et jamais comme une de plus, et son délai court de la fusion de la n° n à la sienne ; une pull request fusionnée après la dernière consignée, sans consignation, est en attente. | `depot` |
| **D13.INV-3** | un compte ne se devine pas : les points hors plan d'une pull request se lisent dans sa ligne « Décisions ratifiées » du CHANGELOG, la plus récente, quand elle dit leur nombre, sinon ils restent inconnus, hors des comptes ; les refus de la CI, que l'historique ne garde pas, se déclarent non mesurés ; le dépôt observé ne fait aucun candidat. | `depot` |

## orchestrateur-c7e 3.8.7

Orchestrateur fractal C7E : résolution d'un ticket full-stack comme transformation maîtrisée d'un système vivant, avec le cycle de l'Axiome 7E, quatre profondeurs de déclinaison, des concepts paramétrables, la qualification de chaque ticket à son ouverture par un modèle générique de la demande et des questions complémentaires, un méso-contrat principal et au besoin des compléments, confirmés avant tout le reste, des options par couche rattachées au méso-contrat qui les permet avec leurs paramètres au choix par ticket, des variantes de représentation d'une ressource et leur mise à jour en temps réel, l'analyse des images PNG de l'objectif, une fiche validée avant toute modification, des tests déduits des risques, des conventions Git compatibles avec le kit des agents parallèles, une boucle de second ordre bornée par un registre et un fichier d'invariants du projet, des registres exportés vers le socle d'observation par une commande que lance le développeur ; activé au démarrage de l'IA locale, sur choix du développeur. Point d'entrée : [`specs/orchestrateur-c7e/SKILL.md`](specs/orchestrateur-c7e/SKILL.md).

### D1 : Ontologie : cycle 7E, profondeurs du CRI, concepts paramétrables (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D1.INV-1** | chaque modification du ticket est rattachée à un slot (É1 à É7) et à une profondeur (d=0 à d=3), dans la fiche et dans le message de son commit. | `meso-contrats` |
| **D1.INV-2** | les slots É1 à É7 portent les sept termes de l'Axiome 7E, dans leur ordre ; É0, l'Outillage, est une précondition hors axiome, qui ne livre rien. | `meso-contrats` |

### D2 : Configuration : matrice d'activation, modes de modulation, choix du démarrage (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | la fiche déclare le mode, les concepts activés avec leurs poids et leurs paramètres, la profondeur et le niveau de preuve, et justifie cette configuration par la criticité du ticket, selon la grille du fichier d'invariants du projet. | `meso-contrats` |
| **D2.INV-2** | dans tous les modes, les invariants du projet, du socle et des référentiels s'appliquent ; un mode ne règle que des paramètres opérationnels. | `meso-contrats`, `acceptable` |
| **D2.INV-3** | le skill ne s'applique qu'au choix du développeur : en chargement permanent, par l'import de son fichier de démarrage ; en chargement au choix, par sa réponse au menu ou par la commande `/c7e`. Sans ce choix, l'IA n'applique aucune règle du skill et ne l'active pas d'elle-même. | `referentiel` |

### D3 : Pipeline par slot et fiche de transformation (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | aucune modification du code, du schéma ni de la configuration du projet avant que le développeur ait validé la fiche : objectif, critères, invariants, configuration, cartographie d'impact, stratégie et tests déduits. | `meso-contrats`, `referentiel`, `acceptable`, `generateur-skill-ticket`, `generateur-skill-ticket/installation`, `generateur-skill-ticket/acceptable`, `socle-acceptable` |
| **D3.INV-2** | les contrats de niveau d=1, schéma exposé (É1) et contrat OpenAPI (É3), sont validés avant toute implémentation de niveau d=2 ou d=3. | `meso-contrats` |
| **D3.INV-3** | à la remise, la fiche est complète (modifications, dossier de preuves, écarts, boucle, capitalisation, indicateurs) et rangée à son emplacement. | `meso-contrats` |

### D4 : Traçabilité Git (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D4.INV-1** | un ticket a une seule branche, au format du projet, par défaut `<type>/<CLÉ>-<slug>` (agents-paralleles-gitlab:D1.INV-1) ; aucune branche par slot. | `meso-contrats` |
| **D4.INV-2** | chaque commit commence par `<CLÉ> : ` ou `<CLÉ> Snn : ` (agents-paralleles-gitlab:D2.INV-2), suivi de l'étiquette `[É<n>-<DOMAINE>]` de son unique slot. | `meso-contrats` |
| **D4.INV-3** | l'IA ne pousse pas, ne fusionne pas, ne rebase pas, ne réécrit pas l'historique et ne pose aucun tag ; un refus d'un hook l'arrête et se cite au développeur, sans contournement. | `meso-contrats`, `acceptable`, `generateur-skill-ticket/acceptable`, `socle-acceptable` |

### D5 : Gates et tests déduits des risques (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D5.INV-1** | chaque test proposé pour le ticket prouve un critère d'acceptation numéroté (agent-tdd-jira:D10.INV-1) ou un risque de la cartographie ; le dossier de preuves relie chaque test à son critère ou à son risque, et à son résultat. | `meso-contrats`, `referentiel` |
| **D5.INV-2** | les tests sont déduits des risques avant toute modification ; aucun test existant n'est supprimé ni affaibli sans l'accord du développeur. | `meso-contrats` |
| **D5.INV-3** | la remise n'a lieu qu'après les gates de la profondeur visée, au niveau de preuve de la criticité : build et tests ciblés à chaque commit ; conformité du contrat, migrations jouées, annulées et rejouées, intégration et sécurité avant la remise. | `meso-contrats` |

### D6 : Boucle de second ordre et registre des concepts (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D6.INV-1** | une correction du logiciel tirée d'une observation (premier ordre) est un commit de rétroaction qui cite cette observation ; une adaptation de la méthode (second ordre) est une entrée `proposed` du registre des concepts, qui cite l'observation qui la fonde. | `meso-contrats`, `observation` |
| **D6.INV-2** | l'IA ne promeut, ne modifie ni ne retire aucune entrée du registre des concepts, et ne modifie jamais le fichier d'invariants du projet ; seul le développeur le fait, par une revue documentée. | `meso-contrats`, `observation` |
| **D6.INV-3** | tout écart à un invariant s'inscrit au registre des écarts, avec sa décision (respecter, ou dérogation validée par un nom) ; aucun écart n'est corrigé ni toléré en silence. | `meso-contrats`, `observation`, `acceptable`, `observatoire/systemes`, `socle-observation` |

### D7 : Valeur annoncée et indicateurs (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D7.INV-1** | aucune valeur de la méthode n'est annoncée comme acquise sans campagne de mesure ; d'ici là, toute valeur annoncée est étiquetée « hypothèse ». | `mesure` |
| **D7.INV-2** | chaque indicateur Q, R, T, C et A se calcule selon sa définition, entre 0 et 1, et les poids ω somment à 1. | `mesure` |

### D8 : Invariants du projet (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D8.INV-1** | la copie du projet du fichier d'invariants est lue avant chaque ticket ; une valeur `ADAPTER` restée telle est signalée au développeur avant la fiche, jamais devinée. | `meso-contrats` |
| **D8.INV-2** | le fichier d'invariants précise le socle et les référentiels sans les contredire ; une contradiction se signale et s'inscrit au registre des écarts, et le socle l'emporte jusqu'à la décision du développeur. | `meso-contrats`, `acceptable` |

### D9 : Campagne de mesure de la valeur (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D10 : Référentiel des méso-contrats : catégories de tickets, options par couche, analyse des images de l'objectif (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D10.INV-1** | chaque ticket est classé dans un méso-contrat principal du référentiel du projet et, si le principal ne porte pas toute sa demande, dans des compléments, que le développeur confirme ensemble à la qualification (D11) ; l'IA propose ensuite les options dans `ticket.toml`, que le développeur valide avec la fiche ; une possibilité qu'aucune catégorie ne porte, ou un ticket sans principal possible, se signale, sans catégorie inventée. | `referentiel`, `qualification` |
| **D10.INV-2** | chaque option choisie est rattachée à un méso-contrat de la composition et respecte son empreinte : elle figure parmi les options permises de sa couche dans ce méso-contrat, et aucune n'est rattachée à un méso-contrat sur une couche où il est à l'impact `aucun` ; chaque couche à l'impact `requis` du principal porte au moins une option qui lui est rattachée, et chaque complément au moins une ; les méso-contrats transverses des couches touchées par la composition s'appliquent d'office. | `referentiel` |
| **D10.INV-3** | chaque option retenue apporte aux tests déduits les preuves que le référentiel lui associe, reliées à un critère ou à un risque. | `referentiel` |
| **D10.INV-4** | une option front qui désigne une image PNG de l'objectif et en demande l'analyse donne lieu à `analyse-image.md`, rédigée avant la fiche et validée avec elle ; chaque élément de l'image y est rattaché à une option ou posé en question, et les tailles et couleurs lues sur l'image y sont des estimations. | `referentiel` |
| **D10.INV-5** | `ticket.toml` épingle la version du référentiel qu'il suit ; l'IA ne modifie jamais le référentiel du projet : une catégorie ou une option nouvelle se propose au développeur, qui seul l'ajoute. | `referentiel`, `qualification` |
| **D10.INV-6** | une variante de représentation laisse la réponse actuelle de l'opération inchangée pour toute requête qui ne la sélectionne pas ; le champ retiré est absent de la variante, et non pas `null` ; la date-heure qui le résume suit le format Instant du socle et se calcule en base sans charger les éléments ; le remplacement de la réponse actuelle n'est retenu que pour une opération dont la version d'API n'est pas publiée, sinon il est refusé avec la règle du socle (SC1.INV-2). | `referentiel` |

### D11 : Qualification de la demande : modèle générique, questions complémentaires, méso-contrat confirmé à l'ouverture du ticket (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D11.INV-1** | à l'ouverture d'un ticket, la qualification précède toute autre étape : l'IA range la demande du ticket dans le modèle générique de la demande du référentiel, combinaison de possibilités de modification de l'application, et en déduit la composition de méso-contrats par la règle de choix, avant de lire le code, de cartographier l'impact ou de rédiger la fiche. | `qualification` |
| **D11.INV-2** | l'intention et chaque possibilité de la demande remplie portent leur réponse, `oui`, `non` ou `inconnu` pour une possibilité, et la source de toute réponse autre qu'`inconnu`, dans le ticket ou dans une réponse du développeur ; rien n'est rempli par supposition ; une possibilité `inconnu` dont la réponse changerait la composition ou ses options, ou une égalité entre principaux ou entre ensembles de compléments, devient une question au développeur, posée avec les autres. | `qualification` |
| **D11.INV-3** | la composition proposée, principal et compléments, justifiée par les empreintes, est confirmée par le développeur avant toute autre étape ; une composition imposée par le développeur vaut confirmation si elle porte la demande remplie selon la règle de choix. | `referentiel`, `qualification` |
| **D11.INV-4** | `ticket.toml` garde la demande remplie, avec ses sources, et la composition confirmée ; si l'analyse montre ensuite que la demande sort des empreintes, l'IA revient à la qualification et fait confirmer une autre composition, sans en changer d'elle-même. | `referentiel`, `qualification` |
| **D11.INV-5** | les possibilités du modèle se fondent sur l'analyse de l'application : à l'installation, l'IA propose celles qui s'appliquent, avec leurs repères, celles à retirer et celles qui manquent, rattachées à une couche et à une option ; le développeur seul les écrit dans le référentiel. | `qualification` |
| **D11.INV-6** | chaque complément se justifie par au moins une possibilité à `oui` que le principal ne porte pas ; les compléments sont en plus petit nombre possible, et la qualification nomme pour chacun les possibilités qui le justifient ; un ticket que le principal porte en entier n'a aucun complément. | `qualification` |

### D12 : Observation partagée : registre des concepts et registre des écarts exportés vers le socle d'observation (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D12.INV-1** | l'export lit le registre des concepts, dans son historique Git au premier parent de la branche d'intégration, et le registre des écarts, sans rien modifier, ni registre ni historique ; il n'écrit dans le projet que le journal d'enveloppes de l'orchestrateur, `docs/c7e/observations-orchestrateur-c7e.jsonl`, et sa tête ; chaque événement du registre des concepts et chaque ligne décidée du registre des écarts y devient une enveloppe, selon les correspondances du socle d'observation et les précisions du module `observation` ; l'outil reste dans le clone du dépôt Agent2Prompt : l'IA n'exporte pas d'elle-même, elle donne la commande au développeur, qui la lance. | `observation`, `generateur-skill-ticket` |
| **D12.INV-2** | l'orchestrateur exporte avec le sel de l'instance, gardé dans le répertoire Git commun du projet et partagé avec les autres systèmes qui y exportent, comme le générateur de skills de ticket : une instance, une identité ; sans ce sel, tout journal d'enveloppes du projet arrête l'export, comme un sel étranger à l'un d'eux, au lieu qu'un nouveau sel change l'identité de l'instance ; le sel n'est jamais versionné, affiché, exporté ni passé en argument. | `observation` |
| **D12.INV-3** | l'export est incrémental et idempotent : un événement ou une ligne déjà exportés, reconnus par leur format et leur numéro, ne le sont pas une seconde fois, et un export sans nouveauté laisse le journal et sa tête identiques, octet pour octet ; une ligne d'écart ou un historique du registre des concepts réécrits depuis leur export l'arrêtent, sans rien écrire. | `observation`, `generateur-skill-ticket` |

### D13 : Acceptable partagé : actions confrontées au noyau du socle de l'acceptable, refus qui citent leur règle, écriture par les kits (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

## scenario-playwright 1.6.8

Scénarios côté utilisateur joués dans le Chrome du poste par Playwright : texte de départ inspiré de Gherkin, en français ou en anglais, écrit par le développeur ou importé sans IA d'une demande Jira (page enregistrée en MHTML ou adresse ouverte dans le navigateur du poste, connexion à la main ; Jira Cloud et Data Center ; description et champs de texte, commentaires sur demande), d'un fichier .feature ou d'une archive .zip d'un export, des tests de Xray et de Zephyr Scale lus par leur API REST, Cloud et Data Center, en lecture seule, jeton par variable d'environnement seulement, ou des pages de tests de Xray enregistrées par Chrome en HTML complet, lues sans rien exécuter, cadres compris, pas reconnus à leurs libellés en mode formulaire ou en tableau, diagnostic sans aucune valeur (test Cucumber ou BDD recopié, test manuel converti pas à pas en Quand puis Alors, clé du test pour identité ; provenance, étiquettes, comparaison et remplacement sur demande au réimport) ; traduction en scénario TOML exécutable par l'IA, sur un squelette produit sans IA, ratifiée par le développeur et contrôlée sans IA (empreinte, structure, lignes, marques, variables) ; jeu fermé de treize actions commun avec le navigateur d'Agent2Test, cibles par rôle et nom accessible, aucun code exécuté dans la page, attentes bornées, aucune étape rejouée ; origines gardées, mutations hors du poste sur autorisation explicite, connexion à la main dans un profil dédié ; rapport JSON et Markdown avec captures, instantanés ARIA et erreurs relevées ; index sans IA du code front et back du projet, sans rien exécuter (routes d'Angular, de Vue Router et de React Router, éléments d'interface et leurs noms accessibles possibles, identifiants de test, libellés traduits, endpoints de Spring et d'OpenAPI et appels du front, classes de leurs corps et leurs champs, contraintes de validation et leurs messages, chacun avec sa source ; lecture seule, empreinte et index périmé, bornes), lu par l'IA à la traduction, propositions en commentaire dans le squelette et notes du contrôle ; vérifications hors de l'écran : requêtes de la page (méthode, chemin, statut, champs JSON du corps et de la réponse), API en GET sur une origine déclarée avec la session du navigateur, sans redirection suivie, fichiers téléchargés (texte, lignes, colonne CSV), sans en-tête, cookie ni jeton relevé ; préparation et nettoyage des données depuis des lignes marquées du texte, hors du jeu d'actions : appels d'écriture vers une origine déclarée avec la session du navigateur et le jeton anti-CSRF recopié de son cookie, une fois, sans redirection suivie, valeurs gardées de la réponse et ${unique}, ou scénario ratifié joué dans le même onglet ; préparation à sa place, nettoyage même après un échec, garde des mutations ; export du scénario ratifié en test @playwright/test du projet, sans IA, dans le seul dossier de tests désigné, sans identifiant (un test par jeu, une étape par test.step avec son numéro et sa ligne, cibles en localisateurs de Playwright, étiquettes en tags, aides communes qui reprennent la sémantique du moteur, connexion laissée à l'équipe, garde des origines et des mutations là où le test joue, SCENARIO_ORIGINES, test périmé ou retouché, TypeScript ou JavaScript) ; campagne de plusieurs scénarios, contrôlés avant la première action, dans une seule fenêtre avec une seule connexion, un test en échec n'arrêtant pas les suivants ; copie d'écran à chaque vérification, à chaque échec et à la fin de chaque test ; verdict de chaque test, conforme, non conforme ou bloqué, avec sa cause ; rapport de conformité à coller dans Jira, en balisage wiki de Data Center et en page HTML pour Cloud, copies d'écran sous un nom stable sur demande ; résultats d'une exécution ou d'une campagne au format d'import de Xray Cloud ou Data Center (statut du verdict, statut et copies d'écran par pas d'un test manuel converti, exemples des jeux, exécution de test existante) ou de Zephyr Scale (format custom, JSON et archive .zip), sous la clé retenue à l'import, sans rien envoyer ; désignation d'une cible à la souris ; agent pilote-scenario et commandes /scenario:importer, /scenario:indexer, /scenario:traduire, /scenario:jouer, /scenario:designer, /scenario:exporter et /scenario:resultats. Point d'entrée : [`specs/scenario-playwright/SKILL.md`](specs/scenario-playwright/SKILL.md).

### D1 : Exécution : installation, dépendance, emplacements, réglages, lignes de commande (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D1.INV-1** | le skill demande Node 22 ou plus récent et une seule dépendance d'exécution, `playwright-core` à version exacte, qui pilote le navigateur installé sur le poste sans en télécharger ; `@playwright/test`, à la même version exacte, n'est qu'une dépendance de développement, pour la recette des tests exportés : aucun script du skill ne l'importe, seules les aides écrites dans le projet l'importent, du projet. | `execution`, `session`, `recette` |
| **D1.INV-2** | ce que le skill écrit reste sur le poste : profils dans son dossier (`.profils/`), résultats à côté du scénario (`resultats/`) ou dans le dossier choisi ; son `.gitignore` écarte `node_modules/`, `.profils/` et `resultats/`. | `execution`, `session`, `garde`, `export`, `conformite`, `recette` |
| **D1.INV-3** | chaque réglage se lit dans sa variable `SCENARIO_PLAYWRIGHT_CANAL`, `SCENARIO_PLAYWRIGHT_PROFILS` ou `SCENARIO_PLAYWRIGHT_DELAI`, ou prend son défaut ; une variable vide vaut absente ; une valeur invalide est refusée. | `execution`, `session`, `recette` |
| **D1.INV-4** | `jouer.mjs` sort avec le code 0 quand tout a réussi, 1 quand une étape a échoué, 2 quand le scénario, une option ou l'environnement sont refusés, avant toute action dans le navigateur ; dans une campagne, 0 quand chaque scénario a réussi, 1 quand l'un a échoué, 2 quand l'un est refusé ; `verifier.mjs`, `traduire.mjs`, `indexer.mjs` et `resultats.mjs` sortent avec 0 ou 2 ; `exporter.mjs` avec 0 quand chaque fichier est écrit ou à jour, 1 quand un fichier n'est pas écrit, 2 quand un scénario ou une option est refusé, avant toute écriture. | `execution`, `conformite`, `recette` |

### D2 : Texte de départ inspiré de Gherkin, en français ou en anglais (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | un texte décrit un seul scénario : étiquettes facultatives, un titre, une adresse et des réglages, au moins une étape introduite par un mot-clé, et au plus un tableau d'exemples ; toute autre ligne est refusée, et chaque erreur donne sa ligne. | `texte`, `jira`, `agent`, `recette` |
| **D2.INV-2** | chaque étape garde son numéro de ligne, son mot-clé, sa phrase, sa marque `(création)`, `(modification)`, `(suppression)`, `(à la main)`, ou de préparation et de nettoyage (D20.INV-1), et ses variables `<nom>` ; une variable qui n'est ni un paramètre, ni une colonne des exemples, ni `<unique>` est refusée. | `texte`, `recette` |
| **D2.INV-3** | l'empreinte d'un texte est le SHA-256 de son contenu en fins de ligne LF, sans BOM, en caractères composés : une extraction en CRLF donne la même. | `texte`, `recette` |
| **D2.INV-4** | les mots-clés de Gherkin se lisent en français ou en anglais, sans tenir compte de la casse ni des accents, et chaque mot-clé se garde tel qu'écrit ; `Contexte:` et `Règle:` (`Background:`, `Rule:`) sont refusés dans un texte, avec leur ligne ; les réglages et les marques s'écrivent en français. | `texte`, `jira`, `recette` |

### D3 : Scénario TOML et contrôle de sa traduction (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | un scénario n'est joué que s'il est valide : format, champs requis, actions du jeu fermé, champs connus de chaque action, valeurs bornées ; chaque erreur cite l'étape, sa ligne du TOML et sa ligne du texte, et le refus a lieu avant d'ouvrir le navigateur. | `scenario`, `donnees`, `recette` |
| **D3.INV-2** | un scénario traduit d'un texte cite le fichier du texte et son empreinte ; il est refusé si le texte manque ou a changé depuis la traduction. | `texte`, `jira`, `cas-de-test`, `scenario`, `garde`, `agent`, `recette` |
| **D3.INV-3** | la traduction recopie exactement la structure du texte : titre, étiquettes, adresse, origines, profil, paramètres et exemples ; chaque étape cite une ligne d'étape du texte, dans l'ordre du texte, et chaque étape du texte a au moins une étape. | `scenario`, `recette`, `traduction-auto` |
| **D3.INV-4** | une marque de mutation du texte se retrouve sur une étape de sa ligne ; une ligne marquée « (à la main) » donne une seule étape `main`, et une étape `main` vient toujours d'une telle ligne ; chaque variable `<nom>` d'une ligne se retrouve en `${nom}` dans une étape de cette ligne. | `texte`, `scenario`, `recette` |
| **D3.INV-5** | le squelette d'une traduction est produit sans IA à partir du texte ; ses étapes restent à compléter, et un scénario qui en garde une est refusé. | `execution`, `code`, `scenario`, `donnees`, `agent`, `recette`, `traduction-auto` |
| **D3.INV-6** | une variable `${nom}` prend la valeur de `--param`, sinon du jeu joué, sinon de `[parametres]` ; une variable non déclarée, ou un `--param` qui ne désigne ni un paramètre ni une colonne des jeux, est refusé. | `execution`, `scenario`, `recette` |

### D4 : Cibles côté utilisateur (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D4.INV-1** | une cible se désigne par une seule stratégie côté utilisateur : rôle et nom accessible, libellé, texte, placeholder, identifiant de test, texte alternatif ou titre ; un sélecteur CSS et un rang ne servent qu'en dernier recours, et le rapport les signale fragiles. | `cibles`, `preuves`, `recette` |
| **D4.INV-2** | une cible qui désigne plusieurs éléments fait échouer l'étape sans agir, et le message cite les éléments trouvés ; une cible absente fait échouer l'étape à son délai, sans agir. | `cibles`, `actions`, `agent`, `recette` |
| **D4.INV-3** | `dans` restreint une cible à l'intérieur d'une autre, sur trois niveaux au plus. | `cibles`, `recette` |

### D5 : Actions et étapes : jeu fermé, attentes, vérifications (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D5.INV-1** | le jeu d'actions est fermé : `naviguer`, `cliquer`, `saisir`, `choisir`, `cocher`, `survoler`, `touche`, `televerser`, `telecharger`, `attendre`, `verifier`, `capturer` et `main` ; aucune étape n'exécute de code dans la page, et les sources du skill n'emploient ni évaluation dans la page, ni script injecté, ni fonction exposée, ni attente d'une durée fixe. | `scenario`, `actions`, `recette`, `accessibilite`, `enregistrement` |
| **D5.INV-2** | une étape attend un état, dans son délai : celui de l'étape, sinon du scénario, sinon du réglage, sinon 10 s ; jamais plus de 30 s, ni plus de 900 s pour une étape `main` ; elle s'arrête dès que l'état est obtenu. | `scenario`, `cibles`, `actions`, `recette` |
| **D5.INV-3** | aucune étape n'est rejouée ; une étape échouée arrête le jeu et les suivantes sont « non jouées », sauf après une étape `verifier`, dont les étapes `verifier` qui suivent sont jouées. | `actions`, `hors-ecran`, `donnees`, `export`, `recette` |
| **D5.INV-4** | `verifier` compare selon son critère, `contient`, `visible`, `valeur`, `nombre`, `url` ou `actif`, et hors de l'écran `requete`, `api` ou `fichier` (D19), en interrogeant l'état jusqu'à son délai ; un échec donne l'attendu et l'obtenu. | `actions`, `export`, `recette` |
| **D5.INV-5** | `televerser` ne prend que des fichiers du dossier du scénario et de ses sous-dossiers ; `telecharger` enregistre le fichier dans les résultats, avec son empreinte. | `scenario`, `actions`, `recette` |

### D6 : Session et navigateur du poste, étape à la main (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D6.INV-1** | le navigateur est celui du poste, Chrome par défaut, Edge ou le Chromium de Playwright sur réglage ; le rapport note sa version, et avertit quand son numéro majeur dépasse celui du Chromium de `playwright-core`, ou reste plus de deux versions en arrière. | `execution`, `session`, `preuves`, `recette` |
| **D6.INV-2** | le skill ne demande, ne lit, ne stocke ni ne saisit aucun identifiant ; une connexion se fait à la main, dans la fenêtre visible, et la session vit dans un profil dédié, réutilisé d'une exécution à l'autre. | `session`, `garde`, `export`, `agent`, `recette` |
| **D6.INV-3** | une étape `main` attend que le développeur atteigne l'état que décrit `jusqua`, dans son délai ; un scénario qui en a une est refusé sans fenêtre (`--sans-tete`), avant d'ouvrir le navigateur. | `execution`, `session`, `recette` |

### D7 : Garde : origines, mutations hors du poste, trace (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D7.INV-1** | aucune requête ne part vers une origine que le scénario ne déclare pas, WebSocket compris : elle est interrompue avant chargement et comptée dans le rapport ; une navigation de la page vers une telle origine fait échouer l'étape. | `actions`, `hors-ecran`, `session`, `garde`, `preuves`, `export`, `conformite`, `agent`, `recette` |
| **D7.INV-2** | un scénario qui a une étape de mutation et une origine hors du poste (autre que 127.0.0.1, `localhost` ou `[::1]`) n'est joué qu'avec `--autoriser-mutations` ; sans cette option, il est refusé avant d'ouvrir le navigateur, et une étape de mutation sur une page hors du poste échoue sans agir. | `execution`, `texte`, `scenario`, `actions`, `session`, `garde`, `export`, `agent`, `recette` |
| **D7.INV-3** | la trace n'est enregistrée que sur demande (`--trace`), et le rapport rappelle qu'elle contient les cookies et les en-têtes de la session ; les résultats ne quittent pas le poste. | `execution`, `garde`, `recette` |

### D8 : Preuves et rapport (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D8.INV-1** | chaque exécution écrit, dans son dossier de résultats horodaté, `rapport.json`, aux champs stables, et `rapport.md` ; chaque étape y a son statut, sa durée, sa ligne du texte, sa cible et son message. | `preuves`, `recette` |
| **D8.INV-2** | chaque étape `verifier`, à l'écran ou hors de l'écran, chaque étape `capturer` et chaque échec ont leur capture, et chaque jeu celle de l'écran à la fin de ses étapes (D22.INV-2) ; une vérification hors de l'écran a aussi son relevé ; un échec a aussi l'instantané ARIA de la page ; les erreurs de console, les erreurs de la page et les réponses de statut 400 ou plus sont relevées étape par étape. | `actions`, `hors-ecran`, `preuves`, `recette` |

### D9 : Désignation d'une cible à la souris (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D9.INV-1** | la désignation n'agit pas sur la page : chaque clic du développeur rend la cible de l'élément au format du scénario, par la meilleure stratégie que propose Playwright, ou la signale non convertible. | `cibles`, `designer`, `recette` |

### D10 : Agent pilote-scenario et commandes de Gemini CLI (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D10.INV-1** | l'agent ne joue un scénario traduit qu'après la ratification explicite du développeur, à qui le plan est présenté ligne du texte par ligne du texte. | `scenario`, `agent`, `recette` |
| **D10.INV-2** | l'agent ne passe `--autoriser-mutations` qu'avec l'accord explicite du développeur pour cette exécution, et ne demande ni ne saisit aucun identifiant. | `garde`, `conformite`, `agent` |
| **D10.INV-3** | l'agent ne modifie ni le texte de départ ni un scénario ratifié sans l'accord du développeur ; une correction se propose, puis se ratifie. | `agent` |
| **D10.INV-4** | l'agent ne lit les commentaires d'une demande Jira qu'à la demande du développeur, compare avant de remplacer, ne passe `--remplacer` qu'avec son accord, ne supprime aucun texte dont le scénario a disparu de sa source et ne corrige pas lui-même un scénario refusé. | `agent` |
| **D10.INV-5** | l'agent ne demande, ne lit, n'affiche, n'écrit ni ne passe en argument aucun jeton d'API ; il dit au développeur quelle variable d'environnement définir, sans la définir lui-même ; un jeton collé dans la conversation est signalé, avec la recommandation de le révoquer, et n'est pas utilisé. | `agent` |
| **D10.INV-6** | l'agent n'exécute, ne construit ni ne modifie le code du projet pour l'indexer ; il ne reprend aucune proposition de l'index sans l'avoir contrôlée contre la phrase et l'index, et examine avec le développeur chaque cible ou chemin noté absent de l'index avant de présenter le plan. | `scenario`, `agent` |
| **D10.INV-7** | l'agent ne traduit une préparation ou un nettoyage que d'une ligne marquée, contrôle contre l'index chaque endpoint et chaque champ de corps qu'il en reprend, ne crée, ne modifie ni ne supprime aucune donnée hors d'une entrée ratifiée, et examine avec le développeur un nettoyage noté sur une donnée fixe avant de présenter le plan ; une préparation refusée en 401 lui fait proposer une connexion à la main ou une préparation par un scénario, sans autre geste. | `donnees`, `agent` |
| **D10.INV-8** | l'agent n'exporte qu'un scénario ratifié, n'écrit dans le projet que par `exporter.mjs`, dans le dossier que le développeur désigne, n'y installe rien, ne retouche ni un test exporté ni les aides, n'écrit jamais la connexion de l'équipe et ne passe `--remplacer` qu'avec l'accord du développeur ; il n'envoie aucun résultat à Xray ni à Zephyr Scale, et n'ajoute les captures (`--preuves`) qu'à la demande du développeur. | `export`, `agent` |
| **D10.INV-9** | l'agent ne tire le texte d'une page de test enregistrée que par `importer.mjs`, n'ajoute aucune valeur d'une page à un diagnostic et ne recopie ni le contenu d'une page ni ses copies d'écran hors du poste ; il ne joue en campagne que des scénarios ratifiés, demande l'accord du développeur avant `--autoriser-mutations` en citant les scénarios qui modifient des données, distingue au bilan un test bloqué d'un test non conforme, n'ajoute les copies d'écran au rapport de conformité qu'à la demande du développeur et ne colle rien dans Jira. | `agent` |

### D11 : Traduction sans IA du texte de départ, par un catalogue de phrases (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D12 : Parcours du kit démo de generateur-skill-ticket, captures comparées aux images de l'objectif (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D13 : Remise des scénarios et des rapports à Agent2Test (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D14 : Audit d'accessibilité des pages parcourues (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D15 : Enregistrement des gestes du développeur en scénario (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D16 : Scénarios importés d'une demande Jira (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D16.INV-1** | une demande se lit depuis sa page enregistrée en MHTML, jamais modifiée, dont l'empreinte sha256 est notée dans chaque texte importé, ou depuis son adresse, ouverte dans le navigateur du poste, dans une fenêtre visible, sur un profil dédié à Jira : le skill y navigue vers l'adresse donnée et rien d'autre, sans cliquer, saisir ni envoyer de formulaire ; la connexion se fait à la main, dans le délai réglé ; la page est enregistrée en MHTML dans le sous-dossier `jira/` du dossier des textes, puis lue comme une page enregistrée. | `jira`, `garde`, `agent`, `recette` |
| **D16.INV-2** | seules les pages de Jira Cloud et de Jira Data Center, reconnues à leurs marqueurs, sont lues, et seulement leur description, leurs champs de texte et, avec `--commentaires`, leurs commentaires ; scripts, styles et boutons ne sont jamais lus comme du texte ; une autre page est refusée. | `jira`, `agent`, `recette` |
| **D16.INV-3** | chaque scénario est recopié sans IA, tel qu'écrit dans Jira, en français ou en anglais : mots-clés, titre, étapes et exemples ; ne s'y ajoutent que les réglages donnés à l'import, le contexte de sa fonctionnalité et de sa règle en tête de ses étapes, et ses colonnes d'exemples adaptées au format texte avec leurs variables, chaque ajout signalé en tête du texte ; un scénario que le format texte n'exprime pas n'est pas écrit, et son refus est motivé. | `jira`, `agent`, `recette` |
| **D16.INV-4** | chaque texte importé se nomme `<ÉTIQUETTE>.scenario` et commence par sa provenance : demande, étiquette et zone, source, page enregistrée et son empreinte, date, empreinte Jira du scénario, empreinte du texte importé ; l'étiquette est celle que Jira donne au scénario, sinon celle qu'un import précédent a attribuée au scénario de même titre, sinon le plus petit numéro libre dans l'ordre de la page ; le second scénario d'une même étiquette n'est pas écrit. | `jira`, `recette` |
| **D16.INV-5** | un texte dont le scénario n'a pas changé dans sa source n'est jamais réécrit ; un texte dont le scénario a changé n'est remplacé qu'avec `--remplacer`, et un texte retouché depuis l'import est d'abord gardé à côté ; un texte qui ne vient pas d'un import de ce scénario, de la demande ou d'une autre source qui lui donne la même étiquette, n'est jamais remplacé ; un texte dont le scénario a disparu de sa source est signalé, jamais supprimé ; `--comparer` n'écrit aucun texte et dit, pour chaque scénario, s'il est identique, modifié, nouveau ou disparu. | `jira`, `agent`, `recette` |
| **D16.INV-6** | `importer.mjs` sort avec le code 0 quand chaque scénario est écrit, remplacé ou inchangé (avec `--comparer` : identique), 1 quand un scénario n'est pas écrit, qu'un test est introuvable ou qu'il n'y a aucun scénario (avec `--comparer` : une différence), 2 quand une option, un réglage, la page, le fichier, l'archive, une variable d'environnement, une requête à une API ou le navigateur sont refusés, ou que la demande ne s'affiche pas dans le délai, avant toute écriture de texte. | `execution`, `jira`, `recette` |

### D17 : Cas de test de Xray et de Zephyr Scale, fichiers .feature, pages de tests enregistrées (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D17.INV-1** | une source se lit sans IA : fichier `.feature` ; archive `.zip`, lue en mémoire sans rien extraire sur le disque, ses seuls fichiers `.feature`, stockés ou compressés par deflate, chacun contrôlé par son CRC-32, en nombre et en taille bornés ; tests de Xray Cloud ou Data Center, cas de test de Zephyr Scale Cloud ou Data Center, désignés par leurs clés, 200 au plus ; chaque scénario Gherkin suit le lecteur et les règles de recopie de D16.INV-3. | `jira`, `cas-de-test`, `recette` |
| **D17.INV-2** | les API ne sont que lues : des requêtes GET, et pour Xray Cloud l'authentification et des requêtes GraphQL `query`, jamais `mutation` ; le skill n'écrit rien dans Jira, Xray ni Zephyr Scale ; toutes les lectures précèdent toute écriture de texte. | `jira`, `cas-de-test`, `export`, `conformite`, `recette` |
| **D17.INV-3** | un jeton se lit dans sa variable d'environnement seulement, `XRAY_CLIENT_ID` et `XRAY_CLIENT_SECRET`, `ZEPHYR_TOKEN` ou `JIRA_TOKEN` ; il ne sort que dans l'en-tête `Authorization` des requêtes vers l'origine de l'API désignée, l'identifiant et le secret de Xray Cloud dans le corps de son authentification, jamais dans une adresse, un message ou un fichier ; l'adresse de l'API est en https, hors du poste même, sans identifiant, paramètre ni fragment ; aucune redirection n'est suivie ; une variable absente ou une adresse refusée arrêtent l'import avant toute requête. | `jira`, `cas-de-test`, `agent`, `recette` |
| **D17.INV-4** | la clé du test est l'identité de son scénario : clé demandée à l'API ; dans un fichier, étiquette `@TestCaseKey=` de Zephyr Scale, sinon première étiquette propre au scénario qui est une clé de Jira, préfixe `TEST_` retiré, sauf si un scénario d'un autre titre la porte aussi, sinon étiquette `<CLÉ>-Snn` ; à défaut, une étiquette `<fichier>-Snn` est reprise par le titre ou attribuée comme en D16.INV-4. Un texte importé d'une autre source sous la même identité est celui du même scénario : il se compare et se remplace selon D16.INV-5, jamais en conflit. | `jira`, `cas-de-test`, `recette` |
| **D17.INV-5** | un test Cucumber ou BDD est recopié tel qu'écrit, sous un titre formé de son résumé quand ses étapes n'en ont pas ; un test manuel devient, pas à pas, « Quand <action> », avec ses données, puis « Alors <résultat attendu> », une partie de plusieurs lignes jointe par « ; », une partie vide omise, la conversion dite dès la première ligne du texte ; un test générique, en texte libre, qui appelle un autre cas, sans résumé, sans pas ou avec un pas vide est refusé avec son motif ; les préconditions sont signalées en tête du texte, non reprises. | `jira`, `cas-de-test`, `agent`, `recette` |
| **D17.INV-6** | un texte importé hors de Jira commence par sa provenance : l'outil ou le fichier dont il vient et ce que l'import en a fait, recopie ou conversion d'un test manuel ; son lot (fichier, archive ou test) ; l'étiquette et la provenance du scénario ; l'adresse de l'API qui l'a rendu, ou le chemin du fichier ou de l'archive et son empreinte sha256 ; la date ; l'empreinte de la source et celle du texte importé ; puis ses notes ; un même test donne le même texte et la même empreinte par Xray Cloud ou Data Center, par sa page enregistrée, par Zephyr Scale Cloud ou Data Center. | `cas-de-test`, `recette` |
| **D17.INV-7** | une page de test de Xray enregistrée par Chrome en HTML complet, ou chaque page `.html` d'un dossier, 200 au plus, se lit sans IA, comme du texte : aucun script n'est exécuté, aucune adresse n'est suivie ; le texte des scripts, des styles, des menus de choix, des boutons et des éléments masqués n'est pas lu ; un cadre n'est lu que s'il est un fichier du dossier de la page, sans lien symbolique, sur deux niveaux au plus, en taille et en nombre bornés, un autre cadre étant compté sans être lu ; la clé vient du titre de la page ou de l'adresse notée à son enregistrement, une page sans clé et une seconde page du même test sont refusées ; les pas se reconnaissent à leurs libellés Action, Données et Résultat attendu, en français ou en anglais, en tableau, HTML ou aux rôles ARIA, ou en mode formulaire, sinon le scénario Gherkin d'un seul document, sinon la page est refusée avec son motif ; le test suit D17.INV-4 à D17.INV-6, sous le lot de sa clé ; `--diagnostic` décrit la structure de chaque page sans aucune de ses valeurs, ni texte, ni clé, ni adresse, ni nom de fichier, et n'écrit rien. | `jira`, `cas-de-test`, `agent`, `recette` |

### D18 : Index du code du projet, front et back, lu à la traduction (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D18.INV-1** | le projet n'est que lu : `indexer.mjs` n'exécute, n'importe ni ne construit aucun de ses codes, ne suit aucun lien symbolique, écarte les fichiers et dossiers cachés, les dépendances, les sorties de construction, les fichiers de test et le dossier des scénarios, et n'écrit que `index/code.json` et `index/code.md` dans le dossier des scénarios. | `code`, `recette` |
| **D18.INV-2** | chaque entrée de l'index cite sa source, `fichier:ligne` ; l'index porte l'empreinte des fichiers lus, chemins et contenus ; un index dont l'empreinte ne correspond plus au code, illisible, d'un autre format ou dont le projet est introuvable n'est pas employé, et `traduire.mjs` et `verifier.mjs` le disent ; le même projet donne le même index. | `execution`, `code`, `scenario`, `agent`, `recette` |
| **D18.INV-3** | la lecture est bornée : 20 000 fichiers, 1 Mio par fichier, 200 Mio en tout, 40 niveaux de dossiers ; un fichier trop gros n'est pas lu, une borne atteinte rend l'index partiel, et chacun est dit (`LIMITE`, `limites`). | `code`, `recette` |
| **D18.INV-4** | l'index ne décide de rien : le squelette n'en reçoit que des propositions en commentaire, chaque étape restant à compléter ; une cible ou un chemin absent de l'index est une note de `verifier.mjs`, jamais une erreur, et le code de sortie n'en dépend pas. | `execution`, `code`, `scenario`, `agent`, `recette` |
| **D18.INV-5** | de la configuration du back, seul le chemin de contexte est retenu, s'il a la forme d'un chemin ; aucune autre valeur, mot de passe, jeton ou adresse de base de données, n'entre dans l'index. | `code`, `recette` |

### D19 : Vérifications hors de l'écran : requêtes de la page, API en lecture, fichiers téléchargés (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D19.INV-1** | hors de l'écran, le skill observe sans agir : `requete` lit les requêtes que la page a faites depuis le début de la dernière action ; `api` ne fait qu'un GET, vers une origine déclarée, vérifiée à la validation et avant l'appel, avec la session du profil et sans en-tête ajouté, et ne suit aucune redirection ; `fichier` lit un fichier qu'une étape `telecharger` nommée du scénario a enregistré. | `scenario`, `actions`, `hors-ecran`, `export`, `recette` |
| **D19.INV-2** | aucun en-tête ni cookie n'est relevé ; les corps de requête et les réponses restent en mémoire le temps de l'exécution, jamais ceux d'une étape à la main ; le rapport ne cite que la méthode, l'adresse, le statut et les champs vérifiés, la valeur d'un paramètre d'adresse ou d'un champ au nom de secret masquée. | `scenario`, `actions`, `hors-ecran`, `export`, `conformite`, `recette` |
| **D19.INV-3** | chaque vérification hors de l'écran a un critère fermé, des champs validés avant le navigateur, un délai borné et des tailles bornées (64 Kio de corps, 256 Kio de réponse, 1 Mio par l'API, 10 Mio de fichier, 500 requêtes par jeu) ; un échec donne l'attendu et l'obtenu. | `actions`, `hors-ecran`, `recette` |

### D20 : Préparation et nettoyage des données, par l'API ou par un scénario (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D20.INV-1** | la préparation et le nettoyage des données se déclarent par une marque du texte, `(par l'API)`, `(nettoyage par l'API)`, `(préparation : nom)` ou `(nettoyage : nom)`, et se traduisent dans les sections `[[preparation]]` et `[[nettoyage]]` du scénario, hors du jeu fermé de treize actions, qui ne change pas ; une ligne de préparation précède les étapes qui ne sont ni à la main ni de préparation, une ligne de nettoyage suit toutes les autres ; le contrôle sans IA refuse une ligne marquée sans entrée, une entrée sans ligne marquée de son genre, un appel sur une ligne qui nomme un scénario ou l'inverse, un autre scénario que celui nommé, l'ordre du texte non suivi, une variable perdue, et une étape sur une telle ligne. | `texte`, `scenario`, `donnees`, `agent`, `recette` |
| **D20.INV-2** | un appel de préparation ou de nettoyage part vers une origine déclarée, avec les cookies du profil et le jeton anti-CSRF recopié en mémoire de son cookie (`XSRF-TOKEN` dans `X-XSRF-TOKEN`, `csrftoken` dans `X-CSRFToken`), sans autre en-tête que `Accept` et `Content-Type`, sans lire aucun identifiant ; il est fait une fois, et aucune redirection n'est suivie ; son corps et sa réponse restent en mémoire ; le rapport n'en garde que la méthode, l'adresse masquée, dans l'appel comme dans le résumé, le statut, la taille et les valeurs gardées, masquées par leur nom ; une valeur gardée au nom de secret ne paraît ensuite nulle part, ni dans la sortie ni dans le rapport, même réemployée par une étape ou un appel ; une valeur ne se garde que d'une réponse JSON d'au plus 1 Mio, présente et simple. | `scenario`, `actions`, `donnees`, `garde`, `export`, `conformite`, `agent`, `recette` |
| **D20.INV-3** | chaque appel est une mutation que sa méthode détermine, `POST` création, `PUT` et `PATCH` modification, `DELETE` suppression, et un scénario de préparation compte par ses étapes de mutation ; un scénario qui en a et déclare une origine hors du poste n'est joué qu'avec `--autoriser-mutations`, refusé sinon avant le navigateur ; à l'exécution, un appel vers une origine hors du poste n'est pas fait sans cette autorisation, quel que soit l'appelant du moteur (E3). | `execution`, `scenario`, `actions`, `donnees`, `garde`, `export`, `agent`, `recette` |
| **D20.INV-4** | chaque entrée de préparation se joue à sa place, avant la première étape d'une ligne plus grande du texte, sans texte avant la première étape qui n'est pas à la main ; une préparation en échec arrête le jeu ; le nettoyage se joue après les étapes, même après un échec, chaque entrée une fois, la suivante jouée après l'échec de l'une ; une entrée dont une valeur gardée manque n'est pas jouée ; un nettoyage en échec est signalé dans la sortie et le rapport, sans changer le statut ni le code de sortie, et un nettoyage d'une donnée fixe est noté par `verifier.mjs`. | `execution`, `actions`, `donnees`, `preuves`, `export`, `conformite`, `agent`, `recette` |
| **D20.INV-5** | un scénario de préparation ou de nettoyage est un scénario du dossier, valide et dont la traduction est contrôlée, sans jeux, sans préparation ni nettoyage à lui, aux origines comprises dans celles du scénario qui le nomme, au même profil, et qui n'est pas ce scénario ; il reçoit ses valeurs par `parametres`, qui sont ses paramètres, et le `${unique}` du jeu ; il se joue une fois, dans le même onglet, et ses étapes paraissent dans le rapport sous son entrée. | `scenario`, `actions`, `donnees`, `export`, `recette` |
| **D20.INV-6** | `${unique}`, `<unique>` dans le texte, vaut un suffixe propre à chaque jeu de chaque exécution, sept caractères au moins, et se remplace aussi dans les valeurs des paramètres et des jeux ; `unique` est un nom réservé ; une valeur gardée devient une variable à partir de sa préparation, pour les préparations suivantes, les étapes qui ne sont pas à la main et le nettoyage, et se résout à l'exécution ; un nom gardé n'est ni déclaré ni gardé deux fois. | `texte`, `scenario`, `actions`, `donnees`, `export`, `recette` |

### D21 : Export en tests `@playwright/test` du projet, résultats pour Xray et Zephyr Scale (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D21.INV-1** | un test exporté s'écrit sans IA depuis un scénario valide dont la traduction est contrôlée (D3.INV-1, D3.INV-2) ; le même scénario, avec la même version du skill, donne le même test, octet pour octet ; chaque jeu devient un test, chaque étape un `test.step` qui garde son numéro et sa ligne du texte, chaque cible le localisateur de Playwright du skill, chaque étiquette un tag ; son en-tête dit la version du skill, le scénario source et l'empreinte de son corps ; `verifier.mjs` le régénère depuis sa source, et le refuse périmé, retouché ou d'un scénario devenu invalide. | `execution`, `export`, `agent`, `recette` |
| **D21.INV-2** | `exporter.mjs` n'écrit que dans le dossier de tests que le développeur désigne, qui doit exister, et seulement ses fichiers : les tests, les aides et, une fois, la souche de connexion ; un fichier dont l'en-tête n'est pas du skill n'est jamais remplacé ; un test périmé ne l'est qu'avec `--remplacer`, un test retouché à la main est d'abord gardé à côté ; la connexion de l'équipe ne l'est jamais ; `--comparer` n'écrit rien ; aucun identifiant, mot de passe, jeton ni valeur d'une exécution n'est écrit : une étape à la main appelle la connexion de l'équipe, dont la souche échoue en disant ce qui manque. | `export`, `agent`, `recette` |
| **D21.INV-3** | un test exporté suit la sémantique du moteur : attentes bornées, aucune étape rejouée, vérifications qui se poursuivent après un échec et test en échec à la fin, préparation à sa place, nettoyage même après un échec, chaque entrée une fois, nettoyage en échec annoté sans changer le résultat, `${unique}` propre à chaque jeu (D5.INV-2 à D5.INV-4, D20.INV-4, D20.INV-6) ; aucune requête, WebSocket compris, ne part vers une origine que le scénario ne déclare pas, après correspondance par `SCENARIO_ORIGINES` (D7.INV-1) ; un test qui modifie des données et dont une origine est hors du poste après correspondance est sauté sans `SCENARIO_AUTORISER_MUTATIONS=1`, et aucune étape de mutation ni aucun appel n'est fait hors du poste sans elle (D7.INV-2, D20.INV-3). | `garde`, `export`, `recette` |
| **D21.INV-4** | `resultats.mjs` lit le rapport d'une exécution, ou ceux d'une campagne, et écrit, à côté de lui, dans le dossier de la campagne ou dans le dossier choisi, un fichier au format d'import de Xray Cloud ou Data Center (JSON) ou de Zephyr Scale (« custom », en JSON et en archive .zip) ; la clé du test est celle que l'import du texte a retenue, ou celle de `--cle`, et sa forme est contrôlée ; le statut du test est celui de son verdict (D22.INV-3) ; un test manuel converti dont le texte n'a changé ni depuis l'import ni depuis l'exécution reçoit le statut de chacun de ses pas ; aucune copie d'écran n'est jointe sans `--preuves`, et avec elle celles des étapes d'un pas vont sur ce pas ; `--execution` désigne une exécution de test existante de Xray ; rien n'est envoyé. | `export`, `agent`, `recette` |
| **D21.INV-5** | ni un test exporté, ni ses aides, ni un fichier de résultats ne relèvent d'en-tête, de cookie ou de jeton ; leurs messages masquent la valeur d'un paramètre d'adresse ou d'un champ au nom de secret, comme le rapport du skill (D19.INV-2, D20.INV-2). | `recette` |

### D22 : Campagne, copies d'écran, verdict et rapport de conformité à coller dans Jira (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D22.INV-1** | deux scénarios ou plus, ou un dossier, dont les scénarios `.toml` se prennent dans l'ordre de leur nom, font une campagne : chacun est lu et contrôlé avant la première action, avec la garde des mutations, et un seul refus refuse la campagne, avec le code 2, sans ouvrir le navigateur ni créer de dossier ; un scénario désigné deux fois, des profils mêlés, `--jeu` et `--trace` sont refusés ; les scénarios se jouent l'un après l'autre dans un seul contexte du navigateur, sur leur profil commun, une étape à la main n'y demandant la connexion qu'une fois tant que la session tient ; avant chaque scénario, la garde des origines prend les siennes et son journal repart à zéro ; un test en échec n'arrête pas les suivants ; chaque test a son dossier de résultats dans celui de la campagne, qui porte `campagne.json`, aux champs stables, et `campagne.md`. | `execution`, `session`, `garde`, `preuves`, `conformite`, `agent`, `recette` |
| **D22.INV-2** | chaque vérification, à l'écran ou hors de l'écran, réussie ou non, a sa copie d'écran, chaque échec aussi, et chaque jeu celle de l'écran à la fin de ses étapes, avant le nettoyage, réussies ou non ; une copie qui ne peut se faire laisse son champ à `null` sans changer le résultat de l'étape. | `actions`, `hors-ecran`, `preuves`, `conformite`, `recette` |
| **D22.INV-3** | chaque jeu a un verdict : conforme si toutes ses étapes et toutes ses préparations ont réussi, non conforme si la première étape en échec est une vérification, bloqué si une préparation, ou une étape qui n'est pas une vérification, a échoué la première ; le nettoyage n'y entre pas ; le verdict d'un test et celui d'une campagne sont non conformes si l'un l'est, sinon bloqués si l'un l'est, sinon conformes ; la cause d'un verdict est la première entrée ou étape en échec, avec sa ligne et son message ; le statut et le code de sortie ne changent pas ; `resultats.mjs` recalcule les verdicts depuis les étapes du rapport. | `preuves`, `export`, `conformite`, `agent`, `recette` |
| **D22.INV-4** | `resultats.mjs --format jira` écrit, depuis les rapports d'une exécution ou d'une campagne, le rapport de conformité en balisage wiki de Jira (`conformite-jira.txt`) et en page HTML autonome (`conformite.html`), mêmes contenus : bilan, verdict, cause et statut de chaque étape de chaque test ; tout texte venu d'un rapport y est échappé ; avec `--preuves` seulement, les copies d'écran s'écrivent dans `captures-jira/` sous un nom stable, `<clé>-<n° de l'étape>.png`, `<clé>-fin.png`, `<clé>-p1.png`, `<clé>-n1.png`, préfixé du jeu quand il y en a plusieurs, citées dans le balisage et incluses dans la page ; deux tests aux mêmes noms sont refusés ; les mêmes rapports donnent le même texte, octet pour octet ; rien n'est envoyé ni collé : le développeur colle et joint lui-même. | `export`, `conformite`, `agent`, `recette` |

## skill4appli 1.1.1

Mémoire SQLite d'une application locale et de ses branches git pour un agent : inventaire fidèle à git, recherche chemin:ligne, requêtes en lecture seule, fraîcheur mesurée, watcher de la branche courante chargée dans un worktree dédié, configuration par l'environnement, parité Linux, WSL2 et Windows, agent mémoire. Point d'entrée : [`specs/skill4appli/SKILL.md`](specs/skill4appli/SKILL.md).

### D1 : Exécution : commandes, emplacement de la base, sorties et codes, migrations (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D1.INV-1** | aucune commande externe ne passe par un shell : git est lancé avec une liste d'arguments, et aucune donnée lue (nom de branche, chemin, message de commit) n'est jamais interprétée comme une commande. | `execution`, `parite`, `branches`, `recette` |
| **D1.INV-2** | l'emplacement de la base se déduit du worktree source, jamais du dossier courant ; dans un dépôt git, elle vit dans le dossier commun git (`<commun>/skill4appli/<id>/memoire.db`), hors de tout arbre suivi ; aucune commande de lecture ne crée de base. | `execution`, `interrogation`, `recette` |
| **D1.INV-3** | une réussite sort avec le code 0 et un JSON sur la sortie standard ; un échec sort avec un code non nul documenté (1 à 5, 7) et un JSON `{"ok": false, ...}` sur la sortie d'erreur ; `status` sort avec le code 6, réponse sur la sortie standard, quand la base n'est pas à jour. | `execution`, `recette` |
| **D1.INV-4** | le schéma n'évolue que par migrations numérotées (`PRAGMA user_version`) ; une base créée par une version plus récente est refusée ; une base de la version d'origine, sans numéro de schéma, est reconstruite. | `execution`, `recette` |
| **D1.INV-5** | le script et sa recette n'utilisent que les modules natifs de Node 22.13 ou plus récent ; aucune installation de paquet n'est nécessaire. | `execution`, `recette` |

### D2 : Inventaire et ingestion (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | dans un dépôt git, l'inventaire est celui de git (fichiers suivis, et non suivis non ignorés) : un fichier ignoré par `.gitignore` ou par l'exclusion du dépôt n'est jamais indexé. | `ingestion`, `recette` |
| **D2.INV-2** | après une ingestion, la base contient exactement les fichiers de l'inventaire : un fichier disparu du disque disparaît de la base, index plein texte compris. | `ingestion`, `recette` |
| **D2.INV-3** | un fichier binaire, de verrouillage, minifié, une carte de source ou un fichier plus gros que la limite est inventorié sans contenu, avec son type ; aucun contenu n'est altéré : un texte qui n'est pas en UTF-8 est lu en latin1 et marqué comme tel. | `ingestion`, `recette` |
| **D2.INV-4** | une ingestion ne relit que les fichiers dont la taille ou la date a changé, et ne réécrit que ceux dont le contenu a changé. | `ingestion`, `recette` |

### D3 : Branches git et fichiers par branche (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | `git_branches` donne toutes les branches locales et distantes, hors références symboliques, chacune sous son nom exact, avec la branche courante du worktree source, l'amont, l'avance et le retard, et le worktree où elle est extraite. | `branches`, `recette` |
| **D3.INV-2** | `branch_files` donne, pour chaque branche locale, les fichiers modifiés depuis l'ancêtre commun avec la base, avec leur statut et leurs lignes ajoutées et retirées. | `branches`, `recette` |

### D4 : Interrogation en lecture seule (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D4.INV-1** | `query`, `search`, `schema` et `status` ouvrent la base en lecture seule : aucune requête, même d'écriture, ne la modifie. | `interrogation`, `recette` |
| **D4.INV-2** | une réponse est bornée (nombre de lignes ou de fichiers, longueur des valeurs) et chaque troncature est signalée dans la réponse. | `interrogation`, `recette` |
| **D4.INV-3** | chaque réponse de `query` et de `search` porte l'instantané indexé : mode, commit, branche et date d'indexation. | `interrogation`, `fraicheur`, `recette` |
| **D4.INV-4** | `search` rend des emplacements `chemin:ligne` avec leur extrait, sans que la casse ni les accents fassent manquer une occurrence, les fichiers classés par pertinence. | `interrogation`, `recette` |

### D5 : Fraîcheur de la base (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D5.INV-1** | chaque indexation enregistre son mode, sa racine, le commit et la branche indexés et sa date. | `fraicheur`, `recette` |
| **D5.INV-2** | `status` compare la base au worktree source sans rien écrire ; il ne rend `a_jour`, avec le code 0, que si la base reflète exactement ce worktree ; sinon il nomme l'écart (commits en retard, fichiers modifiés, nouveaux ou disparus, modifications locales) et sort avec le code 6. | `fraicheur`, `recette` |

### D6 : Watcher de la branche courante dans un worktree dédié (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D6.INV-1** | le watcher charge la branche courante du worktree source dans un worktree dédié, créé détaché et verrouillé dans le dossier commun git ; il ne modifie jamais le worktree source, son index ni ses branches. | `watcher`, `recette` |
| **D6.INV-2** | à chaque nouveau commit ou changement de branche courante, le miroir est amené sur le commit de la source, seuls les fichiers changés entre l'ancien et le nouveau commit sont relus, et la base désigne alors ce commit et cette branche. | `watcher`, `recette` |
| **D6.INV-3** | un seul écrivain par base : tant qu'un watcher est actif, `ingest`, `git-scan`, `mirror-remove` et un second `watch` sont refusés avec le code 4 ; le verrou d'un watcher arrêté brutalement est repris. | `branches`, `watcher`, `recette` |
| **D6.INV-4** | le watcher ne force jamais : un miroir modifié à la main n'est ni écrasé ni nettoyé ; le watcher s'arrête avec le code 7 et nomme les fichiers en cause. | `watcher`, `recette` |
| **D6.INV-5** | le seul worktree que le skill retire est son propre miroir, sur commande explicite (`mirror-remove`), watcher arrêté ; un miroir modifié à la main n'est retiré qu'avec `--force`. | `watcher`, `recette` |

### D7 : Agent mémoire (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D7.INV-1** | avant de s'appuyer sur la base, l'agent lance `status` et déclare dans sa réponse l'instantané utilisé et tout écart connu. | `agent` |
| **D7.INV-2** | la base localise, le disque fait foi : avant d'affirmer le contenu d'un fichier ou de citer une ligne, l'agent relit ce fichier dans le worktree source. | `ingestion`, `agent` |
| **D7.INV-3** | l'agent ne modifie ni le code du projet ni le miroir ; il n'écrit dans la base que par `ingest` et `watch`, et ne lance `watch` ni `mirror-remove` sans l'accord du développeur. | `agent`, `service-mcp` |
| **D7.INV-4** | l'agent ne charge jamais de contenu non borné : aucune lecture de `content` sans filtre sur le chemin et sans limite de longueur. | `agent` |

### D8 : Modifications locales non commitées, superposées au miroir (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D9 : Symboles par langue : classes, méthodes, routes (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D10 : Configuration par l'environnement (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D10.INV-1** | chaque réglage de déploiement se lit d'abord dans l'option de la ligne de commande, puis dans sa variable d'environnement `SKILL4APPLI_*`, puis prend son défaut ; aucun réglage n'est lu dans un fichier. | `execution`, `configuration`, `recette` |
| **D10.INV-2** | une valeur invalide, d'option ou de variable, arrête la commande avec le code 1 et un message qui nomme sa source ; une variable vide vaut absente. | `configuration`, `recette` |
| **D10.INV-3** | `config` rend la valeur effective de chaque réglage, sa source (option, environnement, défaut) et les emplacements qui en découlent, sans rien écrire ni créer. | `configuration`, `recette` |

### D11 : Service MCP en stdio, en lecture seule (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D12 : Parité Linux, WSL2 et Windows (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D12.INV-1** | le worktree source est désigné par son chemin réel, comparé sans casse sous Windows : un même worktree a une seule base et un seul miroir, quel que soit le chemin qui y mène (lien, casse, nom court). | `execution`, `parite`, `recette` |
| **D12.INV-2** | les chemins absolus enregistrés et rendus sont au format de la plateforme qui exécute le skill ; les chemins de fichiers du dépôt sont toujours relatifs et en `/`. | `execution`, `parite`, `branches`, `recette` |
| **D12.INV-3** | le watcher s'arrête proprement de la même façon sur toutes les plateformes, par `watch-stop`, qui attend sa confirmation ; une demande d'arrêt antérieure au watcher, ou qui vise un autre processus, ne l'arrête pas. | `execution`, `parite`, `watcher`, `recette` |
| **D12.INV-4** | les fins de ligne de la plateforme (CRLF de `core.autocrlf`) ne faussent ni le compte et les numéros de ligne, ni les extraits de `search`, ni le verdict de `status`. | `parite`, `ingestion`, `recette` |
| **D12.INV-5** | lancé dans WSL sur un worktree du système de fichiers Windows, le skill le signale par l'avertissement `depot_windows_depuis_wsl` dans `status` et `config`, sans refuser la commande. | `execution`, `parite`, `fraicheur`, `agent`, `recette` |

## socle-acceptable 1.2.0

Socle de l'acceptable : le noyau commun de ce que les systèmes du dépôt refusent, au sens du troisième couplage du troisième ordre (EVOLUTION.md, section 10) ; intentions refusées, actions interdites, écritures interdites, secrets et leçons interdites, chaque règle un invariant que cite le refus ; écriture par les kits dev, test et démo, avec retour arrière ; refus, dérogations et faux refus ; épinglage par les constitutions, sans retrait ni affaiblissement. Point d'entrée : [`specs/socle-acceptable/SKILL.md`](specs/socle-acceptable/SKILL.md).

### SA1 : Intentions refusées : ce qu'une demande ne peut pas viser (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SA1.INV-1** | une demande de déployer ou d'administrer un environnement, ou d'écrire dans une base de données, hors d'un kit dev, test ou démo, est refusée « hors périmètre », avant tout traitement ; aucun kit n'atteint la production. Contrôle : scénario du système, une demande « redémarrer l'application en recette » refusée, comme NO9 d'Agent2Dev. | `agent2dev/noyau`, `agent2dev/acceptable`, `agent2test/noyau`, `agent2test/acceptable` |

### SA2 : Actions interdites, et le retour arrière des actions d'un kit (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SA2.INV-1** | aucun agent ne lance, hors d'un kit, un programme de déploiement ou d'orchestration d'environnement, ni une commande qui démarre ou déploie l'application. Contrôle : garde des commandes du système, un programme ou un argument de la liste refusé. | `agent2dev/noyau`, `agent2dev/profil`, `agent2dev/acceptable`, `agent2test/noyau`, `agent2test/acceptable`, `observatoire/export-binome`, `socle-observation` |
| **SA2.INV-2** | aucun agent, kit compris, ne pousse en force, ne réécrit un historique publié ni ne contourne un hook. Contrôle : garde du système et hooks du dépôt du projet. | `agent2dev/noyau`, `agent2dev/acceptable`, `agent2test/noyau`, `agent2test/acceptable`, `orchestrateur-c7e/acceptable` |
| **SA2.INV-3** | une action dans un kit ne s'exécute qu'avec son retour arrière préparé ; un échec se défait par lui, et le retour arrière se journalise. Contrôle : contrat des kits (SA8), scénarios du système, un kit sans retour arrière préparé non remis, un retour arrière consigné. | `generateur-skill-ticket/acceptable`, `orchestrateur-c7e/acceptable` |

### SA3 : Écritures interdites : ce qu'un agent ne modifie jamais, et rien avant la validation humaine (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SA3.INV-1** | aucun agent, même dans un kit, n'écrit dans la constitution de son système, dans les sources du système lui-même, dans ses fiches, dans la configuration humaine ni dans la transmission de son skill. Contrôle : garde d'écriture du système, une écriture dans chaque lieu refusée `ECRITURE_INTERDITE`. | `agent2dev/noyau`, `agent2dev/acceptable`, `agent2test/noyau`, `agent2test/acceptable` |
| **SA3.INV-2** | aucune écriture dans un projet, code, schéma ou configuration, avant qu'un humain ait validé ce qui sera fait ; un kit ne se produit et ne s'applique qu'après cette validation. Contrôle : scénario du système, une écriture tentée avant la validation refusée. | — |

### SA4 : Secrets : ce qui ne s'écrit nulle part (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SA4.INV-1** | aucun secret, jeton, mot de passe, clé ou certificat n'entre dans un journal, un livrable, un kit, un commit, un export ni une URL. Contrôle : recherche des motifs de secrets dans ce que le système écrit, et hooks du dépôt du projet. | `agent2dev/noyau`, `agent2dev/acceptable`, `agent2dev/kit`, `agent2test/noyau`, `agent2test/acceptable`, `agent2test/kit` |

### SA5 : Leçons interdites : ce qu'un système n'apprend pas (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SA5.INV-1** | aucune leçon ne s'apprend qui désactiverait un test, sauterait un point de contrôle ou de validation, contournerait une règle du noyau ou tronquerait le skill : elle est refusée par contrôle, avec la règle qu'elle contredirait. Contrôle : scénario du système, la consigne « ajouter @Disabled au test instable » refusée, comme AP6 d'Agent2Dev. | `agent2dev/noyau`, `agent2dev/apprenant`, `agent2dev/acceptable`, `agent2test/noyau`, `agent2test/apprenant`, `agent2test/acceptable` |

### SA6 : Application : confrontation avant l'action, refus, dérogations, faux refus (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SA6.INV-1** | toute action à effet extérieur est confrontée, avant son exécution, à la version épinglée du noyau et de la constitution du système : dans un kit, par le système qui le produit, avant de le remettre, le kit ne s'appliquant que tel qu'il a été confronté et validé ; sans kit, par la garde du système ; un refus cite sa règle. Contrôle : scénarios du système, chaque refus avec sa règle. | `generateur-skill-ticket/acceptable`, `orchestrateur-c7e/acceptable` |
| **SA6.INV-2** | seul un humain déroge, d'un rôle nommé et avec son motif, et seulement à une règle propre à la constitution qu'elle déclare dérogeable : aucune règle du noyau ne se déroge ; un refus déclaré infondé est un faux refus, consigné avec sa règle, sans que l'action s'exécute ; refus, dérogations, faux refus et retours arrière se journalisent. Contrôle : journal du système après une dérogation et un faux refus ; une dérogation demandée sur une règle du noyau, refusée. | `agent2dev/acceptable`, `agent2test/acceptable`, `generateur-skill-ticket/acceptable`, `orchestrateur-c7e/acceptable` |

### SA7 : Épinglage par les constitutions, et révision du noyau (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SA7.INV-1** | une constitution inclut tout le noyau, à une version épinglée par son empreinte, et n'en retire ni n'en affaiblit aucune règle ; elle peut en ajouter. Contrôle : au démarrage du système, l'empreinte du bloc épinglé, et chaque entrée du noyau présente dans la constitution. | `agent2dev/acceptable`, `agent2test/acceptable`, `orchestrateur-c7e/acceptable` |
| **SA7.INV-2** | le noyau ne change que par une version de ce socle publiée par un humain, qui ne fait qu'y ajouter ; aucun agent ne le modifie, et aucune règle de sûreté ne s'affaiblit : aucune entrée ne se retire, ne change de règle ni ne devient permise dans un kit. Contrôle : vérificateur du dépôt, bloc `noyau` au schéma fermé, comparé à celui de la version archivée précédente, et migration au journal de la version qui le change ; revue de la pull request. | `observatoire/acceptable`, `observatoire/examens` |

### SA8 : Kits : ce qu'un système remet à la fabrication de l'hôte, et ce qu'il consigne après elle (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SA8.INV-1** | un kit n'est remis qu'après sa confrontation, par le système qui le produit, à la version épinglée du noyau et de sa constitution : chaque fichier que son patch écrit, son contenu, chaque commande qu'il porte et l'intention qu'il accomplit ; un kit qui porterait une action refusée ou un secret n'est pas remis, et le refus cite sa règle ; une entrée `horsKit` n'y vise que l'environnement du kit, jamais la production. Contrôle : scénarios du système, un kit qui écrit dans un lieu interdit, ou qui porte un secret, non remis. | `agent2dev`, `agent2test`, `generateur-skill-ticket/acceptable`, `orchestrateur-c7e/acceptable` |
| **SA8.INV-2** | un kit porte son manifeste `socle-acceptable.kit/1`, avec l'empreinte de son patch et son retour arrière préparé ; il ne s'applique, par la fabrication de l'hôte, qu'après sa validation par un humain, à cette empreinte ; l'application et le retour arrière, déclarés par un humain, se consignent avec elle dans le journal du système qui l'a produit, et aucun agent n'applique un kit. Contrôle : scénarios du système, un kit modifié après sa validation dont l'application n'est pas consignée, un retour arrière consigné ; vérificateur du dépôt, manifestes d'exemple au schéma fermé. | `agent2dev`, `agent2test`, `generateur-skill-ticket/acceptable`, `orchestrateur-c7e/acceptable` |

## socle-back-front 1.1.0

Socle commun back-front : contrat OpenAPI, erreurs RFC 9457, formats de données, sécurité, traçabilité, accessibilité, événements temps réel par WebSocket STOMP (AsyncAPI, CloudEvents). Point d'entrée : [`specs/socle-back-front/SKILL.md`](specs/socle-back-front/SKILL.md).

### SC1 : Contrat d'API OpenAPI (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SC1.INV-1** | tout endpoint exposé par le back figure dans le contrat, et tout endpoint du contrat est implémenté. Contrôle : test de conformité du contrat côté back. | `java`, `java/api-rest`, `orchestrateur-c7e`, `orchestrateur-c7e/meso-contrats` |
| **SC1.INV-2** | aucun changement cassant n'est introduit dans une version d'API publiée. Contrôle : comparaison du contrat avec sa version précédente (outil de diff OpenAPI en CI, ou revue). | `agent-tdd-jira`, `agent2dev/conception`, `analyse-projet`, `analyse-projet/plans-action`, `java/api-rest`, `orchestrateur-c7e`, `orchestrateur-c7e/meso-contrats`, `orchestrateur-c7e/referentiel`, `orchestrateur-c7e/qualification` |
| **SC1.INV-3** | le front n'appelle les endpoints du contrat qu'au travers du client généré. Contrôle : recherche d'URL `/api/` codées en dur dans le front, hors client généré. | `angular`, `angular/architecture`, `angular/donnees-http`, `angular/revue`, `orchestrateur-c7e`, `orchestrateur-c7e/meso-contrats` |

### SC2 : Erreurs RFC 9457 (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SC2.INV-1** | toute réponse 4xx ou 5xx du back est en `application/problem+json`, avec `code` et `traceId`. Contrôle : tests d'API sur un cas de chaque statut. | `java`, `java/api-rest`, `orchestrateur-c7e` |
| **SC2.INV-2** | le front ne fonde aucune décision sur `title` ou `detail`. Il décide sur `status` et `code`. Contrôle : revue et tests du gestionnaire d'erreurs. | `angular`, `angular/donnees-http`, `java/tests`, `orchestrateur-c7e/meso-contrats` |
| **SC2.INV-3** | une erreur 500 ne révèle ni trace de pile, ni requête SQL, ni nom de classe. Contrôle : test d'API provoquant une exception non gérée. | `java/api-rest`, `orchestrateur-c7e/meso-contrats` |

### SC3 : Formats de données et pagination (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SC3.INV-1** | aucune date-heure ne circule sans fuseau. Contrôle : schéma du contrat (`format: date-time`) et tests de sérialisation. | `java/api-rest`, `java/persistance`, `orchestrateur-c7e/meso-contrats` |
| **SC3.INV-2** | aucun montant n'est représenté en virgule flottante, ni en JSON, ni en Java, ni en base. Contrôle : revue du contrat et recherche de `double`, `float` sur les champs monétaires. | `angular`, `angular/donnees-http`, `java/langage`, `java/persistance`, `java/revue`, `orchestrateur-c7e/meso-contrats` |
| **SC3.INV-3** | toute liste potentiellement non bornée est paginée, avec une taille maximale imposée par le back. Contrôle : revue des endpoints de collection. | `agent-tdd-jira/variantes`, `java`, `java/api-rest`, `orchestrateur-c7e`, `orchestrateur-c7e/meso-contrats` |

### SC4 : Sécurité de la frontière (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SC4.INV-1** | aucun secret ni jeton dans le code du front, dans une URL ou dans un journal. Contrôle : recherche de motifs de secrets et revue de la configuration de journalisation. | `agent-tdd-jira/variantes`, `angular`, `angular/donnees-http`, `angular/routage-securite`, `java`, `java/securite`, `orchestrateur-c7e/meso-contrats`, `socle-acceptable`, `sonarqube/triage`, `sonarqube/correction` |
| **SC4.INV-2** | chaque endpoint non public est protégé par une règle d'autorisation côté back. Contrôle : test d'accès anonyme refusé sur chaque endpoint protégé. | `agent-tdd-jira/variantes`, `angular/routage-securite`, `java/securite`, `orchestrateur-c7e` |
| **SC4.INV-3** | CORS n'autorise jamais `*` avec identifiants. Contrôle : revue de la configuration CORS par environnement. | `analyse-projet/rapport`, `java/securite`, `sonarqube/triage` |

### SC5 : Traçabilité (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SC5.INV-1** | toute erreur 5xx est journalisée côté back avec son `traceId`, et le même `traceId` est renvoyé au front. Contrôle : test d'API et vérification du journal capturé. | `orchestrateur-c7e/meso-contrats` |

### SC6 : Accessibilité et messages (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SC6.INV-1** | chaque erreur de validation renvoyée par le back est rattachée au champ correspondant dans le formulaire du front. Contrôle : test de composant avec une réponse 400 simulée. | `angular`, `angular/formulaires`, `angular/tests`, `angular/revue`, `java/tests` |
| **SC6.INV-2** | aucune information n'est transmise par la couleur seule. Contrôle : revue RGAA (critère 3.1) et tests automatisés d'accessibilité. | `angular/accessibilite`, `angular/revue`, `orchestrateur-c7e/meso-contrats` |

### SC7 : Événements temps réel vers le front (WebSocket STOMP) ; SSE et messages entre services réservés (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SC7.INV-1** | tout canal temps réel figure au contrat AsyncAPI du dépôt, avec son instantané REST ; aucun autre canal asynchrone n'est introduit sans être signalé comme écart au socle. Contrôle : test qui compare les destinations publiées par l'application au contrat. | `orchestrateur-c7e`, `orchestrateur-c7e/referentiel` |
| **SC7.INV-2** | chaque événement suit l'enveloppe CloudEvents du socle : `time` avec fuseau, `sequence` croissante par canal, `traceparent`, `data` conforme au schéma du contrat. Contrôle : test de sérialisation et validation contre le contrat. | `orchestrateur-c7e/referentiel` |
| **SC7.INV-3** | un événement n'est publié qu'après la validation de la transaction qui l'a produit. Contrôle : test d'intégration où la transaction est annulée et aucun message n'est reçu. | `orchestrateur-c7e`, `orchestrateur-c7e/meso-contrats`, `orchestrateur-c7e/referentiel` |
| **SC7.INV-4** | le client reste juste après une déconnexion, un doublon ou un trou : abonnement avant l'instantané, événements de séquence inférieure ou égale à l'`ETag` ignorés, instantané relu à chaque trou ou reconnexion. Contrôle : test du service client avec déconnexion, doublon et trou simulés. | `orchestrateur-c7e`, `orchestrateur-c7e/referentiel` |
| **SC7.INV-5** | aucun jeton dans l'URL de connexion ; chaque abonnement vérifie le droit de lecture de la ressource ; origines explicites. Contrôle : test d'abonnement refusé (`ERROR` avec un Problem Details 403) et test de connexion depuis une origine non autorisée. | `orchestrateur-c7e`, `orchestrateur-c7e/referentiel` |
| **SC7.INV-6** | toute mise à jour reçue en temps réel est annoncée par une région `aria-live="polite"`, sans déplacer le focus. Contrôle : test de composant et revue RGAA (critère 7.5). | `orchestrateur-c7e/referentiel` |

## socle-observation 1.5.0

Socle d'observation : l'enveloppe commune des observations, propositions, décisions et écarts qu'un système de second ordre du dépôt rend observables aux autres, au sens du troisième ordre (EVOLUTION.md, section 10) ; schéma fermé, journal en ajout seul et chaîné, minimisation, correspondances avec les formats existants. Point d'entrée : [`specs/socle-observation/SKILL.md`](specs/socle-observation/SKILL.md).

### SO1 : Enveloppe : schéma fermé, ordres et niveaux (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SO1.INV-1** | une observation qui sort d'un système le fait dans une enveloppe `socle-observation.enveloppe/1`, au schéma fermé ; un champ inconnu, une valeur hors liste ou un champ requis absent la fait refuser, et rien n'est écrit. Contrôle : test de l'export du système, sur des enveloppes mal formées. | `generateur-skill-ticket/observation`, `observatoire/releve`, `orchestrateur-c7e/observation` |
| **SO1.INV-2** | chaque enveloppe déclare son ordre et son niveau selon la table de la section 3.2 : le niveau `N1` avec l'ordre `OC1`, les niveaux `N2` et `N3` avec l'ordre `OC2` ; aucun niveau ne dépasse `N3`, et aucun système n'émet l'ordre `OC3`. Contrôle : test de l'export, sur chaque type d'enregistrement source. | `generateur-skill-ticket/observation`, `orchestrateur-c7e/observation` |

### SO2 : Chaînage : journal en ajout seul (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SO2.INV-1** | un journal d'enveloppes est en ajout seul : chaque ligne porte son numéro, consécutif, sa date en UTC, jamais antérieure à la précédente, et l'empreinte de la ligne précédente sous sa forme canonique ; une ligne réécrite, insérée ou supprimée se relève, et un journal rompu refuse tout ajout. Contrôle : test de l'export sur un journal altéré à la main. | `generateur-skill-ticket/observation`, `observatoire/releve`, `orchestrateur-c7e/observation` |

### SO3 : Minimisation : ce qui peut sortir d'une instance (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SO3.INV-1** | aucune enveloppe ne porte de texte libre, ni code, ni texte de ticket, ni commentaire, ni secret : seulement un motif en minuscules et tirets, des valeurs de listes fermées, des numéros, des mesures entières sous un nom que définit une correspondance, des identifiants définis par une spécification du dépôt et des empreintes. Contrôle : test de l'export, qui confronte chaque enveloppe produite à cette liste. | `generateur-skill-ticket/observation`, `orchestrateur-c7e/observation`, `socle-acceptable` |
| **SO3.INV-2** | aucune enveloppe ne nomme une personne, un client ou un projet : l'instance se désigne par l'empreinte de son sel, le sujet par un rôle, et toute référence propre à l'instance par son empreinte salée ; le sel ne sort jamais. Contrôle : test de l'export sur des sources qui portent noms, clés et chemins. | `generateur-skill-ticket/observation`, `orchestrateur-c7e/observation` |

### SO4 : Correspondances avec les formats du générateur, de l'orchestrateur et du binôme (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SO4.INV-1** | une correspondance traduit un format source sans le modifier : il garde ses champs, sa version et son emplacement, et chaque enveloppe désigne sans ambiguïté l'enregistrement dont elle provient, par son format, son numéro et, pour un format qui tient plusieurs journaux dans une instance, son journal. Contrôle : test de l'export, qui compare les sources avant et après, sur une instance à deux journaux du même format. | `generateur-skill-ticket/observation`, `orchestrateur-c7e/observation` |
| **SO4.INV-2** | la même entrée source, avec le même sel d'instance, donne la même enveloppe, octet pour octet. Contrôle : test de l'export rejoué deux fois sur les exemples du système. | `generateur-skill-ticket/observation`, `orchestrateur-c7e/observation` |

## sonarqube 1.1.0

Expert SonarQube Server 2026.x : configurer l'analyse et la CI, examiner le code local avant GitLab selon les règles du profil, trier, corriger ou planifier, gouverner la qualité, pour des projets Java et Angular sur GitLab. Point d'entrée : [`specs/sonarqube/SKILL.md`](specs/sonarqube/SKILL.md).

### D1 : Cadrage, accès et sécurité du jeton (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D1.INV-1** | la mission, le périmètre (projets, branche ou merge request) et les droits attendus sont explicites avant toute action. | `cadrage-acces` |
| **D1.INV-2** | le jeton n'est jamais affiché, journalisé, versionné, ni placé dans une URL ou un argument de commande visible ; il est lu depuis la variable `SONAR_TOKEN`. | `cadrage-acces`, `examen-local`, `pilotage` |
| **D1.INV-3** | toute écriture vers SonarQube est proposée avec l'appel exact et n'est appliquée qu'après validation explicite. | `cadrage-acces`, `examen-local`, `pilotage`, `triage`, `correction`, `gouvernance` |
| **D1.INV-4** | la version, l'édition et le mode de l'instance sont relevés avant toute interprétation, et aucune fonction absente de l'instance n'est proposée. | `cadrage-acces`, `pilotage`, `triage` |
| **D1.INV-5** | les modes de connexion employés sont retenus au cadrage parmi ceux du module `cadrage-acces` ; chacun reçoit le jeton par une variable d'environnement et ne sert qu'aux usages que ce module lui attribue. | `cadrage-acces`, `pilotage` |

### D2 : Configuration de l'analyse et de la CI (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | le code généré, les dépendances et les artefacts de build sont exclus de l'analyse. | `configuration-analyse`, `triage` |
| **D2.INV-2** | la couverture des tests est importée pour le back (rapport XML JaCoCo) et pour le front (rapport LCOV) ; une analyse sans couverture est signalée. | `configuration-analyse`, `examen-local`, `pilotage` |
| **D2.INV-3** | le pipeline analyse les merge requests et la branche principale, avec l'historique Git complet, et attend le résultat du quality gate. | `configuration-analyse` |
| **D2.INV-4** | les paramètres d'analyse sont versionnés dans le dépôt ; le jeton utilisé par la CI n'est jamais dans le dépôt et n'est fourni que par une variable masquée de la CI. | `configuration-analyse` |

### D3 : Triage et interprétation (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | chaque issue marquée faux positif ou acceptée porte un commentaire de justification dans SonarQube. | `triage` |
| **D3.INV-2** | l'expert ne modifie jamais une gravité ni un statut pour faire passer le quality gate. | `triage` |
| **D3.INV-3** | une revue de sécurité (Security Hotspot ou Security Issue) n'est jamais close sans décision humaine enregistrée. | `triage` |
| **D3.INV-4** | le triage suit l'ordre : nouveau code d'abord, puis sécurité, fiabilité, maintenabilité, puis gravité décroissante. | `examen-local`, `triage` |

### D4 : Correction directe ou plan pour un expert (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D4.INV-1** | une correction directe ne vise qu'un constat localisé, à correction déterministe, couvert par un test existant ou ajouté ; sinon, l'expert produit un plan. | `correction` |
| **D4.INV-2** | une correction directe respecte les invariants de l'expert concerné et ceux du socle. | `correction` |
| **D4.INV-3** | aucun `NOSONAR` ni `@SuppressWarnings` sans commentaire qui cite la règle et la raison ; le triage dans SonarQube est préféré. | `correction` |
| **D4.INV-4** | une correction est vérifiée par le build, les tests, puis la disparition du constat à l'analyse suivante. | `correction` |

### D5 : Gouvernance de la qualité (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D5.INV-1** | le quality gate et les profils intégrés (« Sonar way ») ne sont jamais modifiés ; les versions propres au projet en dérivent. | `gouvernance` |
| **D5.INV-2** | les conditions du quality gate portent sur le nouveau code ; une condition sur le code global est une décision explicite et justifiée. | `gouvernance` |
| **D5.INV-3** | chaque changement de gouvernance est inscrit au journal de gouvernance du dépôt, avec l'avant, l'après, la raison et la validation. | `gouvernance` |
| **D5.INV-4** | le quality gate n'est jamais relâché pour faire passer une analyse ; un relâchement est une décision séparée, justifiée et journalisée. | `gouvernance` |

### D6 : Rapports (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D6.INV-1** | chaque rapport indique l'instance (version, édition), le projet, la branche ou merge request, la date de l'analyse, l'état du quality gate et les appels d'API utilisés. | `pilotage`, `rapport` |
| **D6.INV-2** | chaque chiffre vient d'une réponse de l'API, jamais d'une estimation. | `examen-local`, `pilotage`, `rapport` |

### D7 : Serveur MCP et agents Sonar (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D8 : Rapports de conformité (WCAG, OWASP, CRA) (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D9 : Examen local avant GitLab (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D9.INV-1** | chaque constat de l'examen local porte son moteur (analyse éphémère, moteur SonarLint, relecture) ; un constat de relecture n'est jamais présenté ni compté comme une issue SonarQube. | `examen-local`, `pilotage`, `rapport` |
| **D9.INV-2** | une analyse éphémère s'exécute sous une branche de travail préfixée `local-`, jamais sous la branche principale, la branche cible ni une merge request ; l'analyse et la suppression de cette branche forment un seul lot validé, et la suppression est vérifiée, que l'analyse réussisse ou non. | `cadrage-acces`, `examen-local`, `pilotage` |
| **D9.INV-3** | le périmètre est le diff entre `HEAD` et la base de fusion avec la branche cible lue sur le dépôt distant ; les modifications non commitées sont déclarées, jamais mêlées en silence. | `examen-local`, `pilotage` |
| **D9.INV-4** | seules les règles actives du ou des profils qualité du projet sur l'instance sont appliquées et citées, lues à l'examen ou depuis un cache dont la date de mise à jour du profil a été vérifiée. | `examen-local`, `pilotage` |
| **D9.INV-5** | avant le lancement, la fiche indique pour chaque moteur retenu où part le code, et le développeur l'a confirmée. | `examen-local` |
| **D9.INV-6** | l'examen local ne pousse rien, ne commente aucune issue et ne change aucun statut ; ses constats passent par le triage et la correction. | `examen-local` |
| **D9.INV-7** | une analyse éphémère est précédée des tests du projet, sauf refus annoncé dans le lot ; un test en échec n'empêche pas l'analyse ; tests et couverture sont lus sur la branche de travail et rapportés, et une couverture absente ou un test en échec est signalé, jamais tu. | `examen-local`, `pilotage` |

### D10 : Interface de pilotage locale (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D10.INV-1** | l'interface de pilotage n'écoute que sur la boucle locale et ne sert qu'une requête portant la clé de session du lancement et un en-tête `Host` local. | `pilotage` |
| **D10.INV-2** | le jeton ne quitte jamais le processus du pilote et celui du scanner qu'il lance : ni réponse au navigateur, ni journal, ni message d'erreur, ni sortie du scanner ne le contient ; le navigateur n'en connaît que la présence. | `pilotage` |
| **D10.INV-3** | toute écriture vers SonarQube déclenchée par l'interface vient d'un lot proposé avec les appels exacts, puis validé ; un lot inconnu, expiré ou déjà employé n'écrit rien. | `pilotage` |
| **D10.INV-4** | l'interface applique par programme les invariants de l'examen local qu'elle pilote : branche `local-…` imposée et commande de scanner sans branche, MR ni jeton, suppression tentée en toute issue puis vérifiée, constats filtrés au périmètre et étiquetés par moteur. | `pilotage` |

## tension-dashboard-gitlab-agent 2.2.0

Agent de surveillance des fichiers sous tension, tableau de bord et assistant GitLab à garde-fous. Point d'entrée : [`specs/tension-dashboard-gitlab-agent/SKILL.md`](specs/tension-dashboard-gitlab-agent/SKILL.md).

### D1 : Tension par fichier (Δ, chevauchement, conflit) (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D1.INV-1** | un fichier modifié d'un seul côté est `mono_cote`, quel que soit son Δ, sauf `generated` (`exclu`). | `tension` |
| **D1.INV-2** | sans chevauchement ni conflit, un fichier n'est jamais `critique`, sauf `binary` ou `sensitive`. | `tension` |
| **D1.INV-3** | un fichier `binary` ou `sensitive` modifié des deux côtés est toujours `critique`. | `tension`, `agents-paralleles-gitlab/distribution` |

### D2 : Machine d'états et bornes de configuration (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | toute transition absente de la table du module `etats` est refusée et journalisée. | `etats` |
| **D2.INV-2** | un fichier `gelé` ne change d'état que par ARBITRAGE ou REMIND. | `etats` |
| **D2.INV-3** | une valeur de configuration hors bornes empêche le démarrage. | `etats`, `effecteur-gitlab` |

### D3 : Messagerie signée et tableau de bord en lecture seule (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | un message dont la signature, l'horodatage ou le nonce est invalide n'a aucun effet. | `messagerie` |
| **D3.INV-2** | aucun secret n'apparaît dans les messages, les journaux ou le dépôt. | `messagerie` |
| **D3.INV-3** | le tableau de bord n'expose aucune route d'écriture. | `messagerie`, `dashboard` |

### D4 : Effecteur GitLab à garde-fous (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D4.INV-1** | aucun commit déjà présent sur `origin` n'est réécrit. | `effecteur-gitlab`, `agents-paralleles-gitlab/hooks` |
| **D4.INV-2** | aucun fichier `gelé` n'est modifié par l'effecteur, ni dans l'arbre, ni dans les commits rejoués. | `etats`, `effecteur-gitlab` |
| **D4.INV-3** | la procédure 2.x n'emploie ni `--force` ni `--force-with-lease`. | `effecteur-gitlab`, `agents-paralleles-gitlab/hooks` |
| **D4.INV-4** | sans `--execute`, l'effecteur n'écrit rien. | `effecteur-gitlab` |

### D5 : Verdict de fenêtre et clause de second ordre (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D5.INV-1** | chaque verdict affiché et chaque action du développeur sont journalisés. | `verdict-journal`, `messagerie` |

### D6 : Journal en ajout seul et rejeu déterministe (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D6.INV-1** | la table `journal` n'accepte ni UPDATE ni DELETE. | `verdict-journal` |
| **D6.INV-2** | le rejeu d'un même journal produit exactement le même état final. | `verdict-journal` |

### D7 : Arbitrage humain par client signé (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D7.INV-1** | aucun arbitrage n'est appliqué sans événement `DEV_ACTION` signé correspondant. | `etats`, `messagerie` |

### D8 : Communication directe inter-agents (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D9 : Régulation de second niveau (méta-niveau) (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D10 : Rapport de couplage et gestion des interblocages (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.
