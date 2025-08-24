import { Provider } from '@angular/core';
import {
  BATTLE_FACADE_TOKEN,
  ATTACK_MANAGER_TOKEN,
  BATTLE_STATE_TOKEN,
  BATTLE_STATS_TOKEN,
  IBattleFacade,
  IAttackManager,
  IBattleState,
  IBattleStats,
} from '../interfaces/battle.interfaces';
import { BattleFacadeService } from '../services/battle-facade.service';
import { AttackManagerService } from '../services/attack-manager.service';
import { BattleStateService } from '../services/battle-state.service';
import { BattleStatsService } from '../services/battle-stats.service';

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
