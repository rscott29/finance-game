import { TILE_SIZE } from '../../config';
import { Direction, DIRECTION } from '../../game/shared/direction';

type GlobalState = {
  player: {
    position: {
      x: number;
      y: number;
    };
    direction: Direction;
  };
};

const initialState: GlobalState = {
  player: {
    position: {
      x: 1 * TILE_SIZE,
      y: 21 * TILE_SIZE,
    },
    direction: DIRECTION.DOWN,
  },
};

export const DATA_MANAGER_STORE_KEYS = {
  PLAYER_DIRECTION: 'PLAYER_DIRECTION',
  PLAYER_POSITION: 'PLAYER_POSITION',
} as const;

class DataManager extends Phaser.Events.EventEmitter {
  protected readonly _store: Phaser.Data.DataManager;
  constructor() {
    super();
    this._store = new Phaser.Data.DataManager(this);
    this.updateDataManager(initialState);
  }

  get store() {
    return this._store;
  }

  private updateDataManager(data: GlobalState): void {
    this.store.set({
      [DATA_MANAGER_STORE_KEYS.PLAYER_POSITION]: data.player.position,
      [DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION]: data.player.direction,
    });
  }
}

export const dataManager = new DataManager();
