import { Injectable } from '@angular/core';
import { MONSTER_ASSET_KEYS } from '../../../game/shared/asset-keys.enum';
import { EnemyBattleMonster } from '../../../game/battle/monsters/enemy-battle-monster';
import { PlayerBattleMonster } from '../../../game/battle/monsters/player-battle-monster';
import { SKIP_BATTLE_ANIMIATIONS } from '../../../config';

export interface MonsterConfig {
  scene: Phaser.Scene;
  name: string;
  assetKey: string;
  assetFrame: number;
  currentHp: number;
  maxHp: number;
  attackIds: number[];
  baseAttack: number;
  currentLevel: number;
}

@Injectable({
  providedIn: 'root',
})
export class MonsterFactoryService {
  createEnemyMonster(scene: Phaser.Scene): EnemyBattleMonster {
    return new EnemyBattleMonster({
      scene,
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
  }

  createPlayerMonster(scene: Phaser.Scene): PlayerBattleMonster {
    return new PlayerBattleMonster({
      scene,
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
  }

  // More flexible creation methods that could be added:
  createCustomMonster(config: MonsterConfig, isEnemy: boolean) {
    const MonsterClass = isEnemy ? EnemyBattleMonster : PlayerBattleMonster;
    return new MonsterClass({
      scene: config.scene,
      monsterDetails: {
        name: config.name,
        assetKey: config.assetKey,
        assetFrame: config.assetFrame,
        currentHp: config.currentHp,
        maxHp: config.maxHp,
        attackIds: config.attackIds,
        baseAttack: config.baseAttack,
        currentLevel: config.currentLevel,
      },
      skipBattleAnimations: SKIP_BATTLE_ANIMIATIONS,
    });
  }
}
