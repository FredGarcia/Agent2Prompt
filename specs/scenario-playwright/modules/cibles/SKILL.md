---
name: cibles
description: Cibles côté utilisateur (une seule stratégie par cible, rôle et nom accessible, libellé, texte, placeholder, identifiant de test, texte alternatif, titre ; css et rang en dernier recours, signalés fragiles ; exact ; dans, sur trois niveaux ; localisateurs stricts de Playwright, cible ambiguë qui échoue sans agir et cite les éléments trouvés ; notation des localisateurs dans le plan et le rapport ; écriture en table TOML et lecture d'un localisateur pour la désignation), source de scripts/cibles.mjs. À lire pour écrire ou corriger une cible.
dimensions: [D4]
status: active
---

# Module `cibles` (D4)

Phase 7E couverte : Engendrent.

## 1. Stratégies (D4.INV-1)

Une cible désigne un élément comme le voit une personne. Elle s'écrit en table TOML en ligne, avec une seule stratégie :

| Stratégie | Exemple | Playwright | Quand |
|---|---|---|---|
| `role`, avec `nom` | `{ role = "button", nom = "Enregistrer" }` | `getByRole('button', { name: 'Enregistrer' })` | d'abord : boutons, liens, cases, onglets, titres, lignes, cellules, alertes |
| `libelle` | `{ libelle = "Nom" }` | `getByLabel('Nom')` | champs de formulaire |
| `texte` | `{ texte = "Données chargées" }` | `getByText('Données chargées')` | texte sans rôle propre |
| `placeholder` | `{ placeholder = "Rechercher" }` | `getByPlaceholder('Rechercher')` | champ sans libellé |
| `testid` | `{ testid = "valider" }` | `getByTestId('valider')` | élément sans nom visible, avec l'attribut `data-testid` |
| `alt` | `{ alt = "Logo" }` | `getByAltText('Logo')` | image |
| `titre` | `{ titre = "Aide" }` | `getByTitle('Aide')` | élément nommé par son attribut `title` |
| `css` | `{ css = "#etat" }` | `locator('#etat')` | dernier recours : suit la structure de la page, non ce qu'on voit ; signalé fragile |

`role` prend un rôle ARIA de la liste de Playwright (`button`, `link`, `textbox`, `checkbox`, `combobox`, `heading`, `row`, `cell`, `alert`, `dialog`, `tab`, …) ; un rôle inconnu est refusé. Un nom de rôle se compare par défaut comme Playwright : sans casse, et contenu dans le nom accessible. Désigner par le rôle et le nom vérifie au passage que l'élément est nommé pour les lecteurs d'écran.

## 2. Précisions

| Clé | Effet | Exemple |
|---|---|---|
| `exact = true` | le nom, le libellé ou le texte se comparent en entier, casse comprise | `{ role = "cell", nom = "Lyon", exact = true }` |
| `dans` | la cible se cherche à l'intérieur d'une autre ; trois niveaux au plus (D4.INV-3) | `{ role = "button", nom = "Supprimer", dans = { role = "row", nom = "Martin" } }` |
| `rang` | le n-ième élément trouvé, à partir de 1 ; dernier recours, signalé fragile | `{ role = "listitem", rang = 2 }` |

`exact` ne s'emploie pas avec `testid`, `css`, ni un rôle sans nom ; `nom` ne s'emploie qu'avec `role`. Les textes d'une cible acceptent les variables `${nom}` (module `scenario`, § 3).

## 3. Une cible, un élément (D4.INV-2)

Les localisateurs de Playwright sont stricts : une cible qui désigne plusieurs éléments fait échouer l'étape, sans agir. Le message cite les éléments trouvés, chacun avec son propre localisateur :

```text
cible ambiguë, 3 éléments trouvés, aucune action faite : 1) <button type="button" data-nom="Dupont">Supprimer</button> aka getByRole('row', { name: 'Dupont Paris Supprimer' }).getByRole('button') ; 2) …
```

La correction précise la cible, par `exact` ou `dans`, plutôt que par `rang`. Une cible absente fait échouer l'étape à son délai, sans agir (D5.INV-2).

## 4. Notation

Le plan de ratification, la sortie de `jouer.mjs` et le rapport écrivent une cible dans la notation des localisateurs de Playwright, celle de ses messages d'erreur : `getByRole('button', { name: 'Enregistrer' })`, `getByRole('row', { name: 'Martin' }).getByRole('button', { name: 'Supprimer' })`, `getByRole('listitem').nth(1)`. La même notation se relit en cible : c'est ce que fait la désignation (module `designer`), qui écrit ensuite la cible en table TOML.

## 5. Contrôle de sortie

- Chaque stratégie, `exact`, `dans` et `rang` se décrivent dans la notation de Playwright, et la notation se relit en la même cible (D4.INV-1, D4.INV-3).
- Une cible à deux stratégies, un rôle inconnu, un nom sans rôle, `exact` mal employé, un rang nul ou quatre niveaux de `dans` sont refusés.
- `css` et `rang`, jusque dans `dans`, sont signalés fragiles.
- Une cible ambiguë fait échouer l'étape sans agir, avec les éléments trouvés (D4.INV-2, module `recette`, R6).

## 6. Source `scripts/cibles.mjs`

<!-- fichier : scripts/cibles.mjs -->
```javascript
// scenario-playwright 1.6.0 : cibles côté utilisateur.
//
// Une cible désigne un élément comme le voit une personne : par son rôle et son nom accessible, son
// libellé, son texte, son placeholder, son identifiant de test, son texte alternatif ou son titre. Le
// sélecteur CSS et le rang ne servent qu'en dernier recours, et le rapport les signale fragiles. Les
// localisateurs de Playwright sont stricts : une cible qui désigne plusieurs éléments fait échouer
// l'étape au lieu d'agir au hasard.

export const ROLES = [
  'alert', 'alertdialog', 'application', 'article', 'banner', 'blockquote', 'button', 'caption', 'cell', 'checkbox',
  'code', 'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition', 'deletion', 'dialog', 'directory',
  'document', 'emphasis', 'feed', 'figure', 'form', 'generic', 'grid', 'gridcell', 'group', 'heading', 'img',
  'insertion', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee', 'math', 'meter', 'menu', 'menubar',
  'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation', 'none', 'note', 'option', 'paragraph',
  'presentation', 'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup', 'rowheader', 'scrollbar',
  'search', 'searchbox', 'separator', 'slider', 'spinbutton', 'status', 'strong', 'subscript', 'superscript',
  'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox', 'time', 'timer', 'toolbar', 'tooltip', 'tree',
  'treegrid', 'treeitem',
];
export const STRATEGIES = ['role', 'libelle', 'texte', 'placeholder', 'testid', 'alt', 'titre', 'css'];
export const PROFONDEUR_MAX = 3;
const CLES = new Set([...STRATEGIES, 'nom', 'exact', 'dans', 'rang']);
const AVEC_EXACT = new Set(['role', 'libelle', 'texte', 'placeholder', 'alt', 'titre']);
const estTable = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Stratégie d'une cible valide : la seule de ses clés qui en est une. */
export const strategie = (cible) => STRATEGIES.find((s) => Object.hasOwn(cible, s));

/** Erreurs d'une cible, chacune préfixée par `ou` ; une liste vide si elle est valide (D4.INV-1, D4.INV-3). */
export function validerCible(cible, ou = 'cible', profondeur = 1) {
  if (!estTable(cible)) return [`${ou} : une table est attendue, comme { role = "button", nom = "Enregistrer" }`];
  const erreurs = [];
  for (const k of Object.keys(cible)) if (!CLES.has(k)) erreurs.push(`${ou} : clé inconnue « ${k} »`);
  const presentes = STRATEGIES.filter((s) => Object.hasOwn(cible, s));
  if (presentes.length !== 1) {
    erreurs.push(`${ou} : une seule stratégie parmi ${STRATEGIES.join(', ')}${presentes.length ? ` (trouvées : ${presentes.join(', ')})` : ''}`);
    return erreurs;
  }
  const s = presentes[0];
  if (typeof cible[s] !== 'string' || cible[s].trim() === '') erreurs.push(`${ou} : ${s} doit être un texte non vide`);
  if (s === 'role' && typeof cible.role === 'string' && !ROLES.includes(cible.role)) erreurs.push(`${ou} : rôle inconnu « ${cible.role} »`);
  if (Object.hasOwn(cible, 'nom')) {
    if (s !== 'role') erreurs.push(`${ou} : nom ne s'emploie qu'avec role`);
    else if (typeof cible.nom !== 'string' || cible.nom === '') erreurs.push(`${ou} : nom doit être un texte non vide`);
  }
  if (Object.hasOwn(cible, 'exact')) {
    if (typeof cible.exact !== 'boolean') erreurs.push(`${ou} : exact vaut true ou false`);
    else if (!AVEC_EXACT.has(s) || (s === 'role' && !Object.hasOwn(cible, 'nom'))) erreurs.push(`${ou} : exact ne s'emploie pas avec ${s === 'role' ? 'un rôle sans nom' : s}`);
  }
  if (Object.hasOwn(cible, 'rang') && !(Number.isInteger(cible.rang) && cible.rang >= 1)) erreurs.push(`${ou} : rang est un entier à partir de 1`);
  if (Object.hasOwn(cible, 'dans')) {
    if (profondeur >= PROFONDEUR_MAX) erreurs.push(`${ou} : plus de ${PROFONDEUR_MAX} niveaux de « dans »`);
    else erreurs.push(...validerCible(cible.dans, `${ou}, dans`, profondeur + 1));
  }
  return erreurs;
}

