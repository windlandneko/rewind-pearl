import { AABBObject } from './AABBObject.js'

export class Platform extends AABBObject {
  constructor(x, y, width, height) {
    super(x, y, width, height)
    this.color = '#666'
  }

  render(ctx) {
    ctx.fillStyle = this.color
    ctx.fillRect(
      this.r.x,
      this.r.y,
      this.width,
      this.height
    )
  }
}
