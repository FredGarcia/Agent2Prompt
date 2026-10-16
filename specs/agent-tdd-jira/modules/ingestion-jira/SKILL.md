---
name: ingestion-jira
description: Ingestion d'une demande Jira enregistrée en MHTML depuis Jira Cloud ou Jira Data Center (préparation de l'enregistrement, script Node d'extraction sans dépendance, décodage MIME, quoted-printable et base64, résumé, description, commentaires, pièces, demande.json au schéma version 1, limites, confirmation V1). À lire en premier, avant toute analyse.
dimensions: [D1]
status: active
---

# Module `ingestion-jira` (D1)

L'agent ne lit pas Jira : il lit une page Jira enregistrée par le développeur. Ce module transforme ce fichier en `demande.json`, seule entrée des étapes suivantes (point E1), puis fait confirmer le résultat (V1).

## 1. Chaîne d'ingestion

```mermaid
flowchart LR
  DEV["Développeur<br/>page Jira ouverte,<br/>commentaires dépliés"] -->|"Enregistrer sous :<br/>page web, un seul fichier"| F[".mhtml<br/>lecture seule"]
  F --> S["extraire-jira.mjs<br/>Node, sans dépendance"]
  S --> J["demande.json<br/>schéma version 1"]
  S --> IMG["images/<br/>captures incluses"]
  J --> R["Résumé de l'extraction"]
  IMG --> R
  R --> V1{"V1 : confirmé<br/>par le développeur ?"}
```

## 2. Enregistrer la page (consigne pour le développeur)

1. Ouvrir la demande dans Jira, en vue complète (pas dans un panneau latéral).
2. Afficher **tous** les commentaires : dans Jira Cloud et Data Center, les commentaires anciens sont souvent repliés derrière un lien du type « afficher plus » ou « voir les commentaires plus anciens ». Les déplier, sinon ils ne seront pas dans le fichier.
3. Dans Chrome ou Edge : « Enregistrer sous… », type « Page Web, un seul fichier (*.mhtml) ». Firefox n'enregistre pas en MHTML sans extension.
4. Donner le fichier à l'agent sans le retoucher.

## 3. Script d'extraction

L'agent écrit ce script dans son dossier de travail (par exemple `outils/extraire-jira.mjs`), à l'identique, puis l'exécute. Il n'a besoin que de Node.js 20 ou plus récent.

```bash
node outils/extraire-jira.mjs ECR-77.mhtml --sortie travail/ECR-77/demande.json --images travail/ECR-77/images
```

