---
name: agents-sonar
description: Dimension réservée D7, accès à SonarQube par le serveur MCP et articulation avec les produits agentiques de Sonar (suggestions de correction, agent de remédiation). Ne pas appliquer en version 1.x du skill ; lire uniquement pour comprendre le point d'extension E1.
dimensions: [D7]
status: reserved
---

# Module `agents-sonar` (D7, réservé)

Statut : `reserved`. En version 1.x, l'expert accède à SonarQube uniquement par l'API web et le jeton du compte Sonar (module `cadrage-acces`).

## 1. Pourquoi cette dimension existe

SonarQube Server 2026 propose un serveur MCP qui permet à un agent d'interroger l'instance, des suggestions de correction assistées par IA, et, en 2026.5, des produits agentiques déployables dans l'infrastructure de l'organisation, avec un fournisseur de modèle choisi par l'administrateur. Ces outils recouvrent une partie des missions de ce skill : il faudra décider qui fait quoi.

## 2. Ce que prépare le point d'extension

**E1** : tout accès à SonarQube passe par le catalogue d'appels du module `cadrage-acces`. Le jour où l'accès se fera par le serveur MCP, chaque ligne du catalogue sera associée à l'outil MCP équivalent, sans changer les modules `triage`, `correction` ni `gouvernance`.

## 3. Contenu prévu à l'activation

- correspondance entre le catalogue d'appels et les outils du serveur MCP, vérifiée sur la version de l'instance ;
- règles de coexistence avec un agent de remédiation de Sonar : une suggestion produite par un outil Sonar reste soumise aux invariants des référentiels et à la validation du développeur ;
- confidentialité : où partent le code et les constats, selon le fournisseur de modèle configuré par l'organisation.

## 4. Test d'inertie en 1.x

Aucun appel à SonarQube hors du catalogue du module `cadrage-acces` (E1).
