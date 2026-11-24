---
name: preuves
description: Preuves et rapport d'une exécution (dossier de résultats horodaté à côté du scénario, rapport.json aux champs stables, point d'extension E1, rapport.md lisible, verdict de chaque jeu et de l'exécution, conforme, non conforme ou bloqué, avec sa cause, captures par vérification, à l'écran ou hors de l'écran, par capture demandée, par échec et à la fin des étapes de chaque jeu, instantané ARIA à l'échec, erreurs de console, erreurs de la page et réponses de statut 400 ou plus relevées par étape, téléchargements et leur empreinte, relevé des vérifications hors de l'écran, entrées de préparation et de nettoyage et valeurs gardées, nettoyage en échec signalé, origines bloquées, cibles fragiles, trace sur demande, rapport d'une campagne), source de scripts/rapport.mjs. À lire pour exploiter un rapport.
dimensions: [D8]
status: active
---

# Module `preuves` (D8)

Phase 7E couverte : Expression.

## 1. Dossier de résultats (D8.INV-1)

Chaque exécution écrit son dossier, `resultats/<AAAAMMJJ-HHMMSS>-<scénario>/` à côté du scénario, ou dans le dossier de `--resultats` ; deux exécutions dans la même seconde ont deux dossiers. Il est créé une fois le navigateur ouvert : une exécution refusée (code 2) n'en écrit pas. Dans une campagne, le dossier de chaque test est dans celui de la campagne, `resultats/<AAAAMMJJ-HHMMSS>-campagne/`, qui porte aussi `campagne.json` et `campagne.md` (module `conformite`, § 2).

```text
rapport.json            champs stables (§ 2)
rapport.md              le même rapport, lisible
captures/<n>-<action>.png        vérification, capture demandée (nom donné), échec (…-echec.png)
captures/fin.png                 l'écran à la fin des étapes, avant le nettoyage (j<jeu>-fin.png avec plusieurs jeux)
captures/p<k>-…, n<k>-…          entrée de préparation ou de nettoyage : appel en échec, sur la page ouverte, étapes d'un scénario de préparation
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
| `jeux` | pour chaque jeu : `numero`, `valeurs` (variables résolues, `unique` compris), `statut` (`reussi`, `echec`), `preparation`, `etapes`, `nettoyage`, `gardees` (valeurs gardées, masquées par leur nom), `nettoyage_en_echec`, ajoutés en 1.4.0, les entrées de préparation et de nettoyage ayant leurs champs au module `donnees`, § 9 ; depuis 1.6.0, `capture_fin` (l'écran à la fin des étapes, ou `null`), `verdict` (`conforme`, `non_conforme`, `bloque`) et `cause` (`{ genre, numero, ligne, message }`, `genre` valant `preparation`, `verification` ou `action`, ou `null`) (module `conformite`, § 3 et § 4) |
| `origines_bloquees` | `[{ origine, requetes }]` (D7.INV-1) |
| `cibles_fragiles` | cibles en `css` ou `rang` employées (D4.INV-1) |
| `bilan` | `jeux`, `etapes`, `reussies`, `echecs`, `non_jouees`, et depuis 1.4.0 `preparations`, `nettoyages`, `nettoyages_en_echec` |
| `statut` | `reussi` si chaque jeu a réussi, sinon `echec` |
| `verdict` | depuis 1.6.0 : `non_conforme` si un jeu l'est, sinon `bloque` si un jeu l'est, sinon `conforme` (D22.INV-3) |

Champs de chaque étape :

| Champ | Contenu |
|---|---|
| `numero`, `ligne`, `action`, `resume` | numéro dans le jeu, ligne du texte (ou `null`), action, résumé lisible |
| `cible`, `fragile` | cible dans la notation de Playwright, et si elle est fragile |
| `mutation` | `creation`, `modification`, `suppression` ou `null` |
| `statut`, `duree_ms`, `message` | `reussie`, `echec` ou `non_jouee` ; durée de l'étape, arrêtée à son échec, sans le temps de ses preuves ; message d'échec ou motif de non-exécution |
| `capture`, `aria` | chemins relatifs au dossier de résultats, ou `null` |
| `telechargement` | `{ fichier, propose, octets, sha256 }`, ou `null` |
| `hors_ecran` | relevé d'une vérification hors de l'écran (module `hors-ecran`, § 7) : `{ critere, methode, adresse, statut }`, avec `octets` pour `api`, ou `{ critere, fichier, lignes, octets }` ; sinon `null`. Ajouté en 1.3.0 |
| `console`, `erreurs_page`, `reponses` | erreurs de console, exceptions de la page, réponses de statut 400 ou plus (`500 http://…`) relevées pendant l'étape (D8.INV-2) |

