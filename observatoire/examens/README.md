# Examens indépendants

Ce dossier reçoit les examens qui précèdent une révision (`EVOLUTION.md`, section 10.7) : l'avis d'un examinateur indépendant, un observateur sur un autre modèle que celui qui a préparé le changement, qui n'y a pas pris part et n'écrit que son avis. Le développeur ratifie seul ; l'examen ne décide jamais, mais aucune ratification ne se fait sans lui.

Deux sortes d'examens :

- l'examen d'une proposition de l'observatoire porte le nom de son fichier dans [`observatoire/propositions/`](../propositions/README.md) ; la pull request qui ratifie la proposition l'apporte ; un refus n'en demande pas ;
- l'examen d'une version qui relâche une forme propre du dépôt, une constitution d'exemple avec ses méta-critères, s'appelle `<spécification>-<version>.md`, et le journal de cette version le cite, avec ses preuves et sa migration ; le noyau du socle de l'acceptable, lui, ne se relâche jamais.

Chaque examen est un fichier Markdown dont l'en-tête suit le format `observatoire.examen/1` (module [`examens`](../../specs/observatoire/modules/examens/SKILL.md)) : la date, l'objet, pour une spécification son nom et sa version, l'examinateur, `observateur-externe`, son modèle, déclaré, et son avis, `favorable`, `reserve` ou `defavorable`. Le corps commence par `## Avis`, suivi des points de l'examinateur ; aucune donnée d'une instance n'y entre. Une ratification contre un avis défavorable lui répond, sous `## Réponse à l'examen` dans le corps de la proposition, ou par « Réponse à l'examen » au journal de la version.

L'observatoire n'écrit aucun examen : son outil et le vérificateur du dépôt les contrôlent.
