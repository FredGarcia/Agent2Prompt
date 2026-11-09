# Contexte chargé pour résoudre chaque feuille de ABCDE-3620

Mesure statique et déterministe (prototype « skill de ticket », lot 7, critère P7), produite par `outils/mesurer-contexte.mjs`. Projet mesuré : prototypes/skill-ticket/exemples/ABCDE-3620-resolution. Tailles en caractères ; tokens estimés à un pour 4 caractères.

À l'activation : ce que Gemini CLI charge de lui-même (noms et descriptions des skills et des agents installés, corps du skill activé ; corps d'un agent à son invocation). Au plus : en plus, ce que la consigne fait lire pour résoudre le ticket, sans ce qu'elle fait écrire. Chaque contexte est séparé : la session d'un skill et chaque agent ont le leur.

## Point d'entrée de l'orchestrateur, pour le ticket ABCDE-3620 entier

| Borne | Taille |
|---|---|
| à l'activation | 90 246 car., 22 562 tokens |
| au plus | 250 904 car., 62 726 tokens |

- `orchestrateur-c7e : nom et description` : 1 137 car., chargés au démarrage de Gemini CLI
- `orchestrateur-c7e/SKILL.md` : 89 109 car., corps du skill, à son activation
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., copie du projet du fichier d'invariants, lue au démarrage
- `orchestrateur-c7e/modules/qualification/SKILL.md` : 19 330 car., lu à l'ouverture et à l'analyse de chaque ticket
- `orchestrateur-c7e/modules/referentiel/SKILL.md` : 45 516 car., lu à l'ouverture et à l'analyse de chaque ticket
- `projet/docs/c7e/referentiel-meso-contrats.toml` : 24 852 car., référentiel du projet, écrit à l'identique du modèle à l'installation
- `projet/docs/demandes/ABCDE-3620/ticket.toml` : 3 170 car., le ticket, une instance du référentiel
- `projet/docs/demandes/ABCDE-3620/ABCDE-3620.feature` : 3 482 car., documents de la clé
- `projet/docs/demandes/ABCDE-3620/us.md` : 2 435 car., documents de la clé
- `orchestrateur-c7e/socle/SKILL.md` : 18 589 car., socle, quand le ticket touche son domaine
- `orchestrateur-c7e/references/java.md` : 13 731 car., référentiel d'une couche que le ticket touche
- `orchestrateur-c7e/references/angular.md` : 13 915 car., référentiel d'une couche que le ticket touche

## Feuilles

| Feuille | Session, activation | Session, au plus | Plus grand contexte | Somme des contextes |
|---|---|---|---|---|
| ABCDE-3620-1.1 | 4 010 tokens, 18 % | 23 816 tokens, 38 % | 24 953 tokens, 40 % | 70 190 tokens, 112 % |
| ABCDE-3620-1.2 | 4 254 tokens, 19 % | 25 223 tokens, 40 % | 27 364 tokens, 44 % | 74 484 tokens, 119 % |
| ABCDE-3620-2 | 4 156 tokens, 18 % | 24 262 tokens, 39 % | 25 568 tokens, 41 % | 71 470 tokens, 114 % |

Les pourcentages rapportent chaque taille à celle du point d'entrée de l'orchestrateur, à la même borne pour l'activation, au plus pour le reste. La somme réunit les contextes qui travaillent pour la feuille : sa session, ses agents de couche, ses sous-agents de rôle.

## Arbre entier

| Mesure | Au plus |
|---|---|
| plus grand contexte de l'arbre, session du skill ticket-abcde-3620 | 31 019 tokens, 50 % |
| somme des 20 contextes des 5 nœuds et des observateurs | 311 138 tokens, 496 % |

Aucun contexte de l'arbre ne charge plus que le pourcentage du plus grand ; la somme dit ce que l'arbre lit en tout, quand chaque contexte relit ce qu'il lui faut, au plus.

## Relectures

Sur la somme des contextes de l'arbre, 150 107 tokens (48 %) viennent de fichiers lus dans plusieurs contextes ; lus une seule fois chacun, les fichiers de l'arbre feraient 161 031 tokens, 257 % du point d'entrée de l'orchestrateur.

