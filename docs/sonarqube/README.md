# Règles et tests SonarQube : Java, JavaScript et TypeScript

Ce dossier accompagne le skill [`sonarqube`](../../specs/sonarqube/SKILL.md) 1.1.0. Il énumère les règles que SonarQube applique au code Java et au code JavaScript / TypeScript, et les scénarios qui vérifient l'interface de pilotage de l'expert.

| Fichier | Contenu | Lignes |
|---|---|---|
| [`regles-java.csv`](regles-java.csv) | toutes les règles de l'analyseur Java | 780 |
| [`regles-javascript-typescript.csv`](regles-javascript-typescript.csv) | toutes les règles de l'analyseur JavaScript / TypeScript | 583 |
| [`tests-pilote.csv`](tests-pilote.csv) | scénarios de recette du pilote, simulés et réels, par langage | 31 |
| [`generer-regles.mjs`](generer-regles.mjs) | régénère les deux tables de règles depuis les sources de SonarSource | |

Les fichiers CSV ont le point-virgule pour séparateur et sont encodés en UTF-8 avec BOM : Excel et LibreOffice les ouvrent directement, GitHub les affiche en tableau.

## 1. Règles Java

Source : [SonarSource/sonar-java](https://github.com/SonarSource/sonar-java), révision `50267c6` du 30 octobre 2026, fiches de règles et profils intégrés.

| Indicateur | Nombre |
|---|---|
| Règles | 780 |
| Actives | 766 |
| Dépréciées | 14 |
| Dans le profil Sonar way | 608 |
| Dans le profil Sonar agentic AI | 463 |
| Bugs | 204 |
| Vulnérabilités | 63 |
| Code smells | 513 |

Répartition des règles actives par qualité logicielle et gravité (mode MQR ; une règle peut toucher plusieurs qualités) :

| Qualité | Bloquante | Haute | Moyenne | Basse | Info |
|---|---|---|---|---|---|
| Sécurité | 3 | 29 | 20 | 17 | 0 |
| Fiabilité | 12 | 56 | 128 | 23 | 2 |
| Maintenabilité | 19 | 63 | 226 | 195 | 14 |

Colonnes de `regles-java.csv` : clé de règle (`java:S1481`), titre en anglais tel que l'interface l'affiche, type, qualité logicielle et gravité (mode MQR), sévérité (mode standard), statut, présence dans Sonar way et dans Sonar agentic AI, portée (code principal, tests, tout), tags, effort de correction.

## 2. Règles JavaScript / TypeScript

Source : [SonarSource/SonarJS](https://github.com/SonarSource/SonarJS), révision `0801972` du 30 octobre 2026. Un même analyseur traite les deux langages ; chaque règle déclare ceux auxquels elle s'applique, et SonarQube l'expose sous deux clés (`javascript:S1481`, `typescript:S1481`).

| Indicateur | Nombre |
|---|---|
| Règles | 583 |
| Actives | 555 |
| Dépréciées | 28 |
| Pour JavaScript et TypeScript | 504 |
| Pour JavaScript seulement | 30 |
| Pour TypeScript seulement | 49 |
| Dans Sonar way, JavaScript | 425 |
| Dans Sonar way, TypeScript | 440 |
| Dans Sonar way, l'un ou l'autre | 464 |
| Dans Sonar agentic AI, l'un ou l'autre | 398 |
| Bugs | 116 |
| Vulnérabilités | 70 |
| Code smells | 397 |

Répartition des règles actives par qualité logicielle et gravité (mode MQR) :

| Qualité | Bloquante | Haute | Moyenne | Basse | Info |
|---|---|---|---|---|---|
| Sécurité | 11 | 18 | 15 | 17 | 0 |
| Fiabilité | 3 | 25 | 114 | 36 | 0 |
| Maintenabilité | 22 | 41 | 171 | 147 | 1 |

Colonnes de `regles-javascript-typescript.csv` : celles de Java, plus deux colonnes oui/non « JavaScript » et « TypeScript », et la présence dans chaque profil indiquée par langage : certaines règles sont dans Sonar way pour l'un et pas pour l'autre (`S5914`, `S5906`, `S2925`…). Un tiret signifie que la règle ne s'applique pas à ce langage.

## 3. Ce que ces tables ne contiennent pas

- **Les règles du moteur de sécurité commercial.** L'analyse de flux qui détecte injections et chemins de données dangereux n'est pas publique ; l'édition Developer de SonarQube Server ajoute ces règles en plus des tables ci-dessus.
- **La version de ton instance.** Les tables suivent la branche principale des analyseurs à la date indiquée ; SonarQube Server 2026.1 LTA ou 2026.5 LTA embarque une version figée, qui peut compter quelques règles de plus ou de moins.
- **Ton profil.** Ce que tes projets appliquent réellement dépend du profil qui leur est associé. Pour la liste exacte, l'interface de pilotage exporte depuis l'instance toutes les règles des langages du projet, avec la colonne « active dans le profil du projet » (bouton « Exporter les règles en CSV », module `pilotage`, écran 3).

Les types `bug`, `vulnérabilité` et `code smell` sont ceux du mode standard. Dans ces versions des analyseurs, les anciennes revues de sécurité (Security Hotspots) sont publiées comme vulnérabilités, conformément à la dépréciation des Security Hotspots dans SonarQube Server 2026.5.

## 4. Scénarios de recette du pilote

`tests-pilote.csv` liste les 31 scénarios : 26 simulés (P1 à P26), contre un faux SonarQube, et 5 réels (R1 à R5), contre l'instance du développeur.

| Recette | Java | TypeScript | JavaScript | Java et TypeScript | Indépendants du langage | Total |
|---|---|---|---|---|---|---|
| Simulée | 11 | 5 | 0 | 2 | 8 | 26 |
| Réelle | 0 | 0 | 2 | 0 | 3 | 5 |

Ces scénarios ne testent pas le code de ton projet : ils vérifient que le pilote applique les règles du skill (branche de travail, lot validé, jeton protégé, périmètre, tests du projet remontés dans SonarQube). Les tests de ton projet, eux, tournent avant chaque analyse éphémère et leurs résultats se lisent dans SonarQube (D9.INV-7).

## 5. Régénérer les tables

```bash
git clone -q --depth 1 --filter=blob:none --sparse https://github.com/SonarSource/sonar-java.git
git -C sonar-java sparse-checkout set --no-cone \
  'sonar-java-plugin/src/main/resources/org/sonar/l10n/java/rules/java/*' \
  'sonar-java-plugin/src/main/resources/profiles/*'
git clone -q --depth 1 --filter=blob:none --sparse https://github.com/SonarSource/SonarJS.git
git -C SonarJS sparse-checkout set --no-cone \
  'sonar-plugin/javascript-checks/src/main/resources/org/sonar/l10n/javascript/rules/javascript/*'
node docs/sonarqube/generer-regles.mjs sonar-java SonarJS docs/sonarqube
```

Le script affiche les comptes et la révision de chaque source : reporter ces valeurs dans ce document, sections 1 et 2.
