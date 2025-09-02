import { EventListener } from './utils.js'

/**
 * 状态机
 *
 * @author windlandneko
 */
class StateMachine {
  #currentState = 'loadingAsset'
  #listeners = new EventListener()

  /**
   * 更新状态机当前状态
   *
   * @param {string} newState 新的状态
   */
  updateState(newState) {
    this.#listeners.emit(`leave:${this.#currentState}`)
    this.#currentState = newState
    this.#listeners.emit(`enter:${this.#currentState}`)
  }

  /**
   * 注册状态机事件监听器
   *
   * @param {string} event 事件名称
   * @param {Function} callback 事件回调函数
   */
  on(event, callback) {
    this.#listeners.on(event, callback)
  }

  /**
   * 触发自定义事件
   *
   * @param {string} event 事件名称
   */
  emit(event) {
    this.#listeners.emit(event)
  }

  /**
   * 等待状态机进入指定状态
   *
   * @param {string} state 需要等待进入的状态名
   * @returns {Promise<void>} 当状态机进入指定状态时 resolve
   */
  async waitState(state) {
    return new Promise(res => this.#listeners.once(`enter:${state}`, res))
  }

  /**
   * 等待指定事件触发
   *
   * @param {string} event 需要等待的事件名
   * @returns {Promise<void>} 当事件触发时 resolve
   */
  async waitEvent(event) {
    return new Promise(res => this.#listeners.once(event, res))
  }

  get state() {
    return this.#currentState
  }
}

export default new StateMachine()
