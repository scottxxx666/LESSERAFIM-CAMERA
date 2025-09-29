# 360° Photo Hunt Game

A mobile web game where players use their device's camera and gyroscope to hunt for virtual objects in a 360-degree environment. Players score points by "photographing" PNG objects overlaid on the camera feed.

## Features

- **360° Camera Experience**: Use your device camera as the game background
- **Gyroscope Controls**: Device orientation controls camera movement
- **Virtual Object Hunting**: Find and photograph PNG sprites overlaid on the real world
- **Photo Gallery**: View captured photos and track your achievements
- **Mobile-First Design**: Optimized for iOS and Android browsers

## Technology Stack

- **Phaser 3** - Game engine
- **gyronorm.js** - Gyroscope integration
- **MediaStream API** - Camera access
- **DeviceOrientation API** - Motion controls

## Requirements

- Modern mobile browser (Chrome, Safari, Firefox)
- HTTPS connection (required for camera permissions)
- Device with camera and gyroscope
- WebRTC support

## Getting Started

**Note: This project uses Yarn as the preferred package manager.**

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Start development server:
   ```bash
   yarn start
   ```
4. Run tests:
   ```bash
   yarn test
   ```
5. Open in mobile browser over HTTPS

## Game Mechanics

### Core Gameplay
- Use gyroscope to look around 360° environment
- Virtual objects appear as PNG overlays on camera feed
- Tap capture button to photograph visible objects
- Score points for each unique object captured

### Controls
- **Device Rotation**: Look around the environment
- **Capture Button**: Take photo of current view
- **Gallery**: View captured photos and scores

### Scoring
- Points awarded for each photographed object
- Bonus points for multiple objects in one photo
- No duplicate scoring for same objects

## Development

### Project Structure
```
src/
├── scenes/          # Phaser game scenes
├── sprites/         # Game objects and sprites
├── utils/           # Helper functions
└── assets/          # Game assets (images, sounds)
```

### Key Components
- **MainScene**: Core gameplay with camera and objects
- **UIScene**: Overlay UI elements
- **GalleryScene**: Photo gallery and achievements
- **GyroscopeManager**: Device orientation handling
- **CameraManager**: Camera feed integration

## Browser Support

- iOS Safari 11+
- Android Chrome 67+
- Android Firefox 68+
- Other WebRTC-capable mobile browsers

## Permissions

The game requires:
- **Camera Access**: For background video feed
- **Device Motion**: For gyroscope controls (iOS requires user interaction)

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.