---
name: accessibilite
description: Dimension réservée D14 (audit d'accessibilité des pages parcourues par un scénario, constats rattachés aux étapes, sans exécuter de code de l'audit dans la page tant qu'une règle ne l'autorise pas). Ne pas appliquer en 1.x.
dimensions: [D14]
status: reserved
---

# Module `accessibilite` (D14, réservé)

Phase 7E couverte : Évolutif.

## Intention

Un scénario parcourt les pages comme un utilisateur ; D14 y ajoutera un audit d'accessibilité, page par page ou à la demande d'une étape, avec des constats rattachés aux étapes du rapport.

## Ce qui existe déjà en 1.0.0

- Des cibles désignées par rôle et nom accessible, qui échouent quand un élément n'est pas nommé pour les lecteurs d'écran (module `cibles`).
- L'instantané ARIA de la page à chaque échec (module `preuves`).

## Ce qui reste à décider

- L'outil de l'audit : un audit qui s'exécute dans la page contredit D5.INV-1 ; il faudra une règle propre, ou un audit fondé sur l'arbre d'accessibilité seul.
- Le référentiel : RGAA, WCAG, ou les règles d'accessibilité du socle back-front.
