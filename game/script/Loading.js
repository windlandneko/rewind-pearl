import { $, EventListener, wait } from './utils.js'
import Asset from './Asset.js'

/**
 * 加载页面管理器
 *
 * @author windlandneko
 */
class Loading {
  #listener = new EventListener()

  $container = $('.loading-container')
  $progress = $('.loading-progress-fill')
  $status = $('.loading-status')
  $action = $('.loading-action')
  $error = $('.loading-error')

  constructor() {
    $('#loading-retry').addEventListener('click', () => this.init())
    $('#loading-skip').addEventListener('click', () => this.init(true))
  }

  on(event, callback) {
    this.#listener.on(event, callback)
  }

  /**
   * 更新加载进度
   * @param {string} type - 事件类型
   * @param {number} count - 当前已加载的文件数
   * @param {number} total - 总文件数
   * @param {string} current - 当前正在加载的文件
   * @param {Error} [error] - 加载错误（如果有）
   */
  updateProgress({ type, count, errorCount, total, current, error }) {
    const percentage = Math.round((count / total) * 100)

    this.$progress.style.width = `${percentage}%`

    // 根据类型处理不同的进度显示
    switch (type) {
      case 'failed':
        this.$error.classList.remove('hidden')

        const p = document.createElement('p')
        p.textContent = error.message
        this.$error.appendChild(p)
        this.$error.scrollTop = this.$error.scrollHeight

      case 'completed':
        if (count < total) {
          this.$status.textContent = `正在加载: ${current}`
        } else {
          this.$status.textContent = errorCount
            ? `${errorCount} 个资源加载失败`
            : '加载完成！'
        }
    }
  }

  async init(skipAssetLoading = false) {
    try {
      this.$container.classList.remove('hidden')
      this.$progress.style.width = `0%`
      this.$status.textContent = ''
      this.$error.innerHTML = ''
      this.$action.classList.add('hidden')
      this.$error.classList.add('hidden')
      if (!skipAssetLoading) {
        await Asset.loadFromManifest('assets/', data =>
          this.updateProgress(data)
        )
      }
      await this.hide()
      this.#listener.emit('complete')
    } catch (error) {
      this.$action.classList.remove('hidden')
    }
  }

  /**
   * 添加淡出动画并隐藏加载界面
   * @param {number} [delay=500] - 延迟时间（毫秒）
   */
  async hide() {
    this.$container.classList.add('hidden')
    await wait(300)
    this.$container.remove()
  }
}

export default new Loading()
