# Contexte chargé pour résoudre chaque feuille de ABCDE-3620

Mesure statique et déterministe (generateur-skill-ticket, critère P7), produite par `outils/mesurer-contexte.mjs`. Projet mesuré : specs/generateur-skill-ticket/exemples/ABCDE-3620-resolution. Tailles en caractères ; tokens estimés à un pour 4 caractères.

À l'activation : ce que Gemini CLI charge de lui-même (noms et descriptions des skills et des agents installés, corps du skill activé ; corps d'un agent à son invocation). Au plus : en plus, ce que la consigne fait lire pour résoudre le ticket, sans ce qu'elle fait écrire. Chaque contexte est séparé : la session d'un skill et chaque agent ont le leur.

## Point d'entrée de l'orchestrateur, pour le ticket ABCDE-3620 entier

| Borne | Taille |
|---|---|
| à l'activation | 100 293 car., 25 074 tokens |
| au plus | 260 951 car., 65 238 tokens |

- `orchestrateur-c7e : nom et description` : 1 227 car., chargés au démarrage de Gemini CLI
- `orchestrateur-c7e/SKILL.md` : 99 066 car., corps du skill, à son activation
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
| ABCDE-3620-1.1 | 4 070 tokens, 16 % | 19 132 tokens, 29 % | 21 411 tokens, 33 % | 61 982 tokens, 95 % |
| ABCDE-3620-1.2 | 4 314 tokens, 17 % | 20 538 tokens, 32 % | 23 784 tokens, 37 % | 66 237 tokens, 101 % |
| ABCDE-3620-2 | 4 216 tokens, 17 % | 19 578 tokens, 30 % | 21 949 tokens, 34 % | 63 185 tokens, 97 % |

Les pourcentages rapportent chaque taille à celle du point d'entrée de l'orchestrateur, à la même borne pour l'activation, au plus pour le reste. La somme réunit les contextes qui travaillent pour la feuille : sa session, ses agents de couche, ses sous-agents de rôle.

## Arbre entier

| Mesure | Au plus |
|---|---|
| plus grand contexte de l'arbre, session du skill ticket-abcde-3620 | 28 086 tokens, 43 % |
| somme des 20 contextes des 5 nœuds et des observateurs | 278 783 tokens, 427 % |

Aucun contexte de l'arbre ne charge plus que le pourcentage du plus grand ; la somme dit ce que l'arbre lit en tout, quand chaque contexte relit ce qu'il lui faut, au plus.

## Relectures

Sur la somme des contextes de l'arbre, 132 814 tokens (48 %) viennent de fichiers lus dans plusieurs contextes ; lus une seule fois chacun, les fichiers de l'arbre feraient 145 969 tokens, 224 % du point d'entrée de l'orchestrateur.

