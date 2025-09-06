import { SPRITE_FRAME_DURATION } from './GameConfig.js'

/**
 * 精灵图动画系统
 * 支持基于时间的帧播放，防止帧率波动影响动画速度
 */
export default class SpriteAnimation {
  /**
   * @param {HTMLImageElement} spriteSheet - 精灵图图片
   * @param {number} frameCount - 总帧数
   * @param {number} frameWidth - 每帧宽度
   * @param {number} frameHeight - 每帧高度
   * @param {number} frameDuration - 每帧持续时间（毫秒），默认使用配置值
   * @param {boolean} loop - 是否循环播放
   */
  constructor(
    spriteSheet,
    frameCount,
    frameWidth = 32,
    frameHeight = 32,
    frameDuration = null,
    loop = true
  ) {
    this.spriteSheet = spriteSheet
    this.frameCount = frameCount
    this.frameWidth = frameWidth
    this.frameHeight = frameHeight
    this.frameDuration = frameDuration || SPRITE_FRAME_DURATION
    this.loop = loop

    this.currentFrame = 0
    this.elapsedTime = 0
    this.isPlaying = true
    this.isFinished = false
  }

  /**
   * 更新动画状态
   * @param {number} deltaTime - 帧间隔时间（秒）
   */
  update(deltaTime) {
    if (!this.isPlaying || this.isFinished) {
      return
    }

    this.elapsedTime += deltaTime * 1000 // 转换为毫秒

    // 检查是否需要切换到下一帧
    if (this.elapsedTime >= this.frameDuration) {
      this.elapsedTime -= this.frameDuration
      this.currentFrame++

      // 处理循环或结束
      if (this.currentFrame >= this.frameCount) {
        if (this.loop) {
          this.currentFrame = 0
        } else {
          this.currentFrame = this.frameCount - 1
          this.isFinished = true
          this.isPlaying = false
        }
      }
    }
  }

  /**
   * 渲染当前帧
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} x - 绘制x坐标
   * @param {number} y - 绘制y坐标
   * @param {number} width - 绘制宽度（可选，默认使用帧宽度）
   * @param {number} height - 绘制高度（可选，默认使用帧高度）
   */
  render(ctx, x, y, width = this.frameWidth, height = this.frameHeight) {
    if (!this.spriteSheet) return

    const sourceX = this.currentFrame * this.frameWidth
    const sourceY = 0

    ctx.drawImage(
      this.spriteSheet,
      sourceX,
      sourceY,
      this.frameWidth,
      this.frameHeight,
      x,
      y,
      width,
      height
    )
  }

  /**
   * 重置动画到第一帧
   */
  reset() {
    this.currentFrame = 0
    this.elapsedTime = 0
    this.isFinished = false
  }

  /**
   * 播放动画
   */
  play() {
    this.isPlaying = true
    if (this.isFinished) {
      this.reset()
    }
  }

  /**
   * 暂停动画
   */
  pause() {
    this.isPlaying = false
  }

  /**
   * 停止动画并重置到第一帧
   */
  stop() {
    this.isPlaying = false
    this.reset()
  }

  /**
   * 设置当前帧
   * @param {number} frame - 帧索引
   */
  setFrame(frame) {
    if (frame >= 0 && frame < this.frameCount) {
      this.currentFrame = frame
      this.elapsedTime = 0
    }
  }

  /**
   * 检查动画是否完成
   * @returns {boolean}
   */
  isComplete() {
    return this.isFinished
  }

  /**
   * 获取当前帧索引
   * @returns {number}
   */
  getCurrentFrame() {
    return this.currentFrame
  }
}