| Fichier | Contextes qui le lisent | Relu, au plus |
|---|---|---|
| `projet/docs/c7e/meso-contrats.md` | 8 | 27 367 tokens |
| `ticket-abcde-3620/modules/champ/SKILL.md` | 10 | 22 332 tokens |
| `ticket-abcde-3620/references/sonarqube.md` | 3 | 10 896 tokens |
| `ticket-abcde-3620/references/sonarqube/examen-local.md` | 3 | 8 378 tokens |
| `ticket-abcde-3620/modules/vue/SKILL.md` | 7 | 7 911 tokens |
| `ticket-abcde-3620/references/analyse-projet.md` | 3 | 5 014 tokens |
| `vue du nœud ABCDE-3620` | 3 | 4 930 tokens |
| `projet/docs/demandes/ABCDE-3620/ABCDE-3620.feature` | 6 | 4 353 tokens |
| `ticket-abcde-3620/references/agent-tdd-jira/cycle-tdd.md` | 3 | 3 680 tokens |
| `ticket-abcde-3620-2/references/angular.md` | 2 | 3 479 tokens |
| `noms et descriptions des 5 skills et des agents installés` | 5 | 3 472 tokens |
| `ticket-abcde-3620/modules/methode/SKILL.md` | 3 | 3 442 tokens |
| `ticket-abcde-3620-1-1/references/java.md` | 2 | 3 433 tokens |
| `ticket-abcde-3620-1-2/references/java.md` | 2 | 3 433 tokens |
| `ticket-abcde-3620-1-2/SKILL.md` | 2 | 3 386 tokens |
| `ticket-abcde-3620-2/SKILL.md` | 2 | 3 288 tokens |
| `ticket-abcde-3620/references/analyse-projet/cartographie.md` | 3 | 3 279 tokens |
| `ticket-abcde-3620-1-2/ticket.toml` | 4 | 3 241 tokens |
| `ticket-abcde-3620-1-1/SKILL.md` | 2 | 3 142 tokens |
| `ticket-abcde-3620-1-1/modules/invariants/SKILL.md` | 2 | 2 779 tokens |
| `ticket-abcde-3620-1-2/modules/invariants/SKILL.md` | 2 | 2 779 tokens |
| `ticket-abcde-3620-2/modules/invariants/SKILL.md` | 2 | 2 777 tokens |
| `ticket-abcde-3620/references/java/revue.md` | 3 | 2 517 tokens |
| `ticket-abcde-3620-2/ticket.toml` | 4 | 2 333 tokens |
| `ticket-abcde-3620/references/angular/revue.md` | 3 | 2 016 tokens |
| `ticket-abcde-3620/modules/documents/SKILL.md` | 2 | 1 975 tokens |
| `ticket-abcde-3620-1-1/ticket.toml` | 4 | 1 815 tokens |
| `ticket-abcde-3620/agents/ticket-abcde-3620-analyste.md` | 3 | 945 tokens |
| `ticket-abcde-3620/agents/ticket-abcde-3620-qualite.md` | 3 | 905 tokens |
| `ticket-abcde-3620/agents/ticket-abcde-3620-relecteur.md` | 3 | 821 tokens |

## Racine et nœuds intermédiaires

Ils coordonnent leurs sous-tickets, ratifient et, pour la racine, font rédiger les documents de la clé ; mesurés hors des sommes par feuille.

| Nœud | Session, au plus | Somme des contextes |
|---|---|---|
| ABCDE-3620, racine | 31 019 tokens, 50 % | 57 011 tokens, 91 % |
| ABCDE-3620-1, composé | 20 567 tokens, 33 % | 20 567 tokens, 33 % |

## Observateurs de l'arbre, sur attente

Invoqués par le skill d'un nœud quand le champ attend une observation d'ordre 2 ou 3 ; mesurés une fois pour l'arbre, hors des sommes par nœud.

| Contexte | À l'activation | Au plus |
|---|---|---|
| observateur ticket-abcde-3620-observateur-2 | 2 993 car., 749 tokens | 34 934 car., 8 734 tokens |
| observateur ticket-abcde-3620-observateur-3 | 2 794 car., 699 tokens | 34 735 car., 8 684 tokens |

## Détail par nœud

### ABCDE-3620, racine

