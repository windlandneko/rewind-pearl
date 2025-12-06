import Asset from './Asset.js'
import keyboard from './Keyboard.js'
import PauseManager from './PauseManager.js'
import SoundManager from './SoundManager.js'
import { $ } from './utils.js'

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

  $dialogue = $('.dialogue-container')

  $modern = $('.dialogue-container .modern-style-text')
  $touhou = $('.dialogue-container .touhou-style-text')

  $modernSpeakerBox = $('.dialogue-container .speaker-box')
  $modernTitle = $('.dialogue-container .title')
  $modernSubtitle = $('.dialogue-container .subtitle')
  $modernText = $('.dialogue-container .text')

  $background = $('.dialogue-background')

  #keyboardListeners = []

  constructor() {
    PauseManager.on('pause', () => {
      this.#removeKeyboardListeners()
    })
    PauseManager.on('resume', () => {
      setTimeout(() => this.#addKeyboardListeners(), 0)
    })
  }

  #triggerSkip(key, delayTime) {
    const k = 0.6
    delayTime = k * delayTime + (1 - k) * 30

    this.next(true)
    setTimeout(() => {
      if (keyboard.isActive(key)) this.#triggerSkip(key, delayTime)
    }, delayTime)
  }

  #addKeyboardListeners() {
    ;['LCtrl', 'RCtrl'].forEach(key => {
      if (keyboard.isActive(key)) this.#triggerSkip(key, 200)
    })

    this.#keyboardListeners.push(
      keyboard.onKeydown(['Enter', 'Space'], () => {
        this.next()
      }),
      keyboard.onKeydown(['LCtrl', 'RCtrl'], key => {
        this.#triggerSkip(key, 200)
      }),
      keyboard.onKeydown('Esc', () => {
        PauseManager.pause()
      })
    )
  }

  #removeKeyboardListeners() {
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

    // 优化：直接get然后检查，避免双重Map查找
    const dialogueKey = 'dialogue/' + dialogue
    const dialogueData = Asset.get(dialogueKey)
    if (!dialogueData) {
      console.warn('[Dialogue] (play) 对话资源不存在:', dialogue)
      return Promise.resolve()
    }

    this.stop(true)
    this.$modernText.textContent = ''
    this.dialogueData = dialogueData
    this.$dialogue.className = 'dialogue-container'
    this.$dialogue.classList.add(
      'visible',
      this.dialogueData?.text_style ?? 'modern'
    )

    // 注册键盘监听器
    this.#addKeyboardListeners()

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
  stop(force = false) {
    this.eventIndex = 0
    this.leftCharacter = []
    this.rightCharacter = []
    this.isPlaying = false
    this.isWaiting = false
    this.textDisplaying = false
    this.$dialogue.classList.remove('visible')
    this.characters.forEach(character => this.#onRemove(character))

    this.#removeKeyboardListeners()
    clearTimeout(this.waitHandler)
    clearTimeout(this.autoNextHandler)

    if (!force) setTimeout(() => this.onEnd?.(), 500)
  }

  /**
   * 继续下一个事件
   */
  next(skip = false) {
    if (!this.isPlaying) return
    if (!skip && this.isWaiting) return
    if (this.textDisplaying) {
      this.textCursor *= -1
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
      this.#onDialogue({ ...this.currentSpeaker, text: event })
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
      case 'background':
        this.#onBackground(event)
        break
      case 'bgm':
        this.#onBGM(event)
        break
      case 'sound':
        if (!skip) this.#onSoundEffect(event)
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
      console.warn('[Dialogue] (action: add) 要创建的角色ID无效:', id)
      return
    }
    if (this.characters.has(id)) {
      console.warn('[Dialogue] (action: add) 要创建的角色已存在:', id)
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

    if (id !== null && !this.characters.has(id)) {
      console.warn('[Dialogue] (action: dialogue) 对话角色ID无效:', id)
      return
    }

    if (id !== null) {
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
      character.$el.classList.add('highlighted')
      this.$modernTitle.style.setProperty(
        '--color',
        character?.title_color ?? '#ffcc00'
      )
      this.$modernTitle.textContent = character?.title ?? ''
      this.$modernSubtitle.textContent = character?.subtitle ?? ''
      if (emotion) this.#updateCharacterEmotion(character, emotion)

      this.$modern.classList.remove('narration')
    } else {
      this.#updatePosition()
      this.$modern.classList.add('narration')
    }

    if (text === null) {
      this.$touhou.classList.remove('visible')
      this.$modernText.textContent = ''
    }

    if (text) {
      if (this.dialogueData.text_style === 'modern') {
        if (!skip) {
          this.textCursor = 0
          clearTimeout(this.textDisplayHandler)
          this.$modernText.textContent = ''

          const textDisplay = () => {
            if (this.textCursor < 0) {
              this.#parseText(this.$modernText, text.slice(-this.textCursor))
              this.textCursor = text.length
            }

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

            if (nextLetter === '\n') {
              this.$modernText.appendChild(document.createElement('br'))
              this.textDisplayHandler = setTimeout(textDisplay, 250)
            } else {
              span.textContent = nextLetter
              this.$modernText.appendChild(span)
              this.textDisplayHandler = setTimeout(textDisplay, 32)
            }

            if (this.textCursor >= text.length) {
              if (!wait) {
                const arrow = document.createElement('span')
                arrow.className = 'arrow'
                this.$modernText.appendChild(arrow)
              }
              this.textDisplaying = false
              clearTimeout(this.textDisplayHandler)
              clearTimeout(this.autoNextHandler)
              if (this.dialogueData.auto_next_delay > 0)
                this.autoNextHandler = setTimeout(
                  () => this.next(),
                  this.dialogueData.auto_next_delay
                )
            }
          }

          this.textDisplayHandler = setTimeout(textDisplay, 40)
          this.textDisplaying = true
        } else {
          this.$modernText.textContent = ''
          this.#parseText(this.$modernText, text)
        }
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
    if (!character) {
      console.warn(`[Dialogue] (action: remove) 要删除的角色不存在: ${id}`)
      return
    }

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

  /**
   * 处理背景事件
   * @param {Object} event - 背景事件
   */
  #onBackground(event) {
    const { id } = event
    // 优化：直接get然后检查，避免双重Map查找
    const backgroundImage = Asset.get('background/' + id)
    if (backgroundImage) {
      // 优化：使用for循环代替forEach，避免函数调用开销
      const children = this.$background.childNodes
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i]
        child.classList.remove('visible')
        setTimeout(() => child.remove(), 500)
      }

      setTimeout(() => backgroundImage.classList.add('visible'), 0)
      this.$background.appendChild(backgroundImage)
    } else if (id === null) {
      const children = this.$background.childNodes
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i]
        child.classList.remove('visible')
        setTimeout(() => child.remove(), 500)
      }
    } else {
      console.warn('[Dialogue] (action: background) 背景图片不存在:', id)
    }
    this.next()
  }

  /**
   * 处理背景音乐事件
   * @param {Object} event - BGM事件
   */
  #onBGM(event) {
    SoundManager.playBGM(event.id, event)
    this.next()
  }

  /**
   * 处理背景音乐事件
   * @param {Object} event - BGM事件
   */
  #onSoundEffect(event) {
    SoundManager.play(event.id, event)
    this.next()
  }

  // 更新角色表情
  #updateCharacterEmotion(character, emotion) {
    const key = character.key ?? 'gunmu'
    const imageKey = `character/${key}/${emotion}`
    // 优化：直接get然后检查，避免双重Map查找
    const imageAsset = Asset.get(imageKey)
    let image
    if (imageAsset) {
      image = imageAsset.src
    } else {
      console.warn(
        '[Dialogue] (updateCharacterEmotion) 立绘图片不存在:',
        character,
        emotion
      )
      image = Asset.get('character/gunmu').src
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
      character.$el.classList.remove('highlighted')
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
      character.$el.classList.remove('highlighted')
    })
  }

  // 更新对话气泡
  #updateBubble(text) {
    this.$touhou.classList.remove('left', 'right', 'visible')
    this.$touhou.classList.add(this.currentSpeaker.position)

    // 优化：使用innerHTML清空比querySelectorAll + forEach更快
    this.$touhou.innerHTML = ''
    this.#parseText(this.$touhou, text)

    // retrigger animation
    setTimeout(() => this.$touhou.classList.add('visible'), 0)
  }

  #parseText($el, text) {
    // 优化：使用DocumentFragment批量添加DOM节点，减少重排
    const fragment = document.createDocumentFragment()
    let span = document.createElement('span')
    
    for (let i = 0; i < text.length; i++) {
      let char = text[i]

      if (char === '\\') {
        char = text[++i]
      } else if (char === '$') {
        // 添加当前span到fragment
        if (span.textContent !== '') {
          fragment.appendChild(span)
        }
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

        fragment.appendChild(span)
        span = document.createElement('span')
        continue
      }

      if (char === '\n') {
        if (span.textContent !== '') {
          fragment.appendChild(span)
        }
        fragment.appendChild(document.createElement('br'))
        span = document.createElement('span')
      } else {
        span.textContent = char
        fragment.appendChild(span)
        span = document.createElement('span')
      }
    }
    
    // 添加最后一个span（如果有内容，或者fragment为空则添加空span以保持结构）
    if (span.textContent !== '' || fragment.childNodes.length === 0) {
      fragment.appendChild(span)
    }
    
    // 一次性添加所有节点到DOM
    $el.appendChild(fragment)
  }
}

export default new Dialogue()
