import { DomElementSchemaRegistry } from '@angular/compiler';
import { getTargetPositionFromGameObjectPositionAndDirection } from '../../../app/utils/grid-utils';
import { Coordinate } from '../../battle/types/monster-types';
import { DIRECTION, Direction } from '../../shared/direction';
import { exhaustiveGuard } from '../../../app/utils/guard';
import { Player } from './player';
import { RouterUpgradeInitializer } from '@angular/router/upgrade';

export type CharacterIdleFrameConfig = {
  LEFT: number;
  RIGHT: number;
  UP: number;
  DOWN: number;
  NONE: number;
};

export type CharacterConfig = {
  scene: Phaser.Scene;
  assetKey: string;
  origin?: Coordinate;
  position: Coordinate;
  direction: Direction;
  spriteGridMovementFinishedCallback?: () => void;
  idleFrameConfig: CharacterIdleFrameConfig;
  collisionLayer?: Phaser.Tilemaps.TilemapLayer;
  otherCharactersToCheckForCollisionsWith?: Character[];
};

export class Character {
  protected readonly scene: Phaser.Scene;
  protected phaserGameObject: Phaser.GameObjects.Sprite;
  protected _direction: Direction;
  protected _isMoving: boolean;
  protected _targetPosition: Coordinate;
  protected _previousTargetPosition: Coordinate;
  protected spriteGridMovementFinsihedCallback?: () => void;
  protected _idleFrameConfig: CharacterIdleFrameConfig;
  protected _origin: Coordinate;
  protected collisionLayer: Phaser.Tilemaps.TilemapLayer | undefined;
  protected otherCharactersToCheckForCollisionsWith?: Character[];

  constructor(config: CharacterConfig) {
    this.scene = config.scene;
    this._direction = config.direction;
    this._isMoving = false;
    this._targetPosition = { ...config.position };
    this._previousTargetPosition = { ...config.position };
    this._idleFrameConfig = config.idleFrameConfig;
    this._origin = config.origin ? { ...config.origin } : { x: 0, y: 0 };
    this.collisionLayer = config.collisionLayer;
    this.otherCharactersToCheckForCollisionsWith =
      config.otherCharactersToCheckForCollisionsWith ?? [];
    this.phaserGameObject = this.scene.add
      .sprite(config.position.x, config.position.y, config.assetKey, this.getIdleFrame())
      .setOrigin(this._origin.x, this._origin.y);
    this.spriteGridMovementFinsihedCallback = config.spriteGridMovementFinishedCallback;
  }

  get isMoving() {
    return this._isMoving;
  }

  get direction() {
    return this._direction;
  }

  get sprite(): Phaser.GameObjects.Sprite {
    return this.phaserGameObject;
  }

  moveCharacter(direction: Direction) {
    if (this._isMoving) {
      return;
    }
    this._moveSprite(direction);
  }

  addCharacterToCheckForCollisionsWith(character: Character | Player | undefined): void {
    if (character) {
      this.otherCharactersToCheckForCollisionsWith?.push(character);
    }
  }

  getIdleFrame(): string | number | undefined {
    return this._idleFrameConfig[this._direction];
  }

  update(time: DOMHighResTimeStamp): void {
    if (this.isMoving) {
      return;
    }
    const idleFrame = this.phaserGameObject.anims.currentAnim?.frames[1].frame.name;
    this.phaserGameObject.anims.stop();
    if (!idleFrame) {
      return;
    }
    switch (this._direction) {
      case DIRECTION.DOWN:
      case DIRECTION.LEFT:
      case DIRECTION.RIGHT:
      case DIRECTION.UP:
        this.phaserGameObject.setFrame(idleFrame);

        break;
      case DIRECTION.NONE:
        break;
      default:
        exhaustiveGuard(this._direction);
    }
  }

  _moveSprite(direction: Direction) {
    this._direction = direction;
    if (this._isBlockingTile()) {
      return;
    }
    this._isMoving = true;
    this.handleSpriteMovement();
  }

  private _isBlockingTile() {
    if (this._direction === DIRECTION.NONE) {
      return;
    }
    const targetPosition = { ...this._targetPosition };
    const updatedPosition = getTargetPositionFromGameObjectPositionAndDirection(
      targetPosition,
      this._direction
    );

    return (
      this.doesPositionCollideWithCollisionLayer(updatedPosition) ||
      this.doesPositionCollideWithOtherCharacter(updatedPosition)
    );
  }

  private handleSpriteMovement() {
    if (this._direction === DIRECTION.NONE) {
      return;
    }
    const updatedPosition = getTargetPositionFromGameObjectPositionAndDirection(
      this._targetPosition,
      this._direction
    );
    this._previousTargetPosition = { ...this._targetPosition };
    this._targetPosition.x = updatedPosition.x;
    this._targetPosition.y = updatedPosition.y;

    this.scene.add.tween({
      delay: 0,
      duration: 600,
      y: {
        from: this.phaserGameObject.y,
        start: this.phaserGameObject.y,
        to: this._targetPosition.y,
      },
      x: {
        from: this.phaserGameObject.x,
        start: this.phaserGameObject.x,
        to: this._targetPosition.x,
      },
      targets: this.phaserGameObject,
      onComplete: () => {
        this._isMoving = false;
        this._previousTargetPosition = { ...this._targetPosition };
        if (this.spriteGridMovementFinsihedCallback) {
          this.spriteGridMovementFinsihedCallback();
        }
      },
    });
  }

  private doesPositionCollideWithCollisionLayer(updatedPosition: Coordinate): boolean {
    if (!this.collisionLayer) {
      return false;
    }
    const { x, y } = updatedPosition;
    const tile = this.collisionLayer.getTileAtWorldXY(x, y, true);
    return tile.index !== -1;
  }

  doesPositionCollideWithOtherCharacter(position: Coordinate): boolean {
    const { x, y } = position;
    if (this.otherCharactersToCheckForCollisionsWith?.length === 0) {
      return false;
    }

    const collidesWithACharacter = this.otherCharactersToCheckForCollisionsWith?.some(character => {
      return (
        (character._targetPosition.x === x && character._targetPosition.y === y) ||
        (character._previousTargetPosition.x === x && character._previousTargetPosition.y === y)
      );
    });

    return collidesWithACharacter ?? false;
  }
}
