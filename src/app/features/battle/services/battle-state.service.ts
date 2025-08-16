import { Injectable, computed, signal } from '@angular/core';
import { PlayerBattleMonster } from '../../../../game/battle/monsters/player-battle-monster';
import { EnemyBattleMonster } from '../../../../game/battle/monsters/enemy-battle-monster';
import { AttackManager } from '../../../../game/battle/attacks/attack-manager';
import { StateMachine } from '../../../utils/state-machine';

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

interface BattleStateContext {
  playerMonster: PlayerBattleMonster;
  enemyMonster: EnemyBattleMonster;
  attackManager: AttackManager;
  onStateChange?: (state: BattleState) => void;
}

@Injectable({
  providedIn: 'root',
})
export class BattleStateService {
  private currentState = signal<BattleState>('INTRO');
  private stateMachine: StateMachine | null = null;
  private attackManager: AttackManager | null = null;

  readonly currentState$ = this.currentState.asReadonly();

  readonly isPlayerTurn = computed(() => this.currentState() === BATTLE_STATES.PLAYER_INPUT);
  readonly isEnemyTurn = computed(() => this.currentState() === BATTLE_STATES.ENEMY_INPUT);
  readonly isBattleFinished = computed(() => this.currentState() === BATTLE_STATES.FINISHED);

  constructor() {
    this.initializeStateMachine();
  }

  initializeBattle(attackManager: AttackManager) {
    this.attackManager = attackManager;
    this.setState('INTRO');
  }

  setState(state: BattleState) {
    if (this.currentState() === state) return;
    console.log(`[BattleState] Transitioning from ${this.currentState()} to ${state}`);
    this.currentState.set(state);
  }

  private initializeStateMachine() {
    this.stateMachine = new StateMachine('battle', this);

    // Define state transitions
    const transitions = [
      { from: BATTLE_STATES.INTRO, to: BATTLE_STATES.PRE_BATTLE_INFO },
      { from: BATTLE_STATES.PRE_BATTLE_INFO, to: BATTLE_STATES.BRING_OUT_MONSTER },
      { from: BATTLE_STATES.BRING_OUT_MONSTER, to: BATTLE_STATES.PLAYER_INPUT },
      {
        from: BATTLE_STATES.PLAYER_INPUT,
        to: [BATTLE_STATES.ENEMY_INPUT, BATTLE_STATES.FLEE_ATTEMPT],
      },
      { from: BATTLE_STATES.ENEMY_INPUT, to: BATTLE_STATES.BATTLE },
      { from: BATTLE_STATES.BATTLE, to: BATTLE_STATES.POST_ATTACK_CHECK },
      {
        from: BATTLE_STATES.POST_ATTACK_CHECK,
        to: [BATTLE_STATES.PLAYER_INPUT, BATTLE_STATES.FINISHED],
      },
      { from: BATTLE_STATES.FLEE_ATTEMPT, to: BATTLE_STATES.FINISHED },
    ];

    // Add states with allowed transitions
    transitions.forEach(({ from, to }) => {
      this.stateMachine?.addState({
        name: from,
        onEnter: () => {
          this.setState(from);
          if (typeof to === 'string' && from !== to) {
            this.setState(to);
          }
        },
      });
    });
  }

  // Public methods for state changes
  startBattle() {
    this.setState(BATTLE_STATES.INTRO);
  }

  nextState(currentState = this.currentState()) {
    switch (currentState) {
      case BATTLE_STATES.INTRO:
        this.setState(BATTLE_STATES.PRE_BATTLE_INFO);
        break;
      case BATTLE_STATES.PRE_BATTLE_INFO:
        this.setState(BATTLE_STATES.BRING_OUT_MONSTER);
        break;
      case BATTLE_STATES.BRING_OUT_MONSTER:
        this.setState(BATTLE_STATES.PLAYER_INPUT);
        break;
      case BATTLE_STATES.PLAYER_INPUT:
        this.setState(BATTLE_STATES.ENEMY_INPUT);
        break;
      case BATTLE_STATES.ENEMY_INPUT:
        this.setState(BATTLE_STATES.BATTLE);
        break;
      case BATTLE_STATES.BATTLE:
        this.setState(BATTLE_STATES.POST_ATTACK_CHECK);
        break;
      case BATTLE_STATES.POST_ATTACK_CHECK:
        // State will be determined by battle menu service
        break;
      case BATTLE_STATES.FLEE_ATTEMPT:
        this.setState(BATTLE_STATES.FINISHED);
        break;
    }
  }

  attemptFlee() {
    this.setState(BATTLE_STATES.FLEE_ATTEMPT);
  }

  endBattle() {
    this.setState(BATTLE_STATES.FINISHED);
  }
}
