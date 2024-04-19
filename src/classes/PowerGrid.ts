import Color_num from "../const/Color_num";
import type  BuildingType from "./BuildingType";
import type City from "./City";
import type PowerLine from "./PowerLine";
import type PowerStation from "./PowerStation";

export default class PowerGrid {
  consumers: BuildingType[] = [];
  producers: BuildingType[] = [];
  powerLines: BuildingType[] = [];
  powerCapacity: number = 0;
  powerConsumption: number = 0;

  constructor() {
  }

  addConsumer(building: City) {
    this.consumers.push(building);
    this.powerConsumption += building.powerNeeded;
    building.grid = this;
    return this;
  }

  addProducer(building: PowerStation) {
    this.producers.push(building);
    this.powerCapacity += building.powerProduced;
    return this;
  }

  addPowerLine(line: PowerLine) {
    this.powerLines.push(line);
    this.powerConsumption += line.powerWasted;
    return this;
  }

  update() {
    this.powerConsumption = 0;
    this.consumers.forEach((consumer) => {
      this.powerConsumption += (consumer as City).powerNeeded;
    });

    this.powerLines.forEach((line) => {
      this.powerConsumption += (line as PowerLine).powerWasted;
    })

    this.powerCapacity = 0;
    this.producers.forEach((producer) => {
      this.powerCapacity += (producer as PowerStation).powerProduced;
    });

    if(this.powerConsumption <= this.powerCapacity) {
      this.consumers.forEach((consumer) => {
        const city = consumer as City;
        city.fillColor = 0xffffff;
      });
    } else {
      this.consumers.forEach((consumer) => {
        const city = consumer as City;
        city.fillColor = Color_num.Warning;
      });
    }
  }

  updateConsumption() {
    this.powerConsumption = 0;
    this.consumers.forEach((consumer) => {
      this.powerConsumption += (consumer as City).powerNeeded;
    })
  }

  merge(grid: PowerGrid) {
    this.consumers = this.consumers.concat(grid.consumers);
    this.producers = this.producers.concat(grid.producers);
    this.powerLines = this.powerLines.concat(grid.powerLines);

    grid.consumers.forEach(consumer => consumer.grid = this);
    grid.producers.forEach(pdc => pdc.grid = this);

    return this;
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