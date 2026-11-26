# Mode d'emploi : l'observatoire

Ce mode d'emploi met en place l'observatoire de l'écosystème, [`observatoire`](../../specs/observatoire/SKILL.md) 1.5.0, sur le poste du développeur. L'observatoire relève les journaux d'enveloppes que les systèmes exportent dans ses projets, dont ceux qu'il écrit pour le binôme Agent2Dev et Agent2Test à partir de leurs refus, de leurs kits et de leurs décisions aux points de validation, les confronte d'une instance à l'autre, d'un système à l'autre par les invariants du dépôt que citent leurs écarts, et par règle de l'acceptable que citent les refus, compte les kits et les signaux, observe l'état de l'écosystème, écrit des propositions minimisées que le développeur apporte au dépôt par pull request, contrôle l'examen indépendant qui précède chaque ratification, et suit l'effet de celles que la ratification fait entrer dans une version. Il propose et n'applique jamais ; ce qu'il relève reste sur le poste.

```mermaid
flowchart LR
  B["exporter les refus, les kits et les points du binôme<br/>export-binome.mjs"] --> I
  E["exporter<br/>dans chaque projet"] --> I["inscrire<br/>chaque projet"]
  I --> R["relever<br/>miroirs vérifiés"]
  R --> T["etat<br/>versions en usage"]
  R --> C["confronter<br/>retours, récurrences, invariants, règles de l'acceptable, kits, signaux"]
  C --> P["proposer<br/>observatoire/propositions/"]
  P --> X["examen indépendant<br/>observatoire/examens/"]
  X --> PR["pull request<br/>ratification"]
  PR --> S["suivre<br/>effet après la version"]
```

## 1. Prérequis

- Un clone d'Agent2Prompt, `<dépôt>`, qui est un dépôt Git, et Node 20 ou plus récent ; Node 22 ou plus récent pour la recette.
- Des projets dont les systèmes exportent leurs observations, chacun dans son journal, sous le même sel d'instance : pour le générateur de skills de ticket, son `observation.mjs exporter` ([mode d'emploi du générateur](../generateur-skill-ticket/mode-emploi.md), section 6), qui écrit `docs/c7e/observations.jsonl` ; pour l'orchestrateur C7E, le sien (module `observation` de [`orchestrateur-c7e`](../../specs/orchestrateur-c7e/modules/observation/SKILL.md)), qui écrit `docs/c7e/observations-orchestrateur-c7e.jsonl` ; pour le binôme, l'outil d'export de l'observatoire (section 3), qui écrit `docs/c7e/observations-agent2dev.jsonl` et `docs/c7e/observations-agent2test.jsonl`.

## 2. Installer l'observatoire

```bash
node <dépôt>/tools/installer.mjs observatoire --utilisateur
```

Le skill s'installe au niveau utilisateur seulement, dans `~/.gemini/skills/observatoire/` : il observe plusieurs projets depuis le clone, sans écrire dans aucun. Il sert à l'IA qui t'aide à lire ce que l'observatoire tire et à rédiger les propositions. Sa transmission porte sa consigne, ses modules et le socle d'observation ; ses outils restent dans le clone : [`transmissions/observatoire-1.5.0.md`](../../transmissions/observatoire-1.5.0.md). L'outil se lance aussi sans IA, depuis le clone.

## 3. Exporter les refus, les kits et les points du binôme, inscrire et relever

Agent2Dev et Agent2Test n'ont pas d'outil dans le dépôt : l'observatoire exporte leurs refus, leurs kits et les décisions d'Agent2Dev aux points de validation pour eux, dans le projet de l'application, sous le sel de son instance.

```bash
node specs/observatoire/outils/export-binome.mjs exporter --projet <application> <sortie>/<CLÉ>/livrable.json <projet-agent2test>/rapports/<campagne>/journal-de-tests.json
```

