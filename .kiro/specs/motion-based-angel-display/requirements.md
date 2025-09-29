# Requirements Document

## Introduction

This feature enhances the existing web game by implementing a motion-based angel display system that continuously shows the current angel position. Angels are positioned using a full spherical coordinate system with vertical angles from -90 to 90 degrees and horizontal angles from 0 to 360 degrees. The system continuously displays the current angel without requiring any user interaction, providing real-time feedback of device orientation within the complete spherical range.

## Requirements

### Requirement 1

**User Story:** As a player, I want to see the current angel position displayed continuously based on my device orientation, so that I have real-time feedback of my position within the full spherical range.

#### Acceptance Criteria

1. WHEN the game starts THEN the system SHALL initialize with horizontal range 0-360 degrees and vertical range -90 to 90 degrees
2. WHEN the device orientation changes THEN the current angel SHALL be displayed immediately without any user interaction
3. WHEN the device is oriented vertically upward THEN the vertical angle SHALL show 90 degrees
4. WHEN the device is oriented vertically downward THEN the vertical angle SHALL show -90 degrees
5. WHEN the device orientation permission is not granted THEN the system SHALL display a clear message requesting permission

### Requirement 2

**User Story:** As a player, I want the current angel to continuously track my device orientation across the full spherical range, so that I can see my exact position in 3D space.

#### Acceptance Criteria

1. WHEN the device rotates horizontally THEN the horizontal angle SHALL update continuously from 0 to 360 degrees
2. WHEN the device tilts vertically THEN the vertical angle SHALL update continuously from -90 to 90 degrees
3. WHEN the device orientation changes THEN the current angel position SHALL update immediately without delay
4. WHEN the device completes a full horizontal rotation THEN the horizontal angle SHALL transition smoothly from 360 back to 0 degrees

### Requirement 3

**User Story:** As a player, I want the angel display to show numerical values for both horizontal and vertical angles, so that I can see precise orientation measurements.

#### Acceptance Criteria

1. WHEN the current angel is displayed THEN it SHALL show the horizontal angle value (0-360 degrees)
2. WHEN the current angel is displayed THEN it SHALL show the vertical angle value (-90 to 90 degrees)
3. WHEN the device orientation changes THEN both angle values SHALL update in real-time
4. WHEN the angle values are displayed THEN they SHALL be rounded to whole degrees for readability
5. WHEN the horizontal angle reaches 360 degrees THEN it SHALL display as 0 degrees

### Requirement 4

**User Story:** As a player, I want the system to request orientation permission immediately and work reliably across different mobile devices, so that I can start using the angel display without delays.

#### Acceptance Criteria

1. WHEN the game starts THEN it SHALL immediately request device orientation permission before any other initialization
2. WHEN the game runs on iOS devices THEN it SHALL request DeviceOrientationEvent permission properly
3. WHEN the game runs on Android devices THEN it SHALL access device orientation without additional permissions
4. WHEN orientation permission is denied THEN the system SHALL display a clear message explaining why permission is needed and provide a retry option
5. WHEN device orientation is not supported THEN the system SHALL display an informative message about device limitations

### Requirement 5

**User Story:** As a player, I want smooth performance when moving my device, so that the angel display updates feel responsive and natural.

#### Acceptance Criteria

1. WHEN device orientation updates are received THEN angel position updates SHALL complete within 16ms (60fps)
2. WHEN the current angel is being displayed THEN the frame rate SHALL remain above 30fps
3. WHEN orientation data is noisy or inconsistent THEN the system SHALL apply smoothing to prevent jittery movement
4. WHEN the device is moved rapidly THEN angel position updates SHALL remain smooth without lag or stuttering