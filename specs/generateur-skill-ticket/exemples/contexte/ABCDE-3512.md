# Contexte chargé pour résoudre chaque feuille de ABCDE-3512

Mesure statique et déterministe (generateur-skill-ticket, critère P7), produite par `outils/mesurer-contexte.mjs`. Projet mesuré : aucun ; ni documents de la clé ni champ, la vue des nœuds est celle d'un champ vide. Tailles en caractères ; tokens estimés à un pour 4 caractères.

À l'activation : ce que Gemini CLI charge de lui-même (noms et descriptions des skills et des agents installés, corps du skill activé ; corps d'un agent à son invocation). Au plus : en plus, ce que la consigne fait lire pour résoudre le ticket, sans ce qu'elle fait écrire. Chaque contexte est séparé : la session d'un skill et chaque agent ont le leur.

## Point d'entrée de l'orchestrateur, pour le ticket ABCDE-3512 entier

| Borne | Taille |
|---|---|
| à l'activation | 90 246 car., 22 562 tokens |
| au plus | 246 535 car., 61 634 tokens |

- `orchestrateur-c7e : nom et description` : 1 137 car., chargés au démarrage de Gemini CLI
- `orchestrateur-c7e/SKILL.md` : 89 109 car., corps du skill, à son activation
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., copie du projet du fichier d'invariants, lue au démarrage
- `orchestrateur-c7e/modules/qualification/SKILL.md` : 19 330 car., lu à l'ouverture et à l'analyse de chaque ticket
- `orchestrateur-c7e/modules/referentiel/SKILL.md` : 45 516 car., lu à l'ouverture et à l'analyse de chaque ticket
- `projet/docs/c7e/referentiel-meso-contrats.toml` : 24 852 car., référentiel du projet, écrit à l'identique du modèle à l'installation
- `projet/docs/demandes/ABCDE-3512/ticket.toml` : 4 718 car., le ticket, une instance du référentiel
- `orchestrateur-c7e/socle/SKILL.md` : 18 589 car., socle, quand le ticket touche son domaine
- `orchestrateur-c7e/references/java.md` : 13 731 car., référentiel d'une couche que le ticket touche
- `orchestrateur-c7e/references/angular.md` : 13 915 car., référentiel d'une couche que le ticket touche

## Feuilles

| Feuille | Session, activation | Session, au plus | Plus grand contexte | Somme des contextes |
|---|---|---|---|---|
| ABCDE-3512 | 5 908 tokens, 26 % | 32 419 tokens, 53 % | 32 419 tokens, 53 % | 162 879 tokens, 264 % |

Les pourcentages rapportent chaque taille à celle du point d'entrée de l'orchestrateur, à la même borne pour l'activation, au plus pour le reste. La somme réunit les contextes qui travaillent pour la feuille : sa session, ses agents de couche, ses sous-agents de rôle.

## Arbre entier

| Mesure | Au plus |
|---|---|
| plus grand contexte de l'arbre, session du skill ticket-abcde-3512 | 32 419 tokens, 53 % |
| somme des 10 contextes du nœud et des observateurs | 179 858 tokens, 292 % |

Aucun contexte de l'arbre ne charge plus que le pourcentage du plus grand ; la somme dit ce que l'arbre lit en tout, quand chaque contexte relit ce qu'il lui faut, au plus.

## Relectures

Sur la somme des contextes de l'arbre, 90 220 tokens (50 %) viennent de fichiers lus dans plusieurs contextes ; lus une seule fois chacun, les fichiers de l'arbre feraient 89 638 tokens, 145 % du point d'entrée de l'orchestrateur.

| Fichier | Contextes qui le lisent | Relu, au plus |
|---|---|---|
| `ticket-abcde-3512/SKILL.md` | 4 | 16 134 tokens |
| `ticket-abcde-3512/modules/champ/SKILL.md` | 6 | 12 002 tokens |
| `projet/docs/c7e/meso-contrats.md` | 4 | 11 729 tokens |
| `ticket-abcde-3512/socle/SKILL.md` | 3 | 9 295 tokens |
| `ticket-abcde-3512/modules/invariants/SKILL.md` | 4 | 8 623 tokens |
| `ticket-abcde-3512/modules/methode/SKILL.md` | 3 | 6 930 tokens |
| `ticket-abcde-3512/references/java.md` | 3 | 6 866 tokens |
| `ticket-abcde-3512/ticket.toml` | 6 | 5 898 tokens |
| `ticket-abcde-3512/references/agent-tdd-jira/cycle-tdd.md` | 3 | 3 680 tokens |
| `ticket-abcde-3512/references/angular.md` | 2 | 3 479 tokens |
| `ticket-abcde-3512/modules/vue/SKILL.md` | 3 | 2 635 tokens |
| `ticket-abcde-3512/modules/documents/SKILL.md` | 2 | 1 787 tokens |
| `vue du nœud ABCDE-3512` | 3 | 1 167 tokens |

