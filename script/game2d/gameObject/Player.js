import { AABBObject } from './AABBObject.js'
import Vec2 from '../Vector.js'
import stateMachine from '../../stateMachine.js'

export class Player extends AABBObject {
  color = 'blue'

  gravity = 500 // 重力加速度
  moveSpeed = 72 // 移动速度 (像素/秒)
  jumpSpeed = 100 // 跳跃速度 (像素/秒)
  jumpKeyPressed = false
  jumpTimer = 0
  maxJumpTime = 0.2 // 跳跃增益时间（秒）

  invincibleTime = 1 // 无敌时间 (秒)

  onGround = false
  health = 5
  score = 0
  damageTimer = 0

  // 狼跳
  coyote = 0.15 // 土狼时间：离开地面后还能跳跃的时间(秒)
  coyoteTimer = 0 // 计时器

  // 跳跃缓冲
  jumpBuffer = 0.1 // 跳跃缓冲：提前按跳跃键的缓冲时间(秒)
  jumpBufferTimer = 0 // 计时器

  // N段跳
  maxAirJumps = 1 // 最大空中跳跃次数
  airJumpSpeed = 80 // N段跳速度，一般稍小于跳跃速度
  airJumpsCount = 0 // 已使用的空中跳跃次数

  previousOnGround = false
  previousPosition = null

  constructor(x, y) {
    super(x, y, 10, 16)
    this.previousPosition = new Vec2(x, y)
    this.groundCheckBox = {
      r: { x: this.r.x + 1, y: this.r.y + this.height },
      width: this.width - 2,
      height: 1,
    }
  }

  update(dt) {
    this.previousPosition.x = this.r.x
    this.previousPosition.y = this.r.y

    this.#updateJump(dt)

    const acceleration = new Vec2()

    // 重力
    acceleration.y += this.gravity

    // 更新速度
    this.v.addTo(acceleration.mul(dt))

    // 更新位置
    this.r.addTo(this.v.mul(dt))

    // 更新无敌时间
    this.damageTimer = Math.max(0, this.damageTimer - dt)
  }

  /**
   * 更新跳跃相关逻辑
   */
  #updateJump(dt) {
    // 更新跳跃计时器
    if (this.jumpKeyPressed) {
      this.jumpTimer += dt
      this.v.y = Math.min(this.v.y, -this.currentJumpSpeed)

      // 超过最大跳跃时间后停止变高跳跃
      if (this.jumpTimer >= this.maxJumpTime) {
        this.jumpKeyPressed = false
      }
    }

