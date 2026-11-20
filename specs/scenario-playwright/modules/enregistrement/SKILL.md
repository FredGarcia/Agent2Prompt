---
name: enregistrement
description: Dimension réservée D15 (enregistrement des gestes du développeur dans la fenêtre en texte de départ et en scénario, à ratifier, à partir de la désignation et des cibles). Ne pas appliquer en 1.x.
dimensions: [D15]
status: reserved
---

# Module `enregistrement` (D15, réservé)

Phase 7E couverte : Évolutif.

## Intention

Le développeur fera une fois, dans la fenêtre, les gestes d'un parcours ; D15 les enregistrera en texte de départ et en scénario, à relire et à ratifier comme une traduction.

## Ce qui existe déjà en 1.0.0

- La désignation à la souris, qui rend la cible d'un élément sans actionner la page (module `designer`).
- La notation des cibles, relue et écrite en TOML (module `cibles`).

## Ce qui reste à décider

- La captation des gestes sans exécuter de code dans la page (D5.INV-1).
- La phrase écrite pour chaque geste : celle du catalogue de D11.
