import { AABBObject } from './AABBObject.js'
import Vec2 from '../Vector.js'

export class Player extends AABBObject {
  color = 'blue'

  speed = 200 // 移动速度 (像素/秒)
  jumpSpeed = 560 // 地面跳跃速度 (像素/秒)
  airJumpSpeed = 400 // N段跳速度，一般稍小于地面跳跃
  airResistance = 0.0 // 空气阻力系数 (减小阻力)
  groundFriction = 2000 // 地面摩擦力系数 (像素/秒²)
  invincibleTime = 1 // 无敌时间 (秒)

  onGround = false
  health = 3
  score = 0
  damageTimer = 0

  // 狼跳机制
  coyote = 0.15 // 土狼时间：离开地面后还能跳跃的时间(秒)
  coyoteTimer = 0 // 计时器
  jumpBuffer = 0.1 // 跳跃缓冲：提前按跳跃键的缓冲时间(秒)
  jumpBufferTimer = 0 // 计时器
  airJumps = 0 // N段跳次数
  airJumpsCount = 0 // 计数器

  previousOnGround = false
  previousPosition = null

  constructor(x, y) {
    super(x, y, 30, 50)
    this.previousPosition = new Vec2(x, y)
  }

  update(dt) {
    this.previousPosition.x = this.r.x
    this.previousPosition.y = this.r.y

    this.updateJump(dt)

    const acceleration = new Vec2()

    // 重力
    acceleration.y += this.gravity

    // 空气阻力
    if (this.v.len() > 0) {
      const dragMagnitude = this.airResistance * this.v.len() ** 2
      const airDrag = this.v.norm().mul(-dragMagnitude)
      acceleration.addTo(airDrag)
    }

    // 地面摩擦力
    if (this.onGround && Math.abs(this.v.x) > 0) {
      const frictionForce = Math.sign(this.v.x) * -this.groundFriction
      acceleration.x += frictionForce

      // 防止摩擦力使速度反向
      if (Math.sign(this.v.x + acceleration.x * dt) !== Math.sign(this.v.x)) {
        this.v.x = 0
        acceleration.x = 0
      }
    }

    // 更新速度
    this.v.addTo(acceleration.mul(dt))

    // 更新位置
    this.r.addTo(this.v.mul(dt))

    // 更新无敌时间
    this.damageTimer = Math.max(0, this.damageTimer - dt)
  }

  moveLeft() {
    const targetVelocity = -this.speed
    if (this.onGround) {
      this.v.x = Math.max(this.v.x - this.speed * 0.08, targetVelocity)
    } else {
      // 在空中时移动较慢
      this.v.x = Math.max(this.v.x - this.speed * 0.04, targetVelocity * 1.5)
    }
  }

  moveRight() {
    const targetVelocity = this.speed
    if (this.onGround) {
      this.v.x = Math.min(this.v.x + this.speed * 0.08, targetVelocity)
    } else {
      // 在空中时移动较慢
      this.v.x = Math.min(this.v.x + this.speed * 0.04, targetVelocity * 1.5)
    }
  }

  stopMoving() {
    // 在地面时不需要做任何事，摩擦力会处理减速
    // 在空中时稍微减少水平速度
    if (!this.onGround) {
      this.v.x *= 0.98
    }
  }

  /**
   * 更新土狼时间
   */
  updateJump(dt) {
    if (this.onGround) {
      this.coyoteTimer = this.coyote
      if (!this.previousOnGround) {
        this.airJumpsCount = 0
      }
    } else if (this.previousOnGround) {
      // 刚离开地面，开始土狼时间计时
      this.coyoteTimer = this.coyote
    } else {
      // 在空中，减少土狼时间
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt)
    }

    this.previousOnGround = this.onGround

    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt

