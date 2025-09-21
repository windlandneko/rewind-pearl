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

const VIEW_HEIGHT = 8 * 24 // 192像素
const VIEW_WIDTH = 8 * 40 // 320像素

// 第四章 - 最终战
export function Stage4(game) {
  const height = VIEW_HEIGHT
  const width = VIEW_WIDTH

  game.levelData = {
    height,
    width,
    spawnpoint: new Vec2(32, 150),
    background: 'cave',
  }

  game.gameObjects.push(
    new Platform(0, height - 20, width, 20),
    new Platform(0, 0, width, 8),
    new Platform(0, 0, 8, height),
    new Platform(width - 8, 0, 8, height - 40),

    new Interactable(80, 160, 'chapter4_start', '最终战开始'),
    new Interactable(200, 160, 'chapter4_end', '打败芙蓉王源神'),

    new LevelChanger(width - 8, 150, 32, 32, 'Stage5', true)
  )
}
