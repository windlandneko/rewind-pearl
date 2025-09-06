import {
  Player,
  Platform,
  Enemy,
  Interactable,
  Collectible,
} from './gameObject/index.js'
import Vec2 from './Vector.js'

export function Level1(game) {
  const height = 8 * 24
  const width = 8 * 80

  game.levelData = {
    height,
    width,
    worldBorder: true,
    spawnpoint: new Vec2(32, 150),
  }

  game.player = new Player(
    game.levelData.spawnpoint.x,
    game.levelData.spawnpoint.y
  )

  // 添加平台到游戏对象数组
  game.gameObjects.push(
    // 边界平台
    new Platform(0, height - 8, width, 8), // 地面
    new Platform(0, 0, width, 8), // 天花板
    new Platform(0, 0, 8, height), // 左墙
    new Platform(width - 8, 0, 8, height), // 右墙

    // 平台
    new Platform(80, 152, 200, 16), // 起始平台
    new Platform(150, 120, 80, 16), // 中层平台1
    new Platform(280, 100, 100, 16), // 中层平台2
    new Platform(420, 80, 80, 16), // 中层平台3
    new Platform(200, 60, 120, 16), // 高层平台1
    new Platform(350, 40, 100, 16), // 高层平台2
    new Platform(480, 140, 60, 16), // 跳跃挑战平台1
    new Platform(560, 110, 60, 16), // 跳跃挑战平台2
    new Platform(width - 200, 100, 150, 16) // 终点平台
  )

  // 收集品
  game.gameObjects.push(
    // 起始区域收集品
    new Collectible(120, 130),
    new Collectible(200, 130),
    new Collectible(250, 130),

    // 中层收集品
    new Collectible(180, 98),
    new Collectible(320, 78),
    new Collectible(450, 58),

    // 高层收集品
    new Collectible(240, 38),
    new Collectible(380, 18),

    // 挑战区域收集品
    new Collectible(510, 118),
    new Collectible(590, 88),

    // 终点区域收集品
    new Collectible(width - 150, 78),
    new Collectible(width - 100, 78),

    // 空中悬浮收集品（需要跳跃技巧）
    new Collectible(340, 60),
    new Collectible(480, 20)
  )

  // 敌人
  game.gameObjects.push(
    // 起始区域敌人（简单）
    new Enemy(20, 150),

    // 中层敌人
    new Enemy(300, 75),
    new Enemy(440, 55),

    // 挑战区域敌人
    new Enemy(500, 115),
    new Enemy(570, 85),

    // 终点前的守卫敌人
    new Enemy(width - 180, 75)
  )

  // 可交互对象
  game.gameObjects.push(
    // 起始NPC - 教学提示
    new Interactable(14, 160, 'level1_start', '按E交互'),

    // 中途NPC - 游戏提示
    new Interactable(320, 160, 'level1_npc', '妈妈生的'),
    new Interactable(36, 160, 'test_scene', 'test'),

    // 终点NPC - 关卡完成
    new Interactable(width - 60, 75, 'level1_end', '恭喜通关！')
  )
}
