import { describe, it, expect, beforeEach, vi } from 'vitest';
import AngelDisplaySystem from '../../src/systems/AngelDisplaySystem.js';

// Mock Phaser scene
const createMockScene = () => ({
    cameras: {
        main: {
            width: 800,
            height: 600
        }
    },
    add: {
        image: vi.fn().mockReturnValue({
            setScale: vi.fn().mockReturnThis(),
            setAlpha: vi.fn().mockReturnThis(),
            setScrollFactor: vi.fn().mockReturnThis(),
            x: 400,
            y: 300,
            destroy: vi.fn()
        }),
        text: vi.fn().mockReturnValue({
            setScrollFactor: vi.fn().mockReturnThis(),
            setText: vi.fn(),
            destroy: vi.fn()
        })
    },
    tweens: {
        add: vi.fn()
    }
});

describe('AngelDisplaySystem', () => {
    let angelDisplaySystem;
    let mockScene;

    beforeEach(() => {
        mockScene = createMockScene();
        angelDisplaySystem = new AngelDisplaySystem(mockScene);
    });

    describe('Initialization', () => {
        it('should initialize with default values', () => {
            expect(angelDisplaySystem.horizontalAngle).toBe(0);
            expect(angelDisplaySystem.verticalAngle).toBe(0);
            expect(angelDisplaySystem.displayUpdateRate).toBe(60);
            expect(angelDisplaySystem.smoothingEnabled).toBe(true);
            expect(angelDisplaySystem.angleResolution).toBe(1);
        });

        it('should have correct spherical coordinate ranges', () => {
            expect(angelDisplaySystem.horizontalRange).toEqual({ min: 0, max: 360 });
            expect(angelDisplaySystem.verticalRange).toEqual({ min: -90, max: 90 });
        });

        it('should initialize display correctly', () => {
            angelDisplaySystem.initializeDisplay();
            
            expect(mockScene.add.image).toHaveBeenCalledWith(400, 300, 'angel');
            expect(mockScene.add.text).toHaveBeenCalledTimes(2);
            expect(angelDisplaySystem.currentAngel).toBeDefined();
            expect(angelDisplaySystem.angelSprite).toBeDefined();
            expect(angelDisplaySystem.horizontalText).toBeDefined();
            expect(angelDisplaySystem.verticalText).toBeDefined();
        });
    });

    describe('Angle Conversion', () => {
        describe('calculateHorizontalAngle', () => {
            it('should convert positive alpha to 0-360 range', () => {
                expect(angelDisplaySystem.calculateHorizontalAngle(45)).toBe(45);
                expect(angelDisplaySystem.calculateHorizontalAngle(180)).toBe(180);
                expect(angelDisplaySystem.calculateHorizontalAngle(359)).toBe(359);
            });

            it('should convert negative alpha to 0-360 range', () => {
                expect(angelDisplaySystem.calculateHorizontalAngle(-45)).toBe(315);
                expect(angelDisplaySystem.calculateHorizontalAngle(-180)).toBe(180);
                expect(angelDisplaySystem.calculateHorizontalAngle(-1)).toBe(359);
            });

            it('should handle null/undefined alpha', () => {
                expect(angelDisplaySystem.calculateHorizontalAngle(null)).toBe(0);
                expect(angelDisplaySystem.calculateHorizontalAngle(undefined)).toBe(0);
            });

            it('should round to angle resolution', () => {
                expect(angelDisplaySystem.calculateHorizontalAngle(45.7)).toBe(46);
                expect(angelDisplaySystem.calculateHorizontalAngle(45.3)).toBe(45);
            });
        });

        describe('calculateVerticalAngle', () => {
            it('should clamp beta to -90 to 90 range', () => {
                expect(angelDisplaySystem.calculateVerticalAngle(45)).toBe(45);
                expect(angelDisplaySystem.calculateVerticalAngle(-45)).toBe(-45);
                expect(angelDisplaySystem.calculateVerticalAngle(90)).toBe(90);
                expect(angelDisplaySystem.calculateVerticalAngle(-90)).toBe(-90);
            });

            it('should clamp values outside valid range', () => {
                expect(angelDisplaySystem.calculateVerticalAngle(120)).toBe(90);
                expect(angelDisplaySystem.calculateVerticalAngle(-120)).toBe(-90);
                expect(angelDisplaySystem.calculateVerticalAngle(180)).toBe(90);
            });

            it('should handle null/undefined beta', () => {
                expect(angelDisplaySystem.calculateVerticalAngle(null)).toBe(0);
                expect(angelDisplaySystem.calculateVerticalAngle(undefined)).toBe(0);
            });

            it('should round to angle resolution', () => {
                expect(angelDisplaySystem.calculateVerticalAngle(45.7)).toBe(46);
                expect(angelDisplaySystem.calculateVerticalAngle(-45.3)).toBe(-45);
            });
        });

        describe('convertToSphericalCoordinates', () => {
            it('should convert device orientation to spherical coordinates', () => {
                const orientation = { alpha: 90, beta: 45, gamma: 0 };
                const result = angelDisplaySystem.convertToSphericalCoordinates(orientation);
                
                expect(result.horizontal).toBe(90);
                expect(result.vertical).toBe(45);
            });

            it('should handle negative alpha values', () => {
                const orientation = { alpha: -90, beta: -30, gamma: 0 };
                const result = angelDisplaySystem.convertToSphericalCoordinates(orientation);
                
                expect(result.horizontal).toBe(270);
                expect(result.vertical).toBe(-30);
            });

            it('should normalize angles correctly', () => {
                const orientation = { alpha: 450, beta: 120, gamma: 0 };
                const result = angelDisplaySystem.convertToSphericalCoordinates(orientation);
                
                expect(result.horizontal).toBe(90); // 450 % 360 = 90
                expect(result.vertical).toBe(90);   // Clamped to max
            });
        });
    });

    describe('Angle Normalization', () => {
        describe('normalizeAngles', () => {
            it('should normalize horizontal angles to 0-360 range', () => {
                const result1 = angelDisplaySystem.normalizeAngles(450, 0);
                expect(result1.horizontal).toBe(90);

                const result2 = angelDisplaySystem.normalizeAngles(-90, 0);
                expect(result2.horizontal).toBe(270);
            });

            it('should clamp vertical angles to -90 to 90 range', () => {
                const result1 = angelDisplaySystem.normalizeAngles(0, 120);
                expect(result1.vertical).toBe(90);

                const result2 = angelDisplaySystem.normalizeAngles(0, -120);
                expect(result2.vertical).toBe(-90);
            });

            it('should handle edge cases', () => {
                const result = angelDisplaySystem.normalizeAngles(360, 90);
                expect(result.horizontal).toBe(0);
                expect(result.vertical).toBe(90);
            });
        });

        describe('handleAngleWrapAround', () => {
            it('should wrap angles >= 360 to 0-360 range', () => {
                expect(angelDisplaySystem.handleAngleWrapAround(360)).toBe(0);
                expect(angelDisplaySystem.handleAngleWrapAround(450)).toBe(90);
                expect(angelDisplaySystem.handleAngleWrapAround(720)).toBe(0);
            });

            it('should wrap negative angles to 0-360 range', () => {
                expect(angelDisplaySystem.handleAngleWrapAround(-90)).toBe(270);
                expect(angelDisplaySystem.handleAngleWrapAround(-180)).toBe(180);
                expect(angelDisplaySystem.handleAngleWrapAround(-360)).toBe(0);
            });

            it('should leave valid angles unchanged', () => {
                expect(angelDisplaySystem.handleAngleWrapAround(0)).toBe(0);
                expect(angelDisplaySystem.handleAngleWrapAround(180)).toBe(180);
                expect(angelDisplaySystem.handleAngleWrapAround(359)).toBe(359);
            });
        });
    });

    describe('Display Updates', () => {
        beforeEach(() => {
            angelDisplaySystem.initializeDisplay();
        });

        describe('updateCurrentAngel', () => {
            it('should update angel angles from orientation data', () => {
                // Reset last update time to ensure update happens
                angelDisplaySystem.lastUpdateTime = 0;
                
                const orientation = { alpha: 90, beta: 45, gamma: 0 };
                angelDisplaySystem.updateCurrentAngel(orientation);
                
                expect(angelDisplaySystem.horizontalAngle).toBe(90);
                expect(angelDisplaySystem.verticalAngle).toBe(45);
                expect(angelDisplaySystem.currentAngel.horizontalAngle).toBe(90);
                expect(angelDisplaySystem.currentAngel.verticalAngle).toBe(45);
            });

            it('should respect update rate limiting', () => {
                // Reset last update time to ensure first update happens
                angelDisplaySystem.lastUpdateTime = 0;
                
                const orientation = { alpha: 90, beta: 45, gamma: 0 };
                
                // First update should work
                angelDisplaySystem.updateCurrentAngel(orientation);
                expect(angelDisplaySystem.horizontalAngle).toBe(90);
                
                // Immediate second update should be skipped due to rate limiting
                const orientation2 = { alpha: 180, beta: 30, gamma: 0 };
                angelDisplaySystem.updateCurrentAngel(orientation2);
                expect(angelDisplaySystem.horizontalAngle).toBe(90); // Should still be 90
            });
        });

        describe('displayAngleValues', () => {
            it('should update text displays with formatted angles', () => {
                angelDisplaySystem.displayAngleValues(90, 45);
                
                expect(angelDisplaySystem.horizontalText.setText).toHaveBeenCalledWith('H: 90°');
                expect(angelDisplaySystem.verticalText.setText).toHaveBeenCalledWith('V: 45°');
            });

            it('should handle negative vertical angles', () => {
                angelDisplaySystem.displayAngleValues(270, -30);
                
                expect(angelDisplaySystem.horizontalText.setText).toHaveBeenCalledWith('H: 270°');
                expect(angelDisplaySystem.verticalText.setText).toHaveBeenCalledWith('V: -30°');
            });
        });

        describe('calculateScreenPosition', () => {
            it('should map angles to screen coordinates correctly', () => {
                const pos1 = angelDisplaySystem.calculateScreenPosition(0, 0);
                expect(pos1.x).toBe(0);
                expect(pos1.y).toBe(300); // Middle Y for 0° vertical

                const pos2 = angelDisplaySystem.calculateScreenPosition(180, 0);
                expect(pos2.x).toBe(400); // Half width for 180°
                expect(pos2.y).toBe(300);

                const pos3 = angelDisplaySystem.calculateScreenPosition(0, 90);
                expect(pos3.x).toBe(0);
                expect(pos3.y).toBe(0); // Top for 90° vertical

                const pos4 = angelDisplaySystem.calculateScreenPosition(0, -90);
                expect(pos4.x).toBe(0);
                expect(pos4.y).toBe(600); // Bottom for -90° vertical
            });
        });
    });

    describe('Text Formatting', () => {
        describe('formatAngleText', () => {
            it('should format angles with prefix and degree symbol', () => {
                expect(angelDisplaySystem.formatAngleText(45, 'H')).toBe('H: 45°');
                expect(angelDisplaySystem.formatAngleText(-30, 'V')).toBe('V: -30°');
                expect(angelDisplaySystem.formatAngleText(180)).toBe(': 180°');
            });

            it('should round angles to whole degrees', () => {
                expect(angelDisplaySystem.formatAngleText(45.7, 'H')).toBe('H: 46°');
                expect(angelDisplaySystem.formatAngleText(45.3, 'H')).toBe('H: 45°');
                expect(angelDisplaySystem.formatAngleText(-30.6, 'V')).toBe('V: -31°');
            });

            it('should handle 360° wrap-around for horizontal angles', () => {
                expect(angelDisplaySystem.formatAngleText(360, 'H')).toBe('H: 0°');
                expect(angelDisplaySystem.formatAngleText(361, 'H')).toBe('H: 0°');
                expect(angelDisplaySystem.formatAngleText(359.8, 'H')).toBe('H: 0°');
            });

            it('should not wrap vertical angles', () => {
                expect(angelDisplaySystem.formatAngleText(360, 'V')).toBe('V: 360°');
                expect(angelDisplaySystem.formatAngleText(90, 'V')).toBe('V: 90°');
            });
        });
    });

    describe('Configuration', () => {
        it('should update smoothing setting', () => {
            angelDisplaySystem.setSmoothingEnabled(false);
            expect(angelDisplaySystem.smoothingEnabled).toBe(false);

            angelDisplaySystem.setSmoothingEnabled(true);
            expect(angelDisplaySystem.smoothingEnabled).toBe(true);
        });

        it('should update display update rate', () => {
            angelDisplaySystem.setDisplayUpdateRate(30);
            expect(angelDisplaySystem.displayUpdateRate).toBe(30);
            expect(angelDisplaySystem.updateInterval).toBeCloseTo(33.33, 1);

            angelDisplaySystem.setDisplayUpdateRate(120);
            expect(angelDisplaySystem.displayUpdateRate).toBe(120);
            expect(angelDisplaySystem.updateInterval).toBeCloseTo(8.33, 1);
        });

        it('should reject invalid update rates', () => {
            const originalRate = angelDisplaySystem.displayUpdateRate;
            
            angelDisplaySystem.setDisplayUpdateRate(0);
            expect(angelDisplaySystem.displayUpdateRate).toBe(originalRate);

            angelDisplaySystem.setDisplayUpdateRate(-10);
            expect(angelDisplaySystem.displayUpdateRate).toBe(originalRate);

            angelDisplaySystem.setDisplayUpdateRate(150);
            expect(angelDisplaySystem.displayUpdateRate).toBe(originalRate);
        });
    });

    describe('State Management', () => {
        beforeEach(() => {
            angelDisplaySystem.initializeDisplay();
        });

        it('should return current angel state', () => {
            angelDisplaySystem.horizontalAngle = 90;
            angelDisplaySystem.verticalAngle = 45;
            
            const state = angelDisplaySystem.getCurrentAngelState();
            
            expect(state.horizontalAngle).toBe(90);
            expect(state.verticalAngle).toBe(45);
            expect(state.isVisible).toBe(true);
            expect(state.screenPosition).toBeDefined();
            expect(state.currentAngel).toBeDefined();
        });
    });

    describe('Cleanup', () => {
        beforeEach(() => {
            angelDisplaySystem.initializeDisplay();
        });

        it('should clean up resources on destroy', () => {
            const angelSprite = angelDisplaySystem.angelSprite;
            const horizontalText = angelDisplaySystem.horizontalText;
            const verticalText = angelDisplaySystem.verticalText;
            
            angelDisplaySystem.destroy();
            
            expect(angelSprite.destroy).toHaveBeenCalled();
            expect(horizontalText.destroy).toHaveBeenCalled();
            expect(verticalText.destroy).toHaveBeenCalled();
            expect(angelDisplaySystem.currentAngel).toBeNull();
            expect(angelDisplaySystem.angelSprite).toBeNull();
            expect(angelDisplaySystem.horizontalText).toBeNull();
            expect(angelDisplaySystem.verticalText).toBeNull();
        });
    });

    describe('Edge Cases', () => {
        it('should handle missing sprite gracefully', () => {
            angelDisplaySystem.angelSprite = null;
            expect(() => angelDisplaySystem.renderAngelAtPosition()).not.toThrow();
        });

        it('should handle missing text elements gracefully', () => {
            angelDisplaySystem.horizontalText = null;
            angelDisplaySystem.verticalText = null;
            expect(() => angelDisplaySystem.displayAngleValues(90, 45)).not.toThrow();
        });

        it('should handle extreme angle values', () => {
            const result = angelDisplaySystem.convertToSphericalCoordinates({
                alpha: 999999,
                beta: -999999,
                gamma: 0
            });
            
            expect(result.horizontal).toBeGreaterThanOrEqual(0);
            expect(result.horizontal).toBeLessThan(360);
            expect(result.vertical).toBe(-90);
        });
    });
});