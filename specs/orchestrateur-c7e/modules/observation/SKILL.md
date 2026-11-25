---
name: observation
description: Export du registre des concepts et du registre des écarts de l'orchestrateur vers le socle d'observation (événements du registre des concepts lus dans son historique Git, lignes décidées du registre des écarts, traduits dans l'enveloppe commune du socle socle-observation selon ses correspondances, en ajout seul et chaîné, sans texte ni référence en clair, avec le sel de l'instance que partagent les systèmes qui exportent ; outil lancé par le développeur depuis le clone du dépôt Agent2Prompt). À lire quand le développeur demande l'export des registres, la vérification du journal d'enveloppes de l'orchestrateur ou son état.
dimensions: [D12]
status: active
---

# Module `observation` (D12)

Le registre des concepts borne le second ordre de l'orchestrateur dans chaque projet, et le registre des écarts y garde chaque écart à un invariant avec sa décision. Le troisième ordre du dépôt (`EVOLUTION.md`, section 10) demande que chaque système de second ordre se rende observable aux autres dans un milieu commun, pour que les propositions, les décisions et les écarts de plusieurs projets et de plusieurs systèmes puissent se confronter. Ce module applique à l'orchestrateur le socle `socle-observation`, inclus dans sa transmission à la version qu'épingle `manifest.json` : l'export traduit, il ne remplace rien ; les deux registres, leurs formats et leurs droits ne changent pas (D6.INV-2).

## 1. Qui exporte

L'outil d'export, `outils/observation.mjs`, reste dans le clone du dépôt Agent2Prompt : la transmission du skill ne le porte pas. L'IA n'exporte pas d'elle-même : à la demande du développeur, elle lui donne la commande de la section 6, qu'il lance depuis la branche d'intégration du projet, et lui rappelle de versionner le journal et sa tête (D12.INV-1, scénario R23).

## 2. Ce que l'export lit et écrit

- Il lit ce qui est commité, sans rien modifier, ni registre ni historique : le registre des concepts, `docs/c7e/concepts.json`, dans son historique Git, au premier parent de la branche courante, qui doit être la branche d'intégration du projet, et le registre des écarts, `docs/c7e/registre-ecarts.md`, à son dernier commit (D12.INV-1).
- Il traduit chaque événement du registre des concepts et chaque ligne décidée du registre des écarts en une enveloppe `socle-observation.enveloppe/1`, selon les correspondances du socle, sections 6.3 et 6.4, et leurs précisions de la section 3 : un événement ou une ligne, une enveloppe.
- Il n'écrit dans le projet que le journal d'enveloppes de l'orchestrateur, `docs/c7e/observations-orchestrateur-c7e.jsonl`, en ajout seul et chaîné, et sa tête, `docs/c7e/observations-orchestrateur-c7e.tete`, qui porte le numéro et l'empreinte de sa dernière ligne. Le développeur les versionne avec le projet, sur la branche d'intégration ; l'outil ne commite rien.
- Chaque enveloppe porte l'orchestrateur et sa version, `systeme`, et l'empreinte du sel de l'instance, `instance`. Aucun texte ne sort, ni nom de concept, ni constat d'écart, ni message de commit (`socle-observation:SO3.INV-1`) ; une clé de ticket ou l'identifiant d'un concept du projet sort par son empreinte salée, seul l'identifiant d'un concept du registre de départ en clair ; le sujet est un rôle, jamais un nom : le nom qui valide une dérogation reste dans le registre (`socle-observation:SO3.INV-2`).

## 3. Précisions des correspondances

Le socle fixe les correspondances des deux registres ; l'orchestrateur les précise pour ses propres formats, sans les redéfinir.

**Registre des concepts**, format `orchestrateur.concepts/1` : un fichier, non un journal, dont les événements se constatent entre deux états commités.

- Les états sont ceux des commits qui changent le fichier, au premier parent de la branche d'intégration, chacun comparé au précédent état lisible ; un état absent ou illisible est signalé et ignoré. Un événement est daté par le commit qui le porte sur cette branche, une fusion pour ce qu'apporte la branche d'un ticket, et numéroté dans l'ordre de l'historique, puis, dans un même commit, dans l'ordre des identifiants.
- Le premier état est la base : le registre de départ, ou le registre tel qu'il était avant l'historique ; seules ses entrées `proposed` sont des événements.
- Une entrée ajoutée au statut `proposed` est une `proposition`. Elle cite l'observation qui la fonde quand le commit qui l'ajoute est un commit de second ordre, marqué `[É7-C7E]` (§ 4 et § 6, D6.INV-1) : niveau `N2`, sujet `agent:orchestrateur-c7e` ; sinon niveau `humain`, sujet `developpeur`. Quand le commit de la branche d'intégration est une fusion, le commit qui ajoute l'entrée est le premier de la branche fusionnée où elle figure au statut `proposed`.
- Un changement de statut est une `decision` du référent, de nature le nouveau statut, avec la valeur `retenue` pour une promotion, `amendee` pour une rétrogradation ; un retrait, de nature `retire`, porte la valeur `refusee`. La décision vise l'enveloppe de la dernière proposition de l'entrée ; une entrée jamais proposée, comme celles du registre de départ, n'a pas de proposition à viser, et son enveloppe ne porte pas `decision`.
- Le motif est `concept-` suivi du domaine de l'identifiant, `C_<DOMAINE>_<NNN>`, en minuscules et tirets (`concept-performance`) ; un identifiant d'une autre forme donne `concept-inconnu`. L'ancre est le concept ; `cible` vaut `instance`.