      // 如果在缓冲时间内落地，立即跳跃
      if (this.onGround && this.jumpBufferTimer > 0) {
        this.#jump(this.jumpSpeed)
        this.jumpBufferTimer = 0
      }
    }
  }

  /**
   * 尝试跳跃的输入处理方法
   */
  tryJump() {
    // 1. 地面跳跃
    if (this.onGround) {
      this.#jump(this.jumpSpeed)
      return true
    }

    // 2. 土狼时间跳跃
    if (this.coyoteTimer > 0) {
      this.#jump(this.jumpSpeed)
      this.coyoteTimer = 0 // 使用后立即清零
      return true
    }

    // 3. 空中二段跳
    if (this.airJumpsCount < this.airJumps) {
      this.#jump(this.airJumpSpeed)
      this.airJumpsCount++
      return true
    }

    // 4. 无法跳跃时，激活跳跃缓冲
    this.jumpBufferTimer = this.jumpBuffer
    return false
  }

  #jump(speed) {
    this.v.y = -speed
  }

  handlePlatformCollision(platform) {
    if (!this.checkCollision(platform)) return

    // 计算重叠区域
    const overlapLeft = this.r.x + this.width - platform.r.x
    const overlapRight = platform.r.x + platform.width - this.r.x
    const overlapTop = this.r.y + this.height - platform.r.y
    const overlapBottom = platform.r.y + platform.height - this.r.y

    // 找到最小的重叠方向
    const minOverlap = Math.min(
      overlapLeft,
      overlapRight,
      overlapTop,
      overlapBottom
    )

    // 根据重叠方向调整位置和速度
    if (minOverlap === overlapTop && this.v.y > 0) {
      // 从上方碰撞（着地）
      this.r.y = platform.r.y - this.height
      this.v.y = 0
      this.onGround = true
    } else if (minOverlap === overlapBottom && this.v.y < 0) {
      // 从下方碰撞（撞头）
      this.r.y = platform.r.y + platform.height
      this.v.y = 0
    } else if (minOverlap === overlapLeft && this.v.x > 0) {
      // 从左侧碰撞
      this.r.x = platform.r.x - this.width
      this.v.x = 0
    } else if (minOverlap === overlapRight && this.v.x < 0) {
      // 从右侧碰撞
      this.r.x = platform.r.x + platform.width
      this.v.x = 0
    }
  }

  checkGroundContact(platforms) {
    // 向下延伸1像素检查是否接触地面
    const groundCheckBox = {
      r: { x: this.r.x + 2, y: this.r.y + this.height },
      width: this.width - 4,
      height: 2,
    }

    for (const platform of platforms) {
      if (this.boxCollision(groundCheckBox, platform)) {
        return true
      }
    }
    return false
  }

  // 通用的盒子碰撞检测
  boxCollision(box1, box2) {
    return (
      box1.r.x < box2.r.x + box2.width &&
      box1.r.x + box1.width > box2.r.x &&
      box1.r.y < box2.r.y + box2.height &&
      box1.r.y + box1.height > box2.r.y
    )
  }

  onPlatformCollision(platform) {
    this.handlePlatformCollision(platform)
  }

  takeDamage() {
    if (this.damageTimer <= 0) {
      this.health--
      this.damageTimer = this.invincibleTime
    }
  }

  // 处理世界边界碰撞
  handleWorldBounds(worldWidth, worldHeight) {
    // 左右边界
    if (this.r.x < 0) {
      this.r.x = 0
      this.v.x = 0
    } else if (this.r.x + this.width > worldWidth) {
      this.r.x = worldWidth - this.width
      this.v.x = 0
    }

    // 上边界
    if (this.r.y < 0) {
      this.r.y = 0
      this.v.y = 0
    }

    // 下边界（死亡）
    if (this.r.y > worldHeight) {
      this.takeDamage()
      // 重置到安全位置
      this.r.x = 100
      this.r.y = 400
      this.v.x = 0
      this.v.y = 0
    }
  }

  render(ctx) {
    const x = Math.round(this.r.x)
    const y = Math.round(this.r.y)

    // ctx.fillStyle = '#2196F3'
    // ctx.fillRect(x, y, 1, 1)
    // ctx.fillStyle = '#f3ec21ff'
    // ctx.fillRect(x, 300 - this.v.x / 10, 1, 1)
    // ctx.restore()
    // return

    // 受伤时闪烁效果
    if (this.damageTimer > 0 && Math.floor(this.damageTimer / 0.2) % 2 === 0) {
      ctx.fillStyle = 'rgba(33, 150, 243, 0.2)'
    } else {
      ctx.fillStyle = 'rgba(33, 150, 243, 1)'
    }
    ctx.fillRect(x, y, this.width, this.height)
    if (this.onGround) {
      ctx.fillStyle = '#444'
      ctx.fillRect(x + 2, y + this.height - 6, this.width - 4, 3)
    }

    // 显示速度向量（调试用）
    if (this.v.len() > 0) {
      ctx.strokeStyle = 'yellow'
      ctx.lineWidth = 2
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
    ctx.font = '9px FiraCode, monospace'
    const debugY = y - 60
    ctx.fillText(
      `pos: (${this.r.x.toFixed(1)}, ${this.r.y.toFixed(1)})`,
      x,
      debugY
    )
    ctx.fillText(
      `vel: (${this.v.x.toFixed(1)}, ${this.v.y.toFixed(1)})`,
      x,
      debugY + 10
    )
    ctx.fillText(`speed: ${this.v.len().toFixed(1)}`, x, debugY + 20)
    ctx.fillText(
      `jumpBuffer: ${this.jumpBufferTimer.toFixed(2)}s`,
      x,
      debugY + 30
    )

    // 可视化土狼时间
    if (this.coyoteTimer > 0 && !this.onGround) {
      ctx.fillStyle = 'orange'
      const coyoteHeight = 3
      const coyoteWidth = (this.coyoteTimer / this.coyote) * this.width
      ctx.fillRect(x, y + this.height + 2, coyoteWidth, coyoteHeight)
    }

    // 可视化跳跃缓冲
    if (this.jumpBufferTimer > 0) {
      ctx.fillStyle = 'cyan'
      const bufferHeight = 3
      const bufferWidth = (this.jumpBufferTimer / this.jumpBuffer) * this.width
      ctx.fillRect(x, y + this.height + 6, bufferWidth, bufferHeight)
    }

    // 可视化空中跳跃次数
    for (let i = 0; i < this.airJumps; i++) {
      ctx.fillStyle = i < this.airJumpsCount ? 'lightblue' : '#222'
      ctx.fillRect(x + i * 10, y - 10, 8, 8)
    }
  }
}
