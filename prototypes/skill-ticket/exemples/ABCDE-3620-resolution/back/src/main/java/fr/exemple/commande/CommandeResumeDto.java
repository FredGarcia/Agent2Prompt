package fr.exemple.commande;

import java.time.OffsetDateTime;

/** Variante résumée de CommandeDto : sans le champ lignes, avec la date-heure de la dernière ligne, ou null. */
public record CommandeResumeDto(Long id, String reference, String statut, OffsetDateTime lignesDernierEnregistrement) {
}
