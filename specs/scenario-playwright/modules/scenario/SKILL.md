---
name: scenario
description: Scénario TOML exécutable, format scenario-playwright.scenario/1 (clés de la racine, étapes et champs communs, valeurs par défaut, validation avant le navigateur avec l'étape et ses lignes, variables ${nom}, paramètres, jeux de valeurs et --param), traduction d'un texte de départ (squelette écrit sans IA par traduire.mjs, avec les propositions de l'index du code en commentaire, étapes complétées par l'IA, contrôle sans IA de la structure, des lignes, de l'ordre, des marques et des variables, empreinte du texte, plan présenté ligne par ligne pour la ratification ; validation des vérifications hors de l'écran ; sections de préparation et de nettoyage, ${unique} et valeurs gardées), sources de scripts/toml.mjs et scripts/scenario.mjs. À lire pour traduire, vérifier ou corriger un scénario.
dimensions: [D3]
status: active
---

# Module `scenario` (D3)

Phases 7E couvertes : Éléments et Engendrent.

## 1. Format

Un scénario est un fichier TOML, `format = "scenario-playwright.scenario/1"`, lu par un lecteur sans dépendance (`scripts/toml.mjs`, repris de generateur-skill-ticket). Clés de la racine :

| Clé | Type | Défaut | Rôle |
|---|---|---|---|
| `format` | texte | | `"scenario-playwright.scenario/1"`, obligatoire |
| `titre` | texte | | titre du scénario, obligatoire |
| `etiquettes` | liste de textes sans espace | `[]` | étiquettes du texte, sans `@` : scénario et critères de l'US |
| `url_base` | adresse http ou https | | adresse de base, obligatoire ; `naviguer` et les adresses attendues s'y rapportent |
| `origines` | liste d'origines | origine de `url_base` | seules origines permises (module `garde`) ; contient celle de `url_base` |
| `profil` | minuscules, chiffres, `-`, `_` | `defaut` | profil du navigateur (module `session`) |
| `delai` | entier, de 1 à 30 | réglage, sinon 10 | délai d'une étape, en secondes (D5.INV-2) |
| `source` | chemin relatif, sans `..` | | texte de départ traduit, relatif au dossier du scénario (D3.INV-2) |
| `empreinte_source` | SHA-256 | | empreinte du texte à la traduction ; va avec `source` |
| `[parametres]` | table de valeurs | `{}` | valeurs par défaut des variables |
| `[[jeux]]` | tableau de tables | un jeu vide | une exécution par jeu ; chaque jeu a les mêmes variables |
| `[[preparation]]` | tableau de tables | | préparation des données, par un appel d'API ou un scénario (module `donnees`) |
| `[[etapes]]` | tableau de tables | | au moins une étape |
| `[[nettoyage]]` | tableau de tables | | nettoyage des données, après les étapes (module `donnees`) |

Champs communs à toutes les étapes :

| Champ | Rôle |
|---|---|
| `action` | une action du jeu fermé (module `actions`, § 1) |
| `ligne` | ligne de l'étape du texte qu'elle traduit ; obligatoire dans un scénario traduit |
| `delai` | délai de cette étape, en secondes, de 1 à 30 ; de 1 à 900 pour `main` |
| `mutation` | `creation`, `modification` ou `suppression`, pour une action qui agit : `cliquer`, `saisir`, `choisir`, `cocher`, `touche`, `televerser`, `telecharger` |

Les autres champs dépendent de l'action (module `actions`, § 1). Une clé inconnue, à la racine ou dans une étape, est refusée : une faute de frappe ne passe pas en silence.

## 2. Validation (D3.INV-1)

Un scénario n'est joué que s'il est valide. `verifier.mjs` et `jouer.mjs` font le même contrôle, avant d'ouvrir le navigateur : format, champs requis, action du jeu fermé, champs connus de l'action, cibles (module `cibles`), délais bornés, chemins de fichiers, origines des adresses, champs des vérifications hors de l'écran (module `hors-ecran`), entrées de préparation et de nettoyage (module `donnees`, § 3.4), variables déclarées ou gardées. Chaque erreur cite l'étape, sa ligne du TOML et sa ligne du texte :

```text
ERREUR creer.toml : étape 3 (ligne 26 du TOML, ligne 10 du texte) : action inconnue « clicker » ; actions : naviguer, cliquer, …
```

Les fichiers à téléverser, les jeux demandés et les valeurs de `--param` se contrôlent avec les variables substituées, toujours avant le navigateur (§ 3, D5.INV-5).

## 3. Variables, paramètres et jeux (D3.INV-6)

`${nom}` s'écrit dans tout texte d'une étape : adresse, valeur, texte attendu, message, chemin de fichier, textes d'une cible, chemin d'une vérification hors de l'écran et textes de ses tables `attendu` ; et dans une entrée de préparation ou de nettoyage : chemin, corps, paramètres d'un scénario. Sa valeur vient, dans cet ordre :

1. de `--param nom=valeur`, en ligne de commande ;
2. du jeu joué, `[[jeux]]` ;
3. de `[parametres]`.

Une variable doit être déclarée dans `[parametres]` ou dans les jeux ; un `--param` qui ne désigne ni l'un ni l'autre est refusé. Deux exceptions (module `donnees`, § 3.3, D20.INV-6) : `${unique}`, intégrée, propre à chaque jeu de chaque exécution, qui se remplace aussi dans les valeurs ; et une valeur gardée d'une préparation, connue à l'exécution seulement, qui s'emploie après sa préparation, hors des étapes à la main. `$${` écrit un `${` littéral. Le scénario est joué une fois par jeu, chaque jeu dans un onglet neuf du même profil ; `--jeu n` n'en joue qu'un.

## 4. Traduction d'un texte de départ

La traduction donne à chaque phrase du texte ses actions. Elle se fait en quatre temps : le squelette et le contrôle sont sans IA ; compléter les étapes demande de comprendre les phrases ; la ratification revient au développeur.

### 4.1 Squelette (D3.INV-5)

`node <skill>/scripts/traduire.mjs <texte.scenario>` écrit `<texte>.toml` à côté du texte, sans IA : format, titre, étiquettes, adresse, origines et profil s'ils sont déclarés, `source`, `empreinte_source`, paramètres et jeux, puis, pour chaque étape du texte, un bloc :

```toml
# ligne 12 : Et je clique sur le bouton « Enregistrer » (création)
[[etapes]]
ligne = 12
action = "à compléter"
mutation = "creation"
```

Une ligne marquée « (à la main) » reçoit déjà `action = "main"` et son `message` ; il reste à écrire `jusqua`. Une ligne de préparation ou de nettoyage reçoit son bloc `[[preparation]]` ou `[[nettoyage]]` : `methode = "à compléter"` pour un appel d'API, `scenario = "nom.toml"` et ses paramètres en commentaire pour un scénario nommé (module `donnees`). Une marque de mutation reçoit déjà sa `mutation`. Les variables à reprendre sont rappelées en commentaire. `traduire.mjs` refuse d'écraser un scénario existant sans `--remplacer`. Tant qu'une étape garde `action = "à compléter"`, le scénario est refusé.

Si le dossier du texte a un index du code à jour (module `code`), chaque étape qui n'est pas à la main reçoit aussi, en commentaire, les cibles de l'index dont le nom correspond aux libellés entre guillemets de sa phrase, et les endpoints connus d'un chemin qu'elle cite ; chaque ligne de préparation ou de nettoyage par l'API, les endpoints d'écriture qui correspondent à sa phrase et les champs de leur corps (module `code`, § 9) ; ce ne sont que des propositions, et l'étape reste à compléter (D18.INV-4). Un index périmé n'est pas employé, et `traduire.mjs` le dit (D18.INV-2).

### 4.2 Compléter les étapes

L'IA, ou le développeur, complète chaque bloc : une action du jeu fermé et ses champs. Une phrase peut donner plusieurs étapes : le bloc se recopie, avec la même ligne, dans l'ordre du texte. Rien de ce qui précède le premier bloc ne se modifie à la main : la structure vient du texte. Les phrases conseillées du module `texte`, § 9, ont leur traduction.

Avec un index du code, l'IA y lit les cibles, leurs rôles et leurs noms, les routes des adresses à visiter, les endpoints des vérifications `requete` et `api`, et les messages de validation qu'une vérification `contient` attend ; elle contrôle chaque proposition du squelette avant de la reprendre. Une phrase qui parle d'une requête, d'une réponse du back ou d'un fichier téléchargé se traduit par une vérification hors de l'écran (module `hors-ecran`).

### 4.3 Contrôle sans IA (D3.INV-2, D3.INV-3, D3.INV-4)

À chaque lecture d'un scénario qui cite `source`, `verifier.mjs` et `jouer.mjs` confrontent la traduction au texte :

| Contrôle | Refus |
|---|---|
| le texte existe, se lit sans erreur, et a l'empreinte notée | texte absent, non conforme, ou changé depuis la traduction : retraduire, puis faire ratifier |
| titre, étiquettes, adresse, origines, profil, paramètres et exemples sont ceux du texte | toute différence |
| chaque étape a une `ligne`, qui est une ligne d'étape du texte | ligne manquante, ou ligne qui n'est pas une étape |
| les lignes suivent l'ordre du texte | une étape avant celle d'une ligne précédente |
| chaque étape du texte a au moins une étape | une ligne non traduite |
| une marque `(création)`, `(modification)` ou `(suppression)` se retrouve en `mutation` sur une étape de sa ligne | marque perdue |
| une ligne « (à la main) » donne une seule étape `main` ; une étape `main` vient d'une telle ligne | `main` absente, en plusieurs étapes, ou ajoutée par la traduction |
| une ligne de préparation ou de nettoyage se traduit par ses entrées, chacune venue d'une telle ligne (module `donnees`, § 4) | ligne sans entrée, entrée sans ligne marquée, étape sur une telle ligne, autre scénario que celui nommé |
| chaque variable `<nom>` d'une ligne se retrouve en `${nom}` dans une étape de cette ligne | variable perdue |

Ce contrôle ne juge pas le sens : il ne dit pas qu'un « Enregistrer » est bien traduit par un clic sur ce bouton. C'est le rôle de la ratification.

### 4.4 Plan et ratification

`node <skill>/scripts/verifier.mjs <texte>.toml --plan` montre la traduction ligne du texte par ligne du texte :

```text
Scénario : Créer un client  (@ECR-77-S01 @ECR-77-CA01)
Adresse : http://127.0.0.1:4200 ; origines : http://127.0.0.1:4200, http://127.0.0.1:8080
Jeux : 2 (nom)
l.8  Étant donné que je me connecte (à la main)
        → à la main : « je me connecte », jusqu'à l'adresse /accueil
l.9  Quand je clique sur le lien « Nouveau client »
        → cliquer getByRole('link', { name: 'Nouveau client' })
…
l.12  Et je clique sur le bouton « Enregistrer » (création)
        → cliquer getByRole('button', { name: 'Enregistrer' })  [création]
6 étapes, dont 1 qui modifie des données, et des étapes à la main.
```

Avec un index du code à jour, `verifier.mjs` note avant le plan les cibles et les chemins du scénario absents de l'index ; ces notes ne refusent rien, mais s'examinent avec le développeur avant la ratification (D18.INV-4, D10.INV-6).

Une ligne de préparation ou de nettoyage montre ses entrées : `→ préparation : POST /api/clients { nom = "Client ${unique}" } → 201 ; garder id_client = id  [création]`, ou `→ préparation : scénario creer-client.toml { nom = "…" }` ; le total final compte les entrées.

Le développeur ratifie ce plan, ou le corrige ; rien ne se joue avant (D10.INV-1). Une correction ultérieure d'une étape se ratifie de même ; une modification du texte rend la traduction périmée, par l'empreinte.

Un scénario s'écrit aussi directement en TOML, sans texte de départ : il n'a alors ni `source` ni `ligne`, et seul le contrôle du § 2 s'applique.

## 5. Contrôle de sortie

- Un scénario valide passe ; chaque cas refusé du § 2 cite l'étape et ses lignes (D3.INV-1).
- Le squelette recopie la structure du texte et n'est pas jouable tant qu'une étape reste à compléter, propositions de l'index comprises (D3.INV-5, D18.INV-4).
- Les champs des vérifications hors de l'écran se valident avant le navigateur ; leurs variables se substituent jusque dans les tables `attendu` (D19).
- Les entrées de préparation et de nettoyage se valident avant le navigateur, se contrôlent contre le texte, et leurs scénarios nommés se lisent et se contrôlent comme tout scénario (D20).
- Chaque écart du § 4.3 est relevé ; une traduction fidèle passe, en LF comme en CRLF (D3.INV-2 à D3.INV-4).
- `--param`, jeu et `[parametres]` se combinent dans cet ordre (D3.INV-6).

## 6. Source `scripts/toml.mjs`

<!-- fichier : scripts/toml.mjs -->
```javascript
// scenario-playwright 1.6.8 : lecteur TOML des scénarios exécutables, sans dépendance.
//
// Repris tel quel du lecteur de generateur-skill-ticket 1.1.1 (outils/toml.mjs). Il lit le sous-ensemble
// de TOML 1.0 dont un scénario a besoin : tables, tableaux de tables, clés nues, entre guillemets ou
// pointées, chaînes simples, littérales et multilignes, entiers, flottants, booléens, tableaux et tables
// en ligne. Les dates et les heures, les entiers hexadécimaux, octaux ou binaires ne sont pas pris en
// charge : ils lèvent une erreur qui donne la ligne, comme toute syntaxe inconnue. Les fins de ligne CRLF
// sont admises.

export class ErreurToml extends Error {}

const RE_CLE = /[A-Za-z0-9_-]+/y;
const RE_NOMBRE = /[+-]?\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d[\d_]*)?/y;
const ECHAPPEMENTS = { b: '\b', t: '\t', n: '\n', f: '\f', r: '\r', '"': '"', '\\': '\\' };

/** Lit un texte TOML et renvoie l'objet qu'il décrit. `nom` sert aux messages d'erreur. */
export function lireToml(source, nom = 'TOML') {
  const t = source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  let i = 0;
  const racine = {};
  const explicites = new WeakSet(); // tables ouvertes par un en-tête [table]
  let courante = racine;

  const erreur = (message) => {
    const ligne = t.slice(0, i).split('\n').length;
    throw new ErreurToml(`${nom}, ligne ${ligne} : ${message}`);
  };

  const espaces = () => {
    while (t[i] === ' ' || t[i] === '\t') i++;
  };
  const commentaire = () => {
    if (t[i] === '#') while (i < t.length && t[i] !== '\n') i++;
  };
  const blancs = () => {
    for (;;) {
      if (t[i] === ' ' || t[i] === '\t' || t[i] === '\n') i++;
      else if (t[i] === '#') commentaire();
      else return;
    }
  };
  const finDeLigne = () => {
    espaces();
    commentaire();
    if (i < t.length && t[i] !== '\n') erreur(`fin de ligne attendue, « ${t[i]} » trouvé`);
    i++;
  };

  const echappement = () => {
    const c = t[i + 1];
    if (c !== undefined && Object.hasOwn(ECHAPPEMENTS, c)) {
      i += 2;
      return ECHAPPEMENTS[c];
    }
    if (c === 'u' || c === 'U') {
      const n = c === 'u' ? 4 : 8;
      const hex = t.slice(i + 2, i + 2 + n);
      if (hex.length !== n || !/^[0-9A-Fa-f]+$/.test(hex)) erreur('échappement unicode invalide');
      i += 2 + n;
      return String.fromCodePoint(parseInt(hex, 16));
    }
    return erreur(`échappement inconnu : \\${c ?? ''}`);
  };

  const chaineBasique = () => {
    i++;
    let s = '';
    for (;;) {
      if (i >= t.length) erreur('chaîne non terminée');
      const c = t[i];
      if (c === '"') {
        i++;
        return s;
      }
      if (c === '\n') erreur('retour à la ligne dans une chaîne');
      if (c === '\\') s += echappement();
      else {
        s += c;
        i++;
      }
    }
  };

  const chaineLitterale = () => {
    i++;
    const fin = t.indexOf("'", i);
    const nl = t.indexOf('\n', i);
    if (fin < 0 || (nl >= 0 && nl < fin)) erreur('chaîne littérale non terminée');
    const s = t.slice(i, fin);
    i = fin + 1;
    return s;
  };

  const chaineMultiligne = (delimiteur, avecEchappements) => {
    i += 3;
    if (t[i] === '\n') i++;
    let s = '';
    for (;;) {
      if (i >= t.length) erreur('chaîne multiligne non terminée');
      if (t.startsWith(delimiteur, i)) {
        // Jusqu'à deux guillemets peuvent précéder le délimiteur de fin.
        let n = 3;
        while (t[i + n] === delimiteur[0] && n < 5) n++;
        s += delimiteur[0].repeat(n - 3);
        i += n;
        return s;
      }
      const c = t[i];
      if (avecEchappements && c === '\\') {
        let j = i + 1;
        while (t[j] === ' ' || t[j] === '\t') j++;
        if (t[j] === '\n') {
          // Barre oblique en fin de ligne : le retour et les blancs qui suivent disparaissent.
          i = j;
          while (t[i] === ' ' || t[i] === '\t' || t[i] === '\n') i++;
        } else s += echappement();
      } else {
        s += c;
        i++;
      }
    }
  };

  const cleSimple = () => {
    if (t[i] === '"') return chaineBasique();
    if (t[i] === "'") return chaineLitterale();
    RE_CLE.lastIndex = i;
    const m = RE_CLE.exec(t);
    if (!m) erreur('clé attendue');
    i = RE_CLE.lastIndex;
    return m[0];
  };

  const chemin = () => {
    const parties = [cleSimple()];
    for (;;) {
      espaces();
      if (t[i] !== '.') return parties;
      i++;
      espaces();
      parties.push(cleSimple());
    }
  };

  const affecter = (table, ch, v) => {
    let o = table;
    for (const k of ch.slice(0, -1)) {
      if (k === '__proto__') erreur('clé interdite : __proto__');
      if (o[k] === undefined) o[k] = {};
      else if (typeof o[k] !== 'object' || Array.isArray(o[k])) erreur(`clé déjà définie : ${k}`);
      o = o[k];
    }
    const k = ch[ch.length - 1];
    if (k === '__proto__') erreur('clé interdite : __proto__');
    if (Object.hasOwn(o, k)) erreur(`clé définie deux fois : ${ch.join('.')}`);
    o[k] = v;
  };

  const tableau = () => {
    i++;
    const res = [];
    for (;;) {
      blancs();
      if (t[i] === ']') {
        i++;
        return res;
      }
      res.push(valeur());
      blancs();
      if (t[i] === ',') i++;
      else if (t[i] === ']') {
        i++;
        return res;
      } else erreur('« , » ou « ] » attendu dans un tableau');
    }
  };

  const tableEnLigne = () => {
    i++;
    const res = {};
    espaces();
    if (t[i] === '}') {
      i++;
      return res;
    }
    for (;;) {
      espaces();
      const ch = chemin();
      espaces();
      if (t[i] !== '=') erreur('« = » attendu dans une table en ligne');
      i++;
      espaces();
      affecter(res, ch, valeur());
      espaces();
      if (t[i] === ',') i++;
      else if (t[i] === '}') {
        i++;
        return res;
      } else erreur('« , » ou « } » attendu dans une table en ligne');
    }
  };

  const motCle = (mot) => t.startsWith(mot, i) && !/[A-Za-z0-9_-]/.test(t[i + mot.length] ?? '');

  function valeur() {
    if (t.startsWith('"""', i)) return chaineMultiligne('"""', true);
    if (t.startsWith("'''", i)) return chaineMultiligne("'''", false);
    const c = t[i];
    if (c === '"') return chaineBasique();
    if (c === "'") return chaineLitterale();
    if (c === '[') return tableau();
    if (c === '{') return tableEnLigne();
    if (motCle('true')) {
      i += 4;
      return true;
    }
    if (motCle('false')) {
      i += 5;
      return false;
    }
    if (/^0[xob]/.test(t.slice(i, i + 2))) erreur('entiers hexadécimaux, octaux ou binaires non pris en charge');
    RE_NOMBRE.lastIndex = i;
    const m = RE_NOMBRE.exec(t);
    if (m) {
      const apres = t[RE_NOMBRE.lastIndex];
      if (apres === '-' || apres === ':') erreur('dates et heures non prises en charge');
      if (/^[+-]?0[\d_]/.test(m[0])) erreur('nombre avec un zéro de tête');
      i = RE_NOMBRE.lastIndex;
      return Number(m[0].replace(/_/g, ''));
    }
    return erreur('valeur attendue');
  }

  const enTete = () => {
    const double = t[i + 1] === '[';
    i += double ? 2 : 1;
    espaces();
    const ch = chemin();
    espaces();
    if (double) {
      if (!t.startsWith(']]', i)) erreur('« ]] » attendu');
      i += 2;
    } else {
      if (t[i] !== ']') erreur('« ] » attendu');
      i++;
    }
    finDeLigne();
    let o = racine;
    for (const k of ch.slice(0, -1)) {
      if (k === '__proto__') erreur('clé interdite : __proto__');
      if (o[k] === undefined) o[k] = {};
      let v = o[k];
      if (Array.isArray(v)) v = v[v.length - 1];
      if (typeof v !== 'object' || v === null || Array.isArray(v)) erreur(`${k} n'est pas une table`);
      o = v;
    }
    const k = ch[ch.length - 1];
    if (k === '__proto__') erreur('clé interdite : __proto__');
    if (double) {
      if (o[k] === undefined) o[k] = [];
      if (!Array.isArray(o[k])) erreur(`${ch.join('.')} n'est pas un tableau de tables`);
      const nouvelle = {};
      o[k].push(nouvelle);
      explicites.add(nouvelle);
      courante = nouvelle;
    } else {
      if (o[k] === undefined) o[k] = {};
      const cible = o[k];
      if (typeof cible !== 'object' || cible === null || Array.isArray(cible)) erreur(`${ch.join('.')} est déjà défini autrement`);
      if (explicites.has(cible)) erreur(`table définie deux fois : [${ch.join('.')}]`);
      explicites.add(cible);
      courante = cible;
    }
  };

  for (;;) {
    blancs();
    if (i >= t.length) return racine;
    if (t[i] === '[') {
      enTete();
      continue;
    }
    const ch = chemin();
    espaces();
    if (t[i] !== '=') erreur('« = » attendu après la clé');
    i++;
    espaces();
    affecter(courante, ch, valeur());
    finDeLigne();
  }
}
```

## 7. Source `scripts/scenario.mjs`

<!-- fichier : scripts/scenario.mjs -->
```javascript
// scenario-playwright 1.6.8 : scénario TOML exécutable, contrôle de sa traduction, squelette et plan.
//
// Un scénario TOML (format scenario-playwright.scenario/1) n'est joué que s'il est valide (D3.INV-1).
// Traduit d'un texte de départ, il en cite le fichier et l'empreinte (D3.INV-2) ; sa structure et ses
// étapes se contrôlent alors contre le texte, sans IA (D3.INV-3, D3.INV-4). Le squelette d'une
// traduction se produit sans IA (D3.INV-5), et les variables se résolvent avant d'ouvrir le navigateur
// (D3.INV-6). Les critères requete, api et fichier vérifient ce qui se passe hors de l'écran (D19). Les
// sections [[preparation]] et [[nettoyage]] préparent et nettoient les données, par un appel d'API ou
// par un autre scénario ratifié, hors du jeu d'actions (D20) ; une valeur gardée de la réponse devient
// une variable, résolue à l'exécution.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { decrireCible, textesDe, transformerCible, validerCible } from './cibles.mjs';
import { analyserTexte, estOrigine, libelleMarque, origineDe, RE_PROFIL, RE_VARIABLE, VARIABLE_UNIQUE } from './texte.mjs';
import { ErreurToml, lireToml } from './toml.mjs';

