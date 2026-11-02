---
name: qualification
description: Dimension D11, la qualification de chaque ticket à son ouverture, avant tout le reste. La demande du ticket est rangée dans le modèle générique de la demande du référentiel, une combinaison de possibilités de modification de l'application, couche par couche (PostgreSQL, Java, Angular), établies à l'analyse de l'application ; les questions que le ticket laisse ouvertes sont posées au développeur ; le méso-contrat principal que désigne la combinaison, et au besoin ses compléments, sont proposés, puis confirmés par le développeur avant toute analyse du code et toute fiche. À lire à l'installation et à l'ouverture de chaque ticket.
dimensions: [D11]
status: active
---

# Module `qualification` (D11)

Statut : `active`, depuis la version 3.3.0. Composition, un principal et des compléments, depuis la version 3.5.0.

## 1. Rôle

À l'ouverture d'un ticket, la première chose à faire est de trouver son méso-contrat. L'IA part du seul contenu du ticket, sans lire encore le code ni l'architecture :

1. elle range la demande du ticket dans le modèle générique de la demande ;
2. elle pose au développeur les questions que le ticket laisse ouvertes ;
3. elle propose le méso-contrat que désigne la demande, son principal, et au besoin des compléments pour ce que le principal ne porte pas.

Le développeur confirme cette composition. L'analyse et la fiche de transformation viennent ensuite (§ 3 du point d'entrée) : un ticket mal classé à l'ouverture fausserait les options, les preuves et les tests déduits.

## 2. Le modèle générique de la demande

Le modèle est une **combinaison de possibilités** : les modifications qu'un ticket peut demander à l'application, couche par couche. Il se trouve dans la section 0 du référentiel du projet, `[modele_demande]` (module `referentiel`, § 6). Chaque possibilité nomme sa couche, la modification, l'option du référentiel qu'elle engage, et ses repères dans l'application. Pour une application PostgreSQL, Java et Angular, le modèle en propose dix-sept :

| Couche | Possibilité | Modification | Option |
|---|---|---|---|
| persistance, PostgreSQL | `table` | créer une table | `schema` |
| persistance, PostgreSQL | `colonne` | ajouter ou modifier une colonne | `schema` |
| persistance, PostgreSQL | `index` | ajouter ou modifier un index, pour la performance d'une requête | `schema` |
| persistance, PostgreSQL | `contrainte` | ajouter ou modifier une contrainte : clé, unicité, NOT NULL | `schema` |
| persistance, PostgreSQL | `lecture` | lire les données d'une entité : filtre, tri, pagination, projection ou agrégat | `crud` |
| persistance, PostgreSQL | `ecriture` | créer, modifier ou supprimer les données d'une entité | `crud` |
| backend, Java | `endpoint_nouveau` | ajouter un endpoint | `endpoints` |
| backend, Java | `endpoint_modifie` | modifier le contrat d'un endpoint : paramètres, réponse, erreurs | `endpoints` |
| backend, Java | `variante_representation` | ajouter une variante de représentation d'une opération existante : un champ liste ou record retiré, ou remplacé par la date-heure de son dernier enregistrement | `representations` |
| backend, Java | `temps_reel` | tenir le front à jour en temps réel des changements d'une ressource, par un canal WebSocket STOMP (socle, SC7) | `evenements` |
| backend, Java | `regle` | ajouter ou modifier une règle métier ou une habilitation | `regles` |
| backend, Java | `service` | ajouter ou modifier un cas d'usage côté serveur | `fonctionnalites` |
| frontend, Angular | `ecran_nouveau` | créer un écran ou un composant | `elements_graphiques` |
| frontend, Angular | `ecran_modifie` | modifier un composant : mise en page, libellés, états visuels | `elements_graphiques` |
| frontend, Angular | `formulaire` | ajouter ou modifier un formulaire ou ses validations | `fonctionnalites` |
| frontend, Angular | `comportement` | modifier un comportement : déclencheur, état local, appel d'API | `fonctionnalites` |
| frontend, Angular | `navigation` | ajouter ou modifier une navigation ou une route | `fonctionnalites` |

Deux entrées complètent la demande : l'`intention`, le changement attendu en une phrase, et la `maquette`, une image PNG de l'objectif, qui signale le frontend et s'analyse avec l'option qu'elle illustre.

La demande d'un ticket est la combinaison de ses possibilités à `oui`. Un ticket peut engager **plusieurs méso-contrats** : un **principal**, qui porte le plus de sa demande, et, si le principal ne la porte pas toute, des **compléments** pour le reste. La **règle de choix** désigne cette composition :

