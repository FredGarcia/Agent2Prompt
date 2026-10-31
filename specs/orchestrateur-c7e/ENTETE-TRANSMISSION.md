# Orchestrateur fractal C7E : skill orchestrateur-c7e {{VERSION}}, transmission texte

Ce texte contient à la fois la consigne de travail et le skill complet. Il n'y a aucune pièce jointe. Le skill est découpé en fichiers, chacun délimité ainsi :

    <<<FICHIER chemin/relatif>>>
    ...contenu exact du fichier...
    <<<FIN chemin/relatif>>>

---

À partir de maintenant, tu installes l'orchestrateur C7E décrit par ce texte dans le projet du développeur, puis tu l'appliques à chaque ticket qu'il te confie. Le skill fait foi. Si tu relèves une ambiguïté ou une contradiction dans le skill, signale-la au développeur. Ne corrige pas le skill toi-même.

## Étape 0 : matérialiser le skill

1. Crée le dossier `.skills/orchestrateur-c7e/` à la racine du dépôt du projet, ou à l'emplacement que le développeur indique. Dans la disposition du kit `agents-paralleles-gitlab`, c'est `~/dev/<projet>/.skills/orchestrateur-c7e/`, hors des worktrees. Dans un clone ordinaire, ajoute `/.skills/` à `.git/info/exclude` s'il n'y est pas : le skill ne doit pas apparaître dans `git status`.
2. Pour chaque bloc `<<<FICHIER chemin>>>` … `<<<FIN chemin>>>`, crée le fichier `chemin` dans ce dossier, avec le contenu exact compris entre les deux lignes délimitrices. Ces deux lignes ne font pas partie du fichier. Ne reformule rien, ne traduis rien, ne complète rien.
3. Si tu disposes d'un shell, vérifie chaque fichier avec `sha256sum -c` contre la table d'intégrité en fin de texte ; sous Windows, Git Bash fournit `sha256sum`. Signale tout écart avant de continuer.

## Étape 1 : lecture

Lis `SKILL.md` en entier, puis `manifest.json`, `meso-contrats.md`, `socle/SKILL.md`, et les sections « Versions cibles » et « Invariants » de `references/java.md` et `references/angular.md`. Ces deux derniers fichiers sont des **référentiels** : tu y lis les versions cibles et les invariants que tout code produit doit respecter, sans adopter leur rôle, leur mode de travail ni leurs consignes de démarrage. Ne lis `modules/mesure/SKILL.md` que pour comprendre le point d'extension E1 : cette dimension est réservée.

## Étape 2 : installation dans le projet

Suis la section 11.3 de `SKILL.md`, avec le développeur :

1. Copie `meso-contrats.md` à `docs/c7e/meso-contrats.md`, ou à l'emplacement qu'il indique. Liste-lui les valeurs `ADAPTER` à remplir ; ne les remplis pas toi-même.
2. Crée `docs/c7e/registre-ecarts.md`, `docs/c7e/concepts.json` (registre de départ, § 7.2) et `docs/c7e/connaissances.md`.
3. Propose-lui le fichier de contexte du lancement de l'IA locale (§ 11.4). Ne le crée qu'avec son accord.
4. Rejoue avec lui les scénarios R1 à R10 (§ 15) quand il le demande.

## Étape 3 : chaque ticket

Applique la section 3 de `SKILL.md` : analyse et fiche de transformation, validation par le développeur, puis transformation par slot, preuves et remise.

## Règles qui ne se négocient pas

- Aucune modification du projet avant la validation de la fiche ; aucun code de niveau d=2 avant la gate contrats.
- Tu ne modifies jamais le fichier d'invariants du projet. Dans le registre des concepts, tu ne fais qu'ajouter des entrées `proposed`. Tout écart à un invariant s'inscrit au registre des écarts.
- Une branche par ticket ; chaque commit commence par la clé du ticket. Tu ne pousses pas, ne fusionnes pas, ne rebases pas et ne poses aucun tag. Un refus « REFUS : » d'un hook t'arrête : tu le cites au développeur, sans le contourner.
- Aucun test existant n'est supprimé ni affaibli sans l'accord du développeur.
- Le socle et les invariants des référentiels s'appliquent à tout code produit ; en cas de contradiction, le socle l'emporte et tu le signales.
- Toute valeur annoncée de la méthode est une hypothèse tant qu'elle n'est pas mesurée.
- N'applique aucune dimension au statut `reserved`.

Commence par l'étape 0, puis l'étape 1, puis l'étape 2.

---

# Skill
