import { AUTO, Game } from 'phaser';
import MainScene from './scenes/MainScene.js';
import GameScene from './scenes/GameScene.js';

// Game configuration
const config = {
    type: AUTO,
    width: 375,
    height: 667,
    parent: 'game-container',
    transparent: true,
    scene: [MainScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 320,
            height: 480
        },
        max: {
            width: 414,
            height: 896
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

// Create the game instance
const game = new Game(config);

// Log game initialization
console.log('Phaser 3 game initialized with version:', Phaser.VERSION);
