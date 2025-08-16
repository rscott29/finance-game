import { Scene } from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { MONSTER_ASSET_KEYS } from '../shared/asset-keys.enum';
import { BattleMenu } from '../battle/ui/menu/battle-menu';
import { Background } from '../battle/ui/background';

import { EnemyBattleMonster } from '../battle/monsters/enemy-battle-monster';
import { PlayerBattleMonster } from '../battle/monsters/player-battle-monster';
import { StateMachine } from '../../app/utils/state-machine';
import { SKIP_BATTLE_ANIMIATIONS } from '../../config';
import { ATTACK_TARGET, AttackManager } from '../battle/attacks/attack-manager';
import { ATTACK_KEYS } from '../battle/attacks/attack-keys';
import { createSceneTransition } from '../../app/utils/scene-transition';
import { DIRECTION, Direction } from '../shared/direction';
import { Controls } from '../../app/utils/controls';

const BATTLE_STATES = {
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

export class BattleScene extends Scene {
  battleMenu: BattleMenu | null = null;
  controls: Controls | undefined;
  activeEnemyMonster: EnemyBattleMonster | undefined;
  activePlayerMonster: PlayerBattleMonster | undefined;
  activePlayerAttackIndex: number;
  battleStateMachine: StateMachine | undefined;
  attackManager: AttackManager | undefined;
  constructor() {
    super({ key: SCENE_KEYS.BATTLE_SCENE });
    this.activePlayerAttackIndex = -1;
  }
  init() {}
  create() {
    // render out the player and enemy monsters
    const background = new Background(this);
    background.showForest();
    this.activeEnemyMonster = new EnemyBattleMonster({
      scene: this,
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
      skipBattleAnimations: SKIP_BATTLE_ANIMIATIONS,
    });
    this.activePlayerMonster = new PlayerBattleMonster({
      scene: this,
      monsterDetails: {
        name: MONSTER_ASSET_KEYS.IGUANIGNITE,
        assetKey: MONSTER_ASSET_KEYS.IGUANIGNITE,
        assetFrame: 0,
        currentHp: 15,
        maxHp: 25,
        attackIds: [2, 1],
        baseAttack: 15,
        currentLevel: 5,
      },
      skipBattleAnimations: SKIP_BATTLE_ANIMIATIONS,
    });

    // render out the main info and sub info panes
    this.battleMenu = new BattleMenu(this, this.activePlayerMonster);

    this.createBattleStateMachine();
    this.attackManager = new AttackManager(this, SKIP_BATTLE_ANIMIATIONS);
    this.controls = new Controls(this);
  }
  override update() {
    this.battleStateMachine?.update();
    const wasSpaceKeyPressed = this.controls?.wasSpaceKeyPressed();

    if (
      wasSpaceKeyPressed &&
      (this.battleStateMachine?.currentStateName === BATTLE_STATES.PRE_BATTLE_INFO ||
        this.battleStateMachine?.currentStateName === BATTLE_STATES.POST_ATTACK_CHECK ||
        this.battleStateMachine?.currentStateName === BATTLE_STATES.FLEE_ATTEMPT)
    ) {
      this.battleMenu?.handlePlayerInput('OK');
      return;
    }
    if (this.battleStateMachine?.currentStateName !== BATTLE_STATES.PLAYER_INPUT) {
      return;
    }
    if (wasSpaceKeyPressed) {
      this.battleMenu?.handlePlayerInput('OK');
      if (this.battleMenu?.selectedAttack === undefined) {
        return;
      }
      this.activePlayerAttackIndex = this.battleMenu.selectedAttack;
      if (!this.activePlayerMonster?.attacks[this.activePlayerAttackIndex]) {
        return;
      }
      this.battleMenu?.hideMonsterAttackSubMenu();
      this.battleStateMachine?.setState(BATTLE_STATES.ENEMY_INPUT);
    }

    if (this.controls?.wasBackKeyPressed()) {
      this.battleMenu?.handlePlayerInput('CANCEL');
      return;
    }
    const selectedDirection = this.controls?.getDirectionKeyJustPressed();

    if (selectedDirection !== DIRECTION.NONE) {
      this.battleMenu?.handlePlayerInput(selectedDirection ?? DIRECTION.NONE);
      return;
    }
  }

  private playerAttack() {
    this.battleMenu?.updateInfoPaneMessageNoInputRequired(
      `${this.activePlayerMonster?.name} used ${
        this.activePlayerMonster?.attacks[this.activePlayerAttackIndex].name
      }`,
      () => {
        this.time.delayedCall(500, () => {
          this.attackManager?.playAttackAnimation(
            this.activePlayerMonster?.attacks[this.activePlayerAttackIndex].animationName ??
              ATTACK_KEYS.NONE,
            ATTACK_TARGET.ENEMY,
            () => {
              this.activeEnemyMonster?.playTakeDamageAnimation(() => {
                this.activeEnemyMonster?.takeDamage(
                  this.activePlayerMonster?.baseAttack ?? 0,
                  () => {
                    this.enemyAttack();
                  }
                );
              });
            }
          );
        });
      },
      SKIP_BATTLE_ANIMIATIONS
    );
  }

  private enemyAttack() {
    if (this.activeEnemyMonster?.isFainted) {
      this.battleStateMachine?.setState(BATTLE_STATES.POST_ATTACK_CHECK);
      return;
    }

    this.battleMenu?.updateInfoPaneMessageNoInputRequired(
      `foe ${this.activeEnemyMonster?.name} used ${this.activeEnemyMonster?.attacks[0].name}`,
      () => {
        this.time.delayedCall(500, () => {
          this.attackManager?.playAttackAnimation(
            this.activeEnemyMonster?.attacks[0].animationName ?? ATTACK_KEYS.NONE,
            ATTACK_TARGET.PLAYER,
            () => {
              this.activePlayerMonster?.playTakeDamageAnimation(() => {
                this.activePlayerMonster?.takeDamage(
                  this.activeEnemyMonster?.baseAttack || 0,
                  () => {
                    this.battleStateMachine?.setState(BATTLE_STATES.POST_ATTACK_CHECK);
                  }
                );
              });
            }
          );
        });
      },
      SKIP_BATTLE_ANIMIATIONS
    );
  }

  private postBattleSequenceCheck() {
    if (this.activeEnemyMonster?.isFainted) {
      this.activeEnemyMonster?.playDeathAnimation(() => {
        this.battleMenu?.updateInfoPaneMessagesAndWaitForInput(
          [`Wild ${this.activeEnemyMonster?.name} fainted`, 'You have gained some experience'],
          () => {
            this.battleStateMachine?.setState(BATTLE_STATES.FINISHED);
          },
          SKIP_BATTLE_ANIMIATIONS
        );
      });
      return;
    }

    if (this.activePlayerMonster?.isFainted) {
      this.activePlayerMonster?.playDeathAnimation(() => {
        this.battleMenu?.updateInfoPaneMessagesAndWaitForInput(
          [
            `${this.activePlayerMonster?.name} fainted`,
            'You have no more monsters, escaping to safety...',
          ],
          () => {
            this.battleStateMachine?.setState(BATTLE_STATES.FINISHED);
          },
          SKIP_BATTLE_ANIMIATIONS
        );
      });
      return;
    }

    this.battleStateMachine?.setState(BATTLE_STATES.PLAYER_INPUT);
  }
  private transitionToNextScene() {
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SCENE_KEYS.WORLD_SCENE);
    });
  }

  private createBattleStateMachine() {
    this.battleStateMachine = new StateMachine('battle', this);

    this.battleStateMachine.addState({
      name: BATTLE_STATES.INTRO,
      onEnter: () => {
        // wait for any scene setup and transitions to complete
        createSceneTransition(this, {
          skipSceneTransition: SKIP_BATTLE_ANIMIATIONS,
          callback: () => {
            this.battleStateMachine?.setState(BATTLE_STATES.PRE_BATTLE_INFO);
          },
        });
      },
    });

    this.battleStateMachine.addState({
      name: BATTLE_STATES.PRE_BATTLE_INFO,
      onEnter: () => {
        // wait for enemy monster to appear on the screen and notify player about the wild monster
        this.activeEnemyMonster?.playMonsterAppearAnimation(() => {
          this.activeEnemyMonster?.playMonsterHealthBarAppearAnimation(() => undefined);
          this.battleMenu?.updateInfoPaneMessagesAndWaitForInput(
            [`wild ${this.activeEnemyMonster?.name} appeared!`],
            () => {
              this.battleStateMachine?.setState(BATTLE_STATES.BRING_OUT_MONSTER);
            },
            SKIP_BATTLE_ANIMIATIONS
          );
        });
      },
    });

    this.battleStateMachine.addState({
      name: BATTLE_STATES.BRING_OUT_MONSTER,
      onEnter: () => {
        // wait for player monster to appear on the screen and notify the player about monster
        this.activePlayerMonster?.playMonsterAppearAnimation(() => {
          this.activePlayerMonster?.playMonsterHealthBarAppearAnimation(() => undefined);
          this.battleMenu?.updateInfoPaneMessageNoInputRequired(
            `go ${this.activePlayerMonster?.name}!`,
            () => {
              // wait for text animation to complete and move to next state
              this.time.delayedCall(1200, () => {
                this.battleStateMachine?.setState(BATTLE_STATES.PLAYER_INPUT);
              });
            },
            SKIP_BATTLE_ANIMIATIONS
          );
        });
      },
    });

    this.battleStateMachine.addState({
      name: BATTLE_STATES.PLAYER_INPUT,
      onEnter: () => {
        this.battleMenu?.showMainBattleMenu();
      },
    });

    this.battleStateMachine.addState({
      name: BATTLE_STATES.ENEMY_INPUT,
      onEnter: () => {
        // TODO: add feature in a future update
        // pick a random move for the enemy monster, and in the future implement some type of AI behavior
        this.battleStateMachine?.setState(BATTLE_STATES.BATTLE);
      },
    });

    this.battleStateMachine.addState({
      name: BATTLE_STATES.BATTLE,
      onEnter: () => {
        // general battle flow
        // show attack used, brief pause
        // then play attack animation, brief pause
        // then play damage animation, brief pause
        // then play health bar animation, brief pause
        // then repeat the steps above for the other monster

        this.playerAttack();
      },
    });

    this.battleStateMachine.addState({
      name: BATTLE_STATES.POST_ATTACK_CHECK,
      onEnter: () => {
        this.postBattleSequenceCheck();
      },
    });

    this.battleStateMachine.addState({
      name: BATTLE_STATES.FINISHED,
      onEnter: () => {
        this.transitionToNextScene();
      },
    });

    this.battleStateMachine.addState({
      name: BATTLE_STATES.FLEE_ATTEMPT,
      onEnter: () => {
        this.battleMenu?.updateInfoPaneMessagesAndWaitForInput(
          [`You got away safely!`],
          () => {
            this.battleStateMachine?.setState(BATTLE_STATES.FINISHED);
          },
          SKIP_BATTLE_ANIMIATIONS
        );
      },
    });

    // start the state machine
    this.battleStateMachine.setState('INTRO');
  }
}