export const FORMAT_SCENARIO = 'scenario-playwright.scenario/1';
export const A_COMPLETER = 'à compléter';
export const DELAI_DEFAUT = 10;
export const DELAI_MAX = 30;
export const DELAI_MAIN_DEFAUT = 300;
export const DELAI_MAIN_MAX = 900;
export const MUTATIONS = ['creation', 'modification', 'suppression'];
export const ETATS = ['visible', 'masque', 'actif', 'inactif', 'texte', 'url'];
export const CRITERES = ['contient', 'visible', 'valeur', 'nombre', 'url', 'actif', 'requete', 'api', 'fichier'];
export const CRITERES_HORS_ECRAN = ['requete', 'api', 'fichier'];
export const METHODES_REQUETE = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
/** Méthodes d'un appel de préparation ou de nettoyage, et la mutation que chacune engage (D20.INV-3). */
export const METHODES_ECRITURE = ['POST', 'PUT', 'PATCH', 'DELETE'];
export const MUTATION_DE_METHODE = { POST: 'creation', PUT: 'modification', PATCH: 'modification', DELETE: 'suppression' };
export const GENRES_ENTREES = ['preparation', 'nettoyage'];
const CHAMPS_APPEL = ['ligne', 'delai', 'methode', 'chemin', 'corps', 'corps_fichier', 'statut', 'garder'];
const CHAMPS_SOUS_SCENARIO = ['ligne', 'scenario', 'parametres'];
const RE_CHEMIN_JSON = /^(?:\.|[^.\s]+(?:\.[^.\s]+)*)$/;
/** Noms de champs et de paramètres dont la valeur est masquée dans les rapports (D19.INV-2). */
export const RE_SECRET = /pass|pwd|secret|token|jeton|api.?key|auth|session|cookie|signature|credential|otp|cvv|iban|card|carte/i;
const RE_NOM_FICHIER = /^[a-z0-9][a-z0-9_-]{0,59}$/;
const RE_TOUCHE = /^(?:(?:Control|Shift|Alt|Meta|ControlOrMeta)\+)*(?:[!-~]|F(?:[1-9]|1[0-2])|Enter|Tab|Escape|Backspace|Delete|Insert|Home|End|PageUp|PageDown|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Space)$/;

