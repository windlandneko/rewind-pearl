import Asset from './asset.js'

/**
 * Dialogue Manager
 *
 * @author windlandneko
 */
class DialogueManager {
  dialogueData = []
  eventIndex = 0

  characters = new Map()
  leftCharacter = []
  rightCharacter = []
  currentSpeaker = null

  isPlaying = false
  isWaiting = false

  constructor() {
    // 对话框
    this.$dialogue = document.querySelector('.dialogue-container')
    this.$speaker = this.$dialogue.querySelector('.speaker-name')
    this.$text = this.$dialogue.querySelector('.dialogue-text')

    // 角色立绘
    this.$character = document.querySelector('.character-container')
  }

  /**
   * 开始播放对话
   */
  start(dialogue) {
    this.dialogueData = Asset.get(dialogue)

    this.eventIndex = 0
    this.characters.clear()
    this.leftCharacter = []
    this.rightCharacter = []
    this.isPlaying = true
    this.isWaiting = false
    this.$dialogue.classList.add('visible')
    this.$character.classList.add('visible')

    this.processEvent()
  }

  /**
   * 停止播放对话
   */
  stop() {
    this.eventIndex = 0
    this.leftCharacter = []
    this.rightCharacter = []
    this.isPlaying = false
    this.isWaiting = false
    this.$dialogue.classList.remove('visible')
    this.characters.forEach(character => this.#onRemove(character))

    clearTimeout(this.waitHandler)
  }

  /**
   * 继续下一个事件
   */
  next(force = false) {
    if (!this.isPlaying) return
    if (!force && this.isWaiting) return
    this.eventIndex++
    this.processEvent()
  }

  /**
   * 处理当前事件
   */
  processEvent() {
    if (this.eventIndex >= this.dialogueData.events.length) {
      this.stop()
      return
    }

    const event = this.dialogueData.events[this.eventIndex]

    if (typeof event === 'string') {
      this.#onDialogue({ text: event })
      return
    }

    switch (event.type) {
      case 'add':
        this.#onAddCharacter(event)
        break
      case 'dialogue':
        this.#onDialogue(event)
        break
      case 'remove':
        this.#onRemove(event)
        break
      case 'wait':
        this.#onWait(event)
        break
      default:
        console.warn('未知的事件:', event)
        this.next()
    }
  }

  /**
   * 添加角色到场景
   * @param {Object} event - 添加角色事件
   */
  #onAddCharacter(event) {
    const { id, emotion = 'normal', position } = event

    if (!id || this.characters.has(id)) {
      console.warn('角色已存在或ID无效:', id)
      return
    }

    const $el = document.createElement('img')
    $el.classList.add('character', position)
    this.$character.appendChild($el)

    const character = { ...event, element: $el }
    this.characters.set(id, character)
    this.#updateCharacterEmotion(character, emotion)

    if (position === 'left') {
      this.leftCharacter.push(character)
    } else {
      this.rightCharacter.push(character)
    }
    this.#updatePosition()

    // 非交互节点
    this.next()
  }

  /**
   * 显示对话
   * @param {Object} event - 对话事件
   */
  #onDialogue(event) {
    const { id, emotion, text } = event
    const character = this.characters.get(id)

    if (character) {
      console.log('移到最前', text, character)
      // 移到最前
      if (character.position === 'left') {
        this.leftCharacter = this.leftCharacter.filter(c => c.id !== id)
        this.leftCharacter.push(character)
      } else {
        this.rightCharacter = this.rightCharacter.filter(c => c.id !== id)
        this.rightCharacter.push(character)
      }

      this.#updatePosition()
    }
    if (character?.title) this.$speaker.textContent = character.title
    if (emotion) this.#updateCharacterEmotion(character, emotion)
    if (text) {
      this.$text.textContent = text
    } else {
      // 如果没有文本内容，则是非交互节点
      this.next()
    }
  }

  /**
   * 移除角色
   * @param {Object} event - 移除角色事件
   */
  #onRemove(event) {
    const { id } = event
    const character = this.characters.get(id)
    if (!character) return

    character.element.classList.add('fade-out')
    setTimeout(() => {
      if (character.element.parentNode === this.$character) {
        this.$character.removeChild(character.element)
      }
      this.characters.delete(id)

      this.#updatePosition()
    }, 300)

    if (character.position === 'left') {
      this.leftCharacter = this.leftCharacter.filter(c => c.id !== id)
    } else {
      this.rightCharacter = this.rightCharacter.filter(c => c.id !== id)
    }

    this.next()
  }

  /**
   * 等待事件
   * @param {Object} event - 等待事件
   */
  #onWait(event) {
    const { duration } = event
    this.isWaiting = true

    this.waitHandler = setTimeout(() => {
      this.isWaiting = false
    }, duration)

    this.next(true)
  }

  // 更新角色表情
  #updateCharacterEmotion(character, emotion) {
    let assetUrl = `character/${character.key}:${emotion}`
    if (Asset.has(assetUrl)) assetUrl = Asset.get(assetUrl)
    else {
      console.warn('角色资源不存在:', assetUrl)
      assetUrl = Asset.get('character/gunmu')
    }

    character.emotion = emotion // todo: don't need this line
    character.element.src = assetUrl
  }

  // 更新全部角色位置、高亮
  #updatePosition() {
    this.leftCharacter.forEach((character, index, { length }) => {
      const k = (index + 1) / length
      character.element.style.transform = `translateY(${40 * (1 - k)}px)`
      character.element.style.left = `calc(var(--character-width) * ${k} - var(--character-offset))`
      character.element.style.right = 'auto'
      character.element.style.zIndex = 10 + index
      if (index === length - 1) character.element.classList.add('highlighted')
      else character.element.classList.remove('highlighted')
    })

    this.rightCharacter.forEach((character, index, { length }) => {
      const k = (index + 1) / length
      character.element.style.transform = `translateY(${40 * (1 - k)}px) scaleX(-1)`
      character.element.style.right = `calc(var(--character-width) * ${k} - var(--character-offset))`
      character.element.style.left = 'auto'
      character.element.style.zIndex = 10 + index
      if (index === length - 1) character.element.classList.add('highlighted')
      else character.element.classList.remove('highlighted')
    })
  }
}

export default new DialogueManager()
