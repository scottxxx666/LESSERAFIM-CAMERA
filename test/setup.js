// Test setup file for Vitest
import { vi } from 'vitest';

// Mock DeviceOrientationEvent for testing
global.DeviceOrientationEvent = class DeviceOrientationEvent extends Event {
  constructor(type, eventInitDict = {}) {
    super(type, eventInitDict);
    this.alpha = eventInitDict.alpha || null;
    this.beta = eventInitDict.beta || null;
    this.gamma = eventInitDict.gamma || null;
    this.absolute = eventInitDict.absolute || false;
  }
};

// Add static requestPermission method that can be mocked
DeviceOrientationEvent.requestPermission = vi.fn().mockResolvedValue('granted');

// Mock screen orientation with writable properties
const mockOrientation = {
  angle: 0,
  type: 'portrait-primary'
};

global.screen = {
  orientation: mockOrientation
};

// Make screen.orientation properties writable
Object.defineProperty(mockOrientation, 'angle', {
  writable: true,
  configurable: true,
  value: 0
});

// Mock window dimensions for orientation detection
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 375
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 667
});

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};