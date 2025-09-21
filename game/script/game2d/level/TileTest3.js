import * as $ from '../gameObject/index.js'
import Vec2 from '../Vector.js'

export function TileTest3(game) {
  const height = 180
  const width = 320

  game.levelData = {
    introDialogue: 'null',
    background: 'test',
    height,
    width,
    spawnpoint: new Vec2(160, 72),
    cameraHeight: 180,
    cameraBound: {
      x: 0,
      y: 0,
      width: 320,
      height: 180,
    },
  }

  game.tilePalette = ["Air","GlacialIce","BetterCementSnow","PaleLimestone","FadedBrickGrey","Rock","DarkRock","BetterSummitNoSnow","DarkRockMagma","ButternutBrick"]

  game.tileData = [
    '                                 4      ',
    '           11    2222  333      44      ',
    '          111    2  2     3    4 4      ',
    '            1       2   33     4 4      ',
    '            1     22      3   44444     ',
    '            1    2     3  3      4      ',
    '          11111  2222   33       4      ',
    '                                        ',
    '                                        ',
    '                                        ',
    '   55555                                ',
    '  55555   66666   77777  8888   999999  ',
    '  55     666666   77777 888888 99   99  ',
    '  55     66          77 88  88 99   99  ',
    '   5555  666666     77  888888 99  999  ',
    '     55  6666666    77   8888   999999  ',
    '     55  66   66   77   888888     99   ',
    ' 5   55  66   66   77   88  88     99   ',
    ' 555555  6666666  77    888888    999   ',
    '  5555    66666   77     8888     99    ',
    '                                  99    ',
    '                                  99    ',
    '                                        ',
  ]

  game.sound.playBGM('test')

  game.gameObjects.push(

    new $.Platform(64, 64, 48, 16, false)
  )
}
