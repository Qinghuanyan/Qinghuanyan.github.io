(() => {
  const GUEST_TEXT = '游客'
  const BADGE_CLASS = 'wl-badge anzhiyu-guest-badge'

  const hasRoleBadge = (card) =>
    !!card.querySelector('.wl-badge:not(.anzhiyu-guest-badge)')

  const isLoggedInUser = (card) => {
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

  const addGuestBadge = (card) => {
    if (!card || card.querySelector('.anzhiyu-guest-badge')) return
    if (hasRoleBadge(card)) return
    if (isLoggedInUser(card)) return

    const nick = findInsertPoint(card)
    if (!nick) return

    const badge = document.createElement('span')
    badge.className = BADGE_CLASS
    badge.textContent = GUEST_TEXT
    nick.insertAdjacentElement('afterend', badge)
  }

  const scan = (root) => {
    if (!root || !root.querySelectorAll) return
    const cards = root.querySelectorAll(
      '.wl-card, .wl-comment, .wl-list > li, li[id^="comment-"], .wl-item'
    )
    if (cards.length) {
      cards.forEach(addGuestBadge)
      return
    }
    root.querySelectorAll('.wl-head').forEach((head) => {
      addGuestBadge(head.closest('li, .wl-card, .wl-comment') || head.parentElement)
    })
  }

  const boot = () => {
    const wrap =
      document.getElementById('waline-wrap') ||
      document.querySelector('#post-comment .comment-wrap') ||
      document.getElementById('post-comment')
    if (!wrap) return

    scan(wrap)

    if (wrap.__guestBadgeObserved) return
    wrap.__guestBadgeObserved = true
    const observer = new MutationObserver(() => scan(wrap))
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
