import { TestBed } from '@angular/core/testing';
import { LignesCommandeComponent } from './lignes-commande.component';
import { CanalLignesCommandeSimule, configurerCanalSimule } from './testing/canal-simule';

describe('ABCDE-3620-S06 : une mise à jour est annoncée sans déplacer le focus', () => {
  it('annonce dans la région polie et laisse le focus en place', () => {
    configurerCanalSimule({ lignes: 3, dernier: '2026-11-02T10:15:00+01:00', etag: 3 });
    const fixture = TestBed.createComponent(LignesCommandeComponent);
    fixture.componentRef.setInput('commandeId', 1);
    fixture.detectChanges();
    const retour = document.createElement('button');
    document.body.appendChild(retour);
    retour.focus();

    TestBed.inject(CanalLignesCommandeSimule).emettre({ sequence: 4, type: 'modifiee', lignesDernierEnregistrement: '2026-11-02T10:15:00+01:00' });
    fixture.detectChanges();

    const region = fixture.nativeElement.querySelector('[aria-live="polite"]');
    expect(region.textContent.trim()).toBe('Lignes de la commande mises à jour');
    expect(document.activeElement).toBe(retour);
  });
});