Depuis le clone. Chaque refus de la rubrique `acceptable` d'un livrable ou d'un journal de tests, et chaque réponse, dérogation ou faux refus, devient une enveloppe datée par la rubrique, dans le journal de son système ; de même chaque étape d'un kit de la rubrique `kits`, remise, validation, application ou échec, retour arrière, et, pour Agent2Dev, chaque présentation d'un point de validation de la rubrique `points` et sa décision, avec le délai de décision, calculé à la source. Rien d'autre ne sort : ni l'objet refusé, ni le motif d'une réponse, ni le commentaire d'un échec ou d'une décision, ni son canal, ni la clé de la demande, ni le scénario, ni l'empreinte d'un patch, ni un nom. Versionne les journaux et leurs têtes avec le projet. Relancé, l'outil n'ajoute que ce qui est nouveau, comme la réponse donnée après l'export de son refus ; une rubrique qui change ce qu'elle a déjà rendu est refusée. `verifier --projet <application>` contrôle les deux journaux, `etat --projet <application>` les compte.

```bash
node specs/observatoire/outils/observatoire.mjs inscrire --projet <dossier>
node specs/observatoire/outils/observatoire.mjs relever
```

Depuis le clone. `inscrire` enregistre le projet et son instance, l'empreinte que portent ses enveloppes, la même dans les journaux de tous ses systèmes ; un projet copié, ou un worktree, reste la même instance. `relever` vérifie chaque journal du projet selon le socle et le recopie dans le magasin, chacun dans son miroir, en ajout seul. Le magasin est dans le répertoire Git commun du clone, `<git-common-dir>/agent2prompt/observatoire/` : jamais versionné, partagé par les worktrees du clone ; un nouveau clone n'a qu'à réinscrire ses projets. `etat`, `confronter`, `proposer` et `suivre` relèvent d'abord.

## 4. Lire l'état, confronter, proposer

```bash
node specs/observatoire/outils/observatoire.mjs etat
node specs/observatoire/outils/observatoire.mjs confronter
node specs/observatoire/outils/observatoire.mjs proposer
```

`etat` dit, pour chaque instance, la version de chaque système qui exporte, à jour, en retard ou inconnue du dépôt. `confronter` liste les candidats : un retour, une proposition qu'une instance a retenue pour une spécification, dès une instance ; une récurrence, un même motif à la même profondeur dans au moins deux instances ; un invariant, un même invariant du dépôt cité par des écarts distincts de deux systèmes, ou dans deux instances, proposé à la spécification qui le définit ; un faux refus, une règle de l'acceptable déclarée infondée par des faux refus dans au moins deux instances, proposée, trop large, à la spécification qui la définit. Il compte aussi, par règle, les refus, les dérogations et les faux refus du binôme : un refus seul ne fait que se compter ; et, par système et par environnement, ses kits : remis, validés, appliqués, en échec, défaits, en attente d'application, kits test sans nettoyage déclaré, sans candidat ; et, par système et par point de validation, les décisions d'Agent2Dev, retenues, amendées ou refusées, celles qui attendent, et les délais médian et maximal : deux signaux du deuxième couplage, au catalogue d'`EVOLUTION.md`, section 10.6, sans candidat non plus. Le désaccord entre nœuds que le générateur constate et que tu décides au registre des écarts de l'orchestrateur est un seul écart : il ne compte qu'une fois. `proposer` écrit une proposition par candidat nouveau dans `observatoire/propositions/`, à la racine du clone : relis-la, rédige sous « Ce qui change » la règle à changer et pourquoi, sans aucune donnée d'un projet, puis commite-la et ouvre la pull request. L'outil ne commite rien. `--json` donne `etat`, `confronter` et `suivre` en JSON.

## 5. Faire examiner, ratifier et suivre