Ces champs sont stables : un nouveau champ peut s'ajouter dans une version mineure, aucun ne change de sens. D12 et D13 liront le rapport sans rejouer le scénario ; `resultats.mjs` le lit déjà, pour en écrire les résultats au format d'import de Xray ou de Zephyr Scale et le rapport de conformité à coller dans Jira, retrouve le scénario joué à son empreinte, `scenario.empreinte` (module `export`, § 8), et recalcule les verdicts depuis les étapes, pour lire aussi le rapport d'une version antérieure (module `conformite`, § 4).

## 3. `rapport.md`

Le même rapport, en français : statut et titre, verdict et sa cause, scénario et texte d'origine, étiquettes, durée et bilan, nettoyage en échec s'il y en a, navigateur et avertissement, rappel sur la trace, les tableaux de la préparation et du nettoyage et les valeurs gardées, un tableau des étapes par jeu, avec son verdict quand il y en a plusieurs (numéro, ligne du texte, résumé, statut, durée, message, capture, instantané, téléchargement, relevé hors de l'écran, erreurs relevées), la capture de l'écran à la fin des étapes, puis les origines bloquées et les cibles fragiles, avec la conduite à tenir.

## 4. Captures et instantanés (D8.INV-2)

- Chaque étape `verifier` à l'écran a sa capture, réussie ou non : la zone de la cible si elle est unique et visible, sinon la page. Une vérification hors de l'écran a son relevé, `hors_ecran`, et, depuis 1.6.0, la capture de la page à ce moment, réussie ou non.
- Chaque étape `capturer` a la sienne, nommée par `nom` : la zone de la cible, ou la page, entière avec `pleine_page = true`.
- Chaque échec a la capture de la page et l'instantané ARIA de la page entière, échec d'un appel de préparation ou de nettoyage compris : l'arbre que voit un lecteur d'écran, où se lisent les rôles et les noms des éléments présents, pour corriger une cible. Chacun attend 10 s au plus : une page figée ne retient pas l'exécution.
- Chaque jeu a, depuis 1.6.0, la capture de l'écran à la fin de ses étapes, réussies ou non, avant le nettoyage : `capture_fin`. Une capture qui ne peut se faire, la page fermée, laisse son champ à `null` (D22.INV-2).

## 5. Erreurs relevées

Les erreurs de console, les exceptions de la page et les réponses HTTP de statut 400 ou plus sont rattachées à l'étape en cours, ou à la dernière étape jouée si elles arrivent juste après. Elles ne font pas échouer l'étape : l'application peut se plaindre sans que le geste échoue ; c'est au développeur, ou à une étape `verifier`, de juger.

## 6. Contrôle de sortie

- Chaque exécution jouée écrit `rapport.json` et `rapport.md` dans son dossier horodaté ; une exécution refusée n'en écrit pas (D8.INV-1).
- Captures par vérification, à l'écran ou hors de l'écran, par capture demandée, par échec et à la fin des étapes de chaque jeu, instantané ARIA à l'échec, erreurs relevées par étape (D8.INV-2, D22.INV-2).
- Chaque jeu et l'exécution ont leur verdict et sa cause (D22.INV-3).
- Les champs du rapport sont ceux du § 2, dans cet ordre (E1, module `recette`, R16).

## 7. Source `scripts/rapport.mjs`

Dossier de résultats, verdict d'un jeu et de plusieurs, rapport JSON et Markdown d'une exécution, rapport d'une campagne.

<!-- fichier : scripts/rapport.mjs -->
```javascript
// scenario-playwright 1.6.2 : rapport d'une exécution, en JSON (champs stables, E1) et en Markdown, et rapport
// d'une campagne.
//
// Chaque exécution écrit son dossier de résultats horodaté : rapport.json, rapport.md, captures,
// instantanés ARIA à l'échec, téléchargements, et la trace si elle est demandée (D8.INV-1, D8.INV-2).
// La préparation et le nettoyage des données ont leurs entrées, et un nettoyage en échec est signalé (D20).
// Chaque jeu, et le scénario, ont leur verdict : conforme, non conforme ou bloqué (D22.INV-3). Une campagne
// écrit, dans son dossier, campagne.json et campagne.md, et le dossier de chaque test (D22.INV-1).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const FORMAT_RAPPORT = 'scenario-playwright.rapport/1';
export const FORMAT_CAMPAGNE = 'scenario-playwright.campagne/1';
export const VERSION_SKILL = '1.6.2';

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

/**
 * Verdict d'un jeu (D22.INV-3) : conforme si tout a réussi ; non conforme si une vérification a échoué la
 * première ; bloqué si une préparation, ou une étape qui n'est pas une vérification (action, attente, étape à
 * la main, navigation), a échoué la première, le test n'ayant pu aller jusqu'à ses vérifications. Le
 * nettoyage n'y entre pas (D20.INV-4). Rend { verdict, cause }.
 */
export function verdictDuJeu(j) {
  const p = (j.preparation ?? []).find((x) => x.statut === 'echec');
  if (p) return { verdict: 'bloque', cause: { genre: 'preparation', numero: p.numero, ligne: p.ligne ?? null, message: p.message } };
  const e = j.etapes.find((x) => x.statut === 'echec');
  if (!e) return { verdict: 'conforme', cause: null };
  const verification = e.action === 'verifier';
  return { verdict: verification ? 'non_conforme' : 'bloque', cause: { genre: verification ? 'verification' : 'action', numero: e.numero, ligne: e.ligne ?? null, message: e.message } };
}

/** Verdict de plusieurs jeux ou de plusieurs tests : non conforme s'il y en a un, sinon bloqué s'il y en a un, sinon conforme. */
export const verdictDe = (verdicts) => (verdicts.includes('non_conforme') ? 'non_conforme' : verdicts.includes('bloque') ? 'bloque' : 'conforme');
export const LIBELLES_VERDICT = { conforme: 'conforme', non_conforme: 'non conforme', bloque: 'bloqué' };

/** Rapport d'une exécution (E1) : champs stables, décomptes recalculés depuis les étapes. */
export function construireRapport({ fichier, scenario, empreinte, debut, fin, navigateur, options, jeux: joues, journal }) {
  const jeux = joues.map((j) => ({ ...j, ...verdictDuJeu(j) }));
  const etapes = jeux.flatMap((j) => j.etapes);
  const compte = (s) => etapes.filter((e) => e.statut === s).length;
  const entrees = (g) => jeux.flatMap((j) => j[g] ?? []);
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
    bilan: {
      jeux: jeux.length, etapes: etapes.length, reussies: compte('reussie'), echecs: compte('echec'), non_jouees: compte('non_jouee'),
      preparations: entrees('preparation').length, nettoyages: entrees('nettoyage').length, nettoyages_en_echec: entrees('nettoyage').filter((e) => e.statut === 'echec').length,
    },
    statut,
    verdict: verdictDe(jeux.map((j) => j.verdict)),
  };
}

/** Cause d'un verdict, en une ligne : « étape 4, ligne 12 : message ». */
export function causeLisible(c) {
  if (!c) return '';
  return `${c.genre === 'preparation' ? `préparation ${c.numero}` : `étape ${c.numero}`}${c.ligne ? `, ligne ${c.ligne}` : ''} : ${c.message}`;
}

const STATUT = { reussie: 'réussie', echec: 'ÉCHEC', non_jouee: 'non jouée' };

/** Relevé d'une vérification hors de l'écran, en une ligne (D19). */
function horsEcran(h) {
  if (!h) return null;
  if (h.critere === 'fichier') return `fichier \`${h.fichier}\`, ${h.lignes} ligne${h.lignes > 1 ? 's' : ''}`;
  return `${h.critere === 'api' ? 'API' : 'requête'} ${h.methode} ${h.adresse} → ${h.statut ?? 'sans réponse'}${h.octets !== null && h.octets !== undefined ? `, ${h.octets} octets` : ''}`;
}
const echapper = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** Détails d'une étape, en une cellule. */
const detailsEtape = (e) => [e.message, e.capture ? `capture \`${e.capture}\`` : null, e.aria ? `ARIA \`${e.aria}\`` : null, e.telechargement ? `fichier \`${e.telechargement.fichier}\`, ${e.telechargement.octets} octets` : null, horsEcran(e.hors_ecran), e.fragile ? 'cible fragile' : null, ...e.console.map((c) => `console : ${c}`), ...e.erreurs_page.map((c) => `erreur de la page : ${c}`), ...e.reponses.map((c) => `réponse ${c}`)].filter(Boolean);

