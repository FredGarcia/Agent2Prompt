---
name: preuves
description: Preuves et rapport d'une exécution (dossier de résultats horodaté à côté du scénario, rapport.json aux champs stables, point d'extension E1, rapport.md lisible, captures par vérification, par capture demandée et par échec, instantané ARIA à l'échec, erreurs de console, erreurs de la page et réponses de statut 400 ou plus relevées par étape, téléchargements et leur empreinte, origines bloquées, cibles fragiles, trace sur demande), source de scripts/rapport.mjs. À lire pour exploiter un rapport.
dimensions: [D8]
status: active
---

# Module `preuves` (D8)

Phase 7E couverte : Expression.

## 1. Dossier de résultats (D8.INV-1)

Chaque exécution écrit son dossier, `resultats/<AAAAMMJJ-HHMMSS>-<scénario>/` à côté du scénario, ou dans le dossier de `--resultats` ; deux exécutions dans la même seconde ont deux dossiers. Il est créé une fois le navigateur ouvert : une exécution refusée (code 2) n'en écrit pas.

```text
rapport.json            champs stables (§ 2)
rapport.md              le même rapport, lisible
captures/<n>-<action>.png        vérification, capture demandée (nom donné), échec (…-echec.png)
aria/<n>-<action>.yml            instantané ARIA de la page, à chaque échec
telechargements/<fichier>        fichiers téléchargés
trace.zip               seulement avec --trace
```

`<n>` est le numéro de l'étape sur deux chiffres, précédé de `j<jeu>-` quand le scénario a plusieurs jeux : `captures/j2-05-verifier.png`.

## 2. `rapport.json` (point d'extension E1)

Format `scenario-playwright.rapport/1`. Champs de l'exécution :

| Champ | Contenu |
|---|---|
| `format`, `skill`, `version` | `scenario-playwright.rapport/1`, `scenario-playwright`, version du skill |
| `scenario` | `fichier`, `titre`, `etiquettes`, `source`, `empreinte` (SHA-256 du TOML joué), `url_base`, `origines` |
| `debut`, `fin`, `duree_ms` | horodatages ISO et durée |
| `navigateur` | `canal`, `version`, `playwright_core`, `chromium_reference`, `avertissement` (D6.INV-1) |
| `options` | `sans_tete`, `ralenti`, `trace`, `mutations_autorisees`, `params`, `jeu` |
| `jeux` | pour chaque jeu : `numero`, `valeurs` (variables résolues), `statut` (`reussi`, `echec`), `etapes` |
| `origines_bloquees` | `[{ origine, requetes }]` (D7.INV-1) |
| `cibles_fragiles` | cibles en `css` ou `rang` employées (D4.INV-1) |
| `bilan` | `jeux`, `etapes`, `reussies`, `echecs`, `non_jouees` |
| `statut` | `reussi` si chaque jeu a réussi, sinon `echec` |

Champs de chaque étape :

| Champ | Contenu |
|---|---|
| `numero`, `ligne`, `action`, `resume` | numéro dans le jeu, ligne du texte (ou `null`), action, résumé lisible |
| `cible`, `fragile` | cible dans la notation de Playwright, et si elle est fragile |
| `mutation` | `creation`, `modification`, `suppression` ou `null` |
| `statut`, `duree_ms`, `message` | `reussie`, `echec` ou `non_jouee` ; durée ; message d'échec ou motif de non-exécution |
| `capture`, `aria` | chemins relatifs au dossier de résultats, ou `null` |
| `telechargement` | `{ fichier, propose, octets, sha256 }`, ou `null` |
| `console`, `erreurs_page`, `reponses` | erreurs de console, exceptions de la page, réponses de statut 400 ou plus (`500 http://…`) relevées pendant l'étape (D8.INV-2) |

Ces champs sont stables : un nouveau champ peut s'ajouter dans une version mineure, aucun ne change de sens. D12 et D13 liront le rapport sans rejouer le scénario.

## 3. `rapport.md`

Le même rapport, en français : statut et titre, scénario et texte d'origine, étiquettes, durée et bilan, navigateur et avertissement, rappel sur la trace, un tableau des étapes par jeu (numéro, ligne du texte, résumé, statut, durée, message, capture, instantané, téléchargement, erreurs relevées), puis les origines bloquées et les cibles fragiles, avec la conduite à tenir.