Avant de ratifier une proposition, faites-la examiner par un observateur sur un autre modèle que celui qui l'a préparée : dans Gemini CLI, par exemple, un sous-agent qui déclare un autre modèle (champ `model` de sa définition), sans autre outil d'écriture que son examen. Il lit la proposition et la spécification qu'elle vise, puis écrit son avis dans `observatoire/examens/`, sous le nom de la proposition, au format `observatoire.examen/1` : `favorable`, `reserve` ou `defavorable`, et ses points sous `## Avis` (module [`examens`](../../specs/observatoire/modules/examens/SKILL.md)). Vous décidez seul : contre un avis défavorable, répondez-lui sous `## Réponse à l'examen` dans le corps de la proposition. Refuser ne demande pas d'examen.

La pull request de ratification apporte l'examen et inscrit le statut dans l'en-tête de la proposition : `statut: ratifiee`, avec `version`, la version du système qui la porte, et `pr`, son numéro ; ou `statut: refusee`, avec `pr`. Une proposition ouverte ou ratifiée ne se répète pas ; une refusée ne revient qu'avec une instance nouvelle. Une version qui relâche une forme propre du dépôt, une constitution d'exemple, demande de même son examen, `observatoire/examens/<spécification>-<version>.md`, que son journal cite avec ses preuves et sa migration (`EVOLUTION.md`, section 10.7).

```bash
node specs/observatoire/outils/observatoire.mjs suivre
```

Pour chaque proposition ratifiée, `suivre` compare la part de son motif dans les enveloppes du système avant et après la version qui la porte : effet observé, non observé, ou indécidable tant qu'il n'y a pas vingt enveloppes de chaque côté. Pour une proposition par invariant, le motif est celui des écarts qui citent l'invariant, dans les enveloppes de la spécification qui le définit, quand elle exporte ; pour une proposition par faux refus, celui des faux refus qui citent la règle. Le socle de l'acceptable n'exporte pas : l'effet d'une proposition sur une règle du noyau reste indécidable.

## 6. Recette et essais sur le poste

```bash
node --test "specs/observatoire/tests/*.test.mjs"
node specs/observatoire/outils/observatoire.mjs verifier
```

La recette, depuis la racine du clone, produit ses instances d'épreuve par l'export du générateur, par celui de l'orchestrateur et par celui du binôme, depuis des livrables d'épreuve, dans des dossiers temporaires, avec un magasin et un dépôt temporaires : elle n'écrit ni dans le magasin du clone, ni dans ses propositions. `verifier` contrôle le magasin, les propositions et les examens du dépôt, et qu'une proposition ratifiée a son examen.

## 7. Dépannage

| Symptôme | Cause | Remède |
|---|---|---|
| « le clone d'Agent2Prompt n'est pas un dépôt Git » | le clone a été copié sans son répertoire `.git` | lancer l'outil depuis un vrai clone |
| `inscrire` dit qu'il n'y a aucun journal | le projet n'exporte pas encore | exporter d'abord, avec l'outil de son système |
| `relever` dit un journal altéré | le journal ou sa tête a été modifié à la main | reprendre le journal et sa tête depuis l'historique Git du projet ; le miroir reste tel quel jusque-là |
| `relever` dit un journal réécrit depuis le dernier relevé | le journal a été refait, même avec une chaîne cohérente | reprendre le journal versionné qui prolonge le miroir ; un journal refait de bout en bout ne se relève plus |
| `relever` dit le magasin altéré | un fichier du magasin a été modifié | supprimer `<git-common-dir>/agent2prompt/observatoire/`, réinscrire les projets et relever : le magasin se reconstruit depuis les journaux |
| `etat` compte des enveloppes écartées | une instance exporte une version qu'aucune version publiée du dépôt ne connaît | mettre le clone à jour, ou le système de l'instance à une version publiée |
| `confronter` ne trouve aucune récurrence | une seule instance inscrite | inscrire une deuxième instance ; les retours, et les invariants relevés par deux systèmes, remontent sans elle |
| `inscrire` dit que les journaux viennent d'instances différentes | un système du projet a exporté sous un autre sel | reprendre le journal de ce système depuis l'historique Git du projet, et exporter avec le sel du répertoire Git commun du projet |
| `verifier` dit une proposition ratifiée sans examen | la pull request de ratification n'apporte pas l'avis de l'examinateur | faire écrire l'examen, du même nom, dans `observatoire/examens/`, et l'ajouter à la pull request |
| `export-binome.mjs` dit une rubrique réécrite | le livrable ou le journal de tests a changé un refus déjà exporté, ou l'a retiré | redonner la source telle qu'elle a été exportée : une source ne change pas ce qu'elle a déjà rendu |
| `export-binome.mjs` dit le sel absent alors qu'un journal existe | le clone du projet n'a pas le sel de l'instance | recopier le sel du clone qui a commencé les journaux dans `<git-common-dir>/agent2prompt/sel` |
