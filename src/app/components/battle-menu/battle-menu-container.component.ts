import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattleMenuComponent } from './battle-menu.component';
import { BattleAttacksMenuComponent } from './battle-attacks-menu.component';
import { BattleMenuService } from '../../services/battle-menu.service';
import {
  ACTIVE_BATTLE_MENU,
  ATTACK_MOVE_OPTIONS,
  AttackMoveOptions,
} from '../../../game/battle/ui/menu/battle-menu-options';

@Component({
  selector: 'app-battle-menu-container',
  standalone: true,
  imports: [CommonModule, BattleMenuComponent, BattleAttacksMenuComponent],
  template: `
    <div class="battle-menu-container">
      <app-battle-menu></app-battle-menu>
      <app-battle-attacks-menu
        [isVisible]="isAttackMenuVisible()"
        [attacks]="currentMonsterAttacks()"
        [selectedAttack]="selectedAttackOption()"
      >
      </app-battle-attacks-menu>
    </div>
  `,
})
export class BattleMenuContainerComponent {
  isAttackMenuVisible = computed(
    () => this.battleMenuService.activeBattleMenu$() === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT
  );

  currentMonsterAttacks = computed(() => {
    const monster = this.battleMenuService.activePlayerMonster$();
    return monster?.attacks || [];
  });

  selectedAttackOption = computed(() => this.battleMenuService.selectedAttackMenuOption$());

  constructor(private battleMenuService: BattleMenuService) {}
}
