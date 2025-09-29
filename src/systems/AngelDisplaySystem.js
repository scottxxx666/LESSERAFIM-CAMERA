/**
 * AngelDisplaySystem - Manages continuous angel display with real-time angle calculations
 * 
 * Key features:
 * - Continuous angel display that always shows the current angel
 * - Real-time angle value display with text formatting (rounded to whole degrees)
 * - Device orientation (alpha, beta, gamma) to spherical coordinates conversion
 * - Horizontal angle conversion (0-360°) and vertical angle conversion (-90° to 90°)
 * - Angle wrap-around handling for horizontal angles (360° to 0° transition)
 * - Smooth visual updates and performance optimization
 */
export default class AngelDisplaySystem {
    constructor(scene) {
        this.scene = scene;

        // Current angel display state
        this.currentAngel = null;
        this.horizontalAngle = 0;      // Current horizontal angle (0-360°)
        this.verticalAngle = 0;        // Current vertical angle (-90° to 90°)

        // Display elements
        this.angelSprite = null;
        this.horizontalText = null;
        this.verticalText = null;

        // Configuration
        this.displayUpdateRate = 60;   // Target 60fps updates
        this.smoothingEnabled = true;
        this.angleResolution = 1;      // 1° increments

        // Spherical coordinate ranges
        this.horizontalRange = { min: 0, max: 360 };
        this.verticalRange = { min: -90, max: 90 };

        // Text styling
        this.textStyle = {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: 10, y: 5 }
        };

