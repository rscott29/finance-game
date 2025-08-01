import { AUTO, Game } from 'phaser';
import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { Game as MainGame } from './scenes/Game';
import { NewGame } from './scenes/NewGame';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  dom: {
    createContainer: true,
  },
  parent: 'game-container',
  pixelArt: true,
  antialias: false,
  backgroundColor: '#028af8',
  scene: [Boot, Preloader, MainMenu, MainGame, NewGame, GameOver],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

const onChangeScreen = () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
  if (game.scene.scenes.length > 0) {
    let currentScene = game.scene.scenes[0];
    if (currentScene instanceof NewGame) {
      currentScene.resize();
    }
  }
};

const _orientation =
  screen.orientation ||
  (screen as any).mozOrientation ||
  (screen as any).msOrientation;
_orientation.addEventListener('change', () => {
  onChangeScreen();
});

window.addEventListener('resize', () => {
  onChangeScreen();
});

export default StartGame;
