import { AUTO, Game } from 'phaser';
import MainScene from './scenes/MainScene.js';
import GameScene from './scenes/GameScene.js';

// Game configuration
const config = {
    type: AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    transparent: true,
    scene: [MainScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 320,
            height: 240
        },
        max: {
            width: 1600,
            height: 1200
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
