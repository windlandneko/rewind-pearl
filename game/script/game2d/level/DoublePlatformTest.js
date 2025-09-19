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
  const height = 192
  const width = 320

  game.levelData = {
    introDialogue: 'null',
    background: 'test',
    height,
    width,
    worldBorder: false,
    spawnpoint: new Vec2(32, 16),
    cameraHeight: 192,
    cameraBound: {
      x: 0,
      y: 0,
      width: 320,
      height: 192,
    },
  }

  SoundManager.playBGM('Memories of Memories')

  game.gameObjects.push(
    new Collectible(26, 154, 'sprite/linggangu', undefined),
    new Collectible(74, 82, 'sprite/linggangu_stone', undefined),
    new Collectible(210, 50, 'sprite/linggangu', undefined),
    new Collectible(234, 106, 'sprite/linggangu', undefined),
    new Collectible(306, 10, 'sprite/linggangu_stone', undefined),
    new Collectible(306, 146, 'sprite/linggangu', undefined),
    new Hazard(16, 48, 24, 8, 'down'),
    new Hazard(16, 112, 8, 8, 'up'),
    new Hazard(16, 136, 16, 8, 'down'),
    new Hazard(16, 160, 8, 8, 'up'),
    new Hazard(40, 40, 56, 8, 'down'),
    new Hazard(40, 168, 240, 8, 'up'),
    new Hazard(48, 112, 16, 8, 'down'),
    new Hazard(88, 80, 8, 24, 'left'),
    new Hazard(88, 152, 8, 8, 'up'),
    new Hazard(96, 104, 8, 8, 'down'),
    new Hazard(112, 48, 24, 8, 'down'),
    new Hazard(144, 32, 16, 8, 'up'),
    new Hazard(184, 144, 8, 8, 'up'),
    new Hazard(280, 24, 8, 24, 'left'),
    new Hazard(280, 160, 8, 8, 'up'),
    new Hazard(288, 192, 456, 8, 'up').hide(),
    new Hazard(352, 80, 8, 8, 'right'),
    new Hazard(368, 104, 8, 8, 'right'),
    new Hazard(392, 160, 8, 8, 'left'),
    new Hazard(432, 104, 8, 8, 'up'),
    new Hazard(448, 144, 8, 8, 'left'),
    new Hazard(504, 144, 8, 8, 'left'),
    new Hazard(512, 136, 8, 8, 'up'),
    new Interactable(312, 80, 'test_scene', '', 'undefined', true).hide(),
    new Interactable(520, 104, 'test_scene', 'character/hajimi/normal', 'undefined', false),
    new LevelChanger(424, 56, 72, 16, 'Prologue', true).hide(),
    new MovingPlatform(new Vec2(208, 48), new Vec2(208, 24), 16, 16, 2, 'still').ref('plat1'),
    new Platform(-16, -72, 16, 104).hide(),
    new Platform(0, 32, 16, 160),
    new Platform(16, 32, 24, 16),
    new Platform(16, 120, 8, 8),
    new Platform(16, 128, 16, 8),
    new Platform(16, 168, 24, 8),
    new Platform(16, 176, 320, 16),
    new Platform(40, 32, 56, 8),
    new Platform(48, 64, 8, 8),
    new Platform(48, 96, 8, 16),
    new Platform(56, 64, 8, 48),
    new Platform(72, 152, 16, 24),
    new Platform(80, 168, 8, 8),
    new Platform(88, 160, 8, 16),
    new Platform(96, 32, 16, 56),
    new Platform(96, 88, 8, 16),
    new Platform(112, 32, 32, 8),
    new Platform(112, 40, 48, 8),
    new Platform(120, 160, 16, 16),
    new Platform(152, 80, 184, 8),
    new Platform(184, 152, 8, 24),
    new Platform(192, 144, 16, 32),
    new Platform(232, 168, 16, 8),
    new Platform(280, 168, 8, 8),
    new Platform(288, 24, 48, 56),
    new Platform(288, 160, 72, 16),
    new Platform(336, 48, 8, 32),
    new Platform(336, 80, 16, 8),
    new Platform(336, 176, 16, 8),
    new Platform(360, 104, 8, 8),
    new Platform(400, 160, 24, 8),
    new Platform(424, 104, 8, 16),
    new Platform(432, 112, 8, 8),
    new Platform(456, 144, 16, 8),
    new Platform(512, 144, 8, 8),
    new Platform(520, 136, 16, 16),
    new Trigger(168, 77, 16, 8, false, (game, $) => {
      game.ref('plat1').set(1)
      game.ref('t1').r.y += 1
      game.sound.play('item00')
    }, (game, $) => {
      game.ref('plat1').set(0)
      game.ref('t1').r.y -= 1
      game.sound.play('item00')
    }).ref('t1'),
    new Trigger(288, -72, 16, 288, false, (game, $) => {
      game.levelData.cameraBound.x = 0
    }, null).hide(),
    new Trigger(320, -72, 16, 288, false, (game, $) => {
      game.levelData.cameraBound.x = 320 - 16
    }, null).hide(),
    new Trigger(320, -72, 8, 288, true, (game, $) => {
      game.levelData.spawnpoint = new Vec2(328, 144)
      game.sound.play('heal')
    }, null).hide()
  )
}
