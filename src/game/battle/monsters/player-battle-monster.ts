import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../../shared/font-keys';
import { BattleMonsterConfig, Coordinate } from '../types/monster-types';
import { BattleMonster } from './battle-monster';

const PLAYER_POSITION: Coordinate = {
  x: 256,
  y: 316,
};

export class PlayerBattleMonster extends BattleMonster {
  private heathBarTextGameObject: Phaser.GameObjects.Text | undefined;

  constructor(config: BattleMonsterConfig) {
    super(config, PLAYER_POSITION);
    this.phaserGameObject.setFlipX(true);
    this.phaserHealthBarGameContainer?.setPosition(556, 318);
    this.addHealthBarComponents();
  }

  private setHealthBarText() {
    this.heathBarTextGameObject?.setText(`${this.currentHealth} / ${this.maxHealth}`);
  }

  private addHealthBarComponents() {
    this.heathBarTextGameObject = this.scene.add
      .text(443, 80, '25/25', {
        color: '#7E3D3F',
        fontSize: '16px',
        fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
      })
      .setOrigin(1, 0);
    this.setHealthBarText();

    this.phaserHealthBarGameContainer?.add(this.heathBarTextGameObject);
  }

  override takeDamage(damage: number, callback?: () => void) {
    super.takeDamage(damage, callback);
    this.setHealthBarText();
  }

  override playMonsterAppearAnimation(callback: () => void): void {
    const startXPosition = -30;
    const endXPosition = PLAYER_POSITION.x;

    this.phaserGameObject.setPosition(startXPosition, PLAYER_POSITION.y);
    this.phaserGameObject.setAlpha(1);

    if (this.skipBattleAnimations) {
      this.phaserGameObject?.setX(endXPosition);
      callback();
      return;
    }
    this.scene.tweens.add({
      delay: 0,
      duration: 800,
      x: {
        from: startXPosition,
        start: startXPosition,
        to: endXPosition,
      },
      targets: this.phaserGameObject,
      onComplete: () => {
        callback();
      },
    });
  }

  override playMonsterHealthBarAppearAnimation(callback: () => void): void {
    const startXPosition = 800;
    const endXPosition = this.phaserHealthBarGameContainer?.x;

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
      duration: 800,
      x: {
        from: startXPosition,
        start: startXPosition,
        to: endXPosition,
      },
      targets: this.phaserHealthBarGameContainer,
      onComplete: () => {
        this.phaserGameObject.setAlpha(1);
        callback();
      },
    });
  }

  override playDeathAnimation(callback: () => void): void {
    const startYPosition = this.phaserGameObject.y;
    const endYPosition = startYPosition + 400;

    if (this.skipBattleAnimations) {
      this.phaserGameObject?.setX(endYPosition);
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
