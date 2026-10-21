---
name: mcp
description: Moteurs et serveur MCP d'Agent2Dev (adaptateurs du port moteur simulation, externe par MCP pour Gemini Code Assist et compatible OpenAI pour un modèle local, autorisation humaine avant tout envoi de contenu du projet hors du poste, outils a2d_*, transport HTTP local à jeton porteur et contrôle d'origine, relais stdio, refus des décisions CP-4, décisions relayées au nom de l'humain du jeton, contexte limité au pas, borné et masqué, journalisation de chaque appel, profil souverain sans connexion sortante, settings.json et GEMINI.md fournis). À implémenter au lot 8.
dimensions: [D18]
status: active
---

# Module `mcp` (D18)

Ce module porte les adaptateurs du port moteur défini par le noyau, et le serveur MCP par lequel Gemini Code Assist rédige pour Agent2Dev depuis l'IDE. Le moteur rédige ; il ne décide, n'écrit et n'exécute rien. Le même moteur sert Agent2Test, avec les mêmes adaptateurs.

## 1. Adaptateurs du port moteur (point E1, D18.INV-5)

| Adaptateur | Principe | Usage |
|---|---|---|
| `simulation` | réponses déterministes par fiche, lues dans `test/fixtures/moteur/<fiche>/` ; pannes et sorties non conformes programmables | tests, démonstrations |
| `externe` | Gemini Code Assist, en mode agent, par MCP : Agent2Dev expose la rédaction attendue comme une tâche ; Gemini la prend par `a2d_tache_suivante` et rend sa sortie par `a2d_soumettre` | défaut |
| `compatible-openai` | serveur exposant `/v1/chat/completions` (Ollama, vLLM), sur `127.0.0.1` par défaut | profil souverain |

- Le choix se fait dans la configuration humaine (`moteur.adaptateur`), sans modification de code. Un adaptateur inconnu est refusé au démarrage (point E1).
- La configuration déclare aussi le plafond de contexte du moteur (`moteur.plafondContexte`), borne haute de la règle `contexte.plafond` (module `referentiel`, section 4).
- Chaque appel est journalisé (module `journal`, section 3) : fiche et version composée, adaptateur et nom du moteur, empreinte du prompt rendu, usage (jetons, durée), résultat de la validation.
- Avec l'adaptateur `externe`, une rédaction attend que Gemini la soumette : l'attente ne consomme pas le budget `duree.demande`, et le tableau de bord affiche « rédaction attendue de Gemini ».

## 2. Autorisation du moteur externe (D18.INV-3)

Le contenu du projet (extraits de code, demande, US, critères, scénarios, sorties de commandes) ne part vers un moteur hors du poste que si la configuration humaine porte :

```json
{ "moteur": { "adaptateur": "externe", "nom": "gemini", "plafondContexte": 120000,
  "autorisationExterne": { "accordee": true, "reference": "<référence de la décision DSI et RSSI>", "par": "fred" } } }
```

- Sans cette autorisation, `a2d_tache_suivante` ne rend aucune tâche de rédaction ; il rend le motif « moteur externe non autorisé ». Les étapes sans moteur continuent (V0, V1) ; les autres attendent un moteur autorisé, local ou externe.
- Un adaptateur `compatible-openai` dont l'adresse n'est pas sur `127.0.0.1` est un moteur externe : il exige la même autorisation.
- Cette autorisation est distincte de celle d'écrire le code (module `depot`, section 1) : l'une n'entraîne pas l'autre.

## 3. Outils MCP

| Outil | Rôle |
|---|---|
| `a2d_soumettre_demande` | soumet une demande : chemin du fichier MHTML, arbre de la demande, mode |
| `a2d_tache_suivante` | rend la prochaine rédaction attendue (rôle, sections citées du skill, leçons ratifiées, schéma de sortie, entrées du pas), ou le point à présenter au développeur |
| `a2d_soumettre` | soumet une sortie ; rend les écarts de validation, ou l'acceptation |
| `a2d_decider` | relaie la décision explicite du développeur sur un point V0 à V5 ou une attente |
| `a2d_journal_de_tests` | donne le chemin du journal de tests d'Agent2Test, ou déclare la demande sans binôme (module `binome`, section 2) |
| `a2d_suspendre`, `a2d_reprendre` | arrêt d'urgence ; reprise, décision humaine relayée |
| `a2d_etat`, `a2d_journal`, `a2d_livrable`, `a2d_patchs` | lecture seule ; `a2d_patchs` liste les patchs remis, leur état et la commande `git am -3` |

- Une décision CP-4 reçue par `a2d_decider` est refusée `CP4_HORS_TABLEAU_DE_BORD` (D18.INV-2). L'arrêt d'urgence reste permis : il va dans le sens sûr.
- `a2d_soumettre` passe la sortie au validateur du noyau ; en cas d'écart, la réponse liste les écarts, et la boucle reprend dans le budget `budget.tentativesSortie`. Au-delà, le pas s'arrête et l'attente « budget épuisé » s'ouvre (module `orchestrateur`, section 3).

## 4. Transports (D18.INV-1, D18.INV-2)

