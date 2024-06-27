// import Building from "./Building";
import Phaser from "phaser";
import type Building from "./Building";
import PowerGrid from "./PowerGrid";
import ColorKey from "../const/ColorKey";

export default class PowerStation extends Phaser.GameObjects.Rectangle implements Building {
  from: Building | null;
  to: Building | null;
  powerReceived: number = 0;
  powerTransmitted: number = 0;
  grid: PowerGrid;
  static price: number = 500;
  static capacity: number = 10;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 32, 32, ColorKey.PowerStation);
    this.grid = new PowerGrid().addProducer(this);
    this.setInteractive({draggable: true, dropZone: true});
    scene.physics.add.existing(this, true);
  }
}