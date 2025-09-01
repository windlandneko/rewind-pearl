import DialogueManager from './DialogueManager.js'
import AssetManager from './AssetManager.js'
import LoadingManager from './LoadingManager.js'
import Game2D from './game2d/Game2D.js'
import { $, wait } from './utils.js'

async function init(skipAssetLoading = false) {
  try {
    LoadingManager.init()
    if (!skipAssetLoading) {
      await AssetManager.loadFromManifest('assets/manifest.json', data =>
        LoadingManager.updateProgress(data)
      )
    }
    await LoadingManager.hide()
  } catch (error) {
    LoadingManager.$action.classList.remove('hidden')
    throw error
  }

  await DialogueManager.play('test_scene')
  await wait(1000)
  Game2D.loadLevel()
  Game2D.startLevel()
}

$('#loading-retry').addEventListener('click', () => init())
$('#loading-skip').addEventListener('click', () => init(true))

init()
