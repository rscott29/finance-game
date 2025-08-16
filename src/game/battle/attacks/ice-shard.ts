import { ATTACK_ASSET_KEYS } from '../../shared/asset-keys.enum';
import { Coordinate } from '../types/monster-types';
import { Attack } from './attack';

export class IceShard extends Attack {
  protected override attackGameObject: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, position: Coordinate) {
    super(scene, position);

    //create game objects
    this.attackGameObject = this.scene.add
      .sprite(this.position.x, this.position.y, ATTACK_ASSET_KEYS.ICE_SHARD, 5)
      .setOrigin(0.5)
      .setScale(4)
      .setAlpha(1);
  }
  override playAnimation(callback?: () => void): void {
    if (this.isAnimationPlaying) {
      return;
    }
    this.isAnimationPlaying = true;
    this.attackGameObject.setAlpha(1);
    this.attackGameObject.play(ATTACK_ASSET_KEYS.ICE_SHARD_START);

    this.attackGameObject.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + ATTACK_ASSET_KEYS.ICE_SHARD_START,
      () => {
        this.attackGameObject.play(ATTACK_ASSET_KEYS.ICE_SHARD);
      }
    );
    this.attackGameObject.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + ATTACK_ASSET_KEYS.ICE_SHARD,
      () => {
        this.isAnimationPlaying = false;
        this.attackGameObject.setAlpha(0).setFrame(0);

        if (callback) {
          callback();
        }
      }
    );
  }
}
