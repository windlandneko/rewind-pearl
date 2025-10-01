export const $ = selector => document.querySelector(selector)
export const $$ = selector => document.querySelectorAll(selector)

export const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Throttle a function to limit its execution rate
 * @param {Function} func
 * @param {number} interval
 * @returns {Function}
 */
export const throttle = (func, interval) => {
  let lastTime = 0
  return (...args) => {
    const now = performance.now()
    if (now - lastTime >= interval) {
      lastTime = now
      func(...args)
    }
  }
}

/**
 * Debounce a function to delay its execution until after a specified delay
 * @param {Function} func
 * @param {number} delay
 * @returns {Function}
 */
export const debounce = (func, delay) => {
  let handle = null
  return (...args) => {
    clearTimeout(handle)
    handle = setTimeout(() => {
      handle = null
      func(...args)
    }, delay)
  }
}

/**
 * Simple event listener class
 */
export class EventListener {
  /** @type {Map<string, Function[]>} */
  #listeners

  constructor() {
    this.#listeners = new Map()
  }

  /**
   * Register a persistent listener
   *
   * @param {string} event
   * @param {Function} callback
   * @returns {Function} A function to unregister the callback
   */
  on(event, callback) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, [])
    }
    this.#listeners.get(event).push(callback)

    return () => {
      const callbacks = this.#listeners.get(event)
      this.#listeners.set(
        event,
        callbacks.filter(cb => cb !== callback)
      )
    }
  }

  /**
   * Register a one-time listener
   *
   * @param {string} event
   * @param {Function} callback
   */
  /**
   * Register a one-time listener
   *
   * @param {string} event
   * @param {Function} callback
   * @returns {Function} A function to unregister the callback
   */
  once(event, callback) {
    const removeListener = this.on(event, (...args) => {
      removeListener()
      callback(...args)
    })
    return removeListener
  }

  /**
   * Emit an event with the given arguments
   * @param {string} event
   * @param  {...any} args
   */
  emit(event, ...args) {
    if (!this.#listeners.has(event)) return
    for (const callback of this.#listeners.get(event)) {
      callback(...args)
    }
  }

  /**
   * Check if there are any listeners for the specified event
   * @param {string} event
   * @returns {boolean}
   */
  isEmpty(event) {
    return (
      !this.#listeners.has(event) || this.#listeners.get(event).length === 0
    )
  }
}

export function hash2D(i, j, n) {
  let h = i * 374761393 + j * 668265263
  h = (h ^ (h >> 13)) * 1274126177
  h = h ^ (h >> 16)
  return Math.abs(h) % n
}
