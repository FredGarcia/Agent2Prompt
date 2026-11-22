---
name: cas-de-test
description: Cas de test de Xray et de Zephyr Scale, et fichiers .feature, importés en textes de départ sans IA (fichier .feature exporté de Xray ou de Zephyr Scale, ou pris dans le dépôt ; archive .zip d'un export, lue en mémoire, CRC-32 contrôlé, tailles bornées ; API REST de Xray Cloud et Data Center et de Zephyr Scale Cloud et Data Center, en lecture seule, jeton pris dans une variable d'environnement seulement, https, aucune redirection suivie ; clé du test pour identité, d'un chemin d'import à l'autre ; test Cucumber ou BDD recopié, test manuel converti pas à pas en « Quand » puis « Alors », test générique ou en texte libre refusé ; préconditions signalées ; provenance par lot), source de scripts/cas.mjs. À lire pour importer des tests de Xray, de Zephyr Scale ou d'un fichier .feature.
dimensions: [D17]
status: active
---

# Module `cas-de-test` (D17)

Phases 7E couvertes : Environnement et Éléments.

## 1. Principe

Un testeur part du cas de test. Dans Xray et dans Zephyr Scale, un test a une clé, un résumé, des étiquettes et des étapes : écrites en Gherkin pour un test Cucumber (Xray) ou BDD (Zephyr Scale), en pas « action, données, résultat attendu » pour un test manuel. `importer.mjs` en fait des textes de départ, sans IA, comme d'une demande Jira (module `jira`) : le développeur les vérifie, les fait traduire, ratifie et joue. Le texte reste la référence de sa traduction (D3.INV-2) ; l'outil de test reste la référence du texte importé.

```mermaid
flowchart LR
  FEAT["fichier .feature<br/>export ou dépôt"] --> LEC
  ZIP["archive .zip<br/>d'un export"] -->|"lue en mémoire"| LEC
  API["Xray, Zephyr Scale<br/>API REST, en lecture"] -->|"jeton : variable<br/>d'environnement"| LEC["importer.mjs, sans IA"]
  LEC --> TXT["DEMO-12.scenario …<br/>provenance, lot"]
  TXT -->|"verifier, traduire,<br/>ratifier, jouer"| DEV["Développeur"]
```

Le skill n'écrit jamais dans Jira, Xray ni Zephyr Scale (D17.INV-2).

## 2. Sources (D17.INV-1)

| Source | Exemple | Ce qui est lu |
|---|---|---|
| fichier `.feature` | `importer.mjs features/clients.feature --adresse http://127.0.0.1:4200` | ses scénarios, par le lecteur de Gherkin du module `jira` (§ 4) |
| archive `.zip` | `importer.mjs FeatureBundle.zip --adresse …` | ses fichiers `.feature`, lus en mémoire, sans rien extraire sur le disque ; les autres fichiers sont signalés en limite |
| Xray Cloud | `importer.mjs xray:DEMO-12,DEMO-13 --adresse …` | chaque test, par l'API GraphQL de Xray Cloud |
| Xray Data Center | `importer.mjs xray-dc:DEMO-12 --api https://jira.exemple.fr --adresse …` | la demande par l'API de Jira (résumé, étiquettes), le test par l'API de Xray |
| Zephyr Scale Cloud | `importer.mjs zephyr:DEMO-T1 --adresse …` | le cas de test et son script, par l'API v2 |
| Zephyr Scale Data Center | `importer.mjs zephyr-dc:DEMO-T1 --api https://jira.exemple.fr --adresse …` | le cas de test et son script, par l'API de Zephyr Scale (`atm/1.0`) |

- **Fichier** : en UTF-8 ; BOM, fins de ligne CRLF et tabulations sont ramenés ; `# language:` et les autres commentaires sont ignorés.
- **Archive** : méthodes « stockée » et « deflate » ; chaque fichier contrôlé par son CRC-32, une archive abîmée est refusée ; 5 000 fichiers, 5 Mo par fichier `.feature` et 50 Mo de fichiers `.feature` en tout au plus ; un fichier chiffré ou trop gros est signalé et non lu ; une archive ZIP64 est refusée ; les fichiers `__MACOSX/` sont ignorés.
- **Clés** : forme `ABC-123` pour Xray, `ABC-T123` pour Zephyr Scale, séparées par des virgules, sans doublon, 200 au plus par import.

## 3. API, en lecture seule (D17.INV-2)

| Outil | Adresse de l'API | Requêtes |
|---|---|---|
| Xray Cloud | `https://xray.cloud.getxray.app` ; `--api` pour une région, par exemple `https://eu.xray.cloud.getxray.app` | `POST /api/v2/authenticate`, avec l'identifiant et le secret du client, qui rend un jeton de session ; puis, par test, `POST /api/v2/graphql` : `getTests(jql: "key = \"<CLÉ>\"", limit: 1)`, une lecture (`query`), jamais une mutation |
| Xray Data Center | aucune par défaut : `--api <adresse de Jira>` | `GET /rest/api/2/issue/<CLÉ>?fields=summary,labels`, puis `GET /rest/raven/1.0/api/test?keys=<CLÉ>` |
| Zephyr Scale Cloud | `https://api.zephyrscale.smartbear.com/v2` ; `--api` pour une région, par exemple `https://eu.api.zephyrscale.smartbear.com/v2` | `GET /testcases/<CLÉ>`, puis le script par le lien qu'il donne : `…/teststeps`, page après page, ou `…/testscript` |
| Zephyr Scale Data Center | aucune par défaut : `--api <adresse de Jira>` | `GET /rest/atm/1.0/testcase/<CLÉ>` |

Toutes les lectures précèdent toute écriture : une requête qui échoue arrête l'import, avec le code 2, sans rien écrire, même après des lectures réussies. Un test absent, ou que le jeton ne permet pas de lire, est `introuvable` : non écrit, code 1, avec la réponse de l'API quand elle en donne une. Chaque requête attend 30 s au plus.

## 4. Jetons (D17.INV-3)

| Outil | Variables d'environnement |
|---|---|
| Xray Cloud | `XRAY_CLIENT_ID` et `XRAY_CLIENT_SECRET`, d'une clé d'API de Xray |
| Zephyr Scale Cloud | `ZEPHYR_TOKEN`, jeton d'API de Zephyr Scale |
| Xray Data Center, Zephyr Scale Data Center | `JIRA_TOKEN`, jeton d'accès personnel de Jira |

- Le développeur définit la variable lui-même, dans son terminal, pour sa session : sous bash, `read -rs ZEPHYR_TOKEN && export ZEPHYR_TOKEN`, la saisie restant masquée ; sous PowerShell 7, `$env:ZEPHYR_TOKEN = Read-Host -MaskInput 'Jeton'` ; jamais dans la commande d'import, ni dans un fichier du dépôt. Une variable absente arrête l'import avant toute requête, en la nommant.
- Le jeton ne passe ni en argument, ni dans une adresse, ni dans un message, ni dans un fichier : il ne sort que dans l'en-tête `Authorization: Bearer` des requêtes vers l'origine de l'API ; l'identifiant et le secret de Xray Cloud, dans le corps de la seule requête d'authentification.
- `--api` est en https, sauf sur le poste même (127.0.0.1, `localhost`, `[::1]`) ; une adresse avec identifiant, paramètre ou fragment est refusée, sans que le message la reprenne.
- Aucune redirection n'est suivie : une réponse 3xx arrête l'import avant que le jeton ne parte ailleurs ; aucune requête ne va vers une autre origine que celle de l'API, même par un lien qu'elle rend.
- Une réponse 401 ou 403 dit « accès refusé : jeton absent, expiré ou sans droit de lecture ».

## 5. Identité : la clé du test (D17.INV-4)

| Source | Identité du scénario |
|---|---|
| API | la clé demandée |
| fichier, archive | l'étiquette `@TestCaseKey=<CLÉ>` de Zephyr Scale ; sinon la première étiquette propre au scénario qui est une clé de Jira, `@DEMO-12` ou `@TEST_DEMO-12`, celle du test dans un export de Xray, sauf si un scénario d'un autre titre la porte aussi : c'est alors la clé d'une demande ; sinon une étiquette `@<CLÉ>-Snn` d'un import de Jira ; à défaut, l'étiquette `<fichier>-Snn`, du nom du fichier ou de l'archive, reprise par le titre ou attribuée comme pour Jira (module `jira`, § 5) |

L'identité nomme le texte, `<CLÉ>.scenario`. Le même test, lu d'un autre chemin d'import — un export, puis l'API ; Xray Cloud, puis Data Center — retrouve son texte importé : `identique`, ou `modifié`, remplacé avec `--remplacer`, jamais en `conflit`. Un texte écrit à la main du même nom n'est jamais remplacé. Un test présent dans deux fichiers d'une archive (Xray exporte un test dans le fichier de chacune de ses exigences) est un `doublon` la seconde fois.

Chaque texte importé appartient à un lot : sa demande pour Jira ; ici le fichier (`fichier <chemin>`) ou l'archive (`archive <chemin>`), chemin relatif au dossier des textes, ou le test (`xray <CLÉ>`, `zephyr <CLÉ>`). Les textes d'un lot servent au réimport : numéros attribués, reprises par le titre, textes `disparu`.

## 6. Tests convertis (D17.INV-5)

| Test | Texte importé |
|---|---|
| Cucumber (Xray), BDD (Zephyr Scale) | ses étapes, recopiées par le lecteur de Gherkin (module `jira`, § 4), sous un titre formé de son résumé quand elles n'en ont pas : `Scénario:`, ou `Plan du scénario:` avec un tableau d'exemples ; `Scenario:` et `Scenario Outline:` quand ses mots-clés sont anglais ; étiquettes : la clé, puis les étiquettes de Jira |
| manuel (Xray), pas à pas (Zephyr Scale) | chaque pas devient `Quand <action>`, avec ses données, `, avec « <données> »`, puis `Alors <résultat attendu>` ; une partie de plusieurs lignes tient sur une, ses lignes séparées par « ; » ; le HTML de Zephyr Scale est ramené au texte ; une partie vide est omise ; l'en-tête le dit dès sa première ligne |
| Generic (Xray), texte libre (Zephyr Scale) | refusé : pas d'étapes à recopier ; le test s'écrit en Cucumber, BDD ou pas à pas dans l'outil |
| pas qui appelle un autre cas (Zephyr Scale) | refusé : l'import ne le déplie pas |
| pas vide, sans action, données ni résultat attendu (dans Xray, l'appel d'un autre test) | refusé : rien n'est deviné |
| sans résumé, manuel sans pas | refusé |

La phrase d'un pas reste telle qu'écrite : « Quand » et « Alors » ne disent pas la langue du test. Un test manuel converti se relit avec le développeur avant sa traduction (module `agent`). Les préconditions sont signalées en tête du texte, non reprises : celles de Xray par leurs clés, celle de Zephyr Scale par son texte ; elles se jouent avant le scénario, ou le développeur les reporte dans le texte. Un export `.feature` de Xray, lui, reprend les préconditions Cucumber en `Background`, reporté en tête des étapes (module `jira`, § 4).

## 7. Le texte importé (D17.INV-6)

```text
# Importé de Xray par importer.mjs (scenario-playwright 1.4.0), sans IA : chaque pas du test manuel devient « Quand <action> », avec ses données, puis « Alors <résultat attendu> ».
# Lot : xray DEMO-13
# Scénario : @DEMO-13, test manuel DEMO-13
# Source : https://xray.cloud.getxray.app/api/v2/graphql, test DEMO-13
# Importé le : 2026-11-21T09:30:00Z
# Empreinte de la source : 5d2502…
# Empreinte du texte importé : 2ec024…
# Préconditions dans Xray, non reprises : DEMO-11 ; à jouer avant le scénario, ou à reporter dans le texte.

@DEMO-13
Scénario: Exporter les clients
  Adresse : http://127.0.0.1:4200

  Quand Ouvrir la page « Export »
  Alors La page « Export » s'affiche
  Quand Cliquer sur le lien « Exporter en CSV », avec « format CSV ; séparateur ; »
  Alors Le fichier « clients.csv » est téléchargé
```

- **Première ligne** : la source (`de Xray`, `de Zephyr Scale`, `d'un fichier .feature`, `d'une archive .zip`) et ce que l'import en fait : recopie telle qu'écrite, ou conversion d'un test manuel.
- **Lot**, puis **Scénario** : l'étiquette, et la provenance : le test et sa sorte (`test Cucumber DEMO-12`, `cas de test pas à pas DEMO-T2`), ou le fichier `.feature`, dans l'archive s'il y a lieu.
- **Source** : l'adresse de l'API qui a rendu le test, ou le chemin du fichier ou de l'archive, relatif au dossier des textes, et son empreinte sha256.
- **Empreinte de la source** : comme l'empreinte Jira, le SHA-256 de ce que la source dit du scénario, fonctionnalité, étiquettes, titre, étapes, exemples ; un même test donne la même empreinte, et le même texte, par Xray Cloud ou Data Center, par Zephyr Scale Cloud ou Data Center.
- **Notes** : préconditions, étiquette attribuée, contexte reporté, colonnes d'exemples adaptées.

## 8. Sortie et codes

Sortie : `Fichier <nom> : n scénarios`, `Archive <nom> : n fichiers .feature, n scénarios (par fichier)`, ou `<Outil> <variante> (<adresse de l'API>) : n tests demandés, n lus (par sorte)` ; les `LIMITE …` ; une ligne par scénario ; une ligne `introuvable` par test absent ; `Bilan : …`. Les états, le réimport et les codes sont ceux du module `jira`, § 6 et § 7 : `introuvable` compte comme un scénario non écrit, code 1 ; une archive abîmée, une variable absente, une adresse d'API refusée, une redirection, un accès refusé ou une API injoignable arrêtent l'import avant toute écriture, code 2.

## 9. Contrôle de sortie

- Un fichier `.feature` et une archive d'export se lisent ; une archive abîmée est refusée (D17.INV-1).
- Seules des lectures partent vers les API ; aucune mutation ; rien n'est écrit dans Jira, Xray ni Zephyr Scale (D17.INV-2).
- Un jeton ne se lit que dans sa variable d'environnement ; il n'apparaît ni dans une adresse, ni dans une sortie, ni dans un texte ; aucune redirection n'est suivie ; une adresse en http hors du poste est refusée (D17.INV-3).
- Chaque texte se nomme par la clé de son test ; le même test, d'un autre chemin d'import, retrouve son texte (D17.INV-4).
- Un test manuel donne, pas à pas, « Quand » puis « Alors », et un texte que `verifier.mjs` accepte ; un test sans étapes est refusé avec son motif (D17.INV-5).
- Chaque texte porte sa provenance et son lot (D17.INV-6).

## 10. Source `scripts/cas.mjs`

Désignation de la source, lecteur d'archive, lignes d'un fichier, identité des scénarios, requêtes aux API en lecture seule, lecteurs de Xray et de Zephyr Scale, conversion des tests en scénarios.

<!-- fichier : scripts/cas.mjs -->
```javascript
// scenario-playwright 1.4.0 : cas de test de Xray et de Zephyr Scale, et fichiers .feature, lus sans IA.
//
// Sources (D17.INV-1) : fichier .feature, exporté de Xray ou de Zephyr Scale ou pris dans le dépôt ; archive
// .zip d'un export ; API REST de Xray (Cloud, Data Center) et de Zephyr Scale (Cloud, Data Center), en
// lecture seule : des GET, et pour Xray Cloud l'authentification et des requêtes GraphQL « query », jamais
// « mutation » (D17.INV-2). Un jeton ne vient que d'une variable d'environnement et ne sort que dans
// l'en-tête d'une requête vers l'API désignée, en https hors du poste, sans suivre de redirection
// (D17.INV-3). La clé d'un test est l'identité de son scénario (D17.INV-4). Un test Cucumber ou BDD est
// recopié tel qu'écrit ; un test manuel devient, pas à pas, « Quand <action> » puis « Alors <résultat
// attendu> » ; un test générique ou en texte libre est refusé avec son motif (D17.INV-5).
import { Buffer } from 'node:buffer';
import { URL } from 'node:url';
import { crc32, inflateRawSync } from 'node:zlib';
import { empreinteJira, extraireScenarios, htmlEnLignes } from './jira.mjs';
import { lireMotCle, lireTitre, normaliser, plat } from './texte.mjs';

const { fetch, AbortSignal } = globalThis;

export class ErreurCas extends Error {}

/** Texte sur une seule ligne, en NFC : caractères de contrôle et blancs regroupés en une espace. */
export const uneLigne = (s) => String(s ?? '').normalize('NFC').replace(/[\p{Cc}\s]+/gu, ' ').trim();
/** Texte de plusieurs lignes ramené à une seule : ses lignes non vides, séparées par « ; ». */
export const lignesJointes = (lignes) => lignes.map(uneLigne).filter(Boolean).join(' ; ');
const court = (s, n = 200) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

// --- Désignation de la source --------------------------------------------------------------------

const RE_CLE = /^[A-Z][A-Z0-9_]+-\d+$/;
const RE_CLE_ZEPHYR = /^[A-Z][A-Z0-9_]+-T\d+$/;
export const MAX_TESTS = 200;

/**
 * Outils lus par leur API : nom, variante, variables d'environnement des jetons, adresse par défaut de
 * l'API (Cloud), forme des clés, nom des lots de textes importés.
 */
export const OUTILS = {
  xray: { nom: 'Xray', variante: 'Cloud', variables: ['XRAY_CLIENT_ID', 'XRAY_CLIENT_SECRET'], base: 'https://xray.cloud.getxray.app', cle: RE_CLE, forme: 'ABC-123', lot: 'xray', test: 'test', tests: 'tests' },
  'xray-dc': { nom: 'Xray', variante: 'Data Center', variables: ['JIRA_TOKEN'], base: null, cle: RE_CLE, forme: 'ABC-123', lot: 'xray', test: 'test', tests: 'tests' },
  zephyr: { nom: 'Zephyr Scale', variante: 'Cloud', variables: ['ZEPHYR_TOKEN'], base: 'https://api.zephyrscale.smartbear.com/v2', cle: RE_CLE_ZEPHYR, forme: 'ABC-T123', lot: 'zephyr', test: 'cas de test', tests: 'cas de test' },
  'zephyr-dc': { nom: 'Zephyr Scale', variante: 'Data Center', variables: ['JIRA_TOKEN'], base: null, cle: RE_CLE_ZEPHYR, forme: 'ABC-T123', lot: 'zephyr', test: 'cas de test', tests: 'cas de test' },
};

/**
 * Genre de la source donnée à importer.mjs (D17.INV-1) : api (outil:CLÉ,CLÉ…), feature, zip, ou jira
 * (adresse d'une demande, ou page enregistrée en MHTML). Rend { genre, outil, cles, adresse } ou { erreur }.
 */
export function lireSource(source) {
  const m = /^(xray|xray-dc|zephyr|zephyr-dc):(.*)$/s.exec(source);
  if (m) {
    const outil = OUTILS[m[1]];
    const cles = [...new Set(m[2].split(',').map((x) => x.trim()).filter(Boolean))];
    if (cles.length === 0) return { erreur: `${m[1]}: attend les clés des tests, séparées par des virgules (forme ${outil.forme})` };
    const invalides = cles.filter((c) => !outil.cle.test(c));
    if (invalides.length) return { erreur: `clé de test invalide pour ${m[1]}: ${invalides.map((c) => `« ${court(c, 24)} »`).join(', ')} (forme ${outil.forme})` };
    if (cles.length > MAX_TESTS) return { erreur: `${cles.length} tests demandés : ${MAX_TESTS} au plus par import` };
    return { genre: 'api', outil: m[1], cles };
  }
  if (/^https?:\/\//i.test(source)) return { genre: 'jira', adresse: true };
  if (/\.feature$/i.test(source)) return { genre: 'feature' };
  if (/\.zip$/i.test(source)) return { genre: 'zip' };
  return { genre: 'jira', adresse: false };
}

// --- Fichiers .feature et archives .zip ----------------------------------------------------------

/** Lignes d'un texte Gherkin : sans BOM, en NFC, tabulations en espaces, blancs de bord retirés. */
export function lignesDe(texte) {
  return normaliser(String(texte ?? '')).split('\n').map((l) => l.replace(/\t/g, ' ').trim());
}

/** Préfixe des étiquettes attribuées aux scénarios d'un fichier : son nom sans extension, en lettres, chiffres, - et _. */
export function prefixeDe(chemin) {
  const nom = String(chemin).split(/[\\/]/).pop().replace(/\.[^.]*$/, '');
  return nom.normalize('NFD').replace(/\p{M}/gu, '').replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'scenarios';
}

export const LIMITES_ZIP = { entrees: 5000, fichier: 5 * 1024 * 1024, total: 50 * 1024 * 1024 };

/**
 * Fichiers .feature d'une archive .zip, lus en mémoire, sans rien écrire sur le disque :
 * { entrees: [{ nom, octets }], ignorees: [noms], refusees: [{ nom, motif }] }. Méthodes « stockée » et
 * « deflate » ; contenu contrôlé par son CRC-32 ; tailles bornées. Lève ErreurCas pour une archive illisible.
 */
export function lireZip(octets, limites = LIMITES_ZIP) {
  const b = Buffer.from(octets);
  let fin = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 22 - 0xffff); i--) {
    if (b.readUInt32LE(i) === 0x06054b50) { fin = i; break; }
  }
  if (fin < 0) throw new ErreurCas('fin du répertoire ZIP introuvable : le fichier n\'est pas une archive .zip');
  const nombre = b.readUInt16LE(fin + 10);
  const taille = b.readUInt32LE(fin + 12);
  const debut = b.readUInt32LE(fin + 16);
  if (nombre === 0xffff || taille === 0xffffffff || debut === 0xffffffff) throw new ErreurCas('archive ZIP64, non prise en charge : exporter moins de tests à la fois');
  if (debut + taille > fin) throw new ErreurCas('répertoire ZIP hors du fichier : archive abîmée');
  if (nombre > limites.entrees) throw new ErreurCas(`${nombre} fichiers dans l'archive : ${limites.entrees} au plus`);
  const abimee = (detail) => new ErreurCas(`${detail} : archive abîmée`);
  const entrees = [];
  const ignorees = [];
  const refusees = [];
  let total = 0;
  let p = debut;
  for (let n = 0; n < nombre; n++) {
    if (p + 46 > fin || b.readUInt32LE(p) !== 0x02014b50) throw abimee('répertoire ZIP illisible');
    const drapeaux = b.readUInt16LE(p + 8);
    const methode = b.readUInt16LE(p + 10);
    const crc = b.readUInt32LE(p + 16);
    const comprime = b.readUInt32LE(p + 20);
    const longueur = b.readUInt32LE(p + 24);
    const lNom = b.readUInt16LE(p + 28);
    const lExtra = b.readUInt16LE(p + 30);
    const lCommentaire = b.readUInt16LE(p + 32);
    const local = b.readUInt32LE(p + 42);
    const nom = uneLigne(b.subarray(p + 46, p + 46 + lNom).toString(drapeaux & 0x800 ? 'utf8' : 'latin1'));
    p += 46 + lNom + lExtra + lCommentaire;
    if (nom.endsWith('/')) continue;
    const dernier = nom.split('/').pop();
    if (!/\.feature$/i.test(nom) || nom.startsWith('__MACOSX/') || dernier.startsWith('._')) { ignorees.push(nom); continue; }
    if (drapeaux & 0x1) { refusees.push({ nom, motif: 'chiffré, non lu' }); continue; }
    if (methode !== 0 && methode !== 8) { refusees.push({ nom, motif: `méthode de compression ${methode} non prise en charge (stockée ou deflate)` }); continue; }
    if (longueur > limites.fichier) { refusees.push({ nom, motif: `${longueur} octets : ${limites.fichier} au plus par fichier` }); continue; }
    total += longueur;
    if (total > limites.total) throw new ErreurCas(`plus de ${limites.total} octets de fichiers .feature dans l'archive`);
    if (local + 30 > b.length || b.readUInt32LE(local) !== 0x04034b50) throw abimee(`${nom} : en-tête local introuvable`);
    const donnees = local + 30 + b.readUInt16LE(local + 26) + b.readUInt16LE(local + 28);
    if (donnees + comprime > b.length) throw abimee(`${nom} : données hors du fichier`);
    const brut = b.subarray(donnees, donnees + comprime);
    let contenu;
    try {
      contenu = methode === 0 ? brut : inflateRawSync(brut, { maxOutputLength: Math.max(1, limites.fichier) });
    } catch {
      throw abimee(`${nom} : données compressées illisibles`);
    }
    if (contenu.length !== longueur || (crc32(contenu) >>> 0) !== crc) throw abimee(`${nom} : contenu altéré (CRC-32)`);
    entrees.push({ nom, octets: Buffer.from(contenu) });
  }
  return { entrees, ignorees, refusees };
}

