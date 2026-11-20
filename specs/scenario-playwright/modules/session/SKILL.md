---
name: session
description: Session et navigateur du poste (Chrome par défaut, Edge ou Chromium de Playwright par SCENARIO_PLAYWRIGHT_CANAL, lancé par playwright-core sans téléchargement ; compatibilité avec le Chromium de playwright-core et avertissement au-delà ; profil dédié réutilisé, un par application et un pour Jira, aucun identifiant vu ni saisi ; étape à la main, message, état attendu jusqua, délai, refus sans fenêtre ; fenêtre de 1 280 × 900, ralenti ; garde des origines posée sur le contexte), source de scripts/session.mjs. À lire pour choisir le navigateur, comprendre la session ou une étape à la main.
dimensions: [D6]
status: active
---

# Module `session` (D6)

Phases 7E couvertes : Espace et Environnement.

## 1. Navigateur du poste

Le navigateur est celui du poste, lancé par `playwright-core` sans en télécharger aucun : Chrome par défaut, Edge avec `SCENARIO_PLAYWRIGHT_CANAL=msedge`, ou le Chromium de Playwright avec `chromium`, après `npx playwright-core install chromium` (module `execution`, § 2). Le scénario se joue dans une fenêtre visible de 1 280 × 900 pixels ; `--ralenti <ms>` ralentit chaque geste pour une démonstration, `--sans-tete` joue sans fenêtre un scénario qui n'a pas d'étape à la main.

## 2. Compatibilité (D6.INV-1)

Chaque version de `playwright-core` porte un Chromium de référence, et suit le Chrome stable de sa publication. Le skill épingle `playwright-core` 1.65.1, dont le Chromium est le 159 : à sa publication, le 20 novembre 2026, le Chrome stable est le 158, et le 159 lui succède. Le rapport note le canal et la version du navigateur, et l'écart avec le Chromium de référence, lu dans le paquet installé :

| Numéro majeur du navigateur | Avertissement |
|---|---|
| celui du Chromium de référence, ou une ou deux versions avant | aucun |
| plus de deux versions avant | navigateur ancien : le mettre à jour |
| plus récent que le Chromium de référence | en cas d'échec inattendu, une nouvelle version du skill monte `playwright-core` |

L'avertissement s'affiche en début d'exécution et figure dans le rapport ; il n'arrête rien.

## 3. Profil dédié (D6.INV-2)

Le navigateur s'ouvre sur un profil dédié, réutilisé d'une exécution à l'autre : `.profils/<profil>/` dans le dossier du skill, ou dans `SCENARIO_PLAYWRIGHT_PROFILS`. Le profil se nomme dans le texte (`Profil :`) et le scénario (`profil`), un par application de préférence ; à défaut, `defaut`. Une session ouverte une fois, dont les cookies persistent, sert aux exécutions suivantes sans nouvelle connexion. L'import de Jira par l'adresse a son propre profil, `jira` par défaut (module `jira`, § 2) : la session de Jira ne se mêle à celle d'aucune application.

Le skill ne demande, ne lit, ne stocke ni ne saisit aucun identifiant, mot de passe ou jeton : une connexion se fait à la main, dans la fenêtre, lors d'une étape `main`. Le profil contient des cookies de session : il ne se copie, ne se partage ni ne se versionne (D1.INV-2). Un profil ne s'ouvre que dans une fenêtre à la fois.

## 4. Étape à la main (D6.INV-3)

Une ligne du texte marquée « (à la main) » donne une étape `main`. Le moteur affiche son message et ce qu'il attend, met la fenêtre au premier plan, puis interroge l'état décrit par `jusqua` :

```text
À VOUS : je me connecte — la suite reprend dès que l'adresse /accueil est atteinte (300 s au plus).
```

| `jusqua` | État attendu |
|---|---|
| `{ url = "/accueil" }` | la page a cette adresse (règles du module `actions`, § 3) |
| `{ cible = { role = "heading", nom = "Espace connecté" } }` | la cible est visible |
| `{ cible = { … }, etat = "masque" }` | la cible n'est plus visible |

