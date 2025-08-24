import { Component, OnInit } from '@angular/core';
import { Scene } from 'phaser';
import { TILED_COLLISION_LAYER_ALPHA, TILE_SIZE } from '../../../config';
import { SCENE_KEYS } from '../../../game/scenes/scene-keys';
import { TILED_SIGN_PROPERTY } from '../../../game/scenes/world-scene.constants';
import { WORLD_ASSET_KEYS } from '../../../game/shared/asset-keys.enum';
import { DIRECTION } from '../../../game/shared/direction';
import { dialogUI } from '../../../game/world/dialog-ui';
import { WorldFacadeService } from '../../features/world/services/world-facade.service';
import { Controls } from '../../utils/controls';
import { CANNOT_READ_SIGN_TEXT, SAMPLE_TEXT } from '../../utils/text-utils';

@Component({
  selector: 'app-world-scene',
  template: '', // No template needed as Phaser handles rendering
  standalone: true,
})
export class WorldSceneComponent implements OnInit {
  private scene!: Scene;
  private controls!: Controls;
  private dialogUI!: dialogUI;
  private encounterLayer?: Phaser.Tilemaps.TilemapLayer;
  private signLayer?: Phaser.Tilemaps.ObjectLayer;
  private wildMonsterEncountered = false;
  private npcPlayerIsInteractingWith?: any;

  constructor(private worldFacade: WorldFacadeService) {}

  ngOnInit() {
    this.initializeScene();
  }

  private initializeScene() {
    this.scene = new Scene({
      key: SCENE_KEYS.WORLD_SCENE,
    });
  }

  private create() {
    this.setupCamera();
    const { map, collisionLayer } = this.createMap();
    this.setupLayers(map);

    if (!collisionLayer) {
      throw new Error('Collision layer could not be created.');
    }

    // Initialize world using facade
    const { player, npcs } = this.worldFacade.initializeWorld({
      scene: this.scene,
      map,
      collisionLayer,
      onMovementFinished: () => this.handlePlayerMovementUpdate(),
    });

    // Setup camera follow
    this.scene.cameras.main.startFollow(player.sprite);

    // Set up collisions
    npcs.forEach((npc: any) => {
      npc.addCharacterToCheckForCollisionsWith(player);
    });

    this.setupUI();
  }

  private setupCamera() {
    this.scene.cameras.main.setBounds(0, 0, 1280, 2176);
    this.scene.cameras.main.setZoom(0.8);
  }

  private createMap() {
    const map = this.scene.make.tilemap({ key: WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL });
    const collisionTiles = map.addTilesetImage('collision', WORLD_ASSET_KEYS.WORLD_COLLISION);

    if (!collisionTiles) {
      console.error('Error creating tileset');
      return { map, collisionLayer: null };
    }

    const collisionLayer = map.createLayer('Collision', collisionTiles, 0, 0);
    if (collisionLayer) {
      collisionLayer.setAlpha(TILED_COLLISION_LAYER_ALPHA).setDepth(2);
    }

    return { map, collisionLayer };
  }

