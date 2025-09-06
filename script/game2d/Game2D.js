import Keyboard from '../Keyboard.js'
import { EventListener, throttle } from '../utils.js'
import {
  Player,
  Platform,
  Enemy,
  Interactable,
  Collectible,
  BaseObject,
  GhostPlayer,
} from './gameObject/index.js'
import { Camera } from './Camera.js'
import Asset from '../Asset.js'
import GameConfig from './GameConfig.js'

export class Game {
  listener = new EventListener()

  // 游戏对象
  /** @type {Player} */
  player = null
  /** @type {GhostPlayer[]} */
  ghostPlayers = []
  /** @type {BaseObject[]} */
  gameObjects = []

  // 渲染缓存（避免每帧重复过滤）
  renderGroups = {
    platforms: [],
    collectibles: [],
    enemies: [],
    interactables: [],
  }

  // 游戏状态
  isRunning = false
  camera = new Camera()
  scale

  // 时间回溯系统
  tick = 0
  maxTick
  #gameStateHistory = new Map()

  // 时间回溯视觉效果
  timeTravelState = null
  timeTravelCircleRadius = 0
  timeTravelStartTime = 0
  timeTravelMaxRadius = 0

  #keyboardListeners = []

  constructor() {
    const main = document.querySelector('main')
    const { width, height } = main.getBoundingClientRect()

    /** @type {HTMLCanvasElement} */
    this.canvas = document.getElementById('game-canvas')
    /** @type {HTMLCanvasElement} */
    this.canvas2 = new OffscreenCanvas(width, height)

    /** @type {CanvasRenderingContext2D} */
    this.ctx = this.canvas.getContext('2d')
    /** @type {CanvasRenderingContext2D} */
    this.ctx2 = this.canvas2.getContext('2d')

    const resizeCanvas = () => {
      const { width, height } = main.getBoundingClientRect()

      const DPR = devicePixelRatio

      // 应用DPR缩放
      this.ctx.scale(DPR, DPR)
      this.ctx2.scale(DPR, DPR)

      this.canvas.width = this.displayWidth = width * DPR
      this.canvas.height = this.displayHeight = height * DPR

      if (this.isRunning)
        this.scale = this.displayHeight / this.levelData.height

      // 同步预览画布尺寸
      this.canvas2.width = this.displayWidth
      this.canvas2.height = this.displayHeight

      this.ctx.imageSmoothingEnabled = false
      this.ctx.webkitImageSmoothingEnabled = false
      this.ctx.mozImageSmoothingEnabled = false
      this.ctx.msImageSmoothingEnabled = false
      this.ctx.textBaseline = 'top'
      this.ctx.textAlign = 'left'

      this.ctx2.imageSmoothingEnabled = false
      this.ctx2.webkitImageSmoothingEnabled = false
      this.ctx2.mozImageSmoothingEnabled = false
      this.ctx2.msImageSmoothingEnabled = false
      this.ctx2.textBaseline = 'top'
      this.ctx2.textAlign = 'left'
    }

    resizeCanvas()
    addEventListener('resize', throttle(resizeCanvas, 16))

    this.canvas.classList.add('hidden')
  }

  #addKeyboardListeners() {
    this.#keyboardListeners.push(
      Keyboard.onKeydown(['E'], async () => {
        this.player.inputQueue.push('keydown:interact')
      }),
      Keyboard.onKeydown(['Esc'], () => {
        this.pause()
      }),
      Keyboard.onKeydown(['W', 'Up', 'Space'], () => {
        this.player.inputQueue.push('keydown:jump')
      }),
      Keyboard.onKeyup(['W', 'Up', 'Space'], () => {
        this.player.inputQueue.push('keyup:jump')
      }),

