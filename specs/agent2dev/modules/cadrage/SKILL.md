---
name: cadrage
description: Extraction et analyse d'une demande, points V1 et V2 (extraction du MHTML par le script du skill, résumé V1 rendu depuis demande.json, compléments du développeur avec leur provenance, fiche analyse qui rédige us.md et le fichier Gherkin, écriture par le depot, contrôle par controler-criteres.mjs, questions jamais tranchées par le système, critères prêts pour la réalisation, plan figé après V2). À implémenter au lot 4.
dimensions: [D7]
status: active
---

# Module `cadrage` (D7)

Le cadrage applique les modules `ingestion-jira`, `us-criteres` et `analyse-demande` du skill. Il ne redit pas leurs règles : il les fait appliquer par le script d'extraction, par la fiche `analyse` et par le script de contrôle, puis présente leurs résultats au développeur.

## 1. Extraction et V1 (D7.INV-1)

1. Le développeur donne le fichier MHTML de la demande, enregistré après avoir déplié tous les commentaires (skill, `ingestion-jira`, section 2). En mode parallèle, il le dépose dans `travail/<CLÉ>.mhtml`.
2. L'`executant` lance `extraire-jira` : `demande.json` et les images vont dans le dossier de travail de la demande. Le MHTML est lu en lecture seule ; son empreinte figure dans `demande.json` (`agent-tdd-jira:D1.INV-1`).
3. Le `cadrage` rend le résumé V1 depuis `demande.json`, sans moteur, au format du skill (`ingestion-jira`, section 6) : titre, description, commentaires avec auteurs et dates, pièces incluses et pièces mentionnées absentes, limites, empreinte de la source. En mode parallèle, une clé extraite qui n'est pas celle du worktree est présentée comme écart : les hooks du kit tirent la clé du nom du worktree.
4. V1 : le développeur confirme, ou corrige. Une correction apporte des compléments (un commentaire replié, un champ personnalisé, une pièce jointe) : le `depot` les ajoute à `demande.json` sous `complements`, chacun avec sa provenance (« réponse du développeur, V1 »), comme le skill le prévoit pour une correction manuelle (`ingestion-jira`, section 4), et le résumé est présenté de nouveau (`agent-tdd-jira:D1.INV-2`).

En 1.x, le moteur ne reçoit pas les images : V1 les liste, et la limite « images non lues par le moteur » est déclarée.

## 2. Analyse et V2 (D7.INV-2, D7.INV-3)

La fiche `analyse` (module `methode`, section 3) rédige `us.md` et le fichier Gherkin, en appliquant les sections citées de `us-criteres` et d'`analyse-demande`. Sortie, schéma `fiche.analyse.sortie` :

```json
{
  "fichiers": [
    { "chemin": "docs/demandes/ECR-77/us.md", "contenu": "…" },
    { "chemin": "docs/demandes/ECR-77/ECR-77.feature", "contenu": "…" }
  ],
  "questions": [
    { "id": "Q1", "titre": "comportement au-delà de 10 000 lignes", "exigence": "EX-04", "constat": "…",
      "options": [{ "code": "A", "texte": "exporter les 10 000 premières lignes et prévenir l'utilisateur" }, { "code": "B", "texte": "refuser l'export et demander d'affiner le filtre" }],
      "impact": "ECR-77-S03 reste en attente" }
  ],
  "propositions": ["ECR-77-CA04", "ECR-77-S04"]
}
```

Contrôles nommés :

- `analyse.chemins-de-la-demande` : exactement deux fichiers, `us.md` et `<CLÉ>.feature`, sous `docs/demandes/<CLÉ>/` ;
- `analyse.questions-numerotees` : identifiants `Qn` uniques ; chaque critère « en attente de Qn » de `us.md` cite une question de la sortie ;
- `analyse.questions-sans-reponse-inventee` : une question ouverte à la présentation précédente ne disparaît que si le développeur y a répondu ; une option n'est jamais marquée retenue par le moteur (`agent-tdd-jira:D2.INV-2`).

Déroulé :

