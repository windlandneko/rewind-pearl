import { Player } from './Player.js'

/**
 * 玩家幽灵 - 代表过去的自己
 * 会按照录制的输入数据进行移动，并验证状态一致性
 */
export class GhostPlayer extends Player {
  color = 'rgba(100, 100, 255, 0.7)' // 半透明蓝色

  /** @type {import('../InputRecorder.js').InputRecorder} */
  inputRecorder = null

  /** @type {Object[]} 预期的状态历史 */
  expectedStates = []

  /** @type {number} 当前播放时间（毫秒） */
  playbackTime = 0

  /** @type {number} 播放开始时间 */
  playbackStartTime = 0

  /** @type {boolean} 是否正在播放 */
  isPlaying = false

  /** @type {boolean} 状态是否一致 */
  stateConsistent = true

  /** @type {number} 状态检查容差 */
  tolerance = 0.1

  constructor(x, y) {
    super(x, y)
    this.type = 'player_ghost'
  }

  /**
   * 开始播放输入记录
   * @param {import('../InputRecorder.js').InputRecorder} inputRecorder 输入记录器
   * @param {Object[]} expectedStates 预期状态列表
   */
  startPlayback(inputRecorder, expectedStates) {
    this.inputRecorder = inputRecorder
    this.expectedStates = expectedStates || []
    this.playbackTime = 0
    this.playbackStartTime = performance.now()
    this.isPlaying = true
    this.stateConsistent = true

    console.log(
      '[GhostPlayer] 开始播放输入记录，预期状态数量:',
      this.expectedStates.length
    )
  }

  /**
   * 停止播放
   */
  stopPlayback() {
    this.isPlaying = false
    this.inputRecorder = null
    this.expectedStates = []
    console.log('[GhostPlayer] 停止播放输入记录')
  }

  /**
   * 检查是否播放完毕
   * @returns {boolean}
   */
  isPlaybackComplete() {
    if (!this.isPlaying || !this.inputRecorder) return true
    return this.playbackTime >= this.inputRecorder.getTotalDuration()
  }

  update(dt) {
    if (!this.isPlaying || !this.inputRecorder) {
      return
    }

    // 更新播放时间
    this.playbackTime += dt * 1000 // 转换为毫秒

    // 模拟输入
    this.#simulateInputs(dt)

    // 调用父类的更新逻辑
    super.update(dt)

    // 验证状态一致性
    this.#verifyStateConsistency()
  }

  /**
   * 模拟输入事件
   * @param {number} dt 时间增量
   */
  #simulateInputs(dt) {
    if (!this.inputRecorder) return

    // 水平移动输入
    const leftKeys = ['A', 'ArrowLeft']
    const rightKeys = ['D', 'ArrowRight']
    const jumpKeys = ['W', 'Up', 'Space']

    const isLeftActive = this.inputRecorder.isAnyKeyActiveAt(
      this.playbackTime,
      leftKeys
    )
    const isRightActive = this.inputRecorder.isAnyKeyActiveAt(
      this.playbackTime,
      rightKeys
    )
    const isJumpActive = this.inputRecorder.isAnyKeyActiveAt(
      this.playbackTime,
      jumpKeys
    )

    // 模拟水平移动
    if (isLeftActive && !isRightActive) {
      this.onHorizontalInput(-1, dt)
    } else if (isRightActive && !isLeftActive) {
      this.onHorizontalInput(1, dt)
    } else {
      this.onHorizontalInput(0, dt)
    }

    // 模拟跳跃输入
    if (isJumpActive && !this.jumpKeyPressed) {
      this.onJumpInput()
      this.jumpKeyPressed = true
    } else if (!isJumpActive && this.jumpKeyPressed) {
      this.jumpKeyPressed = false
    }
  }

  /**
   * 验证当前状态与预期状态是否一致
   */
  #verifyStateConsistency() {
    if (this.expectedStates.length === 0) return

    // 根据当前播放时间计算应该检查哪个状态
    // 假设状态是按照固定间隔保存的（比如每帧）
    const frameIndex = Math.floor(this.playbackTime / 16.67) // 假设60FPS

    if (frameIndex >= 0 && frameIndex < this.expectedStates.length) {
      const expectedState = this.expectedStates[frameIndex]

      if (expectedState && expectedState.player) {
        const expected = expectedState.player
        const current = this.state

        // 检查位置差异
        const positionDiff = Math.sqrt(
          Math.pow(current.r.x - expected.r.x, 2) +
            Math.pow(current.r.y - expected.r.y, 2)
        )

        // 检查速度差异
        const velocityDiff = Math.sqrt(
          Math.pow(current.v.x - expected.v.x, 2) +
            Math.pow(current.v.y - expected.v.y, 2)
        )

        // 如果差异超过容差，则认为状态不一致
        if (positionDiff > this.tolerance || velocityDiff > this.tolerance) {
          this.stateConsistent = false
          console.warn('[GhostPlayer] 状态不一致！', {
            frameIndex,
            positionDiff: positionDiff.toFixed(3),
            velocityDiff: velocityDiff.toFixed(3),
            expected: {
              x: expected.r.x.toFixed(2),
              y: expected.r.y.toFixed(2),
            },
            current: { x: current.r.x.toFixed(2), y: current.r.y.toFixed(2) },
          })
        }
      }
    }
  }

  render(ctx, cameraScale) {
    if (!this.isPlaying) return

    // 绘制半透明的玩家
    ctx.save()
    ctx.globalAlpha = 0.7

    // 如果状态不一致，用红色高亮显示
    if (!this.stateConsistent) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)'
    } else {
      ctx.fillStyle = this.color
    }

    ctx.fillRect(this.r.x, this.r.y, this.width, this.height)

    // 绘制边框以区分
    ctx.strokeStyle = this.stateConsistent
      ? 'rgba(100, 100, 255, 1)'
      : 'rgba(255, 0, 0, 1)'
    ctx.lineWidth = 1 / cameraScale
    ctx.strokeRect(this.r.x, this.r.y, this.width, this.height)

    ctx.restore()

    // 如果状态不一致，在头上显示警告
    if (!this.stateConsistent) {
      ctx.save()
      ctx.fillStyle = 'red'
      ctx.font = `${16 / cameraScale}px Arial`
      ctx.textAlign = 'center'
      ctx.fillText('!', this.r.x + this.width / 2, this.r.y - 5)
      ctx.restore()
    }
  }
}
