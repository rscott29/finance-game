import { Injectable, Signal, signal, computed } from '@angular/core';
import { BattleMonster } from '../../game/battle/monsters/battle-monster';
import { EnemyBattleMonster } from '../../game/battle/monsters/enemy-battle-monster';
import { PlayerBattleMonster } from '../../game/battle/monsters/player-battle-monster';
import { BATTLE_MENU_OPTIONS } from '../../game/battle/ui/menu/battle-menu-config';
import {
  ACTIVE_BATTLE_MENU,
  ActiveBattleMenuOptions,
  ATTACK_MOVE_OPTIONS,
  AttackMoveOptions,
  BattleMenuOptions,
} from '../../game/battle/ui/menu/battle-menu-options';
import { Direction } from '../../game/shared/direction';

type PlayerInput = 'OK' | 'CANCEL';

type BattleStatus = 'CONTINUE' | 'PLAYER_WIN' | 'ENEMY_WIN';

@Injectable({
  providedIn: 'root',
})
export class BattleMenuService {
  public activePlayerMonster = signal<PlayerBattleMonster | null>(null);
  public activeEnemyMonster = signal<EnemyBattleMonster | null>(null);

  private selectedBattleMenuOption = signal<BattleMenuOptions>(BATTLE_MENU_OPTIONS.FIGHT);
  private selectedAttackMenuOption = signal<AttackMoveOptions>(ATTACK_MOVE_OPTIONS.MOVE_1);
  private activeBattleMenu = signal<ActiveBattleMenuOptions | null>(null);
  private selectedAttackIndex = signal<number | undefined>(undefined);
  private waitingForPlayerInput = signal<boolean>(false);
  private queuedInfoPanelMessages: string[] = [];
  private queuedInfoPanelCallback?: () => void;
  private messageText = signal<string>('');
  private showingMessage = signal<boolean>(false);

  // Public readable signals
  readonly activePlayerMonster$ = this.activePlayerMonster.asReadonly();
  readonly activeEnemyMonster$ = this.activeEnemyMonster.asReadonly();
  readonly selectedBattleMenuOption$ = this.selectedBattleMenuOption.asReadonly();
  readonly selectedAttackMenuOption$ = this.selectedAttackMenuOption.asReadonly();
  readonly activeBattleMenu$ = this.activeBattleMenu.asReadonly();
  readonly selectedAttackIndex$ = this.selectedAttackIndex.asReadonly();
  readonly waitingForPlayerInput$ = this.waitingForPlayerInput.asReadonly();
  readonly messageText$ = this.messageText.asReadonly();
  readonly showingMessage$ = this.showingMessage.asReadonly();

  setActivePlayerMonster(monster: PlayerBattleMonster) {
    this.activePlayerMonster.set(monster);
  }

  setActiveEnemyMonster(monster: EnemyBattleMonster) {
    this.activeEnemyMonster.set(monster);
  }

  getSelectedAttack() {
    const monster = this.activePlayerMonster();
    if (!monster) return undefined;

    const attackIndex = this.selectedAttackIndex();
    if (attackIndex === undefined) return undefined;

    return monster.attacks[attackIndex];
  }

  checkBattleStatus(): BattleStatus {
    const playerMonster = this.activePlayerMonster();
    const enemyMonster = this.activeEnemyMonster();

    if (!playerMonster || !enemyMonster) {
      return 'CONTINUE';
    }

    if (enemyMonster.isFainted) {
      return 'PLAYER_WIN';
    }

    if (playerMonster.isFainted) {
      return 'ENEMY_WIN';
    }

    return 'CONTINUE';
  }

  showMessage(messages: string[], callback?: () => void) {
    this.queuedInfoPanelMessages = messages;
    this.queuedInfoPanelCallback = callback;
    this.waitingForPlayerInput.set(true);

    // Display first message
    const messageToDisplay = this.queuedInfoPanelMessages.shift();
    if (messageToDisplay) {
      this.showingMessage.set(true);
      this.messageText.set(messageToDisplay);
    }
  }

