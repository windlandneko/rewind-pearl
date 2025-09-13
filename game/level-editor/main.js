const canvas = document.getElementById('canvas')
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext('2d')
const toolbar = document.getElementById('toolbar')

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
  decoration: 'decoration',
  eraser: 'eraser',
}

// 工具颜色
const TOOL_COLOR = {
  pointer: '#07c',
  platform: '#888',
  interactable: '#0f0',
  movingPlatform: '#520',
  levelChanger: '#00f',
  enemy: '#800',
  collectible: '#0ff',
  hazard: '#f80',
  decoration: '#ccc',
  eraser: '#d22',
}

const DIRECTION = {
  NORTH: 0b0001,
  EAST: 0b0010,
  WEST: 0b0100,
  SOUTH: 0b1000,
}

let currentTool = TOOL.pointer
let objects = []
let selectedObject = null
let isDragging = false
let dragStart = { x: 0, y: 0 }
let isResizing = false
let resizeHandle = 0b0000
let panOffset = { x: 0, y: 0 }
let zoom = 3
let targetZoom = 3
let isPanning = false
let panStart = { x: 0, y: 0 }

// 移动平台结束锚点拖动
let isDraggingAnchor = false
let draggingAnchor = null

// 创建对象
let isCreating = false
let createStart = { x: 0, y: 0 }
let tempObject = null

let successMessageTimeout = null

// 关卡元数据
let levelData = {
  type: 'levelData',
  introDialogue: null,
  background: 'test',
  bgm: 'test',
  height: 192,
  width: 320,
  worldBorder: false,
  cameraHeight: 192,
  cameraWidth: 320,
}

// 玩家出生点
let spawnpoint = {
  type: 'spawnpoint',
  x: levelData.width / 2 - 5,
  y: levelData.height / 2 - 8,
  width: 10,
  height: 16,
  color: 'rgba(0, 57, 164, 0.25)',
}
objects.push(spawnpoint)

// 网格大小
const GRID_SIZE = 8

// 属性面板
const propertiesPanel = document.getElementById('propertiesPanel')
const propertiesTitle = document.getElementById('propertiesTitle')
const propertiesContent = document.getElementById('propertiesContent')

// 初始化
propertiesPanel.style.display = 'none'

// 显示属性面板
function showProperties(obj) {
  if (!obj) return

  propertiesTitle.textContent = obj.type
  propertiesContent.innerHTML = ''
  propertiesPanel.style.display = 'block'

  // 通用属性
  if (obj.type !== 'levelData' && obj.type !== TOOL.movingPlatform)
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
  addPropertyPair(
    {
      label: '↔ 宽度',
      value: obj.width,
      type: 'number',
      onChange: value => (obj.width = parseFloat(value)),
    },
    {
      label: '↕ 高度',
      value: obj.height,
      type: 'number',
      onChange: value => (obj.height = parseFloat(value)),
    }
  )

  // 特定属性
  switch (obj.type) {
    case 'levelData':
      addPropertyPair(
        {
          label: '↔ 摄像机宽度',
          value: obj.cameraWidth || 0,
          ref: 'cameraWidth',
          type: 'number',
          editable: false,
        },
        {
          label: '↕ 摄像机高度',
          value: obj.cameraHeight || 0,
          type: 'number',
          onChange: value => {
            obj.cameraHeight = parseFloat(value)
            obj.cameraWidth = Math.round(obj.cameraHeight * (5 / 3) * 100) / 100
            document.querySelector(
              `input[type="number"][data-ref="cameraWidth"]`
            ).value = obj.cameraWidth
          },
        }
      )
      addProperty({
        label: '背景图片ID',
        value: obj.background || '',
        type: 'text',
        onChange: value => (obj.background = value),
      })
      addProperty({
        label: '背景音乐ID',
        value: obj.bgm || '',
        type: 'text',
        onChange: value => (obj.bgm = value),
      })
      addProperty({
        label: '是否启用世界边界',
        value: obj.worldBorder || false,
        type: 'checkbox',
        onChange: value => (obj.worldBorder = value),
      })
      break
    case TOOL.interactable:
      addProperty({
        label: '对话',
        value: obj.dialogue || '',
        type: 'text',
        onChange: value => (obj.dialogue = value),
      })
      addProperty({
        label: '精灵ID',
        value: obj.sprite || '',
        type: 'text',
        onChange: value => (obj.sprite = value),
      })
      addProperty({
        label: '提示文本',
        value: obj.text || '',
        type: 'text',
        onChange: value => (obj.text = value),
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
        value: obj.interval || 5,
        type: 'number',
        onChange: value => (obj.interval = parseFloat(value)),
      })
      addProperty({
        label: '移动方式',
        value: obj.moveType || 'linear',
        type: 'select',
        onChange: value => (obj.moveType = value),
        options: ['linear', 'sin', 'random'],
      })
      break
    case TOOL.levelChanger:
      addProperty({
        label: '下一关卡ID',
        value: obj.nextStage || '',
        type: 'text',
        onChange: value => (obj.nextStage = value),
      })
      addProperty({
        label: '强制传送',
        value: obj.force || false,
        type: 'checkbox',
        onChange: value => (obj.force = value),
      })
      break
  }
}
showProperties(levelData)

