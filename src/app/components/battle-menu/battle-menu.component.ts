import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattleFacadeService } from '../../services/battle-facade.service';
import { BATTLE_MENU_OPTIONS } from '../../../game/battle/ui/menu/battle-menu-config';
import { ACTIVE_BATTLE_MENU } from '../../../game/battle/ui/menu/battle-menu-options';

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

  constructor(private readonly battleFacade: BattleFacadeService) {}
}
