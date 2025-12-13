<img src="src/assets/logo.svg" alt="ShootPlay Fun Logo" width="120" height="120" align="left" style="margin-right: 10px;">

# ShootPlay Fun

A fast-paced, browser-based multiplayer shooter game built with React Three Fiber and Playroom SDK. Features Solana wallet integration, customizable weapons, real-time multiplayer combat, and stunning 3D graphics.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![Three.js](https://img.shields.io/badge/Three.js-0.160-black.svg)
![Solana](https://img.shields.io/badge/Solana-Enabled-9945FF.svg)

## ✨ Features

### 🎯 Core Gameplay
- **Real-time Multiplayer**: Up to 4 players in the same match
- **14 Unique Weapons**: From AK-47 to Rocket Launchers and Melee weapons
- **12 Skin Colors**: Customize your character with unique color schemes
- **Mouse Look Controls**: Full 360° FPS-style camera controls
- **Physics-Based Movement**: Realistic character movement with React Three Rapier
- **Dynamic Spawn System**: Random spawn points with fallback system

### 🔗 Web3 Integration
- **Solana Wallet Support**: Connect with Phantom, Solflare, or Backpack
- **Optional Play**: Continue without wallet connection
- **NFT Rewards**: Earn exclusive weapon skins (coming soon)
- **On-chain Stats**: Track your performance on Solana blockchain

### 🎨 Visual Features
- **Bloom Effects**: Post-processing for enhanced visuals
- **Soft Shadows**: Dynamic lighting system
- **Performance Optimization**: Auto-detects low-end devices
- **Responsive Design**: Works on desktop and mobile browsers

### 👥 Multiplayer Features
- **Playroom SDK Integration**: Seamless multiplayer lobbies
- **Player Profiles**: Custom names and avatar colors
- **Real-time Sync**: Bullet physics, player positions, and hits
- **Leaderboard**: Track kills and deaths

## 🛠️ Tech Stack

- **Frontend Framework**: React 18.x
- **3D Engine**: Three.js (via React Three Fiber)
- **Physics**: React Three Rapier
- **Build Tool**: Vite
- **Blockchain**: Solana Web3.js
- **Post-Processing**: React Three Postprocessing

## 📦 Installation

### Prerequisites
- Node.js 16.x or higher
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/NexCoreGames/ShootArena.git
cd ShootArena
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
VITE_PLAYROOM_API_KEY=your_playroom_api_key_here
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:5173`

## 🎮 How to Play

### Game Flow

1. **Wallet Connection (Optional)**
   - Choose to connect your Solana wallet (Phantom recommended)
   - Or continue without wallet connection

2. **Lobby Setup**
   - Pick your avatar color (12 options)
   - Select your weapon (14 options)
   - Enter your player name
   - Click "Launch" to start

3. **Gameplay**
   - **WASD** or **Arrow Keys**: Move
   - **Mouse**: Look around (click to lock pointer)
   - **Left Click** or **Space**: Shoot
   - **ESC**: Unlock mouse pointer

### Controls Reference

| Action | Key/Input |
|--------|-----------|
| Move Forward | W / Up Arrow |
| Move Backward | S / Down Arrow |
| Strafe Left | A / Left Arrow |
| Strafe Right | D / Right Arrow |
| Look Around | Mouse Movement |
| Shoot | Left Click / Space |
| Lock Cursor | Left Click |
| Unlock Cursor | ESC |

## ⚙️ Configuration

### Camera Settings

Edit `src/components/CharacterController.jsx`:

```javascript
// Indoor maps (close quarters)
const cameraDistanceY = 4-5;  // Height
const cameraDistanceZ = 6-8;  // Distance

// Outdoor maps (open spaces)
const cameraDistanceY = 16-20;
const cameraDistanceZ = 12-16;

// First-person view
const cameraDistanceY = 2-2.5;
const cameraDistanceZ = 3-4;
```

### Mouse Sensitivity

```javascript
const sensitivity = 0.002; // Default
// Lower: 0.001, Higher: 0.003
```

## 🔌 Solana Wallet Integration

### Supported Wallets
- **Phantom**: Most popular Solana wallet
- **Solflare**: Advanced features
- **Backpack**: Mobile-friendly
- Any wallet supporting Solana's standard

### Integration Code

```javascript
// Detect and connect Phantom
if (window.solana && window.solana.isPhantom) {
  const response = await window.solana.connect();
  const publicKey = response.publicKey.toString();
  // User connected!
}
```

### Wallet Features
- Earn SOL rewards for kills (coming soon)
- Unlock NFT weapon skins
- Track stats on-chain
- Trade items on Magic Eden


### Network Features
- **Real-time sync**: 60 FPS multiplayer
- **Host authority**: Host controls game state
- **Bullet sync**: Physics synchronized across clients
- **Player state**: Health, kills, deaths tracked

## 📁 Project Structure

```
ShootArena/
├── src/
│   ├── components/
│   │   ├── App.jsx                    # Main app with wallet flow
│   │   ├── WalletConnect.jsx          # Solana wallet connection
│   │   ├── WeaponSelector.jsx         # Weapon selection UI
│   │   ├── Experience.jsx             # Game scene manager
│   │   ├── CharacterController.jsx    # Player controller
│   │   ├── CharacterSoldier.jsx       # Character 3D model
│   │   ├── Map.jsx                    # Game map
│   │   ├── Bullet.jsx                 # Bullet physics
│   │   ├── BulletHit.jsx             # Hit effects
│   │   └── Leaderboard.jsx           # Score tracking
│   ├── main.jsx                       # Entry point
│   └── index.css                      # Global styles
├── public/                            # Static assets
├── .env                               # Environment variables
├── package.json                       # Dependencies
├── vite.config.js                     # Vite configuration
└── README.md                          # This file
```

## 🐛 Troubleshooting

### Common Issues

**1. Game won't start**
- Check if Playroom API key is set in `.env`
- Ensure port 5173 is not in use
- Clear browser cache and reload

**2. Multiplayer not working**
- Verify Playroom API key is valid
- Check browser console for errors
- Ensure both players are on the same network/internet

**3. Wallet won't connect**
- Install Phantom wallet from [phantom.app](https://phantom.app)
- Ensure wallet extension is unlocked
- Try refreshing the page

**4. Camera issues**
- Click to lock mouse pointer
- Press ESC to unlock
- Adjust sensitivity in CharacterController.jsx

**5. Performance issues**
- Game auto-detects low-end devices
- Disable bloom effects in App.jsx
- Reduce player count

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Test multiplayer functionality
- Update README for new features
- Keep bundle size optimized

## 📝 Roadmap

- [ ] More weapons and skins
- [ ] Power-ups and items
- [ ] Multiple maps
- [ ] Game modes (Deathmatch, Team Battle, Capture the Flag)
- [ ] Weapon customization
- [ ] On-chain rewards and NFTs
- [ ] Mobile touch controls
- [ ] Voice chat integration
- [ ] Spectator mode
- [ ] Replay system

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

### Technologies
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - React renderer for Three.js
- [Solana](https://solana.com) - Blockchain integration
- [Phantom Wallet](https://phantom.app) - Solana wallet

### Assets
- Character models: Exported from Character_Soldier.gltf
- Weapon models: Included in character model