// Étiquettes d'identité d'un scénario de fichier .feature (D17.INV-4).
const RE_TEST_ZEPHYR = /^TestCaseKey=([A-Z][A-Z0-9_]+-T\d+)$/;
const RE_TEST_XRAY = /^(?:TEST_)?([A-Z][A-Z0-9_]+-\d+)$/;
const RE_ETIQUETTE_JIRA = /^[A-Z][A-Z0-9_]+-\d+-S\d+$/;

/**
 * Identité des scénarios d'un fichier .feature (D17.INV-4) : la clé de l'étiquette @TestCaseKey=… de
 * Zephyr Scale ; sinon la première étiquette propre au scénario qui est une clé de Jira, préfixe TEST_
 * retiré, celle d'un test de Xray, sauf si un scénario d'un autre titre la porte aussi (c'est alors la
 * clé d'une demande) ; sinon une étiquette <CLÉ>-Snn d'un import de Jira. Rend la fonction sc → clé ou null.
 */
export function identitesGherkin(scenarios) {
  const candidats = (sc) => {
    const propres = sc.etiquettesPropres ?? [];
    return {
      zephyr: propres.map((e) => RE_TEST_ZEPHYR.exec(e)?.[1]).find(Boolean) ?? null,
      xray: propres.map((e) => RE_TEST_XRAY.exec(e)?.[1]).find(Boolean) ?? null,
      jira: propres.find((e) => RE_ETIQUETTE_JIRA.test(e)) ?? null,
    };
  };
  const titres = new Map();
  for (const sc of scenarios) {
    const { xray } = candidats(sc);
    if (xray) titres.set(xray, (titres.get(xray) ?? new Set()).add(sc.titre));
  }
  return (sc) => {
    const c = candidats(sc);
    return c.zephyr ?? (c.xray && titres.get(c.xray).size === 1 ? c.xray : null) ?? c.jira;
  };
}

