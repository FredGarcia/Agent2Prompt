---
name: comparaison
description: Dimension réservée D11, comparaison de deux instantanés dans le temps (usage visé, place posée par le point d'extension E2, commande comparer réservée, ce que la comparaison devra respecter). À lire seulement pour comprendre le point d'extension E2 ; ne pas appliquer en 1.x.
dimensions: [D11]
status: reserved
---

# Module `comparaison` (D11, réservée)

Phase 7E couverte : Évolutif.

## 1. Usage visé

« Hier, ce skill s'activait ; aujourd'hui, non. » Expliquer un changement de comportement demande de comparer deux états de l'installation. D11 comparera deux instantanés enregistrés par le développeur, et nommera ce qui a changé : version de l'hôte, couche et valeur d'un réglage, confiance, fichiers de contexte, composants apparus, disparus, masqués ou ignorés.

## 2. Place réservée

- Chaque objet porte déjà `schema`, `version` et `date`, et ses clés ont un sens stable pour un même numéro de schéma (point d'extension E2).
- La commande `comparer` est réservée : elle sort avec le code 1, sans rien lire (D1.INV-2). La recette vérifie cette inertie (T1).

## 3. Ce que la comparaison devra respecter

- Le script ne fait que lire (D1.INV-1) : les deux instantanés seront des fichiers que le développeur aura écrits lui-même, par redirection de la sortie.
- Aucune valeur secrète ne sortira de la comparaison, pas plus que des instantanés (D8.INV-1).
- Deux instantanés de schémas différents ne se comparent pas : la commande le dira.
