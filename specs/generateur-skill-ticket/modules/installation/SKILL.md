---
name: installation
description: Installation d'un arbre de skills de ticket dans Gemini CLI et cycle de vie de ses nœuds (installer, liste, verifier, lancer, retirer, masquage à Git, une session par nœud, ratifications, contrat avec Gemini CLI 0.67.0, recette P4 sur le poste du développeur). À lire avant d'installer ou de lancer un arbre.
dimensions: [D3]
status: active
---

# Module `installation` (D3)

`installer-arbre.mjs` installe un arbre entier dans le workspace de Gemini CLI, depuis ses transmissions, le lance nœud par nœud, dit où en est chaque nœud, et le retire à la clôture. Il se lance depuis le projet, ou avec `--workspace <dossier>`.

## 1. Commandes

| Commande | Effet |
|---|---|
| `installer <dossier ou transmissions>` | vérifie chaque transmission (intégrité et héritage) et que l'ensemble forme un arbre complet ; installe les skills par `tools/installer.mjs` ; copie les agents dans `.gemini/agents/` et les commandes dans `.gemini/commands/ticket/` ; écrit le relevé et une copie des transmissions dans `.gemini/skill-ticket/<clé>/` ; masque le tout à Git. Rien n'est écrit au moindre écart ; un fichier modifié depuis l'installation, ou que l'installateur n'a pas écrit, n'est remplacé qu'avec `--forcer` (D3.INV-1) |
| `liste` | les arbres installés, et l'état de chaque nœud d'après le champ d'observation et les dossiers du ticket ; puis l'état du champ, et celui de la vue augmentée, avec la commande qui la régénère |
| `verifier [<clé>]` | fichiers installés intacts ; si Gemini CLI est là, ses skills découverts et activés, ses agents chargés sans erreur, un dossier non fiable signalé |
| `lancer <référence>` | ouvre Gemini CLI dans le workspace, en mode interactif, sur la phrase qui active le skill du nœud : `gemini -i "Active le skill …"` (D3.INV-4) |
| `retirer <clé>` | archive les transmissions dans `docs/demandes/<clé>/skills/`, où elles se versionnent avec le ticket, puis retire skills, agents, commandes et relevé (D3.INV-2) |

Options : `--visible` pour ne rien masquer à Git ; `--forcer` ; `--essai` pour voir ce qui serait fait ; `--sans-archive` au retrait ; `--gemini <exécutable>`, ou la variable `SKILL_TICKET_GEMINI`, sinon `gemini`.

Tout ce que l'installation écrit est relevé, puis masqué dans l'exclusion locale de Git (`.git/info/exclude`), comme `tools/installer.mjs` masque les skills ; le retrait remet l'exclusion en l'état. Ni l'installation ni le retrait ne modifient un fichier suivi par Git (D3.INV-2). Une transmission seule s'installe aussi par `tools/installer.mjs`, mais sans ses agents ni sa commande.

## 2. Cycle de vie d'un nœud

Chaque nœud se traite dans sa propre session de Gemini CLI, avec son propre contexte, que le développeur lance par la commande du nœud ou par `lancer` ; aucun skill n'active celui d'un sous-ticket dans sa session (D3.INV-3). Les états se lisent dans les dossiers du ticket et dans le champ d'observation, que chaque nœud lit dans sa vue :

| Nœud | États |
|---|---|
| racine | documents à rédiger ; arbre à ratifier ; en cours, avec l'état des sous-tickets et le prochain nœud prêt et sa commande ; prêt à clore, puis kits ; clos |
| nœud composé | en cours ; prêt à clore ; clos |
| feuille | en attente de la ratification de l'arbre, ou d'un ticket dont elle dépend ; prêt ; analysé, à ratifier ; ratifié, en transformation ; clos |
| racine et feuille, sans sous-ticket | documents à rédiger ; prêt ; analysé, à ratifier ; ratifié, en transformation ; clos |

Une ratification se dépose dans le champ d'observation de l'arbre, par `champ.mjs deposer … retour --nature ratification` : objet `arbre <clé>` sur la racine, la référence de la feuille sur une feuille, la référence du ticket pour un ticket sans sous-ticket, qui n'a pas d'arbre à ratifier ; décision `ratifié` ou `non ratifié` ; la dernière décision sur un objet fait foi. Un nœud composé ne se ratifie pas : il coordonne. Aucun nœud ne modifie le projet avant sa ratification : le skill tient lieu de fiche (orchestrateur-c7e:D3.INV-1). Un nœud est clos quand son `remise.md` existe. Une feuille confie chaque couche à son agent par l'outil `invoke_agent`.

