# Mode d'emploi : lancer l'orchestrateur C7E dans Gemini CLI

Ce mode d'emploi installe la spécification [`orchestrateur-c7e`](../../specs/orchestrateur-c7e/SKILL.md) 3.2.0 dans un projet et la fait appeler au démarrage de l'IA locale, Gemini CLI. Le skill ne s'applique qu'au choix du développeur, selon l'un de deux chargements :

| Chargement | Le choix se fait | Au démarrage, le contexte contient |
|---|---|---|
| **permanent** | une fois, par l'import du fichier de démarrage | le skill entier et le fichier d'invariants, environ 65 Ko |
| **au choix** | à chaque session, au menu ou par la commande `/c7e` | le nom et la description du skill, et le menu |

Ces deux chargements ne sont pas les modes de modulation A, B et C du skill, qui règlent la méthode une fois le skill choisi.

Une fois l'orchestrateur choisi, chaque ticket est classé dans le **référentiel des méso-contrats** du projet : une catégorie (M01, M02, M03…), puis des options au choix sur chaque couche, et l'analyse des images PNG de l'objectif quand il y en a.

---

## 1. Prérequis

- Gemini CLI, lancé à la racine du projet.
- Pour le chargement au choix, la prise en charge des skills : la commande `/skills list` doit répondre.
- La transmission [`transmissions/orchestrateur-c7e-3.2.0.md`](../../transmissions/orchestrateur-c7e-3.2.0.md).
- Node 20 ou plus récent pour extraire le référentiel, et `sha256sum`, fourni par Git Bash sous Windows, pour vérifier les fichiers.

## 2. Installer le skill

1. Choisir l'emplacement :

   | Chargement et disposition | Emplacement du skill |
   |---|---|
   | permanent | `.skills/orchestrateur-c7e/` |
   | au choix, clone ordinaire | `.gemini/skills/orchestrateur-c7e/` |
   | au choix, kit `agents-paralleles-gitlab` | `~/.gemini/skills/orchestrateur-c7e/`, une seule installation pour tous les worktrees |

2. Pour un chargement au choix, installer le skill avec l'installateur du dépôt, depuis la racine du projet :

   ```bash
   node <Agent2Prompt>/tools/installer.mjs orchestrateur-c7e                 # .gemini/skills/orchestrateur-c7e/
   node <Agent2Prompt>/tools/installer.mjs orchestrateur-c7e --utilisateur   # ~/.gemini/skills/, avec le kit
   ```

   Il recrée les fichiers de la transmission, vérifie leurs empreintes, garde la consigne dans `CONSIGNE.md` et masque le skill à Git sans le rendre illisible (README du dépôt, « Installer un skill dans Gemini CLI »). Dans Gemini CLI, après `/skills reload` : « Active le skill orchestrateur-c7e. L'étape 0 de sa consigne est faite. Lis `CONSIGNE.md` dans son dossier et suis-la à partir de l'étape 1. » L'IA installe alors les fichiers du projet (§ 3).
3. Pour un chargement permanent, ou sans clone du dépôt, coller la transmission dans Gemini CLI, en précisant l'emplacement choisi. L'IA crée les fichiers à l'identique, les vérifie avec la table d'intégrité, puis installe les fichiers du projet (§ 3).
4. Masquer le skill à Git sans le rendre illisible pour Gemini CLI. Dans un clone ordinaire, son outil de lecture refuse les fichiers qu'exclut `.git/info/exclude` : un skill exclu ainsi ne livre que son `SKILL.md` à l'activation, et ses modules restent illisibles. L'installateur s'en charge. À la main, ajouter à `.git/info/exclude` le dossier du skill et `/.geminiignore`, et à `.geminiignore` une négation par niveau :
   - chargement au choix : `!/.gemini/`, `!/.gemini/skills/` et `!/.gemini/skills/orchestrateur-c7e/` ;
   - chargement permanent : `!/.skills/` et `!/.skills/orchestrateur-c7e/`.

   Inutile au niveau utilisateur, hors de tout dépôt.
