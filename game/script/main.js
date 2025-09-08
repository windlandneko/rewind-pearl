import Dialogue from './Dialogue.js'
import Asset from './Asset.js'
import Loading from './Loading.js'
import Game2D from './game2d/Game2D.js'
import { $, wait } from './utils.js'
import * as LevelManager from './game2d/Level.js'

// 检查用户登录
if (!localStorage.getItem('rewind-pearl-username')) {
  location.assign('../login/index.html')
}

async function init(skipAssetLoading = false) {
  try {
    Loading.init()
    if (!skipAssetLoading) {
      await Asset.loadFromManifest('assets/manifest.json', data =>
        Loading.updateProgress(data)
      )
    }
    await Loading.hide()
  } catch (error) {
    Loading.$action.classList.remove('hidden')
    throw error
  }

  const loadSaveData = localStorage.getItem('rewind-pearl-load-save')
  if (loadSaveData) {
    localStorage.removeItem('rewind-pearl-load-save')

    try {
      const saveData = JSON.parse(loadSaveData)
      Game2D.loadGame(saveData)
    } catch (error) {
      console.error('加载存档失败:', error)
      // 如果加载失败，启动新游戏
      startNewGame()
    }
  } else {
    startNewGame()
  }
}

async function startNewGame() {
  // await Dialogue.play('prologue')
  Game2D.loadLevel(LevelManager.PrologueLevel)
  Game2D.start()
}

$('#loading-retry').addEventListener('click', () => init())
$('#loading-skip').addEventListener('click', () => init(true))

init()