**Registre des écarts**, format `orchestrateur.ecarts/1` : le tableau Markdown dont l'en-tête commence par Date et Ticket.

- Le numéro d'une ligne est son rang dans le tableau, hors la ligne d'exemple du modèle, `EX-001`, qui ne sort jamais ; sa date est celle de la ligne, à minuit UTC.
- Une ligne est décidée quand sa décision commence par « respecter », ou par « dérogation validée par » suivi d'un nom ; une ligne sans décision, ou une dérogation sans le nom qui la valide, attend.
- « respecter » donne un `ecart`, niveau `N1`, sujet `agent:orchestrateur-c7e` ; une dérogation donne une `derogation`, niveau `humain`, sujet `referent` ; toutes deux à l'ordre `OC1`.
- L'invariant concerné sort, préfixé par sa spécification, quand c'est un invariant que définit le dépôt : `java:D4.INV-1` tel quel ; sans préfixe, un identifiant en `D` désigne un invariant de l'orchestrateur, en `SC` du socle back-front, en `SO` du socle d'observation. Le motif est alors `ecart-` suivi de l'invariant en minuscules et tirets (`ecart-java-d4-inv-1`), sinon `ecart-invariant-projet`, et l'invariant du projet reste dans l'instance. Un désaccord entre nœuds, que le script du champ d'un arbre de skills de ticket inscrit au registre (D6.INV-3), sort ainsi avec l'invariant `orchestrateur-c7e:D6.INV-3`, une fois décidé.
- L'ancre est le ticket ; `cible` vaut `instance`.

## 4. Le sel de l'instance

Le sel est celui de l'instance, que garde le répertoire Git commun du projet, `<git-common-dir>/agent2prompt/sel`, hors de l'arbre de travail, et que partagent les systèmes qui exportent dans le projet, comme le générateur de skills de ticket : leurs journaux désignent l'instance par la même empreinte (D12.INV-2). Le premier export du projet, de quelque système qu'il soit, le tire ; il n'est jamais versionné, affiché, exporté ni passé en argument. Sans lui, un journal d'enveloppes du projet, celui de l'orchestrateur ou celui d'un autre système, arrête l'export, comme un sel étranger à l'un d'eux : un nouveau sel changerait l'identité de l'instance au milieu de ses journaux. Un autre clone du projet a besoin du même sel : le développeur l'y recopie lui-même, au même emplacement.

## 5. Export incrémental

- Un événement ou une ligne déjà exportés, reconnus par leur format et leur numéro, ne le sont pas une seconde fois ; deux exports sans nouveauté laissent le journal et sa tête identiques, octet pour octet (D12.INV-3).
- Les enregistrements nouveaux des deux registres se fusionnent par date, sans changer l'ordre d'un même registre ; à date égale, le registre des concepts passe d'abord.
- Une ligne décidée après d'autres enveloppes, plus récentes, prend la date de la dernière : le journal reste dans l'ordre du temps (`socle-observation:SO2.INV-1`).
- Un enregistrement exporté qui change ensuite arrête l'export, sans rien écrire : une ligne d'écart modifiée ou qui n'est plus décidée, un événement du registre des concepts qui n'est plus le même, après une réécriture de l'historique ou un export lancé depuis une autre branche que celle de l'intégration (D12.INV-3). Une décision nouvelle s'inscrit sur une ligne nouvelle du registre des écarts.
- Tout ou rien : un journal altéré, une source illisible, un sel absent ou étranger, une enveloppe mal formée arrêtent l'export, et rien n'est écrit, ni journal, ni tête, ni sel (`socle-observation:SO1.INV-1`).

## 6. Commandes

Depuis le projet, sur sa branche d'intégration, avec Node 20 ou plus récent :

