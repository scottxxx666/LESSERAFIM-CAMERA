import { Scene } from 'phaser';

export default class GameScene extends Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.videoElement = null;
        this.stream = null;
        this.sprites = [];
    }

    preload() {
        this.load.image('angel', 'assets/angel.png');
    }

    async create() {
        console.log('GameScene created - Setting up camera feed...');

        // Set up camera feed
        await this.setupCamera();

        // Add sprite objects for photo hunting
        this.setupSprites();

        // Add basic UI elements
        this.setupUI();
    }

    async setupCamera() {
        try {
            // Create video element for camera feed
            this.videoElement = document.createElement('video');
            this.videoElement.style.position = 'absolute';
            this.videoElement.style.top = '0';
            this.videoElement.style.left = '0';
            this.videoElement.style.width = '100%';
            this.videoElement.style.height = '100%';
            this.videoElement.style.objectFit = 'cover';
            this.videoElement.style.zIndex = '-1'; // Behind Phaser canvas
            this.videoElement.autoplay = true;
            this.videoElement.muted = true;
            this.videoElement.playsInline = true; // Important for iOS

            // Insert video element before game canvas
            const gameContainer = document.getElementById('game-container');
            gameContainer.appendChild(this.videoElement);

            // Request camera access
            const constraints = {
                video: {
                    facingMode: 'environment', // Use back camera
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.videoElement.srcObject = this.stream;

            console.log('Camera feed initialized successfully');

            // Show camera is ready
            this.add.text(this.cameras.main.width / 2, 100, 'Camera Ready!', {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#00ff00',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5);

        } catch (error) {
            console.error('Camera setup failed:', error);
            this.handleCameraError(error);
        }
    }

    handleCameraError(error) {
        let errorMessage = 'Camera access failed';

        if (error.name === 'NotAllowedError') {
            errorMessage = 'Camera permission denied';
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'No camera found';
        } else if (error.name === 'NotSupportedError') {
            errorMessage = 'Camera not supported';
        }

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Show error message
        this.add.text(centerX, centerY, errorMessage, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ff0000',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: 20, y: 10 },
            align: 'center'
        }).setOrigin(0.5);

        // Add retry button
        const retryButton = this.add.text(centerX, centerY + 60, 'Retry Camera', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#ff4081',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        retryButton.on('pointerdown', () => {
            this.setupCamera();
        });
    }

    setupSprites() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Create angel sprite at center of screen
        const angelSprite = this.add.image(centerX, centerY, 'angel');
        angelSprite.setScale(0.5); // Scale down if needed
        this.sprites.push(angelSprite);

        // Add more sprites at different positions
        const angel2 = this.add.image(centerX - 100, centerY - 100, 'angel');
        angel2.setScale(0.3);
        this.sprites.push(angel2);

        const angel3 = this.add.image(centerX + 80, centerY + 120, 'angel');
        angel3.setScale(0.4);
        this.sprites.push(angel3);

    }

    setupUI() {
        const centerX = this.cameras.main.width / 2;
        const screenHeight = this.cameras.main.height;

        // Add game title
        this.add.text(centerX, 50, 'LESSERAFIM Photo Hunt', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5);

        // Add temporary capture button
        const captureButton = this.add.text(centerX, screenHeight - 180, 'CAPTURE', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#ff4081',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        captureButton.on('pointerdown', () => {
            this.capturePhoto();
        });

        // Game starts directly - no menu to return to
    }

    capturePhoto() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Check which sprites are visible in camera view
        const visibleSprites = this.sprites.filter(sprite => {
            const bounds = sprite.getBounds();
            const camera = this.cameras.main;
            
            // Check if sprite is within camera bounds
            return bounds.x < camera.width && 
                   bounds.x + bounds.width > 0 && 
                   bounds.y < camera.height && 
                   bounds.y + bounds.height > 0;
        });

        // Show capture feedback with count
        const captureText = visibleSprites.length > 0 
            ? `Captured ${visibleSprites.length} angel(s)!` 
            : 'No angels in frame!';

        this.add.text(centerX, centerY - 50, captureText, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: visibleSprites.length > 0 ? '#00ff00' : '#ff0000',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        // Flash effect
        const flash = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0xffffff, 0.8);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 200,
            onComplete: () => flash.destroy()
        });

        console.log(`Photo captured with ${visibleSprites.length} sprites visible`);
    }

    destroy() {
        // Clean up camera stream when scene is destroyed
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.videoElement) {
            this.videoElement.remove();
        }
        super.destroy();
    }
}
