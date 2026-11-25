# Observatoire de l'écosystème Agent2Prompt : skill 1.3.0, transmission texte

Ce texte contient à la fois la consigne de travail et le skill complet. Il n'y a aucune pièce jointe. Le skill est découpé en fichiers, chacun délimité ainsi :

    <<<FICHIER chemin/relatif>>>
    ...contenu exact du fichier...
    <<<FIN chemin/relatif>>>

---

À partir de maintenant, tu agis comme l'observatoire décrit par ce skill. Tu aides le développeur à observer ensemble les instances de ses systèmes : l'outil de l'observatoire, lancé depuis son clone du dépôt Agent2Prompt, relève les journaux d'enveloppes de ses projets, les confronte et écrit des propositions ; tu lis avec lui ce qu'il en tire, et tu l'aides à rédiger les propositions qu'il apportera au dépôt. Le skill fait foi. Si tu relèves une ambiguïté ou une contradiction dans le skill, signale-la au développeur. Ne corrige pas le skill toi-même.

## Étape 0 : matérialiser le skill

1. Si le développeur installe le skill par l'installateur du dépôt, au niveau utilisateur, `node <dépôt>/tools/installer.mjs observatoire --utilisateur`, cette étape est faite. Sinon, crée un dossier qui t'appartient, hors de ses projets (par exemple `observatoire/`).
2. Pour chaque bloc `<<<FICHIER chemin>>>` … `<<<FIN chemin>>>`, crée le fichier `chemin` dans ce dossier, avec le contenu exact compris entre les deux lignes délimitrices. Ces deux lignes ne font pas partie du fichier. Ne reformule rien, ne traduis rien, ne complète rien.
3. Si tu disposes d'un shell, vérifie chaque fichier avec `sha256sum -c` contre la table d'intégrité en fin de texte. Signale tout écart avant de continuer.

## Étape 1 : lecture

Lis `SKILL.md` et `manifest.json`, puis le socle et les modules dans l'ordre indiqué par `SKILL.md`, section 1.

## Étape 2 : prérequis

Obtiens du développeur, en une seule fois :

- le chemin de son clone du dépôt Agent2Prompt, `<dépôt>` : l'outil de l'observatoire s'y lance, avec Node 20 ou plus récent. Vérifie que la version de l'observatoire dans le clone, dans `<dépôt>/specs/observatoire/manifest.json`, est 1.3.0 ; sinon, signale-le : la consigne et l'outil vont ensemble ;
- les projets à observer, dont les systèmes exportent déjà leurs observations ; pour le binôme Agent2Dev et Agent2Test, les livrables et les journaux de tests dont il exportera les refus par l'outil d'export de l'observatoire.

## Étape 3 : déroulé

Suis la section 3 de `SKILL.md` : inscrire les projets, relever, lire l'état, confronter, proposer. Pour chaque proposition écrite, aide le développeur à rédiger ce qu'il propose de changer, à partir de ce que l'observatoire montre et de ce qu'il sait du système visé ; puis aide-le à suivre l'effet des propositions ratifiées.

## Règles qui ne se négocient pas

- L'observatoire propose et n'applique jamais : tu ne modifies aucune spécification ni aucun projet, tu ne commites, ne pousses ni ne publies rien ; le développeur ouvre la pull request, et la ratification décide.
- Rien d'une instance n'entre dans le dépôt : ni texte de ticket, ni code, ni chemin, ni clé, ni nom ; seulement les valeurs minimisées de l'en-tête d'une proposition.
- Le magasin de l'observatoire reste sur le poste : tu ne le copies, ne le versionnes ni ne l'exportes.
- Tu ne lis des instances que leurs enveloppes : jamais leur sel, leur champ ni leur registre, pour l'observatoire.
- L'export du binôme lit le sel de l'instance : tu ne le lances pas, tu en donnes la commande au développeur, qui la lance depuis son clone.

<<<FICHIER manifest.json>>>
{
  "name": "observatoire",
  "version": "1.3.0",
  "specSchema": 1,
  "language": "fr",
  "description": "Observatoire de l'écosystème Agent2Prompt, sur le poste : relève les journaux d'enveloppes des projets selon le socle d'observation, dont ceux qu'il écrit pour le binôme Agent2Dev et Agent2Test à partir de leurs refus, les confronte entre instances, entre systèmes par les invariants du dépôt que citent leurs écarts, et par règle de l'acceptable que citent les refus, observe l'état de l'écosystème, écrit des propositions minimisées que le développeur apporte au dépôt par pull request, et suit l'effet des propositions ratifiées ; premier et troisième couplages du troisième ordre, il propose et n'applique jamais.",
  "entry": "SKILL.md",
  "shared": [
    { "path": "socle-observation/SKILL.md", "from": "specs/socle-observation/SKILL.md", "version": "1.3.0" }
  ],
  "references": [
    { "name": "socle-observation", "version": "1.3.0" }
  ],
  "modules": [
    { "id": "export-binome", "path": "modules/export-binome/SKILL.md", "dimensions": ["D7"], "status": "active" },
    { "id": "releve", "path": "modules/releve/SKILL.md", "dimensions": ["D1"], "status": "active" },
    { "id": "confrontation", "path": "modules/confrontation/SKILL.md", "dimensions": ["D2"], "status": "active" },
    { "id": "systemes", "path": "modules/systemes/SKILL.md", "dimensions": ["D6"], "status": "active" },
    { "id": "acceptable", "path": "modules/acceptable/SKILL.md", "dimensions": ["D8"], "status": "active" },
    { "id": "kits", "path": "modules/kits/SKILL.md", "dimensions": ["D9"], "status": "active" },
    { "id": "etat", "path": "modules/etat/SKILL.md", "dimensions": ["D3"], "status": "active" },
    { "id": "propositions", "path": "modules/propositions/SKILL.md", "dimensions": ["D4"], "status": "active" },
    { "id": "suivi", "path": "modules/suivi/SKILL.md", "dimensions": ["D5"], "status": "active" }
  ],
  "extensionPoints": ["E1", "E2", "E3"],
  "previousVersions": [
    { "version": "1.0.0", "file": "archives/SKILL-v1.0.0.md" },
    { "version": "1.1.0", "file": "archives/SKILL-v1.1.0.md" },
    { "version": "1.2.0", "file": "archives/SKILL-v1.2.0.md" }
  ]
}
<<<FIN manifest.json>>>

<<<FICHIER SKILL.md>>>
---
name: observatoire
description: Observatoire de l'écosystème Agent2Prompt, sur le poste du développeur. Relève, vérifiés selon le socle d'observation, les journaux d'enveloppes des projets, un par système qui exporte, dont ceux qu'il écrit pour le binôme Agent2Dev et Agent2Test à partir de leurs refus et de leurs kits, les confronte entre instances, entre systèmes par les invariants du dépôt que citent leurs écarts, et par règle de l'acceptable que citent les refus, compte les kits du binôme, observe l'état de l'écosystème, écrit des propositions minimisées que le développeur apporte au dépôt par pull request, et suit l'effet de celles que la ratification fait entrer dans une version. Premier et troisième couplages du troisième ordre ; il propose et n'applique jamais. À utiliser depuis un clone du dépôt Agent2Prompt.
version: 1.3.0
---

# Observatoire de l'écosystème, version 1.3.0

Chaque système de second ordre du dépôt apprend dans ses projets, mais seul : le générateur de skills de ticket relève ce qu'il apprend d'un ticket et en propose l'évolution à son développeur, sans voir ce que ses autres instances apprennent, et ce qui doit remonter jusqu'au dépôt y remonte à la main. L'observatoire ferme cette boucle, le premier couplage du troisième ordre, entre systèmes (`EVOLUTION.md`, section 10.3). Sur le poste, il relève les journaux d'enveloppes que les systèmes exportent dans leurs projets, au format du socle `socle-observation`, inclus dans sa transmission ; il les confronte d'une instance à l'autre, et d'un système à l'autre par les invariants du dépôt que citent leurs écarts, observe l'état de l'écosystème, en tire des propositions que le développeur apporte au dépôt par pull request, et suit, dans les enveloppes qui suivent, l'effet de celles que la ratification fait entrer dans une version.

Depuis 1.2.0, il ferme aussi, dans ses limites, la boucle du troisième couplage, avec les valeurs : le binôme Agent2Dev et Agent2Test, qui n'a pas d'outil dans le dépôt, exporte ses refus par l'outil d'export que porte l'observatoire, et l'observatoire confronte ces refus par la règle qu'ils citent, du socle de l'acceptable ou des constitutions ; une règle que plusieurs instances déclarent infondée par des faux refus remonte, trop large, à la spécification qui la définit. Depuis 1.3.0, l'export du binôme traduit aussi les étapes de ses kits, remise, validation, application ou échec, retour arrière, et l'observatoire les compte par système, environnement et instance, sans en tirer de proposition.

L'observatoire propose et n'applique jamais (`EVOLUTION.md`, section 10.5, règle 4). Il n'ajoute aucun niveau d'observation : il ne lit des instances que leurs enveloppes, minimisées, et ne regarde jamais à l'intérieur d'un système (règle 1) ; son outil d'export du binôme agit à la source, pour le binôme, comme l'export d'un système pour le sien, et ne partage rien avec le magasin. Ce qu'il relève reste sur le poste ; seules entrent dans le dépôt les propositions, aussi minimisées que les enveloppes. Les règles détaillées sont dans `modules/`.

## 1. Lecture

1. Ce fichier.
2. `manifest.json` : modules, et socle d'observation inclus.
3. Le socle `socle-observation/SKILL.md` : l'enveloppe que l'observatoire lit, ses ordres et niveaux, son chaînage et sa minimisation.
4. Les modules, dans l'ordre de la boucle : `export-binome`, `releve`, `confrontation`, `systemes`, `acceptable`, `kits`, `etat`, `propositions`, `suivi`.

## 2. Vue d'ensemble

```mermaid
flowchart LR
  subgraph POSTE["Poste du développeur"]
    L["livrables du binôme<br/>rubriques acceptable et kits"] --> X["export du binôme<br/>à la source"]
    X --> A
    A["projet A<br/>un journal par système qui exporte"] --> M["magasin local<br/>miroirs vérifiés"]
    B["projet B<br/>un journal par système qui exporte"] --> M
    M --> C["confronter<br/>retours, récurrences, invariants, règles de l'acceptable, kits"]
    C --> P["proposer<br/>observatoire/propositions/*.md"]
    M --> S["suivre<br/>effet après la version"]
  end
  P -->|"pull request, ratification humaine"| D["dépôt Agent2Prompt<br/>version d'une spécification"]
  D -->|"transmission"| A
  D --> S
```

Le magasin est dans le répertoire Git commun du clone d'Agent2Prompt, `<git-common-dir>/agent2prompt/observatoire/` : il n'est jamais versionné, et les worktrees du clone le partagent. Il se reconstruit à partir des journaux, versionnés dans les projets ; seule la liste des projets inscrits serait à refaire.

## 3. Déroulé

1. **Exporter**, dans chaque projet, avec l'outil de chaque système, sous le même sel d'instance : pour le générateur, son `observation.mjs exporter` (`generateur-skill-ticket`, module `observation`) ; pour l'orchestrateur, le sien (`orchestrateur-c7e`, module `observation`) ; pour le binôme, `export-binome.mjs exporter`, de l'observatoire, avec les livrables d'Agent2Dev et les journaux de tests d'Agent2Test de l'application (module `export-binome`).
2. **Inscrire** chaque projet une fois : `node specs/observatoire/outils/observatoire.mjs inscrire --projet <dossier>`, depuis le clone. Son instance est celle de ses journaux, la même pour tous (module `releve`).
3. **Relever** : chaque journal inscrit est vérifié et recopié dans le magasin, en ajout seul ; `etat`, `confronter`, `proposer` et `suivre` relèvent d'abord.
4. **Lire l'état** de l'écosystème : instances, versions en usage, écarts aux versions publiées (module `etat`).
5. **Confronter** : retours et récurrences candidats (module `confrontation`), invariants du dépôt relevés par plusieurs systèmes ou plusieurs instances (module `systemes`), règles de l'acceptable que citent les refus, dont celles que des faux refus de plusieurs instances déclarent trop larges (module `acceptable`), et kits du binôme, comptés, sans candidat (module `kits`).
6. **Proposer** : une proposition par candidat nouveau, écrite dans `observatoire/propositions/` ; le développeur la relit, rédige ce qu'il propose de changer, et ouvre la pull request (module `propositions`).
7. **Ratifier** : la pull request de ratification inscrit le statut de la proposition, ratifiée dans telle version de telle spécification, ou refusée ; la version suit `EVOLUTION.md`.
8. **Suivre** : pour chaque proposition ratifiée, l'effet observé dans les enveloppes des versions qui la portent (module `suivi`).

## 4. Outils

Lancés depuis le clone du dépôt, avec Node 20 ou plus récent, sans dépendance.

