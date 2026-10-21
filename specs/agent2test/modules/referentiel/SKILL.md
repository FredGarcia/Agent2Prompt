---
name: referentiel
description: Référentiel d'Agent2Test (fiches des agents cognitifs versionnées, leçons ratifiées en surcouche par moteur, version composée et reconstitution du prompt, liste fermée des règles modifiables et de leurs bornes, épinglage par campagne, application des seules décisions CP-4, retour arrière, grand livre en ajout seul chaîné par empreintes). À implémenter au lot 2.
dimensions: [D15]
status: active
---

# Module `referentiel` (D15)

Le `referentiel` est la mémoire procédurale et réflexive du système : ce qui règle le comportement des agents, et l'histoire de chaque changement. Il applique ; il ne propose ni ne décide.

## 1. Fiches et versions composées (D15.INV-3)

- Une fiche par usage du moteur : `fiches/stratege.md`, `fiches/preparateur.md`, `fiches/reparation.md`, `fiches/scanner.md`, `fiches/apprenant.md`. Chaque fiche porte en frontmatter `code`, `version` et `schemaSortie` (nom du schéma du noyau).
- Les fiches de base vivent dans git et ne sont modifiées que par un humain, par une nouvelle version publiée.
- Les leçons ratifiées sont des surcouches en base, rattachées à une fiche et à un moteur (D13.INV-3).
- Version composée : `<code>@<version>+L<n>`, où `n` est le nombre de leçons actives pour ce moteur, par exemple `preparateur@1.0.0+L2`.
- `fiche(code, moteur)` rend le texte composé : fiche de base, puis leçons actives du moteur, dans l'ordre de ratification.
- Pour chaque appel au moteur, le journal garde la version composée, les identifiants des fragments de mémoire injectés et l'empreinte SHA-256 du prompt rendu. `reconstituer(appel)` refait le prompt à partir de ces éléments ; son empreinte doit égaler celle du journal.

## 2. Épinglage (D15.INV-1)

- À l'E2 de chaque campagne, `epingler(campagne)` fige un instantané : versions composées des fiches, valeurs des règles, empreinte de la constitution, version du plan. L'instantané reçoit un identifiant, `R-<n>`.
- Tous les agents lisent fiches et règles à travers l'instantané de leur campagne, jamais l'état courant.
- Une règle ratifiée pendant une campagne prend effet à la campagne suivante ; l'instantané en cours ne change pas.

## 3. Pouvoirs (D15.INV-4)

| Pouvoir | Qui | Comment |
|---|---|---|
| proposer | `apprenant`, `reflexif` | événements `lecon.candidate`, `proposition.recalibrage` |
| ratifier | un humain, rôle référent qualité | CP-4, depuis le tableau de bord seulement |
| appliquer | `referentiel` | `appliquer(decision)` |
| mesurer | `reflexif` | mesures d'effet après adoption |

`appliquer(decision)` vérifie que la décision vient du point CP-4, du canal `tableau-de-bord` et d'un utilisateur au rôle référent ; sinon, il la refuse `DECISION_IRRECEVABLE`. Le canal MCP ne peut jamais porter une décision CP-4 (D16.INV-2).

## 4. Règles modifiables (D15.INV-5)

Liste fermée, recopiée dans la constitution. Une valeur hors de ses bornes est refusée, en CP-4 comme à l'application.

| Règle | Défaut | Bornes |
|---|---|---|
| `selection.poids.impact`, `.voisinage`, `.criticite`, `.historique`, `.anciennete`, `.instabilite` | 0,5 chacun | entre 0 et 1 ; les paliers P1 et P3 restent hors de portée |
| `budget.reessaiEtape` | 2 | entre 0 et 2 |
| `budget.renvoisSortie` | 3 | entre 0 et 3 |
| `instabilite.seuil` | 10 % | entre 5 % et 30 % |
| `ciblage.ordre` | rôle et nom, libellé, identifiant de test, texte, texte indicatif, CSS | permutation des cinq premières stratégies ; CSS toujours dernière |
| `memoire.k` | 6 | entre 1 et 12 |
| `memoire.seuilSimilarite` | 0,75 | entre 0,5 et 0,95 |
| `quarantaine.scenarios` | aucun | jamais un scénario du palier P1 ; un scénario en quarantaine reste joué et rapporté à part |
| `causes.regles` | table du module `verdict` | les définitions de « réussi » et d'« échoué » restent hors de portée |
| `fiches.lecons` | aucune | une leçon ne contredit pas la constitution ; elle vaut pour un moteur |

