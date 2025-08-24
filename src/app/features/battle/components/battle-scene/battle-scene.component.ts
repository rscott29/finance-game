import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, Inject } from '@angular/core';
import { Scene } from 'phaser';
import { Background } from '../../../../../game/battle/ui/background';
import { SCENE_KEYS } from '../../../../../game/scenes/scene-keys';
import { BattleMessageComponent } from '../battle-message/battle-message.component';
import { Controls } from '../../../../utils/controls';
import { IBattleFacade, BATTLE_FACADE_TOKEN } from '../../interfaces/battle.interfaces';

@Component({
  selector: 'app-battle-scene',
  standalone: true,
  imports: [CommonModule, BattleMessageComponent],
  template: `
    <div class="battle-scene">
      <app-battle-message></app-battle-message>
    </div>
  `,
  styles: [
    `
      .battle-scene {
        width: 100%;
        height: 100%;
        position: relative;
      }
    `,
  ],
})
export class BattleSceneComponent implements OnInit, OnDestroy {
  private scene!: Scene;
  private controls!: Controls;

  readonly currentState = computed(() => this.battleFacade.currentState());

  constructor(@Inject(BATTLE_FACADE_TOKEN) private readonly battleFacade: IBattleFacade) {}

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
