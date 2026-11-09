package fr.exemple.commande;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

class CommandeControllerVueResumeTest extends BaseControllerTest {

    @Test
    @Tag("ABCDE-3620-S02")
    @DisplayName("ABCDE-3620-S02 : avec vue=resume, pas de champ lignes, et la date-heure de la dernière en ISO 8601 avec fuseau")
    void varianteResumee() throws Exception {
        mvc.perform(get("/api/v1/commandes/{id}", CMD_1).param("vue", "resume"))
            .andExpect(jsonPath("$.lignes").doesNotExist())
            .andExpect(jsonPath("$.lignesDernierEnregistrement").value("2026-11-02T10:15:00+01:00"));
    }
}
