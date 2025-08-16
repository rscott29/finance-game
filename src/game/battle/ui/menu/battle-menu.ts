import { exhaustiveGuard } from '../../../../app/utils/guard';
import { animateText } from '../../../../app/utils/text-utils';
import { SKIP_BATTLE_ANIMIATIONS } from '../../../../config';
import { UI_ASSET_KEYS } from '../../../shared/asset-keys.enum';
import { Direction } from '../../../shared/direction';
import { BattleMonster } from '../../monsters/battle-monster';
import {
  BATTLE_MENU_CURSOR_POS,
  BATTLE_MENU_CURSOR_POS_MAP,
  BATTLE_MENU_CURSOR_POS_MAP_ATTACK,
  BATTLE_MENU_OPTIONS,
  battleUiTextStyle,
  PLAYER_INPUT_CURSOR_POS,
} from './battle-menu-config';
import {
  ACTIVE_BATTLE_MENU,
  ActiveBattleMenuOptions,
  ATTACK_MOVE_OPTIONS,
  attackMenuNavigationMap,
  AttackMoveOptions,
  battleMenuNavigationMap,
  BattleMenuOptions,
} from './battle-menu-options';

type PlayerInput = 'OK' | 'CANCEL';

export class BattleMenu {
  private readonly scene: Phaser.Scene;
  private mainBattleMenuContainerGameObject!: Phaser.GameObjects.Container;
  private moveSelectionSubMenuContainerGameObject!: Phaser.GameObjects.Container;
  private battleTextGameObjectLine1!: Phaser.GameObjects.Text;
  private battleTextGameObjectLine2!: Phaser.GameObjects.Text;
  private mainBattleMenuCursorPhaserImageGameObject: Phaser.GameObjects.Image | null = null;
  private attackBattleMenuCursorPhaserImageGameObject: Phaser.GameObjects.Image | null = null;
  private selectedBattleMenuOption: BattleMenuOptions;
  private selectedAttackMenuOption: AttackMoveOptions;
  private activeBattleMenu: ActiveBattleMenuOptions | null = null;
  private activePlayerMonster: BattleMonster;
  private queuedInfoPanelMessages: string[] = [];
  private queuedInfoPanelCallback: (() => void) | undefined;
  private waitingForPlayerInput = false;
  private selectedAttackIndex: number | undefined;
  private userInputCursorPhaserImageGameObject: Phaser.GameObjects.Image | undefined;
  private userInputCursorPhaserTween: Phaser.Tweens.Tween | undefined;
  private queuedMessagesSkipAnimation = false;
  private queuedMessageAnimationPlaying = false;

  constructor(scene: Phaser.Scene, activePlayerMonster: BattleMonster) {
    this.scene = scene;
    this.activePlayerMonster = activePlayerMonster;
    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
    this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;
    this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
    this.queuedInfoPanelCallback = undefined;

    this.createMainInfoPane();
    this.createMainBattleMenu();
    this.createMonsterAttackSubMenu();
    this.createPlayerInputCursor();
  }

  get selectedAttack(): number | undefined {
    if (this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
      return this.selectedAttackIndex;
    }
    return undefined;
  }

  private createMainBattleMenu() {
    this.battleTextGameObjectLine1 = this.scene.add.text(20, 468, 'what should', battleUiTextStyle);
    this.battleTextGameObjectLine2 = this.scene.add.text(
      20,
      512,
      `${this.activePlayerMonster.name} do next?`,
      battleUiTextStyle
    );
    this.mainBattleMenuCursorPhaserImageGameObject = this.scene.add
      .image(BATTLE_MENU_CURSOR_POS.X, BATTLE_MENU_CURSOR_POS.Y, UI_ASSET_KEYS.CURSOR, 0)
      .setOrigin(0.5)
      .setScale(2.5);
    this.mainBattleMenuContainerGameObject = this.scene.add.container(520, 448, [
      this.createMainInfoSubPane(),
      this.scene.add.text(55, 22, BATTLE_MENU_OPTIONS.FIGHT, battleUiTextStyle),
      this.scene.add.text(240, 22, BATTLE_MENU_OPTIONS.SWITCH, battleUiTextStyle),
      this.scene.add.text(55, 70, BATTLE_MENU_OPTIONS.ITEM, battleUiTextStyle),
      this.scene.add.text(240, 70, BATTLE_MENU_OPTIONS.FLEE, battleUiTextStyle),
      this.mainBattleMenuCursorPhaserImageGameObject,
    ]);
    this.hideMainBattleMenu();
  }

