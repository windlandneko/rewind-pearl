import {
  Enemy,
  Interactable,
  Collectible,
  LevelChanger,
  Platform,
  Trigger,
  MovingPlatform,
} from '../gameObject/index.js'
import Vec2 from '../Vector.js'
import SoundManager from '../../SoundManager.js'

export function Prologue(game) {
  const height = 192
  const width = 320

  game.levelData = {
    introDialogue: 'null',
    background: 'test',
    height,
    width,
    worldBorder: false,
    spawnpoint: new Vec2(125, 136),
    cameraHeight: 192,
  }

  SoundManager.playBGM('test')

  game.gameObjects.push(
    new Platform(248, 88, 24, 8),
    new Platform(256, 96, 16, 8),
    new Platform(264, 80, 8, 8),
    new Platform(208, 64, 16, 8),
    new Platform(248, 32, 24, 8),
    new Platform(264, 40, 8, 8),
    new Platform(200, 120, 24, 8),
    new Platform(40, 80, 32, 8),
    new Platform(40, 88, 24, 8),
    new Platform(208, 56, 24, 8),
    new Platform(160, 128, 72, 8),
    new Trigger(
      240,
      104,
      32,
      32,
      false,
      game => {
        game.player.maxAirJumps++
        game.sound.play('bonus')
      },
      game => {
        game.player.maxAirJumps--
        game.sound.play('bonus')
      }
    ),
    new Platform(40, -16, 168, 96),
    new Platform(-16, -16, 56, 224),
    new Platform(40, 144, 296, 64),
    new Platform(104, 136, 232, 8),
    new LevelChanger(320, 0, 16, 16, 'Stage1', true),
    new Platform(272, 16, 64, 120),
    new Platform(176, -16, 160, 16),
    new Platform(40, 128, 8, 16),
    new Platform(40, 96, 8, 16),
    new Platform(48, 136, 8, 8),
    new Platform(88, 80, 64, 8),
    new Trigger(
      72,
      136,
      16,
      8,
      false,
      game => {
        game.ref('door').set(1)
        game.sound.play('noise')
      },
      game => {
        game.ref('door').set(0)
        game.sound.play('noise')
      }
    ),
    new MovingPlatform(
      new Vec2(176, 80),
      new Vec2(176, 24),
      16,
      48,
      1,
      'still'
    ).ref('door')
  )
}
