import { BattleScene } from './scenes/battle-scene';
import { PreloadScene } from './scenes/preload-scene';
import { WorldScene } from './scenes/world-scene';
import { Game } from 'phaser';

const StartGame = (containerId: string = 'game-container') => {
  return new Game({
    type: Phaser.CANVAS,
    pixelArt: false,
    scale: {
      parent: containerId,
      width: 1024,
      height: 576,
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    backgroundColor: '#000000',
    scene: [PreloadScene, WorldScene, BattleScene],
  });
};

export default StartGame;
