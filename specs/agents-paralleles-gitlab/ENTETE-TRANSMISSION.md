# Agents en parallèle sur GitLab : spécification {{VERSION}}, transmission texte

Ce texte contient à la fois la consigne de travail et la spécification complète. Il n'y a aucune pièce jointe. La spécification est découpée en fichiers, chacun délimité ainsi :

    <<<FICHIER chemin/relatif>>>
    ...contenu exact du fichier...
    <<<FIN chemin/relatif>>>

---

Tu vas mettre en place, pour le développeur, le kit décrit par cette spécification : un dépôt nu partagé, un worktree par demande Jira, des hooks communs, le script `agt`, la recette, et la fiche des garde-fous GitLab. La spécification fait foi. Si tu relèves un écart ou une ambiguïté, signale-le au développeur. Ne corrige pas la spécification toi-même.

## Étape 0 : matérialiser la spécification

1. Demande au développeur le dossier racine du kit (par exemple `~/dev/<projet>/`). Crée-y `.skills/agents-paralleles-gitlab/`, hors de tout worktree.
2. Pour chaque bloc `<<<FICHIER chemin>>>` … `<<<FIN chemin>>>`, crée le fichier `chemin` dans ce dossier, avec le contenu exact compris entre les deux lignes délimitrices. Ces deux lignes ne font pas partie du fichier. Ne reformule rien, ne traduis rien, ne complète rien.
3. Si tu disposes d'un shell, vérifie chaque fichier avec `sha256sum -c` contre la table d'intégrité en fin de texte. Signale tout écart avant de continuer.
4. Le dossier `archives/` cité par `manifest.json` n'est pas transmis. Ne le recrée pas.

## Étape 1 : lecture, sans rien installer

Lis `SKILL.md` en entier, puis `manifest.json`, puis les modules actifs dans l'ordre : `isolation`, `hooks`, `orchestration`, `gitlab`, `distribution`, `recette`. Ne lis `modules/controle-gitlab/SKILL.md` et `modules/tension-depot/SKILL.md` que pour comprendre les points d'extension E1 et E2 : ces dimensions sont réservées.

## Étape 2 : cadrage, sans rien installer

Obtiens du développeur, puis reformule dans une fiche de cadrage :

- l'URL SSH du dépôt GitLab, et s'il faut créer un dépôt nu neuf ou partir d'un clone existant (module `isolation`, section 2) ;
- le nom de la branche d'intégration (`develop` par défaut, sinon `AGT_BASE`) ;
- l'édition GitLab (Free, Premium ou Ultimate), qui fixe les garde-fous disponibles (module `gitlab`) ;
- les points chauds propres au projet, s'ils diffèrent de ceux par défaut (`AGT_POINTS_CHAUDS`, module `distribution`) ;
- la présence de Husky ou d'un outil qui réécrit `core.hooksPath` (module `hooks`, section 5).

Attends la confirmation du développeur avant toute écriture.

## Étape 3 : installation

1. Crée ou convertis la disposition du module `isolation`.
2. Écris les six fichiers du kit à l'identique depuis les modules `hooks`, `orchestration`, `gitlab` et `recette`, puis compare-les aux blocs des modules.
3. Lance `recette.sh` sur un dossier de test, avec `.bare/` comme dépôt source : il n'est que lu. Les 44 contrôles doivent réussir.
4. Lance `./agt ls` : « hooks : actifs », aucune ALERTE.
5. Remplis la fiche du module `gitlab` selon l'édition, pour le Maintainer. Tu ne configures pas GitLab toi-même.

## Règles qui ne se négocient pas

- Aucune écriture dans GitLab. Aucun jeton demandé, lu ou écrit. Si le développeur colle un jeton dans la conversation, signale-le et recommande de le révoquer.
- Aucun `--force`, aucun `--force-with-lease`, aucune réécriture d'un commit publié.
- Le code du kit est reproduit à l'identique ; une adaptation passe par les variables d'environnement.
- Aucune commande destructive sur le dépôt du développeur : `recette.sh` travaille sur des copies, dans un dossier de test.
- N'implémente aucune dimension au statut `reserved`.
- Ne modifie jamais les fichiers de la spécification.

## Compte rendu

- disposition créée ou convertie, avec ses chemins ;
- résultat de `recette.sh` : ligne finale et échecs éventuels ;
- sortie de `./agt ls` ;
- fiche GitLab remplie ;
- écarts avec la spécification, ou ambiguïtés rencontrées.

Commence par l'étape 0, puis l'étape 1.

---

# Spécification
