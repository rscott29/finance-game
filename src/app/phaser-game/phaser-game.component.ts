import { Component, OnInit } from '@angular/core';

import StartGame from '../../game/main';

@Component({
  selector: 'phaser-game',
  template: '<div id="game-container"></div>',

  standalone: true,
})
export class PhaserGame implements OnInit {
  scene: Phaser.Scene | null = null;
  game: Phaser.Game | null = null;
  sceneCallback: ((scene: Phaser.Scene) => void) | undefined;

  ngOnInit() {
    this.game = StartGame('game-container');
  }
}
