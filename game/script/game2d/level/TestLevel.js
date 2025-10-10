import * as GO from '../gameObject/index.js'
import Vec2 from '../Vector.js'

export function 默认关卡(game) {
  game.levelData = {
  introDialogue: null,
    background: 'test',
    spawnpoint: new Vec2(507, 408),
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

  // 开门状态标记，防止重复开门逻辑；关卡重载时重置为 false
  if (game.levelData.door2Opened === undefined) game.levelData.door2Opened = false

  game.tilePalette = ["Air","BalatroSilver","BalatroSilver","PaleLimestone","FadedBrickGrey","Rock","DarkRock","BetterSummitNoSnow","DarkRockMagma","ButternutBrick"]

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
    '                                                                111111                                                                                          ',
    '                                                            11111111111111                                                                                      ',
    '                                                          111111111111111111                                                                                    ',
    '                                                          111111111 11111111             1111                                                                   ',
    '                                                         111111         111111111111111111111                                                                   ',
    '                                                         111111           1111111111111111111111111                                                             ',
    '                                                         1111             11111111111111111111111111                                                            ',
    '                                                         1                                   1     1                                                            ',
    '                                                         1                                   1                                                                  ',
    '                                                         1                                   1                                                                  ',
    '                                                         1                                   1                                                                  ',
    '                                                         11       11111      1               1                                                                  ',
    '                                                         1111                1     1         1    11                                                            ',
    '                                                         11111               11    11        1     1                                                            ',
    '                                                         11111                1111111        111   1                                                            ',
    '                                                        111111                 11111         1     1                                                            ',
    '                                                        111111                               1   111                                                            ',
    '                                                        11111                                1     1                                                            ',
    '                                                        11111           11111                111   1                                                            ',
    '                                                        11111               1                1     1                                                            ',
    '                                                       11111111111          1                1     1                                                            ',
    '                                                       111111               1          111         1                                                            ',
    '                                                       111111         1111111          111       111                                                            ',
    '                                                       111111                          1111        1                                                            ',
    '                                                       111111                     111  1111        1                                                            ',
    '                                                       111111                     111  1111        1                                                            ',
    '                                                        11111111111111111111111111111111111111111111                                                            ',
    '                                                          111111111111111111111111111111111111111111                                                            ',
    '                                                          111111111111111111111111111111111111111111                                                            ',
    '                                                           11111111111111111111111111111111111111111                                                            ',
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
    '                                                                                                                                                                ',
  ]

  game.sound.playBGM('test')

  game.gameObjects.push(

    new GO.Collectible(474, 298, 'sprite/linggangu', false).ref('one'),
    new GO.Collectible(594, 378, 'sprite/linggangu', false).ref('two'),
    new GO.Collectible(642, 314, 'sprite/linggangu', false).ref('three'),
    new GO.Collectible(682, 410, 'sprite/linggangu', false).ref('four'),
    new GO.Collectible(754, 314, 'sprite/linggangu', false).ref('five'),
    new GO.Hazard(568, 304, 8, 8, 'right'),
    new GO.Hazard(648, 408, 8, 16, 'left'),
    new GO.Hazard(688, 384, 8, 40, 'left'),
    new GO.Hazard(776, 336, 16, 8, 'up'),
    new GO.Hazard(776, 416, 16, 8, 'up'),
    new GO.Hazard(784, 400, 8, 16, 'left'),
    new GO.LevelChanger(792, 280, 8, 32, 'nextStage', true).hide(),
    new GO.MovingPlatform(new Vec2(576, 368), new Vec2(576, 344), 8, 24, false, 5, 'still').ref('door1'),
    new GO.MovingPlatform(new Vec2(712, 352), new Vec2(680, 336), 32, 8, false, 5, 'still').ref('play1'),
    new GO.MovingPlatform(new Vec2(784, 272), new Vec2(784, 232), 8, 40, false, 5, 'still').ref('door2'),
    new GO.Trigger(472, 296, 16, 16, false, (game, $) => {
      if (!game.levelData.door2Opened) {
        const remainingCollectibles = game.gameObjects.filter(obj => obj && 'collected' in obj && typeof obj.collected === 'boolean' && !obj.collected && !obj.removed).length;
        if (remainingCollectibles === 0) {
          const door = $('door2');
          if (door) { door.set(1); door.moveType = 'still'; }
          game.levelData.door2Opened = true;
          game.sound.play('bonus');
          if (console && console.debug) console.debug('[door2] opened by t2');
        }
      }
    }, null).ref('t2').hide(),
    new GO.Trigger(496, 368, 24, 8, false, (game, $) => {
      game.player.maxAirJumps = 1;
      game.sound.play('bonus');
      $('door1').set(1);
      game.sound.play('item00');
    }, (game, $) => {
      $('door1').set(0);
      const d1 = $('door1');
      if (d1) d1.moveType = 'still';
      game.sound.play('item00');
    }).hide(),
    new GO.Trigger(584, 368, 24, 24, false, (game, $) => {
      if (!game.levelData.door2Opened) {
        const remainingCollectibles = game.gameObjects.filter(obj => obj && 'collected' in obj && typeof obj.collected === 'boolean' && !obj.collected && !obj.removed).length;
        if (remainingCollectibles === 0) {
          const door = $('door2');
          if (door) { door.set(1); door.moveType = 'still'; }
          game.levelData.door2Opened = true;
          game.sound.play('bonus');
          if (console && console.debug) console.debug('[door2] opened by t5');
        }
      }
    }, null).ref('t5').hide(),
    new GO.Trigger(632, 304, 32, 24, false, (game, $) => {
      if (!game.levelData.door2Opened) {
        const remainingCollectibles = game.gameObjects.filter(obj => obj && 'collected' in obj && typeof obj.collected === 'boolean' && !obj.collected && !obj.removed).length;
        if (remainingCollectibles === 0) {
          const door = $('door2');
          if (door) { door.set(1); door.moveType = 'still'; }
          game.levelData.door2Opened = true;
          game.sound.play('bonus');
          if (console && console.debug) console.debug('[door2] opened by t3');
        }
      }
    }, null).ref('t3').hide(),
    new GO.Trigger(656, 400, 24, 8, false, (game, $) => {
      game.player.maxAirJumps = 1;
      game.sound.play('bonus');
      $('play1').set(1);
      game.sound.play('item00');
    }, (game, $) => {
      $('play1').set(0);
      const p1 = $('play1');
      if (p1) p1.moveType = 'still';
      game.sound.play('item00');
    }).hide(),
    new GO.Trigger(680, 408, 16, 16, false, (game, $) => {
      if (!game.levelData.door2Opened) {
        const remainingCollectibles = game.gameObjects.filter(obj => obj && 'collected' in obj && typeof obj.collected === 'boolean' && !obj.collected && !obj.removed).length;
        if (remainingCollectibles === 0) {
          const door = $('door2');
          if (door) { door.set(1); door.moveType = 'still'; }
          game.levelData.door2Opened = true;
          game.sound.play('bonus');
          if (console && console.debug) console.debug('[door2] opened by t1');
        }
      }
    }, null).ref('t1').hide(),
    new GO.Trigger(752, 312, 16, 16, false, (game, $) => {
      if (!game.levelData.door2Opened) {
        const remainingCollectibles = game.gameObjects.filter(obj => obj && 'collected' in obj && typeof obj.collected === 'boolean' && !obj.collected && !obj.removed).length;
        if (remainingCollectibles === 0) {
          const door = $('door2');
          if (door) { door.set(1); door.moveType = 'still'; }
          game.levelData.door2Opened = true;
          game.sound.play('bonus');
          if (console && console.debug) console.debug('[door2] opened by t4');
        }
      }
    }, null).ref('t4').hide()
  )
}