/** Vrai si la cible, ou une cible qui la contient, emploie css ou rang (D4.INV-1). */
export function estFragile(cible) {
  return Boolean(cible) && (Object.hasOwn(cible, 'css') || Object.hasOwn(cible, 'rang') || estFragile(cible.dans));
}

/** Textes de la cible où une variable ${nom} peut figurer. */
export function textesDe(cible) {
  if (!cible) return [];
  return [...STRATEGIES, 'nom'].filter((k) => typeof cible[k] === 'string').map((k) => cible[k]).concat(textesDe(cible.dans));
}

/** Copie de la cible dont chaque texte passe par `f` (substitution des variables). */
export function transformerCible(cible, f) {
  const copie = { ...cible };
  for (const k of [...STRATEGIES, 'nom']) if (typeof copie[k] === 'string') copie[k] = f(copie[k]);
  if (copie.dans) copie.dans = transformerCible(copie.dans, f);
  return copie;
}

/** Localisateur Playwright d'une cible, depuis une page ou un localisateur parent. */
export function localisateur(racine, cible) {
  const base = cible.dans ? localisateur(racine, cible.dans) : racine;
  const options = Object.hasOwn(cible, 'exact') ? { exact: cible.exact } : {};
  let l;
  switch (strategie(cible)) {
    case 'role': l = base.getByRole(cible.role, cible.nom === undefined ? {} : { name: cible.nom, ...options }); break;
    case 'libelle': l = base.getByLabel(cible.libelle, options); break;
    case 'texte': l = base.getByText(cible.texte, options); break;
    case 'placeholder': l = base.getByPlaceholder(cible.placeholder, options); break;
    case 'testid': l = base.getByTestId(cible.testid); break;
    case 'alt': l = base.getByAltText(cible.alt, options); break;
    case 'titre': l = base.getByTitle(cible.titre, options); break;
    default: l = base.locator(cible.css);
  }
  return cible.rang ? l.nth(cible.rang - 1) : l;
}