Hors de cette liste, rien n'est modifiable par le système : code, constitution, schémas du journal et du grand livre, politiques de sécurité, méta-critères du second ordre, contrats du port moteur et du MCP, configuration humaine (D1.INV-6).

Valeurs fixées par la configuration humaine, que le système lit sans les modifier : budget du palier P2 (45 minutes), budget du relevé dynamique (30 écrans), conservation des preuves (30 jours), langue (français). Méta-critères du second ordre, fixés par la constitution : fenêtre de 10 décisions, exposition minimale de 3, marge de retrait de 15 points.

## 5. Grand livre (D15.INV-2)

- Table `grand_livre` de `referentiel.sqlite`, en ajout seul, protégée par les déclencheurs du module `donnees` (section 5) et chaînée comme le journal (module `journal`, section 1). Sa chaîne est vérifiée en entier à chaque démarrage ; une chaîne rompue empêche le démarrage, et un grand livre rompu ne se répare que par la restauration d'une sauvegarde (module `donnees`, section 7).
- Types d'entrée : `constitution.publiee`, `fiche.publiee`, `lecon.ratifiee`, `lecon.refusee`, `regle.ratifiee`, `regle.refusee`, `regle.suspendue`, `retour.arriere`, `epinglage`.
- Chaque entrée porte sa cause, ses preuves (références au journal), l'auteur de la ratification et, plus tard, l'effet mesuré, ajouté par une nouvelle entrée, jamais par modification.

`revenir(version)` restaure la dernière version ratifiée d'une règle ou d'une leçon, à la demande du `reflexif` (D14.INV-2), et inscrit `retour.arriere`. C'est la seule évolution que le système fasse seul, parce qu'elle va dans le sens sûr.

## 6. Pièges connus

- **Lecture de l'état courant en campagne** : toute lecture passe par l'instantané épinglé.
- **Version composée sans moteur** : une leçon apprise sur Gemini ne figure pas dans la fiche composée pour un modèle local.
- **Modification d'une entrée du grand livre pour y noter l'effet** : l'effet est une entrée nouvelle.

## 7. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| RF1 | D15.INV-1 | une règle ratifiée pendant une campagne ne change pas ses valeurs ; la campagne suivante l'applique |
| RF2 | D15.INV-2 | ratification, refus, suspension et retour arrière s'inscrivent au grand livre ; la chaîne reste intacte |
| RF3 | D15.INV-2 | une entrée modifiée par un outil SQLite, déclencheurs retirés puis remis, rompt la chaîne du grand livre, et le démarrage suivant est refusé avec l'entrée rompue |
| RF4 | D15.INV-3 | pour un appel au moteur journalisé, `reconstituer` redonne un prompt de même empreinte |
| RF5 | D15.INV-3 | une leçon ratifiée crée une version composée nouvelle, `+L<n+1>`, pour son seul moteur |
| RF6 | D15.INV-4 | une décision CP-4 venue du canal MCP, ou d'un rôle testeur, est refusée `DECISION_IRRECEVABLE` |
| RF7 | D15.INV-5 | `instabilite.seuil` à 40 % est refusé ; `ciblage.ordre` qui ne met pas CSS en dernier est refusé |
| RF8 | D15.INV-5 | une proposition qui touche une règle absente de la liste fermée est refusée |

## 8. Fichiers à produire

- `src/agents/referentiel/agent.js`, `src/agents/referentiel/fiches.js`, `src/agents/referentiel/regles.js`
- `src/agents/referentiel/epinglage.js`, `src/agents/referentiel/grand-livre.js`
- `fiches/stratege.md`, `fiches/preparateur.md`, `fiches/reparation.md`, `fiches/scanner.md`, `fiches/apprenant.md`
- `test/referentiel/*.test.js`
