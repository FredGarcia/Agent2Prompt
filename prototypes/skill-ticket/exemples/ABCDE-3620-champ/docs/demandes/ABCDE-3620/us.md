# ABCDE-3620 : US et critères d'acceptation

## ABCDE-3620-US01 : consulter une commande sans ses lignes, ou avec la date-heure de la dernière, tenues à jour en temps réel

En tant que gestionnaire de commandes, je veux obtenir une commande sans ses lignes, ou avec la date-heure de sa dernière ligne enregistrée, et voir ses lignes se mettre à jour à l'écran sans recharger la page, afin de suivre l'activité d'une commande sans charger toutes ses lignes.
Provenance : ticket racine, intention et critères C1 à C5.

| CA | Énoncé | Origine | Provenance | Statut | Scénarios |
|---|---|---|---|---|---|
| ABCDE-3620-CA01 | Sans paramètre, GET /api/v1/commandes/{id} renvoie CommandeDto, inchangée. | repris | ticket racine, critère C1 | validé | S01 |
| ABCDE-3620-CA02 | Avec vue=resume, la réponse ne contient pas lignes, et contient lignesDernierEnregistrement au format ISO 8601 avec fuseau. | repris | ticket racine, critère C2 | validé | S02 |
| ABCDE-3620-CA03 | Pour une commande sans ligne, lignesDernierEnregistrement vaut null. | repris | ticket racine, critère C3 | validé | S03 |
| ABCDE-3620-CA04 | La date-heure se calcule en une seule requête, sans charger les lignes. | repris | ticket racine, critère C4 | validé | S04 |
| ABCDE-3620-CA05 | La liste des lignes et la date-heure du résumé se mettent à jour en temps réel à l'écran, annoncées sans déplacer le focus. | repris | ticket racine, critère C5 | validé | S05, S06, S07 |

## Exigences

| ID | Exigence | Provenance | CA |
|---|---|---|---|
| EX-01 | sans paramètre, la réponse de GET /api/v1/commandes/{id} reste celle d'avant le ticket | ticket racine, intention | ABCDE-3620-CA01 |
| EX-02 | à la même URI, le paramètre vue=resume donne une variante sans le champ lignes | ticket racine, intention ; développeur, question 1 | ABCDE-3620-CA02 |
| EX-03 | la variante porte la date-heure de la dernière ligne enregistrée, en ISO 8601 avec fuseau | ticket racine, critère C2 | ABCDE-3620-CA02 |
| EX-04 | une commande sans ligne donne une date-heure nulle | ticket racine, critère C3 | ABCDE-3620-CA03 |
| EX-05 | la date-heure se lit par une requête d'agrégat, sans charger les lignes | ticket racine, demande, lecture | ABCDE-3620-CA04 |
| EX-06 | la liste des lignes et la date-heure se mettent à jour en temps réel, annoncées sans déplacer le focus, et reprennent après une coupure | ticket racine, critère C5 ; développeur, question 4 | ABCDE-3620-CA05 |
