import Phaser from "phaser";
import type PowerGrid from "./PowerGrid";

export default class Building extends Phaser.GameObjects.Container {
  from: Building | null;
  to: Building | null;
  powerReceived: number;
  powerTransmitted: number;
  grid: PowerGrid | null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.x = x;
    this.y = y;
    this.from = null;
    this.to = null;
    this.powerReceived = 0;
    this.powerTransmitted = 0;
  }
}