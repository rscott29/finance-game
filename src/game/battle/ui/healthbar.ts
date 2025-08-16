import { HEALTH_BAR_ASSET_KEYS } from '../../shared/asset-keys.enum';

export class HealthBar {
  private scene: Phaser.Scene;
  private heathBarContainer: Phaser.GameObjects.Container;
  private fullWidth: number;
  private scaleY: number;

  private leftCap: Phaser.GameObjects.Image | null = null;
  private middle: Phaser.GameObjects.Image | null = null;
  private rightCap: Phaser.GameObjects.Image | null = null;

  private leftCapShadow: Phaser.GameObjects.Image | null = null;
  private middleShadow: Phaser.GameObjects.Image | null = null;
  private rightCapShadow: Phaser.GameObjects.Image | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.fullWidth = 360;
    this.scaleY = 0.7;
    this.heathBarContainer = this.scene.add.container(x, y, []);
    this.createHeathBarShadowImages(x, y);
    this.createHealthBarImages(x, y);
    this.setMeterPercentage(1);
  }

  get container() {
    return this.heathBarContainer;
  }

  private createHealthBarImages(x: number, y: number): void {
    this.leftCap = this.scene.add
      .image(x, y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP)
      .setOrigin(0, 0.5)
      .setScale(1, this.scaleY);
    this.middle = this.scene.add
      .image(this.leftCap.x + this.leftCap.width, y, HEALTH_BAR_ASSET_KEYS.MIDDLE)
      .setOrigin(0, 0.5)
      .setScale(1, this.scaleY);
    this.middle.displayWidth = this.fullWidth;
    this.rightCap = this.scene.add
      .image(this.middle.x + this.middle.displayWidth, y, HEALTH_BAR_ASSET_KEYS.RIGHT_CAP)
      .setOrigin(0, 0.5)
      .setScale(1, this.scaleY);

    this.heathBarContainer.add([this.leftCap, this.middle, this.rightCap]);
  }
  private setMeterPercentage(percentage = 1): void {
    const width = this.fullWidth * percentage;

    if (this.middle) {
      this.middle.displayWidth = width;

      if (this.rightCap) {
        this.rightCap.x = this.middle.x + width;
      }
    }
  }
  private createHeathBarShadowImages(x: number, y: number): void {
    this.leftCapShadow = this.scene.add
      .image(x, y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW)
      .setOrigin(0, 0.5)
      .setScale(1, this.scaleY);

    this.middleShadow = this.scene.add
      .image(
        this.leftCapShadow.x + this.leftCapShadow.width,
        y,
        HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW
      )
      .setOrigin(0, 0.5)
      .setScale(1, this.scaleY);
    this.middleShadow.displayWidth = this.fullWidth;

    this.rightCapShadow = this.scene.add
      .image(
        this.middleShadow.x + this.middleShadow.displayWidth,
        y,
        HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW
      )
      .setOrigin(0, 0.5)
      .setScale(1, this.scaleY);

    this.heathBarContainer.add([this.leftCapShadow, this.middleShadow, this.rightCapShadow]);
  }
  /**
   * Animates the health bar to reflect a new percentage value.
   *
   * @param percent - A number between 0 and 1 representing the percentage of the full health bar to display.
   *                  For example, 0.5 sets the health bar to 50%.
   *
   * @param options - Optional configuration for the animation.
   * @param options.duration - Duration of the tween in milliseconds. Defaults to 1000ms if not provided.
   * @param options.callback - A function to be called once the animation completes.
   *
   */

  setMeterPercentageAnimated(
    percent: number,
    options?: { duration?: number; callback?: () => void }
  ): void {
    const targetWidth = this.fullWidth * percent;

    this.scene.tweens.add({
      targets: this.middle,
      displayWidth: targetWidth,
      duration: options?.duration ?? 1000,
      ease: Phaser.Math.Easing.Sine.Out,
      onUpdate: () => {
        if (this.middle && this.rightCap) {
          this.rightCap.x = this.middle.x + this.middle.displayWidth;

          const isVisible = this.middle.displayWidth > 0;
          this.leftCap?.setVisible(isVisible);
          this.middle?.setVisible(isVisible);
          this.rightCap?.setVisible(isVisible);
        }
      },
      onComplete: () => {
        options?.callback?.();
      },
    });
  }
}
