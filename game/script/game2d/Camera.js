import Vec2 from './Vector.js'

/**
 * 2D摄像机类
 *
 * @author windlandneko
 */
export class Camera {
  #padding = {
    left: 200, // 左边距
    right: 200, // 右边距
    top: 150, // 上边距
    bottom: 150, // 下边距
  }
  #target
  #worldBounds
  viewportWidth
  viewportHeight
  #lerpFactor

  position = new Vec2(0, 0)

  // 震动系统
  #shakeIntensity = 0
  #shakeDuration = 0
  #shakeTimer = 0
  #shakeFrequency = 5
  #shakeOffset = new Vec2(0, 0)

  // 持续微震动系统
  #microShakeIntensity = 2
  #microShakeFrequency = 0.3
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
    this.#padding.left = left
    this.#padding.right = right
    this.#padding.top = top
    this.#padding.bottom = bottom
  }

  /**
   * 设置世界边界
   * @param {number} minX - 世界最小X坐标
   * @param {number} minY - 世界最小Y坐标
   * @param {number} maxX - 世界最大X坐标
   * @param {number} maxY - 世界最大Y坐标
   */
  setWorldBounds(minX, minY, maxX, maxY) {
    this.#worldBounds = { minX, minY, maxX, maxY }
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
    const targetX = this.#target.r.x - this.position.x + this.#target.width / 2
    const targetY = this.#target.r.y - this.position.y + this.#target.height / 2

    let deltaX = 0
    let deltaY = 0

    if (targetX < this.#padding.left) {
      // 目标在左边距外，摄像机需要向左移动
      deltaX = targetX - this.#padding.left
    } else if (targetX > this.viewportWidth - this.#padding.right) {
      // 目标在右边距外，摄像机需要向右移动
      deltaX = targetX - (this.viewportWidth - this.#padding.right)
    }

    if (targetY < this.#padding.top) {
      // 目标在上边距外，摄像机需要向上移动
      deltaY = targetY - this.#padding.top
    } else if (targetY > this.viewportHeight - this.#padding.bottom) {
      // 目标在下边距外，摄像机需要向下移动
      deltaY = targetY - (this.viewportHeight - this.#padding.bottom)
    }

    // 新的摄像机位置
    let newX = this.position.x + deltaX
    let newY = this.position.y + deltaY

    // 世界边界限制
    if (this.#worldBounds) {
      newX = Math.max(
        this.#worldBounds.minX,
        Math.min(newX, this.#worldBounds.maxX - this.viewportWidth)
      )
      newY = Math.max(
        this.#worldBounds.minY,
        Math.min(newY, this.#worldBounds.maxY - this.viewportHeight)
      )
    }

    // 应用平滑跟随或直接设置位置
    if (deltaX !== 0 || deltaY !== 0) {
      this.position.x += (newX - this.position.x) * this.#lerpFactor
      this.position.y += (newY - this.position.y) * this.#lerpFactor
    }

    // todo: soft border and hard border
  }

  /**
   * 立即移动摄像机到指定位置
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  setPosition(x, y) {
    this.position.x = x
    this.position.y = y

    // 应用世界边界限制
    if (this.#worldBounds) {
      this.position.x = Math.max(
        this.#worldBounds.minX,
        Math.min(this.position.x, this.#worldBounds.maxX - this.viewportWidth)
      )
      this.position.y = Math.max(
        this.#worldBounds.minY,
        Math.min(this.position.y, this.#worldBounds.maxY - this.viewportHeight)
      )
    }
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
   * @returns {Object} 包含x和y的位置对象
   */
  getRenderPosition() {
    return {
      x: this.position.x + this.#shakeOffset.x + this.#microShakeOffset.x,
      y: this.position.y + this.#shakeOffset.y + this.#microShakeOffset.y,
    }
  }

  /**
   * 将世界坐标转换为屏幕坐标
   * @param {number} worldX - 世界X坐标
   * @param {number} worldY - 世界Y坐标
   * @returns {{x: number, y: number}}
   */
  worldToScreen(worldX, worldY) {
    const renderPos = this.getRenderPosition()
    return {
      x: worldX - renderPos.x,
      y: worldY - renderPos.y,
    }
  }

  /**
   * 将屏幕坐标转换为世界坐标
   * @param {number} screenX - 屏幕X坐标
   * @param {number} screenY - 屏幕Y坐标
   * @returns {{x: number, y: number}}
   */
  screenToWorld(screenX, screenY) {
    const renderPos = this.getRenderPosition()
    return {
      x: screenX + renderPos.x,
      y: screenY + renderPos.y,
    }
  }

  /**
   * 获取调试信息
   * @returns {Object}
   */
  getDebugInfo() {
    const targetInfo = this.target
      ? {
          x: this.target.r.x,
          y: this.target.r.y,
          screenX: this.target.r.x - this.position.x,
          screenY: this.target.r.y - this.position.y,
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