        // Performance tracking
        this.lastUpdateTime = 0;
        this.updateInterval = 1000 / this.displayUpdateRate; // 16.67ms for 60fps
    }

    /**
     * Initialize the angel display system
     * Sets up the angel display interface with initial positioning
     */
    initializeDisplay() {
        console.log('AngelDisplaySystem: Initializing display...');

        // Create angel sprite at center position with default angles (0°, 0°)
        this.createAngelSprite();

        // Create angle display text elements
        this.createAngleDisplayText();



        // Initialize with default angles
        this.updateCurrentAngel({ alpha: 0, beta: 0, gamma: 0 });

        console.log('AngelDisplaySystem: Display initialized successfully with test text');
    }

    /**
     * Create the angel sprite object
     */
    createAngelSprite() {
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2;

        // Create angel sprite
        this.angelSprite = this.scene.add.image(centerX, centerY, 'angel');
        this.angelSprite.setScale(0.5);
        this.angelSprite.setAlpha(1.0);
        this.angelSprite.setScrollFactor(0); // Screen space positioning

        // Store in current angel object
        this.currentAngel = {
            horizontalAngle: 0,
            verticalAngle: 0,
            sprite: this.angelSprite,
            scale: 0.5,
            screenX: centerX,
            screenY: centerY,
            isVisible: true,
            alpha: 1.0,
            name: "CurrentAngel",
            type: "current_angel"
        };

        console.log('AngelDisplaySystem: Angel sprite created');
    }

    /**
     * Create angle display text elements
     */
    createAngleDisplayText() {
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;

        // Position angle text in top-right corner to avoid conflicts with title
        const rightMargin = screenWidth - 120;

        // Horizontal angle text (top-right) with bright red background
        this.horizontalText = this.scene.add.text(rightMargin, 20, 'H: 0°', {
            ...this.textStyle,
            backgroundColor: 'rgba(255,0,0,0.9)',
            color: '#ffffff',
            fontSize: '20px'
        });
        this.horizontalText.setScrollFactor(0);

        // Vertical angle text (top-right, below horizontal) with bright green background
        this.verticalText = this.scene.add.text(rightMargin, 60, 'V: 0°', {
            ...this.textStyle,
            backgroundColor: 'rgba(0,255,0,0.9)',
            color: '#ffffff',
            fontSize: '20px'
        });
        this.verticalText.setScrollFactor(0);

        // Store text objects in current angel
        if (this.currentAngel) {
            this.currentAngel.horizontalText = this.horizontalText;
            this.currentAngel.verticalText = this.verticalText;
        }

        console.log(`AngelDisplaySystem: Angle display text created at positions (${rightMargin},20) and (${rightMargin},60) with bright backgrounds`);
        console.log('AngelDisplaySystem: Text elements created:', {
            horizontalText: !!this.horizontalText,
            verticalText: !!this.verticalText,
            horizontalVisible: this.horizontalText?.visible,
            verticalVisible: this.verticalText?.visible
        });
    }

    /**
     * Update current angel position and angle display based on device orientation
     * @param {Object} orientation - Device orientation data {alpha, beta, gamma}
     */
    updateCurrentAngel(orientation) {
        // Check if enough time has passed for update (performance optimization)
        const currentTime = Date.now();
        if (currentTime - this.lastUpdateTime < this.updateInterval) {
            return;
        }
        this.lastUpdateTime = currentTime;

        // Convert device orientation to spherical coordinates
        const sphericalCoords = this.convertToSphericalCoordinates(orientation);

        // Update angel angles
        this.horizontalAngle = sphericalCoords.horizontal;
        this.verticalAngle = sphericalCoords.vertical;

        // Update current angel object
        if (this.currentAngel) {
            this.currentAngel.horizontalAngle = this.horizontalAngle;
            this.currentAngel.verticalAngle = this.verticalAngle;
        }

        // Update angel sprite position
        this.renderAngelAtPosition();

        // Update angle value display
        this.displayAngleValues(this.horizontalAngle, this.verticalAngle);
    }

    /**
     * Convert device orientation (alpha, beta, gamma) to spherical coordinates
     * @param {Object} orientation - Device orientation {alpha, beta, gamma}
     * @returns {Object} Spherical coordinates {horizontal, vertical}
     */
    convertToSphericalCoordinates(orientation) {
        const { alpha, beta, gamma } = orientation;

        // Calculate horizontal angle from alpha (compass heading)
        const horizontal = this.calculateHorizontalAngle(alpha);

        // Calculate vertical angle from beta (front-to-back tilt)
        const vertical = this.calculateVerticalAngle(beta);

        // Normalize angles to valid ranges
        const normalized = this.normalizeAngles(horizontal, vertical);

        return normalized;
    }

    /**
     * Calculate horizontal angle from device alpha (0-360°)
     * @param {number} alpha - Device compass heading
     * @returns {number} Horizontal angle (0-360°)
     */
    calculateHorizontalAngle(alpha) {
        if (alpha === null || alpha === undefined) {
            return 0;
        }

        // Convert alpha to 0-360 range
        let horizontal = alpha;
        if (horizontal < 0) {
            horizontal += 360;
        }

        // Handle wrap-around
        horizontal = this.handleAngleWrapAround(horizontal);

        // Round to angle resolution
        return Math.round(horizontal / this.angleResolution) * this.angleResolution;
    }

    /**
     * Calculate vertical angle from device beta (-90° to 90°)
     * @param {number} beta - Device front-to-back tilt
     * @returns {number} Vertical angle (-90° to 90°)
     */
    calculateVerticalAngle(beta) {
        if (beta === null || beta === undefined) {
            return 0;
        }

        // Convert beta to -90 to 90 range
        let vertical = beta;

        // Clamp to vertical range
        vertical = Math.max(this.verticalRange.min, Math.min(this.verticalRange.max, vertical));

        // Round to angle resolution
        return Math.round(vertical / this.angleResolution) * this.angleResolution;
    }

    /**
     * Normalize angles to ensure they are within valid ranges
     * @param {number} horizontal - Horizontal angle
     * @param {number} vertical - Vertical angle
     * @returns {Object} Normalized angles {horizontal, vertical}
     */
    normalizeAngles(horizontal, vertical) {
        // Normalize horizontal to 0-360 range
        let normalizedHorizontal = horizontal % 360;
        if (normalizedHorizontal < 0) {
            normalizedHorizontal += 360;
        }

        // Clamp vertical to -90 to 90 range
        const normalizedVertical = Math.max(
            this.verticalRange.min,
            Math.min(this.verticalRange.max, vertical)
        );

        return {
            horizontal: normalizedHorizontal,
            vertical: normalizedVertical
        };
    }

    /**
     * Handle angle wrap-around for horizontal angles (360° to 0° transition)
     * @param {number} angle - Input angle
     * @returns {number} Wrapped angle (0-360°)
     */
    handleAngleWrapAround(angle) {
        // Ensure angle is in 0-360 range
        while (angle >= 360) {
            angle -= 360;
        }
        while (angle < 0) {
            angle += 360;
        }

        return angle;
    }

    /**
     * Render angel sprite at calculated position based on current angles
     */
    renderAngelAtPosition() {
        if (!this.angelSprite || !this.currentAngel) {
            return;
        }

        // Calculate screen position based on angles
        const screenPos = this.calculateScreenPosition(this.horizontalAngle, this.verticalAngle);

        // Update angel sprite position
        if (this.smoothingEnabled) {
            this.smoothPositionTransition(
                { x: this.angelSprite.x, y: this.angelSprite.y },
                screenPos
            );
        } else {
            this.angelSprite.x = screenPos.x;
            this.angelSprite.y = screenPos.y;
        }

        // Update current angel object
        this.currentAngel.screenX = screenPos.x;
        this.currentAngel.screenY = screenPos.y;
    }

    /**
     * Calculate screen position from spherical coordinates
     * @param {number} horizontal - Horizontal angle (0-360°)
     * @param {number} vertical - Vertical angle (-90° to 90°)
     * @returns {Object} Screen position {x, y}
     */
    calculateScreenPosition(horizontal, vertical) {
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        const centerX = screenWidth / 2;
        const centerY = screenHeight / 2;

        // Map horizontal angle to screen X (0-360° to full width)
        const normalizedHorizontal = horizontal / 360;
        const x = normalizedHorizontal * screenWidth;

        // Map vertical angle to screen Y (-90° to 90° to full height)
        const normalizedVertical = (vertical + 90) / 180; // Convert -90,90 to 0,1
        const y = (1 - normalizedVertical) * screenHeight; // Invert Y (0 at top)

        return { x, y };
    }

    /**
     * Smooth position transition between two points
     * @param {Object} fromPos - Starting position {x, y}
     * @param {Object} toPos - Target position {x, y}
     */
    smoothPositionTransition(fromPos, toPos) {
        if (!this.angelSprite) {
            return;
        }

        // Use Phaser tween for smooth movement
        this.scene.tweens.add({
            targets: this.angelSprite,
            x: toPos.x,
            y: toPos.y,
            duration: 50, // 50ms for smooth but responsive movement
            ease: 'Linear'
        });
    }

    /**
     * Display angle values with real-time updates
     * @param {number} horizontal - Horizontal angle (0-360°)
     * @param {number} vertical - Vertical angle (-90° to 90°)
     */
    displayAngleValues(horizontal, vertical) {
        if (!this.horizontalText || !this.verticalText) {
            console.warn('AngelDisplaySystem: Text elements not found for angle display');
            // Try to recreate text elements if they're missing
            this.createAngleDisplayText();
            return;
        }

        // Format angle text (rounded to whole degrees)
        const horizontalText = this.formatAngleText(horizontal, 'H');
        const verticalText = this.formatAngleText(vertical, 'V');

        // Update text objects
        this.horizontalText.setText(horizontalText);
        this.verticalText.setText(verticalText);

        // Debug log occasionally
        if (Math.random() < 0.01) { // 1% chance to log
            console.log(`AngelDisplaySystem: Updated angle display - ${horizontalText}, ${verticalText}`);
        }
    }

    /**
     * Format angle values for display
     * @param {number} angle - Angle value
     * @param {string} prefix - Text prefix ('H' or 'V')
     * @returns {string} Formatted angle text
     */
    formatAngleText(angle, prefix = '') {
        // Round to whole degrees
        const roundedAngle = Math.round(angle);

        // Handle special case for horizontal 360° -> 0°
        let displayAngle = roundedAngle;
        if (prefix === 'H' && roundedAngle >= 360) {
            displayAngle = 0;
        }

        return `${prefix}: ${displayAngle}°`;
    }

    /**
     * Get current angel state
     * @returns {Object} Current angel state
     */
    getCurrentAngelState() {
        return {
            horizontalAngle: this.horizontalAngle,
            verticalAngle: this.verticalAngle,
            currentAngel: this.currentAngel,
            isVisible: this.currentAngel ? this.currentAngel.isVisible : false,
            screenPosition: this.currentAngel ? {
                x: this.currentAngel.screenX,
                y: this.currentAngel.screenY
            } : { x: 0, y: 0 }
        };
    }

    /**
     * Set smoothing enabled/disabled
     * @param {boolean} enabled - Whether to enable smoothing
     */
    setSmoothingEnabled(enabled) {
        this.smoothingEnabled = enabled;
        console.log(`AngelDisplaySystem: Smoothing ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Update display update rate
     * @param {number} fps - Target frames per second
     */
    setDisplayUpdateRate(fps) {
        if (fps > 0 && fps <= 120) {
            this.displayUpdateRate = fps;
            this.updateInterval = 1000 / fps;
            console.log(`AngelDisplaySystem: Update rate set to ${fps} fps`);
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Clean up sprites and text
        if (this.angelSprite) {
            this.angelSprite.destroy();
        }
        if (this.horizontalText) {
            this.horizontalText.destroy();
        }
        if (this.verticalText) {
            this.verticalText.destroy();
        }

        // Clear references
        this.currentAngel = null;
        this.angelSprite = null;
        this.horizontalText = null;
        this.verticalText = null;

        console.log('AngelDisplaySystem: Destroyed');
    }
}