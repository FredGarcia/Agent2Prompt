---
name: profil-recette
description: Dimension réservée D20, profil recette et profil conteneur (environnement de recette partagé, navigateur sans tête dans l'image Playwright officielle, session importée par la stratégie etat, nettoyage des données préfixées, exécutions répétées). Ne pas implémenter en 1.x ; lire seulement pour comprendre les points d'extension E3 et E4.
dimensions: [D20]
status: reserved
---

# Module `profil-recette` (D20, réservé)

Statut : `reserved`. En 1.x, tout s'exécute en local, contre l'application lancée sur le poste du développeur ; seul l'environnement de développement est déployable par l'équipe, et il l'est à la main.

## 1. Pourquoi cette dimension existe

Le dossier de conception prévoyait que le même kit cible le développement ou la recette par simple changement de profil, et qu'un profil conteneur exécute les campagnes sans tête. Ces deux usages attendent que la recette soit accessible à Agent2Test.

## 2. Principe prévu

- Profil `recette` : URL et origines de l'environnement de recette ; données partagées, donc préfixe de campagne et parcours de nettoyage obligatoires ; une campagne à la fois.
- Profil `conteneur` : service Compose fondé sur l'image Playwright officielle, sans tête, `network_mode: host`.
- Stratégie de session `etat` : cookies, `localStorage`, IndexedDB et, si le jeton y réside, `sessionStorage`, importés depuis une session établie par l'opérateur ; même protection que le profil de session (D4.INV-3).

## 3. Ce que préparent les points d'extension

| Point | Règle active en 1.x |
|---|---|
| E3 | les profils `recette` et `conteneur` sont refusés au démarrage, motif « profil réservé » |
| E4 | la stratégie de session `etat` est refusée au démarrage |

## 4. Tests d'inertie en 1.x

Les scénarios IN5 du module `exploitation` et NA12 du module `navigateur`.
