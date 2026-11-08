package fr.exemple.commande;

import java.time.OffsetDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Lignes d'une commande. La date-heure de la dernière se lit par agrégat, sans charger les lignes. */
public interface LigneCommandeRepository extends JpaRepository<LigneCommande, Long> {

    @Query("select max(l.enregistreeLe) from LigneCommande l where l.commande.id = :commandeId")
    Optional<OffsetDateTime> dernierEnregistrement(@Param("commandeId") Long commandeId);
}
