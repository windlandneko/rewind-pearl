import { EventListener } from '../utils.js'
import { Camera } from './Camera.js'
import { InputEnum } from './gameObject/Player.js'
import { TileHelper } from './TileHelper.js'
import Asset from '../Asset.js'
import Dialogue from '../Dialogue.js'
import Keyboard from '../Keyboard.js'
import TimeTravel from './TimeTravel.js'
import SoundManager from '../SoundManager.js'
import PauseManager from '../PauseManager.js'
import AchievementManager from '../AchievementManager.js'
import SpriteAnimation from './Sprite.js'
import * as Levels from './level/index.js'
import * as GameConfig from './GameConfig.js'
import * as GameObject from './gameObject/index.js'

export class Game {
  listener = new EventListener()

  // 游戏对象
  /** @type {GameObject.Player} */
  player = null
  /** @type {GameObject.GhostPlayer[]} */
  ghostPlayers = []
  /** @type {GameObject.BaseObject[]} */
  gameObjects = []

  // 全局数据
  globalState = {
    timeTravelUsed: 0,
    timeTravelMax: 1,
  }

  // 渲染缓存（避免每帧重复过滤）
  renderGroups = {
    platforms: [],
    movingPlatforms: [],
    collectibles: [],
    enemies: [],
    interactables: [],
    triggers: [],
  }
  #ref = new Map()

  // 游戏状态
  isRunning = false
  preventUpdateUntilTick = 0
  camera = new Camera()
  scale = 1

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
  achievement = AchievementManager
  debug = false

  constructor() {
    const main = document.querySelector('main')
    const { width, height } = main.getBoundingClientRect()

    /** @type {HTMLCanvasElement} */
    this.canvas = document.getElementById('game-canvas')
    /** @type {OffscreenCanvas} */
    this.tmpCanvas = new OffscreenCanvas(width, height)
    /** @type {OffscreenCanvas} */
    this.tileCanvas = new OffscreenCanvas(width, height)

    /** @type {CanvasRenderingContext2D} */
    this.ctx = this.canvas.getContext('2d')
    /** @type {CanvasRenderingContext2D} */
    this.tmpctx = this.tmpCanvas.getContext('2d')
    /** @type {CanvasRenderingContext2D} */
    this.tileCtx = this.tileCanvas.getContext('2d')

    this.resize = () => {
      const { width, height } = main.getBoundingClientRect()
      const DPR = devicePixelRatio
      this.displayWidth = width * DPR
      this.displayHeight = height * DPR

      if (this.tick > 0)
        this.scale = this.displayHeight / this.camera.viewport.height

      resizeCanvas(this.ctx, DPR)
      resizeCanvas(this.tmpctx, DPR)
    }
    const resizeCanvas = (ctx, DPR) => {
      ctx.resetTransform()
      ctx.scale(DPR, DPR)

      if (
        ctx.canvas.width !== this.displayWidth ||
        ctx.canvas.height !== this.displayHeight
      ) {
        ctx.canvas.width = this.displayWidth
        ctx.canvas.height = this.displayHeight
      }

      ctx.imageSmoothingEnabled = false
      ctx.webkitImageSmoothingEnabled = false
      ctx.mozImageSmoothingEnabled = false
      ctx.msImageSmoothingEnabled = false
      ctx.textBaseline = 'top'
      ctx.textAlign = 'center'
    }

    this.resize()
    addEventListener('resize', () => this.resize())

    this.canvas.classList.add('hidden')

    // 背景容器与分层图像（兼容旧的单图方式以及新版固定底图 + 两个图层）
    this.$backgroundContainer = document.getElementById('game2d-background')
    this.$bgBase = this.$backgroundContainer?.querySelector('#bg-base')
    this.$bgLayer1 = this.$backgroundContainer?.querySelector('#bg-layer-1')
    this.$bgLayer2 = this.$backgroundContainer?.querySelector('#bg-layer-2')

    this.strawberryUIAnim = null

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
    AchievementManager.game = this

    addEventListener('beforeunload', () => {
      this.saveGame('自动保存', true, true)
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

      Keyboard.onKeydown(['R'], () => {
        this.player.onDamage()
      }),

      Keyboard.onKeydown(['Q', 'E'], () => {
        if (Keyboard.allActive('Q', 'E') && this.player.onGround)
          TimeTravel.startTimeTravelPreview(this)
      }),
      Keyboard.onKeyup(['Q', 'E'], () => {
        if (!Keyboard.anyActive('Q', 'E')) TimeTravel.endTimeTravelPreview(this)
      }),

      Keyboard.onKeydown(['NumpadEnter'], () => {
        const level = prompt('[Debug] 输入关卡名称')
        if (level in Levels) this.changeLevel(level)
        else if (level) {
          alert(`[Debug] 关卡 "${level}" 不存在！请确保关卡名称正确且已注册。`)
        }
      }),
      Keyboard.onKeydown(['RCtrl'], () => {
        this.debug = !this.debug
        window.game = this
      }),

      Keyboard.onKeydown(['M'], () => {
        this.#debugExportCanvasImage()
      })
    )
  }

  #removeKeyboardListeners() {
    this.#keyboardListeners.forEach(removeListener => removeListener())
    this.#keyboardListeners = []
  }

