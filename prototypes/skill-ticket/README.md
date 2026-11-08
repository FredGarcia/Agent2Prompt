# Prototype : skill de ticket C7E

**Statut** : lots 1 et 2 livrés, modèle et vérification de l'arbre, puis fabrique et Monteur des skills de ticket. Les lots 3 à 6 suivent, chacun validé par le développeur. Rien ici n'est encore une spécification versionnée : le prototype reste hors de `specs/` jusqu'à son bilan, après quoi il entrera dans l'orchestrateur C7E, probablement en version majeure, ou dans une spécification de générateur à part.

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

L'arbre d'essai donne cinq skills, de 10 à 14 fichiers ; leurs transmissions attendues sont versionnées dans `exemples/ABCDE-3620-skills/transmissions/` (de 65 000 à 103 000 caractères, contre 230 000 pour la transmission de l'orchestrateur ; la mesure du contexte chargé reste celle du lot 6).

### Contrôle de l'héritage

| Règle | Contenu |
|---|---|
| H1 | la provenance déclarée est complète : méthode, invariants de l'orchestrateur, socle, invariants du projet, et, pour une feuille, le référentiel de la pile de chaque couche touchée |
| H2 | chaque invariant de l'orchestrateur, à la version déclarée, figure mot pour mot dans `modules/invariants`, et leur nombre est celui déclaré |
| H3 | chaque section de la méthode déclarée figure mot pour mot dans `modules/methode` |
| H4 | chaque copie a l'empreinte que déclare le manifeste, et elle est identique à sa source à la version épinglée, courante ou archivée |
| H5 | chaque invariant cité par la consigne, les modules et les agents est défini par l'orchestrateur ou par le socle |
| H6 | le ticket transmis est celui que nomme le manifeste |

Le Monteur applique ces règles avant d'écrire : un skill qui omet ou altère un invariant n'est pas écrit, ni aucun autre de l'arbre. `generer.mjs verifier` les applique à des transmissions, avec leur table d'intégrité, contre les sources du dépôt.

### Choix du lot 2, à valider

1. **La fiche se répartit** : le skill, ratifié et immuable, tient la première partie de la fiche de transformation ; l'analyse (d=0) produit, avant la ratification, la copie de travail de `ticket.toml` et `analyse.md` (cartographie, configuration retenue, stratégie, tests déduits), ratifiées avec le skill ; la seconde partie va dans `remise.md`. Les retours du développeur s'ajoutent à `retours.md`, en ajout seul, en attendant le champ d'observation du lot 4.
2. **Dossiers** : `docs/demandes/<clé>/` pour la racine, `docs/demandes/<clé>/<référence>/` pour chaque sous-ticket.
3. **Une branche et une clé pour tout l'arbre**, celles du ticket Jira racine : chaque commit commence par `ABCDE-3620 : ` et cite le sous-ticket dans son corps, ce qu'accepte le hook `commit-msg` du kit `agents-paralleles-gitlab` (son D2.INV-2) ; D4.INV-1 et D4.INV-2 restent tenus.
4. **Invariants du projet** : le skill garde l'état sur lequel il a été produit et le compare au démarrage à la copie du projet, qui fait foi (D8.INV-1).
5. **Méthode par extraits** : les sections utiles de l'orchestrateur, mot pour mot, plutôt que son point d'entrée entier ; une correspondance dit comment chaque invariant qui parle de la fiche s'applique au skill.
6. **Preuves paramétrées** : une preuve que le référentiel conditionne à une valeur (`remplacement : …`, `create : …`) est marquée sans objet quand le ticket ne la retient pas.
7. **Agents** : un par couche touchée, outils intégrés de Gemini CLI ; leur installation dans `.gemini/agents/` et leur appel relèvent du lot 3.
8. **Version** : 1.0.0 pour tout skill de ticket généré ; une régénération après une modification du ticket garde ce numéro, à revoir avec l'installation au lot 3.

## Commandes

Depuis la racine du dépôt, sans dépendance : Node 20 ou plus récent pour les outils, Node 22 ou plus récent pour la recette (motifs de fichiers de `node --test`) :

```bash
node prototypes/skill-ticket/outils/arbre.mjs verifier prototypes/skill-ticket/exemples/ABCDE-3620
node prototypes/skill-ticket/outils/arbre.mjs plan prototypes/skill-ticket/exemples/ABCDE-3620
node prototypes/skill-ticket/outils/generer.mjs generer prototypes/skill-ticket/exemples/ABCDE-3620 --sortie <dossier>
node prototypes/skill-ticket/outils/generer.mjs verifier <dossier>/transmissions
node --test "prototypes/skill-ticket/tests/*.test.mjs"
```

Sous Windows, les mêmes commandes passent dans PowerShell, avec `\` ou `/` dans les chemins ; une extraction Git en CRLF donne les mêmes skills, octet pour octet. `--referentiel <chemin>` lit un `referentiel-meso-contrats.toml` de projet au lieu du modèle de l'orchestrateur ; `--profondeur-max <n>` change le plafond ; `--invariants-projet <chemin>` donne la copie du projet du fichier d'invariants, au lieu du modèle de l'orchestrateur. `generer` écrit chaque skill dans `<dossier>/<skill>/` et sa transmission dans `<dossier>/transmissions/`, et ne remplace qu'un dossier qui contient déjà un skill de ticket généré. Code de sortie 1 au moindre écart, 2 pour un usage incorrect.

Une transmission produite s'installe comme les autres : `node tools/installer.mjs <dossier>/transmissions/ticket-abcde-3620-1-2-1.0.0.md`, depuis le workspace de Gemini CLI.

Les transmissions attendues changent dès que change une source dont héritent les skills de ticket (orchestrateur, socle, référentiels, modèle des invariants du projet) : la recette le signale, et elles se régénèrent par

```bash
node prototypes/skill-ticket/outils/generer.mjs generer prototypes/skill-ticket/exemples/ABCDE-3620 --sortie prototypes/skill-ticket/exemples/ABCDE-3620-skills
```

(seules les transmissions y sont versionnées).

## Architecture et patrons

| Composant | Patron | Lot |
|---|---|---|
| `NoeudTicket` : même interface pour un ticket et ses sous-tickets, sur n niveaux | Composite | 1, livré |
| parcours de l'arbre par les vérifications, puis par les observateurs | Visiteur | 1 livré, 4 |
| ordre de résolution : un nœud prêt quand ses prérequis sont clos | Observateur, État | 1 livré, 4 |
| `FabriqueSkillTicket` et `FabriqueJavaAngularPostgreSQL` : la famille de fichiers d'un nœud, référentiels, agents et commandes de la pile | Fabrique abstraite | 2, livré |
| `Monteur` : assemblage nœud par nœud, blocs du référentiel copiés puis paramétrés | Monteur, Prototype | 2, livré |
| consigne du nœud : même squelette, crochets selon la nature du nœud et selon la pile | Patron de méthode | 2, livré |
| exécuteur Gemini CLI par l'installateur ; place prévue pour n8n | Pont | 3 |
| champ d'observation partagé, en ajout seul | Médiateur | 4 |
| escalade ordre 1, 2, 3, puis humain | Chaîne de responsabilité | 4 |
| actions enregistrées, corrections humaines qui les visent | Commande | 4 |
| vue augmentée : calques posés sur les ancres du ticket | Décorateur | 5 |

`outils/toml.mjs` lit le sous-ensemble de TOML 1.0 du référentiel et des tickets, sans dépendance ; sa recette le compare aux lectures de `tomllib` (Python), versionnées dans `tests/fixtures/toml/` et `tests/attendus/`. `outils/sources.mjs` lit les sources de l'héritage à leur version épinglée, archives comprises, fins de ligne normalisées ; `outils/fabrique.mjs` porte les fabriques, `outils/monteur.mjs` le Monteur et le contrôle de l'héritage, `outils/generer.mjs` la ligne de commande.

## Lots et critères d'acceptation

| Lot | Contenu | Critères | Statut |
|---|---|---|---|
| 1 | modèle et vérification de l'arbre | P1, sauf l'invariant omis | livré |
| 2 | fabrique et Monteur : un skill par nœud, sa transmission par `bundle.mjs` | P1 (invariant omis), P2, P3 | livré |
| 3 | installation de l'arbre dans Gemini CLI, activation vérifiée sur le poste du développeur | P4 | à venir |
| 4 | champ d'observation, retours humains simulés, visiteurs, escalade, propagation | P5 | à venir |
| 5 | vue augmentée générée depuis le champ | P6 | à venir |
| 6 | recette, mesure du contexte, bilan | P7 | à venir |

- **P1** : l'arbre d'essai passe le vérificateur ; sont rejetés : deux parents, un cycle de dépendances, une dépendance vers un ancêtre, une profondeur au-delà du plafond, une possibilité du parent portée par aucun sous-ticket, une option hors de la composition, un invariant omis (lot 2).
- **P2** : chaque skill produit se relit à l'identique depuis sa transmission ; la même entrée redonne les mêmes fichiers ; l'assemblage ne consomme aucun token.
- **P3** : chaque skill de ticket reprend tous les invariants dont il hérite, contrôlé automatiquement.
- **P4** : dans Gemini CLI, le skill parent présente l'arbre, les méso-contrats, l'ordre de résolution et les critères, puis attend la ratification avant toute action.
- **P5** : sur retours simulés, une correction répétée déclenche une proposition d'ordre 2 ; un écart dans un sous-ticket menace le critère du parent qu'il soutient ; un désaccord entre nœuds va au registre des écarts.
- **P6** : la vue augmentée montre, pour chaque ancre, des calques et un état conformes au champ.
- **P7** : le contexte chargé pour résoudre une feuille est mesuré et comparé à celui du point d'entrée de l'orchestrateur.

## Écart relevé dans le référentiel

En codant la règle « aucune possibilité ne reste inconnue si sa réponse pouvait changer la composition », le prototype constate que l'exemple du § 7.2 du module `referentiel` (orchestrateur-c7e 3.5.3) laisse `regle` et `service` à `inconnu`, alors qu'un `oui` ajouterait un complément à M04. Le référentiel n'est pas modifié ; l'arbre d'essai répond à ces deux possibilités, et un test documente l'écart.