## Observateurs de l'arbre, sur attente

Invoqués par le skill d'un nœud quand le champ attend une observation d'ordre 2 ou 3 ; mesurés une fois pour l'arbre, hors des sommes par nœud.

| Contexte | À l'activation | Au plus |
|---|---|---|
| observateur ticket-abcde-3512-observateur-2 | 2 993 car., 749 tokens | 34 056 car., 8 514 tokens |
| observateur ticket-abcde-3512-observateur-3 | 2 794 car., 699 tokens | 33 857 car., 8 465 tokens |

## Détail par nœud

### ABCDE-3512, racine et feuille

| Contexte | À l'activation | Au plus |
|---|---|---|
| session du skill ticket-abcde-3512 | 23 632 car., 5 908 tokens | 129 674 car., 32 419 tokens |
| agent ticket-abcde-3512-persistance | 3 398 car., 850 tokens | 108 400 car., 27 100 tokens |
| agent ticket-abcde-3512-back | 3 539 car., 885 tokens | 108 868 car., 27 217 tokens |
| agent ticket-abcde-3512-front | 3 905 car., 977 tokens | 110 554 car., 27 639 tokens |
| sous-agent ticket-abcde-3512-redacteur | 2 831 car., 708 tokens | 92 119 car., 23 030 tokens |
| sous-agent ticket-abcde-3512-analyste | 1 890 car., 473 tokens | 23 193 car., 5 799 tokens |
| sous-agent ticket-abcde-3512-relecteur | 1 642 car., 411 tokens | 38 352 car., 9 588 tokens |
| sous-agent ticket-abcde-3512-qualite | 1 809 car., 453 tokens | 40 356 car., 10 089 tokens |

Lu par session du skill ticket-abcde-3512 :

- `noms et descriptions du skill et des agents installés` : 2 309 car., chargés au démarrage de Gemini CLI
- `ticket-abcde-3512/SKILL.md` : 21 323 car., corps du skill, à son activation
- `ticket-abcde-3512/modules/meso-contrats/SKILL.md` : 1 742 car., module `meso-contrats`
- `ticket-abcde-3512/modules/vue/SKILL.md` : 5 270 car., modules `vue` et `champ` du skill racine
- `ticket-abcde-3512/modules/champ/SKILL.md` : 9 601 car., modules `vue` et `champ` du skill racine
- `ticket-abcde-3512/modules/documents/SKILL.md` : 7 147 car., module `documents`
- `ticket-abcde-3512/modules/methode/SKILL.md` : 13 859 car., module `methode`
- `ticket-abcde-3512/modules/recette/SKILL.md` : 4 368 car., module `recette`
- `ticket-abcde-3512/modules/kits/SKILL.md` : 7 534 car., module `kits`
- `ticket-abcde-3512/modules/invariants/SKILL.md` : 11 497 car., module `invariants`
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., `docs/c7e/meso-contrats.md`
- `ticket-abcde-3512/projet/meso-contrats.md` : 15 638 car., `projet/meso-contrats.md`
- `ticket-abcde-3512/ticket.toml` : 4 718 car., `ticket.toml`
- `ticket-abcde-3512/references/agent-tdd-jira/tracabilite.md` : 6 697 car., `references/agent-tdd-jira/tracabilite.md`
- `vue du nœud ABCDE-3512` : 2 333 car., vue.mjs generer docs/demandes/ABCDE-3512 --noeud ABCDE-3512

Lu par agent ticket-abcde-3512-persistance :

- `ticket-abcde-3512/agents/ticket-abcde-3512-persistance.md` : 3 398 car., corps de l'agent, à son invocation
- `ticket-abcde-3512/modules/champ/SKILL.md` : 9 601 car., module `champ` du skill racine
- `ticket-abcde-3512/SKILL.md` : 21 605 car., `.gemini/skills/ticket-abcde-3512/SKILL.md`
- `ticket-abcde-3512/ticket.toml` : 4 718 car., `.gemini/skills/ticket-abcde-3512/ticket.toml`
- `ticket-abcde-3512/modules/option-persistance-schema/SKILL.md` : 1 013 car., `.gemini/skills/ticket-abcde-3512/modules/option-persistance-schema/SKILL.md`
- `ticket-abcde-3512/modules/option-persistance-crud/SKILL.md` : 1 251 car., `.gemini/skills/ticket-abcde-3512/modules/option-persistance-crud/SKILL.md`
- `ticket-abcde-3512/references/agent-tdd-jira/cycle-tdd.md` : 7 359 car., `.gemini/skills/ticket-abcde-3512/references/agent-tdd-jira/cycle-tdd.md`
- `ticket-abcde-3512/modules/invariants/SKILL.md` : 11 497 car., `.gemini/skills/ticket-abcde-3512/modules/invariants/SKILL.md`
- `ticket-abcde-3512/socle/SKILL.md` : 18 589 car., `.gemini/skills/ticket-abcde-3512/socle/SKILL.md`
- `ticket-abcde-3512/references/java.md` : 13 731 car., `.gemini/skills/ticket-abcde-3512/references/java.md`
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., copie du projet du fichier d'invariants

