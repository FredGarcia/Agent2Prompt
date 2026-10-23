---
name: local
description: Dimension réservée D8, modifications non commitées du worktree source superposées au miroir (couche locale tenue par scrutation de git status, recherche qui préfère la couche locale au miroir, sans jamais toucher ni au miroir ni à la source). Ne pas implémenter en 1.x ; lire seulement pour comprendre le point d'extension E1.
dimensions: [D8]
status: reserved
---

# Module `local` (D8, réservé)

Statut : `reserved`. En 1.0.0, le mode `miroir` indexe l'état commité de la branche courante ; les modifications non commitées du worktree source sont seulement listées par `status`.

## 1. Pourquoi cette dimension existe

Un agent qui développe travaille surtout sur des fichiers pas encore commités. En mode `miroir`, la base les ignore : l'agent doit les relire sur le disque, ce que la règle « la base localise, le disque fait foi » exige déjà, mais une recherche ne les trouve pas. En mode `travail`, la base les voit, mais perd l'état commité de référence. D8 réunirait les deux.

## 2. Principe prévu

- Une couche locale, séparée du miroir, qui contient les fichiers modifiés, ajoutés ou supprimés dans le worktree source par rapport au commit indexé, tenue à jour par la même scrutation que le watcher (`git status --porcelain -z`, puis taille et date des fichiers listés).
- `search` et `query` liraient la couche locale avant le miroir, et chaque résultat dirait de quelle couche il vient.
- La couche locale ne touche ni au miroir ni au worktree source ; elle se vide quand les modifications sont commitées, puisque le miroir les rejoint.

## 3. Ce que prépare le point d'extension

| Point | Règle active en 1.x |
|---|---|
| E1 | `status`, en mode `miroir`, rend `modifications_locales` : statut et chemin de chaque fichier non commité du worktree source |

## 4. Test d'inertie en 1.x

T24 du module `recette` : le schéma ne contient aucune table de couche locale.
