import { Injectable } from '@angular/core';
import { MONSTER_ASSET_KEYS } from '../../game/shared/asset-keys.enum';
import { ATTACK_TARGET, AttackManager } from '../../game/battle/attacks/attack-manager';
import { ATTACK_KEYS } from '../../game/battle/attacks/attack-keys';
import { BattleMenuService } from './battle-menu.service';
import { BattleStateService } from './battle-state.service';

@Injectable({
  providedIn: 'root',
})
export class BattleAnimationService {
  private attackManager: AttackManager | null = null;

  constructor(private battleMenu: BattleMenuService, private battleState: BattleStateService) {}

  initialize(scene: Phaser.Scene) {
    this.attackManager = new AttackManager(scene, false);
  }

  cleanup() {
    this.attackManager = null;
  }

  playAttackSequence() {
    const playerMonster = this.battleMenu.activePlayerMonster();
    const enemyMonster = this.battleMenu.activeEnemyMonster();
    const selectedAttack = this.battleMenu.getSelectedAttack();

    if (!playerMonster || !enemyMonster || !selectedAttack || !this.attackManager) {
      this.battleState.nextState();
      return;
    }

    // Show attack message
    this.battleMenu.showMessage([`${playerMonster.name} used ${selectedAttack.name}!`], () => {
      // Play attack animation
      this.attackManager?.playAttackAnimation(
        selectedAttack.animationName ?? ATTACK_KEYS.NONE,
        ATTACK_TARGET.ENEMY,
        () => this.handleEnemyDamage(playerMonster.baseAttack)
      );
    });
  }

  private handleEnemyDamage(damage: number) {
    const enemyMonster = this.battleMenu.activeEnemyMonster();
    if (!enemyMonster) return;

    enemyMonster.playTakeDamageAnimation(() => {
      enemyMonster.takeDamage(damage, () => {
        if (enemyMonster.isFainted) {
          this.handleEnemyDefeat();
        } else {
          this.playEnemyAttack();
        }
      });
    });
  }

  private handleEnemyDefeat() {
    const enemyMonster = this.battleMenu.activeEnemyMonster();
    if (!enemyMonster) return;

    enemyMonster.playDeathAnimation(() => {
      this.battleMenu.showMessage(
        [`Wild ${enemyMonster.name} fainted!`, 'You have gained some experience'],
        () => this.battleState.endBattle()
      );
    });
  }

  private playEnemyAttack() {
    const playerMonster = this.battleMenu.activePlayerMonster();
    const enemyMonster = this.battleMenu.activeEnemyMonster();
    if (!playerMonster || !enemyMonster) return;

    const enemyAttack = enemyMonster.attacks[0];
    this.battleMenu.showMessage([`Foe ${enemyMonster.name} used ${enemyAttack.name}!`], () => {
      if (!this.attackManager) return;

      this.attackManager.playAttackAnimation(
        enemyAttack.animationName ?? ATTACK_KEYS.NONE,
        ATTACK_TARGET.PLAYER,
        () => this.handlePlayerDamage(enemyMonster.baseAttack)
      );
    });
  }

  private handlePlayerDamage(damage: number) {
    const playerMonster = this.battleMenu.activePlayerMonster();
    if (!playerMonster) return;

    playerMonster.playTakeDamageAnimation(() => {
      playerMonster.takeDamage(damage, () => {
        if (playerMonster.isFainted) {
          this.handlePlayerDefeat();
        } else {
          this.battleState.nextState();
        }
      });
    });
  }

  private handlePlayerDefeat() {
    const playerMonster = this.battleMenu.activePlayerMonster();
    if (!playerMonster) return;

    playerMonster.playDeathAnimation(() => {
      this.battleMenu.showMessage(
        [`${playerMonster.name} fainted!`, 'You have no more monsters, escaping to safety...'],
        () => this.battleState.endBattle()
      );
    });
  }

  playMonsterAppearAnimations() {
    const playerMonster = this.battleMenu.activePlayerMonster();
    const enemyMonster = this.battleMenu.activeEnemyMonster();

    if (!playerMonster || !enemyMonster) {
      this.battleState.nextState();
      return;
    }

    // Enemy appears first
    enemyMonster.playMonsterAppearAnimation(() => {
      enemyMonster.playMonsterHealthBarAppearAnimation(() => {
        this.battleMenu.showMessage([`Wild ${enemyMonster.name} appeared!`], () => {
          // Then player monster appears
          playerMonster.playMonsterAppearAnimation(() => {
            playerMonster.playMonsterHealthBarAppearAnimation(() => {
              this.battleMenu.showMessage([`Go ${playerMonster.name}!`], () =>
                this.battleState.nextState()
              );
            });
          });
        });
      });
    });
  }
}
