// import Building from "./Building";
import Phaser from "phaser";
import type BuildingInterface from "./BuildingType";
import PowerGrid from "./PowerGrid";

export default class PowerStation extends Phaser.GameObjects.Rectangle implements BuildingInterface {
  from: BuildingInterface | null;
  to: BuildingInterface | null;
  powerReceived: number = 0;
  powerTransmitted: number = 0;
  powerProduced: number = 10;
  grid: PowerGrid;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 32, 32, 0xffff00);
    this.grid = new PowerGrid().addProducer(this);
  }  
}