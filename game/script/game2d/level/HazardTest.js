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

export function HazardTest(game) {
  const height = 192
  const width = 320

  game.levelData = {
    introDialogue: 'null',
    background: 'test',
    height,
    width,
    worldBorder: false,
    spawnpoint: new Vec2(160, 88),
    cameraHeight: 192,
  }

  SoundManager.playBGM('test')

  game.gameObjects.push(
      new Hazard(248, 144, 8, 8, 'right'),
    new Platform(240, 40, 24, 24),
    new Hazard(240, 64, 24, 8, 'down'),
    new Hazard(232, 40, 8, 24, 'left'),
    new Hazard(264, 40, 8, 24, 'right'),
    new Hazard(232, 144, 8, 8, 'left'),
    new Hazard(240, 152, 8, 8, 'down'),
    new Hazard(288, 144, 8, 8, 'right'),
    new Hazard(272, 144, 8, 8, 'left'),
    new Platform(240, 96, 16, 16),
    new Hazard(232, 96, 8, 16, 'left'),
    new Hazard(240, 112, 16, 8, 'down'),
    new Hazard(256, 96, 8, 16, 'right'),
    new Platform(240, 144, 8, 8),
    new Hazard(280, 152, 8, 8, 'down'),
    new Hazard(48, 72, 24, 8, 'down'),
    new Hazard(40, 48, 8, 24, 'left'),
    new Hazard(72, 48, 8, 24, 'right'),
    new Platform(48, 48, 24, 24),
    new Platform(80, 48, 8, 16),
    new Platform(56, 80, 16, 8),
    new Platform(32, 56, 8, 16),
    new Platform(48, 32, 16, 8),
    new Platform(80, 32, 8, 8),
    new Platform(80, 80, 8, 8),
    new Platform(32, 80, 8, 8),
    new Platform(32, 32, 8, 8),
    new Hazard(120, 104, 8, 8, 'left'),
    new Hazard(128, 112, 8, 8, 'down'),
    new Hazard(48, 40, 24, 8, 'up'),
    new Hazard(240, 136, 8, 8, 'up'),
    new Hazard(280, 136, 8, 8, 'up'),
    new Hazard(240, 88, 16, 8, 'up'),
    new Hazard(240, 32, 24, 8, 'up'),
    new Platform(80, 104, 40, 8),
    new Platform(152, 88, 8, 16),
    new Platform(176, 88, 8, 16),
    new Hazard(200, 104, 8, 8, 'right'),
    new Platform(128, 104, 72, 8),
    new Hazard(184, 96, 8, 8, 'up'),
    new Platform(32, 144, 24, 8),
    new Platform(64, 160, 24, 8),
    new Platform(64, 176, 24, 8),
    new Platform(96, 144, 24, 8),
    new Platform(96, 152, 8, 16),
    new Platform(104, 160, 16, 8),
    new Platform(112, 168, 8, 16),
    new Platform(96, 176, 16, 8),
    new Platform(128, 144, 24, 8),
    new Platform(136, 152, 8, 32),
    new Platform(72, 144, 16, 8),
    new Platform(64, 144, 8, 32),
    new Platform(40, 152, 8, 32),
    new Hazard(72, 152, 16, 8, 'up'),
    new Hazard(72, 168, 16, 8, 'down'),
    new Hazard(48, 152, 8, 32, 'right'),
    new Hazard(32, 152, 8, 32, 'left'),
    new Hazard(104, 152, 16, 8, 'up'),
    new Hazard(96, 168, 16, 8, 'up'),
    new Hazard(128, 136, 24, 8, 'up'),
    new Platform(135, 88, 8, 16)
  )
}
