import { BattleMonsterConfig, Coordinate } from '../types/monster-types';
import { BattleMonster } from './battle-monster';

const ENEMY_POSITION: Coordinate = {
  x: 768,
  y: 144,
};

export class EnemyBattleMonster extends BattleMonster {
  constructor(config: BattleMonsterConfig) {
    super({ ...config, scaleHealthBarBackgroundImageByY: 0.8 }, ENEMY_POSITION);
  }

  override playMonsterAppearAnimation(callback: () => void): void {
    const startXPosition = -30;
    const endXPosition = ENEMY_POSITION.x;

    this.phaserGameObject.setPosition(startXPosition, ENEMY_POSITION.y);
    this.phaserGameObject.setAlpha(1);

    if (this.skipBattleAnimations) {
      this.phaserGameObject.setX(endXPosition);
      callback();
      return;
    }
    this.scene.tweens.add({
      delay: 0,
      duration: 1600,
      x: {
        from: startXPosition,
        start: startXPosition,
        to: endXPosition,
      },
      targets: this.phaserGameObject,
      onComplete: () => {
        this.phaserGameObject.setAlpha(1);
        callback();
      },
    });
  }

  override playMonsterHealthBarAppearAnimation(callback: () => void): void {
    const startXPosition = -600;
    const endXPosition = 0;

    this.phaserHealthBarGameContainer?.setPosition(
      startXPosition,
      this.phaserHealthBarGameContainer.y
    );
    this.phaserHealthBarGameContainer?.setAlpha(1);

    if (this.skipBattleAnimations) {
      this.phaserHealthBarGameContainer?.setX(endXPosition);
      callback();
      return;
    }
    this.scene.tweens.add({
      delay: 0,
      duration: 1500,
      x: {
        from: startXPosition,
        start: startXPosition,
        to: endXPosition,
      },
      targets: this.phaserHealthBarGameContainer,
      onComplete: () => {
        callback();
      },
    });
  }

  override playDeathAnimation(callback: () => void): void {
    const startYPosition = this.phaserGameObject.y;
    const endYPosition = startYPosition - 400;

    if (this.skipBattleAnimations) {
      this.phaserGameObject?.setY(endYPosition);
      callback();
      return;
    }
    this.scene.tweens.add({
      delay: 0,
      duration: 2000,
      y: {
        from: startYPosition,
        start: startYPosition,
        to: endYPosition,
      },
      targets: this.phaserGameObject,
      onComplete: () => {
        callback();
      },
    });
  }
}
