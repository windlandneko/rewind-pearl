const currentUser = localStorage.getItem('rewind-pearl-username')
if (!currentUser) location.assign('login/index.html')

const userElement = document.getElementById('current-user')
if (currentUser && userElement) {
  userElement.textContent = `当前玩家: ${currentUser}`
}

if (localStorage.getItem('rewind-pearl-autosave-' + currentUser)) {
  document.getElementById('continue-game').style.display = 'block'
}

function newGame() {
  localStorage.removeItem('rewind-pearl-autosave-' + currentUser)
  location.assign('game/index.html')
}

function logout() {
  if (!confirm('确定要注销吗？')) return
  localStorage.removeItem('rewind-pearl-username')
  location.assign('login/index.html')
}

function showSaveModal() {
  const modal = document.getElementById('saveModal')
  loadSaveList()
  modal.style.display = 'flex'
  setTimeout(() => modal.classList.add('show'), 0)
}

function hideSaveModal() {
  const modal = document.getElementById('saveModal')
  modal.classList.remove('show')
  setTimeout(() => {
    modal.style.display = 'none'
  }, 300)
}

function loadSaveList() {
  const saveList = document.getElementById('saveList')
  const currentUser = localStorage.getItem('rewind-pearl-username')

  if (!currentUser) {
    saveList.innerHTML = '<div class="no-saves">请先登录账户</div>'
    return
  }

  const savingsData = localStorage.getItem('rewind-pearl-savings')
  const savings = savingsData ? JSON.parse(savingsData) : {}
  const userSaves = savings[currentUser] || []

  if (userSaves.length === 0) {
    saveList.innerHTML = '<div class="no-saves">暂无存档</div>'
    return
  }

  saveList.innerHTML = userSaves
    .map(
      (save, index) => `
        <div class="save-item" onclick="loadSelectedSave('${currentUser}', ${index})">
          <div class="save-content">
            <div class="save-name">${save.name}</div>
            <div class="save-info">
              <span class="save-time">${formatTime(save.data?.timestamp)}</span>
              <span class="save-level">${
                save.data?.levelData?.name || '未知关卡'
              }</span>
            </div>
          </div>
          <button class="delete-save-btn" onclick="event.stopPropagation(); deleteSave('${currentUser}', ${index})"">
            删除
          </button>
        </div>
      `
    )
    .join('')
}

function formatTime(timestamp) {
  if (!timestamp) return '未知时间'
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function loadSelectedSave(username, saveIndex) {
  const savingsData = localStorage.getItem('rewind-pearl-savings')
  const savings = savingsData ? JSON.parse(savingsData) : {}
  const userSaves = savings[username] || []

  if (saveIndex >= 0 && saveIndex < userSaves.length) {
    const selectedSave = userSaves[saveIndex]
    localStorage.setItem(
      'rewind-pearl-load-save',
      JSON.stringify(selectedSave.data)
    )
    location.assign('game/index.html')
  }
}

function deleteSave(username, saveIndex) {
  if (!confirm('确定要删除这个存档吗？')) return

  const savingsData = localStorage.getItem('rewind-pearl-savings')
  const savings = savingsData ? JSON.parse(savingsData) : {}
  const userSaves = savings[username] || []

  if (saveIndex >= 0 && saveIndex < userSaves.length) {
    userSaves.splice(saveIndex, 1)
    savings[username] = userSaves
    localStorage.setItem('rewind-pearl-savings', JSON.stringify(savings))
    loadSaveList()
  }
}
