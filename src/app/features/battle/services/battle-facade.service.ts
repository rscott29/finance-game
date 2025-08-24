import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { AttackKeys } from '../../../../game/battle/attacks/attack-keys';
import { EventBus } from '../../../../game/EventBus';
import {
  IBattleFacade,
  IAttackManager,
  IBattleState,
  IBattleStats,
  BattleHealthState,
  ATTACK_MANAGER_TOKEN,
  BATTLE_STATE_TOKEN,
  BATTLE_STATS_TOKEN,
} from '../interfaces/battle.interfaces';

interface HealthState {
  current: number;
  max: number;
}

@Injectable({
  providedIn: 'root',
})
export class BattleFacadeService implements IBattleFacade {
  private playerHealthSubject = new BehaviorSubject<BattleHealthState>({ current: 0, max: 0 });
  private enemyHealthSubject = new BehaviorSubject<BattleHealthState>({ current: 0, max: 0 });
  private battleStateSubject = new BehaviorSubject<string>('IDLE');
  private battleActiveSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public readonly playerHealth$ = this.playerHealthSubject.asObservable();
  public readonly enemyHealth$ = this.enemyHealthSubject.asObservable();
  public readonly battleState$ = this.battleStateSubject.asObservable();
  public readonly battleActive$ = this.battleActiveSubject.asObservable();

  constructor(
    @Inject(ATTACK_MANAGER_TOKEN) private readonly attackManager: IAttackManager,
    @Inject(BATTLE_STATE_TOKEN) private readonly battleState: IBattleState,
    @Inject(BATTLE_STATS_TOKEN) private readonly battleStats: IBattleStats
  ) {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen to Phaser battle events
    EventBus.on('battle-started', () => {
      this.battleActiveSubject.next(true);
    });

    EventBus.on('battle-ended', () => {
      this.battleActiveSubject.next(false);
      this.battleStateSubject.next('IDLE');
    });

    EventBus.on('battle-state-changed', (state: string) => {
      this.battleStateSubject.next(state);
    });

    EventBus.on('player-health-changed', (health: BattleHealthState) => {
      this.playerHealthSubject.next(health);
    });

    EventBus.on('enemy-health-changed', (health: BattleHealthState) => {
      this.enemyHealthSubject.next(health);
    });
  }

  initializeBattle(scene: Phaser.Scene) {
    this.attackManager.initialize(scene);
    this.battleStats.reset();
    this.battleState.startBattle();
  }

  endBattle() {
    this.attackManager.cleanup();
    this.battleState.endBattle();
  }

  playAttack(attack: AttackKeys, target: 'PLAYER' | 'ENEMY', onComplete: () => void) {
    this.battleStats.setIsAnimating(true);
    this.attackManager.playAttackAnimation(attack, target, () => {
      this.battleStats.setIsAnimating(false);
      onComplete();
    });
  }

  // State machine transitions
  nextBattleState() {
    this.battleState.nextState();
  }

  attemptFlee() {
    this.battleState.attemptFlee();
  }

  // Stats management
  setEnemyHealth(health: number) {
    this.battleStats.setEnemyHealth(health);
  }

  setPlayerHealth(health: number) {
    this.battleStats.setPlayerHealth(health);
  }

  // Readonly state accessors
  get isPlayerTurn() {
    return this.battleState.isPlayerTurn;
  }
  get isEnemyTurn() {
    return this.battleState.isEnemyTurn;
  }
  get isBattleFinished() {
    return this.battleState.isBattleFinished;
  }

  get enemyHealth() {
    return this.battleStats.enemyHealth;
  }
  get playerHealth() {
    return this.battleStats.playerHealth;
  }
  get isAnimating() {
    return this.battleStats.isAnimating;
  }
  get currentState() {
    return this.battleState.currentState$;
  }

  // Current health state getters (synchronous access)
  get currentPlayerHealth() {
    return this.playerHealthSubject.value;
  }

  get currentEnemyHealth() {
    return this.enemyHealthSubject.value;
  }

  get currentBattleState() {
    return this.battleStateSubject.value;
  }

  get isBattleActive() {
    return this.battleActiveSubject.value;
  }

  // Cleanup method
  destroy() {
    EventBus.off('battle-started');
    EventBus.off('battle-ended');
    EventBus.off('battle-state-changed');
    EventBus.off('player-health-changed');
    EventBus.off('enemy-health-changed');
  }
}