  private createMonsterAttackSubMenu() {
    this.attackBattleMenuCursorPhaserImageGameObject = this.scene.add
      .image(BATTLE_MENU_CURSOR_POS.X, BATTLE_MENU_CURSOR_POS.Y, UI_ASSET_KEYS.CURSOR, 0)
      .setOrigin(0.5)
      .setScale(2.5);

    const attackNames: string[] = [];

    for (let i = 0; i < 4; i += 1) {
      attackNames.push(this.activePlayerMonster.attacks[i]?.name || '-');
    }

    this.moveSelectionSubMenuContainerGameObject = this.scene.add.container(0, 448, [
      this.scene.add.text(55, 22, attackNames[0], battleUiTextStyle),
      this.scene.add.text(240, 22, attackNames[1], battleUiTextStyle),
      this.scene.add.text(55, 70, attackNames[2], battleUiTextStyle),
      this.scene.add.text(240, 70, attackNames[3], battleUiTextStyle),
      this.attackBattleMenuCursorPhaserImageGameObject,
    ]);
    this.hideMonsterAttackSubMenu();
  }

  private createMainInfoPane() {
    const rectHeight = 124;
    const padding = 4;
    this.scene.add
      .rectangle(
        padding,
        this.scene.scale.height - rectHeight - padding,
        this.scene.scale.width - padding * 2,
        rectHeight,
        0xede4f3,
        1
      )
      .setOrigin(0, 0)
      .setStrokeStyle(8, 0xe4434a, 1);
  }

