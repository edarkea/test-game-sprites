import { Game as MainGame } from './scenes/Game';
import { AUTO, Game, Scale, Types } from 'phaser';

const config: Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#000',
    input: {
        gamepad: true
    },
    scale: {
        mode: Scale.ENVELOP,
        autoCenter: Scale.CENTER_BOTH,
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            fps: 60
        },
    },
    scene: [
        MainGame
    ]
};

export default new Game(config);
