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
  const height = 240
  const width = 480

  game.levelData = {
    introDialogue: 'null',
    background: 'test',
    height,
    width,
    worldBorder: false,
    spawnpoint: new Vec2(32, 16),
    cameraHeight: 240,
  }

  SoundManager.playBGM('Memories of Memories')

  game.gameObjects.push(
      new Hazard(24, 216, 296, 8, 'up'),
    new MovingPlatform(new Vec2(200, 96), new Vec2(200, 48), 32, 8, 1, 'still').ref('plat1'),
    new MovingPlatform(new Vec2(360, 48), new Vec2(360, 96), 32, 8, 1, 'still').ref('plat2'),
    new Platform(16, 224, 304, 16),
    new Platform(280, 216, 8, 8),
    new Platform(272, 32, 48, 96),
    new Platform(152, 128, 168, 8),
    new Platform(80, 216, 8, 8),
    new Platform(16, 48, 80, 16),
    new Platform(96, 48, 16, 88),
    new Platform(0, 32, 16, 208),
    new Platform(288, 208, 32, 16),
    new Platform(48, 144, 8, 8),
    new Platform(48, 112, 8, 8),
    new Platform(56, 112, 8, 56),
    new Platform(72, 200, 24, 24),
    new Platform(128, 208, 24, 16),
    new Platform(184, 208, 8, 16),
    new Platform(192, 200, 16, 24),
    new Hazard(56, 168, 8, 8, 'down'),
    new Platform(232, 216, 16, 8),
    new Platform(64, 64, 32, 8),
    new Hazard(24, 64, 40, 8, 'down'),
    new Platform(16, 64, 8, 16),
    new Hazard(112, 104, 8, 32, 'right'),
    new Hazard(64, 112, 8, 48, 'right'),
    new Hazard(264, 32, 8, 32, 'left'),
    new Collectible(53, 93, 'sprite/linggangu'),
    new Hazard(88, 72, 8, 24, 'left'),
    new Trigger(72, 28, 16, 4, false, game => {game.ref('plat1').set(1)
game.ref('plat2').set(1)
game.ref('t1').r.y += 2
game.sound.play('item00')}, game => {game.ref('plat1').set(0)
game.ref('plat2').set(0)
game.ref('t1').r.y -= 2
game.sound.play('item00')}).ref('t1'),
    new Platform(16, 208, 16, 16),
    new Platform(32, 216, 16, 8),
    new Hazard(16, 80, 8, 128, 'right'),
    new Platform(16, 168, 16, 8),
    new Platform(16, 32, 128, 8),
    new Platform(16, 40, 120, 8),
    new Collectible(301, 197, 'sprite/linggangu'),
    new Collectible(37, 205, 'sprite/linggangu'),
    new Collectible(213, 29, 'sprite/linggangu'),
    new Collectible(213, 69, 'sprite/linggangu'),
    new Platform(344, 200, 80, 24),
    new Interactable(376, 176, 'test_scene', 'character/hajimi/normal', '你过关！'),
    new Collectible(293, 13, 'sprite/linggangu_stone'),
    new Collectible(453, 13, 'sprite/linggangu_stone'),
    new LevelChanger(320, 240, 176, 16, 'Prologue', true),
    new LevelChanger(480, -72, 16, 104, 'HazardTest', true),
    new Platform(432, 32, 48, 104),
    new LevelChanger(480, 136, 16, 104, 'Prologue', true),
    new Platform(-17, -72, 16, 104)
  )
}
