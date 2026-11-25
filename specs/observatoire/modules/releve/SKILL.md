---
name: releve
description: Inscription des projets et relevé de leurs journaux d'enveloppes dans le magasin local de l'observatoire (vérification selon le socle d'observation, miroirs en ajout seul, refus d'un journal altéré ou réécrit, enveloppes d'un système ou d'une version inconnus écartées). À lire pour inscrire un projet, relever ses journaux ou comprendre un refus.
dimensions: [D1]
status: active
---

# Module `releve` (D1)

L'observatoire ne lit des instances que leurs journaux d'enveloppes, et seulement vérifiés : ce qui n'est pas sûr n'entre dans aucune confrontation. Cette dimension régule, au premier ordre, ce qui entre dans le magasin.

## 1. Le magasin

- Il est dans le répertoire Git commun du clone d'Agent2Prompt, `<git-common-dir>/agent2prompt/observatoire/`, que partagent les worktrees du clone : hors de tout arbre de travail, il n'est jamais versionné, publié ni exporté (D1.INV-1). Hors d'un dépôt Git, l'observatoire n'a pas de magasin, et le dit.
- Il ne garde que deux choses : `projets.json`, au format `observatoire.projets/1`, les chemins des projets inscrits et l'empreinte de leur instance ; et, sous `instances/<instance>/`, le miroir de chaque journal, sous le nom du journal, avec sa tête : `observations.jsonl` pour le générateur, `observations-orchestrateur-c7e.jsonl` pour l'orchestrateur, `observations-agent2dev.jsonl` et `observations-agent2test.jsonl` pour le binôme. Ni le champ, ni les registres, ni le sel d'une instance n'y entrent.
- Il se reconstruit depuis les journaux, versionnés dans les projets : un nouveau clone n'a qu'à réinscrire ses projets.

## 2. Inscrire

- `inscrire --projet <dossier>` : le projet doit avoir au moins un journal d'enveloppes, un par système qui exporte, `docs/c7e/observations.jsonl` pour le générateur, `docs/c7e/observations-orchestrateur-c7e.jsonl` pour l'orchestrateur, `docs/c7e/observations-agent2dev.jsonl` et `docs/c7e/observations-agent2test.jsonl` pour le binôme, que son export écrit (module `export-binome`), chacun vérifié ; son instance est l'empreinte que portent leurs enveloppes, la même pour tous, puisque les systèmes d'un projet exportent sous le même sel. Un journal altéré, ou des journaux d'instances différentes, empêchent l'inscription.
- Un projet copié, ou un worktree du projet, porte la même instance : il compte pour une seule instance.
- Une instance qui change pour un même chemin, parce qu'un nouveau sel a commencé un nouveau journal, est refusée : c'est une autre instance, à inscrire depuis un autre dossier.

## 3. Relever

- Chaque journal d'un projet inscrit est vérifié selon le socle épinglé : schéma fermé, ordres et niveaux, chaîne d'empreintes, numéros, dates, tête (`socle-observation:SO1.INV-1`, `socle-observation:SO2.INV-1`). Une référence en clair n'est admise que pour un concept du registre de départ de l'orchestrateur, sous sa forme `C_<DOMAINE>_<NNN>` ; un invariant se préfixe par sa spécification, et son identifiant commence par `D`, `SC`, `SO` ou, pour une règle du socle de l'acceptable, `SA`.
- Son miroir doit en être le début, ligne pour ligne : les lignes nouvelles s'y ajoutent, et le miroir ne fait que s'allonger (D1.INV-2).
- Un journal altéré, ou réécrit depuis le dernier relevé, même avec une chaîne cohérente, est refusé : son miroir reste tel quel, et l'observatoire le signale. Un magasin altéré arrête tout relevé.
- Un projet introuvable garde son miroir, avec un avertissement : l'instance reste dans les confrontations, telle qu'elle a été relevée.
- `etat`, `confronter`, `proposer` et `suivre` relèvent d'abord ; `verifier` contrôle le magasin et les propositions du dépôt.

## 4. Systèmes et versions connus

Le dépôt publie, pour chaque spécification, sa version courante et ses versions précédentes, dans son `manifest.json`. Une enveloppe d'un système que le dépôt ne connaît pas, ou d'une version qu'il n'a pas publiée, reste dans son miroir, mais n'entre dans aucune confrontation ; `etat` la compte et la signale (D1.INV-3).

## 5. Recette

| Invariant | Tests |
|---|---|
| D1.INV-1 | `tests/observatoire.test.mjs` : « D1 : le magasin est dans le répertoire Git commun du clone, partagé par ses worktrees, hors de l'arbre de travail : jamais versionné ni publié » ; « D1 : les journaux de chaque système d'une instance se relèvent, chacun dans son miroir ; une instance aux journaux de sels différents n'est pas inscrite » ; « Ligne de commande : codes de sortie ; le magasin d'épreuve seul est écrit » |
| D1.INV-2 | `tests/observatoire.test.mjs` : « D1 : un journal ne se relève que vérifié : un journal altéré ou réécrit depuis le dernier relevé est refusé, et son miroir ne fait que s'allonger » ; « D1 : les journaux de chaque système d'une instance se relèvent, chacun dans son miroir ; une instance aux journaux de sels différents n'est pas inscrite » ; « Ligne de commande : codes de sortie ; le magasin d'épreuve seul est écrit » |
| D1.INV-3 | `tests/observatoire.test.mjs` : « D1 : une enveloppe d'un système ou d'une version inconnus du dépôt est écartée de toute confrontation et signalée » ; « D3 : chaque instance est comparée aux versions publiées des systèmes qu'elle exporte : à jour, en retard, ou inconnue » |
