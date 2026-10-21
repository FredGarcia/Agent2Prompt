---
name: plan
description: Import du plan de tests et ouverture d'une campagne (adaptateur agent-tdd-jira pour us.md et le fichier Gherkin avec leurs étiquettes, adaptateur de la convention de l'annexe A, plan canonique versionné, empreintes des sources, identifiants uniques, marques orphelin, trou de couverture, non jouable et non automatisable, préalable de batch, rôle requis et rôles de la session, demande et critères cités, état git relevé à l'ouverture). À implémenter au lot 3.
dimensions: [D3]
status: active
---

# Module `plan` (D3)

`plan` transforme les fichiers du plan en un plan canonique, et ouvre la partie « éléments » (E1) d'une campagne. Il ne rédige rien : ce qu'il ne trouve pas, il le signale (D3.INV-1).

`plan` ne lit que les fichiers du plan que la demande désigne, en lecture seule, dans la racine du projet de l'application, avec le même confinement que le `scanner` : aucun chemin hors de la racine, même par lien symbolique. Le code source de l'application reste réservé au `scanner`.

## 1. Adaptateurs d'entrée (point E1)

### 1.1 `agent-tdd-jira`

Source : le dossier `docs/demandes/<CLÉ>/` du projet de l'application, produit par agent-tdd-jira 1.3.0 (`agent-tdd-jira:D10.INV-5`, `agent-tdd-jira:D7.INV-1`).

`us.md` :

- une section `## <CLÉ>-USnn : titre` ouvre une US ; la phrase « En tant que … » la décrit ;
- le tableau `| CA | Énoncé | Origine | Provenance | Statut | Scénarios |` donne ses critères ;
- statuts : `validé`, `à valider`, `en attente de Qn`, `retiré : <raison>` ;
- la section `## Exigences` est versée en mémoire comme contexte, sans autre effet.

`<CLÉ>.feature` :

| Élément Gherkin | Élément canonique |
|---|---|
| `Scénario:` ou `Exemple:` | scénario |
| `Plan du scénario:` et `Exemples:` | un scénario par ligne d'exemple, identifiant `<CLÉ>-Snn#k`, valeurs substituées |
| étapes `Étant donné`, `Quand`, `Alors`, `Et`, `Mais` | étapes en texte libre, dans l'ordre ; celles du `Contexte:` sont placées en tête de chaque scénario |
| `@<CLÉ>-Snn` | identifiant du scénario |
| `@<CLÉ>-CAnn` | critères couverts |
| `@front`, `@back` | couches touchées |
| `@socle` | scénario du socle (palier P3) |
| `@criticite-haute`, `@criticite-moyenne`, `@criticite-basse` | criticité ; moyenne par défaut |
| `@role-<nom>` | rôle de l'application requis par le scénario, nommé comme elle le nomme |
| `@batch-<nom>` | préalable : batch Java `<nom>`, lancé par le développeur en CP-5 |
| `@redemarrage`, `@ecriture-base` | prérequis hors périmètre |
| `@en-attente`, `@propose` | états d'agent-tdd-jira |

Une étiquette portée par la ligne `Fonctionnalité:` vaut pour chacun de ses scénarios, comme `@role-LECTEUR` dans l'exemple ECR-77. Une étiquette absente de ce tableau, comme `@<CLÉ>` sur la fonctionnalité, est conservée sans effet.

Identifiants canoniques : ceux d'agent-tdd-jira, tels quels, puisqu'ils portent déjà la clé de la demande (`ECR-77-US01`, `ECR-77-CA02`, `ECR-77-S03`).

### 1.2 `annexe-a`

La convention de l'annexe A du cahier des charges d'Agent2Test : frontmatter `espace`, titres `US-<n> —`, critères `CA-<n>.<m> :`, scénarios `S-<n>.<k> —` avec les lignes `Couvre :`, `Criticité :`, `Socle :` et `Prérequis :` (`batch <nom>`, `redémarrage` ou `écriture en base`), puis la liste numérotée des étapes. Identifiant canonique : `<espace>/<code>`. Le contenu des blocs de code est ignoré.

### 1.3 Autres formats

Tout autre format est refusé avec le motif « format d'entrée non pris en charge » (point E1).

## 2. Jouabilité et marques (D3.INV-1, D3.INV-3, D3.INV-5)

