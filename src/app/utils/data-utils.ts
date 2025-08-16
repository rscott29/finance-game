import { Attack } from '../../game/battle/types/monster-types';
import { DATA_ASSET_KEYS } from '../../game/shared/asset-keys.enum';

export type SpriteAnimation = {
  key: string;
  assetKey: string;
  frames?: number[];
  frameRate: number;
  repeat: number;
  delay: number;
  yoyo: boolean;
};

export class DataUtils {
  static getMonsterAttack(scene: Phaser.Scene, attackId: number) {
    const data: Attack[] = scene.cache.json.get(DATA_ASSET_KEYS.ATTACKS);
    return data.find(attack => attack.id === attackId);
  }
  static getAnimations(scene: Phaser.Scene): SpriteAnimation[] {
    const data = scene.cache.json.get(DATA_ASSET_KEYS.ANIMATIONS) as SpriteAnimation[];
    return data;
  }
}
