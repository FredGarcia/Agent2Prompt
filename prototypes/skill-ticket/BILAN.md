# Bilan du prototype « skill de ticket »

Rendu le 8 novembre 2026, à la fin du lot 7. Le prototype est terminé : ses sept lots sont livrés, les choix des lots 2 à 6 validés par le développeur ; les choix du lot 7 et la voie d'intégration restent à sa décision. Aucune spécification n'a été modifiée par le prototype : tout est resté dans `prototypes/skill-ticket/`.

## En bref

- **Ce qui est prouvé sans modèle** : un ticket se décompose en arbre vérifié (P1) ; chaque nœud reçoit un skill de ticket assemblé depuis le référentiel, sans token, reproductible octet pour octet (P2), qui reprend tout ce dont il hérite (P3) ; l'arbre s'installe dans Gemini CLI, qui découvre ses skills et charge ses agents ; les documents de la clé et les kits passent leurs contrôles (P8, P9) ; le champ d'observation déclenche l'ordre 2, propage les menaces et inscrit les désaccords (P5) ; la vue augmentée en est le reflet exact (P6) ; le contexte de chaque feuille est mesuré et comparé à l'orchestrateur (P7). La recette de bout en bout enchaîne génération, installation, contrôles de la résolution par les commandes des consignes, liste, retrait et archivage, sur les deux arbres d'exemple.
- **Ce qui reste à jouer sur le poste**, faute de modèle dans la recette : la présentation de l'arbre et l'attente de la ratification (P4), la rédaction des documents par le rédacteur, l'invocation des observateurs, et la mesure réelle des tokens.
- **Contexte (P7)** : aucun contexte de l'arbre ne charge plus de 53 % du point d'entrée de l'orchestrateur, au plus ; la session d'une feuille en charge 38 à 40 % (53 % pour un ticket sans sous-ticket), et 18 à 26 % à son activation. Mais l'arbre lit en tout cinq fois ce que lit l'orchestrateur pour ABCDE-3620, trois fois pour ABCDE-3512, et près de la moitié de cette somme est faite de relectures.
- **Décision 8** : garder un contexte séparé par agent et l'ordre d'observation maximal 3 ; réduire les relectures avant l'intégration (trois pistes, environ 14 % de la somme).
- **Intégration** : recommandation, à décider par le développeur, d'une version majeure de l'orchestrateur, 4.0.0, où le skill de ticket remplace la fiche de transformation ; la spécification de générateur à part reste possible.

## Critères d'acceptation