  importGameObjects(state) {
    this.gameObjects = state.map(state => {
      const obj = new GameObject[state.type]()
      obj.state = state
      return obj
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

    this.levelData = {}
    setupFunction?.(this)
    this.levelData.name = setupFunction?.name
    this.player = new GameObject.Player(
      this.levelData.spawnpoint.x,
      this.levelData.spawnpoint.y
    )

    this.tileHelper = new TileHelper(this.tileData, this.tilePalette)
    this.tileHelper.render(this.tileCtx)

    this.tileHelper.edges.forEach(edge => {
      this.gameObjects.push(new GameObject.Platform(...edge).hide())
    })

    if (this.levelData.background) {
      const bg = 'background/' + this.levelData.background
      if (Asset.has(bg + '0')) {
        if (Asset.has(bg + '0')) this.$bgBase.src = Asset.get(bg + '0').src
        else this.$bgBase.src = null
        if (Asset.has(bg + '1')) this.$bgLayer1.src = Asset.get(bg + '1').src
        else this.$bgLayer1.src = null
        if (Asset.has(bg + '2')) this.$bgLayer2.src = Asset.get(bg + '2').src
        else this.$bgLayer2.src = null
      } else if (Asset.has(bg)) this.$bgBase.src = Asset.get(bg).src
    }
  }

  async start(initial = false) {
    this.#setupCamera(this.levelData)

    // 初始化草莓
    if (Asset.has('sprite/strawberry')) {
      const sprite = Asset.get('sprite/strawberry')
      this.strawberryUIAnim = new SpriteAnimation(
        sprite,
        42,
        16,
        16,
        1000 / 8,
        true
      )
      this.strawberryUIAnim.play()
    }

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

      // if (this.debug) this.#debugRenderTimeline(this.ctx)

      // 渲染关卡过渡效果
      if (this.transitionOpacity) {
        this.ctx.fillStyle = `rgba(0, 0, 0, ${this.transitionOpacity})`
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight)
      }
    }
    this.resize()
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
    if (reverse) this.$backgroundContainer.classList.remove('hidden')
    else this.$backgroundContainer.classList.add('hidden')
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

  loadGame({ levelData, gameObjects, player, globalState }) {
    this.stop()

    const levelName = levelData.name || 'Backroom'

    this.loadLevel(Levels[levelName])
    Object.assign(this.levelData, levelData)

    this.player.state = player

    this.tick = 0
    this.maxTick = 0
    this.importGameObjects(gameObjects)

    this.globalState = globalState || {}

    this.start(true)
  }

  saveGame(name = '未命名存档', autosave = false, silent = false) {
    const currentUser = localStorage.getItem('rewind-pearl-username')
    if (!currentUser) {
      console.error('没有登录用户，无法保存游戏')
      this.showNotification('保存失败：玩家未登录', {
        icon: '❌',
        type: 'error',
      })
      return false
    }

    const gameState = {
      timestamp: Date.now(),
      player: this.player?.state || {},
      gameObjects: this.exportGameObjects(),
      levelData: this.levelData,
      globalState: this.globalState,
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

    if (!silent)
      this.showNotification('游戏已保存', { icon: '💾', type: 'success' })
    return true
  }

  showNotification(message, { icon = '', type = 'info' } = {}) {
    const notification = document.createElement('div')
    notification.classList.add('save-notification')

    const textElement = document.createElement('span')
    textElement.classList.add('save-text')
    textElement.textContent = message
    notification.appendChild(textElement)

    const iconElement = document.createElement('span')
    iconElement.classList.add('save-icon')
    iconElement.textContent = icon
    notification.appendChild(iconElement)

    const main = document.querySelector('main')
    main.appendChild(notification)

    notification.style.borderColor = {
      success: '#4caf50',
      error: '#f44336',
      info: '#2196f3',
    }[type]

    setTimeout(() => notification.classList.add('show'), 0)
    setTimeout(() => notification.classList.remove('show'), 3000)
    setTimeout(() => notification.remove(), 4000)
  }

  /**
   * 更新游戏逻辑
   */
  async update(dt) {
    if (PauseManager.isPaused) return

    // 更新草莓
    if (this.strawberryUIAnim) this.strawberryUIAnim.update(dt)

    // 更新摄像机
    this.camera.setWorldBounds(
      this.levelData.cameraBound?.x,
      this.levelData.cameraBound?.y,
      this.levelData.cameraBound?.width,
      this.levelData.cameraBound?.height
    )
    this.camera.update(dt)

    if (this.preventUpdateUntilTick > 0) {
      this.preventUpdateUntilTick--
      this.camera.smoothFactor = 0.03
    } else {
      this.camera.smoothFactor = 0.01
    }

    TimeTravel.update(dt)

    if (!this.isRunning) return

    if (TimeTravel.state !== null) {
      TimeTravel.deltaTick++
      return
    }

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

    // 更新游戏对象本身
    this.gameObjects.forEach(obj => obj.update(dt))

    // 重置落地状态
    this.player.onGround = false
    this.ghostPlayers.forEach(ghost => {
      ghost.onGround = false
    })

    // 更新游戏对象与玩家的互动（碰撞检测等）
    this.renderGroups.movingPlatforms.forEach(obj => {
      this.ghostPlayers.forEach(ghost => obj.interactWithPlayer(ghost, this))
      obj.interactWithPlayer(this.player, this, dt)
    })
    this.renderGroups.platforms.forEach(obj => {
      this.ghostPlayers.forEach(ghost => obj.interactWithPlayer(ghost, this))
      obj.interactWithPlayer(this.player, this, dt)
    })
    this.renderGroups.collectibles.forEach(obj => {
      this.ghostPlayers.forEach(ghost => obj.interactWithPlayer(ghost, this))
      obj.interactWithPlayer(this.player, this, dt)
    })
    this.renderGroups.enemies.forEach(obj => {
      this.ghostPlayers.forEach(ghost => obj.interactWithPlayer(ghost, this))
      obj.interactWithPlayer(this.player, this, dt)
    })
    this.renderGroups.triggers.forEach(obj => {
      obj.interacting = false
      this.ghostPlayers.forEach(ghost => obj.interactWithPlayer(ghost, this))
      obj.interactWithPlayer(this.player, this, dt)
      obj.trigger(this)
    })
    this.renderGroups.interactables.forEach(obj => {
      this.ghostPlayers.forEach(ghost => obj.interactWithPlayer(ghost, this))
      obj.interactWithPlayer(this.player, this, dt)
    })

    try {
      await this.levelData.onUpdate?.(dt, this, name => this.ref(name))
    } catch (error) {
      console.warn(error)
    }

    if (this.tick % 6000 === 5000) this.saveGame('自动保存', true)
  }

  /**
   * 渲染游戏画面
   * @param {CanvasRenderingContext2D} ctx - 2D渲染上下文
   */
  render(ctx) {
    this.resize()
    this.#updateBackground()

    this.camera.renderUpdate()

    ctx.clearRect(0, 0, this.displayWidth, this.displayHeight)
    ctx.save()

    // 摄像机缩放
    ctx.scale(this.scale, this.scale)
    const renderPos = this.camera.getRenderPosition()
    ctx.translate(-renderPos.x, -renderPos.y)

    // 绘制背景网格
    if (this.debug) this.#renderBackgroundGrid(ctx)

    // 按优先级渲染游戏对象
    this.renderGroups.interactables.forEach(obj => {
      if (!obj.hidden) obj.render(ctx, this)
    })
    this.renderGroups.triggers.forEach(obj => {
      if (!obj.hidden) obj.render(ctx, this)
    })
    this.renderGroups.collectibles.forEach(obj => {
      if (!obj.hidden) obj.render(ctx, this)
    })
    this.renderGroups.enemies.forEach(obj => {
      if (!obj.hidden) obj.render(ctx, this)
    })
    this.renderGroups.movingPlatforms.forEach(obj => {
      if (!obj.hidden) obj.render(ctx, this)
    })
    this.renderGroups.platforms.forEach(obj => {
      if (!obj.hidden) if (!obj.ladder) obj.render(ctx, this)
    })
    this.renderGroups.platforms.forEach(obj => {
      if (!obj.hidden) if (obj.ladder) obj.render(ctx, this)
    })

    this.til
    ctx.drawImage(this.tileCanvas, 0, 0)

    // 渲染玩家
    this.ghostPlayers.forEach(ghost => ghost.render(ctx, this))
    this.player.render(ctx, this)

    ctx.restore()

    this.#renderUI(ctx)

    // 调试数据
    if (this.debug) this.#debugRenderInfo(ctx)
  }

  /**
   * 更新渲染组缓存
   */
  #updateRenderGroups() {
    const objects = this.gameObjects

    this.renderGroups.platforms = objects.filter(obj => obj.type === 'Platform')
    this.renderGroups.movingPlatforms = objects.filter(
      obj => obj.type === 'MovingPlatform'
    )
    this.renderGroups.collectibles = objects.filter(
      obj => obj.type === 'Collectible'
    )
    this.renderGroups.enemies = objects.filter(
      obj => obj.type === 'Enemy' || obj.type === 'Hazard'
    )
    this.renderGroups.interactables = objects.filter(
      obj => obj.type === 'Interactable' || obj.type === 'LevelChanger'
    )
    this.renderGroups.triggers = objects.filter(
      obj => obj.type === 'Trigger' || obj.type === 'CameraController'
    )

    this.#ref = new Map()
    objects.forEach(obj => {
      if (obj._ref) this.#ref.set(obj._ref, obj)
    })
  }

  /**
   * 设置摄像机
   */
  #setupCamera(levelData) {
    // 计算摄像机视窗尺寸
    const height = levelData.cameraHeight
    const width = height * (this.displayWidth / this.displayHeight)

    // 设置摄像机参数
    this.camera.setViewportSize(width, height)
    this.camera.viewportWidth = this.camera.targetViewportWidth
    this.camera.viewportHeight = this.camera.targetViewportHeight
    this.camera.target = this.player

    // 设置跟随边距
    const paddingX = width * 0.4
    const paddingY = height * 0.3
    this.camera.setPadding(paddingX, paddingX, paddingY, paddingY)

    // 设置世界边界
    this.camera.setWorldBounds(
      levelData.cameraBound?.x,
      levelData.cameraBound?.y,
      levelData.cameraBound?.width,
      levelData.cameraBound?.height
    )

    // 立即居中到玩家
    this.camera.centerOnTarget()

    this.scale = this.displayHeight / this.camera.viewport.height
  }