| Outil | Commandes | Modules |
|---|---|---|
| `observatoire.mjs` | `inscrire --projet <dossier>`, `relever`, `etat [--json]`, `confronter [--json]`, `proposer [--date AAAA-MM-JJ]`, `suivre [--json]`, `verifier` | tous, sauf `export-binome` |
| `export-binome.mjs` | `exporter --projet <dossier> <fichier>...`, `verifier --projet <dossier>`, `etat --projet <dossier> [--json]` | `export-binome` |

Codes de sortie : 0 ; 1 pour un refus, un journal altéré ou un magasin altéré ; 2 pour un usage incorrect. Aucun outil ne commite, ne pousse ni n'ouvre de pull request. `export-binome.mjs` écrit dans le projet de l'application, `<dossier>`, et dans son répertoire Git commun, pour le sel de l'instance ; jamais dans le magasin.

## 5. Cycle 7E, au niveau de l'écosystème

| Phase | Dans l'observatoire | Module |
|---|---|---|
| Éléments | les enveloppes que les instances exportent, dont celles que l'export écrit pour le binôme | `export-binome`, `releve` |
| Espace | le socle d'observation, milieu commun ; le magasin local | `releve` |
| Engendrent | la confrontation des instances entre elles, des systèmes entre eux, des refus avec les règles qu'ils citent, et les comptes des kits | `confrontation`, `systemes`, `acceptable`, `kits` |
| État | les versions en usage, comparées aux versions publiées | `etat` |
| Expression | les propositions, apportées au dépôt par pull request | `propositions` |
| Évolutif | l'effet des propositions ratifiées, suivi dans les enveloppes | `suivi` |
| Environnement | le développeur qui ratifie, les projets, le dépôt et ses transmissions | tous |

## 6. Registre des dimensions

| ID | Dimension | Introduite | Statut 1.3.0 | Ordre | Dépend de | Module |
|---|---|---|---|---|---|---|
| D1 | Inscription et relevé | 1.0 | active | OC1 | socle d'observation | `releve` |
| D2 | Confrontation entre instances | 1.0 | active | OC3 | D1 | `confrontation` |
| D3 | État de l'écosystème | 1.0 | active | OC3 | D1 | `etat` |
| D4 | Propositions au dépôt | 1.0 | active | OC3 | D2 | `propositions` |
| D5 | Suivi des propositions ratifiées | 1.0 | active | OC3 | D4 | `suivi` |
| D6 | Confrontation entre systèmes | 1.1 | active | OC3 | D1, D2 | `systemes` |
| D7 | Export du binôme | 1.2 | active | OC1 | socle d'observation | `export-binome` |
| D8 | Confrontation de l'acceptable | 1.2 | active | OC3 | D1, D7 | `acceptable` |
| D9 | Confrontation des kits | 1.3 | active | OC3 | D1, D7 | `kits` |

La colonne « Ordre » dit l'ordre cybernétique de chaque dimension, au sens d'`EVOLUTION.md`, section 10 : D1 régule, au premier ordre, ce qui entre dans le magasin, et D7 ce qui sort d'une instance pour le binôme ; D2 à D6 font la boucle du troisième ordre entre systèmes, des instances et des systèmes au dépôt et du dépôt aux instances, et D8 celle du troisième couplage, des refus aux règles de l'acceptable ; D9 y observe les kits, en comptes, sans proposition ; elles sont actives parce que leurs invariants ont leurs tests (règle 3).

## 7. Versions et points d'extension

L'observatoire suit le contrat de version de `EVOLUTION.md`. Le socle d'observation est inclus dans sa transmission, épinglé dans `manifest.json`, et référencé à sa version courante : une version du socle entraîne une version de l'observatoire, dont la vérification des enveloppes suit le socle.

- **E1** : systèmes qui exportent. En 1.3, le générateur de skills de ticket exporte dans `docs/c7e/observations.jsonl`, l'orchestrateur C7E (D12) dans `docs/c7e/observations-orchestrateur-c7e.jsonl`, et le binôme Agent2Dev et Agent2Test, ses refus (D26) et ses kits (D27), par l'outil d'export de l'observatoire (D7), dans `docs/c7e/observations-agent2dev.jsonl` et `docs/c7e/observations-agent2test.jsonl`. Un autre système rejoindra la confrontation par son export, dans son journal, que l'observatoire ajoutera à sa liste.
- **E2** : pluralité des sujets. En 1.0, un seul développeur peut ratifier une proposition ; la ratification par au moins deux sujets distincts, référent, pair ou commanditaire, relève de la gouvernance distribuée, jalon J5 du passage au troisième ordre.
- **E3** : modèle de l'acceptable. Depuis 1.2, les refus, dérogations et faux refus du binôme se confrontent par règle, sous le modèle de l'acceptable (D8) ; depuis 1.3, ses kits, leurs applications, leurs échecs et leurs retours arrière, s'y comptent, selon le contrat des kits du socle de l'acceptable (D9). Les refus de l'orchestrateur et du générateur, dont l'acceptable reste réservé, et le kit démo du générateur s'y ajouteront, chacun par une correspondance du socle d'observation ; une proposition sur les kits attendra des données réelles.

## 8. Règles globales

- **Proposer, jamais appliquer** : l'observatoire n'écrit dans le dépôt que des propositions ; il ne modifie aucune spécification ni aucun projet, ne commite, ne pousse ni ne publie ; la pull request et sa ratification restent humaines (D4.INV-2).
- **Minimisation** : rien d'une instance n'entre dans le dépôt, sinon des valeurs minimisées : un système et ses versions, un motif, une profondeur, des nombres, des références tronquées (D4.INV-1). Le corps d'une proposition est rédigé par le développeur, qui n'y met aucune donnée d'une instance.
- **Local** : le magasin reste sur le poste, hors de tout arbre de travail (D1.INV-1) ; aucun outil ne se connecte au réseau.
- **Aucun niveau de plus** : l'observatoire ne lit que des enveloppes vérifiées (D1.INV-2) ; il ne lit ni le sel, ni le champ, ni le registre d'une instance. L'export du binôme (D7) agit à la source, à part, pour un système sans outil dans le dépôt : il lit les livrables qu'on lui désigne et le sel de l'instance, comme l'export d'un système, et ne touche pas au magasin.
- **Limites déclarées** : en 1.3, quatre systèmes exportent, le générateur, l'orchestrateur, Agent2Dev et Agent2Test (E1) ; leurs motifs ne se ressemblent pas, et ils ne se confrontent que par les invariants du dépôt que citent leurs écarts (D6), et par les règles de l'acceptable que citent les refus du binôme (D8) ; les enveloppes du registre des concepts, sans profondeur et qui visent l'instance, ne font ni retour ni récurrence : elles comptent dans l'état de l'écosystème. Le dépôt prouve l'export du binôme sur des livrables d'épreuve : le binôme réel les produira une fois construit. Seuls les faux refus récurrents font une proposition ; un refus seul ne fait que se compter, comme les kits, qui ne citent aucune règle. L'effet d'une proposition sur une règle du noyau reste indécidable : le socle de l'acceptable n'exporte pas, et les enveloppes ne portent pas sa version. Un seul sujet ratifie (E2). Avec une seule instance sur le poste, les retours et les invariants relevés par deux systèmes remontent, et les récurrences et les règles trop larges attendent une deuxième instance. Les couplages 1 et 3 du troisième ordre sont fermés dans ces limites, qu'`EVOLUTION.md`, section 10, rappelle.

## 9. Critères de réussite

- **P1** : un journal altéré, réécrit, ou d'une version inconnue n'entre dans aucune confrontation ; le magasin ne fait que s'allonger.
- **P2** : un retour remonte dès une instance ; une récurrence demande deux instances distinctes.
- **P3** : l'état de l'écosystème dit, pour chaque instance, quels systèmes sont en retard sur leur version publiée.
- **P4** : une proposition ne porte aucune donnée d'une instance, et ne se répète pas.
- **P5** : l'effet d'une proposition ratifiée se mesure, ou se déclare indécidable.
- **P6** : un même invariant du dépôt, relevé par deux systèmes ou dans deux instances, remonte à la spécification qui le définit ; un même écart, constaté par un système et décidé dans le registre d'un autre, ne compte qu'une fois.
- **P7** : les refus du binôme sortent de leur instance minimisés, datés par leur rubrique, chaînés dans un journal par système ; une rubrique réécrite depuis son export arrête l'export.
- **P8** : une règle déclarée infondée par des faux refus dans deux instances remonte, trop large, à la spécification qui la définit ; un refus seul, ou des faux refus d'une seule instance, ne font que se compter.
- **P9** : les étapes des kits du binôme sortent de leur instance minimisées, une enveloppe par étape, reliées par l'ancre de leur kit ; l'observatoire les compte par système, environnement et instance, kits en attente et kits test non nettoyés compris, sans proposition.

## 10. Invariants

**D1 : inscription et relevé**

- **D1.INV-1** : le magasin de l'observatoire est dans le répertoire Git commun du clone d'Agent2Prompt, `<git-common-dir>/agent2prompt/observatoire/`, partagé par ses worktrees et hors de tout arbre de travail : il n'est jamais versionné, publié ni exporté, et ne garde que les chemins des projets inscrits et les miroirs de leurs journaux.
- **D1.INV-2** : un journal ne se relève que vérifié selon le socle épinglé, schéma, chaîne et tête ; un journal altéré, ou réécrit depuis le dernier relevé, est refusé et son miroir reste tel quel ; un miroir ne fait que s'allonger, et un magasin altéré arrête tout relevé.
- **D1.INV-3** : une enveloppe d'un système ou d'une version que le dépôt ne publie pas est écartée de toute confrontation, et signalée.

**D2 : confrontation entre instances**

- **D2.INV-1** : une récurrence est un même motif, à la même profondeur, pour un même système, dans au moins deux instances distinctes, comptées par leur empreinte et non par leurs projets ; un motif générique, un verdict neutre ou une décision n'en font pas.
- **D2.INV-2** : un retour est une proposition d'une instance qui vise une spécification et qu'une décision humaine de cette instance a retenue ; il remonte dès une instance ; une proposition refusée, ou qui ne vise que l'instance, ne remonte pas.

**D3 : état de l'écosystème**

- **D3.INV-1** : pour chaque instance, chaque système qui exporte est comparé à la version que le dépôt publie : à jour, en retard, ou inconnue.

**D4 : propositions au dépôt**

- **D4.INV-1** : une proposition suit le format `observatoire.proposition/1` : son en-tête ne porte que des valeurs minimisées, système, versions, sorte, motif, profondeur, nombres d'instances et d'enveloppes, références tronquées et statut, et, pour une proposition par invariant ou par faux refus, l'invariant du dépôt et les systèmes qui l'ont relevé ; aucun texte, chemin, clé ni nom d'une instance n'entre dans le dépôt.
- **D4.INV-2** : l'observatoire n'écrit dans le dépôt que des propositions, dans `observatoire/propositions/`, ne modifie ni une spécification ni un projet, ne commite ni ne publie : la pull request et sa ratification restent humaines ; une proposition ouverte ou ratifiée ne se répète pas, et une proposition refusée ne revient qu'avec une instance nouvelle.

**D5 : suivi des propositions ratifiées**

- **D5.INV-1** : l'effet d'une proposition ratifiée se mesure par la part de son motif dans les enveloppes du système, avant et après la version qui la porte ; il ne se déclare, observé ou non observé, qu'avec au moins vingt enveloppes de part et d'autre, sinon il est indécidable.

**D6 : confrontation entre systèmes**

- **D6.INV-1** : un même invariant du dépôt, cité par des écarts ou des dérogations, fait un candidat quand ses écarts distincts sont au moins deux et viennent de deux instances ou de deux systèmes ; un écart se désigne par son instance et son ticket, et les enveloppes d'un même écart, celle du système qui le constate et celle du registre où il est décidé, ne comptent qu'une fois ; un invariant que le dépôt ne définit pas ne fait pas de candidat ; une réponse à un refus, qui vise l'enveloppe de son refus, n'est pas un écart : elle relève de D8.
- **D6.INV-2** : un candidat par invariant se propose à la spécification qui définit l'invariant, à sa version courante, avec les systèmes qui l'ont relevé ; ses références désignent chaque enveloppe par son instance tronquée, son système et son numéro, puisque chaque système tient son journal.

**D7 : export du binôme**

- **D7.INV-1** : l'export du binôme traduit la rubrique `acceptable` d'un livrable d'Agent2Dev ou d'un journal de tests d'Agent2Test selon la correspondance du socle d'observation, section 6.5, et sa rubrique `kits` selon la section 6.6 : une enveloppe par refus, par réponse et par étape d'un kit, un échec en une seule, datée par la rubrique, au nom et à la version du système qui a produit l'enregistrement ; il ne modifie aucun fichier désigné, et la même rubrique, sous le même sel, donne les mêmes enveloppes, octet pour octet, quel que soit l'ordre des fichiers.
- **D7.INV-2** : l'export écrit dans le projet de l'application un journal par système, `docs/c7e/observations-agent2dev.jsonl` et `docs/c7e/observations-agent2test.jsonl`, en ajout seul, chaîné, avec sa tête, sous le sel de l'instance, qu'il lit dans le répertoire Git commun du projet, ou tire s'il n'y existe aucun journal d'enveloppes ; un enregistrement déjà exporté ne l'est pas deux fois ; une réponse venue après son refus le vise, et la validation d'un kit, l'enveloppe de sa remise ; un journal altéré, une source illisible, une rubrique qui change ou retire un enregistrement exporté, un sel absent alors qu'un journal existe, ou étranger à l'un d'eux, ou une enveloppe mal formée arrêtent l'export, sans rien écrire.
- **D7.INV-3** : aucune enveloppe de l'export ne porte l'objet refusé, le motif d'une réponse, le commentaire d'un échec ni le nom d'une personne : la règle sort préfixée par la spécification qui la définit, le rôle qui répond ou déclare par son nom dans le socle, la demande, la campagne et l'empreinte du patch d'un kit par leur empreinte salée ; l'export n'écrit rien dans le magasin de l'observatoire, et le sel ne s'affiche ni ne sort.