// 恢复保存的状态
function loadState() {
  const savedState = localStorage.getItem('level-editor-state')
  if (savedState) {
    try {
      const state = JSON.parse(savedState)
      levelData = state.levelData
      objects = state.objects
      panOffset = state.panOffset
      zoom = state.zoom
      targetZoom = state.zoom
      // 重新设置spawnpoint引用
      spawnpoint = objects.find(obj => obj.type === 'spawnpoint') || spawnpoint
      // 重新显示属性
      showProperties(levelData)
      // 重新绘制
      draw()
    } catch (e) {
      console.error('Failed to load state:', e)
    }
  }
}

// 保存当前状态
function saveState() {
  const state = {
    levelData,
    objects,
    panOffset,
    zoom,
  }
  localStorage.setItem('level-editor-state', JSON.stringify(state))
}

// 加载状态
loadState()

// 在页面卸载前保存状态
window.addEventListener('beforeunload', saveState)

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
  div.appendChild(labelEl)

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
  } else {
    input = document.createElement('input')
    input.type = type
    input.value = value
  }
  input.dataset.ref = ref || ''

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

  div.appendChild(input)
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
  input1.dataset.ref = left.ref || ''
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
  input2.dataset.ref = right.ref || ''
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
  .getElementById('decorationTool')
  ?.addEventListener('click', () => setTool(TOOL.decoration))
document
  .getElementById('eraserTool')
  ?.addEventListener('click', () => setTool(TOOL.eraser))
document.getElementById('exportBtn').addEventListener('click', exportCode)

