import { Player } from './Player.js'

/**
 * 玩家幽灵 - 代表过去的自己
 * 会按照录制的输入数据进行移动，并验证状态一致性
 */
export class GhostPlayer extends Player {
  type = 'ghost_player'
  flag = false

  update(dt, game) {
    if (!this.stateHistory.has(game.tick)) {
      this.removed = true
      return
    }
    this.removed = false

    this.inputQueue = this.inputHistory.get(game.tick) || []
    super.update(dt, game)

    const record = this.stateHistory.get(game.tick)
    if (!this.flag) {
      this.flag = true
      this.validateState(record)
    }
    this.state = record
  }

  validateState(record) {
    const state = this.state

    if (
      !Object.keys(record).every(
        key => key === 'inputQueue' || record[key] === state[key]
      )
    ) {
      console.log(
        '时空结构被破坏',
        Object.keys(record)
          .filter(key => record[key] !== state[key])
          .map(key => `${key}: ${record[key]} -> ${state[key]}`)
      )
    }
  }

  processInputEvents(dt, game) {
    super.processInputEvents(dt, game, true)
  }

  render(ctx, { scale, tick }) {
    const x = Math.round(this.r.x * scale) / scale
    const y = Math.round(this.r.y * scale) / scale

    if (Math.abs(tick - this.lifetimeBegin) < 25) {
      ctx.beginPath()
      ctx.arc(
        x + this.width / 2,
        y + this.height / 2,
        Math.min(12, 25 - Math.abs(tick - this.lifetimeBegin)),
        0,
        Math.PI * 2
      )
      ctx.fillStyle = 'red'
      ctx.stroke()
    }
    if (Math.abs(tick - this.lifetimeEnd) < 25) {
      ctx.beginPath()
      ctx.arc(
        x + this.width / 2,
        y + this.height / 2,
        Math.min(12, 25 - Math.abs(tick - this.lifetimeEnd)),
        0,
        Math.PI * 2
      )
      ctx.fillStyle = 'blue'
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