## 4. Captures et instantanés (D8.INV-2)

- Chaque étape `verifier` a sa capture, réussie ou non : la zone de la cible si elle est unique et visible, sinon la page.
- Chaque étape `capturer` a la sienne, nommée par `nom` : la zone de la cible, ou la page, entière avec `pleine_page = true`.
- Chaque échec a la capture de la page et l'instantané ARIA de la page entière : l'arbre que voit un lecteur d'écran, où se lisent les rôles et les noms des éléments présents, pour corriger une cible.

## 5. Erreurs relevées

Les erreurs de console, les exceptions de la page et les réponses HTTP de statut 400 ou plus sont rattachées à l'étape en cours, ou à la dernière étape jouée si elles arrivent juste après. Elles ne font pas échouer l'étape : l'application peut se plaindre sans que le geste échoue ; c'est au développeur, ou à une étape `verifier`, de juger.

## 6. Contrôle de sortie

- Chaque exécution jouée écrit `rapport.json` et `rapport.md` dans son dossier horodaté ; une exécution refusée n'en écrit pas (D8.INV-1).
- Captures par vérification, par capture demandée et par échec, instantané ARIA à l'échec, erreurs relevées par étape (D8.INV-2).
- Les champs du rapport sont ceux du § 2, dans cet ordre (E1, module `recette`, R16).

## 7. Source `scripts/rapport.mjs`

