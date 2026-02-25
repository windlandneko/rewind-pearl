import Asset from '../Asset.js'
import { hash2D } from '../utils.js'

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
  }

  /**
   * 加载 XML 格式的图块数据
   * @param {string} url
   * @returns {{sound: string, ignores: string[], copy: string[], sets: Map<string, { mask: number[][], tiles: number[][] }>}}
   */
  #loadTileSetFromURL(url = 'tiles/index') {
    // 优化：直接get然后检查，避免双重Map查找
    const xml = Asset.get(url)
    if (!xml) return

    const root = xml.querySelector('Tileset')

    const ignores =
      root
        .getAttribute('ignores')
        ?.split(',')
        .map(s => s.trim())
        .filter(Boolean) ?? []

    const sets = new Map()

    // 优化：使用for循环代替forEach
    const setNodes = root.querySelectorAll('set')
    for (let i = 0; i < setNodes.length; i++) {
      const setNode = setNodes[i]
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
    }

    this.#tileset = { ignores, sets }
  }

  #loadTilePalette(palette) {
    if (palette) this.#palette = palette
    // 优化：直接get然后检查，避免双重Map查找
    this.#paletteMap = this.#palette.map(name => {
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
      const [i, j, d] = queue.pop()
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

    if (this.#distance[i][j] > 2 && sets.has('center')) {
      const { tiles } = sets.get('center')
      return tiles[hash2D(i, j, tiles.length)]
    } else if (this.#distance[i][j] === 2 && sets.has('padding')) {
      const { tiles } = sets.get('padding')
      return tiles[hash2D(i, j, tiles.length)]
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

        return tiles[hash2D(i, j, tiles.length)]
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
    if (this.width == 0) debugger
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

        const [sx, sy] = this.#chooseTile(i, j) ?? [0, 0]

        const image = this.#paletteMap[tile ?? 'default']
        if (!image) continue

        ctx.drawImage(image, sx * 8, sy * 8, 8, 8, tx, ty, 8, 8)

        if (this.#distance[i][j] > 0) {
          for (let dx = 0; dx <= 1; dx++) {
            for (let dy = 0; dy <= 1; dy++) {
              const fx = 0.75 - dx * 0.5
              const fy = 0.75 - dy * 0.5
              const d00 = this.#distance[i + dy - 1][j + dx - 1]
              const d01 = this.#distance[i + dy - 1][j + dx]
              const d10 = this.#distance[i + dy][j + dx - 1]
              const d11 = this.#distance[i + dy][j + dx]

              // 双线性插值
              const dist =
                d00 * (1 - fx) * (1 - fy) +
                d10 * (1 - fx) * fy +
                d01 * fx * (1 - fy) +
                d11 * fx * fy

              const alpha = Math.min(0.8, dist * 0.06)
              ctx.save()
              ctx.fillStyle = `rgba(0,0,0,${alpha})`
              ctx.fillRect(tx + dx * 4, ty + dy * 4, 4, 4)

              ctx.restore()
            }
          }
        }

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

    // this.#calculateTileDistance()
  }
}
