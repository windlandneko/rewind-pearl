import Asset from './asset.js'
import keyboard from './keyboard.js'

/**
 * Dialogue Manager
 *
 * @author windlandneko
 */
class DialogueManager {
  static AUTO_NEXT_DELAY = 10 * 1000

  dialogueData = []
  eventIndex = 0

  characters = new Map()
  leftCharacter = []
  rightCharacter = []
  currentSpeaker = null

  isPlaying = false
  isWaiting = false

  $dialogue = document.querySelector('.dialogue-container')
  $modernTitle = document.querySelector('.dialogue-container .title')
  $modernSubtitle = document.querySelector('.dialogue-container .subtitle')
  $modernText = document.querySelector('.dialogue-container .text')
  $touhou = document.querySelector('.dialogue-container .touhou-style-text')

  constructor() {
    keyboard.onKeydown(['Enter', 'Space'], () => {
      this.next()
    })

    keyboard.onKeydown(['LCtrl', 'RCtrl'], () => {
      const k = 0.6
      const triggerSkip = t => {
        if (keyboard.anyActive(['LCtrl', 'RCtrl'])) {
          this.next(true)
          t = k * t + (1 - k) * 30
          setTimeout(() => triggerSkip(t), t)
        }
      }

      console.log('test')

      setTimeout(() => triggerSkip(200), 200)
    })
  }

