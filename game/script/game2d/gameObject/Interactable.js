import Dialogue from '../../Dialogue.js'
import { BaseObject } from './BaseObject.js'

export class Interactable extends BaseObject {
  type = 'interactable'
  bobOffset = 0
  color = '#9C27B0'
  highlightColor = '#FFD700'
  isHighlighted = false

  constructor(x, y, dialogueId, hint) {
    super(x, y, 12, 12)
    this.dialogueId = dialogueId
    this.hint = hint
  }

  update(dt) {
    this.bobOffset += dt * 2
  }

  /**
   * 可交互物体与玩家的交互逻辑
   * @param {Player} player 玩家对象
   * @param {Game} game 游戏实例
   */
  interactWithPlayer(player, game) {
    this.isHighlighted = player.checkCollision(this)
  }

  /**
   * 处理按键交互
   * @param {Player} player 玩家对象
   * @param {import('../Game2D.js').Game} game 游戏实例
   * @returns {boolean} 是否开始了对话
   */
  async handleKeyInteraction(player, game) {
    if (!player.checkCollision(this) || !this.dialogueId) return false
    game.stop()
    await Dialogue.play(this.dialogueId)
    game.start()
    return true
  }

  render(ctx) {
    ctx.fillStyle = this.isHighlighted ? this.highlightColor : this.color
    ctx.fillRect(
      this.r.x,
      this.r.y + Math.sin(this.bobOffset) * 4,
      this.width,
      this.height
    )

    if (this.hint) {
      ctx.fillStyle = 'white'
      ctx.font = '5px HarmonyOS Sans SC, serif, sans-serif'
      const textWidth = ctx.measureText(this.hint).width
      ctx.fillText(
        this.hint,
        this.r.x + this.width / 2 - textWidth / 2,
        this.r.y - 5 + Math.sin(this.bobOffset) * 4
      )
    }
  }

  get state() {
    return {
      ...super.state,
      bobOffset: this.bobOffset,
      isHighlighted: this.isHighlighted,
      highlightColor: this.highlightColor,
      dialogueId: this.dialogueId,
      hint: this.hint,
    }
  }

  set state(state) {
    super.state = state
    this.bobOffset = state.bobOffset
    this.isHighlighted = state.isHighlighted
    this.highlightColor = state.highlightColor
    this.dialogueId = state.dialogueId
    this.hint = state.hint
  }
}
