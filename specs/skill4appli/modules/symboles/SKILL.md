---
name: symboles
description: Dimension réservée D9, symboles par langue (classes, interfaces, méthodes, fonctions exportées, routes et composants, extraits par expressions régulières ou par universal-ctags s'il est présent, table symbols, carte du projet à faible coût pour un agent). Ne pas implémenter en 1.x ; lire seulement pour comprendre le point d'extension E2.
dimensions: [D9]
status: reserved
---

# Module `symboles` (D9, réservé)

Statut : `reserved`. En 1.0.0, la base contient les fichiers et leur texte, pas leur structure.

## 1. Pourquoi cette dimension existe

Pour s'orienter dans un projet, un agent n'a pas besoin du texte des fichiers : la liste des classes, des méthodes et des routes, avec leur emplacement, lui suffit et coûte beaucoup moins de contexte. La version d'origine annonçait « la structure du code » ; la version 1.0.0 en donne l'inventaire et le texte, D9 en donnerait la carte.

## 2. Principe prévu

- Une table `symbols` (`path`, `name`, `kind`, `line`, `signature`), écrite par l'ingestion et par le watcher dans la même transaction que les fichiers.
- Extraction par langue, d'après `app_structure.lang` :
  - Java et Kotlin : classes, interfaces, enregistrements, méthodes publiques, annotations de route `@GetMapping`, `@PostMapping`, `@RequestMapping` ;
  - TypeScript et JavaScript : classes, fonctions et constantes exportées, composants Angular et leur sélecteur ;
  - Vue : nom du composant ; Python : `class`, `def` ; PHP : classes et fonctions.
- Expressions régulières sans dépendance par défaut ; `universal-ctags`, s'il est installé, en option, jamais exigé.
- Une commande `symbols` qui rend la carte d'un dossier ou d'un fichier, bornée comme les autres réponses.

## 3. Ce que prépare le point d'extension

| Point | Règle active en 1.x |
|---|---|
| E2 | chaque fichier porte sa langue (`app_structure.lang`), déduite de son extension ou de son nom |

## 4. Test d'inertie en 1.x

T24 du module `recette` : aucune table `symbols`, et `symbols` est une commande inconnue (code 1).
