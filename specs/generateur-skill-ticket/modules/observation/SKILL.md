---
name: observation
description: Export des observations du générateur de skills de ticket vers le socle d'observation (champ de chaque ticket et registre d'apprentissage traduits dans l'enveloppe commune du socle socle-observation, selon ses correspondances, en ajout seul et chaîné, sans texte ni référence en clair, sel de l'instance gardé hors de l'arbre de travail). À lire pour exporter les observations d'un projet, vérifier son journal d'enveloppes ou en lire l'état.
dimensions: [D9]
status: active
---

# Module `observation` (D9)

Le champ et l'apprentissage font du générateur un système de second ordre, borné dans chaque projet : les niveaux d'observation N1 à N3 du champ, le développeur au-dessus, et les récurrences que le registre propose. Le troisième ordre du dépôt (`EVOLUTION.md`, section 10) demande que chaque système de second ordre se rende observable aux autres dans un milieu commun, pour qu'un même motif relevé dans plusieurs projets, ou par plusieurs systèmes, puisse se confronter. Ce module applique au générateur le socle `socle-observation`, inclus dans sa transmission à la version qu'épingle `manifest.json` : l'export traduit, il ne remplace rien, et les formats du générateur ne changent pas.

## 1. Ce que l'export lit et écrit

- Il lit, sans les modifier, le champ d'observation de chaque ticket, `docs/demandes/<clé>/champ.jsonl`, et le registre d'apprentissage du projet, `docs/c7e/registre-apprentissage.jsonl`, où chaque relevé est versé à sa clôture. Il vérifie d'abord leur intégrité, numéros, chaîne et têtes : une source altérée arrête l'export.
- Il traduit chaque enregistrement, sauf les actions du champ, en une enveloppe `socle-observation.enveloppe/1`, selon les correspondances du socle, sections 6.1 et 6.2 : un enregistrement, une enveloppe (D9.INV-1).
- Il n'écrit dans le projet que le journal d'enveloppes, `docs/c7e/observations.jsonl`, en ajout seul et chaîné, et sa tête, `docs/c7e/observations.tete`, qui porte le numéro et l'empreinte de sa dernière ligne. Le développeur les versionne avec le projet, comme le registre d'apprentissage ; l'outil ne commite rien.
- Chaque enveloppe porte le générateur et sa version, `systeme`, et l'empreinte du sel de l'instance, `instance`. Aucun texte ne sort, ni résumé, ni contenu de retour, ni constat, ni extrait de preuve (`socle-observation:SO3.INV-1`) ; toute référence du projet, clé, nœud, critère, scénario, chemin ou commit, sort par son empreinte salée ; les numéros d'enregistrements sortent tels quels ; le sujet est un rôle, jamais un nom (`socle-observation:SO3.INV-2`).
- Un écart aux consignes du générateur, relevé avec la cible `generateur`, sort avec la cible `specification` : c'est ce qui doit remonter jusqu'au dépôt.

## 2. Le sel de l'instance

Le sel, 32 octets aléatoires écrits en hexadécimal, est tiré à la première exportation du projet, de quelque système qu'elle soit, et gardé dans le répertoire Git commun du projet, `<git-common-dir>/agent2prompt/sel`, lisible de son seul propriétaire : hors de l'arbre de travail, donc jamais versionné, et partagé par les worktrees du projet et par les systèmes qui y exportent, comme l'orchestrateur C7E, dans son propre journal. Il n'est jamais affiché, exporté ni passé en argument (D9.INV-2). Un autre clone du projet a besoin du même sel pour continuer les journaux : le développeur l'y recopie lui-même, au même emplacement. Sans lui, un journal d'enveloppes du projet, celui du générateur ou celui d'un autre système, arrête l'export, comme un sel qui n'est pas celui de l'un d'eux : un nouveau sel changerait l'identité de l'instance au milieu de ses journaux.

## 3. Export incrémental

- Un enregistrement déjà exporté, reconnu par son format, son journal, l'empreinte salée de la clé de son ticket pour le champ, et son numéro, ne l'est pas une seconde fois ; deux exports sans enregistrement nouveau laissent le journal et sa tête identiques, octet pour octet (D9.INV-3).
- Les enregistrements nouveaux se fusionnent par date, sans changer l'ordre d'un même journal ; à date égale, les champs passent dans l'ordre de leur clé, puis le registre d'apprentissage.
- Un enregistrement arrivé après d'autres, plus récents, par exemple d'une branche fusionnée plus tard, prend la date de la dernière enveloppe : le journal reste dans l'ordre du temps (`socle-observation:SO2.INV-1`).
- Tout ou rien : un journal ou une source altérés, un sel absent ou étranger à un journal du projet, une enveloppe mal formée arrêtent l'export, et rien n'est écrit, ni journal, ni tête, ni sel (`socle-observation:SO1.INV-1`).
- L'export se lance sur la branche d'intégration du projet, où se rejoignent les branches des tickets : un journal en ajout seul et chaîné ne se fusionne pas.

## 4. Commandes

