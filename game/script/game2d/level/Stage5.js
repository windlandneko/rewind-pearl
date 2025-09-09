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

// 第五章 - 结局场景
export function Stage5(game) {
  const height = VIEW_HEIGHT
  const width = VIEW_WIDTH

  game.levelData = {
    height,
    width,
    worldBorder: false,
    spawnpoint: new Vec2(32, 150),
    background: 'underground',
  }

  game.gameObjects.push(
    new Platform(0, height - 20, width, 20),
    new Platform(0, 0, width, 8),
    new Platform(0, 0, 8, height),
    new Platform(width - 8, 0, 8, height - 40),

    new Interactable(120, 160, 'chapter5_end4', 'Bad End - 成为神人'),
    new Interactable(200, 160, 'chapter5_end5', 'True End - 回到现实'),

    new LevelChanger(width - 8, 150, 32, 32, 'Prologue', true)
  )
}
