---
name: qualification
description: Dimension D11, la qualification de chaque ticket à son ouverture, avant tout le reste. La demande du ticket est rangée dans le modèle générique de la demande du référentiel, une combinaison de possibilités de modification de l'application, couche par couche (PostgreSQL, Java, Angular), établies à l'analyse de l'application ; les questions que le ticket laisse ouvertes sont posées au développeur ; le méso-contrat que désigne la combinaison est proposé, puis confirmé par le développeur avant toute analyse du code et toute fiche. À lire à l'installation et à l'ouverture de chaque ticket.
dimensions: [D11]
status: active
---

# Module `qualification` (D11)

Statut : `active`, depuis la version 3.3.0.

## 1. Rôle

À l'ouverture d'un ticket, la première chose à faire est de trouver son méso-contrat. L'IA part du seul contenu du ticket, sans lire encore le code ni l'architecture :

1. elle range la demande du ticket dans le modèle générique de la demande ;
2. elle pose au développeur les questions que le ticket laisse ouvertes ;
3. elle propose le méso-contrat que désigne la demande.

Le développeur confirme ce méso-contrat. L'analyse et la fiche de transformation viennent ensuite (§ 3 du point d'entrée) : un ticket mal classé à l'ouverture fausserait les options, les preuves et les tests déduits.

## 2. Le modèle générique de la demande

Le modèle est une **combinaison de possibilités** : les modifications qu'un ticket peut demander à l'application, couche par couche. Il se trouve dans la section 0 du référentiel du projet, `[modele_demande]` (module `referentiel`, § 6). Chaque possibilité nomme sa couche, la modification, l'option du référentiel qu'elle engage, et ses repères dans l'application. Pour une application PostgreSQL, Java et Angular, le modèle en propose quinze :

| Couche | Possibilité | Modification | Option |
|---|---|---|---|
| persistance, PostgreSQL | `table` | créer une table | `schema` |
| persistance, PostgreSQL | `colonne` | ajouter ou modifier une colonne | `schema` |
| persistance, PostgreSQL | `index` | ajouter ou modifier un index, pour la performance d'une requête | `schema` |
| persistance, PostgreSQL | `contrainte` | ajouter ou modifier une contrainte : clé, unicité, NOT NULL | `schema` |
| persistance, PostgreSQL | `lecture` | lire les données d'une entité : filtre, tri, pagination | `crud` |
| persistance, PostgreSQL | `ecriture` | créer, modifier ou supprimer les données d'une entité | `crud` |
| backend, Java | `endpoint_nouveau` | ajouter un endpoint | `endpoints` |
| backend, Java | `endpoint_modifie` | modifier le contrat d'un endpoint : paramètres, réponse, erreurs | `endpoints` |
| backend, Java | `regle` | ajouter ou modifier une règle métier ou une habilitation | `regles` |
| backend, Java | `service` | ajouter ou modifier un cas d'usage côté serveur | `fonctionnalites` |
| frontend, Angular | `ecran_nouveau` | créer un écran ou un composant | `elements_graphiques` |
| frontend, Angular | `ecran_modifie` | modifier un composant : mise en page, libellés, états visuels | `elements_graphiques` |
| frontend, Angular | `formulaire` | ajouter ou modifier un formulaire ou ses validations | `fonctionnalites` |
| frontend, Angular | `comportement` | modifier un comportement : déclencheur, état local, appel d'API | `fonctionnalites` |
| frontend, Angular | `navigation` | ajouter ou modifier une navigation ou une route | `fonctionnalites` |

Deux entrées complètent la demande : l'`intention`, le changement attendu en une phrase, et la `maquette`, une image PNG de l'objectif, qui signale le frontend et s'analyse avec l'option qu'elle illustre.

La demande d'un ticket est la combinaison de ses possibilités à `oui`. La **règle de choix** retient les méso-contrats dont l'empreinte convient à cette combinaison :

- toute couche d'une possibilité à `oui` y a l'impact `requis` ou `optionnel` ;
- toute couche à l'impact `requis` porte au moins une possibilité à `oui` ;
- l'option de chaque possibilité à `oui` figure parmi les options permises de sa couche.

Si un seul méso-contrat convient, il est proposé. Si plusieurs conviennent, une question les départage. Si aucun ne convient, le ticket est signalé, sans catégorie inventée (D10.INV-1).