| Contexte | À l'activation | Au plus |
|---|---|---|
| session du skill ticket-abcde-3620 | 19 475 car., 4 869 tokens | 124 074 car., 31 019 tokens |
| sous-agent ticket-abcde-3620-redacteur | 2 831 car., 708 tokens | 103 968 car., 25 992 tokens |

Lu par session du skill ticket-abcde-3620 :

- `noms et descriptions des 5 skills et des agents installés` : 3 472 car., chargés au démarrage de Gemini CLI
- `ticket-abcde-3620/SKILL.md` : 16 003 car., corps du skill, à son activation
- `ticket-abcde-3620/modules/meso-contrats/SKILL.md` : 2 047 car., module `meso-contrats`
- `ticket-abcde-3620/modules/vue/SKILL.md` : 5 274 car., modules `vue` et `champ` du skill racine
- `ticket-abcde-3620/modules/champ/SKILL.md` : 9 925 car., modules `vue` et `champ` du skill racine
- `ticket-abcde-3620/modules/documents/SKILL.md` : 7 897 car., module `documents`
- `ticket-abcde-3620/modules/sous-tickets/SKILL.md` : 2 116 car., module `sous-tickets`
- `ticket-abcde-3620/modules/recette/SKILL.md` : 1 584 car., modules `sous-tickets` et `recette`
- `ticket-abcde-3620/modules/kits/SKILL.md` : 7 403 car., module `kits`
- `ticket-abcde-3620/modules/invariants/SKILL.md` : 11 203 car., module `invariants`
- `ticket-abcde-3620/modules/methode/SKILL.md` : 6 883 car., module `methode`
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., `docs/c7e/meso-contrats.md`
- `ticket-abcde-3620/projet/meso-contrats.md` : 15 638 car., `projet/meso-contrats.md`
- `projet/docs/demandes/ABCDE-3620/us.md` : 2 435 car., `docs/demandes/ABCDE-3620/us.md`
- `ticket-abcde-3620/references/agent-tdd-jira/tracabilite.md` : 6 697 car., `references/agent-tdd-jira/tracabilite.md`
- `vue du nœud ABCDE-3620` : 9 859 car., vue.mjs generer docs/demandes/ABCDE-3620 --noeud ABCDE-3620

Lu par sous-agent ticket-abcde-3620-redacteur :

