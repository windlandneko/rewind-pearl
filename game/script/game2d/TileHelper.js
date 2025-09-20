/**
 * 地图背景图块管理器
 *
 * @author windlandneko
 */
export class TileHelper {
  #tiles
  #hitbox
  #walls

  static palette = [
    null,
    '#525989', // 1
    '#865642', // 2
    '#578DFF', // 3
    '#2B4755', // 4
    '#192C41', // 5
    '#100F1C', // 6
  ]

  static borderPalette = [
    null,
    '#A2B0BE', // 1
    '#D1A570', // 2
    '#FFFFFF', // 3
    '#A1B6B2', // 4
    '#32465c', // 5
    '#100F1C', // 6
  ]

  constructor(tileData) {
    this.height = tileData.length
    this.width = tileData[0]?.length || 0

    this.#tiles = [
      new Array(this.width + 2).fill(-1),
      ...tileData.map(row => [-1, ...row, -1]),
      new Array(this.width + 2).fill(-1),
    ]

    this.#hitbox = this.#tiles.map(row => row.map(tile => this.isValid(tile)))

    this.#generateEdges()
  }

  #generateEdges() {
    this.edges = []

    this.#walls = this.#hitbox.map(row => [...row])
    for (let i = 1; i <= this.height; i++) {
      for (let j = 1; j <= this.width; j++) {
        if (
          this.#tiles[i + 1][j] &&
          this.#tiles[i][j + 1] &&
          this.#tiles[i - 1][j] &&
          this.#tiles[i][j - 1]
        ) {
          this.#walls[i][j] = false
        }
      }
    }

    for (let i = 1; i <= this.height; i++) {
      for (let j = 1; j <= this.width; j++) {
        if (!this.#walls[i][j]) continue
        const x = (j - 1) * 8
        const y = (i - 1) * 8

        let r = j
        while (r <= this.width && this.#walls[i][r]) this.#walls[i][r++] = false
        if (r > j + 1) {
          this.edges.push([x, y, (r - j) * 8, 8])
        } else {
          // try expand vertically
          console.log('try expand vertically', i, j)
          this.#walls[i][j] = true
          let r = i
          while (r <= this.height && this.#walls[r][j])
            (this.#walls[r++][j] = false), console.log(r, j)
          if (r > i) this.edges.push([x, y, 8, (r - i) * 8])
        }
      }
    }
  }

  isValid(id) {
    return id === -1 || (1 <= id && id <= TileHelper.palette.length)
  }

  render(ctx) {
    ctx.fillStyle = '#1B2C40'
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    for (let i = 1; i <= this.height; i++) {
      for (let j = 1; j <= this.width; j++) {
        if (!this.#hitbox[i][j]) continue

        const tile = this.#tiles[i][j]
        const x = (j - 1) * 8
        const y = (i - 1) * 8

        ctx.fillStyle = this.getColor(tile)
        ctx.fillRect(x, y, 8, 8)

        ctx.fillStyle = this.getBorderColor(tile)
        if (!this.#hitbox[i + 1][j]) ctx.fillRect(x, y + 7, 8, 1)
        if (!this.#hitbox[i - 1][j]) ctx.fillRect(x, y, 8, 1)
        if (!this.#hitbox[i][j + 1]) ctx.fillRect(x + 7, y, 1, 8)
        if (!this.#hitbox[i][j - 1]) ctx.fillRect(x, y, 1, 8)

        if (!this.#hitbox[i + 1][j + 1]) ctx.fillRect(x + 7, y + 7, 1, 1)
        if (!this.#hitbox[i + 1][j - 1]) ctx.fillRect(x, y + 7, 1, 1)
        if (!this.#hitbox[i - 1][j + 1]) ctx.fillRect(x + 7, y, 1, 1)
        if (!this.#hitbox[i - 1][j - 1]) ctx.fillRect(x, y, 1, 1)

        // ctx.fillStyle = 'red'
        // if (
        //   this.#tiles[i + 1][j] != 0 &&
        //   this.#tiles[i][j + 1] != 0 &&
        //   this.#tiles[i - 1][j] != 0 &&
        //   this.#tiles[i][j - 1] != 0
        // ) {
        // } else ctx.fillRect(x + 3, y + 3, 2, 2)
      }
    }

    // ctx.strokeStyle = '#578DFF'
    // ctx.lineWidth = 1
    // this.edges.forEach(([x, y, width, height]) => {
    //   ctx.strokeRect(x + 2, y + 2, width - 4, height - 4)
    // })
  }

  getColor(index) {
    return TileHelper.palette[index] ?? '#000000'
  }

  getBorderColor(index) {
    return TileHelper.borderPalette[index] ?? '#FFFFFF'
  }
}
