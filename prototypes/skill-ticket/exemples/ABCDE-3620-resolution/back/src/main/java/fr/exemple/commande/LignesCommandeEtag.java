package fr.exemple.commande;

/** ETag de la liste des lignes : la dernière séquence publiée sur le canal des lignes de la commande. */
record LignesCommandeEtag(long sequence) {

    String valeur() {
        return "\"" + sequence + "\"";
    }
}
