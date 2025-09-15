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
  const height = 216
  const width = 960

  game.levelData = {
    introDialogue: 'null',
    background: 'test',
    height,
    width,
    worldBorder: false,
    spawnpoint: new Vec2(32, 8),
    cameraHeight: 216,
  }

  SoundManager.playBGM('Memories of Memories')

  game.gameObjects.push(
      new Hazard(24, 192, 296, 8, 'up'),
    new Platform(16, 200, 304, 16),
    new Platform(280, 192, 8, 8),
    new Platform(152, 104, 168, 8),
    new Platform(80, 192, 8, 8),
    new Platform(288, 184, 32, 16),
    new Platform(48, 88, 8, 8),
    new Platform(72, 176, 24, 24),
    new Platform(128, 184, 24, 16),
    new Platform(232, 192, 16, 8),
    new Collectible(298, 170, 'sprite/linggangu'),
    new Collectible(210, 42, 'sprite/linggangu'),
    new Hazard(16, 160, 8, 32, 'right'),
    new Platform(16, 192, 24, 8),
    new Platform(16, 144, 8, 8),
    new Platform(16, 152, 16, 8),
    new Collectible(26, 178, 'sprite/linggangu'),
    new Hazard(16, 72, 8, 72, 'right'),
    new Platform(16, 56, 8, 16),
    new Hazard(24, 56, 32, 8, 'down'),
    new Hazard(56, 64, 40, 8, 'down'),
    new Platform(56, 56, 40, 8),
    new Hazard(184, 168, 8, 8, 'up'),
    new Platform(184, 176, 8, 24),
    new Platform(192, 168, 16, 32),
    new Platform(96, 112, 8, 16),
    new Hazard(88, 104, 8, 24, 'left'),
    new Hazard(112, 88, 8, 24, 'right'),
    new Platform(96, 40, 16, 72),
    new Platform(272, 24, 48, 80),
    new Hazard(264, 24, 8, 32, 'left'),
    new Platform(432, 24, 48, 88),
    new Platform(16, 24, 128, 8),
    new Platform(16, 40, 80, 16),
    new Platform(16, 32, 120, 8),
    new Platform(-17, -80, 16, 104),
    new LevelChanger(480, -80, 16, 104, 'HazardTest', true),
    new Platform(0, 24, 16, 192),
    new Collectible(450, 10, 'sprite/linggangu_stone'),
    new Collectible(210, 10, 'sprite/linggangu'),
    new Trigger(72, 21, 16, 8, false, game => {game.ref('plat1').set(1)
game.ref('plat2').set(1)
game.ref('t1').r.y += 1
game.sound.play('item00')}, game => {game.ref('plat1').set(0)
game.ref('plat2').set(0)
game.ref('t1').r.y -= 1
game.sound.play('item00')}).ref('t1'),
    new Collectible(290, 10, 'sprite/linggangu_stone'),
    new Collectible(50, 74, 'sprite/linggangu_stone'),
    new Platform(56, 88, 8, 48),
    new Platform(48, 120, 8, 16),
    new Hazard(48, 136, 16, 8, 'down'),
    new LevelChanger(320, 216, 512, 16, 'Prologue', true),
    new Hazard(280, 184, 8, 8, 'up'),
    new Hazard(344, 184, 8, 8, 'left'),
    new Interactable(512, 128, 'test_scene', 'character/hajimi/normal', '你过关！'),
    new Hazard(400, 168, 8, 8, 'left'),
    new Platform(352, 184, 24, 8),
    new Platform(408, 168, 16, 8),
    new Platform(464, 168, 8, 8),
    new Hazard(456, 168, 8, 8, 'left'),
    new Hazard(464, 160, 8, 8, 'up'),
    new Platform(472, 160, 16, 16),
    new Hazard(368, 128, 8, 8, 'up'),
    new Platform(368, 136, 8, 8),
    new MovingPlatform(new Vec2(200, 72), new Vec2(200, 24), 32, 8, 1, 'still').ref('plat1'),
    new MovingPlatform(new Vec2(360, 24), new Vec2(360, 72), 32, 8, 2, 'still').ref('plat2')
  )
}