| Critère | Preuves | État |
|---|---|---|
| P1 : arbre vérifié, écarts rejetés | `tests/arbre.test.mjs` : « P1 · écart rejeté » (deux parents, cycle, dépendance vers un ancêtre, profondeur, possibilité portée par aucun sous-ticket, option hors composition) ; `tests/generer.test.mjs` : « P1 : une fabrique qui omet un invariant ne produit rien », « P1 : une fabrique qui affaiblit un invariant ne produit rien » | atteint |
| P2 : transmissions fidèles et reproductibles, sans token | `tests/generer.test.mjs` : « P2 : chaque transmission est celle attendue, octet pour octet », « P2 : la même entrée redonne les mêmes fichiers, sans rien tirer au hasard ni dater », « P2 : des tickets en fins de ligne CRLF donnent les mêmes transmissions » ; `tests/bout-en-bout.test.mjs` : « se génère à l'identique de ses transmissions versionnées », « second arbre : ABCDE-3512 » | atteint, sur les deux arbres |
| P3 : héritage complet, contrôlé | `tests/generer.test.mjs` : « P3 : chaque transmission attendue passe le contrôle d'intégrité et d'héritage », « P3 : les 33 invariants de l'orchestrateur, mot pour mot, dans chaque skill » ; `tests/bout-en-bout.test.mjs` : « le retrait archive les transmissions, qui se vérifient et se mesurent comme les versionnées » | atteint |
| P4 : présentation de l'arbre, puis ratification avant toute action | sans modèle : `tests/installation.test.mjs` : « Gemini CLI réel : skills découverts et activés, agents chargés, dossier non fiable signalé » (job `contrat-gemini`, Linux et Windows), « lancer : Gemini CLI en mode interactif, sur la phrase qui active le skill du nœud, dans le workspace » ; avec modèle : README, recette P4 sur le poste du développeur | protocole sur le poste ; la partie sans modèle est atteinte |
| P5 : ordre 2, menace, désaccord | `tests/champ.test.mjs` : « P5 : une correction répétée fait attendre une proposition d'ordre 2, à la deuxième correction », « P5 : un écart dans un sous-ticket menace le critère du parent qu'il soutient, jusqu'au critère d'acceptation », « P5 : un désaccord entre nœuds va au registre des écarts, décision laissée au développeur » | atteint sur retours simulés ; l'invocation des observateurs par un modèle se joue sur le poste |
| P6 : vue conforme au champ | `tests/vue.test.mjs` : « P6 : vues finales de l'essai et du projet résolu identiques aux vues versionnées, et à jour », « P6 : l'état de chaque critère est celui que lui donne le champ, à chaque dépôt de l'essai », « chaque ancre porte exactement ce qui l'atteint, dans le modèle et dans la page » | atteint |
| P7 : contexte mesuré et comparé à l'orchestrateur | `tests/contexte.test.mjs` : « le rapport regénéré est le rapport versionné, octet pour octet », « chaque fichier compté existe, a la taille comptée, et la consigne qui le fait lire le cite », « P7 : le point d'entrée de l'orchestrateur se mesure selon son propre ordre de lecture », « P7 : chaque feuille est comparée au point d'entrée de l'orchestrateur, à chaque borne ; l'arbre entier aussi » ; rapports `exemples/contexte/ABCDE-3620.md` et `exemples/contexte/ABCDE-3512.md` | atteint en mesure statique ; mesure réelle : protocole sur le poste |
| P8 : documents de la clé | `tests/documents-kits.test.mjs` : « P8 : les documents de l'exemple passent controler-criteres et verifier-documents, livrés par le skill racine » ; `tests/bout-en-bout.test.mjs` : « les contrôles des consignes passent sur la résolution, avec les scripts du skill racine installé » | atteint sur des documents écrits pour l'exemple ; leur rédaction par le modèle se joue sur le poste |
| P9 : kits et remise | `tests/documents-kits.test.mjs` : « P9 : les kits de l'exemple sont complets et vérifiés, et la remise est conforme », « P9 : l'historique se reconstruit à l'identique, et le kit dev s'y vérifie avec --depot » ; `tests/bout-en-bout.test.mjs` : « liste montre chaque nœud clos, le champ et la vue à jour » | atteint |

La recette compte 265 tests, dont un qui attend Gemini CLI (`SKILL_TICKET_GEMINI`) ; elle passe sous Linux et sous Windows, avec Node 22 et 24, et sur une extraction en fins de ligne CRLF.

## Mesure du contexte (P7)

