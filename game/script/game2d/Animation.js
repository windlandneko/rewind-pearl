import SpriteAnimation from './Sprite.js'

/**
 * 动画管理器
 * 管理多个动画状态并提供状态切换功能
 */
export default class AnimationManager {
  animations = new Map()
  currentAnimation = null
  currentAnimationName = null

  /**
   * 添加动画
   * @param {string} name - 动画名称
   * @param {SpriteAnimation} animation - 动画对象
   */
  addAnimation(name, animation) {
    this.animations.set(name, animation)
  }

  /**
   * 播放指定动画
   * @param {string} name - 动画名称
   * @param {boolean} force - 是否强制重新播放（即使当前已经是该动画）
   */
  playAnimation(name, force = false) {
    if (!this.animations.has(name)) {
      console.warn(`Animation "${name}" not found`)
      return
    }

    // 如果已经在播放该动画且不强制重播，则不做任何操作
    if (this.currentAnimationName === name && !force) {
      return
    }

    // 暂停当前动画
    if (this.currentAnimation) {
      this.currentAnimation.pause()
    }

    // 切换到新动画
    this.currentAnimation = this.animations.get(name)
    this.currentAnimationName = name

    // 重置并播放新动画
    this.currentAnimation.reset()
    this.currentAnimation.play()
  }

  /**
   * 更新当前动画
   * @param {number} deltaTime - 帧间隔时间（秒）
   */
  update(deltaTime) {
    if (this.currentAnimation) {
      this.currentAnimation.update(deltaTime)
    }
  }

  /**
   * 渲染当前动画
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} x - 绘制x坐标
   * @param {number} y - 绘制y坐标
   * @param {number} width - 绘制宽度
   * @param {number} height - 绘制高度
   */
  render(ctx, x, y, width, height) {
    if (this.currentAnimation) {
      this.currentAnimation.render(ctx, x, y, width, height)
    }
  }

  /**
   * 获取当前动画名称
   * @returns {string|null}
   */
  getCurrentAnimationName() {
    return this.currentAnimationName
  }

  /**
   * 检查当前动画是否完成
   * @returns {boolean}
   */
  isCurrentAnimationComplete() {
    return this.currentAnimation ? this.currentAnimation.isComplete() : false
  }

  /**
   * 暂停所有动画
   */
  pauseAll() {
    this.animations.forEach(animation => animation.pause())
  }

  /**
   * 停止所有动画
   */
  stopAll() {
    this.animations.forEach(animation => animation.stop())
    this.currentAnimation = null
    this.currentAnimationName = null
  }
}
