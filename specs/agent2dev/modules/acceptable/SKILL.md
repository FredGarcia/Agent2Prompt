---
name: acceptable
description: L'acceptable partagé d'Agent2Dev (noyau du socle de l'acceptable épinglé par la constitution et vérifié au démarrage, listes de la constitution qui en reprennent chaque entrée avec sa règle, refus qui citent leur règle, réponses de l'humain à un refus, dérogation d'une entrée propre déclarée dérogeable ou faux refus, rubrique acceptable du livrable). À lire pour implémenter la vérification de la constitution, les gardes et les réponses à un refus.
dimensions: [D26]
status: active
---

# Module `acceptable` (D26)

Ce module applique le socle de l'acceptable, `socle-acceptable/SKILL.md`, inclus dans la spécification à la version épinglée. Il n'ajoute aucun agent : il fixe ce que le noyau vérifie au démarrage, ce que chaque garde cite quand elle refuse, et ce que l'humain peut répondre à un refus. Le kit dev, par lequel Agent2Dev atteint l'environnement dev, suit le contrat des kits du socle (module `kit`).

## 1. Épinglage (D26.INV-1)

La constitution porte le champ `acceptable` (module `noyau`, section 5) :

```json
{ "acceptable": { "socle": "socle-acceptable", "version": "1.1.0", "empreinte": "e815cadf230886d507d56dbbfb5d7cfd0cf3982036d54d0279b70cc8f49b4764" } }
```

Au démarrage, après la vérification de l'empreinte de la constitution (D1.INV-4), le noyau :

1. lit le bloc `noyau` du socle inclus, `spec/socle-acceptable/SKILL.md` : le seul bloc JSON au schéma `socle-acceptable.noyau/1` ;
2. vérifie que `socle` et `version` sont le nom et la version du socle inclus, et que `empreinte` est le SHA-256 du bloc sérialisé en JSON canonique, clés triées, sans espace ;
3. vérifie que chaque entrée du noyau figure à l'identique dans la liste de même nom de la constitution (`commandes.programmesInterdits` et `commandes.argumentsInterdits` pour les deux listes de commandes), et qu'aucune de ces entrées n'y porte `derogeable`.

Un écart empêche le démarrage, avec le message « acceptable non conforme : <écart> » (`socle-acceptable:SA7.INV-1`).

## 2. Listes de la constitution

Chaque liste reprend les entrées du noyau, en tête, et ajoute celles d'Agent2Dev, chacune avec sa règle :

| Liste | Entrées du noyau | Entrées d'Agent2Dev |
|---|---|---|
| `intentionsRefusees` | déployer, administrer, écrire en base, hors d'un kit (SA1.INV-1) | démarrer, arrêter, batch, écrire dans Jira (D1.INV-5) |
| `commandes.programmesInterdits` | neuf programmes de déploiement et d'orchestration, hors d'un kit (SA2.INV-1) | — |
| `commandes.argumentsInterdits` | huit arguments de démarrage et de déploiement, hors d'un kit (SA2.INV-1) ; `--force`, `--force-with-lease`, `--no-verify`, partout (SA2.INV-2) | — |
| `ecrituresInterdites` | constitution, sources du système, fiches, configuration humaine, transmission du skill (SA3.INV-1) | schémas, profil ratifié existant (D1.INV-6) |
| `secrets` | fichiers de secrets (SA4.INV-1) | — |
| `leconsInterdites` | cinq motifs (SA5.INV-1, SA2.INV-1, SA2.INV-2) | six motifs (module `apprenant`, section 2) |

Lieux logiques d'Agent2Dev : `constitution` est `constitution/` ; `sources-du-systeme`, `src/` ; `fiches`, `fiches/` ; `configuration-humaine`, `~/.agent2dev/humaine.json` ou le chemin de `AGENT2DEV_CONFIG` ; `transmission-du-skill`, la transmission épinglée d'agent-tdd-jira ; `schemas`, `schemas/` ; `profil-ratifie-existant`, toute version de profil déjà ratifiée.

La garde refuse partout une entrée `horsKit` : ce qui ne se fait que dans un kit n'atteint l'environnement dev que par le kit dev, que la fabrication de l'hôte applique après sa validation (module `kit`). Une entrée propre peut porter `derogeable: true` ; une entrée du noyau, jamais ; aucune ne le porte dans la constitution d'exemple.

## 3. Refus (D26.INV-2)

Chaque garde cite les règles des entrées qui l'arrêtent, celles du noyau en tête :

| Garde | Refus | Règles citées |
|---|---|---|
| périmètre (`noyau`, section 7) | « hors périmètre » ; la demande ne démarre pas | les règles des intentions reconnues |
| écriture (`noyau`, section 5) | `ECRITURE_INTERDITE` | la règle du lieu |
| commandes du profil (`profil`, section 3) | commande refusée dès la proposition | les règles du programme ou des arguments |
| leçons (`apprenant`, section 2) | « refusée par contrôle », la leçon n'est pas proposée | les règles des motifs qui correspondent |

Le refus s'écrit dans le journal, une ligne `acceptable.refus` : la garde, l'objet refusé, réduit à son nom (intention, lieu, programme, argument ou motif), les entrées et leurs règles, la demande. Il est présenté au développeur dans la vue de la demande, avec chaque règle et son énoncé, lu dans le socle ou dans la section 10 de `SKILL.md`.

## 4. Réponses à un refus (D26.INV-3)

Le développeur ou le référent répond à un refus depuis le tableau de bord, ou par MCP avec l'outil `a2d_repondre_refus` ; jamais par l'échange, jamais par le moteur ni par un agent. Une réponse porte un motif, obligatoire, et l'une de deux décisions :

- **déroger** : admise seulement si chaque entrée qui a refusé porte `derogeable: true`, ce qu'aucune entrée du noyau ne porte. La ligne `acceptable.derogation` cite le refus, les règles, le rôle et le motif ; l'action refusée s'exécute alors une fois, telle qu'elle a été refusée, et ses gardes suivantes s'appliquent. Une dérogation demandée sur une entrée qui ne l'admet pas est refusée `NON_DEROGEABLE`, journalisée, et l'action reste refusée (`socle-acceptable:SA6.INV-2`).
- **faux refus** : admis pour toute entrée. La ligne `acceptable.faux-refus` cite le refus, les règles, le rôle et le motif ; l'action ne s'exécute pas. Les faux refus paraissent dans la vue de gouvernance du référent, groupés par règle : la constitution ne change que par sa publication, commande humaine (D1.INV-4), et le noyau que par une version du socle.

Une réponse envoyée par un rôle sans droit est refusée `DROIT_INSUFFISANT` ; un refus a au plus une réponse.

## 5. Livrable (D26.INV-4)

La projection `agent2dev.livrable/1` porte une rubrique `acceptable`, présente dès qu'un refus a touché la demande :

```json
{ "acceptable": {
    "socle": "socle-acceptable", "version": "1.1.0",
    "refus": [
      { "n": 2107, "date": "2026-10-21T14:05:40Z", "garde": "commandes", "objet": "docker", "regles": ["SA2.INV-1"],
        "reponse": { "decision": "faux-refus", "role": "developpeur", "n": 2109, "date": "2026-10-21T14:07:02Z" } }
    ]
} }
```

Chaque refus et chaque réponse portent leur numéro de ligne de journal, `n`, et sa date, `date`, son horodatage à la seconde, en UTC (`AAAA-MM-JJTHH:MM:SSZ`). `garde` vaut `perimetre`, `ecriture`, `commandes` ou `lecons` ; `reponse` vaut `null` tant que personne n'a répondu, sinon elle porte sa décision, `deroger` ou `faux-refus`, et le rôle qui a répondu, `developpeur` ou `referent`. Le Markdown en dérive, une ligne par refus ; les motifs des réponses restent dans le journal, après le masque du noyau, et ne sont pas recopiés dans le livrable. La rubrique est la source de l'export des refus vers le socle d'observation, par l'outil d'export du binôme que porte l'observatoire du dépôt Agent2Prompt : il date chaque enveloppe par elle.

## 6. Pièges connus

- **Recopier le noyau de mémoire** : seule la version épinglée du socle fait foi ; la constitution en reprend les entrées à l'identique, et le démarrage le vérifie.
- **Déroger « pour cette fois » à une règle du noyau** : refusé `NON_DEROGEABLE` ; le chemin est le faux refus.
- **Un faux refus qui laisse passer l'action** : non, l'action reste refusée ; le faux refus est une information pour la revue.
- **Citer une règle par son titre** : on cite son identifiant, `SA2.INV-1` ou `D1.INV-5`.

## 7. Tests (scénarios)

Jeu d'essai : la constitution d'exemple, des copies altérées, et une constitution d'essai qui ajoute à `commandes.argumentsInterdits` une entrée propre, `--essai-derogeable`, marquée `derogeable: true`.

| Scénario | Vérifie | Cas |
|---|---|---|
| AC1 | D26.INV-1 | la constitution d'exemple démarre : socle 1.1.0, empreinte conforme, chaque entrée du noyau présente |
| AC2 | D26.INV-1 | une empreinte fausse, une version autre que celle du socle inclus, une entrée du noyau retirée d'une liste, ou le champ `acceptable` absent empêchent le démarrage « acceptable non conforme » |
| AC3 | D26.INV-1 | une entrée du noyau marquée `derogeable` dans la constitution empêche le démarrage |
| AC4 | D26.INV-2 | « redémarrer l'application en recette » est refusée « hors périmètre », règle D1.INV-5 ; « déployer en recette », règle SA1.INV-1 ; chaque refus a sa ligne `acceptable.refus` |
| AC5 | D26.INV-2 | une écriture dans `constitution/` est refusée `ECRITURE_INTERDITE`, règle SA3.INV-1 ; dans `schemas/`, règle D1.INV-6 |
| AC6 | D26.INV-2 | une commande `git push --force` proposée au profil est refusée, règle SA2.INV-2 ; `docker compose up`, règle SA2.INV-1 |
| AC7 | D26.INV-2 | la consigne « ajouter @Disabled au test instable » est refusée par contrôle, règles SA5.INV-1 puis D9.INV-4, et n'est pas proposée |
| AC8 | D26.INV-3 | une dérogation demandée sur le refus de `docker` est refusée `NON_DEROGEABLE` et journalisée ; la commande reste refusée |
| AC9 | D26.INV-3 | avec la constitution d'essai, le développeur déroge au refus de `--essai-derogeable`, avec son motif : la ligne `acceptable.derogation` cite le refus, la règle, le rôle et le motif, et la commande est admise une fois |
| AC10 | D26.INV-3 | un faux refus déclaré sur le refus de `docker`, avec son motif : ligne `acceptable.faux-refus`, la commande reste refusée, et le faux refus paraît dans la vue de gouvernance, sous sa règle |
| AC11 | D26.INV-3 | une réponse sans motif, une deuxième réponse au même refus, une réponse arrivée par l'échange ou envoyée par un rôle sans droit sont refusées ; le moteur n'a aucune action pour répondre |
| AC12 | D26.INV-4 | le livrable d'une demande qui a connu un refus et un faux refus porte la rubrique `acceptable`, chaque refus avec sa garde, ses règles et sa réponse, le refus et la réponse datés de leur ligne de journal, sans motif en clair |
| AC13 | point E5 | une demande « déployer sur l'environnement de développement » est refusée par la garde de périmètre, règle SA1.INV-1 : Agent2Dev n'atteint cet environnement que par un kit dev, que la fabrication de l'hôte applique (module `kit`) |

## 8. Fichiers à produire

- `src/noyau/acceptable.js` : vérification au démarrage, entrées qui refusent, réponses
- `schemas/reponse-refus.json`, et la rubrique `acceptable` dans `schemas/livrable.json`
- `test/acceptable/*.test.js`, avec la constitution d'essai dans `test/fixtures/acceptable/`
