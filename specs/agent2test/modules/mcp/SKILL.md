---
name: mcp
description: Moteurs et serveur MCP d'Agent2Test (adaptateurs du port moteur simulation, externe par MCP pour Gemini Code Assist et compatible OpenAI pour un modèle local, autorisation humaine avant tout envoi de contenu du projet à un moteur externe, outils a2t_*, transport HTTP local sans session, à jeton porteur et contrôle d'origine, stdio en repli, outils du rôle relais pour n8n, refus des décisions CP-4, contexte borné et masqué, journalisation de chaque appel, profil souverain sans connexion sortante, settings.json et GEMINI.md fournis). À implémenter au lot 7.
dimensions: [D16]
status: active
---

# Module `mcp` (D16)

Ce module porte les adaptateurs du port moteur défini par le noyau, et le serveur MCP par lequel Gemini Code Assist conduit une campagne depuis l'IDE. Le moteur rédige ; il ne décide jamais.

## 1. Adaptateurs du port moteur (point E5, D16.INV-4)

| Adaptateur | Principe | Usage |
|---|---|---|
| `simulation` | réponses déterministes par fiche, lues dans `test/fixtures/moteur/` ; pannes et sorties non conformes programmables | tests, démonstrations |
| `externe` | Gemini Code Assist, en mode agent, par MCP : la rédaction attend que Gemini soumette sa sortie | défaut |
| `compatible-openai` | serveur local exposant `/v1/chat/completions` et `/v1/embeddings` (Ollama, vLLM), sur `127.0.0.1` par défaut | profil souverain |

- Le choix se fait dans la configuration humaine (`moteur.adaptateur`), sans modification de code. Un adaptateur inconnu est refusé au démarrage (point E5).
- Chaque appel est journalisé avec : fiche et version composée, adaptateur et nom du moteur, empreinte SHA-256 du prompt rendu, identifiants des fragments de mémoire injectés, usage (jetons, durée).

## 2. Autorisation du moteur externe (D16.INV-5)

Le contenu du projet de l'application (extraits de code, carte, US, critères, scénarios) ne part vers un moteur externe que si la configuration humaine porte :

```json
{ "moteur": { "adaptateur": "externe", "autorisationExterne": { "accordee": true, "reference": "<référence de la décision DSI et RSSI>", "par": "développeur" } } }
```

Sans cette autorisation, `a2t_tache_suivante` ne rend aucune tâche de rédaction ; il rend le motif « moteur externe non autorisé ». La sélection se présente alors sans revue du moteur (D6.INV-5), et la préparation attend un moteur autorisé, local ou externe.

## 3. Outils MCP

| Outil | Rôle |
|---|---|
| `a2t_demarrer_campagne` | ouvre une campagne à partir d'une demande et du dossier du plan, ou d'une remise reçue ; refusé au rôle `relais` |
| `a2t_deposer_remise` | réservé au rôle `relais` : dépose une remise au format `agent2test.remise/1`, sans ouvrir de campagne (module `relais`) |
| `a2t_tache_suivante` | rend la prochaine rédaction attendue (rôle, consignes, leçons, schéma de sortie, contexte borné), ou le point de contrôle à présenter à l'opérateur |
| `a2t_soumettre` | soumet une sortie ; rend les écarts de validation, ou l'acceptation |
| `a2t_decider` | relaie la décision explicite de l'opérateur pour CP-0, CP-1, CP-2, CP-3 et CP-5 |
| `a2t_suspendre` | arrêt d'urgence d'une campagne |
| `a2t_etat`, `a2t_journal`, `a2t_rapport`, `a2t_carte` | lecture seule ; au rôle `relais`, `a2t_etat` et `a2t_rapport` seulement, pour les remises et les campagnes qui en sont issues (D22.INV-2) |

- Une décision CP-4 reçue par `a2t_decider` est refusée `CP4_HORS_TABLEAU_DE_BORD` (D16.INV-2). L'arrêt d'urgence reste permis aux rôles humains : il va dans le sens sûr.
- `a2t_soumettre` passe la sortie au validateur du noyau ; en cas d'écart, la réponse liste les écarts, et la boucle reprend dans le budget de 3 renvois.

## 4. Transports (D16.INV-1)

