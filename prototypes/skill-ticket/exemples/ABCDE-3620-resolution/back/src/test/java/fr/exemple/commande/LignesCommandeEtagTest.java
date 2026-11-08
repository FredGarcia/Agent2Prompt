package fr.exemple.commande;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

class LignesCommandeEtagTest extends BaseControllerTest {

    @Test
    @Tag("ABCDE-3620-S07")
    @DisplayName("ABCDE-3620-S07 : l'instantané des lignes porte l'ETag de la dernière séquence du canal")
    void instantaneAvecEtag() throws Exception {
        publierSequences(CMD_1, 4);

        mvc.perform(get("/api/v1/commandes/{id}/lignes", CMD_1))
            .andExpect(header().string("ETag", "\"4\""));
    }
}
