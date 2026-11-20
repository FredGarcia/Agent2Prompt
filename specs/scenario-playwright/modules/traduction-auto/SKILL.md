---
name: traduction-auto
description: Dimension réservée D11 (traduction sans IA du texte de départ en scénario TOML, par un catalogue de phrases fermé, celui des phrases conseillées du module texte ; les phrases hors du catalogue restent à l'IA et à la ratification). Ne pas appliquer en 1.x.
dimensions: [D11]
status: reserved
---

# Module `traduction-auto` (D11, réservé)

Phase 7E couverte : Évolutif.

## Intention

En 1.0, l'IA traduit les phrases du texte, sur un squelette produit sans IA, et le développeur ratifie (module `scenario`, § 4). D11 traduira sans IA les phrases d'un catalogue fermé, celui des phrases conseillées du module `texte`, § 9 : « je clique sur le bouton « X » » donnera toujours `cliquer` sur `{ role = "button", nom = "X" }`. Une phrase hors du catalogue restera à compléter, par l'IA ou le développeur, et la ratification restera nécessaire pour l'ensemble.

## Ce qui existe déjà en 1.0.0

- Le squelette sans IA et le contrôle sans IA de la traduction (D3.INV-3 à D3.INV-5).
- La table des phrases conseillées, qui fixe déjà la traduction attendue de chaque forme.

## Ce qui reste à décider

- La grammaire du catalogue : formes exactes, variantes admises, guillemets français ou droits.
- La place des phrases traduites sans IA dans le plan de ratification : marquées comme telles, ou ratifiées comme les autres.