  /**
   * 更新背景位置（视差滚动效果）
   */
  #updateBackground() {
    if (!this.levelData.background) return

    const pos = this.camera.getRenderPosition()
    const levelData = this.levelData

    // 背景图尺寸
    const BG_WIDTH = this.$bgBase.naturalWidth
    const BG_HEIGHT = this.$bgBase.naturalHeight

    // 获取世界边界和视窗尺寸
    const worldWidth = levelData.tileWidth * 8
    const worldHeight = levelData.tileHeight * 8
    const viewportWidth = this.camera.targetViewportWidth || 320
    const viewportHeight = this.camera.targetViewportHeight || 180

    // 计算摄像机在世界中的归一化位置（0-1）
    const maxCameraX = Math.max(1, worldWidth - viewportWidth)
    const maxCameraY = Math.max(1, worldHeight - viewportHeight)
    const cameraProgressX = Math.max(0, Math.min(1, pos.x / maxCameraX))
    const cameraProgressY = Math.max(0, Math.min(1, pos.y / maxCameraY))

    // 背景图可移动范围
    // 水平方向：背景宽度远大于视窗，预留足够的视差移动空间
    const bgDisplayWidth = (BG_WIDTH / BG_HEIGHT) * viewportHeight
    const bgMaxOffsetX = Math.max(0, (bgDisplayWidth - viewportWidth) / 2)

