import {
  BaseObject,
  Collectible,
  Enemy,
  Hazard,
  Interactable,
  LevelChanger,
  MovingPlatform,
  Platform,
  Trigger,
} from '../gameObject/index.js'
import Vec2 from '../Vector.js'
import SoundManager from '../../SoundManager.js'

export function MovingPlatformTest(game) {
  const height = 192
  const width = 320

  game.levelData = {
    introDialogue: 'null',
    background: 'test',
    height,
    width,
    spawnpoint: new Vec2(56, 0),
    cameraHeight: 192,
  }

  SoundManager.playBGM('test')

  game.gameObjects.push(
    new Platform(0, 184, 320, 8),
    new MovingPlatform(new Vec2(96, 136), new Vec2(160, 32), 16, 16, 3, 'sin'),
    new MovingPlatform(new Vec2(176, 136), new Vec2(312, 80), 16, 16, 3, 'sin'),
    new MovingPlatform(new Vec2(88, 168), new Vec2(304, 168), 40, 8, 2, 'sin'),
    new MovingPlatform(new Vec2(24, 16), new Vec2(24, 184), 24, 8, 2, 'sin'),
    new MovingPlatform(new Vec2(48, 16), new Vec2(48, 184), 24, 8, 2, 'linear'),
    new MovingPlatform(new Vec2(0, 16), new Vec2(0, 184), 24, 8, 5, 'sin')
  )
}