| Fichier | Contextes qui le lisent | Relu, au plus |
|---|---|---|
| `projet/docs/c7e/meso-contrats.md` | 8 | 27 367 tokens |
| `ticket-abcde-3620/references/sonarqube.md` | 3 | 10 896 tokens |
| `ticket-abcde-3620/references/sonarqube/examen-local.md` | 3 | 8 378 tokens |
| `ticket-abcde-3620/modules/vue/SKILL.md` | 7 | 7 911 tokens |
| `ticket-abcde-3620/modules/champ-depot/SKILL.md` | 7 | 7 577 tokens |
| `ticket-abcde-3620/references/analyse-projet.md` | 3 | 5 014 tokens |
| `ticket-abcde-3620/modules/champ/SKILL.md` | 3 | 4 963 tokens |
| `vue du nœud ABCDE-3620` | 3 | 4 930 tokens |
| `projet/docs/demandes/ABCDE-3620/ABCDE-3620.feature` | 6 | 4 353 tokens |
| `ticket-abcde-3620/references/agent-tdd-jira/cycle-tdd.md` | 3 | 3 680 tokens |
| `ticket-abcde-3620-2/references/angular.md` | 2 | 3 479 tokens |
| `noms et descriptions des 5 skills et des agents installés` | 5 | 3 458 tokens |
| `ticket-abcde-3620/modules/methode/SKILL.md` | 3 | 3 442 tokens |
| `ticket-abcde-3620-1-1/references/java.md` | 2 | 3 433 tokens |
| `ticket-abcde-3620-1-2/references/java.md` | 2 | 3 433 tokens |
| `ticket-abcde-3620/references/analyse-projet/cartographie.md` | 3 | 3 279 tokens |
| `ticket-abcde-3620-1-2/ticket.toml` | 4 | 3 241 tokens |
| `ticket-abcde-3620-1-1/modules/invariants/SKILL.md` | 2 | 3 163 tokens |
| `ticket-abcde-3620-1-2/modules/invariants/SKILL.md` | 2 | 3 163 tokens |
| `ticket-abcde-3620-2/modules/invariants/SKILL.md` | 2 | 3 160 tokens |
| `ticket-abcde-3620/references/java/revue.md` | 3 | 2 517 tokens |
| `ticket-abcde-3620-2/ticket.toml` | 4 | 2 333 tokens |
| `ticket-abcde-3620/references/angular/revue.md` | 3 | 2 016 tokens |
| `ticket-abcde-3620/modules/documents/SKILL.md` | 2 | 1 980 tokens |
| `ticket-abcde-3620-1-1/ticket.toml` | 4 | 1 815 tokens |
| `ticket-abcde-3620/agents/ticket-abcde-3620-analyste.md` | 3 | 945 tokens |
| `ticket-abcde-3620/agents/ticket-abcde-3620-qualite.md` | 3 | 905 tokens |
| `ticket-abcde-3620/agents/ticket-abcde-3620-relecteur.md` | 3 | 857 tokens |
| `ticket-abcde-3620-1-2/modules/meso-contrats/SKILL.md` | 2 | 448 tokens |
| `ticket-abcde-3620-2/modules/meso-contrats/SKILL.md` | 2 | 363 tokens |
| `ticket-abcde-3620-1-1/modules/meso-contrats/SKILL.md` | 2 | 327 tokens |

## Racine et nœuds intermédiaires

Ils coordonnent leurs sous-tickets, ratifient et, pour la racine, font rédiger les documents de la clé ; mesurés hors des sommes par feuille.

| Nœud | Session, au plus | Somme des contextes |
|---|---|---|
| ABCDE-3620, racine | 28 086 tokens, 43 % | 54 083 tokens, 83 % |
| ABCDE-3620-1, composé | 15 880 tokens, 24 % | 15 880 tokens, 24 % |

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
| session du skill ticket-abcde-3620 | 21 531 car., 5 383 tokens | 112 342 car., 28 086 tokens |
| sous-agent ticket-abcde-3620-redacteur | 2 831 car., 708 tokens | 103 988 car., 25 997 tokens |

Lu par session du skill ticket-abcde-3620 :

- `noms et descriptions des 5 skills et des agents installés` : 3 458 car., chargés au démarrage de Gemini CLI
- `ticket-abcde-3620/SKILL.md` : 18 073 car., corps du skill, à son activation
- `ticket-abcde-3620/modules/meso-contrats/SKILL.md` : 2 047 car., module `meso-contrats`
- `ticket-abcde-3620/modules/vue/SKILL.md` : 5 274 car., modules `vue` et `champ` du skill racine
- `ticket-abcde-3620/modules/champ/SKILL.md` : 9 925 car., modules `vue` et `champ` du skill racine
- `ticket-abcde-3620/modules/documents/SKILL.md` : 7 917 car., module `documents`
- `ticket-abcde-3620/modules/sous-tickets/SKILL.md` : 2 116 car., module `sous-tickets`
- `ticket-abcde-3620/modules/recette/SKILL.md` : 1 584 car., modules `sous-tickets` et `recette`
- `ticket-abcde-3620/modules/kits/SKILL.md` : 7 699 car., module `kits`
- `ticket-abcde-3620/modules/invariants/SKILL.md` : 12 737 car., module `invariants`
- `ticket-abcde-3620/modules/methode/SKILL.md` : 6 883 car., module `methode`
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., `docs/c7e/meso-contrats.md`
- `projet/docs/demandes/ABCDE-3620/us.md` : 2 435 car., `docs/demandes/ABCDE-3620/us.md`
- `ticket-abcde-3620/references/agent-tdd-jira/tracabilite.md` : 6 697 car., `references/agent-tdd-jira/tracabilite.md`
- `vue du nœud ABCDE-3620` : 9 859 car., vue.mjs generer docs/demandes/ABCDE-3620 --noeud ABCDE-3620

