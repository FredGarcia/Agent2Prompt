---
name: diffusion
description: Diffusion autonome du skill (un dossier qui se suffit et ce qu'il contient ; trois formes, le dossier, un fichier .skill ou la transmission texte ; installation par Gemini CLI, au niveau utilisateur ou du projet ; extraction et recette ; sous-agent et commandes par une commande que le développeur lance ; mise à jour et retrait complet ; autre outil ; le dépôt où le skill est maintenu ; le mode d'emploi du développeur). À lire avant d'installer, de mettre à jour, de retirer ou de diffuser le skill.
dimensions: [D12]
status: active
---

# Module `diffusion` (D12)

Phase 7E couverte : Espace et Expression.

## 1. Un dossier qui se suffit (D12.INV-1)

Le skill se diffuse seul. Son dossier contient tout ce qu'il faut pour l'installer, le vérifier et s'en servir : il ne demande que Node 20 ou plus récent et l'hôte. Aucune étape du skill ne passe par un dépôt, un outil ou un fichier extérieur au dossier, ni par le réseau ; seul l'hôte parle à son modèle, comme il le fait sans le skill.

| Élément | Rôle | Présent |
|---|---|---|
| `SKILL.md` | point d'entrée | toujours |
| `manifest.json` | version, modules, cibles | toujours |
| `modules/` | règles de l'agent ; les six fichiers exécutables y sont écrits en entier (modules `execution`, `recette` et `agent`) | toujours |
| `MODE-EMPLOI.md` | mode d'emploi du développeur : installer, vérifier, utiliser, mettre à jour, retirer, diffuser | toujours (D12.INV-3) |
| `ENTETE-TRANSMISSION.md` | consigne de la transmission texte (§ 6) | dans le dossier diffusé |
| `archives/` | points d'entrée des versions précédentes | dans le dossier diffusé |
| `scripts/`, `tests/`, `agent/`, `commandes/` | les six fichiers exécutables | après l'extraction (§ 3) |

## 2. Trois formes de diffusion

| Forme | Pour qui | Ce qu'on en fait |
|---|---|---|
| le dossier `explication-hote-ia/` | un développeur sous Gemini CLI | une copie, ou une archive zip décompressée ; `gemini skills install <dossier>` (§ 3) |
| un fichier `explication-hote-ia.skill` | le même, en un seul fichier | `gemini skills install explication-hote-ia.skill`, sans décompression préalable (§ 3) |
| la transmission texte `explication-hote-ia-<version>.md` | une IA qui ne reçoit que du texte, dans un autre outil | collée telle quelle ; l'IA matérialise le dossier et suit la consigne (§ 6) |

Un fichier `.skill` est une archive zip du dossier, dont seule l'extension change. Depuis le dossier qui contient `explication-hote-ia/` :

| Plateforme | Commande |
|---|---|
| Linux | `python3 -m zipfile -c explication-hote-ia.skill explication-hote-ia` |
| macOS, Windows 10 ou plus récent | `tar --format zip -cf explication-hote-ia.skill explication-hote-ia` |

Fait avant l'extraction, le fichier ne contient pas les six fichiers exécutables : l'extraction les écrit après l'installation. Fait après, il les contient ; l'extraction les réécrit de toute façon depuis les modules et vérifie leurs empreintes.

## 3. Installer dans Gemini CLI (D12.INV-2)

