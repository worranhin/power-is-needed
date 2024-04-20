import { Scene, GameObjects } from 'phaser';
import Color_str from '../const/Color_str';
import SoundKey from '../const/SoundKey';

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    bgm: Phaser.Sound.HTML5AudioSound;

    constructor() {
        super('MainMenu');
    }

    create() {
        // this.background = this.add.image(512, 384, 'background');

        // this.logo = this.add.image(512, 300, 'logo');

        this.title = this.add.text(512, 150, 'Power Is Needed', {
            fontFamily: 'Arial Black', fontSize: 90, color: Color_str.Primary, align: 'center'
        }).setOrigin(0.5);
        const startText = this.add.text(512, 400, 'Start', {
            fontSize: 48, align: 'center'
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('Game');
            });

        const tutorText = this.add.text(512, 500, 'Tutorial', {
            fontSize: 48, align: 'center'
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('Tutorial2');
            });

        if (!this.bgm) {
            this.bgm = this.sound.add(SoundKey.BGM, { loop: true }) as Phaser.Sound.HTML5AudioSound;
            this.bgm.play();
        }

        Phaser.Actions.AlignTo([startText, tutorText], Phaser.Display.Align.BOTTOM_CENTER, 0, 50);

        startText.on('pointerover', () => {
            startText.setColor(Color_str.Primary);
        });
        startText.on('pointerout', () => {
            startText.setColor('#ffffff');
        });
        tutorText.on('pointerover', () => {
            tutorText.setColor(Color_str.Primary);
        });
        tutorText.on('pointerout', () => {
            tutorText.setColor('#ffffff');
        })

        // this.input.on('gameobjectover', (_p: Phaser.Input.Pointer, o: Phaser.GameObjects.GameObject) => {

        // })

        // this.scene.start('Game');
    }
}
