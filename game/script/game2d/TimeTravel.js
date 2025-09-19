import { TIME_TRAVEL_CHARGE_TIME } from './GameConfig.js'
import { Player } from './gameObject/Player.js'
import { GhostPlayer } from './gameObject/GhostPlayer.js'

class TimeTravelManager {
  /** @type {import('./Game2D.js').default} */
  #game

  state = null
  radius = 0
  radiusMax = 0

  set game(game) {
    this.#game = game
  }

  startTimeTravelPreview() {
    if (this.state === 'success') return
    this.state = 'pending'
    this.startTick = this.#game.tick
    this.deltaTick = 0

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
      this.#game.globalState.timeTravelUsed <
      this.#game.globalState.timeTravelMax
    )
  }

  update(dt) {
    if (this.state === 'pending') {
      if (this.deltaTick >= TIME_TRAVEL_CHARGE_TIME) {
        if (this.canTimeTravel) {
          this.state = 'success'
          this.#game.globalState.timeTravelUsed++
        } else {
          this.state = null
        }
      } else {
        this.radius =
          (this.canTimeTravel * 40 + 6 + this.deltaTick / 20) * 0.1 +
          this.radius * 0.9
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

    this.#game.tick = Math.max(1, this.startTick - this.deltaTick * 5)
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
    const tick = Math.max(1, this.startTick - this.deltaTick * 5)

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
    game.renderGroups.interactables.forEach(obj => {
      if (!obj.hidden) obj.render(tmpctx, game)
    })
    game.renderGroups.triggers.forEach(obj => {
      if (!obj.hidden) obj.render(tmpctx, game)
    })
    game.renderGroups.collectibles.forEach(obj => {
      if (!obj.hidden) obj.render(tmpctx, game)
    })
    game.renderGroups.enemies.forEach(obj => {
      if (!obj.hidden) obj.render(tmpctx, game)
    })
    game.renderGroups.movingPlatforms.forEach(obj => {
      if (!obj.hidden) obj.render(tmpctx, game)
    })
    game.renderGroups.platforms.forEach(obj => {
      if (!obj.hidden) obj.render(tmpctx, game)
    })

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
        ? 'rgba(87, 87, 200, 0.5)'
        : this.canTimeTravel
        ? 'rgba(87, 87, 200, 0.5)'
        : 'rgba(255, 0, 0, 0.5)'
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
        ? 'rgba(233, 233, 255, 0.9)'
        : '#ff0000'
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
