---
name: demo
description: Dimension réservée D12 (parcours du kit démo de generateur-skill-ticket joué par le moteur, captures de l'écran livré comparées aux images de l'objectif, à partir du rapport et du moteur ; points d'extension E1 et E3). Ne pas appliquer en 1.x.
dimensions: [D12]
status: reserved
---

# Module `demo` (D12, réservé)

Phase 7E couverte : Évolutif.

## Intention

Le kit démo d'un skill de ticket, produit par generateur-skill-ticket, décrit un parcours de démonstration tiré des scénarios de l'US, et compare les captures de l'écran livré aux images de l'objectif. D12 jouera ce parcours avec le moteur, et rapprochera chaque capture de l'image de l'objectif qu'elle doit montrer.

## Ce qui existe déjà en 1.0.0

- Le moteur, appelable sans `jouer.mjs` (E3), et les captures nommées de l'action `capturer`.
- Le rapport aux champs stables (E1), qui donne chaque capture et son étape.
- Les étiquettes du texte, recopiées par la traduction : un parcours se rattache au scénario de l'US et à ses critères.

## Ce qui reste à décider

- La comparaison d'une capture à une image de l'objectif : par l'œil du développeur, par l'IA, ou par une mesure, et avec quel seuil.
- La forme du parcours dans le kit démo : un texte de départ par scénario de l'US, ou un seul parcours.
