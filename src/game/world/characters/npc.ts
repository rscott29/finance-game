import { exhaustMap } from 'rxjs';
import { CHARACTER_ASSET_KEYS } from '../../shared/asset-keys.enum';
import { DIRECTION, Direction } from '../../shared/direction';
import { Character, CharacterConfig } from './character';
import { exhaustiveGuard } from '../../../app/utils/guard';
import { Coordinate } from '../../battle/types/monster-types';
import { GameObjects } from 'phaser';

export const NPC_MOVEMENT_PATTERN = {
  IDLE: 'IDLE',
  CLOCKWISE: 'CLOCKWISE',
} as const;

export type NPCMovementPattern = (typeof NPC_MOVEMENT_PATTERN)[keyof typeof NPC_MOVEMENT_PATTERN];

type NPCConfigProps = {
  frame: number;
  messages: string[];
  npcPath?: NPCPath;
  movementPattern: NPCMovementPattern;
};
type NPCPath = Record<number, Coordinate>;

type NPCConfig = Omit<CharacterConfig, 'assetKey' | 'idleFrameConfig'> & NPCConfigProps;

export class NPC extends Character {
  protected _messages: string[];
  public _isTalkingToPlayer;
  protected npcPath?: NPCPath;
  protected currentPathIndex: number;
  protected movementPattern: NPCMovementPattern;
  protected lastMovementTime: number;
  constructor(config: NPCConfig) {
    super({
      ...config,
      assetKey: CHARACTER_ASSET_KEYS.NPC,
      origin: { x: 0, y: 0 },
      idleFrameConfig: {
        DOWN: config.frame,
        UP: config.frame + 1,
        NONE: config.frame,
        LEFT: config.frame + 2,
        RIGHT: config.frame + 2,
      },
    });
    this._messages = config.messages;
    this.phaserGameObject.setScale(4);
    this._isTalkingToPlayer = false;
    this.npcPath = config.npcPath;
    this.currentPathIndex = 0;
    this.lastMovementTime = Phaser.Math.Between(3500, 5000);
    this.movementPattern = config.movementPattern;
  }

  get messages(): string[] {
    return [...this._messages];
  }

  get isTalkingToPlayer() {
    return this._isTalkingToPlayer;
  }

  set isTalkingToPlayer(val: boolean) {
    this._isTalkingToPlayer = val;
  }

  facePlayer(playerDirection: Direction) {
    switch (playerDirection) {
      case DIRECTION.DOWN:
        this.phaserGameObject.setFrame(this._idleFrameConfig.UP).setFlipX(false);
        break;
      case DIRECTION.LEFT:
        this.phaserGameObject.setFrame(this._idleFrameConfig.RIGHT).setFlipX(false);
        break;
      case DIRECTION.RIGHT:
        this.phaserGameObject.setFrame(this._idleFrameConfig.LEFT).setFlipX(true);
        break;
      case DIRECTION.UP:
        this.phaserGameObject.setFrame(this._idleFrameConfig.DOWN).setFlipX(false);
        break;
      case DIRECTION.NONE:
        break;
      default:
        exhaustiveGuard(playerDirection);
    }
  }
  override update(time: DOMHighResTimeStamp): void {
    if (this.isTalkingToPlayer) return;
    super.update(time);

    if (this.movementPattern === NPC_MOVEMENT_PATTERN.IDLE) return;
    if (!this.npcPath) return;

    if (this.lastMovementTime < time) {
      const pathKeys = Object.keys(this.npcPath)
        .map(Number)
        .sort((a, b) => a - b);

      const target = this.npcPath[this.currentPathIndex];

      const atTarget =
        Math.round(this.phaserGameObject.x) === target.x &&
        Math.round(this.phaserGameObject.y) === target.y;

      if (atTarget) {
        // Move to next target
        this.currentPathIndex = (this.currentPathIndex + 1) % pathKeys.length;
      }

      const nextTarget = this.npcPath[this.currentPathIndex];

      // Decide direction toward current target
      let characterDirection: Direction = DIRECTION.NONE;
      if (nextTarget.x > Math.round(this.phaserGameObject.x)) characterDirection = DIRECTION.RIGHT;
      else if (nextTarget.x < Math.round(this.phaserGameObject.x))
        characterDirection = DIRECTION.LEFT;
      else if (nextTarget.y < Math.round(this.phaserGameObject.y))
        characterDirection = DIRECTION.UP;
      else if (nextTarget.y > Math.round(this.phaserGameObject.y))
        characterDirection = DIRECTION.DOWN;

      // Keep trying to move toward the target if not already moving
      if (!this.isMoving) {
        this.moveCharacter(characterDirection);
        this.lastMovementTime = time + Phaser.Math.Between(2000, 5000);
      }
    }
  }

  override moveCharacter(direction: Direction) {
    super.moveCharacter(direction);
    switch (this._direction) {
      case DIRECTION.DOWN:
      case DIRECTION.RIGHT:
      case DIRECTION.UP:
        if (
          !this.phaserGameObject.anims.isPlaying ||
          this.phaserGameObject.anims.currentAnim?.key !== `NPC_1_${this.direction}`
        ) {
          this.phaserGameObject.play(`NPC_1_${this._direction}`);
          this.phaserGameObject.setFlipX(false);
        }
        break;
      case DIRECTION.LEFT:
        if (
          !this.phaserGameObject.anims.isPlaying ||
          this.phaserGameObject.anims.currentAnim?.key !== `NPC_1_${DIRECTION.RIGHT}`
        ) {
          this.phaserGameObject.play(`NPC_1_${DIRECTION.RIGHT}`);
          this.phaserGameObject.setFlipX(true);
        }
        break;

      case DIRECTION.NONE:
        break;
      default:
        exhaustiveGuard(this._direction);
    }
  }
}
