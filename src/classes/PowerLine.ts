import Phaser from "phaser";
import type BuildingInterface from "./BuildingType";
import type PowerGrid from "./PowerGrid";

export default class PowerLine extends Phaser.GameObjects.Line implements BuildingInterface {
  length: number;
  powerWasted: number;
  from: BuildingInterface | null;
  to: BuildingInterface | null;
  grid: PowerGrid;
  static powerWasteRate: number = 0.01;

  constructor(scene: Phaser.Scene, from: BuildingInterface, to: BuildingInterface, grid: PowerGrid) {
    const x = from.x;
    const y = from.y;
    const x1 = to.x;
    const y1 = to.y;

    super(scene, x, y, 0, 0, x1-x, y1-y, 0xffffff);
    this.setLineWidth(2).setOrigin(0);
    this.length = Math.sqrt(Math.pow(x1-x, 2) + Math.pow(y1-y, 2));
    this.powerWasted = this.length * PowerLine.powerWasteRate;
    this.from = from;
    this.to = to;
    this.grid = grid;
    grid.addPowerLine(this);
  }  
}