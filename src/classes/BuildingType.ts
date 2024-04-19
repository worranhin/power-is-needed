import type PowerGrid from "./PowerGrid";

export default interface BuildingInterface {
  x: number;
  y: number;
  from: BuildingInterface | null;
  to: BuildingInterface | null;
  powerReceived: number;
  powerTransmitted: number;
  grid: PowerGrid;
}