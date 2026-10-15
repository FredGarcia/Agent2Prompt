# Régulation de second niveau inter-agents

Dimensions D8, D9 et D10 du registre de `SKILL.md` (section 5, version 2.2.0). Statut en 2.2.0 : `reserved`, déclarées dans `manifest.json`. Elles s'activent en version 3.0. Les points d'extension qui les préparent sont décrits dans `SKILL.md`, section 6.2 : E1 à E5 depuis la 2.1.0, E6 depuis la 2.2.0.

Cette section remplace, pour la communication entre agents, le canal unique, la répartition des agents et le périmètre hors version qui figuraient dans la version 2.0.0 (`archives/SKILL-v2.0.0.md`).

## 0. Décisions retenues

- Les agents peuvent s'échanger directement des messages signés. Le développeur est le médiateur de tout conflit entre agents.
- Le méta-niveau construit les règles de régulation et les applique, à l'intérieur d'une enveloppe bornée (section 2).
- En cas d'interblocage, aucune rupture automatique. Le système produit une analyse approfondie et un rapport destiné au développeur, qui détermine la feuille de route.

## 1. Principe

Les agents forment un réseau d'observateurs couplés. Le méta-niveau observe le protocole : qui parle à qui, sur quel sujet, avec quels effets. Il construit des règles de coordination et les applique.

Distinction centrale :

- **Règles de régulation** (ordre de réponse, temporisation, plafonds de messages, bornes de seuils) : construites et appliquées par le méta-niveau, dans l'enveloppe de la section 2.
- **Arbitrages de contenu** (ACCEPT_AGENT, KEEP_DEV, TRIGGER_MERGE, et toute décision sur le code) : réservés au développeur. Le méta-niveau ne tranche jamais un désaccord entre agents sur le contenu d'un fichier.

## 2. Enveloppe d'autonomie

Les règles sont classées en trois catégories. Les bornes sont déclarées dans `src/core/bounds.js` (point d'extension E4 de `SKILL.md`, section 6.2, et module `etats`), un module que le méta-niveau ne peut pas modifier. Seul un commit relu par le développeur peut les changer.

| Catégorie | Exemples | Pouvoir du méta-niveau |
|---|---|---|
| Intangibles | HMAC, écoute sur `127.0.0.1`, interdits Git du module `effecteur-gitlab`, journal en ajout seul, listes `sensitive` et `generated` | Aucun, à l'exécution |
| Bornées | `seuil` (150 à 500), `tStabMin` (5 à 30), `tGelMin` (15 à 120), `tVolatileH` (6 à 72), `fetchIntervalSec` (30 à 300) | Modifier, dans les bornes, au plus une fois par paramètre et par 24 h |
| De coordination | ordre de réponse entre agents, temporisation entre messages, plafond de messages par fil et par heure (bornes : 5 à 60) | Créer et modifier, dans les bornes |

Le méta-niveau n'écrit jamais dans `config.json`, ni dans les fichiers du dépôt. Il écrit uniquement dans la table `rules` (créée vide en 2.1.0, point d'extension E3) et dans le journal. La valeur `meta` de `journal.actor` est réservée à cette dimension (E1).

## 3. Séquence d'un changement de règle

Chaque changement suit cet ordre fixe, sans saut :

1. **Observation** : la métrique qui motive le changement, avec sa fenêtre et sa valeur.
2. **Proposition** : valeur avant, valeur après, vérification des bornes.
3. **Application** : immédiate si la règle est dans l'enveloppe, refusée sinon.
4. **Journal** : événement `RULE_CHANGED` avec `before`, `after`, `motif`, `metric`, `acteur = meta`.
5. **Évaluation** : après 24 h d'observation, comparaison de la métrique cible à sa valeur de référence.
6. **Retour arrière** : automatique si la métrique cible se dégrade au-delà du seuil fixé dans le code. Événement `RULE_REVERTED`.
7. **Rapport** : le changement figure dans le rapport de couplage (section 6).

Amortissement :

- un paramètre ne change pas plus d'une fois par 24 h ;
- une règle annulée ne peut pas être réappliquée avant 72 h ;
- toute règle peut être gelée par le développeur, avec l'événement `RULE_LOCK`. Une règle gelée ne change plus, quelle que soit la métrique.

Le développeur peut annuler n'importe quel changement d'une seule commande. L'annulation est journalisée comme `RULE_REVERTED` avec `acteur = developer`.

## 4. Métriques de couplage

Toutes calculées uniquement à partir du journal, de façon déterministe :

