// import Building from "./Building";
import Phaser, { Scene } from "phaser";
import type BuildingInterface from "./BuildingType";
import PowerGrid from "./PowerGrid";

export default class City extends Phaser.GameObjects.Arc implements BuildingInterface {
  from: BuildingInterface | null;
  to: BuildingInterface | null;
  powerReceived: number = 0;
  powerTransmitted: number = 0;
  powerNeeded: number = 1;
  population: number = 0;
  level: number = 1;
  grid: PowerGrid;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 16, 0, 360, false, 0xFFFFFF);
    this.grid = new PowerGrid().addConsumer(this);
    this.setInteractive(new Phaser.Geom.Circle(16, 16, 16), Phaser.Geom.Circle.Contains);
  }

  setPowerNeeded(powerNeeded: number) {
    this.powerNeeded = powerNeeded;
    this.grid?.updateConsumption();
  }

  increasePowerNeeded(power: number) {
    this.powerNeeded += power;
    this.grid?.updateConsumption();
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
    this.powerNeeded += this.level;
    this.grid.update();
  }
}