**D8 : confrontation de l'acceptable**

- **D8.INV-1** : les refus se confrontent par règle : pour chaque invariant qu'un refus cite, l'observatoire rend le nombre de refus, de dérogations et de faux refus, les systèmes qui les ont produits et le nombre d'instances où ils ont paru, une réponse comptant sous la règle du refus qu'elle vise, dans le journal de son système ; un refus, une dérogation ou un faux refus ne fait ni retour, ni récurrence, ni candidat par invariant.
- **D8.INV-2** : une règle que le dépôt définit, déclarée infondée par des faux refus dans au moins deux instances distinctes, fait un candidat « règle trop large », de sorte `faux-refus`, proposé à la spécification qui la définit, à sa version courante, avec les systèmes qui ont relevé ces faux refus ; un refus sans faux refus, des faux refus d'une seule instance, ou une règle que le dépôt ne définit pas n'en font pas.

**D9 : confrontation des kits**

- **D9.INV-1** : les kits se comptent par système et par environnement, leurs étapes se reconnaissant à l'ancre de leur kit : remis, validés, appliqués, en échec, défaits, validés en attente d'application, kits test appliqués sans nettoyage déclaré, et le nombre d'instances où ils ont paru, un échec comprenant son retour arrière ; une enveloppe de kit ne fait ni retour, ni récurrence, ni candidat par invariant ou par faux refus, et la confrontation des kits ne propose rien.

## 11. Journal de révision

**1.0.0** (2026-11-24) : création, jalon J2 du passage du dépôt au troisième ordre (`EVOLUTION.md`, section 10). Dimensions D1 à D5, actives ; D2 à D5 forment la première boucle OC3 du dépôt, entre systèmes. Outil `observatoire.mjs` ; magasin local dans le répertoire Git commun du clone ; propositions dans `observatoire/propositions/`, au format `observatoire.proposition/1`. Socle `socle-observation` 1.1.0 inclus et référencé. Décisions ratifiées avant la rédaction (plan du jalon J2) : spécification `observatoire`, transmissible et outillée (O1) ; magasin dans le répertoire Git commun du clone (O2) ; retours dès une instance et récurrences dans au moins deux (O3) ; propositions versionnées, leur statut inscrit par la pull request de ratification (O4).

**1.1.0** (2026-11-24) : dimension D6 active, la confrontation entre systèmes, jalon J1c du passage du dépôt au troisième ordre (`EVOLUTION.md`, section 10). L'observatoire relève aussi le journal de l'orchestrateur C7E, `docs/c7e/observations-orchestrateur-c7e.jsonl`, que l'export de sa version 3.7.0 écrit sous le sel de l'instance (E1), et reconnaît en clair les identifiants de concepts `C_<DOMAINE>_<NNN>`. Une sorte de candidat de plus, l'invariant : un même invariant du dépôt, relevé par des écarts distincts de deux systèmes ou de deux instances, proposé à la spécification qui le définit ; le même écart, constaté par le générateur et décidé au registre des écarts de l'orchestrateur, ne compte qu'une fois. Module `systemes` ; invariants D6.INV-1 et D6.INV-2 ; D4.INV-1 étendu à l'en-tête d'une proposition par invariant, qui porte l'invariant et les systèmes, identifiants du dépôt, sans rien relâcher de la minimisation ; références qui nomment le système de chaque enveloppe ; effet d'une proposition par invariant mesuré sur les écarts qui le citent, dans les enveloppes de la spécification qui le définit. Onze invariants. Décision ratifiée avant la rédaction : confrontation par invariant (C4, plan du jalon J1c). Archive : `archives/SKILL-v1.0.0.md`.

**1.2.0** (2026-11-25) : dimensions D7 et D8 actives, jalon J3c du passage du dépôt au troisième ordre (`EVOLUTION.md`, section 10) : l'export des refus du binôme et la confrontation de l'acceptable ferment, dans leurs limites déclarées, la boucle du troisième couplage, avec les valeurs. Outil `export-binome.mjs`, module `export-binome` (D7) : la rubrique `acceptable` d'un livrable d'Agent2Dev ou d'un journal de tests d'Agent2Test, traduite selon la correspondance du socle d'observation 1.2.0, section 6.5, dans un journal par système du projet de l'application, `docs/c7e/observations-agent2dev.jsonl` et `docs/c7e/observations-agent2test.jsonl`, sous le sel de l'instance ; l'outil agit à la source, à part du magasin. Module `acceptable` (D8) : refus, dérogations et faux refus comptés par règle, par système et par instance ; une sorte de candidat de plus, `faux-refus`, une règle déclarée infondée par des faux refus dans au moins deux instances, proposée trop large à la spécification qui la définit, le socle de l'acceptable pour une règle `SA`. Le préfixe `SA` est reconnu dans le champ `invariant`, et le sujet `testeur`. D4.INV-1 étendu à l'en-tête d'une proposition par faux refus, sans rien relâcher de la minimisation ; D6.INV-1 précisé : une réponse à un refus n'est pas un écart. Défaut corrigé : une décision visait, par son numéro, une enveloppe de n'importe quel journal de son instance ; elle vise désormais celle du journal de son système, où les numéros recommencent à 1. Seize invariants. Socle `socle-observation` 1.2.0 inclus et référencé. Décisions ratifiées avant la rédaction : plan du jalon J3c, X1 à X3 et X5. Archive : `archives/SKILL-v1.1.0.md`.

**1.3.0** (2026-11-25) : dimension D9 active, jalon J3e du passage du dépôt au troisième ordre (`EVOLUTION.md`, section 10), l'export des kits. D7 étendue : `export-binome.mjs` traduit aussi la rubrique `kits` d'un livrable d'Agent2Dev ou d'un journal de tests d'Agent2Test, selon la correspondance du socle d'observation 1.3.0, section 6.6 : la remise, la validation, qui vise la remise, l'application ou son échec, en une seule enveloppe, et le retour arrière d'un kit, reliés par l'ancre de nature `kit`, dans les mêmes journaux, sous le même sel, tout ou rien comme avant ; une étape exportée ne change plus, une étape nouvelle s'ajoute. Module `kits` (D9) : les kits comptés par système et par environnement, remis, validés, appliqués, en échec, défaits, en attente d'application, kits test sans nettoyage déclaré, avec leurs instances ; des comptes seulement, sans candidat. D7.INV-1 à D7.INV-3 étendus aux kits, sans rien relâcher de la minimisation ; dix-sept invariants. La nature d'ancre `kit` est reconnue. Socle `socle-observation` 1.3.0 inclus et référencé. Décisions ratifiées avant la rédaction : plan du jalon J3e, Y1 à Y3. Archive : `archives/SKILL-v1.2.0.md`.
<<<FIN SKILL.md>>>

<<<FICHIER socle-observation/SKILL.md>>>
---
name: socle-observation
description: Socle d'observation partagé. Il fixe l'enveloppe commune des observations, propositions, décisions et écarts qu'un système de second ordre du dépôt rend observables aux autres, au sens du troisième ordre (EVOLUTION.md, section 10) : schéma fermé, journal en ajout seul et chaîné, minimisation, correspondances avec les formats existants. À lire avant d'exporter les observations d'un système vers le milieu commun.
version: 1.3.0
---

# Socle d'observation, version 1.3.0

Ce socle est le milieu commun du premier couplage du troisième ordre, entre systèmes (`EVOLUTION.md`, section 10.3) : chaque système de second ordre du dépôt y rend observables ses observations, ses propositions, ses décisions et ses écarts, dans une même enveloppe, sans changer ses propres formats. Un système dont la dimension d'export est active l'inclut à l'identique, à une version épinglée ; un système dont l'export est encore réservé le référence. En 1.3.0, `generateur-skill-ticket` et `orchestrateur-c7e` l'incluent et exportent leurs observations ; `observatoire` l'inclut, relève les journaux d'enveloppes de tous les systèmes, et exporte pour le binôme Agent2Dev et Agent2Test, dont le code se construit hors du dépôt, les refus et les kits de leurs livrables. Un système ne redéfinit jamais une règle du socle : il peut seulement la préciser pour ses propres formats.

Les identifiants du socle commencent par `SO` (`SO3.INV-1`), pour ne jamais se confondre avec ceux d'une spécification, qui commencent par `D`, ni avec ceux du socle back-front, qui commencent par `SC`, ni avec ceux du socle de l'acceptable, qui commencent par `SA`.

Les invariants du socle sont en vigueur dans un système dès que sa dimension d'export est active et que ses tests les prouvent : dans le générateur de skills de ticket depuis sa version 1.3.0, dans l'orchestrateur C7E depuis sa version 3.7.0, et dans l'export du binôme de l'observatoire depuis sa version 1.2.0.

## 1. Vue d'ensemble

```mermaid
flowchart LR
  subgraph INSTANCE["Instance : un projet, sur le poste"]
    GEN["générateur de skills de ticket<br/>champ, relevé, registre d'apprentissage"]
    C7E["orchestrateur C7E<br/>registre des concepts, registre des écarts"]
    BIN["binôme Agent2Dev et Agent2Test<br/>rubriques acceptable et kits des livrables"]
    SEL["sel de l'instance<br/>jamais exporté"]
    EXP["export selon SO4<br/>un outil par système ; celui de l'observatoire pour le binôme"]
    J[("journaux d'enveloppes, un par système<br/>socle-observation.enveloppe/1")]
  end
  OBS["observatoire, sur le poste"]
  GEN --> EXP
  C7E --> EXP
  BIN --> EXP
  SEL --> EXP
  EXP --> J
  J -.->|"ajout seul, minimisé"| OBS
```

Les formats sources restent ce qu'ils sont, là où ils sont : l'export les traduit, il ne les remplace pas.

## 2. Registre des dimensions du socle

| ID | Dimension | Statut 1.3.0 |
|---|---|---|
| SO1 | Enveloppe : schéma fermé, ordres et niveaux | active |
| SO2 | Chaînage : journal en ajout seul | active |
| SO3 | Minimisation : ce qui peut sortir d'une instance | active |
| SO4 | Correspondances avec les formats du générateur, de l'orchestrateur et du binôme | active |

## 3. SO1 : enveloppe

### 3.1 Schéma

Une enveloppe par ligne, au format `socle-observation.enveloppe/1` :

```json
{
  "schema": "socle-observation.enveloppe/1",
  "numero": 12,
  "date": "2026-11-24T09:00:00Z",
  "systeme": { "nom": "generateur-skill-ticket", "version": "1.3.0" },
  "instance": "9f2c…",
  "ordre": "OC2",
  "niveau": "N2",
  "type": "proposition",
  "motif": "possibilite-inconnue",
  "sujet": "observateur-N2",
  "source": { "format": "skill-ticket.observation/1", "journal": "5e0d…", "numero": 7 },
  "precedent": "4b1e…",
  "nature": "proposition",
  "profondeur": "meso-contrats",
  "cible": "instance",
  "ancre": { "nature": "noeud", "ref": "c07a…" },
  "preuve": { "nature": "enregistrements", "ref": "5" }
}
```

