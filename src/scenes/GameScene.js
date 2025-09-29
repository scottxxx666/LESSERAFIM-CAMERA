import { Scene } from 'phaser';
import OrientationManager from '../managers/OrientationManager.js';
import AngelDisplaySystem from '../systems/AngelDisplaySystem.js';

export default class GameScene extends Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.videoElement = null;
        this.stream = null;
        
        // Motion-based angel display system
        this.orientationManager = null;
        this.angelDisplaySystem = null;
        this.orientationPermissionGranted = false;
    }

    preload() {
        this.load.image('angel', 'assets/angel.png');
    }

    async create() {
        console.log('GameScene created - Setting up camera feed and motion-based angel display...');

        // Set up camera feed
        await this.setupCamera();

        // Request orientation permission immediately on scene start
        await this.requestOrientationPermissionImmediately();

        // Initialize AngelDisplaySystem for continuous angel display
        this.initializeAngelDisplaySystem();        console.log('123')

        // Connect OrientationManager to AngelDisplaySystem for real-time updates
        this.connectOrientationToAngelDisplay();

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

    /**
     * Request orientation permission immediately on scene start
     */
    async requestOrientationPermissionImmediately() {
        console.log('GameScene: Requesting orientation permission immediately...');
        
        try {
            // Initialize OrientationManager
            this.orientationManager = new OrientationManager();
            
            // Request permission immediately
            const permissionGranted = await this.orientationManager.initialize();
            this.orientationPermissionGranted = permissionGranted;
            
            if (permissionGranted) {
                console.log('GameScene: Orientation permission granted');
            } else {
                console.warn('GameScene: Orientation permission denied');
                this.showPermissionError();
            }
            
        } catch (error) {
            console.error('GameScene: Orientation permission request failed:', error);
            this.showPermissionError();
        }
    }

    /**
     * Initialize AngelDisplaySystem for continuous angel display
     */
    initializeAngelDisplaySystem() {
        console.log('GameScene: Initializing AngelDisplaySystem...');
        
        // Create AngelDisplaySystem instance
        this.angelDisplaySystem = new AngelDisplaySystem(this);
        
        // Initialize the display with single current angel
        this.angelDisplaySystem.initializeDisplay();
        
        console.log('GameScene: AngelDisplaySystem initialized successfully');
    }

    /**
     * Connect OrientationManager to AngelDisplaySystem for real-time updates
     */
    connectOrientationToAngelDisplay() {
        if (!this.orientationManager || !this.angelDisplaySystem) {
            console.warn('GameScene: Cannot connect orientation to angel display - missing components');
            return;
        }
        
        console.log('GameScene: Connecting OrientationManager to AngelDisplaySystem...');
        
        // Register callback for orientation changes
        this.orientationManager.onOrientationChange((orientationData) => {
            // Convert orientation data to format expected by AngelDisplaySystem
            const orientation = {
                alpha: orientationData.current,
                beta: 0, // Will be enhanced in future tasks
                gamma: 0 // Will be enhanced in future tasks
            };
            
            // Update angel display with real-time orientation data
            this.angelDisplaySystem.updateCurrentAngel(orientation);
            
            // Debug log occasionally
            if (Math.random() < 0.01) { // 1% chance to log
                console.log('GameScene: Orientation update sent to AngelDisplaySystem:', orientationData.current);
            }
        });
        
        console.log('GameScene: OrientationManager connected to AngelDisplaySystem');
    }

    /**
     * Show permission error message with retry option
     */
    showPermissionError() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        const errorText = this.add.text(centerX, centerY - 50, 'Device orientation permission required\nfor angel display', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: 'rgba(255,0,0,0.8)',
            padding: { x: 15, y: 10 },
            align: 'center'
        }).setOrigin(0.5);

        const retryButton = this.add.text(centerX, centerY + 20, 'RETRY PERMISSION', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#ff4081',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        retryButton.on('pointerdown', async () => {
            errorText.destroy();
            retryButton.destroy();
            await this.requestOrientationPermissionImmediately();
            
            if (this.orientationPermissionGranted) {
                this.initializeAngelDisplaySystem();
                this.connectOrientationToAngelDisplay();
            }
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

        // Get current angel state from AngelDisplaySystem
        let captureInfo = '';
        let angelCaptured = false;
        
        if (this.angelDisplaySystem) {
            const angelState = this.angelDisplaySystem.getCurrentAngelState();
            
            if (angelState.isVisible) {
                captureInfo = `Angel captured at H:${Math.round(angelState.horizontalAngle)}° V:${Math.round(angelState.verticalAngle)}°`;
                angelCaptured = true;
            } else {
                captureInfo = 'No angel visible in current view';
            }
        } else {
            captureInfo = 'Angel display system not initialized';
        }

        // Show capture feedback
        const feedbackText = this.add.text(centerX, centerY - 50, captureInfo, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: angelCaptured ? '#00ff00' : '#ff0000',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: 10, y: 5 },
            align: 'center',
            wordWrap: { width: this.cameras.main.width - 40 }
        }).setOrigin(0.5);

        // Auto-remove feedback after 3 seconds
        this.time.delayedCall(3000, () => {
            if (feedbackText && feedbackText.scene) {
                feedbackText.destroy();
            }
        });

        // Flash effect
        const flash = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0xffffff, 0.8);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 200,
            onComplete: () => flash.destroy()
        });

        console.log(`Photo captured: ${captureInfo}`);
    }

    destroy() {
        // Clean up camera stream when scene is destroyed
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.videoElement) {
            this.videoElement.remove();
        }
        
        // Clean up motion-based angel display systems
        if (this.orientationManager) {
            this.orientationManager.destroy();
        }
        if (this.angelDisplaySystem) {
            this.angelDisplaySystem.destroy();
        }
        
        super.destroy();
    }
}
