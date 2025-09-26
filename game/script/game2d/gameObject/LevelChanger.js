import { BaseObject } from './BaseObject.js'

export class LevelChanger extends BaseObject {
  color = '#FFDC00'
  isHighlighted = false

  constructor(x, y, width, height, targetLevel, force = false) {
    super(x, y, width, height)
    this.targetLevel = targetLevel
    this.force = force
  }

  interactWithPlayer(player, game) {
    if (player.type === 'GhostPlayer' || player.removed) return

    this.isHighlighted = player.checkCollision(this)
    if (this.force && player.checkCollision(this) && this.targetLevel) {
      game.changeLevel(this.targetLevel)
    }
  }

  async handleKeyInteraction(player, game) {
    if (player.type === 'GhostPlayer' || player.removed) return false
    if (!player.checkCollision(this) || !this.targetLevel) return false

    // 开始关卡切换过渡动画
    await game.changeLevel(this.targetLevel)
    return true
  }

  render(ctx) {
    ctx.fillStyle = this.color
    ctx.fillRect(this.r.x, this.r.y, this.width, this.height)

    ctx.font = '12px HarmonyOS Sans SC, serif, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      '🚪',
      this.r.x + this.width / 2,
      this.r.y + this.height / 2 + 1
    )

    // 渲染提示文本
    if (this.isHighlighted) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
      ctx.font = '4px HarmonyOS Sans SC, serif, sans-serif'
      ctx.textAlign = 'center'
      const width = ctx.measureText(this.targetLevel).width + 4
      ctx.fillRect(
        this.r.x + this.width / 2 - width / 2,
        this.r.y + 1,
        width,
        8
      )
      ctx.fillStyle = '#fff'
      ctx.fillText(this.targetLevel, this.r.x + this.width / 2, this.r.y + 5)
      ctx.fillStyle = this.color
    }
  }

  get state() {
    return {
      ...super.state,
      t: this.targetLevel,
      f: this.force,
      i: this.isHighlighted,
    }
  }

  set state(state) {
    super.state = state
    this.targetLevel = state.t
    this.force = state.f
    this.isHighlighted = state.i
  }
}
