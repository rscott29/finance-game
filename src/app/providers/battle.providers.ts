import { Provider } from '@angular/core';
import {
  BATTLE_FACADE_TOKEN,
  ATTACK_MANAGER_TOKEN,
  BATTLE_STATE_TOKEN,
  BATTLE_STATS_TOKEN,
} from '../features/battle/interfaces/battle.interfaces';
import { BattleFacadeService } from '../features/battle/services/battle-facade.service';
import { AttackManagerService } from '../features/battle/services/attack-manager.service';
import { BattleStateService } from '../features/battle/services/battle-state.service';
import { BattleStatsService } from '../features/battle/services/battle-stats.service';

export const BATTLE_PROVIDERS: Provider[] = [
  {
    provide: BATTLE_FACADE_TOKEN,
    useClass: BattleFacadeService,
  },
  {
    provide: ATTACK_MANAGER_TOKEN,
    useClass: AttackManagerService,
  },
  {
    provide: BATTLE_STATE_TOKEN,
    useClass: BattleStateService,
  },
  {
    provide: BATTLE_STATS_TOKEN,
    useClass: BattleStatsService,
  },
];