Lu par agent ticket-abcde-3512-back :

- `ticket-abcde-3512/agents/ticket-abcde-3512-back.md` : 3 539 car., corps de l'agent, à son invocation
- `ticket-abcde-3512/modules/champ/SKILL.md` : 9 601 car., module `champ` du skill racine
- `ticket-abcde-3512/SKILL.md` : 21 605 car., `.gemini/skills/ticket-abcde-3512/SKILL.md`
- `ticket-abcde-3512/ticket.toml` : 4 718 car., `.gemini/skills/ticket-abcde-3512/ticket.toml`
- `ticket-abcde-3512/modules/option-backend-regles/SKILL.md` : 880 car., `.gemini/skills/ticket-abcde-3512/modules/option-backend-regles/SKILL.md`
- `ticket-abcde-3512/modules/option-backend-fonctionnalites/SKILL.md` : 746 car., `.gemini/skills/ticket-abcde-3512/modules/option-backend-fonctionnalites/SKILL.md`
- `ticket-abcde-3512/modules/option-backend-endpoints/SKILL.md` : 965 car., `.gemini/skills/ticket-abcde-3512/modules/option-backend-endpoints/SKILL.md`
- `ticket-abcde-3512/references/agent-tdd-jira/cycle-tdd.md` : 7 359 car., `.gemini/skills/ticket-abcde-3512/references/agent-tdd-jira/cycle-tdd.md`
- `ticket-abcde-3512/modules/invariants/SKILL.md` : 11 497 car., `.gemini/skills/ticket-abcde-3512/modules/invariants/SKILL.md`
- `ticket-abcde-3512/socle/SKILL.md` : 18 589 car., `.gemini/skills/ticket-abcde-3512/socle/SKILL.md`
- `ticket-abcde-3512/references/java.md` : 13 731 car., `.gemini/skills/ticket-abcde-3512/references/java.md`
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., copie du projet du fichier d'invariants

Lu par agent ticket-abcde-3512-front :

- `ticket-abcde-3512/agents/ticket-abcde-3512-front.md` : 3 905 car., corps de l'agent, à son invocation
- `ticket-abcde-3512/modules/champ/SKILL.md` : 9 601 car., module `champ` du skill racine
- `ticket-abcde-3512/SKILL.md` : 21 605 car., `.gemini/skills/ticket-abcde-3512/SKILL.md`
- `ticket-abcde-3512/ticket.toml` : 4 718 car., `.gemini/skills/ticket-abcde-3512/ticket.toml`
- `ticket-abcde-3512/modules/option-frontend-elements_graphiques/SKILL.md` : 1 842 car., `.gemini/skills/ticket-abcde-3512/modules/option-frontend-elements_graphiques/SKILL.md`
- `ticket-abcde-3512/modules/option-frontend-fonctionnalites/SKILL.md` : 1 885 car., `.gemini/skills/ticket-abcde-3512/modules/option-frontend-fonctionnalites/SKILL.md`
- `ticket-abcde-3512/references/agent-tdd-jira/cycle-tdd.md` : 7 359 car., `.gemini/skills/ticket-abcde-3512/references/agent-tdd-jira/cycle-tdd.md`
- `ticket-abcde-3512/modules/invariants/SKILL.md` : 11 497 car., `.gemini/skills/ticket-abcde-3512/modules/invariants/SKILL.md`
- `ticket-abcde-3512/socle/SKILL.md` : 18 589 car., `.gemini/skills/ticket-abcde-3512/socle/SKILL.md`
- `ticket-abcde-3512/references/angular.md` : 13 915 car., `.gemini/skills/ticket-abcde-3512/references/angular.md`
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., copie du projet du fichier d'invariants

Lu par sous-agent ticket-abcde-3512-redacteur :

