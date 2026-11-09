---
name: champ
description: Champ d'observation d'un arbre de skills de ticket (enregistrements en ajout seul et chaînés, schéma fermé skill-ticket.observation/1, ordres d'observation 1, 2 et 3, escalade, menaces propagées jusqu'aux critères d'acceptation, désaccords au registre des écarts, commandes de champ.mjs). À lire pour suivre ou observer un arbre installé.
dimensions: [D5]
status: active
---

# Module `champ` (D5)

Chaque niveau de l'arbre dépose ce qu'il fait et ce qu'il observe dans un champ partagé, `docs/demandes/<clé>/champ.jsonl` ; tous le lisent, personne ne le réécrit. Le ticket n'est jamais réécrit par ceux qui l'observent : c'est l'état du champ qui évolue. Les niveaux ne se parlent que par lui (Médiateur). `champ.mjs`, livré tel quel dans le skill racine, est le seul à l'écrire (D5.INV-1).

## 1. Commandes

| Commande | Effet |
|---|---|
| `deposer <dossier> <type> --noeud … --auteur … [options]` | contrôle le champ existant, puis l'enregistrement contre le schéma fermé et les règles du champ ; l'ajoute avec son numéro, sa date en UTC et l'empreinte de la ligne précédente ; met à jour `champ.tete` ; inscrit d'office l'écart d'un désaccord, au champ et au registre des écarts ; annonce les observations que le dépôt fait attendre. Un dépôt refusé n'écrit rien |
| `verifier <dossier>` | schéma, numéros, dates non décroissantes, forme canonique de chaque ligne, chaîne d'empreintes et tête, désaccords inscrits, écarts présents au registre des écarts |
| `etat <dossier> [--json]` | ratifications, état de chaque critère de l'arbre, désaccords, observations attendues, motifs en veille |

Depuis la racine du projet : `node .gemini/skills/ticket-<clé>/outils/champ.mjs <commande> docs/demandes/<clé> …`. Le skill racine porte deux modules du champ : `champ`, entier, que lisent la racine et les observateurs, et `champ-depot`, court, que lisent les autres nœuds et les agents de couche, avec leurs dépôts et la suite qu'ils donnent aux attentes du champ. Le script lit les critères de l'arbre dans le rattachement du skill racine installé, sans le modèle de l'arbre ; un verrou de fichier sérialise les dépôts de deux sessions.

## 2. Enregistrements

| Type | Contenu | Déposé par |
|---|---|---|
| `action` | proposition au développeur, avec ses options, ou réalisation qu'il peut corriger, sur une ancre : `noeud`, `critere`, `ca`, `scenario`, `fichier`, `commit`, `contrat`, `option` | l'agent ou le skill qui agit |
| `retour` | choix parmi les options d'une proposition, ou décision sur une proposition d'ordre 2 ; correction, qui vise une action et porte un motif ; ratification | le skill du nœud, au nom du développeur |
| `observation` | ordre 1 : conforme ou écart sur une ancre ; ordre 2 : proposition d'adaptation de la méthode, ou conforme ; ordre 3 : proposition fondée ou infondée, veille d'un motif, bilan de clôture ; toujours avec sa preuve, `test`, `commande`, `commit`, `fichier`, `enregistrements` ou `rapport`, et son coût s'il est connu | agents et skills à l'ordre 1, observateurs de l'arbre aux ordres 2 et 3 |
| `ecart` | écart à un invariant, ou désaccord entre nœuds, avec sa ligne au registre des écarts | le skill qui le constate ; le script pour un désaccord |

Toute observation porte sa preuve ; une correction vise une action antérieure et porte un motif, en minuscules et tirets, choisi par le skill qui la dépose ; seul l'observateur de l'arbre observe à l'ordre 2, et seulement sur des corrections répétées (D5.INV-2). La référence d'une auto-observation est un retour du développeur ou une preuve, jamais l'auto-évaluation seule.

## 3. Escalade

| Déclencheur, décidé par le script | Attente | Suite, formulée par un sous-agent ou le développeur |
|---|---|---|
| deux corrections au même motif, dans l'arbre, sans observation d'ordre 2 qui les couvre | ordre 2 | `ticket-<clé>-observateur-2` propose une adaptation de la méthode, ou conclut conforme ; jamais une action sur le code |
| une proposition d'ordre 2 non examinée | ordre 3 | `ticket-<clé>-observateur-3` la juge fondée ou infondée, d'après ses preuves et son effet sur la décision |
| une proposition examinée, non décidée | développeur | il la retient, et elle s'inscrit au registre des concepts comme entrée `proposed`, par le skill du nœud, commitée à part ; ou il la refuse |
| deux propositions refusées sur un motif, sans proposition retenue depuis | veille | l'observateur d'ordre 3 met le motif en veille : l'ordre 2 ne s'y éveille plus |

L'ordre d'observation ne dépasse pas 3 ; le développeur est au-dessus (D5.INV-3). Un écart se traite au niveau le plus bas qui le peut (Chaîne de responsabilité). Les observateurs n'ont aucun outil d'écriture : leur seule écriture passe par `champ.mjs`. À la clôture, la racine fait faire le bilan d'ordre 3 si l'ordre 2 a proposé.

## 4. État des critères

Un critère est en écart si le dernier verdict d'ordre 1 d'un nœud sur lui est un écart ; menacé si un critère qui le soutient est en écart ou menacé, de proche en proche, jusqu'au critère d'acceptation de la clé ; prouvé par un verdict conforme ou par tous ses soutiens ; à prouver sinon. Un visiteur parcourt les critères de l'arbre, chacun atteint après ceux qui le soutiennent. Un rouge du cycle TDD n'est pas un écart. Deux nœuds dont les derniers verdicts d'ordre 1 sur une même ancre sont contraires sont en désaccord : le script l'inscrit au champ et au registre des écarts du projet, décision au développeur ; une observation qui départage les nœuds le lève dans l'état, la ligne du registre reste (D5.INV-4).

Chaque consigne lit l'état du champ à chaque lancement, dans sa vue (module `vue`), après la vérification des invariants du projet : la ratification s'y vérifie, les critères menacés ou en écart et les observations attendues s'y traitent. La racine reporte l'état final du champ dans sa remise. Le champ ne se commite pas avant la campagne d'Agent2Test.

## 5. Intégrité

`champ.tete` garde l'empreinte de la dernière ligne. Une ligne réécrite, insérée ou supprimée, une ligne non canonique, une tête absente ou un écart absent du registre sont relevés, et un champ altéré refuse tout dépôt (D5.INV-1). Les dates sont en UTC, jamais antérieures à la précédente.

## 6. Recette

La recette rejoue deux scénarios de retours simulés, dépôt par dépôt, à dates fixées : `essai`, dans `exemples/ABCDE-3620-champ/`, et `resolution`, dans le projet résolu. Le même scénario redonne le même champ, octet pour octet.

| Invariant | Preuves |
|---|---|
| D5.INV-1 | `tests/champ.test.mjs` : « P5 : le scénario d'essai redonne le champ, la tête, le registre et l'état de l'exemple, octet pour octet » ; « ajout seul : champ altéré relevé » ; « ajout seul : tête absente, écart absent du registre » ; « schéma fermé : une date antérieure au dernier enregistrement est refusée ; le dossier porte la clé » |
| D5.INV-2 | `tests/champ.test.mjs` : « schéma fermé : dépôt refusé » (correction sans motif ou qui ne vise pas une action antérieure, observation d'ordre 2 d'un autre agent ou sur une seule correction, preuve de nature inconnue) ; `tests/generer.test.mjs` : « lot 5 : la racine porte le champ d'observation, son script identique à sa source, et ses observateurs » ; « 1.0.1 : le module champ-depot pour les nœuds et les agents de couche, le module champ entier pour la racine et les observateurs » |
| D5.INV-3 | `tests/champ.test.mjs` : « P5 : une correction répétée fait attendre une proposition d'ordre 2, à la deuxième correction » ; « P5 : la proposition d'ordre 2 attend l'examen de l'ordre 3, puis la décision du développeur » ; « P5 : deux propositions refusées mettent le motif en veille ; l'ordre 2 ne s'y éveille plus » |
| D5.INV-4 | `tests/champ.test.mjs` : « P5 : un écart dans un sous-ticket menace le critère du parent qu'il soutient, jusqu'au critère d'acceptation » ; « P5 : un désaccord entre nœuds va au registre des écarts, décision laissée au développeur » ; « Visiteur : chaque critère de l'arbre accepte un visiteur, qui l'atteint après les critères qui le soutiennent » ; « le champ du projet résolu prouve chaque critère d'acceptation, sans désaccord ni attente » |