| Champ | Requis | Valeurs |
|---|---|---|
| `schema` | oui | `socle-observation.enveloppe/1` |
| `numero` | oui | entier, 1 pour la première ligne, puis consécutif |
| `date` | oui | UTC, `AAAA-MM-JJTHH:MM:SSZ`, jamais antérieure à celle de la ligne précédente |
| `systeme` | oui | `{ nom, version }` : la spécification qui exporte, à sa version |
| `instance` | oui | empreinte du sel de l'instance (section 5) |
| `ordre` | oui | `OC1`, `OC2`, `OC3` |
| `niveau` | oui | `N1`, `N2`, `N3`, `humain` |
| `type` | oui | `observation`, `proposition`, `decision`, `refus`, `derogation`, `ecart` |
| `motif` | oui | minuscules et tirets (`possibilite-inconnue`), le même pour un même écart d'une instance à l'autre |
| `sujet` | oui | un rôle : `developpeur`, `referent`, `testeur`, `agent:<spécification>`, `observateur-N2`, `observateur-N3` |
| `source` | oui | `{ format, journal, numero }` : le format source ; le journal source, empreinte salée de sa clé, présent pour un format qui tient plusieurs journaux dans une instance, comme le champ d'observation du générateur, un par ticket, absent pour un format à journal unique ; le numéro de l'enregistrement traduit dans ce journal |
| `precedent` | oui | empreinte de la ligne précédente, `null` pour la première (section 4) |
| `nature` | non | valeur de la liste fermée du format source : verdict d'une observation, nature d'un retour ou d'un relevé, statut d'un concept |
| `profondeur` | non | `macro`, `meso-contrats`, `meso-composants`, `micro` |
| `cible` | non | `instance` (ce qui relève du projet) ou `specification` (ce qui relève d'une spécification du dépôt) |
| `invariant` | non | identifiant d'un invariant d'une spécification du dépôt, préfixé par son nom (`orchestrateur-c7e:D6.INV-3`, `socle-acceptable:SA2.INV-1`) |
| `ancre` | non | `{ nature, ref }` ; nature : `noeud`, `critere`, `ca`, `scenario`, `fichier`, `commit`, `contrat`, `option`, `ticket`, `concept`, `kit` |
| `preuve` | non | `{ nature, ref }` ; nature : `test`, `commande`, `commit`, `fichier`, `enregistrements`, `rapport`, `champ`, `arbre` |
| `decision` | non | `{ valeur, vise }` : `retenue`, `refusee` ou `amendee`, et le numéro de l'enveloppe visée : une proposition, ou le refus auquel répond une dérogation ou un faux refus (section 6.5) |

Le type `refus` appartient au modèle de l'acceptable, couplage 3 du troisième ordre : seule la correspondance des rubriques `acceptable` du binôme le produit (section 6.5), avec les dérogations et les faux refus qui y répondent. La clé `cible: specification` désigne ce qui doit pouvoir remonter jusqu'au dépôt.

### 3.2 Ordres et niveaux

Chaque enveloppe porte l'ordre cybernétique de la boucle qui l'a produite et le niveau de l'observateur, au sens d'`EVOLUTION.md`, section 10 :

| Niveau | Ordre | Exemples |
|---|---|---|
| `N1` | `OC1` | verdict conforme ou écart sur le travail ; désaccord entre deux nœuds |
| `N2`, `N3` | `OC2` | proposition d'adaptation de la méthode ; examen d'une proposition ; mise en veille d'un motif |
| `humain` | celui de la boucle où la personne intervient | correction ou ratification d'un travail (`OC1`) ; décision sur une proposition de méthode (`OC2`) |

L'ordre `OC3` est réservé aux enregistrements de l'écosystème, que tiendra l'observatoire du dépôt : aucun système ne l'émet.

### 3.3 Invariants

- **SO1.INV-1** : une observation qui sort d'un système le fait dans une enveloppe `socle-observation.enveloppe/1`, au schéma fermé ; un champ inconnu, une valeur hors liste ou un champ requis absent la fait refuser, et rien n'est écrit. Contrôle : test de l'export du système, sur des enveloppes mal formées.
- **SO1.INV-2** : chaque enveloppe déclare son ordre et son niveau selon la table de la section 3.2 : le niveau `N1` avec l'ordre `OC1`, les niveaux `N2` et `N3` avec l'ordre `OC2` ; aucun niveau ne dépasse `N3`, et aucun système n'émet l'ordre `OC3`. Contrôle : test de l'export, sur chaque type d'enregistrement source.

## 4. SO2 : chaînage

### 4.1 Règles

- Un journal d'enveloppes est un fichier JSONL tenu par le système qui exporte, à l'emplacement que fixe sa dimension d'export, un par instance.
- Chaque ligne est l'enveloppe sous sa forme canonique : les champs dans l'ordre du tableau de la section 3.1, ceux des objets imbriqués dans l'ordre où ils y sont décrits, sans espace, encodée en UTF-8. C'est la règle du champ d'observation du générateur.
- `precedent` est l'empreinte SHA-256, en 64 caractères hexadécimaux minuscules, de la ligne précédente telle qu'elle est écrite ; `null` pour la première.
- La tête du journal, fichier tenu à côté de lui, porte l'empreinte de sa dernière ligne : une dernière ligne réécrite ou supprimée, que le chaînage seul ne relève pas, s'y relève.
- Seul l'export du système écrit le journal et sa tête ; il les vérifie avant chaque ajout.

### 4.2 Invariants

- **SO2.INV-1** : un journal d'enveloppes est en ajout seul : chaque ligne porte son numéro, consécutif, sa date en UTC, jamais antérieure à la précédente, et l'empreinte de la ligne précédente sous sa forme canonique ; une ligne réécrite, insérée ou supprimée se relève, et un journal rompu refuse tout ajout. Contrôle : test de l'export sur un journal altéré à la main.

## 5. SO3 : minimisation

### 5.1 Règles

- **Sel de l'instance** : un secret aléatoire de 32 octets, tiré à la première exportation, gardé dans l'instance par le système qui exporte, jamais exporté ni versionné. Il s'écrit en 64 caractères hexadécimaux minuscules, et c'est sous cette forme qu'il entre dans les empreintes.
- **Instance** : `instance` est l'empreinte SHA-256 du sel ; deux systèmes d'une même instance qui partagent son sel la désignent de la même façon.
- **Références** : toute référence propre à l'instance (clé de ticket, nœud, critère, scénario, chemin, commit, nom) sort sous la forme de son empreinte salée, SHA-256 du sel suivi de `:` et de la référence. Un numéro d'enregistrement d'un journal de l'instance n'en est pas une, et sort tel quel ; une liste de numéros sort sans espace, séparée par des virgules. Seul un identifiant défini par une spécification du dépôt sort en clair : un invariant, un concept du registre de départ de l'orchestrateur, une catégorie de méso-contrat.
- **Texte** : aucun texte libre ne sort. Résumés, commentaires, constats, raisons, contenus de retour et propositions rédigées restent dans l'instance, où l'enveloppe les retrouve par sa `source`.
- **Personnes** : le sujet est un rôle ; le nom d'un relecteur, d'un développeur, d'un testeur ou d'un référent reste dans l'instance.

### 5.2 Invariants

- **SO3.INV-1** : aucune enveloppe ne porte de texte libre, ni code, ni texte de ticket, ni commentaire, ni secret : seulement un motif en minuscules et tirets, des valeurs de listes fermées, des numéros, des identifiants définis par une spécification du dépôt et des empreintes. Contrôle : test de l'export, qui confronte chaque enveloppe produite à cette liste.
- **SO3.INV-2** : aucune enveloppe ne nomme une personne, un client ou un projet : l'instance se désigne par l'empreinte de son sel, le sujet par un rôle, et toute référence propre à l'instance par son empreinte salée ; le sel ne sort jamais. Contrôle : test de l'export sur des sources qui portent noms, clés et chemins.

## 6. SO4 : correspondances

Une correspondance dit comment un enregistrement d'un format source devient une enveloppe. Les empreintes salées de la section 5 s'appliquent partout où une référence de l'instance apparaît ; elles ne sont pas répétées dans les tableaux.

La date d'une enveloppe est celle de l'enregistrement qu'elle traduit, pour un événement du registre des concepts celle du commit qui le porte, pour un refus, une réponse ou une étape d'un kit du binôme celle que porte sa rubrique, ou celle de la ligne précédente du journal si elle est plus récente : un enregistrement exporté après d'autres, plus récents, par exemple venu d'une branche fusionnée plus tard, prend la date de la dernière enveloppe, et le journal reste dans l'ordre du temps. Un export fusionne par date les enregistrements nouveaux de ses journaux sources, sans jamais changer leur ordre dans un même journal ; à date égale, le journal que le système range le premier passe d'abord. Une preuve ne garde que sa nature et sa référence : tout autre champ, comme un extrait, reste dans l'instance.

### 6.1 Générateur : champ d'observation `skill-ticket.observation/1`

| Enregistrement source | `type` | `ordre`, `niveau` | `nature` | `motif` | `sujet` |
|---|---|---|---|---|---|
| `observation`, ordre 1, `conforme` | `observation` | `OC1`, `N1` | `conforme` | le motif de l'enregistrement, sinon `conforme` | `agent:generateur-skill-ticket` |
| `observation`, ordre 1, `ecart` | `ecart` | `OC1`, `N1` | `ecart` | le motif de l'enregistrement, sinon `ecart` | `agent:generateur-skill-ticket` |
| `observation`, ordre 2 | `proposition`, ou `observation` pour `conforme` | `OC2`, `N2` | le verdict | le motif de l'enregistrement | `observateur-N2` |
| `observation`, ordre 3 | `observation` | `OC2`, `N3` | le verdict : `fondee`, `infondee`, `veille`, `bilan` | le motif examiné, sinon le verdict | `observateur-N3` |
| `retour`, `correction` | `observation` | `OC1`, `humain` | `correction` | le motif de la correction | `developpeur` |
| `retour`, `choix` | `decision` | `OC2`, `humain` sur une proposition d'ordre 2, sinon `OC1`, `humain` | `choix` | le motif de la proposition visée, sinon `choix` | `developpeur` |
| `retour`, `ratification` | `decision` | `OC1`, `humain` | `ratification` | `ratifie`, ou `non-ratifie` | `developpeur` |
| `ecart` | `ecart` | `OC1`, `N1` | `desaccord` pour un désaccord entre nœuds, sinon `ecart` | `desaccord-entre-noeuds`, sinon `ecart-invariant-projet` | `agent:generateur-skill-ticket` |

- Un projet a un champ par ticket : chaque enveloppe du champ porte `source.journal`, l'empreinte salée de la clé du ticket, le nom de son dossier sous `docs/demandes/`, même quand le projet n'a encore qu'un ticket.
- Un enregistrement `action` n'est pas traduit : c'est un travail, non une observation.
- `ancre` reprend l'ancre de l'enregistrement ; un retour qui vise une action, correction ou choix entre ses options, prend celle de l'action. `preuve` reprend sa preuve.
- `decision` porte la décision d'un choix sur une proposition d'ordre 2 : `retenue` ou `refusee`, et le numéro de l'enveloppe de la proposition.
- `profondeur` se déduit de l'ancre, selon la règle du module `apprentissage` du générateur : critère et critère d'acceptation en `macro`, contrat et option en `meso-contrats`, nœud et scénario en `meso-composants`, fichier et commit en `micro`.
- Un désaccord entre nœuds porte `invariant` : `orchestrateur-c7e:D6.INV-3`.
- `cible` vaut `instance`.

### 6.2 Générateur : registre d'apprentissage `generateur.apprentissage/1`

| Enregistrement source | `type` | `ordre`, `niveau` | `nature` | `motif`, `profondeur` | `cible` | `sujet` |
|---|---|---|---|---|---|---|
| `releve` | `observation` | `OC2`, `N2` | la nature de l'entrée (`possibilite-inconnue`, `categorie-inadaptee`…) | ceux de l'entrée | `specification` pour la cible `generateur`, `instance` pour `referentiel` | `agent:generateur-skill-ticket` |
| `proposition` | `proposition` | `OC2`, `N2` | `recurrence` | ceux de la proposition | comme ci-dessus | `agent:generateur-skill-ticket` |
| `decision` | `decision` | `OC2`, `humain` | `decision` | ceux de la proposition visée | celle de la proposition visée | `developpeur` |

Le registre est le seul journal de son format dans une instance : ses enveloppes n'ont pas de `source.journal`. L'ancre d'un relevé est le ticket (`ticket`) ; sa preuve garde sa nature (`fichier`, `champ`, `commit`, `commande`, `arbre`). Une proposition porte en preuve les numéros des relevés qui la fondent (`enregistrements`) ; une décision porte `decision`, avec le numéro de l'enveloppe de la proposition visée. La raison d'une décision et le nom de qui l'a prise restent dans le registre.

### 6.3 Orchestrateur : registre des concepts `docs/c7e/concepts.json`

Le registre est un fichier, non un journal : ses événements se constatent entre deux versions commitées du fichier.

| Événement | `type` | `ordre`, `niveau` | `nature` | `motif` | `sujet` |
|---|---|---|---|---|---|
| entrée ajoutée au statut `proposed` | `proposition` | `OC2`, `N2` si elle cite l'observation qui la fonde, sinon `OC2`, `humain` | `proposed` | `concept-` suivi du domaine de l'identifiant, en minuscules et tirets | `agent:orchestrateur-c7e`, ou `developpeur` |
| promotion à `experimental` ou à `validated` | `decision` | `OC2`, `humain` | le nouveau statut | celui de l'entrée | `referent` |
| retrait d'une entrée | `decision` | `OC2`, `humain` | `retire` | celui de l'entrée | `referent` |

L'ancre est le concept (`concept`) : en clair pour un concept du registre de départ, par son empreinte salée pour les autres. Une promotion porte `decision` avec la valeur `retenue`, un retrait avec la valeur `refusee`. `cible` vaut `instance`.

### 6.4 Orchestrateur : registre des écarts `docs/c7e/registre-ecarts.md`

| Ligne source | `type` | `ordre`, `niveau` | `nature` | `motif` | `sujet` |
|---|---|---|---|---|---|
| décision « respecter » | `ecart` | `OC1`, `N1` | `respecter` | `ecart-` suivi de l'invariant concerné en minuscules et tirets, sinon `ecart-invariant-projet` | `agent:orchestrateur-c7e` |
| dérogation validée par un nom | `derogation` | `OC1`, `humain` | `derogation` | comme ci-dessus | `referent` |

L'ancre est le ticket (`ticket`). `invariant` porte l'invariant concerné quand c'est un invariant d'une spécification du dépôt, préfixé par son nom ; un invariant du projet reste dans l'instance. Le nom qui valide une dérogation n'en sort pas. `cible` vaut `instance`.

### 6.5 Binôme : rubriques `acceptable` de `agent2dev.livrable/1` et `agent2test.journal-de-tests/1`

Le binôme n'a pas d'outil dans le dépôt, qui tient sa spécification et ses formats, pas son code : l'outil d'export du binôme, que porte l'observatoire (`observatoire`, module `export-binome`), traduit pour lui la rubrique `acceptable` d'un livrable d'Agent2Dev ou d'un journal de tests d'Agent2Test que le développeur lui désigne. Chaque refus de la rubrique est un enregistrement, et chaque réponse à un refus en est un autre.

| Enregistrement source | `type` | `ordre`, `niveau` | `nature` | `motif` | `sujet` | `decision` |
|---|---|---|---|---|---|---|
| refus | `refus` | `OC1`, `N1` | la garde : `perimetre`, `ecriture`, `commandes`, `lecons` | `refus-` suivi de la garde | `agent:agent2dev`, ou `agent:agent2test` | — |
| réponse `deroger` | `derogation` | `OC1`, `humain` | `derogation` | celui du refus visé | le rôle qui répond | `amendee`, et le numéro de l'enveloppe du refus |
| réponse `faux-refus` | `decision` | `OC1`, `humain` | `faux-refus` | celui du refus visé | le rôle qui répond | `refusee`, et le numéro de l'enveloppe du refus |

- `systeme` est le système qui a produit l'enregistrement, `agent2dev` ou `agent2test`, à la version de spécification que porte la source (`versions.specification`) : l'outil de l'observatoire exporte pour lui, sans se substituer à lui.
- `date` est celle que la rubrique porte pour le refus ou pour la réponse, l'horodatage de sa ligne de journal à la seconde, bornée par la ligne précédente du journal d'enveloppes comme partout.
- Un projet a un livrable par demande, et un journal de tests par campagne : chaque enveloppe porte `source.journal`, l'empreinte salée de la clé de la demande pour un livrable, de l'identifiant de la campagne pour un journal de tests ; `source.numero` est le numéro `n` de l'enregistrement, celui de sa ligne dans le journal du système. Les enregistrements d'une même source s'exportent dans l'ordre de leur numéro ; plusieurs sources d'un même système se fusionnent par date, et, à date égale, celle dont la clé vient la première dans l'ordre des points de code passe d'abord.
- `ancre` est la demande (`ticket`), par l'empreinte salée de sa clé, `demande.cle`.
- `invariant` est la première règle que cite le refus, celle du noyau quand il en cite une, préfixée par la spécification qui la définit : `SA` par `socle-acceptable`, `D` par le système qui refuse, `SC` par `socle-back-front`, `SO` par `socle-observation` ; une règle déjà préfixée garde son préfixe. Une réponse porte l'invariant de son refus.
- `cible` vaut `specification` : un refus éprouve une règle du dépôt.
- Le rôle qui répond est le sujet : `developpeur` ou `referent` pour Agent2Dev ; `testeur`, ou `referent` pour le référent qualité, pour Agent2Test.
- Une dérogation porte `decision` avec la valeur `amendee` : le refus reste fondé, et l'action passe une fois ; un faux refus, avec la valeur `refusee` : le refus est déclaré infondé, et l'action reste refusée.
- L'objet refusé ne sort pas : la règle le désigne, et un objet propre à une constitution est une référence de l'instance. Le motif d'une réponse, et le nom de qui l'a donnée, restent dans le journal du système.
- Les enveloppes s'écrivent dans le projet de l'application, un journal par système, `docs/c7e/observations-agent2dev.jsonl` et `docs/c7e/observations-agent2test.jsonl`, sous le sel de son instance : les refus d'Agent2Test, écrits dans son propre projet, relèvent de l'instance de l'application qu'il teste.
- Une réponse s'exporte quand elle paraît dans la rubrique : un refus exporté sans réponse garde son enveloppe, et celle de sa réponse s'ajoute plus tard.

### 6.6 Binôme : rubriques `kits` de `agent2dev.livrable/1` et `agent2test.journal-de-tests/1`

L'outil d'export du binôme traduit de même la rubrique `kits` (socle de l'acceptable, section 11 ; `agent2dev` et `agent2test`, module `kit`). Chaque étape d'un kit est un enregistrement, à sa ligne de journal : la remise, la validation, l'application, ou son échec, et le retour arrière.

| Enregistrement source | `type` | `ordre`, `niveau` | `nature` | `motif` | `sujet` | `decision` |
|---|---|---|---|---|---|---|
| remise | `observation` | `OC1`, `N1` | `remis` | `kit-` suivi de l'environnement | `agent:agent2dev`, ou `agent:agent2test` | — |
| validation | `decision` | `OC1`, `humain` | `validation` | celui de la remise | le rôle qui valide | `retenue`, et le numéro de l'enveloppe de la remise |
| application | `observation` | `OC1`, `humain` | `applique`, ou `echec` | celui de la remise | le rôle qui déclare | — |
| retour arrière | `observation` | `OC1`, `humain` | `retour-arriere` | celui de la remise | le rôle qui déclare | — |

- `motif` : `kit-dev` pour un kit dev, `kit-test` pour un kit test ; le même pour chaque étape d'un kit.
- `ancre` est le kit : `{ "nature": "kit", "ref": … }`, l'empreinte salée de l'empreinte de son patch ; elle relie les étapes d'un même kit d'une enveloppe à l'autre.
- `systeme`, `date` et `source` suivent la section 6.5 : chaque étape porte le numéro `n` et la date de sa ligne de journal ; les refus et les étapes d'une même source s'exportent ensemble, dans l'ordre de leur numéro.
- `cible` vaut `instance`, et aucune enveloppe de kit ne porte d'`invariant` : une application n'éprouve aucune règle ; un kit refusé à sa confrontation n'est pas remis, et son refus passe par la rubrique `acceptable`.
- Un échec, déclaré « échec, retour arrière fait », est un seul enregistrement, de nature `echec` : le retour arrière que la fabrication a fait y est compris, et ne fait pas d'autre enveloppe.
- Le sujet est le rôle que porte la rubrique : `developpeur` pour Agent2Dev ; `testeur` ou `developpeur` pour Agent2Test.
- Ni le scénario, ni la campagne, ni l'empreinte du patch, ni le commentaire d'un échec ne sortent en clair : l'ancre et `source.journal` les désignent par leur empreinte salée.
- Une étape s'exporte quand elle paraît dans la rubrique : une remise exportée sans validation garde son enveloppe, et celles des étapes suivantes s'ajoutent plus tard ; une étape exportée ne change plus.

### 6.7 Invariants

- **SO4.INV-1** : une correspondance traduit un format source sans le modifier : il garde ses champs, sa version et son emplacement, et chaque enveloppe désigne sans ambiguïté l'enregistrement dont elle provient, par son format, son numéro et, pour un format qui tient plusieurs journaux dans une instance, son journal. Contrôle : test de l'export, qui compare les sources avant et après, sur une instance à deux journaux du même format.
- **SO4.INV-2** : la même entrée source, avec le même sel d'instance, donne la même enveloppe, octet pour octet. Contrôle : test de l'export rejoué deux fois sur les exemples du système.

## 7. Règles d'évolution du socle

- Le socle suit le contrat de version d'`EVOLUTION.md` à la racine du dépôt.
- Tant que sa dimension d'export est réservée, un système référence le socle dans son `manifest.json` (champ `references`) ; quand elle devient active, il l'épingle en plus (champ `shared`), et l'outil d'assemblage l'inclut dans sa transmission.
- La correspondance d'un nouveau format ou d'un nouveau système, ou une valeur ajoutée à une liste fermée, fait une version mineure. Un champ requis ajouté, une valeur retirée ou une règle de minimisation relâchée font une version majeure ; chaque système dépendant décide alors explicitement de monter.
- Une règle de minimisation ne se relâche jamais pour faciliter un export : elle ne peut que se renforcer.

## 8. Journal de révision

**1.0.0** (2026-11-24) : première version, jalon J1 du passage au troisième ordre (`EVOLUTION.md`, section 10). Dimensions SO1 à SO4 actives : enveloppe `socle-observation.enveloppe/1` au schéma fermé, ordres et niveaux, journal en ajout seul et chaîné, minimisation par sel d'instance et empreintes salées, correspondances avec le champ et le registre d'apprentissage du générateur, le registre des concepts et le registre des écarts de l'orchestrateur. Invariants SO1.INV-1 à SO4.INV-2. Référencé par `orchestrateur-c7e` 3.6.0 et `generateur-skill-ticket` 1.2.0, à des dimensions réservées : aucun système ne l'applique encore. Décisions ratifiées avant la rédaction : spécification non transmissible (R4) ; préfixe `SO`, enveloppe sans texte libre, référence sans inclusion tant que les dimensions sont réservées (P1 à P3).

**1.1.0** (2026-11-24) : jalon J1b, export du générateur activé. Lacune corrigée : un projet a un champ d'observation par ticket, numéroté à partir de 1 dans chacun ; le format et le numéro ne désignaient donc pas un enregistrement unique. Champ facultatif `source.journal`, empreinte salée de la clé du journal source, présent pour un format qui tient plusieurs journaux dans une instance ; SO4.INV-1 renforcé : l'enveloppe désigne sans ambiguïté l'enregistrement dont elle provient. Précisions : forme du sel dans les empreintes ; tête du journal, qui relève une dernière ligne réécrite ou supprimée, comme celle du champ du générateur ; date d'une enveloppe et fusion des journaux sources à l'export ; liste de numéros sans espace ; une preuve ne garde que sa nature et sa référence ; motif d'une ratification (`ratifie`, `non-ratifie`) ; ancre d'un retour sur une action ; journal d'une enveloppe du champ ; preuve d'une proposition et décision du registre d'apprentissage. Inclus par `generateur-skill-ticket` 1.3.0, dont la dimension D9 devient active ; référencé par `orchestrateur-c7e` 3.6.1, dont la dimension D12 reste réservée. Décision ratifiée avant la rédaction : `source.journal` facultatif, version mineure (Q1). Archive : `archives/SKILL-v1.0.0.md`.

**1.2.0** (2026-11-25) : jalon J3c du passage au troisième ordre (`EVOLUTION.md`, section 10), export des refus du binôme. Correspondance nouvelle, section 6.5 : la rubrique `acceptable` des livrables d'Agent2Dev (`agent2dev.livrable/1`) et des journaux de tests d'Agent2Test (`agent2test.journal-de-tests/1`) ; un refus devient une enveloppe `refus`, une dérogation une enveloppe `derogation`, un faux refus une décision, qui visent l'enveloppe du refus, avec les valeurs `amendee` et `refusee` ; l'invariant cité sort préfixé, dont le préfixe `SA` du socle de l'acceptable ; aucune enveloppe ne porte l'objet refusé ni le motif d'une réponse. Le type `refus` est produit ; `decision.vise` désigne aussi le refus auquel une réponse répond ; valeur ajoutée au sujet, `testeur`. Dimension SO4 étendue au binôme ; invariants inchangés, leur section devenue 6.6. Précisions : la date d'un refus ou d'une réponse est celle de sa rubrique ; les systèmes qui incluent le socle, et depuis quelle version ses invariants y sont en vigueur. Inclus par `generateur-skill-ticket` 1.4.2, `orchestrateur-c7e` 3.8.2 et `observatoire` 1.2.0, dont l'outil d'export du binôme applique la correspondance. Décisions ratifiées avant la rédaction : plan du jalon J3c, X1 à X3 et X5. Archive : `archives/SKILL-v1.1.0.md`.

**1.3.0** (2026-11-25) : jalon J3e du passage au troisième ordre (`EVOLUTION.md`, section 10), export des kits du binôme. Correspondance nouvelle, section 6.6 : la rubrique `kits` des livrables d'Agent2Dev et des journaux de tests d'Agent2Test ; la remise, la validation, l'application ou son échec, et le retour arrière d'un kit font chacun une enveloppe, motif `kit-dev` ou `kit-test`, reliées par l'ancre de nature `kit`, valeur ajoutée à sa liste fermée ; la validation vise l'enveloppe de la remise, valeur `retenue` ; un échec, une seule enveloppe ; aucun invariant, `cible` `instance`. Invariants inchangés, leur section devenue 6.7. Décisions ratifiées avant la rédaction : plan du jalon J3e, Y1 à Y3.
<<<FIN socle-observation/SKILL.md>>>

<<<FICHIER modules/export-binome/SKILL.md>>>
---
name: export-binome
description: Export des refus et des kits du binôme Agent2Dev et Agent2Test vers le socle d'observation (outil export-binome.mjs, lancé depuis le clone ; rubriques acceptable et kits d'un livrable ou d'un journal de tests traduites selon les correspondances du socle, une enveloppe par refus, par réponse et par étape d'un kit, datée par la rubrique ; un journal par système dans le projet de l'application, chaîné, sous le sel de l'instance ; rubrique réécrite refusée ; rien dans le magasin). À lire pour exporter les refus d'une demande ou d'une campagne.
dimensions: [D7]
status: active
---

# Module `export-binome` (D7)

Agent2Dev et Agent2Test se construisent hors du dépôt, qui tient leurs spécifications et leurs formats, pas leur code : sans outil de référence, leurs refus et leurs kits ne sortiraient pas de leurs instances. L'observatoire porte cet outil. Il agit à la source, pour le binôme, comme l'export du générateur ou de l'orchestrateur pour le leur, et reste à part du magasin. Cette dimension régule, au premier ordre, ce qui sort d'une instance pour le binôme : rien que des enveloppes minimisées.

## 1. Commandes

Depuis le clone, avec Node 20 ou plus récent :

```text
node specs/observatoire/outils/export-binome.mjs exporter --projet <application> <fichier>...
node specs/observatoire/outils/export-binome.mjs verifier --projet <application>
node specs/observatoire/outils/export-binome.mjs etat --projet <application> [--json]
```

- `<application>` : la racine du projet de l'application, dépôt Git ; sans `--projet`, le dossier courant.
- `<fichier>` : le livrable d'une demande d'Agent2Dev, `<sortie>/<CLÉ>/livrable.json`, ou le journal de tests d'une campagne d'Agent2Test, `rapports/<campagne>/journal-de-tests.json` dans le projet Agent2Test ; son format dit son système.
- L'IA de l'observatoire ne lance pas l'outil : elle en donne la commande au développeur.

## 2. Traduction

- Chaque refus de la rubrique `acceptable`, et chaque réponse à un refus, devient une enveloppe, selon la correspondance du socle d'observation, section 6.5 : `refus` pour un refus, `derogation` pour une dérogation, `decision` de valeur `refusee` pour un faux refus ; une réponse vise l'enveloppe de son refus, avec la valeur `amendee` pour une dérogation (D7.INV-1).
- L'enveloppe porte le nom et la version du système qui a produit l'enregistrement, lus dans la source, et sa date, lue dans la rubrique : l'outil n'y met rien de lui.
- La règle citée en premier, celle du noyau quand le refus en cite une, devient l'invariant, préfixé par la spécification qui la définit : `socle-acceptable:SA2.INV-1`, `agent2dev:D1.INV-5`.
- Chaque étape d'un kit de la rubrique `kits` devient une enveloppe, selon la correspondance du socle d'observation, section 6.6 : la remise, une observation de nature `remis`, au nom du système ; la validation, une décision de nature `validation` et de valeur `retenue`, qui vise l'enveloppe de la remise ; l'application, une observation de nature `applique` ou `echec` ; le retour arrière, une observation de nature `retour-arriere`. Le motif est `kit-dev` ou `kit-test`, l'ancre le kit, par l'empreinte salée de l'empreinte de son patch ; ni invariant, ni cible de spécification (D7.INV-1).
- Un échec, déclaré avec son retour arrière, ne remplit que l'application : il fait une seule enveloppe. Un kit ne s'applique qu'après sa validation, et seul un kit appliqué se défait ensuite : une rubrique qui dit autre chose est refusée, comme une étape antérieure à la précédente, par son numéro ou par sa date, un environnement qui n'est pas celui du système, `dev` pour Agent2Dev et `test` pour Agent2Test, ou un rôle hors de ceux qui valident ou déclarent : `developpeur` pour Agent2Dev, `testeur` ou `developpeur` pour Agent2Test.
- Les refus, les réponses et les étapes des kits d'une même source s'exportent ensemble, dans l'ordre de leur numéro, chacun celui de sa ligne de journal, qu'aucun n'en partage.
- Les fichiers désignés ne sont que lus. Une source sans rubrique, qu'aucun refus ni aucun kit n'a touchée, n'exporte rien.

## 3. Journaux et sel

- Un journal par système, dans le projet de l'application : `docs/c7e/observations-agent2dev.jsonl` et `docs/c7e/observations-agent2test.jsonl`, chacun avec sa tête, en ajout seul, chaque ligne chaînée à la précédente (D7.INV-2). Les refus d'Agent2Test relèvent de l'instance de l'application testée, non du projet Agent2Test.
- Le sel est celui de l'instance, que partagent les systèmes du projet, dans `<git-common-dir>/agent2prompt/sel`. L'outil le tire, en mode 0600, quand aucun journal d'enveloppes n'existe encore dans le projet ; s'il en existe un, il refuse de tirer un nouveau sel, qui changerait l'identité de l'instance, et un sel étranger à l'un des journaux arrête l'export.
- Un enregistrement déjà exporté ne l'est pas deux fois. Une réponse qui paraît dans la rubrique après l'export de son refus s'ajoute, et vise l'enveloppe de son refus ; une étape d'un kit qui paraît après l'export des précédentes s'ajoute, et une validation vise l'enveloppe de sa remise.
- Les sources d'un système se fusionnent par date, chacune dans l'ordre de ses numéros ; à date égale, la clé de demande ou de campagne qui vient la première passe d'abord. Une date antérieure à la dernière ligne prend la date de celle-ci.
- Tout ou rien : un journal altéré, une source illisible ou mal formée, deux sources de même demande ou de même campagne, une rubrique qui change ou retire un enregistrement exporté, un sel absent alors qu'un journal existe, une enveloppe mal formée arrêtent l'export, et rien n'est écrit.

## 4. Ce qui ne sort pas

L'objet refusé, le motif d'une réponse, le commentaire d'un échec, le scénario d'un kit et le nom de qui a répondu ou déclaré restent dans le journal du système ; la demande, la campagne et l'empreinte du patch d'un kit ne sortent que par leur empreinte salée, la règle préfixée par la spécification qui la définit, le rôle par son nom dans le socle : `developpeur`, `referent` ou `testeur` (D7.INV-3). L'outil n'écrit rien dans le magasin de l'observatoire, et ne lit, outre les fichiers désignés, que le sel et les journaux d'enveloppes du projet ; le sel ne s'affiche jamais.

## 5. Recette

| Invariant | Tests |
|---|---|
| D7.INV-1 | `tests/export-binome.test.mjs` : « D7 : la rubrique acceptable d'un livrable et d'un journal de tests devient des enveloppes conformes au socle, datées par la rubrique, au nom et à la version du système, sans rien modifier des sources » ; « D7 : la rubrique kits devient des enveloppes : remise, validation qui vise la remise, application ou échec, retour arrière, reliées par l'ancre du kit ; un échec, une seule enveloppe ; refus et étapes d'une même source dans l'ordre de leur numéro » ; « D7 : l'export écrit un journal par système, en ajout seul et chaîné, sous le sel de l'instance ; une réponse venue plus tard s'ajoute et vise son refus ; une rubrique réécrite, un journal altéré ou un sel étranger arrêtent l'export sans rien écrire » |
| D7.INV-2 | `tests/export-binome.test.mjs` : « D7 : la rubrique kits devient des enveloppes : remise, validation qui vise la remise, application ou échec, retour arrière, reliées par l'ancre du kit ; un échec, une seule enveloppe ; refus et étapes d'une même source dans l'ordre de leur numéro » ; « D7 : l'export écrit un journal par système, en ajout seul et chaîné, sous le sel de l'instance ; une réponse venue plus tard s'ajoute et vise son refus ; une rubrique réécrite, un journal altéré ou un sel étranger arrêtent l'export sans rien écrire » ; « D7 : aucune enveloppe ne porte l'objet refusé, le motif d'une réponse, la clé d'une demande ni le nom d'une personne ; l'outil n'écrit rien dans le magasin de l'observatoire, et le sel ne s'affiche pas » |
| D7.INV-3 | `tests/export-binome.test.mjs` : « D7 : aucune enveloppe ne porte l'objet refusé, le motif d'une réponse, la clé d'une demande ni le nom d'une personne ; l'outil n'écrit rien dans le magasin de l'observatoire, et le sel ne s'affiche pas » ; « D7 : la rubrique acceptable d'un livrable et d'un journal de tests devient des enveloppes conformes au socle, datées par la rubrique, au nom et à la version du système, sans rien modifier des sources » |
<<<FIN modules/export-binome/SKILL.md>>>

<<<FICHIER modules/releve/SKILL.md>>>
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
<<<FIN modules/releve/SKILL.md>>>

<<<FICHIER modules/confrontation/SKILL.md>>>
---
name: confrontation
description: Confrontation des instances entre elles (signaux, motifs génériques écartés, récurrence d'un même motif à la même profondeur dans au moins deux instances, retour d'une proposition retenue qui vise une spécification, dès une instance). À lire pour comprendre ce que l'observatoire tient pour un candidat à proposer.
dimensions: [D2]
status: active
---

# Module `confrontation` (D2)

Aucun système ne se juge seul (`EVOLUTION.md`, section 10.3) : ce qu'une instance relève prend un autre poids quand une autre instance le relève aussi, et ce qu'une instance a décidé pour la spécification doit pouvoir remonter jusqu'au dépôt. La confrontation tire des enveloppes de toutes les instances deux sortes de candidats, pour un même système ; la confrontation entre systèmes, par les invariants du dépôt, en ajoute une troisième (module `systemes`), et celle de l'acceptable, par les règles que citent les refus, une quatrième (module `acceptable`).

## 1. Signaux

Une enveloppe est un signal quand elle dit un écart, une correction, une proposition ou une observation d'apprentissage : son type n'est pas `decision`, sa nature n'est pas un verdict neutre (`conforme`, `fondee`, `infondee`, `bilan`), son motif n'est pas générique, et elle porte une profondeur. Les motifs génériques sont ceux que les correspondances du socle donnent faute de motif propre : `conforme`, `ecart`, `correction`, `choix`, `proposition`, `ratifie`, `non-ratifie`, `fondee`, `infondee`, `veille`, `bilan`, `ecart-invariant-projet`. Ils se répètent partout, et ne disent rien d'une instance à l'autre.

## 2. Récurrence

Une récurrence est un même motif, à la même profondeur, pour un même système, relevé par des signaux d'au moins deux instances distinctes (D2.INV-1). Les instances se comptent par leur empreinte, non par leurs projets : un projet copié ne fait pas une deuxième instance. Un motif relevé dans une seule instance reste à celle-ci, où son propre apprentissage le traite.

## 3. Retour

Un retour est une proposition d'une instance, de type `proposition` et de cible `specification`, qu'une décision humaine de la même instance a retenue ou amendée (D2.INV-2) : pour le générateur, une proposition du registre d'apprentissage qui vise ses consignes, décidée par son développeur. Il remonte dès une instance : c'est le canal qui manquait au retour de l'instance vers le dépôt. Une proposition refusée par l'instance, ou dont la cible est l'instance, ne remonte pas. La décision vise une enveloppe du journal de son propre système : chaque système tient son journal, où les numéros recommencent à 1, et la décision d'un système ne retient jamais la proposition d'un autre.

## 4. Candidats

Un candidat est identifié par son système, son motif et sa profondeur : un retour et une récurrence de même clé font un seul candidat, de sorte `retour`. Il porte les versions du système qu'il a vues, le nombre d'instances, le nombre d'enveloppes et leurs références tronquées, les huit premiers caractères de l'instance et le numéro de l'enveloppe : de quoi retrouver les enveloppes dans le magasin, et rien de plus. `confronter` les liste, avant les candidats par invariant du module `systemes` ; `proposer` les écrit. Les enveloppes de l'orchestrateur ne portent pas de profondeur : elles ne font ni retour ni récurrence, et ne se confrontent que par les invariants que citent ses écarts. Celles du binôme non plus : un refus, une dérogation ou un faux refus se confrontent par la règle qu'ils citent (module `acceptable`).

## 5. Recette

| Invariant | Tests |
|---|---|
| D2.INV-1 | `tests/observatoire.test.mjs` : « D2 : une récurrence compte des instances distinctes : un même motif, à la même profondeur, pour un même système, dans au moins deux instances » ; « D1 : une enveloppe d'un système ou d'une version inconnus du dépôt est écartée de toute confrontation et signalée » ; « Ligne de commande : codes de sortie ; le magasin d'épreuve seul est écrit » |
| D2.INV-2 | `tests/observatoire.test.mjs` : « D2 : un retour remonte dès une instance : une proposition qui vise la spécification, retenue par le développeur de l'instance » ; « D2 : une récurrence compte des instances distinctes : un même motif, à la même profondeur, pour un même système, dans au moins deux instances » ; « D2 : une décision vise une enveloppe du journal de son propre système : la décision d'un système ne retient pas la proposition d'un autre » |
<<<FIN modules/confrontation/SKILL.md>>>

<<<FICHIER modules/systemes/SKILL.md>>>
---
name: systemes
description: Confrontation entre systèmes (un même invariant du dépôt, cité par des écarts ou des dérogations de deux systèmes ou de deux instances, proposé à la spécification qui le définit ; un même écart compté une fois, désigné par son instance et son ticket ; une réponse à un refus n'est pas un écart ; références qui nomment le système de chaque enveloppe). À lire pour comprendre ce que l'observatoire confronte d'un système à l'autre.
dimensions: [D6]
status: active
---

# Module `systemes` (D6)

Deux systèmes ne parlent pas la même langue : le générateur de skills de ticket relève ses motifs dans le champ de ses arbres, l'orchestrateur C7E dans ses registres, et un motif de l'un n'a pas d'équivalent chez l'autre. Mais leurs écarts citent les mêmes invariants : un désaccord entre nœuds du générateur porte l'invariant `orchestrateur-c7e:D6.INV-3`, et une ligne du registre des écarts de l'orchestrateur porte l'invariant qu'elle concerne, quand le dépôt le définit. C'est par eux que l'observatoire confronte les systèmes : ce qui fait de lui un milieu entre systèmes, et non seulement entre instances d'un même système (`EVOLUTION.md`, section 10.3).

## 1. Écarts

- Une enveloppe compte quand elle est un écart ou une dérogation, de type `ecart` ou `derogation`, et qu'elle porte un invariant que le dépôt définit : un invariant `**Dn.INV-k**`, `**SCn.INV-k**`, `**SOn.INV-k**` ou `**SAn.INV-k**` du point d'entrée d'une de ses spécifications, préfixé par le nom de celle-ci, d'un système ou d'une version que le dépôt connaît (module `releve`). Un invariant que le dépôt ne définit pas, venu d'un système plus récent que le clone, ne fait pas de candidat (D6.INV-1). Une réponse à un refus, dérogation ou faux refus du binôme, qui vise l'enveloppe de son refus, n'est pas un écart : les refus et leurs réponses se confrontent par la règle qu'ils citent (module `acceptable`).
- Un écart se désigne par son instance et son ticket : l'ancre de l'enveloppe quand c'est un ticket, comme pour une ligne du registre des écarts de l'orchestrateur ; sinon son journal source, qui pour le champ d'observation du générateur est le ticket, par l'empreinte salée de sa clé. Les deux systèmes d'une instance partagent son sel : le même ticket a la même empreinte dans leurs deux journaux.
- Le même écart peut donc venir de deux systèmes : le générateur le constate dans le champ, l'orchestrateur exporte la ligne où le développeur l'a décidé. Il ne compte qu'une fois. Une enveloppe sans ticket désigne son propre écart, par sa source.

## 2. Candidat par invariant

Un invariant fait un candidat, de sorte `invariant`, quand ses écarts distincts sont au moins deux et viennent de deux instances, ou de deux systèmes (D6.INV-1). Un système seul, dans une seule instance, n'en fait pas, même sur plusieurs tickets : c'est l'affaire de son propre registre.

Le candidat va à la spécification qui définit l'invariant, celle de son préfixe, à sa version courante dans le dépôt : c'est sa règle qui est en cause, quel que soit le système qui l'a vue manquer (D6.INV-2). Il porte :

- `systeme` : la spécification qui définit l'invariant ; `versions` : sa version courante ;
- `motif` : `ecart-` suivi de l'invariant, en minuscules et tirets (`ecart-orchestrateur-c7e-d6-inv-3`) ; aucune profondeur ;
- `invariant` et `systemes` : l'invariant, et les systèmes dont les écarts le citent ;
- le nombre d'instances, d'écarts distincts et d'enveloppes ;
- les références tronquées de ses enveloppes, `<8 caractères de l'instance>:<système>:<numéro>` : chaque système tient son journal, où les numéros recommencent à 1, et le système dit dans quel miroir chercher.

`confronter` liste ces candidats après les retours et les récurrences ; `proposer` les écrit comme les autres (module `propositions`). Un candidat par invariant ne se confond avec aucun retour ni aucune récurrence, même de même système et de même motif.

## 3. Effet

L'effet d'une proposition par invariant ratifiée se mesure comme celui des autres (module `suivi`), sur les enveloppes de la spécification qui définit l'invariant, quand elle exporte : le motif y est celui des écarts et des dérogations qui citent l'invariant. Une spécification qui n'exporte pas, comme un référentiel de la pile, laisse l'effet indécidable : il faut alors lire les écarts des systèmes qui l'appliquent.

## 4. Recette

| Invariant | Tests |
|---|---|
| D6.INV-1 | `tests/observatoire.test.mjs` : « D6 : un même invariant du dépôt, relevé par des écarts distincts de deux systèmes, ou dans deux instances, est un candidat ; un même écart ne compte qu'une fois » ; « D1 : les journaux de chaque système d'une instance se relèvent, chacun dans son miroir ; une instance aux journaux de sels différents n'est pas inscrite » ; « D8 : les refus se confrontent par règle : refus, dérogations et faux refus comptés par système et par instance ; aucun ne fait de retour, de récurrence ni de candidat par invariant » |
| D6.INV-2 | `tests/observatoire.test.mjs` : « D6 : un candidat par invariant se propose à la spécification qui le définit, avec les systèmes qui l'ont relevé, et ses références nomment le système de chaque enveloppe » ; « D6 : un même invariant du dépôt, relevé par des écarts distincts de deux systèmes, ou dans deux instances, est un candidat ; un même écart ne compte qu'une fois » |
<<<FIN modules/systemes/SKILL.md>>>

<<<FICHIER modules/acceptable/SKILL.md>>>
---
name: acceptable
description: Confrontation de l'acceptable (refus, dérogations et faux refus du binôme comptés par règle, par système et par instance ; règle déclarée infondée par des faux refus dans au moins deux instances proposée, trop large, à la spécification qui la définit ; aucun refus ne fait de retour, de récurrence ni de candidat par invariant). À lire pour comprendre ce que l'observatoire tire des refus.
dimensions: [D8]
status: active
---

# Module `acceptable` (D8)

Le troisième couplage du troisième ordre lie les systèmes à leurs valeurs (`EVOLUTION.md`, section 10) : ce que chacun refuse vient du noyau du socle de l'acceptable, commun, et de sa constitution, propre, et chaque refus cite sa règle. Une règle trop large refuse ce qu'elle ne visait pas : celui qui la subit le déclare par un faux refus, mais seulement dans son instance, où l'action reste refusée. L'observatoire ferme cette boucle : il confronte les refus d'une instance à l'autre, par la règle qu'ils citent, et fait remonter jusqu'à la spécification qui la définit une règle que plusieurs instances déclarent infondée.

## 1. Enveloppes de l'acceptable

- Un refus est une enveloppe de type `refus`. Une réponse à un refus vise l'enveloppe de son refus (`decision.vise`) : une dérogation, de type `derogation`, ou un faux refus, de type `decision` et de valeur `refusee` (socle d'observation, section 6.5).
- Une décision vise une enveloppe du journal de son propre système, où les numéros recommencent à 1 ; une réponse compte sous la règle du refus qu'elle vise.
- Les enveloppes de l'acceptable n'ont pas de profondeur : elles ne font ni retour ni récurrence (module `confrontation`) ; une réponse à un refus n'est pas un écart, et ne compte pas parmi ceux d'un invariant (module `systemes`) (D8.INV-1).

## 2. Par règle

Pour chaque règle qu'un refus cite, `confronter` rend le nombre de refus, de dérogations et de faux refus, les systèmes qui les ont produits et le nombre d'instances où ils ont paru (D8.INV-1) : la fréquence de la règle, par système et par instance. Un refus sans faux refus, c'est la règle qui joue ; seule sa fréquence est rendue. Des dérogations répétées sur une règle propre déclarée dérogeable se lisent ici, sans faire de proposition.

## 3. Règle trop large

Une règle que le dépôt définit, déclarée infondée par des faux refus dans au moins deux instances distinctes, fait un candidat de sorte `faux-refus` : une règle trop large (D8.INV-2). Il va à la spécification qui définit la règle, celle de son préfixe, à sa version courante : le socle de l'acceptable pour une règle `SA`, Agent2Dev ou Agent2Test pour une règle de leur constitution. Il porte :

- `systeme` : la spécification qui définit la règle ; `versions` : sa version courante ;
- `motif` : `faux-refus-` suivi de la règle, en minuscules et tirets (`faux-refus-socle-acceptable-sa1-inv-1`) ; aucune profondeur ;
- `invariant` et `systemes` : la règle, et les systèmes dont les faux refus la citent ;
- le nombre d'instances et de faux refus, et les références tronquées des faux refus, `<8 caractères de l'instance>:<système>:<numéro>`.

Des faux refus d'une seule instance ne font que se compter : son référent les lit dans sa vue de gouvernance. `confronter` liste les candidats par faux refus après les autres ; `proposer` les écrit comme eux (module `propositions`).

La ratification décide de ce qui change, dans une version de la spécification visée et selon son contrat : une règle de sûreté ne s'affaiblit jamais, et aucune entrée du noyau ne se retire (`socle-acceptable:SA7.INV-2`). La réponse à une règle trop large est donc une précision de la règle, ou de l'entrée de constitution qui l'applique, un chemin par un kit, selon le contrat que le socle en décrit depuis sa version 1.1.0, ou le refus de la proposition. La révision du noyau par au moins deux sujets distincts attend la pluralité des sujets (point E2).

## 4. Effet

L'effet d'une proposition par faux refus ratifiée se mesure comme celui des autres (module `suivi`), sur les enveloppes de la spécification qui définit la règle : le motif y est celui des faux refus qui la citent. Le socle de l'acceptable n'exporte pas, et les enveloppes du binôme ne portent pas sa version : l'effet d'une proposition sur une règle du noyau reste indécidable, et se lit dans les faux refus du binôme, par règle.

## 5. Recette

| Invariant | Tests |
|---|---|
| D8.INV-1 | `tests/observatoire.test.mjs` : « D8 : les refus se confrontent par règle : refus, dérogations et faux refus comptés par système et par instance ; aucun ne fait de retour, de récurrence ni de candidat par invariant » ; « D2 : une décision vise une enveloppe du journal de son propre système : la décision d'un système ne retient pas la proposition d'un autre » ; « D8 : une règle déclarée infondée par des faux refus dans deux instances est proposée, trop large, à la spécification qui la définit ; des faux refus d'une seule instance ne font que se compter » |
| D8.INV-2 | `tests/observatoire.test.mjs` : « D8 : une règle déclarée infondée par des faux refus dans deux instances est proposée, trop large, à la spécification qui la définit ; des faux refus d'une seule instance ne font que se compter » ; « D8 : les refus se confrontent par règle : refus, dérogations et faux refus comptés par système et par instance ; aucun ne fait de retour, de récurrence ni de candidat par invariant » |
<<<FIN modules/acceptable/SKILL.md>>>

<<<FICHIER modules/kits/SKILL.md>>>
---
name: kits
description: Confrontation des kits du binôme (D9) : les étapes d'un kit, remise, validation, application ou échec, retour arrière, reconnues à l'ancre de leur kit ; comptées par système et par environnement, kits en attente d'application et kits test sans nettoyage déclaré compris, avec leurs instances ; aucun retour, aucune récurrence, aucun candidat. À lire pour lire les comptes des kits que rend confronter.
dimensions: [D9]
status: active
---

# Module `kits` (D9)

Le binôme remet des kits, qu'une fabrication de l'hôte applique après la validation d'un humain (socle de l'acceptable, section 11) : Agent2Dev le kit dev d'un scénario, Agent2Test le kit test d'une campagne. L'export du binôme en traduit chaque étape (module `export-binome` ; socle d'observation, section 6.6). Ce module dit ce que l'observatoire en fait : des comptes, sans proposition.

## 1. Enveloppes des kits

- Une enveloppe de kit porte l'ancre de nature `kit`, l'empreinte salée de l'empreinte de son patch, et le motif `kit-` suivi de l'environnement, `kit-dev` ou `kit-test`. Les étapes d'un même kit, d'un même système et d'une même instance, partagent cette ancre : la remise, de nature `remis` ; la validation, une décision de nature `validation` et de valeur `retenue`, qui vise la remise ; l'application, de nature `applique` ou `echec` ; le retour arrière, de nature `retour-arriere`.
- Sans profondeur ni invariant, et de cible `instance`, une enveloppe de kit ne fait ni retour ni récurrence (module `confrontation`), ni écart (module `systemes`), ni refus (module `acceptable`) ; une validation, qui vise une remise et non une proposition, ne retient rien (D9.INV-1).

## 2. Comptes

Pour chaque système et chaque environnement, `confronter` rend, dans sa rubrique `kits` :

| Compte | Ce qu'il compte |
|---|---|
| `remis` | les kits dont la remise a paru |
| `valides` | les kits validés |
| `appliques` | les kits appliqués, déclarés réussis |
| `echecs` | les kits en échec ; un échec comprend le retour arrière que la fabrication a fait |
| `retoursArriere` | les kits appliqués, puis défaits |
| `enAttente` | les kits validés, ni appliqués ni en échec |
| `nonNettoyes` | les kits test appliqués dont le nettoyage n'a pas été déclaré |
| `instances` | le nombre d'instances où ces kits ont paru |

Un kit se compte une fois, par son ancre, quel que soit le nombre de ses étapes (D9.INV-1). Un kit en attente, ou un kit test non nettoyé, peut n'être qu'en cours : les comptes disent où en est chaque instance, ils ne jugent pas.

## 3. Aucune proposition

Un kit ne cite aucune règle, et un échec n'a pas d'objet à proposer à une spécification : la confrontation des kits ne fait aucun candidat, et `proposer` n'écrit rien pour eux (plan du jalon J3e, décision Y2). Le référent lit les comptes, instance après instance. Une proposition sur les kits attendra des données réelles, quand le binôme sera construit, et une version de cette spécification.

## 4. Recette

| Invariant | Tests |
|---|---|
| D9.INV-1 | `tests/observatoire.test.mjs` : « D9 : les kits se comptent par système et par environnement, remis, validés, appliqués, en échec, défaits, en attente, sans nettoyage, avec leurs instances ; aucun ne fait de retour, de récurrence ni de candidat » ; `tests/export-binome.test.mjs` : « D7 : la rubrique kits devient des enveloppes : remise, validation qui vise la remise, application ou échec, retour arrière, reliées par l'ancre du kit ; un échec, une seule enveloppe ; refus et étapes d'une même source dans l'ordre de leur numéro » |
<<<FIN modules/kits/SKILL.md>>>

<<<FICHIER modules/etat/SKILL.md>>>
---
name: etat
description: État de l'écosystème vu par l'observatoire (pour chaque instance, chaque système qui exporte et sa dernière version, comparée à la version que le dépôt publie : à jour, en retard ou inconnue ; enveloppes écartées ; propositions par statut). À lire pour lire l'état de l'écosystème.
dimensions: [D3]
status: active
---

# Module `etat` (D3)

Le premier couplage du troisième ordre observe aussi l'état de l'écosystème lui-même : quelles versions des spécifications sont en usage, dans quelles instances (`EVOLUTION.md`, section 10.3). Les transmissions descendent du dépôt vers les projets ; l'état dit où elles sont arrivées.

## 1. Ce que dit `etat`

- Pour chaque instance : ses projets inscrits, le nombre de ses enveloppes et la date de la dernière.
- Pour chaque système qu'elle exporte, le générateur, l'orchestrateur, Agent2Dev et Agent2Test, chacun par son journal : les versions vues, la dernière, la version publiée par le dépôt, et l'écart : à jour, en retard, ou inconnue quand le dépôt n'a pas publié cette version (D3.INV-1).
- Le nombre d'enveloppes écartées, d'un système ou d'une version inconnus (module `releve`).
- Les propositions du dépôt, par statut : ouvertes, ratifiées, refusées.

Une instance en retard n'est pas une faute : c'est un fait de l'écosystème, que le développeur lit avant de confronter, car une récurrence vue sur une version ancienne peut être déjà traitée par une version publiée depuis.

## 2. Recette

| Invariant | Tests |
|---|---|
| D3.INV-1 | `tests/observatoire.test.mjs` : « D3 : chaque instance est comparée aux versions publiées des systèmes qu'elle exporte : à jour, en retard, ou inconnue » ; « D1 : une enveloppe d'un système ou d'une version inconnus du dépôt est écartée de toute confrontation et signalée » ; « Ligne de commande : codes de sortie ; le magasin d'épreuve seul est écrit » ; « D8 : les refus se confrontent par règle : refus, dérogations et faux refus comptés par système et par instance ; aucun ne fait de retour, de récurrence ni de candidat par invariant » |
<<<FIN modules/etat/SKILL.md>>>

<<<FICHIER modules/propositions/SKILL.md>>>
---
name: propositions
description: Propositions de l'observatoire au dépôt (format observatoire.proposition/1, en-tête minimisé, corps rédigé par le développeur, fichier dans observatoire/propositions/, pull request et ratification humaines, statut inscrit par la ratification, propositions jamais répétées). À lire pour écrire, relire ou ratifier une proposition.
dimensions: [D4]
status: active
---

# Module `propositions` (D4)

Une proposition est ce qui remonte d'un candidat jusqu'au dépôt : un fichier, apporté par une pull request que le développeur ouvre, et que la ratification décide. L'observatoire l'écrit ; il ne l'applique jamais (`EVOLUTION.md`, section 10.5, règle 4).

## 1. Fichier

`proposer` écrit une proposition par candidat nouveau dans `observatoire/propositions/`, à la racine du clone, sous le nom `AAAA-MM-JJ-<système>-<motif>-<profondeur>.md`, sans profondeur pour un candidat qui n'en a pas, comme un candidat par invariant ou par faux refus. Le développeur la relit, rédige sous « Ce qui change » la règle à changer et pourquoi, la commite et ouvre la pull request ; l'observatoire ne commite, ne pousse ni ne publie rien, et n'écrit dans le dépôt que ces fichiers (D4.INV-2).

## 2. En-tête

L'en-tête, entre deux lignes `---`, suit le format `observatoire.proposition/1`. Il ne porte que des valeurs minimisées (D4.INV-1) :

| Clé | Valeur |
|---|---|
| `format` | `observatoire.proposition/1` |
| `date` | le jour de la proposition, AAAA-MM-JJ |
| `systeme` | le nom de la spécification visée |
| `versions` | les versions du système vues dans les enveloppes, entre crochets ; pour une proposition par invariant ou par faux refus, la version courante de la spécification qui le définit |
| `sorte` | `retour`, `recurrence`, `invariant` ou `faux-refus` |
| `motif` | le motif, en minuscules et tirets ; pour une proposition par invariant, `ecart-` suivi de l'invariant ; par faux refus, `faux-refus-` suivi de la règle |
| `invariant` | pour une proposition par invariant ou par faux refus seulement : l'invariant du dépôt, préfixé par la spécification visée |
| `systemes` | pour une proposition par invariant ou par faux refus seulement : les systèmes dont les écarts, ou les faux refus, citent l'invariant, entre crochets |
| `profondeur` | `macro`, `meso-contrats`, `meso-composants` ou `micro` ; facultative, absente d'une proposition par invariant ou par faux refus |
| `instances`, `enveloppes` | des nombres |
| `references` | les références tronquées des enveloppes, `<8 caractères de l'instance>:<numéro>`, entre crochets ; pour une proposition par invariant ou par faux refus, `<8 caractères de l'instance>:<système>:<numéro>`, d'un système de `systemes` |
| `statut` | `ouverte`, `ratifiee` ou `refusee` |
| `version` | pour une proposition ratifiée seulement : la version du système qui la porte |
| `pr` | pour une proposition décidée : le numéro de la pull request qui l'a décidée |

Toute autre clé, toute valeur hors de ces formes, refusent la proposition. L'invariant et les systèmes sont des identifiants du dépôt, comme le système et le motif. Aucun texte, chemin, clé de ticket ni nom d'une instance n'entre dans l'en-tête ; le corps, rédigé par le développeur, n'en contient pas davantage.

## 3. Statut et répétition

- La pull request de ratification inscrit le statut dans l'en-tête : `statut: ratifiee`, avec `version` et `pr`, ou `statut: refusee`, avec `pr`. C'est ce statut que suit le module `suivi`.
- Une proposition ouverte ou ratifiée ne se répète pas ; une proposition refusée ne revient qu'avec une instance nouvelle, absente de ses références (D4.INV-2). Une proposition se reconnaît à son système, son motif et sa profondeur ; une proposition par invariant ou par faux refus, à sa sorte, son système et son motif, et ne se confond avec aucune autre sorte. Le corps d'une proposition par faux refus rappelle qu'une règle de sûreté ne s'affaiblit jamais (module `acceptable`).

## 4. Recette

| Invariant | Tests |
|---|---|
| D4.INV-1 | `tests/observatoire.test.mjs` : « D4 : une proposition ne porte que des valeurs minimisées, et aucun texte, chemin ni nom d'une instance n'entre dans le dépôt » ; « D6 : un candidat par invariant se propose à la spécification qui le définit, avec les systèmes qui l'ont relevé, et ses références nomment le système de chaque enveloppe » ; « D8 : une règle déclarée infondée par des faux refus dans deux instances est proposée, trop large, à la spécification qui la définit ; des faux refus d'une seule instance ne font que se compter » ; `tests/specification.test.mjs` : « spécification : chaque proposition du dépôt suit le format observatoire.proposition/1, et leur dossier a son README » |
| D4.INV-2 | `tests/observatoire.test.mjs` : « D4 : l'observatoire n'écrit dans le dépôt que des propositions, sans toucher aux projets ; une ouverte ou une ratifiée ne se répète pas, une refusée ne revient qu'avec une instance nouvelle » ; « Ligne de commande : codes de sortie ; le magasin d'épreuve seul est écrit » |
<<<FIN modules/propositions/SKILL.md>>>

<<<FICHIER modules/suivi/SKILL.md>>>
---
name: suivi
description: Suivi des propositions de l'observatoire (statut de chaque proposition du dépôt ; pour une ratifiée, part de son motif dans les enveloppes du système avant et après la version qui la porte : effet observé, non observé, ou indécidable sous vingt enveloppes). À lire pour lire l'effet d'une proposition ratifiée.
dimensions: [D5]
status: active
---

# Module `suivi` (D5)

Une proposition ratifiée entre dans une version, qui descend vers les projets par sa transmission ; les instances qui l'appliquent exportent ensuite des enveloppes à cette version. Le suivi ferme la boucle : il regarde si le motif que la proposition traitait recule dans ces enveloppes. C'est la preuve que la règle 3 d'`EVOLUTION.md`, section 10.5, demande à une boucle du troisième ordre.

## 1. Mesure

- Pour une proposition ratifiée en version V du système S : les enveloppes de S, toutes instances confondues, se partagent entre les versions antérieures à V et les versions V et suivantes.
- De chaque côté, la part du motif est le nombre de signaux de ce motif, à la profondeur de la proposition, rapporté au nombre d'enveloppes de S (module `confrontation`, pour les signaux). Pour une proposition par invariant, S est la spécification qui le définit, et le motif, celui de ses écarts et de ses dérogations qui citent l'invariant, hors réponse à un refus (module `systemes`) ; pour une proposition par faux refus, S est la spécification qui définit la règle, et le motif, celui des faux refus qui la citent (module `acceptable`) ; si S n'exporte pas, comme le socle de l'acceptable, l'effet reste indécidable.
- L'effet est observé si la part recule après V, non observé sinon ; il ne se déclare qu'avec au moins vingt enveloppes de S de part et d'autre, sinon il est indécidable (D5.INV-1).
- Une proposition ouverte ou refusée n'a pas d'effet à mesurer : `suivre` dit son statut.

Un effet non observé n'invalide pas la ratification : il la rouvre à la conversation, avec ses nombres, dans une proposition nouvelle si le motif persiste.

## 2. Recette

| Invariant | Tests |
|---|---|
| D5.INV-1 | `tests/observatoire.test.mjs` : « D5 : l'effet d'une proposition ratifiée se mesure avant et après sa version : observé, non observé, ou indécidable sous vingt enveloppes » ; « D6 : un candidat par invariant se propose à la spécification qui le définit, avec les systèmes qui l'ont relevé, et ses références nomment le système de chaque enveloppe » ; « D8 : une règle déclarée infondée par des faux refus dans deux instances est proposée, trop large, à la spécification qui la définit ; des faux refus d'une seule instance ne font que se compter » ; « Ligne de commande : codes de sortie ; le magasin d'épreuve seul est écrit » |
<<<FIN modules/suivi/SKILL.md>>>

---

# Table d'intégrité (sha256)

Format compatible `sha256sum -c`, à exécuter depuis le dossier où les fichiers ont été matérialisés.

    00eaa17fef91a24e7df9ec3233afdda2ed210fcd95d47efb7d8be89cefaf3ad9  manifest.json
    907e463de70701ad99e600ce523b561cbf24ec760ae0d9d1bfaeb70bd700193d  SKILL.md
    087fcfad15f8f59e31b0a63334b72f2ed7d2367bbabca8427ff660c279f72583  socle-observation/SKILL.md
    410c815442ec39067b628878d72ad0e2c8a1e0d78091894ad1bce6b6d36e683d  modules/export-binome/SKILL.md
    6d08447c31922eb788532b66550573c4875d17dd86b5905404fba306e4c411f6  modules/releve/SKILL.md
    a35e9dad7301e499237b79a902c331160438f9db753893ec3fa4d17d1b077e9d  modules/confrontation/SKILL.md
    de057cc6ee220d28647f9116c37c7d2a5fe98ef24553776ebc3a45d7dd808534  modules/systemes/SKILL.md
    7e0be7ab3b1bd93353914d4fca6ae39c25fc603b17aa0fec2ebf711d710db175  modules/acceptable/SKILL.md
    ab210c884c0c89e968caa312ffbce1ca6dbb510b22eb98eab16bd914fd804062  modules/kits/SKILL.md
    3b72c588b8e4c11979cbe882e191a38965d72783439425a71ce6099dbcdfd0c4  modules/etat/SKILL.md
    2313bf1c4fd8378d2d2e439725c5d3fb54e6bb8763aeda702112834549f037e9  modules/propositions/SKILL.md
    60f07c63a82a403b4d1750ea8f592ea19ae3b94c93864a1452298c86c5d6c3aa  modules/suivi/SKILL.md
