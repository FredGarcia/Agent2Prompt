package fr.exemple.commande;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

class LigneCommandeRepositoryAgregatTest extends BaseRepositoryTest {

    @Test
    @Tag("ABCDE-3620-S04")
    @DisplayName("ABCDE-3620-S04 : la date-heure se lit en une seule requête, sans charger les lignes")
    void dateHeureLueEnUneSeuleRequete() {
        var dernier = compterRequetes(() -> lignes.dernierEnregistrement(commandeAvecTroisLignes()));

        assertThat(dernier.valeur()).contains(ENREGISTREE_LE_DERNIERE);
        assertThat(dernier.requetes()).isEqualTo(1);
        assertThat(dernier.entitesChargees()).isZero();
    }
}