  handlePlayerInput(input: Direction | PlayerInput): void {
    if (this.waitingForPlayerInput() && (input === 'CANCEL' || input === 'OK')) {
      this.updateInfoPaneWithMessage();
      return;
    }

    if (input === 'CANCEL') {
      this.switchToMainBattleMenu();
      return;
    }

    if (input === 'OK') {
      if (this.activeBattleMenu() === ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
        this.handlePlayerChooseMainBattleOption();
        return;
      }
      if (this.activeBattleMenu() === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
        this.handlePlayerChooseAttack();
        return;
      }
      return;
    }

    this.updateSelectedBattleMenuOption(input);
    this.updateSelectedMoveMenuOption(input);
  }

  showMainBattleMenu(): void {
    this.activeBattleMenu.set(ACTIVE_BATTLE_MENU.BATTLE_MAIN);
    this.selectedBattleMenuOption.set(BATTLE_MENU_OPTIONS.FIGHT);
    this.selectedAttackIndex.set(undefined);
  }

  hideMainBattleMenu(): void {
    this.activeBattleMenu.set(null);
  }

  private updateSelectedBattleMenuOption(direction: Direction): void {
    if (this.activeBattleMenu() !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
      return;
    }

    const options = Object.values(BATTLE_MENU_OPTIONS);
    const currentIndex = options.indexOf(this.selectedBattleMenuOption());

    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    switch (direction) {
      case 'UP':
        newIndex = (currentIndex - 2 + options.length) % options.length;
        break;
      case 'DOWN':
        newIndex = (currentIndex + 2) % options.length;
        break;
      case 'LEFT':
        newIndex = (currentIndex - 1 + options.length) % options.length;
        break;
      case 'RIGHT':
        newIndex = (currentIndex + 1) % options.length;
        break;
    }

    this.selectedBattleMenuOption.set(options[newIndex]);
  }

  private updateSelectedMoveMenuOption(direction: Direction): void {
    if (this.activeBattleMenu() !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
      return;
    }

    const moves = this.activePlayerMonster()?.attacks || [];
    if (moves.length === 0) return;

    const options = Object.values(ATTACK_MOVE_OPTIONS).slice(0, moves.length);
    const currentIndex = options.indexOf(this.selectedAttackMenuOption());

    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    switch (direction) {
      case 'UP':
        newIndex = (currentIndex - 2 + options.length) % options.length;
        break;
      case 'DOWN':
        newIndex = (currentIndex + 2) % options.length;
        break;
      case 'LEFT':
        newIndex = (currentIndex - 1 + options.length) % options.length;
        break;
      case 'RIGHT':
        newIndex = (currentIndex + 1) % options.length;
        break;
    }

    this.selectedAttackMenuOption.set(options[newIndex]);
  }

  private handlePlayerChooseMainBattleOption(): void {
    this.hideMainBattleMenu();
    const selectedOption = this.selectedBattleMenuOption();

    if (selectedOption === BATTLE_MENU_OPTIONS.FIGHT) {
      this.activeBattleMenu.set(ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT);
      return;
    }

    // Handle other menu options...
  }

  private handlePlayerChooseAttack(): void {
    // Convert move option enum to array index directly
    const moveOptions = Object.values(ATTACK_MOVE_OPTIONS);
    const selectedMoveIndex = moveOptions.indexOf(this.selectedAttackMenuOption());

    // Only set index if it's valid
    if (selectedMoveIndex >= 0 && this.activePlayerMonster()?.attacks[selectedMoveIndex]) {
      this.selectedAttackIndex.set(selectedMoveIndex);
    }
  }

  private switchToMainBattleMenu(): void {
    this.waitingForPlayerInput.set(false);
    this.showMainBattleMenu();
  }

  private updateInfoPaneWithMessage(): void {
    if (this.queuedInfoPanelMessages.length === 0) {
      this.waitingForPlayerInput.set(false);
      this.showingMessage.set(false);
      this.messageText.set('');

      if (this.queuedInfoPanelCallback) {
        this.queuedInfoPanelCallback();
        this.queuedInfoPanelCallback = undefined;
      }
      return;
    }

    const messageToDisplay = this.queuedInfoPanelMessages.shift();
    if (messageToDisplay) {
      this.messageText.set(messageToDisplay);
    }
  }
}
