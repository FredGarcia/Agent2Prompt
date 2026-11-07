---
name: autres-hotes
description: Dimension réservée D10, autres hôtes reconnus chacun par un adaptateur (contrat d'un adaptateur, place déjà posée par le point d'extension E1, ce qui reste interdit en 1.x). À lire seulement pour comprendre le point d'extension E1 ; ne pas appliquer en 1.x.
dimensions: [D10]
status: reserved
---

# Module `autres-hotes` (D10, réservée)

Phase 7E couverte : Évolutif.

## 1. Place réservée

En 1.x, le skill ne reconnaît que Gemini CLI. Tout autre hôte se décrit par ce qui s'en observe, sans nom ni configuration prêtés (D2.INV-3) : `hote.famille` vaut `inconnue`, et `hote.generique` rend les candidats déduits (point d'extension E1). La recette vérifie cette inertie (T10).

## 2. Contrat d'un futur adaptateur

Une version mineure pourra activer D10, à la demande du développeur et avec des repères vérifiés comme ceux du module `modele-hote`. Chaque adaptateur apportera :

- ses indices de reconnaissance, chacun avec la nature de sa preuve, sur le modèle du module `hote`, § 2 ;
- ses emplacements : réglages et leur ordre, fichiers de contexte, composants, sessions, documentation embarquée s'il en a une ;
- ses repères, datés, sourcés et rejoués par une recette contre l'hôte réel ;
- aucune clé nouvelle dans les objets de `config`, `contexte` et `composants`, dont le schéma reste celui de la version 1 : les différences passent par `hote.famille` et par des valeurs, pas par des clés.

## 3. Interdits en 1.x

- Aucun autre hôte n'est nommé, ni dans le script, ni dans les modules, ni dans les réponses de l'agent.
- Aucune configuration n'est déduite d'un nom de dossier : un candidat reste un candidat.
