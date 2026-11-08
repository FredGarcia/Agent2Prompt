package fr.exemple.commande;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

class LignesCommandePublieurTest extends BaseEvenementsTest {

    @Test
    @Tag("ABCDE-3620-S05")
    @DisplayName("ABCDE-3620-S05 : une ligne ajoutée publie, après commit, un événement avec la date-heure recalculée")
    void ligneAjouteePublieUnEvenement() {
        ajouterLigne(CMD_1, "2026-11-02T11:00:00+01:00");

        var evenement = recevoir("/topic/v1/commandes/" + CMD_1 + "/lignes");
        assertThat(evenement.type()).isEqualTo("ligne-commande.creee.v1");
        assertThat(evenement.donnees().lignesDernierEnregistrement()).isEqualTo("2026-11-02T11:00:00+01:00");
    }
}
