import { Injectable, signal } from '@angular/core';
import { TILE_SIZE } from '../../../../config';
import {
  CUSTOM_TILED_TYPES,
  TILED_NPC_PROPERTY,
} from '../../../../game/scenes/world-scene.constants';
import { DIRECTION } from '../../../../game/shared/direction';
import { NPC, NPCMovementPattern } from '../../../../game/world/characters/npc';
import { INPCService } from '../interfaces/world.interfaces';

@Injectable({
  providedIn: 'root',
})
export class NPCService implements INPCService {
  private npcs = signal<NPC[]>([]);
  readonly npcs$ = this.npcs.asReadonly();

  createNPCs(map: Phaser.Tilemaps.Tilemap, scene: Phaser.Scene): NPC[] {
    const newNpcs: NPC[] = [];
    const npcLayers = map.getObjectLayerNames().filter(layerName => layerName.includes('NPC'));

    npcLayers.forEach(layerName => {
      const layer = map.getObjectLayer(layerName);
      const npcObject = layer?.objects.find(obj => obj.type === CUSTOM_TILED_TYPES.NPC);

      if (!npcObject?.x || !npcObject?.y) return;

      const pathObjects = layer?.objects.filter(obj => obj.type === CUSTOM_TILED_TYPES.NPC_PATH);

      const npcPath = this.createNPCPath(npcObject, pathObjects ?? []);
      const npcConfig = this.extractNPCConfig(npcObject);

      const npc = new NPC({
        scene,
        position: { x: npcObject.x, y: npcObject.y - TILE_SIZE },
        direction: DIRECTION.DOWN,
        frame: parseInt(npcConfig.frame),
        messages: npcConfig.messages,
        movementPattern: npcConfig.movementPattern as NPCMovementPattern,
        npcPath,
      });

      newNpcs.push(npc);
    });

    this.npcs.set(newNpcs);
    return newNpcs;
  }

  private createNPCPath(npcObject: any, pathObjects: any[]) {
    const npcPath: Record<string, { x: number; y: number }> = {
      0: { x: npcObject.x, y: npcObject.y - TILE_SIZE },
    };

    pathObjects?.forEach(obj => {
      if (!obj.x || !obj.y) return;
      npcPath[parseInt(obj.name, 10)] = {
        x: obj.x,
        y: obj.y - TILE_SIZE,
      };
    });

    return npcPath;
  }

  private extractNPCConfig(npcObject: any) {
    const frame =
      npcObject.properties.find(
        (property: { name: string }) => property.name === TILED_NPC_PROPERTY.FRAME
      )?.value || '';

    const messagesString =
      npcObject.properties.find(
        (property: { name: string }) => property.name === TILED_NPC_PROPERTY.MESSAGES
      )?.value || '';

    const movementPattern =
      npcObject.properties.find(
        (property: { name: string }) => property.name === TILED_NPC_PROPERTY.MOVEMENT_PATTERN
      )?.value || 'IDLE';

    return {
      frame,
      messages: messagesString.split('::'),
      movementPattern,
    };
  }

  updateNPCs(time: number) {
    this.npcs().forEach(npc => npc.update(time));
  }
}