// --- Requêtes aux API, en lecture seule ----------------------------------------------------------

/**
 * Adresse de l'API d'un outil : --api, sinon celle de l'outil en Cloud. En https, sauf sur le poste même,
 * sans identifiant, paramètre ni fragment (D17.INV-3). Lève ErreurCas ; le message ne reprend pas la valeur.
 */
export function adresseApi(cleOutil, api = null) {
  const outil = OUTILS[cleOutil];
  const brute = api ?? outil.base;
  if (!brute) throw new ErreurCas(`${cleOutil}: attend --api <adresse de votre Jira ${outil.variante}>, en https`);
  let u;
  try {
    u = new URL(brute);
  } catch {
    throw new ErreurCas('--api invalide : adresse http ou https attendue');
  }
  if (u.username || u.password || u.search || u.hash) throw new ErreurCas('--api : l\'adresse seule, sans identifiant, paramètre ni fragment ; le jeton passe par une variable d\'environnement');
  const poste = ['127.0.0.1', 'localhost', '[::1]'].includes(u.hostname);
  if (u.protocol !== 'https:' && !(u.protocol === 'http:' && poste)) throw new ErreurCas(`--api ${u.origin} : https attendu, un jeton ne passe jamais en clair hors du poste (D17.INV-3)`);
  return `${u.origin}${u.pathname.replace(/\/+$/, '')}`;
}

