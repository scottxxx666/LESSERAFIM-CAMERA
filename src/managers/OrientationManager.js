/**
 * OrientationManager - Handles device orientation tracking, permission management, 
 * and device orientation validation for the motion-based angel display system.
 * 
 * Key features:
 * - Immediate permission request at game start
 * - Continuous device orientation monitoring
 * - Vertical (portrait) mode validation
 * - Reference horizon initialization and storage
 * - Relative orientation calculations from reference point
 */
export default class OrientationManager {
    constructor() {
        // Permission and tracking state
        this.isPermissionGranted = false;
        this.isTracking = false;
        this.isVerticalOrientation = false;
        this.orientationMessageVisible = false;
        
        // Orientation data
        this.referenceHorizon = 0;
        this.currentOrientation = 0;
        this.currentRaw = 0;
        this.currentSmoothed = 0;
        this.deltaFromReference = 0;
        this.lastUpdate = 0;
        
        // Configuration
        this.smoothingFactor = 0.2; // Smoothing for orientation data (0.1-0.3)
        this.verticalThreshold = 30; // Degrees from vertical to consider "portrait"
        
        // Callbacks
        this.orientationChangeCallbacks = [];
        this.verticalStateCallbacks = [];
        this.permissionCallbacks = [];
        
        // UI elements (will be set by game scene)
        this.orientationMessageElement = null;
        
        // Bind methods to preserve context
        this.handleOrientationChange = this.handleOrientationChange.bind(this);
    }

    /**
     * Initialize the orientation manager with immediate permission request
     * @returns {Promise<boolean>} True if initialization successful
     */
    async initialize() {
        console.log('OrientationManager: Initializing...');
        
        try {
            // Check if device orientation is supported
            if (!window.DeviceOrientationEvent) {
                throw new Error('DeviceOrientationEvent not supported');
            }
            
            // Request permission immediately
            const permissionGranted = await this.requestPermissionImmediately();
            
            if (permissionGranted) {
                // Start continuous monitoring
                this.startContinuousMonitoring();
                console.log('OrientationManager: Initialized successfully');
                return true;
            } else {
                console.warn('OrientationManager: Permission denied');
                this.notifyPermissionCallbacks(false);
                return false;
            }
            
        } catch (error) {
            console.error('OrientationManager: Initialization failed:', error);
            return false;
        }
    }

