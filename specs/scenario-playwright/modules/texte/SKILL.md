---
name: texte
description: Texte de départ d'un scénario, fichier .scenario inspiré de Gherkin en français ou en anglais, écrit par le développeur ou importé de Jira (un seul scénario par texte, étiquettes, Fonctionnalité ou Feature facultative, titre Scénario ou Scenario, réglages Adresse, Origines, Profil et Paramètre, étapes introduites par Étant donné, Soit, Sachant que, Quand, Lorsque, Alors, Donc, Et, Mais, ou Given, When, Then, And, But, marques (création), (modification), (suppression), (à la main), (par l'API), (nettoyage par l'API) et celles qui nomment un scénario de préparation ou de nettoyage, à leur place, variables <nom> et <unique>, tableau Exemples ou Examples, Contexte et Règle refusés, commentaires, erreurs données ligne par ligne, empreinte identique en LF et en CRLF, phrases conseillées et leur traduction, source de scripts/texte.mjs). À lire pour écrire un texte ou le traduire.
dimensions: [D2]
status: active
---

# Module `texte` (D2)

Phase 7E couverte : Éléments.

## 1. Principe

Le texte de départ appartient au développeur : il y dit, en français ou en anglais, ce qu'une personne fait et voit, dans l'ordre. Il l'écrit, ou l'importe d'une demande Jira (module `jira`), d'un fichier `.feature` ou d'un cas de test de Xray ou de Zephyr Scale (module `cas-de-test`). Le skill en lit la structure sans IA (`scripts/texte.mjs`) : titre, étiquettes, réglages, étapes avec leur ligne, marques, variables et exemples. La phrase d'une étape n'est pas interprétée ici : c'est la traduction en TOML qui lui donne ses actions (module `scenario`). Le texte reste la référence : sa traduction cite son empreinte, et un texte modifié rend sa traduction périmée (D3.INV-2).

## 2. Forme d'un texte (D2.INV-1)

Un fichier `.scenario`, en UTF-8, décrit un seul scénario. Ses lignes, dans cet ordre :

| Ligne | Forme | Obligatoire |
|---|---|---|
| commentaire | commence par `#`, partout ; `# language: fr` en tête, comme en Gherkin | non |
| étiquettes | `@ECR-77-S01 @ECR-77-CA01`, une ou plusieurs lignes, avant le titre | non |
| fonctionnalité | `Fonctionnalité: Clients`, une fois, avant le titre ; ses étiquettes rejoignent celles du scénario | non |
| titre | `Scénario: Créer un client`, ou un autre titre de scénario (§ 3) ; une seule fois | oui |
| réglages | `Adresse :`, `Origines :`, `Profil :`, `Paramètre :` (§ 4), entre le titre et la première étape | `Adresse` |
| étapes | une par ligne, introduite par un mot-clé (§ 3) | au moins une |
| exemples | `Exemples:`, puis un tableau (§ 6), après les étapes | non |

Les lignes vides sont libres ; l'indentation est libre. Un texte décrivant un seul scénario, `Contexte:` et `Règle:` (`Background:`, `Rule:`) y sont refusés : les étapes d'un contexte s'écrivent dans le scénario, ce que fait l'import de Jira (module `jira`, § 4). Les deux-points s'écrivent collés ou précédés d'une espace (`Scénario :`). Toute autre ligne est refusée, et chaque erreur donne sa ligne : un texte se corrige en une fois (§ 7). Les fins de ligne CRLF et un BOM sont admis.

## 3. Mots-clés, en français ou en anglais (D2.INV-4)

| Ligne | Français | Anglais |
|---|---|---|
| fonctionnalité | `Fonctionnalité:` | `Feature:`, `Business Need:`, `Ability:` |
| titre | `Scénario:`, `Exemple:`, `Plan du scénario:` | `Scenario:`, `Example:`, `Scenario Outline:`, `Scenario Template:` |
| exemples | `Exemples:`, `Scénarios:` | `Examples:`, `Scenarios:` |
| refusé dans un texte | `Contexte:`, `Règle:` | `Background:`, `Rule:` |

| Étape | Français | Anglais |
|---|---|---|
| la situation de départ | `Étant donné que`, `Étant donné qu'`, `Étant donné`, `Étant donnée`, `Étant donnés`, `Étant données`, `Soit`, `Sachant que`, `Sachant qu'`, `Sachant` | `Given` |
| le geste de l'utilisateur | `Quand`, `Lorsque`, `Lorsqu'` | `When` |
| ce qu'il voit ensuite | `Alors`, `Donc` | `Then` |
| la suite de l'étape précédente | `Et que`, `Et qu'`, `Et`, `Mais que`, `Mais qu'`, `Mais` | `And`, `But` |

Les mots-clés se reconnaissent sans tenir compte des accents ni de la casse (`Etant donne que`, `QUAND`, `given`) ; les deux langues peuvent se mêler. Ils n'ont pas d'effet sur l'exécution, seulement sur la lecture. Chaque étape garde son numéro de ligne, son mot-clé tel qu'écrit et sa phrase (D2.INV-2). Les réglages (§ 4) et les marques (§ 5) s'écrivent en français, quelle que soit la langue des mots-clés.

## 4. Réglages

| Réglage | Forme | Effet |
|---|---|---|
| `Adresse :` | `http://…` ou `https://…` | adresse de base de l'application : les chemins des étapes s'y rapportent |
| `Origines :` | origines séparées par des virgules : schéma, hôte et port, sans chemin | seules origines vers lesquelles une requête peut partir (module `garde`) ; à défaut, l'origine de l'adresse, qui doit sinon en faire partie |
| `Profil :` | minuscules, chiffres, `-` et `_` | profil du navigateur où vit la session de l'application (module `session`) ; à défaut, `defaut` |
| `Paramètre :` | `nom = valeur`, une ligne par paramètre | valeur par défaut de la variable `<nom>` ; `--param` la remplace pour une exécution |

## 5. Marques

Une marque, entre parenthèses à la fin de la phrase, dit ce que l'étape engage :

| Marque | Sens | Dans la traduction (D3.INV-4) |
|---|---|---|
| `(création)` | l'étape crée des données | une étape de sa ligne porte `mutation = "creation"` |
| `(modification)` | l'étape modifie des données | `mutation = "modification"` |
| `(suppression)` | l'étape supprime des données | `mutation = "suppression"` |
| `(à la main)` | le développeur fait l'étape lui-même, dans la fenêtre : se connecter, résoudre un défi, valider un paiement de test | une seule étape `main` |
| `(par l'API)` | la ligne prépare des données par l'API, avant les étapes | une ou plusieurs entrées `[[preparation]]` : des appels (module `donnees`) |
| `(nettoyage par l'API)` | la ligne nettoie des données par l'API, après les étapes | une ou plusieurs entrées `[[nettoyage]]` : des appels |
| `(préparation : nom)` | la ligne prépare des données par le scénario `nom.toml` | une seule entrée `[[preparation]]`, `scenario = "nom.toml"` |
| `(nettoyage : nom)` | la ligne nettoie des données par le scénario `nom.toml` | une seule entrée `[[nettoyage]]`, `scenario = "nom.toml"` |

Les marques se reconnaissent sans accents ni casse (`(creation)`, `(A la main)`, `(Par l’API)`), l'apostrophe droite ou courbe ; elles sont retirées de la phrase ; `nom` est un chemin relatif sans extension, sans `..` ni espace. Une ligne de préparation précède toute étape qui n'est ni à la main ni de préparation, une ligne de nettoyage suit toutes les autres, et il reste au moins une étape hors de la préparation et du nettoyage (D20.INV-1). Les marques de mutation déclenchent la garde du module `garde` : hors du poste, une modification de données demande l'autorisation explicite du développeur (D7.INV-2). Une étape qui modifie des données sans marque le reste : la traduction lui ajoute `mutation` et le signale au développeur (module `agent`, § 3).

## 6. Variables et exemples

Une variable s'écrit `<nom>` dans une phrase : minuscules, chiffres et `_`, commençant par une lettre. Elle doit être déclarée, par une ligne `Paramètre :` ou par une colonne du tableau d'exemples (D2.INV-2) ; la traduction l'écrit `${nom}`. `<unique>` se passe de déclaration : elle vaut un suffixe propre à chaque jeu de chaque exécution, pour nommer des données qu'un scénario rejoué ne heurte pas, et se remplace aussi dans les valeurs des paramètres et des exemples (`| Client <unique> |`) ; `unique` ne se déclare donc pas (D20.INV-6).

Le tableau d'exemples suit `Exemples:` : une ligne d'en-têtes, les noms des variables, puis une ligne par jeu de valeurs. Le scénario est joué une fois par ligne. Les cellules sont séparées par `|` ; `\|` écrit une barre dans une cellule ; chaque ligne a autant de cellules que l'en-tête.

```text
  Exemples:
    | nom    | ville |
    | Dupuis | Lyon  |
    | Leroy  | Nice  |
```

## 7. Erreurs

`node <skill>/scripts/verifier.mjs <texte.scenario>` rend toutes les erreurs, chacune avec sa ligne (0 pour une absence) :

```text
ERREUR creer.scenario, ligne 0 : titre absent : une ligne « Scénario: » est attendue
ERREUR creer.scenario, ligne 3 : ligne non reconnue : « Adress : http://127.0.0.1:4200 »
ERREUR creer.scenario, ligne 9 : variable <nom> non déclarée : ni paramètre, ni colonne d'exemples
```

Sont refusés, entre autres : une ligne `Contexte:` ou `Règle:`, un second titre, un réglage après la première étape ou avant le titre, une étape avant le titre, une adresse absente ou qui n'est pas en http ou https, une origine avec un chemin, une adresse dont l'origine n'est pas parmi les origines déclarées, une variable non déclarée ou mal nommée, une ligne d'exemples irrégulière, un tableau vide, une ligne après le tableau, des étiquettes après le titre, un profil mal nommé, un paramètre en double, un paramètre ou une colonne `unique`, un scénario de préparation mal nommé, une préparation après une étape ordinaire, une étape après le nettoyage.

## 8. Empreinte (D2.INV-3)

L'empreinte d'un texte est le SHA-256 de son contenu en fins de ligne LF, sans BOM, en caractères composés (NFC). Un texte extrait en CRLF, comme par Git sous Windows avec `core.autocrlf`, a la même empreinte que dans le dépôt ; tout autre changement, même un commentaire, en donne une autre, et la traduction est alors à refaire et à ratifier (D3.INV-2).

## 9. Phrases conseillées

Une phrase libre se traduit ; une phrase de cette table se traduit sans hésitation, et le sera sans IA par la dimension réservée D11. Les guillemets français entourent ce que la personne lit à l'écran : avec un index du code, ce sont eux que le squelette compare aux noms des éléments (module `code`, § 9).

| Phrase | Étape TOML |
|---|---|
| je suis sur la page « /clients » ; je vais sur la page « /clients » | `naviguer`, `url = "/clients"` |
| je clique sur le bouton « Enregistrer » | `cliquer`, `cible = { role = "button", nom = "Enregistrer" }` |
| je clique sur le lien « Nouveau client » | `cliquer`, `cible = { role = "link", nom = "Nouveau client" }` |
| je saisis « Dupuis » dans le champ « Nom » | `saisir`, `cible = { libelle = "Nom" }`, `valeur = "Dupuis"` |
| je choisis « Lyon » dans la liste « Ville » | `choisir`, `cible = { libelle = "Ville" }`, `valeur = "Lyon"` |
| je coche la case « Client actif » ; je décoche… | `cocher`, `cible = { libelle = "Client actif" }`, `valeur = true` ou `false` |
| je survole le menu « Menu » | `survoler`, `cible = { role = "button", nom = "Menu" }` |
| j'appuie sur la touche « Entrée » (« Tab », « Échap ») | `touche`, `touche = "Enter"` (`"Tab"`, `"Escape"`) |
| je joins le fichier « donnees/piece.pdf » au champ « Pièce jointe » | `televerser`, `cible = { libelle = "Pièce jointe" }`, `fichier = "donnees/piece.pdf"` |
| je télécharge l'export « Exporter en CSV » | `telecharger`, `cible = { role = "link", nom = "Exporter en CSV" }` |
| j'attends que le bouton « Continuer » soit actif | `attendre`, `etat = "actif"`, `cible = { role = "button", nom = "Continuer" }` |
| je vois « Client Dupuis créé » ; je vois le message « … » | `verifier`, `critere = "contient"`, `cible = { role = "alert" }` ou la zone où il s'affiche, `attendu = "Client Dupuis créé"` |
| je ne vois pas le bouton « Supprimer » | `verifier`, `critere = "visible"`, `cible = { role = "button", nom = "Supprimer" }`, `attendu = false` |
| le champ « Nom » contient « Dupuis » | `verifier`, `critere = "valeur"`, `cible = { libelle = "Nom" }`, `attendu = "Dupuis"` |
| je vois 3 boutons « Supprimer » | `verifier`, `critere = "nombre"`, `cible = { role = "button", nom = "Supprimer" }`, `attendu = 3` |
| l'adresse est « /clients » | `verifier`, `critere = "url"`, `attendu = "/clients"` |
| le bouton « Archiver » est inactif | `verifier`, `critere = "actif"`, `cible = { role = "button", nom = "Archiver" }`, `attendu = false` |
| la requête POST « /api/clients » répond 201 | `verifier`, `critere = "requete"`, `methode = "POST"`, `chemin = "/api/clients"`, `attendu = { statut = 201 }` (module `hors-ecran`) |
| l'API « /api/clients/Dupuis » donne la ville « Lyon » | `verifier`, `critere = "api"`, `chemin = "/api/clients/Dupuis"`, `attendu = { contient = { ville = "Lyon" } }` |
| le fichier téléchargé contient « Lyon » dans la colonne « ville » | après un `telecharger` avec `nom = "export"` : `verifier`, `critere = "fichier"`, `fichier = "export"`, `attendu = { csv = { colonne = "ville", valeur = "Lyon" } }` |
| je capture l'écran « liste » | `capturer`, `nom = "liste"` |
| je me connecte (à la main) | `main`, `message = "je me connecte"`, `jusqua = { url = "/accueil" }` |
| le client « Client <unique> » existe (par l'API) | `[[preparation]]`, `methode = "POST"`, `chemin = "/api/clients"`, `corps = { nom = "Client ${unique}" }`, `statut = 201`, `garder = { id_client = "id" }` (module `donnees`) |
| le client est supprimé (nettoyage par l'API) | `[[nettoyage]]`, `methode = "DELETE"`, `chemin = "/api/clients/${id_client}"`, `statut = [204, 404]` |
| la fiche du client est prête (préparation : creer-client) | `[[preparation]]`, `scenario = "creer-client.toml"`, `parametres = { nom = "Client ${unique}" }` |

## 10. Exemple complet

```text
# language: fr
@ECR-77-S01 @ECR-77-CA01
Scénario: Créer un client
  Adresse : http://127.0.0.1:4200
  Origines : http://127.0.0.1:4200, http://127.0.0.1:8080
  Paramètre : ville = Lyon

  Étant donné que je me connecte (à la main)
  Quand je clique sur le lien « Nouveau client »
  Et je saisis « <nom> » dans le champ « Nom »
  Et je choisis « <ville> » dans la liste « Ville »
  Et je clique sur le bouton « Enregistrer » (création)
  Alors je vois le message « Client <nom> créé »

  Exemples:
    | nom    |
    | Dupuis |
    | Leroy  |
```

`verifier.mjs` le lit ainsi : « Créer un client », 6 étapes (l.8 à la main, l.12 création), 2 exemples, et son empreinte.

Le même scénario, mots-clés en anglais :

```text
# language: en
@ECR-77-S01 @ECR-77-CA01
Scenario Outline: Create a client
  Adresse : http://127.0.0.1:4200

  Given I log in (à la main)
  When I click the link "New client"
  And I type "<nom>" in the field "Name"
  And I click the button "Save" (création)
  Then I see the message "Client <nom> created"

  Examples:
    | nom    |
    | Dupuis |
```

## 11. Contrôle de sortie

- Un texte conforme est lu sans erreur, chaque étape avec sa ligne, son mot-clé, sa phrase, sa marque et ses variables (D2.INV-1, D2.INV-2).
- Un texte aux mots-clés anglais, ou aux synonymes français, se lit de même, mots-clés gardés tels qu'écrits (D2.INV-4).
- Un texte non conforme rend toutes ses erreurs, chacune avec sa ligne.
- Les marques de préparation et de nettoyage se lisent avec leur scénario nommé, à leur place ; une préparation après une étape ordinaire, une étape après le nettoyage, un nom invalide et `unique` déclarée sont refusés (D20.INV-1, D20.INV-6).
- Le même texte en CRLF, avec un BOM, ou en caractères décomposés, a la même empreinte (D2.INV-3).

## 12. Source `scripts/texte.mjs`

<!-- fichier : scripts/texte.mjs -->
```javascript
// scenario-playwright 1.6.7 : lecteur du texte de départ d'un scénario (fichier .scenario), sans dépendance.
//
// Le texte, inspiré de Gherkin, décrit un seul scénario : étiquettes, titre, réglages (adresse, origines,
// profil, paramètres), étapes introduites par un mot-clé de Gherkin, en français ou en anglais, et au plus
// un tableau d'exemples. Ce lecteur en tire la structure sans IA, avec le numéro de ligne de chaque étape ;
// la phrase d'une étape n'est pas interprétée : c'est la traduction en TOML qui lui donne ses actions. Une
// marque finale dit ce que l'étape engage : mutation, geste à la main, préparation ou nettoyage des données,
// par l'API ou par un autre scénario ; la préparation précède les étapes ordinaires, le nettoyage les suit
// (D20.INV-1). Les mots-clés servent aussi au lecteur des pages Jira (scripts/jira.mjs).
import { createHash } from 'node:crypto';
import { URL } from 'node:url';

export const FORMAT_TEXTE = 'scenario-playwright.texte/1';
export const MARQUES = ['creation', 'modification', 'suppression', 'main', 'preparation', 'nettoyage'];
export const RE_VARIABLE = /^[a-z][a-z0-9_]*$/;
/** Variable intégrée : un suffixe propre à chaque jeu de chaque exécution (D20.INV-6) ; nom réservé. */
export const VARIABLE_UNIQUE = 'unique';
/** Nom d'un scénario de préparation ou de nettoyage : chemin relatif, sans extension, sans « .. » ni espace. */
export const RE_NOM_SCENARIO = /^[A-Za-z0-9_][A-Za-z0-9_.-]*(?:\/[A-Za-z0-9_][A-Za-z0-9_.-]*)*$/;
export const RE_PROFIL = /^[a-z0-9][a-z0-9_-]{0,39}$/;

export class ErreurTexte extends Error {
  constructor(nom, erreurs) {
    super(erreurs.map((e) => `${nom}, ligne ${e.ligne} : ${e.message}`).join('\n'));
    this.erreurs = erreurs;
  }
}

/** Texte en fins de ligne LF, sans BOM, caractères composés (NFC) : la forme dont on prend l'empreinte. */
export function normaliser(source) {
  return source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').normalize('NFC');
}

/** Empreinte SHA-256 d'un texte de scénario, la même pour une extraction LF ou CRLF (D2.INV-3). */
export function empreinteTexte(source) {
  return createHash('sha256').update(normaliser(source), 'utf8').digest('hex');
}

/** Comparaison sans accents ni casse, pour les mots-clés et les marques. */
export const plat = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Mots-clés des étapes de Gherkin, en français et en anglais (D2.INV-4).
const MOTS_CLES = [
  /^(etant donne(?:e|s|es)? (?:que |qu'))/,
  /^(etant donne(?:e|s|es)? )/,
  /^(sachant (?:que |qu'))/,
  /^(sachant )/,
  /^(soit )/,
  /^(quand )/,
  /^(lorsque |lorsqu')/,
  /^(alors )/,
  /^(donc )/,
  /^(et (?:que |qu'))/,
  /^(et )/,
  /^(mais (?:que |qu'))/,
  /^(mais )/,
  /^(given )/,
  /^(when )/,
  /^(then )/,
  /^(and )/,
  /^(but )/,
];
// Mots-clés des titres de Gherkin, en français et en anglais, et le genre de ligne qu'ils ouvrent.
const TITRES = {
  fonctionnalite: 'fonctionnalite', feature: 'fonctionnalite', 'business need': 'fonctionnalite', ability: 'fonctionnalite',
  scenario: 'scenario', 'plan du scenario': 'scenario', 'scenario outline': 'scenario', 'scenario template': 'scenario', exemple: 'scenario', example: 'scenario',
  exemples: 'exemples', examples: 'exemples', scenarios: 'exemples',
  contexte: 'contexte', background: 'contexte',
  regle: 'regle', rule: 'regle',
};
const RE_TITRE = new RegExp(`^(${Object.keys(TITRES).sort((a, b) => b.length - a.length).join('|')})\\s*:\\s*(.*)$`);
const RE_PARENTHESE_FINALE = /\s*\(([^()]*)\)\s*$/;
const RE_REGLAGE = /^(adresse|origines|profil|parametre)\s*:\s*(.*)$/;

/**
 * Marque finale d'une phrase, sans accents ni casse : (création), (modification), (suppression), (à la main),
 * (par l'API), (nettoyage par l'API), (préparation : nom), (nettoyage : nom). Rend { marque, scenario,
 * phrase sans la marque, erreur } ; marque vaut null quand la parenthèse finale n'est pas une marque.
 */
export function lireMarque(phrase) {
  const sans = { marque: null, scenario: null, phrase, erreur: null };
  const m = RE_PARENTHESE_FINALE.exec(phrase);
  if (!m) return sans;
  const contenu = m[1].trim();
  const p = plat(contenu).replace(/\s+/g, ' ');
  const reste = phrase.slice(0, m.index).trim();
  if (['creation', 'modification', 'suppression'].includes(p)) return { ...sans, marque: p, phrase: reste };
  if (p === 'a la main') return { ...sans, marque: 'main', phrase: reste };
  const api = /^(nettoyage )?par l['’] ?api$/.exec(p);
  if (api) return { ...sans, marque: api[1] ? 'nettoyage' : 'preparation', phrase: reste };
  const sc = /^(preparation|nettoyage) ?:/.exec(p);
  if (!sc) return sans;
  const nom = contenu.slice(contenu.indexOf(':') + 1).trim().replace(/\.toml$/i, '');
  if (RE_NOM_SCENARIO.test(nom)) return { ...sans, marque: sc[1], scenario: nom, phrase: reste };
  return { ...sans, marque: sc[1], phrase: reste, erreur: `scénario de ${sc[1] === 'preparation' ? 'préparation' : 'nettoyage'} invalide : « ${nom} » (chemin relatif d'un scénario, sans « .. » ni espace)` };
}

/** Marque d'une étape du texte, lisible : création, à la main, par l'API, préparation : nom… ; '' sans marque. */
export function libelleMarque(e) {
  if (e.marque === 'preparation') return e.scenario ? `préparation : ${e.scenario}` : "par l'API";
  if (e.marque === 'nettoyage') return e.scenario ? `nettoyage : ${e.scenario}` : "nettoyage par l'API";
  return ({ creation: 'création', main: 'à la main' })[e.marque] ?? e.marque ?? '';
}

/** Mot-clé d'étape au début d'une ligne : { motCle tel qu'écrit, phrase }, ou null. */
export function lireMotCle(ligne) {
  const m = MOTS_CLES.map((re) => re.exec(plat(ligne))).find(Boolean);
  if (!m) return null;
  return { motCle: ligne.slice(0, m[1].length).trim(), phrase: ligne.slice(m[1].length).trim() };
}

/** Ligne de titre : { genre, motCle tel qu'écrit, valeur }, ou null. Genres : fonctionnalite, scenario, exemples, contexte, regle. */
export function lireTitre(ligne) {
  const m = RE_TITRE.exec(plat(ligne));
  if (!m) return null;
  const deuxPoints = ligne.indexOf(':');
  return { genre: TITRES[m[1]], motCle: ligne.slice(0, deuxPoints).trim(), valeur: ligne.slice(deuxPoints + 1).trim() };
}

/** Origine d'une adresse http ou https, ou null. */
export function origineDe(adresse) {
  try {
    const u = new URL(adresse);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.origin : null;
  } catch {
    return null;
  }
}

/** Une origine écrite seule : schéma, hôte et port éventuel, sans chemin. */
export function estOrigine(texte) {
  const o = origineDe(texte);
  return o !== null && o === texte.replace(/\/$/, '');
}

function cellules(ligne) {
  const interieur = ligne.trim().replace(/^\|/, '').replace(/\|$/, '');
  return interieur.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
}

/**
 * Analyse un texte de scénario. Rend { scenario, erreurs } : toutes les erreurs trouvées, chacune avec
 * son numéro de ligne (0 pour une absence), plutôt que la première seulement.
 */
export function analyserTexte(source) {
  const lignes = normaliser(source).split('\n');
  const erreurs = [];
  const err = (ligne, message) => erreurs.push({ ligne, message });
  const s = {
    format: FORMAT_TEXTE,
    fonctionnalite: null,
    titre: null,
    motCleTitre: null,
    etiquettes: [],
    adresse: null,
    origines: [],
    originesDeclarees: false,
    profil: null,
    parametres: {},
    etapes: [],
    jeux: null,
    empreinte: empreinteTexte(source),
  };
  let ligneTitre = 0;
  let ligneAdresse = 0;
  let ligneOrigines = 0;
  let zone = 'entete'; // entete, reglages, etapes, exemples, fin
  let tableau = null;

  for (let n = 1; n <= lignes.length; n++) {
    const brute = lignes[n - 1];
    const ligne = brute.trim();
    if (ligne === '' || ligne.startsWith('#')) continue;
    const p = plat(ligne);

    if (zone === 'exemples' || zone === 'fin') {
      if (ligne.startsWith('|') && zone === 'exemples') {
        const c = cellules(ligne);
        if (tableau.entetes === null) {
          tableau.entetes = c;
          const vues = new Set();
          for (const nom of c) {
            if (!RE_VARIABLE.test(nom)) err(n, `colonne d'exemples invalide : « ${nom} » (lettres minuscules, chiffres et _)`);
            else if (nom === VARIABLE_UNIQUE) err(n, `colonne d'exemples réservée : <${VARIABLE_UNIQUE}> vaut un suffixe propre à chaque exécution`);
            else if (vues.has(nom)) err(n, `colonne d'exemples en double : ${nom}`);
            vues.add(nom);
          }
        } else if (c.length !== tableau.entetes.length) {
          err(n, `ligne d'exemples de ${c.length} cellules, ${tableau.entetes.length} attendues`);
        } else {
          tableau.lignes.push(Object.fromEntries(tableau.entetes.map((k, i) => [k, c[i]])));
        }
        continue;
      }
      zone = 'fin';
      err(n, 'ligne non reconnue après le tableau d\'exemples');
      continue;
    }

    if (ligne.startsWith('@')) {
      if (zone !== 'entete') {
        err(n, 'étiquettes après le titre : elles se placent avant « Scénario: »');
        continue;
      }
      for (const jeton of ligne.split(/\s+/)) {
        if (!/^@\S+$/.test(jeton)) err(n, `étiquette invalide : « ${jeton} »`);
        else if (!s.etiquettes.includes(jeton.slice(1))) s.etiquettes.push(jeton.slice(1));
      }
      continue;
    }

    const titre = lireTitre(ligne);
    if (titre) {
      const valeur = titre.valeur;
      if (titre.genre === 'fonctionnalite') {
        if (zone !== 'entete' || s.fonctionnalite !== null || s.titre !== null) err(n, `« ${titre.motCle}: » se place une fois, avant le titre`);
        else s.fonctionnalite = valeur;
        continue;
      }
      if (titre.genre === 'exemples') {
        if (zone !== 'etapes') err(n, `« ${titre.motCle}: » vient après les étapes`);
        zone = 'exemples';
        tableau = { ligne: n, entetes: null, lignes: [] };
        continue;
      }
      if (titre.genre === 'contexte' || titre.genre === 'regle') {
        err(n, `« ${titre.motCle}: » n'a pas sa place dans un texte d'un seul scénario : ses étapes s'écrivent dans le scénario`);
        continue;
      }
      if (s.titre !== null) {
        err(n, `second titre : un texte décrit un seul scénario (le premier est ligne ${ligneTitre})`);
        continue;
      }
      if (valeur === '') err(n, 'titre vide');
      s.titre = valeur;
      s.motCleTitre = titre.motCle;
      ligneTitre = n;
      zone = 'reglages';
      continue;
    }

    const reglage = RE_REGLAGE.exec(p);
    if (reglage) {
      const valeur = ligne.slice(ligne.indexOf(':') + 1).trim();
      if (zone === 'entete') {
        err(n, 'réglage avant le titre « Scénario: »');
        continue;
      }
      if (zone !== 'reglages') {
        err(n, 'réglage après la première étape : les réglages suivent le titre');
        continue;
      }
      if (reglage[1] === 'adresse') {
        if (ligneAdresse) err(n, `adresse déjà donnée ligne ${ligneAdresse}`);
        else if (origineDe(valeur) === null) err(n, `adresse invalide : « ${valeur} » (http ou https)`);
        else s.adresse = valeur;
        ligneAdresse = n;
      } else if (reglage[1] === 'origines') {
        if (ligneOrigines) err(n, `origines déjà données ligne ${ligneOrigines}`);
        ligneOrigines = n;
        s.originesDeclarees = true;
        for (const o of valeur.split(',').map((x) => x.trim()).filter(Boolean)) {
          if (!estOrigine(o)) err(n, `origine invalide : « ${o} » (schéma, hôte et port, sans chemin)`);
          else if (!s.origines.includes(o.replace(/\/$/, ''))) s.origines.push(o.replace(/\/$/, ''));
        }
        if (s.origines.length === 0) err(n, 'aucune origine');
      } else if (reglage[1] === 'profil') {
        if (s.profil !== null) err(n, 'profil déjà donné');
        else if (!RE_PROFIL.test(valeur)) err(n, `profil invalide : « ${valeur} » (minuscules, chiffres, - et _)`);
        else s.profil = valeur;
      } else {
        const m = /^([^=]+)=(.*)$/.exec(valeur);
        const nom = m ? m[1].trim() : '';
        if (!m || !RE_VARIABLE.test(nom)) err(n, `paramètre invalide : « ${valeur} » (nom = valeur, nom en minuscules)`);
        else if (nom === VARIABLE_UNIQUE) err(n, `paramètre réservé : <${VARIABLE_UNIQUE}> vaut un suffixe propre à chaque exécution`);
        else if (Object.hasOwn(s.parametres, nom)) err(n, `paramètre en double : ${nom}`);
        else s.parametres[nom] = m[2].trim();
      }
      continue;
    }

    const motCle = lireMotCle(ligne);
    if (motCle) {
      if (zone === 'entete') {
        err(n, 'étape avant le titre « Scénario: »');
        continue;
      }
      zone = 'etapes';
      const { marque, scenario, phrase, erreur } = lireMarque(motCle.phrase);
      if (erreur) err(n, erreur);
      if (phrase === '') err(n, 'étape sans phrase');
      const variables = [...new Set([...phrase.matchAll(/<([^<>\s]+)>/g)].map((v) => v[1]))];
      for (const v of variables) if (!RE_VARIABLE.test(v)) err(n, `variable invalide : <${v}> (minuscules, chiffres et _)`);
      s.etapes.push({ ligne: n, motCle: motCle.motCle, phrase, marque, scenario, variables });
      continue;
    }

    err(n, `ligne non reconnue : « ${ligne.length > 60 ? `${ligne.slice(0, 57)}...` : ligne} »`);
  }

  if (s.titre === null) err(0, 'titre absent : une ligne « Scénario: » est attendue');
  if (s.titre !== null && s.adresse === null && !ligneAdresse) err(ligneTitre, 'adresse absente : une ligne « Adresse : http://… » suit le titre');
  if (s.titre !== null && s.etapes.length === 0) err(ligneTitre, 'aucune étape');
  // La préparation précède les étapes ordinaires, le nettoyage suit toutes les autres (D20.INV-1).
  const ordinaire = s.etapes.find((e) => !['main', 'preparation', 'nettoyage'].includes(e.marque));
  for (const e of s.etapes) {
    if (e.marque === 'preparation' && ordinaire && e.ligne > ordinaire.ligne) err(e.ligne, `préparation après l'étape de la ligne ${ordinaire.ligne} : elle se place avant les étapes qui ne sont ni à la main ni de préparation`);
  }
  const nettoyage = s.etapes.find((e) => e.marque === 'nettoyage');
  if (nettoyage) for (const e of s.etapes) if (e.marque !== 'nettoyage' && e.ligne > nettoyage.ligne) err(e.ligne, `étape après le nettoyage de la ligne ${nettoyage.ligne} : le nettoyage se place à la fin`);
  if (s.etapes.length > 0 && s.etapes.every((e) => e.marque === 'preparation' || e.marque === 'nettoyage')) err(ligneTitre, 'aucune étape hors de la préparation et du nettoyage');
  if (s.adresse !== null) {
    const o = origineDe(s.adresse);
    if (!s.originesDeclarees) s.origines = [o];
    else if (!s.origines.includes(o)) err(ligneOrigines, `l'origine de l'adresse, ${o}, n'est pas parmi les origines`);
  }
  if (tableau) {
    if (tableau.entetes === null || tableau.lignes.length === 0) err(tableau.ligne, 'tableau d\'exemples vide : une ligne d\'en-têtes et au moins une ligne de valeurs');
    else s.jeux = tableau.lignes;
  }
  const declarees = new Set([...Object.keys(s.parametres), ...(tableau?.entetes ?? []), VARIABLE_UNIQUE]);
  for (const e of s.etapes) {
    for (const v of e.variables) {
      if (RE_VARIABLE.test(v) && !declarees.has(v)) err(e.ligne, `variable <${v}> non déclarée : ni paramètre, ni colonne d'exemples`);
    }
  }
  erreurs.sort((a, b) => a.ligne - b.ligne);
  return { scenario: s, erreurs };
}

/** Lit un texte de scénario ; lève ErreurTexte avec toutes ses erreurs. */
export function lireTexte(source, nom = 'texte') {
  const { scenario, erreurs } = analyserTexte(source);
  if (erreurs.length > 0) throw new ErreurTexte(nom, erreurs);
  return scenario;
}
```
