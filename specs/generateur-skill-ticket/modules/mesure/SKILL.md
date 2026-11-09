---
name: mesure
description: Mesure du contexte chargé par un arbre de skills de ticket (session de chaque nœud, agents de couche, sous-agents de rôle, observateurs, bornes à l'activation et au plus, comparaison au point d'entrée de l'orchestrateur, relectures, rapports versionnés, calibrage par une mesure réelle sur le poste). À lire pour mesurer ou comparer le contexte d'un arbre.
dimensions: [D7]
status: active
---

# Module `mesure` (D7)

Chaque session de nœud et chaque agent a son propre contexte : c'est ce qui borne chaque contexte, et ce qui rend une observation indépendante du travail qu'elle observe (D7.INV-1). `mesurer-contexte.mjs`, outil du générateur que les skills ne portent pas, mesure sans modèle ce que charge chaque contexte d'un arbre et le compare au point d'entrée de l'orchestrateur.

## 1. Ce qui se mesure

Pour chaque nœud : la session de son skill, chaque agent de couche, chaque sous-agent de rôle que sa consigne nomme ; puis les deux observateurs de l'arbre, une fois pour l'arbre. Deux bornes :

| Borne | Ce qu'elle compte |
|---|---|
| à l'activation | ce que Gemini CLI charge de lui-même : noms et descriptions des skills et des agents installés, corps du skill activé ou de l'agent invoqué |
| au plus | en plus, ce que la consigne fait lire pour résoudre le ticket : modules et fichiers cités, copie du projet du fichier d'invariants, documents de la clé, vue du nœud ; jamais ce qu'elle fait écrire, ni le champ, lu par la vue, ni le code d'un script, qui se lance |

Ce qui compte comme lu : les modules et les fichiers que citent les sections 2 à 10 d'une consigne de skill, ou tout le corps d'un agent ; un seul niveau de citations ; une lecture partielle compte le fichier entier ; un chemin qui vaut pour chaque sous-ticket compte chacun. Le point d'entrée de l'orchestrateur se mesure de la même façon, selon l'ordre de lecture qu'écrit son `SKILL.md`, pour le même ticket (D7.INV-2). Tailles en caractères, tokens estimés à un pour quatre caractères.

Le rapport compare chaque feuille à l'orchestrateur, à chaque borne, puis donne le plus grand contexte de l'arbre, la somme de tous ses contextes, et les fichiers relus d'un contexte à l'autre. Rapports versionnés : `exemples/contexte/ABCDE-3620.md`, sur le projet d'exemple résolu, et `exemples/contexte/ABCDE-3512.md` ; ceux du lot 7 du prototype, que recopie le bilan, sont figés dans `exemples/contexte/lot-7/`.

## 2. Commandes

```bash
node <dépôt>/specs/generateur-skill-ticket/outils/mesurer-contexte.mjs mesurer <dossier>/transmissions [--projet <projet>] [--json] [--sortie <rapport.md>]
node <dépôt>/specs/generateur-skill-ticket/outils/mesurer-contexte.mjs calibrer <base.json> <activation.json> --caracteres <n>
```

Les rapports des exemples changent avec les transmissions attendues, ou avec l'orchestrateur ; la recette le signale, et ils se régénèrent par `mesurer … --sortie`.

## 3. Mesure réelle sur le poste

La mesure statique estime les tokens ; une mesure réelle la recale, sur le poste du développeur, avec Gemini CLI 0.67.0 et sa clé, déjà configurée, jamais demandée ni affichée. Dans un workspace d'essai de confiance où l'arbre ABCDE-3620 est installé :

1. Session de base, qui n'active aucun skill : `gemini --approval-mode plan -p "Réponds seulement : prêt." -o json > base.json`. Sans interface, Gemini CLI refuse par défaut l'activation d'un skill.
2. Session d'activation, avec une politique qui n'autorise que l'activation, dans un fichier `calibrage.toml` hors du dépôt :

   ```toml
   [[rule]]
   toolName = "activate_skill"
   decision = "allow"
   priority = 100
   ```

   puis `gemini --approval-mode plan --policy calibrage.toml -p "Active le skill ticket-abcde-3620-1-1, puis réponds seulement : activé." -o json > activation.json`.
3. `node <dépôt>/specs/generateur-skill-ticket/outils/mesurer-contexte.mjs calibrer base.json activation.json --caracteres 12566`, où 12 566 est la taille du corps du skill activé, que donne le rapport.

`calibrer` lit les statistiques des deux sorties, attend une requête pour la base et deux pour l'activation, et donne le nombre de caractères par token du skill, à comparer à quatre ; si les requêtes ne sont pas celles attendues, il le relève et ne conclut pas. Les sorties ne contiennent que la réponse et les statistiques ; aucune clé n'y figure.

## 4. Recette

| Invariant | Preuves |
|---|---|
| D7.INV-1 | `tests/contexte.test.mjs` : « le rapport regénéré est le rapport versionné, octet pour octet » ; « P7 : chaque feuille est comparée au point d'entrée de l'orchestrateur, à chaque borne ; l'arbre entier aussi » ; « calibrage : tokens du skill tirés de deux sorties -o json de Gemini CLI, et caractères par token » |
| D7.INV-2 | `tests/contexte.test.mjs` : « chaque fichier compté existe, a la taille comptée, et la consigne qui le fait lire le cite » ; « P7 : le point d'entrée de l'orchestrateur se mesure selon son propre ordre de lecture » ; « citations : modules, chemins, fichier d'invariants cité sans son chemin, vue d'un nœud ; ni script, ni dossier, ni chemin absolu » ; « sections lues : ni la place dans l'arbre ni la table des fichiers d'une consigne ; tout le corps d'un agent » |