1. le `depot` écrit les deux fichiers dans l'arbre de travail (`remplacer` sous `docs/demandes/<CLÉ>/`) ; sans autorisation d'écrire le code, il crée d'abord la copie de travail (module `depot`, section 2) ;
2. l'`executant` lance `controler-criteres` sur `docs/demandes/<CLÉ>`, à la racine de l'arbre de travail, avec `--depuis` le commit qui a ajouté `us.md` quand il existe, pour vérifier qu'aucun identifiant n'a disparu ni changé d'US (skill, `us-criteres`, section 7) ;
3. si le script signale des écarts, ils reviennent au moteur, avec la sortie du script, dans le budget du pas (`budget.tentativesPas`) ; au-delà, le pas s'arrête et V2 présente les écarts restants comme tels ;
4. V2 présente, côte à côte, `us.md`, le tableau des exigences, les questions, le fichier Gherkin et la sortie du script, avec sa ligne « prêts pour la réalisation » (skill, `us-criteres`, sections 6 et 7, et `analyse-demande`, section 7).

Décisions à V2 :

| Décision | Suite |
|---|---|
| valider | le plan est figé (section 3) ; la conception part pour les critères prêts |
| répondre aux questions | les réponses (code d'option ou texte) entrent dans la fiche ; nouvelle analyse, nouveau V2 |
| corriger, commentaire obligatoire | le commentaire entre dans la fiche ; nouvelle analyse, nouveau V2 |
| rejeter la demande | la demande est close « rejetée » ; rien n'est réalisé |

Un critère dont une question reste ouverte n'entre pas en réalisation (`agent-tdd-jira:D10.INV-6`). Le développeur peut répondre plus tard, depuis le tableau de bord : la réponse ouvre une nouvelle analyse à la fin du scénario en cours, jamais au milieu d'un cycle.

## 3. Plan figé (D7.INV-4)

Après V2, le `cadrage` enregistre l'empreinte de `us.md` et du fichier Gherkin. Le `depot` refuse d'écrire ces deux fichiers hors d'une nouvelle analyse, qui repasse par V2. Une modification venue d'ailleurs est une écriture étrangère (module `depot`, section 4). C'est ce plan, tel quel, qu'Agent2Test recevra (module `binome`).

## 4. Pièges connus

- **Extraire par le moteur** : le moteur lirait le MHTML autrement que le script ; seul le script extrait, et le moteur ne reçoit que `demande.json`.
- **Questions résolues en silence** : une option « évidente » choisie par le moteur reste une question ; le contrôle nommé le détecte.
- **Re-analyse au milieu d'un scénario** : une réponse tardive attend la fin du cycle en cours.

## 5. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| CD1 | D7.INV-1 | le MHTML de l'exemple ECR-77 est extrait par le script ; son empreinte est inchangée après l'extraction et figure dans `demande.json` |
| CD2 | D7.INV-1 | le résumé V1 est rendu sans moteur, au format du skill ; aucune analyse ne démarre avant la confirmation |
| CD3 | D7.INV-1 | un complément donné à V1 entre dans `demande.json` avec sa provenance, et le MHTML reste intact |
| CD4 | D7.INV-2 | une sortie dont `us.md` a un critère sans scénario revient au moteur avec la sortie du script ; corrigée, elle passe à V2 |
| CD5 | D7.INV-2 | des écarts qui persistent au-delà du budget sont présentés à V2 comme écarts |
| CD6 | D7.INV-3 | une sortie qui fait disparaître Q1 sans réponse du développeur est refusée par `analyse.questions-sans-reponse-inventee` |
| CD7 | D7.INV-3 | après la réponse « A » à Q1, la nouvelle analyse passe CA03 au statut validé, et V2 est présenté de nouveau |
| CD8 | D7.INV-4 | après V2, une écriture du `depot` dans `us.md` hors d'une nouvelle analyse est refusée |
| CD9 | D7.INV-2 | sur l'exemple ECR-77, la sortie simulée donne « prêts pour la réalisation : CA01, CA02, CA04 ; en attente : CA03 (Q1) » |
| CD10 | D7.INV-1 | en mode parallèle, un fichier MHTML d'ECR-78 déposé dans le worktree `ECR-77` est présenté comme écart à V1 |
| CD11 | D7.INV-2 | une nouvelle analyse après le premier commit lance `controler-criteres` avec `--depuis` ; un critère renuméroté y est un écart |

## 6. Fichiers à produire

- `src/agents/cadrage/agent.js`, `src/agents/cadrage/extraction.js`, `src/agents/cadrage/analyse.js`, `src/agents/cadrage/presentation.js`
- `schemas/fiche.analyse.sortie.json`
- `test/cadrage/*.test.js`, `test/fixtures/demandes/ECR-77.mhtml`, `test/fixtures/moteur/analyse/`
