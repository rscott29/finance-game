import { Injectable, signal } from '@angular/core';
import { Player } from '../../game/world/characters/player';
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../../app/utils/data-manager';
import { Direction, DIRECTION } from '../../game/shared/direction';
import { getTargetPositionFromGameObjectPositionAndDirection } from '../../app/utils/grid-utils';
import { NPC } from '../../game/world/characters/npc';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private player = signal<Player | null>(null);
  readonly player$ = this.player.asReadonly();

  initializePlayer(config: {
    scene: Phaser.Scene;
    collisionLayer: Phaser.Tilemaps.TilemapLayer;
    npcs: NPC[];
    onMovementFinished: () => void;
  }) {
    const player = new Player({
      scene: config.scene,
      position: dataManager.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION),
      direction: dataManager.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION),
      collisionLayer: config.collisionLayer,
      spriteGridMovementFinishedCallback: config.onMovementFinished,
      otherCharactersToCheckForCollisionsWith: config.npcs,
    });

    this.player.set(player);
    return player;
  }

  updatePlayerPosition() {
    const player = this.player();
    if (!player) return;

    dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION, {
      x: player.sprite.x,
      y: player.sprite.y,
    });
    dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION, player.direction);
  }

  movePlayer(direction: Direction) {
    const player = this.player();
    if (!player?.isMoving) {
      player?.moveCharacter(direction);
    }
  }

  updatePlayer(time: number) {
    this.player()?.update(time);
  }

  getInteractionTarget() {
    const player = this.player();
    if (!player?.sprite) return null;

    const { x, y } = player.sprite;
    return getTargetPositionFromGameObjectPositionAndDirection(
      { x, y },
      player.direction ?? DIRECTION.NONE
    );
  }
}
