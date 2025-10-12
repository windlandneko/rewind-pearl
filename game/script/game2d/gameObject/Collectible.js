import { BaseObject } from './BaseObject.js'
import Asset from '../../Asset.js'
import SpriteAnimation from '../Sprite.js'
import Game2D from '../Game2D.js'
import { Player } from './Player.js'

const COLLECT_ANIM_TIME = 0.25

export class Collectible extends BaseObject {
  color = '#FFC107'
  bobOffset = 0
  collectTick = 0
  collected = false

  constructor(x, y, spriteId, onlyGhostCanCollect = false, onCollect = null) {
    super(x, y, 4, 4)
    this.spriteId = spriteId
    this.onlyGhostCanCollect = onlyGhostCanCollect
    this.onCollect = onCollect

    if (this.spriteId === 'sprite/strawberry') {
      const sprite = Asset.get(this.spriteId)
      this.anim = new SpriteAnimation(sprite, 42, 16, 16, 1000 / 8, true)
    }
  }

  update(dt) {
    if (this.collected) {
      this.collectTick += dt
      this.collectTick = Math.min(this.collectTick, COLLECT_ANIM_TIME)
    } else this.collectTick = 0

    this.bobOffset += dt
    if (this.anim) this.anim.update(dt)
  }

  /**
   * @param {Player} player
   * @param {Game2D} game
   */
  async interactWithPlayer(player, game) {
    if (this.collected) return
    if (player.checkCollision(this) && !player.removed) {
      if (this.onlyGhostCanCollect && player.type !== 'GhostPlayer') return
      this.collected = true
      try {
        const $ = name => game.ref(name)
        await this.onCollect?.call(this, game, $)
      } catch (e) {
        console.error(e)
      }
      game.sound.play('lgods' + Math.ceil(Math.random() * 4))

      if (this.spriteId === 'sprite/strawberry') {
        let count = game.globalState.strawberry || 0
        count++
        if (count >= 3) game.achievement.add('strawberry_lover')
        if (count >= 8) game.achievement.add('strawberry_master')
        if (count >= 20) game.achievement.add('strawberry_grandmaster')

        game.globalState.strawberry = count
        game.showNotification(`已收集 ${game.globalState.strawberry} 个草莓`, {
          icon: '🍓',
          type: 'info',
        })
      }
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx, { scale, debug }) {
    if (debug) {
      ctx.strokeStyle = '#ff00ffff'
      ctx.strokeRect(this.r.x, this.r.y, this.width, this.height)
    }

    const x = Math.round(this.r.x * scale) / scale
    const y =
      Math.round((this.r.y + Math.sin(this.bobOffset * 3)) * scale) / scale

    ctx.save()
    ctx.translate(x + this.width / 2, y + this.height / 2)
    ctx.scale(
      1 - this.collectTick / COLLECT_ANIM_TIME,
      1 - this.collectTick / COLLECT_ANIM_TIME
    )
    ctx.globalAlpha = 1 - this.collectTick / COLLECT_ANIM_TIME

    if (this.anim) {
      this.anim.render(ctx, -8, -8)
    } else if (Asset.has(this.spriteId)) {
      const sprite = Asset.get(this.spriteId)
      const width = this.width * 3
      const height = (sprite.height / sprite.width) * width
      ctx.drawImage(sprite, -width / 2, -height / 2, width, height)
    } else {
      ctx.save()
      ctx.fillStyle = '#0ff'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
      ctx.shadowBlur = 16

      const radius = 6
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    ctx.restore()
  }

  get state() {
    return {
      ...super.state,
      b: this.bobOffset,
      s: this.spriteId,
      t: this.collectTick,
      c: this.collected,
      o: this.onlyGhostCanCollect,
      oc: this.onCollect?.toString?.(),
    }
  }

  set state(state) {
    super.state = state
    this.bobOffset = state.b
    this.spriteId = state.s
    this.collectTick = state.t
    this.collected = state.c
    this.onlyGhostCanCollect = state.o
    this.onCollect = eval(state.oc)

    if (this.spriteId === 'sprite/strawberry') {
      const sprite = Asset.get(this.spriteId)
      this.anim = new SpriteAnimation(sprite, 42, 16, 16, 1000 / 8, true)
    }
  }
}