/** Lignes du tableau d'une section de préparation ou de nettoyage : chaque entrée, et les étapes d'un scénario de préparation. */
function lignesEntrees(liste, marque) {
  const l = ['| # | Ligne | Entrée | Statut | Durée | Détail |', '|---|---|---|---|---|---|'];
  for (const x of liste) {
    const d = [x.message, x.appel ? `${x.appel.methode} ${x.appel.adresse} → ${x.appel.statut}${x.appel.octets !== null ? `, ${x.appel.octets} octets` : ''}` : null, x.gardees.length ? `garde ${x.gardees.join(', ')}` : null, x.capture ? `capture \`${x.capture}\`` : null, x.aria ? `ARIA \`${x.aria}\`` : null].filter(Boolean);
    l.push(`| ${marque}${x.numero} | ${x.ligne ?? ''} | ${echapper(x.resume)} | ${STATUT[x.statut]} | ${x.statut === 'non_jouee' ? '' : `${x.duree_ms} ms`} | ${echapper(d.join(' ; '))} |`);
    for (const e of x.etapes ?? []) l.push(`| ${marque}${x.numero}.${e.numero} | ${e.ligne ?? ''} | ${echapper(e.resume)} | ${STATUT[e.statut]} | ${e.statut === 'non_jouee' ? '' : `${e.duree_ms} ms`} | ${echapper(detailsEtape(e).join(' ; '))} |`);
  }
  return l;
}

