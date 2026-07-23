(() => {
  const GUEST_TEXT = '游客'
  const USER_TEXT = '用户'
  const GUEST_CLASS = 'wl-badge anzhiyu-guest-badge'
  const USER_CLASS = 'wl-badge anzhiyu-user-badge'

  const hasAdminBadge = (card) => {
    const badges = card.querySelectorAll('.wl-badge:not(.anzhiyu-guest-badge):not(.anzhiyu-user-badge)')
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
    if (card.querySelector('.wl-verified, .wl-user-avatar .wl-badge, .wl-avatar .verified')) {
      return true
    }
    const links = card.querySelectorAll('a[href]')
    for (const a of links) {
      const href = a.getAttribute('href') || ''
      if (/\/ui(\/|$)/.test(href) || /profile/i.test(href)) return true
    }
    const avatar = card.querySelector('.wl-user-avatar, .wl-avatar, .wl-user')
    if (avatar && avatar.querySelector('svg, .fa-check, .anzhiyu-icon-check, [class*="check"]')) {
      return true
    }
    return false
  }

  const findInsertPoint = (card) => {
    return (
      card.querySelector('.wl-nick') ||
      card.querySelector('.wl-user > a') ||
      card.querySelector('.wl-user-nick')
    )
  }

  const upsertBadge = (card, text, className) => {
    if (!card) return
    const nick = findInsertPoint(card)
    if (!nick) return

    let badge = card.querySelector(`.${className.split(' ').pop()}`)
    if (!badge) {
      badge = document.createElement('span')
      badge.className = className
      nick.insertAdjacentElement('afterend', badge)
    }
    badge.textContent = text
  }

  const clearCustomBadges = (card) => {
    card.querySelectorAll('.anzhiyu-guest-badge, .anzhiyu-user-badge').forEach((el) => el.remove())
  }

  const decorate = (card) => {
    if (!card) return
    if (hasAdminBadge(card)) {
      clearCustomBadges(card)
      return
    }

    if (isLoggedInUser(card)) {
      card.querySelector('.anzhiyu-guest-badge')?.remove()
      upsertBadge(card, USER_TEXT, USER_CLASS)
      return
    }

    card.querySelector('.anzhiyu-user-badge')?.remove()
    upsertBadge(card, GUEST_TEXT, GUEST_CLASS)
  }

  const scan = (root) => {
    if (!root || !root.querySelectorAll) return
    const cards = root.querySelectorAll(
      '.wl-card, .wl-comment, .wl-list > li, li[id^="comment-"], .wl-item'
    )
    if (cards.length) {
      cards.forEach(decorate)
      return
    }
    root.querySelectorAll('.wl-head').forEach((head) => {
      decorate(head.closest('li, .wl-card, .wl-comment') || head.parentElement)
    })
  }

  const hideUaMeta = (root) => {
    if (!root || !root.querySelectorAll) return
    root.querySelectorAll('.wl-browser, .wl-os').forEach((el) => {
      el.hidden = true
      el.style.display = 'none'
    })
  }

  const boot = () => {
    const wrap =
      document.getElementById('waline-wrap') ||
      document.querySelector('#post-comment .comment-wrap') ||
      document.getElementById('post-comment')
    if (!wrap) return

    scan(wrap)
    hideUaMeta(wrap)

    if (wrap.__guestBadgeObserved) return
    wrap.__guestBadgeObserved = true
    const observer = new MutationObserver(() => {
      scan(wrap)
      hideUaMeta(wrap)
    })
    observer.observe(wrap, { childList: true, subtree: true })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
  document.addEventListener('pjax:complete', () => {
    const wrap =
      document.getElementById('waline-wrap') || document.getElementById('post-comment')
    if (wrap) wrap.__guestBadgeObserved = false
    boot()
  })
})()
