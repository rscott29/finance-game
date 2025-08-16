import { Injectable, Signal, signal, computed } from '@angular/core';
import { MONSTER_ASSET_KEYS } from '../../game/shared/asset-keys.enum';
import { PlayerBattleMonster } from '../../game/battle/monsters/player-battle-monster';
import { EnemyBattleMonster } from '../../game/battle/monsters/enemy-battle-monster';
import { BATTLE_MENU_OPTIONS } from '../../game/battle/ui/menu/battle-menu-config';
import {
  ACTIVE_BATTLE_MENU,
  ActiveBattleMenuOptions,
  ATTACK_MOVE_OPTIONS,
} from '../../game/battle/ui/menu/battle-menu-options';
import { Direction } from '../../game/shared/direction';
import { ATTACK_TARGET, AttackManager } from '../../game/battle/attacks/attack-manager';
import { ATTACK_KEYS } from '../../game/battle/attacks/attack-keys';

export const BATTLE_STATES = {
  INTRO: 'INTRO',
  PRE_BATTLE_INFO: 'PRE_BATTLE_INFO',
  BRING_OUT_MONSTER: 'BRING_OUT_MONSTER',
  PLAYER_INPUT: 'PLAYER_INPUT',
  ENEMY_INPUT: 'ENEMY_INPUT',
  BATTLE: 'BATTLE',
  POST_ATTACK_CHECK: 'POST_ATTACK_CHECK',
  FINISHED: 'FINISHED',
  FLEE_ATTEMPT: 'FLEE_ATTEMPT',
} as const;

export type BattleState = keyof typeof BATTLE_STATES;

@Injectable({
  providedIn: 'root',
})
export class BattleService {
  // State signals
  private battleState = signal<BattleState>(BATTLE_STATES.INTRO);
  private activePlayerMonster = signal<PlayerBattleMonster | null>(null);
  private activeEnemyMonster = signal<EnemyBattleMonster | null>(null);
  private selectedBattleMenuOption = signal<keyof typeof BATTLE_MENU_OPTIONS>(
    BATTLE_MENU_OPTIONS.FIGHT
  );
  private selectedAttackMenuOption = signal<keyof typeof ATTACK_MOVE_OPTIONS>(
    ATTACK_MOVE_OPTIONS.MOVE_1
  );
  private activeBattleMenu = signal<ActiveBattleMenuOptions | null>(null);
  private messageText = signal('');
  private showingMessage = signal(false);
  private waitingForInput = signal(false);
  private messageQueue: string[] = [];
  private messageCallback?: () => void;
  private scene: Phaser.Scene | null = null;
  private attackManager: AttackManager | null = null;

  // Public computed signals
  readonly battleState$ = this.battleState.asReadonly();
  readonly activePlayerMonster$ = this.activePlayerMonster.asReadonly();
  readonly activeEnemyMonster$ = this.activeEnemyMonster.asReadonly();
  readonly selectedBattleMenuOption$ = this.selectedBattleMenuOption.asReadonly();
  readonly selectedAttackMenuOption$ = this.selectedAttackMenuOption.asReadonly();
  readonly activeBattleMenu$ = this.activeBattleMenu.asReadonly();
  readonly messageText$ = this.messageText.asReadonly();
  readonly showingMessage$ = this.showingMessage.asReadonly();
  readonly waitingForInput$ = this.waitingForInput.asReadonly();

  // Computed states
  readonly isPlayerTurn = computed(() => this.battleState() === BATTLE_STATES.PLAYER_INPUT);
  readonly isEnemyTurn = computed(() => this.battleState() === BATTLE_STATES.ENEMY_INPUT);
  readonly isBattleFinished = computed(() => this.battleState() === BATTLE_STATES.FINISHED);

  initializeBattle(scene: Phaser.Scene) {
    this.scene = scene;
    this.attackManager = new AttackManager(scene, false);

    // Create monsters
    const enemyMonster = new EnemyBattleMonster({
      scene,
      monsterDetails: {
        name: MONSTER_ASSET_KEYS.CARNODUSK,
        assetKey: MONSTER_ASSET_KEYS.CARNODUSK,
        assetFrame: 0,
        currentHp: 25,
        maxHp: 25,
        attackIds: [1],
        baseAttack: 5,
        currentLevel: 5,
      },
      skipBattleAnimations: false,
    });

    const playerMonster = new PlayerBattleMonster({
      scene,
      monsterDetails: {
        name: MONSTER_ASSET_KEYS.IGUANIGNITE,
        assetKey: MONSTER_ASSET_KEYS.IGUANIGNITE,
        assetFrame: 0,
        currentHp: 25,
        maxHp: 25,
        attackIds: [1, 2],
        baseAttack: 15,
        currentLevel: 5,
      },
      skipBattleAnimations: false,
    });

    this.activeEnemyMonster.set(enemyMonster);
    this.activePlayerMonster.set(playerMonster);

    this.battleState.set(BATTLE_STATES.INTRO);
    this.startBattleSequence();
  }

  private startBattleSequence() {
    const enemyMonster = this.activeEnemyMonster();
    if (!enemyMonster) return;

    enemyMonster.playMonsterAppearAnimation(() => {
      enemyMonster.playMonsterHealthBarAppearAnimation(() => {
        this.showMessage([`Wild ${enemyMonster.name} appeared!`], () =>
          this.bringOutPlayerMonster()
        );
      });
    });
  }

  private bringOutPlayerMonster() {
    const playerMonster = this.activePlayerMonster();
    if (!playerMonster) return;

    playerMonster.playMonsterAppearAnimation(() => {
      playerMonster.playMonsterHealthBarAppearAnimation(() => {
        this.showMessage([`Go ${playerMonster.name}!`], () => {
          this.battleState.set(BATTLE_STATES.PLAYER_INPUT);
          this.showMainBattleMenu();
        });
      });
    });
  }