```js
#!/usr/bin/env node
// Extraction d'une demande Jira enregistrée au format MHTML (« Enregistrer sous… », page complète).
// Usage : node extraire-jira.mjs <demande.mhtml> [--sortie demande.json] [--images dossier]
// Node 20 ou plus récent, modules natifs uniquement. Le fichier source n'est jamais modifié.
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const args = process.argv.slice(2);
if (args.length === 0 || args[0].startsWith('--')) {
  console.error('Usage : node extraire-jira.mjs <demande.mhtml> [--sortie demande.json] [--images dossier]');
  process.exit(1);
}
const option = (nom) => { const i = args.indexOf(nom); return i >= 0 ? args[i + 1] : undefined; };
const source = args[0];
const sortie = option('--sortie') ?? 'demande.json';
const dossierImages = option('--images');

// 1. Lecture binaire : chaque octet devient un caractère, rien n'est perdu avant décodage.
const brut = readFileSync(source);
const texteBrut = brut.toString('latin1');

// 2. En-têtes MIME (avec lignes repliées) et frontière.
function lireEntetes(bloc) {
  const entetes = {};
  const deplie = bloc.replace(/\r?\n[ \t]+/g, ' ');
  for (const ligne of deplie.split(/\r?\n/)) {
    const m = /^([\w-]+):\s*(.*)$/.exec(ligne);
    if (m) entetes[m[1].toLowerCase()] = m[2].trim();
  }
  return entetes;
}
function separerEntetes(texte) {
  const m = /\r?\n\r?\n/.exec(texte);
  if (!m) return [texte, ''];
  return [texte.slice(0, m.index), texte.slice(m.index + m[0].length)];
}
const [blocEntetes] = separerEntetes(texteBrut);
const entetesRacine = lireEntetes(blocEntetes);
const frontiere = /boundary="?([^";]+)"?/i.exec(entetesRacine['content-type'] ?? '')?.[1];
if (!frontiere) {
  console.error("Frontière MIME introuvable : le fichier n'est pas un MHTML multipart.");
  process.exit(2);
}

// 3. Découpage des parties et décodage.
function decoderQuotedPrintable(texte) {
  const sansCoupures = texte.replace(/=\r?\n/g, '');
  const octets = [];
  for (let i = 0; i < sansCoupures.length; i++) {
    const c = sansCoupures[i];
    if (c === '=' && /^[0-9A-Fa-f]{2}$/.test(sansCoupures.slice(i + 1, i + 3))) {
      octets.push(parseInt(sansCoupures.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      octets.push(c.charCodeAt(0) & 0xff);
    }
  }
  return Buffer.from(octets);
}
function decoderCorps(corps, encodage) {
  switch ((encodage ?? '').toLowerCase()) {
    case 'quoted-printable': return decoderQuotedPrintable(corps);
    case 'base64': return Buffer.from(corps.replace(/\s+/g, ''), 'base64');
    default: return Buffer.from(corps, 'latin1');
  }
}
const parties = texteBrut
  .split(`--${frontiere}`)
  .slice(1)
  .filter((p) => !p.startsWith('--'))
  .map((p) => {
    const [bloc, corps] = separerEntetes(p.replace(/^\r?\n/, ''));
    const entetes = lireEntetes(bloc);
    const type = (entetes['content-type'] ?? '').split(';')[0].trim().toLowerCase();
    const charset = /charset="?([^";]+)"?/i.exec(entetes['content-type'] ?? '')?.[1]?.toLowerCase() ?? 'utf-8';
    const octets = decoderCorps(corps.replace(/\r?\n$/, ''), entetes['content-transfer-encoding']);
    return { type, charset, emplacement: entetes['content-location'] ?? '', octets };
  });

const pageHtml = parties.find((p) => p.type === 'text/html');
if (!pageHtml) {
  console.error('Aucune partie text/html dans le fichier.');
  process.exit(3);
}
const html = pageHtml.octets.toString(pageHtml.charset.includes('8859') ? 'latin1' : 'utf8');

// 4. Outils HTML : bloc équilibré à partir d'un attribut, conversion en texte.
function blocDepuis(htmlSource, indexAttribut) {
  const debut = htmlSource.lastIndexOf('<', indexAttribut);
  const nom = /^<([a-zA-Z0-9]+)/.exec(htmlSource.slice(debut))?.[1]?.toLowerCase();
  if (!nom) return '';
  const motif = new RegExp(`<(/?)${nom}\\b[^>]*?(/?)>`, 'gi');
  motif.lastIndex = debut;
  let profondeur = 0;
  let m;
  while ((m = motif.exec(htmlSource))) {
    if (m[2] === '/') continue;                       // balise auto-fermante
    profondeur += m[1] === '/' ? -1 : 1;
    if (profondeur === 0) return htmlSource.slice(debut, m.index + m[0].length);
  }
  return htmlSource.slice(debut);
}
function blocsParAttribut(htmlSource, motifAttribut) {
  const blocs = [];
  const re = new RegExp(motifAttribut, 'g');
  let m;
  let finPrecedente = -1;
  while ((m = re.exec(htmlSource))) {
    if (m.index < finPrecedente) continue;            // bloc imbriqué dans le précédent
    const bloc = blocDepuis(htmlSource, m.index);
    blocs.push({ bloc, correspondance: m });
    finPrecedente = htmlSource.lastIndexOf('<', m.index) + bloc.length;
  }
  return blocs;
}
const ENTITES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', eacute: 'é', egrave: 'è', agrave: 'à', ccedil: 'ç', rsquo: '’', laquo: '«', raquo: '»', hellip: '…' };
function enTexte(fragment) {
  return fragment
    .replace(/\r/g, '')
    .replace(/<(script|style|svg|noscript)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '\n- ')
    .replace(/<\/(p|div|h[1-6]|li|tr|pre|blockquote|table|ul|ol)>/gi, '\n')
    .replace(/<\/t[dh]>/gi, ' | ')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (e, n) => ENTITES[n.toLowerCase()] ?? e)
    .replace(/[ \t ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
const premier = (motif) => { const b = blocsParAttribut(html, motif)[0]; return b ? enTexte(b.bloc) : null; };

// 5. Champs de la demande, selon les marqueurs connus de Jira Cloud et de Jira Data Center.
const titrePage = enTexte(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '');
const cle = /\b([A-Z][A-Z0-9_]+-\d+)\b/.exec(titrePage)?.[1] ?? /\b([A-Z][A-Z0-9_]+-\d+)\b/.exec(html)?.[1] ?? null;
const marqueursCloud = /data-testid="issue\.views\./.test(html);
const marqueursDc = /id="(summary-val|description-val)"/.test(html);
const variante = marqueursCloud ? 'cloud' : marqueursDc ? 'datacenter' : 'inconnue';
const limites = [];

let resume = null;
let description = null;
let commentaires = [];
if (variante === 'cloud') {
  resume = premier('data-testid="issue\\.views\\.issue-base\\.foundation\\.summary\\.heading"');
  description = premier('data-testid="issue\\.views\\.field\\.rich-text\\.description"');
  commentaires = blocsParAttribut(html, 'data-testid="issue-comment-base\\.ui\\.comment\\.ak-comment\\.(\\d+)"')
    .map(({ bloc, correspondance }) => ({
      id: correspondance[1],
      auteur: enTexte(/data-testid="[^"]*author[^"]*"[^>]*>([\s\S]*?)<\//.exec(bloc)?.[1] ?? '') || null,
      date: /<time[^>]*datetime="([^"]+)"/.exec(bloc)?.[1] ?? null,
      texte: enTexte(bloc),
    }));
} else if (variante === 'datacenter') {
  resume = premier('id="summary-val"');
  description = premier('id="description-val"');
  commentaires = blocsParAttribut(html, 'id="comment-(\\d+)"')
    .map(({ bloc, correspondance }) => ({
      id: correspondance[1],
      auteur: enTexte(/class="[^"]*user-hover[^"]*"[^>]*>([\s\S]*?)<\/a>/.exec(bloc)?.[1] ?? '') || null,
      date: /<time[^>]*datetime="([^"]+)"/.exec(bloc)?.[1] ?? null,
      texte: enTexte(/class="[^"]*action-body[^"]*"[^>]*>([\s\S]*?)<\/div>/.exec(bloc)?.[1] ?? bloc),
    }));
} else {
  limites.push("Page non reconnue comme Jira Cloud ni Jira Data Center : seuls le titre et le texte intégral sont fournis.");
}
if (variante !== 'inconnue') {
  if (!resume) limites.push('Résumé non trouvé par les marqueurs connus : le lire dans le texte intégral.');
  if (!description) limites.push('Description non trouvée par les marqueurs connus : la lire dans le texte intégral.');
  if (commentaires.length === 0) limites.push("Aucun commentaire détecté : vérifier dans le texte intégral qu'il n'y en a vraiment aucun.");
}
if (/(Show more|Afficher plus|more comments|autres commentaires)/i.test(enTexte(html))) {
  limites.push("La page contient un lien « afficher plus » : des commentaires peuvent manquer à l'enregistrement. Les déplier avant d'enregistrer la page.");
}

// 6. Pièces (images et autres ressources) incluses dans le MHTML.
const pieces = parties
  .filter((p) => p !== pageHtml && !['text/css', 'text/javascript', 'application/javascript'].includes(p.type))
  .map((p, i) => {
    const piece = { type: p.type, emplacement: p.emplacement, taille: p.octets.length };
    if (dossierImages && p.type.startsWith('image/')) {
      mkdirSync(dossierImages, { recursive: true });
      const extension = p.type.split('/')[1].replace('svg+xml', 'svg').replace('jpeg', 'jpg');
      piece.fichier = join(dossierImages, `piece-${String(i + 1).padStart(3, '0')}.${extension}`);
      writeFileSync(piece.fichier, p.octets);
    }
    return piece;
  });

const resultat = {
  schemaVersion: 1,
  source: {
    fichier: basename(source),
    sha256: createHash('sha256').update(brut).digest('hex'),
    extraitLe: new Date().toISOString(),
  },
  jira: { variante, cle, titrePage, url: pageHtml.emplacement || null },
  resume,
  description,
  commentaires,
  pieces,
  limites,
  texteIntegral: enTexte(html),
};
writeFileSync(sortie, JSON.stringify(resultat, null, 2) + '\n', 'utf8');
console.log(`${sortie} : ${cle ?? 'clé inconnue'} (${variante}), description ${description ? 'trouvée' : 'absente'}, ` +
  `${commentaires.length} commentaire(s), ${pieces.length} pièce(s), ${limites.length} limite(s)`);
```

