package fr.exemple.commande;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

class CommandeControllerSansLigneTest extends BaseControllerTest {

    @Test
    @Tag("ABCDE-3620-S03")
    @DisplayName("ABCDE-3620-S03 : avec vue=resume, une commande sans ligne donne lignesDernierEnregistrement à null")
    void dateHeureNullePourUneCommandeSansLigne() throws Exception {
        mvc.perform(get("/api/v1/commandes/{id}", CMD_2).param("vue", "resume"))
            .andExpect(jsonPath("$.lignesDernierEnregistrement").isEmpty());
    }
}
