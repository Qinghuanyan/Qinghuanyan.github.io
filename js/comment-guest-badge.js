(() => {
  const GUEST_TEXT = '游客'
  const USER_TEXT = '用户'
  const GUEST_CLASS = 'wl-badge anzhiyu-guest-badge'
  const USER_CLASS = 'wl-badge anzhiyu-user-badge'
  const RETRIES = [0, 800, 2000, 4500]

  const hasAdminBadge = (card) => {
    const badges = card.querySelectorAll(
      '.wl-badge:not(.anzhiyu-guest-badge):not(.anzhiyu-user-badge)'
    )
    for (const b of badges) {
      const t = (b.textContent || '').trim()
      if (t === '博主' || /admin/i.test(b.className)) return true
    }
    return false
  }

  const isLoggedInUser = (card) => {
    if (card.querySelector('.wl-badge.level0, .wl-badge.level1, .wl-badge.level2, .wl-badge.level3')) {
      return true
    }
    // Waline marks logged-in commenters with a verified mark near avatar/nick
    if (card.querySelector('.wl-content .wl-user .wl-verified, .wl-head .wl-verified')) {
      return true
    }
    const nickLink = card.querySelector('.wl-nick, .wl-user > a, .wl-user-nick')
    if (nickLink && /\/ui(\/|$)/.test(nickLink.getAttribute('href') || '')) {
      return true
    }
    return false
  }

  const findInsertPoint = (card) =>
    card.querySelector('.wl-nick') ||
    card.querySelector('.wl-user > a') ||
    card.querySelector('.wl-user-nick')

  const ensureBadge = (card, text, className) => {
    const nick = findInsertPoint(card)
    if (!nick) return
    const key = className.split(' ').pop()
    let badge = card.querySelector('.' + key)
    if (badge) {
      if (badge.textContent !== text) badge.textContent = text
      return
    }
    badge = document.createElement('span')
    badge.className = className
    badge.textContent = text
    nick.insertAdjacentElement('afterend', badge)
  }

  const decorate = (card) => {
    if (!card || card.dataset.anzhiyuRoleDone === '1') return

    if (hasAdminBadge(card)) {
      card.querySelectorAll('.anzhiyu-guest-badge, .anzhiyu-user-badge').forEach((el) => el.remove())
      card.dataset.anzhiyuRoleDone = '1'
      return
    }

    if (isLoggedInUser(card)) {
      card.querySelector('.anzhiyu-guest-badge')?.remove()
      ensureBadge(card, USER_TEXT, USER_CLASS)
    } else {
      card.querySelector('.anzhiyu-user-badge')?.remove()
      ensureBadge(card, GUEST_TEXT, GUEST_CLASS)
    }
    card.dataset.anzhiyuRoleDone = '1'
  }

  const scan = () => {
    const wrap =
      document.getElementById('waline-wrap') ||
      document.querySelector('#post-comment .comment-wrap') ||
      document.getElementById('post-comment')
    if (!wrap) return

    const cards = wrap.querySelectorAll('.wl-card, .wl-list > li.wl-item, li[id^="comment-"]')
    cards.forEach(decorate)
  }

  const boot = () => {
    RETRIES.forEach((ms) => setTimeout(scan, ms))
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
  document.addEventListener('pjax:complete', () => {
    document
      .querySelectorAll('[data-anzhiyu-role-done]')
      .forEach((el) => delete el.dataset.anzhiyuRoleDone)
    boot()
  })
})()