Ce que fait le script :

| Étape | Détail |
|---|---|
| Lecture | octets bruts, sans altération ; empreinte sha256 enregistrée (D1.INV-1) |
| MIME | en-têtes repliés, frontière du `multipart/related`, découpage des parties |
| Décodage | quoted-printable (coupures douces, octets UTF-8), base64, jeu de caractères de la partie |
| Variante | Jira Cloud (marqueurs `data-testid="issue.views…"`) ou Data Center (`summary-val`, `description-val`, `comment-…`) |
| Champs | clé (titre de la page), résumé, description, commentaires (identifiant, auteur, date, texte) |
| Pièces | images et autres ressources incluses ; images enregistrées si `--images` est fourni |
| Texte intégral | toute la page convertie en texte, scripts et styles retirés : filet de sécurité quand un marqueur a changé |
| Limites | champs non trouvés, page non reconnue, liens « afficher plus » détectés |

Les marqueurs HTML de Jira changent d'une version à l'autre. Le script cherche les marqueurs connus, et fournit toujours le texte intégral. Quand un champ n'est pas trouvé, l'agent le cherche dans le texte intégral et le signale comme limite, au lieu de conclure que le champ est vide.

## 4. Schéma de `demande.json` (version 1, point E1)

```json
{
  "schemaVersion": 1,
  "source": { "fichier": "ECR-77.mhtml", "sha256": "…", "extraitLe": "2026-10-16T19:20:00.000Z" },
  "jira": { "variante": "datacenter", "cle": "ECR-77", "titrePage": "[ECR-77] Export des retours d'expérience en CSV - Jira", "url": "https://jira.exemple/browse/ECR-77" },
  "resume": "Export des retours d'expérience en CSV",
  "description": "Ajouter un bouton d'export CSV sur la liste filtrée.\nEncodage UTF-8 avec BOM, séparateur point-virgule.",
  "commentaires": [
    { "id": "50001", "auteur": "Jeanne Dupont", "date": "2026-10-10T08:00:00+0200", "texte": "Limiter l'export à 10 000 lignes." }
  ],
  "pieces": [ { "type": "image/png", "emplacement": "https://…/capture.png", "taille": 18342, "fichier": "images/piece-002.png" } ],
  "limites": [],
  "texteIntegral": "…"
}
```

