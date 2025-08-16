type Config = {
  delay: number;
  callback: () => void;
};

export function animateText(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Text,
  text: string,
  config: Config
) {
  const length = text.length;

  let i = 0;
  scene.time.addEvent({
    callback: () => {
      target.text += text[i];
      ++i;
      if (i === length - 1 && config?.callback) {
        config.callback();
      }
    },

    repeat: length - 1,
    delay: config?.delay || 25,
  });
}

export const CANNOT_READ_SIGN_TEXT = 'You cannot read the sign from this direction!';
export const SAMPLE_TEXT = 'Make sure you talk to npcs for helpful tips.';
