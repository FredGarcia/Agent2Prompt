---
name: migration-angular22
description: Dimension réservée D9, montée de version d'Angular 20 vers Angular 22. Ne pas appliquer en version 1.x du skill ; lire uniquement pour comprendre les points d'extension E1 à E4.
dimensions: [D9]
status: reserved
---

# Module `migration-angular22` (D9, réservé)

Statut : `reserved`. L'expert ne fait pas monter un projet de version d'Angular sur la base de ce module. S'il est sollicité pour le faire, il répond que la dimension n'est pas encore active et propose de l'activer dans une nouvelle version du skill.

## 1. Pourquoi cette dimension existe

Angular 20 est en support long terme, avec une fin de support prévue vers la fin novembre 2026. Angular 22 est la version majeure courante. La montée se fait une version majeure à la fois (20, puis 21, puis 22) avec `ng update`, chaque étape ayant ses propres migrations automatiques.

## 2. Ce que préparent les points d'extension

| Point | Règle active en 1.x | Ce qu'il facilite |
|---|---|---|
| E1 | aucune API dépréciée en 20 n'est introduite | les API dépréciées en 20 sont candidates au retrait dans les versions suivantes |
| E2 | code indépendant de zone.js pour son rafraîchissement | passage à la détection de changement sans zone |
| E3 | modèle de formulaire typé et construction isolée | passage éventuel aux formulaires à signaux, introduits à titre expérimental après la version 20 |
| E4 | tests limités à `TestBed`, harnais et `HttpTestingController` | passage éventuel à Vitest, adopté par défaut par l'outillage Angular après la version 20 |

## 3. Contenu prévu à l'activation

À rédiger quand la dimension passera `active`, après vérification sur la documentation officielle d'Angular et le guide de mise à jour (`angular.dev/update-guide`) :

- procédure par version majeure, avec les migrations automatiques de chaque `ng update` et les vérifications manuelles ;
- statut, en 22, des API utilisées comme expérimentales ou exclues en 1.x (`resource`, `httpResource`, formulaires à signaux, détection sans zone) ;
- nouveaux invariants, par exemple l'activation de la détection de changement sans zone, qui pourra remplacer le point E2 par un invariant plus fort ;
- scénarios de non-régression : lint, tests unitaires, tests de bout en bout avec axe, avant et après chaque étape.

## 4. Test d'inertie en 1.x

Un projet conforme au skill 1.x doit satisfaire, sans rien migrer :

- aucune occurrence de `*ngIf`, `*ngFor`, `*ngSwitch` dans le code nouveau ou modifié (E1, D2.INV-2) ;
- aucune mise à jour d'état affiché qui dépende d'un correctif de zone (E2, point C6 de la grille) ;
- chaque formulaire a un type de modèle et une fonction de construction (E3) ;
- les tests n'utilisent pas d'API propre à Karma (E4).
