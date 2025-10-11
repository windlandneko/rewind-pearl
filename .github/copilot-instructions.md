# Rewind Pearl - AI Coding Assistant Instructions

## Project Overview
**Rewind Pearl (再见珍珠)** is a 2D platformer puzzle game with time-travel mechanics, built entirely from scratch with vanilla JavaScript (no frameworks). The game combines platforming, visual novel dialogue, and a unique time-rewind system.

## Architecture

### Core Game Loop (Dual-Loop Architecture)
The engine uses **separate logic and render loops** (`game/script/game2d/Game2D.js`):
- **Logic Loop**: Fixed timestep at 120 FPS via `setInterval` (see `GameConfig.UPDATE_PER_SECOND`)
- **Render Loop**: Variable framerate using `requestAnimationFrame`
- **Why**: Ensures consistent physics simulation regardless of display refresh rate

### Singleton Pattern
Most managers are **singleton exports** (not classes to instantiate):
```javascript
// ✅ Correct usage
import Dialogue from './Dialogue.js'
Dialogue.play('chapter1_intro')

// ❌ Wrong - don't instantiate
import Dialogue from './Dialogue.js'
const d = new Dialogue() // This won't work
```

Examples: `Asset`, `Dialogue`, `SoundManager`, `Keyboard`, `Game2D`, `TimeTravel`, `PauseManager`, `AchievementManager`

### Game Object System
All game entities inherit from `BaseObject` (`game/script/game2d/gameObject/BaseObject.js`):
- **Position**: Use `Vec2` for `r` (position) and `v` (velocity)
- **State Management**: Implement `get state()` and `set state()` for time-travel serialization
- **Lifecycle**: `update(dt, game)`, `render(ctx, game)`, `interactWithPlayer(player, game)`
- **Export/Import**: Must implement for save system compatibility

```javascript
// Example: Creating a new game object
export class MyObject extends BaseObject {
  update(dt, game) { /* physics/logic */ }
  render(ctx, game) { /* drawing */ }
  
  // Required for time-travel
  get state() { return { ...super.state, myProp: this.myProp } }
  set state(data) { super.state = data; this.myProp = data.myProp }
}
```

## Critical Systems

### Resource Management (`Asset.js`)
- **Declarative**: All assets defined in `game/assets/manifest.json`
- **Nested Keys**: Access via slash notation: `Asset.get('character/dingzhen/normal')`
- **Auto-loading**: Based on file extensions (`.png` → Image, `.mp3` → Audio, `.json` → JSON)

### Dialogue System (`Dialogue.js`)
- **Event-driven**: JSON files in `game/assets/dialogue/` define event sequences
- **Two Styles**: `"text_style": "modern"` (VN-style) or `"touhou"` (bubble-style)
- **Text Markup**: Use `$style:text$` for inline styles (e.g., `$wow:emphasized$`, `$shake:animated$`)
- **Shortcuts**: String-only events reuse the last speaker's ID

Example dialogue event:
```json
{
  "action": "add",
  "id": "alice",
  "key": "alice",
  "title": "Alice",
  "position": "left",
  "emotion": "normal"
}
```

### Level Design Pattern
Levels are **functions** that mutate the `game` object (`game/script/game2d/level/*.js`):
```javascript
export function MyLevel(game) {
  game.levelData = {
    introDialogue: 'chapter1_intro',  // Dialogue key
    background: 'raincity',            // Background image key
    spawnpoint: new Vec2(100, 200),
    cameraHeight: 180,
    cameraBound: { x: 0, y: 0, width: 320, height: 180 },
    tileWidth: 160, tileHeight: 90
  }
  
  game.tilePalette = [/* ordered tile names */]
  game.tileData = [/* ASCII art map */]
  
  game.sound.playBGM('Home')
  game.gameObjects.push(
    new Platform(100, 200, 50, 16),
    new Collectible(150, 180, 'mushroom')
  )
}
```

### Time Travel System (`TimeTravel.js`)
- **Snapshots**: Every frame stores game state in `game.history` (Map<tick, state>)
- **Rewind**: Creates a `GhostPlayer` from history and resets `game.tick`
- **Ghosts**: Replay recorded actions from `stateHistory`
- **Limit**: `MAX_SNAPSHOTS_COUNT` in `GameConfig.js` (600 seconds)

