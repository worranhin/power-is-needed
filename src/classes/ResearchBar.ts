import Phaser from "phaser";
import Color_str from "../const/Color_str";
import Color_num from "../const/Color_num";
import { MainGame } from "../scenes/MainGame";
import PowerStation from "./PowerStation";
import PowerGrid from "./PowerGrid";

export default class ResearchBar extends Phaser.GameObjects.Container {
  capacityFee: number = 0;
  wasteFee: number = 0;
  capacityLevel: number = 1;
  wasteLevel: number = 1;
  addCapFeeText: Phaser.GameObjects.Text;
  wasteFeeText: Phaser.GameObjects.Text;
  mainGame: MainGame;

  constructor(scene: MainGame, x: number, y: number) {
    super(scene, x, y);

    this.mainGame = scene;

    const style = { fontSize: '32px' };
    const subTitleStyle = { fontSize: '20px' };
    const style3 = { fontSize: '16px' };
    const feeBtnStyle = { fontSize: '16px', color: Color_str.Secondary };

    const sideBarBackground = scene.add.rectangle(0, 0, 320, scene.scale.height - 64, 0x666666).setOrigin(0).setDepth(100);
    const sideText = scene.add.text(16, 16, 'Research', style).setOrigin(0);
    this.add([sideBarBackground, sideText]);

    const capacityBlock = scene.add.container(0, 64);
    const addCapTitle = scene.add.text(16, 0, 'Add Capacity', subTitleStyle).setOrigin(0);
    this.addCapFeeText = scene.add.text(16, 32, 'Research Fee: 9999999', style3).setOrigin(0);
    const addCapFeeDown = scene.add.circle(0, 0, 8, Color_num.Primary).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', this.decreaseCapFee, this);
    const addCapFeeUp = scene.add.circle(0, 0, 8, Color_num.Primary).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', this.increaseCapFee, this);
    Phaser.Actions.AlignTo([this.addCapFeeText, addCapFeeDown, addCapFeeUp], Phaser.Display.Align.RIGHT_CENTER, 16, 0);
    const addCapFeeDownText = scene.add.text(0, 0, '-', feeBtnStyle)
      .setOrigin(0.5).setPosition(addCapFeeDown.x, addCapFeeDown.y);
    const addCapFeeUpText = scene.add.text(0, 0, '+', feeBtnStyle)
      .setOrigin(0.5).setPosition(addCapFeeUp.x, addCapFeeUp.y);

    capacityBlock.add([addCapTitle, this.addCapFeeText, addCapFeeUp, addCapFeeDown, addCapFeeUpText, addCapFeeDownText]);

    const wasteBlock = scene.add.container(0, 144);
    const wasteTitle = scene.add.text(16, 0, 'Lower Powerline Waste', subTitleStyle).setOrigin(0);
    this.wasteFeeText = scene.add.text(16, 32, 'Research Fee: 9999999', style3).setOrigin(0);
    const wasteFeeDown = scene.add.circle(0, 0, 8, Color_num.Primary).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', this.decreaseWasteFee, this);
    const wasteFeeUp = scene.add.circle(0, 0, 8, Color_num.Primary).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', this.increaseWasteFee, this);
    Phaser.Actions.AlignTo([this.wasteFeeText, wasteFeeDown, wasteFeeUp], Phaser.Display.Align.RIGHT_CENTER, 16, 0);
    const wasteFeeDownText = scene.add.text(0, 0, '-', feeBtnStyle)
      .setOrigin(0.5).setPosition(wasteFeeDown.x, wasteFeeDown.y);
    const wasteFeeUpText = scene.add.text(0, 0, '+', feeBtnStyle)
      .setOrigin(0.5).setPosition(wasteFeeUp.x, wasteFeeUp.y);
    wasteBlock.add([wasteTitle, this.wasteFeeText, wasteFeeDown, wasteFeeUp, wasteFeeDownText, wasteFeeUpText]);

    this.add([capacityBlock, wasteBlock]).setDepth(100);

    this.updateText();
  }

  updateText() {
    this.addCapFeeText.setText(`Research Fee: ${this.capacityFee}`);
    this.wasteFeeText.setText(`Research Fee: ${this.wasteFee}`);
  }

  research() {
    if (this.mainGame.money >= this.capacityFee) {
      this.mainGame.money -= this.capacityFee;
      const p = this.capacityFee / 10 / Math.pow(2, this.capacityLevel - 1);
      const temp = Phaser.Math.Between(0, 100);
      if (p > temp) {
        this.capacityLevel++;
        PowerStation.capacity += 10;
        this.mainGame.powerGrids.forEach(grid => grid.update());
        this.mainGame.toastText.setText(['Improve power station capacity success!', `Capacity Level: ${this.capacityLevel}`]);
        this.mainGame.toastText.alpha = 1;
        this.mainGame.tweens.add({
          targets: this.mainGame.toastText,
          alpha: 0,
          duration: 5000
          });
      }
    }

    if (this.mainGame.money >= this.wasteFee) {
      this.mainGame.money -= this.wasteFee;
      const p = this.wasteFee / 100 / Math.pow(2, this.wasteLevel - 1);
      const temp = Phaser.Math.Between(0, 100);
      if (p > temp) {
        this.wasteLevel++;
        PowerGrid.powerWasteRate *= 0.5;
        this.mainGame.powerGrids.forEach(grid => grid.update());
        this.mainGame.toastText.setText(['Reduce Powerline Waste success!', `Efficiency Level: ${this.wasteLevel}`]);
        this.mainGame.toastText.alpha = 1;
        this.mainGame.tweens.add({
          targets: this.mainGame.toastText,
          alpha: 0,
          duration: 5000
          });
      }
    }
  }

  decreaseCapFee() {
    this.capacityFee = Math.max(0, this.capacityFee - 100);
    this.updateText();
  }

  increaseCapFee() {
    this.capacityFee = Math.min(1000000, this.capacityFee + 100);
    this.updateText();
  }

  decreaseWasteFee() {
    this.wasteFee = Math.max(0, this.wasteFee - 100);
    this.updateText();
  }

  increaseWasteFee() {
    this.wasteFee = Math.min(1000000, this.wasteFee + 100);
    this.updateText();
  }
}