  // Message handling
  showMessage(messages: string[], callback?: () => void) {
    this.messageQueue = messages;
    this.messageCallback = callback;
    this.showNextMessage();
  }

  private showNextMessage() {
    const message = this.messageQueue.shift();
    if (message) {
      this.messageText.set(message);
      this.showingMessage.set(true);
      this.waitingForInput.set(true);
    } else {
      this.hideMessage();
      if (this.messageCallback) {
        this.messageCallback();
        this.messageCallback = undefined;
      }
    }
  }

  private hideMessage() {
    this.messageText.set('');
    this.showingMessage.set(false);
    this.waitingForInput.set(false);
  }

  // Menu handling
  showMainBattleMenu() {
    this.activeBattleMenu.set(ACTIVE_BATTLE_MENU.BATTLE_MAIN);
    this.selectedBattleMenuOption.set(BATTLE_MENU_OPTIONS.FIGHT);
  }

  handleInput(input: Direction | 'OK' | 'CANCEL') {
    if (this.waitingForInput()) {
      if (input === 'OK' || input === 'CANCEL') {
        this.showNextMessage();
      }
      return;
    }

    if (input === 'CANCEL') {
      this.showMainBattleMenu();
      return;
    }

    if (input === 'OK') {
      this.handleMenuSelection();
      return;
    }

    this.updateMenuSelection(input);
  }

  private handleMenuSelection() {
    if (this.activeBattleMenu() === ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
      const option = this.selectedBattleMenuOption();
      if (option === BATTLE_MENU_OPTIONS.FIGHT) {
        this.activeBattleMenu.set(ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT);
      } else if (option === BATTLE_MENU_OPTIONS.FLEE) {
        this.attemptFlee();
      }
    } else if (this.activeBattleMenu() === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
      this.executeSelectedAttack();
    }
  }

  private updateMenuSelection(direction: Direction) {
    const menu = this.activeBattleMenu();
    if (!menu) return;

    if (menu === ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
      this.updateMainMenuSelection(direction);
    } else if (menu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
      this.updateAttackMenuSelection(direction);
    }
  }

  private updateMainMenuSelection(direction: Direction) {
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

  private updateAttackMenuSelection(direction: Direction) {
    const playerMonster = this.activePlayerMonster();
    if (!playerMonster) return;

    const attacks = playerMonster.attacks;
    const options = Object.values(ATTACK_MOVE_OPTIONS).slice(0, attacks.length);
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

  // Battle actions
  private executeSelectedAttack() {
    const playerMonster = this.activePlayerMonster();
    const enemyMonster = this.activeEnemyMonster();
    if (!playerMonster || !enemyMonster || !this.attackManager) return;

    const moveOptions = Object.values(ATTACK_MOVE_OPTIONS);
    const attackIndex = moveOptions.indexOf(this.selectedAttackMenuOption());
    const attack = playerMonster.attacks[attackIndex];

    if (!attack) return;

    this.activeBattleMenu.set(null);
    this.battleState.set(BATTLE_STATES.BATTLE);

    this.showMessage([`${playerMonster.name} used ${attack.name}!`], () => {
      this.attackManager?.playAttackAnimation(
        attack.animationName ?? ATTACK_KEYS.NONE,
        ATTACK_TARGET.ENEMY,
        () => {
          enemyMonster.playTakeDamageAnimation(() => {
            enemyMonster.takeDamage(playerMonster.baseAttack, () => {
              if (enemyMonster.isFainted) {
                this.handleEnemyDefeat();
              } else {
                this.executeEnemyAttack();
              }
            });
          });
        }
      );
    });
  }

  private executeEnemyAttack() {
    const playerMonster = this.activePlayerMonster();
    const enemyMonster = this.activeEnemyMonster();
    if (!playerMonster || !enemyMonster || !this.attackManager) return;

    const attack = enemyMonster.attacks[0];
    this.showMessage([`Foe ${enemyMonster.name} used ${attack.name}!`], () => {
      this.attackManager?.playAttackAnimation(
        attack.animationName ?? ATTACK_KEYS.NONE,
        ATTACK_TARGET.PLAYER,
        () => {
          playerMonster.playTakeDamageAnimation(() => {
            playerMonster.takeDamage(enemyMonster.baseAttack, () => {
              if (playerMonster.isFainted) {
                this.handlePlayerDefeat();
              } else {
                this.battleState.set(BATTLE_STATES.PLAYER_INPUT);
                this.showMainBattleMenu();
              }
            });
          });
        }
      );
    });
  }

  private handleEnemyDefeat() {
    const enemyMonster = this.activeEnemyMonster();
    if (!enemyMonster) return;

    enemyMonster.playDeathAnimation(() => {
      this.showMessage(
        [`Wild ${enemyMonster.name} fainted!`, 'You have gained some experience'],
        () => this.endBattle()
      );
    });
  }

  private handlePlayerDefeat() {
    const playerMonster = this.activePlayerMonster();
    if (!playerMonster) return;

    playerMonster.playDeathAnimation(() => {
      this.showMessage(
        [`${playerMonster.name} fainted!`, 'You have no more monsters, escaping to safety...'],
        () => this.endBattle()
      );
    });
  }

  private attemptFlee() {
    this.showMessage(['You got away safely!'], () => this.endBattle());
  }

  private endBattle() {
    this.battleState.set(BATTLE_STATES.FINISHED);
    if (this.scene) {
      this.scene.cameras.main.fadeOut(600, 0, 0, 0);
      this.scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene?.scene.start('WorldScene');
      });
    }
  }
}
