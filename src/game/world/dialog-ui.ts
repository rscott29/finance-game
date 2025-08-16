import { animateText, CANNOT_READ_SIGN_TEXT } from '../../app/utils/text-utils';
import { PLAYER_INPUT_CURSOR_POS } from '../battle/ui/menu/battle-menu-config';
import { UI_ASSET_KEYS } from '../shared/asset-keys.enum';
import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../shared/font-keys';

const UI_TEXT_STYLE = {
  color: 'black',
  fontSize: '32px',
  wordWrap: { width: 0 },
  fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
} satisfies Phaser.Types.GameObjects.Text.TextStyle;

export class dialogUI {
  private readonly scene: Phaser.Scene;
  private width: number;
  private padding: number;
  private height: number;
  private container: Phaser.GameObjects.Container;
  private _isVisible: boolean;
  private userInputCursor: Phaser.GameObjects.Image | undefined;
  private userInputCursorTween: Phaser.Tweens.Tween | undefined;
  private uiText: Phaser.GameObjects.Text;
  private textAnimationPlaying: boolean;
  private messagesToShow: string[];

  constructor(scene: Phaser.Scene, width: number) {
    this.scene = scene;
    this.padding = 90;
    this.width = width - this.padding * 2;
    this.height = 124;
    this.textAnimationPlaying = false;
    this.messagesToShow = [];
    this._isVisible = false;
    const panel = this.scene.add
      .rectangle(0, 0, this.width, this.height, 0xede4f3, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(8, 0x905ac2, 1);
    this.container = this.scene.add.container(0, 0, [panel]);
    this.uiText = this.scene.add.text(18, 12, CANNOT_READ_SIGN_TEXT, {
      ...UI_TEXT_STYLE,
      ...{ wordWrap: { width: this.width - 18 } },
    });
    this.container.add(this.uiText);
    this.createPlayerInputCursor();
    this.hideDialogModal();
  }

  get isVisible(): boolean {
    return this._isVisible;
  }
  get isAnimationPlaying(): boolean {
    return this.textAnimationPlaying;
  }

  get moreMessagesToShow(): boolean {
    return this.messagesToShow.length > 0;
  }

  showDialogModal(messages: string[]) {
    this.messagesToShow = [...messages];
    const { x, bottom } = this.scene.cameras.main.worldView;
    const startX = x + this.padding;
    const startY = bottom - this.height - this.padding / 4;

    this.container.setPosition(startX, startY);
    this.userInputCursorTween?.restart();
    this.container.setAlpha(1);
    this._isVisible = true;
    this.showNextMessage();
  }
  showNextMessage(): void {
    if (this.messagesToShow.length === 0) {
      return;
    }
    this.uiText.setText('').setAlpha(1);
    animateText(this.scene, this.uiText, this.messagesToShow.shift() ?? '', {
      delay: 50,
      callback: () => {
        this.textAnimationPlaying = false;
      },
    });
    this.textAnimationPlaying = true;
  }

  hideDialogModal(): void {
    this.container.setAlpha(0);
    this.userInputCursorTween?.pause();
    this._isVisible = false;
  }

  private createPlayerInputCursor(): void {
    const y = this.height - 24;

    this.userInputCursor = this.scene.add.image(this.width - 16, y, UI_ASSET_KEYS.CURSOR);
    this.userInputCursor.setAngle(90).setScale(4.5, 2);

    this.userInputCursorTween = this.scene.add.tween({
      delay: 0,
      duration: 500,
      repeat: -1,
      y: {
        from: y,
        start: y,
        to: y + 6,
      },
      targets: this.userInputCursor,
    });
    this.userInputCursorTween.pause();
    this.container.add(this.userInputCursor);
  }
}
