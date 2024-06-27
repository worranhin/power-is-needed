// import Building from "./Building";
import Phaser, { Scene } from "phaser";
import type Building from "./Building";
import PowerGrid from "./PowerGrid";
import ColorKey from "../const/ColorKey";

export default class City extends Phaser.GameObjects.Arc implements Building {
  from: Building | null;
  to: Building | null;
  powerReceived: number = 0;
  powerTransmitted: number = 0;
  powerNeeded: number = 1;
  population: number = 0;
  level: number = 1;
  grid: PowerGrid;
  satisfied: boolean = false;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 16, 0, 360, false, ColorKey.City);
    this.grid = new PowerGrid().addConsumer(this);
    this.setInteractive({
      hitArea: new Phaser.Geom.Circle(16, 16, 16),
      hitAreaCallback: Phaser.Geom.Circle.Contains,
      draggable: true,
      dropZone: true});
  }

  setPowerNeeded(powerNeeded: number) {
    this.powerNeeded = powerNeeded;
    this.grid?.update();
  }

  increasePowerNeeded(power: number) {
    this.powerNeeded += power;
    this.grid?.update();
  }

  upgrade() {
    this.level += 1;

    this.scene.tweens.add({
      targets: this,
      scale: this.level,
      duration: 1000,
      ease: 'Back.out'
    })
  }

  develop() {
    this.powerNeeded += this.powerNeeded * this.level / 10;
    this.grid.update();
  }
}