      Keyboard.onKeydown(['R'], () => {
        this.startTimeTravelPreview()
      }),
      Keyboard.onKeyup(['R'], () => {
        this.endTimeTravelPreview()
      })
    )
  }

  #removeKeyboardListeners() {
    this.#keyboardListeners.forEach(removeListener => removeListener())
    this.#keyboardListeners = []
  }

  /**
   * 加载关卡数据
   */
  loadLevel(setupFunction) {
    this.tick = 0
    this.maxTick = 0
    this.gameObjects = []
    this.#gameStateHistory = new Map()

    setupFunction(this)

    this.ghostPlayers = []

    // 设置摄像机
    this.#setupCamera()
  }

  importGameState(state) {
    this.gameObjects = state.map(state => {
      let entity
      switch (state.type) {
        case 'default':
          entity = new BaseObject()
          break
        case 'platform':
          entity = new Platform()
          break
        case 'enemy':
          entity = new Enemy()
          break
        case 'collectible':
          entity = new Collectible()
          break
        case 'interactable':
          entity = new Interactable()
          break
        default:
          entity = new BaseObject()
          console.warn(`[Game2D] 未处理的对象类型: ${state.type}`, state)
      }
      entity.state = state
      return entity
    })

    // 更新渲染组以反映新状态
    this.#updateRenderGroups()
  }

  exportGameState() {
    return this.gameObjects.map(obj => obj.state)
  }

  /**
   * 保存游戏状态快照到历史记录
   */
  #saveSnapshot() {
    this.#gameStateHistory.set(this.tick, this.exportGameState())
    this.#gameStateHistory.delete(
      this.tick - GameConfig.MAX_TIME_TRAVEL_DISTANCE
    )
  }

  /**
   * 开始时间回溯预览
   */
  startTimeTravelPreview() {
    if (this.timeTravelState === 'success') return
    this.timeTravelState = 'pending'
    this.timeTravelStartTime = performance.now()

    // 计算最大圆圈半径（对角线的一半）
    this.timeTravelMaxRadius =
      Math.hypot(this.displayWidth, this.displayHeight) / this.scale
  }

  /**
   * 结束时间回溯预览
   */
  endTimeTravelPreview() {
    if (this.timeTravelState === 'success') return
    this.timeTravelState = null
  }

  /**
   * 执行时间回溯
   */
  executeTimeTravel() {
    const state = this.player.state

    const ghost = new GhostPlayer()
    ghost.state = state
    ghost.stateHistory = this.player.stateHistory
    this.ghostPlayers.push(ghost)

    this.player = new Player()
    this.player.state = state

    this.tick = Math.max(1, this.tick - 5 * 100)
    const targetState = this.#gameStateHistory.get(this.tick)
    this.importGameState(targetState)
    this.ghostPlayers.forEach(ghost => {
      if (ghost.stateHistory.has(this.tick))
        ghost.state = ghost.stateHistory.get(this.tick)
      else ghost.removed = true
    })
  }

  start() {
    this.canvas.classList.remove('hidden')

    this.isRunning = true
    this.#addKeyboardListeners()

    // Update Loop
    this.updateIntervalHandler = setInterval(() => {
      this.update(GameConfig.UPDATE_INTERVAL / 1000)
    }, GameConfig.UPDATE_INTERVAL)

    // Render Loop
    const renderLoop = () => {
      this.render(this.ctx)
      this.renderTimeTravelPreview(this.ctx, this.ctx2)
      this.animationFrameHandler = requestAnimationFrame(renderLoop)
    }
    renderLoop()

    // 初始化渲染组
    this.#updateRenderGroups()
  }

  pause() {
    this.isRunning = !this.isRunning
  }

  stop() {
    this.isRunning = false
    this.#removeKeyboardListeners()
    clearInterval(this.updateIntervalHandler)
    cancelAnimationFrame(this.animationFrameHandler)
  }

  /**
   * 更新游戏逻辑
   */
  async update(dt) {
    if (this.timeTravelState === 'pending') {
      const holdTime = performance.now() - this.timeTravelStartTime

      if (holdTime >= 1000) {
        this.timeTravelState = 'success'
        this.executeTimeTravel()
      } else {
        this.timeTravelCircleRadius =
          (16 + holdTime / 100) * 0.1 + this.timeTravelCircleRadius * 0.9
      }
    } else if (this.timeTravelState === 'success') {
      const k = 0.005
      this.timeTravelCircleRadius =
        (this.timeTravelMaxRadius - this.timeTravelCircleRadius * k) / (1 - k)
      if (this.timeTravelCircleRadius + 1 > this.timeTravelMaxRadius) {
        this.timeTravelState = null
        this.timeTravelCircleRadius = 0
      }
    } else {
      this.timeTravelCircleRadius = Math.max(
        0,
        this.timeTravelCircleRadius - dt * 50
      )
    }

    if (!this.isRunning) return

    this.tick++
    this.maxTick = Math.max(this.maxTick, this.tick)
    this.#saveSnapshot()

    // 移除标记为删除的对象
    const objectsToRemove = this.gameObjects.filter(obj => obj.removed)
    if (objectsToRemove.length > 0) {
      this.gameObjects = this.gameObjects.filter(obj => !obj.removed)
      this.#updateRenderGroups()
    }

    // 外部输入事件
    const keyLeft = Keyboard.anyActive(['A', 'ArrowLeft'])
    const keyRight = Keyboard.anyActive(['D', 'ArrowRight'])
    if (keyLeft && !keyRight) {
      this.player.inputQueue.push('walk:left')
    } else if (keyRight && !keyLeft) {
      this.player.inputQueue.push('walk:right')
    } else {
      this.player.inputQueue.push('walk:stop')
    }

    // 更新玩家
    this.ghostPlayers.forEach(ghost => ghost.update(dt, this))
    this.player.update(dt, this)
    this.player.stateHistory.set(this.tick, this.player.state)

    // 世界边界
    if (this.levelData.worldBorder) {
      // 左
      if (this.player.r.x < 0) {
        this.player.r.x = 0
        this.player.v.x = 0
      }
      // 右
      if (this.player.r.x + this.player.width > this.levelData.width) {
        this.player.r.x = this.levelData.width - this.player.width
        this.player.v.x = 0
      }
      // 上
      if (this.player.r.y < 0) {
        this.player.r.y = 0
        this.player.v.y = 0
      }
      // 下
      if (this.player.r.y > this.levelData.height) {
        this.player.r.x = this.levelData.spawnpoint.x
        this.player.r.y = this.levelData.spawnpoint.y
        // todo
      }
    }

    // 更新游戏对象本身
    this.gameObjects.forEach(entity => entity.update(dt))

    // 重置落地状态
    this.player.onGround = false
    this.ghostPlayers.forEach(ghost => {
      ghost.onGround = false
    })

    // 更新游戏对象与玩家的互动（碰撞检测等）
    this.gameObjects.forEach(obj => {
      obj.interactWithPlayer(this.player, this)
      this.ghostPlayers.forEach(ghost => obj.interactWithPlayer(ghost, this))
    })

    // 更新摄像机
    this.camera.update(dt)
  }

  /**
   * 渲染时间回溯预览画面
   */
  renderTimeTravelPreview(ctx, tmpctx) {
    const tick = Math.max(1, this.tick - 500)
    if (this.timeTravelCircleRadius === 0 || !this.#gameStateHistory.has(tick))
      return
    const targetState = this.#gameStateHistory.get(tick)

    const state = this.exportGameState()

    this.importGameState(targetState)

    // 清空预览画布
    tmpctx.clearRect(0, 0, this.displayWidth, this.displayHeight)
    tmpctx.save()

    // 应用相机变换
    tmpctx.scale(this.scale, this.scale)
    tmpctx.translate(-this.camera.position.x, -this.camera.position.y)

    // 绘制背景网格
    this.#renderBackgroundGrid(tmpctx)

    // 按优先级渲染游戏对象
    this.renderGroups.platforms.forEach(entity =>
      entity.render(tmpctx, this.scale)
    )
    this.renderGroups.collectibles.forEach(entity =>
      entity.render(tmpctx, this.scale)
    )
    this.renderGroups.enemies.forEach(entity =>
      entity.render(tmpctx, this.scale)
    )
    this.renderGroups.interactables.forEach(entity =>
      entity.render(tmpctx, this.scale)
    )

    // 渲染玩家
    this.ghostPlayers.forEach(ghost => ghost.render(tmpctx, this.scale))
    const ghost = new GhostPlayer()
    ghost.state = this.player.state
    ghost.render(tmpctx, this.scale)

    tmpctx.restore()

    this.importGameState(state)

    const playerScreenX =
      (this.player.r.x + this.player.width / 2 - this.camera.position.x) *
      this.scale
    const playerScreenY =
      (this.player.r.y + this.player.height / 2 - this.camera.position.y) *
      this.scale

    // 绘制预览画面
    ctx.save()
    ctx.beginPath()
    ctx.arc(
      playerScreenX,
      playerScreenY,
      this.timeTravelCircleRadius * this.scale,
      0,
      Math.PI * 2
    )
    ctx.clip()
    ctx.drawImage(tmpctx.canvas, 0, 0)
    ctx.restore()

    // 绘制圆圈边框
    ctx.save()
    ctx.strokeStyle = '#00ffff'
    ctx.lineWidth = 3
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.arc(
      playerScreenX,
      playerScreenY,
      this.timeTravelCircleRadius * this.scale,
      0,
      Math.PI * 2
    )
    ctx.stroke()
    ctx.restore()

    // 绘制提示文字
    const holdTime = performance.now() - this.timeTravelStartTime
    ctx.save()
    ctx.fillStyle = '#00ffff'
    ctx.font = '24px SourceHanSerifCN, serif, sans-serif'
    ctx.textAlign = 'center'

    if (holdTime < 1000) {
      const remainingTime = ((1000 - holdTime) / 1000).toFixed(1)
      ctx.fillText(
        `长按 ${this.timeTravelState}s 激活时间回溯`,
        this.displayWidth / 2,
        this.displayHeight - 100
      )
    } else {
      ctx.fillText(
        '时间回溯激活中...',
        this.displayWidth / 2,
        this.displayHeight - 100
      )
    }

    ctx.restore()
  }

  /**
   * 渲染游戏画面
   */
  render(ctx) {
    ctx.clearRect(0, 0, this.displayWidth, this.displayHeight)
    ctx.save()

    // 摄像机缩放
    ctx.scale(this.scale, this.scale)
    ctx.translate(-this.camera.position.x, -this.camera.position.y)

    // 绘制背景网格
    // this.#renderBackgroundGrid(ctx)

    // 按优先级渲染游戏对象
    this.renderGroups.platforms.forEach(entity =>
      entity.render(ctx, this.scale)
    )
    this.renderGroups.collectibles.forEach(entity =>
      entity.render(ctx, this.scale)
    )
    this.renderGroups.enemies.forEach(entity => entity.render(ctx, this.scale))
    this.renderGroups.interactables.forEach(entity =>
      entity.render(ctx, this.scale)
    )

    // 渲染玩家
    this.ghostPlayers.forEach(ghost => ghost.render(ctx, this.scale))
    this.player.render(ctx, this.scale)

    ctx.restore()

    this.#renderTimeline(ctx)

    // 调试数据
    // this.#renderDebugUI(ctx)
  }

  /**
   * 更新渲染组缓存
   */
  #updateRenderGroups() {
    this.renderGroups.platforms = this.gameObjects.filter(
      obj => obj.type === 'platform'
    )
    this.renderGroups.collectibles = this.gameObjects.filter(
      obj => obj.type === 'collectible'
    )
    this.renderGroups.enemies = this.gameObjects.filter(
      obj => obj.type === 'enemy'
    )
    this.renderGroups.interactables = this.gameObjects.filter(
      obj => obj.type === 'interactable'
    )
  }

  /**
   * 设置摄像机
   */
  #setupCamera() {
    // 计算摄像机视窗尺寸
    const cameraWidth =
      this.levelData.height * (this.displayWidth / this.displayHeight)

    // 设置摄像机参数
    this.camera.setViewportSize(cameraWidth, this.levelData.height)
    this.camera.target = this.player

    // 设置跟随边距（屏幕的1/4作为padding）
    const paddingX = cameraWidth * 0.25
    const paddingY = this.levelData.height * 0.25
    this.camera.setPadding(paddingX, paddingX, paddingY, paddingY)

    // 设置平滑跟随
    this.camera.smoothFactor = 0.08

    // 设置世界边界
    this.camera.setWorldBounds(
      0,
      0,
      this.levelData.width,
      this.levelData.height
    )

    // 立即居中到玩家
    this.camera.centerOnTarget()

    this.scale = this.displayHeight / this.levelData.height
  }

  /**
   * 渲染背景网格
   */
  #renderBackgroundGrid(ctx) {
    const viewport = this.camera.viewport
    const gridSize = GameConfig.GRID_SIZE

    ctx.strokeStyle = '#444'
    ctx.lineWidth = 1 / this.scale

    // 计算网格绘制范围（只绘制可见区域）
    const startX = Math.floor(viewport.x / gridSize) * gridSize
    const endX = Math.ceil((viewport.x + viewport.width) / gridSize) * gridSize
    const startY = Math.floor(viewport.y / gridSize) * gridSize
    const endY = Math.ceil((viewport.y + viewport.height) / gridSize) * gridSize

    // 绘制垂直线
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, startY)
      ctx.lineTo(x, endY)
      ctx.stroke()
    }

    // 绘制水平线
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(startX, y)
      ctx.lineTo(endX, y)
      ctx.stroke()
    }
  }

  /**
   * 渲染UI
   */
  #renderDebugUI(ctx) {
    // 渲染生命值、分数等UI元素
    ctx.fillStyle = '#fff'
    ctx.font = '40px SourceHanSerifCN, serif, sans-serif'
    ctx.fillText(`HP: ${this.player.health}`, 20, 10)
    ctx.fillText(`Score: ${this.player.score}`, 20, 50)
    ctx.font = '40px SourceHanSerifCN, serif, sans-serif'
    // 狼跳机制说明
    ctx.fillStyle = 'white'
    ctx.font = '28px SourceHanSerifCN, serif, sans-serif'
    ctx.fillText('狼跳机制:', 20, 100)
    ctx.fillText('• 土狼时间: 离开平台后0.15秒内仍可跳跃', 20, 140)
    ctx.fillText('• 二段跳: 空中可再跳1次', 20, 180)
    ctx.fillText('• 跳跃缓冲: 提前按跳跃键会在落地时自动跳跃', 20, 220)
    ctx.fillText('• 时间回溯: 长按R键3秒回到5秒前', 20, 260)

    // 当前状态指示
    if (this.player.coyoteTimer > 0 && !this.player.onGround) {
      ctx.fillStyle = 'orange'
      ctx.fillText('土狼时间', 20, 300)
    }
    if (this.player.jumpBufferTimer > 0) {
      ctx.fillStyle = 'cyan'
      ctx.fillText('跳跃缓冲', 20, 320)
    }
    if (this.player.airJumpsCount > 0) {
      ctx.fillStyle = 'lightblue'
      ctx.fillText(
        `已使用空中跳跃: ${this.player.airJumpsCount}/${this.player.maxAirJumps}`,
        20,
        340
      )
    }
    if (this.timeTravelState) {
      ctx.fillStyle = '#00ffff'
      ctx.fillText('时间回溯预览中...' + this.timeTravelState, 20, 360)
    }

    // 调试信息：摄像机状态
    ctx.fillStyle = '#888'
    ctx.font = '18px FiraCode, monospace'
    ctx.fillText(
      `Camera Height: ${this.displayHeight}px`,
      0,
      this.displayHeight - 20
    )
    ctx.fillText(
      `Camera Scale: ${this.scale.toFixed(2)}x`,
      0,
      this.displayHeight - 40
    )
    const viewport = this.camera.viewport
    ctx.fillText(
      `Viewport: ${viewport.width.toFixed(0)}x${viewport.height.toFixed(0)}`,
      0,
      this.displayHeight - 60
    )

    // 摄像机调试信息
    const info = this.camera.getDebugInfo()
    ctx.fillText(
      `Camera Pos: (${info.position.x}, ${info.position.y})`,
      0,
      this.displayHeight - 80
    )

    // 摄像机跟随边距
    ctx.save()
    ctx.strokeStyle = '#00FF00'
    ctx.lineWidth = 1
    ctx.strokeRect(
      Math.round(info.padding.left * this.scale),
      Math.round(info.padding.top * this.scale),
      Math.round(
        (viewport.width - info.padding.left - info.padding.right) * this.scale
      ),
      Math.round(
        (viewport.height - info.padding.top - info.padding.bottom) * this.scale
      )
    )
    ctx.restore()
  }

  /**
   * 渲染时间线（在时间回溯模式下）
   */
  #renderTimeline(ctx) {
    const timelineHeight = 60
    const timelineY = this.displayHeight - timelineHeight - 20
    const timelineX = 50
    const timelineWidth = this.displayWidth - 100

    ctx.save()

    // 绘制时间线背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(timelineX, timelineY, timelineWidth, timelineHeight)

    // 绘制时间线边框
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.strokeRect(timelineX, timelineY, timelineWidth, timelineHeight)

    // 计算刻度位置 - 当前tick固定在中心
    const centerX = timelineX + timelineWidth / 2
    const pixelsPerTick = timelineWidth / Math.max(this.maxTick, 100) // 最小显示100个tick的范围

    // 绘制主时间轴
    ctx.strokeStyle = '#888'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(timelineX, timelineY + timelineHeight / 2)
    ctx.lineTo(timelineX + timelineWidth, timelineY + timelineHeight / 2)
    ctx.stroke()

    // 绘制tick刻度
    for (let tick = 0; tick <= this.maxTick; tick++) {
      const x = centerX + (tick - this.tick) * pixelsPerTick

      if (x < timelineX || x > timelineX + timelineWidth) continue

      let tickHeight = 5
      let tickColor = '#666'

      // 特殊标记
      if (tick === 0) {
        tickHeight = 15
        tickColor = '#00ff00' // 绿色标记tick=0
      } else if (tick === this.maxTick) {
        tickHeight = 15
        tickColor = '#ff0000' // 红色标记最大tick
      } else if (tick % 10 === 0) {
        tickHeight = 10
        tickColor = '#aaa'
      }

      ctx.strokeStyle = tickColor
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, timelineY + timelineHeight / 2 - tickHeight / 2)
      ctx.lineTo(x, timelineY + timelineHeight / 2 + tickHeight / 2)
      ctx.stroke()

      // 绘制重要刻度的数字标签
      if (
        tick === 0 ||
        tick === this.maxTick ||
        (tick % 50 === 0 && tick > 0)
      ) {
        ctx.fillStyle = tickColor
        ctx.font = '12px FiraCode, monospace'
        ctx.textAlign = 'center'
        ctx.fillText(tick.toString(), x, timelineY + timelineHeight - 5)
      }
    }

    // 绘制当前位置指示器（固定在中心）
    ctx.fillStyle = '#ffff00'
    ctx.strokeStyle = '#ffaa00'
    ctx.lineWidth = 2
    ctx.beginPath()
    // 绘制一个三角形指示器
    ctx.moveTo(centerX, timelineY)
    ctx.lineTo(centerX - 8, timelineY - 10)
    ctx.lineTo(centerX + 8, timelineY - 10)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // 绘制当前tick的垂直线
    ctx.strokeStyle = '#ffff00'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(centerX, timelineY)
    ctx.lineTo(centerX, timelineY + timelineHeight)
    ctx.stroke()

    // 绘制ghost player存活时间范围
    this.ghostPlayers.forEach((ghost, index) => {
      if (!ghost.stateHistory) return

      // 获取ghost的存活时间范围
      const ghostTicks = Array.from(ghost.stateHistory.keys()).sort(
        (a, b) => a - b
      )
      if (ghostTicks.length === 0) return

      const startTick = ghostTicks[0]
      const endTick = ghostTicks[ghostTicks.length - 1]

      const startX = centerX + (startTick - this.tick) * pixelsPerTick
      const endX = centerX + (endTick - this.tick) * pixelsPerTick

      // 只绘制可见范围内的部分
      const visibleStartX = Math.max(startX, timelineX)
      const visibleEndX = Math.min(endX, timelineX + timelineWidth)

      if (visibleStartX < visibleEndX) {
        // 为每个ghost使用不同的颜色和位置
        const colors = [
          'rgba(100, 100, 255, 0.6)',
          'rgba(255, 100, 100, 0.6)',
          'rgba(100, 255, 100, 0.6)',
        ]
        const color = colors[index % colors.length]
        const barY = timelineY + 10 + index * 8
        const barHeight = 6

        ctx.fillStyle = color
        ctx.fillRect(
          visibleStartX,
          barY,
          visibleEndX - visibleStartX,
          barHeight
        )

        // 绘制边框
        ctx.strokeStyle = color.replace('0.6', '1.0')
        ctx.lineWidth = 1
        ctx.strokeRect(
          visibleStartX,
          barY,
          visibleEndX - visibleStartX,
          barHeight
        )

        // 在ghost存活范围的开始和结束位置绘制标记
        if (startX >= timelineX && startX <= timelineX + timelineWidth) {
          ctx.fillStyle = '#00ff00'
          ctx.fillRect(startX - 1, barY - 2, 2, barHeight + 4)
        }
        if (endX >= timelineX && endX <= timelineX + timelineWidth) {
          ctx.fillStyle = '#ff0000'
          ctx.fillRect(endX - 1, barY - 2, 2, barHeight + 4)
        }
      }
    })

    // 绘制时间线信息
    ctx.fillStyle = '#fff'
    ctx.font = '14px FiraCode, monospace'
    ctx.textAlign = 'left'
    ctx.fillText(
      `当前: ${this.tick}/${this.maxTick}`,
      timelineX + 5,
      timelineY - 5
    )

    // 绘制操作提示
    ctx.fillStyle = '#aaa'
    ctx.font = '12px FiraCode, monospace'
    ctx.textAlign = 'right'
    ctx.fillText(
      '← → 调整时间  R 退出回溯',
      timelineX + timelineWidth - 5,
      timelineY - 5
    )

    ctx.restore()
  }
}

export default new Game()
