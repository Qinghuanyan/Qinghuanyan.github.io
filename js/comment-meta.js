(() => {
  // UA is hidden by CSS + Waline DISABLE_USERAGENT.
  // Addr/time come from Waline itself — avoid MutationObserver DOM writes (can freeze the tab).
})()
