---
name: acceptable
description: L'acceptable partagé d'Agent2Test (noyau du socle de l'acceptable épinglé par la constitution et vérifié au démarrage, intentions refusées et leçons interdites qui en reprennent chaque entrée avec sa règle, refus qui citent leur règle, réponses de l'humain à un refus, dérogation d'une entrée propre déclarée dérogeable ou faux refus, rubrique acceptable du journal de tests). À lire pour implémenter la vérification de la constitution, les gardes, le contrôle des leçons et les réponses à un refus.
dimensions: [D26]
status: active
---

# Module `acceptable` (D26)

Ce module applique le socle de l'acceptable, `socle-acceptable/SKILL.md`, inclus dans la spécification à la version épinglée. Il n'ajoute aucun agent : il fixe ce que le noyau vérifie au démarrage, ce que chaque garde cite quand elle refuse, le contrôle des leçons qu'Agent2Test n'avait pas, et ce que l'humain peut répondre à un refus. Le kit test, par lequel les prérequis de données atteignent l'environnement de test, suit le contrat des kits du socle (module `kit`).

## 1. Épinglage (D26.INV-1)

La constitution porte le champ `acceptable` (module `noyau`, section 5) :

```json
{ "acceptable": { "socle": "socle-acceptable", "version": "1.2.0", "empreinte": "e815cadf230886d507d56dbbfb5d7cfd0cf3982036d54d0279b70cc8f49b4764" } }
```

Au démarrage, après la vérification de l'empreinte de la constitution (D1.INV-4), le noyau :

1. lit le bloc `noyau` du socle inclus, `spec/socle-acceptable/SKILL.md` : le seul bloc JSON au schéma `socle-acceptable.noyau/1` ;
2. vérifie que `socle` et `version` sont le nom et la version du socle inclus, et que `empreinte` est le SHA-256 du bloc sérialisé en JSON canonique, clés triées, sans espace ;
3. vérifie que chaque entrée du noyau figure à l'identique dans la liste de même nom de la constitution, et qu'aucune de ces entrées n'y porte `derogeable`.

Un écart empêche le démarrage, avec le message « acceptable non conforme : <écart> » (`socle-acceptable:SA7.INV-1`).

## 2. Listes de la constitution

Chaque liste reprend les entrées du noyau, en tête, et ajoute celles d'Agent2Test, chacune avec sa règle :

| Liste | Entrées du noyau | Entrées d'Agent2Test |
|---|---|---|
| `intentionsRefusees` | déployer, administrer, écrire en base, hors d'un kit (SA1.INV-1) | `hors-test`, toute demande dont l'objet n'est pas de tester ; modifier du code (D1.INV-5) |
| `programmesInterdits`, `argumentsInterdits` | ceux du noyau (SA2.INV-1, SA2.INV-2) | — ; Agent2Test ne lance aucun programme hors du navigateur |
| `ecrituresInterdites` | constitution, sources du système, fiches, configuration humaine, transmission du skill (SA3.INV-1) | migrations (D1.INV-6) |
| `secrets` | fichiers de secrets (SA4.INV-1) | — |
| `leconsInterdites` | cinq motifs (SA5.INV-1, SA2.INV-1, SA2.INV-2) | — |

Lieux logiques d'Agent2Test : `constitution` est `constitution/` ; `sources-du-systeme`, `src/` ; `fiches`, `fiches/` ; `configuration-humaine`, `configuration/` et `<config>/humaine.json` ; `transmission-du-skill`, la transmission de cette spécification sous `spec/` ; `migrations`, `migrations/`.

La garde refuse partout une entrée `horsKit` : ce qui ne se fait que dans un kit ne passe que par le kit test, que la fabrication de l'hôte applique sur l'environnement de test après sa validation (module `kit`). Une entrée propre peut porter `derogeable: true` ; une entrée du noyau, jamais ; aucune ne le porte dans la constitution d'exemple.

## 3. Refus et leçons interdites (D26.INV-2)

Chaque garde cite les règles des entrées qui l'arrêtent, celles du noyau en tête :

| Garde | Refus | Règles citées |
|---|---|---|
| périmètre (`noyau`, section 7) | « hors périmètre » ; la campagne ne s'ouvre pas | les règles des intentions reconnues |
| écriture (`noyau`, section 5) | `ECRITURE_INTERDITE` | la règle du lieu |
| leçons (`apprenant`, section 1) | « refusée par contrôle », la leçon n'est pas proposée | les règles des motifs qui correspondent |

Le contrôle nommé `apprenant.lecon-compatible`, nouveau, confronte la consigne de chaque leçon candidate, avant qu'elle soit proposée, à la liste `leconsInterdites` de la constitution. Le refus s'écrit dans le journal, une ligne `acceptable.refus` : la garde, l'objet refusé, réduit à son nom (intention, lieu ou motif), les entrées et leurs règles, la campagne. Il est présenté au testeur, avec chaque règle et son énoncé, lu dans le socle ou dans la section 10 de `SKILL.md`.

## 4. Réponses à un refus (D26.INV-3)

Le testeur ou le référent qualité répond à un refus depuis le tableau de bord, ou par MCP avec l'outil `a2t_repondre_refus` ; jamais par l'échange, jamais par le moteur ni par un agent. Une réponse porte un motif, obligatoire, et l'une de deux décisions :

- **déroger** : admise seulement si chaque entrée qui a refusé porte `derogeable: true`, ce qu'aucune entrée du noyau ne porte. La ligne `acceptable.derogation` cite le refus, les règles, le rôle et le motif ; l'action refusée s'exécute alors une fois, telle qu'elle a été refusée, et ses gardes suivantes s'appliquent. Une dérogation demandée sur une entrée qui ne l'admet pas est refusée `NON_DEROGEABLE`, journalisée, et l'action reste refusée (`socle-acceptable:SA6.INV-2`).
- **faux refus** : admis pour toute entrée. La ligne `acceptable.faux-refus` cite le refus, les règles, le rôle et le motif ; l'action ne s'exécute pas. Les faux refus paraissent dans la vue de gouvernance du référent qualité, groupés par règle : la constitution ne change que par sa publication, commande humaine (D1.INV-4), et le noyau que par une version du socle.

Une réponse envoyée par un rôle sans droit est refusée `DROIT_INSUFFISANT` ; un refus a au plus une réponse.

## 5. Journal de tests (D26.INV-4)

Le journal de tests `agent2test.journal-de-tests/1` porte une rubrique `acceptable`, présente dès qu'un refus a touché la campagne :

```json
{ "acceptable": {
    "socle": "socle-acceptable", "version": "1.2.0",
    "refus": [
      { "n": 812, "date": "2026-10-21T10:02:14Z", "garde": "perimetre", "objet": "modifier-du-code", "regles": ["D1.INV-5"], "reponse": null }
    ]
} }
```

Chaque refus et chaque réponse portent leur numéro de ligne de journal, `n`, et sa date, `date`, son horodatage à la seconde, en UTC (`AAAA-MM-JJTHH:MM:SSZ`). `garde` vaut `perimetre`, `ecriture` ou `lecons` ; `reponse` vaut `null` tant que personne n'a répondu, sinon elle porte sa décision, `deroger` ou `faux-refus`, et le rôle qui a répondu, `testeur` ou `referent-qualite`. Le format garde son nom : la rubrique est facultative, et `lire-acceptation.mjs` d'agent-tdd-jira ne la lit pas. Les motifs des réponses restent dans le journal, après le masque du noyau, et ne sont pas recopiés. La rubrique est la source de l'export des refus vers le socle d'observation, par l'outil d'export du binôme que porte l'observatoire du dépôt Agent2Prompt : il date chaque enveloppe par elle.

## 6. Pièges connus

- **Recopier le noyau de mémoire** : seule la version épinglée du socle fait foi ; la constitution en reprend les entrées à l'identique, et le démarrage le vérifie.
- **Déroger « pour cette fois » à une règle du noyau** : refusé `NON_DEROGEABLE` ; le chemin est le faux refus.
- **Un faux refus qui laisse passer l'action** : non, l'action reste refusée.
- **Désactiver un scénario instable par une leçon** : refusé par contrôle ; un scénario instable reçoit sa cause présumée (module `verdict`), pas un `@Disabled`.

## 7. Tests (scénarios)

Jeu d'essai : la constitution d'exemple, des copies altérées, et une constitution d'essai qui ajoute à `ecrituresInterdites` une entrée propre, le lieu `essai-derogeable`, dossier `essai/`, marquée `derogeable: true`.

| Scénario | Vérifie | Cas |
|---|---|---|
| AC1 | D26.INV-1 | la constitution d'exemple démarre : socle 1.2.0, empreinte conforme, chaque entrée du noyau présente |
| AC2 | D26.INV-1 | une empreinte fausse, une version autre que celle du socle inclus, une entrée du noyau retirée d'une liste, ou le champ `acceptable` absent empêchent le démarrage « acceptable non conforme » |
| AC3 | D26.INV-2 | « corriger le code du composant » est refusée « hors périmètre », règle D1.INV-5 ; « redéployer l'application de recette », règle SA1.INV-1 ; chaque refus a sa ligne `acceptable.refus` |
| AC4 | D26.INV-2 | une écriture dans `constitution/` est refusée `ECRITURE_INTERDITE`, règle SA3.INV-1 ; dans `migrations/`, règle D1.INV-6 |
| AC5 | D26.INV-2 | la leçon candidate « marquer le scénario instable @Disabled », tirée d'une correction commentée en CP-2, est refusée par contrôle, règle SA5.INV-1, et n'est pas proposée |
| AC6 | D26.INV-3 | une dérogation demandée sur le refus de `constitution/` est refusée `NON_DEROGEABLE` et journalisée ; l'écriture reste refusée |
| AC7 | D26.INV-3 | avec la constitution d'essai, le testeur déroge au refus d'une écriture dans `essai/`, avec son motif : la ligne `acceptable.derogation` cite le refus, la règle, le rôle et le motif, et l'écriture se fait une fois |
| AC8 | D26.INV-3 | un faux refus déclaré sur le refus de « redéployer l'application de recette », avec son motif : ligne `acceptable.faux-refus`, la campagne ne s'ouvre pas, et le faux refus paraît dans la vue de gouvernance, sous sa règle ; une réponse sans motif, une deuxième réponse, une réponse par l'échange ou par un rôle sans droit sont refusées |
| AC9 | D26.INV-4 | le journal de tests d'une campagne qui a connu un refus porte la rubrique `acceptable`, le refus et sa réponse datés de leur ligne de journal, sans motif en clair, et `lire-acceptation.mjs` d'agent-tdd-jira le lit comme avant |
| AC10 | point E6 | une demande « déployer sur l'environnement de test » est refusée par la garde de périmètre, règle SA1.INV-1 : ce qui ne se fait que dans un kit ne passe que par le kit test, que la fabrication de l'hôte applique après sa validation (module `kit`) |

## 8. Fichiers à produire

- `src/noyau/acceptable.js` : vérification au démarrage, entrées qui refusent, réponses
- `src/agents/apprenant/` : le contrôle `apprenant.lecon-compatible`
- `schemas/reponse-refus.json`, et la rubrique `acceptable` du journal de tests
- `test/acceptable/*.test.js`, avec la constitution d'essai dans `test/fixtures/acceptable/`