- `ticket-abcde-3620/agents/ticket-abcde-3620-redacteur.md` : 2 831 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/modules/documents/SKILL.md` : 7 897 car., module `documents`
- `ticket-abcde-3620/references/agent-tdd-jira.md` : 26 099 car., `.gemini/skills/ticket-abcde-3620/references/agent-tdd-jira.md`
- `ticket-abcde-3620/references/agent-tdd-jira/ingestion-jira.md` : 15 829 car., `.gemini/skills/ticket-abcde-3620/references/agent-tdd-jira/ingestion-jira.md`
- `ticket-abcde-3620/references/agent-tdd-jira/us-criteres.md` : 22 037 car., `.gemini/skills/ticket-abcde-3620/references/agent-tdd-jira/us-criteres.md`
- `ticket-abcde-3620/references/agent-tdd-jira/analyse-demande.md` : 9 698 car., `.gemini/skills/ticket-abcde-3620/references/agent-tdd-jira/analyse-demande.md`
- `ticket-abcde-3620/references/agent-tdd-jira/binome-agent2test.md` : 3 760 car., `.gemini/skills/ticket-abcde-3620/references/agent-tdd-jira/binome-agent2test.md`
- `ticket-abcde-3620/ticket.toml` : 3 170 car., `.gemini/skills/ticket-abcde-3620/ticket.toml`
- `ticket-abcde-3620-1/ticket.toml` : 2 797 car., `.gemini/skills/<skill du sous-ticket>/ticket.toml`
- `ticket-abcde-3620-1-1/ticket.toml` : 2 419 car., `.gemini/skills/<skill du sous-ticket>/ticket.toml`
- `ticket-abcde-3620-1-2/ticket.toml` : 4 321 car., `.gemini/skills/<skill du sous-ticket>/ticket.toml`
- `ticket-abcde-3620-2/ticket.toml` : 3 110 car., `.gemini/skills/<skill du sous-ticket>/ticket.toml`

### ABCDE-3620-1, composé

| Contexte | À l'activation | Au plus |
|---|---|---|
| session du skill ticket-abcde-3620-1 | 11 736 car., 2 934 tokens | 82 267 car., 20 567 tokens |

Lu par session du skill ticket-abcde-3620-1 :

- `noms et descriptions des 5 skills et des agents installés` : 3 472 car., chargés au démarrage de Gemini CLI
- `ticket-abcde-3620-1/SKILL.md` : 8 264 car., corps du skill, à son activation
- `ticket-abcde-3620-1/modules/meso-contrats/SKILL.md` : 1 967 car., module `meso-contrats`
- `ticket-abcde-3620/modules/vue/SKILL.md` : 5 274 car., modules `vue` et `champ` du skill racine
- `ticket-abcde-3620/modules/champ/SKILL.md` : 9 925 car., modules `vue` et `champ` du skill racine
- `ticket-abcde-3620-1/modules/sous-tickets/SKILL.md` : 1 920 car., module `sous-tickets`
- `ticket-abcde-3620-1/modules/recette/SKILL.md` : 1 718 car., module `recette`
- `ticket-abcde-3620-1/modules/invariants/SKILL.md` : 10 955 car., module `invariants`
- `ticket-abcde-3620-1/modules/methode/SKILL.md` : 913 car., module `methode`
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., `docs/c7e/meso-contrats.md`
- `ticket-abcde-3620-1/projet/meso-contrats.md` : 15 638 car., `projet/meso-contrats.md`
- `vue du nœud ABCDE-3620-1` : 6 583 car., vue.mjs generer docs/demandes/ABCDE-3620 --noeud ABCDE-3620-1

### ABCDE-3620-1.1, feuille

| Contexte | À l'activation | Au plus |
|---|---|---|
| session du skill ticket-abcde-3620-1-1 | 16 038 car., 4 010 tokens | 95 263 car., 23 816 tokens |
| agent ticket-abcde-3620-1-1-persistance | 3 318 car., 830 tokens | 99 809 car., 24 953 tokens |
| sous-agent ticket-abcde-3620-analyste | 1 890 car., 473 tokens | 20 894 car., 5 224 tokens |
| sous-agent ticket-abcde-3620-relecteur | 1 642 car., 411 tokens | 24 437 car., 6 110 tokens |
| sous-agent ticket-abcde-3620-qualite | 1 809 car., 453 tokens | 40 356 car., 10 089 tokens |

Lu par session du skill ticket-abcde-3620-1-1 :

- `noms et descriptions des 5 skills et des agents installés` : 3 472 car., chargés au démarrage de Gemini CLI
- `ticket-abcde-3620-1-1/SKILL.md` : 12 566 car., corps du skill, à son activation
- `ticket-abcde-3620-1-1/modules/meso-contrats/SKILL.md` : 1 306 car., module `meso-contrats`
- `ticket-abcde-3620/modules/vue/SKILL.md` : 5 274 car., modules `vue` et `champ` du skill racine
- `ticket-abcde-3620/modules/champ/SKILL.md` : 9 925 car., modules `vue` et `champ` du skill racine
- `ticket-abcde-3620-1-1/modules/methode/SKILL.md` : 9 494 car., module `methode`
- `ticket-abcde-3620-1-1/modules/recette/SKILL.md` : 2 539 car., module `recette`
- `ticket-abcde-3620-1-1/modules/invariants/SKILL.md` : 11 115 car., module `invariants`
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., `docs/c7e/meso-contrats.md`
- `ticket-abcde-3620-1-1/projet/meso-contrats.md` : 15 638 car., `projet/meso-contrats.md`
- `ticket-abcde-3620-1-1/ticket.toml` : 2 419 car., `ticket.toml`
- `projet/docs/demandes/ABCDE-3620/ABCDE-3620.feature` : 3 482 car., `docs/demandes/ABCDE-3620/ABCDE-3620.feature`
- `vue du nœud ABCDE-3620-1.1` : 2 395 car., vue.mjs generer docs/demandes/ABCDE-3620 --noeud ABCDE-3620-1.1

Lu par agent ticket-abcde-3620-1-1-persistance :

- `ticket-abcde-3620-1-1/agents/ticket-abcde-3620-1-1-persistance.md` : 3 318 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/modules/champ/SKILL.md` : 9 925 car., module `champ` du skill racine
- `ticket-abcde-3620-1-1/SKILL.md` : 12 870 car., `.gemini/skills/ticket-abcde-3620-1-1/SKILL.md`
- `ticket-abcde-3620-1-1/ticket.toml` : 2 419 car., `.gemini/skills/ticket-abcde-3620-1-1/ticket.toml`
- `ticket-abcde-3620-1-1/modules/option-persistance-crud/SKILL.md` : 1 363 car., `.gemini/skills/ticket-abcde-3620-1-1/modules/option-persistance-crud/SKILL.md`
- `projet/docs/demandes/ABCDE-3620/ABCDE-3620.feature` : 3 482 car., `docs/demandes/ABCDE-3620/ABCDE-3620.feature`
- `ticket-abcde-3620/references/agent-tdd-jira/cycle-tdd.md` : 7 359 car., `.gemini/skills/ticket-abcde-3620/references/agent-tdd-jira/cycle-tdd.md`
- `ticket-abcde-3620-1-1/modules/invariants/SKILL.md` : 11 115 car., `.gemini/skills/ticket-abcde-3620-1-1/modules/invariants/SKILL.md`
- `ticket-abcde-3620-1-1/socle/SKILL.md` : 18 589 car., `.gemini/skills/ticket-abcde-3620-1-1/socle/SKILL.md`
- `ticket-abcde-3620-1-1/references/java.md` : 13 731 car., `.gemini/skills/ticket-abcde-3620-1-1/references/java.md`
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., copie du projet du fichier d'invariants

