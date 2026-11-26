---
name: kit
description: Le kit test d'Agent2Test (prérequis de données des scénarios retenus, avec leur nettoyage pour retour arrière, en un patch pour l'environnement de test ; confronté au noyau et à la constitution, manifeste socle-acceptable.kit/1 à son empreinte, validé en CP-2 avec le profil, appliqué et nettoyé par la fabrication de l'hôte, déclarés par le testeur ou le développeur depuis le tableau de bord et consignés ; parcours préparés et scénarios joués après l'application déclarée ; rubrique kits du journal de tests). À lire pour implémenter le kit test et la jouabilité des scénarios à prérequis de données.
dimensions: [D27]
status: active
---

# Module `kit` (D27)

Ce module applique au kit test le contrat des kits du socle de l'acceptable (`socle-acceptable/SKILL.md`, section 11). Agent2Test n'écrit jamais en base, et ne modifie pas l'application : un scénario dont un prérequis de données exige une écriture en base, marqué `@ecriture-base` ou `Prérequis : écriture en base`, n'était pas automatisable. Le kit test porte ces prérequis jusqu'à l'environnement de test, par la fabrication de l'hôte, après la validation d'un humain ; Agent2Test n'applique aucun kit.

## 1. Le kit test d'une campagne (D27.INV-1)

À la mise en place, avant de préparer les parcours, le `preparateur` rédige, par le moteur, le kit test des scénarios retenus en CP-1 qui portent un prérequis de données : un patch de données pour l'environnement de test, qui les établit, et leur nettoyage, qui les retire et sert de retour arrière. Une campagne a au plus un kit test. Le moteur ne produit que des données, validées comme toute sortie (D1.INV-3), et marquées dans `origineIA`. Avant de le présenter, Agent2Test le confronte à la version épinglée du noyau et de la constitution :

1. chaque fichier que le patch écrit, à `ecrituresInterdites`, par la garde d'écriture ; un fichier des sources de l'application est refusé par la garde de périmètre, intention `modifier-du-code` ;
2. ses noms de fichiers et son contenu, à `secrets`, par la garde d'écriture ;
3. son intention, à `intentionsRefusees` : `ecrire-en-base`, marquée `horsKit`, n'y est permise que pour l'environnement de test, et reste refusée hors du kit ;
4. le patch ne porte aucune commande : son application est celle de la fabrication.

Un kit qui enfreint une règle n'est pas remis : refus `acceptable.refus`, avec sa garde et ses règles, celles du noyau en tête (module `acceptable`, section 3), et ses scénarios restent non automatisables. Un kit conforme reçoit son manifeste, `kits/<campagne>/test.json` dans le projet Agent2Test, au format `socle-acceptable.kit/1`, et la ligne `kit.remis` cite la campagne, ses scénarios, le patch, son empreinte et le manifeste :

```json
{
  "format": "socle-acceptable.kit/1",
  "systeme": { "nom": "agent2test", "version": "1.7.0" },
  "environnement": "test",
  "patch": { "chemin": "test.patch", "empreinte": "b97faf12ab63e0e511f9c867377374df22fb5f2e6cb21be01169ed17ef4cdcff" },
  "noyau": { "version": "1.2.0", "empreinte": "e815cadf230886d507d56dbbfb5d7cfd0cf3982036d54d0279b70cc8f49b4764" },
  "confrontation": { "fichiers": 2, "commandes": 0 },
  "retourArriere": { "prepare": true, "verifie": false }
}
```

## 2. Validation (D27.INV-2)

CP-2 présente le kit test avec le profil d'environnement : ses scénarios, ses données, son nettoyage, le manifeste et l'empreinte du patch. Le testeur ou le développeur le valide à cette empreinte, le corrige, commentaire obligatoire, ce qui fait un nouveau kit, confronté de nouveau, ou le rejette : ses scénarios restent alors non automatisables, avec le motif « prérequis de données : kit test rejeté ». La validation vaut pour la campagne : dans une campagne suivante, un kit de même empreinte se présente de nouveau.

## 3. Application, parcours et nettoyage (D27.INV-2)

