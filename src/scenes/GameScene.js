import { Scene } from 'phaser';

export default class GameScene extends Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.videoElement = null;
        this.stream = null;
    }

    async create() {
        console.log('GameScene created - Setting up camera feed...');

        // Set up camera feed
        await this.setupCamera();

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

        // Temporary capture feedback
        this.add.text(centerX, centerY - 50, 'Photo Captured!', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffff00',
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

        console.log('Photo capture simulated');
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