Lu par sous-agent ticket-abcde-3620-redacteur :

- `ticket-abcde-3620/agents/ticket-abcde-3620-redacteur.md` : 2 831 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/modules/documents/SKILL.md` : 7 917 car., module `documents`
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
| session du skill ticket-abcde-3620-1 | 11 964 car., 2 991 tokens | 63 517 car., 15 880 tokens |

Lu par session du skill ticket-abcde-3620-1 :

- `noms et descriptions des 5 skills et des agents installés` : 3 458 car., chargés au démarrage de Gemini CLI
- `ticket-abcde-3620-1/SKILL.md` : 8 506 car., corps du skill, à son activation
- `ticket-abcde-3620-1/modules/meso-contrats/SKILL.md` : 1 967 car., module `meso-contrats`
- `ticket-abcde-3620/modules/vue/SKILL.md` : 5 274 car., modules `vue` et `champ-depot` du skill racine
- `ticket-abcde-3620/modules/champ-depot/SKILL.md` : 5 051 car., modules `vue` et `champ-depot` du skill racine
- `ticket-abcde-3620-1/modules/sous-tickets/SKILL.md` : 1 920 car., module `sous-tickets`
- `ticket-abcde-3620-1/modules/recette/SKILL.md` : 1 718 car., module `recette`
- `ticket-abcde-3620-1/modules/invariants/SKILL.md` : 12 489 car., module `invariants`
- `ticket-abcde-3620-1/modules/methode/SKILL.md` : 913 car., module `methode`
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., `docs/c7e/meso-contrats.md`
- `vue du nœud ABCDE-3620-1` : 6 583 car., vue.mjs generer docs/demandes/ABCDE-3620 --noeud ABCDE-3620-1

### ABCDE-3620-1.1, feuille

| Contexte | À l'activation | Au plus |
|---|---|---|
| session du skill ticket-abcde-3620-1-1 | 16 279 car., 4 070 tokens | 76 526 car., 19 132 tokens |
| agent ticket-abcde-3620-1-1-persistance | 4 056 car., 1 014 tokens | 85 643 car., 21 411 tokens |
| sous-agent ticket-abcde-3620-analyste | 1 890 car., 473 tokens | 20 894 car., 5 224 tokens |
| sous-agent ticket-abcde-3620-relecteur | 1 714 car., 429 tokens | 24 509 car., 6 128 tokens |
| sous-agent ticket-abcde-3620-qualite | 1 809 car., 453 tokens | 40 356 car., 10 089 tokens |

Lu par session du skill ticket-abcde-3620-1-1 :

- `noms et descriptions des 5 skills et des agents installés` : 3 458 car., chargés au démarrage de Gemini CLI
- `ticket-abcde-3620-1-1/SKILL.md` : 12 821 car., corps du skill, à son activation
- `ticket-abcde-3620-1-1/modules/meso-contrats/SKILL.md` : 1 306 car., module `meso-contrats`
- `ticket-abcde-3620/modules/vue/SKILL.md` : 5 274 car., modules `vue` et `champ-depot` du skill racine
- `ticket-abcde-3620/modules/champ-depot/SKILL.md` : 5 051 car., modules `vue` et `champ-depot` du skill racine
- `ticket-abcde-3620-1-1/modules/methode/SKILL.md` : 9 494 car., module `methode`
- `ticket-abcde-3620-1-1/modules/recette/SKILL.md` : 2 539 car., module `recette`
- `ticket-abcde-3620-1-1/modules/invariants/SKILL.md` : 12 649 car., module `invariants`
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., `docs/c7e/meso-contrats.md`
- `ticket-abcde-3620-1-1/ticket.toml` : 2 419 car., `ticket.toml`
- `projet/docs/demandes/ABCDE-3620/ABCDE-3620.feature` : 3 482 car., `docs/demandes/ABCDE-3620/ABCDE-3620.feature`
- `vue du nœud ABCDE-3620-1.1` : 2 395 car., vue.mjs generer docs/demandes/ABCDE-3620 --noeud ABCDE-3620-1.1

Lu par agent ticket-abcde-3620-1-1-persistance :

- `ticket-abcde-3620-1-1/agents/ticket-abcde-3620-1-1-persistance.md` : 4 056 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/modules/champ-depot/SKILL.md` : 5 051 car., module `champ-depot` du skill racine
- `ticket-abcde-3620-1-1/ticket.toml` : 2 419 car., `.gemini/skills/ticket-abcde-3620-1-1/ticket.toml`
- `ticket-abcde-3620-1-1/modules/meso-contrats/SKILL.md` : 1 306 car., `.gemini/skills/ticket-abcde-3620-1-1/modules/meso-contrats/SKILL.md`
- `ticket-abcde-3620-1-1/modules/option-persistance-crud/SKILL.md` : 1 363 car., `.gemini/skills/ticket-abcde-3620-1-1/modules/option-persistance-crud/SKILL.md`
- `projet/docs/demandes/ABCDE-3620/ABCDE-3620.feature` : 3 482 car., `docs/demandes/ABCDE-3620/ABCDE-3620.feature`
- `ticket-abcde-3620/references/agent-tdd-jira/cycle-tdd.md` : 7 359 car., `.gemini/skills/ticket-abcde-3620/references/agent-tdd-jira/cycle-tdd.md`
- `ticket-abcde-3620-1-1/modules/invariants/SKILL.md` : 12 649 car., `.gemini/skills/ticket-abcde-3620-1-1/modules/invariants/SKILL.md`
- `ticket-abcde-3620-1-1/socle/SKILL.md` : 18 589 car., `.gemini/skills/ticket-abcde-3620-1-1/socle/SKILL.md`
- `ticket-abcde-3620-1-1/references/java.md` : 13 731 car., `.gemini/skills/ticket-abcde-3620-1-1/references/java.md`
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., copie du projet du fichier d'invariants

