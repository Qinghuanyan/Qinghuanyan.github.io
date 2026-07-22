(() => {
  const API_URL = 'https://api.shanhe.kim/API/访客信息.php?type=json'
  const CACHE_KEY = 'anzhiyu_visitor_location'
  const CACHE_TTL = 30 * 60 * 1000

  const shortenAddr = (addr = '') => {
    return String(addr)
      .replace(/\s+/g, ' ')
      .replace(/\s*(电信|联通|移动|铁通|广电|教育网|未知).*$/, '')
      .trim()
  }

  const readCache = () => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY)
      if (!raw) return null
      const data = JSON.parse(raw)
      if (!data || Date.now() - data.ts > CACHE_TTL) return null
      return data.payload
    } catch (e) {
      return null
    }
  }

  const writeCache = (payload) => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), payload }))
    } catch (e) {}
  }

  const render = (el, payload) => {
    const text = el.querySelector('.comment-location__text')
    if (!text) return

    if (!payload || payload.code !== 200 || !payload.addr) {
      el.hidden = true
      return
    }

    const place = shortenAddr(payload.addr) || payload.addr
    const system = payload.system ? ` · ${payload.system}` : ''
    text.textContent = `欢迎来自 ${place} 的朋友${system}`
    el.hidden = false
    el.classList.add('is-ready')
  }

  const fetchLocation = async () => {
    const cached = readCache()
    if (cached) return cached

    const res = await fetch(API_URL, { method: 'GET', credentials: 'omit' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    writeCache(data)
    return data
  }

  const initCommentLocation = async () => {
    const el = document.getElementById('comment-location')
    if (!el) return

    try {
      const data = await fetchLocation()
      render(el, data)
    } catch (e) {
      el.hidden = true
    }
  }

  const boot = () => {
    initCommentLocation()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }

  document.addEventListener('pjax:complete', boot)
})()