/**
 * Jetons d'un outil, lus dans les variables d'environnement seulement (D17.INV-3) : { valeurs } ou { erreur }.
 * Une valeur qui n'est pas faite de caractères ASCII visibles est refusée, sans que le message la reprenne.
 */
export function lireJetons(cleOutil, env) {
  const { variables } = OUTILS[cleOutil];
  const manquantes = variables.filter((v) => typeof env[v] !== 'string' || env[v].trim() === '');
  if (manquantes.length) {
    const s = manquantes.length > 1 ? 's' : '';
    return { erreur: `variable${s} d'environnement ${manquantes.join(' et ')} absente${s} : ${s ? 'les' : 'la'} définir vous-même dans votre terminal, pour cette session, jamais dans la commande ni dans un fichier du dépôt, puis relancer` };
  }
  const invalides = variables.filter((v) => !/^[\x21-\x7e]+$/.test(env[v].trim()));
  if (invalides.length) return { erreur: `variable d'environnement ${invalides.join(' et ')} : valeur invalide, espace ou caractère non imprimable ; la redéfinir vous-même, puis relancer` };
  return { valeurs: variables.map((v) => env[v].trim()) };
}

const DELAI_REQUETE = 30_000;
const TAILLE_REPONSE = 20 * 1024 * 1024;

