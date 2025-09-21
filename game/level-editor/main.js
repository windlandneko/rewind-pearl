const canvas = document.getElementById('canvas')
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext('2d')
const toolbar = document.getElementById('toolbar')

// 网格大小
const GRID_SIZE = 8

const PALETTE = [
  'Air',
  'alternateTemplate',
  'AutumnGrass',
  'AutumnGrassDead',
  'BalatroSilver',
  'Basalt',
  'BasaltGrass',
  'BasaltGrassAutumn',
  'BasaltGrassAutumnDead',
  'BasaltGrassDead',
  'BasaltMagma',
  'BasaltSnow',
  'BetterCement',
  'BetterCementGrass',
  'BetterCementGrassAutumn',
  'BetterCementGrassAutumnDead',
  'BetterCementGrassDead',
  'BetterCementSnow',
  'BetterSummit',
  'BetterSummitGrass',
  'BetterSummitGrassAutumn',
  'BetterSummitGrassAutumnDead',
  'BetterSummitGrassDead',
  'BetterSummitNoSnow',
  'bgButternutBrick',
  'bgButternutLeaves',
  'bgFadedBrickBlue',
  'bgFadedBrickWhite',
  'ButternutBrick',
  'ButternutGrass',
  'ButternutLeaves',
  'ButternutWood',
  'ClearIce',
  'CreepyRock',
  'DarkRock',
  'DarkRockMagma',
  'DarkRockSnow',
  'DarkRockVines',
  'DeadGrass',
  'EcoFuture',
  'EcoFutureDark',
  'FadedBrickBlue',
  'FadedBrickBlueVines',
  'FadedBrickGrey',
  'FadedBrickRed',
  'FadedBrickRedAlt',
  'FadedBrickWhite',
  'FadedBrickYellow',
  'GlacialIce',
  'GlacialIceSnow',
  'LumpyCement',
  'LumpyCementAutumnGrass',
  'LumpyCementGrass',
  'LumpyCementSnow',
  'MoltenRock',
  'MossGreen',
  'MossTeal',
  'PaleLimestone',
  'Rock',
  'RockMagma',
  'RockVines',
  'RockyCoral',
  'RockyMud',
  'RockyMudGrass',
  'RockyMudGrassAutumn',
  'RockyMudGrassAutumnDead',
  'RockyMudGrassDead',
  'RockyMudSnow',
  'Snow',
  'Straw',
]

const DEFAULT_PALETTE = [
  'Air',
  'GlacialIce',
  'BetterCementSnow',
  'PaleLimestone',
  'FadedBrickGrey',
  'Rock',
  'DarkRock',
  'BetterSummitNoSnow',
  'DarkRockMagma',
  'ButternutBrick',
]

// 工具
const TOOL = {
  pointer: 'pointer',
  platform: 'platform',
  interactable: 'interactable',
  movingPlatform: 'movingPlatform',
  levelChanger: 'levelChanger',
  enemy: 'enemy',
  collectible: 'collectible',
  hazard: 'hazard',
  trigger: 'trigger',
  eraser: 'eraser',
}

// 工具颜色
const TOOL_COLOR = {
  pointer: '#07c',
  platform: '#888',
  interactable: '#0f0',
  movingPlatform: '#520',
  levelChanger: '#be6',
  enemy: '#800',
  collectible: '#0ff',
  hazard: '#f80',
  trigger: '#ccc',
  eraser: '#d22',
  spawnpoint: 'rgba(0, 57, 164, 0.25)',
}

// 背景块颜色编号
const TILE_COLOR = Array(10)
  .fill()
  .map(
    () =>
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
  )

const DIRECTION = {
  NORTH: 0b0001,
  EAST: 0b0010,
  WEST: 0b0100,
  SOUTH: 0b1000,
}

let currentTool = TOOL.pointer
let objects = []
let selectedObjects = [] // 选择的对象数组（单选时长度为1，多选时长度>1）
let isDragging = false
let dragStart = { x: 0, y: 0 }
let isResizing = false
let resizeHandle = 0b0000
let panOffset = { x: 0, y: 0 }
let zoom = 3
let targetZoom = 3
let isPanning = false
let panStart = { x: 0, y: 0 }

// 框选相关变量
let isBoxSelecting = false
let boxSelectStart = { x: 0, y: 0 }
let boxSelectEnd = { x: 0, y: 0 }

// 多选移动相关变量
let isMultiDragging = false
let multiDragStart = { x: 0, y: 0 }
let multiDragOffsets = []

// 移动平台结束锚点拖动
let isDraggingAnchor = false
let draggingAnchor = null

// 创建对象
let isCreating = false
let createStart = { x: 0, y: 0 }
let tempObject = null

let successMessageTimeout = null

// 播放模式相关变量
let isPlayMode = false
let isDrawBgMode = false // 是否为绘制背景模式
let currentTileType = 1 // 当前绘制的背景块编号
let animationId = null
let platformOriginalPositions = new Map() // 存储移动平台的原始位置

// 关卡元数据
let levelData = {
  type: 'levelData',
  introDialogue: null,
  background: 'test',
  bgm: 'test',
  height: 180,
  width: 320,
  worldBorder: false,
  cameraHeight: 180,
  cameraWidth: 320,
  cameraBound: { x: 0, y: 0, width: 320, height: 180 },
}

let tileData = Array(Math.ceil(levelData.height / GRID_SIZE))
  .fill()
  .map(() => Array(Math.ceil(levelData.width / GRID_SIZE)).fill(0))
let tilePalette = [...DEFAULT_PALETTE]

// 玩家出生点
let spawnpoint = {
  type: 'spawnpoint',
  x: levelData.width / 2 - 5,
  y: levelData.height / 2 - 8,
  width: 10,
  height: 16,
}
objects.push(spawnpoint)

// 属性面板
const propertiesPanel = document.getElementById('propertiesPanel')
const propertiesTitle = document.getElementById('propertiesTitle')
const propertiesContent = document.getElementById('propertiesContent')
const toggleBtn = document.getElementById('togglePropertiesPanelBtn')
const arrow = document.getElementById('toggleArrow')
let collapsed = false
if (toggleBtn && arrow) {
  toggleBtn.addEventListener('click', () => {
    collapsed = !collapsed
    if (collapsed) {
      propertiesPanel.style.maxHeight = '44px'
      arrow.style.transform = 'rotate(-90deg)'
    } else {
      propertiesPanel.style.maxHeight = '600px'
      arrow.style.transform = 'rotate(0deg)'
    }
  })
}

// 关卡管理
let levels = {} // 存储关卡数据，键为关卡名称，值为关卡数据
const levelSelect = document.getElementById('levelSelect')
const renameLevelBtn = document.getElementById('renameLevelBtn')
const deleteLevelBtn = document.getElementById('deleteLevelBtn')

// 初始化
propertiesPanel.style.display = 'none'