Lu par sous-agent ticket-abcde-3620-analyste :

- `ticket-abcde-3620/agents/ticket-abcde-3620-analyste.md` : 1 890 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/references/analyse-projet.md` : 10 027 car., `.gemini/skills/ticket-abcde-3620/references/analyse-projet.md`
- `ticket-abcde-3620/references/analyse-projet/cartographie.md` : 6 558 car., `.gemini/skills/ticket-abcde-3620/references/analyse-projet/cartographie.md`
- `ticket-abcde-3620-1-1/ticket.toml` : 2 419 car., `ticket.toml`

Lu par sous-agent ticket-abcde-3620-relecteur :

- `ticket-abcde-3620/agents/ticket-abcde-3620-relecteur.md` : 1 642 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/references/java/revue.md` : 5 033 car., `.gemini/skills/ticket-abcde-3620/references/java/revue.md`
- `ticket-abcde-3620/references/angular/revue.md` : 4 031 car., `.gemini/skills/ticket-abcde-3620/references/angular/revue.md`
- `ticket-abcde-3620-1-1/references/java.md` : 13 731 car., `references/java.md`

Lu par sous-agent ticket-abcde-3620-qualite :

- `ticket-abcde-3620/agents/ticket-abcde-3620-qualite.md` : 1 809 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/references/sonarqube.md` : 21 792 car., `.gemini/skills/ticket-abcde-3620/references/sonarqube.md`
- `ticket-abcde-3620/references/sonarqube/examen-local.md` : 16 755 car., `.gemini/skills/ticket-abcde-3620/references/sonarqube/examen-local.md`

### ABCDE-3620-1.2, feuille

| Contexte | À l'activation | Au plus |
|---|---|---|
| session du skill ticket-abcde-3620-1-2 | 17 015 car., 4 254 tokens | 100 889 car., 25 223 tokens |
| agent ticket-abcde-3620-1-2-back | 3 657 car., 915 tokens | 109 455 car., 27 364 tokens |
| sous-agent ticket-abcde-3620-analyste | 1 890 car., 473 tokens | 22 796 car., 5 699 tokens |
| sous-agent ticket-abcde-3620-relecteur | 1 642 car., 411 tokens | 24 437 car., 6 110 tokens |
| sous-agent ticket-abcde-3620-qualite | 1 809 car., 453 tokens | 40 356 car., 10 089 tokens |

Lu par session du skill ticket-abcde-3620-1-2 :

- `noms et descriptions des 5 skills et des agents installés` : 3 472 car., chargés au démarrage de Gemini CLI
- `ticket-abcde-3620-1-2/SKILL.md` : 13 543 car., corps du skill, à son activation
- `ticket-abcde-3620-1-2/modules/meso-contrats/SKILL.md` : 1 791 car., module `meso-contrats`
- `ticket-abcde-3620/modules/vue/SKILL.md` : 5 274 car., modules `vue` et `champ` du skill racine
- `ticket-abcde-3620/modules/champ/SKILL.md` : 9 925 car., modules `vue` et `champ` du skill racine
- `ticket-abcde-3620-1-2/modules/methode/SKILL.md` : 9 494 car., module `methode`
- `ticket-abcde-3620-1-2/modules/recette/SKILL.md` : 3 231 car., module `recette`
- `ticket-abcde-3620-1-2/modules/invariants/SKILL.md` : 11 115 car., module `invariants`
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., `docs/c7e/meso-contrats.md`
- `ticket-abcde-3620-1-2/projet/meso-contrats.md` : 15 638 car., `projet/meso-contrats.md`
- `ticket-abcde-3620-1-2/ticket.toml` : 4 321 car., `ticket.toml`
- `projet/docs/demandes/ABCDE-3620/ABCDE-3620.feature` : 3 482 car., `docs/demandes/ABCDE-3620/ABCDE-3620.feature`
- `vue du nœud ABCDE-3620-1.2` : 3 965 car., vue.mjs generer docs/demandes/ABCDE-3620 --noeud ABCDE-3620-1.2

Lu par agent ticket-abcde-3620-1-2-back :

- `ticket-abcde-3620-1-2/agents/ticket-abcde-3620-1-2-back.md` : 3 657 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/modules/champ/SKILL.md` : 9 925 car., module `champ` du skill racine
- `ticket-abcde-3620-1-2/SKILL.md` : 13 864 car., `.gemini/skills/ticket-abcde-3620-1-2/SKILL.md`
- `ticket-abcde-3620-1-2/ticket.toml` : 4 321 car., `.gemini/skills/ticket-abcde-3620-1-2/ticket.toml`
- `ticket-abcde-3620-1-2/modules/option-backend-endpoints/SKILL.md` : 1 327 car., `.gemini/skills/ticket-abcde-3620-1-2/modules/option-backend-endpoints/SKILL.md`
- `ticket-abcde-3620-1-2/modules/option-backend-representations/SKILL.md` : 3 851 car., `.gemini/skills/ticket-abcde-3620-1-2/modules/option-backend-representations/SKILL.md`
- `ticket-abcde-3620-1-2/modules/option-backend-evenements/SKILL.md` : 2 596 car., `.gemini/skills/ticket-abcde-3620-1-2/modules/option-backend-evenements/SKILL.md`
- `projet/docs/demandes/ABCDE-3620/ABCDE-3620.feature` : 3 482 car., `docs/demandes/ABCDE-3620/ABCDE-3620.feature`
- `ticket-abcde-3620/references/agent-tdd-jira/cycle-tdd.md` : 7 359 car., `.gemini/skills/ticket-abcde-3620/references/agent-tdd-jira/cycle-tdd.md`
- `ticket-abcde-3620-1-2/modules/invariants/SKILL.md` : 11 115 car., `.gemini/skills/ticket-abcde-3620-1-2/modules/invariants/SKILL.md`
- `ticket-abcde-3620-1-2/socle/SKILL.md` : 18 589 car., `.gemini/skills/ticket-abcde-3620-1-2/socle/SKILL.md`
- `ticket-abcde-3620-1-2/references/java.md` : 13 731 car., `.gemini/skills/ticket-abcde-3620-1-2/references/java.md`
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., copie du projet du fichier d'invariants

