---
name: tension-dashboard-gitlab-agent
description: Construire un agent de surveillance des fichiers sous tension (modifiés à la fois localement et à distance) avec delta en caractères, machine d'états, messagerie signée HMAC, tableau de bord Fastify et WebSocket, et assistant GitLab à garde-fous. À utiliser pour produire, étendre ou tester ce système de coordination Git.
---

# Tension Dashboard & Assistant GitLab

## 0. Mode de travail (obligatoire)

Vous produisez le code d'un agent à partir de cette spécification. Respectez l'ordre suivant :

1. Lisez l'intégralité de ce document avant d'écrire du code.
2. Proposez d'abord le plan de fichiers et les choix d'implémentation non couverts ici. Attendez la validation du développeur.
3. Implémentez par étapes : noyau pur, puis tracker en lecture seule, puis tableau de bord, puis assistant GitLab en écriture. Chaque étape doit passer ses tests avant la suivante.
4. En cas d'ambiguïté, posez une question au lieu de supposer. N'inventez ni champs, ni endpoints, ni comportements absents de cette spécification.
5. Les identifiants de code sont en anglais. Les commentaires, les messages destinés au développeur et les journaux sont en français.

## 1. Objectif

Donner au développeur, en temps réel, la liste des fichiers sous tension entre ses modifications locales et la branche distante. Pour chaque fichier : le niveau de tension, le delta en caractères de chaque côté, la chronologie des modifications et une recommandation. Le développeur choisit ainsi le meilleur moment pour pousser son travail.

L'agent ne pousse jamais seul vers une branche partagée. Il exécute uniquement des plans validés.

## 2. Stack

- Node.js 20 ou plus récent, ES Modules (`"type": "module"` dans `package.json`).
- Fastify et `@fastify/websocket` pour le tableau de bord.
- SQLite via `better-sqlite3`.
- Git CLI 2.38 ou plus récent (requis par `git merge-tree --write-tree`). Vérifier le format de sortie sur la version installée.
- GitLab REST API v4.
- Tests avec `node:test` et `node:assert/strict`. Aucun test ne doit accéder au réseau : les dépôts de test sont créés dans des répertoires temporaires.

Aucune autre dépendance sans validation.

## 3. Cadre : cycle 7E

Le système suit le cycle à sept phases de l'Axiome 7E, dont l'énoncé est : « Les Éléments dans l'Espace Engendrent un État d'Expression Évolutif de l'Environnement ». Chaque phase correspond à un composant et à une suite de tests.

| Phase | Composant | Responsabilité |
|---|---|---|
| Éléments | `src/core/model.js` | Représentation des fichiers, hunks et classes de fichiers |
| Espace | `src/git/snapshot.js` | Ancêtre commun, arbre de travail, `origin` |
| Engendrent | `src/core/tension.js` | Chevauchement et conflit |
| État | `src/core/states.js` | Niveau par fichier et machine d'états |
| Expression | `src/dashboard/*`, `src/agents/messenger.js` | Tableau de bord et alertes signées |
| Évolutif | `src/store/*`, `src/core/verdict.js` | Horodatages, volatilité, journal |
| Environnement | `src/assistant/gitlab.js` | GitLab, pipelines, autres développeurs |

Récursion : chaque phase peut être un cycle à son propre niveau. Le fichier est le premier niveau à implémenter. Les niveaux du dépôt et de la chaîne d'agents viennent ensuite.

Clause de second ordre : le tableau de bord influence le comportement du développeur. Le journal enregistre donc, au même niveau que les événements Git, le verdict affiché et l'action choisie par le développeur.

## 4. Modèle de données

Pour chaque fichier, à chaque cycle de surveillance :

```
file: string                 chemin relatif à la racine du dépôt
base: string | null          SHA de l'ancêtre commun B
localChanged: boolean        diff B..working tree non vide (commits locaux inclus)
remoteChanged: boolean       diff B..origin/<branche> non vide
deltaLocal: integer          caractères insérés et supprimés, côté local
deltaRemote: integer         caractères insérés et supprimés, côté distant
deltaTotal: integer          deltaLocal + deltaRemote
hunksLocal: [{start, end}]   intervalles de lignes de B
hunksRemote: [{start, end}]  intervalles de lignes de B
overlap: boolean             un hunk local chevauche un hunk distant
conflict: boolean            git merge-tree signale un conflit
binary: boolean
sensitive: boolean           correspond à une glob de `sensitive`
generated: boolean           correspond à une glob de `generated`
```