// 显示属性面板
function showProperties(obj) {
  if (!obj) return

  if (obj === 'tilePalette') {
    propertiesTitle.textContent = '调色板'
    propertiesContent.innerHTML = ''
    propertiesPanel.style.display = 'block'

    for (let i = 0; i < 10; i++) {
      addProperty({
        label: `#${i + 1}`,
        value: tilePalette[i] ?? 'up',
        type: 'select',
        onChange: value => (tilePalette[i] = value),
        options: PALETTE,
      })
    }

    return
  }

  propertiesTitle.textContent = obj.type
  propertiesContent.innerHTML = ''
  propertiesPanel.style.display = 'block'

  // 通用属性
  if (obj.type !== 'levelData') {
    addProperty({
      label: '隐藏对象',
      value: obj.hidden ?? false,
      type: 'checkbox',
      onChange: value => (obj.hidden = value),
    })
    addProperty({
      label: '# ref',
      value: obj.ref ?? '',
      type: 'text',
      editable: obj.type !== 'spawnpoint',
      onChange: value => (obj.ref = value),
    })
    if (obj.type !== 'movingPlatform')
      addPropertyPair(
        {
          label: 'X',
          value: obj.x,
          type: 'number',
          onChange: value => (obj.x = parseFloat(value)),
        },
        {
          label: 'Y',
          value: obj.y,
          type: 'number',
          onChange: value => (obj.y = parseFloat(value)),
        }
      )
  }
  addPropertyPair(
    {
      label: '↔ 宽度',
      value: obj.width,
      type: 'number',
      editable: obj.type !== 'spawnpoint' && obj.type !== TOOL.collectible,
      onChange: value => (obj.width = parseFloat(value)),
    },
    {
      label: '↕ 高度',
      value: obj.height,
      type: 'number',
      editable: obj.type !== 'spawnpoint' && obj.type !== TOOL.collectible,
      onChange: value => (obj.height = parseFloat(value)),
    }
  )

  // 特定属性
  switch (obj.type) {
    case 'levelData':
      addPropertyPair(
        {
          label: '↔ 摄像机宽度',
          value: obj.cameraWidth ?? 0,
          ref: 'cameraWidth',
          type: 'number',
          editable: false,
        },
        {
          label: '↕ 摄像机高度',
          value: obj.cameraHeight ?? 0,
          type: 'number',
          onChange: value => {
            obj.cameraHeight = parseFloat(value)
            obj.cameraWidth =
              Math.round(obj.cameraHeight * (16 / 9) * 100) / 100
            document.querySelector(
              `input[type="number"][data-ref="cameraWidth"]`
            ).value = obj.cameraWidth
          },
        }
      )
      addPropertyPair(
        {
          label: '摄像机限制 X',
          value: obj.cameraBound?.x ?? 0,
          type: 'number',
          onChange: value => (obj.cameraBound.x = parseFloat(value)),
        },
        {
          label: '摄像机限制 Y',
          value: obj.cameraBound?.y ?? 0,
          type: 'number',
          onChange: value => (obj.cameraBound.y = parseFloat(value)),
        }
      )
      addPropertyPair(
        {
          label: '↔ 限制宽度',
          value: obj.cameraBound?.width ?? 0,
          type: 'number',
          onChange: value => (obj.cameraBound.width = parseFloat(value)),
        },
        {
          label: '↕ 限制高度',
          value: obj.cameraBound?.height ?? 0,
          type: 'number',
          onChange: value => (obj.cameraBound.height = parseFloat(value)),
        }
      )
      addProperty({
        label: '背景图片ID',
        value: obj.background ?? '',
        type: 'text',
        onChange: value => (obj.background = value),
      })
      addProperty({
        label: '背景音乐ID',
        value: obj.bgm ?? '',
        type: 'text',
        onChange: value => (obj.bgm = value),
      })
      addProperty({
        label: '启用世界边界',
        value: obj.worldBorder ?? false,
        type: 'checkbox',
        onChange: value => (obj.worldBorder = value),
      })
      break
    case TOOL.interactable:
      addProperty({
        label: '对话',
        value: obj.dialogue ?? '',
        type: 'text',
        onChange: value => (obj.dialogue = value),
      })
      addProperty({
        label: '精灵ID',
        value: obj.spriteId ?? '',
        type: 'text',
        onChange: value => (obj.spriteId = value),
      })
      addProperty({
        label: '提示文本',
        value: obj.hint ?? '',
        type: 'text',
        onChange: value => (obj.hint = value),
      })
      addProperty({
        label: '自动播放对话',
        value: obj.autoPlay ?? false,
        type: 'checkbox',
        onChange: value => (obj.autoPlay = value),
      })
      break
    case TOOL.platform:
    case TOOL.movingPlatform:
      addProperty({
        label: '脚手架（下方可穿过）',
        value: obj.ladder ?? false,
        type: 'checkbox',
        onChange: value => (obj.ladder = value),
      })
      break
    case TOOL.movingPlatform:
      addPropertyPair(
        {
          label: '起点X',
          value: obj.fromX,
          type: 'number',
          onChange: value => (obj.fromX = parseFloat(value)),
        },
        {
          label: '起点Y',
          value: obj.fromY,
          type: 'number',
          onChange: value => (obj.fromY = parseFloat(value)),
        }
      )
      addPropertyPair(
        {
          label: '终点X',
          value: obj.toX,
          type: 'number',
          onChange: value => (obj.toX = parseFloat(value)),
        },
        {
          label: '终点Y',
          value: obj.toY,
          type: 'number',
          onChange: value => (obj.toY = parseFloat(value)),
        }
      )
      addProperty({
        label: '运动周期（秒）',
        value: obj.interval ?? 5,
        type: 'number',
        onChange: value => (obj.interval = parseFloat(value)),
      })
      addProperty({
        label: '移动方式',
        value: obj.moveType ?? 'linear',
        type: 'select',
        onChange: value => (obj.moveType = value),
        options: ['linear', 'sin', 'still', 'random'],
      })
      break
    case TOOL.levelChanger:
      addProperty({
        label: '下一关卡ID',
        value: obj.nextStage ?? '',
        type: 'text',
        onChange: value => (obj.nextStage = value),
      })
      addProperty({
        label: '强制传送',
        value: obj.force ?? true,
        type: 'checkbox',
        onChange: value => (obj.force = value),
      })
      break
    case TOOL.collectible:
      addProperty({
        label: '精灵ID',
        value: obj.spriteId ?? '',
        type: 'text',
        onChange: value => (obj.spriteId = value),
      })
      addProperty({
        label: '仅幽灵玩家可收集',
        value: obj.onlyGhostCanCollect ?? false,
        type: 'checkbox',
        onChange: value => (obj.onlyGhostCanCollect = value),
      })
      break
    case TOOL.trigger:
      addProperty({
        label: '一次性触发器',
        value: obj.once ?? false,
        type: 'checkbox',
        onChange: value => (obj.once = value),
      })
      addProperty({
        label: '触发函数（进入）',
        value: obj.enterCallback ?? '',
        type: 'textarea',
        onChange: value => (obj.enterCallback = value),
      })
      addProperty({
        label: '触发函数（离开）',
        value: obj.leaveCallback ?? '',
        type: 'textarea',
        onChange: value => (obj.leaveCallback = value),
      })
      break
    case TOOL.hazard:
      addProperty({
        label: '刺的显示方向',
        value: obj.direction ?? 'up',
        type: 'select',
        onChange: value => (obj.direction = value),
        options: ['up', 'down', 'left', 'right'],
      })
  }
}
showProperties(levelData)

function addProperty({
  label,
  value,
  type,
  editable,
  onChange,
  ref,
  options = [],
} = {}) {
  const div = document.createElement('div')
  div.className = 'property'

  const labelEl = document.createElement('label')
  labelEl.textContent = label

  let input
  if (type === 'select') {
    input = document.createElement('select')
    options.forEach(opt => {
      const option = document.createElement('option')
      option.value = opt
      option.textContent = opt
      if (opt === value) option.selected = true
      input.appendChild(option)
    })
  } else if (type === 'checkbox') {
    input = document.createElement('input')
    input.type = 'checkbox'
    input.checked = value
    labelEl.onclick = () => input.click()
  } else if (type === 'textarea') {
    input = document.createElement('textarea')
    input.value = value
    input.rows = 4
  } else {
    input = document.createElement('input')
    input.type = type
    input.value = value
  }
  input.dataset.ref = ref ?? ''

  if (editable === false) {
    input.disabled = true
  } else if (onChange) {
    input.addEventListener('input', () => {
      if (type === 'checkbox') {
        onChange(input.checked)
      } else {
        onChange(input.value)
      }
      draw()
    })
  }

  if (type === 'checkbox') {
    div.appendChild(input)
    div.appendChild(labelEl)
    div.style.display = 'flex'
    input.style.width = 'auto'
    input.style.marginRight = '6px'
  } else {
    div.appendChild(labelEl)
    div.appendChild(input)
  }
  propertiesContent.appendChild(div)
}

function addPropertyPair(left, right) {
  const div = document.createElement('div')
  div.className = 'property-pair'

  // 第一个属性
  const div1 = document.createElement('div')
  const labelEl1 = document.createElement('label')
  labelEl1.textContent = left.label
  div1.appendChild(labelEl1)
  const input1 = document.createElement('input')
  input1.type = left.type
  input1.value = left.value
  input1.dataset.ref = left.ref ?? ''
  if (left.editable === false) input1.disabled = true
  else if (left.onChange)
    input1.addEventListener('input', () => {
      left.onChange(input1.value)
      draw()
    })
  div1.appendChild(input1)
  div.appendChild(div1)

  // 第二个属性
  const div2 = document.createElement('div')
  const labelEl2 = document.createElement('label')
  labelEl2.textContent = right.label
  div2.appendChild(labelEl2)
  const input2 = document.createElement('input')
  input2.type = right.type
  input2.value = right.value
  input2.dataset.ref = right.ref ?? ''
  if (right.editable === false) input2.disabled = true
  else if (right.onChange)
    input2.addEventListener('input', () => {
      right.onChange(input2.value)
      draw()
    })
  div2.appendChild(input2)
  div.appendChild(div2)

  propertiesContent.appendChild(div)
}

// 工具按钮
document
  .getElementById('pointerTool')
  .addEventListener('click', () => setTool(TOOL.pointer))
document
  .getElementById('platformTool')
  .addEventListener('click', () => setTool(TOOL.platform))
document
  .getElementById('interactableTool')
  .addEventListener('click', () => setTool(TOOL.interactable))
document
  .getElementById('movingPlatformTool')
  .addEventListener('click', () => setTool(TOOL.movingPlatform))
document
  .getElementById('levelChangerTool')
  .addEventListener('click', () => setTool(TOOL.levelChanger))
document
  .getElementById('enemyTool')
  ?.addEventListener('click', () => setTool(TOOL.enemy))
document
  .getElementById('collectibleTool')
  ?.addEventListener('click', () => setTool(TOOL.collectible))
document
  .getElementById('hazardTool')
  ?.addEventListener('click', () => setTool(TOOL.hazard))
document
  .getElementById('triggerTool')
  ?.addEventListener('click', () => setTool(TOOL.trigger))
document
  .getElementById('eraserTool')
  ?.addEventListener('click', () => setTool(TOOL.eraser))
document.getElementById('exportBtn').addEventListener('click', exportCode)

// 播放控制按钮
document.getElementById('playBtn').addEventListener('click', togglePlayMode)

// 绘制背景按钮
document.getElementById('drawBgBtn').addEventListener('click', () => {
  isDrawBgMode = !isDrawBgMode
  if (isDrawBgMode) showProperties('tilePalette')
  document.getElementById('drawBgBtn').classList.toggle('active', isDrawBgMode)
  draw()
})

// 数字键切换当前背景块编号
window.addEventListener('keydown', e => {
  if (isDrawBgMode && /^[1-9]$/.test(e.key)) {
    currentTileType = parseInt(e.key)
  }
})

// 设置工具
function setTool(tool) {
  // 在播放模式下禁用工具切换
  if (isPlayMode) return

  currentTool = tool
  document.querySelectorAll('.tool').forEach(btn => {
    btn.classList.remove('active')
    btn.style.borderColor = ''
    btn.style.backgroundColor = ''
  })
  const activeBtn = document.getElementById(tool + 'Tool')
  activeBtn.classList.add('active')
  if (TOOL_COLOR[tool]) {
    activeBtn.style.borderColor = TOOL_COLOR[tool]
    activeBtn.style.backgroundColor = TOOL_COLOR[tool] + '4'
  }
  updateCursor(lastMousePos)
}

// 调整画布大小
function resizeCanvas() {
  const DPR = devicePixelRatio
  canvas.width = window.innerWidth * DPR
  canvas.height = window.innerHeight * DPR
  canvas.style.width = window.innerWidth + 'px'
  canvas.style.height = window.innerHeight + 'px'
  ctx.scale(DPR, DPR)
  ctx.imageSmoothingEnabled = false
  ctx.webkitImageSmoothingEnabled = false
  ctx.mozImageSmoothingEnabled = false
  ctx.msImageSmoothingEnabled = false
  // 居中显示关卡
  panOffset.x = (window.innerWidth - levelData.width * zoom) / 2
  panOffset.y = (window.innerHeight - levelData.height * zoom) / 2
  draw()
}