- un méso-contrat **porte** une possibilité à `oui` si la couche de celle-ci n'y est pas à l'impact `aucun`, et si son option figure parmi les options permises de cette couche ;
- un méso-contrat **peut être principal** si chacune de ses couches à l'impact `requis` a une possibilité à `oui` qu'il porte, et si toutes ses possibilités requises (`possibilites_requises`) sont à `oui`. M04 requiert `variante_representation` : sans elle, un ticket qui modifie un endpoint ne lui est pas rattaché, même si son empreinte le permettrait ;
- le **principal** est, parmi ceux-là, celui qui porte le plus de possibilités à `oui` ; à égalité, une question les départage ;
- les possibilités à `oui` que le principal ne porte pas reçoivent des **compléments** : le plus petit nombre de méso-contrats qui les portent toutes, chacun avec ses possibilités requises à `oui` et au moins une de ces possibilités. Entre deux ensembles de même taille, on préfère celui dont chaque complément a, pour chacune de ses couches à l'impact `requis`, une possibilité restante qu'il porte ; à égalité encore, une question les départage ;
- une possibilité qu'aucun méso-contrat ne porte, ou un ticket qu'aucun méso-contrat ne peut porter en principal, est signalé, sans catégorie inventée (D10.INV-1).

Quand le principal porte toute la demande, il n'y a pas de complément : la règle redonne alors le méso-contrat unique des versions précédentes. Une couche à l'impact `aucun` dans un méso-contrat de la composition peut être couverte par un autre : l'union l'emporte. Chaque option se rattache au méso-contrat qui la permet, le principal par défaut (module `referentiel`, § 3) ; les méso-contrats transverses s'appliquent selon les couches que touche toute la composition.