/** Jeu d'actions fermé (D5.INV-1) : champs requis et facultatifs de chaque action. */
export const ACTIONS = {
  naviguer: { requis: ['url'], facultatifs: [] },
  cliquer: { requis: ['cible'], facultatifs: ['mutation'] },
  saisir: { requis: ['cible', 'valeur'], facultatifs: ['mutation'] },
  choisir: { requis: ['cible', 'valeur'], facultatifs: ['mutation'] },
  cocher: { requis: ['cible', 'valeur'], facultatifs: ['mutation'] },
  survoler: { requis: ['cible'], facultatifs: [] },
  touche: { requis: ['touche'], facultatifs: ['cible', 'mutation'] },
  televerser: { requis: ['cible', 'fichier'], facultatifs: ['mutation'] },
  telecharger: { requis: ['cible'], facultatifs: ['nom', 'mutation'] },
  attendre: { requis: ['etat'], facultatifs: ['cible', 'url', 'texte'] },
  verifier: { requis: ['critere'], facultatifs: ['cible', 'attendu', 'exact', 'methode', 'chemin', 'fichier'] },
  capturer: { requis: ['nom'], facultatifs: ['cible', 'pleine_page'] },
  main: { requis: ['message', 'jusqua'], facultatifs: [] },
};
const COMMUNS = ['action', 'ligne', 'delai'];
const RACINE = ['format', 'titre', 'etiquettes', 'url_base', 'origines', 'profil', 'delai', 'source', 'empreinte_source', 'parametres', 'jeux', 'preparation', 'etapes', 'nettoyage'];
const estTable = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const estTexte = (v) => typeof v === 'string' && v !== '';

export class ErreurScenario extends Error {
  constructor(nom, erreurs) {
    super(erreurs.map((e) => `${nom} : ${e}`).join('\n'));
    this.erreurs = erreurs;
  }
}

/** Chaîne TOML entre guillemets. */
export function chaineToml(s) {
  return `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t')}"`;
}

/** Variables ${nom} d'un texte ; $${ s'écrit pour un ${ littéral. */
export function variablesDe(texte) {
  return [...String(texte).matchAll(/\$\$\{|\$\{([^}]*)\}/g)].filter((m) => m[1] !== undefined).map((m) => m[1]);
}

/** Texte dont chaque ${nom} est remplacé par sa valeur. */
export function substituer(texte, valeurs) {
  return String(texte).replace(/\$\$\{|\$\{([^}]*)\}/g, (m, nom) => (nom === undefined ? '${' : String(valeurs[nom])));
}

/**
 * Variables gardées d'une préparation (D20.INV-6) : jusqu'à l'exécution, une sentinelle tient leur place dans
 * les textes substitués ; le moteur la remplace par la valeur obtenue. Un ${ littéral ($${) n'en est jamais une.
 */
const SENTINELLE = '\u0000';
const RE_SENTINELLE = /\u0000([a-z][a-z0-9_]*)\u0000/g;
export const enSentinelle = (nom) => `${SENTINELLE}${nom}${SENTINELLE}`;

/** Texte dont chaque ${nom} est remplacé par sa valeur, ou par la sentinelle d'une variable gardée. */
export function substituerPrepare(texte, valeurs, gardees = new Set()) {
  return String(texte).replace(/\$\$\{|\$\{([^}]*)\}/g, (m, nom) => {
    if (nom === undefined) return '${';
    if (Object.hasOwn(valeurs, nom)) return String(valeurs[nom]);
    return gardees.has(nom) ? enSentinelle(nom) : m;
  });
}

/** Copie d'une valeur dont les sentinelles sont remplacées par les valeurs gardées : { valeur, manquantes }. */
export function resoudreGardees(v, gardees) {
  const manquantes = new Set();
  const f = (s) => s.replace(RE_SENTINELLE, (m, nom) => { if (gardees.has(nom)) return gardees.get(nom); manquantes.add(nom); return m; });
  const valeur = transformerProfond(v, f);
  return { valeur, manquantes: [...manquantes] };
}

/** Texte lisible d'une valeur substituée : chaque sentinelle redevient ${nom}. */
export const afficherGardees = (v) => transformerProfond(v, (s) => s.replace(RE_SENTINELLE, '${$1}'));

/** Valeur de paramètre ou de jeu : ${unique}, ou <unique> recopié du texte, y est remplacé, et rien d'autre (D20.INV-6). */
const avecUnique = (v, unique) => (typeof v === 'string' && unique !== null ? v.split(`\${${VARIABLE_UNIQUE}}`).join(unique).split(`<${VARIABLE_UNIQUE}>`).join(unique) : v);

/** Suffixe ${unique} des jeux d'une exécution : six caractères propres à l'exécution, puis le numéro du jeu. */
export function jetonExecution() {
  return `${Date.now().toString(36).slice(-4)}${Math.floor(Math.random() * 1296).toString(36).padStart(2, '0')}`;
}

/** Textes d'une valeur, tables et tableaux compris (les valeurs, pas les clés). */
const textesProfonds = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(textesProfonds) : estTable(v) ? Object.values(v).flatMap(textesProfonds) : []);

/** Copie d'une valeur dont chaque texte, tables et tableaux compris, passe par `f`. */
const transformerProfond = (v, f) => (typeof v === 'string' ? f(v) : Array.isArray(v) ? v.map((x) => transformerProfond(x, f)) : estTable(v) ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, transformerProfond(x, f)])) : v);

/** Copie d'une valeur dont les champs au nom de secret sont masqués (D19.INV-2). */
export const masquerValeurs = (v, cle = '') => (RE_SECRET.test(cle) && v !== undefined && v !== null ? '***' : Array.isArray(v) ? v.map((x) => masquerValeurs(x)) : estTable(v) ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, masquerValeurs(x, k)])) : v);

/** Valeur écrite comme en TOML, sur une ligne : textes entre guillemets, tables { a = 1 }, tableaux [ … ]. */
export function enTexte(v) {
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(enTexte).join(', ')}]`;
  if (estTable(v)) return `{ ${Object.entries(v).map(([k, x]) => `${/^[A-Za-z0-9_-]+$/.test(k) ? k : JSON.stringify(k)} = ${enTexte(x)}`).join(', ')} }`;
  return String(v);
}

/** Tous les textes d'une étape où une variable peut figurer. */
export function textesEtape(e) {
  const t = [];
  for (const k of ['url', 'valeur', 'texte', 'message', 'nom', 'chemin']) if (typeof e[k] === 'string') t.push(e[k]);
  t.push(...textesProfonds(e.attendu));
  if (Array.isArray(e.fichier)) t.push(...e.fichier.filter((f) => typeof f === 'string'));
  else if (typeof e.fichier === 'string') t.push(e.fichier);
  if (e.cible) t.push(...textesDe(e.cible));
  if (e.jusqua) {
    if (typeof e.jusqua.url === 'string') t.push(e.jusqua.url);
    if (e.jusqua.cible) t.push(...textesDe(e.jusqua.cible));
  }
  return t;
}

/** Lignes du fichier TOML où commence chaque bloc [[etapes]] (ou d'une autre section), dans l'ordre. */
export function lignesDesEtapes(sourceToml, section = 'etapes') {
  const re = new RegExp(`^\\s*\\[\\[\\s*${section}\\s*\\]\\]\\s*(#.*)?$`);
  return sourceToml.replace(/\r\n/g, '\n').split('\n').flatMap((l, i) => (re.test(l) ? [i + 1] : []));
}

/** Textes d'une entrée de préparation ou de nettoyage où une variable peut figurer. */
export function textesEntree(e) {
  if (!estTable(e)) return [];
  const t = [];
  if (typeof e.chemin === 'string') t.push(e.chemin);
  t.push(...textesProfonds(e.corps), ...textesProfonds(e.parametres));
  return t;
}

/** Désignation d'une entrée dans un message : préparation 1 (ligne 30 du TOML, ligne 9 du texte). */
export function ouEntree(genre, i, e, lignes = []) {
  const precisions = [];
  if (lignes[i]) precisions.push(`ligne ${lignes[i]} du TOML`);
  if (estTable(e) && Number.isInteger(e.ligne)) precisions.push(`ligne ${e.ligne} du texte`);
  return `${genre === 'preparation' ? 'préparation' : 'nettoyage'} ${i + 1}${precisions.length ? ` (${precisions.join(', ')})` : ''}`;
}

/** Nom d'un scénario de préparation tel que le texte l'écrit : chemin relatif, en /, sans .toml. */
export const nomDeScenario = (rel) => String(rel).replace(/\\/g, '/').replace(/\.toml$/i, '');