/**
 * Requête à l'API désignée (D17.INV-2, D17.INV-3) : GET, ou POST pour l'authentification et les requêtes
 * GraphQL de Xray Cloud ; même origine que l'API ; aucune redirection suivie ; 30 s au plus. Le jeton ne va
 * que dans l'en-tête Authorization, et aucun message ne le reprend. Rend { statut, json } ; un statut 404
 * est rendu tel quel, les autres erreurs lèvent ErreurCas.
 */
export async function demander(base, adresse, { methode = 'GET', jeton = null, corps } = {}) {
  const secrets = [jeton, corps?.client_id, corps?.client_secret].filter((x) => typeof x === 'string' && x !== '');
  const sansSecret = (texte) => secrets.reduce((t, x) => t.split(x).join('***'), String(texte));
  const cible = new URL(adresse, `${base}/`);
  if (cible.origin !== new URL(base).origin) throw new ErreurCas(`adresse hors de l'API désignée, non demandée : ${cible.origin}`);
  if (methode !== 'GET' && methode !== 'POST') throw new ErreurCas(`méthode ${methode} refusée : lecture seule (D17.INV-2)`);
  const lieu = `${methode} ${cible.origin}${cible.pathname}`;
  const entetes = { accept: 'application/json' };
  if (jeton) entetes.authorization = `Bearer ${jeton}`;
  if (corps !== undefined) entetes['content-type'] = 'application/json';
  let r;
  try {
    r = await fetch(cible, { method: methode, headers: entetes, body: corps === undefined ? undefined : JSON.stringify(corps), redirect: 'manual', signal: AbortSignal.timeout(DELAI_REQUETE) });
  } catch (e) {
    if (e?.name === 'TimeoutError' || e?.name === 'AbortError') throw new ErreurCas(`${lieu} : pas de réponse en ${DELAI_REQUETE / 1000} s`);
    throw new ErreurCas(`${lieu} : injoignable (${court(sansSecret(uneLigne(e?.cause?.code ?? e?.cause?.message ?? e?.message)), 120)})`);
  }
  if ((r.status >= 300 && r.status < 400) || r.type === 'opaqueredirect') {
    let vers = '';
    try {
      vers = r.headers.get('location') ? ` vers ${new URL(r.headers.get('location'), cible).origin}` : '';
    } catch {
      vers = '';
    }
    throw new ErreurCas(`${lieu} : redirection${vers} refusée, le jeton ne suit pas une redirection (D17.INV-3)`);
  }
  if (r.status === 401 || r.status === 403) throw new ErreurCas(`${lieu} : accès refusé (${r.status}) : jeton absent, expiré ou sans droit de lecture`);
  if (r.status === 404) return { statut: 404, json: null };
  const texte = await r.text();
  if (texte.length > TAILLE_REPONSE) throw new ErreurCas(`${lieu} : réponse de plus de ${TAILLE_REPONSE} octets`);
  let json = null;
  try {
    json = texte === '' ? null : JSON.parse(texte);
  } catch {
    if (r.ok) throw new ErreurCas(`${lieu} : réponse qui n'est pas du JSON`);
  }
  if (!r.ok) {
    const detail = [json?.errorMessages?.[0], json?.message, json?.errors?.[0]?.message, json?.error].find((x) => typeof x === 'string');
    throw new ErreurCas(`${lieu} : réponse ${r.status}${r.status === 429 ? ', trop de requêtes : attendre, puis relancer' : ''}${detail ? ` (${court(sansSecret(uneLigne(detail)))})` : ''}`);
  }
  return { statut: r.status, json };
}

