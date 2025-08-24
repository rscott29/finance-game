import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EventBus } from '../../../../game/EventBus';
import { NPC } from '../../../../game/world/characters/npc';
import { Direction, DIRECTION } from '../../../../game/shared/direction';
import {
  IWorldFacade,
  INPCService,
  IPlayerService,
  PlayerState as IPlayerState,
  NPCInteractionState as INPCInteractionState,
  WorldInitConfig,
  WorldInitResult,
  NPC_SERVICE_TOKEN,
  PLAYER_SERVICE_TOKEN,
} from '../interfaces/world.interfaces';

@Injectable({
  providedIn: 'root',
})
export class WorldFacadeService implements IWorldFacade {
  private playerStateSubject = new BehaviorSubject<IPlayerState>({
    x: 0,
    y: 0,
    direction: DIRECTION.DOWN,
    isMoving: false,
  });

  private npcInteractionSubject = new BehaviorSubject<INPCInteractionState>({
    npc: null,
    isInteracting: false,
  });

  private wildEncounterSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public readonly playerState$ = this.playerStateSubject.asObservable();
  public readonly npcInteraction$ = this.npcInteractionSubject.asObservable();
  public readonly wildEncounter$ = this.wildEncounterSubject.asObservable();

  constructor(
    @Inject(NPC_SERVICE_TOKEN) private npcService: INPCService,
    @Inject(PLAYER_SERVICE_TOKEN) private playerService: IPlayerService
  ) {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen to world events from Phaser
    EventBus.on('player-moved', (position: { x: number; y: number }) => {
      const currentState = this.playerStateSubject.value;
      this.playerStateSubject.next({
        ...currentState,
        x: position.x,
        y: position.y,
      });
    });

    EventBus.on('player-direction-changed', (direction: Direction) => {
      const currentState = this.playerStateSubject.value;
      this.playerStateSubject.next({
        ...currentState,
        direction,
      });
    });

    EventBus.on('player-movement-started', () => {
      const currentState = this.playerStateSubject.value;
      this.playerStateSubject.next({
        ...currentState,
        isMoving: true,
      });
    });

    EventBus.on('player-movement-finished', () => {
      const currentState = this.playerStateSubject.value;
      this.playerStateSubject.next({
        ...currentState,
        isMoving: false,
      });
    });

    EventBus.on('npc-interaction-started', (npc: NPC) => {
      this.npcInteractionSubject.next({
        npc,
        isInteracting: true,
      });
    });

    EventBus.on('npc-interaction-ended', () => {
      this.npcInteractionSubject.next({
        npc: null,
        isInteracting: false,
      });
    });

    EventBus.on('wild-encounter-triggered', () => {
      this.wildEncounterSubject.next(true);
    });
  }

  // World initialization
  initializeWorld(config: WorldInitConfig): WorldInitResult {
    // Create NPCs using the service
    const npcs = this.npcService.createNPCs(config.map, config.scene);

    // Initialize player using the service
    const player = this.playerService.initializePlayer({
      scene: config.scene,
      collisionLayer: config.collisionLayer,
      npcs,
      onMovementFinished: config.onMovementFinished,
    });

    // Set initial player state
    this.playerStateSubject.next({
      x: player.sprite.x,
      y: player.sprite.y,
      direction: player.direction ?? DIRECTION.DOWN,
      isMoving: false,
    });

    return { player, npcs };
  }

  // Player actions
  movePlayer(direction: Direction) {
    this.playerService.movePlayer(direction);
  }

  updatePlayer(time: number) {
    this.playerService.updatePlayer(time);
  }

  updatePlayerPosition() {
    this.playerService.updatePlayerPosition();
  }

  getInteractionTarget() {
    return this.playerService.getInteractionTarget();
  }

  // NPC actions
  updateNPCs(time: number) {
    this.npcService.updateNPCs(time);
  }

  // State accessors
  get currentPlayerState() {
    return this.playerStateSubject.value;
  }

  get currentNPCInteraction() {
    return this.npcInteractionSubject.value;
  }

  get isWildEncounterActive() {
    return this.wildEncounterSubject.value;
  }

  // Direct access for compatibility (can be removed later)
  get player$() {
    return this.playerService.player$;
  }

  get npcs$() {
    return this.npcService.npcs$;
  }

  // Cleanup method
  destroy() {
    EventBus.off('player-moved');
    EventBus.off('player-direction-changed');
    EventBus.off('player-movement-started');
    EventBus.off('player-movement-finished');
    EventBus.off('npc-interaction-started');
    EventBus.off('npc-interaction-ended');
    EventBus.off('wild-encounter-triggered');
  }
}
