import Keyboard from './keyboard.js'
import Dialogue from './dialogue.js'
import Asset from './asset.js'

await Asset.loadFromManifest('assets/manifest.json')

Keyboard.onKeydown(['Enter', 'Space'], () => {
  Dialogue.next()
})

Keyboard.onKeydown(['LCtrl', 'RCtrl'], () => {
  const k = 0.6
  const triggerSkip = t => {
    if (Keyboard.anyPressed(['LCtrl', 'RCtrl'])) {
      Dialogue.next(true)
      t = k * t + (1 - k) * 30
      setTimeout(() => triggerSkip(t), t)
    }
  }

  setTimeout(() => triggerSkip(200), 200)
})

Dialogue.start('dialogue/test_scene')