// Requête GraphQL de Xray Cloud : une lecture, jamais une mutation (D17.INV-2).
export const REQUETE_XRAY = `query Tests($jql: String!, $limit: Int!) {
  getTests(jql: $jql, limit: $limit) {
    total
    results {
      issueId
      testType { name kind }
      steps { action data result }
      gherkin
      preconditions(limit: 20) { total results { jira(fields: ["key"]) } }
      jira(fields: ["key", "summary", "labels"])
    }
  }
}`;

const texteHtml = (h) => lignesJointes(htmlEnLignes(String(h ?? '')));
const brutDe = (v) => (typeof v === 'string' ? v : typeof v?.raw === 'string' ? v.raw : '');
const etiquettesDe = (liste) => (Array.isArray(liste) ? liste.map(uneLigne).filter((e) => e && !/\s/.test(e)) : []);
const refusDe = (motif) => ({ genre: 'refus', motif });

/** Test de Xray Cloud lu par GraphQL, vers le modèle commun des cas de test. */
function testXrayCloud(t, cle, source) {
  const commun = { cle, titre: uneLigne(t.jira?.summary), etiquettes: etiquettesDe(t.jira?.labels), source, notes: [] };
  const preconditions = (t.preconditions?.results ?? []).map((p) => p?.jira?.key).filter((k) => RE_CLE.test(k ?? ''));
  if (preconditions.length) commun.notes.push(`Préconditions dans Xray, non reprises : ${preconditions.join(', ')} ; à jouer avant le scénario, ou à reporter dans le texte.`);
  const genre = t.testType?.kind;
  const nom = uneLigne(t.testType?.name) || genre || 'inconnu';
  if (genre === 'Gherkin') return { ...commun, genre: 'gherkin', sorte: nom, gherkin: String(t.gherkin ?? '') };
  if (genre === 'Steps') return { ...commun, genre: 'pas', sorte: 'manuel', pas: (t.steps ?? []).map((s) => ({ action: s?.action, donnees: s?.data, attendu: s?.result })) };
  if (genre === 'Unstructured') return { ...commun, sorte: nom, ...refusDe(`test ${nom} : définition en texte libre, sans étapes ; à écrire en Cucumber ou en pas à pas dans Xray`) };
  return { ...commun, sorte: nom, ...refusDe(`type de test « ${nom} » non pris en charge (Cucumber ou manuel)`) };
}

/** Xray Cloud : authentification par XRAY_CLIENT_ID et XRAY_CLIENT_SECRET, puis une requête GraphQL par test. */
async function lireXrayCloud(cles, { base, jetons: [identifiant, secret] }) {
  if (!/^query\b/.test(REQUETE_XRAY) || /\bmutation\b/i.test(REQUETE_XRAY)) throw new ErreurCas('requête GraphQL refusée : lecture seule (D17.INV-2)');
  const auth = await demander(base, `${base}/api/v2/authenticate`, { methode: 'POST', corps: { client_id: identifiant, client_secret: secret } });
  if (auth.statut === 404 || typeof auth.json !== 'string' || auth.json === '') throw new ErreurCas(`POST ${base}/api/v2/authenticate : aucun jeton rendu ; adresse de Xray Cloud à vérifier (--api)`);
  const jeton = auth.json;
  const tests = [];
  const introuvables = [];
  for (const cle of cles) {
    const r = await demander(base, `${base}/api/v2/graphql`, { methode: 'POST', jeton, corps: { query: REQUETE_XRAY, variables: { jql: `key = "${cle}"`, limit: 1 } } });
    if (r.statut === 404) throw new ErreurCas(`POST ${base}/api/v2/graphql : introuvable ; adresse de Xray Cloud à vérifier (--api)`);
    const t = (r.json?.data?.getTests?.results ?? []).find((x) => x?.jira?.key === cle);
    if (!t) {
      const erreur = r.json?.errors?.[0]?.message;
      introuvables.push({ cle, motif: typeof erreur === 'string' ? court(uneLigne(erreur)) : 'aucun test de cette clé dans Xray, ou pas de droit de lecture' });
      continue;
    }
    tests.push(testXrayCloud(t, cle, `${base}/api/v2/graphql, test ${cle}`));
  }
  return { tests, introuvables };
}

