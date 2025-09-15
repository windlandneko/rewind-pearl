import Vec2 from '../Vector.js'

export class BaseObject {
  color = 'red'
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
   * @param {import('../Game2D.js').Game} game 游戏实例
   */
  render(ctx, game) {
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

  /**
   * 设置引用名称，可供回调函数使用
   * @param {*} name
   * @returns
   */
  ref(name) {
    this._ref = name
    return this
  }

  /**
   * 导出对象状态用于时间回溯
   */
  get state() {
    return {
      type: this.constructor.name,
      rx: this.r.x,
      ry: this.r.y,
      vx: this.v.x,
      vy: this.v.y,
      width: this.width,
      height: this.height,
      color: this.color,
      removed: this.removed,
      _ref: this._ref,
    }
  }

  /**
   * 从状态数据恢复对象
   */
  set state(state) {
    this.r.x = state.rx
    this.r.y = state.ry
    this.v.x = state.vx
    this.v.y = state.vy
    this.width = state.width
    this.height = state.height
    this.color = state.color
    this.removed = state.removed
    this._ref = state._ref
  }

  get type() {
    return this.constructor.name
  }
}
