# 360° Photo Hunt Game with Phaser 3

## Project Overview
A mobile web game where players use their device's camera and gyroscope to hunt for virtual objects in a 360-degree environment. Players score points by "photographing" PNG objects overlaid on the camera feed.

## Technical Stack
- **Game Engine**: Phaser 3
- **Gyroscope Library**: gyronorm.js
- **Target Platform**: Mobile web browsers (iOS/Android)

## Core Game Mechanics

### 1. Camera as Background
- Use device camera feed as the game background
- Implement using MediaStream API
- Display camera feed using HTML5 video element
- Overlay Phaser game canvas on top

### 2. Virtual Objects
- PNG sprites positioned in the game world
- Objects remain at fixed world positions
- Use Phaser's sprite system for rendering
- Support transparency for realistic overlay effect

### 3. Gyroscope Controls
- Device orientation controls camera/viewport movement
- Handle 360-degree rotation including device flip (>90° vertical)
- Front world (0-90°) and back world (90-180°) switching
- Smooth camera movement following device orientation

### 4. Object Detection
- Use Phaser's camera bounds checking
- Check if sprites are within `camera.worldView`
- Use sprite's `inCamera` property for visibility detection
- Track which objects are currently visible

### 5. Photo Capture System
- Capture button to take photos
- Detect which objects are in frame during capture
- Award points for successfully photographed objects
- Save captured photos with visible objects highlighted

### 6. Scoring System
- Points awarded for each unique object photographed
- Bonus points for capturing multiple objects in one photo
- Track already photographed objects to prevent duplicates

## Implementation Details

### Scene Structure
```
- MainScene: Core gameplay with camera and objects
- UIScene: Overlay scene for UI elements (score, buttons)
- GalleryScene: View captured photos and achievements
```

### Camera Setup
- Request camera permissions
- Set video element as background
- Position Phaser canvas overlay
- Handle permission denied scenarios

### Gyroscope Integration
- Map gyroscope data to Phaser camera position
- Handle iOS permission requirements
- show error if desktop

### Object Management
- Object pool for efficient sprite management
- Define spawn positions in 360° space
- Different object sets for front/back worlds
- Visibility culling for performance

### Photo Capture Flow
1. User taps capture button
2. Check all sprites in `camera.worldView`
3. Calculate score based on visible objects
4. Store photo data with metadata
5. Show capture success animation
6. Update UI with new score

## UI Components

### HUD Elements
- Score display (top-left)
- Target objects checklist (top-right)
- Camera/capture button (bottom-center)
- Crosshair/viewfinder (center)
- Photo gallery preview (bottom-right)

### Photo Gallery
- Grid view of captured photos
- Shows which objects were captured in each photo
- Total score summary
- Share functionality

## Performance Considerations
- Use sprite pooling for objects
- Implement frustum culling
- Optimize PNG assets (appropriate resolution)
- Limit simultaneous on-screen objects
- Use Phaser's built-in optimizations

## Required Assets
- PNG sprites for collectible objects
- UI elements (buttons, frames, icons)
- Sound effects (camera shutter, success, etc.)
- Background music (optional)

## Development Phases

### Phase 1: Core Mechanics
- Camera feed integration
- Basic Phaser scene setup
- Gyroscope controls implementation

### Phase 2: Game Logic
- Object spawning system
- Visibility detection
- Photo capture mechanics
- Scoring system

### Phase 3: Polish
- UI/UX improvements
- Visual effects and animations
- Sound implementation
- Performance optimization

### Phase 4: Features
- Photo gallery
- Different game modes
- Achievements system
- Social sharing

## Technical Challenges & Solutions

### Challenge: 360° World Representation in 2D
**Solution**: Create two separate object groups (front/back), switch between them based on device orientation

### Challenge: Camera Feed Performance
**Solution**: Use lower resolution for game logic, full resolution only for photo capture

### Challenge: Cross-platform Compatibility
**Solution**: Implement progressive enhancement with fallbacks for missing features

## Dependencies
```json
{
  "phaser": "^3.x.x",
  "gyronorm": "^2.0.6"
}
```

## Browser Requirements
- WebRTC support for camera access
- DeviceOrientation API for gyroscope
- HTTPS required for camera permissions
- Modern mobile browser (Chrome, Safari, Firefox)

## Notes for Implementation
- Start with a simple prototype using static background
- Test gyroscope integration early on real devices
- Consider battery usage with continuous camera feed
- Implement proper error handling for permissions
- Design for both portrait and landscape orientations