window.addEventListener('resize', resizeCanvas)
resizeCanvas()

// 绘制
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.save()
  ctx.translate(panOffset.x, panOffset.y)
  ctx.scale(zoom, zoom)

  // 绘制网格
  drawGrid()

  // 绘制背景块
  for (let i = 0; i < tileData.length; i++) {
    for (let j = 0; j < tileData[i].length; j++) {
      const t = tileData[i][j]
      if (t > 0 && TILE_COLOR[t]) {
        ctx.fillStyle = TILE_COLOR[t]
        ctx.fillRect(j * GRID_SIZE, i * GRID_SIZE, GRID_SIZE, GRID_SIZE)
      }
    }
  }

  // 绘制关卡边界
  drawLevelBounds()

  if (!isDrawBgMode) {
    // 绘制对象
    objects.forEach(obj => drawObject(obj))
    // 绘制临时对象
    if (tempObject) drawObject(tempObject)
    // 绘制框选区域
    if (isBoxSelecting) drawBoxSelect()
    // 绘制选择框
    if (selectedObjects.length > 0)
      selectedObjects.forEach(obj => drawSelectionBox(obj))
  } else {
    // 绘制当前背景块预览
    if (lastMousePos) {
      const gridX = Math.floor(lastMousePos.x / GRID_SIZE) * GRID_SIZE
      const gridY = Math.floor(lastMousePos.y / GRID_SIZE) * GRID_SIZE
      ctx.strokeStyle = TILE_COLOR[currentTileType]
      ctx.lineWidth = 2 / zoom
      ctx.setLineDash([4 / zoom, 4 / zoom])
      ctx.strokeRect(gridX, gridY, GRID_SIZE, GRID_SIZE)
    }
  }

  ctx.restore()
}

// 绘制网格
function drawGrid() {
  ctx.strokeStyle = '#eee'
  ctx.lineWidth = 0.75 / zoom

  // 计算可见区域
  const left = -panOffset.x / zoom
  const top = -panOffset.y / zoom
  const right = (-panOffset.x + canvas.width) / zoom
  const bottom = (-panOffset.y + canvas.height) / zoom

  // 找到网格起始点
  const startX = Math.floor(left / GRID_SIZE) * GRID_SIZE
  const startY = Math.floor(top / GRID_SIZE) * GRID_SIZE
  const endX = Math.ceil(right / GRID_SIZE) * GRID_SIZE
  const endY = Math.ceil(bottom / GRID_SIZE) * GRID_SIZE

  for (let x = startX; x <= endX; x += GRID_SIZE) {
    ctx.beginPath()
    ctx.moveTo(x, startY)
    ctx.lineTo(x, endY)
    ctx.stroke()
  }
  for (let y = startY; y <= endY; y += GRID_SIZE) {
    ctx.beginPath()
    ctx.moveTo(startX, y)
    ctx.lineTo(endX, y)
    ctx.stroke()
  }
}

// 绘制关卡边界
function drawLevelBounds() {
  ctx.strokeStyle = 'rgba(153, 153, 153, 0.4)'
  ctx.lineWidth = 4 / zoom
  ctx.strokeRect(0, 0, levelData.width, levelData.height)

  ctx.strokeStyle = 'rgba(0, 170, 255, 1)'
  ctx.setLineDash([12 / zoom, 8 / zoom])
  ctx.lineWidth = 2 / zoom
  ctx.strokeRect(
    levelData.cameraBound?.x,
    levelData.cameraBound?.y,
    levelData.cameraBound?.width,
    levelData.cameraBound?.height
  )
}

// 绘制对象
function drawObject(obj) {
  // 收集品是单点物体，不需要检查宽度和高度
  if (obj.type !== TOOL.collectible && (obj.height <= 0 || obj.width <= 0))
    return

  // 为移动平台绘制结束锚点和虚线
  if (obj.type === TOOL.movingPlatform) {
    drawMovingPlatformAnchor(obj)
  }

  ctx.fillStyle = TOOL_COLOR[obj.type] ?? '#666' + (obj.hidden ? '4' : 'f')
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
  ctx.shadowBlur = 16

  if (obj.type === TOOL.collectible) {
    // 收集品绘制为圆形
    const radius = 5
    ctx.beginPath()
    ctx.arc(obj.x, obj.y, radius, 0, Math.PI * 2)
    ctx.fill()
  } else if (obj.type === TOOL.hazard) {
    ctx.restore()
    const direction = obj.direction ?? 'up'

    const { x, y, width: w, height: h } = obj
    const _ = 0
    const a = _ + 3
    const b = a + 2
    ctx.beginPath()
    if (direction === 'up') {
      for (let i = 0.5; i < w; i += 4) {
        ctx.moveTo(x + i + 0, y + h - _)
        ctx.lineTo(x + i + 0, y + h - a)
        ctx.lineTo(x + i + 1, y + h - a)
        ctx.lineTo(x + i + 1, y + h - b)
        ctx.lineTo(x + i + 2, y + h - b)
        ctx.lineTo(x + i + 2, y + h - a)
        ctx.lineTo(x + i + 3, y + h - a)
        ctx.lineTo(x + i + 3, y + h - _)
      }
    } else if (direction === 'down') {
      for (let i = 0.5; i < w; i += 4) {
        ctx.moveTo(x + i + 0, y + _)
        ctx.lineTo(x + i + 0, y + a)
        ctx.lineTo(x + i + 1, y + a)
        ctx.lineTo(x + i + 1, y + b)
        ctx.lineTo(x + i + 2, y + b)
        ctx.lineTo(x + i + 2, y + a)
        ctx.lineTo(x + i + 3, y + a)
        ctx.lineTo(x + i + 3, y + _)
      }
    } else if (direction === 'left') {
      for (let i = 0.5; i < h; i += 4) {
        ctx.moveTo(x + w - _, y + i + 0)
        ctx.lineTo(x + w - a, y + i + 0)
        ctx.lineTo(x + w - a, y + i + 1)
        ctx.lineTo(x + w - b, y + i + 1)
        ctx.lineTo(x + w - b, y + i + 2)
        ctx.lineTo(x + w - a, y + i + 2)
        ctx.lineTo(x + w - a, y + i + 3)
        ctx.lineTo(x + w - _, y + i + 3)
      }
    } else if (direction === 'right') {
      for (let i = 0.5; i < h; i += 4) {
        ctx.moveTo(x + _, y + i + 0)
        ctx.lineTo(x + a, y + i + 0)
        ctx.lineTo(x + a, y + i + 1)
        ctx.lineTo(x + b, y + i + 1)
        ctx.lineTo(x + b, y + i + 2)
        ctx.lineTo(x + a, y + i + 2)
        ctx.lineTo(x + a, y + i + 3)
        ctx.lineTo(x + _, y + i + 3)
      }
    }
    ctx.closePath()
    ctx.fill()
    ctx.save()
  } else {
    // 其他物体绘制为矩形
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height)
  }

  ctx.restore()

  // 绘制元素中心图标
  drawElementIcon(obj)

  // 绘制选中状态（单选或多选）
  if (selectedObjects.includes(obj)) {
    // 绘制调整大小手柄
    drawResizeHandles(obj)
  }
}

// 绘制调整大小手柄
function drawResizeHandles(obj) {
  if (obj.type === 'spawnpoint' || obj.type === TOOL.collectible) return // 玩家出生点和收集品不绘制调整手柄

  const k = 8 / zoom
  let handles = []

  if (obj.type === TOOL.movingPlatform) {
    // 移动平台只绘制右、下和右下角的手柄，因为左上角与移动轨迹绑定
    handles = [
      { x: obj.x + obj.width, y: obj.y }, // 右上
      { x: obj.x, y: obj.y + obj.height }, // 左下
      { x: obj.x + obj.width, y: obj.y + obj.height }, // 右下
    ]
    if (obj.width > GRID_SIZE * 2) {
      handles.push(
        { x: obj.x + obj.width / 2, y: obj.y + obj.height } // 下中
      )
    }
    if (obj.height > GRID_SIZE * 2) {
      handles.push(
        { x: obj.x + obj.width, y: obj.y + obj.height / 2 } // 右中
      )
    }
  } else {
    // 普通对象的手柄
    handles = [
      { x: obj.x, y: obj.y }, // 左上
      { x: obj.x + obj.width, y: obj.y }, // 右上
      { x: obj.x, y: obj.y + obj.height }, // 左下
      { x: obj.x + obj.width, y: obj.y + obj.height }, // 右下
    ]
    if (obj.width > GRID_SIZE * 2) {
      handles.push(
        { x: obj.x + obj.width / 2, y: obj.y }, // 上中
        { x: obj.x + obj.width / 2, y: obj.y + obj.height } // 下中
      )
    }
    if (obj.height > GRID_SIZE * 2) {
      handles.push(
        { x: obj.x, y: obj.y + obj.height / 2 }, // 左中
        { x: obj.x + obj.width, y: obj.y + obj.height / 2 } // 右中
      )
    }
  }

  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#0009'
  ctx.lineWidth = 1 / zoom
  handles.forEach(({ x, y }) => {
    ctx.fillRect(x - k / 2, y - k / 2, k, k)
    ctx.strokeRect(x - k / 2, y - k / 2, k, k)
  })
}

// 绘制移动平台锚点
function drawMovingPlatformAnchor(obj) {
  const fromX = obj.fromX
  const fromY = obj.fromY
  const toX = obj.toX
  const toY = obj.toY

  // 绘制虚线从起点到终点
  ctx.strokeStyle = '#0009'
  ctx.lineWidth = 1.5 / zoom
  ctx.setLineDash([8 / zoom, 8 / zoom])
  ctx.beginPath()
  ctx.moveTo(fromX, fromY)
  ctx.lineTo(toX, toY)
  ctx.stroke()
  ctx.setLineDash([])

  // 绘制锚点
  const k = 8 / zoom
  ctx.fillStyle = '#ff0'
  ctx.strokeStyle = '#0009'
  ctx.lineWidth = 1 / zoom
  ctx.fillRect(fromX - k / 2, fromY - k / 2, k, k)
  ctx.strokeRect(fromX - k / 2, fromY - k / 2, k, k)
  ctx.fillRect(toX - k / 2, toY - k / 2, k, k)
  ctx.strokeRect(toX - k / 2, toY - k / 2, k, k)
}

