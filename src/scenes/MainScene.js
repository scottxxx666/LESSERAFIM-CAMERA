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
        this.cameras.main.setBackgroundColor('#1a1a2e');
        
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        // Add welcome text
        this.add.text(centerX, centerY - 100, 'Welcome to LESSERAFIM Camera Game', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Add instruction text
        this.add.text(centerX, centerY - 40, 'Tap camera to hunt LESSERAFIM members!', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5);

        // Add a simple interactive element
        const startButton = this.add.text(centerX, centerY + 50, 'START HUNT', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#00ff00',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
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
