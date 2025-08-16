import { Direction } from '../../../shared/direction';
import { BATTLE_MENU_OPTIONS } from './battle-menu-config';

export const ATTACK_MOVE_OPTIONS = {
  MOVE_1: 'MOVE_1',
  MOVE_2: 'MOVE_2',
  MOVE_3: 'MOVE_3',
  MOVE_4: 'MOVE_4',
} as const;

export type AttackMoveOptions = (typeof ATTACK_MOVE_OPTIONS)[keyof typeof ATTACK_MOVE_OPTIONS];
export type BattleMenuOptions = (typeof BATTLE_MENU_OPTIONS)[keyof typeof BATTLE_MENU_OPTIONS];

export const ACTIVE_BATTLE_MENU = {
  BATTLE_MAIN: 'BATTLE_MAIN',
  BATTLE_MOVE_SELECT: 'BATTLE_MOVE_SELECT',
  BATTLE_ITEM: 'BATTLE_ITEM',
  BATTLE_SWITCH: 'BATTLE_SWITCH',
  BATTLE_FLEE: 'BATTLE_FLEE',
};

export type ActiveBattleMenuOptions = (typeof ACTIVE_BATTLE_MENU)[keyof typeof ACTIVE_BATTLE_MENU];

export const battleMenuNavigationMap: Record<
  BattleMenuOptions,
  Partial<Record<Direction, BattleMenuOptions>>
> = {
  FIGHT: {
    RIGHT: 'SWITCH',
    DOWN: 'ITEM',
  },
  SWITCH: {
    LEFT: 'FIGHT',
    DOWN: 'FLEE',
  },
  ITEM: {
    RIGHT: 'FLEE',
    UP: 'FIGHT',
  },
  FLEE: {
    LEFT: 'ITEM',
    UP: 'SWITCH',
  },
};

export const attackMenuNavigationMap: Record<
  AttackMoveOptions,
  Partial<Record<Direction, AttackMoveOptions>>
> = {
  MOVE_1: {
    RIGHT: 'MOVE_2',
    DOWN: 'MOVE_3',
  },
  MOVE_2: {
    LEFT: 'MOVE_1',
    DOWN: 'MOVE_4',
  },
  MOVE_3: {
    RIGHT: 'MOVE_4',
    UP: 'MOVE_1',
  },
  MOVE_4: {
    LEFT: 'MOVE_3',
    UP: 'MOVE_2',
  },
};
