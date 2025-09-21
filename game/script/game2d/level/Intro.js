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

export function Intro(game) {
  const height = 180
  const width = 320

  game.levelData = {
    introDialogue: 'null',
    background: 'test',
    height,
    width,
    spawnpoint: new Vec2(88, 136),
    cameraHeight: 180,
    cameraBound: {
      x: 0,
      y: 0,
      width: 320,
      height: 192,
    },
  }

  SoundManager.playBGM('test')

  game.gameObjects.push(
    new Platform(-32, -40, 384, 96, false),
    new Platform(-32, 56, 104, 96, false),
    new Platform(-32, 152, 384, 80, false),
    new Platform(248, 56, 104, 96, false)
  )
}
