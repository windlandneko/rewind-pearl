import KeyboardManager from '../KeyboardManager.js'
import { EventListener, wait } from '../utils.js'
import {
  Player,
  Platform,
  Enemy,
  Interactable,
  Collectible,
} from './gameObject/index.js'
import { Camera } from './Camera.js'
import DialogueManager from '../DialogueManager.js'

class Game {
  /** @type {HTMLCanvasElement} */
  canvas = document.getElementById('game-canvas')
  listener = new EventListener()

  // 游戏对象
  player = null
  platforms = []
  enemies = []
  interactables = []
  collectibles = []

  // 游戏状态
  isRunning = false
  camera = new Camera()

  displayWidth = 0
  displayHeight = 0

  // 摄像机高度 - 游戏内多少像素对应实际渲染canvas的高度
  cameraHeight = 600 // 默认600游戏像素对应canvas高度
  cameraScale = 1 // 渲染缩放比例，会根据canvas大小自动计算

  #keyboardListeners = []

  constructor() {
    /** @type {CanvasRenderingContext2D} */
    this.ctx = this.canvas.getContext('2d')

    const resizeCanvas = () => {
      const main = document.querySelector('main')
      const { width, height } = main.getBoundingClientRect()

      const DPR = devicePixelRatio

      this.ctx.scale(DPR, DPR)
      this.canvas.width = this.displayWidth = width * DPR
      this.canvas.height = this.displayHeight = height * DPR

      this.cameraScale = this.displayHeight / this.cameraHeight

      this.ctx.imageSmoothingEnabled = false
      this.ctx.webkitImageSmoothingEnabled = false
      this.ctx.mozImageSmoothingEnabled = false
      this.ctx.msImageSmoothingEnabled = false
      this.ctx.textBaseline = 'top'
      this.ctx.textAlign = 'left'
    }

    resizeCanvas()
    addEventListener('resize', resizeCanvas)

    this.canvas.style.display = 'none'
  }

