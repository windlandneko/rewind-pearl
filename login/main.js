// DOM 元素获取
const container = document.querySelector('#container')
const signInBtn = document.querySelector('#signIn')
const signUpBtn = document.querySelector('#signUp')

// 表单元素
const signUpForm = document.querySelector('#signUpForm')
const signInForm = document.querySelector('#signInForm')

// 注册表单元素
const signUpUsername = document.querySelector('#signUpUsername')
const signUpPassword = document.querySelector('#signUpPassword')
const signUpError = document.querySelector('#signUpError')
const strengthText = document.querySelector('#strengthText')
const strengthBars = document.querySelectorAll('.strength-bar')

// 登录表单元素
const signInUsername = document.querySelector('#signInUsername')
const signInPassword = document.querySelector('#signInPassword')
const signInError = document.querySelector('#signInError')

// 切换面板事件
signUpBtn.addEventListener('click', () => {
  container.classList.add('right-panel-active')
  clearErrors()
})

signInBtn.addEventListener('click', () => {
  container.classList.remove('right-panel-active')
  clearErrors()
})

// 密码强度检测
function checkPasswordStrength(password) {
  let strength = 0
  let message = ''

  if (password.length === 0) {
    return { strength: 0, message: '密码强度' }
  }

  if (password.length < 4) {
    return { strength: 0, message: '密码过短' }
  }

  // 检查是否包含字母
  const hasLetter = /[a-zA-Z]/.test(password)
  // 检查是否包含数字
  const hasNumber = /\d/.test(password)

  if (!hasLetter) {
    return { strength: 0, message: '缺少字母' }
  }
  if (!hasNumber) {
    return { strength: 0, message: '缺少数字' }
  }

  // 基础要求满足，开始计算强度
  strength = 1 // 弱

  // 长度加分
  if (password.length > 10) strength++
  if (password.length > 20) strength++

  // 复杂度加分
  if (
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  )
    strength++
  if (
    /[A-Za-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  )
    strength++

  // 限制最大强度为3
  strength = Math.min(strength, 3)

  switch (strength) {
    case 1:
      message = '弱密码'
      break
    case 2:
      message = '普通密码'
      break
    case 3:
      message = '强密码'
      break
    default:
      message = '非法密码'
  }

  return { strength, message }
}

function updatePasswordStrength(password) {
  const result = checkPasswordStrength(password)

  strengthText.textContent = result.message

  strengthBars.forEach(bar => {
    bar.classList.remove('weak', 'medium', 'strong')
  })

  for (let i = 0; i < result.strength; i++) {
    if (result.strength === 1) {
      strengthBars[i].classList.add('weak')
    } else if (result.strength === 2) {
      strengthBars[i].classList.add('medium')
    } else if (result.strength === 3) {
      strengthBars[i].classList.add('strong')
    }
  }

  if (password.length === 0) {
    signUpPassword.classList.remove('error', 'success')
  } else if (result.strength === 0) {
    signUpPassword.classList.add('error')
    signUpPassword.classList.remove('success')
  } else {
    signUpPassword.classList.remove('error')
    signUpPassword.classList.add('success')
    hideError(signUpError)
  }
}

// 用户名重复监听
signUpUsername.addEventListener('input', e => {
  if (isUsernameExists(e.target.value.trim())) {
    signUpUsername.classList.add('error')
    showError(signUpError, '用户名已存在')
  } else {
    signUpUsername.classList.remove('error')
    hideError(signUpError)
  }
})

// 密码输入事件监听
signUpPassword.addEventListener('input', e => {
  updatePasswordStrength(e.target.value)
})

// 显示错误信息
function showError(errorElement, message) {
  errorElement.textContent = message
  errorElement.classList.add('show')
}

// 隐藏错误信息
function hideError(errorElement) {
  errorElement.classList.remove('show')
  setTimeout(() => {
    if (!errorElement.classList.contains('show')) {
      errorElement.textContent = ''
    }
  }, 300)
}

// 清除所有错误信息
function clearErrors() {
  hideError(signUpError)
  hideError(signInError)
  signUpPassword.classList.remove('error', 'success')
  signInPassword.classList.remove('error', 'success')

  // 重置密码强度显示
  strengthText.textContent = '密码强度'
  strengthBars.forEach(bar => {
    bar.classList.remove('weak', 'medium', 'strong')
  })
}

function getAccounts() {
  const accounts = localStorage.getItem('rewind-pearl-account')
  return accounts ? JSON.parse(accounts) : []
}

function saveAccount(username, password) {
  const accounts = getAccounts()
  accounts.push({ name: username, password: password })
  localStorage.setItem('rewind-pearl-account', JSON.stringify(accounts))
}

function validateAccount(username, password) {
  const accounts = getAccounts()
  return accounts.some(
    account => account.name === username && account.password === password
  )
}

function isUsernameExists(username) {
  const accounts = getAccounts()
  return accounts.some(account => account.name === username)
}

// 注册表单提交
signUpForm.addEventListener('submit', e => {
  e.preventDefault()

  const username = signUpUsername.value.trim()
  const password = signUpPassword.value

  if (!username) {
    showError(signUpError, '请输入用户名')
    return
  }

  if (isUsernameExists(username)) {
    showError(signUpError, '用户名已存在')
    return
  }

  // 验证密码
  const passwordCheck = checkPasswordStrength(password)
  if (passwordCheck.strength === 0) {
    showError(signUpError, '密码必须大于3位，且包含字母和数字')
    return
  }

  // 保存账号
  saveAccount(username, password)

  // 注册成功，切换到登录页面
  showError(signUpError, '注册成功！')
  signUpError.style.color = '#27ae60'

  signInUsername.value = username
  signInPassword.value = password

  setTimeout(() => {
    container.classList.remove('right-panel-active')
    signUpForm.reset()
    clearErrors()
    signUpError.style.color = '#e74c3c'
  }, 500)
})

// 登录表单提交
signInForm.addEventListener('submit', e => {
  e.preventDefault()

  const username = signInUsername.value.trim()
  const password = signInPassword.value

  if (!username) {
    showError(signInError, '请输入用户名')
    return
  }
  if (!password) {
    showError(signInError, '密码强度')
    return
  }

  if (validateAccount(username, password)) {
    // 登录成功
    localStorage.setItem('rewind-pearl-username', username)
    showError(signInError, '登录成功！正在跳转...')
    signInError.style.color = '#27ae60'

    setTimeout(() => {
      location.assign('../index.html')
    }, 1000)
  } else {
    // 登录失败
    showError(signInError, '用户名或密码错误')
    signInUsername.classList.add('error')
    signInPassword.classList.add('error')
    signInError.style.color = '#e74c3c'
  }
})

// 清除登录密码框错误状态
signInPassword.addEventListener('input', () => {
  signInUsername.classList.remove('error')
  signInPassword.classList.remove('error')
  hideError(signInError)
})
signInUsername.addEventListener('input', () => {
  signInUsername.classList.remove('error')
  signInPassword.classList.remove('error')
  hideError(signInError)
})
