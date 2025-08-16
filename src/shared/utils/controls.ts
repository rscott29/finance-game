import { Scene } from 'phaser';
import { DIRECTION, Direction } from '../constants/direction';

export class Controls {
  protected readonly scene: Scene;
  cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | null;
  lockPlayerInput: boolean;
  constructor(scene: Scene) {
    this.scene = scene;
    this.cursorKeys = this.scene.input.keyboard?.createCursorKeys() ?? null;
    this.lockPlayerInput = false;
  }

  get isInputLocked() {
    return this.lockPlayerInput;
  }

  set lockInput(value: boolean) {
    this.lockPlayerInput = value;
  }

  wasSpaceKeyPressed(): boolean {
    if (!this.cursorKeys) {
      return false;
    }
    return Phaser.Input.Keyboard.JustDown(this.cursorKeys.space);
  }

  wasBackKeyPressed(): boolean {
    if (!this.cursorKeys) {
      return false;
    }
    return Phaser.Input.Keyboard.JustDown(this.cursorKeys.shift);
  }
  getDirectionKeyPressedDown(): Direction {
    if (!this.cursorKeys) {
      return DIRECTION.NONE;
    }
    let selectedDirection: Direction = DIRECTION.NONE;

    if (this.cursorKeys?.up.isDown) {
      selectedDirection = DIRECTION.UP;
    } else if (this.cursorKeys?.down.isDown) {
      selectedDirection = DIRECTION.DOWN;
    } else if (this.cursorKeys?.left.isDown) {
      selectedDirection = DIRECTION.LEFT;
    } else if (this.cursorKeys?.right.isDown) {
      selectedDirection = DIRECTION.RIGHT;
    }

    return selectedDirection;
  }
  getDirectionKeyJustPressed(): Direction {
    if (!this.cursorKeys) {
      return DIRECTION.NONE;
    }
    let selectedDirection: Direction = DIRECTION.NONE;

    if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.up)) {
      selectedDirection = DIRECTION.UP;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.down)) {
      selectedDirection = DIRECTION.DOWN;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.left)) {
      selectedDirection = DIRECTION.LEFT;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.right)) {
      selectedDirection = DIRECTION.RIGHT;
    }

    return selectedDirection;
  }
}
