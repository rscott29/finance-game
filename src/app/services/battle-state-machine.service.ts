import { Injectable, signal } from '@angular/core';
import { ATTACK_TARGET, AttackManager } from '../../game/battle/attacks/attack-manager';
import { BattleMenuService } from './battle-menu.service';
import { MonsterFactoryService } from './monster-factory.service';
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

type StateHandler = {
  onEnter: () => void;
};

@Injectable({
  providedIn: 'root',
})
export class BattleStateMachineService {
  private currentState = signal<BattleState>('INTRO');
  private stateHandlers = new Map<BattleState, StateHandler>();
  private scene: Phaser.Scene | null = null;
  private attackManager: AttackManager | null = null;

  readonly currentState$ = this.currentState.asReadonly();

  constructor(
    private monsterFactory: MonsterFactoryService,
    private battleMenuService: BattleMenuService
  ) {
    this.initializeStateHandlers();
  }

  initializeBattle(scene: Phaser.Scene, attackManager: AttackManager) {
    this.scene = scene;
    this.attackManager = attackManager;
    this.setState('INTRO');
  }

  setState(state: BattleState) {
    if (this.currentState() === state) return;

    console.log(`[BattleStateMachine] Transitioning from ${this.currentState()} to ${state}`);
    this.currentState.set(state);

    const handler = this.stateHandlers.get(state);
    if (handler) {
      handler.onEnter();
    }
  }

  private initializeStateHandlers() {
    // INTRO State
    this.stateHandlers.set('INTRO', {
      onEnter: () => {
        // Initialize monsters using the factory
        const scene = this.scene;
        if (!scene) return;

        this.setState('PRE_BATTLE_INFO');
      },
    });

    // PRE_BATTLE_INFO State
    this.stateHandlers.set('PRE_BATTLE_INFO', {
      onEnter: () => {
        const scene = this.scene;
        if (!scene) return;

        const enemyMonster = this.monsterFactory.createEnemyMonster(scene);
        enemyMonster.playMonsterAppearAnimation(() => {
          enemyMonster.playMonsterHealthBarAppearAnimation(() => {
            this.battleMenuService.showMessage([`wild ${enemyMonster.name} appeared!`], () =>
              this.setState('BRING_OUT_MONSTER')
            );
          });
        });
      },
    });

    // BRING_OUT_MONSTER State
    this.stateHandlers.set('BRING_OUT_MONSTER', {
      onEnter: () => {
        const scene = this.scene;
        if (!scene) return;

        const playerMonster = this.monsterFactory.createPlayerMonster(scene);
        playerMonster.playMonsterAppearAnimation(() => {
          playerMonster.playMonsterHealthBarAppearAnimation(() => {
            this.battleMenuService.showMessage([`go ${playerMonster.name}!`], () => {
              scene.time.delayedCall(1200, () => {
                this.setState('PLAYER_INPUT');
              });
            });
          });
        });
      },
    });

    // PLAYER_INPUT State
    this.stateHandlers.set('PLAYER_INPUT', {
      onEnter: () => {
        this.battleMenuService.showMainBattleMenu();
      },
    });

    // ENEMY_INPUT State
    this.stateHandlers.set('ENEMY_INPUT', {
      onEnter: () => {
        // For now, just move to battle state
        // In future, implement AI decision making here
        this.setState('BATTLE');
      },
    });

    // BATTLE State
    this.stateHandlers.set('BATTLE', {
      onEnter: () => {
        this.executePlayerAttack();
      },
    });

    // POST_ATTACK_CHECK State
    this.stateHandlers.set('POST_ATTACK_CHECK', {
      onEnter: () => {
        const status = this.battleMenuService.checkBattleStatus();
        switch (status) {
          case 'PLAYER_WIN':
            this.handleEnemyDefeat();
            break;
          case 'ENEMY_WIN':
            this.handlePlayerDefeat();
            break;
          default:
            this.setState('PLAYER_INPUT');
            break;
        }
      },
    });

    // FINISHED State
    this.stateHandlers.set('FINISHED', {
      onEnter: () => {
        const scene = this.scene;
        if (!scene) return;

        scene.cameras.main.fadeOut(600, 0, 0, 0);
        scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
          scene.scene.start('WorldScene');
        });
      },
    });

    // FLEE_ATTEMPT State
    this.stateHandlers.set('FLEE_ATTEMPT', {
      onEnter: () => {
        this.battleMenuService.showMessage(['You got away safely!'], () =>
          this.setState('FINISHED')
        );
      },
    });
  }

  private executePlayerAttack() {
    const attack = this.battleMenuService.getSelectedAttack();
    const attackManager = this.attackManager;
    const scene = this.scene;

    if (!attack || !attackManager || !scene) return;

    this.battleMenuService.showMessage(
      [`${this.battleMenuService.activePlayerMonster()?.name} used ${attack.name}`],
      () => {
        scene.time.delayedCall(500, () => {
          attackManager.playAttackAnimation(
            attack.animationName ?? ATTACK_KEYS.NONE,
            ATTACK_TARGET.ENEMY,
            () => {
              const enemyMonster = this.battleMenuService.activeEnemyMonster();
              const playerMonster = this.battleMenuService.activePlayerMonster();
              if (!enemyMonster || !playerMonster) return;

              enemyMonster.playTakeDamageAnimation(() => {
                enemyMonster.takeDamage(playerMonster.baseAttack ?? 0, () =>
                  this.executeEnemyAttack()
                );
              });
            }
          );
        });
      }
    );
  }

  private executeEnemyAttack() {
    const enemyMonster = this.battleMenuService.activeEnemyMonster();
    const playerMonster = this.battleMenuService.activePlayerMonster();
    const attackManager = this.attackManager;
    const scene = this.scene;

    if (!enemyMonster || !playerMonster || !attackManager || !scene) return;

    if (enemyMonster.isFainted) {
      this.setState('POST_ATTACK_CHECK');
      return;
    }

    this.battleMenuService.showMessage(
      [`foe ${enemyMonster.name} used ${enemyMonster.attacks[0].name}`],
      () => {
        scene.time.delayedCall(500, () => {
          attackManager.playAttackAnimation(
            enemyMonster.attacks[0].animationName ?? ATTACK_KEYS.NONE,
            ATTACK_TARGET.PLAYER,
            () => {
              playerMonster.playTakeDamageAnimation(() => {
                playerMonster.takeDamage(enemyMonster.baseAttack || 0, () =>
                  this.setState('POST_ATTACK_CHECK')
                );
              });
            }
          );
        });
      }
    );
  }

  private handleEnemyDefeat() {
    const enemyMonster = this.battleMenuService.activeEnemyMonster();
    if (!enemyMonster) return;

    enemyMonster.playDeathAnimation(() => {
      this.battleMenuService.showMessage(
        [`Wild ${enemyMonster.name} fainted`, 'You have gained some experience'],
        () => this.setState('FINISHED')
      );
    });
  }

  private handlePlayerDefeat() {
    const playerMonster = this.battleMenuService.activePlayerMonster();
    if (!playerMonster) return;

    playerMonster.playDeathAnimation(() => {
      this.battleMenuService.showMessage(
        [`${playerMonster.name} fainted`, 'You have no more monsters, escaping to safety...'],
        () => this.setState('FINISHED')
      );
    });
  }
}
