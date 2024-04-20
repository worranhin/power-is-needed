import { Scene } from 'phaser';
import PowerStation from '../classes/PowerStation';
import City from '../classes/City';
import PowerLine from '../classes/PowerLine';
import type BuildingInterface from '../classes/BuildingType';
import PowerGrid from '../classes/PowerGrid';
import GameOverInput from '../classes/GameOverInput';

enum PointerState {
    Normal,
    Building,
    Connecting
}

export class Tutorial2 extends Scene {
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

    constructor() {
        super('Tutorial2');
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
    }

    create() {
        this.camera = this.cameras.main;

        this.text = this.add.text(0, 80, '').setDepth(100);
        this.powerStations = this.add.group();
        this.citys = this.add.group();
        this.powerLines = this.add.group();

        const city = new City(this, 512, 384);
        this.citys.add(city, true);
        this.powerGrids.push(city.grid);

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

        // tutorial

        const textContent1 = 'Hello there, welcome to play this game. '
            + 'Here I will give a brief introduction of  the game.\n(click to continue)';
        const tutorialText2 = 'Here, you should see a circle below, which represents a city. However its color is so red, meaning people there has no power to use. We should fix the problem.\n(click to continue)';
        const tutorialText3 = 'To fix the problem, we should build a power station. (On the top left corner of the screen you can see the yellow square which represents a power station. Click on it then click on anywhere on the map to place a power station.)';
        const text = this.add.text(this.scale.width, 0, textContent1, {
            fontSize: 32, backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }).setOrigin(1, 0).setWordWrapWidth(this.scale.width - 200).setInteractive({ useHandCursor: true }).setDepth(100);



        const tutorStep1 = () => {
            text.text = tutorialText2;
            text.once('pointerdown', tutorStep2);
        }
        const tutorStep2 = () => {
            text.text = tutorialText3;
            this.events.once('powerStationPlaced', tutorStep3);
        }

        const tutorStep3 = () => {
            text.text = 'Great! Now you have built a power station. \n(click to continue)';
            text.once('pointerdown', tutorStep4);
        }

        const tutorStep4 = () => {
            text.text = 'Next, you should connect the power station to the city. (Click on the power station and then click on the city to connect them together.) ';
            this.events.once('connected', tutorStep5);
        }

        const tutorStep5 = () => {
            text.text = 'Great! Now you have connected the power station to the city. You should see the city color become white now, which means that the city has enough power. \n(click to continue)';
            text.once('pointerdown', tutorStep6);
        };

        const tutorStep6 = () => {
            text.text = 'As time passes, the city will need more power. Then you need to build more power stations and connect them together. You can see more information on the top left corner when you hover your mouse on a city.\n(click to continue)';
            this.time.addEvent({
                delay: 1000,
                callback: () => {
                    this.citys.getChildren().forEach(city => {
                        const ct = city as City;
                        ct.develop();
                    });
                },
                loop: true
            });
            text.once('pointerdown', tutorStep7);
        }

        const tutorStep7 = () => {
            text.text = 'In the meantime, new cities will appear and old cities will get larger as time goes by. \n(click to continue)';
            this.checkAddCity();
            this.time.addEvent({
                delay: 2000,
                callback: () => this.checkAddCity(),
                loop: true
            });
            text.once('pointerdown', tutorStep8);
        }

        const tutorStep8 = () => {
            text.text = 'The last thing you should know is that cities with not enough power will become unsatisfied. When the total satisfaction becomes zero, your rule is over(the game will end). You can see the satisfaction on the top left corner in the information window.\n(click to return to the Main Menu)';
            this.time.addEvent({
                delay: 1000,
                callback: () => {
                    this.updateSatisfaction();
                    // this.checkEndGame();
                },
                loop: true
            })
            text.once('pointerdown', () => {
                this.scene.start('MainMenu');
            });
        }

        text.once('pointerdown', tutorStep1);


        // set timers

        // this.time.addEvent({
        //     delay: 1000,
        //     callback: () => {
        //         this.updateSatisfaction();
        //         this.checkEndGame();
        //     },
        //     loop: true
        // })

        // this.time.addEvent({
        //     delay: 5000,
        //     callback: () => {
        //         this.citys.getChildren().forEach(city => {
        //             const ct = city as City;
        //             ct.develop();
        //         });
        //     },
        //     loop: true
        // });

        // // 添加新城市
        // this.time.addEvent({
        //     delay: 100,
        //     callback: () => this.checkAddCity(),
        //     loop: true
        // });
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
        this.pointerState = PointerState.Building;
        e.stopPropagation();
    }

    handlePlaceDownPowerStation(pointer: Phaser.Input.Pointer) {
        if (this.pointerState === PointerState.Building && this.pointerObject) {
            const st = new PowerStation(this, pointer.x, pointer.y).setInteractive();
            this.powerStations.add(st, true);
            this.powerGrids.push(st.grid);

            this.pointerObject.destroy();
            this.pointerObject = null;
            this.pointerState = PointerState.Normal;  // reset state
            this.events.emit('powerStationPlaced');
        }
    }

    handlePowerStationPointDown(_pointer: Phaser.Input.Pointer, _x: number, _y: number, e: Phaser.Types.Input.EventData) {
        const gobj = this as unknown as PowerStation;
        const scene = gobj.scene as Tutorial2;
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
        // console.log("object down");

        // handle connecting action
        if (this.pointerState === PointerState.Normal) {
            if (this.citys.contains(gameObject)) {  // source of connection
                const city = gameObject as City;

                const x = city.x;
                const y = city.y;
                this.connectFrom = city;
                this.pointerObject = this.add.line(x, y, 0, 0, 0, 0, 0xffffff).setOrigin(0).setLineWidth(4);
                this.pointerState = PointerState.Connecting;
            } else if (this.powerStations.contains(gameObject)) {
                const station = gameObject as PowerStation;

                const x = station.x;
                const y = station.y;
                this.connectFrom = station;
                this.pointerObject = this.add.line(x, y, 0, 0, 0, 0, 0xffffff).setOrigin(0).setLineWidth(4);
                this.pointerState = PointerState.Connecting;
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
            }
            this.events.emit('connected');
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
        const x = Phaser.Math.Between(64, this.scale.width - 64);
        const y = Phaser.Math.Between(64, this.scale.height - 64);
        let upCity!: City;
        let nearCity = false;
        let hasSpace = true;
        let spaceNeeded = 16;
        const gap = 16;

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
                console.log(spaceNeeded);
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
                this.citys.add(ct, true);
                this.powerGrids.push(ct.grid);
            }
        }
    }
}
