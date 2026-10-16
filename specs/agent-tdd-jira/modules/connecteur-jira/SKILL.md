---
name: connecteur-jira
description: Dimension réservée D8, lecture de la demande directement dans Jira (API REST ou serveur MCP) à la place du fichier MHTML. Ne pas appliquer en version 1.x du skill ; lire uniquement pour comprendre le point d'extension E1.
dimensions: [D8]
status: reserved
---

# Module `connecteur-jira` (D8, réservé)

Statut : `reserved`. En version 1.x, la seule entrée est un fichier MHTML enregistré par le développeur.

## 1. Pourquoi cette dimension existe

Le MHTML a deux défauts : il dépend de la mise en page de Jira, et il ne contient que ce qui était affiché au moment de l'enregistrement (commentaires repliés, pièces jointes absentes). Une lecture par l'API de Jira, ou par un serveur MCP Atlassian, donnerait des champs structurés, tous les commentaires et les pièces jointes.

## 2. Ce que prépare le point d'extension

**E1** : l'analyse ne lit que `demande.json` (schéma version 1). Un connecteur produira le même fichier, avec les mêmes champs, à partir de l'API. Les modules `analyse-demande` à `tracabilite` ne changeront pas.

## 3. Contenu prévu à l'activation

- correspondance entre les champs de l'API de Jira (Cloud et Data Center) et le schéma de `demande.json` ;
- authentification : jeton personnel en variable d'environnement, jamais affiché, en lecture seule ;
- règle maintenue : l'agent n'écrit pas dans Jira, même si le jeton le permettrait.

## 4. Test d'inertie en 1.x

Aucun module d'analyse ne lit le fichier MHTML directement ; tous lisent `demande.json` (E1).
