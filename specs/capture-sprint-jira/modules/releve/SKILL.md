---
name: releve
description: Relevé des tickets sur la page du sprint (backlog ou tableau, défilement jusqu'à stabilité, liens /browse/CLÉ et leur section relevés à chaque pas, liste chargée au défilement ou virtualisée, navigation exclue, clés dédoublonnées quelle que soit la forme du lien, filtre par préfixe de la partie projet et plage de numéros comprise, valeurs refusées, tri par numéro, pièges). À lire pour choisir la page du sprint et régler le filtre.
dimensions: [D3]
status: active
---

# Module `releve` (D3)

Phase 7E couverte : Éléments.

## 1. La page du sprint

Le relevé part de la page affichée dans la fenêtre au moment de la capture. Pour le prochain sprint, c'est le backlog, où les sprints futurs sont listés au-dessus du backlog proprement dit ; pour le sprint en cours, le tableau. Une page de résultats de recherche (`/issues/?jql=sprint = …`) convient aussi : le skill ne lit que ses liens.

## 2. Défilement (D3.INV-1)

Jira charge souvent les cartes au fur et à mesure du défilement, et peut retirer de la page celles qui sortent de l'écran (affichage virtualisé). Le skill fait donc défiler, toutes les 700 ms, la fenêtre si elle défile et chaque bloc qui défile et contient un lien de ticket, quelle que soit sa hauteur, de 80 % de sa hauteur affichée : deux pas se recouvrent, et aucune carte n'est sautée, même dans une petite fenêtre. Il relève à chaque pas les liens présents. Il s'arrête quand, quatre pas de suite, rien ne défile plus et aucun ticket nouveau n'apparaît : le bas est atteint et plus rien ne s'y charge ; au plus tard au bout de 150 pas. Les liens relevés à chaque pas s'additionnent : une carte retirée de la page reste relevée. La page revient ensuite en haut, où le backlog affiche ses sprints, et c'est cet état qui est enregistré dans `sprint.mhtml`.

À chaque pas, le relevé note aussi la section de chaque lien, d'après les en-têtes de catégorie présents (`IA`, `DEV`…) : une liste virtualisée retire un en-tête comme une carte, et la section d'un ticket ne se perd pas avec lui (module `classement`, D11.INV-1, D11.INV-2).

Le défilement est programmé (position des blocs), et non simulé à la molette : il ne dépend ni de la place du pointeur ni de la taille de la fenêtre. Une première version, à pas fixe de 1 200 pixels sous le pointeur, ne relevait que 11 tickets sur 72 d'une liste virtualisée de 300 pixels de haut (recette, R13 et M7). En 1.0.0, seuls les blocs de 100 pixels de haut au moins défilaient : sur un runner de CI, où la fenêtre s'ouvrait à une taille imprévue, le relevé s'est arrêté à 31 tickets sur 72. Depuis 1.0.1, un bloc qui contient un lien de ticket défile quelle que soit sa hauteur (recette, R13 et M8), et la fenêtre s'ouvre en 1 280 × 900 pixels (module `session`).

## 3. Liens et clés (D3.INV-1, D3.INV-3)

- Seuls comptent les liens `<a href>` dont l'adresse contient `/browse/<CLÉ>`, où la clé est `PROJET-NUMÉRO`.
- Les liens de la navigation (`nav`, `header`, `aside` et leurs rôles ARIA `navigation` et `banner`) sont ignorés : un menu « Récents » peut citer un ticket d'un autre sprint qui passerait le filtre.
- La clé est mise en majuscules ; l'adresse est ramenée à `…/browse/<CLÉ>`, sans paramètre, à partir de l'adresse de la page. Un même ticket lié trois fois, en relatif, en absolu ou en minuscules, n'est relevé qu'une fois.

## 4. Filtre (D3.INV-2)

| Champ | Règle | Exemple |
|---|---|---|
| Préfixe | début de la partie projet de la clé, sans tenir compte de la casse ; lettres, chiffres et `_`, en commençant par une lettre | `ABC` retient `ABCDE-3512` et `ABCXY-3600`, pas `XABC-3600` |
| Numéro minimal | entier, compris | `3500` retient `ABCDE-3500` |
| Numéro maximal | entier, compris, au moins égal au minimal | `4500` retient `ABCDE-4500` |

Un champ vide ne filtre rien : sans préfixe ni bornes, tous les tickets de la page sont capturés. Une valeur invalide est refusée avant que la capture ne commence, avec un message qui la nomme. Les tickets retenus sont capturés un à un, par numéro croissant, puis par projet (D3.INV-3). Le rapport compte les tickets relevés, retenus et ignorés, et donne jusqu'à vingt clés ignorées en exemple.

## 5. Pièges connus

- **Bornes trop étroites** : les numéros avancent à chaque nouveau ticket ; une plage fixée une fois pour toutes finit par exclure les tickets récents. Le rapport le montre : retenus en baisse, ignorés en hausse.
- **Épopées et tickets liés** : une carte peut lier son épopée ou un ticket bloquant ; s'ils passent le filtre, ils sont capturés comme les autres. Un préfixe ou des bornes plus serrés les écartent.
- **Tableau à colonnes larges** : le skill fait défiler verticalement ; un tableau qui déborde sur le côté s'élargit en agrandissant la fenêtre ou en réduisant le zoom (Ctrl -).

## 6. Contrôle de sortie

- R1, R3, R9, R10 et R13 du module `recette` passent : 72 tickets relevés sur un backlog chargé au défilement comme sur un backlog virtualisé, un ticket récent de la navigation écarté, 8 tickets retenus et triés, chacun avec sa section.
