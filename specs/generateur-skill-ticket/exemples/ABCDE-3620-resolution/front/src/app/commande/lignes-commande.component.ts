import { ChangeDetectionStrategy, Component, OnInit, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LignesCommandeStore } from './lignes-commande.store';

@Component({
  selector: 'app-lignes-commande',
  templateUrl: './lignes-commande.component.html',
  imports: [DatePipe],
  providers: [LignesCommandeStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LignesCommandeComponent implements OnInit {
  readonly commandeId = input.required<number>();
  protected readonly store = inject(LignesCommandeStore);

  ngOnInit(): void {
    this.store.ouvrir(this.commandeId());
  }
}
