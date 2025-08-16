import { Coordinate } from '../types/monster-types';

export class Attack {
  protected scene: Phaser.Scene;
  protected position: Coordinate;
  protected isAnimationPlaying: boolean;
  protected attackGameObject: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container | undefined;

  constructor(scene: Phaser.Scene, position: Coordinate) {
    this.scene = scene;
    this.position = position;
    this.isAnimationPlaying = false;
    this.attackGameObject = undefined;
  }

  get gameObject(): Phaser.GameObjects.Sprite | Phaser.GameObjects.Container | undefined {
    return this.attackGameObject;
  }

  playAnimation(callback: () => void): void {
    throw new Error('PlayAnimation is not implemented.');
  }
}
