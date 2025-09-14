import { BaseObject } from './BaseObject.js'
import Vec2 from '../Vector.js'
import AnimationManager from '../Animation.js'
import SpriteAnimation from '../Sprite.js'
import Asset from '../../Asset.js'
import Keyboard from '../../Keyboard.js'
import { MAX_SNAPSHOTS_COUNT } from '../GameConfig.js'

export const InputEnum = {
  INTERACT: 1 << 0,
  JUMP_DOWN: 1 << 1,
  JUMP_UP: 1 << 2,
  WALK_LEFT: 1 << 3,
  WALK_RIGHT: 1 << 4,
}

export class Player extends BaseObject {
  color = 'blue'

  gravity = 500 // 重力加速度
  moveSpeed = 72 // 移动速度 (像素/秒)
  jumpSpeed = 114.514 // 跳跃速度 (像素/秒)
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
  maxAirJumps = 0 // 最大空中跳跃次数
  airJumpSpeed = 80 // N段跳速度，一般稍小于跳跃速度
  airJumpsCount = 0 // 已使用的空中跳跃次数

  previousOnGround = false
  previousPosition = null

  inputState = 0
  stateHistory = new Map()
  lifetimeBegin = 0
  lifetimeEnd = null

  animationManager = new AnimationManager()

  constructor(x, y) {
    super(x, y, 10, 16)
    this.previousPosition = new Vec2(x, y)
    this.groundCheckBox = {
      r: { x: this.r.x + 1, y: this.r.y + this.height },
      width: this.width - 2,
      height: 1,
    }

    this.animationManager.addAnimation(
      'jump_left',
      new SpriteAnimation(Asset.get('sprite/player/jump_left'), 4, 32, 32)
    )
    this.animationManager.addAnimation(
      'jump_right',
      new SpriteAnimation(Asset.get('sprite/player/jump_right'), 4, 32, 32)
    )
    this.animationManager.addAnimation(
      'walk_left',
      new SpriteAnimation(Asset.get('sprite/player/walk_left'), 6, 32, 32)
    )
    this.animationManager.addAnimation(
      'walk_right',
      new SpriteAnimation(Asset.get('sprite/player/walk_right'), 6, 32, 32)
    )
  }

  /**
   * 更新动画状态
   */
  updateAnimation() {
    const direction = this.v.x > 0 ? 1 : -1
    if (!this.onGround) {
      // todo: jump animation
      this.animationManager.playAnimation(
        direction > 0 ? 'jump_right' : 'jump_left'
      )
    } else if (Math.abs(this.v.x) > 5) {
      this.animationManager.playAnimation(
        this.v.x > 0 ? 'walk_right' : 'walk_left'
      )
    } else {
      this.animationManager.playAnimation(
        direction > 0 ? 'walk_right' : 'walk_left',
        true
      )
    }
  }

  async processInputEvents(dt, game) {
    // 外部输入事件
    const keyLeft = Keyboard.anyActive(['A', 'ArrowLeft'])
    const keyRight = Keyboard.anyActive(['D', 'ArrowRight'])
    if (keyLeft && !keyRight) {
      this.inputState |= InputEnum.WALK_LEFT
    } else if (keyRight && !keyLeft) {
      this.inputState |= InputEnum.WALK_RIGHT
    }

    const state = this.inputState
    if (state & InputEnum.INTERACT) {
      for (const entity of game.renderGroups.interactables) {
        if (await entity.handleKeyInteraction?.(this, game)) break
      }
    }

    if (state & InputEnum.JUMP_DOWN) this.onJumpInput()
    if (state & InputEnum.JUMP_UP) this.jumpKeyPressed = false

    if (state & InputEnum.WALK_LEFT) this.onHorizontalInput(-1, dt)
    else if (state & InputEnum.WALK_RIGHT) this.onHorizontalInput(1, dt)
    else this.onHorizontalInput(0, dt)
  }

