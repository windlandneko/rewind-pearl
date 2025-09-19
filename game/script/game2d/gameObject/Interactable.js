import Dialogue from '../../Dialogue.js'
import Asset from '../../Asset.js'
import { BaseObject } from './BaseObject.js'

export class Interactable extends BaseObject {
  isHighlighted = false
  spriteId = null

  constructor(x, y, dialogueId, spriteId, hint = '', autoPlay = false) {
    super(x, y, 16, 16)
    this.dialogueId = dialogueId
    this.spriteId = spriteId
    this.hint = hint
    this.autoPlay = autoPlay
  }

  /**
   * 可交互物体与玩家的交互逻辑
   * @param {Player} player 玩家对象
   * @param {Game} game 游戏实例
   */
  async interactWithPlayer(player, game) {
    if (player.removed) return
    this.isHighlighted = player.checkCollision(this)
    if (this.autoPlay && this.isHighlighted && player.onGround) {
      await this.handleKeyInteraction(player, game)
      this.dialogueId = null
    }
  }

  /**
   * 处理按键交互
   * @param {Player} player 玩家对象
   * @param {import('../Game2D.js').Game} game 游戏实例
   * @returns {boolean} 是否开始了对话
   */
  async handleKeyInteraction(player, game) {
    if (player.type === 'GhostPlayer') return false
    if (!player.checkCollision(this) || !this.dialogueId) return false

    game.stop()
    await Dialogue.play(this.dialogueId)
    game.start()
    return true
  }

  render(ctx) {
    ctx.save()

    if (Asset.has(this.spriteId)) {
      const sprite = Asset.get(this.spriteId)
      const height = (this.width * sprite.height) / sprite.width
      ctx.drawImage(sprite, this.r.x, this.r.y, this.width, height)
    } else {
      ctx.fillStyle = '#ff845eff'
      ctx.fillRect(this.r.x, this.r.y, this.width, this.height)
    }

    ctx.restore()

    // 渲染提示文本
    if (this.hint && this.isHighlighted) {
      ctx.fillStyle = 'white'
      ctx.font = '5px HarmonyOS Sans SC, serif, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(this.hint, this.r.x + this.width / 2, this.r.y - 5)
    }
  }

  get state() {
    return {
      ...super.state,
      bobOffset: this.bobOffset,
      isHighlighted: this.isHighlighted,
      dialogueId: this.dialogueId,
      hint: this.hint,
      spriteId: this.spriteId,
    }
  }

  set state(state) {
    super.state = state
    this.bobOffset = state.bobOffset
    this.isHighlighted = state.isHighlighted
    this.dialogueId = state.dialogueId
    this.hint = state.hint
    this.spriteId = state.spriteId
    if (this.spriteId) this.sprite = Asset.get(this.spriteId)
  }
}