`outils/mesurer-contexte.mjs` mesure, sans modèle, ce que chaque contexte de l'arbre charge : la session du skill de chaque nœud, chaque agent de couche, chaque sous-agent de rôle que sa consigne nomme, et les deux observateurs de l'arbre. Deux bornes : **à l'activation**, ce que Gemini CLI charge de lui-même (noms et descriptions des skills et des agents installés, corps du skill activé ou de l'agent invoqué) ; **au plus**, en plus, tout ce que la consigne fait lire pour résoudre le ticket (modules, références, copie du projet du fichier d'invariants, documents de la clé, vue du nœud), jamais ce qu'elle fait écrire. Le point d'entrée de l'orchestrateur se mesure de la même façon, selon son propre ordre de lecture, pour le même ticket. Tailles en caractères, tokens estimés à un pour quatre caractères.

### ABCDE-3620, trois niveaux, cinq nœuds

Point d'entrée de l'orchestrateur : 22 562 tokens à l'activation, 62 726 tokens au plus.

| Feuille | Session, activation | Session, au plus | Plus grand contexte | Somme des contextes |
|---|---|---|---|---|
| ABCDE-3620-1.1 | 4 010 tokens, 18 % | 23 816 tokens, 38 % | 24 953 tokens, 40 % | 70 190 tokens, 112 % |
| ABCDE-3620-1.2 | 4 254 tokens, 19 % | 25 223 tokens, 40 % | 27 364 tokens, 44 % | 74 484 tokens, 119 % |
| ABCDE-3620-2 | 4 156 tokens, 18 % | 24 262 tokens, 39 % | 25 568 tokens, 41 % | 71 470 tokens, 114 % |

| Mesure | Au plus |
|---|---|
| plus grand contexte de l'arbre, session du skill ticket-abcde-3620 | 31 019 tokens, 50 % |
| somme des 20 contextes des 5 nœuds et des observateurs | 311 138 tokens, 496 % |

### ABCDE-3512, un seul ticket

Point d'entrée de l'orchestrateur : 22 562 tokens à l'activation, 61 634 tokens au plus.

| Feuille | Session, activation | Session, au plus | Plus grand contexte | Somme des contextes |
|---|---|---|---|---|
| ABCDE-3512 | 5 914 tokens, 26 % | 32 425 tokens, 53 % | 32 425 tokens, 53 % | 162 902 tokens, 264 % |

| Mesure | Au plus |
|---|---|
| plus grand contexte de l'arbre, session du skill ticket-abcde-3512 | 32 425 tokens, 53 % |
| somme des 10 contextes du nœud et des observateurs | 179 881 tokens, 292 % |

### Ce que disent les mesures

- **Chaque contexte est plus petit** que le point d'entrée de l'orchestrateur, à chaque borne : la session d'une feuille s'ouvre à moins d'un cinquième de lui (un quart pour un ticket seul, dont la session porte aussi les modules de la racine), et en charge environ deux cinquièmes au plus (un peu plus de la moitié pour un ticket seul) ; un agent de couche ne lit que le référentiel de sa couche, jamais celui des autres. Le plus grand contexte est la session de la racine, qui fait rédiger les documents et tient le champ et la vue.
- **La somme est plus grande** : une feuille fait lire à ses cinq contextes un peu plus que l'orchestrateur (112 à 119 %), l'arbre entier cinq fois plus. Deux causes. D'abord, l'arbre fait plus que l'orchestrateur : documents de la clé, revue, qualité, kits, observation, vue ; les sous-agents de rôle lisent les références d'agent-tdd-jira, d'analyse-projet et de sonarqube, que l'orchestrateur laisse à d'autres sessions, non comptées de son côté. Ensuite, chaque contexte relit ce qu'il lui faut : 48 % de la somme pour ABCDE-3620, 50 % pour ABCDE-3512, viennent de fichiers lus dans plusieurs contextes.
- **Les relectures les plus lourdes** (section « Relectures » des rapports) : le module `champ`, lu dans dix contextes d'ABCDE-3620 alors que les nœuds et les agents n'y font que déposer ; la copie du projet du fichier d'invariants, que chaque session lit puis compare à sa propre copie, lue elle aussi ; la consigne entière du nœud, que chaque agent de couche relit ; le socle et les référentiels Java et Angular, relus par chaque agent de couche et par le relecteur.

## Décision 8, revue

La décision 8 fixait, pour le prototype, « ordre d'observation maximal 3 plus l'humain, et un contexte séparé par agent, à revoir au bilan ».

**Un contexte séparé par agent : à garder.** C'est ce qui borne chaque contexte à 53 % au plus du point d'entrée de l'orchestrateur, et ce qui rend une observation indépendante du travail qu'elle observe : l'observateur d'ordre 2 ou 3 juge dans un contexte qui n'a pas produit ce qu'il juge. Le prix se lit dans la somme ; il se réduit sans toucher à la séparation, par trois pistes à décider, chiffrées d'après les rapports :

1. **Comparer les deux copies du fichier d'invariants par leur empreinte**, avec un script de la boîte à outils, plutôt que de les lire toutes deux : environ 19 500 tokens de moins sur ABCDE-3620 (une copie de moins dans chacune des cinq sessions), 3 900 sur ABCDE-3512.
2. **Donner à chaque agent de couche sa part de la consigne** (objectif, critères de sa couche, méso-contrats et options) plutôt que la consigne entière du nœud : environ 10 000 tokens sur ABCDE-3620, 16 200 sur ABCDE-3512, où trois agents relisent la plus longue consigne.
3. **Un extrait « dépôt » du module `champ`** pour les nœuds et les agents, le module entier restant à la racine et aux observateurs : environ 13 900 tokens sur ABCDE-3620, 5 700 sur ABCDE-3512, pour un extrait de 2 000 caractères.

Ensemble, environ 14 % de la somme sur chacun des deux arbres. Citer les sections utiles du socle et des référentiels plutôt que leurs fichiers entiers, comme les consignes le font déjà pour les références d'agent-tdd-jira, irait plus loin ; la borne « au plus » compte aujourd'hui ces lectures partielles en entier.

**Ordre d'observation maximal 3 plus l'humain : à garder.** Sur retours simulés, l'ordre 2 s'éveille à la deuxième correction d'un même motif, l'ordre 3 examine sa proposition puis la décision revient au développeur, et deux propositions refusées mettent le motif en veille (P5, P6). Rien n'y appelle un quatrième ordre : l'ordre 3 sait déjà faire taire l'ordre 2, et l'humain tranche au-dessus. Le coût est borné : un observateur charge au plus 8 500 à 8 700 tokens, et seulement sur une attente du champ, jamais en continu. Reste ouverte l'indépendance au-delà du prototype : contextes séparés, mais même modèle ; un autre modèle pour l'ordre 3 serait à essayer.

## Limites

- **Aucune session avec un modèle dans la recette ni dans la CI** : la présentation et la ratification (P4), la rédaction des documents, l'invocation des agents et des observateurs, et la mesure réelle des tokens ont leurs protocoles sur le poste (README), non joués ici. Les documents, le champ, les kits et l'historique du projet résolu ont été écrits pour l'exemple : le prototype n'a résolu aucun ticket d'une application réelle.
- **Mesure statique, borne haute** : un fichier cité compte en entier, même quand la consigne n'en demande que quelques paragraphes ; les sorties des scripts ne comptent pas, sauf la vue du nœud, la seule qui se lit en entier ; les citations se suivent sur un niveau, celles des modules lus ne sont pas suivies.
- **Estimation des tokens** à un pour quatre caractères, sur un texte français accentué que les tokeniseurs découpent plus finement que l'anglais : les rapports sous-estiment peut-être les tokens, des deux côtés à la fois. Le prompt système de Gemini CLI et la déclaration de ses outils ne sont comptés d'aucun côté ; communs aux deux, ils rapprochent les rapports réels de 1. La mesure réelle (`calibrer`) les recale ; elle est vérifiée sur deux sorties d'essai de la forme de Gemini CLI 0.67.0, pas sur une session réelle, faute de clé.
- **Comparaison de périmètres différents** : l'orchestrateur se mesure à son point d'entrée, quand l'arbre compte aussi le travail que l'orchestrateur laisse à agent-tdd-jira, analyse-projet et sonarqube, dans d'autres sessions.
- **Scripts du prototype vérifiés contre leur version du dépôt, sans archive** : les skills inclus se lisent à leur version épinglée, archives comprises, mais `champ.mjs`, `vue.mjs`, `verifier-documents.mjs` et `verifier-kits.mjs` se comparent à leur version courante.
- **Coût de maintenance des transmissions attendues et des rapports** : tout changement d'une source héritée (orchestrateur, socle, référentiels, skills et scripts de la boîte à outils) les rend périmés ; la recette le signale, et ils se régénèrent par une commande, mais chaque changement d'une spécification amont touche le prototype.
- **Projet résolu sans copie du fichier d'invariants** : la mesure prend à sa place la copie du skill, côté arbre, et le modèle de l'orchestrateur, de son côté ; les deux sont identiques.

## Écarts relevés

1. **Exemple du § 7.2 du module `referentiel`** (orchestrateur-c7e 3.5.3) : `regle` et `service` restent à `inconnu`, alors qu'un `oui` changerait la composition (relevé au lot 1, non corrigé).
2. **Ticket fil rouge sans critères** : l'exemple du § 7.1, ABCDE-3512, n'en porte aucun, alors que le prototype en exige pour rédiger `us.md` et rattacher les sous-tickets (P8). Six critères ont été rédigés pour le prototype, dans `exemples/ABCDE-3512/ABCDE-3512.toml`, **à relire par le développeur**. À l'intégration : exiger des critères dans le ticket, ou laisser le rédacteur les proposer, au statut « proposé », avant la ratification.
3. **Double lecture du fichier d'invariants** (piste 1 ci-dessus) : la consigne fait comparer la copie du projet à celle du skill en les lisant toutes deux ; une empreinte suffit.
4. **Relectures des agents de couche** (pistes 2 et 3) : chaque agent relit la consigne entière de son nœud et le module `champ` entier.
5. **Rédacteur nommé autrement que les autres sous-agents de rôle**, écart mineur : la consigne du skill dit « le sous-agent rédacteur » et renvoie au module `documents`, qui donne son nom d'agent, quand elle nomme l'analyste, le relecteur et la qualité par le nom qu'invoque `invoke_agent` ; à harmoniser dans la fabrique.
6. **Ticket sans sous-ticket** : sans arbre à ratifier, il se ratifie une fois, sous sa référence, après son analyse en lecture seule, documents de la clé compris ; c'est conforme à la décision 9 et au choix 8 du lot 5, mais l'énoncé de P4 (« présente l'arbre… puis attend la ratification avant toute action ») est à préciser pour ce cas dans la spécification intégrée.

## Intégration, à décider par le développeur

### Deux voies

**(a) orchestrateur-c7e 4.0.0** : le skill de ticket remplace la fiche de transformation comme objet ratifié avant tout code (décision 2). L'orchestrateur devient le générateur : qualification, référentiel, décomposition, fabrique et Monteur, installation ; ce qui guide la résolution part dans les skills de ticket, qui en reprennent déjà les sections mot pour mot (module `methode`). Les invariants de D3 sur la fiche se réécrivent pour le skill ; les scripts de la boîte à outils de la racine deviennent des sources versionnées et archivées.

- Pour : une seule voie pour résoudre un ticket, comme le veut la décision 2 ; une seule spécification, une seule version, là où les skills copient l'orchestrateur mot pour mot et changent avec lui ; un point d'entrée qui peut maigrir, la méthode de résolution partant dans les skills.
- Contre : version majeure ; les projets en cours avec des fiches 3.x restent sur 3.x ou migrent.

**(b) une spécification de générateur à part**, qui dépend de l'orchestrateur 3.x à une version épinglée, comme le prototype dépend de 3.5.3. L'orchestrateur ne change pas : le module `invariants` de chaque skill fait déjà correspondre les invariants de l'orchestrateur à ce qui les tient dans le skill (la fiche étant le skill ratifié), sous le contrôle de l'héritage (P3).

- Pour : pas de version majeure ; 3.x intact pour ses utilisateurs ; un cycle de vie propre au générateur.
- Contre : deux voies coexistent pour résoudre un ticket, la fiche et le skill, ce que la décision 2 voulait éviter ; une épingle de version à tenir entre deux spécifications qui changent ensemble.

**Recommandation : (a)**, une fois remplies trois conditions : P4 et la mesure réelle joués sur le poste ; les réductions de relectures décidées ; les scripts de la boîte à outils versionnés comme les autres sources.

### Invariants candidats

Numérotation à fixer à l'intégration ; chacun s'appuie sur une décision ratifiée et sur sa preuve dans le prototype.

1. **Assemblage** : un skill de ticket s'assemble depuis les blocs ratifiés du référentiel ; le modèle n'écrit que l'objectif, les critères et le repérage (décision 1 ; P2, sans token).
2. **Arbre** : un seul parent par sous-ticket ; dépendances sans cycle ni vers un ancêtre ; profondeur plafonnée, 3 par défaut, réglable ; chaque possibilité d'un parent portée par au moins un sous-ticket (décisions 3 et 4 ; P1).
3. **Héritage** : chaque skill reprend mot pour mot les invariants, les sections de méthode et les copies dont il hérite, à leur version épinglée ; rien ne s'installe sans ce contrôle (P3).
4. **Transmission** : un skill se relit à l'identique depuis sa transmission ; la même entrée redonne les mêmes fichiers (P2).
5. **Ratification** : l'arbre sur sa racine, puis chaque feuille avant sa première action ; un ticket sans sous-ticket se ratifie une fois, sous sa référence ; rien n'est modifié avant (décision 9).
6. **Champ** : un champ d'observation par arbre, en ajout seul, chaîné, au schéma fermé ; toute auto-observation se réfère à un retour humain ou à une preuve (décisions 6 et 15 ; P5).
7. **Ordres** : ordre maximal 3 plus l'humain ; l'ordre 2 propose une adaptation de la méthode, jamais une action sur le code ; un écart se traite au niveau le plus bas qui le peut ; un désaccord va au registre des écarts (décisions 8, 17 et 18 ; P5).
8. **Vue** : la vue se tire du champ et des documents de la clé, ne s'écrit pas à la main et ne se commite pas ; mêmes champ et documents, même vue (décision 23 ; P6).
9. **Contextes** : une session par nœud, un contexte par agent ; aucun contexte de l'arbre ne dépasse, au plus, le point d'entrée de l'orchestrateur, mesuré à chaque génération (P7 ; 53 % au plus aujourd'hui).
10. **Éphémère** : l'arbre s'installe masqué à Git et se retire à la clôture en archivant ses transmissions dans le dossier du ticket ; l'installation et le retrait ne touchent à aucun fichier suivi (lot 3 ; recette de bout en bout).

### Points ouverts

- **Socle d'observation partagé**, inclus et épinglé comme le socle back-front : format de l'observation, ordres, vue ; `skill-ticket.observation/1` et `skill-ticket.vue/1` en sont la première forme, propre au prototype.
- **Évolutions d'Agent2Dev** (décision 13) : `demande.json` au schéma v2, avec les liens vers d'autres tickets (agent-tdd-jira), et l'entrée « demande » à côté du MHTML, son D1.INV-5 à réécrire, en version majeure probable.
- **Critères d'un ticket qui n'en porte pas** (écart 2).
- **Indépendance des ordres** au-delà du prototype : contexte séparé, ou autre modèle pour l'ordre 3.
- **Place des transmissions attendues et des rapports de mesure** dans la spécification intégrée, et leur régénération par la CI.

## Reproduire

Depuis la racine du dépôt :

```bash
node --test "prototypes/skill-ticket/tests/*.test.mjs"
node prototypes/skill-ticket/outils/mesurer-contexte.mjs mesurer prototypes/skill-ticket/exemples/ABCDE-3620-skills/transmissions --projet prototypes/skill-ticket/exemples/ABCDE-3620-resolution --sortie prototypes/skill-ticket/exemples/contexte/ABCDE-3620.md
node prototypes/skill-ticket/outils/mesurer-contexte.mjs mesurer prototypes/skill-ticket/exemples/ABCDE-3512-skills/transmissions --sortie prototypes/skill-ticket/exemples/contexte/ABCDE-3512.md
```

La mesure réelle se fait sur le poste, avec la clé de Gemini CLI, qui n'est jamais demandée ni affichée : protocole au README, section « Mesure réelle sur le poste ».
