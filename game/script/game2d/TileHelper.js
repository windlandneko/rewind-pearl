import Asset from '../Asset.js'
import { PesudoRandom } from '../utils.js'

/**
 * 2D地图图块辅助类
 *
 * @author windlandneko
 */
export class TileHelper {
  #tileset

  /** @type {string[]} */
  #palette

  /** @type {Image[]} */
  #paletteMap

  /** @type {number[][]} */
  #tiles

  /** @type {number[][]} */
  #distance

  /** @type {boolean[][]} */
  #dirty

  #rng

  /**
   * @param {number[][]} tileData
   * @param {string[]} tilePalette
   */
  constructor(tileData, tilePalette = Array(10).fill('default')) {
    this.height = tileData.length
    this.width = tileData[0]?.length || 0

    this.#loadTileSetFromURL()
    this.#loadTilePalette(tilePalette)

    this.#tiles = [
      new Array(this.width + 2).fill(-1),
      ...tileData.map(row => [
        -1,
        ...(typeof row === 'string'
          ? row.split('').map(c => (c === ' ' ? 0 : parseInt(c, 10)))
          : row),
        -1,
      ]),
      new Array(this.width + 2).fill(-1),
    ]

    this.#dirty = this.#tiles.map(row => row.map(() => true))
    this.#distance = this.#tiles.map(row => row.map(() => Infinity))

    this.#calculateTileDistance()
    this.#calculateTileEdges()

