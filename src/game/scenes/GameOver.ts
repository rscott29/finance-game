import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { BaseScene } from './BaseScene';

export class GameOver extends BaseScene {
  camera: Phaser.Cameras.Scene2D.Camera | null = null;

  gameOverText: Phaser.GameObjects.Text | null = null;
  constructor() {
    super('GameOver');
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0xff0000);




    this.gameOverText = this.add
      .text(512, 384, 'Game Over', {
        fontFamily: 'Arial Black',
        fontSize: 64,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(100);

    EventBus.emit('current-scene-ready', this);
  }

  changeScene() {
    this.scene.start('MainMenu');
  }
}
