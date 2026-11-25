---
name: kit
description: Le kit dev d'Agent2Dev (patch d'un scénario confronté par le depot au noyau et à la constitution avant V4, manifeste socle-acceptable.kit/1 à l'empreinte du patch, validation par la décision « accepter » de V4, application et retour arrière par la fabrication de l'hôte sur l'environnement dev, déclarés par le développeur depuis le tableau de bord et consignés au journal, rubrique kits du livrable). À lire pour implémenter la remise d'un kit dev et la déclaration de son application.
dimensions: [D27]
status: active
---

# Module `kit` (D27)

Ce module applique au kit dev le contrat des kits du socle de l'acceptable (`socle-acceptable/SKILL.md`, section 11). Il n'ajoute aucun agent : le `depot`, qui tire déjà un patch de chaque commit de la copie (module `depot`), en fait un kit, et le tableau de bord en reçoit l'application. Agent2Dev n'applique aucun kit : la fabrication de l'hôte l'applique sur l'environnement dev, et le développeur le déclare.

## 1. Le kit dev d'un scénario (D27.INV-1)

Quand le cycle d'un scénario s'achève, suites vertes, le `depot` tire son patch, `<dossier de travail>/patchs/<nnn>-<objet>.patch` (module `depot`, section 5). Avant que V4 se présente, il le confronte à la version épinglée du noyau et de la constitution :

1. chaque fichier que le patch écrit, à `ecrituresInterdites`, par la garde d'écriture ;
2. ses noms de fichiers et son contenu, à `secrets`, par la garde d'écriture ;
3. le patch ne porte aucune commande : son application est celle de la fabrication.

Un patch qui enfreint une règle n'est pas remis : refus `acceptable.refus`, avec sa garde et ses règles, celles du noyau en tête (module `acceptable`, section 3), et le scénario reste au pas courant, présenté au développeur. Un patch conforme reçoit son manifeste, `<dossier de travail>/kits/dev-<nnn>-<objet>.json`, au format `socle-acceptable.kit/1`, et la ligne `kit.remis` cite le scénario, le patch, son empreinte et le manifeste :

```json
{
  "format": "socle-acceptable.kit/1",
  "systeme": { "nom": "agent2dev", "version": "1.4.2" },
  "environnement": "dev",
  "patch": { "chemin": "../patchs/002-S02.patch", "empreinte": "54b440c362566a4c8e8f22b9baf9f7d78a1c78b16820ec6d8fe0566a48aafc55" },
  "noyau": { "version": "1.1.0", "empreinte": "e815cadf230886d507d56dbbfb5d7cfd0cf3982036d54d0279b70cc8f49b4764" },
  "confrontation": { "fichiers": 3, "commandes": 0 },
  "retourArriere": { "prepare": true, "verifie": false }
}
```

Le retour arrière d'un patch est son inverse, que la fabrication sait appliquer : il est préparé dès le manifeste ; Agent2Dev ne le joue pas, et `verifie` reste `false`.

## 2. Validation (D27.INV-2)

V4 présente le scénario avec son kit : le manifeste et l'empreinte du patch, sous le diff. La décision « accepter » valide le kit à cette empreinte : sa ligne de décision cite le kit, et le kit est remis. La décision « ajuster » ne valide rien : le scénario reprend, et le patch suivant aura son propre kit.

## 3. Application et retour arrière (D27.INV-2)

- La fabrication de l'hôte applique le kit validé sur l'environnement dev, et sait le défaire. Agent2Dev ne l'applique pas.
- Le développeur déclare ce qu'elle a fait, depuis le tableau de bord, vue des kits : « kit appliqué », « échec, retour arrière fait », avec son commentaire, ou, plus tard, « retour arrière fait ». Un échec est une seule déclaration : le retour arrière que la fabrication a fait y est compris. Agent2Dev recalcule l'empreinte du patch : si elle n'est plus celle du manifeste, la déclaration est refusée `KIT_MODIFIE`, journalisée, et rien n'est consigné comme appliqué.
- Les lignes `kit.applique`, `kit.echec` et `kit.retour-arriere` citent le kit, son empreinte, le rôle et l'heure de la déclaration.
- Aucun agent, ni le moteur, ni l'échange, ne déclare une application, et aucun outil MCP ne le permet.
- Le patch reste applicable à la main, dans l'arbre du développeur, par `git am -3` (module `depot`, section 5) : ce n'est pas l'application d'un kit, qui seule atteint l'environnement dev.

