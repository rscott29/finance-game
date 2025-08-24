import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Direction } from '../../../../game/shared/direction';
import { NPC } from '../../../../game/world/characters/npc';
import { Player } from '../../../../game/world/characters/player';

// World state interfaces
export interface PlayerState {
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
}

export interface NPCInteractionState {
  npc: NPC | null;
  isInteracting: boolean;
}

export interface WorldInitConfig {
  scene: Phaser.Scene;
  map: Phaser.Tilemaps.Tilemap;
  collisionLayer: Phaser.Tilemaps.TilemapLayer;
  onMovementFinished: () => void;
}

export interface WorldInitResult {
  player: Player;
  npcs: NPC[];
}

// World facade interface
export interface IWorldFacade {
  // Observables
  readonly playerState$: Observable<PlayerState>;
  readonly npcInteraction$: Observable<NPCInteractionState>;
  readonly wildEncounter$: Observable<boolean>;

  // World initialization
  initializeWorld(config: WorldInitConfig): WorldInitResult;

  // Player actions
  movePlayer(direction: Direction): void;
  updatePlayer(time: number): void;
  updatePlayerPosition(): void;
  getInteractionTarget(): { x: number; y: number } | null;

  // NPC actions
  updateNPCs(time: number): void;

  // State accessors
  readonly currentPlayerState: PlayerState;
  readonly currentNPCInteraction: NPCInteractionState;
  readonly isWildEncounterActive: boolean;

  // Direct access for compatibility
  readonly player$: () => Player | null;
  readonly npcs$: () => NPC[];

  // Cleanup
  destroy(): void;
}

// NPC service interface
export interface INPCService {
  readonly npcs$: () => NPC[];

  createNPCs(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene): NPC[];
  updateNPCs(time: number): void;
}

// Player service interface
export interface IPlayerService {
  readonly player$: () => Player | null;

  initializePlayer(config: {
    scene: Phaser.Scene;
    collisionLayer: Phaser.Tilemaps.TilemapLayer;
    npcs: NPC[];
    onMovementFinished: () => void;
  }): Player;

  updatePlayerPosition(): void;
  movePlayer(direction: Direction): void;
  updatePlayer(time: number): void;
  getInteractionTarget(): { x: number; y: number } | null;
}

// Injection tokens
export const WORLD_FACADE_TOKEN = new InjectionToken<IWorldFacade>('WorldFacade');
export const NPC_SERVICE_TOKEN = new InjectionToken<INPCService>('NPCService');
export const PLAYER_SERVICE_TOKEN = new InjectionToken<IPlayerService>('PlayerService');