5. Pour le chargement au choix, vérifier que le dossier du skill porte le nom de son `name` : `orchestrateur-c7e`.

Le § 11.3 du skill et l'étape 0 de sa transmission ne prévoient que l'exclusion par `.git/info/exclude` : suivre ici le point 4.

## 3. Préparer les fichiers du projet

| Fichier | Emplacement | Qui l'écrit |
|---|---|---|
| invariants du projet | `docs/c7e/meso-contrats.md` | le développeur, à partir de `meso-contrats.md` du skill : il remplit les valeurs `ADAPTER` |
| référentiel des méso-contrats | `docs/c7e/referentiel-meso-contrats.toml` | le développeur, à partir du modèle du module `referentiel` |
| registre des écarts | `docs/c7e/registre-ecarts.md` | l'IA ajoute, le développeur décide |
| registre des concepts | `docs/c7e/concepts.json` | l'IA propose, le développeur promeut |
| base de connaissances | `docs/c7e/connaissances.md` | l'IA ajoute, le développeur relit |
| instance de chaque ticket | `docs/demandes/<CLÉ>/ticket.toml` | l'IA propose, le développeur valide avec la fiche |
| analyse d'image | `docs/demandes/<CLÉ>/analyse-image.md` | l'IA, validée avec la fiche |
| images de l'objectif | `docs/demandes/<CLÉ>/maquettes/*.png` | le développeur ou le PO |

À l'installation, l'IA écrit le modèle du référentiel et vérifie son empreinte. La commande qui le fait aussi à la main est au § 6 du module `referentiel`.

Le développeur adapte ensuite son référentiel :

- une catégorie de tickets nouvelle s'ajoute par un bloc `[[meso_contrats]]` d'identifiant `M04`, `M05`… ; chaque couche y déclare son impact (`requis`, `optionnel` ou `aucun`), ses technologies et ses options permises ;
- les options elles-mêmes, leurs slots et leurs preuves se règlent dans la section 1 du référentiel ;
- `meta.version` change à chaque modification ; les tickets déjà instanciés gardent la version qu'ils ont épinglée.

L'IA ne modifie jamais ce fichier : elle propose, le développeur ajoute.

Tous ces fichiers sont versionnés avec le projet, images comprises : une commande de Gemini CLI n'injecte pas un fichier exclu de Git.

## 4. Chargement permanent

1. Créer le fichier de démarrage à la racine du projet, `GEMINI.md` ou le nom de votre choix :

   ```markdown
   # IA locale du projet

   @./.skills/orchestrateur-c7e/SKILL.md
   @./docs/c7e/meso-contrats.md

   Pour chaque ticket confié, applique l'orchestrateur C7E : fiche de transformation,
   validation par le développeur, puis transformation par slot.
   ```

2. Si ce fichier ne s'appelle pas `GEMINI.md`, le déclarer dans `.gemini/settings.json` (voir § 6).
3. Lancer `gemini`, puis `/memory show` : le texte du skill doit apparaître, en commençant par « Orchestrateur fractal C7E, version 3.2.0 ».

Les lignes `@` ne sont développées que dans un fichier de contexte. Si le fichier est envoyé comme message, l'IA ne voit que le texte des lignes, sans le contenu des fichiers. Le référentiel n'est pas importé : l'IA le lit à l'analyse de chaque ticket.

## 5. Chargement au choix

```mermaid
flowchart LR
  L["Démarrage<br/>de Gemini CLI"] --> M["Menu du fichier<br/>de démarrage"]
  M -- "0" --> S["Session sans<br/>orchestrateur"]
  M -- "1" --> A["Activation du skill,<br/>confirmée par le développeur"]
  C["Commande /c7e"] --> A
  A --> K["Par ticket : méso-contrat<br/>et options, ticket.toml"]
  K --> I["Analyse des images<br/>de l'objectif demandées"]
  I --> V["Fiche, ticket.toml<br/>et analyse validés"]
```

### 5.1 Le fichier de démarrage

