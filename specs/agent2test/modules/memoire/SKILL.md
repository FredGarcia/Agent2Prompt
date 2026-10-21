---
name: memoire
description: Mémoire sémantique d'Agent2Test (documents et fragments tirés du plan, de la carte et des campagnes passées, plein texte PostgreSQL en configuration french, vecteurs pgvector en option avec un modèle de plongement local, fusion par rang réciproque, filtrage par épinglage, masquage et troncature avant injection, identifiants journalisés). À implémenter au lot 3.
dimensions: [D12]
status: active
---

# Module `memoire` (D12)

`memoire` sert les agents cognitifs : ce qu'ils savent du projet tient dans des fragments qu'elle retrouve, filtre et masque. Elle ne décide de rien.

## 1. Natures de mémoire

| Nature | Contenu | Propriétaire |
|---|---|---|
| épisodique | campagnes passées, verdicts, décisions, échappements | `journal`, résumés indexés ici |
| sémantique | carte, US, critères, scénarios, exigences, glossaire | `memoire`, indexés depuis `plan` et `scanner` |
| procédurale | fiches, leçons, règles | `referentiel` |
| réflexive | évolution des règles, preuves, effets | `referentiel`, grand livre |

## 2. Actions

| Action | Rôle |
|---|---|
| `indexer(documents)` | découpe en fragments d'au plus 800 caractères, calcule le `tsvector` (`french`) et, si un modèle est configuré, le vecteur ; chaque fragment porte la version de son document |
| `rechercher(requete, filtres, k)` | rend au plus `k` fragments, filtrés, masqués, avec leur identifiant |

## 3. Recherche hybride (D12.INV-1)

- Plein texte : `websearch_to_tsquery('french', requete)` classé par `ts_rank_cd`.
- Vecteurs, en option : quand la configuration désigne un modèle de plongement local (adaptateur `compatible-openai`, point d'accès `embeddings`), similarité cosinus pgvector.
- Fusion par rang réciproque : score = Σ 1 / (60 + rang) sur les deux classements.
- Sans modèle, le plein texte seul fait fonctionner le système ; aucun appel externe n'est fait pour les vecteurs.
- `k` et le seuil de similarité sont des règles modifiables (module `referentiel`, section 4).

## 4. Injection (D12.INV-2, D12.INV-3)

- `filtres.epinglage` est obligatoire pour une recherche destinée à une consigne : seuls les fragments des versions de l'instantané de la campagne sont rendus.
- Avant de rendre un fragment, la mémoire masque : jetons et mots de passe reconnus par motif, adresses électroniques, et les noms de personnes déclarés (configuration humaine, et auteurs cités dans les provenances du plan). Le masque remplace par `[masqué]`.
- Un fragment de plus de 1 200 caractères est tronqué, avec la marque `[tronqué]`.
- L'agent cognitif joint les identifiants des fragments à son appel au moteur ; le journal les garde avec l'empreinte du prompt (D15.INV-3).

## 5. Pièges connus

- **Fragment d'une version postérieure** : interdit dans une campagne en cours ; le filtre d'épinglage n'est jamais facultatif pour une consigne.
- **Nom propre laissé dans une provenance** : « commentaire 50001, Jeanne Dupont » devient « commentaire 50001, [masqué] ».
- **Base vectorielle à part** : non ; tout tient dans PostgreSQL.

## 6. Tests (scénarios)

| Scénario | Vérifie | Cas |
|---|---|---|
| ME1 | D12.INV-1 | sans modèle de plongement, une recherche rend des fragments classés par plein texte, sans appel réseau |
| ME2 | D12.INV-1 | avec un modèle simulé, plein texte et vecteurs sont fusionnés ; l'ordre suit le rang réciproque |
| ME3 | D12.INV-2 | une recherche pour une campagne épinglée sur `P-14` ne rend aucun fragment de `P-15` |
| ME4 | D12.INV-2 | les identifiants des fragments injectés figurent dans la ligne de journal de l'appel au moteur |
| ME5 | D12.INV-3 | une adresse électronique, un jeton et un nom déclaré sont masqués ; un fragment de 2 000 caractères porte `[tronqué]` |
| ME6 | D12.INV-2 | une recherche destinée à une consigne sans filtre d'épinglage est refusée |

## 7. Fichiers à produire

- `src/agents/memoire/agent.js`, `src/agents/memoire/fragments.js`, `src/agents/memoire/recherche.js`, `src/agents/memoire/masque.js`
- `migrations/` : schéma `memoire` (documents, fragments, `tsvector`, colonne `vector` facultative)
- `test/memoire/*.test.js`