- La fabrication de l'hôte applique le kit validé sur l'environnement de test. Agent2Test ne l'applique pas.
- Le testeur ou le développeur déclare ce qu'elle a fait, depuis le tableau de bord, vue des kits : « kit appliqué », ou « échec, retour arrière fait », avec son commentaire : un échec est une seule déclaration, le retour arrière que la fabrication a fait y étant compris. Agent2Test recalcule l'empreinte du patch : si elle n'est plus celle du manifeste, la déclaration est refusée `KIT_MODIFIE`, journalisée, et rien n'est consigné comme appliqué.
- Les parcours des scénarios du kit ne se préparent, exécution probatoire comprise (module `preparateur`, section 3), et ces scénarios ne se jouent, qu'après l'application déclarée ; sans elle, ou après un échec, ils restent non automatisables, avec le motif « prérequis de données : kit test non appliqué ».
- Après la campagne, la fabrication applique le nettoyage, et le testeur ou le développeur le déclare : « retour arrière fait ».
- Les lignes `kit.applique`, `kit.echec` et `kit.retour-arriere` citent le kit, son empreinte, le rôle et l'heure de la déclaration. Aucun agent, ni le moteur, ni l'échange, ne déclare une application, et aucun outil MCP ne le permet.

## 4. Journal de tests (D27.INV-3)

Le journal de tests `agent2test.journal-de-tests/1` porte une rubrique facultative `kits`, présente dès qu'un kit a été remis :

```json
{ "kits": [
    { "n": 830, "date": "2026-10-21T10:08:00Z", "environnement": "test", "empreinte": "b97faf12ab63e0e511f9c867377374df22fb5f2e6cb21be01169ed17ef4cdcff", "scenarios": ["ECR-77-S04"],
      "validation": { "n": 834, "date": "2026-10-21T10:12:00Z", "role": "testeur" },
      "application": { "n": 840, "date": "2026-10-21T10:15:00Z", "role": "testeur", "resultat": "applique" },
      "retourArriere": { "n": 905, "date": "2026-10-21T11:02:00Z", "role": "testeur" } }
] }
```

Chaque kit porte le numéro et la date de sa ligne `kit.remis` ; sa validation, sa déclaration d'application et son nettoyage, ceux de leur ligne, à la seconde, en UTC, avec le rôle de qui l'a fait, `testeur` ou `developpeur`, ou `null` tant qu'ils n'ont pas eu lieu. `resultat` vaut `applique` ou `echec` ; un échec, déclaré avec son retour arrière, ne remplit que `application`, et `retourArriere` reste `null`. Le format garde son nom : la rubrique est facultative, et `lire-acceptation.mjs` d'agent-tdd-jira ne la lit pas. Elle est la source de l'export des kits, que porte l'observatoire (socle d'observation, section 6.6) : chaque étape y fait une enveloppe.

## 5. Pièges connus

- **Écrire les données soi-même** : non ; Agent2Test ne touche jamais la base, même de test : la fabrication de l'hôte applique le kit.
- **Jouer avant l'application** : un parcours essayé sur des données absentes, ou un scénario joué sans elles, produirait un faux défaut applicatif ; il attend la déclaration.
- **Oublier le nettoyage** : le kit n'est pas clos tant que son retour arrière n'est pas déclaré ; la vue des kits le signale.

## 6. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| KI1 | D27.INV-1 | un scénario `@ecriture-base` retenu en CP-1 : le kit test rédigé, confronté, son manifeste `kits/<campagne>/test.json` au format `socle-acceptable.kit/1`, à l'empreinte du patch, avec le noyau 1.2.0 ; ligne `kit.remis` |
| KI2 | D27.INV-1 | un kit dont le patch écrit dans les sources de l'application, ou porte un fichier `.env`, n'est pas remis : refus `acceptable.refus`, règle D1.INV-5 ou SA4.INV-1 ; ses scénarios restent non automatisables |
| KI3 | D27.INV-2 | le kit validé en CP-2, déclaré appliqué : ligne `kit.applique` ; le parcours de son scénario se prépare alors, et le scénario se joue ; après la campagne, « retour arrière fait » : ligne `kit.retour-arriere` |
| KI4 | D27.INV-2 | un patch modifié après CP-2, puis déclaré appliqué : refus `KIT_MODIFIE` ; le scénario reste non automatisable ; aucun outil MCP, ni l'échange, ni le moteur, ne déclare une application |
| KI5 | D27.INV-3 | le journal de tests d'une campagne dont le kit a été appliqué puis nettoyé porte la rubrique `kits`, chaque étape datée, avec son rôle ; un kit en échec n'a que son application, de résultat `echec` ; `lire-acceptation.mjs` le lit comme avant |

## 7. Fichiers à produire

- `src/agents/preparateur/kit.js` : rédaction du kit et de son nettoyage ; `src/noyau/kit.js` : confrontation, manifeste, déclarations
- `schemas/kit.json`, le manifeste, et la rubrique `kits` dans le schéma du journal de tests
- `test/kit/*.test.js`, avec des kits d'essai dans `test/fixtures/kit/`