| Situation | Marque | Effet |
|---|---|---|
| critère qu'aucun scénario ne couvre | trou de couverture | signalé ; aucun scénario n'est créé |
| scénario qui ne couvre aucun critère existant | orphelin | importé, non jouable |
| scénario `@propose` | non jouable : proposé, non validé | aucun parcours |
| scénario `@en-attente`, ou dont tous les critères sont en attente | non jouable : en attente de Qn | aucun parcours |
| scénario `@back` sans `@front` | non jouable : limité au back | ses critères restent « non vérifiés » par Agent2Test ; les tests d'agent-tdd-jira les couvrent |
| scénario dont aucun critère n'est `validé` | non jouable : critère non validé | aucun parcours |
| critère `retiré` | retiré | hors de la demande ; mentionné, sans verdict |
| `@redemarrage`, `@ecriture-base`, `Prérequis : redémarrage` ou `écriture en base` | non automatisable, avec son motif | jamais joué |
| `@batch-<nom>`, `Prérequis : batch <nom>` | préalable de batch | jouable ; CP-5 s'ouvre avant le scénario (D9.INV-7) |
| `@role-<nom>`, dont le rôle manque aux rôles de la session déclarés par la configuration humaine (`session.roles`) | non jouable : rôle <nom> absent de la session | évalué à l'ouverture de la campagne ; ses critères restent « non vérifiés » |

Est jouable un scénario qui n'a aucune des marques bloquantes ci-dessus et qui illustre au moins un critère validé.

## 3. Plan canonique

```json
{
  "version": "P-14",
  "sources": [{ "chemin": "docs/demandes/ECR-77/us.md", "empreinte": "<sha256>" }, { "chemin": "docs/demandes/ECR-77/ECR-77.feature", "empreinte": "<sha256>" }],
  "us": [{ "id": "ECR-77-US01", "titre": "exporter la liste des retours d'expérience", "description": "En tant qu'utilisateur…", "source": "us.md:3" }],
  "criteres": [{ "id": "ECR-77-CA01", "us": "ECR-77-US01", "texte": "le fichier contient…", "statut": "validé", "source": "us.md:10" }],
  "scenarios": [{
    "id": "ECR-77-S01", "titre": "Exporter la liste filtrée", "couvre": ["ECR-77-CA01"],
    "etapes": ["je suis connecté avec le rôle \"LECTEUR\"", "la liste filtrée affiche 3 retours d'expérience", "je demande l'export CSV de la liste",
      "je reçois un fichier \"retours-experience.csv\"", "il contient 1 ligne d'en-tête et 3 lignes de données"],
    "couches": ["back", "front"], "criticite": "moyenne", "socle": false, "prealables": [], "roles": ["LECTEUR"],
    "jouable": true, "marques": [], "source": "ECR-77.feature:14"
  }],
  "trous": []
}
```

Chaque élément garde sa source, fichier et ligne. Le chemin d'une source est relatif à la racine du projet de l'application, avec `/` pour séparateur ; son empreinte est le SHA-256 de son contenu brut, en hexadécimal, celui que donne `sha256sum`.

## 4. Identifiants et versions (D3.INV-2, D3.INV-4)

- Deux éléments de même identifiant canonique bloquent l'import ; le message cite les deux emplacements, fichier et ligne.
- La version du plan est l'empreinte de l'ensemble des sources, triées par chemin. Sources inchangées : aucune version nouvelle. Source modifiée : version nouvelle `P-<n+1>` ; les précédentes restent consultables.

## 5. Demande et campagne (D3.INV-6)

```js
await bus.demander('plan', 'ouvrir', {
  demande: { cle: 'ECR-77', texte: 'Export des retours d’expérience en CSV' },
  sources: { adaptateur: 'agent-tdd-jira', dossier: 'docs/demandes/ECR-77' },
  changements: { git: 'origin/develop...HEAD' }
}, contexte);
```

- `perimetre.verifier(demande)` du noyau s'applique d'abord (D1.INV-5).
- Critères cités : pour l'adaptateur `agent-tdd-jira`, tous les critères non retirés de `us.md` ; pour l'annexe A, ceux que la demande énumère. Un critère cité absent du plan est signalé avant la sélection, avec l'événement `plan.critere_absent`.
- `changements` : une liste de fichiers modifiés, ou une plage git lue par le `scanner` ; elle alimente l'impact (module `scanner`).
- Rôles : un scénario `@role-<nom>` dont le rôle manque à `session.roles` de la configuration humaine est non jouable pour la campagne, motif « rôle <nom> absent de la session ». Le système ne déduit jamais les rôles de la session : un humain les déclare.
- La campagne retient, à son ouverture, la version du plan, les empreintes de ses sources et l'état git de la racine relevé par le `scanner` : commit `HEAD` et fichiers suivis modifiés. Une modification ultérieure des sources ne change ni sa sélection ni ses verdicts (D3.INV-4).

