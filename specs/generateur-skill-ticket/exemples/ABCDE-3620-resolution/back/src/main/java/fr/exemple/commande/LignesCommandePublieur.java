package fr.exemple.commande;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/** Publie chaque changement des lignes après commit, sur /topic/v1/commandes/{id}/lignes, en CloudEvents. */
@Component
class LignesCommandePublieur {

    private final SimpMessagingTemplate stomp;
    private final LigneCommandeRepository lignes;

    LignesCommandePublieur(SimpMessagingTemplate stomp, LigneCommandeRepository lignes) {
        this.stomp = stomp;
        this.lignes = lignes;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void publier(LigneCommandeChangee changement) {
        var dernier = lignes.dernierEnregistrement(changement.commandeId()).orElse(null);
        stomp.convertAndSend("/topic/v1/commandes/" + changement.commandeId() + "/lignes", changement.enCloudEvent(dernier));
    }
}
