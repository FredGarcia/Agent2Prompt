---
name: exterieur
description: Observateur extérieur (D11) : l'observateur d'ordre 3 de l'arbre juge sur un autre modèle que celui de la session, quand la génération nomme les deux (--modele-session, --modele-observateur) ; en-tête de son agent, manifestes de l'arbre, lancer -m sur le modèle de la session ; champ.mjs inscrit à chaque observation d'ordre 3 le modèle effectif de l'observateur, lu dans Gemini CLI, et refuse celle qui retomberait sur la session ; rien ne change à l'export. À lire pour générer un arbre à observateur extérieur ou pour lire ses observations d'ordre 3.
dimensions: [D11]
status: active
---

# Module `exterieur` (D11)

L'observateur d'ordre 3 de l'arbre examine les propositions de l'ordre 2, met un motif en veille et fait le bilan de clôture (module `champ`, section 3). Sous-agent de Gemini CLI, il juge dans son propre contexte, mais, sans autre indication, sur le modèle de la session : celui qui a produit le travail et les propositions qu'il juge. Ce module le place sur un autre modèle, quand le développeur le nomme : au troisième ordre, un observateur juge dans un contexte qui n'a pas produit ce qu'il juge, et au moins un observateur est extérieur au système observé (`EVOLUTION.md`, section 10). Un autre modèle ne change pas le niveau : l'ordre 3 reste le plus haut, le développeur au-dessus (D5.INV-3).

## 1. Nommer les modèles (D11.INV-1)

À la génération, deux options facultatives : `--modele-session <modèle>`, le modèle des sessions de l'arbre, et `--modele-observateur <modèle>`, celui de l'observateur d'ordre 3.

| Options | Effet |
|---|---|
| aucune | comme avant : chaque session et chaque agent tournent sur le modèle des réglages du développeur ; l'ordre 3 est intérieur |
| `--modele-session` seule | les sessions lancées par `lancer` tournent sur ce modèle ; l'ordre 3 aussi, intérieur |
| les deux, différentes | l'en-tête de l'observateur d'ordre 3 de la racine nomme son modèle, `model:` ; sa consigne le dit ; l'ordre 3 est extérieur |
| `--modele-observateur` seule, ou deux modèles égaux, ou un nom mal formé | génération refusée, qui dit ce qui manque ; rien n'est écrit |

Un nom de modèle est celui que prennent Gemini CLI et l'en-tête de ses agents : lettres, chiffres, points, tirets, soulignés et barres obliques, comme `gemini-3-flash-preview`. Le manifeste de chaque skill de l'arbre porte les modèles nommés, `ticket.modeles` ; l'observateur d'ordre 2, les sous-agents de rôle et les agents de couche gardent le modèle de la session : seul l'ordre 3 change de modèle.

## 2. Lancer (D11.INV-3)

`installer-arbre.mjs lancer <référence>` lit le manifeste du skill installé : s'il nomme le modèle de la session, Gemini CLI s'ouvre sur lui, `gemini -m <modèle> -i "Active le skill …"` ; sinon, comme avant, sur les réglages du développeur. Un modèle mal formé dans un manifeste installé arrête le lancement : le skill est à réinstaller. Une session ouverte par la commande du nœud, `/ticket:<nœud>`, dans une session déjà lancée, tourne sur le modèle de celle-ci.

## 3. Inscrire et contrôler (D11.INV-2)

Dans un arbre qui nomme les deux modèles, `champ.mjs` inscrit lui-même, à chaque observation d'ordre 3, le modèle effectif de son observateur, champ `modele` ; le déposant ne le donne jamais, et `--modele` n'est pas une option. Le modèle effectif se lit comme Gemini CLI le servirait :

1. l'en-tête de l'agent installé, `.gemini/agents/ticket-<clé>-observateur-3.md`, champ `model:` ;
2. sauf surcharge dans les réglages de l'utilisateur, `~/.gemini/settings.json`, puis dans ceux du projet, `.gemini/settings.json`, à `agents.overrides.<agent>.modelConfig.model` ;
3. `inherit` le ramène au modèle de la session.

Le dépôt est refusé, sans rien écrire, si ce modèle est introuvable, ou s'il retombe sur celui de la session : l'ordre 3 jugerait l'ordre 2 avec le modèle qui l'a produit. La vérification du champ refuse de même une observation d'ordre 3 dont le modèle est celui que l'arbre donne à la session ; un modèle ne se porte qu'à l'ordre 3. Le champ garde son format, `skill-ticket.observation/1` : `modele` y est facultatif, et un champ d'avant 1.5.0 se vérifie comme avant. `etat` dit sur quel modèle juge l'ordre 3 ; la vue le dit à chaque observation d'ordre 3 qui le porte.

## 4. Limites

- Le modèle se déclare : rien ne prouve que Gemini CLI a servi celui qu'il nomme.
- Les réglages système de Gemini CLI ne sont pas lus ; une surcharge qui n'y serait que là échappe au contrôle.
- Un autre modèle du même fournisseur n'est qu'une extériorité partielle. Un observateur distant, par le protocole A2A, sur le modèle d'un autre fournisseur, est réservé (point d'extension E6).
- Rien ne change à l'export : le modèle ne sort pas du projet, et l'ordre 3 s'exporte au nom de l'observateur N3 (socle d'observation, section 6.1). L'indépendance reste lisible dans le champ du projet.

## 5. Recette

| Invariant | Tests |
|---|---|
| D11.INV-1 | `tests/generer.test.mjs` : « D11 : deux modèles nommés : l'observateur d'ordre 3 de la racine porte le sien dans son en-tête, les manifestes de l'arbre les deux, tout autre agent garde la session ; un modèle d'observateur sans session, égal à elle ou mal formé est refusé, sans rien écrire » ; « P2 : chaque transmission est celle attendue, octet pour octet » |
| D11.INV-2 | `tests/champ.test.mjs` : « D11 : dans un arbre à deux modèles, champ.mjs inscrit à chaque observation d'ordre 3 le modèle effectif de son observateur, et refuse celle qui retomberait sur la session ou dont le modèle est introuvable » ; « D11 : le modèle effectif de l'observateur d'ordre 3 se lit comme Gemini CLI le servirait : l'en-tête de son agent installé, sauf surcharge de l'utilisateur, puis du projet ; inherit le ramène à la session » ; « D11 : en ligne de commande, depuis le skill racine installé, le dépôt d'ordre 3 porte le modèle de l'observateur, et l'état le dit ; ramené par les réglages au modèle de la session, il est refusé » ; `tests/observation.test.mjs` : « D11 : le modèle d'une observation d'ordre 3 ne s'exporte pas : deux champs qui ne diffèrent que par lui donnent le même journal, l'ordre 3 au nom de l'observateur N3 » |
| D11.INV-3 | `tests/installation.test.mjs` : « D11 : lancer ouvre la session d'un nœud sur le modèle que nomme son manifeste ; un modèle mal formé est refusé » ; « lancer : Gemini CLI en mode interactif, sur la phrase qui active le skill du nœud, dans le workspace » |