## 6. Actions et événements

| Action | Rôle |
|---|---|
| `importer(sources)` | importe et versionne ; rend le plan canonique et ses marques |
| `ouvrir(demande)` | vérifie le périmètre, fige la version et l'état git, rend critères cités, trous, absents et scénarios non jouables faute de rôle |
| `plan(campagne)` | plan figé de la campagne |
| `criteres(filtre)` | critères et leurs scénarios |

Événements : `plan.importe`, `plan.trou_couverture`, `plan.critere_absent`.

## 7. Pièges connus

- **Combler un trou** : jamais de scénario créé, même évident.
- **Gherkin réécrit** : les étapes sont recopiées ; le préparateur s'en sert telles quelles.
- **Critère « à valider » joué** : seul un critère validé rend un scénario jouable.
- **Scénario `@back` joué par l'IHM** : il n'a pas de parcours ; ses critères sont « non vérifiés » côté Agent2Test.
- **Rôle supposé** : jouer un scénario `@role-ADMIN` avec une session qui n'a que le rôle LECTEUR produirait un faux défaut applicatif ; la jouabilité se décide à l'ouverture, d'après `session.roles`.

## 8. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| PL1 | D3.INV-1 | un critère sans scénario est marqué trou de couverture et aucun scénario n'est créé |
| PL2 | D3.INV-2 | deux scénarios `@ECR-77-S02` bloquent l'import ; le message cite les deux lignes |
| PL3 | D3.INV-3 | `@batch-remplissage-modules` donne un préalable de batch ; `@redemarrage` donne « non automatisable » avec son motif |
| PL4 | D3.INV-4 | réimporter des sources inchangées ne crée aucune version ; modifier `us.md` crée `P-<n+1>`, la précédente reste lisible |
| PL5 | D3.INV-5 | un scénario `@propose`, un scénario `@en-attente` et un scénario `@back` seul sont non jouables, chacun avec son motif |
| PL6 | D3.INV-5 | un scénario dont le seul critère est « à valider » est non jouable |
| PL7 | D3.INV-6 | une demande qui cite `ECR-77-CA09`, absent de `us.md`, lève `plan.critere_absent` avant la sélection |
| PL8 | D3.INV-1 | l'exemple ECR-77 d'agent-tdd-jira donne 1 US, 4 critères, 4 scénarios, les étapes du Contexte en tête de chacun, et le rôle LECTEUR requis par chacun |
| PL9 | D3.INV-2 | un `Plan du scénario` à deux lignes d'exemples donne `<CLÉ>-Snn#1` et `#2`, valeurs substituées |
| PL10 | point E1 | un fichier CSV est refusé « format d'entrée non pris en charge » |
| PL11 | D3.INV-1 | le fichier de l'annexe A du cahier d'Agent2Test s'importe tel quel, identifiants `<espace>/<code>` |
| PL12 | D1.INV-5 | une demande « déployer en recette » est refusée « hors périmètre » à l'ouverture |
| PL13 | D3.INV-5 | avec `session.roles` limité à `LECTEUR`, un scénario `@role-ADMIN` est non jouable, motif « rôle ADMIN absent de la session » ; `@role-LECTEUR` porté par la fonctionnalité rend chacun de ses scénarios dépendant de ce rôle |
| PL14 | D3.INV-4 | les empreintes des sources sont celles de `sha256sum` ; l'ouverture retient le commit et les fichiers suivis modifiés relevés par le `scanner` |

## 9. Fichiers à produire

- `src/agents/plan/agent.js`, `src/agents/plan/canonique.js`, `src/agents/plan/versions.js`
- `src/agents/plan/adaptateurs/agent-tdd-jira.js`, `src/agents/plan/adaptateurs/annexe-a.js`, `src/agents/plan/gherkin.js`
- `schemas/plan-canonique.json`
- `test/plan/*.test.js`, `test/fixtures/plans/ECR-77/` (us.md et fichier Gherkin de l'exemple d'agent-tdd-jira)
