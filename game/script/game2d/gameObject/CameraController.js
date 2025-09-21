import { Trigger } from './Trigger.js'
import { UPDATE_PER_SECOND } from '../GameConfig.js'

export class CameraController extends Trigger {
  padding

  /**
   * 摄像机控制器
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {number} padding
   */
  constructor(
    x,
    y,
    width,
    height,
    paddingX = 0,
    paddingY = 0,
    pauseSecond = 1
  ) {
    super(
      x - paddingX,
      y - paddingY,
      width + paddingX * 2,
      height + paddingY * 2,
      false,
      game => {
        console.log(game.levelData.cameraBound, { x, y, width, height })
        if (
          game.levelData.cameraBound.x === x &&
          game.levelData.cameraBound.y === y &&
          game.levelData.cameraBound.width === width &&
          game.levelData.cameraBound.height === height
        )
          return

        game.levelData.cameraBound = {
          x,
          y,
          width,
          height,
        }
        game.pauseUpdateUntilTick(UPDATE_PER_SECOND * pauseSecond)
      }
    )
    this.padding = 0
  }

  get state() {
    return {
      ...super.state,
      paddingX: this.paddingX,
      paddingY: this.paddingY,
      pauseSecond: this.pauseSecond,
    }
  }

  set state(state) {
    super.state = state
    this.paddingX = state.paddingX
    this.paddingY = state.paddingY
    this.pauseSecond = state.pauseSecond
  }
}
