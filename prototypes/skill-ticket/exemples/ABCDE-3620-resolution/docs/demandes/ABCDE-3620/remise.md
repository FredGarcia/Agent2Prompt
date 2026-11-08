# Remise de ABCDE-3620 : commande sans ses lignes, résumé de la dernière ligne, lignes en temps réel

Arbre clos : ABCDE-3620-1 (ABCDE-3620-1.1, ABCDE-3620-1.2) et ABCDE-3620-2, chacun avec sa remise. Branche feature/ABCDE-3620-commande-resume-temps-reel, 11 commits.

## Critères

| Critère | Critère d'acceptation | Soutenu par | Scénarios | État |
|---|---|---|---|---|
| ABCDE-3620:C1 | ABCDE-3620-CA01 | ABCDE-3620-1:C1 | S01 | prouvé |
| ABCDE-3620:C2 | ABCDE-3620-CA02 | ABCDE-3620-1:C2 | S02 | prouvé |
| ABCDE-3620:C3 | ABCDE-3620-CA03 | ABCDE-3620-1:C3 | S03 | prouvé |
| ABCDE-3620:C4 | ABCDE-3620-CA04 | ABCDE-3620-1:C4 | S04 | prouvé |
| ABCDE-3620:C5 | ABCDE-3620-CA05 | ABCDE-3620-1:C5, ABCDE-3620-2:C1, ABCDE-3620-2:C2 | S05, S06, S07 | prouvé |

Écarts remontés : aucun.

## Kits

- Kit dev : `docs/demandes/ABCDE-3620/kits/dev.json`.
- Kit test : `docs/demandes/ABCDE-3620/kits/test.json`, avec la matrice `docs/demandes/ABCDE-3620/kits/matrice.md`.
- Kit démo : `docs/demandes/ABCDE-3620/kits/demo.json`, avec le parcours `docs/demandes/ABCDE-3620/kits/demo/parcours.md`.
- Remise à Agent2Test : `docs/demandes/ABCDE-3620/kits/remise-agent2test.json`, à déposer par le développeur.

## Rapport final

- **Demande** : ABCDE-3620, reprise du ticket racine, capture MHTML absente.
- **Critères d'acceptation** : 5 pour 1 US, tous repris et validés ; 5 réalisés.
- **Scénarios** : 7 ; 7 réalisés.
- **Suites** : back `./mvnw verify` vert ; front `ng test` vert, `ng lint` sans erreur.
- **Acceptation** : pas encore de campagne d'Agent2Test ; jouables prévus S05, S06, S07 ; S01 à S04 limités au back, couverts par les tests du back.
- **Écarts à la demande** : aucun.
- **Écarts aux référentiels** : aucun.
- **Questions ouvertes** : aucune.

## Projet de commentaire Jira, à publier par le développeur

```text
Réalisation ABCDE-3620 (branche feature/ABCDE-3620-commande-resume-temps-reel)

Critères d'acceptation remplis :
- CA01 Sans paramètre, la réponse de la commande est inchangée
- CA02 Avec vue=resume, la réponse remplace les lignes par la date-heure de la dernière
- CA03 Une commande sans ligne donne une date-heure nulle
- CA04 La date-heure se lit en une seule requête
- CA05 Les lignes et la date-heure se mettent à jour à l'écran, annoncées sans déplacer le focus

Acceptation par Agent2Test : campagne à ouvrir.
```
