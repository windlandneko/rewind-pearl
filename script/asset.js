/**
 * Game Asset Manager
 *
 * @author windlandneko
 */
class AssetManager {
  #assets = new Map()
  /** @type {Promise[]} */
  #loadingPromises = []

  /**
   * 获取已加载的资源
   * @param {string} key - 资源的键名
   * @returns {any} 资源对象
   */
  get(key) {
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
   * @param {Object} manifest - 包含资源信息的JSON对象
   */
  async loadFromManifest(manifest, prefix = '') {
    if (typeof manifest === 'string') {
      manifest = await this.#loadJSON(manifest)
    }

    if (!manifest || typeof manifest !== 'object') {
      throw new Error('Invalid manifest provided')
    }

    for (const [key, value] of Object.entries(manifest)) {
      if (typeof value !== 'string') {
        throw new Error(`Invalid URL for asset "${key}": ${value}`)
      }
      this.#loadingPromises.push(
        this.load(value).then(asset => {
          this.#assets.set(key, asset)
        })
      )
    }

    return Promise.all(this.#loadingPromises)
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
    url = 'assets/' + url
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
      img.onload = () => res(url)
      img.onerror = () =>
        rej(new Error(`[AssetManager] Failed to load image: ${url}`))
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
      audio.oncanplaythrough = () => res(url)
      audio.onerror = () =>
        rej(new Error(`[AssetManager] Failed to load audio: ${url}`))
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

export default new AssetManager()
