import { Scene, GameObjects } from 'phaser';
import Color_str from '../const/Color_str';
import SoundKey from '../const/SoundKey';
import WebFont from 'webfontloader';
import SceneKey from '../const/SceneKey';
import ImageKey from '../const/ImageKey';
import ColorKey from '../const/ColorKey';

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
        const fontSize = 48;
        const menuStyle = {
            fontSize: 48, align: 'center', fontStyle: 'bold', color: (ColorKey.Text_Str as string)
        }

        WebFont.load({
            custom: {
                families: ['PowerRangers']
            },
            active: () => {
                this.title = this.add.text(this.scale.width / 2, 160, 'Power Is Needed', {
                    fontFamily: 'PowerRangers', fontSize: 150, color: (ColorKey.Primary_Str as string)
                }).setOrigin(0.5);
            }
        });

        const startText = this.add.text(512, 400, 'Start', menuStyle).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start(SceneKey.MainGame);
            });

        const tutorText = this.add.text(512, 500, 'Tutorial', menuStyle).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start(SceneKey.Tutorial);
            });

        const creditsText = this.add.text(512, 500, 'Credits', menuStyle).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start(SceneKey.Credits);
            });

        if (!this.bgm) {
            this.bgm = this.sound.add(SoundKey.BGM, { loop: true }) as Phaser.Sound.HTML5AudioSound;
        }

        const voulumeControl = this.add.sprite(this.scale.width - 32, 32, ImageKey.MuteIcon).setInteractive();
        voulumeControl.on('pointerdown', () => {
            if (this.bgm.isPlaying) {
                this.bgm.pause();
                voulumeControl.setTexture(ImageKey.MuteIcon);

            } else {
                if (this.bgm.isPaused)
                    this.bgm.resume();
                else
                    this.bgm.play();
                voulumeControl.setTexture(ImageKey.VolumeIcon);
            }
        });

        Phaser.Actions.AlignTo([startText, tutorText, creditsText], Phaser.Display.Align.BOTTOM_CENTER, 0, 48);

        startText.on('pointerover', this.handleOverText);
        startText.on('pointerout', this.handleOutText);
        tutorText.on('pointerover', this.handleOverText);
        tutorText.on('pointerout', this.handleOutText);
        creditsText.on('pointerover', this.handleOverText);
        creditsText.on('pointerout', this.handleOutText);
    }

    handleOverText() {
        if (this instanceof GameObjects.Text) {
            this.setColor(Color_str.Primary);
        }
    }

    handleOutText() {
        if (this instanceof GameObjects.Text) {
            this.setColor(ColorKey.Text_Str);
        }
    }
}
