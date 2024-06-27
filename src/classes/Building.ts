import type PowerGrid from "./PowerGrid";

export default interface Building {
  x: number;
  y: number;
  grid: PowerGrid;
}