- **HTTP en flux**, par défaut : `http://127.0.0.1:4601/mcp`, protocole JSON-RPC 2.0 de MCP (`initialize`, `tools/list`, `tools/call`), avec la révision du protocole négociée à l'initialisation, au moins celle qui définit le transport HTTP en flux. Écoute sur `127.0.0.1` seulement ; le port est celui de l'instance (module `exploitation`, section 3).
- Chaque requête exige l'en-tête `Authorization: Bearer <jeton>` ; le jeton est lu dans un fichier hors dépôt, en mode 0600. Une requête dont l'en-tête `Origin` est présent et absent de la liste autorisée est refusée, contre le rebond DNS ; la liste porte l'origine du tableau de bord de l'instance, et celles que la configuration humaine ajoute (`origines`).
- Le jeton est attaché à un utilisateur de la configuration humaine : les décisions relayées par `a2d_decider` portent cet auteur et le canal `mcp`, et obéissent aux droits de ses rôles (module `tableau-de-bord`, section 2).
- **stdio**, en repli : `node bin/mcp-stdio.js` relaie chaque message vers le serveur HTTP de l'instance, avec le jeton lu dans l'environnement. Le relais n'ouvre aucune demande et ne garde aucun état.
- Le protocole est écrit dans le module, sans dépendance ajoutée.

## 5. Contexte transmis (D18.INV-4)

- Ne part que ce que le pas utilise : les sections citées du skill, les leçons actives de la fiche pour ce moteur, la demande extraite ou ses extraits, le contenu courant des fichiers visés, les décisions et commentaires du développeur, les écarts d'un essai précédent.
- Le contexte est borné par `contexte.plafond` et jamais tronqué : au-delà, le pas s'arrête (D3.INV-5).
- Il passe par le masque du noyau : aucune valeur de secret, aucun jeton, aucun en-tête `Authorization`, aucun contenu d'un fichier exclu par le profil.

## 6. Configuration fournie

- `configuration/gemini/settings.json` : le serveur `agent2dev` dans la clé `mcpServers`, en HTTP (`httpUrl`, en-tête `Authorization` tiré d'une variable d'environnement) et en stdio (`command`) ; et la liste `tools.exclude`, qui retire à l'agent de l'IDE ses outils d'écriture et de commande (`write_file`, `replace`, `run_shell_command`), quand la version de l'IDE la prend en compte.
- `GEMINI.md` : Gemini prend les tâches et soumet ses sorties par les outils `a2d_*` ; il ne modifie aucun fichier du projet ni de la copie de travail et ne lance aucune commande, ce que font le `depot` et l'`executant` ; il ne tranche aucun point à la place du développeur, ne relaie une décision que si le développeur l'a donnée explicitement dans la conversation, et ne soumet jamais de décision CP-4.

Si l'agent de l'IDE écrit quand même dans l'arbre de travail, le `depot` le détecte comme écriture étrangère (D5.INV-3).

## 7. Profil souverain (D18.INV-6)

Avec `moteur.adaptateur = compatible-openai` sur `127.0.0.1`, une demande complète n'ouvre, depuis le processus d'Agent2Dev, aucune connexion sortante autre que vers le moteur local. Un test l'établit en interceptant `fetch`, `http.request` et `net.connect`, et en refusant tout autre hôte. Les commandes du profil gardent l'accès que le développeur leur a configuré, vers ses registres Maven et npm : elles ne transmettent pas le code.

## 8. Pièges connus

- **Décision « suggérée » par Gemini et relayée** : `GEMINI.md` l'interdit, et la décision porte l'auteur humain du jeton.
- **Jeton dans l'URL** : jamais ; il passe par l'en-tête.
- **Gemini qui corrige le fichier lui-même** : il n'a pas à le faire ; sa sortie passe par `a2d_soumettre`, et le `depot` l'applique après validation.
- **Modèle local exposé sur le réseau** : une adresse hors de `127.0.0.1` fait du moteur un moteur externe.

## 9. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| MC1 | D18.INV-1 | une requête sans jeton, ou avec un jeton faux, est refusée ; le serveur n'écoute pas sur une autre interface que `127.0.0.1` |
| MC2 | D18.INV-1 | une requête avec un en-tête `Origin` non autorisé est refusée |
| MC3 | D18.INV-2 | `a2d_decider` sur CP-4 est refusé `CP4_HORS_TABLEAU_DE_BORD` ; `a2d_suspendre` est accepté |
| MC4 | D18.INV-2 | une décision V4 relayée porte l'auteur du jeton et le canal `mcp` ; un jeton d'utilisateur sans le rôle développeur est refusé `DROIT_INSUFFISANT` |
| MC5 | D18.INV-3 | sans autorisation externe, aucune tâche de rédaction n'est rendue, et le motif est « moteur externe non autorisé » ; V1 se présente quand même |
| MC6 | D18.INV-3 | un `compatible-openai` sur une adresse hors de `127.0.0.1`, sans autorisation externe, est refusé au démarrage |
| MC7 | D18.INV-4 | le contexte rendu par `a2d_tache_suivante` est sous le plafond et ne contient ni valeur de `.env`, ni jeton, ni en-tête `Authorization` |
| MC8 | D18.INV-5 | passer de `simulation` à `compatible-openai` ne change que la configuration ; chaque appel est journalisé avec ses éléments |
| MC9 | point E1 | un adaptateur `inconnu` est refusé au démarrage |
| MC10 | D18.INV-5 | une sortie non conforme soumise par `a2d_soumettre` reçoit la liste de ses écarts ; au-delà du budget, l'attente « budget épuisé » s'ouvre |
| MC11 | D18.INV-6 | profil souverain : une demande simulée complète n'ouvre, depuis Agent2Dev, aucune connexion vers un autre hôte que le moteur local |
| MC12 | D18.INV-1 | le relais stdio expose les mêmes outils que le transport HTTP, et n'ouvre aucune demande lui-même |

## 10. Fichiers à produire

- `src/moteurs/simulation.js`, `src/moteurs/externe.js`, `src/moteurs/compatible-openai.js`
- `src/interfaces/mcp/serveur-http.js`, `src/interfaces/mcp/outils.js`, `src/interfaces/mcp/protocole.js`, `bin/mcp-stdio.js`
- `configuration/gemini/settings.json`, `GEMINI.md`
- `test/mcp/*.test.js`, `test/fixtures/moteur/`
