import { Scene } from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { WORLD_ASSET_KEYS } from '../shared/asset-keys.enum';
import { Player } from '../world/characters/player';
import { Controls } from '../../app/utils/controls';
import { DIRECTION } from '../shared/direction';
import { TILE_SIZE, TILED_COLLISION_LAYER_ALPHA } from '../../config';
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../../app/utils/data-manager';
import { getTargetPositionFromGameObjectPositionAndDirection } from '../../app/utils/grid-utils';
import { CANNOT_READ_SIGN_TEXT, SAMPLE_TEXT } from '../../app/utils/text-utils';
import { dialogUI } from '../world/dialog-ui';
import { NPC, NPCMovementPattern } from '../world/characters/npc';
import { DataUtils } from '../../app/utils/data-utils';

const TILED_SIGN_PROPERTY = {
  MESSAGE: 'message',
} as const;

const CUSTOM_TILED_TYPES = {
  NPC: 'npc',
  NPC_PATH: 'npc_path',
} as const;

const TILED_NPC_PROPERTY = {
  IS_SPAN_POINT: 'is_spawn_point',
  MOVEMENT_PATTERN: 'movement_pattern',
  FRAME: 'frame',
  MESSAGES: 'messages',
} as const;

export class WorldScene extends Scene {
  private player: Player | undefined;
  private controls: Controls | undefined;
  private encounterLayer: Phaser.Tilemaps.TilemapLayer | null | undefined;
  private wildMonsterEncountered: boolean | undefined;
  private signLayer: Phaser.Tilemaps.ObjectLayer | null | undefined;
  private dialogUI: dialogUI | undefined;
  private npcs: NPC[] | undefined;
  private npcPlayerIsInteractingWith: NPC | undefined;
  constructor() {
    super({ key: SCENE_KEYS.WORLD_SCENE });
  }
  init() {
    this.wildMonsterEncountered = false;
    this.npcPlayerIsInteractingWith = undefined;
  }
  create() {
    this.cameras.main.setBounds(0, 0, 1280, 2176);
    this.cameras.main.setZoom(0.8);

    const map = this.make.tilemap({ key: WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL });

    const collisionTiles = map.addTilesetImage('collision', WORLD_ASSET_KEYS.WORLD_COLLISION);

    if (!collisionTiles) {
      console.log('error while creating tileset using data from tiled.');
      return;
    }
    const collisionLayer = map.createLayer('Collision', collisionTiles ?? '', 0, 0);
    if (!collisionLayer) {
      console.log('error while creating collision layer');
      return;
    }
    collisionLayer.setAlpha(TILED_COLLISION_LAYER_ALPHA).setDepth(2);

    // create interactive layer
    this.signLayer = map.getObjectLayer('Sign');
    if (!this.signLayer) {
      console.log('error while creating sign layer');
      return;
    }

    const encounterTiles = map.addTilesetImage('encounter', WORLD_ASSET_KEYS.WORLD_ENCOUNTER_ZONE);

    if (!encounterTiles) {
      console.log('error while creating encounter layer tileset using data from tiled.');
      return;
    }

    this.encounterLayer = map.createLayer('Encounter', encounterTiles ?? '', 0, 0);
    if (!this.encounterLayer) {
      console.log('error while creating encounter layer.');
      return;
    }

    if (!collisionLayer) {
      console.log('error while creating collision layer');
      return;
    }
    this.encounterLayer.setAlpha(TILED_COLLISION_LAYER_ALPHA).setDepth(2);

    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_BACKGROUND, 0).setOrigin(0);

    this.createNPCS(map);

