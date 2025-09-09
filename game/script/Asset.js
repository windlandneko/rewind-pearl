/**
 * Game Asset Manager
 *
 * @author windlandneko
 */
class Asset {
  #assets = new Map()
  basePath = './'

  /**
   * 获取已加载的资源
   * @param {string} key - 资源的键名
   * @returns {any} 资源对象
   */
  get(key) {
    if (!this.has(key)) {
      console.warn(`Asset key not found: ${key}`)
    }
    return this.#assets.get(key)
  }

  /**
   * 检查资源是否已加载
   * @param {string} key - 资源的键名
   * @returns {boolean}
   */
  has(key) {
    return this.#assets.has(key)
  }

  /**
   * 加载 manifest 中的所有资源文件
   * @param {Object|string} manifest - 包含资源信息的JSON对象或文件路径
   * @param {Function} [onProgress] - 进度回调函数，接收参数 (current, total, currentFile)
   */
  async loadFromManifest(manifest, onProgress) {
    if (typeof manifest === 'string') {
      this.basePath = manifest
      manifest = await this.#loadJSON(manifest + 'manifest.json')
    }

    if (!manifest || typeof manifest !== 'object') {
      throw new Error('Invalid manifest provided')
    }

    this.onProgress = onProgress

    const tasks = []

    // 使用箭头函数以绑定 this
    const loadRecursively = (obj, basePath = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const path = basePath ? `${basePath}/${key}` : key

        if (typeof value === 'string') {
          if (!this.has(path)) {
            tasks.push({ path, url: value })
          }
        } else if (typeof value === 'object') {
          loadRecursively(value, path)
        } else {
          throw new Error(`Invalid value for asset "${path}": ${value}`)
        }
      }
    }

    loadRecursively(manifest)

    let count = 0,
      errorCount = 0
    const total = tasks.length

    return Promise.all(
      tasks.map(item =>
        this.load(item.url)
          .then(asset => {
            this.#assets.set(item.path, asset)
            this.onProgress?.({
              type: 'completed',
              count: ++count,
              errorCount,
              total,
              current: item.path,
            })
            return asset
          })
          .catch(error => {
            count++
            this.onProgress?.({
              type: 'failed',
              count: ++count,
              errorCount: ++errorCount,
              total,
              current: item.path,
              error,
            })
            throw error
          })
      )
    )
  }

  /**
   * 根据文件扩展名判断资源类型
   * @param {string} extension - 文件扩展名
   * @returns {string} 资源类型
   */
  #getAssetTypeFromExtension(extension) {
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']
    const audioExtensions = ['mp3', 'wav', 'ogg', 'aac']
    const textExtensions = ['txt', 'md']

    if (imageExtensions.includes(extension)) {
      return 'image'
    } else if (audioExtensions.includes(extension)) {
      return 'audio'
    } else if (extension === 'json') {
      return 'json'
    } else if (textExtensions.includes(extension)) {
      return 'text'
    }
    return 'binary'
  }

  /**
   * 加载单个资源
   * @param {string} url - 资源的 URL
   * @param {string} [type] - 资源类型（可选）
   * @returns {Promise}
   */
  async load(url, type) {
    url = this.basePath + url
    // 根据文件扩展名或指定类型决定加载方式
    const extension = url.split('.').pop().toLowerCase()
    const assetType = type || this.#getAssetTypeFromExtension(extension)

    switch (assetType) {
      case 'image':
        return this.#loadImage(url)
      case 'audio':
        return this.#loadAudio(url)
      case 'json':
        return this.#loadJSON(url)
      case 'text':
        return this.#loadText(url)
      default:
        return this.#loadBinary(url)
    }
  }

  /**
   * 加载图片资源
   * @param {string} url - 图片 URL
   * @returns {Promise<HTMLImageElement>}
   */
  async #loadImage(url) {
    return new Promise((res, rej) => {
      const img = new Image()
      img.onload = () => res(img)
      img.onprogress = ({ loaded, total }) => {
        if (!total) return
        this.onProgress?.({ type: 'progress', count: loaded, total })
      }
      img.onerror = () => rej(new Error(`[Asset] Failed to load image: ${url}`))
      img.src = url
    })
  }

  /**
   * 加载音频资源
   * @param {string} url - 音频 URL
   * @returns {Promise<HTMLAudioElement>}
   */
  async #loadAudio(url) {
    return new Promise((res, rej) => {
      const audio = new Audio()
      audio.oncanplaythrough = () => res(audio)
      audio.onprogress = ({ loaded, total }) => {
        if (!total) return
        this.onProgress?.({ type: 'progress', count: loaded, total })
      }
      audio.onerror = () =>
        rej(new Error(`[Asset] Failed to load audio: ${url}`))
      audio.src = url
    })
  }

  /**
   * 加载 JSON 文件
   * @param {string} url - JSON 文件的 URL
   * @returns {Promise<Object>} 解析后的 JSON 对象
   */
  async #loadJSON(url) {
    const req = await fetch(url)
    if (!req.ok) {
      throw new Error(`Failed to load JSON from ${url}: ${req.status}`)
    }
    return req.json()
  }

  /**
   * 加载文本资源
   * @param {string} url - 文本文件 URL
   * @returns {Promise<string>}
   */
  async #loadText(url) {
    const req = await fetch(url)
    if (!req.ok) {
      throw new Error(`Failed to load text from ${url}: ${req.status}`)
    }
    return req.text()
  }

  /**
   * 加载二进制资源
   * @param {string} url - 文件 URL
   * @returns {Promise<ArrayBuffer>}
   */
  async #loadBinary(url) {
    const req = await fetch(url)
    if (!req.ok) {
      throw new Error(`Failed to load binary from ${url}: ${req.status}`)
    }
    return req.arrayBuffer()
  }
}

export default new Asset()