/** Entrée [[preparation]] ou [[nettoyage]] (D20) : un appel d'API, ou un scénario ratifié joué dans le même onglet. */
function validerEntree(e, ou, erreurs, contexte, genre) {
  if (!estTable(e)) return erreurs.push(`${ou} : une table est attendue`);
  if (e.ligne !== undefined && !(Number.isInteger(e.ligne) && e.ligne >= 1)) erreurs.push(`${ou} : ligne est un entier à partir de 1`);
  if (e.scenario !== undefined || e.parametres !== undefined) {
    for (const k of Object.keys(e)) if (!CHAMPS_SOUS_SCENARIO.includes(k)) erreurs.push(`${ou} : champ inconnu pour un scénario de ${genre === 'preparation' ? 'préparation' : 'nettoyage'} : « ${k} » (${CHAMPS_SOUS_SCENARIO.join(', ')})`);
    if (!(typeof e.scenario === 'string' && chemin(e.scenario) && /\.toml$/i.test(e.scenario))) erreurs.push(`${ou} : scenario est le chemin relatif d'un scénario TOML, sans « .. »`);
    const simple = (v) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
    if (e.parametres !== undefined && !(estTable(e.parametres) && Object.entries(e.parametres).every(([k, v]) => RE_VARIABLE.test(k) && simple(v)))) erreurs.push(`${ou} : parametres est une table de valeurs simples, nommées en minuscules`);
    return undefined;
  }
  if (e.methode === A_COMPLETER) return erreurs.push(`${ou} : appel à compléter : methode ${METHODES_ECRITURE.join(', ')}, chemin, et corps s'il le faut (D3.INV-5)`);
  for (const k of Object.keys(e)) if (!CHAMPS_APPEL.includes(k)) erreurs.push(`${ou} : champ inconnu pour un appel d'API : « ${k} » (${CHAMPS_APPEL.join(', ')})`);
  if (!METHODES_ECRITURE.includes(e.methode)) erreurs.push(`${ou} : methode vaut ${METHODES_ECRITURE.join(', ')} ; une lecture se vérifie par une étape verifier, critere = "api"`);
  if (!estTexte(e.chemin)) erreurs.push(`${ou} : chemin manquant : un chemin qui commence par /, ou une adresse http(s) d'une origine déclarée`);
  else if (!e.chemin.startsWith('/') && variablesDe(e.chemin).length === 0) contexte.adresses.push({ ou, url: e.chemin, invariant: 'D20.INV-2' });
  if (e.corps !== undefined && e.corps_fichier !== undefined) erreurs.push(`${ou} : corps ou corps_fichier, pas les deux`);
  if (e.corps !== undefined && !(estTable(e.corps) || Array.isArray(e.corps))) erreurs.push(`${ou} : corps est une table ou un tableau, envoyé en JSON`);
  if (e.corps_fichier !== undefined && !(chemin(e.corps_fichier) && /\.json$/i.test(e.corps_fichier))) erreurs.push(`${ou} : corps_fichier est le chemin relatif d'un fichier .json du dossier du scénario, sans « .. »`);
  const statuts = Array.isArray(e.statut) ? e.statut : [e.statut];
  if (e.statut !== undefined && (statuts.length === 0 || !statuts.every((s) => Number.isInteger(s) && s >= 100 && s <= 599))) erreurs.push(`${ou} : statut est un code HTTP, de 100 à 599, ou une liste de codes`);
  if (e.delai !== undefined && !(Number.isInteger(e.delai) && e.delai >= 1 && e.delai <= DELAI_MAX)) erreurs.push(`${ou} : delai est un nombre entier de secondes, de 1 à ${DELAI_MAX}`);
  if (e.garder !== undefined) {
    if (genre === 'nettoyage') erreurs.push(`${ou} : garder ne s'emploie qu'en préparation : rien ne suit le nettoyage`);
    else if (!estTable(e.garder) || Object.keys(e.garder).length === 0) erreurs.push(`${ou} : garder est une table { variable = "chemin.dans.la.reponse" }`);
    else for (const [k, v] of Object.entries(e.garder)) {
      if (!RE_VARIABLE.test(k)) erreurs.push(`${ou} : garder, variable au nom invalide : ${k} (minuscules, chiffres et _)`);
      if (!(typeof v === 'string' && RE_CHEMIN_JSON.test(v))) erreurs.push(`${ou} : garder.${k} est un chemin dans la réponse JSON : id, client.id, items.0.id, ou « . » pour la réponse entière`);
    }
  }
  return undefined;
}

function chemin(rel) {
  return typeof rel === 'string' && rel !== '' && !isAbsolute(rel) && !/^[A-Za-z]:/.test(rel) && !rel.split(/[\\/]/).includes('..');
}

function validerEtape(e, ou, erreurs, contexte) {
  if (!estTable(e)) return erreurs.push(`${ou} : une table est attendue`);
  const spec = ACTIONS[e.action];
  if (e.action === A_COMPLETER) return erreurs.push(`${ou} : étape à compléter, action à choisir dans le jeu fermé (D3.INV-5)`);
  if (!spec) return erreurs.push(`${ou} : action ${e.action === undefined ? 'absente' : `inconnue « ${e.action} »`} ; actions : ${Object.keys(ACTIONS).join(', ')}`);
  const permis = new Set([...COMMUNS, ...spec.requis, ...spec.facultatifs]);
  for (const k of Object.keys(e)) if (!permis.has(k)) erreurs.push(`${ou} : champ inconnu pour ${e.action} : « ${k} »`);
  for (const k of spec.requis) if (e[k] === undefined) erreurs.push(`${ou} : ${k} manquant pour ${e.action}`);
  if (e.ligne !== undefined && !(Number.isInteger(e.ligne) && e.ligne >= 1)) erreurs.push(`${ou} : ligne est un entier à partir de 1`);
  const max = e.action === 'main' ? DELAI_MAIN_MAX : DELAI_MAX;
  if (e.delai !== undefined && !(Number.isInteger(e.delai) && e.delai >= 1 && e.delai <= max)) erreurs.push(`${ou} : delai est un nombre entier de secondes, de 1 à ${max}`);
  if (e.mutation !== undefined && !MUTATIONS.includes(e.mutation)) erreurs.push(`${ou} : mutation vaut ${MUTATIONS.join(', ')}`);
  if (e.cible !== undefined) erreurs.push(...validerCible(e.cible, `${ou}, cible`));
  const texte = (k) => { if (e[k] !== undefined && !estTexte(e[k])) erreurs.push(`${ou} : ${k} doit être un texte non vide`); };
  switch (e.action) {
    case 'naviguer':
      texte('url');
      if (estTexte(e.url) && variablesDe(e.url).length === 0) contexte.urls.push({ ou, url: e.url });
      break;
    case 'saisir': if (typeof e.valeur !== 'string') erreurs.push(`${ou} : valeur doit être un texte`); break;
    case 'choisir': texte('valeur'); break;
    case 'cocher': if (e.valeur !== undefined && typeof e.valeur !== 'boolean') erreurs.push(`${ou} : valeur vaut true ou false`); break;
    case 'touche': if (e.touche !== undefined && !(typeof e.touche === 'string' && RE_TOUCHE.test(e.touche))) erreurs.push(`${ou} : touche invalide « ${e.touche} » (Enter, Tab, Escape, ArrowDown, Control+A…)`); break;
    case 'televerser': {
      const fichiers = Array.isArray(e.fichier) ? e.fichier : [e.fichier];
      if (e.fichier !== undefined && (fichiers.length === 0 || fichiers.some((f) => !chemin(f)))) erreurs.push(`${ou} : fichier est un chemin relatif au dossier du scénario, sans « .. » (D5.INV-5)`);
      break;
    }
    case 'telecharger':
    case 'capturer':
      if (e.nom !== undefined && !(typeof e.nom === 'string' && RE_NOM_FICHIER.test(e.nom))) erreurs.push(`${ou} : nom invalide « ${e.nom} » (minuscules, chiffres, - et _)`);
      else if (e.action === 'telecharger' && e.nom !== undefined) contexte.telechargements.add(e.nom);
      if (e.action === 'capturer' && e.pleine_page !== undefined && typeof e.pleine_page !== 'boolean') erreurs.push(`${ou} : pleine_page vaut true ou false`);
      break;
    case 'attendre':
      if (e.etat !== undefined && !ETATS.includes(e.etat)) erreurs.push(`${ou} : etat vaut ${ETATS.join(', ')}`);
      else if (e.etat === 'url') {
        texte('url');
        if (e.url === undefined) erreurs.push(`${ou} : url manquant pour l'état url`);
        if (e.cible !== undefined || e.texte !== undefined) erreurs.push(`${ou} : l'état url ne prend ni cible ni texte`);
      } else if (e.etat !== undefined) {
        if (e.cible === undefined) erreurs.push(`${ou} : cible manquante pour l'état ${e.etat}`);
        if (e.url !== undefined) erreurs.push(`${ou} : url ne s'emploie qu'avec l'état url`);
        if (e.etat === 'texte') { texte('texte'); if (e.texte === undefined) erreurs.push(`${ou} : texte manquant pour l'état texte`); }
        else if (e.texte !== undefined) erreurs.push(`${ou} : texte ne s'emploie qu'avec l'état texte`);
      }
      break;
    case 'verifier': {
      const c = e.critere;
      if (c !== undefined && !CRITERES.includes(c)) { erreurs.push(`${ou} : critere vaut ${CRITERES.join(', ')}`); break; }
      if (CRITERES_HORS_ECRAN.includes(c)) { validerHorsEcran(e, ou, erreurs, contexte); break; }
      for (const k of ['methode', 'chemin', 'fichier']) if (e[k] !== undefined) erreurs.push(`${ou} : ${k} ne s'emploie qu'avec les critères requete, api ou fichier`);
      if (c === 'url') { if (e.cible !== undefined) erreurs.push(`${ou} : le critère url ne prend pas de cible`); }
      else if (c !== undefined && e.cible === undefined) erreurs.push(`${ou} : cible manquante pour le critère ${c}`);
      if (e.exact !== undefined && c !== 'contient') erreurs.push(`${ou} : exact ne s'emploie qu'avec le critère contient`);
      if (e.exact !== undefined && typeof e.exact !== 'boolean') erreurs.push(`${ou} : exact vaut true ou false`);
      if (c === 'contient' || c === 'valeur' || c === 'url') {
        if (typeof e.attendu !== 'string' || (c !== 'valeur' && e.attendu === '')) erreurs.push(`${ou} : attendu doit être un texte${c === 'valeur' ? '' : ' non vide'} pour le critère ${c}`);
      } else if (c === 'nombre') {
        if (!(Number.isInteger(e.attendu) && e.attendu >= 0)) erreurs.push(`${ou} : attendu est un entier positif ou nul pour le critère nombre`);
      } else if ((c === 'visible' || c === 'actif') && e.attendu !== undefined && typeof e.attendu !== 'boolean') {
        erreurs.push(`${ou} : attendu vaut true ou false pour le critère ${c}`);
      }
      break;
    }
    case 'main':
      texte('message');
      if (e.jusqua !== undefined) {
        const j = e.jusqua;
        if (!estTable(j) || (j.url === undefined) === (j.cible === undefined)) erreurs.push(`${ou} : jusqua est { url = "…" } ou { cible = { … }, etat = "visible" }`);
        else {
          for (const k of Object.keys(j)) if (!['url', 'cible', 'etat'].includes(k)) erreurs.push(`${ou} : clé inconnue dans jusqua : « ${k} »`);
          if (j.url !== undefined && !estTexte(j.url)) erreurs.push(`${ou} : jusqua.url doit être un texte non vide`);
          if (j.url !== undefined && j.etat !== undefined) erreurs.push(`${ou} : jusqua.etat ne s'emploie qu'avec une cible`);
          if (j.cible !== undefined) erreurs.push(...validerCible(j.cible, `${ou}, jusqua.cible`));
          if (j.etat !== undefined && !['visible', 'masque'].includes(j.etat)) erreurs.push(`${ou} : jusqua.etat vaut visible ou masque`);
        }
      }
      break;
    default:
  }
  return undefined;
}

