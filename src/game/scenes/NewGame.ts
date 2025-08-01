import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { BaseScene } from './BaseScene';

export class NewGame extends BaseScene {
  camera: Phaser.Cameras.Scene2D.Camera | null = null;

  constructor() {
    super('NewGame');
  }

  create() {
    this.createBackground();
    this.initMap();
    EventBus.emit('current-scene-ready', this);
  }


}
