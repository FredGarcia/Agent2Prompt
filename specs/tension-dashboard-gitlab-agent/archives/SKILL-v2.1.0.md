---
name: tension-dashboard-gitlab-agent
description: Construire un agent de surveillance des fichiers sous tension (modifiés à la fois localement et à distance) avec delta en caractères, machine d'états, messagerie signée HMAC, tableau de bord Fastify et WebSocket, et assistant GitLab à garde-fous. À utiliser pour produire, étendre ou tester ce système de coordination Git.
version: 2.1.0
---

# Tension Dashboard & Assistant GitLab, spécification 2.1.0

Cette version remplace la 2.0.0, archivée dans `SKILL-v2.md`. Le journal des modifications est en section 18. Le registre des dimensions et le contrat de version sont en section 17.

## 0. Mode de travail (obligatoire)

Vous produisez le code d'un agent à partir de cette spécification. Respectez l'ordre suivant :

1. Lisez l'intégralité de ce document, en commençant par la section 17 (registre des dimensions et contrat de version), avant d'écrire du code.
2. Proposez d'abord le plan de fichiers et les choix d'implémentation non couverts ici. Attendez la validation du développeur.
3. Implémentez par étapes : noyau pur, puis tracker en lecture seule, puis tableau de bord, puis client d'arbitrage, puis assistant GitLab en écriture. Chaque étape doit passer ses tests avant la suivante.
4. En cas d'ambiguïté, posez une question au lieu de supposer. N'inventez ni champs, ni endpoints, ni comportements absents de cette spécification.
5. Les identifiants de code sont en anglais. Les commentaires, les messages destinés au développeur et les journaux sont en français.
6. Chaque module et chaque test cite l'invariant qu'il vérifie, par exemple `// D2.INV-1`. Un invariant sans test n'est pas implémenté.
7. N'implémentez pas les dimensions au statut `reserved` (section 17.1). En 2.1, seuls les points d'extension de la section 17.4 sont à créer, et chacun n'a qu'un test prouvant qu'il est inerte.

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

Le système suit le cycle à sept phases de l'Axiome 7E, dont l'énoncé est : « Les Éléments dans l'Espace Engendrent un État d'Expression Évolutif de l'Environnement ». Chaque phase correspond à un composant, à une suite de tests et à une ou plusieurs dimensions du registre (section 17.1).

| Phase | Composant | Responsabilité | Dimensions |
|---|---|---|---|
| Éléments | `src/core/model.js` | Représentation des fichiers, hunks et classes de fichiers | D1 |
| Espace | `src/git/snapshot.js` | Ancêtre commun, arbre de travail, `origin` | D1 |
| Engendrent | `src/core/tension.js` | Chevauchement et conflit | D1 |
| État | `src/core/states.js`, `src/core/bounds.js` | Niveau par fichier, machine d'états, bornes de configuration | D2 |
| Expression | `src/dashboard/*`, `src/agents/messenger.js`, `src/cli/tension-arbitrer.js` | Tableau de bord, alertes signées, arbitrages | D3, D7 |
| Évolutif | `src/store/*`, `src/core/verdict.js` | Horodatages, volatilité, journal | D5, D6 |
| Environnement | `src/assistant/gitlab.js` | GitLab, pipelines, autres développeurs | D4 |

Récursion : chaque phase peut être un cycle à son propre niveau. Le fichier est le premier niveau à implémenter. Les niveaux du dépôt et de la chaîne d'agents viennent ensuite, en version 3.0 (dimensions D8 à D10).

Clause de second ordre : le tableau de bord influence le comportement du développeur. Le journal enregistre donc, au même niveau que les événements Git, le verdict affiché et l'action choisie par le développeur (D5.INV-1).

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

- Source : `git diff --no-color -U0 <B> <côté>`. Pour le côté local, `<côté>` est l'arbre de travail. Pour le côté distant, `origin/<branche>`.
- Ne compter que les lignes de contenu, celles qui commencent par `+` ou `-`, à l'exclusion de `+++`, `---` et des lignes commençant par `\` (par exemple `\ No newline at end of file`).
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
3. Un seul côté modifié → `mono_cote` (affiché 🟢), quel que soit le fichier, y compris `sensitive` (D1.INV-1).
4. `conflict` ou `binary` ou `sensitive` → `critique` (🔴). Le seuil ne s'applique pas. Un fichier `binary` ou `sensitive` modifié des deux côtés est toujours critique (D1.INV-3).
5. `!overlap` → `stable` (🟢), quel que soit `deltaTotal` (D1.INV-2).
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