    // 垂直方向：轻微移动（10%幅度）
    const bgMaxOffsetY = viewportHeight * 0.05

    // 视差系数：三个图层移动速度不同，制造深度感
    // 基础层移动最慢（最远），layer2 移动最快（最近）
    const parallaxFactors = {
      base: 0.3, // 远景层移动 30% 速度
      layer1: 0.6, // 中景层移动 60% 速度
      layer2: 1.0, // 近景层移动 100% 速度（与摄像机同步）
    }

    // 计算三个图层的偏移量（基于视差系数）
    const offsetX0 = -bgMaxOffsetX * cameraProgressX * parallaxFactors.base
    const offsetY0 = -bgMaxOffsetY * cameraProgressY * parallaxFactors.base

    const offsetX1 = -bgMaxOffsetX * cameraProgressX * parallaxFactors.layer1
    const offsetY1 = -bgMaxOffsetY * cameraProgressY * parallaxFactors.layer1

    const offsetX2 = -bgMaxOffsetX * cameraProgressX * parallaxFactors.layer2
    const offsetY2 = -bgMaxOffsetY * cameraProgressY * parallaxFactors.layer2

    // 应用 CSS transform
    // 基础定位：translate(-50%, -50%) 居中
    // 视差偏移：+ offsetPx 根据摄像机位置动态调整
    if (this.$bgBase) {
      this.$bgBase.style.transform = `translate(calc(-50% + ${offsetX0}px), calc(-50% + ${offsetY0}px))`
    }
    if (this.$bgLayer1) {
      this.$bgLayer1.style.transform = `translate(calc(-50% + ${offsetX1}px), calc(-50% + ${offsetY1}px))`
    }
    if (this.$bgLayer2) {
      this.$bgLayer2.style.transform = `translate(calc(-50% + ${offsetX2}px), calc(-50% + ${offsetY2}px))`
    }
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