Lu par sous-agent ticket-abcde-3620-analyste :

- `ticket-abcde-3620/agents/ticket-abcde-3620-analyste.md` : 1 890 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/references/analyse-projet.md` : 10 027 car., `.gemini/skills/ticket-abcde-3620/references/analyse-projet.md`
- `ticket-abcde-3620/references/analyse-projet/cartographie.md` : 6 558 car., `.gemini/skills/ticket-abcde-3620/references/analyse-projet/cartographie.md`
- `ticket-abcde-3620-1-2/ticket.toml` : 4 321 car., `ticket.toml`

Lu par sous-agent ticket-abcde-3620-relecteur :

- `ticket-abcde-3620/agents/ticket-abcde-3620-relecteur.md` : 1 642 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/references/java/revue.md` : 5 033 car., `.gemini/skills/ticket-abcde-3620/references/java/revue.md`
- `ticket-abcde-3620/references/angular/revue.md` : 4 031 car., `.gemini/skills/ticket-abcde-3620/references/angular/revue.md`
- `ticket-abcde-3620-1-2/references/java.md` : 13 731 car., `references/java.md`

Lu par sous-agent ticket-abcde-3620-qualite :

- `ticket-abcde-3620/agents/ticket-abcde-3620-qualite.md` : 1 809 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/references/sonarqube.md` : 21 792 car., `.gemini/skills/ticket-abcde-3620/references/sonarqube.md`
- `ticket-abcde-3620/references/sonarqube/examen-local.md` : 16 755 car., `.gemini/skills/ticket-abcde-3620/references/sonarqube/examen-local.md`

### ABCDE-3620-2, feuille

| Contexte | À l'activation | Au plus |
|---|---|---|
| session du skill ticket-abcde-3620-2 | 16 622 car., 4 156 tokens | 97 048 car., 24 262 tokens |
| agent ticket-abcde-3620-2-front | 3 794 car., 949 tokens | 102 269 car., 25 568 tokens |
| sous-agent ticket-abcde-3620-analyste | 1 890 car., 473 tokens | 21 585 car., 5 397 tokens |
| sous-agent ticket-abcde-3620-relecteur | 1 642 car., 411 tokens | 24 621 car., 6 156 tokens |
| sous-agent ticket-abcde-3620-qualite | 1 809 car., 453 tokens | 40 356 car., 10 089 tokens |

Lu par session du skill ticket-abcde-3620-2 :

- `noms et descriptions des 5 skills et des agents installés` : 3 472 car., chargés au démarrage de Gemini CLI
- `ticket-abcde-3620-2/SKILL.md` : 13 150 car., corps du skill, à son activation
- `ticket-abcde-3620-2/modules/meso-contrats/SKILL.md` : 1 450 car., module `meso-contrats`
- `ticket-abcde-3620/modules/vue/SKILL.md` : 5 274 car., modules `vue` et `champ` du skill racine
- `ticket-abcde-3620/modules/champ/SKILL.md` : 9 925 car., modules `vue` et `champ` du skill racine
- `ticket-abcde-3620-2/modules/methode/SKILL.md` : 9 490 car., module `methode`
- `ticket-abcde-3620-2/modules/recette/SKILL.md` : 2 657 car., module `recette`
- `ticket-abcde-3620-2/modules/invariants/SKILL.md` : 11 105 car., module `invariants`
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., `docs/c7e/meso-contrats.md`
- `ticket-abcde-3620-2/projet/meso-contrats.md` : 15 638 car., `projet/meso-contrats.md`
- `ticket-abcde-3620-2/ticket.toml` : 3 110 car., `ticket.toml`
- `projet/docs/demandes/ABCDE-3620/ABCDE-3620.feature` : 3 482 car., `docs/demandes/ABCDE-3620/ABCDE-3620.feature`
- `vue du nœud ABCDE-3620-2` : 2 657 car., vue.mjs generer docs/demandes/ABCDE-3620 --noeud ABCDE-3620-2

Lu par agent ticket-abcde-3620-2-front :

- `ticket-abcde-3620-2/agents/ticket-abcde-3620-2-front.md` : 3 794 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/modules/champ/SKILL.md` : 9 925 car., module `champ` du skill racine
- `ticket-abcde-3620-2/SKILL.md` : 13 457 car., `.gemini/skills/ticket-abcde-3620-2/SKILL.md`
- `ticket-abcde-3620-2/ticket.toml` : 3 110 car., `.gemini/skills/ticket-abcde-3620-2/ticket.toml`
- `ticket-abcde-3620-2/modules/option-frontend-elements_graphiques/SKILL.md` : 903 car., `.gemini/skills/ticket-abcde-3620-2/modules/option-frontend-elements_graphiques/SKILL.md`
- `ticket-abcde-3620-2/modules/option-frontend-fonctionnalites/SKILL.md` : 992 car., `.gemini/skills/ticket-abcde-3620-2/modules/option-frontend-fonctionnalites/SKILL.md`
- `projet/docs/demandes/ABCDE-3620/ABCDE-3620.feature` : 3 482 car., `docs/demandes/ABCDE-3620/ABCDE-3620.feature`
- `ticket-abcde-3620/references/agent-tdd-jira/cycle-tdd.md` : 7 359 car., `.gemini/skills/ticket-abcde-3620/references/agent-tdd-jira/cycle-tdd.md`
- `ticket-abcde-3620-2/modules/invariants/SKILL.md` : 11 105 car., `.gemini/skills/ticket-abcde-3620-2/modules/invariants/SKILL.md`
- `ticket-abcde-3620-2/socle/SKILL.md` : 18 589 car., `.gemini/skills/ticket-abcde-3620-2/socle/SKILL.md`
- `ticket-abcde-3620-2/references/angular.md` : 13 915 car., `.gemini/skills/ticket-abcde-3620-2/references/angular.md`
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., copie du projet du fichier d'invariants

