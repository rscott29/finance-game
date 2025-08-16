import { DataUtils } from '../../../app/utils/data-utils';
import { BATTLE_ASSET_KEYS } from '../../shared/asset-keys.enum';
import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../../shared/font-keys';
import { Attack, BattleMonsterConfig, Coordinate, Monster } from '../types/monster-types';
import { HealthBar } from '../ui/healthbar';

export class BattleMonster {
  protected readonly scene: Phaser.Scene;
  protected monsterDetails: Monster;
  protected phaserGameObject: Phaser.GameObjects.Image;
  protected skipBattleAnimations: boolean;
  public healthbar: HealthBar | undefined;
  public currentHealth: number;
  public maxHealth: number;
  public monsterAttacks: Attack[];

  protected phaserHealthBarGameContainer: Phaser.GameObjects.Container | undefined;

  constructor(config: BattleMonsterConfig, position: Coordinate) {
    this.scene = config.scene;
    this.monsterDetails = config.monsterDetails;
    this.currentHealth = config.monsterDetails.currentHp;
    this.maxHealth = config.monsterDetails.maxHp;
    this.monsterAttacks = [];
    this.skipBattleAnimations = config.skipBattleAnimations ?? false;

    this.phaserGameObject = this.scene.add
      .image(
        position.x,
        position.y,
        this.monsterDetails.assetKey,
        this.monsterDetails.assetFrame || 0
      )
      .setAlpha(0);
    this.createHealthBarComponent(config.scaleHealthBarBackgroundImageByY);

    this.monsterDetails.attackIds.forEach(attackId => {
      const monsterAttack = DataUtils.getMonsterAttack(this.scene, attackId);
      if (monsterAttack !== undefined) {
        this.monsterAttacks.push(monsterAttack);
      }
    });
  }

  get isFainted(): boolean {
    return this.currentHealth <= 0;
  }

  get name(): string {
    return this.monsterDetails.name;
  }

  get attacks(): Attack[] {
    return [...this.monsterAttacks];
  }

  get baseAttack(): number {
    return this.monsterDetails.baseAttack;
  }

  get level(): number {
    return this.monsterDetails.currentLevel;
  }

  takeDamage(damage: number, callback?: () => void) {
    this.currentHealth -= damage;
    if (this.currentHealth < 0) {
      this.currentHealth = 0;
    }
    if (this.healthbar) {
      this.healthbar.setMeterPercentageAnimated(this.currentHealth / this.maxHealth, { callback });
    }
  }

  playMonsterAppearAnimation(callback: () => void): void {
    throw new Error('playMonsterAppearAnimation is not implemented');
  }

  playMonsterHealthBarAppearAnimation(callback: () => void): void {
    throw new Error('playMonsterHealthBarAppearAnimation is not implemented');
  }

  playTakeDamageAnimation(callback: () => void): void {
    if (this.skipBattleAnimations) {
      this.phaserGameObject.setAlpha(1);
      callback();
      return;
    }
    this.scene.tweens.add({
      delay: 0,
      duration: 150,
      targets: this.phaserGameObject,
      alpha: {
        from: 1,
        start: 1,
        to: 0,
      },
      repeat: 10,
      onComplete: () => {
        this.phaserGameObject.setAlpha(1);
        callback();
      },
    });
  }

  playDeathAnimation(callback: () => void): void {
    throw new Error(' playDeathAnimation is not implemented');
  }

  private createHealthBarComponent(scaleHealthBarBackgroundImageByY = 1) {
    this.healthbar = new HealthBar(this.scene, 34, 34);

    const monsterNameGameText = this.scene.add.text(30, 20, this.name, {
      color: '#7E3D3F',
      fontSize: '32px',
      fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
    });

    const monsterHealthBarLevelText = this.scene.add.text(
      monsterNameGameText.width + 35,
      23,
      `L${this.level}`,
      {
        color: '#ED474B',
        fontSize: '28px',
        fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
      }
    );
    const monsterHpText = this.scene.add.text(30, 55, 'HP', {
      color: '#FF6505',
      fontSize: '24px',
      fontStyle: 'italic',
      fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
    });

    const healthBarBgImage = this.scene.add
      .image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
      .setOrigin(0)
      .setScale(1, scaleHealthBarBackgroundImageByY);

    this.phaserHealthBarGameContainer = this.scene.add
      .container(0, 0, [
        healthBarBgImage,
        monsterNameGameText,
        this.healthbar.container,
        monsterHealthBarLevelText,
        monsterHpText,
      ])
      .setAlpha(0);
  }
}
