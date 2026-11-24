---
name: acceptable
description: Dimension réservée D26, acceptable partagé (noyau du socle de l'acceptable épinglé par la constitution, intentions refusées, commandes, écritures et leçons interdites qui en reprennent toutes les entrées, refus qui citent leur règle, dérogations et faux refus, kit dev par lequel Agent2Dev écrira, avec retour arrière). Ne pas implémenter en 1.x ; lire seulement pour comprendre le point d'extension E5.
dimensions: [D26]
status: reserved
---

# Module `acceptable` (D26, réservé)

Statut : `reserved`. En 1.x, l'acceptable d'Agent2Dev est celui de sa constitution et de ses gardes, de périmètre, de commandes et d'écriture (module `noyau`, sections 5 et 7 ; module `profil`), et de ses leçons interdites (module `apprenant`, section 2) : le socle de l'acceptable est référencé par le manifeste, il n'est ni épinglé ni appliqué.

## 1. Pourquoi cette dimension existe

Les refus d'Agent2Dev sont des listes figées dans sa constitution, que rien ne relie à celles d'Agent2Test ni des autres systèmes du dépôt. Le socle de l'acceptable (`socle-acceptable` 1.0.0) en tire le noyau commun, ce que tous les systèmes refusent, chaque règle un invariant que cite le refus ; ses intentions refusées, ses programmes et ses arguments interdits viennent pour l'essentiel de la constitution d'Agent2Dev. Cette dimension garde la place de son application, troisième couplage du troisième ordre, celui des valeurs (`EVOLUTION.md`, section 10).

## 2. Principe prévu

- La constitution épingle le noyau par son champ `acceptable`, nom et version du socle et empreinte de son bloc `noyau`, et en reprend toutes les entrées (`socle-acceptable:SA7.INV-1`) ; elle garde les siennes, plus larges : démarrer ou arrêter l'application, lancer un batch, écrire dans Jira (D1.INV-5), et les lieux propres à Agent2Dev, schémas et profils ratifiés (D1.INV-6).
- Les gardes de périmètre, de commandes et d'écriture, et le contrôle des leçons, citent la règle qu'ils appliquent, un invariant du socle ou de la constitution (`socle-acceptable:SA6.INV-1`) ; seul le développeur ou le référent déroge, avec son motif, et un refus levé comme infondé est un faux refus ; refus, dérogations et faux refus se journalisent (`socle-acceptable:SA6.INV-2`).
- Agent2Dev écrira par le kit dev : un kit qui porte les actions d'une demande et leur retour arrière, appliqué par l'hôte d'IA sur l'environnement de développement, jamais en production, chaque action confrontée au noyau avant son exécution (`socle-acceptable:SA2.INV-3`, point d'extension E1 du socle). Tant que le contrat des kits n'est pas décrit, ce qui ne se fait que dans un kit reste refusé.
- Rien ne change avant le passage à `active` : une demande qui vise une intention refusée reste refusée « hors périmètre », et la constitution reste celle de la version.

## 3. Ce que prépare le point d'extension

| Point | Règle active en 1.x |
|---|---|
| E5 | la constitution réserve le champ `acceptable` ; une constitution qui le porte est refusée au démarrage, publiée ou non, avec le motif « dimension réservée : acceptable partagé (D26) » ; aucun kit dev n'est produit |

## 4. Test d'inertie en 1.x

Le scénario NO13 du module `noyau`.