La suite reprend seule, dès l'état atteint ; au-delà du délai de l'étape, 300 s par défaut et 900 s au plus, l'étape échoue. Un scénario qui a une étape à la main est refusé sans fenêtre, avant d'ouvrir le navigateur.

## 5. Garde des origines

`garderOrigines(contexte, origines)` pose sur le contexte du navigateur la garde du module `garde`, § 1 : une route pour toute requête, une route pour tout WebSocket, et le journal des origines bloquées et des navigations interrompues, que lisent le moteur et le rapport.

## 6. Contrôle de sortie

- Réglages par défaut, variable vide, canal et délai invalides refusés (D1.INV-3, module `recette`, R11).
- Une session ouverte dans un profil est retrouvée à l'exécution suivante ; un autre profil ne la voit pas (D6.INV-2).
- Une étape à la main reprend à l'état atteint, échoue à son délai, et est refusée sans fenêtre (D6.INV-3).
- La version du navigateur, le Chromium de référence et l'avertissement figurent au rapport (D6.INV-1).

## 7. Source `scripts/session.mjs`

<!-- fichier : scripts/session.mjs -->
```javascript
// scenario-playwright 1.1.1 : réglages, navigateur du poste, profil dédié et garde des origines.
//
// Le navigateur est celui du poste, Chrome par défaut, piloté par playwright-core sans en télécharger
// aucun (D1.INV-1, D6.INV-1). La session vit dans un profil dédié ; le skill ne voit aucun identifiant
// (D6.INV-2). Aucune requête ne part vers une origine que le scénario ne déclare pas (D7.INV-1).
import { mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { chromium } from 'playwright-core';
import { RE_PROFIL } from './texte.mjs';

export const DOSSIER_SKILL = dirname(dirname(fileURLToPath(import.meta.url)));
export const CANAUX = ['chrome', 'msedge', 'chromium'];
export const PROFIL_DEFAUT = 'defaut';
export const FENETRE = { width: 1280, height: 900 };
const require = createRequire(import.meta.url);

/**
 * Réglages lus dans l'environnement (D1.INV-3) : une variable vide vaut absente, une valeur invalide est
 * refusée. Rend { reglages, erreurs }.
 */
export function lireReglages(env = process.env) {
  const val = (k) => (env[k] === undefined || env[k] === '' ? undefined : env[k]);
  const erreurs = [];
  const canal = val('SCENARIO_PLAYWRIGHT_CANAL') ?? 'chrome';
  if (!CANAUX.includes(canal)) erreurs.push(`SCENARIO_PLAYWRIGHT_CANAL vaut ${CANAUX.join(', ')} (« ${canal} » refusé)`);
  const profils = val('SCENARIO_PLAYWRIGHT_PROFILS') ?? '.profils';
  const brut = val('SCENARIO_PLAYWRIGHT_DELAI');
  const delai = brut === undefined ? undefined : Number(brut);
  if (brut !== undefined && !(Number.isInteger(delai) && delai >= 1 && delai <= 30)) erreurs.push(`SCENARIO_PLAYWRIGHT_DELAI est un nombre entier de secondes, de 1 à 30 (« ${brut} » refusé)`);
  return { reglages: { canal, profils: isAbsolute(profils) ? profils : join(DOSSIER_SKILL, profils), delai }, erreurs };
}

/** Dossier du profil nommé, dans le dossier des profils (D6.INV-2). */
export function dossierProfil(reglages, nom = PROFIL_DEFAUT) {
  if (!RE_PROFIL.test(nom)) throw new Error(`profil invalide : ${nom}`);
  return join(reglages.profils, nom);
}

/** Version de playwright-core et numéro majeur du Chromium qu'il porte, lus dans son paquet. */
export function reference() {
  const paquet = dirname(require.resolve('playwright-core/package.json'));
  const version = JSON.parse(readFileSync(join(paquet, 'package.json'), 'utf8')).version;
  const navigateurs = JSON.parse(readFileSync(join(paquet, 'browsers.json'), 'utf8')).browsers;
  const chromiumRef = navigateurs.find((b) => b.name === 'chromium');
  return { playwrightCore: version, chromium: chromiumRef.browserVersion, majeur: Number(chromiumRef.browserVersion.split('.')[0]) };
}

/**
 * Compatibilité d'un navigateur avec playwright-core (D6.INV-1) : avertissement quand son numéro majeur
 * dépasse celui du Chromium de playwright-core, ou reste plus de deux versions en arrière.
 */
export function compatibilite(version, ref) {
  const majeur = Number(String(version).split('.')[0]);
  if (!Number.isInteger(majeur)) return { ecart: null, avertissement: `version du navigateur illisible : ${version}` };
  const ecart = ref.majeur - majeur;
  if (ecart < 0) return { ecart, avertissement: `navigateur ${majeur} plus récent que le Chromium ${ref.majeur} de playwright-core ${ref.playwrightCore} : en cas d'échec inattendu, une nouvelle version du skill monte playwright-core` };
  if (ecart > 2) return { ecart, avertissement: `navigateur ${majeur} ancien, ${ecart} versions avant le Chromium ${ref.majeur} de playwright-core ${ref.playwrightCore} : le mettre à jour` };
  return { ecart, avertissement: null };
}

