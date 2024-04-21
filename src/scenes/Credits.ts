import Phaser from "phaser";
import SceneKey from "../const/SceneKey";
import Color_str from "../const/Color_str";

export class Credits extends Phaser.Scene {
  constructor() {
    super(SceneKey.Credits);
  }

  create() {
    const makerTitle = this.addTitle('Game Maker');
    const makerContent = this.addContent('Hin').setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      window.open('https://github.com/worranhin/power-is-needed', '_blank');
    });
    const frameworkTitle = this.addTitle('Game Framework');
    const frameworkContent = this.addContent('Phaser').setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      window.open('https://phaser.io/', '_blank');
    });
    const fontTitle = this.addTitle('Fonts Used');
    const fontContent = this.addContent('Power Rangers by Jayde Garrow').setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      window.open('https://www.dafont.com/power-rangers.font', '_blank');
    });
    const sfxTitle = this.addTitle('Sound Effects Providers');
    const sfxContent = this.addContent('Taira Komori').setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      window.open('https://taira-komori.jpn.org/', '_blank');
    });
    const sfxContent2 = this.addContent('freeSFX').setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      window.open('https://www.freesfx.co.uk/', '_blank');
    });
    const bgmTitle = this.addTitle('BGM Generatived By');
    const bgmContent = this.addContent('AIVA').setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      window.open('https://creators.aiva.ai/', '_blank');
    });
    const returnText = this.add.text(this.scale.width * 0.5, this.scale.height - 50, 'Return to Main Menu', {
      fontSize: 36, fontStyle: 'bold'
    }).setOrigin(0.5, 1).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.scene.start('MainMenu');
    }).on('pointerover', () => {
      returnText.setColor(Color_str.Primary);
    }).on('pointerout', () => {
      returnText.setColor('#ffffff');
    });

    Phaser.Actions.AlignTo([
      makerTitle, makerContent, frameworkTitle, frameworkContent,
      fontTitle, fontContent, sfxTitle, sfxContent, bgmTitle, bgmContent],
      Phaser.Display.Align.BOTTOM_LEFT, 0, 24);

    Phaser.Actions.AlignTo([
      sfxContent, sfxContent2],
      Phaser.Display.Align.RIGHT_BOTTOM, 12, 0);
  }

  addTitle(text: string): Phaser.GameObjects.Text {
    return this.add.text(this.scale.width * 0.3, this.scale.height * 0.1, text, {
      fontSize: 36, color: Color_str.Primary, fontStyle: 'bold'
    }).setOrigin(0);
  }

  addContent(text: string): Phaser.GameObjects.Text {
    const content = this.add.text(this.scale.width * 0.382, this.scale.height * 0.382, text, {
      fontSize: 24
    }).setOrigin(0);
    content.on('pointerover', () => {
      content.setColor(Color_str.Primary);
    });
    content.on('pointerout', () => {
      content.setColor('#ffffff');
    });
    return content;
  }
};