Lu par sous-agent ticket-abcde-3620-analyste :

- `ticket-abcde-3620/agents/ticket-abcde-3620-analyste.md` : 1 890 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/references/analyse-projet.md` : 10 027 car., `.gemini/skills/ticket-abcde-3620/references/analyse-projet.md`
- `ticket-abcde-3620/references/analyse-projet/cartographie.md` : 6 558 car., `.gemini/skills/ticket-abcde-3620/references/analyse-projet/cartographie.md`
- `ticket-abcde-3620-2/ticket.toml` : 3 110 car., `ticket.toml`

Lu par sous-agent ticket-abcde-3620-relecteur :

- `ticket-abcde-3620/agents/ticket-abcde-3620-relecteur.md` : 1 642 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/references/java/revue.md` : 5 033 car., `.gemini/skills/ticket-abcde-3620/references/java/revue.md`
- `ticket-abcde-3620/references/angular/revue.md` : 4 031 car., `.gemini/skills/ticket-abcde-3620/references/angular/revue.md`
- `ticket-abcde-3620-2/references/angular.md` : 13 915 car., `references/angular.md`

Lu par sous-agent ticket-abcde-3620-qualite :

- `ticket-abcde-3620/agents/ticket-abcde-3620-qualite.md` : 1 809 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/references/sonarqube.md` : 21 792 car., `.gemini/skills/ticket-abcde-3620/references/sonarqube.md`
- `ticket-abcde-3620/references/sonarqube/examen-local.md` : 16 755 car., `.gemini/skills/ticket-abcde-3620/references/sonarqube/examen-local.md`

### Observateurs

Lu par observateur ticket-abcde-3620-observateur-2 :

- `ticket-abcde-3620/agents/ticket-abcde-3620-observateur-2.md` : 2 993 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/modules/champ/SKILL.md` : 9 925 car., `.gemini/skills/ticket-abcde-3620/modules/champ/SKILL.md`
- `ticket-abcde-3620/modules/vue/SKILL.md` : 5 274 car., `.gemini/skills/ticket-abcde-3620/modules/vue/SKILL.md`
- `ticket-abcde-3620/modules/methode/SKILL.md` : 6 883 car., `.gemini/skills/ticket-abcde-3620/modules/methode/SKILL.md`
- `vue du nœud ABCDE-3620` : 9 859 car., vue.mjs generer docs/demandes/ABCDE-3620 --noeud ABCDE-3620

Lu par observateur ticket-abcde-3620-observateur-3 :

- `ticket-abcde-3620/agents/ticket-abcde-3620-observateur-3.md` : 2 794 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/modules/champ/SKILL.md` : 9 925 car., `.gemini/skills/ticket-abcde-3620/modules/champ/SKILL.md`
- `ticket-abcde-3620/modules/vue/SKILL.md` : 5 274 car., `.gemini/skills/ticket-abcde-3620/modules/vue/SKILL.md`
- `ticket-abcde-3620/modules/methode/SKILL.md` : 6 883 car., `.gemini/skills/ticket-abcde-3620/modules/methode/SKILL.md`
- `vue du nœud ABCDE-3620` : 9 859 car., vue.mjs generer docs/demandes/ABCDE-3620 --noeud ABCDE-3620
