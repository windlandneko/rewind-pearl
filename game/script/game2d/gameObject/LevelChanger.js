import { BaseObject } from './BaseObject.js'

export class LevelChanger extends BaseObject {
  type = 'level-transition'
  color = '#00FF00'

  constructor(x, y, width, height, targetLevel, force = false) {
    super(x, y, width, height)
    this.targetLevel = targetLevel
    this.force = force
  }

  interactWithPlayer(player, game) {
    if (this.force && player.checkCollision(this) && this.targetLevel) {
      game.changeLevel(this.targetLevel)
    }
  }

  async handleKeyInteraction(player, game) {
    if (!player.checkCollision(this) || !this.targetLevel) return false

    // 开始关卡切换过渡动画
    await game.changeLevel(this.targetLevel)
    return true
  }

  render(ctx) {
    ctx.fillStyle = this.color
    ctx.fillRect(this.r.x, this.r.y, this.width, this.height)
  }

  get state() {
    return {
      ...super.state,
      targetLevel: this.targetLevel,
      force: this.force,
    }
  }

  set state(state) {
    super.state = state
    this.targetLevel = state.targetLevel
    this.force = state.force
  }
}