Lu par sous-agent ticket-abcde-3620-analyste :

- `ticket-abcde-3620/agents/ticket-abcde-3620-analyste.md` : 1 890 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/references/analyse-projet.md` : 10 027 car., `.gemini/skills/ticket-abcde-3620/references/analyse-projet.md`
- `ticket-abcde-3620/references/analyse-projet/cartographie.md` : 6 558 car., `.gemini/skills/ticket-abcde-3620/references/analyse-projet/cartographie.md`
- `ticket-abcde-3620-1-1/ticket.toml` : 2 419 car., `ticket.toml`

Lu par sous-agent ticket-abcde-3620-relecteur :

- `ticket-abcde-3620/agents/ticket-abcde-3620-relecteur.md` : 1 714 car., corps de l'agent, à son invocation
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
| session du skill ticket-abcde-3620-1-2 | 17 256 car., 4 314 tokens | 82 152 car., 20 538 tokens |
| agent ticket-abcde-3620-1-2-back | 4 748 car., 1 187 tokens | 95 133 car., 23 784 tokens |
| sous-agent ticket-abcde-3620-analyste | 1 890 car., 473 tokens | 22 796 car., 5 699 tokens |
| sous-agent ticket-abcde-3620-relecteur | 1 714 car., 429 tokens | 24 509 car., 6 128 tokens |
| sous-agent ticket-abcde-3620-qualite | 1 809 car., 453 tokens | 40 356 car., 10 089 tokens |

Lu par session du skill ticket-abcde-3620-1-2 :

- `noms et descriptions des 5 skills et des agents installés` : 3 458 car., chargés au démarrage de Gemini CLI
- `ticket-abcde-3620-1-2/SKILL.md` : 13 798 car., corps du skill, à son activation
- `ticket-abcde-3620-1-2/modules/meso-contrats/SKILL.md` : 1 791 car., module `meso-contrats`
- `ticket-abcde-3620/modules/vue/SKILL.md` : 5 274 car., modules `vue` et `champ-depot` du skill racine
- `ticket-abcde-3620/modules/champ-depot/SKILL.md` : 5 051 car., modules `vue` et `champ-depot` du skill racine
- `ticket-abcde-3620-1-2/modules/methode/SKILL.md` : 9 494 car., module `methode`
- `ticket-abcde-3620-1-2/modules/recette/SKILL.md` : 3 231 car., module `recette`
- `ticket-abcde-3620-1-2/modules/invariants/SKILL.md` : 12 649 car., module `invariants`
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., `docs/c7e/meso-contrats.md`
- `ticket-abcde-3620-1-2/ticket.toml` : 4 321 car., `ticket.toml`
- `projet/docs/demandes/ABCDE-3620/ABCDE-3620.feature` : 3 482 car., `docs/demandes/ABCDE-3620/ABCDE-3620.feature`
- `vue du nœud ABCDE-3620-1.2` : 3 965 car., vue.mjs generer docs/demandes/ABCDE-3620 --noeud ABCDE-3620-1.2

Lu par agent ticket-abcde-3620-1-2-back :

- `ticket-abcde-3620-1-2/agents/ticket-abcde-3620-1-2-back.md` : 4 748 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/modules/champ-depot/SKILL.md` : 5 051 car., module `champ-depot` du skill racine
- `ticket-abcde-3620-1-2/ticket.toml` : 4 321 car., `.gemini/skills/ticket-abcde-3620-1-2/ticket.toml`
- `ticket-abcde-3620-1-2/modules/meso-contrats/SKILL.md` : 1 791 car., `.gemini/skills/ticket-abcde-3620-1-2/modules/meso-contrats/SKILL.md`
- `ticket-abcde-3620-1-2/modules/option-backend-endpoints/SKILL.md` : 1 327 car., `.gemini/skills/ticket-abcde-3620-1-2/modules/option-backend-endpoints/SKILL.md`
- `ticket-abcde-3620-1-2/modules/option-backend-representations/SKILL.md` : 3 851 car., `.gemini/skills/ticket-abcde-3620-1-2/modules/option-backend-representations/SKILL.md`
- `ticket-abcde-3620-1-2/modules/option-backend-evenements/SKILL.md` : 2 596 car., `.gemini/skills/ticket-abcde-3620-1-2/modules/option-backend-evenements/SKILL.md`
- `projet/docs/demandes/ABCDE-3620/ABCDE-3620.feature` : 3 482 car., `docs/demandes/ABCDE-3620/ABCDE-3620.feature`
- `ticket-abcde-3620/references/agent-tdd-jira/cycle-tdd.md` : 7 359 car., `.gemini/skills/ticket-abcde-3620/references/agent-tdd-jira/cycle-tdd.md`
- `ticket-abcde-3620-1-2/modules/invariants/SKILL.md` : 12 649 car., `.gemini/skills/ticket-abcde-3620-1-2/modules/invariants/SKILL.md`
- `ticket-abcde-3620-1-2/socle/SKILL.md` : 18 589 car., `.gemini/skills/ticket-abcde-3620-1-2/socle/SKILL.md`
- `ticket-abcde-3620-1-2/references/java.md` : 13 731 car., `.gemini/skills/ticket-abcde-3620-1-2/references/java.md`
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., copie du projet du fichier d'invariants

