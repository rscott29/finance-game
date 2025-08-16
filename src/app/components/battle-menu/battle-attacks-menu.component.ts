import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttackMoveOptions } from '../../../game/battle/ui/menu/battle-menu-options';

@Component({
  selector: 'app-battle-attacks-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="attacks-menu" *ngIf="isVisible">
      <div class="attacks-container">
        <div class="attacks-grid">
          <button
            *ngFor="let attack of attacks; let i = index"
            [class.selected]="selectedAttack === getAttackOption(i)"
            [disabled]="!attack"
          >
            {{ attack?.name || '-' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .attacks-menu {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 20px;
      }

      .attacks-container {
        background-color: #ede4f3;
        border: 8px solid #905ac2;
        padding: 20px;
      }

      .attacks-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }

      button {
        padding: 10px 20px;
        font-size: 18px;
        background: none;
        border: none;
        cursor: pointer;
      }

      button.selected {
        color: #e4434a;
      }

      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})
export class BattleAttacksMenuComponent {
  @Input() isVisible = false;
  @Input() attacks: Array<{ name: string }> = [];
  @Input() selectedAttack: AttackMoveOptions = 'MOVE_1';

  getAttackOption(index: number): AttackMoveOptions {
    return `MOVE_${index + 1}` as AttackMoveOptions;
  }
}
