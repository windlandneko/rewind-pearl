import * as $ from '../gameObject/index.js'
import Vec2 from '../Vector.js'

export function Stage1(game) {
  game.levelData = {
    introDialogue: 'null',
    background: 'test',
    spawnpoint: new Vec2(24, 8),
    cameraHeight: 180,
    cameraBound: {
      x: 0,
      y: 0,
      width: 320,
      height: 180,
    },
    tileWidth: 88,
    tileHeight: 23,
  }

  game.tilePalette = ["Air","ButternutGrass","FadedBrickGrey","FadedBrickWhite","FadedBrickGrey","Rock","DarkRock","BetterSummitNoSnow","BetterSummit","ButternutBrick"]

  game.tileData = [
    '                                                                                        ',
    '                                                                                        ',
    '                                                                                        ',
    '222222222222222222222               666666                                              ',
    '2222222     22222222                666666                                              ',
    '22          22                      6666666                                             ',
    '22          22                      6666666                                             ',
    '22    22    22                      6666666                                             ',
    '22     2    22                      6666666                                             ',
    '222    2    22     6666666666666666666666666                                            ',
    '22     2    2                                                                           ',
    '22     2    2                                                                           ',
    '22    22                                     2       2                                  ',
    '22                                                   22                                 ',
    '222                                                                                     ',
    '2222                                                                                    ',
    '2222                                                             22                     ',
    '22                      22                               22     222                     ',
    '22       22            222                                                              ',
    '22       222   22      222          222222222     222                                   ',
    '222222   222   22      222   22    2222222222                                           ',
    '22222222222222222222222222222222222222222222                                            ',
    '2222222222222222222222222222222222222222                                                ',
  ]

  game.sound.playBGM('Memories of Memories')

  game.gameObjects.push(

    new $.CameraController(0, 0, 320, 180, -16, 0, 1, undefined).hide(),
    new $.CameraController(304, 0, 336, 180, -16, 0, 1, undefined).hide(),
    new $.Collectible(74, 78, 'sprite/strawberry', undefined),
    new $.Collectible(210, 50, 'sprite/linggangu', undefined),
    new $.Collectible(238, 94, 'sprite/linggangu', undefined),
    new $.Collectible(310, 14, 'sprite/strawberry', undefined),
    new $.Collectible(310, 142, 'sprite/linggangu', undefined),
    new $.Hazard(16, 104, 8, 8, 'up'),
    new $.Hazard(16, 152, 8, 8, 'up'),
    new $.Hazard(32, 120, 8, 16, 'right'),
    new $.Hazard(48, 104, 16, 8, 'down'),
    new $.Hazard(48, 160, 24, 8, 'up'),
    new $.Hazard(56, 32, 24, 8, 'down'),
    new $.Hazard(88, 64, 8, 32, 'left'),
    new $.Hazard(88, 144, 8, 8, 'up'),
    new $.Hazard(96, 96, 8, 8, 'down'),
    new $.Hazard(96, 160, 24, 8, 'up'),
    new $.Hazard(112, 40, 24, 8, 'down'),
    new $.Hazard(136, 160, 48, 8, 'up'),
    new $.Hazard(184, 136, 8, 8, 'up'),
    new $.Hazard(208, 160, 24, 8, 'up'),
    new $.Hazard(248, 160, 32, 8, 'up'),
    new $.Hazard(280, 24, 8, 24, 'left'),
    new $.Hazard(280, 152, 8, 8, 'up'),
    new $.Hazard(288, 184, 456, 8, 'up').hide(),
    new $.Hazard(352, 72, 8, 8, 'right'),
    new $.Hazard(368, 96, 8, 8, 'right'),
    new $.Hazard(392, 152, 8, 8, 'left'),
    new $.Hazard(432, 96, 8, 8, 'up'),
    new $.Hazard(448, 136, 8, 8, 'left'),
    new $.Hazard(504, 136, 8, 8, 'left'),
    new $.Hazard(512, 128, 8, 8, 'up'),
    new $.Interactable(28, 147, 11, 13, 'test_scene', 'sprite/linggangu', '提示文本', false, null),
    new $.Interactable(520, 112, 16, 16, 'test_scene', 'character/hajimi/normal', '', true, null).hide(),
    new $.LevelChanger(536, 128, 104, 16, 'Prologue', true).hide(),
    new $.MovingPlatform(new Vec2(200.84122857025068, 43.05421419314824), new Vec2(200, 16), 24, 24, false, 2, 'still').ref('plat1'),
    new $.Platform(-16, -80, 16, 104, false).hide(),
    new $.Platform(120, 80, 24, 8, true),
    new $.Platform(120, 104, 24, 8, true),
    new $.Platform(120, 128, 24, 8, true),
    new $.Trigger(248, 69, 16, 8, false, (game, $) => {
      $('plat1').set(1)
      $('t1').r.y += 1
      game.sound.play('item00')
    }, (game, $) => {
      $('plat1').set(0)
      $('t1').r.y -= 1
      game.sound.play('item00')
    }).ref('t1'),
    new $.Trigger(296, -80, 8, 288, true, (game, $) => {
      game.levelData.spawnpoint = new Vec2(32, 16)
    }, null).hide(),
    new $.Trigger(320, -80, 8, 288, true, (game, $) => {
      game.levelData.spawnpoint = new Vec2(328, 136)
    }, null).hide()
  )
}
