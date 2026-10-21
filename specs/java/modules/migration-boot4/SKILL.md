---
name: migration-boot4
description: Dimension réservée D8, migration vers Spring Boot 4.x et Java 25. Ne pas appliquer en version 1.x du skill ; lire uniquement pour comprendre les points d'extension E1 à E4.
dimensions: [D8]
status: reserved
---

# Module `migration-boot4` (D8, réservé)

Statut : `reserved`. Cette dimension n'est pas appliquée en version 1.x. L'expert ne migre pas un projet vers Spring Boot 4 ou Java 25 sur la base de ce module ; s'il est sollicité pour le faire, il répond que la dimension n'est pas encore active et propose de l'activer dans une nouvelle version du skill.

## 1. Pourquoi cette dimension existe

La branche Spring Boot 3.5 n'a plus de support open source depuis le 30 juin 2026 (un support commercial existe). Les branches 4.0 et 4.1 sont celles qui reçoivent des correctifs open source, avec Java 17 au minimum et Java 25 comme version LTS la plus récente prise en charge. La migration est donc la prochaine dimension à révéler.

## 2. Ce que préparent les points d'extension

| Point | Règle active en 1.x | Ce qu'il évite lors de la migration |
|---|---|---|
| E1 | aucune API dépréciée introduite ; propriétés renommées signalées | les API dépréciées en 3.x sont les premières supprimées en 4.x |
| E2 | personnalisation de Jackson isolée dans une seule classe | Spring Boot 4 adopte Jackson 3 par défaut, dont les packages changent : un seul fichier à adapter au lieu de tout le code |
| E3 | `@MockitoBean` au lieu de `@MockBean` | `@MockBean` est déprécié depuis Boot 3.4 et destiné à être retiré |
| E4 | versions hors BOM centralisées | montée de version de toutes les dépendances en un seul endroit |

## 3. Contenu prévu à l'activation

À rédiger quand la dimension passera `active`, avec vérification sur la documentation officielle de la version visée :

- inventaire des écarts entre Spring Boot 3.5 et la version 4.x visée (Spring Framework 7, Jakarta EE 11, Jackson 3, modularisation des auto-configurations) ;
- procédure par étapes : 3.5 à jour, suppression des dépréciations, passage à 4.0, puis 4.x ; Java 21 puis Java 25 ;
- nouveaux invariants, par exemple sur les threads virtuels (le problème d'épinglage de D2.INV-3 ne se pose plus à partir de Java 24, ce qui permettra de remplacer cet invariant par un invariant plus fort sur la concurrence) ;
- scénarios de test de non-régression avant et après migration.

## 4. Test d'inertie en 1.x

Un projet conforme au skill 1.x doit satisfaire, sans rien migrer :

- compilation sans nouvel avertissement de dépréciation introduit par le code du projet (E1) ;
- un seul fichier contient une personnalisation de Jackson (E2) ;
- aucune occurrence de `MockBean` ou `SpyBean` (E3, contrôlé par D6.INV-3) ;
- les versions hors BOM sont toutes des propriétés du build (E4).
