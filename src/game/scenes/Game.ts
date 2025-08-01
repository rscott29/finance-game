import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { BaseScene } from './BaseScene';
import { MenuOption } from '../shared/menu-options.enum';

export class Game extends BaseScene
{
    camera: Phaser.Cameras.Scene2D.Camera | null = null;
    gameText: Phaser.GameObjects.Text  | null = null;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
      this.createBackground();
        this.camera = this.cameras.main;


        const menuItems = [
          MenuOption.NewGame,
          MenuOption.HighScores,
          MenuOption.Settings,
          MenuOption.Home,
        ];

        const startY = this.scale.height / 2;
        const spacing = 60;

        menuItems.forEach((text, index) => {
           this.add.text(this.scale.width / 2, startY + index * spacing, text, {
            fontFamily: 'Arial Black',
            fontSize: '38px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center',
          })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => {
              this.handleMenuClick(text)
          });
        });

        EventBus.emit('current-scene-ready', this);
    }
    handleMenuClick(option: string) {

      switch (option) {
        case MenuOption.NewGame:
          console.log(option)
          this.scene.start('NewGame');
          break;
        case MenuOption.Home:
          this.scene.start('MainMenu');
          break;
        case MenuOption.HighScores:
          this.scene.start('HighScores');
          break;
        case MenuOption.Settings:
          this.scene.start('Settings');
          break;
        default:
          console.warn(`No action defined for: ${option}`);
          break;
      }
    }


}