Les étapes suivantes ne lisent que ce fichier. Une correction manuelle (champ non trouvé, commentaire manquant fourni par le développeur) s'ajoute dans `demande.json` avec la mention de sa provenance, sans toucher au MHTML.

## 5. Images et pièces jointes

- Les captures d'écran collées dans la description ou les commentaires sont généralement incluses dans le MHTML : l'agent les regarde (s'il en a la capacité) et cite ce qu'il en retient, avec le nom du fichier.
- Les pièces jointes téléchargeables (PDF, tableurs) ne sont **pas** dans le MHTML : seule leur mention l'est. L'agent les liste comme limite et demande au développeur de les fournir si elles portent des exigences.

## 6. Résumé à confirmer (V1, D1.INV-2)

```markdown
## Extraction de ECR-77 (Jira Data Center)

- **Titre** : Export des retours d'expérience en CSV
- **Description** : 2 phrases, 0 tableau, 0 image
- **Commentaires** : 1 (Jeanne Dupont, 2026-10-10)
- **Pièces** : 1 image incluse (images/piece-002.png) ; pièces jointes mentionnées non incluses : aucune
- **Limites** : aucune
- **Empreinte de la source** : sha256 …

Cette extraction est-elle complète et fidèle à la demande ?
```

## 7. Pièges connus

- **Commentaires repliés** : la cause la plus fréquente d'une demande incomplète. Le script signale les liens « afficher plus » qu'il détecte, mais le libellé dépend de la langue et de la version de Jira : la question V1 reste indispensable.
- **Champs personnalisés** (critères d'acceptation, version cible, composant) : ils ne sont pas extraits nommément. L'agent les cherche dans le texte intégral et les ajoute à `demande.json` sous `champsComplementaires`, avec leur libellé.
- **Panneau latéral ou vue de tableau** : une page enregistrée depuis un tableau de bord ne contient qu'une partie de la demande. Demander la vue complète.
- **Fichier `.mht` ou `.mhtml` mal nommé** : le script vérifie la structure MIME, pas l'extension.

## 8. Contrôle de sortie

- La source est intacte, et son empreinte figure dans `demande.json` (D1.INV-1).
- Le résumé a été confirmé (D1.INV-2).
- Les limites sont listées, y compris les pièces non incluses (D1.INV-3).