## 3. Contrat avec Gemini CLI

Vérifié avec Gemini CLI 0.67.0, sans modèle : lancé dans le workspace de confiance, `gemini skills list` découvre et active les skills de l'arbre ; Gemini CLI charge sans erreur ses agents, de couche, de rôle et d'observation, et refuse un agent au nom ou aux outils invalides ; dans un dossier non fiable, il ignore skills et agents. Le lancement ne passe ni `--skip-trust` ni un mode d'approbation automatique : la confiance du dossier et les approbations restent au développeur (D3.INV-4). Le workflow du générateur rejoue ce contrat sous Linux et sous Windows.

## 4. Recette P4 sur le poste du développeur

La présentation de l'arbre et l'attente de la ratification demandent un modèle : elles se vérifient dans Gemini CLI, sur le poste. Dans un workspace d'essai, dossier vide ou dépôt Git de test, marqué de confiance :

1. `node <dépôt>/specs/generateur-skill-ticket/outils/installer-arbre.mjs installer <dépôt>/specs/generateur-skill-ticket/exemples/ABCDE-3620-skills/transmissions`
2. `node <dépôt>/specs/generateur-skill-ticket/outils/installer-arbre.mjs verifier ABCDE-3620` : skills découverts et activés, agents chargés sans erreur.
3. `node <dépôt>/specs/generateur-skill-ticket/outils/installer-arbre.mjs lancer ABCDE-3620` ; Gemini CLI demande d'autoriser le skill à sa première activation. Attendu : le skill racine signale l'absence de `docs/c7e/meso-contrats.md`, normale dans un workspace d'essai, fait rédiger les documents de la clé, puis présente l'arbre, les méso-contrats, l'ordre de résolution, les critères et la façon dont chacun est soutenu, et attend la ratification, sans modifier le projet.
4. Ratifier : le skill dépose la ratification dans `docs/demandes/ABCDE-3620/champ.jsonl` et indique ABCDE-3620-1.1 avec sa commande.
5. `installer-arbre.mjs liste` : racine en cours, ABCDE-3620-1.1 prêt.
6. `installer-arbre.mjs retirer ABCDE-3620 --sans-archive` pour finir.

Variante d'un ticket sans sous-ticket, avec ABCDE-3512 : `installer <dépôt>/specs/generateur-skill-ticket/exemples/ABCDE-3512-skills/transmissions`, puis `lancer ABCDE-3512`. Attendu : le skill fait rédiger les documents de la clé ; il analyse ensuite le ticket en lecture seule, puis présente le ticket, son méso-contrat M01, ses six critères et son analyse, et attend la ratification avant toute modification ; ratifié, il la dépose sous la référence ABCDE-3512, et `liste` le montre « ratifié, en transformation ».

## 5. Recette

| Invariant | Preuves |
|---|---|
| D3.INV-1 | `tests/installation.test.mjs` : « un arbre incomplet ou une transmission altérée ne s'installe pas » ; « un agent modifié depuis l'installation n'est remplacé qu'avec --forcer » ; « un fichier étranger à la place d'une commande n'est pas écrasé » ; « installer deux fois : rien ne change, l'installation est intacte » ; « installer : cinq skills, neuf agents, cinq commandes, un relevé » |
| D3.INV-2 | `tests/installation.test.mjs` : « dépôt Git : tout est masqué, git status reste vide ; retirer remet l'exclusion locale en l'état » ; « dépôt Git, --visible : skills, agents, commandes et relevé apparaissent dans git status » ; « retirer : transmissions archivées dans le dossier du ticket, plus rien dans .gemini » ; `tests/bout-en-bout.test.mjs` : « le retrait archive les transmissions, qui se vérifient et se mesurent comme les versionnées » |
| D3.INV-3 | `tests/generer.test.mjs` : « ratification : l'arbre sur la racine, chaque feuille avant sa première action, rien sur un nœud intermédiaire » ; « cycle de vie : une session par nœud, ratification de l'arbre vérifiée, états de la racine » ; `tests/installation.test.mjs` : « liste : état de chaque nœud, des documents de la clé à la clôture, d'après le champ de l'arbre » ; `tests/bout-en-bout.test.mjs` : « second arbre : ABCDE-3512, un seul ticket, se vérifie, se génère à l'identique, s'installe, se ratifie sous sa référence » |
| D3.INV-4 | `tests/installation.test.mjs` : « lancer : Gemini CLI en mode interactif, sur la phrase qui active le skill du nœud, dans le workspace » ; « Gemini CLI réel : skills découverts et activés, agents chargés, dossier non fiable signalé » ; « usage incorrect : code de sortie 2 » |