**Des possibilités établies à l'analyse de l'application.** Les dix-sept possibilités valent pour la pile ; celles du projet se fondent sur l'analyse de son application. À l'installation (§ 11.3 du point d'entrée), l'IA confronte le modèle à cette analyse : la cartographie produite par le skill `analyse-projet`, s'il a été appliqué, ou la lecture de la structure du projet (changelogs Liquibase, entités, contrôleurs, services, composants, routes). Elle propose au développeur :

- les possibilités qui s'appliquent, avec leurs repères dans l'application (dossiers, conventions de nommage) ;
- celles qui ne s'appliquent pas, à retirer ;
- celles qui manquent, propres à l'application : un batch, un message, un export, un rapport. Chacune est rattachée à une couche et à une option du référentiel, ou à une option nouvelle à créer.

Le développeur les écrit dans son référentiel ; l'IA ne le modifie pas (D11.INV-5, D10.INV-5). Si le référentiel du projet n'a pas encore de section `[modele_demande]`, parce qu'il a été installé avant la version 3.3.0, l'IA prend celle du modèle du skill et le signale au développeur dans la qualification. S'il n'a pas M04, parce qu'il a été installé avant la version 3.4.0, un ticket de variante de représentation se signale sans catégorie, et l'IA indique au développeur les blocs à copier du modèle (module `referentiel`, § 6).

**Paramètres d'option au choix par ticket.** Certaines options déclarent des paramètres, chacun avec ses valeurs (`parametres` dans le référentiel). Quand le ticket ne dit pas la valeur d'un paramètre, et qu'elle changerait les possibilités à `oui` ou les preuves, la question se pose à la qualification avec les autres. C'est le cas de l'option `representations` : le mécanisme de sélection à la même URI (`parametre_vue`, `negociation_contenu`, `remplacement`) et l'exposition de la variante sans champ (`base`, `meme_uri`, `uri_propre`, qui fait passer `endpoint_nouveau` à `oui`). Le courtier de l'option `evenements` (`simple` ou `relais`) ne se demande pas : le fichier d'invariants du projet le nomme, et il est cité comme source.

## 3. À l'ouverture de chaque ticket

1. Lire le ticket (§ 11.1 du point d'entrée) : titre, description, critères d'acceptation, commentaires, pièces jointes.
2. Lire le référentiel du projet et noter sa version (`meta.version`).
3. Répondre, pour l'intention, la maquette et chaque possibilité, à partir du contenu du ticket : `oui`, `non` ou `inconnu`, une précision au besoin, et la source (titre, description, critère, commentaire, pièce jointe). Ce que le ticket ne dit pas reste `inconnu` ; rien ne se remplit par supposition (D11.INV-2).
4. Appliquer la règle de choix à la combinaison des possibilités à `oui` : le principal, puis les compléments. Une possibilité `inconnu` dont la réponse changerait la composition ou ses options devient une question, de même qu'une égalité entre principaux ou entre ensembles de compléments (D11.INV-2, D11.INV-6). Les autres restent `inconnu`, sans question.
5. Présenter la qualification au développeur, en un seul message (§ 4), puis attendre sa réponse : l'IA ne lit pas le code, ne cartographie pas l'impact et ne rédige pas la fiche avant la confirmation (D11.INV-1, D11.INV-3).
6. À la réponse, reporter chaque réponse dans la demande, avec pour source « développeur » et le numéro de la question ; réappliquer la règle de choix ; si la composition change, la présenter de nouveau pour confirmation.
7. Écrire `docs/demandes/<CLÉ>/ticket.toml` : la version du référentiel, la section `[ticket.demande]` avec chaque réponse et sa source, le principal (`meso_contrat`), les compléments s'il y en a (`complements`), et `meso_contrat_confirme = true`, qui vaut pour toute la composition (D11.INV-4). Les options s'y ajoutent à l'analyse (module `referentiel`, § 3).

Si l'analyse montre ensuite que la demande sort des empreintes de la composition confirmée, l'IA revient à cette étape : elle complète la demande, propose une autre composition et la fait confirmer, sans en changer d'elle-même (D11.INV-4).

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

Avec des compléments, le message présente la composition : le principal, avec ce qu'il porte, puis chaque complément, avec les possibilités qui le justifient.

```markdown
**Composition proposée** : M04, VARIANTE_REPRESENTATION, principal ; M01, EVOL_PARADIGME_PULL, complément
- M04 porte six des sept possibilités à oui : la variante, le temps réel, la lecture, l'endpoint, l'écran et le comportement
- M01 complète pour regle (résumé réservé au rôle COMMERCIAL), que M04 ne permet pas ; ses options se rattachent à M01
- M01 en principal écarté : il porte cinq possibilités seulement, et ne permet ni representations ni evenements

Confirmez-vous M04 avec le complément M01 ? Je ne fais rien d'autre avant votre réponse.
```

## 5. Méso-contrat imposé

Avec la commande `/c7e ABCDE-3512 M01` (§ 11.4 du point d'entrée), le développeur impose le méso-contrat ; avec `/c7e ABCDE-3655 M04 M01`, la composition, le principal d'abord. La qualification a lieu quand même : si la composition imposée porte toute la demande, que le principal peut l'être et que chaque complément porte une possibilité que le principal ne porte pas, l'imposition vaut confirmation, et les questions qui restent ne portent que sur les options. Sinon, l'IA montre l'écart et attend la décision du développeur.

## 6. Exemples

**Ticket fil rouge, `ABCDE-3512` (scénario R16).** Le ticket demande de charger les données au clic plutôt qu'à l'ouverture de l'écran. Il implique `colonne`, `lecture`, `regle`, `service`, `ecran_modifie`, `comportement` et une maquette : la combinaison touche les trois couches, et seul M01 convient. Le ticket ne dit pas si l'endpoint est ajouté ou modifié ; c'est la seule question, parce qu'elle décide de l'option `endpoints`. Les possibilités qu'il n'évoque pas, comme `table` ou `navigation`, restent `inconnu` sans question : aucune ne changerait le méso-contrat ni ses options. Le développeur répond « modifier `GET /api/v1/donnees`, pour la pagination », et confirme M01. `ticket.toml` reçoit la demande : module `referentiel`, § 7.

**Ticket ambigu (scénario R17).** « Afficher la date de dernière mise à jour sur l'écran de détail. » `ecran_modifie` est à `oui` ; `colonne`, `lecture` et `endpoint_modifie` restent `inconnu`. Si la date est déjà stockée et renvoyée par l'API, la combinaison ne touche qu'Angular, et M03 convient. Sinon, elle touche aussi PostgreSQL et Java, et M01 convient. L'IA pose donc une question : « La date de dernière mise à jour est-elle déjà stockée et renvoyée par l'API de détail ? » Elle ne propose de méso-contrat qu'après la réponse. M04 n'est pas en jeu : la demande n'a pas `variante_representation`, qu'il requiert ; il n'y a pas non plus de complément, M01 portant toute la demande.

**Variante de représentation en temps réel, `ABCDE-3620` (scénarios R19 et R20).** « Trouver l'endpoint de l'URI `/api/v1/commandes/{id}` avec son type de donnée ; sa composition contient le champ `lignes`, une liste. Réaliser une variante de ce type sans ce champ. Réaliser une variante à la même URI où ce champ ne sera pas intégré : les informations le concernant seront uniquement la date et l'heure du dernier enregistrement. La liste des lignes, appelée par son URI existante, devra être mise à jour en temps réel. » `variante_representation`, `temps_reel`, `endpoint_modifie` et `lecture` (un agrégat, la date-heure maximale des lignes) sont à `oui`. Seul M04 convient : M01 ne permet ni l'option `representations` ni l'option `evenements`, M02 et M03 n'ont pas ces options. Le message de qualification pose quatre questions :

```markdown
**Méso-contrat proposé** : M04, VARIANTE_REPRESENTATION
- la demande dérive une variante du type de réponse de GET /api/v1/commandes/{id}, et tient à jour en temps réel la liste servie par GET /api/v1/commandes/{id}/lignes ; M04 requiert la variante et permet le temps réel (socle, SC7)
- M01 écarté : il ne permet ni l'option representations ni l'option evenements ; M02 et M03 écartés : ni l'un ni l'autre ne les permet

**Questions**
1. À la même URI, comment le client choisit-il la variante résumée : paramètre de vue (?vue=resume), négociation de contenu (Accept), ou remplacement de la réponse actuelle ? (paramètre selection ; le remplacement retire un champ, il n'est possible que si la version d'API n'est pas publiée)
2. La variante sans les lignes a-t-elle une opération à elle : non, elle sert de base au résumé ; oui, à la même URI ; oui, à sa propre URI ? (paramètre exposition_sans_champ ; endpoint_nouveau)
3. Les lignes portent-elles déjà leur date-heure d'enregistrement ? (colonne : décide de l'option schema)
4. Le front Angular affiche-t-il la liste des lignes et la date-heure du résumé tenues à jour ? (ecran_modifie, comportement : décide des options frontend)

Confirmez-vous M04 ? Je ne fais rien d'autre avant votre réponse.
```

Le développeur répond : paramètre de vue, variante sans champ en base du résumé, date-heure déjà stockée, front qui affiche la liste et le résumé ; il confirme M04. À l'analyse, l'IA repère depuis l'URI l'opération, son contrôleur, `CommandeDto`, le champ `lignes`, son URI existante `GET /api/v1/commandes/{id}/lignes` et la colonne `ligne_commande.enregistree_le` ; le courtier, `relais`, vient du fichier d'invariants du projet. `ticket.toml` : module `referentiel`, § 7.2. Si le développeur avait choisi le remplacement alors que `/api/v1` est publiée, l'IA l'aurait refusé en citant le socle (SC1.INV-2) et proposé le paramètre de vue ou la négociation de contenu (R20).

**Composition, `ABCDE-3655` (scénario R21).** Le ticket de `ABCDE-3620`, avec un critère de plus : « Seuls les utilisateurs du rôle COMMERCIAL obtiennent le résumé ; les autres reçoivent 403. » `regle` passe à `oui`. M04 peut être principal et porte six possibilités ; M01 aussi, mais en porte cinq : M04 est le principal. `regle` reste : M01 la porte, M02 et M03 non. M01 est le seul complément ; il ne lui faut aucune autre possibilité, car un complément n'a pas à remplir ses couches à l'impact `requis`. Le message présente la composition (§ 4) ; le développeur la confirme ; la règle d'habilitation se rattache à M01 dans `ticket.toml` (module `referentiel`, § 7.3).

**Possibilité sans méso-contrat (scénario R22).** « Afficher en temps réel, sur l'écran de suivi, les commandes qui arrivent. » `temps_reel` et `comportement` sont à `oui`, sans `variante_representation`. M03 peut être principal et porte `comportement` ; seul M04 permet l'option `evenements`, mais il requiert `variante_representation`, à `non` : `temps_reel` n'est porté par aucun méso-contrat. L'IA le signale, propose M03 pour le reste, et suggère au développeur de permettre `evenements` dans une catégorie de son référentiel, ou d'en créer une ; elle n'écrit pas le référentiel et ne commence pas l'analyse.

**Égalité entre principaux.** « Corriger un libellé et ajouter un index sur la table des commandes. » M02 et M03 peuvent être principaux et portent chacun une possibilité ; l'un est le complément de l'autre. Une question demande lequel porte le ticket.

## 7. Contrôles

- Scénarios R16 à R18 du point d'entrée, R19 et R20 pour M04, R21 et R22 pour la composition, et R13 pour le retour à la qualification.
- Les règles de validation du référentiel vérifient la demande remplie : intention et possibilités répondues et sourcées, méso-contrat conforme à la règle de choix, aucune possibilité `inconnu` qui changerait le méso-contrat, aucune option avant la confirmation.
- À l'installation, la liste des possibilités du projet est validée par le développeur, à partir de l'analyse de l'application.
