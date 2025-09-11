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
const SCREEN_HEIGHT = 8 * 24 // 192像素
const SCREEN_WIDTH = 8 * 40 // 320像素

// Stage0制作
export function Stage0(game) {
  const height = SCREEN_HEIGHT * 2.0
  const width = SCREEN_WIDTH * 2.0

  game.levelData = {
    introDialogue: 'chapter2_start',
    background: 'litang',
    height,
    width,
    worldborder: false,
    spawnpoint: new Vec2(32, 340),
    background: 'intro',
  }
  
  SoundManager.playBGM('Memories of Memories')
//192*320
  game.gameObjects.push(
    new Platform(0, height - 20, width, 20), //下
    new Platform(0,0,270,8),            //上1
    new Platform(260,-50,10,50),            //上1边缘以免向左
    new Platform(302,0,273,8),            //上2
    new Platform(600,0,40,8),            //上3
    new Platform(600,-50,5,50),            //上3边缘以免向右
    new Platform(0,0,8,height),           //左
    new Platform(width - 8,40,8,height - 40),//右
    new Platform(width - 8,40,20,5),//右防1
    new Platform(width + 8,0,5,40),//右防2
    
    new Platform(170 ,40,8,height - 40), // 右柱子1
    new Platform(width - 40 ,100,8,height - 160), // 右柱子2
    new Platform(575 ,100,25,4), // 右柱子2边缘

    new Platform(50,height - 60,100,8), // 第1.1平台
    new Platform(200,height - 60,100,8), // 第1.2平台

    new Platform(30,height - 90,160,8), // 第2.1平台
    new Platform(50,height - 120,140,8),// 第3.1平台
    new Platform(30,height - 150,160,8),// 第4.1平台
    new Platform(210,height - 235,32,4),// 第5.1平台

    // new Platform(220,height - 90,120,8),
    new MovingPlatform(  //移动平台1~n
      new Vec2(170,height - 190),
      new Vec2(50,height - 190),
      32,
      4,
      5
    ),
    new MovingPlatform(
      new Vec2(50,height - 235),
      new Vec2(170,height - 235),
      32,
      4,
      5
    ),
    new MovingPlatform(
      new Vec2(170,height - 280),
      new Vec2(50,height - 280),
      32,
      4,
      5
    ),
    new MovingPlatform(
      new Vec2(50,height - 325),
      new Vec2(170,height - 325),
      32,
      4,
      5
    ),
    new MovingPlatform(
      new Vec2(270,height - 250),
      new Vec2(270,height - 310),
      32,
      4,
      5
    ),new MovingPlatform(
      new Vec2(270,height - 310),
      new Vec2(270,height - 370),
      32,
      4,
      5
    ),
    new MovingPlatform(
      new Vec2(320,height - 310),
      new Vec2(560,height - 310),
      32,
      4,
      5
    ),
    // new Platform(390,height - 120,120,8),
    // new Platform(390,height - 60,120,8)
  )
//提前用笔在纸上画出来地图在进行编写地图会不会更好。
  game.gameObjects.push(
    new Interactable(50,height - 40,'chapter2_start','character/hajimi/normal','触碰拾取灵感菇*4即可过关')
  )
  game.gameObjects.push(
    new Interactable(165,15,'chapter2_start','character/hajimi/normal','灵感菇2')
  )
  game.gameObjects.push(
    new Interactable(155,height - 170,'chapter2_start','character/hajimi/normal','灵感菇1')
  )
  game.gameObjects.push(
    new Interactable(width - 30,150,'chapter2_start','character/hajimi/normal','灵感菇3')
  )
  game.gameObjects.push(
    new Interactable(270,-5,'chapter2_start','character/hajimi/normal','灵感菇4')
  )
  game.gameObjects.push(
    new Interactable(370,10,'chapter2_start','character/hajimi/normal','灵感菇石头，请放在地图上面')
  )
  game.gameObjects.push(
    new LevelChanger(width - 8,8,8,40,'Stage1',false)
  )
}