---
name: designer
description: Désignation d'une cible à la souris (designer.mjs ouvre la page dans le navigateur du poste sur le profil dédié, chaque clic du développeur rend la cible de l'élément au format du scénario par la meilleure stratégie que propose Playwright avec pickLocator, sans actionner la page ; conversion de la notation de Playwright en cible, formes non convertibles ; fin à la fermeture de la fenêtre ou au nombre maximal), source de scripts/designer.mjs. À lire pour écrire une cible qu'on ne sait pas nommer.
dimensions: [D9]
status: active
---

# Module `designer` (D9)

Phase 7E couverte : Engendrent.

## 1. Usage

```bash
node <skill>/scripts/designer.mjs http://127.0.0.1:4200/clients --profil demo
```

La page s'ouvre dans la fenêtre du navigateur du poste, sur le profil donné (`defaut` sinon) : une page protégée s'affiche avec la session du profil. Le développeur survole les éléments, que Playwright surligne, et clique celui qu'il veut ; la cible s'affiche aussitôt :

```text
cible = { role = "link", nom = "Nouveau client" }
cible = { role = "button", dans = { role = "row", nom = "Martin Lyon Supprimer" } }
```

Il recommence pour un autre élément, et ferme la fenêtre pour terminer ; `--max` borne le nombre de cibles, 10 par défaut, 50 au plus.

## 2. Aucune action sur la page (D9.INV-1)

La désignation passe par `page.pickLocator()` de Playwright : pendant la désignation, le clic du développeur sélectionne l'élément et n'atteint pas la page. Un lien désigné ne s'ouvre pas, un bouton désigné ne déclenche rien. Le skill ne fait aucun geste dans la page. Pour atteindre un écran plus loin, le développeur y navigue lui-même entre deux désignations.

## 3. Conversion

Playwright rend l'élément dans la notation de ses localisateurs, avec la meilleure stratégie qu'il trouve. Le skill la convertit en cible (module `cibles`) :

| Notation de Playwright | Cible |
|---|---|
| `getByRole('button', { name: 'Enregistrer' })` | `{ role = "button", nom = "Enregistrer" }` |
| `getByLabel('Nom')`, `getByText(…)`, `getByPlaceholder(…)`, `getByAltText(…)`, `getByTitle(…)` | `libelle`, `texte`, `placeholder`, `alt`, `titre` |
| `getByTestId('valider')` | `{ testid = "valider" }` |
| `locator('#principal')` | `{ css = "#principal" }`, fragile |
| un localisateur suivi d'un autre | le second `dans` le premier |
| `.nth(1)`, `.first()` | `rang = 2`, `rang = 1`, fragile |
| `{ exact: true }` | `exact = true` |
| nom en expression régulière sans métacaractère | son texte |

Une forme que le scénario n'exprime pas, filtre, dernier élément, expression régulière, plus de trois niveaux, est signalée non convertible, avec la notation de Playwright, et s'écrit à la main :

```text
# non convertible : getByRole('row').filter({ hasText: 'Martin' }) (à écrire à la main)
```

## 4. Contrôle de sortie

- Deux clics simulés sur l'application de démonstration rendent deux cibles, un lien par son rôle et son nom, un bouton d'une ligne avec `dans` ; la page n'a pas changé d'adresse et rien n'a été supprimé (module `recette`, R13).
- Chaque notation de Playwright du § 3 se convertit, et chaque forme non convertible est signalée (R4).

## 5. Source `scripts/designer.mjs`

<!-- fichier : scripts/designer.mjs -->
```javascript
#!/usr/bin/env node
// scenario-playwright 1.1.1 : désigner une cible à la souris, pour l'écrire dans un scénario.
//
// Usage : node <dossier du skill>/scripts/designer.mjs <adresse> [--profil nom] [--max n]
// Ouvre la page dans la fenêtre du navigateur du poste, sur le profil dédié : chaque clic du
// développeur sur un élément rend sa cible au format du scénario, par la meilleure stratégie que
// propose Playwright, ou la signale non convertible. Le skill n'agit pas sur la page (D9.INV-1) :
// le clic de désignation ne la déclenche pas. Fermer la fenêtre termine ; --max borne le nombre de
// cibles (10 par défaut). Code 0, ou 2 si l'adresse ou le navigateur sont refusés.
import { pathToFileURL } from 'node:url';
import { cibleDepuisLocator, cibleToml } from './cibles.mjs';
import { dossierProfil, lireReglages, ouvrirNavigateur } from './session.mjs';
import { origineDe, RE_PROFIL } from './texte.mjs';

const USAGE = 'Usage : node scripts/designer.mjs <adresse> [--profil nom] [--max n]';

/**
 * Désignation sur une page ouverte : jusqu'à `max` clics, chacun rendu à `surCible` sous la forme
 * { locator: texte de Playwright, cible: cible du skill ou null }. S'arrête à la fermeture de la page.
 */
export async function designer(page, { max = 10, surCible = () => {} } = {}) {
  const rendues = [];
  while (rendues.length < max && !page.isClosed()) {
    let locator;
    try {
      locator = await page.pickLocator();
    } catch {
      break;
    }
    const texte = String(locator);
    const r = { locator: texte, cible: cibleDepuisLocator(texte) };
    rendues.push(r);
    surCible(r);
  }
  return rendues;
}

export async function main(args, env = process.env) {
  let adresse = null;
  let profil = 'defaut';
  let max = 10;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--profil') profil = args[++i];
    else if (a === '--max') max = Number(args[++i]);
    else if (a.startsWith('-')) { console.error(`ERREUR option inconnue : ${a}\n${USAGE}`); return 2; }
    else adresse = a;
  }
  if (!adresse || origineDe(adresse) === null) { console.error(`ERREUR adresse http ou https attendue\n${USAGE}`); return 2; }
  if (!RE_PROFIL.test(profil ?? '')) { console.error('ERREUR profil invalide (minuscules, chiffres, - et _)'); return 2; }
  if (!Number.isInteger(max) || max < 1 || max > 50) { console.error('ERREUR --max attend un nombre de 1 à 50'); return 2; }
  const { reglages, erreurs } = lireReglages(env);
  if (erreurs.length) { for (const e of erreurs) console.error(`ERREUR ${e}`); return 2; }
  let contexte;
  try {
    contexte = await ouvrirNavigateur({ canal: reglages.canal, profil: dossierProfil(reglages, profil) });
  } catch (e) {
    console.error(`ERREUR navigateur ${reglages.canal} impossible à lancer : ${String(e.message).split('\n')[0]}`);
    return 2;
  }
  try {
    const page = contexte.pages()[0] ?? await contexte.newPage();
    await page.goto(adresse, { waitUntil: 'load' });
    console.log(`Cliquez sur un élément de la fenêtre pour obtenir sa cible ; fermez la fenêtre pour terminer (${max} au plus).`);
    await designer(page, {
      max,
      surCible: ({ locator, cible }) => console.log(cible ? `cible = ${cibleToml(cible)}` : `# non convertible : ${locator} (à écrire à la main)`),
    });
  } finally {
    await contexte.close().catch(() => {});
  }
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (e) => { console.error(`ERREUR interne : ${e.stack ?? e}`); process.exitCode = 2; });
}
```