  #registerKeyboardListeners() {
    this.#keyboardListeners.push(
      KeyboardManager.onKeydown(['E'], () => this.checkInteraction()),
      KeyboardManager.onKeydown(['Esc'], () => this.pause()),
      KeyboardManager.onKeydown(['W', 'Up', 'Space'], () => {
        this.player.tryJump()
      })
    )
  }

  #clearKeyboardListeners() {
    this.#keyboardListeners.forEach(removeListener => removeListener())
    this.#keyboardListeners = []
  }

  /**
   * 开始关卡
   */
  startLevel(levelId) {
    console.log(`[Game] 开始关卡 ${levelId}`)

    // 显示游戏画布
    this.canvas.style.display = 'block'

    this.setCameraHeight(600)

    this.#registerKeyboardListeners()

    // 开始游戏循环
    this.frameCount = 0
    this.prevTick = performance.now()
    this.dt = 0

    this.isRunning = true
    this.gameLoop()
  }

  /**
   * 加载关卡数据
   */
  loadLevel(levelId) {
    // 清空之前的游戏对象
    this.enemies = []
    this.platforms = []
    this.interactables = []
    this.collectibles = []

    // 创建玩家
    this.player = new Player(50, 400)

    // 创建测试狼跳机制的平台系统
    this.platforms = [
      new Platform(0, 500, 1000, 50),

      new Platform(150, 450, 100, 20),
      new Platform(300, 420, 80, 20),
      new Platform(430, 390, 70, 20),
      new Platform(550, 360, 90, 20),

      new Platform(700, 300, 100, 20),
      new Platform(850, 450, 100, 20),
      new Platform(1000, 350, 100, 20),

      new Platform(1200, 280, 60, 20),
      new Platform(1320, 220, 60, 20),
      new Platform(1440, 160, 100, 20),
    ]

    // 设置摄像机
    this.setupCamera()

    // 创建多样化的敌人
    this.enemies = [
      // 地面巡逻敌人
      new Enemy(250, 450),
      new Enemy(450, 450),
      new Enemy(700, 450),
      new Enemy(950, 450),

      // 平台上的敌人
      new Enemy(420, 150),
      new Enemy(640, 100),
      new Enemy(220, 200),

      // 终点区域守卫
      new Enemy(1250, 400),
      new Enemy(1350, 300),
    ]

    // 创建多个可交互对象
    this.interactables = [
      new Interactable(180, 400, 'level1_npc', '按E键对话'),
      new Interactable(630, 100, 'level1_hint', '获得提示'),
      new Interactable(880, 150, 'level1_secret', '神秘信息'),
      new Interactable(1350, 200, 'level1_boss', 'Boss对话'),
    ]

    // 创建丰富的收集品分布
    this.collectibles = [
      // 低层收集品
      new Collectible(170, 400),
      new Collectible(370, 350),
      new Collectible(520, 300),
      new Collectible(680, 250),

      // 中层收集品
      new Collectible(120, 250),
      new Collectible(770, 350),
      new Collectible(870, 300),

      // 高层收集品（奖励冒险精神）
      new Collectible(240, 200),
      new Collectible(420, 150),
      new Collectible(620, 100),
      new Collectible(940, 150),

      // 隐藏收集品（需要精确操作）
      new Collectible(110, 250),
      new Collectible(760, 350),

      // 终点区域收集品
      new Collectible(1230, 400),
      new Collectible(1330, 300),
      new Collectible(1430, 200),
    ]
  }

  /**
   * 游戏主循环
   */
  gameLoop() {
    if (!this.isRunning) return

    this.frameCount++

    const currentTime = performance.now()
    this.dt = (currentTime - this.prevTick) / 1000
    this.prevTick = currentTime

    if (this.dt < 0.1) {
      for (let i = 0.02; i < this.dt; i += 0.02) {
        this.update(0.02)
      }
      this.update(this.dt % 0.02)
      this.render()
    }

    requestAnimationFrame(() => this.gameLoop())
  }

  /**
   * 更新游戏逻辑
   */
  update(dt) {
    // 玩家输入处理
    const keyLeft = KeyboardManager.anyActive(['A', 'ArrowLeft'])
    const keyRight = KeyboardManager.anyActive(['D', 'ArrowRight'])

    // 处理水平移动
    if (keyLeft && !keyRight) {
      this.player.moveLeft()
    } else if (keyRight && !keyLeft) {
      this.player.moveRight()
    } else {
      // 没有按移动键时停止移动
      this.player.stopMoving()
    }

    // 更新玩家物理
    this.player.update(dt)

    // 世界边界检测（假设世界大小为1600x800）
    this.player.handleWorldBounds(1600, 800)

    this.platforms.forEach(entity => entity.update(dt))
    this.collectibles.forEach(entity => entity.update(dt))
    this.enemies.forEach(entity => entity.update(dt))
    this.interactables.forEach(entity => entity.update(dt))

    // 碰撞检测
    this.checkCollisions()

    // 摄像机更新
    this.camera.update(dt)

    // 关卡完成条件检查
    this.checkLevelComplete()
  }

  /**
   * 渲染游戏画面
   */
  render() {
    this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight)
    this.ctx.save()

    // 摄像机缩放
    this.ctx.scale(this.cameraScale, this.cameraScale)

    // 摄像机变换
    this.ctx.save()
    this.ctx.translate(
      -Math.round(this.camera.position.x),
      -Math.round(this.camera.position.y)
    )

    // 绘制背景网格
    this.#renderBackgroundGrid()

    this.platforms.forEach(entity => entity.render(this.ctx))
    this.collectibles.forEach(entity => entity.render(this.ctx))
    this.enemies.forEach(entity => entity.render(this.ctx))
    this.interactables.forEach(entity => entity.render(this.ctx))

    // 玩家
    this.player.render(this.ctx)

    // 取消摄像机变换
    this.ctx.restore()

    this.renderUI()

    this.ctx.restore()
  }

  /**
   * 渲染背景网格
   */
  #renderBackgroundGrid() {
    const viewport = this.camera.getViewport()
    const gridSize = 100

    this.ctx.strokeStyle = '#444'
    this.ctx.lineWidth = 1

    // 计算网格绘制范围（只绘制可见区域）
    const startX = Math.floor(viewport.x / gridSize) * gridSize
    const endX = Math.ceil((viewport.x + viewport.width) / gridSize) * gridSize
    const startY = Math.floor(viewport.y / gridSize) * gridSize
    const endY = Math.ceil((viewport.y + viewport.height) / gridSize) * gridSize

    // 绘制垂直线
    for (let x = startX; x <= endX; x += gridSize) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, startY)
      this.ctx.lineTo(x, endY)
      this.ctx.stroke()
    }

    // 绘制水平线
    for (let y = startY; y <= endY; y += gridSize) {
      this.ctx.beginPath()
      this.ctx.moveTo(startX, y)
      this.ctx.lineTo(endX, y)
      this.ctx.stroke()
    }
  }

  /**
   * 检查碰撞
   */
  checkCollisions() {
    // 重置地面状态
    this.player.onGround = false

    // 玩家与平台碰撞
    this.platforms.forEach(platform => {
      this.player.handlePlatformCollision(platform)
    })

    // 检查地面接触（更精确的地面检测）
    if (!this.player.onGround) {
      this.player.onGround = this.player.checkGroundContact(this.platforms)
    }

    // 玩家与敌人碰撞
    this.enemies.forEach((entity, index) => {
      if (this.player.checkCollision(entity)) {
        if (this.player.v.y > 0 && this.player.r.y < entity.r.y) {
          // 从上方踩到敌人
          this.enemies.splice(index, 1)
          this.player.v.y = -this.player.jumpSpeed * 0.6 // 小跳跃
          this.player.score += 100
        } else {
          // 玩家受伤
          this.player.takeDamage()
        }
      }
    })

    // 玩家与收集品碰撞
    this.collectibles.forEach((entity, index) => {
      if (this.player.checkCollision(entity)) {
        this.collectibles.splice(index, 1)
        this.player.score += entity.value
      }
    })

    // 玩家与可交互物体碰撞
    this.interactables.forEach(entity => {
      entity.isHighlighted = this.player.checkCollision(entity)
    })
  }

  /**
   * 检查互动
   */
  async checkInteraction() {
    for (const entity of this.interactables) {
      if (this.player.checkCollision(entity) && entity.dialogueId) {
        this.#clearKeyboardListeners()
        this.isRunning = false
        await DialogueManager.play(entity.dialogueId)
        this.startLevel()
        break
      }
    }
  }

  /**
   * 设置摄像机
   */
  setupCamera() {
    if (!this.player) return

    // 计算摄像机视窗尺寸
    const cameraWidth =
      this.cameraHeight * (this.displayWidth / this.displayHeight)

    // 设置摄像机参数
    this.camera.setViewportSize(cameraWidth, this.cameraHeight)
    this.camera.setTarget(this.player)

    // 设置跟随边距（屏幕的1/4作为padding）
    const paddingX = cameraWidth * 0.25
    const paddingY = this.cameraHeight * 0.25
    this.camera.setPadding(paddingX, paddingX, paddingY, paddingY)

    // 设置平滑跟随
    this.camera.setSmoothFollow(true, 0.08)

    // 设置世界边界（假设世界大小）
    this.camera.setWorldBounds(0, 0, 1600, 800)

    // 立即居中到玩家
    this.camera.centerOnTarget()
  }

  /**
   * 设置摄像机高度
   * @param {number} height - 游戏内像素高度
   */
  setCameraHeight(height) {
    this.cameraHeight = height
    this.cameraScale = this.displayHeight / this.cameraHeight

    // 更新Camera实例的视窗尺寸
    if (this.camera) {
      const cameraWidth =
        this.cameraHeight * (this.displayWidth / this.displayHeight)
      this.camera.setViewportSize(cameraWidth, this.cameraHeight)
    }
  }

  /**
   * 检查关卡完成
   */
  checkLevelComplete() {
    // 示例：收集完所有收集品且到达终点
    if (this.collectibles.length === 0 && this.player.x > 1400) {
      this.completeLevel()
    }

    // 检查玩家死亡
    if (this.player.health <= 0) {
      this.gameOver()
    }
  }

  /**
   * 渲染UI
   */
  renderUI() {
    // 渲染生命值、分数等UI元素
    this.ctx.fillStyle = '#fff'
    this.ctx.font = '20px SourceHanSerifCN, serif, sans-serif'
    this.ctx.fillText(`HP: ${this.player.health}`, 20, 30)
    this.ctx.fillText(`Score: ${this.player.score}`, 20, 60)
    this.ctx.font = '20px SourceHanSerifCN, serif, sans-serif'
    // 狼跳机制说明
    this.ctx.fillStyle = 'white'
    this.ctx.font = '14px SourceHanSerifCN, serif, sans-serif'
    this.ctx.fillText('狼跳机制:', 20, 100)
    this.ctx.fillText('• 土狼时间: 离开平台后0.15秒内仍可跳跃', 20, 120)
    this.ctx.fillText('• 二段跳: 空中可再跳1次', 20, 140)
    this.ctx.fillText('• 跳跃缓冲: 提前按跳跃键会在落地时自动跳跃', 20, 160)

    // 当前状态指示
    if (this.player.coyoteTimer > 0 && !this.player.onGround) {
      this.ctx.fillStyle = 'orange'
      this.ctx.fillText('土狼时间', 20, 190)
    }
    if (this.player.jumpBufferTimer > 0) {
      this.ctx.fillStyle = 'cyan'
      this.ctx.fillText('跳跃缓冲', 20, 210)
    }
    if (this.player.airJumps < this.player.maxAirJumps) {
      this.ctx.fillStyle = 'lightblue'
      this.ctx.fillText(
        `已使用n段跳: ${this.player.maxAirJumps - this.player.airJumps}/${
          this.player.maxAirJumps
        }`,
        20,
        230
      )
    }

    // 调试信息：摄像机状态
    this.ctx.fillStyle = '#888'
    this.ctx.font = '9px FiraCode, monospace'
    this.ctx.fillText(
      `Camera Height: ${this.cameraHeight}px`,
      0,
      this.cameraHeight - 10
    )
    this.ctx.fillText(
      `Camera Scale: ${this.cameraScale.toFixed(2)}x`,
      0,
      this.cameraHeight - 20
    )
    const viewport = this.camera.getViewport()
    this.ctx.fillText(
      `Viewport: ${viewport.width.toFixed(0)}x${viewport.height.toFixed(0)}`,
      0,
      this.cameraHeight - 30
    )

    // 摄像机调试信息
    const cameraDebug = this.camera.getDebugInfo()
    this.ctx.fillText(
      `Camera Pos: (${cameraDebug.position.x.toFixed(
        1
      )}, ${cameraDebug.position.y.toFixed(1)})`,
      0,
      this.cameraHeight - 40
    )
    if (cameraDebug.target) {
      this.ctx.fillText(
        `Target Screen: (${cameraDebug.target.screenX.toFixed(
          1
        )}, ${cameraDebug.target.screenY.toFixed(1)})`,
        0,
        this.cameraHeight - 50
      )
    }

    // 摄像机跟随边距
    this.ctx.save()
    this.ctx.scale(1 / this.cameraScale, 1 / this.cameraScale)
    this.ctx.strokeStyle = '#00FF00'
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(
      cameraDebug.padding.left * this.cameraScale,
      cameraDebug.padding.top * this.cameraScale,
      (viewport.width - cameraDebug.padding.left - cameraDebug.padding.right) *
        this.cameraScale,
      (viewport.height - cameraDebug.padding.top - cameraDebug.padding.bottom) *
        this.cameraScale
    )
    this.ctx.restore()
  }
}

export default new Game()
