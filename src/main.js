import { AUTO, Game } from 'phaser';
import MainScene from './scenes/MainScene.js';
import GameScene from './scenes/GameScene.js';

// Game configuration
const config = {
    type: AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    transparent: true,
    scene: [MainScene, GameScene],
    scale: {
        mode: Phaser.Scale.RESIZE
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