  private setupLayers(map: Phaser.Tilemaps.Tilemap) {
    this.signLayer = map.getObjectLayer('Sign')!;
    const encounterTiles = map.addTilesetImage('encounter', WORLD_ASSET_KEYS.WORLD_ENCOUNTER_ZONE);

    if (encounterTiles) {
      const encounterLayer = map.createLayer('Encounter', encounterTiles, 0, 0);
      if (encounterLayer) {
        this.encounterLayer = encounterLayer;
        this.encounterLayer.setAlpha(TILED_COLLISION_LAYER_ALPHA).setDepth(2);
      }
    }

    this.scene.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_BACKGROUND, 0).setOrigin(0);
    this.scene.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_FOREGROUND, 0).setOrigin(0);
  }

  private setupUI() {
    this.controls = new Controls(this.scene);
    this.dialogUI = new dialogUI(this.scene, 1280);
    this.scene.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  private update(time: number) {
    if (this.wildMonsterEncountered) {
      this.worldFacade.updatePlayer(time);
      return;
    }

    const selectedDirection = this.controls.getDirectionKeyPressedDown();
    if (selectedDirection !== DIRECTION.NONE && !this.isPlayerInputLocked()) {
      this.worldFacade.movePlayer(selectedDirection);
    }

    if (this.controls.wasSpaceKeyPressed() && !this.worldFacade.player$()?.isMoving) {
      this.handlePlayerInteraction();
    }

    this.worldFacade.updatePlayer(time);
    this.worldFacade.updateNPCs(time);
  }

  private handlePlayerInteraction() {
    if (this.dialogUI.isAnimationPlaying) return;
    if (this.handleExistingDialog()) return;

    const targetPosition = this.worldFacade.getInteractionTarget();
    if (!targetPosition) return;

    const nearbySign = this.findNearbySign(targetPosition);
    if (nearbySign) {
      this.handleSignInteraction(nearbySign);
      return;
    }

    const nearbyNpc = this.findNearbyNPC(targetPosition);
    if (nearbyNpc) {
      this.handleNPCInteraction(nearbyNpc);
    }
  }

  private handleExistingDialog(): boolean {
    if (this.dialogUI.isVisible && !this.dialogUI.moreMessagesToShow) {
      this.dialogUI.hideDialogModal();
      if (this.npcPlayerIsInteractingWith) {
        this.npcPlayerIsInteractingWith.isTalkingToPlayer = false;
        this.npcPlayerIsInteractingWith = undefined;
      }
      return true;
    }

    if (this.dialogUI.isVisible && this.dialogUI.moreMessagesToShow) {
      this.dialogUI.showNextMessage();
      return true;
    }

    return false;
  }

  private findNearbySign(targetPosition: { x: number; y: number }) {
    return this.signLayer?.objects.find(object => {
      if (!object.x || !object.y) return false;
      return object.x === targetPosition.x && object.y - TILE_SIZE === targetPosition.y;
    });
  }

  private handleSignInteraction(sign: any) {
    const props = sign.properties;
    const msg = props.find(
      (prop: { name: string }) => prop.name === TILED_SIGN_PROPERTY.MESSAGE
    )?.value;

    const usePlaceholderText = this.worldFacade.player$()?.direction !== DIRECTION.UP;
    const textToShow = usePlaceholderText ? CANNOT_READ_SIGN_TEXT : msg || SAMPLE_TEXT;
    this.dialogUI.showDialogModal([textToShow]);
  }

  private findNearbyNPC(targetPosition: { x: number; y: number }) {
    return this.worldFacade
      .npcs$()
      .find((npc: any) => npc.sprite.x === targetPosition.x && npc.sprite.y === targetPosition.y);
  }

  private handleNPCInteraction(npc: any) {
    npc.facePlayer(this.worldFacade.player$()?.direction ?? DIRECTION.NONE);
    this.dialogUI.showDialogModal(npc.messages);
    npc.isTalkingToPlayer = true;
    this.npcPlayerIsInteractingWith = npc;
  }

  private handlePlayerMovementUpdate() {
    this.worldFacade.updatePlayerPosition();
    this.checkForRandomEncounter();
  }

  private checkForRandomEncounter() {
    if (!this.encounterLayer || !this.worldFacade.player$()?.sprite) return;

    const player = this.worldFacade.player$();
    const isInEncounterZone =
      this.encounterLayer.getTileAtWorldXY(player!.sprite.x, player!.sprite.y, true).index !== -1;

    if (!isInEncounterZone) return;

    this.wildMonsterEncountered = Math.random() < 0.2;
    if (this.wildMonsterEncountered) {
      this.scene.cameras.main.fadeOut(2000);
      this.scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.scene.start(SCENE_KEYS.BATTLE_SCENE);
      });
    }
  }

  private isPlayerInputLocked(): boolean {
    return this.dialogUI?.isVisible;
  }
}