  private createMainInfoSubPane() {
    const rectWidth = 500;
    const rectHeight = 124;

    return this.scene.add
      .rectangle(0, 0, rectWidth, rectHeight, 0xede4f3, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(8, 0x905ac2, 1);
  }

  showMainBattleMenu() {
    this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
    this.battleTextGameObjectLine1.setText('what should');
    this.mainBattleMenuContainerGameObject.setAlpha(1);
    this.battleTextGameObjectLine1.setAlpha(1);
    this.battleTextGameObjectLine2.setAlpha(1);
    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
    this.mainBattleMenuCursorPhaserImageGameObject?.setPosition(
      BATTLE_MENU_CURSOR_POS.X,
      BATTLE_MENU_CURSOR_POS.Y
    );
    this.selectedAttackIndex = undefined;
  }

  handlePlayerInput(input: Direction | PlayerInput) {
    if (this.queuedMessageAnimationPlaying && input == 'OK') {
      return;
    }
    if (this.waitingForPlayerInput && (input === 'CANCEL' || input === 'OK')) {
      this.updateInfoPaneWithMessage();
      return;
    }

    if (input === 'CANCEL') {
      this.switchToMainBattleMenu();
      return;
    }
    if (input === 'OK') {
      if (this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
        this.handlePlayerChooseMainBattleOption();
        return;
      }
      if (this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
        this.handlePlayerChooseAttack();
        return;
      }
      return;
    }

    this.updateSelectedBattleMenuOption(input);
    this.updateSelectedMoveMenuOption(input);
    this.moveMainBattleMenuCursor();
    this.moveSelectBattleMenuCursor();
  }

  updateInfoPaneMessageNoInputRequired(
    message: string,
    callback: () => void | undefined,
    skipAnimation = false
  ) {
    if (skipAnimation) {
      this.battleTextGameObjectLine1.setText('').setAlpha(1);
      this.battleTextGameObjectLine1.setText(message);
      this.waitingForPlayerInput = false;
      if (callback) {
        callback();
      }
      return;
    }
    animateText(this.scene, this.battleTextGameObjectLine1, message, {
      delay: 50,
      callback: () => {
        this.waitingForPlayerInput = false;
        if (callback) {
          callback();
        }
      },
    });
  }

  updateInfoPaneMessagesAndWaitForInput(
    messages: string[],
    callback: () => void | undefined,
    skipAnimation = false
  ) {
    this.queuedInfoPanelMessages = messages;
    this.queuedInfoPanelCallback = callback;
    this.queuedMessagesSkipAnimation = skipAnimation;

    this.updateInfoPaneWithMessage();
  }

  hideMonsterAttackSubMenu() {
    this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
    this.moveSelectionSubMenuContainerGameObject.setAlpha(0);
  }

  playInputCursorAnimation() {
    this.userInputCursorPhaserImageGameObject?.setPosition(
      this.battleTextGameObjectLine1.displayWidth +
        this.userInputCursorPhaserImageGameObject.displayWidth * 2.7,
      this.userInputCursorPhaserImageGameObject.y
    );
    this.userInputCursorPhaserImageGameObject?.setAlpha(1);
    this.userInputCursorPhaserTween?.restart();
  }

  hideInputCursor() {
    this.userInputCursorPhaserImageGameObject?.setAlpha(0);
    this.userInputCursorPhaserTween?.pause();
  }

  private updateInfoPaneWithMessage() {
    this.waitingForPlayerInput = false;
    this.battleTextGameObjectLine1.setText('').setAlpha(1);
    this.hideInputCursor();

    // check if all messages have been displayed from the queue and call the callback
    if (this.queuedInfoPanelMessages.length === 0) {
      if (this.queuedInfoPanelCallback) {
        this.queuedInfoPanelCallback();
        this.queuedInfoPanelCallback = undefined;
      }
      return;
    }

    // get first message from queue and animate message
    const messageToDisplay = this.queuedInfoPanelMessages.shift();

    if (this.queuedMessagesSkipAnimation) {
      this.battleTextGameObjectLine1.setText(messageToDisplay ?? '');
      this.queuedMessageAnimationPlaying = false;
      this.waitingForPlayerInput = true;
      this.playInputCursorAnimation();

      return;
    }

    this.queuedMessageAnimationPlaying = true;
    animateText(this.scene, this.battleTextGameObjectLine1, messageToDisplay ?? '', {
      delay: 50,
      callback: () => {
        this.playInputCursorAnimation();
        this.waitingForPlayerInput = true;
        this.queuedMessageAnimationPlaying = false;
      },
    });
  }

  private hideMainBattleMenu() {
    this.mainBattleMenuContainerGameObject.setAlpha(0);
    this.battleTextGameObjectLine1.setAlpha(0);
    this.battleTextGameObjectLine2.setAlpha(0);
  }

  private showMonsterAttackSubMenu() {
    this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT;
    this.moveSelectionSubMenuContainerGameObject.setAlpha(1);
  }

  private updateSelectedBattleMenuOption(direction: Direction) {
    if (this.activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
      return;
    }

    const current = this.selectedBattleMenuOption;
    const next = battleMenuNavigationMap[current]?.[direction];
    if (next) {
      this.selectedBattleMenuOption = next;
    }
  }

  private updateSelectedMoveMenuOption(direction: Direction) {
    if (this.activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
      return;
    }

    const current = this.selectedAttackMenuOption;
    const next = attackMenuNavigationMap[current]?.[direction];
    if (next) {
      this.selectedAttackMenuOption = next;
    }
  }

  private moveMainBattleMenuCursor() {
    if (this.activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
      return;
    }

    const cursor = this.mainBattleMenuCursorPhaserImageGameObject;
    const option = this.selectedBattleMenuOption;

    switch (option) {
      case BATTLE_MENU_OPTIONS.FIGHT:
      case BATTLE_MENU_OPTIONS.SWITCH:
      case BATTLE_MENU_OPTIONS.ITEM:
      case BATTLE_MENU_OPTIONS.FLEE: {
        const pos = BATTLE_MENU_CURSOR_POS_MAP[option];
        cursor?.setPosition(pos.x, pos.y);
        return;
      }
      default: {
        exhaustiveGuard(option);
      }
    }
  }

  private moveSelectBattleMenuCursor() {
    if (this.activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
      return;
    }

    const cursor = this.attackBattleMenuCursorPhaserImageGameObject;
    const option = this.selectedAttackMenuOption;
    switch (option) {
      case ATTACK_MOVE_OPTIONS.MOVE_1:
      case ATTACK_MOVE_OPTIONS.MOVE_2:
      case ATTACK_MOVE_OPTIONS.MOVE_3:
      case ATTACK_MOVE_OPTIONS.MOVE_4: {
        const pos = BATTLE_MENU_CURSOR_POS_MAP_ATTACK[option];
        cursor?.setPosition(pos.x, pos.y);
        return;
      }
      default: {
        exhaustiveGuard(option);
      }
    }
  }

  private switchToMainBattleMenu() {
    this.waitingForPlayerInput = false;
    this.hideInputCursor();
    this.hideMonsterAttackSubMenu();
    this.showMainBattleMenu();
  }

  private handlePlayerChooseMainBattleOption() {
    this.hideMainBattleMenu();
    if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT) {
      this.showMonsterAttackSubMenu();
      return;
    }
    if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.ITEM) {
      this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_ITEM;
      this.updateInfoPaneMessagesAndWaitForInput(
        ['Your bag is empty...'],
        () => {
          this.switchToMainBattleMenu();
        },
        SKIP_BATTLE_ANIMIATIONS
      );
      return;
    }

