export type AttackKeys = (typeof ATTACK_KEYS)[keyof typeof ATTACK_KEYS];

export const ATTACK_KEYS = {
  NONE: 'NONE',
  ICE_SHARD: 'ICE_SHARD',
  SLASH: 'SLASH',
} as const;
