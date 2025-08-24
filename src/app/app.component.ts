import { Component, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhaserGame } from './phaser-game/phaser-game.component';
import { BattleOverlayComponent } from './features/battle/components/battle-overlay/battle-overlay.component';
import { WorldDebugComponent } from './features/world/components/world-debug/world-debug.component';
import { DEBUG_MODE } from '../config';

@Component({
  selector: 'app-root',
  imports: [CommonModule, PhaserGame, BattleOverlayComponent, WorldDebugComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly debugMode = DEBUG_MODE;
}
