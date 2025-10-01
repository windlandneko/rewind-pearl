import { Trigger } from './Trigger.js'
import { UPDATE_PER_SECOND } from '../GameConfig.js'

export class CameraController extends Trigger {
  UPDATE_PER_SECOND = UPDATE_PER_SECOND
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
    pauseSecond = 0.6,
    cameraHeight = 0
  ) {
    super(
      x - paddingX,
      y - paddingY,
      width + paddingX * 2,
      height + paddingY * 2,
      false,
      game => {
        if (this.cameraHeight > 0) {
          const height = this.cameraHeight
          const width = height * (game.displayWidth / game.displayHeight)

          // 设置摄像机参数
          game.levelData.cameraHeight = height
          game.camera.setViewportSize(width, height)
          game.scale = game.displayHeight / game.camera.viewport.height
        }
        if (
          game.levelData.cameraBound.x === this.r.x &&
          game.levelData.cameraBound.y === this.r.y &&
          game.levelData.cameraBound.width === this.width &&
          game.levelData.cameraBound.height === this.height
        )
          return

        game.levelData.cameraBound = {
          x: this.realX,
          y: this.realY,
          width: this.realWidth,
          height: this.realHeight,
        }
        game.pauseUpdateUntilTick(this.UPDATE_PER_SECOND * this.pauseSecond)
      }
    )

    this.realX = x
    this.realY = y
    this.realWidth = width
    this.realHeight = height

    this.pauseSecond = pauseSecond
    this.cameraHeight = cameraHeight
  }

  get state() {
    return {
      ...super.state,
      C: [
        this.realX,
        this.realY,
        this.realWidth,
        this.realHeight,
        this.paddingX,
        this.paddingY,
        this.pauseSecond,
        this.cameraHeight,
      ],
    }
  }

  set state(state) {
    super.state = state
    ;[
      this.realX,
      this.realY,
      this.realWidth,
      this.realHeight,
      this.paddingX,
      this.paddingY,
      this.pauseSecond,
      this.cameraHeight,
    ] = state.C
  }
}