À la racine du projet, un menu, et aucun import du skill :

```markdown
# IA locale du projet

À ton premier message, avant tout autre travail, propose ce choix et attends la réponse :

0. Sans orchestrateur.
1. Avec l'orchestrateur C7E.

- N'active jamais le skill orchestrateur-c7e sans ce choix.
- Avec l'orchestrateur : active le skill et lis docs/c7e/meso-contrats.md ; pour chaque ticket
  confié, classe-le dans docs/c7e/referentiel-meso-contrats.toml et présente ticket.toml
  avec la fiche.
- Sans orchestrateur : n'applique aucune règle du skill.
```

### 5.2 La commande `/c7e`

La commande fait le même choix sans passer par le menu, et confie le ticket d'un même geste. Créer `.gemini/commands/c7e.toml`, ou `~/.gemini/commands/c7e.toml` avec le kit :

```toml
description = "Orchestrateur C7E : activer le skill et traiter le ticket donné"
prompt = """
Active le skill orchestrateur-c7e pour la suite de la session.
Fichier d'invariants du projet :
@{docs/c7e/meso-contrats.md}
Référentiel des méso-contrats du projet :
@{docs/c7e/referentiel-meso-contrats.toml}
Ticket, et méso-contrat imposé s'il est précisé : {{args}}
"""
```

- `/c7e ABCDE-3512` : l'IA propose le méso-contrat du ticket.
- `/c7e ABCDE-3512 M01` : le méso-contrat est imposé ; l'IA signale seulement s'il ne couvre pas le ticket.
- Le skill passe par l'activation, jamais par `@{…}` : les commandes ignorent les fichiers exclus de Git, comme le dossier du skill.
- Avec le kit, les chemins `docs/c7e/…` se lisent dans le worktree où Gemini CLI est lancé.

### 5.3 Vérifier

| Commande | Résultat attendu |
|---|---|
| `/skills list` | `orchestrateur-c7e` figure dans la liste |
| `/memory show` | le menu du fichier de démarrage apparaît |
| `/commands list` | la commande `c7e` apparaît |

Après une modification : `/skills reload`, `/memory reload` ou `/commands reload`.

## 6. Déclarer le fichier de démarrage

Gemini CLI lit `GEMINI.md`. Pour un autre nom, `.gemini/settings.json` :

```json
{ "context": { "fileName": ["GEMINI.md", "README.md"] } }
```

- Le nom doit avoir la casse exacte du fichier : sous WSL2, `README.md` et `readme.md` sont deux fichiers différents.
- Gemini CLI lit aussi les fichiers de ce nom dans les dossiers que ses outils parcourent. Déclarer `README.md` ferait entrer dans le contexte les `README.md` des sous-dossiers. Un nom propre à l'IA locale, comme `IA.md`, évite ce mélange.

## 7. Les options au choix

Chaque méso-contrat permet certaines options par couche ; `ticket.toml` les précise pour le ticket.

| Couche | Option | Ce que précise `ticket.toml` |
|---|---|---|
| PostgreSQL | évolution de schéma (`schema`) | le changement (table, colonne, index, contrainte), la table, une description |
| PostgreSQL | contrat CRUD (`crud`) | l'entité, la table, les opérations parmi `create`, `read`, `update`, `delete`, et le mode de suppression si `delete` est retenu |
| Java | endpoints (`endpoints`) | la méthode, le chemin, la réponse, les erreurs attendues |
| Java | règles métier (`regles`) | un identifiant et l'énoncé de chaque règle |
| Java | fonctionnalités (`fonctionnalites`) | le cas d'usage |
| Angular | éléments graphiques (`elements_graphiques`) | le composant et ses états visuels |
| Angular | fonctionnalités (`fonctionnalites`) | le comportement et son déclencheur |
| Angular | analyse d'image, sur toute option front | `image_objectif` (PNG), `analyse_image` (structure, composants, textes, états, couleurs, accessibilité), et `image_actuelle` pour relever les écarts |

