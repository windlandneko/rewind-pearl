import * as $ from '../gameObject/index.js'
import Vec2 from '../Vector.js'

export function Stage2(game) {
  game.levelData = {
    introDialogue: 'null',
    background: 'test',
    spawnpoint: new Vec2(539, 408),
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

  game.tilePalette = ["Air","GlacialIce","Rock","PaleLimestone","FadedBrickGrey","Rock","DarkRock","BetterSummitNoSnow","DarkRockMagma","ButternutBrick"]

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
    '                                                         222                                        222                                                         ',
    '                                                         222                                        222                                                         ',
    '                                                         222                                        222                                                         ',
    '                                                         222                                        222                                                         ',
    '                                                         222                                        222                                                         ',
    '                                                         222                                        222                                                         ',
    '                                                         222                                        222                                                         ',
    '                                                         222                           1111111111111222                                                         ',
    '                                                        2222                                        222                                                         ',
    '                                                        2222                                        222                                                         ',
    '                                                        2222                                        222                                                         ',
    '                                                        2222                                        222                                                         ',
    '                                                        2222                                        222                                                         ',
    '                                                        222211111111  111111              111    111222                                                         ',
    '                                                         222                                     111222                                                         ',
    '                                                        2222                                     111222                                                         ',
    '                                                        2222                                        222                                                         ',
    '                                                        2222                                        222                                                         ',
    '                                                        2222                                        222                                                         ',
    '                                                        2222                                        222                                                         ',
    '                                                        2222                                        222                                                         ',
    '                                                        2222                                        222                                                         ',
    '                                                         222                                        2222                                                        ',
    '                                                         222       111111111111                     2222                                                        ',
    '                                                         222       111111111111                     2222                                                        ',
    '                                                        2222       111111111111                     2222                                                        ',
    '                                                        2222                                        2222                                                        ',
    '                                                        2222                                        2222                                                        ',
    '                                                        2222                                        222                                                         ',
    '                                                         222                                        222                                                         ',
    '                                                         222                                                                                                    ',
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

    new $.Collectible(502, 438, 'sprite/linggangu', false),
    new $.Collectible(510, 318, 'sprite/linggangu', false),
    new $.Collectible(550, 310, 'sprite/linggangu', false),
    new $.Collectible(670, 422, 'sprite/linggangu', false),
    new $.Collectible(702, 286, 'sprite/linggangu', false),
    new $.Collectible(782, 326, 'sprite/linggangu', false),
    new $.Hazard(480, 472, 320, 8, 'up').hide(),
    new $.Hazard(608, 344, 32, 8, 'up').hide(),
    new $.Hazard(640, 448, 56, 8, 'up').hide(),
    new $.Hazard(688, 344, 24, 8, 'up').hide(),
    new $.Hazard(720, 288, 16, 8, 'up'),
    new $.Hazard(720, 448, 40, 8, 'up').hide(),
    new $.Hazard(792, 336, 8, 8, 'up'),
    new $.LevelChanger(792, 272, 8, 24, 'Stage3', true).hide(),
    new $.MovingPlatform(new Vec2(480, 464), new Vec2(480, 424), 56, 8, false, 5, 'still').ref('p1'),
    new $.MovingPlatform(new Vec2(544, 272), new Vec2(544, 208), 16, 80, false, 4, 'still').ref('p6'),
    new $.MovingPlatform(new Vec2(608, 344), new Vec2(608, 352), 32, 8, false, 0.1, 'still').ref('p5'),
    new $.MovingPlatform(new Vec2(648, 344), new Vec2(648, 312), 32, 8, false, 10, 'still').ref('p7'),
    new $.MovingPlatform(new Vec2(656, 456), new Vec2(656, 400), 40, 8, false, 5, 'still').ref('p2'),
    new $.MovingPlatform(new Vec2(688, 344), new Vec2(688, 352), 32, 8, false, 0.1, 'still').ref('p4'),
    new $.MovingPlatform(new Vec2(720, 456), new Vec2(720, 368), 40, 8, false, 4, 'still').ref('p3'),
    new $.Trigger(496, 456, 24, 8, false, (game, $) => {
      $('p1').set(1)
      $('c1').r.y += 1
      game.sound.play('item00')
      
    }, null).ref('c1').hide(),
    new $.Trigger(504, 336, 24, 8, false, (game, $) => {
            $('p7').set(1)
            $('c7').r.y += 1
            game.sound.play('item00')
      
    }, (game, $) => {
            $('p7').set(0)
            $('c7').r.y -= 1
            game.sound.play('item00')
    }).ref('c7'),
    new $.Trigger(576, 336, 24, 8, true, (game, $) => {
            $('p6').set(1)
            $('c6').r.y += 1
            game.sound.play('item00')
      
    }, null).ref('c6').hide(),
    new $.Trigger(576, 408, 16, 16, false, (game, $) => {
            $('p2').set(1)
            $('c2').r.y += 1
            game.sound.play('item00')
      
    }, (game, $) => {
            $('p2').set(0)
            $('c2').r.y -= 1
            game.sound.play('item00')
    }).ref('c2'),
    new $.Trigger(600, 408, 16, 16, false, (game, $) => {
            $('p3').set(1)
            $('c3').r.y += 1
            game.sound.play('item00')
    }, (game, $) => {
            $('p3').set(0)
            $('c3').r.y -= 1
            game.sound.play('item00')
    }).ref('c3'),
    new $.Trigger(616, 336, 16, 8, false, (game, $) => {
            $('p5').set(1)
            $('c5').r.y += 1
            game.sound.play('item00')
      
    }, (game, $) => {
            $('p5').set(0)
            $('c5').r.y -= 1
            game.sound.play('item00')
    }).ref('c5').hide(),
    new $.Trigger(696, 336, 16, 8, false, (game, $) => {
            $('p4').set(1)
            $('c4').r.y += 1
            game.sound.play('item00')
      
    }, (game, $) => {
            $('p4').set(0)
            $('c4').r.y -= 1
            game.sound.play('item00')
    }).ref('c4').hide()
  )
}

