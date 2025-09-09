import {
  Enemy,
  Interactable,
  Collectible,
  LevelChanger,
  Platform,
  MovingPlatform,
} from './gameObject/index.js'
import Vec2 from './Vector.js'
import SoundManager from '../SoundManager.js'

// 屏幕固定大小
const VIEW_HEIGHT = 8 * 24 // 192像素
const VIEW_WIDTH = 8 * 40 // 320像素

// 序章 - 片场
export function PrologueLevel(game) {
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

    new LevelChanger(width, 0, 32, height, 'Chapter1Level', true)
  )
}

// 第一章 - 异世界入口
export function Chapter1Level(game) {
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

    new LevelChanger(width - 8, 150, 32, 32, 'Chapter2Level', true)
  )
}

// 第二章 - 工厂
export function Chapter2Level(game) {
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

    new LevelChanger(width - 8, 150, 32, 32, 'Chapter3Level', true)
  )
}

// 第三章 - 山峰
export function Chapter3Level(game) {
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

    new LevelChanger(width - 8, 150, 32, 32, 'Chapter4Level', true)
  )
}

// 第四章 - 最终战
export function Chapter4Level(game) {
  const height = VIEW_HEIGHT
  const width = VIEW_WIDTH

  game.levelData = {
    height,
    width,
    worldBorder: false,
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

    new LevelChanger(width - 8, 150, 32, 32, 'Chapter5Level', true)
  )
}

// 第五章 - 结局场景
export function Chapter5Level(game) {
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

    new LevelChanger(width - 8, 150, 32, 32, 'PrologueLevel', true)
  )
}
