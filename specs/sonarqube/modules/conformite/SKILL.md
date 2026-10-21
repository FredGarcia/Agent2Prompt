---
name: conformite
description: Dimension réservée D8, rapports de conformité produits à partir de SonarQube (accessibilité WCAG, OWASP, Cyber Resilience Act) rapprochés des invariants du socle et des experts. Ne pas appliquer en version 1.x du skill ; lire uniquement pour comprendre les points d'extension E2 et E3.
dimensions: [D8]
status: reserved
---

# Module `conformite` (D8, réservé)

Statut : `reserved`. En version 1.x, l'expert ne produit pas de rapport de conformité.

## 1. Pourquoi cette dimension existe

SonarQube Server 2026.5 ajoute des rapports de conformité, dont un rapport d'accessibilité WCAG et un rapport relatif au Cyber Resilience Act européen, à côté des rapports OWASP. Pour un projet soumis au RGAA, un rapport d'accessibilité issu de l'analyse statique est utile, mais partiel : l'analyse statique ne couvre qu'une partie des critères, et ne remplace pas l'audit.

## 2. Ce que préparent les points d'extension

| Point | Règle active en 1.x | Rôle dans la conformité |
|---|---|---|
| E2 | table de correspondance règles vers invariants versionnée | rattacher chaque ligne d'un rapport de conformité à un invariant du socle ou d'un expert, et donc à un contrôle automatisé |
| E3 | revues de sécurité traitées sous une catégorie unique, avec décision humaine | produire un rapport de sécurité cohérent quelle que soit la version de l'instance |

## 3. Contenu prévu à l'activation

- lecture des rapports de conformité de l'instance et de leurs limites, vérifiées sur la documentation de la version ;
- rapprochement du rapport WCAG avec les invariants d'accessibilité (`SC6`, référentiel Angular `D4`, `D6`) et avec les critères RGAA 4.1, en distinguant ce qui est vérifié automatiquement de ce qui reste à auditer ;
- format d'un rapport de conformité destiné à un responsable, avec ses limites en tête.

## 4. Test d'inertie en 1.x

La table de correspondance existe dans le dépôt du projet dès que la mission « trier » a été exécutée une fois (E2) ; les revues de sécurité suivent le circuit unique du module `triage` (E3).
