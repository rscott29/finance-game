import { Scene, GameObjects, Tilemaps } from 'phaser';

export class BaseScene extends Scene {
  background!: GameObjects.Image;

  constructor(key: string) {
    super(key);
  }

  createBackground() {
    // this.background = this.add
    //   .image(0, 0, 'background')
    //   .setOrigin(0)
    //   .setDisplaySize(this.scale.width, this.scale.height);

    // this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
    //   const { width, height } = gameSize;
    //   this.background.setDisplaySize(width, height);
    // });
  }

  initMap(): void {
    const map = this.make.tilemap({ key: 'tilemap' });
    const tileset = map.addTilesetImage(
      'Modern_Exteriors_Complete_Tileset_32x32',
      'base-tiles'
    );

    const groundLayer = map.createLayer('ground', tileset ?? '');
    const treeLayer = map.createLayer('trees', tileset ?? '');


  }



}