## 4. Livrable (D27.INV-3)

La projection `agent2dev.livrable/1` porte une rubrique `kits`, présente dès qu'un kit a été remis :

```json
{ "kits": [
    { "n": 2131, "date": "2026-10-21T14:31:10Z", "scenario": "ECR-77-S02", "environnement": "dev", "empreinte": "54b440c362566a4c8e8f22b9baf9f7d78a1c78b16820ec6d8fe0566a48aafc55",
      "validation": { "n": 2133, "date": "2026-10-21T14:33:00Z", "role": "developpeur" },
      "application": { "n": 2140, "date": "2026-10-21T14:40:00Z", "role": "developpeur", "resultat": "applique" },
      "retourArriere": null }
] }
```

Chaque kit porte le numéro et la date de sa ligne `kit.remis` ; sa validation, sa déclaration d'application et son retour arrière, ceux de leur ligne, à la seconde, en UTC, avec le rôle de qui l'a fait, ou `null` tant qu'ils n'ont pas eu lieu. `resultat` vaut `applique` ou `echec` ; un échec, déclaré avec son retour arrière, ne remplit que `application`, et `retourArriere` reste `null`. Le Markdown en dérive, une ligne par kit. La rubrique est la source de l'export des kits, que porte l'observatoire (socle d'observation, section 6.6) : chaque étape y fait une enveloppe.

## 5. Pièges connus

- **Appliquer le kit soi-même** : non ; la fabrication de l'hôte l'applique, et Agent2Dev ne consigne que ce que le développeur déclare.
- **Retoucher un patch après V4** : ce n'est plus le kit validé ; sa déclaration est refusée `KIT_MODIFIE`, et la correction passe par un nouveau pas, avec son propre kit.
- **Confondre `git am -3` et l'application d'un kit** : la première écrit dans l'arbre du développeur ; seule la seconde atteint l'environnement dev.

## 6. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| KI1 | D27.INV-1 | le scénario ECR-77-S02 achevé : son patch confronté, le manifeste `kits/dev-002-S02.json` au format `socle-acceptable.kit/1`, à l'empreinte du patch, avec le noyau 1.1.0 et son empreinte ; ligne `kit.remis` |
| KI2 | D27.INV-1 | un patch qui écrit `.env`, ou dans `schemas/`, n'est pas remis : refus `acceptable.refus`, garde d'écriture, règle SA4.INV-1 ou D1.INV-6 ; aucun manifeste n'est écrit |
| KI3 | D27.INV-2 | la décision « accepter » de V4 cite le kit ; le développeur déclare « kit appliqué », ligne `kit.applique` avec l'empreinte, puis « retour arrière fait », ligne `kit.retour-arriere` |
| KI4 | D27.INV-2 | le patch modifié après V4, puis déclaré appliqué : refus `KIT_MODIFIE`, journalisé, rien de consigné comme appliqué ; aucun outil MCP, ni l'échange, ni le moteur, ne déclare une application |
| KI5 | D27.INV-3 | le livrable d'une demande dont un kit a été appliqué puis défait porte la rubrique `kits`, chaque étape datée de sa ligne, avec son rôle ; un kit en échec n'a que son application, de résultat `echec` |

## 7. Fichiers à produire

- `src/noyau/kit.js` : confrontation du patch, manifeste, déclarations
- `schemas/kit.json`, le manifeste, et la rubrique `kits` dans `schemas/livrable.json`
- `test/kit/*.test.js`, avec des patchs d'essai dans `test/fixtures/kit/`
