---
name: apprenant
description: Apprentissage sous gouvernance (leçons candidates tirées de chaque correction ou ajustement commenté à V2, V3, V4 ou V5 et de chaque défaut confirmé par Agent2Test après une acceptation V4, liées à leur fiche, à leur moteur et à leur source, consigne reprise du commentaire humain sans moteur, contrôle des motifs interdits de la constitution avant toute proposition, ratification en CP-4 avant tout effet, leçon valable pour le seul moteur où elle a été apprise). Second ordre, à implémenter au lot 7.
dimensions: [D15]
status: active
---

# Module `apprenant` (D15)

L'`apprenant` transforme les corrections du développeur et les défauts qu'Agent2Test confirme en leçons candidates. Il propose ; il n'applique rien. Une leçon ne touche jamais le texte du skill : ratifiée, elle s'ajoute dans la partie « Leçons ratifiées » du prompt de sa fiche (module `methode`, section 3).

## 1. Sources des leçons (D15.INV-1)

| Source | Fiche visée |
|---|---|
| correction commentée à V2 | `analyse` |
| correction commentée à V3 | `impact` ou `variantes`, selon la partie visée par le commentaire |
| ajustement commenté à V4 | la fiche du pas de reprise que le développeur désigne (`contrat`, `rouge`, `vert`, `remanie`, module `realisation`, section 6) ; sans désignation, `rouge` |
| correction commentée à V5 | `rapport` |
| défaut applicatif confirmé par Agent2Test sur un scénario déjà accepté à V4 | `rouge` : le test n'a pas vu le défaut |

V0 et V1 ne produisent pas de leçon : le profil et l'extraction ne passent pas par le moteur.

```json
{
  "id": "L-7",
  "fiche": "rouge",
  "moteur": "gemini",
  "source": { "point": "V4", "demande": "ECR-77", "cible": "ECR-77-S02", "decision": "DEC-118", "auteur": "fred",
              "commentaire": "le test doit vérifier les trois octets du BOM, pas seulement le premier caractère" },
  "consigne": "le test doit vérifier les trois octets du BOM, pas seulement le premier caractère",
  "statut": "candidate"
}
```

- La consigne reprend le commentaire du développeur tel quel ; pour un défaut confirmé, elle reprend le critère, l'étape échouée et son attendu, tirés de l'entrée du scénario dans le journal de tests. Aucun moteur ne la rédige : le référent peut l'amender en CP-4.
- La leçon est liée à sa fiche, à son moteur, celui qui a produit la sortie corrigée, et à sa source.
- L'événement `lecon.candidate` la porte au tableau de bord, vue gouvernance.

## 2. Contrôle avant proposition (D15.INV-3)

Le contrôle nommé `apprenant.lecon-compatible` confronte la consigne à la liste fermée `leconsInterdites` de la constitution. Chaque motif y est lié à la règle que la leçon contredirait :

```json
{ "leconsInterdites": [
  { "motif": "\\bpush\\b|--force|--no-verify", "regle": "D5.INV-4" },
  { "motif": "@Disabled|\\b[fx](it|describe)\\(|\\.only\\(", "regle": "D9.INV-4" },
  { "motif": "sans (écrire )?(de )?test|code avant le test", "regle": "agent-tdd-jira:D5.INV-1" },
  { "motif": "(sauter|passer|ignorer|valider d'office) (le |la |les )?(V[0-5]|point|question)", "regle": "D12.INV-1" },
  { "motif": "spring-boot:run|démarrer l'application|lancer le batch", "regle": "D6.INV-2" },
  { "motif": "tronquer|résumer (le |la )?(skill|méthode|section)", "regle": "D3.INV-5" }
] }
```

Une leçon qui correspond à un motif n'est pas proposée : elle est consignée « refusée par contrôle », avec le motif et la règle. Le référent reste juge, en CP-4, de ce que la liste ne voit pas.

## 3. Ratification (D15.INV-2)

- Une leçon n'agit qu'après sa ratification en CP-4 par le référent, depuis le tableau de bord ; le `referentiel` l'applique et crée la version composée suivante de sa fiche (D17.INV-5). Elle vaut à partir de la demande suivante (D17.INV-1).
- Une leçon ratifiée ne vaut que pour le moteur sur lequel elle a été apprise. L'étendre à un autre moteur est une ratification distincte, qui crée une leçon sœur rattachée à l'autre moteur.
- Une leçon refusée est conservée avec le motif du refus ; elle n'a aucun effet.

## 4. Actions et événements

| Action | Rôle |
|---|---|
| `lecons(filtre)` | leçons par fiche, moteur, statut |

Événement : `lecon.candidate`.

## 5. Pièges connus

- **Leçon tirée d'une validation sans commentaire** : il n'y a rien à apprendre ; seules les corrections et les ajustements commentés en produisent.
- **Leçon appliquée « en attendant »** : aucune leçon n'agit avant CP-4.
- **Leçon reformulée par le moteur** : elle dirait autre chose que le développeur ; la consigne reste ses mots, que seul le référent amende.

## 6. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| AP1 | D15.INV-1 | un ajustement commenté à V4, avec reprise au pas `vert`, crée une leçon candidate liée à la fiche `vert`, au moteur et à la décision |
| AP2 | D15.INV-1 | une validation sans commentaire ne crée aucune leçon ; une correction à V1 non plus |
| AP3 | D15.INV-1 | un défaut confirmé par Agent2Test sur S04, déjà accepté à V4, crée une leçon candidate pour `rouge`, avec la campagne pour source |
| AP4 | D15.INV-2 | une leçon candidate n'apparaît dans aucune fiche composée avant CP-4 ; ratifiée pendant une demande, elle agit à partir de la suivante |
| AP5 | D15.INV-2 | une leçon ratifiée pour `gemini` n'entre pas dans la fiche composée pour un modèle local ; son extension est une ratification distincte |
| AP6 | D15.INV-3 | la consigne « ajouter @Disabled au test instable » est refusée par `apprenant.lecon-compatible`, avec la règle D9.INV-4, et n'est pas proposée |

## 7. Fichiers à produire

- `src/agents/apprenant/agent.js`, `src/agents/apprenant/lecons.js`, `src/agents/apprenant/compatibilite.js`
- `test/apprenant/*.test.js`