// 设置工具
function setTool(tool) {
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

  // 绘制关卡边界
  drawLevelBounds()

  // 绘制对象
  objects.forEach(obj => drawObject(obj))

  // 绘制临时对象
  if (tempObject) {
    drawObject(tempObject)
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
  ctx.strokeStyle = '#f00'
  ctx.lineWidth = 2 / zoom
  ctx.strokeRect(0, 0, levelData.width, levelData.height)
}

// 绘制对象
function drawObject(obj) {
  if (obj.height <= 0 || obj.width <= 0) return

  // 为移动平台绘制结束锚点和虚线
  if (obj.type === TOOL.movingPlatform) {
    drawMovingPlatformAnchor(obj)
  }

  ctx.save()
  ctx.fillStyle = obj.color
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
  ctx.shadowBlur = 16
  ctx.fillRect(obj.x, obj.y, obj.width, obj.height)
  ctx.restore()

  if (selectedObject === obj) {
    // 绘制调整大小手柄
    drawResizeHandles(obj)
  }
}

// 绘制调整大小手柄
function drawResizeHandles(obj) {
  if (obj.type === 'spawnpoint') return // 玩家出生点不绘制调整手柄
  const k = 8 / zoom
  const handles = [
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

function getSnappedValue(value) {
  return isFreeMove
    ? Math.round(value)
    : Math.round(value / GRID_SIZE) * GRID_SIZE
}

// 鼠标事件
canvas.addEventListener('mousedown', e => {
  const mousePos = getMousePos(e)
  const obj = getObjectAt(mousePos, true, 0)
  if (currentTool === TOOL.eraser) {
    const obj = getObjectAt(mousePos, true, 0)
    if (obj && obj.type !== 'spawnpoint') {
      objects = objects.filter(o => o !== obj)
      if (selectedObject === obj) selectedObject = null
      showProperties(levelData)
      draw()
    }
  } else if (currentTool === TOOL.pointer || obj) {
    // 检查是否点击了移动平台的结束锚点
    if (selectedObject && selectedObject.type === TOOL.movingPlatform) {
      const anchor = getMovingPlatformAnchor(selectedObject, mousePos)
      if (anchor) {
        isDraggingAnchor = anchor
        draggingAnchor = selectedObject
        return
      }
    }

    selectedObject = getObjectAt(mousePos, true)
    if (selectedObject) {
      resizeHandle = getResizeHandle(selectedObject, mousePos)
      if (resizeHandle) {
        isResizing = true
      } else {
        isDragging = true
      }
      dragStart = {
        x: mousePos.x - selectedObject.x,
        y: mousePos.y - selectedObject.y,
      }
      showProperties(selectedObject)
    } else if (!selectedObject) {
      // 只有当没有选中对象时才开始pan
      isPanning = true
      panStart = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y }
      showProperties(levelData)
    }
    updateCursor(mousePos)
  } else {
    // 开始创建新对象
    isCreating = true
    createStart = {
      x: getSnappedValue(mousePos.x),
      y: getSnappedValue(mousePos.y),
    }
    tempObject = createObject(currentTool, createStart)
    tempObject.width = 0
    tempObject.height = 0
    showProperties(null)
  }
  updateCursor(mousePos)
  draw()
})

document.addEventListener('mousemove', e => {
  const mousePos = getMousePos(e)
  lastMousePos = mousePos
  updateCursor(mousePos)
  if (isDraggingAnchor === 'from') {
    draggingAnchor.fromX = getSnappedValue(mousePos.x)
    draggingAnchor.fromY = getSnappedValue(mousePos.y)
    showProperties(draggingAnchor)
    draw()
  } else if (isDraggingAnchor === 'to') {
    draggingAnchor.toX = getSnappedValue(mousePos.x)
    draggingAnchor.toY = getSnappedValue(mousePos.y)
    showProperties(draggingAnchor)
    draw()
  } else if (isDragging && selectedObject) {
    selectedObject.x = getSnappedValue(mousePos.x - dragStart.x)
    selectedObject.y = getSnappedValue(mousePos.y - dragStart.y)
    showProperties(selectedObject)
    draw()
  } else if (isResizing && selectedObject) {
    resizeObject(selectedObject, resizeHandle, mousePos)
    showProperties(selectedObject)
    draw()
  } else if (isPanning) {
    panOffset.x = e.clientX - panStart.x
    panOffset.y = e.clientY - panStart.y
    draw()
  } else if (isCreating && tempObject) {
    const endX = getSnappedValue(mousePos.x)
    const endY = getSnappedValue(mousePos.y)
    tempObject.x = Math.min(createStart.x, endX)
    tempObject.y = Math.min(createStart.y, endY)
    tempObject.height = Math.abs(endY - createStart.y)
    tempObject.width = Math.abs(endX - createStart.x)
    draw()
  }
})

function onMouseup() {
  if (isCreating && tempObject) {
    if (tempObject.width > 0 && tempObject.height > 0) {
      objects.push(tempObject)
      selectedObject = tempObject
      showProperties(selectedObject)
    } else {
      selectedObject = null
      setTool(TOOL.pointer)
      showProperties(levelData)
    }
    tempObject = null
    isCreating = false
  }
  isDragging = false
  isResizing = false
  isPanning = false
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
    if (
      (pos.x >= obj.x - padding &&
        pos.x <= obj.x + obj.width + padding &&
        pos.y >= obj.y - padding &&
        pos.y <= obj.y + obj.height + padding) ||
      (obj.type === TOOL.movingPlatform && getMovingPlatformAnchor(obj, pos))
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
  if (obj.type === 'spawnpoint') return 0 // 玩家出生点不可调整大小

  const k = 6 / zoom
  let result = 0

  const offsetX = Math.abs(pos.x - (obj.x + obj.width / 2))
  const offsetY = Math.abs(pos.y - (obj.y + obj.height / 2))

  if (k < offsetX && offsetX < obj.width / 2 - k) return 0
  if (k < offsetY && offsetY < obj.height / 2 - k) return 0

  if (Math.abs(pos.x - obj.x) < k) result |= DIRECTION.WEST
  if (Math.abs(pos.x - (obj.x + obj.width)) < k) result |= DIRECTION.EAST
  if (Math.abs(pos.y - obj.y) < k) result |= DIRECTION.NORTH
  if (Math.abs(pos.y - (obj.y + obj.height)) < k) result |= DIRECTION.SOUTH

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
    color: TOOL_COLOR[type] || '#000',
  }
  switch (type) {
    case TOOL.interactable:
      obj = {
        ...obj,
        dialogue: 'dialogue',
        sprite: 'sprite',
        text: 'text',
      }
      break
    case TOOL.movingPlatform:
      obj = {
        ...obj,
        fromX: x - GRID_SIZE,
        fromY: y + GRID_SIZE,
        toX: x + GRID_SIZE,
        toY: y - GRID_SIZE,
        interval: 5,
        moveType: 'linear',
      }
      break
    case TOOL.levelChanger:
      obj = { ...obj, nextStage: 'nextStage', force: false }
      break
  }
  return obj
}

// 导出代码
function exportCode(event) {
  let code = `\
  const height = ${levelData.height}
  const width = ${levelData.width}

  game.levelData = {
    introDialogue: '${levelData.introDialogue || 'null'}',
    background: '${levelData.background}',
    height,
    width,
    worldBorder: ${levelData.worldBorder},
    spawnpoint: new Vec2(${spawnpoint.x + spawnpoint.width / 2}, ${
    spawnpoint.y + spawnpoint.height
  }),
    cameraHeight: ${levelData.cameraHeight},
  }

  SoundManager.playBGM('${levelData.bgm}')

  game.gameObjects.push(
  `
  objects.forEach(obj => {
    switch (obj.type) {
      case TOOL.platform:
        code += `    new Platform(${obj.x}, ${obj.y}, ${obj.width}, ${obj.height}),\n`
        break
      case TOOL.interactable:
        code += `    new Interactable(${obj.x}, ${obj.y}, '${obj.dialogue}', '${obj.sprite}', '${obj.text}'),\n`
        break
      case TOOL.movingPlatform:
        code += `    new MovingPlatform(new Vec2(${obj.fromX}, ${obj.fromY}), new Vec2(${obj.toX}, ${obj.toY}), ${obj.width}, ${obj.height}, ${obj.interval}, '${obj.moveType}'),\n`
        break
      case TOOL.levelChanger:
        code += `    new LevelChanger(${obj.x}, ${obj.y}, ${obj.width}, ${obj.height}, '${obj.nextStage}', ${obj.force}),\n`
        break
      case TOOL.enemy:
        code += `    new Enemy(${obj.x}, ${obj.y}, ${obj.width}, ${obj.height}),\n`
        break
      case TOOL.collectible:
        code += `    new Collectible(${obj.x}, ${obj.y}),\n`
        break
      case TOOL.hazard:
        code += `    new Hazard(${obj.x}, ${obj.y}, ${obj.width}, ${obj.height}),\n`
        break
      case TOOL.decoration:
        code += `    new Decoration(${obj.x}, ${obj.y}, ${obj.width}, ${obj.height}),\n`
        break
    }
  })
  code = code.slice(0, -2) + '\n  )\n'
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

  if (isDraggingAnchor) return 'move'
  if (isPanning) return 'grabbing'
  if (isResizing) return null // 保持当前样式

  if (currentTool === TOOL.eraser) {
    return objectAtZeroPadding ? 'not-allowed' : 'default'
  }

  if (objectAtZeroPadding && objectAtZeroPadding.type === 'spawnpoint') {
    return 'move'
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
  if (!handle) return 'move'

  let dir = ''
  if (handle & DIRECTION.NORTH) dir += 'n'
  if (handle & DIRECTION.SOUTH) dir += 's'
  if (handle & DIRECTION.WEST) dir += 'w'
  if (handle & DIRECTION.EAST) dir += 'e'
  return `${dir}-resize`
}

// 删除选中对象
document.addEventListener('keydown', event => {
  if (event.key === 'Delete' && selectedObject) {
    objects = objects.filter(o => o !== selectedObject)
    selectedObject = null
    updateCursor(lastMousePos)
    draw()
    event.preventDefault()
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
      TOOL.decoration,
    ]
    setTool(toolNames[toolIndex])
    event.preventDefault()
  }
  // 切换选中物件的层级
  if (event.key === '[' && selectedObject) {
    const index = objects.indexOf(selectedObject)
    if (index > 0) {
      objects.splice(index, 1)
      objects.splice(index - 1, 0, selectedObject)
      draw()
    }
    event.preventDefault()
  }
  if (event.key === ']' && selectedObject) {
    const index = objects.indexOf(selectedObject)
    if (index < objects.length - 1) {
      objects.splice(index, 1)
      objects.splice(index + 1, 0, selectedObject)
      draw()
    }
    event.preventDefault()
  }
})

let isFreeMove = false

addEventListener('keydown', event => {
  if (event.key === 'Alt') {
    isFreeMove = true
    updateCursor(lastMousePos)
    event.preventDefault()
  }
})
addEventListener('keyup', event => {
  if (event.key === 'Alt') {
    isFreeMove = false
    updateCursor(lastMousePos)
    event.preventDefault()
  }
})
