// Lecteur TOML du générateur de skills de ticket, sans dépendance.
//
// Il lit le sous-ensemble de TOML 1.0 qu'emploient le référentiel des méso-contrats et les fichiers
// de ticket : tables, tableaux de tables, clés nues, entre guillemets ou pointées, chaînes simples,
// littérales et multilignes, entiers, flottants, booléens, tableaux et tables en ligne. Les dates et
// les heures, les entiers hexadécimaux, octaux ou binaires ne sont pas pris en charge : ils lèvent
// une erreur qui donne la ligne, comme toute syntaxe inconnue. Les fins de ligne CRLF sont admises.

export class ErreurToml extends Error {}

const RE_CLE = /[A-Za-z0-9_-]+/y;
const RE_NOMBRE = /[+-]?\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d[\d_]*)?/y;
const ECHAPPEMENTS = { b: '\b', t: '\t', n: '\n', f: '\f', r: '\r', '"': '"', '\\': '\\' };

/** Lit un texte TOML et renvoie l'objet qu'il décrit. `nom` sert aux messages d'erreur. */
export function lireToml(source, nom = 'TOML') {
  const t = source.replace(/^﻿/, '').replace(/\r\n/g, '\n');
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
