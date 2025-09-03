import Asset from './Asset.js'
import keyboard from './Keyboard.js'

/**
 * Dialogue Manager
 *
 * @author windlandneko
 */
class Dialogue {
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

  #keyboardListeners = []

  #registerKeyboardListeners() {
    this.#clearKeyboardListeners()
    this.#keyboardListeners.push(
      keyboard.onKeydown(['Enter', 'Space'], () => {
        this.next()
      }),
      keyboard.onKeydown(['LCtrl', 'RCtrl'], key => {
        const k = 0.6
        const triggerSkip = t => {
          if (keyboard.isActive(key)) {
            this.next(true)
            t = k * t + (1 - k) * 30
            setTimeout(() => triggerSkip(t), t)
          }
        }

        setTimeout(() => triggerSkip(200), 200)
      })
    )
  }

  #clearKeyboardListeners() {
    this.#keyboardListeners.forEach(removeListener => removeListener())
    this.#keyboardListeners = []
  }

  /**
   * 开始播放对话
   */
  async play(dialogue) {
    if (this.isPlaying) {
      console.warn('[Dialogue] (play) 重复触发播放！')
      return Promise.resolve()
    }

    if (!Asset.has('dialogue/' + dialogue)) {
      console.warn('[Dialogue] (play) 对话资源不存在:', dialogue)
      return Promise.resolve()
    }

    this.stop()
    this.dialogueData = Asset.get('dialogue/' + dialogue)
    this.$dialogue.classList.add(
      'visible',
      this.dialogueData?.text_style ?? 'modern'
    )

    // 注册键盘监听器
    this.#registerKeyboardListeners()

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
    this.$dialogue.classList.remove('visible')
    this.characters.forEach(character => this.#onRemove(character))

    this.#clearKeyboardListeners()
    clearTimeout(this.waitHandler)
    clearTimeout(this.autoNextHandler)

    this.onEnd?.()
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
        console.warn('[Dialogue] (processEvent) 未知的事件:', event)
        this.next()
    }
  }

  /**
   * 添加角色到场景
   * @param {Object} event - 添加角色事件
   */
  #onAddCharacter(event) {
    const { id, emotion = 'normal', position } = event

    if (!id) {
      console.warn('[Dialogue] (onAddCharacter) ID无效:', id)
      return
    }
    if (this.characters.has(id)) {
      console.warn('[Dialogue] (onAddCharacter) 角色已存在:', id)
      return
    }

    const $el = document.createElement('img')
    $el.classList.add('character', position)
    this.$dialogue.appendChild($el)

    const character = { ...event, $el, appear: true }
    this.characters.set(id, character)
    this.#updateCharacterEmotion(character, emotion)

    if (position === 'left') {
      this.leftCharacter.push(character)
    } else {
      this.rightCharacter.push(character)
    }

    // 非交互节点
    this.next()
  }

  /**
   * 显示对话
   * @param {Object} event - 对话事件
   */
  #onDialogue(event, skip) {
    const { id, emotion, text, wait } = event
    const baseCharacter = this.characters.get(id)
    if (!baseCharacter && id) {
      console.warn('[Dialogue] (onDialogue) 角色ID无效或不存在:', id)
      return
    }
    const character = { ...baseCharacter, ...event }

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
    this.$modernTitle.style.setProperty(
      '--color',
      character?.title_color || '#ffcc00'
    )
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
        this.$modernText.textContent = ''
        this.textDisplayHandler = setInterval(() => {
          if (this.textCursor === Infinity) {
            this.$modernText.textContent = ''
            this.#parseText(this.$modernText, text)
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
                this.textCursor = text.length
              } else {
                nextLetter = text.slice(divider + 1, end)
                span.className = text.slice(this.textCursor, divider)
                this.textCursor = end + 1
              }
            }
            span.textContent = nextLetter
            span.classList.add('appear')
            this.$modernText.appendChild(span)
          }
          if (this.textCursor >= text.length) {
            this.textDisplaying = false
            clearInterval(this.textDisplayHandler)
            clearTimeout(this.autoNextHandler)
            if (this.dialogueData.auto_next_delay > 0)
              this.autoNextHandler = setTimeout(
                () => this.next(),
                this.dialogueData.auto_next_delay
              )
          }
        }, 500 / text.length + 15)
        this.textDisplaying = true
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

    this.characters.delete(id)
    character.$el.classList.add('remove')

    if (character.position === 'left') {
      this.leftCharacter = this.leftCharacter.filter(c => c.id !== id)
    } else {
      this.rightCharacter = this.rightCharacter.filter(c => c.id !== id)
    }

    setTimeout(() => {
      character.$el.remove()
      this.#updatePosition()
    }, 500)

    this.next()
  }

  // 更新角色表情
  #updateCharacterEmotion(character, emotion) {
    const key = character.key ?? 'gunmu'
    let image = `character/${key}/${emotion}`
    if (Asset.has(image)) {
      image = Asset.get(image)
    } else {
      console.warn('[Dialogue] (updateCharacterEmotion) 角色资源不存在:', image)
      image = Asset.get('character/gunmu')
    }

    character.$el.src = image
  }

  // 更新全部角色位置、高亮
  #updatePosition() {
    this.leftCharacter.forEach((character, index, { length }) => {
      const k = (index + 1) / length
      const offset = `var(--character-width) * ${k} - var(--character-offset)`
      if (character.appear) {
        character.$el.animate(
          {
            opacity: [0, 1],
            left: [`calc(${offset} - 5%)`, `calc(${offset})`],
          },
          {
            duration: 400,
            easing: 'ease',
          }
        )
        character.appear = false
      }
      character.$el.style.transform = `translateY(${10 * (1 - k)}%)`
      character.$el.style.left = `calc(${offset})`
      character.$el.style.right = 'auto'
      character.$el.style.zIndex = 10 + index
      if (index === length - 1) character.$el.classList.add('highlighted')
      else character.$el.classList.remove('highlighted')
    })

    this.rightCharacter.forEach((character, index, { length }) => {
      const k = (index + 1) / length
      const offset = `var(--character-width) * ${k} - var(--character-offset)`
      if (character.appear) {
        character.$el.animate(
          {
            opacity: [0, 1],
            right: [`calc(${offset} - 5%)`, `calc(${offset})`],
          },
          {
            duration: 400,
            easing: 'ease',
          }
        )
        character.appear = false
      }
      character.$el.style.transform = `scaleX(-1) translateY(${10 * (1 - k)}%)`
      character.$el.style.right = `calc(${offset})`
      character.$el.style.left = 'auto'
      character.$el.style.zIndex = 10 + index
      if (index === length - 1) character.$el.classList.add('highlighted')
      else character.$el.classList.remove('highlighted')
    })
  }

  // 更新对话气泡
  #updateBubble(text) {
    this.$touhou.className = `touhou-style-text ${this.currentSpeaker.position}`

    this.$touhou.querySelectorAll('span').forEach(span => span.remove())
    this.#parseText(this.$touhou, text)

    // retrigger animation
    setTimeout(() => this.$touhou.classList.add('visible'), 0)
  }

  #parseText($el, text) {
    let span = document.createElement('span')
    for (let i = 0; i < text.length; i++) {
      let char = text[i]

      if (char === '\\') {
        char = text[++i]
      } else if (char === '$') {
        $el.appendChild(span)
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

        $el.appendChild(span)
        span = document.createElement('span')
        continue
      }

      span.textContent += char
    }
    $el.appendChild(span)
  }
}

export default new Dialogue()