    this.#rng = new PesudoRandom()
  }

  /**
   * 加载 XML 格式的图块数据
   * @param {string} url
   * @returns {{sound: string, ignores: string[], copy: string[], sets: Map<string, { mask: number[][], tiles: number[][] }>}}
   */
  #loadTileSetFromURL(url = 'tiles/index') {
    if (!Asset.has(url)) return
    const xml = Asset.get(url)

    const root = xml.querySelector('Tileset')

    const ignores =
      root
        .getAttribute('ignores')
        ?.split(',')
        .map(s => s.trim())
        .filter(Boolean) ?? []

    const sets = new Map()

    root.querySelectorAll('set').forEach(setNode => {
      const key = setNode.getAttribute('mask')
      const mask = key
        .split('-')
        .map(row =>
          row.split('').map(c => (c === '1' ? 1 : c === '0' ? 0 : null))
        )
      const tiles = setNode
        .getAttribute('tiles')
        .split(';')
        .map(pair => pair.trim())
        .filter(Boolean)
        .map(pair => pair.split(',').map(n => parseInt(n, 10)))
      sets.set(key, { mask, tiles })
    })

    this.#tileset = { ignores, sets }
  }

  #loadTilePalette(palette) {
    if (palette) this.#palette = palette
    this.#paletteMap = this.#palette.map(name => {
      if (!Asset.has('tiles/' + name)) return
      return Asset.get('tiles/' + name)
    })
  }

  #calculateTileDistance() {
    const distance = this.#tiles.map(row => row.map(() => Infinity))
    const queue = []
    // 先将所有空气块入队
    for (let i = 1; i <= this.height; i++) {
      for (let j = 1; j <= this.width; j++) {
        if (this.#tiles[i][j] === 0) {
          queue.push([i, j, 0])
          distance[i][j] = 0
        }
      }
    }
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]
    while (queue.length) {
      const [i, j, d] = queue.shift()
      for (const [di, dj] of dirs) {
        const x = i + di
        const y = j + dj
        if (distance[x][y] > d + 1 && this.#tiles[x][y] > 0) {
          distance[x][y] = d + 1
          queue.push([x, y, d + 1])
        }
      }
    }

    for (let i = 1; i <= this.height; i++) {
      for (let j = 1; j <= this.width; j++) {
        if (Math.min(2, this.#distance[i][j]) !== Math.min(2, distance[i][j]))
          this.#fill3x3(this.#dirty, i, j, true)
      }
    }
    this.#distance = distance
  }

  #calculateTileEdges() {
    this.edges = []

    const walls = this.#distance.map(row => row.map(d => d === 1))

    for (let i = 1; i <= this.height; i++) {
      for (let j = 1; j <= this.width; j++) {
        if (!walls[i][j]) continue
        const x = (j - 1) * 8
        const y = (i - 1) * 8

        let r = j
        while (r <= this.width && walls[i][r]) walls[i][r++] = false
        if (r > j + 1) {
          this.edges.push([x, y, (r - j) * 8, 8])
        } else {
          // try expand vertically
          walls[i][j] = true
          let r = i
          while (r <= this.height && walls[r][j]) walls[r++][j] = false
          if (r > i) this.edges.push([x, y, 8, (r - i) * 8])
        }
      }
    }
  }

  #chooseTile(i, j) {
    const { sets, ignores } = this.#tileset

    this.#rng.seed = i * 31 + j * 17

    if (this.#distance[i][j] > 2 && sets.has('center')) {
      const { tiles } = sets.get('center')
      return tiles[this.#rng.nextInt(tiles.length)]
    } else if (this.#distance[i][j] === 2 && sets.has('padding')) {
      const { tiles } = sets.get('padding')
      return tiles[this.#rng.nextInt(tiles.length)]
    } else {
      for (const { tiles, mask } of sets.values()) {
        let match = true
        mask.forEach((row, di) => {
          row.forEach((x, dj) => {
            if (
              x === null ||
              ignores.includes(this.#tiles[i + di - 1][j + dj - 1])
            )
              return
            if (x === 1 && this.#tiles[i + di - 1][j + dj - 1] <= 0)
              match = false
            if (x === 0 && this.#tiles[i + di - 1][j + dj - 1] > 0)
              match = false
          })
        })
        if (!match) continue

        return tiles[this.#rng.nextInt(tiles.length)]
      }
    }
  }

  #fill3x3(matrix, i, j, value) {
    matrix[i][j] = value
    matrix[i - 1][j] = value
    matrix[i + 1][j] = value
    matrix[i][j - 1] = value
    matrix[i][j + 1] = value
    matrix[i - 1][j - 1] = value
    matrix[i - 1][j + 1] = value
    matrix[i + 1][j - 1] = value
    matrix[i + 1][j + 1] = value
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx, force = false) {
    if(this.width == 0) debugger
    if (ctx.canvas.width !== this.width * 8) ctx.canvas.width = this.width * 8
    if (ctx.canvas.height !== this.height * 8)
      ctx.canvas.height = this.height * 8

    if (!this.#tileset) this.#loadTileSetFromURL()
    if (!this.#tileset) return

    this.#loadTilePalette()

    if (force) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    for (let i = 1; i <= this.height; i++) {
      for (let j = 1; j <= this.width; j++) {
        if (!force && !this.#dirty[i][j]) continue

        const [tx, ty] = [(j - 1) * 8, (i - 1) * 8]
        ctx.clearRect(tx, ty, 8, 8)

        if (this.#tiles[i][j] <= 0) {
          this.#dirty[i][j] = false
          continue
        }

        const tile = this.#tiles[i][j]

        const [sx, sy] = this.#chooseTile(i, j)

        const image = this.#paletteMap[tile ?? 'default']
        if (!image) continue

        ctx.drawImage(image, sx * 8, sy * 8, 8, 8, tx, ty, 8, 8)

        this.#dirty[i][j] = false
      }
    }
  }

  set tiles(tiles) {
    for (let i = 1; i <= this.height; i++) {
      for (let j = 1; j <= this.width; j++) {
        if (tiles[i - 1][j - 1] !== this.#tiles[i][j]) {
          this.#fill3x3(this.#dirty, i, j, true)
        }
        this.#tiles[i][j] = tiles[i - 1][j - 1]
      }
    }

    this.#calculateTileDistance()
  }
}