// 绘制框选区域
function drawBoxSelect() {
  const x = Math.min(boxSelectStart.x, boxSelectEnd.x)
  const y = Math.min(boxSelectStart.y, boxSelectEnd.y)
  const width = Math.abs(boxSelectEnd.x - boxSelectStart.x)
  const height = Math.abs(boxSelectEnd.y - boxSelectStart.y)

  // 绘制半透明填充
  ctx.fillStyle = 'rgba(0, 123, 255, 0.1)'
  ctx.fillRect(x, y, width, height)

  // 绘制边框
  ctx.strokeStyle = '#007bff'
  ctx.lineWidth = 2 / zoom
  ctx.setLineDash([4 / zoom, 4 / zoom])
  ctx.strokeRect(x, y, width, height)
  ctx.setLineDash([])
}

// 获取收集品的AABB（轴对齐包围盒）
function getCollectibleAABB(obj) {
  const radius = 6 // 收集品半径
  return {
    x: obj.x - radius,
    y: obj.y - radius,
    width: radius * 2,
    height: radius * 2,
  }
}

// 绘制元素中心图标
function drawElementIcon(obj) {
  const centerX = obj.x + obj.width / 2
  const centerY = obj.y + obj.height / 2
  const iconSize = Math.min(obj.width, obj.height) * 0.6 // 图标大小为元素大小的60%

  ctx.save()

  // 根据元素类型设置图标颜色
  // 深色背景的元素使用白色图标，浅色背景的使用深色图标
  const darkBackgroundTypes = [TOOL.movingPlatform, TOOL.enemy, TOOL.hazard]
  if (darkBackgroundTypes.includes(obj.type)) {
    ctx.fillStyle = '#ffffff' // 白色图标
  } else {
    ctx.fillStyle = '#333333' // 深色图标
  }

  ctx.font = `${iconSize}px "Font Awesome 6 Free", "FontAwesome", Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // 使用Unicode字符而不是Font Awesome类名
  switch (obj.type) {
    case TOOL.platform:
      // 平台图标 - 使用方块字符
      ctx.fillText('■', centerX, centerY)
      break

    case TOOL.hazard:
      // 危险图标 - 使用感叹号三角形
      // ctx.fillText('⚠', centerX, centerY)
      break

    case TOOL.movingPlatform:
      // 移动平台图标 - 使用箭头
      ctx.fillText('↔', centerX, centerY)
      break

    case TOOL.collectible:
      // 收集品图标 - 使用钻石字符
      ctx.fillText('♦', centerX, centerY)
      break

    case TOOL.levelChanger:
      // 关卡切换图标 - 使用门字符
      ctx.fillText('🚪', centerX, centerY)
      break

    case TOOL.enemy:
      // 敌人图标 - 使用骷髅字符
      ctx.fillText('💀', centerX, centerY)
      break

    case TOOL.interactable:
      // 互动图标 - 使用对话气泡
      ctx.fillText('💬', centerX, centerY)
      break

    case TOOL.trigger:
      // 触发器图标 - 使用星星字符
      ctx.fillText('★', centerX, centerY)
      break
  }

  ctx.restore()
}

// 绘制选择框
function drawSelectionBox(obj) {
  ctx.strokeStyle = '#007acc'
  ctx.lineWidth = 2 / zoom
  ctx.setLineDash([])

  if (obj.type === TOOL.movingPlatform) {
    // 移动平台的选择框
    const x = Math.min(obj.x, obj.fromX, obj.toX)
    const y = Math.min(obj.y, obj.fromY, obj.toY)
    const width = Math.max(obj.x + obj.width, obj.fromX, obj.toX) - x
    const height = Math.max(obj.y + obj.height, obj.fromY, obj.toY) - y

    ctx.strokeRect(x, y, width, height)

    // 绘制调整手柄
    drawResizeHandles(obj)

    // 绘制移动平台锚点
    drawMovingPlatformAnchor(obj)
  } else if (obj.type === TOOL.collectible) {
    // 收集品的选择框 - 使用AABB
    const aabb = getCollectibleAABB(obj)
    ctx.strokeRect(aabb.x, aabb.y, aabb.width, aabb.height)

    // 收集品不绘制调整手柄
  } else {
    // 普通对象的选择框
    ctx.strokeRect(obj.x, obj.y, obj.width, obj.height)

    // 绘制调整手柄
    drawResizeHandles(obj)
  }
}

// 检测框选区域内的对象
function getObjectsInBox() {
  const x = Math.min(boxSelectStart.x, boxSelectEnd.x)
  const y = Math.min(boxSelectStart.y, boxSelectEnd.y)
  const width = Math.abs(boxSelectEnd.x - boxSelectStart.x)
  const height = Math.abs(boxSelectEnd.y - boxSelectStart.y)

  return objects.filter(obj => {
    // 收集品使用点检测
    if (obj.type === TOOL.collectible) {
      return (
        obj.x >= x && obj.x <= x + width && obj.y >= y && obj.y <= y + height
      )
    }

    // 检查对象是否与框选区域相交
    return !(
      obj.x >= x + width ||
      obj.x + obj.width <= x ||
      obj.y >= y + height ||
      obj.y + obj.height <= y
    )
  })
}

// 清除选择状态
function clearSelection() {
  selectedObjects = []
}

// 获取当前选中的对象（单选时返回第一个，多选时返回null）
function getSelectedObject() {
  return selectedObjects.length === 1 ? selectedObjects[0] : null
}

// 设置单选
function setSingleSelection(obj) {
  selectedObjects = obj ? [obj] : []
}

// 添加多选
function addToSelection(obj) {
  if (obj && !selectedObjects.includes(obj)) {
    selectedObjects.push(obj)
  }
}

// 移除选择
function removeFromSelection(obj) {
  const index = selectedObjects.indexOf(obj)
  if (index > -1) {
    selectedObjects.splice(index, 1)
  }
}

// 全选所有游戏物体
function selectAllObjects() {
  selectedObjects = objects.slice() // 选择所有游戏物体，包括spawnpoint
  showProperties(levelData) // 显示关卡属性而不是单个物体属性
  updateCursor(lastMousePos)
  draw()
  console.log(`已选择所有 ${selectedObjects.length} 个游戏物体`)
}

// 检查对象是否被选中
function isSelected(obj) {
  return selectedObjects.includes(obj)
}

function getSnappedValue(value) {
  return isFreeMove
    ? Math.round(value)
    : Math.round(value / GRID_SIZE) * GRID_SIZE
}

// 鼠标事件
canvas.addEventListener('mousedown', event => {
  // 在播放模式下禁用编辑功能
  if (isPlayMode) return

  const mousePos = getMousePos(event)

  if (event.button === 1) {
    isPanning = true
    panStart = {
      x: event.clientX - panOffset.x,
      y: event.clientY - panOffset.y,
    }
    updateCursor(mousePos)
    return
  }

  if (isDrawBgMode) {
    isBgDrawing = true
    bgDrawType = event.button === 2 ? 0 : currentTileType
    drawBgTile(mousePos, bgDrawType)
    draw()
    return
  }

  const obj = getObjectAt(mousePos, true)

  // 检查是否按下了Ctrl键进行框选
  if (event.ctrlKey && currentTool === TOOL.pointer) {
    isBoxSelecting = true
    boxSelectStart = mousePos
    boxSelectEnd = mousePos
    clearSelection()
    showProperties(levelData)
    updateCursor(mousePos)
    draw()
    return
  }

  if (currentTool === TOOL.eraser) {
    const obj = getObjectAt(mousePos, true, 0)
    if (obj && obj.type !== 'spawnpoint') {
      objects = objects.filter(o => o !== obj)
      removeFromSelection(obj)
      showProperties(levelData)
      draw()
    }
  } else if (currentTool === TOOL.pointer || obj) {
    if (obj) {
      // 先检查是否在已选中的对象上点击
      if (isSelected(obj)) {
        // 在已选中的对象上点击，直接开始拖拽
        if (selectedObjects.length === 1) {
          // 单选拖拽：检查移动平台锚点或调整手柄
          const selectedObj = getSelectedObject()
          if (selectedObj) {
            if (selectedObj.type === TOOL.movingPlatform) {
              const anchor = getMovingPlatformAnchor(selectedObj, mousePos)
              if (anchor) {
                saveState() // 保存状态到历史栈
                isDraggingAnchor = anchor
                draggingAnchor = selectedObj
                showProperties(selectedObj)
                updateCursor(mousePos)
                draw()
                return
              }
            }

            // 检查是否点击了调整手柄
            resizeHandle = getResizeHandle(selectedObj, mousePos)
            if (resizeHandle) {
              saveState() // 保存状态到历史栈
              isResizing = true
            } else {
              saveState() // 保存状态到历史栈
              isDragging = true
            }
            dragStart = {
              x: mousePos.x - selectedObj.x,
              y: mousePos.y - selectedObj.y,
            }
            showProperties(selectedObj)
          }
        } else if (selectedObjects.length > 1) {
          // 多选拖拽
          saveState() // 保存状态到历史栈
          isMultiDragging = true
          multiDragStart = {
            x: mousePos.x,
            y: mousePos.y,
          }
          // 记录每个对象的初始位置
          multiDragOffsets = selectedObjects.map(obj => ({
            offsetX: mousePos.x - obj.x,
            offsetY: mousePos.y - obj.y,
          }))
          showProperties(levelData)
        }
      } else {
        // 在未选中的对象上点击，处理选择逻辑
        if (event.ctrlKey) {
          // Ctrl+点击：保留已选择的物体，添加新选择
          addToSelection(obj)
        } else if (event.shiftKey) {
          // Shift+点击：切换选择状态
          addToSelection(obj)
        } else {
          // 普通点击：单选
          setSingleSelection(obj)
        }

        // 选择后立即开始拖拽
        if (selectedObjects.length === 1) {
          const selectedObj = getSelectedObject()
          if (selectedObj) {
            if (selectedObj.type === TOOL.movingPlatform) {
              const anchor = getMovingPlatformAnchor(selectedObj, mousePos)
              if (anchor) {
                saveState() // 保存状态到历史栈
                isDraggingAnchor = anchor
                draggingAnchor = selectedObj
                showProperties(selectedObj)
                updateCursor(mousePos)
                draw()
                return
              }
            }

            // 检查是否点击了调整手柄
            resizeHandle = getResizeHandle(selectedObj, mousePos)
            if (resizeHandle) {
              saveState() // 保存状态到历史栈
              isResizing = true
            } else {
              saveState() // 保存状态到历史栈
              isDragging = true
            }
            dragStart = {
              x: mousePos.x - selectedObj.x,
              y: mousePos.y - selectedObj.y,
            }
            showProperties(selectedObj)
          }
        } else if (selectedObjects.length > 1) {
          // 多选拖拽
          saveState() // 保存状态到历史栈
          isMultiDragging = true
          multiDragStart = {
            x: mousePos.x,
            y: mousePos.y,
          }
          // 记录每个对象的初始位置
          multiDragOffsets = selectedObjects.map(obj => ({
            offsetX: mousePos.x - obj.x,
            offsetY: mousePos.y - obj.y,
          }))
          showProperties(levelData)
        }
      }
    } else {
      // 点击空白区域，取消选择
      clearSelection()
      // 开始平移
      isPanning = true
      panStart = {
        x: event.clientX - panOffset.x,
        y: event.clientY - panOffset.y,
      }
      showProperties(levelData)
    }
  } else {
    // 开始创建新对象
    isCreating = true
    createStart = {
      x: getSnappedValue(mousePos.x),
      y: getSnappedValue(mousePos.y),
    }
    tempObject = createObject(currentTool, createStart)
    // 收集品不需要设置宽度和高度
    if (currentTool !== TOOL.collectible) {
      tempObject.width = 0
      tempObject.height = 0
    }
    showProperties(null)
  }

  updateCursor(mousePos)
  draw()
})

document.addEventListener('mousemove', e => {
  const mousePos = getMousePos(e)
  lastMousePos = mousePos
  updateCursor(mousePos)

  // 在播放模式下禁用编辑功能
  if (isPlayMode) return

  draw()
  if (isBgDrawing) {
    drawBgTile(mousePos, bgDrawType)
    return
  }

  if (isBoxSelecting) {
    boxSelectEnd = mousePos
    draw()
  } else if (isDraggingAnchor === 'from') {
    draggingAnchor.fromX = getSnappedValue(mousePos.x)
    draggingAnchor.fromY = getSnappedValue(mousePos.y)

    // 平台中心跟随轨迹起点
    draggingAnchor.x = draggingAnchor.fromX
    draggingAnchor.y = draggingAnchor.fromY

    showProperties(draggingAnchor)
    draw()
  } else if (isDraggingAnchor === 'to') {
    draggingAnchor.toX = getSnappedValue(mousePos.x)
    draggingAnchor.toY = getSnappedValue(mousePos.y)

    // 平台中心保持在轨迹起点，不移动
    // draggingAnchor.x 和 draggingAnchor.y 保持不变

    showProperties(draggingAnchor)
    draw()
  } else if (isDragging) {
    const selectedObj = getSelectedObject()
    if (selectedObj) {
      const newX = getSnappedValue(mousePos.x - dragStart.x)
      const newY = getSnappedValue(mousePos.y - dragStart.y)

      // 计算偏移量
      const deltaX = newX - selectedObj.x
      const deltaY = newY - selectedObj.y

      // 更新平台位置
      selectedObj.x = newX
      selectedObj.y = newY

      // 对于移动平台，轨迹起点跟随平台中心
      if (selectedObj.type === TOOL.movingPlatform) {
        // 计算轨迹终点的相对位置
        const relativeToX = selectedObj.toX - selectedObj.fromX
        const relativeToY = selectedObj.toY - selectedObj.fromY

        // 更新轨迹起点为新的平台中心
        selectedObj.fromX = newX
        selectedObj.fromY = newY

        // 更新轨迹终点保持相对位置
        selectedObj.toX = getSnappedValue(newX + relativeToX)
        selectedObj.toY = getSnappedValue(newY + relativeToY)
      }

      showProperties(selectedObj)
      draw()
    }
  } else if (isMultiDragging && selectedObjects.length > 0) {
    // 多选移动
    selectedObjects.forEach((obj, index) => {
      const offset = multiDragOffsets[index]
      if (offset) {
        const newX = getSnappedValue(mousePos.x - offset.offsetX)
        const newY = getSnappedValue(mousePos.y - offset.offsetY)

        // 计算偏移量
        const deltaX = newX - obj.x
        const deltaY = newY - obj.y

        // 更新对象位置
        obj.x = newX
        obj.y = newY

        // 对于移动平台，轨迹起点跟随平台中心
        if (obj.type === TOOL.movingPlatform) {
          // 计算轨迹终点的相对位置
          const relativeToX = obj.toX - obj.fromX
          const relativeToY = obj.toY - obj.fromY

          // 更新轨迹起点为新的平台中心
          obj.fromX = newX
          obj.fromY = newY

          // 更新轨迹终点保持相对位置
          obj.toX = getSnappedValue(newX + relativeToX)
          obj.toY = getSnappedValue(newY + relativeToY)
        }
      }
    })
    draw()
  } else if (isResizing) {
    const selectedObj = getSelectedObject()
    if (selectedObj) {
      resizeObject(selectedObj, resizeHandle, mousePos)
      showProperties(selectedObj)
      draw()
    }
  } else if (isPanning) {
    panOffset.x = e.clientX - panStart.x
    panOffset.y = e.clientY - panStart.y
    draw()
  } else if (isCreating && tempObject) {
    // 收集品不需要拖拽设置大小，直接使用点击位置
    if (tempObject.type === TOOL.collectible) {
      tempObject.x = createStart.x
      tempObject.y = createStart.y
    } else {
      const endX = getSnappedValue(mousePos.x)
      const endY = getSnappedValue(mousePos.y)
      tempObject.x = Math.min(createStart.x, endX)
      tempObject.y = Math.min(createStart.y, endY)
      tempObject.height = Math.abs(endY - createStart.y)
      tempObject.width = Math.abs(endX - createStart.x)
    }
    draw()
  }
})

// 屏蔽右键菜单，防止干扰
canvas.addEventListener('contextmenu', e => {
  e.preventDefault()
  return false
})

// 新增：绘制/删除背景块的辅助函数
let isBgDrawing = false
let bgDrawType = 1
function drawBgTile(mousePos, type) {
  const i = Math.floor(mousePos.y / GRID_SIZE)
  const j = Math.floor(mousePos.x / GRID_SIZE)
  if (i >= 0 && i < tileData.length && j >= 0 && j < tileData[i].length) {
    if (tileData[i][j] !== type) {
      tileData[i][j] = type
    }
  }
}

function onMouseup() {
  // 在播放模式下禁用编辑功能
  if (isPlayMode) return

  // 新增：绘制背景拖动结束逻辑
  if (isBgDrawing) {
    isBgDrawing = false
    return
  }

  if (isBoxSelecting) {
    // 完成框选
    const boxedObjects = getObjectsInBox()
    if (boxedObjects.length > 0) {
      selectedObjects = boxedObjects
      showProperties(levelData)
      console.log(`框选了 ${boxedObjects.length} 个对象`)
    } else {
      clearSelection()
      showProperties(levelData)
    }
    isBoxSelecting = false
  } else if (isCreating && tempObject) {
    // 收集品不需要检查宽度和高度，其他物体需要
    const isValidObject =
      tempObject.type === TOOL.collectible ||
      (tempObject.width > 0 && tempObject.height > 0)

    if (isValidObject) {
      saveState() // 保存状态到历史栈
      objects.push(tempObject)
      setSingleSelection(tempObject)
      showProperties(tempObject)
    } else {
      clearSelection()
      setTool(TOOL.pointer)
      showProperties(levelData)
    }
    tempObject = null
    isCreating = false
  }
  isDragging = false
  isResizing = false
  isPanning = false
  isMultiDragging = false
  multiDragOffsets = []
  isDraggingAnchor = null
  draggingAnchor = null
  updateCursor() // 重置cursor
  draw()
}
document.addEventListener('mouseup', onMouseup)
addEventListener('blur', () => {
  onMouseup()
  isFreeMove = false
})

// 滚轮缩放
canvas.addEventListener('wheel', e => {
  e.preventDefault()
  const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
  const oldZoom = zoom
  targetZoom *= zoomFactor
  targetZoom = Math.max(0.1, Math.min(5, targetZoom))

  // 以鼠标位置为中心缩放
  const mouseScreen = { x: e.clientX, y: e.clientY }
  const mouseWorld = {
    x: (mouseScreen.x - panOffset.x) / oldZoom,
    y: (mouseScreen.y - panOffset.y) / oldZoom,
  }
  panOffset.x = mouseScreen.x - mouseWorld.x * targetZoom
  panOffset.y = mouseScreen.y - mouseWorld.y * targetZoom

  zoom = targetZoom
  draw()
})

// 获取鼠标位置
function getMousePos(e) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: (e.clientX - rect.left - panOffset.x) / zoom,
    y: (e.clientY - rect.top - panOffset.y) / zoom,
  }
}

// 获取对象（无副作用，用于查找）
function getObjectAt(pos, moveTop, padding = 6 / zoom) {
  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i]

    // 收集品使用点碰撞检测
    if (obj.type === TOOL.collectible) {
      const radius = 6 // 收集品的半径
      const distance = Math.sqrt((pos.x - obj.x) ** 2 + (pos.y - obj.y) ** 2)
      if (distance <= radius + padding) {
        if (moveTop) {
          objects.splice(i, 1)
          objects.push(obj)
        }
        return obj
      }
    } else if (
      (pos.x >= obj.x - padding &&
        pos.x <= obj.x + obj.width + padding &&
        pos.y >= obj.y - padding &&
        pos.y <= obj.y + obj.height + padding) ||
      (obj.type === TOOL.movingPlatform &&
        getMovingPlatformAnchor(obj, pos) !== null)
    ) {
      if (moveTop) {
        objects.splice(i, 1)
        objects.push(obj)
      }
      return obj
    }
  }
  return null
}

// 获取调整大小手柄
function getResizeHandle(obj, pos) {
  if (obj.type === 'spawnpoint' || obj.type === TOOL.collectible) return 0 // 玩家出生点和收集品不可调整大小

  const k = 6 / zoom
  let result = 0

  const offsetX = Math.abs(pos.x - (obj.x + obj.width / 2))
  const offsetY = Math.abs(pos.y - (obj.y + obj.height / 2))

  if (k < offsetX && offsetX < obj.width / 2 - k) return 0
  if (k < offsetY && offsetY < obj.height / 2 - k) return 0

  if (obj.type === TOOL.movingPlatform) {
    // 移动平台只允许右、下和右下角调整大小
    if (Math.abs(pos.x - (obj.x + obj.width)) < k) result |= DIRECTION.EAST
    if (Math.abs(pos.y - (obj.y + obj.height)) < k) result |= DIRECTION.SOUTH
  } else {
    // 普通对象允许所有方向调整大小
    if (Math.abs(pos.x - obj.x) < k) result |= DIRECTION.WEST
    if (Math.abs(pos.x - (obj.x + obj.width)) < k) result |= DIRECTION.EAST
    if (Math.abs(pos.y - obj.y) < k) result |= DIRECTION.NORTH
    if (Math.abs(pos.y - (obj.y + obj.height)) < k) result |= DIRECTION.SOUTH
  }

  return result
}

// 获取移动平台锚点
function getMovingPlatformAnchor(obj, pos) {
  const k = 6 / zoom

  if (Math.abs(pos.x - obj.fromX) < k && Math.abs(pos.y - obj.fromY) < k)
    return 'from'
  if (Math.abs(pos.x - obj.toX) < k && Math.abs(pos.y - obj.toY) < k)
    return 'to'

  return null
}

// 调整对象大小
function resizeObject(obj, handle, pos) {
  if (obj.type === 'spawnpoint') return // 玩家出生点不可改变大小

  const x = getSnappedValue(pos.x)
  const y = getSnappedValue(pos.y)
  const cornerX = obj.x + obj.width
  const cornerY = obj.y + obj.height

  if (obj.type === TOOL.movingPlatform) {
    // 移动平台只允许右、下和右下角调整大小，保持左上角位置不变
    if (handle & DIRECTION.SOUTH) {
      obj.height = Math.max(GRID_SIZE, getSnappedValue(y - obj.y))
    }
    if (handle & DIRECTION.EAST) {
      obj.width = Math.max(GRID_SIZE, getSnappedValue(x - obj.x))
    }
  } else {
    // 普通对象允许所有方向调整大小
    if (handle & DIRECTION.NORTH) {
      obj.height = Math.max(GRID_SIZE, getSnappedValue(cornerY - y))
      obj.y = cornerY - obj.height
    }
    if (handle & DIRECTION.WEST) {
      obj.width = Math.max(GRID_SIZE, getSnappedValue(cornerX - x))
      obj.x = cornerX - obj.width
    }
    if (handle & DIRECTION.SOUTH) {
      obj.height = Math.max(GRID_SIZE, getSnappedValue(y - obj.y))
    }
    if (handle & DIRECTION.EAST) {
      obj.width = Math.max(GRID_SIZE, getSnappedValue(x - obj.x))
    }
  }
}

// 创建对象
function createObject(type, pos) {
  const x = pos.x
  const y = pos.y
  let obj = {
    type,
    x,
    y,
    width: GRID_SIZE,
    height: GRID_SIZE,
  }
  switch (type) {
    case TOOL.collectible:
      obj = {
        type,
        x,
        y,
        spriteId: 'sprite/linggangu',
        onlyGhostCanCollect: false,
      }
      break
    case TOOL.interactable:
      obj = {
        ...obj,
        dialogue: 'dialogue',
        spriteId: 'sprite/linggangu',
        hint: '提示文本',
        autoPlay: false,
      }
      break
    case TOOL.platform:
      obj = { ...obj, ladder: false }
      break
    case TOOL.movingPlatform:
      obj = {
        ...obj,
        fromX: x, // 轨迹起点就是平台中心
        fromY: y, // 轨迹起点就是平台中心
        toX: x + GRID_SIZE * 2, // 终点在右侧
        toY: y, // 终点在同一水平线
        ladder: false,
        interval: 5, // 运动周期（秒）
        moveType: 'linear',
      }
      break
    case TOOL.levelChanger:
      obj = { ...obj, nextStage: 'nextStage', force: true, hidden: true }
      break
    case TOOL.trigger:
      obj = {
        ...obj,
        once: true,
        hidden: true,
        enterCallback:
          "game.player.maxAirJumps = 1\ngame.sound.play('bonus')\n",
      }
    case TOOL.hazard:
      obj = { ...obj, direction: 'up' }
  }
  return obj
}

// 播放模式控制
function togglePlayMode() {
  if (isPlayMode) {
    stopAnimation()
  } else {
    startAnimation()
  }
}

let startTime = 0
function startAnimation() {
  isPlayMode = true
  updatePlayButton()

  // 保存所有移动平台的原始位置
  platformOriginalPositions.clear()
  objects.forEach(obj => {
    if (obj.type === TOOL.movingPlatform) {
      platformOriginalPositions.set(obj, {
        x: obj.x,
        y: obj.y,
        fromX: obj.fromX,
        fromY: obj.fromY,
        toX: obj.toX,
        toY: obj.toY,
      })
    }
  })

  // 开始动画循环
  startTime = performance.now()
  animate()
}

function stopAnimation() {
  isPlayMode = false
  updatePlayButton()

  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }

  // 恢复所有移动平台到原始位置
  platformOriginalPositions.forEach((originalPos, obj) => {
    obj.x = originalPos.x
    obj.y = originalPos.y
    obj.fromX = originalPos.fromX
    obj.fromY = originalPos.fromY
    obj.toX = originalPos.toX
    obj.toY = originalPos.toY
  })

  draw()
}

function updatePlayButton() {
  const playBtn = document.getElementById('playBtn')
  const playIcon = playBtn.querySelector('.icon')
  const playText = playBtn.querySelector('span')

  if (isPlayMode) {
    playBtn.classList.add('active')
    playIcon.className = 'fas fa-pause icon'
    playText.textContent = '停止'
  } else {
    playBtn.classList.remove('active')
    playIcon.className = 'fas fa-play icon'
    playText.textContent = '播放'
  }
}

function animate() {
  if (!isPlayMode) return

  const currentTime = performance.now() - startTime

  // 更新所有移动平台
  objects.forEach(obj => {
    if (obj.type === TOOL.movingPlatform) {
      updateMovingPlatform(obj, currentTime)
    }
  })

  draw()
  animationId = requestAnimationFrame(animate)
}

function updateMovingPlatform(obj, currentTime) {
  const originalPos = platformOriginalPositions.get(obj)
  if (!originalPos) return

  // 使用interval属性（秒为单位），转换为毫秒
  const duration = (obj.interval ?? 5) * 1000
  const elapsed = currentTime % duration
  const progress = elapsed / duration

  // 根据moveType选择不同的运动函数
  let smoothProgress
  switch (obj.moveType ?? 'linear') {
    case 'still':
    case 'linear':
      // 线性运动：在起点和终点之间往复移动
      smoothProgress = progress < 0.5 ? progress * 2 : 2 - progress * 2
      break
    case 'sin':
      // 正弦波运动：平滑的来回移动
      smoothProgress = (Math.sin(progress * Math.PI * 2 - Math.PI / 2) + 1) / 2
      break
    case 'random':
      // 随机运动：在起点和终点之间随机跳跃
      smoothProgress = Math.random()
      break
    default:
      // 默认线性往复运动
      smoothProgress = progress < 0.5 ? progress * 2 : 2 - progress * 2
  }

  // 计算当前位置
  const currentX =
    originalPos.fromX + (originalPos.toX - originalPos.fromX) * smoothProgress
  const currentY =
    originalPos.fromY + (originalPos.toY - originalPos.fromY) * smoothProgress

  // 更新平台位置
  obj.x = currentX
  obj.y = currentY
}

// 导出代码
function exportCode() {
  // 查找 objects 中的 spawnpoint
  const spawnObj = objects.find(obj => obj.type === 'spawnpoint') ?? spawnpoint
  let code = `\
import * as $ from '../gameObject/index.js'
import Vec2 from '../Vector.js'

export function ${levelSelect.value ?? 'UnknownLevelName'}(game) {
  const height = ${levelData.height}
  const width = ${levelData.width}

  game.levelData = {
    introDialogue: '${levelData.introDialogue ?? 'null'}',
    background: '${levelData.background}',
    height,
    width,
    worldBorder: ${levelData.worldBorder},
    spawnpoint: new Vec2(${spawnObj.x}, ${spawnObj.y}),
    cameraHeight: ${levelData.cameraHeight},
    cameraBound: {
      x: ${levelData.cameraBound.x},
      y: ${levelData.cameraBound.y},
      width: ${levelData.cameraBound.width},
      height: ${levelData.cameraBound.height},
    },
  }

  game.tilePalette = ${JSON.stringify(tilePalette)}

  game.tileData = [\n    '${tileData
    .map(row => row.join(''))
    .join(',\n    ')}',\n  ]

  game.sound.playBGM('${levelData.bgm}')

  game.gameObjects.push(

`
  objects
    .sort((a, b) => {
      const type = a.type.localeCompare(b.type)
      if (type !== 0) return type
      return a.x === b.x ? a.y - b.y : a.x - b.x
    })
    .forEach(obj => {
      if (obj.type === 'spawnpoint') return // 跳过玩家出生点
      let str = '    new $.'
      switch (obj.type) {
        case TOOL.platform:
          str += `Platform(${obj.x}, ${obj.y}, ${obj.width}, ${obj.height}, ${
            obj.ladder ?? false
          })`
          break
        case TOOL.interactable:
          str += `Interactable(${obj.x}, ${obj.y}, '${obj.dialogue}', '${obj.spriteId}', '${obj.hint}', ${obj.autoPlay})`
          break
        case TOOL.movingPlatform:
          str += `MovingPlatform(new Vec2(${obj.fromX}, ${
            obj.fromY
          }), new Vec2(${obj.toX}, ${obj.toY}), ${obj.width}, ${obj.height}, ${
            obj.ladder ?? false
          }, ${obj.interval ?? 5}, '${obj.moveType ?? 'linear'}')`
          break
        case TOOL.levelChanger:
          str += `LevelChanger(${obj.x}, ${obj.y}, ${obj.width}, ${obj.height}, '${obj.nextStage}', ${obj.force})`
          break
        case TOOL.enemy:
          str += `Enemy(${obj.x}, ${obj.y}, ${obj.width}, ${obj.height})`
          break
        case TOOL.collectible:
          str += `Collectible(${obj.x - 6}, ${obj.y - 6}, '${obj.spriteId}', ${
            obj.onlyGhostCanCollect
          })`
          break
        case TOOL.hazard:
          str += `Hazard(${obj.x}, ${obj.y}, ${obj.width}, ${obj.height}, '${obj.direction}')`
          break
        case TOOL.trigger:
          str += `Trigger(${obj.x}, ${obj.y}, ${obj.width}, ${obj.height}, ${
            obj.once
          }, ${
            obj.enterCallback
              ? `(game, $) => {\n${obj.enterCallback
                  .split('\n')
                  .map(line => '      ' + line)
                  .join('\n')}\n    }`
              : 'null'
          }, ${
            obj.leaveCallback
              ? `(game, $) => {\n${obj.leaveCallback
                  .split('\n')
                  .map(line => '      ' + line)
                  .join('\n')}\n    }`
              : 'null'
          })`
          break
        default:
          console.warn('未知对象类型，无法导出代码:', obj)
      }
      if (obj.ref) str += `.ref('${obj.ref}')`
      if (obj.hidden) str += `.hide()`
      code += str + ',\n'
    })
  code = code.slice(0, -2) + '\n  )\n}\n'
  navigator.clipboard.writeText(code).then(() => {
    document.getElementById('exportBtn').innerHTML =
      '<i class="fas fa-check"></i> 已复制到剪贴板'
    clearTimeout(successMessageTimeout)
    successMessageTimeout = setTimeout(() => {
      document.getElementById('exportBtn').innerHTML =
        '<i class="fas fa-share-square"></i> 导出'
    }, 800)
  })
}

let lastMousePos = { x: 0, y: 0 }

// 更新鼠标指针
function updateCursor(mousePos = null) {
  const style = getCursorStyle(mousePos)
  if (style) canvas.style.cursor = style
}

function getCursorStyle(mousePos) {
  if (!mousePos) return 'default'

  const objectAtZeroPadding = getObjectAt(mousePos, false, 0)

  if (isBgDrawing) return 'crosshair'
  if (isDrawBgMode) return 'cell'
  if (isDraggingAnchor) return 'crosshair'
  if (isPanning) return 'grabbing'
  if (isResizing) return null // 保持当前样式
  if (isMultiDragging) return 'move'

  if (currentTool === TOOL.eraser) {
    return objectAtZeroPadding ? 'not-allowed' : 'default'
  }

  if (
    !objectAtZeroPadding &&
    currentTool !== TOOL.pointer &&
    currentTool !== TOOL.eraser
  ) {
    return 'crosshair'
  }

  const object = getObjectAt(mousePos, false)
  if (!object) return 'default'

  const handle = getResizeHandle(object, mousePos)
  if (!handle || selectedObjects.length === 0) return 'move'

  let dir = ''
  if (handle & DIRECTION.NORTH) dir += 'n'
  if (handle & DIRECTION.SOUTH) dir += 's'
  if (handle & DIRECTION.WEST) dir += 'w'
  if (handle & DIRECTION.EAST) dir += 'e'
  return `${dir}-resize`
}

// 删除选中对象
document.addEventListener('keydown', event => {
  // 在播放模式下禁用编辑功能
  if (isPlayMode) return

  // 如果用户正在输入框中输入，不拦截事件
  if (
    event.target.tagName === 'INPUT' ||
    event.target.tagName === 'TEXTAREA' ||
    event.target.tagName === 'SELECT'
  ) {
    return
  }

  if (event.key === 'Delete' && selectedObjects.length > 0) {
    saveState() // 保存状态到历史栈

    // 删除多选对象
    if (selectedObjects.length > 0) {
      objects = objects.filter(o => !selectedObjects.includes(o))
      console.log(`已删除 ${selectedObjects.length} 个对象`)
    } else if (selectedObjects.length === 1) {
      objects = objects.filter(o => o !== selectedObjects[0])
      console.log('已删除对象:', selectedObjects[0].type)
    }

    clearSelection()
    showProperties(levelData)
    updateCursor(lastMousePos)
    draw()
    event.preventDefault()
  }

  // 复制粘贴快捷键
  if (event.ctrlKey) {
    if (event.key === 'a') {
      // Ctrl+A: 全选所有游戏物体
      selectAllObjects()
      event.preventDefault()
    } else if (event.key === 'c' && selectedObjects.length > 0) {
      copyObjects()
      event.preventDefault()
    } else if (event.key === 'v') {
      pasteObjects()
      event.preventDefault()
    } else if (event.key === 'z') {
      undo()
      event.preventDefault()
    } else if (event.key === 'y') {
      redo()
      event.preventDefault()
    }
  }
  // 添加键盘切换工具
  if (event.key >= '0' && event.key <= '9') {
    const toolIndex = parseInt(event.key)
    const toolNames = [
      TOOL.eraser,
      TOOL.pointer,
      TOOL.platform,
      TOOL.interactable,
      TOOL.movingPlatform,
      TOOL.levelChanger,
      TOOL.enemy,
      TOOL.collectible,
      TOOL.hazard,
      TOOL.trigger,
    ]
    setTool(toolNames[toolIndex])
    event.preventDefault()
  }
  // 切换选中物件的层级
  if (event.key === '[' && selectedObjects.length === 1) {
    const selectedObj = selectedObjects[0]
    const index = objects.indexOf(selectedObj)
    if (index > 0) {
      saveState() // 保存状态到历史栈
      objects.splice(index, 1)
      objects.unshift(selectedObj)
      draw()
    }
    event.preventDefault()
  }
  if (event.key === ']' && selectedObjects.length === 1) {
    const selectedObj = selectedObjects[0]
    const index = objects.indexOf(selectedObj)
    if (index < objects.length - 1) {
      saveState() // 保存状态到历史栈
      objects.splice(index, 1)
      objects.push(selectedObj)
      draw()
    }
    event.preventDefault()
  }
})

let isFreeMove = false

// 复制粘贴功能
let copiedObject = null
let copiedObjects = [] // 多选复制对象数组

// 撤回重做相关
let undoStack = [] // 撤回栈
let redoStack = [] // 重做栈
const MAX_HISTORY = 50 // 最大历史记录数

// 保存当前状态到历史栈
function saveState() {
  const state = {
    objects: JSON.parse(JSON.stringify(objects)),
    selectedObjects: JSON.parse(JSON.stringify(selectedObjects)),
  }

  // 添加到撤回栈
  undoStack.push(state)

  // 限制历史记录数量
  if (undoStack.length > MAX_HISTORY) {
    undoStack.shift()
  }

  // 清空重做栈（新操作后不能重做之前的操作）
  redoStack = []
}

// 撤回操作
function undo() {
  if (undoStack.length === 0) return

  // 保存当前状态到重做栈
  const currentState = {
    objects: JSON.parse(JSON.stringify(objects)),
    selectedObjects: JSON.parse(JSON.stringify(selectedObjects)),
  }
  redoStack.push(currentState)

  // 从撤回栈恢复状态
  const previousState = undoStack.pop()
  objects = previousState.objects
  selectedObjects = previousState.selectedObjects

  // 更新属性面板
  if (selectedObjects.length === 1) {
    showProperties(selectedObjects[0])
  } else if (selectedObjects.length > 1) {
    showProperties(levelData)
  } else {
    hideProperties()
  }

  console.log('已撤回操作')
  draw()
}

// 重做操作
function redo() {
  if (redoStack.length === 0) return

  // 保存当前状态到撤回栈
  const currentState = {
    objects: JSON.parse(JSON.stringify(objects)),
    selectedObjects: JSON.parse(JSON.stringify(selectedObjects)),
  }
  undoStack.push(currentState)

  // 从重做栈恢复状态
  const nextState = redoStack.pop()
  objects = nextState.objects
  selectedObjects = nextState.selectedObjects

  // 更新属性面板
  if (selectedObjects.length === 1) {
    showProperties(selectedObjects[0])
  } else if (selectedObjects.length > 1) {
    showProperties(levelData)
  } else {
    hideProperties()
  }

  console.log('已重做操作')
  draw()
}

// 复制对象（支持多选）
function copyObjects() {
  const objectsToCopy = selectedObjects

  if (objectsToCopy.length === 0) return

  // 过滤掉不能复制的对象
  const validObjects = objectsToCopy.filter(obj => obj.type !== 'spawnpoint')

  if (validObjects.length === 0) return

  // 深拷贝对象数组
  copiedObjects = validObjects.map(obj => JSON.parse(JSON.stringify(obj)))

  console.log(`已复制 ${copiedObjects.length} 个对象`)
}

// 粘贴对象（支持多选）
function pasteObjects() {
  if (!copiedObjects || copiedObjects.length === 0) return

  saveState() // 保存状态到历史栈

  // 深拷贝并偏移位置
  const newObjects = copiedObjects.map(obj => {
    const newObj = JSON.parse(JSON.stringify(obj))
    const offset = GRID_SIZE
    const newX = getSnappedValue(obj.x + offset)
    const newY = getSnappedValue(obj.y + offset)

    // 计算偏移量
    const deltaX = newX - obj.x
    const deltaY = newY - obj.y

    // 移动平台主体
    newObj.x = newX
    newObj.y = newY

    // 对于移动平台，需要保持轨迹的相对位置
    if (newObj.type === TOOL.movingPlatform) {
      newObj.fromX = getSnappedValue(obj.fromX + deltaX)
      newObj.fromY = getSnappedValue(obj.fromY + deltaY)
      newObj.toX = getSnappedValue(obj.toX + deltaX)
      newObj.toY = getSnappedValue(obj.toY + deltaY)
    }

    return newObj
  })

  // 添加到对象数组
  objects.push(...newObjects)

  // 选中新粘贴的对象
  selectedObjects = newObjects
  if (newObjects.length === 1) {
    showProperties(newObjects[0])
  } else if (newObjects.length > 1) {
    showProperties(levelData)
  }

  console.log(`已粘贴 ${newObjects.length} 个对象`)
  draw()
}

addEventListener('keydown', event => {
  // 在播放模式下禁用编辑功能
  if (isPlayMode) return

  // 如果用户正在输入框中输入，不拦截事件
  if (
    event.target.tagName === 'INPUT' ||
    event.target.tagName === 'TEXTAREA' ||
    event.target.tagName === 'SELECT'
  ) {
    return
  }

  if (event.key === 'Alt') {
    isFreeMove = true
    updateCursor(lastMousePos)
    event.preventDefault()
  }
})
addEventListener('keyup', event => {
  // 如果用户正在输入框中输入，不拦截事件
  if (
    event.target.tagName === 'INPUT' ||
    event.target.tagName === 'TEXTAREA' ||
    event.target.tagName === 'SELECT'
  ) {
    return
  }

  if (event.key === 'Alt') {
    isFreeMove = false
    updateCursor(lastMousePos)
    event.preventDefault()
  }
})

// 关卡选择切换与新建
let currentLevelName = null
levelSelect.addEventListener('change', () => {
  const selected = levelSelect.value
  if (selected === '') {
    // 新建关卡
    const name = prompt('请输入新关卡名称：')
    if (!name) {
      // 恢复原选项
      levelSelect.value = currentLevelName ?? ''
      return
    }
    if (levels[name]) {
      alert('关卡名已存在！')
      levelSelect.value = currentLevelName ?? ''
      return
    }
    // 自动保存当前关卡
    if (currentLevelName) saveCurrentLevel(currentLevelName)
    // 新建关卡数据
    levelData = {
      type: 'levelData',
      introDialogue: null,
      background: 'test',
      bgm: 'test',
      height: 180,
      width: 320,
      worldBorder: false,
      cameraHeight: 180,
      cameraWidth: 320,
      cameraBound: { x: 0, y: 0, width: 320, height: 180 },
    }
    objects = []
    spawnpoint = {
      type: 'spawnpoint',
      x: levelData.width / 2 - 5,
      y: levelData.height / 2 - 8,
      width: 10,
      height: 16,
    }
    tileData = Array(Math.ceil(levelData.height / GRID_SIZE))
      .fill()
      .map(() => Array(Math.ceil(levelData.width / GRID_SIZE)).fill(0))
    tilePalette = [...DEFAULT_PALETTE]
    objects.push(spawnpoint)
    panOffset = { x: 0, y: 0 }
    zoom = 3
    targetZoom = 3
    selectedObjects = []
    undoStack = []
    redoStack = []
    levels[name] = {
      levelData: JSON.parse(JSON.stringify(levelData)),
      objects: JSON.parse(JSON.stringify(objects)),
      spawnpoint: JSON.parse(JSON.stringify(spawnpoint)),
      panOffset: { ...panOffset },
      zoom,
    }
    currentLevelName = name
    localStorage.setItem('level-editor-levels', JSON.stringify(levels))
    updateLevelSelect()
    levelSelect.value = name
    showProperties(levelData)
    draw()
    return
  }
  // 切换关卡，先保存当前关卡
  if (currentLevelName) saveCurrentLevel(currentLevelName)
  loadLevelByName(selected)
})

function saveCurrentLevel(name) {
  levels[name] = {
    levelData: JSON.parse(JSON.stringify(levelData)),
    tileData: JSON.parse(JSON.stringify(tileData)),
    tilePalette: JSON.parse(JSON.stringify(tilePalette)),
    objects: JSON.parse(JSON.stringify(objects)),
    spawnpoint: JSON.parse(JSON.stringify(spawnpoint)),
    panOffset: { ...panOffset },
    zoom,
  }
  localStorage.setItem('level-editor-levels', JSON.stringify(levels))
}

function loadLevelByName(name) {
  const level = levels[name]
  if (!level) return
  levelData = level.levelData
  if (!levelData.cameraBound)
    levelData.cameraBound = {
      x: 0,
      y: 0,
      width: levelData.width,
      height: levelData.height,
    }
  // 加载tileData
  if (level.tileData) {
    tileData = level.tileData
  } else {
    tileData = Array(Math.ceil(levelData.height / GRID_SIZE))
      .fill()
      .map(() => Array(Math.ceil(levelData.width / GRID_SIZE)).fill(0))
  }
  // tilePalette = level.tilePalette || [...DEFAULT_PALETTE]
  tilePalette = [...DEFAULT_PALETTE]
  objects = level.objects
  spawnpoint = level.spawnpoint
  panOffset = level.panOffset ?? { x: 0, y: 0 }
  zoom = level.zoom ?? 3
  targetZoom = zoom
  selectedObjects = []
  undoStack = []
  redoStack = []
  currentLevelName = name
  showProperties(levelData)
  draw()
}

// 关卡重命名
renameLevelBtn.addEventListener('click', () => {
  if (!currentLevelName) return alert('请先选择关卡')
  const newName = prompt('请输入新的关卡名称：', currentLevelName)
  if (!newName || newName === currentLevelName) return
  if (levels[newName]) {
    alert('该名称已存在！')
    return
  }
  // 修改levels对象的key
  levels[newName] = levels[currentLevelName]
  delete levels[currentLevelName]
  currentLevelName = newName
  localStorage.setItem('level-editor-levels', JSON.stringify(levels))
  updateLevelSelect()
  levelSelect.value = newName
})

// 关卡删除
deleteLevelBtn.addEventListener('click', () => {
  if (!currentLevelName) return alert('请先选择关卡')
  if (Object.keys(levels).length <= 1) {
    alert('至少保留一个关卡！')
    return
  }
  if (!confirm('确定要删除当前关卡吗？')) return
  delete levels[currentLevelName]
  localStorage.setItem('level-editor-levels', JSON.stringify(levels))
  // 切换到第一个关卡
  const first = Object.keys(levels)[0]
  loadLevelByName(first)
  updateLevelSelect()
  levelSelect.value = first
  currentLevelName = first
})

// 只保留一次自动保存绑定，且用最新逻辑
window.addEventListener('beforeunload', () => {
  if (currentLevelName) saveCurrentLevel(currentLevelName)
  // 记录当前关卡名到全局状态
  localStorage.setItem('level-editor-state', currentLevelName)
})

// 初始化关卡列表和全局状态，并自动加载当前关卡
const savedLevels = localStorage.getItem('level-editor-levels')
if (savedLevels) {
  levels = JSON.parse(savedLevels)
}
updateLevelSelect()
// 自动加载上次编辑的关卡，否则新建一个
const state = localStorage.getItem('level-editor-state')
let loaded = false
if (state) {
  try {
    if (state && levels[state]) {
      loadLevelByName(state)
      levelSelect.value = state
      loaded = true
    }
  } catch (e) {
    console.error('Failed to load state:', e)
  }
}
if (!loaded) {
  // 没有任何关卡则新建一个默认关卡
  if (Object.keys(levels).length === 0) {
    const name = '默认关卡'
    levelData = {
      type: 'levelData',
      introDialogue: null,
      background: 'test',
      bgm: 'test',
      height: 180,
      width: 320,
      worldBorder: false,
      cameraHeight: 180,
      cameraWidth: 320,
      cameraBound: { x: 0, y: 0, width: 320, height: 180 },
    }
    objects = []
    spawnpoint = {
      type: 'spawnpoint',
      x: levelData.width / 2 - 5,
      y: levelData.height / 2 - 8,
      width: 10,
      height: 16,
    }
    objects.push(spawnpoint)
    panOffset = { x: 0, y: 0 }
    zoom = 3
    targetZoom = 3
    selectedObjects = []
    undoStack = []
    redoStack = []
    levels[name] = {
      levelData: JSON.parse(JSON.stringify(levelData)),
      objects: JSON.parse(JSON.stringify(objects)),
      spawnpoint: JSON.parse(JSON.stringify(spawnpoint)),
      panOffset: { ...panOffset },
      zoom,
    }
    currentLevelName = name
    localStorage.setItem('level-editor-levels', JSON.stringify(levels))
    updateLevelSelect()
    levelSelect.value = name
    showProperties(levelData)
    draw()
  }
  // 有关卡但没有lastLevel，默认加载第一个
  if (Object.keys(levels).length > 0 && !currentLevelName) {
    const first = Object.keys(levels)[0]
    loadLevelByName(first)
    levelSelect.value = first
  }
}

// 更新关卡选择下拉菜单
function updateLevelSelect() {
  levelSelect.innerHTML = '<option value="">新建关卡...</option>'
  Object.keys(levels).forEach(name => {
    const option = document.createElement('option')
    option.value = name
    option.textContent = name
    levelSelect.appendChild(option)
  })
}
