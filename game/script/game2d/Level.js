import {
  Player,
  Platform,
  Enemy,
  Interactable,
  Collectible,
} from './gameObject/index.js'
import Vec2 from './Vector.js'

// 新增的关卡像这样写，每个关卡都是一个函数
export function Level1(game) {
  // 地图的宽高（像素），注意屏幕大小是固定的(8 * 24, 8 * 40)
  const height = 8 * 24
  const width = 8 * 80

  game.levelData = {
    name: 'Level1', // 这里与关卡的函数名要保持一致
    height,
    width,
    worldBorder: true, // 是否启用世界边界，玩家走不出去
    spawnpoint: new Vec2(32, 150), // 玩家出生点，注意y轴是反的，原点在左上角
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
    new Platform(80, 152, 200, 16),
    new Platform(150, 120, 80, 16),
    new Platform(280, 100, 100, 16),
    new Platform(420, 80, 80, 16),
    new Platform(200, 60, 120, 16),
    new Platform(350, 40, 100, 16),
    new Platform(480, 140, 60, 16),
    new Platform(560, 110, 60, 16),
    new Platform(width - 200, 100, 150, 16)
  )

  // 可交互对话
  // new Interactable(x, y, 对话ID, 提示文本)
  game.gameObjects.push(
    new Interactable(14, 160, 'level1_start', '按E交互'),
    new Interactable(320, 160, 'level1_npc', '妈妈生的'),
    new Interactable(36, 160, 'test_scene', 'test'),
    new Interactable(width - 60, 75, 'level1_end', '恭喜通关！')
  )

  // 收集品（暂时用不到）
  game.gameObjects.push(
    new Collectible(120, 130),
    new Collectible(200, 130),
    new Collectible(250, 130),
    new Collectible(180, 98),
    new Collectible(320, 78),
    new Collectible(450, 58),
    new Collectible(240, 38),
    new Collectible(380, 18),
    new Collectible(510, 118),
    new Collectible(590, 88),
    new Collectible(width - 150, 78),
    new Collectible(width - 100, 78),
    new Collectible(340, 60),
    new Collectible(480, 20)
  )

  // 敌人（暂时用不到）
  game.gameObjects.push(
    new Enemy(20, 150),
    new Enemy(300, 75),
    new Enemy(440, 55),
    new Enemy(500, 115),
    new Enemy(570, 85),
    new Enemy(width - 180, 75)
  )
}