1. `gemini skills install <dossier ou fichier .skill>`. Gemini CLI cherche un `SKILL.md` dans le dossier et dans ses sous-dossiers directs, puis copie le dossier du skill dans `~/.gemini/skills/explication-hote-ia/`, pour tous les projets (`$GEMINI_CLI_HOME/.gemini/skills/` si cette variable est posée). `--scope workspace` l'installe dans `.gemini/skills/` du projet ; `--consent` passe la demande de confirmation. Il ne trouve qu'un skill, `explication-hote-ia` : les `SKILL.md` des modules sont deux niveaux plus bas et ne sont jamais pris pour des skills (code de Gemini CLI 0.67.0 relu, essai réel par la recette des repères ; la commande est documentée dans `cli/skills.md`). Une installation existante est remplacée d'un bloc : le dossier installé est supprimé, fichiers extraits compris, puis recopié.
2. Depuis le dossier installé, la commande d'extraction du module `execution`, § 8 : elle écrit les six fichiers et compare leurs empreintes à celles du tableau ; un écart arrête l'installation.
3. La recette, depuis le même dossier : `node --test tests/instantane-hote.test.mjs`, au bilan du module `recette`, § 1. Un échec arrête l'installation et se rapporte tel quel, sans modifier le script.
4. Dans une session ouverte, `/skills reload`, puis `/skills list` ; sinon, la session suivante le découvre. À la première activation, l'hôte demande au développeur d'autoriser le skill.

Au niveau du projet, si git ignore `.gemini/` ou le dossier du skill (`.gitignore`, `.git/info/exclude`), les outils de lecture de l'hôte ne livrent du skill que son `SKILL.md` (module `composants`, § 8) : ajouter à `.geminiignore` les lignes `!/.gemini/`, `!/.gemini/skills/` et `!/.gemini/skills/explication-hote-ia/`. Le niveau utilisateur, hors du projet, n'a pas ce piège : c'est le niveau conseillé.

## 4. Le sous-agent et les commandes (D12.INV-4)

Le sous-agent `explicateur-hote` et les commandes `/hote:explique`, `/hote:carte` et `/hote:pourquoi` vivent dans les dossiers de l'hôte, hors du dossier du skill : ils ne s'installent qu'à la demande du développeur. Depuis le dossier du skill, une fois les six fichiers extraits, cette commande copie `agent/explicateur-hote.md` dans `~/.gemini/agents/`, en remplaçant, dans la copie, `<DOSSIER_DU_SKILL>` par le chemin du dossier courant, et les trois commandes dans `~/.gemini/commands/hote/` (`$GEMINI_CLI_HOME/.gemini/` si cette variable est posée). Comme celle d'extraction, elle ne contient ni `$`, ni accent grave, ni `!`, ni `%`, ni guillemet intérieur, et n'emploie que des caractères ASCII : elle se colle telle quelle dans bash, zsh, CMD ou PowerShell.

```text
node -e "const fs = require('node:fs'), path = require('node:path'), os = require('node:os'); const gemini = path.join(process.env.GEMINI_CLI_HOME || os.homedir(), '.gemini'); const agent = path.join(gemini, 'agents', 'explicateur-hote.md'), commandes = path.join(gemini, 'commands', 'hote'); if (fs.existsSync(path.join('agent', 'explicateur-hote.md')) === false) { console.error('agent/explicateur-hote.md absent : lancer cette commande depuis le dossier du skill, une fois les six fichiers extraits'); process.exitCode = 1; } else { fs.mkdirSync(path.dirname(agent), { recursive: true }); fs.mkdirSync(commandes, { recursive: true }); fs.writeFileSync(agent, fs.readFileSync(path.join('agent', 'explicateur-hote.md'), 'utf8').split('<DOSSIER_DU_SKILL>').join(process.cwd())); for (const f of ['explique.toml', 'carte.toml', 'pourquoi.toml']) fs.copyFileSync(path.join('commandes', 'hote', f), path.join(commandes, f)); console.log('copie     ' + agent); console.log('copie     ' + commandes); }"
```

Elle écrit `copie` et le chemin de chaque copie ; lancée hors du dossier du skill, elle le dit et sort avec le code 1, sans rien écrire. Puis, dans une session ouverte, `/agents reload` et `/commands reload`. Le fichier du skill ne change jamais : seule la copie installée s'adapte. L'agent ne lance cette commande que sur demande explicite du développeur, après la lui avoir montrée (D7.INV-2).

## 5. Mettre à jour, retirer