- `ticket-abcde-3512/agents/ticket-abcde-3512-redacteur.md` : 2 831 car., corps de l'agent, à son invocation
- `ticket-abcde-3512/modules/documents/SKILL.md` : 7 147 car., module `documents`
- `ticket-abcde-3512/references/agent-tdd-jira.md` : 26 099 car., `.gemini/skills/ticket-abcde-3512/references/agent-tdd-jira.md`
- `ticket-abcde-3512/references/agent-tdd-jira/ingestion-jira.md` : 15 829 car., `.gemini/skills/ticket-abcde-3512/references/agent-tdd-jira/ingestion-jira.md`
- `ticket-abcde-3512/references/agent-tdd-jira/us-criteres.md` : 22 037 car., `.gemini/skills/ticket-abcde-3512/references/agent-tdd-jira/us-criteres.md`
- `ticket-abcde-3512/references/agent-tdd-jira/analyse-demande.md` : 9 698 car., `.gemini/skills/ticket-abcde-3512/references/agent-tdd-jira/analyse-demande.md`
- `ticket-abcde-3512/references/agent-tdd-jira/binome-agent2test.md` : 3 760 car., `.gemini/skills/ticket-abcde-3512/references/agent-tdd-jira/binome-agent2test.md`
- `ticket-abcde-3512/ticket.toml` : 4 718 car., `.gemini/skills/ticket-abcde-3512/ticket.toml`

Lu par sous-agent ticket-abcde-3512-analyste :

- `ticket-abcde-3512/agents/ticket-abcde-3512-analyste.md` : 1 890 car., corps de l'agent, à son invocation
- `ticket-abcde-3512/references/analyse-projet.md` : 10 027 car., `.gemini/skills/ticket-abcde-3512/references/analyse-projet.md`
- `ticket-abcde-3512/references/analyse-projet/cartographie.md` : 6 558 car., `.gemini/skills/ticket-abcde-3512/references/analyse-projet/cartographie.md`
- `ticket-abcde-3512/ticket.toml` : 4 718 car., `ticket.toml`

Lu par sous-agent ticket-abcde-3512-relecteur :

- `ticket-abcde-3512/agents/ticket-abcde-3512-relecteur.md` : 1 642 car., corps de l'agent, à son invocation
- `ticket-abcde-3512/references/java/revue.md` : 5 033 car., `.gemini/skills/ticket-abcde-3512/references/java/revue.md`
- `ticket-abcde-3512/references/angular/revue.md` : 4 031 car., `.gemini/skills/ticket-abcde-3512/references/angular/revue.md`
- `ticket-abcde-3512/references/java.md` : 13 731 car., `references/java.md`
- `ticket-abcde-3512/references/angular.md` : 13 915 car., `references/angular.md`

Lu par sous-agent ticket-abcde-3512-qualite :

- `ticket-abcde-3512/agents/ticket-abcde-3512-qualite.md` : 1 809 car., corps de l'agent, à son invocation
- `ticket-abcde-3512/references/sonarqube.md` : 21 792 car., `.gemini/skills/ticket-abcde-3512/references/sonarqube.md`
- `ticket-abcde-3512/references/sonarqube/examen-local.md` : 16 755 car., `.gemini/skills/ticket-abcde-3512/references/sonarqube/examen-local.md`

### Observateurs

Lu par observateur ticket-abcde-3512-observateur-2 :

- `ticket-abcde-3512/agents/ticket-abcde-3512-observateur-2.md` : 2 993 car., corps de l'agent, à son invocation
- `ticket-abcde-3512/modules/champ/SKILL.md` : 9 601 car., `.gemini/skills/ticket-abcde-3512/modules/champ/SKILL.md`
- `ticket-abcde-3512/modules/vue/SKILL.md` : 5 270 car., `.gemini/skills/ticket-abcde-3512/modules/vue/SKILL.md`
- `ticket-abcde-3512/modules/methode/SKILL.md` : 13 859 car., `.gemini/skills/ticket-abcde-3512/modules/methode/SKILL.md`
- `vue du nœud ABCDE-3512` : 2 333 car., vue.mjs generer docs/demandes/ABCDE-3512 --noeud ABCDE-3512

Lu par observateur ticket-abcde-3512-observateur-3 :

- `ticket-abcde-3512/agents/ticket-abcde-3512-observateur-3.md` : 2 794 car., corps de l'agent, à son invocation
- `ticket-abcde-3512/modules/champ/SKILL.md` : 9 601 car., `.gemini/skills/ticket-abcde-3512/modules/champ/SKILL.md`
- `ticket-abcde-3512/modules/vue/SKILL.md` : 5 270 car., `.gemini/skills/ticket-abcde-3512/modules/vue/SKILL.md`
- `ticket-abcde-3512/modules/methode/SKILL.md` : 13 859 car., `.gemini/skills/ticket-abcde-3512/modules/methode/SKILL.md`
- `vue du nœud ABCDE-3512` : 2 333 car., vue.mjs generer docs/demandes/ABCDE-3512 --noeud ABCDE-3512
