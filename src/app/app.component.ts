import { Component, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhaserGame } from './phaser-game/phaser-game.component';

@Component({
    selector: 'app-root',
    imports: [CommonModule, PhaserGame],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {}
