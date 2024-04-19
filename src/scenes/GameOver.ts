import { Scene } from 'phaser';
import GameOverInput from '../classes/GameOverInput';

export class GameOver extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameover_text: Phaser.GameObjects.Text;
    seconds: number;
    cityCount: number[] = [];
    inputData: GameOverInput;

    constructor() {
        super('GameOver');
    }

    init(data: GameOverInput) {
        this.seconds = data.seconds;
        this.inputData = data;
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor('rgba(0, 0, 0, 0.2)');

        this.gameover_text = this.add.text(512, 384, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.gameover_text.setOrigin(0.5);

        const sumerizeText = this.add.text(this.scale.width / 2, 450, '', 
            { fontSize: 32 }).setOrigin(0.5, 0);

        sumerizeText.text += `You have provided ${this.seconds} years of power.\n`;

        const cityCount = this.inputData.cityCount;
        cityCount.forEach((count, level) => {
            sumerizeText.text += `You have served ${count} cities of level ${level}.\n`;
        })

        this.add.text(512, 650, 'Return to main menu.', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
        }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
