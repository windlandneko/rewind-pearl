import {
  Enemy,
  Interactable,
  Collectible,
  LevelChanger,
  Platform,
  MovingPlatform,
} from './gameObject/index.js'
import Vec2 from './Vector.js'

// 屏幕固定大小
const SCREEN_HEIGHT = 8 * 24 // 192像素
const SCREEN_WIDTH = 8 * 40 // 320像素

// 序章 - 片场
export function PrologueLevel(game) {
  const height = SCREEN_HEIGHT
  const width = SCREEN_WIDTH * 2.5

  game.levelData = {
    name: 'PrologueLevel',
    introDialogue: 'prologue',
    height,
    width,
    worldBorder: false,
    spawnpoint: new Vec2(32, 150),
    background: 'intro', // 片场背景
  }

  // 基础墙壁
  game.gameObjects.push(
    new Platform(0, height - 32, 100, 32), // 地面
    new Platform(width - 100, height - 32, 120, 32), // 地面
    new Platform(0, 0, width, 8), // 天花板
    new Platform(0, 0, 8, height) // 左墙
  )

  // 移动平台
  game.gameObjects.push(
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
    )
  )

  // 剧情对话点
  game.gameObjects.push(
    new Interactable(
      200,
      160,
      'prologue',
      'character/hajimi/normal',
      '测试',
      true
    )
  )

  // 进入异世界的传送门
  game.gameObjects.push(
    new LevelChanger(width, 0, 32, height, 'Chapter1Level', true)
  )
}

// 第一章 - 异世界入口
export function Chapter1Level(game) {
  const height = SCREEN_HEIGHT
  const width = SCREEN_WIDTH

  game.levelData = {
    name: 'Chapter1Level',
    background: 'magic', // 异世界魔法背景
    height,
    width,
    worldBorder: true,
    spawnpoint: new Vec2(32, 150),
  }

  // 基础墙壁
  game.gameObjects.push(
    new Platform(0, height - 20, width, 20), // 地面
    new Platform(0, 0, width, 8), // 天花板
    new Platform(0, 0, 8, height), // 左墙
    new Platform(width - 8, 0, 8, height - 40) // 右墙
  )

  // 剧情对话点
  game.gameObjects.push(
    new Interactable(80, 160, 'chapter1_start', '遇见芝士企鹅高松灯'),
    new Interactable(160, 160, 'chapter1_end', '收集灵感菇任务完成'),
    new Interactable(240, 160, 'chapter1_end', '石头替代路线')
  )

  // 前往工厂的传送门
  game.gameObjects.push(
    new LevelChanger(width - 8, 150, 32, 32, 'Chapter2Level', true)
  )
}

// 第二章 - 工厂
export function Chapter2Level(game) {
  const height = SCREEN_HEIGHT
  const width = SCREEN_WIDTH

  game.levelData = {
    name: 'Chapter2Level',
    height,
    width,
    worldBorder: true,
    spawnpoint: new Vec2(32, 150),
    background: 'factory', // 工厂背景
  }

  // 基础墙壁
  game.gameObjects.push(
    new Platform(0, height - 20, width, 20), // 地面
    new Platform(0, 0, width, 8), // 天花板
    new Platform(0, 0, 8, height), // 左墙
    new Platform(width - 8, 0, 8, height - 40) // 右墙
  )

  // 剧情对话点
  game.gameObjects.push(
    new Interactable(80, 160, 'chapter2_start', '高松灯飞走，独自闯关'),
    new Interactable(160, 160, 'chapter2_defeat', '发现时空回溯能力'),
    new Interactable(240, 160, 'chapter2_end', '遇见芙蓉王源神')
  )

  // 前往山峰的传送门
  game.gameObjects.push(
    new LevelChanger(width - 8, 150, 32, 32, 'Chapter3Level', true)
  )
}

// 第三章 - 山峰
export function Chapter3Level(game) {
  const height = SCREEN_HEIGHT
  const width = SCREEN_WIDTH

  game.levelData = {
    name: 'Chapter3Level',
    height,
    width,
    worldBorder: true,
    spawnpoint: new Vec2(32, 150),
    background: 'litang', // 理塘山峰背景
  }

  // 基础墙壁
  game.gameObjects.push(
    new Platform(0, height - 20, width, 20), // 地面
    new Platform(0, 0, width, 8), // 天花板
    new Platform(0, 0, 8, height), // 左墙
    new Platform(width - 8, 0, 8, height - 40) // 右墙
  )

  // 剧情对话点
  game.gameObjects.push(
    new Interactable(50, 160, 'chapter3_start', '准备爬山回家'),
    new Interactable(100, 160, 'chapter3_curtain1', '遇见电棍otto'),
    new Interactable(150, 160, 'chapter3_curtain2.0', '遇见小章鱼丰川祥子'),
    new Interactable(200, 160, 'chapter3_curtain2.5', '发现锐刻五代'),
    new Interactable(250, 160, 'chapter3_curtain3', '遇见东海帝王')
  )

  // 前往最终战的传送门
  game.gameObjects.push(
    new LevelChanger(width - 8, 150, 32, 32, 'Chapter4Level', true)
  )
}

// 第四章 - 最终战
export function Chapter4Level(game) {
  const height = SCREEN_HEIGHT
  const width = SCREEN_WIDTH

  game.levelData = {
    name: 'Chapter4Level',
    height,
    width,
    worldBorder: true,
    spawnpoint: new Vec2(32, 150),
    background: 'cave', // 山洞背景
  }

  // 基础墙壁
  game.gameObjects.push(
    new Platform(0, height - 20, width, 20), // 地面
    new Platform(0, 0, width, 8), // 天花板
    new Platform(0, 0, 8, height), // 左墙
    new Platform(width - 8, 0, 8, height - 40) // 右墙
  )

  // 剧情对话点
  game.gameObjects.push(
    new Interactable(80, 160, 'chapter4_start', '最终战开始'),
    new Interactable(200, 160, 'chapter4_end', '打败芙蓉王源神')
  )

  // 前往结局的传送门
  game.gameObjects.push(
    new LevelChanger(width - 8, 150, 32, 32, 'Chapter5Level', true)
  )
}

// 第五章 - 结局场景
export function Chapter5Level(game) {
  const height = SCREEN_HEIGHT
  const width = SCREEN_WIDTH

  game.levelData = {
    name: 'Chapter5Level',
    height,
    width,
    worldBorder: true,
    spawnpoint: new Vec2(32, 150),
    background: 'underground', // 地下祭坛背景
  }

  // 基础墙壁
  game.gameObjects.push(
    new Platform(0, height - 20, width, 20), // 地面
    new Platform(0, 0, width, 8), // 天花板
    new Platform(0, 0, 8, height), // 左墙
    new Platform(width - 8, 0, 8, height - 40) // 右墙
  )

  // 结局对话点
  game.gameObjects.push(
    new Interactable(120, 160, 'chapter5_end4', 'Bad End - 成为神人'),
    new Interactable(200, 160, 'chapter5_end5', 'True End - 回到现实')
  )

  // 回到开始的传送门（游戏重置）
  game.gameObjects.push(
    new LevelChanger(width - 8, 150, 32, 32, 'PrologueLevel', true)
  )
}
