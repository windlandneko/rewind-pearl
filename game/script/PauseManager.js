import SaveManager from './SaveManager.js'
import Keyboard from './Keyboard.js'
import { $, EventListener } from './utils.js'

/**
 * 暂停管理器 - 负责游戏暂停状态的控制和界面管理
 */
export class PauseManager {
  #listener = new EventListener()

  constructor() {
    this.isPaused = false
    this.game = null
    this.escKeyHandler = null

    this.$pauseOverlay = $('#pause-overlay')
    this.$saveManagerModal = $('#save-manager-modal')
    this.$helpModal = $('#help-modal')

    $('#resume-btn')?.addEventListener('click', () => this.resume())
    $('#save-btn')?.addEventListener('click', () => this.#onSaveGame())
    $('#load-btn')?.addEventListener('click', () => this.#onLoadGame())
    $('#help-btn')?.addEventListener('click', () => this.#onShowHelp())
    $('#title-btn')?.addEventListener('click', () => this.#onReturnToTitle())
    $('#help-close')?.addEventListener('click', () => this.#hideHelpModal())
    $('save-manager-close')?.addEventListener('click', () => {
      this.#hideSaveManagerModal()
    })
    this.$saveManagerModal?.addEventListener('click', event => {
      if (event.target === this.$saveManagerModal) this.#hideSaveManagerModal()
    })
    this.$helpModal?.addEventListener('click', event => {
      if (event.target === this.$helpModal) this.#hideHelpModal()
    })
  }

  on(event, listener) {
    this.#listener.on(event, listener)
  }

  /**
   * 暂停游戏
   */
  pause() {
    if (this.isPaused) return

    this.isPaused = true
    this.$pauseOverlay.classList.add('show')

    // 通知游戏暂停
    this.#listener.emit('pause')

    // 设置ESC键监听器
    this.#setEscKeyHandler(() => this.resume())
  }

  /**
   * 恢复游戏
   */
  resume() {
    if (!this.isPaused) return

    this.isPaused = false
    this.$pauseOverlay.classList.remove('show')

    // 通知游戏恢复
    this.#listener.emit('resume')

    // 清除ESC键监听器
    this.#clearEscKeyHandler()
  }

  /**
   * 切换暂停状态
   */
  toggle() {
    if (this.isPaused) this.resume()
    else this.pause()
  }

  /**
   * 处理保存游戏
   */
  #onSaveGame() {
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
  #onLoadGame() {
    if (!this.game?.loadGame) {
      console.warn('游戏实例没有提供加载功能')
      return
    }

    const saveList = $('#save-list')
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
  #onShowHelp() {
    this.$helpModal?.classList.add('show')
    this.#setEscKeyHandler(() => this.#hideHelpModal())
  }

  /**
   * 处理返回标题
   */
  #onReturnToTitle() {
    this.game.saveGame('自动保存')
    location.assign('../index.html')
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
}

// 创建全局暂停管理器实例
export default new PauseManager()
