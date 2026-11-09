---
name: vue
description: Vue augmentée d'un arbre de skills de ticket (ancres du ticket et ancres nées du champ, piles, quatre calques posés sans toucher à l'état, états et marques, rangement par critère d'acceptation, page vue.html accessible et autonome, vue d'un nœud, fraîcheur, commandes de vue.mjs). À lire pour voir un arbre installé tel que le champ l'augmente.
dimensions: [D6]
status: active
---

# Module `vue` (D6)

Chaque niveau voit le ticket augmenté des observations des autres niveaux. Le ticket n'est jamais réécrit : ses ancres restent celles de ses documents, et les calques posés sur elles changent avec le champ. `vue.mjs`, livré tel quel dans le skill racine à côté de `champ.mjs`, tire la vue du champ et des documents de la clé ; elle ne s'écrit ni ne se corrige à la main (D6.INV-1).

## 1. Commandes

| Commande | Effet |
|---|---|
| `generer <dossier>` | écrit `vue.html`, pour le développeur, et `vue.md`, pour les agents, dans le dossier de la clé ; un champ altéré ne donne pas de vue, et rien n'est écrit |
| `generer <dossier> --noeud <référence>` | écrit sur la sortie la vue de ce nœud, en Markdown, sans rien écrire : ses critères avec ceux qui les soutiennent, les scénarios qui les prouvent, son nœud, les autres ancres où il a déposé, avec ce que les autres niveaux y ont mis ; la vue du nœud racine est la vue entière ; elle se lit même avant le premier dépôt |
| `generer <dossier> --json` | le modèle de la vue, `skill-ticket.vue/1` : ancres, états, marques, calques, rangement, à traiter |
| `verifier <dossier>` | les vues écrites sont-elles à jour, périmées (tirées d'un champ plus court), modifiées ou absentes ? |

Depuis la racine du projet : `node .gemini/skills/ticket-<clé>/outils/vue.mjs <commande> docs/demandes/<clé> …`. Chaque nœud lit sa vue à son lancement, les observateurs la vue entière ; la racine la présente à la ratification de l'arbre et à la clôture, et la cite dans sa remise. La vue ne se commite pas.

## 2. Ancres, piles et calques

Les ancres du ticket : critères d'acceptation de `us.md`, critères des nœuds, avec les énoncés que porte le rattachement, scénarios du fichier Gherkin, nœuds ; puis les ancres nées du champ, fichier, commit, contrat, option. La pile d'une ancre est ce qui l'atteint, directement, ou par ce qu'il vise ou observe ; une ratification atteint son nœud (D6.INV-2).

Quatre calques se posent sur l'ancre, dans l'ordre des ordres : ordre 1, ordre 2, ordre 3, humain (Décorateur). Masquer un calque ne change pas l'état de l'ancre. L'état résume la pile : pour un critère, celui que lui donne le champ ; pour une autre ancre observée, en désaccord, en écart, conforme ou non observée ; pour un scénario, à réaliser, réalisé ou à reprendre ; pour un nœud, ratifié, non ratifié ou à ratifier. Des marques signalent les observations attendues et les motifs en veille ; un critère en désaccord garde l'état que lui donne le champ, la marque du désaccord le met en tête de ce qui est à traiter.

## 3. Rangement et page

La vue s'ouvre sur ce qui est à traiter, par gravité : désaccords, écarts, menaces, observations attendues ; puis chaque critère d'acceptation, suivi des critères qui le soutiennent jusqu'aux feuilles et des scénarios qui le prouvent, rangés par un second visiteur des critères ; les nœuds ; les ancres nées du champ. Un critère d'un nœud dit l'état de ce qu'il soutient : une feuille voit l'effet de ses écarts sur son parent et sur le critère d'acceptation.

La page `vue.html` est autonome, sans réseau ni ressource extérieure : calques à afficher ou masquer, filtre par nœud avec un message d'état, états écrits en toutes lettres avec un symbole d'appoint, thèmes clair et sombre aux contrastes AA ; elle se lit au clavier et sans JavaScript, ses commandes n'apparaissant qu'avec lui (D6.INV-3). Mêmes champ et documents, même vue, octet pour octet ; son en-tête cite la tête du champ dont elle est tirée (D6.INV-1).

## 4. Recette

La recette rejoue le scénario d'essai du champ jusqu'à trois moments, dont les vues sont versionnées dans `exemples/ABCDE-3620-champ/vues/`, et compare les vues finales de l'essai et du projet résolu à celles qu'elle regénère ; `node specs/generateur-skill-ticket/tests/vue-scenarios.mjs --ecrire` réécrit les vues versionnées après un changement voulu du rendu.

| Invariant | Preuves |
|---|---|
| D6.INV-1 | `tests/vue.test.mjs` : « déterminisme : même champ et mêmes documents, même vue ; fins de ligne CRLF sans effet » ; « P6 : vues finales de l'essai et du projet résolu identiques aux vues versionnées, et à jour » ; « P6 : la vue de l'essai au n° » ; « vérification : un champ altéré ne donne pas de vue, et rien n'est écrit » ; « vérification : vue à jour, puis périmée après un dépôt, modifiée à la main, absente » |
| D6.INV-2 | `tests/vue.test.mjs` : « P6 : piles recalculées sans le script » ; « P6 : l'état de chaque critère est celui que lui donne le champ, à chaque dépôt de l'essai » ; « Décorateur : les calques se posent sur l'ancre dans l'ordre des ordres, sans toucher à son état » ; « Visiteur : la vue se range par critère d'acceptation, chaque critère suivi de ceux qui le soutiennent » ; « vue d'un nœud : ses ancres, et ce que les autres niveaux y ont déposé ; la vue du nœud racine est la vue entière » |
| D6.INV-3 | `tests/vue.test.mjs` : « page : structure accessible, autonome, lisible sans JavaScript » |