const CLES_ATTENDU = { requete: ['statut', 'corps', 'reponse'], api: ['statut', 'contient', 'nombre'], fichier: ['contient', 'lignes', 'csv'] };
const EXEMPLES_ATTENDU = { requete: '{ statut = 201, reponse = { ok = true } }', api: '{ statut = 200, contient = "Dupont" }', fichier: '{ contient = "Lyon" }, { lignes = 3 } ou { csv = { colonne = "ville", valeur = "Lyon" } }' };

/** Vérifications hors de l'écran (D19) : requête de la page, API en lecture, fichier téléchargé. */
function validerHorsEcran(e, ou, erreurs, contexte) {
  const c = e.critere;
  if (e.cible !== undefined || e.exact !== undefined) erreurs.push(`${ou} : le critère ${c} ne prend ni cible ni exact`);
  if (c === 'fichier') {
    for (const k of ['methode', 'chemin']) if (e[k] !== undefined) erreurs.push(`${ou} : ${k} ne s'emploie pas avec le critère fichier`);
    if (!(typeof e.fichier === 'string' && RE_NOM_FICHIER.test(e.fichier))) erreurs.push(`${ou} : fichier est le nom d'une étape telecharger précédente (nom = "…")`);
    else if (!contexte.telechargements.has(e.fichier)) erreurs.push(`${ou} : aucune étape telecharger précédente avec nom = "${e.fichier}"`);
  } else {
    if (e.fichier !== undefined) erreurs.push(`${ou} : fichier ne s'emploie qu'avec le critère fichier`);
    if (!estTexte(e.chemin)) erreurs.push(`${ou} : chemin manquant pour le critère ${c} : un chemin qui commence par /, ou une adresse http(s) d'une origine déclarée`);
    else if (!e.chemin.startsWith('/') && variablesDe(e.chemin).length === 0) contexte.adresses.push({ ou, url: e.chemin });
    if (e.methode !== undefined && !(typeof e.methode === 'string' && METHODES_REQUETE.includes(e.methode))) erreurs.push(`${ou} : methode vaut ${METHODES_REQUETE.join(', ')}`);
    else if (c === 'api' && e.methode !== undefined && e.methode !== 'GET') erreurs.push(`${ou} : le critère api ne fait que des GET, en lecture (D19.INV-1)`);
  }
  const a = e.attendu;
  if (a === undefined) {
    if (c === 'fichier') erreurs.push(`${ou} : attendu manquant pour le critère fichier : ${EXEMPLES_ATTENDU.fichier}`);
    return;
  }
  if (!estTable(a) || Object.keys(a).length === 0) { erreurs.push(`${ou} : attendu est une table non vide pour le critère ${c}, comme ${EXEMPLES_ATTENDU[c]}`); return; }
  for (const k of Object.keys(a)) if (!CLES_ATTENDU[c].includes(k)) erreurs.push(`${ou} : clé inconnue dans attendu pour le critère ${c} : « ${k} » (${CLES_ATTENDU[c].join(', ')})`);
  if (a.statut !== undefined && !(Number.isInteger(a.statut) && a.statut >= 100 && a.statut <= 599)) erreurs.push(`${ou} : attendu.statut est un code HTTP, de 100 à 599`);
  for (const k of ['corps', 'reponse']) if (a[k] !== undefined && !(estTable(a[k]) || Array.isArray(a[k]))) erreurs.push(`${ou} : attendu.${k} est une table ou un tableau de champs JSON`);
  if (a.contient !== undefined) {
    if (c === 'fichier' && !estTexte(a.contient)) erreurs.push(`${ou} : attendu.contient est un texte non vide`);
    else if (c === 'api' && !(estTexte(a.contient) || estTable(a.contient) || Array.isArray(a.contient))) erreurs.push(`${ou} : attendu.contient est un texte, ou une table ou un tableau de champs JSON`);
  }
  for (const k of ['nombre', 'lignes']) if (a[k] !== undefined && !(Number.isInteger(a[k]) && a[k] >= 0)) erreurs.push(`${ou} : attendu.${k} est un entier positif ou nul`);
  if (a.csv !== undefined) {
    const v = a.csv;
    if (!estTable(v) || !estTexte(v.colonne) || typeof v.valeur !== 'string' || Object.keys(v).some((k) => k !== 'colonne' && k !== 'valeur')) erreurs.push(`${ou} : attendu.csv est { colonne = "…", valeur = "…" }`);
  }
}

/**
 * Valide un scénario lu du TOML (D3.INV-1). `lignes` donne la ligne du TOML de chaque étape. Rend
 * { scenario, erreurs } ; le scénario est complété de ses valeurs par défaut (origines, délai).
 */
export function validerScenario(objet, lignes = [], lignesSections = {}) {
  const erreurs = [];
  if (!estTable(objet)) return { scenario: null, erreurs: ['le fichier ne décrit pas une table TOML'] };
  for (const k of Object.keys(objet)) if (!RACINE.includes(k)) erreurs.push(`clé inconnue : « ${k} »`);
  if (objet.format !== FORMAT_SCENARIO) erreurs.push(`format attendu : format = "${FORMAT_SCENARIO}"`);
  if (!estTexte(objet.titre)) erreurs.push('titre manquant');
  if (objet.etiquettes !== undefined && !(Array.isArray(objet.etiquettes) && objet.etiquettes.every((x) => estTexte(x) && !/\s/.test(x)))) erreurs.push('etiquettes est une liste de textes sans espace');
  const origineBase = typeof objet.url_base === 'string' ? origineDe(objet.url_base) : null;
  if (origineBase === null) erreurs.push('url_base manquante ou invalide (http ou https)');
  let origines = origineBase ? [origineBase] : [];
  if (objet.origines !== undefined) {
    if (!Array.isArray(objet.origines) || objet.origines.length === 0 || !objet.origines.every((o) => typeof o === 'string' && estOrigine(o))) {
      erreurs.push('origines est une liste d\'origines : schéma, hôte et port, sans chemin');
    } else {
      origines = objet.origines.map((o) => o.replace(/\/$/, ''));
      if (origineBase && !origines.includes(origineBase)) erreurs.push(`l'origine de url_base, ${origineBase}, n'est pas parmi les origines`);
    }
  }
  if (objet.profil !== undefined && !(typeof objet.profil === 'string' && RE_PROFIL.test(objet.profil))) erreurs.push('profil invalide (minuscules, chiffres, - et _)');
  if (objet.delai !== undefined && !(Number.isInteger(objet.delai) && objet.delai >= 1 && objet.delai <= DELAI_MAX)) erreurs.push(`delai est un nombre entier de secondes, de 1 à ${DELAI_MAX}`);
  if (objet.source !== undefined && !chemin(objet.source)) erreurs.push('source est le chemin relatif du texte de départ, sans « .. »');
  if ((objet.source === undefined) !== (objet.empreinte_source === undefined)) erreurs.push('source et empreinte_source vont ensemble (D3.INV-2)');
  if (objet.empreinte_source !== undefined && !(typeof objet.empreinte_source === 'string' && /^[0-9a-f]{64}$/.test(objet.empreinte_source))) erreurs.push('empreinte_source est un SHA-256 en hexadécimal');
  const valeurSimple = (v) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
  if (objet.parametres !== undefined) {
    if (!estTable(objet.parametres)) erreurs.push('parametres est une table');
    else for (const [k, v] of Object.entries(objet.parametres)) {
      if (!RE_VARIABLE.test(k)) erreurs.push(`paramètre au nom invalide : ${k} (minuscules, chiffres et _)`);
      else if (k === VARIABLE_UNIQUE) erreurs.push(`paramètre réservé : \${${VARIABLE_UNIQUE}} vaut un suffixe propre à chaque exécution (D20.INV-6)`);
      if (!valeurSimple(v)) erreurs.push(`paramètre ${k} : un texte, un nombre ou un booléen`);
    }
  }
  if (objet.jeux !== undefined) {
    if (!Array.isArray(objet.jeux) || objet.jeux.length === 0 || !objet.jeux.every(estTable)) erreurs.push('jeux est un tableau de tables [[jeux]]');
    else {
      const cles = Object.keys(objet.jeux[0]).sort().join(',');
      objet.jeux.forEach((j, i) => {
        if (Object.keys(j).sort().join(',') !== cles) erreurs.push(`jeu ${i + 1} : mêmes variables attendues que le jeu 1`);
        for (const [k, v] of Object.entries(j)) {
          if (!RE_VARIABLE.test(k)) erreurs.push(`jeu ${i + 1} : variable au nom invalide : ${k}`);
          else if (k === VARIABLE_UNIQUE && i === 0) erreurs.push(`jeux : variable réservée : \${${VARIABLE_UNIQUE}} vaut un suffixe propre à chaque exécution (D20.INV-6)`);
          if (!valeurSimple(v)) erreurs.push(`jeu ${i + 1}, ${k} : un texte, un nombre ou un booléen`);
        }
      });
    }
  }
  const contexte = { urls: [], adresses: [], telechargements: new Set() };
  if (!Array.isArray(objet.etapes) || objet.etapes.length === 0) erreurs.push('aucune étape [[etapes]]');
  else objet.etapes.forEach((e, i) => validerEtape(e, ouEtape(i, e, lignes), erreurs, contexte));
  for (const genre of GENRES_ENTREES) {
    const liste = objet[genre];
    if (liste === undefined) continue;
    if (!Array.isArray(liste)) erreurs.push(`${genre} est un tableau de tables [[${genre}]]`);
    else liste.forEach((e, i) => validerEntree(e, ouEntree(genre, i, e, lignesSections[genre]), erreurs, contexte, genre));
  }
  for (const { ou, url } of contexte.urls) {
    if (!url.startsWith('/')) {
      const o = origineDe(url);
      if (o === null) erreurs.push(`${ou} : url est un chemin qui commence par / ou une adresse http(s)`);
      else if (!origines.includes(o)) erreurs.push(`${ou} : ${o} n'est pas parmi les origines`);
    }
  }
  for (const { ou, url, invariant } of contexte.adresses) {
    const o = origineDe(url);
    if (o === null) erreurs.push(`${ou} : chemin est un chemin qui commence par / ou une adresse http(s)`);
    else if (!origines.includes(o)) erreurs.push(`${ou} : ${o} n'est pas parmi les origines (${invariant ?? 'D19.INV-1'})`);
  }
  const declarees = new Set([...Object.keys(estTable(objet.parametres) ? objet.parametres : {}), ...Object.keys(Array.isArray(objet.jeux) && estTable(objet.jeux[0]) ? objet.jeux[0] : {}), VARIABLE_UNIQUE]);
  // Variables gardées : chacune après sa préparation, dans les étapes qui ne sont pas à la main et le nettoyage (D20.INV-6).
  const gardees = new Set();
  const toutesGardees = new Set((Array.isArray(objet.preparation) ? objet.preparation : []).flatMap((e) => (estTable(e) && estTable(e.garder) ? Object.keys(e.garder) : [])));
  const nonDeclaree = (ou, v, ici) => {
    if (toutesGardees.has(v) && !ici) return `${ou} : variable \${${v}} gardée par une préparation qui ne la précède pas, ou employée dans une étape à la main (D20.INV-6)`;
    return `${ou} : variable \${${v}} non déclarée dans [parametres] ni dans [[jeux]], ni gardée par une préparation (D3.INV-6)`;
  };
  if (Array.isArray(objet.preparation)) objet.preparation.forEach((e, i) => {
    if (!estTable(e)) return;
    const ou = ouEntree('preparation', i, e, lignesSections.preparation);
    for (const v of textesEntree(e).flatMap(variablesDe)) if (!declarees.has(v) && !gardees.has(v)) erreurs.push(nonDeclaree(ou, v, false));
    for (const k of Object.keys(estTable(e.garder) ? e.garder : {})) {
      if (declarees.has(k)) erreurs.push(`${ou} : garder.${k} : ${k === VARIABLE_UNIQUE ? 'nom réservé' : 'variable déjà déclarée dans [parametres] ou [[jeux]]'} (D20.INV-6)`);
      else if (gardees.has(k)) erreurs.push(`${ou} : garder.${k} : variable déjà gardée par une préparation précédente (D20.INV-6)`);
      gardees.add(k);
    }
  });
  if (Array.isArray(objet.etapes)) objet.etapes.forEach((e, i) => {
    if (!estTable(e)) return;
    for (const v of textesEtape(e).flatMap(variablesDe)) {
      if (!declarees.has(v) && (e.action === 'main' || !gardees.has(v))) erreurs.push(nonDeclaree(ouEtape(i, e, lignes), v, false));
    }
  });
  if (Array.isArray(objet.nettoyage)) objet.nettoyage.forEach((e, i) => {
    if (!estTable(e)) return;
    for (const v of textesEntree(e).flatMap(variablesDe)) if (!declarees.has(v) && !gardees.has(v)) erreurs.push(nonDeclaree(ouEntree('nettoyage', i, e, lignesSections.nettoyage), v, false));
  });
  if (erreurs.length > 0) return { scenario: null, erreurs };
  return { scenario: { ...objet, origines, delai: objet.delai ?? null, etiquettes: objet.etiquettes ?? [], parametres: objet.parametres ?? {}, jeux: objet.jeux ?? null, preparation: objet.preparation ?? [], nettoyage: objet.nettoyage ?? [] }, erreurs };
}