/** Ouvre le navigateur du poste sur le profil dédié : fenêtre visible, sauf `sansTete`. */
export async function ouvrirNavigateur({ canal, profil, sansTete = false, ralenti = 0 }) {
  mkdirSync(profil, { recursive: true });
  const options = { headless: sansTete, viewport: FENETRE, serviceWorkers: 'block', acceptDownloads: true, slowMo: ralenti || undefined, args: [`--window-size=${FENETRE.width},${FENETRE.height + 120}`] };
  if (canal !== 'chromium') options.channel = canal;
  const contexte = await chromium.launchPersistentContext(resolve(profil), options);
  return contexte;
}

const HOTES_LOCAUX = new Set(['127.0.0.1', 'localhost', '[::1]', '::1']);

/** Vrai si l'origine est sur le poste : 127.0.0.1, localhost ou [::1] (D7.INV-2). */
export function estLocale(origine) {
  try {
    return HOTES_LOCAUX.has(new URL(origine).hostname);
  } catch {
    return false;
  }
}

/** Origine http(s) correspondant à une adresse, WebSocket compris (ws vers http, wss vers https). */
export function origineHttp(adresse) {
  try {
    const u = new URL(adresse);
    const schema = { 'ws:': 'http:', 'wss:': 'https:', 'http:': 'http:', 'https:': 'https:' }[u.protocol];
    return schema ? `${schema}//${u.host}` : null;
  } catch {
    return null;
  }
}

/**
 * Garde des origines (D7.INV-1) : toute requête, WebSocket compris, vers une origine non déclarée est
 * interrompue avant chargement et comptée. Les adresses data:, blob: et about: restent dans la page.
 * Rend le journal { bloquees: Map(origine → nombre), navigations: [{ url, quand }] }.
 */
export async function garderOrigines(contexte, origines) {
  const permises = new Set(origines);
  const journal = { bloquees: new Map(), navigations: [] };
  const noter = (adresse, navigation, page) => {
    const o = origineHttp(adresse) ?? adresse.split(':')[0];
    journal.bloquees.set(o, (journal.bloquees.get(o) ?? 0) + 1);
    if (navigation) journal.navigations.push({ url: adresse, page, quand: Date.now() });
  };
  await contexte.route('**/*', (route) => {
    const requete = route.request();
    const adresse = requete.url();
    const o = origineHttp(adresse);
    if (o === null || permises.has(o)) return route.continue();
    let page = null;
    try {
      const cadre = requete.frame();
      if (requete.isNavigationRequest() && cadre === cadre.page().mainFrame()) page = cadre.page();
    } catch {
      // requête sans cadre (travailleur) : comptée, sans navigation
    }
    noter(adresse, page !== null, page);
    return route.abort('blockedbyclient');
  });
  await contexte.routeWebSocket(/.*/, (ws) => {
    const o = origineHttp(ws.url());
    if (o !== null && permises.has(o)) return ws.connectToServer();
    noter(ws.url(), false, null);
    return ws.close({ code: 1008, reason: 'origine non déclarée par le scénario' });
  });
  return journal;
}
```
