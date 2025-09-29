# Implementation Plan

- [x] 1. Update OrientationManager class for continuous orientation tracking without device orientation restrictions
  - Modify existing `src/managers/OrientationManager.js` to remove portrait mode validation
  - Implement continuous orientation tracking that works in any device orientation
  - Add methods for processing raw orientation data (alpha, beta, gamma) into spherical coordinates
  - Remove reference horizon logic and device orientation validation
  - Update unit tests to focus on continuous tracking and data processing
  - _Requirements: 1.1, 1.2, 4.1, 4.2_

- [x] 2. Create AngelDisplaySystem for continuous angel display with angle calculations
  - Create new file `src/systems/AngelDisplaySystem.js` with class structure
  - Implement methods to convert device orientation (alpha, beta, gamma) to spherical coordinates
  - Add horizontal angle conversion (0-360°) and vertical angle conversion (-90° to 90°)
  - Implement continuous angel display that always shows the current angel
  - Add real-time angle value display with text formatting (rounded to whole degrees)
  - Handle angle wrap-around for horizontal angles (360° to 0° transition)
  - Write unit tests for angle conversion, display updates, and text formatting
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4_

- [x] 3. Update GameScene to use continuous angel display system
  - Modify GameScene to request orientation permission immediately on scene start
  - Initialize AngelDisplaySystem for continuous angel display
  - Replace existing angel setup with single current angel display
  - Connect OrientationManager to AngelDisplaySystem for real-time updates
  - Remove field of view and multiple angel logic
  - _Requirements: 1.1, 1.2, 4.1, 4.2_

- [ ] 4. Implement continuous orientation tracking and visual updates
  - Implement continuous orientation event handling that updates angel position and angle display
  - Ensure angel sprite position and angle text values update immediately on device movement
  - Add smooth visual transitions when angel position changes
  - Test continuous tracking works smoothly without user interaction
  - Test that visual updates maintain 60fps performance target
  - _Requirements: 1.2, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 5.1, 5.4_

- [ ] 5. Add orientation smoothing and error handling
  - Implement orientation data smoothing in OrientationManager to reduce jitter
  - Add error handling for null/undefined orientation values in AngelDisplaySystem
  - Implement fallback behavior when orientation data is inconsistent
  - Test smooth orientation tracking with rapid device movement
  - Ensure angle wrap-around (360° to 0°) works smoothly
  - _Requirements: 2.4, 5.3, 5.4_

- [ ] 6. Add initial angel display setup and optimize performance
  - Ensure current angel is immediately visible on game start
  - Initialize angel at center position with default angles (0°, 0°)
  - Implement proper initial angle text display showing starting values
  - Profile angel position update performance during continuous orientation tracking
  - Optimize angle calculation and rendering pipeline for 60fps operation
  - Test that initial angel display appears correctly and responds immediately to device orientation
  - _Requirements: 1.1, 1.2, 3.3, 5.1, 5.2, 5.4_

- [ ] 7. Create integration tests for complete continuous angel display system
  - Write integration tests covering immediate permission request to continuous angel display flow
  - Test complete user journey from game start with permission request to real-time angel updates
  - Verify continuous angle updates work correctly with real orientation changes
  - Test edge cases like permission denial, rapid device movement, and angle wrap-around
  - Test cross-platform compatibility for iOS and Android permission handling
  - Verify full spherical range works correctly (horizontal: 0-360°, vertical: -90° to 90°)
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.4, 4.1, 4.2, 5.4_