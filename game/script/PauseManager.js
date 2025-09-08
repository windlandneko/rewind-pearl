import SaveManager from './SaveManager.js'
import Keyboard from './Keyboard.js'

/**
 * 暂停管理器 - 负责游戏暂停状态的控制和界面管理
 */
export class PauseManager {
  constructor() {
    this.isPaused = false
    this.game = null
    this.escKeyHandler = null

    // DOM 元素
    this.$pauseOverlay = null
    this.$saveManagerModal = null
    this.$helpModal = null

    this.init()
  }

  /**
   * 初始化暂停管理器
   */
  init() {
    this.#initDOMElements()
    this.#bindEvents()
  }

  /**
   * 初始化DOM元素
   */
  #initDOMElements() {
    this.$pauseOverlay = document.getElementById('pause-overlay')
    this.$saveManagerModal = document.getElementById('save-manager-modal')
    this.$helpModal = document.getElementById('help-modal')
  }

  /**
   * 绑定事件监听器
   */
  #bindEvents() {
    // 暂停界面按钮事件
    document
      .getElementById('resume-btn')
      ?.addEventListener('click', () => this.resume())

    document.getElementById('save-btn')?.addEventListener('click', () => {
      this.#handleSaveGame()
    })

    document.getElementById('load-btn')?.addEventListener('click', () => {
      this.#handleLoadGame()
    })

    document.getElementById('help-btn')?.addEventListener('click', () => {
      this.#handleShowHelp()
    })

    document.getElementById('title-btn')?.addEventListener('click', () => {
      this.#handleReturnToTitle()
    })

    // 存档管理界面事件
    document
      .getElementById('save-manager-close')
      ?.addEventListener('click', () => {
        this.#hideSaveManagerModal()
      })

    // 帮助界面事件
    document.getElementById('help-close')?.addEventListener('click', () => {
      this.#hideHelpModal()
    })

    // 点击遮罩关闭模态框
    this.$saveManagerModal?.addEventListener('click', e => {
      if (e.target === this.$saveManagerModal) {
        this.#hideSaveManagerModal()
      }
    })

    this.$helpModal?.addEventListener('click', e => {
      if (e.target === this.$helpModal) {
        this.#hideHelpModal()
      }
    })
  }

  /**
   * 暂停游戏
   */
  pause() {
    if (this.isPaused || !this.game) return

    this.isPaused = true
    this.$pauseOverlay?.classList.add('show')

    // 通知游戏暂停
    this.game.onPause?.()

    // 设置ESC键监听器
    this.#setEscKeyHandler(() => this.resume())
  }

  /**
   * 恢复游戏
   */
  resume() {
    if (!this.isPaused || !this.game) return

    this.isPaused = false
    this.$pauseOverlay?.classList.remove('show')

    // 通知游戏恢复
    this.game.onResume?.()

    // 清除ESC键监听器
    this.#clearEscKeyHandler()
  }

  /**
   * 切换暂停状态
   */
  toggle() {
    if (this.isPaused) {
      this.resume()
    } else {
      this.pause()
    }
  }

  /**
   * 处理保存游戏
   */
  #handleSaveGame() {
    if (!this.game?.saveGame) {
      console.warn('游戏实例没有提供保存功能')
      return
    }

    SaveManager.showSavePrompt(saveName => {
      this.game.saveGame(saveName)
    })
  }

  /**
   * 处理加载游戏
   */
  #handleLoadGame() {
    if (!this.game?.loadGame) {
      console.warn('游戏实例没有提供加载功能')
      return
    }

    const saveList = document.getElementById('save-list')
    this.$saveManagerModal?.classList.add('show')

    this.#setEscKeyHandler(() => this.#hideSaveManagerModal())

    SaveManager.loadSaveList(saveList, saveData => {
      // 加载存档
      localStorage.setItem('rewind-pearl-load-save', JSON.stringify(saveData))
      location.reload()
    })
  }

  /**
   * 处理显示帮助
   */
  #handleShowHelp() {
    this.$helpModal?.classList.add('show')
    this.#setEscKeyHandler(() => this.#hideHelpModal())
  }

  /**
   * 处理返回标题
   */
  #handleReturnToTitle() {
    if (confirm('确定要返回标题页面吗？未保存的进度将会丢失。')) {
      window.location.href = '../index.html'
    }
  }

  /**
   * 隐藏存档管理模态框
   */
  #hideSaveManagerModal() {
    this.$saveManagerModal?.classList.remove('show')
    this.#setEscKeyHandler(() => this.resume())
  }

  /**
   * 隐藏帮助模态框
   */
  #hideHelpModal() {
    this.$helpModal?.classList.remove('show')
    this.#setEscKeyHandler(() => this.resume())
  }

  /**
   * 设置ESC键处理器
   * @param {Function} handler - 处理函数
   */
  #setEscKeyHandler(handler) {
    this.#clearEscKeyHandler()
    if (handler) {
      this.escKeyHandler = Keyboard.onKeydown('Esc', handler)
    }
  }

  /**
   * 清除ESC键处理器
   */
  #clearEscKeyHandler() {
    if (this.escKeyHandler) {
      this.escKeyHandler()
      this.escKeyHandler = null
    }
  }

  /**
   * 销毁暂停管理器
   */
  destroy() {
    this.#clearEscKeyHandler()
    this.game = null
  }
}

// 创建全局暂停管理器实例
export default new PauseManager()