    if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.SWITCH) {
      this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_SWITCH;
      this.updateInfoPaneMessagesAndWaitForInput(
        ['You have no other monsters in your party...'],
        () => {
          this.switchToMainBattleMenu();
        },
        SKIP_BATTLE_ANIMIATIONS
      );
      return;
    }
    if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FLEE) {
      this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_FLEE;
      this.updateInfoPaneMessagesAndWaitForInput(
        ['You fail to run away...'],
        () => {
          this.switchToMainBattleMenu();
        },
        SKIP_BATTLE_ANIMIATIONS
      );
      return;
    }

    exhaustiveGuard(this.selectedBattleMenuOption);
  }

  private handlePlayerChooseAttack() {
    let selectedMoveIndex = 0;
    switch (this.selectedAttackMenuOption) {
      case ATTACK_MOVE_OPTIONS.MOVE_1:
        selectedMoveIndex = 0;
        break;
      case ATTACK_MOVE_OPTIONS.MOVE_2:
        selectedMoveIndex = 1;
        break;

      case ATTACK_MOVE_OPTIONS.MOVE_3:
        selectedMoveIndex = 2;
        break;
      case ATTACK_MOVE_OPTIONS.MOVE_4:
        selectedMoveIndex = 3;
        break;
      default:
        exhaustiveGuard(this.selectedAttackMenuOption);
    }

    this.selectedAttackIndex = selectedMoveIndex;
  }

  private createPlayerInputCursor() {
    this.userInputCursorPhaserImageGameObject = this.scene.add.image(0, 0, UI_ASSET_KEYS.CURSOR);
    this.userInputCursorPhaserImageGameObject.setAngle(90).setScale(2.5, 1.25);
    this.userInputCursorPhaserImageGameObject.setAlpha(0);

    this.userInputCursorPhaserTween = this.scene.add.tween({
      delay: 0,
      duration: 500,
      repeat: -1,
      y: {
        from: PLAYER_INPUT_CURSOR_POS.Y,
        start: PLAYER_INPUT_CURSOR_POS.Y,
        to: PLAYER_INPUT_CURSOR_POS.Y + 6,
      },
      targets: this.userInputCursorPhaserImageGameObject,
    });
    this.userInputCursorPhaserTween.pause();
  }
}
