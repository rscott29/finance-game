import { Injectable } from '@angular/core';
import { AttackManagerService } from './attack-manager.service';
import { BattleStateService } from './battle-state.service';
import { BattleStatsService } from './battle-stats.service';
import { AttackKeys } from '../../game/battle/attacks/attack-keys';

@Injectable({
  providedIn: 'root',
})
export class BattleFacadeService {
  constructor(
    private readonly attackManager: AttackManagerService,
    private readonly battleState: BattleStateService,
    private readonly battleStats: BattleStatsService
  ) {}

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
}
