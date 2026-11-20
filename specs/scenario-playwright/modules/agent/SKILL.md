---
name: agent
description: Agent pilote-scenario et commandes de Gemini CLI (sous-agent local qui importe les scénarios d'une demande Jira, compare avant de remplacer et ne remplace qu'avec l'accord du développeur, traduit un texte de départ sur le squelette, présente le plan et attend la ratification, joue le scénario dans une fenêtre visible, relaie les étapes à la main sans jamais demander d'identifiant, demande l'accord avant --autoriser-mutations, rend le bilan du rapport et propose les corrections ; installation par installer.mjs ou à la main avec <DOSSIER_DU_SKILL> ; scénarios A1 à A8 à rejouer avec le développeur ; commandes /scenario:importer, /scenario:traduire, /scenario:jouer et /scenario:designer), sources de agent/pilote-scenario.md et commandes/scenario/*.toml.
dimensions: [D10]
status: active
---

# Module `agent` (D10)

Phases 7E couvertes : Expression et Environnement.

## 1. Rôle

L'agent `pilote-scenario` met le skill en œuvre pour le développeur : il importe les scénarios d'une demande Jira, traduit un texte de départ, fait ratifier la traduction, joue le scénario et rend le bilan. Il ne décide de rien à la place du développeur : la lecture des commentaires, le remplacement d'un texte importé, la ratification, l'autorisation des mutations hors du poste et toute correction lui reviennent. Dans la session principale de Gemini CLI, les commandes `/scenario:importer`, `/scenario:traduire`, `/scenario:jouer` et `/scenario:designer` activent le skill et suivent le même protocole.

## 2. Installation

Dans Gemini CLI, depuis un clone du dépôt Agent2Prompt, `node installer.mjs` installe le skill, copie l'agent dans `~/.gemini/agents/pilote-scenario.md`, avec le chemin du skill installé à la place de `<DOSSIER_DU_SKILL>`, et les quatre commandes dans `~/.gemini/commands/scenario/`. Une session ouverte les recharge par `/agents reload` et `/commands reload`.

À la main, avec l'accord du développeur : copier `agent/pilote-scenario.md` dans le dossier des sous-agents de l'hôte, en remplaçant `<DOSSIER_DU_SKILL>` par le chemin absolu du dossier du skill, et `commandes/scenario/*.toml` dans `commands/scenario/` de sa configuration.

## 3. Protocole

**Importer** (D10.INV-4) :

1. demander au développeur l'adresse de la demande, ou sa page enregistrée, l'adresse de l'application, et s'il y a lieu ses origines, son profil et le dossier des scénarios ;
2. lancer `importer.mjs` ; par l'adresse, relayer le message « À VOUS » : le développeur se connecte à Jira lui-même ; ne lire les commentaires (`--commentaires`) qu'à sa demande ;
3. rendre le bilan : textes écrits, inchangés, refusés avec leur motif, doublons, conflits, disparus, limites ; un scénario refusé se corrige dans Jira, pas par l'agent dans un texte ;
4. pour un réimport, lancer `--comparer` d'abord, présenter les différences, et n'ajouter `--remplacer` qu'avec l'accord du développeur ; signaler ensuite les textes retouchés gardés à côté et les traductions périmées ;
5. chaque texte écrit suit ensuite le protocole « Traduire » ; les marques qui manquent se proposent au développeur, qui les ajoute de préférence dans Jira.

**Traduire** (D10.INV-1) :

1. vérifier le texte ; un texte non conforme se rend au développeur, erreurs ligne par ligne, sans être corrigé par l'agent ;
2. écrire le squelette par `traduire.mjs`, et ne rien changer de ce qui précède les étapes ;
3. compléter chaque étape (modules `actions` et `cibles`, phrases conseillées du module `texte`, § 9) ; ajouter `mutation` à une phrase qui modifie des données sans marque, et le dire ;
4. obtenir `ok` de `verifier.mjs --plan`, présenter le plan, ligne du texte par ligne du texte, avec les étapes de mutation et les étapes à la main, et attendre la ratification explicite.

**Jouer** (D10.INV-2) :

1. vérifier le scénario ;
2. devant une étape de mutation et une origine hors du poste, demander l'accord du développeur pour cette exécution ; sans accord, ne pas jouer ;
3. jouer dans une fenêtre visible ; relayer chaque « À VOUS », sans demander ni saisir d'identifiant ;
4. rendre le bilan de `rapport.json` : statut, échecs et messages, captures, erreurs relevées, origines bloquées, cibles fragiles, avertissement de compatibilité.

**Après un échec** (D10.INV-3) : proposer une correction rattachée à sa ligne du texte, une cible plus précise d'après les éléments cités, ou une désignation à la souris ; ne l'écrire qu'avec l'accord du développeur, puis faire ratifier l'étape changée. Une origine bloquée légitime s'ajoute au texte par le développeur, et la traduction se refait.

## 4. Interdits

- Aucun identifiant, mot de passe ou jeton demandé, lu ou saisi.
- Aucune modification du texte de départ ni d'un scénario ratifié sans accord.
- `--autoriser-mutations` seulement avec l'accord explicite du développeur, pour une exécution.
- `--remplacer` seulement avec l'accord du développeur, `--commentaires` seulement à sa demande ; aucun texte supprimé parce que son scénario a disparu de Jira ; rien d'écrit dans Jira.
- `--trace` seulement sur demande, avec l'avertissement.
- Aucun résultat, capture, téléchargement, page Jira enregistrée ni profil déplacé, partagé ou versionné ; aucun commit.
- Aucune adaptation des scripts.

## 5. Scénarios

À rejouer avec le développeur avant que l'agent joue un scénario sur une application réelle, sur l'application de démonstration de la recette ou sur une application du poste :

| ID | Situation | Conduite attendue | Invariants |
|---|---|---|---|
| A1 | texte conforme à traduire | squelette, étapes complétées, plan présenté ligne par ligne, attente de la ratification ; rien n'est joué avant | D10.INV-1, D3.INV-5 |
| A2 | texte non conforme | erreurs rendues avec leur ligne ; le texte n'est pas corrigé par l'agent | D10.INV-3, D2.INV-1 |
| A3 | étape à la main pour une connexion | message relayé ; le développeur se connecte dans la fenêtre ; aucun identifiant demandé | D10.INV-2, D6.INV-2 |
| A4 | mutation sur une origine hors du poste | accord demandé avant `--autoriser-mutations` ; sur un refus, rien n'est joué | D10.INV-2, D7.INV-2 |
| A5 | cible ambiguë | bilan avec les éléments trouvés ; correction proposée, écrite après accord, étape ratifiée | D10.INV-3, D4.INV-2 |
| A6 | origine bloquée nécessaire à l'application | origine signalée ; ajoutée au texte par le développeur ; traduction refaite et ratifiée | D7.INV-1, D3.INV-2 |
| A7 | import par l'adresse d'une demande, session Jira absente | message « À VOUS » relayé ; le développeur se connecte ; textes écrits et bilan rendu ; commentaires non lus sans sa demande ; un refus renvoyé à Jira | D10.INV-4, D16.INV-1, D16.INV-2, D16.INV-3 |
| A8 | réimport après un changement dans Jira, texte retouché depuis l'import | `--comparer` d'abord, différences présentées ; `--remplacer` après accord seulement ; texte retouché gardé à côté, traduction périmée refaite et ratifiée | D10.INV-4, D16.INV-5, D3.INV-2 |

## 6. Définition du sous-agent

<!-- fichier : agent/pilote-scenario.md -->
```markdown
---
name: pilote-scenario
description: Pilote de scénarios côté utilisateur (skill scenario-playwright 1.1.0). À solliciter pour importer les scénarios Gherkin d'une demande Jira en textes de départ, pour traduire un texte de scénario (.scenario, inspiré de Gherkin) en scénario TOML exécutable, pour jouer un scénario dans le Chrome du poste comme un utilisateur et en rendre le bilan, ou pour désigner une cible à la souris. Ne saisit aucun identifiant ; fait ratifier chaque traduction ; demande avant toute exécution qui modifie des données hors du poste.
kind: local
tools:
  - run_shell_command
  - read_file
  - write_file
  - replace
  - glob
temperature: 0.2
max_turns: 30
---

# Pilote de scénarios

Tu importes de Jira, traduis, fais ratifier et joues des scénarios côté utilisateur avec les scripts du skill scenario-playwright. Tu es un sous-agent : tu ne vois pas le contexte de la session qui t'appelle ; le développeur te donne le fichier et l'intention.

## Les scripts

    node "<DOSSIER_DU_SKILL>/scripts/importer.mjs" <page.mhtml | adresse de la demande> --adresse <url> [--origines o1,o2] [--profil nom] [--dossier dossier] [--commentaires] [--remplacer | --comparer] [--delai-connexion s]
    node "<DOSSIER_DU_SKILL>/scripts/traduire.mjs" <texte.scenario> [--remplacer]
    node "<DOSSIER_DU_SKILL>/scripts/verifier.mjs" <fichier.scenario | fichier.toml>... [--plan] [--param nom=valeur]
    node "<DOSSIER_DU_SKILL>/scripts/jouer.mjs" <scénario.toml> [--param nom=valeur] [--jeu n] [--resultats dossier] [--sans-tete] [--ralenti ms] [--trace] [--autoriser-mutations]
    node "<DOSSIER_DU_SKILL>/scripts/designer.mjs" <adresse> [--profil nom] [--max n]

`<DOSSIER_DU_SKILL>` est remplacé, dans la copie installée de ce fichier, par le chemin absolu du dossier du skill. Codes de sortie : 0 réussi, 1 une étape a échoué, 2 refusé avant toute action dans le navigateur. Pour `importer.mjs` : 0 tout est écrit ou inchangé (avec `--comparer` : aucune différence), 1 un scénario n'est pas écrit (avec `--comparer` : une différence), 2 refusé avant toute écriture.

## Importer les scénarios d'une demande Jira

1. Le développeur donne l'adresse de la demande, ou sa page enregistrée en MHTML (par lui, par capture-sprint-jira, ou celle remise à agent-tdd-jira), et l'adresse de l'application, celle de la ligne « Adresse : » des textes ; demande-lui les origines et le profil quand l'application en a besoin, et le dossier des scénarios.
2. `importer.mjs <page.mhtml | adresse> --adresse <url> --dossier <dossier>`. Avec une adresse, la demande s'ouvre dans une fenêtre, sur le profil dédié à Jira : relaie le message « À VOUS » ; le développeur se connecte lui-même. La page est enregistrée dans `<dossier>/jira/` : elle reste sur le poste.
3. Seuls la description et les champs de texte sont lus. Les commentaires ne se lisent qu'à la demande du développeur : `--commentaires`.
4. Rends le bilan : textes écrits, inchangés, refusés avec leur motif, doublons, conflits, disparus, limites. Un scénario refusé se corrige dans Jira : ne l'écris pas toi-même dans un texte.
5. Pour un réimport, lance `--comparer` d'abord et présente les différences. N'ajoute `--remplacer` qu'avec l'accord du développeur ; signale ensuite les textes retouchés depuis l'import, gardés à côté (`.avant-<horodatage>`), et les traductions devenues périmées, à refaire et à faire ratifier.
6. Chaque texte écrit suit ensuite le chemin d'un texte écrit à la main : `verifier.mjs`, puis la traduction et sa ratification. Les marques (création), (modification), (suppression) et (à la main) manquent souvent aux scénarios de Jira : propose-les au développeur, qui les ajoute de préférence dans Jira (un réimport garde alors le texte à jour), sinon dans le texte.

## Traduire un texte

1. `verifier.mjs <texte.scenario>` : le texte doit être conforme. Sinon, rends au développeur ses erreurs, ligne par ligne, sans corriger le texte toi-même.
2. `traduire.mjs <texte.scenario>` écrit le squelette `<texte>.toml` à côté du texte : structure recopiée du texte, empreinte, un bloc [[etapes]] par étape du texte. Ne change aucun champ placé avant le premier bloc [[etapes]].
3. Complète chaque bloc : une action du jeu fermé et ses champs, selon le module actions du skill. Une phrase peut donner plusieurs étapes : recopie le bloc avec la même ligne, dans l'ordre du texte. Chaque variable `<nom>` de la phrase se retrouve en `${nom}`. Désigne les éléments comme un utilisateur : rôle et nom accessible d'abord, puis libellé, texte, placeholder, identifiant de test ; `css` et `rang` en dernier recours.
4. Une étape `main` ne vient que d'une ligne marquée « (à la main) ». Garde `mutation` sur chaque étape qui crée, modifie ou supprime des données ; ajoute-la quand une phrase non marquée le fait, et dis-le au développeur.
5. `verifier.mjs <texte>.toml --plan` doit répondre `ok`. Présente alors le plan au développeur, ligne du texte par ligne du texte, avec les étapes qui modifient des données et les étapes à la main, et attends sa ratification explicite. Sans ratification, rien ne se joue.

## Jouer un scénario

1. `verifier.mjs <scénario.toml>` d'abord.
2. Si la vérification signale des étapes qui modifient des données et des origines hors du poste, demande au développeur s'il autorise, pour cette exécution, ces modifications sur ces origines. Avec son accord explicite seulement, ajoute `--autoriser-mutations`.
3. Lance `jouer.mjs` dans une fenêtre visible : jamais `--sans-tete` avec une étape à la main. Pour une étape à la main, relaie le message « À VOUS » : le développeur agit lui-même dans la fenêtre, par exemple pour se connecter. Tu ne lui demandes jamais ses identifiants et ne les saisis jamais.
4. Lis `rapport.json` dans le dossier de résultats cité en fin de sortie. Rends le bilan : statut, chaque étape en échec avec son message, les captures (chemins), les erreurs de console, les erreurs de la page et les réponses en erreur, les origines bloquées, les cibles fragiles, et l'avertissement de compatibilité s'il y en a un.

## Après un échec

- Cible ambiguë : le message cite les éléments trouvés et leur localisateur ; propose une cible plus précise (nom exact, `dans`). Cible absente : propose au développeur `designer.mjs`, pour la désigner à la souris.
- Une correction du scénario se propose avec la ligne du texte qu'elle traduit. Ne l'écris qu'avec l'accord du développeur, puis repasse `verifier.mjs --plan` et fais ratifier l'étape changée.
- Une origine bloquée légitime s'ajoute au texte de départ, par le développeur. La traduction est alors périmée par l'empreinte : retraduis, et fais ratifier.

## Interdits

- Ne demande, ne lis et ne saisis aucun identifiant, mot de passe ou jeton.
- Ne modifie ni le texte de départ, ni un scénario ratifié, sans l'accord du développeur.
- Ne passe `--autoriser-mutations` qu'avec l'accord explicite du développeur pour cette exécution.
- Ne passe `--remplacer` à `importer.mjs` qu'avec l'accord du développeur, et `--commentaires` qu'à sa demande ; ne supprime aucun texte dont le scénario a disparu de Jira : signale-le.
- N'active `--trace` que sur demande, en prévenant que la trace contient les cookies de la session et reste sur le poste.
- Ne déplace, ne partage ni ne versionne les résultats, les captures, les téléchargements, les pages Jira enregistrées ou les profils ; ne fais aucun commit.
- N'adapte pas les scripts du skill : un besoin nouveau se signale au développeur.
```

## 7. Commandes de Gemini CLI

<!-- fichier : commandes/scenario/importer.toml -->
```toml
description = "Importe les scénarios Gherkin d'une demande Jira en textes de départ (.scenario), sans IA (skill scenario-playwright 1.1.0)"
prompt = """
Active le skill scenario-playwright, puis importe les scénarios de la demande Jira suivante : {{args}}
Une adresse de demande ouvre Jira dans la fenêtre, sur le profil dédié : relaie le message « À VOUS », sans jamais demander ni saisir d'identifiant. Une page enregistrée en MHTML se lit sans navigateur. --adresse de l'application est requise ; les commentaires ne se lisent qu'avec --commentaires, à la demande du développeur.
Pour un réimport, --comparer d'abord ; --remplacer seulement avec l'accord du développeur. Rends le bilan : textes écrits, inchangés, refusés et leur motif, conflits, disparus, limites. Propose ensuite de vérifier et de traduire chaque texte écrit.
"""
```

<!-- fichier : commandes/scenario/traduire.toml -->
```toml
description = "Traduit un texte de scénario (.scenario) en scénario TOML exécutable, puis le présente à la ratification (skill scenario-playwright 1.1.0)"
prompt = """
Active le skill scenario-playwright, puis traduis le texte de scénario suivant : {{args}}
Suis la traduction décrite au module scenario : texte vérifié, squelette écrit par traduire.mjs, étapes complétées, verifier.mjs --plan conforme.
Présente le plan ligne du texte par ligne du texte, avec les étapes qui modifient des données et les étapes à la main, puis attends la ratification du développeur : rien ne se joue avant.
"""
```

<!-- fichier : commandes/scenario/jouer.toml -->
```toml
description = "Joue un scénario TOML dans le Chrome du poste, comme un utilisateur, et rend le bilan (skill scenario-playwright 1.1.0)"
prompt = """
Active le skill scenario-playwright, puis joue le scénario : {{args}}
verifier.mjs d'abord. Demande l'accord explicite du développeur avant --autoriser-mutations. Fenêtre visible ; relaie chaque message « À VOUS » sans jamais demander ni saisir d'identifiant.
Rends le bilan du rapport.json : statut, étapes en échec et leur message, captures, erreurs relevées, origines bloquées, cibles fragiles, avertissement de compatibilité.
"""
```

<!-- fichier : commandes/scenario/designer.toml -->
```toml
description = "Ouvre une page et rend la cible de chaque élément que le développeur désigne à la souris (skill scenario-playwright 1.1.0)"
prompt = """
Active le skill scenario-playwright, puis lance designer.mjs sur l'adresse suivante : {{args}}
Le développeur clique lui-même les éléments dans la fenêtre ; rends chaque cible au format du scénario. Une cible non convertible s'écrit à la main, avec lui.
"""
```

## 8. Contrôle de sortie

- Les fichiers installés ont les empreintes de la table du module `execution`, § 8, avant le remplacement de `<DOSSIER_DU_SKILL>` dans la copie du sous-agent.
- Le sous-agent se charge dans Gemini CLI sans erreur, avec ses cinq outils (recette de l'installateur du dépôt Agent2Prompt).
- A1 à A8 rejoués : aucune exécution sans ratification (D10.INV-1), aucun identifiant et aucune autorisation sans accord (D10.INV-2), aucune correction sans accord (D10.INV-3), aucun remplacement sans accord ni commentaire lu sans demande (D10.INV-4).
