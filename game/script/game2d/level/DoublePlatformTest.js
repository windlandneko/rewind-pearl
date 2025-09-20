import {
  BaseObject,
  Collectible,
  Enemy,
  Hazard,
  Interactable,
  LevelChanger,
  MovingPlatform,
  Platform,
  Trigger,
} from '../gameObject/index.js'
import Vec2 from '../Vector.js'
import SoundManager from '../../SoundManager.js'

export function DoublePlatformTest(game) {
  const height = 180
  const width = 640

  game.levelData = {
    introDialogue: 'null',
    background: 'test',
    height,
    width,
    worldBorder: false,
    spawnpoint: new Vec2(24, 8),
    cameraHeight: 180,
    cameraBound: {
      x: 0,
      y: 0,
      width: 320,
      height: 180,
    },
  }

  SoundManager.playBGM('Memories of Memories')

  game.gameObjects.push(
    new Collectible(29, 146, 'sprite/linggangu', undefined),
    new Collectible(70, 74, 'sprite/linggangu_stone', undefined),
    new Collectible(210, 42, 'sprite/linggangu', undefined),
    new Collectible(234, 98, 'sprite/linggangu', undefined),
    new Collectible(306, 10, 'sprite/linggangu_stone', undefined),
    new Collectible(306, 138, 'sprite/linggangu', undefined),
    new Hazard(16, 104, 8, 8, 'up'),
    new Hazard(16, 136, 16, 8, 'down'),
    new Hazard(16, 152, 8, 8, 'up'),
    new Hazard(48, 104, 16, 8, 'down'),
    new Hazard(48, 160, 24, 8, 'up'),
    new Hazard(56, 32, 24, 8, 'down'),
    new Hazard(88, 64, 8, 32, 'left'),
    new Hazard(88, 144, 8, 8, 'up'),
    new Hazard(96, 96, 8, 8, 'down'),
    new Hazard(96, 160, 24, 8, 'up'),
    new Hazard(112, 40, 24, 8, 'down'),
    new Hazard(136, 160, 48, 8, 'up'),
    new Hazard(144, 24, 16, 8, 'up'),
    new Hazard(184, 136, 8, 8, 'up'),
    new Hazard(208, 160, 24, 8, 'up'),
    new Hazard(248, 160, 32, 8, 'up'),
    new Hazard(280, 24, 8, 24, 'left'),
    new Hazard(280, 152, 8, 8, 'up'),
    new Hazard(288, 184, 456, 8, 'up').hide(),
    new Hazard(352, 72, 8, 8, 'right'),
    new Hazard(368, 96, 8, 8, 'right'),
    new Hazard(392, 152, 8, 8, 'left'),
    new Hazard(432, 96, 8, 8, 'up'),
    new Hazard(448, 136, 8, 8, 'left'),
    new Hazard(504, 136, 8, 8, 'left'),
    new Hazard(512, 128, 8, 8, 'up'),
    new Interactable(312, 72, 'test_scene', '', 'undefined', true).hide(),
    new Interactable(520, 112, 'test_scene', 'character/hajimi/normal', '测试', true).hide(),
    new LevelChanger(536, 128, 104, 16, 'Prologue', true).hide(),
    new MovingPlatform(new Vec2(184, 8), new Vec2(176, 8), 88, 8, true, 2, 'still').ref('plat2'),
    new MovingPlatform(new Vec2(208, 40), new Vec2(208, 16), 16, 16, false, 2, 'still').ref('plat1'),
    new Platform(-16, -80, 16, 104, false).hide(),
    new Platform(-16, 24, 32, 176, false),
    new Platform(16, 24, 40, 16, false),
    new Platform(16, 112, 8, 8, false),
    new Platform(16, 120, 16, 16, false),
    new Platform(16, 160, 32, 8, false),
    new Platform(16, 168, 320, 32, false),
    new Platform(48, 56, 8, 8, false),
    new Platform(48, 88, 8, 16, false),
    new Platform(56, 24, 40, 8, false),
    new Platform(56, 56, 8, 48, false),
    new Platform(72, 144, 16, 24, false),
    new Platform(88, 152, 8, 16, false),
    new Platform(96, 24, 16, 56, false),
    new Platform(96, 80, 8, 16, false),
    new Platform(112, 24, 32, 8, false),
    new Platform(112, 32, 48, 8, false),
    new Platform(120, 96, 24, 8, true),
    new Platform(120, 128, 24, 8, true),
    new Platform(120, 152, 16, 16, false),
    new Platform(152, 72, 184, 8, false),
    new Platform(184, 144, 8, 24, false),
    new Platform(192, 136, 16, 32, false),
    new Platform(232, 160, 16, 8, false),
    new Platform(280, 160, 8, 8, false),
    new Platform(288, 24, 48, 48, false),
    new Platform(288, 152, 72, 16, false),
    new Platform(336, 40, 8, 32, false),
    new Platform(336, 72, 16, 8, false),
    new Platform(336, 168, 16, 8, false),
    new Platform(360, 96, 8, 8, false),
    new Platform(400, 152, 24, 8, false),
    new Platform(424, 96, 8, 16, false),
    new Platform(432, 104, 8, 8, false),
    new Platform(456, 136, 16, 8, false),
    new Platform(512, 136, 8, 8, false),
    new Platform(520, 128, 16, 16, false),
    new Trigger(168, 69, 16, 8, false, (game, $) => {
      $('plat1').set(1)
      $('plat2').set(1)
      $('t1').r.y += 1
      game.sound.play('item00')
    }, (game, $) => {
      $('plat1').set(0)
      $('plat2').set(0)
      $('t1').r.y -= 1
      game.sound.play('item00')
    }).ref('t1'),
    new Trigger(288, -80, 16, 288, false, (game, $) => {
      game.levelData.cameraBound.x = 0
    }, null).hide(),
    new Trigger(296, -80, 8, 288, true, (game, $) => {
      game.levelData.spawnpoint = new Vec2(32, 16)
      game.sound.play('heal')
    }, null).hide(),
    new Trigger(320, -80, 16, 288, false, (game, $) => {
      game.levelData.cameraBound.x = 320 - 16
    }, null).hide(),
    new Trigger(320, -80, 8, 288, true, (game, $) => {
      game.levelData.spawnpoint = new Vec2(328, 136)
      game.sound.play('heal')
    }, null).hide()
  )
}
