import { Player } from './Player.js'

/**
 * 玩家幽灵 - 代表过去的自己
 * 会按照录制的输入数据进行移动，并验证状态一致性
 */
export class GhostPlayer extends Player {
  type = 'ghost_player'
  color = 'rgba(100, 100, 255, 0.7)' // 半透明蓝色

  tolerance = 0.1

  update(dt, game) {
    if (!this.stateHistory.has(game.tick)) {
      this.removed = true
      return
    }
    this.removed = false

    this.inputQueue = this.inputHistory.get(game.tick) || []
    super.update(dt, game)

    this.validateState(game.tick)
  }

  validateState(tick) {
    if (this.removed) return

    const record = this.stateHistory.get(tick)
    const state = this.state

    if (
      !Object.keys(record).every(
        key => key === 'inputQueue' || record[key] === state[key]
      )
    ) {
      console.log(
        '时空结构被破坏',
        Object.keys(record).filter(key => record[key] !== state[key])
      )
    }
  }

  render(ctx, cameraScale) {
    if (this.removed) return

    // console.log(this.r.x, this.r.y)

    // 绘制半透明的玩家
    ctx.save()
    ctx.globalAlpha = 0.7

    // 如果状态不一致，用红色高亮显示
    // if (!this.stateConsistent) {
    //   ctx.fillStyle = 'rgba(255, 0, 0, 0.8)'
    // } else {
    //   ctx.fillStyle = this.color
    // }

    ctx.textAlign = 'center'
    ctx.fillStyle = 'white'
    ctx.fillText(
      `HP: ${this.health}`,
      this.r.x + this.width / 2,
      this.r.y + this.height / 2
    )

    ctx.fillRect(this.r.x, this.r.y, this.width, this.height)

    // 绘制边框以区分
    ctx.strokeStyle = this.stateConsistent
      ? 'rgba(100, 100, 255, 1)'
      : 'rgba(255, 0, 0, 1)'
    ctx.lineWidth = 1 / cameraScale
    ctx.strokeRect(this.r.x, this.r.y, this.width, this.height)

    ctx.restore()
  }
}
