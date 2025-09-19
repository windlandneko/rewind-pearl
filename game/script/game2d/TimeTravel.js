import { TIME_TRAVEL_DISTANCE, TIME_TRAVEL_CHARGE_TIME } from './GameConfig.js'
import { Player } from './gameObject/Player.js'
import { GhostPlayer } from './gameObject/GhostPlayer.js'

class TimeTravelManager {
  /** @type {import('./Game2D.js').default} */
  #game

  state = null
  radius = 0
  radiusMax = 0
  startTime = 0

  set game(game) {
    this.#game = game
  }

  startTimeTravelPreview() {
    if (this.state === 'success') return
    this.state = 'pending'
    this.startTime = performance.now()

    // 计算最大圆圈半径（对角线的一半）
    this.radiusMax =
      Math.hypot(this.#game.displayWidth, this.#game.displayHeight) /
      this.#game.scale
  }

  endTimeTravelPreview() {
    if (this.state !== 'success') this.state = null
  }

  get canTimeTravel() {
    return (
      this.#game.tick < TIME_TRAVEL_DISTANCE ||
      this.#game.player.timeTravelUsed > this.#game.player.timeTravelMax
    )
  }

  update(dt) {
    if (this.state === 'pending') {
      const holdTime = performance.now() - this.startTime
      if (holdTime >= TIME_TRAVEL_CHARGE_TIME) {
        if (this.canTimeTravel) {
          this.state = null
        } else {
          this.state = 'success'
          this.#game.player.timeTravelUsed++
        }
      } else {
        this.radius = (12 + holdTime / 200) * 0.1 + this.radius * 0.9
      }
    } else if (this.state === 'success') {
      this.radius += dt * Math.min(800, this.radius ** 2 / 10)
      if (this.radius + 1 > this.radiusMax) {
        this.state = null
        this.radius = 0

        this.executeTimeTravel()
      }
    } else {
      this.radius = Math.max(0, this.radius - dt * 100)
    }
  }

  /**
   * 执行时间回溯
   */
  executeTimeTravel() {
    const state = this.#game.player.state

    const ghost = new GhostPlayer()
    ghost.state = state
    ghost.stateHistory = this.#game.player.stateHistory

    ghost.spawnX = this.#game.player.spawnX
    ghost.spawnY = this.#game.player.spawnY
    ghost.lifetimeBegin = this.#game.player.lifetimeBegin
    ghost.lifetimeEnd = this.#game.tick

    this.#game.ghostPlayers.push(ghost)

    this.#game.player = new Player()
    this.#game.player.state = state
    this.#game.camera.target = this.#game.player

    this.#game.tick = Math.max(1, this.#game.tick - 5 * 100)
    this.#game.player.spawnX = this.#game.player.r.x
    this.#game.player.spawnY = this.#game.player.r.y
    this.#game.player.lifetimeBegin = this.#game.tick

    const targetState = this.#game.history.get(this.#game.tick)
    this.#game.importGameObjects(targetState)
    this.#game.ghostPlayers.forEach(ghost => {
      if (ghost.stateHistory.has(this.#game.tick))
        ghost.state = ghost.stateHistory.get(this.#game.tick)
      else console.warn('Ghost missing state at tick', this.#game.tick)
    })
  }

  render() {
    const game = this.#game
    const ctx = game.ctx
    const tmpctx = game.tmpctx
    const tick = Math.max(1, game.tick - 500)

    if (this.radius === 0 || !game.history.has(tick)) return
    const targetState = game.history.get(tick)
    const state = game.exportGameObjects()

    game.importGameObjects(targetState)

    // 清空预览画布
    tmpctx.clearRect(0, 0, game.displayWidth, game.displayHeight)
    tmpctx.save()

    // 应用相机变换
    tmpctx.scale(game.scale, game.scale)
    const renderPos = game.camera.getRenderPosition()
    tmpctx.translate(-renderPos.x, -renderPos.y)

    // 按优先级渲染游戏对象
    game.renderGroups.movingPlatforms.forEach(entity =>
      entity.render(tmpctx, game)
    )
    game.renderGroups.collectibles.forEach(entity =>
      entity.render(tmpctx, game)
    )
    game.renderGroups.enemies.forEach(entity => entity.render(tmpctx, game))
    game.renderGroups.interactables.forEach(entity =>
      entity.render(tmpctx, game)
    )
    game.renderGroups.platforms.forEach(entity => entity.render(tmpctx, game))

    // 渲染玩家
    game.ghostPlayers.forEach(ghost => {
      if (!ghost.stateHistory.has(tick)) return
      const fakeGhost = new GhostPlayer()
      fakeGhost.state = ghost.stateHistory.get(tick)
      fakeGhost.removed = false
      fakeGhost.render(tmpctx, game)
    })
    if (game.player.stateHistory.has(tick)) {
      const ghost = new GhostPlayer()
      ghost.state = game.player.stateHistory.get(tick)
      ghost.render(tmpctx, game)
    }
    game.player.render(tmpctx, game)
    tmpctx.restore()

    game.importGameObjects(state)

    const playerScreenX =
      (game.player.r.x + game.player.width / 2 - renderPos.x) * game.scale
    const playerScreenY =
      (game.player.r.y + game.player.height / 2 - renderPos.y) * game.scale

    const gradient = tmpctx.createRadialGradient(
      playerScreenX,
      playerScreenY,
      Math.max(0, (this.radius - 100) * game.scale),
      playerScreenX,
      playerScreenY,
      this.radius * game.scale
    )
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    gradient.addColorStop(
      1,
      this.state === 'success'
        ? 'rgba(255, 255, 255, 0.5)'
        : this.canTimeTravel
        ? 'rgba(255, 0, 0, 0.5)'
        : 'rgba(87, 87, 200, 0.5)'
    )
    tmpctx.fillStyle = gradient
    tmpctx.beginPath()
    tmpctx.arc(
      playerScreenX,
      playerScreenY,
      this.radius * game.scale,
      0,
      Math.PI * 2
    )
    tmpctx.fill()

    tmpctx.save()
    tmpctx.globalCompositeOperation = 'destination-in'
    tmpctx.fillStyle = 'black'
    tmpctx.beginPath()
    tmpctx.arc(
      playerScreenX,
      playerScreenY,
      this.radius * game.scale,
      0,
      Math.PI * 2
    )
    tmpctx.fill()
    tmpctx.restore()

    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = 'black'
    ctx.beginPath()
    ctx.arc(
      playerScreenX,
      playerScreenY,
      this.radius * game.scale,
      0,
      Math.PI * 2
    )
    ctx.fill()
    ctx.restore()

    ctx.drawImage(tmpctx.canvas, 0, 0)

    // 绘制圆圈边框
    ctx.save()
    ctx.strokeStyle =
      this.state === 'success'
        ? '#ffffff'
        : this.canTimeTravel
        ? '#ff0000'
        : '#aaaaaa'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(
      playerScreenX,
      playerScreenY,
      this.radius * game.scale,
      0,
      Math.PI * 2
    )
    ctx.stroke()
    ctx.restore()
  }

  unstablize(ghost) {}
}

export default new TimeTravelManager()
