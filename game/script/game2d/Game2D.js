import { EventListener } from '../utils.js'
import { Camera } from './Camera.js'
import Keyboard from '../Keyboard.js'
import SoundManager from '../SoundManager.js'
import PauseManager from '../PauseManager.js'
import * as GameObjects from './gameObject/index.js'
import * as GameConfig from './GameConfig.js'
import * as Levels from './level/index.js'
import TimeTravel from './TimeTravel.js'
import Dialogue from '../Dialogue.js'
import Asset from '../Asset.js'
import { InputEnum } from './gameObject/Player.js'

export class Game {
  listener = new EventListener()

  // 游戏对象
  /** @type {GameObjects.Player} */
  player = null
  /** @type {GameObjects.GhostPlayer[]} */
  ghostPlayers = []
  /** @type {GameObjects.BaseObject[]} */
  gameObjects = []

  // 渲染缓存（避免每帧重复过滤）
  renderGroups = {
    platforms: [],
    movingPlatforms: [],
    collectibles: [],
    enemies: [],
    interactables: [],
  }
  #ref = new Map()

  // 游戏状态
  isRunning = false
  camera = new Camera()
  scale

  // 时间回溯系统
  tick = 0
  maxTick = null
  history = new Map()

  // 关卡过渡效果
  isTransitioning = false
  transitionOpacity = 0
  transitionStartTime = 0

  #keyboardListeners = []

  sound = SoundManager

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
    this.tmpctx = this.canvas2.getContext('2d')

    const resizeCanvas = () => {
      const { width, height } = main.getBoundingClientRect()

      const DPR = devicePixelRatio

      // 应用DPR缩放
      this.ctx.scale(DPR, DPR)
      this.tmpctx.scale(DPR, DPR)

      this.canvas.width = this.displayWidth = width * DPR
      this.canvas.height = this.displayHeight = height * DPR

      if (this.isRunning)
        this.scale = this.displayHeight / this.camera.viewport.height

      // 同步预览画布尺寸
      this.canvas2.width = this.displayWidth
      this.canvas2.height = this.displayHeight

      this.ctx.imageSmoothingEnabled = false
      this.ctx.webkitImageSmoothingEnabled = false
      this.ctx.mozImageSmoothingEnabled = false
      this.ctx.msImageSmoothingEnabled = false
      this.ctx.textBaseline = 'top'
      this.ctx.textAlign = 'left'

      this.tmpctx.imageSmoothingEnabled = false
      this.tmpctx.webkitImageSmoothingEnabled = false
      this.tmpctx.mozImageSmoothingEnabled = false
      this.tmpctx.msImageSmoothingEnabled = false
      this.tmpctx.textBaseline = 'top'
      this.tmpctx.textAlign = 'left'
    }

    resizeCanvas()
    addEventListener('resize', resizeCanvas, 16)

    this.canvas.classList.add('hidden')

    this.$backgroundImage = document.getElementById('game2d-background')

    PauseManager.game = this
    PauseManager.on('pause', () => {
      this.isRunning = false
      this.#removeKeyboardListeners()
    })
    PauseManager.on('resume', () => {
      this.isRunning = true
      setTimeout(() => this.#addKeyboardListeners(), 0)
    })
    TimeTravel.game = this

    addEventListener('beforeunload', event => {
      // if (!this.onSavedExit) event.preventDefault()
    })
  }

  #addKeyboardListeners() {
    this.#keyboardListeners.push(
      Keyboard.onKeydown(['E'], async () => {
        this.player.inputState |= InputEnum.INTERACT
      }),
      Keyboard.onKeydown(['Esc'], () => {
        PauseManager.pause()
      }),
      Keyboard.onKeydown('Space', () => {
        this.player.inputState |= InputEnum.JUMP_DOWN
      }),
      Keyboard.onKeyup('Space', () => {
        this.player.inputState |= InputEnum.JUMP_UP
      }),

