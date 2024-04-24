import Color_num from "../const/Color_num";
import type City from "./City";
import type PowerLine from "./PowerLine";
import PowerStation from "./PowerStation";

export default class PowerGrid {
  consumers: City[] = [];
  producers: PowerStation[] = [];
  powerLines: PowerLine[] = [];
  powerCapacity: number = 0;
  powerUsage: number = 0;
  powerConsumption: number = 0;
  static powerWasteRate: number = 1e-5;

  constructor() {
  }

  addConsumer(building: City) {
    this.consumers.push(building);
    this.powerUsage += building.powerNeeded;
    this.powerConsumption += building.powerNeeded;
    building.grid = this;
    return this;
  }

  addProducer(building: PowerStation) {
    this.producers.push(building);
    this.powerCapacity += PowerStation.capacity;
    return this;
  }

  addPowerLine(line: PowerLine) {
    this.powerLines.push(line);
    this.powerUsage += line.powerWasted;
    return this;
  }

  update() {
    this.powerUsage = 0;
    this.powerConsumption = 0;
    this.powerCapacity = 0;

    this.consumers.forEach((consumer) => {
      this.powerUsage += consumer.powerNeeded;
      this.powerConsumption += consumer.powerNeeded;
    });

    let totalLength = 0;
    this.powerLines.forEach((line) => { totalLength += line.length; });
    this.powerUsage += Math.pow(this.powerConsumption, 2) * totalLength * PowerGrid.powerWasteRate;

    this.powerCapacity += this.producers.length * PowerStation.capacity;

    if (this.powerUsage <= this.powerCapacity) {
      this.consumers.forEach((consumer) => {
        const city = consumer as City;
        city.satisfied = true;
        city.fillColor = 0xffffff;
      });
    } else {
      this.consumers.forEach((consumer) => {
        const city = consumer as City;
        city.satisfied = false;
        city.fillColor = Color_num.Warning;
      });
    }
  }

  updateConsumption() {
    this.powerUsage = 0;
    this.powerConsumption = 0;
    this.consumers.forEach((consumer) => {
      this.powerUsage += (consumer as City).powerNeeded;
      this.powerConsumption += consumer.powerNeeded;
    });
    this.powerLines.forEach(line => { this.powerUsage += (line as PowerLine).powerWasted; })
  }

  updateCapacity() {
    this.powerCapacity = this.producers.length * PowerStation.capacity;
  }

  static mergeGrids(grid1: PowerGrid, grid2: PowerGrid) {
    const ng = new PowerGrid();
    ng.consumers = grid1.consumers.concat(grid2.consumers);
    ng.producers = grid1.producers.concat(grid2.producers);
    ng.powerLines = grid1.powerLines.concat(grid2.powerLines);

    ng.consumers.forEach(consumer => consumer.grid = ng);
    ng.producers.forEach(pdc => pdc.grid = ng);
    ng.powerLines.forEach(pl => pl.grid = ng);

    ng.update();

    return ng;
  }
}