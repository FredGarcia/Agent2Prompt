---
name: acceptable
description: Dimension réservée D26, acceptable partagé (noyau du socle de l'acceptable épinglé par la constitution, intentions refusées et leçons interdites qui en reprennent toutes les entrées, refus qui citent leur règle, dérogations et faux refus, kit test par lequel Agent2Test écrira, avec retour arrière). Ne pas implémenter en 1.x ; lire seulement pour comprendre le point d'extension E6.
dimensions: [D26]
status: reserved
---

# Module `acceptable` (D26, réservé)

Statut : `reserved`. En 1.x, l'acceptable d'Agent2Test est celui de ses gardes de périmètre et d'écriture (module `noyau`, sections 5 et 7) : le socle de l'acceptable est référencé par le manifeste, il n'est ni épinglé ni appliqué.

## 1. Pourquoi cette dimension existe

Les refus d'Agent2Test sont écrits dans sa constitution et dans ses gardes, sans lien avec ceux d'Agent2Dev ni des autres systèmes du dépôt. Deux manques en 1.x : la liste des intentions refusées, que la garde de périmètre lit dans la constitution, ne figure pas dans la constitution d'exemple ; et Agent2Test n'a pas de liste de leçons interdites, alors que son apprentissage propose des leçons (module `apprenant`). Le socle de l'acceptable (`socle-acceptable` 1.0.0) tire des systèmes le noyau commun de ce qu'ils refusent, chaque règle un invariant que cite le refus. Cette dimension garde la place de son application, troisième couplage du troisième ordre, celui des valeurs (`EVOLUTION.md`, section 10).

## 2. Principe prévu

- La constitution épingle le noyau par son champ `acceptable`, nom et version du socle et empreinte de son bloc `noyau`, et en reprend toutes les entrées (`socle-acceptable:SA7.INV-1`) ; elle garde les siennes, plus larges : toute demande qui n'est pas de tester est refusée, et modifier du code aussi (D1.INV-5).
- Les leçons interdites du noyau deviennent celles d'Agent2Test : une leçon qui désactiverait un test ou sauterait un point de contrôle est refusée par contrôle, avec la règle qu'elle contredirait (`socle-acceptable:SA5.INV-1`).
- Les gardes de périmètre et d'écriture citent la règle qu'elles appliquent, un invariant du socle ou de la constitution (`socle-acceptable:SA6.INV-1`) ; seul un humain, d'un rôle nommé, déroge, avec son motif, et un refus levé comme infondé est un faux refus ; refus, dérogations et faux refus se journalisent (`socle-acceptable:SA6.INV-2`).
- Agent2Test écrira par le kit test : un kit qui porte ses actions et leur retour arrière, appliqué par l'hôte d'IA sur l'environnement de test, jamais en production, chaque action confrontée au noyau avant son exécution (`socle-acceptable:SA2.INV-3`, point d'extension E1 du socle).
- Rien ne change avant le passage à `active` : la constitution, les gardes et le journal de tests restent ceux de la version.

## 3. Ce que prépare le point d'extension

| Point | Règle active en 1.x |
|---|---|
| E6 | la constitution réserve le champ `acceptable` ; une constitution qui le porte est refusée au démarrage, publiée ou non, avec le motif « dimension réservée : acceptable partagé (D26) » ; aucun kit test n'est produit |

## 4. Test d'inertie en 1.x

Le scénario NO11 du module `noyau`.
