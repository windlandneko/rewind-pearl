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

// 屏幕固定大小
const VIEW_HEIGHT = 8 * 24 // 192像素
const VIEW_WIDTH = 8 * 40 // 320像素

// 第二章 - 工厂
export function Stage2(game) {
  const height = VIEW_HEIGHT
  const width = VIEW_WIDTH

  game.levelData = {
    height,
    width,
    worldBorder: false,
    spawnpoint: new Vec2(32, 150),
    background: 'factory',
  }

  game.gameObjects.push(
    new Platform(0, height - 20, width, 20),
    new Platform(0, 0, width, 8),
    new Platform(0, 0, 8, height),
    new Platform(width - 8, 0, 8, height - 40),

    new Interactable(
      80,
      160,
      'chapter2_start',
      'character/zhangyu/normal',
      '高松灯飞走，独自闯关'
    ),
    new Interactable(
      160,
      160,
      'chapter2_defeat',
      'character/dingzhen/normal',
      '发现时空回溯能力'
    ),
    new Interactable(
      240,
      160,
      'chapter2_end',
      'character/wangyuan/normal',
      '遇见芙蓉王源神'
    ),

    new LevelChanger(width - 8, 150, 32, 32, 'Stage3', true)
  )
}
