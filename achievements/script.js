// 成就数据定义
const achievementsData = [
  {
    id: 'first_play',
    title: '初次尝试',
    description: '第一次启动游戏',
    icon: 'fas fa-play-circle',
  },
  {
    id: 'level_complete',
    title: '关卡通关',
    description: '完成第一个关卡',
    icon: 'fas fa-trophy',
  },
  {
    id: 'perfect_score',
    title: '完美表现',
    description: '在关卡中获得满分',
    icon: 'fas fa-star',
  },
  {
    id: 'speed_runner',
    title: '速度之王',
    description: '在限定时间内完成关卡',
    icon: 'fas fa-running',
  },
  {
    id: 'collector',
    title: '收集家',
    description: '收集所有道具',
    icon: 'fas fa-gem',
  },
  {
    id: 'master_player',
    title: '游戏大师',
    description: '完成所有关卡',
    icon: 'fas fa-crown',
  },
  {
    id: 'hidden_achievement_1',
    title: '???',
    description: '这是一个隐藏成就，完成特定条件后解锁',
    icon: 'fas fa-question',
    hidden: true,
  },
  {
    id: 'hidden_achievement_2',
    title: '???',
    description: '这是一个隐藏成就，完成特定条件后解锁',
    icon: 'fas fa-question',
    hidden: true,
  },
  {
    id: 'hidden_achievement_3',
    title: '???',
    description: '这是一个隐藏成就，完成特定条件后解锁',
    icon: 'fas fa-question',
    hidden: true,
  },
]

function loadAchievements() {
  try {
    const saved = localStorage.getItem('rewind-pearl-achievements')
    return saved ? JSON.parse(saved) : {}
  } catch (error) {
    console.error('Failed to load achievements:', error)
    return {}
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('achievements')
  const unlockedAchievements = loadAchievements()

  grid.innerHTML = ''

  achievementsData.forEach(achievement => {
    const isUnlocked = unlockedAchievements[achievement.id] === true
    const isHidden = achievement.hidden && !isUnlocked

    const card = document.createElement('div')
    card.className = `achievement-card ${!isUnlocked ? 'locked' : ''}`
    card.setAttribute('data-achievement-id', achievement.id)

    const displayTitle = isHidden ? '???' : achievement.title
    const displayDescription = isHidden ? '隐藏成就' : achievement.description
    const displayIcon = isHidden ? 'fas fa-question' : achievement.icon

    card.setAttribute('data-description', displayDescription)

    card.innerHTML = `
            <div class="achievement-icon">
                <i class="${displayIcon}"></i>
            </div>
            <div class="achievement-title">${displayTitle}</div>
        `

    grid.appendChild(card)
  })
})