- **Nouvelle version du skill** : `gemini skills install` avec la nouvelle version remplace le dossier installé ; refaire l'extraction et la recette (§ 3), puis, si le développeur les avait installés, la commande du § 4, qui réécrit le sous-agent et les commandes.
- **Nouvelle version de Gemini CLI** : rien à refaire. L'agent observe la version, cite ses repères « à revérifier » et lit la documentation installée (D6.INV-5).
- **Retirer** : cette commande, lancée de n'importe où, supprime le sous-agent, les trois commandes, et le dossier `commands/hote/` s'il reste vide ; elle écrit `supprime` et le chemin de chaque fichier. Puis `gemini skills uninstall explication-hote-ia` retire le skill, avec `--scope workspace` s'il est installé au niveau du projet. Le skill n'a rien écrit d'autre hors de son dossier.

```text
node -e "const fs = require('node:fs'), path = require('node:path'), os = require('node:os'); const gemini = path.join(process.env.GEMINI_CLI_HOME || os.homedir(), '.gemini'); const commandes = path.join(gemini, 'commands', 'hote'); for (const f of [path.join(gemini, 'agents', 'explicateur-hote.md'), ...['explique.toml', 'carte.toml', 'pourquoi.toml'].map((n) => path.join(commandes, n))]) if (fs.existsSync(f)) { fs.rmSync(f); console.log('supprime  ' + f); } if (fs.existsSync(commandes) && fs.readdirSync(commandes).length === 0) fs.rmdirSync(commandes);"
```

## 6. Dans un autre outil

La transmission texte porte le point d'entrée, le manifeste, les modules et `MODE-EMPLOI.md`, sa consigne en tête (`ENTETE-TRANSMISSION.md`) : l'IA qui la reçoit matérialise le dossier dans `.skills/explication-hote-ia/`, vérifie chaque fichier contre la table d'intégrité, puis suit la consigne. Un outil qui lit des dossiers n'a besoin que du dossier : son IA lit `SKILL.md`, puis le module `agent`, § 2.

Dans Gemini CLI, un dossier matérialisé à partir de la transmission ne devient un skill de l'hôte, découvert dans toutes les sessions, qu'une fois installé : `gemini skills install .skills/explication-hote-ia`, après l'extraction et la recette. La commande du § 4 se lance alors depuis le dossier installé, pour que le sous-agent désigne celui-là.

## 7. Le dépôt où le skill est maintenu (D12.INV-5)

Le skill est maintenu dans le dépôt Agent2Prompt : sa spécification, ses transmissions et ses archives y sont versionnées. Ce dépôt n'est jamais une étape. Le contrat de version, les règles et la recette du skill sont écrits dans le skill (point d'entrée, § 7 et § 8 ; module `recette`). Le dépôt est seulement le lieu où les mainteneurs vérifient chaque version : la recette en intégration continue, sous Linux et sous Windows, et la recette des repères contre le Gemini CLI réel, qui installe le skill comme le dit le mode d'emploi (module `recette`, § 4 et § 5).

## 8. Le mode d'emploi (D12.INV-3)

`MODE-EMPLOI.md` s'adresse au développeur. Il voyage avec le dossier et avec la transmission, et porte la version du skill. Ses commandes sont celles de ce module et du module `execution`, § 8, à l'identique ; ses renvois ne sortent pas du dossier. L'agent y renvoie le développeur pour l'installation et l'usage, et le suit quand il le guide.

## 9. Contrôle de sortie

- Installer, vérifier, utiliser : rien d'autre que le dossier, Node 20 ou plus récent et l'hôte (D12.INV-1).
- Dans Gemini CLI : `gemini skills install`, un seul skill, extraction vérifiée, recette ; un écart arrête l'installation (D12.INV-2).
- Mode d'emploi joint, à la version du skill, mêmes commandes (D12.INV-3).
- Hors du dossier du skill, rien sans demande du développeur ; un retrait qui ne laisse rien (D12.INV-4).
- Le dépôt nommé comme origine et lieu de vérification, jamais comme étape (D12.INV-5).