Lu par sous-agent ticket-abcde-3620-analyste :

- `ticket-abcde-3620/agents/ticket-abcde-3620-analyste.md` : 1 890 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/references/analyse-projet.md` : 10 027 car., `.gemini/skills/ticket-abcde-3620/references/analyse-projet.md`
- `ticket-abcde-3620/references/analyse-projet/cartographie.md` : 6 558 car., `.gemini/skills/ticket-abcde-3620/references/analyse-projet/cartographie.md`
- `ticket-abcde-3620-1-2/ticket.toml` : 4 321 car., `ticket.toml`

Lu par sous-agent ticket-abcde-3620-relecteur :

- `ticket-abcde-3620/agents/ticket-abcde-3620-relecteur.md` : 1 714 car., corps de l'agent, à son invocation
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
| session du skill ticket-abcde-3620-2 | 16 861 car., 4 216 tokens | 78 309 car., 19 578 tokens |
| agent ticket-abcde-3620-2-front | 4 668 car., 1 167 tokens | 87 796 car., 21 949 tokens |
| sous-agent ticket-abcde-3620-analyste | 1 890 car., 473 tokens | 21 585 car., 5 397 tokens |
| sous-agent ticket-abcde-3620-relecteur | 1 714 car., 429 tokens | 24 693 car., 6 174 tokens |
| sous-agent ticket-abcde-3620-qualite | 1 809 car., 453 tokens | 40 356 car., 10 089 tokens |

Lu par session du skill ticket-abcde-3620-2 :

- `noms et descriptions des 5 skills et des agents installés` : 3 458 car., chargés au démarrage de Gemini CLI
- `ticket-abcde-3620-2/SKILL.md` : 13 403 car., corps du skill, à son activation
- `ticket-abcde-3620-2/modules/meso-contrats/SKILL.md` : 1 450 car., module `meso-contrats`
- `ticket-abcde-3620/modules/vue/SKILL.md` : 5 274 car., modules `vue` et `champ-depot` du skill racine
- `ticket-abcde-3620/modules/champ-depot/SKILL.md` : 5 051 car., modules `vue` et `champ-depot` du skill racine
- `ticket-abcde-3620-2/modules/methode/SKILL.md` : 9 490 car., module `methode`
- `ticket-abcde-3620-2/modules/recette/SKILL.md` : 2 657 car., module `recette`
- `ticket-abcde-3620-2/modules/invariants/SKILL.md` : 12 639 car., module `invariants`
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., `docs/c7e/meso-contrats.md`
- `ticket-abcde-3620-2/ticket.toml` : 3 110 car., `ticket.toml`
- `projet/docs/demandes/ABCDE-3620/ABCDE-3620.feature` : 3 482 car., `docs/demandes/ABCDE-3620/ABCDE-3620.feature`
- `vue du nœud ABCDE-3620-2` : 2 657 car., vue.mjs generer docs/demandes/ABCDE-3620 --noeud ABCDE-3620-2

Lu par agent ticket-abcde-3620-2-front :

- `ticket-abcde-3620-2/agents/ticket-abcde-3620-2-front.md` : 4 668 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/modules/champ-depot/SKILL.md` : 5 051 car., module `champ-depot` du skill racine
- `ticket-abcde-3620-2/ticket.toml` : 3 110 car., `.gemini/skills/ticket-abcde-3620-2/ticket.toml`
- `ticket-abcde-3620-2/modules/meso-contrats/SKILL.md` : 1 450 car., `.gemini/skills/ticket-abcde-3620-2/modules/meso-contrats/SKILL.md`
- `ticket-abcde-3620-2/modules/option-frontend-elements_graphiques/SKILL.md` : 903 car., `.gemini/skills/ticket-abcde-3620-2/modules/option-frontend-elements_graphiques/SKILL.md`
- `ticket-abcde-3620-2/modules/option-frontend-fonctionnalites/SKILL.md` : 992 car., `.gemini/skills/ticket-abcde-3620-2/modules/option-frontend-fonctionnalites/SKILL.md`
- `projet/docs/demandes/ABCDE-3620/ABCDE-3620.feature` : 3 482 car., `docs/demandes/ABCDE-3620/ABCDE-3620.feature`
- `ticket-abcde-3620/references/agent-tdd-jira/cycle-tdd.md` : 7 359 car., `.gemini/skills/ticket-abcde-3620/references/agent-tdd-jira/cycle-tdd.md`
- `ticket-abcde-3620-2/modules/invariants/SKILL.md` : 12 639 car., `.gemini/skills/ticket-abcde-3620-2/modules/invariants/SKILL.md`
- `ticket-abcde-3620-2/socle/SKILL.md` : 18 589 car., `.gemini/skills/ticket-abcde-3620-2/socle/SKILL.md`
- `ticket-abcde-3620-2/references/angular.md` : 13 915 car., `.gemini/skills/ticket-abcde-3620-2/references/angular.md`
- `projet/docs/c7e/meso-contrats.md` : 15 638 car., copie du projet du fichier d'invariants

Lu par sous-agent ticket-abcde-3620-analyste :

- `ticket-abcde-3620/agents/ticket-abcde-3620-analyste.md` : 1 890 car., corps de l'agent, à son invocation
- `ticket-abcde-3620/references/analyse-projet.md` : 10 027 car., `.gemini/skills/ticket-abcde-3620/references/analyse-projet.md`
- `ticket-abcde-3620/references/analyse-projet/cartographie.md` : 6 558 car., `.gemini/skills/ticket-abcde-3620/references/analyse-projet/cartographie.md`
- `ticket-abcde-3620-2/ticket.toml` : 3 110 car., `ticket.toml`

Lu par sous-agent ticket-abcde-3620-relecteur :

- `ticket-abcde-3620/agents/ticket-abcde-3620-relecteur.md` : 1 714 car., corps de l'agent, à son invocation
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
