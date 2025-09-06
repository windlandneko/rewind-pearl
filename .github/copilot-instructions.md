# Copilot Instructions for 再见珍珠 (Rewind Pearl)

## Project Architecture

This is a 2D platformer game with time-travel mechanics built in HTML5/JavaScript. The game features:

- **Multi-page structure**: Login → Main menu → Game with save/load functionality
- **Modular ES6 architecture**: Game2D engine, asset management, dialogue system, save management
- **Time rewind mechanics**: Core gameplay feature allowing players to rewind 5 seconds using ghost players

## Key Components & Data Flow

### Core Systems
- `game/script/Game2D.js` - Main game engine with ECS-like architecture
- `game/script/main.js` - Game initialization and save/load orchestration  
- `game/script/Dialogue.js` - Visual novel system with JSON dialogue scripts
- `game/script/Asset.js` - Manifest-based asset loading with progress tracking
- `game/script/SaveManager.js` - Save/load UI component (shared between main menu and in-game)

### Game Objects (ECS Pattern)
All entities inherit from `BaseObject` with `update()` and `render()` methods:
- `Player.js` - Complex platforming mechanics (coyote time, air jumps, jump buffering)
- `GhostPlayer.js` - Time-travel replicas that replay recorded input
- `Platform.js`, `Enemy.js`, `Collectible.js`, `Interactable.js` - Standard game objects

### State Management
- **Game state**: Stored in `Game2D.gameStateHistory` Map for time travel
- **Save data**: LocalStorage with user-scoped saves in `rewind-pearl-savings`
- **Player input**: Queued system with replay capability for ghost players

## Critical Patterns

### Time Travel Implementation
```javascript
// Ghost players replay exact input sequences
ghost.inputQueue = this.inputHistory.get(game.tick) || []
// State validation ensures deterministic replay
this.validateState(record)
```

### Asset Loading
Uses `assets/manifest.json` with categorized resources. Load via:
```javascript
await Asset.loadFromManifest('assets/manifest.json', progressCallback)
```

### Dialogue System
JSON-based with events array. Reference `game/assets/dialogue/README.md` for format:
```json
{
  "text_style": "modern|touhou",
  "events": [{"action": "add|dialogue|remove", ...}]
}
```

### Save System Pattern
Consistent between main menu (`index.html`) and in-game (`SaveManager.js`):
- Uses `onclick` HTML attributes with global functions
- Modal overlay with backdrop-filter blur effect
- User-scoped saves with timestamp/level metadata

## Development Workflow

### Adding New Game Objects
1. Extend `BaseObject` in `game/script/game2d/gameObject/`
2. Add to factory in `Game2D.importGameObjects()`
3. Add to render groups in `#updateRenderGroups()`

### Adding Dialogue
1. Create JSON file in `game/assets/dialogue/`
2. Add to `assets/manifest.json`
3. Reference by filename in `Interactable` objects

### Pause System Implementation
- Game uses `isPaused` state with modal overlays
- Keyboard listeners managed separately for pause/resume
- Save/load accessible from pause menu

## Platform Mechanics ("Wolf Jump")
Implements sophisticated platforming with visual feedback:
- **Coyote Time**: 0.15s grace period after leaving platform
- **Air Jumps**: 1 additional jump in air with reduced power  
- **Jump Buffering**: 0.1s input buffer before landing
- All visualized with colored progress bars on player

## Styling Conventions
- CSS uses gradient backgrounds with border styling: `linear-gradient(135deg, #4a9eff, #3e9fff)`
- Modal animations use transform + transition patterns
- Consistent save item layout across main menu and in-game modals