/** Xray Data Center : la demande par l'API de Jira (résumé, étiquettes), puis le test par l'API de Xray, avec JIRA_TOKEN. */
async function lireXrayDc(cles, { base, jetons: [jeton] }) {
  const tests = [];
  const introuvables = [];
  for (const cle of cles) {
    const demande = await demander(base, `${base}/rest/api/2/issue/${cle}?fields=summary,labels`, { jeton });
    if (demande.statut === 404) { introuvables.push({ cle, motif: 'demande absente de Jira, ou pas de droit de lecture' }); continue; }
    const source = `${base}/rest/raven/1.0/api/test?keys=${cle}`;
    const r = await demander(base, source, { jeton });
    const t = Array.isArray(r.json) ? r.json.find((x) => x?.key === cle) : null;
    if (!t) { introuvables.push({ cle, motif: 'la demande n\'est pas un test de Xray' }); continue; }
    const commun = { cle, titre: uneLigne(demande.json?.fields?.summary), etiquettes: etiquettesDe(demande.json?.fields?.labels), source, notes: [] };
    const preconditions = (Array.isArray(t.precondition) ? t.precondition : []).map((p) => (typeof p === 'string' ? p : p?.key)).filter((k) => RE_CLE.test(k ?? ''));
    if (preconditions.length) commun.notes.push(`Préconditions dans Xray, non reprises : ${preconditions.join(', ')} ; à jouer avant le scénario, ou à reporter dans le texte.`);
    const type = uneLigne(t.type);
    if (/cucumber/i.test(type)) tests.push({ ...commun, genre: 'gherkin', sorte: 'Cucumber', gherkin: typeof t.definition === 'string' ? t.definition : '' });
    else if (/manual/i.test(type)) {
      const pas = (Array.isArray(t.definition?.steps) ? t.definition.steps : []).slice().sort((a, b) => (a?.index ?? 0) - (b?.index ?? 0));
      tests.push({ ...commun, genre: 'pas', sorte: 'manuel', pas: pas.map((s) => ({ action: brutDe(s?.step), donnees: brutDe(s?.data), attendu: brutDe(s?.result) })) });
    } else if (/generic/i.test(type)) tests.push({ ...commun, sorte: 'Generic', ...refusDe('test Generic : définition en texte libre, sans étapes ; à écrire en Cucumber ou en pas à pas dans Xray') });
    else tests.push({ ...commun, sorte: type || 'inconnu', ...refusDe(`type de test « ${type || 'inconnu'} » non pris en charge (Cucumber ou manuel)`) });
  }
  return { tests, introuvables };
}

/** Précondition d'un cas de test de Zephyr Scale, signalée dans l'en-tête, non reprise. */
const noteZephyr = (precondition) => {
  const t = texteHtml(precondition);
  return t ? [`Précondition dans Zephyr Scale, non reprise : « ${court(t)} » ; à jouer avant le scénario, ou à reporter dans le texte.`] : [];
};

/** Script BDD de Zephyr Scale : texte Gherkin, ou HTML ramené à ses lignes. */
const lignesBdd = (texte) => (/<(p|br|div|pre)\b/i.test(String(texte ?? '')) ? htmlEnLignes(String(texte)) : String(texte ?? '').split(/\r?\n/)).join('\n');

/** Zephyr Scale Cloud : le cas de test, puis son script, par le lien qu'il donne, avec ZEPHYR_TOKEN. */
async function lireZephyrCloud(cles, { base, jetons: [jeton] }) {
  const tests = [];
  const introuvables = [];
  for (const cle of cles) {
    const source = `${base}/testcases/${cle}`;
    const r = await demander(base, source, { jeton });
    if (r.statut === 404) { introuvables.push({ cle, motif: 'aucun cas de test de cette clé dans Zephyr Scale, ou pas de droit de lecture' }); continue; }
    const tc = r.json ?? {};
    const commun = { cle, titre: uneLigne(tc.name), etiquettes: etiquettesDe(tc.labels), source, notes: noteZephyr(tc.precondition) };
    const lien = typeof tc.testScript?.self === 'string' ? new URL(tc.testScript.self, `${base}/`) : null;
    if (!lien) { tests.push({ ...commun, sorte: 'sans script', ...refusDe('cas de test sans script') }); continue; }
    if (/\/teststeps\/?$/.test(lien.pathname)) {
      const valeurs = [];
      for (let debut = 0, page = 0; page < 50; page++) {
        const u = new URL(lien);
        u.searchParams.set('maxResults', '100');
        u.searchParams.set('startAt', String(debut));
        const p = await demander(base, u.href, { jeton });
        const vals = Array.isArray(p.json?.values) ? p.json.values : [];
        valeurs.push(...vals);
        if (p.json?.isLast !== false || vals.length === 0) break;
        debut += vals.length;
      }
      const appel = valeurs.find((v) => v?.testCase);
      if (appel) { tests.push({ ...commun, sorte: 'pas à pas', ...refusDe(`pas qui appelle le cas de test ${uneLigne(appel.testCase.testCaseKey) || 'inconnu'}, que l'import ne déplie pas`) }); continue; }
      tests.push({ ...commun, genre: 'pas', sorte: 'pas à pas', pas: valeurs.map((v) => ({ action: texteHtml(v?.inline?.description), donnees: texteHtml(v?.inline?.testData), attendu: texteHtml(v?.inline?.expectedResult) })) });
      continue;
    }
    const s = await demander(base, lien.href, { jeton });
    const type = uneLigne(s.json?.type).toLowerCase();
    if (type === 'bdd') tests.push({ ...commun, genre: 'gherkin', sorte: 'BDD', gherkin: lignesBdd(s.json?.text) });
    else tests.push({ ...commun, sorte: 'texte libre', ...refusDe('script en texte libre, sans étapes ; à écrire en pas à pas ou en BDD dans Zephyr Scale') });
  }
  return { tests, introuvables };
}

/** Zephyr Scale Data Center : le cas de test et son script par l'API de Zephyr Scale, avec JIRA_TOKEN. */
async function lireZephyrDc(cles, { base, jetons: [jeton] }) {
  const tests = [];
  const introuvables = [];
  for (const cle of cles) {
    const source = `${base}/rest/atm/1.0/testcase/${cle}`;
    const r = await demander(base, source, { jeton });
    if (r.statut === 404) { introuvables.push({ cle, motif: 'aucun cas de test de cette clé dans Zephyr Scale, ou pas de droit de lecture' }); continue; }
    const tc = r.json ?? {};
    const commun = { cle, titre: uneLigne(tc.name), etiquettes: etiquettesDe(tc.labels), source, notes: noteZephyr(tc.precondition) };
    const script = tc.testScript ?? {};
    const type = uneLigne(script.type).toUpperCase();
    if (type === 'STEP_BY_STEP') {
      const pas = (Array.isArray(script.steps) ? script.steps : []).slice().sort((a, b) => (a?.index ?? 0) - (b?.index ?? 0));
      const appel = pas.find((s) => s?.testCaseKey);
      if (appel) tests.push({ ...commun, sorte: 'pas à pas', ...refusDe(`pas qui appelle le cas de test ${uneLigne(appel.testCaseKey)}, que l'import ne déplie pas`) });
      else tests.push({ ...commun, genre: 'pas', sorte: 'pas à pas', pas: pas.map((s) => ({ action: texteHtml(s?.description), donnees: texteHtml(s?.testData), attendu: texteHtml(s?.expectedResult) })) });
    } else if (type === 'BDD') tests.push({ ...commun, genre: 'gherkin', sorte: 'BDD', gherkin: lignesBdd(script.text) });
    else if (type === 'PLAIN_TEXT') tests.push({ ...commun, sorte: 'texte libre', ...refusDe('script en texte libre, sans étapes ; à écrire en pas à pas ou en BDD dans Zephyr Scale') });
    else tests.push({ ...commun, sorte: 'sans script', ...refusDe('cas de test sans script') });
  }
  return { tests, introuvables };
}

