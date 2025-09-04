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
  /** @type {HTMLCanvasElement} */
  canvas = document.getElementById('game-canvas')
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
  cameraScale

  // 时间回溯系统
  tick = 0
  maxTick
  #gameStateHistory = new Map()

  // 时间回溯视觉效果
  isTimeTravelPreview = false
  timeTravelCircleRadius = 0
  timeTravelStartTime = 0
  timeTravelMaxRadius = 0
  timeTravelTargetTick = 0
  timeTravelPreviewCanvas = null
  timeTravelPreviewCtx = null

  #keyboardListeners = []

  constructor() {
    /** @type {CanvasRenderingContext2D} */
    this.ctx = this.canvas.getContext('2d')

    // 创建时间回溯预览画布
    this.timeTravelPreviewCanvas = document.createElement('canvas')
    this.timeTravelPreviewCtx = this.timeTravelPreviewCanvas.getContext('2d')

    const resizeCanvas = () => {
      const main = document.querySelector('main')
      const { width, height } = main.getBoundingClientRect()

      const DPR = devicePixelRatio

      // 重置变换矩阵
      this.ctx.setTransform(1, 0, 0, 1, 0, 0)
      this.timeTravelPreviewCtx.setTransform(1, 0, 0, 1, 0, 0)

      this.canvas.width = this.displayWidth = width * DPR
      this.canvas.height = this.displayHeight = height * DPR

      // 同步预览画布尺寸
      this.timeTravelPreviewCanvas.width = this.displayWidth
      this.timeTravelPreviewCanvas.height = this.displayHeight

      // 应用DPR缩放
      this.ctx.scale(DPR, DPR)
      this.timeTravelPreviewCtx.scale(DPR, DPR)

      // 计算摄像机缩放（只有在关卡已加载时）
      if (this.levelHeight && this.displayHeight) {
        this.cameraScale = this.displayHeight / this.levelHeight

        // 如果摄像机已经存在，更新视窗尺寸
        if (this.camera) {
          const cameraWidth =
            this.levelHeight * (this.displayWidth / this.displayHeight)
          this.camera.setViewportSize(cameraWidth, this.levelHeight)
        }
      }

      this.ctx.imageSmoothingEnabled = false
      this.ctx.webkitImageSmoothingEnabled = false
      this.ctx.mozImageSmoothingEnabled = false
      this.ctx.msImageSmoothingEnabled = false
      this.ctx.textBaseline = 'top'
      this.ctx.textAlign = 'left'

      // 设置预览画布属性
      this.timeTravelPreviewCtx.imageSmoothingEnabled = false
      this.timeTravelPreviewCtx.webkitImageSmoothingEnabled = false
      this.timeTravelPreviewCtx.mozImageSmoothingEnabled = false
      this.timeTravelPreviewCtx.msImageSmoothingEnabled = false
      this.timeTravelPreviewCtx.textBaseline = 'top'
      this.timeTravelPreviewCtx.textAlign = 'left'
    }

    resizeCanvas()
    addEventListener('resize', throttle(resizeCanvas, 16))

    this.canvas.classList.add('hidden')
  }

  #addKeyboardListeners() {
    this.#keyboardListeners.push(
      Keyboard.onKeydown(['E'], async () => {
        if (!this.isRunning) return
        this.player.inputQueue.push('keydown:interact')
      }),
      Keyboard.onKeydown(['Esc'], () => {
        if (!this.isRunning) return
        this.pause()
      }),
      Keyboard.onKeydown(['W', 'Up', 'Space'], () => {
        if (!this.isRunning) return
        this.player.inputQueue.push('keydown:jump')
      }),
      Keyboard.onKeyup(['W', 'Up', 'Space'], () => {
        if (!this.isRunning) return
        this.player.inputQueue.push('keyup:jump')
      }),

      Keyboard.onKeydown(['R'], () => this.startTimeTravelPreview()),
      Keyboard.onKeyup(['R'], () => this.endTimeTravelPreview())
    )
  }

  #removeKeyboardListeners() {
    this.#keyboardListeners.forEach(removeListener => removeListener())
    this.#keyboardListeners = []
  }

  /**
   * 加载关卡数据
   */
  loadLevel(levelId) {
    this.tick = 0
    this.maxTick = 0
    this.gameObjects = []
    this.#gameStateHistory = new Map()

    if (!Asset.has(`level/${levelId}`)) {
      console.error(`[Game2D] (loadLevel) 关卡 ${levelId} 不存在！`)
      return
    }

    this.levelData = Asset.get(`level/${levelId}`)

    this.tileHeight = this.levelData.height
    this.tileWidth = this.levelData.width
    this.levelHeight = this.levelData.height * 8
    this.levelWidth = this.levelData.width * 8

    // 创建玩家
    this.player = new Player(
      this.levelData.spawnpoint.x,
      this.levelData.spawnpoint.y
    )

    this.ghostPlayers = []

    // 添加平台到游戏对象数组
    this.gameObjects.push(
      // 边界平台
      new Platform(0, this.levelHeight - 8, this.levelWidth, 8), // 地面
      new Platform(0, 0, this.levelWidth, 8), // 天花板
      new Platform(0, 0, 8, this.levelHeight), // 左墙
      new Platform(this.levelWidth - 8, 0, 8, this.levelHeight), // 右墙

      // 游戏内容平台 - 创建多层结构
      new Platform(80, 152, 200, 16), // 起始平台
      new Platform(150, 120, 80, 16), // 中层平台1
      new Platform(280, 100, 100, 16), // 中层平台2
      new Platform(420, 80, 80, 16), // 中层平台3
      new Platform(200, 60, 120, 16), // 高层平台1
      new Platform(350, 40, 100, 16), // 高层平台2
      new Platform(480, 140, 60, 16), // 跳跃挑战平台1
      new Platform(560, 110, 60, 16), // 跳跃挑战平台2
      new Platform(this.levelWidth - 200, 100, 150, 16) // 终点平台
    )

    // 添加收集品 - 分布在各个位置
    this.gameObjects.push(
      // 起始区域收集品
      new Collectible(120, 130),
      new Collectible(200, 130),
      new Collectible(250, 130),

      // 中层收集品
      new Collectible(180, 98),
      new Collectible(320, 78),
      new Collectible(450, 58),

      // 高层收集品
      new Collectible(240, 38),
      new Collectible(380, 18),

      // 挑战区域收集品
      new Collectible(510, 118),
      new Collectible(590, 88),

      // 终点区域收集品
      new Collectible(this.levelWidth - 150, 78),
      new Collectible(this.levelWidth - 100, 78),

      // 空中悬浮收集品（需要跳跃技巧）
      new Collectible(340, 60),
      new Collectible(480, 20)
    )

    // 添加敌人 - 在各个平台上巡逻
    this.gameObjects.push(
      // 起始区域敌人（简单）
      new Enemy(20, 150),

      // 中层敌人
      new Enemy(300, 75),
      new Enemy(440, 55),

      // 挑战区域敌人
      new Enemy(500, 115),
      new Enemy(570, 85),

      // 终点前的守卫敌人
      new Enemy(this.levelWidth - 180, 75)
    )

    // 添加可交互对象 - NPC和提示牌
    this.gameObjects.push(
      // 起始NPC - 教学提示
      new Interactable(14, 160, 'level1_start', '按E交互'),

      // 中途NPC - 游戏提示
      new Interactable(320, 160, 'level1_npc', '妈妈生的'),
      new Interactable(36, 160, 'test_scene', 'test'),

      // 终点NPC - 关卡完成
      new Interactable(this.levelWidth - 60, 75, 'level1_end', '恭喜通关！')
    )

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
    const gameState = this.exportGameState()
    // 添加玩家状态
    gameState.push({
      ...this.player.state,
      type: 'player',
    })

    this.#gameStateHistory.set(this.tick, gameState)
    this.#gameStateHistory.delete(
      this.tick - GameConfig.MAX_TIME_TRAVEL_DISTANCE
    )
  }

  /**
   * 开始时间回溯预览
   */
  startTimeTravelPreview() {
    if (!this.isRunning || this.isTimeTraveling || !this.cameraScale) return

    this.isTimeTravelPreview = true
    this.timeTravelStartTime = Date.now()
    this.timeTravelCircleRadius = 0

    // 计算最大圆圈半径（对角线的一半）
    this.timeTravelMaxRadius =
      Math.sqrt(
        Math.pow(this.displayWidth / 2, 2) + Math.pow(this.displayHeight / 2, 2)
      ) / this.cameraScale

    // 计算目标tick（5秒前，即5000tick前）
    this.timeTravelTargetTick = Math.max(0, this.tick - 500)
  }

  /**
   * 结束时间回溯预览
   */
  endTimeTravelPreview() {
    if (!this.isTimeTravelPreview) return

    const holdTime = Date.now() - this.timeTravelStartTime

    if (holdTime >= 3000) {
      // 长按超过3秒，触发时间回溯
      this.executeTimeTravel()
    } else {
      // 快速松开，圆圈缩小消失
      this.isTimeTravelPreview = false
      this.timeTravelCircleRadius = 0
    }
  }

  /**
   * 执行时间回溯
   */
  executeTimeTravel() {
    const targetState = this.#gameStateHistory.get(this.timeTravelTargetTick)
    if (!targetState) {
      console.warn(`[Game2D] 无法找到tick ${this.timeTravelTargetTick} 的状态`)
      this.isTimeTravelPreview = false
      return
    }

    // 创建ghost player
    const ghost = new GhostPlayer()
    ghost.state = this.player.state
    ghost.stateHistory = this.player.stateHistory
    this.ghostPlayers.push(ghost)

    // 分离玩家状态和游戏对象状态
    const playerState = targetState.find(state => state.type === 'player')
    const gameObjectStates = targetState.filter(
      state => state.type !== 'player'
    )

    // 回溯游戏对象状态
    this.importGameState(gameObjectStates)
    this.tick = this.timeTravelTargetTick

    // 重新创建玩家并设置状态
    if (playerState) {
      this.player.r.x = playerState.rx || this.levelData.spawnpoint.x
      this.player.r.y = playerState.ry || this.levelData.spawnpoint.y
      this.player.v.x = playerState.vx || 0
      this.player.v.y = playerState.vy || 0
      this.player.health = playerState.health || this.player.health
      this.player.score = playerState.score || this.player.score
    } else {
      // 如果没有找到玩家状态，重置到初始位置
      this.player.r.x = this.levelData.spawnpoint.x
      this.player.r.y = this.levelData.spawnpoint.y
      this.player.v.x = 0
      this.player.v.y = 0
    }

    // 重置预览状态
    this.isTimeTravelPreview = false
    this.timeTravelCircleRadius = 0
  }

  /**
   * 时间回溯
   */
  toggleTimeTravelMode() {
    this.pause()
    this.isTimeTraveling = !this.isTimeTraveling

    if (this.isTimeTraveling) {
      const state = this.player.state

      const ghost = new GhostPlayer()
      ghost.state = state
      ghost.stateHistory = this.player.stateHistory
      this.ghostPlayers.push(ghost)

      this.player = new Player()
      this.player.state = state
    } else {
      // 回溯完成
    }
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
      this.render()
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
    if (this.isTimeTraveling) {
      const tick = Math.max(0, this.tick - 5 * 100)

      const targetState = this.#gameStateHistory.get(tick)
      this.importGameState(targetState)
      this.ghostPlayers.forEach(ghost => {
        if (ghost.stateHistory.has(this.tick))
          ghost.state = ghost.stateHistory.get(this.tick)
        else ghost.removed = true
      })

      this.isTimeTraveling = false
    }

    // 更新时间回溯预览效果
    if (this.isTimeTravelPreview) {
      const holdTime = Date.now() - this.timeTravelStartTime

      if (holdTime >= 3000) {
        // 长按超过3秒，圆圈快速扩大到无穷大
        this.timeTravelCircleRadius = Math.min(
          this.timeTravelCircleRadius + this.timeTravelMaxRadius * dt * 10,
          this.timeTravelMaxRadius * 2
        )
      } else {
        // 圆圈缓缓增大
        const progress = holdTime / 3000
        this.timeTravelCircleRadius = this.timeTravelMaxRadius * 0.1 * progress
      }

      // 只在有历史状态时渲染预览画面
      if (this.#gameStateHistory.has(this.timeTravelTargetTick)) {
        this.renderTimeTravelPreview()
      }
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
      if (this.player.r.x + this.player.width > this.levelWidth) {
        this.player.r.x = this.levelWidth - this.player.width
        this.player.v.x = 0
      }
      // 上
      if (this.player.r.y < 0) {
        this.player.r.y = 0
        this.player.v.y = 0
      }
      // 下
      if (this.player.r.y > this.levelHeight) {
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
  renderTimeTravelPreview() {
    const targetState = this.#gameStateHistory.get(this.timeTravelTargetTick)
    if (!targetState) return

    // 清空预览画布
    this.timeTravelPreviewCtx.clearRect(
      0,
      0,
      this.displayWidth,
      this.displayHeight
    )
    this.timeTravelPreviewCtx.save()

    // 应用相机变换
    this.timeTravelPreviewCtx.scale(this.cameraScale, this.cameraScale)
    this.timeTravelPreviewCtx.translate(
      -this.camera.position.x,
      -this.camera.position.y
    )

    // 临时保存当前状态
    const currentGameObjects = [...this.gameObjects]
    const currentRenderGroups = { ...this.renderGroups }

    try {
      // 分离玩家状态和游戏对象状态
      const playerState = targetState.find(state => state.type === 'player')
      const gameObjectStates = targetState.filter(
        state => state.type !== 'player'
      )

      // 临时加载目标状态
      this.importGameState(gameObjectStates)

      // 渲染目标状态的游戏画面
      this.#renderBackgroundGrid(this.timeTravelPreviewCtx)

      // 渲染游戏对象
      this.renderGroups.platforms.forEach(entity =>
        entity.render(this.timeTravelPreviewCtx, this.cameraScale)
      )
      this.renderGroups.collectibles.forEach(entity =>
        entity.render(this.timeTravelPreviewCtx, this.cameraScale)
      )
      this.renderGroups.enemies.forEach(entity =>
        entity.render(this.timeTravelPreviewCtx, this.cameraScale)
      )
      this.renderGroups.interactables.forEach(entity =>
        entity.render(this.timeTravelPreviewCtx, this.cameraScale)
      )

      // 渲染目标状态的玩家（简单绘制一个矩形代表玩家）
      if (playerState) {
        this.timeTravelPreviewCtx.fillStyle = 'rgba(0, 255, 255, 0.8)'
        this.timeTravelPreviewCtx.fillRect(
          playerState.rx || this.levelData.spawnpoint.x,
          playerState.ry || this.levelData.spawnpoint.y,
          16, // 玩家宽度
          16 // 玩家高度
        )
      }
    } catch (error) {
      console.warn('[Game2D] 渲染时间回溯预览时出错:', error)
    } finally {
      // 恢复当前状态
      this.gameObjects = currentGameObjects
      this.renderGroups = currentRenderGroups
      this.timeTravelPreviewCtx.restore()
    }
  }

  /**
   * 渲染游戏画面
   */
  render() {
    this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight)

    // 如果摄像机还没有设置，显示加载信息
    if (!this.cameraScale || !this.camera || !this.player) {
      this.ctx.fillStyle = '#fff'
      this.ctx.font = '32px SourceHanSerifCN, serif, sans-serif'
      this.ctx.textAlign = 'center'
      this.ctx.fillText(
        '游戏加载中...',
        this.displayWidth / 2 / devicePixelRatio,
        this.displayHeight / 2 / devicePixelRatio
      )
      return
    }

    this.ctx.save()

    // 摄像机缩放
    this.ctx.scale(this.cameraScale, this.cameraScale)
    this.ctx.translate(-this.camera.position.x, -this.camera.position.y)

    // 绘制背景网格
    this.#renderBackgroundGrid()

    // 按优先级渲染游戏对象
    this.renderGroups.platforms.forEach(entity =>
      entity.render(this.ctx, this.cameraScale)
    )
    this.renderGroups.collectibles.forEach(entity =>
      entity.render(this.ctx, this.cameraScale)
    )
    this.renderGroups.enemies.forEach(entity =>
      entity.render(this.ctx, this.cameraScale)
    )
    this.renderGroups.interactables.forEach(entity =>
      entity.render(this.ctx, this.cameraScale)
    )

    // 渲染玩家
    this.ghostPlayers.forEach(ghost => ghost.render(this.ctx, this.cameraScale))
    this.player.render(this.ctx, this.cameraScale)

    this.ctx.restore()

    // 渲染时间回溯圆圈效果
    if (this.isTimeTravelPreview && this.timeTravelCircleRadius > 0) {
      this.#renderTimeTravelCircle()
    }

    this.#renderTimeline()

    // 调试数据
    this.#renderDebugUI()
  }

  /**
   * 渲染时间回溯圆圈效果
   */
  #renderTimeTravelCircle() {
    // 确保必要的对象存在
    if (!this.player || !this.camera || !this.cameraScale) return

    this.ctx.save()

    // 计算玩家在屏幕上的位置
    const playerScreenX =
      (this.player.r.x - this.camera.position.x) * this.cameraScale
    const playerScreenY =
      (this.player.r.y - this.camera.position.y) * this.cameraScale

    // 创建圆形蒙版
    this.ctx.globalCompositeOperation = 'source-over'

    // 绘制预览画面到圆形区域
    if (this.timeTravelPreviewCanvas) {
      // 创建圆形裁剪路径
      this.ctx.beginPath()
      this.ctx.arc(
        playerScreenX,
        playerScreenY,
        this.timeTravelCircleRadius * this.cameraScale,
        0,
        Math.PI * 2
      )
      this.ctx.clip()

      // 绘制预览画面
      this.ctx.drawImage(this.timeTravelPreviewCanvas, 0, 0)
    }

    this.ctx.restore()

    // 绘制圆圈边框
    this.ctx.save()
    this.ctx.strokeStyle = '#00ffff'
    this.ctx.lineWidth = 3
    this.ctx.setLineDash([5, 5])
    this.ctx.beginPath()
    this.ctx.arc(
      playerScreenX,
      playerScreenY,
      this.timeTravelCircleRadius * this.cameraScale,
      0,
      Math.PI * 2
    )
    this.ctx.stroke()
    this.ctx.restore()

    // 绘制提示文字
    const holdTime = Date.now() - this.timeTravelStartTime
    this.ctx.save()
    this.ctx.fillStyle = '#00ffff'
    this.ctx.font = '24px SourceHanSerifCN, serif, sans-serif'
    this.ctx.textAlign = 'center'

    if (holdTime < 3000) {
      const remainingTime = ((3000 - holdTime) / 1000).toFixed(1)
      this.ctx.fillText(
        `长按 ${remainingTime}s 激活时间回溯`,
        this.displayWidth / 2,
        this.displayHeight - 100
      )
    } else {
      this.ctx.fillText(
        '时间回溯激活中...',
        this.displayWidth / 2,
        this.displayHeight - 100
      )
    }

    this.ctx.restore()
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
      this.levelHeight * (this.displayWidth / this.displayHeight)

    // 设置摄像机参数
    this.camera.setViewportSize(cameraWidth, this.levelHeight)
    this.camera.target = this.player

    // 设置跟随边距（屏幕的1/4作为padding）
    const paddingX = cameraWidth * 0.25
    const paddingY = this.levelHeight * 0.25
    this.camera.setPadding(paddingX, paddingX, paddingY, paddingY)

    // 设置平滑跟随
    this.camera.smoothFactor = 0.08

    // 设置世界边界
    this.camera.setWorldBounds(0, 0, this.levelWidth, this.levelHeight)

    // 立即居中到玩家
    this.camera.centerOnTarget()

    this.cameraScale = this.displayHeight / this.levelHeight
  }

  /**
   * 渲染背景网格
   */
  #renderBackgroundGrid(ctx = this.ctx) {
    const viewport = this.camera.viewport
    const gridSize = GameConfig.GRID_SIZE

    ctx.strokeStyle = '#444'
    ctx.lineWidth = 1 / this.cameraScale

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
  #renderDebugUI() {
    // 如果玩家还不存在，不渲染调试UI
    if (!this.player) return

    // 渲染生命值、分数等UI元素
    this.ctx.fillStyle = '#fff'
    this.ctx.font = '40px SourceHanSerifCN, serif, sans-serif'
    this.ctx.fillText(`HP: ${this.player.health}`, 20, 10)
    this.ctx.fillText(`Score: ${this.player.score}`, 20, 50)
    this.ctx.font = '40px SourceHanSerifCN, serif, sans-serif'
    // 狼跳机制说明
    this.ctx.fillStyle = 'white'
    this.ctx.font = '28px SourceHanSerifCN, serif, sans-serif'
    this.ctx.fillText('狼跳机制:', 20, 100)
    this.ctx.fillText('• 土狼时间: 离开平台后0.15秒内仍可跳跃', 20, 140)
    this.ctx.fillText('• 二段跳: 空中可再跳1次', 20, 180)
    this.ctx.fillText('• 跳跃缓冲: 提前按跳跃键会在落地时自动跳跃', 20, 220)
    this.ctx.fillText('• 时间回溯: 长按R键3秒回到5秒前', 20, 260)

    // 当前状态指示
    if (this.player.coyoteTimer > 0 && !this.player.onGround) {
      this.ctx.fillStyle = 'orange'
      this.ctx.fillText('土狼时间', 20, 300)
    }
    if (this.player.jumpBufferTimer > 0) {
      this.ctx.fillStyle = 'cyan'
      this.ctx.fillText('跳跃缓冲', 20, 320)
    }
    if (this.player.airJumpsCount > 0) {
      this.ctx.fillStyle = 'lightblue'
      this.ctx.fillText(
        `已使用空中跳跃: ${this.player.airJumpsCount}/${this.player.maxAirJumps}`,
        20,
        340
      )
    }
    if (this.isTimeTravelPreview) {
      this.ctx.fillStyle = '#00ffff'
      this.ctx.fillText('时间回溯预览中...', 20, 360)
    }

    // 调试信息：摄像机状态
    this.ctx.fillStyle = '#888'
    this.ctx.font = '18px FiraCode, monospace'
    this.ctx.fillText(
      `Camera Height: ${this.displayHeight}px`,
      0,
      this.displayHeight - 20
    )
    this.ctx.fillText(
      `Camera Scale: ${this.cameraScale.toFixed(2)}x`,
      0,
      this.displayHeight - 40
    )
    const viewport = this.camera.viewport
    this.ctx.fillText(
      `Viewport: ${viewport.width.toFixed(0)}x${viewport.height.toFixed(0)}`,
      0,
      this.displayHeight - 60
    )

    // 摄像机调试信息
    const info = this.camera.getDebugInfo()
    this.ctx.fillText(
      `Camera Pos: (${info.position.x}, ${info.position.y})`,
      0,
      this.displayHeight - 80
    )

    // 摄像机跟随边距
    this.ctx.save()
    this.ctx.strokeStyle = '#00FF00'
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(
      Math.round(info.padding.left * this.cameraScale),
      Math.round(info.padding.top * this.cameraScale),
      Math.round(
        (viewport.width - info.padding.left - info.padding.right) *
          this.cameraScale
      ),
      Math.round(
        (viewport.height - info.padding.top - info.padding.bottom) *
          this.cameraScale
      )
    )
    this.ctx.restore()
  }

  /**
   * 渲染时间线（在时间回溯模式下）
   */
  #renderTimeline() {
    const timelineHeight = 60
    const timelineY = this.displayHeight - timelineHeight - 20
    const timelineX = 50
    const timelineWidth = this.displayWidth - 100

    this.ctx.save()

    // 绘制时间线背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    this.ctx.fillRect(timelineX, timelineY, timelineWidth, timelineHeight)

    // 绘制时间线边框
    this.ctx.strokeStyle = '#fff'
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(timelineX, timelineY, timelineWidth, timelineHeight)

    // 计算刻度位置 - 当前tick固定在中心
    const centerX = timelineX + timelineWidth / 2
    const pixelsPerTick = timelineWidth / Math.max(this.maxTick, 100) // 最小显示100个tick的范围

    // 绘制主时间轴
    this.ctx.strokeStyle = '#888'
    this.ctx.lineWidth = 1
    this.ctx.beginPath()
    this.ctx.moveTo(timelineX, timelineY + timelineHeight / 2)
    this.ctx.lineTo(timelineX + timelineWidth, timelineY + timelineHeight / 2)
    this.ctx.stroke()

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

      this.ctx.strokeStyle = tickColor
      this.ctx.lineWidth = 1
      this.ctx.beginPath()
      this.ctx.moveTo(x, timelineY + timelineHeight / 2 - tickHeight / 2)
      this.ctx.lineTo(x, timelineY + timelineHeight / 2 + tickHeight / 2)
      this.ctx.stroke()

      // 绘制重要刻度的数字标签
      if (
        tick === 0 ||
        tick === this.maxTick ||
        (tick % 50 === 0 && tick > 0)
      ) {
        this.ctx.fillStyle = tickColor
        this.ctx.font = '12px FiraCode, monospace'
        this.ctx.textAlign = 'center'
        this.ctx.fillText(tick.toString(), x, timelineY + timelineHeight - 5)
      }
    }

    // 绘制当前位置指示器（固定在中心）
    this.ctx.fillStyle = '#ffff00'
    this.ctx.strokeStyle = '#ffaa00'
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    // 绘制一个三角形指示器
    this.ctx.moveTo(centerX, timelineY)
    this.ctx.lineTo(centerX - 8, timelineY - 10)
    this.ctx.lineTo(centerX + 8, timelineY - 10)
    this.ctx.closePath()
    this.ctx.fill()
    this.ctx.stroke()

    // 绘制当前tick的垂直线
    this.ctx.strokeStyle = '#ffff00'
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    this.ctx.moveTo(centerX, timelineY)
    this.ctx.lineTo(centerX, timelineY + timelineHeight)
    this.ctx.stroke()

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

        this.ctx.fillStyle = color
        this.ctx.fillRect(
          visibleStartX,
          barY,
          visibleEndX - visibleStartX,
          barHeight
        )

        // 绘制边框
        this.ctx.strokeStyle = color.replace('0.6', '1.0')
        this.ctx.lineWidth = 1
        this.ctx.strokeRect(
          visibleStartX,
          barY,
          visibleEndX - visibleStartX,
          barHeight
        )

        // 在ghost存活范围的开始和结束位置绘制标记
        if (startX >= timelineX && startX <= timelineX + timelineWidth) {
          this.ctx.fillStyle = '#00ff00'
          this.ctx.fillRect(startX - 1, barY - 2, 2, barHeight + 4)
        }
        if (endX >= timelineX && endX <= timelineX + timelineWidth) {
          this.ctx.fillStyle = '#ff0000'
          this.ctx.fillRect(endX - 1, barY - 2, 2, barHeight + 4)
        }
      }
    })

    // 绘制时间线信息
    this.ctx.fillStyle = '#fff'
    this.ctx.font = '14px FiraCode, monospace'
    this.ctx.textAlign = 'left'
    this.ctx.fillText(
      `当前: ${this.tick}/${this.maxTick}`,
      timelineX + 5,
      timelineY - 5
    )

    // 绘制操作提示
    this.ctx.fillStyle = '#aaa'
    this.ctx.font = '12px FiraCode, monospace'
    this.ctx.textAlign = 'right'
    this.ctx.fillText(
      '← → 调整时间  R 退出回溯',
      timelineX + timelineWidth - 5,
      timelineY - 5
    )

    this.ctx.restore()
  }
}

export default new Game()
