import { Scene, GameObjects } from 'phaser';
import Color_str from '../const/Color_str';

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor() {
        super('MainMenu');
    }

    create() {
        // this.background = this.add.image(512, 384, 'background');

        // this.logo = this.add.image(512, 300, 'logo');

        this.title = this.add.text(512, 150, 'Power Is Needed', {
            fontFamily: 'Arial Black', fontSize: 90, color: Color_str.Primary, align: 'center'
        }).setOrigin(0.5);
        this.add.text(512, 400, 'Start the Game', {
            fontSize: 48, align: 'center'
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('Game');
            });

        this.add.text(512, 500, 'Tutorial', {
            fontSize: 48, align: 'center'
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('Tutorial');
            });

        // this.scene.start('Game');
    }
}
