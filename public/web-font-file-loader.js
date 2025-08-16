import * as WebFontLoader from '../src/app/phaser-game/lib/webfontloader';

export class WebFontFileLoader extends Phaser.Loader.File {
  /**
   * @type {string[]}
   */
  #fontNames;
  /**
   *
   * @param {Phaser.Loader.LoaderPlugin} loader
   * @param {string[]} fontNames
   */
  constructor(loader, fontNames) {
    super(loader, {
      type: 'webFont',
      key: fontNames.toString(),
    });
    this.#fontNames = fontNames;
  }

  /**
   * @override
   */
  load() {
    WebFontLoader.default.load({
      custom: {
        families: this.#fontNames,
      },
      active: () => {
        this.loader.nextFile(this, true);
      },
      inactive: () => {
        console.error(`Failed to load custom fonts ${JSON.stringify(this.#fontNames)}`);
        this.loader.nextFile(this, false);
      },
    });
  }
}
