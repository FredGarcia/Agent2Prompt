package fr.exemple.commande;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

class CommandeControllerSansVueTest extends BaseControllerTest {

    @Test
    @Tag("ABCDE-3620-S01")
    @DisplayName("ABCDE-3620-S01 : sans paramètre, la réponse reste le CommandeDto d'avant le ticket")
    void reponseInchangeeSansParametre() throws Exception {
        mvc.perform(get("/api/v1/commandes/{id}", CMD_1))
            .andExpect(content().json(reponseDeReference("commande-cmd-1.json"), true));
    }
}