    this.player = new Player({
      scene: this,
      position: dataManager.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION),
      direction: dataManager.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION),
      collisionLayer: collisionLayer,
      spriteGridMovementFinishedCallback: () => {
        this.handlePlayerMovementUpdate();
      },
      otherCharactersToCheckForCollisionsWith: this.npcs,
    });

    this.cameras.main.startFollow(this.player.sprite);

    this.npcs?.forEach(npcs => {
      npcs.addCharacterToCheckForCollisionsWith(this.player);
    });

    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_FOREGROUND, 0).setOrigin(0);
    this.controls = new Controls(this);
    this.dialogUI = new dialogUI(this, 1280);
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  override update(time: DOMHighResTimeStamp) {
    if (this.wildMonsterEncountered) {
      this.player?.update(time);
      return;
    }
    const selectedDirection = this.controls?.getDirectionKeyPressedDown();
    if (selectedDirection !== DIRECTION.NONE && !this.isPlayerInputLocked()) {
      this.player?.moveCharacter(selectedDirection ?? DIRECTION.NONE);
    }
    if (this.controls?.wasSpaceKeyPressed() && !this.player?.isMoving) {
      this.handlePlayerInteraction();
    }
    this.player?.update(time);
    this.npcs?.forEach(npc => {
      npc.update(time);
    });
  }
  handlePlayerInteraction() {
    if (this.dialogUI?.isAnimationPlaying) {
      return;
    }

    if (this.dialogUI?.isVisible && !this.dialogUI.moreMessagesToShow) {
      this.dialogUI.hideDialogModal();
      if (this.npcPlayerIsInteractingWith) {
        this.npcPlayerIsInteractingWith.isTalkingToPlayer = false;
        this.npcPlayerIsInteractingWith = undefined;
      }
      return;
    }

    if (this.dialogUI?.isVisible && this.dialogUI.moreMessagesToShow) {
      this.dialogUI.showNextMessage();
      return;
    }

    // get players current direction and check 1 tile over in that direction to see if there is an object that can be interacted with
    if (this.player?.sprite) {
      const { x, y } = this.player?.sprite;
      const targetPosition = getTargetPositionFromGameObjectPositionAndDirection(
        { x, y },
        this.player?.direction ?? DIRECTION.NONE
      );

      // check for sign, and display appropriate message if player is not facing up
      const nearbySign = this.signLayer?.objects.find(object => {
        if (!object.x || !object.y) {
          return false;
        }

        // In Tiled, the x value is how far the object starts from the left, and the y is the bottom of tiled object that is being added
        return object.x === targetPosition.x && object.y - TILE_SIZE === targetPosition.y;
      });

      if (nearbySign) {
        const props = nearbySign.properties;

        const msg = props.find(
          (prop: { name: string }) => prop.name === TILED_SIGN_PROPERTY.MESSAGE
        )?.value;

        const usePlaceholderText = this.player?.direction !== DIRECTION.UP;
        let textToShow = CANNOT_READ_SIGN_TEXT;
        if (!usePlaceholderText) {
          textToShow = msg || SAMPLE_TEXT;
        }
        this.dialogUI?.showDialogModal([textToShow]);
        return;
      }

      const nearbyNpc = this.npcs?.find(npc => {
        return npc.sprite.x === targetPosition.x && npc.sprite.y === targetPosition.y;
      });
      if (nearbyNpc) {
        nearbyNpc.facePlayer(this.player?.direction ?? DIRECTION.NONE);
        console.log(nearbyNpc.messages);
        this.dialogUI?.showDialogModal(nearbyNpc.messages);
        nearbyNpc.isTalkingToPlayer = true;
        this.npcPlayerIsInteractingWith = nearbyNpc;

        return;
      }
    }
  }

  private handlePlayerMovementUpdate() {
    dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION, {
      x: this.player?.sprite.x,
      y: this.player?.sprite.y,
    });
    dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION, this.player?.direction);
    if (!this.encounterLayer) {
      return;
    }
    if (this.player?.sprite) {
      const isInEncounterZone =
        this.encounterLayer.getTileAtWorldXY(this.player.sprite.x, this.player?.sprite.y, true)
          .index !== -1;

      if (!isInEncounterZone) {
        return;
      }
      console.log('player is in an encounter zone!');
      this.wildMonsterEncountered = Math.random() < 0.2;
      if (this.wildMonsterEncountered) {
        console.log('player encountered a wild monster');
        this.cameras.main.fadeOut(2000);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
          this.scene.start(SCENE_KEYS.BATTLE_SCENE);
        });
      }
    }
  }

  private isPlayerInputLocked() {
    return this.dialogUI?.isVisible;
  }

  private createNPCS(map: Phaser.Tilemaps.Tilemap) {
    this.npcs = [];
    const npcLayers = map.getObjectLayerNames().filter(layerName => layerName.includes('NPC'));

    npcLayers.forEach(layerName => {
      const layer = map.getObjectLayer(layerName);
      console.log(layer?.objects);
      const npcObject = layer?.objects.find(obj => {
        return obj.type === CUSTOM_TILED_TYPES.NPC;
      });
      if (!npcObject || npcObject.x === undefined || npcObject.y === undefined) {
        return;
      }
      // get the path objects for this npc

      const pathObjects = layer?.objects.filter(obj => {
        return obj.type === CUSTOM_TILED_TYPES.NPC_PATH;
      });
      const npcPath = {
        0: { x: npcObject.x, y: npcObject.y - TILE_SIZE },
      } as any;
      console.log(npcPath);

      pathObjects?.forEach(obj => {
        if (obj.x === undefined || obj.y === undefined) {
          return;
        }
        npcPath[parseInt(obj.name, 10)] = { x: obj.x, y: obj.y - TILE_SIZE };
      });

      const npcFrame =
        npcObject.properties.find(
          (property: { name: string }) => property.name === TILED_NPC_PROPERTY.FRAME
        )?.value || '';

      const npcMessagesString =
        npcObject.properties.find(
          (property: { name: string }) => property.name === TILED_NPC_PROPERTY.MESSAGES
        )?.value || '';

      const npcMovement =
        npcObject.properties.find(
          (property: { name: string }) => property.name === TILED_NPC_PROPERTY.MOVEMENT_PATTERN
        )?.value || 'IDLE';
      const npcMessages = npcMessagesString.split('::');
      const npc = new NPC({
        scene: this,
        position: { x: npcObject.x, y: npcObject.y - TILE_SIZE },
        direction: DIRECTION.DOWN,
        frame: parseInt(npcFrame),
        messages: npcMessages,
        movementPattern: npcMovement as NPCMovementPattern,
        npcPath,
      });
      console.log(npc);
      this.npcs?.push(npc);
    });
  }
}
