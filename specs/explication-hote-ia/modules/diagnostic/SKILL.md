---
name: diagnostic
description: Diagnostic d'un comportement de l'hôte en mode pourquoi (méthode : symptôme, hypothèses ordonnées, observation qui confirme ou écarte chacune, cause étiquetée ou observation manquante ; tables pour une consigne de GEMINI.md non suivie, un skill absent ou non activé, un fichier invisible, des confirmations trop ou pas assez fréquentes, un outil MCP ou une commande absente, un oubli, une session disparue de /resume, une question de modèle, une variable vide, un comportement différent en mode non interactif, un sous-agent qui ne voit pas). À lire avant de répondre à un « pourquoi ».
dimensions: [D9]
status: active
---

# Module `diagnostic` (D9)

Phase 7E couverte : Expression.

## 1. Méthode (D9.INV-2)

1. Reformuler le symptôme en une phrase, avec ce que le développeur attendait.
2. Lancer `hote`, puis la commande de l'instantané qui porte sur le symptôme (D7.INV-3).
3. Prendre les hypothèses de la table du symptôme, dans l'ordre : de la plus fréquente et la moins coûteuse à vérifier vers la plus rare.
4. Pour chacune, nommer l'observation qui la confirme ou l'écarte, la faire (script, fichier, ou commande de l'interface demandée au développeur), et rendre le verdict étiqueté.
5. Conclure par la cause retenue, étiquetée, et la correction possible, décrite sans être appliquée (D7.INV-2). Sans observation décisive, le dire, et proposer celle qui manque.

Une hypothèse écartée se garde dans la réponse, en une ligne : elle évite au développeur de la vérifier à nouveau.

## 2. « Il ne suit pas la consigne de mon GEMINI.md »

| Hypothèse | Observation | Repère |
|---|---|---|
| le dossier n'est pas fiable : aucun fichier du projet n'est chargé | `config`, `confiance` ; `contexte`, `charge_au_demarrage` | H8 |
| le fichier est dans un sous-dossier : il ne se charge qu'à la demande, quand un outil touche ce dossier | `contexte`, `a_la_demande` | H3, § 10 du module `modele-hote` |
| le fichier est au-dessus du dépôt, ou au-delà d'un marqueur réglé | `contexte`, `projet.depot` et `marqueurs` | module `contexte`, § 2 |
| le nom du fichier n'est pas celui que l'hôte cherche | `contexte`, `noms_de_fichiers` | module `contexte`, § 2 |
| un import `@chemin` est absent | `contexte`, imports | module `contexte`, § 3 |
| le fichier a été modifié après le démarrage de la session | `/memory list`, puis `/memory reload` | module `provenance`, § 6 |
| la consigne a été chargée, puis résumée par la compression | `[inconnu]` pour l'agent ; `/memory show` la montre chargée | H5 |
| la consigne a été chargée et lue, mais une autre l'emporte (prompt système, skill activé, consigne plus récente) | ce que l'agent voit de son contexte [déclaré] ; l'export du prompt | H3, H4 |

## 3. « Mon skill n'apparaît pas », « il ne s'active pas »

| Hypothèse | Observation | Repère |
|---|---|---|
| dossier mal placé ou mal nommé, en-tête incomplet | `composants`, skills : emplacement, `ecarts` | H11 |
| un homonyme d'un palier plus fort le masque | `composants`, `masque_par` | H11 |
| skill désactivé, ou skills coupés | `composants`, `desactive` ; `config`, `skills.enabled` et `skills.disabled` | H11 |
| dossier non fiable : les skills du workspace sont ignorés | `composants`, `ignore` ; `config`, `confiance` | H8 |
| ajouté après le démarrage | `/skills list all`, puis `/skills reload` | module `provenance`, § 6 |
| présent, mais sa description ne correspond pas à la demande : le modèle ne l'active pas | le prompt exporté, `<available_skills>` ; la description, à reformuler par le développeur | H11 |
| mode non interactif (`-p`, lancement sans terminal, `CI` ou `GITHUB_ACTIONS` à `true`) : l'activation demande une confirmation, refusée sans règle de politique | `hote`, `arguments_de_lancement` (`-p`) ; `config`, variables `CI` et `GITHUB_ACTIONS` ; `composants`, politiques | H17 |
| fichiers du skill refusés à la lecture : exclusion git sans négation dans `.geminiignore` | `composants`, `fichiers_d_exclusion` | module `composants`, § 8 |

## 4. « Il ne voit pas ce fichier »

| Hypothèse | Observation | Repère |
|---|---|---|
| exclu par `.gitignore`, `.geminiignore` ou `.git/info/exclude` | `composants`, `fichiers_d_exclusion`, puis lecture de ces fichiers | module `composants`, § 8 |
| hors des dossiers du workspace | `contexte`, trace de session, `dossiers_workspace` ; `config`, `context.includeDirectories` | H3 |
| filtrage par `.gitignore` ou `.geminiignore` désactivé ou réglé autrement | `config`, `context.fileFiltering.*` | module `configuration`, § 2 |
| l'arborescence du premier tour est tronquée (200 éléments) : le fichier n'y figure pas, mais reste lisible | trace de session ; demander une recherche par `glob` | H3 |

## 5. « Il me demande tout le temps confirmation », « il ne me demande jamais rien »

| Hypothèse | Observation | Repère |
|---|---|---|
| mode d'approbation | `config`, `general.defaultApprovalMode` ; `hote`, `--approval-mode` | H7 |
| dossier non fiable : l'approbation automatique est coupée | `config`, `confiance` | H8 |
| règles de politique, approbations enregistrées | `composants`, politiques et `auto-saved.toml` ; `/policies list` | H7 |
| règle d'administrateur qui l'emporte | `composants`, palier administrateur ; `config`, couche système | H7 |

## 6. « Cet outil MCP n'existe pas pour lui »

| Hypothèse | Observation | Repère |
|---|---|---|
| dossier non fiable : aucun serveur ne se connecte | `composants`, `serveurs_mcp.note` | H8 |
| serveur exclu (`mcp.excluded`, absent de `mcp.allowed`) ou outil filtré (`includeTools`, `excludeTools`) | `composants`, serveurs MCP | H13 |
| règle `deny` sans condition : l'outil n'est pas déclaré | `composants`, politiques ; `/policies list` | H7 |
| serveur déclaré mais en échec | `/mcp list` | module `composants`, § 5 |

## 7. Autres symptômes

| Symptôme | Hypothèses et observations | Repères |
|---|---|---|
| « Ma commande personnalisée n'existe pas » | dossier non fiable (toutes ignorées) ; chemin et espace de noms ; masquée par celle du projet ; ajoutée après le démarrage (`/commands reload`) ; `composants`, commandes | H8, H13 |
| « Il a oublié ce qu'on a dit » | compression (`config`, `model.compressionThreshold`) ; nouvelle session ; rien n'est écrit dans un fichier de contexte | H5, H14 |
| « Ma session a disparu de /resume » | aucun tour n'a abouti : supprimée au lancement suivant (`contexte`, trace de session) ; plus ancienne que `general.sessionRetention.maxAge`, ou au-delà de `maxCount` (`config`) ; lancée depuis une autre racine, donc un autre projet du registre (`contexte`, `memoire_privee_du_projet`) ; supprimée depuis `/resume` | H14 |
| « Quel modèle m'a répondu ? » | jamais d'après l'impression de l'agent (D6.INV-2) : `/stats model` ; modèle demandé par `config` et les surcharges ; routage Auto et repli | H15 |
| « Ma variable d'environnement est vide dans ses commandes » | retrait de variables (`config`, `note_variables`, `security.*EnvironmentVariables`) ; `.env` non chargé (`config`, `fichier_env`, confiance) ; `advanced.excludedEnvVars` | H10 |
| « En mode non interactif, il ne fait pas la même chose » | `ask_user` vaut `deny` ; dossier non fiable fatal ; gabarit du prompt non interactif ; mode entré sans `-p` : lancement sans terminal, ou `CI` ou `GITHUB_ACTIONS` à `true` (`config`, variables) | H4, H17 |
| « Le sous-agent ne sait pas ce qu'on s'est dit » | contexte isolé : il ne voit que sa demande (D7.INV-1) | H12 |
| « Son prompt système n'est pas celui de l'hôte » | `GEMINI_SYSTEM_MD` posée, dans l'environnement ou un `.env` (`config`, surcharges, `fichier_env`) | H4 |

## 8. Forme de la réponse

    Symptôme : le skill « revue-pr » n'apparaît pas dans /skills list.
    Hôte : Gemini CLI 0.67.0 [observé : hote, processus parent]
    - Écartée : dossier non fiable [observé : config, confiance oui, fichier des dossiers de confiance]
    - Retenue : masqué par un homonyme [observé : composants, masque_par ~/.agents/skills/revue-pr/SKILL.md] ;
      l'alias .agents/skills l'emporte sur .gemini/skills dans un même palier [documenté : H11, cli/skills.md]
    Correction possible, non appliquée : renommer l'un des deux skills, ou retirer celui de ~/.agents/skills.

## 9. Contrôle de sortie

- Chaque hypothèse examinée est confirmée ou écartée par une observation nommée ; la cause porte son étiquette (D9.INV-2).
- Aucune correction n'est appliquée sans demande explicite (D7.INV-2).
