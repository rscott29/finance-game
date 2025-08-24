import { Component, computed, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IBattleFacade,
  BATTLE_FACADE_TOKEN,
} from '../../features/battle/interfaces/battle.interfaces';
import { BATTLE_MENU_OPTIONS } from '../../../game/battle/ui/menu/battle-menu-config';

@Component({
  selector: 'app-battle-menu',
  standalone: true,
  imports: [CommonModule],
  template: ``,
})
export class BattleMenuComponent {
  isMainMenuVisible = computed(() => !this.battleFacade.isAnimating());

  battleText = computed(() => (this.battleFacade.isPlayerTurn() ? 'What will you do?' : ''));

  options = BATTLE_MENU_OPTIONS;

  constructor(@Inject(BATTLE_FACADE_TOKEN) private readonly battleFacade: IBattleFacade) {}
}
