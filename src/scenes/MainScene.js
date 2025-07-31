import { Scene } from 'phaser';

export default class MainScene extends Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // Create a simple colored rectangle as a placeholder sprite
        this.load.image('star', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    }

    create() {
        // Add welcome text
        this.add.text(400, 300, 'Welcome to LESSERAFIM Camera Game', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Add instruction text
        this.add.text(400, 360, 'This is a simple Phaser 3 starter scene', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5);

        // Add a simple interactive element
        const startButton = this.add.text(400, 450, 'Click to Start', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#00ff00',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        startButton.on('pointerdown', () => {
            this.add.text(400, 520, 'Game will be developed here!', {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffff00'
            }).setOrigin(0.5);
        });

        // Add some visual feedback on hover
        startButton.on('pointerover', () => {
            startButton.setStyle({ backgroundColor: '#555555' });
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ backgroundColor: '#333333' });
        });

        // Log that the scene is ready
        console.log('MainScene created successfully');
    }

    update() {
        // Game loop logic will go here
    }
}