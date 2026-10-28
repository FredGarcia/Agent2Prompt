---
name: pilotage
description: Dimension réservée D10 (pilotage de la capture par un autre outil, par exemple GeminiBoard pour Gemini CLI ou un service MCP, à partir de la fonction captureSprintTickets du module commun ; point d'extension E2). Ne pas appliquer en 1.x.
dimensions: [D10]
status: reserved
---

# Module `pilotage` (D10, réservé)

Phase 7E couverte : Évolutif.

## Intention

Le développeur prévoit d'intégrer le skill à Gemini CLI depuis GeminiBoard. D10 permettra à un autre outil de lancer et de suivre une capture sans la page de l'interface : GeminiBoard, une commande Gemini CLI, ou un service MCP.

## Ce qui existe déjà en 1.1.0

- Le point d'extension E2 : `captureSprintTickets(context, page, options)` est une fonction du module commun, qui signale son avancement par `onProgress` et rend le rapport. L'interface et la ligne de commande n'en sont que deux appelants.
- L'API HTTP de l'interface (module `interface`, § 2), que l'agent `capteur-sprint` pilote déjà.

## Ce qui reste à décider

- Le canal : commande TOML de Gemini CLI qui appelle l'API HTTP, extension de projet de GeminiBoard, ou service MCP.
- La connexion SSO, qui reste faite à la main dans une fenêtre visible, quel que soit l'appelant (D2.INV-1).