  #renderUI(ctx) {
    this.#renderStrawBerry(ctx)
    this.#renderCollect(ctx)
  }

  #renderStrawBerry(ctx) {
    if (!this.strawberryUIAnim) return

    const strawberryCount = this.globalState.strawberry || 0
    const scale = this.scale

    ctx.save()

    const uiX = 12 * scale
    const uiY = 12 * scale

    ctx.translate(uiX, uiY)

    const size = 14 * scale

    // 渲染草莓
    this.strawberryUIAnim.render(ctx, -size / 2, -size / 2, size, size)

    ctx.restore()

    // 绘制文本
    ctx.save()
    ctx.fillStyle = '#fff'
    ctx.font = `${7 * scale}px Fira Code, serif, sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1 * scale

    const text = `${strawberryCount}`
    ctx.strokeText(text, uiX + 7 * scale, uiY + 1 * scale)
    ctx.fillText(text, uiX + 7 * scale, uiY + 1 * scale)

    ctx.restore()
  }

  #renderCollect(ctx) {
    if (!this.levelData.collectId) return

    const scale = this.scale

    ctx.save()

    const uiX = 12 * scale
    const uiY = 24 * scale

    ctx.translate(uiX, uiY)

    const sprite = Asset.get(this.levelData.collectId)
    const width = 10 * scale
    const height = (sprite.height / sprite.width) * width
    ctx.drawImage(sprite, -width / 2, -height / 2, width, height)

    ctx.restore()

    // 绘制文本
    ctx.save()
    ctx.fillStyle = '#fff'
    ctx.font = `${7 * scale}px Fira Code, serif, sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1 * scale

    const count = this.levelData.collectCount || 0
    const total = this.levelData.collectTotal || 0

    const text = `${count}/${total}`
    ctx.strokeText(text, uiX + 7 * scale, uiY + 1 * scale)
    ctx.fillText(text, uiX + 7 * scale, uiY + 1 * scale)

    ctx.restore()
  }

  /**
   * 渲染UI
   */
  #debugRenderInfo(ctx) {
    ctx.textAlign = 'left'

    // 渲染生命值、分数等UI元素
    ctx.fillStyle = '#fff'
    ctx.font = '40px SourceHanSerifCN, serif, sans-serif'
    ctx.fillText(`HP: ${this.player.health}`, 20, 10)
    ctx.fillText(`TimeTravelUsed: ${this.globalState?.timeTravelUsed}`, 20, 50)
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
    ctx.fillStyle = '#fff'
    const info = this.camera.getDebugInfo()
    ctx.fillText(
      `Camera Pos: (${info.position.x.toFixed(2)}, ${info.position.y.toFixed(
        2
      )})`,
      0,
      this.displayHeight - 80
    )
    ctx.fillText(
      `Camera Target: ${
        info.target
          ? `(${info.target.x.toFixed(2)}, ${info.target.y.toFixed(2)})`
          : 'None'
      }`,
      0,
      this.displayHeight - 100
    )
    ctx.fillText(`Camera Lerp: ${info.lerpFactor}`, 0, this.displayHeight - 120)
    ctx.fillText(
      `World Bounds: ${
        info.worldBounds
          ? `${info.worldBounds.minX},${info.worldBounds.minY},${info.worldBounds.maxX},${info.worldBounds.maxY}`
          : 'None'
      }`,
      0,
      this.displayHeight - 140
    )

    // 渲染玩家y速度折线图
    // const graphWidth = 2400
    // const graphHeight = 80
    // const graphX = 20
    // const graphY = 580
    // ctx.save()
    // ctx.strokeStyle = '#00bfff'
    // ctx.lineWidth = 6
    // ctx.beginPath()
    // const history = this.player.stateHistory
    // for (let i = Math.max(1, this.tick - 500); i <= this.tick; i++) {
    //   const x = graphX + ((i / 500) % 1) * graphWidth
    //   const y = graphY + graphHeight / 2 - history.get(i).vy * 1
    //   if (i % 500 === 0) ctx.moveTo(x, y)
    //   else ctx.lineTo(x, y)
    // }
    // ctx.stroke()
    // // 坐标轴
    // ctx.strokeStyle = '#888'
    // ctx.lineWidth = 1
    // ctx.beginPath()
    // ctx.moveTo(graphX, graphY + graphHeight / 2)
    // ctx.lineTo(graphX + graphWidth, graphY + graphHeight / 2)
    // ctx.stroke()
    // // 标签
    // ctx.fillStyle = '#fff'
    // ctx.font = '16px FiraCode, monospace'
    // ctx.fillText('玩家Y速度', graphX, graphY - 8)
    // ctx.restore()

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
  #debugRenderTimeline(ctx) {
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

  #debugExportCanvasImage() {
    try {
      // 将画布转换为 Blob
      this.canvas.toBlob(blob => {
        if (!blob) {
          console.error('无法生成图像')
          return
        }

        // 创建下载链接
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        // 生成文件名（包含时间戳）
        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, '-')
          .slice(0, -5)
        link.download = `game-screenshot-${timestamp}.png`
        link.href = url

        // 触发下载
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // 清理 URL 对象
        URL.revokeObjectURL(url)

        console.log('图像已导出')
      }, 'image/png')
    } catch (error) {
      console.error('导出图像时出错:', error)
    }
  }

  pauseUpdateUntilTick(tick) {
    this.preventUpdateUntilTick = tick
  }
}

export default new Game()