| Commande | Effet |
|---|---|
| `node <dépôt>/specs/orchestrateur-c7e/outils/observation.mjs exporter [--projet <dossier>]` | traduit les événements et les lignes décidées nouveaux et les ajoute au journal ; tire le sel si aucun système ne l'a encore tiré |
| `observation.mjs verifier [--projet <dossier>]` | vérifie le journal : schéma fermé, numéros, dates, chaîne, tête, et son instance quand le sel est là |
| `observation.mjs etat [--projet <dossier>] [--json]` | enveloppes par type, par ordre et niveau, par sujet ; enregistrements en attente d'export |

`<dépôt>` est le clone du dépôt Agent2Prompt ; `<dossier>`, la racine du projet, un dépôt Git, par défaut le dossier courant. Codes de sortie : 0 ; 1 pour un refus ou un journal altéré ; 2 pour un usage incorrect.

## 7. Point d'extension

| Point | Règle active en 3.7 |
|---|---|
| E6 | le registre des concepts et le registre des écarts s'exportent selon les correspondances du socle `socle-observation` 1.2.0, précisées par la section 3 ; un registre de plus à exporter attend sa correspondance dans une version du socle ; la transmission ne porte pas l'outil |

## 8. Recette

La recette de l'outil est dans le dépôt Agent2Prompt, `specs/orchestrateur-c7e/tests/observation.test.mjs` ; elle construit l'historique Git de ses projets d'épreuve.

| Invariant | Tests |
|---|---|
| D12.INV-1 | `tests/observation.test.mjs` : « D12 : l'export lit les deux registres et leur historique sans rien modifier, et n'écrit que le journal de l'orchestrateur, sa tête et le sel » ; « D12 : une ligne sans décision, ou une dérogation sans le nom qui la valide, attend, et la ligne d'exemple du modèle ne sort jamais » ; « D12 : ligne de commande, codes de sortie » ; « spécification : chaque invariant de D12, et chaque invariant du socle épinglé, a sa ligne de recette ; le schéma de l'outil est celui du socle » |
| D12.INV-2 | `tests/observation.test.mjs` : « D12 : une instance, une identité : le générateur et l'orchestrateur d'un projet ont le même sel ; sans lui, tout journal du projet arrête l'export » ; « D12 : l'export lit les deux registres et leur historique sans rien modifier, et n'écrit que le journal de l'orchestrateur, sa tête et le sel » ; « SO3 : aucun texte, aucun nom, aucune clé de ticket en clair ; seuls les concepts du registre de départ sortent en clair » ; « D12 : ligne de commande, codes de sortie » |
| D12.INV-3 | `tests/observation.test.mjs` : « D12 : l'export est incrémental et idempotent ; une ligne d'écart ou un historique réécrits depuis l'export l'arrêtent » |

Les invariants du socle, appliqués à l'orchestrateur :

| Invariant | Tests |
|---|---|
| socle-observation:SO1.INV-1 | `tests/observation.test.mjs` : « SO1 : une enveloppe au schéma ouvert, hors liste ou incomplète est refusée, et une source illisible n'écrit rien » ; « SO3 : aucun texte, aucun nom, aucune clé de ticket en clair ; seuls les concepts du registre de départ sortent en clair » |
| socle-observation:SO1.INV-2 | `tests/observation.test.mjs` : « SO1 : chaque événement des deux registres déclare son ordre et son niveau ; jamais OC3 » ; « SO1 : une entrée proposée par un commit de second ordre sort au niveau N2, même apportée par une fusion ; une autre au niveau humain » |
| socle-observation:SO2.INV-1 | `tests/observation.test.mjs` : « SO2 : un journal altéré à la main se relève, jusqu'à sa dernière ligne, et refuse tout ajout » ; « D12 : l'export est incrémental et idempotent ; une ligne d'écart ou un historique réécrits depuis l'export l'arrêtent » ; « D12 : ligne de commande, codes de sortie » |
| socle-observation:SO3.INV-1 | `tests/observation.test.mjs` : « SO3 : aucun texte, aucun nom, aucune clé de ticket en clair ; seuls les concepts du registre de départ sortent en clair » |
| socle-observation:SO3.INV-2 | `tests/observation.test.mjs` : « SO3 : aucun texte, aucun nom, aucune clé de ticket en clair ; seuls les concepts du registre de départ sortent en clair » |
| socle-observation:SO4.INV-1 | `tests/observation.test.mjs` : « SO4 : l'export traduit sans modifier ses sources ; même historique, même sel : même journal, octet pour octet » ; « D12 : l'export lit les deux registres et leur historique sans rien modifier, et n'écrit que le journal de l'orchestrateur, sa tête et le sel » |
| socle-observation:SO4.INV-2 | `tests/observation.test.mjs` : « SO4 : l'export traduit sans modifier ses sources ; même historique, même sel : même journal, octet pour octet » ; « D12 : l'export est incrémental et idempotent ; une ligne d'écart ou un historique réécrits depuis l'export l'arrêtent » |