/** Désignation d'une étape dans un message : son numéro, sa ligne du TOML et sa ligne du texte. */
export function ouEtape(i, e, lignes = []) {
  const precisions = [];
  if (lignes[i]) precisions.push(`ligne ${lignes[i]} du TOML`);
  if (estTable(e) && Number.isInteger(e.ligne)) precisions.push(`ligne ${e.ligne} du texte`);
  return `étape ${i + 1}${precisions.length ? ` (${precisions.join(', ')})` : ''}`;
}

const memes = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const enTextes = (o) => Object.fromEntries(Object.entries(o ?? {}).map(([k, v]) => [k, String(v)]).sort(([a], [b]) => a.localeCompare(b)));

/**
 * Contrôle sans IA de la traduction d'un texte en scénario (D3.INV-3, D3.INV-4). `texte` est le texte
 * de départ analysé, `objet` le scénario validé. Rend la liste des écarts.
 */
export function controlerTraduction(objet, texte, lignes = [], lignesSections = {}) {
  const ecarts = [];
  if (objet.titre !== texte.titre) ecarts.push(`titre « ${objet.titre} » différent de celui du texte, « ${texte.titre} »`);
  if (!memes(objet.etiquettes ?? [], texte.etiquettes)) ecarts.push(`étiquettes ${JSON.stringify(objet.etiquettes ?? [])} différentes de celles du texte, ${JSON.stringify(texte.etiquettes)}`);
  if (objet.url_base !== texte.adresse) ecarts.push(`url_base ${objet.url_base} différente de l'adresse du texte, ${texte.adresse}`);
  if (!memes(objet.origines, texte.origines)) ecarts.push(`origines ${JSON.stringify(objet.origines)} différentes de celles du texte, ${JSON.stringify(texte.origines)}`);
  if ((objet.profil ?? null) !== texte.profil) ecarts.push(`profil ${objet.profil ?? '(aucun)'} différent de celui du texte, ${texte.profil ?? '(aucun)'}`);
  if (!memes(enTextes(objet.parametres), enTextes(texte.parametres))) ecarts.push('paramètres différents de ceux du texte');
  if (!memes((objet.jeux ?? []).map(enTextes), (texte.jeux ?? []).map(enTextes))) ecarts.push('jeux différents des exemples du texte');
  const parLigne = new Map(texte.etapes.map((e) => [e.ligne, e]));
  const couvertes = new Map();
  let precedente = 0;
  objet.etapes.forEach((e, i) => {
    const ou = ouEtape(i, e, lignes);
    if (e.ligne === undefined) return ecarts.push(`${ou} : ligne du texte manquante`);
    if (!parLigne.has(e.ligne)) return ecarts.push(`${ou} : la ligne ${e.ligne} n'est pas une étape du texte`);
    const m = parLigne.get(e.ligne).marque;
    if (GENRES_ENTREES.includes(m)) return ecarts.push(`${ou} : la ligne ${e.ligne} est une ligne de ${m === 'preparation' ? 'préparation' : 'nettoyage'} : elle se traduit dans [[${m}]], pas en étape (D20.INV-1)`);
    if (e.ligne < precedente) ecarts.push(`${ou} : ligne ${e.ligne} après la ligne ${precedente}, l'ordre du texte n'est pas suivi`);
    precedente = Math.max(precedente, e.ligne);
    if (!couvertes.has(e.ligne)) couvertes.set(e.ligne, []);
    couvertes.get(e.ligne).push(e);
    if (e.action === 'main' && parLigne.get(e.ligne).marque !== 'main') ecarts.push(`${ou} : étape main sur une ligne que le texte ne marque pas « (à la main) »`);
    return undefined;
  });
  // Préparation et nettoyage : chaque entrée vient d'une ligne marquée de son genre, dans l'ordre du texte (D20.INV-1).
  const entreesParLigne = new Map();
  for (const genre of GENRES_ENTREES) {
    let prec = 0;
    (objet[genre] ?? []).forEach((e, i) => {
      const ou = ouEntree(genre, i, e, lignesSections[genre]);
      if (e.ligne === undefined) return ecarts.push(`${ou} : ligne du texte manquante`);
      const t = parLigne.get(e.ligne);
      if (!t) return ecarts.push(`${ou} : la ligne ${e.ligne} n'est pas une étape du texte`);
      if (t.marque !== genre) return ecarts.push(`${ou} : la ligne ${e.ligne} n'est pas marquée ${genre === 'preparation' ? "(par l'API) ni (préparation : …)" : "(nettoyage par l'API) ni (nettoyage : …)"} (D20.INV-1)`);
      if (e.ligne < prec) ecarts.push(`${ou} : ligne ${e.ligne} après la ligne ${prec}, l'ordre du texte n'est pas suivi`);
      prec = Math.max(prec, e.ligne);
      if (t.scenario === null && e.scenario !== undefined) ecarts.push(`${ou} : la ligne ${e.ligne} passe par l'API : un appel (methode, chemin) est attendu, pas un scénario`);
      else if (t.scenario !== null && e.scenario === undefined) ecarts.push(`${ou} : la ligne ${e.ligne} nomme le scénario ${t.scenario} : scenario = "${t.scenario}.toml" est attendu`);
      else if (t.scenario !== null && nomDeScenario(e.scenario) !== t.scenario) ecarts.push(`${ou} : scénario ${e.scenario}, la ligne ${e.ligne} nomme ${t.scenario}`);
      if (!entreesParLigne.has(e.ligne)) entreesParLigne.set(e.ligne, []);
      entreesParLigne.get(e.ligne).push(e);
      return undefined;
    });
  }
  for (const t of texte.etapes) {
    const ou = `ligne ${t.ligne} du texte (« ${t.motCle} ${t.phrase} »)`;
    if (GENRES_ENTREES.includes(t.marque)) {
      const entrees = entreesParLigne.get(t.ligne) ?? [];
      if (entrees.length === 0) { ecarts.push(`${ou} : marquée (${libelleMarque(t)}), aucune entrée [[${t.marque}]] ne la traduit (D20.INV-1)`); continue; }
      if (t.scenario !== null && entrees.length !== 1) ecarts.push(`${ou} : marquée (${libelleMarque(t)}), une seule entrée attendue`);
      const vues = new Set(entrees.flatMap((e) => textesEntree(e).flatMap(variablesDe)));
      for (const v of t.variables) if (!vues.has(v)) ecarts.push(`${ou} : la variable <${v}> ne se retrouve en \${${v}} dans aucune de ses entrées`);
      continue;
    }
    const etapes = couvertes.get(t.ligne) ?? [];
    if (etapes.length === 0) { ecarts.push(`${ou} : aucune étape ne la traduit`); continue; }
    if (MUTATIONS.includes(t.marque) && !etapes.some((e) => e.mutation === t.marque)) ecarts.push(`${ou} : marquée (${t.marque === 'creation' ? 'création' : t.marque}), aucune étape avec mutation = "${t.marque}"`);
    if (t.marque === 'main' && (etapes.length !== 1 || etapes[0].action !== 'main')) ecarts.push(`${ou} : marquée (à la main), une seule étape main attendue`);
    const vues = new Set(etapes.flatMap((e) => textesEtape(e).flatMap(variablesDe)));
    for (const v of t.variables) if (!vues.has(v)) ecarts.push(`${ou} : la variable <${v}> ne se retrouve en \${${v}} dans aucune de ses étapes`);
  }
  return ecarts;
}

/**
 * Lit et valide un scénario TOML, et contrôle sa traduction s'il cite un texte. Rend
 * { scenario, texte, erreurs, lignes, dossier } ; aucune erreur ne lève d'exception.
 */
