import Loading from './Loading.js'
import Game2D from './game2d/Game2D.js'
import * as LevelManager from './game2d/Level.js'

// 检查用户登录
if (!localStorage.getItem('rewind-pearl-username')) {
  location.assign('../login/index.html')
}

async function startNewGame() {
  // await Dialogue.play('prologue')
  Game2D.loadLevel(LevelManager.PrologueLevel)
  Game2D.start()
}

Loading.on('complete', () => {
  const loadSaveData = localStorage.getItem('rewind-pearl-load-save')
  if (loadSaveData) {
    localStorage.removeItem('rewind-pearl-load-save')

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
