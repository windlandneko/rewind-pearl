import { BaseObject } from './BaseObject.js'
import Vec2 from '../Vector.js'
import AnimationManager from '../Animation.js'
import SpriteAnimation from '../Sprite.js'
import Asset from '../../Asset.js'
import Keyboard from '../../Keyboard.js'
import { MAX_SNAPSHOTS_COUNT } from '../GameConfig.js'
import SoundManager from '../../SoundManager.js'

export const InputEnum = {
  INTERACT: 1 << 0,
  JUMP_DOWN: 1 << 1,
  JUMP_UP: 1 << 2,
  WALK_LEFT: 1 << 3,
  WALK_RIGHT: 1 << 4,
  WALK_DOWN: 1 << 5,
}

export class Player extends BaseObject {
  color = 'blue'

  gravity = 520 // 重力加速度
  moveSpeed = 56 // 移动速度 (像素/秒)
  jumpSpeed = 120 // 跳跃速度 (像素/秒)
  jumpKeyPressed = false
  jumpTimer = 0
  maxJumpTime = 0.16 // 跳跃增益时间（秒）

  /** @deprecated */
  invincibleTime = 4 // 无敌时间 (秒)

  onGround = false
  walkDown = false
  maxHealth = 1
  health = 1
  score = 0

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
    super(x, y, 7, 15)
    this.previousPosition = new Vec2(x, y)
    this.groundCheckBox = {
      r: this.r.add(1, this.height),
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
    }
  }

  async processInputEvents(dt, game) {
    // 外部输入事件
    const keyLeft = Keyboard.anyActive('A', 'ArrowLeft')
    const keyRight = Keyboard.anyActive('D', 'ArrowRight')
    const keyDown = Keyboard.anyActive('S', 'ArrowDown')
    const keyJump = Keyboard.anyActive('Space')
    if (keyLeft && !keyRight) {
      this.inputState |= InputEnum.WALK_LEFT
    } else if (keyRight && !keyLeft) {
      this.inputState |= InputEnum.WALK_RIGHT
    }
    if (keyDown) this.inputState |= InputEnum.WALK_DOWN
    if (!keyJump && this.jumpKeyPressed) this.inputState |= InputEnum.JUMP_UP

    const state = this.inputState
    if (state & InputEnum.INTERACT) {
      for (const obj of game.renderGroups.interactables) {
        if (await obj.handleKeyInteraction?.(this, game)) break
      }
    }

    if (state & InputEnum.JUMP_DOWN) this.onJumpInput()
    if (state & InputEnum.JUMP_UP) {
      this.v.y = Math.min(this.v.y * 0.8, 0)
      this.jumpKeyPressed = false
    }

    this.walkDown = state & InputEnum.WALK_DOWN

    if (state & InputEnum.WALK_LEFT) this.onHorizontalInput(-1, dt)
    else if (state & InputEnum.WALK_RIGHT) this.onHorizontalInput(1, dt)
    else this.onHorizontalInput(0, dt)
  }

  // 死亡动画相关
  isExploding = false
  explodeAnim = null
  explodeAnimTime = 0

  update(dt, game) {
    // 死亡动画播放时，暂停输入和物理，仅更新动画
    if (this.isExploding) {
      this.explodeAnim.update(dt)
      this.explodeAnimTime += dt
      if (this.explodeAnim.isComplete() && this.explodeAnimTime > 2) {
        // 动画播放完毕，重生
        game.tick = 0
        game.maxTick = 0
        game.history = new Map()
        game.ghostPlayers = []
        game.globalState.timeTravelUsed = 0

        this.removed = false
        this.isExploding = false
        this.health = this.maxHealth
        this.r.x = game.levelData.spawnpoint.x
        this.r.y = game.levelData.spawnpoint.y
        game.camera.target = game.player
      }
      return
    }
    if (this.health <= 0) {
      // 死亡，播放爆炸动画并暂停游戏
      if (!this.isExploding) {
        this.removed = true
        this.isExploding = true

        game.sound.play('die', {
          volume: 0.3,
        })

        // 触发相机震动效果
        game.camera.shake(6, 0.4, 100)

        // 加载爆炸动画
        const img = Asset.get('sprite/explode')
        this.explodeAnim = new SpriteAnimation(
          img,
          79,
          112,
          112,
          1000 / 60,
          false
        )
        this.explodeAnimTime = 0
      }
      return
    }

    this.processInputEvents(dt, game)

    this.previousPosition = this.r.clone()

    this.#updateJump(dt)

    const acceleration = new Vec2()

    // 重力
    acceleration.y += this.gravity

    // 速度
    this.v.addTo(acceleration.mul(dt))

    // 位移
    this.r.addTo(this.v.mul(dt))

    // 更新地面检测框位置
    this.groundCheckBox.r = this.r.add(1, this.height)

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
    if (this.v.y >= 0) this.jumpKeyPressed = false
    if (this.jumpKeyPressed) {
      this.jumpTimer += dt
      if (this.jumpTimer < this.maxJumpTime && this.v.y < 0)
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
    SoundManager.play('jump')
  }

  /**
   * 处理水平移动
   * @param {number} direction -1为左，1为右，0为停止
   * @param {number} dt 时间增量
   */
  onHorizontalInput(direction, dt) {
    const acceleration = this.onGround ? 14 : 10
    const targetVelocity = this.onGround ? this.moveSpeed : this.moveSpeed * 1.5

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
      if (this.onGround) this.v.x *= Math.pow(0.1, 20 * dt)
      else this.v.x *= Math.pow(0.1, 1.0 * dt)
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
    this.health--
  }

  render(ctx, { scale, debug }) {
    const x = Math.round(this.r.x * scale) / scale
    const y = Math.round(this.r.y * scale) / scale

    // 死亡爆炸动画优先渲染
    if (this.isExploding && this.explodeAnim) {
      this.explodeAnim.render(
        ctx,
        x + (this.width - 32) / 2,
        y + (this.height - 32) / 2,
        32,
        32
      )
      return
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

    if (debug) {
      ctx.strokeStyle = '#00ff00ff'
      ctx.strokeRect(this.r.x, this.r.y, this.width, this.height)
      ctx.strokeStyle = 'red'
      ctx.fillStyle = 'red'
      if (this.onGround)
        ctx.fillRect(
          this.groundCheckBox.r.x,
          this.groundCheckBox.r.y,
          this.groundCheckBox.width,
          this.groundCheckBox.height
        )
      else
        ctx.strokeRect(
          this.groundCheckBox.r.x,
          this.groundCheckBox.r.y,
          this.groundCheckBox.width,
          this.groundCheckBox.height
        )

      // 绘制速度箭头
      ctx.save()
      ctx.strokeStyle = '#00aaff'
      ctx.fillStyle = '#00aaff'
      ctx.beginPath()
      ctx.moveTo(this.r.x + this.width / 2, this.r.y + this.height / 2)
      ctx.lineTo(
        this.r.x + this.width / 2 + this.v.x * 0.2,
        this.r.y + this.height / 2 + this.v.y * 0.2
      )
      ctx.stroke()

      // 箭头头部
      const arrowEndX = this.r.x + this.width / 2 + this.v.x * 0.2
      const arrowEndY = this.r.y + this.height / 2 + this.v.y * 0.2
      const angle = Math.atan2(this.v.y, this.v.x)
      const arrowSize = 3
      ctx.beginPath()
      ctx.moveTo(arrowEndX, arrowEndY)
      ctx.lineTo(
        arrowEndX - arrowSize * Math.cos(angle - Math.PI / 6),
        arrowEndY - arrowSize * Math.sin(angle - Math.PI / 6)
      )
      ctx.lineTo(
        arrowEndX - arrowSize * Math.cos(angle + Math.PI / 6),
        arrowEndY - arrowSize * Math.sin(angle + Math.PI / 6)
      )
      ctx.lineTo(arrowEndX, arrowEndY)
      ctx.fill()
      ctx.restore()
    }
  }

  get state() {
    return {
      ...super.state,

      P: [
        this.gravity,
        this.moveSpeed,
        this.jumpSpeed,
        this.jumpKeyPressed,
        this.jumpTimer,
        this.maxJumpTime,
        this.invincibleTime,
        this.onGround,
        this.walkDown,
        this.maxHealth,
        this.health,
        this.score,
        this.coyote,
        this.coyoteTimer,
        this.jumpBuffer,
        this.jumpBufferTimer,
        this.maxAirJumps,
        this.airJumpSpeed,
        this.airJumpsCount,
        this.previousOnGround,
        this.previousPosition.x,
        this.previousPosition.y,
        this.inputState,
        // 动画状态
        this.animationManager?.getCurrentAnimationName() || null,
      ],
    }
  }

  set state(state) {
    super.state = state

    let currentAnimationName
    ;[
      this.gravity,
      this.moveSpeed,
      this.jumpSpeed,
      this.jumpKeyPressed,
      this.jumpTimer,
      this.maxJumpTime,
      this.invincibleTime,
      this.onGround,
      this.walkDown,
      this.maxHealth,
      this.health,
      this.score,
      this.coyote,
      this.coyoteTimer,
      this.jumpBuffer,
      this.jumpBufferTimer,
      this.maxAirJumps,
      this.airJumpSpeed,
      this.airJumpsCount,
      this.previousOnGround,
      this.previousPositionX,
      this.previousPositionY,
      this.inputState,
      currentAnimationName,
    ] = state.P

    // 动画状态
    if (currentAnimationName && this.animationManager) {
      this.animationManager.playAnimation(currentAnimationName)
    }
  }
}
