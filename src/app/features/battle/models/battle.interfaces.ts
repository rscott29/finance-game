import { InjectionToken } from '@angular/core';
import { PlayerBattleMonster } from '../../../../game/battle/monsters/player-battle-monster';
import { EnemyBattleMonster } from '../../../../game/battle/monsters/enemy-battle-monster';
import { Attack } from '../../../../game/battle/attacks/attack';
import { Direction } from '../../../../shared/constants/direction';
import { Signal } from '@angular/core';
import { BATTLE_STATES } from '../services/battle-state.service';

// Attack Manager Interface
export interface IAttackManager {
  initialize(scene: Phaser.Scene): void;
  cleanup(): void;
  playAttackAnimation(animationName: string, target: string, onComplete: () => void): void;
}

// Battle State Interface
export interface IBattleState {
  readonly battleState$: Signal<keyof typeof BATTLE_STATES>;
  readonly isPlayerTurn: Signal<boolean>;
  readonly isEnemyTurn: Signal<boolean>;
  readonly isBattleFinished: Signal<boolean>;
  setState(state: keyof typeof BATTLE_STATES): void;
  endBattle(): void;
  nextState(): void;
}

// Battle Menu Interface
export interface IBattleMenu {
  readonly messageText$: Signal<string>;
  readonly showingMessage$: Signal<boolean>;
  readonly waitingForInput$: Signal<boolean>;
  showMessage(messages: string[], callback?: () => void): void;
  handleInput(input: Direction | 'OK' | 'CANCEL'): void;
  showMainBattleMenu(): void;
}

// Monster Management Interface
export interface IMonsterManager {
  readonly activePlayerMonster$: Signal<PlayerBattleMonster | null>;
  readonly activeEnemyMonster$: Signal<EnemyBattleMonster | null>;
  createMonsters(scene: Phaser.Scene): void;
  getSelectedAttack(): Attack | undefined;
}

// Battle Animation Interface
export interface IBattleAnimation {
  initialize(scene: Phaser.Scene): void;
  cleanup(): void;
  playAttackSequence(): void;
  playMonsterAppearAnimations(): void;
}

// Injection Tokens
export const ATTACK_MANAGER = new InjectionToken<IAttackManager>('ATTACK_MANAGER');
export const BATTLE_STATE = new InjectionToken<IBattleState>('BATTLE_STATE');
export const BATTLE_MENU = new InjectionToken<IBattleMenu>('BATTLE_MENU');
export const MONSTER_MANAGER = new InjectionToken<IMonsterManager>('MONSTER_MANAGER');
export const BATTLE_ANIMATION = new InjectionToken<IBattleAnimation>('BATTLE_ANIMATION');
