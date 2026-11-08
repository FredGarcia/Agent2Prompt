// Reconstruction de l'historique Git du projet d'exemple résolu par l'arbre ABCDE-3620 (prototype
// « skill de ticket », lot 4). Mêmes fichiers, mêmes messages, même auteur et mêmes dates : les commits
// obtenus sont ceux du kit dev, empreinte comprise, sous Linux comme sous Windows.

import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
export const HISTORIQUE = JSON.parse(readFileSync(join(ICI, 'fixtures', 'historique-ABCDE-3620.json'), 'utf8'));
export const PROJET = join(ICI, '..', ...HISTORIQUE.projet.split('/'));

/** Message d'un commit de l'historique : le titre, puis, pour un sous-ticket, la ligne qui le cite. */
export const messageDe = (c, cle = HISTORIQUE.cle) => (c.sous_ticket && c.sous_ticket !== cle ? `${c.titre}\n\nSous-ticket : ${c.sous_ticket}\n` : `${c.titre}\n`);

/**
 * Construit le dépôt dans `cible` (dossier vide) à partir des fichiers de `source`, commit par commit ;
 * renvoie l'empreinte de chaque commit, dans l'ordre de l'historique. La configuration Git de la machine
 * est écartée : `configuration` désigne un fichier vide, hors du dépôt.
 */
export function construireDepot(cible, { source = PROJET, historique = HISTORIQUE, configuration = `${cible}.gitconfig` } = {}) {
  mkdirSync(cible, { recursive: true });
  writeFileSync(configuration, '');
  const { nom, courriel } = historique.auteur;
  const env = {
    ...process.env,
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: configuration,
    GIT_AUTHOR_NAME: nom,
    GIT_AUTHOR_EMAIL: courriel,
    GIT_COMMITTER_NAME: nom,
    GIT_COMMITTER_EMAIL: courriel,
  };
  const git = (args, { date, entree } = {}) => execFileSync('git', ['-C', cible, '-c', 'core.autocrlf=false', '-c', 'commit.gpgsign=false', ...args], {
    encoding: 'utf8',
    input: entree,
    env: date ? { ...env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } : env,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  git(['init', '-q']);
  git(['symbolic-ref', 'HEAD', `refs/heads/${historique.base}`]);
  const empreintes = [];
  for (const c of historique.commits) {
    if (!c.branche && empreintes.length > 0 && git(['symbolic-ref', '--short', 'HEAD']).trim() !== historique.branche) git(['checkout', '-q', '-b', historique.branche]);
    for (const f of c.fichiers) {
      mkdirSync(dirname(join(cible, ...f.split('/'))), { recursive: true });
      copyFileSync(join(source, ...f.split('/')), join(cible, ...f.split('/')));
    }
    git(['add', '--', ...c.fichiers]);
    git(['commit', '-q', '-F', '-'], { date: c.date, entree: messageDe(c, historique.cle) });
    empreintes.push(git(['rev-parse', 'HEAD']).trim());
  }
  return empreintes;
}
