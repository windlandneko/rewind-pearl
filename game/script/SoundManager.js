import Asset from './Asset.js'

/**
 * BGM & Sound Effects Manager
 *
 * @author windlandneko
 */
class SoundManager {
  /** @type {Map<string, Audio[]>} */
  sounds = new Map()
  BGM = null
  currentBGMName = null

  pendingBGM = null
  #userInteractionHandler = null

  playBGM(
    name,
    { loop = true, volume = 0.4, fadeIn = true, fadeTime = 2000 } = {}
  ) {
    window.tmp = this
    if (this.currentBGMName === name) return
    this.currentBGMName = name

    this.stopBGM({ fadeIn, fadeTime: fadeTime / 2 })
    const bgm = Asset.get('audio/' + name)

    if (!bgm) {
      console.warn(`BGM not found: ${name}`)
      return
    }

    bgm.loop = loop
    bgm.currentTime = 0
    bgm.volume = fadeIn ? 0 : volume
    bgm.play().catch(() => {
      console.warn(
        `Failed to play bgm: ${name}, will wait for user interaction.`
      )
      this.pendingBGM = { name, options: { loop, volume, fadeIn, fadeTime } }
      this.currentBGMName = null
      this.BGM = null
      this.#waitForUserInteraction()
    })

    if (fadeIn) this.#fadeAudio(bgm, 0, volume, fadeTime)

    this.BGM = bgm
  }

  pauseBGM() {
    const bgm = this.BGM
    if (!bgm) return
    bgm.pause()
  }

  resumeBGM() {
    const bgm = this.BGM
    if (!bgm) return
    bgm.play().catch(() => {
      console.warn(
        `[SoundManager] Failed to resume bgm: ${this.currentBGMName}, will wait for user interaction.`
      )
      if (this.currentBGMName) {
        this.pendingBGM = {
          name: this.currentBGMName,
          options: {
            loop: bgm.loop,
            volume: bgm.volume,
            fadeIn: false,
            fadeTime: 0,
          },
        }
        this.#waitForUserInteraction()
      }
    })
  }

  stopBGM({ fadeOut = true, fadeTime = 2000 } = {}) {
    // 停止BGM时清除等待播放
    this.pendingBGM = null
    this.#removeUserInteractionHandler()
    const bgm = this.BGM
    if (!bgm) return
    if (fadeOut)
      this.#fadeAudio(bgm, bgm.volume, 0, fadeTime, () => this.#abortBGM(bgm))
    else this.#abortBGM(bgm)
  }

  #abortBGM(bgm) {
    if (bgm) {
      bgm.pause()
      bgm.currentTime = 0
      bgm = null
    }
  }

  play(name, { single = false, volume = 0.5 } = {}) {
    if (single) {
      const instances = this.sounds.get(name) || []
      if (instances.some(audio => !audio.paused && !audio.ended)) {
        return
      }
    }

    const sound = Asset.get('soundEffects/' + name)
    if (!sound) {
      console.warn(`Sound not found: ${name}`)
      return
    }
    const audio = sound.cloneNode()
    audio.currentTime = 0
    audio.volume = volume
    audio.play().catch(() => {
      console.warn(`Failed to play sound: ${name}`)
    })

    if (!this.sounds.has(name)) {
      this.sounds.set(name, [])
    }
    this.sounds.get(name).push(audio)

    audio.addEventListener('ended', () => {
      const arr = this.sounds.get(name)
      if (arr) {
        const idx = arr.indexOf(audio)
        if (idx !== -1) arr.splice(idx, 1)
      }
    })
  }

  stopSound() {
    for (const [, arr] of this.sounds.entries()) {
      arr.forEach(audio => {
        audio.pause()
        audio.currentTime = 0
      })
      arr.length = 0
    }
    this.sounds.clear()
  }

  /** 等待用户交互后尝试播放BGM */
  #waitForUserInteraction() {
    if (this.#userInteractionHandler) return
    const handler = () => {
      if (this.pendingBGM) {
        const { name, options } = this.pendingBGM
        this.pendingBGM = null
        this.#removeUserInteractionHandler()
        this.playBGM(name, options)
      }
    }
    addEventListener('click', handler, { once: true })
    addEventListener('keydown', handler, { once: true })
    this.#userInteractionHandler = handler
  }

  #removeUserInteractionHandler() {
    if (!this.#userInteractionHandler) return
    removeEventListener('click', this.#userInteractionHandler, {
      once: true,
    })
    removeEventListener('keydown', this.#userInteractionHandler, {
      once: true,
    })
    this.#userInteractionHandler = null
  }

  #fadeAudio(audio, startVolume, endVolume, duration, callback) {
    const startTime = performance.now()
    const volumeDiff = endVolume - startVolume

    const updateVolume = () => {
      const elapsed = performance.now() - startTime
      const progress = Math.max(Math.min(elapsed / duration, 1), 0)

      audio.volume = startVolume + volumeDiff * progress

      if (progress < 1) {
        requestAnimationFrame(updateVolume)
      } else if (callback) {
        callback()
      }
    }

    requestAnimationFrame(updateVolume)
  }
}

export default new SoundManager()
