import { Game, Types } from "phaser";

import { Boot } from './scenes/Boot';
import { MainGame } from './scenes/MainGame';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { Tutorial } from './scenes/Tutorial';
import { Credits } from './scenes/Credits';

import Color_str from './const/Color_str';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: Color_str.Secondary,  // '#028af8'
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver,
        Tutorial,
        Credits
    ],
    physics: {
        default: 'arcade'
    }
};

export default new Game(config);
