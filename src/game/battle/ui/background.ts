import { BATTLE_BACKGROUND_ASSET_KEYS } from '../../shared/asset-keys.enum';

export class Background {
  scene: Phaser.Scene;
  backgroundGameObject: Phaser.GameObjects.Image | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.backgroundGameObject = this.scene.add
      .image(0, 0, BATTLE_BACKGROUND_ASSET_KEYS.FOREST)
      .setOrigin(0)
      .setAlpha(0);
  }

  showForest() {
    this.backgroundGameObject?.setTexture(BATTLE_BACKGROUND_ASSET_KEYS.FOREST).setAlpha(1);
  }
}
