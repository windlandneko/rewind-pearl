const ACHIEVEMENTS_KEY = 'rewind-pearl-achievements'
const USER_KEY = 'rewind-pearl-username'

/**
 * Achievement 成就管理类
 * 提供解锁、查询、重置等接口。数据存储于 localStorage
 *
 * @author windlandneko
 */
class Achievement {
  game

  /**
   * 当前用户名
   * @returns {string|null}
   */
  get #username() {
    return localStorage.getItem(USER_KEY)
  }

  /**
   * 获取所有用户的成就数据
   * @returns {Object}
   */
  #getAllData() {
    try {
      const saved = localStorage.getItem(ACHIEVEMENTS_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }

  /**
   * 保存所有用户的成就数据
   * @param {Object} data
   * @private
   */
  #save(data) {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(data))
  }

  /**
   * 解锁指定成就
   * @param {string} id 成就ID
   * @returns {boolean} 是否成功
   */
  add(id) {
    const user = this.#username
    if (!user) return false
    const allData = this.#getAllData()
    if (!allData[user]) allData[user] = {}

    if (!allData[user][id]) {
      this.game.showNotification(`成就已解锁：${id}`, {
        icon: '🏆',
        type: 'success',
      })
      this.game.sound.play('challenge_complete')
      allData[user][id] = true
      this.#save(allData)
    }

    return true
  }

  /**
   * 判断成就是否已解锁
   * @param {string} id 成就ID
   * @returns {boolean}
   */
  has(id) {
    const user = this.#username
    if (!user) return false
    const allData = this.#getAllData()
    return !!(allData[user] && allData[user][id])
  }

  /**
   * 移除成就
   * @param {string} id 成就ID
   * @returns {boolean}
   */
  remove(id) {
    const user = this.#username
    if (!user) return false
    const allData = this.#getAllData()
    if (allData[user]) {
      delete allData[user][id]
      this.#save(allData)
      return true
    }
    return false
  }

  /**
   * 重置当前用户所有成就
   * @returns {boolean}
   */
  clear() {
    const user = this.#username
    if (!user) return false
    const allData = this.#getAllData()
    allData[user] = {}
    this.#save(allData)
    return true
  }

  /**
   * 获取所有已解锁成就ID数组
   * @returns {string[]}
   */
  values() {
    const user = this.#username
    if (!user) return []
    const allData = this.#getAllData()
    return Object.keys(allData[user] || {}).filter(id => allData[user][id])
  }
}

export default new Achievement()
