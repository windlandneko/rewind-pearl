import dialogue from './dialogue.js'
import asset from './asset.js'
import loading from './loading.js'
import { $ } from './utils.js'

async function init(skipAssetLoading = false) {
  try {
    loading.init()
    if (!skipAssetLoading) {
      await asset.loadFromManifest('assets/manifest.json', data =>
        loading.updateProgress(data)
      )
    }
    await loading.hide()
  } catch (error) {
    loading.$action.classList.remove('hidden')
    throw error
  }

  while (true) await dialogue.play('dialogue/test_scene')
}

$('#loading-retry').addEventListener('click', () => init())
$('#loading-skip').addEventListener('click', () => init(true))

init()