    /**
     * Request orientation permission immediately at game start
     * @returns {Promise<boolean>} True if permission granted
     */
    async requestPermissionImmediately() {
        try {
            // Check if iOS permission is needed
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                console.log('OrientationManager: Requesting iOS permission...');
                const permission = await DeviceOrientationEvent.requestPermission();
                this.isPermissionGranted = permission === 'granted';
                
                if (this.isPermissionGranted) {
                    console.log('OrientationManager: iOS permission granted');
                } else {
                    console.warn('OrientationManager: iOS permission denied');
                }
            } else {
                // Android or older iOS - assume permission granted
                this.isPermissionGranted = true;
                console.log('OrientationManager: Permission assumed granted (Android/older iOS)');
            }
            
            this.notifyPermissionCallbacks(this.isPermissionGranted);
            return this.isPermissionGranted;
            
        } catch (error) {
            console.error('OrientationManager: Permission request failed:', error);
            this.isPermissionGranted = false;
            this.notifyPermissionCallbacks(false);
            return false;
        }
    }

    /**
     * Start continuous device orientation monitoring with vertical validation
     */
    startContinuousMonitoring() {
        if (!this.isPermissionGranted) {
            console.warn('OrientationManager: Cannot start monitoring without permission');
            return;
        }
        
        console.log('OrientationManager: Starting continuous monitoring...');
        
        // Add orientation event listener
        window.addEventListener('deviceorientation', this.handleOrientationChange);
        
        // Add orientation change listener for portrait/landscape detection
        window.addEventListener('orientationchange', () => {
            // Small delay to let orientation settle
            setTimeout(() => {
                this.checkDeviceOrientation();
            }, 100);
        });
        
        // Initial orientation check
        this.checkDeviceOrientation();
        
        this.isTracking = true;
        console.log('OrientationManager: Continuous monitoring started');
    }

    /**
     * Handle device orientation change events
     * @param {DeviceOrientationEvent} event - The orientation event
     */
    handleOrientationChange(event) {
        // Only process if we have valid data and device is vertical
        if (event.alpha === null || !this.isVerticalOrientation) {
            return;
        }
        
        // Store raw orientation
        this.currentRaw = event.alpha;
        
        // Convert to 0-360 range
        let orientation = event.alpha;
        if (orientation < 0) orientation += 360;
        
        // Apply smoothing to reduce jitter
        if (this.currentSmoothed === 0) {
            // First reading - no smoothing
            this.currentSmoothed = orientation;
        } else {
            // Apply exponential smoothing
            this.currentSmoothed = this.currentSmoothed * (1 - this.smoothingFactor) + 
                                 orientation * this.smoothingFactor;
        }
        
        this.currentOrientation = this.currentSmoothed;
        this.lastUpdate = Date.now();
        
        // Calculate delta from reference horizon
        this.deltaFromReference = this.getCurrentRelativeOrientation();
        
        // Notify callbacks
        this.notifyOrientationCallbacks({
            raw: this.currentRaw,
            smoothed: this.currentSmoothed,
            current: this.currentOrientation,
            deltaFromReference: this.deltaFromReference,
            referenceHorizon: this.referenceHorizon,
            timestamp: this.lastUpdate
        });
    }

    /**
     * Check if device is in vertical (portrait) orientation
     * @returns {boolean} True if device is vertical
     */
    checkDeviceOrientation() {
        // Check screen orientation
        const orientation = screen.orientation || screen.mozOrientation || screen.msOrientation;
        let isVertical = false;
        
        if (orientation) {
            // Use screen orientation API if available
            const angle = orientation.angle || 0;
            isVertical = angle === 0 || angle === 180; // Portrait orientations
        } else {
            // Fallback to window dimensions
            isVertical = window.innerHeight > window.innerWidth;
        }
        
        const wasVertical = this.isVerticalOrientation;
        this.isVerticalOrientation = isVertical;
        
        // If orientation changed, notify callbacks
        if (wasVertical !== isVertical) {
            console.log(`OrientationManager: Device orientation changed to ${isVertical ? 'vertical' : 'horizontal'}`);
            this.notifyVerticalStateCallbacks(isVertical);
            
            // Set reference horizon when device becomes vertical
            if (isVertical && this.currentOrientation !== 0) {
                this.setReferenceHorizon(this.currentOrientation);
            }
            
            // Show/hide orientation message
            if (isVertical) {
                this.hideOrientationMessage();
            } else {
                this.showOrientationMessage();
            }
        }
        
        return isVertical;
    }

    /**
     * Set the reference horizon (initial 0-degree reference point)
     * @param {number} orientation - Current orientation to use as reference
     */
    setReferenceHorizon(orientation = null) {
        if (orientation !== null) {
            this.referenceHorizon = orientation;
        } else {
            this.referenceHorizon = this.currentOrientation;
        }
        
        console.log(`OrientationManager: Reference horizon set to ${this.referenceHorizon}°`);
        
        // Recalculate delta
        this.deltaFromReference = this.getCurrentRelativeOrientation();
    }

    /**
     * Get current orientation relative to reference horizon
     * @returns {number} Relative orientation in degrees (-180 to 180)
     */
    getCurrentRelativeOrientation() {
        let relative = this.currentOrientation - this.referenceHorizon;
        
        // Normalize to -180 to 180 range
        while (relative > 180) relative -= 360;
        while (relative < -180) relative += 360;
        
        return relative;
    }

    /**
     * Show orientation message to rotate device to vertical
     */
    showOrientationMessage() {
        if (this.orientationMessageVisible) return;
        
        this.orientationMessageVisible = true;
        console.log('OrientationManager: Showing rotate to vertical message');
        
        // Notify callbacks that orientation message should be shown
        this.notifyVerticalStateCallbacks(false, 'show_message');
    }

    /**
     * Hide device rotation message
     */
    hideOrientationMessage() {
        if (!this.orientationMessageVisible) return;
        
        this.orientationMessageVisible = false;
        console.log('OrientationManager: Hiding rotate to vertical message');
        
        // Notify callbacks that orientation message should be hidden
        this.notifyVerticalStateCallbacks(true, 'hide_message');
    }

    /**
     * Register callback for orientation changes
     * @param {Function} callback - Function to call on orientation change
     */
    onOrientationChange(callback) {
        if (typeof callback === 'function') {
            this.orientationChangeCallbacks.push(callback);
        }
    }

    /**
     * Register callback for vertical state changes
     * @param {Function} callback - Function to call on vertical state change
     */
    onVerticalStateChange(callback) {
        if (typeof callback === 'function') {
            this.verticalStateCallbacks.push(callback);
        }
    }

    /**
     * Register callback for permission state changes
     * @param {Function} callback - Function to call on permission change
     */
    onPermissionChange(callback) {
        if (typeof callback === 'function') {
            this.permissionCallbacks.push(callback);
        }
    }

    /**
     * Remove orientation change callback
     * @param {Function} callback - Callback to remove
     */
    removeOrientationCallback(callback) {
        const index = this.orientationChangeCallbacks.indexOf(callback);
        if (index > -1) {
            this.orientationChangeCallbacks.splice(index, 1);
        }
    }

    /**
     * Notify all orientation change callbacks
     * @param {Object} orientationData - Orientation data object
     */
    notifyOrientationCallbacks(orientationData) {
        this.orientationChangeCallbacks.forEach(callback => {
            try {
                callback(orientationData);
            } catch (error) {
                console.error('OrientationManager: Callback error:', error);
            }
        });
    }

    /**
     * Notify all vertical state callbacks
     * @param {boolean} isVertical - Whether device is vertical
     * @param {string} action - Optional action type
     */
    notifyVerticalStateCallbacks(isVertical, action = null) {
        this.verticalStateCallbacks.forEach(callback => {
            try {
                callback(isVertical, action);
            } catch (error) {
                console.error('OrientationManager: Vertical state callback error:', error);
            }
        });
    }

    /**
     * Notify all permission callbacks
     * @param {boolean} granted - Whether permission was granted
     */
    notifyPermissionCallbacks(granted) {
        this.permissionCallbacks.forEach(callback => {
            try {
                callback(granted);
            } catch (error) {
                console.error('OrientationManager: Permission callback error:', error);
            }
        });
    }

    /**
     * Stop orientation tracking and clean up
     */
    stopTracking() {
        if (this.isTracking) {
            window.removeEventListener('deviceorientation', this.handleOrientationChange);
            window.removeEventListener('orientationchange', this.checkDeviceOrientation);
            this.isTracking = false;
            console.log('OrientationManager: Tracking stopped');
        }
    }

    /**
     * Get current orientation state
     * @returns {Object} Current orientation state
     */
    getState() {
        return {
            isPermissionGranted: this.isPermissionGranted,
            isTracking: this.isTracking,
            isVerticalOrientation: this.isVerticalOrientation,
            orientationMessageVisible: this.orientationMessageVisible,
            referenceHorizon: this.referenceHorizon,
            currentOrientation: this.currentOrientation,
            currentRaw: this.currentRaw,
            currentSmoothed: this.currentSmoothed,
            deltaFromReference: this.deltaFromReference,
            lastUpdate: this.lastUpdate,
            smoothingFactor: this.smoothingFactor
        };
    }

    /**
     * Update smoothing factor for orientation data
     * @param {number} factor - Smoothing factor (0.1-0.3)
     */
    setSmoothingFactor(factor) {
        if (factor >= 0.1 && factor <= 0.3) {
            this.smoothingFactor = factor;
            console.log(`OrientationManager: Smoothing factor set to ${factor}`);
        } else {
            console.warn('OrientationManager: Invalid smoothing factor, must be between 0.1 and 0.3');
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.stopTracking();
        this.orientationChangeCallbacks = [];
        this.verticalStateCallbacks = [];
        this.permissionCallbacks = [];
        console.log('OrientationManager: Destroyed');
    }
}