- **HTTP en flux**, par défaut : `http://127.0.0.1:4701/mcp`, protocole JSON-RPC 2.0 de MCP (`initialize`, `tools/list`, `tools/call`), avec la révision du protocole négociée à l'initialisation, au moins celle qui définit le transport HTTP en flux. Écoute sur `127.0.0.1` seulement.
- Chaque requête exige l'en-tête `Authorization: Bearer <jeton>` ; le jeton est lu dans un fichier hors dépôt, en mode 0600. Une requête dont l'en-tête `Origin` est présent et absent de la liste autorisée est refusée, contre le rebond DNS.
- Le jeton est attaché à un utilisateur de la configuration humaine : les décisions relayées par `a2t_decider` portent cet auteur et obéissent aux droits de ses rôles (D17.INV-2). Un jeton au rôle `relais` n'atteint que les outils de ce rôle ; tout autre lui est refusé `DROIT_INSUFFISANT` (module `relais`, section 3).
- Le serveur ne tient pas de session : il ne pose pas d'en-tête `Mcp-Session-Id` et traite chaque requête seule, avec son jeton. Un client qui commence par `initialize` est servi de même ; le relais n8n poste directement ses `tools/call`.
- **stdio**, en repli, pour la parité avec Agent2Dev.
- Le protocole est écrit dans le module, sans dépendance ajoutée.

## 5. Contexte transmis (D16.INV-3)

- Seuls les éléments utiles à la tâche partent : le scénario, ses critères, les instantanés ARIA des écrans concernés, les leçons actives du moteur, les fragments retrouvés par la mémoire.
- Le contexte est borné (24 000 caractères par défaut, configuration humaine) et masqué par le masque de la mémoire (D12.INV-3) ; aucune session, aucun jeton, aucun identifiant n'y figure.

## 6. Configuration fournie

- `configuration/gemini/settings.json` : exemple de clé `mcpServers` pour Gemini Code Assist et Gemini CLI, en HTTP (`httpUrl`, en-tête `Authorization`) et en stdio (`command`).
- `GEMINI.md` : Gemini rédige et soumet ; il ne tranche aucun point de contrôle à la place de l'opérateur ; il ne relaie une décision que si l'opérateur l'a donnée explicitement dans la conversation ; il ne soumet jamais de décision CP-4.

## 7. Profil souverain (D16.INV-6)

Avec `moteur.adaptateur = compatible-openai` sur `127.0.0.1`, une campagne complète n'ouvre aucune connexion sortante autre que vers l'application cible et son fournisseur SSO. Un test l'établit en interceptant `fetch`, `http.request` et `net.connect` et en refusant tout autre hôte.

## 8. Pièges connus

- **Décision « suggérée » par Gemini et relayée** : `GEMINI.md` l'interdit, et la décision porte l'auteur humain qui l'a donnée.
- **Jeton dans l'URL** : jamais ; il passe par l'en-tête.
- **Contexte non borné** : un instantané ARIA complet de vingt écrans dépasse la borne ; on transmet les écrans de la tâche.

## 9. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| MC1 | D16.INV-1 | une requête sans jeton, ou avec un jeton faux, est refusée ; le serveur n'écoute pas sur une autre interface que `127.0.0.1` |
| MC2 | D16.INV-1 | une requête avec un en-tête `Origin` non autorisé est refusée |
| MC3 | D16.INV-2 | `a2t_decider` sur CP-4 est refusé `CP4_HORS_TABLEAU_DE_BORD` ; `a2t_suspendre` est accepté |
| MC4 | D16.INV-3 | le contexte rendu par `a2t_tache_suivante` est sous la borne et ne contient ni cookie, ni jeton, ni adresse électronique |
| MC5 | D16.INV-4 | passer de `simulation` à `compatible-openai` ne change que la configuration ; chaque appel est journalisé avec ses six éléments |
| MC6 | D16.INV-5 | sans autorisation externe, aucune tâche de rédaction n'est rendue, et le motif est « moteur externe non autorisé » |
| MC7 | D16.INV-6 | profil souverain : une campagne simulée complète n'ouvre aucune connexion vers un hôte non autorisé |
| MC8 | point E5 | un adaptateur `inconnu` est refusé au démarrage |
| MC9 | D16.INV-1 | le transport stdio expose les mêmes outils que le transport HTTP |
| MC10 | D16.INV-4 | une sortie non conforme soumise par `a2t_soumettre` reçoit la liste de ses écarts ; au quatrième envoi, l'échec part en CP-2 |
| MC11 | D16.INV-1 | un `tools/call` posté sans `initialize` préalable, avec un jeton valide, est servi, et la réponse ne porte aucun en-tête `Mcp-Session-Id` ; sans jeton, il est refusé |

## 10. Fichiers à produire

- `src/moteurs/simulation.js`, `src/moteurs/externe.js`, `src/moteurs/compatible-openai.js`
- `src/interfaces/mcp/serveur-http.js`, `src/interfaces/mcp/serveur-stdio.js`, `src/interfaces/mcp/outils.js`, `src/interfaces/mcp/protocole.js`
- `configuration/gemini/settings.json`, `GEMINI.md`
- `test/mcp/*.test.js`, `test/fixtures/moteur/`
