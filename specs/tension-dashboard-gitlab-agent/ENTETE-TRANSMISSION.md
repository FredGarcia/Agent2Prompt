# Tension Dashboard & Assistant GitLab : spécification {{VERSION}}, transmission texte

Ce texte contient à la fois la consigne de travail et la spécification complète. Il n'y a aucune pièce jointe. La spécification est découpée en fichiers, chacun délimité ainsi :

    <<<FICHIER chemin/relatif>>>
    ...contenu exact du fichier...
    <<<FIN chemin/relatif>>>

---

Tu vas construire le projet décrit par cette spécification. Elle fait foi. Si tu relèves un écart ou une ambiguïté, signale-le au développeur. Ne corrige pas la spécification toi-même.

## Étape 0 : matérialiser la spécification

1. Crée un dépôt de projet vide. À sa racine, crée le dossier `spec/`.
2. Pour chaque bloc `<<<FICHIER chemin>>>` … `<<<FIN chemin>>>`, crée le fichier `spec/chemin` avec le contenu exact compris entre les deux lignes délimitrices. Ces deux lignes ne font pas partie du fichier. Ne reformule rien, ne traduis rien, ne complète rien.
3. Si tu disposes d'un shell, vérifie chaque fichier avec `sha256sum` contre la table d'intégrité en fin de texte. Signale tout écart avant de continuer.
4. Le dossier `archives/` cité par `manifest.json` n'est pas transmis. Ne le recrée pas : il contient les versions antérieures, conservées par le développeur.

Les chemins internes à la spécification (`modules/...`, `SKILL.md`) sont relatifs à `spec/`. Les fichiers de code (`src/...`, `test/...`) se placent à la racine du projet, à côté de `spec/`.

## Étape 1 : lecture, sans écrire de code

1. Lis `spec/SKILL.md` en entier, puis `spec/manifest.json`.
2. Lis les modules actifs dans cet ordre : `tension`, `etats`, `verdict-journal`, `messagerie`, `dashboard`, `effecteur-gitlab`.
3. Ne lis `spec/regulation-inter-agents.md` que pour comprendre les points d'extension E1 à E6. Ne l'implémente pas : son statut est `reserved`.

## Étape 2 : plan, sans code

Soumets au développeur :

- l'arborescence des fichiers à créer, en reprenant la section « Fichiers à produire » de chaque module ;
- les choix techniques que la spécification ne couvre pas ;
- tes questions.

Attends la validation du développeur avant d'écrire la moindre ligne de code.

## Étape 3 : implémentation par étapes

Après validation, implémente dans cet ordre. Chaque étape doit passer tous ses tests avant la suivante.

1. **Noyau pur** : `src/core/model.js`, `src/core/tension.js`, `src/core/bounds.js`, `src/core/states.js`. Aucune entrée-sortie.
2. **Persistance** : `src/store/schema.js` (migration 1 exactement telle que décrite dans le module `verdict-journal`, section 2.1), `src/store/journal.js`, `src/core/replay.js`.
3. **Git en lecture** : `src/git/snapshot.js`, testé sur des dépôts temporaires.
4. **Messagerie** : `src/core/envelope.js`, `src/agents/messenger.js`, `src/cli/tension-arbitrer.js`.
5. **Tableau de bord** : `src/dashboard/*`, en lecture seule.
6. **Effecteur GitLab** : `src/assistant/*`, en dry-run par défaut.

Le premier livrable attendu est l'étape 1 de l'implémentation : le noyau pur et ses tests.

## Règles qui ne se négocient pas

- Chaque module et chaque test cite l'invariant qu'il vérifie, par exemple `// D2.INV-1`. Un invariant sans test n'est pas implémenté.
- N'implémente aucune dimension au statut `reserved`.
- Aucun `--force` ni `--force-with-lease`. Aucun `shell: true`. Aucun secret dans les journaux, les messages ou les URL.
- Les tests n'accèdent à aucun réseau.
- Aucune dépendance hors de la stack de `spec/SKILL.md` sans validation du développeur.
- Identifiants de code en anglais. Commentaires, messages au développeur et journaux en français.
- N'invente ni champ, ni endpoint, ni comportement absent de la spécification. En cas de doute, pose une question.
- Ne modifie jamais les fichiers de `spec/`.

## Compte rendu à la fin de chaque étape

- fichiers créés ou modifiés ;
- invariants couverts, et tests qui les vérifient ;
- résultat de `npm test` ;
- écarts avec la spécification, ou ambiguïtés rencontrées.

## À vérifier sur la machine réelle

- **Git** : `git merge-tree --write-tree --name-only` doit être disponible, à partir de Git 2.38. Si l'option manque, documente la méthode de repli et signale-le.
- **GitLab** : les endpoints du module `effecteur-gitlab`, section 5, n'ont pas été testés sur une instance réelle. Ne les considère pas comme vérifiés tant que le développeur ne l'a pas confirmé.

Commence par l'étape 0, puis l'étape 1.

---

# Spécification
