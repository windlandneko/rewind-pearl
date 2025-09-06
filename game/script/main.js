import Dialogue from './Dialogue.js'
import Asset from './Asset.js'
import Loading from './Loading.js'
import Game2D from './game2d/Game2D.js'
import { $, wait } from './utils.js'
import { Level1 } from './game2d/Level.js'

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

  // await Dialogue.play('prologue')
  // await Dialogue.play('test_scene')
  // await wait(1000)
  Game2D.loadLevel(Level1)
  Game2D.start()
}

$('#loading-retry').addEventListener('click', () => init())
$('#loading-skip').addEventListener('click', () => init(true))

init()
