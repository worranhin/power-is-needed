import Phaser from "phaser";
import type Building from "./Building";
import type PowerGrid from "./PowerGrid";

export default class PowerLine extends Phaser.GameObjects.Line implements Building {
  length: number;
  powerWasted: number;
  from: Building | null;
  to: Building | null;
  grid: PowerGrid;
  static powerWasteRate: number = 0.01;

  constructor(scene: Phaser.Scene, from: Building, to: Building, grid: PowerGrid) {
    const x = from.x;
    const y = from.y;
    const x1 = to.x;
    const y1 = to.y;

    super(scene, x, y, 0, 0, x1 - x, y1 - y, 0xffffff);
    this.setLineWidth(5).setOrigin(0).setDepth(-1);
    this.length = Math.sqrt(Math.pow(x1 - x, 2) + Math.pow(y1 - y, 2));
    this.powerWasted = this.length * PowerLine.powerWasteRate;
    this.from = from;
    this.to = to;
    this.grid = grid;
    grid.addPowerLine(this);
  }
}