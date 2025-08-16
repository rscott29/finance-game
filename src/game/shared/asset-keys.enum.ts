export const BATTLE_BACKGROUND_ASSET_KEYS = {
  FOREST: 'FOREST',
} as const;

export type BattleBackgroundAssetKeys =
  (typeof BATTLE_BACKGROUND_ASSET_KEYS)[keyof typeof BATTLE_BACKGROUND_ASSET_KEYS];

export const BATTLE_ASSET_KEYS = {
  HEALTH_BAR_BACKGROUND: 'HEALTH_BAR_BACKGROUND',
} as const;

export type BattleAssetKeys = (typeof BATTLE_ASSET_KEYS)[keyof typeof BATTLE_ASSET_KEYS];

export const HEALTH_BAR_ASSET_KEYS = {
  LEFT_CAP: 'LEFT_CAP',
  LEFT_CAP_SHADOW: 'LEFT_CAP_SHADOW',
  RIGHT_CAP: 'RIGHT_CAP',
  RIGHT_CAP_SHADOW: 'RIGHT_CAP_SHADOW',
  MIDDLE: 'MIDDLE',
  MIDDLE_SHADOW: 'MIDDLE_SHADOW',
} as const;

export type HealthBarAssetKeys = (typeof HEALTH_BAR_ASSET_KEYS)[keyof typeof HEALTH_BAR_ASSET_KEYS];

export const MONSTER_ASSET_KEYS = {
  IGUANIGNITE: 'IGUANIGNITE',
  CARNODUSK: 'CARNODUSK',
} as const;

export type MonsterAssetKeys = (typeof HEALTH_BAR_ASSET_KEYS)[keyof typeof HEALTH_BAR_ASSET_KEYS];

export const UI_ASSET_KEYS = {
  CURSOR: 'CURSOR',
} as const;
export type UIAssetKeys = (typeof UI_ASSET_KEYS)[keyof typeof UI_ASSET_KEYS];

export const DATA_ASSET_KEYS = {
  ATTACKS: 'ATTACKS',
  ANIMATIONS: 'ANIMATIONS',
} as const;

export type DataAssetKeys = (typeof DATA_ASSET_KEYS)[keyof typeof DATA_ASSET_KEYS];

export const ATTACK_ASSET_KEYS = {
  ICE_SHARD: 'ICE_SHARD',
  ICE_SHARD_START: 'ICE_SHARD_START',
  SLASH: 'SLASH',
} as const;

export type AttackAssetKeys = (typeof ATTACK_ASSET_KEYS)[keyof typeof ATTACK_ASSET_KEYS];

export const WORLD_ASSET_KEYS = {
  WORLD_BACKGROUND: 'WORLD_BACKGROUND',
  WORLD_MAIN_LEVEL: 'WORLD_MAIN_LEVEL',
  WORLD_COLLISION: 'WORLD_COLLISION',
  WORLD_FOREGROUND: 'WORLD_FOREGROUND',
  WORLD_ENCOUNTER_ZONE: 'WORLD_ENCOUNTER_ZONE',
} as const;
export type WorldAssetKeys = (typeof WORLD_ASSET_KEYS)[keyof typeof WORLD_ASSET_KEYS];

export const CHARACTER_ASSET_KEYS = {
  PLAYER: 'PLAYER',
  NPC: 'NPC',
} as const;
export type CharacterAssetKeys = (typeof CHARACTER_ASSET_KEYS)[keyof typeof CHARACTER_ASSET_KEYS];
