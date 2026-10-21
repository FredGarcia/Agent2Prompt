---
name: apprenant
description: Apprentissage sous gouvernance (leçons candidates tirées de chaque correction ou rejet commenté en CP-1, CP-2 ou CP-3, liées à leur fiche, à leur moteur et à leur décision source, ratification en CP-4 avant tout effet, leçon valable pour le seul moteur où elle a été apprise, rédaction facultative par le moteur). Second ordre, à implémenter au lot 6.
dimensions: [D13]
status: active
---

# Module `apprenant` (D13)

L'`apprenant` transforme les corrections humaines en leçons candidates. Il propose ; il n'applique rien.

## 1. Leçons candidates (D13.INV-1)

À chaque `point.decide` de CP-1, CP-2 ou CP-3 dont la décision est une correction ou un rejet commenté, l'`apprenant` crée une leçon candidate :

```json
{
  "id": "L-31",
  "fiche": "preparateur",
  "moteur": "gemini",
  "decisionSource": { "point": "CP-2", "campagne": "C-20261021-001", "auteur": "testeur", "commentaire": "le bouton s'appelle « Exporter en CSV », pas « Exporter »" },
  "consigne": "Pour un bouton d'export, reprendre le libellé exact de l'instantané ARIA, avec son complément.",
  "statut": "candidate",
  "origine": { "redigePar": "apprenant", "moteur": null }
}
```

- La consigne reprend le commentaire humain. Quand la configuration l'active, la fiche `apprenant` peut la reformuler ; la sortie est validée et marquée comme production du moteur.
- La leçon est liée à sa fiche, à son moteur et à sa décision source.
- L'événement `lecon.candidate` la porte au tableau de bord, vue gouvernance.

## 2. Ratification (D13.INV-2, D13.INV-3)

- Une leçon n'entre dans une fiche qu'après sa ratification en CP-4 par le référent qualité ; le `referentiel` l'applique et crée la version composée suivante (D15.INV-3).
- Une leçon ratifiée ne vaut que pour le moteur sur lequel elle a été apprise. L'étendre à un autre moteur est une ratification distincte, qui crée une leçon sœur rattachée à l'autre moteur.
- Une leçon candidate refusée est conservée avec le motif du refus ; elle n'a aucun effet.

## 3. Actions et événements

| Action | Rôle |
|---|---|
| `lecons(filtre)` | leçons par fiche, moteur, statut |

Événement : `lecon.candidate`.

## 4. Pièges connus

- **Leçon tirée d'une validation sans commentaire** : il n'y a rien à apprendre ; seules les corrections et les rejets commentés en produisent.
- **Leçon appliquée « en attendant »** : aucune leçon n'agit avant CP-4.

## 5. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| AP1 | D13.INV-1 | une correction commentée en CP-2 crée une leçon candidate liée à la fiche `preparateur`, au moteur et à la décision |
| AP2 | D13.INV-1 | une validation sans commentaire ne crée aucune leçon |
| AP3 | D13.INV-2 | une leçon candidate n'apparaît dans aucune fiche composée avant sa ratification en CP-4 |
| AP4 | D13.INV-3 | une leçon ratifiée pour `gemini` n'entre pas dans la fiche composée pour un modèle local ; son extension est une ratification distincte |

## 6. Fichiers à produire

- `src/agents/apprenant/agent.js`, `src/agents/apprenant/lecons.js`
- `test/apprenant/*.test.js`