export function lireScenario(cheminToml, { sousScenario = false } = {}) {
  const dossier = dirname(resolve(cheminToml));
  let source;
  try {
    source = readFileSync(cheminToml, 'utf8');
  } catch (e) {
    return { scenario: null, erreurs: [`lecture impossible : ${e.code === 'ENOENT' ? 'fichier introuvable' : e.message}`], dossier };
  }
  let objet;
  try {
    objet = lireToml(source, 'TOML');
  } catch (e) {
    if (e instanceof ErreurToml) return { scenario: null, erreurs: [e.message], dossier };
    throw e;
  }
  const lignes = lignesDesEtapes(source);
  const lignesSections = Object.fromEntries(GENRES_ENTREES.map((g) => [g, lignesDesEtapes(source, g)]));
  const { scenario, erreurs } = validerScenario(objet, lignes, lignesSections);
  if (!scenario) return { scenario: null, erreurs, lignes, dossier };
  let texte = null;
  if (scenario.source) {
    const cheminTexte = join(dossier, ...scenario.source.split(/[\\/]/));
    if (!existsSync(cheminTexte)) return { scenario: null, erreurs: [`texte de départ introuvable : ${scenario.source} (D3.INV-2)`], lignes, dossier };
    const analyse = analyserTexte(readFileSync(cheminTexte, 'utf8'));
    if (analyse.erreurs.length > 0) return { scenario: null, erreurs: analyse.erreurs.map((e) => `${scenario.source}, ligne ${e.ligne} : ${e.message}`), lignes, dossier };
    texte = analyse.scenario;
    if (texte.empreinte !== scenario.empreinte_source) {
      return { scenario: null, texte, erreurs: [`${scenario.source} a changé depuis la traduction (empreinte ${texte.empreinte.slice(0, 12)}…, ${scenario.empreinte_source.slice(0, 12)}… notée) : retraduire, puis faire ratifier (D3.INV-2)`], lignes, dossier };
    }
    const ecarts = controlerTraduction(scenario, texte, lignes, lignesSections);
    if (ecarts.length > 0) return { scenario: null, texte, erreurs: ecarts, lignes, dossier };
  }
  // Scénarios de préparation et de nettoyage : chacun lu et contrôlé comme un scénario ratifié (D20.INV-5).
  // Un scénario lu à ce titre ne charge pas les siens : il ne doit pas en avoir.
  const erreursSous = [];
  if (!sousScenario) for (const genre of GENRES_ENTREES) scenario[genre].forEach((e, i) => {
    if (e.scenario === undefined) return;
    const ou = ouEntree(genre, i, e, lignesSections[genre]);
    const absolu = resolve(dossier, ...e.scenario.split(/[\\/]/));
    const rel = relative(dossier, absolu);
    if (rel.startsWith('..') || isAbsolute(rel)) { erreursSous.push(`${ou} : ${e.scenario} hors du dossier du scénario`); return; }
    if (absolu === resolve(cheminToml)) { erreursSous.push(`${ou} : un scénario ne se prépare pas par lui-même`); return; }
    if (!existsSync(absolu)) { erreursSous.push(`${ou} : scénario introuvable : ${e.scenario}`); return; }
    const sous = lireScenario(absolu, { sousScenario: true });
    if (!sous.scenario) { erreursSous.push(...sous.erreurs.map((x) => `${ou}, ${e.scenario} : ${x}`)); return; }
    const s = sous.scenario;
    if (s.preparation.length || s.nettoyage.length) erreursSous.push(`${ou} : ${e.scenario} a sa propre préparation ou son nettoyage : un scénario de préparation n'en a pas (D20.INV-5)`);
    if (s.jeux) erreursSous.push(`${ou} : ${e.scenario} a des jeux de valeurs : un scénario de préparation reçoit ses valeurs par parametres (D20.INV-5)`);
    const hors = s.origines.filter((o) => !scenario.origines.includes(o));
    if (hors.length) erreursSous.push(`${ou} : ${e.scenario} déclare des origines absentes de ce scénario : ${hors.join(', ')} (D20.INV-5)`);
    if ((s.profil ?? null) !== (scenario.profil ?? null)) erreursSous.push(`${ou} : ${e.scenario} a le profil ${s.profil ?? 'defaut'}, ce scénario le profil ${scenario.profil ?? 'defaut'} : un même onglet, un même profil (D20.INV-5)`);
    for (const k of Object.keys(e.parametres ?? {})) if (!Object.hasOwn(s.parametres, k)) erreursSous.push(`${ou} : parametres.${k} n'est pas un paramètre de ${e.scenario} (${Object.keys(s.parametres).join(', ') || 'aucun'})`);
    Object.defineProperty(e, 'charge', { value: { scenario: s, dossier: sous.dossier }, enumerable: false });
  });
  if (erreursSous.length) return { scenario: null, texte, erreurs: erreursSous, lignes, dossier };
  return { scenario, texte, erreurs: [], lignes, dossier };
}

/**
 * Jeux à jouer : valeurs de chaque jeu (--param, puis jeu, puis [parametres] ; D3.INV-6) et étapes
 * substituées, contrôlées avant d'ouvrir le navigateur. `params` : { nom: valeur } de la ligne de
 * commande ; `numeroJeu` : un seul jeu, à partir de 1 ; `unique` : le suffixe imposé (scénario de
 * préparation, qui reçoit celui du jeu qui l'appelle). Chaque jeu reçoit ${unique} (D20.INV-6), ses
 * entrées de préparation et de nettoyage préparées, et les variables gardées en sentinelles.
 * Rend { jeux, erreurs }.
 */
export function preparerJeux(scenario, dossier, params = {}, numeroJeu = null, { unique = null } = {}) {
  const erreurs = [];
  const declarees = new Set([...Object.keys(scenario.parametres), ...Object.keys(scenario.jeux?.[0] ?? {})]);
  for (const k of Object.keys(params)) if (!declarees.has(k)) erreurs.push(`--param ${k} : ${k === VARIABLE_UNIQUE ? 'variable réservée, propre à chaque exécution (D20.INV-6)' : 'ni paramètre ni colonne des jeux du scénario (D3.INV-6)'}`);
  const jeux = scenario.jeux ?? [{}];
  if (numeroJeu !== null && !(numeroJeu >= 1 && numeroJeu <= jeux.length)) erreurs.push(`--jeu ${numeroJeu} : le scénario a ${jeux.length} jeu${jeux.length > 1 ? 'x' : ''}`);
  if (erreurs.length > 0) return { jeux: [], erreurs };
  const gardees = new Set((scenario.preparation ?? []).flatMap((e) => Object.keys(e.garder ?? {})));
  const execution = unique === null ? jetonExecution() : null;
  const dansLeDossier = (f, ou) => {
    const absolu = resolve(dossier, ...f.split(/[\\/]/));
    const rel = relative(dossier, absolu);
    if (!chemin(f) || rel.startsWith('..') || isAbsolute(rel)) { erreurs.push(`${ou} : ${f} hors du dossier du scénario (D5.INV-5)`); return null; }
    if (!existsSync(absolu) || !statSync(absolu).isFile()) { erreurs.push(`${ou} : fichier introuvable : ${f}`); return null; }
    return absolu;
  };
  const origineDeclaree = (adresse, ou, invariant) => {
    if (adresse.startsWith('/')) return;
    const o = origineDe(adresse.replace(/\u0000[a-z0-9_]*\u0000/g, 'x'));
    if (o === null || !scenario.origines.includes(o)) erreurs.push(`${ou} : ${afficherGardees(adresse)} hors des origines du scénario${invariant ? ` (${invariant})` : ''}`);
  };
  const prepares = [];
  jeux.forEach((jeu, i) => {
    if (numeroJeu !== null && i + 1 !== numeroJeu) return;
    const u = unique ?? `${execution}${(i + 1).toString(36)}`;
    const valeurs = Object.fromEntries(Object.entries({ ...scenario.parametres, ...jeu, ...params }).map(([k, v]) => [k, avecUnique(v, u)]));
    valeurs[VARIABLE_UNIQUE] = u;
    const sub = (texte) => substituerPrepare(texte, valeurs, gardees);
    const etapes = scenario.etapes.map((e, k) => {
      const s = { ...e };
      for (const c of ['url', 'valeur', 'texte', 'message', 'nom', 'chemin']) if (typeof s[c] === 'string') s[c] = sub(s[c]);
      if (s.attendu !== undefined) s.attendu = transformerProfond(s.attendu, sub);
      if (s.action === 'televerser') s.fichier = (Array.isArray(s.fichier) ? s.fichier : [s.fichier]).map(sub);
      if (s.cible) s.cible = transformerCible(s.cible, sub);
      if (s.jusqua) s.jusqua = { ...s.jusqua, ...(s.jusqua.url ? { url: sub(s.jusqua.url) } : {}), ...(s.jusqua.cible ? { cible: transformerCible(s.jusqua.cible, sub) } : {}) };
      const ou = `jeu ${i + 1}, ${ouEtape(k, e)}`;
      if (s.action === 'naviguer') origineDeclaree(s.url, ou, null);
      if (s.action === 'verifier' && (s.critere === 'requete' || s.critere === 'api')) origineDeclaree(s.chemin, ou, 'D19.INV-1');
      if (s.action === 'televerser') s.fichiers = s.fichier.map((f) => dansLeDossier(f, ou) ?? resolve(dossier, f));
      return s;
    });
    const entree = (genre) => (e, k) => {
      const ou = `jeu ${i + 1}, ${ouEntree(genre, k, e)}`;
      const base = { genre, numero: k + 1, ligne: e.ligne ?? null };
      if (e.scenario !== undefined) {
        const { scenario: s, dossier: d } = e.charge ?? {};
        if (!s) { erreurs.push(`${ou} : scénario ${e.scenario} non chargé`); return { ...base, type: 'scenario', scenario: e.scenario }; }
        const parametres = Object.fromEntries(Object.entries(e.parametres ?? {}).map(([kk, v]) => [kk, typeof v === 'string' ? sub(v) : String(v)]));
        const sous = preparerJeux(s, d, parametres, null, { unique: u });
        erreurs.push(...sous.erreurs.map((x) => `${ou}, ${e.scenario} : ${x}`));
        return { ...base, type: 'scenario', scenario: e.scenario, parametres, sous: { scenario: s, jeu: sous.jeux[0] ?? null } };
      }
      const p = { ...base, type: 'api', methode: e.methode, mutation: MUTATION_DE_METHODE[e.methode], chemin: sub(e.chemin) };
      origineDeclaree(p.chemin, ou, 'D20.INV-2');
      if (e.corps !== undefined) p.corps = transformerProfond(e.corps, sub);
      if (e.corps_fichier !== undefined) {
        p.corps_fichier = e.corps_fichier;
        const absolu = dansLeDossier(e.corps_fichier, ou);
        if (absolu) {
          try { p.corps = transformerProfond(JSON.parse(readFileSync(absolu, 'utf8').replace(/^\uFEFF/, '')), sub); } catch (err) { erreurs.push(`${ou} : ${e.corps_fichier} n'est pas un JSON valide (${String(err.message).slice(0, 120)})`); }
        }
      }
      if (e.statut !== undefined) p.statut = e.statut;
      if (e.garder !== undefined) p.garder = e.garder;
      if (e.delai !== undefined) p.delai = e.delai;
      return p;
    };
    prepares.push({ numero: i + 1, valeurs, etapes, preparation: (scenario.preparation ?? []).map(entree('preparation')), nettoyage: (scenario.nettoyage ?? []).map(entree('nettoyage')) });
  });
  return { jeux: prepares, erreurs };
}

/**
 * Squelette d'une traduction, produit sans IA à partir du texte analysé (D3.INV-5). Avec `proposer`, chaque
 * étape reçoit en commentaire les propositions de l'index du code pour sa phrase (D18.INV-4) ; avec
 * `proposerAppel`, chaque ligne de préparation ou de nettoyage par l'API reçoit les endpoints d'écriture et
 * les champs de leur corps ; `parametresDe(nom)` donne les paramètres d'un scénario de préparation nommé.
 */