/** Rapport lisible, en Markdown. */
export function rapportMarkdown(r) {
  const l = [];
  l.push(`# ${r.statut === 'reussi' ? 'Réussi' : 'Échec'} : ${r.scenario.titre}`, '');
  const premier = r.jeux.find((j) => j.verdict === r.verdict && j.cause);
  l.push(`- Verdict : ${r.verdict === 'conforme' ? 'conforme' : `**${LIBELLES_VERDICT[r.verdict]}**`}${premier ? ` (${r.jeux.length > 1 ? `jeu ${premier.numero}, ` : ''}${echapper(causeLisible(premier.cause))})` : ''}`);
  l.push(`- Scénario : \`${r.scenario.fichier}\`${r.scenario.source ? `, traduit de \`${r.scenario.source}\`` : ''}${r.scenario.etiquettes.length ? ` ; étiquettes ${r.scenario.etiquettes.map((x) => `@${x}`).join(' ')}` : ''}`);
  l.push(`- Exécution : ${r.debut}, ${Math.round(r.duree_ms / 100) / 10} s ; ${r.bilan.etapes} étapes, ${r.bilan.reussies} réussies, ${r.bilan.echecs} en échec, ${r.bilan.non_jouees} non jouées${r.bilan.preparations || r.bilan.nettoyages ? ` ; préparation : ${r.bilan.preparations} entrée${r.bilan.preparations > 1 ? 's' : ''}, nettoyage : ${r.bilan.nettoyages}` : ''}`);
  if (r.bilan.nettoyages_en_echec) l.push(`- **Nettoyage en échec** (${r.bilan.nettoyages_en_echec}) : des données créées par l'exécution peuvent rester ; voir les entrées en échec, puis nettoyer à la main si besoin.`);
  l.push(`- Navigateur : ${r.navigateur.canal} ${r.navigateur.version}, playwright-core ${r.navigateur.playwright_core}${r.options.sans_tete ? ', sans fenêtre' : ''}${r.options.mutations_autorisees ? ' ; mutations autorisées hors du poste' : ''}`);
  if (r.navigateur.avertissement) l.push(`- **Compatibilité** : ${r.navigateur.avertissement}`);
  if (r.options.trace) l.push('- **Trace** : `trace.zip` contient les cookies et les en-têtes de la session ; elle reste sur le poste et ne se partage pas.');
  for (const j of r.jeux) {
    const plusieurs = r.jeux.length > 1;
    const titre = (x) => (plusieurs ? `### ${x}` : `## ${x}`);
    const entrees = Boolean(j.preparation?.length || j.nettoyage?.length);
    if (plusieurs) l.push('', `## Jeu ${j.numero} : ${Object.entries(j.valeurs).map(([k, v]) => `${k} = ${v}`).join(', ')}`, '', `Verdict : ${LIBELLES_VERDICT[j.verdict]}${j.cause ? ` (${echapper(causeLisible(j.cause))})` : ''}`);
    if (j.preparation?.length) l.push('', titre('Préparation'), '', ...lignesEntrees(j.preparation, 'p'));
    if (!plusieurs || entrees) l.push('', titre('Étapes'));
    l.push('', '| # | Ligne | Étape | Statut | Durée | Détail |', '|---|---|---|---|---|---|');
    for (const e of j.etapes) l.push(`| ${e.numero} | ${e.ligne ?? ''} | ${echapper(e.resume)} | ${STATUT[e.statut]} | ${e.statut === 'non_jouee' ? '' : `${e.duree_ms} ms`} | ${echapper(detailsEtape(e).join(' ; '))} |`);
    if (j.nettoyage?.length) l.push('', titre('Nettoyage'), '', ...lignesEntrees(j.nettoyage, 'n'));
    const gardees = Object.entries(j.gardees ?? {});
    if (gardees.length) l.push('', `Valeurs gardées : ${gardees.map(([k, v]) => `${k} = ${v}`).join(', ')}`);
    if (j.capture_fin) l.push('', `Écran à la fin des étapes : capture \`${j.capture_fin}\``);
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

/**
 * Rapport d'une campagne (D22.INV-1) : chaque test, son scénario et son dossier de résultats, relatifs au
 * dossier de la campagne, son statut, son verdict et sa cause, et le décompte des verdicts.
 */
export function construireCampagne({ debut, fin, profil, navigateur, tests }) {
  const compte = (v) => tests.filter((t) => t.verdict === v).length;
  return {
    format: FORMAT_CAMPAGNE,
    skill: 'scenario-playwright',
    version: VERSION_SKILL,
    debut: debut.toISOString(),
    fin: fin.toISOString(),
    duree_ms: fin - debut,
    profil,
    navigateur,
    tests,
    bilan: { tests: tests.length, conformes: compte('conforme'), non_conformes: compte('non_conforme'), bloques: compte('bloque') },
    verdict: verdictDe(tests.map((t) => t.verdict)),
  };
}

const pluriel = (n, un) => `${n} ${un}${n > 1 ? 's' : ''}`;

/** Rapport de campagne lisible, en Markdown : une ligne par test, avec son verdict et sa cause. */
export function campagneMarkdown(c) {
  const b = c.bilan;
  const l = [`# Campagne : ${pluriel(b.tests, 'test')}, ${pluriel(b.conformes, 'conforme')}, ${b.non_conformes} non conforme${b.non_conformes > 1 ? 's' : ''}, ${pluriel(b.bloques, 'bloqué')}`, ''];
  l.push(`- Exécution : ${c.debut}, ${Math.round(c.duree_ms / 100) / 10} s ; profil ${c.profil ?? 'defaut'} ; ${c.navigateur.canal} ${c.navigateur.version}`, '');
  l.push('| # | Test | Scénario | Verdict | Cause | Rapport |', '|---|---|---|---|---|---|');
  c.tests.forEach((t, k) => l.push(`| ${k + 1} | ${echapper(t.titre)}${t.etiquettes?.length ? ` (${t.etiquettes.map((e) => `@${e}`).join(' ')})` : ''} | \`${echapper(t.scenario)}\` | ${t.verdict === 'conforme' ? 'conforme' : `**${LIBELLES_VERDICT[t.verdict]}**`} | ${echapper(t.cause ? `${t.jeu ? `jeu ${t.jeu}, ` : ''}${causeLisible(t.cause)}` : '')} | \`${t.dossier}/rapport.md\` |`));
  return `${l.join('\n')}\n`;
}

/** Écrit campagne.json et campagne.md dans le dossier de la campagne. */
export function ecrireCampagne(dossier, campagne) {
  writeFileSync(join(dossier, 'campagne.json'), `${JSON.stringify(campagne, null, 2)}\n`);
  writeFileSync(join(dossier, 'campagne.md'), campagneMarkdown(campagne));
}
```