      Keyboard.onKeydown(['R'], () => {
        TimeTravel.startTimeTravelPreview(this)
      }),
      Keyboard.onKeyup(['R'], () => {
        TimeTravel.endTimeTravelPreview(this)
      })
    )
  }

  #removeKeyboardListeners() {
    this.#keyboardListeners.forEach(removeListener => removeListener())
    this.#keyboardListeners = []
  }

  importGameObjects(state) {
    this.gameObjects = state.map(state => {
      const entity = new GameObjects[state.type]()
      entity.state = state
      return entity
    })

    // 更新渲染组
    this.#updateRenderGroups()
  }

  exportGameObjects() {
    return this.gameObjects.map(obj => obj.state)
  }

  ref(name) {
    return this.#ref.get(name)
  }

  /**
   * 加载关卡数据
   */
  loadLevel(setupFunction) {
    this.tick = 0
    this.maxTick = 0
    this.gameObjects = []
    this.history = new Map()
    this.ghostPlayers = []

    setupFunction?.(this)
    this.levelData.name = setupFunction?.name
    this.player = new GameObjects.Player(
      this.levelData.spawnpoint.x,
      this.levelData.spawnpoint.y
    )
    this.#setupCamera()

    if (this.levelData.background) {
      this.$backgroundImage.src = Asset.get(
        `background/${this.levelData.background}`
      ).src
    }
  }

  async start(initial = false) {
    // 初始提示
    if (!localStorage.getItem('rewind-pearl-showhelp')) {
      PauseManager.showHelp()
      localStorage.setItem('rewind-pearl-showhelp', 'true')
    }
    // 进入关卡对话
    if (this.levelData?.introDialogue) {
      await Dialogue.play(this.levelData.introDialogue)
      this.levelData.introDialogue = null
    }
    if (initial) this.fadeBlack(true)

    this.canvas.classList.remove('hidden')

    this.isRunning = true
    this.#addKeyboardListeners()

    // Update Loop
    this.updateIntervalHandler = setInterval(() => {
      this.update(GameConfig.UPDATE_INTERVAL / 1000)
    }, GameConfig.UPDATE_INTERVAL)

    // Render Loop
    const renderLoop = () => {
      this.animationFrameHandler = requestAnimationFrame(renderLoop)
      if (PauseManager.isPaused) return
      this.render(this.ctx)
      TimeTravel.render(this)

      // this.#renderTimeline(this.ctx)
      // 渲染关卡过渡效果
      if (this.transitionOpacity) {
        this.ctx.fillStyle = `rgba(0, 0, 0, ${this.transitionOpacity})`
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight)
      }
    }
    renderLoop()

    // 初始化渲染组
    this.#updateRenderGroups()
  }

  stop() {
    this.isRunning = false
    this.#removeKeyboardListeners()
    clearInterval(this.updateIntervalHandler)
    cancelAnimationFrame(this.animationFrameHandler)
  }

  async changeLevel(targetLevel) {
    if (this.isTransitioning) return
    this.isTransitioning = true

    await this.fadeBlack()
    this.stop()
    this.loadLevel(Levels[targetLevel])
    await this.start(true)
    await this.fadeBlack(true)

    this.isTransitioning = false
  }

  fadeBlack(reverse = false) {
    this.transitionStartTime = performance.now()
    if (reverse) this.$backgroundImage.classList.remove('hidden')
    else this.$backgroundImage.classList.add('hidden')
    return new Promise(resolve => {
      const checkTransition = () => {
        const k = 1
        const elapsed =
          (performance.now() - this.transitionStartTime) /
          GameConfig.TRANSITION_DURATION
        this.transitionOpacity = Math.min(
          (reverse ? 1 - elapsed : elapsed) * k,
          1
        )
        if (elapsed >= 1) resolve()
        else requestAnimationFrame(checkTransition)
      }
      checkTransition()
    })
  }

  loadGame({ levelData, gameObjects, player }) {
    this.stop()

    const levelName = levelData.name || 'Level1'

    this.loadLevel(Levels[levelName])
    this.levelData.introDialogue = levelData.introDialogue

    this.player.state = player

    this.tick = 0
    this.maxTick = 0
    this.importGameObjects(gameObjects)

    this.start(true)
  }

  saveGame(name = '未命名存档', autosave = false) {
    const currentUser = localStorage.getItem('rewind-pearl-username')
    if (!currentUser) {
      console.error('没有登录用户，无法保存游戏')
      this.showNotification('保存失败：玩家未登录', false)
      return false
    }

    const gameState = {
      timestamp: Date.now(),
      player: this.player?.state || {},
      gameObjects: this.exportGameObjects(),
      levelData: this.levelData,
    }

    if (autosave) {
      localStorage.setItem(
        'rewind-pearl-autosave-' + currentUser,
        JSON.stringify(gameState)
      )
    } else {
      const savingsData = localStorage.getItem('rewind-pearl-savings')
      const savings = savingsData ? JSON.parse(savingsData) : {}

      if (!savings[currentUser]) {
        savings[currentUser] = []
      }
      // 查找是否已存在同名存档
      const existingIndex = savings[currentUser].findIndex(
        save => save.name === name
      )

      const saveData = {
        name,
        autosave,
        data: gameState,
      }

      if (existingIndex >= 0) {
        // 覆盖现有存档
        savings[currentUser][existingIndex] = saveData
      } else {
        // 添加新存档
        savings[currentUser].unshift(saveData)
      }

      localStorage.setItem('rewind-pearl-savings', JSON.stringify(savings))
    }

    this.showNotification('游戏已保存', true)
    return true
  }

  showNotification(message, success = true) {
    const notification = document.createElement('div')
    notification.classList.add('save-notification')

    const textElement = document.createElement('span')
    textElement.classList.add('save-text')
    textElement.textContent = message
    notification.appendChild(textElement)

    const iconElement = document.createElement('span')
    iconElement.classList.add('save-icon')
    iconElement.textContent = success ? '💾' : '❌'
    notification.appendChild(iconElement)

    const main = document.querySelector('main')
    main.appendChild(notification)

    notification.style.borderColor = success ? '#4a9eff' : '#ff4a4a'

    setTimeout(() => notification.classList.add('show'), 0)
    setTimeout(() => notification.classList.remove('show'), 3000)
    setTimeout(() => notification.remove(), 4000)
  }

  /**
   * 更新游戏逻辑
   */
  async update(dt) {
    if (PauseManager.isPaused) return

    TimeTravel.update(dt)

    if (!this.isRunning || TimeTravel.state !== null) return

    this.tick++
    this.maxTick = Math.max(this.maxTick, this.tick)
    this.history.set(this.tick, this.exportGameObjects())
    this.history.delete(this.tick - GameConfig.MAX_SNAPSHOTS_COUNT)

    // 移除标记为删除的对象
    const objectsToRemove = this.gameObjects.filter(obj => obj.removed)
    if (objectsToRemove.length > 0) {
      this.gameObjects = this.gameObjects.filter(obj => !obj.removed)
      this.#updateRenderGroups()
    }

    // 更新玩家
    this.ghostPlayers.forEach(ghost => ghost.update(dt, this))
    this.player.update(dt, this)

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
    }
    // 下
    if (this.player.r.y > this.levelData.height) {
      this.player.r.x = this.levelData.spawnpoint.x
      this.player.r.y = this.levelData.spawnpoint.y
      this.player.onDamage()
    }

    // 更新游戏对象本身
    this.gameObjects.forEach(entity => entity.update(dt))

    // 重置落地状态
    this.player.onGround = false
    this.ghostPlayers.forEach(ghost => {
      ghost.onGround = false
    })

    // 更新游戏对象与玩家的互动（碰撞检测等）
    this.renderGroups.movingPlatforms.forEach(obj => {
      this.ghostPlayers.forEach(ghost => obj.interactWithPlayer(ghost, this))
      obj.interactWithPlayer(this.player, this)
    })
    this.renderGroups.collectibles.forEach(obj => {
      this.ghostPlayers.forEach(ghost => obj.interactWithPlayer(ghost, this))
      obj.interactWithPlayer(this.player, this)
    })
    this.renderGroups.enemies.forEach(obj => {
      this.ghostPlayers.forEach(ghost => obj.interactWithPlayer(ghost, this))
      obj.interactWithPlayer(this.player, this)
    })
    this.renderGroups.interactables.forEach(obj => {
      this.ghostPlayers.forEach(ghost => obj.interactWithPlayer(ghost, this))
      obj.interactWithPlayer(this.player, this)
    })
    this.renderGroups.platforms.forEach(obj => {
      this.ghostPlayers.forEach(ghost => obj.interactWithPlayer(ghost, this))
      obj.interactWithPlayer(this.player, this)
    })

    // 更新摄像机
    this.camera.update(dt)

    if (this.tick % 2000 === 0) this.saveGame('自动保存', true)
  }

  /**
   * 渲染游戏画面
   */
  render(ctx) {
    this.#updateBackground()

    ctx.clearRect(0, 0, this.displayWidth, this.displayHeight)
    ctx.save()

    // 摄像机缩放
    ctx.scale(this.scale, this.scale)
    ctx.translate(-this.camera.position.x, -this.camera.position.y)

    // 绘制背景网格
    // this.#renderBackgroundGrid(ctx)

    // 按优先级渲染游戏对象
    this.renderGroups.collectibles.forEach(entity =>
      entity.render(ctx, this.scale)
    )
    this.renderGroups.enemies.forEach(entity => entity.render(ctx, this.scale))
    this.renderGroups.interactables.forEach(entity =>
      entity.render(ctx, this.scale)
    )
    this.renderGroups.platforms.forEach(entity =>
      entity.render(ctx, this.scale)
    )
    this.renderGroups.movingPlatforms.forEach(entity =>
      entity.render(ctx, this.scale)
    )

    // 渲染玩家
    this.ghostPlayers.forEach(ghost => ghost.render(ctx, this))
    this.player.render(ctx, this.scale)

    ctx.restore()

    // 调试数据
    // this.#renderDebugUI(ctx)
  }

  /**
   * 更新渲染组缓存
   */
  #updateRenderGroups() {
    this.renderGroups.platforms = this.gameObjects.filter(
      obj => obj.type === 'Platform'
    )
    this.renderGroups.movingPlatforms = this.gameObjects.filter(
      obj => obj.type === 'MovingPlatform' || obj.type === 'CrazyPlatform'
    )
    this.renderGroups.collectibles = this.gameObjects.filter(
      obj => obj.type === 'Collectible'
    )
    this.renderGroups.enemies = this.gameObjects.filter(
      obj => obj.type === 'Enemy'
    )
    this.renderGroups.interactables = this.gameObjects.filter(
      obj =>
        obj.type === 'Interactable' ||
        obj.type === 'LevelChanger' ||
        obj.type === 'Trigger'
    )

    this.#ref = new Map()
    this.gameObjects.forEach(obj => {
      if (obj._ref) this.#ref.set(obj._ref, obj)
    })
  }

  /**
   * 设置摄像机
   */
  #setupCamera() {
    // 计算摄像机视窗尺寸
    const height = this.levelData.cameraHeight ?? this.levelData.height
    const width = height * (this.displayWidth / this.displayHeight)

    // 设置摄像机参数
    this.camera.setViewportSize(width, height)
    this.camera.target = this.player

    // 设置跟随边距
    const paddingX = width * 0.3
    const paddingY = height * 0.3
    this.camera.setPadding(paddingX, paddingX, paddingY, paddingY)

    // 设置平滑跟随
    this.camera.smoothFactor = 0.05

    // 设置世界边界
    this.camera.setWorldBounds(
      0,
      0,
      this.levelData.width,
      this.levelData.height
    )

    // 立即居中到玩家
    this.camera.centerOnTarget()

    this.scale = this.displayHeight / this.camera.viewport.height
  }

  /**
   * 更新背景位置
   */
  #updateBackground() {
    if (!this.levelData.background) return

    // 计算视差位移量（背景移动速度比摄像机慢）
    const parallaxFactor = 3 // 视差系数，值越小背景移动越慢
    const offsetX = -this.camera.position.x * parallaxFactor
    const offsetY = -this.camera.position.y * parallaxFactor

    // 限制位移范围，防止边缘露出
    const maxOffsetX = this.levelData.width * 5 // 最大偏移为关卡宽度的5%
    const maxOffsetY = this.levelData.height * 5 // 最大偏移为关卡高度的5%

    const clampedOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, offsetX))
    const clampedOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, offsetY))

    // 应用变换（基础偏移-10% + 视差偏移）
    const totalOffsetX = (clampedOffsetX / this.levelData.width) * 5 // 转换为百分比
    const totalOffsetY = (clampedOffsetY / this.levelData.height) * 5 // 转换为百分比

    this.$backgroundImage.style.transform = `translate(${totalOffsetX}%, ${totalOffsetY}%)`
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
    if (TimeTravel.state) {
      ctx.fillStyle = '#00ffff'
      ctx.fillText('时间回溯预览中...' + TimeTravel.state, 20, 360)
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
    const pixelsPerTick = timelineWidth / 500

    // 绘制主时间轴
    ctx.strokeStyle = '#888'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(timelineX, timelineY + timelineHeight / 2)
    ctx.lineTo(timelineX + timelineWidth, timelineY + timelineHeight / 2)
    ctx.stroke()

    // 绘制tick刻度
    for (
      let tick = Math.max(1, this.tick - 200);
      tick <= Math.min(this.tick + 200, this.maxTick);
      tick++
    ) {
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
        (tick % 100 === 0 && tick > 0)
      ) {
        ctx.fillStyle = tickColor
        ctx.font = '1.5rem FiraCode, monospace'
        ctx.textAlign = 'center'
        ctx.fillText(~~(tick / 10) / 10 + 's', x, timelineY + timelineHeight)
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
      const startTick = ghost.lifetimeBegin
      const endTick = ghost.lifetimeEnd

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
    ctx.font = '1.4rem FiraCode, monospace'
    ctx.textAlign = 'left'
    ctx.fillText(`${this.tick}/${this.maxTick}`, timelineX + 4, timelineY + 1)

    ctx.restore()
  }
}

export default new Game()
