---
name: remise
description: Dimension réservée D9 (remise des tickets capturés d'une catégorie à agent-tdd-jira ou à Agent2Dev, à partir de rapport.json, sans relire les pages ; point d'extension E1). Ne pas appliquer en 1.x.
dimensions: [D9]
status: reserved
---

# Module `remise` (D9, réservé)

Phase 7E couverte : Évolutif.

## Intention

Les fichiers capturés sont des MHTML de Chrome, ceux que lit l'ingestion d'`agent-tdd-jira`, qui ne les modifie jamais (`agent-tdd-jira:D1.INV-1`). D9 remettra à cette ingestion, ou à Agent2Dev, les tickets d'une catégorie choisie par le développeur, par exemple `ticket avec ia`, dans l'ordre du rapport, sans relire les pages ni déplacer les fichiers.

## Ce qui existe déjà en 1.0.0

Le point d'extension E1 : `rapport.json` a des champs stables (module `classement`, § 6). Une remise y lira `tickets[].file` et `tickets[].category`, et écartera les tickets en erreur ou à classer.

## Ce qui reste à décider

- La forme de la remise : liste de fichiers pour l'ingestion d'`agent-tdd-jira`, ou dossier d'échange d'Agent2Dev.
- Le contrôle du développeur avant la remise de chaque catégorie.
