import {
  Enemy,
  Interactable,
  Collectible,
  LevelChanger,
  Platform,
  MovingPlatform,
} from '../gameObject/index.js'
import Vec2 from '../Vector.js'
import SoundManager from '../../SoundManager.js'

export function Stage1(game) {
  const height = 192
  const width = 320

  game.levelData = {
    introDialogue: 'null',
    background: 'test',
    height,
    width,
    worldBorder: false,
    spawnpoint: new Vec2(160, 104),
    cameraHeight: 192,
  }

  SoundManager.playBGM('test')

  game.gameObjects.push(
    new Platform(0, 128, 320, 64),
    new Platform(256, 0, 64, 128),
    new Platform(64, 0, 192, 64),
    new Platform(0, 0, 64, 128),
    new Platform(88, 80, 8, 8),
    new Platform(88, 96, 16, 8),
    new Platform(104, 80, 8, 16),
    new Platform(112, 96, 8, 8)
  )
}
