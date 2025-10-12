import * as $ from '../gameObject/index.js'
import Vec2 from '../Vector.js'

export function Stage3(game) {
  game.levelData = {
    introDialogue: 'null',
    background: 'test',
    spawnpoint: new Vec2(499, 416),
    cameraHeight: 180,
    cameraBound: {
      x: 480,
      y: 270,
      width: 320,
      height: 180,
    },
    tileWidth: 160,
    tileHeight: 90,
  }

  game.tilePalette = ["Air","AutumnGrass","RockyMud","PaleLimestone","FadedBrickGrey","Rock","DarkRock","BetterSummitNoSnow","DarkRockMagma","ButternutBrick"]

  game.tileData = [
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                    222                                                         ',
    '                                                           2                                        222                                                         ',
    '                                                           2                                        222                                                         ',
    '                                                           2                                        222                                                         ',
    '                                                           2                                        222                                                         ',
    '                                                           2                                        222                                                         ',
    '                                                           2                                        222                                                         ',
    '                                                           2         222222          222222         222                                                         ',
    '                                                           2                                        222                                                         ',
    '                                                           2                                        222                                                         ',
    '                                                           2   2222          222222          22222222                                                           ',
    '                                                           2                                       22                                                           ',
    '                                                           2                        222            22                                                           ',
    '                                                           22     22                               22                                                           ',
    '                                                           2                                       22                                                           ',
    '                                                           2                            22222      22                                                           ',
    '                                                           2222                                    22                                                           ',
    '                                                           2               2222                 22222                                                           ',
    '                                                           2                                       22                                                           ',
    '                                                           2                               222     22                                                           ',
    '                                                           2                                       22                                                           ',
    '                                                           22                            22        22                                                           ',
    '                                                           2                                       22                                                           ',
    '                                                           2                                       22                                                           ',
    '                                                            1111111111111111111111111111111111111111                                                            ',
    '                                                            1111111111111111111111111111111111111111                                                            ',
    '                                                            1111111111111111111111111111111111111111                                                            ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
    '                                                                                                                                                                ',
  ]

  game.sound.playBGM('test')

  game.gameObjects.push(

    new $.Collectible(534, 334, 'sprite/linggangu', false),
    new $.Collectible(558, 286, 'sprite/linggangu', false),
    new $.Collectible(614, 358, 'sprite/linggangu', false),
    new $.Collectible(614, 406, 'sprite/linggangu', false),
    new $.Collectible(662, 342, 'sprite/linggangu', false),
    new $.Collectible(766, 302, 'sprite/linggangu', false),
    new $.Hazard(520, 424, 32, 8, 'up'),
    new $.Hazard(568, 288, 32, 8, 'up'),
    new $.Hazard(576, 424, 24, 8, 'up'),
    new $.Hazard(616, 312, 16, 8, 'up'),
    new $.Hazard(632, 424, 32, 8, 'up'),
    new $.Hazard(704, 352, 16, 8, 'up'),
    new $.LevelChanger(792, 272, 8, 48, 'Stage4', true).hide(),
    new $.MovingPlatform(new Vec2(480, 392), new Vec2(584, 392), 48, 8, false, 5, 'linear'),
    new $.MovingPlatform(new Vec2(744, 272), new Vec2(744, 216), 8, 48, false, 4, 'still').ref('p1'),
    new $.Trigger(688, 424, 24, 8, false, (game, $) => {
      $('p1').set(1)
      $('c1').r.y += 1
      game.sound.play('item00')
      
    }, (game, $) => {
            $('p1').set(0)
            $('c1').r.y -= 1
            game.sound.play('item00')
    }).ref('c1')
  )
}