export function squeletteToml(texte, sourceRel, { proposer = null, proposerAppel = null, parametresDe = null, empreinteIndex = null } = {}) {
  const l = [];
  l.push(`# Traduction de ${sourceRel}, squelette produit par traduire.mjs (scenario-playwright 1.6.8).`);
  l.push('# La structure vient du texte, sans IA. Chaque étape du texte a son bloc [[etapes]] : choisir son action');
  l.push('# et ses champs (module actions). Une ligne du texte peut donner plusieurs étapes : recopier le bloc,');
  l.push('# avec la même ligne. Le scénario ne se joue qu\'une fois chaque étape complétée et la traduction ratifiée.');
  if (texte.etapes.some((e) => GENRES_ENTREES.includes(e.marque))) {
    l.push('# Une ligne de préparation ou de nettoyage a son bloc [[preparation]] ou [[nettoyage]] : un appel d\'API');
    l.push('# (methode, chemin, corps) ou le scénario qu\'elle nomme (module donnees).');
  }
  if (proposer) l.push(`# Propositions de l'index du code (index/code.md, empreinte ${String(empreinteIndex).slice(0, 12)}…) : des pistes, à vérifier.`);
  l.push(`format = ${chaineToml(FORMAT_SCENARIO)}`);
  l.push(`titre = ${chaineToml(texte.titre)}`);
  if (texte.etiquettes.length) l.push(`etiquettes = [${texte.etiquettes.map(chaineToml).join(', ')}]`);
  l.push(`url_base = ${chaineToml(texte.adresse)}`);
  if (texte.originesDeclarees) l.push(`origines = [${texte.origines.map(chaineToml).join(', ')}]`);
  if (texte.profil) l.push(`profil = ${chaineToml(texte.profil)}`);
  l.push(`source = ${chaineToml(sourceRel)}`);
  l.push(`empreinte_source = ${chaineToml(texte.empreinte)}`);
  if (Object.keys(texte.parametres).length) {
    l.push('', '[parametres]');
    for (const [k, v] of Object.entries(texte.parametres)) l.push(`${k} = ${chaineToml(v)}`);
  }
  for (const jeu of texte.jeux ?? []) {
    l.push('', '[[jeux]]');
    for (const [k, v] of Object.entries(jeu)) l.push(`${k} = ${chaineToml(v)}`);
  }
  for (const e of texte.etapes) {
    l.push('', `# ligne ${e.ligne} : ${e.motCle} ${e.phrase}${e.marque ? ` (${libelleMarque(e)})` : ''}`);
    if (GENRES_ENTREES.includes(e.marque)) {
      l.push(`[[${e.marque}]]`, `ligne = ${e.ligne}`);
      if (e.scenario) {
        l.push(`scenario = ${chaineToml(`${e.scenario}.toml`)}`);
        const p = parametresDe ? parametresDe(e.scenario) : null;
        l.push(p ? `# parametres = { … } : paramètres de ${e.scenario}.toml : ${p.length ? p.join(', ') : 'aucun'}` : `# parametres = { nom = "\${nom}" } : valeurs des paramètres de ${e.scenario}.toml`);
      } else {
        l.push(`methode = ${chaineToml(A_COMPLETER)}`, 'chemin = "/…"');
        l.push(`# corps = { … }  ou  corps_fichier = "donnees/….json" ; statut = 201${e.marque === 'preparation' ? ' ; garder = { id = "id" }' : ''} : à compléter`);
      }
      if (e.variables.length) l.push(`# variables à reprendre : ${e.variables.map((v) => `\${${v}}`).join(', ')}`);
      if (proposerAppel && !e.scenario) l.push(...proposerAppel(e.phrase));
      continue;
    }
    l.push('[[etapes]]', `ligne = ${e.ligne}`);
    if (e.marque === 'main') {
      l.push('action = "main"', `message = ${chaineToml(e.phrase)}`, '# jusqua = { url = "/…" }  ou  { cible = { … }, etat = "visible" } : à compléter');
    } else {
      l.push(`action = ${chaineToml(A_COMPLETER)}`);
      if (MUTATIONS.includes(e.marque)) l.push(`mutation = ${chaineToml(e.marque)}`);
    }
    if (e.variables.length) l.push(`# variables à reprendre : ${e.variables.map((v) => `\${${v}}`).join(', ')}`);
    if (proposer && e.marque !== 'main') l.push(...proposer(e.phrase));
  }
  return `${l.join('\n')}\n`;
}

const oui = (b) => (b === false ? 'non' : 'oui');

/** Résumé lisible d'une étape, pour le plan et le rapport. */
export function resumeEtape(e) {
  const c = e.cible ? decrireCible(e.cible) : '';
  const m = e.mutation ? `  [${e.mutation === 'creation' ? 'création' : e.mutation}]` : '';
  switch (e.action) {
    case 'naviguer': return `naviguer ${e.url}`;
    case 'cliquer': return `cliquer ${c}${m}`;
    case 'saisir': return `saisir « ${e.valeur} » dans ${c}${m}`;
    case 'choisir': return `choisir « ${e.valeur} » dans ${c}${m}`;
    case 'cocher': return `${e.valeur === false ? 'décocher' : 'cocher'} ${c}${m}`;
    case 'survoler': return `survoler ${c}`;
    case 'touche': return `touche ${e.touche}${c ? ` sur ${c}` : ''}${m}`;
    case 'televerser': return `téléverser ${(Array.isArray(e.fichier) ? e.fichier : [e.fichier]).join(', ')} dans ${c}${m}`;
    case 'telecharger': return `télécharger par ${c}${m}`;
    case 'attendre': return e.etat === 'url' ? `attendre l'adresse ${e.url}` : `attendre ${c} ${e.etat === 'texte' ? `avec le texte « ${e.texte} »` : e.etat}`;
    case 'verifier':
      if (e.critere === 'requete' || e.critere === 'api') {
        const a = masquerValeurs(e.attendu ?? {});
        const d = Object.entries(a).map(([k, v]) => (k === 'statut' ? `statut ${v}` : k === 'nombre' ? `${v} élément${v > 1 ? 's' : ''}` : `${({ corps: 'corps', reponse: 'réponse', contient: 'contient' })[k]} ${enTexte(v)}`));
        return `vérifier ${e.critere === 'api' ? "l'API GET" : `la requête${e.methode ? ` ${e.methode}` : ''}`} ${e.chemin}${d.length ? ` : ${d.join(', ')}` : e.critere === 'api' ? ' : statut 2xx' : ' : statut inférieur à 400'}`;
      }
      if (e.critere === 'fichier') {
        const a = e.attendu ?? {};
        const d = [a.contient !== undefined ? `contient « ${a.contient} »` : null, a.lignes !== undefined ? `${a.lignes} ligne${a.lignes > 1 ? 's' : ''}` : null, a.csv ? `colonne ${a.csv.colonne} = « ${RE_SECRET.test(a.csv.colonne) ? '***' : a.csv.valeur} »` : null].filter(Boolean);
        return `vérifier le fichier ${e.fichier} : ${d.join(', ')}`;
      }
      if (e.critere === 'url') return `vérifier l'adresse ${e.attendu}`;
      if (e.critere === 'visible' || e.critere === 'actif') return `vérifier ${c} ${e.critere} : ${oui(e.attendu)}`;
      if (e.critere === 'nombre') return `vérifier ${e.attendu} élément${e.attendu > 1 ? 's' : ''} ${c}`;
      return `vérifier ${c} ${e.critere === 'valeur' ? 'a la valeur' : (e.exact ? 'a le texte' : 'contient')} « ${e.attendu} »`;
    case 'capturer': return `capturer ${e.nom}${c ? ` (${c})` : ''}`;
    case 'main': return `à la main : « ${e.message} », jusqu'à ${e.jusqua?.url ? `l'adresse ${e.jusqua.url}` : `${e.jusqua?.cible ? decrireCible(e.jusqua.cible) : '?'} ${e.jusqua?.etat ?? 'visible'}`}`;
    default: return e.action;
  }
}

/** Ce qui modifie des données : étapes marquées, appels de préparation et de nettoyage, scénarios de préparation qui en ont (D7.INV-2, D20.INV-3). */
export function mutationsDe(scenario) {
  const l = [];
  const etapes = scenario.etapes.flatMap((e, i) => (e.mutation ? [i + 1] : []));
  if (etapes.length) l.push(`étape${etapes.length > 1 ? 's' : ''} ${etapes.join(', ')}`);
  for (const genre of ['preparation', 'nettoyage']) {
    (scenario[genre] ?? []).forEach((e, i) => {
      const nom = `${genre === 'preparation' ? 'préparation' : 'nettoyage'} ${i + 1}`;
      if (e.scenario === undefined) l.push(nom);
      else if (e.charge?.scenario.etapes.some((x) => x.mutation)) l.push(`${nom} (${e.scenario})`);
    });
  }
  return l;
}

/** Chemin lisible : la valeur d'un paramètre de requête au nom de secret est masquée (D20.INV-2). */
export const cheminMasque = (c) => String(c).replace(/([?&])([^=&#]+)=([^&#]*)/g, (m, s, k) => {
  let nom = k;
  try { nom = decodeURIComponent(k); } catch { /* nom tel quel */ }
  return RE_SECRET.test(nom) ? `${s}${k}=***` : m;
});

/** Résumé lisible d'une entrée de préparation ou de nettoyage (D20), pour le plan et le rapport. */
export function resumeEntree(e) {
  if (e.scenario !== undefined && e.scenario !== null) {
    const p = e.parametres && Object.keys(e.parametres).length ? ` ${enTexte(masquerValeurs(afficherGardees(e.parametres)))}` : '';
    return `scénario ${e.scenario}${p}`;
  }
  const corps = e.corps_fichier ? ` corps ${e.corps_fichier}` : e.corps !== undefined ? ` ${enTexte(masquerValeurs(afficherGardees(e.corps)))}` : '';
  const statuts = e.statut === undefined ? '' : ` → ${[].concat(e.statut).join(' ou ')}`;
  const garder = e.garder ? ` ; garder ${Object.entries(e.garder).map(([k, v]) => `${k} = ${v}`).join(', ')}` : '';
  const m = MUTATION_DE_METHODE[e.methode];
  return `${e.methode} ${cheminMasque(afficherGardees(e.chemin))}${corps.length > 160 ? `${corps.slice(0, 157)}…` : corps}${statuts}${garder}${m ? `  [${m === 'creation' ? 'création' : m}]` : ''}`;
}

/** Plan de la traduction, ligne du texte par ligne du texte, pour la ratification (D10.INV-1). */
export function planTraduction(scenario, texte) {
  const l = [`Scénario : ${scenario.titre}${scenario.etiquettes.length ? `  (${scenario.etiquettes.map((x) => `@${x}`).join(' ')})` : ''}`];
  l.push(`Adresse : ${scenario.url_base} ; origines : ${scenario.origines.join(', ')}${scenario.profil ? ` ; profil : ${scenario.profil}` : ''}`);
  if (scenario.jeux) l.push(`Jeux : ${scenario.jeux.length} (${Object.keys(scenario.jeux[0]).join(', ')})`);
  const preparation = scenario.preparation ?? [];
  const nettoyage = scenario.nettoyage ?? [];
  const libelle = { preparation: 'préparation', nettoyage: 'nettoyage' };
  if (texte) {
    for (const t of texte.etapes) {
      l.push(`l.${t.ligne}  ${t.motCle} ${t.phrase}${t.marque ? ` (${libelleMarque(t)})` : ''}`);
      if (GENRES_ENTREES.includes(t.marque)) {
        for (const e of (t.marque === 'preparation' ? preparation : nettoyage).filter((x) => x.ligne === t.ligne)) l.push(`        → ${libelle[t.marque]} : ${resumeEntree(e)}`);
      } else for (const e of scenario.etapes.filter((x) => x.ligne === t.ligne)) l.push(`        → ${resumeEtape(e)}`);
    }
  } else {
    preparation.forEach((e, i) => l.push(`p${i + 1}. préparation : ${resumeEntree(e)}`));
    scenario.etapes.forEach((e, i) => l.push(`${String(i + 1).padStart(2)}. ${resumeEtape(e)}`));
    nettoyage.forEach((e, i) => l.push(`n${i + 1}. nettoyage : ${resumeEntree(e)}`));
  }
  const mutations = scenario.etapes.filter((e) => e.mutation).length;
  const entrees = [preparation.length ? `préparation : ${preparation.length}` : null, nettoyage.length ? `nettoyage : ${nettoyage.length}` : null].filter(Boolean);
  l.push(`${scenario.etapes.length} étapes, dont ${mutations} qui modifie${mutations > 1 ? 'nt' : ''} des données${scenario.etapes.some((e) => e.action === 'main') ? ', et des étapes à la main' : ''}${entrees.length ? ` ; ${entrees.join(', ')}, qui modifient des données (module donnees)` : ''}.`);
  return l.join('\n');
}
```
