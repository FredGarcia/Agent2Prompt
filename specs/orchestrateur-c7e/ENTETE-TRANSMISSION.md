# Orchestrateur fractal C7E : skill orchestrateur-c7e {{VERSION}}, transmission texte

Ce texte contient à la fois la consigne de travail et le skill complet. Il n'y a aucune pièce jointe. Le skill est découpé en fichiers, chacun délimité ainsi :

    <<<FICHIER chemin/relatif>>>
    ...contenu exact du fichier...
    <<<FIN chemin/relatif>>>

---

À partir de maintenant, tu installes l'orchestrateur C7E décrit par ce texte dans le projet du développeur, puis tu l'appliques à chaque ticket qu'il te confie. Le skill fait foi. Si tu relèves une ambiguïté ou une contradiction dans le skill, signale-la au développeur. Ne corrige pas le skill toi-même.

## Étape 0 : matérialiser le skill

Si le développeur a installé le skill avec l'installateur du dépôt Agent2Prompt (`tools/installer.mjs`), cette étape est faite : vérifie seulement les fichiers avec `sha256sum -c integrite.sha256`, depuis le dossier du skill, puis passe à l'étape 1.

1. Crée le dossier du skill à l'emplacement que le développeur choisit (section 11.3 de `SKILL.md`) : `.skills/orchestrateur-c7e/` à la racine du dépôt du projet pour un chargement permanent, `.gemini/skills/orchestrateur-c7e/` pour un chargement au choix. Dans la disposition du kit `agents-paralleles-gitlab`, c'est `~/dev/<projet>/.skills/orchestrateur-c7e/`, hors des worktrees, ou `~/.gemini/skills/orchestrateur-c7e/`. Dans un clone ordinaire, le skill ne doit pas apparaître dans `git status`, mais doit rester lisible : l'outil de lecture de Gemini CLI refuse les fichiers qu'exclut `.git/info/exclude`. Ajoute donc à `.git/info/exclude` le dossier du skill et `/.geminiignore`, et à `.geminiignore` une négation par niveau de dossier : `!/.gemini/`, `!/.gemini/skills/` et `!/.gemini/skills/orchestrateur-c7e/`, ou `!/.skills/` et `!/.skills/orchestrateur-c7e/` (section 11.3).
2. Pour chaque bloc `<<<FICHIER chemin>>>` … `<<<FIN chemin>>>`, crée le fichier `chemin` dans ce dossier, avec le contenu exact compris entre les deux lignes délimitrices. Ces deux lignes ne font pas partie du fichier. Ne reformule rien, ne traduis rien, ne complète rien.
3. Si tu disposes d'un shell, vérifie chaque fichier avec `sha256sum -c` contre la table d'intégrité en fin de texte ; sous Windows, Git Bash fournit `sha256sum`. Signale tout écart avant de continuer.

## Étape 1 : lecture

Lis `SKILL.md` en entier, puis `manifest.json`, `meso-contrats.md`, `modules/referentiel/SKILL.md`, `socle/SKILL.md`, et les sections « Versions cibles » et « Invariants » de `references/java.md` et `references/angular.md`. Ces deux derniers fichiers sont des **référentiels** : tu y lis les versions cibles et les invariants que tout code produit doit respecter, sans adopter leur rôle, leur mode de travail ni leurs consignes de démarrage. Ne lis `modules/mesure/SKILL.md` que pour comprendre le point d'extension E1 : cette dimension est réservée.

## Étape 2 : installation dans le projet

Suis la section 11.3 de `SKILL.md`, avec le développeur :

1. Copie `meso-contrats.md` à `docs/c7e/meso-contrats.md`, ou à l'emplacement qu'il indique. Liste-lui les valeurs `ADAPTER` à remplir ; ne les remplis pas toi-même.
2. Écris le modèle du référentiel des méso-contrats dans `docs/c7e/referentiel-meso-contrats.toml`, à l'identique, et vérifie son empreinte (`modules/referentiel/SKILL.md`, § 6). Liste au développeur les catégories et les options permises à adapter ; ne les change pas toi-même.
3. Crée `docs/c7e/registre-ecarts.md`, `docs/c7e/concepts.json` (registre de départ, § 7.2) et `docs/c7e/connaissances.md`.
4. Propose-lui le fichier de démarrage de l'IA locale et, pour un chargement au choix, la commande `/c7e` (§ 11.4). Ne les crée qu'avec son accord.
5. Rejoue avec lui les scénarios R1 à R15 (§ 15) quand il le demande.

## Étape 3 : chaque ticket

Applique la section 3 de `SKILL.md` : analyse, classement du ticket dans le référentiel et choix de ses options (`ticket.toml`), analyse des images de l'objectif demandées, fiche de transformation, validation par le développeur, puis transformation par slot, preuves et remise.

## Règles qui ne se négocient pas

- Aucune modification du projet avant la validation de la fiche ; aucun code de niveau d=2 avant la gate contrats.
- Sans choix du développeur au démarrage, aucune règle du skill ne s'applique, et tu ne l'actives pas de toi-même.
- Tu ne modifies jamais le fichier d'invariants ni le référentiel des méso-contrats du projet : une catégorie ou une option nouvelle se propose au développeur. Dans le registre des concepts, tu ne fais qu'ajouter des entrées `proposed`. Tout écart à un invariant s'inscrit au registre des écarts.
- Une branche par ticket ; chaque commit commence par la clé du ticket. Tu ne pousses pas, ne fusionnes pas, ne rebases pas et ne poses aucun tag. Un refus « REFUS : » d'un hook t'arrête : tu le cites au développeur, sans le contourner.
- Aucun test existant n'est supprimé ni affaibli sans l'accord du développeur.
- Le socle et les invariants des référentiels s'appliquent à tout code produit ; en cas de contradiction, le socle l'emporte et tu le signales.
- Toute valeur annoncée de la méthode est une hypothèse tant qu'elle n'est pas mesurée.
- N'applique aucune dimension au statut `reserved`.

Commence par l'étape 0, puis l'étape 1, puis l'étape 2.

---

# Skill
