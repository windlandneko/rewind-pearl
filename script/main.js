import KeyboardManager from './keyboard.js'
import DialogueManager from './dialogue.js'
import AssetManager from './asset.js'
import LoadingManager from './loader.js'
import { $ } from './utils.js'

const init = async (skipAssetLoading = false) => {
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

  KeyboardManager.onKeydown(['Enter', 'Space'], () => {
    DialogueManager.next()
  })

  KeyboardManager.onKeydown(['LCtrl', 'RCtrl'], () => {
    const k = 0.6
    const triggerSkip = t => {
      if (KeyboardManager.anyActive(['LCtrl', 'RCtrl'])) {
        DialogueManager.next(true)
        t = k * t + (1 - k) * 30
        setTimeout(() => triggerSkip(t), t)
      }
    }

    setTimeout(() => triggerSkip(200), 200)
  })

  DialogueManager.start('dialogue/test_scene')
}

$('#loading-retry').addEventListener('click', () => init())
$('#loading-skip').addEventListener('click', () => init(true))

init()
