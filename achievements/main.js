// 成就数据定义
const achievementsData = [
  {
    id: 'yi_yan_ding_zhen',
    title: '一眼丁真',
    description: '进入游戏',
    icon: 'fas fa-play-circle',
  },
  {
    id: 'gugugaga!',
    title: '咕咕嘎嘎',
    description: '帮助高松登收集了灵感菇',
    icon: 'fas fa-guitar',
  },
  {
    id: 'no_death_jump',
    title: '跑酷大神',
    description: '在跳跳乐关卡中零死亡通关',
    icon: 'fas fa-trophy',
  },
  {
    id: 'speed_runner',
    title: '速度之王',
    description: '在限定时间内完成关卡',
    icon: 'fas fa-running',
  },
  {
    id: 'strawberry_lover',
    title: '草莓爱好者',
    description: '收集 3 个草莓',
    icon: 'fas fa-crow',
  },
  {
    id: 'strawberry_master',
    title: '草莓大师',
    description: '收集 10 个草莓',
    icon: 'fas fa-medal',
  },
  {
    id: 'talk_to_everyone',
    title: '社交恐怖分子',
    description: '与所有生物（以及不是生物的东西）都进行了对话',
    icon: 'fas fa-comments',
  },
  {
    id: 'master_player',
    title: '结束了？',
    description: '达成结局',
    icon: 'fas fa-crown',
  },
  {
    id: 'i_am_my_own_grandpa',
    title: '祖父悖论',
    description: '发现时间循环的自己',
    icon: 'fas fa-infinity',
    hidden: true,
  },
  {
    id: 'strawberry_grandmaster',
    title: '草莓炼金师',
    description: '收集了全部的草莓！',
    icon: 'fas fa-crown',
    hidden: true,
  },
  {
    id: 'break_the_time_space',
    title: '::(',
    description: '破坏时空结构',
    icon: 'fas fa-poop',
    hidden: true,
  },
  {
    id: 'true_ending',
    title: '结束力！',
    description: '达成真结局',
    icon: 'fas fa-dove',
    hidden: true,
  },
]

function loadAchievements() {
  try {
    const currentUser = localStorage.getItem('rewind-pearl-username')
    if (!currentUser) location.assign('login/index.html')

    const saved = localStorage.getItem('rewind-pearl-achievements')
    const data = saved ? JSON.parse(saved) : {}
    return data[currentUser] || {}
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

    const displayTitle = isHidden ? '隐藏成就' : achievement.title
    const displayDescription = isHidden ? '？？？' : achievement.description
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

addEventListener('storage', event => {
  if (event.key === 'rewind-pearl-achievements') {
    const grid = document.getElementById('achievements')
    const unlockedAchievements = loadAchievements()
    const cards = grid.getElementsByClassName('achievement-card')

    Array.from(cards).forEach(card => {
      const id = card.getAttribute('data-achievement-id')
      const isUnlocked = unlockedAchievements[id] === true
      const isHidden =
        achievementsData.find(a => a.id === id)?.hidden && !isUnlocked

      card.classList.toggle('locked', !isUnlocked)
      card.setAttribute(
        'data-description',
        isHidden
          ? '？？？'
          : achievementsData.find(a => a.id === id)?.description
      )

      const iconElem = card.querySelector('.achievement-icon i')
      const titleElem = card.querySelector('.achievement-title')

      if (isHidden) {
        iconElem.className = 'fas fa-question'
        titleElem.textContent = '隐藏成就'
      } else {
        const achievement = achievementsData.find(a => a.id === id)
        iconElem.className = achievement.icon
        titleElem.textContent = achievement.title
      }
    })
  }
})
