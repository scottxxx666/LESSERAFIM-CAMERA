import { Scene } from 'phaser';

export default class GameScene extends Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.videoElement = null;
        this.stream = null;
        this.sprites = [];
        this.currentOrientation = 0;
        this.orientationPermissionGranted = false;

        // Track initial and current angles
        this.initialOrientation = { alpha: null, beta: null, gamma: null };
        this.currentAngles = { alpha: 0, beta: 0, gamma: 0 };
        this.angleChanges = { horizontal: 0, vertical: 0 };
        this.orientationDisplay = null;
    }

    preload() {
        this.load.image('angel', 'assets/angel.png');
    }

    async create() {
        console.log('GameScene created - Setting up camera feed...');

        // Set up 360° world bounds (10 pixels per degree)
        this.physics.world.setBounds(0, 0, 3600, this.cameras.main.height);

        // Set up camera feed
        await this.setupCamera();

        // Initialize gyroscope
        await this.setupGyroscope();

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
            this.videoElement.style.zIndex = '-999'; // Far behind everything
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

    async setupGyroscope() {
        try {
            // Check if device orientation is supported
            if (!window.DeviceOrientationEvent) {
                throw new Error('DeviceOrientationEvent not supported');
            }

            // Check if iOS permission is needed
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                // iOS 13+ requires permission
                this.showPermissionButton();
            } else {
                // Android or older iOS - start directly
                this.startOrientationTracking();
            }

        } catch (error) {
            console.error('Gyroscope setup failed:', error);
            this.add.text(this.cameras.main.width / 2, 150, 'Gyroscope not available', {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ff9900',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5);
        }
    }

    showPermissionButton() {
        const centerX = this.cameras.main.width / 2;

        const permissionText = this.add.text(centerX, 150, 'Tap to enable device rotation', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 15, y: 10 }
        }).setOrigin(0.5);

        const enableButton = this.add.text(centerX, 200, 'ENABLE ROTATION', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#00ff00',
            padding: { x: 20, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        enableButton.on('pointerdown', async () => {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    permissionText.destroy();
                    enableButton.destroy();
                    this.startOrientationTracking();
                } else {
                    permissionText.setText('Permission denied - rotation disabled');
                    enableButton.destroy();
                }
            } catch (error) {
                console.error('Permission request failed:', error);
                permissionText.setText('Permission request failed');
                enableButton.destroy();
            }
        });
    }

    startOrientationTracking() {
        window.addEventListener('deviceorientation', (event) => {
            // Use alpha (compass heading) for 360° rotation
            let orientation = event.alpha;
            if (orientation === null) return;

            // Store initial orientation as reference point
            if (this.initialOrientation.alpha === null) {
                this.initialOrientation.alpha = event.alpha || 0;
                this.initialOrientation.beta = event.beta || 0;
                this.initialOrientation.gamma = event.gamma || 0;
            }

            // Update current angles
            this.currentAngles.alpha = event.alpha || 0;
            this.currentAngles.beta = event.beta || 0;
            this.currentAngles.gamma = event.gamma || 0;

            // Calculate changes from initial position
            let horizontalChange = this.currentAngles.alpha - this.initialOrientation.alpha;
            let verticalChange = this.currentAngles.beta - this.initialOrientation.beta;

            // Handle 360° wraparound for horizontal rotation
            if (horizontalChange > 180) horizontalChange -= 360;
            if (horizontalChange < -180) horizontalChange += 360;

            // Store angle changes
            this.angleChanges.horizontal = horizontalChange;
            this.angleChanges.vertical = verticalChange;

            // Update orientation display
            this.updateOrientationDisplay();

            // Convert to 0-360 range
            if (orientation < 0) orientation += 360;

            this.currentOrientation = orientation;

            // Map orientation (0-360°) to world X position (0-3600px)
            const worldX = (orientation / 360) * 3600;

            // Move camera smoothly
            // this.cameras.main.scrollX = worldX - (this.cameras.main.width / 2);
            //
            // // Handle wraparound at edges
            // if (this.cameras.main.scrollX < 0) {
            //     this.cameras.main.scrollX += 3600;
            // } else if (this.cameras.main.scrollX > 3600 - this.cameras.main.width) {
            //     this.cameras.main.scrollX -= 3600;
            // }
        });

        this.orientationPermissionGranted = true;
        console.log('Device orientation tracking started');
    }

    setupSprites() {
        const centerY = this.cameras.main.height / 2;

        // Place sprites at fixed world positions based on angles
        // Angel 1 at 0° (world X: 0)
        const angel1 = this.add.image(0, centerY, 'angel');
        angel1.setScale(0.5);
        this.sprites.push(angel1);

        // Angel 2 at 120° (world X: 1200px)
        const angel2 = this.add.image(1200, centerY - 100, 'angel');
        angel2.setScale(0.4);
        this.sprites.push(angel2);

        // Angel 3 at 240° (world X: 2400px)
        const angel3 = this.add.image(2400, centerY + 80, 'angel');
        angel3.setScale(0.3);
        this.sprites.push(angel3);

        console.log('Sprites positioned in 360° world space');
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

        // Add orientation display - positioned below title with higher z-index
        this.orientationDisplay = this.add.text(20, 90, this.getOrientationText(), {
            fontFamily: 'Arial',
            fontSize: '34px',
            color: '#00ff00',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: 8, y: 4 }
        }).setOrigin(0, 0).setDepth(1000);

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

    update() {
        // Continuously update the orientation display during gameplay
        if (this.orientationDisplay && this.orientationPermissionGranted) {
            this.updateOrientationDisplay();
        }
    }

    capturePhoto() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Check which sprites are visible in camera world view
        const visibleSprites = this.sprites.filter(sprite => {
            const camera = this.cameras.main;
            const worldView = camera.worldView;

            // Check if sprite is within current camera world viewport
            const spriteX = sprite.x;
            const spriteY = sprite.y;
            const spriteWidth = sprite.displayWidth;
            const spriteHeight = sprite.displayHeight;

            // Check if sprite overlaps with camera's world view rectangle
            return spriteX + spriteWidth/2 >= worldView.x &&
                   spriteX - spriteWidth/2 <= worldView.x + worldView.width &&
                   spriteY + spriteHeight/2 >= worldView.y &&
                   spriteY - spriteHeight/2 <= worldView.y + worldView.height;
        });

        // Show capture feedback with count and current orientation
        const captureText = visibleSprites.length > 0
            ? `Captured ${visibleSprites.length} angel(s) at ${Math.round(this.currentOrientation)}°!`
            : `No angels in frame (${Math.round(this.currentOrientation)}°)`;

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

        console.log(`Photo captured with ${visibleSprites.length} sprites visible at ${this.currentOrientation}°`);
    }

    getOrientationText() {
        return `Current: α${Math.round(this.currentAngles.alpha)}° β${Math.round(this.currentAngles.beta)}° γ${Math.round(this.currentAngles.gamma)}°\nChanged: H${Math.round(this.angleChanges.horizontal)}° V${Math.round(this.angleChanges.vertical)}°`;
    }

    updateOrientationDisplay() {
        if (this.orientationDisplay) {
            this.orientationDisplay.setText(this.getOrientationText());
        }
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
