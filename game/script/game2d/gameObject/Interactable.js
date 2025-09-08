import Dialogue from '../../Dialogue.js'
import Asset from '../../Asset.js'
import { BaseObject } from './BaseObject.js'

export class Interactable extends BaseObject {
  isHighlighted = false
  sprite = null
  spriteId = null

  constructor(x, y, dialogueId, spriteId, hint = '', force = false) {
    super(x, y, 12, 12)
    this.dialogueId = dialogueId
    if (Asset.has(spriteId)) {
      this.spriteId = spriteId
      this.sprite = Asset.get(spriteId)
      this.height = (this.width * this.sprite.height) / this.sprite.width
    } else {
      console.warn(`Sprite not found: ${spriteId}`)
    }
    this.hint = hint
    this.force = force
  }

  /**
   * 可交互物体与玩家的交互逻辑
   * @param {Player} player 玩家对象
   * @param {Game} game 游戏实例
   */
  async interactWithPlayer(player, game) {
    this.isHighlighted = player.checkCollision(this)
    if (this.isHighlighted && this.force) {
      this.force = false
      game.stop()
      await Dialogue.play(this.dialogueId)
      game.start()
    }
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

  /**
   * 渲染可交互物体
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    ctx.save()

    // 如果被高亮，添加发光效果
    if (this.isHighlighted) {
      ctx.shadowColor = this.highlightColor
      ctx.shadowBlur = 10
    }

    // 渲染sprite，保持原有的跳动效果
    if (this.sprite) {
      ctx.drawImage(
        this.sprite,
        this.r.x - this.width / 2,
        this.r.y - this.height,
        this.width,
        this.height
      )
    } else {
      ctx.fillStyle = '#ff845eff'
      ctx.fillRect(
        this.r.x - this.width / 2,
        this.r.y - this.height,
        this.width,
        this.height
      )
    }

    ctx.restore()

    // 渲染提示文本
    if (this.hint) {
      ctx.fillStyle = 'white'
      ctx.font = '5px HarmonyOS Sans SC, serif, sans-serif'
      const textWidth = ctx.measureText(this.hint).width
      ctx.fillText(
        this.hint,
        this.r.x + this.width / 2 - textWidth / 2,
        this.r.y - 5
      )
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
      force: this.force,
    }
  }

  set state(state) {
    super.state = state
    this.bobOffset = state.bobOffset
    this.isHighlighted = state.isHighlighted
    this.dialogueId = state.dialogueId
    this.hint = state.hint
    this.force = state.force
    this.spriteId = state.spriteId
    if (this.spriteId) this.sprite = Asset.get(this.spriteId)
  }
}