### Calcul du delta

- Source : `git diff --no-color -U0 <B> <côté>`.
- Ne compter que les lignes de contenu, celles qui commencent par `+` ou `-`, à l'exclusion de `+++` et `---`.
- Retirer le premier caractère (le signe) et le caractère de fin de ligne.
- Compter en points de code Unicode : `[...texte].length`.
- Additionner sur tous les hunks du fichier.
- Pour un fichier binaire, `deltaChars` vaut 0 et `binary` vaut vrai.

### Calcul des hunks

- Chaque en-tête `@@ -a,b +c,d @@` donne un intervalle sur la base : `[a, a + b − 1]` si `b > 0`.
- Si `b = 0` (insertion pure après la ligne `a`), l'intervalle est `[a, a + 1]`.
- Deux intervalles X et Y se chevauchent si `X.start ≤ Y.end + 1` et `Y.start ≤ X.end + 1`. Les hunks adjacents comptent donc comme chevauchement, comme pour Git.

Cas de test :
- `[1,3]` et `[4,5]` : chevauchement (adjacents).
- `[1,3]` et `[5,6]` : pas de chevauchement.
- Insertion après la ligne 3 (`[3,4]`) et `[6,8]` : pas de chevauchement.

### Calcul de la tension

`git merge-tree --write-tree <local> <remote>` : code de sortie 1 en cas de conflit. Extraire la liste des fichiers en conflit depuis la sortie. Un conflit de type modify/delete compte comme conflit.

Le chevauchement de hunks est une estimation rapide. `merge-tree` fait foi pour le champ `conflict`.

## 5. Niveaux de tension

`classify(file, config)` dans `src/core/tension.js` est une fonction pure. Les règles s'évaluent dans cet ordre ; la première qui correspond l'emporte :

