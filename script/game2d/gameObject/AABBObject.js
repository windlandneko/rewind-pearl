import Vec2 from '../Vector.js'

export class AABBObject {
  type = 'default'
  removed = false

  constructor(x, y, width, height) {
    this.r = new Vec2(x, y)
    this.v = new Vec2(0, 0)
    this.width = width
    this.height = height
  }

  checkCollision(other) {
    return (
      this.r.x < other.r.x + other.width &&
      this.r.x + this.width > other.r.x &&
      this.r.y < other.r.y + other.height &&
      this.r.y + this.height > other.r.y
    )
  }

  /**
   * 更新状态
   * @abstract
   * @param {number} dt - 时间增量
   */
  update(dt) {}

  /**
   * 玩家交互
   * @abstract
   * @param {import('./Player.js').Player} player 玩家对象
   * @param {import('../Game2D.js').Game} game 游戏实例
   */
  interactWithPlayer(player, game) {}

  /**
   * 渲染对象
   * @abstract
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    // missing texture
    const tileSize = 16
    const cols = Math.ceil(this.width / tileSize)
    const rows = Math.ceil(this.height / tileSize)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tileX = this.r.x + col * tileSize
        const tileY = this.r.y + row * tileSize
        const tileWidth = Math.min(tileSize, this.r.x + this.width - tileX)
        const tileHeight = Math.min(tileSize, this.r.y + this.height - tileY)

        ctx.fillStyle = (row + col) % 2 === 0 ? '#EC13C0' : '#000000'
        ctx.fillRect(tileX, tileY, tileWidth, tileHeight)
      }
    }
  }
}
