import TimeTravel from '../TimeTravel.js'
import { Player, InputEnum } from './Player.js'

/**
 * 玩家幽灵 - 代表过去的自己
 * 会按照录制的输入数据进行移动，并验证状态一致性
 */
export class GhostPlayer extends Player {
  unstable = 0
  removed = true

  async processInputEvents(dt, game) {
    const state = this.stateHistory.get(game.tick)?.inputState
    if (state & InputEnum.INTERACT) {
      for (const obj of game.renderGroups.interactables) {
        if (await obj.handleKeyInteraction?.(this, game)) break
      }
    }

    if (state & InputEnum.JUMP_DOWN) this.onJumpInput()
    if (state & InputEnum.JUMP_UP) this.jumpKeyPressed = false

    if (state & InputEnum.WALK_LEFT) this.onHorizontalInput(-1, dt)
    else if (state & InputEnum.WALK_RIGHT) this.onHorizontalInput(1, dt)
    else this.onHorizontalInput(0, dt)
  }

  update(dt, game) {
    const record = this.stateHistory.get(game.tick)

    super.update(dt, game)

    // todo: fix timeline-consistency validator
    // this.validateState(record)
    this.state = record
  }

  validateState(record) {
    const state = this.state

    if (
      !Object.keys(record).every(
        key =>
          key === 'type' || key === 'inputState' || record[key] === state[key]
      )
    ) {
      this.unstable++

      if (this.unstable > 1) {
        console.log(
          Object.keys(record).filter(
            key =>
              key !== 'type' &&
              key !== 'inputState' &&
              record[key] !== state[key]
          )
        )
      }
    }
  }

  render(ctx, { scale, tick }) {
    const x = Math.round(this.r.x * scale) / scale
    const y = Math.round(this.r.y * scale) / scale

    if (Math.abs(tick - this.lifetimeBegin - 16) < 16) {
      ctx.beginPath()
      ctx.arc(
        this.spawnX + this.width / 2,
        this.spawnY + this.height / 2,
        12 * Math.cos(((tick - this.lifetimeBegin - 16) / 16) * (Math.PI / 2)),
        0,
        Math.PI * 2
      )
      ctx.fillStyle = '#fffc'
      ctx.fill()
    }
    if (Math.abs(tick - this.lifetimeEnd + 16) < 16) {
      ctx.beginPath()
      ctx.arc(
        x + this.width / 2,
        y + this.height / 2,
        12 * Math.cos(((tick - this.lifetimeEnd + 16) / 16) * (Math.PI / 2)),
        0,
        Math.PI * 2
      )
      ctx.fillStyle = '#000c'
      ctx.fill()
    }

    if (this.removed) return

    // 受伤时闪烁效果
    if (this.damageTimer > 0 && Math.floor(this.damageTimer / 0.2) % 2 === 0) {
      ctx.globalAlpha = 0.8
    } else {
      ctx.globalAlpha = 1.0
    }

    ctx.globalAlpha -= 0.4

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
}