1. `generated` → `exclu` (retiré du calcul et de l'affichage de tension).
2. `!localChanged && !remoteChanged` → `calme`.
3. Un seul côté modifié → `mono_cote` (affiché 🟢).
4. `conflict` ou `binary` ou `sensitive` → `critique` (🔴). Le seuil ne s'applique pas.
5. `!overlap` → `stable` (🟢), quel que soit `deltaTotal`.
6. `deltaTotal >= config.seuil` (300 par défaut) → `critique` (🔴).
7. Sinon → `modere` (🟡).

Un fichier de 1 000 caractères modifié dans une zone sans chevauchement reste donc stable. Il n'est pas critique.

## 6. Machine d'états par fichier

États : `calme`, `sous_tension`, `gelé`, `résolu_auto`, `résolu`.

| De | Événement | Garde | Vers | Action |
|---|---|---|---|---|
| calme | BOTH_CHANGED | aucune | sous_tension | journaliser |
| sous_tension | LEVEL_CRITIQUE | level = critique | gelé | geler le fichier pour l'assistant, émettre TENSION_ALERT |
| sous_tension | SYNC_OK | level ∈ {stable, modere} | résolu_auto | journaliser |
| résolu_auto | RECONCILED | aucune | calme | journaliser |
| gelé | ARBITRAGE | choix ∈ {KEEP_DEV, ACCEPT_AGENT} | résolu | appliquer le choix, lever le gel |
| gelé | ARBITRAGE | choix = TRIGGER_MERGE et confirmation valide | résolu | lancer le resolver dans une branche temporaire |
| gelé | REMIND | T_gel écoulé | gelé | émettre un rappel, aucune autre action |
| résolu | RECONCILED | aucune | calme | journaliser |
| tout état | CLEAN | fichier identique des deux côtés | calme | journaliser |

Toute transition absente de ce tableau est refusée : journaliser `TRANSITION_REJECTED` et ne rien modifier.

Un fichier gelé n'est jamais modifié par l'assistant. Le développeur reste libre de l'éditer. Le gel est toujours par fichier, jamais global.

## 7. Verdict de fenêtre de push

Entrée : la liste des fichiers du plan, dans `plan.json` (`{"files": [...], "branch": "..."}`), ou à défaut les fichiers de `git status`.

- 🔴 **Attendre** : au moins un fichier du plan est `critique`, ou une modification distante d'un fichier du plan date de moins de `tStabMin` minutes (10 par défaut).
- 🟡 **Synchroniser d'abord** : au moins un fichier du plan est `modere`, ou une modification distante d'un fichier du plan date de moins de 24 h.
- 🟢 **Pousser** : dans les autres cas.

La séquence affichée suit cet ordre : intégrer le distant, traiter les fichiers `stable` et `mono_cote`, traiter les `modere`, traiter les `critique` après arbitrage.

Le verdict et la séquence sont journalisés avec l'événement `VERDICT_DISPLAYED`. L'action choisie par le développeur est journalisée avec `DEV_ACTION`.

## 8. Messagerie (Agent Messager)

Chaque message est une enveloppe JSON :

```json
{
  "header": { "ts": "2026-10-15T23:10:00Z", "nonce": "b3f1...", "sig": "hex..." },
  "body": { }
}
```

- `sig = HMAC-SHA256(secret, canonicalJSON(body) + ts + nonce)`, en hexadécimal.
- `canonicalJSON` : clés triées récursivement, sans espaces.
- Rejet si `|now − ts| > 300 s`, si le `nonce` a déjà été vu (table `nonces`, purge au-delà de 300 s), ou si la signature ne correspond pas. Comparaison en temps constant avec `crypto.timingSafeEqual`.
- Secret : variable d'environnement `TENSION_HMAC_SECRET`, ou fichier en permissions 600. Il n'apparaît jamais dans le dépôt ni dans les journaux.

Messages sortants :

```json
{
  "event": "TENSION_ALERT",
  "level": "CRITICAL",
  "file": "src/agents/orchestrator.ts",
  "reason": "OVERLAP_AND_DELTA_OVER_THRESHOLD",
  "delta": { "local": "+180 / -40", "remote": "+210 / -30", "total": 460 },
  "timeline": { "last_agent_mod": "...", "last_dev_mod": "..." },
  "recommended_action": "MANUAL_DIFF_REQUIRED"
}
```

Messages entrants :

- `ARBITRAGE` avec `choice` égal à `ACCEPT_AGENT` ou `KEEP_DEV`.
- `TRIGGER_MERGE_REQUEST` : répondre par `CONFIRM_REQUIRED` accompagné d'un `confirm_token` à usage unique, valable 5 minutes.
- `TRIGGER_MERGE_CONFIRM` avec le `confirm_token` : seul message qui déclenche la fusion.

Le canal est un WebSocket ou un webhook POST, au choix du développeur. Dans les deux cas, l'écoute se fait sur `127.0.0.1` par défaut.

## 9. Assistant GitLab (effecteur)

C'est le seul module autorisé à écrire dans Git ou GitLab. Il n'agit qu'à partir d'un plan validé.

### Séquence (dans cet ordre, sans saut)

1. Vérifier l'état : branche attendue, arbre de travail dans l'état attendu, aucune opération Git en cours (`.git/MERGE_HEAD`, `rebase-merge` et `rebase-apply` absents).
2. Créer la sauvegarde : `git branch backup/<branche>-<horodatage>` au SHA courant.
3. Mettre de côté la totalité des modifications : `git stash push -m tension-<horodatage>`.
4. Intégrer le distant : `git pull --rebase <remote> <branche>`. En cas d'échec, `git rebase --abort`, puis signaler sans rien forcer.
5. Réappliquer : `git stash pop`. Si un conflit subsiste, le stash n'est pas supprimé : les fichiers en conflit passent au resolver.
6. Résoudre dans une branche temporaire `fix/tension-<slug>`, créée depuis le HEAD courant (`git switch -c`). Une proposition LLM n'est jamais appliquée sans validation.
7. Lancer `testCmd`, qui doit réussir avant tout push.
8. Pousser la branche temporaire avec `git push -u <remote> fix/tension-<slug>`. Il n'y a pas besoin de `--force`, la branche étant nouvelle.
9. Ouvrir la MR en draft si un fichier était critique, sinon une MR normale.

Pourquoi la totalité des modifications est mise de côté à l'étape 3 : le rebase exige un arbre propre. Un stash partiel des seuls fichiers calmes est donc refusé dès que des fichiers en tension restent modifiés dans l'arbre.

### Garde-fous (non négociables)

- Ne réécrire que les commits locaux non poussés : vérifier `git rev-list <remote>/<branche>..HEAD`. Si un commit à réécrire figure déjà sur `origin`, arrêter.
- Aucune fusion automatique dans une branche partagée (`main`, `develop`, ou branche protégée).
- `--force-with-lease` uniquement, jamais `--force`. Il n'est autorisé que sur une branche personnelle déjà poussée et rebasée.
- Mode dry-run par défaut : affiche le plan sans l'exécuter. L'exécution réelle exige `--execute`.
- Chaque commande Git et chaque appel API est journalisé avant exécution, avec son résultat.
- Restauration documentée dans la sortie : `git reset --hard backup/<branche>-<horodatage>`.
- Aucun secret dans les journaux. Le token ne figure jamais dans une URL de dépôt : utiliser un credential helper ou un en-tête HTTP.
- Un stash qui subsiste après un conflit n'est jamais effacé automatiquement.

### API GitLab v4

- Créer la MR : `POST /projects/:id/merge_requests`. Pour un draft, préfixer le titre par `Draft:`.
- Pipelines d'une MR : `GET /projects/:id/merge_requests/:iid/pipelines`.
- Relance, une seule et automatique : `POST /projects/:id/pipelines/:pipeline_id/retry`.
- Variables : `GITLAB_URL`, `GITLAB_PROJECT_ID`.

Tokens séparés :

- Tracker : `GITLAB_TOKEN_READ`, portée `read_repository`.
- Assistant : `GITLAB_TOKEN_WRITE`, portées `api` et `write_repository`, expiration 30 jours.

Boucle CI/CD :

- Pipeline vert : MR prête, `PLAN_RESULT` envoyé au messager.
- Pipeline en échec : une relance automatique. Si l'échec persiste : MR en draft, branche conservée, `PLAN_RESULT` avec `next_step` égal à `HUMAN_REVIEW`. Aucun merge automatique, jamais.

Rétro-signalement :

```json
{
  "event": "PLAN_RESULT",
  "branch": "fix/tension-orchestrator-delta",
  "mr_iid": 42,
  "mr_state": "draft",
  "pipeline_status": "failed",
  "retries": 1,
  "next_step": "HUMAN_REVIEW"
}
```

## 10. Tableau de bord

- Fastify, à l'écoute sur `127.0.0.1` par défaut (variable `DASHBOARD_HOST`).
- `GET /api/state` : état courant de chaque fichier.
- `WS /ws` : diffusion des changements d'état à chaque cycle.
- Lecture seule dans cette version. Aucune route d'écriture. Les arbitrages passent par le canal messager signé.
- Colonnes par fichier : niveau (couleur et pictogramme), Δ local et Δ distant en caractères, dernière modification de chaque côté, volatilité (commits distants sur 24 h), recommandation, état de la machine.
- Verdict de fenêtre affiché en tête de page.

## 11. Stockage (SQLite)

```sql
CREATE TABLE snapshots (
  id INTEGER PRIMARY KEY,
  file TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('local', 'remote')),
  ts TEXT NOT NULL,
  delta_chars INTEGER NOT NULL,
  hunks INTEGER NOT NULL
);

CREATE TABLE states (
  file TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  level TEXT NOT NULL,
  since TEXT NOT NULL
);

CREATE TABLE journal (
  id INTEGER PRIMARY KEY,
  ts TEXT NOT NULL,
  actor TEXT NOT NULL,   -- tracker | analyst | decider | messenger | assistant | developer
  action TEXT NOT NULL,
  payload TEXT NOT NULL  -- JSON
);

CREATE TABLE nonces (
  nonce TEXT PRIMARY KEY,
  seen_at TEXT NOT NULL
);
```

La table `journal` est en ajout seul : aucun `UPDATE` ni `DELETE`. Rejouer le journal doit reproduire l'état final.

## 12. Configuration

Fichier `config.json`, surchargeable par variables d'environnement :

```json
{
  "repoPath": "/chemin/vers/depot",
  "branch": "feature/ma-branche",
  "remote": "origin",
  "fetchIntervalSec": 60,
  "seuil": 300,
  "tStabMin": 10,
  "tGelMin": 30,
  "sensitive": ["migrations/**", "config/security*"],
  "generated": ["**/*.lock", "dist/**"],
  "testCmd": "npm test"
}
```

Ces valeurs sont les défauts. Aucun secret ne figure dans ce fichier.

## 13. Agents et répartition

| Agent | Phase | Entrée | Sortie |
|---|---|---|---|
| Tracker | Espace, Évolutif | dépôt, `fetch` | snapshots |
| Analyste | État | snapshots | niveaux par fichier, verdict |
| Décideur | État | niveaux, arbitrages | transitions, gel |
| Messager | Expression | transitions | messages signés |
| Resolver | Engendrent | fichiers en conflit | proposition en branche temporaire |
| Assistant GitLab | Environnement | plan validé | exécution, `PLAN_RESULT` |

Le tracker est en lecture seule. Le resolver n'écrit jamais dans la branche de travail sans validation.

## 14. Scénarios de rejeu (suite de tests)

Chaque scénario fournit des objets `file` en entrée et attend une sortie exacte.

| # | Entrée | Attendu |
|---|---|---|
| 1 | `generated`, modifié des deux côtés | `exclu` |
| 2 | rien modifié | `calme` |
| 3 | un seul côté, 1 000 caractères | `mono_cote` |
| 4 | deux côtés, pas de chevauchement, Δ 800 | `stable` |
| 5 | deux côtés, chevauchement, Δ 120, fusion propre | `modere` |
| 6 | deux côtés, chevauchement, Δ 340, fusion propre | `critique` |
| 7 | deux côtés, conflit, Δ 10 | `critique` |
| 8 | `binary`, deux côtés | `critique` |
| 9 | `sensitive`, deux côtés, pas de chevauchement | `critique` |
| 10 | chevauchement, Δ = 300 exactement, fusion propre | `critique` |
| 11 | chevauchement, Δ = 299, fusion propre | `modere` |

Scénarios de transitions :

| # | Séquence d'événements | État final |
|---|---|---|
| T1 | BOTH_CHANGED, LEVEL_CRITIQUE, ARBITRAGE KEEP_DEV, puis RECONCILED | calme |
| T2 | BOTH_CHANGED, SYNC_OK, RECONCILED | calme |
| T3 | BOTH_CHANGED, LEVEL_CRITIQUE, REMIND | gelé (inchangé) |
| T4 | ARBITRAGE sans BOTH_CHANGED préalable | refusé, journal `TRANSITION_REJECTED` |
| T5 | ARBITRAGE TRIGGER_MERGE sans confirmation | refusé |

Scénarios de verdict :

| # | Plan | Historique distant | Attendu |
|---|---|---|---|
| V1 | un fichier critique | aucun | 🔴 |
| V2 | fichier du plan modifié à distance il y a 5 min | récent | 🔴 |
| V3 | fichier `modere` | distant il y a 2 h | 🟡 |
| V4 | fichiers `stable` seulement | aucun depuis 24 h | 🟢 |

Rejeu : pour un même journal, deux exécutions produisent exactement les mêmes transitions et le même état final.

## 15. Critères d'acceptation

- `npm test` passe, sans accès réseau.
- Le module `tension.js` n'importe ni `fs`, ni `child_process`, ni aucun module réseau.
- Le serveur n'écoute que sur `127.0.0.1` par défaut.
- Un message à signature invalide, à horodatage hors fenêtre ou à nonce rejoué est rejeté et journalisé.
- Aucun secret n'apparaît dans les journaux, les messages ou le dépôt.
- Aucun `--force`. `--force-with-lease` seulement dans les cas prévus à la section 9.
- Le mode dry-run est le défaut de l'assistant.
- Le journal est en ajout seul.

## 16. Hors périmètre de cette version

- Résolution sémantique par LLM appliquée automatiquement : interdite. Proposition uniquement, validée par le développeur.
- Plusieurs dépôts simultanés : une instance par dépôt.
- Réécriture de commits déjà poussés : interdite.
- Persistance partagée entre postes : PostgreSQL envisageable plus tard, après validation.
