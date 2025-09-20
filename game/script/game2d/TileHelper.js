import Asset from '../Asset.js'

/**
 * 2D地图图块辅助类
 *
 * @author windlandneko
 */
export class TileHelper {
  #tiles
  #hitbox
  #tileset = new Map()
  #paletteMap = new Map()
  #walls // dis = 1 (边缘)
  #padding // dis = 2 (过渡区域)
  #center // dis > 2 (中心区域)

  constructor(tileData, tilePalette = Array(10).fill('default')) {
    this.#tileset = this.#loadTileSetFromXML(Asset.get('tiles/index'))

    this.height = tileData.length
    this.width = tileData[0]?.length || 0

    this.#paletteMap = tilePalette.map(name => Asset.get('tiles/' + name))

    this.#tiles = [
      new Array(this.width + 2).fill(-1),
      ...tileData.map(row => [
        -1,
        ...row.split('').map(c => parseInt(c, 10)),
        -1,
      ]),
      new Array(this.width + 2).fill(-1),
    ]

    this.#hitbox = this.#tiles.map(row => row.map(tile => tile > 0))

    this.#generatePaddingAndCenter()
    this.#generateEdges()
  }

  /**
   * 加载 XML 格式的图块数据
   * @param {Document} xml
   */
  #loadTileSetFromXML(xml) {
    const root = xml.querySelector('Tileset')
    const sound = root.getAttribute('sound')

    const ignores =
      root
        .getAttribute('ignores')
        ?.split(',')
        .map(s => s.trim())
        .filter(Boolean) ?? []
    const copy =
      root
        .getAttribute('copy')
        ?.split(',')
        .map(s => s.trim())
        .filter(Boolean) ?? []

    const sets = new Map()

    copy.forEach(key => {
      if (!this.#tileset.has(key)) return
      this.#tileset.get(key).sets.forEach((value, key) => {
        sets.set(key, value)
      })
    })

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

    return {
      sound,
      ignores,
      copy,
      sets,
    }
  }

  #generatePaddingAndCenter() {
    this.#padding = this.#tiles.map(row => row.map(() => false))
    this.#center = this.#tiles.map(row => row.map(() => false))

    const visited = this.#tiles.map(row => row.map(() => false))
    const queue = []
    // 先将所有空气块入队
    for (let i = 1; i <= this.height; i++) {
      for (let j = 1; j <= this.width; j++) {
        if (this.#tiles[i][j] === 0) {
          queue.push([i, j, 0])
          visited[i][j] = true
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
      if (d === 2) this.#padding[i][j] = true
      if (d > 2) this.#center[i][j] = true
      for (const [di, dj] of dirs) {
        const ni = i + di,
          nj = j + dj
        if (
          ni >= 0 &&
          ni < this.height &&
          nj >= 0 &&
          nj < this.width &&
          !visited[ni][nj] &&
          this.#tiles[ni][nj] > 0
        ) {
          queue.push([ni, nj, d + 1])
          visited[ni][nj] = true
        }
      }
    }
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
          this.#walls[i][j] = true
          let r = i
          while (r <= this.height && this.#walls[r][j])
            this.#walls[r++][j] = false
          if (r > i) this.edges.push([x, y, 8, (r - i) * 8])
        }
      }
    }
  }

  #chooseTile(i, j) {
    const { sets, ignores } = this.#tileset

    if (this.#center[i][j] && sets.has('center')) {
      const { tiles } = sets.get('center')
      return tiles[Math.floor(Math.random() * tiles.length)]
    } else if (this.#padding[i][j] && sets.has('padding')) {
      const { tiles } = sets.get('padding')
      return tiles[Math.floor(Math.random() * tiles.length)]
    } else {
      for (const { mask, tiles } of sets.values()) {
        let match = true
        mask.forEach((row, di) => {
          row.forEach((val, dj) => {
            if (
              val === null ||
              ignores.includes(this.#tiles[i + di - 1][j + dj - 1])
            )
              return
            if (val === 1 && !this.#hitbox[i + di - 1][j + dj - 1])
              match = false
            if (val === 0 && this.#hitbox[i + di - 1][j + dj - 1]) match = false
          })
        })
        if (!match) continue

        return tiles[Math.floor(Math.random() * tiles.length)]
      }
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    ctx.canvas.width = this.width * 8
    ctx.canvas.height = this.height * 8
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    for (let i = 1; i <= this.height; i++) {
      for (let j = 1; j <= this.width; j++) {
        if (!this.#hitbox[i][j]) continue

        const tile = this.#tiles[i][j]

        const [sx, sy] = this.#chooseTile(i, j)
        const image = this.#paletteMap[tile] ?? Asset.get('tiles/default')

        const tx = (j - 1) * 8
        const ty = (i - 1) * 8
        ctx.drawImage(image, sx * 8, sy * 8, 8, 8, tx, ty, 8, 8)
      }
    }
  }
}
