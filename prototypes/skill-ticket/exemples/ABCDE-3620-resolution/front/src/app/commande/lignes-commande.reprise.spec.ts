import { TestBed } from '@angular/core/testing';
import { LignesCommandeStore } from './lignes-commande.store';
import { CanalLignesCommandeSimule, configurerCanalSimule } from './testing/canal-simule';

describe('ABCDE-3620-S07 : après une coupure, l\'écran reprend par l\'instantané', () => {
  it('relit l\'instantané et son ETag à la reconnexion', () => {
    configurerCanalSimule({ lignes: 3, dernier: '2026-11-02T10:15:00+01:00', etag: 3 });
    const store = TestBed.inject(LignesCommandeStore);
    store.ouvrir(1);
    const canal = TestBed.inject(CanalLignesCommandeSimule);

    canal.couper();
    canal.instantaneSuivant({ lignes: 4, dernier: '2026-11-02T11:00:00+01:00', etag: 4 });
    canal.retablir();

    expect(store.nombre()).toBe(4);
    expect(store.dernierEnregistrement()).toBe('2026-11-02T11:00:00+01:00');
  });
});
