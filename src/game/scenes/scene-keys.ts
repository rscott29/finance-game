export const SCENE_KEYS = {
  PRELOAD_SCENE: 'PRELOAD_SCENE',
  BATTLE_SCENE: 'BATTLE_SCENE',
  WORLD_SCENE: 'WORLD_SCENE',
} as const;

// Type for scene keys
export type SceneKey = (typeof SCENE_KEYS)[keyof typeof SCENE_KEYS];

// Type for scene configuration
export interface SceneConfig {
  key: SceneKey;
  active?: boolean;
  visible?: boolean;
}
