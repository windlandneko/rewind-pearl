import {
  Player,
  Platform,
  Enemy,
  Interactable,
  Collectible,
  LevelChanger,
} from './gameObject/index.js'
import Vec2 from './Vector.js'

// 屏幕固定大小
const SCREEN_HEIGHT = 8 * 24 // 192像素
const SCREEN_WIDTH = 8 * 40 // 320像素

// 新增的关卡像这样写，每个关卡都是一个函数
export function Level1(game) {
  const height = SCREEN_HEIGHT
  const width = SCREEN_WIDTH

  game.levelData = {
    name: 'Level1', // 这里与关卡的函数名要保持一致
    height,
    width,
    worldBorder: true, // 是否启用世界边界，玩家走不出去
    spawnpoint: new Vec2(32, 150), // 玩家出生点，注意y轴是反的，原点在左上角
    background: 'test.png', // 测试背景
  }

  game.player = new Player(
    game.levelData.spawnpoint.x,
    game.levelData.spawnpoint.y
  )

  // 平台
  game.gameObjects.push(
    new Platform(0, height - 8, width, 8), // 地面
    new Platform(0, 0, width, 8), // 天花板
    new Platform(0, 0, 8, height), // 左墙
    new Platform(width - 8, 0, 8, height), // 右墙

    // 平台
    new Platform(80, 152, 120, 16),
    new Platform(150, 120, 80, 16),
    new Platform(240, 100, 80, 16)
  )

  // 可交互对话
  // new Interactable(x, y, 对话ID, 提示文本)
  game.gameObjects.push(
    new Interactable(50, 160, 'level1_start', '按E交互'),
    new Interactable(160, 160, 'level1_npc', '妈妈生的'),
    new Interactable(width - 60, 160, 'level1_end', '恭喜通关！')
  )

  // 关卡传送门
  game.gameObjects.push(new LevelChanger(width - 50, 150, 32, 32, 'Level2'))

  // 收集品（暂时用不到）
  game.gameObjects.push(
    new Collectible(120, 130),
    new Collectible(200, 130),
    new Collectible(180, 98),
    new Collectible(260, 78)
  )

  // 敌人（暂时用不到）
  game.gameObjects.push(new Enemy(100, 150), new Enemy(200, 150))
}

// 序章 - 片场
export function PrologueLevel(game) {
  const height = SCREEN_HEIGHT
  const width = SCREEN_WIDTH * 2

  game.levelData = {
    name: 'PrologueLevel',
    height,
    width,
    worldBorder: true,
    spawnpoint: new Vec2(32, 150),
    background: 'intro.jpg', // 片场背景
  }

  game.player = new Player(
    game.levelData.spawnpoint.x,
    game.levelData.spawnpoint.y
  )

  // 基础墙壁
  game.gameObjects.push(
    new Platform(0, height - 8, width, 8), // 地面
    new Platform(0, 0, width, 8), // 天花板
    new Platform(0, 0, 8, height), // 左墙
    new Platform(width - 8, 0, 8, height) // 右墙
  )

  // 剧情对话点
  game.gameObjects.push(new Interactable(200, 160, 'prologue', '遇见王源'))

  // 进入异世界的传送门
  game.gameObjects.push(
    new LevelChanger(width - 50, 150, 32, 32, 'Chapter1Level')
  )
}

