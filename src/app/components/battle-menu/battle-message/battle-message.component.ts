import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { BattleFacadeService } from '../../../services/battle-facade.service';

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

  constructor(private readonly battleFacade: BattleFacadeService) {}

  onMessageClick() {
    this.battleFacade.nextBattleState();
  }
}
