# ABCDE-3620 : matrice de traçabilité

Construite par recherche des étiquettes (agent-tdd-jira, module tracabilite, § 2), sur la branche feature/ABCDE-3620-commande-resume-temps-reel.

| US | CA | Exigences | Scénario | Variante | Tests back | Tests front | Commit | Statut | Acceptation |
|---|---|---|---|---|---|---|---|---|---|
| ABCDE-3620-US01 | ABCDE-3620-CA01 | EX-01 | @ABCDE-3620-S01 | — | `CommandeControllerSansVueTest#reponseInchangeeSansParametre` | non concerné | `4f6c659` | réalisé | non joué (pas de campagne Agent2Test) |
| ABCDE-3620-US01 | ABCDE-3620-CA02 | EX-02, EX-03 | @ABCDE-3620-S02 | — | `CommandeControllerVueResumeTest#varianteResumee` | non concerné | `b72c45c` | réalisé | non joué (pas de campagne Agent2Test) |
| ABCDE-3620-US01 | ABCDE-3620-CA03 | EX-04 | @ABCDE-3620-S03 | — | `LigneCommandeRepositorySansLigneTest#agregatVidePourUneCommandeSansLigne`, `CommandeControllerSansLigneTest#dateHeureNullePourUneCommandeSansLigne` | non concerné | `9a77ef8`, `d2c9897` | réalisé | non joué (pas de campagne Agent2Test) |
| ABCDE-3620-US01 | ABCDE-3620-CA04 | EX-05 | @ABCDE-3620-S04 | — | `LigneCommandeRepositoryAgregatTest#dateHeureLueEnUneSeuleRequete` | non concerné | `d7e25cc` | réalisé | non joué (pas de campagne Agent2Test) |
| ABCDE-3620-US01 | ABCDE-3620-CA05 | EX-06 | @ABCDE-3620-S05 | — | `LignesCommandePublieurTest#ligneAjouteePublieUnEvenement` | `lignes-commande.temps-reel.spec.ts` › ABCDE-3620-S05 | `78afeb1`, `80dd900` | réalisé | non joué (pas de campagne Agent2Test) |
| ABCDE-3620-US01 | ABCDE-3620-CA05 | EX-06 | @ABCDE-3620-S06 | — | non concerné | `lignes-commande.annonce.spec.ts` › ABCDE-3620-S06 | `cf690be` | réalisé | non joué (pas de campagne Agent2Test) |
| ABCDE-3620-US01 | ABCDE-3620-CA05 | EX-06 | @ABCDE-3620-S07 | — | `LignesCommandeEtagTest#instantaneAvecEtag` | `lignes-commande.reprise.spec.ts` › ABCDE-3620-S07 | `3b14ac1`, `3743b46` | réalisé | non joué (pas de campagne Agent2Test) |

Chaque exigence a un scénario, chaque scénario validé a un test et un commit. Acceptation : aucune campagne d'Agent2Test encore ; la remise `docs/demandes/ABCDE-3620/kits/remise-agent2test.json` permet de l'ouvrir.
