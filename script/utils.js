export const $ = selector => document.querySelector(selector)
export const $$ = selector => document.querySelectorAll(selector)

export const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * A simple event listener class.
 *
 * @author windlandneko
 */
export class EventListener {
  /** @type {Map<string, Function[]>} */
  #listeners

  constructor() {
    this.#listeners = new Map()
  }

  /**
   * Register a callback for a specific event.
   * @param {string} event
   * @param {Function} callback
   * @returns {Function} A function to unregister the callback.
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
   * Emit an event with the given arguments.
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
   * Check if there are any listeners for the specified event.
   * @param {string} event
   * @returns {boolean}
   */
  isEmpty(event) {
    return (
      !this.#listeners.has(event) || this.#listeners.get(event).length === 0
    )
  }
}
