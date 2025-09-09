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

// 序章 - 片场
export function Prologue(game) {
  const height = VIEW_HEIGHT
  const width = VIEW_WIDTH * 2.5

  game.levelData = {
    introDialogue: 'prologue',
    height,
    width,
    worldBorder: false,
    spawnpoint: new Vec2(32, 150),
    background: 'intro', // 片场背景
  }

  game.gameObjects.push(
    new Platform(0, height - 32, 100, 32),
    new Platform(width - 100, height - 32, 120, 32),
    new Platform(0, 0, width, 8),
    new Platform(0, 0, 8, height),

    new MovingPlatform(
      new Vec2(100, height - 32),
      new Vec2(width / 2 - 16, height - 32),
      32,
      4,
      10
    ),
    new MovingPlatform(
      new Vec2(width / 2 - 16, height - 32),
      new Vec2(width - 100 - 16, height - 32),
      32,
      4,
      10
    ),

    new Interactable(
      80,
      136,
      'chapter1_start',
      'character/zhishiqie/normal',
      '芝士企鹅'
    ),
    new Interactable(
      200,
      136,
      'chapter1_end',
      'character/hajimi/normal',
      '测试'
    ),

    new LevelChanger(width, 0, 32, height, 'Stage1', true)
  )
}