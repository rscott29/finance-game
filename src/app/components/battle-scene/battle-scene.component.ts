import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed } from '@angular/core';
import { Scene } from 'phaser';
import { Background } from '../../../game/battle/ui/background';
import { SCENE_KEYS } from '../../../game/scenes/scene-keys';
import { BattleFacadeService } from '../../services/battle-facade.service';
import { Controls } from '../../utils/controls';

@Component({
  selector: 'app-battle-scene',
  standalone: true,
  imports: [CommonModule],
  template: ``,
})
export class BattleSceneComponent implements OnInit, OnDestroy {
  private scene!: Scene;
  private controls!: Controls;

  readonly currentState = computed(() => this.battleFacade.currentState());

  constructor(private readonly battleFacade: BattleFacadeService) {}

  ngOnInit() {
    this.initializeScene();
  }

  ngOnDestroy() {
    this.battleFacade.endBattle();
  }

  private initializeScene() {
    // Initialize Phaser scene
    const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
      key: SCENE_KEYS.BATTLE_SCENE,
    };

    this.scene = new Scene(sceneConfig);

    // Initialize background
    const background = new Background(this.scene);
    background.showForest();

    // Initialize controls
    this.controls = new Controls(this.scene);

    // Initialize battle services
    this.battleFacade.initializeBattle(this.scene);

    // Update hook for input handling
    this.scene.events.on('update', () => {
      if (this.battleFacade.isPlayerTurn()) {
        this.handlePlayerInput();
      }
    });
  }

  private handlePlayerInput() {
    if (this.controls.wasSpaceKeyPressed()) {
      this.battleFacade.nextBattleState();
    } else if (this.controls.wasBackKeyPressed()) {
      this.battleFacade.attemptFlee();
    }
  }
}