Chaque option retenue apporte ses preuves aux tests déduits de la fiche. Le module `referentiel` du skill donne un exemple complet de `ticket.toml`.

## 8. Au quotidien

1. Lancer `gemini` à la racine du projet, ou dans le worktree de la demande avec le kit.
2. Choisir l'orchestrateur : répondre 1 au menu, ou taper `/c7e ABCDE-3512`.
3. Confirmer l'activation du skill quand Gemini CLI la demande.
4. Déposer dans `docs/demandes/<CLÉ>/maquettes/` les images PNG de l'objectif, s'il y en a, et les versionner.
5. Relire ce que l'IA présente, en un seul point de validation :
   - la fiche de transformation ;
   - `ticket.toml`, avec le méso-contrat et les options proposés ;
   - l'analyse d'image et ses questions.
6. L'IA transforme ensuite le système slot par slot et dépose ses preuves.
7. Relire, pousser et fusionner vous-même : l'IA ne pousse pas, ne fusionne pas et ne pose aucun tag.

Si l'IA signale qu'aucune catégorie ne couvre le ticket, choisir la plus proche ou ajouter la catégorie au référentiel ; l'IA ne l'ajoute pas elle-même.

## 9. Limites connues

- **Activation spontanée.** Gemini CLI peut proposer d'activer le skill dès qu'un ticket apparaît. Refuser la confirmation sans choix préalable ; le skill interdit aussi de s'activer de lui-même.
- **Lancement sans interface.** Un outil qui relance Gemini CLI à chaque message, comme GeminiBoard, ferait réapparaître le menu à chaque appel, et la confirmation d'activation suppose une interface. L'outil doit retenir le choix et le rejouer à chaque appel.
- **Images.** Les tailles et les couleurs lues sur une image sont des estimations, à confirmer avec le système de design. Ce qu'une image ne montre pas (focus, annonces aux technologies d'assistance, comportement) se prouve par les tests.
- **Coût du chargement permanent.** Le skill entier entre dans le contexte de chaque session, même sans ticket.

## 10. Dépannage

| Symptôme | Cause probable | Remède |
|---|---|---|
| `/skills list` ne montre pas le skill | dossier mal placé ou mal nommé | le dossier doit s'appeler `orchestrateur-c7e`, sous `.gemini/skills/` ou `~/.gemini/skills/`, puis `/skills reload` |
| `/skills list` ne montre aucun skill du workspace | dossier pas de confiance, ou Gemini CLI lancé ailleurs | accorder la confiance au dossier ; lancer Gemini CLI là où se trouve `.gemini/` |
| le skill s'active, mais ses modules sont refusés (« ignored by configured ignore patterns ») | skill exclu de Git sans négation dans `.geminiignore` | relancer l'installateur, ou ajouter les négations du § 2, point 4 |
| le menu n'apparaît pas | fichier de démarrage non déclaré, ou casse différente | § 6, puis `/memory show` |
| `/memory show` montre les lignes `@` sans le contenu | chemin faux, ou fichier envoyé comme message | chemins relatifs au fichier de démarrage ; le charger comme fichier de contexte |
| la commande ne trouve pas le référentiel ou les invariants | fichier absent ou exclu de Git | les fichiers de `docs/c7e/` doivent exister et être versionnés |
| l'empreinte du référentiel diffère à l'installation | fichier recopié à la main ou retouché | le réécrire par la commande du module `referentiel`, § 6 |
| l'IA ne propose aucun méso-contrat | référentiel absent, ou ticket hors de toute catégorie | installer le référentiel ; sinon, choisir une catégorie ou en ajouter une |
| l'IA retient une option refusée par la catégorie | règle de validation ignorée | la refuser à la validation ; le skill la rejette (scénario R13) |
| l'image n'est pas analysée | fichier absent, non versionné, ou pas en PNG | déposer le PNG dans `maquettes/`, le versionner, renseigner `image_objectif` et `analyse_image` |
| l'IA applique la méthode sans choix | activation acceptée par erreur | relancer la session et refuser la confirmation |