Depuis le projet, avec Node 20 ou plus récent :

| Commande | Effet |
|---|---|
| `node <dépôt>/specs/generateur-skill-ticket/outils/observation.mjs exporter [--projet <dossier>]` | traduit les enregistrements nouveaux et les ajoute au journal ; tire le sel à la première exportation |
| `observation.mjs verifier [--projet <dossier>]` | vérifie le journal : schéma fermé, numéros, dates, chaîne, tête, et son instance quand le sel est là |
| `observation.mjs etat [--projet <dossier>] [--json]` | enveloppes par type, par ordre et niveau, par sujet ; sources ; enregistrements en attente d'export |

`<dossier>` est la racine du projet, par défaut le dossier courant. Codes de sortie : 0 ; 1 pour un refus ou un journal altéré ; 2 pour un usage incorrect. Aucun skill de ticket ne porte cet outil ni ce module : l'export ne passe pas par eux.

## 5. Point d'extension

| Point | Règle active en 1.3 |
|---|---|
| E4 | le champ et le registre d'apprentissage s'exportent selon les correspondances du socle `socle-observation` 1.5.0 ; un nouveau format à exporter attend sa correspondance dans une version du socle ; aucun skill de ticket ne porte l'outil ni le module |

## 6. Recette

| Invariant | Tests |
|---|---|
| D9.INV-1 | `tests/observation.test.mjs` : « D9 : l'export lit le champ de chaque ticket et le registre d'apprentissage sans les modifier, et n'écrit que le journal d'enveloppes, sa tête et le sel » ; « D9 : ligne de commande, codes de sortie » ; `tests/specification.test.mjs` : « 1.3.0 : l'export ne passe pas par les skills de ticket : ni l'outil, ni le module, ni le socle n'y entrent » |
| D9.INV-2 | `tests/observation.test.mjs` : « D9 : le sel de l'instance est tiré une fois, dans le répertoire Git commun, partagé par les worktrees, jamais versionné, affiché ni exporté » ; « D9 : sans le sel, un journal existant arrête l'export, rien n'est écrit » ; « D9 : le journal d'un autre système du projet compte aussi : sans le sel, il arrête l'export, comme un sel qui n'est pas le sien » ; « SO3 : aucun nom, aucune clé, aucun chemin du projet ne sort en clair, et le sel jamais » |
| D9.INV-3 | `tests/observation.test.mjs` : « D9 : l'export est incrémental et idempotent : un enregistrement exporté ne l'est pas deux fois, et deux exports sans nouveauté laissent le journal identique, octet pour octet » ; « D9 : un enregistrement arrivé après d'autres, plus récents, prend la date de la dernière enveloppe, et chaque journal source garde son ordre » |

Les invariants du socle, appliqués au générateur :

| Invariant | Tests |
|---|---|
| socle-observation:SO1.INV-1 | `tests/observation.test.mjs` : « SO1 : une enveloppe au schéma ouvert, hors liste ou incomplète est refusée, et rien n'est écrit » ; « SO3 : aucune enveloppe ne porte de texte libre : l'export d'ABCDE-3620 ne garde que des valeurs de listes, des motifs, des numéros, des invariants du dépôt et des empreintes » |
| socle-observation:SO1.INV-2 | `tests/observation.test.mjs` : « SO1 : chaque type d'enregistrement source déclare son ordre et son niveau ; aucun niveau au-delà de N3, jamais OC3 » ; « SO4 : le registre d'apprentissage se traduit selon le socle : relevés, propositions et décisions » |
| socle-observation:SO2.INV-1 | `tests/observation.test.mjs` : « SO2 : un journal altéré à la main se relève, ligne réécrite, insérée ou supprimée, jusqu'à la dernière, et refuse tout ajout » ; « D9 : ligne de commande, codes de sortie » |
| socle-observation:SO3.INV-1 | `tests/observation.test.mjs` : « SO3 : aucune enveloppe ne porte de texte libre : l'export d'ABCDE-3620 ne garde que des valeurs de listes, des motifs, des numéros, des invariants du dépôt et des empreintes » |
| socle-observation:SO3.INV-2 | `tests/observation.test.mjs` : « SO3 : aucun nom, aucune clé, aucun chemin du projet ne sort en clair, et le sel jamais » |
| socle-observation:SO4.INV-1 | `tests/observation.test.mjs` : « SO4 : l'export traduit sans modifier ses sources, et désigne chaque enregistrement par son format, son journal et son numéro, sur un projet à deux champs » ; « D9 : l'export lit le champ de chaque ticket et le registre d'apprentissage sans les modifier, et n'écrit que le journal d'enveloppes, sa tête et le sel » |
| socle-observation:SO4.INV-2 | `tests/observation.test.mjs` : « SO4 : même sources, même sel : même journal, octet pour octet, celui de tests/attendus/observations-ABCDE-3620.jsonl » ; « D9 : l'export est incrémental et idempotent : un enregistrement exporté ne l'est pas deux fois, et deux exports sans nouveauté laissent le journal identique, octet pour octet » |
