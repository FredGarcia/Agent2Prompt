---
name: methode
description: La méthode d'Agent2Dev, le skill agent-tdd-jira 1.3.1 (lecture de sa transmission, vérification par sa table d'intégrité, version épinglée, table de correspondance entre ses modules et les étapes d'Agent2Dev vérifiée au démarrage, fiches composées à partir de ses sections citées telles quelles, plafond de contexte sans troncature, extraction de ses trois scripts). À implémenter au lot 2.
dimensions: [D3]
status: active
---

# Module `methode` (D3)

`methode` est le seul lecteur du skill. Il le charge une fois au démarrage, depuis sa transmission, et le sert aux autres agents : sections pour les fiches, scripts pour l'`executant`. Il ne l'interprète pas, ne le résume pas et n'en change rien.

## 1. Lire la transmission (D3.INV-1, point E2)

La configuration humaine désigne la méthode :

```json
{ "methode": { "skill": "agent-tdd-jira", "version": "1.3.1", "transmission": "/home/fred/agent2prompt/transmissions/agent-tdd-jira-1.3.1.md" } }
```

Au démarrage, `methode.charger()` :

1. refuse un autre skill ou une autre version que agent-tdd-jira 1.3.1, avec le motif « méthode non prise en charge » (point E2) ;
2. lit la transmission en octets bruts et vérifie que son titre annonce la version épinglée (`… : skill 1.3.1, transmission texte`) ;
3. découpe les blocs de fichiers, ouverts par une ligne `^<{3}FICHIER (.+)>{3}$` et fermés par la ligne `^<{3}FIN \1>{3}$` du même chemin, comme l'en-tête de la transmission les décrit : le contenu d'un fichier est exactement le texte compris entre les deux lignes délimitrices ;
4. relit la table d'intégrité de fin de texte, une ligne `empreinte  chemin` par fichier, et vérifie que chaque fichier a sa ligne, que chaque ligne a son fichier, et que le SHA-256 de chaque contenu égale son empreinte ;
5. vérifie que le `manifest.json` reconstitué porte le nom et la version épinglés.

Un seul écart empêche le démarrage, avec le message « méthode non vérifiée : <écart> ». Le résultat est un skill en mémoire, en lecture seule : `methode.fichier(chemin)` et `methode.section(chemin, numero)`. En mode parallèle, c'est aussi la vérification du skill partagé que le kit demande (`agent-tdd-jira:D9.INV-6`).

## 2. Table de correspondance (D3.INV-4)

| Module du skill | Appliqué par | Moment |
|---|---|---|
| point d'entrée `SKILL.md` : règles globales (§ 7), critères d'acceptation (§ 8), invariants (§ 9) | toutes les fiches | chaque pas cognitif |
| `ingestion-jira` | `cadrage`, script `extraire-jira.mjs` | V1 |
| `us-criteres` | fiche `analyse`, script `controler-criteres.mjs` | V2, puis V5 |
| `analyse-demande` | fiche `analyse` | V2 |
| `impact` | fiche `impact`, recherches du `depot` | avant V3 |
| `variantes` | fiche `variantes` | V3 |
| `cycle-tdd` | fiches `contrat`, `rouge`, `vert`, `remanie` ; présentation du `realisation` | V4 |
| `binome-agent2test` | `binome`, script `lire-acceptation.mjs` | acceptation |
| `tracabilite` | `tracabilite`, fiche `rapport` | V5 |
| `parallele` | `depot`, `orchestrateur` | en mode parallèle |
| `socle/SKILL.md`, `references/java.md` et `references/angular.md`, sections « Versions cibles » et « Invariants » | fiches `variantes`, `contrat`, `rouge`, `vert`, `remanie` | V3, V4 |

Au démarrage, `methode` confronte cette table au `manifest.json` du skill : chaque module `active` du skill doit y figurer, et aucun module `reserved` (en 1.3.1, `connecteur-jira`) ne doit y figurer. Un écart empêche le démarrage avec le motif « table de correspondance incomplète : <module> ».

## 3. Fiches (D3.INV-2)

Une fiche est un fichier JSON de `fiches/`, versionné par le `referentiel`. Huit fiches en 1.0.0 : `analyse`, `impact`, `variantes`, `contrat`, `rouge`, `vert`, `remanie`, `rapport`. Leurs schémas de sortie sont dans les modules qui les emploient.

```json
{
  "code": "analyse",
  "version": "1.0.0",
  "agent": "cadrage",
  "role": "Tu rédiges, pour Agent2Dev, le contenu de us.md et du fichier Gherkin d'une demande, en appliquant les sections du skill ci-dessous. Tu rends seulement le JSON du schéma de sortie.",
  "skill": [
    { "fichier": "SKILL.md", "sections": ["7", "9"] },
    { "fichier": "modules/us-criteres/SKILL.md", "sections": ["1", "2", "3", "4", "5", "6"] },
    { "fichier": "modules/analyse-demande/SKILL.md", "sections": ["2", "3", "4", "5", "6", "8"] }
  ],
  "entrees": ["demande", "reponses", "correction", "ecarts"],
  "schema": "fiche.analyse.sortie",
  "controles": ["analyse.chemins-de-la-demande", "analyse.questions-numerotees"],
  "fragments": []
}
```

- Une section est désignée par son numéro : elle va de son titre `## N.` au titre de niveau 2 suivant, blocs de code compris. Une ligne `## ` à l'intérieur d'un bloc de code n'est pas un titre : les exemples de `us.md`, du résumé V1 et de la présentation V4 en contiennent. Une section introuvable empêche le démarrage.
- `role` cadre la sortie ; il ne redit pas la méthode. Les consignes de méthode sont les sections citées, et elles seules.
- Les leçons ratifiées pour la fiche et le moteur s'ajoutent dans une partie distincte du prompt, marquée « Leçons ratifiées » ; elles ne s'insèrent jamais dans le texte du skill (module `apprenant`).
- `fragments` est l'emplacement de la mémoire, vide en 1.0.0 (point E3).