  update(dt, game) {
    this.processInputEvents(dt, game)

    this.previousPosition.x = this.r.x
    this.previousPosition.y = this.r.y

    this.#updateJump(dt)

    const acceleration = new Vec2()

    // 重力
    acceleration.y += this.gravity

    // 速度
    this.v.addTo(acceleration.mul(dt))

    // 位移
    this.r.addTo(this.v.mul(dt))

    // 更新地面检测框位置
    this.groundCheckBox.r.x = this.r.x + 1
    this.groundCheckBox.r.y = this.r.y + this.height

    // 无敌时间
    this.damageTimer = Math.max(0, this.damageTimer - dt)

    // 动画
    this.updateAnimation()
    this.animationManager.update(dt)

    this.stateHistory.set(game.tick, this.state)
    this.stateHistory.delete(game.tick - MAX_SNAPSHOTS_COUNT)

    this.inputState = 0
  }

  /**
   * 更新跳跃相关逻辑
   */
  #updateJump(dt) {
    // 更新跳跃计时器
    if (this.jumpKeyPressed) {
      // 超过最大跳跃时间后停止变高跳跃
      if (this.jumpTimer >= this.maxJumpTime || this.v.y >= 0) {
        this.jumpKeyPressed = false
      }

      this.jumpTimer += dt
      this.v.y = Math.min(this.v.y, -this.currentJumpSpeed)
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
    this.currentJumpSpeed = speed
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
    const acceleration = this.onGround ? 20 : 8
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
      const decay = this.onGround ? 11 : 0.8
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

  render(ctx, scale) {
    const x = Math.round(this.r.x * scale) / scale
    const y = Math.round(this.r.y * scale) / scale

    // 受伤时闪烁效果
    if (this.damageTimer > 0 && Math.floor(this.damageTimer / 0.15) % 2 === 0) {
      ctx.globalAlpha = 0.5
    } else {
      ctx.globalAlpha = 1.0
    }

    const spriteWidth = 32
    const spriteHeight = 32
    const spriteX = x + (this.width - spriteWidth) / 2
    const spriteY = y + this.height - spriteHeight

    this.animationManager.render(
      ctx,
      spriteX,
      spriteY,
      spriteWidth,
      spriteHeight
    )
    ctx.globalAlpha = 1.0
  }

  get state() {
    return {
      ...super.state,
      gravity: this.gravity,
      moveSpeed: this.moveSpeed,
      jumpSpeed: this.jumpSpeed,
      jumpKeyPressed: this.jumpKeyPressed,
      jumpTimer: this.jumpTimer,
      maxJumpTime: this.maxJumpTime,

      invincibleTime: this.invincibleTime,

      onGround: this.onGround,
      health: this.health,
      score: this.score,
      damageTimer: this.damageTimer,

      coyote: this.coyote,
      coyoteTimer: this.coyoteTimer,

      jumpBuffer: this.jumpBuffer,
      jumpBufferTimer: this.jumpBufferTimer,

      maxAirJumps: this.maxAirJumps,
      airJumpSpeed: this.airJumpSpeed,
      airJumpsCount: this.airJumpsCount,

      previousOnGround: this.previousOnGround,
      previousPositionX: this.previousPosition.x,
      previousPositionY: this.previousPosition.y,

      inputState: this.inputState,

      // 动画状态
      currentAnimationName:
        this.animationManager?.getCurrentAnimationName() || null,
    }
  }

  set state(state) {
    super.state = state

    this.gravity = state.gravity
    this.moveSpeed = state.moveSpeed
    this.jumpSpeed = state.jumpSpeed
    this.jumpKeyPressed = state.jumpKeyPressed
    this.jumpTimer = state.jumpTimer
    this.maxJumpTime = state.maxJumpTime

    this.invincibleTime = state.invincibleTime

    this.onGround = state.onGround
    this.health = state.health
    this.score = state.score
    this.damageTimer = state.damageTimer

    this.coyote = state.coyote
    this.coyoteTimer = state.coyoteTimer

    this.jumpBuffer = state.jumpBuffer
    this.jumpBufferTimer = state.jumpBufferTimer

    this.maxAirJumps = state.maxAirJumps
    this.airJumpSpeed = state.airJumpSpeed
    this.airJumpsCount = state.airJumpsCount

    this.previousOnGround = state.previousOnGround
    this.previousPositionX = state.previousPositionX
    this.previousPositionY = state.previousPositionY

    this.inputState = state.inputState

    // 动画状态
    if (state.currentAnimationName && this.animationManager) {
      this.animationManager.playAnimation(state.currentAnimationName)
    }
  }
}
