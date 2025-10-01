import Dialogue from '../../Dialogue.js'
import Asset from '../../Asset.js'
import { BaseObject } from './BaseObject.js'

export class Interactable extends BaseObject {
  hintOpacity = 0
  spriteId = null

  constructor(
    x,
    y,
    width,
    height,
    dialogueId,
    spriteId,
    hint = '',
    autoPlay = false,
    afterInteract = null
  ) {
    super(x, y, width, height)
    this.dialogueId = dialogueId
    this.spriteId = spriteId
    this.hint = hint
    this.autoPlay = autoPlay
    this.afterInteract = afterInteract
  }

  /**
   * 可交互物体与玩家的交互逻辑
   * @param {Player} player 玩家对象
   * @param {Game} game 游戏实例
   */
  async interactWithPlayer(player, game) {
    if (player.removed) return
    const k = 0.1
    const flag = player.checkCollision(this)
    this.hintOpacity = flag * k + this.hintOpacity * (1 - k)
    if (this.autoPlay && flag && player.onGround) {
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
    if (!player.checkCollision(this)) return false

    if (this.dialogueId) {
      game.stop()
      await Dialogue.play(this.dialogueId)
      game.start()
    }

    const $ = name => game.ref(name)
    if (this.afterInteract) {
      try {
        await this.afterInteract.call(this, game, $)
      } catch (e) {
        console.error(e)
      }
    }

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
    if (this.hint) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.hintOpacity})`
      ctx.font = '5px HarmonyOS Sans SC, serif, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(this.hint, this.r.x + this.width / 2, this.r.y - 5)
    }
  }

  get state() {
    return {
      ...super.state,
      bobOffset: this.bobOffset,
      isHighlighted: this.hintOpacity,
      dialogueId: this.dialogueId,
      hint: this.hint,
      spriteId: this.spriteId,
      aI: this.afterInteract?.toString?.(),
    }
  }

  set state(state) {
    super.state = state
    this.bobOffset = state.bobOffset
    this.hintOpacity = state.isHighlighted
    this.dialogueId = state.dialogueId
    this.hint = state.hint
    this.afterInteract = eval(state.aI)
    this.spriteId = state.spriteId
    if (this.spriteId) this.sprite = Asset.get(this.spriteId)
  }
}
