# language: fr
@role-GESTIONNAIRE
Fonctionnalité: Commande sans ses lignes, résumé de la dernière ligne, lignes en temps réel
  En tant que gestionnaire de commandes, je consulte une commande sans ses lignes, ou avec la
  date-heure de sa dernière ligne enregistrée, et je vois ses lignes se mettre à jour à l'écran.

  Contexte:
    Étant donné que je suis connecté avec le rôle "GESTIONNAIRE"
    Et que la commande "CMD-1" a 3 lignes, dont la dernière enregistrée le "2026-11-02T10:15:00+01:00"

  # CA : ABCDE-3620-CA01 ; source : EX-01 (ticket racine, intention)
  @ABCDE-3620-S01 @ABCDE-3620-CA01 @back
  Scénario: Sans paramètre, la réponse reste celle d'avant le ticket
    Quand je demande la commande "CMD-1" sans paramètre
    Alors la réponse est un CommandeDto identique à celui d'avant le ticket
    Et elle contient les 3 lignes de la commande

  # CA : ABCDE-3620-CA02 ; source : EX-02, EX-03 (ticket racine, critère C2)
  @ABCDE-3620-S02 @ABCDE-3620-CA02 @back
  Scénario: La variante résumée remplace les lignes par la date-heure de la dernière
    Quand je demande la commande "CMD-1" avec la vue "resume"
    Alors la réponse ne contient pas le champ "lignes"
    Et le champ "lignesDernierEnregistrement" vaut "2026-11-02T10:15:00+01:00"

  # CA : ABCDE-3620-CA03 ; source : EX-04 (ticket racine, critère C3)
  @ABCDE-3620-S03 @ABCDE-3620-CA03 @back
  Scénario: Une commande sans ligne donne une date-heure nulle
    Étant donné que la commande "CMD-2" n'a aucune ligne
    Quand je demande la commande "CMD-2" avec la vue "resume"
    Alors le champ "lignesDernierEnregistrement" vaut null

  # CA : ABCDE-3620-CA04 ; source : EX-05 (ticket racine, demande)
  @ABCDE-3620-S04 @ABCDE-3620-CA04 @back
  Scénario: La date-heure se lit en une seule requête
    Quand je demande la commande "CMD-1" avec la vue "resume"
    Alors une seule requête lit la date-heure de la dernière ligne
    Et aucune ligne de la commande n'est chargée

  # CA : ABCDE-3620-CA05 ; source : EX-06 (ticket racine, critère C5)
  @ABCDE-3620-S05 @ABCDE-3620-CA05 @back @front
  Scénario: Une ligne ajoutée apparaît à l'écran et met à jour la date-heure
    Étant donné que l'écran de la commande "CMD-1" est ouvert
    Quand une ligne est ajoutée à la commande "CMD-1" le "2026-11-02T11:00:00+01:00"
    Alors la liste des lignes affiche 4 lignes sans rechargement de la page
    Et la date-heure du dernier enregistrement affichée est "02/11/2026 11:00"

  # CA : ABCDE-3620-CA05 ; source : EX-06 (développeur, question 4)
  @ABCDE-3620-S06 @ABCDE-3620-CA05 @front
  Scénario: Une mise à jour est annoncée sans déplacer le focus
    Étant donné que l'écran de la commande "CMD-1" est ouvert
    Et que le focus est sur le bouton "Retour à la liste"
    Quand une ligne de la commande "CMD-1" est modifiée
    Alors la région d'annonce polie annonce "Lignes de la commande mises à jour"
    Et le focus reste sur le bouton "Retour à la liste"

  # CA : ABCDE-3620-CA05 ; source : EX-06 (développeur, question 4)
  @ABCDE-3620-S07 @ABCDE-3620-CA05 @back @front
  Scénario: Après une coupure, l'écran reprend par l'instantané
    Étant donné que l'écran de la commande "CMD-1" est ouvert
    Et que la connexion temps réel est coupée
    Quand une ligne est ajoutée à la commande "CMD-1" pendant la coupure
    Et que la connexion temps réel est rétablie
    Alors la liste des lignes affiche 4 lignes
    Et la date-heure du dernier enregistrement affichée est celle de la ligne ajoutée
