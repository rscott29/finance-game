import { Provider } from '@angular/core';
import {
  WORLD_FACADE_TOKEN,
  NPC_SERVICE_TOKEN,
  PLAYER_SERVICE_TOKEN,
} from '../features/world/interfaces/world.interfaces';
import { WorldFacadeService } from '../features/world/services/world-facade.service';
import { NPCService } from '../services/npc.service';
import { PlayerService } from '../services/player.service';

export const WORLD_PROVIDERS: Provider[] = [
  {
    provide: WORLD_FACADE_TOKEN,
    useClass: WorldFacadeService,
  },
  {
    provide: NPC_SERVICE_TOKEN,
    useClass: NPCService,
  },
  {
    provide: PLAYER_SERVICE_TOKEN,
    useClass: PlayerService,
  },
];
