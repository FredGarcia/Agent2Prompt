# Agent2Prompt

Spécifications d'agents écrites pour être transmises, en texte seul, à une IA de développement qui construit elle-même le code.

Chaque spécification est un package modulaire versionné : un point d'entrée, un manifeste, un module par dimension, des invariants testables et des points d'extension pour les versions futures. Pour la transmettre, on l'assemble en un texte unique que l'IA reconstruit à l'identique avant d'implémenter.

## Spécifications

| Spécification | Version | Transmission | Objet |
|---|---|---|---|
| [`tension-dashboard-gitlab-agent`](specs/tension-dashboard-gitlab-agent/SKILL.md) | 2.2.0 | [`transmissions/tension-dashboard-gitlab-agent-2.2.0.md`](transmissions/tension-dashboard-gitlab-agent-2.2.0.md) | Fichiers sous tension entre local et distant, tableau de bord temps réel, assistant GitLab à garde-fous |

## Structure du dépôt

```
Agent2Prompt/
├── README.md
├── EVOLUTION.md                 principe d'évolution des structures
├── CHANGELOG.md                 historique de toutes les versions
├── specs/
│   └── <nom>/
│       ├── SKILL.md             point d'entrée : registre, contrat, invariants
│       ├── manifest.json        modules, statuts, version
│       ├── ENTETE-TRANSMISSION.md   consigne donnée à l'IA
│       ├── modules/<id>/SKILL.md    un module par dimension
│       └── archives/SKILL-vX.Y.Z.md versions antérieures figées
├── transmissions/
│   └── <nom>-X.Y.Z.md           texte unique remis à l'IA, une par version
└── tools/
    └── bundle.py                assemblage d'une transmission
```

## Transmettre une spécification

Coller le contenu du fichier de `transmissions/` dans l'IA du développeur. Aucune pièce jointe n'est nécessaire. Le texte contient :

1. la consigne : matérialiser la spécification dans `spec/`, la lire, proposer un plan, attendre la validation, implémenter par étapes ;
2. chaque fichier de la spécification entre `<<<FICHIER chemin>>>` et `<<<FIN chemin>>>` ;
3. une table sha256 pour vérifier la reconstruction (`sha256sum -c`).

## Générer une transmission

```bash
python3 tools/bundle.py specs/tension-dashboard-gitlab-agent
```

Le script lit `manifest.json`, écrit `transmissions/<nom>-<version>.md` et échoue si le texte ne redonne pas exactement chaque fichier. Il n'utilise que la bibliothèque standard de Python 3.

## Faire évoluer une spécification

Voir [`EVOLUTION.md`](EVOLUTION.md) : unités de structure, cycle de vie d'une dimension (`reserved`, `active`, `superseded`), contrat de version, procédure de publication. L'historique complet est dans [`CHANGELOG.md`](CHANGELOG.md) et dans `git log`, où chaque version de spécification a son propre commit.
