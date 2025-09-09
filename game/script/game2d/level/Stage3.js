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

// 第三章 - 山峰
export function Stage3(game) {
  const height = VIEW_HEIGHT
  const width = VIEW_WIDTH

  game.levelData = {
    height,
    width,
    worldBorder: false,
    spawnpoint: new Vec2(32, 150),
    background: 'litang',
  }

  game.gameObjects.push(
    new Platform(0, height - 20, width, 20),
    new Platform(0, 0, width, 8),
    new Platform(0, 0, 8, height),
    new Platform(width - 8, 0, 8, height - 40),

    new Interactable(50, 160, 'chapter3_start', '准备爬山回家'),
    new Interactable(100, 160, 'chapter3_curtain1', '遇见电棍otto'),
    new Interactable(150, 160, 'chapter3_curtain2.0', '遇见小章鱼丰川祥子'),
    new Interactable(200, 160, 'chapter3_curtain2.5', '发现锐刻五代'),
    new Interactable(250, 160, 'chapter3_curtain3', '遇见东海帝王'),

    new LevelChanger(width - 8, 150, 32, 32, 'Stage4', true)
  )
}
