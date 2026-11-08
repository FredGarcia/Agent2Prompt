package fr.exemple.commande;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/commandes")
class CommandeController {

    private final CommandeService service;

    CommandeController(CommandeService service) {
        this.service = service;
    }

    /** Sans paramètre vue : CommandeDto, inchangée. Avec vue=resume : CommandeResumeDto, à la même URI. */
    @GetMapping("/{id}")
    Object lire(@PathVariable Long id, @RequestParam(name = "vue", required = false) Vue vue) {
        return vue == Vue.RESUME ? service.resume(id) : service.lire(id);
    }
}