<!-- fichier : scripts/rapport.mjs -->
```javascript
// scenario-playwright 1.0.0 : rapport d'une exécution, en JSON (champs stables, E1) et en Markdown.
//
// Chaque exécution écrit son dossier de résultats horodaté : rapport.json, rapport.md, captures,
// instantanés ARIA à l'échec, téléchargements, et la trace si elle est demandée (D8.INV-1, D8.INV-2).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const FORMAT_RAPPORT = 'scenario-playwright.rapport/1';
export const VERSION_SKILL = '1.0.0';

const deux = (n) => String(n).padStart(2, '0');

/** Dossier de résultats d'une exécution : <base>/<AAAAMMJJ-HHMMSS>-<nom du scénario>. */
export function dossierResultats(base, nomScenario, date = new Date()) {
  const horodatage = `${date.getFullYear()}${deux(date.getMonth() + 1)}${deux(date.getDate())}-${deux(date.getHours())}${deux(date.getMinutes())}${deux(date.getSeconds())}`;
  const nom = String(nomScenario).replace(/\.toml$/i, '').replace(/[^A-Za-z0-9_-]+/g, '-').slice(0, 60) || 'scenario';
  let dossier = join(base, `${horodatage}-${nom}`);
  for (let i = 2; ; i++) {
    try {
      mkdirSync(dossier, { recursive: false });
      return dossier;
    } catch (e) {
      if (e.code === 'ENOENT') mkdirSync(base, { recursive: true });
      else if (e.code === 'EEXIST') dossier = join(base, `${horodatage}-${nom}-${i}`);
      else throw e;
    }
  }
}

/** Rapport d'une exécution (E1) : champs stables, décomptes recalculés depuis les étapes. */
export function construireRapport({ fichier, scenario, empreinte, debut, fin, navigateur, options, jeux, journal }) {
  const etapes = jeux.flatMap((j) => j.etapes);
  const compte = (s) => etapes.filter((e) => e.statut === s).length;
  const statut = jeux.every((j) => j.statut === 'reussi') ? 'reussi' : 'echec';
  return {
    format: FORMAT_RAPPORT,
    skill: 'scenario-playwright',
    version: VERSION_SKILL,
    scenario: { fichier, titre: scenario.titre, etiquettes: scenario.etiquettes, source: scenario.source ?? null, empreinte, url_base: scenario.url_base, origines: scenario.origines },
    debut: debut.toISOString(),
    fin: fin.toISOString(),
    duree_ms: fin - debut,
    navigateur,
    options,
    jeux,
    origines_bloquees: [...(journal?.bloquees ?? new Map())].map(([origine, requetes]) => ({ origine, requetes })),
    cibles_fragiles: [...new Set(etapes.filter((e) => e.fragile).map((e) => e.cible))],
    bilan: { jeux: jeux.length, etapes: etapes.length, reussies: compte('reussie'), echecs: compte('echec'), non_jouees: compte('non_jouee') },
    statut,
  };
}

const STATUT = { reussie: 'réussie', echec: 'ÉCHEC', non_jouee: 'non jouée' };
const echapper = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** Rapport lisible, en Markdown. */
export function rapportMarkdown(r) {
  const l = [];
  l.push(`# ${r.statut === 'reussi' ? 'Réussi' : 'Échec'} : ${r.scenario.titre}`, '');
  l.push(`- Scénario : \`${r.scenario.fichier}\`${r.scenario.source ? `, traduit de \`${r.scenario.source}\`` : ''}${r.scenario.etiquettes.length ? ` ; étiquettes ${r.scenario.etiquettes.map((x) => `@${x}`).join(' ')}` : ''}`);
  l.push(`- Exécution : ${r.debut}, ${Math.round(r.duree_ms / 100) / 10} s ; ${r.bilan.etapes} étapes, ${r.bilan.reussies} réussies, ${r.bilan.echecs} en échec, ${r.bilan.non_jouees} non jouées`);
  l.push(`- Navigateur : ${r.navigateur.canal} ${r.navigateur.version}, playwright-core ${r.navigateur.playwright_core}${r.options.sans_tete ? ', sans fenêtre' : ''}${r.options.mutations_autorisees ? ' ; mutations autorisées hors du poste' : ''}`);
  if (r.navigateur.avertissement) l.push(`- **Compatibilité** : ${r.navigateur.avertissement}`);
  if (r.options.trace) l.push('- **Trace** : `trace.zip` contient les cookies et les en-têtes de la session ; elle reste sur le poste et ne se partage pas.');
  for (const j of r.jeux) {
    l.push('', r.jeux.length > 1 ? `## Jeu ${j.numero} : ${Object.entries(j.valeurs).map(([k, v]) => `${k} = ${v}`).join(', ')}` : '## Étapes', '');
    l.push('| # | Ligne | Étape | Statut | Durée | Détail |', '|---|---|---|---|---|---|');
    for (const e of j.etapes) {
      const details = [e.message, e.capture ? `capture \`${e.capture}\`` : null, e.aria ? `ARIA \`${e.aria}\`` : null, e.telechargement ? `fichier \`${e.telechargement.fichier}\`, ${e.telechargement.octets} octets` : null, e.fragile ? 'cible fragile' : null, ...e.console.map((c) => `console : ${c}`), ...e.erreurs_page.map((c) => `erreur de la page : ${c}`), ...e.reponses.map((c) => `réponse ${c}`)].filter(Boolean);
      l.push(`| ${e.numero} | ${e.ligne ?? ''} | ${echapper(e.resume)} | ${STATUT[e.statut]} | ${e.statut === 'non_jouee' ? '' : `${e.duree_ms} ms`} | ${echapper(details.join(' ; '))} |`);
    }
  }
  if (r.origines_bloquees.length) {
    l.push('', '## Origines bloquées', '', 'Requêtes interrompues avant chargement : ces origines ne sont pas déclarées par le scénario. Une origine légitime s\'ajoute au texte de départ, puis à la traduction ratifiée.', '');
    for (const o of r.origines_bloquees) l.push(`- ${o.origine} : ${o.requetes} requête${o.requetes > 1 ? 's' : ''}`);
  }
  if (r.cibles_fragiles.length) {
    l.push('', '## Cibles fragiles', '', 'Désignées par un sélecteur CSS ou un rang : une cible par rôle et nom, libellé ou texte suit mieux l\'écran.', '');
    for (const c of r.cibles_fragiles) l.push(`- \`${c}\``);
  }
  return `${l.join('\n')}\n`;
}

/** Écrit rapport.json et rapport.md dans le dossier de résultats. */
export function ecrireRapport(dossier, rapport) {
  writeFileSync(join(dossier, 'rapport.json'), `${JSON.stringify(rapport, null, 2)}\n`);
  writeFileSync(join(dossier, 'rapport.md'), rapportMarkdown(rapport));
}
```
