import { GameObjects } from 'phaser';
import { EventBus } from '../EventBus';
import { BaseScene } from './BaseScene';

export class MainMenu extends BaseScene {
  logo: GameObjects.Image = null!;
  title: GameObjects.Text = null!;
  logoTween: Phaser.Tweens.Tween | null = null;

  constructor() {
    super('MainMenu');
  }

  create() {
    this.createBackground();

    this.logo = this.add
      .image(this.scale.width / 2, this.scale.height / 2 - 100, 'logo')
      .setDepth(100);

    this.title = this.add
      .text(this.scale.width / 2, this.scale.height / 2 + 50, 'Main Menu', {
        fontFamily: 'Arial Black',
        fontSize: '38px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center',
      })
      .setOrigin(0.5) // center origin
      .setDepth(100)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('Game');
      });

    EventBus.emit('current-scene-ready', this);
  this.moveLogo( () => {});
  }

  changeScene() {
    if (this.logoTween) {
      this.logoTween.stop();
      this.logoTween = null;
    }

    this.scene.start('Game');
  }

  moveLogo(vueCallback: ({ x, y }: { x: number; y: number }) => void) {
    if (this.logoTween) {
      if (this.logoTween.isPlaying()) {
        this.logoTween.pause();
      } else {
        this.logoTween.play();
      }
    } else {
      this.logoTween = this.tweens.add({
        targets: this.logo,
        x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
        y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
        yoyo: true,
        repeat: -1,
        onUpdate: () => {
          if (vueCallback) {
            vueCallback({
              x: Math.floor(this.logo.x),
              y: Math.floor(this.logo.y),
            });
          }
        },
      });
    }
  }
}
