import { EventListener } from './utils.js'

/**
 * A class to manage keyboard input.
 *
 * This class listens for keyboard events and provides a way to register
 * callbacks for specific keys.
 *
 * @author windlandneko, ri-nai
 */
class KeyboardManager {
  KEYMAP = new Map([
    // Modifier Keys
    ['ShiftLeft', 'LShift'],
    ['ShiftRight', 'RShift'],
    ['ControlLeft', 'LCtrl'],
    ['ControlRight', 'RCtrl'],
    ['AltLeft', 'LAlt'],
    ['AltRight', 'RAlt'],
    ['MetaLeft', 'LWin'],
    ['MetaRight', 'RWin'],

    // Function Keys
    ['Escape', 'Esc'],
    ['F1', 'F1'],
    ['F2', 'F2'],
    ['F3', 'F3'],
    ['F4', 'F4'],
    ['F5', 'F5'],
    ['F6', 'F6'],
    ['F7', 'F7'],
    ['F8', 'F8'],
    ['F9', 'F9'],
    ['F10', 'F10'],
    ['F11', 'F11'],
    ['F12', 'F12'],

    // Alphanumeric Keys
    ['Digit0', '0'],
    ['Digit1', '1'],
    ['Digit2', '2'],
    ['Digit3', '3'],
    ['Digit4', '4'],
    ['Digit5', '5'],
    ['Digit6', '6'],
    ['Digit7', '7'],
    ['Digit8', '8'],
    ['Digit9', '9'],

    ['KeyA', 'A'],
    ['KeyB', 'B'],
    ['KeyC', 'C'],
    ['KeyD', 'D'],
    ['KeyE', 'E'],
    ['KeyF', 'F'],
    ['KeyG', 'G'],
    ['KeyH', 'H'],
    ['KeyI', 'I'],
    ['KeyJ', 'J'],
    ['KeyK', 'K'],
    ['KeyL', 'L'],
    ['KeyM', 'M'],
    ['KeyN', 'N'],
    ['KeyO', 'O'],
    ['KeyP', 'P'],
    ['KeyQ', 'Q'],
    ['KeyR', 'R'],
    ['KeyS', 'S'],
    ['KeyT', 'T'],
    ['KeyU', 'U'],
    ['KeyV', 'V'],
    ['KeyW', 'W'],
    ['KeyX', 'X'],
    ['KeyY', 'Y'],
    ['KeyZ', 'Z'],

    // Navigation Keys
    ['ArrowUp', 'Up'],
    ['ArrowDown', 'Down'],
    ['ArrowLeft', 'Left'],
    ['ArrowRight', 'Right'],
    ['Home', 'Home'],
    ['End', 'End'],
    ['PageUp', 'Page Up'],
    ['PageDown', 'Page Down'],

    // Control Keys
    ['Enter', 'Enter'],
    ['Space', 'Space'],
    ['Backspace', 'Backspace'],
    ['Tab', 'Tab'],
    ['Delete', 'Delete'],
    ['Insert', 'Insert'],
    ['CapsLock', 'Caps Lock'],
    ['NumLock', 'Num Lock'],
    ['ScrollLock', 'Scroll Lock'],
    ['Pause', 'Pause'],
    ['PrintScreen', 'Print Screen'],

    // Numpad Keys
    ['Numpad0', 'NUMPAD0'],
    ['Numpad1', 'NUMPAD1'],
    ['Numpad2', 'NUMPAD2'],
    ['Numpad3', 'NUMPAD3'],
    ['Numpad4', 'NUMPAD4'],
    ['Numpad5', 'NUMPAD5'],
    ['Numpad6', 'NUMPAD6'],
    ['Numpad7', 'NUMPAD7'],
    ['Numpad8', 'NUMPAD8'],
    ['Numpad9', 'NUMPAD9'],
    ['NumpadMultiply', 'Mul'],
    ['NumpadAdd', 'Add'],
    ['NumpadSubtract', 'Sub'],
    ['NumpadDecimal', 'Dec'],
    ['NumpadDivide', 'Div'],

    // Miscellaneous
    ['ContextMenu', 'Apps'],
    ['Help', 'Help'],
  ])

  /** @type {Map<string, boolean>} */
  #record = new Map()

  constructor() {
    this.KEYMAP.forEach(value => {
      this.#record.set(value, false)
    })

    addEventListener('keydown', event => {
      const key = this.KEYMAP.get(event.code)

      if (!this.#record.has(key)) {
        console.warn(`[Keyboard] Key not registered: ${key}`)
        return
      }

      if (!this.#record.get(key)) this.listener.emit(`keydown:${key}`)
      this.#record.set(key, true)

      // Only prevent default for bound keys
      if (!this.listener.isEmpty(`keydown:${key}`)) {
        event.preventDefault()
      }
    })

    addEventListener('keyup', event => {
      const key = this.KEYMAP.get(event.code)

      if (!this.#record.has(key)) {
        console.warn(`[Keyboard] Key not registered: ${key}`)
        return
      }

      this.#record.set(key, false)
      this.listener.emit(`keyup:${key}`)
    })

    // bugfix: reset all keys on blur
    addEventListener('blur', () => {
      this.#record.forEach((_, key) => this.#record.set(key, false))
    })

    this.listener = new EventListener()
  }

  /**
   * Register a callback for when a key is pressed.
   * @param {string | string[]} key
   * @param {Function} callback
   */
  onKeydown(key, callback) {
    if (typeof key === 'string')
      return this.listener.on(`keydown:${key}`, () => callback(key))

    const offCallbacks = key.map(k => this.onKeydown(k, callback))
    return () => offCallbacks.forEach(fn => fn())
  }

  /**
   * Register a callback for when a key is released.
   * @param {string} key
   * @param {Function} callback
   */
  onKeyup(key, callback) {
    if (typeof key === 'string')
      return this.listener.on(`keyup:${key}`, () => callback(key))

    const offCallbacks = key.map(k => this.onKeyup(k, callback))
    return () => offCallbacks.forEach(fn => fn())
  }

  /**
   * Check if the specified key is currently pressed.
   * @param {string} key
   */
  isActive(key) {
    return this.#record.get(key) || false
  }

  /**
   * Check if all the specified keys are currently pressed.
   * @param {string[]} keys
   */
  allActive(keys) {
    return keys.reduce((ans, key) => ans & this.isActive(key), true)
  }

  /**
   * Check if any of the specified keys are currently pressed.
   * @param {string[]} keys
   */
  anyActive(keys) {
    return keys.reduce((ans, key) => ans | this.isActive(key), false)
  }
}

export default new KeyboardManager()