const js = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

/** Description d'une cible dans la notation des localisateurs de Playwright, celle de ses messages d'erreur. */
export function decrireCible(cible) {
  const avant = cible.dans ? `${decrireCible(cible.dans)}.` : '';
  const exact = Object.hasOwn(cible, 'exact') ? `, exact: ${cible.exact}` : '';
  const avecExact = (f, v) => `${f}(${js(v)}${exact ? `, { ${exact.slice(2)} }` : ''})`;
  let d;
  switch (strategie(cible)) {
    case 'role': d = cible.nom === undefined ? `getByRole(${js(cible.role)})` : `getByRole(${js(cible.role)}, { name: ${js(cible.nom)}${exact} })`; break;
    case 'libelle': d = avecExact('getByLabel', cible.libelle); break;
    case 'texte': d = avecExact('getByText', cible.texte); break;
    case 'placeholder': d = avecExact('getByPlaceholder', cible.placeholder); break;
    case 'testid': d = `getByTestId(${js(cible.testid)})`; break;
    case 'alt': d = avecExact('getByAltText', cible.alt); break;
    case 'titre': d = avecExact('getByTitle', cible.titre); break;
    default: d = `locator(${js(cible.css)})`;
  }
  return `${avant}${d}${cible.rang ? `.nth(${cible.rang - 1})` : ''}`;
}

const toml = (s) => `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t')}"`;

/** Cible écrite en table TOML en ligne, pour un scénario : { role = "button", nom = "Enregistrer" }. */
export function cibleToml(cible) {
  const s = strategie(cible);
  const parties = [`${s} = ${toml(cible[s])}`];
  if (cible.nom !== undefined) parties.push(`nom = ${toml(cible.nom)}`);
  if (Object.hasOwn(cible, 'exact')) parties.push(`exact = ${cible.exact}`);
  if (cible.rang) parties.push(`rang = ${cible.rang}`);
  if (cible.dans) parties.push(`dans = ${cibleToml(cible.dans)}`);
  return `{ ${parties.join(', ')} }`;
}

// --- Lecture d'un localisateur de Playwright écrit en texte, comme le rend pickLocator() (D9.INV-1) ---

