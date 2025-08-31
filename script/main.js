import Keyboard from './keyboard.js'
import Dialogue from './dialogue.js'
import Asset from './asset.js'

await Asset.loadFromManifest('assets/manifest.json')

Keyboard.onKeydown(['Enter', 'Space'], () => {
  Dialogue.next()
})

let last = performance.now()
Keyboard.onKeydown(['LCtrl', 'RCtrl'], () => {
  const k = 0.8
  const triggerSkip = t => {
    console.log(performance.now() - last)
    last = performance.now()

    if (Keyboard.anyPressed(['LCtrl', 'RCtrl'])) {
      Dialogue.next(true)
      t = k * t + (1 - k) * 50
      setTimeout(() => triggerSkip(t), t)
    }
  }

  setTimeout(() => triggerSkip(200), 200)
})

Dialogue.start('dialogue/test_scene')
