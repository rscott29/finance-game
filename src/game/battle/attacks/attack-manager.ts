import { exhaustiveGuard } from '../../../app/utils/guard';
import { ATTACK_KEYS, AttackKeys } from './attack-keys';

import { IceShard } from './ice-shard';
import { Slash } from './slash';

type AttackTarget = (typeof ATTACK_TARGET)[keyof typeof ATTACK_TARGET];

export const ATTACK_TARGET = {
  PLAYER: 'PLAYER',
  ENEMY: 'ENEMY',
} as const;

export class AttackManager {
  scene: Phaser.Scene;
  skipBattleAnimations: boolean;
  iceShardAttack: IceShard | undefined;
  slashAttack: Slash | undefined;
  constructor(scene: Phaser.Scene, skipBattleAnimations: boolean) {
    this.scene = scene;
    this.skipBattleAnimations = skipBattleAnimations;
  }

  playAttackAnimation(attack: AttackKeys, target: AttackTarget, callback: () => void) {
    if (this.skipBattleAnimations) {
      callback();
      return;
    }
    // if attack target is enemy
    let x = 745;
    let y = 140;
    if (target === ATTACK_TARGET.PLAYER) {
      x = 256;
      y = 344;
    }
    switch (attack) {
      case ATTACK_KEYS.ICE_SHARD:
        if (!this.iceShardAttack) {
          this.iceShardAttack = new IceShard(this.scene, { x, y });
        }
        this.iceShardAttack.gameObject?.setPosition(x, y);
        this.iceShardAttack.playAnimation(callback);
        break;
      case ATTACK_KEYS.SLASH:
        if (!this.slashAttack) {
          this.slashAttack = new Slash(this.scene, { x, y });
        }
        this.slashAttack.gameObject?.setPosition(x, y);
        this.slashAttack.playAnimation(callback);
        break;
      case ATTACK_KEYS.NONE:
        return;
      default:
        exhaustiveGuard(attack);
    }
  }
}
