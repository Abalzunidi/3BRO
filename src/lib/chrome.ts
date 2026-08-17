export function applyChrome(mode: 'light' | 'dark') {
  const root = document.documentElement
  const themeMeta = document.querySelector('meta[name="theme-color"]')
  const barMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
  const color = mode === 'dark' ? '#0c0b0a' : '#f4efe6'

  root.style.backgroundColor = color
  document.body.style.backgroundColor = color
  themeMeta?.setAttribute('content', color)
  barMeta?.setAttribute('content', mode === 'dark' ? 'black-translucent' : 'default')
}
