-- Données de démonstration de ABCDE-3620 : CMD-1 avec 3 lignes, CMD-2 sans ligne. Données fictives.
insert into commande (id, reference, statut) values (1, 'CMD-1', 'EN_COURS'), (2, 'CMD-2', 'EN_COURS');
insert into ligne_commande (id, commande_id, libelle, quantite, enregistree_le) values
  (1, 1, 'Vanne DN50', 2, timestamp with time zone '2026-11-02 09:40:00+01'),
  (2, 1, 'Joint torique', 10, timestamp with time zone '2026-11-02 10:02:00+01'),
  (3, 1, 'Manomètre', 1, timestamp with time zone '2026-11-02 10:15:00+01');
