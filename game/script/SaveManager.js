/**
 * 存档管理器 - 处理存档相关的UI和逻辑
 * @author windlandneko
 */
class SaveManager {
  /**
   * 加载存档列表UI
   * @param {HTMLElement} container - 存档列表的容器元素
   * @param {Function} onLoad - 加载存档的回调函数 (saveData) => void
   * @param {Function} onDelete - 删除存档的回调函数 (saveName) => void
   */
  static loadSaveList(container, onLoad, onDelete) {
    const currentUser = localStorage.getItem('rewind-pearl-username')
    if (!currentUser) {
      container.innerHTML = '<div class="no-saves">用户未登录</div>'
      return
    }

    const savingsData = localStorage.getItem('rewind-pearl-savings')
    const savings = savingsData ? JSON.parse(savingsData) : {}
    const userSaves = savings[currentUser] || []

    if (userSaves.length === 0) {
      container.innerHTML = '<div class="no-saves">暂无存档</div>'
      return
    }

    container.innerHTML = userSaves
      .map(
        (save, index) => `
      <div class="save-item" onclick="loadSelectedSave('${currentUser}', ${index})">
        <div class="save-content">
          <div class="save-name">${save.name}</div>
          <div class="save-info">
            <span class="save-time">${this.formatTime(
              save.data?.timestamp
            )}</span>
            <span class="save-level">${
              save.data?.levelData?.name || '未知关卡'
            }</span>
          </div>
        </div>
        <button class="delete-save-btn" onclick="event.stopPropagation(); deleteSave('${currentUser}', ${index})">
          删除
        </button>
      </div>
    `
      )
      .join('')

    // 定义全局函数供onclick使用
    window.loadSelectedSave = (username, saveIndex) => {
      const savingsData = localStorage.getItem('rewind-pearl-savings')
      const savings = savingsData ? JSON.parse(savingsData) : {}
      const userSaves = savings[username] || []

      if (saveIndex >= 0 && saveIndex < userSaves.length) {
        const selectedSave = userSaves[saveIndex]
        if (onLoad) {
          onLoad(selectedSave.data)
        }
      }
    }

    window.deleteSave = (username, saveIndex) => {
      if (!confirm('确定要删除这个存档吗？')) return

      const savingsData = localStorage.getItem('rewind-pearl-savings')
      const savings = savingsData ? JSON.parse(savingsData) : {}
      const userSaves = savings[username] || []

      if (saveIndex >= 0 && saveIndex < userSaves.length) {
        const selectedSave = userSaves[saveIndex]
        userSaves.splice(saveIndex, 1)
        savings[username] = userSaves
        localStorage.setItem('rewind-pearl-savings', JSON.stringify(savings))

        if (onDelete) {
          onDelete(selectedSave.name)
        }
        // 重新加载列表
        this.loadSaveList(container, onLoad, onDelete)
      }
    }
  }

  /**
   * 格式化时间戳
   * @param {number} timestamp - 时间戳
   * @returns {string} 格式化后的时间字符串
   */
  static formatTime(timestamp) {
    if (!timestamp) return '未知时间'
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /**
   * 显示存档保存提示框
   * @param {Function} onSave - 保存存档的回调函数 (saveName) => void
   */
  static showSavePrompt(onSave) {
    const saveName = prompt(
      '请输入存档名称:',
      `存档_${new Date().toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}`
    )

    if (saveName && saveName.trim()) {
      if (onSave) {
        onSave(saveName.trim())
      }
    }
  }
}

export default SaveManager
