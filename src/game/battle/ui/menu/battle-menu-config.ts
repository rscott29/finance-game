import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../../../shared/font-keys';
import { AttackMoveOptions, BattleMenuOptions } from './battle-menu-options';

export const battleUiTextStyle = {
  color: 'black',
  fontSize: '30px',
  fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
} satisfies Phaser.Types.GameObjects.Text.TextStyle;

export const BATTLE_MENU_OPTIONS = {
  FIGHT: 'FIGHT',
  SWITCH: 'SWITCH',
  ITEM: 'ITEM',
  FLEE: 'FLEE',
} as const;

export const BATTLE_MENU_CURSOR_POS = {
  X: 42,
  Y: 38,
} as const;

export const PLAYER_INPUT_CURSOR_POS = {
  Y: 488,
} as const;

export const BATTLE_MENU_CURSOR_POS_MAP: Record<BattleMenuOptions, { x: number; y: number }> = {
  FIGHT: { x: BATTLE_MENU_CURSOR_POS.X, y: BATTLE_MENU_CURSOR_POS.Y },
  SWITCH: { x: 228, y: BATTLE_MENU_CURSOR_POS.Y },
  ITEM: { x: BATTLE_MENU_CURSOR_POS.X, y: 86 },
  FLEE: { x: 228, y: 86 },
};

export const BATTLE_MENU_CURSOR_POS_MAP_ATTACK: Record<
  AttackMoveOptions,
  { x: number; y: number }
> = {
  MOVE_1: { x: BATTLE_MENU_CURSOR_POS.X, y: BATTLE_MENU_CURSOR_POS.Y },
  MOVE_2: { x: 228, y: BATTLE_MENU_CURSOR_POS.Y },
  MOVE_3: { x: BATTLE_MENU_CURSOR_POS.X, y: 86 },
  MOVE_4: { x: 228, y: 86 },
};
