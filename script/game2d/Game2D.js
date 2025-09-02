import Keyboard from '../Keyboard.js'
import { EventListener, throttle, wait } from '../utils.js'
import {
  Player,
  Platform,
  Enemy,
  Interactable,
  Collectible,
} from './gameObject/index.js'
import { Camera } from './Camera.js'
import Dialogue from '../Dialogue.js'
import Asset from '../Asset.js'

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
  cameraScale

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

      this.cameraScale = this.displayHeight / this.levelHeight

      this.ctx.imageSmoothingEnabled = false
      this.ctx.webkitImageSmoothingEnabled = false
      this.ctx.mozImageSmoothingEnabled = false
      this.ctx.msImageSmoothingEnabled = false
      this.ctx.textBaseline = 'top'
      this.ctx.textAlign = 'left'
    }

    resizeCanvas()
    addEventListener('resize', throttle(resizeCanvas, 16))

    this.canvas.classList.add('hidden')
  }

  #registerKeyboardListeners() {
    this.#keyboardListeners.push(
      Keyboard.onKeydown(['E'], () => this.checkInteraction()),
      Keyboard.onKeydown(['Esc'], () => this.pause()),
      Keyboard.onKeydown(['W', 'Up', 'Space'], () => {
        this.player.tryJump()
      }),
      Keyboard.onKeyup(['W', 'Up', 'Space'], () => {
        this.player.stopJump()
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
  start(levelId) {
    console.log(`[Game] 开始关卡 ${levelId}`)

    this.#registerKeyboardListeners()

    this.canvas.classList.remove('hidden')

    this.isRunning = true
    this.updateLoop()
    this.renderLoop()
  }

  stop() {
    this.#clearKeyboardListeners()
    this.isRunning = false
    clearInterval(this.updateIntervalHandler)
    cancelAnimationFrame(this.animationFrameHandler)
  }

  /**
   * 加载关卡数据
   */
  loadLevel(levelId) {
    this.enemies = []
    this.platforms = []
    this.interactables = []
    this.collectibles = []

    if (!Asset.has(`level/${levelId}`)) {
      console.error(`[Game] 关卡 ${levelId} 不存在！`)
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

    this.platforms = [
      new Platform(0, this.levelHeight - 8, this.levelWidth, 8),
      new Platform(0, 0, this.levelWidth, 8),
      new Platform(0, 0, 8, this.levelHeight),
      new Platform(this.levelWidth - 8, 0, 8, this.levelHeight),

      new Platform(80, 152, 200, 16.2)
    ]

    // 设置摄像机
    this.setupCamera()
  }

  updateLoop() {
    this.updateIntervalHandler = setInterval(() => {
      this.update(0.01)
    }, 10)
  }
  renderLoop() {
    this.render()
    this.animationFrameHandler = requestAnimationFrame(() => this.renderLoop())
  }

  /**
   * 更新游戏逻辑
   */
  update(dt) {
    // 玩家输入处理
    const keyLeft = Keyboard.anyActive(['A', 'ArrowLeft'])
    const keyRight = Keyboard.anyActive(['D', 'ArrowRight'])

    // 处理水平移动
    if (keyLeft && !keyRight) {
      this.player.moveLeft(dt)
    } else if (keyRight && !keyLeft) {
      this.player.moveRight(dt)
    } else {
      this.player.stopMoving(dt)
    }

    // 更新玩家物理
    this.player.update(dt)

    // 左边界
    if (this.player.r.x < 0) {
      this.player.r.x = 0
      this.player.v.x = 0
    }
    // 右边界
    if (this.player.r.x + this.player.width > this.levelWidth) {
      this.player.r.x = this.levelWidth - this.player.width
      this.player.v.x = 0
    }
    // 上边界
    if (this.player.r.y < 0) {
      this.player.r.y = 0
      this.player.v.y = 0
    }
    // 下边界
    if (this.player.r.y > this.levelHeight) {
      this.player.r.x = this.levelData.spawnpoint.x
      this.player.r.y = this.levelData.spawnpoint.y
      // todo
      stateMachine.emit('map:enter/bottom')
    }

    this.platforms.forEach(entity => entity.update(dt))
    this.collectibles.forEach(entity => entity.update(dt))
    this.enemies.forEach(entity => entity.update(dt))
    this.interactables.forEach(entity => entity.update(dt))

    // 碰撞检测
    this.checkCollisions()

    // 摄像机更新
    this.camera.update(dt)
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
    this.ctx.translate(
      -Math.round(this.camera.position.x),
      -Math.round(this.camera.position.y)
    )

    // 绘制背景网格
    this.#renderBackgroundGrid()

    this.platforms.forEach(entity => entity.render(this.ctx, this.cameraScale))
    this.collectibles.forEach(entity =>
      entity.render(this.ctx, this.cameraScale)
    )
    this.enemies.forEach(entity => entity.render(this.ctx, this.cameraScale))
    this.interactables.forEach(entity =>
      entity.render(this.ctx, this.cameraScale)
    )

    // 玩家
    this.player.render(this.ctx, this.cameraScale)

    this.ctx.restore()

    this.#renderDebugUI()
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
    if (this.player.damageTimer === 0) {
      this.enemies.forEach((entity, index) => {
        if (this.player.checkCollision(entity)) {
          if (
            this.player.v.y > 0 &&
            this.player.r.y + this.player.height < entity.r.y + entity.height
          ) {
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
    }

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
        this.stop()
        await Dialogue.play(entity.dialogueId)
        this.start()
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
  #renderBackgroundGrid() {
    const viewport = this.camera.viewport
    const gridSize = 8

    this.ctx.strokeStyle = '#444'
    this.ctx.lineWidth = 1 / this.cameraScale

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
   * 渲染UI
   */
  #renderDebugUI() {
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
}

export default new Game()
