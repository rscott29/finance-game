import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    const { width, height } = this.scale;

    // Centered outline bar
    this.add.rectangle(width / 2, height / 2, 468, 32).setStrokeStyle(1, 0xffffff);

    // Progress bar starts small, aligned to the left edge of the outline
    const bar = this.add.rectangle((width / 2) - 230, height / 2, 4, 28, 0xffffff).setOrigin(0, 0.5);

    this.load.on('progress', (progress: number) => {
      bar.width = 4 + 460 * progress;
    });
  }


  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath('assets');

    this.load.image('logo', 'logo.png');
    this.load.image('star', 'star.png');
    this.load.audio('bgm', 'audio/RetroAdventure.mp3');
    this.load.image('base-tiles', 'maps/base-tiles.png');
    this.load.tilemapTiledJSON('tilemap', 'maps/start-map.json');
  }

  create() {
    this.textures.get('tiles').setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.scale.displaySize.setAspectRatio( window.innerWidth/window.innerHeight );
    this.scale.refresh();
    this.scene.start('MainMenu');
    const music = this.sound.add('bgm', { loop: true, volume: 0.5 });
    music.play();
    if (this.textures.exists('tileset')) {
      console.log('Tileset image loaded successfully!');
    } else {
      console.log('Failed to load tileset image.');
    }
    this.add.image(0, 0, 'base-tiles')
  }

}
