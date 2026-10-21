# Glossaire des invariants

Ce fichier détaille chaque invariant de chaque spécification du dépôt : son identifiant, la dimension qui le porte, son énoncé, et où il est repris. Il est généré par `node tools/glossaire.mjs` à partir des points d'entrée et des modules de `specs/`, archives exclues. Ne pas le modifier à la main : `node tools/verifier.mjs` signale un glossaire qui n'est plus à jour.

## Lire un identifiant

| Forme | Désigne | Exemple |
|---|---|---|
| `Dn` | dimension n d'une spécification : un axe, avec ses invariants et ses tests | `D4` de `tension-dashboard-gitlab-agent` : effecteur GitLab à garde-fous |
| `Dn.INV-k` | invariant k de la dimension n : une propriété qui doit toujours tenir, vérifiée par au moins un test ou un contrôle | `D4.INV-3` : la procédure n'emploie ni `--force` ni `--force-with-lease` |
| `SCn`, `SCn.INV-k` | dimension et invariant du socle back-front, inclus à l'identique dans plusieurs skills | `SC1.INV-2` : aucun changement cassant dans une version d'API publiée |
| `<spécification>:Dn.INV-k` | invariant d'une autre spécification, cité avec le nom de celle-ci | `java:D4.INV-2` |
| `En` | point d'extension : emplacement réservé, inerte, pour une dimension future | `E2` |

Un identifiant n'a de sens qu'avec sa spécification : `D6.INV-3` existe dans plusieurs d'entre elles. Statut d'une dimension : `active` (invariants en vigueur et vérifiés), `reserved` (place posée, aucun invariant en vigueur), `superseded` (remplacée). Un invariant ne s'affaiblit jamais ; il peut être remplacé par un invariant plus fort, signalé dans le journal de révision de sa spécification (`EVOLUTION.md`, section 4).

La colonne « Repris dans » cite les modules de la spécification qui reprennent l'invariant, puis, sous la forme `skill/module`, les autres spécifications qui le citent ou qui incluent le socle.

## Sommaire