    // 落地，重置N段跳
    if (this.onGround && !this.previousOnGround) {
      this.airJumpsCount = 0
    }
    // 下落而且并非起跳，开始土狼时间计时
    if (!this.jumpKeyPressed && !this.onGround && this.previousOnGround) {
      this.coyoteTimer = this.coyote
    }
    if (!this.onGround) {
      // 在空中，减少土狼时间
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt)
    }

    this.previousOnGround = this.onGround

    // 跳跃缓冲逻辑
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt

      // 如果在缓冲时间内落地，立即跳跃
      if (this.onGround && this.jumpBufferTimer > 0) {
        this.#performJump(this.jumpSpeed)
        this.jumpBufferTimer = 0
      }
    }
  }

  #performJump(speed) {
    this.currentJumpSpeed = speed + Math.abs(this.v.x) * 0.2
    this.v.y = Math.min(this.v.y, -speed)
    this.jumpKeyPressed = true
    this.jumpTimer = 0
  }

  /**
   * 处理水平移动
   * @param {number} direction -1为左，1为右，0为停止
   * @param {number} dt 时间增量
   */
  onHorizontalInput(direction, dt) {
    const acceleration = this.onGround ? 20 : 10
    const targetVelocity = this.onGround ? this.moveSpeed : this.moveSpeed * 1.3

    // 祥，移动
    if (direction > 0) {
      this.v.x = Math.min(
        this.v.x + this.moveSpeed * acceleration * dt,
        targetVelocity
      )
    } else if (direction < 0) {
      this.v.x = Math.max(
        this.v.x - this.moveSpeed * acceleration * dt,
        -targetVelocity
      )
    } else {
      // 停止移动
      const decay = this.onGround ? 10 : 0.4
      this.v.x *= Math.pow(0.1, decay * dt)
    }
  }

  /**
   * 尝试跳跃的输入处理方法
   */
  onJumpInput() {
    // 1. 地面跳跃
    if (this.onGround) {
      this.#performJump(this.jumpSpeed)
      return true
    }

    // 2. 土狼时间跳跃
    if (this.coyoteTimer > 0) {
      this.#performJump(this.jumpSpeed)
      this.coyoteTimer = 0 // 使用后立即清零
      return true
    }

    // 3. 空中二段跳
    if (this.airJumpsCount < this.maxAirJumps) {
      this.#performJump(this.airJumpSpeed)
      this.airJumpsCount++
      return true
    }

    // 4. 无法跳跃时，激活跳跃缓冲
    this.jumpBufferTimer = this.jumpBuffer
    return false
  }

  onDamage() {
    if (this.damageTimer <= 0) {
      this.health--
      this.damageTimer = this.invincibleTime
    }
  }

  checkGroundContact(platforms) {
    const groundCheckBox = {
      r: { x: this.r.x + 1, y: this.r.y + this.height },
      width: this.width - 2,
      height: 1,
    }

    for (const platform of platforms) {
      if (platform.checkCollision(groundCheckBox)) return true
    }
    return false
  }

  render(ctx, scale) {
    const x = Math.round(this.r.x * scale) / scale
    const y = Math.round(this.r.y * scale) / scale

    // 受伤时闪烁效果
    if (this.damageTimer > 0 && Math.floor(this.damageTimer / 0.2) % 2 === 0) {
      ctx.fillStyle = 'rgba(33, 150, 243, 0.2)'
    } else {
      ctx.fillStyle = 'rgba(33, 150, 243, 1)'
    }
    ctx.fillRect(x, y, this.width, this.height)
    if (this.onGround) {
      ctx.fillStyle = '#444'
      ctx.fillRect(x + 1, y + this.height - 2, this.width - 2, 1)
    }

    // 显示速度向量（调试用）
    if (this.v.len() > 0) {
      ctx.strokeStyle = 'yellow'
      ctx.lineWidth = 2 / scale
      ctx.beginPath()
      ctx.moveTo(x + this.width / 2, y + this.height / 2)
      ctx.lineTo(
        x + this.width / 2 + this.v.x * 0.04,
        y + this.height / 2 + this.v.y * 0.04
      )
      ctx.stroke()
    }

    // 调试信息
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = `${24 / scale}px FiraCode, monospace`
    const debugY = y - 100 / scale
    ctx.fillText(
      `pos: (${this.r.x.toFixed(1)}, ${this.r.y.toFixed(1)})`,
      x,
      debugY
    )
    ctx.fillText(
      `vel: (${this.v.x.toFixed(1)}, ${this.v.y.toFixed(1)})`,
      x,
      debugY + 25 / scale
    )
    ctx.fillText(`speed: ${this.v.len().toFixed(1)}`, x, debugY + 50 / scale)
    ctx.fillText(
      `jumpBuffer: ${this.jumpBufferTimer.toFixed(2)}s`,
      x,
      debugY + 75 / scale
    )

    // 可视化土狼时间
    if (this.coyoteTimer > 0 && !this.onGround) {
      ctx.fillStyle = 'orange'
      const coyoteHeight = 3 / scale
      const coyoteWidth = (this.coyoteTimer / this.coyote) * this.width
      ctx.fillRect(x, y + this.height + 2, coyoteWidth, coyoteHeight)
    }

    // 可视化跳跃缓冲
    if (this.jumpBufferTimer > 0) {
      ctx.fillStyle = 'cyan'
      const bufferHeight = 3 / scale
      const bufferWidth = (this.jumpBufferTimer / this.jumpBuffer) * this.width
      ctx.fillRect(x, y + this.height + 6, bufferWidth, bufferHeight)
    }

    // 可视化空中跳跃次数
    for (let i = 0; i < this.maxAirJumps; i++) {
      ctx.fillStyle = i < this.airJumpsCount ? 'lightblue' : '#222'
      ctx.fillRect(x + i * 10, y - 10, 8 / scale, 8 / scale)
    }
  }
}
