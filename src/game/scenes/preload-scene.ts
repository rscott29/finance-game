import {
  ATTACK_ASSET_KEYS,
  BATTLE_ASSET_KEYS,
  BATTLE_BACKGROUND_ASSET_KEYS,
  CHARACTER_ASSET_KEYS,
  DATA_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  MONSTER_ASSET_KEYS,
  UI_ASSET_KEYS,
  WORLD_ASSET_KEYS,
} from '../shared/asset-keys.enum';
import { SCENE_KEYS } from './scene-keys';
import { WebFontFileLoader } from '../../../public/web-font-file-loader';
import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../shared/font-keys';
import { Scene } from 'phaser';
import { DataUtils } from '../../app/utils/data-utils';

export class PreloadScene extends Scene {
  constructor() {
    super({ key: SCENE_KEYS.PRELOAD_SCENE });
  }

  init() {
    console.log('Preloader scene initialized');
  }

  preload() {
    const monsterTamerAssetsPath = '../assets/images/monster-tamer';
    const kenneysAssetsPath = '../assets/images/kenneys-assets';
    const pimenAssetPath = '../assets/images/pimen';
    const axulArtAssetPath = '../assets/images/axulart';
    const pbGamesAssetPath = '../assets/images/parabellum-games';

    // battle backgrounds
    this.load.image(
      BATTLE_BACKGROUND_ASSET_KEYS.FOREST,
      `${monsterTamerAssetsPath}/battle-backgrounds/forest-background.png`
    );

    //battle assets
    this.load.image(
      BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND,
      `${kenneysAssetsPath}/ui-space-expansion/custom-ui.png`
    );

    // health bar assets
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.RIGHT_CAP,
      `${kenneysAssetsPath}/ui-space-expansion/barHorizontal_green_right.png`
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.LEFT_CAP,
      `${kenneysAssetsPath}/ui-space-expansion/barHorizontal_green_left.png`
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.MIDDLE,
      `${kenneysAssetsPath}/ui-space-expansion/barHorizontal_green_mid.png`
    );

    this.load.image(
      HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW,
      `${kenneysAssetsPath}/ui-space-expansion/barHorizontal_shadow_left.png`
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW,
      `${kenneysAssetsPath}/ui-space-expansion/barHorizontal_shadow_right.png`
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW,
      `${kenneysAssetsPath}/ui-space-expansion/barHorizontal_shadow_mid.png`
    );

    // monster assets
    this.load.image(
      MONSTER_ASSET_KEYS.IGUANIGNITE,
      `${monsterTamerAssetsPath}/monsters/iguanignite.png`
    );
    this.load.image(
      MONSTER_ASSET_KEYS.CARNODUSK,
      `${monsterTamerAssetsPath}/monsters/carnodusk.png`
    );

    // ui assets
    this.load.image(UI_ASSET_KEYS.CURSOR, `${monsterTamerAssetsPath}/ui/cursor.png`);

    // load json data
    this.load.json(DATA_ASSET_KEYS.ATTACKS, 'assets/data/attacks.json');
    this.load.json(DATA_ASSET_KEYS.ANIMATIONS, 'assets/data/animations.json');

    //load custom fonts
    this.load.addFile(new WebFontFileLoader(this.load, [KENNEY_FUTURE_NARROW_FONT_NAME]));

    // Load attack assets
    this.load.spritesheet(ATTACK_ASSET_KEYS.ICE_SHARD, `${pimenAssetPath}/ice-attack/active.png`, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet(
      ATTACK_ASSET_KEYS.ICE_SHARD_START,
      `${pimenAssetPath}/ice-attack/start.png`,
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    this.load.spritesheet(ATTACK_ASSET_KEYS.SLASH, `${pimenAssetPath}/slash.png`, {
      frameWidth: 48,
      frameHeight: 48,
    });

    // load world assets.
    this.load.image(
      WORLD_ASSET_KEYS.WORLD_BACKGROUND,
      `${monsterTamerAssetsPath}/map/level_background.png`
    );
    this.load.tilemapTiledJSON(WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL, `assets/data/level.json`);
    this.load.image(
      WORLD_ASSET_KEYS.WORLD_COLLISION,
      `${monsterTamerAssetsPath}/map/collision.png`
    );
    this.load.image(
      WORLD_ASSET_KEYS.WORLD_FOREGROUND,
      `${monsterTamerAssetsPath}/map/level_foreground.png`
    );
    this.load.image(
      WORLD_ASSET_KEYS.WORLD_ENCOUNTER_ZONE,
      `${monsterTamerAssetsPath}/map/encounter.png`
    );

    // load character images
    this.load.spritesheet(CHARACTER_ASSET_KEYS.PLAYER, `${axulArtAssetPath}/character/custom.png`, {
      frameWidth: 64,
      frameHeight: 88,
    });
    this.load.spritesheet(CHARACTER_ASSET_KEYS.NPC, `${pbGamesAssetPath}/characters.png`, {
      frameWidth: 16,
      frameHeight: 16,
    });
  }
  create() {
    this.createAnimations();
    this.scene.start(SCENE_KEYS.WORLD_SCENE);
  }

  private createAnimations() {
    const animations = DataUtils.getAnimations(this);
    animations.forEach(animation => {
      const frames = animation.frames
        ? this.anims.generateFrameNumbers(animation.assetKey, { frames: animation.frames })
        : this.anims.generateFrameNumbers(animation.assetKey);
      this.anims.create({
        key: animation.key,
        frames: frames,
        frameRate: animation.frameRate,
        repeat: animation.repeat,
        delay: animation.delay,
        yoyo: animation.yoyo,
      });
    });
  }
}