- `alerts_per_hour` : alertes émises par heure, globalement et par fichier.
- `arbitration_load` : nombre d'événements `ARBITRATION_NEEDED` par jour. Cette métrique mesure la charge du médiateur humain : c'est un goulot potentiel.
- `arbitrage_reversal_rate` : part des arbitrages suivis d'un retour arrière dans les 24 h.
- `wait_cycles` : nombre de cycles détectés dans le graphe d'attente.
- `wait_p95` : durée d'attente au 95ᵉ centile avant levée d'un gel.
- `reply_latency` : délai médian entre un message entre agents et sa réponse.
- `oscillations` : nombre de changements de niveau d'un même fichier en une heure.

## 5. Graphe d'attente et interblocage

- Nœuds : les agents et les fichiers gelés.
- Arête `A → B` : A attend une réponse ou la levée d'un gel qui dépend de B.
- Détection : parcours en profondeur du graphe à chaque cycle de surveillance.
- Réaction : aucune rupture automatique. Les fichiers du cycle restent gelés. Les autres fichiers continuent normalement.
- Le méta-niveau génère le rapport d'analyse (section 6) et émet `DEADLOCK_REPORT_READY` vers le développeur, avec le chemin du cycle et l'emplacement du rapport.

## 6. Rapport de couplage pour la feuille de route

Déclenchement : à l'ouverture d'un cycle d'attente, à la demande, et chaque semaine.

Contenu, dans cet ordre :

1. **Synthèse** : état du système, en une demi-page maximum.
2. **Incidents** : pour chaque cycle, le chemin, la durée, les agents et fichiers impliqués, et les événements qui l'ont précédé, avec leur horodatage.
3. **Métriques** de la période, avec leur tendance.
4. **Règles modifiées** : avant, après, motif, résultat, annulations éventuelles.
5. **Analyse** : hypothèses explicitement étiquetées comme telles, avec un niveau de confiance et la liste des données manquantes.
6. **Options** : pour chaque problème identifié, au moins deux options, dont « ne rien faire ». Chaque option indique son coût, son risque, son effet attendu sur les métriques et sa réversibilité.
7. **Feuille de route suggérée** : ordonnée, présentée comme une proposition. La décision revient au développeur.

Le rapport est déterministe : à partir du même journal, il produit le même contenu. Il est écrit dans `reports/` avec un horodatage, puis passé en lecture seule.

## 7. Communication directe entre agents

- Même enveloppe HMAC que le module `messagerie`, complétée par deux champs : `to` (agent destinataire) et `thread` (identifiant de la conversation). Ces deux champs sont réservés en 2.x (point E2) : un message qui les porte est rejeté. Ils sont activés en 3.0.
- Un agent peut demander une information, signaler un état, proposer une option.
- Un agent ne peut ni engager une action sur un fichier qui relève d'un autre agent, ni répondre à un arbitrage à la place du développeur.
- Toute demande d'arbitrage de contenu déclenche `ARBITRATION_NEEDED` vers le développeur. L'échange sur ce fil est alors suspendu.
- Chaque message entre agents est journalisé dans son intégralité. Aucun canal non journalisé.
- Plafond : le nombre de messages par fil et par heure est borné (section 2). Au-delà, le fil est fermé et `ARBITRATION_NEEDED` est émis.

## 8. Tests à ajouter à la suite de rejeu

- Détection d'un cycle à deux nœuds et d'un cycle à trois nœuds. Aucun faux positif sur un graphe en chaîne.
- Changement de seuil hors bornes : refusé, événement `RULE_REJECTED`.
- Deux changements du même paramètre en moins de 24 h : le second est refusé.
- Dégradation simulée après un changement : retour arrière automatique, événement `RULE_REVERTED`.
- Tentative de changement d'une règle intangible : refusée, quelle que soit la source.
- Règle gelée par `RULE_LOCK` : aucun changement ultérieur.
- Fil de messages qui dépasse le plafond : fil fermé, `ARBITRATION_NEEDED` émis.
- Génération du rapport deux fois à partir du même journal : contenus identiques.
- Aucun arbitrage de contenu appliqué sans événement humain correspondant dans le journal.

## 9. Critères d'acceptation complémentaires

- Aucune règle intangible n'est modifiable à l'exécution.
- Chaque changement de règle est annulable en une commande par le développeur.
- Le méta-niveau n'a aucune écriture sur le dépôt ni sur `config.json`.
- Le taux de charge du médiateur (`arbitration_load`) figure en tête du rapport de couplage.

## 10. Valeurs à ratifier

- Bornes numériques de la section 2.
- Fenêtre d'évaluation (24 h) et délai de réapplication après annulation (72 h).
- Plafond de messages par fil et par heure.
- Cadence du rapport hebdomadaire.
