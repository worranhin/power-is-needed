import City from '../classes/City';
import { MainGame } from './MainGame';

export class Tutorial extends MainGame {
    constructor() {
        super('Tutorial');
    }

    create() {
        this.createUI();

        const city = new City(this, this.scale.width / 2, this.scale.height / 2);
        this.citys.add(city, true);
        this.powerGrids.push(city.grid);

        // inputs
        this.input.on('gameobjectdown', this.handleObjectDown, this);
        this.input.on('gameobjectover', this.handleObjectOver, this);
        this.input.on('pointerdown', this.handlePlaceDownPowerStation, this);
        this.input.keyboard?.on('keydown-ESC', this.cancelAction, this);

        // tutorial

        const textContent1 = 'Hello there, welcome to Power Is Needed. '
            + 'Here I will give a brief introduction of  the game.\n(click to continue)';
        const tutorialText2 = 'Here, you should see a circle below, which represents a city. However its color is so red, meaning people there has no power to use. We should fix the problem.\n(click to continue)';
        const tutorialText3 = 'To fix the problem, we should build a power station. (On the top left corner of the screen you can see the yellow square which represents a power station. Click on it then click on anywhere on the map to place a power station. You can press ESC on your keyboard to cancel at anytime.)';
        const tutorText = this.add.text(this.scale.width, 64, textContent1, {
            fontSize: 24, backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }).setOrigin(1, 0).setWordWrapWidth(this.scale.width - 240).setInteractive({ useHandCursor: true }).setDepth(100);

        this.add.rectangle(this.scale.width - 32, 32, 32, 32, 0x00CC00).setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (!this.sideBarOn) {
                    this.tweens.add({
                        targets: this.researchBar,
                        x: this.scale.width - 320,
                        duration: 200
                    });
                    this.tweens.add({
                        targets: tutorText,
                        x: this.scale.width - 320,
                        duration: 200
                    });
                    tutorText.setWordWrapWidth(this.scale.width - 240 - 320);
                    this.sideBarOn = true;
                    this.events.emit('sideBarOpened');
                } else {
                    this.tweens.add({
                        targets: this.researchBar,
                        x: this.scale.width,
                        duration: 200
                    });
                    this.tweens.add({
                        targets: tutorText,
                        x: this.scale.width,
                        duration: 200
                    });
                    tutorText.setWordWrapWidth(this.scale.width - 240);
                    this.sideBarOn = false;
                    this.events.emit('sideBarClosed');
                }
            });



        const tutorStep1 = () => {
            tutorText.text = tutorialText2;
            tutorText.once('pointerdown', tutorStep2);
        }
        const tutorStep2 = () => {
            tutorText.text = tutorialText3;
            this.events.once('powerStationPlaced', tutorStep3);
        }

        const tutorStep3 = () => {
            tutorText.text = 'Great! Now you have built a power station. And the money is decreased by 500, which is the price to build a power station.\n(click to continue)';
            tutorText.once('pointerdown', tutorStep4);
        }

        const tutorStep4 = () => {
            tutorText.text = 'Next, you should connect the power station to the city. (Click on the power station and then click on the city to connect them together.) ';
            this.events.once('connected', tutorStep5);
        }

        const tutorStep5 = () => {
            tutorText.text = 'Great! Now you have connected the power station to the city. You should see the city color become white now, which means that the city has enough power. \n(click to continue)';
            tutorText.once('pointerdown', tutorStep6);
        };

        const tutorStep6 = () => {
            tutorText.text = 'As time passes, the city will pay you money for power consumption. However, it will need more power as time goes by. You can see more information on the top left corner when you hover your mouse on a city.\n(click to continue)';
            this.time.addEvent({
                delay: 1000,
                callback: () => {
                    this.citys.getChildren().forEach(city => {
                        const ct = city as City;
                        if (ct.satisfied)
                            ct.develop();
                    });
                    this.updateMoney();
                },
                loop: true
            });
            tutorText.once('pointerdown', tutorStep7);
        }

        const tutorStep7 = () => {
            tutorText.text = 'In the meantime, new cities will appear and old cities will get larger as time goes by. \n(click to continue)';
            this.checkAddCity();
            this.time.addEvent({
                delay: 2000,
                callback: () => this.checkAddCity(),
                loop: true
            });
            tutorText.once('pointerdown', tutorStep8);
        }

        const tutorStep8 = () => {
            tutorText.text = 'If cities have not enough power, they will become unsatisfied. When the total satisfaction becomes zero, your rule is over(the game will end). So you need to build more power stations and fulfill their needs. You can see the satisfaction on the top status bar.\n(click to continue)';
            tutorText.setText([
                'If cities have not enough power, they will become unsatisfied. When the total satisfaction becomes zero, your rule is over(the game will end). So you need to build more power stations and fulfill their needs. You can see the satisfaction on the top status bar.',
                '(click to continue)'
            ]);
            this.time.addEvent({
                delay: 1000,
                callback: () => {
                    this.updateSatisfaction();
                    // this.checkEndGame();
                },
                loop: true
            });
            tutorText.once('pointerdown', tutorStep9);
        }

        const tutorStep9 = () => {
            tutorText.setText(['On the top right corner, there is a green button. By clicking on it, you can call the research panel.',
                '(call out the research panel to continue)'
            ]);
            this.events.once('sideBarOpened', tutorStep10);
        }

        const tutorStep10 = () => {
            tutorText.setText(['In the research panel, you can adjust research investment to achieve coresponding target. The more you spend, the more possible to achieve at next month. But no matter the target is achieved or not, the money will be spent every month(1 second in your world) unless you have not enough money.',
                '(close the research panel to continue)'
            ]);
            this.events.once('sideBarClosed', tutorStep11);
        };

        const tutorStep11 = () => {
            tutorText.setText(['Congratulations! you have complete the tutorial. Hope you enjoy it.',
                '(click to return to the Main Menu)'
            ]);
            tutorText.once('pointerdown', () => {
                this.scene.start('MainMenu');
            });
        };

        tutorText.once('pointerdown', tutorStep1);
    }
}