Toute transition absente de ce tableau est refusée : journaliser `TRANSITION_REJECTED` et ne rien modifier (D2.INV-1).

Un fichier gelé ne change d'état que par ARBITRAGE ou REMIND (D2.INV-2). L'effecteur ne le modifie jamais, ni dans l'arbre, ni dans les commits qu'il rejoue (D4.INV-2). Le développeur reste libre de l'éditer. Le gel est toujours par fichier, jamais global.

## 7. Verdict de fenêtre de push

Entrée : la liste des fichiers du plan, dans `plan.json` (`{"files": [...], "branch": "..."}`), ou à défaut les fichiers de `git status`.

- 🔴 **Attendre** : au moins un fichier du plan est `critique`, ou une modification distante d'un fichier du plan date de moins de `tStabMin` minutes (10 par défaut).
- 🟡 **Synchroniser d'abord** : au moins un fichier du plan est `modere`, ou une modification distante d'un fichier du plan date de moins de `tVolatileH` heures (24 par défaut).
- 🟢 **Pousser** : dans les autres cas.

La séquence affichée suit cet ordre : intégrer le distant, traiter les fichiers `stable` et `mono_cote`, traiter les `modere`, traiter les `critique` après arbitrage.

Le verdict et la séquence sont journalisés avec l'événement `VERDICT_DISPLAYED`. L'action choisie par le développeur est journalisée avec `DEV_ACTION` (D5.INV-1).

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
- Rejet si `|now − ts| > 300 s`, si le `nonce` a déjà été vu (table `nonces`, purge au-delà de 300 s), ou si la signature ne correspond pas. Comparaison en temps constant avec `crypto.timingSafeEqual`. Un message rejeté est journalisé `MESSAGE_REJECTED` et n'a aucun effet (D3.INV-1).
- Secret : variable d'environnement `TENSION_HMAC_SECRET`, ou fichier en permissions 600. Il n'apparaît jamais dans le dépôt ni dans les journaux (D3.INV-2).
- Champs réservés (point d'extension E2, section 17.4) : `to` et `thread`. En 2.x, un message qui les contient est rejeté et journalisé `UNSUPPORTED_FIELD`.

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

Messages entrants (émis par le client d'arbitrage de la section 13, qui signe avec le même protocole) :

- `ARBITRAGE` avec `choice` égal à `ACCEPT_AGENT` ou `KEEP_DEV`.
- `TRIGGER_MERGE_REQUEST` : répondre par `CONFIRM_REQUIRED` accompagné d'un `confirm_token` à usage unique, valable 5 minutes.
- `TRIGGER_MERGE_CONFIRM` avec le `confirm_token` : seul message qui déclenche la fusion.

Chaque ARBITRAGE valide produit un événement `DEV_ACTION` dans le journal (D7.INV-1).

Le canal est un WebSocket ou un webhook POST, au choix du développeur. Dans les deux cas, l'écoute se fait sur `127.0.0.1` par défaut.

## 9. Assistant GitLab (effecteur)

C'est le seul module autorisé à écrire dans Git ou GitLab. Il n'agit qu'à partir d'un plan validé. Par défaut, il fonctionne en dry-run (D4.INV-4).

### Séquence (dans cet ordre, sans saut)

0. **Pré-vérification** (D4.INV-2) : refuser l'exécution si un fichier au statut `gelé` est modifié dans l'arbre (`git status --porcelain`, `git diff --name-only HEAD`) ou figure dans les commits à rejouer (`git diff --name-only <remote>/<branche>...HEAD`). Message : « arbitrage requis avant exécution ».
1. Vérifier l'état : branche attendue, aucune opération Git en cours (`.git/MERGE_HEAD`, `rebase-merge` et `rebase-apply` absents).
2. Créer la sauvegarde : `git branch backup/<branche>-<horodatage>` au SHA courant.
3. Mettre de côté : si `git status --porcelain` signale des fichiers suivis modifiés, `git stash push -m tension-<horodatage>`. Sinon, ne rien stasher et journaliser `STASH_SKIPPED`. Les fichiers non suivis ne sont pas stashés ; si le rebase les heurte, arrêt.
4. Intégrer le distant : `git pull --rebase <remote> <branche>`. En cas d'échec, `git rebase --abort`, puis signaler sans rien forcer. Le stash reste en place.
5. Réappliquer : si un stash a été créé, `git stash pop`. En cas de conflit, le stash n'est pas supprimé et les fichiers en conflit passent au resolver.
6. Résoudre dans une branche temporaire `fix/tension-<slug>`, créée depuis le HEAD courant (`git switch -c`). Une proposition LLM n'est jamais appliquée sans validation.
7. Lancer `testCmd` (section 12), qui doit réussir avant tout push.
8. Pousser la nouvelle branche : `git push -u <remote> fix/tension-<slug>`.
9. Ouvrir la MR en draft si un fichier était `critique`, sinon une MR normale.

Pourquoi l'étape 0 bloque les fichiers gelés au lieu de les protéger par un stash partiel : `git pull --rebase` exige un arbre propre. La mise de côté porte donc sur l'ensemble des fichiers suivis modifiés. Un fichier gelé ne peut être protégé qu'en amont, par l'arbitrage.

### Garde-fous (non négociables)

- Ne réécrire que les commits locaux non poussés : vérifier `git rev-list <remote>/<branche>..HEAD`. Si un commit à réécrire figure déjà sur `origin`, arrêter (D4.INV-1).
- Aucune fusion automatique dans une branche partagée (`main`, `develop`, ou branche protégée).
- En 2.1, la procédure n'utilise ni `--force` ni `--force-with-lease` (D4.INV-3). Toute utilisation future passe par une dimension dédiée.
- Mode dry-run par défaut : affiche le plan sans l'exécuter. L'exécution réelle exige `--execute` (D4.INV-4).
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
- Pipeline en échec : une relance automatique. Le compteur de relances est lu dans le journal avant toute nouvelle tentative, ce qui l'empêche de se réinitialiser après un redémarrage. Si l'échec persiste : MR en draft, branche conservée, `PLAN_RESULT` avec `next_step` égal à `HUMAN_REVIEW`. Aucun merge automatique, jamais.

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
- Lecture seule : aucune route d'écriture (D3.INV-3). Le dashboard n'envoie aucun arbitrage. Les arbitrages passent par le client `tension-arbitrer` (section 13), qui signe ses messages.
- Colonnes par fichier : niveau (couleur et pictogramme), Δ local et Δ distant en caractères, dernière modification de chaque côté, volatilité (commits distants sur 24 h), recommandation, état de la machine.
- Verdict de fenêtre affiché en tête de page.

## 11. Stockage (SQLite)

Version de schéma : `PRAGMA user_version`. Au démarrage, appliquer dans une transaction les migrations numérotées supérieures à cette valeur, puis l'incrémenter. Une version future ajoute une migration 2, 3, etc. Elle ne modifie jamais une migration existante.

Migration 1 (base 2.1.0) :

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
  spec_version TEXT NOT NULL,
  actor TEXT NOT NULL,   -- ensemble ouvert, section 17.4 (E1)
  action TEXT NOT NULL,
  payload TEXT NOT NULL  -- JSON
);

CREATE TRIGGER journal_no_update BEFORE UPDATE ON journal
BEGIN SELECT RAISE(ABORT, 'journal en ajout seul'); END;

CREATE TRIGGER journal_no_delete BEFORE DELETE ON journal
BEGIN SELECT RAISE(ABORT, 'journal en ajout seul'); END;

CREATE TABLE nonces (
  nonce TEXT PRIMARY KEY,
  seen_at TEXT NOT NULL
);

CREATE TABLE rules (   -- réservée à D9, créée vide, jamais lue en 2.1 (E3)
  name TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  set_at TEXT NOT NULL,
  set_by TEXT NOT NULL
);
```

La table `journal` est en ajout seul, imposé par les triggers et non par convention (D6.INV-1). Chaque événement porte `spec_version`, afin qu'un journal écrit en 2.1 reste rejouable dans toute version 2.x sans réinterprétation (contrat, règle 7 de la section 17.2). Rejouer le journal doit reproduire l'état final (D6.INV-2).

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
  "tVolatileH": 24,
  "sensitive": ["migrations/**", "config/security*"],
  "generated": ["**/*.lock", "dist/**"],
  "testCmd": ["npm", "test"]
}
```

Bornes, déclarées dans `src/core/bounds.js` (point d'extension E4) :

| Clé | Min | Max | Défaut |
|---|---|---|---|
| `seuil` | 150 | 500 | 300 |
| `tStabMin` | 5 | 30 | 10 |
| `tGelMin` | 15 | 120 | 30 |
| `tVolatileH` | 6 | 72 | 24 |
| `fetchIntervalSec` | 30 | 300 | 60 |

- Une valeur hors bornes empêche le démarrage (D2.INV-3). Les bornes ne sont pas lues depuis la configuration.
- `testCmd` est une liste d'arguments exécutée sans shell (`spawn` avec `shell: false`). Une chaîne est refusée.
- Aucun secret ne figure dans ce fichier.

## 13. Agents et répartition

| Agent | Phase | Entrée | Sortie | Écriture autorisée |
|---|---|---|---|---|
| Tracker | Espace, Évolutif | dépôt, `git fetch` | snapshots | aucune sur l'arbre ni sur les branches. `git fetch` met à jour les refs de suivi uniquement (D1, D6) |
| Analyste | État | snapshots | niveaux par fichier, verdict | base SQLite |
| Décideur | État | niveaux, arbitrages | transitions, gel | `states`, `journal` |
| Messager | Expression | transitions | messages signés | `nonces`, `journal` |
| Client d'arbitrage `tension-arbitrer` | Expression | choix du développeur | `ARBITRAGE` signé (D7) | envoi au messager uniquement |
| Resolver | Engendrent | fichiers en conflit | proposition en branche temporaire | branche `fix/tension-*`, après validation |
| Assistant GitLab | Environnement | plan validé | exécution, `PLAN_RESULT` | dépôt et GitLab, selon la section 9 |

Client d'arbitrage (D7) : `tension-arbitrer <fichier> <KEEP_DEV|ACCEPT_AGENT|TRIGGER_MERGE>` envoie un message signé. Pour `TRIGGER_MERGE`, la première commande reçoit `CONFIRM_REQUIRED` et affiche le `confirm_token`. La fusion n'a lieu qu'après `tension-arbitrer --confirm <token>`. Le client lit le secret comme le messager (`TENSION_HMAC_SECRET` ou fichier 600) et ne l'affiche jamais.

Le tracker est en lecture seule sur l'arbre et les branches. Le resolver n'écrit jamais dans la branche de travail sans validation.

## 14. Scénarios de rejeu (suite de tests)

Chaque scénario fournit des objets `file` ou des messages en entrée et attend une sortie exacte. La colonne « Invariant » indique ce que le scénario vérifie.

### 14.1 Classification (D1)

| # | Entrée | Attendu | Invariant |
|---|---|---|---|
| 1 | `generated`, modifié des deux côtés | `exclu` | D1.INV-1 |
| 2 | rien modifié | `calme` | |
| 3 | un seul côté, 1 000 caractères | `mono_cote` | D1.INV-1 |
| 4 | deux côtés, pas de chevauchement, Δ 800 | `stable` | D1.INV-2 |
| 5 | deux côtés, chevauchement, Δ 120, fusion propre | `modere` | |
| 6 | deux côtés, chevauchement, Δ 340, fusion propre | `critique` | |
| 7 | deux côtés, conflit, Δ 10 | `critique` | |
| 8 | `binary`, deux côtés | `critique` | D1.INV-3 |
| 9 | `sensitive`, deux côtés, pas de chevauchement | `critique` | D1.INV-3 |
| 10 | chevauchement, Δ = 300 exactement, fusion propre | `critique` | |
| 11 | chevauchement, Δ = 299, fusion propre | `modere` | |
| 12 | `sensitive`, un seul côté modifié | `mono_cote` | D1.INV-1 |

### 14.2 Transitions (D2)

| # | Séquence d'événements | État final | Invariant |
|---|---|---|---|
| T1 | BOTH_CHANGED, LEVEL_CRITIQUE, ARBITRAGE KEEP_DEV, puis RECONCILED | calme | |
| T2 | BOTH_CHANGED, SYNC_OK, RECONCILED | calme | |
| T3 | BOTH_CHANGED, LEVEL_CRITIQUE, REMIND | gelé (inchangé) | D2.INV-2 |
| T4 | ARBITRAGE sans BOTH_CHANGED préalable | refusé, journal `TRANSITION_REJECTED` | D2.INV-1 |
| T5 | ARBITRAGE TRIGGER_MERGE sans confirmation | refusé | D7.INV-1 |
| T6 | BOTH_CHANGED sur un fichier déjà `gelé` | refusé, journal `TRANSITION_REJECTED` | D2.INV-1 |

### 14.3 Messages (D3)

| # | Entrée | Attendu | Invariant |
|---|---|---|---|
| M1 | signature altérée | rejeté, `MESSAGE_REJECTED`, aucun effet | D3.INV-1 |
| M2 | nonce déjà vu | rejeté, aucun effet | D3.INV-1 |
| M3 | horodatage à plus de 300 s | rejeté, aucun effet | D3.INV-1 |
| M4 | champ `to` présent | rejeté, `UNSUPPORTED_FIELD` | D3.INV-1 |
| M5 | message contenant un secret en clair, après journalisation | le journal et les messages ne contiennent aucune valeur de `TENSION_HMAC_SECRET` | D3.INV-2 |
| M6 | requête `POST` ou `PUT` sur le dashboard | aucune écriture, réponse d'erreur | D3.INV-3 |

### 14.4 Verdict (D5)

| # | Plan | Historique distant | Attendu | Invariant |
|---|---|---|---|---|
| V1 | un fichier critique | aucun | 🔴 | D5.INV-1 |
| V2 | fichier du plan modifié à distance il y a 5 min | récent | 🔴 | D5.INV-1 |
| V3 | fichier `modere` | distant il y a 2 h | 🟡 | D5.INV-1 |
| V4 | fichiers `stable` seulement | aucun depuis 24 h | 🟢 | D5.INV-1 |
| V5 | tout verdict | n'importe lequel | `VERDICT_DISPLAYED` journalisé | D5.INV-1 |

### 14.5 Effecteur (D4)

| # | Situation | Attendu | Invariant |
|---|---|---|---|
| E1 | fichier `gelé` modifié dans l'arbre | refus à l'étape 0, aucune commande d'écriture | D4.INV-2 |
| E2 | plan valide, sans `--execute` | plan affiché, aucune écriture | D4.INV-4 |
| E3 | commit de la plage déjà présent sur `origin` | arrêt | D4.INV-1 |
| E4 | arbre propre | `STASH_SKIPPED`, aucun stash créé | |
| E5 | un échec de pipeline déjà relancé, compteur à 1 dans le journal, redémarrage | aucune seconde relance | |
| E6 | conflit au `stash pop` | stash conservé, fichiers en conflit transmis au resolver | |
| E7 | analyse statique du code de l'effecteur | aucune occurrence de `--force` ni de `--force-with-lease` | D4.INV-3 |

### 14.6 Journal et configuration (D6, D2)

| # | Situation | Attendu | Invariant |
|---|---|---|---|
| J1 | `UPDATE` sur `journal` | refusé par trigger | D6.INV-1 |
| J2 | rejeu deux fois du même journal | mêmes transitions, même état final | D6.INV-2 |
| C1 | `seuil` = 600 au chargement | refus au démarrage | D2.INV-3 |
| C2 | `testCmd` sous forme de chaîne | refus | D2.INV-3 |

### 14.7 Arbitrage (D7)

| # | Situation | Attendu | Invariant |
|---|---|---|---|
| A1 | ARBITRAGE sans signature valide | rejeté, aucun effet | D3.INV-1 |
| A2 | ARBITRAGE valide | événement `DEV_ACTION` journalisé | D7.INV-1 |

Rejeu global : pour un même journal, deux exécutions produisent exactement les mêmes transitions et le même état final (D6.INV-2).

## 15. Critères d'acceptation

- `npm test` passe, sans accès réseau.
- Chaque invariant `Dn.INV-k` de la section 17.3 apparaît dans au moins un test. Un script vérifie cette correspondance.
- Le module `tension.js` n'importe ni `fs`, ni `child_process`, ni aucun module réseau.
- Le serveur n'écoute que sur `127.0.0.1` par défaut.
- Un message à signature invalide, à horodatage hors fenêtre ou à nonce rejoué est rejeté et journalisé.
- Aucun secret n'apparaît dans les journaux, les messages ou le dépôt.
- Aucun `--force` ni `--force-with-lease` dans le code de l'effecteur.
- Le mode dry-run est le défaut de l'effecteur.
- Le journal est en ajout seul, imposé par triggers.
- La migration 1 est appliquée via `PRAGMA user_version`. Une base déjà à jour n'est pas modifiée.
- Les bornes sont validées au démarrage.

## 16. Hors périmètre de cette version

- Résolution sémantique par LLM appliquée automatiquement : interdite. Proposition uniquement, validée par le développeur.
- Plusieurs dépôts simultanés : une instance par dépôt.
- Réécriture de commits déjà poussés : interdite.
- Persistance partagée entre postes : PostgreSQL envisageable plus tard, après validation.
- Communication directe entre agents, régulation de second niveau et rapport de couplage : dimensions D8 à D10, réservées à la version 3.0 (fichier `regulation-inter-agents.md`). Seuls leurs points d'extension existent en 2.1 (section 17.4).

## 17. Versionnage et registre des dimensions

### 17.1 Registre

Une dimension est un axe de la spécification qui peut être activé dans une version, avec ses invariants et ses tests. Le registre indique quand chaque dimension apparaît et ce qu'elle dépend.

| ID | Dimension | Introduite | Statut en 2.1.0 | Dépend de |
|---|---|---|---|---|
| D1 | Tension par fichier (Δ, chevauchement, conflit) | 1.0 | active | |
| D2 | Machine d'états et bornes de configuration | 1.0 | active | D1 |
| D3 | Messagerie signée et tableau de bord en lecture seule | 1.0 | active | D2 |
| D4 | Effecteur GitLab à garde-fous | 2.0 | active | D2, D6 |
| D5 | Verdict de fenêtre et clause de second ordre | 2.0 | active | D1, D2, D6 |
| D6 | Journal en ajout seul et rejeu déterministe | 2.0 | active | |
| D7 | Arbitrage humain par client signé | 2.1 | active | D3, D6 |
| D8 | Communication directe inter-agents | 3.0 | reserved | D3, D6 |
| D9 | Régulation de second niveau (méta-niveau) | 3.0 | reserved | D6, D8 |
| D10 | Rapport de couplage et gestion des interblocages | 3.0 | reserved | D6, D8 |

Statuts : `active` (implémentée et testée), `reserved` (points d'extension posés, fonctionnalité absente), `superseded` (remplacée, voir la version de remplacement).

### 17.2 Contrat de version

1. Chaque version déclare son numéro dans le frontmatter et ajoute au journal de la section 18 une entrée par changement.
2. Une version ajoute au moins une dimension ou un point d'extension. Sinon, c'est un correctif, qui ne change pas le numéro mineur.
3. Une dimension `reserved` ne passe à `active` que si ses invariants ont des tests dans la suite de la version.
4. Une dimension `active` ne sort du registre qu'en passant à `superseded`, avec la version de remplacement et une section de migration.
5. Les invariants ne sont jamais affaiblis. Un invariant peut être remplacé par un invariant plus fort, et le remplacement est signalé dans la section 18.
6. Le schéma SQLite évolue uniquement par migrations numérotées. Une migration existante n'est jamais modifiée.
7. Chaque événement du journal porte `spec_version`. Un journal écrit dans une version reste rejouable dans toute version de la même famille majeure.
8. Avant de publier une nouvelle version, la précédente est archivée sous `SKILL-v<version>.md`. Une archive n'est jamais éditée.

### 17.3 Invariants

Chaque invariant est vérifié par au moins un test (section 15).

- **D1.INV-1** : un fichier modifié d'un seul côté est `mono_cote`, quel que soit son Δ, sauf `generated` (`exclu`).
- **D1.INV-2** : sans chevauchement ni conflit, un fichier n'est jamais `critique`, sauf `binary` ou `sensitive`.
- **D1.INV-3** : un fichier `binary` ou `sensitive` modifié des deux côtés est toujours `critique`.
- **D2.INV-1** : toute transition absente de la table de la section 6 est refusée et journalisée.
- **D2.INV-2** : un fichier `gelé` ne change d'état que par ARBITRAGE ou REMIND.
- **D2.INV-3** : une valeur de configuration hors bornes (section 12) empêche le démarrage.
- **D3.INV-1** : un message dont la signature, l'horodatage ou le nonce est invalide n'a aucun effet.
- **D3.INV-2** : aucun secret n'apparaît dans les messages, les journaux ou le dépôt.
- **D3.INV-3** : le dashboard n'expose aucune route d'écriture.
- **D4.INV-1** : aucun commit déjà présent sur `origin` n'est réécrit.
- **D4.INV-2** : aucun fichier `gelé` n'est modifié par l'effecteur, ni dans l'arbre, ni dans les commits rejoués.
- **D4.INV-3** : la procédure 2.1 n'emploie ni `--force` ni `--force-with-lease`.
- **D4.INV-4** : sans `--execute`, l'effecteur n'écrit rien.
- **D5.INV-1** : chaque verdict affiché et chaque action du développeur sont journalisés.
- **D6.INV-1** : la table `journal` n'accepte ni UPDATE ni DELETE.
- **D6.INV-2** : le rejeu d'un même journal produit exactement le même état final.
- **D7.INV-1** : aucun arbitrage n'est appliqué sans événement `DEV_ACTION` signé correspondant.

### 17.4 Points d'extension réservés en 2.1

Un point d'extension n'est pas une fonctionnalité. En 2.1, il n'a qu'un test qui prouve qu'il est inerte. La version 3.0 l'activera sans réécrire le code existant.

- **E1** : `journal.actor` est un ensemble ouvert. En 2.1, seules les valeurs `tracker`, `analyst`, `decider`, `messenger`, `assistant` et `developer` sont écrites. Les valeurs `meta` et `agent` sont réservées à D8 et D9, et refusées en écriture.
- **E2** : l'enveloppe signée réserve les champs `to` et `thread`. En 2.x, un message qui les porte est rejeté et journalisé `UNSUPPORTED_FIELD`.
- **E3** : la table `rules` est créée vide par la migration 1 et n'est lue par aucun composant en 2.1.
- **E4** : `src/core/bounds.js` déclare les bornes du code. Aucune source de configuration ne peut les modifier.
- **E5** : le dossier `reports/` est réservé à D10. Il n'est pas créé en 2.1.

## 18. Journal de révision

**2.0.0** : spécification de l'agent, de l'effecteur GitLab et du tableau de bord. Archive : `SKILL-v2.md` (sha256 `f477ecaf480db34e…`).

**2.1.0** : versionnage et registre des dimensions (section 17), corrections et ajouts suivants.

- C1, gel et stash : pré-vérification ajoutée à l'étape 0 de la section 9. Le stash ne protège plus les fichiers gelés. Il les bloque en amont (D4.INV-2, scénario E1).
- C2, tracker : la lecture seule est précisée. Seul `git fetch` écrit, et il met à jour les refs de suivi (section 13).
- C3, seuil de volatilité : la valeur codée en dur à 24 h devient le paramètre `tVolatileH`, borné (sections 7 et 12).
- C4, canal d'arbitrage : le client `tension-arbitrer` signé est défini. Il constitue la dimension D7 (sections 10, 13).
- C5, journal : `actor` devient un ensemble ouvert, `spec_version` est ajouté, et les triggers imposent l'ajout seul (section 11).
- C6, migrations : le schéma évolue par `PRAGMA user_version` et des migrations numérotées (section 11).
- C7, stash : aucun stash si l'arbre est propre (`STASH_SKIPPED`). Les fichiers non suivis ne sont pas stashés (section 9).
- C8, relances : le compteur est lu dans le journal, ce qui évite une relance infinie après redémarrage (section 9).
- C9, commande de test : `testCmd` est une liste d'arguments sans shell. Une chaîne est refusée (section 12).
- C10, calcul du delta : les lignes commençant par `\` sont exclues (section 4).
- C11, enveloppe : les champs `to` et `thread` sont réservés et rejetés en 2.x (section 8, point E2).
- Ajouts : registre des dimensions D1 à D10, contrat de version, invariants `Dn.INV-k`, points d'extension E1 à E5, scénarios E1 à E6, J1, J2, C1, C2, A1, A2 et V5 (section 14).
