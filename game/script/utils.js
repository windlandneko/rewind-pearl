export const $ = selector => document.querySelector(selector)
export const $$ = selector => document.querySelectorAll(selector)

export const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Throttle a function to limit its execution rate
 * @param {Function} func
 * @param {number} delay
 * @returns {Function}
 */
export const throttle = (func, delay) => {
  let lastTime = 0
  return (...args) => {
    const now = performance.now()
    if (now - lastTime >= delay) {
      lastTime = now
      func(...args)
    }
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

/**
 * A simple pseudo-random number generator (PRNG)
 * using a linear congruential generator (LCG) algorithm
 */
export class PesudoRandom {
  #seed

  constructor(seed = 0) {
    this.#seed = seed
  }

  set seed(seed) {
    this.#seed = seed
  }

  /**
   * Get a random number in the range [0, 1)
   * @returns {number} A random number in the range [0, 1)
   */
  next() {
    this.#seed = (this.#seed * 9301 + 49297) % 233280
    return this.#seed / 233280
  }

  /**
   * Get a random integer in the range [0, n)
   * @param {number} n
   * @returns {number}
   */
  nextInt(n) {
    return Math.floor(this.next() * n)
  }
}
