import City from '../classes/City';
import { MainGame } from './MainGame';

export class Tutorial extends MainGame {
    constructor() {
        super('Tutorial');
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
    }
}