// 第一章 - 异世界入口
export function Chapter1Level(game) {
  const height = SCREEN_HEIGHT
  const width = SCREEN_WIDTH

  game.levelData = {
    name: 'Chapter1Level',
    height,
    width,
    worldBorder: true,
    spawnpoint: new Vec2(32, 150),
    background: 'magic.jpg', // 异世界魔法背景
  }

  game.player = new Player(
    game.levelData.spawnpoint.x,
    game.levelData.spawnpoint.y
  )

  // 基础墙壁
  game.gameObjects.push(
    new Platform(0, height - 8, width, 8), // 地面
    new Platform(0, 0, width, 8), // 天花板
    new Platform(0, 0, 8, height), // 左墙
    new Platform(width - 8, 0, 8, height) // 右墙
  )

  // 剧情对话点
  game.gameObjects.push(
    new Interactable(80, 160, 'chapter1_start', '遇见芝士企鹅高松灯'),
    new Interactable(160, 160, 'chapter1_end', '收集灵感菇任务完成'),
    new Interactable(240, 160, 'chapter1_end', '石头替代路线')
  )

  // 前往工厂的传送门
  game.gameObjects.push(
    new LevelChanger(width - 50, 150, 32, 32, 'Chapter2Level')
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
    background: 'factory.png', // 工厂背景
  }

  game.player = new Player(
    game.levelData.spawnpoint.x,
    game.levelData.spawnpoint.y
  )

  // 基础墙壁
  game.gameObjects.push(
    new Platform(0, height - 8, width, 8), // 地面
    new Platform(0, 0, width, 8), // 天花板
    new Platform(0, 0, 8, height), // 左墙
    new Platform(width - 8, 0, 8, height) // 右墙
  )

  // 剧情对话点
  game.gameObjects.push(
    new Interactable(80, 160, 'chapter2_start', '高松灯飞走，独自闯关'),
    new Interactable(160, 160, 'chapter2_defeat', '发现时空回溯能力'),
    new Interactable(240, 160, 'chapter2_end', '遇见芙蓉王源神')
  )

  // 前往山峰的传送门
  game.gameObjects.push(
    new LevelChanger(width - 50, 150, 32, 32, 'Chapter3Level')
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
    background: 'litang.png', // 理塘山峰背景
  }

  game.player = new Player(
    game.levelData.spawnpoint.x,
    game.levelData.spawnpoint.y
  )

  // 基础墙壁
  game.gameObjects.push(
    new Platform(0, height - 8, width, 8), // 地面
    new Platform(0, 0, width, 8), // 天花板
    new Platform(0, 0, 8, height), // 左墙
    new Platform(width - 8, 0, 8, height) // 右墙
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
    new LevelChanger(width - 50, 150, 32, 32, 'Chapter4Level')
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
    background: 'cave.png', // 山洞背景
  }

  game.player = new Player(
    game.levelData.spawnpoint.x,
    game.levelData.spawnpoint.y
  )

  // 基础墙壁
  game.gameObjects.push(
    new Platform(0, height - 8, width, 8), // 地面
    new Platform(0, 0, width, 8), // 天花板
    new Platform(0, 0, 8, height), // 左墙
    new Platform(width - 8, 0, 8, height) // 右墙
  )

  // 剧情对话点
  game.gameObjects.push(
    new Interactable(80, 160, 'chapter4_start', '最终战开始'),
    new Interactable(200, 160, 'chapter4_end', '打败芙蓉王源神')
  )

  // 前往结局的传送门
  game.gameObjects.push(
    new LevelChanger(width - 50, 150, 32, 32, 'Chapter5Level')
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
    background: 'underground.png', // 地下祭坛背景
  }

  game.player = new Player(
    game.levelData.spawnpoint.x,
    game.levelData.spawnpoint.y
  )

  // 基础墙壁
  game.gameObjects.push(
    new Platform(0, height - 8, width, 8), // 地面
    new Platform(0, 0, width, 8), // 天花板
    new Platform(0, 0, 8, height), // 左墙
    new Platform(width - 8, 0, 8, height) // 右墙
  )

  // 结局对话点
  game.gameObjects.push(
    new Interactable(120, 160, 'chapter5_end4', 'Bad End - 成为神人'),
    new Interactable(200, 160, 'chapter5_end5', 'True End - 回到现实')
  )

  // 回到开始的传送门（游戏重置）
  game.gameObjects.push(
    new LevelChanger(width - 50, 150, 32, 32, 'PrologueLevel')
  )
}