function lexer(texte) {
  const jetons = [];
  let i = 0;
  while (i < texte.length) {
    const c = texte[i];
    if (/\s/.test(c)) { i++; continue; }
    if ('(){},.:'.includes(c)) { jetons.push({ t: c }); i++; continue; }
    if (c === "'" || c === '"') {
      let v = '';
      i++;
      while (i < texte.length && texte[i] !== c) {
        if (texte[i] === '\\') { v += texte[i + 1]; i += 2; } else { v += texte[i]; i++; }
      }
      if (texte[i] !== c) return null;
      i++;
      jetons.push({ t: 'chaine', v });
      continue;
    }
    if (c === '/') {
      const m = /^\/((?:\\.|[^/\\])+)\/([a-z]*)/.exec(texte.slice(i));
      if (!m) return null;
      jetons.push({ t: 'regex', v: m[1], drapeaux: m[2] });
      i += m[0].length;
      continue;
    }
    const m = /^[A-Za-z_][A-Za-z0-9_]*|^-?\d+/.exec(texte.slice(i));
    if (!m) return null;
    jetons.push(/^-?\d/.test(m[0]) ? { t: 'nombre', v: Number(m[0]) } : { t: 'mot', v: m[0] });
    i += m[0].length;
  }
  return jetons;
}

/** Appels chaînés d'un localisateur écrit : [{ nom, args }], ou null s'il ne se lit pas. */
function appels(texte) {
  const j = lexer(texte);
  if (!j) return null;
  let i = 0;
  const valeur = () => {
    const x = j[i++];
    if (!x) return undefined;
    if (x.t === 'chaine' || x.t === 'nombre') return x.v;
    if (x.t === 'regex') return { regex: x.v, drapeaux: x.drapeaux };
    if (x.t === 'mot' && (x.v === 'true' || x.v === 'false')) return x.v === 'true';
    if (x.t === '{') {
      const o = {};
      while (j[i] && j[i].t !== '}') {
        const cle = j[i++];
        if (!cle || cle.t !== 'mot' || j[i++]?.t !== ':') return undefined;
        o[cle.v] = valeur();
        if (j[i]?.t === ',') i++;
      }
      return j[i++]?.t === '}' ? o : undefined;
    }
    return undefined;
  };
  const liste = [];
  while (i < j.length) {
    const nom = j[i++];
    if (nom?.t !== 'mot' || j[i++]?.t !== '(') return null;
    const args = [];
    while (j[i] && j[i].t !== ')') {
      const v = valeur();
      if (v === undefined) return null;
      args.push(v);
      if (j[i]?.t === ',') i++;
    }
    if (j[i++]?.t !== ')') return null;
    liste.push({ nom: nom.v, args });
    if (i < j.length && j[i++]?.t !== '.') return null;
  }
  return liste;
}

const SIMPLES = { getByLabel: 'libelle', getByText: 'texte', getByPlaceholder: 'placeholder', getByAltText: 'alt', getByTitle: 'titre' };

/** Texte d'un nom ou d'un libellé : chaîne, ou expression régulière sans métacaractère. */
function texteSimple(v) {
  if (typeof v === 'string') return v;
  if (v && typeof v.regex === 'string' && !/[\\^$.*+?()[\]{}|]/.test(v.regex)) return v.regex;
  return undefined;
}

/**
 * Cible du skill tirée d'un localisateur de Playwright écrit en texte (`String(locator)`), ou null s'il
 * emploie une forme que le scénario n'exprime pas (filtre, dernier élément, expression régulière).
 */
export function cibleDepuisLocator(texte) {
  const liste = appels(String(texte).trim());
  if (!liste || liste.length === 0) return null;
  let cible = null;
  for (const { nom, args } of liste) {
    let nouvelle;
    if (nom === 'nth' || nom === 'first') {
      if (!cible || cible.rang) return null;
      const n = nom === 'first' ? 0 : args[0];
      if (!Number.isInteger(n) || n < 0) return null;
      cible.rang = n + 1;
      continue;
    }
    const options = args[1] && typeof args[1] === 'object' && !args[1].regex ? args[1] : {};
    if (nom === 'getByRole') {
      if (typeof args[0] !== 'string' || !ROLES.includes(args[0])) return null;
      nouvelle = { role: args[0] };
      if (options.name !== undefined) {
        const n = texteSimple(options.name);
        if (n === undefined) return null;
        nouvelle.nom = n;
        if (typeof options.exact === 'boolean' && typeof options.name === 'string') nouvelle.exact = options.exact;
      }
    } else if (SIMPLES[nom]) {
      const v = texteSimple(args[0]);
      if (v === undefined) return null;
      nouvelle = { [SIMPLES[nom]]: v };
      if (typeof options.exact === 'boolean' && typeof args[0] === 'string') nouvelle.exact = options.exact;
    } else if (nom === 'getByTestId' && typeof args[0] === 'string') {
      nouvelle = { testid: args[0] };
    } else if (nom === 'locator' && typeof args[0] === 'string' && args.length === 1) {
      nouvelle = { css: args[0] };
    } else {
      return null;
    }
    if (cible) nouvelle.dans = cible;
    cible = nouvelle;
  }
  let profondeur = 0;
  for (let c = cible; c; c = c.dans) profondeur++;
  return profondeur <= PROFONDEUR_MAX && validerCible(cible).length === 0 ? cible : null;
}
```