| Spécification | Version | Dimensions actives | Dimensions réservées | Invariants |
|---|---|---|---|---|
| [`agent-tdd-jira`](#agent-tdd-jira-130) | 1.3.0 | 9 | 1 | 43 |
| [`agent2test`](#agent2test-100) | 1.0.0 | 18 | 2 | 90 |
| [`agents-paralleles-gitlab`](#agents-paralleles-gitlab-101) | 1.0.1 | 5 | 2 | 20 |
| [`analyse-projet`](#analyse-projet-102) | 1.0.2 | 5 | 1 | 16 |
| [`angular`](#angular-101) | 1.0.1 | 8 | 2 | 30 |
| [`java`](#java-111) | 1.1.1 | 7 | 1 | 29 |
| [`socle-back-front`](#socle-back-front-101) | 1.0.1 | 6 | 1 | 15 |
| [`sonarqube`](#sonarqube-102) | 1.0.2 | 6 | 2 | 22 |
| [`tension-dashboard-gitlab-agent`](#tension-dashboard-gitlab-agent-220) | 2.2.0 | 7 | 3 | 17 |

## agent-tdd-jira 1.3.0

Agent de développement TDD : demande Jira en MHTML, analyse avec commentaires, US et critères d'acceptation numérotés, scénarios Gherkin par critère, variantes back Java et front Angular, cycle rouge, vert, remanié scénario par scénario, traçabilité ; binôme avec Agent2Test, verdict d'acceptation par critère ; mode parallèle dans un worktree géré par agents-paralleles-gitlab. Point d'entrée : [`specs/agent-tdd-jira/SKILL.md`](specs/agent-tdd-jira/SKILL.md).

### D1 : Ingestion d'une demande Jira en MHTML (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D1.INV-1** | le fichier MHTML n'est jamais modifié ; l'extraction travaille en lecture seule et enregistre l'empreinte sha256 de la source. | `ingestion-jira`, `parallele` |
| **D1.INV-2** | le résumé de l'extraction (clé, titre, description, nombre de commentaires, pièces, limites) est confirmé par le développeur avant toute analyse. | `ingestion-jira` |
| **D1.INV-3** | toute partie non extraite ou incertaine (commentaires repliés, pièces absentes, page non reconnue) est déclarée comme limite. | `ingestion-jira` |

### D2 : Analyse et scénarios Gherkin (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | chaque scénario cite sa provenance : passage de la description, commentaire (auteur, date) ou réponse du développeur. | `analyse-demande` |
| **D2.INV-2** | une contradiction ou une ambiguïté entre la description et les commentaires devient une question ; elle n'est jamais tranchée par l'agent. | `us-criteres`, `analyse-demande` |
| **D2.INV-3** | chaque scénario est écrit en Gherkin français, porte une étiquette unique `@<CLÉ>-Snn` et au moins une étape `Alors` vérifiable. | `us-criteres`, `analyse-demande` |
| **D2.INV-4** | un scénario que la demande n'énonce pas explicitement (cas d'erreur, limite) porte l'étiquette `@propose` et n'est utilisé qu'après validation. | `analyse-demande` |
| **D2.INV-5** | les scénarios sont validés par le développeur avant l'étude des variantes. | `analyse-demande` |

### D3 : Analyse d'impact back et front (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | l'analyse d'impact ne modifie rien et cite le fichier de chaque élément impacté. | `impact`, `parallele` |
| **D3.INV-2** | l'impact sur le contrat d'API est qualifié pour chaque scénario : aucun, compatible ou cassant. | `impact` |

### D4 : Variantes de réalisation back et front (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D4.INV-1** | pour chaque scénario, l'agent propose des variantes back et front (au moins deux par couche concernée, ou une seule avec la justification de son unicité), ou justifie qu'une couche n'est pas concernée. | `variantes` |
| **D4.INV-2** | chaque variante indique les invariants des référentiels et du socle qu'elle engage ; une variante qui en viole un est signalée et n'est jamais recommandée. | `variantes` |
| **D4.INV-3** | le choix du développeur est consigné avant toute écriture de code. | `variantes` |
| **D4.INV-4** | la combinaison back et front retenue est compatible avec le contrat publié (SC1.INV-2). | `variantes` |

### D5 : Cycle TDD scénario par scénario (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D5.INV-1** | aucun code de production n'est écrit pour un scénario avant qu'un test étiqueté de ce scénario ait échoué pour la raison attendue. | `cycle-tdd` |
| **D5.INV-2** | la phase verte se limite au code nécessaire pour faire passer le test, et la suite de tests du module concerné reste verte. | `cycle-tdd` |
| **D5.INV-3** | le remaniement ne change pas le comportement, garde toutes les suites vertes et applique les invariants des référentiels. | `cycle-tdd` |
| **D5.INV-4** | un seul scénario est réalisé à la fois, et le suivant ne commence qu'après acceptation du précédent. | `cycle-tdd`, `parallele` |
| **D5.INV-5** | quand un scénario touche le contrat d'API, l'ordre est : contrat, puis back, puis front. | `impact`, `cycle-tdd`, `agents-paralleles-gitlab/distribution` |
| **D5.INV-6** | aucune dépendance nouvelle n'est ajoutée sans validation. | `cycle-tdd`, `agents-paralleles-gitlab/distribution` |

### D6 : Traçabilité et rapport (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D6.INV-1** | la matrice relie chaque exigence de la demande à au moins un scénario, chaque scénario validé à au moins un test et à un commit, ou à un statut explicite « non réalisé » avec sa raison. | `tracabilite` |
| **D6.INV-2** | chaque test écrit par l'agent porte l'étiquette de son scénario. | `cycle-tdd`, `tracabilite` |
| **D6.INV-3** | l'agent n'écrit jamais dans Jira ; il fournit un projet de commentaire que le développeur publie lui-même. | `tracabilite`, `parallele` |
| **D6.INV-4** | le rapport final liste les écarts à la demande, les questions restées ouvertes et le résultat des suites de tests back et front. | `tracabilite` |

### D7 : Binôme avec Agent2Test (tests de bout en bout et d'acceptation) (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D7.INV-1** | le plan remis à Agent2Test est `us.md` et le fichier Gherkin validés à V2 et commités, tels quels ; l'agent n'écrit ni parcours ni fichier d'Agent2Test. | `binome-agent2test`, `agent2test/plan` |
| **D7.INV-2** | chaque défaut applicatif confirmé en CP-3 par Agent2Test rouvre le scénario qu'il vise en cycle TDD : un test rouge, étiqueté avec ce scénario, reproduit le défaut avant tout code de production. | `binome-agent2test` |
| **D7.INV-3** | la matrice et le rapport final donnent, pour chaque critère d'acceptation, le verdict d'Agent2Test valable pour le plan et le code courants (conforme, non conforme, non vérifié avec son motif), ou « non joué » avec sa raison. | `tracabilite`, `binome-agent2test`, `agent2test/journal` |
| **D7.INV-4** | l'agent ne démarre, n'arrête ni ne déploie l'application et ne lance aucun batch ; il ne réécrit ni ne conteste lui-même un verdict d'Agent2Test : un désaccord est remonté au développeur. | `binome-agent2test` |
| **D7.INV-5** | un scénario qui exige un rôle de l'application porte `@role-<nom>`, directement ou par sa fonctionnalité ; un batch Java, `@batch-<nom>` ; un redémarrage de l'application ou une écriture directe en base, `@redemarrage` ou `@ecriture-base`. | `analyse-demande`, `binome-agent2test` |

### D8 : Connecteur Jira (API ou MCP) à la place du MHTML (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D9 : Travail dans un worktree géré, en parallèle d'autres demandes (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D9.INV-1** | en mode parallèle, l'agent n'écrit que dans le worktree de sa demande ; ses fichiers de travail (demande enregistrée, `demande.json`, images, script d'extraction, `impact.txt`, `rapport.md`) vont dans `travail/`. | `parallele` |
| **D9.INV-2** | en mode parallèle, l'agent ne pousse pas, ne fusionne pas, ne rebase pas et ne change pas de branche ; il n'emploie ni `--no-verify`, ni `--force`, ni `--force-with-lease`, ni `git config`, ni `git -c`, ni `reset --hard`, ni `stash drop`, ni `stash clear`, ni `branch -D`, ni `git worktree`. | `parallele`, `binome-agent2test`, `agents-paralleles-gitlab/hooks` |
| **D9.INV-3** | en mode parallèle, chaque commit commence par `<CLÉ> Snn : ` pour un scénario, ou `<CLÉ> : ` hors scénario. | `parallele`, `binome-agent2test` |
| **D9.INV-4** | un refus d'un garde-fou du kit arrête l'action en cours ; l'agent le cite au développeur et ne le contourne jamais. | `parallele`, `agents-paralleles-gitlab` |
| **D9.INV-5** | à l'étape d'impact, l'agent écrit les chemins impactés dans `travail/<CLÉ>/impact.txt`, un chemin relatif par ligne, et signale dans la fiche ceux qui relèvent d'un point chaud. | `parallele`, `agents-paralleles-gitlab/orchestration`, `agents-paralleles-gitlab/distribution` |
| **D9.INV-6** | le skill partagé est vérifié avec la table d'intégrité de la transmission et n'est jamais réécrit. | `parallele` |
| **D9.INV-7** | après une synchronisation annoncée par le développeur, l'agent relance les suites back et front avant le scénario suivant et signale toute régression. | `parallele`, `agents-paralleles-gitlab/distribution` |

### D10 : US et critères d'acceptation numérotés (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D10.INV-1** | chaque US porte un identifiant stable `<CLÉ>-USnn` et chaque critère d'acceptation un identifiant stable `<CLÉ>-CAnn`, attribués une fois pour toutes et jamais renumérotés ; un critère appartient à une seule US. | `us-criteres` |
| **D10.INV-2** | chaque US et chaque critère d'acceptation cite sa provenance (champ du ticket, passage de la description, commentaire avec auteur et date) ; ce que le ticket n'énonce pas est marqué « proposé » et n'est utilisé qu'après validation à V2. | `us-criteres`, `analyse-demande` |
| **D10.INV-3** | chaque critère d'acceptation énonce un résultat observable et vérifiable ; un critère ambigu, invérifiable ou contredit par un commentaire devient une question, jamais une interprétation de l'agent. | `us-criteres` |
| **D10.INV-4** | chaque exigence de la demande est rattachée à au moins un critère d'acceptation, ou à une question. | `us-criteres`, `analyse-demande` |
| **D10.INV-5** | chaque critère d'acceptation validé est décliné en au moins un scénario Gherkin, et chaque scénario porte l'étiquette `@<CLÉ>-CAnn` d'au moins un critère qu'il illustre. | `us-criteres`, `analyse-demande`, `agent2test/plan` |
| **D10.INV-6** | un critère d'acceptation n'entre en réalisation (choix des variantes V3, cycle TDD V4) que s'il est validé, décliné en scénarios validés, et qu'aucune question ouverte ne le concerne. | `us-criteres`, `variantes` |
| **D10.INV-7** | la matrice de traçabilité relie chaque US à ses critères d'acceptation, et chaque critère à ses scénarios, tests et commits, ou à un statut « non réalisé » avec sa raison ; le rapport final donne l'état de chaque critère. | `us-criteres`, `tracabilite` |

## agent2test 1.0.0

Agent2Test : système multi-agents qui choisit, prépare, exécute et journalise les tests essentiels d'une application Angular pour une demande, en pilotant Playwright comme une bibliothèque depuis Node, dans un projet séparé de l'application ; plan importé d'agent-tdd-jira, verdict par critère d'acceptation, points de contrôle humains, cybernétique de premier et de second ordre, exécution locale. Point d'entrée : [`specs/agent2test/SKILL.md`](specs/agent2test/SKILL.md).

### D1 : Noyau 7E, bus et constitution (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D1.INV-1** | chaque cycle déroule les sept phases E1 à E7, dans l'ordre, à chacune des quatre échelles (Système, Campagne, Scénario, Étape) ; l'E3 d'une échelle est la suite des cycles complets de l'échelle inférieure, et chaque ligne de journal porte son échelle et sa phase. | `noyau`, `orchestrateur`, `journal`, `observateur` |
| **D1.INV-2** | les agents ne communiquent que par le bus ; le bus refuse tout appel ou événement absent du contrat déclaré de l'agent, et aucun agent n'importe un autre agent. | `noyau` |
| **D1.INV-3** | toute sortie du moteur est validée contre un schéma fermé et des contrôles nommés avant d'être consommée ; une sortie non conforme n'est jamais utilisée. | `noyau`, `preparateur` |
| **D1.INV-4** | au démarrage, une constitution dont l'empreinte SHA-256 diffère de celle inscrite au grand livre empêche le démarrage, avec un message explicite. | `noyau` |
| **D1.INV-5** | toute demande étrangère aux tests (modifier le code, déployer, administrer) est refusée avec le motif « hors périmètre ». | `noyau`, `plan` |
| **D1.INV-6** | aucune action d'agent n'écrit la constitution, le code, les schémas du journal ou du grand livre, ni la configuration humaine. | `noyau`, `referentiel`, `exploitation` |

### D2 : Données isolées par agent (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | chaque agent propriétaire a son schéma et son rôle PostgreSQL ; une écriture d'un agent dans le schéma d'un autre est refusée par la base elle-même. | `donnees` |
| **D2.INV-2** | seuls des contrats nommés s'exécutent ; une requête SQL libre est refusée. | `donnees` |
| **D2.INV-3** | la base de l'application n'est jamais accédée, sauf par l'oracle en lecture seule, activé explicitement dans la configuration humaine et limité à des contrats de lecture nommés. | `donnees`, `exploitation` |
| **D2.INV-4** | les preuves sont purgées au-delà de leur durée de conservation ; le journal garde leurs empreintes. | `donnees` |

### D3 : Plan canonique et demande (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | le système ne rédige ni ne corrige aucune US, aucun critère, aucun scénario ; un critère qu'aucun scénario ne couvre est marqué « trou de couverture », et aucun scénario n'est créé pour lui. | `plan`, `agent-tdd-jira/binome-agent2test` |
| **D3.INV-2** | chaque US, critère et scénario a un identifiant canonique unique ; deux éléments de même identifiant bloquent l'import, et le message cite leurs deux emplacements. | `plan` |
| **D3.INV-3** | un scénario dont un prérequis sort du périmètre (redémarrage, écriture directe en base) est marqué « non automatisable » avec son motif ; un prérequis de batch Java devient un préalable confié au développeur (CP-5). | `plan` |
| **D3.INV-4** | le plan est versionné : réimporter des sources inchangées ne crée aucune version, une source modifiée en crée une nouvelle, et la précédente reste consultable. | `plan` |
| **D3.INV-5** | seul un scénario validé, qui illustre au moins un critère validé, est jouable ; un scénario proposé non validé, en attente d'une question, limité au back, ou qui exige un rôle que la session n'a pas, est « non jouable », avec son motif. | `plan`, `navigateur`, `agent-tdd-jira/binome-agent2test` |
| **D3.INV-6** | un critère cité par la demande et absent du plan est signalé avant la sélection. | `plan` |

### D4 : Navigateur, session et preuves (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D4.INV-1** | seul `navigateur` pilote Playwright ; aucun autre module n'ouvre de navigateur. | `navigateur` |
| **D4.INV-2** | le navigateur ne charge que les origines déclarées au profil ; une navigation vers une autre origine est bloquée avant chargement, et le journal indique l'origine visée. | `navigateur` |
| **D4.INV-3** | le système ne détient aucun identifiant SSO et ne saisit rien dans les pages du fournisseur SSO ; la session est un secret local (fichier hors dépôt, mode 0600), jamais journalisée ni transmise au moteur, et les traces conservées sont expurgées des en-têtes `Authorization`, `Cookie` et `Set-Cookie`. | `navigateur`, `journal`, `profil-recette` |
| **D4.INV-4** | seules les actions du jeu fermé s'exécutent ; aucun code produit par le moteur n'atteint la page, ni par script, ni par évaluation. | `navigateur` |
| **D4.INV-5** | une étape n'attend que des états, dans un délai borné ; aucune étape n'attend une durée fixe. | `navigateur` |
| **D4.INV-6** | une étape de mutation exécutée n'est jamais rejouée ; une étape `verifier`, ou une étape dont l'action n'a pas eu lieu, est retentée deux fois au plus, et un succès au réessai classe l'étape `INSTABILITE`, jamais « réussie ». | `navigateur`, `verdict` |
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
| **D9.INV-3** | avant le premier scénario, une sonde vérifie que l'application répond ; sinon, la campagne est refusée avec ce motif. | `orchestrateur` |
| **D9.INV-4** | une seule campagne s'exécute à la fois sur une application cible ; les autres attendent en file. | `orchestrateur` |
| **D9.INV-5** | l'arrêt d'urgence suspend la campagne au plus tard à la fin de l'étape en cours. | `orchestrateur` |
| **D9.INV-6** | après un redémarrage du processus, la campagne reprend au début du scénario interrompu, sans perte de journal. | `orchestrateur` |
| **D9.INV-7** | Agent2Test ne démarre, n'arrête ni ne déploie l'application, et ne lance aucun batch ; un scénario à préalable de batch attend en CP-5 que le développeur l'ait lancé et l'ait déclaré terminé. | `plan`, `orchestrateur`, `exploitation`, `agent-tdd-jira/binome-agent2test` |

### D10 : Journal et journal de tests (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D10.INV-1** | le journal est en ajout seul, imposé par les droits de la base, et chaîné par empreintes ; `verifierChaine` détecte une altération faite en base par un compte privilégié et nomme la première ligne rompue. | `journal` |
| **D10.INV-2** | le journal de tests d'une campagne est produit en Markdown, JSON, JUnit XML et HTML à partir de la même source, et sa matrice critères × verdicts couvre tous les critères de la demande, trous de couverture compris. | `journal` |
| **D10.INV-3** | tout contenu produit par le moteur est marqué comme tel dans le journal de tests, avec moteur, fiche et version. | `stratege`, `journal` |
| **D10.INV-4** | l'empreinte de fin de chaîne du journal de tests est celle du journal à la clôture de la campagne. | `journal` |

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
| **D15.INV-2** | le grand livre est en ajout seul et chaîné par empreintes ; il inscrit chaque version publiée de la constitution, chaque ratification, refus, suspension et retour arrière. | `referentiel` |
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
| **D18.INV-1** | sous une version de Node antérieure à 22, le kit refuse de démarrer avec un message explicite. | `exploitation` |
| **D18.INV-2** | le kit n'a que deux dépendances d'exécution, `playwright` et `pg`, épinglées par un fichier de verrouillage et installées par `npm ci` ; toutes ses dépendances et images sont sous licence open source. | `exploitation`, `accessibilite` |
| **D18.INV-3** | le PostgreSQL d'Agent2Test écoute sur le port 5433 et n'est jamais celui de l'application. | `exploitation` |
| **D18.INV-4** | seul le profil d'environnement `local` est accepté ; un profil `recette` ou `conteneur` est refusé tant que la dimension D20 est réservée. | `preparateur`, `exploitation` |

### D19 : Accessibilité des parcours (axe) (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D20 : Profil recette et conteneur (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

## agents-paralleles-gitlab 1.0.1

Plusieurs agents en parallèle sur un dépôt GitLab, une demande Jira par worktree : isolation, hooks communs, script agt, garde-fous GitLab, recette de 44 contrôles. Point d'entrée : [`specs/agents-paralleles-gitlab/SKILL.md`](specs/agents-paralleles-gitlab/SKILL.md).

### D1 : Isolation : une demande par worktree (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D1.INV-1** | une demande a un worktree nommé par sa clé Jira, sur une branche `<type>/<CLÉ>-<slug>` conforme aux conventions ; une même branche n'est jamais extraite dans deux worktrees. | `isolation`, `orchestration`, `recette` |
| **D1.INV-2** | la branche d'une demande est créée sans branche amont ; son premier push crée la branche distante du même nom. | `isolation`, `recette` |
| **D1.INV-3** | le point de retour `agent/<CLÉ>/start` est posé et le worktree verrouillé avant que l'agent commence. | `isolation`, `orchestration`, `recette` |
| **D1.INV-4** | `travail/`, `.skills/`, `*.mht` et `*.mhtml` sont exclus de tous les worktrees par l'exclusion commune (`.bare/info/exclude`), sans modifier le `.gitignore` du projet. | `isolation`, `distribution`, `recette` |

### D2 : Garde-fous locaux : hooks communs (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | aucun commit sur `main`, `master`, `develop`, `release/*`, en HEAD détachée, ni sur une branche dont la clé n'est pas celle du worktree. | `hooks`, `recette` |
| **D2.INV-2** | tout commit, hors commit de fusion, commence par `<CLÉ> Snn : ` ou `<CLÉ> : `, de sorte que `git log --grep='^<CLÉ> '` retrouve tous les commits de la demande. | `hooks`, `recette` |
| **D2.INV-3** | aucun fichier interdit n'est commité, même forcé dans l'index : `.env`, clés et certificats, `*.mht`, `*.mhtml`, `.skills/`, `travail/`. | `hooks`, `recette` |
| **D2.INV-4** | un worktree ne pousse que vers la branche de sa demande ou une branche `fix/tension-*`, et ne supprime aucune branche distante. | `hooks`, `recette` |
| **D2.INV-5** | aucun push ne réécrit une branche distante, avec ou sans `--force` ou `--force-with-lease`. | `hooks`, `recette`, `agent-tdd-jira/parallele` |

### D3 : Orchestration : script `agt` (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | `agt reset` ne réécrit aucun commit publié et crée une sauvegarde `backup/<CLÉ>-<horodatage>` avant toute écriture. | `orchestration`, `recette` |
| **D3.INV-2** | `agt sync` refuse un worktree non propre, rebase une branche jamais publiée et fusionne la base dans une branche publiée. | `orchestration`, `distribution`, `recette` |
| **D3.INV-3** | `agt done` ne supprime une branche que si elle est contenue dans la base distante, sauf `--abandon` explicite, et archive `travail/` avant de supprimer le worktree. | `orchestration`, `recette` |
| **D3.INV-4** | `agt ls` signale des hooks inactifs et toute URL de distant qui contient un identifiant ou un jeton. | `hooks`, `orchestration`, `gitlab`, `recette` |
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
| **D1.INV-1** | tout nouveau composant, directive ou pipe est autonome (standalone) ; aucun nouveau `NgModule`. | `architecture`, `tests`, `revue`, `analyse-projet/evaluation` |
| **D1.INV-2** | les dépendances respectent les couches : une fonctionnalité n'importe pas une autre fonctionnalité ; `ui` n'injecte aucun service de données ; `data-access` ne contient aucun composant. | `architecture`, `tests`, `analyse-projet/evaluation` |
| **D1.INV-3** | TypeScript en mode `strict` et templates en `strictTemplates`. | `architecture`, `tests`, `revue`, `analyse-projet/evaluation` |

### D2 : Composants à signaux (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | chaque composant est en `ChangeDetectionStrategy.OnPush`. | `composants`, `tests`, `revue`, `agent-tdd-jira/variantes`, `agent-tdd-jira/cycle-tdd`, `analyse-projet/evaluation` |
| **D2.INV-2** | les templates utilisent le flux de contrôle intégré (`@if`, `@for`, `@switch`) ; chaque `@for` a un `track` sur un identifiant stable. | `composants`, `tests`, `migration-angular22`, `analyse-projet/evaluation` |
| **D2.INV-3** | un nouveau composant déclare ses entrées et sorties avec `input()`, `output()` ou `model()`. | `composants`, `tests`, `analyse-projet/evaluation` |
| **D2.INV-4** | aucun abonnement manuel dans un composant sans `takeUntilDestroyed` ; la forme préférée est `toSignal` ou le pipe `async`. | `composants`, `tests`, `analyse-projet/evaluation` |
| **D2.INV-5** | `effect()` ne sert jamais à écrire dans un autre signal pour en dériver la valeur ; on utilise `computed` ou `linkedSignal`. | `composants`, `tests`, `revue`, `analyse-projet/evaluation` |

### D3 : Données HTTP conformes au socle (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | les endpoints du contrat ne sont appelés qu'au travers du client généré (application de SC1.INV-3). | `donnees-http`, `tests`, `revue`, `bff-node`, `agent-tdd-jira/variantes`, `agent-tdd-jira/cycle-tdd`, `analyse-projet/evaluation` |
| **D3.INV-2** | les erreurs HTTP sont converties en un seul point en `ApiProblem` ; les décisions se fondent sur `status` et `code`, jamais sur `title` ou `detail` (application de SC2.INV-2). | `donnees-http`, `tests`, `agent-tdd-jira/variantes`, `analyse-projet/evaluation` |
| **D3.INV-3** | aucun composant de la couche `ui` ne déclenche de requête HTTP. | `donnees-http`, `tests`, `analyse-projet/evaluation` |
| **D3.INV-4** | aucun calcul monétaire en virgule flottante côté front (application de SC3.INV-2). | `donnees-http`, `tests`, `revue`, `analyse-projet/evaluation` |

### D4 : Formulaires réactifs typés (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D4.INV-1** | tout nouveau formulaire est réactif et typé ; aucun `UntypedFormGroup` ni `any` dans son modèle. | `formulaires`, `tests`, `revue`, `analyse-projet/evaluation` |
| **D4.INV-2** | chaque erreur de validation renvoyée par le back est rattachée au contrôle correspondant (application de SC6.INV-1) ; une erreur sans contrôle correspondant est affichée dans le résumé d'erreurs. | `formulaires`, `tests`, `revue`, `analyse-projet/evaluation` |
| **D4.INV-3** | chaque champ a un libellé associé, et son message d'erreur lui est lié par `aria-describedby`. | `formulaires`, `tests`, `revue`, `analyse-projet/evaluation`, `analyse-projet/rapport` |

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
| **D6.INV-4** | tout message qui apparaît sans action de l'utilisateur sur l'élément concerné (chargement terminé, erreur, confirmation) est annoncé aux technologies d'assistance. | `donnees-http`, `accessibilite`, `tests`, `revue`, `agent-tdd-jira/variantes`, `agent-tdd-jira/cycle-tdd`, `analyse-projet/evaluation` |

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

## java 1.1.1

Expert Java 21, Spring Boot 3.5 et PostgreSQL : produire et relire du code conforme à des invariants vérifiables. Point d'entrée : [`specs/java/SKILL.md`](specs/java/SKILL.md).

### D1 : Architecture en couches par fonctionnalité (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D1.INV-1** | aucune classe des couches `domain` et `application` ne dépend de la couche `api` ni de `org.springframework.web`. | `architecture`, `api-rest`, `tests`, `revue`, `analyse-projet/evaluation` |
| **D1.INV-2** | aucune entité JPA n'est exposée par un contrôleur, ni en paramètre ni en retour. | `architecture`, `analyse-projet/evaluation` |
| **D1.INV-3** | l'injection se fait par constructeur ; aucun champ n'est annoté `@Autowired`. | `architecture`, `api-rest`, `agent-tdd-jira/cycle-tdd`, `analyse-projet/evaluation`, `sonarqube/triage`, `sonarqube/correction`, `sonarqube/rapport` |
| **D1.INV-4** | les fonctionnalités n'ont pas de dépendances cycliques entre elles. | `architecture`, `tests`, `revue`, `analyse-projet/evaluation` |

### D2 : Langage Java 21 (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | les DTO d'API sont des `record` immuables. | `langage`, `api-rest`, `tests`, `revue`, `agent-tdd-jira/cycle-tdd`, `analyse-projet/evaluation` |
| **D2.INV-2** | `Optional` n'est jamais un type de champ ni de paramètre ; il sert uniquement de type de retour. | `langage`, `tests`, `analyse-projet/evaluation`, `sonarqube/triage` |
| **D2.INV-3** | quand les threads virtuels sont activés, aucun bloc `synchronized` n'englobe une entrée-sortie bloquante. | `langage`, `tests`, `migration-boot4`, `analyse-projet/evaluation` |
| **D2.INV-4** | aucune exception n'est avalée : un `catch` traite, relance ou traduit, jamais ne se contente d'ignorer. | `langage`, `tests`, `revue`, `analyse-projet/evaluation`, `sonarqube/triage` |

### D3 : API REST conforme au socle (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | l'API implémentée correspond exactement au contrat OpenAPI (application de SC1.INV-1). | `api-rest`, `tests`, `revue`, `agent-tdd-jira/variantes`, `analyse-projet/evaluation` |
| **D3.INV-2** | toute entrée est validée par Bean Validation avant d'atteindre la couche `application`. | `api-rest`, `tests`, `agent-tdd-jira/variantes`, `analyse-projet/evaluation` |
| **D3.INV-3** | un seul `@RestControllerAdvice` produit les Problem Details, avec `code` et `traceId` (application de SC2.INV-1). | `api-rest`, `tests`, `agent-tdd-jira/cycle-tdd`, `analyse-projet/evaluation` |
| **D3.INV-4** | toute collection est paginée, avec une taille maximale imposée (application de SC3.INV-3). | `api-rest`, `tests`, `revue`, `agent-tdd-jira/variantes`, `analyse-projet/evaluation` |

### D4 : Persistance JPA, migrations Flyway ou Liquibase, PostgreSQL (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D4.INV-1** | le schéma n'évolue que par migrations versionnées (Flyway ou Liquibase) ; `spring.jpa.hibernate.ddl-auto=validate` ; une migration appliquée n'est jamais modifiée. | `persistance`, `tests`, `revue`, `analyse-projet/evaluation` |
| **D4.INV-2** | `spring.jpa.open-in-view=false`. | `architecture`, `persistance`, `tests`, `analyse-projet/evaluation`, `analyse-projet/rapport`, `analyse-projet/plans-action` |
| **D4.INV-3** | les frontières transactionnelles sont déclarées dans la couche `application`, et les lectures sont en `readOnly = true`. | `persistance`, `tests`, `agent-tdd-jira/variantes`, `agent-tdd-jira/cycle-tdd`, `analyse-projet/evaluation`, `analyse-projet/plans-action` |
| **D4.INV-4** | aucune requête SQL ou JPQL n'est construite par concaténation avec une donnée d'entrée. | `persistance`, `tests`, `revue`, `analyse-projet/evaluation`, `sonarqube`, `sonarqube/triage`, `sonarqube/correction`, `sonarqube/rapport` |
| **D4.INV-5** | les tests de persistance s'exécutent sur PostgreSQL (Testcontainers), jamais sur une base en mémoire. | `persistance`, `tests`, `analyse-projet/evaluation` |
| **D4.INV-6** | toute entité modifiable de façon concurrente porte un attribut `@Version`. | `persistance`, `tests`, `revue`, `analyse-projet/evaluation` |

### D5 : Sécurité Spring Security (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D5.INV-1** | la chaîne de sécurité refuse par défaut (`anyRequest().authenticated()` ou plus strict) ; chaque exception publique est explicite. | `securite`, `tests`, `revue`, `analyse-projet/evaluation` |
| **D5.INV-2** | les réponses 401 et 403 émises par la chaîne de sécurité sont des Problem Details conformes au socle. | `api-rest`, `securite`, `analyse-projet/evaluation` |
| **D5.INV-3** | seuls `health` et `info` d'Actuator sont exposés sans authentification. | `securite`, `tests`, `analyse-projet/evaluation` |
| **D5.INV-4** | aucun jeton, mot de passe ni donnée personnelle non nécessaire n'est journalisé (application de SC4.INV-1 et SC5). | `securite`, `tests`, `revue`, `analyse-projet/evaluation` |

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

## socle-back-front 1.0.1

Socle commun back-front : contrat OpenAPI, erreurs RFC 9457, formats de données, sécurité, traçabilité, accessibilité. Point d'entrée : [`specs/socle-back-front/SKILL.md`](specs/socle-back-front/SKILL.md).

### SC1 : Contrat d'API OpenAPI (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SC1.INV-1** | tout endpoint exposé par le back figure dans le contrat, et tout endpoint du contrat est implémenté. Contrôle : test de conformité du contrat côté back. | `java`, `java/api-rest` |
| **SC1.INV-2** | aucun changement cassant n'est introduit dans une version d'API publiée. Contrôle : comparaison du contrat avec sa version précédente (outil de diff OpenAPI en CI, ou revue). | `agent-tdd-jira`, `analyse-projet`, `analyse-projet/plans-action`, `java/api-rest` |
| **SC1.INV-3** | le front n'appelle les endpoints du contrat qu'au travers du client généré. Contrôle : recherche d'URL `/api/` codées en dur dans le front, hors client généré. | `angular`, `angular/architecture`, `angular/donnees-http`, `angular/revue` |

### SC2 : Erreurs RFC 9457 (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SC2.INV-1** | toute réponse 4xx ou 5xx du back est en `application/problem+json`, avec `code` et `traceId`. Contrôle : tests d'API sur un cas de chaque statut. | `java`, `java/api-rest` |
| **SC2.INV-2** | le front ne fonde aucune décision sur `title` ou `detail`. Il décide sur `status` et `code`. Contrôle : revue et tests du gestionnaire d'erreurs. | `angular`, `angular/donnees-http`, `java/tests` |
| **SC2.INV-3** | une erreur 500 ne révèle ni trace de pile, ni requête SQL, ni nom de classe. Contrôle : test d'API provoquant une exception non gérée. | `java/api-rest` |

### SC3 : Formats de données et pagination (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SC3.INV-1** | aucune date-heure ne circule sans fuseau. Contrôle : schéma du contrat (`format: date-time`) et tests de sérialisation. | `java/api-rest`, `java/persistance` |
| **SC3.INV-2** | aucun montant n'est représenté en virgule flottante, ni en JSON, ni en Java, ni en base. Contrôle : revue du contrat et recherche de `double`, `float` sur les champs monétaires. | `angular`, `angular/donnees-http`, `java/langage`, `java/persistance`, `java/revue` |
| **SC3.INV-3** | toute liste potentiellement non bornée est paginée, avec une taille maximale imposée par le back. Contrôle : revue des endpoints de collection. | `agent-tdd-jira/variantes`, `java`, `java/api-rest` |

### SC4 : Sécurité de la frontière (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SC4.INV-1** | aucun secret ni jeton dans le code du front, dans une URL ou dans un journal. Contrôle : recherche de motifs de secrets et revue de la configuration de journalisation. | `agent-tdd-jira/variantes`, `angular`, `angular/donnees-http`, `angular/routage-securite`, `java`, `java/securite`, `sonarqube/triage`, `sonarqube/correction` |
| **SC4.INV-2** | chaque endpoint non public est protégé par une règle d'autorisation côté back. Contrôle : test d'accès anonyme refusé sur chaque endpoint protégé. | `agent-tdd-jira/variantes`, `angular/routage-securite`, `java/securite` |
| **SC4.INV-3** | CORS n'autorise jamais `*` avec identifiants. Contrôle : revue de la configuration CORS par environnement. | `analyse-projet/rapport`, `java/securite`, `sonarqube/triage` |

### SC5 : Traçabilité (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SC5.INV-1** | toute erreur 5xx est journalisée côté back avec son `traceId`, et le même `traceId` est renvoyé au front. Contrôle : test d'API et vérification du journal capturé. | — |

### SC6 : Accessibilité et messages (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **SC6.INV-1** | chaque erreur de validation renvoyée par le back est rattachée au champ correspondant dans le formulaire du front. Contrôle : test de composant avec une réponse 400 simulée. | `angular`, `angular/formulaires`, `angular/tests`, `angular/revue`, `java/tests` |
| **SC6.INV-2** | aucune information n'est transmise par la couleur seule. Contrôle : revue RGAA (critère 3.1) et tests automatisés d'accessibilité. | `angular/accessibilite`, `angular/revue` |

### SC7 : Événements asynchrones (WebSocket, SSE, messages) (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

## sonarqube 1.0.2

Expert SonarQube Server 2026.x : configurer l'analyse et la CI, trier, corriger ou planifier, gouverner la qualité, pour des projets Java et Angular sur GitLab. Point d'entrée : [`specs/sonarqube/SKILL.md`](specs/sonarqube/SKILL.md).

### D1 : Cadrage, accès et sécurité du jeton (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D1.INV-1** | la mission, le périmètre (projets, branche ou merge request) et les droits attendus sont explicites avant toute action. | `cadrage-acces` |
| **D1.INV-2** | le jeton n'est jamais affiché, journalisé, versionné, ni placé dans une URL ou un argument de commande visible ; il est lu depuis la variable `SONAR_TOKEN`. | `cadrage-acces` |
| **D1.INV-3** | toute écriture vers SonarQube est proposée avec l'appel exact et n'est appliquée qu'après validation explicite. | `cadrage-acces`, `triage`, `correction`, `gouvernance` |
| **D1.INV-4** | la version, l'édition et le mode de l'instance sont relevés avant toute interprétation, et aucune fonction absente de l'instance n'est proposée. | `cadrage-acces`, `triage` |

### D2 : Configuration de l'analyse et de la CI (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D2.INV-1** | le code généré, les dépendances et les artefacts de build sont exclus de l'analyse. | `configuration-analyse`, `triage` |
| **D2.INV-2** | la couverture des tests est importée pour le back (rapport XML JaCoCo) et pour le front (rapport LCOV) ; une analyse sans couverture est signalée. | `configuration-analyse` |
| **D2.INV-3** | le pipeline analyse les merge requests et la branche principale, avec l'historique Git complet, et attend le résultat du quality gate. | `configuration-analyse` |
| **D2.INV-4** | les paramètres d'analyse sont versionnés dans le dépôt ; le jeton utilisé par la CI n'est jamais dans le dépôt et n'est fourni que par une variable masquée de la CI. | `configuration-analyse` |

### D3 : Triage et interprétation (active)

| Invariant | Énoncé | Repris dans |
|---|---|---|
| **D3.INV-1** | chaque issue marquée faux positif ou acceptée porte un commentaire de justification dans SonarQube. | `triage` |
| **D3.INV-2** | l'expert ne modifie jamais une gravité ni un statut pour faire passer le quality gate. | `triage` |
| **D3.INV-3** | une revue de sécurité (Security Hotspot ou Security Issue) n'est jamais close sans décision humaine enregistrée. | `triage` |
| **D3.INV-4** | le triage suit l'ordre : nouveau code d'abord, puis sécurité, fiabilité, maintenabilité, puis gravité décroissante. | `triage` |

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
| **D6.INV-1** | chaque rapport indique l'instance (version, édition), le projet, la branche ou merge request, la date de l'analyse, l'état du quality gate et les appels d'API utilisés. | `rapport` |
| **D6.INV-2** | chaque chiffre vient d'une réponse de l'API, jamais d'une estimation. | `rapport` |

### D7 : Serveur MCP et agents Sonar (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

### D8 : Rapports de conformité (WCAG, OWASP, CRA) (reserved)

Dimension réservée : aucun invariant en vigueur dans cette version.

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
