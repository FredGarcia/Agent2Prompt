package fr.exemple.commande;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

class LigneCommandeRepositorySansLigneTest extends BaseRepositoryTest {

    @Test
    @Tag("ABCDE-3620-S03")
    @DisplayName("ABCDE-3620-S03 : pour une commande sans ligne, l'agrégat est vide")
    void agregatVidePourUneCommandeSansLigne() {
        assertThat(lignes.dernierEnregistrement(commandeSansLigne())).isEmpty();
    }
}
