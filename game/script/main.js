import Loading from './Loading.js'
import Game2D from './game2d/Game2D.js'
import * as Levels from './game2d/level/index.js'

// 检查用户登录
if (!localStorage.getItem('rewind-pearl-username')) {
  location.assign('../login/index.html')
}

const currentUser = localStorage.getItem('rewind-pearl-username')

async function startNewGame() {
  Game2D.loadLevel(Levels.DoublePlatformTest)
  Game2D.start(true)
}

Loading.on('complete', () => {
  // startNewGame()
  // return
  const loadSaveData = localStorage.getItem(
    'rewind-pearl-autosave-' + currentUser
  )
  if (loadSaveData) {
    try {
      const saveData = JSON.parse(loadSaveData)
      Game2D.loadGame(saveData)
    } catch (error) {
      console.error('加载存档失败:', error)
      startNewGame()
    }
  } else {
    startNewGame()
  }
})

Loading.init()
