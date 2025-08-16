import { AttackKeys } from '../attacks/attack-keys';

export type BattleMonsterConfig = {
  scene: Phaser.Scene;
  monsterDetails: Monster;
  scaleHealthBarBackgroundImageByY?: number;
  skipBattleAnimations: boolean;
};

export type Monster = {
  name: string;
  assetKey: string;
  assetFrame?: number;
  currentLevel: number;
  maxHp: number;
  currentHp: number;
  baseAttack: number;
  attackIds: number[];
};

export type Coordinate = {
  x: number;
  y: number;
};

export type Attack = {
  id: number;
  name: string;
  animationName: AttackKeys;
};
