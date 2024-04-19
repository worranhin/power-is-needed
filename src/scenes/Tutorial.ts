import { Scene } from "phaser";
import City from "../classes/City";

export class Tutorial extends Scene {
  steps: number = 0;
  overObject: Phaser.GameObjects.GameObject | null;
  hoverText: Phaser.GameObjects.Text;

  constructor() {
    super('Tutorial');
  }
  create() {
    const title = this.add.text(512, 150, 'Tutorial', {
      fontFamily: 'Arial Black', fontSize: 90, align: 'center'
    }).setOrigin(0.5);

    const textContent1 = 'Hello there, welcome to play this game. '
      + 'Here I will give a brief introduction of the mechanics of the game.\n(click to continue)';
    const tutorialText2 = 'Now, you should see a circle below, which represents a city.'
    const text = this.add.text(512, 250, textContent1, {
      fontSize: 32
    }).setOrigin(0.5, 0).setWordWrapWidth(678);

    this.hoverText = this.add.text(10, 10, '');

    this.input.once('pointerdown', () => {
      title.destroy();
      text.setText(tutorialText2).setY(100);
      const city = new City(this, 512, 500).setInteractive();
      this.add.existing(city);

      this.scene.get('Game').scene.launch('Game');
    });

    this.input.on('gameobjectover', (_p: Phaser.Input.Pointer, o: Phaser.GameObjects.GameObject) => {
      this.overObject = o;
    })
  }

  update() {
    if (this.overObject && this.overObject instanceof City) {
      this.hoverText.setText(`Level: ${this.overObject.level}\nPower needed: ${this.overObject.powerNeeded}`);
    }
  }
}