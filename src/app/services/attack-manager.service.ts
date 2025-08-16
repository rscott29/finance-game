import { Injectable } from '@angular/core';
import { IAttackManager } from './battle.interfaces';
import {
  ATTACK_TARGET,
  AttackManager as PhaserAttackManager,
} from '../../game/battle/attacks/attack-manager';
import { AttackKeys } from '../../game/battle/attacks/attack-keys';

@Injectable({
  providedIn: 'root',
})
export class AttackManagerService implements IAttackManager {
  private manager: PhaserAttackManager | null = null;

  initialize(scene: Phaser.Scene): void {
    this.manager = new PhaserAttackManager(scene, false);
  }

  cleanup(): void {
    this.manager = null;
  }

  playAttackAnimation(
    animationName: AttackKeys,
    target: keyof typeof ATTACK_TARGET,
    onComplete: () => void
  ): void {
    this.manager?.playAttackAnimation(animationName, ATTACK_TARGET[target], onComplete);
  }
}
