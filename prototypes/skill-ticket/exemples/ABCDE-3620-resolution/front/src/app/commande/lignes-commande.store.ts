import { Injectable, computed, inject, signal } from '@angular/core';
import { CanalLignesCommande, EvenementLigne, InstantaneLignes } from './canal-lignes-commande';
import { LigneCommandeDto } from '../api/model/ligne-commande-dto';

/** État de l'écran : abonnement au canal, puis instantané, puis événements dans l'ordre des séquences. */
@Injectable()
export class LignesCommandeStore {
  private readonly canal = inject(CanalLignesCommande);
  readonly lignes = signal<LigneCommandeDto[]>([]);
  readonly dernierEnregistrement = signal<string | null>(null);
  readonly annonce = signal('');
  readonly etat = signal<'chargement' | 'à jour' | 'reconnexion' | 'erreur'>('chargement');
  readonly nombre = computed(() => this.lignes().length);
  private sequence = 0;

  ouvrir(commandeId: number): void {
    this.canal.abonner(commandeId, (e) => this.appliquer(e), () => this.reprendre(commandeId));
    this.reprendre(commandeId);
  }

  private reprendre(commandeId: number): void {
    this.etat.set('reconnexion');
    this.canal.instantane(commandeId).subscribe((i: InstantaneLignes) => {
      this.lignes.set(i.lignes);
      this.dernierEnregistrement.set(i.lignesDernierEnregistrement);
      this.sequence = i.etag;
      this.etat.set('à jour');
    });
  }

  private appliquer(e: EvenementLigne): void {
    if (e.sequence <= this.sequence) return;
    this.sequence = e.sequence;
    this.lignes.update((l) => e.appliquer(l));
    this.dernierEnregistrement.set(e.lignesDernierEnregistrement);
    this.annonce.set('Lignes de la commande mises à jour');
  }
}
