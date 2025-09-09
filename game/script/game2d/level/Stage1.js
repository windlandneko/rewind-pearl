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

// 第一章 - 异世界入口
export function Stage1(game) {
  const height = VIEW_HEIGHT
  const width = VIEW_WIDTH

  game.levelData = {
    background: 'magic',
    height,
    width,
    worldBorder: true,
    spawnpoint: new Vec2(32, 150),
  }

  SoundManager.playBGM('Memories of Memories')

  game.gameObjects.push(
    new Platform(0, height - 20, width, 20),
    new Platform(0, 0, width, 8),
    new Platform(0, 0, 8, height),
    new Platform(width - 8, 0, 8, height - 40),

    new Interactable(
      80,
      160,
      'chapter1_start',
      'character/zhishiqie/normal',
      '遇见芝士企鹅高松灯'
    ),
    new Interactable(
      160,
      160,
      'chapter1_end',
      'character/zhishiqie/normal',
      '收集灵感菇任务完成'
    ),
    new Interactable(
      240,
      160,
      'chapter1_end',
      'character/zhishiqie/normal',
      '石头替代路线'
    ),

    new LevelChanger(width - 8, 150, 32, 32, 'Stage2', true)
  )
}
