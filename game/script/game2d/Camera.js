import Vec2 from './Vector.js'

/**
 * 2D摄像机类
 *
 * @author windlandneko
 */
export class Camera {
  #padding
  #target
  #worldBounds
  viewportWidth
  viewportHeight
  #lerpFactor = 0

  position = new Vec2(0, 0)

  // 震动系统
  #shakeIntensity = 0
  #shakeDuration = 0
  #shakeTimer = 0
  #shakeFrequency = 5
  #shakeOffset = new Vec2(0, 0)

  // 持续微震动系统
  #microShakeIntensity = 0.8
  #microShakeFrequency = 0.2
  #microShakeOffset = new Vec2(0, 0)
  #microShakeTime = 0

  /**
   * 设置跟随目标
   * @param {Object} target - 要跟随的对象，必须包含 r.x、r.y、width、height 属性
   */
  set target(target) {
    this.#target = target
  }

  /**
   * 设置摄像机视窗尺寸
   * @param {number} width - 视窗宽度
   * @param {number} height - 视窗高度
   */
  setViewportSize(width, height) {
    this.viewportWidth = width
    this.viewportHeight = height
  }

  /**
   * 设置跟随边距
   * @param {number} left - 左边距
   * @param {number} right - 右边距
   * @param {number} top - 上边距
   * @param {number} bottom - 下边距
   */
  setPadding(left, right, top, bottom) {
    this.#padding = { left, right, top, bottom }
  }

  /**
   * 设置世界边界
   * @param {number} minX - 世界最小X坐标
   * @param {number} minY - 世界最小Y坐标
   * @param {number} width - 世界宽度
   * @param {number} height - 世界高度
   */
  setWorldBounds(
    minX,
    minY,
    width = this.#worldBounds?.maxX - this.#worldBounds?.minX,
    height = this.#worldBounds?.maxY - this.#worldBounds?.minY
  ) {
    this.#worldBounds = { minX, minY, maxX: minX + width, maxY: minY + height }
  }

  /**
   * 清除世界边界限制
   */
  clearWorldBounds() {
    this.#worldBounds = null
  }

  /**
   * 设置平滑跟随参数
   * @param {boolean} enabled - 是否启用平滑跟随
   * @param {number} factor - 插值因子 (0-1)
   */
  set smoothFactor(factor = 1) {
    this.#lerpFactor = Math.max(0, Math.min(1, factor))
  }

  /**
   * 触发相机震动
   * @param {number} intensity - 震动强度
   * @param {number} duration - 震动持续时间（秒）
   * @param {number} frequency - 震动频率（每秒震动次数，默认50）
   */
  shake(intensity = 10, duration = 0.5, frequency = 50) {
    this.#shakeIntensity = Math.max(this.#shakeIntensity, intensity)
    this.#shakeDuration = Math.max(this.#shakeDuration, duration)
    this.#shakeTimer = 0
    this.#shakeFrequency = frequency
  }

