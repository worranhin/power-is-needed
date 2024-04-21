import { Scene } from 'phaser';
import PowerStation from '../classes/PowerStation';
import City from '../classes/City';
import PowerLine from '../classes/PowerLine';
import type BuildingInterface from '../classes/BuildingType';
import PowerGrid from '../classes/PowerGrid';
import GameOverInput from '../classes/GameOverInput';
import SoundKey from '../const/SoundKey';

enum PointerState {
    Normal,
    Building,
    Connecting
}

export class MainGame extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    city: Phaser.GameObjects.Arc;
    powerStations: Phaser.GameObjects.Group;
    citys: Phaser.GameObjects.Group;
    powerLines: Phaser.GameObjects.Group;
    text: Phaser.GameObjects.Text;
    toolBar: Phaser.GameObjects.Container;

    pointerObject: Phaser.GameObjects.GameObject | null;
    overObject: Phaser.GameObjects.GameObject | null;
    powerGrids: PowerGrid[] = [];
    pointerState: PointerState = PointerState.Normal;
    connectFrom: BuildingInterface | null = null;
    satisfaction: number = 50;
    lastSeconds: number = 0;
    randomWeight: number = 0.5;

    constructor(key?: string) {
        if (key === undefined) {
            key = 'Game';
        }
        super(key);
    }

    init() {
        this.powerGrids = [];
        this.pointerState = PointerState.Normal;
        this.connectFrom = null;
        this.satisfaction = 50;
        this.lastSeconds = 0;
        this.pointerObject?.destroy();
        this.pointerObject = null;
        this.overObject?.destroy();
        this.overObject = null;
        this.randomWeight = 0.5;
    }

    create() {
        this.camera = this.cameras.main;

        this.text = this.add.text(0, 80, '', {
            backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }).setDepth(100);
        this.powerStations = this.add.group();
        this.citys = this.add.group();
        this.powerLines = this.add.group();

        this.checkAddCity();

        // toolbar
        // this.toolBar = this.add.container(0, 0);
        this.add.grid(0, 0, 64, 64, 64, 64, 0xaaaaaa).setOrigin(0);
        this.add.rectangle(32, 32, 32, 32, 0xffff00).setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', this.handlePickUpPowerStation, this);

        // inputs
        this.input.on('gameobjectdown', this.handleObjectDown, this);
        this.input.on('gameobjectover', this.handleObjectOver, this);
        this.input.on('pointerdown', this.handlePlaceDownPowerStation, this);
        this.input.keyboard?.on('keydown-ESC', this.cancel, this);



        // Set Timers

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.updateSatisfaction();
                this.checkEndGame();
            },
            loop: true
        })

        this.time.addEvent({
            delay: 5000,
            callback: () => {
                this.citys.getChildren().forEach(city => {
                    const ct = city as City;
                    ct.develop();
                });
            },
            loop: true
        });

        // 添加新城市
        this.time.addEvent({
            delay: 10000,
            callback: () => this.checkAddCity(),
            loop: true
        });
    }

    update() {
        this.updatePointerObject();
        this.powerGrids.forEach(grid => grid.update());  // update the power grid
        this.updateText();
    }

    updatePointerObject() {
        if (this.pointerObject && this.pointerState === PointerState.Building) {
            const po = this.pointerObject as Phaser.GameObjects.Rectangle;
            po.setPosition(this.input.activePointer.x, this.input.activePointer.y);
        } else if (this.pointerObject && this.pointerState === PointerState.Connecting) {
            const po = this.pointerObject as Phaser.GameObjects.Line;
            const x = this.input.activePointer.x;
            const y = this.input.activePointer.y;
            po.setTo(0, 0, x - po.x, y - po.y);
        }
    }

    updateText() {
        this.text.setText(`Satisfaction: ${this.satisfaction}`);

        if (this.overObject && (this.powerStations.contains(this.overObject) || this.citys.contains(this.overObject))) {
            if (this.powerStations.contains(this.overObject)) {
                const pws = this.overObject as PowerStation;
                this.text.text += `\nGrid Comsumption: ${pws.grid.powerConsumption}`;
                this.text.text += `\nGrid Capacity: ${pws.grid.powerCapacity}`;
            } else if (this.citys.contains(this.overObject)) {
                const ct = this.overObject as City;
                this.text.text += `\nGrid Comsumption: ${ct.grid.powerConsumption}`;
                this.text.text += `\nGrid Capacity: ${ct.grid.powerCapacity}`;
                this.text.text += `\nLevel: ${ct.level}`;
                this.text.text += `\nPower Needed: ${ct.powerNeeded}`;
            }
        }
    }

    handlePickUpPowerStation(pointer: Phaser.Input.Pointer, _localX: number, _localY: number, e: Phaser.Types.Input.EventData) {
        if (this.pointerState !== PointerState.Normal || this.pointerObject)
            return;

        const pointerX = pointer.x;
        const pointerY = pointer.y;
        this.pointerObject = this.add.rectangle(pointerX, pointerY, 32, 32, 0xffff00);
        this.physics.add.existing(this.pointerObject);
        this.pointerState = PointerState.Building;
        this.sound.play(SoundKey.PickUp);
        e.stopPropagation();
    }

    handlePlaceDownPowerStation(pointer: Phaser.Input.Pointer) {
        if (this.pointerState === PointerState.Building && this.pointerObject) {
            const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, 32, 32);
            if (dist < 64)
                return;

            const noOverlaps = this.powerStations.getChildren().every((station) => {
                const st = station as PowerStation;
                const isOverlap = this.physics.overlap(st, this.pointerObject as Phaser.GameObjects.Rectangle);
                return !isOverlap;
            });
            if (!noOverlaps)
                return;

            const st = new PowerStation(this, pointer.x, pointer.y);
            this.powerStations.add(st, true);
            this.powerGrids.push(st.grid);

            this.pointerObject.destroy();
            this.pointerObject = null;
            this.pointerState = PointerState.Normal;  // reset state
            this.sound.play(SoundKey.PlaceDown);
            this.events.emit('powerStationPlaced');
        }
    }

    handlePowerStationPointDown(_pointer: Phaser.Input.Pointer, _x: number, _y: number, e: Phaser.Types.Input.EventData) {
        const gobj = this as unknown as PowerStation;
        const scene = gobj.scene as MainGame;
        if (scene.pointerState === PointerState.Normal) {
            scene.pointerState = PointerState.Connecting;
            const x = gobj.x;
            const y = gobj.y;
            scene.connectFrom = gobj;
            scene.pointerObject = scene.add.line(x, y, 0, 0, 0, 0, 0xffffff).setOrigin(0).setLineWidth(4);
            e.stopPropagation();
        }
    }

    handleObjectDown(_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
        // handle connecting action
        if (this.pointerState === PointerState.Normal) {
            if (this.citys.contains(gameObject)) {  // source of connection
                const city = gameObject as City;

                const x = city.x;
                const y = city.y;
                this.connectFrom = city;
                this.pointerObject = this.add.line(x, y, 0, 0, 0, 0, 0xffffff).setOrigin(0).setLineWidth(4);
                this.pointerState = PointerState.Connecting;
                this.sound.play(SoundKey.Connect);
            } else if (this.powerStations.contains(gameObject)) {
                const station = gameObject as PowerStation;

                const x = station.x;
                const y = station.y;
                this.connectFrom = station;
                this.pointerObject = this.add.line(x, y, 0, 0, 0, 0, 0xffffff).setOrigin(0).setLineWidth(4);
                this.pointerState = PointerState.Connecting;
                this.sound.play(SoundKey.Connect);
            }
        } else if (this.pointerState === PointerState.Connecting && this.connectFrom) {
            if (this.citys.contains(gameObject)) {  // target of connectioon
                const city = gameObject as City;
                const source = this.connectFrom as BuildingInterface;
                const pline = new PowerLine(this, source, city);  // build powerline
                this.powerLines.add(pline, true);

                this.powerGrids.splice(this.powerGrids.indexOf(source.grid), 1);  // merge power grid
                this.powerGrids.splice(this.powerGrids.indexOf(city.grid), 1);
                const grid = PowerGrid.mergeGrids(city.grid, source.grid);
                this.powerGrids.push(grid);

                this.connectFrom = null;
                this.pointerObject?.destroy();
                this.pointerObject = null;
                this.pointerState = PointerState.Normal;
                this.events.emit('connected');
                this.sound.play(SoundKey.Connect);
            } else if (this.powerStations.contains(gameObject)) {
                const station = gameObject as PowerStation;
                const source = this.connectFrom as BuildingInterface;
                const pline = new PowerLine(this, station, this.connectFrom as BuildingInterface);
                this.powerLines.add(pline, true);

                this.powerGrids.splice(this.powerGrids.indexOf(source.grid), 1);  // merge power grid
                this.powerGrids.splice(this.powerGrids.indexOf(station.grid), 1);
                const grid = PowerGrid.mergeGrids(station.grid, source.grid);
                this.powerGrids.push(grid);

                this.connectFrom = null;
                this.pointerObject?.destroy();
                this.pointerObject = null;
                this.pointerState = PointerState.Normal;
                this.events.emit('connected');
                this.sound.play(SoundKey.Connect);
            }
        }
    }

    handleObjectOver(_pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) {
        this.overObject = obj;
    }

    cancel() {
        this.connectFrom = null;
        this.pointerObject?.destroy();
        this.pointerObject = null;
        this.pointerState = PointerState.Normal;
    }

    connect(from: BuildingInterface, to: BuildingInterface) {
        from.to = to;
        to.from = from;
    }

    checkEndGame() {
        if (this.satisfaction < 0) {
            let cityCount: number[] = [];
            this.citys.getChildren().forEach(city => {
                const ct = city as City;
                if (cityCount[ct.level] === undefined)
                    cityCount[ct.level] = 1;
                else
                    cityCount[ct.level] += 1;
            })
            const data: GameOverInput = {
                seconds: this.lastSeconds,
                cityCount: cityCount
            }
            this.scene.start('GameOver', data);
        }
    }

    updateSatisfaction() {
        this.lastSeconds++;

        this.powerGrids.forEach(grid => {
            if (grid.powerConsumption > grid.powerCapacity) {
                this.satisfaction -= grid.consumers.length;
            } else if (grid.powerConsumption < grid.powerCapacity) {
                this.satisfaction += grid.consumers.length;
            }
        });
        this.satisfaction = Math.min(100, this.satisfaction);
    }

    checkAddCity() {
        let xSum = 0;
        let ySum = 0;
        let count = 0;
        this.citys.getChildren().forEach(city => {
            xSum += (city as City).x * (city as City).level;
            ySum += (city as City).y * (city as City).level;
            count += (city as City).level;
        });

        const x1 = Phaser.Math.Between(64, this.scale.width - 64);
        const y1 = Phaser.Math.Between(64, this.scale.height - 64);
        const x2 = count === 0 ? x1 : xSum / count;
        const y2 = count === 0 ? y1 : ySum / count;

        const x = this.randomWeight * x1 + (1 - this.randomWeight) * x2;
        const y = this.randomWeight * y1 + (1 - this.randomWeight) * y2;
        let upCity!: City;
        let nearCity = false;
        let hasSpace = true;
        let spaceNeeded = 16;
        const gap = 40;  // 48

        this.citys.getChildren().every(city => {  // check if space enough
            const ct = city as City;
            const dist = Phaser.Math.Distance.Between(x, y, ct.x, ct.y);
            if (dist < 16 * ct.level + gap) {
                upCity = ct;
                spaceNeeded = 16 * (ct.level + 1);
                nearCity = true;
                return false;
            }
            return true;
        });

        if (nearCity) {  // check for upgrade city
            hasSpace = hasSpace && this.citys.getChildren().every(city => {  // check if space enough
                const ct = city as City;
                if (ct === upCity) {
                    return true;
                }

                const dist = Phaser.Math.Distance.Between(upCity.x, upCity.y, ct.x, ct.y);
                if (dist < spaceNeeded + 16 * ct.level + gap) {
                    return false;
                }
                return true;
            });

            hasSpace = hasSpace && this.powerStations.getChildren().every(station => {
                const st = station as PowerStation;
                const dist = Phaser.Math.Distance.Between(upCity.x, upCity.y, st.x, st.y);
                if (dist < spaceNeeded + 16 + gap) {
                    return false;
                }
                return true;
            });

            if (hasSpace) {
                upCity.upgrade();
                this.randomWeight = Math.max(0, this.randomWeight - 0.1);
                this.sound.play(SoundKey.PopUp);
            } else {
                this.randomWeight = Math.min(1, 0.5 * (1 + this.randomWeight));
            }
        } else {  // check for add city
            hasSpace = hasSpace && this.citys.getChildren().every(city => {  // check if space enough
                const ct = city as City;
                const dist = Phaser.Math.Distance.Between(x, y, ct.x, ct.y);
                if (dist < spaceNeeded + 16 * ct.level + gap) {
                    return false;
                }
                return true;
            });

            hasSpace = hasSpace && this.powerStations.getChildren().every(station => {
                const st = station as PowerStation;
                const dist = Phaser.Math.Distance.Between(x, y, st.x, st.y);
                if (dist < spaceNeeded + 16 + gap) {
                    return false;
                }
                return true;
            });

            if (hasSpace) {
                const ct = new City(this, x, y);
                ct.scale = 0.1;
                this.citys.add(ct, true);
                this.sound.play(SoundKey.PopUp);
                this.tweens.add({
                    targets: ct,
                    scale: 1,
                    duration: 500,
                    ease: 'Back.out'
                });
                this.powerGrids.push(ct.grid);
                this.randomWeight = Math.max(0, this.randomWeight - 0.1);
            } else {
                this.randomWeight = Math.min(1, 0.5 * (1 + this.randomWeight));
            }
        }
    }
}