  /**
   * 开始播放对话
   */
  async play(dialogue) {
    this.dialogueData = Asset.get(dialogue)
    this.stop()
    this.$dialogue.classList.add(
      'visible',
      this.dialogueData.text_style ?? 'modern'
    )

    const promise = new Promise(res => {
      this.onEnd = res
    })

    this.isPlaying = true
    this.#processEvent()

    return promise
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
    this.textDisplaying = false
    this.$dialogue.classList.remove('visible', 'modern', 'touhou')
    this.characters.forEach(character => this.#onRemove(character))

    clearTimeout(this.waitHandler)
    clearTimeout(this.autoNextHandler)

    setTimeout(this.onEnd, 500)
  }

  /**
   * 继续下一个事件
   */
  next(skip = false) {
    if (!this.isPlaying) return
    if (!skip && this.isWaiting) return
    if (this.textDisplaying) {
      this.textCursor = Infinity
      this.textDisplaying = false
      return
    }

    this.eventIndex++
    this.#processEvent(skip)
  }

  /**
   * 处理当前事件
   */
  #processEvent(skip) {
    if (this.eventIndex >= this.dialogueData.events.length) {
      this.stop()
      return
    }

    const event = this.dialogueData.events[this.eventIndex]

    if (typeof event === 'string') {
      this.#onDialogue({ text: event })
      return
    }

    switch (event.action) {
      case 'add':
        this.#onAddCharacter(event)
        break
      case undefined:
      case 'dialogue':
        this.#onDialogue(event, skip)
        break
      case 'remove':
        this.#onRemove(event)
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
    this.$dialogue.appendChild($el)

    const character = { ...event, $el }
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
  #onDialogue(event, skip) {
    const { id, emotion, text, wait } = event
    const character = { ...this.characters.get(id), ...event }

    this.characters.set(id, character)

    this.currentSpeaker = character

    // 移到最前
    if (character.position === 'left') {
      this.leftCharacter = this.leftCharacter.filter(c => c.id !== id)
      this.leftCharacter.push(character)
    } else {
      this.rightCharacter = this.rightCharacter.filter(c => c.id !== id)
      this.rightCharacter.push(character)
    }

    this.#updatePosition()
    this.$modernTitle.textContent = character?.title ?? ''
    this.$modernSubtitle.textContent = character?.subtitle ?? ''
    if (emotion) this.#updateCharacterEmotion(character, emotion)

    if (text === null) {
      this.$touhou.classList.remove('visible')
      this.$modernText.textContent = ''
    }

    if (text) {
      if (this.dialogueData.text_style === 'modern' && !skip) {
        this.textCursor = 0
        clearInterval(this.textDisplayHandler)
        this.textDisplayHandler = setInterval(() => {
          if (this.textCursor === Infinity) {
            this.$modernText.textContent = ''
            let span = document.createElement('span')
            for (let i = 0; i < text.length; i++) {
              let char = text[i]

              if (char === '\\') {
                char = text[++i]
              } else if (char === '$') {
                this.$modernText.appendChild(span)
                span = document.createElement('span')

                const divider = text.indexOf(':', i + 1)
                const end = text.indexOf('$', divider + 1)

                if (end === -1) {
                  span.textContent = '[[ERROR]]'
                } else {
                  span.textContent = text.slice(divider + 1, end)
                  span.className = text.slice(i + 1, divider)
                }
                i = end

                this.$modernText.appendChild(span)
                span = document.createElement('span')
                continue
              }

              span.textContent += char
            }
            this.$modernText.appendChild(span)
          } else {
            const span = document.createElement('span')
            let nextLetter = text.charAt(this.textCursor++)
            if (nextLetter === '\\') {
              nextLetter = text.charAt(this.textCursor++)
            } else if (nextLetter === '$') {
              let divider = text.indexOf(':', this.textCursor)
              let end = text.indexOf('$', divider)

              if (end === -1) {
                nextLetter = '[[ERROR]]'
              } else {
                nextLetter = text.slice(divider + 1, end)
                span.className = text.slice(this.textCursor, divider)
              }
              this.textCursor = end + 1
            }
            span.textContent = nextLetter
            span.classList.add('appear')
            this.$modernText.appendChild(span)
          }
          if (this.textCursor >= text.length) {
            this.textDisplaying = false
            clearInterval(this.textDisplayHandler)
            clearTimeout(this.autoNextHandler)
            this.autoNextHandler = setTimeout(
              () => this.next(),
              DialogueManager.AUTO_NEXT_DELAY
            )
          }
        }, 500 / text.length)
        this.textDisplaying = true

        this.$modernText.textContent = ''
      } else if (skip) {
        this.$modernText.textContent = text
      } else {
        this.#updateBubble(text)
      }
    } else if (!wait) {
      this.next()
    }

    if (wait) {
      this.isWaiting = true

      clearTimeout(this.waitHandler)
      this.waitHandler = setTimeout(() => {
        this.isWaiting = false
        this.next()
      }, wait)
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

    character.$el.classList.add('hide')
    setTimeout(() => {
      character.$el.remove()
      this.characters.delete(id)

      this.#updatePosition()
    }, 400)

    if (character.position === 'left') {
      this.leftCharacter = this.leftCharacter.filter(c => c.id !== id)
    } else {
      this.rightCharacter = this.rightCharacter.filter(c => c.id !== id)
    }

    this.next()
  }

  // 更新角色表情
  #updateCharacterEmotion(character, emotion) {
    let image = `character/${character.key}/${emotion}`
    if (Asset.has(image)) image = Asset.get(image)
    else {
      console.warn('角色资源不存在:', image)
      image = Asset.get('character/gunmu')
    }

    character.$el.src = image
  }

  // 更新全部角色位置、高亮
  #updatePosition() {
    this.leftCharacter.forEach((character, index, { length }) => {
      const k = (index + 1) / length
      character.$el.style.transform = `translateY(${10 * (1 - k)}%)`
      character.$el.style.left = `calc(var(--character-width) * ${k} - var(--character-offset))`
      character.$el.style.right = 'auto'
      character.$el.style.zIndex = 10 + index
      if (index === length - 1) character.$el.classList.add('highlighted')
      else character.$el.classList.remove('highlighted')
    })

    this.rightCharacter.forEach((character, index, { length }) => {
      const k = (index + 1) / length
      character.$el.style.transform = `translateY(${10 * (1 - k)}%) scaleX(-1)`
      character.$el.style.right = `calc(var(--character-width) * ${k} - var(--character-offset))`
      character.$el.style.left = 'auto'
      character.$el.style.zIndex = 10 + index
      if (index === length - 1) character.$el.classList.add('highlighted')
      else character.$el.classList.remove('highlighted')
    })
  }

  /**
   * 创建对话气泡
   * @param {string} text - 对话文本
   * @param {Object} character - 说话的角色
   */
  #updateBubble(text) {
    this.$touhou.classList.remove('visible', 'left', 'right')
    this.$touhou.classList.add(this.currentSpeaker.position)

    this.$touhou.querySelectorAll('span').forEach(span => span.remove())
    text.split('\n').forEach(line => {
      const span = document.createElement('span')
      span.textContent = line
      this.$touhou.appendChild(span)
    })

    // retrigger animation
    setTimeout(() => this.$touhou.classList.add('visible'), 0)
  }
}

export default new DialogueManager()
