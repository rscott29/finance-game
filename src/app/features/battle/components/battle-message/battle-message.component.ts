import { CommonModule } from '@angular/common';
import { Component, computed, Inject } from '@angular/core';
import { IBattleFacade, BATTLE_FACADE_TOKEN } from '../../interfaces/battle.interfaces';

@Component({
  selector: 'app-battle-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="showMessage()"
      class="battle-message"
      (click)="onMessageClick()"
      (keydown.space)="onMessageClick()"
      tabindex="0"
    >
      {{ message() }}
    </div>
  `,
  styles: [
    `
      .battle-message {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        min-height: 80px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px;
        font-size: 18px;
        cursor: pointer;
        user-select: none;
      }

      .battle-message:focus {
        outline: none;
      }
    `,
  ],
})
export class BattleMessageComponent {
  showMessage = computed(() => this.battleFacade.isAnimating());
  message = computed(() => ''); // TODO: Add message signal to facade

  constructor(@Inject(BATTLE_FACADE_TOKEN) private readonly battleFacade: IBattleFacade) {}

  onMessageClick() {
    this.battleFacade.nextBattleState();
  }
}