## 4. Composer un prompt (D3.INV-5)

```text
<role de la fiche>

## Méthode : agent-tdd-jira 1.3.1, sections citées telles quelles
<fichier> § <n>
<texte de la section>
…

## Leçons ratifiées pour cette fiche et ce moteur
<leçons, ou « aucune »>

## Sortie attendue
<schéma JSON fermé>
```

Le message porte les entrées du pas, en JSON : extraits de `demande.json`, contenu courant des fichiers visés, décisions et commentaires du développeur, écarts d'un essai précédent. Il passe par le masque du noyau ; le texte du skill n'est pas masqué, il ne contient aucun secret.

- Version composée : `<fiche>@<version>+agent-tdd-jira@1.3.1+L<n>`, où `n` compte les leçons actives injectées.
- L'empreinte SHA-256 du prompt rendu est journalisée avec la version composée (D17.INV-5, module `referentiel`).
- Si le prompt et le message dépassent le plafond de contexte (`contexte.plafond`, 60 000 caractères par défaut), la fiche n'est pas envoyée, ni tronquée : le pas s'arrête et se présente au développeur, avec la taille de chaque partie. Le développeur peut réduire les fichiers visés ou relever le plafond par CP-4, dans ses bornes.

## 5. Scripts du skill (D3.INV-3)

| Script | Module du skill | Section | Bloc |
|---|---|---|---|
| `extraire-jira.mjs` | `ingestion-jira` | 3 | premier bloc `js` |
| `controler-criteres.mjs` | `us-criteres` | 7 | premier bloc `js` |
| `lire-acceptation.mjs` | `binome-agent2test` | 6 | premier bloc `js` |

- `methode.script(nom)` extrait le bloc tel quel et vérifie que sa ligne `// Usage : node <nom>` le nomme ; le `depot` l'écrit dans le dossier d'outils de la demande : `<sortie>/<CLÉ>/outils/` hors mode parallèle, `travail/outils/` en mode parallèle (`agent-tdd-jira:D9.INV-1`).
- L'empreinte de chaque script extrait est enregistrée. L'`executant` la vérifie avant chaque exécution ; un script modifié n'est pas lancé.
- Aucun autre script n'est écrit : ni Agent2Dev ni le moteur n'en réécrivent une version, même corrigée. Un défaut d'un script se signale au développeur, et se corrige par une version du skill.

## 6. Pièges connus

- **Résumer le skill pour tenir dans le plafond** : interdit ; on réduit les entrées du pas, pas la méthode.
- **Lire le skill depuis un dossier matérialisé à la main** : la transmission seule est vérifiable d'un tenant ; un dossier `.skills/` peut avoir été retouché.
- **Section citée par son titre** : les titres peuvent changer d'une version à l'autre ; le numéro et la version épinglée suffisent, et le démarrage vérifie leur existence.
- **Script repris de mémoire** : le moteur connaît peut-être un script voisin ; seul le bloc du module fait foi.

## 7. Tests (scénarios)

Jeu d'essai : `test/fixtures/methode/agent-tdd-jira-1.3.1.md`, la transmission publiée, et des copies altérées.

| Scénario | Vérifie | Cas |
|---|---|---|
| ME1 | D3.INV-1 | la transmission publiée se charge : 16 fichiers, chaque empreinte conforme, version 1.3.1 |
| ME2 | D3.INV-1 | un caractère changé dans un module empêche le démarrage « méthode non vérifiée » et nomme le fichier |
| ME3 | D3.INV-1 | une ligne de table d'intégrité sans fichier, ou un fichier sans ligne, empêche le démarrage |
| ME4 | point E2 | `agent-tdd-jira` 1.2.2 ou un autre skill est refusé « méthode non prise en charge » |
| ME5 | D3.INV-4 | la table de correspondance couvre tous les modules actifs du skill ; un module actif retiré de la table empêche le démarrage |
| ME6 | D3.INV-2 | le prompt composé de la fiche `analyse` contient chaque section citée octet pour octet, et les leçons dans leur seule partie |
| ME7 | D3.INV-2 | une section citée introuvable empêche le démarrage |
| ME8 | D3.INV-5 | un prompt au-delà du plafond n'est pas envoyé ; le pas s'arrête et présente la taille de chaque partie |
| ME9 | D3.INV-3 | les trois scripts extraits sont identiques aux blocs de leurs modules ; un script modifié après extraction n'est pas lancé |
| ME10 | point E3 | l'emplacement `fragments` de chaque fiche est vide, et `memoire.rechercher` rend une liste vide |
| ME11 | D3.INV-2 | la section 3 de `us-criteres`, dont l'exemple porte des lignes `## ` dans un bloc de code, est citée en entier, jusqu'au titre `## 4.` |

## 8. Fichiers à produire

- `src/agents/methode/agent.js`, `src/agents/methode/transmission.js`, `src/agents/methode/correspondance.js`
- `src/agents/methode/composer.js`, `src/agents/methode/scripts.js`
- `fiches/analyse.json`, `fiches/impact.json`, `fiches/variantes.json`, `fiches/contrat.json`, `fiches/rouge.json`, `fiches/vert.json`, `fiches/remanie.json`, `fiches/rapport.json`
- `test/methode/*.test.js`, `test/fixtures/methode/`
