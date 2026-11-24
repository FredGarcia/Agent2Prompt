---
name: confrontation
description: Confrontation des instances entre elles (signaux, motifs génériques écartés, récurrence d'un même motif à la même profondeur dans au moins deux instances, retour d'une proposition retenue qui vise une spécification, dès une instance). À lire pour comprendre ce que l'observatoire tient pour un candidat à proposer.
dimensions: [D2]
status: active
---

# Module `confrontation` (D2)

Aucun système ne se juge seul (`EVOLUTION.md`, section 10.3) : ce qu'une instance relève prend un autre poids quand une autre instance le relève aussi, et ce qu'une instance a décidé pour la spécification doit pouvoir remonter jusqu'au dépôt. La confrontation tire des enveloppes de toutes les instances deux sortes de candidats.

## 1. Signaux

Une enveloppe est un signal quand elle dit un écart, une correction, une proposition ou une observation d'apprentissage : son type n'est pas `decision`, sa nature n'est pas un verdict neutre (`conforme`, `fondee`, `infondee`, `bilan`), son motif n'est pas générique, et elle porte une profondeur. Les motifs génériques sont ceux que les correspondances du socle donnent faute de motif propre : `conforme`, `ecart`, `correction`, `choix`, `proposition`, `ratifie`, `non-ratifie`, `fondee`, `infondee`, `veille`, `bilan`, `ecart-invariant-projet`. Ils se répètent partout, et ne disent rien d'une instance à l'autre.

## 2. Récurrence

Une récurrence est un même motif, à la même profondeur, pour un même système, relevé par des signaux d'au moins deux instances distinctes (D2.INV-1). Les instances se comptent par leur empreinte, non par leurs projets : un projet copié ne fait pas une deuxième instance. Un motif relevé dans une seule instance reste à celle-ci, où son propre apprentissage le traite.

## 3. Retour

Un retour est une proposition d'une instance, de type `proposition` et de cible `specification`, qu'une décision humaine de la même instance a retenue ou amendée (D2.INV-2) : pour le générateur, une proposition du registre d'apprentissage qui vise ses consignes, décidée par son développeur. Il remonte dès une instance : c'est le canal qui manquait au retour de l'instance vers le dépôt. Une proposition refusée par l'instance, ou dont la cible est l'instance, ne remonte pas.

## 4. Candidats

Un candidat est identifié par son système, son motif et sa profondeur : un retour et une récurrence de même clé font un seul candidat, de sorte `retour`. Il porte les versions du système qu'il a vues, le nombre d'instances, le nombre d'enveloppes et leurs références tronquées, les huit premiers caractères de l'instance et le numéro de l'enveloppe : de quoi retrouver les enveloppes dans le magasin, et rien de plus. `confronter` les liste ; `proposer` les écrit.

## 5. Recette

| Invariant | Tests |
|---|---|
| D2.INV-1 | `tests/observatoire.test.mjs` : « D2 : une récurrence compte des instances distinctes : un même motif, à la même profondeur, pour un même système, dans au moins deux instances » ; « D1 : une enveloppe d'un système ou d'une version inconnus du dépôt est écartée de toute confrontation et signalée » ; « Ligne de commande : codes de sortie ; le magasin d'épreuve seul est écrit » |
| D2.INV-2 | `tests/observatoire.test.mjs` : « D2 : un retour remonte dès une instance : une proposition qui vise la spécification, retenue par le développeur de l'instance » ; « D2 : une récurrence compte des instances distinctes : un même motif, à la même profondeur, pour un même système, dans au moins deux instances » |
