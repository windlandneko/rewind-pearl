import * as $ from '../gameObject/index.js'
import Vec2 from '../Vector.js'

export function Stage2(game) {
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
    onUpdate: null,

    collectId: null,
    collectCount: 0,
    collectTotal: 0,
  }

  game.tilePalette = ["Air","ButternutGrass","FadedBrickGrey","FadedBrickWhite","FadedBrickGrey","Rock","DarkRock","BetterSummitNoSnow","BetterSummit","ButternutBrick"]

  game.tileData = [
    '2222222222222222222222222222222222222222222224444444444444444444444444444444444444444444',
    '                                    22                                                  ',
    '                                    22                                                  ',
    '2222222222222222222222              22                                                  ',
    '2222      22222222222               22                                                  ',
    '22          22                      2222222                                             ',
    '22          22                      2222222                                             ',
    '22    22    22                      2222222                                             ',
    '22     2    22                      22222222                                            ',
    '222    2    222  222222222222222222222222222                                            ',
    '22     2    22                                                                          ',
    '22     2    22                                    222                                   ',
    '22    22    22                                                                          ',
    '22                                                                                      ',
    '222                                                                                     ',
    '2222                                                                                    ',
    '2222                                                             224                    ',
    '22                       22                              22     2444                    ',
    '22       22    22       222                                                             ',
    '22       222   22       222          2222222      222                                   ',
    '222222   222   22       222  22     2222222                                             ',
    '22222222222222222222222222222222222222224                                               ',
    '22222222222222222222222222222222222244444                                               ',
  ]

  game.sound.playBGM('Memories of Memories')

  game.gameObjects.push(

    new $.CameraController(0, 0, 320, 180, -16, 0, 1, undefined).hide(),
    new $.CameraController(304, 0, 336, 180, -16, 0, 1, undefined).hide(),
    new $.Collectible(30, 150, 'sprite/linggangu', undefined, null),
    new $.Collectible(80, 94, 'sprite/strawberry', undefined, null),
    new $.Collectible(150, 54, 'sprite/linggangu', undefined, null),
    new $.Collectible(254, 22, 'sprite/linggangu', undefined, null),
    new $.Collectible(310, 30, 'sprite/strawberry', undefined, null),
    new $.Collectible(310, 142, 'sprite/linggangu', undefined, null),
    new $.Hazard(16, 40, 16, 8, 'down'),
    new $.Hazard(16, 104, 8, 8, 'right'),
    new $.Hazard(16, 152, 8, 8, 'up'),
    new $.Hazard(24, 72, 8, 8, 'right'),
    new $.Hazard(32, 32, 48, 8, 'down'),
    new $.Hazard(32, 120, 8, 16, 'right'),
    new $.Hazard(48, 104, 16, 8, 'down'),
    new $.Hazard(48, 160, 24, 8, 'up'),
    new $.Hazard(80, 40, 16, 8, 'down'),
    new $.Hazard(88, 56, 8, 48, 'left'),
    new $.Hazard(88, 144, 8, 8, 'up'),
    new $.Hazard(96, 104, 16, 8, 'down'),
    new $.Hazard(96, 160, 24, 8, 'up'),
    new $.Hazard(112, 40, 24, 8, 'down'),
    new $.Hazard(136, 160, 56, 8, 'up'),
    new $.Hazard(192, 136, 8, 8, 'up'),
    new $.Hazard(216, 160, 16, 8, 'up'),
    new $.Hazard(248, 160, 40, 8, 'up'),
    new $.Hazard(288, 152, 8, 8, 'up'),
    new $.Hazard(288, 200, 240, 8, 'up').hide(),
    new $.Hazard(352, 64, 8, 16, 'right'),
    new $.Hazard(392, 152, 8, 8, 'left'),
    new $.Hazard(416, 80, 8, 8, 'up'),
    new $.Hazard(448, 136, 8, 8, 'left'),
    new $.Hazard(504, 136, 8, 8, 'left'),
    new $.Hazard(512, 128, 8, 8, 'up'),
    new $.Interactable(-16, -24, 16, 48, 'stage1/can_not_go_back', 'sprite/linggangu', '提示文本', true, null),
    new $.Interactable(520, 112, 24, 16, 'test_scene', 'character/hajimi/normal', '', false, null).hide(),
    new $.LevelChanger(536, 176, 168, 16, 'Prologue', true).hide(),
    new $.MovingPlatform(new Vec2(144, 48), new Vec2(216, 48), 16, 16, false, 2.5, 'still').ref('plat1'),
    new $.Platform(-16, -40, 16, 104, false).hide(),
    new $.Platform(456, 112, 16, 8, true),
    new $.Platform(528, 144, 8, 88, false).hide(),
    new $.Trigger(248, 69, 16, 8, false, async (game, $) => {
      $('plat1').set(1)
      $('t1').r.y += 1
      game.sound.play('item00')
    }, async (game, $) => {
      $('plat1').set(0)
      $('t1').r.y -= 1
      game.sound.play('item00')
    }).ref('t1'),
    new $.Trigger(296, -80, 8, 288, false, async (game, $) => {
      game.levelData.spawnpoint = new Vec2(32, 16)
    }, null).hide(),
    new $.Trigger(320, -80, 8, 288, false, async (game, $) => {
      game.levelData.spawnpoint = new Vec2(328, 136)
    }, null).hide()
  )
}
