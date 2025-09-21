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

const SCREEN_HEIGHT = 8 * 24
const SCREEN_WIDTH = 8 * 40

export function Stage2(game) {
  const height = SCREEN_HEIGHT * 1.5 //192*320  *1.5  =  288*480
  const width = SCREEN_WIDTH * 1.5

  game.levelData = {
    introDialogue: 'chapter2_start',
    background: 'magic',
    height,
    width,
    spawnpoint: new Vec2(32, 250),
    camera: {
      height: SCREEN_HEIGHT,
      width: SCREEN_WIDTH,
    },
  }

  SoundManager.playBGM('Memories of Memories')

  // 墙壁
  game.gameObjects.push(
    new Platform(0, height - 20, 40, 20), //下1

    new Platform(0, 0, width, 8), //上
    new Platform(0, 0, 8, height - 180), //左1
    new Platform(0, height - 150, 8, height - 160), //左2

    new Platform(width - 8, 40, 8, height - 40), //右
    new Platform(155, 40, 8, height - 40), //中心柱子1
    new Platform(320, 0, 8, height - 100), //中心柱子2

    new MovingPlatform( //移动平台1~n
      new Vec2(200, height - 60),
      new Vec2(120, height - 60),
      30,
      4,
      5
    ),
    new MovingPlatform(
      new Vec2(-60, height - 100),
      new Vec2(20, height - 100),
      30,
      4,
      5
    ),
    new MovingPlatform(
      new Vec2(-60, height - 184),
      new Vec2(20, height - 184),
      30,
      4,
      5
    ),
    new MovingPlatform(
      new Vec2(200, height - 224),
      new Vec2(120, height - 224),
      30,
      4,
      5
    ),
    new MovingPlatform( //右移动平台与一号对接
      new Vec2(340, height - 60),
      new Vec2(420, height - 60),
      40,
      4,
      5
    ),
    new MovingPlatform(
      new Vec2(328, height - 100),
      new Vec2(328, height - 200),
      30,
      4,
      5
    ),
    new MovingPlatform(new Vec2(378, -30), new Vec2(378, 50), 6, 30, 5), //数值下落的平台1
    new MovingPlatform(new Vec2(418, -20), new Vec2(418, 60), 6, 30, 5) //数值下落的平台2
  )

  // 剧情对话
  game.gameObjects.push(
    new Interactable(
      80,
      240,
      'chapter1_start',
      'character/hajimi/normal',
      '遇见芝士企鹅高松灯'
    ),
    new Interactable(
      160,
      240,
      'chapter1_end',
      'character/hajimi/normal',
      '收集灵感菇任务完成'
    ),
    new Interactable(
      240,
      240,
      'chapter1_end',
      'character/hajimi/normal',
      '石头替代路线'
    ),
    new Interactable(
      155,
      30,
      'chapter1_end',
      'character/hajimi/normal',
      '可能的新重生点'
    )
  )

  // 传送门
  game.gameObjects.push(
    new LevelChanger(width - 8, 8, 32, 32, 'Stage2Middle', false) // 后期改成true
  )
}
