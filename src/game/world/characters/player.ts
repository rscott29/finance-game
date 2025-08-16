import { exhaustiveGuard } from '../../../app/utils/guard';
import { CHARACTER_ASSET_KEYS } from '../../shared/asset-keys.enum';
import { DIRECTION, Direction } from '../../shared/direction';
import { Character, CharacterConfig } from './character';

type PlayerConfig = Omit<CharacterConfig, 'assetKey' | 'idleFrameConfig'>;

export class Player extends Character {
  constructor(config: PlayerConfig) {
    super({
      ...config,
      assetKey: CHARACTER_ASSET_KEYS.PLAYER,
      origin: { x: 0, y: 0.2 },
      idleFrameConfig: {
        DOWN: 7,
        UP: 1,
        NONE: 7,
        LEFT: 10,
        RIGHT: 4,
      },
    });
  }
  override moveCharacter(direction: Direction) {
    super.moveCharacter(direction);
    switch (this._direction) {
      case DIRECTION.DOWN:
      case DIRECTION.LEFT:
      case DIRECTION.RIGHT:
      case DIRECTION.UP:
        if (
          !this.phaserGameObject.anims.isPlaying ||
          this.phaserGameObject.anims.currentAnim?.key !== `PLAYER_${this.direction}`
        ) {
          this.phaserGameObject.play(`PLAYER_${this._direction}`);
        }
        break;
      case DIRECTION.NONE:
        break;
      default:
        exhaustiveGuard(this._direction);
    }
  }
}