**Des possibilités établies à l'analyse de l'application.** Les quinze possibilités valent pour la pile ; celles du projet se fondent sur l'analyse de son application. À l'installation (§ 11.3 du point d'entrée), l'IA confronte le modèle à cette analyse : la cartographie produite par le skill `analyse-projet`, s'il a été appliqué, ou la lecture de la structure du projet (changelogs Liquibase, entités, contrôleurs, services, composants, routes). Elle propose au développeur :

- les possibilités qui s'appliquent, avec leurs repères dans l'application (dossiers, conventions de nommage) ;
- celles qui ne s'appliquent pas, à retirer ;
- celles qui manquent, propres à l'application : un batch, un message, un export, un rapport. Chacune est rattachée à une couche et à une option du référentiel, ou à une option nouvelle à créer.

Le développeur les écrit dans son référentiel ; l'IA ne le modifie pas (D11.INV-5, D10.INV-5). Si le référentiel du projet n'a pas encore de section `[modele_demande]`, parce qu'il a été installé avant la version 3.3.0, l'IA prend celle du modèle du skill et le signale au développeur dans la qualification.

## 3. À l'ouverture de chaque ticket

1. Lire le ticket (§ 11.1 du point d'entrée) : titre, description, critères d'acceptation, commentaires, pièces jointes.
2. Lire le référentiel du projet et noter sa version (`meta.version`).
3. Répondre, pour l'intention, la maquette et chaque possibilité, à partir du contenu du ticket : `oui`, `non` ou `inconnu`, une précision au besoin, et la source (titre, description, critère, commentaire, pièce jointe). Ce que le ticket ne dit pas reste `inconnu` ; rien ne se remplit par supposition (D11.INV-2).
4. Appliquer la règle de choix à la combinaison des possibilités à `oui`. Une possibilité `inconnu` dont la réponse changerait le méso-contrat ou ses options devient une question, de même qu'un choix entre plusieurs méso-contrats (D11.INV-2). Les autres restent `inconnu`, sans question.
5. Présenter la qualification au développeur, en un seul message (§ 4), puis attendre sa réponse : l'IA ne lit pas le code, ne cartographie pas l'impact et ne rédige pas la fiche avant la confirmation (D11.INV-1, D11.INV-3).
6. À la réponse, reporter chaque réponse dans la demande, avec pour source « développeur » et le numéro de la question ; réappliquer la règle de choix ; si le méso-contrat change, le présenter de nouveau pour confirmation.
7. Écrire `docs/demandes/<CLÉ>/ticket.toml` : la version du référentiel, la section `[ticket.demande]` avec chaque réponse et sa source, le méso-contrat et `meso_contrat_confirme = true` (D11.INV-4). Les options s'y ajoutent à l'analyse (module `referentiel`, § 3).

Si l'analyse montre ensuite que la demande sort de l'empreinte du méso-contrat confirmé, l'IA revient à cette étape : elle complète la demande, propose un autre méso-contrat et le fait confirmer, sans en changer d'elle-même (D11.INV-4).

## 4. Présenter la qualification

Un seul message, qui se lit sans le ticket. Les possibilités à `non`, et celles à `inconnu` sans effet sur le choix, n'y figurent pas :

```markdown
## Qualification de ABCDE-3512, référentiel 3.1.0

**Intention** : charger les données au clic plutôt qu'à l'ouverture de l'écran (titre)

**Demande**, d'après le ticket :
- PostgreSQL : colonne mode_chargement (description) ; lecture paginée (critères)
- Java : règle d'habilitation (critères) ; cas d'usage, fournir les données à la demande (description)
- Angular : bouton « Charger les données » (critères) ; chargement au clic, plus dans ngOnInit (titre) ; maquettes jointes
- endpoint : inconnu

**Méso-contrat proposé** : M01, EVOL_PARADIGME_PULL
- la demande touche PostgreSQL, Java et Angular ; M01 les exige toutes les trois
- M02 écarté : son frontend est à l'impact aucun ; M03 écarté : sa persistance est à l'impact aucun

**Question**
1. Faut-il ajouter un endpoint, ou modifier le contrat d'un endpoint existant ? (endpoint_nouveau, endpoint_modifie : décide de l'option endpoints)

Confirmez-vous M01 ? Je ne fais rien d'autre avant votre réponse.
```

Les questions sont numérotées, chacune avec les possibilités qu'elle règle et ce qu'elle décide. S'il n'y a aucune question, le message demande seulement la confirmation.

## 5. Méso-contrat imposé

Avec la commande `/c7e ABCDE-3512 M01` (§ 11.4 du point d'entrée), le développeur impose le méso-contrat. La qualification a lieu quand même : si la combinaison demandée s'accorde avec M01 par la règle de choix, l'imposition vaut confirmation, et les questions qui restent ne portent que sur les options. Sinon, l'IA montre l'écart et attend la décision du développeur.

## 6. Exemples

**Ticket fil rouge, `ABCDE-3512` (scénario R16).** Le ticket demande de charger les données au clic plutôt qu'à l'ouverture de l'écran. Il implique `colonne`, `lecture`, `regle`, `service`, `ecran_modifie`, `comportement` et une maquette : la combinaison touche les trois couches, et seul M01 convient. Le ticket ne dit pas si l'endpoint est ajouté ou modifié ; c'est la seule question, parce qu'elle décide de l'option `endpoints`. Les possibilités qu'il n'évoque pas, comme `table` ou `navigation`, restent `inconnu` sans question : aucune ne changerait le méso-contrat ni ses options. Le développeur répond « modifier `GET /api/v1/donnees`, pour la pagination », et confirme M01. `ticket.toml` reçoit la demande : module `referentiel`, § 7.

**Ticket ambigu (scénario R17).** « Afficher la date de dernière mise à jour sur l'écran de détail. » `ecran_modifie` est à `oui` ; `colonne`, `lecture` et `endpoint_modifie` restent `inconnu`. Si la date est déjà stockée et renvoyée par l'API, la combinaison ne touche qu'Angular, et M03 convient. Sinon, elle touche aussi PostgreSQL et Java, et M01 convient. L'IA pose donc une question : « La date de dernière mise à jour est-elle déjà stockée et renvoyée par l'API de détail ? » Elle ne propose de méso-contrat qu'après la réponse.

## 7. Contrôles

- Scénarios R16 à R18 du point d'entrée, et R13 pour le retour à la qualification.
- Les règles de validation du référentiel vérifient la demande remplie : intention et possibilités répondues et sourcées, méso-contrat conforme à la règle de choix, aucune possibilité `inconnu` qui changerait le méso-contrat, aucune option avant la confirmation.
- À l'installation, la liste des possibilités du projet est validée par le développeur, à partir de l'analyse de l'application.