### Rendering Groups Optimization
Game objects are **cached by type** in `game.renderGroups` to avoid per-frame filtering:
- When adding/removing objects, call `game.updateRenderGroups()`
- Render loop iterates groups instead of checking `instanceof`

## Development Workflows

### Running the Game
1. **Local Server Required**: Use `VSCode Live Server` or similar (no file:// protocol)
2. **Entry Points**:
   - Main game: `/game/index.html`
   - Level editor: `/game/level-editor/index.html`
   - User login: `/login/index.html`
3. **Debug Mode**: Set `localStorage.setItem('rewind-pearl-debug-mode', 'true')` in console
   - Shows collision boxes, coordinates, velocity vectors
   - Enables level jump (Numpad Enter → type level name)

### Level Editor
- **Export**: Generates JavaScript code for levels
- **Import**: Paste generated code into `game/script/game2d/level/`
- **Tiles**: 80+ tiles from Celeste asset pack, defined in `tiles/index.xml`

### Testing Specific Systems
- **Dialogue**: Edit JSON in `game/assets/dialogue/`, see `docs/对话脚本编写指南.typ`
- **Objects**: Test levels in `game/script/game2d/level/Tests.js`
- **Time Travel**: Play `Prologue` level, press Q+E to charge/activate

## Coding Conventions

### Naming
- **Private Fields**: Use `#` prefix (e.g., `#assets`, `#keyboardListeners`)
- **Chinese OK**: Level names, dialogue keys, comments can use Chinese
- **JSDoc**: Add for public APIs, especially in core systems

### File Organization
- **Managers**: Singleton classes in `game/script/*.js`
- **Game Objects**: Class exports in `game/script/game2d/gameObject/*.js`
- **Levels**: Named function exports in `game/script/game2d/level/*.js`
- **Assets**: Organized by type in `game/assets/` with `manifest.json`

### State Serialization Pattern
Objects needing time-travel/save support use getter/setter pairs:
```javascript
get state() {
  return {
    ...super.state,
    P: [this.prop1, this.prop2, this.prop3]  // Array to minimize size
  }
}

set state(data) {
  super.state = data
  if (data.P) {
    [this.prop1, this.prop2, this.prop3] = data.P
  }
}
```

### Canvas Contexts
- `game.ctx`: Main visible canvas
- `game.tmpctx`: Offscreen for effects/time-travel preview
- `game.tileCtx`: Offscreen for pre-rendered tile map (performance)

## Key Integration Points

### Adding New Game Objects
1. Create class in `game/script/game2d/gameObject/YourObject.js` extending `BaseObject`
2. Export in `game/script/game2d/gameObject/index.js`
3. Add to `renderGroups` logic if needed (for performance)
4. Use in levels: `new GameObject.YourObject(...)`

### Adding New Levels
1. Create `game/script/game2d/level/YourLevel.js` with exported function
2. Export in `game/script/game2d/level/index.js`
3. Reference in level changers: `new LevelChanger(x, y, w, h, Levels.YourLevel)`

### Adding Achievements
1. Define in `AchievementManager.js` achievements object
2. Trigger with `game.achievement.add('achievement_id')`
3. Add to achievements page: `/achievements/index.html`

## Common Pitfalls

1. **Don't mutate `game.gameObjects` during iteration** - use `obj.removed = true` instead
2. **Canvas coordinates**: World coordinates need camera translation: `ctx.translate(-camera.x, -camera.y)`
3. **Asset keys**: Use forward slashes, not dots: `character/alice/normal` not `character.alice.normal`
4. **Dialogue events**: String-only events must follow an event with `"id"` set
5. **Time travel**: Only objects with `state` getter/setter will restore correctly

## Documentation
- **Typst Docs**: Comprehensive Chinese documentation in `docs/*.typ` (build with Typst)
- **Inline Help**: Level editor has built-in help (click help button in toolbar)
- **Dialogue Format**: See `game/assets/dialogue/README.md` (if exists) or examples in `prologue/`
