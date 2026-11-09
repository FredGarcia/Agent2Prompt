# ABCDE-3620 : parcours de démonstration

Avant de commencer : charger `docs/demandes/ABCDE-3620/ABCDE-3620-2/demo/donnees.sql` dans la base de démonstration, lancer `./mvnw -f back/pom.xml spring-boot:run -Dspring-boot.run.profiles=demo` puis `npm --prefix front start`, et se connecter avec le rôle « GESTIONNAIRE ». Les étapes reprennent les scénarios tels qu'ils sont écrits.

## 1. ABCDE-3620-S05 : une ligne ajoutée apparaît à l'écran et met à jour la date-heure

1. Ouvrir l'écran de la commande « CMD-1 » : 3 lignes, dernier enregistrement « 02/11/2026 10:15 ».
2. Ajouter une ligne à la commande « CMD-1 », depuis un autre poste ou par l'API.
3. Constater, sans recharger la page : 4 lignes, dernier enregistrement « 02/11/2026 11:00 ».

Capture : `docs/demandes/ABCDE-3620/ABCDE-3620-2/captures/ABCDE-3620-S05.png`.

## 2. ABCDE-3620-S06 : une mise à jour est annoncée sans déplacer le focus

1. Sur le même écran, placer le focus sur le bouton « Retour à la liste », lecteur d'écran actif.
2. Modifier une ligne de la commande « CMD-1 ».
3. Entendre « Lignes de la commande mises à jour » ; le focus reste sur le bouton.

Capture : `docs/demandes/ABCDE-3620/ABCDE-3620-2/captures/ABCDE-3620-S06.png`.

## 3. ABCDE-3620-S07 : après une coupure, l'écran reprend par l'instantané

1. Couper la connexion temps réel, outils de développement du navigateur, réseau hors ligne.
2. Ajouter une ligne à la commande « CMD-1 ».
3. Rétablir la connexion : 4 lignes, et la date-heure de la ligne ajoutée.

Pas de capture : la coupure se simule.

## Écarts avec l'objectif

Aucune image de l'objectif pour ce ticket : rien à comparer.
