import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { AttackKeys } from '../../../../game/battle/attacks/attack-keys';

// Battle state interfaces
export interface BattleHealthState {
  current: number;
  max: number;
}

export interface BattleStateData {
  playerHealth: BattleHealthState;
  enemyHealth: BattleHealthState;
  currentState: string;
  isActive: boolean;
  isPlayerTurn: boolean;
  isEnemyTurn: boolean;
  isAnimating: boolean;
}

// Battle facade interface
export interface IBattleFacade {
  // Observables
  readonly playerHealth$: Observable<BattleHealthState>;
  readonly enemyHealth$: Observable<BattleHealthState>;
  readonly battleState$: Observable<string>;
  readonly battleActive$: Observable<boolean>;

  // State methods (Signal-based)
  isPlayerTurn(): boolean;
  isAnimating(): boolean;

  // Battle management
  initializeBattle(scene: Phaser.Scene): void;
  endBattle(): void;

  // Attack system
  playAttack(attack: AttackKeys, target: 'PLAYER' | 'ENEMY', onComplete: () => void): void;

  // State management
  nextBattleState(): void;
  attemptFlee(): void;
  setEnemyHealth(health: number): void;
  setPlayerHealth(health: number): void;

  // State accessors (as methods to match Signal implementation)
  isPlayerTurn(): boolean;
  isEnemyTurn(): boolean;
  isBattleFinished(): boolean;
  enemyHealth(): number;
  playerHealth(): number;
  isAnimating(): boolean;
  currentState(): string;

  // Current state getters
  readonly currentPlayerHealth: BattleHealthState;
  readonly currentEnemyHealth: BattleHealthState;
  readonly currentBattleState: string;
  readonly isBattleActive: boolean;

  // Cleanup
  destroy(): void;
}

// Attack manager interface
export interface IAttackManager {
  initialize(scene: Phaser.Scene): void;
  cleanup(): void;
  playAttackAnimation(attack: AttackKeys, target: 'PLAYER' | 'ENEMY', onComplete: () => void): void;
}

// Battle state service interface
export interface IBattleState {
  readonly currentState$: any; // Signal or Observable
  readonly isPlayerTurn: any; // Signal or boolean
  readonly isEnemyTurn: any; // Signal or boolean
  readonly isBattleFinished: any; // Signal or boolean

  startBattle(): void;
  endBattle(): void;
  nextState(): void;
  attemptFlee(): void;
}

// Battle stats service interface
export interface IBattleStats {
  readonly enemyHealth: any; // Signal or number
  readonly playerHealth: any; // Signal or number
  readonly isAnimating: any; // Signal or boolean

  reset(): void;
  setEnemyHealth(health: number): void;
  setPlayerHealth(health: number): void;
  setIsAnimating(isAnimating: boolean): void;
}

// Injection tokens
export const BATTLE_FACADE_TOKEN = new InjectionToken<IBattleFacade>('BattleFacade');
export const ATTACK_MANAGER_TOKEN = new InjectionToken<IAttackManager>('AttackManager');
export const BATTLE_STATE_TOKEN = new InjectionToken<IBattleState>('BattleState');
export const BATTLE_STATS_TOKEN = new InjectionToken<IBattleStats>('BattleStats');
