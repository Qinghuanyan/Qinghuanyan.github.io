(() => {
  const SERVER = 'https://qinghuanyanhexo.vercel.app'
  const cache = new Map()

  const commentPath = () => {
    let p = location.pathname || '/'
    if (!p.endsWith('/') && !/\.[a-z0-9]+$/i.test(p)) p += '/'
    return p
  }

  const flatten = (list = []) => {
    const out = []
    for (const c of list) {
      out.push(c)
      if (c.children?.length) out.push(...flatten(c.children))
    }
    return out
  }

  const fetchAddrMap = async (path) => {
    if (cache.has(path)) return cache.get(path)
    const url = `${SERVER}/api/comment?path=${encodeURIComponent(path)}&pageSize=100&page=1`
    const res = await fetch(url, { credentials: 'omit' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const map = new Map()
    for (const c of flatten(json?.data?.data || [])) {
      if (c.objectId != null && c.addr) map.set(String(c.objectId), String(c.addr).trim())
    }
    cache.set(path, map)
    return map
  }

  const findCardId = (card) => {
    const id =
      card.id ||
      card.getAttribute('id') ||
      card.getAttribute('data-id') ||
      card.querySelector('[id^="comment-"]')?.id ||
      ''
    const m = String(id).match(/(\d+)/)
    return m ? m[1] : ''
  }

  const ensureAddr = (card, addr) => {
    if (!addr) return
    let el = card.querySelector('.wl-addr')
    if (!el) {
      const meta =
        card.querySelector('.wl-meta') ||
        card.querySelector('.wl-time')?.parentElement
      if (!meta) return
      el = document.createElement('span')
      el.className = 'wl-addr'
      const time = meta.querySelector('.wl-time')
      if (time) time.insertAdjacentElement('afterend', el)
      else meta.appendChild(el)
    }
    el.textContent = addr
    el.dataset.value = addr
    el.hidden = false
    el.style.display = ''
  }

  const apply = async (wrap) => {
    wrap.querySelectorAll('.wl-browser, .wl-os').forEach((el) => {
      el.hidden = true
      el.style.display = 'none'
    })

    try {
      const map = await fetchAddrMap(commentPath())
      wrap.querySelectorAll('.wl-card, .wl-comment, .wl-list > li, .wl-item').forEach((card) => {
        const id = findCardId(card)
        const addr = (id && map.get(id)) || card.querySelector('.wl-addr')?.dataset?.value || ''
        if (addr) ensureAddr(card, addr)
      })
    } catch (e) {}
  }

  const boot = () => {
    const wrap =
      document.getElementById('waline-wrap') ||
      document.querySelector('#post-comment .comment-wrap') ||
      document.getElementById('post-comment')
    if (!wrap) return

    apply(wrap)
    if (wrap.__commentMetaObserved) return
    wrap.__commentMetaObserved = true
    const observer = new MutationObserver(() => apply(wrap))
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
    if (wrap) wrap.__commentMetaObserved = false
    cache.clear()
    boot()
  })
})()
