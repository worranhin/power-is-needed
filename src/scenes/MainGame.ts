import { Scene } from 'phaser';
import PowerStation from '../classes/PowerStation';
import City from '../classes/City';
import PowerLine from '../classes/PowerLine';
import type BuildingInterface from '../classes/BuildingType';
import PowerGrid from '../classes/PowerGrid';
import ResearchBar from '../classes/ResearchBar';
import GameOverInput from '../classes/GameOverInput';
import SoundKey from '../const/SoundKey';
import SceneKey from '../const/SceneKey';

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
    infoBox: Phaser.GameObjects.Text;
    moneyText: Phaser.GameObjects.Text;
    satisfactionText: Phaser.GameObjects.Text;
    toolBar: Phaser.GameObjects.Container;
    researchBar: ResearchBar;
    toastText: Phaser.GameObjects.Text;

    pointerObject: Phaser.GameObjects.GameObject | null;
    overObject: Phaser.GameObjects.GameObject | null;
    powerGrids: PowerGrid[] = [];
    pointerState: PointerState = PointerState.Normal;
    connectFrom: BuildingInterface | null = null;
    satisfaction: number = 50;
    lastSeconds: number = 0;
    randomWeight: number = 0.5;
    money: number;
    powerPrice: number = 1;
    stationPrice: number = 500;
    sideBarOn: boolean = false;

    constructor(key?: string) {
        if (key === undefined) {
            key = SceneKey.MainGame;
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
        this.money = 2000;
    }

    create() {
        // this.camera = this.cameras.main;
        this.createUI();

        this.add.rectangle(this.scale.width - 32, 32, 32, 32, 0x00CC00).setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (!this.sideBarOn) {
                    this.tweens.add({
                        targets: this.researchBar,
                        x: this.scale.width - 320,
                        duration: 200
                    });
                    this.sideBarOn = true;
                    this.events.emit('sideBarOpened');
                } else {
                    this.tweens.add({
                        targets: this.researchBar,
                        x: this.scale.width,
                        duration: 200
                    });
                    this.sideBarOn = false;
                    this.events.emit('sideBarClosed');
                }
            });

        // inputs
        this.input.on('gameobjectdown', this.handleObjectDown, this);
        this.input.on('gameobjectover', this.handleObjectOver, this);
        this.input.on('pointerdown', this.handlePlaceDownPowerStation, this);
        this.input.keyboard?.on('keydown-ESC', this.cancel, this);

        // Set Timers

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.lastSeconds++;
                this.updateSatisfaction();
                this.updateMoney();
                this.researchBar.research();
                this.checkEndGame();
            },
            loop: true
        })

        this.time.addEvent({
            delay: 5000,
            callback: () => {
                this.citys.getChildren().forEach(city => {
                    const ct = city as City;
                    if (ct.satisfied)
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

        this.checkAddCity();
    }

    createUI() {
        this.infoBox = this.add.text(0, 64, '', {
            backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: { x: 8, y: 8 }, fontSize: 16
        }).setDepth(100);
        this.powerStations = this.add.group();
        this.citys = this.add.group();
        this.powerLines = this.add.group();

        // toolbar
        // this.toolBar = this.add.container(0, 0);
        const style = { fontSize: '32px' };
        const style2 = { fontSize: '24px' };
        this.add.rectangle(0, 0, this.scale.width, 64, 0x555555).setOrigin(0);
        const buildButton = this.add.rectangle(32, 32, 32, 32, 0xffff00).setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', this.handlePickUpPowerStation, this);
        this.satisfactionText = this.add.text(0, 0, 'Satisfaction: 999', style).setOrigin(0).setDepth(100);
        this.moneyText = this.add.text(0, 0, 'Money: 99999999', style).setOrigin(0).setDepth(100);
        this.toastText = this.add.text(this.scale.width / 2, 72, '', style2).setOrigin(0.5, 0).setDepth(100).setAlpha(0);

        this.researchBar = new ResearchBar(this, this.scale.width, 64);
        this.add.existing(this.researchBar);

        Phaser.Actions.AlignTo([buildButton, this.satisfactionText, this.moneyText], Phaser.Display.Align.RIGHT_CENTER, 32, 0);
    }

    update() {
        this.updatePointerObject();
        this.powerGrids.forEach(grid => {
            grid.update();
        });  // update the power grid
        this.updateText();
    }

    updatePointerObject() {
        if (this.pointerObject && this.pointerState === PointerState.Building) {
            const po = this.pointerObject as Phaser.GameObjects.Rectangle;
            po.setPosition(this.input.activePointer.x, this.input.activePointer.y);
            this.alignToPowerStations(po);

        } else if (this.pointerObject && this.pointerState === PointerState.Connecting) {
            const po = this.pointerObject as Phaser.GameObjects.Line;
            const x = this.input.activePointer.x;
            const y = this.input.activePointer.y;
            po.setTo(0, 0, x - po.x, y - po.y);
        }
    }

    updateText() {
        this.moneyText.setText(`Money: ${this.money.toFixed(0)}`);
        this.satisfactionText.setText(`Satisfaction: ${this.satisfaction}`);

        if (this.overObject) {
            if (this.powerStations.contains(this.overObject)) {
                const pws = this.overObject as PowerStation;
                const texts = [];
                texts.push(`Grid Consumption: ${pws.grid.powerConsumption.toFixed(1)}`);
                texts.push(`Grid wasted power: ${(pws.grid.powerUsage - pws.grid.powerConsumption).toFixed(1)}`);
                texts.push(`Grid Capacity: ${pws.grid.powerCapacity}`);
                this.infoBox.setText(texts);
            } else if (this.citys.contains(this.overObject)) {
                const ct = this.overObject as City;
                // this.text.text += `\nGrid Usage: ${ct.grid.powerUsage.toFixed(1)}`;
                const texts = [];
                texts.push(`Grid Consumption: ${ct.grid.powerConsumption.toFixed(1)}`);
                texts.push(`Grid wasted power: ${(ct.grid.powerUsage - ct.grid.powerConsumption).toFixed(1)}`);
                texts.push(`Grid Capacity: ${ct.grid.powerCapacity}`);
                texts.push(`Level: ${ct.level}`);
                texts.push(`Power Needed: ${ct.powerNeeded.toFixed(1)}`);
                this.infoBox.setText(texts);
            }
        }
    }

    updateSatisfaction() {
        this.powerGrids.forEach(grid => {
            if (grid.powerUsage > grid.powerCapacity) {
                this.satisfaction -= grid.consumers.length;
            } else if (grid.powerUsage < grid.powerCapacity) {
                this.satisfaction += grid.consumers.length;
            }
        });
        this.satisfaction = Math.min(100, this.satisfaction);
    }

    updateMoney() {
        this.powerGrids.forEach(grid => {
            this.money += Math.min(grid.powerConsumption, grid.powerCapacity) * this.powerPrice;
        });
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

            const hasSpace = this.citys.getChildren().every(city => {
                const ct = city as City;
                const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, ct.x, ct.y);
                if (dist < 32 + 16 * ct.level) {
                    return false;
                } else
                return true;
            });
            if (!hasSpace)
                return;
            
            if (this.money >= this.stationPrice) {
                this.money -= this.stationPrice;
            } else {
                return;
            }

            const st = new PowerStation(this, pointer.x, pointer.y);
            const [autoConnect, connectStation] = this.alignToPowerStations(st);
            this.powerStations.add(st, true);
            this.powerGrids.push(st.grid);

            if (autoConnect && connectStation) {
                this.connect(st, connectStation);
            }

            this.pointerObject.destroy();
            this.pointerObject = null;
            this.pointerState = PointerState.Normal;  // reset state
            this.sound.play(SoundKey.PlaceDown);
            this.events.emit('powerStationPlaced');
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
                this.connect(source, city);

                this.connectFrom = null;
                this.pointerObject?.destroy();
                this.pointerObject = null;
                this.pointerState = PointerState.Normal;
                this.events.emit('connected');
                this.sound.play(SoundKey.Connect);
            } else if (this.powerStations.contains(gameObject)) {
                const station = gameObject as PowerStation;
                const source = this.connectFrom as BuildingInterface;
                this.connect(source, station);

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
        if (from === to) {
            return false;
        }

        this.powerGrids.splice(this.powerGrids.indexOf(from.grid), 1);  // merge power grid
        this.powerGrids.splice(this.powerGrids.indexOf(to.grid), 1);
        const grid = PowerGrid.mergeGrids(from.grid, to.grid);
        this.powerGrids.push(grid);
        const pline = new PowerLine(this, from, to, grid);  // build powerline
        this.powerLines.add(pline, true);
        // console.log(pline.length); 
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

    checkAddCity() {
        let xSum = 0;
        let ySum = 0;
        let count = 0;
        this.citys.getChildren().forEach(city => {
            xSum += (city as City).x * (city as City).level;
            ySum += (city as City).y * (city as City).level;
            count += (city as City).level;
        });

        const x1 = Phaser.Math.Between(80, this.scale.width - 80);
        const y1 = Phaser.Math.Between(80, this.scale.height - 80);
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
            if (!upCity.satisfied)
                return;

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

    alignToPowerStations(obj: PowerStation | Phaser.GameObjects.Rectangle): [boolean, PowerStation | null] {
        let minDist = Infinity;
        let minDistObj: PowerStation | null = null;
        this.powerStations.getChildren().forEach((station) => {
            const st = station as PowerStation;
            const dist = Phaser.Math.Distance.Between(st.x, st.y, obj.x, obj.y);
            if (dist < minDist) {
                minDist = dist;
                minDistObj = st;
            }
        });

        let x = obj.x;
        let y = obj.y;
        let aligned = false;
        if (minDist < 48 && minDistObj) {
            const st = minDistObj as PowerStation;
            const dx = obj.x - st.x;
            const dy = obj.y - st.y;
            if (dx < 0 && Math.abs(dy) < 16) {
                x = st.x - 40;
                y = st.y;
                aligned = true;
            } else if (dx > 0 && Math.abs(dy) < 16) {
                x = st.x + 40;
                y = st.y;
                aligned = true;
            } else if (dy < 0 && Math.abs(dx) < 16) {
                x = st.x;
                y = st.y - 40;
                aligned = true;
            } else if (dy > 0 && Math.abs(dx) < 16) {
                x = st.x;
                y = st.y + 40;
                aligned = true;
            }
        }

        obj.setPosition(x, y);
        return [aligned, minDistObj];
    }
}
