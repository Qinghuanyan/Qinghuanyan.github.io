(() => {
  const GUEST_TEXT = '游客'
  const USER_TEXT = '用户'
  const GUEST_CLASS = 'wl-badge anzhiyu-guest-badge'
  const USER_CLASS = 'wl-badge anzhiyu-user-badge'
  // Waline 懒加载：多试几次，但不使用 MutationObserver（避免卡死）
  const RETRIES = [300, 1000, 2000, 3500, 6000, 10000]

  const hasAdminBadge = (card) => {
    const badges = card.querySelectorAll(
      '.wl-badge:not(.anzhiyu-guest-badge):not(.anzhiyu-user-badge)'
    )
    for (const b of badges) {
      const t = (b.textContent || '').trim()
      if (t === '博主' || t === 'Admin' || /admin/i.test(b.className)) return true
    }
    return false
  }

  const isLoggedInUser = (card) => {
    if (card.querySelector('[class*="level"]')) return true
    if (card.querySelector('.wl-verified')) return true
    const nick = card.querySelector('.wl-nick')
    if (nick && /\/ui(\/|$)/.test(nick.getAttribute('href') || '')) return true
    // 头像角标绿勾通常表示已登录
    if (card.querySelector('.wl-user svg, .wl-avatar svg, .wl-user [class*="check"]')) {
      return true
    }
    return false
  }

  const findNick = (card) => card.querySelector('.wl-nick')

  const ensureBadge = (card, text, className) => {
    const nick = findNick(card)
    if (!nick || !nick.parentElement) return false

    const key = className.split(' ').pop()
    let badge = card.querySelector('.' + key)
    if (badge) {
      if (badge.textContent !== text) badge.textContent = text
      return true
    }

    badge = document.createElement('span')
    badge.className = className
    badge.textContent = text
    // 插在昵称后面（与「博主」同级）
    nick.insertAdjacentElement('afterend', badge)
    return true
  }

  const decorate = (card) => {
    if (!card) return false
    if (card.querySelector('.anzhiyu-guest-badge, .anzhiyu-user-badge')) return true
    if (hasAdminBadge(card)) return true
    if (!findNick(card)) return false

    if (isLoggedInUser(card)) {
      return ensureBadge(card, USER_TEXT, USER_CLASS)
    }
    return ensureBadge(card, GUEST_TEXT, GUEST_CLASS)
  }

  const collectCards = (wrap) => {
    const set = new Set()
    wrap.querySelectorAll('.wl-nick').forEach((nick) => {
      const card =
        nick.closest('li') ||
        nick.closest('.wl-card') ||
        nick.closest('.wl-comment') ||
        nick.closest('[id^="comment-"]') ||
        nick.parentElement?.parentElement
      if (card) set.add(card)
    })
    return [...set]
  }

  const scan = () => {
    const wrap =
      document.getElementById('waline-wrap') ||
      document.getElementById('post-comment')
    if (!wrap) return false

    const cards = collectCards(wrap)
    if (!cards.length) return false

    let ok = true
    cards.forEach((card) => {
      if (!decorate(card)) ok = false
    })
    return ok
  }

  const boot = () => {
    let stopped = false
    RETRIES.forEach((ms) => {
      setTimeout(() => {
        if (stopped) return
        if (scan()) stopped = true
      }, ms)
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
  document.addEventListener('pjax:complete', boot)
})()
