import { TestBed } from '@angular/core/testing';
import { LignesCommandeStore } from './lignes-commande.store';
import { CanalLignesCommandeSimule, configurerCanalSimule } from './testing/canal-simule';

describe('ABCDE-3620-S05 : une ligne ajoutée apparaît à l\'écran et met à jour la date-heure', () => {
  it('ajoute la ligne et met à jour la date-heure sans recharger', () => {
    configurerCanalSimule({ lignes: 3, dernier: '2026-11-02T10:15:00+01:00', etag: 3 });
    const store = TestBed.inject(LignesCommandeStore);
    store.ouvrir(1);

    TestBed.inject(CanalLignesCommandeSimule).emettre({ sequence: 4, type: 'creee', lignesDernierEnregistrement: '2026-11-02T11:00:00+01:00' });

    expect(store.nombre()).toBe(4);
    expect(store.dernierEnregistrement()).toBe('2026-11-02T11:00:00+01:00');
  });
});
