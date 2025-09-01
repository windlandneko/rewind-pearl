import { AABBObject } from './AABBObject.js'

export class Interactable extends AABBObject {
  bobOffset = 0
  color = '#9C27B0'
  highlightColor = '#FFD700'
  isHighlighted = false

  constructor(x, y, dialogueId, hint) {
    super(x, y, 40, 40)
    this.dialogueId = dialogueId
    this.hint = hint
  }

  update(dt) {
    this.bobOffset += dt * 2
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
      ctx.font = '12px SourceHanSerifCN, serif, sans-serif'
      const textWidth = ctx.measureText(this.hint).width
      ctx.fillText(
        this.hint,
        this.r.x + this.width / 2 - textWidth / 2,
        this.r.y - 16 + Math.sin(this.bobOffset) * 4
      )
    }
  }
}