const LECTEURS = { xray: lireXrayCloud, 'xray-dc': lireXrayDc, zephyr: lireZephyrCloud, 'zephyr-dc': lireZephyrDc };

/**
 * Tests d'un outil lus par son API, en lecture seule : { tests, introuvables }. Chaque test suit le modèle
 * commun : { cle, titre, etiquettes, genre (gherkin, pas, refus), sorte, gherkin, pas, motif, source, notes }.
 * Lève ErreurCas avant tout résultat si une requête échoue.
 */
export function lireTests(cleOutil, cles, { base, jetons }) {
  return LECTEURS[cleOutil](cles, { base, jetons });
}

// --- Tests en scénarios --------------------------------------------------------------------------

/**
 * Étapes d'un test manuel (D17.INV-5) : chaque pas devient « Quand <action> », avec ses données, puis
 * « Alors <résultat attendu> » ; une partie de plusieurs lignes tient sur une, ses lignes séparées par « ; » ;
 * une partie vide est omise.
 */
export function pasEnEtapes(pas) {
  const etapes = [];
  for (const p of pas) {
    const action = lignesJointes(String(p.action ?? '').split(/\r?\n/));
    const donnees = lignesJointes(String(p.donnees ?? '').split(/\r?\n/));
    const attendu = lignesJointes(String(p.attendu ?? '').split(/\r?\n/));
    const quand = [action, donnees ? `avec « ${donnees} »` : ''].filter(Boolean).join(', ');
    if (quand) etapes.push({ motCle: 'Quand', phrase: quand });
    if (attendu) etapes.push({ motCle: 'Alors', phrase: attendu });
  }
  return etapes;
}

const MOTS_ANGLAIS = /^(given|when|then|and|but)$/;

/** Scénario d'un test Cucumber ou BDD : ses étapes, sous un titre formé de son résumé si elles n'en ont pas. */
function gherkinEnScenario(t, provenance, etiquettes) {
  const lignes = lignesDe(t.gherkin);
  const utiles = lignes.filter((l) => l !== '' && !l.startsWith('#'));
  const premiere = utiles.find((l) => !l.startsWith('@'));
  const genre = premiere ? lireTitre(premiere)?.genre : null;
  const tete = [etiquettes.map((e) => `@${e}`).join(' ')];
  if (genre !== 'scenario' && genre !== 'fonctionnalite') {
    const motCle = utiles.map(lireMotCle).find(Boolean)?.motCle ?? '';
    const anglais = MOTS_ANGLAIS.test(plat(motCle));
    const plan = utiles.some((l) => lireTitre(l)?.genre === 'exemples');
    tete.push(`${anglais ? (plan ? 'Scenario Outline' : 'Scenario') : (plan ? 'Plan du scénario' : 'Scénario')}: ${t.titre}`);
  }
  const { scenarios } = extraireScenarios([{ zone: 'test', libelle: provenance, lignes: [...tete, ...lignes] }]);
  if (scenarios.length === 1) return scenarios[0];
  return { ...scenarioVide(t, provenance, etiquettes), refus: scenarios.length === 0 ? 'aucun scénario lisible dans le test' : `${scenarios.length} scénarios dans un même test, quand un test en porte un` };
}

function scenarioVide(t, provenance, etiquettes) {
  return { zone: 'test', provenance, fonctionnalite: null, motTitre: 'Scénario', titre: t.titre, etiquettesJira: etiquettes, etiquettesPropres: etiquettes, etapes: [], contexte: 0, exemples: null, refus: null };
}

/**
 * Scénarios des tests lus par l'API, un par test, identifiés par la clé du test (D17.INV-4) : { ...scénario,
 * cleTest, lot, source, notes, manuel }. Un test sans résumé, un test manuel sans pas ou avec un pas vide
 * (dans Xray, l'appel d'un autre test), un test refusé par sa lecture gardent leur motif.
 */
export function scenariosDesTests(tests, cleOutil) {
  const outil = OUTILS[cleOutil];
  return tests.map((t) => {
    const etiquettes = [t.cle, ...t.etiquettes.filter((e) => e !== t.cle)];
    const provenance = `${outil.test} ${t.sorte} ${t.cle}`;
    let sc;
    if (!t.titre) sc = { ...scenarioVide(t, provenance, etiquettes), refus: `${outil.test} sans résumé` };
    else if (t.genre === 'gherkin') sc = gherkinEnScenario(t, provenance, etiquettes);
    else if (t.genre === 'pas') {
      const etapes = pasEnEtapes(t.pas);
      const vide = t.pas.findIndex((p) => [p.action, p.donnees, p.attendu].every((x) => lignesJointes(String(x ?? '').split(/\r?\n/)) === ''));
      const refus = vide >= 0 ? `pas ${vide + 1} vide, sans action, données ni résultat attendu, l'appel d'un autre test peut-être : rien n'est deviné` : etapes.length ? null : `${outil.test} manuel sans pas`;
      sc = { ...scenarioVide(t, provenance, etiquettes), etapes, manuel: true, refus };
    } else sc = { ...scenarioVide(t, provenance, etiquettes), refus: t.motif };
    if (!sc.empreinte) sc.empreinte = empreinteJira(sc);
    return Object.assign(sc, { cleTest: t.cle, lot: `${outil.lot} ${t.cle}`, source: t.source, notes: t.notes ?? [] });
  });
}
```