  /**
   * 简单的噪波函数（基于伪随机）
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @returns {number} 噪波值 (-1 到 1)
   */
  #noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
    return (n - Math.floor(n)) * 2 - 1
  }

  /**
   * 平滑噪波插值
   * @param {number} a - 起始值
   * @param {number} b - 结束值
   * @param {number} t - 插值参数 (0-1)
   * @returns {number} 插值结果
   */
  #smoothStep(a, b, t) {
    t = t * t * (3 - 2 * t) // 平滑插值函数
    return a + (b - a) * t
  }

  /**
   * 2D噪波函数
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @returns {number} 噪波值 (-1 到 1)
   */
  #noise2D(x, y) {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const xf = x - xi
    const yf = y - yi

    // 获取四个角的噪波值
    const n00 = this.#noise(xi, yi)
    const n01 = this.#noise(xi, yi + 1)
    const n10 = this.#noise(xi + 1, yi)
    const n11 = this.#noise(xi + 1, yi + 1)

    // 在X方向插值
    const nx0 = this.#smoothStep(n00, n10, xf)
    const nx1 = this.#smoothStep(n01, n11, xf)

    // 在Y方向插值
    return this.#smoothStep(nx0, nx1, yf)
  }

  /**
   * 更新震动效果
   * @param {number} dt - 帧时间间隔
   */
  #updateShake(dt) {
    if (this.#shakeTimer < this.#shakeDuration) {
      this.#shakeTimer += dt

      // 计算震动衰减（线性衰减）
      const progress = this.#shakeTimer / this.#shakeDuration
      const currentIntensity = this.#shakeIntensity * (1 - progress)

      // 使用噪波生成震动偏移
      const time = this.#shakeTimer * this.#shakeFrequency
      const noiseScale = 1.0 // 进一步提高噪波缩放因子，增加频率

      // 为X和Y使用不同的噪波坐标，避免对称
      const noiseX = this.#noise2D(time * noiseScale, 0)
      const noiseY = this.#noise2D(0, time * noiseScale)

      // 震动幅度
      const amplitudeMultiplier = 1.0
      this.#shakeOffset.x = noiseX * currentIntensity * amplitudeMultiplier
      this.#shakeOffset.y = noiseY * currentIntensity * amplitudeMultiplier
    } else {
      // 震动结束，重置
      this.#shakeIntensity = 0
      this.#shakeDuration = 0
      this.#shakeTimer = 0
      this.#shakeOffset.x = 0
      this.#shakeOffset.y = 0
    }
  }

  /**
   * 更新微震动效果
   * @param {number} dt - 帧时间间隔
   */
  #updateMicroShake(dt) {
    this.#microShakeTime += dt

    // 使用噪波生成微震动偏移
    const time = this.#microShakeTime * this.#microShakeFrequency
    const noiseScale = 1.0

    // 为X和Y使用不同的噪波坐标，避免对称
    const noiseX = this.#noise2D(time * noiseScale, 0)
    const noiseY = this.#noise2D(0, time * noiseScale)

    // 微震动幅度
    this.#microShakeOffset.x = noiseX * this.#microShakeIntensity
    this.#microShakeOffset.y = noiseY * this.#microShakeIntensity
  }

  /**
   * 更新摄像机位置
   * @param {number} dt - 帧时间间隔
   */
  update(dt) {
    // 更新震动效果
    this.#updateShake(dt)

    // 更新微震动效果
    this.#updateMicroShake(dt)

    if (!this.#target) return

    // 目标在屏幕中的位置
    const target = this.#target.r
      .sub(this.targetPosition)
      .add(this.#target.width / 2, this.#target.height / 2)

    let delta = new Vec2()

    if (target.x < this.#padding.left) {
      // 目标在左边距外，摄像机需要向左移动
      delta.x = target.x - this.#padding.left
    } else if (target.x > this.viewportWidth - this.#padding.right) {
      // 目标在右边距外，摄像机需要向右移动
      delta.x = target.x - (this.viewportWidth - this.#padding.right)
    }

    if (target.y < this.#padding.top) {
      // 目标在上边距外，摄像机需要向上移动
      delta.y = target.y - this.#padding.top
    } else if (target.y > this.viewportHeight - this.#padding.bottom) {
      // 目标在下边距外，摄像机需要向下移动
      delta.y = target.y - (this.viewportHeight - this.#padding.bottom)
    }

    // 新的摄像机位置
    this.targetPosition.addTo(delta)

    // 世界边界限制
    if (this.#worldBounds) {
      this.targetPosition.x = Math.max(
        this.#worldBounds.minX,
        Math.min(
          this.targetPosition.x,
          this.#worldBounds.maxX - this.viewportWidth
        )
      )
      this.targetPosition.y = Math.max(
        this.#worldBounds.minY,
        Math.min(
          this.targetPosition.y,
          this.#worldBounds.maxY - this.viewportHeight
        )
      )
    }

    this.position.addTo(
      this.targetPosition.sub(this.position).mul(this.#lerpFactor)
    )

    // todo: soft border and hard border
  }

  /**
   * 立即移动摄像机到指定位置
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  setPosition(x, y) {
    this.targetPosition = new Vec2(x, y)

    // 应用世界边界限制
    if (this.#worldBounds) {
      this.targetPosition.x = Math.max(
        this.#worldBounds.minX,
        Math.min(
          this.targetPosition.x,
          this.#worldBounds.maxX - this.viewportWidth
        )
      )
      this.targetPosition.y = Math.max(
        this.#worldBounds.minY,
        Math.min(
          this.targetPosition.y,
          this.#worldBounds.maxY - this.viewportHeight
        )
      )
    }

    this.position = this.targetPosition.clone()
  }

  /**
   * 立即将摄像机居中到目标位置
   */
  centerOnTarget() {
    if (!this.#target) return

    const centerX = this.#target.r.x - this.viewportWidth / 2
    const centerY = this.#target.r.y - this.viewportHeight / 2
    this.setPosition(centerX, centerY)
  }

  /**
   * 获取摄像机视窗信息
   * @returns {{x: number, y: number, width: number, height: number}}
   */
  get viewport() {
    const renderPos = this.getRenderPosition()
    return {
      x: renderPos.x,
      y: renderPos.y,
      width: this.viewportWidth,
      height: this.viewportHeight,
    }
  }

  /**
   * 检查对象是否在摄像机视野内
   * @param {Object} object - 要检查的对象
   * @param {number} margin - 额外的边距
   * @returns {boolean}
   */
  isInView(object, margin = 0) {
    const viewport = this.viewport

    return (
      object.r.x + object.width >= viewport.x - margin &&
      object.r.x <= viewport.x + viewport.width + margin &&
      object.r.y + object.height >= viewport.y - margin &&
      object.r.y <= viewport.y + viewport.height + margin
    )
  }

  /**
   * 获取相机的实际渲染位置（包含震动偏移）
   */
  getRenderPosition() {
    return this.position.add(this.#shakeOffset).add(this.#microShakeOffset)
  }

  /**
   * 将世界坐标转换为屏幕坐标
   * @param {number} worldX - 世界X坐标
   * @param {number} worldY - 世界Y坐标
   */
  worldToScreen(worldX, worldY) {
    return new Vec2(worldX, worldY).sub(this.getRenderPosition())
  }

  /**
   * 将屏幕坐标转换为世界坐标
   * @param {number} screenX - 屏幕X坐标
   * @param {number} screenY - 屏幕Y坐标
   */
  screenToWorld(screenX, screenY) {
    return new Vec2(screenX, screenY).add(this.getRenderPosition())
  }

  /**
   * 获取调试信息
   * @returns {Object}
   */
  getDebugInfo() {
    const targetInfo = this.#target
      ? {
          x: this.#target.r.x,
          y: this.#target.r.y,
          screenX: this.#target.r.x - this.position.x,
          screenY: this.#target.r.y - this.position.y,
        }
      : null

    return {
      position: { x: this.position.x, y: this.position.y },
      viewport: this.viewport,
      target: targetInfo,
      padding: { ...this.#padding },
      lerpFactor: this.#lerpFactor,
      worldBounds: this.#worldBounds ? { ...this.#worldBounds } : null,
    }
  }
}
